# -*- coding: utf-8 -*-
"""Finite script execution through the IDE's own script/execute command.

The --runscript bootstrap retains only Python helpers and file IPC. Every
business call gets a fresh official script frame and that frame's drivers.
No restricted ScriptEngine assembly or second-executor API is imported.
"""
import os
import traceback
from bounded_bridge_host import BoundedBridgeHost

HOST_KEY = 'PLC Engineering Suite.CommandBridgeHost.v1'
_HOST = None


class DictionaryScope(object):
    def __init__(self, values):
        self.values = values

    def SetVariable(self, key, value):
        self.values[key] = value

    def GetVariable(self, key):
        return self.values.get(key)


class CommandExecutor(object):
    def __init__(self, values, command, domain):
        self.values = values
        self.command = command
        self.domain = domain
        self.entry = os.path.join(os.path.dirname(__file__), 'command_bridge_dispatch.py')
        self.action = None
        self.completed = False
        self.error = None
        self.closed = False
        if domain.GetData(HOST_KEY) is not None:
            raise RuntimeError('another PLC Engineering Suite command bridge already owns this IDE')
        domain.SetData(HOST_KEY, self)

    def ExecuteFile(self, source):
        self._execute('initialize')

    def ExecuteSource(self, source, path):
        if source != '_bounded_dispatch_request()':
            raise ValueError('unsupported command bridge dispatch')
        self._execute('request')

    def _execute(self, action):
        if self.closed or self.action is not None:
            raise RuntimeError('command bridge is closed or already executing')
        self.action = action
        self.completed = False
        self.error = None
        try:
            self.command.execute(self.entry)
            if not self.completed:
                raise RuntimeError('IDE script command returned without completing the frame')
            if self.error:
                raise RuntimeError(self.error)
        finally:
            self.action = None

    def frame_entry(self, active_engine):
        if self.action not in ('initialize', 'request') or self.closed:
            raise RuntimeError('no owned command bridge request')
        try:
            # Business helpers are compiled once, but driver objects are tied to
            # the current executor. In particular online from the bootstrap has
            # an empty execution stack after bootstrap return and must NOT leak
            # into this new script frame.
            for key in dir(active_engine):
                if not key.startswith('_'):
                    self.values[key] = getattr(active_engine, key)
            self.values['_ACTIVE_SCRIPTENGINE'] = active_engine
            self.values['project'] = None
            self.values['native_core_project'] = None
            self.values['pou_cache'].clear()
            self.values['_discover_primary_project']()
            if self.action == 'initialize':
                self.values['_bounded_initialize_scope']()
            else:
                self.values['configure_prompt_handling']()
                self.values['_bounded_dispatch_request']()
        except BaseException:
            self.error = traceback.format_exc()
        finally:
            self.values['_ACTIVE_SCRIPTENGINE'] = None
            self.completed = True

    def Dispose(self):
        if self.action is not None:
            raise RuntimeError('cannot dispose an executing command bridge')
        self.closed = True
        if self.domain.GetData(HOST_KEY) is self:
            self.domain.SetData(HOST_KEY, None)


class CommandBridgeHost(BoundedBridgeHost):
    def _heartbeat(self, state, operation=None, request_id=None, captured=None):
        facts = dict(captured) if isinstance(captured, dict) else {}
        facts['scriptBackend'] = 'ide-script-command'
        return BoundedBridgeHost._heartbeat(self, state, operation, request_id, facts)


def start(source_path, system, primary_hop, sync_context, values):
    global _HOST
    if _HOST is not None and _HOST.running:
        return _HOST
    from System import AppDomain
    command = system.commands['script', 'execute']
    def factory():
        return CommandExecutor(values, command, AppDomain.CurrentDomain), DictionaryScope(values)
    _HOST = CommandBridgeHost(source_path, system, primary_hop, sync_context,
                             executor_factory=factory)
    _HOST.start()
    return _HOST
