"""Pure contracts recovered from the installed InoProShop SoftMotion plugin."""

from __future__ import print_function


def _text(value):
    if value is None:
        return ""
    try:
        return unicode(value)
    except NameError:
        return str(value)


def build_cia402_connector_xml(connector_id, device_id="FFFF 0001"):
    """Return ClassHelper.CreateConnector-compatible XML.

    Values and defaults mirror AddInoCiA402Connector in the installed vendor
    plugin. This function performs no IDE or project mutation.
    """
    try:
        connector_id = int(connector_id)
    except Exception:
        raise ValueError("connectorId must be an integer")
    if connector_id < 1000:
        raise ValueError("connectorId must be >= 1000")
    device_id = _text(device_id).strip()
    if not device_id:
        raise ValueError("deviceId must be non-empty")
    return (
        '<Connector connectorId="%d" explicit="false" hostpath="1" '
        'interface="Common.SoftMotion.EtherCAT.DSP402" moduleType="1279" '
        'role="parent">\r\n'
        '  <Slot allowEmpty="true" count="1">\r\n'
        '    <DefaultModule>\r\n'
        '      <DeviceIdentification deviceType="1027" deviceId="%s" '
        'version="4.0.0.0" />\r\n'
        '    </DefaultModule>\r\n'
        '  </Slot>\r\n'
        '</Connector>\r\n'
    ) % (connector_id, device_id)

