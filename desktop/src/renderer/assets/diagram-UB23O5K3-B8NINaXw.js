import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { s as v2, g as v3, o as v4, n as v5, a as v6, b as v7, _ as v8, D as v9, p as v10, A as v11, y as v12, B as v13, l as v14, E as v15, e as v16 } from "./index-CXb3UsfP.js";
import { p as v17 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var defaultOptions = {
  showLegend: true,
  ticks: 5,
  max: null,
  min: 0,
  graticule: "circle"
};
var MAX_TICKS = 32;
var defaultRadarData = {
  axes: [],
  curves: [],
  options: defaultOptions
};
var data = structuredClone(defaultRadarData);
var DEFAULT_RADAR_CONFIG = v13.radar;
var getConfig2 = v8(() => {
  const v18 = v11({
    ...DEFAULT_RADAR_CONFIG,
    ...v12().radar
  });
  return v18;
}, "getConfig");
var getAxes = v8(() => data.axes, "getAxes");
var getCurves = v8(() => data.curves, "getCurves");
var getOptions = v8(() => data.options, "getOptions");
var setAxes = v8(v19 => {
  data.axes = v19.map(v20 => {
    return {
      name: v20.name,
      label: v20.label ?? v20.name
    };
  });
}, "setAxes");
var setCurves = v8(v21 => {
  data.curves = v21.map(v22 => {
    return {
      name: v22.name,
      label: v22.label ?? v22.name,
      entries: computeCurveEntries(v22.entries)
    };
  });
}, "setCurves");
var computeCurveEntries = v8(v23 => {
  if (v23[0].axis == undefined) {
    return v23.map(v24 => v24.value);
  }
  const v25 = getAxes();
  if (v25.length === 0) {
    throw new Error("Axes must be populated before curves for reference entries");
  }
  return v25.map(v26 => {
    const v27 = v23.find(v28 => v28.axis?.$refText === v26.name);
    if (v27 === undefined) {
      throw new Error("Missing entry for axis " + v26.label);
    }
    return v27.value;
  });
}, "computeCurveEntries");
var setOptions = v8(v29 => {
  const v30 = v29.reduce((v31, v32) => {
    v31[v32.name] = v32;
    return v31;
  }, {});
  data.options = {
    showLegend: v30.showLegend?.value ?? defaultOptions.showLegend,
    ticks: v30.ticks?.value ?? defaultOptions.ticks,
    max: v30.max?.value ?? defaultOptions.max,
    min: v30.min?.value ?? defaultOptions.min,
    graticule: v30.graticule?.value ?? defaultOptions.graticule
  };
  if (data.options.ticks > MAX_TICKS) {
    v14.warn("Radar diagram ticks (" + data.options.ticks + ") exceeds maximum allowed (" + MAX_TICKS + "). Using " + MAX_TICKS + " instead.");
    data.options.ticks = MAX_TICKS;
  }
}, "setOptions");
var clear2 = v8(() => {
  v10();
  data = structuredClone(defaultRadarData);
}, "clear");
var db = {
  getAxes: getAxes,
  getCurves: getCurves,
  getOptions: getOptions,
  setAxes: setAxes,
  setCurves: setCurves,
  setOptions: setOptions,
  getConfig: getConfig2,
  clear: clear2,
  setAccTitle: v7,
  getAccTitle: v6,
  setDiagramTitle: v5,
  getDiagramTitle: v4,
  getAccDescription: v3,
  setAccDescription: v2
};
var populate = v8(v33 => {
  v1(v33, db);
  const {
    axes: v34,
    curves: v35,
    options: v36
  } = v33;
  db.setAxes(v34);
  db.setCurves(v35);
  db.setOptions(v36);
}, "populate");
var parser = {
  parse: v8(async v37 => {
    const v38 = await v17("radar", v37);
    v14.debug(v38);
    populate(v38);
  }, "parse")
};
var draw = v8((v39, v40, v41, v42) => {
  const v43 = v42.db;
  const v44 = v43.getAxes();
  const v45 = v43.getCurves();
  const v46 = v43.getOptions();
  const v47 = v43.getConfig();
  const v48 = v43.getDiagramTitle();
  const v49 = v9(v40);
  const v50 = drawFrame(v49, v47);
  const v51 = v46.max ?? Math.max(...v45.map(v52 => Math.max(...v52.entries)));
  const v53 = v46.min;
  const v54 = Math.min(v47.width, v47.height) / 2;
  drawGraticule(v50, v44, v54, v46.ticks, v46.graticule);
  drawAxes(v50, v44, v54, v47);
  drawCurves(v50, v44, v45, v53, v51, v46.graticule, v47);
  drawLegend(v50, v45, v46.showLegend, v47);
  v50.append("text").attr("class", "radarTitle").text(v48).attr("x", 0).attr("y", -v47.height / 2 - v47.marginTop);
}, "draw");
var drawFrame = v8((v55, v56) => {
  const v57 = v56.width + v56.marginLeft + v56.marginRight;
  const v58 = v56.height + v56.marginTop + v56.marginBottom;
  const v59 = {
    x: v56.marginLeft + v56.width / 2,
    y: v56.marginTop + v56.height / 2
  };
  v16(v55, v58, v57, v56.useMaxWidth ?? true);
  v55.attr("viewBox", "0 0 " + v57 + " " + v58).attr("overflow", "visible");
  return v55.append("g").attr("transform", "translate(" + v59.x + ", " + v59.y + ")");
}, "drawFrame");
var drawGraticule = v8((v60, v61, v62, v63, v64) => {
  if (v64 === "circle") {
    for (let v65 = 0; v65 < v63; v65++) {
      const v66 = v62 * (v65 + 1) / v63;
      v60.append("circle").attr("r", v66).attr("class", "radarGraticule");
    }
  } else if (v64 === "polygon") {
    const v67 = v61.length;
    for (let v68 = 0; v68 < v63; v68++) {
      const v69 = v62 * (v68 + 1) / v63;
      const v70 = v61.map((v71, v72) => {
        const v73 = v72 * 2 * Math.PI / v67 - Math.PI / 2;
        const v74 = v69 * Math.cos(v73);
        const v75 = v69 * Math.sin(v73);
        return v74 + "," + v75;
      }).join(" ");
      v60.append("polygon").attr("points", v70).attr("class", "radarGraticule");
    }
  }
}, "drawGraticule");
var drawAxes = v8((v76, v77, v78, v79) => {
  const v80 = v77.length;
  for (let v81 = 0; v81 < v80; v81++) {
    const v82 = v77[v81].label;
    const v83 = v81 * 2 * Math.PI / v80 - Math.PI / 2;
    const v84 = Math.cos(v83);
    const v85 = Math.sin(v83);
    v76.append("line").attr("x1", 0).attr("y1", 0).attr("x2", v78 * v79.axisScaleFactor * v84).attr("y2", v78 * v79.axisScaleFactor * v85).attr("class", "radarAxisLine");
    const v86 = v84 > 0.01 ? "start" : v84 < -0.01 ? "end" : "middle";
    const v87 = v85 > 0.01 ? "hanging" : v85 < -0.01 ? "auto" : "central";
    const v88 = 4;
    v76.append("text").text(v82).attr("x", v78 * v79.axisLabelFactor * v84 + v88 * v84).attr("y", v78 * v79.axisLabelFactor * v85 + v88 * v85).attr("text-anchor", v86).attr("dominant-baseline", v87).attr("class", "radarAxisLabel");
  }
}, "drawAxes");
function drawCurves(v89, v90, v91, v92, v93, v94, v95) {
  const v96 = v90.length;
  const v97 = Math.min(v95.width, v95.height) / 2;
  v91.forEach((v98, v99) => {
    if (v98.entries.length !== v96) {
      return;
    }
    const v100 = v98.entries.map((v101, v102) => {
      const v103 = Math.PI * 2 * v102 / v96 - Math.PI / 2;
      const v104 = relativeRadius(v101, v92, v93, v97);
      const v105 = v104 * Math.cos(v103);
      const v106 = v104 * Math.sin(v103);
      return {
        x: v105,
        y: v106
      };
    });
    if (v94 === "circle") {
      v89.append("path").attr("d", closedRoundCurve(v100, v95.curveTension)).attr("class", "radarCurve-" + v99);
    } else if (v94 === "polygon") {
      v89.append("polygon").attr("points", v100.map(v107 => v107.x + "," + v107.y).join(" ")).attr("class", "radarCurve-" + v99);
    }
  });
}
v8(drawCurves, "drawCurves");
function relativeRadius(v108, v109, v110, v111) {
  const v112 = Math.min(Math.max(v108, v109), v110);
  return v111 * (v112 - v109) / (v110 - v109);
}
v8(relativeRadius, "relativeRadius");
function closedRoundCurve(v113, v114) {
  const v115 = v113.length;
  let v116 = "M" + v113[0].x + "," + v113[0].y;
  for (let v117 = 0; v117 < v115; v117++) {
    const v118 = v113[(v117 - 1 + v115) % v115];
    const v119 = v113[v117];
    const v120 = v113[(v117 + 1) % v115];
    const v121 = v113[(v117 + 2) % v115];
    const v122 = {
      x: v119.x + (v120.x - v118.x) * v114,
      y: v119.y + (v120.y - v118.y) * v114
    };
    const v123 = {
      x: v120.x - (v121.x - v119.x) * v114,
      y: v120.y - (v121.y - v119.y) * v114
    };
    v116 += " C" + v122.x + "," + v122.y + " " + v123.x + "," + v123.y + " " + v120.x + "," + v120.y;
  }
  return v116 + " Z";
}
v8(closedRoundCurve, "closedRoundCurve");
function drawLegend(v124, v125, v126, v127) {
  if (!v126) {
    return;
  }
  const v128 = (v127.width / 2 + v127.marginRight) * 3 / 4;
  const v129 = -(v127.height / 2 + v127.marginTop) * 3 / 4;
  const v130 = 20;
  v125.forEach((v131, v132) => {
    const v133 = v124.append("g").attr("transform", "translate(" + v128 + ", " + (v129 + v132 * v130) + ")");
    v133.append("rect").attr("width", 12).attr("height", 12).attr("class", "radarLegendBox-" + v132);
    v133.append("text").attr("x", 16).attr("y", 0).attr("class", "radarLegendText").text(v131.label);
  });
}
v8(drawLegend, "drawLegend");
var renderer = {
  draw: draw
};
var genIndexStyles = v8((v134, v135) => {
  let v136 = "";
  for (let v137 = 0; v137 < v134.THEME_COLOR_LIMIT; v137++) {
    const v138 = v134["cScale" + v137];
    v136 += "\n\t\t.radarCurve-" + v137 + " {\n\t\t\tcolor: " + v138 + ";\n\t\t\tfill: " + v138 + ";\n\t\t\tfill-opacity: " + v135.curveOpacity + ";\n\t\t\tstroke: " + v138 + ";\n\t\t\tstroke-width: " + v135.curveStrokeWidth + ";\n\t\t}\n\t\t.radarLegendBox-" + v137 + " {\n\t\t\tfill: " + v138 + ";\n\t\t\tfill-opacity: " + v135.curveOpacity + ";\n\t\t\tstroke: " + v138 + ";\n\t\t}\n\t\t";
  }
  return v136;
}, "genIndexStyles");
var buildRadarStyleOptions = v8(v139 => {
  const v140 = v15();
  const v141 = v12();
  const v142 = v11(v140, v141.themeVariables);
  const v143 = v11(v142.radar, v139);
  return {
    themeVariables: v142,
    radarOptions: v143
  };
}, "buildRadarStyleOptions");
var styles = v8(({
  radar: v144
} = {}) => {
  const {
    themeVariables: v145,
    radarOptions: v146
  } = buildRadarStyleOptions(v144);
  return "\n\t.radarTitle {\n\t\tfont-size: " + v145.fontSize + ";\n\t\tcolor: " + v145.titleColor + ";\n\t\tdominant-baseline: hanging;\n\t\ttext-anchor: middle;\n\t}\n\t.radarAxisLine {\n\t\tstroke: " + v146.axisColor + ";\n\t\tstroke-width: " + v146.axisStrokeWidth + ";\n\t}\n\t.radarAxisLabel {\n\t\tfont-size: " + v146.axisLabelFontSize + "px;\n\t\tcolor: " + v146.axisColor + ";\n\t}\n\t.radarGraticule {\n\t\tfill: " + v146.graticuleColor + ";\n\t\tfill-opacity: " + v146.graticuleOpacity + ";\n\t\tstroke: " + v146.graticuleColor + ";\n\t\tstroke-width: " + v146.graticuleStrokeWidth + ";\n\t}\n\t.radarLegendText {\n\t\ttext-anchor: start;\n\t\tfont-size: " + v146.legendFontSize + "px;\n\t\tdominant-baseline: hanging;\n\t}\n\t" + genIndexStyles(v145, v146) + "\n\t";
}, "styles");
var diagram = {
  parser: parser,
  db: db,
  renderer: renderer,
  styles: styles
};
export { diagram };