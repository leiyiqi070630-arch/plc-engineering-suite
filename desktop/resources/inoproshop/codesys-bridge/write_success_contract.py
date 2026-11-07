"""Fail-closed success gates for public project writers.

This module intentionally stays compatible with IronPython 2.7 so the
resident bridge and the Python 3 MCP boundary enforce the same contract.
Only work promised by the individual operation is gated here.  A writer that
documents save or compile as a separate operation is not rejected merely
because those later gates have not run.
"""

try:
    _NUMBER_TYPES = (int, long, float)
except NameError:
    _NUMBER_TYPES = (int, float)


_POU_CHILD_CREATE_CONTRACT = {
    "true": (
        "created", "modelReadback", "exactNameReadback",
        "exactPathReadback", "guidReadback", "requestedTextReadback",
        "mutatedProject",
    ),
    "nonempty": (
        "name", "path", "guid", "createdGuid", "creationBinding",
        "readback",
    ),
    "same": (
        ("guid", "createdGuid"),
        ("readback.object.guid", "guid"),
        ("readback.object.name", "name"),
        ("readback.object.path", "path"),
    ),
}


PUBLIC_WRITE_SUCCESS_CONTRACTS = {
    "alarm.item.create": {
        "true": ("mutatedProject", "exactReadback"),
        "nonempty": (
            "alarm.id", "alarm.observation.expression",
            "alarm.observation.expressionToCompare", "alarm.alarmClass.guid",
            "after.guid", "groupBinding.nativeGuid",
            "alarmClassBinding.nativeGuid",
        ),
        "same": (
            ("alarm.id", "input.id"),
            ("alarm.observation.expression", "input.expression"),
            ("alarm.observation.expressionToCompare",
             "input.expressionToCompare"),
            ("alarm.alarmClass.guid", "alarmClassBinding.nativeGuid"),
            ("after.guid", "groupBinding.nativeGuid"),
        ),
        "if_present_same": (
            ("alarm.deactivation", "input.optionalFields.deactivation"),
            ("alarm.minPendingTime", "input.optionalFields.minPendingTime"),
            ("alarm.latchVariable1", "input.optionalFields.latchVariable1"),
            ("alarm.latchVariable2", "input.optionalFields.latchVariable2"),
            ("alarm.higherPrioAlarm", "input.optionalFields.higherPrioAlarm"),
        ),
    },
    "device.config.io.add": {
        "true": ("executed", "mutatedProject"),
        "equals": (("status", "committed_same_process"),),
        "status_contracts": {
            "preflight_ready": {
                "true": (
                    "parentGuidPreflight.valid",
                    "parentGuidPreflight.existsInObjectManager",
                ),
                "equals": (
                    ("executed", False),
                    ("mutatedProject", False),
                ),
                "nonempty": ("parentGuidPreflight.guid",),
            },
        },
    },
    "dut.create": {
        "true": ("text.declaration.canonicalMatch",),
        "nonempty": ("name", "guid"),
    },
    "gvl.create": {
        "true": ("text.declaration.canonicalMatch",),
        "nonempty": ("name", "guid"),
    },
    "lad.create": {
        "true": ("treeVisible", "saved"),
        "equals": (("status", "ready"),),
    },
    "library.add": {
        "true": ("exactReadback", "claims.targetInstalled",
                 "claims.readback"),
        "nonempty": ("name", "requestedResolution", "matchedReference"),
        "any_true": (("added", "alreadyPresent"),),
    },
    "library.placeholder.set_redirection": {
        "true": ("exactReadback", "claims.placeholderPresent",
                 "claims.targetInstalled", "claims.readback"),
        "nonempty": ("placeholder", "resolution", "placeholderReference"),
        "any_true": (("changed", "alreadyRedirected"),),
    },
    "library.remove": {
        "true": ("absenceReadback",),
        "nonempty": ("name",),
        "equals": (("targetState", "absent"),),
        "any_true": (("removed", "alreadyAbsent"),),
    },
    "library.update": {
        "true": ("exactReadback", "claims.exactResolution",
                 "claims.targetInstalled", "claims.readback"),
        "nonempty": ("name", "resolution", "matchedReference"),
        "any_true": (("updated", "alreadyCurrent"),),
    },
    "object.create_folder": {
        "true": ("created", "modelReadback"),
        "nonempty": ("guid", "path"),
    },
    "object.delete": {
        "true": ("deleted", "absenceReadback"),
        "nonempty": ("guid", "path"),
    },
    "object.rename": {
        "true": ("renamed", "exactReadback"),
        "nonempty": ("guid", "newPath"),
    },
    "pou.add_symbol_pragma": {
        "true": (
            "readback.pragmaRetained", "readback.declarationCanonicalMatch",
            "readback.target.exactPath", "readback.target.guidMatch",
            "claims.declarationTextReadback", "claims.exactTargetReadback",
            "claims.rollbackOnFailure",
        ),
        "nonempty": ("target", "targetGuid", "readback.target.path",
                     "readback.target.guid"),
        "same": (
            ("readback.target.path", "target"),
            ("readback.target.guid", "targetGuid"),
            ("readback.variable.name", "input.variable"),
            ("readback.variable.pragma", "mutation.pragma"),
        ),
    },
    "pou.add_variable": {
        "true": (
            "readback.exactOneMatch", "readback.declarationCanonicalMatch",
            "readback.target.exactPath", "readback.target.guidMatch",
            "claims.declarationTextReadback", "claims.exactTargetReadback",
            "claims.rollbackOnFailure",
        ),
        "nonempty": ("target", "targetGuid", "readback.target.path",
                     "readback.target.guid"),
        "same": (
            ("readback.target.path", "target"),
            ("readback.target.guid", "targetGuid"),
            ("readback.variable.name", "input.variable"),
            ("readback.variable.type", "input.type"),
        ),
    },
    "pou.create": {
        "true": ("created",),
        "nonempty": ("name", "readback"),
    },
    "pou.create_action": _POU_CHILD_CREATE_CONTRACT,
    "pou.create_method": _POU_CHILD_CREATE_CONTRACT,
    "pou.create_property": _POU_CHILD_CREATE_CONTRACT,
    "pou.create_transition": _POU_CHILD_CREATE_CONTRACT,
    "pou.upsert": {"nonempty": ("readback",)},
    "project.import_native": {"true": ("imported",)},
    "project.import_xml": {"true": ("imported",)},
    "project.prepare_vendor_project": {
        "true": (
            "preparedProjectSaved",
            "claims.vendorWizardExecuted",
            "claims.libraryVersionUpdateExecuted",
            "claims.listLibVerified",
            "claims.placeholderResolutionVerified",
            "claims.projectSaved",
        ),
        "equals": (("status", "ready"),),
        "nonempty": (
            "savedProject.path", "savedProject.bytes", "created",
            "libraryUpdate", "libOptions", "placeholders", "tree", "devices",
        ),
    },
    "project.save": {"true": ("saved",)},
    "project.save_archive": {"true": ("savedArchive",), "positive": ("bytes",)},
    "project.save_as": {
        "true": ("savedAs",),
        "same_path": (("projectPath", "requestedPath"),),
    },
    "project.set_info": {
        "true": ("updated", "claims.nativeSetter", "claims.exactReadback"),
    },
    # Compatibility source writers are real mutations even though they are
    # not on the curated default MCP surface.  Keep their postconditions in
    # the shared normalizer so aliases cannot report optimistic success.
    "source.import": {
        "positive": ("count",),
        "nonempty": ("pous",),
    },
    "source.export": {
        "true": ("exported",),
        "nonempty": ("path",),
    },
    "roundtrip.verify": {
        "true": (
            "save.saved", "close.closed",
            "build.compileOk", "persistedBuild.compileOk",
        ),
        "nonempty": ("projectPath", "readback", "persistedReadback"),
        "equals": (
            ("build.compileStatus", "success"),
            ("persistedBuild.compileStatus", "success"),
        ),
    },
    "recipe.create": {
        "true": (
            "mutatedProject", "exactReadback", "countReadback",
            "valueAlignmentReadback",
        ),
        "nonempty": ("recipe.Name", "recipe.Id", "recipe.runtimeType"),
        "positive": ("recipe.valueCount",),
        "same": (
            ("recipe.Name", "input.name"),
            ("recipe.valueCount", "after.variableCount"),
            ("after.binding.guid", "before.binding.guid"),
        ),
    },
    "recipe.value.set": {
        "true": ("selectorReadback", "exactReadback"),
        "nonempty": ("after.binding.guid",),
        "same": (
            ("afterValue", "input.value"),
            ("after.binding.guid", "before.binding.guid"),
        ),
    },
    "recipe.variable.add": {
        "true": (
            "mutatedProject", "exactReadback", "countReadback",
            "typeResolved",
        ),
        "nonempty": (
            "variable.Name", "variable.VariableName", "variable.Type",
            "variable.TypeAsString", "after.binding.guid",
        ),
        "same": (
            ("variable.Name", "input.name"),
            ("variable.VariableName", "input.variableName"),
            ("after.binding.guid", "before.binding.guid"),
        ),
        "if_present_same": (("variable.Comment", "input.comment"),),
    },
    "symbol.configure": {
        "true": ("committed", "mutatedProject", "exactReadback"),
        "nonempty": ("binding.guid", "binding.path", "after.guid"),
        "same": (
            ("readbackSettings", "input.settings"),
            ("after.guid", "before.guid"),
            ("after.guid", "binding.guid"),
        ),
    },
    "symbol.create_config": {
        "true": (
            "created", "mutatedProject",
            "creation.modelVisibility.present",
            "exactSettingsReadback",
        ),
        "equals": ((
            "nativeReadback.objectRuntimeType",
            "Inovance.InoPro.InoSymbolObject.SymbolConfigObject",
        ),),
        "nonempty": (
            "creation.createdGuid", "creation.treePath",
            "nativeReadback.guid",
        ),
        "same": (
            ("creation.createdGuid", "nativeReadback.guid"),
            ("creation.treePath", "nativeReadback.path"),
            ("readbackSettings", "input.settings"),
        ),
        "if_present_true": ("settingsCommit.committed",),
    },
    "task.create": {"true": ("created",), "present": ("task",)},
    "task.pou.set": {"true": ("exactReadback",)},
    "task.set": {"true": ("exactReadback",), "present": ("changed",)},
    "trace.configure": {
        "true": ("committed", "mutatedProject", "exactReadback"),
        "nonempty": ("binding.guid", "binding.path", "after.guid"),
        "same": (
            ("readbackSettings", "input.settings"),
            ("after.guid", "before.guid"),
            ("after.guid", "binding.guid"),
        ),
    },
    "trace.variable.add": {
        "true": (
            "committed", "mutatedProject", "exactVariableReadback",
            "countReadback",
        ),
        "nonempty": (
            "binding.guid", "binding.path", "variable.guid",
            "variable.variableName",
        ),
        "positive": ("afterVariableCount",),
        "same": (("variable.variableName", "input.expression"),),
    },
    "vendor.editor.page.parameter.write": {
        "true": ("committed", "mutatedProject"),
    },
    "vendor.editor.page.parameter.write.ethercat_source_mac": {
        "equals": (("status", "editor_page_direct_commit"),),
        "true": ("committed", "mutatedProject", "directCommit.called"),
    },
    "vendor.ethercat.port.enable": {
        "true": ("mutatedProject", "configurationSave"),
        "equals": (("status", "enabled_same_process_persistence_unverified"),),
        "status_contracts": {
            "already_enabled": {
                "equals": (
                    ("beforeBusType", "DBT_ETHERCAT"),
                    ("mutatedProject", False),
                ),
            },
        },
    },
    "vendor.ethercat.slave.add": {
        "true": ("mutatedProject", "configurationSave", "executeReturn"),
        "equals": (("status", "added_same_process_persistence_unverified"),),
        "nonempty": ("identity.id", "identity.version", "identity.deviceName"),
    },
    "vendor.io.mapping.add": {
        "true": ("retained", "committed", "mutatedProject"),
        # An exact repeat of an already-present EtherCAT mapping is a
        # deliberate, read-only idempotent success. The writer must not dirty
        # the project or call Save(true) a second time, so it cannot satisfy
        # the normal mutation gates above. Select a narrow status contract
        # instead of turning this safe no-op into a retry-triggering
        # write_success_unproven error at the resident response boundary.
        "status_contracts": {
            "unchanged": {
                "true": ("retained",),
                "equals": (
                    ("committed", False),
                    ("mutatedProject", False),
                ),
                "nonempty": ("variable", "pdoEntry", "mappingLocation"),
            },
        },
    },
    "vendor.libversion.update": {
        "allowed": (("status", ("already_current", "update_applied")),),
        "status_contracts": {
            "already_current": {
                "true": (
                    "initializeCalled", "claims.officialRouteCompleted",
                    "claims.initializeCalled",
                    "claims.beforeSnapshotReadback",
                    "claims.afterSnapshotReadback",
                ),
                "equals": (
                    ("initialize", False),
                    ("saveControlsCalled", False),
                    ("mutated", False),
                ),
                "nonempty": ("before", "after"),
            },
            "update_applied": {
                "true": (
                    "initialize", "initializeCalled", "saveControlsCalled",
                    "mutated", "claims.officialRouteCompleted",
                    "claims.initializeCalled",
                    "claims.beforeSnapshotReadback",
                    "claims.afterSnapshotReadback",
                ),
                "nonempty": ("before", "after"),
            },
        },
    },
    "vendor.pid.parameter.write": {
        "true": (
            "committed", "mutatedProject",
            "validation.runtimeWriteVerified",
        ),
    },
    "vendor.protocol.canopen.master.parameter.write": {
        "true": ("committed", "mutatedProject"),
    },
    "vendor.protocol.device.add": {
        "true": (
            "created", "executed", "mutatedProject",
            "configurationSave", "projectSaveCompleted",
        ),
        "equals": (("status", "added_same_process_readback"),),
        "nonempty": ("projectPath", "after.newDevicePaths"),
    },
    "vendor.protocol.ethernet_ip.configure": {
        "true": ("mutatedProject",),
        "equals": (
            ("status", "committed_same_process_requires_restart_gate"),
        ),
        "nonempty": ("target", "changes", "readback"),
    },
    "vendor.protocol.ethernet_ip.mapping": {
        "allowed": (("status", (
            "committed", "already_present", "already_absent",
        )),),
        "status_contracts": {
            "committed": {
                "true": (
                    "mutationAttempted", "mutatedProject", "landed",
                    "exactReadback",
                ),
                "equals": (("status", "committed"),),
                "nonempty": ("target", "variable", "assembly"),
            },
            "already_present": {
                "true": ("alreadyPresent", "landed", "exactReadback"),
                "equals": (
                    ("status", "already_present"),
                    ("mutationAttempted", False),
                    ("mutatedProject", False),
                ),
                "nonempty": ("target", "variable", "assembly"),
            },
            "already_absent": {
                "true": ("alreadyAbsent", "landed", "exactReadback"),
                "equals": (
                    ("status", "already_absent"),
                    ("mutationAttempted", False),
                    ("mutatedProject", False),
                ),
                "nonempty": ("target", "variable", "assembly"),
            },
        },
    },
    "vendor.protocol.modbus.channel.configure": {
        "allowed": (("status", (
            "added_same_process_readback", "updated_same_process_readback",
        )),),
        "status_contracts": {
            "added_same_process_readback": {
                "true": ("mutatedProject", "sameProcessRetained"),
                "equals": (("status", "added_same_process_readback"),),
                "nonempty": ("target", "input", "after", "configuredRow"),
            },
            "updated_same_process_readback": {
                "true": ("mutatedProject", "sameProcessRetained"),
                "equals": (("status", "updated_same_process_readback"),),
                "nonempty": ("target", "input", "after", "configuredRow"),
            },
        },
    },
    "vendor.protocol.modbus.channel.remove": {
        "true": ("mutatedProject", "sameProcessRetained"),
        "equals": (("status", "removed_same_process_readback"),),
        "nonempty": ("target", "after", "removedRow", "removals"),
        "present": ("channelNo",),
    },
    "vendor.protocol.modbus.tcp_slave.parameter.write": {
        "true": ("committed", "mutatedProject"),
    },
    "vendor.protocol.port.enable": {
        "true": ("mutatedProject", "configurationSave", "projectSaveCompleted"),
        "equals": (("status", "enabled_same_process_persistence_unverified"),),
        "status_contracts": {
            "already_enabled": {
                "true": ("portInventoryVerdict.supported",),
                "equals": (("mutatedProject", False),),
                "nonempty": ("before.busType",),
            },
        },
    },
    "vendor.softmotion.axis.add": {
        "true": (
            "mutatedProject", "mutationBoundaryCrossed", "exactReadback",
            "readback.newTreeObject", "claims.targetEthercatSlave",
            "claims.axisIdentityReadback", "claims.newTreeObject",
        ),
        "any_true": (("connectorPresentAfterCommit", "connectorPresentAfterCall"),),
        "equals": (
            ("status", "committed_same_process"),
            ("processDiscardRequired", False),
            ("readback.axisDeviceType", 1027),
            ("readback.version", "4.0.0.0"),
        ),
        "same": (("readback.axisDeviceId", "inputs.axisDeviceId"),),
        "nonempty": ("target", "readback.path"),
    },
    "visual.element.create": {
        "true": (
            "immediateReadback", "committed", "mutatedProject",
            "exactBindingReadback", "exactInstanceReadback",
            "elementCountReadback",
        ),
        "nonempty": ("guid", "instanceName"),
        "same": (
            ("after.instanceName", "input.instanceName"),
            ("after.members.variable.value", "input.bindings.variable"),
        ),
    },
    "visual.page.create": {
        "true": ("pageTransaction.generatedGlobalTextListDeleted",
                 "pageTransaction.remainingTreeReadback",
                 "modelVisibility.present", "exactPageReadback"),
        "nonempty": ("createdGuid", "treePath"),
        "same": (
            ("createdGuid", "object.guid"),
            ("treePath", "object.path"),
            ("object.name", "input.name"),
        ),
    },
}


def _path_value(data, path):
    current = data
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return False, None
        current = current[part]
    return True, current


def _issue(operation, path, expected, actual):
    return {
        "code": "write_success_gate_failed",
        "operation": operation,
        "path": "data." + path,
        "expected": expected,
        "actual": actual,
        "message": "writer did not prove its required success gate: " + path,
    }


def write_success_issues(operation, data):
    """Return explicit missing/false success gates for a public writer."""
    contract = PUBLIC_WRITE_SUCCESS_CONTRACTS.get(operation)
    if contract is None:
        return []
    if not isinstance(data, dict):
        return [_issue(operation, "$", "object", type(data).__name__)]
    status_contract = contract.get("status_contracts", {}).get(
        data.get("status"))
    if status_contract is not None:
        contract = status_contract
    issues = []
    for path in contract.get("true", ()):
        present, value = _path_value(data, path)
        if not present or value is not True:
            issues.append(_issue(operation, path, True, value))
    for path in contract.get("present", ()):
        present, value = _path_value(data, path)
        if not present or value is None:
            issues.append(_issue(operation, path, "present and non-null", value))
    for path in contract.get("nonempty", ()):
        present, value = _path_value(data, path)
        if (not present or value is None or value is False or value == "" or
                value == [] or value == {}):
            issues.append(_issue(operation, path, "present and non-empty", value))
    for path in contract.get("positive", ()):
        present, value = _path_value(data, path)
        if (not present or isinstance(value, bool) or
                not isinstance(value, _NUMBER_TYPES) or value <= 0):
            issues.append(_issue(operation, path, "positive number", value))
    for path, expected in contract.get("equals", ()):
        present, value = _path_value(data, path)
        if not present or value != expected:
            issues.append(_issue(operation, path, expected, value))
    for path, expected_values in contract.get("allowed", ()):
        present, value = _path_value(data, path)
        if not present or value not in expected_values:
            issues.append(_issue(
                operation, path, "one of " + repr(tuple(expected_values)), value))
    for left_path, right_path in contract.get("same", ()):
        left_present, left = _path_value(data, left_path)
        right_present, right = _path_value(data, right_path)
        if not left_present or not right_present or left != right:
            issues.append(_issue(
                operation, left_path, "equal to data." + right_path, left))
    for left_path, right_path in contract.get("if_present_same", ()):
        right_present, right = _path_value(data, right_path)
        if not right_present or right is None:
            continue
        left_present, left = _path_value(data, left_path)
        if not left_present or left != right:
            issues.append(_issue(
                operation, left_path, "equal to data." + right_path, left))
    for left_path, right_path in contract.get("same_path", ()):
        left_present, left = _path_value(data, left_path)
        right_present, right = _path_value(data, right_path)
        try:
            import os
            same = (left_present and right_present and left is not None and
                    right is not None and os.path.normcase(os.path.abspath(left)) ==
                    os.path.normcase(os.path.abspath(right)))
        except Exception:
            same = False
        if not same:
            issues.append(_issue(
                operation, left_path, "same path as data." + right_path, left))
    for paths in contract.get("any_true", ()):
        values = []
        passed = False
        for path in paths:
            _present, value = _path_value(data, path)
            values.append(value)
            passed = passed or value is True
        if not passed:
            issues.append(_issue(
                operation, "|".join(paths), "at least one true", values))
    for path in contract.get("if_present_true", ()):
        present, value = _path_value(data, path)
        if present and value is not None and value is not True:
            issues.append(_issue(operation, path, True, value))
    return issues
