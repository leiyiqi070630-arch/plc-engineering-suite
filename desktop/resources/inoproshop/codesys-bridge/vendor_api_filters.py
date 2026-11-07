"""Pure helpers for selecting loaded InoProShop assemblies."""

DEFAULT_VENDOR_ASSEMBLY_FILTERS = (
    "inovance", "inodeviceeditor", "inoaxis", "inoonline",
    "inoproject", "inocompile", "inoobject", "inosoftmotion",
    # Standard object plug-in families (not vendor-prefixed): the
    # alarm/trace/symbol object assemblies live here and were invisible to
    # the default filter (round-19 evidence: Alarm and Trace searches
    # returned identical vendor lists without a single target type).
    "alarmconfiguration", "inotrace", "symbolconfig",
)


def normalize_vendor_assembly_filters(value=None):
    """Return lower-case OR filters for a comma-separated assembly selector."""
    if value:
        try:
            raw = value.decode("utf-8") if isinstance(value, bytes) else value
        except Exception:
            raw = value
        return [item.strip().lower() for item in str(raw).split(",")
                if item.strip()][:20]
    return list(DEFAULT_VENDOR_ASSEMBLY_FILTERS)
