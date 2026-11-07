# -*- coding: utf-8 -*-
"""File IPC around finite, official ScriptExecutor calls in the existing IDE.

Loaded by the product's --runscript bootstrap. The bootstrap returns; its
runtime owns only this worker. A separate executor owns all PLC business
state and drivers. Never pass bootstrap Python handlers into that executor.
This does not implement attachment from the IDE's disposable script menu.
"""

import json
import os
import re
import threading
import time
import traceback

PROTOCOL_VERSION = "inoproshop-route.v1"
DISPATCH_SOURCE = "_bounded_dispatch_request()"
_HOST = None


class DispatchCancelledBeforeStart(RuntimeError):
    """The queued callback was abandoned under its start lock, not running."""
    pass


def _safe_id(value):
    try:
        if value and len(value) <= 128 and re.match(r"\A[A-Za-z0-9_-]+\Z", value):
            return value
    except (TypeError, ValueError):
        pass
    return None


def _write_json(path, value):
    temporary = path + ".bounded.tmp"
    with open(temporary, "wb") as stream:
        # Match the dispatcher: vendor IronPython's ASCII encoder can decode
        # Unicode as bytes when Chinese source contains Latin-1 unit glyphs.
        stream.write(json.dumps(value, ensure_ascii=False).encode("utf-8"))
    if os.path.exists(path):
        os.remove(path)
    os.rename(temporary, path)


def _create_executor():
    # These are released interfaces from the currently loaded IDE. CODESYS
    # 4.x forwards ScriptEngine types; do not load a different vendor's DLL.
    import clr
    clr.AddReference("ScriptEngine")
    # IronPython exposes namespaces only for explicitly referenced assemblies.
    # The public ComponentManager moved to ComponentModel on ScriptEngine 4.x.
    for assembly_name in ("Core", "ComponentModel"):
        try:
            clr.AddReference(assembly_name)
        except Exception:
            pass
    from _3S.CoDeSys.Core.Components import ComponentManager
    from _3S.CoDeSys.ScriptEngine import IScriptEngine, IScriptExecutor2
    engine = ComponentManager.Singleton.GetSystemInstance[IScriptEngine]()
    executor = engine.CreateScriptExecutor()
    try:
        executor.AddScriptDirectoryToPath = True
        executor.LoadDrivers()
        scope = clr.GetClrType(IScriptExecutor2).GetProperty(
            "ScriptScope").GetValue(executor, None)
        return executor, scope
    except BaseException:
        executor.Dispose()
        raise


class BoundedBridgeHost(object):
    def __init__(self, source_path, system, primary_hop, sync_context,
                 executor_factory=None, environment=None):
        env = os.environ if environment is None else environment
        local = env.get("LOCALAPPDATA") or os.path.expanduser("~")
        work = os.path.join(local, "PLC Code", "codesys-bridge", "work")
        self.req_dir = env.get("CODESYS_BRIDGE_REQ_DIR", os.path.join(work, "req"))
        self.res_dir = env.get("CODESYS_BRIDGE_RES_DIR", os.path.join(work, "res"))
        self.ready_file = env.get("CODESYS_BRIDGE_READY_FILE",
                                  os.path.join(self.res_dir, "_ready.txt"))
        self.heartbeat_file = env.get("CODESYS_BRIDGE_HEARTBEAT_FILE",
                                      os.path.join(os.path.dirname(self.req_dir), "heartbeat.json"))
        self.profile = env.get("CODESYS_BRIDGE_PROFILE",
                               env.get("CODESYS_PROFILE", "InoProShop(V1.10.0.3)"))
        self.templates = env.get("CODESYS_BRIDGE_TEMPLATES_DIR",
                                 r"D:\hui chuan\CODESYS\Templates")
        self.mode = env.get("CODESYS_BRIDGE_MODE", "background")
        self.source_path = os.path.abspath(source_path)
        self.system = system
        self.primary_hop = bool(primary_hop)
        self.sync_context = sync_context
        self.executor_factory = executor_factory or _create_executor
        self.executor = None
        self.scope = None
        self.worker = None
        self.running = False
        self.executing = False
        self.generation = "%s-%s" % (os.getpid(), int(time.time() * 1000000))
        self.last_heartbeat = 0
        self.idle_state = "idle"
        self._execution_lock = threading.Lock()
        self._application_exiting = False
        self._exit_handler = None

    def _heartbeat(self, state, operation=None, request_id=None, captured=None):
        payload = dict(captured) if isinstance(captured, dict) else {}
        payload.update({
            "protocolVersion": PROTOCOL_VERSION, "mode": self.mode,
            "pid": os.getpid(), "time": time.time(), "state": state,
            "operation": operation, "profile": self.profile,
            "templatesDir": self.templates, "requestId": request_id,
            "scriptLifecycle": "bounded-per-request",
            "scriptActive": bool(self.executing),
            "bridgeGeneration": self.generation,
        })
        _write_json(self.heartbeat_file, payload)
        self.last_heartbeat = time.time()

    def _remove_ready(self):
        if os.path.isfile(self.ready_file):
            os.remove(self.ready_file)

    def _marshal(self, action):
        # Never run native code inline after a failed marshal. Doing so can
        # execute a mutation twice if the original delegate was already run.
        if not self.primary_hop and self.sync_context is None:
            raise RuntimeError("no supported IDE primary-thread dispatcher")
        completed = threading.Event()
        state = {"started": False, "abandoned": False, "error": None, "value": None}
        state_lock = threading.Lock()

        def invoke():
            with state_lock:
                if state["abandoned"] or self._application_exiting:
                    state["error"] = RuntimeError("IDE is closing; queued script was not started")
                    completed.set()
                    return
                state["started"] = True
            try:
                state["value"] = action()
            except BaseException as exc:
                state["error"] = exc
            finally:
                completed.set()

        posting_error = None
        try:
            if self.primary_hop:
                self.system.execute_on_primary_thread(invoke, True)
            else:
                import System.Threading as ST
                self.sync_context.Post(ST.SendOrPostCallback(lambda ignored: invoke()), None)
        except BaseException as exc:
            with state_lock:
                if not state["started"]:
                    # A posting primitive may retain its delegate and still
                    # throw. Suppress that late delegate before publishing a
                    # failure, using the same lock as the callback start.
                    state["abandoned"] = True
                    raise DispatchCancelledBeforeStart(
                        "IDE primary-thread posting failed before callback start: " + repr(exc))
                # The callback already owns native execution. Wait for its
                # finally before declaring the host idle; do not cancel it or
                # run an inline fallback. The caller can retain its result.
                posting_error = exc
        deadline = time.time() + 30.0
        while not completed.is_set():
            completed.wait(0.05)
            # A callback that never started must not execute later after we
            # have reported dispatch failure. An in-flight native call must
            # return through its own finally; never abort its thread or IDE.
            with state_lock:
                if not state["started"] and self._application_exiting:
                    state["abandoned"] = True
                    raise DispatchCancelledBeforeStart(
                        "IDE is closing; queued script was not started")
                if not state["started"] and time.time() >= deadline:
                    state["abandoned"] = True
                    raise DispatchCancelledBeforeStart(
                        "IDE primary-thread callback did not start within 30s")
        if state["error"] is not None:
            raise state["error"]
        if posting_error is not None:
            raise posting_error
        return state["value"]

    def _initialize(self):
        def initialize():
            self.executor, self.scope = self.executor_factory()
            self.scope.SetVariable("_BOUNDED_EXECUTOR_SCOPE", True)
            self.executor.ExecuteFile(self.source_path)
            self._subscribe_application_exit()
        self._marshal(initialize)
        if self._application_exiting:
            return
        # ExecuteFile, including the vendor's Executed/Finish, has returned.
        # Readiness never means that a permanently running script is idle.
        self._heartbeat("idle")
        _write_json(os.path.join(os.path.dirname(self.heartbeat_file),
                                "bridge-frameloop.json"), {
            "inFrameLoop": False, "scriptLifecycle": "bounded-per-request",
            "bridgePid": os.getpid(), "bridgeGeneration": self.generation,
            "bootstrapExecutionReturned": True,
        })
        with open(self.ready_file, "wb") as stream:
            stream.write((PROTOCOL_VERSION + "\n").encode("ascii"))

    def _execute(self, request):
        self.executing = True
        try:
            def dispatch():
                self.scope.SetVariable("_BOUNDED_REQUEST_JSON",
                                       json.dumps(request, ensure_ascii=False))
                self.scope.SetVariable("_BOUNDED_RESULT_JSON", "")
                self.scope.SetVariable("_BOUNDED_RESULT_ACTION", "")
                self.scope.SetVariable("_BOUNDED_HEARTBEAT_JSON", "")
                self.executor.ExecuteSource(DISPATCH_SOURCE, self.source_path)
                return (self.scope.GetVariable("_BOUNDED_RESULT_JSON"),
                        self.scope.GetVariable("_BOUNDED_RESULT_ACTION"),
                        self.scope.GetVariable("_BOUNDED_HEARTBEAT_JSON"))
            return self._marshal(dispatch)
        finally:
            self.executing = False

    def _error(self, request, exc, code="bounded_execution_failed"):
        data = {"requestSubmitted": True, "retrySafe": False}
        if code == "bounded_execution_failed" and isinstance(exc, DispatchCancelledBeforeStart):
            # This fact applies only to a business dispatch that never began.
            # A later failure to dispatch executor.Dispose during shutdown
            # must not label the already executed business request unstarted.
            code = "bounded_dispatch_cancelled_before_start"
            data.update({"dispatchStatus": "cancelled_before_start",
                         "requestStarted": False, "operationTerminal": True,
                         "lateExecutionSuppressed": True})
        return {
            "protocolVersion": PROTOCOL_VERSION, "requestId": request.get("id"),
            "ok": False, "status": "error", "op": request.get("op", request.get("cmd", "?")),
            "stage": "script_execution", "error": repr(exc), "errorCode": code,
            "data": data, "issues": [],
        }

    def process_request(self, request):
        """Execute once and publish only after the official call has returned."""
        if not self._execution_lock.acquire(False):
            raise RuntimeError("bounded executor already has an in-flight request")
        try:
            return self._process_request_owned(request)
        finally:
            self._execution_lock.release()

    def _process_request_owned(self, request):
        rid = _safe_id(request.get("id"))
        if rid is None:
            raise ValueError("unsafe request id")
        operation = request.get("op", request.get("cmd", "?"))
        self.executing = True
        self._heartbeat("busy", operation, rid)
        captured = None
        action = ""
        try:
            result_json, action, heartbeat_json = self._execute(request)
            result = json.loads(result_json)
            if not isinstance(result, dict) or result.get("requestId") != rid:
                raise ValueError("bounded dispatcher returned a mismatched response")
            if heartbeat_json:
                captured = json.loads(heartbeat_json)
                if not isinstance(captured, dict):
                    captured = None
        except BaseException as exc:
            # Preserve any completed business result if the wrapper or vendor
            # finalization failed. Unknown mutation state is never replayable.
            result = self._error(request, exc)
            try:
                prior = self.scope.GetVariable("_BOUNDED_RESULT_JSON")
                if prior:
                    prior_result = json.loads(prior)
                    if isinstance(prior_result, dict) and prior_result.get("requestId") == rid:
                        result["data"]["operationResult"] = prior_result
            except BaseException:
                pass
            action = ""
        self.executing = False
        if self._application_exiting:
            self._heartbeat("stopped")
        elif action == "EXIT":
            try:
                self.close()
            except BaseException as exc:
                failure = self._error(request, exc, "bounded_shutdown_failed")
                failure["data"]["operationResult"] = result
                result = failure
                self.running = False
                self._remove_ready()
                self._heartbeat("failed")
        else:
            self.idle_state = "paused" if (captured or {}).get("state") == "paused" else "idle"
            self._heartbeat(self.idle_state, captured=captured)
        _write_json(os.path.join(self.res_dir, rid + ".json"), result)
        return action

    def close(self):
        if self.executing:
            raise RuntimeError("cannot dispose a running script executor")
        executor = self.executor
        if executor is not None:
            self._marshal(executor.Dispose)
            self.executor = None
            self.scope = None
        self.running = False
        self._unsubscribe_application_exit()
        self._remove_ready()
        self._heartbeat("stopped")

    def _subscribe_application_exit(self):
        import clr
        clr.AddReference("System.Windows.Forms")
        import System
        import System.Windows.Forms as Forms
        self._exit_handler = System.EventHandler(self._on_application_exit)
        Forms.Application.ApplicationExit += self._exit_handler

    def _unsubscribe_application_exit(self):
        if self._exit_handler is not None:
            import System.Windows.Forms as Forms
            Forms.Application.ApplicationExit -= self._exit_handler
            self._exit_handler = None

    def _on_application_exit(self, sender, args):
        # Called on the IDE UI thread. Do not join the worker or marshal back
        # to a message loop that is closing: either would delay normal Exit.
        self._application_exiting = True
        self.running = False
        try:
            self._unsubscribe_application_exit()
            if not self.executing and self.executor is not None:
                self.executor.Dispose()
                self.executor = None
                self.scope = None
            self._remove_ready()
            self._heartbeat("stopped")
        except BaseException:
            # A cleanup error must not cancel the user's native IDE close.
            pass

    def _poll_once(self):
        for filename in sorted(os.listdir(self.req_dir)):
            if self._application_exiting:
                return False
            if not filename.endswith(".json"):
                continue
            path = os.path.join(self.req_dir, filename)
            rid = _safe_id(filename[:-5])
            try:
                with open(path, "rb") as stream:
                    request = json.loads(stream.read().decode("utf-8-sig"))
                if not isinstance(request, dict) or rid is None or request.get("id") != rid:
                    raise ValueError("unsafe or mismatched request id")
            except Exception as exc:
                if rid is not None:
                    _write_json(os.path.join(self.res_dir, rid + ".json"),
                                self._error({"id": rid}, exc, "invalid_request"))
                os.remove(path)
                continue
            # Sole queue consumer. Removal is ownership of this request; the
            # former sim/non-sim dual consumers are deliberately absent.
            try:
                os.remove(path)
            except OSError:
                continue
            if self.process_request(request) == "EXIT":
                return False
        return True

    def _run(self):
        try:
            self._initialize()
            while self.running and self._poll_once():
                if time.time() - self.last_heartbeat >= 2.0:
                    self._heartbeat(self.idle_state)
                time.sleep(0.1)
        except BaseException:
            if self._application_exiting:
                return
            failure = traceback.format_exc()
            self.running = False
            if self.executor is not None and not self.executing:
                try:
                    self.close()
                except BaseException:
                    failure += "\nExecutor disposal failed:\n" + traceback.format_exc()
            self._remove_ready()
            self._heartbeat("failed")
            with open(os.path.join(os.path.dirname(self.heartbeat_file),
                                   "bridge-failure.log"), "ab") as stream:
                stream.write((failure + "\n").encode("utf-8", "replace"))

    def start(self):
        if not self.primary_hop and self.sync_context is None:
            raise RuntimeError("bridge cannot start without a supported IDE primary-thread dispatcher")
        for directory in (self.req_dir, self.res_dir, os.path.dirname(self.heartbeat_file)):
            if not os.path.isdir(directory):
                os.makedirs(directory)
        self.running = True
        self.worker = threading.Thread(target=self._run, name="CodesysBoundedBridge")
        self.worker.daemon = True
        self.worker.start()


def start(source_path, system, primary_hop, sync_context):
    global _HOST
    if _HOST is not None and _HOST.running:
        return _HOST
    _HOST = BoundedBridgeHost(source_path, system, primary_hop, sync_context)
    _HOST.start()
    return _HOST
