import { _ as v1, l as v2, D as v3, y as v4, p as v5, E as v6, e as v7, i as v8, c as v9 } from "./index-CXb3UsfP.js";
var diagramTitle = "";
var accTitle = "";
var accDescription = "";
var rules = [];
var ruleMap = new Map();
var sanitizeText2 = v1(v10 => {
  return v8(v10, v9());
}, "sanitizeText");
var sanitizeAstNode = v1(v11 => {
  switch (v11.type) {
    case "terminal":
      return {
        ...v11,
        value: sanitizeText2(v11.value)
      };
    case "nonterminal":
      return {
        ...v11,
        name: sanitizeText2(v11.name)
      };
    case "sequence":
      return {
        ...v11,
        elements: v11.elements.map(sanitizeAstNode)
      };
    case "choice":
      return {
        ...v11,
        alternatives: v11.alternatives.map(sanitizeAstNode)
      };
    case "optional":
      return {
        ...v11,
        element: sanitizeAstNode(v11.element)
      };
    case "repetition":
      return {
        ...v11,
        element: sanitizeAstNode(v11.element),
        separator: v11.separator ? sanitizeAstNode(v11.separator) : undefined
      };
    case "special":
      return {
        ...v11,
        text: sanitizeText2(v11.text)
      };
  }
}, "sanitizeAstNode");
var clear2 = v1(() => {
  diagramTitle = "";
  accTitle = "";
  accDescription = "";
  rules.length = 0;
  ruleMap.clear();
  v5();
  v2.debug("[Railroad] Database cleared");
}, "clear");
var setTitle = v1(v12 => {
  diagramTitle = sanitizeText2(v12);
  v2.debug("[Railroad] Title set:", v12);
}, "setTitle");
var getTitle = v1(() => {
  return diagramTitle;
}, "getTitle");
var addRule = v1(v13 => {
  const v14 = {
    ...v13,
    name: sanitizeText2(v13.name),
    definition: sanitizeAstNode(v13.definition),
    comment: v13.comment ? sanitizeText2(v13.comment) : undefined
  };
  v2.debug("[Railroad] Adding rule:", v14.name);
  if (ruleMap.has(v14.name)) {
    v2.warn("[Railroad] Rule '" + v14.name + "' is already defined. Overwriting.");
  }
  rules.push(v14);
  ruleMap.set(v14.name, v14);
}, "addRule");
var getRules = v1(() => {
  return rules;
}, "getRules");
var getRule = v1(v15 => {
  return ruleMap.get(v15);
}, "getRule");
var setAccTitle = v1(v16 => {
  accTitle = sanitizeText2(v16).replace(/^\s+/g, "");
  v2.debug("[Railroad] Accessibility title set:", v16);
}, "setAccTitle");
var getAccTitle = v1(() => {
  return accTitle;
}, "getAccTitle");
var setAccDescription = v1(v17 => {
  accDescription = sanitizeText2(v17).replace(/\n\s+/g, "\n");
  v2.debug("[Railroad] Accessibility description set:", v17);
}, "setAccDescription");
var getAccDescription = v1(() => {
  return accDescription;
}, "getAccDescription");
var setDiagramTitle = setTitle;
var getDiagramTitle = getTitle;
var db = {
  clear: clear2,
  setTitle: setTitle,
  getTitle: getTitle,
  addRule: addRule,
  getRules: getRules,
  getRule: getRule,
  setAccTitle: setAccTitle,
  getAccTitle: getAccTitle,
  setAccDescription: setAccDescription,
  getAccDescription: getAccDescription,
  setDiagramTitle: setDiagramTitle,
  getDiagramTitle: getDiagramTitle
};
var DEFAULT_RAILROAD_CONFIG = {
  compactMode: false,
  padding: 10,
  verticalSeparation: 8,
  horizontalSeparation: 10,
  arcRadius: 10,
  fontSize: 14,
  fontFamily: "monospace",
  terminalFill: "#FFFFC0",
  terminalStroke: "#000000",
  terminalTextColor: "#000000",
  nonTerminalFill: "#FFFFFF",
  nonTerminalStroke: "#000000",
  nonTerminalTextColor: "#000000",
  lineColor: "#000000",
  strokeWidth: 2,
  markerFill: "#000000",
  commentFill: "#E8E8E8",
  commentStroke: "#888888",
  commentTextColor: "#666666",
  specialFill: "#F0E0FF",
  specialStroke: "#8800CC",
  ruleNameColor: "#000066",
  showMarkers: true,
  markerRadius: 5
};
var COLOR_VALUE_PATTERN = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$|^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\([\d\s%+,./-]+\)$|^[a-z]+$/i;
var FONT_FAMILY_PATTERN = /^[\w "',.-]+$/;
var RAILROAD_STYLE_OPTION_KEYS = new Set(["compactMode", "padding", "verticalSeparation", "horizontalSeparation", "arcRadius", "fontSize", "fontFamily", "terminalFill", "terminalStroke", "terminalTextColor", "nonTerminalFill", "nonTerminalStroke", "nonTerminalTextColor", "lineColor", "strokeWidth", "markerFill", "commentFill", "commentStroke", "commentTextColor", "specialFill", "specialStroke", "ruleNameColor", "showMarkers", "markerRadius"]);
var isRailroadStyleOptions = v1(v18 => {
  if (!v18) {
    return false;
  }
  return Object.keys(v18).every(v19 => v19 === "railroad" || RAILROAD_STYLE_OPTION_KEYS.has(v19));
}, "isRailroadStyleOptions");
var extractRailroadOverrides = v1(v20 => {
  if (!v20) {
    return {};
  }
  if ("railroad" in v20 && v20.railroad) {
    return v20.railroad;
  }
  if (isRailroadStyleOptions(v20)) {
    return v20;
  } else {
    return {};
  }
}, "extractRailroadOverrides");
var extractThemeOverrides = v1(v21 => {
  if (!v21 || isRailroadStyleOptions(v21)) {
    return {};
  }
  const {
    railroad: v22,
    svgId: v23,
    theme: v24,
    look: v25,
    ...v26
  } = v21;
  return v26;
}, "extractThemeOverrides");
var sanitizeColorValue = v1((v27, v28) => {
  if (typeof v27 !== "string") {
    return v28;
  }
  const v29 = v27.trim();
  if (COLOR_VALUE_PATTERN.test(v29)) {
    return v29;
  } else {
    return v28;
  }
}, "sanitizeColorValue");
var sanitizeFontFamilyValue = v1((v30, v31) => {
  if (typeof v30 !== "string") {
    return v31;
  }
  const v32 = v30.trim();
  if (FONT_FAMILY_PATTERN.test(v32)) {
    return v32;
  } else {
    return v31;
  }
}, "sanitizeFontFamilyValue");
var sanitizeNumberValue = v1((v33, v34) => {
  const v35 = typeof v33 === "number" ? v33 : typeof v33 === "string" ? Number.parseFloat(v33) : Number.NaN;
  if (Number.isFinite(v35) && v35 >= 0) {
    return v35;
  } else {
    return v34;
  }
}, "sanitizeNumberValue");
var parseThemeFontSize = v1(v36 => {
  const v37 = typeof v36 === "number" ? v36 : typeof v36 === "string" ? Number.parseFloat(v36) : Number.NaN;
  if (Number.isFinite(v37) && v37 > 0) {
    return v37;
  } else {
    return undefined;
  }
}, "parseThemeFontSize");
var buildThemeDefaults = v1(v38 => {
  const v39 = sanitizeFontFamilyValue(v38.fontFamily, DEFAULT_RAILROAD_CONFIG.fontFamily);
  const v40 = parseThemeFontSize(v38.fontSize) ?? DEFAULT_RAILROAD_CONFIG.fontSize;
  return {
    ...DEFAULT_RAILROAD_CONFIG,
    fontFamily: v39,
    fontSize: v40,
    terminalFill: sanitizeColorValue(v38.secondBkg ?? v38.secondaryColor, DEFAULT_RAILROAD_CONFIG.terminalFill),
    terminalStroke: sanitizeColorValue(v38.secondaryBorderColor ?? v38.lineColor, DEFAULT_RAILROAD_CONFIG.terminalStroke),
    terminalTextColor: sanitizeColorValue(v38.secondaryTextColor ?? v38.textColor, DEFAULT_RAILROAD_CONFIG.terminalTextColor),
    nonTerminalFill: sanitizeColorValue(v38.mainBkg ?? v38.background, DEFAULT_RAILROAD_CONFIG.nonTerminalFill),
    nonTerminalStroke: sanitizeColorValue(v38.primaryBorderColor ?? v38.lineColor, DEFAULT_RAILROAD_CONFIG.nonTerminalStroke),
    nonTerminalTextColor: sanitizeColorValue(v38.primaryTextColor ?? v38.textColor, DEFAULT_RAILROAD_CONFIG.nonTerminalTextColor),
    lineColor: sanitizeColorValue(v38.lineColor, DEFAULT_RAILROAD_CONFIG.lineColor),
    markerFill: sanitizeColorValue(v38.lineColor, DEFAULT_RAILROAD_CONFIG.markerFill),
    commentFill: sanitizeColorValue(v38.labelBackground ?? v38.tertiaryColor, DEFAULT_RAILROAD_CONFIG.commentFill),
    commentStroke: sanitizeColorValue(v38.tertiaryBorderColor ?? v38.lineColor, DEFAULT_RAILROAD_CONFIG.commentStroke),
    commentTextColor: sanitizeColorValue(v38.tertiaryTextColor ?? v38.textColor, DEFAULT_RAILROAD_CONFIG.commentTextColor),
    specialFill: sanitizeColorValue(v38.tertiaryColor ?? v38.secondaryColor, DEFAULT_RAILROAD_CONFIG.specialFill),
    specialStroke: sanitizeColorValue(v38.tertiaryBorderColor ?? v38.secondaryBorderColor, DEFAULT_RAILROAD_CONFIG.specialStroke),
    ruleNameColor: sanitizeColorValue(v38.titleColor ?? v38.textColor, DEFAULT_RAILROAD_CONFIG.ruleNameColor)
  };
}, "buildThemeDefaults");
var buildRailroadStyleOptions = v1(v41 => {
  const v42 = v4();
  const v43 = {
    ...v6(),
    ...(v42.themeVariables ?? {}),
    ...extractThemeOverrides(v41)
  };
  const v44 = buildThemeDefaults(v43);
  const v45 = {
    ...(v42.railroad ?? {}),
    ...extractRailroadOverrides(v41)
  };
  return {
    compactMode: v45.compactMode ?? v44.compactMode,
    padding: sanitizeNumberValue(v45.padding, v44.padding),
    verticalSeparation: sanitizeNumberValue(v45.verticalSeparation, v44.verticalSeparation),
    horizontalSeparation: sanitizeNumberValue(v45.horizontalSeparation, v44.horizontalSeparation),
    arcRadius: sanitizeNumberValue(v45.arcRadius, v44.arcRadius),
    fontSize: sanitizeNumberValue(v45.fontSize, v44.fontSize),
    fontFamily: sanitizeFontFamilyValue(v45.fontFamily, v44.fontFamily),
    terminalFill: sanitizeColorValue(v45.terminalFill, v44.terminalFill),
    terminalStroke: sanitizeColorValue(v45.terminalStroke, v44.terminalStroke),
    terminalTextColor: sanitizeColorValue(v45.terminalTextColor, v44.terminalTextColor),
    nonTerminalFill: sanitizeColorValue(v45.nonTerminalFill, v44.nonTerminalFill),
    nonTerminalStroke: sanitizeColorValue(v45.nonTerminalStroke, v44.nonTerminalStroke),
    nonTerminalTextColor: sanitizeColorValue(v45.nonTerminalTextColor, v44.nonTerminalTextColor),
    lineColor: sanitizeColorValue(v45.lineColor, v44.lineColor),
    strokeWidth: sanitizeNumberValue(v45.strokeWidth, v44.strokeWidth),
    markerFill: sanitizeColorValue(v45.markerFill, v44.markerFill),
    commentFill: sanitizeColorValue(v45.commentFill, v44.commentFill),
    commentStroke: sanitizeColorValue(v45.commentStroke, v44.commentStroke),
    commentTextColor: sanitizeColorValue(v45.commentTextColor, v44.commentTextColor),
    specialFill: sanitizeColorValue(v45.specialFill, v44.specialFill),
    specialStroke: sanitizeColorValue(v45.specialStroke, v44.specialStroke),
    ruleNameColor: sanitizeColorValue(v45.ruleNameColor, v44.ruleNameColor),
    showMarkers: v45.showMarkers ?? v44.showMarkers,
    markerRadius: sanitizeNumberValue(v45.markerRadius, v44.markerRadius)
  };
}, "buildRailroadStyleOptions");
var getStyles = v1(v46 => {
  const {
    fontFamily: v47,
    fontSize: v48,
    terminalFill: v49,
    terminalStroke: v50,
    terminalTextColor: v51,
    nonTerminalFill: v52,
    nonTerminalStroke: v53,
    nonTerminalTextColor: v54,
    lineColor: v55,
    strokeWidth: v56,
    markerFill: v57,
    commentFill: v58,
    commentStroke: v59,
    commentTextColor: v60,
    specialFill: v61,
    specialStroke: v62,
    ruleNameColor: v63
  } = buildRailroadStyleOptions(v46);
  return "\n  .railroad-diagram {\n    font-family: " + v47 + ";\n    font-size: " + v48 + "px;\n  }\n\n  .railroad-terminal rect {\n    fill: " + v49 + ";\n    stroke: " + v50 + ";\n    stroke-width: " + v56 + "px;\n  }\n\n  .railroad-terminal text {\n    fill: " + v51 + ";\n    font-family: " + v47 + ";\n    font-size: " + v48 + "px;\n    text-anchor: middle;\n    dominant-baseline: middle;\n  }\n\n  .railroad-nonterminal rect {\n    fill: " + v52 + ";\n    stroke: " + v53 + ";\n    stroke-width: " + v56 + "px;\n  }\n\n  .railroad-nonterminal text {\n    fill: " + v54 + ";\n    font-family: " + v47 + ";\n    font-size: " + v48 + "px;\n    text-anchor: middle;\n    dominant-baseline: middle;\n  }\n\n  .railroad-line {\n    stroke: " + v55 + ";\n    stroke-width: " + v56 + "px;\n    fill: none;\n  }\n\n  .railroad-start circle,\n  .railroad-end circle {\n    fill: " + v57 + ";\n  }\n\n  .railroad-comment ellipse {\n    fill: " + v58 + ";\n    stroke: " + v59 + ";\n    stroke-width: " + v56 + "px;\n  }\n\n  .railroad-comment text {\n    fill: " + v60 + ";\n    font-style: italic;\n    font-family: " + v47 + ";\n    font-size: " + v48 + "px;\n    text-anchor: middle;\n    dominant-baseline: middle;\n  }\n\n  .railroad-special rect {\n    fill: " + v61 + ";\n    stroke: " + v62 + ";\n    stroke-width: " + v56 + "px;\n    stroke-dasharray: 5,3;\n  }\n\n  .railroad-special text {\n    fill: " + v54 + ";\n    font-family: " + v47 + ";\n    font-size: " + v48 + "px;\n    text-anchor: middle;\n    dominant-baseline: middle;\n  }\n\n  .railroad-rule-name {\n    font-weight: bold;\n    fill: " + v63 + ";\n    font-family: " + v47 + ";\n    font-size: " + v48 + "px;\n  }\n\n  .railroad-group {\n    /* Grouping container, no specific styles */\n  }\n";
}, "getStyles");
var PathBuilder = class {
  constructor() {
    this.d = "";
  }
  static {
    v1(this, "PathBuilder");
  }
  moveTo(v64, v65) {
    this.d += "M " + v64 + " " + v65 + " ";
    return this;
  }
  lineTo(v66, v67) {
    this.d += "L " + v66 + " " + v67 + " ";
    return this;
  }
  horizontalTo(v68) {
    this.d += "H " + v68 + " ";
    return this;
  }
  verticalTo(v69) {
    this.d += "V " + v69 + " ";
    return this;
  }
  arcTo(v70, v71, v72, v73, v74, v75, v76) {
    this.d += "A " + v70 + " " + v71 + " " + v72 + " " + (v73 ? 1 : 0) + " " + (v74 ? 1 : 0) + " " + v75 + " " + v76 + " ";
    return this;
  }
  build() {
    return this.d.trim();
  }
};
var RailroadRenderer = class {
  constructor(v77, v78 = buildRailroadStyleOptions()) {
    this.textCache = new Map();
    this.svg = v77;
    this.config = v78;
  }
  static {
    v1(this, "RailroadRenderer");
  }
  measureText(v79) {
    if (this.textCache.has(v79)) {
      return this.textCache.get(v79);
    }
    const v80 = this.svg.append("text").attr("font-family", this.config.fontFamily).attr("font-size", this.config.fontSize).text(v79);
    const v81 = v80.node().getBBox();
    const v82 = {
      width: v81.width,
      height: v81.height
    };
    v80.remove();
    this.textCache.set(v79, v82);
    return v82;
  }
  renderTerminal(v83, v84) {
    const v85 = this.measureText(v84);
    const v86 = v85.width + this.config.padding * 2;
    const v87 = v85.height + this.config.padding * 2;
    const v88 = v83.append("g").attr("class", "railroad-terminal");
    v88.append("rect").attr("x", 0).attr("y", 0).attr("width", v86).attr("height", v87).attr("rx", 10).attr("ry", 10);
    v88.append("text").attr("x", v86 / 2).attr("y", v87 / 2).text(v84);
    return {
      element: v88.node(),
      dimensions: {
        width: v86,
        height: v87,
        up: v87 / 2,
        down: v87 / 2
      }
    };
  }
  renderNonTerminal(v89, v90) {
    const v91 = this.measureText(v90);
    const v92 = v91.width + this.config.padding * 2;
    const v93 = v91.height + this.config.padding * 2;
    const v94 = v89.append("g").attr("class", "railroad-nonterminal");
    v94.append("rect").attr("x", 0).attr("y", 0).attr("width", v92).attr("height", v93);
    v94.append("text").attr("x", v92 / 2).attr("y", v93 / 2).text(v90);
    return {
      element: v94.node(),
      dimensions: {
        width: v92,
        height: v93,
        up: v93 / 2,
        down: v93 / 2
      }
    };
  }
  renderSequence(v95, v96) {
    const v97 = v96.map(v98 => this.renderExpression(v95, v98));
    let v99 = 0;
    let v100 = 0;
    let v101 = 0;
    for (const v102 of v97) {
      v99 += v102.dimensions.width;
      v100 = Math.max(v100, v102.dimensions.up);
      v101 = Math.max(v101, v102.dimensions.down);
    }
    v99 += (v97.length - 1) * this.config.horizontalSeparation;
    const v103 = v95.append("g").attr("class", "railroad-sequence");
    let v104 = 0;
    for (let v105 = 0; v105 < v97.length; v105++) {
      const v106 = v97[v105];
      const v107 = v100 - v106.dimensions.up;
      const v108 = v103.node().appendChild(v106.element);
      v108.setAttribute("transform", "translate(" + v104 + ", " + v107 + ")");
      if (v105 < v97.length - 1) {
        const v109 = v104 + v106.dimensions.width;
        const v110 = v109 + this.config.horizontalSeparation;
        const v111 = v100;
        v103.append("path").attr("class", "railroad-line").attr("d", new PathBuilder().moveTo(v109, v111).lineTo(v110, v111).build());
      }
      v104 += v106.dimensions.width + this.config.horizontalSeparation;
    }
    return {
      element: v103.node(),
      dimensions: {
        width: v99,
        height: v100 + v101,
        up: v100,
        down: v101
      }
    };
  }
  renderChoice(v112, v113) {
    const v114 = v113.map(v115 => this.renderExpression(v112, v115));
    let v116 = 0;
    let v117 = 0;
    for (const v118 of v114) {
      v116 = Math.max(v116, v118.dimensions.width);
      v117 += v118.dimensions.height;
    }
    v117 += (v114.length - 1) * this.config.verticalSeparation;
    const v119 = this.config.arcRadius;
    const v120 = v119 * 4;
    const v121 = v116 + v120;
    const v122 = v112.append("g").attr("class", "railroad-choice");
    let v123 = 0;
    const v124 = v117 / 2;
    for (const v125 of v114) {
      const v126 = v123;
      const v127 = v126 + v125.dimensions.up;
      const v128 = v119 * 2 + (v116 - v125.dimensions.width) / 2;
      const v129 = v122.node().appendChild(v125.element);
      v129.setAttribute("transform", "translate(" + v128 + ", " + v126 + ")");
      const v130 = new PathBuilder();
      const v131 = v127 > v124;
      if (v127 === v124) {
        v130.moveTo(0, v124).lineTo(v128, v127);
      } else {
        v130.moveTo(0, v124).arcTo(v119, v119, 0, false, v131, v119, v124 + (v131 ? v119 : -v119)).lineTo(v119, v127 - (v131 ? v119 : -v119)).arcTo(v119, v119, 0, false, !v131, v119 * 2, v127).lineTo(v128, v127);
      }
      v122.append("path").attr("class", "railroad-line").attr("d", v130.build());
      const v132 = new PathBuilder();
      const v133 = v128 + v125.dimensions.width;
      const v134 = v121 - v119 * 2;
      if (v127 === v124) {
        v132.moveTo(v133, v127).lineTo(v121, v124);
      } else {
        v132.moveTo(v133, v127).lineTo(v134, v127).arcTo(v119, v119, 0, false, !v131, v121 - v119, v127 + (v131 ? -v119 : v119)).lineTo(v121 - v119, v124 + (v131 ? v119 : -v119)).arcTo(v119, v119, 0, false, v131, v121, v124);
      }
      v122.append("path").attr("class", "railroad-line").attr("d", v132.build());
      v123 += v125.dimensions.height + this.config.verticalSeparation;
    }
    return {
      element: v122.node(),
      dimensions: {
        width: v121,
        height: v117,
        up: v124,
        down: v117 - v124
      }
    };
  }
  renderOptional(v135, v136) {
    const v137 = this.renderExpression(v135, v136);
    const v138 = this.config.arcRadius;
    const v139 = v138 * 2;
    const v140 = v137.dimensions.width + v138 * 4;
    const v141 = v137.dimensions.height + v139;
    const v142 = v135.append("g").attr("class", "railroad-optional");
    const v143 = v138 * 2;
    const v144 = v139;
    const v145 = v142.node().appendChild(v137.element);
    v145.setAttribute("transform", "translate(" + v143 + ", " + v144 + ")");
    const v146 = v144 + v137.dimensions.up;
    const v147 = new PathBuilder().moveTo(0, v146).lineTo(v138 * 2, v146);
    v142.append("path").attr("class", "railroad-line").attr("d", v147.build());
    const v148 = new PathBuilder().moveTo(v143 + v137.dimensions.width, v146).lineTo(v140, v146);
    v142.append("path").attr("class", "railroad-line").attr("d", v148.build());
    const v149 = new PathBuilder().moveTo(0, v146).arcTo(v138, v138, 0, false, false, v138, v146 - v138).lineTo(v138, v138).arcTo(v138, v138, 0, false, true, v138 * 2, 0).lineTo(v140 - v138 * 2, 0).arcTo(v138, v138, 0, false, true, v140 - v138, v138).lineTo(v140 - v138, v146 - v138).arcTo(v138, v138, 0, false, false, v140, v146);
    v142.append("path").attr("class", "railroad-line").attr("d", v149.build());
    return {
      element: v142.node(),
      dimensions: {
        width: v140,
        height: v141,
        up: v146,
        down: v141 - v146
      }
    };
  }
  renderRepetition(v150, v151, v152) {
    const v153 = this.renderExpression(v150, v151);
    const v154 = this.config.arcRadius;
    const v155 = v154 * 2;
    const v156 = v153.dimensions.width + v154 * 4;
    const v157 = v152 === 0;
    const v158 = v153.dimensions.height + v155 + (v157 ? v155 : 0);
    const v159 = v150.append("g").attr("class", "railroad-repetition");
    const v160 = v154 * 2;
    const v161 = v157 ? v155 : 0;
    const v162 = v159.node().appendChild(v153.element);
    v162.setAttribute("transform", "translate(" + v160 + ", " + v161 + ")");
    const v163 = v161 + v153.dimensions.up;
    v159.append("path").attr("class", "railroad-line").attr("d", new PathBuilder().moveTo(0, v163).lineTo(v154 * 2, v163).build());
    v159.append("path").attr("class", "railroad-line").attr("d", new PathBuilder().moveTo(v160 + v153.dimensions.width, v163).lineTo(v156, v163).build());
    const v164 = v161 + v153.dimensions.height + v154;
    const v165 = new PathBuilder().moveTo(v160 + v153.dimensions.width, v163).arcTo(v154, v154, 0, false, true, v160 + v153.dimensions.width + v154, v163 + v154).lineTo(v160 + v153.dimensions.width + v154, v164).arcTo(v154, v154, 0, false, true, v160 + v153.dimensions.width, v164 + v154).lineTo(v154 * 2, v164 + v154).arcTo(v154, v154, 0, false, true, v154, v164).lineTo(v154, v163 + v154).arcTo(v154, v154, 0, false, true, v154 * 2, v163);
    v159.append("path").attr("class", "railroad-line").attr("d", v165.build());
    if (v157) {
      const v166 = new PathBuilder().moveTo(0, v163).arcTo(v154, v154, 0, false, false, v154, v163 - v154).lineTo(v154, v154).arcTo(v154, v154, 0, false, true, v154 * 2, 0).lineTo(v156 - v154 * 2, 0).arcTo(v154, v154, 0, false, true, v156 - v154, v154).lineTo(v156 - v154, v163 - v154).arcTo(v154, v154, 0, false, false, v156, v163);
      v159.append("path").attr("class", "railroad-line").attr("d", v166.build());
    }
    return {
      element: v159.node(),
      dimensions: {
        width: v156,
        height: v158,
        up: v163,
        down: v158 - v163
      }
    };
  }
  renderSpecial(v167, v168) {
    const v169 = this.measureText("? " + v168 + " ?");
    const v170 = v169.width + this.config.padding * 2;
    const v171 = v169.height + this.config.padding * 2;
    const v172 = v167.append("g").attr("class", "railroad-special");
    v172.append("rect").attr("x", 0).attr("y", 0).attr("width", v170).attr("height", v171);
    v172.append("text").attr("x", v170 / 2).attr("y", v171 / 2).text("? " + v168 + " ?");
    return {
      element: v172.node(),
      dimensions: {
        width: v170,
        height: v171,
        up: v171 / 2,
        down: v171 / 2
      }
    };
  }
  renderExpression(v173, v174) {
    switch (v174.type) {
      case "terminal":
        return this.renderTerminal(v173, v174.value);
      case "nonterminal":
        return this.renderNonTerminal(v173, v174.name);
      case "sequence":
        return this.renderSequence(v173, v174.elements);
      case "choice":
        return this.renderChoice(v173, v174.alternatives);
      case "optional":
        return this.renderOptional(v173, v174.element);
      case "repetition":
        return this.renderRepetition(v173, v174.element, v174.min);
      case "special":
        return this.renderSpecial(v173, v174.text);
      default:
        throw new Error("Unknown node type: " + v174.type);
    }
  }
  renderRule(v175, v176) {
    const v177 = this.svg.append("g").attr("class", "railroad-rule").attr("transform", "translate(0, " + v176 + ")");
    const v178 = v175.name + " =";
    const v179 = this.measureText(v178).width + 20;
    const v180 = v179 + 20;
    const v181 = v177.append("g");
    const v182 = this.renderExpression(v181, v175.definition);
    const v183 = Math.max(20, v182.dimensions.up);
    const v184 = v183 - v182.dimensions.up;
    v181.attr("transform", "translate(" + v180 + ", " + v184 + ")");
    const v185 = v177.append("g").attr("class", "railroad-rule-name-group");
    v185.append("text").attr("class", "railroad-rule-name").attr("x", 0).attr("y", v183).text(v178);
    const v186 = v177.append("g").attr("class", "railroad-start");
    v186.append("circle").attr("cx", v179).attr("cy", v183).attr("r", this.config.markerRadius);
    const v187 = v177.append("g").attr("class", "railroad-end");
    v187.append("circle").attr("cx", v180 + v182.dimensions.width + 10).attr("cy", v183).attr("r", this.config.markerRadius);
    v177.append("path").attr("class", "railroad-line").attr("d", new PathBuilder().moveTo(v179 + this.config.markerRadius, v183).lineTo(v180, v183).build());
    v177.append("path").attr("class", "railroad-line").attr("d", new PathBuilder().moveTo(v180 + v182.dimensions.width, v183).lineTo(v180 + v182.dimensions.width + 10 - this.config.markerRadius, v183).build());
    return {
      height: Math.max(40, v184 + v182.dimensions.height + this.config.padding * 2),
      width: v180 + v182.dimensions.width + 10 + this.config.markerRadius
    };
  }
  renderDiagram(v188) {
    let v189 = this.config.padding;
    let v190 = 0;
    for (const v191 of v188) {
      const v192 = this.renderRule(v191, v189);
      v189 += v192.height + this.config.verticalSeparation;
      v190 = Math.max(v190, v192.width);
    }
    return {
      width: v190 + this.config.padding * 2,
      height: v189 + this.config.padding
    };
  }
};
var configureRailroadSvgSize = v1((v193, v194, v195) => {
  v7(v193, v194.height, v194.width, v195);
  v193.attr("viewBox", "0 0 " + v194.width + " " + v194.height);
}, "configureRailroadSvgSize");
var draw = v1((v196, v197, v198) => {
  v2.debug("[Railroad] Rendering diagram\n" + v196);
  try {
    const v199 = v3(v197);
    v199.attr("class", "railroad-diagram");
    const v200 = v4().railroad;
    const v201 = v200?.useMaxWidth ?? true;
    const v202 = db.getRules();
    v2.debug("[Railroad] Rendering " + v202.length + " rules");
    if (v202.length === 0) {
      v2.warn("[Railroad] No rules to render");
      configureRailroadSvgSize(v199, {
        height: 100,
        width: 200
      }, v201);
      return;
    }
    const v203 = new RailroadRenderer(v199, buildRailroadStyleOptions());
    const v204 = v203.renderDiagram(v202);
    configureRailroadSvgSize(v199, v204, v201);
    v2.debug("[Railroad] Render complete");
  } catch (v205) {
    v2.error("[Railroad] Render error:", v205);
    throw v205;
  }
}, "draw");
var renderer = {
  draw: draw
};
export { db as d, getStyles as g, renderer as r };