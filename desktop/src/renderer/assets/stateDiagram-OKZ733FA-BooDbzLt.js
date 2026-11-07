import { s as v1, a as v2, S as v3 } from "./chunk-5RXB4S5H-CkzgmE21.js";
import { _ as v4, c as v5, d as v6, l as v7, e as v8, k as v9, P as v10, Q as v11, L as v12, x as v13 } from "./index-CXb3UsfP.js";
import { G as v14 } from "./graph-BMLV0goG.js";
import { l as v15 } from "./layout-BNmRhaUB.js";
import "./chunk-XXDRQBXY-CzLCVi_O.js";
import "./chunk-KBJHAD2P-BXgOlElY.js";
import "./chunk-2GRJ4B5K-DGslyOWI.js";
import "./map-BEO0Bu8q.js";
var drawStartState = v4(v16 => v16.append("circle").attr("class", "start-state").attr("r", v5().state.sizeUnit).attr("cx", v5().state.padding + v5().state.sizeUnit).attr("cy", v5().state.padding + v5().state.sizeUnit), "drawStartState");
var drawDivider = v4(v17 => v17.append("line").style("stroke", "grey").style("stroke-dasharray", "3").attr("x1", v5().state.textHeight).attr("class", "divider").attr("x2", v5().state.textHeight * 2).attr("y1", 0).attr("y2", 0), "drawDivider");
var drawSimpleState = v4((v18, v19) => {
  const v20 = v18.append("text").attr("x", v5().state.padding * 2).attr("y", v5().state.textHeight + v5().state.padding * 2).attr("font-size", v5().state.fontSize).attr("class", "state-title").text(v19.id);
  const v21 = v20.node().getBBox();
  v18.insert("rect", ":first-child").attr("x", v5().state.padding).attr("y", v5().state.padding).attr("width", v21.width + v5().state.padding * 2).attr("height", v21.height + v5().state.padding * 2).attr("rx", v5().state.radius);
  return v20;
}, "drawSimpleState");
var drawDescrState = v4((v22, v23) => {
  const v24 = v4(function (v25, v26, v27) {
    const v28 = v25.append("tspan").attr("x", v5().state.padding * 2).text(v26);
    if (!v27) {
      v28.attr("dy", v5().state.textHeight);
    }
  }, "addTspan");
  const v29 = v22.append("text").attr("x", v5().state.padding * 2).attr("y", v5().state.textHeight + v5().state.padding * 1.3).attr("font-size", v5().state.fontSize).attr("class", "state-title").text(v23.descriptions[0]);
  const v30 = v29.node().getBBox();
  const v31 = v30.height;
  const v32 = v22.append("text").attr("x", v5().state.padding).attr("y", v31 + v5().state.padding * 0.4 + v5().state.dividerMargin + v5().state.textHeight).attr("class", "state-description");
  let v33 = true;
  let v34 = true;
  v23.descriptions.forEach(function (v35) {
    if (!v33) {
      v24(v32, v35, v34);
      v34 = false;
    }
    v33 = false;
  });
  const v36 = v22.append("line").attr("x1", v5().state.padding).attr("y1", v5().state.padding + v31 + v5().state.dividerMargin / 2).attr("y2", v5().state.padding + v31 + v5().state.dividerMargin / 2).attr("class", "descr-divider");
  const v37 = v32.node().getBBox();
  const v38 = Math.max(v37.width, v30.width);
  v36.attr("x2", v38 + v5().state.padding * 3);
  v22.insert("rect", ":first-child").attr("x", v5().state.padding).attr("y", v5().state.padding).attr("width", v38 + v5().state.padding * 2).attr("height", v37.height + v31 + v5().state.padding * 2).attr("rx", v5().state.radius);
  return v22;
}, "drawDescrState");
var addTitleAndBox = v4((v39, v40, v41) => {
  const v42 = v5().state.padding;
  const v43 = v5().state.padding * 2;
  const v44 = v39.node().getBBox();
  const v45 = v44.width;
  const v46 = v44.x;
  const v47 = v39.append("text").attr("x", 0).attr("y", v5().state.titleShift).attr("font-size", v5().state.fontSize).attr("class", "state-title").text(v40.id);
  const v48 = v47.node().getBBox();
  const v49 = v48.width + v43;
  let v50 = Math.max(v49, v45);
  if (v50 === v45) {
    v50 = v50 + v43;
  }
  let v51;
  const v52 = v39.node().getBBox();
  if (v40.doc) ;
  v51 = v46 - v42;
  if (v49 > v45) {
    v51 = (v45 - v50) / 2 + v42;
  }
  if (Math.abs(v46 - v52.x) < v42 && v49 > v45) {
    v51 = v46 - (v49 - v45) / 2;
  }
  const v53 = 1 - v5().state.textHeight;
  v39.insert("rect", ":first-child").attr("x", v51).attr("y", v53).attr("class", v41 ? "alt-composit" : "composit").attr("width", v50).attr("height", v52.height + v5().state.textHeight + v5().state.titleShift + 1).attr("rx", "0");
  v47.attr("x", v51 + v42);
  if (v49 <= v45) {
    v47.attr("x", v46 + (v50 - v43) / 2 - v49 / 2 + v42);
  }
  v39.insert("rect", ":first-child").attr("x", v51).attr("y", v5().state.titleShift - v5().state.textHeight - v5().state.padding).attr("width", v50).attr("height", v5().state.textHeight * 3).attr("rx", v5().state.radius);
  v39.insert("rect", ":first-child").attr("x", v51).attr("y", v5().state.titleShift - v5().state.textHeight - v5().state.padding).attr("width", v50).attr("height", v52.height + 3 + v5().state.textHeight * 2).attr("rx", v5().state.radius);
  return v39;
}, "addTitleAndBox");
var drawEndState = v4(v54 => {
  v54.append("circle").attr("class", "end-state-outer").attr("r", v5().state.sizeUnit + v5().state.miniPadding).attr("cx", v5().state.padding + v5().state.sizeUnit + v5().state.miniPadding).attr("cy", v5().state.padding + v5().state.sizeUnit + v5().state.miniPadding);
  return v54.append("circle").attr("class", "end-state-inner").attr("r", v5().state.sizeUnit).attr("cx", v5().state.padding + v5().state.sizeUnit + 2).attr("cy", v5().state.padding + v5().state.sizeUnit + 2);
}, "drawEndState");
var drawForkJoinState = v4((v55, v56) => {
  let v57 = v5().state.forkWidth;
  let v58 = v5().state.forkHeight;
  if (v56.parentId) {
    let v59 = v57;
    v57 = v58;
    v58 = v59;
  }
  return v55.append("rect").style("stroke", "black").style("fill", "black").attr("width", v57).attr("height", v58).attr("x", v5().state.padding).attr("y", v5().state.padding);
}, "drawForkJoinState");
var _drawLongText = v4((v60, v61, v62, v63) => {
  let v64 = 0;
  const v65 = v63.append("text");
  v65.style("text-anchor", "start");
  v65.attr("class", "noteText");
  let v66 = v60.replace(/\r\n/g, "<br/>");
  v66 = v66.replace(/\n/g, "<br/>");
  const v67 = v66.split(v9.lineBreakRegex);
  let v68 = v5().state.noteMargin * 1.25;
  for (const v69 of v67) {
    const v70 = v69.trim();
    if (v70.length > 0) {
      const v71 = v65.append("tspan");
      v71.text(v70);
      if (v68 === 0) {
        const v72 = v71.node().getBBox();
        v68 += v72.height;
      }
      v64 += v68;
      v71.attr("x", v61 + v5().state.noteMargin);
      v71.attr("y", v62 + v64 + v5().state.noteMargin * 1.25);
    }
  }
  return {
    textWidth: v65.node().getBBox().width,
    textHeight: v64
  };
}, "_drawLongText");
var drawNote = v4((v73, v74) => {
  v74.attr("class", "state-note");
  const v75 = v74.append("rect").attr("x", 0).attr("y", v5().state.padding);
  const v76 = v74.append("g");
  const {
    textWidth: v77,
    textHeight: v78
  } = _drawLongText(v73, 0, 0, v76);
  v75.attr("height", v78 + v5().state.noteMargin * 2);
  v75.attr("width", v77 + v5().state.noteMargin * 2);
  return v75;
}, "drawNote");
var drawState = v4(function (v79, v80) {
  const v81 = v80.id;
  const v82 = {
    id: v81,
    label: v80.id,
    width: 0,
    height: 0
  };
  const v83 = v79.append("g").attr("id", v81).attr("class", "stateGroup");
  if (v80.type === "start") {
    drawStartState(v83);
  }
  if (v80.type === "end") {
    drawEndState(v83);
  }
  if (v80.type === "fork" || v80.type === "join") {
    drawForkJoinState(v83, v80);
  }
  if (v80.type === "note") {
    drawNote(v80.note.text, v83);
  }
  if (v80.type === "divider") {
    drawDivider(v83);
  }
  if (v80.type === "default" && v80.descriptions.length === 0) {
    drawSimpleState(v83, v80);
  }
  if (v80.type === "default" && v80.descriptions.length > 0) {
    drawDescrState(v83, v80);
  }
  const v84 = v83.node().getBBox();
  v82.width = v84.width + v5().state.padding * 2;
  v82.height = v84.height + v5().state.padding * 2;
  return v82;
}, "drawState");
var edgeCount = 0;
var drawEdge = v4(function (v85, v86, v87) {
  const v88 = v4(function (v89) {
    switch (v89) {
      case v3.relationType.AGGREGATION:
        return "aggregation";
      case v3.relationType.EXTENSION:
        return "extension";
      case v3.relationType.COMPOSITION:
        return "composition";
      case v3.relationType.DEPENDENCY:
        return "dependency";
    }
  }, "getRelationType");
  v86.points = v86.points.filter(v90 => !Number.isNaN(v90.y));
  const v91 = v86.points;
  const v92 = v10().x(function (v93) {
    return v93.x;
  }).y(function (v94) {
    return v94.y;
  }).curve(v11);
  const v95 = v85.append("path").attr("d", v92(v91)).attr("id", "edge" + edgeCount).attr("class", "transition");
  let v96 = "";
  if (v5().state.arrowMarkerAbsolute) {
    v96 = v12(true);
  }
  v95.attr("marker-end", "url(" + v96 + "#" + v88(v3.relationType.DEPENDENCY) + "End)");
  if (v87.title !== undefined) {
    const v97 = v85.append("g").attr("class", "stateLabel");
    const {
      x: v98,
      y: v99
    } = v13.calcLabelPosition(v86.points);
    const v100 = v9.getRows(v87.title);
    let v101 = 0;
    const v102 = [];
    let v103 = 0;
    let v104 = 0;
    for (let v105 = 0; v105 <= v100.length; v105++) {
      const v106 = v97.append("text").attr("text-anchor", "middle").text(v100[v105]).attr("x", v98).attr("y", v99 + v101);
      const v107 = v106.node().getBBox();
      v103 = Math.max(v103, v107.width);
      v104 = Math.min(v104, v107.x);
      v7.info(v107.x, v98, v99 + v101);
      if (v101 === 0) {
        const v108 = v106.node().getBBox();
        v101 = v108.height;
        v7.info("Title height", v101, v99);
      }
      v102.push(v106);
    }
    let v109 = v101 * v100.length;
    if (v100.length > 1) {
      const v110 = (v100.length - 1) * v101 * 0.5;
      v102.forEach((v111, v112) => v111.attr("y", v99 + v112 * v101 - v110));
      v109 = v101 * v100.length;
    }
    const v113 = v97.node().getBBox();
    v97.insert("rect", ":first-child").attr("class", "box").attr("x", v98 - v103 / 2 - v5().state.padding / 2).attr("y", v99 - v109 / 2 - v5().state.padding / 2 - 3.5).attr("width", v103 + v5().state.padding).attr("height", v109 + v5().state.padding);
    v7.info(v113);
  }
  edgeCount++;
}, "drawEdge");
var conf;
var transformationLog = {};
var setConf = v4(function () {}, "setConf");
var insertMarkers = v4(function (v114) {
  v114.append("defs").append("marker").attr("id", "dependencyEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
}, "insertMarkers");
var draw = v4(function (v115, v116, v117, v118) {
  conf = v5().state;
  const v119 = v5().securityLevel;
  let v120;
  if (v119 === "sandbox") {
    v120 = v6("#i" + v116);
  }
  const v121 = v119 === "sandbox" ? v6(v120.nodes()[0].contentDocument.body) : v6("body");
  const v122 = v119 === "sandbox" ? v120.nodes()[0].contentDocument : document;
  v7.debug("Rendering diagram " + v115);
  const v123 = v121.select("[id='" + v116 + "']");
  insertMarkers(v123);
  const v124 = v118.db.getRootDoc();
  const v125 = v123.append("g").attr("id", v116 + "-root");
  renderDoc(v124, v125, undefined, false, v121, v122, v118);
  const v126 = conf.padding;
  const v127 = v123.node().getBBox();
  const v128 = v127.width + v126 * 2;
  const v129 = v127.height + v126 * 2;
  const v130 = v128 * 1.75;
  v8(v123, v129, v130, conf.useMaxWidth);
  v123.attr("viewBox", v127.x - conf.padding + "  " + (v127.y - conf.padding) + " " + v128 + " " + v129);
}, "draw");
var getLabelWidth = v4(v131 => {
  if (v131) {
    return v131.length * conf.fontSizeFactor;
  } else {
    return 1;
  }
}, "getLabelWidth");
var renderDoc = v4((v132, v133, v134, v135, v136, v137, v138) => {
  const v139 = new v14({
    compound: true,
    multigraph: true
  });
  let v140;
  let v141 = true;
  for (v140 = 0; v140 < v132.length; v140++) {
    if (v132[v140].stmt === "relation") {
      v141 = false;
      break;
    }
  }
  if (v134) {
    v139.setGraph({
      rankdir: "LR",
      multigraph: true,
      compound: true,
      ranker: "tight-tree",
      ranksep: v141 ? 1 : conf.edgeLengthFactor,
      nodeSep: v141 ? 1 : 50,
      isMultiGraph: true
    });
  } else {
    v139.setGraph({
      rankdir: "TB",
      multigraph: true,
      compound: true,
      ranksep: v141 ? 1 : conf.edgeLengthFactor,
      nodeSep: v141 ? 1 : 50,
      ranker: "tight-tree",
      isMultiGraph: true
    });
  }
  v139.setDefaultEdgeLabel(function () {
    return {};
  });
  const v142 = v138.db.getStates();
  const v143 = v138.db.getRelations();
  const v144 = Object.keys(v142);
  for (const v145 of v144) {
    const v146 = v142[v145];
    if (v134) {
      v146.parentId = v134;
    }
    let v147;
    if (v146.doc) {
      let v148 = v133.append("g").attr("id", v146.id).attr("class", "stateGroup");
      v147 = renderDoc(v146.doc, v148, v146.id, !v135, v136, v137, v138);
      {
        v148 = addTitleAndBox(v148, v146, v135);
        let v149 = v148.node().getBBox();
        v147.width = v149.width;
        v147.height = v149.height + conf.padding / 2;
        transformationLog[v146.id] = {
          y: conf.compositTitleSize
        };
      }
    } else {
      v147 = drawState(v133, v146, v139);
    }
    if (v146.note) {
      const v150 = {
        descriptions: [],
        id: v146.id + "-note",
        note: v146.note,
        type: "note"
      };
      const v151 = drawState(v133, v150, v139);
      if (v146.note.position === "left of") {
        v139.setNode(v147.id + "-note", v151);
        v139.setNode(v147.id, v147);
      } else {
        v139.setNode(v147.id, v147);
        v139.setNode(v147.id + "-note", v151);
      }
      v139.setParent(v147.id, v147.id + "-group");
      v139.setParent(v147.id + "-note", v147.id + "-group");
    } else {
      v139.setNode(v147.id, v147);
    }
  }
  v7.debug("Count=", v139.nodeCount(), v139);
  let v152 = 0;
  v143.forEach(function (v153) {
    v152++;
    v7.debug("Setting edge", v153);
    v139.setEdge(v153.id1, v153.id2, {
      relation: v153,
      width: getLabelWidth(v153.title),
      height: conf.labelHeight * v9.getRows(v153.title).length,
      labelpos: "c"
    }, "id" + v152);
  });
  v15(v139);
  v7.debug("Graph after layout", v139.nodes());
  const v154 = v133.node();
  v139.nodes().forEach(function (v155) {
    if (v155 !== undefined && v139.node(v155) !== undefined) {
      v7.warn("Node " + v155 + ": " + JSON.stringify(v139.node(v155)));
      v136.select("#" + v154.id + " #" + v155).attr("transform", "translate(" + (v139.node(v155).x - v139.node(v155).width / 2) + "," + (v139.node(v155).y + (transformationLog[v155] ? transformationLog[v155].y : 0) - v139.node(v155).height / 2) + " )");
      v136.select("#" + v154.id + " #" + v155).attr("data-x-shift", v139.node(v155).x - v139.node(v155).width / 2);
      const v156 = v137.querySelectorAll("#" + v154.id + " #" + v155 + " .divider");
      v156.forEach(v157 => {
        const v158 = v157.parentElement;
        let v159 = 0;
        let v160 = 0;
        if (v158) {
          if (v158.parentElement) {
            v159 = v158.parentElement.getBBox().width;
          }
          v160 = parseInt(v158.getAttribute("data-x-shift"), 10);
          if (Number.isNaN(v160)) {
            v160 = 0;
          }
        }
        v157.setAttribute("x1", 0 - v160 + 8);
        v157.setAttribute("x2", v159 - v160 - 8);
      });
    } else {
      v7.debug("No Node " + v155 + ": " + JSON.stringify(v139.node(v155)));
    }
  });
  let v161 = v154.getBBox();
  v139.edges().forEach(function (v162) {
    if (v162 !== undefined && v139.edge(v162) !== undefined) {
      v7.debug("Edge " + v162.v + " -> " + v162.w + ": " + JSON.stringify(v139.edge(v162)));
      drawEdge(v133, v139.edge(v162), v139.edge(v162).relation);
    }
  });
  v161 = v154.getBBox();
  const v163 = {
    id: v134 ? v134 : "root",
    label: v134 ? v134 : "root",
    width: 0,
    height: 0
  };
  v163.width = v161.width + conf.padding * 2;
  v163.height = v161.height + conf.padding * 2;
  v7.debug("Doc rendered", v163, v139);
  return v163;
}, "renderDoc");
var stateRenderer_default = {
  setConf: setConf,
  draw: draw
};
var diagram = {
  parser: v2,
  get db() {
    return new v3(1);
  },
  renderer: stateRenderer_default,
  styles: v1,
  init: v4(v164 => {
    if (!v164.state) {
      v164.state = {};
    }
    v164.state.arrowMarkerAbsolute = v164.arrowMarkerAbsolute;
  }, "init")
};
export { diagram };