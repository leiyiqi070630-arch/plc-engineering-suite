import { bi as v1, bj as v2, bk as v3, bl as v4, bm as v5, bn as v6, bo as v7, b8 as v8, g as v9, s as v10, o as v11, n as v12, a as v13, b as v14, _ as v15, c as v16, d as v17, e as v18, bp as v19, l as v20, k as v21, j as v22, p as v23, x as v24 } from "./index-CXb3UsfP.js";
import { b as v25, t as v26, c as v27, a as v28, l as v29 } from "./linear-ZwJ7T20d.js";
import { i as v30 } from "./init-ZxktEp_H.js";
import "./defaultLocale-B2RvLBDe.js";
function max(v31, v32) {
  let v33;
  if (v32 === undefined) {
    for (const v34 of v31) {
      if (v34 != null && (v33 < v34 || v33 === undefined && v34 >= v34)) {
        v33 = v34;
      }
    }
  } else {
    let v35 = -1;
    for (let v36 of v31) {
      if ((v36 = v32(v36, ++v35, v31)) != null && (v33 < v36 || v33 === undefined && v36 >= v36)) {
        v33 = v36;
      }
    }
  }
  return v33;
}
function min(v37, v38) {
  let v39;
  if (v38 === undefined) {
    for (const v40 of v37) {
      if (v40 != null && (v39 > v40 || v39 === undefined && v40 >= v40)) {
        v39 = v40;
      }
    }
  } else {
    let v41 = -1;
    for (let v42 of v37) {
      if ((v42 = v38(v42, ++v41, v37)) != null && (v39 > v42 || v39 === undefined && v42 >= v42)) {
        v39 = v42;
      }
    }
  }
  return v39;
}
function identity(v43) {
  return v43;
}
var top = 1;
var right = 2;
var bottom = 3;
var left = 4;
var epsilon = 0.000001;
function translateX(v44) {
  return "translate(" + v44 + ",0)";
}
function translateY(v45) {
  return "translate(0," + v45 + ")";
}
function number$1(v46) {
  return v47 => +v46(v47);
}
function center(v48, v49) {
  v49 = Math.max(0, v48.bandwidth() - v49 * 2) / 2;
  if (v48.round()) {
    v49 = Math.round(v49);
  }
  return v50 => +v48(v50) + v49;
}
function entering() {
  return !this.__axis;
}
function axis(v51, v52) {
  var v53 = [];
  var v54 = null;
  var v55 = null;
  var v56 = 6;
  var v57 = 6;
  var v58 = 3;
  var v59 = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5;
  var v60 = v51 === top || v51 === left ? -1 : 1;
  var v61 = v51 === left || v51 === right ? "x" : "y";
  var v62 = v51 === top || v51 === bottom ? translateX : translateY;
  function v63(v64) {
    var v65 = v54 == null ? v52.ticks ? v52.ticks.apply(v52, v53) : v52.domain() : v54;
    var v66 = v55 == null ? v52.tickFormat ? v52.tickFormat.apply(v52, v53) : identity : v55;
    var v67 = Math.max(v56, 0) + v58;
    var v68 = v52.range();
    var v69 = +v68[0] + v59;
    var v70 = +v68[v68.length - 1] + v59;
    var v71 = (v52.bandwidth ? center : number$1)(v52.copy(), v59);
    var v72 = v64.selection ? v64.selection() : v64;
    var v73 = v72.selectAll(".domain").data([null]);
    var v74 = v72.selectAll(".tick").data(v65, v52).order();
    var v75 = v74.exit();
    var v76 = v74.enter().append("g").attr("class", "tick");
    var v77 = v74.select("line");
    var v78 = v74.select("text");
    v73 = v73.merge(v73.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor"));
    v74 = v74.merge(v76);
    v77 = v77.merge(v76.append("line").attr("stroke", "currentColor").attr(v61 + "2", v60 * v56));
    v78 = v78.merge(v76.append("text").attr("fill", "currentColor").attr(v61, v60 * v67).attr("dy", v51 === top ? "0em" : v51 === bottom ? "0.71em" : "0.32em"));
    if (v64 !== v72) {
      v73 = v73.transition(v64);
      v74 = v74.transition(v64);
      v77 = v77.transition(v64);
      v78 = v78.transition(v64);
      v75 = v75.transition(v64).attr("opacity", epsilon).attr("transform", function (v79) {
        if (isFinite(v79 = v71(v79))) {
          return v62(v79 + v59);
        } else {
          return this.getAttribute("transform");
        }
      });
      v76.attr("opacity", epsilon).attr("transform", function (v80) {
        var v81 = this.parentNode.__axis;
        return v62((v81 && isFinite(v81 = v81(v80)) ? v81 : v71(v80)) + v59);
      });
    }
    v75.remove();
    v73.attr("d", v51 === left || v51 === right ? v57 ? "M" + v60 * v57 + "," + v69 + "H" + v59 + "V" + v70 + "H" + v60 * v57 : "M" + v59 + "," + v69 + "V" + v70 : v57 ? "M" + v69 + "," + v60 * v57 + "V" + v59 + "H" + v70 + "V" + v60 * v57 : "M" + v69 + "," + v59 + "H" + v70);
    v74.attr("opacity", 1).attr("transform", function (v82) {
      return v62(v71(v82) + v59);
    });
    v77.attr(v61 + "2", v60 * v56);
    v78.attr(v61, v60 * v67).text(v66);
    v72.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", v51 === right ? "start" : v51 === left ? "end" : "middle");
    v72.each(function () {
      this.__axis = v71;
    });
  }
  v63.scale = function (v83) {
    if (arguments.length) {
      v52 = v83;
      return v63;
    } else {
      return v52;
    }
  };
  v63.ticks = function () {
    v53 = Array.from(arguments);
    return v63;
  };
  v63.tickArguments = function (v84) {
    if (arguments.length) {
      v53 = v84 == null ? [] : Array.from(v84);
      return v63;
    } else {
      return v53.slice();
    }
  };
  v63.tickValues = function (v85) {
    if (arguments.length) {
      v54 = v85 == null ? null : Array.from(v85);
      return v63;
    } else {
      return v54 && v54.slice();
    }
  };
  v63.tickFormat = function (v86) {
    if (arguments.length) {
      v55 = v86;
      return v63;
    } else {
      return v55;
    }
  };
  v63.tickSize = function (v87) {
    if (arguments.length) {
      v56 = v57 = +v87;
      return v63;
    } else {
      return v56;
    }
  };
  v63.tickSizeInner = function (v88) {
    if (arguments.length) {
      v56 = +v88;
      return v63;
    } else {
      return v56;
    }
  };
  v63.tickSizeOuter = function (v89) {
    if (arguments.length) {
      v57 = +v89;
      return v63;
    } else {
      return v57;
    }
  };
  v63.tickPadding = function (v90) {
    if (arguments.length) {
      v58 = +v90;
      return v63;
    } else {
      return v58;
    }
  };
  v63.offset = function (v91) {
    if (arguments.length) {
      v59 = +v91;
      return v63;
    } else {
      return v59;
    }
  };
  return v63;
}
function axisTop(v92) {
  return axis(top, v92);
}
function axisBottom(v93) {
  return axis(bottom, v93);
}
const radians = Math.PI / 180;
const degrees = 180 / Math.PI;
const K = 18;
const Xn = 0.96422;
const Yn = 1;
const Zn = 0.82521;
const t0$1 = 4 / 29;
const t1$1 = 6 / 29;
const t2 = t1$1 * 3 * t1$1;
const t3 = t1$1 * t1$1 * t1$1;
function labConvert(v94) {
  if (v94 instanceof Lab) {
    return new Lab(v94.l, v94.a, v94.b, v94.opacity);
  }
  if (v94 instanceof Hcl) {
    return hcl2lab(v94);
  }
  if (!(v94 instanceof v1)) {
    v94 = v2(v94);
  }
  var v95 = rgb2lrgb(v94.r);
  var v96 = rgb2lrgb(v94.g);
  var v97 = rgb2lrgb(v94.b);
  var v98 = xyz2lab((v95 * 0.2225045 + v96 * 0.7168786 + v97 * 0.0606169) / Yn);
  var v99;
  var v100;
  if (v95 === v96 && v96 === v97) {
    v99 = v100 = v98;
  } else {
    v99 = xyz2lab((v95 * 0.4360747 + v96 * 0.3850649 + v97 * 0.1430804) / Xn);
    v100 = xyz2lab((v95 * 0.0139322 + v96 * 0.0971045 + v97 * 0.7141733) / Zn);
  }
  return new Lab(v98 * 116 - 16, (v99 - v98) * 500, (v98 - v100) * 200, v94.opacity);
}
function lab(v101, v102, v103, v104) {
  if (arguments.length === 1) {
    return labConvert(v101);
  } else {
    return new Lab(v101, v102, v103, v104 == null ? 1 : v104);
  }
}
function Lab(v105, v106, v107, v108) {
  this.l = +v105;
  this.a = +v106;
  this.b = +v107;
  this.opacity = +v108;
}
v3(Lab, lab, v4(v5, {
  brighter(v109) {
    return new Lab(this.l + K * (v109 == null ? 1 : v109), this.a, this.b, this.opacity);
  },
  darker(v110) {
    return new Lab(this.l - K * (v110 == null ? 1 : v110), this.a, this.b, this.opacity);
  },
  rgb() {
    var v111 = (this.l + 16) / 116;
    var v112 = isNaN(this.a) ? v111 : v111 + this.a / 500;
    var v113 = isNaN(this.b) ? v111 : v111 - this.b / 200;
    v112 = Xn * lab2xyz(v112);
    v111 = Yn * lab2xyz(v111);
    v113 = Zn * lab2xyz(v113);
    return new v1(lrgb2rgb(v112 * 3.1338561 - v111 * 1.6168667 - v113 * 0.4906146), lrgb2rgb(v112 * -0.9787684 + v111 * 1.9161415 + v113 * 0.033454), lrgb2rgb(v112 * 0.0719453 - v111 * 0.2289914 + v113 * 1.4052427), this.opacity);
  }
}));
function xyz2lab(v114) {
  if (v114 > t3) {
    return Math.pow(v114, 1 / 3);
  } else {
    return v114 / t2 + t0$1;
  }
}
function lab2xyz(v115) {
  if (v115 > t1$1) {
    return v115 * v115 * v115;
  } else {
    return t2 * (v115 - t0$1);
  }
}
function lrgb2rgb(v116) {
  return (v116 <= 0.0031308 ? v116 * 12.92 : Math.pow(v116, 1 / 2.4) * 1.055 - 0.055) * 255;
}
function rgb2lrgb(v117) {
  if ((v117 /= 255) <= 0.04045) {
    return v117 / 12.92;
  } else {
    return Math.pow((v117 + 0.055) / 1.055, 2.4);
  }
}
function hclConvert(v118) {
  if (v118 instanceof Hcl) {
    return new Hcl(v118.h, v118.c, v118.l, v118.opacity);
  }
  if (!(v118 instanceof Lab)) {
    v118 = labConvert(v118);
  }
  if (v118.a === 0 && v118.b === 0) {
    return new Hcl(NaN, v118.l > 0 && v118.l < 100 ? 0 : NaN, v118.l, v118.opacity);
  }
  var v119 = Math.atan2(v118.b, v118.a) * degrees;
  return new Hcl(v119 < 0 ? v119 + 360 : v119, Math.sqrt(v118.a * v118.a + v118.b * v118.b), v118.l, v118.opacity);
}
function hcl$1(v120, v121, v122, v123) {
  if (arguments.length === 1) {
    return hclConvert(v120);
  } else {
    return new Hcl(v120, v121, v122, v123 == null ? 1 : v123);
  }
}
function Hcl(v124, v125, v126, v127) {
  this.h = +v124;
  this.c = +v125;
  this.l = +v126;
  this.opacity = +v127;
}
function hcl2lab(v128) {
  if (isNaN(v128.h)) {
    return new Lab(v128.l, 0, 0, v128.opacity);
  }
  var v129 = v128.h * radians;
  return new Lab(v128.l, Math.cos(v129) * v128.c, Math.sin(v129) * v128.c, v128.opacity);
}
v3(Hcl, hcl$1, v4(v5, {
  brighter(v130) {
    return new Hcl(this.h, this.c, this.l + K * (v130 == null ? 1 : v130), this.opacity);
  },
  darker(v131) {
    return new Hcl(this.h, this.c, this.l - K * (v131 == null ? 1 : v131), this.opacity);
  },
  rgb() {
    return hcl2lab(this).rgb();
  }
}));
function hcl(v132) {
  return function (v133, v134) {
    var v135 = v132((v133 = hcl$1(v133)).h, (v134 = hcl$1(v134)).h);
    var v136 = v6(v133.c, v134.c);
    var v137 = v6(v133.l, v134.l);
    var v138 = v6(v133.opacity, v134.opacity);
    return function (v139) {
      v133.h = v135(v139);
      v133.c = v136(v139);
      v133.l = v137(v139);
      v133.opacity = v138(v139);
      return v133 + "";
    };
  };
}
const interpolateHcl = hcl(v7);
function nice(v140, v141) {
  v140 = v140.slice();
  var v142 = 0;
  var v143 = v140.length - 1;
  var v144 = v140[v142];
  var v145 = v140[v143];
  var v146;
  if (v145 < v144) {
    v146 = v142;
    v142 = v143;
    v143 = v146;
    v146 = v144;
    v144 = v145;
    v145 = v146;
  }
  v140[v142] = v141.floor(v144);
  v140[v143] = v141.ceil(v145);
  return v140;
}
const t0 = new Date();
const t1 = new Date();
function timeInterval(v147, v148, v149, v150) {
  function v151(v152) {
    v147(v152 = arguments.length === 0 ? new Date() : new Date(+v152));
    return v152;
  }
  v151.floor = v153 => {
    v147(v153 = new Date(+v153));
    return v153;
  };
  v151.ceil = v154 => {
    v147(v154 = new Date(v154 - 1));
    v148(v154, 1);
    v147(v154);
    return v154;
  };
  v151.round = v155 => {
    const v156 = v151(v155);
    const v157 = v151.ceil(v155);
    if (v155 - v156 < v157 - v155) {
      return v156;
    } else {
      return v157;
    }
  };
  v151.offset = (v158, v159) => {
    v148(v158 = new Date(+v158), v159 == null ? 1 : Math.floor(v159));
    return v158;
  };
  v151.range = (v160, v161, v162) => {
    const v163 = [];
    v160 = v151.ceil(v160);
    v162 = v162 == null ? 1 : Math.floor(v162);
    if (!(v160 < v161) || !(v162 > 0)) {
      return v163;
    }
    let v164;
    do {
      v163.push(v164 = new Date(+v160));
      v148(v160, v162);
      v147(v160);
    } while (v164 < v160 && v160 < v161);
    return v163;
  };
  v151.filter = v165 => {
    return timeInterval(v166 => {
      if (v166 >= v166) {
        while (v147(v166), !v165(v166)) {
          v166.setTime(v166 - 1);
        }
      }
    }, (v167, v168) => {
      if (v167 >= v167) {
        if (v168 < 0) {
          while (++v168 <= 0) {
            while (v148(v167, -1), !v165(v167)) {}
          }
        } else {
          while (--v168 >= 0) {
            while (v148(v167, 1), !v165(v167)) {}
          }
        }
      }
    });
  };
  if (v149) {
    v151.count = (v169, v170) => {
      t0.setTime(+v169);
      t1.setTime(+v170);
      v147(t0);
      v147(t1);
      return Math.floor(v149(t0, t1));
    };
    v151.every = v171 => {
      v171 = Math.floor(v171);
      if (!isFinite(v171) || !(v171 > 0)) {
        return null;
      } else if (!(v171 > 1)) {
        return v151;
      } else {
        return v151.filter(v150 ? v172 => v150(v172) % v171 === 0 : v173 => v151.count(0, v173) % v171 === 0);
      }
    };
  }
  return v151;
}
const millisecond = timeInterval(() => {}, (v174, v175) => {
  v174.setTime(+v174 + v175);
}, (v176, v177) => {
  return v177 - v176;
});
millisecond.every = v178 => {
  v178 = Math.floor(v178);
  if (!isFinite(v178) || !(v178 > 0)) {
    return null;
  }
  if (!(v178 > 1)) {
    return millisecond;
  }
  return timeInterval(v179 => {
    v179.setTime(Math.floor(v179 / v178) * v178);
  }, (v180, v181) => {
    v180.setTime(+v180 + v181 * v178);
  }, (v182, v183) => {
    return (v183 - v182) / v178;
  });
};
millisecond.range;
const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;
const second = timeInterval(v184 => {
  v184.setTime(v184 - v184.getMilliseconds());
}, (v185, v186) => {
  v185.setTime(+v185 + v186 * durationSecond);
}, (v187, v188) => {
  return (v188 - v187) / durationSecond;
}, v189 => {
  return v189.getUTCSeconds();
});
second.range;
const timeMinute = timeInterval(v190 => {
  v190.setTime(v190 - v190.getMilliseconds() - v190.getSeconds() * durationSecond);
}, (v191, v192) => {
  v191.setTime(+v191 + v192 * durationMinute);
}, (v193, v194) => {
  return (v194 - v193) / durationMinute;
}, v195 => {
  return v195.getMinutes();
});
timeMinute.range;
const utcMinute = timeInterval(v196 => {
  v196.setUTCSeconds(0, 0);
}, (v197, v198) => {
  v197.setTime(+v197 + v198 * durationMinute);
}, (v199, v200) => {
  return (v200 - v199) / durationMinute;
}, v201 => {
  return v201.getUTCMinutes();
});
utcMinute.range;
const timeHour = timeInterval(v202 => {
  v202.setTime(v202 - v202.getMilliseconds() - v202.getSeconds() * durationSecond - v202.getMinutes() * durationMinute);
}, (v203, v204) => {
  v203.setTime(+v203 + v204 * durationHour);
}, (v205, v206) => {
  return (v206 - v205) / durationHour;
}, v207 => {
  return v207.getHours();
});
timeHour.range;
const utcHour = timeInterval(v208 => {
  v208.setUTCMinutes(0, 0, 0);
}, (v209, v210) => {
  v209.setTime(+v209 + v210 * durationHour);
}, (v211, v212) => {
  return (v212 - v211) / durationHour;
}, v213 => {
  return v213.getUTCHours();
});
utcHour.range;
const timeDay = timeInterval(v214 => v214.setHours(0, 0, 0, 0), (v215, v216) => v215.setDate(v215.getDate() + v216), (v217, v218) => (v218 - v217 - (v218.getTimezoneOffset() - v217.getTimezoneOffset()) * durationMinute) / durationDay, v219 => v219.getDate() - 1);
timeDay.range;
const utcDay = timeInterval(v220 => {
  v220.setUTCHours(0, 0, 0, 0);
}, (v221, v222) => {
  v221.setUTCDate(v221.getUTCDate() + v222);
}, (v223, v224) => {
  return (v224 - v223) / durationDay;
}, v225 => {
  return v225.getUTCDate() - 1;
});
utcDay.range;
const unixDay = timeInterval(v226 => {
  v226.setUTCHours(0, 0, 0, 0);
}, (v227, v228) => {
  v227.setUTCDate(v227.getUTCDate() + v228);
}, (v229, v230) => {
  return (v230 - v229) / durationDay;
}, v231 => {
  return Math.floor(v231 / durationDay);
});
unixDay.range;
function timeWeekday(v232) {
  return timeInterval(v233 => {
    v233.setDate(v233.getDate() - (v233.getDay() + 7 - v232) % 7);
    v233.setHours(0, 0, 0, 0);
  }, (v234, v235) => {
    v234.setDate(v234.getDate() + v235 * 7);
  }, (v236, v237) => {
    return (v237 - v236 - (v237.getTimezoneOffset() - v236.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
const timeSunday = timeWeekday(0);
const timeMonday = timeWeekday(1);
const timeTuesday = timeWeekday(2);
const timeWednesday = timeWeekday(3);
const timeThursday = timeWeekday(4);
const timeFriday = timeWeekday(5);
const timeSaturday = timeWeekday(6);
timeSunday.range;
timeMonday.range;
timeTuesday.range;
timeWednesday.range;
timeThursday.range;
timeFriday.range;
timeSaturday.range;
function utcWeekday(v238) {
  return timeInterval(v239 => {
    v239.setUTCDate(v239.getUTCDate() - (v239.getUTCDay() + 7 - v238) % 7);
    v239.setUTCHours(0, 0, 0, 0);
  }, (v240, v241) => {
    v240.setUTCDate(v240.getUTCDate() + v241 * 7);
  }, (v242, v243) => {
    return (v243 - v242) / durationWeek;
  });
}
const utcSunday = utcWeekday(0);
const utcMonday = utcWeekday(1);
const utcTuesday = utcWeekday(2);
const utcWednesday = utcWeekday(3);
const utcThursday = utcWeekday(4);
const utcFriday = utcWeekday(5);
const utcSaturday = utcWeekday(6);
utcSunday.range;
utcMonday.range;
utcTuesday.range;
utcWednesday.range;
utcThursday.range;
utcFriday.range;
utcSaturday.range;
const timeMonth = timeInterval(v244 => {
  v244.setDate(1);
  v244.setHours(0, 0, 0, 0);
}, (v245, v246) => {
  v245.setMonth(v245.getMonth() + v246);
}, (v247, v248) => {
  return v248.getMonth() - v247.getMonth() + (v248.getFullYear() - v247.getFullYear()) * 12;
}, v249 => {
  return v249.getMonth();
});
timeMonth.range;
const utcMonth = timeInterval(v250 => {
  v250.setUTCDate(1);
  v250.setUTCHours(0, 0, 0, 0);
}, (v251, v252) => {
  v251.setUTCMonth(v251.getUTCMonth() + v252);
}, (v253, v254) => {
  return v254.getUTCMonth() - v253.getUTCMonth() + (v254.getUTCFullYear() - v253.getUTCFullYear()) * 12;
}, v255 => {
  return v255.getUTCMonth();
});
utcMonth.range;
const timeYear = timeInterval(v256 => {
  v256.setMonth(0, 1);
  v256.setHours(0, 0, 0, 0);
}, (v257, v258) => {
  v257.setFullYear(v257.getFullYear() + v258);
}, (v259, v260) => {
  return v260.getFullYear() - v259.getFullYear();
}, v261 => {
  return v261.getFullYear();
});
timeYear.every = v262 => {
  if (!isFinite(v262 = Math.floor(v262)) || !(v262 > 0)) {
    return null;
  } else {
    return timeInterval(v263 => {
      v263.setFullYear(Math.floor(v263.getFullYear() / v262) * v262);
      v263.setMonth(0, 1);
      v263.setHours(0, 0, 0, 0);
    }, (v264, v265) => {
      v264.setFullYear(v264.getFullYear() + v265 * v262);
    });
  }
};
timeYear.range;
const utcYear = timeInterval(v266 => {
  v266.setUTCMonth(0, 1);
  v266.setUTCHours(0, 0, 0, 0);
}, (v267, v268) => {
  v267.setUTCFullYear(v267.getUTCFullYear() + v268);
}, (v269, v270) => {
  return v270.getUTCFullYear() - v269.getUTCFullYear();
}, v271 => {
  return v271.getUTCFullYear();
});
utcYear.every = v272 => {
  if (!isFinite(v272 = Math.floor(v272)) || !(v272 > 0)) {
    return null;
  } else {
    return timeInterval(v273 => {
      v273.setUTCFullYear(Math.floor(v273.getUTCFullYear() / v272) * v272);
      v273.setUTCMonth(0, 1);
      v273.setUTCHours(0, 0, 0, 0);
    }, (v274, v275) => {
      v274.setUTCFullYear(v274.getUTCFullYear() + v275 * v272);
    });
  }
};
utcYear.range;
function ticker(v276, v277, v278, v279, v280, v281) {
  const v282 = [[second, 1, durationSecond], [second, 5, durationSecond * 5], [second, 15, durationSecond * 15], [second, 30, durationSecond * 30], [v281, 1, durationMinute], [v281, 5, durationMinute * 5], [v281, 15, durationMinute * 15], [v281, 30, durationMinute * 30], [v280, 1, durationHour], [v280, 3, durationHour * 3], [v280, 6, durationHour * 6], [v280, 12, durationHour * 12], [v279, 1, durationDay], [v279, 2, durationDay * 2], [v278, 1, durationWeek], [v277, 1, durationMonth], [v277, 3, durationMonth * 3], [v276, 1, durationYear]];
  function v283(v284, v285, v286) {
    const v287 = v285 < v284;
    if (v287) {
      [v284, v285] = [v285, v284];
    }
    const v288 = v286 && typeof v286.range === "function" ? v286 : v289(v284, v285, v286);
    const v290 = v288 ? v288.range(v284, +v285 + 1) : [];
    if (v287) {
      return v290.reverse();
    } else {
      return v290;
    }
  }
  function v289(v291, v292, v293) {
    const v294 = Math.abs(v292 - v291) / v293;
    const v295 = v25(([,, v296]) => v296).right(v282, v294);
    if (v295 === v282.length) {
      return v276.every(v26(v291 / durationYear, v292 / durationYear, v293));
    }
    if (v295 === 0) {
      return millisecond.every(Math.max(v26(v291, v292, v293), 1));
    }
    const [v297, v298] = v282[v294 / v282[v295 - 1][2] < v282[v295][2] / v294 ? v295 - 1 : v295];
    return v297.every(v298);
  }
  return [v283, v289];
}
const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);
function localDate(v299) {
  if (v299.y >= 0 && v299.y < 100) {
    var v300 = new Date(-1, v299.m, v299.d, v299.H, v299.M, v299.S, v299.L);
    v300.setFullYear(v299.y);
    return v300;
  }
  return new Date(v299.y, v299.m, v299.d, v299.H, v299.M, v299.S, v299.L);
}
function utcDate(v301) {
  if (v301.y >= 0 && v301.y < 100) {
    var v302 = new Date(Date.UTC(-1, v301.m, v301.d, v301.H, v301.M, v301.S, v301.L));
    v302.setUTCFullYear(v301.y);
    return v302;
  }
  return new Date(Date.UTC(v301.y, v301.m, v301.d, v301.H, v301.M, v301.S, v301.L));
}
function newDate(v303, v304, v305) {
  return {
    y: v303,
    m: v304,
    d: v305,
    H: 0,
    M: 0,
    S: 0,
    L: 0
  };
}
function formatLocale(v306) {
  var v307 = v306.dateTime;
  var v308 = v306.date;
  var v309 = v306.time;
  var v310 = v306.periods;
  var v311 = v306.days;
  var v312 = v306.shortDays;
  var v313 = v306.months;
  var v314 = v306.shortMonths;
  var v315 = formatRe(v310);
  var v316 = formatLookup(v310);
  var v317 = formatRe(v311);
  var v318 = formatLookup(v311);
  var v319 = formatRe(v312);
  var v320 = formatLookup(v312);
  var v321 = formatRe(v313);
  var v322 = formatLookup(v313);
  var v323 = formatRe(v314);
  var v324 = formatLookup(v314);
  var v325 = {
    a: v326,
    A: v327,
    b: v328,
    B: v329,
    c: null,
    d: formatDayOfMonth,
    e: formatDayOfMonth,
    f: formatMicroseconds,
    g: formatYearISO,
    G: formatFullYearISO,
    H: formatHour24,
    I: formatHour12,
    j: formatDayOfYear,
    L: formatMilliseconds,
    m: formatMonthNumber,
    M: formatMinutes,
    p: v330,
    q: v331,
    Q: formatUnixTimestamp,
    s: formatUnixTimestampSeconds,
    S: formatSeconds,
    u: formatWeekdayNumberMonday,
    U: formatWeekNumberSunday,
    V: formatWeekNumberISO,
    w: formatWeekdayNumberSunday,
    W: formatWeekNumberMonday,
    x: null,
    X: null,
    y: formatYear,
    Y: formatFullYear,
    Z: formatZone,
    "%": formatLiteralPercent
  };
  var v332 = {
    a: v333,
    A: v334,
    b: v335,
    B: v336,
    c: null,
    d: formatUTCDayOfMonth,
    e: formatUTCDayOfMonth,
    f: formatUTCMicroseconds,
    g: formatUTCYearISO,
    G: formatUTCFullYearISO,
    H: formatUTCHour24,
    I: formatUTCHour12,
    j: formatUTCDayOfYear,
    L: formatUTCMilliseconds,
    m: formatUTCMonthNumber,
    M: formatUTCMinutes,
    p: v337,
    q: v338,
    Q: formatUnixTimestamp,
    s: formatUnixTimestampSeconds,
    S: formatUTCSeconds,
    u: formatUTCWeekdayNumberMonday,
    U: formatUTCWeekNumberSunday,
    V: formatUTCWeekNumberISO,
    w: formatUTCWeekdayNumberSunday,
    W: formatUTCWeekNumberMonday,
    x: null,
    X: null,
    y: formatUTCYear,
    Y: formatUTCFullYear,
    Z: formatUTCZone,
    "%": formatLiteralPercent
  };
  var v339 = {
    a: v340,
    A: v341,
    b: v342,
    B: v343,
    c: v344,
    d: parseDayOfMonth,
    e: parseDayOfMonth,
    f: parseMicroseconds,
    g: parseYear,
    G: parseFullYear,
    H: parseHour24,
    I: parseHour24,
    j: parseDayOfYear,
    L: parseMilliseconds,
    m: parseMonthNumber,
    M: parseMinutes,
    p: v345,
    q: parseQuarter,
    Q: parseUnixTimestamp,
    s: parseUnixTimestampSeconds,
    S: parseSeconds,
    u: parseWeekdayNumberMonday,
    U: parseWeekNumberSunday,
    V: parseWeekNumberISO,
    w: parseWeekdayNumberSunday,
    W: parseWeekNumberMonday,
    x: v346,
    X: v347,
    y: parseYear,
    Y: parseFullYear,
    Z: parseZone,
    "%": parseLiteralPercent
  };
  v325.x = v348(v308, v325);
  v325.X = v348(v309, v325);
  v325.c = v348(v307, v325);
  v332.x = v348(v308, v332);
  v332.X = v348(v309, v332);
  v332.c = v348(v307, v332);
  function v348(v349, v350) {
    return function (v351) {
      var v352 = [];
      var v353 = -1;
      var v354 = 0;
      var v355 = v349.length;
      var v356;
      var v357;
      var v358;
      if (!(v351 instanceof Date)) {
        v351 = new Date(+v351);
      }
      while (++v353 < v355) {
        if (v349.charCodeAt(v353) === 37) {
          v352.push(v349.slice(v354, v353));
          if ((v357 = pads[v356 = v349.charAt(++v353)]) != null) {
            v356 = v349.charAt(++v353);
          } else {
            v357 = v356 === "e" ? " " : "0";
          }
          if (v358 = v350[v356]) {
            v356 = v358(v351, v357);
          }
          v352.push(v356);
          v354 = v353 + 1;
        }
      }
      v352.push(v349.slice(v354, v353));
      return v352.join("");
    };
  }
  function v359(v360, v361) {
    return function (v362) {
      var v363 = newDate(1900, undefined, 1);
      var v364 = v365(v363, v360, v362 += "", 0);
      var v366;
      var v367;
      if (v364 != v362.length) {
        return null;
      }
      if ("Q" in v363) {
        return new Date(v363.Q);
      }
      if ("s" in v363) {
        return new Date(v363.s * 1000 + ("L" in v363 ? v363.L : 0));
      }
      if (v361 && !("Z" in v363)) {
        v363.Z = 0;
      }
      if ("p" in v363) {
        v363.H = v363.H % 12 + v363.p * 12;
      }
      if (v363.m === undefined) {
        v363.m = "q" in v363 ? v363.q : 0;
      }
      if ("V" in v363) {
        if (v363.V < 1 || v363.V > 53) {
          return null;
        }
        if (!("w" in v363)) {
          v363.w = 1;
        }
        if ("Z" in v363) {
          v366 = utcDate(newDate(v363.y, 0, 1));
          v367 = v366.getUTCDay();
          v366 = v367 > 4 || v367 === 0 ? utcMonday.ceil(v366) : utcMonday(v366);
          v366 = utcDay.offset(v366, (v363.V - 1) * 7);
          v363.y = v366.getUTCFullYear();
          v363.m = v366.getUTCMonth();
          v363.d = v366.getUTCDate() + (v363.w + 6) % 7;
        } else {
          v366 = localDate(newDate(v363.y, 0, 1));
          v367 = v366.getDay();
          v366 = v367 > 4 || v367 === 0 ? timeMonday.ceil(v366) : timeMonday(v366);
          v366 = timeDay.offset(v366, (v363.V - 1) * 7);
          v363.y = v366.getFullYear();
          v363.m = v366.getMonth();
          v363.d = v366.getDate() + (v363.w + 6) % 7;
        }
      } else if ("W" in v363 || "U" in v363) {
        if (!("w" in v363)) {
          v363.w = "u" in v363 ? v363.u % 7 : "W" in v363 ? 1 : 0;
        }
        v367 = "Z" in v363 ? utcDate(newDate(v363.y, 0, 1)).getUTCDay() : localDate(newDate(v363.y, 0, 1)).getDay();
        v363.m = 0;
        v363.d = "W" in v363 ? (v363.w + 6) % 7 + v363.W * 7 - (v367 + 5) % 7 : v363.w + v363.U * 7 - (v367 + 6) % 7;
      }
      if ("Z" in v363) {
        v363.H += v363.Z / 100 | 0;
        v363.M += v363.Z % 100;
        return utcDate(v363);
      }
      return localDate(v363);
    };
  }
  function v365(v368, v369, v370, v371) {
    var v372 = 0;
    var v373 = v369.length;
    var v374 = v370.length;
    var v375;
    var v376;
    while (v372 < v373) {
      if (v371 >= v374) {
        return -1;
      }
      v375 = v369.charCodeAt(v372++);
      if (v375 === 37) {
        v375 = v369.charAt(v372++);
        v376 = v339[v375 in pads ? v369.charAt(v372++) : v375];
        if (!v376 || (v371 = v376(v368, v370, v371)) < 0) {
          return -1;
        }
      } else if (v375 != v370.charCodeAt(v371++)) {
        return -1;
      }
    }
    return v371;
  }
  function v345(v377, v378, v379) {
    var v380 = v315.exec(v378.slice(v379));
    if (v380) {
      v377.p = v316.get(v380[0].toLowerCase());
      return v379 + v380[0].length;
    } else {
      return -1;
    }
  }
  function v340(v381, v382, v383) {
    var v384 = v319.exec(v382.slice(v383));
    if (v384) {
      v381.w = v320.get(v384[0].toLowerCase());
      return v383 + v384[0].length;
    } else {
      return -1;
    }
  }
  function v341(v385, v386, v387) {
    var v388 = v317.exec(v386.slice(v387));
    if (v388) {
      v385.w = v318.get(v388[0].toLowerCase());
      return v387 + v388[0].length;
    } else {
      return -1;
    }
  }
  function v342(v389, v390, v391) {
    var v392 = v323.exec(v390.slice(v391));
    if (v392) {
      v389.m = v324.get(v392[0].toLowerCase());
      return v391 + v392[0].length;
    } else {
      return -1;
    }
  }
  function v343(v393, v394, v395) {
    var v396 = v321.exec(v394.slice(v395));
    if (v396) {
      v393.m = v322.get(v396[0].toLowerCase());
      return v395 + v396[0].length;
    } else {
      return -1;
    }
  }
  function v344(v397, v398, v399) {
    return v365(v397, v307, v398, v399);
  }
  function v346(v400, v401, v402) {
    return v365(v400, v308, v401, v402);
  }
  function v347(v403, v404, v405) {
    return v365(v403, v309, v404, v405);
  }
  function v326(v406) {
    return v312[v406.getDay()];
  }
  function v327(v407) {
    return v311[v407.getDay()];
  }
  function v328(v408) {
    return v314[v408.getMonth()];
  }
  function v329(v409) {
    return v313[v409.getMonth()];
  }
  function v330(v410) {
    return v310[+(v410.getHours() >= 12)];
  }
  function v331(v411) {
    return 1 + ~~(v411.getMonth() / 3);
  }
  function v333(v412) {
    return v312[v412.getUTCDay()];
  }
  function v334(v413) {
    return v311[v413.getUTCDay()];
  }
  function v335(v414) {
    return v314[v414.getUTCMonth()];
  }
  function v336(v415) {
    return v313[v415.getUTCMonth()];
  }
  function v337(v416) {
    return v310[+(v416.getUTCHours() >= 12)];
  }
  function v338(v417) {
    return 1 + ~~(v417.getUTCMonth() / 3);
  }
  return {
    format: function (v418) {
      var v419 = v348(v418 += "", v325);
      v419.toString = function () {
        return v418;
      };
      return v419;
    },
    parse: function (v420) {
      var v421 = v359(v420 += "", false);
      v421.toString = function () {
        return v420;
      };
      return v421;
    },
    utcFormat: function (v422) {
      var v423 = v348(v422 += "", v332);
      v423.toString = function () {
        return v422;
      };
      return v423;
    },
    utcParse: function (v424) {
      var v425 = v359(v424 += "", true);
      v425.toString = function () {
        return v424;
      };
      return v425;
    }
  };
}
var pads = {
  "-": "",
  _: " ",
  "0": "0"
};
var numberRe = /^\s*\d+/;
var percentRe = /^%/;
var requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(v426, v427, v428) {
  var v429 = v426 < 0 ? "-" : "";
  var v430 = (v429 ? -v426 : v426) + "";
  var v431 = v430.length;
  return v429 + (v431 < v428 ? new Array(v428 - v431 + 1).join(v427) + v430 : v430);
}
function requote(v432) {
  return v432.replace(requoteRe, "\\$&");
}
function formatRe(v433) {
  return new RegExp("^(?:" + v433.map(requote).join("|") + ")", "i");
}
function formatLookup(v434) {
  return new Map(v434.map((v435, v436) => [v435.toLowerCase(), v436]));
}
function parseWeekdayNumberSunday(v437, v438, v439) {
  var v440 = numberRe.exec(v438.slice(v439, v439 + 1));
  if (v440) {
    v437.w = +v440[0];
    return v439 + v440[0].length;
  } else {
    return -1;
  }
}
function parseWeekdayNumberMonday(v441, v442, v443) {
  var v444 = numberRe.exec(v442.slice(v443, v443 + 1));
  if (v444) {
    v441.u = +v444[0];
    return v443 + v444[0].length;
  } else {
    return -1;
  }
}
function parseWeekNumberSunday(v445, v446, v447) {
  var v448 = numberRe.exec(v446.slice(v447, v447 + 2));
  if (v448) {
    v445.U = +v448[0];
    return v447 + v448[0].length;
  } else {
    return -1;
  }
}
function parseWeekNumberISO(v449, v450, v451) {
  var v452 = numberRe.exec(v450.slice(v451, v451 + 2));
  if (v452) {
    v449.V = +v452[0];
    return v451 + v452[0].length;
  } else {
    return -1;
  }
}
function parseWeekNumberMonday(v453, v454, v455) {
  var v456 = numberRe.exec(v454.slice(v455, v455 + 2));
  if (v456) {
    v453.W = +v456[0];
    return v455 + v456[0].length;
  } else {
    return -1;
  }
}
function parseFullYear(v457, v458, v459) {
  var v460 = numberRe.exec(v458.slice(v459, v459 + 4));
  if (v460) {
    v457.y = +v460[0];
    return v459 + v460[0].length;
  } else {
    return -1;
  }
}
function parseYear(v461, v462, v463) {
  var v464 = numberRe.exec(v462.slice(v463, v463 + 2));
  if (v464) {
    v461.y = +v464[0] + (+v464[0] > 68 ? 1900 : 2000);
    return v463 + v464[0].length;
  } else {
    return -1;
  }
}
function parseZone(v465, v466, v467) {
  var v468 = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(v466.slice(v467, v467 + 6));
  if (v468) {
    v465.Z = v468[1] ? 0 : -(v468[2] + (v468[3] || "00"));
    return v467 + v468[0].length;
  } else {
    return -1;
  }
}
function parseQuarter(v469, v470, v471) {
  var v472 = numberRe.exec(v470.slice(v471, v471 + 1));
  if (v472) {
    v469.q = v472[0] * 3 - 3;
    return v471 + v472[0].length;
  } else {
    return -1;
  }
}
function parseMonthNumber(v473, v474, v475) {
  var v476 = numberRe.exec(v474.slice(v475, v475 + 2));
  if (v476) {
    v473.m = v476[0] - 1;
    return v475 + v476[0].length;
  } else {
    return -1;
  }
}
function parseDayOfMonth(v477, v478, v479) {
  var v480 = numberRe.exec(v478.slice(v479, v479 + 2));
  if (v480) {
    v477.d = +v480[0];
    return v479 + v480[0].length;
  } else {
    return -1;
  }
}
function parseDayOfYear(v481, v482, v483) {
  var v484 = numberRe.exec(v482.slice(v483, v483 + 3));
  if (v484) {
    v481.m = 0;
    v481.d = +v484[0];
    return v483 + v484[0].length;
  } else {
    return -1;
  }
}
function parseHour24(v485, v486, v487) {
  var v488 = numberRe.exec(v486.slice(v487, v487 + 2));
  if (v488) {
    v485.H = +v488[0];
    return v487 + v488[0].length;
  } else {
    return -1;
  }
}
function parseMinutes(v489, v490, v491) {
  var v492 = numberRe.exec(v490.slice(v491, v491 + 2));
  if (v492) {
    v489.M = +v492[0];
    return v491 + v492[0].length;
  } else {
    return -1;
  }
}
function parseSeconds(v493, v494, v495) {
  var v496 = numberRe.exec(v494.slice(v495, v495 + 2));
  if (v496) {
    v493.S = +v496[0];
    return v495 + v496[0].length;
  } else {
    return -1;
  }
}
function parseMilliseconds(v497, v498, v499) {
  var v500 = numberRe.exec(v498.slice(v499, v499 + 3));
  if (v500) {
    v497.L = +v500[0];
    return v499 + v500[0].length;
  } else {
    return -1;
  }
}
function parseMicroseconds(v501, v502, v503) {
  var v504 = numberRe.exec(v502.slice(v503, v503 + 6));
  if (v504) {
    v501.L = Math.floor(v504[0] / 1000);
    return v503 + v504[0].length;
  } else {
    return -1;
  }
}
function parseLiteralPercent(v505, v506, v507) {
  var v508 = percentRe.exec(v506.slice(v507, v507 + 1));
  if (v508) {
    return v507 + v508[0].length;
  } else {
    return -1;
  }
}
function parseUnixTimestamp(v509, v510, v511) {
  var v512 = numberRe.exec(v510.slice(v511));
  if (v512) {
    v509.Q = +v512[0];
    return v511 + v512[0].length;
  } else {
    return -1;
  }
}
function parseUnixTimestampSeconds(v513, v514, v515) {
  var v516 = numberRe.exec(v514.slice(v515));
  if (v516) {
    v513.s = +v516[0];
    return v515 + v516[0].length;
  } else {
    return -1;
  }
}
function formatDayOfMonth(v517, v518) {
  return pad(v517.getDate(), v518, 2);
}
function formatHour24(v519, v520) {
  return pad(v519.getHours(), v520, 2);
}
function formatHour12(v521, v522) {
  return pad(v521.getHours() % 12 || 12, v522, 2);
}
function formatDayOfYear(v523, v524) {
  return pad(1 + timeDay.count(timeYear(v523), v523), v524, 3);
}
function formatMilliseconds(v525, v526) {
  return pad(v525.getMilliseconds(), v526, 3);
}
function formatMicroseconds(v527, v528) {
  return formatMilliseconds(v527, v528) + "000";
}
function formatMonthNumber(v529, v530) {
  return pad(v529.getMonth() + 1, v530, 2);
}
function formatMinutes(v531, v532) {
  return pad(v531.getMinutes(), v532, 2);
}
function formatSeconds(v533, v534) {
  return pad(v533.getSeconds(), v534, 2);
}
function formatWeekdayNumberMonday(v535) {
  var v536 = v535.getDay();
  if (v536 === 0) {
    return 7;
  } else {
    return v536;
  }
}
function formatWeekNumberSunday(v537, v538) {
  return pad(timeSunday.count(timeYear(v537) - 1, v537), v538, 2);
}
function dISO(v539) {
  var v540 = v539.getDay();
  if (v540 >= 4 || v540 === 0) {
    return timeThursday(v539);
  } else {
    return timeThursday.ceil(v539);
  }
}
function formatWeekNumberISO(v541, v542) {
  v541 = dISO(v541);
  return pad(timeThursday.count(timeYear(v541), v541) + (timeYear(v541).getDay() === 4), v542, 2);
}
function formatWeekdayNumberSunday(v543) {
  return v543.getDay();
}
function formatWeekNumberMonday(v544, v545) {
  return pad(timeMonday.count(timeYear(v544) - 1, v544), v545, 2);
}
function formatYear(v546, v547) {
  return pad(v546.getFullYear() % 100, v547, 2);
}
function formatYearISO(v548, v549) {
  v548 = dISO(v548);
  return pad(v548.getFullYear() % 100, v549, 2);
}
function formatFullYear(v550, v551) {
  return pad(v550.getFullYear() % 10000, v551, 4);
}
function formatFullYearISO(v552, v553) {
  var v554 = v552.getDay();
  v552 = v554 >= 4 || v554 === 0 ? timeThursday(v552) : timeThursday.ceil(v552);
  return pad(v552.getFullYear() % 10000, v553, 4);
}
function formatZone(v555) {
  var v556 = v555.getTimezoneOffset();
  return (v556 > 0 ? "-" : (v556 *= -1, "+")) + pad(v556 / 60 | 0, "0", 2) + pad(v556 % 60, "0", 2);
}
function formatUTCDayOfMonth(v557, v558) {
  return pad(v557.getUTCDate(), v558, 2);
}
function formatUTCHour24(v559, v560) {
  return pad(v559.getUTCHours(), v560, 2);
}
function formatUTCHour12(v561, v562) {
  return pad(v561.getUTCHours() % 12 || 12, v562, 2);
}
function formatUTCDayOfYear(v563, v564) {
  return pad(1 + utcDay.count(utcYear(v563), v563), v564, 3);
}
function formatUTCMilliseconds(v565, v566) {
  return pad(v565.getUTCMilliseconds(), v566, 3);
}
function formatUTCMicroseconds(v567, v568) {
  return formatUTCMilliseconds(v567, v568) + "000";
}
function formatUTCMonthNumber(v569, v570) {
  return pad(v569.getUTCMonth() + 1, v570, 2);
}
function formatUTCMinutes(v571, v572) {
  return pad(v571.getUTCMinutes(), v572, 2);
}
function formatUTCSeconds(v573, v574) {
  return pad(v573.getUTCSeconds(), v574, 2);
}
function formatUTCWeekdayNumberMonday(v575) {
  var v576 = v575.getUTCDay();
  if (v576 === 0) {
    return 7;
  } else {
    return v576;
  }
}
function formatUTCWeekNumberSunday(v577, v578) {
  return pad(utcSunday.count(utcYear(v577) - 1, v577), v578, 2);
}
function UTCdISO(v579) {
  var v580 = v579.getUTCDay();
  if (v580 >= 4 || v580 === 0) {
    return utcThursday(v579);
  } else {
    return utcThursday.ceil(v579);
  }
}
function formatUTCWeekNumberISO(v581, v582) {
  v581 = UTCdISO(v581);
  return pad(utcThursday.count(utcYear(v581), v581) + (utcYear(v581).getUTCDay() === 4), v582, 2);
}
function formatUTCWeekdayNumberSunday(v583) {
  return v583.getUTCDay();
}
function formatUTCWeekNumberMonday(v584, v585) {
  return pad(utcMonday.count(utcYear(v584) - 1, v584), v585, 2);
}
function formatUTCYear(v586, v587) {
  return pad(v586.getUTCFullYear() % 100, v587, 2);
}
function formatUTCYearISO(v588, v589) {
  v588 = UTCdISO(v588);
  return pad(v588.getUTCFullYear() % 100, v589, 2);
}
function formatUTCFullYear(v590, v591) {
  return pad(v590.getUTCFullYear() % 10000, v591, 4);
}
function formatUTCFullYearISO(v592, v593) {
  var v594 = v592.getUTCDay();
  v592 = v594 >= 4 || v594 === 0 ? utcThursday(v592) : utcThursday.ceil(v592);
  return pad(v592.getUTCFullYear() % 10000, v593, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(v595) {
  return +v595;
}
function formatUnixTimestampSeconds(v596) {
  return Math.floor(+v596 / 1000);
}
var locale;
var timeFormat;
defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale(v597) {
  locale = formatLocale(v597);
  timeFormat = locale.format;
  locale.parse;
  locale.utcFormat;
  locale.utcParse;
  return locale;
}
function date(v598) {
  return new Date(v598);
}
function number(v599) {
  if (v599 instanceof Date) {
    return +v599;
  } else {
    return +new Date(+v599);
  }
}
function calendar(v600, v601, v602, v603, v604, v605, v606, v607, v608, v609) {
  var v610 = v27();
  var v611 = v610.invert;
  var v612 = v610.domain;
  var v613 = v609(".%L");
  var v614 = v609(":%S");
  var v615 = v609("%I:%M");
  var v616 = v609("%I %p");
  var v617 = v609("%a %d");
  var v618 = v609("%b %d");
  var v619 = v609("%B");
  var v620 = v609("%Y");
  function v621(v622) {
    return (v608(v622) < v622 ? v613 : v607(v622) < v622 ? v614 : v606(v622) < v622 ? v615 : v605(v622) < v622 ? v616 : v603(v622) < v622 ? v604(v622) < v622 ? v617 : v618 : v602(v622) < v622 ? v619 : v620)(v622);
  }
  v610.invert = function (v623) {
    return new Date(v611(v623));
  };
  v610.domain = function (v624) {
    if (arguments.length) {
      return v612(Array.from(v624, number));
    } else {
      return v612().map(date);
    }
  };
  v610.ticks = function (v625) {
    var v626 = v612();
    return v600(v626[0], v626[v626.length - 1], v625 == null ? 10 : v625);
  };
  v610.tickFormat = function (v627, v628) {
    if (v628 == null) {
      return v621;
    } else {
      return v609(v628);
    }
  };
  v610.nice = function (v629) {
    var v630 = v612();
    if (!v629 || typeof v629.range !== "function") {
      v629 = v601(v630[0], v630[v630.length - 1], v629 == null ? 10 : v629);
    }
    if (v629) {
      return v612(nice(v630, v629));
    } else {
      return v610;
    }
  };
  v610.copy = function () {
    return v28(v610, calendar(v600, v601, v602, v603, v604, v605, v606, v607, v608, v609));
  };
  return v610;
}
function time() {
  return v30.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments);
}
var isoWeek$1 = {
  exports: {}
};
var isoWeek = isoWeek$1.exports;
var hasRequiredIsoWeek;
function requireIsoWeek() {
  if (hasRequiredIsoWeek) {
    return isoWeek$1.exports;
  }
  hasRequiredIsoWeek = 1;
  (function (v631, v632) {
    (function (v633, v634) {
      v631.exports = v634();
    })(isoWeek, function () {
      var v635 = "day";
      return function (v636, v637, v638) {
        function v639(v640) {
          return v640.add(4 - v640.isoWeekday(), v635);
        }
        var v641 = v637.prototype;
        v641.isoWeekYear = function () {
          return v639(this).year();
        };
        v641.isoWeek = function (v642) {
          if (!this.$utils().u(v642)) {
            return this.add((v642 - this.isoWeek()) * 7, v635);
          }
          var v643;
          var v644;
          var v645;
          var v646;
          var v647 = v639(this);
          v643 = this.isoWeekYear();
          v644 = this.$u;
          v645 = (v644 ? v638.utc : v638)().year(v643).startOf("year");
          v646 = 4 - v645.isoWeekday();
          if (v645.isoWeekday() > 4) {
            v646 += 7;
          }
          var v648 = v645.add(v646, v635);
          return v647.diff(v648, "week") + 1;
        };
        v641.isoWeekday = function (v649) {
          if (this.$utils().u(v649)) {
            return this.day() || 7;
          } else {
            return this.day(this.day() % 7 ? v649 : v649 - 7);
          }
        };
        var v650 = v641.startOf;
        v641.startOf = function (v651, v652) {
          var v653 = this.$utils();
          var v654 = !!v653.u(v652) || v652;
          if (v653.p(v651) === "isoweek") {
            if (v654) {
              return this.date(this.date() - (this.isoWeekday() - 1)).startOf("day");
            } else {
              return this.date(this.date() - 1 - (this.isoWeekday() - 1) + 7).endOf("day");
            }
          } else {
            return v650.bind(this)(v651, v652);
          }
        };
      };
    });
  })(isoWeek$1);
  return isoWeek$1.exports;
}
var isoWeekExports = requireIsoWeek();
const dayjsIsoWeek = v8(isoWeekExports);
var customParseFormat$1 = {
  exports: {}
};
var customParseFormat = customParseFormat$1.exports;
var hasRequiredCustomParseFormat;
function requireCustomParseFormat() {
  if (hasRequiredCustomParseFormat) {
    return customParseFormat$1.exports;
  }
  hasRequiredCustomParseFormat = 1;
  (function (v655, v656) {
    (function (v657, v658) {
      v655.exports = v658();
    })(customParseFormat, function () {
      var v659 = {
        LTS: "h:mm:ss A",
        LT: "h:mm A",
        L: "MM/DD/YYYY",
        LL: "MMMM D, YYYY",
        LLL: "MMMM D, YYYY h:mm A",
        LLLL: "dddd, MMMM D, YYYY h:mm A"
      };
      var v660 = /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g;
      var v661 = /\d/;
      var v662 = /\d\d/;
      var v663 = /\d\d?/;
      var v664 = /\d*[^-_:/,()\s\d]+/;
      var v665 = {};
      function v666(v667) {
        return (v667 = +v667) + (v667 > 68 ? 1900 : 2000);
      }
      function v668(v669) {
        return function (v670) {
          this[v669] = +v670;
        };
      }
      var v671 = [/[+-]\d\d:?(\d\d)?|Z/, function (v672) {
        (this.zone ||= {}).offset = function (v673) {
          if (!v673) {
            return 0;
          }
          if (v673 === "Z") {
            return 0;
          }
          var v674 = v673.match(/([+-]|\d\d)/g);
          var v675 = v674[1] * 60 + (+v674[2] || 0);
          if (v675 === 0) {
            return 0;
          } else if (v674[0] === "+") {
            return -v675;
          } else {
            return v675;
          }
        }(v672);
      }];
      function v676(v677) {
        var v678 = v665[v677];
        return v678 && (v678.indexOf ? v678 : v678.s.concat(v678.f));
      }
      function v679(v680, v681) {
        var v682;
        var v683 = v665.meridiem;
        if (v683) {
          for (var v684 = 1; v684 <= 24; v684 += 1) {
            if (v680.indexOf(v683(v684, 0, v681)) > -1) {
              v682 = v684 > 12;
              break;
            }
          }
        } else {
          v682 = v680 === (v681 ? "pm" : "PM");
        }
        return v682;
      }
      var v685 = {
        A: [v664, function (v686) {
          this.afternoon = v679(v686, false);
        }],
        a: [v664, function (v687) {
          this.afternoon = v679(v687, true);
        }],
        Q: [v661, function (v688) {
          this.month = (v688 - 1) * 3 + 1;
        }],
        S: [v661, function (v689) {
          this.milliseconds = +v689 * 100;
        }],
        SS: [v662, function (v690) {
          this.milliseconds = +v690 * 10;
        }],
        SSS: [/\d{3}/, function (v691) {
          this.milliseconds = +v691;
        }],
        s: [v663, v668("seconds")],
        ss: [v663, v668("seconds")],
        m: [v663, v668("minutes")],
        mm: [v663, v668("minutes")],
        H: [v663, v668("hours")],
        h: [v663, v668("hours")],
        HH: [v663, v668("hours")],
        hh: [v663, v668("hours")],
        D: [v663, v668("day")],
        DD: [v662, v668("day")],
        Do: [v664, function (v692) {
          var v693 = v665.ordinal;
          var v694 = v692.match(/\d+/);
          this.day = v694[0];
          if (v693) {
            for (var v695 = 1; v695 <= 31; v695 += 1) {
              if (v693(v695).replace(/\[|\]/g, "") === v692) {
                this.day = v695;
              }
            }
          }
        }],
        w: [v663, v668("week")],
        ww: [v662, v668("week")],
        M: [v663, v668("month")],
        MM: [v662, v668("month")],
        MMM: [v664, function (v696) {
          var v697 = v676("months");
          var v698 = (v676("monthsShort") || v697.map(function (v699) {
            return v699.slice(0, 3);
          })).indexOf(v696) + 1;
          if (v698 < 1) {
            throw new Error();
          }
          this.month = v698 % 12 || v698;
        }],
        MMMM: [v664, function (v700) {
          var v701 = v676("months").indexOf(v700) + 1;
          if (v701 < 1) {
            throw new Error();
          }
          this.month = v701 % 12 || v701;
        }],
        Y: [/[+-]?\d+/, v668("year")],
        YY: [v662, function (v702) {
          this.year = v666(v702);
        }],
        YYYY: [/\d{4}/, v668("year")],
        Z: v671,
        ZZ: v671
      };
      function v703(v704) {
        var v705;
        var v706;
        v705 = v704;
        v706 = v665 && v665.formats;
        var v707 = (v704 = v705.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, function (v708, v709, v710) {
          var v711 = v710 && v710.toUpperCase();
          return v709 || v706[v710] || v659[v710] || v706[v711].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, function (v712, v713, v714) {
            return v713 || v714.slice(1);
          });
        })).match(v660);
        for (var v715 = v707.length, v716 = 0; v716 < v715; v716 += 1) {
          var v717 = v707[v716];
          var v718 = v685[v717];
          var v719 = v718 && v718[0];
          var v720 = v718 && v718[1];
          v707[v716] = v720 ? {
            regex: v719,
            parser: v720
          } : v717.replace(/^\[|\]$/g, "");
        }
        return function (v721) {
          var v722 = {};
          for (var v723 = 0, v724 = 0; v723 < v715; v723 += 1) {
            var v725 = v707[v723];
            if (typeof v725 == "string") {
              v724 += v725.length;
            } else {
              var v726 = v725.regex;
              var v727 = v725.parser;
              var v728 = v721.slice(v724);
              var v729 = v726.exec(v728)[0];
              v727.call(v722, v729);
              v721 = v721.replace(v729, "");
            }
          }
          (function (v730) {
            var v731 = v730.afternoon;
            if (v731 !== undefined) {
              var v732 = v730.hours;
              if (v731) {
                if (v732 < 12) {
                  v730.hours += 12;
                }
              } else if (v732 === 12) {
                v730.hours = 0;
              }
              delete v730.afternoon;
            }
          })(v722);
          return v722;
        };
      }
      return function (v733, v734, v735) {
        v735.p.customParseFormat = true;
        if (v733 && v733.parseTwoDigitYear) {
          v666 = v733.parseTwoDigitYear;
        }
        var v736 = v734.prototype;
        var v737 = v736.parse;
        v736.parse = function (v738) {
          var v739 = v738.date;
          var v740 = v738.utc;
          var v741 = v738.args;
          this.$u = v740;
          var v742 = v741[1];
          if (typeof v742 == "string") {
            var v743 = v741[2] === true;
            var v744 = v741[3] === true;
            var v745 = v743 || v744;
            var v746 = v741[2];
            if (v744) {
              v746 = v741[2];
            }
            v665 = this.$locale();
            if (!v743 && v746) {
              v665 = v735.Ls[v746];
            }
            this.$d = function (v747, v748, v749, v750) {
              try {
                if (["x", "X"].indexOf(v748) > -1) {
                  return new Date((v748 === "X" ? 1000 : 1) * v747);
                }
                var v751 = v703(v748)(v747);
                var v752 = v751.year;
                var v753 = v751.month;
                var v754 = v751.day;
                var v755 = v751.hours;
                var v756 = v751.minutes;
                var v757 = v751.seconds;
                var v758 = v751.milliseconds;
                var v759 = v751.zone;
                var v760 = v751.week;
                var v761 = new Date();
                var v762 = v754 || (v752 || v753 ? 1 : v761.getDate());
                var v763 = v752 || v761.getFullYear();
                var v764 = 0;
                if (!v752 || !!v753) {
                  v764 = v753 > 0 ? v753 - 1 : v761.getMonth();
                }
                var v765;
                var v766 = v755 || 0;
                var v767 = v756 || 0;
                var v768 = v757 || 0;
                var v769 = v758 || 0;
                if (v759) {
                  return new Date(Date.UTC(v763, v764, v762, v766, v767, v768, v769 + v759.offset * 60 * 1000));
                } else if (v749) {
                  return new Date(Date.UTC(v763, v764, v762, v766, v767, v768, v769));
                } else {
                  v765 = new Date(v763, v764, v762, v766, v767, v768, v769);
                  if (v760) {
                    v765 = v750(v765).week(v760).toDate();
                  }
                  return v765;
                }
              } catch (v770) {
                return new Date("");
              }
            }(v739, v742, v740, v735);
            this.init();
            if (v746 && v746 !== true) {
              this.$L = this.locale(v746).$L;
            }
            if (v745 && v739 != this.format(v742)) {
              this.$d = new Date("");
            }
            v665 = {};
          } else if (v742 instanceof Array) {
            for (var v771 = v742.length, v772 = 1; v772 <= v771; v772 += 1) {
              v741[1] = v742[v772 - 1];
              var v773 = v735.apply(this, v741);
              if (v773.isValid()) {
                this.$d = v773.$d;
                this.$L = v773.$L;
                this.init();
                break;
              }
              if (v772 === v771) {
                this.$d = new Date("");
              }
            }
          } else {
            v737.call(this, v738);
          }
        };
      };
    });
  })(customParseFormat$1);
  return customParseFormat$1.exports;
}
var customParseFormatExports = requireCustomParseFormat();
const dayjsCustomParseFormat = v8(customParseFormatExports);
var advancedFormat$1 = {
  exports: {}
};
var advancedFormat = advancedFormat$1.exports;
var hasRequiredAdvancedFormat;
function requireAdvancedFormat() {
  if (hasRequiredAdvancedFormat) {
    return advancedFormat$1.exports;
  }
  hasRequiredAdvancedFormat = 1;
  (function (v774, v775) {
    (function (v776, v777) {
      v774.exports = v777();
    })(advancedFormat, function () {
      return function (v778, v779) {
        var v780 = v779.prototype;
        var v781 = v780.format;
        v780.format = function (v782) {
          var v783 = this;
          var v784 = this.$locale();
          if (!this.isValid()) {
            return v781.bind(this)(v782);
          }
          var v785 = this.$utils();
          var v786 = (v782 || "YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g, function (v787) {
            switch (v787) {
              case "Q":
                return Math.ceil((v783.$M + 1) / 3);
              case "Do":
                return v784.ordinal(v783.$D);
              case "gggg":
                return v783.weekYear();
              case "GGGG":
                return v783.isoWeekYear();
              case "wo":
                return v784.ordinal(v783.week(), "W");
              case "w":
              case "ww":
                return v785.s(v783.week(), v787 === "w" ? 1 : 2, "0");
              case "W":
              case "WW":
                return v785.s(v783.isoWeek(), v787 === "W" ? 1 : 2, "0");
              case "k":
              case "kk":
                return v785.s(String(v783.$H === 0 ? 24 : v783.$H), v787 === "k" ? 1 : 2, "0");
              case "X":
                return Math.floor(v783.$d.getTime() / 1000);
              case "x":
                return v783.$d.getTime();
              case "z":
                return "[" + v783.offsetName() + "]";
              case "zzz":
                return "[" + v783.offsetName("long") + "]";
              default:
                return v787;
            }
          });
          return v781.bind(this)(v786);
        };
      };
    });
  })(advancedFormat$1);
  return advancedFormat$1.exports;
}
var advancedFormatExports = requireAdvancedFormat();
const dayjsAdvancedFormat = v8(advancedFormatExports);
var duration$1 = {
  exports: {}
};
var duration = duration$1.exports;
var hasRequiredDuration;
function requireDuration() {
  if (hasRequiredDuration) {
    return duration$1.exports;
  }
  hasRequiredDuration = 1;
  (function (v788, v789) {
    (function (v790, v791) {
      v788.exports = v791();
    })(duration, function () {
      var v792;
      var v793;
      var v794 = 1000;
      var v795 = 60000;
      var v796 = 3600000;
      var v797 = 86400000;
      var v798 = 31536000000;
      var v799 = 2628000000;
      var v800 = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
      var v801 = /\[([^\]]+)]|YYYY|YY|Y|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|SSS/g;
      var v802 = {
        years: v798,
        months: v799,
        days: v797,
        hours: v796,
        minutes: v795,
        seconds: v794,
        milliseconds: 1,
        weeks: 604800000
      };
      function v803(v804) {
        return v804 instanceof v805;
      }
      function v806(v807, v808, v809) {
        return new v805(v807, v809, v808.$l);
      }
      function v810(v811) {
        return v793.p(v811) + "s";
      }
      function v812(v813) {
        return v813 < 0;
      }
      function v814(v815) {
        if (v812(v815)) {
          return Math.ceil(v815);
        } else {
          return Math.floor(v815);
        }
      }
      function v816(v817) {
        return Math.abs(v817);
      }
      function v818(v819, v820) {
        if (v819) {
          if (v812(v819)) {
            return {
              negative: true,
              format: "" + v816(v819) + v820
            };
          } else {
            return {
              negative: false,
              format: "" + v819 + v820
            };
          }
        } else {
          return {
            negative: false,
            format: ""
          };
        }
      }
      var v805 = function () {
        function v821(v822, v823, v824) {
          var v825 = this;
          this.$d = {};
          this.$l = v824;
          if (v822 === undefined) {
            this.$ms = 0;
            this.parseFromMilliseconds();
          }
          if (v823) {
            return v806(v822 * v802[v810(v823)], this);
          }
          if (typeof v822 == "number") {
            this.$ms = v822;
            this.parseFromMilliseconds();
            return this;
          }
          if (typeof v822 == "object") {
            Object.keys(v822).forEach(function (v826) {
              v825.$d[v810(v826)] = v822[v826];
            });
            this.calMilliseconds();
            return this;
          }
          if (typeof v822 == "string") {
            var v827 = v822.match(v800);
            if (v827) {
              var v828 = v827.slice(2).map(function (v829) {
                if (v829 != null) {
                  return Number(v829);
                } else {
                  return 0;
                }
              });
              this.$d.years = v828[0];
              this.$d.months = v828[1];
              this.$d.weeks = v828[2];
              this.$d.days = v828[3];
              this.$d.hours = v828[4];
              this.$d.minutes = v828[5];
              this.$d.seconds = v828[6];
              this.calMilliseconds();
              return this;
            }
          }
          return this;
        }
        var v830 = v821.prototype;
        v830.calMilliseconds = function () {
          var v831 = this;
          this.$ms = Object.keys(this.$d).reduce(function (v832, v833) {
            return v832 + (v831.$d[v833] || 0) * v802[v833];
          }, 0);
        };
        v830.parseFromMilliseconds = function () {
          var v834 = this.$ms;
          this.$d.years = v814(v834 / v798);
          v834 %= v798;
          this.$d.months = v814(v834 / v799);
          v834 %= v799;
          this.$d.days = v814(v834 / v797);
          v834 %= v797;
          this.$d.hours = v814(v834 / v796);
          v834 %= v796;
          this.$d.minutes = v814(v834 / v795);
          v834 %= v795;
          this.$d.seconds = v814(v834 / v794);
          v834 %= v794;
          this.$d.milliseconds = v834;
        };
        v830.toISOString = function () {
          var v835 = v818(this.$d.years, "Y");
          var v836 = v818(this.$d.months, "M");
          var v837 = +this.$d.days || 0;
          if (this.$d.weeks) {
            v837 += this.$d.weeks * 7;
          }
          var v838 = v818(v837, "D");
          var v839 = v818(this.$d.hours, "H");
          var v840 = v818(this.$d.minutes, "M");
          var v841 = this.$d.seconds || 0;
          if (this.$d.milliseconds) {
            v841 += this.$d.milliseconds / 1000;
            v841 = Math.round(v841 * 1000) / 1000;
          }
          var v842 = v818(v841, "S");
          var v843 = v835.negative || v836.negative || v838.negative || v839.negative || v840.negative || v842.negative;
          var v844 = v839.format || v840.format || v842.format ? "T" : "";
          var v845 = (v843 ? "-" : "") + "P" + v835.format + v836.format + v838.format + v844 + v839.format + v840.format + v842.format;
          if (v845 === "P" || v845 === "-P") {
            return "P0D";
          } else {
            return v845;
          }
        };
        v830.toJSON = function () {
          return this.toISOString();
        };
        v830.format = function (v846) {
          var v847 = v846 || "YYYY-MM-DDTHH:mm:ss";
          var v848 = {
            Y: this.$d.years,
            YY: v793.s(this.$d.years, 2, "0"),
            YYYY: v793.s(this.$d.years, 4, "0"),
            M: this.$d.months,
            MM: v793.s(this.$d.months, 2, "0"),
            D: this.$d.days,
            DD: v793.s(this.$d.days, 2, "0"),
            H: this.$d.hours,
            HH: v793.s(this.$d.hours, 2, "0"),
            m: this.$d.minutes,
            mm: v793.s(this.$d.minutes, 2, "0"),
            s: this.$d.seconds,
            ss: v793.s(this.$d.seconds, 2, "0"),
            SSS: v793.s(this.$d.milliseconds, 3, "0")
          };
          return v847.replace(v801, function (v849, v850) {
            return v850 || String(v848[v849]);
          });
        };
        v830.as = function (v851) {
          return this.$ms / v802[v810(v851)];
        };
        v830.get = function (v852) {
          var v853 = this.$ms;
          var v854 = v810(v852);
          if (v854 === "milliseconds") {
            v853 %= 1000;
          } else {
            v853 = v854 === "weeks" ? v814(v853 / v802[v854]) : this.$d[v854];
          }
          return v853 || 0;
        };
        v830.add = function (v855, v856, v857) {
          var v858;
          v858 = v856 ? v855 * v802[v810(v856)] : v803(v855) ? v855.$ms : v806(v855, this).$ms;
          return v806(this.$ms + v858 * (v857 ? -1 : 1), this);
        };
        v830.subtract = function (v859, v860) {
          return this.add(v859, v860, true);
        };
        v830.locale = function (v861) {
          var v862 = this.clone();
          v862.$l = v861;
          return v862;
        };
        v830.clone = function () {
          return v806(this.$ms, this);
        };
        v830.humanize = function (v863) {
          return v792().add(this.$ms, "ms").locale(this.$l).fromNow(!v863);
        };
        v830.valueOf = function () {
          return this.asMilliseconds();
        };
        v830.milliseconds = function () {
          return this.get("milliseconds");
        };
        v830.asMilliseconds = function () {
          return this.as("milliseconds");
        };
        v830.seconds = function () {
          return this.get("seconds");
        };
        v830.asSeconds = function () {
          return this.as("seconds");
        };
        v830.minutes = function () {
          return this.get("minutes");
        };
        v830.asMinutes = function () {
          return this.as("minutes");
        };
        v830.hours = function () {
          return this.get("hours");
        };
        v830.asHours = function () {
          return this.as("hours");
        };
        v830.days = function () {
          return this.get("days");
        };
        v830.asDays = function () {
          return this.as("days");
        };
        v830.weeks = function () {
          return this.get("weeks");
        };
        v830.asWeeks = function () {
          return this.as("weeks");
        };
        v830.months = function () {
          return this.get("months");
        };
        v830.asMonths = function () {
          return this.as("months");
        };
        v830.years = function () {
          return this.get("years");
        };
        v830.asYears = function () {
          return this.as("years");
        };
        return v821;
      }();
      function v864(v865, v866, v867) {
        return v865.add(v866.years() * v867, "y").add(v866.months() * v867, "M").add(v866.days() * v867, "d").add(v866.hours() * v867, "h").add(v866.minutes() * v867, "m").add(v866.seconds() * v867, "s").add(v866.milliseconds() * v867, "ms");
      }
      return function (v868, v869, v870) {
        v792 = v870;
        v793 = v870().$utils();
        v870.duration = function (v871, v872) {
          var v873 = v870.locale();
          return v806(v871, {
            $l: v873
          }, v872);
        };
        v870.isDuration = v803;
        var v874 = v869.prototype.add;
        var v875 = v869.prototype.subtract;
        v869.prototype.add = function (v876, v877) {
          if (v803(v876)) {
            return v864(this, v876, 1);
          } else {
            return v874.bind(this)(v876, v877);
          }
        };
        v869.prototype.subtract = function (v878, v879) {
          if (v803(v878)) {
            return v864(this, v878, -1);
          } else {
            return v875.bind(this)(v878, v879);
          }
        };
      };
    });
  })(duration$1);
  return duration$1.exports;
}
var durationExports = requireDuration();
const dayjsDuration = v8(durationExports);
var parser = function () {
  var v880 = v15(function (v881, v882, v883, v884) {
    v883 = v883 || {};
    v884 = v881.length;
    for (; v884--; v883[v881[v884]] = v882);
    return v883;
  }, "o");
  var v885 = [6, 8, 10, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 35, 36, 38, 40];
  var v886 = [1, 26];
  var v887 = [1, 27];
  var v888 = [1, 28];
  var v889 = [1, 29];
  var v890 = [1, 30];
  var v891 = [1, 31];
  var v892 = [1, 32];
  var v893 = [1, 33];
  var v894 = [1, 34];
  var v895 = [1, 9];
  var v896 = [1, 10];
  var v897 = [1, 11];
  var v898 = [1, 12];
  var v899 = [1, 13];
  var v900 = [1, 14];
  var v901 = [1, 15];
  var v902 = [1, 16];
  var v903 = [1, 19];
  var v904 = [1, 20];
  var v905 = [1, 21];
  var v906 = [1, 22];
  var v907 = [1, 23];
  var v908 = [1, 25];
  var v909 = [1, 35];
  var v910 = {
    trace: v15(function v911() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      gantt: 4,
      document: 5,
      EOF: 6,
      line: 7,
      SPACE: 8,
      statement: 9,
      NL: 10,
      weekday: 11,
      weekday_monday: 12,
      weekday_tuesday: 13,
      weekday_wednesday: 14,
      weekday_thursday: 15,
      weekday_friday: 16,
      weekday_saturday: 17,
      weekday_sunday: 18,
      weekend: 19,
      weekend_friday: 20,
      weekend_saturday: 21,
      dateFormat: 22,
      inclusiveEndDates: 23,
      topAxis: 24,
      axisFormat: 25,
      tickInterval: 26,
      excludes: 27,
      includes: 28,
      todayMarker: 29,
      title: 30,
      acc_title: 31,
      acc_title_value: 32,
      acc_descr: 33,
      acc_descr_value: 34,
      acc_descr_multiline_value: 35,
      section: 36,
      clickStatement: 37,
      taskTxt: 38,
      taskData: 39,
      click: 40,
      callbackname: 41,
      callbackargs: 42,
      href: 43,
      clickStatementDebug: 44,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      4: "gantt",
      6: "EOF",
      8: "SPACE",
      10: "NL",
      12: "weekday_monday",
      13: "weekday_tuesday",
      14: "weekday_wednesday",
      15: "weekday_thursday",
      16: "weekday_friday",
      17: "weekday_saturday",
      18: "weekday_sunday",
      20: "weekend_friday",
      21: "weekend_saturday",
      22: "dateFormat",
      23: "inclusiveEndDates",
      24: "topAxis",
      25: "axisFormat",
      26: "tickInterval",
      27: "excludes",
      28: "includes",
      29: "todayMarker",
      30: "title",
      31: "acc_title",
      32: "acc_title_value",
      33: "acc_descr",
      34: "acc_descr_value",
      35: "acc_descr_multiline_value",
      36: "section",
      38: "taskTxt",
      39: "taskData",
      40: "click",
      41: "callbackname",
      42: "callbackargs",
      43: "href"
    },
    productions_: [0, [3, 3], [5, 0], [5, 2], [7, 2], [7, 1], [7, 1], [7, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [19, 1], [19, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 2], [9, 2], [9, 1], [9, 1], [9, 1], [9, 2], [37, 2], [37, 3], [37, 3], [37, 4], [37, 3], [37, 4], [37, 2], [44, 2], [44, 3], [44, 3], [44, 4], [44, 3], [44, 4], [44, 2]],
    performAction: v15(function v912(v913, v914, v915, v916, v917, v918, v919) {
      var v920 = v918.length - 1;
      switch (v917) {
        case 1:
          return v918[v920 - 1];
        case 2:
          this.$ = [];
          break;
        case 3:
          v918[v920 - 1].push(v918[v920]);
          this.$ = v918[v920 - 1];
          break;
        case 4:
        case 5:
          this.$ = v918[v920];
          break;
        case 6:
        case 7:
          this.$ = [];
          break;
        case 8:
          v916.setWeekday("monday");
          break;
        case 9:
          v916.setWeekday("tuesday");
          break;
        case 10:
          v916.setWeekday("wednesday");
          break;
        case 11:
          v916.setWeekday("thursday");
          break;
        case 12:
          v916.setWeekday("friday");
          break;
        case 13:
          v916.setWeekday("saturday");
          break;
        case 14:
          v916.setWeekday("sunday");
          break;
        case 15:
          v916.setWeekend("friday");
          break;
        case 16:
          v916.setWeekend("saturday");
          break;
        case 17:
          v916.setDateFormat(v918[v920].substr(11));
          this.$ = v918[v920].substr(11);
          break;
        case 18:
          v916.enableInclusiveEndDates();
          this.$ = v918[v920].substr(18);
          break;
        case 19:
          v916.TopAxis();
          this.$ = v918[v920].substr(8);
          break;
        case 20:
          v916.setAxisFormat(v918[v920].substr(11));
          this.$ = v918[v920].substr(11);
          break;
        case 21:
          v916.setTickInterval(v918[v920].substr(13));
          this.$ = v918[v920].substr(13);
          break;
        case 22:
          v916.setExcludes(v918[v920].substr(9));
          this.$ = v918[v920].substr(9);
          break;
        case 23:
          v916.setIncludes(v918[v920].substr(9));
          this.$ = v918[v920].substr(9);
          break;
        case 24:
          v916.setTodayMarker(v918[v920].substr(12));
          this.$ = v918[v920].substr(12);
          break;
        case 27:
          v916.setDiagramTitle(v918[v920].substr(6));
          this.$ = v918[v920].substr(6);
          break;
        case 28:
          this.$ = v918[v920].trim();
          v916.setAccTitle(this.$);
          break;
        case 29:
        case 30:
          this.$ = v918[v920].trim();
          v916.setAccDescription(this.$);
          break;
        case 31:
          v916.addSection(v918[v920].substr(8));
          this.$ = v918[v920].substr(8);
          break;
        case 33:
          v916.addTask(v918[v920 - 1], v918[v920]);
          this.$ = "task";
          break;
        case 34:
          this.$ = v918[v920 - 1];
          v916.setClickEvent(v918[v920 - 1], v918[v920], null);
          break;
        case 35:
          this.$ = v918[v920 - 2];
          v916.setClickEvent(v918[v920 - 2], v918[v920 - 1], v918[v920]);
          break;
        case 36:
          this.$ = v918[v920 - 2];
          v916.setClickEvent(v918[v920 - 2], v918[v920 - 1], null);
          v916.setLink(v918[v920 - 2], v918[v920]);
          break;
        case 37:
          this.$ = v918[v920 - 3];
          v916.setClickEvent(v918[v920 - 3], v918[v920 - 2], v918[v920 - 1]);
          v916.setLink(v918[v920 - 3], v918[v920]);
          break;
        case 38:
          this.$ = v918[v920 - 2];
          v916.setClickEvent(v918[v920 - 2], v918[v920], null);
          v916.setLink(v918[v920 - 2], v918[v920 - 1]);
          break;
        case 39:
          this.$ = v918[v920 - 3];
          v916.setClickEvent(v918[v920 - 3], v918[v920 - 1], v918[v920]);
          v916.setLink(v918[v920 - 3], v918[v920 - 2]);
          break;
        case 40:
          this.$ = v918[v920 - 1];
          v916.setLink(v918[v920 - 1], v918[v920]);
          break;
        case 41:
        case 47:
          this.$ = v918[v920 - 1] + " " + v918[v920];
          break;
        case 42:
        case 43:
        case 45:
          this.$ = v918[v920 - 2] + " " + v918[v920 - 1] + " " + v918[v920];
          break;
        case 44:
        case 46:
          this.$ = v918[v920 - 3] + " " + v918[v920 - 2] + " " + v918[v920 - 1] + " " + v918[v920];
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: [1, 2]
    }, {
      1: [3]
    }, v880(v885, [2, 2], {
      5: 3
    }), {
      6: [1, 4],
      7: 5,
      8: [1, 6],
      9: 7,
      10: [1, 8],
      11: 17,
      12: v886,
      13: v887,
      14: v888,
      15: v889,
      16: v890,
      17: v891,
      18: v892,
      19: 18,
      20: v893,
      21: v894,
      22: v895,
      23: v896,
      24: v897,
      25: v898,
      26: v899,
      27: v900,
      28: v901,
      29: v902,
      30: v903,
      31: v904,
      33: v905,
      35: v906,
      36: v907,
      37: 24,
      38: v908,
      40: v909
    }, v880(v885, [2, 7], {
      1: [2, 1]
    }), v880(v885, [2, 3]), {
      9: 36,
      11: 17,
      12: v886,
      13: v887,
      14: v888,
      15: v889,
      16: v890,
      17: v891,
      18: v892,
      19: 18,
      20: v893,
      21: v894,
      22: v895,
      23: v896,
      24: v897,
      25: v898,
      26: v899,
      27: v900,
      28: v901,
      29: v902,
      30: v903,
      31: v904,
      33: v905,
      35: v906,
      36: v907,
      37: 24,
      38: v908,
      40: v909
    }, v880(v885, [2, 5]), v880(v885, [2, 6]), v880(v885, [2, 17]), v880(v885, [2, 18]), v880(v885, [2, 19]), v880(v885, [2, 20]), v880(v885, [2, 21]), v880(v885, [2, 22]), v880(v885, [2, 23]), v880(v885, [2, 24]), v880(v885, [2, 25]), v880(v885, [2, 26]), v880(v885, [2, 27]), {
      32: [1, 37]
    }, {
      34: [1, 38]
    }, v880(v885, [2, 30]), v880(v885, [2, 31]), v880(v885, [2, 32]), {
      39: [1, 39]
    }, v880(v885, [2, 8]), v880(v885, [2, 9]), v880(v885, [2, 10]), v880(v885, [2, 11]), v880(v885, [2, 12]), v880(v885, [2, 13]), v880(v885, [2, 14]), v880(v885, [2, 15]), v880(v885, [2, 16]), {
      41: [1, 40],
      43: [1, 41]
    }, v880(v885, [2, 4]), v880(v885, [2, 28]), v880(v885, [2, 29]), v880(v885, [2, 33]), v880(v885, [2, 34], {
      42: [1, 42],
      43: [1, 43]
    }), v880(v885, [2, 40], {
      41: [1, 44]
    }), v880(v885, [2, 35], {
      43: [1, 45]
    }), v880(v885, [2, 36]), v880(v885, [2, 38], {
      42: [1, 46]
    }), v880(v885, [2, 37]), v880(v885, [2, 39])],
    defaultActions: {},
    parseError: v15(function v921(v922, v923) {
      if (v923.recoverable) {
        this.trace(v922);
      } else {
        var v924 = new Error(v922);
        v924.hash = v923;
        throw v924;
      }
    }, "parseError"),
    parse: v15(function v925(v926) {
      var v927 = this;
      var v928 = [0];
      var v929 = [];
      var v930 = [null];
      var v931 = [];
      var v932 = this.table;
      var v933 = "";
      var v934 = 0;
      var v935 = 0;
      var v936 = 2;
      var v937 = 1;
      var v938 = v931.slice.call(arguments, 1);
      var v939 = Object.create(this.lexer);
      var v940 = {
        yy: {}
      };
      for (var v941 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v941)) {
          v940.yy[v941] = this.yy[v941];
        }
      }
      v939.setInput(v926, v940.yy);
      v940.yy.lexer = v939;
      v940.yy.parser = this;
      if (typeof v939.yylloc == "undefined") {
        v939.yylloc = {};
      }
      var v942 = v939.yylloc;
      v931.push(v942);
      var v943 = v939.options && v939.options.ranges;
      if (typeof v940.yy.parseError === "function") {
        this.parseError = v940.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v944(v945) {
        v928.length = v928.length - v945 * 2;
        v930.length = v930.length - v945;
        v931.length = v931.length - v945;
      }
      v15(v944, "popStack");
      function v946() {
        var v947;
        v947 = v929.pop() || v939.lex() || v937;
        if (typeof v947 !== "number") {
          if (v947 instanceof Array) {
            v929 = v947;
            v947 = v929.pop();
          }
          v947 = v927.symbols_[v947] || v947;
        }
        return v947;
      }
      v15(v946, "lex");
      var v948;
      var v949;
      var v950;
      var v951;
      var v952 = {};
      var v953;
      var v954;
      var v955;
      var v956;
      while (true) {
        v949 = v928[v928.length - 1];
        if (this.defaultActions[v949]) {
          v950 = this.defaultActions[v949];
        } else {
          if (v948 === null || typeof v948 == "undefined") {
            v948 = v946();
          }
          v950 = v932[v949] && v932[v949][v948];
        }
        if (typeof v950 === "undefined" || !v950.length || !v950[0]) {
          var v957 = "";
          v956 = [];
          for (v953 in v932[v949]) {
            if (this.terminals_[v953] && v953 > v936) {
              v956.push("'" + this.terminals_[v953] + "'");
            }
          }
          if (v939.showPosition) {
            v957 = "Parse error on line " + (v934 + 1) + ":\n" + v939.showPosition() + "\nExpecting " + v956.join(", ") + ", got '" + (this.terminals_[v948] || v948) + "'";
          } else {
            v957 = "Parse error on line " + (v934 + 1) + ": Unexpected " + (v948 == v937 ? "end of input" : "'" + (this.terminals_[v948] || v948) + "'");
          }
          this.parseError(v957, {
            text: v939.match,
            token: this.terminals_[v948] || v948,
            line: v939.yylineno,
            loc: v942,
            expected: v956
          });
        }
        if (v950[0] instanceof Array && v950.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v949 + ", token: " + v948);
        }
        switch (v950[0]) {
          case 1:
            v928.push(v948);
            v930.push(v939.yytext);
            v931.push(v939.yylloc);
            v928.push(v950[1]);
            v948 = null;
            {
              v935 = v939.yyleng;
              v933 = v939.yytext;
              v934 = v939.yylineno;
              v942 = v939.yylloc;
            }
            break;
          case 2:
            v954 = this.productions_[v950[1]][1];
            v952.$ = v930[v930.length - v954];
            v952._$ = {
              first_line: v931[v931.length - (v954 || 1)].first_line,
              last_line: v931[v931.length - 1].last_line,
              first_column: v931[v931.length - (v954 || 1)].first_column,
              last_column: v931[v931.length - 1].last_column
            };
            if (v943) {
              v952._$.range = [v931[v931.length - (v954 || 1)].range[0], v931[v931.length - 1].range[1]];
            }
            v951 = this.performAction.apply(v952, [v933, v935, v934, v940.yy, v950[1], v930, v931].concat(v938));
            if (typeof v951 !== "undefined") {
              return v951;
            }
            if (v954) {
              v928 = v928.slice(0, v954 * -1 * 2);
              v930 = v930.slice(0, v954 * -1);
              v931 = v931.slice(0, v954 * -1);
            }
            v928.push(this.productions_[v950[1]][0]);
            v930.push(v952.$);
            v931.push(v952._$);
            v955 = v932[v928[v928.length - 2]][v928[v928.length - 1]];
            v928.push(v955);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v958 = function () {
    var v959 = {
      EOF: 1,
      parseError: v15(function v960(v961, v962) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v961, v962);
        } else {
          throw new Error(v961);
        }
      }, "parseError"),
      setInput: v15(function (v963, v964) {
        this.yy = v964 || this.yy || {};
        this._input = v963;
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
      input: v15(function () {
        var v965 = this._input[0];
        this.yytext += v965;
        this.yyleng++;
        this.offset++;
        this.match += v965;
        this.matched += v965;
        var v966 = v965.match(/(?:\r\n?|\n).*/g);
        if (v966) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v965;
      }, "input"),
      unput: v15(function (v967) {
        var v968 = v967.length;
        var v969 = v967.split(/(?:\r\n?|\n)/g);
        this._input = v967 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v968);
        this.offset -= v968;
        var v970 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v969.length - 1) {
          this.yylineno -= v969.length - 1;
        }
        var v971 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v969 ? (v969.length === v970.length ? this.yylloc.first_column : 0) + v970[v970.length - v969.length].length - v969[0].length : this.yylloc.first_column - v968
        };
        if (this.options.ranges) {
          this.yylloc.range = [v971[0], v971[0] + this.yyleng - v968];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v15(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v15(function () {
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
      less: v15(function (v972) {
        this.unput(this.match.slice(v972));
      }, "less"),
      pastInput: v15(function () {
        var v973 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v973.length > 20 ? "..." : "") + v973.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v15(function () {
        var v974 = this.match;
        if (v974.length < 20) {
          v974 += this._input.substr(0, 20 - v974.length);
        }
        return (v974.substr(0, 20) + (v974.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v15(function () {
        var v975 = this.pastInput();
        var v976 = new Array(v975.length + 1).join("-");
        return v975 + this.upcomingInput() + "\n" + v976 + "^";
      }, "showPosition"),
      test_match: v15(function (v977, v978) {
        var v979;
        var v980;
        var v981;
        if (this.options.backtrack_lexer) {
          v981 = {
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
            v981.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v980 = v977[0].match(/(?:\r\n?|\n).*/g);
        if (v980) {
          this.yylineno += v980.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v980 ? v980[v980.length - 1].length - v980[v980.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v977[0].length
        };
        this.yytext += v977[0];
        this.match += v977[0];
        this.matches = v977;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v977[0].length);
        this.matched += v977[0];
        v979 = this.performAction.call(this, this.yy, this, v978, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v979) {
          return v979;
        } else if (this._backtrack) {
          for (var v982 in v981) {
            this[v982] = v981[v982];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v15(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v983;
        var v984;
        var v985;
        var v986;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v987 = this._currentRules();
        for (var v988 = 0; v988 < v987.length; v988++) {
          v985 = this._input.match(this.rules[v987[v988]]);
          if (v985 && (!v984 || v985[0].length > v984[0].length)) {
            v984 = v985;
            v986 = v988;
            if (this.options.backtrack_lexer) {
              v983 = this.test_match(v985, v987[v988]);
              if (v983 !== false) {
                return v983;
              } else if (this._backtrack) {
                v984 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v984) {
          v983 = this.test_match(v984, v987[v986]);
          if (v983 !== false) {
            return v983;
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
      lex: v15(function v989() {
        var v990 = this.next();
        if (v990) {
          return v990;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v15(function v991(v992) {
        this.conditionStack.push(v992);
      }, "begin"),
      popState: v15(function v993() {
        var v994 = this.conditionStack.length - 1;
        if (v994 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v15(function v995() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v15(function v996(v997) {
        v997 = this.conditionStack.length - 1 - Math.abs(v997 || 0);
        if (v997 >= 0) {
          return this.conditionStack[v997];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v15(function v998(v999) {
        this.begin(v999);
      }, "pushState"),
      stateStackSize: v15(function v1000() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v15(function v1001(v1002, v1003, v1004, v1005) {
        switch (v1004) {
          case 0:
            this.begin("open_directive");
            return "open_directive";
          case 1:
            this.begin("acc_title");
            return 31;
          case 2:
            this.popState();
            return "acc_title_value";
          case 3:
            this.begin("acc_descr");
            return 33;
          case 4:
            this.popState();
            return "acc_descr_value";
          case 5:
            this.begin("acc_descr_multiline");
            break;
          case 6:
            this.popState();
            break;
          case 7:
            return "acc_descr_multiline_value";
          case 8:
            break;
          case 9:
            break;
          case 10:
            break;
          case 11:
            return 10;
          case 12:
            break;
          case 13:
            break;
          case 14:
            this.begin("href");
            break;
          case 15:
            this.popState();
            break;
          case 16:
            return 43;
          case 17:
            this.begin("callbackname");
            break;
          case 18:
            this.popState();
            break;
          case 19:
            this.popState();
            this.begin("callbackargs");
            break;
          case 20:
            return 41;
          case 21:
            this.popState();
            break;
          case 22:
            return 42;
          case 23:
            this.begin("click");
            break;
          case 24:
            this.popState();
            break;
          case 25:
            return 40;
          case 26:
            return 4;
          case 27:
            return 22;
          case 28:
            return 23;
          case 29:
            return 24;
          case 30:
            return 25;
          case 31:
            return 26;
          case 32:
            return 28;
          case 33:
            return 27;
          case 34:
            return 29;
          case 35:
            return 12;
          case 36:
            return 13;
          case 37:
            return 14;
          case 38:
            return 15;
          case 39:
            return 16;
          case 40:
            return 17;
          case 41:
            return 18;
          case 42:
            return 20;
          case 43:
            return 21;
          case 44:
            return "date";
          case 45:
            return 30;
          case 46:
            return "accDescription";
          case 47:
            return 36;
          case 48:
            return 38;
          case 49:
            return 39;
          case 50:
            return ":";
          case 51:
            return 6;
          case 52:
            return "INVALID";
        }
      }, "anonymous"),
      rules: [/^(?:%%\{)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:%%(?!\{)*[^\n]*)/i, /^(?:[^\}]%%*[^\n]*)/i, /^(?:%%*[^\n]*[\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:%[^\n]*)/i, /^(?:href[\s]+["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:call[\s]+)/i, /^(?:\([\s]*\))/i, /^(?:\()/i, /^(?:[^(]*)/i, /^(?:\))/i, /^(?:[^)]*)/i, /^(?:click[\s]+)/i, /^(?:[\s\n])/i, /^(?:[^\s\n]*)/i, /^(?:gantt\b)/i, /^(?:dateFormat\s[^#\n;]+)/i, /^(?:inclusiveEndDates\b)/i, /^(?:topAxis\b)/i, /^(?:axisFormat\s[^#\n;]+)/i, /^(?:tickInterval\s[^#\n;]+)/i, /^(?:includes\s[^#\n;]+)/i, /^(?:excludes\s[^#\n;]+)/i, /^(?:todayMarker\s[^\n;]+)/i, /^(?:weekday\s+monday\b)/i, /^(?:weekday\s+tuesday\b)/i, /^(?:weekday\s+wednesday\b)/i, /^(?:weekday\s+thursday\b)/i, /^(?:weekday\s+friday\b)/i, /^(?:weekday\s+saturday\b)/i, /^(?:weekday\s+sunday\b)/i, /^(?:weekend\s+friday\b)/i, /^(?:weekend\s+saturday\b)/i, /^(?:\d\d\d\d-\d\d-\d\d\b)/i, /^(?:title\s[^\n]+)/i, /^(?:accDescription\s[^#\n;]+)/i, /^(?:section\s[^\n]+)/i, /^(?:[^:\n]+)/i, /^(?::[^#\n;]+)/i, /^(?::)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: {
        acc_descr_multiline: {
          rules: [6, 7],
          inclusive: false
        },
        acc_descr: {
          rules: [4],
          inclusive: false
        },
        acc_title: {
          rules: [2],
          inclusive: false
        },
        callbackargs: {
          rules: [21, 22],
          inclusive: false
        },
        callbackname: {
          rules: [18, 19, 20],
          inclusive: false
        },
        href: {
          rules: [15, 16],
          inclusive: false
        },
        click: {
          rules: [24, 25],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 3, 5, 8, 9, 10, 11, 12, 13, 14, 17, 23, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
          inclusive: true
        }
      }
    };
    return v959;
  }();
  v910.lexer = v958;
  function v1006() {
    this.yy = {};
  }
  v15(v1006, "Parser");
  v1006.prototype = v910;
  v910.Parser = v1006;
  return new v1006();
}();
parser.parser = parser;
var gantt_default = parser;
v19.extend(dayjsIsoWeek);
v19.extend(dayjsCustomParseFormat);
v19.extend(dayjsAdvancedFormat);
var WEEKEND_START_DAY = {
  friday: 5,
  saturday: 6
};
var dateFormat = "";
var axisFormat = "";
var tickInterval = undefined;
var todayMarker = "";
var includes = [];
var excludes = [];
var links = new Map();
var sections = [];
var tasks = [];
var currentSection = "";
var displayMode = "";
var tags = ["active", "done", "crit", "milestone", "vert"];
var funs = [];
var diagramId = "";
var inclusiveEndDates = false;
var topAxis = false;
var weekday = "sunday";
var weekend = "saturday";
var lastOrder = 0;
var clear2 = v15(function () {
  sections = [];
  tasks = [];
  currentSection = "";
  funs = [];
  taskCnt = 0;
  lastTask = undefined;
  lastTaskID = undefined;
  rawTasks = [];
  dateFormat = "";
  axisFormat = "";
  displayMode = "";
  tickInterval = undefined;
  todayMarker = "";
  includes = [];
  excludes = [];
  inclusiveEndDates = false;
  topAxis = false;
  lastOrder = 0;
  links = new Map();
  diagramId = "";
  v23();
  weekday = "sunday";
  weekend = "saturday";
}, "clear");
var setDiagramId = v15(function (v1007) {
  diagramId = v1007;
}, "setDiagramId");
var setAxisFormat = v15(function (v1008) {
  axisFormat = v1008;
}, "setAxisFormat");
var getAxisFormat = v15(function () {
  return axisFormat;
}, "getAxisFormat");
var setTickInterval = v15(function (v1009) {
  tickInterval = v1009;
}, "setTickInterval");
var getTickInterval = v15(function () {
  return tickInterval;
}, "getTickInterval");
var setTodayMarker = v15(function (v1010) {
  todayMarker = v1010;
}, "setTodayMarker");
var getTodayMarker = v15(function () {
  return todayMarker;
}, "getTodayMarker");
var setDateFormat = v15(function (v1011) {
  dateFormat = v1011;
}, "setDateFormat");
var enableInclusiveEndDates = v15(function () {
  inclusiveEndDates = true;
}, "enableInclusiveEndDates");
var endDatesAreInclusive = v15(function () {
  return inclusiveEndDates;
}, "endDatesAreInclusive");
var enableTopAxis = v15(function () {
  topAxis = true;
}, "enableTopAxis");
var topAxisEnabled = v15(function () {
  return topAxis;
}, "topAxisEnabled");
var setDisplayMode = v15(function (v1012) {
  displayMode = v1012;
}, "setDisplayMode");
var getDisplayMode = v15(function () {
  return displayMode;
}, "getDisplayMode");
var getDateFormat = v15(function () {
  return dateFormat;
}, "getDateFormat");
var mergeTokens = v15((v1013, v1014) => {
  const v1015 = v1014.toLowerCase().split(/[\s,]+/).filter(v1016 => v1016 !== "");
  return [...new Set([...v1013, ...v1015])];
}, "mergeTokens");
var setIncludes = v15(function (v1017) {
  includes = mergeTokens(includes, v1017);
}, "setIncludes");
var getIncludes = v15(function () {
  return includes;
}, "getIncludes");
var setExcludes = v15(function (v1018) {
  excludes = mergeTokens(excludes, v1018);
}, "setExcludes");
var getExcludes = v15(function () {
  return excludes;
}, "getExcludes");
var getLinks = v15(function () {
  return links;
}, "getLinks");
var addSection = v15(function (v1019) {
  currentSection = v1019;
  sections.push(v1019);
}, "addSection");
var getSections = v15(function () {
  return sections;
}, "getSections");
var getTasks = v15(function () {
  let v1020 = compileTasks();
  const v1021 = 10;
  let v1022 = 0;
  while (!v1020 && v1022 < v1021) {
    v1020 = compileTasks();
    v1022++;
  }
  tasks = rawTasks;
  return tasks;
}, "getTasks");
var isInvalidDate = v15(function (v1023, v1024, v1025, v1026) {
  const v1027 = v1023.format(v1024.trim());
  const v1028 = v1023.format("YYYY-MM-DD");
  if (v1026.includes(v1027) || v1026.includes(v1028)) {
    return false;
  }
  if (v1025.includes("weekends") && (v1023.isoWeekday() === WEEKEND_START_DAY[weekend] || v1023.isoWeekday() === WEEKEND_START_DAY[weekend] + 1)) {
    return true;
  }
  if (v1025.includes(v1023.format("dddd").toLowerCase())) {
    return true;
  }
  return v1025.includes(v1027) || v1025.includes(v1028);
}, "isInvalidDate");
var setWeekday = v15(function (v1029) {
  weekday = v1029;
}, "setWeekday");
var getWeekday = v15(function () {
  return weekday;
}, "getWeekday");
var setWeekend = v15(function (v1030) {
  weekend = v1030;
}, "setWeekend");
var checkTaskDates = v15(function (v1031, v1032, v1033, v1034) {
  if (!v1033.length || v1031.manualEndTime) {
    return;
  }
  let v1035;
  if (v1031.startTime instanceof Date) {
    v1035 = v19(v1031.startTime);
  } else {
    v1035 = v19(v1031.startTime, v1032, true);
  }
  v1035 = v1035.add(1, "d");
  let v1036;
  if (v1031.endTime instanceof Date) {
    v1036 = v19(v1031.endTime);
  } else {
    v1036 = v19(v1031.endTime, v1032, true);
  }
  const [v1037, v1038] = fixTaskDates(v1035, v1036, v1032, v1033, v1034);
  v1031.endTime = v1037.toDate();
  v1031.renderEndTime = v1038;
}, "checkTaskDates");
var fixTaskDates = v15(function (v1039, v1040, v1041, v1042, v1043) {
  let v1044 = false;
  let v1045 = null;
  const v1046 = v1040.add(10000, "d");
  while (v1039 <= v1040) {
    if (!v1044) {
      v1045 = v1040.toDate();
    }
    v1044 = isInvalidDate(v1039, v1041, v1042, v1043);
    if (v1044) {
      v1040 = v1040.add(1, "d");
      if (v1040 > v1046) {
        throw new Error("Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.");
      }
    }
    v1039 = v1039.add(1, "d");
  }
  return [v1040, v1045];
}, "fixTaskDates");
var getStartDate = v15(function (v1047, v1048, v1049) {
  v1049 = v1049.trim();
  const v1050 = v15(v1051 => {
    const v1052 = v1051.trim();
    return v1052 === "x" || v1052 === "X";
  }, "isTimestampFormat");
  if (v1050(v1048) && /^\d+$/.test(v1049)) {
    return new Date(Number(v1049));
  }
  const v1053 = /^after\s+(?<ids>[\d\w- ]+)/;
  const v1054 = v1053.exec(v1049);
  if (v1054 !== null) {
    let v1055 = null;
    for (const v1056 of v1054.groups.ids.split(" ")) {
      let v1057 = findTaskById(v1056);
      if (v1057 !== undefined && (!v1055 || v1057.endTime > v1055.endTime)) {
        v1055 = v1057;
      }
    }
    if (v1055) {
      return v1055.endTime;
    }
    const v1058 = new Date();
    v1058.setHours(0, 0, 0, 0);
    return v1058;
  }
  let v1059 = v19(v1049, v1048.trim(), true);
  if (v1059.isValid()) {
    return v1059.toDate();
  } else {
    v20.debug("Invalid date:" + v1049);
    v20.debug("With date format:" + v1048.trim());
    const v1060 = new Date(v1049);
    if (v1060 === undefined || isNaN(v1060.getTime()) || v1060.getFullYear() < -10000 || v1060.getFullYear() > 10000) {
      throw new Error("Invalid date:" + v1049);
    }
    return v1060;
  }
}, "getStartDate");
var parseDuration = v15(function (v1061) {
  const v1062 = /^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(v1061.trim());
  if (v1062 !== null) {
    return [Number.parseFloat(v1062[1]), v1062[2]];
  }
  return [NaN, "ms"];
}, "parseDuration");
var getEndDate = v15(function (v1063, v1064, v1065, v1066 = false) {
  v1065 = v1065.trim();
  const v1067 = /^until\s+(?<ids>[\d\w- ]+)/;
  const v1068 = v1067.exec(v1065);
  if (v1068 !== null) {
    let v1069 = null;
    for (const v1070 of v1068.groups.ids.split(" ")) {
      let v1071 = findTaskById(v1070);
      if (v1071 !== undefined && (!v1069 || v1071.startTime < v1069.startTime)) {
        v1069 = v1071;
      }
    }
    if (v1069) {
      return v1069.startTime;
    }
    const v1072 = new Date();
    v1072.setHours(0, 0, 0, 0);
    return v1072;
  }
  let v1073 = v19(v1065, v1064.trim(), true);
  if (v1073.isValid()) {
    if (v1066) {
      v1073 = v1073.add(1, "d");
    }
    return v1073.toDate();
  }
  let v1074 = v19(v1063);
  const [v1075, v1076] = parseDuration(v1065);
  if (!Number.isNaN(v1075)) {
    const v1077 = v1074.add(v1075, v1076);
    if (v1077.isValid()) {
      v1074 = v1077;
    }
  }
  return v1074.toDate();
}, "getEndDate");
var taskCnt = 0;
var parseId = v15(function (v1078) {
  if (v1078 === undefined) {
    taskCnt = taskCnt + 1;
    return "task" + taskCnt;
  }
  return v1078;
}, "parseId");
var compileData = v15(function (v1079, v1080) {
  let v1081;
  if (v1080.substr(0, 1) === ":") {
    v1081 = v1080.substr(1, v1080.length);
  } else {
    v1081 = v1080;
  }
  const v1082 = v1081.split(",");
  const v1083 = {};
  getTaskTags(v1082, v1083, tags);
  for (let v1084 = 0; v1084 < v1082.length; v1084++) {
    v1082[v1084] = v1082[v1084].trim();
  }
  let v1085 = "";
  switch (v1082.length) {
    case 1:
      v1083.id = parseId();
      v1083.startTime = v1079.endTime;
      v1085 = v1082[0];
      break;
    case 2:
      v1083.id = parseId();
      v1083.startTime = getStartDate(undefined, dateFormat, v1082[0]);
      v1085 = v1082[1];
      break;
    case 3:
      v1083.id = parseId(v1082[0]);
      v1083.startTime = getStartDate(undefined, dateFormat, v1082[1]);
      v1085 = v1082[2];
      break;
  }
  if (v1085) {
    v1083.endTime = getEndDate(v1083.startTime, dateFormat, v1085, inclusiveEndDates);
    v1083.manualEndTime = v19(v1085, "YYYY-MM-DD", true).isValid();
    checkTaskDates(v1083, dateFormat, excludes, includes);
  }
  return v1083;
}, "compileData");
var parseData = v15(function (v1086, v1087) {
  let v1088;
  if (v1087.substr(0, 1) === ":") {
    v1088 = v1087.substr(1, v1087.length);
  } else {
    v1088 = v1087;
  }
  const v1089 = v1088.split(",");
  const v1090 = {};
  getTaskTags(v1089, v1090, tags);
  for (let v1091 = 0; v1091 < v1089.length; v1091++) {
    v1089[v1091] = v1089[v1091].trim();
  }
  switch (v1089.length) {
    case 1:
      v1090.id = parseId();
      v1090.startTime = {
        type: "prevTaskEnd",
        id: v1086
      };
      v1090.endTime = {
        data: v1089[0]
      };
      break;
    case 2:
      v1090.id = parseId();
      v1090.startTime = {
        type: "getStartDate",
        startData: v1089[0]
      };
      v1090.endTime = {
        data: v1089[1]
      };
      break;
    case 3:
      v1090.id = parseId(v1089[0]);
      v1090.startTime = {
        type: "getStartDate",
        startData: v1089[1]
      };
      v1090.endTime = {
        data: v1089[2]
      };
      break;
  }
  return v1090;
}, "parseData");
var lastTask;
var lastTaskID;
var rawTasks = [];
var taskDb = {};
var addTask = v15(function (v1092, v1093) {
  const v1094 = {
    section: currentSection,
    type: currentSection,
    processed: false,
    manualEndTime: false,
    renderEndTime: null,
    raw: {
      data: v1093
    },
    task: v1092,
    classes: []
  };
  const v1095 = parseData(lastTaskID, v1093);
  v1094.raw.startTime = v1095.startTime;
  v1094.raw.endTime = v1095.endTime;
  v1094.id = v1095.id;
  v1094.prevTaskId = lastTaskID;
  v1094.active = v1095.active;
  v1094.done = v1095.done;
  v1094.crit = v1095.crit;
  v1094.milestone = v1095.milestone;
  v1094.vert = v1095.vert;
  if (v1094.vert) {
    v1094.order = -1;
  } else {
    v1094.order = lastOrder;
    lastOrder++;
  }
  const v1096 = rawTasks.push(v1094);
  lastTaskID = v1094.id;
  taskDb[v1094.id] = v1096 - 1;
}, "addTask");
var findTaskById = v15(function (v1097) {
  const v1098 = taskDb[v1097];
  return rawTasks[v1098];
}, "findTaskById");
var addTaskOrg = v15(function (v1099, v1100) {
  const v1101 = {
    section: currentSection,
    type: currentSection,
    description: v1099,
    task: v1099,
    classes: []
  };
  const v1102 = compileData(lastTask, v1100);
  v1101.startTime = v1102.startTime;
  v1101.endTime = v1102.endTime;
  v1101.id = v1102.id;
  v1101.active = v1102.active;
  v1101.done = v1102.done;
  v1101.crit = v1102.crit;
  v1101.milestone = v1102.milestone;
  v1101.vert = v1102.vert;
  lastTask = v1101;
  tasks.push(v1101);
}, "addTaskOrg");
var compileTasks = v15(function () {
  const v1103 = v15(function (v1104) {
    const v1105 = rawTasks[v1104];
    let v1106 = "";
    switch (rawTasks[v1104].raw.startTime.type) {
      case "prevTaskEnd":
        {
          const v1107 = findTaskById(v1105.prevTaskId);
          v1105.startTime = v1107.endTime;
          break;
        }
      case "getStartDate":
        v1106 = getStartDate(undefined, dateFormat, rawTasks[v1104].raw.startTime.startData);
        if (v1106) {
          rawTasks[v1104].startTime = v1106;
        }
        break;
    }
    if (rawTasks[v1104].startTime) {
      rawTasks[v1104].endTime = getEndDate(rawTasks[v1104].startTime, dateFormat, rawTasks[v1104].raw.endTime.data, inclusiveEndDates);
      if (rawTasks[v1104].endTime) {
        rawTasks[v1104].processed = true;
        rawTasks[v1104].manualEndTime = v19(rawTasks[v1104].raw.endTime.data, "YYYY-MM-DD", true).isValid();
        checkTaskDates(rawTasks[v1104], dateFormat, excludes, includes);
      }
    }
    return rawTasks[v1104].processed;
  }, "compileTask");
  let v1108 = true;
  for (const [v1109, v1110] of rawTasks.entries()) {
    v1103(v1109);
    v1108 = v1108 && v1110.processed;
  }
  return v1108;
}, "compileTasks");
var setLink = v15(function (v1111, v1112) {
  let v1113 = v1112;
  if (v16().securityLevel !== "loose") {
    v1113 = v22.sanitizeUrl(v1112);
  }
  v1111.split(",").forEach(function (v1114) {
    let v1115 = findTaskById(v1114);
    if (v1115 !== undefined) {
      pushFun(v1114, () => {
        window.open(v1113, "_self");
      });
      links.set(v1114, v1113);
    }
  });
  setClass(v1111, "clickable");
}, "setLink");
var setClass = v15(function (v1116, v1117) {
  v1116.split(",").forEach(function (v1118) {
    let v1119 = findTaskById(v1118);
    if (v1119 !== undefined) {
      v1119.classes.push(v1117);
    }
  });
}, "setClass");
var setClickFun = v15(function (v1120, v1121, v1122) {
  if (v16().securityLevel !== "loose") {
    return;
  }
  if (v1121 === undefined) {
    return;
  }
  let v1123 = [];
  if (typeof v1122 === "string") {
    v1123 = v1122.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    for (let v1124 = 0; v1124 < v1123.length; v1124++) {
      let v1125 = v1123[v1124].trim();
      if (v1125.startsWith("\"") && v1125.endsWith("\"")) {
        v1125 = v1125.substr(1, v1125.length - 2);
      }
      v1123[v1124] = v1125;
    }
  }
  if (v1123.length === 0) {
    v1123.push(v1120);
  }
  let v1126 = findTaskById(v1120);
  if (v1126 !== undefined) {
    pushFun(v1120, () => {
      v24.runFunc(v1121, ...v1123);
    });
  }
}, "setClickFun");
var pushFun = v15(function (v1127, v1128) {
  funs.push(function () {
    const v1129 = diagramId ? diagramId + "-" + v1127 : v1127;
    const v1130 = document.querySelector("[id=\"" + v1129 + "\"]");
    if (v1130 !== null) {
      v1130.addEventListener("click", function () {
        v1128();
      });
    }
  }, function () {
    const v1131 = diagramId ? diagramId + "-" + v1127 : v1127;
    const v1132 = document.querySelector("[id=\"" + v1131 + "-text\"]");
    if (v1132 !== null) {
      v1132.addEventListener("click", function () {
        v1128();
      });
    }
  });
}, "pushFun");
var setClickEvent = v15(function (v1133, v1134, v1135) {
  v1133.split(",").forEach(function (v1136) {
    setClickFun(v1136, v1134, v1135);
  });
  setClass(v1133, "clickable");
}, "setClickEvent");
var bindFunctions = v15(function (v1137) {
  funs.forEach(function (v1138) {
    v1138(v1137);
  });
}, "bindFunctions");
var ganttDb_default = {
  getConfig: v15(() => v16().gantt, "getConfig"),
  clear: clear2,
  setDateFormat: setDateFormat,
  getDateFormat: getDateFormat,
  enableInclusiveEndDates: enableInclusiveEndDates,
  endDatesAreInclusive: endDatesAreInclusive,
  enableTopAxis: enableTopAxis,
  topAxisEnabled: topAxisEnabled,
  setAxisFormat: setAxisFormat,
  getAxisFormat: getAxisFormat,
  setTickInterval: setTickInterval,
  getTickInterval: getTickInterval,
  setTodayMarker: setTodayMarker,
  getTodayMarker: getTodayMarker,
  setAccTitle: v14,
  getAccTitle: v13,
  setDiagramTitle: v12,
  getDiagramTitle: v11,
  setDiagramId: setDiagramId,
  setDisplayMode: setDisplayMode,
  getDisplayMode: getDisplayMode,
  setAccDescription: v10,
  getAccDescription: v9,
  addSection: addSection,
  getSections: getSections,
  getTasks: getTasks,
  addTask: addTask,
  findTaskById: findTaskById,
  addTaskOrg: addTaskOrg,
  setIncludes: setIncludes,
  getIncludes: getIncludes,
  setExcludes: setExcludes,
  getExcludes: getExcludes,
  setClickEvent: setClickEvent,
  setLink: setLink,
  getLinks: getLinks,
  bindFunctions: bindFunctions,
  parseDuration: parseDuration,
  isInvalidDate: isInvalidDate,
  setWeekday: setWeekday,
  getWeekday: getWeekday,
  setWeekend: setWeekend
};
function getTaskTags(v1139, v1140, v1141) {
  let v1142 = true;
  while (v1142) {
    v1142 = false;
    v1141.forEach(function (v1143) {
      const v1144 = "^\\s*" + v1143 + "\\s*$";
      const v1145 = new RegExp(v1144);
      if (v1139[0].match(v1145)) {
        v1140[v1143] = true;
        v1139.shift(1);
        v1142 = true;
      }
    });
  }
}
v15(getTaskTags, "getTaskTags");
v19.extend(dayjsDuration);
var setConf = v15(function () {
  v20.debug("Something is calling, setConf, remove the call");
}, "setConf");
var mapWeekdayToTimeFunction = {
  monday: timeMonday,
  tuesday: timeTuesday,
  wednesday: timeWednesday,
  thursday: timeThursday,
  friday: timeFriday,
  saturday: timeSaturday,
  sunday: timeSunday
};
var getMaxIntersections = v15((v1146, v1147) => {
  let v1148 = [...v1146].map(() => -Infinity);
  let v1149 = [...v1146].sort((v1150, v1151) => v1150.startTime - v1151.startTime || v1150.order - v1151.order);
  let v1152 = 0;
  for (const v1153 of v1149) {
    for (let v1154 = 0; v1154 < v1148.length; v1154++) {
      if (v1153.startTime >= v1148[v1154]) {
        v1148[v1154] = v1153.endTime;
        v1153.order = v1154 + v1147;
        if (v1154 > v1152) {
          v1152 = v1154;
        }
        break;
      }
    }
  }
  return v1152;
}, "getMaxIntersections");
var w;
var MAX_TICK_COUNT = 10000;
var draw = v15(function (v1155, v1156, v1157, v1158) {
  const v1159 = v16().gantt;
  v1158.db.setDiagramId(v1156);
  const v1160 = v16().securityLevel;
  let v1161;
  if (v1160 === "sandbox") {
    v1161 = v17("#i" + v1156);
  }
  const v1162 = v1160 === "sandbox" ? v17(v1161.nodes()[0].contentDocument.body) : v17("body");
  const v1163 = v1160 === "sandbox" ? v1161.nodes()[0].contentDocument : document;
  const v1164 = v1163.getElementById(v1156);
  w = v1164.parentElement.offsetWidth;
  if (w === undefined) {
    w = 1200;
  }
  if (v1159.useWidth !== undefined) {
    w = v1159.useWidth;
  }
  const v1165 = v1158.db.getTasks();
  const v1166 = v1165.filter(v1167 => !v1167.vert);
  let v1168 = [];
  for (const v1169 of v1166) {
    v1168.push(v1169.type);
  }
  v1168 = v1170(v1168);
  const v1171 = {};
  let v1172 = v1159.topPadding * 2;
  if (v1158.db.getDisplayMode() === "compact" || v1159.displayMode === "compact") {
    const v1173 = {};
    for (const v1174 of v1166) {
      if (v1173[v1174.section] === undefined) {
        v1173[v1174.section] = [v1174];
      } else {
        v1173[v1174.section].push(v1174);
      }
    }
    let v1175 = 0;
    for (const v1176 of Object.keys(v1173)) {
      const v1177 = getMaxIntersections(v1173[v1176], v1175) + 1;
      v1175 += v1177;
      v1172 += v1177 * (v1159.barHeight + v1159.barGap);
      v1171[v1176] = v1177;
    }
  } else {
    v1172 += v1166.length * (v1159.barHeight + v1159.barGap);
    for (const v1178 of v1168) {
      v1171[v1178] = v1166.filter(v1179 => v1179.type === v1178).length;
    }
  }
  v1164.setAttribute("viewBox", "0 0 " + w + " " + v1172);
  const v1180 = v1162.select("[id=\"" + v1156 + "\"]");
  const v1181 = time().domain([min(v1165, function (v1182) {
    return v1182.startTime;
  }), max(v1165, function (v1183) {
    return v1183.endTime;
  })]).rangeRound([0, w - v1159.leftPadding - v1159.rightPadding]);
  function v1184(v1185, v1186) {
    const v1187 = v1185.startTime;
    const v1188 = v1186.startTime;
    let v1189 = 0;
    if (v1187 > v1188) {
      v1189 = 1;
    } else if (v1187 < v1188) {
      v1189 = -1;
    }
    return v1189;
  }
  v15(v1184, "taskCompare");
  v1165.sort(v1184);
  v1190(v1165, w, v1172);
  v18(v1180, v1172, w, v1159.useMaxWidth);
  v1180.append("text").text(v1158.db.getDiagramTitle()).attr("x", w / 2).attr("y", v1159.titleTopMargin).attr("class", "titleText");
  function v1190(v1191, v1192, v1193) {
    const v1194 = v1159.barHeight;
    const v1195 = v1194 + v1159.barGap;
    const v1196 = v1159.topPadding;
    const v1197 = v1159.leftPadding;
    const v1198 = v29().domain([0, v1168.length]).range(["#00B9FA", "#F95002"]).interpolate(interpolateHcl);
    v1199(v1195, v1196, v1197, v1192, v1193, v1191, v1158.db.getExcludes(), v1158.db.getIncludes());
    v1200(v1197, v1196, v1192, v1193);
    v1201(v1191, v1195, v1196, v1197, v1194, v1198, v1192);
    v1202(v1195, v1196);
    v1203(v1197, v1196, v1192, v1193);
  }
  v15(v1190, "makeGantt");
  function v1201(v1204, v1205, v1206, v1207, v1208, v1209, v1210) {
    v1204.sort((v1211, v1212) => v1211.vert === v1212.vert ? 0 : v1211.vert ? 1 : -1);
    const v1213 = v1204.filter(v1214 => !v1214.vert);
    const v1215 = [...new Set(v1213.map(v1216 => v1216.order))];
    const v1217 = v1215.map(v1218 => v1213.find(v1219 => v1219.order === v1218));
    v1180.append("g").selectAll("rect").data(v1217).enter().append("rect").attr("x", 0).attr("y", function (v1220, v1221) {
      v1221 = v1220.order;
      return v1221 * v1205 + v1206 - 2;
    }).attr("width", function () {
      return v1210 - v1159.rightPadding / 2;
    }).attr("height", v1205).attr("class", function (v1222) {
      for (const [v1223, v1224] of v1168.entries()) {
        if (v1222.type === v1224) {
          return "section section" + v1223 % v1159.numberSectionStyles;
        }
      }
      return "section section0";
    }).enter();
    const v1225 = v1180.append("g").selectAll("rect").data(v1204).enter();
    const v1226 = v1158.db.getLinks();
    v1225.append("rect").attr("id", function (v1227) {
      return v1156 + "-" + v1227.id;
    }).attr("rx", 3).attr("ry", 3).attr("x", function (v1228) {
      if (v1228.milestone) {
        return v1181(v1228.startTime) + v1207 + (v1181(v1228.endTime) - v1181(v1228.startTime)) * 0.5 - v1208 * 0.5;
      }
      return v1181(v1228.startTime) + v1207;
    }).attr("y", function (v1229, v1230) {
      v1230 = v1229.order;
      if (v1229.vert) {
        return v1159.gridLineStartPadding;
      }
      return v1230 * v1205 + v1206;
    }).attr("width", function (v1231) {
      if (v1231.milestone) {
        return v1208;
      }
      if (v1231.vert) {
        return v1208 * 0.08;
      }
      return v1181(v1231.renderEndTime || v1231.endTime) - v1181(v1231.startTime);
    }).attr("height", function (v1232) {
      if (v1232.vert) {
        return v1213.length * (v1159.barHeight + v1159.barGap) + v1159.barHeight * 2;
      }
      return v1208;
    }).attr("transform-origin", function (v1233, v1234) {
      v1234 = v1233.order;
      return (v1181(v1233.startTime) + v1207 + (v1181(v1233.endTime) - v1181(v1233.startTime)) * 0.5).toString() + "px " + (v1234 * v1205 + v1206 + v1208 * 0.5).toString() + "px";
    }).attr("class", function (v1235) {
      const v1236 = "task";
      let v1237 = "";
      if (v1235.classes.length > 0) {
        v1237 = v1235.classes.join(" ");
      }
      let v1238 = 0;
      for (const [v1239, v1240] of v1168.entries()) {
        if (v1235.type === v1240) {
          v1238 = v1239 % v1159.numberSectionStyles;
        }
      }
      let v1241 = "";
      if (v1235.active) {
        if (v1235.crit) {
          v1241 += " activeCrit";
        } else {
          v1241 = " active";
        }
      } else if (v1235.done) {
        if (v1235.crit) {
          v1241 = " doneCrit";
        } else {
          v1241 = " done";
        }
      } else if (v1235.crit) {
        v1241 += " crit";
      }
      if (v1241.length === 0) {
        v1241 = " task";
      }
      if (v1235.milestone) {
        v1241 = " milestone " + v1241;
      }
      if (v1235.vert) {
        v1241 = " vert " + v1241;
      }
      v1241 += v1238;
      v1241 += " " + v1237;
      return v1236 + v1241;
    });
    v1225.append("text").attr("id", function (v1242) {
      return v1156 + "-" + v1242.id + "-text";
    }).text(function (v1243) {
      return v1243.task;
    }).attr("font-size", v1159.fontSize).attr("x", function (v1244) {
      let v1245 = v1181(v1244.startTime);
      let v1246 = v1181(v1244.renderEndTime || v1244.endTime);
      if (v1244.milestone) {
        v1245 += (v1181(v1244.endTime) - v1181(v1244.startTime)) * 0.5 - v1208 * 0.5;
        v1246 = v1245 + v1208;
      }
      if (v1244.vert) {
        return v1181(v1244.startTime) + v1207;
      }
      const v1247 = this.getBBox().width;
      if (v1247 > v1246 - v1245) {
        if (v1246 + v1247 + v1159.leftPadding * 1.5 > v1210) {
          return v1245 + v1207 - 5;
        } else {
          return v1246 + v1207 + 5;
        }
      } else {
        return (v1246 - v1245) / 2 + v1245 + v1207;
      }
    }).attr("y", function (v1248, v1249) {
      if (v1248.vert) {
        return v1159.gridLineStartPadding + v1213.length * (v1159.barHeight + v1159.barGap) + 60;
      }
      v1249 = v1248.order;
      return v1249 * v1205 + v1159.barHeight / 2 + (v1159.fontSize / 2 - 2) + v1206;
    }).attr("text-height", v1208).attr("class", function (v1250) {
      const v1251 = v1181(v1250.startTime);
      let v1252 = v1181(v1250.endTime);
      if (v1250.milestone) {
        v1252 = v1251 + v1208;
      }
      const v1253 = this.getBBox().width;
      let v1254 = "";
      if (v1250.classes.length > 0) {
        v1254 = v1250.classes.join(" ");
      }
      let v1255 = 0;
      for (const [v1256, v1257] of v1168.entries()) {
        if (v1250.type === v1257) {
          v1255 = v1256 % v1159.numberSectionStyles;
        }
      }
      let v1258 = "";
      if (v1250.active) {
        if (v1250.crit) {
          v1258 = "activeCritText" + v1255;
        } else {
          v1258 = "activeText" + v1255;
        }
      }
      if (v1250.done) {
        if (v1250.crit) {
          v1258 = v1258 + " doneCritText" + v1255;
        } else {
          v1258 = v1258 + " doneText" + v1255;
        }
      } else if (v1250.crit) {
        v1258 = v1258 + " critText" + v1255;
      }
      if (v1250.milestone) {
        v1258 += " milestoneText";
      }
      if (v1250.vert) {
        v1258 += " vertText";
      }
      if (v1253 > v1252 - v1251) {
        if (v1252 + v1253 + v1159.leftPadding * 1.5 > v1210) {
          return v1254 + " taskTextOutsideLeft taskTextOutside" + v1255 + " " + v1258;
        } else {
          return v1254 + " taskTextOutsideRight taskTextOutside" + v1255 + " " + v1258 + " width-" + v1253;
        }
      } else {
        return v1254 + " taskText taskText" + v1255 + " " + v1258 + " width-" + v1253;
      }
    });
    const v1259 = v16().securityLevel;
    if (v1259 === "sandbox") {
      let v1260;
      v1260 = v17("#i" + v1156);
      const v1261 = v1260.nodes()[0].contentDocument;
      v1225.filter(function (v1262) {
        return v1226.has(v1262.id);
      }).each(function (v1263) {
        var v1264 = v1261.querySelector("#" + CSS.escape(v1156 + "-" + v1263.id));
        var v1265 = v1261.querySelector("#" + CSS.escape(v1156 + "-" + v1263.id + "-text"));
        const v1266 = v1264.parentNode;
        var v1267 = v1261.createElement("a");
        v1267.setAttribute("xlink:href", v1226.get(v1263.id));
        v1267.setAttribute("target", "_top");
        v1266.appendChild(v1267);
        v1267.appendChild(v1264);
        v1267.appendChild(v1265);
      });
    }
  }
  v15(v1201, "drawRects");
  function v1199(v1268, v1269, v1270, v1271, v1272, v1273, v1274, v1275) {
    if (v1274.length === 0 && v1275.length === 0) {
      return;
    }
    let v1276;
    let v1277;
    for (const {
      startTime: v1278,
      endTime: v1279
    } of v1273) {
      if (v1276 === undefined || v1278 < v1276) {
        v1276 = v1278;
      }
      if (v1277 === undefined || v1279 > v1277) {
        v1277 = v1279;
      }
    }
    if (!v1276 || !v1277) {
      return;
    }
    if (v19(v1277).diff(v19(v1276), "year") > 5) {
      v20.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");
      return;
    }
    const v1280 = v1158.db.getDateFormat();
    const v1281 = [];
    let v1282 = null;
    let v1283 = v19(v1276);
    while (v1283.valueOf() <= v1277) {
      if (v1158.db.isInvalidDate(v1283, v1280, v1274, v1275)) {
        if (!v1282) {
          v1282 = {
            start: v1283,
            end: v1283
          };
        } else {
          v1282.end = v1283;
        }
      } else if (v1282) {
        v1281.push(v1282);
        v1282 = null;
      }
      v1283 = v1283.add(1, "d");
    }
    const v1284 = v1180.append("g").selectAll("rect").data(v1281).enter();
    v1284.append("rect").attr("id", v1285 => v1156 + "-exclude-" + v1285.start.format("YYYY-MM-DD")).attr("x", v1286 => v1181(v1286.start.startOf("day")) + v1270).attr("y", v1159.gridLineStartPadding).attr("width", v1287 => v1181(v1287.end.endOf("day")) - v1181(v1287.start.startOf("day"))).attr("height", v1272 - v1269 - v1159.gridLineStartPadding).attr("transform-origin", function (v1288, v1289) {
      return (v1181(v1288.start) + v1270 + (v1181(v1288.end) - v1181(v1288.start)) * 0.5).toString() + "px " + (v1289 * v1268 + v1272 * 0.5).toString() + "px";
    }).attr("class", "exclude-range");
  }
  v15(v1199, "drawExcludeDays");
  function v1290(v1291, v1292, v1293, v1294) {
    if (v1293 <= 0 || v1291 > v1292) {
      return Infinity;
    }
    const v1295 = v1292 - v1291;
    const v1296 = v19.duration({
      [v1294 ?? "day"]: v1293
    }).asMilliseconds();
    if (v1296 <= 0) {
      return Infinity;
    }
    return Math.ceil(v1295 / v1296);
  }
  v15(v1290, "getEstimatedTickCount");
  function v1200(v1297, v1298, v1299, v1300) {
    const v1301 = v1158.db.getDateFormat();
    const v1302 = v1158.db.getAxisFormat();
    let v1303;
    if (v1302) {
      v1303 = v1302;
    } else if (v1301 === "D") {
      v1303 = "%d";
    } else {
      v1303 = v1159.axisFormat ?? "%Y-%m-%d";
    }
    let v1304 = axisBottom(v1181).tickSize(-v1300 + v1298 + v1159.gridLineStartPadding).tickFormat(timeFormat(v1303));
    const v1305 = /^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/;
    const v1306 = v1305.exec(v1158.db.getTickInterval() || v1159.tickInterval);
    if (v1306 !== null) {
      const v1307 = parseInt(v1306[1], 10);
      if (isNaN(v1307) || v1307 <= 0) {
        v20.warn("Invalid tick interval value: \"" + v1306[1] + "\". Skipping custom tick interval.");
      } else {
        const v1308 = v1306[2];
        const v1309 = v1158.db.getWeekday() || v1159.weekday;
        const v1310 = v1181.domain();
        const v1311 = v1310[0];
        const v1312 = v1310[1];
        const v1313 = v1290(v1311, v1312, v1307, v1308);
        if (v1313 > MAX_TICK_COUNT) {
          v20.warn("The tick interval \"" + v1307 + v1308 + "\" would generate " + v1313 + " ticks, which exceeds the maximum allowed (" + MAX_TICK_COUNT + "). This may indicate an invalid date or time range. Skipping custom tick interval.");
        } else {
          switch (v1308) {
            case "millisecond":
              v1304.ticks(millisecond.every(v1307));
              break;
            case "second":
              v1304.ticks(second.every(v1307));
              break;
            case "minute":
              v1304.ticks(timeMinute.every(v1307));
              break;
            case "hour":
              v1304.ticks(timeHour.every(v1307));
              break;
            case "day":
              v1304.ticks(timeDay.every(v1307));
              break;
            case "week":
              v1304.ticks(mapWeekdayToTimeFunction[v1309].every(v1307));
              break;
            case "month":
              v1304.ticks(timeMonth.every(v1307));
              break;
          }
        }
      }
    }
    v1180.append("g").attr("class", "grid").attr("transform", "translate(" + v1297 + ", " + (v1300 - 50) + ")").call(v1304).selectAll("text").style("text-anchor", "middle").attr("fill", "#000").attr("stroke", "none").attr("font-size", 10).attr("dy", "1em");
    if (v1158.db.topAxisEnabled() || v1159.topAxis) {
      let v1314 = axisTop(v1181).tickSize(-v1300 + v1298 + v1159.gridLineStartPadding).tickFormat(timeFormat(v1303));
      if (v1306 !== null) {
        const v1315 = parseInt(v1306[1], 10);
        if (isNaN(v1315) || v1315 <= 0) {
          v20.warn("Invalid tick interval value: \"" + v1306[1] + "\". Skipping custom tick interval.");
        } else {
          const v1316 = v1306[2];
          const v1317 = v1158.db.getWeekday() || v1159.weekday;
          const v1318 = v1181.domain();
          const v1319 = v1318[0];
          const v1320 = v1318[1];
          const v1321 = v1290(v1319, v1320, v1315, v1316);
          if (v1321 <= MAX_TICK_COUNT) {
            switch (v1316) {
              case "millisecond":
                v1314.ticks(millisecond.every(v1315));
                break;
              case "second":
                v1314.ticks(second.every(v1315));
                break;
              case "minute":
                v1314.ticks(timeMinute.every(v1315));
                break;
              case "hour":
                v1314.ticks(timeHour.every(v1315));
                break;
              case "day":
                v1314.ticks(timeDay.every(v1315));
                break;
              case "week":
                v1314.ticks(mapWeekdayToTimeFunction[v1317].every(v1315));
                break;
              case "month":
                v1314.ticks(timeMonth.every(v1315));
                break;
            }
          }
        }
      }
      v1180.append("g").attr("class", "grid").attr("transform", "translate(" + v1297 + ", " + v1298 + ")").call(v1314).selectAll("text").style("text-anchor", "middle").attr("fill", "#000").attr("stroke", "none").attr("font-size", 10);
    }
  }
  v15(v1200, "makeGrid");
  function v1202(v1322, v1323) {
    let v1324 = 0;
    const v1325 = Object.keys(v1171).map(v1326 => [v1326, v1171[v1326]]);
    v1180.append("g").selectAll("text").data(v1325).enter().append(function (v1327) {
      const v1328 = v1327[0].split(v21.lineBreakRegex);
      const v1329 = -(v1328.length - 1) / 2;
      const v1330 = v1163.createElementNS("http://www.w3.org/2000/svg", "text");
      v1330.setAttribute("dy", v1329 + "em");
      for (const [v1331, v1332] of v1328.entries()) {
        const v1333 = v1163.createElementNS("http://www.w3.org/2000/svg", "tspan");
        v1333.setAttribute("alignment-baseline", "central");
        v1333.setAttribute("x", "10");
        if (v1331 > 0) {
          v1333.setAttribute("dy", "1em");
        }
        v1333.textContent = v1332;
        v1330.appendChild(v1333);
      }
      return v1330;
    }).attr("x", 10).attr("y", function (v1334, v1335) {
      if (v1335 > 0) {
        for (let v1336 = 0; v1336 < v1335; v1336++) {
          v1324 += v1325[v1335 - 1][1];
          return v1334[1] * v1322 / 2 + v1324 * v1322 + v1323;
        }
      } else {
        return v1334[1] * v1322 / 2 + v1323;
      }
    }).attr("font-size", v1159.sectionFontSize).attr("class", function (v1337) {
      for (const [v1338, v1339] of v1168.entries()) {
        if (v1337[0] === v1339) {
          return "sectionTitle sectionTitle" + v1338 % v1159.numberSectionStyles;
        }
      }
      return "sectionTitle";
    });
  }
  v15(v1202, "vertLabels");
  function v1203(v1340, v1341, v1342, v1343) {
    const v1344 = v1158.db.getTodayMarker();
    if (v1344 === "off") {
      return;
    }
    const v1345 = v1180.append("g").attr("class", "today");
    const v1346 = new Date();
    const v1347 = v1345.append("line");
    v1347.attr("x1", v1181(v1346) + v1340).attr("x2", v1181(v1346) + v1340).attr("y1", v1159.titleTopMargin).attr("y2", v1343 - v1159.titleTopMargin).attr("class", "today");
    if (v1344 !== "") {
      v1347.attr("style", v1344.replace(/,/g, ";"));
    }
  }
  v15(v1203, "drawToday");
  function v1170(v1348) {
    const v1349 = {};
    const v1350 = [];
    for (let v1351 = 0, v1352 = v1348.length; v1351 < v1352; ++v1351) {
      if (!Object.prototype.hasOwnProperty.call(v1349, v1348[v1351])) {
        v1349[v1348[v1351]] = true;
        v1350.push(v1348[v1351]);
      }
    }
    return v1350;
  }
  v15(v1170, "checkUnique");
}, "draw");
var ganttRenderer_default = {
  setConf: setConf,
  draw: draw
};
var getStyles = v15(v1353 => "\n  .mermaid-main-font {\n        font-family: " + v1353.fontFamily + ";\n  }\n\n  .exclude-range {\n    fill: " + v1353.excludeBkgColor + ";\n  }\n\n  .section {\n    stroke: none;\n    opacity: 0.2;\n  }\n\n  .section0 {\n    fill: " + v1353.sectionBkgColor + ";\n  }\n\n  .section2 {\n    fill: " + v1353.sectionBkgColor2 + ";\n  }\n\n  .section1,\n  .section3 {\n    fill: " + v1353.altSectionBkgColor + ";\n    opacity: 0.2;\n  }\n\n  .sectionTitle0 {\n    fill: " + v1353.titleColor + ";\n  }\n\n  .sectionTitle1 {\n    fill: " + v1353.titleColor + ";\n  }\n\n  .sectionTitle2 {\n    fill: " + v1353.titleColor + ";\n  }\n\n  .sectionTitle3 {\n    fill: " + v1353.titleColor + ";\n  }\n\n  .sectionTitle {\n    text-anchor: start;\n    font-family: " + v1353.fontFamily + ";\n  }\n\n\n  /* Grid and axis */\n\n  .grid .tick {\n    stroke: " + v1353.gridColor + ";\n    opacity: 0.8;\n    shape-rendering: crispEdges;\n  }\n\n  .grid .tick text {\n    font-family: " + v1353.fontFamily + ";\n    fill: " + v1353.textColor + ";\n  }\n\n  .grid path {\n    stroke-width: 0;\n  }\n\n\n  /* Today line */\n\n  .today {\n    fill: none;\n    stroke: " + v1353.todayLineColor + ";\n    stroke-width: 2px;\n  }\n\n\n  /* Task styling */\n\n  /* Default task */\n\n  .task {\n    stroke-width: 2;\n  }\n\n  .taskText {\n    text-anchor: middle;\n    font-family: " + v1353.fontFamily + ";\n  }\n\n  .taskTextOutsideRight {\n    fill: " + v1353.taskTextDarkColor + ";\n    text-anchor: start;\n    font-family: " + v1353.fontFamily + ";\n  }\n\n  .taskTextOutsideLeft {\n    fill: " + v1353.taskTextDarkColor + ";\n    text-anchor: end;\n  }\n\n\n  /* Special case clickable */\n\n  .task.clickable {\n    cursor: pointer;\n  }\n\n  .taskText.clickable {\n    cursor: pointer;\n    fill: " + v1353.taskTextClickableColor + " !important;\n    font-weight: bold;\n  }\n\n  .taskTextOutsideLeft.clickable {\n    cursor: pointer;\n    fill: " + v1353.taskTextClickableColor + " !important;\n    font-weight: bold;\n  }\n\n  .taskTextOutsideRight.clickable {\n    cursor: pointer;\n    fill: " + v1353.taskTextClickableColor + " !important;\n    font-weight: bold;\n  }\n\n\n  /* Specific task settings for the sections*/\n\n  .taskText0,\n  .taskText1,\n  .taskText2,\n  .taskText3 {\n    fill: " + v1353.taskTextColor + ";\n  }\n\n  .task0,\n  .task1,\n  .task2,\n  .task3 {\n    fill: " + v1353.taskBkgColor + ";\n    stroke: " + v1353.taskBorderColor + ";\n  }\n\n  .taskTextOutside0,\n  .taskTextOutside2\n  {\n    fill: " + v1353.taskTextOutsideColor + ";\n  }\n\n  .taskTextOutside1,\n  .taskTextOutside3 {\n    fill: " + v1353.taskTextOutsideColor + ";\n  }\n\n\n  /* Active task */\n\n  .active0,\n  .active1,\n  .active2,\n  .active3 {\n    fill: " + v1353.activeTaskBkgColor + ";\n    stroke: " + v1353.activeTaskBorderColor + ";\n  }\n\n  .activeText0,\n  .activeText1,\n  .activeText2,\n  .activeText3 {\n    fill: " + v1353.taskTextDarkColor + " !important;\n  }\n\n\n  /* Completed task */\n\n  .done0,\n  .done1,\n  .done2,\n  .done3 {\n    stroke: " + v1353.doneTaskBorderColor + ";\n    fill: " + v1353.doneTaskBkgColor + ";\n    stroke-width: 2;\n  }\n\n  .doneText0,\n  .doneText1,\n  .doneText2,\n  .doneText3 {\n    fill: " + v1353.taskTextDarkColor + " !important;\n  }\n\n  /* Done task text displayed outside the bar sits against the diagram background,\n     not against the done-task bar, so it must use the outside/contrast color. */\n  .doneText0.taskTextOutsideLeft,\n  .doneText0.taskTextOutsideRight,\n  .doneText1.taskTextOutsideLeft,\n  .doneText1.taskTextOutsideRight,\n  .doneText2.taskTextOutsideLeft,\n  .doneText2.taskTextOutsideRight,\n  .doneText3.taskTextOutsideLeft,\n  .doneText3.taskTextOutsideRight {\n    fill: " + v1353.taskTextOutsideColor + " !important;\n  }\n\n\n  /* Tasks on the critical line */\n\n  .crit0,\n  .crit1,\n  .crit2,\n  .crit3 {\n    stroke: " + v1353.critBorderColor + ";\n    fill: " + v1353.critBkgColor + ";\n    stroke-width: 2;\n  }\n\n  .activeCrit0,\n  .activeCrit1,\n  .activeCrit2,\n  .activeCrit3 {\n    stroke: " + v1353.critBorderColor + ";\n    fill: " + v1353.activeTaskBkgColor + ";\n    stroke-width: 2;\n  }\n\n  .doneCrit0,\n  .doneCrit1,\n  .doneCrit2,\n  .doneCrit3 {\n    stroke: " + v1353.critBorderColor + ";\n    fill: " + v1353.doneTaskBkgColor + ";\n    stroke-width: 2;\n    cursor: pointer;\n    shape-rendering: crispEdges;\n  }\n\n  .milestone {\n    transform: rotate(45deg) scale(0.8,0.8);\n  }\n\n  .milestoneText {\n    font-style: italic;\n  }\n  .doneCritText0,\n  .doneCritText1,\n  .doneCritText2,\n  .doneCritText3 {\n    fill: " + v1353.taskTextDarkColor + " !important;\n  }\n\n  /* Done-crit task text outside the bar — same reasoning as doneText above. */\n  .doneCritText0.taskTextOutsideLeft,\n  .doneCritText0.taskTextOutsideRight,\n  .doneCritText1.taskTextOutsideLeft,\n  .doneCritText1.taskTextOutsideRight,\n  .doneCritText2.taskTextOutsideLeft,\n  .doneCritText2.taskTextOutsideRight,\n  .doneCritText3.taskTextOutsideLeft,\n  .doneCritText3.taskTextOutsideRight {\n    fill: " + v1353.taskTextOutsideColor + " !important;\n  }\n\n  .vert {\n    stroke: " + v1353.vertLineColor + ";\n  }\n\n  .vertText {\n    font-size: 15px;\n    text-anchor: middle;\n    fill: " + v1353.vertLineColor + " !important;\n  }\n\n  .activeCritText0,\n  .activeCritText1,\n  .activeCritText2,\n  .activeCritText3 {\n    fill: " + v1353.taskTextDarkColor + " !important;\n  }\n\n  .titleText {\n    text-anchor: middle;\n    font-size: 18px;\n    fill: " + (v1353.titleColor || v1353.textColor) + ";\n    font-family: " + v1353.fontFamily + ";\n  }\n", "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: gantt_default,
  db: ganttDb_default,
  renderer: ganttRenderer_default,
  styles: styles_default
};
export { diagram };