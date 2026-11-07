"""Edit native EasyBuilder Pro Recipe Database definitions in an exported SQLite .db.

The only field descriptor this module can create is the observed
SQLite INT UNSIGNED, .info ItemType=0, Size=2 row. The vendor's human-readable
type label for ItemType=0 has not been independently read back. Its other
metadata columns are copied from a caller-selected original-vendor item or
from the small observed seed below when explicitly requested.
The resulting database still requires an EasyBuilder Pro import/readback.
"""

import hashlib
import json
import pathlib
import re
import sqlite3
import sys
from contextlib import closing


RECIPE_NAME = re.compile(r"[A-Za-z0-9]+\Z")
ITEM_NAME = re.compile(r"[A-Za-z0-9_]+\Z")
INFO_COLUMNS = (
    "ItemName", "ItemType", "Size", "Decimal_PT", "DisplayWidth",
    "Alignment", "LabelName", "LimitEnable", "LimitMinimum", "LimitMaximum",
)
NATIVE_TYPE = "INT UNSIGNED"
NATIVE_TYPE_ID = 0
NATIVE_SIZE = 2
# Observed in original-vendor CN421/cMT3071 export native-recipe.db,
# SHA256 C67AF3762F4F59F86E802A7BE3BF00D00C094E7E529593084A3B76EE2392C806.
# This is a field/schema seed, not a model-specific project or a claimed .rdef.
SEED_ID = "observed_recipe_db_int_unsigned_itemtype0_size2_v1"
SEED_INFO_ROW = ("NewItem", 0, 2, 0, 5, 0, "", 0, 0.0, 99.0)
SEED_INFO_COLUMNS_SQL = (
    '("ItemName" TEXT,"ItemType" INT UNSIGNED,"Size" INT UNSIGNED,'
    '"Decimal_PT" INT UNSIGNED,"DisplayWidth" INT UNSIGNED,'
    '"Alignment" INT UNSIGNED,"LabelName" TEXT,"LimitEnable" INT UNSIGNED,'
    '"LimitMinimum" REAL,"LimitMaximum" REAL)'
)


def quote(name):
    return '"' + name.replace('"', '""') + '"'


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(65536), b""):
            h.update(block)
    return h.hexdigest().upper()


def original_database(path):
    path = pathlib.Path(path).resolve(strict=True)
    with path.open("rb") as stream:
        signature = stream.read(16)
    if path.suffix.lower() != ".db" or signature != b"SQLite format 3\x00":
        raise ValueError("Existing native SQLite Recipe Database .db required")
    return path


def native_catalog(db):
    tables = {
        name for (name,) in db.execute("SELECT name FROM sqlite_master WHERE type='table'")
        if not name.startswith("sqlite_")
    }
    result = {}
    for recipe in sorted(tables):
        if recipe.endswith(".info"):
            if recipe[:-5] not in tables:
                raise ValueError("Orphan native .info table: " + recipe)
            continue
        if recipe + ".info" not in tables:
            continue
        fields = db.execute("PRAGMA table_info(" + quote(recipe) + ")").fetchall()
        info_columns = [row[1] for row in db.execute("PRAGMA table_info(" + quote(recipe + ".info") + ")")]
        if tuple(info_columns) != INFO_COLUMNS:
            raise ValueError("Native .info metadata schema differs: " + recipe)
        info = db.execute("SELECT * FROM " + quote(recipe + ".info") + " ORDER BY rowid").fetchall()
        names = [row[1] for row in fields]
        if not fields or names != [row[0] for row in info] or len(names) != len(set(names)):
            raise ValueError("Native recipe columns and .info rows disagree: " + recipe)
        result[recipe] = {"fields": fields, "info": info,
                          "count": db.execute("SELECT COUNT(*) FROM " + quote(recipe)).fetchone()[0]}
    return result


def validate_name(name, pattern, label):
    if not isinstance(name, str) or not pattern.fullmatch(name):
        raise ValueError(label + " must follow native alphanumeric naming")
    return name


def native_template(db, catalog, request):
    source_recipe = request.get("template_recipe")
    source_item = request.get("template_item")
    if (source_recipe is None) != (source_item is None):
        raise ValueError("Template recipe and item must be specified together")
    if source_recipe is None or source_item is None:
        if request.get("initialization") == SEED_ID:
            return SEED_INFO_ROW
        raise ValueError("Original-vendor template_recipe/template_item or explicit observed initialization required")
    if source_recipe not in catalog:
        raise ValueError("Template recipe absent from original-vendor database")
    definition = catalog[source_recipe]
    for column, info in zip(definition["fields"], definition["info"]):
        if column[1] == source_item:
            if column[2].upper() != NATIVE_TYPE or info[1] != NATIVE_TYPE_ID or info[2] != NATIVE_SIZE:
                raise ValueError("Only observed INT UNSIGNED / ItemType=0 / Size=2 template is supported")
            return info
    raise ValueError("Template item absent from original-vendor definition")


def table_snapshots(db, names):
    result = {}
    for name in names:
        sql = db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (name,)).fetchone()[0]
        h = hashlib.sha256()
        for row in db.execute("SELECT * FROM " + quote(name) + " ORDER BY rowid"):
            h.update(repr(row).encode("utf-8"))
            h.update(b"\n")
        result[name] = (sql, h.hexdigest())
    return result


def record_values_snapshot(db, recipe, field_count):
    h = hashlib.sha256()
    for row in db.execute("SELECT rowid,* FROM " + quote(recipe) + " ORDER BY rowid"):
        h.update(repr(row[:field_count + 1]).encode("utf-8"))
        h.update(b"\n")
    return h.hexdigest()


def info_sql(db, template_recipe, new_recipe):
    if template_recipe is None:
        return "CREATE TABLE " + quote(new_recipe + ".info") + " " + SEED_INFO_COLUMNS_SQL
    original = db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?",
                          (template_recipe + ".info",)).fetchone()[0]
    prefix = "CREATE TABLE " + quote(template_recipe + ".info")
    if not original.startswith(prefix):
        raise ValueError("Original-vendor .info CREATE TABLE statement differs")
    return "CREATE TABLE " + quote(new_recipe + ".info") + original[len(prefix):]


def typed_default(value):
    if type(value) is not int or not 0 <= value <= 65535:
        raise ValueError("Observed two-byte unsigned field default must be 0 through 65535")
    return value


def apply(db, catalog, request, donor_db, donor_catalog):
    edits = request.get("edits")
    if not isinstance(edits, list) or not 1 <= len(edits) <= 100:
        raise ValueError("One to 100 definition edits required")
    template = None
    edited_recipes = set()
    for edit in edits:
        if not isinstance(edit, dict):
            raise ValueError("Definition edit must be an object")
        action = edit.get("action")
        recipe = validate_name(edit.get("recipe"), RECIPE_NAME, "Recipe name")
        if action == "create_recipe":
            if template is None:
                template = native_template(donor_db, donor_catalog, request)
            if recipe in catalog or recipe + ".info" in catalog:
                raise ValueError("Recipe already exists: " + recipe)
            if len(catalog) >= 100:
                raise ValueError("Native maximum of 100 recipe definitions reached")
            fields = edit.get("fields")
            if not isinstance(fields, list) or not 1 <= len(fields) <= 1000:
                raise ValueError("New recipe needs one to 1000 fields")
            names = [validate_name(field, ITEM_NAME, "Item name") for field in fields]
            if len(set(names)) != len(names):
                raise ValueError("Recipe field names must be unique")
            db.execute("CREATE TABLE " + quote(recipe) + " (" +
                       ",".join(quote(name) + " " + NATIVE_TYPE for name in names) + ")")
            db.execute(info_sql(donor_db, request.get("template_recipe"), recipe))
            db.executemany("INSERT INTO " + quote(recipe + ".info") + " VALUES (?,?,?,?,?,?,?,?,?,?)",
                           [(name,) + tuple(template[1:]) for name in names])
        elif action == "add_field":
            if template is None:
                template = native_template(donor_db, donor_catalog, request)
            if recipe not in catalog:
                raise ValueError("Existing recipe required to add a field")
            field = validate_name(edit.get("field"), ITEM_NAME, "Item name")
            if field in [column[1] for column in catalog[recipe]["fields"]]:
                raise ValueError("Field already exists")
            if len(catalog[recipe]["fields"]) >= 1000:
                raise ValueError("Native maximum of 1000 fields reached")
            default = typed_default(edit.get("default", 0))
            db.execute("ALTER TABLE " + quote(recipe) + " ADD COLUMN " + quote(field) + " " + NATIVE_TYPE)
            db.execute("UPDATE " + quote(recipe) + " SET " + quote(field) + "=?", (default,))
            db.execute("INSERT INTO " + quote(recipe + ".info") + " VALUES (?,?,?,?,?,?,?,?,?,?)",
                       (field,) + tuple(template[1:]))
        elif action == "rename_field":
            if recipe not in catalog:
                raise ValueError("Existing recipe required to rename a field")
            old = validate_name(edit.get("field"), ITEM_NAME, "Current item name")
            new = validate_name(edit.get("new_name"), ITEM_NAME, "New item name")
            names = [column[1] for column in catalog[recipe]["fields"]]
            if old not in names or new in names:
                raise ValueError("Current field absent or new name already used")
            db.execute("ALTER TABLE " + quote(recipe) + " RENAME COLUMN " + quote(old) + " TO " + quote(new))
            db.execute("UPDATE " + quote(recipe + ".info") + " SET ItemName=? WHERE ItemName=?", (new, old))
        else:
            raise ValueError("Definition action must be create_recipe, add_field or rename_field")
        edited_recipes.add(recipe)
        catalog = native_catalog(db)
    return catalog, edited_recipes


def run(request):
    source = original_database(request["source_db"]) if request.get("source_db") else None
    if source is None and not request.get("template_db") and request.get("initialization") != SEED_ID:
        raise ValueError("New database requires an original-vendor template or explicit observed initialization")
    output = pathlib.Path(request["output_db"]).resolve()
    if output.suffix.lower() != ".db" or output.exists() or output == source or not output.parent.is_dir():
        raise ValueError("Fresh distinct output .db in an existing directory required")
    donor_path = (original_database(request["template_db"]) if request.get("template_db")
                  else source if request.get("template_recipe") and request.get("template_item")
                  else None)
    source_hash = digest(source) if source else None
    donor_hash = digest(donor_path) if donor_path else None
    original_connection = (sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)
                           if source else sqlite3.connect(":memory:"))
    donor_connection = (sqlite3.connect(donor_path.as_uri() + "?mode=ro", uri=True)
                        if donor_path else sqlite3.connect(":memory:"))
    with closing(original_connection) as original, closing(donor_connection) as donor:
        if original.execute("PRAGMA integrity_check").fetchone()[0] != "ok" or \
           donor.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise ValueError("Native SQLite integrity check failed")
        before = native_catalog(original)
        donor_catalog = native_catalog(donor)
        before_tables = [name for (name,) in original.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")]
        before_snapshot = table_snapshots(original, before_tables)
        before_values = {name: record_values_snapshot(original, name, len(item["fields"]))
                         for name, item in before.items()}
        try:
            with closing(sqlite3.connect(output)) as edited:
                original.backup(edited)
                edited.execute("BEGIN IMMEDIATE")
                after, touched = apply(edited, before, request, donor, donor_catalog)
                edited.commit()
                if edited.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                    raise ValueError("Edited SQLite integrity check failed")
                changed_tables = {table for recipe in touched for table in (recipe, recipe + ".info")}
                unchanged_tables = [table for table in before_tables if table not in changed_tables]
                if table_snapshots(edited, unchanged_tables) != {
                    table: before_snapshot[table] for table in unchanged_tables
                }:
                    raise ValueError("Existing untouched recipe changed")
                for recipe in set(before) & touched:
                    old = before[recipe]
                    new = after[recipe]
                    if new["count"] != old["count"]:
                        raise ValueError("Existing recipe records count changed")
                    if record_values_snapshot(edited, recipe, len(old["fields"])) != before_values[recipe]:
                        raise ValueError("Existing recipe record values changed")
                response = {"ok": True, "source_db": str(source) if source else None,
                            "source_sha256": source_hash,
                            "template_db": str(donor_path) if donor_path else None,
                            "template_sha256": donor_hash,
                            "initialization": request.get("initialization"),
                            "output_db": str(output), "edited_recipes": sorted(touched),
                            "type_scope": "observed_INT_UNSIGNED_ItemType0_Size2_only",
                            "recipes": {name: {"fields": [col[1] for col in item["fields"]],
                                               "records": item["count"]} for name, item in after.items()},
                            "existing_untouched_recipes_preserved": True,
                            "original_vendor_import_verified": False}
        except Exception:
            if output.exists():
                output.unlink()
            raise
    if (source and digest(source) != source_hash) or (donor_path and digest(donor_path) != donor_hash):
        raise ValueError("Original-vendor source/template changed during definition edit")
    response["output_sha256"] = digest(output)
    return response


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: RecipeDatabaseDefinition.py request.json response.json")
    response_path = pathlib.Path(sys.argv[2])
    if response_path.exists() or not response_path.parent.is_dir():
        raise SystemExit("Fresh response path required")
    try:
        response = run(json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8-sig")))
        code = 0
    except Exception as error:
        response = {"ok": False, "error": str(error)}
        code = 1
    response_path.write_text(json.dumps(response, ensure_ascii=False, indent=2), encoding="utf-8")
    raise SystemExit(code)
