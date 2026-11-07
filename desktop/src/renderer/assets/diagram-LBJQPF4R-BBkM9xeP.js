import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { _ as v2, A as v3, D as v4, e as v5, l as v6, b as v7, a as v8, n as v9, o as v10, g as v11, s as v12, y as v13, B as v14, p as v15 } from "./index-CXb3UsfP.js";
import { p as v16 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var DEFAULT_PACKET_CONFIG = v14.packet;
var PacketDB = class {
  constructor() {
    this.packet = [];
    this.setAccTitle = v7;
    this.getAccTitle = v8;
    this.setDiagramTitle = v9;
    this.getDiagramTitle = v10;
    this.getAccDescription = v11;
    this.setAccDescription = v12;
  }
  static {
    v2(this, "PacketDB");
  }
  getConfig() {
    const v17 = v3({
      ...DEFAULT_PACKET_CONFIG,
      ...v13().packet
    });
    if (v17.showBits) {
      v17.paddingY += 10;
    }
    return v17;
  }
  getPacket() {
    return this.packet;
  }
  pushWord(v18) {
    if (v18.length > 0) {
      this.packet.push(v18);
    }
  }
  clear() {
    v15();
    this.packet = [];
  }
};
var maxPacketSize = 10000;
var populate = v2((v19, v20) => {
  v1(v19, v20);
  let v21 = -1;
  let v22 = [];
  let v23 = 1;
  const {
    bitsPerRow: v24
  } = v20.getConfig();
  for (let {
    start: v25,
    end: v26,
    bits: v27,
    label: v28
  } of v19.blocks) {
    if (v25 !== undefined && v26 !== undefined && v26 < v25) {
      throw new Error("Packet block " + v25 + " - " + v26 + " is invalid. End must be greater than start.");
    }
    v25 ??= v21 + 1;
    if (v25 !== v21 + 1) {
      throw new Error("Packet block " + v25 + " - " + (v26 ?? v25) + " is not contiguous. It should start from " + (v21 + 1) + ".");
    }
    if (v27 === 0) {
      throw new Error("Packet block " + v25 + " is invalid. Cannot have a zero bit field.");
    }
    v26 ??= v25 + (v27 ?? 1) - 1;
    v27 ??= v26 - v25 + 1;
    v21 = v26;
    v6.debug("Packet block " + v25 + " - " + v21 + " with label " + v28);
    while (v22.length <= v24 + 1 && v20.getPacket().length < maxPacketSize) {
      const [v29, v30] = getNextFittingBlock({
        start: v25,
        end: v26,
        bits: v27,
        label: v28
      }, v23, v24);
      v22.push(v29);
      if (v29.end + 1 === v23 * v24) {
        v20.pushWord(v22);
        v22 = [];
        v23++;
      }
      if (!v30) {
        break;
      }
      ({
        start: v25,
        end: v26,
        bits: v27,
        label: v28
      } = v30);
    }
  }
  v20.pushWord(v22);
}, "populate");
var getNextFittingBlock = v2((v31, v32, v33) => {
  if (v31.start === undefined) {
    throw new Error("start should have been set during first phase");
  }
  if (v31.end === undefined) {
    throw new Error("end should have been set during first phase");
  }
  if (v31.start > v31.end) {
    throw new Error("Block start " + v31.start + " is greater than block end " + v31.end + ".");
  }
  if (v31.end + 1 <= v32 * v33) {
    return [v31, undefined];
  }
  const v34 = v32 * v33 - 1;
  const v35 = v32 * v33;
  return [{
    start: v31.start,
    end: v34,
    label: v31.label,
    bits: v34 - v31.start
  }, {
    start: v35,
    end: v31.end,
    label: v31.label,
    bits: v31.end - v35
  }];
}, "getNextFittingBlock");
var parser = {
  parser: {
    yy: undefined
  },
  parse: v2(async v36 => {
    const v37 = await v16("packet", v36);
    const v38 = parser.parser?.yy;
    if (!(v38 instanceof PacketDB)) {
      throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");
    }
    v6.debug(v37);
    populate(v37, v38);
  }, "parse")
};
var draw = v2((v39, v40, v41, v42) => {
  const v43 = v42.db;
  const v44 = v43.getConfig();
  const {
    rowHeight: v45,
    paddingY: v46,
    bitWidth: v47,
    bitsPerRow: v48
  } = v44;
  const v49 = v43.getPacket();
  const v50 = v43.getDiagramTitle();
  const v51 = v45 + v46;
  const v52 = v51 * (v49.length + 1) - (v50 ? 0 : v45);
  const v53 = v47 * v48 + 2;
  const v54 = v4(v40);
  v54.attr("viewBox", "0 0 " + v53 + " " + v52);
  v5(v54, v52, v53, v44.useMaxWidth);
  for (const [v55, v56] of v49.entries()) {
    drawWord(v54, v56, v55, v44);
  }
  v54.append("text").text(v50).attr("x", v53 / 2).attr("y", v52 - v51 / 2).attr("dominant-baseline", "middle").attr("text-anchor", "middle").attr("class", "packetTitle");
}, "draw");
var drawWord = v2((v57, v58, v59, {
  rowHeight: v60,
  paddingX: v61,
  paddingY: v62,
  bitWidth: v63,
  bitsPerRow: v64,
  showBits: v65
}) => {
  const v66 = v57.append("g");
  const v67 = v59 * (v60 + v62) + v62;
  for (const v68 of v58) {
    const v69 = v68.start % v64 * v63 + 1;
    const v70 = (v68.end - v68.start + 1) * v63 - v61;
    v66.append("rect").attr("x", v69).attr("y", v67).attr("width", v70).attr("height", v60).attr("class", "packetBlock");
    v66.append("text").attr("x", v69 + v70 / 2).attr("y", v67 + v60 / 2).attr("class", "packetLabel").attr("dominant-baseline", "middle").attr("text-anchor", "middle").text(v68.label);
    if (!v65) {
      continue;
    }
    const v71 = v68.end === v68.start;
    const v72 = v67 - 2;
    v66.append("text").attr("x", v69 + (v71 ? v70 / 2 : 0)).attr("y", v72).attr("class", "packetByte start").attr("dominant-baseline", "auto").attr("text-anchor", v71 ? "middle" : "start").text(v68.start);
    if (!v71) {
      v66.append("text").attr("x", v69 + v70).attr("y", v72).attr("class", "packetByte end").attr("dominant-baseline", "auto").attr("text-anchor", "end").text(v68.end);
    }
  }
}, "drawWord");
var renderer = {
  draw: draw
};
var defaultPacketStyleOptions = {
  byteFontSize: "10px",
  startByteColor: "black",
  endByteColor: "black",
  labelColor: "black",
  labelFontSize: "12px",
  titleColor: "black",
  titleFontSize: "14px",
  blockStrokeColor: "black",
  blockStrokeWidth: "1",
  blockFillColor: "#efefef"
};
var styles = v2(({
  packet: v73
} = {}) => {
  const v74 = v3(defaultPacketStyleOptions, v73);
  return "\n\t.packetByte {\n\t\tfont-size: " + v74.byteFontSize + ";\n\t}\n\t.packetByte.start {\n\t\tfill: " + v74.startByteColor + ";\n\t}\n\t.packetByte.end {\n\t\tfill: " + v74.endByteColor + ";\n\t}\n\t.packetLabel {\n\t\tfill: " + v74.labelColor + ";\n\t\tfont-size: " + v74.labelFontSize + ";\n\t}\n\t.packetTitle {\n\t\tfill: " + v74.titleColor + ";\n\t\tfont-size: " + v74.titleFontSize + ";\n\t}\n\t.packetBlock {\n\t\tstroke: " + v74.blockStrokeColor + ";\n\t\tstroke-width: " + v74.blockStrokeWidth + ";\n\t\tfill: " + v74.blockFillColor + ";\n\t}\n\t";
}, "styles");
var diagram = {
  parser: parser,
  get db() {
    return new PacketDB();
  },
  renderer: renderer,
  styles: styles
};
export { diagram };