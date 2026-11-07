"""Parse the proven InoProShop native LAD subset into stable semantics."""

from __future__ import print_function

import xml.etree.ElementTree as ET


CONTACT_FLAGS = {0: False, 1: True}
COIL_FLAGS = {0: "normal", 1: "negated", 2: "set", 3: "reset"}
OPERAND_TYPE = "{c9b2f165-48a2-4a45-8326-3952d8a3d708}"
# A BoxInput with a null Input means "use the enclosing expression result".
# It is how the native serializer preserves an edge between independently
# identified boxes after converting PLCopen wires to its expression tree.
IMPLICIT_INPUT_TYPE = "{5f9848d3-568d-4cc5-9e31-8e28e9607ff1}"
# InoProShop stores a shared-root assignment as one NetworkItem.  The item owns
# an Input and a list of independent Tree nodes. This shape is used both for
# BOOL ladder branches and for ordinary data fanout.
ASSIGNMENT_TYPE = "{827b9ec2-2032-40da-9f4e-7670ca2d55a8}"
TREE_TYPE = "{9873c309-1f09-4ebf-9078-42d8057ef11b}"


def _direct(parent, tag, name=None):
    if parent is None:
        return None
    for child in list(parent):
        if child.tag != tag:
            continue
        if name is None or child.get("Name") == name:
            return child
    return None


def _direct_text(parent, name):
    child = _direct(parent, "Single", name)
    if child is None:
        child = _direct(parent, "Null", name)
    return None if child is None else (child.text or "")


def _operand_flags(operand):
    flags = _direct(operand, "Single", "Flags")
    raw = _direct_text(flags, "Flags") if flags is not None else "0"
    return int(raw or "0")


def _as_bool(value):
    return (value or "").strip().lower() == "true"


def _as_int(value, default=None):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _native_type(node):
    """Return a native Type attribute in a comparison-friendly form."""
    return (node.get("Type", "") if node is not None else "").strip().lower()


def _is_native_type(node, native_type):
    return _native_type(node) == native_type.lower()


def _parse_operand_node(node):
    """Read an operand wrapper or a direct native operand node."""
    if node is None:
        return None
    wrapper = node
    if wrapper.get("Type", "").lower() != OPERAND_TYPE.lower():
        wrapper = _direct(node, "Single", "Operand")
    if wrapper is None or wrapper.get("Type", "").lower() != OPERAND_TYPE.lower():
        # Older exports omit Name="Operand" on the typed operand wrapper.
        wrapper = next(
            (child for child in list(node)
             if child.tag == "Single" and _is_native_type(child, OPERAND_TYPE)),
            None,
        )
    if wrapper is None or wrapper.get("Type", "").lower() != OPERAND_TYPE.lower():
        return None
    value_node = _direct(wrapper, "Single", "Operand")
    if value_node is None or value_node.tag == "Null" or value_node.get("Type") != "string":
        return None
    value = value_node.text or ""
    if not value:
        return None
    return {
        "variable": value,
        "type": _direct_text(wrapper, "Type") or value_node.get("Type"),
        "flags": _operand_flags(wrapper),
        "isInstance": _as_bool(_direct_text(wrapper, "IsInstance")),
        "lValue": _as_bool(_direct_text(wrapper, "LValue")),
        "boolean": _as_bool(_direct_text(wrapper, "Boolean")),
        "isCoil": _as_bool(_direct_text(wrapper, "IsCoil")),
        "isSeriesCoil": _as_bool(_direct_text(wrapper, "IsSeriesCoil")),
        "seriesIndex": _as_int(_direct_text(wrapper, "SeriesIndex"), -1),
        "address": _direct_text(wrapper, "Address") or "",
        "comment": _direct_text(wrapper, "Comment") or "",
        "symbolComment": _direct_text(wrapper, "SymbolComment") or "",
        "id": _as_int(_direct_text(wrapper, "Id")),
    }


def _graph_reference(value):
    """Return a small, non-recursive reference to an upstream graph value."""
    if not isinstance(value, dict):
        return None
    kind = value.get("kind")
    if kind == "function_block":
        return {
            "kind": "function_block_output",
            "boxId": value.get("id"),
            "boxType": value.get("boxType") or "",
        }
    if kind == "connection":
        return value.get("source")
    if not kind and value.get("variable") is not None:
        return {
            "kind": "operand",
            "id": value.get("id"),
            "variable": value.get("variable"),
        }
    return {"kind": kind or "graph_value", "id": value.get("id")}


def _parse_implicit_input_node(node, upstream=None):
    if node is None or not _is_native_type(node, IMPLICIT_INPUT_TYPE):
        return None
    input_node = _direct(node, "Single", "Input")
    explicit_input = _parse_graph_value(input_node, upstream) if input_node is not None else None
    return {
        "kind": "connection",
        "implicit": input_node is None,
        "input": explicit_input,
        "source": _graph_reference(explicit_input if explicit_input is not None else upstream),
        "flags": _operand_flags(node) if _direct(node, "Single", "Flags") is not None else 0,
        "id": _as_int(_direct_text(node, "Id")),
    }


def _parse_parameter_list(box, name):
    parameter = _direct(box, "Single", name)
    names_node = _direct(parameter, "List2", "Names")
    types_node = _direct(parameter, "List2", "Types")
    names = []
    types = []
    if names_node is not None:
        names = [(child.text or "") for child in list(names_node)
                 if child.tag == "Single"]
    if types_node is not None:
        types = [(child.text or "") for child in list(types_node)
                 if child.tag == "Single"]
    return [
        {"name": names[index] if index < len(names) else "",
         "type": types[index] if index < len(types) else ""}
        for index in range(max(len(names), len(types)))
    ]


def _parse_box_inputs(box, upstream=None):
    inputs_node = _direct(box, "List2", "InputItems")
    if inputs_node is None:
        return []
    inputs = []
    for index, child in enumerate(list(inputs_node)):
        if child.tag != "Single":
            continue
        value = _parse_graph_value(child, upstream)
        if isinstance(value, dict) and value.get("kind") == "function_block":
            inputs.append({"index": index, "box": value})
            continue
        if isinstance(value, dict) and value.get("kind") == "branch":
            inputs.append({"index": index, "branch": value})
            continue
        if isinstance(value, dict) and value.get("kind") == "connection":
            inputs.append({"index": index, "connection": value})
            continue
        if value is not None:
            inputs.append({"index": index, "operand": value})
    return inputs


def _parse_box_outputs(box):
    outputs_node = _direct(box, "Single", "OutputItems")
    output_list = _direct(outputs_node, "List2", "OutputItems")
    if output_list is None:
        return []
    outputs = []
    for index, child in enumerate(list(output_list)):
        if child.tag == "Null":
            outputs.append({"index": index, "operand": None})
            continue
        value = _parse_graph_value(child)
        entry = {"index": index, "operand": value}
        if isinstance(value, dict) and value.get("kind") == "function_block":
            entry["box"] = value
        elif isinstance(value, dict) and value.get("kind") == "branch":
            entry["branch"] = value
        outputs.append(entry)
    return outputs


def _parse_graph_value(node, upstream=None):
    """Parse a value that may be an operand, box, or nested branch.

    RValue/Input/OutputItems wrappers use the same native value container for
    several different graph node types.  Keep the dispatch in one place so a
    branch can contain ordinary contacts, function boxes, or another branch.
    """
    if node is None or node.tag == "Null":
        return None
    if _is_assignment_node(node):
        return _parse_assignment(node)
    if _is_tree_node(node):
        return _parse_tree(node, upstream=upstream)
    connection = _parse_implicit_input_node(node, upstream)
    if connection is not None:
        return connection
    box = _parse_box(node, upstream)
    if box is not None:
        return box
    operand = _parse_operand_node(node)
    if operand is not None:
        return operand
    # Some serializer versions wrap the actual value in a named Single.  Do
    # not walk arbitrary descendants (which would merge sibling branches),
    # but accept the first direct graph value wrapper.
    for child in list(node):
        if child.tag != "Single":
            continue
        if _is_assignment_node(child):
            return _parse_assignment(child)
        if _is_tree_node(child):
            return _parse_tree(child, upstream=upstream)
        connection = _parse_implicit_input_node(child, upstream)
        if connection is not None:
            return connection
        box = _parse_box(child, upstream)
        if box is not None:
            return box
        operand = _parse_operand_node(child)
        if operand is not None:
            return operand
    return None


def _is_assignment_node(node):
    """Recognize the native branched-assignment node.

    The GUID is authoritative.  The structural fallback handles exports from
    older vendor builds that omit Type on a network item but still emit the
    distinctive Input/Trees shape.
    """
    if node is None:
        return False
    if _is_native_type(node, ASSIGNMENT_TYPE):
        return True
    return (
        _direct(node, "List2", "Trees") is not None
        and _direct(node, "Single", "Input") is not None
        and not _direct_text(node, "CallType")
        and not _direct_text(node, "BoxType")
    )


def _is_tree_node(node):
    """Recognize a standalone native Tree value used by older exports."""
    if node is None:
        return False
    if _is_native_type(node, TREE_TYPE):
        return True
    return (
        _direct(node, "Single", "RValue") is not None
        and (_direct(node, "Single", "OutputItems") is not None
             or _direct(node, "List2", "OutputItems") is not None)
    )


def _parse_tree_outputs(tree, upstream=None):
    """Return positional output values and their native index metadata."""
    outputs_node = _direct(tree, "Single", "OutputItems")
    output_list = _direct(outputs_node, "List2", "OutputItems")
    # A few serializer versions put the List2 directly on the tree.
    if output_list is None:
        output_list = _direct(tree, "List2", "OutputItems")
    values = []
    entries = []
    if output_list is None:
        return values, entries
    for index, child in enumerate(list(output_list)):
        if child.tag == "Null":
            value = None
        else:
            value = _parse_graph_value(child, upstream)
        values.append(value)
        entry = {"index": index, "value": value}
        # Keep the established box-output spelling where possible.  Consumers
        # that need a branch's bare operands can use ``outputs`` directly.
        if isinstance(value, dict) and value.get("kind") == "function_block":
            entry["box"] = value
            entry["operand"] = None
        elif isinstance(value, dict) and value.get("kind") == "branch":
            entry["branch"] = value
            entry["operand"] = None
        else:
            entry["operand"] = value
        entries.append(entry)
    return values, entries


def _parse_tree(tree, index=None, upstream=None):
    """Parse one independent assignment branch (a native ``Tree`` node)."""
    rvalue_node = _direct(tree, "Single", "RValue")
    rvalue = _parse_graph_value(rvalue_node, upstream)
    contact_node = _direct(tree, "Single", "Operand")
    direct_contact = (rvalue_node is None and contact_node is not None
                      and _as_bool(_direct_text(tree, "IsContact")))
    if direct_contact:
        # Native contact legs in Trees store Operand directly, whereas
        # assignment legs use RValue. Preserve the leg instead of emitting
        # an apparently complete branch with a null input.
        rvalue = _parse_operand_node(contact_node)
    outputs, output_items = _parse_tree_outputs(tree, rvalue)

    nested_trees_node = _direct(tree, "List2", "Trees")
    nested_trees = []
    if nested_trees_node is not None:
        for nested_index, child in enumerate(list(nested_trees_node)):
            if child.tag == "Single":
                nested_trees.append(_parse_tree(child, nested_index, rvalue))

    parsed = {
        "kind": "branch_tree",
        "index": index,
        # ``rValue`` is the legacy alias of the semantic input; contact legs
        # obtain that value from the vendor Operand field instead.
        "input": rvalue,
        "rValue": rvalue,
        "outputs": outputs,
        "outputItems": output_items,
        "outputCount": len(output_items),
        "nestedTrees": nested_trees,
        "flags": _operand_flags(tree) if _direct(tree, "Single", "Flags") is not None else 0,
        "id": _as_int(_direct_text(tree, "Id")),
    }
    if rvalue_node is not None:
        parsed["isContact"] = _as_bool(_direct_text(rvalue_node, "IsContact"))
    elif direct_contact:
        parsed["isContact"] = True
    return parsed


def _parse_assignment(node):
    """Parse a native branched assignment and all of its independent trees."""
    input_node = _direct(node, "Single", "Input")
    input_value = _parse_graph_value(input_node)
    trees_node = _direct(node, "List2", "Trees")
    branches = []
    if trees_node is not None:
        for index, child in enumerate(list(trees_node)):
            if child.tag == "Single":
                branches.append(_parse_tree(child, index, input_value))
    return {
        "kind": "branch",
        "mode": _direct_text(node, "Mode") or "",
        "input": input_value,
        "branches": branches,
        "branchCount": len(branches),
        "id": _as_int(_direct_text(node, "Id")),
    }


def _parse_box(box, upstream=None):
    call_type = _direct_text(box, "CallType")
    box_type = _direct_text(box, "BoxType")
    if not call_type and not box_type:
        return None
    # The vendor serializer emits a placeholder Instance node for ordinary
    # functions. It is not a callable FB instance and must not be surfaced as
    # one; only FunctionBlock signatures have an IEC instance operand.
    instance = (
        _parse_operand_node(_direct(box, "Single", "Instance"))
        if call_type == "FunctionBlock" else None
    )
    parsed = {
        "kind": "function_block",
        "callType": call_type or "",
        "boxType": box_type or "",
        "isBoxType": _as_bool(_direct_text(box, "IsBoxType")),
        "enabled": _as_bool(_direct_text(box, "EN")),
        "enabledOutput": _as_bool(_direct_text(box, "ENO")),
        "instance": instance,
        "inputs": _parse_box_inputs(box, upstream),
        "outputs": _parse_box_outputs(box),
        "inputParams": _parse_parameter_list(box, "InputParam"),
        "outputParams": _parse_parameter_list(box, "OutputParam"),
        "id": _as_int(_direct_text(box, "Id")),
    }
    parsed["boxCount"] = 1 + sum(
        entry["box"].get("boxCount", 1)
        for entry in parsed["inputs"] if "box" in entry
    )
    return parsed


def _box_counts(box):
    counts = {
        "boxCount": 1,
        "functionBlockCount": 1 if box.get("callType") == "FunctionBlock" else 0,
        "standardFunctionCount": 0 if box.get("callType") == "FunctionBlock" else 1,
    }
    for entry in box.get("inputs") or []:
        nested = entry.get("box")
        if nested is None:
            continue
        nested_counts = _box_counts(nested)
        for key, value in nested_counts.items():
            counts[key] += value
    return counts


def _graph_counts(value):
    """Count boxes/functions nested in any parsed graph value."""
    counts = {"boxCount": 0, "functionBlockCount": 0,
              "standardFunctionCount": 0}
    if not isinstance(value, dict):
        return counts
    kind = value.get("kind")
    if kind == "function_block":
        nested = _box_counts(value)
        for key in counts:
            counts[key] += nested.get(key, 0)
        # A branch may be embedded as an input/output of a box.  _box_counts
        # intentionally handles the historical ``box`` entries only, so walk
        # explicit branch entries here as well.
        for entry in value.get("inputs") or []:
            branch = entry.get("branch")
            if branch is not None:
                child_counts = _graph_counts(branch)
                for key in counts:
                    counts[key] += child_counts[key]
        for entry in value.get("outputs") or []:
            branch = entry.get("branch")
            if branch is not None:
                child_counts = _graph_counts(branch)
                for key in counts:
                    counts[key] += child_counts[key]
        return counts
    if kind == "branch":
        child_counts = _graph_counts(value.get("input"))
        for key in counts:
            counts[key] += child_counts[key]
        for tree in value.get("branches") or []:
            child_counts = _graph_counts(tree)
            for key in counts:
                counts[key] += child_counts[key]
        return counts
    if kind in ("branch_tree", "assignment"):
        child_counts = _graph_counts(value.get("rValue"))
        for key in counts:
            counts[key] += child_counts[key]
        for output in value.get("outputs") or []:
            child_counts = _graph_counts(output)
            for key in counts:
                counts[key] += child_counts[key]
        for nested_tree in value.get("nestedTrees") or []:
            child_counts = _graph_counts(nested_tree)
            for key in counts:
                counts[key] += child_counts[key]
        return counts
    return counts


def _parse_item(item):
    contacts = []
    coils = []
    for operand in item.iter("Single"):
        if operand.get("Type", "").lower() != OPERAND_TYPE:
            continue
        variable_node = _direct(operand, "Single", "Operand")
        if variable_node is None or variable_node.get("Type") != "string":
            continue
        variable = variable_node.text or ""
        if not variable:
            continue
        is_coil = (_direct_text(operand, "IsCoil") or "").lower() == "true"
        flags = _operand_flags(operand)
        if is_coil:
            coils.append({
                "variable": variable,
                "mode": COIL_FLAGS.get(flags, "unsupported_flag_%d" % flags),
                "flags": flags,
            })
        else:
            contacts.append({
                "variable": variable,
                "negated": CONTACT_FLAGS.get(flags),
                "flags": flags,
            })
    return {"contacts": contacts, "coils": coils}


def _is_boolean_rung_tree(tree, parsed_item):
    """Distinguish a BOOL expression rung from a normal data assignment."""
    if tree is None or len(parsed_item.get("coils") or []) != 1:
        return False
    outputs = [value for value in tree.get("outputs") or [] if value is not None]
    return (
        len(outputs) == 1
        and isinstance(outputs[0], dict)
        and outputs[0].get("boolean") is True
        and outputs[0].get("isCoil") is True
    )


def parse_native_lad(path):
    root = ET.parse(path).getroot()
    meta = root.find(".//Single[@Name='MetaObject']")
    if meta is None:
        raise ValueError("native XML does not contain an InoProShop MetaObject")
    object_name = _direct_text(meta, "Name")
    object_guid = _direct_text(meta, "Guid")
    network_list = root.find(".//List2[@Name='NetworkList']")
    if network_list is None:
        raise ValueError("native XML does not contain an InoProShop LAD NetworkList")

    rungs = []
    network_items = []
    native_network_count = 0
    network_item_count = 0
    box_count = 0
    function_block_count = 0
    standard_function_count = 0
    assignment_count = 0
    branch_count = 0
    branch_output_count = 0
    for network in list(network_list):
        if network.tag != "Single":
            continue
        native_network_count += 1
        items = _direct(network, "List2", "NetworkItems")
        if items is None:
            continue
        for item in list(items):
            if item.tag != "Single":
                continue
            network_item_count += 1
            assignment = _parse_assignment(item) if _is_assignment_node(item) else None
            if assignment is not None:
                network_items.append(assignment)
                assignment_count += 1
                branch_count += assignment.get("branchCount", 0)
                branch_output_count += sum(
                    tree.get("outputCount", 0)
                    for tree in assignment.get("branches") or []
                )
                counts = _graph_counts(assignment)
                box_count += counts["boxCount"]
                function_block_count += counts["functionBlockCount"]
                standard_function_count += counts["standardFunctionCount"]
                continue
            tree = _parse_tree(item) if _is_tree_node(item) else None
            tree_counts = _graph_counts(tree) if tree is not None else None
            if tree is not None and tree_counts["boxCount"]:
                parsed = _parse_item(item)
                if _is_boolean_rung_tree(tree, parsed):
                    rung = {
                        "contacts": parsed["contacts"],
                        "coil": parsed["coils"][0],
                    }
                    rungs.append(rung)
                    network_items.append({
                        "kind": "rung",
                        "contacts": rung["contacts"],
                        "coil": rung["coil"],
                        "expression": tree["rValue"],
                        "assignment": tree,
                    })
                    box_count += tree_counts["boxCount"]
                    function_block_count += tree_counts["functionBlockCount"]
                    standard_function_count += tree_counts["standardFunctionCount"]
                    continue
                # A normal data assignment is serialized as Tree(RValue=Box,
                # OutputItems=...). Parsing descendants as contacts/coils
                # silently turns the box into a malformed rung.
                tree["kind"] = "assignment"
                network_items.append(tree)
                assignment_count += 1
                box_count += tree_counts["boxCount"]
                function_block_count += tree_counts["functionBlockCount"]
                standard_function_count += tree_counts["standardFunctionCount"]
                continue
            box = _parse_box(item)
            if box is not None:
                network_items.append(box)
                counts = _box_counts(box)
                box_count += counts["boxCount"]
                function_block_count += counts["functionBlockCount"]
                standard_function_count += counts["standardFunctionCount"]
                continue
            parsed = _parse_item(item)
            if len(parsed["coils"]) == 1:
                rungs.append({
                    "contacts": parsed["contacts"],
                    "coil": parsed["coils"][0],
                })
                network_items.append({
                    "kind": "rung",
                    "contacts": parsed["contacts"],
                    "coil": parsed["coils"][0],
                })
                continue

            # A function-box network can be exported without a coil.  Some
            # standard operators (notably AND and OR) are reduced to a native
            # network item with no BoxType on readback. Preserve that item so
            # callers can inspect the loss instead of treating it as a rung.
            network_items.append({
                "kind": "unclassified_network_item",
                "contacts": parsed["contacts"],
                "coils": parsed["coils"],
                "coilCount": len(parsed["coils"]),
                "warning": "network item has no recognized box and does not contain exactly one coil",
            })

    return {
        "name": object_name,
        "guid": object_guid,
        "nativeNetworkCount": native_network_count,
        "networkItemCount": network_item_count,
        "contactCount": sum(len(rung["contacts"]) for rung in rungs),
        "coilCount": len(rungs),
        "boxCount": box_count,
        "functionBlockCount": function_block_count,
        "standardFunctionCount": standard_function_count,
        "assignmentCount": assignment_count,
        "branchCount": branch_count,
        "branchOutputCount": branch_output_count,
        "unclassifiedNetworkItemCount": sum(
            item.get("kind") == "unclassified_network_item"
            for item in network_items
        ),
        "rungs": rungs,
        "networkItems": network_items,
    }


def expected_lad_semantics(plan):
    rungs = []
    for network in plan.get("networks") or []:
        for rung in network.get("rungs") or []:
            rungs.append({
                "contacts": [
                    {
                        "variable": contact.get("variable"),
                        "negated": bool(contact.get("negated", False)),
                    }
                    for contact in rung.get("contacts") or []
                ],
                "coil": {
                    "variable": (rung.get("coil") or {}).get("variable"),
                    "mode": (rung.get("coil") or {}).get("mode", "normal"),
                },
            })
    return {"name": plan.get("name"), "rungs": rungs}


def compare_lad_semantics(plan, actual):
    expected = expected_lad_semantics(plan)
    actual_rungs = []
    unsupported_flags = []
    for rung_index, rung in enumerate(actual.get("rungs") or []):
        contacts = []
        for contact_index, contact in enumerate(rung.get("contacts") or []):
            if contact.get("negated") is None:
                unsupported_flags.append({
                    "rung": rung_index,
                    "contact": contact_index,
                    "flags": contact.get("flags"),
                })
            contacts.append({
                "variable": contact.get("variable"),
                "negated": contact.get("negated"),
            })
        coil = rung.get("coil") or {}
        if str(coil.get("mode", "")).startswith("unsupported_flag_"):
            unsupported_flags.append({
                "rung": rung_index,
                "coil": True,
                "flags": coil.get("flags"),
            })
        actual_rungs.append({
            "contacts": contacts,
            "coil": {
                "variable": coil.get("variable"),
                "mode": coil.get("mode"),
            },
        })
    differences = []
    if actual.get("name") != expected["name"]:
        differences.append({
            "field": "name",
            "expected": expected["name"],
            "actual": actual.get("name"),
        })
    if actual_rungs != expected["rungs"]:
        differences.append({
            "field": "rungs",
            "expected": expected["rungs"],
            "actual": actual_rungs,
        })
    if actual.get("networkItemCount") != len(expected["rungs"]):
        differences.append({
            "field": "networkItemCount",
            "expected": len(expected["rungs"]),
            "actual": actual.get("networkItemCount"),
        })
    return {
        "matches": not differences and not unsupported_flags,
        "expected": expected,
        "differences": differences,
        "unsupportedFlags": unsupported_flags,
    }
