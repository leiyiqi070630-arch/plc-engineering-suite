"""asar 解包器：解析 Electron asar 格式，重构文件树。
格式：
  uint32 = 4 (pickle header size)
  uint32 = header size
  uint32 = header object size (含 json string)
  uint32 = json length
  json  (文件树)
  之后是拼接的文件数据，offset 相对于 data 起点
"""
import json, os, struct, sys

def extract(asar_path, out_dir):
    with open(asar_path, "rb") as f:
        blob = f.read()
    # 前 16 字节 pickle
    hdr_size = struct.unpack_from("<I", blob, 12)[0]
    header = blob[16:16 + hdr_size].decode("utf-8")
    tree = json.loads(header)
    data_start = 16 + hdr_size
    base = os.path.abspath(out_dir)
    count = 0
    total = 0
    links = []
    for path, node in walk(tree):
        node = node
        target = os.path.join(base, path)
        if node.get("link"):
            links.append((path, node["link"]))
            continue
        if "files" in node:
            os.makedirs(target, exist_ok=True)
            continue
        os.makedirs(os.path.dirname(target), exist_ok=True)
        off = int(node.get("offset", 0))
        size = int(node.get("size", 0))
        with open(target, "wb") as o:
            o.write(blob[data_start + off: data_start + off + size])
        count += 1
        total += size
        if node.get("unpacked"):
            links.append((path, "<UNPACKED>"))
    return count, total, links


def walk(node, prefix=""):
    for name, child in node.get("files", {}).items():
        p = name if not prefix else prefix + "/" + name
        if "files" in child:
            yield from walk(child, p)
        else:
            yield p, child


if __name__ == "__main__":
    src = sys.argv[1]
    dst = sys.argv[2]
    c, t, links = extract(src, dst)
    print(f"extracted {c} files, {t/1024/1024:.1f} MB -> {dst}")
    if links:
        print("links/unpacked:", len(links))
        for p, l in links[:50]:
            print("  ", p, "->", l)
