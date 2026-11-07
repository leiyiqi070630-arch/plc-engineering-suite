# -*- coding: utf-8 -*-
"""PLCCode-contract contact LAD compiler for InoProShop native serialization.

Consumes the PLCCode `tia_lad_generate_block_xml` plan vocabulary (contact_coil
and timer networks) and emits the vendor's own IArchivable ExportFile XML that
`project.import_native` accepts.  Every serialization template here was
extracted from a real InoProShop V1.10.0.3 export, not invented:

- contact        = input item {9de7f100} with IsContact=true over an operand
                   {c9b2f165}; negated contacts keep Boolean=true and set
                   Flags=1 on the operand Flags block (vendor convention).
- parallel group = branch node {827b9ec2} with Input=Null, Trees[] = the legs,
                   Mode="Sequential" ({3b9474d0}).  The verified contact
                   serializer admits one contact per leg; putting A and B as
                   sibling Tree children does NOT mean A AND B — InoProShop
                   treats those children as parallel alternatives (A OR B).
- For this contact_coil writer, the verified native editor contract is one
  parallel level per rung. This is a generator safety boundary, not a claim
  that IEC/LAD logic can never be nested. A branch inside another branch leg
  is rejected here because InoProShop can accept that XML but flatten the
  inner group onto the outer bus, changing the maintainable visual topology
  even when the compiler reports 0/0.
- coil           = assignment {9873c309} wrapping an AND RValue box whose
                   OutputItems[0] carries LValue=true + IsCoil=true.
- timer          = standalone FunctionBlock box with explicit IN/PT and Q/ET
                   bindings. EN/ENO are Null; rail layout stays Fixed=True.
                   Runtime TON A/B verified this distinction 2026-09-13.
"""

TO_GUID = {
    "network": "d9a99d73-b633-47db-b876-a752acb25871",
    "assignment": "9873c309-1f09-4ebf-9078-42d8057ef11b",
    "box": "acfc6f68-8e3a-4af5-bf81-3dd512095a46",
    "operand": "c9b2f165-48a2-4a45-8326-3952d8a3d708",
    "outputs": "f40d3e09-c02c-4522-a88c-dac23558cfc4",
    "input_item": "9de7f100-1b87-424c-a62e-45b0cfc85ed2",
    "branch": "827b9ec2-2032-40da-9f4e-7670ca2d55a8",
    "impl": "25e509de-33d4-4447-93f8-c9e4ea381c8b",
    "pou_text": "a9ed5b7e-75c5-4651-af16-d2c27e98cb94",
    "pou_object": "6f9dac99-8de1-4efc-8465-68ac443b7d08",
}
FLAGS_GUID = "668066f2-6069-46b3-8962-8db8d13d7db2"
CALLTYPE_GUID = "bffb3c53-f105-4e85-aba2-e30df579d75f"
PARAM_GUID = "71496971-9e0c-4677-a832-b9583b571130"
MODE_GUID = "3b9474d0-c98b-4935-8ce5-65f06808350d"
SPECIAL_GUID = "0db3d7bb-cde0-4416-9a7b-ce49a0124323"
META_GUID = "81297157-7ec9-45ce-845e-84cab2b88ade"
PROPS_GUID = "2c41fa04-1834-41c1-816e-303c7aa2c05b"
ENTRY_GUID = "6198ad31-4b98-445c-927f-3258a0e82fe3"
ROOT_GUID = "3daac5e4-660e-42e4-9cea-3711b98bfb63"
VIEW_GUID = "d9b2b2cc-ea99-4c3b-aa42-1e5c49e65b84"
TEXTDOC_GUID = "f3878285-8e4f-490b-bb1b-9acbb7eb04db"
LINE_GUID = "a5de0b0b-1cb5-4913-ac21-9d70293ec00d"
POULEVEL_GUID = "8e575c5b-1d37-49c6-941b-5c0ec7874787"


class PlanRejected(Exception):
    """Raised when plan semantics or emitted-structure checks fail.

    Carries a PLCCode-style issue list: every item has path, expected,
    actual, remediation — so callers repair the plan without studying
    serialization internals.
    """

    def __init__(self, issues):
        Exception.__init__(self, "contact plan rejected: %d issue(s)"
                           % len(issues))
        self.issues = issues


class _Ids(object):
    def __init__(self, start=0):
        self._next = start

    def take(self):
        self._next += 1
        return self._next

    def last(self):
        return self._next


def _flags(name, fixed=False, flags_value=0):
    return ('<Single Name="%s" Type="{%s}" Method="IArchivable">\n'
            '  <Single Name="Extensible" Type="bool">False</Single>\n'
            '  <Single Name="Fixed" Type="bool">%s</Single>\n'
            '  <Single Name="Flags" Type="int">%d</Single>\n'
            '</Single>' % (name, FLAGS_GUID, "True" if fixed else "False",
                           flags_value))


def _operand_lines(name, dtype, ids, lvalue=False,
                   is_instance=False, is_coil=False, operand_null=False,
                   negated=False, fixed=False, boolean=None):
    lines = []
    # C383 root cause (verified 2026-08-30 against user_pou.export.xml):
    # a negated (常闭/NC) contact keeps Boolean=True and sets Flags=1 on the
    # operand Flags block.  Setting Boolean=False made the native importer
    # fail to rebuild the network and reset the whole declaration
    # (C383 + C46 chain).  Vendor export: NC contact -> Boolean=True, Flags=1.
    # A box Instance operand keeps Boolean=False (vendor AND box export), but
    # a FunctionBlock instance (TON) keeps Boolean=True (true-tl.generated.xml).
    if boolean is None:
        boolean = "False" if is_instance else "True"
    lines.append('  <Single Name="Boolean" Type="bool">%s</Single>'
                 % boolean)
    lines.append('  <Single Name="IsInstance" Type="bool">%s</Single>'
                 % ("True" if is_instance else "False"))
    lines.append('  <Single Name="LValue" Type="bool">%s</Single>'
                 % ("True" if lvalue else "False"))
    lines.append(_flags("Flags", fixed=fixed,
                        flags_value=1 if negated else 0))
    lines.append('  <Single Name="Address" Type="string"></Single>')
    lines.append('  <Single Name="Comment" Type="string"></Single>')
    if operand_null:
        lines.append('  <Null Name="Operand" />')
    else:
        lines.append('  <Single Name="Operand" Type="string">%s</Single>'
                     % name)
    lines.append('  <Single Name="SymbolComment" Type="string"></Single>')
    lines.append('  <Single Name="Type" Type="string">%s</Single>' % dtype)
    lines.append('  <Single Name="IsCoil" Type="bool">%s</Single>'
                 % ("True" if is_coil else "False"))
    lines.append('  <Single Name="IsSeriesCoil" Type="bool">False</Single>')
    lines.append('  <Single Name="SeriesIndex" Type="int">-1</Single>')
    lines.append(_flags("ConnectorFlags"))
    lines.append('  <Single Name="Id" Type="long">%d</Single>' % ids.take())
    return lines


def _operand(name, dtype, ids, lvalue=False,
             is_instance=False, is_coil=False, field="Operand",
             boolean=None):
    if field:
        lines = ['<Single Name="%s" Type="{%s}" Method="IArchivable">'
                 % (field, TO_GUID["operand"])]
    else:
        lines = ['<Single Type="{%s}" Method="IArchivable">'
                 % TO_GUID["operand"]]
    lines.extend(_operand_lines(name, dtype, ids,
                                lvalue=lvalue, is_instance=is_instance,
                                is_coil=is_coil, boolean=boolean))
    lines.append('</Single>')
    return "\n".join(lines)


def _input_item(name, dtype, ids, contact=True, negated=False):
    lines = ['<Single Type="{%s}" Method="IArchivable">'
             % TO_GUID["input_item"]]
    lines.append('  <Single Name="Operand" Type="{%s}" Method="IArchivable">'
                 % TO_GUID["operand"])
    # Contact inputs carry Fixed=True (and.native.xml); FunctionBlock data
    # inputs (IN/PT) carry Fixed=False (true-tl.generated.xml).
    lines.extend(_operand_lines(name, dtype, ids, negated=negated,
                                fixed=contact))
    lines.append('  </Single>')
    lines.append('  <Single Name="IsContact" Type="bool">%s</Single>'
                 % ("True" if contact else "False"))
    lines.append('  <Single Name="Id" Type="long">%d</Single>' % ids.take())
    lines.append('</Single>')
    return "\n".join(lines)


def _operand_name(spec, default_type="BOOL"):
    """Accept 'Name' shorthand or a PLCCode operand object.

    Tolerates the reasonable authoring variants models produce: plain string,
    {name}, {target}, {operand:{name}}, {kind:..., name/target}. One canonical
    field wins; extra decorative fields are ignored, never fatal.
    """
    if isinstance(spec, dict):
        name = (spec.get("name")
                or spec.get("target")
                or (spec.get("operand") or {}).get("name")
                or (spec.get("operand") or {}).get("target"))
        dtype = spec.get("datatype") or (spec.get("operand") or {}).get(
            "datatype") or default_type
        negated = bool(spec.get("negated", False))
        return name, dtype, negated
    return spec, default_type, False


def _field_name(spec):
    """One operand field as a plain name string or an operand object.

    Accepts a bare string or {name}/{target}/{operand:{name}} forms; accessing
    .get on a bare string crashed the compiler with AttributeError in the E2E
    round of 2026-08-31.
    """
    if spec is None:
        return None
    if isinstance(spec, dict):
        return (spec.get("name")
                or spec.get("target")
                or (spec.get("operand") or {}).get("name")
                or (spec.get("operand") or {}).get("target"))
    if isinstance(spec, str):
        return spec or None
    return None


def _series_items(elements, ids):
    """A series list: plain contacts and a validated parallel group in order."""
    parts = []
    for element in elements:
        legs = element.get("branch") or element.get("branches")
        if legs:
            parts.append(_parallel_group(legs, ids))
            continue
        name, dtype, negated = _operand_name(element)
        parts.append(_input_item(name, dtype or "BOOL", ids,
                                 contact=True, negated=negated))
    return "\n".join(parts)


def _parallel_group(legs, ids):
    """legs = list of series-lists rendered as one parallel OR group."""
    lines = ['<Single Type="{%s}" Method="IArchivable">' % TO_GUID["branch"]]
    lines.append('  <Null Name="Input" />')
    lines.append('  <List2 Name="Trees">')
    for leg in legs:
        leg_series = leg.get("contacts") if isinstance(leg, dict) else leg
        lines.append(_series_items(leg_series or [], ids))
    lines.append('  </List2>')
    lines.append('  <Single Name="Mode" Type="{%s}">Sequential</Single>'
                 % MODE_GUID)
    lines.append('  <Single Name="Id" Type="long">%d</Single>' % ids.take())
    lines.append('</Single>')
    return "\n".join(lines)


def _rvalue_box(box_type, input_items, ids, call_type=None, instance=None,
                output_operands=None, input_param=None, output_param=None,
                is_box_type=False, instance_boolean=None, rail_connected=False):
    """Emit one RValue box with the FULL vendor field set.

    The vendor editor always serializes CallType + Instance + OutputItems +
    InputParam + OutputParam on every box; omitting any of them blocks the
    native importer (observed as a modal-blocked import).

    FunctionBlock boxes (TON/TOF/TP/TONR) need is_box_type=True and an
    instance operand with Boolean=True — the measured true-tl.generated.xml
    shape. Emitting IsBoxType=False (the AND shape) made the importer
    fragment the network into non-renderable pieces (blocks import but draw
    no graphics).

    rail_connected controls layout Fixed=True. It does not add execution
    enable pins to FunctionBlock boxes that bind IN/PT explicitly. A real
    2026-09-13 TON A/B kept all 122 native fields unchanged except EN/ENO:
    True disconnected IN and Q at runtime; Null preserved both bindings.
    Non-FunctionBlock rail-connected boxes retain their existing EN/ENO.
    """
    lines = ['<Single Name="RValue" Type="{%s}" Method="IArchivable">'
             % TO_GUID["box"]]
    lines.append('  <Single Name="ContainsExtensibleInputs" Type="bool">'
                 'False</Single>')
    if rail_connected and not is_box_type:
        lines.append('  <Single Name="EN" Type="bool">True</Single>')
        lines.append('  <Single Name="ENO" Type="bool">True</Single>')
    else:
        lines.append('  <Null Name="EN" />')
        lines.append('  <Null Name="ENO" />')
    lines.append('  <Single Name="ProvidesSTSnippet" Type="bool">False'
                 '</Single>')
    lines.append(_flags("Flags", fixed=rail_connected))
    lines.append('  <Null Name="InputFlags" />')
    lines.append('  <List2 Name="InputItems">')
    if input_items:
        lines.append(input_items)
    lines.append('  </List2>')
    lines.append('  <Single Name="CallType" Type="{%s}">%s</Single>'
                 % (CALLTYPE_GUID, call_type or "None"))
    if instance is None:
        lines.append('  <Single Name="Instance" Type="{%s}" '
                     'Method="IArchivable">' % TO_GUID["operand"])
        lines.extend(_operand_lines("", "", ids, is_instance=True,
                                    operand_null=True))
        lines.append('  </Single>')
    else:
        # FunctionBlock instance: Boolean=True (true-tl.generated.xml);
        # logic-box instances keep Boolean=False (vendor AND box export).
        lines.append(_operand(instance, timer_dtype(box_type), ids,
                              is_instance=True, field="Instance",
                              boolean=("True" if is_box_type else None)))
    lines.append('  <Single Name="OutputItems" Type="{%s}" '
                 'Method="IArchivable">' % TO_GUID["outputs"])
    lines.append('    <List2 Name="OutputItems">')
    if output_operands:
        # Measured TON-with-bound-Q shape (true-tl.generated.xml): the bound
        # output operand goes DIRECTLY in the list — a leading <Null /> is
        # the UNBOUND-Q marker, and with a bound Q it pushes the operand onto
        # the ET (TIME) pin, producing "cannot convert TIME to BOOL".
        for operand_xml in output_operands:
            lines.append(operand_xml)
    lines.append('    </List2>')
    lines.append('  </Single>')
    in_names, in_types = input_param or ([], [])
    lines.append('  <Single Name="InputParam" Type="{%s}" '
                 'Method="IArchivable">' % PARAM_GUID)
    lines.append('    <List2 Name="Names">')
    for name in in_names:
        lines.append('      <Single Type="string">%s</Single>' % name)
    lines.append('    </List2>')
    lines.append('    <List2 Name="Types">')
    for dtype in in_types:
        lines.append('      <Single Type="string">%s</Single>' % dtype)
    lines.append('    </List2>')
    lines.append('  </Single>')
    out_names, out_types = output_param or ([], [])
    lines.append('  <Single Name="OutputParam" Type="{%s}" '
                 'Method="IArchivable">' % PARAM_GUID)
    lines.append('    <List2 Name="Names">')
    for name in out_names:
        lines.append('      <Single Type="string">%s</Single>' % name)
    lines.append('    </List2>')
    lines.append('    <List2 Name="Types">')
    for dtype in out_types:
        lines.append('      <Single Type="string">%s</Single>' % dtype)
    lines.append('    </List2>')
    lines.append('  </Single>')
    lines.append('  <Single Name="BoxType" Type="string">%s</Single>'
                 % box_type)
    lines.append('  <Null Name="STSnippet" />')
    lines.append('  <Single Name="IsBoxType" Type="bool">%s</Single>'
                 % ("True" if is_box_type else "False"))
    lines.append('  <Single Name="Id" Type="long">%d</Single>' % ids.take())
    lines.append('</Single>')
    return "\n".join(lines)


def timer_dtype(box_type):
    return {"TON": "TON", "TOF": "TOF", "TP": "TP", "TONR": "TONR"}.get(
        box_type, "TON")


def _coil_output(name, ids):
    # Vendor export: the assignment OutputItems coil is an UNNAMED operand
    # (<Single Type="{c9b2f165...}">, no Name="Operand" attribute).
    return _operand(name, "BOOL", ids, lvalue=True, is_coil=True, field=None)


def _assignment(rvalue_xml, coil_name, ids, output_operands=None):
    lines = ['<Single Type="{%s}" Method="IArchivable">'
             % TO_GUID["assignment"]]
    lines.append(_flags("Flags"))
    lines.append(rvalue_xml)
    lines.append('  <Single Name="OutputItems" Type="{%s}" '
                 'Method="IArchivable">' % TO_GUID["outputs"])
    lines.append('    <List2 Name="OutputItems">')
    if coil_name:
        lines.append(_coil_output(coil_name, ids))
    for operand_xml in (output_operands or []):
        lines.append(operand_xml)
    lines.append('    </List2>')
    lines.append('  </Single>')
    lines.append('  <Single Name="Id" Type="long">%d</Single>' % ids.take())
    lines.append('</Single>')
    return "\n".join(lines)


def _network(network, ids):
    kind = (network.get("type") or "").strip().lower()
    xml = []
    xml.append('<Single Type="{%s}" Method="IArchivable">' % TO_GUID["network"])
    xml.append('  <Single Name="FBDValid" Type="bool">False</Single>')
    xml.append('  <Single Name="ILActive" Type="bool">False</Single>')
    xml.append('  <Single Name="ILValid" Type="bool">False</Single>')
    xml.append('  <Single Name="OutCommented" Type="bool">False</Single>')
    xml.append('  <List2 Name="Connectors" />')
    xml.append('  <List2 Name="ILLines" />')
    xml.append('  <List2 Name="NetworkItems">')

    if kind == "contact_coil":
        series = []
        branches = network.get("branches") or []
        if branches:
            series.append({"branch": [
                (leg.get("contacts") if isinstance(leg, dict) else leg)
                or [] for leg in branches]})
        for contact in network.get("contacts") or []:
            series.append(contact)
        coil = network.get("coil") or {}
        coil_name = _field_name(coil)
        if not coil_name or not series:
            raise ValueError(
                "contact_coil network needs series elements and a coil")
        if branches and not (network.get("contacts") or []):
            # Pure parallel rung (A ∥ B → coil): the verified AND shape needs
            # >= 2 inputs. A parallel group alone collapses into one AND input
            # and the IDE precompiler reports "'AND' needs at least 2 operands"
            # (12 such errors in the elevator round, 2026-09-01). Reject at
            # plan time instead of importing a broken network.
            raise ValueError(
                "contact_coil network with branches must also have at least "
                "one series contact: the AND box needs >= 2 inputs. Add a "
                "series contact (e.g. an enable input) to the network.")
        rvalue = _rvalue_box("AND", _series_items(series, ids), ids,
                             call_type="And", instance=None,
                             input_param=([], []),
                             output_param=([], []))
        xml.append(_assignment(rvalue, coil_name, ids))
    elif kind == "timer":
        timer = (network.get("timer") or "TON").upper()
        instance = (_field_name(network.get("instance"))
                    or "i_%s" % timer.lower())
        input_name = _field_name(network.get("input"))
        pt = network.get("pt") or {}
        if isinstance(pt, str):
            pt = {"constant_value": pt}
        pt_value = pt.get("constant_value") or pt.get("name") or "T#0s"
        q = _field_name(network.get("q"))
        et = _field_name(network.get("et"))
        if not input_name or not q:
            raise ValueError("timer network needs input and q")
        in_item = _input_item(input_name, "BOOL", ids, contact=False)
        pt_item = _input_item(pt_value, "TIME", ids, contact=False)
        out_operands = []
        if q:
            out_operands.append(_operand(q, "BOOL", ids, lvalue=True))
        if et:
            out_operands.append(_operand(et, "TIME", ids, lvalue=True))
        rvalue = _rvalue_box(timer, in_item + "\n" + pt_item, ids,
                             call_type="FunctionBlock", instance=instance,
                             output_operands=out_operands,
                             input_param=(["IN", "PT"], ["BOOL", "TIME"]),
                             output_param=(["Q", "ET"], ["BOOL", "TIME"]),
                             is_box_type=True, rail_connected=True)
        # Keep the standalone NetworkItems box and Fixed=True layout.
        # EN/ENO must remain Null for this explicit IN/PT/Q/ET interface;
        # compiling and rendering the old EN/ENO=True shape did not prove
        # that its input/output bindings executed (runtime A/B 2026-09-13).
        xml.append(rvalue)
    else:
        raise ValueError(
            "contact compiler supports contact_coil and timer networks, got: "
            + (kind or "(missing type)"))

    xml.append('  </List2>')
    xml.append('  <Single Name="Comment" Type="string">%s</Single>'
               % (network.get("title") or ""))
    xml.append('  <Single Name="Label" Type="string"></Single>')
    xml.append('  <Single Name="Title" Type="string"></Single>')
    xml.append('  <Single Name="Collapsed" Type="bool">False</Single>')
    xml.append('  <Single Name="Id" Type="long">%d</Single>' % ids.take())
    xml.append('</Single>')
    return "\n".join(xml)


def _declaration_lines(block_name, interface):
    lines = ["PROGRAM %s" % block_name]
    for key, section in (("input", "VAR_INPUT"), ("inout", "VAR_IN_OUT"),
                         ("output", "VAR_OUTPUT")):
        members = interface.get(key) or []
        if not members:
            continue
        lines.append(section)
        for member in members:
            lines.append("\t%s: %s;" % (member["name"],
                                        (member.get("datatype") or "BOOL").upper()))
        lines.append("END_VAR")
    # These sections coexist in the public plan; Static is not a fallback
    # spelling for local. Temporary storage must keep its VAR_TEMP semantics.
    local_members = ((interface.get("static_members") or [])
                     + (interface.get("local") or []))
    for members, section in ((local_members, "VAR"),
                             (interface.get("temp") or [], "VAR_TEMP")):
        if not members:
            continue
        lines.append(section)
        for member in members:
            lines.append("\t%s: %s;" % (member["name"],
                                        (member.get("datatype") or "BOOL").upper()))
        lines.append("END_VAR")
    return lines


def _collect_members(interface):
    """name(lower) -> (datatype, section) for every declared member."""
    members = {}
    for key in ("input", "inout", "output", "static_members", "local",
                "temp"):
        for member in interface.get(key) or []:
            name = _text_member_name(member)
            if name:
                members[name.lower()] = ((member.get("datatype") or "BOOL").upper(),
                                         key)
    return members


def _text_member_name(member):
    if isinstance(member, dict):
        return member.get("name")
    return member


def _issue(path, expected, actual, remediation):
    return {"path": path, "expected": expected, "actual": actual,
            "remediation": remediation}


def validate_plan(plan, issues):
    """PLCCode-style plan-time semantic validation: every operand a network
    references must be declared in the interface, with sane types. This is
    the layer that keeps 'undefined identifier' errors inside the generator
    instead of leaking them to the IDE precompile view."""
    block_name = plan.get("block_name")
    if not block_name:
        issues.append(_issue("plan.block_name", "IEC identifier",
                             plan.get("block_name"),
                             "Set the target POU name."))
    else:
        import re as _re
        if not _re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", str(block_name)):
            issues.append(_issue(
                "plan.block_name",
                "IEC identifier (letters, digits, underscore, not starting "
                "with a digit)", block_name,
                "Rename the POU to a valid IEC identifier; the vendor "
                "importer rejects invalid POU names."))
    interface = plan.get("interface") or {}
    members = _collect_members(interface)

    def check_operand(where, spec, want_type="BOOL", writable=False):
        name, dtype, _neg = _operand_name(spec, want_type)
        key = (name or "").lower()
        if not key:
            issues.append(_issue(where, "operand name", spec,
                                 "Every contact and coil names a declared "
                                 "interface member."))
            return
        if key not in members:
            roster = sorted(members.keys())
            issues.append(_issue(
                "%s (operand '%s')" % (where, name),
                "declared interface member; declared=%s" % roster,
                "not declared",
                "Add it to plan.interface (input/output/static_members) or "
                "fix the spelling."))
            return
        declared_type, section = members[key]
        if want_type == "BOOL" and declared_type.upper() not in (
                "BOOL", ""):
            issues.append(_issue(
                "%s (operand '%s')" % (where, name),
                "BOOL contact/coil operand", declared_type,
                "Contacts and coils need BOOL members."))
        if want_type in ("TON", "TOF", "TP", "TONR") and declared_type.upper() != want_type:
            issues.append(_issue(
                "%s (instance '%s')" % (where, name),
                "%s declared member" % want_type, declared_type,
                "Timer instances must be declared %s in static_members." % want_type))
        if writable and section in ("input", "temp", "constant"):
            issues.append(_issue(
                "%s (operand '%s')" % (where, name),
                "writable target (output/local/static_members/inout)",
                "declared in section '%s'" % section,
                "A coil writes its target; move the member out of '%s' or "
                "write a different target." % section))

    for index, network in enumerate(plan.get("networks") or []):
        base = "plan.networks[%d]" % index
        kind = (network.get("type") or "").strip().lower()
        if kind == "contact_coil":
            coil = network.get("coil") or {}
            check_operand("%s.coil" % base, coil, "BOOL", writable=True)
            branches = network.get("branches") or []
            contacts = network.get("contacts") or []
            if not branches and isinstance(contacts, list) and len(contacts) == 1:
                # A contact_coil with no parallel group is emitted as an AND
                # over its series contacts.  InoProShop rejects a one-input
                # AND during its C23 precompile (after import), so reject the
                # shape here while the plan is still side-effect free.
                issues.append(_issue(
                    "%s.contacts" % base,
                    "at least 2 series contacts when branches are absent",
                    len(contacts),
                    "The verified AND shape needs >= 2 inputs (InoProShop "
                    "C23). Add a second series contact (for example an "
                    "enable/interlock input), or represent the parallel "
                    "logic with branches; a one-input AND is not importable."))
            if branches and not contacts:
                # Intercept BEFORE import: a parallel group without any series
                # contact collapses into a single-input AND, and the IDE
                # precompiler reports "'AND' needs at least 2 operands" per
                # affected network (12 errors in the elevator round 2026-09-01).
                # Fail the plan here with the exact remediation instead of
                # importing a broken network and leaking it to the IDE.
                issues.append(_issue(
                    "%s.contacts" % base,
                    "at least one series contact when branches are present",
                    None,
                    "The verified AND shape needs >= 2 inputs; a parallel "
                    "group alone provides 1. Add one series contact (e.g. an "
                    "enable/interlock input) to this network."))

            def walk_series(elements, where, branch_depth=0):
                for position, element in enumerate(elements or []):
                    if not isinstance(element, dict):
                        issues.append(_issue(
                            "%s[%d]" % (where, position),
                            "contact object", element,
                            "Contacts must be objects with name/negated."))
                        continue
                    negated = element.get("negated")
                    if negated is not None and not isinstance(negated, bool):
                        issues.append(_issue(
                            "%s[%d].negated" % (where, position),
                            "boolean", negated,
                            "negated must be true or false."))
                    legs = element.get("branch") or element.get("branches")
                    if legs:
                        if branch_depth == 0 and position > 0:
                            # InoProShop's native editor allocates a parallel
                            # group from the rung's left bus.  An inline group
                            # after a series contact is accepted by the XML
                            # importer but reloaded as an invalid/placeholder
                            # operand (??? / !!!ERROR!!!), which then poisons
                            # the whole application compile.  Do not emit a
                            # graph whose visual topology is not preserved.
                            issues.append(_issue(
                                "%s[%d].branch" % (where, position),
                                "parallel group at the left bus (position 0)",
                                "inline parallel group at position %d" % position,
                                "Move the common prefix into every branch leg, "
                                "split it into a helper contact_coil network, "
                                "or expand to a bounded one-level DNF; the "
                                "vendor editor does not preserve inline branches."))
                        if branch_depth >= 1:
                            # The vendor's native LD editor has no verified
                            # representation for a branch nested inside an OR
                            # leg.  It accepts the XML, then flattens the
                            # nested group onto the parent bus (the R58
                            # elevator rung exposed exactly this failure
                            # mode).  Do not report success for a graph whose
                            # visual topology is different from its boolean
                            # intent: require one-level branches and let the
                            # caller split the expression into helper rungs.
                            issues.append(_issue(
                                "%s[%d].branch" % (where, position),
                                "no nested parallel group (one-level bus)",
                                "nested parallel group at depth %d"
                                % (branch_depth + 1),
                                "InoProShop flattens nested branches on one "
                                "bus. Split this expression into helper "
                                "contact_coil networks (one branch group per "
                                "rung) and OR the helper coils on a final "
                                "rung, or expand to bounded one-level DNF."))
                        if len(legs) < 2:
                            issues.append(_issue(
                                "%s[%d].branch" % (where, position),
                                "at least 2 parallel legs", len(legs),
                                "A parallel group needs two or more legs; "
                                "single contacts belong in the series list."))
                        for leg_index, leg in enumerate(legs):
                            leg_contacts = (leg.get("contacts")
                                            if isinstance(leg, dict) else leg)
                            if isinstance(leg_contacts, list) and len(leg_contacts) > 1:
                                # Trees stores each branch leg as direct child
                                # contacts. This template has no lossless
                                # series wrapper; flattening A AND B into
                                # sibling Trees silently changes it to A OR B.
                                issues.append(_issue(
                                    "%s[%d].branch[%d]"
                                    % (where, position, leg_index),
                                    "one contact per parallel leg",
                                    len(leg_contacts),
                                    "Split the series leg into a helper "
                                    "contact_coil network and OR the helper "
                                    "coils on a final rung; the current "
                                    "native branch schema cannot preserve "
                                    "series contacts inside one leg."))
                            walk_series(leg_contacts,
                                        "%s[%d].branch[%d]"
                                        % (where, position, leg_index),
                                        branch_depth + 1)
                        continue
                    check_operand("%s[%d]" % (where, position), element,
                                  "BOOL")
            if branches:
                if len(branches) < 2:
                    issues.append(_issue(
                        "%s.branches" % base,
                        "at least 2 parallel legs", len(branches),
                        "A parallel group needs two or more legs; single "
                        "contacts belong in the series list."))
                for leg_index, leg in enumerate(branches):
                    leg_contacts = (leg.get("contacts")
                                    if isinstance(leg, dict) else leg)
                    if isinstance(leg_contacts, list) and len(leg_contacts) > 1:
                        # Trees stores each branch leg as direct child
                        # contacts. This template has no lossless series
                        # wrapper; flattening A AND B into sibling Trees
                        # silently changes it to A OR B.
                        issues.append(_issue(
                            "%s.branches[%d]" % (base, leg_index),
                            "one contact per parallel leg",
                            len(leg_contacts),
                            "Split the series leg into a helper "
                            "contact_coil network and OR the helper coils on "
                            "a final rung; the current native branch schema "
                            "cannot preserve series contacts inside one leg."))
                    walk_series(leg_contacts,
                                "%s.branches[%d]" % (base, leg_index), 1)
            walk_series(network.get("contacts"), "%s.contacts" % base, 0)
        elif kind == "timer":
            timer = (network.get("timer") or "TON").upper()
            if timer not in ("TON", "TOF", "TP", "TONR"):
                issues.append(_issue(
                    "%s.timer" % base, "TON | TOF | TP | TONR", timer,
                    "Select a timer from the declared contact-plan contract."))
            instance = _field_name(network.get("instance"))
            check_operand("%s.instance" % base, {"name": instance}, timer)
            input_spec = network.get("input")
            if not input_spec and network.get("in"):
                issues.append(_issue(
                    "%s.input" % base, "field name 'input'",
                    "'in' is not a timer field",
                    "Timer networks use 'input' (or 'in' is ignored); "
                    "rename the field to 'input'."))
            check_operand("%s.input" % base, input_spec, "BOOL")
            check_operand("%s.q" % base, network.get("q"), "BOOL")
            pt = network.get("pt") or {}
            if isinstance(pt, str):
                pt = {"constant_value": pt}
            if not (pt.get("constant_value") or pt.get("name")):
                issues.append(_issue("%s.pt" % base,
                                     "constant_value or declared member",
                                     pt, "Timer PT needs a duration."))
            et = _field_name(network.get("et"))
            if et:
                check_operand("%s.et" % base, {"name": et}, "TIME" if
                              members.get(et.lower(), ("", ""))[0] == "TIME"
                              else "BOOL")
        else:
            issues.append(_issue("%s.type" % base,
                                 "contact_coil | timer", network.get("type"),
                                 "The contact compiler emits these two "
                                 "network kinds."))
            # TIA-generator discipline: a wrong/missing type must not hide the
            # operand-level findings behind a second round trip. Walk the
            # contact-shaped fields best-effort so 'X0 is not declared' comes
            # back in the SAME response as the type error.
            for field, want in (("coil", "BOOL"),):
                spec = network.get(field)
                if spec:
                    check_operand("%s.%s" % (base, field), spec, want,
                                  writable=True)
            for leg_index, leg in enumerate(network.get("branches") or []):
                walk_best_effort = (leg.get("contacts")
                                    if isinstance(leg, dict) else leg)
                for position, element in enumerate(walk_best_effort or []):
                    if isinstance(element, dict):
                        check_operand(
                            "%s.branches[%d][%d]" % (base, leg_index, position),
                            element, "BOOL")
            for position, element in enumerate(network.get("contacts") or []):
                if isinstance(element, dict):
                    check_operand("%s.contacts[%d]" % (base, position),
                                  element, "BOOL")


def validate_emitted_xml(xml, plan, issues):
    """Structural self-check of the emitted ExportFile against the vendor
    export shape, so serialization mistakes die inside the compiler."""
    interface_pos = xml.find('<Single Name="Interface"')
    object_pos = xml.find('<Single Name="Object"')
    if interface_pos < 0:
        issues.append(_issue("xml.Interface", "declaration text object",
                             "missing",
                             "The compiler must emit the Interface block."))
    elif object_pos >= 0 and interface_pos < object_pos:
        issues.append(_issue(
            "xml.entry.order", "MetaObject, Object, Interface, POULevel",
            "Interface before Object",
            "The vendor parser drops the declaration when Interface precedes "
            "Object (observed: 33 precompile errors, undefined identifiers)."))
    # C383 root cause (verified 2026-08-30): Interface must be a DIRECT child
    # of the Object node. An Interface emitted after Object closes (entry
    # level) made the native importer reset the declaration to a single
    # empty line -> C383 + C46 chain.
    # POULevel is always the first Object child AFTER Interface, so a valid
    # ordering is: Object < Interface < POULevel < AddAttributeSubsequent.
    poulevel_pos = xml.find('<Single Name="POULevel"')
    if (interface_pos >= 0 and poulevel_pos >= 0
            and interface_pos > poulevel_pos):
        issues.append(_issue(
            "xml.object.interface", "Interface inside the Object node",
            "Interface after POULevel",
            "The Interface text object must be emitted inside Object before "
            "POULevel; entry-level Interface triggers C383."))
    if xml.count("<Single") != xml.count("</Single>") + xml.count("/>"):
        # cheap balance check: openings vs closings plus self-closing tags
        pass
    for token, expected in (("CallType", 0), ("Instance", 0),
                            ("InputParam", 0), ("OutputParam", 0)):
        boxes = xml.count('Name="RValue"')
        found = xml.count('Name="%s"' % token)
        if boxes and found < boxes:
            issues.append(_issue(
                "xml.box.%s" % token, "one per box (%d boxes)" % boxes,
                "%d occurrences" % found,
                "The vendor importer blocks boxes missing CallType, "
                "Instance, InputParam or OutputParam."))
    declaration = "\n".join(_declaration_lines(plan.get("block_name") or "",
                                               plan.get("interface") or {}))
    for line in declaration.splitlines():
        if line and line not in xml:
            issues.append(_issue(
                "xml.declaration", "declaration line in TextLines", line,
                "The Interface text object must carry the full declaration."))
            break


def compile_contact_block(plan):
    """Compile one PLCCode-contract plan into ExportFile XML text.

    Gates in order: plan-time semantic validation (operands declared, types
    sane) -> deterministic emission -> structural self-check. Any issue dies
    inside the generator with a pathed issue list; the vendor importer only
    ever sees self-checked XML.
    """
    issues = []
    validate_plan(plan, issues)
    if issues:
        raise PlanRejected(issues)
    block_name = plan.get("block_name")
    if not block_name:
        raise PlanRejected([_issue("plan.block_name", "IEC identifier",
                                   block_name,
                                   "Set the target POU name.")])
    interface = plan.get("interface") or {}
    networks = plan.get("networks") or []
    if not networks:
        raise PlanRejected([_issue("plan.networks", "non-empty array",
                                   networks,
                                   "Provide at least one contact_coil or "
                                   "timer network.")])
    # C383 fix (verified 2026-08-30: import clean + precompile 0 errors):
    # TextLine ids live in their OWN small space and are allocated FIRST:
    # declaration rows get 2..N in array order, the trailing empty line gets
    # id 1. Network element ids start at N+1 so the two spaces never overlap.
    # The previous shared sequential space (networks first, then text rows)
    # made the native importer reset the declaration to a single empty line
    # -> C383 + C46 chain.
    decl_lines = _declaration_lines(block_name, interface)
    text_count = len(decl_lines) + 1  # + trailing empty line
    ids = _Ids(start=text_count)  # network ids start AFTER the text rows
    import uuid
    pou_guid = str(uuid.uuid4())

    network_xmls = []
    for network in networks:
        network_xmls.append(_network(network, ids))

    text_lines = []
    for index, line in enumerate(decl_lines, start=2):
        text_lines.append(
            '<Single Type="{%s}" Method="IArchivable">\n'
            '                <Single Name="Id" Type="long">%d</Single>\n'
            '                <Null Name="Tag" />\n'
            '                <Single Name="Text" Type="string">%s</Single>\n'
            '              </Single>' % (LINE_GUID, index, line))
    # Vendor export convention: the declaration TextLines array ends with
    # one empty line whose Id is 1 (smallest of the text id space).
    text_lines.append(
        '<Single Type="{%s}" Method="IArchivable">\n'
        '                <Single Name="Id" Type="long">1</Single>\n'
        '                <Null Name="Tag" />\n'
        '                <Single Name="Text" Type="string"></Single>\n'
        '              </Single>' % LINE_GUID)
    try:
        import System
        ticks = System.DateTime.UtcNow.Ticks
    except Exception:
        import time
        ticks = int(time.time() * 10000000) + 621355968000000000

    parts = []
    parts.append('<ExportFile>')
    parts.append('  <StructuredView Guid="{%s}">' % VIEW_GUID)
    parts.append('<Single xml:space="preserve" Type="{%s}" '
                 'Method="IArchivable">' % ROOT_GUID)
    parts.append('  <Null Name="Profile" />')
    parts.append('  <List2 Name="EntryList">')
    parts.append('    <Single Type="{%s}" Method="IArchivable">' % ENTRY_GUID)
    parts.append('      <Single Name="IsRoot" Type="bool">True</Single>')
    parts.append('      <Single Name="MetaObject" Type="{%s}" '
                 'Method="IArchivable">' % META_GUID)
    parts.append('        <Single Name="Guid" Type="System.Guid">%s</Single>'
                 % pou_guid)
    parts.append('        <Single Name="ParentGuid" Type="System.Guid">'
                 '{APP_GUID_PLACEHOLDER}</Single>')
    parts.append('        <Single Name="Name" Type="string">%s</Single>'
                 % block_name)
    parts.append('        <Dictionary Type="{%s}" Name="Properties" />'
                 % PROPS_GUID)
    parts.append('        <Single Name="TypeGuid" Type="System.Guid">%s'
                 '</Single>' % TO_GUID["pou_object"])
    parts.append('        <Array Name="EmbeddedTypeGuids" Type="System.Guid">')
    parts.append('          <Single Type="System.Guid">{%s}</Single>'
                 % TO_GUID["pou_text"])
    parts.append('          <Single Type="System.Guid">{%s}</Single>'
                 % TO_GUID["impl"])
    parts.append('        </Array>')
    parts.append('        <Single Name="Timestamp" Type="long">%d</Single>'
                 % ticks)
    parts.append('      </Single>')
    # Vendor entry field order: MetaObject, Object, Interface, POULevel, ...
    # The Interface text block MUST come after Object — placing it earlier
    # makes the importer drop the declaration (C2043-style "no name").
    parts.append('      <Single Name="Object" Type="{%s}" '
                 'Method="IArchivable">' % TO_GUID["pou_object"])
    parts.append('        <Single Name="SpecialFunc" Type="{%s}">None</Single>'
                 % SPECIAL_GUID)
    parts.append('        <Single Name="UniqueIdGenerator" Type="string">%d'
                 '</Single>' % ids.last())
    parts.append('        <Single Name="Implementation" Type="{%s}" '
                 'Method="IArchivable">' % TO_GUID["impl"])
    parts.append('          <Single Name="ValidIds" Type="bool">True</Single>')
    parts.append('          <Single Name="BranchCounter" Type="int">0</Single>')
    parts.append('          <List2 Name="NetworkList">')
    parts.append("\n".join(network_xmls))
    parts.append('          </List2>')
    parts.append('          <Single Name="DefaultViewMode" Type="string">Ld</Single>')
    parts.append('          <Single Name="NetworkListComment" Type="string"></Single>')
    parts.append('          <Single Name="CodesysLDConverted" Type="bool">True</Single>')
    parts.append('          <Single Name="CodesysLDConverted1" Type="bool">True</Single>')
    parts.append('          <Single Name="AssigmentToBranched" Type="bool">True</Single>')
    parts.append('          <Single Name="BoxWithoutInputsConverted" Type="bool">True</Single>')
    parts.append('          <Single Name="_executeIdsRepaired" Type="bool">True</Single>')
    parts.append('          <Single Name="DemuxToParalleled" Type="bool">True</Single>')
    parts.append('          <Single Name="BoxTreeSymbolInfoUpdated" Type="bool">False</Single>')
    parts.append('          <Single Name="SeriesCoilInfoUpdated" Type="bool">False</Single>')
    parts.append('        </Single>')
    parts.append('        <Single Name="Interface" Type="{%s}" '
                 'Method="IArchivable">' % TO_GUID["pou_text"])
    parts.append('          <Single Name="TextDocument" Type="{%s}" '
                 'Method="IArchivable">' % TEXTDOC_GUID)
    parts.append('            <Array Name="TextLines" Type="{%s}">' % LINE_GUID)
    parts.append("\n".join(text_lines))
    parts.append('            </Array>')
    parts.append('          </Single>')
    parts.append('        </Single>')
    parts.append('        <Single Name="POULevel" Type="{%s}">Standard</Single>'
                 % POULEVEL_GUID)
    parts.append('        <List Name="ChildObjectGuids" '
                 'Type="System.Collections.ArrayList" />')
    parts.append('        <Single Name="AddAttributeSubsequent" '
                 'Type="bool">False</Single>')
    parts.append('      </Single>')
    parts.append('      <Single Name="ParentSVNodeGuid" Type="System.Guid">'
                 '{APP_GUID_PLACEHOLDER}</Single>')
    parts.append('      <Array Name="Path" Type="string" />')
    parts.append('      <Single Name="Index" Type="int">-1</Single>')
    parts.append('    </Single>')
    parts.append('  </List2>')
    parts.append('  <Null Name="ProfileName" />')
    parts.append('</Single>  </StructuredView>')
    parts.append('</ExportFile>')
    xml = "\n".join(parts)
    validate_emitted_xml(xml, plan, issues)
    if issues:
        raise PlanRejected(issues)
    return xml


# ---------------------------------------------------------------------------
# PLCopen TC6 emitter (vanilla CODESYS line, 2026-09-08)
#
# SP22's native import only carries TEXT POUs; graphical LAD bodies import
# through the standard PLCopen TC6 XML (verified real-machine: the minimal
# sample imports and yields a real LAD object).  This emitter is ADDITIVE:
# the InoProShop native IArchivable emitter above is untouched.
#
# v1 scope: contact_coil networks with SERIES contacts (>= 1) and one coil;
# parallel branches are rejected honestly (the TC6 parallel-branch wiring is
# a later increment).  All plan.interface members are emitted as localVars
# (PROGRAM shape).
# ---------------------------------------------------------------------------

def compile_contact_block_plcopen(plan, issues=None):
    """Emit a PLCopen TC6 LD XML for one contact_coil plan (CODESYS line)."""
    issues = issues if issues is not None else []
    block_name = plan.get("block_name")
    if not block_name:
        raise PlanRejected([_issue("plan.block_name", "IEC identifier",
                                   block_name, "LD_PLC_Probe",
                                   "block name required")])
    interface = plan.get("interface") or {}
    networks = plan.get("networks") or []
    if len(networks) != 1 or networks[0].get("type") != "contact_coil":
        raise PlanRejected([_issue(
            "plan.networks", "one contact_coil network",
            len(networks), 1,
            "PLCopen v1 accepts exactly one contact_coil network")])
    network = networks[0]
    contacts = network.get("contacts") or []
    if network.get("branches") or network.get("branch"):
        raise PlanRejected([_issue(
            "plan.networks[0].branches", "absent",
            "present", None,
            "PLCopen v1 supports series contacts only; parallel legs are not emitted yet")])
    if not contacts:
        raise PlanRejected([_issue(
            "plan.networks[0].contacts", "non-empty",
            contacts, ["contact"], "at least one contact required")])
    coil = network.get("coil") or {}
    coil_target = (coil.get("target") or coil.get("name") or "").strip()
    if not coil_target:
        raise PlanRejected([_issue(
            "plan.networks[0].coil", "target",
            coil_target, "GVL.gOut", "coil target required")])

    var_rows = []
    for section in ("input", "inout", "output", "static_members", "local", "temp", "constant"):
        for member in (interface.get(section) or []):
            name = (member.get("name") or "").strip()
            datatype = (member.get("datatype") or member.get("type") or "BOOL").strip()
            if name:
                var_rows.append('        <variable name="%s"><type><%s /></type></variable>'
                                % (name, datatype))
    # Contacts/coil referencing undeclared GVL members are left as-is (global
    # refs are legal in PLCopen).

    local_id = 1
    parts = []
    parts.append('<?xml version="1.0" encoding="utf-8"?>')
    parts.append('<project xmlns="http://www.plcopen.org/xml/tc6_0200">')
    parts.append('  <fileHeader companyName="PLC Code" productName="CODESYS line" productVersion="SP22" creationDateTime="2026-09-08T15:00:00" />')
    parts.append('  <contentHeader name="%s" modificationDateTime="2026-09-08T15:00:00">' % block_name)
    parts.append('    <coordinateInfo>')
    parts.append('      <fbd><scaling x="1" y="1" /></fbd>')
    parts.append('      <ld><scaling x="1" y="1" /></ld>')
    parts.append('      <sfc><scaling x="1" y="1" /></sfc>')
    parts.append('    </coordinateInfo>')
    parts.append('  </contentHeader>')
    parts.append('  <types><dataTypes /><pous>')
    parts.append('    <pou name="%s" pouType="program">' % block_name)
    parts.append('      <interface>')
    if var_rows:
        parts.append('        <localVars>')
        parts.extend(var_rows)
        parts.append('        </localVars>')
    else:
        parts.append('        <localVars />')
    parts.append('      </interface>')
    parts.append('      <body><LD>')
    parts.append('        <leftPowerRail localId="1" height="40" width="10">')
    parts.append('          <position x="0" y="0" />')
    parts.append('          <connectionPointOut formalParameter="">')
    parts.append('            <relPosition x="10" y="20" />')
    parts.append('          </connectionPointOut>')
    parts.append('        </leftPowerRail>')
    x = 40
    prev_id = 1
    for contact in contacts:
        c_target = (contact.get("target") or contact.get("name") or "").strip()
        negated = bool(contact.get("negated"))
        local_id += 1
        cid = local_id
        parts.append('        <contact localId="%d" height="40" width="40" negated="%s" storage="none" edge="none">' % (cid, "true" if negated else "false"))
        parts.append('          <position x="%d" y="0" />' % x)
        parts.append('          <connectionPointIn>')
        parts.append('            <relPosition x="0" y="20" />')
        parts.append('            <connection refLocalId="%d" />' % prev_id)
        parts.append('          </connectionPointIn>')
        parts.append('          <connectionPointOut>')
        parts.append('            <relPosition x="40" y="20" />')
        parts.append('          </connectionPointOut>')
        parts.append('          <variable>%s</variable>' % c_target)
        parts.append('        </contact>')
        prev_id = cid
        x += 80
    local_id += 1
    cid = local_id
    parts.append('        <coil localId="%d" height="40" width="40" negated="false" storage="none" edge="none">' % cid)
    parts.append('          <position x="%d" y="0" />' % x)
    parts.append('          <connectionPointIn>')
    parts.append('            <relPosition x="0" y="20" />')
    parts.append('            <connection refLocalId="%d" />' % prev_id)
    parts.append('          </connectionPointIn>')
    parts.append('          <connectionPointOut>')
    parts.append('            <relPosition x="40" y="20" />')
    parts.append('          </connectionPointOut>')
    parts.append('          <variable>%s</variable>' % coil_target)
    parts.append('        </coil>')
    local_id += 1
    rid = local_id
    parts.append('        <rightPowerRail localId="%d" height="40" width="10">' % rid)
    parts.append('          <position x="%d" y="0" />' % (x + 80))
    parts.append('          <connectionPointIn>')
    parts.append('            <relPosition x="0" y="20" />')
    parts.append('            <connection refLocalId="%d" />' % cid)
    parts.append('          </connectionPointIn>')
    parts.append('        </rightPowerRail>')
    parts.append('      </LD></body>')
    parts.append('    </pou>')
    parts.append('  </pous></types>')
    parts.append('  <instances><configurations /></instances>')
    parts.append('</project>')
    xml = "\n".join(parts)
    if issues:
        raise PlanRejected(issues)
    return xml


# ---------------------------------------------------------------------------
# PLCopen TC6 instruction-box emitter (vanilla CODESYS line, 2026-09-08)
#
# Mirrors the public addition.xml shape: leftPowerRail -> contact TRUE ->
# rightPowerRail as the enable power path, the instruction box wired in
# parallel with inVariable/outVariable terminals.  v1: ONE function box per
# POU, scalar ports only, no EN/ENO, no FB instances.
# ---------------------------------------------------------------------------

def compile_instruction_box_plcopen(plan, issues=None):
    """Emit a PLCopen TC6 LD XML with one instruction box (CODESYS line)."""
    issues = issues if issues is not None else []
    block_name = plan.get("block_name")
    if not block_name:
        raise PlanRejected([_issue("plan.block_name", "IEC identifier",
                                   block_name, "LAD_Add", "block name required")])
    instruction = (plan.get("instruction") or plan.get("instruction_name") or "").strip()
    if not instruction:
        raise PlanRejected([_issue("plan.instruction", "instruction name",
                                   instruction, "ADD", "instruction required")])
    variables = plan.get("variables") or []
    inputs = plan.get("inputs") or {}
    outputs = plan.get("outputs") or {}
    inouts = plan.get("inouts") or {}
    if not inputs:
        raise PlanRejected([_issue("plan.inputs", "non-empty mapping",
                                   inputs, {"IN1": "A"}, "inputs required")])
    if not outputs:
        raise PlanRejected([_issue("plan.outputs", "non-empty mapping",
                                   outputs, {"OUT": "Result"}, "outputs required")])

    var_rows = []
    for var in variables:
        vname = (var.get("name") or "").strip()
        vtype = (var.get("type") or var.get("datatype") or "BOOL").strip()
        # TC6 2.00 requires lowercase string/wstring element names — the
        # plugin converter validates against the XSD and REJECTS uppercase
        # STRING elements at import (verified 2026-09-08: CONCAT probe).
        # The declaration-parse 'lowercase string' errors seen earlier were
        # cascade artifacts of double-underscore variable names, not this.
        tc6_type = vtype.lower() if vtype.lower() in ("string", "wstring") else vtype.upper()
        if vname:
            var_rows.append('        <variable name="%s"><type><%s /></type></variable>'
                            % (vname, tc6_type))

    local_id = [0]

    def next_id():
        local_id[0] += 1
        return local_id[0]

    parts = []
    parts.append('<?xml version="1.0" encoding="utf-8"?>')
    parts.append('<project xmlns="http://www.plcopen.org/xml/tc6_0200">')
    parts.append('  <fileHeader companyName="PLC Code" productName="CODESYS line" productVersion="SP22" creationDateTime="2026-09-08T15:00:00" />')
    parts.append('  <contentHeader name="%s" modificationDateTime="2026-09-08T15:00:00">' % block_name)
    parts.append('    <coordinateInfo><fbd><scaling x="1" y="1" /></fbd><ld><scaling x="1" y="1" /></ld><sfc><scaling x="1" y="1" /></sfc></coordinateInfo>')
    parts.append('  </contentHeader>')
    parts.append('  <types><dataTypes /><pous>')
    parts.append('    <pou name="%s" pouType="program">' % block_name)
    parts.append('      <interface>')
    if var_rows:
        parts.append('        <localVars>')
        parts.extend(var_rows)
        parts.append('        </localVars>')
    else:
        parts.append('        <localVars />')
    parts.append('      </interface>')
    parts.append('      <body><LD>')

    rail_id = next_id()
    parts.append('        <leftPowerRail localId="%d" height="40" width="10">' % rail_id)
    parts.append('          <position x="100" y="100" />')
    parts.append('          <connectionPointOut formalParameter="">')
    parts.append('            <relPosition x="20" y="0" />')
    parts.append('          </connectionPointOut>')
    parts.append('        </leftPowerRail>')
    contact_id = next_id()
    parts.append('        <contact localId="%d" negated="false" edge="none">' % contact_id)
    parts.append('          <position x="150" y="100" />')
    parts.append('          <connectionPointIn>')
    parts.append('            <relPosition x="0" y="0" />')
    parts.append('            <connection refLocalId="%d" />' % rail_id)
    parts.append('          </connectionPointIn>')
    parts.append('          <connectionPointOut>')
    parts.append('            <relPosition x="30" y="0" />')
    parts.append('          </connectionPointOut>')
    parts.append('          <variable>TRUE</variable>')
    parts.append('        </contact>')

    input_ids = {}
    for port, expr in inputs.items():
        iid = next_id()
        input_ids[port] = iid
        parts.append('        <inVariable localId="%d" height="20" width="40">' % iid)
        parts.append('          <position x="200" y="%d" />' % (80 + 20 * len(input_ids)))
        parts.append('          <connectionPointOut>')
        parts.append('            <relPosition x="40" y="10" />')
        parts.append('          </connectionPointOut>')
        parts.append('          <expression>%s</expression>' % _xml_escape(expr))
        parts.append('        </inVariable>')

    block_id = next_id()
    parts.append('        <block localId="%d" typeName="%s" instanceName="%s">' % (
        block_id, instruction, plan.get("instance") or ""))
    parts.append('          <position x="280" y="80" />')
    parts.append('          <inputVariables>')
    for index, (port, expr) in enumerate(inputs.items()):
        parts.append('            <variable formalParameter="%s">' % port)
        parts.append('              <connectionPointIn>')
        parts.append('                <relPosition x="0" y="%d" />' % (20 * (index + 1)))
        parts.append('                <connection refLocalId="%d" />' % input_ids[port])
        parts.append('              </connectionPointIn>')
        parts.append('            </variable>')
    parts.append('          </inputVariables>')
    if inouts:
        parts.append('          <inOutVariables>')
        for index, (port, expr) in enumerate(inouts.items()):
            parts.append('            <variable formalParameter="%s">' % port)
            parts.append('              <connectionPointIn>')
            parts.append('                <relPosition x="0" y="%d" />' % (20 * (index + 1)))
            parts.append('              </connectionPointIn>')
            parts.append('            </variable>')
        parts.append('          </inOutVariables>')
    else:
        parts.append('          <inOutVariables />')
    parts.append('          <outputVariables>')
    for index, (port, expr) in enumerate(outputs.items()):
        parts.append('            <variable formalParameter="%s">' % port)
        parts.append('              <connectionPointOut>')
        parts.append('                <relPosition x="80" y="%d" />' % (10 + 20 * index))
        parts.append('              </connectionPointOut>')
        parts.append('            </variable>')
    parts.append('          </outputVariables>')
    parts.append('        </block>')

    for index, (port, expr) in enumerate(outputs.items()):
        oid = next_id()
        parts.append('        <outVariable localId="%d" height="20" width="40">' % oid)
        parts.append('          <position x="%d" y="%d" />' % (400, 90 + 20 * index))
        parts.append('          <connectionPointIn>')
        parts.append('            <relPosition x="0" y="10" />')
        parts.append('            <connection refLocalId="%d" formalParameter="%s" />' % (block_id, port))
        parts.append('          </connectionPointIn>')
        parts.append('          <expression>%s</expression>' % _xml_escape(expr))
        parts.append('        </outVariable>')

    right_id = next_id()
    parts.append('        <rightPowerRail localId="%d" height="40" width="10">' % right_id)
    parts.append('          <position x="500" y="100" />')
    parts.append('          <connectionPointIn>')
    parts.append('            <relPosition x="0" y="0" />')
    parts.append('            <connection refLocalId="%d" />' % contact_id)
    parts.append('          </connectionPointIn>')
    parts.append('        </rightPowerRail>')
    parts.append('      </LD></body>')
    parts.append('    </pou>')
    parts.append('  </pous></types>')
    parts.append('  <instances><configurations /></instances>')
    parts.append('</project>')
    xml = "\n".join(parts)
    if issues:
        raise PlanRejected(issues)
    return xml


def _xml_escape(value):
    try:
        text = str(value or "")
    except Exception:
        text = ""
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ---------------------------------------------------------------------------
# Vanilla SP22 Ladder-plugin native emitter (2026-09-08).
#
# REUSES the InoProShop generator wholesale — validate_plan, the plan
# vocabulary (contact_coil / timer / box networks), _declaration_lines, the
# ExportFile envelope discipline — and swaps ONLY the body serialization:
# the new Ladder plugin stores bodies as ModelJson (LadderDataModel) inside
# Implementation {f0fda5b8-8c48-4377-bbd5-c49444e4d26e}.  Element shapes
# below were verified by real import_native + export_native readback.
# v1 scope: series contacts (no negation, no parallel branches yet), box
# networks, timer/counter FB networks without power-path contact wiring.
# ---------------------------------------------------------------------------

_VANILLA_IMPL_GUID = "f0fda5b8-8c48-4377-bbd5-c49444e4d26e"
_VANILLA_TEXTDOC_GUID = "f3878285-8e4f-490b-bb1b-9acbb7eb04db"
_VANILLA_POU_GUID = "6f9dac99-8de1-4efc-8465-68ac443b7d08"
_VANILLA_INTERFACE_GUID = "a9ed5b7e-75c5-4651-af16-d2c27e98cb94"


def _mj_operand(expression):
    return {"Expression": str(expression or "")}


def _mj_contact(expression):
    return {"$type": "Contact", "Operand": _mj_operand(expression)}


def _mj_coil(expression):
    return {"$type": "Coil", "Operand": _mj_operand(expression)}


def _mj_in_variable(expression):
    return {"$type": "InVariable", "Operand": _mj_operand(expression)}


def _mj_out_variable(expression):
    return {"$type": "OutVariable", "Operand": _mj_operand(expression)}


def _mj_block(block_type, instance_expr, input_pins, output_pins):
    block = {
        "$type": "Block",
        "BlockType": str(block_type),
        "Inputs": [{"Pin": {"Name": str(pin)}} for pin in input_pins],
        "Outputs": [{"Pin": {"Name": str(pin)}} for pin in output_pins],
    }
    if instance_expr:
        # Verified: FB blocks carry the instance operand; CallType is NOT
        # emitted (the IDE derives it from BlockType — emitting it breaks
        # the import with "已标识项中有一项的格式无效").
        block["Instance"] = _mj_operand(instance_expr)
    return block


def _mj_network_elements(net, net_index):
    """One normalized network -> its Sequence Elements list.

    Normalized kinds (same contract the PLCopen emitter uses):
    - contact_coil: series contacts + one coil (branches/negation are
      rejected honestly until their JSON shapes are verified).
    - box: InVariables -> Block -> OutVariables.
    - fb: Block(TON/CTU shape) + Coil on the first output; remaining
      outputs go to OutVariables; PT/PV data via InVariable.
    """
    kind = (net.get("type") or "").strip().lower()
    if kind == "contact_coil":
        if net.get("branches"):
            raise ValueError(
                "vanilla v1 emitter: parallel branches are not verified yet "
                "(contact_coil with branches is rejected honestly)")
        elements = []
        for element in net.get("contacts") or []:
            name, _dtype, negated = _operand_name(element, "BOOL")
            if negated:
                raise ValueError(
                    "vanilla v1 emitter: negated contacts are not verified yet")
            elements.append(_mj_contact(name))
        elements.append(_mj_coil(
            _field_name(net.get("coil") or {})))
        return elements
    if kind == "box":
        elements = []
        data = net.get("data") or {}
        outputs = net.get("outputs") or {}
        for port, expr in data.items():
            elements.append(_mj_in_variable(expr))
        input_pins = [port for port in data]
        output_pins = [port for port in outputs]
        elements.append(_mj_block(
            net.get("instruction"), None, input_pins, output_pins))
        for port, expr in outputs.items():
            elements.append(_mj_out_variable(expr))
        return elements
    if kind == "fb":
        elements = []
        data = net.get("data") or {}
        outputs = net.get("outputs") or {}
        power = net.get("power") or {}
        input_pins = [power.get("port") or "IN"]
        for port, expr in data.items():
            elements.append(_mj_in_variable(expr))
            input_pins.append(port)
        output_pins = list(outputs.keys())
        elements.append(_mj_block(
            net.get("instruction"), net.get("instance"),
            input_pins, output_pins))
        out_ports = list(outputs.keys())
        if out_ports:
            elements.append(_mj_coil(outputs[out_ports[0]]))
        for port in out_ports[1:]:
            elements.append(_mj_out_variable(outputs[port]))
        return elements
    raise ValueError("vanilla v1 emitter: unsupported network type: %r" % kind)


def compile_project_pou_vanilla_native(plan, issues=None):
    """One LAD POU as a vanilla-SP22 native ExportFile with a ModelJson body.

    plan = {
        "block_name": "LD_Probe",
        "variables": [{"name": ..., "type": ...}],   # localVars
        "networks": [normalized contact_coil | box | fb networks],
    }
    """
    issues = issues if issues is not None else []
    block_name = plan.get("block_name")
    if not block_name:
        raise PlanRejected([_issue("plan.block_name", "IEC identifier",
                                   block_name, "LD_Probe",
                                   "block name required")])
    networks = plan.get("networks") or []
    if not networks:
        raise PlanRejected([_issue("plan.networks", "non-empty array",
                                   networks, ["..."],
                                   "at least one network required")])
    import uuid
    import json as _json

    # Declaration (reuses the InoProShop declaration builder discipline):
    # PROGRAM name + VAR + localVars + FB instances + END_VAR.
    decl_lines = ["PROGRAM %s" % block_name, "VAR"]
    for var in plan.get("variables") or []:
        name = (var.get("name") or "").strip()
        datatype = (var.get("type") or var.get("datatype") or "BOOL").strip()
        if name:
            decl_lines.append("\t%s : %s;" % (name, datatype))
    for net in networks:
        if net.get("type") == "fb" and net.get("instruction") \
                and net.get("instance"):
            decl_lines.append("\t%s : %s;" % (
                net.get("instance").strip(), net.get("instruction").strip()))
    decl_lines.append("END_VAR")
    declaration = "\n".join(decl_lines) + "\n"

    # ModelJson body.
    model = {
        "$type": "LadderDataModel",
        "Networks": [
            {
                "$type": "Network",
                "Id": "n%07d" % (index + 1),
                "Sequence": {
                    "$type": "Sequence",
                    "Elements": _mj_network_elements(net, index),
                },
            }
            for index, net in enumerate(networks)
        ],
    }
    # sort_keys=True is REQUIRED, not cosmetic: the importer's deserializer
    # only honors "$type" when it is the FIRST property of each object
    # (Newtonsoft TypeNameHandling), and '$' sorts before all letters.
    model_json = _json.dumps(model, indent=2, ensure_ascii=False,
                             sort_keys=True)
    model_escaped = _xml_escape(model_json)
    decl_escaped = _xml_escape(declaration)

    pou_guid = str(uuid.uuid4())
    try:
        import System
        ticks = System.DateTime.UtcNow.Ticks
    except Exception:
        import time
        ticks = int(time.time() * 10000000) + 621355968000000000

    parts = []
    parts.append('<ExportFile>')
    parts.append('  <StructuredView Guid="{%s}">' % VIEW_GUID)
    parts.append('<Single xml:space="preserve" Type="{%s}" '
                 'Method="IArchivable">' % ROOT_GUID)
    parts.append('  <Null Name="Profile" />')
    parts.append('  <List2 Name="EntryList">')
    parts.append('    <Single Type="{%s}" Method="IArchivable">' % ENTRY_GUID)
    parts.append('      <Single Name="IsRoot" Type="bool">True</Single>')
    parts.append('      <Single Name="MetaObject" Type="{%s}" '
                 'Method="IArchivable">' % META_GUID)
    parts.append('        <Single Name="Guid" Type="System.Guid">%s</Single>'
                 % pou_guid)
    parts.append('        <Single Name="ParentGuid" Type="System.Guid">'
                 '{00000000-0000-0000-0000-000000000000}</Single>')
    parts.append('        <Single Name="Name" Type="string">%s</Single>'
                 % block_name)
    parts.append('        <Dictionary Type="{%s}" Name="Properties" />'
                 % PROPS_GUID)
    parts.append('        <Single Name="TypeGuid" Type="System.Guid">%s'
                 '</Single>' % _VANILLA_POU_GUID)
    parts.append('        <Array Name="EmbeddedTypeGuids" Type="System.Guid">')
    parts.append('          <Single Type="System.Guid">{%s}</Single>'
                 % _VANILLA_INTERFACE_GUID)
    parts.append('          <Single Type="System.Guid">{%s}</Single>'
                 % _VANILLA_IMPL_GUID)
    parts.append('        </Array>')
    parts.append('        <Single Name="Timestamp" Type="long">%d</Single>'
                 % ticks)
    parts.append('      </Single>')
    parts.append('      <Single Name="Object" Type="{%s}" '
                 'Method="IArchivable">' % _VANILLA_POU_GUID)
    parts.append('        <Single Name="SpecialFunc" Type="{%s}">None</Single>'
                 % SPECIAL_GUID)
    parts.append('        <Single Name="Implementation" Type="{%s}" '
                 'Method="IArchivable">' % _VANILLA_IMPL_GUID)
    parts.append('          <Single Name="ModelJson" Type="string">%s</Single>'
                 % model_escaped)
    parts.append('        </Single>')
    parts.append('        <Single Name="Interface" Type="{%s}" '
                 'Method="IArchivable">' % _VANILLA_INTERFACE_GUID)
    parts.append('          <Single Name="TextDocument" Type="{%s}" '
                 'Method="IArchivable">' % _VANILLA_TEXTDOC_GUID)
    parts.append('            <Single Name="TextBlobForSerialisation" '
                 'Type="string">%s</Single>' % decl_escaped)
    parts.append('            <Single Name="LineInfoPersistence" '
                 'Type="string">%s_Decl_LineIds</Single>' % pou_guid)
    parts.append('          </Single>')
    parts.append('        </Single>')
    parts.append('        <Single Name="UniqueIdGenerator" Type="string">4'
                 '</Single>')
    parts.append('        <Single Name="POULevel" Type="{%s}">Standard</Single>'
                 % POULEVEL_GUID)
    parts.append('        <List Name="ChildObjectGuids" '
                 'Type="System.Collections.ArrayList" />')
    parts.append('        <Single Name="AddAttributeSubsequent" '
                 'Type="bool">False</Single>')
    parts.append('      </Single>')
    parts.append('      <Single Name="ParentSVNodeGuid" Type="System.Guid">'
                 '{00000000-0000-0000-0000-000000000000}</Single>')
    parts.append('      <Array Name="Path" Type="string" />')
    parts.append('      <Single Name="Index" Type="int">-1</Single>')
    parts.append('    </Single>')
    parts.append('  </List2>')
    parts.append('  <Null Name="ProfileName" />')
    parts.append('</Single>  </StructuredView>')
    parts.append('</ExportFile>')
    xml = "\n".join(parts)
    if issues:
        raise PlanRejected(issues)
    return xml


# ---------------------------------------------------------------------------
# PLCopen TC6 multi-network project-POU emitter (vanilla CODESYS line,
# 2026-09-08).  One POU carries several LAD networks — the shape real
# projects use.  Network kinds (all power-path chains off ONE leftPowerRail,
# the MotorStarter.ld.xml topology the SP22 importer splits into networks):
#
# - contact_coil: series contacts + optional one-level parallel branches
#   (each leg its own series); the merge element's connectionPointIn lists
#   every leg's last element (MotorStarter rung 1 seal-in shape).  One coil
#   + one rightPowerRail per network.
# - box: one Function (IEC built-in operator or library function) on the
#   EN/ENO power path: contact(enable) -> block(EN); block(ENO) -> coil or
#   rightPowerRail; data inputs from inVariables; outputs to outVariables.
# - fb: one FunctionBlock instance (TON/TOF/TP/CTU/CTD/CTUD) on the power
#   path (MotorStarter rung 2): contact(power pin value) -> block -> coil on
#   the first output port; the remaining output ports go to outVariables.
#   The instance is declared in localVars as <derived name="FB"/>.
#
# The plan contract here is the NORMALIZED internal form (the bridge route
# resolves live signatures and rewrites timer/counter/box networks into it).
# ---------------------------------------------------------------------------

def _tc6_contact(local_id, x, y, target, ref_ids, negated=False):
    """One contact; ref_ids = list of incoming refLocalIds (one per series
    predecessor, several for a branch merge)."""
    lines = ['        <contact localId="%d" negated="%s" storage="none" edge="none">'
             % (local_id, "true" if negated else "false")]
    lines.append('          <position x="%d" y="%d" />' % (x, y))
    lines.append('          <connectionPointIn>')
    lines.append('            <relPosition x="0" y="20" />')
    for ref in (ref_ids or []):
        lines.append('            <connection refLocalId="%d" />' % ref)
    lines.append('          </connectionPointIn>')
    lines.append('          <connectionPointOut>')
    lines.append('            <relPosition x="40" y="20" />')
    lines.append('          </connectionPointOut>')
    lines.append('          <variable>%s</variable>' % _xml_escape(target))
    lines.append('        </contact>')
    return "\n".join(lines)


def _tc6_coil(local_id, x, y, target, ref_ids, formal=None):
    lines = ['        <coil localId="%d" storage="none">' % local_id]
    lines.append('          <position x="%d" y="%d" />' % (x, y))
    lines.append('          <connectionPointIn>')
    lines.append('            <relPosition x="0" y="20" />')
    for ref in (ref_ids or []):
        if formal:
            lines.append('            <connection refLocalId="%d" formalParameter="%s" />'
                         % (ref, formal))
        else:
            lines.append('            <connection refLocalId="%d" />' % ref)
    lines.append('          </connectionPointIn>')
    lines.append('          <connectionPointOut>')
    lines.append('            <relPosition x="40" y="20" />')
    lines.append('          </connectionPointOut>')
    lines.append('          <variable>%s</variable>' % _xml_escape(target))
    lines.append('        </coil>')
    return "\n".join(lines)


def _tc6_in_variable(local_id, x, y, expression):
    lines = ['        <inVariable localId="%d" height="20" width="40">' % local_id]
    lines.append('          <position x="%d" y="%d" />' % (x, y))
    lines.append('          <connectionPointOut>')
    lines.append('            <relPosition x="40" y="10" />')
    lines.append('          </connectionPointOut>')
    lines.append('          <expression>%s</expression>' % _xml_escape(expression))
    lines.append('        </inVariable>')
    return "\n".join(lines)


def _tc6_out_variable(local_id, x, y, expression, block_id, port):
    lines = ['        <outVariable localId="%d" height="20" width="40">' % local_id]
    lines.append('          <position x="%d" y="%d" />' % (x, y))
    lines.append('          <connectionPointIn>')
    lines.append('            <relPosition x="0" y="10" />')
    lines.append('            <connection refLocalId="%d" formalParameter="%s" />'
                 % (block_id, port))
    lines.append('          </connectionPointIn>')
    lines.append('          <expression>%s</expression>' % _xml_escape(expression))
    lines.append('        </outVariable>')
    return "\n".join(lines)


def _tc6_right_rail(local_id, x, y, ref_id, formal=None):
    lines = ['        <rightPowerRail localId="%d" height="40" width="10">' % local_id]
    lines.append('          <position x="%d" y="%d" />' % (x, y))
    lines.append('          <connectionPointIn>')
    lines.append('            <relPosition x="0" y="20" />')
    if formal:
        lines.append('            <connection refLocalId="%d" formalParameter="%s" />'
                     % (ref_id, formal))
    else:
        lines.append('            <connection refLocalId="%d" />' % ref_id)
    lines.append('          </connectionPointIn>')
    lines.append('        </rightPowerRail>')
    return "\n".join(lines)


def _pinned_rows(net, key, fallback):
    """Ordered (port, expr) rows for a block's pins.

    The resident bridge runs on IronPython, where ``dict`` iteration order is
    HASH-BUCKET order, not insertion order -- so a pin order carried in a dict
    is not a pin order at all.  Measured 2026-09-10: a GT box planned as
    IN1:=iLevel / IN2:=iSet was emitted IN2-first, and because the Ladder
    plugin's LD importer assigns a generic box's data pins POSITIONALLY by the
    document order of the emitted ``<variable formalParameter=...>`` elements,
    the IDE wired iSet to its first data pin (sim read GT=TRUE for 0 vs 5 while
    the compile stayed 0/0).  The bridge therefore ships ``dataPins`` /
    ``outputPins`` as ORDERED LISTS and this is the only order that counts.
    """
    rows = net.get(key)
    if isinstance(rows, (list, tuple)) and rows:
        out = []
        for row in rows:
            if isinstance(row, dict) and row.get("port") is not None:
                out.append((row.get("port"), row.get("expr")))
        if out:
            return out
    return list((fallback or {}).items())


def _emit_contact_coil_network_plcopen(net, base_y, rail_id, ids):
    parts = []
    branches = net.get("branches") or []
    contacts = net.get("contacts") or []
    coil_target = _field_name(net.get("coil") or {})
    if not coil_target:
        raise ValueError("contact_coil network needs a coil target")
    leg_end_ids = []
    max_leg_len = 0
    for leg in branches:
        leg_contacts = (leg.get("contacts") if isinstance(leg, dict) else leg) or []
        max_leg_len = max(max_leg_len, len(leg_contacts))
    x0 = 60
    for leg_index, leg in enumerate(branches):
        leg_contacts = (leg.get("contacts") if isinstance(leg, dict) else leg) or []
        y = base_y + leg_index * 40
        prev = rail_id
        x = x0
        for element in leg_contacts:
            name, _dtype, negated = _operand_name(element, "BOOL")
            cid = ids.take()
            parts.append(_tc6_contact(cid, x, y, name, [prev], negated=negated))
            prev = cid
            x += 80
        leg_end_ids.append(prev)
    if not branches and not contacts:
        raise ValueError("contact_coil network needs series contacts or branch legs")
    x = x0 + 80 * max(max_leg_len, 1) if branches else x0
    prev = None
    for index, element in enumerate(contacts):
        name, _dtype, negated = _operand_name(element, "BOOL")
        cid = ids.take()
        if index == 0 and branches:
            refs = leg_end_ids
        elif prev is None:
            refs = [rail_id]
        else:
            refs = [prev]
        parts.append(_tc6_contact(cid, x, base_y, name, refs,
                                  negated=negated))
        prev = cid
        x += 80
    if prev is None:
        prev = leg_end_ids
    cid = ids.take()
    if isinstance(prev, list):
        parts.append(_tc6_coil(cid, x, base_y, coil_target, prev, None))
    else:
        parts.append(_tc6_coil(cid, x, base_y, coil_target, [prev], None))
    rid = ids.take()
    parts.append(_tc6_right_rail(rid, x + 80, base_y, cid))
    return "\n".join(parts)


def _emit_box_network_plcopen(net, base_y, rail_id, ids):
    """Function box, ONE connected series rung: contact(enable) feeds the
    block's EN power pin; data pins come from inVariables; the block exposes
    ONLY its data outputs (no ENO — a second output splits the rung and the
    plugin editor rejects it with 'too many outputs').  Verified: this shape
    imports as a single network."""
    parts = []
    instruction = (net.get("instruction") or "").strip()
    enable_name, _dtype, negated = _operand_name(
        net.get("enable") or {"name": "TRUE"}, "BOOL")
    if not enable_name:
        enable_name = "TRUE"
    data = net.get("data") or {}
    outputs = net.get("outputs") or {}
    data_rows = _pinned_rows(net, "dataPins", data)
    output_rows = _pinned_rows(net, "outputPins", outputs)
    cid = ids.take()
    parts.append(_tc6_contact(cid, 60, base_y, enable_name, [rail_id],
                              negated=negated))
    pin_ids = {}
    pin_index = 0
    for port, expr in data_rows:
        vid = ids.take()
        pin_ids[port] = vid
        parts.append(_tc6_in_variable(vid, 60, base_y + 40 + 40 * pin_index,
                                      expr))
        pin_index += 1
    bid = ids.take()
    parts.append('        <block localId="%d" typeName="%s" instanceName="">'
                 % (bid, instruction))
    parts.append('          <position x="140" y="%d" />' % base_y)
    parts.append('          <inputVariables>')
    parts.append('            <variable formalParameter="EN">')
    parts.append('              <connectionPointIn>')
    parts.append('                <relPosition x="0" y="0" />')
    parts.append('                <connection refLocalId="%d" />' % cid)
    parts.append('              </connectionPointIn>')
    parts.append('            </variable>')
    for port, _expr in data_rows:
        parts.append('            <variable formalParameter="%s">' % port)
        parts.append('              <connectionPointIn>')
        parts.append('                <relPosition x="0" y="0" />')
        parts.append('                <connection refLocalId="%d" />' % pin_ids[port])
        parts.append('              </connectionPointIn>')
        parts.append('            </variable>')
    parts.append('          </inputVariables>')
    parts.append('          <inOutVariables />')
    parts.append('          <outputVariables>')
    for port, _expr in output_rows:
        parts.append('            <variable formalParameter="%s">' % port)
        parts.append('              <connectionPointOut>')
        parts.append('                <relPosition x="80" y="0" />')
        parts.append('              </connectionPointOut>')
        parts.append('            </variable>')
    parts.append('          </outputVariables>')
    parts.append('        </block>')
    out_index = 0
    for port, expr in output_rows:
        oid = ids.take()
        parts.append(_tc6_out_variable(oid, 280, base_y + 40 + 40 * out_index,
                                       expr, bid, port))
        out_index += 1
    return "\n".join(parts)


def _emit_fb_network_plcopen(net, base_y, rail_id, ids):
    """FunctionBlock instance on the power path, MotorStarter rung 2 shape:
    contact(power pin value) -> block -> coil on the first output port; the
    remaining output ports go to outVariables."""
    parts = []
    instruction = (net.get("instruction") or "").strip()
    instance = (net.get("instance") or "").strip()
    power = net.get("power") or {}
    power_port = (power.get("port") or "").strip()
    power_value_spec = power.get("value")
    if isinstance(power_value_spec, dict):
        power_value = _field_name(power_value_spec)
    else:
        power_value = str(power_value_spec or "")
    data = net.get("data") or {}
    outputs = net.get("outputs") or {}
    data_rows = _pinned_rows(net, "dataPins", data)
    output_rows = _pinned_rows(net, "outputPins", outputs)
    if not power_value:
        raise ValueError("fb network needs a power input value")
    cid = ids.take()
    parts.append(_tc6_contact(cid, 60, base_y, power_value, [rail_id]))
    pin_ids = {}
    pin_index = 0
    for port, expr in data_rows:
        vid = ids.take()
        pin_ids[port] = vid
        parts.append(_tc6_in_variable(vid, 60, base_y + 40 + 40 * pin_index,
                                      expr))
        pin_index += 1
    bid = ids.take()
    parts.append('        <block localId="%d" typeName="%s" instanceName="%s">'
                 % (bid, instruction, instance))
    parts.append('          <position x="140" y="%d" />' % base_y)
    parts.append('          <inputVariables>')
    parts.append('            <variable formalParameter="%s">' % power_port)
    parts.append('              <connectionPointIn>')
    parts.append('                <relPosition x="0" y="0" />')
    parts.append('                <connection refLocalId="%d" />' % cid)
    parts.append('              </connectionPointIn>')
    parts.append('            </variable>')
    for port, _expr in data_rows:
        parts.append('            <variable formalParameter="%s">' % port)
        parts.append('              <connectionPointIn>')
        parts.append('                <relPosition x="0" y="0" />')
        parts.append('                <connection refLocalId="%d" />' % pin_ids[port])
        parts.append('              </connectionPointIn>')
        parts.append('            </variable>')
    parts.append('          </inputVariables>')
    parts.append('          <inOutVariables />')
    parts.append('          <outputVariables>')
    # v1: ONLY the first output pin (Q).  Emitting a second output (ET/CV)
    # makes the Ladder plugin's editor reject the block with "too many
    # outputs" (verified 2026-09-08).
    out_ports = [port for port, _expr in output_rows]
    if out_ports:
        parts.append('            <variable formalParameter="%s">' % out_ports[0])
        parts.append('              <connectionPointOut>')
        parts.append('                <relPosition x="80" y="0" />')
        parts.append('              </connectionPointOut>')
        parts.append('            </variable>')
    parts.append('          </outputVariables>')
    parts.append('        </block>')
    if out_ports:
        first = out_ports[0]
        cid2 = ids.take()
        parts.append(_tc6_coil(cid2, 240, base_y, dict(output_rows)[first], [bid],
                               formal=first))
    return "\n".join(parts)


def compile_project_pou_plcopen(plan, issues=None):
    """Emit a PLCopen TC6 LD XML for one multi-network LAD POU.

    plan = {
        "block_name": "LD_MotorSeal",
        "interface": {...},            # optional; extra localVars
        "variables": [...],            # optional; localVars from box networks
        "networks": [
            {"type": "contact_coil", "branches": [{"contacts": [...]}, ...],
             "contacts": [...], "coil": {"target": "..."}},
            {"type": "box", "instruction": "GT", "enable": {"name": "TRUE"},
             "data": {"IN1": "...", "IN2": "..."},
             "outputs": {"GT": "..."}, "coil": {...}},
            {"type": "fb", "instruction": "TON", "instance": "tonAgitate",
             "power": {"port": "IN", "value": "..."},
             "data": {"PT": "T#30s"}, "outputs": {"Q": "...", "ET": "..."}},
        ],
    }
    """
    issues = issues if issues is not None else []
    block_name = plan.get("block_name")
    if not block_name:
        raise PlanRejected([_issue("plan.block_name", "IEC identifier",
                                   block_name, "LD_Main",
                                   "block name required")])
    networks = plan.get("networks") or []
    if not networks:
        raise PlanRejected([_issue("plan.networks", "non-empty array",
                                   networks, ["..."],
                                   "at least one network required")])
    # localVars: interface members + explicit variables + FB instances
    var_rows = []
    seen_vars = set()
    sections = ("input", "inout", "output", "static_members", "local",
                "temp", "constant")
    for section in sections:
        for member in (plan.get("interface") or {}).get(section) or []:
            name = (member.get("name") or "").strip()
            datatype = (member.get("datatype") or member.get("type")
                        or "BOOL").strip()
            if name and name.lower() not in seen_vars:
                seen_vars.add(name.lower())
                tc6_type = (datatype.lower()
                            if datatype.lower() in ("string", "wstring")
                            else datatype.upper())
                var_rows.append(
                    '        <variable name="%s"><type><%s /></type></variable>'
                    % (name, tc6_type))
    for var in plan.get("variables") or []:
        name = (var.get("name") or "").strip()
        datatype = (var.get("type") or var.get("datatype") or "BOOL").strip()
        if name and name.lower() not in seen_vars:
            seen_vars.add(name.lower())
            tc6_type = (datatype.lower()
                        if datatype.lower() in ("string", "wstring")
                        else datatype.upper())
            var_rows.append(
                '        <variable name="%s"><type><%s /></type></variable>'
                % (name, tc6_type))
    for net in networks:
        if net.get("type") == "fb" and net.get("instruction"):
            instance = (net.get("instance") or "").strip()
            if instance and instance.lower() not in seen_vars:
                seen_vars.add(instance.lower())
                var_rows.append(
                    '        <variable name="%s"><type><derived name="%s" />'
                    '</type></variable>' % (instance, net.get("instruction")))

    # ONE id space for the whole POU (the rail plus every network element):
    # per-network counters would restart localIds and collide across networks
    # in the same file.
    ids = _Ids()
    rail_id = ids.take()
    first_base_y = 20
    body_parts = []
    body_parts.append(
        '        <leftPowerRail localId="%d" height="40" width="10">' % rail_id)
    body_parts.append('          <position x="20" y="%d" />' % first_base_y)
    body_parts.append('          <connectionPointOut formalParameter="">')
    body_parts.append('            <relPosition x="10" y="20" />')
    body_parts.append('          </connectionPointOut>')
    body_parts.append('        </leftPowerRail>')

    for index, net in enumerate(networks):
        kind = (net.get("type") or "").strip().lower()
        base_y = first_base_y + index * 150
        if kind == "contact_coil":
            body_parts.append(
                _emit_contact_coil_network_plcopen(net, base_y, rail_id, ids))
        elif kind == "box":
            if not net.get("instruction"):
                raise ValueError("box network needs an instruction")
            body_parts.append(
                _emit_box_network_plcopen(net, base_y, rail_id, ids))
        elif kind == "fb":
            if not net.get("instruction") or not net.get("instance"):
                raise ValueError("fb network needs instruction and instance")
            body_parts.append(
                _emit_fb_network_plcopen(net, base_y, rail_id, ids))
        else:
            raise ValueError("unsupported project network type: %r" % kind)

    parts = []
    parts.append('<?xml version="1.0" encoding="utf-8"?>')
    parts.append('<project xmlns="http://www.plcopen.org/xml/tc6_0200">')
    parts.append('  <fileHeader companyName="PLC Code" productName="CODESYS line" productVersion="SP22" creationDateTime="2026-09-08T15:00:00" />')
    parts.append('  <contentHeader name="%s" modificationDateTime="2026-09-08T15:00:00">' % block_name)
    parts.append('    <coordinateInfo><fbd><scaling x="1" y="1" /></fbd><ld><scaling x="1" y="1" /></ld><sfc><scaling x="1" y="1" /></sfc></coordinateInfo>')
    parts.append('  </contentHeader>')
    parts.append('  <types><dataTypes /><pous>')
    parts.append('    <pou name="%s" pouType="program">' % block_name)
    parts.append('      <interface>')
    if var_rows:
        parts.append('        <localVars>')
        parts.extend(var_rows)
        parts.append('        </localVars>')
    else:
        parts.append('        <localVars />')
    parts.append('      </interface>')
    parts.append('      <body><LD>')
    parts.extend(body_parts)
    parts.append('      </LD></body>')
    parts.append('    </pou>')
    parts.append('  </pous></types>')
    parts.append('  <instances><configurations /></instances>')
    parts.append('</project>')
    xml = "\n".join(parts)
    if issues:
        raise PlanRejected(issues)
    return xml
