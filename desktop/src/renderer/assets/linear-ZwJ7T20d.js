import { bb as v1, bc as v2, bd as v3, be as v4, bf as v5 } from "./index-CXb3UsfP.js";
import { i as v6 } from "./init-ZxktEp_H.js";
import { e as v7, f as v8, a as v9, b as v10 } from "./defaultLocale-B2RvLBDe.js";
function ascending(v11, v12) {
  if (v11 == null || v12 == null) {
    return NaN;
  } else if (v11 < v12) {
    return -1;
  } else if (v11 > v12) {
    return 1;
  } else if (v11 >= v12) {
    return 0;
  } else {
    return NaN;
  }
}
function descending(v13, v14) {
  if (v13 == null || v14 == null) {
    return NaN;
  } else if (v14 < v13) {
    return -1;
  } else if (v14 > v13) {
    return 1;
  } else if (v14 >= v13) {
    return 0;
  } else {
    return NaN;
  }
}
function bisector(v15) {
  let v16;
  let v17;
  let v18;
  if (v15.length !== 2) {
    v16 = ascending;
    v17 = (v19, v20) => ascending(v15(v19), v20);
    v18 = (v21, v22) => v15(v21) - v22;
  } else {
    v16 = v15 === ascending || v15 === descending ? v15 : zero;
    v17 = v15;
    v18 = v15;
  }
  function v23(v24, v25, v26 = 0, v27 = v24.length) {
    if (v26 < v27) {
      if (v16(v25, v25) !== 0) {
        return v27;
      }
      do {
        const v28 = v26 + v27 >>> 1;
        if (v17(v24[v28], v25) < 0) {
          v26 = v28 + 1;
        } else {
          v27 = v28;
        }
      } while (v26 < v27);
    }
    return v26;
  }
  function v29(v30, v31, v32 = 0, v33 = v30.length) {
    if (v32 < v33) {
      if (v16(v31, v31) !== 0) {
        return v33;
      }
      do {
        const v34 = v32 + v33 >>> 1;
        if (v17(v30[v34], v31) <= 0) {
          v32 = v34 + 1;
        } else {
          v33 = v34;
        }
      } while (v32 < v33);
    }
    return v32;
  }
  function v35(v36, v37, v38 = 0, v39 = v36.length) {
    const v40 = v23(v36, v37, v38, v39 - 1);
    if (v40 > v38 && v18(v36[v40 - 1], v37) > -v18(v36[v40], v37)) {
      return v40 - 1;
    } else {
      return v40;
    }
  }
  return {
    left: v23,
    center: v35,
    right: v29
  };
}
function zero() {
  return 0;
}
function number$1(v41) {
  if (v41 === null) {
    return NaN;
  } else {
    return +v41;
  }
}
const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
bisector(number$1).center;
const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);
function tickSpec(v42, v43, v44) {
  const v45 = (v43 - v42) / Math.max(0, v44);
  const v46 = Math.floor(Math.log10(v45));
  const v47 = v45 / Math.pow(10, v46);
  const v48 = v47 >= e10 ? 10 : v47 >= e5 ? 5 : v47 >= e2 ? 2 : 1;
  let v49;
  let v50;
  let v51;
  if (v46 < 0) {
    v51 = Math.pow(10, -v46) / v48;
    v49 = Math.round(v42 * v51);
    v50 = Math.round(v43 * v51);
    if (v49 / v51 < v42) {
      ++v49;
    }
    if (v50 / v51 > v43) {
      --v50;
    }
    v51 = -v51;
  } else {
    v51 = Math.pow(10, v46) * v48;
    v49 = Math.round(v42 / v51);
    v50 = Math.round(v43 / v51);
    if (v49 * v51 < v42) {
      ++v49;
    }
    if (v50 * v51 > v43) {
      --v50;
    }
  }
  if (v50 < v49 && v44 >= 0.5 && v44 < 2) {
    return tickSpec(v42, v43, v44 * 2);
  }
  return [v49, v50, v51];
}
function ticks(v52, v53, v54) {
  v53 = +v53;
  v52 = +v52;
  v54 = +v54;
  if (!(v54 > 0)) {
    return [];
  }
  if (v52 === v53) {
    return [v52];
  }
  const v55 = v53 < v52;
  const [v56, v57, v58] = v55 ? tickSpec(v53, v52, v54) : tickSpec(v52, v53, v54);
  if (!(v57 >= v56)) {
    return [];
  }
  const v59 = v57 - v56 + 1;
  const v60 = new Array(v59);
  if (v55) {
    if (v58 < 0) {
      for (let v61 = 0; v61 < v59; ++v61) {
        v60[v61] = (v57 - v61) / -v58;
      }
    } else {
      for (let v62 = 0; v62 < v59; ++v62) {
        v60[v62] = (v57 - v62) * v58;
      }
    }
  } else if (v58 < 0) {
    for (let v63 = 0; v63 < v59; ++v63) {
      v60[v63] = (v56 + v63) / -v58;
    }
  } else {
    for (let v64 = 0; v64 < v59; ++v64) {
      v60[v64] = (v56 + v64) * v58;
    }
  }
  return v60;
}
function tickIncrement(v65, v66, v67) {
  v66 = +v66;
  v65 = +v65;
  v67 = +v67;
  return tickSpec(v65, v66, v67)[2];
}
function tickStep(v68, v69, v70) {
  v69 = +v69;
  v68 = +v68;
  v70 = +v70;
  const v71 = v69 < v68;
  const v72 = v71 ? tickIncrement(v69, v68, v70) : tickIncrement(v68, v69, v70);
  return (v71 ? -1 : 1) * (v72 < 0 ? 1 / -v72 : v72);
}
function numberArray(v73, v74) {
  if (!v74) {
    v74 = [];
  }
  var v75 = v73 ? Math.min(v74.length, v73.length) : 0;
  var v76 = v74.slice();
  var v77;
  return function (v78) {
    for (v77 = 0; v77 < v75; ++v77) {
      v76[v77] = v73[v77] * (1 - v78) + v74[v77] * v78;
    }
    return v76;
  };
}
function isNumberArray(v79) {
  return ArrayBuffer.isView(v79) && !(v79 instanceof DataView);
}
function genericArray(v80, v81) {
  var v82 = v81 ? v81.length : 0;
  var v83 = v80 ? Math.min(v82, v80.length) : 0;
  var v84 = new Array(v83);
  var v85 = new Array(v82);
  var v86;
  for (v86 = 0; v86 < v83; ++v86) {
    v84[v86] = interpolate(v80[v86], v81[v86]);
  }
  for (; v86 < v82; ++v86) {
    v85[v86] = v81[v86];
  }
  return function (v87) {
    for (v86 = 0; v86 < v83; ++v86) {
      v85[v86] = v84[v86](v87);
    }
    return v85;
  };
}
function date(v88, v89) {
  var v90 = new Date();
  v88 = +v88;
  v89 = +v89;
  return function (v91) {
    v90.setTime(v88 * (1 - v91) + v89 * v91);
    return v90;
  };
}
function object(v92, v93) {
  var v94 = {};
  var v95 = {};
  var v96;
  if (v92 === null || typeof v92 !== "object") {
    v92 = {};
  }
  if (v93 === null || typeof v93 !== "object") {
    v93 = {};
  }
  for (v96 in v93) {
    if (v96 in v92) {
      v94[v96] = interpolate(v92[v96], v93[v96]);
    } else {
      v95[v96] = v93[v96];
    }
  }
  return function (v97) {
    for (v96 in v94) {
      v95[v96] = v94[v96](v97);
    }
    return v95;
  };
}
function interpolate(v98, v99) {
  var v100 = typeof v99;
  var v101;
  if (v99 == null || v100 === "boolean") {
    return v1(v99);
  } else {
    return (v100 === "number" ? v2 : v100 === "string" ? (v101 = v3(v99)) ? (v99 = v101, v4) : v5 : v99 instanceof v3 ? v4 : v99 instanceof Date ? date : isNumberArray(v99) ? numberArray : Array.isArray(v99) ? genericArray : typeof v99.valueOf !== "function" && typeof v99.toString !== "function" || isNaN(v99) ? object : v2)(v98, v99);
  }
}
function interpolateRound(v102, v103) {
  v102 = +v102;
  v103 = +v103;
  return function (v104) {
    return Math.round(v102 * (1 - v104) + v103 * v104);
  };
}
function precisionFixed(v105) {
  return Math.max(0, -v7(Math.abs(v105)));
}
function precisionPrefix(v106, v107) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(v7(v107) / 3))) * 3 - v7(Math.abs(v106)));
}
function precisionRound(v108, v109) {
  v108 = Math.abs(v108);
  v109 = Math.abs(v109) - v108;
  return Math.max(0, v7(v109) - v7(v108)) + 1;
}
function constants(v110) {
  return function () {
    return v110;
  };
}
function number(v111) {
  return +v111;
}
var unit = [0, 1];
function identity(v112) {
  return v112;
}
function normalize(v113, v114) {
  if (v114 -= v113 = +v113) {
    return function (v115) {
      return (v115 - v113) / v114;
    };
  } else {
    return constants(isNaN(v114) ? NaN : 0.5);
  }
}
function clamper(v116, v117) {
  var v118;
  if (v116 > v117) {
    v118 = v116;
    v116 = v117;
    v117 = v118;
  }
  return function (v119) {
    return Math.max(v116, Math.min(v117, v119));
  };
}
function bimap(v120, v121, v122) {
  var v123 = v120[0];
  var v124 = v120[1];
  var v125 = v121[0];
  var v126 = v121[1];
  if (v124 < v123) {
    v123 = normalize(v124, v123);
    v125 = v122(v126, v125);
  } else {
    v123 = normalize(v123, v124);
    v125 = v122(v125, v126);
  }
  return function (v127) {
    return v125(v123(v127));
  };
}
function polymap(v128, v129, v130) {
  var v131 = Math.min(v128.length, v129.length) - 1;
  var v132 = new Array(v131);
  var v133 = new Array(v131);
  var v134 = -1;
  if (v128[v131] < v128[0]) {
    v128 = v128.slice().reverse();
    v129 = v129.slice().reverse();
  }
  while (++v134 < v131) {
    v132[v134] = normalize(v128[v134], v128[v134 + 1]);
    v133[v134] = v130(v129[v134], v129[v134 + 1]);
  }
  return function (v135) {
    var v136 = bisectRight(v128, v135, 1, v131) - 1;
    return v133[v136](v132[v136](v135));
  };
}
function copy(v137, v138) {
  return v138.domain(v137.domain()).range(v137.range()).interpolate(v137.interpolate()).clamp(v137.clamp()).unknown(v137.unknown());
}
function transformer() {
  var v139 = unit;
  var v140 = unit;
  var v141 = interpolate;
  var v142;
  var v143;
  var v144;
  var v145 = identity;
  var v146;
  var v147;
  var v148;
  function v149() {
    var v150 = Math.min(v139.length, v140.length);
    if (v145 !== identity) {
      v145 = clamper(v139[0], v139[v150 - 1]);
    }
    v146 = v150 > 2 ? polymap : bimap;
    v147 = v148 = null;
    return v151;
  }
  function v151(v152) {
    if (v152 == null || isNaN(v152 = +v152)) {
      return v144;
    } else {
      return (v147 ||= v146(v139.map(v142), v140, v141))(v142(v145(v152)));
    }
  }
  v151.invert = function (v153) {
    return v145(v143((v148 ||= v146(v140, v139.map(v142), v2))(v153)));
  };
  v151.domain = function (v154) {
    if (arguments.length) {
      v139 = Array.from(v154, number);
      return v149();
    } else {
      return v139.slice();
    }
  };
  v151.range = function (v155) {
    if (arguments.length) {
      v140 = Array.from(v155);
      return v149();
    } else {
      return v140.slice();
    }
  };
  v151.rangeRound = function (v156) {
    v140 = Array.from(v156);
    v141 = interpolateRound;
    return v149();
  };
  v151.clamp = function (v157) {
    if (arguments.length) {
      v145 = v157 ? true : identity;
      return v149();
    } else {
      return v145 !== identity;
    }
  };
  v151.interpolate = function (v158) {
    if (arguments.length) {
      v141 = v158;
      return v149();
    } else {
      return v141;
    }
  };
  v151.unknown = function (v159) {
    if (arguments.length) {
      v144 = v159;
      return v151;
    } else {
      return v144;
    }
  };
  return function (v160, v161) {
    v142 = v160;
    v143 = v161;
    return v149();
  };
}
function continuous() {
  return transformer()(identity, identity);
}
function tickFormat(v162, v163, v164, v165) {
  var v166 = tickStep(v162, v163, v164);
  var v167;
  v165 = v8(v165 == null ? ",f" : v165);
  switch (v165.type) {
    case "s":
      {
        var v168 = Math.max(Math.abs(v162), Math.abs(v163));
        if (v165.precision == null && !isNaN(v167 = precisionPrefix(v166, v168))) {
          v165.precision = v167;
        }
        return v9(v165, v168);
      }
    case "":
    case "e":
    case "g":
    case "p":
    case "r":
      {
        if (v165.precision == null && !isNaN(v167 = precisionRound(v166, Math.max(Math.abs(v162), Math.abs(v163))))) {
          v165.precision = v167 - (v165.type === "e");
        }
        break;
      }
    case "f":
    case "%":
      {
        if (v165.precision == null && !isNaN(v167 = precisionFixed(v166))) {
          v165.precision = v167 - (v165.type === "%") * 2;
        }
        break;
      }
  }
  return v10(v165);
}
function linearish(v169) {
  var v170 = v169.domain;
  v169.ticks = function (v171) {
    var v172 = v170();
    return ticks(v172[0], v172[v172.length - 1], v171 == null ? 10 : v171);
  };
  v169.tickFormat = function (v173, v174) {
    var v175 = v170();
    return tickFormat(v175[0], v175[v175.length - 1], v173 == null ? 10 : v173, v174);
  };
  v169.nice = function (v176) {
    if (v176 == null) {
      v176 = 10;
    }
    var v177 = v170();
    var v178 = 0;
    var v179 = v177.length - 1;
    var v180 = v177[v178];
    var v181 = v177[v179];
    var v182;
    var v183;
    var v184 = 10;
    if (v181 < v180) {
      v183 = v180;
      v180 = v181;
      v181 = v183;
      v183 = v178;
      v178 = v179;
      v179 = v183;
    }
    while (v184-- > 0) {
      v183 = tickIncrement(v180, v181, v176);
      if (v183 === v182) {
        v177[v178] = v180;
        v177[v179] = v181;
        return v170(v177);
      } else if (v183 > 0) {
        v180 = Math.floor(v180 / v183) * v183;
        v181 = Math.ceil(v181 / v183) * v183;
      } else if (v183 < 0) {
        v180 = Math.ceil(v180 * v183) / v183;
        v181 = Math.floor(v181 * v183) / v183;
      } else {
        break;
      }
      v182 = v183;
    }
    return v169;
  };
  return v169;
}
function linear() {
  var v185 = continuous();
  v185.copy = function () {
    return copy(v185, linear());
  };
  v6.apply(v185, arguments);
  return linearish(v185);
}
export { copy as a, bisector as b, continuous as c, linear as l, tickStep as t };