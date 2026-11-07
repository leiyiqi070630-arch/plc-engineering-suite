import sys, re, json, os

TARGET = r"C:\Users\lei\Documents\xwechat_files\wxid_rlo5zl8xifkt22_4149\msg\file\2026-11\PLC-Code-BYOK-2.1.13-Portable.exe"

with open(TARGET, "rb") as f:
    data = f.read()

print("size", len(data))

def find_all(pat, limit=8):
    out = []
    start = 0
    while len(out) < limit:
        i = data.find(pat, start)
        if i < 0:
            break
        out.append(i)
        start = i + 1
    return out

markers = {
    "7z_SFX":        b"7z\xbc\xaf\x27\x1c",
    "RAR":           b"Rar!\x1a\x07",
    "CAB_MSCF":      b"MSCF",
    "Nullsoft":      b"Nullsoft",
    "NSIS":          b"NSIS",
    "InnoSetup":     b"Inno Setup",
    "electron_str":  b"electron",
    "app_asar":      b"app.asar",
    "asar_hdr":      b'"files":{',
    "node_dll":      b"node.dll",
    "v8_snapshot":   b"v8_context_snapshot",
    "pyi_magic":     b"MEI\x0c\x0b\x0a\x0b\x0e",
    "PyInstaller":   b"PyInstaller",
    "python3":       b"python3",
    "python_dll":    b"python31",
    "tauri":         b"tauri",
    "nwjs":          b"nw.dll",
    "Qt5Core":       b"Qt5Core",
    "Qt6Core":       b"Qt6Core",
    "mscoree":       b"mscoree.dll",
    "dotnet_meta":   b"BSJB",
    "PE":            b"PE\x00\x00",
    "UPX":           b"UPX!",
    "AutoIt":        b"AU3!",
    "Golang":        b"Go build ID",
    "Rust":          b"rustc",
    "wails":         b"wails",
    "flutter":       b"libflutter",
    "CEF":           b"libcef",
    "chrome_elf":    b"chrome_elf",
    "angular":       b"ng-version",
    "react":         b"react-dom",
}

res = {}
for name, pat in markers.items():
    hits = find_all(pat, limit=6)
    res[name] = hits
    print(f"{name:14s} {len(hits):2d} {hits[:6]}")

# count MZ headers in first 300MB
mz = []
start = 0
while True:
    i = data.find(b"MZ", start)
    if i < 0:
        break
    mz.append(i)
    if len(mz) > 400:
        break
    start = i + 1
print("MZ count(capped 400):", len(mz))
print("first MZs:", mz[:20])

with open(os.path.join(os.path.dirname(__file__), "scan_result.json"), "w", encoding="utf-8") as f:
    json.dump(res, f, indent=1)
