import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { s as v2, g as v3, o as v4, n as v5, a as v6, b as v7, _ as v8, l as v9, D as v10, e as v11, p as v12, A as v13, y as v14, B as v15, E as v16 } from "./index-CXb3UsfP.js";
import { p as v17 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var createDefaultData = v8(() => ({
  domains: new Map(),
  transitions: []
}), "createDefaultData");
var data = createDefaultData();
var getDomains = v8(() => data.domains, "getDomains");
var getTransitions = v8(() => data.transitions, "getTransitions");
var setDomains = v8(v18 => {
  if (!v18) {
    return;
  }
  for (const v19 of v18) {
    const v20 = v19.domain;
    const v21 = (v19.items ?? []).map(v22 => ({
      label: v22.label
    }));
    data.domains.set(v20, {
      name: v20,
      items: v21
    });
  }
}, "setDomains");
var setTransitions = v8(v23 => {
  if (!v23) {
    return;
  }
  data.transitions = v23.filter(v24 => {
    if (v24.from === v24.to) {
      v9.warn("Cynefin: self-loop transition on domain \"" + v24.from + "\" is not meaningful and will be skipped.");
      return false;
    }
    return true;
  }).map(v25 => ({
    from: v25.from,
    to: v25.to,
    label: v25.label || undefined
  }));
}, "setTransitions");
var getConfig2 = v8(() => {
  return v13({
    ...v15.cynefin,
    ...v14().cynefin
  });
}, "getConfig");
var clear2 = v8(() => {
  v12();
  data = createDefaultData();
}, "clear");
var db = {
  getDomains: getDomains,
  getTransitions: getTransitions,
  setDomains: setDomains,
  setTransitions: setTransitions,
  getConfig: getConfig2,
  clear: clear2,
  setAccTitle: v7,
  getAccTitle: v6,
  setDiagramTitle: v5,
  getDiagramTitle: v4,
  getAccDescription: v3,
  setAccDescription: v2
};
var populate = v8(v26 => {
  v1(v26, db);
  db.setDomains(v26.domains);
  db.setTransitions(v26.transitions);
}, "populate");
var parser = {
  parse: v8(async v27 => {
    const v28 = await v17("cynefin", v27);
    v9.debug(v28);
    populate(v28);
  }, "parse")
};
function seededRandom(v29) {
  let v30 = v29 + 1831565813 | 0;
  v30 = Math.imul(v30 ^ v30 >>> 15, v30 | 1);
  v30 ^= v30 + Math.imul(v30 ^ v30 >>> 7, v30 | 61);
  return ((v30 ^ v30 >>> 14) >>> 0) / 4294967296;
}
v8(seededRandom, "seededRandom");
function hashString(v31) {
  let v32 = 0;
  for (let v33 = 0; v33 < v31.length; v33++) {
    const v34 = v31.charCodeAt(v33);
    v32 = (v32 << 5) - v32 + v34;
    v32 |= 0;
  }
  return v32;
}
v8(hashString, "hashString");
function resolveSeed(v35, v36) {
  if (typeof v35 === "number" && Number.isFinite(v35) && v35 !== 0) {
    return v35;
  }
  return hashString(v36);
}
v8(resolveSeed, "resolveSeed");
function generateFoldPath(v37, v38, v39, v40) {
  const v41 = v37 / 2;
  const v42 = v40 ?? v37 * 0.015;
  const v43 = 7;
  const v44 = v38 / v43;
  const v45 = [];
  for (let v46 = 0; v46 <= v43; v46++) {
    const v47 = seededRandom(v39 + v46 * 17) * v42 * 2 - v42;
    v45.push({
      x: v41 + v47,
      y: v46 * v44
    });
  }
  let v48 = "M" + v45[0].x + "," + v45[0].y;
  for (let v49 = 0; v49 < v45.length - 1; v49++) {
    const v50 = v45[v49];
    const v51 = v45[v49 + 1];
    const v52 = (v50.y + v51.y) / 2;
    const v53 = v49 % 2 === 0 ? 1 : -1;
    const v54 = v42 * 1.5 * v53 * seededRandom(v39 + v49 * 31 + 7);
    const v55 = v50.x + v54;
    const v56 = v52;
    const v57 = v51.x - v54;
    const v58 = v52;
    v48 += " C" + v55 + "," + v56 + " " + v57 + "," + v58 + " " + v51.x + "," + v51.y;
  }
  return v48;
}
v8(generateFoldPath, "generateFoldPath");
function generateHorizontalBoundary(v59, v60, v61, v62) {
  const v63 = v60 / 2;
  const v64 = v62 ?? v60 * 0.015;
  const v65 = 7;
  const v66 = v59 / v65;
  const v67 = [];
  for (let v68 = 0; v68 <= v65; v68++) {
    const v69 = seededRandom(v61 + v68 * 23) * v64 * 2 - v64;
    v67.push({
      x: v68 * v66,
      y: v63 + v69
    });
  }
  let v70 = "M" + v67[0].x + "," + v67[0].y;
  for (let v71 = 0; v71 < v67.length - 1; v71++) {
    const v72 = v67[v71];
    const v73 = v67[v71 + 1];
    const v74 = (v72.x + v73.x) / 2;
    const v75 = v71 % 2 === 0 ? 1 : -1;
    const v76 = v64 * 1.5 * v75 * seededRandom(v61 + v71 * 37 + 11);
    const v77 = v74;
    const v78 = v72.y + v76;
    const v79 = v74;
    const v80 = v73.y - v76;
    v70 += " C" + v77 + "," + v78 + " " + v79 + "," + v80 + " " + v73.x + "," + v73.y;
  }
  return v70;
}
v8(generateHorizontalBoundary, "generateHorizontalBoundary");
function generateCliffPath(v81, v82) {
  const v83 = v81 / 2;
  const v84 = v82 * 0.5;
  const v85 = v82;
  const v86 = v81 * 0.03;
  return ["M" + v83 + "," + v84, "C" + (v83 + v86) + "," + (v84 + (v85 - v84) * 0.2), v83 - v86 * 1.5 + "," + (v84 + (v85 - v84) * 0.55), v83 + v86 * 0.5 + "," + (v84 + (v85 - v84) * 0.75), "C" + (v83 - v86) + "," + (v84 + (v85 - v84) * 0.85), v83 + v86 * 0.3 + "," + (v84 + (v85 - v84) * 0.95), v83 + "," + v85].join(" ");
}
v8(generateCliffPath, "generateCliffPath");
function generateConfusionPath(v87, v88, v89, v90) {
  return ["M" + (v87 - v89) + "," + v88, "A" + v89 + "," + v90 + " 0 1,1 " + (v87 + v89) + "," + v88, "A" + v89 + "," + v90 + " 0 1,1 " + (v87 - v89) + "," + v88, "Z"].join(" ");
}
v8(generateConfusionPath, "generateConfusionPath");
var DOMAIN_META = {
  complex: {
    model: "Probe → Sense → Respond",
    practice: "Emergent Practices"
  },
  complicated: {
    model: "Sense → Analyse → Respond",
    practice: "Good Practices"
  },
  clear: {
    model: "Sense → Categorise → Respond",
    practice: "Best Practices"
  },
  chaotic: {
    model: "Act → Sense → Respond",
    practice: "Novel Practices"
  },
  confusion: {
    model: "",
    practice: "Disorder"
  }
};
var getDomainLayouts = v8((v91, v92) => {
  const v93 = v91 / 2;
  const v94 = v92 / 2;
  return {
    complex: {
      cx: v93 / 2,
      cy: v94 / 2,
      x: 0,
      y: 0,
      w: v93,
      h: v94
    },
    complicated: {
      cx: v93 + v93 / 2,
      cy: v94 / 2,
      x: v93,
      y: 0,
      w: v93,
      h: v94
    },
    chaotic: {
      cx: v93 / 2,
      cy: v94 + v94 / 2,
      x: 0,
      y: v94,
      w: v93,
      h: v94
    },
    clear: {
      cx: v93 + v93 / 2,
      cy: v94 + v94 / 2,
      x: v93,
      y: v94,
      w: v93,
      h: v94
    },
    confusion: {
      cx: v93,
      cy: v94,
      x: v93 * 0.7,
      y: v94 * 0.7,
      w: v93 * 0.6,
      h: v94 * 0.6
    }
  };
}, "getDomainLayouts");
var getCynefinDomainColors = v8(() => {
  const v95 = v16();
  const v96 = v14();
  const v97 = v13(v95, v96.themeVariables);
  return v97.cynefin;
}, "getCynefinDomainColors");
var MAX_CONFUSION_ITEMS = 3;
var draw = v8((v98, v99, v100, v101) => {
  const v102 = v101.db;
  const v103 = v102.getDomains();
  const v104 = v102.getTransitions();
  const v105 = v102.getDiagramTitle();
  const v106 = v102.getAccTitle();
  const v107 = v102.getAccDescription();
  const v108 = v102.getConfig();
  const v109 = getCynefinDomainColors();
  v9.debug("Rendering Cynefin diagram");
  const v110 = v108.width;
  const v111 = v108.height;
  const v112 = v108.padding;
  const v113 = v108.showDomainDescriptions;
  const v114 = v108.boundaryAmplitude;
  const v115 = v110 + v112 * 2;
  const v116 = v111 + v112 * 2;
  const v117 = {
    complex: v109.complexBg,
    complicated: v109.complicatedBg,
    clear: v109.clearBg,
    chaotic: v109.chaoticBg,
    confusion: v109.confusionBg
  };
  const v118 = v10(v99);
  v11(v118, v116, v115, v108.useMaxWidth ?? true);
  v118.attr("viewBox", "0 0 " + v115 + " " + v116);
  if (v106) {
    v118.append("title").text(v106);
  }
  if (v107) {
    v118.append("desc").text(v107);
  }
  const v119 = v118.append("g").attr("transform", "translate(" + v112 + ", " + v112 + ")");
  const v120 = getDomainLayouts(v110, v111);
  const v121 = resolveSeed(v108.seed, v99);
  const v122 = v119.append("g").attr("class", "cynefin-backgrounds");
  const v123 = ["complex", "complicated", "chaotic", "clear"];
  for (const v124 of v123) {
    const v125 = v120[v124];
    v122.append("rect").attr("class", "cynefinDomain").attr("x", v125.x).attr("y", v125.y).attr("width", v125.w).attr("height", v125.h).attr("fill", v117[v124]).attr("fill-opacity", 0.4).attr("stroke", "none");
  }
  const v126 = v119.append("g").attr("class", "cynefin-boundaries");
  v126.append("path").attr("class", "cynefinBoundary").attr("d", generateFoldPath(v110, v111, v121, v114)).attr("fill", "none");
  v126.append("path").attr("class", "cynefinBoundary").attr("d", generateHorizontalBoundary(v110, v111, v121 + 100, v114)).attr("fill", "none");
  v126.append("path").attr("class", "cynefinCliff").attr("d", generateCliffPath(v110, v111)).attr("fill", "none");
  const v127 = v110 * 0.15;
  const v128 = v111 * 0.15;
  v119.append("path").attr("class", "cynefinConfusion").attr("d", generateConfusionPath(v110 / 2, v111 / 2, v127, v128)).attr("fill", v117.confusion).attr("fill-opacity", 0.5);
  const v129 = v119.append("g").attr("class", "cynefin-labels");
  for (const v130 of v123) {
    const v131 = v120[v130];
    v129.append("text").attr("class", "cynefinDomainLabel").attr("x", v131.cx).attr("y", v113 ? v131.cy - 30 : v131.cy).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(v130.charAt(0).toUpperCase() + v130.slice(1));
  }
  v129.append("text").attr("class", "cynefinDomainLabel").attr("x", v110 / 2).attr("y", v113 ? v111 / 2 - 10 : v111 / 2).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text("Confusion");
  if (v113) {
    const v132 = v119.append("g").attr("class", "cynefin-subtitles");
    for (const v133 of v123) {
      const v134 = v120[v133];
      const v135 = DOMAIN_META[v133];
      v132.append("text").attr("class", "cynefinSubtitle").attr("x", v134.cx).attr("y", v134.cy - 10).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(v135.model);
      v132.append("text").attr("class", "cynefinSubtitle").attr("x", v134.cx).attr("y", v134.cy + 5).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(v135.practice);
    }
    v132.append("text").attr("class", "cynefinSubtitle").attr("x", v110 / 2).attr("y", v111 / 2 + 8).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(DOMAIN_META.confusion.practice);
  }
  const v136 = v119.append("g").attr("class", "cynefin-items");
  const v137 = 26;
  const v138 = 10;
  const v139 = ["complex", "complicated", "chaotic", "clear", "confusion"];
  for (const v140 of v139) {
    const v141 = v103.get(v140);
    if (!v141 || v141.items.length === 0) {
      continue;
    }
    const v142 = v120[v140];
    const v143 = v140 === "confusion";
    let v144 = v141.items;
    let v145 = 0;
    if (v143 && v141.items.length > MAX_CONFUSION_ITEMS) {
      v145 = v141.items.length - MAX_CONFUSION_ITEMS;
      v144 = v141.items.slice(0, MAX_CONFUSION_ITEMS);
    }
    let v146;
    if (v143) {
      const v147 = v113 ? 22 : 14;
      v146 = v142.cy + v147;
    } else {
      v146 = v142.cy + (v113 ? 25 : 15);
    }
    [...v144].forEach((v148, v149) => {
      const v150 = v146 + v149 * (v137 + 4);
      const v151 = v136.append("g");
      const v152 = v151.append("text").attr("class", "cynefinItemText").attr("x", 0).attr("y", v137 / 2).attr("text-anchor", "middle").attr("dominant-baseline", "central").text(v148.label);
      let v153 = v148.label.length * 7;
      const v154 = v152.node();
      if (v154 && typeof v154.getBBox === "function") {
        const v155 = v154.getBBox();
        if (v155.width > 0) {
          v153 = v155.width;
        }
      }
      const v156 = v153 + v138 * 2;
      const v157 = v142.cx - v156 / 2;
      v151.attr("transform", "translate(" + v157 + ", " + v150 + ")");
      v151.insert("rect", "text").attr("class", "cynefinItem").attr("x", 0).attr("y", 0).attr("width", v156).attr("height", v137).attr("rx", 4).attr("ry", 4).attr("fill", v117[v140]).attr("fill-opacity", 0.95);
      v152.attr("x", v156 / 2).attr("y", v137 / 2);
    });
    if (v145 > 0) {
      const v158 = v146 + v144.length * (v137 + 4);
      const v159 = "+" + v145 + " more";
      const v160 = v136.append("g");
      const v161 = v160.append("text").attr("class", "cynefinItemText").attr("x", 0).attr("y", v137 / 2).attr("text-anchor", "middle").attr("dominant-baseline", "central").text(v159);
      let v162 = v159.length * 7;
      const v163 = v161.node();
      if (v163 && typeof v163.getBBox === "function") {
        const v164 = v163.getBBox();
        if (v164.width > 0) {
          v162 = v164.width;
        }
      }
      const v165 = v162 + v138 * 2;
      const v166 = v142.cx - v165 / 2;
      v160.attr("transform", "translate(" + v166 + ", " + v158 + ")");
      v160.insert("rect", "text").attr("class", "cynefinItemOverflow").attr("x", 0).attr("y", 0).attr("width", v165).attr("height", v137).attr("rx", 4).attr("ry", 4).attr("fill", v117[v140]).attr("fill-opacity", 0.6);
      v161.attr("x", v165 / 2).attr("y", v137 / 2);
    }
  }
  if (v104.length > 0) {
    const v167 = v118.select("defs").empty() ? v118.append("defs") : v118.select("defs");
    const v168 = "cynefin-arrow-" + v99;
    v167.append("marker").attr("id", v168).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "cynefinArrowHead");
    const v169 = v119.append("g").attr("class", "cynefin-arrows");
    v104.forEach(v170 => {
      const v171 = v120[v170.from];
      const v172 = v120[v170.to];
      if (!v171 || !v172) {
        return;
      }
      if (v170.from === v170.to) {
        v9.warn("Cynefin renderer: skipping self-loop on domain \"" + v170.from + "\"");
        return;
      }
      const v173 = v171.cx;
      const v174 = v171.cy;
      const v175 = v172.cx;
      const v176 = v172.cy;
      const v177 = (v173 + v175) / 2;
      const v178 = (v174 + v176) / 2;
      const v179 = v175 - v173;
      const v180 = v176 - v174;
      const v181 = Math.sqrt(v179 * v179 + v180 * v180);
      const v182 = v181 * 0.15;
      const v183 = -v180 / v181;
      const v184 = v179 / v181;
      const v185 = v177 + v183 * v182;
      const v186 = v178 + v184 * v182;
      v169.append("path").attr("class", "cynefinArrowLine").attr("d", "M" + v173 + "," + v174 + " Q" + v185 + "," + v186 + " " + v175 + "," + v176).attr("fill", "none").attr("marker-end", "url(#" + v168 + ")");
      if (v170.label) {
        v169.append("text").attr("class", "cynefinArrowLabel").attr("x", v185).attr("y", v186 - 6).attr("text-anchor", "middle").attr("dominant-baseline", "auto").text(v170.label);
      }
    });
  }
  if (v105) {
    v119.append("text").attr("class", "cynefinTitle").attr("x", v110 / 2).attr("y", -v112 / 2).attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(v105);
  }
}, "draw");
var renderer = {
  draw: draw
};
var getCynefinTheme = v8(() => {
  const v187 = v16();
  const v188 = v14();
  const v189 = v13(v187, v188.themeVariables);
  return v189.cynefin;
}, "getCynefinTheme");
var styles = v8(() => {
  const v190 = getCynefinTheme();
  return "\n\t.cynefinDomain {\n\t\tstroke: none;\n\t}\n\t.cynefinDomainLabel {\n\t\tfont-size: " + v190.domainFontSize + "px;\n\t\tfont-weight: bold;\n\t\tfill: " + v190.labelColor + ";\n\t}\n\t.cynefinSubtitle {\n\t\tfont-size: " + (v190.itemFontSize - 1) + "px;\n\t\tfill: " + v190.textColor + ";\n\t\tfont-style: italic;\n\t}\n\t.cynefinItem {\n\t\tfill-opacity: 0.95;\n\t\tstroke: " + v190.boundaryColor + ";\n\t\tstroke-width: 1;\n\t}\n\t.cynefinItemText {\n\t\tfont-size: " + v190.itemFontSize + "px;\n\t\tfill: " + v190.textColor + ";\n\t}\n\t.cynefinItemOverflow {\n\t\tfill-opacity: 0.6;\n\t\tstroke: " + v190.boundaryColor + ";\n\t\tstroke-width: 1;\n\t\tstroke-dasharray: 3 2;\n\t}\n\t.cynefinBoundary {\n\t\tstroke: " + v190.boundaryColor + ";\n\t\tstroke-width: " + v190.boundaryWidth + ";\n\t\tstroke-dasharray: 6 3;\n\t}\n\t.cynefinCliff {\n\t\tstroke: " + v190.cliffColor + ";\n\t\tstroke-width: " + v190.cliffWidth + ";\n\t}\n\t.cynefinConfusion {\n\t\tstroke: " + v190.boundaryColor + ";\n\t\tstroke-width: 1.5;\n\t\tstroke-dasharray: 4 2;\n\t}\n\t.cynefinArrowLine {\n\t\tstroke: " + v190.arrowColor + ";\n\t\tstroke-width: " + v190.arrowWidth + ";\n\t\tfill: none;\n\t}\n\t.cynefinArrowHead {\n\t\tfill: " + v190.arrowColor + ";\n\t\tstroke: none;\n\t}\n\t.cynefinArrowLabel {\n\t\tfont-size: " + (v190.itemFontSize - 1) + "px;\n\t\tfill: " + v190.textColor + ";\n\t}\n\t.cynefinTitle {\n\t\tfont-size: " + (v190.domainFontSize + 2) + "px;\n\t\tfont-weight: bold;\n\t\tfill: " + v190.labelColor + ";\n\t}\n\t";
}, "styles");
var styles_default = styles;
var diagram = {
  parser: parser,
  db: db,
  renderer: renderer,
  styles: styles_default
};
export { diagram };