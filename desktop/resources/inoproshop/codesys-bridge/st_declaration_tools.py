# -*- coding: utf-8 -*-
"""Small, deterministic ST declaration helpers used by the native route.

This module has no InoProShop dependency so its validation and rewrite rules
can be tested without starting the IDE.  It deliberately handles the common
one-variable-per-line IEC declaration form and refuses ambiguous input.
"""

import re


_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
_SECTION = re.compile(
    r"^\s*(VAR_INPUT|VAR_OUTPUT|VAR_IN_OUT|VAR_GLOBAL|VAR_TEMP|VAR_STAT|"
    r"VAR_EXTERNAL|VAR)\b", re.IGNORECASE)
_END_VAR = re.compile(r"^\s*END_VAR\b", re.IGNORECASE)
_DECL = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+?)\s*;")
_HEADER = re.compile(r"^\s*([A-Za-z_][A-Za-z0-9_]*)\b", re.IGNORECASE)


def declaration_target_kind(text):
    """Classify the outer IEC declaration shape before rewriting it.

    ``VAR...END_VAR`` sections may be added only to PROGRAM/FB/FUNCTION-like
    POUs and GVLs. A DUT can contain fields that look like declarations, but
    appending a VAR block after ``END_TYPE`` is syntactically invalid IEC.
    """
    for line in (text or "").split("\n"):
        stripped = line.strip()
        if not stripped or stripped.startswith("{"):
            continue
        header = _HEADER.match(line)
        if not header:
            return "unknown"
        keyword = header.group(1).upper()
        if keyword == "TYPE":
            return "dut"
        if keyword == "VAR_GLOBAL":
            return "gvl"
        if keyword in ("PROGRAM", "FUNCTION_BLOCK", "FUNCTION", "METHOD",
                       "PROPERTY", "ACTION", "TRANSITION"):
            return "pou"
        return "unknown"
    return "unknown"


def _valid_identifier(value, field):
    value = str(value or "").strip()
    if not _IDENTIFIER.match(value):
        raise ValueError("%s must be an IEC identifier" % field)
    return value


def parse_declaration(text):
    """Return structured declarations while retaining source line numbers."""
    rows = []
    current = None
    pending_pragma = None
    for number, line in enumerate((text or "").split("\n"), 1):
        stripped = line.strip()
        section = _SECTION.match(line)
        if section:
            current = section.group(1).upper()
            pending_pragma = None
            continue
        if _END_VAR.match(line):
            current = None
            pending_pragma = None
            continue
        if current is None:
            continue
        if stripped.startswith("{") and stripped.endswith("}"):
            pending_pragma = stripped
            continue
        match = _DECL.match(line)
        if not match:
            continue
        rest = match.group(2).strip()
        init = None
        if ":=" in rest:
            var_type, init = rest.split(":=", 1)
            var_type = var_type.strip()
            init = init.strip()
        else:
            var_type = rest
        rows.append({
            "section": current,
            "name": match.group(1),
            "type": var_type,
            "init": init,
            "pragma": pending_pragma,
            "line": number,
        })
        pending_pragma = None
    return rows


def add_variable(text, name, var_type, section="VAR", init=None,
                 comment=None, pragma=None):
    """Insert a declaration and return ``(new_text, metadata)``.

    Existing names are rejected instead of silently producing duplicate
    symbols.  A missing section is appended, preserving the input newline
    convention as far as possible.
    """
    name = _valid_identifier(name, "name")
    var_type = str(var_type or "").strip()
    if not var_type:
        raise ValueError("type is required")
    section = str(section or "VAR").strip().upper()
    if section not in ("VAR", "VAR_INPUT", "VAR_OUTPUT", "VAR_IN_OUT",
                       "VAR_GLOBAL", "VAR_TEMP", "VAR_STAT", "VAR_EXTERNAL"):
        raise ValueError("unsupported declaration section: %s" % section)
    names = {item["name"].lower() for item in parse_declaration(text)}
    if name.lower() in names:
        raise ValueError("variable already exists: %s" % name)
    line = "\t%s : %s" % (name, var_type)
    if init is not None and str(init) != "":
        line += " := %s" % str(init).strip()
    line += ";"
    if comment:
        line += "  // %s" % str(comment).replace("\r", " ").replace("\n", " ")
    insert = []
    if pragma:
        pragma = str(pragma).strip()
        if not (pragma.startswith("{") and pragma.endswith("}")):
            raise ValueError("pragma must be enclosed in braces")
        insert.append("\t" + pragma)
    insert.append(line)
    lines = (text or "").split("\n")
    output = []
    current = None
    inserted = False
    for source_line in lines:
        section_match = _SECTION.match(source_line)
        if section_match:
            current = section_match.group(1).upper()
        if _END_VAR.match(source_line) and current == section and not inserted:
            output.extend(insert)
            inserted = True
            current = None
        elif _END_VAR.match(source_line):
            current = None
        output.append(source_line)
    if not inserted:
        if output and output[-1] != "":
            output.append("")
        output.append(section)
        output.extend(insert)
        output.append("END_VAR")
    return "\n".join(output), {
        "name": name,
        "section": section,
        "createdSection": not inserted,
        "line": output.index(line) + 1,
    }


def add_symbol_pragma(text, name, access="readwrite"):
    """Insert or validate the CODESYS symbol export attribute."""
    name = _valid_identifier(name, "name")
    access = str(access or "readwrite").strip().lower()
    if access not in ("read", "write", "readwrite", "none"):
        raise ValueError("access must be read/write/readwrite/none")
    lines = (text or "").split("\n")
    declaration = re.compile(r"^(\s*)%s\s*:" % re.escape(name), re.IGNORECASE)
    pragma = "{attribute 'symbol' := '%s'}" % access
    for index, line in enumerate(lines):
        match = declaration.match(line)
        if not match:
            continue
        if index > 0 and lines[index - 1].strip().lower() == pragma.lower():
            return text, {"name": name, "pragma": pragma, "changed": False,
                          "line": index + 1}
        lines.insert(index, match.group(1) + pragma)
        return "\n".join(lines), {"name": name, "pragma": pragma,
                                    "changed": True, "line": index + 2}
    raise ValueError("variable not found in declaration: %s" % name)
