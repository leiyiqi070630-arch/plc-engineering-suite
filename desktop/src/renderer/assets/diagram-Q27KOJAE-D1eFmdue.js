import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { _ as v2, E as v3, y as v4, A as v5, D as v6, e as v7, l as v8, bg as v9, d as v10, b as v11, a as v12, n as v13, o as v14, g as v15, s as v16, B as v17, bh as v18, p as v19 } from "./index-CXb3UsfP.js";
import { s as v20 } from "./chunk-KBJHAD2P-BXgOlElY.js";
import { p as v21 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
import { b as v22 } from "./defaultLocale-B2RvLBDe.js";
import { o as v23 } from "./ordinal-CxptdPJm.js";
import "./init-ZxktEp_H.js";
function count(v24) {
  var v25 = 0;
  var v26 = v24.children;
  var v27 = v26 && v26.length;
  if (!v27) {
    v25 = 1;
  } else {
    while (--v27 >= 0) {
      v25 += v26[v27].value;
    }
  }
  v24.value = v25;
}
function node_count() {
  return this.eachAfter(count);
}
function node_each(v28, v29) {
  let v30 = -1;
  for (const v31 of this) {
    v28.call(v29, v31, ++v30, this);
  }
  return this;
}
function node_eachBefore(v32, v33) {
  var v34 = this;
  var v35 = [v34];
  var v36;
  var v37;
  var v38 = -1;
  while (v34 = v35.pop()) {
    v32.call(v33, v34, ++v38, this);
    if (v36 = v34.children) {
      for (v37 = v36.length - 1; v37 >= 0; --v37) {
        v35.push(v36[v37]);
      }
    }
  }
  return this;
}
function node_eachAfter(v39, v40) {
  var v41 = this;
  var v42 = [v41];
  var v43 = [];
  var v44;
  var v45;
  var v46;
  var v47 = -1;
  while (v41 = v42.pop()) {
    v43.push(v41);
    if (v44 = v41.children) {
      v45 = 0;
      v46 = v44.length;
      for (; v45 < v46; ++v45) {
        v42.push(v44[v45]);
      }
    }
  }
  while (v41 = v43.pop()) {
    v39.call(v40, v41, ++v47, this);
  }
  return this;
}
function node_find(v48, v49) {
  let v50 = -1;
  for (const v51 of this) {
    if (v48.call(v49, v51, ++v50, this)) {
      return v51;
    }
  }
}
function node_sum(v52) {
  return this.eachAfter(function (v53) {
    var v54 = +v52(v53.data) || 0;
    var v55 = v53.children;
    var v56 = v55 && v55.length;
    while (--v56 >= 0) {
      v54 += v55[v56].value;
    }
    v53.value = v54;
  });
}
function node_sort(v57) {
  return this.eachBefore(function (v58) {
    if (v58.children) {
      v58.children.sort(v57);
    }
  });
}
function node_path(v59) {
  var v60 = this;
  var v61 = leastCommonAncestor(v60, v59);
  var v62 = [v60];
  while (v60 !== v61) {
    v60 = v60.parent;
    v62.push(v60);
  }
  var v63 = v62.length;
  while (v59 !== v61) {
    v62.splice(v63, 0, v59);
    v59 = v59.parent;
  }
  return v62;
}
function leastCommonAncestor(v64, v65) {
  if (v64 === v65) {
    return v64;
  }
  var v66 = v64.ancestors();
  var v67 = v65.ancestors();
  var v68 = null;
  v64 = v66.pop();
  v65 = v67.pop();
  while (v64 === v65) {
    v68 = v64;
    v64 = v66.pop();
    v65 = v67.pop();
  }
  return v68;
}
function node_ancestors() {
  var v69 = this;
  var v70 = [v69];
  while (v69 = v69.parent) {
    v70.push(v69);
  }
  return v70;
}
function node_descendants() {
  return Array.from(this);
}
function node_leaves() {
  var v71 = [];
  this.eachBefore(function (v72) {
    if (!v72.children) {
      v71.push(v72);
    }
  });
  return v71;
}
function node_links() {
  var v73 = this;
  var v74 = [];
  v73.each(function (v75) {
    if (v75 !== v73) {
      v74.push({
        source: v75.parent,
        target: v75
      });
    }
  });
  return v74;
}
function* node_iterator() {
  var v76 = this;
  var v77;
  var v78 = [v76];
  var v79;
  var v80;
  var v81;
  do {
    v77 = v78.reverse();
    v78 = [];
    while (v76 = v77.pop()) {
      yield v76;
      if (v79 = v76.children) {
        v80 = 0;
        v81 = v79.length;
        for (; v80 < v81; ++v80) {
          v78.push(v79[v80]);
        }
      }
    }
  } while (v78.length);
}
function hierarchy(v82, v83) {
  if (v82 instanceof Map) {
    v82 = [undefined, v82];
    if (v83 === undefined) {
      v83 = mapChildren;
    }
  } else if (v83 === undefined) {
    v83 = objectChildren;
  }
  var v84 = new Node(v82);
  var v85;
  var v86 = [v84];
  var v87;
  var v88;
  var v89;
  var v90;
  while (v85 = v86.pop()) {
    if ((v88 = v83(v85.data)) && (v90 = (v88 = Array.from(v88)).length)) {
      v85.children = v88;
      for (v89 = v90 - 1; v89 >= 0; --v89) {
        v86.push(v87 = v88[v89] = new Node(v88[v89]));
        v87.parent = v85;
        v87.depth = v85.depth + 1;
      }
    }
  }
  return v84.eachBefore(computeHeight);
}
function node_copy() {
  return hierarchy(this).eachBefore(copyData);
}
function objectChildren(v91) {
  return v91.children;
}
function mapChildren(v92) {
  if (Array.isArray(v92)) {
    return v92[1];
  } else {
    return null;
  }
}
function copyData(v93) {
  if (v93.data.value !== undefined) {
    v93.value = v93.data.value;
  }
  v93.data = v93.data.data;
}
function computeHeight(v94) {
  var v95 = 0;
  do {
    v94.height = v95;
  } while ((v94 = v94.parent) && v94.height < ++v95);
}
function Node(v96) {
  this.data = v96;
  this.depth = this.height = 0;
  this.parent = null;
}
Node.prototype = hierarchy.prototype = {
  constructor: Node,
  count: node_count,
  each: node_each,
  eachAfter: node_eachAfter,
  eachBefore: node_eachBefore,
  find: node_find,
  sum: node_sum,
  sort: node_sort,
  path: node_path,
  ancestors: node_ancestors,
  descendants: node_descendants,
  leaves: node_leaves,
  links: node_links,
  copy: node_copy,
  [Symbol.iterator]: node_iterator
};
function required(v97) {
  if (typeof v97 !== "function") {
    throw new Error();
  }
  return v97;
}
function constantZero() {
  return 0;
}
function constant(v98) {
  return function () {
    return v98;
  };
}
function roundNode(v99) {
  v99.x0 = Math.round(v99.x0);
  v99.y0 = Math.round(v99.y0);
  v99.x1 = Math.round(v99.x1);
  v99.y1 = Math.round(v99.y1);
}
function treemapDice(v100, v101, v102, v103, v104) {
  var v105 = v100.children;
  var v106;
  var v107 = -1;
  var v108 = v105.length;
  var v109 = v100.value && (v103 - v101) / v100.value;
  while (++v107 < v108) {
    v106 = v105[v107];
    v106.y0 = v102;
    v106.y1 = v104;
    v106.x0 = v101;
    v106.x1 = v101 += v106.value * v109;
  }
}
function treemapSlice(v110, v111, v112, v113, v114) {
  var v115 = v110.children;
  var v116;
  var v117 = -1;
  var v118 = v115.length;
  var v119 = v110.value && (v114 - v112) / v110.value;
  while (++v117 < v118) {
    v116 = v115[v117];
    v116.x0 = v111;
    v116.x1 = v113;
    v116.y0 = v112;
    v116.y1 = v112 += v116.value * v119;
  }
}
var phi = (1 + Math.sqrt(5)) / 2;
function squarifyRatio(v120, v121, v122, v123, v124, v125) {
  var v126 = [];
  var v127 = v121.children;
  var v128;
  var v129;
  var v130 = 0;
  var v131 = 0;
  var v132 = v127.length;
  var v133;
  var v134;
  var v135 = v121.value;
  var v136;
  var v137;
  var v138;
  var v139;
  var v140;
  var v141;
  var v142;
  while (v130 < v132) {
    v133 = v124 - v122;
    v134 = v125 - v123;
    do {
      v136 = v127[v131++].value;
    } while (!v136 && v131 < v132);
    v137 = v138 = v136;
    v141 = Math.max(v134 / v133, v133 / v134) / (v135 * v120);
    v142 = v136 * v136 * v141;
    v140 = Math.max(v138 / v142, v142 / v137);
    for (; v131 < v132; ++v131) {
      v136 += v129 = v127[v131].value;
      if (v129 < v137) {
        v137 = v129;
      }
      if (v129 > v138) {
        v138 = v129;
      }
      v142 = v136 * v136 * v141;
      v139 = Math.max(v138 / v142, v142 / v137);
      if (v139 > v140) {
        v136 -= v129;
        break;
      }
      v140 = v139;
    }
    v126.push(v128 = {
      value: v136,
      dice: v133 < v134,
      children: v127.slice(v130, v131)
    });
    if (v128.dice) {
      treemapDice(v128, v122, v123, v124, v135 ? v123 += v134 * v136 / v135 : v125);
    } else {
      treemapSlice(v128, v122, v123, v135 ? v122 += v133 * v136 / v135 : v124, v125);
    }
    v135 -= v136;
    v130 = v131;
  }
  return v126;
}
const squarify = function custom(v143) {
  function v144(v145, v146, v147, v148, v149) {
    squarifyRatio(v143, v145, v146, v147, v148, v149);
  }
  v144.ratio = function (v150) {
    return custom((v150 = +v150) > 1 ? v150 : 1);
  };
  return v144;
}(phi);
function treemap() {
  var v151 = squarify;
  var v152 = false;
  var v153 = 1;
  var v154 = 1;
  var v155 = [0];
  var v156 = constantZero;
  var v157 = constantZero;
  var v158 = constantZero;
  var v159 = constantZero;
  var v160 = constantZero;
  function v161(v162) {
    v162.x0 = v162.y0 = 0;
    v162.x1 = v153;
    v162.y1 = v154;
    v162.eachBefore(v163);
    v155 = [0];
    if (v152) {
      v162.eachBefore(roundNode);
    }
    return v162;
  }
  function v163(v164) {
    var v165 = v155[v164.depth];
    var v166 = v164.x0 + v165;
    var v167 = v164.y0 + v165;
    var v168 = v164.x1 - v165;
    var v169 = v164.y1 - v165;
    if (v168 < v166) {
      v166 = v168 = (v166 + v168) / 2;
    }
    if (v169 < v167) {
      v167 = v169 = (v167 + v169) / 2;
    }
    v164.x0 = v166;
    v164.y0 = v167;
    v164.x1 = v168;
    v164.y1 = v169;
    if (v164.children) {
      v165 = v155[v164.depth + 1] = v156(v164) / 2;
      v166 += v160(v164) - v165;
      v167 += v157(v164) - v165;
      v168 -= v158(v164) - v165;
      v169 -= v159(v164) - v165;
      if (v168 < v166) {
        v166 = v168 = (v166 + v168) / 2;
      }
      if (v169 < v167) {
        v167 = v169 = (v167 + v169) / 2;
      }
      v151(v164, v166, v167, v168, v169);
    }
  }
  v161.round = function (v170) {
    if (arguments.length) {
      v152 = !!v170;
      return v161;
    } else {
      return v152;
    }
  };
  v161.size = function (v171) {
    if (arguments.length) {
      v153 = +v171[0];
      v154 = +v171[1];
      return v161;
    } else {
      return [v153, v154];
    }
  };
  v161.tile = function (v172) {
    if (arguments.length) {
      v151 = required(v172);
      return v161;
    } else {
      return v151;
    }
  };
  v161.padding = function (v173) {
    if (arguments.length) {
      return v161.paddingInner(v173).paddingOuter(v173);
    } else {
      return v161.paddingInner();
    }
  };
  v161.paddingInner = function (v174) {
    if (arguments.length) {
      v156 = typeof v174 === "function" ? v174 : constant(+v174);
      return v161;
    } else {
      return v156;
    }
  };
  v161.paddingOuter = function (v175) {
    if (arguments.length) {
      return v161.paddingTop(v175).paddingRight(v175).paddingBottom(v175).paddingLeft(v175);
    } else {
      return v161.paddingTop();
    }
  };
  v161.paddingTop = function (v176) {
    if (arguments.length) {
      v157 = typeof v176 === "function" ? v176 : constant(+v176);
      return v161;
    } else {
      return v157;
    }
  };
  v161.paddingRight = function (v177) {
    if (arguments.length) {
      v158 = typeof v177 === "function" ? v177 : constant(+v177);
      return v161;
    } else {
      return v158;
    }
  };
  v161.paddingBottom = function (v178) {
    if (arguments.length) {
      v159 = typeof v178 === "function" ? v178 : constant(+v178);
      return v161;
    } else {
      return v159;
    }
  };
  v161.paddingLeft = function (v179) {
    if (arguments.length) {
      v160 = typeof v179 === "function" ? v179 : constant(+v179);
      return v161;
    } else {
      return v160;
    }
  };
  return v161;
}
var TreeMapDB = class {
  constructor() {
    this.nodes = [];
    this.levels = new Map();
    this.outerNodes = [];
    this.classes = new Map();
    this.setAccTitle = v11;
    this.getAccTitle = v12;
    this.setDiagramTitle = v13;
    this.getDiagramTitle = v14;
    this.getAccDescription = v15;
    this.setAccDescription = v16;
  }
  static {
    v2(this, "TreeMapDB");
  }
  getNodes() {
    return this.nodes;
  }
  getConfig() {
    const v180 = v17;
    const v181 = v4();
    return v5({
      ...v180.treemap,
      ...(v181.treemap ?? {})
    });
  }
  addNode(v182, v183) {
    this.nodes.push(v182);
    this.levels.set(v182, v183);
    if (v183 === 0) {
      this.outerNodes.push(v182);
      this.root ??= v182;
    }
  }
  getRoot() {
    return {
      name: "",
      children: this.outerNodes
    };
  }
  addClass(v184, v185) {
    const v186 = this.classes.get(v184) ?? {
      id: v184,
      styles: [],
      textStyles: []
    };
    const v187 = v185.replace(/\\,/g, "§§§").replace(/,/g, ";").replace(/§§§/g, ",").split(";");
    if (v187) {
      v187.forEach(v188 => {
        if (v18(v188)) {
          if (v186?.textStyles) {
            v186.textStyles.push(v188);
          } else {
            v186.textStyles = [v188];
          }
        }
        if (v186?.styles) {
          v186.styles.push(v188);
        } else {
          v186.styles = [v188];
        }
      });
    }
    this.classes.set(v184, v186);
  }
  getClasses() {
    return this.classes;
  }
  getStylesForClass(v189) {
    return this.classes.get(v189)?.styles ?? [];
  }
  clear() {
    v19();
    this.nodes = [];
    this.levels = new Map();
    this.outerNodes = [];
    this.classes = new Map();
    this.root = undefined;
  }
};
function buildHierarchy(v190) {
  if (!v190.length) {
    return [];
  }
  const v191 = [];
  const v192 = [];
  v190.forEach(v193 => {
    const v194 = {
      name: v193.name,
      children: v193.type === "Leaf" ? undefined : []
    };
    v194.classSelector = v193?.classSelector;
    if (v193?.cssCompiledStyles) {
      v194.cssCompiledStyles = v193.cssCompiledStyles;
    }
    if (v193.type === "Leaf" && v193.value !== undefined) {
      v194.value = v193.value;
    }
    while (v192.length > 0 && v192[v192.length - 1].level >= v193.level) {
      v192.pop();
    }
    if (v192.length === 0) {
      v191.push(v194);
    } else {
      const v195 = v192[v192.length - 1].node;
      if (v195.children) {
        v195.children.push(v194);
      } else {
        v195.children = [v194];
      }
    }
    if (v193.type !== "Leaf") {
      v192.push({
        node: v194,
        level: v193.level
      });
    }
  });
  return v191;
}
v2(buildHierarchy, "buildHierarchy");
var populate = v2((v196, v197) => {
  v1(v196, v197);
  const v198 = [];
  for (const v199 of v196.TreemapRows ?? []) {
    if (v199.$type === "ClassDefStatement") {
      v197.addClass(v199.className ?? "", v199.styleText ?? "");
    }
  }
  for (const v200 of v196.TreemapRows ?? []) {
    const v201 = v200.item;
    if (!v201) {
      continue;
    }
    const v202 = v200.indent ? parseInt(v200.indent) : 0;
    const v203 = getItemName(v201);
    const v204 = v201.classSelector ? v197.getStylesForClass(v201.classSelector) : [];
    const v205 = v204.length > 0 ? v204 : undefined;
    const v206 = {
      level: v202,
      name: v203,
      type: v201.$type,
      value: v201.value,
      classSelector: v201.classSelector,
      cssCompiledStyles: v205
    };
    v198.push(v206);
  }
  const v207 = buildHierarchy(v198);
  const v208 = v2((v209, v210) => {
    for (const v211 of v209) {
      v197.addNode(v211, v210);
      if (v211.children && v211.children.length > 0) {
        v208(v211.children, v210 + 1);
      }
    }
  }, "addNodesRecursively");
  v208(v207, 0);
}, "populate");
var getItemName = v2(v212 => {
  if (v212.name) {
    return String(v212.name);
  } else {
    return "";
  }
}, "getItemName");
var parser = {
  parser: {
    yy: undefined
  },
  parse: v2(async v213 => {
    try {
      const v214 = v21;
      const v215 = await v214("treemap", v213);
      v8.debug("Treemap AST:", v215);
      const v216 = parser.parser?.yy;
      if (!(v216 instanceof TreeMapDB)) {
        throw new Error("parser.parser?.yy was not a TreemapDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");
      }
      populate(v215, v216);
    } catch (v217) {
      v8.error("Error parsing treemap:", v217);
      throw v217;
    }
  }, "parse")
};
var DEFAULT_INNER_PADDING = 10;
var SECTION_INNER_PADDING = 10;
var SECTION_HEADER_HEIGHT = 25;
var draw = v2((v218, v219, v220, v221) => {
  const v222 = v221.db;
  const v223 = v222.getConfig();
  const v224 = v223.padding ?? DEFAULT_INNER_PADDING;
  const v225 = v222.getDiagramTitle();
  const v226 = v222.getRoot();
  const {
    themeVariables: v227
  } = v4();
  if (!v226) {
    return;
  }
  const v228 = v225 ? 30 : 0;
  const v229 = v6(v219);
  const v230 = v223.nodeWidth ? v223.nodeWidth * SECTION_INNER_PADDING : 960;
  const v231 = v223.nodeHeight ? v223.nodeHeight * SECTION_INNER_PADDING : 500;
  const v232 = v230;
  const v233 = v231 + v228;
  v229.attr("viewBox", "0 0 " + v232 + " " + v233);
  v7(v229, v233, v232, v223.useMaxWidth);
  let v234;
  try {
    const v235 = v223.valueFormat || ",";
    if (v235 === "$0,0") {
      v234 = v2(v236 => "$" + v22(",")(v236), "valueFormat");
    } else if (v235.startsWith("$") && v235.includes(",")) {
      const v237 = /\.\d+/.exec(v235);
      const v238 = v237 ? v237[0] : "";
      v234 = v2(v239 => "$" + v22("," + v238)(v239), "valueFormat");
    } else if (v235.startsWith("$")) {
      const v240 = v235.substring(1);
      v234 = v2(v241 => "$" + v22(v240 || "")(v241), "valueFormat");
    } else {
      v234 = v22(v235);
    }
  } catch (v242) {
    v8.error("Error creating format function:", v242);
    v234 = v22(",");
  }
  const v243 = v23().range(["transparent", v227.cScale0, v227.cScale1, v227.cScale2, v227.cScale3, v227.cScale4, v227.cScale5, v227.cScale6, v227.cScale7, v227.cScale8, v227.cScale9, v227.cScale10, v227.cScale11]);
  const v244 = v23().range(["transparent", v227.cScalePeer0, v227.cScalePeer1, v227.cScalePeer2, v227.cScalePeer3, v227.cScalePeer4, v227.cScalePeer5, v227.cScalePeer6, v227.cScalePeer7, v227.cScalePeer8, v227.cScalePeer9, v227.cScalePeer10, v227.cScalePeer11]);
  const v245 = v23().range([v227.cScaleLabel0, v227.cScaleLabel1, v227.cScaleLabel2, v227.cScaleLabel3, v227.cScaleLabel4, v227.cScaleLabel5, v227.cScaleLabel6, v227.cScaleLabel7, v227.cScaleLabel8, v227.cScaleLabel9, v227.cScaleLabel10, v227.cScaleLabel11]);
  if (v225) {
    v229.append("text").attr("x", v232 / 2).attr("y", v228 / 2).attr("class", "treemapTitle").attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(v225);
  }
  const v246 = v229.append("g").attr("transform", "translate(0, " + v228 + ")").attr("class", "treemapContainer");
  const v247 = hierarchy(v226).sum(v248 => v248.value ?? 0).sort((v249, v250) => (v250.value ?? 0) - (v249.value ?? 0));
  const v251 = treemap().size([v230, v231]).paddingTop(v252 => v252.children && v252.children.length > 0 ? SECTION_HEADER_HEIGHT + SECTION_INNER_PADDING : 0).paddingInner(v224).paddingLeft(v253 => v253.children && v253.children.length > 0 ? SECTION_INNER_PADDING : 0).paddingRight(v254 => v254.children && v254.children.length > 0 ? SECTION_INNER_PADDING : 0).paddingBottom(v255 => v255.children && v255.children.length > 0 ? SECTION_INNER_PADDING : 0).round(true);
  const v256 = v251(v247);
  const v257 = v256.descendants().filter(v258 => v258.children && v258.children.length > 0);
  const v259 = v246.selectAll(".treemapSection").data(v257).enter().append("g").attr("class", "treemapSection").attr("transform", v260 => "translate(" + v260.x0 + "," + v260.y0 + ")");
  v259.append("rect").attr("width", v261 => v261.x1 - v261.x0).attr("height", SECTION_HEADER_HEIGHT).attr("class", "treemapSectionHeader").attr("fill", "none").attr("fill-opacity", 0.6).attr("stroke-width", 0.6).attr("style", v262 => {
    if (v262.depth === 0) {
      return "display: none;";
    }
    return "";
  });
  v259.append("clipPath").attr("id", (v263, v264) => "clip-section-" + v219 + "-" + v264).append("rect").attr("width", v265 => Math.max(0, v265.x1 - v265.x0 - 12)).attr("height", SECTION_HEADER_HEIGHT);
  v259.append("rect").attr("width", v266 => v266.x1 - v266.x0).attr("height", v267 => v267.y1 - v267.y0).attr("class", (v268, v269) => {
    return "treemapSection section" + v269;
  }).attr("fill", v270 => v243(v270.data.name)).attr("fill-opacity", 0.6).attr("stroke", v271 => v244(v271.data.name)).attr("stroke-width", 2).attr("stroke-opacity", 0.4).attr("style", v272 => {
    if (v272.depth === 0) {
      return "display: none;";
    }
    const v273 = v9({
      cssCompiledStyles: v272.data.cssCompiledStyles
    });
    return v273.nodeStyles + ";" + v273.borderStyles.join(";");
  });
  v259.append("text").attr("class", "treemapSectionLabel").attr("x", 6).attr("y", SECTION_HEADER_HEIGHT / 2).attr("dominant-baseline", "middle").text(v274 => v274.depth === 0 ? "" : v274.data.name).attr("font-weight", "bold").attr("clip-path", (v275, v276) => "url(#clip-section-" + v219 + "-" + v276 + ")").attr("style", v277 => {
    if (v277.depth === 0) {
      return "display: none;";
    }
    const v278 = "dominant-baseline: middle; font-size: 12px; fill:" + v245(v277.data.name) + "; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
    const v279 = v9({
      cssCompiledStyles: v277.data.cssCompiledStyles
    });
    return v278 + v279.labelStyles.replace("color:", "fill:");
  }).each(function (v280) {
    if (v280.depth === 0) {
      return;
    }
    const v281 = v10(this);
    const v282 = v280.data.name;
    v281.text(v282);
    const v283 = v280.x1 - v280.x0;
    const v284 = 6;
    let v285;
    if (v223.showValues !== false && v280.value) {
      const v286 = v283 - 10;
      const v287 = 30;
      const v288 = 10;
      const v289 = v286 - v287 - v288;
      v285 = v289 - v284;
    } else {
      const v290 = 6;
      v285 = v283 - v284 - v290;
    }
    const v291 = 15;
    const v292 = Math.max(v291, v285);
    const v293 = v281.node();
    const v294 = v293.getComputedTextLength();
    if (v294 > v292) {
      const v295 = "...";
      let v296 = v282;
      while (v296.length > 0) {
        v296 = v282.substring(0, v296.length - 1);
        if (v296.length === 0) {
          v281.text(v295);
          if (v293.getComputedTextLength() > v292) {
            v281.text("");
          }
          break;
        }
        v281.text(v296 + v295);
        if (v293.getComputedTextLength() <= v292) {
          break;
        }
      }
    }
  });
  if (v223.showValues !== false) {
    v259.append("text").attr("class", "treemapSectionValue").attr("x", v297 => v297.x1 - v297.x0 - 10).attr("y", SECTION_HEADER_HEIGHT / 2).attr("text-anchor", "end").attr("dominant-baseline", "middle").text(v298 => v298.value ? v234(v298.value) : "").attr("font-style", "italic").attr("style", v299 => {
      if (v299.depth === 0) {
        return "display: none;";
      }
      const v300 = "text-anchor: end; dominant-baseline: middle; font-size: 10px; fill:" + v245(v299.data.name) + "; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
      const v301 = v9({
        cssCompiledStyles: v299.data.cssCompiledStyles
      });
      return v300 + v301.labelStyles.replace("color:", "fill:");
    });
  }
  const v302 = v256.leaves();
  const v303 = v302.length > 20;
  const v304 = v303 ? 16 : 38;
  const v305 = v303 ? 14 : 28;
  const v306 = v303 ? 4 : 8;
  const v307 = v303 ? 4 : 6;
  const v308 = v303 ? 2 : 4;
  const v309 = v303 ? 8 : 10;
  const v310 = v303 ? 1 : 2;
  const v311 = v246.selectAll(".treemapLeafGroup").data(v302).enter().append("g").attr("class", (v312, v313) => {
    return "treemapNode treemapLeafGroup leaf" + v313 + (v312.data.classSelector ? " " + v312.data.classSelector : "") + "x";
  }).attr("transform", v314 => "translate(" + v314.x0 + "," + v314.y0 + ")");
  v311.append("rect").attr("width", v315 => v315.x1 - v315.x0).attr("height", v316 => v316.y1 - v316.y0).attr("class", "treemapLeaf").attr("fill", v317 => {
    if (v317.parent) {
      return v243(v317.parent.data.name);
    } else {
      return v243(v317.data.name);
    }
  }).attr("style", v318 => {
    const v319 = v9({
      cssCompiledStyles: v318.data.cssCompiledStyles
    });
    return v319.nodeStyles;
  }).attr("fill-opacity", 0.3).attr("stroke", v320 => {
    if (v320.parent) {
      return v243(v320.parent.data.name);
    } else {
      return v243(v320.data.name);
    }
  }).attr("stroke-width", 3);
  v311.append("clipPath").attr("id", (v321, v322) => "clip-" + v219 + "-" + v322).append("rect").attr("width", v323 => Math.max(0, v323.x1 - v323.x0 - 4)).attr("height", v324 => Math.max(0, v324.y1 - v324.y0 - 4));
  const v325 = v311.append("text").attr("class", "treemapLabel").attr("x", v326 => (v326.x1 - v326.x0) / 2).attr("y", v327 => (v327.y1 - v327.y0) / 2).attr("style", v328 => {
    const v329 = "text-anchor: middle; dominant-baseline: middle; font-size: " + v304 + "px;fill:" + v245(v328.data.name) + ";";
    const v330 = v9({
      cssCompiledStyles: v328.data.cssCompiledStyles
    });
    return v329 + v330.labelStyles.replace("color:", "fill:");
  }).attr("clip-path", (v331, v332) => "url(#clip-" + v219 + "-" + v332 + ")").text(v333 => v333.data.name);
  v325.each(function (v334) {
    const v335 = v10(this);
    const v336 = v334.x1 - v334.x0;
    const v337 = v334.y1 - v334.y0;
    const v338 = v335.node();
    const v339 = v336 - v308 * 2;
    const v340 = v337 - v308 * 2;
    if (v339 < v309 || v340 < v309) {
      v335.style("display", "none");
      return;
    }
    let v341 = parseInt(v335.style("font-size"), 10);
    const v342 = 0.6;
    while (v338.getComputedTextLength() > v339 && v341 > v306) {
      v341--;
      v335.style("font-size", v341 + "px");
    }
    let v343 = Math.max(v307, Math.min(v305, Math.round(v341 * v342)));
    let v344 = v341 + v310 + v343;
    while (v344 > v340 && v341 > v306) {
      v341--;
      v343 = Math.max(v307, Math.min(v305, Math.round(v341 * v342)));
      if (v343 < v307 && v341 === v306) {
        break;
      }
      v335.style("font-size", v341 + "px");
      v344 = v341 + v310 + v343;
    }
    v335.style("font-size", v341 + "px");
    if (v303) {
      if (v341 < v306 || v340 < v306) {
        v335.style("display", "none");
      }
    } else if (v338.getComputedTextLength() > v339 || v341 < v306 || v340 < v341) {
      v335.style("display", "none");
    }
  });
  if (v223.showValues !== false) {
    const v345 = v311.append("text").attr("class", "treemapValue").attr("x", v346 => (v346.x1 - v346.x0) / 2).attr("y", function (v347) {
      return (v347.y1 - v347.y0) / 2;
    }).attr("style", v348 => {
      const v349 = "text-anchor: middle; dominant-baseline: hanging; font-size: " + v305 + "px;fill:" + v245(v348.data.name) + ";";
      const v350 = v9({
        cssCompiledStyles: v348.data.cssCompiledStyles
      });
      return v349 + v350.labelStyles.replace("color:", "fill:");
    }).attr("clip-path", (v351, v352) => "url(#clip-" + v219 + "-" + v352 + ")").text(v353 => v353.value ? v234(v353.value) : "");
    v345.each(function (v354) {
      const v355 = v10(this);
      const v356 = this.parentNode;
      if (!v356) {
        v355.style("display", "none");
        return;
      }
      const v357 = v10(v356).select(".treemapLabel");
      if (v357.empty() || v357.style("display") === "none") {
        v355.style("display", "none");
        return;
      }
      const v358 = parseFloat(v357.style("font-size"));
      const v359 = 0.6;
      const v360 = Math.max(v307, Math.min(v305, Math.round(v358 * v359)));
      v355.style("font-size", v360 + "px");
      const v361 = (v354.y1 - v354.y0) / 2;
      const v362 = v361 + v358 / 2 + v310;
      v355.attr("y", v362);
      const v363 = v354.x1 - v354.x0;
      const v364 = v354.y1 - v354.y0;
      const v365 = 4;
      const v366 = v364 - v365;
      const v367 = v363 - v308 * 2;
      if (v355.node().getComputedTextLength() > v367 || v362 + v360 > v366 || v360 < v307) {
        v355.style("display", "none");
      } else {
        v355.style("display", null);
      }
    });
  }
  const v368 = v223.diagramPadding ?? 8;
  v20(v229, v368, "flowchart", v223?.useMaxWidth || false);
}, "draw");
var getClasses = v2(function (v369, v370) {
  return v370.db.getClasses();
}, "getClasses");
var renderer = {
  draw: draw,
  getClasses: getClasses
};
var defaultTreemapStyleOptions = {
  sectionStrokeColor: "black",
  sectionStrokeWidth: "1",
  sectionFillColor: "#efefef",
  leafStrokeColor: "black",
  leafStrokeWidth: "1",
  leafFillColor: "#efefef",
  labelFontSize: "12px",
  valueFontSize: "10px",
  titleFontSize: "14px"
};
var getStyles = v2(({
  treemap: v371
} = {}) => {
  const v372 = v3();
  const v373 = v4();
  const v374 = v5(v372, v373.themeVariables);
  const v375 = v5(defaultTreemapStyleOptions, v371);
  const v376 = v375.titleColor ?? v374.titleColor;
  const v377 = v375.labelColor ?? v374.textColor;
  const v378 = v375.valueColor ?? v374.textColor;
  return "\n  .treemapNode.section {\n    stroke: " + v375.sectionStrokeColor + ";\n    stroke-width: " + v375.sectionStrokeWidth + ";\n    fill: " + v375.sectionFillColor + ";\n  }\n  .treemapNode.leaf {\n    stroke: " + v375.leafStrokeColor + ";\n    stroke-width: " + v375.leafStrokeWidth + ";\n    fill: " + v375.leafFillColor + ";\n  }\n  .treemapLabel {\n    fill: " + v377 + ";\n    font-size: " + v375.labelFontSize + ";\n  }\n  .treemapValue {\n    fill: " + v378 + ";\n    font-size: " + v375.valueFontSize + ";\n  }\n  .treemapTitle {\n    fill: " + v376 + ";\n    font-size: " + v375.titleFontSize + ";\n  }\n  ";
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: parser,
  get db() {
    return new TreeMapDB();
  },
  renderer: renderer,
  styles: styles_default
};
export { diagram };