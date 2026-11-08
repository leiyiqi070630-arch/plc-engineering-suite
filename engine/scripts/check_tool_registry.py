#!/usr/bin/env python3
"""Check that the engine tool registry, contract files, and docs stay in sync.

Run from the engine directory:
    python scripts/check_tool_registry.py
Only Python's standard library is required.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ENGINE_ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ENGINE_ROOT / "spec" / "tool_contracts" / "tools_index.json"
CONTRACTS_DIR = ENGINE_ROOT / "spec" / "tool_contracts" / "tools"
APP_PATH = ENGINE_ROOT / "crates" / "plceng-engine" / "src" / "app.rs"
CONTRACT_INDEX_DOC = ENGINE_ROOT / "spec" / "tool_contracts" / "TOOLS.md"
TOOL_DOC = ENGINE_ROOT / "docs" / "03-工具目录.md"

PERMISSION_TO_CODE = {
    "ReadOnly": "r",
    "WorkspaceWrite": "w",
    "DangerFullAccess": "d",
}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def markdown_permissions(path: Path) -> dict[str, str]:
    content = path.read_text(encoding="utf-8")
    rows = re.findall(
        r"^\|\s*\x60([^\x60]+)\x60\s*\|\s*(ReadOnly|WorkspaceWrite|DangerFullAccess)\s*\|",
        content,
        flags=re.MULTILINE,
    )
    result = dict(rows)
    if len(result) != len(rows):
        fail(f"{path.relative_to(ENGINE_ROOT)} contains duplicate tool rows")
    return result


def main() -> None:
    if not INDEX_PATH.is_file():
        fail(f"missing {INDEX_PATH}")
    entries = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    if not isinstance(entries, list):
        fail("tools_index.json must be a JSON array")

    names = [entry.get("name") for entry in entries]
    if not all(isinstance(name, str) and name for name in names):
        fail("every index entry must have a non-empty name")
    if len(names) != len(set(names)):
        fail("tools_index.json contains duplicate names")

    expected: dict[str, str] = {}
    for entry in entries:
        name = entry["name"]
        permission = entry.get("permission")
        if permission not in PERMISSION_TO_CODE:
            fail(f"{name}: unknown permission {permission!r}")
        expected[name] = permission

        contract_path = CONTRACTS_DIR / f"{name}.json"
        if not contract_path.is_file():
            fail(f"{name}: missing contract file {contract_path}")
        contract_file = json.loads(contract_path.read_text(encoding="utf-8"))
        contract = contract_file.get("contract", {})
        if contract.get("name") != name:
            fail(f"{name}: contract name mismatch")
        if contract.get("permission") != permission:
            fail(
                f"{name}: index permission {permission} != "
                f"contract permission {contract.get('permission')}"
            )
        if not isinstance(contract.get("inputSchema"), dict):
            fail(f"{name}: missing inputSchema")

    app_text = APP_PATH.read_text(encoding="utf-8")
    marker = "const TOOLS:"
    if marker not in app_text:
        fail("app.rs has no const TOOLS registry")
    registry_block = app_text.split(marker, 1)[1].split("];", 1)[0]
    app_rows = re.findall(r'\("([^"]+)",\s*"([rwd])"\)', registry_block)
    app_registry = dict(app_rows)
    if len(app_registry) != len(app_rows):
        fail("app.rs contains duplicate tool names")
    if set(app_registry) != set(expected):
        missing = sorted(set(expected) - set(app_registry))
        extra = sorted(set(app_registry) - set(expected))
        fail(f"app.rs registry names differ; missing={missing}, extra={extra}")
    for name, permission in expected.items():
        actual = app_registry[name]
        wanted = PERMISSION_TO_CODE[permission]
        if actual != wanted:
            fail(f"{name}: app.rs permission {actual!r} != expected {wanted!r}")

    for path in (CONTRACT_INDEX_DOC, TOOL_DOC):
        actual = markdown_permissions(path)
        if set(actual) != set(expected):
            missing = sorted(set(expected) - set(actual))
            extra = sorted(set(actual) - set(expected))
            fail(
                f"{path.relative_to(ENGINE_ROOT)} tool rows differ; "
                f"missing={missing}, extra={extra}"
            )
        for name, permission in expected.items():
            if actual[name] != permission:
                fail(
                    f"{path.relative_to(ENGINE_ROOT)}: {name} permission "
                    f"{actual[name]} != {permission}"
                )

    counts = Counter(expected.values())
    print(
        "OK: "
        f"{len(expected)} tools; "
        f"ReadOnly={counts['ReadOnly']}, "
        f"WorkspaceWrite={counts['WorkspaceWrite']}, "
        f"DangerFullAccess={counts['DangerFullAccess']}. "
        "Contract files, app.rs, and both tool indexes are synchronized."
    )


if __name__ == "__main__":
    main()
