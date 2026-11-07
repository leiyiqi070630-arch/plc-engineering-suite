# -*- coding: utf-8 -*-
"""Small, validated PLCopen LD generators.

The generator intentionally emits PLCopen XML rather than guessing the
vendor's private native graph format.  InoProShop imports this format and
creates the native graph itself, which is the route covered by runtime
evidence.
"""
import hashlib
import os
import re
import xml.etree.ElementTree as ET


IDENT = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
IEC_RESERVED_IDENTIFIERS = {
    "ACTION", "AND", "ARRAY", "AT", "BOOL", "BY", "BYTE", "CASE",
    "CONFIGURATION", "CONSTANT", "CONTINUE", "DATE", "DATE_AND_TIME",
    "DINT", "DIV", "DO", "DT", "DWORD", "ELSE", "ELSIF",
    "END_ACTION", "END_CASE", "END_CONFIGURATION", "END_FOR",
    "END_FUNCTION", "END_FUNCTION_BLOCK", "END_IF", "END_PROGRAM",
    "END_REPEAT", "END_RESOURCE", "END_STEP", "END_STRUCT",
    "END_TRANSITION", "END_TYPE", "END_VAR", "END_WHILE", "EXIT",
    "FALSE", "F_EDGE", "FOR", "FROM", "FUNCTION", "FUNCTION_BLOCK",
    "IF", "INITIAL_STEP", "INT", "LINT", "LREAL", "LTIME", "LWORD",
    "MOD", "NON_RETAIN", "NOT", "NULL", "OF", "ON", "OR", "PROGRAM",
    "R_EDGE", "READ_ONLY", "READ_WRITE", "REAL", "REPEAT", "RESOURCE",
    "RETAIN", "RETURN", "SINT", "STEP", "STRING", "STRUCT", "TASK",
    "THEN", "TIME", "TIME_OF_DAY", "TO", "TOD", "TRANSITION", "TRUE",
    "TYPE", "UDINT", "UINT", "ULINT", "UNTIL", "USINT", "VAR",
    "VAR_ACCESS", "VAR_CONFIG", "VAR_EXTERNAL", "VAR_GLOBAL",
    "VAR_IN_OUT", "VAR_INPUT", "VAR_OUTPUT", "VAR_TEMP", "WHILE",
    "WITH", "WORD", "WSTRING", "XOR",
    # CODESYS V3 keyword extensions (2026-09-07 review: these were missing,
    # so an uppercase spelling passed plan validation and only failed at
    # compile time). The vendor lexer treats keywords case-sensitively for
    # identifiers (xOr compiles 0/0) — matching is exact against this set.
    "POINTER", "REFERENCE", "SUPER", "THIS", "TYPEOF", "METHOD",
    "PROPERTY", "INTERFACE", "IMPLEMENTS", "EXTENDS", "AND_THEN",
    "OR_ELSE", "__NEW", "__DELETE", "__QUERYINTERFACE", "__QUERYPOINTER",
    "ABSTRACT", "FINAL", "NON_RETAIN", "PERSISTENT", "RETAIN",
}
# This is the deliberately bounded type set for generated probe values.  A
# live signature may expose a derived/vendor type, but the generator cannot
# invent a valid literal for it.  Such a port is rejected before any POU is
# created, exactly like PLC Engineering Suite rejects an unimplemented pattern.
SCALAR_TYPES = {
    "BOOL", "BYTE", "WORD", "DWORD", "LWORD", "SINT", "USINT",
    "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT", "REAL", "LREAL",
    "TIME", "LTIME", "DATE", "TOD", "DT", "DATE_AND_TIME", "STRING", "WSTRING",
}
TYPE = re.compile(r"^(BOOL|BYTE|WORD|DWORD|LWORD|SINT|INT|DINT|LINT|USINT|UINT|UDINT|ULINT|REAL|LREAL)$", re.I)
_BOUNDED_STRING_TYPE = re.compile(
    r"^(W?STRING)\((?:[1-9][0-9]*|"
    r"[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)\)$",
    re.I,
)
_SYMBOLIC_STRING_TYPE = re.compile(
    r"^(W?STRING)\("
    r"[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*\)$",
    re.I,
)

# These installed-runtime types have a declaration strategy but no safe
# literal strategy.  A caller must bind every input/InOut of one of these
# types to an IEC identifier; the compose route then declares that identifier
# with the exact type read from the live signature.
SUPPORTED_DERIVED_TYPES = {
    "RTS_IEC_RESULT", "CAA.TICK",
    "SMC_ERROR", "SMC_LANGUAGE_TYPE",
    "AXIS_REF_SM3", "MC_DIRECTION", "MC_BUFFER_MODE",
    "MC_STARTMODE", "MC_CAM_ID", "SMC_TAPPETDATA", "TRIGGER_REF",
    "AXIS_GROUP_REF_SM3", "SMC_MOVEMENT_ID",
    "SMC_POS_REF", "SMC_COORD_SYSTEM", "MC_TRANSITION_MODE",
    "ARRAY [0..(SMC_RCNST.MAX_TRANS_PARAMS - 1)] OF LREAL",
    "SMC_ORIENTATION_MODE", "SMC_CIRC_MODE", "MC_CIRC_PATHCHOICE",
    "MC_CAM_REF", "MC_TAPPETMODE", "MC_CAMSWITCH_REF",
    "MC_OUTPUT_REF", "MC_TRACK_REF",
    "MC_TA_REF", "MC_TP_REF", "MC_TV_REF",
    "ARRAY [1..MAX_NUM_TAPPETS] OF BOOL", "SMC_MOVEMENTTYPE",
    "UTIL_ERROR",
    "__XWORD", "__UXINT",
    "TCP_STATE", "SYS_HC_ERROR", "MODBUS_SLAVE_DIAGNOSE",
    "RTS_IEC_HANDLE", "REFERENCE TO STRING", "REFERENCE TO STRING(255)",
    "ACCESS_MODE",
    "SYS_FILE_STATUS", "SYSTIME", "SYSTIMEDATE", "TIMEZONEINFORMATION",
    "SYS_HC_CONVERT_ERROR", "ARRAY [0..3] OF BYTE",
    "SYS_HC_RTC_STATUS", "TIMEZONE_INFO",
    "__XINT", "PERSISTENT_SUB", "PERSIST_INFO", "PERSISTENT_ERROR",
    "ARRAY [0..17] OF INT", "ARRAY [0..15] OF MODULE_ACTUAL_INFO",
    "REFERENCE TO SOCKET_FD_SET",
    "ARRAY [0..4] OF APPDOWN_INFO", "ARRAY [0..31] OF GL20_MODULE_INFO",
    "SYS_HC_BAUDRATE", "SYS_HC_DATA_BIT", "SYS_HC_PARITY_BIT",
    "SYS_HC_STOP_BIT",
    "CHARBUFFERPTR", "REFERENCE TO WSTRING", "REFERENCE TO INADDR",
    "SYS_HC_CHMOD_MODE", "SYS_HC_CHMOD_ERROR", "PT_SIZE", "VERSION",
    "CAA.HANDLE", "CAA.SIZE", "CAA.PVOID", "ERROR", "IP_ADDR",
    "HS_AXIS_REF", "COUNTER_REF", "DURATION", "FLOAT",
    "COUNT", "SIZE", "TICK", "SIGNED", "UNSIGNED", "ADDR_TYPE",
    "AINFO_TYPE", "DP_DIAG", "ERROR_INFO", "IDEVICE", "INODE",
    "IBUS", "IDEVICE2", "ISTACK", "IBASE",
    "UI64", "ARRAY [0..99] OF DINT", "SMC_LOGGERMODE",
    "SMC_COMMUNICATIONSTATE",
    "SMC_VECTOR3D", "SMC_FRAME", "SMC_MATRIX3",
    "SMC_AXIS_GROUP_CONTINUE_DATA", "TRAFO.CONFIGDATA",
    "IDENT_IN_GROUP_REF_SM3", "MC_COORD_REF", "TRAFO.MC_KIN_REF_SM3",
    "SMC_QUAT", "SMC_HOMING_MODE", "SMC3_BRAKESETSTATE",
    "SMC_BACKLASH_MODE", "SMC_BACKLASH_STARTSTATE",
    "SMC_CONTROLLER_MODE", "AXIS_REF_VIRTUAL_SM3", "SMC_RAMPTYPE",
    "INT (1..10)", "GEN_MODE", "SMC_INT_STATUS", "SMC_INT_VELMODE",
    "SMC_POSINFO",
    "TRAFO.AXISPOS_REF", "IAXISREF", "MC_EXECUTION_MODE",
    "SMC_DYN_LIMITS",
    "ARRAY [0..(SMC_RCNST.MAX_AXES - 1)] OF LREAL",
    "SMC_AL_STATUS", "SMC_BLOCKSEARCHPOS", "SMC_DIRECTION",
    "SMC_INTERPOLATOR", "SMC_ITEXTSTREAM", "SMC_M_PARAMETERS",
    "SMC_OBJECTSPLITTERMODE", "SMC_VECTORDIR",
    "PFSYS_TASK_FUNCTION", "PFSYS_TASK_EXCEPTIONHANDLER",
    "ARRAY [0..3] OF LREAL", "REGCONTEXT", "SM0.IOUTSTREAM",
    "SMC_DYNV3STATE", "SMC_LINE3D", "SMC_PLANE", "SMC_POLYNOMIAL",
    "SMC_TRAFOCONFIG_4AXISPALLETIZER",
    "SMC_TRAFORESULT_4AXISPALLETIZER", "SMC_V3POLY",
    "ARRAY [0..1] OF SMC_VECTOR3D", "ARRAY [0..5] OF LREAL",
    "ARRAY [0..C_UILINES] OF STRING",
    "SMC_ARTICULATEDROBOT_6DOF_J0_STATE",
    "SMC_ARTICULATEDROBOT_6DOF_J1_STATE",
    "SMC_ARTICULATEDROBOT_6DOF_J4_STATE", "SMC_CNC_REF",
    "SMC_DEC_STATUS", "SMC_GCODE_TEXT", "SMC_GEOINFO",
    "SMC_INTERPOLATOR2DIR", "SMC_SEGMENT", "SMC_SMOOTHBSPLINE_MODE",
    "SMC_SMOOTHPATHADDAXMODE", "SMC_SMOOTHPATHMODE", "SMC_TC_STATUS",
    "SMC_TOKENQUEUE", "SMC_TOKENTYPE", "SMC_TOOLCORRMODE",
    "SMC_TRAFOCONFIG_ARTICULATEDROBOT_6DOF",
    "SMC_TRAFORESULT_ARTICULATEDROBOT_6DOF",
    "ARRAY [0..(SMC_RCNST.MAX_AXES - 1)] OF SMC_DYN_LIMITS",
    "AXIS_REF_LOGICAL_SM3", "AXISPOS_REF", "CONFIGDATA",
    "ISMCOUPLEDKINEMATICS", "ISMPOSITIONKINEMATICS",
    "ISMTOOLKINEMATICS", "KIN_6DOF_J0_STATE", "KIN_6DOF_J2_STATE",
    "KIN_6DOF_J4_STATE", "MC_KIN_REF_SM3", "SMC3_PERSISTPOSITIONDIAG",
    "SMC3_PERSISTPOSITIONLOGICAL_DATA",
    "SMC3_PERSISTPOSITIONSINGLETURN_DATA", "SMC_ALL_AXIS_LIMITS",
    "SMC_IDYNAMICCS", "SMC_Q_BOUNDARIES", "SMC_Q_LIMITS",
    "SMC_SCHEDULE_TASKMODEL", "SMC_TG_INTERPOLATEABLEPROFILE",
    "SMC_TG_IRAMP", "SMC_TG_IRAMPTYPE", "SMC_TG_RAMP_QUADRATIC",
    "IOUTSTREAM", "KIN_WRIST2_B_STATE", "KIN_WRIST3_HAND_STATE",
}
SUPPORTED_POINTER_TYPES = {
    "POINTER TO BYTE", "POINTER TO WORD", "POINTER TO REAL",
    "POINTER TO RTS_IEC_RESULT", "POINTER TO __XWORD",
    "POINTER TO DIRINFO", "POINTER TO UDINT", "POINTER TO DWORD",
    "POINTER TO DINT", "POINTER TO POINTER TO STRING(255)",
    "POINTER TO STRING", "POINTER TO SYS_FILETIME", "POINTER TO WSTRING",
    "POINTER TO LOGOPTIONS",
    "POINTER TO SOCKADDRESS", "POINTER TO RTS_IEC_HANDLE",
    "POINTER TO SOCK_HOSTENT", "POINTER TO INADDR", "POINTER TO UDP_REPLY",
    "POINTER TO SOCKET_FD_SET", "POINTER TO SOCKET_TIMEVAL",
    "POINTER TO SOCK_ADAPTER_INFORMATION", "POINTER TO __UXINT",
    "POINTER TO STRING(255)", "POINTER TO WSTRING(255)",
    "POINTER TO SYSSOCKET.SOCKET_FD_SET", "POINTER TO EVENTPARAM2",
    "POINTER TO UDP_REPLY2",
    "POINTER TO LINT", "POINTER TO LREAL", "POINTER TO LTIME",
    "POINTER TO LWORD", "POINTER TO ULINT", "POINTER TO ERROR",
    "POINTER TO EVENTPARAM", "POINTER TO APPLICATION",
    "POINTER TO IOCONFIGCHANNELMAP", "POINTER TO IOCONFIGCONNECTOR",
    "POINTER TO IOCONFIGTASKMAP", "POINTER TO IOCONFIGPARAMETER",
    "POINTER TO POINTER TO IOCONFIGCONNECTOR",
    "POINTER TO POINTER TO DWORD", "POINTER TO POINTER TO BYTE",
    "POINTER TO RTS_IEC_CWCHAR", "POINTER TO AXIS_REF_SM3",
    "POINTER TO APPLICATION_INFO", "POINTER TO PROJECT_INFO",
    "POINTER TO TASK_INFO2", "POINTER TO POINTER TO SYS_TASK_INFO",
    "POINTER TO REGCONTEXT", "POINTER TO APP_MEMORY_SEGMENT",
    "POINTER TO SMC_GEOINFO", "POINTER TO SMC_OUTQUEUE",
    "POINTER TO SMC_VECTOR3D",
    "POINTER TO ARRAY [0..0] OF SMC_GEOINFO",
    "POINTER TO SMC_POSINFO",
    "POINTER TO SMC_CNC_REF", "POINTER TO SMC_GCODE_WORD",
    "POINTER TO SYS_TASK_PARAM",
    "POINTER TO ARRAY [0..0] OF SMC_TOKEN",
    "POINTER TO ARRAY [0..2] OF LREAL", "POINTER TO SMC_GCODEVIEWER_DATA",
    "POINTER TO SMC_QUAT", "POINTER TO SMC_STRINGBUFFER",
    "POINTER TO SMC_VARLIST",
    "POINTER TO POINTER TO AXIS_GROUP_REF_SM3",
    "POINTER TO SMC_AXIS_GROUP_PATH_ELEMENT", "POINTER TO SMC_DCA_PHASE",
    "POINTER TO SMC_MOVEMENT",
}

# These names can appear in the installed runtime catalog even when their
# defining project library/type is unavailable. Keep them in the compatibility
# table for readback tests, but fail closed for native generation until the
# project can resolve the exact type. Otherwise the vendor precompiler emits
# the recurring undefined-identifier diagnostics after import.
UNRESOLVED_VENDOR_TYPES = frozenset((
    "RTS_IEC_RESULT", "RTS_IEC_HANDLE", "SOCKADDRESS", "PT_SIZE",
))

# Runtime signature discovery exposes this callable on the installed SM3
# Shared catalog, but the active AM600 target does not bind it.  Native LAD
# creation produces a delayed parser error (C46/C62) even though the first
# build response can be empty.  Keep it out of generation until a target
# binding is available; the host-side post-return gate remains the final
# defense for any similar callable discovered later.
UNSUPPORTED_TARGET_CALLABLES = frozenset((
    "SM0.CHARTOLOWER",
    "SM0.CHARTOUPPER",
    "SM0.FMOD",
    "SM0.HEXCHAR",
))


def types_compatible(left, right):
    """Compare exact IEC type spellings case-insensitively."""
    return (str(left or "").strip().upper() ==
            str(right or "").strip().upper())


def select_catalog_signature(entries, name, namespace=None, object_guid=None):
    """Resolve one callable catalog entry without guessing across collisions."""
    wanted_name = str(name or "").strip()
    wanted_namespace = str(namespace or "").strip()
    wanted_guid = str(object_guid or "").strip()
    candidates = []
    identities = set()
    for entry in entries or []:
        if not isinstance(entry, dict):
            continue
        if str(entry.get("pouType") or entry.get("callType") or "") not in (
                "Function", "FunctionBlock"):
            continue
        if str(entry.get("name") or "").strip().lower() != wanted_name.lower():
            continue
        context = entry.get("context")
        if not isinstance(context, dict):
            context = {}
        identity = (
            str(entry.get("objectGuid") or "").strip().lower(),
            str(context.get("namespace") or "").strip().lower(),
        )
        if identity in identities:
            continue
        identities.add(identity)
        candidates.append(entry)

    original = list(candidates)
    if wanted_namespace:
        candidates = [entry for entry in candidates
                      if str((entry.get("context") or {}).get("namespace") or "").strip().lower()
                      == wanted_namespace.lower()]
    if wanted_guid:
        candidates = [entry for entry in candidates
                      if str(entry.get("objectGuid") or "").strip().lower()
                      == wanted_guid.lower()]

    def identity(entry):
        context = entry.get("context") if isinstance(entry.get("context"), dict) else {}
        return {
            "namespace": str(context.get("namespace") or ""),
            "objectGuid": str(entry.get("objectGuid") or ""),
            "pouType": str(entry.get("pouType") or entry.get("callType") or ""),
            "guiHidden": bool(entry.get("guiHidden")),
        }

    if not candidates:
        # A stale catalog snapshot can carry an outdated namespace while the
        # live resolver knows the same single signature under its current
        # library namespace. When the name resolves to exactly one signature
        # identity, adopt the live namespace instead of failing the plan.
        # 2026-09-07 review hardening: an EMPTY objectGuid is not a real
        # identity — two distinct entries that both lack a guid used to
        # collapse to unique_guids == {""} and adopt original[0] blindly.
        # Require at least one real guid, and prefer a visible entry when
        # several share the same guid.
        unique_guids = {str(entry.get("objectGuid") or "").strip().lower()
                        for entry in original}
        if (original and wanted_guid not in unique_guids
                and len(unique_guids) == 1 and "" not in unique_guids):
            visible = [entry for entry in original if not bool(entry.get("guiHidden"))]
            adopted = visible[0] if visible else original[0]
            return {"ok": True, "signature": adopted,
                    "selected": identity(adopted),
                    "namespaceAdopted": True,
                    "requestedNamespace": wanted_namespace or None}
        return {
            "ok": False,
            "code": ("SIGNATURE_SELECTOR_NOT_FOUND"
                     if wanted_namespace or wanted_guid
                     else "INSTRUCTION_NOT_FOUND"),
            "message": "no callable runtime signature matches the requested identity",
            "expected": {"name": wanted_name,
                         "namespace": wanted_namespace or None,
                         "objectGuid": wanted_guid or None},
            "candidates": [identity(entry) for entry in original],
        }
    if not wanted_namespace and not wanted_guid and len(candidates) > 1:
        visible = [entry for entry in candidates if not bool(entry.get("guiHidden"))]
        if visible:
            candidates = visible
    if len(candidates) != 1:
        return {
            "ok": False,
            "code": "AMBIGUOUS_INSTRUCTION_SIGNATURE",
            "message": "multiple callable runtime signatures match this instruction",
            "expected": "add namespace or objectGuid from the reported candidates",
            "candidates": [identity(entry) for entry in candidates],
        }
    return {"ok": True, "signature": candidates[0],
            "selected": identity(candidates[0])}


# Built-in IEC/library aliases are resolved without a namespace.  A live
# FunctionBlock signature from a vendor library must retain its precompile
# namespace in declarations and native operand metadata (for example
# ``UTIL.PID`` rather than the compiler-invalid bare ``PID``).
_BUILTIN_CALL_NAMESPACES = frozenset(("", "STANDARD", "IEC", "IEC61131-3", "CORE"))


def callable_type_name(signature_or_name, namespace=None):
    """Return the compiler-resolvable type name for a callable signature.

    Accepts either a live signature dictionary or a plain callable name.  An
    already-qualified name is preserved; malformed namespaces are ignored so
    this helper never emits an unsafe type token.
    """
    if isinstance(signature_or_name, dict):
        name = str(signature_or_name.get("name") or "").strip()
        context = signature_or_name.get("context")
        if namespace is None and isinstance(context, dict):
            namespace = context.get("namespace")
    else:
        name = str(signature_or_name or "").strip()
    ns = str(namespace or "").strip()
    if not name or "." in name or ns.upper() in _BUILTIN_CALL_NAMESPACES:
        return name
    if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*$", ns):
        return name
    return ns + "." + name


def _supported_scalar_type(type_name):
    upper = str(type_name or "").strip().upper()
    if upper in SCALAR_TYPES:
        return True
    if _BOUNDED_STRING_TYPE.match(upper):
        return True
    return upper in SUPPORTED_DERIVED_TYPES or upper in SUPPORTED_POINTER_TYPES


def _requires_symbol_value(type_name):
    upper = str(type_name or "").strip().upper()
    return upper in SUPPORTED_DERIVED_TYPES or upper in SUPPORTED_POINTER_TYPES


def generated_output_target(network_index, item_index, port_name):
    """Return a stable unique lvalue for an omitted callable output binding."""
    token = re.sub(r"[^A-Za-z0-9_]", "_", str(port_name or "")).strip("_")
    if not token:
        token = "OUT"
    return "N%d_I%d_%s" % (int(network_index) + 1,
                            int(item_index) + 1, token)


def _is_iec_identifier(value):
    value = str(value or "").strip()
    # Reserved-word guard is EXACT (case-sensitive) against the uppercase IEC
    # keyword set — verified against the real InoProShop compiler
    # (2026-09-07, operator-unblock sweep): a GVL declaring `xOr` compiles
    # 0/0, so the vendor lexer does NOT treat `xOr` as the XOR keyword. The
    # old case-insensitive check (`value.upper() in reserved`) falsely
    # rejected such identifiers and broke the whole plan on one symbol name.
    return bool(IDENT.match(value)) and value not in IEC_RESERVED_IDENTIFIERS


def _is_iec_qualified_identifier(value):
    """Return whether *value* is a conservative qualified IEC symbol.

    Native LAD operands can refer to symbols owned by another object (for
    example ``GVL.Speed`` or ``Application.GVL.Speed``).  The old validator
    only accepted a bare identifier, which made those perfectly valid
    project references fail before the vendor runtime ever saw the graph.
    Keep the grammar deliberately narrow: a qualified symbol is one or more
    non-reserved IEC identifiers separated by dots.  Array/index expressions,
    calls and operators remain rejected and must be represented by a local
    variable or a typed literal.
    """
    value = str(value or "").strip()
    parts = value.split(".")
    return (len(parts) >= 2 and
            all(_is_iec_identifier(part) for part in parts))


def _is_iec_symbol_expression(value, allow_qualified=True):
    """Return whether *value* is a bare or (optionally) qualified symbol."""
    value = str(value or "").strip()
    return (_is_iec_identifier(value) or
            (bool(allow_qualified) and _is_iec_qualified_identifier(value)))


def _canonical_local_operand(value):
    """Collapse unsafe local symbol spelling before it reaches native LAD.

    The old batch emitted names such as ``o_NAME__N001``.  That spelling was
    part of the C0006/C0009/C00189/C0031 parser cascade in the malformed
    declaration samples.  Keep qualified project symbols and literals intact;
    normalize only a bare local IEC identifier.
    """
    text = str(value or "").strip()
    if not _is_iec_identifier(text):
        return value
    collapsed = re.sub(r"_+", "_", text)
    return collapsed if _is_iec_identifier(collapsed) else value


def _validate_identifier(value, field):
    value = str(value or "").strip()
    if not _is_iec_identifier(value):
        raise ValueError("%s must be a non-reserved IEC identifier" % field)
    return value


def _validate_expr(value, field):
    value = str(value or "").strip()
    if not value or len(value) > 80 or any(ch in value for ch in "<>\"';&"):
        raise ValueError("%s is not a safe IEC expression" % field)
    # Accept a declared IEC symbol as well as a scalar integer literal.  More
    # complex expressions remain deliberately rejected: the generator must
    # emit a parameter value the LAD editor can type-check deterministically.
    if not _is_iec_identifier(value) and not re.match(r"^-?[0-9]+$", value):
        raise ValueError("%s must be an IEC identifier or integer literal" % field)
    return value


def _issue(code, path, expected, actual, example, message, remediation):
    return {
        "code": code,
        "path": path,
        "expected": expected,
        "actual": actual,
        "example": example,
        "message": message,
        "remediation": remediation,
    }


def _as_mapping(values, field, errors):
    if values is None:
        return {}
    if isinstance(values, (list, tuple)):
        result = {}
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                errors.append(_issue(
                    "INVALID_PORT_VALUE", "%s[%d]" % (field, index),
                    "object with name and value", item, {"name": "IN", "value": "TRUE"},
                    "%s entries must be objects" % field,
                    "Use an object keyed by the exact native port name, or a list of {name,value} objects."))
                continue
            name = str(item.get("name") or "")
            if not name:
                errors.append(_issue(
                    "PORT_NAME_REQUIRED", "%s[%d].name" % (field, index),
                    "exact native port name", item.get("name"), "IN",
                    "port name is required", "Copy the name and order from the live signature."))
                continue
            if name in result:
                errors.append(_issue(
                    "DUPLICATE_PORT_VALUE", "%s[%d].name" % (field, index),
                    "one value per exact port", name, name,
                    "port value is duplicated", "Remove the duplicate entry."))
            result[name] = item.get("value")
        return result
    if not isinstance(values, dict):
        errors.append(_issue(
            "INVALID_PORT_VALUE", field, "object keyed by exact port name", values,
            {"IN": "TRUE"}, "%s must be an object keyed by exact port name" % field,
            "Use exact live port names; aliases and positional guessing are rejected."))
        return {}
    return values


def _typed_literal(type_name):
    """Return a type-correct probe literal, or None for derived types."""
    upper = str(type_name or "").strip().upper()
    if upper == "BOOL":
        return "TRUE"
    if upper in ("BYTE", "WORD", "DWORD", "LWORD", "SINT", "USINT",
                 "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT"):
        return "1"
    if upper in ("REAL", "LREAL"):
        return "1.0"
    if upper == "TIME":
        return "T#1s"
    if upper == "LTIME":
        return "LTIME#1s"
    if upper == "DATE":
        return "D#1970-01-01"
    if upper == "TOD":
        return "TOD#00:00:00"
    if upper in ("DT", "DATE_AND_TIME"):
        return "DT#1970-01-01-00:00:00"
    if upper in ("STRING", "WSTRING") or upper.startswith("STRING(") or upper.startswith("WSTRING("):
        return "'X'"
    return None


def _symbol_type_lookup(symbol_types, value):
    """Resolve an optional caller-supplied type map for a symbol.

    ``symbol_types`` is intentionally advisory rather than a second project
    parser: native callers may provide the exact type read from a live GVL or
    POU.  Matching is case-insensitive and accepts the common optional
    ``Application.`` prefix.  A missing entry means that the installed
    compiler remains the authority for external/library symbols.
    """
    if not isinstance(symbol_types, dict):
        return None
    wanted = str(value or "").strip().lower()
    aliases = [wanted]
    if wanted.startswith("application."):
        aliases.append(wanted[len("application."):])
    else:
        aliases.append("application." + wanted)
    for key, candidate in symbol_types.items():
        key_text = str(key or "").strip().lower()
        if key_text not in aliases:
            continue
        if isinstance(candidate, dict):
            candidate = (candidate.get("type") or candidate.get("dataType") or
                         candidate.get("typeAsString") or
                         candidate.get("iecType"))
        candidate = str(candidate or "").strip()
        return candidate or None
    return None


def _value_matches_type(value, type_name, lvalue=False,
                        allow_qualified_symbols=False, symbol_types=None):
    value = str(value or "").strip()
    upper = str(type_name or "").strip().upper()
    if not value:
        return False
    value_upper = value.upper()
    # Symbol resolution comes FIRST: under the case-sensitive reserved-word
    # rule (2026-09-07 xOr fix), lowercase "true"/"false" are legal IEC
    # identifiers. A declared symbol with such a name must be treated as a
    # symbol, not hijacked by the literal check (review finding: the old
    # order sent BOOL-typed `true` down the literal path and mis-rejected it
    # in DINT positions).
    symbol = _is_iec_symbol_expression(
        value, allow_qualified=allow_qualified_symbols)
    if symbol:
        declared_type = _symbol_type_lookup(symbol_types, value)
        if declared_type is not None and not types_compatible(
                declared_type, type_name):
            return False
        return True
    if value_upper in ("TRUE", "FALSE"):
        return not lvalue and upper == "BOOL"
    if lvalue:
        return False
    if _is_iec_identifier(value):
        return True
    if upper == "BOOL":
        return False
    if upper in ("BYTE", "WORD", "DWORD", "LWORD", "SINT", "USINT",
                 "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT"):
        # IEC 61131-3 integer literals may be written in decimal or with a
        # base prefix (2#, 8#, 16#).  The native InoProShop editor accepts
        # these forms; rejecting them here made otherwise valid bitwise
        # operator plans fail before they reached the compiler.
        sign = -1 if value.startswith("-") else 1
        unsigned_value = value[1:] if value.startswith(("-", "+")) else value
        base_match = re.match(r"^(2|8|16)#([0-9A-Fa-f]+)$", unsigned_value)
        if base_match:
            base = int(base_match.group(1))
            digits = base_match.group(2)
            if base == 2 and not re.match(r"^[01]+$", digits):
                return False
            if base == 8 and not re.match(r"^[0-7]+$", digits):
                return False
            try:
                number = sign * int(digits, base)
            except ValueError:
                return False
        else:
            if not re.match(r"^[0-9]+$", unsigned_value):
                return False
            try:
                number = sign * int(unsigned_value)
            except ValueError:
                return False
        ranges = {
            "SINT": (-128, 127), "USINT": (0, 255), "BYTE": (0, 255),
            "INT": (-32768, 32767), "UINT": (0, 65535), "WORD": (0, 65535),
            "DINT": (-2147483648, 2147483647), "UDINT": (0, 4294967295),
            "DWORD": (0, 4294967295),
            "LINT": (-9223372036854775808, 9223372036854775807),
            "ULINT": (0, 18446744073709551615),
            "LWORD": (0, 18446744073709551615),
        }
        lower, upper_bound = ranges[upper]
        return lower <= number <= upper_bound
    if upper in ("REAL", "LREAL"):
        return bool(re.match(r"^-?[0-9]+(?:\.[0-9]+)?$", value))
    if upper == "TIME":
        return bool(re.match(r"^T#[0-9]+(?:us|ms|s|m|h)$", value, re.I))
    if upper == "LTIME":
        return bool(re.match(r"^LTIME#[0-9]+(?:ns|us|ms|s|m|h)$", value, re.I))
    if upper == "DATE":
        return bool(re.match(r"^D#[0-9]{4}-[0-9]{2}-[0-9]{2}$", value, re.I))
    if upper == "TOD":
        return bool(re.match(r"^TOD#[0-9]{2}:[0-9]{2}:[0-9]{2}$", value, re.I))
    if upper in ("DT", "DATE_AND_TIME"):
        return bool(re.match(r"^DT#[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}:[0-9]{2}:[0-9]{2}$", value, re.I))
    if upper == "STRING" or upper == "WSTRING" or upper.startswith("STRING(") or upper.startswith("WSTRING("):
        return len(value) >= 2 and value[0] == "'" and value[-1] == "'"
    return False


_OPERATOR_NUMERIC_TYPES = {
    "SINT", "USINT", "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT",
    "REAL", "LREAL",
}
_OPERATOR_INTEGER_TYPES = {
    "SINT", "USINT", "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT",
}
_OPERATOR_BIT_TYPES = {"BOOL", "BYTE", "WORD", "DWORD", "LWORD"}
_OPERATOR_REAL_TYPES = {"REAL", "LREAL"}
_OPERATOR_VERIFIED_TYPES = {
    "BOOL", "BYTE", "WORD", "DWORD", "LWORD",
    "SINT", "USINT", "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT",
    "REAL", "LREAL", "TIME",
}

# Native IEC operators are not callable library signatures. Their NWL graph
# shape is positional, so the generator exposes stable logical port names and
# requires an explicit operand type before any project object is created.
NATIVE_OPERATOR_SPECS = {
    "MOVE": {"enum": "Move", "inputs": ("IN",), "output": "OUT", "types": "scalar"},
    "ADD": {"enum": "Add", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric"},
    "SUB": {"enum": "Sub", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric"},
    "MUL": {"enum": "Mul", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric"},
    "DIV": {"enum": "Div", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric"},
    "MOD": {"enum": "Mod", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "integer"},
    "EQ": {"enum": "Eq", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric", "predicate": True},
    "NE": {"enum": "Ne", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric", "predicate": True},
    "GT": {"enum": "Gt", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric", "predicate": True},
    "GE": {"enum": "Ge", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric", "predicate": True},
    "LT": {"enum": "Lt", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric", "predicate": True},
    "LE": {"enum": "Le", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric", "predicate": True},
    "AND": {"enum": "And", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "bit"},
    "OR": {"enum": "Or", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "bit"},
    "XOR": {"enum": "Xor", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "bit"},
    "ABS": {"enum": "Abs", "inputs": ("IN",), "output": "OUT", "types": "numeric"},
    "NOT": {"enum": "Not", "inputs": ("IN",), "output": "OUT", "types": "bit"},
    "LIMIT": {"enum": "Limit", "inputs": ("MN", "IN", "MX"), "output": "OUT", "types": "numeric"},
    "MIN": {"enum": "Min", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric"},
    "MAX": {"enum": "Max", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "numeric"},
    "SEL": {"enum": "Sel", "inputs": ("G", "IN0", "IN1"), "output": "OUT", "types": "scalar",
            "fixedInputTypes": {"G": "BOOL"}},
    "MUX": {"enum": "Mux", "inputs": ("K", "IN0", "IN1"), "output": "OUT", "types": "scalar",
            "fixedInputTypes": {"K": "DINT"}},
    "SHL": {"enum": "Shl", "inputs": ("IN", "N"), "output": "OUT", "types": "bit",
            "fixedInputTypes": {"N": "DINT"}},
    "SHR": {"enum": "Shr", "inputs": ("IN", "N"), "output": "OUT", "types": "bit",
            "fixedInputTypes": {"N": "DINT"}},
    "ROL": {"enum": "Rol", "inputs": ("IN", "N"), "output": "OUT", "types": "bit",
            "fixedInputTypes": {"N": "DINT"}},
    "ROR": {"enum": "Ror", "inputs": ("IN", "N"), "output": "OUT", "types": "bit",
            "fixedInputTypes": {"N": "DINT"}},
    "EXP": {"enum": "Exp", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "EXPT": {"enum": "Expt", "inputs": ("IN1", "IN2"), "output": "OUT", "types": "real"},
    "SQRT": {"enum": "Sqrt", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "LN": {"enum": "Ln", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "LOG": {"enum": "Log", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "SIN": {"enum": "Sin", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "COS": {"enum": "Cos", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "TAN": {"enum": "Tan", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "ASIN": {"enum": "ASin", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "ACOS": {"enum": "ACos", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "ATAN": {"enum": "ATan", "inputs": ("IN",), "output": "OUT", "types": "real"},
    "NEG": {"enum": "Minus", "inputs": ("IN",), "output": "OUT", "types": "numeric"},
}

_NATIVE_CONVERSION_PAIRS = (
    ("BOOL", "BYTE"), ("BOOL", "WORD"), ("BOOL", "DWORD"),
    ("BOOL", "SINT"), ("BOOL", "USINT"), ("BOOL", "INT"),
    ("BOOL", "UINT"), ("BOOL", "DINT"), ("BOOL", "UDINT"),
    ("BOOL", "REAL"), ("BOOL", "LREAL"),
    ("BYTE", "BOOL"), ("WORD", "BOOL"), ("DWORD", "BOOL"),
    ("SINT", "DINT"), ("USINT", "DINT"), ("INT", "DINT"),
    ("UINT", "DINT"), ("UDINT", "DINT"), ("DINT", "INT"),
    ("DINT", "REAL"), ("DINT", "LREAL"), ("REAL", "DINT"),
    ("LREAL", "DINT"), ("REAL", "LREAL"), ("LREAL", "REAL"),
    ("DINT", "DWORD"), ("DWORD", "DINT"), ("WORD", "DWORD"),
    ("DWORD", "WORD"), ("TIME", "DINT"), ("DINT", "TIME"),
    ("BYTE", "WORD"), ("BYTE", "DWORD"), ("BYTE", "LWORD"),
    ("BYTE", "USINT"), ("BYTE", "UINT"), ("BYTE", "UDINT"),
    ("BYTE", "ULINT"), ("WORD", "BYTE"), ("WORD", "LWORD"),
    ("WORD", "UINT"), ("WORD", "UDINT"), ("WORD", "ULINT"),
    ("DWORD", "BYTE"), ("DWORD", "LWORD"), ("DWORD", "UDINT"),
    ("DWORD", "ULINT"), ("LWORD", "BYTE"), ("LWORD", "WORD"),
    ("LWORD", "DWORD"), ("LWORD", "ULINT"),
    ("SINT", "INT"), ("SINT", "LINT"), ("SINT", "REAL"),
    ("SINT", "LREAL"), ("USINT", "UINT"), ("USINT", "UDINT"),
    ("USINT", "ULINT"), ("USINT", "REAL"), ("USINT", "LREAL"),
    ("INT", "SINT"), ("INT", "UINT"), ("INT", "LINT"),
    ("INT", "REAL"), ("INT", "LREAL"), ("UINT", "USINT"),
    ("UINT", "UDINT"), ("UINT", "ULINT"), ("UINT", "REAL"),
    ("UINT", "LREAL"), ("DINT", "SINT"), ("DINT", "USINT"),
    ("DINT", "UINT"), ("DINT", "UDINT"), ("DINT", "LINT"),
    ("DINT", "ULINT"), ("UDINT", "UINT"), ("UDINT", "ULINT"),
    ("UDINT", "REAL"), ("UDINT", "LREAL"), ("LINT", "DINT"),
    ("LINT", "REAL"), ("LINT", "LREAL"), ("ULINT", "UDINT"),
    ("ULINT", "REAL"), ("ULINT", "LREAL"), ("REAL", "INT"),
    ("REAL", "LINT"), ("LREAL", "INT"), ("LREAL", "LINT"),
)
_NATIVE_CONVERSION_MATRIX_TYPES = (
    "BOOL", "BYTE", "WORD", "DWORD", "LWORD",
    "SINT", "USINT", "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT",
    "REAL", "LREAL",
)
_NATIVE_CONVERSION_PAIRS += tuple(
    (source_type, target_type)
    for source_type in _NATIVE_CONVERSION_MATRIX_TYPES
    for target_type in _NATIVE_CONVERSION_MATRIX_TYPES
    if source_type != target_type and
    (source_type, target_type) not in _NATIVE_CONVERSION_PAIRS
)
for _conversion_source, _conversion_target in _NATIVE_CONVERSION_PAIRS:
    NATIVE_OPERATOR_SPECS["%s_TO_%s" % (
        _conversion_source, _conversion_target)] = {
            "enum": "Conversion", "inputs": ("IN",), "output": "OUT",
            "types": "conversion",
            "fixedInputTypes": {"IN": _conversion_source},
            "outputType": _conversion_target,
        }

# Verification is promoted by operator family.  Keeping the matrix explicit
# prevents a successful conversion from silently enabling an unrelated graph.
_OPERATOR_FAMILY_VERIFIED_TYPES = {
    "conversion": set(_NATIVE_CONVERSION_MATRIX_TYPES) | {"TIME"},
    "numeric": set(_OPERATOR_NUMERIC_TYPES),
    "integer": set(_OPERATOR_INTEGER_TYPES),
    "bit": set(_OPERATOR_BIT_TYPES),
    "real": set(_OPERATOR_REAL_TYPES),
    "scalar": set(_NATIVE_CONVERSION_MATRIX_TYPES) | {"TIME"},
}


def _operator_allowed_types(group):
    if group == "numeric":
        return _OPERATOR_NUMERIC_TYPES
    if group == "integer":
        return _OPERATOR_INTEGER_TYPES
    if group == "bit":
        return _OPERATOR_BIT_TYPES
    if group == "real":
        return _OPERATOR_REAL_TYPES
    return SCALAR_TYPES


def validate_operator_request(instruction, data_type=None, input_values=None,
                              output_targets=None, inout_values=None,
                              instance=None, allow_qualified_symbols=False,
                              symbol_types=None):
    """Validate one canonical native Operator plan without project mutation.

    Native composition may opt into conservative qualified symbols and pass
    live ``symbol_types`` readback; the default remains strict for portable
    PLCopen callers.
    """
    errors = []
    mnemonic = str(instruction or "").strip().upper()
    spec = NATIVE_OPERATOR_SPECS.get(mnemonic)
    if spec is None:
        return {"ok": False, "errors": [_issue(
            "OPERATOR_NOT_SUPPORTED", "instruction",
            sorted(NATIVE_OPERATOR_SPECS), mnemonic, "ADD",
            "instruction is not a supported canonical native Operator",
            "Use a supported Operator name or a live Function/FunctionBlock signature.")],
            "normalized": None}

    normalized_type = str(data_type or "").strip().upper()
    allowed_types = ({spec["outputType"]} if spec.get("outputType")
                     else _operator_allowed_types(spec["types"]))
    if not normalized_type:
        errors.append(_issue(
            "OPERATOR_DATA_TYPE_REQUIRED", "dataType",
            sorted(allowed_types), data_type, "DINT",
            "native Operator operands require an explicit IEC data type",
            "Set dataType to the declared type shared by all input operands."))
    elif (not _supported_scalar_type(normalized_type) or
          (spec["types"] != "scalar" and normalized_type not in allowed_types)):
        errors.append(_issue(
            "OPERATOR_DATA_TYPE_UNSUPPORTED", "dataType",
            sorted(allowed_types), normalized_type, "DINT",
            "%s does not support the requested operand type" % mnemonic,
            "Choose a listed type and declare every connected variable with that exact type."))
    verified_types = _OPERATOR_FAMILY_VERIFIED_TYPES.get(
        spec["types"], _OPERATOR_VERIFIED_TYPES)
    if spec.get("outputType"):
        verified_types = _OPERATOR_FAMILY_VERIFIED_TYPES["conversion"]
    type_is_allowed = (_supported_scalar_type(normalized_type) and
                       (spec["types"] == "scalar" or
                        normalized_type in allowed_types))
    if (normalized_type and type_is_allowed and
            normalized_type not in verified_types):
        errors.append(_issue(
            "OPERATOR_DATA_TYPE_UNVERIFIED", "dataType",
            sorted(verified_types), normalized_type, "DINT",
            "%s has not passed native precompile for this operand type" % mnemonic,
            "Use a listed type now; promote additional IEC types only after a clean native precompile batch."))

    inputs = _as_mapping(input_values, "inputs", errors)
    outputs = _as_mapping(output_targets, "outputs", errors)
    inouts = _as_mapping(inout_values, "inouts", errors)
    if inouts:
        errors.append(_issue(
            "OPERATOR_INOUT_UNSUPPORTED", "inouts", {}, inouts, {},
            "native Operators do not have InOut ports",
            "Remove inouts and use the single OUT lvalue."))
    if instance:
        errors.append(_issue(
            "OPERATOR_INSTANCE_UNSUPPORTED", "instance", None, instance, None,
            "native Operators do not use FunctionBlock instances",
            "Remove instance from this instruction node."))

    normalized_inputs = []
    expected_inputs = set(spec["inputs"])
    fixed_input_types = spec.get("fixedInputTypes") or {}
    for index, port_name in enumerate(spec["inputs"]):
        port_type = fixed_input_types.get(port_name, normalized_type)
        value = inputs.get(port_name)
        if value is None or not str(value).strip():
            errors.append(_issue(
                "OPERATOR_INPUT_REQUIRED", "inputs.%s" % port_name,
                "IEC value compatible with %s" % (port_type or "dataType"),
                value, {port_name: "Value%d" % (index + 1)},
                "%s input %s is required" % (mnemonic, port_name),
                "Provide a typed literal or a variable declared with dataType."))
            continue
        if port_type and not _value_matches_type(
                value, port_type,
                allow_qualified_symbols=allow_qualified_symbols,
                symbol_types=symbol_types):
            errors.append(_issue(
                "OPERATOR_INPUT_TYPE_MISMATCH", "inputs.%s" % port_name,
                "value compatible with %s" % port_type, value,
                {port_name: _typed_literal(port_type) or "Value"},
                "%s input is incompatible with its required type" % port_name,
                "Use a typed literal or a variable declared with the exact port type."))
        normalized_inputs.append({"index": index, "name": port_name,
                                  "type": port_type, "value": str(value)})
    for unknown in sorted(set(str(key) for key in inputs) - expected_inputs):
        errors.append(_issue(
            "UNKNOWN_OPERATOR_INPUT", "inputs.%s" % unknown,
            list(spec["inputs"]), inputs.get(unknown),
            {spec["inputs"][0]: "Value"},
            "input name is not part of the canonical Operator plan",
            "Use the exact logical input names shown in expected."))
    if mnemonic in ("DIV", "MOD"):
        divisor = str(inputs.get("IN2") or "").strip().upper()
        # 2026-09-07 review: the old regex only caught decimal/typed zeros
        # ("0", "0.0", "INT#0") and let radix-prefixed zeros through
        # ("2#0", "8#0", "16#0"). Normalize every IEC numeric spelling to
        # its bare digits before judging zero.
        normalized_divisor = re.sub(r"^(?:[A-Z_][A-Z0-9_]*#)?", "", divisor)
        normalized_divisor = re.sub(r"^[+-]", "", normalized_divisor)
        is_zero = bool(re.match(r"^0(?:\.0+)?$", normalized_divisor))
        if "2#" in divisor or "8#" in divisor or "16#" in divisor:
            radix, _, digits = divisor.partition("#")
            try:
                is_zero = int(digits, {"2": 2, "8": 8, "16": 16}.get(radix, 10)) == 0
            except (ValueError, TypeError):
                is_zero = False
        if is_zero:
            errors.append(_issue(
                "OPERATOR_DIVISOR_ZERO", "inputs.IN2", "non-zero divisor",
                inputs.get("IN2"), {"IN2": "1"},
                "%s divisor cannot be the literal zero" % mnemonic,
                "Use a non-zero literal or a declared variable guarded by program logic."))

    output_name = spec["output"]
    output_value = outputs.get(output_name)
    output_type = (spec.get("outputType") or
                   ("BOOL" if spec.get("predicate") else normalized_type))
    if output_value is None or not str(output_value).strip():
        errors.append(_issue(
            "OPERATOR_OUTPUT_REQUIRED", "outputs.%s" % output_name,
            "declared IEC lvalue", output_value, {output_name: "Result"},
            "%s requires one output variable" % mnemonic,
            "Provide a unique declared result variable."))
    elif output_type and not _value_matches_type(
            output_value, output_type, lvalue=True,
            allow_qualified_symbols=allow_qualified_symbols,
            symbol_types=symbol_types):
        errors.append(_issue(
            "OPERATOR_OUTPUT_NOT_LVALUE", "outputs.%s" % output_name,
            "IEC identifier declared as %s" % output_type, output_value,
            {output_name: "Result"},
            "Operator output must be a writable IEC variable",
            "Use a declared identifier, not a literal or expression."))
    for unknown in sorted(set(str(key) for key in outputs) - set((output_name,))):
        errors.append(_issue(
            "UNKNOWN_OPERATOR_OUTPUT", "outputs.%s" % unknown,
            [output_name], outputs.get(unknown), {output_name: "Result"},
            "output name is not part of the canonical Operator plan",
            "Use OUT as the single result port."))

    normalized_outputs = []
    if output_value is not None and str(output_value).strip():
        normalized_outputs.append({"index": 0, "name": output_name,
                                   "type": output_type,
                                   "value": str(output_value)})
    return {
        "ok": not errors,
        "errors": errors,
        "normalized": {
            "instruction": mnemonic,
            "operatorEnum": spec["enum"],
            "dataType": normalized_type,
            "inputs": normalized_inputs,
            "inouts": [],
            "outputs": normalized_outputs,
            "instance": None,
        },
    }


def validate_signature_request(signature, input_values=None, inout_values=None,
                               output_targets=None, instance=None,
                               allow_qualified_symbols=False,
                               symbol_types=None,
                               require_verified_derived_types=False):
    """Validate one live signature and all generated parameter values.

    The result is intentionally data-only so the resident bridge can return
    the same path/expected/actual/example/remediation contract as PLC Engineering Suite.
    No default is accepted for InOut or output operands; input defaults are
    generated only for the bounded scalar set above and are still type-checked.
    ``allow_qualified_symbols`` is opt-in for native graph writers: it admits
    conservative ``GVL.Member``/``Application.GVL.Member`` references while
    retaining the vendor compiler as the final resolver.  ``symbol_types``
    may supply live type readback for an additional exact type check.
    """
    errors = []
    qualified_symbols = set()
    unresolved_qualified_symbols = set()
    if not isinstance(signature, dict):
        return {"ok": False, "errors": [_issue(
            "SIGNATURE_REQUIRED", "signature", "live signature object", signature,
            {"name": "ADD", "runtimeType": "Inovance...Signature"},
            "signature must be an object", "Resolve the exact installed runtime signature first.")]}
    name = str(signature.get("name") or "").strip()
    call_type = str(signature.get("callType") or signature.get("pouType") or "").strip()
    context = signature.get("context")
    if not isinstance(context, dict):
        context = {}
    if not name:
        errors.append(_issue("SIGNATURE_NAME_REQUIRED", "signature.name", "non-empty instruction name", signature.get("name"), "ADD", "signature.name is required", "Use the exact live signature name."))
    if (require_verified_derived_types and
            name.upper().startswith(("ATOMICREAD", "ATOMICWRITE"))):
        # These entries are present in the broad runtime catalog but are not
        # callable in the active AM600 target (the compiler reports the
        # function identifier itself as undefined). Keep them out of native
        # generation until a target-specific binding is available.
        errors.append(_issue(
            "UNSUPPORTED_TARGET_CALLABLE", "signature.name",
            "callable resolved by the active target", name, "BCD_TO_BYTE",
            "runtime catalog entry is not provided by this target",
            "Skip this target-dependent signature; do not import a graph that the compiler cannot resolve."))
    namespace = str(context.get("namespace") or "").strip()
    callable_identity = ((namespace + "." + name) if namespace else name).upper()
    if (require_verified_derived_types and
            callable_identity in UNSUPPORTED_TARGET_CALLABLES):
        errors.append(_issue(
            "UNSUPPORTED_TARGET_CALLABLE", "signature.name",
            "callable resolved by the active target", name, "BCD_TO_BYTE",
            "runtime catalog entry is not provided by this target",
            "Skip this target-dependent signature; do not import a graph that the compiler cannot resolve."))
    if not signature.get("runtimeType"):
        errors.append(_issue("SIGNATURE_RUNTIME_IDENTITY_REQUIRED", "signature.runtimeType", "live runtime type", signature.get("runtimeType"), "Inovance.InoPro...Signature", "signature is not a live runtime record", "Use lad.instruction_catalog or lad.instruction_signatures; do not pass a directory entry."))
    if not signature.get("objectGuid") and not context.get("libraryGuid"):
        errors.append(_issue("SIGNATURE_OBJECT_ID_REQUIRED", "signature.objectGuid", "objectGuid or context.libraryGuid", signature.get("objectGuid"), "00000000-0000-0000-0000-000000000000", "signature has no runtime/library identity", "Use a signature returned by the installed LanguageModelMgr."))
    if not context.get("source"):
        errors.append(_issue("SIGNATURE_CONTEXT_REQUIRED", "signature.context.source", "live LanguageModelMgr context", context.get("source"), "all_precompile_contexts", "signature context is missing its live source", "Use a catalog/signature record returned by the installed runtime, not a hand-written port list."))
    if call_type not in ("Function", "FunctionBlock"):
        errors.append(_issue("SIGNATURE_KIND_UNSUPPORTED", "signature.callType", ["Function", "FunctionBlock"], call_type, "Function", "only Function and FunctionBlock signatures are generatable", "Do not generate operators without a callable runtime kind."))
    is_fb = call_type == "FunctionBlock" or signature.get("instanceRequirement") == "required"
    if signature.get("instanceRequirement") == "unknown":
        errors.append(_issue("INSTANCE_RULE_UNKNOWN", "signature.instanceRequirement", ["required", "not_required"], "unknown", "required", "FunctionBlock instance rule is unresolved", "Capture native instance readback before generation."))
    if is_fb:
        instance = str(instance or "BlockInstance").strip()
        if not _is_iec_identifier(instance):
            errors.append(_issue("INVALID_INSTANCE", "instance", "IEC identifier", instance, "BlockInstance", "FunctionBlock instance must be an IEC identifier", "Use a stable instance variable name."))
    elif instance:
        errors.append(_issue("UNEXPECTED_INSTANCE", "instance", "absent for Function", instance, None, "Function signatures cannot receive an FB instance", "Remove instance for a Function."))

    normalized = {"inputs": [], "inouts": [], "outputs": [], "instance": instance if is_fb else None}
    mappings = {
        "inputs": _as_mapping(input_values, "inputs", errors),
        "inouts": _as_mapping(inout_values, "inouts", errors),
        "outputs": _as_mapping(output_targets, "outputs", errors),
    }
    for field in ("inputs", "inouts", "outputs"):
        ports = signature.get(field)
        if not isinstance(ports, (list, tuple)):
            errors.append(_issue("PORT_LIST_REQUIRED", "signature.%s" % field, "ordered port list", ports, [], "signature.%s is missing" % field, "Use the exact ordered port list from runtime readback."))
            continue
        seen = set()
        known = []
        for index, port in enumerate(ports):
            path = "signature.%s[%d]" % (field, index)
            if not isinstance(port, dict):
                errors.append(_issue("PORT_OBJECT_REQUIRED", path, "object with name and type", port, {"name": "IN", "type": "BOOL"}, "port entry must be an object", "Use native InputParam/OutputParam metadata."))
                continue
            port_name = str(port.get("name") or "").strip()
            port_type = str(port.get("type") or "").strip()
            if not port_name:
                errors.append(_issue("PORT_NAME_REQUIRED", path + ".name", "non-empty exact port name", port.get("name"), "IN", "unnamed ports cannot be generated safely", "Do not infer positional or unnamed pins."))
            elif port_name in seen:
                errors.append(_issue("DUPLICATE_PORT_NAME", path + ".name", "unique ordered port names", port_name, "IN", "duplicate native port name", "Use native readback; duplicate names indicate an unusable signature."))
            seen.add(port_name)
            known.append(port_name)
            if (require_verified_derived_types and
                    port_name.upper() in ("EN", "ENO")):
                errors.append(_issue(
                    "UNSUPPORTED_EN_ENO_SHAPE", path + ".name",
                    "native EN/ENO mapping verified for this signature",
                    port_name, "IN",
                    "the NWL constructor requires a dedicated EN/ENO operand mapping",
                    "Skip this signature until its live EN/ENO graph mapping is verified."))
            # Exact live vendor types are valid declarations.  Only the
            # optional legacy strict mode rejects an unfamiliar type; the
            # production generator must send it to InoProShop so the real
            # compiler can report the actionable semantic diagnostic.
            if (not _supported_scalar_type(port_type) and
                    require_verified_derived_types):
                errors.append(_issue(
                    "UNSUPPORTED_PORT_TYPE", path + ".type",
                    sorted(SCALAR_TYPES | SUPPORTED_DERIVED_TYPES |
                           SUPPORTED_POINTER_TYPES),
                    port_type, "BOOL",
                    "no verified declaration strategy exists for this port type",
                    "Promote the exact installed type before generating this signature."))
            elif (require_verified_derived_types and
                  any(token in port_type.upper()
                      for token in UNRESOLVED_VENDOR_TYPES)):
                # Keep the recurring runtime-only vendor types explicit.  The
                # generic derived-type guard used to run first, making this
                # branch unreachable and hiding the actionable reason behind
                # a broad UNVERIFIED_DERIVED_TYPE error.  These names are
                # known to be unresolved in the active target and must be
                # rejected before any native object is created.
                errors.append(_issue(
                    "UNRESOLVED_VENDOR_TYPE", path + ".type",
                    "project-resolvable IEC type with installed library",
                    port_type, "BOOL",
                    "runtime signature exposes a vendor type that is not resolved in the current project",
                    "Skip this environment-dependent signature or add the exact defining library and re-read the signature."))
            elif (require_verified_derived_types and
                  port_type.upper() not in SCALAR_TYPES and
                  not _BOUNDED_STRING_TYPE.match(port_type.upper())):
                errors.append(_issue(
                    "UNVERIFIED_DERIVED_TYPE", path + ".type",
                    "scalar IEC type or bounded STRING/WSTRING",
                    port_type, "BOOL",
                    "derived/pointer type has no verified native declaration mapping in this project",
                    "Skip this environment-dependent signature or add an exact type mapping before generation."))
            mapping = mappings[field]
            if port_name not in mapping:
                if field == "inputs":
                    value = _typed_literal(port_type)
                    if value is None:
                        if not require_verified_derived_types:
                            value = "IN_" + (re.sub(r"[^A-Za-z0-9_]", "_", port_name) or str(index))
                        else:
                            errors.append(_issue(
                                "MISSING_PORT_VALUE", "$.inputs.%s" % port_name,
                                "explicit IEC identifier declared as %s" % port_type,
                                None, {port_name: port_name.title() + "Value"},
                                "input type %s has no safe generated literal" % port_type,
                                "Bind this port to a declared variable with the exact live type."))
                            continue
                elif field == "outputs":
                    value = "OUT_" + (re.sub(r"[^A-Za-z0-9_]", "_", port_name) or str(index))
                else:
                    if require_verified_derived_types:
                        errors.append(_issue("MISSING_INOUT_VALUE", "$.inouts.%s" % port_name, "declared IEC lvalue", None, {port_name: "Value"}, "InOut ports require an explicit lvalue", "Provide an IEC variable for every InOut port."))
                        continue
                    value = "IO_" + (re.sub(r"[^A-Za-z0-9_]", "_", port_name) or str(index))
            else:
                value = mapping.get(port_name)
            requires_lvalue = field in ("inouts", "outputs")
            # Never pass statement fragments to the native expression slot.
            # InoProShop reports these as the misleading parser diagnostic
            # ``应该用表达式代替 ';'`` only after the graph has been written.
            # Reject the fragment while the request is still an in-memory
            # plan, so no POU or network can be created from it.
            value = _canonical_local_operand(value)
            raw_value = str(value or "")
            # These tokens are constructor/parser placeholders, never valid
            # IEC operands.  Reject them before any native object is created;
            # otherwise the vendor emits the misleading diagnostics
            # ``应该用表达式代替 '?'`` and ``需要程序名、函数或功能块实例替代
            # '!!!ERROR!!!'`` only after the project has been mutated.
            placeholder = raw_value.strip().upper()
            # The native compiler prints the operand as ``???`` but its
            # localized diagnostic quotes only ``?``.  Accept neither form
            # (nor the other constructor marker spellings) as a real IEC
            # expression.  Quoted string literals such as '?' remain valid:
            # the check is deliberately limited to the complete raw token.
            marker_only = bool(
                re.match(r"^\?+$", placeholder) or
                re.match(r"^!+(?:'ERROR'!*)?$", placeholder))
            if (not placeholder or marker_only or
                    placeholder in ("???", "!!!ERROR!!!", "!!!'ERROR'!!!") or
                    "???" in placeholder or "!!!ERROR!!!" in placeholder):
                errors.append(_issue(
                    "INVALID_PORT_PLACEHOLDER", "$.%s.%s" % (field, port_name),
                    "typed IEC literal or declared IEC identifier", value,
                    {port_name: _typed_literal(port_type) or "Value"},
                    "port value is an unresolved generator placeholder",
                    "Resolve the exact port binding before importing; placeholders are never accepted."))
                normalized[field].append({"name": port_name, "type": port_type,
                                          "value": raw_value})
                continue
            if any(token in raw_value for token in (";", ":=", "\r", "\n")):
                errors.append(_issue(
                    "INVALID_PORT_EXPRESSION", "$.%s.%s" % (field, port_name),
                    "one IEC expression without statement terminators",
                    value, {port_name: "Value" if requires_lvalue else _typed_literal(port_type) or "Value"},
                    "port value contains a statement separator or assignment",
                    "Bind the port to a typed IEC variable/literal; do not pass ST statements or ';'."))
                normalized[field].append({"name": port_name, "type": port_type,
                                          "value": raw_value})
                continue
            if (allow_qualified_symbols and
                    _is_iec_qualified_identifier(value)):
                qualified_symbols.add(str(value).strip())
                # A qualified symbol is owned by another object.  Without an
                # exact type readback the generator cannot distinguish a
                # valid project symbol from the common native diagnostic
                # ``没有定义标识符'X'``.  Fail closed before native write;
                # callers can opt in with symbolTypes={"GVL.Member":"BOOL"}.
                if (_symbol_type_lookup(symbol_types, value) is None):
                    unresolved_qualified_symbols.add(str(value).strip())
                    errors.append(_issue(
                        "UNRESOLVED_QUALIFIED_SYMBOL",
                        "$.%s.%s" % (field, port_name),
                        "symbolTypes entry with the exact IEC type",
                        value, {port_name: "DeclaredVariable"},
                        "qualified symbol has no verified project declaration",
                        "Provide symbolTypes for the exact qualified symbol, or use a local identifier."))
            if not _value_matches_type(
                    value, port_type, lvalue=requires_lvalue,
                    allow_qualified_symbols=allow_qualified_symbols,
                    symbol_types=symbol_types):
                if requires_lvalue:
                    example_value = "Result" if field == "outputs" else "Value"
                    expected = "declared IEC variable with exact type %s" % port_type
                    port_kind = "output" if field == "outputs" else "InOut"
                    remediation = (
                        "Use a writable IEC variable declared with the exact port type; "
                        "literals and expressions are invalid for %s ports." % port_kind)
                else:
                    example_value = _typed_literal(port_type) or "Value"
                    expected = "value compatible with %s" % port_type
                    remediation = (
                        "Use a typed literal or declared IEC symbol with the matching type.")
                errors.append(_issue(
                    "PORT_VALUE_TYPE_MISMATCH",
                    "$.%s.%s" % (field, port_name), expected, value,
                    {port_name: example_value},
                    "port value does not match its exact native type",
                    remediation))
            normalized[field].append({"name": port_name, "type": port_type, "value": str(value)})
        unknown = sorted(set(str(key) for key in mappings[field]) - set(known))
        for key in unknown:
            if not require_verified_derived_types:
                continue
            if known:
                first_port = next((item for item in ports
                                   if isinstance(item, dict) and
                                   str(item.get("name") or "").strip() == known[0]), {})
                first_type = str(first_port.get("type") or "").strip()
                if field == "inputs":
                    example_value = _typed_literal(first_type) or "Value"
                else:
                    example_value = "Result" if field == "outputs" else "Value"
                example = {known[0]: example_value}
            else:
                example = {}
            remediation = "Use exact names and order from the live signature."
            if field in ("inouts", "outputs"):
                remediation += " Bind the port to a writable variable declared with its exact type."
            errors.append(_issue(
                "UNKNOWN_PORT_VALUE", "$.%s.%s" % (field, key), known,
                mappings[field].get(key), example,
                "value targets a port absent from the live signature", remediation))
    return {"ok": not errors, "errors": errors, "normalized": normalized,
            "instruction": name, "callType": call_type,
            "qualifiedSymbols": sorted(qualified_symbols),
            "unresolvedQualifiedSymbols": sorted(unresolved_qualified_symbols)}


def validate_variable_declarations(values):
    """Validate and normalize the interface declared by a compose request."""
    errors = []
    normalized = []
    if values is None:
        values = []
    if not isinstance(values, (list, tuple)):
        return {"ok": False, "normalized": [], "errors": [_issue(
            "VARIABLES_INVALID", "variables", "array of variable declarations",
            values, [{"name": "Start", "type": "BOOL", "section": "input"}],
            "variables must be an array",
            "Declare each variable with name, type and optional section.")]}

    seen = {}
    allowed = set(("name", "type", "section"))
    for index, raw in enumerate(values):
        path = "variables[%d]" % index
        if not isinstance(raw, dict):
            errors.append(_issue(
                "VARIABLE_INVALID", path, "object", raw,
                {"name": "Start", "type": "BOOL", "section": "input"},
                "variable declaration must be an object",
                "Use {name,type,section}."))
            continue
        unknown = sorted(set(raw.keys()) - allowed)
        for key in unknown:
            errors.append(_issue(
                "UNKNOWN_VARIABLE_FIELD", path + "." + key,
                sorted(allowed), raw.get(key),
                {"name": "Start", "type": "BOOL", "section": "input"},
                "unknown variable field '%s'" % key,
                "Remove the unsupported field."))

        name = str(raw.get("name") or "").strip()
        type_name = str(raw.get("type") or "").strip()
        type_class = type_name.upper()
        # The symbolic bound is part of the installed type identity. Preserve
        # its spelling instead of silently replacing it with a numeric guess.
        if (_SYMBOLIC_STRING_TYPE.match(type_name) or
                _requires_symbol_value(type_name)):
            normalized_type = type_name
        else:
            normalized_type = type_class
        section = str(raw.get("section") or "local").strip().lower()
        valid = True
        if not type_name:
            errors.append(_issue(
                "MISSING_VARIABLE_TYPE", path + ".type",
                "explicit supported IEC type", raw.get("type"), "BOOL",
                "variable type is required",
                "Set type to the exact type used by the connected live port."))
            valid = False
        if not _is_iec_identifier(name):
            errors.append(_issue(
                "INVALID_VARIABLE_NAME", path + ".name",
                "non-reserved IEC identifier", name,
                "Start", "invalid variable name",
                "Use letters, digits and underscores, start correctly, and do not use an IEC keyword or literal."))
            valid = False
        elif name.lower() in seen:
            errors.append(_issue(
                "DUPLICATE_VARIABLE", path + ".name",
                "case-insensitively unique IEC identifier", name,
                "Start2", "variable duplicates %s" % seen[name.lower()],
                "Remove or rename the duplicate declaration."))
            valid = False
        if type_name and not _supported_scalar_type(type_name):
            errors.append(_issue(
                "UNSUPPORTED_VARIABLE_TYPE", path + ".type",
                sorted(SCALAR_TYPES | SUPPORTED_DERIVED_TYPES |
                       SUPPORTED_POINTER_TYPES), type_name, "BOOL",
                "the generator has no verified declaration strategy for this type",
                "Use a supported scalar/derived type or first promote the exact installed type."))
            valid = False
        if section not in ("input", "output", "local"):
            errors.append(_issue(
                "INVALID_VARIABLE_SECTION", path + ".section",
                ["input", "output", "local"], section, "local",
                "unsupported declaration section",
                "Use input, output or local."))
            valid = False
        if valid:
            seen[name.lower()] = name
            normalized.append({"name": name, "type": normalized_type, "section": section})
    return {"ok": not errors, "errors": errors, "normalized": normalized}


def generate_addition_xml(output_path, name, left="A", right="B",
                          output="Result", value_type="INT"):
    """Generate one complete ADD LD POU and return file evidence."""
    name = _validate_identifier(name, "name")
    output = _validate_identifier(output, "output")
    value_type = str(value_type or "INT").strip().upper()
    if not TYPE.match(value_type):
        raise ValueError("value_type must be an IEC scalar type")
    left = _validate_expr(left, "left")
    right = _validate_expr(right, "right")
    if not output_path:
        raise ValueError("output_path is required")
    source = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                          "work", "public-samples", "addition.xml")
    if not os.path.isfile(source):
        raise ValueError("verified PLCopen ADD sample is missing")
    # Do not parse the file with IronPython's bundled XML module.  It rejects
    # the UTF-8 comments in the verified sample even though the vendor import
    # API accepts them.  These substitutions are limited to exact XML tokens.
    with open(source, "rb") as stream:
        raw = stream.read()
    replacements = (
        ('name="Addition_LD"', 'name="%s"' % name),
        ('typeName="Addition_LD"', 'typeName="%s"' % name),
        ('<expression>A</expression>', '<expression>%s</expression>' % left),
        ('<expression>B</expression>', '<expression>%s</expression>' % right),
        ('<expression>Result</expression>', '<expression>%s</expression>' % output),
        ('variable name="Result"', 'variable name="%s"' % output),
        # InoProShop treats an LD contact variable as an IEC symbol, not an
        # arbitrary expression.  The old sample used TRUE here, which imports
        # but creates a precompiler warning ("TRUE;" is invalid in LD).  Give
        # the rung a real BOOL symbol so the generated graph is warning-free.
        ('<variable name="A">', '<variable name="Enable"><type><BOOL/></type></variable>\n            <variable name="A">'),
        ('<variable>TRUE</variable>', '<variable>Enable</variable>'),
    )
    for old, new in replacements:
        raw = raw.replace(old.encode("utf-8"), new.encode("utf-8"))
    # The public sample declares A/B. When callers pass real project symbols,
    # carry those names into the generated interface so the imported graph is
    # self-contained and compiles without manual declaration edits. Constants
    # keep the sample declarations as harmless unused locals.
    if _is_iec_identifier(left) and left not in ("A", "B"):
        raw = raw.replace(b'<variable name="A">',
                          ('<variable name="%s">' % left).encode("utf-8"), 1)
    if (_is_iec_identifier(right) and right not in ("A", "B") and right != left):
        raw = raw.replace(b'<variable name="B">',
                          ('<variable name="%s">' % right).encode("utf-8"), 1)
    if raw.count(b"<expression>") < 3:
        raise ValueError("verified ADD sample has an incomplete graph")
    # The sample's declarations are INT.  Other scalar types are supported by
    # changing only the three declaration tags, leaving graph topology intact.
    if value_type != "INT":
        raw = raw.replace(b"<INT/>", ("<%s/>" % value_type).encode("ascii"))
    parent = os.path.dirname(os.path.abspath(output_path))
    if not os.path.isdir(parent):
        os.makedirs(parent)
    with open(output_path, "wb") as stream:
        stream.write(raw)
    return {"path": output_path, "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest(), "name": name,
            "operation": "ADD", "left": left, "right": right,
            "output": output, "type": value_type}


PLCOPEN_NS = "http://www.plcopen.org/xml/tc6_0201"
ET.register_namespace("", PLCOPEN_NS)


def _q(name):
    return "{" + PLCOPEN_NS + "}" + name


def _xml_type(parent, type_name):
    """Write the portable PLCopen scalar/derived type node."""
    type_name = str(type_name or "").strip()
    if not IDENT.match(type_name) and not re.match(r"^(STRING|WSTRING)\([0-9]+\)$", type_name, re.I):
        derived = ET.SubElement(parent, _q("derived"), {"name": type_name})
        return derived
    upper = type_name.upper()
    scalar = {"BOOL", "BYTE", "WORD", "DWORD", "LWORD", "SINT", "USINT",
              "INT", "UINT", "DINT", "UDINT", "LINT", "ULINT", "REAL",
              "LREAL", "TIME", "DATE", "TOD", "DT", "STRING", "WSTRING"}
    if upper == "DATE_AND_TIME":
        ET.SubElement(parent, _q("DT"))
        return
    if upper in scalar:
        ET.SubElement(parent, _q(upper))
    elif re.match(r"^(STRING|WSTRING)\([0-9]+\)$", upper):
        base = upper.split("(", 1)[0]
        ET.SubElement(parent, _q(base), {"length": upper.split("(", 1)[1][:-1]})
    else:
        ET.SubElement(parent, _q("derived"), {"name": type_name})


def _safe_literal(type_name):
    return _typed_literal(type_name)


def _port_map(values, ports, field, lvalue=False):
    values = values or {}
    if isinstance(values, (list, tuple)):
        values = dict((item.get("name"), item.get("value"))
                      for item in values if isinstance(item, dict))
    if not isinstance(values, dict):
        raise ValueError("%s must be an object keyed by exact port name" % field)
    known = dict((str(port.get("name")), port) for port in ports)
    unknown = sorted(set(str(key) for key in values) - set(known))
    if unknown:
        raise ValueError("%s contains unknown ports: %s" % (field, ", ".join(unknown)))
    result = []
    for port in ports:
        port_name = str(port.get("name") or "")
        if not port_name:
            raise ValueError("signature contains an unnamed %s port" % field)
        value = values.get(port_name, _safe_literal(port.get("type")))
        if value is None or not str(value).strip():
            raise ValueError("%s.%s requires an explicit value for type %s" %
                             (field, port_name, port.get("type")))
        if not _value_matches_type(value, port.get("type"), lvalue=lvalue):
            raise ValueError("%s.%s value %r does not match %s%s" %
                             (field, port_name, value, port.get("type"),
                              " lvalue" if lvalue else ""))
        result.append((port_name, str(port.get("type") or ""), str(value)))
    return result


def generate_signature_xml(output_path, name, signature, input_values=None,
                           output_targets=None, instance=None,
                           inout_values=None):
    """Generate one exact-port PLCopen LD block from a live signature.

    ``signature`` must be the structured result of the resident
    ``LanguageModelMgr.FindSignaturesByName`` call. Port order and names are
    never inferred from prefixes or documentation.
    """
    name = _validate_identifier(name, "name")
    if not isinstance(signature, dict):
        raise ValueError("signature must be a live signature object")
    validation = validate_signature_request(
        signature, input_values, inout_values,
        output_targets, instance,
    )
    if not validation.get("ok"):
        first = validation["errors"][0]
        raise ValueError("%s: %s (%s)" %
                         (first.get("code"), first.get("message"), first.get("path")))
    instruction = str(signature.get("name") or "").strip()
    if not instruction:
        raise ValueError("signature.name is required")
    call_type = str(signature.get("callType") or signature.get("pouType") or "")
    is_fb = call_type == "FunctionBlock" or signature.get("instanceRequirement") == "required"
    # The vendor precompiler namespaces library callables.  A bare block name
    # happens to work for core IEC entries but makes PLCopen imports silently
    # disappear for library entries such as COMMFB.ADDR.  Reuse the exact
    # namespace carried by the live signature for both the declaration and LD
    # block typeName.
    callable_name = callable_type_name(signature)
    if is_fb:
        instance = _validate_identifier(instance or "BlockInstance", "instance")
    elif instance:
        raise ValueError("instance is only valid for a FunctionBlock signature")
    inputs = _port_map(input_values, signature.get("inputs", []), "inputs")
    # InOut is an lvalue contract.  It is never safe to synthesize a literal
    # or a positional placeholder for it.
    inouts = _port_map(inout_values, signature.get("inouts", []), "inouts", lvalue=True)
    outputs = signature.get("outputs", [])
    output_targets = output_targets or {}
    if isinstance(output_targets, (list, tuple)):
        output_targets = dict((item.get("name"), item.get("value"))
                              for item in output_targets if isinstance(item, dict))
    if not isinstance(output_targets, dict):
        raise ValueError("outputs must be an object keyed by exact port name")
    output_ports = []
    for port in outputs:
        port_name = str(port.get("name") or "")
        target = output_targets.get(port_name, "OUT_" + re.sub(r"[^A-Za-z0-9_]", "_", port_name))
        target = _validate_identifier(target, "outputs.%s" % port_name)
        output_ports.append((port_name, str(port.get("type") or ""), target))
    unknown_outputs = sorted(set(str(key) for key in output_targets) -
                             set(str(port.get("name")) for port in outputs))
    if unknown_outputs:
        raise ValueError("outputs contains unknown ports: %s" % ", ".join(unknown_outputs))

    root = ET.Element(_q("project"), {"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"})
    ET.SubElement(root, _q("fileHeader"), {"companyName": "Inovance LAD generator",
                    "productName": "InoProShop", "productVersion": "V1.10.0.3",
                    "creationDateTime": "1970-01-01T00:00:00"})
    header = ET.SubElement(root, _q("contentHeader"), {"name": name,
                    "modificationDateTime": "1970-01-01T00:00:00"})
    coords = ET.SubElement(header, _q("coordinateInfo")); ld_coords = ET.SubElement(coords, _q("ld"))
    ET.SubElement(ld_coords, _q("scaling"), {"x": "1", "y": "1"})
    types = ET.SubElement(root, _q("types")); ET.SubElement(types, _q("dataTypes"))
    pous = ET.SubElement(types, _q("pous")); pou = ET.SubElement(pous, _q("pou"), {"name": name, "pouType": "program"})
    interface = ET.SubElement(pou, _q("interface")); output_vars = ET.SubElement(interface, _q("outputVars")); local_vars = ET.SubElement(interface, _q("localVars"))
    if is_fb:
        var = ET.SubElement(local_vars, _q("variable"), {"name": instance}); typ = ET.SubElement(var, _q("type")); ET.SubElement(typ, _q("derived"), {"name": callable_name})
    for port_name, type_name, _target in inouts:
        var = ET.SubElement(local_vars, _q("variable"), {"name": "IO_" + re.sub(r"[^A-Za-z0-9_]", "_", port_name)})
        typ = ET.SubElement(var, _q("type")); _xml_type(typ, type_name)
    for port_name, type_name, target in output_ports:
        var = ET.SubElement(output_vars, _q("variable"), {"name": target}); typ = ET.SubElement(var, _q("type")); _xml_type(typ, type_name)
    body = ET.SubElement(pou, _q("body")); ld = ET.SubElement(body, _q("LD"))
    left_rail = ET.SubElement(ld, _q("leftPowerRail"), {"localId": "1", "height": "80", "width": "10"})
    ET.SubElement(left_rail, _q("position"), {"x": "20", "y": "20"})
    ET.SubElement(left_rail, _q("connectionPointOut"), {"formalParameter": ""})
    block_attrs = {"localId": "2", "typeName": callable_name}
    if is_fb: block_attrs["instanceName"] = instance
    block = ET.SubElement(ld, _q("block"), block_attrs); ET.SubElement(block, _q("position"), {"x": "80", "y": "40"})
    input_node = ET.SubElement(block, _q("inputVariables")); output_node = ET.SubElement(block, _q("outputVariables")); inout_node = ET.SubElement(block, _q("inOutVariables"))
    next_id = 10
    for port_name, _type_name, value in inputs:
        source_x = 20 + (next_id - 10) * 35
        source = ET.SubElement(ld, _q("inVariable"), {"localId": str(next_id)}); ET.SubElement(source, _q("position"), {"x": str(source_x), "y": "40"})
        source_cp = ET.SubElement(source, _q("connectionPointOut")); ET.SubElement(source_cp, _q("relPosition"), {"x": "30", "y": "0"}); ET.SubElement(source, _q("expression")).text = value
        variable = ET.SubElement(input_node, _q("variable"), {"formalParameter": port_name}); cp = ET.SubElement(variable, _q("connectionPointIn")); ET.SubElement(cp, _q("relPosition"), {"x": "0", "y": str((next_id - 10) * 20)})
        conn = ET.SubElement(cp, _q("connection"), {"refLocalId": str(next_id)}); ET.SubElement(conn, _q("position"), {"x": "80", "y": str(40 + (next_id - 10) * 20)}); ET.SubElement(conn, _q("position"), {"x": str(source_x), "y": "40"})
        next_id += 1
    for port_name, _type_name, _value in inouts:
        variable = ET.SubElement(inout_node, _q("variable"), {"formalParameter": port_name}); ET.SubElement(variable, _q("expression")).text = "IO_" + re.sub(r"[^A-Za-z0-9_]", "_", port_name)
    for port_name, _type_name, target in output_ports:
        variable = ET.SubElement(output_node, _q("variable"), {"formalParameter": port_name}); cp_out = ET.SubElement(variable, _q("connectionPointOut")); ET.SubElement(cp_out, _q("relPosition"), {"x": "80", "y": "30"})
        sink_x = 220 + (next_id - 10) * 35
        sink = ET.SubElement(ld, _q("outVariable"), {"localId": str(next_id)}); ET.SubElement(sink, _q("position"), {"x": str(sink_x), "y": str(20 + (next_id - 10) * 30)})
        sink_cp = ET.SubElement(sink, _q("connectionPointIn")); ET.SubElement(sink_cp, _q("relPosition"), {"x": "0", "y": "0"}); conn = ET.SubElement(sink_cp, _q("connection"), {"refLocalId": "2", "formalParameter": port_name}); ET.SubElement(conn, _q("position"), {"x": str(sink_x), "y": str(20 + (next_id - 10) * 30)}); ET.SubElement(conn, _q("position"), {"x": "160", "y": str(40 + (next_id - 10) * 30)}); ET.SubElement(sink, _q("expression")).text = target
        next_id += 1
    # InoProShop's PLCopen importer expects producers before the box in the
    # LD item sequence. It may accept the XML while dropping the POU from the
    # vendor tree if this ordering is reversed.
    producers = [node for node in list(ld) if node.tag == _q("inVariable")]
    for producer in producers:
        ld.remove(producer)
    block_index = list(ld).index(block)
    for offset, producer in enumerate(producers):
        ld.insert(block_index + offset, producer)
    right_rail = ET.SubElement(ld, _q("rightPowerRail"), {"localId": str(next_id), "height": "80", "width": "10"})
    ET.SubElement(right_rail, _q("position"), {"x": "320", "y": "20"}); right_cp = ET.SubElement(right_rail, _q("connectionPointIn")); ET.SubElement(right_cp, _q("relPosition"), {"x": "0", "y": "0"})
    instances = ET.SubElement(root, _q("instances")); ET.SubElement(instances, _q("configurations"))
    parent = os.path.dirname(os.path.abspath(output_path))
    if not os.path.isdir(parent): os.makedirs(parent)
    ET.ElementTree(root).write(output_path, encoding="utf-8", xml_declaration=True)
    with open(output_path, "rb") as stream: raw = stream.read()
    return {"path": output_path, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(),
            "name": name, "instruction": instruction, "callType": call_type,
            "instance": instance, "inputs": inputs, "inouts": inouts, "outputs": output_ports}
