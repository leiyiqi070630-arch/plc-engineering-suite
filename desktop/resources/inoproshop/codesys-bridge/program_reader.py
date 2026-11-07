# -*- coding: utf-8 -*-
"""Read existing objects; no compile/import/save or project write operations.

IronPython 2.7 compatible. Vendor access is injected by the resident bridge.
Native exports go into a new private directory; existing files are never removed.
"""
from __future__ import print_function
import hashlib
import json
import os
import re
import tempfile
import xml.etree.ElementTree as ET


def _parse_graph(path):
    root = ET.parse(path).getroot()
    models = root.findall(".//Single[@Name='ModelJson']")
    if models:
        if len(models) != 1:
            raise ValueError("multiple ModelJson implementations in one object export")
        model = json.loads(models[0].text or "")
        if not isinstance(model, dict) or model.get("$type") != "LadderDataModel" or not isinstance(model.get("Networks"), list):
            raise ValueError("ModelJson is not a supported LadderDataModel")
        counts, unknown = {}, set()
        known = set(("LadderDataModel", "Network", "Sequence", "Operand", "Contact", "Coil",
                     "Block", "ParallelClosed", "Input", "Output", "Pin", "Modifier", "InVariable", "OutVariable"))
        def visit(value):
            if isinstance(value, dict):
                kind = value.get("$type")
                if kind:
                    counts[kind] = counts.get(kind, 0) + 1
                    if kind not in known: unknown.add(kind)
                for child in value.values(): visit(child)
            elif isinstance(value, list):
                for child in value: visit(child)
        visit(model)
        name = root.find(".//Single[@Name='MetaObject']/Single[@Name='Name']")
        return {"format": "codesys_ladder_model_json", "name": name.text if name is not None else None,
                "nativeNetworkCount": len(model["Networks"]), "contactCount": counts.get("Contact", 0),
                "coilCount": counts.get("Coil", 0), "boxCount": counts.get("Block", 0),
                "branchCount": counts.get("ParallelClosed", 0), "unknownNodeTypes": sorted(unknown),
                "unclassifiedNetworkItemCount": sum(counts[kind] for kind in unknown),
                # Preserve the vendor model verbatim, including order, branches,
                # pin sequences, operands and modifiers. No Boolean flattening.
                "model": model}
    import lad_native
    return lad_native.parse_native_lad(path)


def describe_body(declaration, implementation, has_declaration, has_implementation, language):
    marker = language.lower().replace("_", "").replace(" ", "")
    graphical = (marker in ("ld", "lad", "fbd", "sfc", "ladder", "ladderdiagram") or
                 any(x in marker for x in ("ladder", "functionblockdiagram", "sequentialfunctionchart")))
    # Some OEM wrappers omit implementation_language. A PROGRAM/FB without a
    # textual implementation is not a proven empty program. GVL/DUT are
    # declaration-only objects and must not trigger native graph exports.
    if not has_implementation and re.match(r"\s*(PROGRAM|FUNCTION_BLOCK|FUNCTION|METHOD|ACTION|TRANSITION)\b", declaration, re.I):
        graphical = True
    state = ("graphical_not_read" if graphical else
             "text" if implementation else
             "empty_text" if has_implementation else
             "declaration_only" if has_declaration else "unavailable")
    return {"implementationLanguage": language,
            "hasDeclaration": has_declaration, "hasImplementation": has_implementation,
            "bodyState": state, "bodyComplete": state not in ("graphical_not_read", "unavailable")}


def text_view(obj, path, read_st, get_member, text):
    result = read_st(obj)
    declaration = get_member(obj, "textual_declaration", "get_textual_declaration")
    implementation = get_member(obj, "textual_implementation", "get_textual_implementation")
    language = text(get_member(obj, "implementation_language", "get_implementation_language", ""))
    result.update(describe_body(result.get("declaration", ""), result.get("implementation", ""),
                                declaration is not None, implementation is not None, language))
    result["path"] = path
    return result


def _native_graph(obj, directory):
    failures = []
    selected = None
    # Separate fresh files for each overload. Never delete/overwrite even a
    # failed attempt's output; diagnostic files are part of the read artifact.
    for index, use_defaults in enumerate((False, True)):
        path = os.path.join(directory, "native-%d.xml" % index)
        try:
            if use_defaults:
                obj.export_native(path, False)
            else:
                obj.export_native(path, False, None, None)
            if os.path.isfile(path) and os.path.getsize(path):
                selected = path
                break
            failures.append({"binding": index, "error": "export produced no file"})
        except Exception as exc:
            failures.append({"binding": index, "error": repr(exc)})
    if selected is None:
        return {"errorCode": "program_native_export_failed", "attempts": failures}
    evidence = {"path": selected, "bytes": os.path.getsize(selected), "attempts": failures}
    if evidence["bytes"] > 32 * 1024 * 1024:
        evidence["errorCode"] = "program_native_export_too_large"
        return evidence
    with open(selected, "rb") as source:
        raw = source.read()
    evidence["sha256"] = hashlib.sha256(raw).hexdigest()
    try:
        decoded = raw.decode("utf-8-sig")
        if "<!DOCTYPE" in decoded.upper() or "<!ENTITY" in decoded.upper():
            raise ValueError("DTD/entity declarations are not supported")
        # The OEM IronPython XML parser rejects some non-ASCII exports. Keep
        # original bytes and normalize only a parser copy, with ONE declaration.
        decoded = re.sub(r"^\s*<\?xml[^>]*\?>", "", decoded, count=1)
        ascii_text = "".join(ch if ord(ch) < 128 else "&#%d;" % ord(ch) for ch in decoded)
        normalized = os.path.join(directory, "parser-input.xml")
        with open(normalized, "wb") as destination:
            destination.write(('<?xml version="1.0" encoding="US-ASCII"?>\n' + ascii_text).encode("ascii"))
        graph = _parse_graph(normalized)
        evidence["graph"] = graph
        evidence["complete"] = graph.get("unclassifiedNetworkItemCount", 0) == 0
    except Exception as exc:
        evidence.update({"errorCode": "program_graph_format_unavailable", "error": repr(exc)})
    return evidence


def read_programs(req, resolve, read_st, get_member, text, project_path):
    targets = req.get("targets")
    if (not isinstance(targets, list) or not targets or len(targets) > 32 or
            any(not isinstance(target, type(u"")) and not isinstance(target, str) for target in targets) or
            any(not target.strip() for target in targets)):
        raise ValueError("program.read requires 1..32 nonempty targets")
    if len(set(targets)) != len(targets):
        raise ValueError("program.read targets must be unique")
    output = req.get("outputDir")
    if not output or not os.path.isabs(output) or not os.path.isdir(output):
        raise ValueError("program.read requires an existing absolute outputDir")
    directory = tempfile.mkdtemp(prefix="native-", dir=output)
    items = []
    for index, target in enumerate(targets):
        try:
            obj, path = resolve(target)
            item = text_view(obj, path, read_st, get_member, text)
            item.update({"target": target, "ok": True})
            if item["bodyState"] == "graphical_not_read":
                object_dir = os.path.join(directory, "%02d" % index)
                os.mkdir(object_dir)
                native = _native_graph(obj, object_dir)
                item["native"] = native
                if "graph" in native:
                    item["bodyComplete"] = native["complete"]
                    item["bodyState"] = "graph" if native["complete"] else "graph_partial"
                else:
                    item["bodyState"] = "unavailable"
            items.append(item)
        except Exception as exc:
            items.append({"target": target, "ok": False, "bodyComplete": False,
                          "bodyState": "read_failed", "errorCode": getattr(exc, "code", "program_object_read_failed"),
                          "error": text(exc), "details": getattr(exc, "data", None)})
    return {"projectPath": project_path, "count": len(items), "items": items,
            "complete": all(item.get("ok") and item.get("bodyComplete") for item in items),
            "projectMutated": False, "nativeDirectory": directory}
