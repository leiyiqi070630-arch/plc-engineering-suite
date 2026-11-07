import { n as v1, o as v2, s as v3, g as v4, b as v5, a as v6, _ as v7, c as v8, ba as v9, d as v10, W as v11, p as v12, k as v13 } from "./index-CXb3UsfP.js";
import { o as v14 } from "./ordinal-CxptdPJm.js";
import "./init-ZxktEp_H.js";
function colors(v15) {
  var v16 = v15.length / 6 | 0;
  var v17 = new Array(v16);
  var v18 = 0;
  while (v18 < v16) {
    v17[v18] = "#" + v15.slice(v18 * 6, ++v18 * 6);
  }
  return v17;
}
const d3schemeTableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");
function max(v19, v20) {
  let v21;
  if (v20 === undefined) {
    for (const v22 of v19) {
      if (v22 != null && (v21 < v22 || v21 === undefined && v22 >= v22)) {
        v21 = v22;
      }
    }
  } else {
    let v23 = -1;
    for (let v24 of v19) {
      if ((v24 = v20(v24, ++v23, v19)) != null && (v21 < v24 || v21 === undefined && v24 >= v24)) {
        v21 = v24;
      }
    }
  }
  return v21;
}
function min(v25, v26) {
  let v27;
  if (v26 === undefined) {
    for (const v28 of v25) {
      if (v28 != null && (v27 > v28 || v27 === undefined && v28 >= v28)) {
        v27 = v28;
      }
    }
  } else {
    let v29 = -1;
    for (let v30 of v25) {
      if ((v30 = v26(v30, ++v29, v25)) != null && (v27 > v30 || v27 === undefined && v30 >= v30)) {
        v27 = v30;
      }
    }
  }
  return v27;
}
function sum(v31, v32) {
  let v33 = 0;
  if (v32 === undefined) {
    for (let v34 of v31) {
      if (v34 = +v34) {
        v33 += v34;
      }
    }
  } else {
    let v35 = -1;
    for (let v36 of v31) {
      if (v36 = +v32(v36, ++v35, v31)) {
        v33 += v36;
      }
    }
  }
  return v33;
}
function targetDepth(v37) {
  return v37.target.depth;
}
function left(v38) {
  return v38.depth;
}
function right(v39, v40) {
  return v40 - 1 - v39.height;
}
function justify(v41, v42) {
  if (v41.sourceLinks.length) {
    return v41.depth;
  } else {
    return v42 - 1;
  }
}
function center(v43) {
  if (v43.targetLinks.length) {
    return v43.depth;
  } else if (v43.sourceLinks.length) {
    return min(v43.sourceLinks, targetDepth) - 1;
  } else {
    return 0;
  }
}
function constant$1(v44) {
  return function () {
    return v44;
  };
}
function ascendingSourceBreadth(v45, v46) {
  return ascendingBreadth(v45.source, v46.source) || v45.index - v46.index;
}
function ascendingTargetBreadth(v47, v48) {
  return ascendingBreadth(v47.target, v48.target) || v47.index - v48.index;
}
function ascendingBreadth(v49, v50) {
  return v49.y0 - v50.y0;
}
function value(v51) {
  return v51.value;
}
function defaultId(v52) {
  return v52.index;
}
function defaultNodes(v53) {
  return v53.nodes;
}
function defaultLinks(v54) {
  return v54.links;
}
function find(v55, v56) {
  const v57 = v55.get(v56);
  if (!v57) {
    throw new Error("missing: " + v56);
  }
  return v57;
}
function computeLinkBreadths({
  nodes: v58
}) {
  for (const v59 of v58) {
    let v60 = v59.y0;
    let v61 = v60;
    for (const v62 of v59.sourceLinks) {
      v62.y0 = v60 + v62.width / 2;
      v60 += v62.width;
    }
    for (const v63 of v59.targetLinks) {
      v63.y1 = v61 + v63.width / 2;
      v61 += v63.width;
    }
  }
}
function Sankey() {
  let v64 = 0;
  let v65 = 0;
  let v66 = 1;
  let v67 = 1;
  let v68 = 24;
  let v69 = 8;
  let v70;
  let v71 = defaultId;
  let v72 = justify;
  let v73;
  let v74;
  let v75 = defaultNodes;
  let v76 = defaultLinks;
  let v77 = 6;
  function v78() {
    const v79 = {
      nodes: v75.apply(null, arguments),
      links: v76.apply(null, arguments)
    };
    v80(v79);
    v81(v79);
    v82(v79);
    v83(v79);
    v84(v79);
    computeLinkBreadths(v79);
    return v79;
  }
  v78.update = function (v85) {
    computeLinkBreadths(v85);
    return v85;
  };
  v78.nodeId = function (v86) {
    if (arguments.length) {
      v71 = typeof v86 === "function" ? v86 : constant$1(v86);
      return v78;
    } else {
      return v71;
    }
  };
  v78.nodeAlign = function (v87) {
    if (arguments.length) {
      v72 = typeof v87 === "function" ? v87 : constant$1(v87);
      return v78;
    } else {
      return v72;
    }
  };
  v78.nodeSort = function (v88) {
    if (arguments.length) {
      v73 = v88;
      return v78;
    } else {
      return v73;
    }
  };
  v78.nodeWidth = function (v89) {
    if (arguments.length) {
      v68 = +v89;
      return v78;
    } else {
      return v68;
    }
  };
  v78.nodePadding = function (v90) {
    if (arguments.length) {
      v69 = v70 = +v90;
      return v78;
    } else {
      return v69;
    }
  };
  v78.nodes = function (v91) {
    if (arguments.length) {
      v75 = typeof v91 === "function" ? v91 : constant$1(v91);
      return v78;
    } else {
      return v75;
    }
  };
  v78.links = function (v92) {
    if (arguments.length) {
      v76 = typeof v92 === "function" ? v92 : constant$1(v92);
      return v78;
    } else {
      return v76;
    }
  };
  v78.linkSort = function (v93) {
    if (arguments.length) {
      v74 = v93;
      return v78;
    } else {
      return v74;
    }
  };
  v78.size = function (v94) {
    if (arguments.length) {
      v64 = v65 = 0;
      v66 = +v94[0];
      v67 = +v94[1];
      return v78;
    } else {
      return [v66 - v64, v67 - v65];
    }
  };
  v78.extent = function (v95) {
    if (arguments.length) {
      v64 = +v95[0][0];
      v66 = +v95[1][0];
      v65 = +v95[0][1];
      v67 = +v95[1][1];
      return v78;
    } else {
      return [[v64, v65], [v66, v67]];
    }
  };
  v78.iterations = function (v96) {
    if (arguments.length) {
      v77 = +v96;
      return v78;
    } else {
      return v77;
    }
  };
  function v80({
    nodes: v97,
    links: v98
  }) {
    for (const [v99, v100] of v97.entries()) {
      v100.index = v99;
      v100.sourceLinks = [];
      v100.targetLinks = [];
    }
    const v101 = new Map(v97.map((v102, v103) => [v71(v102, v103, v97), v102]));
    for (const [v104, v105] of v98.entries()) {
      v105.index = v104;
      let {
        source: v106,
        target: v107
      } = v105;
      if (typeof v106 !== "object") {
        v106 = v105.source = find(v101, v106);
      }
      if (typeof v107 !== "object") {
        v107 = v105.target = find(v101, v107);
      }
      v106.sourceLinks.push(v105);
      v107.targetLinks.push(v105);
    }
    if (v74 != null) {
      for (const {
        sourceLinks: v108,
        targetLinks: v109
      } of v97) {
        v108.sort(v74);
        v109.sort(v74);
      }
    }
  }
  function v81({
    nodes: v110
  }) {
    for (const v111 of v110) {
      v111.value = v111.fixedValue === undefined ? Math.max(sum(v111.sourceLinks, value), sum(v111.targetLinks, value)) : v111.fixedValue;
    }
  }
  function v82({
    nodes: v112
  }) {
    const v113 = v112.length;
    let v114 = new Set(v112);
    let v115 = new Set();
    let v116 = 0;
    while (v114.size) {
      for (const v117 of v114) {
        v117.depth = v116;
        for (const {
          target: v118
        } of v117.sourceLinks) {
          v115.add(v118);
        }
      }
      if (++v116 > v113) {
        throw new Error("circular link");
      }
      v114 = v115;
      v115 = new Set();
    }
  }
  function v83({
    nodes: v119
  }) {
    const v120 = v119.length;
    let v121 = new Set(v119);
    let v122 = new Set();
    let v123 = 0;
    while (v121.size) {
      for (const v124 of v121) {
        v124.height = v123;
        for (const {
          source: v125
        } of v124.targetLinks) {
          v122.add(v125);
        }
      }
      if (++v123 > v120) {
        throw new Error("circular link");
      }
      v121 = v122;
      v122 = new Set();
    }
  }
  function v126({
    nodes: v127
  }) {
    const v128 = max(v127, v129 => v129.depth) + 1;
    const v130 = (v66 - v64 - v68) / (v128 - 1);
    const v131 = new Array(v128);
    for (const v132 of v127) {
      const v133 = Math.max(0, Math.min(v128 - 1, Math.floor(v72.call(null, v132, v128))));
      v132.layer = v133;
      v132.x0 = v64 + v133 * v130;
      v132.x1 = v132.x0 + v68;
      if (v131[v133]) {
        v131[v133].push(v132);
      } else {
        v131[v133] = [v132];
      }
    }
    if (v73) {
      for (const v134 of v131) {
        v134.sort(v73);
      }
    }
    return v131;
  }
  function v135(v136) {
    const v137 = min(v136, v138 => (v67 - v65 - (v138.length - 1) * v70) / sum(v138, value));
    for (const v139 of v136) {
      let v140 = v65;
      for (const v141 of v139) {
        v141.y0 = v140;
        v141.y1 = v140 + v141.value * v137;
        v140 = v141.y1 + v70;
        for (const v142 of v141.sourceLinks) {
          v142.width = v142.value * v137;
        }
      }
      v140 = (v67 - v140 + v70) / (v139.length + 1);
      for (let v143 = 0; v143 < v139.length; ++v143) {
        const v144 = v139[v143];
        v144.y0 += v140 * (v143 + 1);
        v144.y1 += v140 * (v143 + 1);
      }
      v145(v139);
    }
  }
  function v84(v146) {
    const v147 = v126(v146);
    v70 = Math.min(v69, (v67 - v65) / (max(v147, v148 => v148.length) - 1));
    v135(v147);
    for (let v149 = 0; v149 < v77; ++v149) {
      const v150 = Math.pow(0.99, v149);
      const v151 = Math.max(1 - v150, (v149 + 1) / v77);
      v152(v147, v150, v151);
      v153(v147, v150, v151);
    }
  }
  function v153(v154, v155, v156) {
    for (let v157 = 1, v158 = v154.length; v157 < v158; ++v157) {
      const v159 = v154[v157];
      for (const v160 of v159) {
        let v161 = 0;
        let v162 = 0;
        for (const {
          source: v163,
          value: v164
        } of v160.targetLinks) {
          let v165 = v164 * (v160.layer - v163.layer);
          v161 += v166(v163, v160) * v165;
          v162 += v165;
        }
        if (!(v162 > 0)) {
          continue;
        }
        let v167 = (v161 / v162 - v160.y0) * v155;
        v160.y0 += v167;
        v160.y1 += v167;
        v168(v160);
      }
      if (v73 === undefined) {
        v159.sort(ascendingBreadth);
      }
      v169(v159, v156);
    }
  }
  function v152(v170, v171, v172) {
    for (let v173 = v170.length, v174 = v173 - 2; v174 >= 0; --v174) {
      const v175 = v170[v174];
      for (const v176 of v175) {
        let v177 = 0;
        let v178 = 0;
        for (const {
          target: v179,
          value: v180
        } of v176.sourceLinks) {
          let v181 = v180 * (v179.layer - v176.layer);
          v177 += v182(v176, v179) * v181;
          v178 += v181;
        }
        if (!(v178 > 0)) {
          continue;
        }
        let v183 = (v177 / v178 - v176.y0) * v171;
        v176.y0 += v183;
        v176.y1 += v183;
        v168(v176);
      }
      if (v73 === undefined) {
        v175.sort(ascendingBreadth);
      }
      v169(v175, v172);
    }
  }
  function v169(v184, v185) {
    const v186 = v184.length >> 1;
    const v187 = v184[v186];
    v188(v184, v187.y0 - v70, v186 - 1, v185);
    v189(v184, v187.y1 + v70, v186 + 1, v185);
    v188(v184, v67, v184.length - 1, v185);
    v189(v184, v65, 0, v185);
  }
  function v189(v190, v191, v192, v193) {
    for (; v192 < v190.length; ++v192) {
      const v194 = v190[v192];
      const v195 = (v191 - v194.y0) * v193;
      if (v195 > 0.000001) {
        v194.y0 += v195;
        v194.y1 += v195;
      }
      v191 = v194.y1 + v70;
    }
  }
  function v188(v196, v197, v198, v199) {
    for (; v198 >= 0; --v198) {
      const v200 = v196[v198];
      const v201 = (v200.y1 - v197) * v199;
      if (v201 > 0.000001) {
        v200.y0 -= v201;
        v200.y1 -= v201;
      }
      v197 = v200.y0 - v70;
    }
  }
  function v168({
    sourceLinks: v202,
    targetLinks: v203
  }) {
    if (v74 === undefined) {
      for (const {
        source: {
          sourceLinks: v204
        }
      } of v203) {
        v204.sort(ascendingTargetBreadth);
      }
      for (const {
        target: {
          targetLinks: v205
        }
      } of v202) {
        v205.sort(ascendingSourceBreadth);
      }
    }
  }
  function v145(v206) {
    if (v74 === undefined) {
      for (const {
        sourceLinks: v207,
        targetLinks: v208
      } of v206) {
        v207.sort(ascendingTargetBreadth);
        v208.sort(ascendingSourceBreadth);
      }
    }
  }
  function v166(v209, v210) {
    let v211 = v209.y0 - (v209.sourceLinks.length - 1) * v70 / 2;
    for (const {
      target: v212,
      width: v213
    } of v209.sourceLinks) {
      if (v212 === v210) {
        break;
      }
      v211 += v213 + v70;
    }
    for (const {
      source: v214,
      width: v215
    } of v210.targetLinks) {
      if (v214 === v209) {
        break;
      }
      v211 -= v215;
    }
    return v211;
  }
  function v182(v216, v217) {
    let v218 = v217.y0 - (v217.targetLinks.length - 1) * v70 / 2;
    for (const {
      source: v219,
      width: v220
    } of v217.targetLinks) {
      if (v219 === v216) {
        break;
      }
      v218 += v220 + v70;
    }
    for (const {
      target: v221,
      width: v222
    } of v216.sourceLinks) {
      if (v221 === v217) {
        break;
      }
      v218 -= v222;
    }
    return v218;
  }
  return v78;
}
var pi = Math.PI;
var tau = pi * 2;
var epsilon = 0.000001;
var tauEpsilon = tau - epsilon;
function Path() {
  this._x0 = this._y0 = this._x1 = this._y1 = null;
  this._ = "";
}
function path() {
  return new Path();
}
Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function (v223, v224) {
    this._ += "M" + (this._x0 = this._x1 = +v223) + "," + (this._y0 = this._y1 = +v224);
  },
  closePath: function () {
    if (this._x1 !== null) {
      this._x1 = this._x0;
      this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function (v225, v226) {
    this._ += "L" + (this._x1 = +v225) + "," + (this._y1 = +v226);
  },
  quadraticCurveTo: function (v227, v228, v229, v230) {
    this._ += "Q" + +v227 + "," + +v228 + "," + (this._x1 = +v229) + "," + (this._y1 = +v230);
  },
  bezierCurveTo: function (v231, v232, v233, v234, v235, v236) {
    this._ += "C" + +v231 + "," + +v232 + "," + +v233 + "," + +v234 + "," + (this._x1 = +v235) + "," + (this._y1 = +v236);
  },
  arcTo: function (v237, v238, v239, v240, v241) {
    v237 = +v237;
    v238 = +v238;
    v239 = +v239;
    v240 = +v240;
    v241 = +v241;
    var v242 = this._x1;
    var v243 = this._y1;
    var v244 = v239 - v237;
    var v245 = v240 - v238;
    var v246 = v242 - v237;
    var v247 = v243 - v238;
    var v248 = v246 * v246 + v247 * v247;
    if (v241 < 0) {
      throw new Error("negative radius: " + v241);
    }
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = v237) + "," + (this._y1 = v238);
    } else if (!(v248 > epsilon)) ;else if (!(Math.abs(v247 * v244 - v245 * v246) > epsilon) || !v241) {
      this._ += "L" + (this._x1 = v237) + "," + (this._y1 = v238);
    } else {
      var v249 = v239 - v242;
      var v250 = v240 - v243;
      var v251 = v244 * v244 + v245 * v245;
      var v252 = v249 * v249 + v250 * v250;
      var v253 = Math.sqrt(v251);
      var v254 = Math.sqrt(v248);
      var v255 = v241 * Math.tan((pi - Math.acos((v251 + v248 - v252) / (v253 * 2 * v254))) / 2);
      var v256 = v255 / v254;
      var v257 = v255 / v253;
      if (Math.abs(v256 - 1) > epsilon) {
        this._ += "L" + (v237 + v256 * v246) + "," + (v238 + v256 * v247);
      }
      this._ += "A" + v241 + "," + v241 + ",0,0," + +(v247 * v249 > v246 * v250) + "," + (this._x1 = v237 + v257 * v244) + "," + (this._y1 = v238 + v257 * v245);
    }
  },
  arc: function (v258, v259, v260, v261, v262, v263) {
    v258 = +v258;
    v259 = +v259;
    v260 = +v260;
    v263 = !!v263;
    var v264 = v260 * Math.cos(v261);
    var v265 = v260 * Math.sin(v261);
    var v266 = v258 + v264;
    var v267 = v259 + v265;
    var v268 = v263 ^ 1;
    var v269 = v263 ? v261 - v262 : v262 - v261;
    if (v260 < 0) {
      throw new Error("negative radius: " + v260);
    }
    if (this._x1 === null) {
      this._ += "M" + v266 + "," + v267;
    } else if (Math.abs(this._x1 - v266) > epsilon || Math.abs(this._y1 - v267) > epsilon) {
      this._ += "L" + v266 + "," + v267;
    }
    if (!v260) {
      return;
    }
    if (v269 < 0) {
      v269 = v269 % tau + tau;
    }
    if (v269 > tauEpsilon) {
      this._ += "A" + v260 + "," + v260 + ",0,1," + v268 + "," + (v258 - v264) + "," + (v259 - v265) + "A" + v260 + "," + v260 + ",0,1," + v268 + "," + (this._x1 = v266) + "," + (this._y1 = v267);
    } else if (v269 > epsilon) {
      this._ += "A" + v260 + "," + v260 + ",0," + +(v269 >= pi) + "," + v268 + "," + (this._x1 = v258 + v260 * Math.cos(v262)) + "," + (this._y1 = v259 + v260 * Math.sin(v262));
    }
  },
  rect: function (v270, v271, v272, v273) {
    this._ += "M" + (this._x0 = this._x1 = +v270) + "," + (this._y0 = this._y1 = +v271) + "h" + +v272 + "v" + +v273 + "h" + -v272 + "Z";
  },
  toString: function () {
    return this._;
  }
};
function constant(v274) {
  return function v275() {
    return v274;
  };
}
function x(v276) {
  return v276[0];
}
function y(v277) {
  return v277[1];
}
var slice = Array.prototype.slice;
function linkSource(v278) {
  return v278.source;
}
function linkTarget(v279) {
  return v279.target;
}
function link(v280) {
  var v281 = linkSource;
  var v282 = linkTarget;
  var v283 = x;
  var v284 = y;
  var v285 = null;
  function v286() {
    var v287;
    var v288 = slice.call(arguments);
    var v289 = v281.apply(this, v288);
    var v290 = v282.apply(this, v288);
    if (!v285) {
      v285 = v287 = path();
    }
    v280(v285, +v283.apply(this, (v288[0] = v289, v288)), +v284.apply(this, v288), +v283.apply(this, (v288[0] = v290, v288)), +v284.apply(this, v288));
    if (v287) {
      v285 = null;
      return v287 + "" || null;
    }
  }
  v286.source = function (v291) {
    if (arguments.length) {
      v281 = v291;
      return v286;
    } else {
      return v281;
    }
  };
  v286.target = function (v292) {
    if (arguments.length) {
      v282 = v292;
      return v286;
    } else {
      return v282;
    }
  };
  v286.x = function (v293) {
    if (arguments.length) {
      v283 = typeof v293 === "function" ? v293 : constant(+v293);
      return v286;
    } else {
      return v283;
    }
  };
  v286.y = function (v294) {
    if (arguments.length) {
      v284 = typeof v294 === "function" ? v294 : constant(+v294);
      return v286;
    } else {
      return v284;
    }
  };
  v286.context = function (v295) {
    if (arguments.length) {
      v285 = v295 == null ? null : v295;
      return v286;
    } else {
      return v285;
    }
  };
  return v286;
}
function curveHorizontal(v296, v297, v298, v299, v300) {
  v296.moveTo(v297, v298);
  v296.bezierCurveTo(v297 = (v297 + v299) / 2, v298, v297, v300, v299, v300);
}
function linkHorizontal() {
  return link(curveHorizontal);
}
function horizontalSource(v301) {
  return [v301.source.x1, v301.y0];
}
function horizontalTarget(v302) {
  return [v302.target.x0, v302.y1];
}
function d3SankeyLinkHorizontal() {
  return linkHorizontal().source(horizontalSource).target(horizontalTarget);
}
var parser = function () {
  var v303 = v7(function (v304, v305, v306, v307) {
    v306 = v306 || {};
    v307 = v304.length;
    for (; v307--; v306[v304[v307]] = v305);
    return v306;
  }, "o");
  var v308 = [1, 9];
  var v309 = [1, 10];
  var v310 = [1, 5, 10, 12];
  var v311 = {
    trace: v7(function v312() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      SANKEY: 4,
      NEWLINE: 5,
      csv: 6,
      opt_eof: 7,
      record: 8,
      csv_tail: 9,
      EOF: 10,
      "field[source]": 11,
      COMMA: 12,
      "field[target]": 13,
      "field[value]": 14,
      field: 15,
      escaped: 16,
      non_escaped: 17,
      DQUOTE: 18,
      ESCAPED_TEXT: 19,
      NON_ESCAPED_TEXT: 20,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      4: "SANKEY",
      5: "NEWLINE",
      10: "EOF",
      11: "field[source]",
      12: "COMMA",
      13: "field[target]",
      14: "field[value]",
      18: "DQUOTE",
      19: "ESCAPED_TEXT",
      20: "NON_ESCAPED_TEXT"
    },
    productions_: [0, [3, 4], [6, 2], [9, 2], [9, 0], [7, 1], [7, 0], [8, 5], [15, 1], [15, 1], [16, 3], [17, 1]],
    performAction: v7(function v313(v314, v315, v316, v317, v318, v319, v320) {
      var v321 = v319.length - 1;
      switch (v318) {
        case 7:
          const v322 = v317.findOrCreateNode(v319[v321 - 4].trim().replaceAll("\"\"", "\""));
          const v323 = v317.findOrCreateNode(v319[v321 - 2].trim().replaceAll("\"\"", "\""));
          const v324 = parseFloat(v319[v321].trim());
          v317.addLink(v322, v323, v324);
          break;
        case 8:
        case 9:
        case 11:
          this.$ = v319[v321];
          break;
        case 10:
          this.$ = v319[v321 - 1];
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: [1, 2]
    }, {
      1: [3]
    }, {
      5: [1, 3]
    }, {
      6: 4,
      8: 5,
      15: 6,
      16: 7,
      17: 8,
      18: v308,
      20: v309
    }, {
      1: [2, 6],
      7: 11,
      10: [1, 12]
    }, v303(v309, [2, 4], {
      9: 13,
      5: [1, 14]
    }), {
      12: [1, 15]
    }, v303(v310, [2, 8]), v303(v310, [2, 9]), {
      19: [1, 16]
    }, v303(v310, [2, 11]), {
      1: [2, 1]
    }, {
      1: [2, 5]
    }, v303(v309, [2, 2]), {
      6: 17,
      8: 5,
      15: 6,
      16: 7,
      17: 8,
      18: v308,
      20: v309
    }, {
      15: 18,
      16: 7,
      17: 8,
      18: v308,
      20: v309
    }, {
      18: [1, 19]
    }, v303(v309, [2, 3]), {
      12: [1, 20]
    }, v303(v310, [2, 10]), {
      15: 21,
      16: 7,
      17: 8,
      18: v308,
      20: v309
    }, v303([1, 5, 10], [2, 7])],
    defaultActions: {
      11: [2, 1],
      12: [2, 5]
    },
    parseError: v7(function v325(v326, v327) {
      if (v327.recoverable) {
        this.trace(v326);
      } else {
        var v328 = new Error(v326);
        v328.hash = v327;
        throw v328;
      }
    }, "parseError"),
    parse: v7(function v329(v330) {
      var v331 = this;
      var v332 = [0];
      var v333 = [];
      var v334 = [null];
      var v335 = [];
      var v336 = this.table;
      var v337 = "";
      var v338 = 0;
      var v339 = 0;
      var v340 = 2;
      var v341 = 1;
      var v342 = v335.slice.call(arguments, 1);
      var v343 = Object.create(this.lexer);
      var v344 = {
        yy: {}
      };
      for (var v345 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v345)) {
          v344.yy[v345] = this.yy[v345];
        }
      }
      v343.setInput(v330, v344.yy);
      v344.yy.lexer = v343;
      v344.yy.parser = this;
      if (typeof v343.yylloc == "undefined") {
        v343.yylloc = {};
      }
      var v346 = v343.yylloc;
      v335.push(v346);
      var v347 = v343.options && v343.options.ranges;
      if (typeof v344.yy.parseError === "function") {
        this.parseError = v344.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v348(v349) {
        v332.length = v332.length - v349 * 2;
        v334.length = v334.length - v349;
        v335.length = v335.length - v349;
      }
      v7(v348, "popStack");
      function v350() {
        var v351;
        v351 = v333.pop() || v343.lex() || v341;
        if (typeof v351 !== "number") {
          if (v351 instanceof Array) {
            v333 = v351;
            v351 = v333.pop();
          }
          v351 = v331.symbols_[v351] || v351;
        }
        return v351;
      }
      v7(v350, "lex");
      var v352;
      var v353;
      var v354;
      var v355;
      var v356 = {};
      var v357;
      var v358;
      var v359;
      var v360;
      while (true) {
        v353 = v332[v332.length - 1];
        if (this.defaultActions[v353]) {
          v354 = this.defaultActions[v353];
        } else {
          if (v352 === null || typeof v352 == "undefined") {
            v352 = v350();
          }
          v354 = v336[v353] && v336[v353][v352];
        }
        if (typeof v354 === "undefined" || !v354.length || !v354[0]) {
          var v361 = "";
          v360 = [];
          for (v357 in v336[v353]) {
            if (this.terminals_[v357] && v357 > v340) {
              v360.push("'" + this.terminals_[v357] + "'");
            }
          }
          if (v343.showPosition) {
            v361 = "Parse error on line " + (v338 + 1) + ":\n" + v343.showPosition() + "\nExpecting " + v360.join(", ") + ", got '" + (this.terminals_[v352] || v352) + "'";
          } else {
            v361 = "Parse error on line " + (v338 + 1) + ": Unexpected " + (v352 == v341 ? "end of input" : "'" + (this.terminals_[v352] || v352) + "'");
          }
          this.parseError(v361, {
            text: v343.match,
            token: this.terminals_[v352] || v352,
            line: v343.yylineno,
            loc: v346,
            expected: v360
          });
        }
        if (v354[0] instanceof Array && v354.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v353 + ", token: " + v352);
        }
        switch (v354[0]) {
          case 1:
            v332.push(v352);
            v334.push(v343.yytext);
            v335.push(v343.yylloc);
            v332.push(v354[1]);
            v352 = null;
            {
              v339 = v343.yyleng;
              v337 = v343.yytext;
              v338 = v343.yylineno;
              v346 = v343.yylloc;
            }
            break;
          case 2:
            v358 = this.productions_[v354[1]][1];
            v356.$ = v334[v334.length - v358];
            v356._$ = {
              first_line: v335[v335.length - (v358 || 1)].first_line,
              last_line: v335[v335.length - 1].last_line,
              first_column: v335[v335.length - (v358 || 1)].first_column,
              last_column: v335[v335.length - 1].last_column
            };
            if (v347) {
              v356._$.range = [v335[v335.length - (v358 || 1)].range[0], v335[v335.length - 1].range[1]];
            }
            v355 = this.performAction.apply(v356, [v337, v339, v338, v344.yy, v354[1], v334, v335].concat(v342));
            if (typeof v355 !== "undefined") {
              return v355;
            }
            if (v358) {
              v332 = v332.slice(0, v358 * -1 * 2);
              v334 = v334.slice(0, v358 * -1);
              v335 = v335.slice(0, v358 * -1);
            }
            v332.push(this.productions_[v354[1]][0]);
            v334.push(v356.$);
            v335.push(v356._$);
            v359 = v336[v332[v332.length - 2]][v332[v332.length - 1]];
            v332.push(v359);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v362 = function () {
    var v363 = {
      EOF: 1,
      parseError: v7(function v364(v365, v366) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v365, v366);
        } else {
          throw new Error(v365);
        }
      }, "parseError"),
      setInput: v7(function (v367, v368) {
        this.yy = v368 || this.yy || {};
        this._input = v367;
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
      input: v7(function () {
        var v369 = this._input[0];
        this.yytext += v369;
        this.yyleng++;
        this.offset++;
        this.match += v369;
        this.matched += v369;
        var v370 = v369.match(/(?:\r\n?|\n).*/g);
        if (v370) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v369;
      }, "input"),
      unput: v7(function (v371) {
        var v372 = v371.length;
        var v373 = v371.split(/(?:\r\n?|\n)/g);
        this._input = v371 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v372);
        this.offset -= v372;
        var v374 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v373.length - 1) {
          this.yylineno -= v373.length - 1;
        }
        var v375 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v373 ? (v373.length === v374.length ? this.yylloc.first_column : 0) + v374[v374.length - v373.length].length - v373[0].length : this.yylloc.first_column - v372
        };
        if (this.options.ranges) {
          this.yylloc.range = [v375[0], v375[0] + this.yyleng - v372];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v7(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v7(function () {
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
      less: v7(function (v376) {
        this.unput(this.match.slice(v376));
      }, "less"),
      pastInput: v7(function () {
        var v377 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v377.length > 20 ? "..." : "") + v377.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v7(function () {
        var v378 = this.match;
        if (v378.length < 20) {
          v378 += this._input.substr(0, 20 - v378.length);
        }
        return (v378.substr(0, 20) + (v378.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v7(function () {
        var v379 = this.pastInput();
        var v380 = new Array(v379.length + 1).join("-");
        return v379 + this.upcomingInput() + "\n" + v380 + "^";
      }, "showPosition"),
      test_match: v7(function (v381, v382) {
        var v383;
        var v384;
        var v385;
        if (this.options.backtrack_lexer) {
          v385 = {
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
            v385.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v384 = v381[0].match(/(?:\r\n?|\n).*/g);
        if (v384) {
          this.yylineno += v384.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v384 ? v384[v384.length - 1].length - v384[v384.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v381[0].length
        };
        this.yytext += v381[0];
        this.match += v381[0];
        this.matches = v381;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v381[0].length);
        this.matched += v381[0];
        v383 = this.performAction.call(this, this.yy, this, v382, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v383) {
          return v383;
        } else if (this._backtrack) {
          for (var v386 in v385) {
            this[v386] = v385[v386];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v7(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v387;
        var v388;
        var v389;
        var v390;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v391 = this._currentRules();
        for (var v392 = 0; v392 < v391.length; v392++) {
          v389 = this._input.match(this.rules[v391[v392]]);
          if (v389 && (!v388 || v389[0].length > v388[0].length)) {
            v388 = v389;
            v390 = v392;
            if (this.options.backtrack_lexer) {
              v387 = this.test_match(v389, v391[v392]);
              if (v387 !== false) {
                return v387;
              } else if (this._backtrack) {
                v388 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v388) {
          v387 = this.test_match(v388, v391[v390]);
          if (v387 !== false) {
            return v387;
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
      lex: v7(function v393() {
        var v394 = this.next();
        if (v394) {
          return v394;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v7(function v395(v396) {
        this.conditionStack.push(v396);
      }, "begin"),
      popState: v7(function v397() {
        var v398 = this.conditionStack.length - 1;
        if (v398 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v7(function v399() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v7(function v400(v401) {
        v401 = this.conditionStack.length - 1 - Math.abs(v401 || 0);
        if (v401 >= 0) {
          return this.conditionStack[v401];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v7(function v402(v403) {
        this.begin(v403);
      }, "pushState"),
      stateStackSize: v7(function v404() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v7(function v405(v406, v407, v408, v409) {
        switch (v408) {
          case 0:
            this.pushState("csv");
            return 4;
          case 1:
            this.pushState("csv");
            return 4;
          case 2:
            return 10;
          case 3:
            return 5;
          case 4:
            return 12;
          case 5:
            this.pushState("escaped_text");
            return 18;
          case 6:
            return 20;
          case 7:
            this.popState("escaped_text");
            return 18;
          case 8:
            return 19;
        }
      }, "anonymous"),
      rules: [/^(?:sankey-beta\b)/i, /^(?:sankey\b)/i, /^(?:$)/i, /^(?:((\u000D\u000A)|(\u000A)))/i, /^(?:(\u002C))/i, /^(?:(\u0022))/i, /^(?:([\u0020-\u0021\u0023-\u002B\u002D-\u007E])*)/i, /^(?:(\u0022)(?!(\u0022)))/i, /^(?:(([\u0020-\u0021\u0023-\u002B\u002D-\u007E])|(\u002C)|(\u000D)|(\u000A)|(\u0022)(\u0022))*)/i],
      conditions: {
        csv: {
          rules: [2, 3, 4, 5, 6, 7, 8],
          inclusive: false
        },
        escaped_text: {
          rules: [7, 8],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          inclusive: true
        }
      }
    };
    return v363;
  }();
  v311.lexer = v362;
  function v410() {
    this.yy = {};
  }
  v7(v410, "Parser");
  v410.prototype = v311;
  v311.Parser = v410;
  return new v410();
}();
parser.parser = parser;
var sankey_default = parser;
var links = [];
var nodes = [];
var nodesMap = new Map();
var clear2 = v7(() => {
  links = [];
  nodes = [];
  nodesMap = new Map();
  v12();
}, "clear");
var SankeyLink = class {
  constructor(v411, v412, v413 = 0) {
    this.source = v411;
    this.target = v412;
    this.value = v413;
  }
  static {
    v7(this, "SankeyLink");
  }
};
var addLink = v7((v414, v415, v416) => {
  links.push(new SankeyLink(v414, v415, v416));
}, "addLink");
var SankeyNode = class {
  constructor(v417) {
    this.ID = v417;
  }
  static {
    v7(this, "SankeyNode");
  }
};
var findOrCreateNode = v7(v418 => {
  v418 = v13.sanitizeText(v418, v8());
  let v419 = nodesMap.get(v418);
  if (v419 === undefined) {
    v419 = new SankeyNode(v418);
    nodesMap.set(v418, v419);
    nodes.push(v419);
  }
  return v419;
}, "findOrCreateNode");
var getNodes = v7(() => nodes, "getNodes");
var getLinks = v7(() => links, "getLinks");
var getGraph = v7(() => ({
  nodes: nodes.map(v420 => ({
    id: v420.ID
  })),
  links: links.map(v421 => ({
    source: v421.source.ID,
    target: v421.target.ID,
    value: v421.value
  }))
}), "getGraph");
var sankeyDB_default = {
  nodesMap: nodesMap,
  getConfig: v7(() => v8().sankey, "getConfig"),
  getNodes: getNodes,
  getLinks: getLinks,
  getGraph: getGraph,
  addLink: addLink,
  findOrCreateNode: findOrCreateNode,
  getAccTitle: v6,
  setAccTitle: v5,
  getAccDescription: v4,
  setAccDescription: v3,
  getDiagramTitle: v2,
  setDiagramTitle: v1,
  clear: clear2
};
var Uid = class _Uid {
  static {
    v7(this, "Uid");
  }
  static {
    this.count = 0;
  }
  static next(v422) {
    return new _Uid(v422 + ++_Uid.count);
  }
  constructor(v423) {
    this.id = v423;
    this.href = "#" + v423;
  }
  toString() {
    return "url(" + this.href + ")";
  }
};
var alignmentsMap = {
  left: left,
  right: right,
  center: center,
  justify: justify
};
var findCentralNodeLayer = v7(v424 => {
  let v425 = 0;
  let v426 = 0;
  for (const v427 of v424) {
    const v428 = v427.value ?? 0;
    if (v428 > v425) {
      v425 = v428;
      v426 = v427.layer ?? 0;
    }
  }
  return v426;
}, "findCentralNodeLayer");
var draw = v7(function (v429, v430, v431, v432) {
  const {
    securityLevel: v433,
    sankey: v434
  } = v8();
  const v435 = v9.sankey;
  let v436;
  if (v433 === "sandbox") {
    v436 = v10("#i" + v430);
  }
  const v437 = v433 === "sandbox" ? v10(v436.nodes()[0].contentDocument.body) : v10("body");
  const v438 = v433 === "sandbox" ? v437.select("[id=\"" + v430 + "\"]") : v10("[id=\"" + v430 + "\"]");
  const v439 = v434?.width ?? v435.width;
  const v440 = v434?.height ?? v435.width;
  const v441 = v434?.useMaxWidth ?? v435.useMaxWidth;
  const v442 = v434?.nodeAlignment ?? v435.nodeAlignment;
  const v443 = v434?.prefix ?? v435.prefix;
  const v444 = v434?.suffix ?? v435.suffix;
  const v445 = v434?.showValues ?? v435.showValues;
  const v446 = v434?.nodeWidth ?? v435.nodeWidth ?? 10;
  const v447 = v434?.nodePadding ?? v435.nodePadding ?? 12;
  const v448 = v434?.labelStyle ?? v435.labelStyle ?? "legacy";
  const v449 = v434?.nodeColors ?? {};
  const v450 = v432.db.getGraph();
  const v451 = alignmentsMap[v442];
  const v452 = Sankey().nodeId(v453 => v453.id).nodeWidth(v446).nodePadding(v447 + (v445 ? 15 : 0)).nodeAlign(v451).extent([[0, 0], [v439, v440]]);
  v452(v450);
  const v454 = findCentralNodeLayer(v450.nodes);
  const v455 = v14(d3schemeTableau10);
  const v456 = v7(v457 => {
    return v449[v457] ?? v455(v457);
  }, "getNodeColor");
  v438.append("g").attr("class", "nodes").selectAll(".node").data(v450.nodes).join("g").attr("class", "node").attr("id", v458 => (v458.uid = Uid.next("node-")).id).attr("transform", function (v459) {
    return "translate(" + v459.x0 + "," + v459.y0 + ")";
  }).attr("x", v460 => v460.x0).attr("y", v461 => v461.y0).append("rect").attr("height", v462 => {
    return v462.y1 - v462.y0;
  }).attr("width", v463 => v463.x1 - v463.x0).attr("fill", v464 => v456(v464.id));
  const v465 = v7(({
    id: v466,
    value: v467
  }) => {
    if (!v445) {
      return v466;
    }
    return v466 + "\n" + v443 + Math.round(v467 * 100) / 100 + v444;
  }, "getText");
  const v468 = v7(v469 => {
    if (v448 === "outlined") {
      const v470 = v469.layer ?? 0;
      if (v470 < v454) {
        return {
          x: v469.x0 - 6,
          anchor: "end"
        };
      }
      return {
        x: v469.x1 + 6,
        anchor: "start"
      };
    }
    if (v469.x0 < v439 / 2) {
      return {
        x: v469.x1 + 6,
        anchor: "start"
      };
    }
    return {
      x: v469.x0 - 6,
      anchor: "end"
    };
  }, "getLabelPosition");
  const v471 = v438.append("g").attr("class", "node-labels").attr("font-size", 14);
  const v472 = v7(v473 => v471.selectAll(v473 ? "." + v473 : "text").data(v450.nodes).join("text").attr("class", v473 ?? null).attr("x", v474 => v468(v474).x).attr("y", v475 => (v475.y1 + v475.y0) / 2).attr("dy", (v445 ? "0" : "0.35") + "em").attr("text-anchor", v476 => v468(v476).anchor).text(v465), "appendLabel");
  if (v448 === "outlined") {
    v472("sankey-label-bg");
    v472("sankey-label-fg");
  } else {
    v472();
  }
  const v477 = v438.append("g").attr("class", "links").attr("fill", "none").attr("stroke-opacity", 0.5).selectAll(".link").data(v450.links).join("g").attr("class", "link").style("mix-blend-mode", "multiply");
  const v478 = v434?.linkColor ?? "gradient";
  if (v478 === "gradient") {
    const v479 = v477.append("linearGradient").attr("id", v480 => (v480.uid = Uid.next("linearGradient-")).id).attr("gradientUnits", "userSpaceOnUse").attr("x1", v481 => v481.source.x1).attr("x2", v482 => v482.target.x0);
    v479.append("stop").attr("offset", "0%").attr("stop-color", v483 => v456(v483.source.id));
    v479.append("stop").attr("offset", "100%").attr("stop-color", v484 => v456(v484.target.id));
  }
  let v485;
  switch (v478) {
    case "gradient":
      v485 = v7(v486 => v486.uid, "coloring");
      break;
    case "source":
      v485 = v7(v487 => v456(v487.source.id), "coloring");
      break;
    case "target":
      v485 = v7(v488 => v456(v488.target.id), "coloring");
      break;
    default:
      v485 = v478;
  }
  v477.append("path").attr("d", d3SankeyLinkHorizontal()).attr("stroke", v485).attr("stroke-width", v489 => Math.max(1, v489.width));
  v11(undefined, v438, 0, v441);
}, "draw");
var sankeyRenderer_default = {
  draw: draw
};
var prepareTextForParsing = v7(v490 => {
  const v491 = v490.replaceAll(/^[^\S\n\r]+|[^\S\n\r]+$/g, "").replaceAll(/([\n\r])+/g, "\n").trim();
  return v491;
}, "prepareTextForParsing");
var getStyles = v7(v492 => ".label {\n    font-family: " + v492.fontFamily + ";\n  }\n\n  .node-labels {\n    font-family: " + v492.fontFamily + ";\n  }\n\n  /* Outlined label style - background stroke for better readability */\n  .sankey-label-bg {\n    stroke: " + (v492.mainBkg || v492.background || "#fff") + ";\n    stroke-width: 4px;\n    stroke-linejoin: round;\n    paint-order: stroke;\n  }\n\n  /* Foreground label text */\n  .sankey-label-fg {\n    fill: " + v492.textColor + ";\n  }\n\n  /* Node styling */\n  .node rect {\n    shape-rendering: crispEdges;\n  }\n\n  /* Link styling */\n  .link {\n    fill: none;\n    stroke-opacity: 0.5;\n    mix-blend-mode: multiply;\n  }\n", "getStyles");
var styles_default = getStyles;
var originalParse = sankey_default.parse.bind(sankey_default);
sankey_default.parse = v493 => originalParse(prepareTextForParsing(v493));
var diagram = {
  styles: styles_default,
  parser: sankey_default,
  db: sankeyDB_default,
  renderer: sankeyRenderer_default
};
export { diagram };