import { b5 as v1, s as v2, g as v3, o as v4, n as v5, a as v6, b as v7, _ as v8, y as v9, D as v10, d as v11, al as v12, T as v13, U as v14, V as v15, e as v16, p as v17, A as v18, B as v19 } from "./index-CXb3UsfP.js";
const transparentize = (v20, v21) => {
  return v1(v20, "a", -v21);
};
const SMALL$1 = 1e-10;
function intersectionArea(v22, v23) {
  const v24 = getIntersectionPoints(v22);
  const v25 = v24.filter(v26 => containedInCircles(v26, v22));
  let v27 = 0;
  let v28 = 0;
  const v29 = [];
  if (v25.length > 1) {
    const v30 = getCenter(v25);
    for (let v31 = 0; v31 < v25.length; ++v31) {
      const v32 = v25[v31];
      v32.angle = Math.atan2(v32.x - v30.x, v32.y - v30.y);
    }
    v25.sort((v33, v34) => v34.angle - v33.angle);
    let v35 = v25[v25.length - 1];
    for (let v36 = 0; v36 < v25.length; ++v36) {
      const v37 = v25[v36];
      v28 += (v35.x + v37.x) * (v37.y - v35.y);
      const v38 = {
        x: (v37.x + v35.x) / 2,
        y: (v37.y + v35.y) / 2
      };
      let v39 = null;
      for (let v40 = 0; v40 < v37.parentIndex.length; ++v40) {
        if (v35.parentIndex.includes(v37.parentIndex[v40])) {
          const v41 = v22[v37.parentIndex[v40]];
          const v42 = Math.atan2(v37.x - v41.x, v37.y - v41.y);
          const v43 = Math.atan2(v35.x - v41.x, v35.y - v41.y);
          let v44 = v43 - v42;
          if (v44 < 0) {
            v44 += Math.PI * 2;
          }
          const v45 = v43 - v44 / 2;
          let v46 = distance(v38, {
            x: v41.x + v41.radius * Math.sin(v45),
            y: v41.y + v41.radius * Math.cos(v45)
          });
          if (v46 > v41.radius * 2) {
            v46 = v41.radius * 2;
          }
          if (v39 == null || v39.width > v46) {
            v39 = {
              circle: v41,
              width: v46,
              p1: v37,
              p2: v35,
              large: v46 > v41.radius,
              sweep: true
            };
          }
        }
      }
      if (v39 != null) {
        v29.push(v39);
        v27 += circleArea(v39.circle.radius, v39.width);
        v35 = v37;
      }
    }
  } else {
    let v47 = v22[0];
    for (let v48 = 1; v48 < v22.length; ++v48) {
      if (v22[v48].radius < v47.radius) {
        v47 = v22[v48];
      }
    }
    let v49 = false;
    for (let v50 = 0; v50 < v22.length; ++v50) {
      if (distance(v22[v50], v47) > Math.abs(v47.radius - v22[v50].radius)) {
        v49 = true;
        break;
      }
    }
    if (v49) {
      v27 = v28 = 0;
    } else {
      v27 = v47.radius * v47.radius * Math.PI;
      v29.push({
        circle: v47,
        p1: {
          x: v47.x,
          y: v47.y + v47.radius
        },
        p2: {
          x: v47.x - SMALL$1,
          y: v47.y + v47.radius
        },
        width: v47.radius * 2,
        large: true,
        sweep: true
      });
    }
  }
  v28 /= 2;
  if (v23) {
    v23.area = v27 + v28;
    v23.arcArea = v27;
    v23.polygonArea = v28;
    v23.arcs = v29;
    v23.innerPoints = v25;
    v23.intersectionPoints = v24;
  }
  return v27 + v28;
}
function containedInCircles(v51, v52) {
  return v52.every(v53 => distance(v51, v53) < v53.radius + SMALL$1);
}
function getIntersectionPoints(v54) {
  const v55 = [];
  for (let v56 = 0; v56 < v54.length; ++v56) {
    for (let v57 = v56 + 1; v57 < v54.length; ++v57) {
      const v58 = circleCircleIntersection(v54[v56], v54[v57]);
      for (const v59 of v58) {
        v59.parentIndex = [v56, v57];
        v55.push(v59);
      }
    }
  }
  return v55;
}
function circleArea(v60, v61) {
  return v60 * v60 * Math.acos(1 - v61 / v60) - (v60 - v61) * Math.sqrt(v61 * (v60 * 2 - v61));
}
function distance(v62, v63) {
  return Math.sqrt((v62.x - v63.x) * (v62.x - v63.x) + (v62.y - v63.y) * (v62.y - v63.y));
}
function circleOverlap(v64, v65, v66) {
  if (v66 >= v64 + v65) {
    return 0;
  }
  if (v66 <= Math.abs(v64 - v65)) {
    return Math.PI * Math.min(v64, v65) * Math.min(v64, v65);
  }
  const v67 = v64 - (v66 * v66 - v65 * v65 + v64 * v64) / (v66 * 2);
  const v68 = v65 - (v66 * v66 - v64 * v64 + v65 * v65) / (v66 * 2);
  return circleArea(v64, v67) + circleArea(v65, v68);
}
function circleCircleIntersection(v69, v70) {
  const v71 = distance(v69, v70);
  const v72 = v69.radius;
  const v73 = v70.radius;
  if (v71 >= v72 + v73 || v71 <= Math.abs(v72 - v73)) {
    return [];
  }
  const v74 = (v72 * v72 - v73 * v73 + v71 * v71) / (v71 * 2);
  const v75 = Math.sqrt(v72 * v72 - v74 * v74);
  const v76 = v69.x + v74 * (v70.x - v69.x) / v71;
  const v77 = v69.y + v74 * (v70.y - v69.y) / v71;
  const v78 = -(v70.y - v69.y) * (v75 / v71);
  const v79 = -(v70.x - v69.x) * (v75 / v71);
  return [{
    x: v76 + v78,
    y: v77 - v79
  }, {
    x: v76 - v78,
    y: v77 + v79
  }];
}
function getCenter(v80) {
  const v81 = {
    x: 0,
    y: 0
  };
  for (const v82 of v80) {
    v81.x += v82.x;
    v81.y += v82.y;
  }
  v81.x /= v80.length;
  v81.y /= v80.length;
  return v81;
}
function bisect(v83, v84, v85, v86) {
  v86 = v86 || {};
  const v87 = v86.maxIterations || 100;
  const v88 = v86.tolerance || 1e-10;
  const v89 = v83(v84);
  const v90 = v83(v85);
  let v91 = v85 - v84;
  if (v89 * v90 > 0) {
    throw "Initial bisect points must have opposite signs";
  }
  if (v89 === 0) {
    return v84;
  }
  if (v90 === 0) {
    return v85;
  }
  for (let v92 = 0; v92 < v87; ++v92) {
    v91 /= 2;
    const v93 = v84 + v91;
    const v94 = v83(v93);
    if (v94 * v89 >= 0) {
      v84 = v93;
    }
    if (Math.abs(v91) < v88 || v94 === 0) {
      return v93;
    }
  }
  return v84 + v91;
}
function zeros(v95) {
  const v96 = new Array(v95);
  for (let v97 = 0; v97 < v95; ++v97) {
    v96[v97] = 0;
  }
  return v96;
}
function zerosM(v98, v99) {
  return zeros(v98).map(() => zeros(v99));
}
function dot(v100, v101) {
  let v102 = 0;
  for (let v103 = 0; v103 < v100.length; ++v103) {
    v102 += v100[v103] * v101[v103];
  }
  return v102;
}
function norm2(v104) {
  return Math.sqrt(dot(v104, v104));
}
function scale(v105, v106, v107) {
  for (let v108 = 0; v108 < v106.length; ++v108) {
    v105[v108] = v106[v108] * v107;
  }
}
function weightedSum(v109, v110, v111, v112, v113) {
  for (let v114 = 0; v114 < v109.length; ++v114) {
    v109[v114] = v110 * v111[v114] + v112 * v113[v114];
  }
}
function nelderMead(v115, v116, v117) {
  v117 = v117 || {};
  const v118 = v117.maxIterations || v116.length * 200;
  const v119 = v117.nonZeroDelta || 1.05;
  const v120 = v117.zeroDelta || 0.001;
  const v121 = v117.minErrorDelta || 0.000001;
  const v122 = v117.minErrorDelta || 0.00001;
  const v123 = v117.rho !== undefined ? v117.rho : 1;
  const v124 = v117.chi !== undefined ? v117.chi : 2;
  const v125 = v117.psi !== undefined ? v117.psi : -0.5;
  const v126 = v117.sigma !== undefined ? v117.sigma : 0.5;
  let v127;
  const v128 = v116.length;
  const v129 = new Array(v128 + 1);
  v129[0] = v116;
  v129[0].fx = v115(v116);
  v129[0].id = 0;
  for (let v130 = 0; v130 < v128; ++v130) {
    const v131 = v116.slice();
    v131[v130] = v131[v130] ? v131[v130] * v119 : v120;
    v129[v130 + 1] = v131;
    v129[v130 + 1].fx = v115(v131);
    v129[v130 + 1].id = v130 + 1;
  }
  function v132(v133) {
    for (let v134 = 0; v134 < v133.length; v134++) {
      v129[v128][v134] = v133[v134];
    }
    v129[v128].fx = v133.fx;
  }
  const v135 = (v136, v137) => v136.fx - v137.fx;
  const v138 = v116.slice();
  const v139 = v116.slice();
  const v140 = v116.slice();
  const v141 = v116.slice();
  for (let v142 = 0; v142 < v118; ++v142) {
    v129.sort(v135);
    if (v117.history) {
      const v143 = v129.map(v144 => {
        const v145 = v144.slice();
        v145.fx = v144.fx;
        v145.id = v144.id;
        return v145;
      });
      v143.sort((v146, v147) => v146.id - v147.id);
      v117.history.push({
        x: v129[0].slice(),
        fx: v129[0].fx,
        simplex: v143
      });
    }
    v127 = 0;
    for (let v148 = 0; v148 < v128; ++v148) {
      v127 = Math.max(v127, Math.abs(v129[0][v148] - v129[1][v148]));
    }
    if (Math.abs(v129[0].fx - v129[v128].fx) < v121 && v127 < v122) {
      break;
    }
    for (let v149 = 0; v149 < v128; ++v149) {
      v138[v149] = 0;
      for (let v150 = 0; v150 < v128; ++v150) {
        v138[v149] += v129[v150][v149];
      }
      v138[v149] /= v128;
    }
    const v151 = v129[v128];
    weightedSum(v139, 1 + v123, v138, -v123, v151);
    v139.fx = v115(v139);
    if (v139.fx < v129[0].fx) {
      weightedSum(v141, 1 + v124, v138, -v124, v151);
      v141.fx = v115(v141);
      if (v141.fx < v139.fx) {
        v132(v141);
      } else {
        v132(v139);
      }
    } else if (v139.fx >= v129[v128 - 1].fx) {
      let v152 = false;
      if (v139.fx > v151.fx) {
        weightedSum(v140, 1 + v125, v138, -v125, v151);
        v140.fx = v115(v140);
        if (v140.fx < v151.fx) {
          v132(v140);
        } else {
          v152 = true;
        }
      } else {
        weightedSum(v140, 1 - v125 * v123, v138, v125 * v123, v151);
        v140.fx = v115(v140);
        if (v140.fx < v139.fx) {
          v132(v140);
        } else {
          v152 = true;
        }
      }
      if (v152) {
        if (v126 >= 1) {
          break;
        }
        for (let v153 = 1; v153 < v129.length; ++v153) {
          weightedSum(v129[v153], 1 - v126, v129[0], v126, v129[v153]);
          v129[v153].fx = v115(v129[v153]);
        }
      }
    } else {
      v132(v139);
    }
  }
  v129.sort(v135);
  return {
    fx: v129[0].fx,
    x: v129[0]
  };
}
function wolfeLineSearch(v154, v155, v156, v157, v158, v159, v160) {
  const v161 = v156.fx;
  const v162 = dot(v156.fxprime, v155);
  let v163 = v161;
  let v164 = v161;
  let v165 = v162;
  let v166 = 0;
  v158 = v158 || 1;
  v159 = v159 || 0.000001;
  v160 = v160 || 0.1;
  function v167(v168, v169, v170) {
    for (let v171 = 0; v171 < 16; ++v171) {
      v158 = (v168 + v169) / 2;
      weightedSum(v157.x, 1, v156.x, v158, v155);
      v163 = v157.fx = v154(v157.x, v157.fxprime);
      v165 = dot(v157.fxprime, v155);
      if (v163 > v161 + v159 * v158 * v162 || v163 >= v170) {
        v169 = v158;
      } else {
        if (Math.abs(v165) <= -v160 * v162) {
          return v158;
        }
        if (v165 * (v169 - v168) >= 0) {
          v169 = v168;
        }
        v168 = v158;
        v170 = v163;
      }
    }
    return 0;
  }
  for (let v172 = 0; v172 < 10; ++v172) {
    weightedSum(v157.x, 1, v156.x, v158, v155);
    v163 = v157.fx = v154(v157.x, v157.fxprime);
    v165 = dot(v157.fxprime, v155);
    if (v163 > v161 + v159 * v158 * v162 || v172 && v163 >= v164) {
      return v167(v166, v158, v164);
    }
    if (Math.abs(v165) <= -v160 * v162) {
      return v158;
    }
    if (v165 >= 0) {
      return v167(v158, v166, v163);
    }
    v164 = v163;
    v166 = v158;
    v158 *= 2;
  }
  return v158;
}
function conjugateGradient(v173, v174, v175) {
  let v176 = {
    x: v174.slice(),
    fx: 0,
    fxprime: v174.slice()
  };
  let v177 = {
    x: v174.slice(),
    fx: 0,
    fxprime: v174.slice()
  };
  const v178 = v174.slice();
  let v179;
  let v180;
  let v181 = 1;
  let v182;
  v175 = v175 || {};
  v182 = v175.maxIterations || v174.length * 20;
  v176.fx = v173(v176.x, v176.fxprime);
  v179 = v176.fxprime.slice();
  scale(v179, v176.fxprime, -1);
  for (let v183 = 0; v183 < v182; ++v183) {
    v181 = wolfeLineSearch(v173, v179, v176, v177, v181);
    if (v175.history) {
      v175.history.push({
        x: v176.x.slice(),
        fx: v176.fx,
        fxprime: v176.fxprime.slice(),
        alpha: v181
      });
    }
    if (!v181) {
      scale(v179, v176.fxprime, -1);
    } else {
      weightedSum(v178, 1, v177.fxprime, -1, v176.fxprime);
      const v184 = dot(v176.fxprime, v176.fxprime);
      const v185 = Math.max(0, dot(v178, v177.fxprime) / v184);
      weightedSum(v179, v185, v179, -1, v177.fxprime);
      v180 = v176;
      v176 = v177;
      v177 = v180;
    }
    if (norm2(v176.fxprime) <= 0.00001) {
      break;
    }
  }
  if (v175.history) {
    v175.history.push({
      x: v176.x.slice(),
      fx: v176.fx,
      fxprime: v176.fxprime.slice(),
      alpha: v181
    });
  }
  return v176;
}
function venn(v186, v187 = {}) {
  v187.maxIterations = v187.maxIterations || 500;
  const v188 = v187.initialLayout || bestInitialLayout;
  const v189 = v187.lossFunction || lossFunction;
  const v190 = addMissingAreas(v186, v187);
  const v191 = v188(v190, v187);
  const v192 = Object.keys(v191);
  const v193 = [];
  for (const v194 of v192) {
    v193.push(v191[v194].x);
    v193.push(v191[v194].y);
  }
  const v195 = nelderMead(v196 => {
    const v197 = {};
    for (let v198 = 0; v198 < v192.length; ++v198) {
      const v199 = v192[v198];
      v197[v199] = {
        x: v196[v198 * 2],
        y: v196[v198 * 2 + 1],
        radius: v191[v199].radius
      };
    }
    return v189(v197, v190);
  }, v193, v187);
  const v200 = v195.x;
  for (let v201 = 0; v201 < v192.length; ++v201) {
    const v202 = v192[v201];
    v191[v202].x = v200[v201 * 2];
    v191[v202].y = v200[v201 * 2 + 1];
  }
  return v191;
}
const SMALL = 1e-10;
function distanceFromIntersectArea(v203, v204, v205) {
  if (Math.min(v203, v204) * Math.min(v203, v204) * Math.PI <= v205 + SMALL) {
    return Math.abs(v203 - v204);
  }
  return bisect(v206 => circleOverlap(v203, v204, v206) - v205, 0, v203 + v204);
}
function addMissingAreas(v207, v208 = {}) {
  const v209 = v208.distinct;
  const v210 = v207.map(v211 => Object.assign({}, v211));
  function v212(v213) {
    return v213.join(";");
  }
  if (v209) {
    const v214 = new Map();
    for (const v215 of v210) {
      for (let v216 = 0; v216 < v215.sets.length; v216++) {
        const v217 = String(v215.sets[v216]);
        v214.set(v217, v215.size + (v214.get(v217) || 0));
        for (let v218 = v216 + 1; v218 < v215.sets.length; v218++) {
          const v219 = String(v215.sets[v218]);
          const v220 = v217 + ";" + v219;
          const v221 = v219 + ";" + v217;
          v214.set(v220, v215.size + (v214.get(v220) || 0));
          v214.set(v221, v215.size + (v214.get(v221) || 0));
        }
      }
    }
    for (const v222 of v210) {
      if (v222.sets.length < 3) {
        v222.size = v214.get(v212(v222.sets));
      }
    }
  }
  const v223 = [];
  const v224 = new Set();
  for (const v225 of v210) {
    if (v225.sets.length === 1) {
      v223.push(v225.sets[0]);
    } else if (v225.sets.length === 2) {
      const v226 = v225.sets[0];
      const v227 = v225.sets[1];
      v224.add(v212(v225.sets));
      v224.add(v212([v227, v226]));
    }
  }
  v223.sort((v228, v229) => v228 === v229 ? 0 : v228 < v229 ? -1 : 1);
  for (let v230 = 0; v230 < v223.length; ++v230) {
    const v231 = v223[v230];
    for (let v232 = v230 + 1; v232 < v223.length; ++v232) {
      const v233 = v223[v232];
      if (!v224.has(v212([v231, v233]))) {
        v210.push({
          sets: [v231, v233],
          size: 0
        });
      }
    }
  }
  return v210;
}
function getDistanceMatrices(v234, v235, v236) {
  const v237 = zerosM(v235.length, v235.length);
  const v238 = zerosM(v235.length, v235.length);
  v234.filter(v239 => v239.sets.length === 2).forEach(v240 => {
    const v241 = v236[v240.sets[0]];
    const v242 = v236[v240.sets[1]];
    const v243 = Math.sqrt(v235[v241].size / Math.PI);
    const v244 = Math.sqrt(v235[v242].size / Math.PI);
    const v245 = distanceFromIntersectArea(v243, v244, v240.size);
    v237[v241][v242] = v237[v242][v241] = v245;
    let v246 = 0;
    if (v240.size + 1e-10 >= Math.min(v235[v241].size, v235[v242].size)) {
      v246 = 1;
    } else if (v240.size <= 1e-10) {
      v246 = -1;
    }
    v238[v241][v242] = v238[v242][v241] = v246;
  });
  return {
    distances: v237,
    constraints: v238
  };
}
function constrainedMDSGradient(v247, v248, v249, v250) {
  for (let v251 = 0; v251 < v248.length; ++v251) {
    v248[v251] = 0;
  }
  let v252 = 0;
  for (let v253 = 0; v253 < v249.length; ++v253) {
    const v254 = v247[v253 * 2];
    const v255 = v247[v253 * 2 + 1];
    for (let v256 = v253 + 1; v256 < v249.length; ++v256) {
      const v257 = v247[v256 * 2];
      const v258 = v247[v256 * 2 + 1];
      const v259 = v249[v253][v256];
      const v260 = v250[v253][v256];
      const v261 = (v257 - v254) * (v257 - v254) + (v258 - v255) * (v258 - v255);
      const v262 = Math.sqrt(v261);
      const v263 = v261 - v259 * v259;
      if (v260 > 0 && v262 <= v259 || v260 < 0 && v262 >= v259) {
        continue;
      }
      v252 += v263 * 2 * v263;
      v248[v253 * 2] += v263 * 4 * (v254 - v257);
      v248[v253 * 2 + 1] += v263 * 4 * (v255 - v258);
      v248[v256 * 2] += v263 * 4 * (v257 - v254);
      v248[v256 * 2 + 1] += v263 * 4 * (v258 - v255);
    }
  }
  return v252;
}
function bestInitialLayout(v264, v265 = {}) {
  let v266 = greedyLayout(v264, v265);
  const v267 = v265.lossFunction || lossFunction;
  if (v264.length >= 8) {
    const v268 = constrainedMDSLayout(v264, v265);
    const v269 = v267(v268, v264);
    const v270 = v267(v266, v264);
    if (v269 + 1e-8 < v270) {
      v266 = v268;
    }
  }
  return v266;
}
function constrainedMDSLayout(v271, v272 = {}) {
  const v273 = v272.restarts || 10;
  const v274 = [];
  const v275 = {};
  for (const v276 of v271) {
    if (v276.sets.length === 1) {
      v275[v276.sets[0]] = v274.length;
      v274.push(v276);
    }
  }
  let {
    distances: v277,
    constraints: v278
  } = getDistanceMatrices(v271, v274, v275);
  const v279 = norm2(v277.map(norm2)) / v277.length;
  v277 = v277.map(v280 => v280.map(v281 => v281 / v279));
  const v282 = (v283, v284) => constrainedMDSGradient(v283, v284, v277, v278);
  let v285 = null;
  for (let v286 = 0; v286 < v273; ++v286) {
    const v287 = zeros(v277.length * 2).map(Math.random);
    const v288 = conjugateGradient(v282, v287, v272);
    if (!v285 || v288.fx < v285.fx) {
      v285 = v288;
    }
  }
  const v289 = v285.x;
  const v290 = {};
  for (let v291 = 0; v291 < v274.length; ++v291) {
    const v292 = v274[v291];
    v290[v292.sets[0]] = {
      x: v289[v291 * 2] * v279,
      y: v289[v291 * 2 + 1] * v279,
      radius: Math.sqrt(v292.size / Math.PI)
    };
  }
  if (v272.history) {
    for (const v293 of v272.history) {
      scale(v293.x, v279);
    }
  }
  return v290;
}
function greedyLayout(v294, v295) {
  const v296 = v295 && v295.lossFunction ? v295.lossFunction : lossFunction;
  const v297 = {};
  const v298 = {};
  for (const v299 of v294) {
    if (v299.sets.length === 1) {
      const v300 = v299.sets[0];
      v297[v300] = {
        x: 10000000000,
        y: 10000000000,
        rowid: v297.length,
        size: v299.size,
        radius: Math.sqrt(v299.size / Math.PI)
      };
      v298[v300] = [];
    }
  }
  v294 = v294.filter(v301 => v301.sets.length === 2);
  for (const v302 of v294) {
    let v303 = v302.weight ?? 1;
    const v304 = v302.sets[0];
    const v305 = v302.sets[1];
    if (v302.size + SMALL >= Math.min(v297[v304].size, v297[v305].size)) {
      v303 = 0;
    }
    v298[v304].push({
      set: v305,
      size: v302.size,
      weight: v303
    });
    v298[v305].push({
      set: v304,
      size: v302.size,
      weight: v303
    });
  }
  const v306 = [];
  Object.keys(v298).forEach(v307 => {
    let v308 = 0;
    for (let v309 = 0; v309 < v298[v307].length; ++v309) {
      v308 += v298[v307][v309].size * v298[v307][v309].weight;
    }
    v306.push({
      set: v307,
      size: v308
    });
  });
  function v310(v311, v312) {
    return v312.size - v311.size;
  }
  v306.sort(v310);
  const v313 = {};
  function v314(v315) {
    return v315.set in v313;
  }
  function v316(v317, v318) {
    v297[v318].x = v317.x;
    v297[v318].y = v317.y;
    v313[v318] = true;
  }
  v316({
    x: 0,
    y: 0
  }, v306[0].set);
  for (let v319 = 1; v319 < v306.length; ++v319) {
    const v320 = v306[v319].set;
    const v321 = v298[v320].filter(v314);
    const v322 = v297[v320];
    v321.sort(v310);
    if (v321.length === 0) {
      throw "ERROR: missing pairwise overlap information";
    }
    const v323 = [];
    for (var v324 = 0; v324 < v321.length; ++v324) {
      const v325 = v297[v321[v324].set];
      const v326 = distanceFromIntersectArea(v322.radius, v325.radius, v321[v324].size);
      v323.push({
        x: v325.x + v326,
        y: v325.y
      });
      v323.push({
        x: v325.x - v326,
        y: v325.y
      });
      v323.push({
        y: v325.y + v326,
        x: v325.x
      });
      v323.push({
        y: v325.y - v326,
        x: v325.x
      });
      for (let v327 = v324 + 1; v327 < v321.length; ++v327) {
        const v328 = v297[v321[v327].set];
        const v329 = distanceFromIntersectArea(v322.radius, v328.radius, v321[v327].size);
        const v330 = circleCircleIntersection({
          x: v325.x,
          y: v325.y,
          radius: v326
        }, {
          x: v328.x,
          y: v328.y,
          radius: v329
        });
        v323.push(...v330);
      }
    }
    let v331 = 1e+50;
    let v332 = v323[0];
    for (const v333 of v323) {
      v297[v320].x = v333.x;
      v297[v320].y = v333.y;
      const v334 = v296(v297, v294);
      if (v334 < v331) {
        v331 = v334;
        v332 = v333;
      }
    }
    v316(v332, v320);
  }
  return v297;
}
function lossFunction(v335, v336) {
  let v337 = 0;
  for (const v338 of v336) {
    if (v338.sets.length === 1) {
      continue;
    }
    let v339;
    if (v338.sets.length === 2) {
      const v340 = v335[v338.sets[0]];
      const v341 = v335[v338.sets[1]];
      v339 = circleOverlap(v340.radius, v341.radius, distance(v340, v341));
    } else {
      v339 = intersectionArea(v338.sets.map(v342 => v335[v342]));
    }
    const v343 = v338.weight ?? 1;
    v337 += v343 * (v339 - v338.size) * (v339 - v338.size);
  }
  return v337;
}
function logRatioLossFunction(v344, v345) {
  let v346 = 0;
  for (const v347 of v345) {
    if (v347.sets.length === 1) {
      continue;
    }
    let v348;
    if (v347.sets.length === 2) {
      const v349 = v344[v347.sets[0]];
      const v350 = v344[v347.sets[1]];
      v348 = circleOverlap(v349.radius, v350.radius, distance(v349, v350));
    } else {
      v348 = intersectionArea(v347.sets.map(v351 => v344[v351]));
    }
    const v352 = v347.weight ?? 1;
    const v353 = Math.log((v348 + 1) / (v347.size + 1));
    v346 += v352 * v353 * v353;
  }
  return v346;
}
function orientateCircles(v354, v355, v356) {
  if (v356 == null) {
    v354.sort((v357, v358) => v358.radius - v357.radius);
  } else {
    v354.sort(v356);
  }
  if (v354.length > 0) {
    const v359 = v354[0].x;
    const v360 = v354[0].y;
    for (const v361 of v354) {
      v361.x -= v359;
      v361.y -= v360;
    }
  }
  if (v354.length === 2) {
    const v362 = distance(v354[0], v354[1]);
    if (v362 < Math.abs(v354[1].radius - v354[0].radius)) {
      v354[1].x = v354[0].x + v354[0].radius - v354[1].radius - 1e-10;
      v354[1].y = v354[0].y;
    }
  }
  if (v354.length > 1) {
    const v363 = Math.atan2(v354[1].x, v354[1].y) - v355;
    const v364 = Math.cos(v363);
    const v365 = Math.sin(v363);
    for (const v366 of v354) {
      const v367 = v366.x;
      const v368 = v366.y;
      v366.x = v364 * v367 - v365 * v368;
      v366.y = v365 * v367 + v364 * v368;
    }
  }
  if (v354.length > 2) {
    let v369 = Math.atan2(v354[2].x, v354[2].y) - v355;
    while (v369 < 0) {
      v369 += Math.PI * 2;
    }
    while (v369 > Math.PI * 2) {
      v369 -= Math.PI * 2;
    }
    if (v369 > Math.PI) {
      const v370 = v354[1].y / (1e-10 + v354[1].x);
      for (const v371 of v354) {
        var v372 = (v371.x + v370 * v371.y) / (1 + v370 * v370);
        v371.x = v372 * 2 - v371.x;
        v371.y = v372 * 2 * v370 - v371.y;
      }
    }
  }
}
function disjointCluster(v373) {
  v373.forEach(v374 => {
    v374.parent = v374;
  });
  function v375(v376) {
    if (v376.parent !== v376) {
      v376.parent = v375(v376.parent);
    }
    return v376.parent;
  }
  function v377(v378, v379) {
    const v380 = v375(v378);
    const v381 = v375(v379);
    v380.parent = v381;
  }
  for (let v382 = 0; v382 < v373.length; ++v382) {
    for (let v383 = v382 + 1; v383 < v373.length; ++v383) {
      const v384 = v373[v382].radius + v373[v383].radius;
      if (distance(v373[v382], v373[v383]) + 1e-10 < v384) {
        v377(v373[v383], v373[v382]);
      }
    }
  }
  const v385 = new Map();
  for (let v386 = 0; v386 < v373.length; ++v386) {
    const v387 = v375(v373[v386]).parent.setid;
    if (!v385.has(v387)) {
      v385.set(v387, []);
    }
    v385.get(v387).push(v373[v386]);
  }
  v373.forEach(v388 => {
    delete v388.parent;
  });
  return Array.from(v385.values());
}
function getBoundingBox(v389) {
  const v390 = v391 => {
    const v392 = v389.reduce((v393, v394) => Math.max(v393, v394[v391] + v394.radius), Number.NEGATIVE_INFINITY);
    const v395 = v389.reduce((v396, v397) => Math.min(v396, v397[v391] - v397.radius), Number.POSITIVE_INFINITY);
    return {
      max: v392,
      min: v395
    };
  };
  return {
    xRange: v390("x"),
    yRange: v390("y")
  };
}
function normalizeSolution(v398, v399, v400) {
  if (v399 == null) {
    v399 = Math.PI / 2;
  }
  let v401 = fromObjectNotation(v398).map(v402 => Object.assign({}, v402));
  const v403 = disjointCluster(v401);
  for (const v404 of v403) {
    orientateCircles(v404, v399, v400);
    const v405 = getBoundingBox(v404);
    v404.size = (v405.xRange.max - v405.xRange.min) * (v405.yRange.max - v405.yRange.min);
    v404.bounds = v405;
  }
  v403.sort((v406, v407) => v407.size - v406.size);
  v401 = v403[0];
  let v408 = v401.bounds;
  const v409 = (v408.xRange.max - v408.xRange.min) / 50;
  function v410(v411, v412, v413) {
    if (!v411) {
      return;
    }
    const v414 = v411.bounds;
    let v415;
    let v416;
    if (v412) {
      v415 = v408.xRange.max - v414.xRange.min + v409;
    } else {
      v415 = v408.xRange.max - v414.xRange.max;
      const v417 = (v414.xRange.max - v414.xRange.min) / 2 - (v408.xRange.max - v408.xRange.min) / 2;
      if (v417 < 0) {
        v415 += v417;
      }
    }
    if (v413) {
      v416 = v408.yRange.max - v414.yRange.min + v409;
    } else {
      v416 = v408.yRange.max - v414.yRange.max;
      const v418 = (v414.yRange.max - v414.yRange.min) / 2 - (v408.yRange.max - v408.yRange.min) / 2;
      if (v418 < 0) {
        v416 += v418;
      }
    }
    for (const v419 of v411) {
      v419.x += v415;
      v419.y += v416;
      v401.push(v419);
    }
  }
  let v420 = 1;
  while (v420 < v403.length) {
    v410(v403[v420], true, false);
    v410(v403[v420 + 1], false, true);
    v410(v403[v420 + 2], true, true);
    v420 += 3;
    v408 = getBoundingBox(v401);
  }
  return toObjectNotation(v401);
}
function scaleSolution(v421, v422, v423, v424, v425) {
  const v426 = fromObjectNotation(v421);
  v422 -= v424 * 2;
  v423 -= v424 * 2;
  const {
    xRange: v427,
    yRange: v428
  } = getBoundingBox(v426);
  if (v427.max === v427.min || v428.max === v428.min) {
    console.log("not scaling solution: zero size detected");
    return v421;
  }
  let v429;
  let v430;
  if (v425) {
    const v431 = Math.sqrt(v425 / Math.PI) * 2;
    v429 = v422 / v431;
    v430 = v423 / v431;
  } else {
    v429 = v422 / (v427.max - v427.min);
    v430 = v423 / (v428.max - v428.min);
  }
  const v432 = Math.min(v430, v429);
  const v433 = (v422 - (v427.max - v427.min) * v432) / 2;
  const v434 = (v423 - (v428.max - v428.min) * v432) / 2;
  return toObjectNotation(v426.map(v435 => ({
    radius: v432 * v435.radius,
    x: v424 + v433 + (v435.x - v427.min) * v432,
    y: v424 + v434 + (v435.y - v428.min) * v432,
    setid: v435.setid
  })));
}
function toObjectNotation(v436) {
  const v437 = {};
  for (const v438 of v436) {
    v437[v438.setid] = v438;
  }
  return v437;
}
function fromObjectNotation(v439) {
  const v440 = Object.keys(v439);
  return v440.map(v441 => Object.assign(v439[v441], {
    setid: v441
  }));
}
function VennDiagram(v442 = {}) {
  let v443 = false;
  let v444 = 600;
  let v445 = 350;
  let v446 = 15;
  let v447 = 1000;
  let v448 = Math.PI / 2;
  let v449 = true;
  let v450 = null;
  let v451 = true;
  let v452 = true;
  let v453 = null;
  let v454 = null;
  let v455 = false;
  let v456 = null;
  let v457 = v442 && v442.symmetricalTextCentre ? v442.symmetricalTextCentre : false;
  let v458 = {};
  let v459 = v442 && v442.colourScheme ? v442.colourScheme : v442 && v442.colorScheme ? v442.colorScheme : ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
  let v460 = 0;
  let v461 = function (v462) {
    if (v462 in v458) {
      return v458[v462];
    }
    var v463 = v458[v462] = v459[v460];
    v460 += 1;
    if (v460 >= v459.length) {
      v460 = 0;
    }
    return v463;
  };
  let v464 = venn;
  let v465 = lossFunction;
  function v466(v467) {
    let v468 = v467.datum();
    const v469 = new Set();
    v468.forEach(v470 => {
      if (v470.size == 0 && v470.sets.length == 1) {
        v469.add(v470.sets[0]);
      }
    });
    v468 = v468.filter(v471 => !v471.sets.some(v472 => v469.has(v472)));
    let v473 = {};
    let v474 = {};
    if (v468.length > 0) {
      let v475 = v464(v468, {
        lossFunction: v465,
        distinct: v455
      });
      if (v449) {
        v475 = normalizeSolution(v475, v448, v454);
      }
      v473 = scaleSolution(v475, v444, v445, v446, v450);
      v474 = computeTextCentres(v473, v468, v457);
    }
    const v476 = {};
    v468.forEach(v477 => {
      if (v477.label) {
        v476[v477.sets] = v477.label;
      }
    });
    function v478(v479) {
      if (v479.sets in v476) {
        return v476[v479.sets];
      }
      if (v479.sets.length == 1) {
        return "" + v479.sets[0];
      }
    }
    v467.selectAll("svg").data([v473]).enter().append("svg");
    const v480 = v467.select("svg");
    if (v443) {
      v480.attr("viewBox", "0 0 " + v444 + " " + v445);
    } else {
      v480.attr("width", v444).attr("height", v445);
    }
    const v481 = {};
    let v482 = false;
    v480.selectAll(".venn-area path").each(function (v483) {
      const v484 = this.getAttribute("d");
      if (v483.sets.length == 1 && v484 && !v455) {
        v482 = true;
        v481[v483.sets[0]] = circleFromPath(v484);
      }
    });
    function v485(v486) {
      return v487 => {
        const v488 = v486.sets.map(v489 => {
          let v490 = v481[v489];
          let v491 = v473[v489];
          if (!v490) {
            v490 = {
              x: v444 / 2,
              y: v445 / 2,
              radius: 1
            };
          }
          if (!v491) {
            v491 = {
              x: v444 / 2,
              y: v445 / 2,
              radius: 1
            };
          }
          return {
            x: v490.x * (1 - v487) + v491.x * v487,
            y: v490.y * (1 - v487) + v491.y * v487,
            radius: v490.radius * (1 - v487) + v491.radius * v487
          };
        });
        return intersectionAreaPath(v488, v456);
      };
    }
    const v492 = v480.selectAll(".venn-area").data(v468, v493 => v493.sets);
    const v494 = v492.enter().append("g").attr("class", v495 => "venn-area venn-" + (v495.sets.length == 1 ? "circle" : "intersection") + (v495.colour || v495.color ? " venn-coloured" : "")).attr("data-venn-sets", v496 => v496.sets.join("_"));
    const v497 = v494.append("path");
    const v498 = v494.append("text").attr("class", "label").text(v499 => v478(v499)).attr("text-anchor", "middle").attr("dy", ".35em").attr("x", v444 / 2).attr("y", v445 / 2);
    if (v452) {
      v497.style("fill-opacity", "0").filter(v500 => v500.sets.length == 1).style("fill", v501 => v501.colour ? v501.colour : v501.color ? v501.color : v461(v501.sets)).style("fill-opacity", ".25");
      v498.style("fill", v502 => {
        if (v502.colour || v502.color) {
          return "#FFF";
        }
        if (v442.textFill) {
          return v442.textFill;
        }
        if (v502.sets.length == 1) {
          return v461(v502.sets);
        } else {
          return "#444";
        }
      });
    }
    function v503(v504) {
      if (typeof v504.transition === "function") {
        return v504.transition("venn").duration(v447);
      }
      return v504;
    }
    let v505 = v467;
    if (v482 && typeof v505.transition === "function") {
      v505 = v503(v467);
      v505.selectAll("path").attrTween("d", v485);
    } else {
      v505.selectAll("path").attr("d", v506 => intersectionAreaPath(v506.sets.map(v507 => v473[v507])), v456);
    }
    const v508 = v505.selectAll("text").filter(v509 => v509.sets in v474).text(v510 => v478(v510)).attr("x", v511 => Math.floor(v474[v511.sets].x)).attr("y", v512 => Math.floor(v474[v512.sets].y));
    if (v451) {
      if (v482) {
        if ("on" in v508) {
          v508.on("end", wrapText(v473, v478));
        } else {
          v508.each("end", wrapText(v473, v478));
        }
      } else {
        v508.each(wrapText(v473, v478));
      }
    }
    const v513 = v503(v492.exit()).remove();
    if (typeof v492.transition === "function") {
      v513.selectAll("path").attrTween("d", v485);
    }
    const v514 = v513.selectAll("text").attr("x", v444 / 2).attr("y", v445 / 2);
    if (v453 !== null) {
      v498.style("font-size", "0px");
      v508.style("font-size", v453);
      v514.style("font-size", "0px");
    }
    return {
      circles: v473,
      textCentres: v474,
      nodes: v492,
      enter: v494,
      update: v505,
      exit: v513
    };
  }
  v466.wrap = function (v515) {
    if (!arguments.length) {
      return v451;
    }
    v451 = v515;
    return v466;
  };
  v466.useViewBox = function () {
    v443 = true;
    return v466;
  };
  v466.width = function (v516) {
    if (!arguments.length) {
      return v444;
    }
    v444 = v516;
    return v466;
  };
  v466.height = function (v517) {
    if (!arguments.length) {
      return v445;
    }
    v445 = v517;
    return v466;
  };
  v466.padding = function (v518) {
    if (!arguments.length) {
      return v446;
    }
    v446 = v518;
    return v466;
  };
  v466.distinct = function (v519) {
    if (!arguments.length) {
      return v455;
    }
    v455 = v519;
    return v466;
  };
  v466.colours = function (v520) {
    if (!arguments.length) {
      return v461;
    }
    v461 = v520;
    return v466;
  };
  v466.colors = function (v521) {
    if (!arguments.length) {
      return v461;
    }
    v461 = v521;
    return v466;
  };
  v466.fontSize = function (v522) {
    if (!arguments.length) {
      return v453;
    }
    v453 = v522;
    return v466;
  };
  v466.round = function (v523) {
    if (!arguments.length) {
      return v456;
    }
    v456 = v523;
    return v466;
  };
  v466.duration = function (v524) {
    if (!arguments.length) {
      return v447;
    }
    v447 = v524;
    return v466;
  };
  v466.layoutFunction = function (v525) {
    if (!arguments.length) {
      return v464;
    }
    v464 = v525;
    return v466;
  };
  v466.normalize = function (v526) {
    if (!arguments.length) {
      return v449;
    }
    v449 = v526;
    return v466;
  };
  v466.scaleToFit = function (v527) {
    if (!arguments.length) {
      return v450;
    }
    v450 = v527;
    return v466;
  };
  v466.styled = function (v528) {
    if (!arguments.length) {
      return v452;
    }
    v452 = v528;
    return v466;
  };
  v466.orientation = function (v529) {
    if (!arguments.length) {
      return v448;
    }
    v448 = v529;
    return v466;
  };
  v466.orientationOrder = function (v530) {
    if (!arguments.length) {
      return v454;
    }
    v454 = v530;
    return v466;
  };
  v466.lossFunction = function (v531) {
    if (!arguments.length) {
      return v465;
    }
    v465 = v531 === "default" ? lossFunction : v531 === "logRatio" ? logRatioLossFunction : v531;
    return v466;
  };
  return v466;
}
function wrapText(v532, v533) {
  return function (v534) {
    const v535 = this;
    const v536 = v532[v534.sets[0]].radius || 50;
    const v537 = v533(v534) || "";
    const v538 = v537.split(/\s+/).reverse();
    const v539 = 3;
    const v540 = (v537.length + v538.length) / v539;
    let v541 = v538.pop();
    let v542 = [v541];
    let v543 = 0;
    const v544 = 1.1;
    v535.textContent = null;
    const v545 = [];
    function v546(v547) {
      const v548 = v535.ownerDocument.createElementNS(v535.namespaceURI, "tspan");
      v548.textContent = v547;
      v545.push(v548);
      v535.append(v548);
      return v548;
    }
    let v549 = v546(v541);
    while (true) {
      v541 = v538.pop();
      if (!v541) {
        break;
      }
      v542.push(v541);
      const v550 = v542.join(" ");
      v549.textContent = v550;
      if (v550.length > v540 && v549.getComputedTextLength() > v536) {
        v542.pop();
        v549.textContent = v542.join(" ");
        v542 = [v541];
        v549 = v546(v541);
        v543++;
      }
    }
    const v551 = 0.35 - v543 * v544 / 2;
    const v552 = v535.getAttribute("x");
    const v553 = v535.getAttribute("y");
    v545.forEach((v554, v555) => {
      v554.setAttribute("x", v552);
      v554.setAttribute("y", v553);
      v554.setAttribute("dy", v551 + v555 * v544 + "em");
    });
  };
}
function circleMargin(v556, v557, v558) {
  let v559 = v557[0].radius - distance(v557[0], v556);
  for (let v560 = 1; v560 < v557.length; ++v560) {
    const v561 = v557[v560].radius - distance(v557[v560], v556);
    if (v561 <= v559) {
      v559 = v561;
    }
  }
  for (let v562 = 0; v562 < v558.length; ++v562) {
    const v563 = distance(v558[v562], v556) - v558[v562].radius;
    if (v563 <= v559) {
      v559 = v563;
    }
  }
  return v559;
}
function computeTextCentre(v564, v565, v566) {
  const v567 = [];
  for (const v568 of v564) {
    v567.push({
      x: v568.x,
      y: v568.y
    });
    v567.push({
      x: v568.x + v568.radius / 2,
      y: v568.y
    });
    v567.push({
      x: v568.x - v568.radius / 2,
      y: v568.y
    });
    v567.push({
      x: v568.x,
      y: v568.y + v568.radius / 2
    });
    v567.push({
      x: v568.x,
      y: v568.y - v568.radius / 2
    });
  }
  let v569 = v567[0];
  let v570 = circleMargin(v567[0], v564, v565);
  for (let v571 = 1; v571 < v567.length; ++v571) {
    const v572 = circleMargin(v567[v571], v564, v565);
    if (v572 >= v570) {
      v569 = v567[v571];
      v570 = v572;
    }
  }
  const v573 = nelderMead(v574 => circleMargin({
    x: v574[0],
    y: v574[1]
  }, v564, v565) * -1, [v569.x, v569.y], {
    maxIterations: 500,
    minErrorDelta: 1e-10
  }).x;
  const v575 = {
    x: v566 ? 0 : v573[0],
    y: v573[1]
  };
  let v576 = true;
  for (const v577 of v564) {
    if (distance(v575, v577) > v577.radius) {
      v576 = false;
      break;
    }
  }
  for (const v578 of v565) {
    if (distance(v575, v578) < v578.radius) {
      v576 = false;
      break;
    }
  }
  if (v576) {
    return v575;
  }
  if (v564.length == 1) {
    return {
      x: v564[0].x,
      y: v564[0].y
    };
  }
  const v579 = {};
  intersectionArea(v564, v579);
  if (v579.arcs.length === 0) {
    return {
      x: 0,
      y: -1000,
      disjoint: true
    };
  }
  if (v579.arcs.length == 1) {
    return {
      x: v579.arcs[0].circle.x,
      y: v579.arcs[0].circle.y
    };
  }
  if (v565.length) {
    return computeTextCentre(v564, []);
  }
  return getCenter(v579.arcs.map(v580 => v580.p1));
}
function getOverlappingCircles(v581) {
  const v582 = {};
  const v583 = Object.keys(v581);
  for (const v584 of v583) {
    v582[v584] = [];
  }
  for (let v585 = 0; v585 < v583.length; v585++) {
    const v586 = v583[v585];
    const v587 = v581[v586];
    for (let v588 = v585 + 1; v588 < v583.length; ++v588) {
      const v589 = v583[v588];
      const v590 = v581[v589];
      const v591 = distance(v587, v590);
      if (v591 + v590.radius <= v587.radius + 1e-10) {
        v582[v589].push(v586);
      } else if (v591 + v587.radius <= v590.radius + 1e-10) {
        v582[v586].push(v589);
      }
    }
  }
  return v582;
}
function computeTextCentres(v592, v593, v594) {
  const v595 = {};
  const v596 = getOverlappingCircles(v592);
  for (let v597 = 0; v597 < v593.length; ++v597) {
    const v598 = v593[v597].sets;
    const v599 = {};
    const v600 = {};
    for (let v601 = 0; v601 < v598.length; ++v601) {
      v599[v598[v601]] = true;
      const v602 = v596[v598[v601]];
      for (let v603 = 0; v603 < v602.length; ++v603) {
        v600[v602[v603]] = true;
      }
    }
    const v604 = [];
    const v605 = [];
    for (let v606 in v592) {
      if (v606 in v599) {
        v604.push(v592[v606]);
      } else if (!(v606 in v600)) {
        v605.push(v592[v606]);
      }
    }
    const v607 = computeTextCentre(v604, v605, v594);
    v595[v598] = v607;
    if (v607.disjoint && v593[v597].size > 0) {
      console.log("WARNING: area " + v598 + " not represented on screen");
    }
  }
  return v595;
}
function circlePath(v608, v609, v610) {
  const v611 = [];
  v611.push("\nM", v608, v609);
  v611.push("\nm", -v610, 0);
  v611.push("\na", v610, v610, 0, 1, 0, v610 * 2, 0);
  v611.push("\na", v610, v610, 0, 1, 0, -v610 * 2, 0);
  return v611.join(" ");
}
function circleFromPath(v612) {
  const v613 = v612.split(" ");
  return {
    x: Number.parseFloat(v613[1]),
    y: Number.parseFloat(v613[2]),
    radius: -Number.parseFloat(v613[4])
  };
}
function intersectionAreaArcs(v614) {
  if (v614.length === 0) {
    return [];
  }
  const v615 = {};
  intersectionArea(v614, v615);
  return v615.arcs;
}
function arcsToPath(v616, v617) {
  if (v616.length === 0) {
    return "M 0 0";
  }
  const v618 = Math.pow(10, v617 || 0);
  const v619 = v617 != null ? v620 => Math.round(v620 * v618) / v618 : v621 => v621;
  if (v616.length == 1) {
    const v622 = v616[0].circle;
    return circlePath(v619(v622.x), v619(v622.y), v619(v622.radius));
  }
  const v623 = ["\nM", v619(v616[0].p2.x), v619(v616[0].p2.y)];
  for (const v624 of v616) {
    const v625 = v619(v624.circle.radius);
    v623.push("\nA", v625, v625, 0, v624.large ? 1 : 0, v624.sweep ? 1 : 0, v619(v624.p1.x), v619(v624.p1.y));
  }
  return v623.join(" ");
}
function intersectionAreaPath(v626, v627) {
  return arcsToPath(intersectionAreaArcs(v626), v627);
}
function layout(v628, v629 = {}) {
  const {
    lossFunction: v630,
    layoutFunction: v631 = venn,
    normalize = true,
    orientation = Math.PI / 2,
    orientationOrder: v632,
    width = 600,
    height = 350,
    padding = 15,
    scaleToFit = false,
    symmetricalTextCentre = false,
    distinct: v633,
    round = 2
  } = v629;
  let v634 = v631(v628, {
    lossFunction: v630 === "default" || !v630 ? lossFunction : v630 === "logRatio" ? logRatioLossFunction : v630,
    distinct: v633
  });
  if (normalize) {
    v634 = normalizeSolution(v634, orientation, v632);
  }
  const v635 = scaleSolution(v634, width, height, padding, scaleToFit);
  const v636 = computeTextCentres(v635, v628, symmetricalTextCentre);
  const v637 = new Map(Object.keys(v635).map(v638 => [v638, {
    set: v638,
    x: v635[v638].x,
    y: v635[v638].y,
    radius: v635[v638].radius
  }]));
  const v639 = v628.map(v640 => {
    const v641 = v640.sets.map(v642 => v637.get(v642));
    const v643 = intersectionAreaArcs(v641);
    const v644 = arcsToPath(v643, round);
    return {
      circles: v641,
      arcs: v643,
      path: v644,
      area: v640,
      has: new Set(v640.sets)
    };
  });
  function v645(v646) {
    let v647 = "";
    for (const v648 of v639) {
      if (v648.has.size > v646.length && v646.every(v649 => v648.has.has(v649))) {
        v647 += " " + v648.path;
      }
    }
    return v647;
  }
  return v639.map(({
    circles: v650,
    arcs: v651,
    path: v652,
    area: v653
  }) => {
    return {
      data: v653,
      text: v636[v653.sets],
      circles: v650,
      arcs: v651,
      path: v652,
      distinctPath: v652 + v645(v653.sets)
    };
  });
}
var parser = function () {
  var v654 = v8(function (v655, v656, v657, v658) {
    v657 = v657 || {};
    v658 = v655.length;
    for (; v658--; v657[v655[v658]] = v656);
    return v657;
  }, "o");
  var v659 = [5, 8];
  var v660 = [7, 8, 11, 12, 17, 19, 22, 24];
  var v661 = [1, 17];
  var v662 = [1, 18];
  var v663 = [7, 8, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 24, 27];
  var v664 = [1, 31];
  var v665 = [1, 39];
  var v666 = [7, 8, 11, 12, 17, 19, 22, 24, 27];
  var v667 = [1, 57];
  var v668 = [1, 56];
  var v669 = [1, 58];
  var v670 = [1, 59];
  var v671 = [1, 60];
  var v672 = [7, 8, 11, 12, 16, 17, 19, 20, 22, 24, 27, 31, 32, 33];
  var v673 = {
    trace: v8(function v674() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      optNewlines: 4,
      VENN: 5,
      document: 6,
      EOF: 7,
      NEWLINE: 8,
      line: 9,
      statement: 10,
      TITLE: 11,
      SET: 12,
      identifier: 13,
      BRACKET_LABEL: 14,
      COLON: 15,
      NUMERIC: 16,
      UNION: 17,
      identifierList: 18,
      TEXT: 19,
      IDENTIFIER: 20,
      STRING: 21,
      INDENT_TEXT: 22,
      indentedTextTail: 23,
      STYLE: 24,
      stylesOpt: 25,
      styleField: 26,
      COMMA: 27,
      styleValue: 28,
      valueTokens: 29,
      valueToken: 30,
      HEXCOLOR: 31,
      RGBCOLOR: 32,
      RGBACOLOR: 33,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      5: "VENN",
      7: "EOF",
      8: "NEWLINE",
      11: "TITLE",
      12: "SET",
      14: "BRACKET_LABEL",
      15: "COLON",
      16: "NUMERIC",
      17: "UNION",
      19: "TEXT",
      20: "IDENTIFIER",
      21: "STRING",
      22: "INDENT_TEXT",
      24: "STYLE",
      27: "COMMA",
      31: "HEXCOLOR",
      32: "RGBCOLOR",
      33: "RGBACOLOR"
    },
    productions_: [0, [3, 4], [4, 0], [4, 2], [6, 0], [6, 2], [9, 1], [9, 1], [10, 1], [10, 2], [10, 3], [10, 4], [10, 5], [10, 2], [10, 3], [10, 4], [10, 5], [10, 3], [10, 3], [10, 3], [10, 4], [10, 4], [10, 2], [10, 3], [23, 1], [23, 1], [23, 1], [23, 2], [23, 2], [25, 1], [25, 3], [26, 3], [28, 1], [28, 1], [29, 1], [29, 2], [30, 1], [30, 1], [30, 1], [30, 1], [30, 1], [18, 1], [18, 3], [13, 1], [13, 1]],
    performAction: v8(function v675(v676, v677, v678, v679, v680, v681, v682) {
      var v683 = v681.length - 1;
      switch (v680) {
        case 1:
          return v681[v683 - 1];
        case 2:
        case 3:
        case 4:
          this.$ = [];
          break;
        case 5:
          v681[v683 - 1].push(v681[v683]);
          this.$ = v681[v683 - 1];
          break;
        case 6:
          this.$ = [];
          break;
        case 7:
        case 22:
        case 32:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
          this.$ = v681[v683];
          break;
        case 8:
          v679.setDiagramTitle(v681[v683].substr(6));
          this.$ = v681[v683].substr(6);
          break;
        case 9:
          v679.addSubsetData([v681[v683]], undefined, undefined);
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 10:
          v679.addSubsetData([v681[v683 - 1]], v681[v683], undefined);
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 11:
          v679.addSubsetData([v681[v683 - 2]], undefined, parseFloat(v681[v683]));
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 12:
          v679.addSubsetData([v681[v683 - 3]], v681[v683 - 2], parseFloat(v681[v683]));
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 13:
          if (v681[v683].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (v679.validateUnionIdentifiers) {
            v679.validateUnionIdentifiers(v681[v683]);
          }
          v679.addSubsetData(v681[v683], undefined, undefined);
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 14:
          if (v681[v683 - 1].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (v679.validateUnionIdentifiers) {
            v679.validateUnionIdentifiers(v681[v683 - 1]);
          }
          v679.addSubsetData(v681[v683 - 1], v681[v683], undefined);
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 15:
          if (v681[v683 - 2].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (v679.validateUnionIdentifiers) {
            v679.validateUnionIdentifiers(v681[v683 - 2]);
          }
          v679.addSubsetData(v681[v683 - 2], undefined, parseFloat(v681[v683]));
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 16:
          if (v681[v683 - 3].length < 2) {
            throw new Error("union requires multiple identifiers");
          }
          if (v679.validateUnionIdentifiers) {
            v679.validateUnionIdentifiers(v681[v683 - 3]);
          }
          v679.addSubsetData(v681[v683 - 3], v681[v683 - 2], parseFloat(v681[v683]));
          if (v679.setIndentMode) {
            v679.setIndentMode(true);
          }
          break;
        case 17:
        case 18:
        case 19:
          v679.addTextData(v681[v683 - 1], v681[v683], undefined);
          break;
        case 20:
        case 21:
          v679.addTextData(v681[v683 - 2], v681[v683 - 1], v681[v683]);
          break;
        case 23:
          v679.addStyleData(v681[v683 - 1], v681[v683]);
          break;
        case 24:
        case 25:
        case 26:
          var v684 = v679.getCurrentSets();
          if (!v684) {
            throw new Error("text requires set");
          }
          v679.addTextData(v684, v681[v683], undefined);
          break;
        case 27:
        case 28:
          var v684 = v679.getCurrentSets();
          if (!v684) {
            throw new Error("text requires set");
          }
          v679.addTextData(v684, v681[v683 - 1], v681[v683]);
          break;
        case 29:
        case 41:
          this.$ = [v681[v683]];
          break;
        case 30:
        case 42:
          this.$ = [...v681[v683 - 2], v681[v683]];
          break;
        case 31:
          this.$ = [v681[v683 - 2], v681[v683]];
          break;
        case 33:
          this.$ = v681[v683].join(" ");
          break;
        case 34:
          this.$ = [v681[v683]];
          break;
        case 35:
          v681[v683 - 1].push(v681[v683]);
          this.$ = v681[v683 - 1];
          break;
        case 43:
        case 44:
          this.$ = v681[v683];
          break;
      }
    }, "anonymous"),
    table: [v654(v659, [2, 2], {
      3: 1,
      4: 2
    }), {
      1: [3]
    }, {
      5: [1, 3],
      8: [1, 4]
    }, v654(v660, [2, 4], {
      6: 5
    }), v654(v659, [2, 3]), {
      7: [1, 6],
      8: [1, 8],
      9: 7,
      10: 9,
      11: [1, 10],
      12: [1, 11],
      17: [1, 12],
      19: [1, 13],
      22: [1, 14],
      24: [1, 15]
    }, {
      1: [2, 1]
    }, v654(v660, [2, 5]), v654(v660, [2, 6]), v654(v660, [2, 7]), v654(v660, [2, 8]), {
      13: 16,
      20: v661,
      21: v662
    }, {
      13: 20,
      18: 19,
      20: v661,
      21: v662
    }, {
      13: 20,
      18: 21,
      20: v661,
      21: v662
    }, {
      16: [1, 25],
      20: [1, 23],
      21: [1, 24],
      23: 22
    }, {
      13: 20,
      18: 26,
      20: v661,
      21: v662
    }, v654(v660, [2, 9], {
      14: [1, 27],
      15: [1, 28]
    }), v654(v663, [2, 43]), v654(v663, [2, 44]), v654(v660, [2, 13], {
      14: [1, 29],
      15: [1, 30],
      27: v664
    }), v654(v663, [2, 41]), {
      16: [1, 34],
      20: [1, 32],
      21: [1, 33],
      27: v664
    }, v654(v660, [2, 22]), v654(v660, [2, 24], {
      14: [1, 35]
    }), v654(v660, [2, 25], {
      14: [1, 36]
    }), v654(v660, [2, 26]), {
      20: v665,
      25: 37,
      26: 38,
      27: v664
    }, v654(v660, [2, 10], {
      15: [1, 40]
    }), {
      16: [1, 41]
    }, v654(v660, [2, 14], {
      15: [1, 42]
    }), {
      16: [1, 43]
    }, {
      13: 44,
      20: v661,
      21: v662
    }, v654(v660, [2, 17], {
      14: [1, 45]
    }), v654(v660, [2, 18], {
      14: [1, 46]
    }), v654(v660, [2, 19]), v654(v660, [2, 27]), v654(v660, [2, 28]), v654(v660, [2, 23], {
      27: [1, 47]
    }), v654(v666, [2, 29]), {
      15: [1, 48]
    }, {
      16: [1, 49]
    }, v654(v660, [2, 11]), {
      16: [1, 50]
    }, v654(v660, [2, 15]), v654(v663, [2, 42]), v654(v660, [2, 20]), v654(v660, [2, 21]), {
      20: v665,
      26: 51
    }, {
      16: v667,
      20: v668,
      21: [1, 53],
      28: 52,
      29: 54,
      30: 55,
      31: v669,
      32: v670,
      33: v671
    }, v654(v660, [2, 12]), v654(v660, [2, 16]), v654(v666, [2, 30]), v654(v666, [2, 31]), v654(v666, [2, 32]), v654(v666, [2, 33], {
      30: 61,
      16: v667,
      20: v668,
      31: v669,
      32: v670,
      33: v671
    }), v654(v672, [2, 34]), v654(v672, [2, 36]), v654(v672, [2, 37]), v654(v672, [2, 38]), v654(v672, [2, 39]), v654(v672, [2, 40]), v654(v672, [2, 35])],
    defaultActions: {
      6: [2, 1]
    },
    parseError: v8(function v685(v686, v687) {
      if (v687.recoverable) {
        this.trace(v686);
      } else {
        var v688 = new Error(v686);
        v688.hash = v687;
        throw v688;
      }
    }, "parseError"),
    parse: v8(function v689(v690) {
      var v691 = this;
      var v692 = [0];
      var v693 = [];
      var v694 = [null];
      var v695 = [];
      var v696 = this.table;
      var v697 = "";
      var v698 = 0;
      var v699 = 0;
      var v700 = 2;
      var v701 = 1;
      var v702 = v695.slice.call(arguments, 1);
      var v703 = Object.create(this.lexer);
      var v704 = {
        yy: {}
      };
      for (var v705 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v705)) {
          v704.yy[v705] = this.yy[v705];
        }
      }
      v703.setInput(v690, v704.yy);
      v704.yy.lexer = v703;
      v704.yy.parser = this;
      if (typeof v703.yylloc == "undefined") {
        v703.yylloc = {};
      }
      var v706 = v703.yylloc;
      v695.push(v706);
      var v707 = v703.options && v703.options.ranges;
      if (typeof v704.yy.parseError === "function") {
        this.parseError = v704.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v708(v709) {
        v692.length = v692.length - v709 * 2;
        v694.length = v694.length - v709;
        v695.length = v695.length - v709;
      }
      v8(v708, "popStack");
      function v710() {
        var v711;
        v711 = v693.pop() || v703.lex() || v701;
        if (typeof v711 !== "number") {
          if (v711 instanceof Array) {
            v693 = v711;
            v711 = v693.pop();
          }
          v711 = v691.symbols_[v711] || v711;
        }
        return v711;
      }
      v8(v710, "lex");
      var v712;
      var v713;
      var v714;
      var v715;
      var v716 = {};
      var v717;
      var v718;
      var v719;
      var v720;
      while (true) {
        v713 = v692[v692.length - 1];
        if (this.defaultActions[v713]) {
          v714 = this.defaultActions[v713];
        } else {
          if (v712 === null || typeof v712 == "undefined") {
            v712 = v710();
          }
          v714 = v696[v713] && v696[v713][v712];
        }
        if (typeof v714 === "undefined" || !v714.length || !v714[0]) {
          var v721 = "";
          v720 = [];
          for (v717 in v696[v713]) {
            if (this.terminals_[v717] && v717 > v700) {
              v720.push("'" + this.terminals_[v717] + "'");
            }
          }
          if (v703.showPosition) {
            v721 = "Parse error on line " + (v698 + 1) + ":\n" + v703.showPosition() + "\nExpecting " + v720.join(", ") + ", got '" + (this.terminals_[v712] || v712) + "'";
          } else {
            v721 = "Parse error on line " + (v698 + 1) + ": Unexpected " + (v712 == v701 ? "end of input" : "'" + (this.terminals_[v712] || v712) + "'");
          }
          this.parseError(v721, {
            text: v703.match,
            token: this.terminals_[v712] || v712,
            line: v703.yylineno,
            loc: v706,
            expected: v720
          });
        }
        if (v714[0] instanceof Array && v714.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v713 + ", token: " + v712);
        }
        switch (v714[0]) {
          case 1:
            v692.push(v712);
            v694.push(v703.yytext);
            v695.push(v703.yylloc);
            v692.push(v714[1]);
            v712 = null;
            {
              v699 = v703.yyleng;
              v697 = v703.yytext;
              v698 = v703.yylineno;
              v706 = v703.yylloc;
            }
            break;
          case 2:
            v718 = this.productions_[v714[1]][1];
            v716.$ = v694[v694.length - v718];
            v716._$ = {
              first_line: v695[v695.length - (v718 || 1)].first_line,
              last_line: v695[v695.length - 1].last_line,
              first_column: v695[v695.length - (v718 || 1)].first_column,
              last_column: v695[v695.length - 1].last_column
            };
            if (v707) {
              v716._$.range = [v695[v695.length - (v718 || 1)].range[0], v695[v695.length - 1].range[1]];
            }
            v715 = this.performAction.apply(v716, [v697, v699, v698, v704.yy, v714[1], v694, v695].concat(v702));
            if (typeof v715 !== "undefined") {
              return v715;
            }
            if (v718) {
              v692 = v692.slice(0, v718 * -1 * 2);
              v694 = v694.slice(0, v718 * -1);
              v695 = v695.slice(0, v718 * -1);
            }
            v692.push(this.productions_[v714[1]][0]);
            v694.push(v716.$);
            v695.push(v716._$);
            v719 = v696[v692[v692.length - 2]][v692[v692.length - 1]];
            v692.push(v719);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v722 = function () {
    var v723 = {
      EOF: 1,
      parseError: v8(function v724(v725, v726) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v725, v726);
        } else {
          throw new Error(v725);
        }
      }, "parseError"),
      setInput: v8(function (v727, v728) {
        this.yy = v728 || this.yy || {};
        this._input = v727;
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
      input: v8(function () {
        var v729 = this._input[0];
        this.yytext += v729;
        this.yyleng++;
        this.offset++;
        this.match += v729;
        this.matched += v729;
        var v730 = v729.match(/(?:\r\n?|\n).*/g);
        if (v730) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v729;
      }, "input"),
      unput: v8(function (v731) {
        var v732 = v731.length;
        var v733 = v731.split(/(?:\r\n?|\n)/g);
        this._input = v731 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v732);
        this.offset -= v732;
        var v734 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v733.length - 1) {
          this.yylineno -= v733.length - 1;
        }
        var v735 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v733 ? (v733.length === v734.length ? this.yylloc.first_column : 0) + v734[v734.length - v733.length].length - v733[0].length : this.yylloc.first_column - v732
        };
        if (this.options.ranges) {
          this.yylloc.range = [v735[0], v735[0] + this.yyleng - v732];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v8(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v8(function () {
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
      less: v8(function (v736) {
        this.unput(this.match.slice(v736));
      }, "less"),
      pastInput: v8(function () {
        var v737 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v737.length > 20 ? "..." : "") + v737.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v8(function () {
        var v738 = this.match;
        if (v738.length < 20) {
          v738 += this._input.substr(0, 20 - v738.length);
        }
        return (v738.substr(0, 20) + (v738.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v8(function () {
        var v739 = this.pastInput();
        var v740 = new Array(v739.length + 1).join("-");
        return v739 + this.upcomingInput() + "\n" + v740 + "^";
      }, "showPosition"),
      test_match: v8(function (v741, v742) {
        var v743;
        var v744;
        var v745;
        if (this.options.backtrack_lexer) {
          v745 = {
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
            v745.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v744 = v741[0].match(/(?:\r\n?|\n).*/g);
        if (v744) {
          this.yylineno += v744.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v744 ? v744[v744.length - 1].length - v744[v744.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v741[0].length
        };
        this.yytext += v741[0];
        this.match += v741[0];
        this.matches = v741;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v741[0].length);
        this.matched += v741[0];
        v743 = this.performAction.call(this, this.yy, this, v742, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v743) {
          return v743;
        } else if (this._backtrack) {
          for (var v746 in v745) {
            this[v746] = v745[v746];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v8(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v747;
        var v748;
        var v749;
        var v750;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v751 = this._currentRules();
        for (var v752 = 0; v752 < v751.length; v752++) {
          v749 = this._input.match(this.rules[v751[v752]]);
          if (v749 && (!v748 || v749[0].length > v748[0].length)) {
            v748 = v749;
            v750 = v752;
            if (this.options.backtrack_lexer) {
              v747 = this.test_match(v749, v751[v752]);
              if (v747 !== false) {
                return v747;
              } else if (this._backtrack) {
                v748 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v748) {
          v747 = this.test_match(v748, v751[v750]);
          if (v747 !== false) {
            return v747;
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
      lex: v8(function v753() {
        var v754 = this.next();
        if (v754) {
          return v754;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v8(function v755(v756) {
        this.conditionStack.push(v756);
      }, "begin"),
      popState: v8(function v757() {
        var v758 = this.conditionStack.length - 1;
        if (v758 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v8(function v759() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v8(function v760(v761) {
        v761 = this.conditionStack.length - 1 - Math.abs(v761 || 0);
        if (v761 >= 0) {
          return this.conditionStack[v761];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v8(function v762(v763) {
        this.begin(v763);
      }, "pushState"),
      stateStackSize: v8(function v764() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v8(function v765(v766, v767, v768, v769) {
        switch (v768) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            break;
          case 3:
            if (v766.getIndentMode && v766.getIndentMode()) {
              v766.consumeIndentText = true;
              this.begin("INITIAL");
              return 22;
            }
            break;
          case 4:
            break;
          case 5:
            if (v766.setIndentMode) {
              v766.setIndentMode(false);
            }
            this.begin("INITIAL");
            this.unput(v767.yytext);
            break;
          case 6:
            this.begin("bol");
            return 8;
          case 7:
            break;
          case 8:
            break;
          case 9:
            return 7;
          case 10:
            return 11;
          case 11:
            return 5;
          case 12:
            return 12;
          case 13:
            return 17;
          case 14:
            if (v766.consumeIndentText) {
              v766.consumeIndentText = false;
            } else {
              return 19;
            }
            break;
          case 15:
            return 24;
          case 16:
            v767.yytext = v767.yytext.slice(2, -2);
            return 14;
          case 17:
            v767.yytext = v767.yytext.slice(1, -1).trim();
            return 14;
          case 18:
            return 16;
          case 19:
            return 31;
          case 20:
            return 33;
          case 21:
            return 32;
          case 22:
            return 20;
          case 23:
            return 21;
          case 24:
            return 27;
          case 25:
            return 15;
        }
      }, "anonymous"),
      rules: [/^(?:%%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[ \t]+(?=[\n\r]))/i, /^(?:[ \t]+(?=text\b))/i, /^(?:[ \t]+)/i, /^(?:[^ \t\n\r])/i, /^(?:[\n\r]+)/i, /^(?:%%[^\n]*)/i, /^(?:[ \t]+)/i, /^(?:$)/i, /^(?:title\s[^#\n;]+)/i, /^(?:venn-beta\b)/i, /^(?:set\b)/i, /^(?:union\b)/i, /^(?:text\b)/i, /^(?:style\b)/i, /^(?:\["[^\"]*"\])/i, /^(?:\[[^\]\"]+\])/i, /^(?:[+-]?(\d+(\.\d+)?|\.\d+))/i, /^(?:#[0-9a-fA-F]{3,8})/i, /^(?:rgba\(\s*[0-9.]+\s*[,]\s*[0-9.]+\s*[,]\s*[0-9.]+\s*[,]\s*[0-9.]+\s*\))/i, /^(?:rgb\(\s*[0-9.]+\s*[,]\s*[0-9.]+\s*[,]\s*[0-9.]+\s*\))/i, /^(?:[A-Za-z_][A-Za-z0-9\-_]*)/i, /^(?:"[^\"]*")/i, /^(?:,)/i, /^(?::)/i],
      conditions: {
        bol: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
          inclusive: true
        },
        INITIAL: {
          rules: [0, 1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
          inclusive: true
        }
      }
    };
    return v723;
  }();
  v673.lexer = v722;
  function v770() {
    this.yy = {};
  }
  v8(v770, "Parser");
  v770.prototype = v673;
  v673.Parser = v770;
  return new v770();
}();
parser.parser = parser;
var venn_default = parser;
var subsets = [];
var textNodes = [];
var styleEntries = [];
var knownSets = new Set();
var currentSets;
var indentMode = false;
var addSubsetData = v8((v771, v772, v773) => {
  const v774 = normalizeIdentifierList(v771).sort();
  const v775 = v773 ?? 10 / Math.pow(v771.length, 2);
  currentSets = v774;
  if (v774.length === 1) {
    knownSets.add(v774[0]);
  }
  subsets.push({
    sets: v774,
    size: v775,
    label: v772 ? normalizeText(v772) : undefined
  });
}, "addSubsetData");
var getSubsetData = v8(() => {
  return subsets;
}, "getSubsetData");
var normalizeText = v8(v776 => {
  const v777 = v776.trim();
  if (v777.length >= 2 && v777.startsWith("\"") && v777.endsWith("\"")) {
    return v777.slice(1, -1);
  }
  return v777;
}, "normalizeText");
var normalizeStyleValue = v8(v778 => {
  if (v778) {
    return normalizeText(v778);
  } else {
    return v778;
  }
}, "normalizeStyleValue");
var addTextData = v8((v779, v780, v781) => {
  const v782 = normalizeText(v780);
  textNodes.push({
    sets: normalizeIdentifierList(v779).sort(),
    id: v782,
    label: v781 ? normalizeText(v781) : undefined
  });
}, "addTextData");
var addStyleData = v8((v783, v784) => {
  const v785 = normalizeIdentifierList(v783).sort();
  const v786 = {};
  for (const [v787, v788] of v784) {
    v786[v787] = normalizeStyleValue(v788) ?? v788;
  }
  styleEntries.push({
    targets: v785,
    styles: v786
  });
}, "addStyleData");
var getStyleData = v8(() => {
  return styleEntries;
}, "getStyleData");
var normalizeIdentifierList = v8(v789 => {
  return v789.map(v790 => normalizeText(v790));
}, "normalizeIdentifierList");
var validateUnionIdentifiers = v8(v791 => {
  const v792 = normalizeIdentifierList(v791);
  const v793 = v792.filter(v794 => !knownSets.has(v794));
  if (v793.length > 0) {
    throw new Error("unknown set identifier: " + v793.join(", "));
  }
}, "validateUnionIdentifiers");
var getTextData = v8(() => {
  return textNodes;
}, "getTextData");
var getCurrentSets = v8(() => currentSets, "getCurrentSets");
var getIndentMode = v8(() => indentMode, "getIndentMode");
var setIndentMode = v8(v795 => {
  indentMode = v795;
}, "setIndentMode");
var DEFAULT_VENN_CONFIG = v19.venn;
function getConfig2() {
  return v18(DEFAULT_VENN_CONFIG, v9().venn);
}
v8(getConfig2, "getConfig");
var customClear = v8(() => {
  v17();
  subsets.length = 0;
  textNodes.length = 0;
  styleEntries.length = 0;
  knownSets.clear();
  currentSets = undefined;
  indentMode = false;
}, "customClear");
var db = {
  getConfig: getConfig2,
  clear: customClear,
  setAccTitle: v7,
  getAccTitle: v6,
  setDiagramTitle: v5,
  getDiagramTitle: v4,
  getAccDescription: v3,
  setAccDescription: v2,
  addSubsetData: addSubsetData,
  getSubsetData: getSubsetData,
  addTextData: addTextData,
  addStyleData: addStyleData,
  validateUnionIdentifiers: validateUnionIdentifiers,
  getTextData: getTextData,
  getStyleData: getStyleData,
  getCurrentSets: getCurrentSets,
  getIndentMode: getIndentMode,
  setIndentMode: setIndentMode
};
var getStyles = v8(v796 => "\n  .venn-title {\n    font-size: 32px;\n    fill: " + v796.vennTitleTextColor + ";\n    font-family: " + v796.fontFamily + ";\n  }\n\n  .venn-circle text {\n    font-size: 48px;\n    font-family: " + v796.fontFamily + ";\n  }\n\n  .venn-intersection text {\n    font-size: 48px;\n    fill: " + v796.vennSetTextColor + ";\n    font-family: " + v796.fontFamily + ";\n  }\n\n  .venn-text-node {\n    font-family: " + v796.fontFamily + ";\n    color: " + v796.vennSetTextColor + ";\n  }\n", "getStyles");
var styles_default = getStyles;
function buildStyleByKey(v797) {
  const v798 = new Map();
  for (const v799 of v797) {
    const v800 = v799.targets.join("|");
    const v801 = v798.get(v800);
    if (v801) {
      Object.assign(v801, v799.styles);
    } else {
      v798.set(v800, {
        ...v799.styles
      });
    }
  }
  return v798;
}
v8(buildStyleByKey, "buildStyleByKey");
var draw = v8((v802, v803, v804, v805) => {
  const v806 = v805.db;
  const v807 = v806.getConfig?.();
  const {
    themeVariables: v808,
    look: v809,
    handDrawnSeed: v810
  } = v9();
  const v811 = v809 === "handDrawn";
  const v812 = [v808.venn1, v808.venn2, v808.venn3, v808.venn4, v808.venn5, v808.venn6, v808.venn7, v808.venn8].filter(Boolean);
  const v813 = v806.getDiagramTitle?.();
  const v814 = v806.getSubsetData();
  const v815 = v806.getTextData();
  const v816 = buildStyleByKey(v806.getStyleData());
  const v817 = ensurePairwiseSubsets(v814);
  const v818 = v807?.width ?? 800;
  const v819 = v807?.height ?? 450;
  const v820 = 1600;
  const v821 = v818 / v820;
  const v822 = v813 ? v821 * 48 : 0;
  const v823 = v808.primaryTextColor ?? v808.textColor;
  const v824 = v10(v803);
  v824.attr("viewBox", "0 0 " + v818 + " " + v819);
  if (v813) {
    v824.append("text").text(v813).attr("class", "venn-title").attr("font-size", v821 * 32 + "px").attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("x", "50%").attr("y", v821 * 32).style("fill", v808.vennTitleTextColor || v808.titleColor);
  }
  const v825 = v11(document.createElement("div"));
  const v826 = VennDiagram().width(v818).height(v819 - v822);
  v825.datum(v817).call(v826);
  const v827 = v811 ? v12.svg(v825.select("svg").node()) : undefined;
  const v828 = layout(v817, {
    width: v818,
    height: v819 - v822,
    padding: v807?.padding ?? 15
  });
  const v829 = new Map();
  for (const v830 of v828) {
    const v831 = stableSetsKey([...v830.data.sets].sort());
    v829.set(v831, v830);
  }
  if (v815.length > 0) {
    renderTextNodes(v807, v829, v825, v815, v821, v816);
  }
  const v832 = v13(v808.background || "#f4f4f4");
  v825.selectAll(".venn-circle").each(function (v833, v834) {
    const v835 = v11(this);
    const v836 = v833;
    const v837 = stableSetsKey([...v836.sets].sort());
    const v838 = v816.get(v837);
    const v839 = v838?.fill || v812[v834 % v812.length] || v808.primaryColor;
    v835.classed("venn-set-" + v834 % 8, true);
    const v840 = v838?.["fill-opacity"] ?? 0.1;
    const v841 = v838?.stroke || v839;
    const v842 = v838?.["stroke-width"] || "" + v821 * 5;
    if (v811 && v827) {
      const v843 = v829.get(v837);
      if (v843 && v843.circles.length > 0) {
        const v844 = v843.circles[0];
        const v845 = v827.circle(v844.x, v844.y, v844.radius * 2, {
          roughness: 0.7,
          seed: v810,
          fill: transparentize(v839, 0.7),
          fillStyle: "hachure",
          fillWeight: 2,
          hachureGap: 8,
          hachureAngle: -41 + v834 * 60,
          stroke: v841,
          strokeWidth: parseFloat(String(v842))
        });
        v835.select("path").remove();
        v835.node()?.insertBefore(v845, v835.select("text").node());
      }
    } else {
      v835.select("path").style("fill", v839).style("fill-opacity", v840).style("stroke", v841).style("stroke-width", v842).style("stroke-opacity", 0.95);
    }
    const v846 = v838?.color || (v832 ? v14(v839, 30) : v15(v839, 30));
    v835.select("text").style("font-size", v821 * 48 + "px").style("fill", v846);
  });
  if (v811 && v827) {
    v825.selectAll(".venn-intersection").each(function (v847) {
      const v848 = v11(this);
      const v849 = v847;
      const v850 = stableSetsKey([...v849.sets].sort());
      const v851 = v816.get(v850);
      const v852 = v851?.fill;
      if (v852) {
        const v853 = v848.select("path");
        const v854 = v853.attr("d");
        if (v854) {
          const v855 = v827.path(v854, {
            roughness: 0.7,
            seed: v810,
            fill: transparentize(v852, 0.3),
            fillStyle: "cross-hatch",
            fillWeight: 2,
            hachureGap: 6,
            hachureAngle: 60,
            stroke: "none"
          });
          const v856 = v853.node();
          v856?.parentNode?.insertBefore(v855, v856);
          v853.remove();
        }
      } else {
        v848.select("path").style("fill-opacity", 0);
      }
      v848.select("text").style("font-size", v821 * 48 + "px").style("fill", v851?.color ?? v808.vennSetTextColor ?? v823);
    });
  } else {
    v825.selectAll(".venn-intersection text").style("font-size", v821 * 48 + "px").style("fill", v857 => {
      const v858 = v857;
      const v859 = stableSetsKey([...v858.sets].sort());
      return v816.get(v859)?.color ?? v808.vennSetTextColor ?? v823;
    });
    v825.selectAll(".venn-intersection path").style("fill-opacity", v860 => {
      const v861 = v860;
      const v862 = stableSetsKey([...v861.sets].sort());
      if (v816.get(v862)?.fill) {
        return 1;
      } else {
        return 0;
      }
    }).style("fill", v863 => {
      const v864 = v863;
      const v865 = stableSetsKey([...v864.sets].sort());
      return v816.get(v865)?.fill ?? "transparent";
    });
  }
  const v866 = v824.append("g").attr("transform", "translate(0, " + v822 + ")");
  const v867 = v825.select("svg").node();
  if (v867 && "childNodes" in v867) {
    for (const v868 of [...v867.childNodes]) {
      v866.node()?.appendChild(v868);
    }
  }
  v16(v824, v819, v818, v807?.useMaxWidth ?? true);
}, "draw");
function stableSetsKey(v869) {
  return v869.join("|");
}
v8(stableSetsKey, "stableSetsKey");
function renderTextNodes(v870, v871, v872, v873, v874, v875) {
  const v876 = v870?.useDebugLayout ?? false;
  const v877 = v872.select("svg");
  const v878 = v877.append("g").attr("class", "venn-text-nodes");
  const v879 = new Map();
  for (const v880 of v873) {
    const v881 = stableSetsKey(v880.sets);
    const v882 = v879.get(v881);
    if (v882) {
      v882.push(v880);
    } else {
      v879.set(v881, [v880]);
    }
  }
  for (const [v883, v884] of v879.entries()) {
    const v885 = v871.get(v883);
    if (!v885?.text) {
      continue;
    }
    const v886 = v885.text.x;
    const v887 = v885.text.y;
    const v888 = Math.min(...v885.circles.map(v889 => v889.radius));
    const v890 = Math.min(...v885.circles.map(v891 => v891.radius - Math.hypot(v886 - v891.x, v887 - v891.y)));
    let v892 = Number.isFinite(v890) ? Math.max(0, v890) : 0;
    if (v892 === 0 && Number.isFinite(v888)) {
      v892 = v888 * 0.6;
    }
    const v893 = v878.append("g").attr("class", "venn-text-area").attr("font-size", v874 * 40 + "px");
    if (v876) {
      v893.append("circle").attr("class", "venn-text-debug-circle").attr("cx", v886).attr("cy", v887).attr("r", v892).attr("fill", "none").attr("stroke", "purple").attr("stroke-width", v874 * 1.5).attr("stroke-dasharray", v874 * 6 + " " + v874 * 4);
    }
    const v894 = Math.max(v874 * 80, v892 * 2 * 0.95);
    const v895 = Math.max(v874 * 60, v892 * 2 * 0.95);
    const v896 = v885.data.label && v885.data.label.length > 0;
    const v897 = v896 ? Math.min(v874 * 32, v892 * 0.25) : 0;
    const v898 = v897 + (v884.length <= 2 ? v874 * 30 : 0);
    const v899 = v886 - v894 / 2;
    const v900 = v887 - v895 / 2 + v898;
    const v901 = Math.max(1, Math.ceil(Math.sqrt(v884.length)));
    const v902 = Math.max(1, Math.ceil(v884.length / v901));
    const v903 = v894 / v901;
    const v904 = v895 / v902;
    for (const [v905, v906] of v884.entries()) {
      const v907 = v905 % v901;
      const v908 = Math.floor(v905 / v901);
      const v909 = v899 + v903 * (v907 + 0.5);
      const v910 = v900 + v904 * (v908 + 0.5);
      if (v876) {
        v893.append("rect").attr("class", "venn-text-debug-cell").attr("x", v899 + v903 * v907).attr("y", v900 + v904 * v908).attr("width", v903).attr("height", v904).attr("fill", "none").attr("stroke", "teal").attr("stroke-width", v874 * 1).attr("stroke-dasharray", v874 * 4 + " " + v874 * 3);
      }
      const v911 = v903 * 0.9;
      const v912 = v904 * 0.9;
      const v913 = v893.append("foreignObject").attr("class", "venn-text-node-fo").attr("width", v911).attr("height", v912).attr("x", v909 - v911 / 2).attr("y", v910 - v912 / 2).attr("overflow", "visible");
      const v914 = v875.get(v906.id)?.color;
      const v915 = v913.append("xhtml:span").attr("class", "venn-text-node").style("display", "flex").style("width", "100%").style("height", "100%").style("white-space", "normal").style("align-items", "center").style("justify-content", "center").style("text-align", "center").style("overflow-wrap", "normal").style("word-break", "normal").text(v906.label ?? v906.id);
      if (v914) {
        v915.style("color", v914);
      }
    }
  }
}
v8(renderTextNodes, "renderTextNodes");
function ensurePairwiseSubsets(v916) {
  const v917 = new Set(v916.map(v918 => [...v918.sets].sort().join("|")));
  const v919 = new Map(v916.filter(v920 => v920.sets.length === 1 && v920.size !== undefined).map(v921 => [v921.sets[0], v921.size]));
  const v922 = [];
  for (const v923 of v916) {
    if (v923.sets.length < 3) {
      continue;
    }
    const v924 = [...v923.sets].sort();
    for (let v925 = 0; v925 < v924.length - 1; v925++) {
      for (let v926 = v925 + 1; v926 < v924.length; v926++) {
        const v927 = [v924[v925], v924[v926]];
        const v928 = v927.join("|");
        if (!v917.has(v928)) {
          v917.add(v928);
          const v929 = v919.get(v927[0]);
          const v930 = v919.get(v927[1]);
          const v931 = v929 !== undefined && v930 !== undefined ? Math.min(v929, v930) / 4 : 2.5;
          v922.push({
            sets: v927,
            size: v931,
            label: ""
          });
        }
      }
    }
  }
  if (v922.length > 0) {
    return [...v916, ...v922];
  } else {
    return v916;
  }
}
v8(ensurePairwiseSubsets, "ensurePairwiseSubsets");
var renderer = {
  draw: draw
};
var diagram = {
  parser: venn_default,
  db: db,
  renderer: renderer,
  styles: styles_default
};
export { diagram };