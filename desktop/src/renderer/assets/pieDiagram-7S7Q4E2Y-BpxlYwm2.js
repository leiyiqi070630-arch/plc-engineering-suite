import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { a9 as v2, a1 as v3, b6 as v4, g as v5, s as v6, a as v7, b as v8, o as v9, n as v10, _ as v11, l as v12, c as v13, A as v14, D as v15, K as v16, e as v17, p as v18, B as v19 } from "./index-CXb3UsfP.js";
import { p as v20 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
import { d as v21 } from "./arc-irE1ePbe.js";
import { o as v22 } from "./ordinal-CxptdPJm.js";
import "./init-ZxktEp_H.js";
function descending(v23, v24) {
  if (v24 < v23) {
    return -1;
  } else if (v24 > v23) {
    return 1;
  } else if (v24 >= v23) {
    return 0;
  } else {
    return NaN;
  }
}
function identity(v25) {
  return v25;
}
function d3pie() {
  var v26 = identity;
  var v27 = descending;
  var v28 = null;
  var v29 = v2(0);
  var v30 = v2(v3);
  var v31 = v2(0);
  function v32(v33) {
    var v34;
    var v35 = (v33 = v4(v33)).length;
    var v36;
    var v37;
    var v38 = 0;
    var v39 = new Array(v35);
    var v40 = new Array(v35);
    var v41 = +v29.apply(this, arguments);
    var v42 = Math.min(v3, Math.max(-v3, v30.apply(this, arguments) - v41));
    var v43;
    var v44 = Math.min(Math.abs(v42) / v35, v31.apply(this, arguments));
    var v45 = v44 * (v42 < 0 ? -1 : 1);
    var v46;
    for (v34 = 0; v34 < v35; ++v34) {
      if ((v46 = v40[v39[v34] = v34] = +v26(v33[v34], v34, v33)) > 0) {
        v38 += v46;
      }
    }
    if (v27 != null) {
      v39.sort(function (v47, v48) {
        return v27(v40[v47], v40[v48]);
      });
    } else if (v28 != null) {
      v39.sort(function (v49, v50) {
        return v28(v33[v49], v33[v50]);
      });
    }
    v34 = 0;
    v37 = v38 ? (v42 - v35 * v45) / v38 : 0;
    for (; v34 < v35; ++v34, v41 = v43) {
      v36 = v39[v34];
      v46 = v40[v36];
      v43 = v41 + (v46 > 0 ? v46 * v37 : 0) + v45;
      v40[v36] = {
        data: v33[v36],
        index: v34,
        value: v46,
        startAngle: v41,
        endAngle: v43,
        padAngle: v44
      };
    }
    return v40;
  }
  v32.value = function (v51) {
    if (arguments.length) {
      v26 = typeof v51 === "function" ? v51 : v2(+v51);
      return v32;
    } else {
      return v26;
    }
  };
  v32.sortValues = function (v52) {
    if (arguments.length) {
      v27 = v52;
      v28 = null;
      return v32;
    } else {
      return v27;
    }
  };
  v32.sort = function (v53) {
    if (arguments.length) {
      v28 = v53;
      v27 = null;
      return v32;
    } else {
      return v28;
    }
  };
  v32.startAngle = function (v54) {
    if (arguments.length) {
      v29 = typeof v54 === "function" ? v54 : v2(+v54);
      return v32;
    } else {
      return v29;
    }
  };
  v32.endAngle = function (v55) {
    if (arguments.length) {
      v30 = typeof v55 === "function" ? v55 : v2(+v55);
      return v32;
    } else {
      return v30;
    }
  };
  v32.padAngle = function (v56) {
    if (arguments.length) {
      v31 = typeof v56 === "function" ? v56 : v2(+v56);
      return v32;
    } else {
      return v31;
    }
  };
  return v32;
}
var DEFAULT_PIE_CONFIG = v19.pie;
var DEFAULT_PIE_DB = {
  sections: new Map(),
  showData: false
};
var sections = DEFAULT_PIE_DB.sections;
var showData = DEFAULT_PIE_DB.showData;
var config = structuredClone(DEFAULT_PIE_CONFIG);
var getConfig2 = v11(() => structuredClone(config), "getConfig");
var clear2 = v11(() => {
  sections = new Map();
  showData = DEFAULT_PIE_DB.showData;
  v18();
}, "clear");
var addSection = v11(({
  label: v57,
  value: v58
}) => {
  if (v58 < 0) {
    throw new Error("\"" + v57 + "\" has invalid value: " + v58 + ". Negative values are not allowed in pie charts. All slice values must be >= 0.");
  }
  if (!sections.has(v57)) {
    sections.set(v57, v58);
    v12.debug("added new section: " + v57 + ", with value: " + v58);
  }
}, "addSection");
var getSections = v11(() => sections, "getSections");
var setShowData = v11(v59 => {
  showData = v59;
}, "setShowData");
var getShowData = v11(() => showData, "getShowData");
var db = {
  getConfig: getConfig2,
  clear: clear2,
  setDiagramTitle: v10,
  getDiagramTitle: v9,
  setAccTitle: v8,
  getAccTitle: v7,
  setAccDescription: v6,
  getAccDescription: v5,
  addSection: addSection,
  getSections: getSections,
  setShowData: setShowData,
  getShowData: getShowData
};
var populateDb = v11((v60, v61) => {
  v1(v60, v61);
  v61.setShowData(v60.showData);
  v60.sections.map(v61.addSection);
}, "populateDb");
var parser = {
  parse: v11(async v62 => {
    const v63 = await v20("pie", v62);
    v12.debug(v63);
    populateDb(v63, db);
  }, "parse")
};
var getStyles = v11(v64 => "\n  .pieCircle{\n    stroke: " + v64.pieStrokeColor + ";\n    stroke-width : " + v64.pieStrokeWidth + ";\n    opacity : " + v64.pieOpacity + ";\n  }\n  .pieCircle.highlighted{\n    scale: 1.05;\n    opacity: 1;\n  }\n  .pieCircle.highlightedOnHover:hover{\n    transition-duration: 250ms;\n    scale: 1.05;\n    opacity: 1;\n  }\n  .pieOuterCircle{\n    stroke: " + v64.pieOuterStrokeColor + ";\n    stroke-width: " + v64.pieOuterStrokeWidth + ";\n    fill: none;\n  }\n  .pieTitleText {\n    text-anchor: middle;\n    font-size: " + v64.pieTitleTextSize + ";\n    fill: " + v64.pieTitleTextColor + ";\n    font-family: " + v64.fontFamily + ";\n  }\n  .slice {\n    font-family: " + v64.fontFamily + ";\n    fill: " + v64.pieSectionTextColor + ";\n    font-size:" + v64.pieSectionTextSize + ";\n    // fill: white;\n  }\n  .legend text {\n    fill: " + v64.pieLegendTextColor + ";\n    font-family: " + v64.fontFamily + ";\n    font-size: " + v64.pieLegendTextSize + ";\n  }\n", "getStyles");
var pieStyles_default = getStyles;
var createPieArcs = v11(v65 => {
  const v66 = [...v65.values()].reduce((v67, v68) => v67 + v68, 0);
  const v69 = [...v65.entries()].map(([v70, v71]) => ({
    label: v70,
    value: v71
  })).filter(v72 => v72.value / v66 * 100 >= 1);
  const v73 = d3pie().value(v74 => v74.value).sort(null);
  return v73(v69);
}, "createPieArcs");
var draw = v11((v75, v76, v77, v78) => {
  v12.debug("rendering pie chart\n" + v75);
  const v79 = v78.db;
  const v80 = v13();
  const v81 = v14(v79.getConfig(), v80.pie);
  const v82 = 40;
  const v83 = 18;
  const v84 = 4;
  const v85 = 450;
  const v86 = v85;
  const v87 = v15(v76);
  const v88 = v87.append("g");
  v88.attr("transform", "translate(" + v86 / 2 + "," + v85 / 2 + ")");
  const {
    themeVariables: v89
  } = v80;
  let [v90] = v16(v89.pieOuterStrokeWidth);
  v90 ??= 2;
  const v91 = v81.legendPosition;
  const v92 = v81.textPosition;
  const v93 = v81.donutHole > 0 && v81.donutHole <= 0.9 ? v81.donutHole : 0;
  const v94 = Math.min(v86, v85) / 2 - v82;
  const v95 = v21().innerRadius(v93 * v94).outerRadius(v94);
  const v96 = v21().innerRadius(v94 * v92).outerRadius(v94 * v92);
  const v97 = v88.append("g");
  v97.append("circle").attr("cx", 0).attr("cy", 0).attr("r", v94 + v90 / 2).attr("class", "pieOuterCircle");
  const v98 = v79.getSections();
  const v99 = createPieArcs(v98);
  const v100 = [v89.pie1, v89.pie2, v89.pie3, v89.pie4, v89.pie5, v89.pie6, v89.pie7, v89.pie8, v89.pie9, v89.pie10, v89.pie11, v89.pie12];
  let v101 = 0;
  v98.forEach(v102 => {
    v101 += v102;
  });
  const v103 = v99.filter(v104 => (v104.data.value / v101 * 100).toFixed(0) !== "0");
  const v105 = v22(v100).domain([...v98.keys()]);
  v97.selectAll("mySlices").data(v103).enter().append("path").attr("d", v95).attr("fill", v106 => {
    return v105(v106.data.label);
  }).attr("class", v107 => {
    let v108 = "pieCircle";
    if (v81.highlightSlice === "hover") {
      v108 += " highlightedOnHover";
    } else if (v81.highlightSlice === v107.data.label) {
      v108 += " highlighted";
    }
    return v108;
  });
  v97.selectAll("mySlices").data(v103).enter().append("text").text(v109 => {
    return (v109.data.value / v101 * 100).toFixed(0) + "%";
  }).attr("transform", v110 => {
    return "translate(" + v96.centroid(v110) + ")";
  }).style("text-anchor", "middle").attr("class", "slice");
  const v111 = v88.append("text").text(v79.getDiagramTitle()).attr("x", 0).attr("y", -200).attr("class", "pieTitleText");
  const v112 = [...v98.entries()].map(([v113, v114]) => ({
    label: v113,
    value: v114
  }));
  const v115 = v88.selectAll(".legend").data(v112).enter().append("g").attr("class", "legend");
  v115.append("rect").attr("width", v83).attr("height", v83).style("fill", v116 => v105(v116.label)).style("stroke", v117 => v105(v117.label));
  v115.append("text").attr("x", v83 + v84).attr("y", v83 - v84).text(v118 => {
    if (v79.getShowData()) {
      return v118.label + " [" + v118.value + "]";
    }
    return v118.label;
  });
  const v119 = Math.max(...v115.selectAll("text").nodes().map(v120 => v120?.getBoundingClientRect().width ?? 0));
  let v121 = v85;
  let v122 = v86 + v82;
  const v123 = v83 + v84;
  const v124 = v112.length * v123;
  switch (v91) {
    case "center":
      v115.attr("transform", (v125, v126) => {
        const v127 = v123 * v112.length / 2;
        const v128 = -v119 / 2 - (v83 + v84);
        const v129 = v126 * v123 - v127;
        return "translate(" + v128 + "," + v129 + ")";
      });
      break;
    case "top":
      v121 += v124;
      v115.attr("transform", (v130, v131) => {
        const v132 = v94;
        const v133 = -v119 / 2 - (v83 + v84);
        const v134 = v131 * v123 - v132;
        return "translate(" + v133 + ", " + v134 + ")";
      });
      v97.attr("transform", () => {
        return "translate(0, " + (v124 + v123) + ")";
      });
      break;
    case "bottom":
      v121 += v124;
      v115.attr("transform", (v135, v136) => {
        const v137 = -v94 - v123;
        const v138 = -v119 / 2 - (v83 + v84);
        const v139 = v136 * v123 - v137;
        return "translate(" + v138 + "," + v139 + ")";
      });
      break;
    case "left":
      v122 += v83 + v84 + v119;
      v115.attr("transform", (v140, v141) => {
        const v142 = v123 * v112.length / 2;
        const v143 = -v94 - (v83 + v84);
        const v144 = v141 * v123 - v142;
        return "translate(" + v143 + "," + v144 + ")";
      });
      v97.attr("transform", () => {
        return "translate(" + (v119 + v83 + v84) + ", 0)";
      });
      break;
    case "right":
    default:
      v122 += v83 + v84 + v119;
      v115.attr("transform", (v145, v146) => {
        const v147 = v123 * v112.length / 2;
        const v148 = v83 * 12;
        const v149 = v146 * v123 - v147;
        return "translate(" + v148 + "," + v149 + ")";
      });
      break;
  }
  const v150 = v111.node()?.getBoundingClientRect().width ?? 0;
  const v151 = v86 / 2 - v150 / 2;
  const v152 = v86 / 2 + v150 / 2;
  const v153 = Math.min(0, v151);
  const v154 = Math.max(v122, v152);
  const v155 = v154 - v153;
  v87.attr("viewBox", v153 + " 0 " + v155 + " " + v121);
  v17(v87, v121, v155, v81.useMaxWidth);
}, "draw");
var renderer = {
  draw: draw
};
var diagram = {
  parser: parser,
  db: db,
  renderer: renderer,
  styles: pieStyles_default
};
export { diagram };