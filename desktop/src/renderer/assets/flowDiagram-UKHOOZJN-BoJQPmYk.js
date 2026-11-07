import { g as v1 } from "./chunk-5VM5RSS4-Cbnyy23B.js";
import { g as v2 } from "./chunk-XXDRQBXY-CzLCVi_O.js";
import { s as v3 } from "./chunk-KBJHAD2P-BXgOlElY.js";
import { _ as v4, b7 as v5, F as v6, l as v7, c as v8, u as v9, v as v10, x as v11, b as v12, s as v13, n as v14, a as v15, g as v16, o as v17, k as v18, G as v19, J as v20, bq as v21, q as v22, d as v23, N as v24, p as v25, ba as v26, r as v27 } from "./index-CXb3UsfP.js";
import { f as v28 } from "./chunk-2GRJ4B5K-DGslyOWI.js";
import { c as v29 } from "./channel-zu66cFrq.js";
var MERMAID_DOM_ID_PREFIX = "flowchart-";
var FlowDB = class {
  constructor() {
    this.vertexCounter = 0;
    this.config = v8();
    this.diagramId = "";
    this.vertices = new Map();
    this.edges = [];
    this.classes = new Map();
    this.subGraphs = [];
    this.subGraphLookup = new Map();
    this.tooltips = new Map();
    this.subCount = 0;
    this.firstGraphFlag = true;
    this.secCount = -1;
    this.posCrossRef = [];
    this.funs = [];
    this.setAccTitle = v12;
    this.setAccDescription = v13;
    this.setDiagramTitle = v14;
    this.getAccTitle = v15;
    this.getAccDescription = v16;
    this.getDiagramTitle = v17;
    this.funs.push(this.setupToolTips.bind(this));
    this.addVertex = this.addVertex.bind(this);
    this.firstGraph = this.firstGraph.bind(this);
    this.setDirection = this.setDirection.bind(this);
    this.addSubGraph = this.addSubGraph.bind(this);
    this.addLink = this.addLink.bind(this);
    this.setLink = this.setLink.bind(this);
    this.updateLink = this.updateLink.bind(this);
    this.addClass = this.addClass.bind(this);
    this.setClass = this.setClass.bind(this);
    this.destructLink = this.destructLink.bind(this);
    this.setClickEvent = this.setClickEvent.bind(this);
    this.setTooltip = this.setTooltip.bind(this);
    this.updateLinkInterpolate = this.updateLinkInterpolate.bind(this);
    this.setClickFun = this.setClickFun.bind(this);
    this.bindFunctions = this.bindFunctions.bind(this);
    this.lex = {
      firstGraph: this.firstGraph.bind(this)
    };
    this.clear();
    this.setGen("gen-2");
  }
  static {
    v4(this, "FlowDB");
  }
  sanitizeText(v30) {
    return v18.sanitizeText(v30, this.config);
  }
  sanitizeNodeLabelType(v31) {
    switch (v31) {
      case "markdown":
      case "string":
      case "text":
        return v31;
      default:
        return "markdown";
    }
  }
  setDiagramId(v32) {
    this.diagramId = v32;
  }
  lookUpDomId(v33) {
    for (const v34 of this.vertices.values()) {
      if (v34.id === v33) {
        if (this.diagramId) {
          return this.diagramId + "-" + v34.domId;
        } else {
          return v34.domId;
        }
      }
    }
    if (this.diagramId) {
      return this.diagramId + "-" + v33;
    } else {
      return v33;
    }
  }
  addVertex(v35, v36, v37, v38, v39, v40, v41 = {}, v42) {
    if (!v35 || v35.trim().length === 0) {
      return;
    }
    let v43;
    if (v42 !== undefined) {
      let v44;
      if (!v42.includes("\n")) {
        v44 = "{\n" + v42 + "\n}";
      } else {
        v44 = v42 + "\n";
      }
      v43 = v19(v44, {
        schema: v20
      });
    }
    const v45 = this.edges.find(v46 => v46.id === v35);
    if (v45) {
      const v47 = v43;
      if (v47?.animate !== undefined) {
        v45.animate = v47.animate;
      }
      if (v47?.animation !== undefined) {
        v45.animation = v47.animation;
      }
      if (v47?.curve !== undefined) {
        v45.interpolate = v47.curve;
      }
      return;
    }
    let v48;
    let v49 = this.vertices.get(v35);
    if (v49 === undefined) {
      if (v36 === undefined && v37 === undefined && v38 !== undefined && v38 !== null) {
        v7.warn("Style applied to unknown node \"" + v35 + "\". This may indicate a typo. The node will be created automatically.");
      }
      v49 = {
        id: v35,
        labelType: "text",
        domId: MERMAID_DOM_ID_PREFIX + v35 + "-" + this.vertexCounter,
        styles: [],
        classes: []
      };
      this.vertices.set(v35, v49);
    }
    this.vertexCounter++;
    if (v36 !== undefined) {
      this.config = v8();
      v48 = this.sanitizeText(v36.text.trim());
      v49.labelType = v36.type;
      if (v48.startsWith("\"") && v48.endsWith("\"")) {
        v48 = v48.substring(1, v48.length - 1);
      }
      v49.text = v48;
    } else if (v49.text === undefined) {
      v49.text = v35;
    }
    if (v37 !== undefined) {
      v49.type = v37;
    }
    if (v38 !== undefined && v38 !== null) {
      v38.forEach(v50 => {
        v49.styles.push(v50);
      });
    }
    if (v39 !== undefined && v39 !== null) {
      v39.forEach(v51 => {
        v49.classes.push(v51);
      });
    }
    if (v40 !== undefined) {
      v49.dir = v40;
    }
    if (v49.props === undefined) {
      v49.props = v41;
    } else if (v41 !== undefined) {
      Object.assign(v49.props, v41);
    }
    if (v43 !== undefined) {
      if (v43.shape) {
        if (v43.shape !== v43.shape.toLowerCase() || v43.shape.includes("_")) {
          throw new Error("No such shape: " + v43.shape + ". Shape names should be lowercase.");
        } else if (!v21(v43.shape)) {
          throw new Error("No such shape: " + v43.shape + ".");
        }
        v49.type = v43?.shape;
      }
      if (v43?.label) {
        v49.text = v43?.label;
        v49.labelType = this.sanitizeNodeLabelType(v43?.labelType);
      }
      if (v43?.icon) {
        v49.icon = v43?.icon;
        if (!v43.label?.trim() && v49.text === v35) {
          v49.text = "";
        }
      }
      if (v43?.form) {
        v49.form = v43?.form;
      }
      if (v43?.pos) {
        v49.pos = v43?.pos;
      }
      if (v43?.img) {
        v49.img = v43?.img;
        if (!v43.label?.trim() && v49.text === v35) {
          v49.text = "";
        }
      }
      if (v43?.constraint) {
        v49.constraint = v43.constraint;
      }
      if (v43.w) {
        v49.assetWidth = Number(v43.w);
      }
      if (v43.h) {
        v49.assetHeight = Number(v43.h);
      }
    }
  }
  addSingleLink(v52, v53, v54, v55) {
    const v56 = v52;
    const v57 = v53;
    const v58 = {
      start: v56,
      end: v57,
      type: undefined,
      text: "",
      labelType: "text",
      classes: [],
      isUserDefinedId: false,
      interpolate: this.edges.defaultInterpolate
    };
    v7.info("abc78 Got edge...", v58);
    const v59 = v54.text;
    if (v59 !== undefined) {
      v58.text = this.sanitizeText(v59.text.trim());
      if (v58.text.startsWith("\"") && v58.text.endsWith("\"")) {
        v58.text = v58.text.substring(1, v58.text.length - 1);
      }
      v58.labelType = this.sanitizeNodeLabelType(v59.type);
    }
    if (v54 !== undefined) {
      v58.type = v54.type;
      v58.stroke = v54.stroke;
      v58.length = v54.length > 10 ? 10 : v54.length;
    }
    if (v55 && !this.edges.some(v60 => v60.id === v55)) {
      v58.id = v55;
      v58.isUserDefinedId = true;
    } else {
      const v61 = this.edges.filter(v62 => v62.start === v58.start && v62.end === v58.end);
      if (v61.length === 0) {
        v58.id = v22(v58.start, v58.end, {
          counter: 0,
          prefix: "L"
        });
      } else {
        v58.id = v22(v58.start, v58.end, {
          counter: v61.length + 1,
          prefix: "L"
        });
      }
    }
    if (this.edges.length < (this.config.maxEdges ?? 500)) {
      v7.info("Pushing edge...");
      this.edges.push(v58);
    } else {
      throw new Error("Edge limit exceeded. " + this.edges.length + " edges found, but the limit is " + this.config.maxEdges + ".\n\nInitialize mermaid with maxEdges set to a higher number to allow more edges.\nYou cannot set this config via configuration inside the diagram as it is a secure config.\nYou have to call mermaid.initialize.");
    }
  }
  isLinkData(v63) {
    return v63 !== null && typeof v63 === "object" && "id" in v63 && typeof v63.id === "string";
  }
  addLink(v64, v65, v66) {
    const v67 = this.isLinkData(v66) ? v66.id.replace("@", "") : undefined;
    v7.info("addLink", v64, v65, v67);
    for (const v68 of v64) {
      for (const v69 of v65) {
        const v70 = v68 === v64[v64.length - 1];
        const v71 = v69 === v65[0];
        if (v70 && v71) {
          this.addSingleLink(v68, v69, v66, v67);
        } else {
          this.addSingleLink(v68, v69, v66, undefined);
        }
      }
    }
  }
  updateLinkInterpolate(v72, v73) {
    v72.forEach(v74 => {
      if (v74 === "default") {
        this.edges.defaultInterpolate = v73;
      } else {
        this.edges[v74].interpolate = v73;
      }
    });
  }
  updateLink(v75, v76) {
    v75.forEach(v77 => {
      if (typeof v77 === "number" && v77 >= this.edges.length) {
        throw new Error("The index " + v77 + " for linkStyle is out of bounds. Valid indices for linkStyle are between 0 and " + (this.edges.length - 1) + ". (Help: Ensure that the index is within the range of existing edges.)");
      }
      if (v77 === "default") {
        this.edges.defaultStyle = v76;
      } else {
        this.edges[v77].style = v76;
        if ((this.edges[v77]?.style?.length ?? 0) > 0 && !this.edges[v77]?.style?.some(v78 => v78?.startsWith("fill"))) {
          this.edges[v77]?.style?.push("fill:none");
        }
      }
    });
  }
  addClass(v79, v80) {
    const v81 = v80.join().replace(/\\,/g, "§§§").replace(/,/g, ";").replace(/§§§/g, ",").split(";");
    v79.split(",").forEach(v82 => {
      let v83 = this.classes.get(v82);
      if (v83 === undefined) {
        v83 = {
          id: v82,
          styles: [],
          textStyles: []
        };
        this.classes.set(v82, v83);
      }
      if (v81 !== undefined && v81 !== null) {
        v81.forEach(v84 => {
          if (/color/.exec(v84)) {
            const v85 = v84.replace("fill", "bgFill");
            v83.textStyles.push(v85);
          }
          v83.styles.push(v84);
        });
      }
    });
  }
  setDirection(v86) {
    this.direction = v86.trim();
    if (/.*</.exec(this.direction)) {
      this.direction = "RL";
    }
    if (/.*\^/.exec(this.direction)) {
      this.direction = "BT";
    }
    if (/.*>/.exec(this.direction)) {
      this.direction = "LR";
    }
    if (/.*v/.exec(this.direction)) {
      this.direction = "TB";
    }
    if (this.direction === "TD") {
      this.direction = "TB";
    }
  }
  setClass(v87, v88) {
    for (const v89 of v87.split(",")) {
      const v90 = this.vertices.get(v89);
      if (v90) {
        v90.classes.push(v88);
      }
      const v91 = this.edges.find(v92 => v92.id === v89);
      if (v91) {
        v91.classes.push(v88);
      }
      const v93 = this.subGraphLookup.get(v89);
      if (v93) {
        v93.classes.push(v88);
      }
    }
  }
  setTooltip(v94, v95) {
    if (v95 === undefined) {
      return;
    }
    v95 = this.sanitizeText(v95);
    for (const v96 of v94.split(",")) {
      this.tooltips.set(this.version === "gen-1" ? this.lookUpDomId(v96) : v96, v95);
    }
  }
  setClickFun(v97, v98, v99) {
    if (v8().securityLevel !== "loose") {
      return;
    }
    if (v98 === undefined) {
      return;
    }
    let v100 = [];
    if (typeof v99 === "string") {
      v100 = v99.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      for (let v101 = 0; v101 < v100.length; v101++) {
        let v102 = v100[v101].trim();
        if (v102.startsWith("\"") && v102.endsWith("\"")) {
          v102 = v102.substr(1, v102.length - 2);
        }
        v100[v101] = v102;
      }
    }
    if (v100.length === 0) {
      v100.push(v97);
    }
    const v103 = this.vertices.get(v97);
    if (v103) {
      v103.haveCallback = true;
      this.funs.push(() => {
        const v104 = this.lookUpDomId(v97);
        const v105 = document.querySelector("[id=\"" + v104 + "\"]");
        if (v105 !== null) {
          v105.addEventListener("click", () => {
            v11.runFunc(v98, ...v100);
          }, false);
        }
      });
    }
  }
  setLink(v106, v107, v108) {
    v106.split(",").forEach(v109 => {
      const v110 = this.vertices.get(v109);
      if (v110 !== undefined) {
        v110.link = v11.formatUrl(v107, this.config);
        v110.linkTarget = v108;
      }
    });
    this.setClass(v106, "clickable");
  }
  getTooltip(v111) {
    return this.tooltips.get(v111);
  }
  setClickEvent(v112, v113, v114) {
    v112.split(",").forEach(v115 => {
      this.setClickFun(v115, v113, v114);
    });
    this.setClass(v112, "clickable");
  }
  bindFunctions(v116) {
    this.funs.forEach(v117 => {
      v117(v116);
    });
  }
  getDirection() {
    return this.direction?.trim();
  }
  getVertices() {
    return this.vertices;
  }
  getEdges() {
    return this.edges;
  }
  getClasses() {
    return this.classes;
  }
  setupToolTips(v118) {
    const v119 = v28();
    const v120 = v23(v118).select("svg");
    const v121 = v120.selectAll("g.node");
    v121.on("mouseover", v122 => {
      const v123 = v23(v122.currentTarget);
      const v124 = v123.attr("title");
      if (v124 === null) {
        return;
      }
      const v125 = v122.currentTarget?.getBoundingClientRect();
      v119.transition().duration(200).style("opacity", ".9");
      v119.text(v123.attr("title")).style("left", window.scrollX + v125.left + (v125.right - v125.left) / 2 + "px").style("top", window.scrollY + v125.bottom + "px");
      v119.html(v24.sanitize(v124));
      v123.classed("hover", true);
    }).on("mouseout", v126 => {
      v119.transition().duration(500).style("opacity", 0);
      const v127 = v23(v126.currentTarget);
      v127.classed("hover", false);
    });
  }
  clear(v128 = "gen-2") {
    this.vertices = new Map();
    this.classes = new Map();
    this.edges = [];
    this.funs = [this.setupToolTips.bind(this)];
    this.diagramId = "";
    this.subGraphs = [];
    this.subGraphLookup = new Map();
    this.subCount = 0;
    this.tooltips = new Map();
    this.firstGraphFlag = true;
    this.version = v128;
    this.config = v8();
    v25();
  }
  setGen(v129) {
    this.version = v129 || "gen-2";
  }
  defaultStyle() {
    return "fill:#ffa;stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;fill:#ffa;stroke: #666;";
  }
  addSubGraph(v130, v131, v132) {
    let v133 = v130.text.trim();
    let v134 = v132.text;
    if (v130 === v132 && /\s/.exec(v132.text)) {
      v133 = undefined;
    }
    const v135 = v4(v136 => {
      const v137 = {
        boolean: {},
        number: {},
        string: {}
      };
      const v138 = [];
      let v139;
      const v140 = v136.filter(function (v141) {
        const v142 = typeof v141;
        if (v141.stmt && v141.stmt === "dir") {
          v139 = v141.value;
          return false;
        }
        if (v141.trim() === "") {
          return false;
        }
        if (v142 in v137) {
          if (v137[v142].hasOwnProperty(v141)) {
            return false;
          } else {
            return v137[v142][v141] = true;
          }
        } else if (v138.includes(v141)) {
          return false;
        } else {
          return v138.push(v141);
        }
      });
      return {
        nodeList: v140,
        dir: v139
      };
    }, "uniq");
    const v143 = v135(v131.flat());
    const v144 = v143.nodeList;
    const v145 = v143.dir;
    const v146 = v145 !== undefined;
    const v147 = v8().flowchart ?? {};
    const v148 = v145 ?? (v147.inheritDir ? this.getDirection() ?? v8().direction ?? undefined : undefined);
    if (this.version === "gen-1") {
      for (let v149 = 0; v149 < v144.length; v149++) {
        v144[v149] = this.lookUpDomId(v144[v149]);
      }
    }
    v133 = v133 ?? "subGraph" + this.subCount;
    v134 = v134 || "";
    v134 = this.sanitizeText(v134);
    this.subCount = this.subCount + 1;
    const v150 = {
      id: v133,
      nodes: v144,
      title: v134.trim(),
      classes: [],
      dir: v148,
      hasExplicitDir: v146,
      labelType: this.sanitizeNodeLabelType(v132?.type)
    };
    v7.info("Adding", v150.id, v150.nodes, v150.dir);
    v150.nodes = this.makeUniq(v150, this.subGraphs).nodes;
    this.subGraphs.push(v150);
    this.subGraphLookup.set(v133, v150);
    return v133;
  }
  getPosForId(v151) {
    for (const [v152, v153] of this.subGraphs.entries()) {
      if (v153.id === v151) {
        return v152;
      }
    }
    return -1;
  }
  indexNodes2(v154, v155) {
    const v156 = this.subGraphs[v155].nodes;
    this.secCount = this.secCount + 1;
    if (this.secCount > 2000) {
      return {
        result: false,
        count: 0
      };
    }
    this.posCrossRef[this.secCount] = v155;
    if (this.subGraphs[v155].id === v154) {
      return {
        result: true,
        count: 0
      };
    }
    let v157 = 0;
    let v158 = 1;
    while (v157 < v156.length) {
      const v159 = this.getPosForId(v156[v157]);
      if (v159 >= 0) {
        const v160 = this.indexNodes2(v154, v159);
        if (v160.result) {
          return {
            result: true,
            count: v158 + v160.count
          };
        } else {
          v158 = v158 + v160.count;
        }
      }
      v157 = v157 + 1;
    }
    return {
      result: false,
      count: v158
    };
  }
  getDepthFirstPos(v161) {
    return this.posCrossRef[v161];
  }
  indexNodes() {
    this.secCount = -1;
    if (this.subGraphs.length > 0) {
      this.indexNodes2("none", this.subGraphs.length - 1);
    }
  }
  getSubGraphs() {
    return this.subGraphs;
  }
  firstGraph() {
    if (this.firstGraphFlag) {
      this.firstGraphFlag = false;
      return true;
    }
    return false;
  }
  destructStartLink(v162) {
    let v163 = v162.trim();
    let v164 = "arrow_open";
    switch (v163[0]) {
      case "<":
        v164 = "arrow_point";
        v163 = v163.slice(1);
        break;
      case "x":
        v164 = "arrow_cross";
        v163 = v163.slice(1);
        break;
      case "o":
        v164 = "arrow_circle";
        v163 = v163.slice(1);
        break;
    }
    let v165 = "normal";
    if (v163.includes("=")) {
      v165 = "thick";
    }
    if (v163.includes(".")) {
      v165 = "dotted";
    }
    return {
      type: v164,
      stroke: v165
    };
  }
  countChar(v166, v167) {
    const v168 = v167.length;
    let v169 = 0;
    for (let v170 = 0; v170 < v168; ++v170) {
      if (v167[v170] === v166) {
        ++v169;
      }
    }
    return v169;
  }
  destructEndLink(v171) {
    const v172 = v171.trim();
    let v173 = v172.slice(0, -1);
    let v174 = "arrow_open";
    switch (v172.slice(-1)) {
      case "x":
        v174 = "arrow_cross";
        if (v172.startsWith("x")) {
          v174 = "double_" + v174;
          v173 = v173.slice(1);
        }
        break;
      case ">":
        v174 = "arrow_point";
        if (v172.startsWith("<")) {
          v174 = "double_" + v174;
          v173 = v173.slice(1);
        }
        break;
      case "o":
        v174 = "arrow_circle";
        if (v172.startsWith("o")) {
          v174 = "double_" + v174;
          v173 = v173.slice(1);
        }
        break;
    }
    let v175 = "normal";
    let v176 = v173.length - 1;
    if (v173.startsWith("=")) {
      v175 = "thick";
    }
    if (v173.startsWith("~")) {
      v175 = "invisible";
    }
    const v177 = this.countChar(".", v173);
    if (v177) {
      v175 = "dotted";
      v176 = v177;
    }
    return {
      type: v174,
      stroke: v175,
      length: v176
    };
  }
  destructLink(v178, v179) {
    const v180 = this.destructEndLink(v178);
    let v181;
    if (v179) {
      v181 = this.destructStartLink(v179);
      if (v181.stroke !== v180.stroke) {
        return {
          type: "INVALID",
          stroke: "INVALID"
        };
      }
      if (v181.type === "arrow_open") {
        v181.type = v180.type;
      } else {
        if (v181.type !== v180.type) {
          return {
            type: "INVALID",
            stroke: "INVALID"
          };
        }
        v181.type = "double_" + v181.type;
      }
      if (v181.type === "double_arrow") {
        v181.type = "double_arrow_point";
      }
      v181.length = v180.length;
      return v181;
    }
    return v180;
  }
  exists(v182, v183) {
    for (const v184 of v182) {
      if (v184.nodes.includes(v183)) {
        return true;
      }
    }
    return false;
  }
  makeUniq(v185, v186) {
    const v187 = [];
    v185.nodes.forEach((v188, v189) => {
      if (!this.exists(v186, v188)) {
        v187.push(v185.nodes[v189]);
      }
    });
    return {
      nodes: v187
    };
  }
  getTypeFromVertex(v190) {
    if (v190.img) {
      return "imageSquare";
    }
    if (v190.icon) {
      if (v190.form === "circle") {
        return "iconCircle";
      }
      if (v190.form === "square") {
        return "iconSquare";
      }
      if (v190.form === "rounded") {
        return "iconRounded";
      }
      return "icon";
    }
    switch (v190.type) {
      case "square":
      case undefined:
        return "squareRect";
      case "round":
        return "roundedRect";
      case "ellipse":
        return "ellipse";
      default:
        return v190.type;
    }
  }
  findNode(v191, v192) {
    return v191.find(v193 => v193.id === v192);
  }
  destructEdgeType(v194) {
    let v195 = "none";
    let v196 = "arrow_point";
    switch (v194) {
      case "arrow_point":
      case "arrow_circle":
      case "arrow_cross":
        v196 = v194;
        break;
      case "double_arrow_point":
      case "double_arrow_circle":
      case "double_arrow_cross":
        v195 = v194.replace("double_", "");
        v196 = v195;
        break;
    }
    return {
      arrowTypeStart: v195,
      arrowTypeEnd: v196
    };
  }
  addNodeFromVertex(v197, v198, v199, v200, v201, v202) {
    const v203 = v199.get(v197.id);
    const v204 = v200.get(v197.id) ?? false;
    const v205 = this.findNode(v198, v197.id);
    if (v205) {
      v205.cssStyles = v197.styles;
      v205.cssCompiledStyles = this.getCompiledStyles(v197.classes);
      v205.cssClasses = v197.classes.join(" ");
    } else {
      const v206 = {
        id: v197.id,
        label: v197.text,
        labelType: v197.labelType,
        labelStyle: "",
        parentId: v203,
        padding: v201.flowchart?.padding || 8,
        cssStyles: v197.styles,
        cssCompiledStyles: this.getCompiledStyles(["default", "node", ...v197.classes]),
        cssClasses: "default " + v197.classes.join(" "),
        dir: v197.dir,
        domId: v197.domId,
        look: v202,
        link: v197.link,
        linkTarget: v197.linkTarget,
        tooltip: this.getTooltip(v197.id),
        icon: v197.icon,
        pos: v197.pos,
        img: v197.img,
        assetWidth: v197.assetWidth,
        assetHeight: v197.assetHeight,
        constraint: v197.constraint
      };
      if (v204) {
        v198.push({
          ...v206,
          isGroup: true,
          shape: "rect"
        });
      } else {
        v198.push({
          ...v206,
          isGroup: false,
          shape: this.getTypeFromVertex(v197)
        });
      }
    }
  }
  getCompiledStyles(v207) {
    let v208 = [];
    for (const v209 of v207) {
      const v210 = this.classes.get(v209);
      if (v210?.styles) {
        v208 = [...v208, ...(v210.styles ?? [])].map(v211 => v211.trim());
      }
      if (v210?.textStyles) {
        v208 = [...v208, ...(v210.textStyles ?? [])].map(v212 => v212.trim());
      }
    }
    return v208;
  }
  getData() {
    const v213 = v8();
    const v214 = [];
    const v215 = [];
    const v216 = this.getSubGraphs();
    const v217 = new Map();
    const v218 = new Map();
    for (let v219 = v216.length - 1; v219 >= 0; v219--) {
      const v220 = v216[v219];
      if (v220.nodes.length > 0) {
        v218.set(v220.id, true);
      }
      for (const v221 of v220.nodes) {
        v217.set(v221, v220.id);
      }
    }
    for (let v222 = v216.length - 1; v222 >= 0; v222--) {
      const v223 = v216[v222];
      v214.push({
        id: v223.id,
        label: v223.title,
        labelStyle: "",
        labelType: v223.labelType,
        parentId: v217.get(v223.id),
        padding: 8,
        cssCompiledStyles: this.getCompiledStyles(v223.classes),
        cssClasses: v223.classes.join(" "),
        shape: "rect",
        dir: v223.dir === "TD" ? "TB" : v223.dir,
        explicitDir: v223.hasExplicitDir,
        isGroup: true,
        look: v213.look
      });
    }
    const v224 = this.getVertices();
    v224.forEach(v225 => {
      this.addNodeFromVertex(v225, v214, v217, v218, v213, v213.look || "classic");
    });
    const v226 = this.getEdges();
    v226.forEach((v227, v228) => {
      const {
        arrowTypeStart: v229,
        arrowTypeEnd: v230
      } = this.destructEdgeType(v227.type);
      const v231 = [...(v226.defaultStyle ?? [])];
      if (v227.style) {
        v231.push(...v227.style);
      }
      const v232 = {
        id: v22(v227.start, v227.end, {
          counter: v228,
          prefix: "L"
        }, v227.id),
        isUserDefinedId: v227.isUserDefinedId,
        start: v227.start,
        end: v227.end,
        type: v227.type ?? "normal",
        label: v227.text,
        labelType: v227.labelType,
        labelpos: "c",
        thickness: v227.stroke,
        minlen: v227.length,
        classes: v227?.stroke === "invisible" ? "" : "edge-thickness-normal edge-pattern-solid flowchart-link",
        arrowTypeStart: v227?.stroke === "invisible" || v227?.type === "arrow_open" ? "none" : v229,
        arrowTypeEnd: v227?.stroke === "invisible" || v227?.type === "arrow_open" ? "none" : v230,
        arrowheadStyle: "fill: #333",
        cssCompiledStyles: this.getCompiledStyles(v227.classes),
        labelStyle: v231,
        style: v231,
        pattern: v227.stroke,
        look: v213.look,
        animate: v227.animate,
        animation: v227.animation,
        curve: v227.interpolate || this.edges.defaultInterpolate || v213.flowchart?.curve
      };
      v215.push(v232);
    });
    return {
      nodes: v214,
      edges: v215,
      other: {},
      config: v213
    };
  }
  defaultConfig() {
    return v26.flowchart;
  }
};
var getClasses = v4(function (v233, v234) {
  return v234.db.getClasses();
}, "getClasses");
var draw = v4(async function (v235, v236, v237, v238, v239) {
  v7.info("REF0:");
  v7.info("Drawing state diagram (v2)", v236);
  const {
    securityLevel: v240,
    flowchart: v241,
    layout: v242
  } = v8();
  v238.db.setDiagramId(v236);
  v7.debug("Before getData: ");
  const v243 = v238.db.getData();
  v7.debug("Data: ", v243);
  const v244 = v2(v236, v240);
  const v245 = v238.db.getDirection();
  v243.type = v238.type;
  v243.layoutAlgorithm = v9(v242);
  if (v243.layoutAlgorithm === "dagre" && v242 === "elk") {
    v7.warn("flowchart-elk was moved to an external package in Mermaid v11. Please refer [release notes](https://github.com/mermaid-js/mermaid/releases/tag/v11.0.0) for more details. This diagram will be rendered using `dagre` layout as a fallback.");
  }
  v243.direction = v245;
  v243.nodeSpacing = v241?.nodeSpacing || 50;
  v243.rankSpacing = v241?.rankSpacing || 50;
  v243.markers = ["point", "circle", "cross"];
  v243.diagramId = v236;
  v7.debug("REF1:", v243);
  await v10(v243, v244, v239);
  const v246 = v243.config.flowchart?.diagramPadding ?? 8;
  v11.insertTitle(v244, "flowchartTitleText", v241?.titleTopMargin || 0, v238.db.getDiagramTitle());
  v3(v244, v246, "flowchart", v241?.useMaxWidth || false);
}, "draw");
var flowRenderer_v3_unified_default = {
  getClasses: getClasses,
  draw: draw
};
var parser = function () {
  var v247 = v4(function (v248, v249, v250, v251) {
    v250 = v250 || {};
    v251 = v248.length;
    for (; v251--; v250[v248[v251]] = v249);
    return v250;
  }, "o");
  var v252 = [1, 4];
  var v253 = [1, 3];
  var v254 = [1, 5];
  var v255 = [1, 8, 9, 10, 11, 27, 34, 36, 38, 44, 60, 84, 85, 86, 87, 88, 89, 102, 105, 106, 109, 111, 114, 115, 116, 121, 122, 123, 124, 125];
  var v256 = [2, 2];
  var v257 = [1, 13];
  var v258 = [1, 14];
  var v259 = [1, 15];
  var v260 = [1, 16];
  var v261 = [1, 23];
  var v262 = [1, 25];
  var v263 = [1, 26];
  var v264 = [1, 27];
  var v265 = [1, 50];
  var v266 = [1, 49];
  var v267 = [1, 29];
  var v268 = [1, 30];
  var v269 = [1, 31];
  var v270 = [1, 32];
  var v271 = [1, 33];
  var v272 = [1, 45];
  var v273 = [1, 47];
  var v274 = [1, 43];
  var v275 = [1, 48];
  var v276 = [1, 44];
  var v277 = [1, 51];
  var v278 = [1, 46];
  var v279 = [1, 52];
  var v280 = [1, 53];
  var v281 = [1, 34];
  var v282 = [1, 35];
  var v283 = [1, 36];
  var v284 = [1, 37];
  var v285 = [1, 38];
  var v286 = [1, 58];
  var v287 = [1, 8, 9, 10, 11, 27, 32, 34, 36, 38, 44, 60, 84, 85, 86, 87, 88, 89, 102, 105, 106, 109, 111, 114, 115, 116, 121, 122, 123, 124, 125];
  var v288 = [1, 62];
  var v289 = [1, 61];
  var v290 = [1, 63];
  var v291 = [8, 9, 11, 75, 77, 78];
  var v292 = [1, 79];
  var v293 = [1, 92];
  var v294 = [1, 97];
  var v295 = [1, 96];
  var v296 = [1, 93];
  var v297 = [1, 89];
  var v298 = [1, 95];
  var v299 = [1, 91];
  var v300 = [1, 98];
  var v301 = [1, 94];
  var v302 = [1, 99];
  var v303 = [1, 90];
  var v304 = [8, 9, 10, 11, 40, 75, 77, 78];
  var v305 = [8, 9, 10, 11, 40, 46, 75, 77, 78];
  var v306 = [8, 9, 10, 11, 29, 40, 44, 46, 48, 50, 52, 54, 56, 58, 60, 63, 65, 67, 68, 70, 75, 77, 78, 89, 102, 105, 106, 109, 111, 114, 115, 116];
  var v307 = [8, 9, 11, 44, 60, 75, 77, 78, 89, 102, 105, 106, 109, 111, 114, 115, 116];
  var v308 = [44, 60, 89, 102, 105, 106, 109, 111, 114, 115, 116];
  var v309 = [1, 122];
  var v310 = [1, 123];
  var v311 = [1, 125];
  var v312 = [1, 124];
  var v313 = [44, 60, 62, 74, 89, 102, 105, 106, 109, 111, 114, 115, 116];
  var v314 = [1, 134];
  var v315 = [1, 148];
  var v316 = [1, 149];
  var v317 = [1, 150];
  var v318 = [1, 151];
  var v319 = [1, 136];
  var v320 = [1, 138];
  var v321 = [1, 142];
  var v322 = [1, 143];
  var v323 = [1, 144];
  var v324 = [1, 145];
  var v325 = [1, 146];
  var v326 = [1, 147];
  var v327 = [1, 152];
  var v328 = [1, 153];
  var v329 = [1, 132];
  var v330 = [1, 133];
  var v331 = [1, 140];
  var v332 = [1, 135];
  var v333 = [1, 139];
  var v334 = [1, 137];
  var v335 = [8, 9, 10, 11, 27, 32, 34, 36, 38, 44, 60, 84, 85, 86, 87, 88, 89, 102, 105, 106, 109, 111, 114, 115, 116, 121, 122, 123, 124, 125];
  var v336 = [1, 155];
  var v337 = [1, 157];
  var v338 = [8, 9, 11];
  var v339 = [8, 9, 10, 11, 14, 44, 60, 89, 105, 106, 109, 111, 114, 115, 116];
  var v340 = [1, 177];
  var v341 = [1, 173];
  var v342 = [1, 174];
  var v343 = [1, 178];
  var v344 = [1, 175];
  var v345 = [1, 176];
  var v346 = [77, 116, 119];
  var v347 = [8, 9, 10, 11, 12, 14, 27, 29, 32, 44, 60, 75, 84, 85, 86, 87, 88, 89, 90, 105, 109, 111, 114, 115, 116];
  var v348 = [10, 106];
  var v349 = [31, 49, 51, 53, 55, 57, 62, 64, 66, 67, 69, 71, 116, 117, 118];
  var v350 = [1, 248];
  var v351 = [1, 246];
  var v352 = [1, 250];
  var v353 = [1, 244];
  var v354 = [1, 245];
  var v355 = [1, 247];
  var v356 = [1, 249];
  var v357 = [1, 251];
  var v358 = [1, 269];
  var v359 = [8, 9, 11, 106];
  var v360 = [8, 9, 10, 11, 60, 84, 105, 106, 109, 110, 111, 112];
  var v361 = {
    trace: v4(function v362() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      graphConfig: 4,
      document: 5,
      line: 6,
      statement: 7,
      SEMI: 8,
      NEWLINE: 9,
      SPACE: 10,
      EOF: 11,
      GRAPH: 12,
      NODIR: 13,
      DIR: 14,
      FirstStmtSeparator: 15,
      ending: 16,
      endToken: 17,
      spaceList: 18,
      spaceListNewline: 19,
      vertexStatement: 20,
      separator: 21,
      styleStatement: 22,
      linkStyleStatement: 23,
      classDefStatement: 24,
      classStatement: 25,
      clickStatement: 26,
      subgraph: 27,
      textNoTags: 28,
      SQS: 29,
      text: 30,
      SQE: 31,
      end: 32,
      direction: 33,
      acc_title: 34,
      acc_title_value: 35,
      acc_descr: 36,
      acc_descr_value: 37,
      acc_descr_multiline_value: 38,
      shapeData: 39,
      SHAPE_DATA: 40,
      link: 41,
      node: 42,
      styledVertex: 43,
      AMP: 44,
      vertex: 45,
      STYLE_SEPARATOR: 46,
      idString: 47,
      DOUBLECIRCLESTART: 48,
      DOUBLECIRCLEEND: 49,
      PS: 50,
      PE: 51,
      "(-": 52,
      "-)": 53,
      STADIUMSTART: 54,
      STADIUMEND: 55,
      SUBROUTINESTART: 56,
      SUBROUTINEEND: 57,
      VERTEX_WITH_PROPS_START: 58,
      "NODE_STRING[field]": 59,
      COLON: 60,
      "NODE_STRING[value]": 61,
      PIPE: 62,
      CYLINDERSTART: 63,
      CYLINDEREND: 64,
      DIAMOND_START: 65,
      DIAMOND_STOP: 66,
      TAGEND: 67,
      TRAPSTART: 68,
      TRAPEND: 69,
      INVTRAPSTART: 70,
      INVTRAPEND: 71,
      linkStatement: 72,
      arrowText: 73,
      TESTSTR: 74,
      START_LINK: 75,
      edgeText: 76,
      LINK: 77,
      LINK_ID: 78,
      edgeTextToken: 79,
      STR: 80,
      MD_STR: 81,
      textToken: 82,
      keywords: 83,
      STYLE: 84,
      LINKSTYLE: 85,
      CLASSDEF: 86,
      CLASS: 87,
      CLICK: 88,
      DOWN: 89,
      UP: 90,
      textNoTagsToken: 91,
      stylesOpt: 92,
      "idString[vertex]": 93,
      "idString[class]": 94,
      CALLBACKNAME: 95,
      CALLBACKARGS: 96,
      HREF: 97,
      LINK_TARGET: 98,
      "STR[link]": 99,
      "STR[tooltip]": 100,
      alphaNum: 101,
      DEFAULT: 102,
      numList: 103,
      INTERPOLATE: 104,
      NUM: 105,
      COMMA: 106,
      style: 107,
      styleComponent: 108,
      NODE_STRING: 109,
      UNIT: 110,
      BRKT: 111,
      PCT: 112,
      idStringToken: 113,
      MINUS: 114,
      MULT: 115,
      UNICODE_TEXT: 116,
      TEXT: 117,
      TAGSTART: 118,
      EDGE_TEXT: 119,
      alphaNumToken: 120,
      direction_tb: 121,
      direction_bt: 122,
      direction_rl: 123,
      direction_lr: 124,
      direction_td: 125,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      8: "SEMI",
      9: "NEWLINE",
      10: "SPACE",
      11: "EOF",
      12: "GRAPH",
      13: "NODIR",
      14: "DIR",
      27: "subgraph",
      29: "SQS",
      31: "SQE",
      32: "end",
      34: "acc_title",
      35: "acc_title_value",
      36: "acc_descr",
      37: "acc_descr_value",
      38: "acc_descr_multiline_value",
      40: "SHAPE_DATA",
      44: "AMP",
      46: "STYLE_SEPARATOR",
      48: "DOUBLECIRCLESTART",
      49: "DOUBLECIRCLEEND",
      50: "PS",
      51: "PE",
      52: "(-",
      53: "-)",
      54: "STADIUMSTART",
      55: "STADIUMEND",
      56: "SUBROUTINESTART",
      57: "SUBROUTINEEND",
      58: "VERTEX_WITH_PROPS_START",
      59: "NODE_STRING[field]",
      60: "COLON",
      61: "NODE_STRING[value]",
      62: "PIPE",
      63: "CYLINDERSTART",
      64: "CYLINDEREND",
      65: "DIAMOND_START",
      66: "DIAMOND_STOP",
      67: "TAGEND",
      68: "TRAPSTART",
      69: "TRAPEND",
      70: "INVTRAPSTART",
      71: "INVTRAPEND",
      74: "TESTSTR",
      75: "START_LINK",
      77: "LINK",
      78: "LINK_ID",
      80: "STR",
      81: "MD_STR",
      84: "STYLE",
      85: "LINKSTYLE",
      86: "CLASSDEF",
      87: "CLASS",
      88: "CLICK",
      89: "DOWN",
      90: "UP",
      93: "idString[vertex]",
      94: "idString[class]",
      95: "CALLBACKNAME",
      96: "CALLBACKARGS",
      97: "HREF",
      98: "LINK_TARGET",
      99: "STR[link]",
      100: "STR[tooltip]",
      102: "DEFAULT",
      104: "INTERPOLATE",
      105: "NUM",
      106: "COMMA",
      109: "NODE_STRING",
      110: "UNIT",
      111: "BRKT",
      112: "PCT",
      114: "MINUS",
      115: "MULT",
      116: "UNICODE_TEXT",
      117: "TEXT",
      118: "TAGSTART",
      119: "EDGE_TEXT",
      121: "direction_tb",
      122: "direction_bt",
      123: "direction_rl",
      124: "direction_lr",
      125: "direction_td"
    },
    productions_: [0, [3, 2], [5, 0], [5, 2], [6, 1], [6, 1], [6, 1], [6, 1], [6, 1], [4, 2], [4, 2], [4, 2], [4, 3], [16, 2], [16, 1], [17, 1], [17, 1], [17, 1], [15, 1], [15, 1], [15, 2], [19, 2], [19, 2], [19, 1], [19, 1], [18, 2], [18, 1], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 9], [7, 6], [7, 4], [7, 1], [7, 2], [7, 2], [7, 1], [21, 1], [21, 1], [21, 1], [39, 2], [39, 1], [20, 4], [20, 3], [20, 4], [20, 2], [20, 2], [20, 1], [42, 1], [42, 6], [42, 5], [43, 1], [43, 3], [45, 4], [45, 4], [45, 6], [45, 4], [45, 4], [45, 4], [45, 8], [45, 4], [45, 4], [45, 4], [45, 6], [45, 4], [45, 4], [45, 4], [45, 4], [45, 4], [45, 1], [41, 2], [41, 3], [41, 3], [41, 1], [41, 3], [41, 4], [76, 1], [76, 2], [76, 1], [76, 1], [72, 1], [72, 2], [73, 3], [30, 1], [30, 2], [30, 1], [30, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [28, 1], [28, 2], [28, 1], [28, 1], [24, 5], [25, 5], [26, 2], [26, 4], [26, 3], [26, 5], [26, 3], [26, 5], [26, 5], [26, 7], [26, 2], [26, 4], [26, 2], [26, 4], [26, 4], [26, 6], [22, 5], [23, 5], [23, 5], [23, 9], [23, 9], [23, 7], [23, 7], [103, 1], [103, 3], [92, 1], [92, 3], [107, 1], [107, 2], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [82, 1], [82, 1], [82, 1], [82, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [79, 1], [79, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [47, 1], [47, 2], [101, 1], [101, 2], [33, 1], [33, 1], [33, 1], [33, 1], [33, 1]],
    performAction: v4(function v363(v364, v365, v366, v367, v368, v369, v370) {
      var v371 = v369.length - 1;
      switch (v368) {
        case 2:
          this.$ = [];
          break;
        case 3:
          if (!Array.isArray(v369[v371]) || v369[v371].length > 0) {
            v369[v371 - 1].push(v369[v371]);
          }
          this.$ = v369[v371 - 1];
          break;
        case 4:
        case 183:
          this.$ = v369[v371];
          break;
        case 11:
          v367.setDirection("TB");
          this.$ = "TB";
          break;
        case 12:
          v367.setDirection(v369[v371 - 1]);
          this.$ = v369[v371 - 1];
          break;
        case 27:
          this.$ = v369[v371 - 1].nodes;
          break;
        case 28:
        case 29:
        case 30:
        case 31:
        case 32:
          this.$ = [];
          break;
        case 33:
          this.$ = v367.addSubGraph(v369[v371 - 6], v369[v371 - 1], v369[v371 - 4]);
          break;
        case 34:
          this.$ = v367.addSubGraph(v369[v371 - 3], v369[v371 - 1], v369[v371 - 3]);
          break;
        case 35:
          this.$ = v367.addSubGraph(undefined, v369[v371 - 1], undefined);
          break;
        case 37:
          this.$ = v369[v371].trim();
          v367.setAccTitle(this.$);
          break;
        case 38:
        case 39:
          this.$ = v369[v371].trim();
          v367.setAccDescription(this.$);
          break;
        case 43:
          this.$ = v369[v371 - 1] + v369[v371];
          break;
        case 44:
          this.$ = v369[v371];
          break;
        case 45:
          v367.addVertex(v369[v371 - 1][v369[v371 - 1].length - 1], undefined, undefined, undefined, undefined, undefined, undefined, v369[v371]);
          v367.addLink(v369[v371 - 3].stmt, v369[v371 - 1], v369[v371 - 2]);
          this.$ = {
            stmt: v369[v371 - 1],
            nodes: v369[v371 - 1].concat(v369[v371 - 3].nodes)
          };
          break;
        case 46:
          v367.addLink(v369[v371 - 2].stmt, v369[v371], v369[v371 - 1]);
          this.$ = {
            stmt: v369[v371],
            nodes: v369[v371].concat(v369[v371 - 2].nodes)
          };
          break;
        case 47:
          v367.addLink(v369[v371 - 3].stmt, v369[v371 - 1], v369[v371 - 2]);
          this.$ = {
            stmt: v369[v371 - 1],
            nodes: v369[v371 - 1].concat(v369[v371 - 3].nodes)
          };
          break;
        case 48:
          this.$ = {
            stmt: v369[v371 - 1],
            nodes: v369[v371 - 1]
          };
          break;
        case 49:
          v367.addVertex(v369[v371 - 1][v369[v371 - 1].length - 1], undefined, undefined, undefined, undefined, undefined, undefined, v369[v371]);
          this.$ = {
            stmt: v369[v371 - 1],
            nodes: v369[v371 - 1],
            shapeData: v369[v371]
          };
          break;
        case 50:
          this.$ = {
            stmt: v369[v371],
            nodes: v369[v371]
          };
          break;
        case 51:
          this.$ = [v369[v371]];
          break;
        case 52:
          v367.addVertex(v369[v371 - 5][v369[v371 - 5].length - 1], undefined, undefined, undefined, undefined, undefined, undefined, v369[v371 - 4]);
          this.$ = v369[v371 - 5].concat(v369[v371]);
          break;
        case 53:
          this.$ = v369[v371 - 4].concat(v369[v371]);
          break;
        case 54:
          this.$ = v369[v371];
          break;
        case 55:
          this.$ = v369[v371 - 2];
          v367.setClass(v369[v371 - 2], v369[v371]);
          break;
        case 56:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "square");
          break;
        case 57:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "doublecircle");
          break;
        case 58:
          this.$ = v369[v371 - 5];
          v367.addVertex(v369[v371 - 5], v369[v371 - 2], "circle");
          break;
        case 59:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "ellipse");
          break;
        case 60:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "stadium");
          break;
        case 61:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "subroutine");
          break;
        case 62:
          this.$ = v369[v371 - 7];
          v367.addVertex(v369[v371 - 7], v369[v371 - 1], "rect", undefined, undefined, undefined, Object.fromEntries([[v369[v371 - 5], v369[v371 - 3]]]));
          break;
        case 63:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "cylinder");
          break;
        case 64:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "round");
          break;
        case 65:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "diamond");
          break;
        case 66:
          this.$ = v369[v371 - 5];
          v367.addVertex(v369[v371 - 5], v369[v371 - 2], "hexagon");
          break;
        case 67:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "odd");
          break;
        case 68:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "trapezoid");
          break;
        case 69:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "inv_trapezoid");
          break;
        case 70:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "lean_right");
          break;
        case 71:
          this.$ = v369[v371 - 3];
          v367.addVertex(v369[v371 - 3], v369[v371 - 1], "lean_left");
          break;
        case 72:
          this.$ = v369[v371];
          v367.addVertex(v369[v371]);
          break;
        case 73:
          v369[v371 - 1].text = v369[v371];
          this.$ = v369[v371 - 1];
          break;
        case 74:
        case 75:
          v369[v371 - 2].text = v369[v371 - 1];
          this.$ = v369[v371 - 2];
          break;
        case 76:
          this.$ = v369[v371];
          break;
        case 77:
          var v372 = v367.destructLink(v369[v371], v369[v371 - 2]);
          this.$ = {
            type: v372.type,
            stroke: v372.stroke,
            length: v372.length,
            text: v369[v371 - 1]
          };
          break;
        case 78:
          var v372 = v367.destructLink(v369[v371], v369[v371 - 2]);
          this.$ = {
            type: v372.type,
            stroke: v372.stroke,
            length: v372.length,
            text: v369[v371 - 1],
            id: v369[v371 - 3]
          };
          break;
        case 79:
          this.$ = {
            text: v369[v371],
            type: "text"
          };
          break;
        case 80:
          this.$ = {
            text: v369[v371 - 1].text + "" + v369[v371],
            type: v369[v371 - 1].type
          };
          break;
        case 81:
          this.$ = {
            text: v369[v371],
            type: "string"
          };
          break;
        case 82:
          this.$ = {
            text: v369[v371],
            type: "markdown"
          };
          break;
        case 83:
          var v372 = v367.destructLink(v369[v371]);
          this.$ = {
            type: v372.type,
            stroke: v372.stroke,
            length: v372.length
          };
          break;
        case 84:
          var v372 = v367.destructLink(v369[v371]);
          this.$ = {
            type: v372.type,
            stroke: v372.stroke,
            length: v372.length,
            id: v369[v371 - 1]
          };
          break;
        case 85:
          this.$ = v369[v371 - 1];
          break;
        case 86:
          this.$ = {
            text: v369[v371],
            type: "text"
          };
          break;
        case 87:
          this.$ = {
            text: v369[v371 - 1].text + "" + v369[v371],
            type: v369[v371 - 1].type
          };
          break;
        case 88:
          this.$ = {
            text: v369[v371],
            type: "string"
          };
          break;
        case 89:
        case 104:
          this.$ = {
            text: v369[v371],
            type: "markdown"
          };
          break;
        case 101:
          this.$ = {
            text: v369[v371],
            type: "text"
          };
          break;
        case 102:
          this.$ = {
            text: v369[v371 - 1].text + "" + v369[v371],
            type: v369[v371 - 1].type
          };
          break;
        case 103:
          this.$ = {
            text: v369[v371],
            type: "text"
          };
          break;
        case 105:
          this.$ = v369[v371 - 4];
          v367.addClass(v369[v371 - 2], v369[v371]);
          break;
        case 106:
          this.$ = v369[v371 - 4];
          v367.setClass(v369[v371 - 2], v369[v371]);
          break;
        case 107:
        case 115:
          this.$ = v369[v371 - 1];
          v367.setClickEvent(v369[v371 - 1], v369[v371]);
          break;
        case 108:
        case 116:
          this.$ = v369[v371 - 3];
          v367.setClickEvent(v369[v371 - 3], v369[v371 - 2]);
          v367.setTooltip(v369[v371 - 3], v369[v371]);
          break;
        case 109:
          this.$ = v369[v371 - 2];
          v367.setClickEvent(v369[v371 - 2], v369[v371 - 1], v369[v371]);
          break;
        case 110:
          this.$ = v369[v371 - 4];
          v367.setClickEvent(v369[v371 - 4], v369[v371 - 3], v369[v371 - 2]);
          v367.setTooltip(v369[v371 - 4], v369[v371]);
          break;
        case 111:
          this.$ = v369[v371 - 2];
          v367.setLink(v369[v371 - 2], v369[v371]);
          break;
        case 112:
          this.$ = v369[v371 - 4];
          v367.setLink(v369[v371 - 4], v369[v371 - 2]);
          v367.setTooltip(v369[v371 - 4], v369[v371]);
          break;
        case 113:
          this.$ = v369[v371 - 4];
          v367.setLink(v369[v371 - 4], v369[v371 - 2], v369[v371]);
          break;
        case 114:
          this.$ = v369[v371 - 6];
          v367.setLink(v369[v371 - 6], v369[v371 - 4], v369[v371]);
          v367.setTooltip(v369[v371 - 6], v369[v371 - 2]);
          break;
        case 117:
          this.$ = v369[v371 - 1];
          v367.setLink(v369[v371 - 1], v369[v371]);
          break;
        case 118:
          this.$ = v369[v371 - 3];
          v367.setLink(v369[v371 - 3], v369[v371 - 2]);
          v367.setTooltip(v369[v371 - 3], v369[v371]);
          break;
        case 119:
          this.$ = v369[v371 - 3];
          v367.setLink(v369[v371 - 3], v369[v371 - 2], v369[v371]);
          break;
        case 120:
          this.$ = v369[v371 - 5];
          v367.setLink(v369[v371 - 5], v369[v371 - 4], v369[v371]);
          v367.setTooltip(v369[v371 - 5], v369[v371 - 2]);
          break;
        case 121:
          this.$ = v369[v371 - 4];
          v367.addVertex(v369[v371 - 2], undefined, undefined, v369[v371]);
          break;
        case 122:
          this.$ = v369[v371 - 4];
          v367.updateLink([v369[v371 - 2]], v369[v371]);
          break;
        case 123:
          this.$ = v369[v371 - 4];
          v367.updateLink(v369[v371 - 2], v369[v371]);
          break;
        case 124:
          this.$ = v369[v371 - 8];
          v367.updateLinkInterpolate([v369[v371 - 6]], v369[v371 - 2]);
          v367.updateLink([v369[v371 - 6]], v369[v371]);
          break;
        case 125:
          this.$ = v369[v371 - 8];
          v367.updateLinkInterpolate(v369[v371 - 6], v369[v371 - 2]);
          v367.updateLink(v369[v371 - 6], v369[v371]);
          break;
        case 126:
          this.$ = v369[v371 - 6];
          v367.updateLinkInterpolate([v369[v371 - 4]], v369[v371]);
          break;
        case 127:
          this.$ = v369[v371 - 6];
          v367.updateLinkInterpolate(v369[v371 - 4], v369[v371]);
          break;
        case 128:
        case 130:
          this.$ = [v369[v371]];
          break;
        case 129:
        case 131:
          v369[v371 - 2].push(v369[v371]);
          this.$ = v369[v371 - 2];
          break;
        case 133:
          this.$ = v369[v371 - 1] + v369[v371];
          break;
        case 181:
          this.$ = v369[v371];
          break;
        case 182:
          this.$ = v369[v371 - 1] + "" + v369[v371];
          break;
        case 184:
          this.$ = v369[v371 - 1] + "" + v369[v371];
          break;
        case 185:
          this.$ = {
            stmt: "dir",
            value: "TB"
          };
          break;
        case 186:
          this.$ = {
            stmt: "dir",
            value: "BT"
          };
          break;
        case 187:
          this.$ = {
            stmt: "dir",
            value: "RL"
          };
          break;
        case 188:
          this.$ = {
            stmt: "dir",
            value: "LR"
          };
          break;
        case 189:
          this.$ = {
            stmt: "dir",
            value: "TD"
          };
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: 2,
      9: v252,
      10: v253,
      12: v254
    }, {
      1: [3]
    }, v247(v255, v256, {
      5: 6
    }), {
      4: 7,
      9: v252,
      10: v253,
      12: v254
    }, {
      4: 8,
      9: v252,
      10: v253,
      12: v254
    }, {
      13: [1, 9],
      14: [1, 10]
    }, {
      1: [2, 1],
      6: 11,
      7: 12,
      8: v257,
      9: v258,
      10: v259,
      11: v260,
      20: 17,
      22: 18,
      23: 19,
      24: 20,
      25: 21,
      26: 22,
      27: v261,
      33: 24,
      34: v262,
      36: v263,
      38: v264,
      42: 28,
      43: 39,
      44: v265,
      45: 40,
      47: 41,
      60: v266,
      84: v267,
      85: v268,
      86: v269,
      87: v270,
      88: v271,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280,
      121: v281,
      122: v282,
      123: v283,
      124: v284,
      125: v285
    }, v247(v255, [2, 9]), v247(v255, [2, 10]), v247(v255, [2, 11]), {
      8: [1, 55],
      9: [1, 56],
      10: v286,
      15: 54,
      18: 57
    }, v247(v287, [2, 3]), v247(v287, [2, 4]), v247(v287, [2, 5]), v247(v287, [2, 6]), v247(v287, [2, 7]), v247(v287, [2, 8]), {
      8: v288,
      9: v289,
      11: v290,
      21: 59,
      41: 60,
      72: 64,
      75: [1, 65],
      77: [1, 67],
      78: [1, 66]
    }, {
      8: v288,
      9: v289,
      11: v290,
      21: 68
    }, {
      8: v288,
      9: v289,
      11: v290,
      21: 69
    }, {
      8: v288,
      9: v289,
      11: v290,
      21: 70
    }, {
      8: v288,
      9: v289,
      11: v290,
      21: 71
    }, {
      8: v288,
      9: v289,
      11: v290,
      21: 72
    }, {
      8: v288,
      9: v289,
      10: [1, 73],
      11: v290,
      21: 74
    }, v247(v287, [2, 36]), {
      35: [1, 75]
    }, {
      37: [1, 76]
    }, v247(v287, [2, 39]), v247(v291, [2, 50], {
      18: 77,
      39: 78,
      10: v286,
      40: v292
    }), {
      10: [1, 80]
    }, {
      10: [1, 81]
    }, {
      10: [1, 82]
    }, {
      10: [1, 83]
    }, {
      14: v293,
      44: v294,
      60: v295,
      80: [1, 87],
      89: v296,
      95: [1, 84],
      97: [1, 85],
      101: 86,
      105: v297,
      106: v298,
      109: v299,
      111: v300,
      114: v301,
      115: v302,
      116: v303,
      120: 88
    }, v247(v287, [2, 185]), v247(v287, [2, 186]), v247(v287, [2, 187]), v247(v287, [2, 188]), v247(v287, [2, 189]), v247(v304, [2, 51]), v247(v304, [2, 54], {
      46: [1, 100]
    }), v247(v305, [2, 72], {
      113: 113,
      29: [1, 101],
      44: v265,
      48: [1, 102],
      50: [1, 103],
      52: [1, 104],
      54: [1, 105],
      56: [1, 106],
      58: [1, 107],
      60: v266,
      63: [1, 108],
      65: [1, 109],
      67: [1, 110],
      68: [1, 111],
      70: [1, 112],
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      114: v278,
      115: v279,
      116: v280
    }), v247(v306, [2, 181]), v247(v306, [2, 142]), v247(v306, [2, 143]), v247(v306, [2, 144]), v247(v306, [2, 145]), v247(v306, [2, 146]), v247(v306, [2, 147]), v247(v306, [2, 148]), v247(v306, [2, 149]), v247(v306, [2, 150]), v247(v306, [2, 151]), v247(v306, [2, 152]), v247(v255, [2, 12]), v247(v255, [2, 18]), v247(v255, [2, 19]), {
      9: [1, 114]
    }, v247(v307, [2, 26], {
      18: 115,
      10: v286
    }), v247(v287, [2, 27]), {
      42: 116,
      43: 39,
      44: v265,
      45: 40,
      47: 41,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, v247(v287, [2, 40]), v247(v287, [2, 41]), v247(v287, [2, 42]), v247(v308, [2, 76], {
      73: 117,
      62: [1, 119],
      74: [1, 118]
    }), {
      76: 120,
      79: 121,
      80: v309,
      81: v310,
      116: v311,
      119: v312
    }, {
      75: [1, 126],
      77: [1, 127]
    }, v247(v313, [2, 83]), v247(v287, [2, 28]), v247(v287, [2, 29]), v247(v287, [2, 30]), v247(v287, [2, 31]), v247(v287, [2, 32]), {
      10: v314,
      12: v315,
      14: v316,
      27: v317,
      28: 128,
      32: v318,
      44: v319,
      60: v320,
      75: v321,
      80: [1, 130],
      81: [1, 131],
      83: 141,
      84: v322,
      85: v323,
      86: v324,
      87: v325,
      88: v326,
      89: v327,
      90: v328,
      91: 129,
      105: v329,
      109: v330,
      111: v331,
      114: v332,
      115: v333,
      116: v334
    }, v247(v335, v256, {
      5: 154
    }), v247(v287, [2, 37]), v247(v287, [2, 38]), v247(v291, [2, 48], {
      44: v336
    }), v247(v291, [2, 49], {
      18: 156,
      10: v286,
      40: v337
    }), v247(v304, [2, 44]), {
      44: v265,
      47: 158,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, {
      102: [1, 159],
      103: 160,
      105: [1, 161]
    }, {
      44: v265,
      47: 162,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, {
      44: v265,
      47: 163,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, v247(v338, [2, 107], {
      10: [1, 164],
      96: [1, 165]
    }), {
      80: [1, 166]
    }, v247(v338, [2, 115], {
      120: 168,
      10: [1, 167],
      14: v293,
      44: v294,
      60: v295,
      89: v296,
      105: v297,
      106: v298,
      109: v299,
      111: v300,
      114: v301,
      115: v302,
      116: v303
    }), v247(v338, [2, 117], {
      10: [1, 169]
    }), v247(v339, [2, 183]), v247(v339, [2, 170]), v247(v339, [2, 171]), v247(v339, [2, 172]), v247(v339, [2, 173]), v247(v339, [2, 174]), v247(v339, [2, 175]), v247(v339, [2, 176]), v247(v339, [2, 177]), v247(v339, [2, 178]), v247(v339, [2, 179]), v247(v339, [2, 180]), {
      44: v265,
      47: 170,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, {
      30: 171,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 179,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 181,
      50: [1, 180],
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 182,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 183,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 184,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      109: [1, 185]
    }, {
      30: 186,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 187,
      65: [1, 188],
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 189,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 190,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 191,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, v247(v306, [2, 182]), v247(v255, [2, 20]), v247(v307, [2, 25]), v247(v291, [2, 46], {
      39: 192,
      18: 193,
      10: v286,
      40: v292
    }), v247(v308, [2, 73], {
      10: [1, 194]
    }), {
      10: [1, 195]
    }, {
      30: 196,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      77: [1, 197],
      79: 198,
      116: v311,
      119: v312
    }, v247(v346, [2, 79]), v247(v346, [2, 81]), v247(v346, [2, 82]), v247(v346, [2, 168]), v247(v346, [2, 169]), {
      76: 199,
      79: 121,
      80: v309,
      81: v310,
      116: v311,
      119: v312
    }, v247(v313, [2, 84]), {
      8: v288,
      9: v289,
      10: v314,
      11: v290,
      12: v315,
      14: v316,
      21: 201,
      27: v317,
      29: [1, 200],
      32: v318,
      44: v319,
      60: v320,
      75: v321,
      83: 141,
      84: v322,
      85: v323,
      86: v324,
      87: v325,
      88: v326,
      89: v327,
      90: v328,
      91: 202,
      105: v329,
      109: v330,
      111: v331,
      114: v332,
      115: v333,
      116: v334
    }, v247(v347, [2, 101]), v247(v347, [2, 103]), v247(v347, [2, 104]), v247(v347, [2, 157]), v247(v347, [2, 158]), v247(v347, [2, 159]), v247(v347, [2, 160]), v247(v347, [2, 161]), v247(v347, [2, 162]), v247(v347, [2, 163]), v247(v347, [2, 164]), v247(v347, [2, 165]), v247(v347, [2, 166]), v247(v347, [2, 167]), v247(v347, [2, 90]), v247(v347, [2, 91]), v247(v347, [2, 92]), v247(v347, [2, 93]), v247(v347, [2, 94]), v247(v347, [2, 95]), v247(v347, [2, 96]), v247(v347, [2, 97]), v247(v347, [2, 98]), v247(v347, [2, 99]), v247(v347, [2, 100]), {
      6: 11,
      7: 12,
      8: v257,
      9: v258,
      10: v259,
      11: v260,
      20: 17,
      22: 18,
      23: 19,
      24: 20,
      25: 21,
      26: 22,
      27: v261,
      32: [1, 203],
      33: 24,
      34: v262,
      36: v263,
      38: v264,
      42: 28,
      43: 39,
      44: v265,
      45: 40,
      47: 41,
      60: v266,
      84: v267,
      85: v268,
      86: v269,
      87: v270,
      88: v271,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280,
      121: v281,
      122: v282,
      123: v283,
      124: v284,
      125: v285
    }, {
      10: v286,
      18: 204
    }, {
      44: [1, 205]
    }, v247(v304, [2, 43]), {
      10: [1, 206],
      44: v265,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 113,
      114: v278,
      115: v279,
      116: v280
    }, {
      10: [1, 207]
    }, {
      10: [1, 208],
      106: [1, 209]
    }, v247(v348, [2, 128]), {
      10: [1, 210],
      44: v265,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 113,
      114: v278,
      115: v279,
      116: v280
    }, {
      10: [1, 211],
      44: v265,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 113,
      114: v278,
      115: v279,
      116: v280
    }, {
      80: [1, 212]
    }, v247(v338, [2, 109], {
      10: [1, 213]
    }), v247(v338, [2, 111], {
      10: [1, 214]
    }), {
      80: [1, 215]
    }, v247(v339, [2, 184]), {
      80: [1, 216],
      98: [1, 217]
    }, v247(v304, [2, 55], {
      113: 113,
      44: v265,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      114: v278,
      115: v279,
      116: v280
    }), {
      31: [1, 218],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, v247(v349, [2, 86]), v247(v349, [2, 88]), v247(v349, [2, 89]), v247(v349, [2, 153]), v247(v349, [2, 154]), v247(v349, [2, 155]), v247(v349, [2, 156]), {
      49: [1, 220],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 221,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      51: [1, 222],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      53: [1, 223],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      55: [1, 224],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      57: [1, 225],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      60: [1, 226]
    }, {
      64: [1, 227],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      66: [1, 228],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      30: 229,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, {
      31: [1, 230],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      67: v340,
      69: [1, 231],
      71: [1, 232],
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      67: v340,
      69: [1, 234],
      71: [1, 233],
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, v247(v291, [2, 45], {
      18: 156,
      10: v286,
      40: v337
    }), v247(v291, [2, 47], {
      44: v336
    }), v247(v308, [2, 75]), v247(v308, [2, 74]), {
      62: [1, 235],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, v247(v308, [2, 77]), v247(v346, [2, 80]), {
      77: [1, 236],
      79: 198,
      116: v311,
      119: v312
    }, {
      30: 237,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, v247(v335, v256, {
      5: 238
    }), v247(v347, [2, 102]), v247(v287, [2, 35]), {
      43: 239,
      44: v265,
      45: 40,
      47: 41,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, {
      10: v286,
      18: 240
    }, {
      10: v350,
      60: v351,
      84: v352,
      92: 241,
      105: v353,
      107: 242,
      108: 243,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }, {
      10: v350,
      60: v351,
      84: v352,
      92: 252,
      104: [1, 253],
      105: v353,
      107: 242,
      108: 243,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }, {
      10: v350,
      60: v351,
      84: v352,
      92: 254,
      104: [1, 255],
      105: v353,
      107: 242,
      108: 243,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }, {
      105: [1, 256]
    }, {
      10: v350,
      60: v351,
      84: v352,
      92: 257,
      105: v353,
      107: 242,
      108: 243,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }, {
      44: v265,
      47: 258,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, v247(v338, [2, 108]), {
      80: [1, 259]
    }, {
      80: [1, 260],
      98: [1, 261]
    }, v247(v338, [2, 116]), v247(v338, [2, 118], {
      10: [1, 262]
    }), v247(v338, [2, 119]), v247(v305, [2, 56]), v247(v349, [2, 87]), v247(v305, [2, 57]), {
      51: [1, 263],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, v247(v305, [2, 64]), v247(v305, [2, 59]), v247(v305, [2, 60]), v247(v305, [2, 61]), {
      109: [1, 264]
    }, v247(v305, [2, 63]), v247(v305, [2, 65]), {
      66: [1, 265],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, v247(v305, [2, 67]), v247(v305, [2, 68]), v247(v305, [2, 70]), v247(v305, [2, 69]), v247(v305, [2, 71]), v247([10, 44, 60, 89, 102, 105, 106, 109, 111, 114, 115, 116], [2, 85]), v247(v308, [2, 78]), {
      31: [1, 266],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      6: 11,
      7: 12,
      8: v257,
      9: v258,
      10: v259,
      11: v260,
      20: 17,
      22: 18,
      23: 19,
      24: 20,
      25: 21,
      26: 22,
      27: v261,
      32: [1, 267],
      33: 24,
      34: v262,
      36: v263,
      38: v264,
      42: 28,
      43: 39,
      44: v265,
      45: 40,
      47: 41,
      60: v266,
      84: v267,
      85: v268,
      86: v269,
      87: v270,
      88: v271,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280,
      121: v281,
      122: v282,
      123: v283,
      124: v284,
      125: v285
    }, v247(v304, [2, 53]), {
      43: 268,
      44: v265,
      45: 40,
      47: 41,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280
    }, v247(v338, [2, 121], {
      106: v358
    }), v247(v359, [2, 130], {
      108: 270,
      10: v350,
      60: v351,
      84: v352,
      105: v353,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }), v247(v360, [2, 132]), v247(v360, [2, 134]), v247(v360, [2, 135]), v247(v360, [2, 136]), v247(v360, [2, 137]), v247(v360, [2, 138]), v247(v360, [2, 139]), v247(v360, [2, 140]), v247(v360, [2, 141]), v247(v338, [2, 122], {
      106: v358
    }), {
      10: [1, 271]
    }, v247(v338, [2, 123], {
      106: v358
    }), {
      10: [1, 272]
    }, v247(v348, [2, 129]), v247(v338, [2, 105], {
      106: v358
    }), v247(v338, [2, 106], {
      113: 113,
      44: v265,
      60: v266,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      114: v278,
      115: v279,
      116: v280
    }), v247(v338, [2, 110]), v247(v338, [2, 112], {
      10: [1, 273]
    }), v247(v338, [2, 113]), {
      98: [1, 274]
    }, {
      51: [1, 275]
    }, {
      62: [1, 276]
    }, {
      66: [1, 277]
    }, {
      8: v288,
      9: v289,
      11: v290,
      21: 278
    }, v247(v287, [2, 34]), v247(v304, [2, 52]), {
      10: v350,
      60: v351,
      84: v352,
      105: v353,
      107: 279,
      108: 243,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }, v247(v360, [2, 133]), {
      14: v293,
      44: v294,
      60: v295,
      89: v296,
      101: 280,
      105: v297,
      106: v298,
      109: v299,
      111: v300,
      114: v301,
      115: v302,
      116: v303,
      120: 88
    }, {
      14: v293,
      44: v294,
      60: v295,
      89: v296,
      101: 281,
      105: v297,
      106: v298,
      109: v299,
      111: v300,
      114: v301,
      115: v302,
      116: v303,
      120: 88
    }, {
      98: [1, 282]
    }, v247(v338, [2, 120]), v247(v305, [2, 58]), {
      30: 283,
      67: v340,
      80: v341,
      81: v342,
      82: 172,
      116: v343,
      117: v344,
      118: v345
    }, v247(v305, [2, 66]), v247(v335, v256, {
      5: 284
    }), v247(v359, [2, 131], {
      108: 270,
      10: v350,
      60: v351,
      84: v352,
      105: v353,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }), v247(v338, [2, 126], {
      120: 168,
      10: [1, 285],
      14: v293,
      44: v294,
      60: v295,
      89: v296,
      105: v297,
      106: v298,
      109: v299,
      111: v300,
      114: v301,
      115: v302,
      116: v303
    }), v247(v338, [2, 127], {
      120: 168,
      10: [1, 286],
      14: v293,
      44: v294,
      60: v295,
      89: v296,
      105: v297,
      106: v298,
      109: v299,
      111: v300,
      114: v301,
      115: v302,
      116: v303
    }), v247(v338, [2, 114]), {
      31: [1, 287],
      67: v340,
      82: 219,
      116: v343,
      117: v344,
      118: v345
    }, {
      6: 11,
      7: 12,
      8: v257,
      9: v258,
      10: v259,
      11: v260,
      20: 17,
      22: 18,
      23: 19,
      24: 20,
      25: 21,
      26: 22,
      27: v261,
      32: [1, 288],
      33: 24,
      34: v262,
      36: v263,
      38: v264,
      42: 28,
      43: 39,
      44: v265,
      45: 40,
      47: 41,
      60: v266,
      84: v267,
      85: v268,
      86: v269,
      87: v270,
      88: v271,
      89: v272,
      102: v273,
      105: v274,
      106: v275,
      109: v276,
      111: v277,
      113: 42,
      114: v278,
      115: v279,
      116: v280,
      121: v281,
      122: v282,
      123: v283,
      124: v284,
      125: v285
    }, {
      10: v350,
      60: v351,
      84: v352,
      92: 289,
      105: v353,
      107: 242,
      108: 243,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }, {
      10: v350,
      60: v351,
      84: v352,
      92: 290,
      105: v353,
      107: 242,
      108: 243,
      109: v354,
      110: v355,
      111: v356,
      112: v357
    }, v247(v305, [2, 62]), v247(v287, [2, 33]), v247(v338, [2, 124], {
      106: v358
    }), v247(v338, [2, 125], {
      106: v358
    })],
    defaultActions: {},
    parseError: v4(function v373(v374, v375) {
      if (v375.recoverable) {
        this.trace(v374);
      } else {
        var v376 = new Error(v374);
        v376.hash = v375;
        throw v376;
      }
    }, "parseError"),
    parse: v4(function v377(v378) {
      var v379 = this;
      var v380 = [0];
      var v381 = [];
      var v382 = [null];
      var v383 = [];
      var v384 = this.table;
      var v385 = "";
      var v386 = 0;
      var v387 = 0;
      var v388 = 2;
      var v389 = 1;
      var v390 = v383.slice.call(arguments, 1);
      var v391 = Object.create(this.lexer);
      var v392 = {
        yy: {}
      };
      for (var v393 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v393)) {
          v392.yy[v393] = this.yy[v393];
        }
      }
      v391.setInput(v378, v392.yy);
      v392.yy.lexer = v391;
      v392.yy.parser = this;
      if (typeof v391.yylloc == "undefined") {
        v391.yylloc = {};
      }
      var v394 = v391.yylloc;
      v383.push(v394);
      var v395 = v391.options && v391.options.ranges;
      if (typeof v392.yy.parseError === "function") {
        this.parseError = v392.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v396(v397) {
        v380.length = v380.length - v397 * 2;
        v382.length = v382.length - v397;
        v383.length = v383.length - v397;
      }
      v4(v396, "popStack");
      function v398() {
        var v399;
        v399 = v381.pop() || v391.lex() || v389;
        if (typeof v399 !== "number") {
          if (v399 instanceof Array) {
            v381 = v399;
            v399 = v381.pop();
          }
          v399 = v379.symbols_[v399] || v399;
        }
        return v399;
      }
      v4(v398, "lex");
      var v400;
      var v401;
      var v402;
      var v403;
      var v404 = {};
      var v405;
      var v406;
      var v407;
      var v408;
      while (true) {
        v401 = v380[v380.length - 1];
        if (this.defaultActions[v401]) {
          v402 = this.defaultActions[v401];
        } else {
          if (v400 === null || typeof v400 == "undefined") {
            v400 = v398();
          }
          v402 = v384[v401] && v384[v401][v400];
        }
        if (typeof v402 === "undefined" || !v402.length || !v402[0]) {
          var v409 = "";
          v408 = [];
          for (v405 in v384[v401]) {
            if (this.terminals_[v405] && v405 > v388) {
              v408.push("'" + this.terminals_[v405] + "'");
            }
          }
          if (v391.showPosition) {
            v409 = "Parse error on line " + (v386 + 1) + ":\n" + v391.showPosition() + "\nExpecting " + v408.join(", ") + ", got '" + (this.terminals_[v400] || v400) + "'";
          } else {
            v409 = "Parse error on line " + (v386 + 1) + ": Unexpected " + (v400 == v389 ? "end of input" : "'" + (this.terminals_[v400] || v400) + "'");
          }
          this.parseError(v409, {
            text: v391.match,
            token: this.terminals_[v400] || v400,
            line: v391.yylineno,
            loc: v394,
            expected: v408
          });
        }
        if (v402[0] instanceof Array && v402.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v401 + ", token: " + v400);
        }
        switch (v402[0]) {
          case 1:
            v380.push(v400);
            v382.push(v391.yytext);
            v383.push(v391.yylloc);
            v380.push(v402[1]);
            v400 = null;
            {
              v387 = v391.yyleng;
              v385 = v391.yytext;
              v386 = v391.yylineno;
              v394 = v391.yylloc;
            }
            break;
          case 2:
            v406 = this.productions_[v402[1]][1];
            v404.$ = v382[v382.length - v406];
            v404._$ = {
              first_line: v383[v383.length - (v406 || 1)].first_line,
              last_line: v383[v383.length - 1].last_line,
              first_column: v383[v383.length - (v406 || 1)].first_column,
              last_column: v383[v383.length - 1].last_column
            };
            if (v395) {
              v404._$.range = [v383[v383.length - (v406 || 1)].range[0], v383[v383.length - 1].range[1]];
            }
            v403 = this.performAction.apply(v404, [v385, v387, v386, v392.yy, v402[1], v382, v383].concat(v390));
            if (typeof v403 !== "undefined") {
              return v403;
            }
            if (v406) {
              v380 = v380.slice(0, v406 * -1 * 2);
              v382 = v382.slice(0, v406 * -1);
              v383 = v383.slice(0, v406 * -1);
            }
            v380.push(this.productions_[v402[1]][0]);
            v382.push(v404.$);
            v383.push(v404._$);
            v407 = v384[v380[v380.length - 2]][v380[v380.length - 1]];
            v380.push(v407);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v410 = function () {
    var v411 = {
      EOF: 1,
      parseError: v4(function v412(v413, v414) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v413, v414);
        } else {
          throw new Error(v413);
        }
      }, "parseError"),
      setInput: v4(function (v415, v416) {
        this.yy = v416 || this.yy || {};
        this._input = v415;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = "";
        this.conditionStack = ["INITIAL"];
        this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0
        };
        if (this.options.ranges) {
          this.yylloc.range = [0, 0];
        }
        this.offset = 0;
        return this;
      }, "setInput"),
      input: v4(function () {
        var v417 = this._input[0];
        this.yytext += v417;
        this.yyleng++;
        this.offset++;
        this.match += v417;
        this.matched += v417;
        var v418 = v417.match(/(?:\r\n?|\n).*/g);
        if (v418) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v417;
      }, "input"),
      unput: v4(function (v419) {
        var v420 = v419.length;
        var v421 = v419.split(/(?:\r\n?|\n)/g);
        this._input = v419 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v420);
        this.offset -= v420;
        var v422 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v421.length - 1) {
          this.yylineno -= v421.length - 1;
        }
        var v423 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v421 ? (v421.length === v422.length ? this.yylloc.first_column : 0) + v422[v422.length - v421.length].length - v421[0].length : this.yylloc.first_column - v420
        };
        if (this.options.ranges) {
          this.yylloc.range = [v423[0], v423[0] + this.yyleng - v420];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v4(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v4(function () {
        if (this.options.backtrack_lexer) {
          this._backtrack = true;
        } else {
          return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n" + this.showPosition(), {
            text: "",
            token: null,
            line: this.yylineno
          });
        }
        return this;
      }, "reject"),
      less: v4(function (v424) {
        this.unput(this.match.slice(v424));
      }, "less"),
      pastInput: v4(function () {
        var v425 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v425.length > 20 ? "..." : "") + v425.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v4(function () {
        var v426 = this.match;
        if (v426.length < 20) {
          v426 += this._input.substr(0, 20 - v426.length);
        }
        return (v426.substr(0, 20) + (v426.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v4(function () {
        var v427 = this.pastInput();
        var v428 = new Array(v427.length + 1).join("-");
        return v427 + this.upcomingInput() + "\n" + v428 + "^";
      }, "showPosition"),
      test_match: v4(function (v429, v430) {
        var v431;
        var v432;
        var v433;
        if (this.options.backtrack_lexer) {
          v433 = {
            yylineno: this.yylineno,
            yylloc: {
              first_line: this.yylloc.first_line,
              last_line: this.last_line,
              first_column: this.yylloc.first_column,
              last_column: this.yylloc.last_column
            },
            yytext: this.yytext,
            match: this.match,
            matches: this.matches,
            matched: this.matched,
            yyleng: this.yyleng,
            offset: this.offset,
            _more: this._more,
            _input: this._input,
            yy: this.yy,
            conditionStack: this.conditionStack.slice(0),
            done: this.done
          };
          if (this.options.ranges) {
            v433.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v432 = v429[0].match(/(?:\r\n?|\n).*/g);
        if (v432) {
          this.yylineno += v432.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v432 ? v432[v432.length - 1].length - v432[v432.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v429[0].length
        };
        this.yytext += v429[0];
        this.match += v429[0];
        this.matches = v429;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v429[0].length);
        this.matched += v429[0];
        v431 = this.performAction.call(this, this.yy, this, v430, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v431) {
          return v431;
        } else if (this._backtrack) {
          for (var v434 in v433) {
            this[v434] = v433[v434];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v4(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v435;
        var v436;
        var v437;
        var v438;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v439 = this._currentRules();
        for (var v440 = 0; v440 < v439.length; v440++) {
          v437 = this._input.match(this.rules[v439[v440]]);
          if (v437 && (!v436 || v437[0].length > v436[0].length)) {
            v436 = v437;
            v438 = v440;
            if (this.options.backtrack_lexer) {
              v435 = this.test_match(v437, v439[v440]);
              if (v435 !== false) {
                return v435;
              } else if (this._backtrack) {
                v436 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v436) {
          v435 = this.test_match(v436, v439[v438]);
          if (v435 !== false) {
            return v435;
          }
          return false;
        }
        if (this._input === "") {
          return this.EOF;
        } else {
          return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
            text: "",
            token: null,
            line: this.yylineno
          });
        }
      }, "next"),
      lex: v4(function v441() {
        var v442 = this.next();
        if (v442) {
          return v442;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v4(function v443(v444) {
        this.conditionStack.push(v444);
      }, "begin"),
      popState: v4(function v445() {
        var v446 = this.conditionStack.length - 1;
        if (v446 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v4(function v447() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v4(function v448(v449) {
        v449 = this.conditionStack.length - 1 - Math.abs(v449 || 0);
        if (v449 >= 0) {
          return this.conditionStack[v449];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v4(function v450(v451) {
        this.begin(v451);
      }, "pushState"),
      stateStackSize: v4(function v452() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {},
      performAction: v4(function v453(v454, v455, v456, v457) {
        switch (v456) {
          case 0:
            this.begin("acc_title");
            return 34;
          case 1:
            this.popState();
            return "acc_title_value";
          case 2:
            this.begin("acc_descr");
            return 36;
          case 3:
            this.popState();
            return "acc_descr_value";
          case 4:
            this.begin("acc_descr_multiline");
            break;
          case 5:
            this.popState();
            break;
          case 6:
            return "acc_descr_multiline_value";
          case 7:
            this.pushState("shapeData");
            v455.yytext = "";
            return 40;
          case 8:
            this.pushState("shapeDataStr");
            return 40;
          case 9:
            this.popState();
            return 40;
          case 10:
            const v458 = /\n\s*/g;
            v455.yytext = v455.yytext.replace(v458, "<br/>");
            return 40;
          case 11:
            return 40;
          case 12:
            this.popState();
            break;
          case 13:
            this.begin("callbackname");
            break;
          case 14:
            this.popState();
            break;
          case 15:
            this.popState();
            this.begin("callbackargs");
            break;
          case 16:
            return 95;
          case 17:
            this.popState();
            break;
          case 18:
            return 96;
          case 19:
            return "MD_STR";
          case 20:
            this.popState();
            break;
          case 21:
            this.begin("md_string");
            break;
          case 22:
            return "STR";
          case 23:
            this.popState();
            break;
          case 24:
            this.pushState("string");
            break;
          case 25:
            return 84;
          case 26:
            return 102;
          case 27:
            return 85;
          case 28:
            return 104;
          case 29:
            return 86;
          case 30:
            return 87;
          case 31:
            return 97;
          case 32:
            this.begin("click");
            break;
          case 33:
            this.popState();
            break;
          case 34:
            return 88;
          case 35:
            if (v454.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
          case 36:
            if (v454.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
          case 37:
            if (v454.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
          case 38:
            if (v454.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
          case 39:
            return 27;
          case 40:
            return 32;
          case 41:
            return 98;
          case 42:
            return 98;
          case 43:
            return 98;
          case 44:
            return 98;
          case 45:
            this.popState();
            return 13;
          case 46:
            this.popState();
            return 14;
          case 47:
            this.popState();
            return 14;
          case 48:
            this.popState();
            return 14;
          case 49:
            this.popState();
            return 14;
          case 50:
            this.popState();
            return 14;
          case 51:
            this.popState();
            return 14;
          case 52:
            this.popState();
            return 14;
          case 53:
            this.popState();
            return 14;
          case 54:
            this.popState();
            return 14;
          case 55:
            this.popState();
            return 14;
          case 56:
            return 121;
          case 57:
            return 122;
          case 58:
            return 123;
          case 59:
            return 124;
          case 60:
            return 125;
          case 61:
            return 78;
          case 62:
            return 105;
          case 63:
            return 111;
          case 64:
            return 46;
          case 65:
            return 60;
          case 66:
            return 44;
          case 67:
            return 8;
          case 68:
            return 106;
          case 69:
            return 115;
          case 70:
            this.popState();
            return 77;
          case 71:
            this.pushState("edgeText");
            return 75;
          case 72:
            return 119;
          case 73:
            this.popState();
            return 77;
          case 74:
            this.pushState("thickEdgeText");
            return 75;
          case 75:
            return 119;
          case 76:
            this.popState();
            return 77;
          case 77:
            this.pushState("dottedEdgeText");
            return 75;
          case 78:
            return 119;
          case 79:
            return 77;
          case 80:
            this.popState();
            return 53;
          case 81:
            return "TEXT";
          case 82:
            this.pushState("ellipseText");
            return 52;
          case 83:
            this.popState();
            return 55;
          case 84:
            this.pushState("text");
            return 54;
          case 85:
            this.popState();
            return 57;
          case 86:
            this.pushState("text");
            return 56;
          case 87:
            return 58;
          case 88:
            this.pushState("text");
            return 67;
          case 89:
            this.popState();
            return 64;
          case 90:
            this.pushState("text");
            return 63;
          case 91:
            this.popState();
            return 49;
          case 92:
            this.pushState("text");
            return 48;
          case 93:
            this.popState();
            return 69;
          case 94:
            this.popState();
            return 71;
          case 95:
            return 117;
          case 96:
            this.pushState("trapText");
            return 68;
          case 97:
            this.pushState("trapText");
            return 70;
          case 98:
            return 118;
          case 99:
            return 67;
          case 100:
            return 90;
          case 101:
            return "SEP";
          case 102:
            return 89;
          case 103:
            return 115;
          case 104:
            return 111;
          case 105:
            return 44;
          case 106:
            return 109;
          case 107:
            return 114;
          case 108:
            return 116;
          case 109:
            this.popState();
            return 62;
          case 110:
            this.pushState("text");
            return 62;
          case 111:
            this.popState();
            return 51;
          case 112:
            this.pushState("text");
            return 50;
          case 113:
            this.popState();
            return 31;
          case 114:
            this.pushState("text");
            return 29;
          case 115:
            this.popState();
            return 66;
          case 116:
            this.pushState("text");
            return 65;
          case 117:
            return "TEXT";
          case 118:
            return "QUOTE";
          case 119:
            return 9;
          case 120:
            return 10;
          case 121:
            return 11;
        }
      }, "anonymous"),
      rules: [/^(?:accTitle\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*\{\s*)/, /^(?:[\}])/, /^(?:[^\}]*)/, /^(?:@\{)/, /^(?:["])/, /^(?:["])/, /^(?:[^\"]+)/, /^(?:[^}^"]+)/, /^(?:\})/, /^(?:call[\s]+)/, /^(?:\([\s]*\))/, /^(?:\()/, /^(?:[^(]*)/, /^(?:\))/, /^(?:[^)]*)/, /^(?:[^`"]+)/, /^(?:[`]["])/, /^(?:["][`])/, /^(?:[^"]+)/, /^(?:["])/, /^(?:["])/, /^(?:style\b)/, /^(?:default\b)/, /^(?:linkStyle\b)/, /^(?:interpolate\b)/, /^(?:classDef\b)/, /^(?:class\b)/, /^(?:href[\s])/, /^(?:click[\s]+)/, /^(?:[\s\n])/, /^(?:[^\s\n]*)/, /^(?:flowchart-elk\b)/, /^(?:swimlane-beta\b)/, /^(?:graph\b)/, /^(?:flowchart\b)/, /^(?:subgraph\b)/, /^(?:end\b\s*)/, /^(?:_self\b)/, /^(?:_blank\b)/, /^(?:_parent\b)/, /^(?:_top\b)/, /^(?:(\r?\n)*\s*\n)/, /^(?:\s*LR\b)/, /^(?:\s*RL\b)/, /^(?:\s*TB\b)/, /^(?:\s*BT\b)/, /^(?:\s*TD\b)/, /^(?:\s*BR\b)/, /^(?:\s*<)/, /^(?:\s*>)/, /^(?:\s*\^)/, /^(?:\s*v\b)/, /^(?:.*direction\s+TB[^\n]*)/, /^(?:.*direction\s+BT[^\n]*)/, /^(?:.*direction\s+RL[^\n]*)/, /^(?:.*direction\s+LR[^\n]*)/, /^(?:.*direction\s+TD[^\n]*)/, /^(?:[^\s\"]+@(?=[^\{\"]))/, /^(?:[0-9]+)/, /^(?:#)/, /^(?::::)/, /^(?::)/, /^(?:&)/, /^(?:;)/, /^(?:,)/, /^(?:\*)/, /^(?:\s*[xo<]?--+[-xo>]\s*)/, /^(?:\s*[xo<]?--\s*)/, /^(?:[^-]|-(?!-)+)/, /^(?:\s*[xo<]?==+[=xo>]\s*)/, /^(?:\s*[xo<]?==\s*)/, /^(?:[^=]|=(?!))/, /^(?:\s*[xo<]?-?\.+-[xo>]?\s*)/, /^(?:\s*[xo<]?-\.\s*)/, /^(?:[^\.]|\.(?!))/, /^(?:\s*~~[\~]+\s*)/, /^(?:[-/\)][\)])/, /^(?:[^\(\)\[\]\{\}]|!\)+)/, /^(?:\(-)/, /^(?:\]\))/, /^(?:\(\[)/, /^(?:\]\])/, /^(?:\[\[)/, /^(?:\[\|)/, /^(?:>)/, /^(?:\)\])/, /^(?:\[\()/, /^(?:\)\)\))/, /^(?:\(\(\()/, /^(?:[\\(?=\])][\]])/, /^(?:\/(?=\])\])/, /^(?:\/(?!\])|\\(?!\])|[^\\\[\]\(\)\{\}\/]+)/, /^(?:\[\/)/, /^(?:\[\\)/, /^(?:<)/, /^(?:>)/, /^(?:\^)/, /^(?:\\\|)/, /^(?:v\b)/, /^(?:\*)/, /^(?:#)/, /^(?:&)/, /^(?:([A-Za-z0-9!"\#$%&'*+\.`?\\_\/]|-(?=[^\>\-\.])|(?!))+)/, /^(?:-)/, /^(?:[\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6]|[\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377]|[\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5]|[\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA]|[\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE]|[\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA]|[\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0]|[\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977]|[\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2]|[\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A]|[\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39]|[\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8]|[\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C]|[\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C]|[\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99]|[\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0]|[\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D]|[\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3]|[\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10]|[\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1]|[\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81]|[\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3]|[\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6]|[\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A]|[\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081]|[\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D]|[\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0]|[\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310]|[\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C]|[\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711]|[\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7]|[\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C]|[\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16]|[\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF]|[\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC]|[\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D]|[\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D]|[\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3]|[\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F]|[\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128]|[\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184]|[\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3]|[\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6]|[\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE]|[\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C]|[\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D]|[\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC]|[\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B]|[\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788]|[\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805]|[\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB]|[\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28]|[\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5]|[\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4]|[\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E]|[\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D]|[\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36]|[\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D]|[\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC]|[\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF]|[\uFFD2-\uFFD7\uFFDA-\uFFDC])/, /^(?:\|)/, /^(?:\|)/, /^(?:\))/, /^(?:\()/, /^(?:\])/, /^(?:\[)/, /^(?:(\}))/, /^(?:\{)/, /^(?:[^\[\]\(\)\{\}\|\"]+)/, /^(?:")/, /^(?:(\r?\n)+)/, /^(?:\s)/, /^(?:$)/],
      conditions: {
        shapeDataEndBracket: {
          rules: [21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        shapeDataStr: {
          rules: [9, 10, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        shapeData: {
          rules: [8, 11, 12, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        callbackargs: {
          rules: [17, 18, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        callbackname: {
          rules: [14, 15, 16, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        href: {
          rules: [21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        click: {
          rules: [21, 24, 33, 34, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        dottedEdgeText: {
          rules: [21, 24, 76, 78, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        thickEdgeText: {
          rules: [21, 24, 73, 75, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        edgeText: {
          rules: [21, 24, 70, 72, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        trapText: {
          rules: [21, 24, 79, 82, 84, 86, 90, 92, 93, 94, 95, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        ellipseText: {
          rules: [21, 24, 79, 80, 81, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        text: {
          rules: [21, 24, 79, 82, 83, 84, 85, 86, 89, 90, 91, 92, 96, 97, 109, 110, 111, 112, 113, 114, 115, 116, 117],
          inclusive: false
        },
        vertex: {
          rules: [21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        dir: {
          rules: [21, 24, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        acc_descr_multiline: {
          rules: [5, 6, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        acc_descr: {
          rules: [3, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        acc_title: {
          rules: [1, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        md_string: {
          rules: [19, 20, 21, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        string: {
          rules: [21, 22, 23, 24, 79, 82, 84, 86, 90, 92, 96, 97, 110, 112, 114, 116],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 2, 4, 7, 13, 21, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 73, 74, 76, 77, 79, 82, 84, 86, 87, 88, 90, 92, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 110, 112, 114, 116, 118, 119, 120, 121],
          inclusive: true
        }
      }
    };
    return v411;
  }();
  v361.lexer = v410;
  function v459() {
    this.yy = {};
  }
  v4(v459, "Parser");
  v459.prototype = v361;
  v361.Parser = v459;
  return new v459();
}();
parser.parser = parser;
var flow_default = parser;
var newParser = Object.assign({}, flow_default);
newParser.parse = v460 => {
  const v461 = v460.replace(/}\s*\n/g, "}\n");
  return flow_default.parse(v461);
};
var flowParser_default = newParser;
var fade = v4((v462, v463) => {
  const v464 = v29;
  const v465 = v464(v462, "r");
  const v466 = v464(v462, "g");
  const v467 = v464(v462, "b");
  return v27(v465, v466, v467, v463);
}, "fade");
var getStyles = v4(v468 => ".label {\n    font-family: " + v468.fontFamily + ";\n    color: " + (v468.nodeTextColor || v468.textColor) + ";\n  }\n  .cluster-label text {\n    fill: " + v468.titleColor + ";\n  }\n  .cluster-label span {\n    color: " + v468.titleColor + ";\n  }\n  .cluster-label span p {\n    background-color: transparent;\n  }\n\n  .label text,span {\n    fill: " + (v468.nodeTextColor || v468.textColor) + ";\n    color: " + (v468.nodeTextColor || v468.textColor) + ";\n  }\n\n  .node rect,\n  .node circle,\n  .node ellipse,\n  .node polygon,\n  .node path {\n    fill: " + v468.mainBkg + ";\n    stroke: " + v468.nodeBorder + ";\n    stroke-width: " + (v468.strokeWidth ?? 1) + "px;\n  }\n  .rough-node .label text , .node .label text, .image-shape .label, .icon-shape .label {\n    text-anchor: middle;\n  }\n\n  .node .katex path {\n    fill: #000;\n    stroke: #000;\n    stroke-width: 1px;\n  }\n\n  .rough-node .label,.node .label, .image-shape .label, .icon-shape .label {\n    text-align: center;\n  }\n  .node.clickable {\n    cursor: pointer;\n  }\n\n\n  .root .anchor path {\n    fill: " + v468.lineColor + " !important;\n    stroke-width: 0;\n    stroke: " + v468.lineColor + ";\n  }\n\n  .arrowheadPath {\n    fill: " + v468.arrowheadColor + ";\n  }\n\n  .edgePath .path {\n    stroke: " + v468.lineColor + ";\n    stroke-width: " + (v468.strokeWidth ?? 2) + "px;\n  }\n\n  .flowchart-link {\n    stroke: " + v468.lineColor + ";\n    fill: none;\n  }\n\n  .edgeLabel {\n    background-color: " + v468.edgeLabelBackground + ";\n    p {\n      background-color: " + v468.edgeLabelBackground + ";\n    }\n    rect {\n      opacity: 0.5;\n      background-color: " + v468.edgeLabelBackground + ";\n      fill: " + v468.edgeLabelBackground + ";\n    }\n    text-align: center;\n  }\n\n  /* For html labels only */\n  .labelBkg {\n    background-color: " + fade(v468.edgeLabelBackground, 0.5) + ";\n    // background-color:\n  }\n\n  .cluster rect {\n    fill: " + v468.clusterBkg + ";\n    stroke: " + v468.clusterBorder + ";\n    stroke-width: 1px;\n  }\n\n  .cluster text {\n    fill: " + v468.titleColor + ";\n  }\n\n  .cluster span {\n    color: " + v468.titleColor + ";\n  }\n  /* .cluster div {\n    color: " + v468.titleColor + ";\n  } */\n\n  div.mermaidTooltip {\n    position: absolute;\n    text-align: center;\n    max-width: 200px;\n    padding: 2px;\n    font-family: " + v468.fontFamily + ";\n    font-size: 12px;\n    background: " + v468.tertiaryColor + ";\n    border: 1px solid " + v468.border2 + ";\n    border-radius: 2px;\n    pointer-events: none;\n    z-index: 100;\n  }\n\n  .flowchartTitleText {\n    text-anchor: middle;\n    font-size: 18px;\n    fill: " + v468.textColor + ";\n  }\n\n  rect.text {\n    fill: none;\n    stroke-width: 0;\n  }\n\n  .icon-shape, .image-shape {\n    background-color: " + v468.edgeLabelBackground + ";\n    p {\n      background-color: " + v468.edgeLabelBackground + ";\n      padding: 2px;\n    }\n    .label rect {\n      opacity: 0.5;\n      background-color: " + v468.edgeLabelBackground + ";\n      fill: " + v468.edgeLabelBackground + ";\n    }\n    text-align: center;\n  }\n  " + v1() + "\n", "getStyles");
var styles_default = getStyles;
var createFlowDiagram = v4(({
  defaultLayout: v469,
  styles = styles_default
} = {}) => ({
  parser: flowParser_default,
  get db() {
    return new FlowDB();
  },
  renderer: flowRenderer_v3_unified_default,
  styles: styles,
  init: v4(v470 => {
    if (!v470.flowchart) {
      v470.flowchart = {};
    }
    const v471 = v5().layout ?? v469 ?? v470.layout;
    if (v471) {
      v6({
        layout: v471
      });
    }
    v470.flowchart.arrowMarkerAbsolute = v470.arrowMarkerAbsolute;
    v6({
      flowchart: {
        arrowMarkerAbsolute: v470.arrowMarkerAbsolute
      }
    });
  }, "init")
}), "createFlowDiagram");
var diagram = createFlowDiagram();
const flowDiagramUKHOOZJN = Object.freeze(Object.defineProperty({
  "__proto__": null,
  createFlowDiagram: createFlowDiagram,
  diagram: diagram
}, Symbol.toStringTag, {
  value: "Module"
}));
export { createFlowDiagram as c, flowDiagramUKHOOZJN as f, styles_default as s };