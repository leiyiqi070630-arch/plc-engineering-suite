# -*- coding: utf-8 -*-
"""Invoked only by the IDE script/execute command, once per bridge request."""
from System import AppDomain
import scriptengine

_host = AppDomain.CurrentDomain.GetData('PLC Engineering Suite.CommandBridgeHost.v1')
if _host is None:
    raise RuntimeError('PLC Engineering Suite command bridge is not initialized')
_host.frame_entry(scriptengine)
