import { c as v1, w as v2, a as v3, f as v4, b as v5, s as v6 } from "./chunk-RYQCIY6F-66OruSPP.js";
import { _ as v7, am as v8, an as v9, ao as v10, ap as v11, l as v12, c as v13, aq as v14, ar as v15, ae as v16, as as v17, af as v18, ad as v19, at as v20, au as v21, av as v22 } from "./index-CXb3UsfP.js";
import { G as v23 } from "./graph-BMLV0goG.js";
import { l as v24 } from "./layout-BNmRhaUB.js";
import "./map-BEO0Bu8q.js";
var clamp = v7((v25, v26, v27) => Math.max(v26, Math.min(v27, v25)), "clamp");
var getDefaultSelfLoopSide = v7((v28 = "TB") => {
  switch (v28) {
    case "BT":
      return "bottom";
    case "LR":
      return "right";
    case "RL":
      return "left";
    case "TB":
    default:
      return "top";
  }
}, "getDefaultSelfLoopSide");
var shouldMergeSelfLoopSegments = v7(v29 => v29 === "flowchart" || v29 === "flowchart-v2" || v29 === "stateDiagram", "shouldMergeSelfLoopSegments");
var getSelfLoopSide = v7((v30, v31, v32, v33, v34) => {
  const v35 = [];
  const v36 = new Set();
  v32.forEach(({
    start: v37,
    end: v38
  }) => {
    if (v37 !== v33) {
      v36.add(v37);
    }
    if (v38 !== v33) {
      v36.add(v38);
    }
  });
  v36.forEach(v39 => {
    const v40 = v30.node(v39);
    if (typeof v40?.x === "number" && typeof v40?.y === "number") {
      v35.push(v40);
    }
  });
  if (v35.length === 0) {
    v32.forEach(({
      edge: v41
    }) => {
      (v41.points ?? []).forEach(v42 => {
        if (typeof v42?.x === "number" && typeof v42?.y === "number") {
          v35.push(v42);
        }
      });
    });
  }
  if (v35.length === 0) {
    return getDefaultSelfLoopSide(v34);
  }
  const v43 = v35.reduce((v44, v45) => ({
    x: v44.x + v45.x / v35.length,
    y: v44.y + v45.y / v35.length
  }), {
    x: 0,
    y: 0
  });
  const v46 = v43.x - v31.x;
  const v47 = v43.y - v31.y;
  if (Math.abs(v46) > Math.abs(v47)) {
    if (v46 > 0) {
      return "right";
    } else {
      return "left";
    }
  }
  if (Math.abs(v47) > 0) {
    if (v47 > 0) {
      return "bottom";
    } else {
      return "top";
    }
  }
  return getDefaultSelfLoopSide(v34);
}, "getSelfLoopSide");
var getSelfLoopPoints = v7((v48, v49 = "top", v50 = 0, v51 = 0) => {
  const v52 = v48.x;
  const v53 = v48.y - v50;
  const v54 = v48.width / 2;
  const v55 = v48.height / 2;
  const v56 = Math.max(36, Math.min(100, v48.width * 0.8));
  const v57 = clamp(Math.max(v51, v48.width * 0.35), 36, v56);
  const v58 = clamp(Math.min(v48.width, v48.height) * 0.45, 24, 48);
  switch (v49) {
    case "bottom":
      {
        const v59 = v53 + v55;
        return [{
          x: v52 - v57 / 2,
          y: v59
        }, {
          x: v52 - v57 / 2,
          y: v59 + v58
        }, {
          x: v52 + v57 / 2,
          y: v59 + v58
        }, {
          x: v52 + v57 / 2,
          y: v59
        }];
      }
    case "right":
      {
        const v60 = v52 + v54;
        return [{
          x: v60,
          y: v53 - v57 / 2
        }, {
          x: v60 + v58,
          y: v53 - v57 / 2
        }, {
          x: v60 + v58,
          y: v53 + v57 / 2
        }, {
          x: v60,
          y: v53 + v57 / 2
        }];
      }
    case "left":
      {
        const v61 = v52 - v54;
        return [{
          x: v61,
          y: v53 - v57 / 2
        }, {
          x: v61 - v58,
          y: v53 - v57 / 2
        }, {
          x: v61 - v58,
          y: v53 + v57 / 2
        }, {
          x: v61,
          y: v53 + v57 / 2
        }];
      }
    case "top":
    default:
      {
        const v62 = v53 - v55;
        return [{
          x: v52 - v57 / 2,
          y: v62
        }, {
          x: v52 - v57 / 2,
          y: v62 - v58
        }, {
          x: v52 + v57 / 2,
          y: v62 - v58
        }, {
          x: v52 + v57 / 2,
          y: v62
        }];
      }
  }
}, "getSelfLoopPoints");
var getSelfLoopLabelPosition = v7((v63, v64, v65 = "top", v66 = 0, v67 = {}) => {
  const v68 = 4;
  const v69 = v63.x;
  const v70 = v63.y - v66;
  const v71 = v67.width ?? 0;
  const v72 = v67.height ?? 0;
  switch (v65) {
    case "bottom":
      return {
        x: v69,
        y: Math.max(...v64.map(v73 => v73.y)) + v72 / 2 + v68
      };
    case "right":
      return {
        x: Math.max(...v64.map(v74 => v74.x)) + v71 / 2 + v68,
        y: v70
      };
    case "left":
      return {
        x: Math.min(...v64.map(v75 => v75.x)) - v71 / 2 - v68,
        y: v70
      };
    case "top":
    default:
      return {
        x: v69,
        y: Math.min(...v64.map(v76 => v76.y)) - v72 / 2 - v68
      };
  }
}, "getSelfLoopLabelPosition");
var getEdgesToRender = v7((v77, v78 = 0, {
  mergeSelfLoops = true
} = {}) => {
  const v79 = new Map();
  const v80 = [];
  const v81 = v77.graph()?.rankdir;
  v77.edges().forEach(v82 => {
    const v83 = v77.edge(v82);
    if (mergeSelfLoops && v83.selfLoop) {
      const v84 = v83.selfLoop.id;
      if (!v79.has(v84)) {
        v79.set(v84, []);
      }
      v79.get(v84).push({
        edge: v83,
        start: v82.v,
        end: v82.w
      });
    } else {
      v80.push({
        edge: v83,
        start: v82.v,
        end: v82.w
      });
    }
  });
  v79.forEach(v85 => {
    if (v85.length !== 3) {
      v85.forEach(v86 => v80.push(v86));
      return;
    }
    v85.sort((v87, v88) => v87.edge.selfLoop.order - v88.edge.selfLoop.order);
    const [v89, v90, v91] = v85;
    const v92 = v89.edge.originalEdge ?? v90.edge.originalEdge ?? v91.edge.originalEdge ?? v90.edge;
    const v93 = v77.node(v92.start);
    if (!v93) {
      v85.forEach(v94 => v80.push(v94));
      return;
    }
    const v95 = {
      width: v90.edge.width,
      height: v90.edge.height
    };
    const v96 = getSelfLoopSide(v77, v93, v85, v92.start, v81);
    const v97 = getSelfLoopPoints(v93, v96, v78, v95.width ?? 0);
    const v98 = getSelfLoopLabelPosition(v93, v97, v96, v78, v95);
    const v99 = {
      ...v90.edge,
      ...v92,
      id: v92.id,
      points: v97,
      start: v92.start,
      end: v92.end,
      x: v98.x,
      y: v98.y,
      width: v95.width,
      height: v95.height,
      labelStyle: v90.edge.labelStyle,
      fromCluster: v89.edge.fromCluster ?? v90.edge.fromCluster ?? v91.edge.fromCluster,
      toCluster: v89.edge.toCluster ?? v90.edge.toCluster ?? v91.edge.toCluster
    };
    delete v99.selfLoop;
    delete v99.originalEdge;
    v80.push({
      edge: v99,
      start: v99.start,
      end: v99.end
    });
  });
  return v80;
}, "getEdgesToRender");
var recursiveRender = v7(async (v100, v101, v102, v103, v104, v105) => {
  v12.warn("Graph in recursive render:XAX", v2(v101), v104);
  const v106 = v101.graph().rankdir;
  v12.trace("Dir in recursive render - dir:", v106);
  const v107 = v100.insert("g").attr("class", "root");
  if (!v101.nodes()) {
    v12.info("No nodes found for", v101);
  } else {
    v12.info("Recursive render XXX", v101.nodes());
  }
  if (v101.edges().length > 0) {
    v12.info("Recursive edges", v101.edge(v101.edges()[0]));
  }
  const v108 = v107.insert("g").attr("class", "clusters");
  const v109 = v107.insert("g").attr("class", "edgePaths");
  const v110 = v107.insert("g").attr("class", "edgeLabels");
  const v111 = v107.insert("g").attr("class", "nodes");
  const v112 = shouldMergeSelfLoopSegments(v102);
  await Promise.all(v101.nodes().map(async function (v113) {
    const v114 = v101.node(v113);
    if (v104 !== undefined) {
      const v115 = JSON.parse(JSON.stringify(v104.clusterData));
      v12.trace("Setting data for parent cluster XXX\n Node.id = ", v113, "\n data=", v115.height, "\nParent cluster", v104.height);
      v101.setNode(v104.id, v115);
      if (!v101.parent(v113)) {
        v12.trace("Setting parent", v113, v104.id);
        v101.setParent(v113, v104.id, v115);
      }
    }
    v12.info("(Insert) Node XXX" + v113 + ": " + JSON.stringify(v101.node(v113)));
    if (v114?.clusterNode) {
      v12.info("Cluster identified XBX", v113, v114.width, v101.node(v113));
      const {
        ranksep: v116,
        nodesep: v117
      } = v101.graph();
      v114.graph.setGraph({
        ...v114.graph.graph(),
        ranksep: v116 + 25,
        nodesep: v117
      });
      const v118 = await recursiveRender(v111, v114.graph, v102, v103, v101.node(v113), v105);
      const v119 = v118.elem;
      v14(v114, v119);
      v114.diff = v118.diff || 0;
      v12.info("New compound node after recursive render XAX", v113, "width", v114.width, "height", v114.height);
      v15(v119, v114);
    } else if (v101.children(v113).length > 0) {
      v12.trace("Cluster - the non recursive path XBX", v113, v114.id, v114, v114.width, "Graph:", v101);
      v12.trace(v4(v114.id, v101));
      v5.set(v114.id, {
        id: v4(v114.id, v101),
        node: v114
      });
    } else {
      v12.trace("Node - the non recursive path XAX", v113, v111, v101.node(v113), v106);
      await v16(v111, v101.node(v113), {
        config: v105,
        dir: v106
      });
    }
  }));
  const v120 = v7(async () => {
    const v121 = v101.edges().map(async function (v122) {
      const v123 = v101.edge(v122.v, v122.w, v122.name);
      v12.info("Edge " + v122.v + " -> " + v122.w + ": " + JSON.stringify(v122));
      v12.info("Edge " + v122.v + " -> " + v122.w + ": ", v122, " ", JSON.stringify(v101.edge(v122)));
      v12.info("Fix", v5, "ids:", v122.v, v122.w, "Translating: ", v5.get(v122.v), v5.get(v122.w));
      if (v112 && v123.selfLoop) {
        if (v123.selfLoop.order !== 1) {
          return;
        }
        const v124 = v123.id;
        v123.id = v123.selfLoop.id;
        await v22(v110, v123);
        v123.id = v124;
        return;
      }
      await v22(v110, v123);
    });
    await Promise.all(v121);
  }, "processEdges");
  await v120();
  v12.info("Graph before layout:", JSON.stringify(v2(v101)));
  v12.info("############################################# XXX");
  v12.info("###                Layout                 ### XXX");
  v12.info("############################################# XXX");
  v24(v101);
  v12.info("Graph after layout:", JSON.stringify(v2(v101)));
  let v125 = 0;
  let {
    subGraphTitleTotalMargin: v126
  } = v17(v105);
  await Promise.all(v6(v101).map(async function (v127) {
    const v128 = v101.node(v127);
    v12.info("Position XBX => " + v127 + ": (" + v128.x, "," + v128.y, ") width: ", v128.width, " height: ", v128.height);
    if (v128?.clusterNode) {
      v128.y += v126;
      v12.info("A tainted cluster node XBX1", v127, v128.id, v128.width, v128.height, v128.x, v128.y, v101.parent(v127));
      v5.get(v128.id).node = v128;
      v18(v128);
    } else if (v101.children(v127).length > 0) {
      v12.info("A pure cluster node XBX1", v127, v128.id, v128.x, v128.y, v128.width, v128.height, v101.parent(v127));
      v128.height += v126;
      v101.node(v128.parentId);
      const v129 = v128?.padding / 2 || 0;
      const v130 = v128?.labelBBox?.height || 0;
      const v131 = v130 - v129 || 0;
      v12.debug("OffsetY", v131, "labelHeight", v130, "halfPadding", v129);
      await v19(v108, v128);
      v5.get(v128.id).node = v128;
    } else {
      const v132 = v101.node(v128.parentId);
      v128.y += v126 / 2;
      v12.info("A regular node XBX1 - using the padding", v128.id, "parent", v128.parentId, v128.width, v128.height, v128.x, v128.y, "offsetY", v128.offsetY, "parent", v132, v132?.offsetY, v128);
      v18(v128);
    }
  }));
  const v133 = v126 / 2;
  const v134 = getEdgesToRender(v101, v133, {
    mergeSelfLoops: v112
  });
  v134.forEach(function ({
    edge: v135,
    start: v136,
    end: v137
  }) {
    v12.info("Edge " + v136 + " -> " + v137 + ": " + JSON.stringify(v135), v135);
    v135.points.forEach(v138 => v138.y += v133);
    const v139 = v101.node(v136);
    const v140 = v101.node(v137);
    const v141 = v20(v109, v135, v5, v102, v139, v140, v103);
    v21(v135, v141);
  });
  v101.nodes().forEach(function (v142) {
    const v143 = v101.node(v142);
    v12.info(v142, v143.type, v143.diff);
    if (v143.isGroup) {
      v125 = v143.diff;
    }
  });
  v12.warn("Returning from recursive render XAX", v107, v125);
  return {
    elem: v107,
    diff: v125
  };
}, "recursiveRender");
var render = v7(async (v144, v145) => {
  const v146 = new v23({
    multigraph: true,
    compound: true
  }).setGraph({
    rankdir: v144.direction,
    nodesep: v144.config?.nodeSpacing || v144.config?.flowchart?.nodeSpacing || v144.nodeSpacing,
    ranksep: v144.config?.rankSpacing || v144.config?.flowchart?.rankSpacing || v144.rankSpacing,
    marginx: 8,
    marginy: 8
  }).setDefaultEdgeLabel(function () {
    return {};
  });
  const v147 = v145.select("g");
  v8(v147, v144.markers, v144.type, v144.diagramId);
  v9();
  v10();
  v11();
  v1();
  v144.nodes.forEach(v148 => {
    v146.setNode(v148.id, {
      ...v148
    });
    if (v148.parentId) {
      v146.setParent(v148.id, v148.parentId);
    }
  });
  v12.debug("Edges:", v144.edges);
  v144.edges.forEach(v149 => {
    if (v149.start === v149.end) {
      const v150 = v149.start;
      const v151 = v150 + "---" + v150 + "---1";
      const v152 = v150 + "---" + v150 + "---2";
      const v153 = v146.node(v150);
      v146.setNode(v151, {
        domId: v151,
        id: v151,
        parentId: v153.parentId,
        labelStyle: "",
        label: "",
        padding: 0,
        shape: "labelRect",
        style: "",
        width: 10,
        height: 10
      });
      v146.setParent(v151, v153.parentId);
      v146.setNode(v152, {
        domId: v152,
        id: v152,
        parentId: v153.parentId,
        labelStyle: "",
        padding: 0,
        shape: "labelRect",
        label: "",
        style: "",
        width: 10,
        height: 10
      });
      v146.setParent(v152, v153.parentId);
      const v154 = structuredClone(v149);
      const v155 = structuredClone(v149);
      const v156 = structuredClone(v149);
      const v157 = structuredClone(v149);
      v155.originalEdge = v154;
      v155.selfLoop = {
        id: v154.id,
        order: 0
      };
      v156.originalEdge = v154;
      v156.selfLoop = {
        id: v154.id,
        order: 1
      };
      v157.originalEdge = v154;
      v157.selfLoop = {
        id: v154.id,
        order: 2
      };
      v155.label = "";
      v155.arrowTypeEnd = "none";
      v155.endLabelLeft = "";
      v155.endLabelRight = "";
      v155.startLabelLeft = "";
      v155.id = v150 + "-cyclic-special-1";
      v156.startLabelRight = "";
      v156.startLabelLeft = "";
      v156.endLabelLeft = "";
      v156.endLabelRight = "";
      v156.arrowTypeStart = "none";
      v156.arrowTypeEnd = "none";
      v156.id = v150 + "-cyclic-special-mid";
      v157.label = "";
      v157.startLabelRight = "";
      v157.startLabelLeft = "";
      v157.arrowTypeStart = "none";
      if (v153.isGroup) {
        v155.fromCluster = v150;
        v157.toCluster = v150;
      }
      v157.id = v150 + "-cyclic-special-2";
      v157.arrowTypeStart = "none";
      v146.setEdge(v150, v151, v155, v150 + "-cyclic-special-0");
      v146.setEdge(v151, v152, v156, v150 + "-cyclic-special-1");
      v146.setEdge(v152, v150, v157, v150 + "-cyclic-special-2");
    } else {
      v146.setEdge(v149.start, v149.end, {
        ...v149
      }, v149.id);
    }
  });
  v12.warn("Graph at first:", JSON.stringify(v2(v146)));
  v3(v146);
  v12.warn("Graph after XAX:", JSON.stringify(v2(v146)));
  const v158 = v13();
  await recursiveRender(v147, v146, v144.type, v144.diagramId, undefined, v158);
}, "render");
export { getEdgesToRender, render };