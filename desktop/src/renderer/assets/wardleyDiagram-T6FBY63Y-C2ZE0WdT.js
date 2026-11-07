import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { s as v2, g as v3, o as v4, n as v5, a as v6, b as v7, _ as v8, E as v9, y as v10, A as v11, l as v12, D as v13, e as v14, p as v15, c as v16 } from "./index-CXb3UsfP.js";
import { p as v17 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var toPercent = v8((v18, v19) => {
  const v20 = v18 <= 1 ? v18 * 100 : v18;
  if (v20 < 0 || v20 > 100) {
    throw new Error(v19 + " must be between 0-1 (decimal) or 0-100 (percentage). Received: " + v18);
  }
  return v20;
}, "toPercent");
var toCoordinates = v8((v21, v22, v23) => {
  return {
    x: toPercent(v22, v23 + " evolution"),
    y: toPercent(v21, v23 + " visibility")
  };
}, "toCoordinates");
var getFlowFromPort = v8(v24 => {
  if (!v24) {
    return undefined;
  }
  if (v24 === "+<>") {
    return "bidirectional";
  }
  if (v24 === "+<") {
    return "backward";
  }
  if (v24 === "+>") {
    return "forward";
  }
  return undefined;
}, "getFlowFromPort");
var extractFlowFromArrow = v8(v25 => {
  if (!v25?.startsWith("+")) {
    return {};
  }
  const v26 = /^\+'([^']*)'/.exec(v25);
  const v27 = v26?.[1];
  if (v25.includes("<>")) {
    return {
      flow: "bidirectional",
      label: v27
    };
  }
  if (v25.includes("<")) {
    return {
      flow: "backward",
      label: v27
    };
  }
  if (v25.includes(">")) {
    return {
      flow: "forward",
      label: v27
    };
  }
  return {
    label: v27
  };
}, "extractFlowFromArrow");
var populateDb = v8((v28, v29) => {
  v1(v28, v29);
  if (v28.size) {
    v29.setSize(v28.size.width, v28.size.height);
  }
  if (v28.evolution) {
    const v30 = v28.evolution.stages.map(v31 => {
      if (v31.secondName) {
        return v31.name.trim() + " / " + v31.secondName.trim();
      }
      return v31.name.trim();
    });
    const v32 = v28.evolution.stages.filter(v33 => v33.boundary !== undefined).map(v34 => v34.boundary);
    v29.updateAxes({
      stages: v30,
      stageBoundaries: v32
    });
  }
  v28.anchors.forEach(v35 => {
    const v36 = toCoordinates(v35.visibility, v35.evolution, "Anchor \"" + v35.name + "\"");
    v29.addNode(v35.name, v35.name, v36.x, v36.y, "anchor");
  });
  v28.components.forEach(v37 => {
    const v38 = toCoordinates(v37.visibility, v37.evolution, "Component \"" + v37.name + "\"");
    const v39 = v37.label ? (v37.label.negX ? -1 : 1) * v37.label.offsetX : undefined;
    const v40 = v37.label ? (v37.label.negY ? -1 : 1) * v37.label.offsetY : undefined;
    const v41 = v37.decorator?.strategy;
    v29.addNode(v37.name, v37.name, v38.x, v38.y, "component", v39, v40, v37.inertia, v41);
  });
  v28.notes.forEach(v42 => {
    const v43 = toCoordinates(v42.visibility, v42.evolution, "Note \"" + v42.text + "\"");
    v29.addNote(v42.text, v43.x, v43.y);
  });
  v28.pipelines.forEach(v44 => {
    const v45 = v29.getNode(v44.parent);
    if (!v45 || typeof v45.y !== "number") {
      throw new Error("Pipeline \"" + v44.parent + "\" must reference an existing component with coordinates.");
    }
    const v46 = v45.y;
    v29.startPipeline(v44.parent);
    v44.components.forEach(v47 => {
      const v48 = v44.parent + "_" + v47.name;
      const v49 = v47.label ? (v47.label.negX ? -1 : 1) * v47.label.offsetX : undefined;
      const v50 = v47.label ? (v47.label.negY ? -1 : 1) * v47.label.offsetY : undefined;
      const v51 = toPercent(v47.evolution, "Pipeline component \"" + v47.name + "\" evolution");
      v29.addNode(v48, v47.name, v51, v46, "pipeline-component", v49, v50);
      v29.addPipelineComponent(v44.parent, v48);
    });
  });
  v28.links.forEach(v52 => {
    const v53 = !!v52.arrow && (v52.arrow.includes("-.->") || v52.arrow.includes(".-."));
    let v54 = getFlowFromPort(v52.fromPort) ?? getFlowFromPort(v52.toPort);
    const {
      flow: v55,
      label: v56
    } = extractFlowFromArrow(v52.arrow);
    if (!v54 && v55) {
      v54 = v55;
    }
    const v57 = v52.linkLabel;
    const v58 = v56 ?? v57;
    v29.addLink(v29.resolveNodeId(v52.from), v29.resolveNodeId(v52.to), v53, v58, v54);
  });
  v28.evolves.forEach(v59 => {
    const v60 = v29.getNode(v59.component);
    if (v60?.y !== undefined) {
      const v61 = toPercent(v59.target, "Evolve target for \"" + v59.component + "\"");
      v29.addTrend(v59.component, v61, v60.y);
    }
  });
  if (v28.annotations.length > 0) {
    const v62 = v28.annotations[0];
    const v63 = toCoordinates(v62.x, v62.y, "Annotations box");
    v29.setAnnotationsBox(v63.x, v63.y);
  }
  v28.annotation.forEach(v64 => {
    const v65 = toCoordinates(v64.x, v64.y, "Annotation " + v64.number);
    v29.addAnnotation(v64.number, [{
      x: v65.x,
      y: v65.y
    }], v64.text);
  });
  v28.accelerators.forEach(v66 => {
    const v67 = toCoordinates(v66.x, v66.y, "Accelerator \"" + v66.name + "\"");
    v29.addAccelerator(v66.name, v67.x, v67.y);
  });
  v28.deaccelerators.forEach(v68 => {
    const v69 = toCoordinates(v68.x, v68.y, "Deaccelerator \"" + v68.name + "\"");
    v29.addDeaccelerator(v68.name, v69.x, v69.y);
  });
}, "populateDb");
var parser = {
  parser: {
    yy: undefined
  },
  parse: v8(async v70 => {
    const v71 = await v17("wardley", v70);
    v12.debug(v71);
    const v72 = parser.parser?.yy;
    if (!v72 || typeof v72.addNode !== "function") {
      throw new Error("parser.parser?.yy was not a WardleyDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");
    }
    populateDb(v71, v72);
  }, "parse")
};
var WardleyBuilder = class {
  constructor() {
    this.nodes = new Map();
    this.links = [];
    this.trends = new Map();
    this.pipelines = new Map();
    this.annotations = [];
    this.notes = [];
    this.accelerators = [];
    this.deaccelerators = [];
    this.axes = {};
  }
  static {
    v8(this, "WardleyBuilder");
  }
  addNode(v73) {
    const v74 = this.nodes.get(v73.id) ?? {
      id: v73.id,
      label: v73.label
    };
    const v75 = {
      ...v74,
      ...v73,
      className: v73.className ?? v74.className,
      labelOffsetX: v73.labelOffsetX ?? v74.labelOffsetX,
      labelOffsetY: v73.labelOffsetY ?? v74.labelOffsetY
    };
    this.nodes.set(v73.id, v75);
  }
  addLink(v76) {
    this.links.push(v76);
  }
  addTrend(v77) {
    this.trends.set(v77.nodeId, v77);
  }
  startPipeline(v78) {
    this.pipelines.set(v78, {
      nodeId: v78,
      componentIds: []
    });
    const v79 = this.nodes.get(v78);
    if (v79) {
      v79.isPipelineParent = true;
    }
  }
  addPipelineComponent(v80, v81) {
    const v82 = this.pipelines.get(v80);
    if (v82) {
      v82.componentIds.push(v81);
    }
    const v83 = this.nodes.get(v81);
    if (v83) {
      v83.inPipeline = true;
    }
  }
  addAnnotation(v84) {
    this.annotations.push(v84);
  }
  addNote(v85) {
    this.notes.push(v85);
  }
  addAccelerator(v86) {
    this.accelerators.push(v86);
  }
  addDeaccelerator(v87) {
    this.deaccelerators.push(v87);
  }
  setAnnotationsBox(v88, v89) {
    this.annotationsBox = {
      x: v88,
      y: v89
    };
  }
  setAxes(v90) {
    this.axes = {
      ...this.axes,
      ...v90
    };
  }
  setSize(v91, v92) {
    this.size = {
      width: v91,
      height: v92
    };
  }
  getNode(v93) {
    return this.nodes.get(v93);
  }
  resolveNodeId(v94) {
    if (this.nodes.has(v94)) {
      return v94;
    }
    for (const [v95, v96] of this.nodes) {
      if (v96.label === v94) {
        return v95;
      }
    }
    return v94;
  }
  build() {
    const v97 = [];
    for (const v98 of this.nodes.values()) {
      if (typeof v98.x !== "number" || typeof v98.y !== "number") {
        throw new Error("Node \"" + v98.label + "\" is missing coordinates");
      }
      v97.push(v98);
    }
    return {
      nodes: v97,
      links: [...this.links],
      trends: [...this.trends.values()],
      pipelines: [...this.pipelines.values()],
      annotations: [...this.annotations],
      notes: [...this.notes],
      accelerators: [...this.accelerators],
      deaccelerators: [...this.deaccelerators],
      annotationsBox: this.annotationsBox,
      axes: {
        ...this.axes
      },
      size: this.size
    };
  }
  clear() {
    this.nodes.clear();
    this.links = [];
    this.trends.clear();
    this.pipelines.clear();
    this.annotations = [];
    this.notes = [];
    this.accelerators = [];
    this.deaccelerators = [];
    this.annotationsBox = undefined;
    this.axes = {};
    this.size = undefined;
  }
};
var builder = new WardleyBuilder();
function getConfig3() {
  return v16()["wardley-beta"];
}
v8(getConfig3, "getConfig");
function addNode(v99, v100, v101, v102, v103, v104, v105, v106, v107) {
  builder.addNode({
    id: v99,
    label: v100,
    x: v101,
    y: v102,
    className: v103,
    labelOffsetX: v104,
    labelOffsetY: v105,
    inertia: v106,
    sourceStrategy: v107
  });
}
v8(addNode, "addNode");
function addLink(v108, v109, v110 = false, v111, v112) {
  builder.addLink({
    source: v108,
    target: v109,
    dashed: v110,
    label: v111,
    flow: v112
  });
}
v8(addLink, "addLink");
function addTrend(v113, v114, v115) {
  builder.addTrend({
    nodeId: v113,
    targetX: v114,
    targetY: v115
  });
}
v8(addTrend, "addTrend");
function addAnnotation(v116, v117, v118) {
  builder.addAnnotation({
    number: v116,
    coordinates: v117,
    text: v118
  });
}
v8(addAnnotation, "addAnnotation");
function addNote(v119, v120, v121) {
  builder.addNote({
    text: v119,
    x: v120,
    y: v121
  });
}
v8(addNote, "addNote");
function addAccelerator(v122, v123, v124) {
  builder.addAccelerator({
    name: v122,
    x: v123,
    y: v124
  });
}
v8(addAccelerator, "addAccelerator");
function addDeaccelerator(v125, v126, v127) {
  builder.addDeaccelerator({
    name: v125,
    x: v126,
    y: v127
  });
}
v8(addDeaccelerator, "addDeaccelerator");
function setAnnotationsBox(v128, v129) {
  builder.setAnnotationsBox(v128, v129);
}
v8(setAnnotationsBox, "setAnnotationsBox");
function setSize(v130, v131) {
  builder.setSize(v130, v131);
}
v8(setSize, "setSize");
function startPipeline(v132) {
  builder.startPipeline(v132);
}
v8(startPipeline, "startPipeline");
function addPipelineComponent(v133, v134) {
  builder.addPipelineComponent(v133, v134);
}
v8(addPipelineComponent, "addPipelineComponent");
function updateAxes(v135) {
  builder.setAxes(v135);
}
v8(updateAxes, "updateAxes");
function getNode(v136) {
  return builder.getNode(v136);
}
v8(getNode, "getNode");
function resolveNodeId(v137) {
  return builder.resolveNodeId(v137);
}
v8(resolveNodeId, "resolveNodeId");
function getWardleyData() {
  return builder.build();
}
v8(getWardleyData, "getWardleyData");
function clear2() {
  builder.clear();
  v15();
}
v8(clear2, "clear");
var wardleyDb_default = {
  getConfig: getConfig3,
  addNode: addNode,
  addLink: addLink,
  addTrend: addTrend,
  addAnnotation: addAnnotation,
  addNote: addNote,
  addAccelerator: addAccelerator,
  addDeaccelerator: addDeaccelerator,
  setAnnotationsBox: setAnnotationsBox,
  setSize: setSize,
  startPipeline: startPipeline,
  addPipelineComponent: addPipelineComponent,
  updateAxes: updateAxes,
  getNode: getNode,
  resolveNodeId: resolveNodeId,
  getWardleyData: getWardleyData,
  clear: clear2,
  setAccTitle: v7,
  getAccTitle: v6,
  setDiagramTitle: v5,
  getDiagramTitle: v4,
  getAccDescription: v3,
  setAccDescription: v2
};
var DEFAULT_STAGES = ["Genesis", "Custom Built", "Product", "Commodity"];
var getTheme = v8(() => {
  const {
    themeVariables: v138
  } = v16();
  return {
    backgroundColor: v138.wardley?.backgroundColor ?? v138.background ?? "#fff",
    axisColor: v138.wardley?.axisColor ?? "#000",
    axisTextColor: v138.wardley?.axisTextColor ?? v138.primaryTextColor ?? "#222",
    gridColor: v138.wardley?.gridColor ?? "rgba(100, 100, 100, 0.2)",
    componentFill: v138.wardley?.componentFill ?? "#fff",
    componentStroke: v138.wardley?.componentStroke ?? "#000",
    componentLabelColor: v138.wardley?.componentLabelColor ?? v138.primaryTextColor ?? "#222",
    linkStroke: v138.wardley?.linkStroke ?? "#000",
    evolutionStroke: v138.wardley?.evolutionStroke ?? "#dc3545",
    annotationStroke: v138.wardley?.annotationStroke ?? "#000",
    annotationTextColor: v138.wardley?.annotationTextColor ?? v138.primaryTextColor ?? "#222",
    annotationFill: v138.wardley?.annotationFill ?? v138.background ?? "#fff"
  };
}, "getTheme");
var getConfigValues = v8(() => {
  const v139 = v16()["wardley-beta"];
  return {
    width: v139?.width ?? 900,
    height: v139?.height ?? 600,
    padding: v139?.padding ?? 48,
    nodeRadius: v139?.nodeRadius ?? 6,
    nodeLabelOffset: v139?.nodeLabelOffset ?? 8,
    axisFontSize: v139?.axisFontSize ?? 12,
    labelFontSize: v139?.labelFontSize ?? 10,
    showGrid: v139?.showGrid ?? false,
    useMaxWidth: v139?.useMaxWidth ?? true
  };
}, "getConfigValues");
var draw = v8((v140, v141, v142, v143) => {
  v12.debug("Rendering Wardley map\n" + v140);
  const v144 = getConfigValues();
  const v145 = getTheme();
  const v146 = v144.nodeRadius * 1.6;
  const v147 = v143.db;
  const v148 = v147.getWardleyData();
  const v149 = v147.getDiagramTitle();
  const v150 = v148.size?.width ?? v144.width;
  const v151 = v148.size?.height ?? v144.height;
  const v152 = v13(v141);
  v152.selectAll("*").remove();
  v14(v152, v151, v150, v144.useMaxWidth);
  v152.attr("viewBox", "0 0 " + v150 + " " + v151);
  const v153 = v152.append("g").attr("class", "wardley-map");
  const v154 = v152.append("defs");
  v154.append("marker").attr("id", "arrow-" + v141).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", v145.evolutionStroke).attr("stroke", "none");
  v154.append("marker").attr("id", "link-arrow-end-" + v141).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", v145.linkStroke).attr("stroke", "none");
  v154.append("marker").attr("id", "link-arrow-start-" + v141).attr("viewBox", "0 0 10 10").attr("refX", 1).attr("refY", 5).attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto").append("path").attr("d", "M 10 0 L 0 5 L 10 10 z").attr("fill", v145.linkStroke).attr("stroke", "none");
  v153.append("rect").attr("class", "wardley-background").attr("width", v150).attr("height", v151).attr("fill", v145.backgroundColor);
  const v155 = v150 - v144.padding * 2;
  const v156 = v151 - v144.padding * 2;
  if (v149) {
    v153.append("text").attr("class", "wardley-title").attr("x", v150 / 2).attr("y", v144.padding / 2).attr("fill", v145.axisTextColor).attr("font-size", v144.axisFontSize * 1.05).attr("font-weight", "bold").attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(v149);
  }
  const v157 = v8(v158 => v144.padding + v158 / 100 * v155, "projectX");
  const v159 = v8(v160 => v151 - v144.padding - v160 / 100 * v156, "projectY");
  const v161 = v153.append("g").attr("class", "wardley-axes");
  v161.append("line").attr("x1", v144.padding).attr("x2", v150 - v144.padding).attr("y1", v151 - v144.padding).attr("y2", v151 - v144.padding).attr("stroke", v145.axisColor).attr("stroke-width", 1);
  v161.append("line").attr("x1", v144.padding).attr("x2", v144.padding).attr("y1", v144.padding).attr("y2", v151 - v144.padding).attr("stroke", v145.axisColor).attr("stroke-width", 1);
  const v162 = v148.axes.xLabel ?? "Evolution";
  const v163 = v148.axes.yLabel ?? "Visibility";
  v161.append("text").attr("class", "wardley-axis-label wardley-axis-label-x").attr("x", v144.padding + v155 / 2).attr("y", v151 - v144.padding / 4).attr("fill", v145.axisTextColor).attr("font-size", v144.axisFontSize).attr("font-weight", "bold").attr("text-anchor", "middle").text(v162);
  v161.append("text").attr("class", "wardley-axis-label wardley-axis-label-y").attr("x", v144.padding / 3).attr("y", v144.padding + v156 / 2).attr("fill", v145.axisTextColor).attr("font-size", v144.axisFontSize).attr("font-weight", "bold").attr("text-anchor", "middle").attr("transform", "rotate(-90 " + v144.padding / 3 + " " + (v144.padding + v156 / 2) + ")").text(v163);
  const v164 = v148.axes.stages && v148.axes.stages.length > 0 ? v148.axes.stages : DEFAULT_STAGES;
  if (v164.length > 0) {
    const v165 = v153.append("g").attr("class", "wardley-stages");
    const v166 = v148.axes.stageBoundaries;
    const v167 = [];
    if (v166 && v166.length === v164.length) {
      let v168 = 0;
      v166.forEach(v169 => {
        v167.push({
          start: v168,
          end: v169
        });
        v168 = v169;
      });
    } else {
      const v170 = 1 / v164.length;
      v164.forEach((v171, v172) => {
        v167.push({
          start: v172 * v170,
          end: (v172 + 1) * v170
        });
      });
    }
    v164.forEach((v173, v174) => {
      const v175 = v167[v174];
      const v176 = v144.padding + v175.start * v155;
      const v177 = v144.padding + v175.end * v155;
      const v178 = (v176 + v177) / 2;
      if (v174 > 0) {
        v165.append("line").attr("x1", v176).attr("x2", v176).attr("y1", v144.padding).attr("y2", v151 - v144.padding).attr("stroke", "#000").attr("stroke-width", 1).attr("stroke-dasharray", "5 5").attr("opacity", 0.8);
      }
      v165.append("text").attr("class", "wardley-stage-label").attr("x", v178).attr("y", v151 - v144.padding / 1.5).attr("fill", v145.axisTextColor).attr("font-size", v144.axisFontSize - 2).attr("text-anchor", "middle").text(v173);
    });
  }
  if (v144.showGrid) {
    const v179 = v153.append("g").attr("class", "wardley-grid");
    for (let v180 = 1; v180 < 4; v180++) {
      const v181 = v180 / 4;
      const v182 = v144.padding + v155 * v181;
      v179.append("line").attr("x1", v182).attr("x2", v182).attr("y1", v144.padding).attr("y2", v151 - v144.padding).attr("stroke", v145.gridColor).attr("stroke-dasharray", "2 6");
      v179.append("line").attr("x1", v144.padding).attr("x2", v150 - v144.padding).attr("y1", v151 - v144.padding - v156 * v181).attr("y2", v151 - v144.padding - v156 * v181).attr("stroke", v145.gridColor).attr("stroke-dasharray", "2 6");
    }
  }
  const v183 = new Map();
  v148.nodes.forEach(v184 => {
    v183.set(v184.id, {
      x: v157(v184.x),
      y: v159(v184.y),
      node: v184
    });
  });
  if (v148.pipelines.length > 0) {
    const v185 = v153.append("g").attr("class", "wardley-pipelines");
    const v186 = v153.append("g").attr("class", "wardley-pipeline-links");
    v148.pipelines.forEach(v187 => {
      if (v187.componentIds.length === 0) {
        return;
      }
      const v188 = v187.componentIds.map(v189 => ({
        id: v189,
        pos: v183.get(v189),
        node: v148.nodes.find(v190 => v190.id === v189)
      })).filter(v191 => v191.pos && v191.node).sort((v192, v193) => v192.node.x - v193.node.x);
      for (let v194 = 0; v194 < v188.length - 1; v194++) {
        const v195 = v188[v194];
        const v196 = v188[v194 + 1];
        v186.append("line").attr("class", "wardley-pipeline-evolution-link").attr("x1", v195.pos.x).attr("y1", v195.pos.y).attr("x2", v196.pos.x).attr("y2", v196.pos.y).attr("stroke", v145.linkStroke).attr("stroke-width", 1).attr("stroke-dasharray", "4 4");
      }
      let v197 = Infinity;
      let v198 = -Infinity;
      let v199 = 0;
      v187.componentIds.forEach(v200 => {
        const v201 = v183.get(v200);
        if (v201) {
          v197 = Math.min(v197, v201.x);
          v198 = Math.max(v198, v201.x);
          v199 = v201.y;
        }
      });
      if (v197 !== Infinity && v198 !== -Infinity) {
        const v202 = 15;
        const v203 = v144.nodeRadius * 4;
        const v204 = v199 - v203 / 2;
        const v205 = v183.get(v187.nodeId);
        if (v205) {
          const v206 = (v197 + v198) / 2;
          v205.x = v206;
          v205.y = v204 - v146 / 6;
        }
        v185.append("rect").attr("class", "wardley-pipeline-box").attr("x", v197 - v202).attr("y", v204).attr("width", v198 - v197 + v202 * 2).attr("height", v203).attr("fill", "none").attr("stroke", v145.axisColor).attr("stroke-width", 1.5).attr("rx", 4).attr("ry", 4);
      }
    });
  }
  const v207 = v153.append("g").attr("class", "wardley-links");
  const v208 = new Map();
  v148.pipelines.forEach(v209 => {
    v208.set(v209.nodeId, new Set(v209.componentIds));
  });
  const v210 = v148.links.filter(v211 => {
    if (!v183.has(v211.source) || !v183.has(v211.target)) {
      return false;
    }
    const v212 = v208.get(v211.target);
    if (v212?.has(v211.source)) {
      return false;
    }
    return true;
  });
  v207.selectAll("line").data(v210).enter().append("line").attr("class", v213 => "wardley-link" + (v213.dashed ? " wardley-link--dashed" : "")).attr("x1", v214 => {
    const v215 = v183.get(v214.source);
    const v216 = v183.get(v214.target);
    const v217 = v148.nodes.find(v218 => v218.id === v214.source);
    const v219 = v217.isPipelineParent ? v146 / Math.sqrt(2) : v144.nodeRadius;
    const v220 = v216.x - v215.x;
    const v221 = v216.y - v215.y;
    const v222 = Math.sqrt(v220 * v220 + v221 * v221);
    return v215.x + v220 / v222 * v219;
  }).attr("y1", v223 => {
    const v224 = v183.get(v223.source);
    const v225 = v183.get(v223.target);
    const v226 = v148.nodes.find(v227 => v227.id === v223.source);
    const v228 = v226.isPipelineParent ? v146 / Math.sqrt(2) : v144.nodeRadius;
    const v229 = v225.x - v224.x;
    const v230 = v225.y - v224.y;
    const v231 = Math.sqrt(v229 * v229 + v230 * v230);
    return v224.y + v230 / v231 * v228;
  }).attr("x2", v232 => {
    const v233 = v183.get(v232.source);
    const v234 = v183.get(v232.target);
    const v235 = v148.nodes.find(v236 => v236.id === v232.target);
    const v237 = v235.isPipelineParent ? v146 / Math.sqrt(2) : v144.nodeRadius;
    const v238 = v233.x - v234.x;
    const v239 = v233.y - v234.y;
    const v240 = Math.sqrt(v238 * v238 + v239 * v239);
    return v234.x + v238 / v240 * v237;
  }).attr("y2", v241 => {
    const v242 = v183.get(v241.source);
    const v243 = v183.get(v241.target);
    const v244 = v148.nodes.find(v245 => v245.id === v241.target);
    const v246 = v244.isPipelineParent ? v146 / Math.sqrt(2) : v144.nodeRadius;
    const v247 = v242.x - v243.x;
    const v248 = v242.y - v243.y;
    const v249 = Math.sqrt(v247 * v247 + v248 * v248);
    return v243.y + v248 / v249 * v246;
  }).attr("stroke", v145.linkStroke).attr("stroke-width", 1).attr("stroke-dasharray", v250 => v250.dashed ? "6 6" : null).attr("marker-end", v251 => {
    if (v251.flow === "forward" || v251.flow === "bidirectional") {
      return "url(#link-arrow-end-" + v141 + ")";
    }
    return null;
  }).attr("marker-start", v252 => {
    if (v252.flow === "backward" || v252.flow === "bidirectional") {
      return "url(#link-arrow-start-" + v141 + ")";
    }
    return null;
  });
  v207.selectAll("text").data(v210.filter(v253 => v253.label)).enter().append("text").attr("class", "wardley-link-label").attr("x", v254 => {
    const v255 = v183.get(v254.source);
    const v256 = v183.get(v254.target);
    const v257 = (v255.x + v256.x) / 2;
    const v258 = v256.y - v255.y;
    const v259 = v256.x - v255.x;
    const v260 = Math.sqrt(v259 * v259 + v258 * v258);
    const v261 = 8;
    const v262 = v258 / v260;
    return v257 + v262 * v261;
  }).attr("y", v263 => {
    const v264 = v183.get(v263.source);
    const v265 = v183.get(v263.target);
    const v266 = (v264.y + v265.y) / 2;
    const v267 = v265.x - v264.x;
    const v268 = v265.y - v264.y;
    const v269 = Math.sqrt(v267 * v267 + v268 * v268);
    const v270 = 8;
    const v271 = -v267 / v269;
    return v266 + v271 * v270;
  }).attr("fill", v145.axisTextColor).attr("font-size", v144.labelFontSize).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("transform", v272 => {
    const v273 = v183.get(v272.source);
    const v274 = v183.get(v272.target);
    const v275 = (v273.x + v274.x) / 2;
    const v276 = (v273.y + v274.y) / 2;
    const v277 = v274.x - v273.x;
    const v278 = v274.y - v273.y;
    const v279 = Math.sqrt(v277 * v277 + v278 * v278);
    const v280 = 8;
    const v281 = v278 / v279;
    const v282 = -v277 / v279;
    const v283 = v275 + v281 * v280;
    const v284 = v276 + v282 * v280;
    let v285 = Math.atan2(v278, v277) * 180 / Math.PI;
    if (v285 > 90 || v285 < -90) {
      v285 += 180;
    }
    return "rotate(" + v285 + " " + v283 + " " + v284 + ")";
  }).text(v286 => v286.label);
  const v287 = v153.append("g").attr("class", "wardley-trends");
  const v288 = v148.trends.map(v289 => {
    const v290 = v183.get(v289.nodeId);
    if (!v290) {
      return null;
    }
    const v291 = v157(v289.targetX);
    const v292 = v159(v289.targetY);
    const v293 = v291 - v290.x;
    const v294 = v292 - v290.y;
    const v295 = Math.sqrt(v293 * v293 + v294 * v294);
    const v296 = v144.nodeRadius + 2;
    const v297 = v295 > v296 ? v291 - v293 / v295 * v296 : v291;
    const v298 = v295 > v296 ? v292 - v294 / v295 * v296 : v292;
    return {
      origin: v290,
      targetX: v291,
      targetY: v292,
      adjustedX2: v297,
      adjustedY2: v298
    };
  }).filter(v299 => v299 !== null);
  v287.selectAll("line").data(v288).enter().append("line").attr("class", "wardley-trend").attr("x1", v300 => v300.origin.x).attr("y1", v301 => v301.origin.y).attr("x2", v302 => v302.adjustedX2).attr("y2", v303 => v303.adjustedY2).attr("stroke", v145.evolutionStroke).attr("stroke-width", 1).attr("stroke-dasharray", "4 4").attr("marker-end", "url(#arrow-" + v141 + ")");
  const v304 = v153.append("g").attr("class", "wardley-nodes");
  const v305 = v304.selectAll("g").data(v148.nodes).enter().append("g").attr("class", v306 => ["wardley-node", v306.className ? "wardley-node--" + v306.className : ""].filter(Boolean).join(" "));
  v305.filter(v307 => v307.sourceStrategy === "outsource").append("circle").attr("class", "wardley-outsource-overlay").attr("cx", v308 => v183.get(v308.id).x).attr("cy", v309 => v183.get(v309.id).y).attr("r", v144.nodeRadius * 2).attr("fill", "#666").attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  v305.filter(v310 => v310.sourceStrategy === "buy").append("circle").attr("class", "wardley-buy-overlay").attr("cx", v311 => v183.get(v311.id).x).attr("cy", v312 => v183.get(v312.id).y).attr("r", v144.nodeRadius * 2).attr("fill", "#ccc").attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  v305.filter(v313 => v313.sourceStrategy === "build").append("circle").attr("class", "wardley-build-overlay").attr("cx", v314 => v183.get(v314.id).x).attr("cy", v315 => v183.get(v315.id).y).attr("r", v144.nodeRadius * 2).attr("fill", "#eee").attr("stroke", "#000").attr("stroke-width", 1);
  const v316 = v305.filter(v317 => v317.sourceStrategy === "market");
  v316.append("circle").attr("class", "wardley-market-overlay").attr("cx", v318 => v183.get(v318.id).x).attr("cy", v319 => v183.get(v319.id).y).attr("r", v144.nodeRadius * 2).attr("fill", "white").attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  v305.filter(v320 => !v320.isPipelineParent && v320.sourceStrategy !== "market" && v320.className !== "anchor").append("circle").attr("cx", v321 => v183.get(v321.id).x).attr("cy", v322 => v183.get(v322.id).y).attr("r", v144.nodeRadius).attr("fill", v145.componentFill).attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  const v323 = v144.nodeRadius * 0.7;
  const v324 = v144.nodeRadius * 1.2;
  v316.append("line").attr("class", "wardley-market-line").attr("x1", v325 => v183.get(v325.id).x).attr("y1", v326 => v183.get(v326.id).y - v324).attr("x2", v327 => v183.get(v327.id).x - v324 * Math.cos(Math.PI / 6)).attr("y2", v328 => v183.get(v328.id).y + v324 * Math.sin(Math.PI / 6)).attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  v316.append("line").attr("class", "wardley-market-line").attr("x1", v329 => v183.get(v329.id).x - v324 * Math.cos(Math.PI / 6)).attr("y1", v330 => v183.get(v330.id).y + v324 * Math.sin(Math.PI / 6)).attr("x2", v331 => v183.get(v331.id).x + v324 * Math.cos(Math.PI / 6)).attr("y2", v332 => v183.get(v332.id).y + v324 * Math.sin(Math.PI / 6)).attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  v316.append("line").attr("class", "wardley-market-line").attr("x1", v333 => v183.get(v333.id).x + v324 * Math.cos(Math.PI / 6)).attr("y1", v334 => v183.get(v334.id).y + v324 * Math.sin(Math.PI / 6)).attr("x2", v335 => v183.get(v335.id).x).attr("y2", v336 => v183.get(v336.id).y - v324).attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  v316.append("circle").attr("class", "wardley-market-dot").attr("cx", v337 => v183.get(v337.id).x).attr("cy", v338 => v183.get(v338.id).y - v324).attr("r", v323).attr("fill", "white").attr("stroke", v145.componentStroke).attr("stroke-width", 2);
  v316.append("circle").attr("class", "wardley-market-dot").attr("cx", v339 => v183.get(v339.id).x - v324 * Math.cos(Math.PI / 6)).attr("cy", v340 => v183.get(v340.id).y + v324 * Math.sin(Math.PI / 6)).attr("r", v323).attr("fill", "white").attr("stroke", v145.componentStroke).attr("stroke-width", 2);
  v316.append("circle").attr("class", "wardley-market-dot").attr("cx", v341 => v183.get(v341.id).x + v324 * Math.cos(Math.PI / 6)).attr("cy", v342 => v183.get(v342.id).y + v324 * Math.sin(Math.PI / 6)).attr("r", v323).attr("fill", "white").attr("stroke", v145.componentStroke).attr("stroke-width", 2);
  v305.filter(v343 => v343.isPipelineParent === true).append("rect").attr("x", v344 => v183.get(v344.id).x - v146 / 2).attr("y", v345 => v183.get(v345.id).y - v146 / 2).attr("width", v146).attr("height", v146).attr("fill", v145.componentFill).attr("stroke", v145.componentStroke).attr("stroke-width", 1);
  v305.filter(v346 => v346.inertia === true).append("line").attr("class", "wardley-inertia").attr("x1", v347 => {
    const v348 = v183.get(v347.id);
    let v349 = v347.isPipelineParent ? v146 / 2 + 15 : v144.nodeRadius + 15;
    if (v347.sourceStrategy) {
      v349 += v144.nodeRadius + 10;
    }
    return v348.x + v349;
  }).attr("y1", v350 => {
    const v351 = v183.get(v350.id);
    const v352 = v350.isPipelineParent ? v146 : v144.nodeRadius * 2;
    return v351.y - v352 / 2;
  }).attr("x2", v353 => {
    const v354 = v183.get(v353.id);
    let v355 = v353.isPipelineParent ? v146 / 2 + 15 : v144.nodeRadius + 15;
    if (v353.sourceStrategy) {
      v355 += v144.nodeRadius + 10;
    }
    return v354.x + v355;
  }).attr("y2", v356 => {
    const v357 = v183.get(v356.id);
    const v358 = v356.isPipelineParent ? v146 : v144.nodeRadius * 2;
    return v357.y + v358 / 2;
  }).attr("stroke", v145.componentStroke).attr("stroke-width", 6);
  v305.append("text").attr("x", v359 => {
    const v360 = v183.get(v359.id);
    if (v359.className === "anchor") {
      if (v359.labelOffsetX !== undefined) {
        return v360.x + v359.labelOffsetX;
      } else {
        return v360.x;
      }
    }
    let v361 = v144.nodeLabelOffset;
    if (v359.sourceStrategy && v359.labelOffsetX === undefined) {
      v361 += 10;
    }
    const v362 = v359.labelOffsetX ?? v361;
    return v360.x + v362;
  }).attr("y", v363 => {
    const v364 = v183.get(v363.id);
    if (v363.className === "anchor") {
      if (v363.labelOffsetY !== undefined) {
        return v364.y + v363.labelOffsetY;
      } else {
        return v364.y - 3;
      }
    }
    let v365 = -v144.nodeLabelOffset;
    if (v363.sourceStrategy && v363.labelOffsetY === undefined) {
      v365 -= 10;
    }
    const v366 = v363.labelOffsetY ?? v365;
    return v364.y + v366;
  }).attr("class", "wardley-node-label").attr("fill", v367 => {
    if (v367.className === "evolved") {
      return v145.evolutionStroke;
    }
    if (v367.className === "anchor") {
      return "#000";
    }
    return v145.componentLabelColor;
  }).attr("font-size", v144.labelFontSize).attr("font-weight", v368 => v368.className === "anchor" ? "bold" : "normal").attr("text-anchor", v369 => v369.className === "anchor" ? "middle" : "start").attr("dominant-baseline", v370 => v370.className === "anchor" ? "middle" : "auto").text(v371 => v371.label);
  if (v148.annotations.length > 0) {
    const v372 = v153.append("g").attr("class", "wardley-annotations");
    v148.annotations.forEach(v373 => {
      const v374 = v373.coordinates.map(v375 => ({
        x: v157(v375.x),
        y: v159(v375.y)
      }));
      if (v374.length > 1) {
        for (let v376 = 0; v376 < v374.length - 1; v376++) {
          v372.append("line").attr("class", "wardley-annotation-line").attr("x1", v374[v376].x).attr("y1", v374[v376].y).attr("x2", v374[v376 + 1].x).attr("y2", v374[v376 + 1].y).attr("stroke", v145.axisColor).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
        }
      }
      v374.forEach(v377 => {
        const v378 = v372.append("g").attr("class", "wardley-annotation");
        v378.append("circle").attr("cx", v377.x).attr("cy", v377.y).attr("r", 10).attr("fill", "white").attr("stroke", v145.axisColor).attr("stroke-width", 1.5);
        v378.append("text").attr("x", v377.x).attr("y", v377.y).attr("text-anchor", "middle").attr("dominant-baseline", "central").attr("font-size", 10).attr("fill", v145.axisTextColor).attr("font-weight", "bold").text(v373.number);
      });
    });
    if (v148.annotationsBox) {
      let v379 = v157(v148.annotationsBox.x);
      let v380 = v159(v148.annotationsBox.y);
      const v381 = 10;
      const v382 = 16;
      const v383 = 11;
      const v384 = v372.append("g").attr("class", "wardley-annotations-box");
      const v385 = [...v148.annotations].filter(v386 => v386.text).sort((v387, v388) => v387.number - v388.number);
      const v389 = [];
      v385.forEach((v390, v391) => {
        const v392 = v384.append("text").attr("x", v379 + v381).attr("y", v380 + v381 + (v391 + 1) * v382).attr("font-size", v383).attr("fill", v145.axisTextColor).attr("text-anchor", "start").attr("dominant-baseline", "middle").text(v390.number + ". " + v390.text);
        v389.push(v392);
      });
      if (v389.length > 0) {
        let v393 = 0;
        let v394 = 0;
        v389.forEach(v395 => {
          const v396 = v395.node();
          const v397 = v396.getComputedTextLength();
          v393 = Math.max(v393, v397);
          const v398 = v396.getBBox();
          v394 = Math.max(v394, v398.height);
        });
        const v399 = v393 + v381 * 2 + 105;
        const v400 = v385.length * v382 + v381 * 2 + v394 / 2;
        const v401 = v144.padding;
        const v402 = v150 - v144.padding - v399;
        const v403 = v144.padding;
        const v404 = v151 - v144.padding - v400;
        v379 = Math.max(v401, Math.min(v379, v402));
        v380 = Math.max(v403, Math.min(v380, v404));
        v389.forEach((v405, v406) => {
          v405.attr("x", v379 + v381).attr("y", v380 + v381 + (v406 + 1) * v382);
        });
        v384.insert("rect", "text").attr("x", v379).attr("y", v380).attr("width", v399).attr("height", v400).attr("fill", "white").attr("stroke", v145.axisColor).attr("stroke-width", 1.5).attr("rx", 4).attr("ry", 4);
      }
    }
  }
  if (v148.notes.length > 0) {
    const v407 = v153.append("g").attr("class", "wardley-notes");
    v148.notes.forEach(v408 => {
      const v409 = v157(v408.x);
      const v410 = v159(v408.y);
      v407.append("text").attr("x", v409).attr("y", v410).attr("text-anchor", "start").attr("font-size", 11).attr("fill", v145.axisTextColor).attr("font-weight", "bold").text(v408.text);
    });
  }
  if (v148.accelerators.length > 0) {
    const v411 = v153.append("g").attr("class", "wardley-accelerators");
    v148.accelerators.forEach(v412 => {
      const v413 = v157(v412.x);
      const v414 = v159(v412.y);
      const v415 = 60;
      const v416 = 30;
      const v417 = 20;
      const v418 = "\n        M " + v413 + " " + (v414 - v416 / 2) + "\n        L " + (v413 + v415 - v417) + " " + (v414 - v416 / 2) + "\n        L " + (v413 + v415 - v417) + " " + (v414 - v416 / 2 - 8) + "\n        L " + (v413 + v415) + " " + v414 + "\n        L " + (v413 + v415 - v417) + " " + (v414 + v416 / 2 + 8) + "\n        L " + (v413 + v415 - v417) + " " + (v414 + v416 / 2) + "\n        L " + v413 + " " + (v414 + v416 / 2) + "\n        Z\n      ";
      v411.append("path").attr("d", v418).attr("fill", "white").attr("stroke", v145.componentStroke).attr("stroke-width", 1);
      v411.append("text").attr("x", v413 + v415 / 2).attr("y", v414 + v416 / 2 + 15).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", v145.axisTextColor).attr("font-weight", "bold").text(v412.name);
    });
  }
  if (v148.deaccelerators.length > 0) {
    const v419 = v153.append("g").attr("class", "wardley-deaccelerators");
    v148.deaccelerators.forEach(v420 => {
      const v421 = v157(v420.x);
      const v422 = v159(v420.y);
      const v423 = 60;
      const v424 = 30;
      const v425 = 20;
      const v426 = "\n        M " + (v421 + v423) + " " + (v422 - v424 / 2) + "\n        L " + (v421 + v425) + " " + (v422 - v424 / 2) + "\n        L " + (v421 + v425) + " " + (v422 - v424 / 2 - 8) + "\n        L " + v421 + " " + v422 + "\n        L " + (v421 + v425) + " " + (v422 + v424 / 2 + 8) + "\n        L " + (v421 + v425) + " " + (v422 + v424 / 2) + "\n        L " + (v421 + v423) + " " + (v422 + v424 / 2) + "\n        Z\n      ";
      v419.append("path").attr("d", v426).attr("fill", "white").attr("stroke", v145.componentStroke).attr("stroke-width", 1);
      v419.append("text").attr("x", v421 + v423 / 2).attr("y", v422 + v424 / 2 + 15).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", v145.axisTextColor).attr("font-weight", "bold").text(v420.name);
    });
  }
}, "draw");
var wardleyRenderer_default = {
  draw: draw
};
var styles = v8(({
  wardley: v427
} = {}) => {
  const v428 = v9();
  const v429 = v10();
  const v430 = v11(v428, v429.themeVariables);
  const v431 = v11(v430.wardley, v427);
  return "\n  .wardley-background {\n    fill: " + v431.backgroundColor + ";\n  }\n  .wardley-axes line, .wardley-axes path {\n    stroke: " + v431.axisColor + ";\n  }\n  .wardley-axis-label {\n    fill: " + v431.axisTextColor + ";\n  }\n  .wardley-stage-label {\n    fill: " + v431.axisTextColor + ";\n  }\n  .wardley-grid line {\n    stroke: " + v431.gridColor + ";\n  }\n  .wardley-node circle {\n    fill: " + v431.componentFill + ";\n    stroke: " + v431.componentStroke + ";\n  }\n  .wardley-node-label {\n    fill: " + v431.componentLabelColor + ";\n  }\n  .wardley-link {\n    stroke: " + v431.linkStroke + ";\n  }\n  .wardley-link--dashed {\n    stroke-dasharray: 4 4;\n  }\n  .wardley-link-label {\n    fill: " + v431.axisTextColor + ";\n  }\n  .wardley-trend line {\n    stroke: " + v431.evolutionStroke + ";\n  }\n  .wardley-annotation-line {\n    stroke: " + v431.annotationStroke + ";\n  }\n  .wardley-annotation circle {\n    fill: " + v431.annotationFill + ";\n    stroke: " + v431.annotationStroke + ";\n  }\n  .wardley-annotation text {\n    fill: " + v431.annotationTextColor + ";\n  }\n  .wardley-annotations-box rect {\n    fill: " + v431.annotationFill + ";\n    stroke: " + v431.annotationStroke + ";\n  }\n  .wardley-annotations-box text {\n    fill: " + v431.annotationTextColor + ";\n  }\n  .wardley-pipeline-box {\n    stroke: " + v431.componentStroke + ";\n  }\n  .wardley-notes text {\n    fill: " + v431.axisTextColor + ";\n  }\n  ";
}, "styles");
var diagram = {
  parser: parser,
  db: wardleyDb_default,
  renderer: wardleyRenderer_default,
  styles: styles
};
export { diagram };