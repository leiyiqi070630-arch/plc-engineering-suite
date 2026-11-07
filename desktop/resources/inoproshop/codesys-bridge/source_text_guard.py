"""Validation helpers for IEC source payloads."""


def has_literal_linebreak_escape(value):
    """Return True when a payload contains backslash+n instead of a line feed."""
    value = value or ""
    return "\\n" in value and "\n" not in value
