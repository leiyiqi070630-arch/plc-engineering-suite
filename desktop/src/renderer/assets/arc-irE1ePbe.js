import { Y as v1, $ as v2, a0 as v3, a1 as v4, a2 as v5, a3 as v6, a4 as v7, a5 as v8, a6 as v9, a7 as v10, a8 as v11, a9 as v12, aa as v13, ab as v14, ac as v15 } from "./index-CXb3UsfP.js";
function arcInnerRadius(v16) {
  return v16.innerRadius;
}
function arcOuterRadius(v17) {
  return v17.outerRadius;
}
function arcStartAngle(v18) {
  return v18.startAngle;
}
function arcEndAngle(v19) {
  return v19.endAngle;
}
function arcPadAngle(v20) {
  return v20 && v20.padAngle;
}
function intersect(v21, v22, v23, v24, v25, v26, v27, v28) {
  var v29 = v23 - v21;
  var v30 = v24 - v22;
  var v31 = v27 - v25;
  var v32 = v28 - v26;
  var v33 = v32 * v29 - v31 * v30;
  if (v33 * v33 < v3) {
    return;
  }
  v33 = (v31 * (v22 - v26) - v32 * (v21 - v25)) / v33;
  return [v21 + v33 * v29, v22 + v33 * v30];
}
function cornerTangents(v34, v35, v36, v37, v38, v39, v40) {
  var v41 = v34 - v36;
  var v42 = v35 - v37;
  var v43 = (v40 ? v39 : -v39) / v10(v41 * v41 + v42 * v42);
  var v44 = v43 * v42;
  var v45 = -v43 * v41;
  var v46 = v34 + v44;
  var v47 = v35 + v45;
  var v48 = v36 + v44;
  var v49 = v37 + v45;
  var v50 = (v46 + v48) / 2;
  var v51 = (v47 + v49) / 2;
  var v52 = v48 - v46;
  var v53 = v49 - v47;
  var v54 = v52 * v52 + v53 * v53;
  var v55 = v38 - v39;
  var v56 = v46 * v49 - v48 * v47;
  var v57 = (v53 < 0 ? -1 : 1) * v10(v15(0, v55 * v55 * v54 - v56 * v56));
  var v58 = (v56 * v53 - v52 * v57) / v54;
  var v59 = (-v56 * v52 - v53 * v57) / v54;
  var v60 = (v56 * v53 + v52 * v57) / v54;
  var v61 = (-v56 * v52 + v53 * v57) / v54;
  var v62 = v58 - v50;
  var v63 = v59 - v51;
  var v64 = v60 - v50;
  var v65 = v61 - v51;
  if (v62 * v62 + v63 * v63 > v64 * v64 + v65 * v65) {
    v58 = v60;
    v59 = v61;
  }
  return {
    cx: v58,
    cy: v59,
    x01: -v44,
    y01: -v45,
    x11: v58 * (v38 / v55 - 1),
    y11: v59 * (v38 / v55 - 1)
  };
}
function d3arc() {
  var v66 = arcInnerRadius;
  var v67 = arcOuterRadius;
  var v68 = v12(0);
  var v69 = null;
  var v70 = arcStartAngle;
  var v71 = arcEndAngle;
  var v72 = arcPadAngle;
  var v73 = null;
  var v74 = v1(v75);
  function v75() {
    var v76;
    var v77;
    var v78 = +v66.apply(this, arguments);
    var v79 = +v67.apply(this, arguments);
    var v80 = v70.apply(this, arguments) - v2;
    var v81 = v71.apply(this, arguments) - v2;
    var v82 = v8(v81 - v80);
    var v83 = v81 > v80;
    if (!v73) {
      v73 = v76 = v74();
    }
    if (v79 < v78) {
      v77 = v79;
      v79 = v78;
      v78 = v77;
    }
    if (!(v79 > v3)) {
      v73.moveTo(0, 0);
    } else if (v82 > v4 - v3) {
      v73.moveTo(v79 * v5(v80), v79 * v6(v80));
      v73.arc(0, 0, v79, v80, v81, !v83);
      if (v78 > v3) {
        v73.moveTo(v78 * v5(v81), v78 * v6(v81));
        v73.arc(0, 0, v78, v81, v80, v83);
      }
    } else {
      var v84 = v80;
      var v85 = v81;
      var v86 = v80;
      var v87 = v81;
      var v88 = v82;
      var v89 = v82;
      var v90 = v72.apply(this, arguments) / 2;
      var v91 = v90 > v3 && (v69 ? +v69.apply(this, arguments) : v10(v78 * v78 + v79 * v79));
      var v92 = v7(v8(v79 - v78) / 2, +v68.apply(this, arguments));
      var v93 = v92;
      var v94 = v92;
      var v95;
      var v96;
      if (v91 > v3) {
        var v97 = v13(v91 / v78 * v6(v90));
        var v98 = v13(v91 / v79 * v6(v90));
        if ((v88 -= v97 * 2) > v3) {
          v97 *= v83 ? 1 : -1;
          v86 += v97;
          v87 -= v97;
        } else {
          v88 = 0;
          v86 = v87 = (v80 + v81) / 2;
        }
        if ((v89 -= v98 * 2) > v3) {
          v98 *= v83 ? 1 : -1;
          v84 += v98;
          v85 -= v98;
        } else {
          v89 = 0;
          v84 = v85 = (v80 + v81) / 2;
        }
      }
      var v99 = v79 * v5(v84);
      var v100 = v79 * v6(v84);
      var v101 = v78 * v5(v87);
      var v102 = v78 * v6(v87);
      if (v92 > v3) {
        var v103 = v79 * v5(v85);
        var v104 = v79 * v6(v85);
        var v105 = v78 * v5(v86);
        var v106 = v78 * v6(v86);
        var v107;
        if (v82 < v9) {
          if (v107 = intersect(v99, v100, v105, v106, v103, v104, v101, v102)) {
            var v108 = v99 - v107[0];
            var v109 = v100 - v107[1];
            var v110 = v103 - v107[0];
            var v111 = v104 - v107[1];
            var v112 = 1 / v6(v14((v108 * v110 + v109 * v111) / (v10(v108 * v108 + v109 * v109) * v10(v110 * v110 + v111 * v111))) / 2);
            var v113 = v10(v107[0] * v107[0] + v107[1] * v107[1]);
            v93 = v7(v92, (v78 - v113) / (v112 - 1));
            v94 = v7(v92, (v79 - v113) / (v112 + 1));
          } else {
            v93 = v94 = 0;
          }
        }
      }
      if (!(v89 > v3)) {
        v73.moveTo(v99, v100);
      } else if (v94 > v3) {
        v95 = cornerTangents(v105, v106, v99, v100, v79, v94, v83);
        v96 = cornerTangents(v103, v104, v101, v102, v79, v94, v83);
        v73.moveTo(v95.cx + v95.x01, v95.cy + v95.y01);
        if (v94 < v92) {
          v73.arc(v95.cx, v95.cy, v94, v11(v95.y01, v95.x01), v11(v96.y01, v96.x01), !v83);
        } else {
          v73.arc(v95.cx, v95.cy, v94, v11(v95.y01, v95.x01), v11(v95.y11, v95.x11), !v83);
          v73.arc(0, 0, v79, v11(v95.cy + v95.y11, v95.cx + v95.x11), v11(v96.cy + v96.y11, v96.cx + v96.x11), !v83);
          v73.arc(v96.cx, v96.cy, v94, v11(v96.y11, v96.x11), v11(v96.y01, v96.x01), !v83);
        }
      } else {
        v73.moveTo(v99, v100);
        v73.arc(0, 0, v79, v84, v85, !v83);
      }
      if (!(v78 > v3) || !(v88 > v3)) {
        v73.lineTo(v101, v102);
      } else if (v93 > v3) {
        v95 = cornerTangents(v101, v102, v103, v104, v78, -v93, v83);
        v96 = cornerTangents(v99, v100, v105, v106, v78, -v93, v83);
        v73.lineTo(v95.cx + v95.x01, v95.cy + v95.y01);
        if (v93 < v92) {
          v73.arc(v95.cx, v95.cy, v93, v11(v95.y01, v95.x01), v11(v96.y01, v96.x01), !v83);
        } else {
          v73.arc(v95.cx, v95.cy, v93, v11(v95.y01, v95.x01), v11(v95.y11, v95.x11), !v83);
          v73.arc(0, 0, v78, v11(v95.cy + v95.y11, v95.cx + v95.x11), v11(v96.cy + v96.y11, v96.cx + v96.x11), v83);
          v73.arc(v96.cx, v96.cy, v93, v11(v96.y11, v96.x11), v11(v96.y01, v96.x01), !v83);
        }
      } else {
        v73.arc(0, 0, v78, v87, v86, v83);
      }
    }
    v73.closePath();
    if (v76) {
      v73 = null;
      return v76 + "" || null;
    }
  }
  v75.centroid = function () {
    var v114 = (+v66.apply(this, arguments) + +v67.apply(this, arguments)) / 2;
    var v115 = (+v70.apply(this, arguments) + +v71.apply(this, arguments)) / 2 - v9 / 2;
    return [v5(v115) * v114, v6(v115) * v114];
  };
  v75.innerRadius = function (v116) {
    if (arguments.length) {
      v66 = typeof v116 === "function" ? v116 : v12(+v116);
      return v75;
    } else {
      return v66;
    }
  };
  v75.outerRadius = function (v117) {
    if (arguments.length) {
      v67 = typeof v117 === "function" ? v117 : v12(+v117);
      return v75;
    } else {
      return v67;
    }
  };
  v75.cornerRadius = function (v118) {
    if (arguments.length) {
      v68 = typeof v118 === "function" ? v118 : v12(+v118);
      return v75;
    } else {
      return v68;
    }
  };
  v75.padRadius = function (v119) {
    if (arguments.length) {
      v69 = v119 == null ? null : typeof v119 === "function" ? v119 : v12(+v119);
      return v75;
    } else {
      return v69;
    }
  };
  v75.startAngle = function (v120) {
    if (arguments.length) {
      v70 = typeof v120 === "function" ? v120 : v12(+v120);
      return v75;
    } else {
      return v70;
    }
  };
  v75.endAngle = function (v121) {
    if (arguments.length) {
      v71 = typeof v121 === "function" ? v121 : v12(+v121);
      return v75;
    } else {
      return v71;
    }
  };
  v75.padAngle = function (v122) {
    if (arguments.length) {
      v72 = typeof v122 === "function" ? v122 : v12(+v122);
      return v75;
    } else {
      return v72;
    }
  };
  v75.context = function (v123) {
    if (arguments.length) {
      v73 = v123 == null ? null : v123;
      return v75;
    } else {
      return v73;
    }
  };
  return v75;
}
export { d3arc as d };