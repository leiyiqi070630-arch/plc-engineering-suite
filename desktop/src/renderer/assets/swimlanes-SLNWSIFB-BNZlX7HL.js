const __vite__mapDeps = (v1, v2 = __vite__mapDeps, v3 = v2.f ||= ["./sizeCapture-X5ZJPWSS-DQDRomSn.js", "./index-CXb3UsfP.js", "./index-pqC5qFDs.css"]) => v1.map(v4 => v3[v4]);
import { am as v5, an as v6, ao as v7, ap as v8, l as v9, c as v10, ae as v11, aw as v12, ad as v13, af as v14, at as v15, av as v16, y as v17, as as v18, ax as v19, x as v20, ay as v21, _ as v22, az as v23 } from "./index-CXb3UsfP.js";
import { c as v24 } from "./chunk-RYQCIY6F-66OruSPP.js";
import { G as v25 } from "./graph-BMLV0goG.js";
import "./map-BEO0Bu8q.js";
async function createGraphWithElements(v26, v27) {
  const v28 = new v25({
    multigraph: true,
    compound: true
  });
  const v29 = [...v27.edges];
  const v30 = v10();
  const v31 = v26.insert("g").attr("class", "root");
  const v32 = v31.insert("g").attr("class", "clusters");
  const v33 = v31.insert("g").attr("class", "edges edgePath");
  const v34 = v31.insert("g").attr("class", "edgeLabels");
  const v35 = v31.insert("g").attr("class", "nodes");
  const v36 = new Map();
  const v37 = v26.node() != null;
  await Promise.all(v27.nodes.map(async v38 => {
    if (v38.isGroup) {
      v28.setNode(v38.id, {
        ...v38
      });
    } else {
      if (v37) {
        const v39 = await v11(v35, v38, {
          config: v30,
          dir: v38.dir
        });
        const v40 = v39.node()?.getBBox() ?? {
          width: 0,
          height: 0
        };
        v36.set(v38.id, v39);
        v38.width = v40.width;
        v38.height = v40.height;
      }
      v28.setNode(v38.id, {
        ...v38
      });
    }
  }));
  for (const v41 of v29) {
    v28.setEdge(v41.start, v41.end, {
      ...v41
    }, v41.id);
    const v42 = v27.edges.some(v43 => v43.id === v41.id);
    if (!v42) {
      v27.edges.push(v41);
    }
  }
  if (globalThis.mermaidCaptureSizes) {
    const {
      captureNodeSizes: v44
    } = await v12(async () => {
      const {
        captureNodeSizes: v45
      } = await import("./sizeCapture-X5ZJPWSS-DQDRomSn.js");
      return {
        captureNodeSizes: v45
      };
    }, true ? __vite__mapDeps([0, 1, 2]) : undefined, import.meta.url);
    v44(v26, v27);
  }
  return {
    graph: v28,
    groups: {
      clusters: v32,
      edgePaths: v33,
      edgeLabels: v34,
      nodes: v35,
      rootGroups: v31
    },
    nodeElements: v36
  };
}
v22(createGraphWithElements, "createGraphWithElements");
var ROUNDED_CORNER_RADIUS = 5;
var CORNER_EPSILON = 0.00001;
var ENDPOINT_EPSILON = 0.000001;
function buildSegmentList(v46) {
  const v47 = [];
  for (let v48 = 0; v48 < v46.length - 1; v48++) {
    v47.push({
      a: v46[v48],
      b: v46[v48 + 1]
    });
  }
  return v47;
}
v22(buildSegmentList, "buildSegmentList");
function segmentIntersection(v49, v50, v51, v52) {
  const v53 = v50.x - v49.x;
  const v54 = v50.y - v49.y;
  const v55 = v52.x - v51.x;
  const v56 = v52.y - v51.y;
  const v57 = v53 * v56 - v54 * v55;
  if (v57 === 0) {
    return null;
  }
  const v58 = v51.x - v49.x;
  const v59 = v51.y - v49.y;
  const v60 = (v58 * v56 - v59 * v55) / v57;
  const v61 = (v58 * v54 - v59 * v53) / v57;
  if (v60 <= ENDPOINT_EPSILON || v60 >= 1 - ENDPOINT_EPSILON || v61 <= ENDPOINT_EPSILON || v61 >= 1 - ENDPOINT_EPSILON) {
    return null;
  }
  return {
    point: {
      x: v49.x + v60 * v53,
      y: v49.y + v60 * v54
    },
    tA: v60,
    tB: v61
  };
}
v22(segmentIntersection, "segmentIntersection");
function isHorizontalSeg(v62) {
  return Math.abs(v62.b.x - v62.a.x) >= Math.abs(v62.b.y - v62.a.y);
}
v22(isHorizontalSeg, "isHorizontalSeg");
function findEdgeIntersections(v63) {
  const v64 = [];
  for (let v65 = 0; v65 < v63.length; v65++) {
    const v66 = v63[v65];
    const v67 = buildSegmentList(v66.points);
    for (let v68 = v65 + 1; v68 < v63.length; v68++) {
      const v69 = v63[v68];
      const v70 = buildSegmentList(v69.points);
      for (const [v71, v72] of v67.entries()) {
        for (const [v73, v74] of v70.entries()) {
          const v75 = segmentIntersection(v72.a, v72.b, v74.a, v74.b);
          if (!v75) {
            continue;
          }
          const v76 = isHorizontalSeg(v72);
          const v77 = isHorizontalSeg(v74);
          const v78 = v76 !== v77;
          const v79 = v78 ? v76 : false;
          if (v79) {
            v64.push({
              jumpEdgeId: v66.id,
              otherEdgeId: v69.id,
              segIndex: v71,
              t: v75.tA,
              point: v75.point
            });
          } else {
            v64.push({
              jumpEdgeId: v69.id,
              otherEdgeId: v66.id,
              segIndex: v73,
              t: v75.tB,
              point: v75.point
            });
          }
        }
      }
    }
  }
  return v64;
}
v22(findEdgeIntersections, "findEdgeIntersections");
function fmt(v80) {
  const v81 = Math.round(v80 * 1000) / 1000;
  if (Number.isInteger(v81)) {
    return "" + v81;
  } else {
    return "" + v81;
  }
}
v22(fmt, "fmt");
function pointToString(v82) {
  return fmt(v82.x) + "," + fmt(v82.y);
}
v22(pointToString, "pointToString");
function getArcSweepFlag(v83) {
  const v84 = v83.b.x - v83.a.x;
  const v85 = v83.b.y - v83.a.y;
  if (Math.abs(v84) >= Math.abs(v85)) {
    if (v84 >= 0) {
      return 1;
    } else {
      return 0;
    }
  }
  if (v85 >= 0) {
    return 1;
  } else {
    return 0;
  }
}
v22(getArcSweepFlag, "getArcSweepFlag");
var MIN_JUMP_RADIUS = 0.001;
function applyMarkerOffsets(v86, v87) {
  if (v86.length < 2) {
    return v86.map(v88 => ({
      ...v88
    }));
  }
  const v89 = v86.map(v90 => ({
    ...v90
  }));
  const v91 = v87.arrowTypeStart && v23[v87.arrowTypeStart];
  if (v91) {
    const v92 = v86[0];
    const v93 = v86[1];
    const v94 = Math.atan2(v93.y - v92.y, v93.x - v92.x);
    v89[0].x = v92.x + v91 * Math.cos(v94);
    v89[0].y = v92.y + v91 * Math.sin(v94);
  }
  const v95 = v87.arrowTypeEnd && v23[v87.arrowTypeEnd];
  if (v95) {
    const v96 = v86.length;
    const v97 = v86[v96 - 2];
    const v98 = v86[v96 - 1];
    const v99 = Math.atan2(v98.y - v97.y, v98.x - v97.x);
    v89[v96 - 1].x = v98.x - v95 * Math.cos(v99);
    v89[v96 - 1].y = v98.y - v95 * Math.sin(v99);
  }
  return v89;
}
v22(applyMarkerOffsets, "applyMarkerOffsets");
function emitJump(v100, v101, v102, v103, v104) {
  const v105 = v100.point.x;
  const v106 = v100.point.y;
  const v107 = {
    x: v105 - v101 * v100.r,
    y: v106 - v102 * v100.r
  };
  const v108 = {
    x: v105 + v101 * v100.r,
    y: v106 + v102 * v100.r
  };
  const v109 = ["L" + pointToString(v107)];
  if (v104 === "arc") {
    v109.push("A" + fmt(v100.r) + "," + fmt(v100.r) + " 0 0 " + v103 + " " + pointToString(v108));
  } else {
    v109.push("M" + pointToString(v108));
  }
  return v109;
}
v22(emitJump, "emitJump");
function computeRoundedCorner(v110, v111, v112, v113) {
  const v114 = v111.x - v110.x;
  const v115 = v111.y - v110.y;
  const v116 = v112.x - v111.x;
  const v117 = v112.y - v111.y;
  const v118 = Math.hypot(v114, v115);
  const v119 = Math.hypot(v116, v117);
  if (v118 < CORNER_EPSILON || v119 < CORNER_EPSILON) {
    return null;
  }
  const v120 = v114 / v118;
  const v121 = v115 / v118;
  const v122 = v116 / v119;
  const v123 = v117 / v119;
  const v124 = v120 * v122 + v121 * v123;
  const v125 = Math.max(-1, Math.min(1, v124));
  const v126 = Math.acos(v125);
  if (v126 < CORNER_EPSILON || Math.abs(Math.PI - v126) < CORNER_EPSILON) {
    return null;
  }
  const v127 = Math.min(v113 / Math.sin(v126 / 2), v118 / 2, v119 / 2);
  return {
    startX: v111.x - v120 * v127,
    startY: v111.y - v121 * v127,
    endX: v111.x + v122 * v127,
    endY: v111.y + v123 * v127,
    ctrlX: v111.x,
    ctrlY: v111.y,
    cutLen: v127
  };
}
v22(computeRoundedCorner, "computeRoundedCorner");
function rewriteEdgePath(v128, v129, v130) {
  const v131 = v128.points;
  if (v131.length < 2) {
    return "";
  }
  const v132 = applyMarkerOffsets(v131, v128);
  const v133 = v128.curve === "rounded";
  const v134 = buildSegmentList(v132);
  const v135 = new Map();
  for (const v136 of v129) {
    const v137 = v134[v136.segIndex];
    if (!v137) {
      continue;
    }
    const v138 = Math.hypot(v137.b.x - v137.a.x, v137.b.y - v137.a.y);
    const v139 = v135.get(v136.segIndex) ?? [];
    v139.push({
      t: v136.t,
      point: v136.point,
      d: v136.t * v138,
      r: v130.jumpRadius
    });
    v135.set(v136.segIndex, v139);
  }
  const v140 = ["M" + pointToString(v132[0])];
  for (let v141 = 0; v141 < v134.length; v141++) {
    const v142 = v134[v141];
    const v143 = Math.hypot(v142.b.x - v142.a.x, v142.b.y - v142.a.y);
    const v144 = v143 === 0 ? 0 : (v142.b.x - v142.a.x) / v143;
    const v145 = v143 === 0 ? 0 : (v142.b.y - v142.a.y) / v143;
    const v146 = getArcSweepFlag(v142);
    let v147 = 0;
    if (v133 && v141 > 0) {
      const v148 = computeRoundedCorner(v132[v141 - 1], v132[v141], v132[v141 + 1] ?? v132[v141], ROUNDED_CORNER_RADIUS);
      if (v148) {
        v147 = v148.cutLen;
      }
    }
    let v149 = v143;
    let v150 = null;
    if (v133 && v141 < v134.length - 1) {
      v150 = computeRoundedCorner(v132[v141], v132[v141 + 1], v132[v141 + 2] ?? v132[v141 + 1], ROUNDED_CORNER_RADIUS);
      if (v150) {
        v149 = v143 - v150.cutLen;
      }
    }
    const v151 = [...(v135.get(v141) ?? [])].sort((v152, v153) => v152.t - v153.t);
    for (const v154 of v151) {
      v154.r = Math.min(v154.r, v154.d - v147, v149 - v154.d);
    }
    for (let v155 = 0; v155 < v151.length - 1; v155++) {
      const v156 = v151[v155 + 1].d - v151[v155].d;
      if (v151[v155].r + v151[v155 + 1].r > v156) {
        const v157 = v156 / 2;
        v151[v155].r = Math.min(v151[v155].r, v157);
        v151[v155 + 1].r = Math.min(v151[v155 + 1].r, v157);
      }
    }
    for (const v158 of v151) {
      if (v158.r < MIN_JUMP_RADIUS) {
        continue;
      }
      v140.push(...emitJump(v158, v144, v145, v146, v130.jumpStyle));
    }
    if (v133 && v150) {
      v140.push("L" + fmt(v150.startX) + "," + fmt(v150.startY));
      v140.push("Q" + fmt(v150.ctrlX) + "," + fmt(v150.ctrlY) + " " + fmt(v150.endX) + "," + fmt(v150.endY));
    } else {
      v140.push("L" + pointToString(v142.b));
    }
  }
  return v140.join(" ");
}
v22(rewriteEdgePath, "rewriteEdgePath");
function isStraightPath(v159) {
  return /^[\d\s+,.LMelm-]*$/.test(v159);
}
v22(isStraightPath, "isStraightPath");
function curveSupportsLineHops(v160) {
  if (!v160) {
    return true;
  }
  return v160 === "linear" || v160 === "rounded" || v160 === "step" || v160 === "stepBefore" || v160 === "stepAfter";
}
v22(curveSupportsLineHops, "curveSupportsLineHops");
function decodeDataPoints(v161) {
  if (!v161) {
    return null;
  }
  try {
    const v162 = typeof atob === "function" ? atob(v161) : Buffer.from(v161, "base64").toString();
    const v163 = JSON.parse(v162);
    if (!Array.isArray(v163)) {
      return null;
    }
    const v164 = [];
    for (const v165 of v163) {
      if (v165 && typeof v165.x === "number" && typeof v165.y === "number") {
        v164.push({
          x: v165.x,
          y: v165.y
        });
      }
    }
    if (v164.length >= 2) {
      return v164;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
v22(decodeDataPoints, "decodeDataPoints");
function applyLineJumpsToSvg(v166, v167, v168) {
  if (!v168.enabled) {
    return;
  }
  const v169 = v166.node();
  if (!v169) {
    return;
  }
  const v170 = new Map();
  for (const v171 of v167) {
    v170.set(v171.id, v171);
  }
  const v172 = [];
  const v173 = new Map();
  for (const v174 of v167) {
    const v175 = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(v174.id) : v174.id;
    const v176 = v169.querySelector("path[data-id=\"" + v175 + "\"]");
    if (!v176) {
      continue;
    }
    v173.set(v174.id, v176);
    const v177 = decodeDataPoints(v176.getAttribute("data-points"));
    const v178 = v177 ?? v174.points;
    v172.push({
      ...v174,
      points: v178
    });
  }
  const v179 = findEdgeIntersections(v172);
  if (v179.length === 0) {
    return;
  }
  const v180 = new Map();
  for (const v181 of v179) {
    const v182 = v180.get(v181.jumpEdgeId) ?? [];
    v182.push(v181);
    v180.set(v181.jumpEdgeId, v182);
  }
  for (const v183 of v172) {
    const v184 = v180.get(v183.id);
    if (!v184 || v184.length === 0) {
      continue;
    }
    const v185 = v170.get(v183.id);
    const v186 = v185?.curve;
    if (v186 !== undefined && !curveSupportsLineHops(v186)) {
      continue;
    }
    const v187 = v173.get(v183.id);
    if (!v187) {
      continue;
    }
    if (v186 === undefined) {
      const v188 = v187.getAttribute("d") ?? "";
      if (!isStraightPath(v188)) {
        continue;
      }
    }
    const v189 = v187.getAttribute("style") ?? "";
    const v190 = /stroke-dasharray\s*:\s*0\s+([\d.]+)\s+[\d.]+\s+([\d.]+)/.exec(v189);
    const v191 = v190 ? Number.parseFloat(v190[1]) : null;
    const v192 = v190 ? Number.parseFloat(v190[2]) : null;
    const v193 = rewriteEdgePath(v183, v184, v168);
    v187.setAttribute("d", v193);
    if (v191 !== null && v192 !== null && typeof v187.getTotalLength === "function") {
      const v194 = v187.getTotalLength();
      const v195 = Math.max(0, v194 - v191 - v192);
      const v196 = "0 " + v191 + " " + v195 + " " + v192;
      const v197 = v189.replace(/stroke-dasharray\s*:[^;]*;?/g, "stroke-dasharray: " + v196 + ";").replace(/;\s*;+/g, ";");
      v187.setAttribute("style", v197);
    }
  }
}
v22(applyLineJumpsToSvg, "applyLineJumpsToSvg");
async function adjustLayout(v198, v199) {
  for (const v200 of v198.nodes) {
    if (v200.isGroup) {
      await v13(v199.clusters, v200);
    } else {
      v14(v200);
    }
  }
  const v201 = new Map();
  for (const v202 of v198.nodes) {
    if (v202?.id) {
      v201.set(v202.id, v202);
    }
  }
  for (const v203 of v198.edges) {
    const v204 = v203.start ? v201.get(v203.start) ?? {} : {};
    const v205 = v203.end ? v201.get(v203.end) ?? {} : {};
    const v206 = v15(v199.edgePaths, {
      ...v203
    }, {}, v198.type, v204, v205, v198.diagramId);
    if (v203.label) {
      await v16(v199.rootGroups, v203);
    }
    if (v203.label) {
      positionEdgeLabel(v203, v206);
    }
  }
  const v207 = v198.config?.swimlane?.lineHops;
  if (v207 !== false) {
    const v208 = v207 === "gap" ? "gap" : "arc";
    const v209 = v198.edges.filter(v210 => Array.isArray(v210.points) && v210.points.length >= 2).map(v211 => ({
      id: v211.id,
      points: v211.points,
      curve: v211.curve,
      arrowTypeStart: v211.arrowTypeStart,
      arrowTypeEnd: v211.arrowTypeEnd
    }));
    applyLineJumpsToSvg(v199.edgePaths, v209, {
      enabled: true,
      jumpRadius: 6,
      jumpStyle: v208
    });
  }
}
v22(adjustLayout, "adjustLayout");
function positionEdgeLabel(v212, v213) {
  const v214 = v213?.updatedPath ?? v213?.originalPath;
  const v215 = v17();
  const {
    subGraphTitleTotalMargin: v216
  } = v18({
    flowchart: v215.flowchart ?? {}
  });
  if (v212.label) {
    const v217 = v19.get(v212.id);
    let v218 = v212.x;
    let v219 = v212.y;
    if (v214) {
      const v220 = v20.calcLabelPosition(v214);
      v9.debug("Moving label " + v212.label + " from (", v218, ",", v219, ") to (", v220.x, ",", v220.y, ") abc88");
      if (v213) {
        v218 = v220.x;
        v219 = v220.y;
      }
    }
    v217.attr("transform", "translate(" + v218 + ", " + (v219 + v216 / 2) + ")");
  }
  if (v212?.startLabelLeft) {
    const v221 = v21.get(v212.id).startLeft;
    let v222 = v212?.x;
    let v223 = v212?.y;
    if (v214) {
      const v224 = v20.calcTerminalLabelPosition(v212.arrowTypeStart ? 10 : 0, "start_left", v214);
      v222 = v224.x;
      v223 = v224.y;
    }
    v221.attr("transform", "translate(" + v222 + ", " + v223 + ")");
  }
  if (v212.startLabelRight) {
    const v225 = v21.get(v212.id).startRight;
    let v226 = v212.x;
    let v227 = v212.y;
    if (v214) {
      const v228 = v20.calcTerminalLabelPosition(v212.arrowTypeStart ? 10 : 0, "start_right", v214);
      v226 = v228.x;
      v227 = v228.y;
    }
    v225.attr("transform", "translate(" + v226 + ", " + v227 + ")");
  }
  if (v212.endLabelLeft) {
    const v229 = v21.get(v212.id).endLeft;
    let v230 = v212.x;
    let v231 = v212.y;
    if (v214) {
      const v232 = v20.calcTerminalLabelPosition(v212.arrowTypeEnd ? 10 : 0, "end_left", v214);
      v230 = v232.x;
      v231 = v232.y;
    }
    v229.attr("transform", "translate(" + v230 + ", " + v231 + ")");
  }
  if (v212.endLabelRight) {
    const v233 = v21.get(v212.id).endRight;
    let v234 = v212.x;
    let v235 = v212.y;
    if (v214) {
      const v236 = v20.calcTerminalLabelPosition(v212.arrowTypeEnd ? 10 : 0, "end_right", v214);
      v234 = v236.x;
      v235 = v236.y;
    }
    v233.attr("transform", "translate(" + v234 + ", " + v235 + ")");
  }
}
v22(positionEdgeLabel, "positionEdgeLabel");
var DEFAULT_SWIMLANE_ID = "__swimlane_default__";
var TOP_LANE_TITLE_BAND_HEIGHT = 21;
var MIN_TOP_LANE_HORIZONTAL_PADDING = 20;
function topLaneHorizontalPadding(v237) {
  return Math.max(v237.padding ?? MIN_TOP_LANE_HORIZONTAL_PADDING, MIN_TOP_LANE_HORIZONTAL_PADDING);
}
v22(topLaneHorizontalPadding, "topLaneHorizontalPadding");
function assignTopLaneTitleRect(v238) {
  const {
    x: v239,
    y: v240,
    width: v241,
    height: v242
  } = v238;
  const v243 = v238.swimlaneContentTop;
  if (typeof v239 !== "number" || typeof v240 !== "number" || typeof v241 !== "number" || typeof v242 !== "number" || typeof v243 !== "number" || !Number.isFinite(v239) || !Number.isFinite(v240) || !Number.isFinite(v241) || !Number.isFinite(v242) || !Number.isFinite(v243) || v241 <= 0 || v242 <= 0) {
    delete v238.groupTitleRect;
    return;
  }
  const v244 = v240 - v242 / 2;
  const v245 = Math.min(v243, v240 + v242 / 2);
  const v246 = Math.min(TOP_LANE_TITLE_BAND_HEIGHT, Math.max(0, v245 - v244));
  const v247 = v244 + v246;
  if (v247 <= v244) {
    delete v238.groupTitleRect;
    return;
  }
  v238.groupTitleRect = {
    left: v239 - v241 / 2,
    right: v239 + v241 / 2,
    top: v244,
    bottom: v247
  };
}
v22(assignTopLaneTitleRect, "assignTopLaneTitleRect");
function prepareLayoutForSwimlanes(v248) {
  const v249 = v248.direction;
  const v250 = v248.nodes ??= [];
  for (const v251 of v248.nodes ?? []) {
    if (v251.isGroup && !v251.parentId) {
      v251.shape = "swimlane";
      if (v249) {
        v251.direction = v249;
      }
    }
  }
  const v252 = v250.filter(v253 => !v253.isGroup && !v253.parentId);
  if (v252.length === 0) {
    return;
  }
  let v254 = v250.find(v255 => v255.id === DEFAULT_SWIMLANE_ID);
  if (!v254) {
    v254 = {
      id: DEFAULT_SWIMLANE_ID,
      label: "",
      isGroup: true,
      shape: "swimlane",
      padding: 20,
      ...(v249 ? {
        direction: v249
      } : {})
    };
    v250.push(v254);
  } else if (v254.isGroup) {
    v254.shape = "swimlane";
    if (v249) {
      v254.direction = v249;
    }
  }
  for (const v256 of v252) {
    v256.parentId = DEFAULT_SWIMLANE_ID;
  }
}
v22(prepareLayoutForSwimlanes, "prepareLayoutForSwimlanes");
function toGraphView(v257) {
  const v258 = new Map();
  for (const v259 of v257.nodes ?? []) {
    v258.set(v259.id, v259);
  }
  const v260 = [];
  for (const v261 of v257.edges ?? []) {
    const v262 = typeof v261.start === "string" ? v261.start : undefined;
    const v263 = typeof v261.end === "string" ? v261.end : undefined;
    if (!v262 || !v263) {
      continue;
    }
    if (v261.labelNodeId) {
      continue;
    }
    v260.push({
      id: v261.id,
      src: v262,
      dst: v263,
      ref: v261
    });
  }
  const v264 = v257.nodes ?? [];
  const v265 = v264.filter(v266 => v266.isGroup);
  const v267 = v264.filter(v268 => !v268.isGroup);
  const v269 = [...v265].reverse();
  const v270 = [...v269, ...v267].map(v271 => v271.id);
  return {
    nodes: v270,
    edges: v260,
    layout: v257,
    nodeById: v258
  };
}
v22(toGraphView, "toGraphView");
function writeBackToLayoutData(v272, v273, v274, v275) {
  const {
    layout: v276
  } = v272;
  const v277 = v272.nodeById;
  const v278 = v275?.layerGap ?? 100;
  const v279 = v275?.nodeGap ?? 40;
  let v280 = 0;
  for (const v281 of v273.layers) {
    let v282 = 0;
    for (const v283 of v281) {
      const v284 = v277.get(v283);
      if (!v284) {
        v282++;
        continue;
      }
      v284.layer = v280;
      v284.order = v282;
      const v285 = v274.x[v283] ?? v282 * v279;
      const v286 = v274.y[v283] ?? v280 * v278;
      v284.x = v285;
      v284.y = v286;
      v282++;
    }
    v280++;
  }
  const v287 = v276.nodes ?? [];
  const v288 = new Map();
  const v289 = [];
  for (const v290 of v287) {
    if (!v290?.isGroup) {
      continue;
    }
    if (!v290.parentId) {
      v289.push(v290);
    }
    const v291 = v287.filter(v292 => v292.parentId === v290.id);
    let v293 = Infinity;
    let v294 = -Infinity;
    let v295 = Infinity;
    let v296 = -Infinity;
    for (const v297 of v291) {
      const v298 = v297.x ?? v274.x[v297.id];
      const v299 = v297.y ?? v274.y[v297.id];
      const v300 = v297.width ?? 0;
      const v301 = v297.height ?? 0;
      if (v298 != null && v299 != null) {
        v293 = Math.min(v293, v298 - v300 / 2);
        v294 = Math.max(v294, v298 + v300 / 2);
        v295 = Math.min(v295, v299 - v301 / 2);
        v296 = Math.max(v296, v299 + v301 / 2);
      }
    }
    if (v293 === Infinity || v295 === Infinity) {
      v290.x = v290.x ?? 0;
      v290.y = v290.y ?? 0;
      v290.width = v290.width ?? 0;
      v290.height = v290.height ?? 0;
    } else {
      const v302 = v290.padding ?? 20;
      const v303 = v290.parentId ? v302 : topLaneHorizontalPadding(v290) * 2;
      const v304 = v302;
      const v305 = Math.max(0, v294 - v293) + v303;
      const v306 = Math.max(0, v296 - v295) + v304;
      const v307 = (v293 + v294) / 2;
      const v308 = (v295 + v296) / 2;
      v290.x = v307;
      v290.y = v308;
      v290.width = v305;
      v290.height = v306;
      v288.set(v290.id, {
        minX: v293,
        maxX: v294,
        minY: v295,
        maxY: v296
      });
    }
  }
  if (v289.length > 0 && v288.size > 0) {
    let v309 = Infinity;
    let v310 = -Infinity;
    let v311 = 0;
    for (const v312 of v289) {
      const v313 = v312.padding ?? 20;
      if (v313 > v311) {
        v311 = v313;
      }
      const v314 = v288.get(v312.id);
      if (!v314) {
        continue;
      }
      v309 = Math.min(v309, v314.minY);
      v310 = Math.max(v310, v314.maxY);
    }
    if (v309 !== Infinity && v310 !== -Infinity) {
      const v315 = Math.max(0, v310 - v309);
      const v316 = 36;
      const v317 = Math.max(v311, v316);
      const v318 = v315 + v317 * 2;
      const v319 = (v309 + v310) / 2;
      for (const v320 of v289) {
        v320.y = v319;
        v320.height = v318;
        v320.swimlaneContentTop = v309;
      }
      const v321 = [...v289].sort((v322, v323) => {
        const v324 = v322.x ?? 0;
        const v325 = v323.x ?? 0;
        return v324 - v325;
      });
      const v326 = [];
      const v327 = [];
      const v328 = [];
      for (const v329 of v321) {
        const v330 = v288.get(v329.id);
        if (!v330) {
          continue;
        }
        const v331 = Math.max(0, v330.maxX - v330.minX) + topLaneHorizontalPadding(v329) * 2;
        const v332 = (v330.minX + v330.maxX) / 2;
        v326.push(v329.id);
        v327.push(v332);
        v328.push(v331);
      }
      const v333 = v326.length;
      if (v333 > 0) {
        const v334 = new Map();
        if (v333 === 1) {
          v334.set(v326[0], v328[0]);
        } else {
          const v335 = [];
          for (let v336 = 0; v336 < v333 - 1; v336++) {
            v335.push(v327[v336 + 1] - v327[v336]);
          }
          const v337 = new Array(v333);
          v337[0] = 0;
          for (let v338 = 0; v338 < v333 - 1; v338++) {
            v337[v338 + 1] = v335[v338] * 2 - v337[v338];
          }
          let v339 = 0;
          let v340 = Number.POSITIVE_INFINITY;
          for (let v341 = 0; v341 < v333; v341++) {
            const v342 = v328[v341];
            if (v341 % 2 === 0) {
              v339 = Math.max(v339, v342 - v337[v341]);
            } else {
              v340 = Math.min(v340, v337[v341] - v342);
            }
          }
          let v343 = v339;
          if (v339 <= v340) {
            v343 = (v339 + v340) / 2;
          } else {
            v343 = v339;
          }
          for (let v344 = 0; v344 < v333; v344++) {
            const v345 = v337[v344] + (v344 % 2 === 0 ? v343 : -v343);
            const v346 = Math.max(v328[v344], v345);
            v334.set(v326[v344], v346);
          }
        }
        for (const v347 of v289) {
          const v348 = v334.get(v347.id);
          if (v348 != null) {
            v347.width = v348;
          }
          assignTopLaneTitleRect(v347);
        }
      }
    }
  }
}
v22(writeBackToLayoutData, "writeBackToLayoutData");
var EDGE_LABEL_LOG_PREFIX = "[EdgeLabelNodes]";
function createEdgeLabelNodes(v349) {
  const v350 = [];
  const v351 = [];
  const v352 = new Map();
  for (const v353 of v349.nodes) {
    v352.set(v353.id, v353);
  }
  for (const v354 of v349.edges) {
    if (!v354.label || v354.label.length === 0) {
      continue;
    }
    if (v354.isLayoutOnly) {
      continue;
    }
    if (v354.labelNodeId) {
      continue;
    }
    const v355 = v354.start ? v352.get(v354.start) : undefined;
    const v356 = v354.end ? v352.get(v354.end) : undefined;
    if (!v355 || !v356) {
      v9.warn(EDGE_LABEL_LOG_PREFIX, "Edge " + v354.id + " has missing source or target node");
      continue;
    }
    const v357 = "edge-label-" + v354.start + "-" + v354.end + "-" + v354.id;
    const v358 = v355.parentId !== v356.parentId;
    const v359 = v358 ? v356.parentId : v355.parentId;
    const v360 = {
      id: v357,
      label: v354.label,
      edgeStart: v354.start ?? "",
      edgeEnd: v354.end ?? "",
      shape: "labelRect",
      width: 0,
      height: 0,
      isEdgeLabel: true,
      isDummy: true,
      parentId: v359,
      isGroup: false,
      labelStyle: Array.isArray(v354.labelStyle) ? v354.labelStyle[0] : v354.labelStyle ?? "",
      ...(v355.dir ? {
        dir: v355.dir
      } : {})
    };
    v350.push(v360);
    v354.labelNodeId = v357;
    v354.label = undefined;
    v354.text = undefined;
    const v361 = {
      id: v354.id + "-to-label",
      start: v354.start,
      end: v357,
      type: "normal",
      isLayoutOnly: true
    };
    const v362 = {
      id: v354.id + "-from-label",
      start: v357,
      end: v354.end,
      type: "normal",
      isLayoutOnly: true
    };
    v351.push(v361, v362);
  }
  const v363 = [...v349.nodes, ...v350];
  const v364 = [...v349.edges, ...v351];
  return {
    ...v349,
    nodes: v363,
    edges: v364
  };
}
v22(createEdgeLabelNodes, "createEdgeLabelNodes");
var EPS = 0.001;
function measuredNodeRect(v365) {
  const v366 = v365.x ?? 0;
  const v367 = v365.y ?? 0;
  const v368 = v365.width ?? 0;
  const v369 = v365.height ?? 0;
  if (v368 > 0 && v369 > 0) {
    return {
      cx: v366,
      cy: v367,
      rect: rectFromCenterSize(v366, v367, v368, v369)
    };
  } else {
    return undefined;
  }
}
v22(measuredNodeRect, "measuredNodeRect");
function nodeBoundsInfoFor(v370) {
  if (v370.isGroup) {
    return undefined;
  }
  const v371 = measuredNodeRect(v370);
  if (!v371) {
    return undefined;
  }
  const v372 = String(v370.id ?? "");
  return {
    id: v372,
    cx: v371.cx,
    cy: v371.cy,
    rect: v371.rect
  };
}
v22(nodeBoundsInfoFor, "nodeBoundsInfoFor");
function samePoint(v373, v374, v375 = EPS) {
  return Math.abs(v373.x - v374.x) < v375 && Math.abs(v373.y - v374.y) < v375;
}
v22(samePoint, "samePoint");
function sameX(v376, v377, v378 = EPS) {
  return Math.abs(v376.x - v377.x) < v378;
}
v22(sameX, "sameX");
function sameY(v379, v380, v381 = EPS) {
  return Math.abs(v379.y - v380.y) < v381;
}
v22(sameY, "sameY");
function isHorizontalSegment(v382, v383, v384 = EPS) {
  return sameY(v382, v383, v384) && Math.abs(v382.x - v383.x) > v384;
}
v22(isHorizontalSegment, "isHorizontalSegment");
function isVerticalSegment(v385, v386, v387 = EPS) {
  return sameX(v385, v386, v387) && Math.abs(v385.y - v386.y) > v387;
}
v22(isVerticalSegment, "isVerticalSegment");
function overlapLength(v388, v389, v390, v391) {
  return Math.max(0, Math.min(Math.max(v388, v389), Math.max(v390, v391)) - Math.max(Math.min(v388, v389), Math.min(v390, v391)));
}
v22(overlapLength, "overlapLength");
function sameAxisSegmentOverlapLength(v392, v393, v394 = EPS) {
  if (v392.horizontal && v393.horizontal && sameY(v392.a, v393.a, v394)) {
    return overlapLength(v392.a.x, v392.b.x, v393.a.x, v393.b.x);
  }
  if (v392.vertical && v393.vertical && sameX(v392.a, v393.a, v394)) {
    return overlapLength(v392.a.y, v392.b.y, v393.a.y, v393.b.y);
  }
  return 0;
}
v22(sameAxisSegmentOverlapLength, "sameAxisSegmentOverlapLength");
function orthogonalSegmentsForPoints(v395, v396 = EPS) {
  const v397 = [];
  for (let v398 = 0; v398 < v395.length - 1; v398++) {
    const v399 = v395[v398];
    const v400 = v395[v398 + 1];
    const v401 = isHorizontalSegment(v399, v400, v396);
    const v402 = isVerticalSegment(v399, v400, v396);
    if (v401 || v402) {
      v397.push({
        index: v398,
        a: v399,
        b: v400,
        horizontal: v401,
        vertical: v402
      });
    }
  }
  return v397;
}
v22(orthogonalSegmentsForPoints, "orthogonalSegmentsForPoints");
function countOrthogonalBends(v403, v404 = EPS) {
  const v405 = orthogonalSegmentsForPoints(v403, v404);
  let v406 = 0;
  for (let v407 = 1; v407 < v405.length; v407++) {
    if (v405[v407 - 1].horizontal !== v405[v407].horizontal) {
      v406++;
    }
  }
  return v406;
}
v22(countOrthogonalBends, "countOrthogonalBends");
function dedupeConsecutivePoints(v408, v409 = EPS) {
  const v410 = [];
  for (const v411 of v408) {
    const v412 = v410.length > 0 ? v410[v410.length - 1] : undefined;
    if (!v412 || !samePoint(v412, v411, v409)) {
      v410.push({
        x: v411.x,
        y: v411.y
      });
    }
  }
  return v410;
}
v22(dedupeConsecutivePoints, "dedupeConsecutivePoints");
function classifyThreeSegmentRoute(v413, v414 = EPS) {
  if (!v413 || v413.length !== 4) {
    return undefined;
  }
  const [v415, v416, v417, v418] = v413;
  const v419 = isHorizontalSegment(v415, v416, v414) && isVerticalSegment(v416, v417, v414) && isHorizontalSegment(v417, v418, v414);
  if (v419) {
    return {
      kind: "HVH",
      p0: v415,
      p1: v416,
      p2: v417,
      p3: v418
    };
  }
  const v420 = isVerticalSegment(v415, v416, v414) && isHorizontalSegment(v416, v417, v414) && isVerticalSegment(v417, v418, v414);
  if (v420) {
    return {
      kind: "VHV",
      p0: v415,
      p1: v416,
      p2: v417,
      p3: v418
    };
  } else {
    return undefined;
  }
}
v22(classifyThreeSegmentRoute, "classifyThreeSegmentRoute");
function segmentBoundsOverlapRect(v421, v422, v423, v424 = 0) {
  const v425 = Math.min(v421.x, v422.x);
  const v426 = Math.max(v421.x, v422.x);
  const v427 = Math.min(v421.y, v422.y);
  const v428 = Math.max(v421.y, v422.y);
  return v426 > v423.left - v424 && v425 < v423.right + v424 && v428 > v423.top - v424 && v427 < v423.bottom + v424;
}
v22(segmentBoundsOverlapRect, "segmentBoundsOverlapRect");
function pointInsideRect(v429, v430, v431 = 0) {
  return v429.x > v430.left + v431 && v429.x < v430.right - v431 && v429.y > v430.top + v431 && v429.y < v430.bottom - v431;
}
v22(pointInsideRect, "pointInsideRect");
function rectContainsRect(v432, v433) {
  return v432.left <= v433.left && v432.right >= v433.right && v432.top <= v433.top && v432.bottom >= v433.bottom;
}
v22(rectContainsRect, "rectContainsRect");
function rectsOverlap(v434, v435) {
  return v434.left < v435.right && v434.right > v435.left && v434.top < v435.bottom && v434.bottom > v435.top;
}
v22(rectsOverlap, "rectsOverlap");
function inflateRect(v436, v437) {
  return {
    left: v436.left - v437,
    right: v436.right + v437,
    top: v436.top - v437,
    bottom: v436.bottom + v437
  };
}
v22(inflateRect, "inflateRect");
function rectFromCenterSize(v438, v439, v440, v441) {
  return {
    left: v438 - v440 / 2,
    right: v438 + v440 / 2,
    top: v439 - v441 / 2,
    bottom: v439 + v441 / 2
  };
}
v22(rectFromCenterSize, "rectFromCenterSize");
function rectOfNodeBounds(v442) {
  return measuredNodeRect(v442)?.rect;
}
v22(rectOfNodeBounds, "rectOfNodeBounds");
function portForRectSide(v443, v444) {
  switch (v444) {
    case "top":
      return {
        x: v443.cx,
        y: v443.rect.top
      };
    case "bottom":
      return {
        x: v443.cx,
        y: v443.rect.bottom
      };
    case "left":
      return {
        x: v443.rect.left,
        y: v443.cy
      };
    case "right":
      return {
        x: v443.rect.right,
        y: v443.cy
      };
  }
}
v22(portForRectSide, "portForRectSide");
function buildOrthogonalPortPath(v445, v446, v447, v448, v449, v450 = EPS) {
  const v451 = v446 === "left" || v446 === "right";
  const v452 = v448 === "left" || v448 === "right";
  if (v451 && v452) {
    const v453 = v446 === "right" && v448 === "left" && v445.x < v447.x || v446 === "left" && v448 === "right" && v445.x > v447.x;
    if (v453) {
      if (sameY(v445, v447, v450)) {
        return [v445, v447];
      }
      const v454 = (v445.x + v447.x) / 2;
      return [v445, {
        x: v454,
        y: v445.y
      }, {
        x: v454,
        y: v447.y
      }, v447];
    }
    if (v446 === v448) {
      if (sameY(v445, v447, v450)) {
        return undefined;
      }
      const v455 = v446 === "left" ? Math.min(v445.x, v447.x) - v449 : Math.max(v445.x, v447.x) + v449;
      return [v445, {
        x: v455,
        y: v445.y
      }, {
        x: v455,
        y: v447.y
      }, v447];
    }
    return undefined;
  }
  if (!v451 && !v452) {
    if (v446 === v448) {
      if (sameX(v445, v447, v450)) {
        return undefined;
      }
      const v456 = v446 === "top" ? Math.min(v445.y, v447.y) - v449 : Math.max(v445.y, v447.y) + v449;
      return [v445, {
        x: v445.x,
        y: v456
      }, {
        x: v447.x,
        y: v456
      }, v447];
    }
    const v457 = v446 === "bottom" && v448 === "top" && v445.y < v447.y || v446 === "top" && v448 === "bottom" && v445.y > v447.y;
    if (!v457) {
      return undefined;
    }
    if (sameX(v445, v447, v450)) {
      return [v445, v447];
    }
    const v458 = (v445.y + v447.y) / 2;
    return [v445, {
      x: v445.x,
      y: v458
    }, {
      x: v447.x,
      y: v458
    }, v447];
  }
  if (v451 && !v452) {
    const v459 = v446 === "right" && v447.x > v445.x || v446 === "left" && v447.x < v445.x;
    const v460 = v448 === "top" && v445.y < v447.y || v448 === "bottom" && v445.y > v447.y;
    if (v459 && v460) {
      return [v445, {
        x: v447.x,
        y: v445.y
      }, v447];
    } else {
      return undefined;
    }
  }
  const v461 = v446 === "bottom" && v447.y > v445.y || v446 === "top" && v447.y < v445.y;
  const v462 = v448 === "left" && v445.x < v447.x || v448 === "right" && v445.x > v447.x;
  if (v461 && v462) {
    return [v445, {
      x: v445.x,
      y: v447.y
    }, v447];
  } else {
    return undefined;
  }
}
v22(buildOrthogonalPortPath, "buildOrthogonalPortPath");
function buildSameSideTrackPath(v463, v464, v465, v466) {
  if (v464 === "left" || v464 === "right") {
    return [v463, {
      x: v466,
      y: v463.y
    }, {
      x: v466,
      y: v465.y
    }, v465];
  } else {
    return [v463, {
      x: v463.x,
      y: v466
    }, {
      x: v465.x,
      y: v466
    }, v465];
  }
}
v22(buildSameSideTrackPath, "buildSameSideTrackPath");
function collectRealNodeBounds(v467) {
  const v468 = new Map();
  const v469 = [];
  for (const v470 of v467) {
    if (v470.isEdgeLabel) {
      continue;
    }
    const v471 = nodeBoundsInfoFor(v470);
    if (!v471) {
      continue;
    }
    v468.set(v471.id, v471);
    v469.push({
      id: v471.id,
      rect: v471.rect
    });
  }
  return {
    nodeInfoById: v468,
    realNodeRects: v469
  };
}
v22(collectRealNodeBounds, "collectRealNodeBounds");
function collectNodeRectEntries(v472) {
  const v473 = [];
  const v474 = [];
  for (const v475 of v472) {
    const v476 = nodeBoundsInfoFor(v475);
    if (!v476) {
      continue;
    }
    const v477 = {
      id: v476.id,
      rect: v476.rect
    };
    if (v475.isEdgeLabel) {
      v474.push(v477);
    } else {
      v473.push(v477);
    }
  }
  return {
    realNodeRects: v473,
    labelNodeRects: v474
  };
}
v22(collectNodeRectEntries, "collectNodeRectEntries");
function collectLayoutNodeRects(v478, {
  includeEdgeLabels = true
} = {}) {
  const v479 = [];
  for (const v480 of v478) {
    if (v480.isGroup || !includeEdgeLabels && v480.isEdgeLabel) {
      continue;
    }
    const v481 = v480.x ?? 0;
    const v482 = v480.y ?? 0;
    const v483 = v480.width ?? 0;
    const v484 = v480.height ?? 0;
    v479.push({
      nodeId: v480.id,
      ...rectFromCenterSize(v481, v482, v483, v484)
    });
  }
  return v479;
}
v22(collectLayoutNodeRects, "collectLayoutNodeRects");
function getNodePairGeometry(v485, v486, v487 = EPS) {
  const v488 = v485.start;
  const v489 = v485.end;
  if (!v488 || !v489) {
    return undefined;
  }
  const v490 = v486.get(v488);
  const v491 = v486.get(v489);
  if (!v490 || !v491) {
    return undefined;
  }
  return {
    srcId: v488,
    dstId: v489,
    srcInfo: v490,
    dstInfo: v491,
    collinearX: Math.abs(v490.cx - v491.cx) < v487,
    collinearY: Math.abs(v490.cy - v491.cy) < v487
  };
}
v22(getNodePairGeometry, "getNodePairGeometry");
function segmentHitsAnyRect(v492, v493, v494, v495 = [], v496 = 0) {
  for (const v497 of v494) {
    if (v495.includes(v497.id)) {
      continue;
    }
    if (segmentBoundsOverlapRect(v492, v493, v497.rect, -v496)) {
      return true;
    }
  }
  return false;
}
v22(segmentHitsAnyRect, "segmentHitsAnyRect");
function orthogonalSegmentsCross(v498, v499, v500, v501, v502 = EPS, v503 = 0.000001) {
  const v504 = sameY(v498, v499, v502);
  const v505 = sameX(v498, v499, v502);
  const v506 = sameY(v500, v501, v502);
  const v507 = sameX(v500, v501, v502);
  if (v504 && v506 || v505 && v507) {
    return false;
  }
  if (!v504 && !v505 || !v506 && !v507) {
    return false;
  }
  const v508 = v504 ? {
    a: v498,
    b: v499
  } : {
    a: v500,
    b: v501
  };
  const v509 = v505 ? {
    a: v498,
    b: v499
  } : {
    a: v500,
    b: v501
  };
  const v510 = v508.a.y;
  const v511 = Math.min(v508.a.x, v508.b.x);
  const v512 = Math.max(v508.a.x, v508.b.x);
  const v513 = v509.a.x;
  const v514 = Math.min(v509.a.y, v509.b.y);
  const v515 = Math.max(v509.a.y, v509.b.y);
  if (v513 < v511 || v513 > v512 || v510 < v514 || v510 > v515) {
    return false;
  }
  const v516 = Math.abs(v513 - v508.a.x) < v503 && Math.abs(v510 - v508.a.y) < v503 || Math.abs(v513 - v508.b.x) < v503 && Math.abs(v510 - v508.b.y) < v503;
  const v517 = Math.abs(v513 - v509.a.x) < v503 && Math.abs(v510 - v509.a.y) < v503 || Math.abs(v513 - v509.b.x) < v503 && Math.abs(v510 - v509.b.y) < v503;
  return !v516 || !v517;
}
v22(orthogonalSegmentsCross, "orthogonalSegmentsCross");
function sameAxisSegmentsOverlap(v518, v519, v520, v521, v522 = EPS) {
  const v523 = sameY(v518, v519, v522);
  const v524 = sameX(v518, v519, v522);
  const v525 = sameY(v520, v521, v522);
  const v526 = sameX(v520, v521, v522);
  if (v524 && v526 && sameX(v518, v520, v522)) {
    return overlapLength(v518.y, v519.y, v520.y, v521.y) > v522;
  }
  if (v523 && v525 && sameY(v518, v520, v522)) {
    return overlapLength(v518.x, v519.x, v520.x, v521.x) > v522;
  }
  return false;
}
v22(sameAxisSegmentsOverlap, "sameAxisSegmentsOverlap");
function segmentConflictsWithAnyEdge(v527, v528, v529, v530, {
  epsilon = EPS,
  skipDegenerateOther = false
} = {}) {
  for (const v531 of v529) {
    if (v531 === v530 || v531.isLayoutOnly) {
      continue;
    }
    const v532 = v531.points;
    if (!v532 || v532.length < 2) {
      continue;
    }
    for (let v533 = 0; v533 < v532.length - 1; v533++) {
      const v534 = v532[v533];
      const v535 = v532[v533 + 1];
      if (skipDegenerateOther && samePoint(v534, v535, epsilon)) {
        continue;
      }
      if (orthogonalSegmentsCross(v527, v528, v534, v535, epsilon) || sameAxisSegmentsOverlap(v527, v528, v534, v535, epsilon)) {
        return true;
      }
    }
  }
  return false;
}
v22(segmentConflictsWithAnyEdge, "segmentConflictsWithAnyEdge");
function orthogonalSegmentsStrictlyCross(v536, v537, v538, v539, v540 = EPS) {
  const v541 = sameY(v536, v537, v540);
  const v542 = sameX(v536, v537, v540);
  const v543 = sameY(v538, v539, v540);
  const v544 = sameX(v538, v539, v540);
  if ((!v541 || !v544) && (!v542 || !v543)) {
    return false;
  }
  const v545 = v541 ? {
    a: v536,
    b: v537
  } : {
    a: v538,
    b: v539
  };
  const v546 = v541 ? {
    a: v538,
    b: v539
  } : {
    a: v536,
    b: v537
  };
  const v547 = v545.a.y;
  const v548 = Math.min(v545.a.x, v545.b.x);
  const v549 = Math.max(v545.a.x, v545.b.x);
  const v550 = v546.a.x;
  const v551 = Math.min(v546.a.y, v546.b.y);
  const v552 = Math.max(v546.a.y, v546.b.y);
  return v550 > v548 + v540 && v550 < v549 - v540 && v547 > v551 + v540 && v547 < v552 - v540;
}
v22(orthogonalSegmentsStrictlyCross, "orthogonalSegmentsStrictlyCross");
function strictlyBetween(v553, v554, v555) {
  const v556 = Math.min(v554, v555);
  const v557 = Math.max(v554, v555);
  return v553 > v556 + EPS && v553 < v557 - EPS;
}
v22(strictlyBetween, "strictlyBetween");
function isCollinearIntermediate(v558, v559, v560) {
  if (sameX(v558, v559) && sameX(v559, v560)) {
    return strictlyBetween(v559.y, v558.y, v560.y);
  }
  if (sameY(v558, v559) && sameY(v559, v560)) {
    return strictlyBetween(v559.x, v558.x, v560.x);
  }
  return false;
}
v22(isCollinearIntermediate, "isCollinearIntermediate");
function simplifyPolylineOnce(v561) {
  let v562 = false;
  const v563 = [];
  for (let v564 = 0; v564 < v561.length; v564++) {
    const v565 = v563[v563.length - 1];
    const v566 = v561[v564];
    const v567 = v564 + 1 < v561.length ? v561[v564 + 1] : undefined;
    if (v565 && v567) {
      if (samePoint(v565, v567)) {
        v564++;
        v562 = true;
        continue;
      }
      if (isCollinearIntermediate(v565, v566, v567)) {
        v562 = true;
        continue;
      }
    }
    v563.push(v566);
  }
  return {
    points: v563,
    changed: v562
  };
}
v22(simplifyPolylineOnce, "simplifyPolylineOnce");
function orthogonalizePolyline(v568) {
  const v569 = [v568[0]];
  for (let v570 = 1; v570 < v568.length; v570++) {
    const v571 = v569[v569.length - 1];
    const v572 = v568[v570];
    if (!sameX(v571, v572) && !sameY(v571, v572)) {
      const v573 = v569.length >= 2 ? v569[v569.length - 2] : undefined;
      const v574 = v573 ? sameX(v573, v571) : false;
      const v575 = v574 ? {
        x: v571.x,
        y: v572.y
      } : {
        x: v572.x,
        y: v571.y
      };
      v569.push(v575);
    }
    v569.push(v572);
  }
  const v576 = [];
  for (const v577 of v569) {
    const v578 = v576[v576.length - 1];
    if (!v578 || !samePoint(v578, v577)) {
      v576.push(v577);
    }
  }
  return v576;
}
v22(orthogonalizePolyline, "orthogonalizePolyline");
function simplifyPolyline(v579) {
  if (v579.length < 3) {
    return v579;
  }
  let v580 = [...v579];
  for (let v581 = 0; v581 < 32; v581++) {
    const v582 = simplifyPolylineOnce(v580);
    v580 = v582.points;
    if (!v582.changed) {
      break;
    }
  }
  return v580;
}
v22(simplifyPolyline, "simplifyPolyline");
var EPS2 = 0.001;
var INSIDE_EPS = 0.5;
var CORNER_CLEARANCE = 4;
function endpointContextFor(v583, v584, v585) {
  const v586 = v583;
  if (v586.isLayoutOnly || !v586.points || v586.points.length < v585) {
    return undefined;
  }
  const v587 = v586.start ? v584.get(v586.start) : undefined;
  const v588 = v586.end ? v584.get(v586.end) : undefined;
  return {
    edge: v586,
    points: v586.points,
    srcRect: v587 ? rectOfNodeBounds(v587) : undefined,
    dstRect: v588 ? rectOfNodeBounds(v588) : undefined
  };
}
v22(endpointContextFor, "endpointContextFor");
function segmentEnterPoint(v589, v590, v591) {
  if (sameY(v589, v590, EPS2)) {
    const v592 = v589.x < v591.left ? v591.left : v591.right;
    return {
      x: v592,
      y: v589.y
    };
  }
  if (sameX(v589, v590, EPS2)) {
    const v593 = v589.y < v591.top ? v591.top : v591.bottom;
    return {
      x: v589.x,
      y: v593
    };
  }
  return {
    x: Math.min(v591.right, Math.max(v591.left, v589.x)),
    y: Math.min(v591.bottom, Math.max(v591.top, v589.y))
  };
}
v22(segmentEnterPoint, "segmentEnterPoint");
function clipEndpoint(v594, v595, v596) {
  const v597 = v596 ? 1 : -1;
  let v598 = v596 ? 0 : v594.length - 1;
  while (v598 >= 0 && v598 < v594.length && pointInsideRect(v594[v598], v595, INSIDE_EPS)) {
    v598 += v597;
  }
  if (v598 < 0 || v598 >= v594.length) {
    return v594;
  }
  const v599 = v598 - v597;
  if (v599 < 0 || v599 >= v594.length) {
    return v594;
  }
  const v600 = segmentEnterPoint(v594[v598], v594[v599], v595);
  if (v596) {
    return [v600, ...v594.slice(v598)];
  } else {
    return [...v594.slice(0, v598 + 1), v600];
  }
}
v22(clipEndpoint, "clipEndpoint");
function clipEdgeEndpointsToNodeBoundaries(v601, v602) {
  for (const v603 of v601) {
    const v604 = endpointContextFor(v603, v602, 2);
    if (!v604) {
      continue;
    }
    let v605 = [...v604.points];
    if (v604.srcRect) {
      v605 = clipEndpoint(v605, v604.srcRect, true);
    }
    if (v604.dstRect) {
      v605 = clipEndpoint(v605, v604.dstRect, false);
    }
    v605 = simplifyPolyline(orthogonalizePolyline(v605));
    v605 = clearStraightEndpointCornerConnections(v605, v604.srcRect, v604.dstRect);
    v604.edge.points = simplifyPolyline(orthogonalizePolyline(v605));
  }
}
v22(clipEdgeEndpointsToNodeBoundaries, "clipEdgeEndpointsToNodeBoundaries");
function snapEndpointToBoundary(v606, v607, v608, v609 = false) {
  if (sameY(v606, v607, EPS2)) {
    if (v607.y < v608.top - EPS2 || v607.y > v608.bottom + EPS2) {
      return v607;
    }
    if (v609) {
      if (v606.x < v608.left - EPS2) {
        return {
          x: v608.left,
          y: v606.y
        };
      }
      if (v606.x > v608.right + EPS2) {
        return {
          x: v608.right,
          y: v606.y
        };
      }
    }
    const v610 = Math.abs(v607.x - v608.left) <= Math.abs(v607.x - v608.right);
    return {
      x: v610 ? v608.left : v608.right,
      y: v606.y
    };
  }
  if (sameX(v606, v607, EPS2)) {
    if (v607.x < v608.left - EPS2 || v607.x > v608.right + EPS2) {
      return v607;
    }
    if (v609) {
      if (v606.y < v608.top - EPS2) {
        return {
          x: v606.x,
          y: v608.top
        };
      }
      if (v606.y > v608.bottom + EPS2) {
        return {
          x: v606.x,
          y: v608.bottom
        };
      }
    }
    const v611 = Math.abs(v607.y - v608.top) <= Math.abs(v607.y - v608.bottom);
    return {
      x: v606.x,
      y: v611 ? v608.top : v608.bottom
    };
  }
  return v607;
}
v22(snapEndpointToBoundary, "snapEndpointToBoundary");
function firstDistinctAdjacent(v612, v613, v614) {
  const v615 = v612[v613];
  for (let v616 = v613 + v614; v616 >= 0 && v616 < v612.length; v616 += v614) {
    const v617 = v612[v616];
    if (!samePoint(v617, v615, EPS2)) {
      return v617;
    }
  }
  return v612[v613 + v614];
}
v22(firstDistinctAdjacent, "firstDistinctAdjacent");
function cornerClearanceRange(v618, v619) {
  const v620 = v618 + CORNER_CLEARANCE;
  const v621 = v619 - CORNER_CLEARANCE;
  if (v620 <= v621) {
    return {
      lo: v620,
      hi: v621
    };
  } else {
    return {
      lo: (v618 + v619) / 2,
      hi: (v618 + v619) / 2
    };
  }
}
v22(cornerClearanceRange, "cornerClearanceRange");
function clampToCornerClearance(v622, v623, v624) {
  const {
    lo: v625,
    hi: v626
  } = cornerClearanceRange(v623, v624);
  return Math.min(v626, Math.max(v625, v622));
}
v22(clampToCornerClearance, "clampToCornerClearance");
function intersectRanges(v627) {
  const v628 = Math.max(...v627.map(v629 => v629.lo));
  const v630 = Math.min(...v627.map(v631 => v631.hi));
  if (v628 > v630) {
    return undefined;
  }
  return {
    lo: v628,
    hi: v630
  };
}
v22(intersectRanges, "intersectRanges");
function clearanceRangeForSide(v632, v633) {
  if (v633 === "left" || v633 === "right") {
    return cornerClearanceRange(v632.top, v632.bottom);
  } else {
    return cornerClearanceRange(v632.left, v632.right);
  }
}
v22(clearanceRangeForSide, "clearanceRangeForSide");
function terminalSideForSegment(v634, v635, v636) {
  const v637 = v634.y >= v636.top - EPS2 && v634.y <= v636.bottom + EPS2;
  const v638 = v634.x >= v636.left - EPS2 && v634.x <= v636.right + EPS2;
  if (sameY(v634, v635, EPS2) && v637) {
    if (Math.abs(v634.x - v636.left) < EPS2) {
      return "left";
    }
    if (Math.abs(v634.x - v636.right) < EPS2) {
      return "right";
    }
  }
  if (sameX(v634, v635, EPS2) && v638) {
    if (Math.abs(v634.y - v636.top) < EPS2) {
      return "top";
    }
    if (Math.abs(v634.y - v636.bottom) < EPS2) {
      return "bottom";
    }
  }
  return undefined;
}
v22(terminalSideForSegment, "terminalSideForSegment");
function isHorizontalSide(v639) {
  return v639 === "left" || v639 === "right";
}
v22(isHorizontalSide, "isHorizontalSide");
function straightClearanceRange(v640, v641, v642, v643, v644) {
  const v645 = [];
  const v646 = v642 ? terminalSideForSegment(v640, v641, v642) : undefined;
  const v647 = v643 ? terminalSideForSegment(v641, v640, v643) : undefined;
  if (v642 && v646 && isHorizontalSide(v646) === v644) {
    v645.push(clearanceRangeForSide(v642, v646));
  }
  if (v643 && v647 && isHorizontalSide(v647) === v644) {
    v645.push(clearanceRangeForSide(v643, v647));
  }
  if (v645.length > 0) {
    return intersectRanges(v645);
  } else {
    return undefined;
  }
}
v22(straightClearanceRange, "straightClearanceRange");
function clearStraightEndpointCornerAxis(v648, v649, v650, v651, v652) {
  const v653 = straightClearanceRange(v648, v649, v650, v651, v652);
  if (!v653) {
    return undefined;
  }
  const v654 = v652 ? v648.y : v648.x;
  const v655 = Math.min(v653.hi, Math.max(v653.lo, v654));
  if (Math.abs(v655 - v654) < EPS2) {
    return undefined;
  }
  if (v652) {
    return [{
      x: v648.x,
      y: v655
    }, {
      x: v649.x,
      y: v655
    }];
  } else {
    return [{
      x: v655,
      y: v648.y
    }, {
      x: v655,
      y: v649.y
    }];
  }
}
v22(clearStraightEndpointCornerAxis, "clearStraightEndpointCornerAxis");
function clearStraightEndpointCornerConnections(v656, v657, v658) {
  if (v656.length !== 2) {
    return v656;
  }
  const [v659, v660] = v656;
  if (sameY(v659, v660, EPS2)) {
    return clearStraightEndpointCornerAxis(v659, v660, v657, v658, true) ?? v656;
  }
  if (sameX(v659, v660, EPS2)) {
    return clearStraightEndpointCornerAxis(v659, v660, v657, v658, false) ?? v656;
  }
  return v656;
}
v22(clearStraightEndpointCornerConnections, "clearStraightEndpointCornerConnections");
function cornerClearedEndpoint(v661, v662, v663) {
  if (isHorizontalSide(v663)) {
    return {
      x: v661.x,
      y: clampToCornerClearance(v661.y, v662.top, v662.bottom)
    };
  } else {
    return {
      x: clampToCornerClearance(v661.x, v662.left, v662.right),
      y: v661.y
    };
  }
}
v22(cornerClearedEndpoint, "cornerClearedEndpoint");
function moveCollinearEndpointRun(v664, v665, v666, v667, v668, v669) {
  const v670 = v664.map(v671 => ({
    ...v671
  }));
  for (let v672 = v665; v672 >= 0 && v672 < v664.length; v672 += v666) {
    const v673 = v664[v672];
    if (v669 && !sameY(v673, v667, EPS2)) {
      break;
    }
    if (!v669 && !sameX(v673, v667, EPS2)) {
      break;
    }
    if (v669) {
      v670[v672].y = v668.y;
    } else {
      v670[v672].x = v668.x;
    }
  }
  return v670;
}
v22(moveCollinearEndpointRun, "moveCollinearEndpointRun");
function clearEndpointCornerConnection(v674, v675, v676) {
  if (v674.length < 2) {
    return v674;
  }
  const v677 = v676 ? 0 : v674.length - 1;
  const v678 = v676 ? 1 : -1;
  const v679 = v674[v677];
  const v680 = firstDistinctAdjacent(v674, v677, v678);
  if (!v680) {
    return v674;
  }
  const v681 = terminalSideForSegment(v679, v680, v675);
  if (!v681) {
    return v674;
  }
  const v682 = isHorizontalSide(v681);
  const v683 = cornerClearedEndpoint(v679, v675, v681);
  if (samePoint(v679, v683, EPS2)) {
    return v674;
  }
  return moveCollinearEndpointRun(v674, v677, v678, v679, v683, v682);
}
v22(clearEndpointCornerConnection, "clearEndpointCornerConnection");
function borderSideForSegment(v684, v685, v686) {
  const v687 = Math.min(v684.x, v685.x) >= v686.left - EPS2 && Math.max(v684.x, v685.x) <= v686.right + EPS2;
  const v688 = Math.min(v684.y, v685.y) >= v686.top - EPS2 && Math.max(v684.y, v685.y) <= v686.bottom + EPS2;
  if (Math.abs(v684.y - v686.top) < EPS2 && Math.abs(v685.y - v686.top) < EPS2 && v687) {
    return "top";
  }
  if (Math.abs(v684.y - v686.bottom) < EPS2 && Math.abs(v685.y - v686.bottom) < EPS2 && v687) {
    return "bottom";
  }
  if (Math.abs(v684.x - v686.left) < EPS2 && Math.abs(v685.x - v686.left) < EPS2 && v688) {
    return "left";
  }
  if (Math.abs(v684.x - v686.right) < EPS2 && Math.abs(v685.x - v686.right) < EPS2 && v688) {
    return "right";
  }
  return undefined;
}
v22(borderSideForSegment, "borderSideForSegment");
function leavesOutward(v689, v690, v691, v692) {
  switch (v689) {
    case "top":
      return sameX(v690, v691, EPS2) && v691.y < v692.top - EPS2;
    case "bottom":
      return sameX(v690, v691, EPS2) && v691.y > v692.bottom + EPS2;
    case "left":
      return sameY(v690, v691, EPS2) && v691.x < v692.left - EPS2;
    case "right":
      return sameY(v690, v691, EPS2) && v691.x > v692.right + EPS2;
  }
}
v22(leavesOutward, "leavesOutward");
function collapseOwnBorderStub(v693, v694, v695) {
  if (v693.length < 3) {
    return v693;
  }
  if (v695) {
    const v696 = borderSideForSegment(v693[0], v693[1], v694);
    if (v696 && leavesOutward(v696, v693[1], v693[2], v694)) {
      return v693.slice(1);
    }
    return v693;
  }
  const v697 = v693.length - 1;
  const v698 = borderSideForSegment(v693[v697 - 1], v693[v697], v694);
  if (v698 && leavesOutward(v698, v693[v697 - 1], v693[v697 - 2], v694)) {
    return v693.slice(0, v697);
  }
  return v693;
}
v22(collapseOwnBorderStub, "collapseOwnBorderStub");
function snapAndCollapseEndpoints(v699, v700, v701) {
  let v702 = v699;
  if (v700) {
    const v703 = firstDistinctAdjacent(v702, 0, 1);
    if (v703) {
      const v704 = snapEndpointToBoundary(v703, v702[0], v700);
      if (v704 !== v702[0]) {
        v702 = [v704, ...v702.slice(1)];
      }
    }
    v702 = collapseOwnBorderStub(v702, v700, true);
  }
  if (v701) {
    const v705 = v702.length - 1;
    const v706 = firstDistinctAdjacent(v702, v705, -1);
    if (v706) {
      const v707 = snapEndpointToBoundary(v706, v702[v705], v701, true);
      if (v707 !== v702[v705]) {
        v702 = [...v702.slice(0, v705), v707];
      }
    }
    v702 = collapseOwnBorderStub(v702, v701, false);
  }
  const v708 = clearStraightEndpointCornerConnections(v702, v700, v701);
  if (v708 !== v702 || v702.length === 2) {
    return v708;
  }
  if (v700) {
    v702 = clearEndpointCornerConnection(v702, v700, true);
  }
  if (v701) {
    v702 = clearEndpointCornerConnection(v702, v701, false);
  }
  return v702;
}
v22(snapAndCollapseEndpoints, "snapAndCollapseEndpoints");
function prepareEdgeEndpointsForRenderer(v709, v710) {
  for (const v711 of v709) {
    const v712 = endpointContextFor(v711, v710, 2);
    if (!v712) {
      continue;
    }
    const v713 = dedupeConsecutivePoints(v712.points, EPS2);
    const v714 = snapAndCollapseEndpoints(v713, v712.srcRect, v712.dstRect);
    if (v714.length < 3) {
      v712.edge.points = v714;
      continue;
    }
    const v715 = [v714[0], {
      ...v714[0]
    }, ...v714.slice(1, -1), v714[v714.length - 1], {
      ...v714[v714.length - 1]
    }];
    v712.edge.points = v715;
  }
}
v22(prepareEdgeEndpointsForRenderer, "prepareEdgeEndpointsForRenderer");
function buildNodeMap(v716) {
  return new Map(v716.map(v717 => [v717.id, v717]));
}
v22(buildNodeMap, "buildNodeMap");
function resolveTopLevelGroupId(v718, v719) {
  let v720 = v718.parentId;
  let v721 = null;
  while (v720) {
    const v722 = v719.get(v720);
    if (!v722?.isGroup) {
      break;
    }
    v721 = v722.id;
    v720 = v722.parentId;
  }
  return v721;
}
v22(resolveTopLevelGroupId, "resolveTopLevelGroupId");
function groupDepth(v723, v724) {
  let v725 = 0;
  let v726 = v723.parentId;
  while (v726) {
    const v727 = v724.get(v726);
    if (!v727?.isGroup) {
      break;
    }
    v725++;
    v726 = v727.parentId;
  }
  return v725;
}
v22(groupDepth, "groupDepth");
function boundsForChildren(v728) {
  let v729 = Infinity;
  let v730 = -Infinity;
  let v731 = Infinity;
  let v732 = -Infinity;
  for (const v733 of v728) {
    const v734 = v733.x;
    const v735 = v733.y;
    if (typeof v734 !== "number" || typeof v735 !== "number") {
      continue;
    }
    const v736 = v733.width ?? 0;
    const v737 = v733.height ?? 0;
    v729 = Math.min(v729, v734 - v736 / 2);
    v730 = Math.max(v730, v734 + v736 / 2);
    v731 = Math.min(v731, v735 - v737 / 2);
    v732 = Math.max(v732, v735 + v737 / 2);
  }
  if (v729 === Infinity || v731 === Infinity) {
    return null;
  }
  return {
    minX: v729,
    maxX: v730,
    minY: v731,
    maxY: v732
  };
}
v22(boundsForChildren, "boundsForChildren");
function applyGroupBounds(v738, v739) {
  const v740 = v738.padding ?? 20;
  v738.x = (v739.minX + v739.maxX) / 2;
  v738.y = (v739.minY + v739.maxY) / 2;
  v738.width = Math.max(0, v739.maxX - v739.minX) + v740;
  v738.height = Math.max(0, v739.maxY - v739.minY) + v740;
}
v22(applyGroupBounds, "applyGroupBounds");
function recomputeNestedGroupBounds(v741) {
  const v742 = buildNodeMap(v741);
  const v743 = v741.filter(v744 => v744.isGroup && v744.parentId).sort((v745, v746) => groupDepth(v746, v742) - groupDepth(v745, v742));
  for (const v747 of v743) {
    const v748 = v741.filter(v749 => v749.parentId === v747.id);
    const v750 = boundsForChildren(v748);
    if (v750) {
      applyGroupBounds(v747, v750);
    }
  }
}
v22(recomputeNestedGroupBounds, "recomputeNestedGroupBounds");
function mirrorAxis(v751, v752) {
  const v753 = v751.nodes ?? [];
  const v754 = v751.edges ?? [];
  const v755 = v753.filter(v756 => !v756.isGroup);
  let v757 = Infinity;
  let v758 = -Infinity;
  for (const v759 of v755) {
    const v760 = v759[v752];
    if (typeof v760 !== "number") {
      continue;
    }
    v757 = Math.min(v757, v760);
    v758 = Math.max(v758, v760);
  }
  if (!Number.isFinite(v757) || !Number.isFinite(v758)) {
    return false;
  }
  const v761 = v22(v762 => v757 + v758 - v762, "mirror");
  for (const v763 of v753) {
    const v764 = v763[v752];
    if (typeof v764 === "number") {
      v763[v752] = v761(v764);
    }
    const v765 = v763.groupTitleRect;
    if (v765) {
      v763.groupTitleRect = v752 === "x" ? {
        ...v765,
        left: v761(v765.right),
        right: v761(v765.left)
      } : {
        ...v765,
        top: v761(v765.bottom),
        bottom: v761(v765.top)
      };
    }
  }
  for (const v766 of v754) {
    for (const v767 of v766.points ?? []) {
      v767[v752] = v761(v767[v752]);
    }
  }
  return true;
}
v22(mirrorAxis, "mirrorAxis");
function applyBtDirectionTransform(v768) {
  const v769 = v768.nodes ?? [];
  if (!v769.some(v770 => !v770.isGroup)) {
    return true;
  }
  return mirrorAxis(v768, "y");
}
v22(applyBtDirectionTransform, "applyBtDirectionTransform");
function applyLrDirectionTransform(v771, v772 = "LR") {
  const v773 = v771.nodes ?? [];
  const v774 = v771.edges ?? [];
  const v775 = v773.filter(v776 => !v776.isGroup);
  let v777 = Infinity;
  let v778 = Infinity;
  for (const v779 of v775) {
    const v780 = v779.x ?? 0;
    const v781 = v779.y ?? 0;
    if (v780 < v777) {
      v777 = v780;
    }
    if (v781 < v778) {
      v778 = v781;
    }
  }
  if (!Number.isFinite(v777) || !Number.isFinite(v778)) {
    return false;
  }
  const v782 = 36;
  let v783 = 0;
  let v784 = 0;
  for (const v785 of v775) {
    v783 += v785.width ?? 0;
    v784 += v785.height ?? 0;
  }
  const v786 = v783 / v775.length;
  const v787 = v784 / v775.length;
  const v788 = v787 > 0 ? Math.max(1, v786 / v787) : 1;
  for (const v789 of v775) {
    const v790 = v789.x ?? 0;
    const v791 = v789.y ?? 0;
    const v792 = (v791 - v778) * v788 + v782;
    const v793 = v790 - v777;
    v789.x = v792;
    v789.y = v793;
  }
  for (const v794 of v774) {
    if (!v794.points) {
      continue;
    }
    for (const v795 of v794.points) {
      const v796 = v795.x;
      const v797 = v795.y;
      const v798 = (v797 - v778) * v788 + v782;
      const v799 = v796 - v777;
      v795.x = v798;
      v795.y = v799;
    }
  }
  recomputeNestedGroupBounds(v773);
  const v800 = v773.filter(v801 => v801.isGroup && !v801.parentId);
  if (v800.length === 0) {
    if (v772 === "RL") {
      mirrorAxis(v771, "x");
    }
    return true;
  }
  const v802 = buildNodeMap(v773);
  const v803 = new Map();
  for (const v804 of v773) {
    if (v804.isGroup) {
      continue;
    }
    const v805 = resolveTopLevelGroupId(v804, v802);
    if (!v805) {
      continue;
    }
    const v806 = v803.get(v805) ?? [];
    v806.push(v804);
    v803.set(v805, v806);
  }
  let v807 = 0;
  for (const v808 of v800) {
    const v809 = v808.padding ?? 0;
    if (v809 > v807) {
      v807 = v809;
    }
  }
  const v810 = [];
  let v811 = Infinity;
  let v812 = -Infinity;
  for (const v813 of v800) {
    const v814 = v803.get(v813.id) ?? [];
    const v815 = boundsForChildren(v814);
    if (!v815) {
      continue;
    }
    v811 = Math.min(v811, v815.minX);
    v812 = Math.max(v812, v815.maxX);
    v810.push({
      lane: v813,
      contentTop: v815.minY,
      contentBottom: v815.maxY,
      centerY: (v815.minY + v815.maxY) / 2
    });
  }
  if (v811 === Infinity || v812 === -Infinity) {
    return true;
  }
  const v816 = Math.max(0, v812 - v811);
  const v817 = Math.max(v807, 10);
  const v818 = v816 + v817 * 2;
  const v819 = v782 + v818;
  const v820 = (v811 + v812) / 2;
  const v821 = v820 - v818 / 2;
  const v822 = v821 - v782;
  const v823 = v822 + v819 / 2;
  const v824 = Math.max(v807, v782);
  v810.sort((v825, v826) => v825.centerY - v826.centerY);
  for (let v827 = 0; v827 < v810.length; v827++) {
    const v828 = v810[v827];
    let v829;
    let v830;
    if (v827 === 0) {
      v829 = v828.contentTop - v824;
    } else {
      const v831 = v810[v827 - 1];
      v829 = (v831.contentBottom + v828.contentTop) / 2;
    }
    if (v827 === v810.length - 1) {
      v830 = v828.contentBottom + v824;
    } else {
      const v832 = v810[v827 + 1];
      v830 = (v828.contentBottom + v832.contentTop) / 2;
    }
    const v833 = Math.max(0, v830 - v829);
    const v834 = (v829 + v830) / 2;
    v828.lane.x = v823;
    v828.lane.y = v834;
    v828.lane.width = v819;
    v828.lane.height = v833;
    v828.lane.swimlaneContentTop = v828.contentTop;
    v828.lane.groupTitleRect = {
      left: v822,
      right: v822 + v782,
      top: v829,
      bottom: v830
    };
  }
  if (v772 === "RL") {
    mirrorAxis(v771, "x");
  }
  return true;
}
v22(applyLrDirectionTransform, "applyLrDirectionTransform");
var EPS3 = 0.000001;
var MIN_PORT_SPACING = 8;
var PORT_SHIFT = MIN_PORT_SPACING;
var TRY_DELTAS = [0, PORT_SHIFT, -PORT_SHIFT, PORT_SHIFT * 2, PORT_SHIFT * -2];
function portSwapToLShape(v835, v836) {
  const {
    nodeInfoById: v837,
    realNodeRects: v838
  } = collectRealNodeBounds(v836);
  for (const v839 of v835) {
    if (v839.isLayoutOnly) {
      continue;
    }
    const v840 = v839.points;
    if (!v840 || v840.length < 4) {
      continue;
    }
    const v841 = classifyThreeSegmentRoute(dedupeConsecutivePoints(v840, EPS3), EPS3);
    if (!v841) {
      continue;
    }
    const {
      p3: v842
    } = v841;
    const v843 = v841.kind === "HVH";
    const v844 = getNodePairGeometry(v839, v837, EPS3);
    if (!v844) {
      continue;
    }
    const {
      srcId: v845,
      dstId: v846,
      srcInfo: v847,
      dstInfo: v848,
      collinearX: v849,
      collinearY: v850
    } = v844;
    if (v849 || v850) {
      continue;
    }
    let v851;
    const v852 = v847.rect;
    for (const v853 of TRY_DELTAS) {
      let v854;
      let v855;
      let v856;
      if (v843) {
        const v857 = v848.cy > v847.cy;
        const v858 = v857 ? v852.bottom : v852.top;
        const v859 = v847.cx + v853;
        if (v859 <= v852.left + EPS3 || v859 >= v852.right - EPS3) {
          continue;
        }
        v854 = {
          x: v859,
          y: v858
        };
        v855 = {
          x: v859,
          y: v842.y
        };
        v856 = {
          x: v842.x,
          y: v842.y
        };
      } else {
        const v860 = v848.cx > v847.cx;
        const v861 = v860 ? v852.right : v852.left;
        const v862 = v847.cy + v853;
        if (v862 <= v852.top + EPS3 || v862 >= v852.bottom - EPS3) {
          continue;
        }
        v854 = {
          x: v861,
          y: v862
        };
        v855 = {
          x: v842.x,
          y: v862
        };
        v856 = {
          x: v842.x,
          y: v842.y
        };
      }
      const v863 = samePoint(v854, v855, EPS3);
      const v864 = samePoint(v855, v856, EPS3);
      if (v863 && v864) {
        continue;
      }
      if (!v863 && segmentHitsAnyRect(v854, v855, v838, [v845], 1)) {
        continue;
      }
      if (!v864 && segmentHitsAnyRect(v855, v856, v838, [v846], 1)) {
        continue;
      }
      const v865 = !v863 && segmentConflictsWithAnyEdge(v854, v855, v835, v839, {
        epsilon: EPS3,
        skipDegenerateOther: true
      });
      const v866 = !v864 && segmentConflictsWithAnyEdge(v855, v856, v835, v839, {
        epsilon: EPS3,
        skipDegenerateOther: true
      });
      if (v865 || v866) {
        continue;
      }
      if (v863) {
        v851 = [v855, v856];
      } else if (v864) {
        v851 = [v854, v855];
      } else {
        v851 = [v854, v855, v856];
      }
      break;
    }
    if (v851) {
      v839.points = v851;
    }
  }
}
v22(portSwapToLShape, "portSwapToLShape");
function collapseShortTerminalStub(v867, v868) {
  const v869 = 10;
  const v870 = 0.001;
  const v871 = 2;
  const {
    realNodeRects: v872,
    labelNodeRects: v873
  } = collectNodeRectEntries(v868.values());
  for (const v874 of v867) {
    if (v874.isLayoutOnly) {
      continue;
    }
    const v875 = v874.points;
    if (!v875 || v875.length < 4) {
      continue;
    }
    const v876 = dedupeConsecutivePoints(v875, v870);
    if (v876.length < 4) {
      continue;
    }
    const v877 = v876.length - 1;
    const v878 = v876[v877];
    const v879 = v876[v877 - 1];
    const v880 = v876[v877 - 2];
    const v881 = v878.x - v879.x;
    const v882 = v878.y - v879.y;
    const v883 = Math.hypot(v881, v882);
    if (v883 >= v869 || v883 < v870) {
      continue;
    }
    const v884 = v879.x - v880.x;
    const v885 = v879.y - v880.y;
    const v886 = Math.hypot(v884, v885);
    if (v886 < v870) {
      continue;
    }
    const v887 = isHorizontalSegment(v879, v878, v870);
    const v888 = isVerticalSegment(v879, v878, v870);
    const v889 = isHorizontalSegment(v880, v879, v870);
    const v890 = isVerticalSegment(v880, v879, v870);
    if ((!v887 || !v890) && (!v888 || !v889)) {
      continue;
    }
    const v891 = v874.end;
    const v892 = v874.start;
    const v893 = v891 ? v868.get(v891) : undefined;
    if (!v893) {
      continue;
    }
    const v894 = v893.x ?? 0;
    const v895 = v893.y ?? 0;
    const v896 = rectOfNodeBounds(v893);
    if (!v896) {
      continue;
    }
    let v897;
    let v898;
    if (v890) {
      const v899 = v885 < 0;
      v897 = {
        x: v894,
        y: v880.y
      };
      v898 = {
        x: v894,
        y: v899 ? v896.bottom : v896.top
      };
    } else {
      const v900 = v884 > 0;
      v897 = {
        x: v880.x,
        y: v895
      };
      v898 = {
        x: v900 ? v896.right : v896.left,
        y: v895
      };
    }
    if (segmentHitsAnyRect(v897, v898, v872, v891 ? [v891] : [], -v871)) {
      continue;
    }
    if (segmentHitsAnyRect(v897, v898, v873, [], -v871)) {
      continue;
    }
    if (v892) {
      const v901 = v868.get(v892);
      const v902 = v901 ? rectOfNodeBounds(v901) : undefined;
      if (v902 && pointInsideRect(v897, v902, v871)) {
        continue;
      }
    }
    const v903 = v22((v904, v905) => v904.x.toFixed(3) + "," + v904.y.toFixed(3) + "|" + v905.x.toFixed(3) + "," + v905.y.toFixed(3), "ownSegmentKey");
    const v906 = new Set();
    for (let v907 = 0; v907 < v876.length - 1; v907++) {
      v906.add(v903(v876[v907], v876[v907 + 1]));
    }
    const v908 = v22((v909, v910) => {
      for (const v911 of v867) {
        if (v911 === v874) {
          continue;
        }
        if (v911.isLayoutOnly) {
          continue;
        }
        const v912 = v911.points;
        if (!v912 || v912.length < 2) {
          continue;
        }
        for (let v913 = 0; v913 < v912.length - 1; v913++) {
          const v914 = v912[v913];
          const v915 = v912[v913 + 1];
          if (v906.has(v903(v914, v915))) {
            continue;
          }
          if (orthogonalSegmentsStrictlyCross(v909, v910, v914, v915, v870)) {
            return true;
          }
        }
      }
      return false;
    }, "segmentCrossesOtherEdge");
    if (v908(v897, v898)) {
      continue;
    }
    if (v877 - 3 >= 0) {
      const v916 = v876[v877 - 3];
      const v917 = [v892, v891].filter(v918 => Boolean(v918));
      if (segmentHitsAnyRect(v916, v897, v872, v917, -v871)) {
        continue;
      }
      if (v908(v916, v897)) {
        continue;
      }
    }
    const v919 = v876.slice(0, v877 - 2);
    const v920 = [...v919, v897, v898];
    v874.points = v920;
    const v921 = v874.labelNodeId;
    if (v921) {
      const v922 = v868.get(v921);
      if (v922) {
        const v923 = v922.width ?? 0;
        const v924 = v922.height ?? 0;
        if (v923 > 0 && v924 > 0) {
          let v925;
          let v926;
          let v927 = -1;
          for (let v928 = 0; v928 < v920.length - 1; v928++) {
            const v929 = v920[v928];
            const v930 = v920[v928 + 1];
            const v931 = Math.hypot(v930.x - v929.x, v930.y - v929.y);
            const v932 = sameY(v929, v930, v870);
            const v933 = sameX(v929, v930, v870);
            const v934 = v932 && v931 >= v923 + 2 || v933 && v931 >= v924 + 2;
            if (!v934) {
              continue;
            }
            if (v931 > v927) {
              v927 = v931;
              v925 = (v929.x + v930.x) / 2;
              v926 = (v929.y + v930.y) / 2;
            }
          }
          if (v925 !== undefined && v926 !== undefined) {
            v922.x = v925;
            v922.y = v926;
          }
        }
      }
    }
  }
}
v22(collapseShortTerminalStub, "collapseShortTerminalStub");
var EPS_LOCAL = 0.001;
var MIN_SHARED = 8;
var segmentsFor = orthogonalSegmentsForPoints;
var orthogonallyAligned = v22((v935, v936) => sameX(v935, v936, EPS_LOCAL) || sameY(v935, v936, EPS_LOCAL), "orthogonallyAligned");
function separateSharedRenderedTerminalLanes(v937, v938) {
  const v939 = 16;
  const v940 = 7;
  const v941 = v22((v942, v943) => {
    const v944 = v942.x ?? 0;
    const v945 = v942.y ?? 0;
    const v946 = v943.x - v944;
    const v947 = v943.y - v945;
    let v948 = (v942.width ?? 0) / 2;
    let v949 = (v942.height ?? 0) / 2;
    if (Math.abs(v947) * v948 > Math.abs(v946) * v949) {
      if (v947 < 0) {
        v949 = -v949;
      }
      return {
        x: v944 + (v947 === 0 ? 0 : v949 * v946 / v947),
        y: v945 + v949
      };
    }
    if (v946 < 0) {
      v948 = -v948;
    }
    return {
      x: v944 + v948,
      y: v945 + (v946 === 0 ? 0 : v948 * v947 / v946)
    };
  }, "rectIntersect");
  const v950 = v22((v951, v952) => {
    const v953 = dedupeConsecutivePoints(v951.points ?? []);
    if (v953.length < 2) {
      return undefined;
    }
    const v954 = v952 ? v951.start : v951.end;
    const v955 = v954 ? v938.get(v954) : undefined;
    const v956 = v955 ? rectOfNodeBounds(v955) : undefined;
    if (!v955 || !v954 || !v956) {
      return undefined;
    }
    const v957 = v952 ? v953[0] : v953[v953.length - 1];
    const v958 = v952 ? v953[1] : v953[v953.length - 2];
    const v959 = v941(v955, v957);
    let v960 = v957;
    if (orthogonallyAligned(v958, v959)) {
      v960 = v958;
    }
    if (sameX(v959, v960, EPS_LOCAL)) {
      return {
        edge: v951,
        edgeId: String(v951.id ?? ""),
        nodeId: v954,
        atStart: v952,
        orientation: "V",
        coord: v959.x,
        min: Math.min(v959.y, v960.y),
        max: Math.max(v959.y, v960.y),
        boundary: v959,
        railEnd: v960,
        rect: v956
      };
    }
    if (sameY(v959, v960, EPS_LOCAL)) {
      return {
        edge: v951,
        edgeId: String(v951.id ?? ""),
        nodeId: v954,
        atStart: v952,
        orientation: "H",
        coord: v959.y,
        min: Math.min(v959.x, v960.x),
        max: Math.max(v959.x, v960.x),
        boundary: v959,
        railEnd: v960,
        rect: v956
      };
    }
    return undefined;
  }, "terminalLaneFor");
  const v961 = v22((v962, v963) => Math.max(0, Math.min(v962.max, v963.max) - Math.max(v962.min, v963.min)), "projectedOverlapLength");
  const v964 = v22((v965, v966) => {
    if (v965.nodeId !== v966.nodeId || v965.orientation !== v966.orientation) {
      return false;
    }
    if (v965.orientation === "H") {
      const v967 = Math.abs(v965.boundary.x - v965.rect.left) < 1 || Math.abs(v965.boundary.x - v965.rect.right) < 1;
      return v967 && sameX(v965.boundary, v966.boundary, 1);
    }
    const v968 = Math.abs(v965.boundary.y - v965.rect.top) < 1 || Math.abs(v965.boundary.y - v965.rect.bottom) < 1;
    return v968 && sameY(v965.boundary, v966.boundary, 1);
  }, "sameTerminalFace");
  const v969 = v22((v970, v971) => {
    if (v970.nodeId !== v971.nodeId || v970.orientation !== v971.orientation) {
      return false;
    }
    const v972 = v961(v970, v971);
    return v972 >= MIN_SHARED && Math.abs(v970.coord - v971.coord) < 0.5;
  }, "exactTerminalLaneConflict");
  const v973 = v22((v974, v975) => {
    if (v974.nodeId !== v975.nodeId || v974.orientation !== v975.orientation || v974.orientation !== "H" || v974.atStart === v975.atStart) {
      return false;
    }
    const v976 = v961(v974, v975);
    if (v976 < MIN_SHARED) {
      return false;
    }
    const v977 = v974.rect.bottom - v974.rect.top;
    if (v976 < v977 || v976 > v977 * 2) {
      return false;
    }
    return v964(v974, v975) && Math.abs(v974.coord - v975.coord) < v939;
  }, "nearTerminalLaneConflict");
  const v978 = v22((v979, v980) => {
    const v981 = dedupeConsecutivePoints(v979.edge.points ?? []);
    if (v981.length < 2) {
      return undefined;
    }
    const v982 = v979.orientation === "V" ? {
      x: v979.boundary.x + v980,
      y: v979.boundary.y
    } : {
      x: v979.boundary.x,
      y: v979.boundary.y + v980
    };
    const v983 = v979.orientation === "V" ? {
      x: v979.railEnd.x + v980,
      y: v979.railEnd.y
    } : {
      x: v979.railEnd.x,
      y: v979.railEnd.y + v980
    };
    const v984 = v22(() => {
      if (Math.abs(v979.boundary.y - v979.rect.top) < 1 || Math.abs(v979.boundary.y - v979.rect.bottom) < 1) {
        return sameY(v982, v979.boundary, EPS_LOCAL) && v982.x >= v979.rect.left + 1 && v982.x <= v979.rect.right - 1;
      }
      if (Math.abs(v979.boundary.x - v979.rect.left) < 1 || Math.abs(v979.boundary.x - v979.rect.right) < 1) {
        return sameX(v982, v979.boundary, EPS_LOCAL) && v982.y >= v979.rect.top + 1 && v982.y <= v979.rect.bottom - 1;
      }
      return false;
    }, "boundaryStaysOnSameFace");
    if (!v984()) {
      return undefined;
    }
    if (v979.atStart) {
      const v985 = v981.length > 1 && samePoint(v981[1], v979.railEnd, EPS_LOCAL);
      const v986 = v981.slice(v985 ? 2 : 1);
      const v987 = v986[0];
      if (v987 && !orthogonallyAligned(v987, v983)) {
        return undefined;
      }
      return [v982, v983, ...v986];
    }
    const v988 = v981.length > 1 && samePoint(v981[v981.length - 2], v979.railEnd, EPS_LOCAL);
    const v989 = v981.slice(0, v988 ? -2 : -1);
    const v990 = v989[v989.length - 1];
    if (v990 && !orthogonallyAligned(v990, v983)) {
      return undefined;
    }
    return [...v989, v983, v982];
  }, "shiftedCandidate");
  const v991 = v22(v992 => {
    const v993 = v992.edge;
    const v994 = dedupeConsecutivePoints(v993.points ?? []);
    if (v994.length !== 2) {
      return false;
    }
    const v995 = v993.start;
    const v996 = v993.end;
    const v997 = v995 ? v938.get(v995) : undefined;
    const v998 = v996 ? v938.get(v996) : undefined;
    if (!v997 || !v998) {
      return false;
    }
    const v999 = v997.x ?? 0;
    const v1000 = v997.y ?? 0;
    const v1001 = v998.x ?? 0;
    const v1002 = v998.y ?? 0;
    const [v1003, v1004] = v994;
    return sameY(v1003, v1004, EPS_LOCAL) && Math.abs(v1000 - v1002) < 1 && Math.abs(v999 - v1001) > 1 || sameX(v1003, v1004, EPS_LOCAL) && Math.abs(v999 - v1001) < 1 && Math.abs(v1000 - v1002) > 1;
  }, "laneIsStraightCollinearConnector");
  const v1005 = [-v940, v940, v940 * -2, v940 * 2, v940 * -3, v940 * 3];
  for (let v1006 = 0; v1006 < 8; v1006++) {
    const v1007 = v937.filter(v1008 => !v1008.isLayoutOnly).flatMap(v1009 => [v950(v1009, true), v950(v1009, false)]).filter(v1010 => Boolean(v1010));
    let v1011 = false;
    for (let v1012 = 0; v1012 < v1007.length && !v1011; v1012++) {
      for (let v1013 = v1012 + 1; v1013 < v1007.length && !v1011; v1013++) {
        const v1014 = v1007[v1012];
        const v1015 = v1007[v1013];
        if (v1014.edge === v1015.edge || !v969(v1014, v1015) && !v973(v1014, v1015)) {
          continue;
        }
        const v1016 = !v969(v1014, v1015);
        const v1017 = [v1014, v1015].sort((v1018, v1019) => {
          const v1020 = v991(v1018);
          const v1021 = v991(v1019);
          if (v1020 !== v1021) {
            return Number(v1020) - Number(v1021);
          }
          return Number(!v1019.atStart) - Number(!v1018.atStart);
        });
        for (const v1022 of v1017) {
          for (const v1023 of v1005) {
            const v1024 = v978(v1022, v1023);
            if (!v1024) {
              continue;
            }
            const v1025 = v950({
              ...v1022.edge,
              points: v1024
            }, v1022.atStart);
            if (!v1025 || v1007.some(v1026 => v1026.edge !== v1022.edge && (v969(v1025, v1026) || v1016 && v973(v1025, v1026)))) {
              continue;
            }
            v1022.edge.points = v1024;
            v1011 = true;
            break;
          }
          if (v1011) {
            break;
          }
        }
      }
    }
    if (!v1011) {
      return;
    }
  }
}
v22(separateSharedRenderedTerminalLanes, "separateSharedRenderedTerminalLanes");
function collapseRedundantRectangularDoglegs(v1027, v1028) {
  const v1029 = 8;
  const {
    realNodeRects: v1030,
    labelNodeRects: v1031
  } = collectNodeRectEntries(v1028.values());
  const v1032 = v22((v1033, v1034) => {
    const v1035 = v1033.start;
    const v1036 = v1033.end;
    const v1037 = segmentsFor(v1034);
    if (v1037.length !== v1034.length - 1) {
      return false;
    }
    const v1038 = [v1035, v1036].filter(v1039 => Boolean(v1039));
    for (const v1040 of v1037) {
      if (segmentHitsAnyRect(v1040.a, v1040.b, v1030, v1038, -2)) {
        return false;
      }
      if (segmentHitsAnyRect(v1040.a, v1040.b, v1031, [], -2)) {
        return false;
      }
    }
    for (const v1041 of v1027) {
      if (v1041 === v1033 || v1041.isLayoutOnly) {
        continue;
      }
      const v1042 = v1041.points;
      if (!v1042 || v1042.length < 2) {
        continue;
      }
      for (const v1043 of v1037) {
        for (const v1044 of segmentsFor(dedupeConsecutivePoints(v1042))) {
          if (sameAxisSegmentOverlapLength(v1043, v1044, 0.5) >= MIN_SHARED) {
            return false;
          }
          if (orthogonalSegmentsStrictlyCross(v1043.a, v1043.b, v1044.a, v1044.b, EPS_LOCAL)) {
            return false;
          }
        }
      }
    }
    return true;
  }, "candidateIsSafe");
  const v1045 = v22((v1046, v1047) => {
    if (v1047 + 4 >= v1046.length) {
      return undefined;
    }
    const v1048 = v1046[v1047];
    const v1049 = v1046[v1047 + 1];
    const v1050 = v1046[v1047 + 2];
    const v1051 = v1046[v1047 + 3];
    const v1052 = v1046[v1047 + 4];
    const v1053 = isHorizontalSegment(v1048, v1049) && isVerticalSegment(v1049, v1050) && isHorizontalSegment(v1050, v1051) && isVerticalSegment(v1051, v1052) && sameX(v1048, v1051, EPS_LOCAL) && sameX(v1048, v1052, EPS_LOCAL) && sameX(v1049, v1050, EPS_LOCAL) && (v1049.x - v1048.x) * (v1051.x - v1050.x) < 0;
    const v1054 = isVerticalSegment(v1048, v1049) && isHorizontalSegment(v1049, v1050) && isVerticalSegment(v1050, v1051) && isHorizontalSegment(v1051, v1052) && sameY(v1048, v1051, EPS_LOCAL) && sameY(v1048, v1052, EPS_LOCAL) && sameY(v1049, v1050, EPS_LOCAL) && (v1049.y - v1048.y) * (v1051.y - v1050.y) < 0;
    if (v1053 || v1054) {
      return dedupeConsecutivePoints([...v1046.slice(0, v1047 + 1), v1052, ...v1046.slice(v1047 + 5)]);
    }
    if (v1047 + 5 >= v1046.length) {
      return undefined;
    }
    const v1055 = v1046[v1047 + 5];
    const v1056 = isVerticalSegment(v1048, v1049) && isHorizontalSegment(v1049, v1050) && isVerticalSegment(v1050, v1051) && isHorizontalSegment(v1051, v1052) && isVerticalSegment(v1052, v1055) && sameX(v1048, v1052, EPS_LOCAL) && sameX(v1048, v1055, EPS_LOCAL) && sameX(v1050, v1051, EPS_LOCAL) && (v1050.x - v1049.x) * (v1052.x - v1051.x) < 0;
    const v1057 = isHorizontalSegment(v1048, v1049) && isVerticalSegment(v1049, v1050) && isHorizontalSegment(v1050, v1051) && isVerticalSegment(v1051, v1052) && isHorizontalSegment(v1052, v1055) && sameY(v1048, v1052, EPS_LOCAL) && sameY(v1048, v1055, EPS_LOCAL) && sameY(v1050, v1051, EPS_LOCAL) && (v1050.y - v1049.y) * (v1052.y - v1051.y) < 0;
    if (!v1056 && !v1057) {
      return undefined;
    }
    return dedupeConsecutivePoints([...v1046.slice(0, v1047 + 1), v1055, ...v1046.slice(v1047 + 6)]);
  }, "withoutDogleg");
  for (let v1058 = 0; v1058 < v1029; v1058++) {
    let v1059 = false;
    for (const v1060 of v1027) {
      if (v1060.isLayoutOnly) {
        continue;
      }
      const v1061 = dedupeConsecutivePoints(v1060.points ?? []);
      for (let v1062 = 0; v1062 <= v1061.length - 5; v1062++) {
        const v1063 = v1045(v1061, v1062);
        if (!v1063 || !v1032(v1060, v1063)) {
          continue;
        }
        v1060.points = v1063;
        v1059 = true;
        break;
      }
      if (v1059) {
        break;
      }
    }
    if (!v1059) {
      return;
    }
  }
}
v22(collapseRedundantRectangularDoglegs, "collapseRedundantRectangularDoglegs");
function liftObstacleHuggingSameSideRails(v1064, v1065) {
  const v1066 = 2;
  const v1067 = 20;
  const v1068 = 8;
  const {
    realNodeRects: v1069,
    labelNodeRects: v1070
  } = collectNodeRectEntries(v1065.values());
  const v1071 = v1064.filter(v1072 => !v1072.isLayoutOnly);
  const v1073 = v22((v1074, v1075, v1076) => dedupeConsecutivePoints(v1074 === v1075 ? v1076 ?? [] : v1074.points ?? []), "pointsFor");
  const v1077 = v22((v1078, v1079) => {
    let v1080 = 0;
    for (let v1081 = 0; v1081 < v1071.length; v1081++) {
      const v1082 = segmentsFor(v1073(v1071[v1081], v1078, v1079));
      for (let v1083 = v1081 + 1; v1083 < v1071.length; v1083++) {
        const v1084 = segmentsFor(v1073(v1071[v1083], v1078, v1079));
        for (const v1085 of v1082) {
          for (const v1086 of v1084) {
            if (orthogonalSegmentsStrictlyCross(v1085.a, v1085.b, v1086.a, v1086.b, EPS_LOCAL)) {
              v1080++;
            }
          }
        }
      }
    }
    return v1080;
  }, "strictCrossingCount");
  const v1087 = v22(v1088 => {
    const v1089 = segmentsFor(v1088);
    if (v1089.length !== 3) {
      return undefined;
    }
    const v1090 = v1089[1];
    if (v1089[0].horizontal === v1090.horizontal || v1089[2].horizontal === v1090.horizontal) {
      return undefined;
    }
    return {
      index: v1090.index,
      horizontal: v1090.horizontal,
      vertical: v1090.vertical,
      segment: v1090
    };
  }, "middleRail");
  const v1091 = v22((v1092, v1093) => {
    const v1094 = [v1092.start, v1092.end].filter(v1095 => Boolean(v1095));
    return v1069.filter(v1096 => {
      if (v1094.includes(v1096.id)) {
        return false;
      }
      const v1097 = v1096.rect;
      if (v1093.horizontal) {
        const v1098 = overlapLength(v1093.a.x, v1093.b.x, v1097.left, v1097.right);
        return v1098 >= MIN_SHARED && v1093.a.y >= v1097.top - v1066 && v1093.a.y <= v1097.bottom + v1066;
      }
      const v1099 = overlapLength(v1093.a.y, v1093.b.y, v1097.top, v1097.bottom);
      return v1099 >= MIN_SHARED && v1093.a.x >= v1097.left - v1066 && v1093.a.x <= v1097.right + v1066;
    });
  }, "blockingRectsFor");
  const v1100 = v22((v1101, v1102, v1103) => {
    const v1104 = v1101.map(v1105 => ({
      ...v1105
    }));
    if (v1102.horizontal) {
      v1104[v1102.index].y = v1103;
      v1104[v1102.index + 1].y = v1103;
    } else if (v1102.vertical) {
      v1104[v1102.index].x = v1103;
      v1104[v1102.index + 1].x = v1103;
    } else {
      return undefined;
    }
    const v1106 = simplifyPolyline(dedupeConsecutivePoints(v1104));
    if (segmentsFor(v1106).length === v1106.length - 1) {
      return v1106;
    } else {
      return undefined;
    }
  }, "candidateByMovingRail");
  const v1107 = v22((v1108, v1109, v1110) => {
    const v1111 = [v1108.start, v1108.end].filter(v1112 => Boolean(v1112));
    const v1113 = segmentsFor(v1109);
    if (v1113.length !== v1109.length - 1) {
      return false;
    }
    for (const v1114 of v1113) {
      if (segmentHitsAnyRect(v1114.a, v1114.b, v1069, v1111, -v1066)) {
        return false;
      }
      if (segmentHitsAnyRect(v1114.a, v1114.b, v1070, [], -v1066)) {
        return false;
      }
    }
    for (const v1115 of v1071) {
      if (v1115 === v1108) {
        continue;
      }
      for (const v1116 of v1113) {
        for (const v1117 of segmentsFor(v1073(v1115))) {
          if (sameAxisSegmentOverlapLength(v1116, v1117, 0.5) >= MIN_SHARED) {
            return false;
          }
        }
      }
    }
    return v1077(v1108, v1109) <= v1110;
  }, "candidateIsSafe");
  for (let v1118 = 0; v1118 < v1068; v1118++) {
    const v1119 = v1077();
    let v1120 = false;
    for (const v1121 of v1071) {
      const v1122 = v1073(v1121);
      const v1123 = v1087(v1122);
      if (!v1123) {
        continue;
      }
      const v1124 = v1091(v1121, v1123.segment);
      if (v1124.length === 0) {
        continue;
      }
      const v1125 = v1123.horizontal ? [Math.min(...v1124.map(v1126 => v1126.rect.top)) - v1067, Math.max(...v1124.map(v1127 => v1127.rect.bottom)) + v1067] : [Math.min(...v1124.map(v1128 => v1128.rect.left)) - v1067, Math.max(...v1124.map(v1129 => v1129.rect.right)) + v1067];
      for (const v1130 of v1125) {
        const v1131 = v1100(v1122, v1123.segment, v1130);
        if (!v1131 || !v1107(v1121, v1131, v1119)) {
          continue;
        }
        v1121.points = v1131;
        v1120 = true;
        break;
      }
      if (v1120) {
        break;
      }
    }
    if (!v1120) {
      return;
    }
  }
}
v22(liftObstacleHuggingSameSideRails, "liftObstacleHuggingSameSideRails");
function liftTopLaneTitleBandsAboveRails(v1132, v1133) {
  const v1134 = 4;
  const v1135 = v22(v1136 => {
    const v1137 = v1136.groupTitleRect;
    if (!v1137 || typeof v1137.left !== "number" || typeof v1137.right !== "number" || typeof v1137.top !== "number" || typeof v1137.bottom !== "number" || !Number.isFinite(v1137.left) || !Number.isFinite(v1137.right) || !Number.isFinite(v1137.top) || !Number.isFinite(v1137.bottom) || v1137.right <= v1137.left || v1137.bottom <= v1137.top) {
      return undefined;
    }
    return {
      left: v1137.left,
      right: v1137.right,
      top: v1137.top,
      bottom: v1137.bottom
    };
  }, "validTitleRect");
  const v1138 = v22(v1139 => {
    if (!v1139.isGroup || v1139.parentId) {
      return undefined;
    }
    const v1140 = v1139.direction;
    const v1141 = typeof v1140 === "string" ? v1140.toUpperCase() : "";
    if (v1141 === "LR" || v1141 === "RL" || v1141 === "BT") {
      return undefined;
    }
    const v1142 = v1135(v1139);
    const v1143 = v1139.y;
    const v1144 = v1139.height;
    if (!v1142 || typeof v1143 !== "number" || typeof v1144 !== "number" || !Number.isFinite(v1143) || !Number.isFinite(v1144) || v1144 <= 0) {
      return undefined;
    }
    const v1145 = v1142.right - v1142.left;
    const v1146 = v1142.bottom - v1142.top;
    if (v1146 <= 0 || v1145 < v1146) {
      return undefined;
    }
    return {
      node: v1139,
      rect: v1142
    };
  }, "topLaneTitleFor");
  const v1147 = v22((v1148, v1149) => {
    if (!v1148.horizontal) {
      return false;
    }
    const v1150 = v1148.a.y;
    if (v1150 <= v1149.top + EPS_LOCAL || v1150 >= v1149.bottom - EPS_LOCAL) {
      return false;
    }
    return overlapLength(v1148.a.x, v1148.b.x, v1149.left, v1149.right) >= MIN_SHARED;
  }, "horizontalSegmentIntersectsTitle");
  const v1151 = [...v1133.values()].map(v1138).filter(v1152 => Boolean(v1152));
  if (v1151.length === 0) {
    return;
  }
  let v1153 = 0;
  for (const v1154 of v1132) {
    if (v1154.isLayoutOnly) {
      continue;
    }
    const v1155 = dedupeConsecutivePoints(v1154.points ?? []);
    for (const v1156 of segmentsFor(v1155)) {
      for (const v1157 of v1151) {
        if (!v1147(v1156, v1157.rect)) {
          continue;
        }
        v1153 = Math.max(v1153, v1157.rect.bottom - v1156.a.y + v1134);
      }
    }
  }
  if (v1153 <= EPS_LOCAL) {
    return;
  }
  for (const v1158 of v1151) {
    const v1159 = v1158.node.y;
    const v1160 = v1158.node.height;
    if (typeof v1159 !== "number" || typeof v1160 !== "number" || !Number.isFinite(v1159) || !Number.isFinite(v1160) || v1160 <= 0) {
      continue;
    }
    v1158.node.y = v1159 - v1153 / 2;
    v1158.node.height = v1160 + v1153;
    v1158.node.groupTitleRect = {
      ...v1158.rect,
      top: v1158.rect.top - v1153,
      bottom: v1158.rect.bottom - v1153
    };
  }
}
v22(liftTopLaneTitleBandsAboveRails, "liftTopLaneTitleBandsAboveRails");
function shiftLeftLaneTitleBandsLeftOfRails(v1161, v1162) {
  const v1163 = 4;
  const v1164 = v22(v1165 => {
    const v1166 = v1165.groupTitleRect;
    if (!v1166 || typeof v1166.left !== "number" || typeof v1166.right !== "number" || typeof v1166.top !== "number" || typeof v1166.bottom !== "number" || !Number.isFinite(v1166.left) || !Number.isFinite(v1166.right) || !Number.isFinite(v1166.top) || !Number.isFinite(v1166.bottom) || v1166.right <= v1166.left || v1166.bottom <= v1166.top) {
      return undefined;
    }
    return {
      left: v1166.left,
      right: v1166.right,
      top: v1166.top,
      bottom: v1166.bottom
    };
  }, "validTitleRect");
  const v1167 = v22(v1168 => {
    if (!v1168.isGroup || v1168.parentId) {
      return undefined;
    }
    const v1169 = v1168.direction;
    if (v1169 !== "LR") {
      return undefined;
    }
    const v1170 = v1164(v1168);
    const v1171 = v1168.x;
    const v1172 = v1168.width;
    if (!v1170 || typeof v1171 !== "number" || typeof v1172 !== "number" || !Number.isFinite(v1171) || !Number.isFinite(v1172) || v1172 <= 0) {
      return undefined;
    }
    const v1173 = v1170.right - v1170.left;
    const v1174 = v1170.bottom - v1170.top;
    if (v1173 <= 0 || v1174 < v1173) {
      return undefined;
    }
    return {
      node: v1168,
      rect: v1170
    };
  }, "leftLaneTitleFor");
  const v1175 = v22((v1176, v1177) => {
    if (!v1176.vertical) {
      return false;
    }
    const v1178 = v1176.a.x;
    if (v1178 <= v1177.left + EPS_LOCAL || v1178 >= v1177.right - EPS_LOCAL) {
      return false;
    }
    return overlapLength(v1176.a.y, v1176.b.y, v1177.top, v1177.bottom) >= MIN_SHARED;
  }, "verticalSegmentIntersectsTitle");
  const v1179 = v22((v1180, v1181) => {
    if (!v1180.horizontal) {
      return false;
    }
    const v1182 = v1180.a.y;
    if (v1182 <= v1181.top + EPS_LOCAL || v1182 >= v1181.bottom - EPS_LOCAL) {
      return false;
    }
    return overlapLength(v1180.a.x, v1180.b.x, v1181.left, v1181.right) >= MIN_SHARED;
  }, "horizontalSegmentIntersectsTitle");
  const v1183 = [...v1162.values()].map(v1167).filter(v1184 => Boolean(v1184));
  if (v1183.length === 0) {
    return;
  }
  let v1185 = 0;
  for (const v1186 of v1161) {
    if (v1186.isLayoutOnly) {
      continue;
    }
    const v1187 = dedupeConsecutivePoints(v1186.points ?? []);
    for (const v1188 of segmentsFor(v1187)) {
      for (const v1189 of v1183) {
        if (v1175(v1188, v1189.rect)) {
          v1185 = Math.max(v1185, v1189.rect.right - v1188.a.x + v1163);
        } else if (v1179(v1188, v1189.rect)) {
          const v1190 = Math.min(v1188.a.x, v1188.b.x);
          v1185 = Math.max(v1185, v1189.rect.right - v1190 + v1163);
        }
      }
    }
  }
  if (v1185 <= EPS_LOCAL) {
    return;
  }
  for (const v1191 of v1183) {
    const v1192 = v1191.node.x;
    const v1193 = v1191.node.width;
    if (typeof v1192 !== "number" || typeof v1193 !== "number" || !Number.isFinite(v1192) || !Number.isFinite(v1193) || v1193 <= 0) {
      continue;
    }
    v1191.node.x = v1192 - v1185 / 2;
    v1191.node.width = v1193 + v1185;
    v1191.node.groupTitleRect = {
      ...v1191.rect,
      left: v1191.rect.left - v1185,
      right: v1191.rect.right - v1185
    };
  }
}
v22(shiftLeftLaneTitleBandsLeftOfRails, "shiftLeftLaneTitleBandsLeftOfRails");
function swapDestinationTerminalTailsToReduceCrossings(v1194, v1195) {
  const v1196 = 4;
  const {
    realNodeRects: v1197
  } = collectNodeRectEntries(v1195.values());
  const v1198 = v1194.filter(v1199 => !v1199.isLayoutOnly);
  const v1200 = v22((v1201, v1202 = new Map()) => dedupeConsecutivePoints(v1202.get(v1201) ?? v1201.points ?? []), "replacementPointsFor");
  const v1203 = v22((v1204 = new Map()) => {
    let v1205 = 0;
    for (let v1206 = 0; v1206 < v1198.length; v1206++) {
      const v1207 = segmentsFor(v1200(v1198[v1206], v1204));
      for (let v1208 = v1206 + 1; v1208 < v1198.length; v1208++) {
        const v1209 = segmentsFor(v1200(v1198[v1208], v1204));
        for (const v1210 of v1207) {
          for (const v1211 of v1209) {
            if (orthogonalSegmentsStrictlyCross(v1210.a, v1210.b, v1211.a, v1211.b, EPS_LOCAL)) {
              v1205++;
            }
          }
        }
      }
    }
    return v1205;
  }, "crossingCount");
  const v1212 = v22((v1213 = new Map()) => v1198.reduce((v1214, v1215) => v1214 + countOrthogonalBends(v1200(v1215, v1213)), 0), "totalBends");
  const v1216 = v22(v1217 => {
    const v1218 = v1200(v1217);
    if (v1218.length < 4) {
      return undefined;
    }
    const v1219 = v1218[v1218.length - 2];
    const v1220 = v1218[v1218.length - 1];
    if (!isHorizontalSegment(v1219, v1220, EPS_LOCAL) && !isVerticalSegment(v1219, v1220, EPS_LOCAL)) {
      return undefined;
    }
    return {
      tailStart: v1219,
      terminal: v1220
    };
  }, "terminalTailFor");
  const v1221 = v22((v1222, v1223) => {
    const v1224 = v1200(v1222);
    if (v1224.length < 3) {
      return undefined;
    }
    const v1225 = v1224[0];
    const v1226 = v1224[1];
    let v1227;
    if (isHorizontalSegment(v1225, v1226, EPS_LOCAL)) {
      v1227 = {
        x: v1226.x,
        y: v1223.tailStart.y
      };
    } else if (isVerticalSegment(v1225, v1226, EPS_LOCAL)) {
      v1227 = {
        x: v1223.tailStart.x,
        y: v1226.y
      };
    } else {
      return undefined;
    }
    const v1228 = simplifyPolyline(dedupeConsecutivePoints([v1225, v1226, v1227, v1223.tailStart, v1223.terminal]));
    if (segmentsFor(v1228).length === v1228.length - 1) {
      return v1228;
    } else {
      return undefined;
    }
  }, "candidateWithDestinationTail");
  const v1229 = v22((v1230, v1231) => {
    const v1232 = [v1230.start, v1230.end].filter(v1233 => Boolean(v1233));
    for (const v1234 of segmentsFor(v1231)) {
      if (segmentHitsAnyRect(v1234.a, v1234.b, v1197, v1232, -2)) {
        return true;
      }
    }
    return false;
  }, "pathHasNodeHit");
  const v1235 = v22((v1236, v1237, v1238) => {
    for (const v1239 of v1198) {
      if (v1239 === v1236) {
        continue;
      }
      for (const v1240 of segmentsFor(v1237)) {
        for (const v1241 of segmentsFor(v1200(v1239, v1238))) {
          if (sameAxisSegmentOverlapLength(v1240, v1241, 0.5) >= MIN_SHARED) {
            return true;
          }
        }
      }
    }
    return false;
  }, "pathHasSharedTrack");
  const v1242 = v22((v1243, v1244, v1245) => !v1229(v1243, v1244) && !v1235(v1243, v1244, v1245), "candidateIsSafe");
  const v1246 = v22(() => {
    const v1247 = new Map();
    for (const v1248 of v1198) {
      const v1249 = v1248.end;
      if (!v1249 || !v1195.has(v1249)) {
        continue;
      }
      const v1250 = v1200(v1248);
      if (v1250.length < 4) {
        continue;
      }
      const v1251 = v1247.get(v1249) ?? [];
      v1251.push(v1248);
      v1247.set(v1249, v1251);
    }
    return v1247;
  }, "edgesByDestination");
  for (let v1252 = 0; v1252 < v1196; v1252++) {
    const v1253 = v1203();
    if (v1253 === 0) {
      return;
    }
    const v1254 = v1212();
    let v1255;
    let v1256 = v1253;
    let v1257 = v1254;
    for (const v1258 of v1246().values()) {
      for (let v1259 = 0; v1259 < v1258.length; v1259++) {
        for (let v1260 = v1259 + 1; v1260 < v1258.length; v1260++) {
          const v1261 = v1258[v1259];
          const v1262 = v1258[v1260];
          const v1263 = v1216(v1261);
          const v1264 = v1216(v1262);
          if (!v1263 || !v1264) {
            continue;
          }
          const v1265 = v1221(v1261, v1264);
          const v1266 = v1221(v1262, v1263);
          if (!v1265 || !v1266) {
            continue;
          }
          const v1267 = new Map([[v1261, v1265], [v1262, v1266]]);
          if (!v1242(v1261, v1265, v1267) || !v1242(v1262, v1266, v1267)) {
            continue;
          }
          const v1268 = v1203(v1267);
          const v1269 = v1212(v1267);
          if (v1268 >= v1253) {
            continue;
          }
          if (v1268 > v1256 || v1268 === v1256 && v1269 >= v1257) {
            continue;
          }
          v1255 = v1267;
          v1256 = v1268;
          v1257 = v1269;
        }
      }
    }
    if (!v1255) {
      return;
    }
    for (const [v1270, v1271] of v1255) {
      v1270.points = v1271;
    }
  }
}
v22(swapDestinationTerminalTailsToReduceCrossings, "swapDestinationTerminalTailsToReduceCrossings");
function reassignCrossingExternalRailChannels(v1272, v1273) {
  const v1274 = 12;
  const v1275 = 4;
  const v1276 = 6;
  const {
    realNodeRects: v1277,
    labelNodeRects: v1278
  } = collectNodeRectEntries(v1273.values());
  const v1279 = v1272.filter(v1280 => !v1280.isLayoutOnly);
  const v1281 = v22((v1282, v1283 = new Map()) => dedupeConsecutivePoints(v1283.get(v1282) ?? v1282.points ?? []), "replacementPointsFor");
  const v1284 = v22((v1285 = new Map()) => {
    let v1286 = 0;
    for (let v1287 = 0; v1287 < v1279.length; v1287++) {
      const v1288 = segmentsFor(v1281(v1279[v1287], v1285));
      for (let v1289 = v1287 + 1; v1289 < v1279.length; v1289++) {
        const v1290 = segmentsFor(v1281(v1279[v1289], v1285));
        for (const v1291 of v1288) {
          for (const v1292 of v1290) {
            if (orthogonalSegmentsStrictlyCross(v1291.a, v1291.b, v1292.a, v1292.b, EPS_LOCAL)) {
              v1286++;
            }
          }
        }
      }
    }
    return v1286;
  }, "strictCrossingCount");
  const v1293 = v22((v1294 = new Map()) => v1279.reduce((v1295, v1296) => v1295 + countOrthogonalBends(v1281(v1296, v1294)), 0), "totalBends");
  const v1297 = v22(v1298 => {
    const v1299 = v1298.start;
    const v1300 = v1298.end;
    const v1301 = v1299 ? v1273.get(v1299) : undefined;
    const v1302 = v1300 ? v1273.get(v1300) : undefined;
    const v1303 = v1301 ? rectOfNodeBounds(v1301) : undefined;
    const v1304 = v1302 ? rectOfNodeBounds(v1302) : undefined;
    if (v1303 && v1304) {
      return {
        src: v1303,
        dst: v1304
      };
    } else {
      return undefined;
    }
  }, "endpointRectsFor");
  const v1305 = v22((v1306, v1307, v1308) => {
    if (v1308.index <= 0 || v1308.index + 1 >= v1307.length - 1) {
      return undefined;
    }
    const v1309 = v1297(v1306);
    if (!v1309) {
      return undefined;
    }
    if (v1308.vertical) {
      const v1310 = v1308.a.x;
      const v1311 = Math.min(v1309.src.left, v1309.dst.left);
      const v1312 = Math.max(v1309.src.right, v1309.dst.right);
      const v1313 = v1310 < v1311 - EPS_LOCAL ? "left" : v1310 > v1312 + EPS_LOCAL ? "right" : undefined;
      if (!v1313) {
        return undefined;
      }
      return {
        edge: v1306,
        points: v1307,
        segmentIndex: v1308.index,
        axis: "vertical",
        side: v1313,
        coord: v1310,
        min: Math.min(v1308.a.y, v1308.b.y),
        max: Math.max(v1308.a.y, v1308.b.y)
      };
    }
    if (v1308.horizontal) {
      const v1314 = v1308.a.y;
      const v1315 = Math.min(v1309.src.top, v1309.dst.top);
      const v1316 = Math.max(v1309.src.bottom, v1309.dst.bottom);
      const v1317 = v1314 < v1315 - EPS_LOCAL ? "top" : v1314 > v1316 + EPS_LOCAL ? "bottom" : undefined;
      if (!v1317) {
        return undefined;
      }
      return {
        edge: v1306,
        points: v1307,
        segmentIndex: v1308.index,
        axis: "horizontal",
        side: v1317,
        coord: v1314,
        min: Math.min(v1308.a.x, v1308.b.x),
        max: Math.max(v1308.a.x, v1308.b.x)
      };
    }
    return undefined;
  }, "externalRailForSegment");
  const v1318 = v22(() => {
    const v1319 = [];
    for (const v1320 of v1279) {
      const v1321 = v1281(v1320);
      for (const v1322 of segmentsFor(v1321)) {
        const v1323 = v1305(v1320, v1321, v1322);
        if (v1323) {
          v1319.push(v1323);
        }
      }
    }
    return v1319;
  }, "collectExternalRails");
  const v1324 = v22((v1325, v1326) => v1325.edge !== v1326.edge && v1325.axis === v1326.axis && v1325.side === v1326.side && overlapLength(v1325.min, v1325.max, v1326.min, v1326.max) >= MIN_SHARED, "railsInteract");
  const v1327 = v22(v1328 => {
    const v1329 = [];
    const v1330 = new Set();
    for (const v1331 of v1328) {
      if (v1330.has(v1331)) {
        continue;
      }
      const v1332 = [v1331];
      const v1333 = [];
      v1330.add(v1331);
      while (v1332.length > 0) {
        const v1334 = v1332.pop();
        v1333.push(v1334);
        for (const v1335 of v1328) {
          if (!v1330.has(v1335) && v1324(v1334, v1335)) {
            v1330.add(v1335);
            v1332.push(v1335);
          }
        }
      }
      if (v1333.length > 1) {
        v1329.push(v1333);
      }
    }
    return v1329;
  }, "connectedComponents");
  const v1336 = v22(v1337 => {
    const v1338 = [];
    for (const v1339 of v1337) {
      if (!v1338.some(v1340 => Math.abs(v1340 - v1339.coord) < EPS_LOCAL)) {
        v1338.push(v1339.coord);
      }
    }
    while (v1338.length < v1337.length) {
      const v1341 = Math.min(...v1338);
      const v1342 = Math.max(...v1338);
      const v1343 = v1337[0].side;
      v1338.push(v1343 === "left" || v1343 === "top" ? v1341 - v1274 * (v1337.length - v1338.length) : v1342 + v1274 * (v1337.length - v1338.length));
    }
    return v1338;
  }, "uniqueCoordsFor");
  const v1344 = v22(v1345 => {
    const v1346 = v1345.map(v1347 => v1347.coord);
    const v1348 = v1336(v1345);
    const v1349 = [];
    if (v1345.length <= v1276) {
      const v1350 = new Array(v1348.length).fill(false);
      const v1351 = [];
      const v1352 = v22(() => {
        if (v1351.length === v1345.length) {
          if (v1351.some((v1353, v1354) => Math.abs(v1353 - v1346[v1354]) >= EPS_LOCAL)) {
            v1349.push([...v1351]);
          }
          return;
        }
        for (const [v1355, v1356] of v1348.entries()) {
          if (v1350[v1355]) {
            continue;
          }
          v1350[v1355] = true;
          v1351.push(v1356);
          v1352();
          v1351.pop();
          v1350[v1355] = false;
        }
      }, "visit");
      v1352();
      return v1349;
    }
    for (let v1357 = 0; v1357 < v1346.length; v1357++) {
      for (let v1358 = v1357 + 1; v1358 < v1346.length; v1358++) {
        const v1359 = [...v1346];
        [v1359[v1357], v1359[v1358]] = [v1359[v1358], v1359[v1357]];
        v1349.push(v1359);
      }
    }
    return v1349;
  }, "coordinateAssignmentsFor");
  const v1360 = v22((v1361, v1362) => {
    const v1363 = new Map();
    for (const [v1364, v1365] of v1361.entries()) {
      const v1366 = v1362[v1364];
      const v1367 = v1363.get(v1365.edge) ?? v1365.points.map(v1368 => ({
        x: v1368.x,
        y: v1368.y
      }));
      if (v1365.axis === "vertical") {
        v1367[v1365.segmentIndex].x = v1366;
        v1367[v1365.segmentIndex + 1].x = v1366;
      } else {
        v1367[v1365.segmentIndex].y = v1366;
        v1367[v1365.segmentIndex + 1].y = v1366;
      }
      v1363.set(v1365.edge, v1367);
    }
    const v1369 = new Map();
    for (const [v1370, v1371] of v1363) {
      const v1372 = simplifyPolyline(dedupeConsecutivePoints(v1371));
      if (segmentsFor(v1372).length !== v1372.length - 1) {
        return undefined;
      }
      v1369.set(v1370, v1372);
    }
    return v1369;
  }, "replacementsForAssignment");
  const v1373 = v22(v1374 => {
    for (const [v1375, v1376] of v1374) {
      const v1377 = [v1375.start, v1375.end].filter(v1378 => Boolean(v1378));
      for (const v1379 of segmentsFor(v1376)) {
        if (segmentHitsAnyRect(v1379.a, v1379.b, v1277, v1377, -2)) {
          return false;
        }
        if (segmentHitsAnyRect(v1379.a, v1379.b, v1278, [], -2)) {
          return false;
        }
      }
    }
    for (let v1380 = 0; v1380 < v1279.length; v1380++) {
      const v1381 = v1279[v1380];
      const v1382 = v1374.has(v1381);
      const v1383 = segmentsFor(v1281(v1381, v1374));
      for (let v1384 = v1380 + 1; v1384 < v1279.length; v1384++) {
        const v1385 = v1279[v1384];
        if (!v1382 && !v1374.has(v1385)) {
          continue;
        }
        const v1386 = segmentsFor(v1281(v1385, v1374));
        for (const v1387 of v1383) {
          for (const v1388 of v1386) {
            if (sameAxisSegmentOverlapLength(v1387, v1388, 0.5) >= MIN_SHARED) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }, "candidateIsSafe");
  for (let v1389 = 0; v1389 < v1275; v1389++) {
    const v1390 = v1284();
    if (v1390 === 0) {
      return;
    }
    let v1391;
    let v1392 = v1390;
    let v1393 = v1293();
    let v1394 = Number.POSITIVE_INFINITY;
    for (const v1395 of v1327(v1318())) {
      for (const v1396 of v1344(v1395)) {
        const v1397 = v1360(v1395, v1396);
        if (!v1397 || !v1373(v1397)) {
          continue;
        }
        const v1398 = v1284(v1397);
        if (v1398 >= v1390) {
          continue;
        }
        const v1399 = v1293(v1397);
        const v1400 = v1395.reduce((v1401, v1402, v1403) => v1401 + Math.abs(v1396[v1403] - v1402.coord), 0);
        if (v1398 > v1392 || v1398 === v1392 && (v1399 > v1393 || v1399 === v1393 && v1400 >= v1394)) {
          continue;
        }
        v1391 = v1397;
        v1392 = v1398;
        v1393 = v1399;
        v1394 = v1400;
      }
    }
    if (!v1391) {
      return;
    }
    for (const [v1404, v1405] of v1391) {
      v1404.points = v1405;
    }
  }
}
v22(reassignCrossingExternalRailChannels, "reassignCrossingExternalRailChannels");
function shortcutRedundantOrthogonalJogs(v1406, v1407) {
  const v1408 = 8;
  const {
    realNodeRects: v1409,
    labelNodeRects: v1410
  } = collectNodeRectEntries(v1407.values());
  const v1411 = v1406.filter(v1412 => !v1412.isLayoutOnly);
  const v1413 = v22((v1414, v1415, v1416) => dedupeConsecutivePoints(v1414 === v1415 ? v1416 ?? [] : v1414.points ?? []), "pointsFor");
  const v1417 = v22(v1418 => segmentsFor(v1418).reduce((v1419, v1420) => {
    const v1421 = v1420.a.x - v1420.b.x;
    const v1422 = v1420.a.y - v1420.b.y;
    return v1419 + Math.hypot(v1421, v1422);
  }, 0), "pathLength");
  const v1423 = v22((v1424, v1425) => {
    let v1426 = 0;
    for (let v1427 = 0; v1427 < v1411.length; v1427++) {
      const v1428 = segmentsFor(v1413(v1411[v1427], v1424, v1425));
      for (let v1429 = v1427 + 1; v1429 < v1411.length; v1429++) {
        const v1430 = segmentsFor(v1413(v1411[v1429], v1424, v1425));
        for (const v1431 of v1428) {
          for (const v1432 of v1430) {
            if (orthogonalSegmentsStrictlyCross(v1431.a, v1431.b, v1432.a, v1432.b, EPS_LOCAL)) {
              v1426++;
            }
          }
        }
      }
    }
    return v1426;
  }, "strictCrossingCount");
  const v1433 = v22((v1434, v1435) => {
    if (v1434.horizontal) {
      const v1436 = v1434.a.y;
      const v1437 = Math.abs(v1436 - v1435.top) < 1 || Math.abs(v1436 - v1435.bottom) < 1;
      return v1437 && overlapLength(v1434.a.x, v1434.b.x, v1435.left, v1435.right) >= MIN_SHARED;
    }
    if (v1434.vertical) {
      const v1438 = v1434.a.x;
      const v1439 = Math.abs(v1438 - v1435.left) < 1 || Math.abs(v1438 - v1435.right) < 1;
      return v1439 && overlapLength(v1434.a.y, v1434.b.y, v1435.top, v1435.bottom) >= MIN_SHARED;
    }
    return false;
  }, "segmentRunsAlongRectBorder");
  const v1440 = v22(v1441 => {
    const v1442 = [v1441.start, v1441.end].filter(v1443 => Boolean(v1443));
    const v1444 = [];
    for (const v1445 of v1442) {
      const v1446 = v1407.get(v1445);
      const v1447 = v1446 ? rectOfNodeBounds(v1446) : undefined;
      if (v1447) {
        v1444.push(v1447);
      }
    }
    return v1444;
  }, "endpointRectsFor");
  const v1448 = v22((v1449, v1450) => {
    if (v1450 + 3 >= v1449.length) {
      return [];
    }
    const v1451 = v1449[v1450];
    const v1452 = v1449[v1450 + 1];
    const v1453 = v1449[v1450 + 2];
    const v1454 = v1449[v1450 + 3];
    const v1455 = isHorizontalSegment(v1451, v1452, EPS_LOCAL) && isVerticalSegment(v1452, v1453, EPS_LOCAL) && isHorizontalSegment(v1453, v1454, EPS_LOCAL);
    const v1456 = isVerticalSegment(v1451, v1452, EPS_LOCAL) && isHorizontalSegment(v1452, v1453, EPS_LOCAL) && isVerticalSegment(v1453, v1454, EPS_LOCAL);
    if (!v1455 && !v1456) {
      return [];
    }
    const v1457 = v1455 ? Math.sign(v1452.x - v1451.x) !== Math.sign(v1454.x - v1453.x) : Math.sign(v1452.y - v1451.y) !== Math.sign(v1454.y - v1453.y);
    if (!v1457) {
      return [];
    }
    const v1458 = sameX(v1451, v1454, EPS_LOCAL) || sameY(v1451, v1454, EPS_LOCAL) ? [] : [{
      x: v1451.x,
      y: v1454.y
    }, {
      x: v1454.x,
      y: v1451.y
    }];
    const v1459 = v1458.length === 0 ? [[...v1449.slice(0, v1450 + 1), ...v1449.slice(v1450 + 3)]] : v1458.map(v1460 => [...v1449.slice(0, v1450 + 1), v1460, ...v1449.slice(v1450 + 3)]);
    const v1461 = new Set();
    return v1459.map(v1462 => simplifyPolyline(dedupeConsecutivePoints(v1462))).filter(v1463 => {
      if (segmentsFor(v1463).length !== v1463.length - 1) {
        return false;
      }
      if (!v1463.some(v1464 => samePoint(v1464, v1454, EPS_LOCAL))) {
        return false;
      }
      const v1465 = v1463.map(v1466 => v1466.x.toFixed(3) + "," + v1466.y.toFixed(3)).join("|");
      if (v1461.has(v1465)) {
        return false;
      }
      v1461.add(v1465);
      return true;
    });
  }, "shortcutCandidatesAt");
  const v1467 = v22((v1468, v1469, v1470) => {
    const v1471 = [v1468.start, v1468.end].filter(v1472 => Boolean(v1472));
    const v1473 = v1440(v1468);
    for (const v1474 of segmentsFor(v1469)) {
      if (segmentHitsAnyRect(v1474.a, v1474.b, v1409, v1471, -2)) {
        return false;
      }
      if (segmentHitsAnyRect(v1474.a, v1474.b, v1410, [], -2)) {
        return false;
      }
      if (v1473.some(v1475 => v1433(v1474, v1475))) {
        return false;
      }
    }
    for (const v1476 of v1411) {
      if (v1476 === v1468) {
        continue;
      }
      for (const v1477 of segmentsFor(v1469)) {
        for (const v1478 of segmentsFor(v1413(v1476))) {
          if (sameAxisSegmentOverlapLength(v1477, v1478, 0.5) >= MIN_SHARED) {
            return false;
          }
        }
      }
    }
    return v1423(v1468, v1469) <= v1470;
  }, "candidateIsSafe");
  for (let v1479 = 0; v1479 < v1408; v1479++) {
    const v1480 = v1423();
    let v1481;
    let v1482;
    let v1483 = v1480;
    let v1484 = Number.POSITIVE_INFINITY;
    let v1485 = Number.POSITIVE_INFINITY;
    for (const v1486 of v1411) {
      const v1487 = v1413(v1486);
      const v1488 = countOrthogonalBends(v1487, EPS_LOCAL);
      const v1489 = v1417(v1487);
      for (let v1490 = 0; v1490 <= v1487.length - 4; v1490++) {
        for (const v1491 of v1448(v1487, v1490)) {
          const v1492 = countOrthogonalBends(v1491, EPS_LOCAL);
          const v1493 = v1417(v1491);
          const v1494 = v1492 < v1488 || v1492 === v1488 && v1493 < v1489 - EPS_LOCAL;
          if (!v1494 || !v1467(v1486, v1491, v1480)) {
            continue;
          }
          const v1495 = v1423(v1486, v1491);
          if (v1495 > v1483 || v1495 === v1483 && (v1492 > v1484 || v1492 === v1484 && v1493 >= v1485)) {
            continue;
          }
          v1481 = v1486;
          v1482 = v1491;
          v1483 = v1495;
          v1484 = v1492;
          v1485 = v1493;
        }
      }
    }
    if (!v1481 || !v1482) {
      return;
    }
    v1481.points = v1482;
  }
}
v22(shortcutRedundantOrthogonalJogs, "shortcutRedundantOrthogonalJogs");
function resolveRenderedOrthogonalCrossings(v1496, v1497) {
  const v1498 = 20;
  const v1499 = 2;
  const v1500 = 4;
  const v1501 = 48;
  const v1502 = [];
  for (const v1503 of v1497.values()) {
    if (v1503.isGroup || v1503.isEdgeLabel) {
      continue;
    }
    const v1504 = v1503.x ?? 0;
    const v1505 = v1503.y ?? 0;
    const v1506 = rectOfNodeBounds(v1503);
    if (!v1506) {
      continue;
    }
    v1502.push({
      id: String(v1503.id ?? ""),
      cx: v1504,
      cy: v1505,
      rect: v1506
    });
  }
  if (v1502.length === 0) {
    return;
  }
  const v1507 = new Map(v1502.map(v1508 => [v1508.id, v1508]));
  const v1509 = v1502.map(v1510 => ({
    id: v1510.id,
    rect: v1510.rect
  }));
  const v1511 = ["top", "bottom", "left", "right"];
  const v1512 = {
    top: Math.min(...v1502.map(v1513 => v1513.rect.top)) - v1498,
    bottom: Math.max(...v1502.map(v1514 => v1514.rect.bottom)) + v1498,
    left: Math.min(...v1502.map(v1515 => v1515.rect.left)) - v1498,
    right: Math.max(...v1502.map(v1516 => v1516.rect.right)) + v1498
  };
  const v1517 = v1496.filter(v1518 => !v1518.isLayoutOnly);
  const v1519 = new Map(v1517.map((v1520, v1521) => [v1520, v1521]));
  const v1522 = v22(v1523 => {
    const v1524 = v1523 === "left" || v1523 === "top" ? -1 : 1;
    const v1525 = [];
    for (let v1526 = 0; v1526 <= v1499; v1526++) {
      v1525.push(v1512[v1523] + v1524 * v1498 * v1526);
    }
    return v1525;
  }, "outwardTracksForSide");
  const v1527 = v22((v1528, v1529 = new Map()) => dedupeConsecutivePoints(v1529.get(v1528) ?? v1528.points ?? []), "replacementPointsFor");
  const v1530 = v22((v1531, v1532) => {
    let v1533 = 0;
    for (const v1534 of v1531) {
      for (const v1535 of v1532) {
        if (orthogonalSegmentsStrictlyCross(v1534.a, v1534.b, v1535.a, v1535.b, EPS_LOCAL)) {
          v1533++;
        }
      }
    }
    return v1533;
  }, "crossingCountBetweenSegments");
  const v1536 = v22((v1537, v1538) => v1530(segmentsFor(v1537), segmentsFor(v1538)), "crossingCountBetweenPaths");
  const v1539 = v22((v1540 = new Map()) => {
    let v1541 = 0;
    const v1542 = [];
    const v1543 = new Set();
    const v1544 = [];
    const v1545 = v22(v1546 => {
      if (!v1543.has(v1546)) {
        v1543.add(v1546);
        v1544.push(v1546);
      }
    }, "addEdge");
    for (let v1547 = 0; v1547 < v1517.length; v1547++) {
      const v1548 = v1517[v1547];
      const v1549 = v1527(v1548, v1540);
      for (let v1550 = v1547 + 1; v1550 < v1517.length; v1550++) {
        const v1551 = v1517[v1550];
        const v1552 = v1536(v1549, v1527(v1551, v1540));
        if (v1552 > 0) {
          v1541 += v1552;
          v1542.push({
            first: v1548,
            second: v1551,
            count: v1552
          });
          v1545(v1548);
          v1545(v1551);
        }
      }
    }
    v1544.sort((v1553, v1554) => (v1519.get(v1553) ?? 0) - (v1519.get(v1554) ?? 0));
    return {
      count: v1541,
      pairs: v1542,
      edgeSet: v1543,
      edges: v1544
    };
  }, "crossingSnapshot");
  const v1555 = v22((v1556, v1557) => {
    const v1558 = new Set(v1557.keys());
    if (v1558.size === 0) {
      return v1556.count;
    }
    let v1559 = 0;
    for (const v1560 of v1556.pairs) {
      if (v1558.has(v1560.first) || v1558.has(v1560.second)) {
        v1559 += v1560.count;
      }
    }
    let v1561 = 0;
    for (let v1562 = 0; v1562 < v1517.length; v1562++) {
      const v1563 = v1517[v1562];
      const v1564 = v1558.has(v1563);
      const v1565 = v1527(v1563, v1557);
      for (let v1566 = v1562 + 1; v1566 < v1517.length; v1566++) {
        const v1567 = v1517[v1566];
        if (!v1564 && !v1558.has(v1567)) {
          continue;
        }
        v1561 += v1536(v1565, v1527(v1567, v1557));
      }
    }
    return v1556.count - v1559 + v1561;
  }, "crossingCountWithReplacements");
  const v1568 = v22(v1569 => {
    const v1570 = new Map();
    for (const v1571 of v1569.pairs) {
      const v1572 = v1570.get(v1571.first) ?? new Set();
      v1572.add(v1571.second);
      v1570.set(v1571.first, v1572);
      const v1573 = v1570.get(v1571.second) ?? new Set();
      v1573.add(v1571.first);
      v1570.set(v1571.second, v1573);
    }
    const v1574 = [];
    const v1575 = new Set();
    for (const v1576 of v1569.edges) {
      if (v1575.has(v1576)) {
        continue;
      }
      const v1577 = [v1576];
      const v1578 = [];
      v1575.add(v1576);
      while (v1577.length > 0) {
        const v1579 = v1577.pop();
        v1578.push(v1579);
        for (const v1580 of v1570.get(v1579) ?? []) {
          if (!v1575.has(v1580)) {
            v1575.add(v1580);
            v1577.push(v1580);
          }
        }
      }
      v1578.sort((v1581, v1582) => (v1519.get(v1581) ?? 0) - (v1519.get(v1582) ?? 0));
      if (v1578.length > 1) {
        v1574.push(v1578);
      }
    }
    return v1574;
  }, "crossingComponents");
  const v1583 = v22(v1584 => [v1584.start, v1584.end].filter(v1585 => Boolean(v1585)), "endpointIdsFor");
  const v1586 = v22(v1587 => {
    const v1588 = [];
    for (const v1589 of v1568(v1587)) {
      const v1590 = new Set(v1589);
      const v1591 = new Set(v1589.flatMap(v1592 => v1583(v1592)));
      const v1593 = [...v1589];
      for (const v1594 of v1517) {
        if (v1590.has(v1594)) {
          continue;
        }
        if (v1583(v1594).some(v1595 => v1591.has(v1595))) {
          v1593.push(v1594);
        }
      }
      v1593.sort((v1596, v1597) => (v1519.get(v1596) ?? 0) - (v1519.get(v1597) ?? 0));
      v1588.push(v1593);
    }
    return v1588;
  }, "pairSearchGroups");
  const v1598 = v22((v1599, v1600, v1601) => v1555(v1599, new Map([[v1600, v1601]])), "crossingCountWithSingleReplacement");
  const v1602 = v22(v1603 => {
    const v1604 = new Map();
    for (const v1605 of v1603.pairs) {
      v1604.set(v1605.first, (v1604.get(v1605.first) ?? 0) + v1605.count);
      v1604.set(v1605.second, (v1604.get(v1605.second) ?? 0) + v1605.count);
    }
    return v1604;
  }, "currentCrossingsByEdge");
  const v1606 = v22(v1607 => v1607.slice(1).reduce((v1608, v1609, v1610) => {
    const v1611 = v1607[v1610];
    return v1608 + Math.abs(v1609.x - v1611.x) + Math.abs(v1609.y - v1611.y);
  }, 0), "pathLength");
  const v1612 = v22((v1613 = new Map()) => v1517.reduce((v1614, v1615) => v1614 + countOrthogonalBends(v1527(v1615, v1613)), 0), "totalBends");
  const v1616 = v22((v1617 = new Map()) => v1517.reduce((v1618, v1619) => v1618 + v1606(v1527(v1619, v1617)), 0), "totalLength");
  const v1620 = v22((v1621, v1622, v1623 = new Map()) => {
    const v1624 = segmentsFor(v1622);
    for (const v1625 of v1517) {
      if (v1625 === v1621) {
        continue;
      }
      for (const v1626 of v1624) {
        for (const v1627 of segmentsFor(v1527(v1625, v1623))) {
          if (sameAxisSegmentOverlapLength(v1626, v1627, 0.5) >= MIN_SHARED) {
            return true;
          }
        }
      }
    }
    return false;
  }, "pathHasSegmentConflict");
  const v1628 = v22((v1629, v1630) => {
    const v1631 = [v1629.start, v1629.end].filter(v1632 => Boolean(v1632));
    for (const v1633 of segmentsFor(v1630)) {
      if (segmentHitsAnyRect(v1633.a, v1633.b, v1509, v1631, -2)) {
        return true;
      }
    }
    return false;
  }, "pathHitsNode");
  const v1634 = v22((v1635, v1636) => {
    const v1637 = simplifyPolyline(dedupeConsecutivePoints(v1636));
    if (segmentsFor(v1637).length === v1637.length - 1) {
      v1635.push(v1637);
    }
  }, "pushOrthogonalCandidate");
  const v1638 = v22(v1639 => v1639 === "left" || v1639 === "right", "sideIsHorizontal");
  const v1640 = v22((v1641, v1642, v1643) => {
    switch (v1642) {
      case "left":
        return Math.min(v1641.x, v1643.x) - v1498;
      case "right":
        return Math.max(v1641.x, v1643.x) + v1498;
      case "top":
        return Math.min(v1641.y, v1643.y) - v1498;
      case "bottom":
        return Math.max(v1641.y, v1643.y) + v1498;
    }
  }, "localTrackForSameSide");
  const v1644 = v22((v1645, v1646, v1647, v1648) => {
    const v1649 = v1647 === "left" || v1647 === "top" ? -1 : 1;
    const v1650 = [v1640(v1646, v1647, v1648), v1512[v1647]];
    for (const v1651 of v1650) {
      for (let v1652 = 0; v1652 <= v1499; v1652++) {
        v1634(v1645, buildSameSideTrackPath(v1646, v1647, v1648, v1651 + v1649 * v1498 * v1652));
      }
    }
  }, "addSameSideCandidates");
  const v1653 = v22((v1654, v1655, v1656, v1657, v1658) => {
    for (const v1659 of v1522(v1656)) {
      for (const v1660 of v1522(v1658)) {
        v1634(v1654, [v1655, {
          x: v1659,
          y: v1655.y
        }, {
          x: v1659,
          y: v1660
        }, {
          x: v1657.x,
          y: v1660
        }, v1657]);
      }
    }
  }, "addHorizontalToVerticalCandidates");
  const v1661 = v22((v1662, v1663, v1664, v1665, v1666) => {
    for (const v1667 of v1522(v1664)) {
      for (const v1668 of v1522(v1666)) {
        v1634(v1662, [v1663, {
          x: v1663.x,
          y: v1667
        }, {
          x: v1668,
          y: v1667
        }, {
          x: v1668,
          y: v1665.y
        }, v1665]);
      }
    }
  }, "addVerticalToHorizontalCandidates");
  const v1669 = v22((v1670, v1671, v1672, v1673, v1674) => {
    const v1675 = [...v1522("top"), ...v1522("bottom")];
    for (const v1676 of v1522(v1672)) {
      for (const v1677 of v1522(v1674)) {
        for (const v1678 of v1675) {
          v1634(v1670, [v1671, {
            x: v1676,
            y: v1671.y
          }, {
            x: v1676,
            y: v1678
          }, {
            x: v1677,
            y: v1678
          }, {
            x: v1677,
            y: v1673.y
          }, v1673]);
        }
      }
    }
  }, "addHorizontalPairCandidates");
  const v1679 = v22((v1680, v1681, v1682, v1683, v1684) => {
    const v1685 = [...v1522("left"), ...v1522("right")];
    for (const v1686 of v1522(v1682)) {
      for (const v1687 of v1522(v1684)) {
        for (const v1688 of v1685) {
          v1634(v1680, [v1681, {
            x: v1681.x,
            y: v1686
          }, {
            x: v1688,
            y: v1686
          }, {
            x: v1688,
            y: v1687
          }, {
            x: v1683.x,
            y: v1687
          }, v1683]);
        }
      }
    }
  }, "addVerticalPairCandidates");
  const v1689 = v22(v1690 => {
    const v1691 = new Set();
    return v1690.map(v1692 => dedupeConsecutivePoints(v1692)).filter(v1693 => {
      const v1694 = v1693.map(v1695 => v1695.x.toFixed(3) + "," + v1695.y.toFixed(3)).join("|");
      if (v1691.has(v1694) || v1693.length < 2) {
        return false;
      }
      v1691.add(v1694);
      return true;
    });
  }, "dedupeCandidatePaths");
  const v1696 = v22((v1697, v1698, v1699, v1700) => {
    const v1701 = [];
    const v1702 = buildOrthogonalPortPath(v1697, v1698, v1699, v1700, v1498, EPS_LOCAL);
    if (v1702) {
      v1634(v1701, v1702);
    }
    if (v1698 === v1700) {
      v1644(v1701, v1697, v1698, v1699);
    }
    const v1703 = v1638(v1698);
    const v1704 = v1638(v1700);
    if (v1703 && !v1704) {
      v1653(v1701, v1697, v1698, v1699, v1700);
    } else if (!v1703 && v1704) {
      v1661(v1701, v1697, v1698, v1699, v1700);
    } else if (v1703) {
      v1669(v1701, v1697, v1698, v1699, v1700);
    } else {
      v1679(v1701, v1697, v1698, v1699, v1700);
    }
    return v1689(v1701);
  }, "buildCandidatesForSides");
  const v1705 = v22((v1706, v1707, v1708, v1709) => {
    const v1710 = [...v1522("left"), ...v1522("right")];
    const v1711 = [...v1522("top"), ...v1522("bottom")];
    for (const v1712 of v1511) {
      const v1713 = portForRectSide(v1709, v1712);
      const v1714 = v1712 === "top" || v1712 === "bottom" ? v1522(v1712) : v1711;
      for (const v1715 of v1710) {
        v1634(v1706, [v1707, v1708, {
          x: v1715,
          y: v1708.y
        }, {
          x: v1715,
          y: v1713.y
        }, v1713]);
        for (const v1716 of v1714) {
          v1634(v1706, [v1707, v1708, {
            x: v1715,
            y: v1708.y
          }, {
            x: v1715,
            y: v1716
          }, {
            x: v1713.x,
            y: v1716
          }, v1713]);
        }
      }
    }
  }, "addVerticalDepartureOuterTrackCandidates");
  const v1717 = v22((v1718, v1719, v1720, v1721) => {
    const v1722 = [...v1522("left"), ...v1522("right")];
    const v1723 = [...v1522("top"), ...v1522("bottom")];
    for (const v1724 of v1511) {
      const v1725 = portForRectSide(v1721, v1724);
      const v1726 = v1724 === "left" || v1724 === "right" ? v1522(v1724) : v1722;
      for (const v1727 of v1723) {
        v1634(v1718, [v1719, v1720, {
          x: v1720.x,
          y: v1727
        }, {
          x: v1725.x,
          y: v1727
        }, v1725]);
        for (const v1728 of v1726) {
          v1634(v1718, [v1719, v1720, {
            x: v1720.x,
            y: v1727
          }, {
            x: v1728,
            y: v1727
          }, {
            x: v1728,
            y: v1725.y
          }, v1725]);
        }
      }
    }
  }, "addHorizontalDepartureOuterTrackCandidates");
  const v1729 = v22(v1730 => {
    const v1731 = v1730.start;
    const v1732 = v1730.end;
    const v1733 = v1732 ? v1507.get(v1732) : undefined;
    if (!v1731 || !v1733) {
      return [];
    }
    const v1734 = dedupeConsecutivePoints(v1730.points ?? []);
    if (v1734.length < 4) {
      return [];
    }
    const v1735 = v1734[0];
    const v1736 = v1734[1];
    const v1737 = [];
    if (isVerticalSegment(v1735, v1736, EPS_LOCAL)) {
      v1705(v1737, v1735, v1736, v1733);
    } else if (isHorizontalSegment(v1735, v1736, EPS_LOCAL)) {
      v1717(v1737, v1735, v1736, v1733);
    }
    return v1737;
  }, "terminalPreservingOuterTrackCandidates");
  const v1738 = v22(v1739 => {
    const v1740 = v1739.start;
    const v1741 = v1739.end;
    const v1742 = v1740 ? v1507.get(v1740) : undefined;
    const v1743 = v1741 ? v1507.get(v1741) : undefined;
    if (!v1742 || !v1743) {
      return [];
    }
    const v1744 = [];
    for (const v1745 of v1511) {
      const v1746 = portForRectSide(v1742, v1745);
      for (const v1747 of v1511) {
        v1744.push(...v1696(v1746, v1745, portForRectSide(v1743, v1747), v1747));
      }
    }
    v1744.push(...v1729(v1739));
    return v1744;
  }, "candidatePathsFor");
  const v1748 = v22(() => new Map(v1517.map(v1749 => [v1749, segmentsFor(v1527(v1749))])), "currentSegmentsByEdge");
  const v1750 = v22((v1751, v1752, v1753) => {
    const v1754 = new Set();
    for (const v1755 of v1517) {
      if (v1755 === v1751) {
        continue;
      }
      const v1756 = v1753.get(v1755) ?? segmentsFor(v1527(v1755));
      if (v1752.some(v1757 => v1756.some(v1758 => sameAxisSegmentOverlapLength(v1757, v1758, 0.5) >= MIN_SHARED))) {
        v1754.add(v1755);
      }
    }
    return v1754;
  }, "sharedTrackConflictsFor");
  const v1759 = v22((v1760, v1761, v1762, v1763) => {
    const v1764 = new Set();
    const v1765 = v1738(v1760).map(v1766 => simplifyPolyline(dedupeConsecutivePoints(v1766))).filter(v1767 => {
      if (v1628(v1760, v1767)) {
        return false;
      }
      const v1768 = v1767.map(v1769 => v1769.x.toFixed(3) + "," + v1769.y.toFixed(3)).join("|");
      if (v1764.has(v1768) || v1767.length < 2) {
        return false;
      }
      v1764.add(v1768);
      return true;
    }).map(v1770 => {
      const v1771 = segmentsFor(v1770);
      let v1772 = 0;
      for (const v1773 of v1517) {
        if (v1773 === v1760) {
          continue;
        }
        v1772 += v1530(v1771, v1762.get(v1773) ?? segmentsFor(v1527(v1773)));
      }
      return {
        candidate: v1770,
        candidateSegments: v1771,
        crossings: v1761.count - (v1763.get(v1760) ?? 0) + v1772,
        bends: countOrthogonalBends(v1770, EPS_LOCAL),
        totalBends: countOrthogonalBends(v1770),
        length: v1606(v1770)
      };
    }).filter(({
      crossings: v1774
    }) => v1774 <= v1761.count).sort((v1775, v1776) => v1775.crossings - v1776.crossings || v1775.bends - v1776.bends || v1775.length - v1776.length);
    return v1765.slice(0, v1501).map(v1777 => {
      return {
        path: v1777.candidate,
        segments: v1777.candidateSegments,
        sharedTrackConflicts: v1750(v1760, v1777.candidateSegments, v1762),
        totalBends: v1777.totalBends,
        length: v1777.length
      };
    });
  }, "pairCandidatesFor");
  const v1778 = v22((v1779, v1780, v1781, v1782, v1783, v1784) => {
    let v1785 = 0;
    for (const v1786 of v1779.pairs) {
      if (v1786.first === v1780 || v1786.second === v1780 || v1786.first === v1782 || v1786.second === v1782) {
        v1785 += v1786.count;
      }
    }
    let v1787 = v1530(v1781.segments, v1783.segments);
    for (const v1788 of v1517) {
      if (v1788 === v1780 || v1788 === v1782) {
        continue;
      }
      const v1789 = v1784.get(v1788) ?? segmentsFor(v1527(v1788));
      v1787 += v1530(v1781.segments, v1789) + v1530(v1783.segments, v1789);
    }
    return v1779.count - v1785 + v1787;
  }, "pairCrossingCount");
  const v1790 = v22((v1791, v1792) => {
    for (const v1793 of v1791.sharedTrackConflicts) {
      if (v1793 !== v1792) {
        return false;
      }
    }
    return true;
  }, "conflictsOnlyWith");
  const v1794 = v22((v1795, v1796) => v1795.segments.some(v1797 => v1796.segments.some(v1798 => sameAxisSegmentOverlapLength(v1797, v1798, 0.5) >= MIN_SHARED)), "candidatesShareTrack");
  const v1799 = v22((v1800, v1801, v1802, v1803) => v1790(v1801, v1802.edge) && v1790(v1803, v1800.edge) && !v1794(v1801, v1803), "pairCandidatesAreCompatible");
  const v1804 = v22((v1805, v1806, v1807, v1808, v1809) => {
    const v1810 = v1778(v1805.current, v1806.edge, v1807, v1808.edge, v1809, v1805.baseSegments);
    if (v1810 >= v1805.current.count) {
      return undefined;
    }
    return {
      replacements: new Map([[v1806.edge, v1807.path], [v1808.edge, v1809.path]]),
      crossings: v1810,
      bends: v1805.currentBends - (v1805.baseBendsByEdge.get(v1806.edge) ?? 0) - (v1805.baseBendsByEdge.get(v1808.edge) ?? 0) + v1807.totalBends + v1809.totalBends,
      length: v1805.currentLength - (v1805.baseLengthByEdge.get(v1806.edge) ?? 0) - (v1805.baseLengthByEdge.get(v1808.edge) ?? 0) + v1807.length + v1809.length
    };
  }, "scorePairReplacement");
  const v1811 = v22((v1812, v1813) => v1812.crossings < v1813.crossings || v1812.crossings === v1813.crossings && (v1812.bends < v1813.bends || v1812.bends === v1813.bends && v1812.length < v1813.length), "pairScoreIsBetter");
  const v1814 = v22((v1815, v1816, v1817, v1818) => {
    let v1819 = v1818;
    for (const v1820 of v1816.candidates) {
      for (const v1821 of v1817.candidates) {
        if (!v1799(v1816, v1820, v1817, v1821)) {
          continue;
        }
        const v1822 = v1804(v1815, v1816, v1820, v1817, v1821);
        if (v1822 && v1811(v1822, v1819)) {
          v1819 = v1822;
        }
      }
    }
    return v1819;
  }, "bestScoreForOptionPair");
  const v1823 = v22(v1824 => {
    const v1825 = v1612();
    const v1826 = v1616();
    const v1827 = v1748();
    const v1828 = v1602(v1824);
    const v1829 = new Map(v1517.map(v1830 => [v1830, countOrthogonalBends(v1527(v1830))]));
    const v1831 = new Map(v1517.map(v1832 => [v1832, v1606(v1527(v1832))]));
    const v1833 = new Map();
    const v1834 = v1586(v1824);
    for (const v1835 of v1834) {
      for (const v1836 of v1835) {
        if (v1833.has(v1836)) {
          continue;
        }
        const v1837 = v1759(v1836, v1824, v1827, v1828);
        if (v1837.length > 0) {
          v1833.set(v1836, {
            edge: v1836,
            candidates: v1837
          });
        }
      }
    }
    let v1838 = {
      replacements: new Map(),
      crossings: v1824.count,
      bends: v1825,
      length: v1826
    };
    const v1839 = {
      current: v1824,
      currentBends: v1825,
      currentLength: v1826,
      baseBendsByEdge: v1829,
      baseLengthByEdge: v1831,
      baseSegments: v1827
    };
    for (const v1840 of v1834) {
      const v1841 = new Set(v1840.filter(v1842 => v1824.edgeSet.has(v1842)));
      const v1843 = v1840.map(v1844 => v1833.get(v1844)).filter(v1845 => Boolean(v1845));
      for (let v1846 = 0; v1846 < v1843.length; v1846++) {
        const v1847 = v1843[v1846];
        for (let v1848 = v1846 + 1; v1848 < v1843.length; v1848++) {
          const v1849 = v1843[v1848];
          if (!v1841.has(v1847.edge) && !v1841.has(v1849.edge)) {
            continue;
          }
          v1838 = v1814(v1839, v1847, v1849, v1838);
        }
      }
    }
    if (v1838.replacements.size > 0) {
      return v1838.replacements;
    } else {
      return undefined;
    }
  }, "bestPairedReplacement");
  for (let v1850 = 0; v1850 < v1500; v1850++) {
    const v1851 = v1539();
    const v1852 = v1851.count;
    if (v1852 === 0) {
      return;
    }
    let v1853;
    let v1854;
    let v1855 = v1852;
    let v1856 = Number.POSITIVE_INFINITY;
    for (const v1857 of v1851.edges) {
      const v1858 = countOrthogonalBends(v1527(v1857), EPS_LOCAL);
      for (const v1859 of v1738(v1857)) {
        const v1860 = v1628(v1857, v1859);
        const v1861 = !v1860 && v1620(v1857, v1859);
        const v1862 = v1598(v1851, v1857, v1859);
        const v1863 = countOrthogonalBends(v1859, EPS_LOCAL);
        if (v1860 || v1861) {
          continue;
        }
        const v1864 = v1862 < v1852 || v1862 === v1852 && v1863 < v1858;
        if (!v1864) {
          continue;
        }
        if (v1862 > v1855 || v1862 === v1855 && v1863 >= v1856) {
          continue;
        }
        v1853 = v1857;
        v1854 = v1859;
        v1855 = v1862;
        v1856 = v1863;
      }
    }
    if (v1853 && v1854) {
      v1853.points = v1854;
      continue;
    }
    const v1865 = v1823(v1851);
    if (!v1865) {
      return;
    }
    for (const [v1866, v1867] of v1865) {
      v1866.points = v1867;
    }
  }
}
v22(resolveRenderedOrthogonalCrossings, "resolveRenderedOrthogonalCrossings");
var EPS4 = 0.001;
var MIN_SHARED2 = 8;
function simplifyDetouredEdges(v1868, v1869) {
  const {
    nodeInfoById: v1870,
    realNodeRects: v1871
  } = collectRealNodeBounds(v1869);
  const v1872 = ["top", "bottom", "left", "right"];
  const v1873 = 20;
  const v1874 = {
    top: Math.min(...v1871.map(v1875 => v1875.rect.top)) - v1873,
    bottom: Math.max(...v1871.map(v1876 => v1876.rect.bottom)) + v1873,
    left: Math.min(...v1871.map(v1877 => v1877.rect.left)) - v1873,
    right: Math.max(...v1871.map(v1878 => v1878.rect.right)) + v1873
  };
  const v1879 = v22((v1880, v1881, v1882, v1883) => {
    const v1884 = [];
    const v1885 = buildOrthogonalPortPath(v1880, v1881, v1882, v1883, v1873, EPS4);
    if (v1885) {
      v1884.push(v1885);
    }
    if (v1881 === v1883) {
      v1884.push(buildSameSideTrackPath(v1880, v1881, v1882, v1874[v1881]));
    }
    return v1884;
  }, "buildOrthogonalPathCandidates");
  const v1886 = v22((v1887, v1888) => {
    for (let v1889 = 0; v1889 < v1887.length - 1; v1889++) {
      const v1890 = v1887[v1889];
      const v1891 = v1887[v1889 + 1];
      if (segmentHitsAnyRect(v1890, v1891, v1871, v1888, 1)) {
        return true;
      }
    }
    return false;
  }, "pathHitsNode");
  const v1892 = v22((v1893, v1894, v1895 = false) => {
    let v1896 = 0;
    const v1897 = orthogonalSegmentsForPoints(v1893, EPS4);
    const v1898 = v1894.start;
    const v1899 = v1894.end;
    for (const v1900 of v1868) {
      if (v1900 === v1894 || v1900.isLayoutOnly) {
        continue;
      }
      const v1901 = v1900.start;
      const v1902 = v1900.end;
      if (!v1895 && v1898 && v1899 && (v1901 === v1898 || v1901 === v1899 || v1902 === v1898 || v1902 === v1899)) {
        continue;
      }
      const v1903 = v1900.points;
      if (!v1903 || v1903.length < 2) {
        continue;
      }
      for (const v1904 of v1897) {
        for (const v1905 of orthogonalSegmentsForPoints(v1903, EPS4)) {
          if (orthogonalSegmentsCross(v1904.a, v1904.b, v1905.a, v1905.b, EPS4, EPS4)) {
            v1896++;
            continue;
          }
          if (sameAxisSegmentOverlapLength(v1904, v1905, EPS4) >= MIN_SHARED2) {
            v1896++;
          }
        }
      }
    }
    return v1896;
  }, "pathConflictCount");
  const v1906 = 4;
  const v1907 = v22((v1908, v1909) => {
    const v1910 = Math.abs(v1908.y - v1909.rect.top);
    const v1911 = Math.abs(v1908.y - v1909.rect.bottom);
    const v1912 = Math.abs(v1908.x - v1909.rect.left);
    const v1913 = Math.abs(v1908.x - v1909.rect.right);
    let v1914 = "top";
    let v1915 = v1910;
    if (v1911 < v1915) {
      v1914 = "bottom";
      v1915 = v1911;
    }
    if (v1912 < v1915) {
      v1914 = "left";
      v1915 = v1912;
    }
    if (v1913 < v1915) {
      v1914 = "right";
      v1915 = v1913;
    }
    return v1914;
  }, "nearestSideOfRect");
  const v1916 = new Map();
  const v1917 = v22((v1918, v1919, v1920) => {
    const v1921 = v1916.get(v1918) ?? [];
    v1921.push({
      side: v1919,
      edgeId: v1920
    });
    v1916.set(v1918, v1921);
  }, "addFaceClaim");
  for (const v1922 of v1868) {
    if (v1922.isLayoutOnly) {
      continue;
    }
    const v1923 = v1922.points ?? [];
    if (v1923.length < 1) {
      continue;
    }
    const v1924 = v1922.id ?? "";
    const v1925 = v1922.start;
    const v1926 = v1922.end;
    if (v1925) {
      const v1927 = v1870.get(v1925);
      if (v1927) {
        v1917(v1925, v1907(v1923[0], v1927), v1924);
      }
    }
    if (v1926) {
      const v1928 = v1870.get(v1926);
      if (v1928) {
        v1917(v1926, v1907(v1923[v1923.length - 1], v1928), v1924);
      }
    }
  }
  const v1929 = v22((v1930, v1931, v1932) => {
    return v1916.get(v1930)?.some(v1933 => v1933.edgeId !== v1932 && v1933.side === v1931) ?? false;
  }, "faceIsClaimed");
  for (const v1934 of v1868) {
    if (v1934.isLayoutOnly) {
      continue;
    }
    const v1935 = v1934.points;
    if (!v1935 || v1935.length < 2) {
      continue;
    }
    const v1936 = countOrthogonalBends(v1935, EPS4);
    if (v1936 < v1906) {
      continue;
    }
    const v1937 = v1934.start;
    const v1938 = v1934.end;
    if (!v1937 || !v1938) {
      continue;
    }
    const v1939 = v1870.get(v1937);
    const v1940 = v1870.get(v1938);
    if (!v1939 || !v1940) {
      continue;
    }
    const v1941 = v1934.id ?? "";
    const v1942 = v1892(v1935, v1934, true);
    const v1943 = v1892(v1935, v1934);
    let v1944;
    let v1945 = v1942;
    let v1946 = v1936;
    for (const v1947 of v1872) {
      if (v1929(v1937, v1947, v1941)) {
        continue;
      }
      const v1948 = portForRectSide(v1939, v1947);
      for (const v1949 of v1872) {
        if (v1929(v1938, v1949, v1941)) {
          continue;
        }
        const v1950 = portForRectSide(v1940, v1949);
        for (const v1951 of v1879(v1948, v1947, v1950, v1949)) {
          if (v1886(v1951, [v1937, v1938])) {
            continue;
          }
          const v1952 = countOrthogonalBends(v1951, EPS4);
          if (v1942 > 0) {
            const v1953 = v1892(v1951, v1934, true);
            if (v1953 > v1945 || v1953 === v1945 && v1952 >= v1946) {
              continue;
            }
            v1945 = v1953;
            v1946 = v1952;
            v1944 = v1951;
            continue;
          }
          if (v1892(v1951, v1934) > v1943) {
            continue;
          }
          if (v1952 < v1946) {
            v1946 = v1952;
            v1944 = v1951;
          }
        }
      }
    }
    if (v1944) {
      v1934.points = v1944;
      const v1954 = v1916.get(v1937);
      if (v1954) {
        v1916.set(v1937, v1954.filter(v1955 => v1955.edgeId !== v1941));
      }
      const v1956 = v1916.get(v1938);
      if (v1956) {
        v1916.set(v1938, v1956.filter(v1957 => v1957.edgeId !== v1941));
      }
      v1917(v1937, v1907(v1944[0], v1939), v1941);
      v1917(v1938, v1907(v1944[v1944.length - 1], v1940), v1941);
    }
  }
}
v22(simplifyDetouredEdges, "simplifyDetouredEdges");
var EPS5 = 0.001;
var MARKER_CLEARANCE_LENGTH = 10;
var MARKER_CLEARANCE_HALF_WIDTH = 7;
function markerClearanceRectFor(v1958, v1959) {
  const v1960 = v1959 ? 0 : v1958.length - 1;
  const v1961 = v1959 ? 1 : -1;
  const v1962 = v1958[v1960];
  const v1963 = v1958[v1960 + v1961];
  if (!v1962 || !v1963) {
    return undefined;
  }
  const v1964 = v1963.x - v1962.x;
  const v1965 = v1963.y - v1962.y;
  const v1966 = Math.abs(v1964) + Math.abs(v1965);
  if (v1966 < EPS5) {
    return undefined;
  }
  if (Math.abs(v1965) <= EPS5) {
    const v1967 = v1962.x + Math.sign(v1964) * MARKER_CLEARANCE_LENGTH;
    return {
      left: Math.min(v1962.x, v1967),
      right: Math.max(v1962.x, v1967),
      top: v1962.y - MARKER_CLEARANCE_HALF_WIDTH,
      bottom: v1962.y + MARKER_CLEARANCE_HALF_WIDTH
    };
  }
  if (Math.abs(v1964) <= EPS5) {
    const v1968 = v1962.y + Math.sign(v1965) * MARKER_CLEARANCE_LENGTH;
    return {
      left: v1962.x - MARKER_CLEARANCE_HALF_WIDTH,
      right: v1962.x + MARKER_CLEARANCE_HALF_WIDTH,
      top: Math.min(v1962.y, v1968),
      bottom: Math.max(v1962.y, v1968)
    };
  }
  return {
    left: Math.min(v1962.x, v1963.x),
    right: Math.max(v1962.x, v1963.x),
    top: Math.min(v1962.y, v1963.y),
    bottom: Math.max(v1962.y, v1963.y)
  };
}
v22(markerClearanceRectFor, "markerClearanceRectFor");
function normalizeRect(v1969) {
  return {
    left: Math.min(v1969.left, v1969.right),
    right: Math.max(v1969.left, v1969.right),
    top: Math.min(v1969.top, v1969.bottom),
    bottom: Math.max(v1969.top, v1969.bottom)
  };
}
v22(normalizeRect, "normalizeRect");
function labelOverlapsOwnMarker(v1970, v1971) {
  const v1972 = dedupeConsecutivePoints(v1971);
  const v1973 = markerClearanceRectFor(v1972, true);
  const v1974 = markerClearanceRectFor(v1972, false);
  return [v1973, v1974].some(v1975 => v1975 && rectsOverlap(v1970, normalizeRect(v1975)));
}
v22(labelOverlapsOwnMarker, "labelOverlapsOwnMarker");
function anchorLabelsToPolyline(v1976, v1977) {
  const v1978 = [];
  for (const v1979 of v1976) {
    if (v1979.isLayoutOnly) {
      continue;
    }
    const v1980 = v1979.points;
    if (!v1980 || v1980.length < 2) {
      continue;
    }
    for (let v1981 = 0; v1981 < v1980.length - 1; v1981++) {
      v1978.push({
        edgeId: v1979.id,
        p1: v1980[v1981],
        p2: v1980[v1981 + 1]
      });
    }
  }
  const v1982 = [];
  const v1983 = [];
  for (const v1984 of v1977.values()) {
    const v1985 = v1984.isGroup;
    const v1986 = v1984.parentId;
    if (v1985 && !v1986) {
      const v1987 = rectOfNodeBounds(v1984);
      if (v1987) {
        v1983.push({
          id: v1984.id,
          rect: v1987
        });
      }
      continue;
    }
    if (v1985) {
      continue;
    }
    if (v1984.isEdgeLabel) {
      continue;
    }
    const v1988 = rectOfNodeBounds(v1984);
    if (!v1988) {
      continue;
    }
    v1982.push({
      nodeId: v1984.id,
      rect: v1988
    });
  }
  const v1989 = 3;
  const v1990 = 1;
  const v1991 = 12;
  const v1992 = v22((v1993, v1994) => {
    const v1995 = inflateRect(v1994, v1989);
    for (const {
      nodeId: v1996,
      rect: v1997
    } of v1982) {
      if (v1996 === v1993) {
        continue;
      }
      if (rectsOverlap(v1995, v1997)) {
        return true;
      }
    }
    return false;
  }, "labelOverlapsForeignNode");
  const v1998 = v22((v1999, v2000) => {
    const v2001 = inflateRect(v2000, v1989);
    for (const v2002 of v1978) {
      if (v2002.edgeId === v1999) {
        continue;
      }
      if (segmentBoundsOverlapRect(v2002.p1, v2002.p2, v2001)) {
        return true;
      }
    }
    return false;
  }, "labelOverlapsForeignEdge");
  const v2003 = v22((v2004, v2005, v2006) => v1992(v2004, v2006) || v1998(v2005, v2006), "labelOverlapsAnything");
  const v2007 = [];
  const v2008 = v22(v2009 => {
    for (const {
      id: v2010,
      rect: v2011
    } of v1983) {
      if (rectContainsRect(v2011, v2009)) {
        return v2010;
      }
    }
    return undefined;
  }, "findContainingLane");
  const v2012 = v22((v2013, v2014) => v2007.some(v2015 => v2015.labelId !== v2013 && rectsOverlap(v2014, v2015.rect)), "overlapsPlacedLabel");
  for (const v2016 of v1976) {
    if (v2016.isLayoutOnly) {
      continue;
    }
    const v2017 = v2016.labelNodeId;
    if (!v2017) {
      continue;
    }
    const v2018 = v1977.get(v2017);
    if (!v2018) {
      continue;
    }
    const v2019 = v2016.points;
    if (!v2019 || v2019.length < 2) {
      continue;
    }
    const v2020 = v2018.width ?? 0;
    const v2021 = v2018.height ?? 0;
    if (v2020 <= 0 || v2021 <= 0) {
      continue;
    }
    const v2022 = [];
    for (let v2023 = 0; v2023 < v2019.length - 1; v2023++) {
      const v2024 = v2019[v2023];
      const v2025 = v2019[v2023 + 1];
      const v2026 = Math.abs(v2024.x - v2025.x);
      const v2027 = Math.abs(v2024.y - v2025.y);
      if (v2026 < EPS5 && v2027 < EPS5) {
        continue;
      }
      if (v2026 >= EPS5 && v2027 >= EPS5) {
        continue;
      }
      v2022.push({
        idx: v2023,
        length: v2026 + v2027,
        orientation: v2026 >= EPS5 ? "horizontal" : "vertical",
        midX: (v2024.x + v2025.x) / 2,
        midY: (v2024.y + v2025.y) / 2
      });
    }
    if (v2022.length === 0) {
      continue;
    }
    const v2028 = v2022.length >= 3 ? v2022.filter(v2029 => v2029.idx > 0 && v2029.idx < v2022.length - 1) : v2022;
    const v2030 = v2028.length > 0 ? v2028 : v2022;
    const v2031 = v2020 >= v2021 ? "horizontal" : "vertical";
    const v2032 = v22(v2033 => {
      return [...v2033].sort((v2034, v2035) => {
        const v2036 = v2034.orientation === v2031;
        const v2037 = v2035.orientation === v2031;
        if (v2036 !== v2037) {
          if (v2036) {
            return -1;
          } else {
            return 1;
          }
        }
        const v2038 = v2034.length >= (v2034.orientation === "horizontal" ? v2020 : v2021) + 2;
        const v2039 = v2035.length >= (v2035.orientation === "horizontal" ? v2020 : v2021) + 2;
        if (v2038 !== v2039) {
          if (v2038) {
            return -1;
          } else {
            return 1;
          }
        }
        return v2035.length - v2034.length;
      });
    }, "rankSegments");
    const v2040 = v2022[0];
    const v2041 = v2022[v2022.length - 1];
    const v2042 = [0.5, 0.25, 0.75, 0.05, 0.95, 0.15, 0.85, 0.1, 0.9];
    const v2043 = v22((v2044, v2045) => {
      const v2046 = v2019[v2044.idx];
      const v2047 = v2019[v2044.idx + 1];
      return {
        midX: v2046.x + (v2047.x - v2046.x) * v2045,
        midY: v2046.y + (v2047.y - v2046.y) * v2045
      };
    }, "anchorAtT");
    const v2048 = v22((v2049, v2050, v2051) => Math.min(v2051, Math.max(v2050, v2049)), "clamp");
    const v2052 = v22((v2053, v2054) => v2053.midX >= v2054.left - EPS5 && v2053.midX <= v2054.right + EPS5 && v2053.midY >= v2054.top - EPS5 && v2053.midY <= v2054.bottom + EPS5, "pointInsideRectInclusive");
    const v2055 = v22(v2056 => {
      const v2057 = rectFromCenterSize(v2056.midX, v2056.midY, v2020, v2021);
      const v2058 = v2008(v2057);
      if (v2058) {
        return {
          laneId: v2058,
          anchor: v2056,
          rect: v2057
        };
      }
      const v2059 = v1983.find(({
        rect: v2060
      }) => v2052(v2056, v2060));
      if (!v2059) {
        return undefined;
      }
      const v2061 = v2059.rect.left + v2020 / 2 + v1990;
      const v2062 = v2059.rect.right - v2020 / 2 - v1990;
      const v2063 = v2059.rect.top + v2021 / 2 + v1990;
      const v2064 = v2059.rect.bottom - v2021 / 2 - v1990;
      if (v2061 > v2062 || v2063 > v2064) {
        return undefined;
      }
      const v2065 = {
        midX: v2048(v2056.midX, v2061, v2062),
        midY: v2048(v2056.midY, v2063, v2064)
      };
      const v2066 = rectFromCenterSize(v2065.midX, v2065.midY, v2020, v2021);
      if (v2052(v2056, v2066)) {
        return {
          laneId: v2059.id,
          anchor: v2065,
          rect: v2066
        };
      } else {
        return undefined;
      }
    }, "placementForAnchor");
    const v2067 = v22((v2068, v2069, v2070) => v2068.orientation === "horizontal" ? Math.abs(v2069.midX - v2070.x) : Math.abs(v2069.midY - v2070.y), "distanceAlongSegment");
    const v2071 = v22((v2072, v2073) => {
      const v2074 = v2072.orientation === "horizontal" ? v2020 / 2 : v2021 / 2;
      const v2075 = v2074 + v1991;
      if (v2072 === v2040) {
        const v2076 = v2019[v2072.idx];
        if (v2067(v2072, v2073, v2076) + EPS5 < v2075) {
          return false;
        }
      }
      if (v2072 === v2041) {
        const v2077 = v2019[v2072.idx + 1];
        if (v2067(v2072, v2073, v2077) + EPS5 < v2075) {
          return false;
        }
      }
      return true;
    }, "labelClearsTerminalEndpoints");
    const v2078 = v22(v2079 => {
      const v2080 = v2032(v2079);
      for (const v2081 of v2080) {
        for (const v2082 of v2042) {
          const v2083 = v2043(v2081, v2082);
          if (!v2071(v2081, v2083)) {
            continue;
          }
          const v2084 = v2055(v2083);
          if (!v2084) {
            continue;
          }
          if (labelOverlapsOwnMarker(v2084.rect, v2019)) {
            continue;
          }
          if (v2012(v2017, v2084.rect)) {
            continue;
          }
          if (!v2003(v2017, v2016.id, v2084.rect)) {
            return {
              laneId: v2084.laneId,
              anchor: v2084.anchor
            };
          }
        }
      }
      return undefined;
    }, "tryPool");
    const v2085 = v22((v2086, v2087, v2088 = false) => {
      const v2089 = v2032(v2086);
      for (const v2090 of v2089) {
        const v2091 = {
          midX: v2090.midX,
          midY: v2090.midY
        };
        if (v2087 && !v2071(v2090, v2091)) {
          continue;
        }
        const v2092 = v2055(v2091);
        if (v2092 && !labelOverlapsOwnMarker(v2092.rect, v2019) && !v2012(v2017, v2092.rect) && !v1992(v2017, v2092.rect) && (v2088 || !v1998(v2016.id, v2092.rect))) {
          return {
            laneId: v2092.laneId,
            anchor: v2092.anchor
          };
        }
      }
      return undefined;
    }, "findLaneContainingFallback");
    const v2093 = v2078(v2030) ?? (v2030.length < v2022.length ? v2078(v2022) : undefined) ?? v2085(v2022, true) ?? v2085(v2022, false) ?? v2085(v2022, false, true);
    if (v2093) {
      v2018.x = v2093.anchor.midX;
      v2018.y = v2093.anchor.midY;
      v2018.parentId = v2093.laneId;
      const v2094 = rectFromCenterSize(v2093.anchor.midX, v2093.anchor.midY, v2020, v2021);
      const v2095 = v2007.findIndex(v2096 => v2096.labelId === v2017);
      if (v2095 >= 0) {
        v2007[v2095] = {
          labelId: v2017,
          rect: v2094
        };
      } else {
        v2007.push({
          labelId: v2017,
          rect: v2094
        });
      }
    }
  }
}
v22(anchorLabelsToPolyline, "anchorLabelsToPolyline");
var EPS6 = 0.000001;
var MIN_PORT_SPACING2 = 8;
var PORT_SHIFT2 = MIN_PORT_SPACING2 / 2;
var LABEL_CLEARANCE_BUFFER = 3;
function pairKey(v2097, v2098) {
  if (v2097 < v2098) {
    return v2097 + "::" + v2098;
  } else {
    return v2098 + "::" + v2097;
  }
}
v22(pairKey, "pairKey");
function straightenCollinearSiblingDetours(v2099, v2100) {
  const {
    nodeInfoById: v2101,
    realNodeRects: v2102
  } = collectRealNodeBounds(v2100);
  const v2103 = new Map();
  for (const v2104 of v2100) {
    const v2105 = v2104.id;
    if (v2104.isGroup) {
      continue;
    }
    if (v2104.isEdgeLabel) {
      v2103.set(v2105, {
        w: v2104.width ?? 0,
        h: v2104.height ?? 0
      });
      continue;
    }
  }
  const v2106 = v22((v2107, v2108, v2109, v2110) => {
    const v2111 = pairKey(v2108, v2109);
    let v2112 = 0;
    const v2113 = v22(v2114 => {
      if (!v2114) {
        return;
      }
      const v2115 = v2103.get(v2114);
      if (!v2115) {
        return;
      }
      const v2116 = v2110 === "x" ? v2115.w / 2 : v2115.h / 2;
      if (v2116 > v2112) {
        v2112 = v2116;
      }
    }, "consider");
    v2113(v2107.labelNodeId);
    for (const v2117 of v2099) {
      if (v2117 === v2107) {
        continue;
      }
      if (v2117.isLayoutOnly) {
        continue;
      }
      const v2118 = v2117.start;
      const v2119 = v2117.end;
      if (!v2118 || !v2119) {
        continue;
      }
      if (pairKey(v2118, v2119) !== v2111) {
        continue;
      }
      v2113(v2117.labelNodeId);
    }
    if (v2112 > 0) {
      return v2112 + LABEL_CLEARANCE_BUFFER;
    } else {
      return 0;
    }
  }, "labelClearanceFor");
  for (const v2120 of v2099) {
    if (v2120.isLayoutOnly) {
      continue;
    }
    const v2121 = v2120.points;
    if (!classifyThreeSegmentRoute(v2121, EPS6)) {
      continue;
    }
    const v2122 = getNodePairGeometry(v2120, v2101, EPS6);
    if (!v2122) {
      continue;
    }
    const {
      srcId: v2123,
      dstId: v2124,
      srcInfo: v2125,
      dstInfo: v2126,
      collinearX: v2127,
      collinearY: v2128
    } = v2122;
    if (v2127 === v2128) {
      continue;
    }
    let v2129;
    let v2130;
    if (v2127) {
      const v2131 = v2126.cy > v2125.cy;
      v2129 = {
        x: v2125.cx,
        y: v2131 ? v2125.rect.bottom : v2125.rect.top
      };
      v2130 = {
        x: v2126.cx,
        y: v2131 ? v2126.rect.top : v2126.rect.bottom
      };
    } else {
      const v2132 = v2126.cx > v2125.cx;
      v2129 = {
        x: v2132 ? v2125.rect.right : v2125.rect.left,
        y: v2125.cy
      };
      v2130 = {
        x: v2132 ? v2126.rect.left : v2126.rect.right,
        y: v2126.cy
      };
    }
    if (segmentHitsAnyRect(v2129, v2130, v2102, [v2123, v2124], 1)) {
      continue;
    }
    const v2133 = v2127 ? "x" : "y";
    const v2134 = v2106(v2120, v2123, v2124, v2133);
    const v2135 = v2134 > PORT_SHIFT2 ? v2134 : PORT_SHIFT2;
    const v2136 = [0, v2135, -v2135];
    for (const v2137 of v2136) {
      const v2138 = {
        ...v2129
      };
      const v2139 = {
        ...v2130
      };
      if (v2127) {
        v2138.x += v2137;
        v2139.x += v2137;
        if (v2138.x <= v2125.rect.left || v2138.x >= v2125.rect.right) {
          continue;
        }
        if (v2139.x <= v2126.rect.left || v2139.x >= v2126.rect.right) {
          continue;
        }
      } else {
        v2138.y += v2137;
        v2139.y += v2137;
        if (v2138.y <= v2125.rect.top || v2138.y >= v2125.rect.bottom) {
          continue;
        }
        if (v2139.y <= v2126.rect.top || v2139.y >= v2126.rect.bottom) {
          continue;
        }
      }
      if (segmentHitsAnyRect(v2138, v2139, v2102, [v2123, v2124], 1)) {
        continue;
      }
      if (segmentConflictsWithAnyEdge(v2138, v2139, v2099, v2120, {
        epsilon: EPS6
      })) {
        continue;
      }
      v2120.points = [v2138, v2139];
      break;
    }
  }
}
v22(straightenCollinearSiblingDetours, "straightenCollinearSiblingDetours");
function nudgeSharedInteriorSubpaths(v2140, v2141) {
  const v2142 = 0.001;
  const v2143 = 8;
  const v2144 = 7;
  const v2145 = v2144;
  const v2146 = 20;
  const v2147 = 12;
  const {
    realNodeRects: v2148,
    labelNodeRects: v2149
  } = collectNodeRectEntries(v2141.values());
  const v2150 = v22((v2151, v2152) => {
    return orthogonalSegmentsForPoints(v2152, v2142).map(v2153 => ({
      ...v2153,
      edge: v2151,
      interior: v2153.index >= 1 && v2153.index <= v2152.length - 3
    }));
  }, "segmentsFor");
  const v2154 = v22(() => {
    const v2155 = [];
    for (const v2156 of v2140) {
      if (v2156.isLayoutOnly) {
        continue;
      }
      const v2157 = v2156.points;
      if (!v2157 || v2157.length < 2) {
        continue;
      }
      v2155.push(...v2150(v2156, dedupeConsecutivePoints(v2157)));
    }
    return v2155;
  }, "allSegments");
  const v2158 = v22((v2159, v2160) => {
    if (v2159.horizontal && v2160.horizontal) {
      return overlapLength(v2159.a.x, v2159.b.x, v2160.a.x, v2160.b.x) >= v2143 && Math.abs(v2159.a.y - v2160.a.y) < v2145;
    }
    if (v2159.vertical && v2160.vertical) {
      return overlapLength(v2159.a.y, v2159.b.y, v2160.a.y, v2160.b.y) >= v2143 && Math.abs(v2159.a.x - v2160.a.x) < v2145;
    }
    return false;
  }, "hasCrowdedParallelTrack");
  const v2161 = v22((v2162, v2163) => {
    const v2164 = v2162.start;
    const v2165 = v2162.end;
    const v2166 = v2150(v2162, v2163);
    if (v2166.length !== v2163.length - 1) {
      return false;
    }
    const v2167 = [v2164, v2165].filter(v2168 => Boolean(v2168));
    const v2169 = v2162.labelNodeId ? [v2162.labelNodeId] : [];
    for (const v2170 of v2166) {
      if (segmentHitsAnyRect(v2170.a, v2170.b, v2148, v2167, -2)) {
        return false;
      }
      if (segmentHitsAnyRect(v2170.a, v2170.b, v2149, v2169, -2)) {
        return false;
      }
    }
    for (const v2171 of v2140) {
      if (v2171 === v2162 || v2171.isLayoutOnly) {
        continue;
      }
      const v2172 = v2171.points;
      if (!v2172 || v2172.length < 2) {
        continue;
      }
      for (const v2173 of v2166) {
        for (const v2174 of v2150(v2171, dedupeConsecutivePoints(v2172))) {
          if (v2158(v2173, v2174)) {
            return false;
          }
          if (orthogonalSegmentsStrictlyCross(v2173.a, v2173.b, v2174.a, v2174.b, v2142)) {
            return false;
          }
        }
      }
    }
    return true;
  }, "candidateIsSafe");
  const v2175 = v22((v2176, v2177) => {
    const v2178 = dedupeConsecutivePoints(v2176.edge.points ?? []);
    if (v2178.length < 4 || v2176.index >= v2178.length - 1) {
      return undefined;
    }
    const v2179 = v2178.map(v2180 => ({
      ...v2180
    }));
    if (v2176.horizontal) {
      v2179[v2176.index].y += v2177;
      v2179[v2176.index + 1].y += v2177;
    } else if (v2176.vertical) {
      v2179[v2176.index].x += v2177;
      v2179[v2176.index + 1].x += v2177;
    } else {
      return undefined;
    }
    if (v2150(v2176.edge, v2179).length === v2179.length - 1) {
      return v2179;
    } else {
      return undefined;
    }
  }, "shiftedCandidate");
  const v2181 = v22((v2182, v2183) => ({
    x: v2182.x ?? (v2183.left + v2183.right) / 2,
    y: v2182.y ?? (v2183.top + v2183.bottom) / 2
  }), "nodeCenter");
  const v2184 = v22(v2185 => {
    const v2186 = v2185.edge;
    const v2187 = dedupeConsecutivePoints(v2186.points ?? []);
    if (v2187.length !== 4 || v2185.index !== 1) {
      return undefined;
    }
    const v2188 = v2186.start ? v2141.get(v2186.start) : undefined;
    const v2189 = v2186.end ? v2141.get(v2186.end) : undefined;
    const v2190 = v2188 ? rectOfNodeBounds(v2188) : undefined;
    const v2191 = v2189 ? rectOfNodeBounds(v2189) : undefined;
    const v2192 = v2187.slice(v2185.index + 2);
    if (!v2188 || !v2189 || !v2190 || !v2191 || v2192.length === 0) {
      return undefined;
    }
    return {
      sourceCenter: v2181(v2188, v2190),
      targetCenter: v2181(v2189, v2191),
      sourceRect: v2190,
      tail: v2192
    };
  }, "sourceDetourContextFor");
  const v2193 = v22((v2194, v2195, v2196, v2197, v2198, v2199) => {
    const v2200 = v2197.y >= v2196.y;
    const v2201 = v2200 ? v2198.bottom : v2198.top;
    const v2202 = v2201 + (v2200 ? v2146 : -v2146);
    if (v2200 && v2194.b.y <= v2202 + v2142 || !v2200 && v2194.b.y >= v2202 - v2142) {
      return undefined;
    }
    const v2203 = v2194.a.x + v2195;
    return dedupeConsecutivePoints([{
      x: v2196.x,
      y: v2201
    }, {
      x: v2196.x,
      y: v2202
    }, {
      x: v2203,
      y: v2202
    }, {
      x: v2203,
      y: v2194.b.y
    }, ...v2199], v2142);
  }, "verticalSourceDetour");
  const v2204 = v22((v2205, v2206, v2207, v2208, v2209, v2210) => {
    const v2211 = v2208.x >= v2207.x;
    const v2212 = v2211 ? v2209.right : v2209.left;
    const v2213 = v2212 + (v2211 ? v2146 : -v2146);
    if (v2211 && v2205.b.x <= v2213 + v2142 || !v2211 && v2205.b.x >= v2213 - v2142) {
      return undefined;
    }
    const v2214 = v2205.a.y + v2206;
    return dedupeConsecutivePoints([{
      x: v2212,
      y: v2207.y
    }, {
      x: v2213,
      y: v2207.y
    }, {
      x: v2213,
      y: v2214
    }, {
      x: v2205.b.x,
      y: v2214
    }, ...v2210], v2142);
  }, "horizontalSourceDetour");
  const v2215 = v22((v2216, v2217) => {
    const v2218 = v2184(v2216);
    if (!v2218) {
      return undefined;
    }
    if (v2216.vertical) {
      return v2193(v2216, v2217, v2218.sourceCenter, v2218.targetCenter, v2218.sourceRect, v2218.tail);
    }
    if (v2216.horizontal) {
      return v2204(v2216, v2217, v2218.sourceCenter, v2218.targetCenter, v2218.sourceRect, v2218.tail);
    }
    return undefined;
  }, "sourceDetourCandidate");
  const v2219 = [-v2144, v2144, v2144 * -2, v2144 * 2, v2144 * -3, v2144 * 3];
  for (let v2220 = 0; v2220 < v2147; v2220++) {
    const v2221 = v2154();
    let v2222 = false;
    for (let v2223 = 0; v2223 < v2221.length && !v2222; v2223++) {
      for (let v2224 = v2223 + 1; v2224 < v2221.length && !v2222; v2224++) {
        const v2225 = v2221[v2223];
        const v2226 = v2221[v2224];
        if (v2225.edge === v2226.edge || !v2158(v2225, v2226)) {
          continue;
        }
        const v2227 = [v2225, v2226].filter(v2228 => v2228.interior);
        for (const v2229 of v2227) {
          for (const v2230 of v2219) {
            const v2231 = v2175(v2229, v2230);
            if (v2231 && v2161(v2229.edge, v2231)) {
              v2229.edge.points = v2231;
              v2222 = true;
              break;
            }
            const v2232 = v2215(v2229, v2230);
            if (v2232 && v2161(v2229.edge, v2232)) {
              v2229.edge.points = v2232;
              v2222 = true;
              break;
            }
          }
          if (v2222) {
            break;
          }
        }
      }
    }
    if (!v2222) {
      return;
    }
  }
}
v22(nudgeSharedInteriorSubpaths, "nudgeSharedInteriorSubpaths");
function segmentsIntersect(v2233, v2234, v2235, v2236) {
  const v2237 = v2234.x - v2233.x;
  const v2238 = v2234.y - v2233.y;
  const v2239 = v2236.x - v2235.x;
  const v2240 = v2236.y - v2235.y;
  const v2241 = v2237 * v2240 - v2238 * v2239;
  if (Math.abs(v2241) < 1e-10) {
    return false;
  }
  const v2242 = v2235.x - v2233.x;
  const v2243 = v2235.y - v2233.y;
  const v2244 = (v2242 * v2240 - v2243 * v2239) / v2241;
  const v2245 = (v2242 * v2238 - v2243 * v2237) / v2241;
  const v2246 = 0.01;
  return v2244 > v2246 && v2244 < 1 - v2246 && v2245 > v2246 && v2245 < 1 - v2246;
}
v22(segmentsIntersect, "segmentsIntersect");
function validateSwimlanesLayout(v2247) {
  const v2248 = v2247.nodes ?? [];
  const v2249 = v2247.edges ?? [];
  const v2250 = [];
  if (!v2249.length || !v2248.length) {
    return v2250;
  }
  const v2251 = collectLayoutNodeRects(v2248);
  const v2252 = [];
  for (const v2253 of v2249) {
    if (v2253.isLayoutOnly) {
      continue;
    }
    const v2254 = v2253.points;
    if (!v2254 || v2254.length < 2) {
      continue;
    }
    const v2255 = v2253.start;
    const v2256 = v2253.end;
    const v2257 = v2253.labelNodeId;
    const v2258 = v2253.id ?? v2255 + "->" + v2256;
    for (const v2259 of v2251) {
      if (v2259.nodeId === v2255 || v2259.nodeId === v2256) {
        continue;
      }
      if (v2257 && v2259.nodeId === v2257) {
        continue;
      }
      for (let v2260 = 0; v2260 < v2254.length - 1; v2260++) {
        if (segmentBoundsOverlapRect(v2254[v2260], v2254[v2260 + 1], v2259, -1)) {
          v2250.push({
            type: "edge-node-overlap",
            edgeId: v2258,
            targetId: v2259.nodeId,
            detail: "segment " + v2260 + " passes through node \"" + v2259.nodeId + "\""
          });
          break;
        }
      }
    }
    for (let v2261 = 0; v2261 < v2254.length - 1; v2261++) {
      v2252.push({
        edgeId: v2258,
        start: v2255,
        end: v2256,
        p1: v2254[v2261],
        p2: v2254[v2261 + 1]
      });
    }
  }
  const v2262 = new Set();
  for (let v2263 = 0; v2263 < v2252.length; v2263++) {
    for (let v2264 = v2263 + 1; v2264 < v2252.length; v2264++) {
      const v2265 = v2252[v2263];
      const v2266 = v2252[v2264];
      if (v2265.edgeId === v2266.edgeId) {
        continue;
      }
      if (v2265.start === v2266.start || v2265.start === v2266.end || v2265.end === v2266.start || v2265.end === v2266.end) {
        continue;
      }
      if (segmentsIntersect(v2265.p1, v2265.p2, v2266.p1, v2266.p2)) {
        const v2267 = v2265.edgeId < v2266.edgeId ? v2265.edgeId + "|" + v2266.edgeId : v2266.edgeId + "|" + v2265.edgeId;
        if (!v2262.has(v2267)) {
          v2262.add(v2267);
          v2250.push({
            type: "edge-edge-crossing",
            edgeId: v2265.edgeId,
            targetId: v2266.edgeId,
            detail: "edges \"" + v2265.edgeId + "\" and \"" + v2266.edgeId + "\" cross"
          });
        }
      }
    }
  }
  if (v2250.length > 0) {
    const v2268 = v2250.filter(v2269 => v2269.type === "edge-node-overlap").length;
    const v2270 = v2250.filter(v2271 => v2271.type === "edge-edge-crossing").length;
    v9.warn("[SWIMLANE_VALIDATE] " + v2250.length + " issue(s) detected: " + v2268 + " edge-node overlap(s), " + v2270 + " edge crossing(s)");
    for (const v2272 of v2250) {
      v9.warn("[SWIMLANE_VALIDATE]   " + v2272.type + ": " + v2272.detail);
    }
  }
  return v2250;
}
v22(validateSwimlanesLayout, "validateSwimlanesLayout");
function postProcessSwimlaneLayout(v2273, v2274) {
  const v2275 = v2273.nodes ?? [];
  const v2276 = v2273.edges ?? [];
  const v2277 = v2275.filter(v2278 => !v2278.isGroup);
  if ((v2274 === "LR" || v2274 === "RL") && v2277.length > 0 && !applyLrDirectionTransform(v2273, v2274)) {
    return;
  }
  if (v2274 === "BT" && v2277.length > 0 && !applyBtDirectionTransform(v2273)) {
    return;
  }
  for (const v2279 of v2276) {
    if (v2279.isLayoutOnly) {
      continue;
    }
    const v2280 = v2279.points;
    if (!v2280 || v2280.length < 2) {
      continue;
    }
    v2279.points = simplifyPolyline(orthogonalizePolyline(v2280));
  }
  simplifyDetouredEdges(v2276, v2275);
  straightenCollinearSiblingDetours(v2276, v2275);
  portSwapToLShape(v2276, v2275);
  const v2281 = new Map();
  for (const v2282 of v2275) {
    v2281.set(String(v2282.id), v2282);
  }
  anchorLabelsToPolyline(v2276, v2281);
  clipEdgeEndpointsToNodeBoundaries(v2276, v2281);
  collapseShortTerminalStub(v2276, v2281);
  nudgeSharedInteriorSubpaths(v2276, v2281);
  separateSharedRenderedTerminalLanes(v2276, v2281);
  collapseRedundantRectangularDoglegs(v2276, v2281);
  liftObstacleHuggingSameSideRails(v2276, v2281);
  swapDestinationTerminalTailsToReduceCrossings(v2276, v2281);
  const v2283 = v22(() => {
    resolveRenderedOrthogonalCrossings(v2276, v2281);
    reassignCrossingExternalRailChannels(v2276, v2281);
    shortcutRedundantOrthogonalJogs(v2276, v2281);
    anchorLabelsToPolyline(v2276, v2281);
    prepareEdgeEndpointsForRenderer(v2276, v2281);
    liftObstacleHuggingSameSideRails(v2276, v2281);
    anchorLabelsToPolyline(v2276, v2281);
    prepareEdgeEndpointsForRenderer(v2276, v2281);
  }, "finalizeRenderedEdges");
  v2283();
  nudgeSharedInteriorSubpaths(v2276, v2281);
  v2283();
  liftTopLaneTitleBandsAboveRails(v2276, v2281);
  shiftLeftLaneTitleBandsLeftOfRails(v2276, v2281);
  liftTopLaneTitleBandsAboveRails(v2276, v2281);
  shiftLeftLaneTitleBandsLeftOfRails(v2276, v2281);
}
v22(postProcessSwimlaneLayout, "postProcessSwimlaneLayout");
function normalizeGraph(v2284) {
  const v2285 = new Map(v2284.nodeById);
  const v2286 = new Set();
  const v2287 = [];
  for (const v2288 of v2284.edges) {
    if (!v2285.has(v2288.src) || !v2285.has(v2288.dst)) {
      continue;
    }
    const v2289 = v2288.id + ":" + v2288.src + "->" + v2288.dst;
    if (v2286.has(v2289)) {
      continue;
    }
    v2286.add(v2289);
    v2287.push(v2288);
  }
  const v2290 = [...v2285.keys()];
  return {
    nodes: v2290,
    edges: v2287,
    layout: v2284.layout,
    nodeById: v2285
  };
}
v22(normalizeGraph, "normalizeGraph");
function incoming(v2291, v2292) {
  return v2291.edges.filter(v2293 => v2293.dst === v2292);
}
v22(incoming, "incoming");
function buildSuccessorMap(v2294) {
  const v2295 = new Map();
  for (const v2296 of v2294.nodes) {
    v2295.set(v2296, []);
  }
  for (const v2297 of v2294.edges) {
    v2295.get(v2297.src).push(v2297.dst);
  }
  return v2295;
}
v22(buildSuccessorMap, "buildSuccessorMap");
function buildSortedSuccessorMap(v2298) {
  const v2299 = buildSuccessorMap(v2298);
  for (const v2300 of v2299.values()) {
    v2300.sort((v2301, v2302) => v2301.localeCompare(v2302));
  }
  return v2299;
}
v22(buildSortedSuccessorMap, "buildSortedSuccessorMap");
function buildInDegreeMap(v2303) {
  const v2304 = new Map();
  for (const v2305 of v2303.nodes) {
    v2304.set(v2305, 0);
  }
  for (const v2306 of v2303.edges) {
    v2304.set(v2306.dst, (v2304.get(v2306.dst) ?? 0) + 1);
  }
  return v2304;
}
v22(buildInDegreeMap, "buildInDegreeMap");
function sortedZeroInDegreeNodes(v2307) {
  return [...v2307.entries()].filter(([, v2308]) => v2308 === 0).map(([v2309]) => v2309).sort((v2310, v2311) => v2310.localeCompare(v2311));
}
v22(sortedZeroInDegreeNodes, "sortedZeroInDegreeNodes");
function buildPredecessorSuccessorMaps(v2312, v2313 = () => true) {
  const v2314 = new Map();
  const v2315 = new Map();
  for (const v2316 of v2312.nodes) {
    v2314.set(v2316, []);
    v2315.set(v2316, []);
  }
  for (const v2317 of v2312.edges) {
    if (!v2313(v2317)) {
      continue;
    }
    v2315.get(v2317.src).push(v2317.dst);
    v2314.get(v2317.dst).push(v2317.src);
  }
  return {
    preds: v2314,
    succs: v2315
  };
}
v22(buildPredecessorSuccessorMaps, "buildPredecessorSuccessorMaps");
function buildLayersFromRanks(v2318, v2319, v2320, v2321) {
  let v2322 = 0;
  for (const v2323 of v2318.nodes) {
    if (v2321?.skipGroups && v2318.nodeById.get(v2323)?.isGroup) {
      continue;
    }
    v2322 = Math.max(v2322, v2320[v2323] ?? 0);
  }
  const v2324 = Array.from({
    length: v2322 + 1
  }, () => []);
  for (const v2325 of v2319) {
    if (v2321?.skipGroups && v2318.nodeById.get(v2325)?.isGroup) {
      continue;
    }
    v2324[Math.max(0, v2320[v2325] ?? 0)].push(v2325);
  }
  return v2324;
}
v22(buildLayersFromRanks, "buildLayersFromRanks");
function topoSortIfAcyclic(v2326) {
  const v2327 = buildInDegreeMap(v2326);
  const v2328 = sortedZeroInDegreeNodes(v2327);
  const v2329 = [];
  const v2330 = buildSortedSuccessorMap(v2326);
  while (v2328.length) {
    const v2331 = v2328.shift();
    v2329.push(v2331);
    for (const v2332 of v2330.get(v2331) ?? []) {
      v2327.set(v2332, (v2327.get(v2332) ?? 0) - 1);
      if ((v2327.get(v2332) ?? 0) === 0) {
        let v2333 = 0;
        while (v2333 < v2328.length && v2328[v2333] < v2332) {
          v2333++;
        }
        v2328.splice(v2333, 0, v2332);
      }
    }
  }
  if (v2329.length === v2326.nodes.length) {
    return v2329;
  } else {
    return null;
  }
}
v22(topoSortIfAcyclic, "topoSortIfAcyclic");
function buildLayerIndex(v2334) {
  const v2335 = new Map();
  let v2336 = 0;
  for (const v2337 of v2334) {
    v2335.set(v2337, v2336);
    v2336++;
  }
  return v2335;
}
v22(buildLayerIndex, "buildLayerIndex");
function countInversions(v2338) {
  const v2339 = new Array(v2338.length);
  const v2340 = v22((v2341, v2342) => {
    if (v2342 - v2341 <= 1) {
      return 0;
    }
    const v2343 = v2341 + v2342 >> 1;
    let v2344 = v2340(v2341, v2343) + v2340(v2343, v2342);
    let v2345 = v2341;
    let v2346 = v2343;
    let v2347 = v2341;
    while (v2345 < v2343 || v2346 < v2342) {
      if (v2346 >= v2342 || v2345 < v2343 && v2338[v2345] <= v2338[v2346]) {
        v2339[v2347++] = v2338[v2345++];
      } else {
        v2339[v2347++] = v2338[v2346++];
        v2344 += v2343 - v2345;
      }
    }
    for (let v2348 = v2341; v2348 < v2342; v2348++) {
      v2338[v2348] = v2339[v2348];
    }
    return v2344;
  }, "count");
  return v2340(0, v2338.length);
}
v22(countInversions, "countInversions");
function removeCycles_DFS(v2349) {
  const v2350 = normalizeGraph(v2349);
  const v2351 = new Map();
  for (const v2352 of v2350.nodes) {
    v2351.set(v2352, []);
  }
  for (const v2353 of v2350.edges) {
    v2351.get(v2353.src).push(v2353);
  }
  for (const v2354 of v2351.values()) {
    v2354.sort((v2355, v2356) => v2355.dst === v2356.dst ? v2355.id.localeCompare(v2356.id) : v2355.dst.localeCompare(v2356.dst));
  }
  const v2357 = Object.create(null);
  for (const v2358 of v2350.nodes) {
    v2357[v2358] = 0;
  }
  const v2359 = [];
  const v2360 = v22(v2361 => {
    v2357[v2361] = 1;
    for (const v2362 of v2351.get(v2361) ?? []) {
      const v2363 = v2362.dst;
      if (v2357[v2363] === 0) {
        v2360(v2363);
      } else if (v2357[v2363] === 1) {
        v2359.push(v2362);
      }
    }
    v2357[v2361] = 2;
  }, "dfs");
  const v2364 = [...v2350.nodes].sort((v2365, v2366) => v2365.localeCompare(v2366));
  for (const v2367 of v2364) {
    if (v2357[v2367] === 0) {
      v2360(v2367);
    }
  }
  const v2368 = new Set(v2359.map(v2369 => v2369.id + ":" + v2369.src + "->" + v2369.dst));
  const v2370 = v2350.edges.map(v2371 => v2368.has(v2371.id + ":" + v2371.src + "->" + v2371.dst) ? {
    id: v2371.id,
    src: v2371.dst,
    dst: v2371.src,
    weight: v2371.weight,
    ref: v2371.ref
  } : v2371);
  const v2372 = {
    nodes: [...v2350.nodes],
    edges: v2370,
    layout: v2350.layout,
    nodeById: new Map(v2350.nodeById)
  };
  return {
    acyclic: v2372,
    reversed: v2359
  };
}
v22(removeCycles_DFS, "removeCycles_DFS");
function buildTopLaneMap(v2373) {
  const v2374 = new Map();
  const v2375 = v22(v2376 => {
    if (v2374.has(v2376)) {
      return v2374.get(v2376);
    }
    const v2377 = v2373.nodeById.get(v2376);
    if (!v2377) {
      v2374.set(v2376, null);
      return null;
    }
    const v2378 = v2377.parentId;
    if (!v2378) {
      v2374.set(v2376, null);
      return null;
    }
    const v2379 = v2375(v2378);
    const v2380 = v2379 ?? v2378;
    v2374.set(v2376, v2380);
    return v2380;
  }, "resolve");
  for (const v2381 of v2373.nodes) {
    v2375(v2381);
  }
  return v2374;
}
v22(buildTopLaneMap, "buildTopLaneMap");
function createTopLaneResolver(v2382) {
  const v2383 = buildTopLaneMap(v2382);
  return v2384 => v2383.get(v2384) ?? null;
}
v22(createTopLaneResolver, "createTopLaneResolver");
function buildTopLaneOrder(v2385) {
  const v2386 = [];
  for (const v2387 of v2385.layout.nodes ?? []) {
    if (v2387.isGroup && !v2387.parentId) {
      v2386.push(v2387.id);
    }
  }
  return [...new Set(v2386)].reverse();
}
v22(buildTopLaneOrder, "buildTopLaneOrder");
function resolveTopLaneOrder(v2388, v2389) {
  const v2390 = buildTopLaneOrder(v2388);
  if (!v2389 || v2389.length === 0) {
    return v2390;
  }
  const v2391 = new Set(v2390);
  const v2392 = new Set();
  const v2393 = [];
  for (const v2394 of v2389) {
    if (!v2391.has(v2394) || v2392.has(v2394)) {
      continue;
    }
    v2392.add(v2394);
    v2393.push(v2394);
  }
  for (const v2395 of v2390) {
    if (v2392.has(v2395)) {
      continue;
    }
    v2393.push(v2395);
  }
  return v2393;
}
v22(resolveTopLaneOrder, "resolveTopLaneOrder");
var PRECISION = {
  EPSILON: 0.000001
};
var LAYERING = {
  GRAVITY_ITERATIONS: 8,
  MAX_CROSSING_OPTIMIZATION_PASSES: 4,
  DEFAULT_COMPACT_SINGLE_INPUT: true
};
var COORDINATES = {
  DEFAULT_LAYER_GAP: 100,
  DEFAULT_NODE_GAP: 40
};
function buildDrivingTree(v2396, v2397) {
  const v2398 = normalizeGraph(v2396);
  const v2399 = v2397?.laneOf ?? (() => null);
  const v2400 = v2397?.rankHint;
  const {
    preds: v2401
  } = buildPredecessorSuccessorMaps(v2398);
  for (const v2402 of v2401.values()) {
    v2402.sort((v2403, v2404) => v2403.localeCompare(v2404));
  }
  const v2405 = topoSortIfAcyclic(v2398) ?? [...v2398.nodes].sort((v2406, v2407) => v2406.localeCompare(v2407));
  const v2408 = new Map();
  for (const [v2409, v2410] of v2405.entries()) {
    v2408.set(v2410, v2409);
  }
  const v2411 = new Map();
  const v2412 = new Map();
  for (const v2413 of v2398.nodes) {
    v2412.set(v2413, []);
  }
  for (const v2414 of v2405) {
    const v2415 = (v2401.get(v2414) ?? []).filter(v2416 => v2411.has(v2416));
    if (v2415.length > 0) {
      const v2417 = chooseParent(v2414, v2415, {
        laneOf: v2399,
        rankHint: v2400,
        topoIndex: v2408
      });
      v2411.set(v2414, v2417);
      v2412.get(v2417).push(v2414);
    } else if (!v2411.has(v2414)) {
      v2411.set(v2414, null);
    }
  }
  for (const v2418 of v2398.nodes) {
    if (!v2411.has(v2418)) {
      v2411.set(v2418, null);
    }
  }
  const v2419 = new Set();
  for (const v2420 of v2398.nodes) {
    if ((v2411.get(v2420) ?? null) === null) {
      v2419.add(v2420);
    }
  }
  const v2421 = [...v2419].sort((v2422, v2423) => {
    const v2424 = v2408.get(v2422) ?? 0;
    const v2425 = v2408.get(v2423) ?? 0;
    if (v2424 === v2425) {
      return v2422.localeCompare(v2423);
    }
    return v2424 - v2425;
  });
  const v2426 = buildAdjacency(v2398);
  const v2427 = new Map();
  for (const [v2428, v2429] of v2426.entries()) {
    v2427.set(v2428, [...v2429].sort((v2430, v2431) => v2430.localeCompare(v2431)));
  }
  const v2432 = assignComponents(v2427);
  const v2433 = computeBlocks(v2427);
  const v2434 = new Map();
  for (const v2435 of v2398.nodes) {
    v2434.set(v2435, []);
  }
  for (const v2436 of v2433) {
    for (const v2437 of v2436.nodes) {
      const v2438 = v2434.get(v2437);
      if (v2438) {
        v2438.push(v2436.id);
      } else {
        v2434.set(v2437, [v2436.id]);
      }
    }
  }
  const v2439 = [];
  const v2440 = [];
  const v2441 = new Set();
  const v2442 = v22(v2443 => {
    if (v2441.has(v2443)) {
      return;
    }
    v2441.add(v2443);
    v2439.push(v2443);
    for (const v2444 of v2412.get(v2443) ?? []) {
      v2442(v2444);
    }
    v2440.push(v2443);
  }, "walk");
  for (const v2445 of v2421) {
    v2442(v2445);
  }
  for (const v2446 of v2405) {
    v2442(v2446);
  }
  return {
    parent: v2411,
    children: v2412,
    roots: v2421,
    componentOf: v2432,
    blocks: v2433,
    nodeBlocks: v2434,
    adjacency: v2427,
    preorder: v2439,
    postorder: v2440,
    topologicalOrder: v2405
  };
}
v22(buildDrivingTree, "buildDrivingTree");
function chooseParent(v2447, v2448, v2449) {
  const v2450 = v2449.laneOf(v2447);
  const v2451 = [...v2448].sort((v2452, v2453) => {
    const v2454 = v2449.laneOf(v2452);
    const v2455 = v2449.laneOf(v2453);
    const v2456 = v2454 != null && v2454 === v2450;
    const v2457 = v2455 != null && v2455 === v2450;
    if (v2456 !== v2457) {
      if (v2456) {
        return -1;
      } else {
        return 1;
      }
    }
    const v2458 = v2449.rankHint?.[v2452];
    const v2459 = v2449.rankHint?.[v2453];
    if (v2458 != null && v2459 != null && v2458 !== v2459) {
      return v2459 - v2458;
    }
    const v2460 = v2449.topoIndex.get(v2452) ?? 0;
    const v2461 = v2449.topoIndex.get(v2453) ?? 0;
    if (v2460 !== v2461) {
      return v2460 - v2461;
    }
    return v2452.localeCompare(v2453);
  });
  return v2451[0];
}
v22(chooseParent, "chooseParent");
function buildAdjacency(v2462) {
  const v2463 = new Map();
  for (const v2464 of v2462.nodes) {
    v2463.set(v2464, new Set());
  }
  for (const v2465 of v2462.edges) {
    v2463.get(v2465.src).add(v2465.dst);
    v2463.get(v2465.dst).add(v2465.src);
  }
  return v2463;
}
v22(buildAdjacency, "buildAdjacency");
function assignComponents(v2466) {
  const v2467 = new Map();
  let v2468 = 0;
  for (const v2469 of v2466.keys()) {
    if (v2467.has(v2469)) {
      continue;
    }
    const v2470 = [v2469];
    while (v2470.length > 0) {
      const v2471 = v2470.pop();
      if (v2467.has(v2471)) {
        continue;
      }
      v2467.set(v2471, v2468);
      for (const v2472 of v2466.get(v2471) ?? []) {
        if (!v2467.has(v2472)) {
          v2470.push(v2472);
        }
      }
    }
    v2468++;
  }
  return v2467;
}
v22(assignComponents, "assignComponents");
function computeBlocks(v2473) {
  const v2474 = new Map();
  const v2475 = new Map();
  const v2476 = [];
  const v2477 = [];
  let v2478 = 0;
  const v2479 = v22((v2480, v2481) => {
    v2474.set(v2480, ++v2478);
    v2475.set(v2480, v2478);
    for (const v2482 of v2473.get(v2480) ?? []) {
      if (v2482 === v2481) {
        continue;
      }
      if (!v2474.has(v2482)) {
        v2476.push([v2480, v2482]);
        v2479(v2482, v2480);
        v2475.set(v2480, Math.min(v2475.get(v2480) ?? v2478, v2475.get(v2482) ?? v2478));
        if ((v2475.get(v2482) ?? 0) >= (v2474.get(v2480) ?? 0)) {
          v2477.push(popBlock(v2480, v2482, v2476, v2477.length));
        }
      } else if ((v2474.get(v2482) ?? 0) < (v2474.get(v2480) ?? 0)) {
        v2476.push([v2480, v2482]);
        v2475.set(v2480, Math.min(v2475.get(v2480) ?? v2478, v2474.get(v2482) ?? v2478));
      }
    }
  }, "visit");
  for (const v2483 of v2473.keys()) {
    if (!v2474.has(v2483)) {
      v2479(v2483, null);
    }
  }
  return v2477;
}
v22(computeBlocks, "computeBlocks");
function popBlock(v2484, v2485, v2486, v2487) {
  const v2488 = [];
  const v2489 = new Set();
  while (v2486.length > 0) {
    const v2490 = v2486.pop();
    v2488.push(v2490);
    v2489.add(v2490[0]);
    v2489.add(v2490[1]);
    if (v2490[0] === v2484 && v2490[1] === v2485 || v2490[0] === v2485 && v2490[1] === v2484) {
      break;
    }
  }
  return {
    id: v2487,
    edges: v2488,
    nodes: [...v2489]
  };
}
v22(popBlock, "popBlock");
function computeSubtreeCrossCounts(v2491, v2492, v2493) {
  const v2494 = [...v2491.nodes];
  const v2495 = new Map();
  for (const [v2496, v2497] of v2494.entries()) {
    v2495.set(v2497, v2496);
  }
  const v2498 = v2494.length;
  const v2499 = new Array(v2498).fill(-1);
  const v2500 = new Array(v2498).fill(0);
  const v2501 = [];
  const v2502 = new Set();
  for (const v2503 of v2494) {
    const v2504 = v2493.parent.get(v2503) ?? null;
    const v2505 = v2495.get(v2503);
    if (v2505 == null) {
      continue;
    }
    if (v2504 == null) {
      v2499[v2505] = -1;
      v2500[v2505] = 0;
      if (!v2502.has(v2503)) {
        v2502.add(v2503);
        v2501.push(v2503);
      }
    }
  }
  while (v2501.length > 0) {
    const v2506 = v2501.shift();
    const v2507 = v2495.get(v2506);
    if (v2507 == null) {
      continue;
    }
    const v2508 = v2493.children.get(v2506) ?? [];
    for (const v2509 of v2508) {
      if (v2502.has(v2509)) {
        continue;
      }
      const v2510 = v2495.get(v2509);
      if (v2510 == null) {
        continue;
      }
      v2499[v2510] = v2507;
      v2500[v2510] = v2500[v2507] + 1;
      v2502.add(v2509);
      v2501.push(v2509);
    }
  }
  for (const v2511 of v2494) {
    if (v2502.has(v2511)) {
      continue;
    }
    const v2512 = v2495.get(v2511);
    if (v2512 == null) {
      continue;
    }
    v2499[v2512] = -1;
    v2500[v2512] = 0;
    v2502.add(v2511);
  }
  const v2513 = Math.max(1, Math.ceil(Math.log2(Math.max(1, v2498))) + 1);
  const v2514 = Array.from({
    length: v2513
  }, () => new Array(v2498).fill(-1));
  for (let v2515 = 0; v2515 < v2498; v2515++) {
    v2514[0][v2515] = v2499[v2515];
  }
  for (let v2516 = 1; v2516 < v2513; v2516++) {
    for (let v2517 = 0; v2517 < v2498; v2517++) {
      const v2518 = v2514[v2516 - 1][v2517];
      v2514[v2516][v2517] = v2518 === -1 ? -1 : v2514[v2516 - 1][v2518];
    }
  }
  const v2519 = v22((v2520, v2521) => {
    if (v2520 === -1 || v2521 === -1) {
      return -1;
    }
    if (v2500[v2520] < v2500[v2521]) {
      [v2520, v2521] = [v2521, v2520];
    }
    const v2522 = v2500[v2520] - v2500[v2521];
    for (let v2523 = 0; v2523 < v2513; v2523++) {
      if (v2522 >> v2523 & 1) {
        v2520 = v2514[v2523][v2520];
        if (v2520 === -1) {
          return -1;
        }
      }
    }
    if (v2520 === v2521) {
      return v2520;
    }
    for (let v2524 = v2513 - 1; v2524 >= 0; v2524--) {
      const v2525 = v2514[v2524][v2520];
      const v2526 = v2514[v2524][v2521];
      if (v2525 === -1 || v2526 === -1) {
        continue;
      }
      if (v2525 !== v2526) {
        v2520 = v2525;
        v2521 = v2526;
      }
    }
    return v2514[0][v2520];
  }, "lcaIndex");
  const v2527 = Array.from({
    length: v2498
  }, () => new Map());
  for (const v2528 of v2491.edges) {
    let v2529 = v2528.src;
    let v2530 = v2528.dst;
    let v2531 = v2492[v2529];
    let v2532 = v2492[v2530];
    if (v2531 == null || v2532 == null) {
      continue;
    }
    if (v2531 > v2532) {
      [v2529, v2530] = [v2530, v2529];
      [v2531, v2532] = [v2532, v2531];
    }
    if (v2531 == null || v2532 == null || v2531 === v2532) {
      continue;
    }
    const v2533 = v2495.get(v2529);
    const v2534 = v2495.get(v2530);
    if (v2533 == null || v2534 == null) {
      continue;
    }
    const v2535 = v2519(v2533, v2534);
    if (v2535 === -1) {
      continue;
    }
    const v2536 = v2527[v2535];
    for (let v2537 = v2531; v2537 < v2532; v2537++) {
      v2536.set(v2537, (v2536.get(v2537) ?? 0) + 1);
    }
  }
  const v2538 = new Map();
  const v2539 = v22((v2540, v2541) => {
    if (v2541.size === 0) {
      return;
    }
    for (const [v2542, v2543] of v2541) {
      v2540.set(v2542, (v2540.get(v2542) ?? 0) + v2543);
    }
  }, "mergeInto");
  const v2544 = new Set();
  const v2545 = v22(v2546 => {
    const v2547 = v2495.get(v2546);
    v2544.add(v2546);
    const v2548 = v2547 == null ? undefined : v2527[v2547];
    const v2549 = v2548 ? new Map(v2548) : new Map();
    const v2550 = v2493.children.get(v2546) ?? [];
    for (const v2551 of v2550) {
      const v2552 = v2545(v2551);
      const v2553 = v2492[v2546];
      if (v2553 != null) {
        let v2554 = v2538.get(v2546);
        if (!v2554) {
          v2554 = new Map();
          v2538.set(v2546, v2554);
        }
        let v2555 = v2552.get(v2553) ?? 0;
        const v2556 = v2492[v2551];
        if (v2556 != null && v2556 > v2553) {
          v2555 += 1;
        }
        v2554.set(v2551, v2555);
      }
      v2539(v2549, v2552);
    }
    return v2549;
  }, "dfs");
  for (const v2557 of v2493.roots) {
    if (!v2544.has(v2557)) {
      v2545(v2557);
    }
  }
  for (const v2558 of v2494) {
    if (!v2544.has(v2558)) {
      v2545(v2558);
    }
  }
  return v2538;
}
v22(computeSubtreeCrossCounts, "computeSubtreeCrossCounts");
function annotateMinimumLayers(v2559, v2560, v2561) {
  const v2562 = new Map();
  const v2563 = v22(v2564 => {
    let v2565 = v2561[v2564] ?? 0;
    const v2566 = [...(v2560.get(v2564) ?? [])];
    v2566.sort(compareByRankThenId(v2561));
    for (const v2567 of v2566) {
      v2563(v2567);
      const v2568 = v2562.get(v2567);
      if (v2568 != null) {
        v2565 = Math.min(v2565, v2568);
      }
    }
    v2562.set(v2564, v2565);
  }, "annotate");
  for (const v2569 of v2559) {
    v2563(v2569);
  }
  return v2562;
}
v22(annotateMinimumLayers, "annotateMinimumLayers");
function compareByRankThenId(v2570) {
  return (v2571, v2572) => {
    const v2573 = v2570[v2571] ?? 0;
    const v2574 = v2570[v2572] ?? 0;
    if (v2573 === v2574) {
      return v2571.localeCompare(v2572);
    } else {
      return v2573 - v2574;
    }
  };
}
v22(compareByRankThenId, "compareByRankThenId");
function emitNodesInTreeOrder(v2575, v2576, v2577, v2578) {
  let v2579 = 0;
  for (const v2580 of v2576) {
    const v2581 = v2577[v2580] ?? 0;
    if (v2581 > v2579) {
      v2579 = v2581;
    }
  }
  const v2582 = Array.from({
    length: v2579 + 1
  }, () => []);
  const v2583 = new Set();
  const v2584 = v22(v2585 => {
    if (v2583.has(v2585)) {
      return;
    }
    v2583.add(v2585);
    const v2586 = v2577[v2585] ?? 0;
    if (!v2582[v2586]) {
      v2582[v2586] = [];
    }
    v2582[v2586].push(v2585);
    for (const v2587 of v2578(v2585)) {
      v2584(v2587);
    }
  }, "emit");
  for (const v2588 of v2575) {
    v2584(v2588);
  }
  for (const v2589 of v2576) {
    if (!v2583.has(v2589)) {
      const v2590 = v2577[v2589] ?? 0;
      if (!v2582[v2590]) {
        v2582[v2590] = [];
      }
      v2582[v2590].push(v2589);
      v2583.add(v2589);
    }
  }
  return v2582;
}
v22(emitNodesInTreeOrder, "emitNodesInTreeOrder");
function deduplicateLayers(v2591) {
  const v2592 = [];
  for (const v2593 of v2591) {
    const v2594 = new Set();
    const v2595 = [];
    for (const v2596 of v2593) {
      if (v2594.has(v2596)) {
        continue;
      }
      v2594.add(v2596);
      v2595.push(v2596);
    }
    v2592.push(v2595);
  }
  return v2592;
}
v22(deduplicateLayers, "deduplicateLayers");
function createChildOrderer(v2597, v2598, v2599, v2600) {
  return v2601 => {
    const v2602 = v2597.get(v2601) ?? [];
    if (v2602.length === 0) {
      return [];
    }
    const v2603 = v2598[v2601] ?? 0;
    const v2604 = [];
    const v2605 = [];
    const v2606 = v2599.get(v2601);
    for (const v2607 of v2602) {
      const v2608 = v2600.get(v2607) ?? v2603;
      if (v2608 > v2603) {
        v2604.push({
          child: v2607,
          min: v2608
        });
      } else {
        v2605.push(v2607);
      }
    }
    v2604.sort((v2609, v2610) => {
      if (v2609.min === v2610.min) {
        return v2609.child.localeCompare(v2610.child);
      }
      return v2609.min - v2610.min;
    });
    v2605.sort((v2611, v2612) => {
      const v2613 = v2606?.get(v2611) ?? 0;
      const v2614 = v2606?.get(v2612) ?? 0;
      if (v2613 !== v2614) {
        return v2613 - v2614;
      }
      const v2615 = v2600.get(v2611) ?? v2603;
      const v2616 = v2600.get(v2612) ?? v2603;
      if (v2615 !== v2616) {
        return v2615 - v2616;
      }
      return v2611.localeCompare(v2612);
    });
    return [...v2604.map(v2617 => v2617.child), ...v2605];
  };
}
v22(createChildOrderer, "createChildOrderer");
function buildMultitreeLayerOrder(v2618, v2619, v2620) {
  const v2621 = buildDrivingTree(v2618, {
    rankHint: v2619,
    laneOf: v2620
  });
  const {
    children: v2622,
    roots: v2623
  } = v2621;
  for (const v2624 of v2618.nodes) {
    if (!v2622.has(v2624)) {
      v2622.set(v2624, []);
    }
  }
  const v2625 = computeSubtreeCrossCounts(v2618, v2619, v2621);
  const v2626 = [...v2623].sort(compareByRankThenId(v2619));
  const v2627 = annotateMinimumLayers(v2626, v2622, v2619);
  const v2628 = createChildOrderer(v2622, v2619, v2625, v2627);
  let v2629 = emitNodesInTreeOrder(v2626, v2618.nodes, v2619, v2628);
  v2629 = deduplicateLayers(v2629);
  return v2629;
}
v22(buildMultitreeLayerOrder, "buildMultitreeLayerOrder");
function countCrossingsBetweenAdjacent(v2630, v2631, v2632) {
  const v2633 = new Set(v2630);
  const v2634 = new Set(v2631);
  const v2635 = buildLayerIndex(v2631);
  const v2636 = [];
  for (const v2637 of v2632) {
    if (v2633.has(v2637.src) && v2634.has(v2637.dst)) {
      v2636.push(v2635.get(v2637.dst));
    }
  }
  return countInversions(v2636);
}
v22(countCrossingsBetweenAdjacent, "countCrossingsBetweenAdjacent");
function totalCrossings(v2638, v2639, v2640) {
  const v2641 = [];
  for (const v2642 of v2639) {
    const v2643 = v2640[v2642.src];
    const v2644 = v2640[v2642.dst];
    if (v2643 == null || v2644 == null || v2643 === v2644) {
      continue;
    }
    let v2645 = v2642.src;
    let v2646 = v2642.dst;
    let v2647 = v2643;
    let v2648 = v2644;
    if (v2643 > v2644) {
      v2645 = v2642.dst;
      v2646 = v2642.src;
      v2647 = v2644;
      v2648 = v2643;
    }
    for (let v2649 = v2647; v2649 < v2648; v2649++) {
      v2641.push({
        id: v2642.id + "@" + v2649,
        src: v2645,
        dst: v2646,
        ref: v2642.ref
      });
    }
  }
  let v2650 = 0;
  for (let v2651 = 0; v2651 + 1 < v2638.length; v2651++) {
    v2650 += countCrossingsBetweenAdjacent(v2638[v2651], v2638[v2651 + 1], v2641);
  }
  return v2650;
}
v22(totalCrossings, "totalCrossings");
function optimizeRanksByCrossings(v2652, v2653) {
  const v2654 = {
    ...v2653
  };
  const {
    preds: v2655
  } = buildPredecessorSuccessorMaps(v2652);
  const v2656 = createTopLaneResolver(v2652);
  const v2657 = buildMultitreeLayerOrder(v2652, v2654, v2656);
  let v2658 = totalCrossings(v2657, v2652.edges, v2654);
  const v2659 = LAYERING.MAX_CROSSING_OPTIMIZATION_PASSES;
  for (let v2660 = 0; v2660 < v2659; v2660++) {
    let v2661 = false;
    const v2662 = [...v2652.nodes].sort((v2663, v2664) => (v2654[v2664] ?? 0) - (v2654[v2663] ?? 0));
    for (const v2665 of v2662) {
      const v2666 = v2654[v2665] ?? 0;
      if (v2666 === 0) {
        continue;
      }
      let v2667 = 0;
      for (const v2668 of v2655.get(v2665) ?? []) {
        v2667 = Math.max(v2667, (v2654[v2668] ?? 0) + 1);
      }
      if (v2667 >= v2666) {
        continue;
      }
      const v2669 = v2666;
      v2654[v2665] = v2667;
      const v2670 = buildMultitreeLayerOrder(v2652, v2654, v2656);
      const v2671 = totalCrossings(v2670, v2652.edges, v2654);
      if (v2671 < v2658) {
        v2658 = v2671;
        v2661 = true;
      } else {
        v2654[v2665] = v2669;
      }
    }
    if (!v2661) {
      break;
    }
  }
  return v2654;
}
v22(optimizeRanksByCrossings, "optimizeRanksByCrossings");
function adjustCrossLaneSources(v2672, v2673) {
  const v2674 = createTopLaneResolver(v2672);
  const v2675 = [...v2672.nodes].sort((v2676, v2677) => (v2673[v2676] ?? 0) - (v2673[v2677] ?? 0) || v2676.localeCompare(v2677));
  for (const v2678 of v2675) {
    const v2679 = v2674(v2678);
    if (!v2679) {
      continue;
    }
    const v2680 = v2672.edges.filter(v2681 => v2681.src === v2678);
    if (v2680.length === 0) {
      continue;
    }
    let v2682 = false;
    let v2683 = 0;
    for (const v2684 of v2680) {
      const v2685 = v2674(v2684.dst);
      if (v2685 == null || v2685 === v2679) {
        v2682 = true;
      } else {
        v2683++;
      }
    }
    if (v2683 === 0 || v2682) {
      continue;
    }
    let v2686 = 0;
    let v2687 = false;
    for (const v2688 of v2672.edges) {
      if (v2688.dst !== v2678) {
        continue;
      }
      const v2689 = v2674(v2688.src);
      if (!v2689) {
        continue;
      }
      if (v2689 === v2679) {
        v2687 = true;
      } else {
        v2686++;
      }
    }
    if (v2686 > 0 || !v2687) {
      continue;
    }
    const v2690 = v2673[v2678] ?? 0;
    const v2691 = v2690 + v2683;
    let v2692 = 0;
    for (const v2693 of v2672.edges) {
      if (v2693.dst === v2678) {
        v2692 = Math.max(v2692, (v2673[v2693.src] ?? 0) + 1);
      }
    }
    const v2694 = Math.max(v2690, v2692, v2691);
    if (v2694 !== v2690) {
      v2673[v2678] = v2694;
    }
  }
}
v22(adjustCrossLaneSources, "adjustCrossLaneSources");
function assignLayers_LongestPath(v2695, v2696) {
  const v2697 = normalizeGraph(v2695);
  const v2698 = topoSortIfAcyclic(v2697) ?? [...v2697.nodes].sort();
  const v2699 = v2696?.compactSingleInput ?? false;
  const v2700 = createTopLaneResolver(v2697);
  let v2701 = Object.create(null);
  for (const v2702 of v2698) {
    const v2703 = incoming(v2697, v2702);
    const v2704 = v2696?.ignoreCrossLaneEdges ? v2703.filter(v2705 => {
      const v2706 = v2700(v2705.src);
      const v2707 = v2700(v2702);
      if (!v2706 || !v2707) {
        return true;
      }
      return v2706 === v2707;
    }) : v2703;
    if (v2704.length === 0) {
      v2701[v2702] = 0;
    } else if (v2699 && v2704.length === 1) {
      const v2708 = v2704[0].src;
      const v2709 = v2700(v2708);
      const v2710 = v2700(v2702);
      if (v2709 !== v2710) {
        v2701[v2702] = v2701[v2708] ?? 0;
      } else {
        v2701[v2702] = (v2701[v2708] ?? 0) + 1;
      }
    } else {
      let v2711 = -Infinity;
      for (const v2712 of v2704) {
        v2711 = Math.max(v2711, (v2701[v2712.src] ?? 0) + 1);
      }
      v2701[v2702] = v2711 === -Infinity ? 0 : v2711;
    }
  }
  if (v2696?.optimizeRanksByCrossings ?? false) {
    v2701 = optimizeRanksByCrossings(v2697, v2701);
  }
  if (v2696?.ignoreCrossLaneEdges) {
    adjustCrossLaneSources(v2697, v2701);
  }
  const v2713 = buildMultitreeLayerOrder(v2697, v2701, v2700);
  return {
    layers: v2713,
    rankOf: v2701,
    dummy: new Set()
  };
}
v22(assignLayers_LongestPath, "assignLayers_LongestPath");
function assignLayers_Gravity(v2714, v2715) {
  const v2716 = normalizeGraph(v2714);
  const v2717 = assignLayers_LongestPath(v2716, {
    compactSingleInput: v2715?.compactSingleInput,
    ignoreCrossLaneEdges: v2715?.ignoreCrossLaneEdges,
    optimizeRanksByCrossings: v2715?.optimizeRanksByCrossings
  });
  const v2718 = {
    ...v2717.rankOf
  };
  const v2719 = createTopLaneResolver(v2716);
  const {
    preds: v2720,
    succs: v2721
  } = buildPredecessorSuccessorMaps(v2716, v2722 => {
    if (v2715?.ignoreCrossLaneEdges) {
      const v2723 = v2719(v2722.src);
      const v2724 = v2719(v2722.dst);
      if (v2723 && v2724 && v2723 !== v2724) {
        return false;
      }
    }
    return true;
  });
  const v2725 = topoSortIfAcyclic(v2716) ?? [...v2716.nodes];
  const v2726 = [...v2725].reverse();
  const v2727 = v22((v2728, v2729) => {
    let v2730 = 0;
    for (const v2731 of v2720.get(v2728) ?? []) {
      v2730 = Math.max(v2730, (v2718[v2731] ?? 0) + 1);
    }
    let v2732 = Number.POSITIVE_INFINITY;
    const v2733 = v2721.get(v2728) ?? [];
    if (v2733.length > 0) {
      v2732 = Math.min(...v2733.map(v2734 => (v2718[v2734] ?? 0) - 1));
    }
    if (!Number.isFinite(v2732)) {
      v2732 = Math.max(v2730, v2729);
    }
    return Math.min(Math.max(v2729, v2730), v2732);
  }, "clampFeasible");
  const v2735 = LAYERING.GRAVITY_ITERATIONS;
  const v2736 = v22(v2737 => {
    let v2738 = false;
    for (const v2739 of v2737) {
      const v2740 = v2720.get(v2739) ?? [];
      const v2741 = v2721.get(v2739) ?? [];
      if (v2740.length === 0 && v2741.length === 0) {
        continue;
      }
      const v2742 = v2740.length > 0 ? v2740.reduce((v2743, v2744) => v2743 + (v2718[v2744] ?? 0) + 1, 0) / v2740.length : v2718[v2739] ?? 0;
      const v2745 = v2741.length > 0 ? v2741.reduce((v2746, v2747) => v2746 + (v2718[v2747] ?? 0) - 1, 0) / v2741.length : v2718[v2739] ?? 0;
      const v2748 = Math.round((v2742 + v2745) / 2);
      const v2749 = v2727(v2739, v2748);
      if (v2749 !== v2718[v2739]) {
        v2718[v2739] = v2749;
        v2738 = true;
      }
    }
    return v2738;
  }, "relaxOrder");
  for (let v2750 = 0; v2750 < v2735; v2750++) {
    const v2751 = v2736(v2725);
    const v2752 = v2736(v2726);
    if (!v2751 && !v2752) {
      break;
    }
  }
  for (const v2753 of v2725) {
    let v2754 = 0;
    for (const v2755 of v2720.get(v2753) ?? []) {
      v2754 = Math.max(v2754, (v2718[v2755] ?? 0) + 1);
    }
    if ((v2718[v2753] ?? 0) < v2754) {
      v2718[v2753] = v2754;
    }
  }
  for (const v2756 of v2726) {
    const v2757 = v2721.get(v2756) ?? [];
    if (v2757.length > 0) {
      const v2758 = Math.min(...v2757.map(v2759 => (v2718[v2759] ?? 0) - 1));
      if ((v2718[v2756] ?? 0) > v2758) {
        v2718[v2756] = v2758;
      }
    }
  }
  const v2760 = buildLayersFromRanks(v2716, v2725, v2718);
  return {
    layers: v2760,
    rankOf: v2718,
    dummy: new Set()
  };
}
v22(assignLayers_Gravity, "assignLayers_Gravity");
function topoSortByGenerationIfAcyclic(v2761) {
  const v2762 = buildInDegreeMap(v2761);
  const v2763 = buildSortedSuccessorMap(v2761);
  let v2764 = sortedZeroInDegreeNodes(v2762);
  const v2765 = [];
  while (v2764.length > 0) {
    const v2766 = [];
    for (const v2767 of v2764) {
      v2765.push(v2767);
      for (const v2768 of v2763.get(v2767) ?? []) {
        v2762.set(v2768, (v2762.get(v2768) ?? 0) - 1);
        if ((v2762.get(v2768) ?? 0) === 0) {
          v2766.push(v2768);
        }
      }
    }
    v2764 = v2766.sort((v2769, v2770) => v2769.localeCompare(v2770));
  }
  if (v2765.length === v2761.nodes.length) {
    return v2765;
  } else {
    return null;
  }
}
v22(topoSortByGenerationIfAcyclic, "topoSortByGenerationIfAcyclic");
function assignLayers_LaneAwareCompact(v2771, v2772) {
  const v2773 = normalizeGraph(v2771);
  const v2774 = v2772?.direction === "LR" ? topoSortByGenerationIfAcyclic(v2773) ?? [...v2773.nodes].sort() : topoSortIfAcyclic(v2773) ?? [...v2773.nodes].sort();
  const v2775 = createTopLaneResolver(v2773);
  const v2776 = v22(v2777 => v2775(v2777) ?? v2777, "laneOf");
  const v2778 = Object.create(null);
  const v2779 = new Map();
  const v2780 = v22((v2781, v2782) => {
    const v2783 = v2772?.ignoreCrossLaneEdges ?? true;
    if (v2783) {
      if (v2776(v2781) === v2776(v2782)) {
        return 1;
      } else {
        return 0;
      }
    }
    return 1;
  }, "edgeWeight");
  for (const v2784 of v2774) {
    const v2785 = v2773.nodeById.get(v2784);
    if (v2785?.isGroup) {
      continue;
    }
    const v2786 = incoming(v2773, v2784);
    let v2787 = 0;
    if (v2786.length > 0) {
      for (const v2788 of v2786) {
        const v2789 = v2788.src;
        const v2790 = v2778[v2789] ?? 0;
        v2787 = Math.max(v2787, v2790 + v2780(v2789, v2784));
      }
    }
    const v2791 = v2776(v2784);
    const v2792 = v2779.get(v2791) ?? 0;
    const v2793 = Math.max(v2787, v2792);
    v2778[v2784] = v2793;
    v2779.set(v2791, v2793 + 1);
  }
  const v2794 = buildLayersFromRanks(v2773, v2774, v2778, {
    skipGroups: true
  });
  return {
    layers: v2794,
    rankOf: v2778,
    dummy: new Set()
  };
}
v22(assignLayers_LaneAwareCompact, "assignLayers_LaneAwareCompact");
function makeProperLayering(v2795, v2796) {
  const v2797 = normalizeGraph(v2796);
  const {
    rankOf: v2798
  } = v2795;
  const v2799 = v2795.layers.map(v2800 => [...v2800]);
  const v2801 = new Set(v2795.dummy ? [...v2795.dummy] : []);
  let v2802 = 0;
  const v2803 = new Map(v2797.nodeById);
  const v2804 = v22(v2805 => {
    const v2806 = "placeholder-" + v2802++;
    const v2807 = {
      id: v2806,
      isGroup: false,
      isDummy: true,
      width: 0,
      height: 0
    };
    v2803.set(v2806, v2807);
    v2801.add(v2806);
    while (v2799.length <= v2805) {
      v2799.push([]);
    }
    v2799[v2805].push(v2806);
    v2798[v2806] = v2805;
    return v2806;
  }, "addDummyAt");
  const v2808 = [...v2797.edges].sort((v2809, v2810) => v2809.id === v2810.id ? v2809.src === v2810.src ? v2809.dst.localeCompare(v2810.dst) : v2809.src.localeCompare(v2810.src) : v2809.id.localeCompare(v2810.id));
  const v2811 = [];
  for (const v2812 of v2808) {
    const v2813 = v2798[v2812.src] ?? 0;
    const v2814 = v2798[v2812.dst] ?? 0;
    if (v2814 - v2813 <= 1) {
      v2811.push(v2812);
      continue;
    }
    let v2815 = v2812.src;
    for (let v2816 = v2813 + 1, v2817 = 0; v2816 < v2814; v2816++, v2817++) {
      const v2818 = v2804(v2816);
      v2811.push({
        id: v2812.id + "#" + v2817,
        src: v2815,
        dst: v2818,
        weight: v2812.weight,
        ref: v2812.ref
      });
      v2815 = v2818;
    }
    const v2819 = v2814 - v2813 - 2;
    v2811.push({
      id: v2812.id + "#" + Math.max(v2819 + 1, 0),
      src: v2815,
      dst: v2812.dst,
      weight: v2812.weight,
      ref: v2812.ref
    });
  }
  const v2820 = [...v2797.nodes, ...[...v2801].filter(v2821 => !v2797.nodes.includes(v2821))];
  const v2822 = {
    nodes: v2820,
    edges: v2811,
    layout: v2797.layout,
    nodeById: v2803
  };
  return {
    layering: {
      layers: v2799,
      rankOf: v2798,
      dummy: v2801
    },
    graphWithDummies: v2822
  };
}
v22(makeProperLayering, "makeProperLayering");
function median(v2823) {
  const v2824 = v2823.length;
  if (v2824 === 0) {
    return Number.POSITIVE_INFINITY;
  }
  const v2825 = [...v2823].sort((v2826, v2827) => v2826 - v2827);
  if (v2824 % 2 === 1) {
    return v2825[(v2824 - 1) / 2];
  }
  return (v2825[v2824 / 2 - 1] + v2825[v2824 / 2]) * 0.5;
}
v22(median, "median");
function barycenter(v2828) {
  if (v2828.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  const v2829 = v2828.reduce((v2830, v2831) => v2830 + v2831, 0);
  return v2829 / v2828.length;
}
v22(barycenter, "barycenter");
function neighborPositionsFor(v2832, v2833, v2834, v2835) {
  const v2836 = new Map();
  for (const v2837 of v2832) {
    v2836.set(v2837, []);
  }
  for (const v2838 of v2834) {
    if (v2835 === "down") {
      if (v2833.has(v2838.src) && v2836.has(v2838.dst)) {
        v2836.get(v2838.dst).push(v2833.get(v2838.src));
      }
    } else if (v2833.has(v2838.dst) && v2836.has(v2838.src)) {
      v2836.get(v2838.src).push(v2833.get(v2838.dst));
    }
  }
  return v2836;
}
v22(neighborPositionsFor, "neighborPositionsFor");
function currentOrderTieBreak(v2839, v2840, v2841) {
  const v2842 = v2841.get(v2839) ?? 0;
  const v2843 = v2841.get(v2840) ?? 0;
  if (v2842 !== v2843) {
    return v2842 - v2843;
  } else {
    return v2839.localeCompare(v2840);
  }
}
v22(currentOrderTieBreak, "currentOrderTieBreak");
function countCrossingsBetweenAdjacent2(v2844, v2845, v2846) {
  const v2847 = new Set(v2844);
  const v2848 = new Set(v2845);
  const v2849 = buildLayerIndex(v2844);
  const v2850 = buildLayerIndex(v2845);
  const v2851 = [];
  for (const v2852 of v2846) {
    if (v2847.has(v2852.src) && v2848.has(v2852.dst)) {
      v2851.push({
        u: v2849.get(v2852.src),
        v: v2850.get(v2852.dst)
      });
    }
  }
  v2851.sort((v2853, v2854) => v2853.u === v2854.u ? v2853.v - v2854.v : v2853.u - v2854.u);
  const v2855 = v2851.map(v2856 => v2856.v);
  return countInversions(v2855);
}
v22(countCrossingsBetweenAdjacent2, "countCrossingsBetweenAdjacent");
function sortByHeuristic(v2857, v2858, v2859) {
  return [...v2857].sort((v2860, v2861) => {
    const v2862 = median(v2858.get(v2860) ?? []);
    const v2863 = median(v2858.get(v2861) ?? []);
    if (v2862 === v2863) {
      return currentOrderTieBreak(v2860, v2861, v2859);
    }
    if (!isFinite(v2862)) {
      return 1;
    }
    if (!isFinite(v2863)) {
      return -1;
    }
    return v2862 - v2863;
  });
}
v22(sortByHeuristic, "sortByHeuristic");
function reorderLayer(v2864, v2865, v2866, v2867, v2868, v2869) {
  const v2870 = buildLayerIndex(v2864);
  const v2871 = buildLayerIndex(v2865);
  const v2872 = neighborPositionsFor(v2865, v2870, v2866, v2867);
  if (!v2868 || !v2869 || v2869.length === 0) {
    return sortByHeuristic(v2865, v2872, v2871);
  }
  const v2873 = new Map();
  for (const v2874 of v2865) {
    const v2875 = v2868(v2874);
    const v2876 = v2873.get(v2875) ?? [];
    v2876.push(v2874);
    v2873.set(v2875, v2876);
  }
  const v2877 = [];
  for (const v2878 of v2869) {
    const v2879 = v2873.get(v2878);
    if (!v2879 || v2879.length === 0) {
      continue;
    }
    const v2880 = sortByHeuristic(v2879, v2872, v2871);
    v2877.push(...v2880);
  }
  const v2881 = v2873.get(null);
  if (v2881 && v2881.length > 0) {
    const v2882 = sortByHeuristic(v2881, v2872, v2871);
    for (const v2883 of v2882) {
      const v2884 = barycenter(v2872.get(v2883) ?? []);
      let v2885 = v2877.length;
      if (isFinite(v2884)) {
        for (const [v2886, v2887] of v2877.entries()) {
          const v2888 = barycenter(v2872.get(v2887) ?? []);
          if (v2884 < v2888) {
            v2885 = v2886;
            break;
          }
        }
      }
      v2877.splice(v2885, 0, v2883);
    }
  }
  return v2877;
}
v22(reorderLayer, "reorderLayer");
function transposeImprove(v2889, v2890, v2891, v2892, v2893) {
  const v2894 = [...v2890];
  const v2895 = new Set(v2889);
  const v2896 = new Set(v2890);
  const v2897 = v2892 ? new Set(v2892) : null;
  const v2898 = v2891.filter(v2899 => v2895.has(v2899.src) && v2896.has(v2899.dst));
  const v2900 = v2897 ? v2891.filter(v2901 => v2896.has(v2901.src) && v2897.has(v2901.dst)) : undefined;
  const v2902 = v22(v2903 => {
    let v2904 = countCrossingsBetweenAdjacent2(v2889, v2903, v2898);
    if (v2900 && v2892) {
      v2904 += countCrossingsBetweenAdjacent2(v2903, v2892, v2900);
    }
    return v2904;
  }, "crossingScore");
  const v2905 = v2893 ? new Map() : null;
  if (v2893 && v2905) {
    for (const v2906 of v2890) {
      v2905.set(v2906, v2893(v2906));
    }
  }
  let v2907 = true;
  let v2908 = v2902(v2894);
  while (v2907) {
    v2907 = false;
    for (let v2909 = 0; v2909 + 1 < v2894.length; v2909++) {
      if (v2905) {
        const v2910 = v2905.get(v2894[v2909]);
        const v2911 = v2905.get(v2894[v2909 + 1]);
        if (v2910 !== v2911) {
          continue;
        }
      }
      const v2912 = v2908;
      [v2894[v2909], v2894[v2909 + 1]] = [v2894[v2909 + 1], v2894[v2909]];
      const v2913 = v2902(v2894);
      if (v2913 < v2912) {
        v2908 = v2913;
        v2907 = true;
      } else {
        [v2894[v2909], v2894[v2909 + 1]] = [v2894[v2909 + 1], v2894[v2909]];
      }
    }
  }
  return v2894;
}
v22(transposeImprove, "transposeImprove");
function orderLayers(v2914, v2915, v2916) {
  const v2917 = v2914.layers.map(v2918 => [...v2918]);
  const v2919 = v2915.edges;
  const v2920 = createTopLaneResolver(v2915);
  const v2921 = resolveTopLaneOrder(v2915, v2916?.laneOrder);
  for (let v2922 = 0; v2922 < 3; v2922++) {
    for (let v2923 = 1; v2923 < v2917.length; v2923++) {
      v2917[v2923] = reorderLayer(v2917[v2923 - 1], v2917[v2923], v2919, "down", v2920, v2921);
      v2917[v2923] = transposeImprove(v2917[v2923 - 1], v2917[v2923], v2919, v2917[v2923 + 1], v2920);
    }
    for (let v2924 = v2917.length - 2; v2924 >= 0; v2924--) {
      v2917[v2924] = reorderLayer(v2917[v2924 + 1], v2917[v2924], v2919, "up", v2920, v2921);
      v2917[v2924] = transposeImprove(v2917[v2924 + 1], v2917[v2924], v2919, v2917[v2924 - 1], v2920);
    }
  }
  return {
    layers: v2917
  };
}
v22(orderLayers, "orderLayers");
function assignCoordinates(v2925, v2926, v2927) {
  const v2928 = v2927?.layerGap ?? COORDINATES.DEFAULT_LAYER_GAP;
  const v2929 = v2927?.nodeGap ?? COORDINATES.DEFAULT_NODE_GAP;
  const v2930 = v2927?.laneGap ?? v2929 * 2;
  const v2931 = v2927?.direction ?? "TB";
  const v2932 = v2931 === "LR" || v2931 === "RL";
  const v2933 = v2925.layers;
  const v2934 = Object.create(null);
  const v2935 = Object.create(null);
  const v2936 = v22(v2937 => v2926.nodeById.get(v2937), "getNode");
  const v2938 = v22(v2939 => v2936(v2939)?.width ?? 0, "getWidth");
  const v2940 = v22(v2941 => v2936(v2941)?.height ?? 0, "getHeight");
  const v2942 = createTopLaneResolver(v2926);
  const v2943 = resolveTopLaneOrder(v2926, v2927?.laneOrder);
  const v2944 = v2933.map(v2945 => v2945.reduce((v2946, v2947) => Math.max(v2946, v2940(v2947)), 0));
  const v2948 = [];
  if (v2932) {
    for (let v2949 = 0; v2949 + 1 < v2933.length; v2949++) {
      const v2950 = v2933[v2949].reduce((v2951, v2952) => Math.max(v2951, v2938(v2952)), 0);
      const v2953 = v2933[v2949 + 1].reduce((v2954, v2955) => Math.max(v2954, v2938(v2955)), 0);
      const v2956 = v2944[v2949];
      const v2957 = v2944[v2949 + 1];
      const v2958 = v2956 / 2 + v2957 / 2;
      const v2959 = (v2950 + v2953) / 2;
      const v2960 = Math.max(0, v2959 - v2958 - v2928);
      v2948.push(v2960);
    }
  }
  const v2961 = new Set();
  for (const v2962 of v2933) {
    for (const v2963 of v2962) {
      v2961.add(v2942(v2963));
    }
  }
  const v2964 = v2961.has(null);
  const v2965 = v2943.filter(v2966 => v2961.has(v2966));
  const v2967 = [...(v2964 ? [null] : []), ...v2965];
  const v2968 = Object.create(null);
  for (const v2969 of v2965) {
    v2968[v2969] = 0;
  }
  if (v2964) {
    v2968.null = 0;
  }
  for (const v2970 of v2933) {
    const v2971 = Object.create(null);
    const v2972 = [];
    for (const v2973 of v2970) {
      const v2974 = v2942(v2973);
      if (v2974 === null) {
        v2972.push(v2973);
      } else {
        (v2971[v2974] ||= []).push(v2973);
      }
    }
    for (const [v2975, v2976] of Object.entries(v2971)) {
      const v2977 = v2976.reduce((v2978, v2979) => v2978 + v2938(v2979), 0) + v2929 * Math.max(0, v2976.length - 1);
      v2968[v2975] = Math.max(v2968[v2975] ?? 0, v2977);
    }
    if (v2964 && v2972.length) {
      const v2980 = v2972.reduce((v2981, v2982) => v2981 + v2938(v2982), 0) + v2929 * Math.max(0, v2972.length - 1);
      v2968.null = Math.max(v2968.null ?? 0, v2980);
    }
  }
  const v2983 = new Map();
  {
    const v2984 = v2967.map(v2985 => (v2985 === null ? v2968.null : v2968[v2985]) ?? 0);
    const v2986 = v2984.reduce((v2987, v2988) => v2987 + v2988, 0) + v2930 * Math.max(0, v2967.length - 1);
    let v2989 = -v2986 / 2;
    for (let v2990 = 0; v2990 < v2967.length; v2990++) {
      const v2991 = v2967[v2990];
      const v2992 = v2984[v2990] ?? 0;
      const v2993 = v2989 + v2992 / 2;
      v2983.set(v2991, v2993);
      v2989 += v2992;
      if (v2990 < v2967.length - 1) {
        v2989 += v2930;
      }
    }
  }
  let v2994 = 0;
  for (const [v2995, v2996] of v2933.entries()) {
    const v2997 = v2944[v2995] ?? 0;
    const v2998 = new Map();
    for (const v2999 of v2996) {
      const v3000 = v2942(v2999);
      const v3001 = v2998.get(v3000) ?? [];
      v3001.push(v2999);
      v2998.set(v3000, v3001);
    }
    for (const v3002 of v2967) {
      const v3003 = v2998.get(v3002) ?? [];
      if (v3003.length === 0) {
        continue;
      }
      const v3004 = v2983.get(v3002);
      if (v3003.length === 1) {
        const v3005 = v3003[0];
        v2934[v3005] = v3004;
        v2935[v3005] = v2994 + v2997 / 2;
      } else {
        const v3006 = v3003.map(v3007 => v2938(v3007));
        const v3008 = v3006.reduce((v3009, v3010) => v3009 + v3010, 0) + v2929 * (v3003.length - 1);
        let v3011 = v3004 - v3008 / 2;
        for (const [v3012, v3013] of v3003.entries()) {
          const v3014 = v3006[v3012];
          v2934[v3013] = v3011 + v3014 / 2;
          v2935[v3013] = v2994 + v2997 / 2;
          v3011 += v3014 + v2929;
        }
      }
    }
    const v3015 = v2948[v2995] ?? 0;
    v2994 += v2997 + v2928 + v3015;
  }
  const v3016 = new Map();
  for (const v3017 of v2926.edges) {
    const v3018 = v3017.ref.id;
    if (!v3016.has(v3018)) {
      v3016.set(v3018, []);
    }
    v3016.get(v3018).push(v3017);
  }
  for (const [, v3019] of v3016) {
    if (v3019.length === 0) {
      continue;
    }
    const v3020 = v3019[0].ref;
    const v3021 = v3020.start;
    const v3022 = v3020.end;
    if (v3021 == null || v3022 == null) {
      continue;
    }
    const v3023 = Math.round(((v2934[v3021] ?? 0) + (v2934[v3022] ?? 0)) / 2);
    const v3024 = new Set();
    for (const v3025 of v3019) {
      v3024.add(v3025.src);
      v3024.add(v3025.dst);
    }
    for (const v3026 of v3024) {
      if (v3026 === v3021 || v3026 === v3022) {
        continue;
      }
      const v3027 = v2926.nodeById.get(v3026);
      if (v3027?.isDummy) {
        v2934[v3026] = v3023;
      }
    }
  }
  return {
    x: v2934,
    y: v2935
  };
}
v22(assignCoordinates, "assignCoordinates");
var AUTOMATIC_LANE_ORDERING_RESTARTS = 8;
function hashString(v3028) {
  let v3029 = 2166136261;
  for (let v3030 = 0; v3030 < v3028.length; v3030++) {
    v3029 ^= v3028.charCodeAt(v3030);
    v3029 = Math.imul(v3029, 16777619);
  }
  return v3029 >>> 0;
}
v22(hashString, "hashString");
function mulberry32(v3031) {
  let v3032 = v3031 >>> 0;
  return () => {
    v3032 += 1831565813;
    let v3033 = v3032;
    v3033 = Math.imul(v3033 ^ v3033 >>> 15, v3033 | 1);
    v3033 ^= v3033 + Math.imul(v3033 ^ v3033 >>> 7, v3033 | 61);
    return ((v3033 ^ v3033 >>> 14) >>> 0) / 4294967296;
  };
}
v22(mulberry32, "mulberry32");
function deterministicShuffle(v3034, v3035) {
  const v3036 = [...v3034];
  const v3037 = mulberry32(v3035);
  for (let v3038 = v3036.length - 1; v3038 > 0; v3038--) {
    const v3039 = Math.floor(v3037() * (v3038 + 1));
    [v3036[v3038], v3036[v3039]] = [v3036[v3039], v3036[v3038]];
  }
  return v3036;
}
v22(deterministicShuffle, "deterministicShuffle");
function sourceDistance(v3040, v3041) {
  let v3042 = 0;
  for (const [v3043, v3044] of v3040.entries()) {
    v3042 += Math.abs(v3043 - (v3041.get(v3044) ?? v3043));
  }
  return v3042;
}
v22(sourceDistance, "sourceDistance");
function laneArrangementCost(v3045, v3046) {
  const v3047 = new Map();
  for (const [v3048, v3049] of v3045.entries()) {
    v3047.set(v3049, v3048);
  }
  let v3050 = 0;
  for (const {
    a: v3051,
    b: v3052,
    weight: v3053
  } of v3046) {
    const v3054 = v3047.get(v3051);
    const v3055 = v3047.get(v3052);
    if (v3054 == null || v3055 == null) {
      continue;
    }
    v3050 += v3053 * Math.abs(v3054 - v3055);
  }
  return v3050;
}
v22(laneArrangementCost, "laneArrangementCost");
function buildWeightedLaneEdges(v3056) {
  const v3057 = buildTopLaneOrder(v3056);
  if (v3057.length < 2) {
    return [];
  }
  const v3058 = new Map(v3057.map((v3059, v3060) => [v3059, v3060]));
  const v3061 = createTopLaneResolver(v3056);
  const v3062 = new Map();
  for (const v3063 of v3056.layout.edges ?? []) {
    if (v3063.isLayoutOnly) {
      continue;
    }
    const v3064 = typeof v3063.start === "string" ? v3063.start : undefined;
    const v3065 = typeof v3063.end === "string" ? v3063.end : undefined;
    if (!v3064 || !v3065 || !v3056.nodeById.has(v3064) || !v3056.nodeById.has(v3065)) {
      continue;
    }
    const v3066 = v3061(v3064);
    const v3067 = v3061(v3065);
    if (!v3066 || !v3067 || v3066 === v3067) {
      continue;
    }
    const v3068 = v3058.get(v3066);
    const v3069 = v3058.get(v3067);
    if (v3068 == null || v3069 == null) {
      continue;
    }
    const [v3070, v3071] = v3068 <= v3069 ? [v3066, v3067] : [v3067, v3066];
    const v3072 = v3070 + "\0" + v3071;
    const v3073 = v3062.get(v3072);
    if (v3073) {
      v3073.weight++;
    } else {
      v3062.set(v3072, {
        a: v3070,
        b: v3071,
        weight: 1
      });
    }
  }
  return [...v3062.values()];
}
v22(buildWeightedLaneEdges, "buildWeightedLaneEdges");
function greedySwitch(v3074, v3075, v3076) {
  const v3077 = [...v3074];
  let v3078 = laneArrangementCost(v3077, v3075);
  let v3079 = true;
  let v3080 = 0;
  const v3081 = Math.max(1, v3077.length);
  while (v3079 && v3080 < v3081) {
    v3079 = false;
    v3080++;
    for (let v3082 = 0; v3082 + 1 < v3077.length; v3082++) {
      [v3077[v3082], v3077[v3082 + 1]] = [v3077[v3082 + 1], v3077[v3082]];
      const v3083 = laneArrangementCost(v3077, v3075);
      if (v3083 < v3078) {
        v3078 = v3083;
        v3079 = true;
      } else {
        [v3077[v3082], v3077[v3082 + 1]] = [v3077[v3082 + 1], v3077[v3082]];
      }
    }
  }
  return {
    order: v3077,
    cost: v3078,
    sourceDistance: sourceDistance(v3077, v3076)
  };
}
v22(greedySwitch, "greedySwitch");
function isBetterCandidate(v3084, v3085) {
  if (v3084.cost !== v3085.cost) {
    return v3084.cost < v3085.cost;
  }
  return v3084.sourceDistance < v3085.sourceDistance;
}
v22(isBetterCandidate, "isBetterCandidate");
function seedForRestart(v3086, v3087, v3088) {
  const v3089 = [...v3087].sort((v3090, v3091) => v3090.a === v3091.a ? v3090.b.localeCompare(v3091.b) : v3090.a.localeCompare(v3091.a)).map(({
    a: v3092,
    b: v3093,
    weight: v3094
  }) => v3092 + ":" + v3093 + ":" + v3094).join("|");
  return hashString(v3086.join("|") + "#" + v3089 + "#" + v3088);
}
v22(seedForRestart, "seedForRestart");
function optimizeTopLaneOrder(v3095, v3096 = {}) {
  const v3097 = buildTopLaneOrder(v3095);
  if (v3097.length < 2) {
    return v3097;
  }
  const v3098 = buildWeightedLaneEdges(v3095);
  if (v3098.length === 0) {
    return v3097;
  }
  const v3099 = new Map(v3097.map((v3100, v3101) => [v3100, v3101]));
  let v3102 = greedySwitch(v3097, v3098, v3099);
  const v3103 = Math.max(0, v3096.restarts ?? AUTOMATIC_LANE_ORDERING_RESTARTS);
  for (let v3104 = 0; v3104 < v3103; v3104++) {
    const v3105 = seedForRestart(v3097, v3098, v3104);
    const v3106 = deterministicShuffle(v3097, v3105);
    const v3107 = greedySwitch(v3106, v3098, v3099);
    if (isBetterCandidate(v3107, v3102)) {
      v3102 = v3107;
    }
  }
  return v3102.order;
}
v22(optimizeTopLaneOrder, "optimizeTopLaneOrder");
function sugiyamaLayout(v3108, v3109) {
  const v3110 = v3109?.ignoreCrossLaneEdges ?? true;
  const v3111 = v3109?.optimizeRanksByCrossings ?? true;
  const v3112 = normalizeGraph(v3108);
  const v3113 = v3109?.automaticLaneOrdering ? optimizeTopLaneOrder(v3112, {
    restarts: AUTOMATIC_LANE_ORDERING_RESTARTS
  }) : undefined;
  const v3114 = removeCycles_DFS(v3112);
  const v3115 = v3114.acyclic;
  const v3116 = v3110 ? assignLayers_LaneAwareCompact(v3115, {
    compactSingleInput: v3109?.compactSingleInput ?? LAYERING.DEFAULT_COMPACT_SINGLE_INPUT,
    ignoreCrossLaneEdges: true,
    direction: v3109?.direction
  }) : assignLayers_Gravity(v3115, {
    compactSingleInput: v3109?.compactSingleInput ?? LAYERING.DEFAULT_COMPACT_SINGLE_INPUT,
    ignoreCrossLaneEdges: false,
    optimizeRanksByCrossings: v3111
  });
  const {
    layering: v3117,
    graphWithDummies: v3118
  } = makeProperLayering(v3116, v3115);
  const v3119 = orderLayers(v3117, v3118, {
    laneOrder: v3113
  });
  const v3120 = assignCoordinates(v3119, v3118, {
    layerGap: v3109?.layerGap,
    nodeGap: v3109?.nodeGap,
    direction: v3109?.direction,
    laneOrder: v3113
  });
  return {
    acyclic: v3115,
    reversed: v3114.reversed,
    layering: v3117,
    ordered: v3119,
    coordinates: v3120
  };
}
v22(sugiyamaLayout, "sugiyamaLayout");
var EPS7 = PRECISION.EPSILON;
var NODE_PADDING = 8;
var HORIZONTAL_PIPE_MARGIN = 15;
var VERTICAL_PIPE_MARGIN = 15;
var ROUTING_MARGIN = 25;
var ANCHOR_OFFSET = 20;
var TRACK_SPACING = 10;
function chooseOrthogonalSide(v3121, v3122, v3123) {
  const v3124 = v3121.x ?? 0;
  const v3125 = v3121.y ?? 0;
  const v3126 = v3122.x - v3124;
  const v3127 = v3122.y - v3125;
  const v3128 = Math.abs(v3126);
  const v3129 = Math.abs(v3127);
  if (v3128 < EPS7 && v3129 < EPS7) {
    return v3123;
  }
  const v3130 = 3;
  if (v3129 > EPS7 && v3129 * v3130 >= v3128) {
    if (v3127 > 0) {
      return "bottom";
    } else {
      return "top";
    }
  }
  if (v3128 > EPS7) {
    if (v3126 > 0) {
      return "right";
    } else {
      return "left";
    }
  }
  return v3123;
}
v22(chooseOrthogonalSide, "chooseOrthogonalSide");
function sharedLineEndpointCoord(v3131, v3132) {
  if (Math.abs(v3131.to - v3132.from) < EPS7 || Math.abs(v3131.to - v3132.to) < EPS7) {
    return v3131.to;
  } else {
    return v3131.from;
  }
}
v22(sharedLineEndpointCoord, "sharedLineEndpointCoord");
function pointOnLine(v3133, v3134) {
  if (v3133.orient === "vertical") {
    return {
      x: v3133.coord,
      y: v3134
    };
  } else {
    return {
      x: v3134,
      y: v3133.coord
    };
  }
}
v22(pointOnLine, "pointOnLine");
function routeEdgesOrthogonal(v3135, v3136) {
  const v3137 = v3135.nodes ?? [];
  const v3138 = v3135.edges ?? [];
  const v3139 = [];
  for (const v3140 of v3138) {
    if (v3140.isLayoutOnly) {
      continue;
    }
    v3139.push({
      ...v3140,
      __originalEdge: v3140
    });
  }
  const v3141 = new Map();
  const v3142 = new Map();
  const v3143 = [];
  const v3144 = v3136 === "LR";
  for (const v3145 of v3137) {
    v3141.set(v3145.id, v3145);
  }
  const v3146 = v3137.filter(v3147 => v3147.isGroup && !v3147.parentId);
  for (const v3148 of v3146) {
    const v3149 = {
      id: v3148.id
    };
    const v3150 = v22(v3151 => {
      v3142.set(v3151.id, v3149);
      v3137.filter(v3152 => v3152.parentId === v3151.id).forEach(v3150);
    }, "assignLane");
    v3150(v3148);
  }
  const v3153 = v3137.filter(v3154 => !v3154.isGroup && !v3154.isEdgeLabel).map(v3155 => {
    const v3156 = v3155.width ?? 10;
    const v3157 = v3155.height ?? 10;
    const v3158 = v3155.x ?? 0;
    const v3159 = v3155.y ?? 0;
    const v3160 = NODE_PADDING;
    return {
      nodeId: v3155.id,
      minX: v3158 - v3156 / 2 - v3160,
      maxX: v3158 + v3156 / 2 + v3160,
      minY: v3159 - v3157 / 2 - v3160,
      maxY: v3159 + v3157 / 2 + v3160,
      visualXHalfExtent: v3144 ? v3157 / 2 + v3160 : v3156 / 2 + v3160
    };
  });
  const v3161 = v22((v3162, v3163, v3164, v3165) => {
    let v3166 = v3143.find(v3167 => v3167.orientation === v3162 && Math.abs(v3167.coord - v3163) < 1);
    if (!v3166) {
      v3166 = {
        id: "pipe-" + v3162 + "-" + v3163.toFixed(0),
        orientation: v3162,
        coord: v3163,
        spanMin: v3164,
        spanMax: v3165,
        tracks: []
      };
      v3143.push(v3166);
    }
    v3166.spanMin = Math.min(v3166.spanMin, v3164);
    v3166.spanMax = Math.max(v3166.spanMax, v3165);
    return v3166;
  }, "getOrAddPipe");
  const v3168 = v22((v3169, v3170) => {
    const v3171 = v3169.width ?? 10;
    const v3172 = v3169.height ?? 10;
    const v3173 = v3169.x ?? 0;
    const v3174 = v3169.y ?? 0;
    switch (v3170) {
      case "top":
        return {
          x: v3173,
          y: v3174 - v3172 / 2
        };
      case "bottom":
        return {
          x: v3173,
          y: v3174 + v3172 / 2
        };
      case "left":
        return {
          x: v3173 - v3171 / 2,
          y: v3174
        };
      case "right":
        return {
          x: v3173 + v3171 / 2,
          y: v3174
        };
    }
  }, "portForSide");
  const v3175 = v22((v3176, v3177, v3178) => v3168(v3176, chooseOrthogonalSide(v3176, v3177, v3178 ? "bottom" : "top")), "getOrthogonalPort");
  const v3179 = [];
  const v3180 = [];
  const v3181 = new Set();
  const v3182 = 1000;
  const v3183 = v22((v3184, v3185, v3186) => {
    if (v3179.length === 0) {
      return 0;
    }
    const v3187 = Math.abs(v3185.y - v3186.y) < EPS7;
    const v3188 = Math.abs(v3185.x - v3186.x) < EPS7;
    if (!v3187 && !v3188) {
      return 0;
    }
    let v3189 = 0;
    if (v3187) {
      const v3190 = v3185.y;
      const v3191 = Math.min(v3185.x, v3186.x) - EPS7;
      const v3192 = Math.max(v3185.x, v3186.x) + EPS7;
      if (v3192 <= v3191) {
        return 0;
      }
      for (const v3193 of v3179) {
        if (v3193.edgeIndex === v3184 || v3193.orientation !== "vertical") {
          continue;
        }
        if (v3193.pipe.coord < v3191 || v3193.pipe.coord > v3192) {
          continue;
        }
        if (v3193.from - EPS7 <= v3190 && v3193.to + EPS7 >= v3190) {
          v3189 += v3182;
        }
      }
    } else if (v3188) {
      const v3194 = v3185.x;
      const v3195 = Math.min(v3185.y, v3186.y) - EPS7;
      const v3196 = Math.max(v3185.y, v3186.y) + EPS7;
      if (v3196 <= v3195) {
        return 0;
      }
      for (const v3197 of v3179) {
        if (v3197.edgeIndex === v3184 || v3197.orientation !== "horizontal") {
          continue;
        }
        if (v3197.pipe.coord < v3195 || v3197.pipe.coord > v3196) {
          continue;
        }
        if (v3197.from - EPS7 <= v3194 && v3197.to + EPS7 >= v3194) {
          v3189 += v3182;
        }
      }
    }
    return v3189;
  }, "crossingPenalty");
  const v3198 = v3139.map((v3199, v3200) => {
    if (!v3199.start || !v3199.end) {
      return {
        idx: v3200,
        crossLane: 0,
        dx: 0,
        dy: 0
      };
    }
    const v3201 = v3141.get(v3199.start);
    const v3202 = v3141.get(v3199.end);
    const v3203 = v3142.get(v3199.start);
    const v3204 = v3142.get(v3199.end);
    const v3205 = v3203 && v3204 && v3203.id !== v3204.id ? 1 : 0;
    const v3206 = v3201 && v3202 ? Math.abs((v3202.x ?? 0) - (v3201.x ?? 0)) : 0;
    const v3207 = v3201 && v3202 ? Math.abs((v3202.y ?? 0) - (v3201.y ?? 0)) : 0;
    return {
      idx: v3200,
      crossLane: v3205,
      dx: v3206,
      dy: v3207
    };
  }).sort((v3208, v3209) => {
    if (v3208.crossLane !== v3209.crossLane) {
      return v3209.crossLane - v3208.crossLane;
    }
    const v3210 = v3208.dx + v3208.dy;
    const v3211 = v3209.dx + v3209.dy;
    if (Math.abs(v3210 - v3211) > 1) {
      return v3210 - v3211;
    }
    return v3208.idx - v3209.idx;
  }).map(v3212 => v3212.idx);
  const v3213 = v22((v3214, v3215, v3216, v3217) => {
    const v3218 = Math.min(v3214.x, v3215.x);
    const v3219 = Math.max(v3214.x, v3215.x);
    const v3220 = Math.min(v3214.y, v3215.y);
    const v3221 = Math.max(v3214.y, v3215.y);
    const v3222 = v3153.find(v3223 => {
      if (v3216 && v3223.nodeId === v3216) {
        return false;
      }
      if (v3217 && v3223.nodeId === v3217) {
        return false;
      }
      if (Math.abs(v3214.x - v3215.x) > EPS7) {
        return v3223.minY < v3214.y && v3223.maxY > v3214.y && v3223.maxX > v3218 && v3223.minX < v3219;
      } else {
        return v3223.minX < v3214.x && v3223.maxX > v3214.x && v3223.maxY > v3220 && v3223.minY < v3221;
      }
    });
    return !!v3222;
  }, "isSegmentBlocked");
  const v3224 = new Map();
  const v3225 = new Map();
  for (const v3226 of v3139) {
    if (!v3226.start || !v3226.end || v3226.start === v3226.end) {
      continue;
    }
    v3225.set(v3226.start, (v3225.get(v3226.start) ?? 0) + 1);
    v3225.set(v3226.end, (v3225.get(v3226.end) ?? 0) + 1);
  }
  const v3227 = v22((v3228, v3229) => chooseOrthogonalSide(v3228, v3229, "bottom"), "determineSide");
  const v3230 = new Map();
  for (const [v3231, v3232] of v3139.entries()) {
    if (!v3232.start || !v3232.end || v3232.start === v3232.end) {
      continue;
    }
    if (v3232.points && v3232.points.length > 0) {
      continue;
    }
    const v3233 = v3141.get(v3232.start);
    const v3234 = v3141.get(v3232.end);
    if (!v3233 || !v3234) {
      continue;
    }
    const v3235 = (v3234.x ?? 0) - (v3233.x ?? 0);
    const v3236 = (v3234.y ?? 0) - (v3233.y ?? 0);
    v3230.set(v3231, {
      edgeIdx: v3231,
      srcId: v3232.start,
      dstId: v3232.end,
      srcSide: v3227(v3233, {
        x: v3234.x ?? 0,
        y: v3234.y ?? 0
      }),
      dstSide: v3227(v3234, {
        x: v3233.x ?? 0,
        y: v3233.y ?? 0
      }),
      absDx: Math.abs(v3235),
      absDy: Math.abs(v3236),
      dxSign: Math.sign(v3235),
      dySign: Math.sign(v3236)
    });
  }
  const v3237 = v22(v3238 => {
    if (v3238.srcSide === "top" || v3238.srcSide === "bottom") {
      if (v3238.absDx === 0) {
        return Infinity;
      } else {
        return v3238.absDy / v3238.absDx;
      }
    }
    if (v3238.absDy === 0) {
      return Infinity;
    } else {
      return v3238.absDx / v3238.absDy;
    }
  }, "preferenceStrength");
  const v3239 = v22(v3240 => {
    if (v3240.srcSide === "top" || v3240.srcSide === "bottom") {
      if (v3240.dxSign >= 0) {
        return "right";
      } else {
        return "left";
      }
    }
    if (v3240.dySign >= 0) {
      return "bottom";
    } else {
      return "top";
    }
  }, "secondarySide");
  const v3241 = new Map();
  for (const v3242 of v3230.values()) {
    const v3243 = v3242.srcId + ":" + v3242.srcSide;
    if (!v3241.has(v3243)) {
      v3241.set(v3243, []);
    }
    v3241.get(v3243).push(v3242);
  }
  const v3244 = new Map();
  const v3245 = v22((v3246, v3247) => v3246 + ":" + v3247, "loadKey");
  for (const v3248 of v3230.values()) {
    v3244.set(v3245(v3248.srcId, v3248.srcSide), (v3244.get(v3245(v3248.srcId, v3248.srcSide)) ?? 0) + 1);
    v3244.set(v3245(v3248.dstId, v3248.dstSide), (v3244.get(v3245(v3248.dstId, v3248.dstSide)) ?? 0) + 1);
  }
  for (const v3249 of v3241.values()) {
    if (v3249.length < 2) {
      continue;
    }
    v3249.sort((v3250, v3251) => {
      const v3252 = v3237(v3250);
      const v3253 = v3237(v3251);
      if (Math.abs(v3252 - v3253) > 1e-9) {
        return v3253 - v3252;
      }
      return v3250.edgeIdx - v3251.edgeIdx;
    });
    for (let v3254 = 1; v3254 < v3249.length; v3254++) {
      const v3255 = v3249[v3254];
      const v3256 = v3239(v3255);
      const v3257 = v3244.get(v3245(v3255.srcId, v3255.srcSide)) ?? 0;
      const v3258 = v3244.get(v3245(v3255.srcId, v3256)) ?? 0;
      if (v3258 >= v3257) {
        continue;
      }
      v3244.set(v3245(v3255.srcId, v3255.srcSide), v3257 - 1);
      v3244.set(v3245(v3255.srcId, v3256), v3258 + 1);
      v3255.srcSide = v3256;
    }
  }
  const v3259 = v22(v3260 => {
    const v3261 = v3260?.shape;
    return v3261 === "question" || v3261 === "diamond";
  }, "isDiamondNode");
  const v3262 = new Map();
  for (const v3263 of v3230.values()) {
    if (!v3262.has(v3263.dstId)) {
      v3262.set(v3263.dstId, new Set());
    }
    v3262.get(v3263.dstId).add(v3263.dstSide);
  }
  for (const v3264 of v3230.values()) {
    if (!v3259(v3141.get(v3264.srcId))) {
      continue;
    }
    const v3265 = v3262.get(v3264.srcId);
    if (!v3265?.has(v3264.srcSide)) {
      continue;
    }
    const v3266 = v3239(v3264);
    if (v3265.has(v3266) || (v3244.get(v3245(v3264.srcId, v3266)) ?? 0) > 0) {
      continue;
    }
    const v3267 = v3244.get(v3245(v3264.srcId, v3264.srcSide)) ?? 0;
    v3244.set(v3245(v3264.srcId, v3264.srcSide), Math.max(0, v3267 - 1));
    v3244.set(v3245(v3264.srcId, v3266), 1);
    v3264.srcSide = v3266;
  }
  for (const v3268 of v3230.values()) {
    const {
      edgeIdx: v3269,
      srcId: v3270,
      dstId: v3271,
      srcSide: v3272,
      dstSide: v3273
    } = v3268;
    const v3274 = v3141.get(v3270);
    const v3275 = v3141.get(v3271);
    const v3276 = v3270 + ":" + v3272 + ":src";
    const v3277 = v3272 === "top" || v3272 === "bottom" ? v3275.x ?? 0 : v3275.y ?? 0;
    if (!v3224.has(v3276)) {
      v3224.set(v3276, []);
    }
    v3224.get(v3276).push({
      edgeIdx: v3269,
      oppositeCoord: v3277
    });
    const v3278 = v3271 + ":" + v3273 + ":dst";
    const v3279 = v3273 === "top" || v3273 === "bottom" ? v3274.x ?? 0 : v3274.y ?? 0;
    if (!v3224.has(v3278)) {
      v3224.set(v3278, []);
    }
    v3224.get(v3278).push({
      edgeIdx: v3269,
      oppositeCoord: v3279
    });
  }
  const v3280 = new Map();
  const v3281 = 8;
  for (const [v3282, v3283] of v3224) {
    if (v3283.length < 2) {
      continue;
    }
    v3283.sort((v3284, v3285) => v3284.oppositeCoord - v3285.oppositeCoord);
    const v3286 = v3282.split(":");
    const v3287 = v3286.slice(0, -2).join(":");
    const v3288 = v3286[v3286.length - 2];
    const v3289 = v3286[v3286.length - 1];
    const v3290 = v3141.get(v3287);
    if (!v3290) {
      continue;
    }
    const v3291 = v3288 === "left" || v3288 === "right";
    const v3292 = v3291 ? v3290.height ?? 10 : v3290.width ?? 10;
    const v3293 = v3290.shape;
    const v3294 = v3293 === "question" || v3293 === "diamond";
    const v3295 = v3294 ? v3292 * 0.3 : v3292;
    const v3296 = 20;
    const v3297 = Math.min(v3296, Math.max(v3281, v3295 / (v3283.length + 1)));
    const v3298 = v3297 * (v3283.length - 1);
    const v3299 = -v3298 / 2;
    for (const [v3300, v3301] of v3283.entries()) {
      const v3302 = v3299 + v3300 * v3297;
      const v3303 = v3301.edgeIdx + ":" + v3289;
      v3280.set(v3303, v3302);
    }
  }
  const v3304 = v22(v3305 => Boolean(v3139[v3305]?.labelNodeId), "edgeHasLabelNode");
  const v3306 = v22((v3307, v3308) => {
    if (!v3307) {
      return false;
    }
    return (v3224.get(v3307 + ":" + v3308 + ":src") ?? []).some(({
      edgeIdx: v3309
    }) => v3304(v3309)) || (v3224.get(v3307 + ":" + v3308 + ":dst") ?? []).some(({
      edgeIdx: v3310
    }) => v3304(v3310));
  }, "faceHasLabelNode");
  const v3311 = v22((v3312, v3313, v3314) => {
    if (v3313 === "top" || v3313 === "bottom") {
      return {
        x: v3312.x + v3314,
        y: v3312.y
      };
    } else {
      return {
        x: v3312.x,
        y: v3312.y + v3314
      };
    }
  }, "applyPortOffset");
  const v3315 = v22((v3316, v3317, v3318) => {
    const v3319 = v3230.get(v3316);
    const v3320 = {
      x: v3318.x ?? 0,
      y: v3318.y ?? 0
    };
    const v3321 = {
      x: v3317.x ?? 0,
      y: v3317.y ?? 0
    };
    const v3322 = v3319?.srcSide ?? v3227(v3317, v3320);
    const v3323 = v3319?.dstSide ?? v3227(v3318, v3321);
    let v3324 = v3319 ? v3168(v3317, v3319.srcSide) : v3175(v3317, v3320, true);
    let v3325 = v3319 ? v3168(v3318, v3319.dstSide) : v3175(v3318, v3321, false);
    const v3326 = v3280.get(v3316 + ":src");
    const v3327 = v3280.get(v3316 + ":dst");
    if (v3326 !== undefined) {
      v3324 = v3311(v3324, v3322, v3326);
    }
    if (v3327 !== undefined) {
      v3325 = v3311(v3325, v3323, v3327);
    }
    return {
      pSrcPort: v3324,
      pDstPort: v3325,
      srcSide: v3322,
      dstSide: v3323
    };
  }, "portsForEdge");
  for (const v3328 of v3198) {
    const v3329 = v3139[v3328];
    v3180[v3328] = [];
    if (!v3329.start || !v3329.end) {
      continue;
    }
    if (v3329.points && v3329.points.length > 0) {
      continue;
    }
    if (v3329.start === v3329.end) {
      continue;
    }
    const v3330 = v3141.get(v3329.start);
    const v3331 = v3141.get(v3329.end);
    if (!v3330 || !v3331) {
      continue;
    }
    const {
      pSrcPort: v3332,
      pDstPort: v3333,
      srcSide: v3334,
      dstSide: v3335
    } = v3315(v3328, v3330, v3331);
    const v3336 = {
      ...v3332
    };
    const v3337 = {
      ...v3333
    };
    const v3338 = v3334 === "top" || v3334 === "bottom";
    const v3339 = v3335 === "top" || v3335 === "bottom";
    if (v3338) {
      const v3340 = v3332.y > (v3330.y ?? 0);
      v3336.y = v3340 ? v3332.y + ANCHOR_OFFSET : v3332.y - ANCHOR_OFFSET;
    } else {
      const v3341 = v3332.x > (v3330.x ?? 0);
      v3336.x = v3341 ? v3332.x + ANCHOR_OFFSET : v3332.x - ANCHOR_OFFSET;
    }
    if (v3339) {
      const v3342 = v3333.y > (v3331.y ?? 0);
      v3337.y = v3342 ? v3333.y + ANCHOR_OFFSET : v3333.y - ANCHOR_OFFSET;
    } else {
      const v3343 = v3333.x > (v3331.x ?? 0);
      v3337.x = v3343 ? v3333.x + ANCHOR_OFFSET : v3333.x - ANCHOR_OFFSET;
    }
    const v3344 = v22((v3345, v3346) => {
      for (const v3347 of v3153) {
        if (v3346.includes(v3347.nodeId)) {
          continue;
        }
        if (v3345.x > v3347.minX && v3345.x < v3347.maxX && v3345.y > v3347.minY && v3345.y < v3347.maxY) {
          return {
            inside: true,
            obstacle: v3347
          };
        }
      }
      return {
        inside: false
      };
    }, "isPointInObstacle");
    const v3348 = v22((v3349, v3350, v3351, v3352, v3353) => {
      if (v3353) {
        const v3354 = v3349.y > (v3350.y ?? 0);
        const v3355 = (v3351.x ?? 0) >= v3349.x;
        return {
          x: v3355 ? v3352.maxX + HORIZONTAL_PIPE_MARGIN : v3352.minX - HORIZONTAL_PIPE_MARGIN,
          y: v3354 ? v3352.maxY + VERTICAL_PIPE_MARGIN : v3352.minY - VERTICAL_PIPE_MARGIN,
          leavesPositiveSide: v3354
        };
      }
      const v3356 = v3349.x > (v3350.x ?? 0);
      const v3357 = (v3351.y ?? 0) >= v3349.y;
      return {
        x: v3356 ? v3352.maxX + HORIZONTAL_PIPE_MARGIN : v3352.minX - HORIZONTAL_PIPE_MARGIN,
        y: v3357 ? v3352.maxY + VERTICAL_PIPE_MARGIN : v3352.minY - VERTICAL_PIPE_MARGIN,
        leavesPositiveSide: v3356
      };
    }, "obstacleDetour");
    let v3358 = [];
    const v3359 = [v3329.start, v3329.end];
    const v3360 = v3344(v3336, v3359);
    if (v3360.inside && v3360.obstacle) {
      const v3361 = v3360.obstacle;
      if (v3338) {
        const v3362 = v3348(v3332, v3330, v3331, v3361, true);
        v3336.x = v3362.x;
        v3336.y = v3362.y;
        const v3363 = v3362.leavesPositiveSide ? Math.min(v3361.minY - 2, v3332.y + ANCHOR_OFFSET) : Math.max(v3361.maxY + 2, v3332.y - ANCHOR_OFFSET);
        v3358 = [{
          x: v3332.x,
          y: v3363
        }, {
          x: v3362.x,
          y: v3363
        }, {
          x: v3362.x,
          y: v3362.y
        }];
      } else {
        const v3364 = v3348(v3332, v3330, v3331, v3361, false);
        const v3365 = v3364.leavesPositiveSide ? Math.min(v3361.minX - 2, v3332.x + ANCHOR_OFFSET) : Math.max(v3361.maxX + 2, v3332.x - ANCHOR_OFFSET);
        v3336.x = v3364.x;
        v3336.y = v3364.y;
        v3358 = [{
          x: v3365,
          y: v3332.y
        }, {
          x: v3365,
          y: v3364.y
        }, {
          x: v3364.x,
          y: v3364.y
        }];
      }
    }
    let v3366 = [];
    const v3367 = v3344(v3337, v3359);
    if (v3367.inside && v3367.obstacle) {
      const v3368 = v3367.obstacle;
      if (v3339) {
        const v3369 = v3348(v3333, v3331, v3330, v3368, true);
        v3337.x = v3369.x;
        v3337.y = v3369.y;
        v3366 = [{
          x: v3369.x,
          y: v3369.y
        }, {
          x: v3333.x,
          y: v3369.y
        }];
      } else {
        const v3370 = v3348(v3333, v3331, v3330, v3368, false);
        v3337.x = v3370.x;
        v3337.y = v3370.y;
        v3366 = [{
          x: v3370.x,
          y: v3370.y
        }, {
          x: v3370.x,
          y: v3333.y
        }];
      }
    }
    if (v3358.length === 0 && v3366.length === 0) {
      const v3371 = HORIZONTAL_PIPE_MARGIN;
      const v3372 = Math.abs(v3336.x - v3337.x) < v3371;
      const v3373 = Math.abs(v3336.y - v3337.y) < v3371;
      const v3374 = v3280.get(v3328 + ":src") !== undefined || v3280.get(v3328 + ":dst") !== undefined;
      const v3375 = (v3224.get((v3329.start ?? "") + ":" + v3334 + ":src")?.length ?? 0) + (v3224.get((v3329.start ?? "") + ":" + v3334 + ":dst")?.length ?? 0);
      const v3376 = (v3224.get((v3329.end ?? "") + ":" + v3335 + ":src")?.length ?? 0) + (v3224.get((v3329.end ?? "") + ":" + v3335 + ":dst")?.length ?? 0);
      const v3377 = v3375 > 1 || v3376 > 1;
      const v3378 = v3225.get(v3329.start ?? "") ?? 0;
      const v3379 = v3225.get(v3329.end ?? "") ?? 0;
      const v3380 = v3375 > 1 && v3306(v3329.start, v3334) || v3376 > 1 && v3306(v3329.end, v3335);
      const v3381 = v3375 <= 1 || v3378 <= 2;
      const v3382 = v3376 <= 1 || v3379 <= 2;
      const v3383 = v3377 && !v3380 && v3381 && v3382;
      if ((v3372 || v3373) && !v3374 && (!v3377 || v3383)) {
        const v3384 = v3213(v3332, v3333, v3329.start, v3329.end);
        if (!v3384) {
          v3329.points = [{
            ...v3332
          }, {
            ...v3336
          }, {
            ...v3337
          }, {
            ...v3333
          }];
          v3181.add(v3328);
          const v3385 = v3373 ? "horizontal" : "vertical";
          const v3386 = v3373 ? v3332.y : v3332.x;
          const v3387 = v3373 ? Math.min(v3332.x, v3333.x) : Math.min(v3332.y, v3333.y);
          const v3388 = v3373 ? Math.max(v3332.x, v3333.x) : Math.max(v3332.y, v3333.y);
          const v3389 = {
            id: "fast-path-" + v3385 + "-" + v3386.toFixed(0) + "-" + v3328,
            orientation: v3385,
            coord: v3386,
            spanMin: v3387,
            spanMax: v3388,
            tracks: []
          };
          v3179.push({
            edgeIndex: v3328,
            segmentIndex: 0,
            orientation: v3385,
            pipe: v3389,
            trackIndex: 0,
            from: v3387,
            to: v3388
          });
          continue;
        }
      }
    }
    const v3390 = v3161("vertical", v3336.x, v3336.y, v3336.y);
    v3336.x = v3390.coord;
    const v3391 = v3161("vertical", v3337.x, v3337.y, v3337.y);
    v3337.x = v3391.coord;
    let v3392 = Math.min(v3336.x, v3337.x) - 50;
    let v3393 = Math.max(v3336.x, v3337.x) + 50;
    let v3394 = Math.min(v3336.y, v3337.y) - 50;
    let v3395 = Math.max(v3336.y, v3337.y) + 50;
    for (const v3396 of v3153) {
      const v3397 = Math.min(v3336.x, v3337.x);
      const v3398 = Math.max(v3336.x, v3337.x);
      const v3399 = Math.min(v3336.y, v3337.y);
      const v3400 = Math.max(v3336.y, v3337.y);
      const v3401 = v3396.minX < v3398 && v3396.maxX > v3397 && v3396.minY < v3400 && v3396.maxY > v3399;
      if (v3401) {
        v3392 = Math.min(v3392, v3396.minX - ROUTING_MARGIN);
        v3393 = Math.max(v3393, v3396.maxX + ROUTING_MARGIN);
        v3394 = Math.min(v3394, v3396.minY - ROUTING_MARGIN);
        v3395 = Math.max(v3395, v3396.maxY + ROUTING_MARGIN);
      }
    }
    for (const v3402 of v3153) {
      if (v3402.maxX < v3392 || v3402.minX > v3393 || v3402.maxY < v3394 || v3402.minY > v3395) {
        continue;
      }
      const v3403 = HORIZONTAL_PIPE_MARGIN;
      v3161("horizontal", v3402.minY - v3403, v3392, v3393);
      v3161("horizontal", v3402.maxY + v3403, v3392, v3393);
      const v3404 = VERTICAL_PIPE_MARGIN;
      v3161("vertical", v3402.minX - v3404, v3394, v3395);
      v3161("vertical", v3402.maxX + v3404, v3394, v3395);
    }
    v3161("horizontal", v3336.y, v3392, v3393);
    v3161("horizontal", v3337.y, v3392, v3393);
    const v3405 = v3143.filter(v3406 => v3406.orientation === "horizontal" && v3406.coord >= v3394 && v3406.coord <= v3395);
    const v3407 = v3143.filter(v3408 => v3408.orientation === "vertical" && v3408.coord >= v3392 && v3408.coord <= v3393);
    const v3409 = v22((v3410, v3411) => v3410.toFixed(1) + "," + v3411.toFixed(1), "getKey");
    const v3412 = v3409(v3336.x, v3336.y);
    const v3413 = v3409(v3337.x, v3337.y);
    const v3414 = new Map();
    const v3415 = new Map();
    const v3416 = new Map();
    const v3417 = new Set();
    const v3418 = [];
    v3414.set(v3412, 0);
    v3416.set(v3412, "n");
    v3418.push({
      key: v3412,
      f: Math.hypot(v3337.x - v3336.x, v3337.y - v3336.y),
      pt: v3336
    });
    v3417.add(v3412);
    let v3419 = [];
    const v3420 = v22((v3421, v3422) => {
      return v3213(v3421, v3422, v3329.start, v3329.end);
    }, "checkSegmentBlocked");
    const v3423 = {
      x: v3337.x,
      y: v3336.y
    };
    const v3424 = v3420(v3336, v3423);
    const v3425 = v3420(v3423, v3337);
    const v3426 = v3424 || v3425;
    const v3427 = {
      x: v3336.x,
      y: v3337.y
    };
    const v3428 = v3420(v3336, v3427);
    const v3429 = v3420(v3427, v3337);
    const v3430 = v3428 || v3429;
    if (!v3426) {
      if (Math.abs(v3336.y - v3337.y) < EPS7 || Math.abs(v3336.x - v3337.x) < EPS7) {
        v3419 = [v3336, v3337];
      } else {
        v3419 = [v3336, v3423, v3337];
      }
    } else if (!v3430) {
      if (Math.abs(v3336.x - v3337.x) < EPS7) {
        v3419 = [v3336, v3337];
      } else {
        v3419 = [v3336, v3427, v3337];
      }
    }
    if (v3419.length === 0) {
      while (v3418.length > 0) {
        v3418.sort((v3431, v3432) => v3431.f - v3432.f);
        const v3433 = v3418.shift();
        v3417.delete(v3433.key);
        if (v3433.key === v3413) {
          let v3434 = v3413;
          let v3435 = v3337;
          v3419 = [v3435];
          while (v3415.has(v3434)) {
            const v3436 = v3415.get(v3434);
            v3419.unshift(v3436);
            v3435 = v3436;
            v3434 = v3409(v3436.x, v3436.y);
          }
          break;
        }
        const v3437 = v3433.pt.x;
        const v3438 = v3433.pt.y;
        const v3439 = v3407.sort((v3440, v3441) => v3440.coord - v3441.coord);
        const v3442 = v3439.findIndex(v3443 => Math.abs(v3443.coord - v3437) < 1);
        const v3444 = v3405.sort((v3445, v3446) => v3445.coord - v3446.coord);
        const v3447 = v3444.findIndex(v3448 => Math.abs(v3448.coord - v3438) < 1);
        const v3449 = [];
        if (v3442 > 0) {
          v3449.push({
            x: v3439[v3442 - 1].coord,
            y: v3438
          });
        }
        if (v3442 >= 0 && v3442 < v3439.length - 1) {
          v3449.push({
            x: v3439[v3442 + 1].coord,
            y: v3438
          });
        }
        if (v3447 > 0) {
          v3449.push({
            x: v3437,
            y: v3444[v3447 - 1].coord
          });
        }
        if (v3447 >= 0 && v3447 < v3444.length - 1) {
          v3449.push({
            x: v3437,
            y: v3444[v3447 + 1].coord
          });
        }
        for (const v3450 of v3449) {
          const v3451 = Math.min(v3437, v3450.x);
          const v3452 = Math.max(v3437, v3450.x);
          const v3453 = Math.min(v3438, v3450.y);
          const v3454 = Math.max(v3438, v3450.y);
          const v3455 = v3153.some(v3456 => {
            if (v3456.nodeId === v3329.start || v3456.nodeId === v3329.end) {
              return false;
            }
            if (v3451 !== v3452) {
              return v3456.minY < v3438 && v3456.maxY > v3438 && v3456.maxX > v3451 && v3456.minX < v3452;
            } else {
              return v3456.minX < v3437 && v3456.maxX > v3437 && v3456.maxY > v3453 && v3456.minY < v3454;
            }
          });
          if (v3455) {
            continue;
          }
          const v3457 = v3409(v3450.x, v3450.y);
          const v3458 = Math.abs(v3450.x - v3437) + Math.abs(v3450.y - v3438);
          const v3459 = v3183(v3328, v3433.pt, v3450);
          let v3460 = 0;
          const v3461 = v3337.x - v3336.x;
          const v3462 = v3337.y - v3336.y;
          const v3463 = v3450.x - v3437;
          const v3464 = v3450.y - v3438;
          if (v3462 > 10 && v3464 < -5 || v3462 < -10 && v3464 > 5) {
            v3460 = Math.abs(v3464) * 100;
          }
          if (v3461 > 10 && v3463 < -5 || v3461 < -10 && v3463 > 5) {
            v3460 += Math.abs(v3463) * 50;
          }
          let v3465 = 0;
          const v3466 = v3416.get(v3433.key) ?? "n";
          const v3467 = Math.abs(v3463) > EPS7 ? "h" : "v";
          if (v3466 !== "n" && v3466 !== v3467) {
            v3465 = 50;
          }
          const v3468 = v3458 + v3459 + v3460 + v3465;
          const v3469 = (v3414.get(v3433.key) ?? Infinity) + v3468;
          const v3470 = Math.abs(v3337.x - v3450.x) + Math.abs(v3337.y - v3450.y);
          if (v3469 < (v3414.get(v3457) ?? Infinity)) {
            v3415.set(v3457, v3433.pt);
            v3414.set(v3457, v3469);
            v3416.set(v3457, v3467);
            if (!v3417.has(v3457)) {
              v3418.push({
                key: v3457,
                f: v3469 + v3470,
                pt: v3450
              });
              v3417.add(v3457);
            } else {
              const v3471 = v3418.findIndex(v3472 => v3472.key === v3457);
              if (v3471 !== -1) {
                v3418[v3471].f = v3469 + v3470;
              }
            }
          }
        }
      }
    }
    if (v3419.length === 0) {
      v3419 = [v3336, {
        x: v3336.x,
        y: v3337.y
      }, v3337];
    }
    if (v3419.length > 4) {
      const v3473 = v3419[0];
      const v3474 = v3419[v3419.length - 1];
      let v3475 = Math.min(v3473.x, v3474.x);
      let v3476 = Math.max(v3473.x, v3474.x);
      let v3477 = Math.min(v3473.y, v3474.y);
      let v3478 = Math.max(v3473.y, v3474.y);
      for (const v3479 of v3419) {
        v3475 = Math.min(v3475, v3479.x);
        v3476 = Math.max(v3476, v3479.x);
        v3477 = Math.min(v3477, v3479.y);
        v3478 = Math.max(v3478, v3479.y);
      }
      const v3480 = v3476 > Math.max(v3473.x, v3474.x);
      const v3481 = v3475 < Math.min(v3473.x, v3474.x);
      if (v3144) {
        const v3482 = VERTICAL_PIPE_MARGIN;
        if (v3480) {
          const v3483 = Math.max(v3473.x, v3474.x);
          const v3484 = Math.min(v3473.y, v3474.y);
          const v3485 = Math.max(v3473.y, v3474.y);
          const v3486 = v3153.filter(v3487 => v3487.minX < v3483 && v3487.maxX > v3483 && v3487.minY < v3485 && v3487.maxY > v3484);
          if (v3486.length > 0) {
            let v3488 = Math.max(v3473.x, v3474.x);
            for (const v3489 of v3486) {
              const v3490 = (v3489.minX + v3489.maxX) / 2;
              if (v3489.visualXHalfExtent === undefined || isNaN(v3489.visualXHalfExtent)) {
                continue;
              }
              const v3491 = v3490 + v3489.visualXHalfExtent + v3482;
              v3488 = Math.max(v3488, v3491);
            }
            if (!isNaN(v3488)) {
              v3476 = v3488;
            }
          }
        }
        if (v3481) {
          const v3492 = v3153.filter(v3493 => v3493.minX < Math.min(v3473.x, v3474.x) + v3482 && v3493.minY < Math.max(v3473.y, v3474.y) && v3493.maxY > Math.min(v3473.y, v3474.y));
          if (v3492.length > 0) {
            let v3494 = Math.min(v3473.x, v3474.x);
            for (const v3495 of v3492) {
              const v3496 = (v3495.minX + v3495.maxX) / 2;
              const v3497 = v3496 - v3495.visualXHalfExtent - v3482;
              v3494 = Math.min(v3494, v3497);
            }
            v3475 = v3494;
          }
        }
      }
      const v3498 = v22(v3499 => {
        const v3500 = v3474.y > v3473.y;
        const v3501 = v3153.filter(v3502 => {
          const v3503 = Math.min(v3473.x, v3474.x) < v3502.maxX && Math.max(v3473.x, v3474.x) > v3502.minX;
          const v3504 = Math.min(v3473.y, v3474.y) < v3502.maxY && Math.max(v3473.y, v3474.y) > v3502.minY;
          return v3503 && v3504;
        });
        let v3505 = v3501;
        if (v3144 && v3501.length > 0) {
          const v3506 = v3501.filter(v3507 => v3507.minX < v3499 && v3507.maxX > v3499);
          if (v3506.length > 0) {
            v3505 = v3506;
          }
        }
        if (v3505.length === 0) {
          return v3474.y;
        }
        const v3508 = HORIZONTAL_PIPE_MARGIN;
        if (v3500) {
          const v3509 = Math.max(...v3505.map(v3510 => v3510.maxY));
          const v3511 = v3509 + v3508;
          if (v3511 < v3474.y - EPS7) {
            return v3511;
          }
        } else {
          const v3512 = Math.min(...v3505.map(v3513 => v3513.minY));
          const v3514 = v3512 - v3508;
          if (v3514 > v3474.y + EPS7) {
            return v3514;
          }
        }
        return v3474.y;
      }, "findBestReturnY");
      const v3515 = v22(v3516 => {
        const v3517 = v3498(v3516);
        const v3518 = {
          x: v3516,
          y: v3473.y
        };
        const v3519 = {
          x: v3516,
          y: v3517
        };
        const v3520 = {
          x: v3474.x,
          y: v3517
        };
        const v3521 = v3420(v3473, v3518);
        const v3522 = v3420(v3518, v3519);
        const v3523 = v3420(v3519, v3520);
        const v3524 = v3517 !== v3474.y ? v3420(v3520, v3474) : false;
        if (!v3521 && !v3522 && !v3523 && !v3524) {
          if (Math.abs(v3517 - v3474.y) < EPS7) {
            return [v3473, v3518, v3519, v3474];
          }
          return [v3473, v3518, v3519, v3520, v3474];
        }
        return null;
      }, "trySimplifyWithDetourX");
      const v3525 = v3480 && !v3481 ? v3515(v3476) : v3481 && !v3480 ? v3515(v3475) : null;
      if (v3525) {
        v3419 = v3525;
      }
    }
    const v3526 = [v3332, ...v3358, ...v3419, ...v3366.reverse(), v3333];
    if (v3526.length >= 3) {
      const v3527 = v3526[v3526.length - 1];
      const v3528 = v3526[v3526.length - 2];
      const v3529 = v3526[v3526.length - 3];
      const v3530 = Math.abs(v3529.y - v3528.y) < EPS7 && Math.abs(v3528.y - v3527.y) < EPS7;
      const v3531 = Math.abs(v3529.x - v3528.x) < EPS7 && Math.abs(v3528.x - v3527.x) < EPS7;
      if (v3530) {
        const v3532 = Math.sign(v3528.x - v3529.x);
        const v3533 = Math.sign(v3527.x - v3529.x);
        if (v3532 !== 0 && v3532 === v3533 && Math.abs(v3528.x - v3529.x) > Math.abs(v3527.x - v3529.x)) {
          v3526.splice(-2, 1);
        }
      } else if (v3531) {
        const v3534 = Math.sign(v3528.y - v3529.y);
        const v3535 = Math.sign(v3527.y - v3529.y);
        if (v3534 !== 0 && v3534 === v3535 && Math.abs(v3528.y - v3529.y) > Math.abs(v3527.y - v3529.y)) {
          v3526.splice(-2, 1);
        }
      }
    }
    const v3536 = [v3526[0]];
    for (let v3537 = 1; v3537 < v3526.length - 1; v3537++) {
      if (v3537 === 1) {
        v3536.push(v3526[v3537]);
        continue;
      }
      const v3538 = v3536[v3536.length - 1];
      const v3539 = v3526[v3537];
      const v3540 = v3526[v3537 + 1];
      if (Math.abs(v3538.y - v3539.y) < EPS7 && Math.abs(v3539.y - v3540.y) < EPS7) {
        const v3541 = v3539.x > v3538.x;
        const v3542 = v3540.x > v3539.x;
        if (v3541 !== v3542) {
          v3536.push(v3539);
          continue;
        }
        continue;
      }
      if (Math.abs(v3538.x - v3539.x) < EPS7 && Math.abs(v3539.x - v3540.x) < EPS7) {
        const v3543 = v3539.y > v3538.y;
        const v3544 = v3540.y > v3539.y;
        if (v3543 !== v3544) {
          v3536.push(v3539);
          continue;
        }
        continue;
      }
      v3536.push(v3539);
    }
    v3536.push(v3526[v3526.length - 1]);
    for (let v3545 = 0; v3545 < v3536.length - 1; v3545++) {
      const v3546 = v3536[v3545];
      const v3547 = v3536[v3545 + 1];
      const v3548 = Math.abs(v3546.x - v3547.x) < EPS7 ? "vertical" : "horizontal";
      const v3549 = v3548 === "vertical" ? v3546.x : v3546.y;
      const v3550 = v3548 === "vertical" ? Math.min(v3546.y, v3547.y) : Math.min(v3546.x, v3547.x);
      const v3551 = v3548 === "vertical" ? Math.max(v3546.y, v3547.y) : Math.max(v3546.x, v3547.x);
      const v3552 = v3161(v3548, v3549, v3550, v3551);
      const v3553 = {
        edgeIndex: v3328,
        segmentIndex: v3545,
        orientation: v3548,
        pipe: v3552,
        trackIndex: 0,
        from: v3550,
        to: v3551
      };
      v3179.push(v3553);
      v3180[v3328].push(v3179.length - 1);
      if (!v3552.tracks[0]) {
        v3552.tracks[0] = {
          index: 0,
          coord: v3552.coord,
          segments: []
        };
      }
      v3552.tracks[0].segments.push({
        edgeIndex: v3328,
        segmentIndex: v3545,
        from: v3550,
        to: v3551
      });
    }
  }
  const v3554 = v22((v3555, v3556) => {
    return v3555.from < v3556.to && v3556.from < v3555.to;
  }, "segmentsOverlap");
  const v3557 = v22((v3558, v3559, v3560, v3561) => {
    const v3562 = !v3561.segments.some(v3563 => (v3563.edgeIndex !== v3559.edgeIndex || v3563.segmentIndex !== v3559.segmentIndex) && v3554(v3563, v3558));
    const v3564 = !v3560.segments.some(v3565 => (v3565.edgeIndex !== v3558.edgeIndex || v3565.segmentIndex !== v3558.segmentIndex) && v3554(v3565, v3559));
    if (v3562 && v3564) {
      v3558.trackIndex = v3561.index;
      v3559.trackIndex = v3560.index;
      v3560.segments = [...v3560.segments.filter(v3566 => v3566.edgeIndex !== v3558.edgeIndex || v3566.segmentIndex !== v3558.segmentIndex), {
        edgeIndex: v3559.edgeIndex,
        segmentIndex: v3559.segmentIndex,
        from: v3559.from,
        to: v3559.to
      }];
      v3561.segments = [...v3561.segments.filter(v3567 => v3567.edgeIndex !== v3559.edgeIndex || v3567.segmentIndex !== v3559.segmentIndex), {
        edgeIndex: v3558.edgeIndex,
        segmentIndex: v3558.segmentIndex,
        from: v3558.from,
        to: v3558.to
      }];
      return true;
    }
    return false;
  }, "trySwapSegmentsAcrossTracks");
  const v3568 = v22(v3569 => {
    const v3570 = v3569.tracks.length;
    v3569.tracks[v3570] = {
      index: v3570,
      coord: v3569.coord,
      segments: []
    };
    return v3570;
  }, "createNewTrack");
  const v3571 = v22((v3572, v3573) => {
    const v3574 = v3572.pipe.tracks[v3572.trackIndex];
    v3574.segments = v3574.segments.filter(v3575 => v3575.edgeIndex !== v3572.edgeIndex || v3575.segmentIndex !== v3572.segmentIndex);
    v3572.trackIndex = v3573;
    const v3576 = v3572.pipe.tracks[v3573];
    v3576.segments.push({
      edgeIndex: v3572.edgeIndex,
      segmentIndex: v3572.segmentIndex,
      from: v3572.from,
      to: v3572.to
    });
  }, "moveSegmentToTrack");
  const v3577 = v22((v3578, v3579) => {
    const v3580 = v3180[v3578.edgeIndex];
    for (const v3581 of v3580) {
      const v3582 = v3179[v3581];
      if (v3582.pipe === v3578.pipe) {
        v3571(v3582, v3579);
      }
    }
  }, "moveSegmentChainToTrack");
  const v3583 = v22(v3584 => {
    const v3585 = v3180[v3584.edgeIndex];
    const v3586 = v3585.indexOf(v3179.indexOf(v3584));
    const v3587 = [];
    if (v3586 > 0) {
      v3587.push(v3179[v3585[v3586 - 1]]);
    }
    if (v3586 < v3585.length - 1) {
      v3587.push(v3179[v3585[v3586 + 1]]);
    }
    return v3587;
  }, "getAdjacentSegmentsAlongEdge");
  const v3588 = v22((v3589, v3590) => {
    if (v3589.orientation === v3590.orientation) {
      return false;
    }
    const v3591 = v3589.orientation === "horizontal" ? v3589 : v3590;
    const v3592 = v3589.orientation === "horizontal" ? v3590 : v3589;
    return v3592.pipe.coord > v3591.from && v3592.pipe.coord < v3591.to && v3591.pipe.coord > v3592.from && v3591.pipe.coord < v3592.to;
  }, "haveAnyCrossing");
  const v3593 = v22((v3594, v3595) => {
    for (const v3596 of v3594.tracks) {
      const v3597 = v3596.segments.some(v3598 => (v3598.edgeIndex !== v3595.edgeIndex || v3598.segmentIndex !== v3595.segmentIndex) && v3554(v3598, v3595));
      if (!v3597) {
        return v3596.index;
      }
    }
    return -1;
  }, "findAvailableTrack");
  const v3599 = v22((v3600, v3601) => {
    if (v3600.trackIndex === v3601.trackIndex) {
      return v3554(v3600, v3601);
    }
    const v3602 = v3583(v3600);
    const v3603 = v3583(v3601);
    return v3602.some(v3604 => v3603.some(v3605 => v3588(v3604, v3605)));
  }, "segmentsConflict");
  const v3606 = v22((v3607, v3608, v3609) => {
    if (v3557(v3607, v3608, v3607.pipe.tracks[v3607.trackIndex], v3608.pipe.tracks[v3608.trackIndex])) {
      return;
    }
    const v3610 = v3593(v3607.pipe, v3608);
    v3609(v3608, v3610 !== -1 ? v3610 : v3568(v3607.pipe));
  }, "resolveTrackConflict");
  const v3611 = v22(v3612 => {
    let v3613 = 0;
    for (let v3614 = 0; v3614 < v3612.length; v3614++) {
      for (let v3615 = v3614 + 1; v3615 < v3612.length; v3615++) {
        const v3616 = v3612[v3614];
        const v3617 = v3612[v3615];
        if (v3616.pipe !== v3617.pipe) {
          continue;
        }
        if (v3599(v3616, v3617)) {
          v3613++;
          v3606(v3616, v3617, v3577);
        }
      }
    }
    return v3613;
  }, "resolveHandleConflicts");
  const v3618 = new Map();
  const v3619 = v22(v3620 => {
    if (v3618.has(v3620)) {
      return v3618.get(v3620);
    }
    const v3621 = v3180[v3620];
    if (v3621.length === 0) {
      const v3622 = {
        dest: 0,
        deviation: 0,
        base: 0,
        delta: 0
      };
      v3618.set(v3620, v3622);
      return v3622;
    }
    const v3623 = v3179[v3621[0]];
    const v3624 = v3623.pipe.coord;
    let v3625 = v3624;
    for (let v3626 = 1; v3626 < v3621.length; v3626++) {
      const v3627 = v3179[v3621[v3626]];
      if (v3627.orientation === "horizontal") {
        const v3628 = v3627.from;
        const v3629 = v3627.to;
        v3625 = Math.abs(v3628 - v3624) > Math.abs(v3629 - v3624) ? v3628 : v3629;
        break;
      }
    }
    const v3630 = Math.abs(v3625 - v3624);
    const v3631 = {
      dest: v3625,
      deviation: v3630,
      base: v3624,
      delta: v3625 - v3624
    };
    v3618.set(v3620, v3631);
    return v3631;
  }, "getDestInfo");
  const v3632 = v22(() => {
    let v3633 = 0;
    const v3634 = new Map();
    for (const [v3635, v3636] of v3139.entries()) {
      if (v3180[v3635].length === 0) {
        continue;
      }
      if (!v3636.start) {
        continue;
      }
      if (!v3634.has(v3636.start)) {
        v3634.set(v3636.start, []);
      }
      v3634.get(v3636.start).push(v3635);
    }
    const v3637 = v22(v3638 => {
      const v3639 = v3139[v3638];
      if (!v3639.start || !v3639.end) {
        return 0;
      }
      const v3640 = v3141.get(v3639.start);
      const v3641 = v3141.get(v3639.end);
      if (!v3640 || !v3641) {
        return 0;
      }
      const v3642 = (v3641.x ?? 0) - (v3640.x ?? 0);
      const v3643 = (v3641.y ?? 0) - (v3640.y ?? 0);
      return Math.abs(v3642) + Math.abs(v3643);
    }, "getEdgeDistance");
    for (const v3644 of v3634.values()) {
      v3644.sort((v3645, v3646) => {
        const v3647 = v3619(v3645);
        const v3648 = v3619(v3646);
        if (Math.abs(v3647.deviation - v3648.deviation) > 1) {
          return v3647.deviation - v3648.deviation;
        }
        if (Math.abs(v3647.dest - v3648.dest) > 1) {
          return v3647.dest - v3648.dest;
        }
        const v3649 = v3637(v3645);
        const v3650 = v3637(v3646);
        if (Math.abs(v3649 - v3650) > 1) {
          return v3650 - v3649;
        }
        const v3651 = v3180[v3645].length;
        const v3652 = v3180[v3646].length;
        if (v3651 !== v3652) {
          return v3651 - v3652;
        }
        if (v3651 === 1) {
          const v3653 = v3180[v3645][0];
          const v3654 = v3180[v3646][0];
          if (v3179[v3653] && v3179[v3654]) {
            const v3655 = v3179[v3653];
            const v3656 = v3179[v3654];
            const v3657 = Math.abs(v3655.to - v3655.from);
            const v3658 = Math.abs(v3656.to - v3656.from);
            if (Math.abs(v3657 - v3658) > 1) {
              return v3657 - v3658;
            }
          }
        }
        return 0;
      });
      const v3659 = v3644.map(v3660 => v3179[v3180[v3660][0]]);
      v3633 += v3611(v3659);
    }
    return v3633;
  }, "fixSourceHandleCrossings");
  const v3661 = v22(() => {
    let v3662 = 0;
    const v3663 = new Map();
    for (const [v3664, v3665] of v3139.entries()) {
      const v3666 = v3180[v3664];
      if (v3666.length === 0) {
        continue;
      }
      if (!v3665.end) {
        continue;
      }
      if (!v3663.has(v3665.end)) {
        v3663.set(v3665.end, []);
      }
      v3663.get(v3665.end).push(v3664);
    }
    for (const v3667 of v3663.values()) {
      v3667.sort((v3668, v3669) => {
        const v3670 = v22(v3671 => {
          const v3672 = v3180[v3671];
          if (v3672.length < 2) {
            return 0;
          }
          const v3673 = v3179[v3672[v3672.length - 2]];
          return Math.abs(v3673.to - v3673.from);
        }, "getDist");
        const v3674 = v3670(v3668);
        const v3675 = v3670(v3669);
        if (Math.abs(v3674 - v3675) > 0.1) {
          return v3674 - v3675;
        }
        return v3668 - v3669;
      });
      const v3676 = v3667.map(v3677 => v3179[v3180[v3677][v3180[v3677].length - 1]]);
      v3662 += v3611(v3676);
    }
    return v3662;
  }, "fixTargetHandleCrossings");
  const v3678 = v22(() => {
    let v3679 = 0;
    for (const v3680 of v3143) {
      const v3681 = [];
      for (const v3682 of v3680.tracks) {
        for (const v3683 of v3682.segments) {
          const v3684 = v3180[v3683.edgeIndex].find(v3685 => v3179[v3685].segmentIndex === v3683.segmentIndex);
          if (v3684 !== undefined) {
            v3681.push(v3179[v3684]);
          }
        }
      }
      v3681.sort((v3686, v3687) => v3686.edgeIndex - v3687.edgeIndex || v3686.segmentIndex - v3687.segmentIndex);
      for (let v3688 = 0; v3688 < v3681.length; v3688++) {
        for (let v3689 = v3688 + 1; v3689 < v3681.length; v3689++) {
          const v3690 = v3681[v3688];
          const v3691 = v3681[v3689];
          if (v3599(v3690, v3691)) {
            v3679++;
            v3606(v3690, v3691, v3571);
          }
        }
      }
    }
    return v3679;
  }, "fixPipeCrossings");
  let v3692 = 0;
  const v3693 = 10;
  while (v3692 < v3693) {
    let v3694 = 0;
    v3694 += v3632();
    v3694 += v3661();
    v3694 += v3678();
    if (v3694 === 0) {
      break;
    }
    v3692++;
  }
  const v3695 = new Map();
  for (const v3696 of v3143) {
    const v3697 = [];
    v3696.tracks.forEach(v3698 => {
      v3698.segments.forEach(v3699 => {
        v3697.push({
          edgeIndex: v3699.edgeIndex,
          segmentIndex: v3699.segmentIndex,
          trackIndex: v3698.index,
          from: v3699.from,
          to: v3699.to
        });
      });
    });
    v3697.sort((v3700, v3701) => v3700.from - v3701.from);
    const v3702 = [];
    if (v3697.length > 0) {
      let v3703 = [v3697[0]];
      let v3704 = v3697[0].to;
      for (let v3705 = 1; v3705 < v3697.length; v3705++) {
        const v3706 = v3697[v3705];
        if (v3706.from < v3704) {
          v3703.push(v3706);
          v3704 = Math.max(v3704, v3706.to);
        } else {
          v3702.push(v3703);
          v3703 = [v3706];
          v3704 = v3706.to;
        }
      }
      v3702.push(v3703);
    }
    for (const v3707 of v3702) {
      const v3708 = new Set();
      v3707.forEach(v3709 => v3708.add(v3709.trackIndex));
      const v3710 = new Map();
      v3707.forEach(v3711 => {
        const v3712 = v3619(v3711.edgeIndex);
        v3710.set(v3711.trackIndex, (v3710.get(v3711.trackIndex) ?? 0) + v3712.delta);
      });
      const v3713 = [...v3708].filter(v3714 => (v3710.get(v3714) ?? 0) < -1);
      const v3715 = [...v3708].filter(v3716 => (v3710.get(v3716) ?? 0) > 1);
      const v3717 = [...v3708].filter(v3718 => Math.abs(v3710.get(v3718) ?? 0) <= 1);
      v3713.sort((v3719, v3720) => (v3710.get(v3720) ?? 0) - (v3710.get(v3719) ?? 0));
      v3715.sort((v3721, v3722) => (v3710.get(v3721) ?? 0) - (v3710.get(v3722) ?? 0));
      const v3723 = v22((v3724, v3725) => {
        v3707.filter(v3726 => v3726.trackIndex === v3724).forEach(v3727 => {
          const v3728 = v3181.has(v3727.edgeIndex) ? v3696.coord : v3725;
          v3695.set(v3727.edgeIndex + "-" + v3727.segmentIndex, v3728);
        });
      }, "assignCoord");
      let v3729 = 0;
      for (const v3730 of v3713) {
        v3729++;
        v3723(v3730, v3696.coord - v3729 * TRACK_SPACING);
      }
      if (v3717.length === 0 && v3708.size > 0) {
        const v3731 = [...v3708].sort((v3732, v3733) => Math.abs(v3710.get(v3732) ?? 0) - Math.abs(v3710.get(v3733) ?? 0))[0];
        const v3734 = v3713.indexOf(v3731);
        if (v3734 !== -1) {
          v3713.splice(v3734, 1);
        }
        const v3735 = v3715.indexOf(v3731);
        if (v3735 !== -1) {
          v3715.splice(v3735, 1);
        }
        v3717.push(v3731);
      }
      let v3736 = 0;
      for (const v3737 of v3717) {
        if (v3736 === 0) {
          v3723(v3737, v3696.coord);
        } else {
          const v3738 = v3736 % 2 === 1 ? 1 : -1;
          const v3739 = Math.ceil(v3736 / 2);
          v3723(v3737, v3696.coord + v3738 * v3739 * TRACK_SPACING * 0.5);
        }
        v3736++;
      }
      let v3740 = 0;
      for (const v3741 of v3715) {
        v3740++;
        v3723(v3741, v3696.coord + v3740 * TRACK_SPACING);
      }
    }
  }
  for (const [v3742, v3743] of v3139.entries()) {
    const v3744 = v3180[v3742] ?? [];
    if (v3744.length === 0) {
      continue;
    }
    const v3745 = [];
    const v3746 = v3141.get(v3743.start);
    const v3747 = v3141.get(v3743.end);
    const {
      pSrcPort: v3748,
      pDstPort: v3749
    } = v3315(v3742, v3746, v3747);
    const v3750 = v3744.map(v3751 => {
      const v3752 = v3179[v3751];
      const v3753 = v3695.get(v3752.edgeIndex + "-" + v3752.segmentIndex) ?? v3752.pipe.coord;
      return {
        orient: v3752.orientation,
        coord: v3753,
        from: v3752.from,
        to: v3752.to
      };
    });
    v3745.push(v3748);
    for (let v3754 = 0; v3754 < v3750.length; v3754++) {
      const v3755 = v3750[v3754];
      const v3756 = v3745[v3745.length - 1];
      const v3757 = v3755.orient === "vertical" ? v3756.y : v3756.x;
      const v3758 = v3755.orient === "vertical" ? v3756.x : v3756.y;
      const v3759 = v3750[v3754 + 1];
      const v3760 = v3754 < v3750.length - 1;
      if (Math.abs(v3758 - v3755.coord) > EPS7) {
        v3745.push(pointOnLine(v3755, v3757));
      }
      if (v3760 && v3759.orient === v3755.orient) {
        if (Math.abs(v3755.coord - v3759.coord) > EPS7) {
          const v3761 = v3755.orient === "vertical" ? (v3757 + v3759.from) / 2 : sharedLineEndpointCoord(v3755, v3759);
          v3745.push(pointOnLine(v3755, v3761), pointOnLine(v3759, v3761));
        } else if (v3754 === 0 || v3754 === v3750.length - 2) {
          v3745.push(pointOnLine(v3755, sharedLineEndpointCoord(v3755, v3759)));
        }
      } else if (v3760) {
        v3745.push(pointOnLine(v3755, v3759.coord));
      } else {
        const v3762 = Math.abs(v3755.from - v3757) < Math.abs(v3755.to - v3757) ? v3755.to : v3755.from;
        v3745.push(pointOnLine(v3755, v3762));
      }
    }
    const v3763 = v3745[v3745.length - 1];
    if (Math.abs(v3763.x - v3749.x) > EPS7 || Math.abs(v3763.y - v3749.y) > EPS7) {
      v3745.push(v3749);
    }
    const v3764 = [];
    if (v3745.length > 0) {
      v3764.push(v3745[0]);
    }
    for (let v3765 = 1; v3765 < v3745.length; v3765++) {
      const v3766 = v3745[v3765];
      const v3767 = v3764[v3764.length - 1];
      if (Math.abs(v3766.x - v3767.x) > EPS7 || Math.abs(v3766.y - v3767.y) > EPS7) {
        v3764.push(v3766);
      }
    }
    v3743.points = v3764;
  }
  for (const v3768 of v3139) {
    const v3769 = v3768.__originalEdge;
    if (v3769 && v3768.points) {
      v3769.points = v3768.points;
    }
  }
  v3135.edges = (v3135.edges ?? []).filter(v3770 => !v3770.isLayoutOnly);
  const v3771 = v22((v3772, v3773) => {
    const v3774 = v3773.x ?? 0;
    const v3775 = v3773.y ?? 0;
    const v3776 = v3773.width ?? 0;
    const v3777 = v3773.height ?? 0;
    if (v3776 <= 0 || v3777 <= 0) {
      return v3772;
    }
    const v3778 = v3774 - v3776 / 2;
    const v3779 = v3774 + v3776 / 2;
    const v3780 = v3775 - v3777 / 2;
    const v3781 = v3775 + v3777 / 2;
    if (v3772.x < v3778 || v3772.x > v3779 || v3772.y < v3780 || v3772.y > v3781) {
      return v3772;
    }
    const v3782 = v3772.x - v3778;
    const v3783 = v3779 - v3772.x;
    const v3784 = v3772.y - v3780;
    const v3785 = v3781 - v3772.y;
    const v3786 = Math.min(v3782, v3783, v3784, v3785);
    if (v3786 === v3782) {
      return {
        x: v3778,
        y: v3772.y
      };
    }
    if (v3786 === v3783) {
      return {
        x: v3779,
        y: v3772.y
      };
    }
    if (v3786 === v3784) {
      return {
        x: v3772.x,
        y: v3780
      };
    }
    return {
      x: v3772.x,
      y: v3781
    };
  }, "nodeBoundaryClamp");
  for (const v3787 of v3135.edges) {
    const v3788 = v3787.points;
    if (!v3788 || v3788.length < 2) {
      continue;
    }
    const v3789 = v3787.start;
    const v3790 = v3787.end;
    const v3791 = v3789 ? v3141.get(v3789) : undefined;
    const v3792 = v3790 ? v3141.get(v3790) : undefined;
    if (v3791) {
      v3788[0] = v3771(v3788[0], v3791);
    }
    if (v3792) {
      v3788[v3788.length - 1] = v3771(v3788[v3788.length - 1], v3792);
    }
  }
  return v3135;
}
v22(routeEdgesOrthogonal, "routeEdgesOrthogonal");
function getSwimlaneDirection(v3793) {
  return v3793.direction ?? "TB";
}
v22(getSwimlaneDirection, "getSwimlaneDirection");
function runSwimlaneLayoutCore(v3794) {
  const v3795 = toGraphView(v3794);
  const v3796 = v3794.config.flowchart?.nodeSpacing ?? 40;
  const v3797 = v3794.config.flowchart?.rankSpacing ?? 100;
  const v3798 = v3794.config.swimlane?.ignoreCrossLaneEdges ?? true;
  const v3799 = v3794.config.swimlane?.optimizeRanksByCrossings ?? true;
  const v3800 = v3794.config.swimlane?.automaticLaneOrdering ?? false;
  const v3801 = getSwimlaneDirection(v3794);
  const {
    ordered: v3802,
    coordinates: v3803
  } = sugiyamaLayout(v3795, {
    nodeGap: v3796,
    layerGap: v3797,
    ignoreCrossLaneEdges: v3798,
    optimizeRanksByCrossings: v3799,
    automaticLaneOrdering: v3800,
    direction: v3801
  });
  writeBackToLayoutData(v3795, v3802, v3803, {
    nodeGap: v3796,
    layerGap: v3797
  });
  for (const v3804 of v3794.edges ?? []) {
    delete v3804.points;
  }
  routeEdgesOrthogonal(v3794, v3801);
  for (const v3805 of v3794.edges ?? []) {
    if (!v3805.curve || v3805.curve === "basis") {
      v3805.curve = "rounded";
    }
  }
  postProcessSwimlaneLayout(v3794, v3801);
  validateSwimlanesLayout(v3794);
  return v3801;
}
v22(runSwimlaneLayoutCore, "runSwimlaneLayoutCore");
async function render(v3806, v3807) {
  const v3808 = v3807.select("g");
  v5(v3808, v3806.markers, v3806.type, v3806.diagramId);
  v6();
  v7();
  v8();
  v24();
  prepareLayoutForSwimlanes(v3806);
  const v3809 = createEdgeLabelNodes(v3806);
  v3806.nodes = v3809.nodes;
  v3806.edges = v3809.edges;
  const {
    groups: v3810
  } = await createGraphWithElements(v3808, v3806);
  runSwimlaneLayoutCore(v3806);
  await adjustLayout(v3806, v3810);
}
v22(render, "render");
export { render };