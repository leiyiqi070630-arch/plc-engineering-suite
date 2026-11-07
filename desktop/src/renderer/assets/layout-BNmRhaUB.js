import { A as v1, a as v2, c as v3, B as v4, e as v5, C as v6, D as v7, E as v8, F as v9, l as v10, H as v11, q as v12, I as v13, v as v14, J as v15, K as v16, L as v17, M as v18, t as v19, y as v20, k as v21, N as v22, O as v23, P as v24, Q as v25, R as v26, T as v27, V as v28, W as v29, z as v30, n as v31, X as v32, Y as v33, G as v34, Z as v35, _ as v36, i as v37, $ as v38, a0 as v39, a1 as v40 } from "./graph-BMLV0goG.js";
import { g as v41, b as v42, k as v43, a as v44, c as v45, d as v46, e as v47, f as v48, i as v49, h as v50, j as v51, m as v52 } from "./map-BEO0Bu8q.js";
var reWhitespace = /\s/;
function trimmedEndIndex(v53) {
  var v54 = v53.length;
  while (v54-- && reWhitespace.test(v53.charAt(v54))) {}
  return v54;
}
var reTrimStart = /^\s+/;
function baseTrim(v55) {
  if (v55) {
    return v55.slice(0, trimmedEndIndex(v55) + 1).replace(reTrimStart, "");
  } else {
    return v55;
  }
}
var NAN = 0 / 0;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsOctal = /^0o[0-7]+$/i;
var freeParseInt = parseInt;
function toNumber(v56) {
  if (typeof v56 == "number") {
    return v56;
  }
  if (v1(v56)) {
    return NAN;
  }
  if (v2(v56)) {
    var v57 = typeof v56.valueOf == "function" ? v56.valueOf() : v56;
    v56 = v2(v57) ? v57 + "" : v57;
  }
  if (typeof v56 != "string") {
    if (v56 === 0) {
      return v56;
    } else {
      return +v56;
    }
  }
  v56 = baseTrim(v56);
  var v58 = reIsBinary.test(v56);
  if (v58 || reIsOctal.test(v56)) {
    return freeParseInt(v56.slice(2), v58 ? 2 : 8);
  } else if (reIsBadHex.test(v56)) {
    return NAN;
  } else {
    return +v56;
  }
}
var INFINITY = Infinity;
var MAX_INTEGER = 1.7976931348623157e+308;
function toFinite(v59) {
  if (!v59) {
    if (v59 === 0) {
      return v59;
    } else {
      return 0;
    }
  }
  v59 = toNumber(v59);
  if (v59 === INFINITY || v59 === -INFINITY) {
    var v60 = v59 < 0 ? -1 : 1;
    return v60 * MAX_INTEGER;
  }
  if (v59 === v59) {
    return v59;
  } else {
    return 0;
  }
}
function toInteger(v61) {
  var v62 = toFinite(v61);
  var v63 = v62 % 1;
  if (v62 === v62) {
    if (v63) {
      return v62 - v63;
    } else {
      return v62;
    }
  } else {
    return 0;
  }
}
function isIterateeCall(v64, v65, v66) {
  if (!v2(v66)) {
    return false;
  }
  var v67 = typeof v65;
  if (v67 == "number" ? v3(v66) && v4(v65, v66.length) : v67 == "string" && v65 in v66) {
    return v5(v66[v65], v64);
  }
  return false;
}
function createAssigner(v68) {
  return v6(function (v69, v70) {
    var v71 = -1;
    var v72 = v70.length;
    var v73 = v72 > 1 ? v70[v72 - 1] : undefined;
    var v74 = v72 > 2 ? v70[2] : undefined;
    v73 = v68.length > 3 && typeof v73 == "function" ? (v72--, v73) : undefined;
    if (v74 && isIterateeCall(v70[0], v70[1], v74)) {
      v73 = v72 < 3 ? undefined : v73;
      v72 = 1;
    }
    v69 = Object(v69);
    while (++v71 < v72) {
      var v75 = v70[v71];
      if (v75) {
        v68(v69, v75, v71, v73);
      }
    }
    return v69;
  });
}
function flatten(v76) {
  var v77 = v76 == null ? 0 : v76.length;
  if (v77) {
    return v7(v76);
  } else {
    return [];
  }
}
function flatRest(v78) {
  return v8(v9(v78, undefined, flatten), v78 + "");
}
var objectTag = "[object Object]";
var funcProto = Function.prototype;
var objectProto$2 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject(v79) {
  if (!v10(v79) || v11(v79) != objectTag) {
    return false;
  }
  var v80 = v41(v79);
  if (v80 === null) {
    return true;
  }
  var v81 = hasOwnProperty$2.call(v80, "constructor") && v80.constructor;
  return typeof v81 == "function" && v81 instanceof v81 && funcToString.call(v81) == objectCtorString;
}
var CLONE_DEEP_FLAG = 1;
var CLONE_SYMBOLS_FLAG = 4;
function cloneDeep(v82) {
  return v42(v82, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
var defaults = v6(function (v83, v84) {
  v83 = Object(v83);
  var v85 = -1;
  var v86 = v84.length;
  var v87 = v86 > 2 ? v84[2] : undefined;
  if (v87 && isIterateeCall(v84[0], v84[1], v87)) {
    v86 = 1;
  }
  while (++v85 < v86) {
    var v88 = v84[v85];
    var v89 = v43(v88);
    var v90 = -1;
    var v91 = v89.length;
    while (++v90 < v91) {
      var v92 = v89[v90];
      var v93 = v83[v92];
      if (v93 === undefined || v5(v93, objectProto$1[v92]) && !hasOwnProperty$1.call(v83, v92)) {
        v83[v92] = v88[v92];
      }
    }
  }
  return v83;
});
function assignMergeValue(v94, v95, v96) {
  if (v96 !== undefined && !v5(v94[v95], v96) || v96 === undefined && !(v95 in v94)) {
    v44(v94, v95, v96);
  }
}
function safeGet(v97, v98) {
  if (v98 === "constructor" && typeof v97[v98] === "function") {
    return;
  }
  if (v98 == "__proto__") {
    return;
  }
  return v97[v98];
}
function toPlainObject(v99) {
  return v45(v99, v43(v99));
}
function baseMergeDeep(v100, v101, v102, v103, v104, v105, v106) {
  var v107 = safeGet(v100, v102);
  var v108 = safeGet(v101, v102);
  var v109 = v106.get(v108);
  if (v109) {
    assignMergeValue(v100, v102, v109);
    return;
  }
  var v110 = v105 ? v105(v107, v108, v102 + "", v100, v101, v106) : undefined;
  var v111 = v110 === undefined;
  if (v111) {
    var v112 = v14(v108);
    var v113 = !v112 && v12(v108);
    var v114 = !v112 && !v113 && v13(v108);
    v110 = v108;
    if (v112 || v113 || v114) {
      if (v14(v107)) {
        v110 = v107;
      } else if (v15(v107)) {
        v110 = v46(v107);
      } else if (v113) {
        v111 = false;
        v110 = v47(v108, true);
      } else if (v114) {
        v111 = false;
        v110 = v48(v108, true);
      } else {
        v110 = [];
      }
    } else if (isPlainObject(v108) || v16(v108)) {
      v110 = v107;
      if (v16(v107)) {
        v110 = toPlainObject(v107);
      } else if (!v2(v107) || v17(v107)) {
        v110 = v49(v108);
      }
    } else {
      v111 = false;
    }
  }
  if (v111) {
    v106.set(v108, v110);
    v104(v110, v108, v103, v105, v106);
    v106.delete(v108);
  }
  assignMergeValue(v100, v102, v110);
}
function baseMerge(v115, v116, v117, v118, v119) {
  if (v115 === v116) {
    return;
  }
  v18(v116, function (v120, v121) {
    v119 ||= new v19();
    if (v2(v120)) {
      baseMergeDeep(v115, v116, v121, v117, baseMerge, v118, v119);
    } else {
      var v122 = v118 ? v118(safeGet(v115, v121), v120, v121 + "", v115, v116, v119) : undefined;
      if (v122 === undefined) {
        v122 = v120;
      }
      assignMergeValue(v115, v121, v122);
    }
  }, v43);
}
function last(v123) {
  var v124 = v123 == null ? 0 : v123.length;
  if (v124) {
    return v123[v124 - 1];
  } else {
    return undefined;
  }
}
function createFind(v125) {
  return function (v126, v127, v128) {
    var v129 = Object(v126);
    if (!v3(v126)) {
      var v130 = v20(v127);
      v126 = v21(v126);
      v127 = function (v131) {
        return v130(v129[v131], v131, v129);
      };
    }
    var v132 = v125(v126, v127, v128);
    if (v132 > -1) {
      return v129[v130 ? v126[v132] : v132];
    } else {
      return undefined;
    }
  };
}
var nativeMax$1 = Math.max;
function findIndex(v133, v134, v135) {
  var v136 = v133 == null ? 0 : v133.length;
  if (!v136) {
    return -1;
  }
  var v137 = v135 == null ? 0 : toInteger(v135);
  if (v137 < 0) {
    v137 = nativeMax$1(v136 + v137, 0);
  }
  return v22(v133, v20(v134), v137);
}
var find = createFind(findIndex);
function forIn(v138, v139) {
  if (v138 == null) {
    return v138;
  } else {
    return v18(v138, v23(v139), v43);
  }
}
function forOwn(v140, v141) {
  return v140 && v24(v140, v23(v141));
}
function baseGt(v142, v143) {
  return v142 > v143;
}
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseHas(v144, v145) {
  return v144 != null && hasOwnProperty.call(v144, v145);
}
function has(v146, v147) {
  return v146 != null && v25(v146, v147, baseHas);
}
function baseLt(v148, v149) {
  return v148 < v149;
}
function mapValues(v150, v151) {
  var v152 = {};
  v151 = v20(v151);
  v24(v150, function (v153, v154, v155) {
    v44(v152, v154, v151(v153, v154, v155));
  });
  return v152;
}
function baseExtremum(v156, v157, v158) {
  var v159 = -1;
  var v160 = v156.length;
  while (++v159 < v160) {
    var v161 = v156[v159];
    var v162 = v157(v161);
    if (v162 != null && (v163 === undefined ? v162 === v162 && !v1(v162) : v158(v162, v163))) {
      var v163 = v162;
      var v164 = v161;
    }
  }
  return v164;
}
function max(v165) {
  if (v165 && v165.length) {
    return baseExtremum(v165, v26, baseGt);
  } else {
    return undefined;
  }
}
var merge = createAssigner(function (v166, v167, v168) {
  baseMerge(v166, v167, v168);
});
function min(v169) {
  if (v169 && v169.length) {
    return baseExtremum(v169, v26, baseLt);
  } else {
    return undefined;
  }
}
function minBy(v170, v171) {
  if (v170 && v170.length) {
    return baseExtremum(v170, v20(v171), baseLt);
  } else {
    return undefined;
  }
}
function baseSet(v172, v173, v174, v175) {
  if (!v2(v172)) {
    return v172;
  }
  v173 = v27(v173, v172);
  var v176 = -1;
  var v177 = v173.length;
  var v178 = v177 - 1;
  var v179 = v172;
  while (v179 != null && ++v176 < v177) {
    var v180 = v28(v173[v176]);
    var v181 = v174;
    if (v180 === "__proto__" || v180 === "constructor" || v180 === "prototype") {
      return v172;
    }
    if (v176 != v178) {
      var v182 = v179[v180];
      v181 = undefined;
      if (v181 === undefined) {
        v181 = v2(v182) ? v182 : v4(v173[v176 + 1]) ? [] : {};
      }
    }
    v50(v179, v180, v181);
    v179 = v179[v180];
  }
  return v172;
}
function basePickBy(v183, v184, v185) {
  var v186 = -1;
  var v187 = v184.length;
  var v188 = {};
  while (++v186 < v187) {
    var v189 = v184[v186];
    var v190 = v29(v183, v189);
    if (v185(v190, v189)) {
      baseSet(v188, v27(v189, v183), v190);
    }
  }
  return v188;
}
function baseSortBy(v191, v192) {
  var v193 = v191.length;
  v191.sort(v192);
  while (v193--) {
    v191[v193] = v191[v193].value;
  }
  return v191;
}
function compareAscending(v194, v195) {
  if (v194 !== v195) {
    var v196 = v194 !== undefined;
    var v197 = v194 === null;
    var v198 = v194 === v194;
    var v199 = v1(v194);
    var v200 = v195 !== undefined;
    var v201 = v195 === null;
    var v202 = v195 === v195;
    var v203 = v1(v195);
    if (!v201 && !v203 && !v199 && v194 > v195 || v199 && v200 && v202 && !v201 && !v203 || v197 && v200 && v202 || !v196 && v202 || !v198) {
      return 1;
    }
    if (!v197 && !v199 && !v203 && v194 < v195 || v203 && v196 && v198 && !v197 && !v199 || v201 && v196 && v198 || !v200 && v198 || !v202) {
      return -1;
    }
  }
  return 0;
}
function compareMultiple(v204, v205, v206) {
  var v207 = -1;
  var v208 = v204.criteria;
  var v209 = v205.criteria;
  var v210 = v208.length;
  var v211 = v206.length;
  while (++v207 < v210) {
    var v212 = compareAscending(v208[v207], v209[v207]);
    if (v212) {
      if (v207 >= v211) {
        return v212;
      }
      var v213 = v206[v207];
      return v212 * (v213 == "desc" ? -1 : 1);
    }
  }
  return v204.index - v205.index;
}
function baseOrderBy(v214, v215, v216) {
  if (v215.length) {
    v215 = v30(v215, function (v217) {
      if (v14(v217)) {
        return function (v218) {
          return v29(v218, v217.length === 1 ? v217[0] : v217);
        };
      }
      return v217;
    });
  } else {
    v215 = [v26];
  }
  var v219 = -1;
  v215 = v30(v215, v31(v20));
  var v220 = v51(v214, function (v221, v222, v223) {
    var v224 = v30(v215, function (v225) {
      return v225(v221);
    });
    return {
      criteria: v224,
      index: ++v219,
      value: v221
    };
  });
  return baseSortBy(v220, function (v226, v227) {
    return compareMultiple(v226, v227, v216);
  });
}
function basePick(v228, v229) {
  return basePickBy(v228, v229, function (v230, v231) {
    return v32(v228, v231);
  });
}
var pick = flatRest(function (v232, v233) {
  if (v232 == null) {
    return {};
  } else {
    return basePick(v232, v233);
  }
});
var nativeCeil = Math.ceil;
var nativeMax = Math.max;
function baseRange(v234, v235, v236, v237) {
  var v238 = -1;
  var v239 = nativeMax(nativeCeil((v235 - v234) / (v236 || 1)), 0);
  var v240 = Array(v239);
  while (v239--) {
    v240[++v238] = v234;
    v234 += v236;
  }
  return v240;
}
function createRange(v241) {
  return function (v242, v243, v244) {
    if (v244 && typeof v244 != "number" && isIterateeCall(v242, v243, v244)) {
      v243 = v244 = undefined;
    }
    v242 = toFinite(v242);
    if (v243 === undefined) {
      v243 = v242;
      v242 = 0;
    } else {
      v243 = toFinite(v243);
    }
    v244 = v244 === undefined ? v242 < v243 ? 1 : -1 : toFinite(v244);
    return baseRange(v242, v243, v244);
  };
}
var range = createRange();
var sortBy = v6(function (v245, v246) {
  if (v245 == null) {
    return [];
  }
  var v247 = v246.length;
  if (v247 > 1 && isIterateeCall(v245, v246[0], v246[1])) {
    v246 = [];
  } else if (v247 > 2 && isIterateeCall(v246[0], v246[1], v246[2])) {
    v246 = [v246[0]];
  }
  return baseOrderBy(v245, v7(v246), []);
});
var idCounter = 0;
function uniqueId(v248) {
  var v249 = ++idCounter;
  return v33(v248) + v249;
}
function baseZipObject(v250, v251, v252) {
  var v253 = -1;
  var v254 = v250.length;
  var v255 = v251.length;
  var v256 = {};
  while (++v253 < v254) {
    var v257 = v253 < v255 ? v251[v253] : undefined;
    v252(v256, v250[v253], v257);
  }
  return v256;
}
function zipObject(v258, v259) {
  return baseZipObject(v258 || [], v259 || [], v50);
}
class List {
  constructor() {
    var v260 = {};
    v260._next = v260._prev = v260;
    this._sentinel = v260;
  }
  dequeue() {
    var v261 = this._sentinel;
    var v262 = v261._prev;
    if (v262 !== v261) {
      unlink(v262);
      return v262;
    }
  }
  enqueue(v263) {
    var v264 = this._sentinel;
    if (v263._prev && v263._next) {
      unlink(v263);
    }
    v263._next = v264._next;
    v264._next._prev = v263;
    v264._next = v263;
    v263._prev = v264;
  }
  toString() {
    var v265 = [];
    var v266 = this._sentinel;
    var v267 = v266._prev;
    while (v267 !== v266) {
      v265.push(JSON.stringify(v267, filterOutLinks));
      v267 = v267._prev;
    }
    return "[" + v265.join(", ") + "]";
  }
}
function unlink(v268) {
  v268._prev._next = v268._next;
  v268._next._prev = v268._prev;
  delete v268._next;
  delete v268._prev;
}
function filterOutLinks(v269, v270) {
  if (v269 !== "_next" && v269 !== "_prev") {
    return v270;
  }
}
var DEFAULT_WEIGHT_FN = v36(1);
function greedyFAS(v271, v272) {
  if (v271.nodeCount() <= 1) {
    return [];
  }
  var v273 = buildState(v271, v272 || DEFAULT_WEIGHT_FN);
  var v274 = doGreedyFAS(v273.graph, v273.buckets, v273.zeroIdx);
  return flatten(v52(v274, function (v275) {
    return v271.outEdges(v275.v, v275.w);
  }));
}
function doGreedyFAS(v276, v277, v278) {
  var v279 = [];
  var v280 = v277[v277.length - 1];
  var v281 = v277[0];
  var v282;
  while (v276.nodeCount()) {
    while (v282 = v281.dequeue()) {
      removeNode(v276, v277, v278, v282);
    }
    while (v282 = v280.dequeue()) {
      removeNode(v276, v277, v278, v282);
    }
    if (v276.nodeCount()) {
      for (var v283 = v277.length - 2; v283 > 0; --v283) {
        v282 = v277[v283].dequeue();
        if (v282) {
          v279 = v279.concat(removeNode(v276, v277, v278, v282, true));
          break;
        }
      }
    }
  }
  return v279;
}
function removeNode(v284, v285, v286, v287, v288) {
  var v289 = v288 ? [] : undefined;
  v35(v284.inEdges(v287.v), function (v290) {
    var v291 = v284.edge(v290);
    var v292 = v284.node(v290.v);
    if (v288) {
      v289.push({
        v: v290.v,
        w: v290.w
      });
    }
    v292.out -= v291;
    assignBucket(v285, v286, v292);
  });
  v35(v284.outEdges(v287.v), function (v293) {
    var v294 = v284.edge(v293);
    var v295 = v293.w;
    var v296 = v284.node(v295);
    v296.in -= v294;
    assignBucket(v285, v286, v296);
  });
  v284.removeNode(v287.v);
  return v289;
}
function buildState(v297, v298) {
  var v299 = new v34();
  var v300 = 0;
  var v301 = 0;
  v35(v297.nodes(), function (v302) {
    v299.setNode(v302, {
      v: v302,
      in: 0,
      out: 0
    });
  });
  v35(v297.edges(), function (v303) {
    var v304 = v299.edge(v303.v, v303.w) || 0;
    var v305 = v298(v303);
    var v306 = v304 + v305;
    v299.setEdge(v303.v, v303.w, v306);
    v301 = Math.max(v301, v299.node(v303.v).out += v305);
    v300 = Math.max(v300, v299.node(v303.w).in += v305);
  });
  var v307 = range(v301 + v300 + 3).map(function () {
    return new List();
  });
  var v308 = v300 + 1;
  v35(v299.nodes(), function (v309) {
    assignBucket(v307, v308, v299.node(v309));
  });
  return {
    graph: v299,
    buckets: v307,
    zeroIdx: v308
  };
}
function assignBucket(v310, v311, v312) {
  if (!v312.out) {
    v310[0].enqueue(v312);
  } else if (!v312.in) {
    v310[v310.length - 1].enqueue(v312);
  } else {
    v310[v312.out - v312.in + v311].enqueue(v312);
  }
}
function run$2(v313) {
  var v314 = v313.graph().acyclicer === "greedy" ? greedyFAS(v313, v315(v313)) : dfsFAS(v313);
  v35(v314, function (v316) {
    var v317 = v313.edge(v316);
    v313.removeEdge(v316);
    v317.forwardName = v316.name;
    v317.reversed = true;
    v313.setEdge(v316.w, v316.v, v317, uniqueId("rev"));
  });
  function v315(v318) {
    return function (v319) {
      return v318.edge(v319).weight;
    };
  }
}
function dfsFAS(v320) {
  var v321 = [];
  var v322 = {};
  var v323 = {};
  function v324(v325) {
    if (Object.prototype.hasOwnProperty.call(v323, v325)) {
      return;
    }
    v323[v325] = true;
    v322[v325] = true;
    v35(v320.outEdges(v325), function (v326) {
      if (Object.prototype.hasOwnProperty.call(v322, v326.w)) {
        v321.push(v326);
      } else {
        v324(v326.w);
      }
    });
    delete v322[v325];
  }
  v35(v320.nodes(), v324);
  return v321;
}
function undo$2(v327) {
  v35(v327.edges(), function (v328) {
    var v329 = v327.edge(v328);
    if (v329.reversed) {
      v327.removeEdge(v328);
      var v330 = v329.forwardName;
      delete v329.reversed;
      delete v329.forwardName;
      v327.setEdge(v328.w, v328.v, v329, v330);
    }
  });
}
function addDummyNode(v331, v332, v333, v334) {
  var v335;
  do {
    v335 = uniqueId(v334);
  } while (v331.hasNode(v335));
  v333.dummy = v332;
  v331.setNode(v335, v333);
  return v335;
}
function simplify(v336) {
  var v337 = new v34().setGraph(v336.graph());
  v35(v336.nodes(), function (v338) {
    v337.setNode(v338, v336.node(v338));
  });
  v35(v336.edges(), function (v339) {
    var v340 = v337.edge(v339.v, v339.w) || {
      weight: 0,
      minlen: 1
    };
    var v341 = v336.edge(v339);
    v337.setEdge(v339.v, v339.w, {
      weight: v340.weight + v341.weight,
      minlen: Math.max(v340.minlen, v341.minlen)
    });
  });
  return v337;
}
function asNonCompoundGraph(v342) {
  var v343 = new v34({
    multigraph: v342.isMultigraph()
  }).setGraph(v342.graph());
  v35(v342.nodes(), function (v344) {
    if (!v342.children(v344).length) {
      v343.setNode(v344, v342.node(v344));
    }
  });
  v35(v342.edges(), function (v345) {
    v343.setEdge(v345, v342.edge(v345));
  });
  return v343;
}
function intersectRect(v346, v347) {
  var v348 = v346.x;
  var v349 = v346.y;
  var v350 = v347.x - v348;
  var v351 = v347.y - v349;
  var v352 = v346.width / 2;
  var v353 = v346.height / 2;
  if (!v350 && !v351) {
    throw new Error("Not possible to find intersection inside of the rectangle");
  }
  var v354;
  var v355;
  if (Math.abs(v351) * v352 > Math.abs(v350) * v353) {
    if (v351 < 0) {
      v353 = -v353;
    }
    v354 = v353 * v350 / v351;
    v355 = v353;
  } else {
    if (v350 < 0) {
      v352 = -v352;
    }
    v354 = v352;
    v355 = v352 * v351 / v350;
  }
  return {
    x: v348 + v354,
    y: v349 + v355
  };
}
function buildLayerMatrix(v356) {
  var v357 = v52(range(maxRank(v356) + 1), function () {
    return [];
  });
  v35(v356.nodes(), function (v358) {
    var v359 = v356.node(v358);
    var v360 = v359.rank;
    if (!v37(v360)) {
      v357[v360][v359.order] = v358;
    }
  });
  return v357;
}
function normalizeRanks(v361) {
  var v362 = min(v52(v361.nodes(), function (v363) {
    return v361.node(v363).rank;
  }));
  v35(v361.nodes(), function (v364) {
    var v365 = v361.node(v364);
    if (has(v365, "rank")) {
      v365.rank -= v362;
    }
  });
}
function removeEmptyRanks(v366) {
  var v367 = min(v52(v366.nodes(), function (v368) {
    return v366.node(v368).rank;
  }));
  var v369 = [];
  v35(v366.nodes(), function (v370) {
    var v371 = v366.node(v370).rank - v367;
    if (!v369[v371]) {
      v369[v371] = [];
    }
    v369[v371].push(v370);
  });
  var v372 = 0;
  var v373 = v366.graph().nodeRankFactor;
  v35(v369, function (v374, v375) {
    if (v37(v374) && v375 % v373 !== 0) {
      --v372;
    } else if (v372) {
      v35(v374, function (v376) {
        v366.node(v376).rank += v372;
      });
    }
  });
}
function addBorderNode$1(v377, v378, v379, v380) {
  var v381 = {
    width: 0,
    height: 0
  };
  if (arguments.length >= 4) {
    v381.rank = v379;
    v381.order = v380;
  }
  return addDummyNode(v377, "border", v381, v378);
}
function maxRank(v382) {
  return max(v52(v382.nodes(), function (v383) {
    var v384 = v382.node(v383).rank;
    if (!v37(v384)) {
      return v384;
    }
  }));
}
function partition(v385, v386) {
  var v387 = {
    lhs: [],
    rhs: []
  };
  v35(v385, function (v388) {
    if (v386(v388)) {
      v387.lhs.push(v388);
    } else {
      v387.rhs.push(v388);
    }
  });
  return v387;
}
function notime(v389, v390) {
  return v390();
}
function addBorderSegments(v391) {
  function v392(v393) {
    var v394 = v391.children(v393);
    var v395 = v391.node(v393);
    if (v394.length) {
      v35(v394, v392);
    }
    if (Object.prototype.hasOwnProperty.call(v395, "minRank")) {
      v395.borderLeft = [];
      v395.borderRight = [];
      for (var v396 = v395.minRank, v397 = v395.maxRank + 1; v396 < v397; ++v396) {
        addBorderNode(v391, "borderLeft", "_bl", v393, v395, v396);
        addBorderNode(v391, "borderRight", "_br", v393, v395, v396);
      }
    }
  }
  v35(v391.children(), v392);
}
function addBorderNode(v398, v399, v400, v401, v402, v403) {
  var v404 = {
    width: 0,
    height: 0,
    rank: v403,
    borderType: v399
  };
  var v405 = v402[v399][v403 - 1];
  var v406 = addDummyNode(v398, "border", v404, v400);
  v402[v399][v403] = v406;
  v398.setParent(v406, v401);
  if (v405) {
    v398.setEdge(v405, v406, {
      weight: 1
    });
  }
}
function adjust(v407) {
  var v408 = v407.graph().rankdir.toLowerCase();
  if (v408 === "lr" || v408 === "rl") {
    swapWidthHeight(v407);
  }
}
function undo$1(v409) {
  var v410 = v409.graph().rankdir.toLowerCase();
  if (v410 === "bt" || v410 === "rl") {
    reverseY(v409);
  }
  if (v410 === "lr" || v410 === "rl") {
    swapXY(v409);
    swapWidthHeight(v409);
  }
}
function swapWidthHeight(v411) {
  v35(v411.nodes(), function (v412) {
    swapWidthHeightOne(v411.node(v412));
  });
  v35(v411.edges(), function (v413) {
    swapWidthHeightOne(v411.edge(v413));
  });
}
function swapWidthHeightOne(v414) {
  var v415 = v414.width;
  v414.width = v414.height;
  v414.height = v415;
}
function reverseY(v416) {
  v35(v416.nodes(), function (v417) {
    reverseYOne(v416.node(v417));
  });
  v35(v416.edges(), function (v418) {
    var v419 = v416.edge(v418);
    v35(v419.points, reverseYOne);
    if (Object.prototype.hasOwnProperty.call(v419, "y")) {
      reverseYOne(v419);
    }
  });
}
function reverseYOne(v420) {
  v420.y = -v420.y;
}
function swapXY(v421) {
  v35(v421.nodes(), function (v422) {
    swapXYOne(v421.node(v422));
  });
  v35(v421.edges(), function (v423) {
    var v424 = v421.edge(v423);
    v35(v424.points, swapXYOne);
    if (Object.prototype.hasOwnProperty.call(v424, "x")) {
      swapXYOne(v424);
    }
  });
}
function swapXYOne(v425) {
  var v426 = v425.x;
  v425.x = v425.y;
  v425.y = v426;
}
function run$1(v427) {
  v427.graph().dummyChains = [];
  v35(v427.edges(), function (v428) {
    normalizeEdge(v427, v428);
  });
}
function normalizeEdge(v429, v430) {
  var v431 = v430.v;
  var v432 = v429.node(v431).rank;
  var v433 = v430.w;
  var v434 = v429.node(v433).rank;
  var v435 = v430.name;
  var v436 = v429.edge(v430);
  var v437 = v436.labelRank;
  if (v434 === v432 + 1) {
    return;
  }
  v429.removeEdge(v430);
  var v438 = undefined;
  var v439;
  var v440;
  v440 = 0;
  ++v432;
  for (; v432 < v434; ++v440, ++v432) {
    v436.points = [];
    v438 = {
      width: 0,
      height: 0,
      edgeLabel: v436,
      edgeObj: v430,
      rank: v432
    };
    v439 = addDummyNode(v429, "edge", v438, "_d");
    if (v432 === v437) {
      v438.width = v436.width;
      v438.height = v436.height;
      v438.dummy = "edge-label";
      v438.labelpos = v436.labelpos;
    }
    v429.setEdge(v431, v439, {
      weight: v436.weight
    }, v435);
    if (v440 === 0) {
      v429.graph().dummyChains.push(v439);
    }
    v431 = v439;
  }
  v429.setEdge(v431, v433, {
    weight: v436.weight
  }, v435);
}
function undo(v441) {
  v35(v441.graph().dummyChains, function (v442) {
    var v443 = v441.node(v442);
    var v444 = v443.edgeLabel;
    var v445;
    v441.setEdge(v443.edgeObj, v444);
    while (v443.dummy) {
      v445 = v441.successors(v442)[0];
      v441.removeNode(v442);
      v444.points.push({
        x: v443.x,
        y: v443.y
      });
      if (v443.dummy === "edge-label") {
        v444.x = v443.x;
        v444.y = v443.y;
        v444.width = v443.width;
        v444.height = v443.height;
      }
      v442 = v445;
      v443 = v441.node(v442);
    }
  });
}
function longestPath(v446) {
  var v447 = {};
  function v448(v449) {
    var v450 = v446.node(v449);
    if (Object.prototype.hasOwnProperty.call(v447, v449)) {
      return v450.rank;
    }
    v447[v449] = true;
    var v451 = min(v52(v446.outEdges(v449), function (v452) {
      return v448(v452.w) - v446.edge(v452).minlen;
    }));
    if (v451 === Number.POSITIVE_INFINITY || v451 === undefined || v451 === null) {
      v451 = 0;
    }
    return v450.rank = v451;
  }
  v35(v446.sources(), v448);
}
function slack(v453, v454) {
  return v453.node(v454.w).rank - v453.node(v454.v).rank - v453.edge(v454).minlen;
}
function feasibleTree(v455) {
  var v456 = new v34({
    directed: false
  });
  var v457 = v455.nodes()[0];
  var v458 = v455.nodeCount();
  v456.setNode(v457, {});
  var v459;
  var v460;
  while (tightTree(v456, v455) < v458) {
    v459 = findMinSlackEdge(v456, v455);
    v460 = v456.hasNode(v459.v) ? slack(v455, v459) : -slack(v455, v459);
    shiftRanks(v456, v455, v460);
  }
  return v456;
}
function tightTree(v461, v462) {
  function v463(v464) {
    v35(v462.nodeEdges(v464), function (v465) {
      var v466 = v465.v;
      var v467 = v464 === v466 ? v465.w : v466;
      if (!v461.hasNode(v467) && !slack(v462, v465)) {
        v461.setNode(v467, {});
        v461.setEdge(v464, v467, {});
        v463(v467);
      }
    });
  }
  v35(v461.nodes(), v463);
  return v461.nodeCount();
}
function findMinSlackEdge(v468, v469) {
  return minBy(v469.edges(), function (v470) {
    if (v468.hasNode(v470.v) !== v468.hasNode(v470.w)) {
      return slack(v469, v470);
    }
  });
}
function shiftRanks(v471, v472, v473) {
  v35(v471.nodes(), function (v474) {
    v472.node(v474).rank += v473;
  });
}
function CycleException() {}
CycleException.prototype = new Error();
function dfs$1(v475, v476, v477) {
  if (!v14(v476)) {
    v476 = [v476];
  }
  var v478 = (v475.isDirected() ? v475.successors : v475.neighbors).bind(v475);
  var v479 = [];
  var v480 = {};
  v35(v476, function (v481) {
    if (!v475.hasNode(v481)) {
      throw new Error("Graph does not have node: " + v481);
    }
    doDfs(v475, v481, v477 === "post", v480, v478, v479);
  });
  return v479;
}
function doDfs(v482, v483, v484, v485, v486, v487) {
  if (!Object.prototype.hasOwnProperty.call(v485, v483)) {
    v485[v483] = true;
    if (!v484) {
      v487.push(v483);
    }
    v35(v486(v483), function (v488) {
      doDfs(v482, v488, v484, v485, v486, v487);
    });
    if (v484) {
      v487.push(v483);
    }
  }
}
function postorder$1(v489, v490) {
  return dfs$1(v489, v490, "post");
}
function preorder(v491, v492) {
  return dfs$1(v491, v492, "pre");
}
networkSimplex.initLowLimValues = initLowLimValues;
networkSimplex.initCutValues = initCutValues;
networkSimplex.calcCutValue = calcCutValue;
networkSimplex.leaveEdge = leaveEdge;
networkSimplex.enterEdge = enterEdge;
networkSimplex.exchangeEdges = exchangeEdges;
function networkSimplex(v493) {
  v493 = simplify(v493);
  longestPath(v493);
  var v494 = feasibleTree(v493);
  initLowLimValues(v494);
  initCutValues(v494, v493);
  var v495;
  var v496;
  while (v495 = leaveEdge(v494)) {
    v496 = enterEdge(v494, v493, v495);
    exchangeEdges(v494, v493, v495, v496);
  }
}
function initCutValues(v497, v498) {
  var v499 = postorder$1(v497, v497.nodes());
  v499 = v499.slice(0, v499.length - 1);
  v35(v499, function (v500) {
    assignCutValue(v497, v498, v500);
  });
}
function assignCutValue(v501, v502, v503) {
  var v504 = v501.node(v503);
  var v505 = v504.parent;
  v501.edge(v503, v505).cutvalue = calcCutValue(v501, v502, v503);
}
function calcCutValue(v506, v507, v508) {
  var v509 = v506.node(v508);
  var v510 = v509.parent;
  var v511 = true;
  var v512 = v507.edge(v508, v510);
  var v513 = 0;
  if (!v512) {
    v511 = false;
    v512 = v507.edge(v510, v508);
  }
  v513 = v512.weight;
  v35(v507.nodeEdges(v508), function (v514) {
    var v515 = v514.v === v508;
    var v516 = v515 ? v514.w : v514.v;
    if (v516 !== v510) {
      var v517 = v515 === v511;
      var v518 = v507.edge(v514).weight;
      v513 += v517 ? v518 : -v518;
      if (isTreeEdge(v506, v508, v516)) {
        var v519 = v506.edge(v508, v516).cutvalue;
        v513 += v517 ? -v519 : v519;
      }
    }
  });
  return v513;
}
function initLowLimValues(v520, v521) {
  if (arguments.length < 2) {
    v521 = v520.nodes()[0];
  }
  dfsAssignLowLim(v520, {}, 1, v521);
}
function dfsAssignLowLim(v522, v523, v524, v525, v526) {
  var v527 = v524;
  var v528 = v522.node(v525);
  v523[v525] = true;
  v35(v522.neighbors(v525), function (v529) {
    if (!Object.prototype.hasOwnProperty.call(v523, v529)) {
      v524 = dfsAssignLowLim(v522, v523, v524, v529, v525);
    }
  });
  v528.low = v527;
  v528.lim = v524++;
  if (v526) {
    v528.parent = v526;
  } else {
    delete v528.parent;
  }
  return v524;
}
function leaveEdge(v530) {
  return find(v530.edges(), function (v531) {
    return v530.edge(v531).cutvalue < 0;
  });
}
function enterEdge(v532, v533, v534) {
  var v535 = v534.v;
  var v536 = v534.w;
  if (!v533.hasEdge(v535, v536)) {
    v535 = v534.w;
    v536 = v534.v;
  }
  var v537 = v532.node(v535);
  var v538 = v532.node(v536);
  var v539 = v537;
  var v540 = false;
  if (v537.lim > v538.lim) {
    v539 = v538;
    v540 = true;
  }
  var v541 = v38(v533.edges(), function (v542) {
    return v540 === isDescendant(v532, v532.node(v542.v), v539) && v540 !== isDescendant(v532, v532.node(v542.w), v539);
  });
  return minBy(v541, function (v543) {
    return slack(v533, v543);
  });
}
function exchangeEdges(v544, v545, v546, v547) {
  var v548 = v546.v;
  var v549 = v546.w;
  v544.removeEdge(v548, v549);
  v544.setEdge(v547.v, v547.w, {});
  initLowLimValues(v544);
  initCutValues(v544, v545);
  updateRanks(v544, v545);
}
function updateRanks(v550, v551) {
  var v552 = find(v550.nodes(), function (v553) {
    return !v551.node(v553).parent;
  });
  var v554 = preorder(v550, v552);
  v554 = v554.slice(1);
  v35(v554, function (v555) {
    var v556 = v550.node(v555).parent;
    var v557 = v551.edge(v555, v556);
    var v558 = false;
    if (!v557) {
      v557 = v551.edge(v556, v555);
      v558 = true;
    }
    v551.node(v555).rank = v551.node(v556).rank + (v558 ? v557.minlen : -v557.minlen);
  });
}
function isTreeEdge(v559, v560, v561) {
  return v559.hasEdge(v560, v561);
}
function isDescendant(v562, v563, v564) {
  return v564.low <= v563.lim && v563.lim <= v564.lim;
}
function rank(v565) {
  switch (v565.graph().ranker) {
    case "network-simplex":
      networkSimplexRanker(v565);
      break;
    case "tight-tree":
      tightTreeRanker(v565);
      break;
    case "longest-path":
      longestPathRanker(v565);
      break;
    default:
      networkSimplexRanker(v565);
  }
}
var longestPathRanker = longestPath;
function tightTreeRanker(v566) {
  longestPath(v566);
  feasibleTree(v566);
}
function networkSimplexRanker(v567) {
  networkSimplex(v567);
}
function run(v568) {
  var v569 = addDummyNode(v568, "root", {}, "_root");
  var v570 = treeDepths(v568);
  var v571 = max(v39(v570)) - 1;
  var v572 = v571 * 2 + 1;
  v568.graph().nestingRoot = v569;
  v35(v568.edges(), function (v573) {
    v568.edge(v573).minlen *= v572;
  });
  var v574 = sumWeights(v568) + 1;
  v35(v568.children(), function (v575) {
    dfs(v568, v569, v572, v574, v571, v570, v575);
  });
  v568.graph().nodeRankFactor = v572;
}
function dfs(v576, v577, v578, v579, v580, v581, v582) {
  var v583 = v576.children(v582);
  if (!v583.length) {
    if (v582 !== v577) {
      v576.setEdge(v577, v582, {
        weight: 0,
        minlen: v578
      });
    }
    return;
  }
  var v584 = addBorderNode$1(v576, "_bt");
  var v585 = addBorderNode$1(v576, "_bb");
  var v586 = v576.node(v582);
  v576.setParent(v584, v582);
  v586.borderTop = v584;
  v576.setParent(v585, v582);
  v586.borderBottom = v585;
  v35(v583, function (v587) {
    dfs(v576, v577, v578, v579, v580, v581, v587);
    var v588 = v576.node(v587);
    var v589 = v588.borderTop ? v588.borderTop : v587;
    var v590 = v588.borderBottom ? v588.borderBottom : v587;
    var v591 = v588.borderTop ? v579 : v579 * 2;
    var v592 = v589 !== v590 ? 1 : v580 - v581[v582] + 1;
    v576.setEdge(v584, v589, {
      weight: v591,
      minlen: v592,
      nestingEdge: true
    });
    v576.setEdge(v590, v585, {
      weight: v591,
      minlen: v592,
      nestingEdge: true
    });
  });
  if (!v576.parent(v582)) {
    v576.setEdge(v577, v584, {
      weight: 0,
      minlen: v580 + v581[v582]
    });
  }
}
function treeDepths(v593) {
  var v594 = {};
  function v595(v596, v597) {
    var v598 = v593.children(v596);
    if (v598 && v598.length) {
      v35(v598, function (v599) {
        v595(v599, v597 + 1);
      });
    }
    v594[v596] = v597;
  }
  v35(v593.children(), function (v600) {
    v595(v600, 1);
  });
  return v594;
}
function sumWeights(v601) {
  return v40(v601.edges(), function (v602, v603) {
    return v602 + v601.edge(v603).weight;
  }, 0);
}
function cleanup(v604) {
  var v605 = v604.graph();
  v604.removeNode(v605.nestingRoot);
  delete v605.nestingRoot;
  v35(v604.edges(), function (v606) {
    var v607 = v604.edge(v606);
    if (v607.nestingEdge) {
      v604.removeEdge(v606);
    }
  });
}
function addSubgraphConstraints(v608, v609, v610) {
  var v611 = {};
  var v612;
  v35(v610, function (v613) {
    var v614 = v608.parent(v613);
    var v615;
    var v616;
    while (v614) {
      v615 = v608.parent(v614);
      if (v615) {
        v616 = v611[v615];
        v611[v615] = v614;
      } else {
        v616 = v612;
        v612 = v614;
      }
      if (v616 && v616 !== v614) {
        v609.setEdge(v616, v614);
        return;
      }
      v614 = v615;
    }
  });
}
function buildLayerGraph(v617, v618, v619) {
  var v620 = createRootNode(v617);
  var v621 = new v34({
    compound: true
  }).setGraph({
    root: v620
  }).setDefaultNodeLabel(function (v622) {
    return v617.node(v622);
  });
  v35(v617.nodes(), function (v623) {
    var v624 = v617.node(v623);
    var v625 = v617.parent(v623);
    if (v624.rank === v618 || v624.minRank <= v618 && v618 <= v624.maxRank) {
      v621.setNode(v623);
      v621.setParent(v623, v625 || v620);
      v35(v617[v619](v623), function (v626) {
        var v627 = v626.v === v623 ? v626.w : v626.v;
        var v628 = v621.edge(v627, v623);
        var v629 = !v37(v628) ? v628.weight : 0;
        v621.setEdge(v627, v623, {
          weight: v617.edge(v626).weight + v629
        });
      });
      if (Object.prototype.hasOwnProperty.call(v624, "minRank")) {
        v621.setNode(v623, {
          borderLeft: v624.borderLeft[v618],
          borderRight: v624.borderRight[v618]
        });
      }
    }
  });
  return v621;
}
function createRootNode(v630) {
  var v631;
  while (v630.hasNode(v631 = uniqueId("_root")));
  return v631;
}
function crossCount(v632, v633) {
  var v634 = 0;
  for (var v635 = 1; v635 < v633.length; ++v635) {
    v634 += twoLayerCrossCount(v632, v633[v635 - 1], v633[v635]);
  }
  return v634;
}
function twoLayerCrossCount(v636, v637, v638) {
  var v639 = zipObject(v638, v52(v638, function (v640, v641) {
    return v641;
  }));
  var v642 = flatten(v52(v637, function (v643) {
    return sortBy(v52(v636.outEdges(v643), function (v644) {
      return {
        pos: v639[v644.w],
        weight: v636.edge(v644).weight
      };
    }), "pos");
  }));
  var v645 = 1;
  while (v645 < v638.length) {
    v645 <<= 1;
  }
  var v646 = v645 * 2 - 1;
  v645 -= 1;
  var v647 = v52(new Array(v646), function () {
    return 0;
  });
  var v648 = 0;
  v35(v642.forEach(function (v649) {
    var v650 = v649.pos + v645;
    v647[v650] += v649.weight;
    var v651 = 0;
    while (v650 > 0) {
      if (v650 % 2) {
        v651 += v647[v650 + 1];
      }
      v650 = v650 - 1 >> 1;
      v647[v650] += v649.weight;
    }
    v648 += v649.weight * v651;
  }));
  return v648;
}
function initOrder(v652) {
  var v653 = {};
  var v654 = v38(v652.nodes(), function (v655) {
    return !v652.children(v655).length;
  });
  var v656 = max(v52(v654, function (v657) {
    return v652.node(v657).rank;
  }));
  var v658 = v52(range(v656 + 1), function () {
    return [];
  });
  function v659(v660) {
    if (has(v653, v660)) {
      return;
    }
    v653[v660] = true;
    var v661 = v652.node(v660);
    v658[v661.rank].push(v660);
    v35(v652.successors(v660), v659);
  }
  var v662 = sortBy(v654, function (v663) {
    return v652.node(v663).rank;
  });
  v35(v662, v659);
  return v658;
}
function barycenter(v664, v665) {
  return v52(v665, function (v666) {
    var v667 = v664.inEdges(v666);
    if (!v667.length) {
      return {
        v: v666
      };
    } else {
      var v668 = v40(v667, function (v669, v670) {
        var v671 = v664.edge(v670);
        var v672 = v664.node(v670.v);
        return {
          sum: v669.sum + v671.weight * v672.order,
          weight: v669.weight + v671.weight
        };
      }, {
        sum: 0,
        weight: 0
      });
      return {
        v: v666,
        barycenter: v668.sum / v668.weight,
        weight: v668.weight
      };
    }
  });
}
function resolveConflicts(v673, v674) {
  var v675 = {};
  v35(v673, function (v676, v677) {
    var v678 = v675[v676.v] = {
      indegree: 0,
      in: [],
      out: [],
      vs: [v676.v],
      i: v677
    };
    if (!v37(v676.barycenter)) {
      v678.barycenter = v676.barycenter;
      v678.weight = v676.weight;
    }
  });
  v35(v674.edges(), function (v679) {
    var v680 = v675[v679.v];
    var v681 = v675[v679.w];
    if (!v37(v680) && !v37(v681)) {
      v681.indegree++;
      v680.out.push(v675[v679.w]);
    }
  });
  var v682 = v38(v675, function (v683) {
    return !v683.indegree;
  });
  return doResolveConflicts(v682);
}
function doResolveConflicts(v684) {
  var v685 = [];
  function v686(v687) {
    return function (v688) {
      if (v688.merged) {
        return;
      }
      if (v37(v688.barycenter) || v37(v687.barycenter) || v688.barycenter >= v687.barycenter) {
        mergeEntries(v687, v688);
      }
    };
  }
  function v689(v690) {
    return function (v691) {
      v691.in.push(v690);
      if (--v691.indegree === 0) {
        v684.push(v691);
      }
    };
  }
  while (v684.length) {
    var v692 = v684.pop();
    v685.push(v692);
    v35(v692.in.reverse(), v686(v692));
    v35(v692.out, v689(v692));
  }
  return v52(v38(v685, function (v693) {
    return !v693.merged;
  }), function (v694) {
    return pick(v694, ["vs", "i", "barycenter", "weight"]);
  });
}
function mergeEntries(v695, v696) {
  var v697 = 0;
  var v698 = 0;
  if (v695.weight) {
    v697 += v695.barycenter * v695.weight;
    v698 += v695.weight;
  }
  if (v696.weight) {
    v697 += v696.barycenter * v696.weight;
    v698 += v696.weight;
  }
  v695.vs = v696.vs.concat(v695.vs);
  v695.barycenter = v697 / v698;
  v695.weight = v698;
  v695.i = Math.min(v696.i, v695.i);
  v696.merged = true;
}
function sort(v699, v700) {
  var v701 = partition(v699, function (v702) {
    return Object.prototype.hasOwnProperty.call(v702, "barycenter");
  });
  var v703 = v701.lhs;
  var v704 = sortBy(v701.rhs, function (v705) {
    return -v705.i;
  });
  var v706 = [];
  var v707 = 0;
  var v708 = 0;
  var v709 = 0;
  v703.sort(compareWithBias(!!v700));
  v709 = consumeUnsortable(v706, v704, v709);
  v35(v703, function (v710) {
    v709 += v710.vs.length;
    v706.push(v710.vs);
    v707 += v710.barycenter * v710.weight;
    v708 += v710.weight;
    v709 = consumeUnsortable(v706, v704, v709);
  });
  var v711 = {
    vs: flatten(v706)
  };
  if (v708) {
    v711.barycenter = v707 / v708;
    v711.weight = v708;
  }
  return v711;
}
function consumeUnsortable(v712, v713, v714) {
  var v715;
  while (v713.length && (v715 = last(v713)).i <= v714) {
    v713.pop();
    v712.push(v715.vs);
    v714++;
  }
  return v714;
}
function compareWithBias(v716) {
  return function (v717, v718) {
    if (v717.barycenter < v718.barycenter) {
      return -1;
    } else if (v717.barycenter > v718.barycenter) {
      return 1;
    }
    if (!v716) {
      return v717.i - v718.i;
    } else {
      return v718.i - v717.i;
    }
  };
}
function sortSubgraph(v719, v720, v721, v722) {
  var v723 = v719.children(v720);
  var v724 = v719.node(v720);
  var v725 = v724 ? v724.borderLeft : undefined;
  var v726 = v724 ? v724.borderRight : undefined;
  var v727 = {};
  if (v725) {
    v723 = v38(v723, function (v728) {
      return v728 !== v725 && v728 !== v726;
    });
  }
  var v729 = barycenter(v719, v723);
  v35(v729, function (v730) {
    if (v719.children(v730.v).length) {
      var v731 = sortSubgraph(v719, v730.v, v721, v722);
      v727[v730.v] = v731;
      if (Object.prototype.hasOwnProperty.call(v731, "barycenter")) {
        mergeBarycenters(v730, v731);
      }
    }
  });
  var v732 = resolveConflicts(v729, v721);
  expandSubgraphs(v732, v727);
  var v733 = sort(v732, v722);
  if (v725) {
    v733.vs = flatten([v725, v733.vs, v726]);
    if (v719.predecessors(v725).length) {
      var v734 = v719.node(v719.predecessors(v725)[0]);
      var v735 = v719.node(v719.predecessors(v726)[0]);
      if (!Object.prototype.hasOwnProperty.call(v733, "barycenter")) {
        v733.barycenter = 0;
        v733.weight = 0;
      }
      v733.barycenter = (v733.barycenter * v733.weight + v734.order + v735.order) / (v733.weight + 2);
      v733.weight += 2;
    }
  }
  return v733;
}
function expandSubgraphs(v736, v737) {
  v35(v736, function (v738) {
    v738.vs = flatten(v738.vs.map(function (v739) {
      if (v737[v739]) {
        return v737[v739].vs;
      }
      return v739;
    }));
  });
}
function mergeBarycenters(v740, v741) {
  if (!v37(v740.barycenter)) {
    v740.barycenter = (v740.barycenter * v740.weight + v741.barycenter * v741.weight) / (v740.weight + v741.weight);
    v740.weight += v741.weight;
  } else {
    v740.barycenter = v741.barycenter;
    v740.weight = v741.weight;
  }
}
function order(v742) {
  var v743 = maxRank(v742);
  var v744 = buildLayerGraphs(v742, range(1, v743 + 1), "inEdges");
  var v745 = buildLayerGraphs(v742, range(v743 - 1, -1, -1), "outEdges");
  var v746 = initOrder(v742);
  assignOrder(v742, v746);
  var v747 = Number.POSITIVE_INFINITY;
  var v748;
  for (var v749 = 0, v750 = 0; v750 < 4; ++v749, ++v750) {
    sweepLayerGraphs(v749 % 2 ? v744 : v745, v749 % 4 >= 2);
    v746 = buildLayerMatrix(v742);
    var v751 = crossCount(v742, v746);
    if (v751 < v747) {
      v750 = 0;
      v748 = cloneDeep(v746);
      v747 = v751;
    }
  }
  assignOrder(v742, v748);
}
function buildLayerGraphs(v752, v753, v754) {
  return v52(v753, function (v755) {
    return buildLayerGraph(v752, v755, v754);
  });
}
function sweepLayerGraphs(v756, v757) {
  var v758 = new v34();
  v35(v756, function (v759) {
    var v760 = v759.graph().root;
    var v761 = sortSubgraph(v759, v760, v758, v757);
    v35(v761.vs, function (v762, v763) {
      v759.node(v762).order = v763;
    });
    addSubgraphConstraints(v759, v758, v761.vs);
  });
}
function assignOrder(v764, v765) {
  v35(v765, function (v766) {
    v35(v766, function (v767, v768) {
      v764.node(v767).order = v768;
    });
  });
}
function parentDummyChains(v769) {
  var v770 = postorder(v769);
  v35(v769.graph().dummyChains, function (v771) {
    var v772 = v769.node(v771);
    var v773 = v772.edgeObj;
    var v774 = findPath(v769, v770, v773.v, v773.w);
    var v775 = v774.path;
    var v776 = v774.lca;
    var v777 = 0;
    var v778 = v775[v777];
    var v779 = true;
    while (v771 !== v773.w) {
      v772 = v769.node(v771);
      if (v779) {
        while ((v778 = v775[v777]) !== v776 && v769.node(v778).maxRank < v772.rank) {
          v777++;
        }
        if (v778 === v776) {
          v779 = false;
        }
      }
      if (!v779) {
        while (v777 < v775.length - 1 && v769.node(v778 = v775[v777 + 1]).minRank <= v772.rank) {
          v777++;
        }
        v778 = v775[v777];
      }
      v769.setParent(v771, v778);
      v771 = v769.successors(v771)[0];
    }
  });
}
function findPath(v780, v781, v782, v783) {
  var v784 = [];
  var v785 = [];
  var v786 = Math.min(v781[v782].low, v781[v783].low);
  var v787 = Math.max(v781[v782].lim, v781[v783].lim);
  var v788;
  var v789;
  v788 = v782;
  do {
    v788 = v780.parent(v788);
    v784.push(v788);
  } while (v788 && (v781[v788].low > v786 || v787 > v781[v788].lim));
  v789 = v788;
  v788 = v783;
  while ((v788 = v780.parent(v788)) !== v789) {
    v785.push(v788);
  }
  return {
    path: v784.concat(v785.reverse()),
    lca: v789
  };
}
function postorder(v790) {
  var v791 = {};
  var v792 = 0;
  function v793(v794) {
    var v795 = v792;
    v35(v790.children(v794), v793);
    v791[v794] = {
      low: v795,
      lim: v792++
    };
  }
  v35(v790.children(), v793);
  return v791;
}
function findType1Conflicts(v796, v797) {
  var v798 = {};
  function v799(v800, v801) {
    var v802 = 0;
    var v803 = 0;
    var v804 = v800.length;
    var v805 = last(v801);
    v35(v801, function (v806, v807) {
      var v808 = findOtherInnerSegmentNode(v796, v806);
      var v809 = v808 ? v796.node(v808).order : v804;
      if (v808 || v806 === v805) {
        v35(v801.slice(v803, v807 + 1), function (v810) {
          v35(v796.predecessors(v810), function (v811) {
            var v812 = v796.node(v811);
            var v813 = v812.order;
            if ((v813 < v802 || v809 < v813) && (!v812.dummy || !v796.node(v810).dummy)) {
              addConflict(v798, v811, v810);
            }
          });
        });
        v803 = v807 + 1;
        v802 = v809;
      }
    });
    return v801;
  }
  v40(v797, v799);
  return v798;
}
function findType2Conflicts(v814, v815) {
  var v816 = {};
  function v817(v818, v819, v820, v821, v822) {
    var v823;
    v35(range(v819, v820), function (v824) {
      v823 = v818[v824];
      if (v814.node(v823).dummy) {
        v35(v814.predecessors(v823), function (v825) {
          var v826 = v814.node(v825);
          if (v826.dummy && (v826.order < v821 || v826.order > v822)) {
            addConflict(v816, v825, v823);
          }
        });
      }
    });
  }
  function v827(v828, v829) {
    var v830 = -1;
    var v831;
    var v832 = 0;
    v35(v829, function (v833, v834) {
      if (v814.node(v833).dummy === "border") {
        var v835 = v814.predecessors(v833);
        if (v835.length) {
          v831 = v814.node(v835[0]).order;
          v817(v829, v832, v834, v830, v831);
          v832 = v834;
          v830 = v831;
        }
      }
      v817(v829, v832, v829.length, v831, v828.length);
    });
    return v829;
  }
  v40(v815, v827);
  return v816;
}
function findOtherInnerSegmentNode(v836, v837) {
  if (v836.node(v837).dummy) {
    return find(v836.predecessors(v837), function (v838) {
      return v836.node(v838).dummy;
    });
  }
}
function addConflict(v839, v840, v841) {
  if (v840 > v841) {
    var v842 = v840;
    v840 = v841;
    v841 = v842;
  }
  if (!Object.prototype.hasOwnProperty.call(v839, v840)) {
    Object.defineProperty(v839, v840, {
      enumerable: true,
      configurable: true,
      value: {},
      writable: true
    });
  }
  var v843 = v839[v840];
  Object.defineProperty(v843, v841, {
    enumerable: true,
    configurable: true,
    value: true,
    writable: true
  });
}
function hasConflict(v844, v845, v846) {
  if (v845 > v846) {
    var v847 = v845;
    v845 = v846;
    v846 = v847;
  }
  return !!v844[v845] && Object.prototype.hasOwnProperty.call(v844[v845], v846);
}
function verticalAlignment(v848, v849, v850, v851) {
  var v852 = {};
  var v853 = {};
  var v854 = {};
  v35(v849, function (v855) {
    v35(v855, function (v856, v857) {
      v852[v856] = v856;
      v853[v856] = v856;
      v854[v856] = v857;
    });
  });
  v35(v849, function (v858) {
    var v859 = -1;
    v35(v858, function (v860) {
      var v861 = v851(v860);
      if (v861.length) {
        v861 = sortBy(v861, function (v862) {
          return v854[v862];
        });
        var v863 = (v861.length - 1) / 2;
        for (var v864 = Math.floor(v863), v865 = Math.ceil(v863); v864 <= v865; ++v864) {
          var v866 = v861[v864];
          if (v853[v860] === v860 && v859 < v854[v866] && !hasConflict(v850, v860, v866)) {
            v853[v866] = v860;
            v853[v860] = v852[v860] = v852[v866];
            v859 = v854[v866];
          }
        }
      }
    });
  });
  return {
    root: v852,
    align: v853
  };
}
function horizontalCompaction(v867, v868, v869, v870, v871) {
  var v872 = {};
  var v873 = buildBlockGraph(v867, v868, v869, v871);
  var v874 = v871 ? "borderLeft" : "borderRight";
  function v875(v876, v877) {
    var v878 = v873.nodes();
    var v879 = v878.pop();
    var v880 = {};
    while (v879) {
      if (v880[v879]) {
        v876(v879);
      } else {
        v880[v879] = true;
        v878.push(v879);
        v878 = v878.concat(v877(v879));
      }
      v879 = v878.pop();
    }
  }
  function v881(v882) {
    v872[v882] = v873.inEdges(v882).reduce(function (v883, v884) {
      return Math.max(v883, v872[v884.v] + v873.edge(v884));
    }, 0);
  }
  function v885(v886) {
    var v887 = v873.outEdges(v886).reduce(function (v888, v889) {
      return Math.min(v888, v872[v889.w] - v873.edge(v889));
    }, Number.POSITIVE_INFINITY);
    var v890 = v867.node(v886);
    if (v887 !== Number.POSITIVE_INFINITY && v890.borderType !== v874) {
      v872[v886] = Math.max(v872[v886], v887);
    }
  }
  v875(v881, v873.predecessors.bind(v873));
  v875(v885, v873.successors.bind(v873));
  v35(v870, function (v891) {
    v872[v891] = v872[v869[v891]];
  });
  return v872;
}
function buildBlockGraph(v892, v893, v894, v895) {
  var v896 = new v34();
  var v897 = v892.graph();
  var v898 = sep(v897.nodesep, v897.edgesep, v895);
  v35(v893, function (v899) {
    var v900;
    v35(v899, function (v901) {
      var v902 = v894[v901];
      v896.setNode(v902);
      if (v900) {
        var v903 = v894[v900];
        var v904 = v896.edge(v903, v902);
        v896.setEdge(v903, v902, Math.max(v898(v892, v901, v900), v904 || 0));
      }
      v900 = v901;
    });
  });
  return v896;
}
function findSmallestWidthAlignment(v905, v906) {
  return minBy(v39(v906), function (v907) {
    var v908 = Number.NEGATIVE_INFINITY;
    var v909 = Number.POSITIVE_INFINITY;
    forIn(v907, function (v910, v911) {
      var v912 = width(v905, v911) / 2;
      v908 = Math.max(v910 + v912, v908);
      v909 = Math.min(v910 - v912, v909);
    });
    return v908 - v909;
  });
}
function alignCoordinates(v913, v914) {
  var v915 = v39(v914);
  var v916 = min(v915);
  var v917 = max(v915);
  v35(["u", "d"], function (v918) {
    v35(["l", "r"], function (v919) {
      var v920 = v918 + v919;
      var v921 = v913[v920];
      var v922;
      if (v921 === v914) {
        return;
      }
      var v923 = v39(v921);
      v922 = v919 === "l" ? v916 - min(v923) : v917 - max(v923);
      if (v922) {
        v913[v920] = mapValues(v921, function (v924) {
          return v924 + v922;
        });
      }
    });
  });
}
function balance(v925, v926) {
  return mapValues(v925.ul, function (v927, v928) {
    if (v926) {
      return v925[v926.toLowerCase()][v928];
    } else {
      var v929 = sortBy(v52(v925, v928));
      return (v929[1] + v929[2]) / 2;
    }
  });
}
function positionX(v930) {
  var v931 = buildLayerMatrix(v930);
  var v932 = merge(findType1Conflicts(v930, v931), findType2Conflicts(v930, v931));
  var v933 = {};
  var v934;
  v35(["u", "d"], function (v935) {
    v934 = v935 === "u" ? v931 : v39(v931).reverse();
    v35(["l", "r"], function (v936) {
      if (v936 === "r") {
        v934 = v52(v934, function (v937) {
          return v39(v937).reverse();
        });
      }
      var v938 = (v935 === "u" ? v930.predecessors : v930.successors).bind(v930);
      var v939 = verticalAlignment(v930, v934, v932, v938);
      var v940 = horizontalCompaction(v930, v934, v939.root, v939.align, v936 === "r");
      if (v936 === "r") {
        v940 = mapValues(v940, function (v941) {
          return -v941;
        });
      }
      v933[v935 + v936] = v940;
    });
  });
  var v942 = findSmallestWidthAlignment(v930, v933);
  alignCoordinates(v933, v942);
  return balance(v933, v930.graph().align);
}
function sep(v943, v944, v945) {
  return function (v946, v947, v948) {
    var v949 = v946.node(v947);
    var v950 = v946.node(v948);
    var v951 = 0;
    var v952;
    v951 += v949.width / 2;
    if (Object.prototype.hasOwnProperty.call(v949, "labelpos")) {
      switch (v949.labelpos.toLowerCase()) {
        case "l":
          v952 = -v949.width / 2;
          break;
        case "r":
          v952 = v949.width / 2;
          break;
      }
    }
    if (v952) {
      v951 += v945 ? v952 : -v952;
    }
    v952 = 0;
    v951 += (v949.dummy ? v944 : v943) / 2;
    v951 += (v950.dummy ? v944 : v943) / 2;
    v951 += v950.width / 2;
    if (Object.prototype.hasOwnProperty.call(v950, "labelpos")) {
      switch (v950.labelpos.toLowerCase()) {
        case "l":
          v952 = v950.width / 2;
          break;
        case "r":
          v952 = -v950.width / 2;
          break;
      }
    }
    if (v952) {
      v951 += v945 ? v952 : -v952;
    }
    v952 = 0;
    return v951;
  };
}
function width(v953, v954) {
  return v953.node(v954).width;
}
function position(v955) {
  v955 = asNonCompoundGraph(v955);
  positionY(v955);
  forOwn(positionX(v955), function (v956, v957) {
    v955.node(v957).x = v956;
  });
}
function positionY(v958) {
  var v959 = buildLayerMatrix(v958);
  var v960 = v958.graph().ranksep;
  var v961 = 0;
  v35(v959, function (v962) {
    var v963 = max(v52(v962, function (v964) {
      return v958.node(v964).height;
    }));
    v35(v962, function (v965) {
      v958.node(v965).y = v961 + v963 / 2;
    });
    v961 += v963 + v960;
  });
}
function layout(v966, v967) {
  var v968 = notime;
  v968("layout", () => {
    var v969 = v968("  buildLayoutGraph", () => buildLayoutGraph(v966));
    v968("  runLayout", () => runLayout(v969, v968));
    v968("  updateInputGraph", () => updateInputGraph(v966, v969));
  });
}
function runLayout(v970, v971) {
  v971("    makeSpaceForEdgeLabels", () => makeSpaceForEdgeLabels(v970));
  v971("    removeSelfEdges", () => removeSelfEdges(v970));
  v971("    acyclic", () => run$2(v970));
  v971("    nestingGraph.run", () => run(v970));
  v971("    rank", () => rank(asNonCompoundGraph(v970)));
  v971("    injectEdgeLabelProxies", () => injectEdgeLabelProxies(v970));
  v971("    removeEmptyRanks", () => removeEmptyRanks(v970));
  v971("    nestingGraph.cleanup", () => cleanup(v970));
  v971("    normalizeRanks", () => normalizeRanks(v970));
  v971("    assignRankMinMax", () => assignRankMinMax(v970));
  v971("    removeEdgeLabelProxies", () => removeEdgeLabelProxies(v970));
  v971("    normalize.run", () => run$1(v970));
  v971("    parentDummyChains", () => parentDummyChains(v970));
  v971("    addBorderSegments", () => addBorderSegments(v970));
  v971("    order", () => order(v970));
  v971("    insertSelfEdges", () => insertSelfEdges(v970));
  v971("    adjustCoordinateSystem", () => adjust(v970));
  v971("    position", () => position(v970));
  v971("    positionSelfEdges", () => positionSelfEdges(v970));
  v971("    removeBorderNodes", () => removeBorderNodes(v970));
  v971("    normalize.undo", () => undo(v970));
  v971("    fixupEdgeLabelCoords", () => fixupEdgeLabelCoords(v970));
  v971("    undoCoordinateSystem", () => undo$1(v970));
  v971("    translateGraph", () => translateGraph(v970));
  v971("    assignNodeIntersects", () => assignNodeIntersects(v970));
  v971("    reversePoints", () => reversePointsForReversedEdges(v970));
  v971("    acyclic.undo", () => undo$2(v970));
}
function updateInputGraph(v972, v973) {
  v35(v972.nodes(), function (v974) {
    var v975 = v972.node(v974);
    var v976 = v973.node(v974);
    if (v975) {
      v975.x = v976.x;
      v975.y = v976.y;
      if (v973.children(v974).length) {
        v975.width = v976.width;
        v975.height = v976.height;
      }
    }
  });
  v35(v972.edges(), function (v977) {
    var v978 = v972.edge(v977);
    var v979 = v973.edge(v977);
    v978.points = v979.points;
    if (Object.prototype.hasOwnProperty.call(v979, "x")) {
      v978.x = v979.x;
      v978.y = v979.y;
    }
  });
  v972.graph().width = v973.graph().width;
  v972.graph().height = v973.graph().height;
}
var graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
var graphDefaults = {
  ranksep: 50,
  edgesep: 20,
  nodesep: 50,
  rankdir: "tb"
};
var graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
var nodeNumAttrs = ["width", "height"];
var nodeDefaults = {
  width: 0,
  height: 0
};
var edgeNumAttrs = ["minlen", "weight", "width", "height", "labeloffset"];
var edgeDefaults = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
};
var edgeAttrs = ["labelpos"];
function buildLayoutGraph(v980) {
  var v981 = new v34({
    multigraph: true,
    compound: true
  });
  var v982 = canonicalize(v980.graph());
  v981.setGraph(merge({}, graphDefaults, selectNumberAttrs(v982, graphNumAttrs), pick(v982, graphAttrs)));
  v35(v980.nodes(), function (v983) {
    var v984 = canonicalize(v980.node(v983));
    v981.setNode(v983, defaults(selectNumberAttrs(v984, nodeNumAttrs), nodeDefaults));
    v981.setParent(v983, v980.parent(v983));
  });
  v35(v980.edges(), function (v985) {
    var v986 = canonicalize(v980.edge(v985));
    v981.setEdge(v985, merge({}, edgeDefaults, selectNumberAttrs(v986, edgeNumAttrs), pick(v986, edgeAttrs)));
  });
  return v981;
}
function makeSpaceForEdgeLabels(v987) {
  var v988 = v987.graph();
  v988.ranksep /= 2;
  v35(v987.edges(), function (v989) {
    var v990 = v987.edge(v989);
    v990.minlen *= 2;
    if (v990.labelpos.toLowerCase() !== "c") {
      if (v988.rankdir === "TB" || v988.rankdir === "BT") {
        v990.width += v990.labeloffset;
      } else {
        v990.height += v990.labeloffset;
      }
    }
  });
}
function injectEdgeLabelProxies(v991) {
  v35(v991.edges(), function (v992) {
    var v993 = v991.edge(v992);
    if (v993.width && v993.height) {
      var v994 = v991.node(v992.v);
      var v995 = v991.node(v992.w);
      var v996 = {
        rank: (v995.rank - v994.rank) / 2 + v994.rank,
        e: v992
      };
      addDummyNode(v991, "edge-proxy", v996, "_ep");
    }
  });
}
function assignRankMinMax(v997) {
  var v998 = 0;
  v35(v997.nodes(), function (v999) {
    var v1000 = v997.node(v999);
    if (v1000.borderTop) {
      v1000.minRank = v997.node(v1000.borderTop).rank;
      v1000.maxRank = v997.node(v1000.borderBottom).rank;
      v998 = max(v998, v1000.maxRank);
    }
  });
  v997.graph().maxRank = v998;
}
function removeEdgeLabelProxies(v1001) {
  v35(v1001.nodes(), function (v1002) {
    var v1003 = v1001.node(v1002);
    if (v1003.dummy === "edge-proxy") {
      v1001.edge(v1003.e).labelRank = v1003.rank;
      v1001.removeNode(v1002);
    }
  });
}
function translateGraph(v1004) {
  var v1005 = Number.POSITIVE_INFINITY;
  var v1006 = 0;
  var v1007 = Number.POSITIVE_INFINITY;
  var v1008 = 0;
  var v1009 = v1004.graph();
  var v1010 = v1009.marginx || 0;
  var v1011 = v1009.marginy || 0;
  function v1012(v1013) {
    var v1014 = v1013.x;
    var v1015 = v1013.y;
    var v1016 = v1013.width;
    var v1017 = v1013.height;
    v1005 = Math.min(v1005, v1014 - v1016 / 2);
    v1006 = Math.max(v1006, v1014 + v1016 / 2);
    v1007 = Math.min(v1007, v1015 - v1017 / 2);
    v1008 = Math.max(v1008, v1015 + v1017 / 2);
  }
  v35(v1004.nodes(), function (v1018) {
    v1012(v1004.node(v1018));
  });
  v35(v1004.edges(), function (v1019) {
    var v1020 = v1004.edge(v1019);
    if (Object.prototype.hasOwnProperty.call(v1020, "x")) {
      v1012(v1020);
    }
  });
  v1005 -= v1010;
  v1007 -= v1011;
  v35(v1004.nodes(), function (v1021) {
    var v1022 = v1004.node(v1021);
    v1022.x -= v1005;
    v1022.y -= v1007;
  });
  v35(v1004.edges(), function (v1023) {
    var v1024 = v1004.edge(v1023);
    v35(v1024.points, function (v1025) {
      v1025.x -= v1005;
      v1025.y -= v1007;
    });
    if (Object.prototype.hasOwnProperty.call(v1024, "x")) {
      v1024.x -= v1005;
    }
    if (Object.prototype.hasOwnProperty.call(v1024, "y")) {
      v1024.y -= v1007;
    }
  });
  v1009.width = v1006 - v1005 + v1010;
  v1009.height = v1008 - v1007 + v1011;
}
function assignNodeIntersects(v1026) {
  v35(v1026.edges(), function (v1027) {
    var v1028 = v1026.edge(v1027);
    var v1029 = v1026.node(v1027.v);
    var v1030 = v1026.node(v1027.w);
    var v1031;
    var v1032;
    if (!v1028.points) {
      v1028.points = [];
      v1031 = v1030;
      v1032 = v1029;
    } else {
      v1031 = v1028.points[0];
      v1032 = v1028.points[v1028.points.length - 1];
    }
    v1028.points.unshift(intersectRect(v1029, v1031));
    v1028.points.push(intersectRect(v1030, v1032));
  });
}
function fixupEdgeLabelCoords(v1033) {
  v35(v1033.edges(), function (v1034) {
    var v1035 = v1033.edge(v1034);
    if (Object.prototype.hasOwnProperty.call(v1035, "x")) {
      if (v1035.labelpos === "l" || v1035.labelpos === "r") {
        v1035.width -= v1035.labeloffset;
      }
      switch (v1035.labelpos) {
        case "l":
          v1035.x -= v1035.width / 2 + v1035.labeloffset;
          break;
        case "r":
          v1035.x += v1035.width / 2 + v1035.labeloffset;
          break;
      }
    }
  });
}
function reversePointsForReversedEdges(v1036) {
  v35(v1036.edges(), function (v1037) {
    var v1038 = v1036.edge(v1037);
    if (v1038.reversed) {
      v1038.points.reverse();
    }
  });
}
function removeBorderNodes(v1039) {
  v35(v1039.nodes(), function (v1040) {
    if (v1039.children(v1040).length) {
      var v1041 = v1039.node(v1040);
      var v1042 = v1039.node(v1041.borderTop);
      var v1043 = v1039.node(v1041.borderBottom);
      var v1044 = v1039.node(last(v1041.borderLeft));
      var v1045 = v1039.node(last(v1041.borderRight));
      v1041.width = Math.abs(v1045.x - v1044.x);
      v1041.height = Math.abs(v1043.y - v1042.y);
      v1041.x = v1044.x + v1041.width / 2;
      v1041.y = v1042.y + v1041.height / 2;
    }
  });
  v35(v1039.nodes(), function (v1046) {
    if (v1039.node(v1046).dummy === "border") {
      v1039.removeNode(v1046);
    }
  });
}
function removeSelfEdges(v1047) {
  v35(v1047.edges(), function (v1048) {
    if (v1048.v === v1048.w) {
      var v1049 = v1047.node(v1048.v);
      if (!v1049.selfEdges) {
        v1049.selfEdges = [];
      }
      v1049.selfEdges.push({
        e: v1048,
        label: v1047.edge(v1048)
      });
      v1047.removeEdge(v1048);
    }
  });
}
function insertSelfEdges(v1050) {
  var v1051 = buildLayerMatrix(v1050);
  v35(v1051, function (v1052) {
    var v1053 = 0;
    v35(v1052, function (v1054, v1055) {
      var v1056 = v1050.node(v1054);
      v1056.order = v1055 + v1053;
      v35(v1056.selfEdges, function (v1057) {
        addDummyNode(v1050, "selfedge", {
          width: v1057.label.width,
          height: v1057.label.height,
          rank: v1056.rank,
          order: v1055 + ++v1053,
          e: v1057.e,
          label: v1057.label
        }, "_se");
      });
      delete v1056.selfEdges;
    });
  });
}
function positionSelfEdges(v1058) {
  v35(v1058.nodes(), function (v1059) {
    var v1060 = v1058.node(v1059);
    if (v1060.dummy === "selfedge") {
      var v1061 = v1058.node(v1060.e.v);
      var v1062 = v1061.x + v1061.width / 2;
      var v1063 = v1061.y;
      var v1064 = v1060.x - v1062;
      var v1065 = v1061.height / 2;
      v1058.setEdge(v1060.e, v1060.label);
      v1058.removeNode(v1059);
      v1060.label.points = [{
        x: v1062 + v1064 * 2 / 3,
        y: v1063 - v1065
      }, {
        x: v1062 + v1064 * 5 / 6,
        y: v1063 - v1065
      }, {
        x: v1062 + v1064,
        y: v1063
      }, {
        x: v1062 + v1064 * 5 / 6,
        y: v1063 + v1065
      }, {
        x: v1062 + v1064 * 2 / 3,
        y: v1063 + v1065
      }];
      v1060.label.x = v1060.x;
      v1060.label.y = v1060.y;
    }
  });
}
function selectNumberAttrs(v1066, v1067) {
  return mapValues(pick(v1066, v1067), Number);
}
function canonicalize(v1068) {
  var v1069 = {};
  v35(v1068, function (v1070, v1071) {
    v1069[v1071.toLowerCase()] = v1070;
  });
  return v1069;
}
export { layout as l };