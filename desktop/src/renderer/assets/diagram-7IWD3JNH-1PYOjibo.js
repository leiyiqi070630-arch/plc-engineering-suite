import { I as v1 } from "./chunk-2Q5K7J3B-CRp8dvLz.js";
import { p as v2 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { n as v3, b as v4, s as v5, o as v6, g as v7, a as v8, _ as v9, A as v10, l as v11, D as v12, e as v13, y as v14, p as v15, i as v16, ai as v17, B as v18, aj as v19 } from "./index-CXb3UsfP.js";
import { p as v20 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var ALL_BOX_CHARS = /[─━│┃└┗├┣]/;
var BRANCH_CHAR = /[└┗├┣]/;
var DASH_CHAR = /[─━]/;
var DECORATION_ONLY = /^[\s│┃]+$/;
var METADATA_LINE = /^\s*(title[\t ]|accTitle[\t ]*:|accDescr[\t ]*[:{])/;
var COMMENT_LINE = /^\s*%%/;
var INDENT_UNIT = "    ";
function isBoxDrawingFormat(v21) {
  return v21.some(v22 => ALL_BOX_CHARS.test(v22));
}
v9(isBoxDrawingFormat, "isBoxDrawingFormat");
function inferSegmentWidth(v23) {
  for (const v24 of v23) {
    const v25 = BRANCH_CHAR.exec(v24);
    if (v25?.index && v25.index > 0) {
      return v25.index;
    }
  }
  return 4;
}
v9(inferSegmentWidth, "inferSegmentWidth");
function remapErrorLines(v26, v27) {
  return v26.replace(/\bline\s+(\d+)\b/gi, (v28, v29) => {
    const v30 = parseInt(v29, 10);
    const v31 = v27.get(v30);
    if (v31) {
      return "line " + v31;
    } else {
      return v28;
    }
  });
}
v9(remapErrorLines, "remapErrorLines");
function preprocessBoxDrawing(v32) {
  const v33 = v32.split("\n");
  const v34 = new Map();
  let v35 = -1;
  for (const [v36, v37] of v33.entries()) {
    if (v37.trim() === "treeView-beta") {
      v35 = v36;
      break;
    }
  }
  if (v35 === -1) {
    return {
      text: v32,
      lineMap: v34
    };
  }
  const v38 = [];
  for (let v39 = v35 + 1; v39 < v33.length; v39++) {
    const v40 = v33[v39];
    const v41 = v40.trim();
    if (v41 === "" || COMMENT_LINE.test(v40) || METADATA_LINE.test(v40)) {
      continue;
    }
    if (DECORATION_ONLY.test(v40)) {
      continue;
    }
    v38.push(v40.replace(/\t/g, "    "));
  }
  if (!isBoxDrawingFormat(v38)) {
    return {
      text: v32,
      lineMap: v34
    };
  }
  const v42 = inferSegmentWidth(v38);
  const v43 = [];
  let v44 = 0;
  for (let v45 = 0; v45 <= v35; v45++) {
    v43.push(v33[v45]);
    v44++;
    v34.set(v44, v45 + 1);
  }
  for (let v46 = v35 + 1; v46 < v33.length; v46++) {
    const v47 = v33[v46];
    const v48 = v47.trim();
    const v49 = v46 + 1;
    if (v48 === "") {
      v43.push(v47);
      v44++;
      v34.set(v44, v49);
      continue;
    }
    if (COMMENT_LINE.test(v47)) {
      v43.push(v47);
      v44++;
      v34.set(v44, v49);
      continue;
    }
    if (METADATA_LINE.test(v47)) {
      v43.push(v47);
      v44++;
      v34.set(v44, v49);
      continue;
    }
    if (DECORATION_ONLY.test(v47)) {
      continue;
    }
    const v50 = v47.replace(/\t/g, "    ");
    const v51 = BRANCH_CHAR.exec(v50);
    if (v51?.index !== undefined) {
      const v52 = v51.index;
      const v53 = Math.round(v52 / v42) + 1;
      let v54 = v52 + 1;
      while (v54 < v50.length && DASH_CHAR.test(v50[v54])) {
        v54++;
      }
      while (v54 < v50.length && v50[v54] === " ") {
        v54++;
      }
      const v55 = v50.slice(v54).trimEnd();
      if (!v55) {
        throw new Error("Line " + v49 + ": Empty node — expected a filename or directory name after the box-drawing prefix");
      }
      const v56 = INDENT_UNIT.repeat(v53);
      v43.push(v56 + v55);
      v44++;
      v34.set(v44, v49);
    } else if (/^[\s─━│┃└┗├┣]+$/.test(v50)) {
      continue;
    } else if (ALL_BOX_CHARS.test(v50)) {
      v43.push(v47);
      v44++;
      v34.set(v44, v49);
    } else if (/^\s+/.test(v50)) {
      throw new Error("Line " + v49 + ": Unexpected indentation without box-drawing characters. In box-drawing format, use ├── or └── prefixes for indented nodes.");
    } else {
      v43.push(v47);
      v44++;
      v34.set(v44, v49);
    }
  }
  return {
    text: v43.join("\n"),
    lineMap: v34
  };
}
v9(preprocessBoxDrawing, "preprocessBoxDrawing");
var state = new v1(() => ({
  cnt: 1,
  stack: [{
    id: 0,
    level: -1,
    name: "/",
    nodeType: "directory",
    children: []
  }]
}));
var clear2 = v9(() => {
  state.reset();
  v15();
}, "clear");
var getRoot = v9(() => {
  return state.records.stack[0];
}, "getRoot");
var getCount = v9(() => state.records.cnt, "getCount");
var defaultConfig = v18.treeView;
var getConfig2 = v9(() => {
  return v10(defaultConfig, v14().treeView);
}, "getConfig");
var addNode = v9((v57, v58, v59, v60, v61, v62) => {
  while (v57 <= state.records.stack[state.records.stack.length - 1].level) {
    state.records.stack.pop();
  }
  const v63 = {
    id: state.records.cnt++,
    level: v57,
    name: v58,
    nodeType: v59,
    icon: v61,
    cssClass: v60,
    description: v62,
    children: []
  };
  state.records.stack[state.records.stack.length - 1].children.push(v63);
  state.records.stack.push(v63);
}, "addNode");
var db = {
  clear: clear2,
  addNode: addNode,
  getRoot: getRoot,
  getCount: getCount,
  getConfig: getConfig2,
  getAccTitle: v8,
  getAccDescription: v7,
  getDiagramTitle: v6,
  setAccDescription: v5,
  setAccTitle: v4,
  setDiagramTitle: v3
};
var db_default = db;
var populate = v9(v64 => {
  v2(v64, db_default);
  for (const v65 of v64.nodes) {
    const v66 = typeof v65.indent === "number" ? v65.indent : 0;
    let v67 = v65.name;
    const v68 = v67.endsWith("/");
    if (v68) {
      v67 = v67.slice(0, -1);
    }
    const v69 = v68 ? "directory" : "file";
    const v70 = v65.classAnnotation || undefined;
    const v71 = v65.iconAnnotation;
    const v72 = v71 !== undefined ? v71 || "none" : undefined;
    const v73 = v65.descAnnotation || undefined;
    const v74 = v73 ? v16(v73, v14()) : undefined;
    db_default.addNode(v66, v67, v69, v70, v72, v74);
  }
}, "populate");
var parser = {
  parse: v9(async v75 => {
    const {
      text: v76,
      lineMap: v77
    } = preprocessBoxDrawing(v75);
    try {
      const v78 = await v20("treeView", v76);
      v11.debug(v78);
      populate(v78);
    } catch (v79) {
      if (v77.size > 0 && v79 instanceof Error) {
        v79.message = remapErrorLines(v79.message, v77);
      }
      throw v79;
    }
  }, "parse")
};
var treeViewIcons = {
  prefix: "mermaid-treeview",
  height: 24,
  width: 24,
  icons: {
    folder: {
      body: "<path fill=\"currentColor\" d=\"M10.59 4.59A2 2 0 0 0 9.17 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.17z\"/>"
    },
    file: {
      body: "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.83a2 2 0 0 0-.59-1.42l-4.82-4.82A2 2 0 0 0 13.17 2H6Zm7.5 1.9l4.6 4.6h-3.6a1 1 0 0 1-1-1V3.9Z\" clip-rule=\"evenodd\"/>"
    }
  }
};
function detectIcon(v80, v81) {
  const v82 = v81?.filenameIcons?.[v80];
  if (v82) {
    return v82;
  }
  const v83 = v80.lastIndexOf(".");
  if (v83 > 0) {
    const v84 = v80.substring(v83).toLowerCase();
    const v85 = v81?.extensionIcons;
    return v85?.[v84] ?? v85?.[v84.slice(1)];
  }
  return undefined;
}
v9(detectIcon, "detectIcon");
function qualifyIcon(v86, v87) {
  if (v86.includes(":")) {
    return v86;
  }
  if (v86 in treeViewIcons.icons || !v87) {
    return treeViewIcons.prefix + ":" + v86;
  }
  return v87 + ":" + v86;
}
v9(qualifyIcon, "qualifyIcon");
function getNodeIcon(v88, v89) {
  if (v88.icon === "none") {
    return undefined;
  }
  if (v88.icon) {
    return qualifyIcon(v88.icon, v89.defaultIconPack);
  }
  if (!v89.showIcons) {
    return undefined;
  }
  if (v88.nodeType === "file") {
    const v90 = detectIcon(v88.name, v89);
    if (v90 === "none") {
      return undefined;
    }
    if (v90) {
      return qualifyIcon(v90, v89.defaultIconPack);
    }
  }
  return treeViewIcons.prefix + ":" + (v88.nodeType === "directory" ? "folder" : "file");
}
v9(getNodeIcon, "getNodeIcon");
v19([{
  name: treeViewIcons.prefix,
  icons: treeViewIcons
}]);
var ICON_SIZE = 14;
var ICON_GAP = 4;
var DESC_GAP = 16;
var iconSymbolId = v9((v91, v92) => "tv-icon-" + v91 + "-" + v92.replace(/[^\w-]/g, "-"), "iconSymbolId");
var injectIconDefs = v9(async (v93, v94, v95, v96) => {
  const v97 = new Set();
  const v98 = v9(v99 => {
    const v100 = getNodeIcon(v99, v95);
    if (v100) {
      v97.add(v100);
    }
    v99.children.forEach(v98);
  }, "collect");
  v98(v94);
  if (v97.size === 0) {
    return;
  }
  const v101 = await Promise.all([...v97].map(async v102 => ({
    icon: v102,
    svg: await v17(v102, {
      height: ICON_SIZE,
      width: ICON_SIZE
    })
  })));
  const v103 = v93.append("defs");
  for (const {
    icon: v104,
    svg: v105
  } of v101) {
    v103.append("g").attr("id", iconSymbolId(v96, v104)).html(v105);
  }
}, "injectIconDefs");
var positionLabel = v9((v106, v107, v108, v109, v110, v111) => {
  const v112 = v109.append("g");
  let v113 = "treeView-node-label";
  if (v108.nodeType === "directory") {
    v113 += " treeView-node-dir";
  }
  if (v108.cssClass) {
    v113 += " " + v108.cssClass;
  }
  const v114 = ICON_SIZE + ICON_GAP;
  const v115 = getNodeIcon(v108, v110);
  const v116 = v115 !== undefined;
  if (v115) {
    v112.append("use").attr("xlink:href", "#" + iconSymbolId(v111, v115)).attr("x", v106 + v110.paddingX).attr("y", v107 + v110.paddingY).attr("class", "treeView-node-icon");
  }
  const v117 = v112.append("text").text(v108.name).attr("dominant-baseline", "middle").attr("class", v113);
  const {
    height: v118,
    width: v119
  } = v117.node().getBBox();
  const v120 = v118 + v110.paddingY * 2;
  const v121 = v106 + v110.paddingX + (v116 ? v114 : 0);
  v117.attr("x", v121);
  v117.attr("y", v107 + v120 / 2);
  const v122 = v121 + v119;
  const v123 = v119 + v110.paddingX * 2 + (v116 ? v114 : 0);
  v108.BBox = {
    x: v106,
    y: v107,
    width: v123,
    height: v120
  };
  if (v108.cssClass?.split(/\s+/).includes("highlight")) {
    v112.insert("rect", ":first-child").attr("x", v106).attr("y", v107 + 1).attr("width", 0).attr("height", v120 - 2).attr("rx", 3).attr("class", "treeView-highlight-bg");
  }
  return {
    node: v108,
    nodeGroup: v112,
    labelRightEdge: v122,
    centerY: v107 + v120 / 2
  };
}, "positionLabel");
var positionLine = v9((v124, v125, v126, v127, v128, v129) => {
  return v124.append("line").attr("x1", v125).attr("y1", v126).attr("x2", v127).attr("y2", v128).attr("stroke-width", v129).attr("class", "treeView-node-line");
}, "positionLine");
var drawTree = v9((v130, v131, v132, v133) => {
  let v134 = 0;
  let v135 = 0;
  const v136 = [];
  const v137 = v9((v138, v139, v140, v141) => {
    const v142 = v141 * (v140.rowIndent + v140.paddingX);
    const v143 = positionLabel(v142, v134, v139, v138, v140, v133);
    v136.push(v143);
    const {
      height: v144,
      width: v145
    } = v139.BBox;
    positionLine(v138, v142 - v140.rowIndent, v134 + v144 / 2, v142, v134 + v144 / 2, v140.lineThickness);
    v135 = Math.max(v135, v142 + v145);
    v134 += v144;
  }, "drawNode");
  const v146 = v9((v147, v148 = 0) => {
    v137(v130, v147, v132, v148);
    v147.children.forEach(v149 => {
      v146(v149, v148 + 1);
    });
    const {
      x: v150,
      y: v151,
      height: v152
    } = v147.BBox;
    if (v147.children.length) {
      const {
        y: v153,
        height: v154
      } = v147.children[v147.children.length - 1].BBox;
      positionLine(v130, v150 + v132.paddingX, v151 + v152, v150 + v132.paddingX, v153 + v154 / 2 + v132.lineThickness / 2, v132.lineThickness);
    }
  }, "processNode");
  v146(v131);
  const v155 = v136.filter(v156 => v156.node.description);
  if (v155.length > 0) {
    const v157 = Math.max(...v136.map(v158 => v158.labelRightEdge));
    const v159 = v157 + DESC_GAP;
    for (const v160 of v155) {
      const v161 = v160.nodeGroup.append("text").text(v160.node.description).attr("dominant-baseline", "middle").attr("class", "treeView-node-description").attr("x", v159).attr("y", v160.centerY);
      const v162 = v161.node().getBBox();
      v135 = Math.max(v135, v159 + v162.width + v132.paddingX);
    }
  }
  for (const v163 of v136) {
    if (v163.node.cssClass?.split(/\s+/).includes("highlight")) {
      const v164 = v163.nodeGroup.select(".treeView-highlight-bg");
      if (!v164.empty()) {
        const v165 = v135 - v163.node.BBox.x + 8;
        v164.attr("width", v165);
        v135 = Math.max(v135, v163.node.BBox.x + v165 + 2);
      }
    }
  }
  return {
    totalHeight: v134,
    totalWidth: v135
  };
}, "drawTree");
var draw = v9(async (v166, v167, v168, v169) => {
  v11.debug("Rendering treeView diagram\n" + v166);
  const v170 = v169.db;
  const v171 = v170.getRoot();
  const v172 = v170.getConfig();
  const v173 = v12(v167);
  await injectIconDefs(v173, v171, v172, v167);
  const v174 = v173.append("g");
  v174.attr("class", "tree-view");
  const {
    totalHeight: v175,
    totalWidth: v176
  } = drawTree(v174, v171, v172, v167);
  v173.attr("viewBox", "-" + v172.lineThickness / 2 + " 0 " + v176 + " " + v175);
  v13(v173, v175, v176, v172.useMaxWidth);
}, "draw");
var renderer = {
  draw: draw
};
var renderer_default = renderer;
var defaultTreeViewDiagramStyles = {
  labelFontSize: "16px",
  labelColor: "black",
  lineColor: "black",
  iconColor: "#546e7a",
  descriptionColor: "#6a9955",
  highlightBg: "rgba(255, 193, 7, 0.15)",
  highlightStroke: "#ffc107"
};
var styles = v9(({
  treeView: v177
}) => {
  const {
    labelFontSize: v178,
    labelColor: v179,
    lineColor: v180,
    iconColor: v181,
    descriptionColor: v182,
    highlightBg: v183,
    highlightStroke: v184
  } = v10(defaultTreeViewDiagramStyles, v177);
  return "\n    .treeView-node-label {\n        font-size: " + v178 + ";\n        fill: " + v179 + ";\n        white-space: pre;\n    }\n    .treeView-node-dir {\n        font-weight: bold;\n    }\n    .treeView-node-line {\n        stroke: " + v180 + ";\n    }\n    .treeView-node-icon {\n        color: " + v181 + ";\n    }\n    .treeView-node-description {\n        font-size: " + v178 + ";\n        fill: " + v182 + ";\n        font-style: italic;\n        white-space: pre;\n    }\n    .treeView-highlight-bg {\n        fill: " + v183 + ";\n        stroke: " + v184 + ";\n        stroke-width: 1;\n    }\n    ";
}, "styles");
var styles_default = styles;
var diagram = {
  db: db_default,
  renderer: renderer_default,
  parser: parser,
  styles: styles_default
};
export { diagram };