class ParseError extends Error {
  constructor(v1, v2) {
    var v3 = "KaTeX parse error: " + v1;
    var v4;
    var v5;
    var v6 = v2 && v2.loc;
    if (v6 && v6.start <= v6.end) {
      var v7 = v6.lexer.input;
      v4 = v6.start;
      v5 = v6.end;
      if (v4 === v7.length) {
        v3 += " at end of input: ";
      } else {
        v3 += " at position " + (v4 + 1) + ": ";
      }
      var v8 = v7.slice(v4, v5).replace(/[^]/g, "$&̲");
      var v9;
      if (v4 > 15) {
        v9 = "…" + v7.slice(v4 - 15, v4);
      } else {
        v9 = v7.slice(0, v4);
      }
      var v10;
      if (v5 + 15 < v7.length) {
        v10 = v7.slice(v5, v5 + 15) + "…";
      } else {
        v10 = v7.slice(v5);
      }
      v3 += v9 + v8 + v10;
    }
    super(v3);
    this.name = "ParseError";
    this.position = undefined;
    this.length = undefined;
    this.rawMessage = undefined;
    Object.setPrototypeOf(this, ParseError.prototype);
    this.position = v4;
    if (v4 != null && v5 != null) {
      this.length = v5 - v4;
    }
    this.rawMessage = v1;
  }
}
var uppercase = /([A-Z])/g;
var hyphenate = v11 => v11.replace(uppercase, "-$1").toLowerCase();
var ESCAPE_LOOKUP = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  "\"": "&quot;",
  "'": "&#x27;"
};
var ESCAPE_REGEX = /[&><"']/g;
var escape = v12 => String(v12).replace(ESCAPE_REGEX, v13 => ESCAPE_LOOKUP[v13]);
var getBaseElem = v14 => {
  if (v14.type === "ordgroup") {
    if (v14.body.length === 1) {
      return getBaseElem(v14.body[0]);
    } else {
      return v14;
    }
  } else if (v14.type === "color") {
    if (v14.body.length === 1) {
      return getBaseElem(v14.body[0]);
    } else {
      return v14;
    }
  } else if (v14.type === "font") {
    return getBaseElem(v14.body);
  } else {
    return v14;
  }
};
var characterNodesTypes = new Set(["mathord", "textord", "atom"]);
var isCharacterBox = v15 => characterNodesTypes.has(getBaseElem(v15).type);
var protocolFromUrl = v16 => {
  var v17 = /^[\x00-\x20]*([^\\/#?]*?)(:|&#0*58|&#x0*3a|&colon)/i.exec(v16);
  if (!v17) {
    return "_relative";
  }
  if (v17[2] !== ":") {
    return null;
  }
  if (!/^[a-zA-Z][a-zA-Z0-9+\-.]*$/.test(v17[1])) {
    return null;
  }
  return v17[1].toLowerCase();
};
var SETTINGS_SCHEMA = {
  displayMode: {
    type: "boolean",
    description: "Render math in display mode, which puts the math in display style (so \\int and \\sum are large, for example), and centers the math on the page on its own line.",
    cli: "-d, --display-mode"
  },
  output: {
    type: {
      enum: ["htmlAndMathml", "html", "mathml"]
    },
    description: "Determines the markup language of the output.",
    cli: "-F, --format <type>"
  },
  leqno: {
    type: "boolean",
    description: "Render display math in leqno style (left-justified tags)."
  },
  fleqn: {
    type: "boolean",
    description: "Render display math flush left."
  },
  throwOnError: {
    type: "boolean",
    default: true,
    cli: "-t, --no-throw-on-error",
    cliDescription: "Render errors (in the color given by --error-color) instead of throwing a ParseError exception when encountering an error."
  },
  errorColor: {
    type: "string",
    default: "#cc0000",
    cli: "-c, --error-color <color>",
    cliDescription: "A color string given in the format 'rgb' or 'rrggbb' (no #). This option determines the color of errors rendered by the -t option.",
    cliProcessor: v18 => "#" + v18
  },
  macros: {
    type: "object",
    cli: "-m, --macro <def>",
    cliDescription: "Define custom macro of the form '\\foo:expansion' (use multiple -m arguments for multiple macros).",
    cliDefault: [],
    cliProcessor: (v19, v20) => {
      v20.push(v19);
      return v20;
    }
  },
  minRuleThickness: {
    type: "number",
    description: "Specifies a minimum thickness, in ems, for fraction lines, `\\sqrt` top lines, `{array}` vertical lines, `\\hline`, `\\hdashline`, `\\underline`, `\\overline`, and the borders of `\\fbox`, `\\boxed`, and `\\fcolorbox`.",
    processor: v21 => Math.max(0, v21),
    cli: "--min-rule-thickness <size>",
    cliProcessor: parseFloat
  },
  colorIsTextColor: {
    type: "boolean",
    description: "Makes \\color behave like LaTeX's 2-argument \\textcolor, instead of LaTeX's one-argument \\color mode change.",
    cli: "-b, --color-is-text-color"
  },
  strict: {
    type: [{
      enum: ["warn", "ignore", "error"]
    }, "boolean", "function"],
    description: "Turn on strict / LaTeX faithfulness mode, which throws an error if the input uses features that are not supported by LaTeX.",
    cli: "-S, --strict",
    cliDefault: false
  },
  trust: {
    type: ["boolean", "function"],
    description: "Trust the input, enabling all HTML features such as \\url.",
    cli: "-T, --trust"
  },
  maxSize: {
    type: "number",
    default: Infinity,
    description: "If non-zero, all user-specified sizes, e.g. in \\rule{500em}{500em}, will be capped to maxSize ems. Otherwise, elements and spaces can be arbitrarily large",
    processor: v22 => Math.max(0, v22),
    cli: "-s, --max-size <n>",
    cliProcessor: parseInt
  },
  maxExpand: {
    type: "number",
    default: 1000,
    description: "Limit the number of macro expansions to the specified number, to prevent e.g. infinite macro loops. If set to Infinity, the macro expander will try to fully expand as in LaTeX.",
    processor: v23 => Math.max(0, v23),
    cli: "-e, --max-expand <n>",
    cliProcessor: v24 => v24 === "Infinity" ? Infinity : parseInt(v24)
  },
  globalGroup: {
    type: "boolean",
    cli: false
  }
};
function getImplicitDefault(v25) {
  if (typeof v25 !== "string") {
    return v25.enum[0];
  }
  switch (v25) {
    case "boolean":
      return false;
    case "string":
      return "";
    case "number":
      return 0;
    case "object":
      return {};
    default:
      throw new Error("Unexpected schema type; settings must declare an explicit default.");
  }
}
function getDefaultValue(v26) {
  if (v26.default !== undefined) {
    return v26.default;
  }
  var v27 = Array.isArray(v26.type) ? v26.type[0] : v26.type;
  return getImplicitDefault(v27);
}
function applySetting(v28, v29, v30, v31) {
  var v32 = v30[v29];
  v28[v29] = v32 !== undefined ? v31.processor ? v31.processor(v32) : v32 : getDefaultValue(v31);
}
class Settings {
  constructor(v33 = {}) {
    this.displayMode = undefined;
    this.output = undefined;
    this.leqno = undefined;
    this.fleqn = undefined;
    this.throwOnError = undefined;
    this.errorColor = undefined;
    this.macros = undefined;
    this.minRuleThickness = undefined;
    this.colorIsTextColor = undefined;
    this.strict = undefined;
    this.trust = undefined;
    this.maxSize = undefined;
    this.maxExpand = undefined;
    this.globalGroup = undefined;
    v33 = v33 || {};
    for (var v34 of Object.keys(SETTINGS_SCHEMA)) {
      var v35 = SETTINGS_SCHEMA[v34];
      if (v35) {
        applySetting(this, v34, v33, v35);
      }
    }
  }
  reportNonstrict(v36, v37, v38) {
    var v39 = this.strict;
    if (typeof v39 === "function") {
      v39 = v39(v36, v37, v38);
    }
    if (!v39 || v39 === "ignore") {
      return;
    } else if (v39 === true || v39 === "error") {
      throw new ParseError("LaTeX-incompatible input and strict mode is set to 'error': " + (v37 + " [" + v36 + "]"), v38);
    } else if (v39 === "warn") {
      if (typeof console !== "undefined") {
        console.warn("LaTeX-incompatible input and strict mode is set to 'warn': " + (v37 + " [" + v36 + "]"));
      }
    } else if (typeof console !== "undefined") {
      console.warn("LaTeX-incompatible input and strict mode is set to " + ("unrecognized '" + v39 + "': " + v37 + " [" + v36 + "]"));
    }
  }
  useStrictBehavior(v40, v41, v42) {
    var v43 = this.strict;
    if (typeof v43 === "function") {
      try {
        v43 = v43(v40, v41, v42);
      } catch (v44) {
        v43 = "error";
      }
    }
    if (!v43 || v43 === "ignore") {
      return false;
    } else if (v43 === true || v43 === "error") {
      return true;
    } else if (v43 === "warn") {
      if (typeof console !== "undefined") {
        console.warn("LaTeX-incompatible input and strict mode is set to 'warn': " + (v41 + " [" + v40 + "]"));
      }
      return false;
    } else {
      if (typeof console !== "undefined") {
        console.warn("LaTeX-incompatible input and strict mode is set to " + ("unrecognized '" + v43 + "': " + v41 + " [" + v40 + "]"));
      }
      return false;
    }
  }
  isTrusted(v45) {
    if ("url" in v45 && v45.url && !v45.protocol) {
      var v46 = protocolFromUrl(v45.url);
      if (v46 == null) {
        return false;
      }
      v45.protocol = v46;
    }
    var v47 = typeof this.trust === "function" ? this.trust(v45) : this.trust;
    return Boolean(v47);
  }
}
class Style {
  constructor(v48, v49, v50) {
    this.id = undefined;
    this.size = undefined;
    this.cramped = undefined;
    this.id = v48;
    this.size = v49;
    this.cramped = v50;
  }
  sup() {
    return styles[sup[this.id]];
  }
  sub() {
    return styles[sub[this.id]];
  }
  fracNum() {
    return styles[fracNum[this.id]];
  }
  fracDen() {
    return styles[fracDen[this.id]];
  }
  cramp() {
    return styles[cramp[this.id]];
  }
  text() {
    return styles[text$1[this.id]];
  }
  isTight() {
    return this.size >= 2;
  }
}
var D = 0;
var Dc = 1;
var T = 2;
var Tc = 3;
var S = 4;
var Sc = 5;
var SS = 6;
var SSc = 7;
var styles = [new Style(D, 0, false), new Style(Dc, 0, true), new Style(T, 1, false), new Style(Tc, 1, true), new Style(S, 2, false), new Style(Sc, 2, true), new Style(SS, 3, false), new Style(SSc, 3, true)];
var sup = [S, Sc, S, Sc, SS, SSc, SS, SSc];
var sub = [Sc, Sc, Sc, Sc, SSc, SSc, SSc, SSc];
var fracNum = [T, Tc, S, Sc, SS, SSc, SS, SSc];
var fracDen = [Tc, Tc, Sc, Sc, SSc, SSc, SSc, SSc];
var cramp = [Dc, Dc, Tc, Tc, Sc, Sc, SSc, SSc];
var text$1 = [D, Dc, T, Tc, T, Tc, T, Tc];
var Style$1 = {
  DISPLAY: styles[D],
  TEXT: styles[T],
  SCRIPT: styles[S],
  SCRIPTSCRIPT: styles[SS]
};
var scriptData = [{
  name: "latin",
  blocks: [[256, 591], [768, 879]]
}, {
  name: "cyrillic",
  blocks: [[1024, 1279]]
}, {
  name: "armenian",
  blocks: [[1328, 1423]]
}, {
  name: "brahmic",
  blocks: [[2304, 4255]]
}, {
  name: "georgian",
  blocks: [[4256, 4351]]
}, {
  name: "cjk",
  blocks: [[12288, 12543], [19968, 40879], [65280, 65376]]
}, {
  name: "hangul",
  blocks: [[44032, 55215]]
}];
function scriptFromCodepoint(v51) {
  for (var v52 = 0; v52 < scriptData.length; v52++) {
    var v53 = scriptData[v52];
    for (var v54 = 0; v54 < v53.blocks.length; v54++) {
      var v55 = v53.blocks[v54];
      if (v51 >= v55[0] && v51 <= v55[1]) {
        return v53.name;
      }
    }
  }
  return null;
}
var allBlocks = [];
scriptData.forEach(v56 => v56.blocks.forEach(v57 => allBlocks.push(...v57)));
function supportedCodepoint(v58) {
  for (var v59 = 0; v59 < allBlocks.length; v59 += 2) {
    if (v58 >= allBlocks[v59] && v58 <= allBlocks[v59 + 1]) {
      return true;
    }
  }
  return false;
}
var doubleBrushStroke = v60 => v60 + " " + v60;
var hLinePad = 80;
var sqrtMain = function sqrtMain2(v61, v62) {
  return "M95," + (622 + v61 + v62) + "\nc-2.7,0,-7.17,-2.7,-13.5,-8c-5.8,-5.3,-9.5,-10,-9.5,-14\nc0,-2,0.3,-3.3,1,-4c1.3,-2.7,23.83,-20.7,67.5,-54\nc44.2,-33.3,65.8,-50.3,66.5,-51c1.3,-1.3,3,-2,5,-2c4.7,0,8.7,3.3,12,10\ns173,378,173,378c0.7,0,35.3,-71,104,-213c68.7,-142,137.5,-285,206.5,-429\nc69,-144,104.5,-217.7,106.5,-221\nl" + v61 / 2.075 + " -" + v61 + "\nc5.3,-9.3,12,-14,20,-14\nH400000v" + (40 + v61) + "H845.2724\ns-225.272,467,-225.272,467s-235,486,-235,486c-2.7,4.7,-9,7,-19,7\nc-6,0,-10,-1,-12,-3s-194,-422,-194,-422s-65,47,-65,47z\nM" + (834 + v61) + " " + v62 + "h400000v" + (40 + v61) + "h-400000z";
};
var sqrtSize1 = function sqrtSize12(v63, v64) {
  return "M263," + (601 + v63 + v64) + "c0.7,0,18,39.7,52,119\nc34,79.3,68.167,158.7,102.5,238c34.3,79.3,51.8,119.3,52.5,120\nc340,-704.7,510.7,-1060.3,512,-1067\nl" + v63 / 2.084 + " -" + v63 + "\nc4.7,-7.3,11,-11,19,-11\nH40000v" + (40 + v63) + "H1012.3\ns-271.3,567,-271.3,567c-38.7,80.7,-84,175,-136,283c-52,108,-89.167,185.3,-111.5,232\nc-22.3,46.7,-33.8,70.3,-34.5,71c-4.7,4.7,-12.3,7,-23,7s-12,-1,-12,-1\ns-109,-253,-109,-253c-72.7,-168,-109.3,-252,-110,-252c-10.7,8,-22,16.7,-34,26\nc-22,17.3,-33.3,26,-34,26s-26,-26,-26,-26s76,-59,76,-59s76,-60,76,-60z\nM" + (1001 + v63) + " " + v64 + "h400000v" + (40 + v63) + "h-400000z";
};
var sqrtSize2 = function sqrtSize22(v65, v66) {
  return "M983 " + (10 + v65 + v66) + "\nl" + v65 / 3.13 + " -" + v65 + "\nc4,-6.7,10,-10,18,-10 H400000v" + (40 + v65) + "\nH1013.1s-83.4,268,-264.1,840c-180.7,572,-277,876.3,-289,913c-4.7,4.7,-12.7,7,-24,7\ns-12,0,-12,0c-1.3,-3.3,-3.7,-11.7,-7,-25c-35.3,-125.3,-106.7,-373.3,-214,-744\nc-10,12,-21,25,-33,39s-32,39,-32,39c-6,-5.3,-15,-14,-27,-26s25,-30,25,-30\nc26.7,-32.7,52,-63,76,-91s52,-60,52,-60s208,722,208,722\nc56,-175.3,126.3,-397.3,211,-666c84.7,-268.7,153.8,-488.2,207.5,-658.5\nc53.7,-170.3,84.5,-266.8,92.5,-289.5z\nM" + (1001 + v65) + " " + v66 + "h400000v" + (40 + v65) + "h-400000z";
};
var sqrtSize3 = function sqrtSize32(v67, v68) {
  return "M424," + (2398 + v67 + v68) + "\nc-1.3,-0.7,-38.5,-172,-111.5,-514c-73,-342,-109.8,-513.3,-110.5,-514\nc0,-2,-10.7,14.3,-32,49c-4.7,7.3,-9.8,15.7,-15.5,25c-5.7,9.3,-9.8,16,-12.5,20\ns-5,7,-5,7c-4,-3.3,-8.3,-7.7,-13,-13s-13,-13,-13,-13s76,-122,76,-122s77,-121,77,-121\ns209,968,209,968c0,-2,84.7,-361.7,254,-1079c169.3,-717.3,254.7,-1077.7,256,-1081\nl" + v67 / 4.223 + " -" + v67 + "c4,-6.7,10,-10,18,-10 H400000\nv" + (40 + v67) + "H1014.6\ns-87.3,378.7,-272.6,1166c-185.3,787.3,-279.3,1182.3,-282,1185\nc-2,6,-10,9,-24,9\nc-8,0,-12,-0.7,-12,-2z M" + (1001 + v67) + " " + v68 + "\nh400000v" + (40 + v67) + "h-400000z";
};
var sqrtSize4 = function sqrtSize42(v69, v70) {
  return "M473," + (2713 + v69 + v70) + "\nc339.3,-1799.3,509.3,-2700,510,-2702 l" + v69 / 5.298 + " -" + v69 + "\nc3.3,-7.3,9.3,-11,18,-11 H400000v" + (40 + v69) + "H1017.7\ns-90.5,478,-276.2,1466c-185.7,988,-279.5,1483,-281.5,1485c-2,6,-10,9,-24,9\nc-8,0,-12,-0.7,-12,-2c0,-1.3,-5.3,-32,-16,-92c-50.7,-293.3,-119.7,-693.3,-207,-1200\nc0,-1.3,-5.3,8.7,-16,30c-10.7,21.3,-21.3,42.7,-32,64s-16,33,-16,33s-26,-26,-26,-26\ns76,-153,76,-153s77,-151,77,-151c0.7,0.7,35.7,202,105,604c67.3,400.7,102,602.7,104,\n606zM" + (1001 + v69) + " " + v70 + "h400000v" + (40 + v69) + "H1017.7z";
};
var phasePath = function phasePath2(v71) {
  var v72 = v71 / 2;
  return "M400000 " + v71 + " H0 L" + v72 + " 0 l65 45 L145 " + (v71 - 80) + " H400000z";
};
var sqrtTall = function sqrtTall2(v73, v74, v75) {
  var v76 = v75 - 54 - v74 - v73;
  return "M702 " + (v73 + v74) + "H400000" + (40 + v73) + "\nH742v" + v76 + "l-4 4-4 4c-.667.7 -2 1.5-4 2.5s-4.167 1.833-6.5 2.5-5.5 1-9.5 1\nh-12l-28-84c-16.667-52-96.667 -294.333-240-727l-212 -643 -85 170\nc-4-3.333-8.333-7.667-13 -13l-13-13l77-155 77-156c66 199.333 139 419.667\n219 661 l218 661zM702 " + v74 + "H400000v" + (40 + v73) + "H742z";
};
var sqrtPath = function sqrtPath2(v77, v78, v79) {
  v78 = v78 * 1000;
  var v80 = "";
  switch (v77) {
    case "sqrtMain":
      v80 = sqrtMain(v78, hLinePad);
      break;
    case "sqrtSize1":
      v80 = sqrtSize1(v78, hLinePad);
      break;
    case "sqrtSize2":
      v80 = sqrtSize2(v78, hLinePad);
      break;
    case "sqrtSize3":
      v80 = sqrtSize3(v78, hLinePad);
      break;
    case "sqrtSize4":
      v80 = sqrtSize4(v78, hLinePad);
      break;
    case "sqrtTall":
      v80 = sqrtTall(v78, hLinePad, v79);
  }
  return v80;
};
var innerPath = function innerPath2(v81, v82) {
  switch (v81) {
    case "⎜":
      return doubleBrushStroke("M291 0 H417 V" + v82 + " H291z");
    case "∣":
      return doubleBrushStroke("M145 0 H188 V" + v82 + " H145z");
    case "∥":
      return doubleBrushStroke("M145 0 H188 V" + v82 + " H145z") + doubleBrushStroke("M367 0 H410 V" + v82 + " H367z");
    case "⎟":
      return doubleBrushStroke("M457 0 H583 V" + v82 + " H457z");
    case "⎢":
      return doubleBrushStroke("M319 0 H403 V" + v82 + " H319z");
    case "⎥":
      return doubleBrushStroke("M263 0 H347 V" + v82 + " H263z");
    case "⎪":
      return doubleBrushStroke("M384 0 H504 V" + v82 + " H384z");
    case "⏐":
      return doubleBrushStroke("M312 0 H355 V" + v82 + " H312z");
    case "‖":
      return doubleBrushStroke("M257 0 H300 V" + v82 + " H257z") + doubleBrushStroke("M478 0 H521 V" + v82 + " H478z");
    default:
      return "";
  }
};
var path = {
  doubleleftarrow: "M262 157\nl10-10c34-36 62.7-77 86-123 3.3-8 5-13.3 5-16 0-5.3-6.7-8-20-8-7.3\n 0-12.2.5-14.5 1.5-2.3 1-4.8 4.5-7.5 10.5-49.3 97.3-121.7 169.3-217 216-28\n 14-57.3 25-88 33-6.7 2-11 3.8-13 5.5-2 1.7-3 4.2-3 7.5s1 5.8 3 7.5\nc2 1.7 6.3 3.5 13 5.5 68 17.3 128.2 47.8 180.5 91.5 52.3 43.7 93.8 96.2 124.5\n 157.5 9.3 8 15.3 12.3 18 13h6c12-.7 18-4 18-10 0-2-1.7-7-5-15-23.3-46-52-87\n-86-123l-10-10h399738v-40H218c328 0 0 0 0 0l-10-8c-26.7-20-65.7-43-117-69 2.7\n-2 6-3.7 10-5 36.7-16 72.3-37.3 107-64l10-8h399782v-40z\nm8 0v40h399730v-40zm0 194v40h399730v-40z",
  doublerightarrow: "M399738 392l\n-10 10c-34 36-62.7 77-86 123-3.3 8-5 13.3-5 16 0 5.3 6.7 8 20 8 7.3 0 12.2-.5\n 14.5-1.5 2.3-1 4.8-4.5 7.5-10.5 49.3-97.3 121.7-169.3 217-216 28-14 57.3-25 88\n-33 6.7-2 11-3.8 13-5.5 2-1.7 3-4.2 3-7.5s-1-5.8-3-7.5c-2-1.7-6.3-3.5-13-5.5-68\n-17.3-128.2-47.8-180.5-91.5-52.3-43.7-93.8-96.2-124.5-157.5-9.3-8-15.3-12.3-18\n-13h-6c-12 .7-18 4-18 10 0 2 1.7 7 5 15 23.3 46 52 87 86 123l10 10H0v40h399782\nc-328 0 0 0 0 0l10 8c26.7 20 65.7 43 117 69-2.7 2-6 3.7-10 5-36.7 16-72.3 37.3\n-107 64l-10 8H0v40zM0 157v40h399730v-40zm0 194v40h399730v-40z",
  leftarrow: "M400000 241H110l3-3c68.7-52.7 113.7-120\n 135-202 4-14.7 6-23 6-25 0-7.3-7-11-21-11-8 0-13.2.8-15.5 2.5-2.3 1.7-4.2 5.8\n-5.5 12.5-1.3 4.7-2.7 10.3-4 17-12 48.7-34.8 92-68.5 130S65.3 228.3 18 247\nc-10 4-16 7.7-18 11 0 8.7 6 14.3 18 17 47.3 18.7 87.8 47 121.5 85S196 441.3 208\n 490c.7 2 1.3 5 2 9s1.2 6.7 1.5 8c.3 1.3 1 3.3 2 6s2.2 4.5 3.5 5.5c1.3 1 3.3\n 1.8 6 2.5s6 1 10 1c14 0 21-3.7 21-11 0-2-2-10.3-6-25-20-79.3-65-146.7-135-202\n l-3-3h399890zM100 241v40h399900v-40z",
  leftbrace: "M6 548l-6-6v-35l6-11c56-104 135.3-181.3 238-232 57.3-28.7 117\n-45 179-50h399577v120H403c-43.3 7-81 15-113 26-100.7 33-179.7 91-237 174-2.7\n 5-6 9-10 13-.7 1-7.3 1-20 1H6z",
  leftbraceunder: "M0 6l6-6h17c12.688 0 19.313.3 20 1 4 4 7.313 8.3 10 13\n 35.313 51.3 80.813 93.8 136.5 127.5 55.688 33.7 117.188 55.8 184.5 66.5.688\n 0 2 .3 4 1 18.688 2.7 76 4.3 172 5h399450v120H429l-6-1c-124.688-8-235-61.7\n-331-161C60.687 138.7 32.312 99.3 7 54L0 41V6z",
  leftgroup: "M400000 80\nH435C64 80 168.3 229.4 21 260c-5.9 1.2-18 0-18 0-2 0-3-1-3-3v-38C76 61 257 0\n 435 0h399565z",
  leftgroupunder: "M400000 262\nH435C64 262 168.3 112.6 21 82c-5.9-1.2-18 0-18 0-2 0-3 1-3 3v38c76 158 257 219\n 435 219h399565z",
  leftharpoon: "M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3\n-3.3 10.2-9.5 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5\n-18.3 3-21-1.3-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7\n-196 228-6.7 4.7-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40z",
  leftharpoonplus: "M0 267c.7 5.3 3 10 7 14h399993v-40H93c3.3-3.3 10.2-9.5\n 20.5-18.5s17.8-15.8 22.5-20.5c50.7-52 88-110.3 112-175 4-11.3 5-18.3 3-21-1.3\n-4-7.3-6-18-6-8 0-13 .7-15 2s-4.7 6.7-8 16c-42 98.7-107.3 174.7-196 228-6.7 4.7\n-10.7 8-12 10-1.3 2-2 5.7-2 11zm100-26v40h399900v-40zM0 435v40h400000v-40z\nm0 0v40h400000v-40z",
  leftharpoondown: "M7 241c-4 4-6.333 8.667-7 14 0 5.333.667 9 2 11s5.333\n 5.333 12 10c90.667 54 156 130 196 228 3.333 10.667 6.333 16.333 9 17 2 .667 5\n 1 9 1h5c10.667 0 16.667-2 18-6 2-2.667 1-9.667-3-21-32-87.333-82.667-157.667\n-152-211l-3-3h399907v-40zM93 281 H400000 v-40L7 241z",
  leftharpoondownplus: "M7 435c-4 4-6.3 8.7-7 14 0 5.3.7 9 2 11s5.3 5.3 12\n 10c90.7 54 156 130 196 228 3.3 10.7 6.3 16.3 9 17 2 .7 5 1 9 1h5c10.7 0 16.7\n-2 18-6 2-2.7 1-9.7-3-21-32-87.3-82.7-157.7-152-211l-3-3h399907v-40H7zm93 0\nv40h399900v-40zM0 241v40h399900v-40zm0 0v40h399900v-40z",
  lefthook: "M400000 281 H103s-33-11.2-61-33.5S0 197.3 0 164s14.2-61.2 42.5\n-83.5C70.8 58.2 104 47 142 47 c16.7 0 25 6.7 25 20 0 12-8.7 18.7-26 20-40 3.3\n-68.7 15.7-86 37-10 12-15 25.3-15 40 0 22.7 9.8 40.7 29.5 54 19.7 13.3 43.5 21\n 71.5 23h399859zM103 281v-40h399897v40z",
  leftlinesegment: doubleBrushStroke("M40 281 V428 H0 V94 H40 V241 H400000 v40z"),
  leftbracketunder: doubleBrushStroke("M0 0 h120 V290 H399995 v120 H0z"),
  leftbracketover: doubleBrushStroke("M0 440 h120 V150 H399995 v-120 H0z"),
  leftmapsto: doubleBrushStroke("M40 281 V448H0V74H40V241H400000v40z"),
  leftToFrom: "M0 147h400000v40H0zm0 214c68 40 115.7 95.7 143 167h22c15.3 0 23\n-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69-70-101l-7-8h399905v-40H95l7-8\nc28.7-32 52-65.7 70-101 10.7-23.3 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 265.3\n 68 321 0 361zm0-174v-40h399900v40zm100 154v40h399900v-40z",
  longequal: doubleBrushStroke("M0 50 h400000 v40H0z m0 194h40000v40H0z"),
  midbrace: "M200428 334\nc-100.7-8.3-195.3-44-280-108-55.3-42-101.7-93-139-153l-9-14c-2.7 4-5.7 8.7-9 14\n-53.3 86.7-123.7 153-211 199-66.7 36-137.3 56.3-212 62H0V214h199568c178.3-11.7\n 311.7-78.3 403-201 6-8 9.7-12 11-12 .7-.7 6.7-1 18-1s17.3.3 18 1c1.3 0 5 4 11\n 12 44.7 59.3 101.3 106.3 170 141s145.3 54.3 229 60h199572v120z",
  midbraceunder: "M199572 214\nc100.7 8.3 195.3 44 280 108 55.3 42 101.7 93 139 153l9 14c2.7-4 5.7-8.7 9-14\n 53.3-86.7 123.7-153 211-199 66.7-36 137.3-56.3 212-62h199568v120H200432c-178.3\n 11.7-311.7 78.3-403 201-6 8-9.7 12-11 12-.7.7-6.7 1-18 1s-17.3-.3-18-1c-1.3 0\n-5-4-11-12-44.7-59.3-101.3-106.3-170-141s-145.3-54.3-229-60H0V214z",
  oiintSize1: "M512.6 71.6c272.6 0 320.3 106.8 320.3 178.2 0 70.8-47.7 177.6\n-320.3 177.6S193.1 320.6 193.1 249.8c0-71.4 46.9-178.2 319.5-178.2z\nm368.1 178.2c0-86.4-60.9-215.4-368.1-215.4-306.4 0-367.3 129-367.3 215.4 0 85.8\n60.9 214.8 367.3 214.8 307.2 0 368.1-129 368.1-214.8z",
  oiintSize2: "M757.8 100.1c384.7 0 451.1 137.6 451.1 230 0 91.3-66.4 228.8\n-451.1 228.8-386.3 0-452.7-137.5-452.7-228.8 0-92.4 66.4-230 452.7-230z\nm502.4 230c0-111.2-82.4-277.2-502.4-277.2s-504 166-504 277.2\nc0 110 84 276 504 276s502.4-166 502.4-276z",
  oiiintSize1: "M681.4 71.6c408.9 0 480.5 106.8 480.5 178.2 0 70.8-71.6 177.6\n-480.5 177.6S202.1 320.6 202.1 249.8c0-71.4 70.5-178.2 479.3-178.2z\nm525.8 178.2c0-86.4-86.8-215.4-525.7-215.4-437.9 0-524.7 129-524.7 215.4 0\n85.8 86.8 214.8 524.7 214.8 438.9 0 525.7-129 525.7-214.8z",
  oiiintSize2: "M1021.2 53c603.6 0 707.8 165.8 707.8 277.2 0 110-104.2 275.8\n-707.8 275.8-606 0-710.2-165.8-710.2-275.8C311 218.8 415.2 53 1021.2 53z\nm770.4 277.1c0-131.2-126.4-327.6-770.5-327.6S248.4 198.9 248.4 330.1\nc0 130 128.8 326.4 772.7 326.4s770.5-196.4 770.5-326.4z",
  rightarrow: "M0 241v40h399891c-47.3 35.3-84 78-110 128\n-16.7 32-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20\n 11 8 0 13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7\n 39-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85\n-40.5-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5\n-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67\n 151.7 139 205zm0 0v40h399900v-40z",
  rightbrace: "M400000 542l\n-6 6h-17c-12.7 0-19.3-.3-20-1-4-4-7.3-8.3-10-13-35.3-51.3-80.8-93.8-136.5-127.5\ns-117.2-55.8-184.5-66.5c-.7 0-2-.3-4-1-18.7-2.7-76-4.3-172-5H0V214h399571l6 1\nc124.7 8 235 61.7 331 161 31.3 33.3 59.7 72.7 85 118l7 13v35z",
  rightbraceunder: "M399994 0l6 6v35l-6 11c-56 104-135.3 181.3-238 232-57.3\n 28.7-117 45-179 50H-300V214h399897c43.3-7 81-15 113-26 100.7-33 179.7-91 237\n-174 2.7-5 6-9 10-13 .7-1 7.3-1 20-1h17z",
  rightgroup: "M0 80h399565c371 0 266.7 149.4 414 180 5.9 1.2 18 0 18 0 2 0\n 3-1 3-3v-38c-76-158-257-219-435-219H0z",
  rightgroupunder: "M0 262h399565c371 0 266.7-149.4 414-180 5.9-1.2 18 0 18\n 0 2 0 3 1 3 3v38c-76 158-257 219-435 219H0z",
  rightharpoon: "M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3\n-3.7-15.3-11-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2\n-10.7 0-16.7 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58\n 69.2 92 94.5zm0 0v40h399900v-40z",
  rightharpoonplus: "M0 241v40h399993c4.7-4.7 7-9.3 7-14 0-9.3-3.7-15.3-11\n-18-92.7-56.7-159-133.7-199-231-3.3-9.3-6-14.7-8-16-2-1.3-7-2-15-2-10.7 0-16.7\n 2-18 6-2 2.7-1 9.7 3 21 15.3 42 36.7 81.8 64 119.5 27.3 37.7 58 69.2 92 94.5z\nm0 0v40h399900v-40z m100 194v40h399900v-40zm0 0v40h399900v-40z",
  rightharpoondown: "M399747 511c0 7.3 6.7 11 20 11 8 0 13-.8 15-2.5s4.7-6.8\n 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3 8.5-5.8 9.5\n-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3-64.7 57-92 95\n-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 241v40h399900v-40z",
  rightharpoondownplus: "M399747 705c0 7.3 6.7 11 20 11 8 0 13-.8\n 15-2.5s4.7-6.8 8-15.5c40-94 99.3-166.3 178-217 13.3-8 20.3-12.3 21-13 5.3-3.3\n 8.5-5.8 9.5-7.5 1-1.7 1.5-5.2 1.5-10.5s-2.3-10.3-7-15H0v40h399908c-34 25.3\n-64.7 57-92 95-27.3 38-48.7 77.7-64 119-3.3 8.7-5 14-5 16zM0 435v40h399900v-40z\nm0-194v40h400000v-40zm0 0v40h400000v-40z",
  righthook: "M399859 241c-764 0 0 0 0 0 40-3.3 68.7-15.7 86-37 10-12 15-25.3\n 15-40 0-22.7-9.8-40.7-29.5-54-19.7-13.3-43.5-21-71.5-23-17.3-1.3-26-8-26-20 0\n-13.3 8.7-20 26-20 38 0 71 11.2 99 33.5 0 0 7 5.6 21 16.7 14 11.2 21 33.5 21\n 66.8s-14 61.2-42 83.5c-28 22.3-61 33.5-99 33.5L0 241z M0 281v-40h399859v40z",
  rightlinesegment: doubleBrushStroke("M399960 241 V94 h40 V428 h-40 V281 H0 v-40z"),
  rightbracketunder: doubleBrushStroke("M399995 0 h-120 V290 H0 v120 H400000z"),
  rightbracketover: doubleBrushStroke("M399995 440 h-120 V150 H0 v-120 H399995z"),
  rightToFrom: "M400000 167c-70.7-42-118-97.7-142-167h-23c-15.3 0-23 .3-23\n 1 0 1.3 5.3 13.7 16 37 18 35.3 41.3 69 70 101l7 8H0v40h399905l-7 8c-28.7 32\n-52 65.7-70 101-10.7 23.3-16 35.7-16 37 0 .7 7.7 1 23 1h23c24-69.3 71.3-125 142\n-167z M100 147v40h399900v-40zM0 341v40h399900v-40z",
  twoheadleftarrow: "M0 167c68 40\n 115.7 95.7 143 167h22c15.3 0 23-.3 23-1 0-1.3-5.3-13.7-16-37-18-35.3-41.3-69\n-70-101l-7-8h125l9 7c50.7 39.3 85 86 103 140h46c0-4.7-6.3-18.7-19-42-18-35.3\n-40-67.3-66-96l-9-9h399716v-40H284l9-9c26-28.7 48-60.7 66-96 12.7-23.333 19\n-37.333 19-42h-46c-18 54-52.3 100.7-103 140l-9 7H95l7-8c28.7-32 52-65.7 70-101\n 10.7-23.333 16-35.7 16-37 0-.7-7.7-1-23-1h-22C115.7 71.3 68 127 0 167z",
  twoheadrightarrow: "M400000 167\nc-68-40-115.7-95.7-143-167h-22c-15.3 0-23 .3-23 1 0 1.3 5.3 13.7 16 37 18 35.3\n 41.3 69 70 101l7 8h-125l-9-7c-50.7-39.3-85-86-103-140h-46c0 4.7 6.3 18.7 19 42\n 18 35.3 40 67.3 66 96l9 9H0v40h399716l-9 9c-26 28.7-48 60.7-66 96-12.7 23.333\n-19 37.333-19 42h46c18-54 52.3-100.7 103-140l9-7h125l-7 8c-28.7 32-52 65.7-70\n 101-10.7 23.333-16 35.7-16 37 0 .7 7.7 1 23 1h22c27.3-71.3 75-127 143-167z",
  tilde1: "M200 55.538c-77 0-168 73.953-177 73.953-3 0-7\n-2.175-9-5.437L2 97c-1-2-2-4-2-6 0-4 2-7 5-9l20-12C116 12 171 0 207 0c86 0\n 114 68 191 68 78 0 168-68 177-68 4 0 7 2 9 5l12 19c1 2.175 2 4.35 2 6.525 0\n 4.35-2 7.613-5 9.788l-19 13.05c-92 63.077-116.937 75.308-183 76.128\n-68.267.847-113-73.952-191-73.952z",
  tilde2: "M344 55.266c-142 0-300.638 81.316-311.5 86.418\n-8.01 3.762-22.5 10.91-23.5 5.562L1 120c-1-2-1-3-1-4 0-5 3-9 8-10l18.4-9C160.9\n 31.9 283 0 358 0c148 0 188 122 331 122s314-97 326-97c4 0 8 2 10 7l7 21.114\nc1 2.14 1 3.21 1 4.28 0 5.347-3 9.626-7 10.696l-22.3 12.622C852.6 158.372 751\n 181.476 676 181.476c-149 0-189-126.21-332-126.21z",
  tilde3: "M786 59C457 59 32 175.242 13 175.242c-6 0-10-3.457\n-11-10.37L.15 138c-1-7 3-12 10-13l19.2-6.4C378.4 40.7 634.3 0 804.3 0c337 0\n 411.8 157 746.8 157 328 0 754-112 773-112 5 0 10 3 11 9l1 14.075c1 8.066-.697\n 16.595-6.697 17.492l-21.052 7.31c-367.9 98.146-609.15 122.696-778.15 122.696\n -338 0-409-156.573-744-156.573z",
  tilde4: "M786 58C457 58 32 177.487 13 177.487c-6 0-10-3.345\n-11-10.035L.15 143c-1-7 3-12 10-13l22-6.7C381.2 35 637.15 0 807.15 0c337 0 409\n 177 744 177 328 0 754-127 773-127 5 0 10 3 11 9l1 14.794c1 7.805-3 13.38-9\n 14.495l-20.7 5.574c-366.85 99.79-607.3 139.372-776.3 139.372-338 0-409\n -175.236-744-175.236z",
  vec: "M377 20c0-5.333 1.833-10 5.5-14S391 0 397 0c4.667 0 8.667 1.667 12 5\n3.333 2.667 6.667 9 10 19 6.667 24.667 20.333 43.667 41 57 7.333 4.667 11\n10.667 11 18 0 6-1 10-3 12s-6.667 5-14 9c-28.667 14.667-53.667 35.667-75 63\n-1.333 1.333-3.167 3.5-5.5 6.5s-4 4.833-5 5.5c-1 .667-2.5 1.333-4.5 2s-4.333 1\n-7 1c-4.667 0-9.167-1.833-13.5-5.5S337 184 337 178c0-12.667 15.667-32.333 47-59\nH213l-171-1c-8.667-6-13-12.333-13-19 0-4.667 4.333-11.333 13-20h359\nc-16-25.333-24-45-24-59z",
  widehat1: "M529 0h5l519 115c5 1 9 5 9 10 0 1-1 2-1 3l-4 22\nc-1 5-5 9-11 9h-2L532 67 19 159h-2c-5 0-9-4-11-9l-5-22c-1-6 2-12 8-13z",
  widehat2: "M1181 0h2l1171 176c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 220h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",
  widehat3: "M1181 0h2l1171 236c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 280h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",
  widehat4: "M1181 0h2l1171 296c6 0 10 5 10 11l-2 23c-1 6-5 10\n-11 10h-1L1182 67 15 340h-1c-6 0-10-4-11-10l-2-23c-1-6 4-11 10-11z",
  widecheck1: "M529,159h5l519,-115c5,-1,9,-5,9,-10c0,-1,-1,-2,-1,-3l-4,-22c-1,\n-5,-5,-9,-11,-9h-2l-512,92l-513,-92h-2c-5,0,-9,4,-11,9l-5,22c-1,6,2,12,8,13z",
  widecheck2: "M1181,220h2l1171,-176c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,\n-11,-10h-1l-1168,153l-1167,-153h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z",
  widecheck3: "M1181,280h2l1171,-236c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,\n-11,-10h-1l-1168,213l-1167,-213h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z",
  widecheck4: "M1181,340h2l1171,-296c6,0,10,-5,10,-11l-2,-23c-1,-6,-5,-10,\n-11,-10h-1l-1168,273l-1167,-273h-1c-6,0,-10,4,-11,10l-2,23c-1,6,4,11,10,11z",
  baraboveleftarrow: "M400000 620h-399890l3 -3c68.7 -52.7 113.7 -120 135 -202\nc4 -14.7 6 -23 6 -25c0 -7.3 -7 -11 -21 -11c-8 0 -13.2 0.8 -15.5 2.5\nc-2.3 1.7 -4.2 5.8 -5.5 12.5c-1.3 4.7 -2.7 10.3 -4 17c-12 48.7 -34.8 92 -68.5 130\ns-74.2 66.3 -121.5 85c-10 4 -16 7.7 -18 11c0 8.7 6 14.3 18 17c47.3 18.7 87.8 47\n121.5 85s56.5 81.3 68.5 130c0.7 2 1.3 5 2 9s1.2 6.7 1.5 8c0.3 1.3 1 3.3 2 6\ns2.2 4.5 3.5 5.5c1.3 1 3.3 1.8 6 2.5s6 1 10 1c14 0 21 -3.7 21 -11\nc0 -2 -2 -10.3 -6 -25c-20 -79.3 -65 -146.7 -135 -202l-3 -3h399890z\nM100 620v40h399900v-40z M0 241v40h399900v-40zM0 241v40h399900v-40z",
  rightarrowabovebar: "M0 241v40h399891c-47.3 35.3-84 78-110 128-16.7 32\n-27.7 63.7-33 95 0 1.3-.2 2.7-.5 4-.3 1.3-.5 2.3-.5 3 0 7.3 6.7 11 20 11 8 0\n13.2-.8 15.5-2.5 2.3-1.7 4.2-5.5 5.5-11.5 2-13.3 5.7-27 11-41 14.7-44.7 39\n-84.5 73-119.5s73.7-60.2 119-75.5c6-2 9-5.7 9-11s-3-9-9-11c-45.3-15.3-85-40.5\n-119-75.5s-58.3-74.8-73-119.5c-4.7-14-8.3-27.3-11-40-1.3-6.7-3.2-10.8-5.5\n-12.5-2.3-1.7-7.5-2.5-15.5-2.5-14 0-21 3.7-21 11 0 2 2 10.3 6 25 20.7 83.3 67\n151.7 139 205zm96 379h399894v40H0zm0 0h399904v40H0z",
  baraboveshortleftharpoon: "M507,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11\nc1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17\nc2,0.7,5,1,9,1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21\nc-32,-87.3,-82.7,-157.7,-152,-211c0,0,-3,-3,-3,-3l399351,0l0,-40\nc-398570,0,-399437,0,-399437,0z M593 435 v40 H399500 v-40z\nM0 281 v-40 H399908 v40z M0 281 v-40 H399908 v40z",
  rightharpoonaboveshortbar: "M0,241 l0,40c399126,0,399993,0,399993,0\nc4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,\n-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6\nc-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z\nM0 241 v40 H399908 v-40z M0 475 v-40 H399500 v40z M0 475 v-40 H399500 v40z",
  shortbaraboveleftharpoon: "M7,435c-4,4,-6.3,8.7,-7,14c0,5.3,0.7,9,2,11\nc1.3,2,5.3,5.3,12,10c90.7,54,156,130,196,228c3.3,10.7,6.3,16.3,9,17c2,0.7,5,1,9,\n1c0,0,5,0,5,0c10.7,0,16.7,-2,18,-6c2,-2.7,1,-9.7,-3,-21c-32,-87.3,-82.7,-157.7,\n-152,-211c0,0,-3,-3,-3,-3l399907,0l0,-40c-399126,0,-399993,0,-399993,0z\nM93 435 v40 H400000 v-40z M500 241 v40 H400000 v-40z M500 241 v40 H400000 v-40z",
  shortrightharpoonabovebar: "M53,241l0,40c398570,0,399437,0,399437,0\nc4.7,-4.7,7,-9.3,7,-14c0,-9.3,-3.7,-15.3,-11,-18c-92.7,-56.7,-159,-133.7,-199,\n-231c-3.3,-9.3,-6,-14.7,-8,-16c-2,-1.3,-7,-2,-15,-2c-10.7,0,-16.7,2,-18,6\nc-2,2.7,-1,9.7,3,21c15.3,42,36.7,81.8,64,119.5c27.3,37.7,58,69.2,92,94.5z\nM500 241 v40 H399408 v-40z M500 435 v40 H400000 v-40z"
};
var tallDelim = function tallDelim2(v83, v84) {
  switch (v83) {
    case "lbrack":
      return "M403 1759 V84 H666 V0 H319 V1759 v" + v84 + " v1759 v84 h347 v-84\nH403z M403 1759 V0 H319 V1759 v" + v84 + " v1759 v84 h84z";
    case "rbrack":
      return "M347 1759 V0 H0 V84 H263 V1759 v" + v84 + " v1759 H0 v84 H347z\nM347 1759 V0 H263 V1759 v" + v84 + " v1759 h84z";
    case "vert":
      return "M145 15 v585 v" + v84 + " v585 c2.667,10,9.667,15,21,15\nc10,0,16.667,-5,20,-15 v-585 v" + -v84 + " v-585 c-2.667,-10,-9.667,-15,-21,-15\nc-10,0,-16.667,5,-20,15z M188 15 H145 v585 v" + v84 + " v585 h43z";
    case "doublevert":
      return "M145 15 v585 v" + v84 + " v585 c2.667,10,9.667,15,21,15\nc10,0,16.667,-5,20,-15 v-585 v" + -v84 + " v-585 c-2.667,-10,-9.667,-15,-21,-15\nc-10,0,-16.667,5,-20,15z M188 15 H145 v585 v" + v84 + " v585 h43z\nM367 15 v585 v" + v84 + " v585 c2.667,10,9.667,15,21,15\nc10,0,16.667,-5,20,-15 v-585 v" + -v84 + " v-585 c-2.667,-10,-9.667,-15,-21,-15\nc-10,0,-16.667,5,-20,15z M410 15 H367 v585 v" + v84 + " v585 h43z";
    case "lfloor":
      return "M319 602 V0 H403 V602 v" + v84 + " v1715 h263 v84 H319z\nMM319 602 V0 H403 V602 v" + v84 + " v1715 H319z";
    case "rfloor":
      return "M319 602 V0 H403 V602 v" + v84 + " v1799 H0 v-84 H319z\nMM319 602 V0 H403 V602 v" + v84 + " v1715 H319z";
    case "lceil":
      return "M403 1759 V84 H666 V0 H319 V1759 v" + v84 + " v602 h84z\nM403 1759 V0 H319 V1759 v" + v84 + " v602 h84z";
    case "rceil":
      return "M347 1759 V0 H0 V84 H263 V1759 v" + v84 + " v602 h84z\nM347 1759 V0 h-84 V1759 v" + v84 + " v602 h84z";
    case "lparen":
      return "M863,9c0,-2,-2,-5,-6,-9c0,0,-17,0,-17,0c-12.7,0,-19.3,0.3,-20,1\nc-5.3,5.3,-10.3,11,-15,17c-242.7,294.7,-395.3,682,-458,1162c-21.3,163.3,-33.3,349,\n-36,557 l0," + (v84 + 84) + "c0.2,6,0,26,0,60c2,159.3,10,310.7,24,454c53.3,528,210,\n949.7,470,1265c4.7,6,9.7,11.7,15,17c0.7,0.7,7,1,19,1c0,0,18,0,18,0c4,-4,6,-7,6,-9\nc0,-2.7,-3.3,-8.7,-10,-18c-135.3,-192.7,-235.5,-414.3,-300.5,-665c-65,-250.7,-102.5,\n-544.7,-112.5,-882c-2,-104,-3,-167,-3,-189\nl0,-" + (v84 + 92) + "c0,-162.7,5.7,-314,17,-454c20.7,-272,63.7,-513,129,-723c65.3,\n-210,155.3,-396.3,270,-559c6.7,-9.3,10,-15.3,10,-18z";
    case "rparen":
      return "M76,0c-16.7,0,-25,3,-25,9c0,2,2,6.3,6,13c21.3,28.7,42.3,60.3,\n63,95c96.7,156.7,172.8,332.5,228.5,527.5c55.7,195,92.8,416.5,111.5,664.5\nc11.3,139.3,17,290.7,17,454c0,28,1.7,43,3.3,45l0," + (v84 + 9) + "\nc-3,4,-3.3,16.7,-3.3,38c0,162,-5.7,313.7,-17,455c-18.7,248,-55.8,469.3,-111.5,664\nc-55.7,194.7,-131.8,370.3,-228.5,527c-20.7,34.7,-41.7,66.3,-63,95c-2,3.3,-4,7,-6,11\nc0,7.3,5.7,11,17,11c0,0,11,0,11,0c9.3,0,14.3,-0.3,15,-1c5.3,-5.3,10.3,-11,15,-17\nc242.7,-294.7,395.3,-681.7,458,-1161c21.3,-164.7,33.3,-350.7,36,-558\nl0,-" + (v84 + 144) + "c-2,-159.3,-10,-310.7,-24,-454c-53.3,-528,-210,-949.7,\n-470,-1265c-4.7,-6,-9.7,-11.7,-15,-17c-0.7,-0.7,-6.7,-1,-18,-1z";
    default:
      throw new Error("Unknown stretchy delimiter.");
  }
};
function isMathDomNode(v85) {
  return "toText" in v85;
}
class DocumentFragment {
  constructor(v86) {
    this.children = undefined;
    this.classes = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.maxFontSize = undefined;
    this.style = undefined;
    this.children = v86;
    this.classes = [];
    this.height = 0;
    this.depth = 0;
    this.maxFontSize = 0;
    this.style = {};
  }
  hasClass(v87) {
    return this.classes.includes(v87);
  }
  toNode() {
    var v88 = document.createDocumentFragment();
    for (var v89 = 0; v89 < this.children.length; v89++) {
      v88.appendChild(this.children[v89].toNode());
    }
    return v88;
  }
  toMarkup() {
    var v90 = "";
    for (var v91 = 0; v91 < this.children.length; v91++) {
      v90 += this.children[v91].toMarkup();
    }
    return v90;
  }
  toText() {
    return this.children.map(v92 => {
      if (isMathDomNode(v92)) {
        return v92.toText();
      }
      throw new Error("Expected MathDomNode with toText, got " + v92.constructor.name);
    }).join("");
  }
}
var ptPerUnit = {
  pt: 1,
  mm: 7227 / 2540,
  cm: 7227 / 254,
  in: 72.27,
  bp: 803 / 800,
  pc: 12,
  dd: 1238 / 1157,
  cc: 14856 / 1157,
  nd: 685 / 642,
  nc: 1370 / 107,
  sp: 1 / 65536,
  px: 803 / 800
};
var relativeUnit = {
  ex: true,
  em: true,
  mu: true
};
var validUnit = function validUnit2(v93) {
  if (typeof v93 !== "string") {
    v93 = v93.unit;
  }
  return v93 in ptPerUnit || v93 in relativeUnit || v93 === "ex";
};
var calculateSize = function calculateSize2(v94, v95) {
  var v96;
  if (v94.unit in ptPerUnit) {
    v96 = ptPerUnit[v94.unit] / v95.fontMetrics().ptPerEm / v95.sizeMultiplier;
  } else if (v94.unit === "mu") {
    v96 = v95.fontMetrics().cssEmPerMu;
  } else {
    var v97;
    if (v95.style.isTight()) {
      v97 = v95.havingStyle(v95.style.text());
    } else {
      v97 = v95;
    }
    if (v94.unit === "ex") {
      v96 = v97.fontMetrics().xHeight;
    } else if (v94.unit === "em") {
      v96 = v97.fontMetrics().quad;
    } else {
      throw new ParseError("Invalid unit: '" + v94.unit + "'");
    }
    if (v97 !== v95) {
      v96 *= v97.sizeMultiplier / v95.sizeMultiplier;
    }
  }
  return Math.min(v94.number * v96, v95.maxSize);
};
var makeEm = function makeEm2(v98) {
  return +v98.toFixed(4) + "em";
};
var createClass = function createClass2(v99) {
  return v99.filter(v100 => v100).join(" ");
};
var cssStyleToString = function cssStyleToString2(v101) {
  var v102 = "";
  for (var v103 of Object.keys(v101)) {
    var v104 = v101[v103];
    if (v104 !== undefined) {
      v102 += hyphenate(v103) + ":" + v104 + ";";
    }
  }
  return v102;
};
var initNode = function initNode2(v105, v106, v107) {
  this.classes = v105 || [];
  this.attributes = {};
  this.height = 0;
  this.depth = 0;
  this.maxFontSize = 0;
  this.style = v107 || {};
  if (v106) {
    if (v106.style.isTight()) {
      this.classes.push("mtight");
    }
    var v108 = v106.getColor();
    if (v108) {
      this.style.color = v108;
    }
  }
};
var toNode = function toNode2(v109) {
  var v110 = document.createElement(v109);
  v110.className = createClass(this.classes);
  Object.assign(v110.style, this.style);
  for (var v111 of Object.keys(this.attributes)) {
    v110.setAttribute(v111, this.attributes[v111]);
  }
  for (var v112 = 0; v112 < this.children.length; v112++) {
    v110.appendChild(this.children[v112].toNode());
  }
  return v110;
};
var invalidAttributeNameRegex = /[\s"'>/=\x00-\x1f]/;
var toMarkup = function toMarkup2(v113) {
  var v114 = "<" + v113;
  if (this.classes.length) {
    v114 += " class=\"" + escape(createClass(this.classes)) + "\"";
  }
  var v115 = cssStyleToString(this.style);
  if (v115) {
    v114 += " style=\"" + escape(v115) + "\"";
  }
  for (var v116 of Object.keys(this.attributes)) {
    if (invalidAttributeNameRegex.test(v116)) {
      throw new ParseError("Invalid attribute name '" + v116 + "'");
    }
    v114 += " " + v116 + "=\"" + escape(this.attributes[v116]) + "\"";
  }
  v114 += ">";
  for (var v117 = 0; v117 < this.children.length; v117++) {
    v114 += this.children[v117].toMarkup();
  }
  v114 += "</" + v113 + ">";
  return v114;
};
class Span {
  constructor(v118, v119, v120, v121) {
    this.children = undefined;
    this.attributes = undefined;
    this.classes = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.width = undefined;
    this.maxFontSize = undefined;
    this.style = undefined;
    this.italic = undefined;
    initNode.call(this, v118, v120, v121);
    this.children = v119 || [];
  }
  setAttribute(v122, v123) {
    this.attributes[v122] = v123;
  }
  hasClass(v124) {
    return this.classes.includes(v124);
  }
  toNode() {
    return toNode.call(this, "span");
  }
  toMarkup() {
    return toMarkup.call(this, "span");
  }
}
class Anchor {
  constructor(v125, v126, v127, v128) {
    this.children = undefined;
    this.attributes = undefined;
    this.classes = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.maxFontSize = undefined;
    this.style = undefined;
    initNode.call(this, v126, v128);
    this.children = v127 || [];
    this.setAttribute("href", v125);
  }
  setAttribute(v129, v130) {
    this.attributes[v129] = v130;
  }
  hasClass(v131) {
    return this.classes.includes(v131);
  }
  toNode() {
    return toNode.call(this, "a");
  }
  toMarkup() {
    return toMarkup.call(this, "a");
  }
}
class Img {
  constructor(v132, v133, v134) {
    this.src = undefined;
    this.alt = undefined;
    this.classes = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.maxFontSize = undefined;
    this.style = undefined;
    this.alt = v133;
    this.src = v132;
    this.classes = ["mord"];
    this.height = 0;
    this.depth = 0;
    this.maxFontSize = 0;
    this.style = v134;
  }
  hasClass(v135) {
    return this.classes.includes(v135);
  }
  toNode() {
    var v136 = document.createElement("img");
    v136.src = this.src;
    v136.alt = this.alt;
    v136.className = "mord";
    Object.assign(v136.style, this.style);
    return v136;
  }
  toMarkup() {
    var v137 = "<img src=\"" + escape(this.src) + "\"" + (" alt=\"" + escape(this.alt) + "\"");
    var v138 = cssStyleToString(this.style);
    if (v138) {
      v137 += " style=\"" + escape(v138) + "\"";
    }
    v137 += "'/>";
    return v137;
  }
}
var iCombinations = {
  î: "ı̂",
  ï: "ı̈",
  í: "ı́",
  ì: "ı̀"
};
class SymbolNode {
  constructor(v139, v140, v141, v142, v143, v144, v145, v146) {
    this.text = undefined;
    this.height = undefined;
    this.depth = undefined;
    this.italic = undefined;
    this.skew = undefined;
    this.width = undefined;
    this.maxFontSize = undefined;
    this.classes = undefined;
    this.style = undefined;
    this.text = v139;
    this.height = v140 || 0;
    this.depth = v141 || 0;
    this.italic = v142 || 0;
    this.skew = v143 || 0;
    this.width = v144 || 0;
    this.classes = v145 || [];
    this.style = v146 || {};
    this.maxFontSize = 0;
    var v147 = scriptFromCodepoint(this.text.charCodeAt(0));
    if (v147) {
      this.classes.push(v147 + "_fallback");
    }
    if (/[îïíì]/.test(this.text)) {
      this.text = iCombinations[this.text];
    }
  }
  hasClass(v148) {
    return this.classes.includes(v148);
  }
  toNode() {
    var v149 = document.createTextNode(this.text);
    var v150 = null;
    if (this.italic > 0) {
      v150 = document.createElement("span");
      v150.style.marginRight = makeEm(this.italic);
    }
    if (this.classes.length > 0) {
      v150 = v150 || document.createElement("span");
      v150.className = createClass(this.classes);
    }
    if (Object.keys(this.style).length > 0) {
      v150 = v150 || document.createElement("span");
      Object.assign(v150.style, this.style);
    }
    if (v150) {
      v150.appendChild(v149);
      return v150;
    } else {
      return v149;
    }
  }
  toMarkup() {
    var v151 = false;
    var v152 = "<span";
    if (this.classes.length) {
      v151 = true;
      v152 += " class=\"";
      v152 += escape(createClass(this.classes));
      v152 += "\"";
    }
    var v153 = "";
    if (this.italic > 0) {
      v153 += "margin-right:" + makeEm(this.italic) + ";";
    }
    v153 += cssStyleToString(this.style);
    if (v153) {
      v151 = true;
      v152 += " style=\"" + escape(v153) + "\"";
    }
    var v154 = escape(this.text);
    if (v151) {
      v152 += ">";
      v152 += v154;
      v152 += "</span>";
      return v152;
    } else {
      return v154;
    }
  }
}
class SvgNode {
  constructor(v155, v156) {
    this.children = undefined;
    this.attributes = undefined;
    this.children = v155 || [];
    this.attributes = v156 || {};
  }
  toNode() {
    var v157 = "http://www.w3.org/2000/svg";
    var v158 = document.createElementNS(v157, "svg");
    for (var v159 of Object.keys(this.attributes)) {
      v158.setAttribute(v159, this.attributes[v159]);
    }
    for (var v160 = 0; v160 < this.children.length; v160++) {
      v158.appendChild(this.children[v160].toNode());
    }
    return v158;
  }
  toMarkup() {
    var v161 = "<svg xmlns=\"http://www.w3.org/2000/svg\"";
    for (var v162 of Object.keys(this.attributes)) {
      v161 += " " + v162 + "=\"" + escape(this.attributes[v162]) + "\"";
    }
    v161 += ">";
    for (var v163 = 0; v163 < this.children.length; v163++) {
      v161 += this.children[v163].toMarkup();
    }
    v161 += "</svg>";
    return v161;
  }
}
class PathNode {
  constructor(v164, v165) {
    this.pathName = undefined;
    this.alternate = undefined;
    this.pathName = v164;
    this.alternate = v165;
  }
  toNode() {
    var v166 = "http://www.w3.org/2000/svg";
    var v167 = document.createElementNS(v166, "path");
    if (this.alternate) {
      v167.setAttribute("d", this.alternate);
    } else {
      v167.setAttribute("d", path[this.pathName]);
    }
    return v167;
  }
  toMarkup() {
    if (this.alternate) {
      return "<path d=\"" + escape(this.alternate) + "\"/>";
    } else {
      return "<path d=\"" + escape(path[this.pathName]) + "\"/>";
    }
  }
}
class LineNode {
  constructor(v168) {
    this.attributes = undefined;
    this.attributes = v168 || {};
  }
  toNode() {
    var v169 = "http://www.w3.org/2000/svg";
    var v170 = document.createElementNS(v169, "line");
    for (var v171 of Object.keys(this.attributes)) {
      v170.setAttribute(v171, this.attributes[v171]);
    }
    return v170;
  }
  toMarkup() {
    var v172 = "<line";
    for (var v173 of Object.keys(this.attributes)) {
      v172 += " " + v173 + "=\"" + escape(this.attributes[v173]) + "\"";
    }
    v172 += "/>";
    return v172;
  }
}
function assertSymbolDomNode(v174) {
  if (v174 instanceof SymbolNode) {
    return v174;
  } else {
    throw new Error("Expected symbolNode but got " + String(v174) + ".");
  }
}
function assertSpan(v175) {
  if (v175 instanceof Span) {
    return v175;
  } else {
    throw new Error("Expected span<HtmlDomNode> but got " + String(v175) + ".");
  }
}
var hasHtmlDomChildren = v176 => v176 instanceof Span || v176 instanceof Anchor || v176 instanceof DocumentFragment;
var fontMetricsData = {
  "AMS-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "65": [0, 0.68889, 0, 0, 0.72222],
    "66": [0, 0.68889, 0, 0, 0.66667],
    "67": [0, 0.68889, 0, 0, 0.72222],
    "68": [0, 0.68889, 0, 0, 0.72222],
    "69": [0, 0.68889, 0, 0, 0.66667],
    "70": [0, 0.68889, 0, 0, 0.61111],
    "71": [0, 0.68889, 0, 0, 0.77778],
    "72": [0, 0.68889, 0, 0, 0.77778],
    "73": [0, 0.68889, 0, 0, 0.38889],
    "74": [0.16667, 0.68889, 0, 0, 0.5],
    "75": [0, 0.68889, 0, 0, 0.77778],
    "76": [0, 0.68889, 0, 0, 0.66667],
    "77": [0, 0.68889, 0, 0, 0.94445],
    "78": [0, 0.68889, 0, 0, 0.72222],
    "79": [0.16667, 0.68889, 0, 0, 0.77778],
    "80": [0, 0.68889, 0, 0, 0.61111],
    "81": [0.16667, 0.68889, 0, 0, 0.77778],
    "82": [0, 0.68889, 0, 0, 0.72222],
    "83": [0, 0.68889, 0, 0, 0.55556],
    "84": [0, 0.68889, 0, 0, 0.66667],
    "85": [0, 0.68889, 0, 0, 0.72222],
    "86": [0, 0.68889, 0, 0, 0.72222],
    "87": [0, 0.68889, 0, 0, 1],
    "88": [0, 0.68889, 0, 0, 0.72222],
    "89": [0, 0.68889, 0, 0, 0.72222],
    "90": [0, 0.68889, 0, 0, 0.66667],
    "107": [0, 0.68889, 0, 0, 0.55556],
    "160": [0, 0, 0, 0, 0.25],
    "165": [0, 0.675, 0.025, 0, 0.75],
    "174": [0.15559, 0.69224, 0, 0, 0.94666],
    "240": [0, 0.68889, 0, 0, 0.55556],
    "295": [0, 0.68889, 0, 0, 0.54028],
    "710": [0, 0.825, 0, 0, 2.33334],
    "732": [0, 0.9, 0, 0, 2.33334],
    "770": [0, 0.825, 0, 0, 2.33334],
    "771": [0, 0.9, 0, 0, 2.33334],
    "989": [0.08167, 0.58167, 0, 0, 0.77778],
    "1008": [0, 0.43056, 0.04028, 0, 0.66667],
    "8245": [0, 0.54986, 0, 0, 0.275],
    "8463": [0, 0.68889, 0, 0, 0.54028],
    "8487": [0, 0.68889, 0, 0, 0.72222],
    "8498": [0, 0.68889, 0, 0, 0.55556],
    "8502": [0, 0.68889, 0, 0, 0.66667],
    "8503": [0, 0.68889, 0, 0, 0.44445],
    "8504": [0, 0.68889, 0, 0, 0.66667],
    "8513": [0, 0.68889, 0, 0, 0.63889],
    "8592": [-0.03598, 0.46402, 0, 0, 0.5],
    "8594": [-0.03598, 0.46402, 0, 0, 0.5],
    "8602": [-0.13313, 0.36687, 0, 0, 1],
    "8603": [-0.13313, 0.36687, 0, 0, 1],
    "8606": [0.01354, 0.52239, 0, 0, 1],
    "8608": [0.01354, 0.52239, 0, 0, 1],
    "8610": [0.01354, 0.52239, 0, 0, 1.11111],
    "8611": [0.01354, 0.52239, 0, 0, 1.11111],
    "8619": [0, 0.54986, 0, 0, 1],
    "8620": [0, 0.54986, 0, 0, 1],
    "8621": [-0.13313, 0.37788, 0, 0, 1.38889],
    "8622": [-0.13313, 0.36687, 0, 0, 1],
    "8624": [0, 0.69224, 0, 0, 0.5],
    "8625": [0, 0.69224, 0, 0, 0.5],
    "8630": [0, 0.43056, 0, 0, 1],
    "8631": [0, 0.43056, 0, 0, 1],
    "8634": [0.08198, 0.58198, 0, 0, 0.77778],
    "8635": [0.08198, 0.58198, 0, 0, 0.77778],
    "8638": [0.19444, 0.69224, 0, 0, 0.41667],
    "8639": [0.19444, 0.69224, 0, 0, 0.41667],
    "8642": [0.19444, 0.69224, 0, 0, 0.41667],
    "8643": [0.19444, 0.69224, 0, 0, 0.41667],
    "8644": [0.1808, 0.675, 0, 0, 1],
    "8646": [0.1808, 0.675, 0, 0, 1],
    "8647": [0.1808, 0.675, 0, 0, 1],
    "8648": [0.19444, 0.69224, 0, 0, 0.83334],
    "8649": [0.1808, 0.675, 0, 0, 1],
    "8650": [0.19444, 0.69224, 0, 0, 0.83334],
    "8651": [0.01354, 0.52239, 0, 0, 1],
    "8652": [0.01354, 0.52239, 0, 0, 1],
    "8653": [-0.13313, 0.36687, 0, 0, 1],
    "8654": [-0.13313, 0.36687, 0, 0, 1],
    "8655": [-0.13313, 0.36687, 0, 0, 1],
    "8666": [0.13667, 0.63667, 0, 0, 1],
    "8667": [0.13667, 0.63667, 0, 0, 1],
    "8669": [-0.13313, 0.37788, 0, 0, 1],
    "8672": [-0.064, 0.437, 0, 0, 1.334],
    "8674": [-0.064, 0.437, 0, 0, 1.334],
    "8705": [0, 0.825, 0, 0, 0.5],
    "8708": [0, 0.68889, 0, 0, 0.55556],
    "8709": [0.08167, 0.58167, 0, 0, 0.77778],
    "8717": [0, 0.43056, 0, 0, 0.42917],
    "8722": [-0.03598, 0.46402, 0, 0, 0.5],
    "8724": [0.08198, 0.69224, 0, 0, 0.77778],
    "8726": [0.08167, 0.58167, 0, 0, 0.77778],
    "8733": [0, 0.69224, 0, 0, 0.77778],
    "8736": [0, 0.69224, 0, 0, 0.72222],
    "8737": [0, 0.69224, 0, 0, 0.72222],
    "8738": [0.03517, 0.52239, 0, 0, 0.72222],
    "8739": [0.08167, 0.58167, 0, 0, 0.22222],
    "8740": [0.25142, 0.74111, 0, 0, 0.27778],
    "8741": [0.08167, 0.58167, 0, 0, 0.38889],
    "8742": [0.25142, 0.74111, 0, 0, 0.5],
    "8756": [0, 0.69224, 0, 0, 0.66667],
    "8757": [0, 0.69224, 0, 0, 0.66667],
    "8764": [-0.13313, 0.36687, 0, 0, 0.77778],
    "8765": [-0.13313, 0.37788, 0, 0, 0.77778],
    "8769": [-0.13313, 0.36687, 0, 0, 0.77778],
    "8770": [-0.03625, 0.46375, 0, 0, 0.77778],
    "8774": [0.30274, 0.79383, 0, 0, 0.77778],
    "8776": [-0.01688, 0.48312, 0, 0, 0.77778],
    "8778": [0.08167, 0.58167, 0, 0, 0.77778],
    "8782": [0.06062, 0.54986, 0, 0, 0.77778],
    "8783": [0.06062, 0.54986, 0, 0, 0.77778],
    "8785": [0.08198, 0.58198, 0, 0, 0.77778],
    "8786": [0.08198, 0.58198, 0, 0, 0.77778],
    "8787": [0.08198, 0.58198, 0, 0, 0.77778],
    "8790": [0, 0.69224, 0, 0, 0.77778],
    "8791": [0.22958, 0.72958, 0, 0, 0.77778],
    "8796": [0.08198, 0.91667, 0, 0, 0.77778],
    "8806": [0.25583, 0.75583, 0, 0, 0.77778],
    "8807": [0.25583, 0.75583, 0, 0, 0.77778],
    "8808": [0.25142, 0.75726, 0, 0, 0.77778],
    "8809": [0.25142, 0.75726, 0, 0, 0.77778],
    "8812": [0.25583, 0.75583, 0, 0, 0.5],
    "8814": [0.20576, 0.70576, 0, 0, 0.77778],
    "8815": [0.20576, 0.70576, 0, 0, 0.77778],
    "8816": [0.30274, 0.79383, 0, 0, 0.77778],
    "8817": [0.30274, 0.79383, 0, 0, 0.77778],
    "8818": [0.22958, 0.72958, 0, 0, 0.77778],
    "8819": [0.22958, 0.72958, 0, 0, 0.77778],
    "8822": [0.1808, 0.675, 0, 0, 0.77778],
    "8823": [0.1808, 0.675, 0, 0, 0.77778],
    "8828": [0.13667, 0.63667, 0, 0, 0.77778],
    "8829": [0.13667, 0.63667, 0, 0, 0.77778],
    "8830": [0.22958, 0.72958, 0, 0, 0.77778],
    "8831": [0.22958, 0.72958, 0, 0, 0.77778],
    "8832": [0.20576, 0.70576, 0, 0, 0.77778],
    "8833": [0.20576, 0.70576, 0, 0, 0.77778],
    "8840": [0.30274, 0.79383, 0, 0, 0.77778],
    "8841": [0.30274, 0.79383, 0, 0, 0.77778],
    "8842": [0.13597, 0.63597, 0, 0, 0.77778],
    "8843": [0.13597, 0.63597, 0, 0, 0.77778],
    "8847": [0.03517, 0.54986, 0, 0, 0.77778],
    "8848": [0.03517, 0.54986, 0, 0, 0.77778],
    "8858": [0.08198, 0.58198, 0, 0, 0.77778],
    "8859": [0.08198, 0.58198, 0, 0, 0.77778],
    "8861": [0.08198, 0.58198, 0, 0, 0.77778],
    "8862": [0, 0.675, 0, 0, 0.77778],
    "8863": [0, 0.675, 0, 0, 0.77778],
    "8864": [0, 0.675, 0, 0, 0.77778],
    "8865": [0, 0.675, 0, 0, 0.77778],
    "8872": [0, 0.69224, 0, 0, 0.61111],
    "8873": [0, 0.69224, 0, 0, 0.72222],
    "8874": [0, 0.69224, 0, 0, 0.88889],
    "8876": [0, 0.68889, 0, 0, 0.61111],
    "8877": [0, 0.68889, 0, 0, 0.61111],
    "8878": [0, 0.68889, 0, 0, 0.72222],
    "8879": [0, 0.68889, 0, 0, 0.72222],
    "8882": [0.03517, 0.54986, 0, 0, 0.77778],
    "8883": [0.03517, 0.54986, 0, 0, 0.77778],
    "8884": [0.13667, 0.63667, 0, 0, 0.77778],
    "8885": [0.13667, 0.63667, 0, 0, 0.77778],
    "8888": [0, 0.54986, 0, 0, 1.11111],
    "8890": [0.19444, 0.43056, 0, 0, 0.55556],
    "8891": [0.19444, 0.69224, 0, 0, 0.61111],
    "8892": [0.19444, 0.69224, 0, 0, 0.61111],
    "8901": [0, 0.54986, 0, 0, 0.27778],
    "8903": [0.08167, 0.58167, 0, 0, 0.77778],
    "8905": [0.08167, 0.58167, 0, 0, 0.77778],
    "8906": [0.08167, 0.58167, 0, 0, 0.77778],
    "8907": [0, 0.69224, 0, 0, 0.77778],
    "8908": [0, 0.69224, 0, 0, 0.77778],
    "8909": [-0.03598, 0.46402, 0, 0, 0.77778],
    "8910": [0, 0.54986, 0, 0, 0.76042],
    "8911": [0, 0.54986, 0, 0, 0.76042],
    "8912": [0.03517, 0.54986, 0, 0, 0.77778],
    "8913": [0.03517, 0.54986, 0, 0, 0.77778],
    "8914": [0, 0.54986, 0, 0, 0.66667],
    "8915": [0, 0.54986, 0, 0, 0.66667],
    "8916": [0, 0.69224, 0, 0, 0.66667],
    "8918": [0.0391, 0.5391, 0, 0, 0.77778],
    "8919": [0.0391, 0.5391, 0, 0, 0.77778],
    "8920": [0.03517, 0.54986, 0, 0, 1.33334],
    "8921": [0.03517, 0.54986, 0, 0, 1.33334],
    "8922": [0.38569, 0.88569, 0, 0, 0.77778],
    "8923": [0.38569, 0.88569, 0, 0, 0.77778],
    "8926": [0.13667, 0.63667, 0, 0, 0.77778],
    "8927": [0.13667, 0.63667, 0, 0, 0.77778],
    "8928": [0.30274, 0.79383, 0, 0, 0.77778],
    "8929": [0.30274, 0.79383, 0, 0, 0.77778],
    "8934": [0.23222, 0.74111, 0, 0, 0.77778],
    "8935": [0.23222, 0.74111, 0, 0, 0.77778],
    "8936": [0.23222, 0.74111, 0, 0, 0.77778],
    "8937": [0.23222, 0.74111, 0, 0, 0.77778],
    "8938": [0.20576, 0.70576, 0, 0, 0.77778],
    "8939": [0.20576, 0.70576, 0, 0, 0.77778],
    "8940": [0.30274, 0.79383, 0, 0, 0.77778],
    "8941": [0.30274, 0.79383, 0, 0, 0.77778],
    "8994": [0.19444, 0.69224, 0, 0, 0.77778],
    "8995": [0.19444, 0.69224, 0, 0, 0.77778],
    "9416": [0.15559, 0.69224, 0, 0, 0.90222],
    "9484": [0, 0.69224, 0, 0, 0.5],
    "9488": [0, 0.69224, 0, 0, 0.5],
    "9492": [0, 0.37788, 0, 0, 0.5],
    "9496": [0, 0.37788, 0, 0, 0.5],
    "9585": [0.19444, 0.68889, 0, 0, 0.88889],
    "9586": [0.19444, 0.74111, 0, 0, 0.88889],
    "9632": [0, 0.675, 0, 0, 0.77778],
    "9633": [0, 0.675, 0, 0, 0.77778],
    "9650": [0, 0.54986, 0, 0, 0.72222],
    "9651": [0, 0.54986, 0, 0, 0.72222],
    "9654": [0.03517, 0.54986, 0, 0, 0.77778],
    "9660": [0, 0.54986, 0, 0, 0.72222],
    "9661": [0, 0.54986, 0, 0, 0.72222],
    "9664": [0.03517, 0.54986, 0, 0, 0.77778],
    "9674": [0.11111, 0.69224, 0, 0, 0.66667],
    "9733": [0.19444, 0.69224, 0, 0, 0.94445],
    "10003": [0, 0.69224, 0, 0, 0.83334],
    "10016": [0, 0.69224, 0, 0, 0.83334],
    "10731": [0.11111, 0.69224, 0, 0, 0.66667],
    "10846": [0.19444, 0.75583, 0, 0, 0.61111],
    "10877": [0.13667, 0.63667, 0, 0, 0.77778],
    "10878": [0.13667, 0.63667, 0, 0, 0.77778],
    "10885": [0.25583, 0.75583, 0, 0, 0.77778],
    "10886": [0.25583, 0.75583, 0, 0, 0.77778],
    "10887": [0.13597, 0.63597, 0, 0, 0.77778],
    "10888": [0.13597, 0.63597, 0, 0, 0.77778],
    "10889": [0.26167, 0.75726, 0, 0, 0.77778],
    "10890": [0.26167, 0.75726, 0, 0, 0.77778],
    "10891": [0.48256, 0.98256, 0, 0, 0.77778],
    "10892": [0.48256, 0.98256, 0, 0, 0.77778],
    "10901": [0.13667, 0.63667, 0, 0, 0.77778],
    "10902": [0.13667, 0.63667, 0, 0, 0.77778],
    "10933": [0.25142, 0.75726, 0, 0, 0.77778],
    "10934": [0.25142, 0.75726, 0, 0, 0.77778],
    "10935": [0.26167, 0.75726, 0, 0, 0.77778],
    "10936": [0.26167, 0.75726, 0, 0, 0.77778],
    "10937": [0.26167, 0.75726, 0, 0, 0.77778],
    "10938": [0.26167, 0.75726, 0, 0, 0.77778],
    "10949": [0.25583, 0.75583, 0, 0, 0.77778],
    "10950": [0.25583, 0.75583, 0, 0, 0.77778],
    "10955": [0.28481, 0.79383, 0, 0, 0.77778],
    "10956": [0.28481, 0.79383, 0, 0, 0.77778],
    "57350": [0.08167, 0.58167, 0, 0, 0.22222],
    "57351": [0.08167, 0.58167, 0, 0, 0.38889],
    "57352": [0.08167, 0.58167, 0, 0, 0.77778],
    "57353": [0, 0.43056, 0.04028, 0, 0.66667],
    "57356": [0.25142, 0.75726, 0, 0, 0.77778],
    "57357": [0.25142, 0.75726, 0, 0, 0.77778],
    "57358": [0.41951, 0.91951, 0, 0, 0.77778],
    "57359": [0.30274, 0.79383, 0, 0, 0.77778],
    "57360": [0.30274, 0.79383, 0, 0, 0.77778],
    "57361": [0.41951, 0.91951, 0, 0, 0.77778],
    "57366": [0.25142, 0.75726, 0, 0, 0.77778],
    "57367": [0.25142, 0.75726, 0, 0, 0.77778],
    "57368": [0.25142, 0.75726, 0, 0, 0.77778],
    "57369": [0.25142, 0.75726, 0, 0, 0.77778],
    "57370": [0.13597, 0.63597, 0, 0, 0.77778],
    "57371": [0.13597, 0.63597, 0, 0, 0.77778]
  },
  "Caligraphic-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "65": [0, 0.68333, 0, 0.19445, 0.79847],
    "66": [0, 0.68333, 0.03041, 0.13889, 0.65681],
    "67": [0, 0.68333, 0.05834, 0.13889, 0.52653],
    "68": [0, 0.68333, 0.02778, 0.08334, 0.77139],
    "69": [0, 0.68333, 0.08944, 0.11111, 0.52778],
    "70": [0, 0.68333, 0.09931, 0.11111, 0.71875],
    "71": [0.09722, 0.68333, 0.0593, 0.11111, 0.59487],
    "72": [0, 0.68333, 0.00965, 0.11111, 0.84452],
    "73": [0, 0.68333, 0.07382, 0, 0.54452],
    "74": [0.09722, 0.68333, 0.18472, 0.16667, 0.67778],
    "75": [0, 0.68333, 0.01445, 0.05556, 0.76195],
    "76": [0, 0.68333, 0, 0.13889, 0.68972],
    "77": [0, 0.68333, 0, 0.13889, 1.2009],
    "78": [0, 0.68333, 0.14736, 0.08334, 0.82049],
    "79": [0, 0.68333, 0.02778, 0.11111, 0.79611],
    "80": [0, 0.68333, 0.08222, 0.08334, 0.69556],
    "81": [0.09722, 0.68333, 0, 0.11111, 0.81667],
    "82": [0, 0.68333, 0, 0.08334, 0.8475],
    "83": [0, 0.68333, 0.075, 0.13889, 0.60556],
    "84": [0, 0.68333, 0.25417, 0, 0.54464],
    "85": [0, 0.68333, 0.09931, 0.08334, 0.62583],
    "86": [0, 0.68333, 0.08222, 0, 0.61278],
    "87": [0, 0.68333, 0.08222, 0.08334, 0.98778],
    "88": [0, 0.68333, 0.14643, 0.13889, 0.7133],
    "89": [0.09722, 0.68333, 0.08222, 0.08334, 0.66834],
    "90": [0, 0.68333, 0.07944, 0.13889, 0.72473],
    "160": [0, 0, 0, 0, 0.25]
  },
  "Fraktur-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69141, 0, 0, 0.29574],
    "34": [0, 0.69141, 0, 0, 0.21471],
    "38": [0, 0.69141, 0, 0, 0.73786],
    "39": [0, 0.69141, 0, 0, 0.21201],
    "40": [0.24982, 0.74947, 0, 0, 0.38865],
    "41": [0.24982, 0.74947, 0, 0, 0.38865],
    "42": [0, 0.62119, 0, 0, 0.27764],
    "43": [0.08319, 0.58283, 0, 0, 0.75623],
    "44": [0, 0.10803, 0, 0, 0.27764],
    "45": [0.08319, 0.58283, 0, 0, 0.75623],
    "46": [0, 0.10803, 0, 0, 0.27764],
    "47": [0.24982, 0.74947, 0, 0, 0.50181],
    "48": [0, 0.47534, 0, 0, 0.50181],
    "49": [0, 0.47534, 0, 0, 0.50181],
    "50": [0, 0.47534, 0, 0, 0.50181],
    "51": [0.18906, 0.47534, 0, 0, 0.50181],
    "52": [0.18906, 0.47534, 0, 0, 0.50181],
    "53": [0.18906, 0.47534, 0, 0, 0.50181],
    "54": [0, 0.69141, 0, 0, 0.50181],
    "55": [0.18906, 0.47534, 0, 0, 0.50181],
    "56": [0, 0.69141, 0, 0, 0.50181],
    "57": [0.18906, 0.47534, 0, 0, 0.50181],
    "58": [0, 0.47534, 0, 0, 0.21606],
    "59": [0.12604, 0.47534, 0, 0, 0.21606],
    "61": [-0.13099, 0.36866, 0, 0, 0.75623],
    "63": [0, 0.69141, 0, 0, 0.36245],
    "65": [0, 0.69141, 0, 0, 0.7176],
    "66": [0, 0.69141, 0, 0, 0.88397],
    "67": [0, 0.69141, 0, 0, 0.61254],
    "68": [0, 0.69141, 0, 0, 0.83158],
    "69": [0, 0.69141, 0, 0, 0.66278],
    "70": [0.12604, 0.69141, 0, 0, 0.61119],
    "71": [0, 0.69141, 0, 0, 0.78539],
    "72": [0.06302, 0.69141, 0, 0, 0.7203],
    "73": [0, 0.69141, 0, 0, 0.55448],
    "74": [0.12604, 0.69141, 0, 0, 0.55231],
    "75": [0, 0.69141, 0, 0, 0.66845],
    "76": [0, 0.69141, 0, 0, 0.66602],
    "77": [0, 0.69141, 0, 0, 1.04953],
    "78": [0, 0.69141, 0, 0, 0.83212],
    "79": [0, 0.69141, 0, 0, 0.82699],
    "80": [0.18906, 0.69141, 0, 0, 0.82753],
    "81": [0.03781, 0.69141, 0, 0, 0.82699],
    "82": [0, 0.69141, 0, 0, 0.82807],
    "83": [0, 0.69141, 0, 0, 0.82861],
    "84": [0, 0.69141, 0, 0, 0.66899],
    "85": [0, 0.69141, 0, 0, 0.64576],
    "86": [0, 0.69141, 0, 0, 0.83131],
    "87": [0, 0.69141, 0, 0, 1.04602],
    "88": [0, 0.69141, 0, 0, 0.71922],
    "89": [0.18906, 0.69141, 0, 0, 0.83293],
    "90": [0.12604, 0.69141, 0, 0, 0.60201],
    "91": [0.24982, 0.74947, 0, 0, 0.27764],
    "93": [0.24982, 0.74947, 0, 0, 0.27764],
    "94": [0, 0.69141, 0, 0, 0.49965],
    "97": [0, 0.47534, 0, 0, 0.50046],
    "98": [0, 0.69141, 0, 0, 0.51315],
    "99": [0, 0.47534, 0, 0, 0.38946],
    "100": [0, 0.62119, 0, 0, 0.49857],
    "101": [0, 0.47534, 0, 0, 0.40053],
    "102": [0.18906, 0.69141, 0, 0, 0.32626],
    "103": [0.18906, 0.47534, 0, 0, 0.5037],
    "104": [0.18906, 0.69141, 0, 0, 0.52126],
    "105": [0, 0.69141, 0, 0, 0.27899],
    "106": [0, 0.69141, 0, 0, 0.28088],
    "107": [0, 0.69141, 0, 0, 0.38946],
    "108": [0, 0.69141, 0, 0, 0.27953],
    "109": [0, 0.47534, 0, 0, 0.76676],
    "110": [0, 0.47534, 0, 0, 0.52666],
    "111": [0, 0.47534, 0, 0, 0.48885],
    "112": [0.18906, 0.52396, 0, 0, 0.50046],
    "113": [0.18906, 0.47534, 0, 0, 0.48912],
    "114": [0, 0.47534, 0, 0, 0.38919],
    "115": [0, 0.47534, 0, 0, 0.44266],
    "116": [0, 0.62119, 0, 0, 0.33301],
    "117": [0, 0.47534, 0, 0, 0.5172],
    "118": [0, 0.52396, 0, 0, 0.5118],
    "119": [0, 0.52396, 0, 0, 0.77351],
    "120": [0.18906, 0.47534, 0, 0, 0.38865],
    "121": [0.18906, 0.47534, 0, 0, 0.49884],
    "122": [0.18906, 0.47534, 0, 0, 0.39054],
    "160": [0, 0, 0, 0, 0.25],
    "8216": [0, 0.69141, 0, 0, 0.21471],
    "8217": [0, 0.69141, 0, 0, 0.21471],
    "58112": [0, 0.62119, 0, 0, 0.49749],
    "58113": [0, 0.62119, 0, 0, 0.4983],
    "58114": [0.18906, 0.69141, 0, 0, 0.33328],
    "58115": [0.18906, 0.69141, 0, 0, 0.32923],
    "58116": [0.18906, 0.47534, 0, 0, 0.50343],
    "58117": [0, 0.69141, 0, 0, 0.33301],
    "58118": [0, 0.62119, 0, 0, 0.33409],
    "58119": [0, 0.47534, 0, 0, 0.50073]
  },
  "Main-Bold": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69444, 0, 0, 0.35],
    "34": [0, 0.69444, 0, 0, 0.60278],
    "35": [0.19444, 0.69444, 0, 0, 0.95833],
    "36": [0.05556, 0.75, 0, 0, 0.575],
    "37": [0.05556, 0.75, 0, 0, 0.95833],
    "38": [0, 0.69444, 0, 0, 0.89444],
    "39": [0, 0.69444, 0, 0, 0.31944],
    "40": [0.25, 0.75, 0, 0, 0.44722],
    "41": [0.25, 0.75, 0, 0, 0.44722],
    "42": [0, 0.75, 0, 0, 0.575],
    "43": [0.13333, 0.63333, 0, 0, 0.89444],
    "44": [0.19444, 0.15556, 0, 0, 0.31944],
    "45": [0, 0.44444, 0, 0, 0.38333],
    "46": [0, 0.15556, 0, 0, 0.31944],
    "47": [0.25, 0.75, 0, 0, 0.575],
    "48": [0, 0.64444, 0, 0, 0.575],
    "49": [0, 0.64444, 0, 0, 0.575],
    "50": [0, 0.64444, 0, 0, 0.575],
    "51": [0, 0.64444, 0, 0, 0.575],
    "52": [0, 0.64444, 0, 0, 0.575],
    "53": [0, 0.64444, 0, 0, 0.575],
    "54": [0, 0.64444, 0, 0, 0.575],
    "55": [0, 0.64444, 0, 0, 0.575],
    "56": [0, 0.64444, 0, 0, 0.575],
    "57": [0, 0.64444, 0, 0, 0.575],
    "58": [0, 0.44444, 0, 0, 0.31944],
    "59": [0.19444, 0.44444, 0, 0, 0.31944],
    "60": [0.08556, 0.58556, 0, 0, 0.89444],
    "61": [-0.10889, 0.39111, 0, 0, 0.89444],
    "62": [0.08556, 0.58556, 0, 0, 0.89444],
    "63": [0, 0.69444, 0, 0, 0.54305],
    "64": [0, 0.69444, 0, 0, 0.89444],
    "65": [0, 0.68611, 0, 0, 0.86944],
    "66": [0, 0.68611, 0, 0, 0.81805],
    "67": [0, 0.68611, 0, 0, 0.83055],
    "68": [0, 0.68611, 0, 0, 0.88194],
    "69": [0, 0.68611, 0, 0, 0.75555],
    "70": [0, 0.68611, 0, 0, 0.72361],
    "71": [0, 0.68611, 0, 0, 0.90416],
    "72": [0, 0.68611, 0, 0, 0.9],
    "73": [0, 0.68611, 0, 0, 0.43611],
    "74": [0, 0.68611, 0, 0, 0.59444],
    "75": [0, 0.68611, 0, 0, 0.90138],
    "76": [0, 0.68611, 0, 0, 0.69166],
    "77": [0, 0.68611, 0, 0, 1.09166],
    "78": [0, 0.68611, 0, 0, 0.9],
    "79": [0, 0.68611, 0, 0, 0.86388],
    "80": [0, 0.68611, 0, 0, 0.78611],
    "81": [0.19444, 0.68611, 0, 0, 0.86388],
    "82": [0, 0.68611, 0, 0, 0.8625],
    "83": [0, 0.68611, 0, 0, 0.63889],
    "84": [0, 0.68611, 0, 0, 0.8],
    "85": [0, 0.68611, 0, 0, 0.88472],
    "86": [0, 0.68611, 0.01597, 0, 0.86944],
    "87": [0, 0.68611, 0.01597, 0, 1.18888],
    "88": [0, 0.68611, 0, 0, 0.86944],
    "89": [0, 0.68611, 0.02875, 0, 0.86944],
    "90": [0, 0.68611, 0, 0, 0.70277],
    "91": [0.25, 0.75, 0, 0, 0.31944],
    "92": [0.25, 0.75, 0, 0, 0.575],
    "93": [0.25, 0.75, 0, 0, 0.31944],
    "94": [0, 0.69444, 0, 0, 0.575],
    "95": [0.31, 0.13444, 0.03194, 0, 0.575],
    "97": [0, 0.44444, 0, 0, 0.55902],
    "98": [0, 0.69444, 0, 0, 0.63889],
    "99": [0, 0.44444, 0, 0, 0.51111],
    "100": [0, 0.69444, 0, 0, 0.63889],
    "101": [0, 0.44444, 0, 0, 0.52708],
    "102": [0, 0.69444, 0.10903, 0, 0.35139],
    "103": [0.19444, 0.44444, 0.01597, 0, 0.575],
    "104": [0, 0.69444, 0, 0, 0.63889],
    "105": [0, 0.69444, 0, 0, 0.31944],
    "106": [0.19444, 0.69444, 0, 0, 0.35139],
    "107": [0, 0.69444, 0, 0, 0.60694],
    "108": [0, 0.69444, 0, 0, 0.31944],
    "109": [0, 0.44444, 0, 0, 0.95833],
    "110": [0, 0.44444, 0, 0, 0.63889],
    "111": [0, 0.44444, 0, 0, 0.575],
    "112": [0.19444, 0.44444, 0, 0, 0.63889],
    "113": [0.19444, 0.44444, 0, 0, 0.60694],
    "114": [0, 0.44444, 0, 0, 0.47361],
    "115": [0, 0.44444, 0, 0, 0.45361],
    "116": [0, 0.63492, 0, 0, 0.44722],
    "117": [0, 0.44444, 0, 0, 0.63889],
    "118": [0, 0.44444, 0.01597, 0, 0.60694],
    "119": [0, 0.44444, 0.01597, 0, 0.83055],
    "120": [0, 0.44444, 0, 0, 0.60694],
    "121": [0.19444, 0.44444, 0.01597, 0, 0.60694],
    "122": [0, 0.44444, 0, 0, 0.51111],
    "123": [0.25, 0.75, 0, 0, 0.575],
    "124": [0.25, 0.75, 0, 0, 0.31944],
    "125": [0.25, 0.75, 0, 0, 0.575],
    "126": [0.35, 0.34444, 0, 0, 0.575],
    "160": [0, 0, 0, 0, 0.25],
    "163": [0, 0.69444, 0, 0, 0.86853],
    "168": [0, 0.69444, 0, 0, 0.575],
    "172": [0, 0.44444, 0, 0, 0.76666],
    "176": [0, 0.69444, 0, 0, 0.86944],
    "177": [0.13333, 0.63333, 0, 0, 0.89444],
    "184": [0.17014, 0, 0, 0, 0.51111],
    "198": [0, 0.68611, 0, 0, 1.04166],
    "215": [0.13333, 0.63333, 0, 0, 0.89444],
    "216": [0.04861, 0.73472, 0, 0, 0.89444],
    "223": [0, 0.69444, 0, 0, 0.59722],
    "230": [0, 0.44444, 0, 0, 0.83055],
    "247": [0.13333, 0.63333, 0, 0, 0.89444],
    "248": [0.09722, 0.54167, 0, 0, 0.575],
    "305": [0, 0.44444, 0, 0, 0.31944],
    "338": [0, 0.68611, 0, 0, 1.16944],
    "339": [0, 0.44444, 0, 0, 0.89444],
    "567": [0.19444, 0.44444, 0, 0, 0.35139],
    "710": [0, 0.69444, 0, 0, 0.575],
    "711": [0, 0.63194, 0, 0, 0.575],
    "713": [0, 0.59611, 0, 0, 0.575],
    "714": [0, 0.69444, 0, 0, 0.575],
    "715": [0, 0.69444, 0, 0, 0.575],
    "728": [0, 0.69444, 0, 0, 0.575],
    "729": [0, 0.69444, 0, 0, 0.31944],
    "730": [0, 0.69444, 0, 0, 0.86944],
    "732": [0, 0.69444, 0, 0, 0.575],
    "733": [0, 0.69444, 0, 0, 0.575],
    "915": [0, 0.68611, 0, 0, 0.69166],
    "916": [0, 0.68611, 0, 0, 0.95833],
    "920": [0, 0.68611, 0, 0, 0.89444],
    "923": [0, 0.68611, 0, 0, 0.80555],
    "926": [0, 0.68611, 0, 0, 0.76666],
    "928": [0, 0.68611, 0, 0, 0.9],
    "931": [0, 0.68611, 0, 0, 0.83055],
    "933": [0, 0.68611, 0, 0, 0.89444],
    "934": [0, 0.68611, 0, 0, 0.83055],
    "936": [0, 0.68611, 0, 0, 0.89444],
    "937": [0, 0.68611, 0, 0, 0.83055],
    "8211": [0, 0.44444, 0.03194, 0, 0.575],
    "8212": [0, 0.44444, 0.03194, 0, 1.14999],
    "8216": [0, 0.69444, 0, 0, 0.31944],
    "8217": [0, 0.69444, 0, 0, 0.31944],
    "8220": [0, 0.69444, 0, 0, 0.60278],
    "8221": [0, 0.69444, 0, 0, 0.60278],
    "8224": [0.19444, 0.69444, 0, 0, 0.51111],
    "8225": [0.19444, 0.69444, 0, 0, 0.51111],
    "8242": [0, 0.55556, 0, 0, 0.34444],
    "8407": [0, 0.72444, 0.15486, 0, 0.575],
    "8463": [0, 0.69444, 0, 0, 0.66759],
    "8465": [0, 0.69444, 0, 0, 0.83055],
    "8467": [0, 0.69444, 0, 0, 0.47361],
    "8472": [0.19444, 0.44444, 0, 0, 0.74027],
    "8476": [0, 0.69444, 0, 0, 0.83055],
    "8501": [0, 0.69444, 0, 0, 0.70277],
    "8592": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8593": [0.19444, 0.69444, 0, 0, 0.575],
    "8594": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8595": [0.19444, 0.69444, 0, 0, 0.575],
    "8596": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8597": [0.25, 0.75, 0, 0, 0.575],
    "8598": [0.19444, 0.69444, 0, 0, 1.14999],
    "8599": [0.19444, 0.69444, 0, 0, 1.14999],
    "8600": [0.19444, 0.69444, 0, 0, 1.14999],
    "8601": [0.19444, 0.69444, 0, 0, 1.14999],
    "8636": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8637": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8640": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8641": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8656": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8657": [0.19444, 0.69444, 0, 0, 0.70277],
    "8658": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8659": [0.19444, 0.69444, 0, 0, 0.70277],
    "8660": [-0.10889, 0.39111, 0, 0, 1.14999],
    "8661": [0.25, 0.75, 0, 0, 0.70277],
    "8704": [0, 0.69444, 0, 0, 0.63889],
    "8706": [0, 0.69444, 0.06389, 0, 0.62847],
    "8707": [0, 0.69444, 0, 0, 0.63889],
    "8709": [0.05556, 0.75, 0, 0, 0.575],
    "8711": [0, 0.68611, 0, 0, 0.95833],
    "8712": [0.08556, 0.58556, 0, 0, 0.76666],
    "8715": [0.08556, 0.58556, 0, 0, 0.76666],
    "8722": [0.13333, 0.63333, 0, 0, 0.89444],
    "8723": [0.13333, 0.63333, 0, 0, 0.89444],
    "8725": [0.25, 0.75, 0, 0, 0.575],
    "8726": [0.25, 0.75, 0, 0, 0.575],
    "8727": [-0.02778, 0.47222, 0, 0, 0.575],
    "8728": [-0.02639, 0.47361, 0, 0, 0.575],
    "8729": [-0.02639, 0.47361, 0, 0, 0.575],
    "8730": [0.18, 0.82, 0, 0, 0.95833],
    "8733": [0, 0.44444, 0, 0, 0.89444],
    "8734": [0, 0.44444, 0, 0, 1.14999],
    "8736": [0, 0.69224, 0, 0, 0.72222],
    "8739": [0.25, 0.75, 0, 0, 0.31944],
    "8741": [0.25, 0.75, 0, 0, 0.575],
    "8743": [0, 0.55556, 0, 0, 0.76666],
    "8744": [0, 0.55556, 0, 0, 0.76666],
    "8745": [0, 0.55556, 0, 0, 0.76666],
    "8746": [0, 0.55556, 0, 0, 0.76666],
    "8747": [0.19444, 0.69444, 0.12778, 0, 0.56875],
    "8764": [-0.10889, 0.39111, 0, 0, 0.89444],
    "8768": [0.19444, 0.69444, 0, 0, 0.31944],
    "8771": [0.00222, 0.50222, 0, 0, 0.89444],
    "8773": [0.027, 0.638, 0, 0, 0.894],
    "8776": [0.02444, 0.52444, 0, 0, 0.89444],
    "8781": [0.00222, 0.50222, 0, 0, 0.89444],
    "8801": [0.00222, 0.50222, 0, 0, 0.89444],
    "8804": [0.19667, 0.69667, 0, 0, 0.89444],
    "8805": [0.19667, 0.69667, 0, 0, 0.89444],
    "8810": [0.08556, 0.58556, 0, 0, 1.14999],
    "8811": [0.08556, 0.58556, 0, 0, 1.14999],
    "8826": [0.08556, 0.58556, 0, 0, 0.89444],
    "8827": [0.08556, 0.58556, 0, 0, 0.89444],
    "8834": [0.08556, 0.58556, 0, 0, 0.89444],
    "8835": [0.08556, 0.58556, 0, 0, 0.89444],
    "8838": [0.19667, 0.69667, 0, 0, 0.89444],
    "8839": [0.19667, 0.69667, 0, 0, 0.89444],
    "8846": [0, 0.55556, 0, 0, 0.76666],
    "8849": [0.19667, 0.69667, 0, 0, 0.89444],
    "8850": [0.19667, 0.69667, 0, 0, 0.89444],
    "8851": [0, 0.55556, 0, 0, 0.76666],
    "8852": [0, 0.55556, 0, 0, 0.76666],
    "8853": [0.13333, 0.63333, 0, 0, 0.89444],
    "8854": [0.13333, 0.63333, 0, 0, 0.89444],
    "8855": [0.13333, 0.63333, 0, 0, 0.89444],
    "8856": [0.13333, 0.63333, 0, 0, 0.89444],
    "8857": [0.13333, 0.63333, 0, 0, 0.89444],
    "8866": [0, 0.69444, 0, 0, 0.70277],
    "8867": [0, 0.69444, 0, 0, 0.70277],
    "8868": [0, 0.69444, 0, 0, 0.89444],
    "8869": [0, 0.69444, 0, 0, 0.89444],
    "8900": [-0.02639, 0.47361, 0, 0, 0.575],
    "8901": [-0.02639, 0.47361, 0, 0, 0.31944],
    "8902": [-0.02778, 0.47222, 0, 0, 0.575],
    "8968": [0.25, 0.75, 0, 0, 0.51111],
    "8969": [0.25, 0.75, 0, 0, 0.51111],
    "8970": [0.25, 0.75, 0, 0, 0.51111],
    "8971": [0.25, 0.75, 0, 0, 0.51111],
    "8994": [-0.13889, 0.36111, 0, 0, 1.14999],
    "8995": [-0.13889, 0.36111, 0, 0, 1.14999],
    "9651": [0.19444, 0.69444, 0, 0, 1.02222],
    "9657": [-0.02778, 0.47222, 0, 0, 0.575],
    "9661": [0.19444, 0.69444, 0, 0, 1.02222],
    "9667": [-0.02778, 0.47222, 0, 0, 0.575],
    "9711": [0.19444, 0.69444, 0, 0, 1.14999],
    "9824": [0.12963, 0.69444, 0, 0, 0.89444],
    "9825": [0.12963, 0.69444, 0, 0, 0.89444],
    "9826": [0.12963, 0.69444, 0, 0, 0.89444],
    "9827": [0.12963, 0.69444, 0, 0, 0.89444],
    "9837": [0, 0.75, 0, 0, 0.44722],
    "9838": [0.19444, 0.69444, 0, 0, 0.44722],
    "9839": [0.19444, 0.69444, 0, 0, 0.44722],
    "10216": [0.25, 0.75, 0, 0, 0.44722],
    "10217": [0.25, 0.75, 0, 0, 0.44722],
    "10815": [0, 0.68611, 0, 0, 0.9],
    "10927": [0.19667, 0.69667, 0, 0, 0.89444],
    "10928": [0.19667, 0.69667, 0, 0, 0.89444],
    "57376": [0.19444, 0.69444, 0, 0, 0]
  },
  "Main-BoldItalic": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69444, 0.11417, 0, 0.38611],
    "34": [0, 0.69444, 0.07939, 0, 0.62055],
    "35": [0.19444, 0.69444, 0.06833, 0, 0.94444],
    "37": [0.05556, 0.75, 0.12861, 0, 0.94444],
    "38": [0, 0.69444, 0.08528, 0, 0.88555],
    "39": [0, 0.69444, 0.12945, 0, 0.35555],
    "40": [0.25, 0.75, 0.15806, 0, 0.47333],
    "41": [0.25, 0.75, 0.03306, 0, 0.47333],
    "42": [0, 0.75, 0.14333, 0, 0.59111],
    "43": [0.10333, 0.60333, 0.03306, 0, 0.88555],
    "44": [0.19444, 0.14722, 0, 0, 0.35555],
    "45": [0, 0.44444, 0.02611, 0, 0.41444],
    "46": [0, 0.14722, 0, 0, 0.35555],
    "47": [0.25, 0.75, 0.15806, 0, 0.59111],
    "48": [0, 0.64444, 0.13167, 0, 0.59111],
    "49": [0, 0.64444, 0.13167, 0, 0.59111],
    "50": [0, 0.64444, 0.13167, 0, 0.59111],
    "51": [0, 0.64444, 0.13167, 0, 0.59111],
    "52": [0.19444, 0.64444, 0.13167, 0, 0.59111],
    "53": [0, 0.64444, 0.13167, 0, 0.59111],
    "54": [0, 0.64444, 0.13167, 0, 0.59111],
    "55": [0.19444, 0.64444, 0.13167, 0, 0.59111],
    "56": [0, 0.64444, 0.13167, 0, 0.59111],
    "57": [0, 0.64444, 0.13167, 0, 0.59111],
    "58": [0, 0.44444, 0.06695, 0, 0.35555],
    "59": [0.19444, 0.44444, 0.06695, 0, 0.35555],
    "61": [-0.10889, 0.39111, 0.06833, 0, 0.88555],
    "63": [0, 0.69444, 0.11472, 0, 0.59111],
    "64": [0, 0.69444, 0.09208, 0, 0.88555],
    "65": [0, 0.68611, 0, 0, 0.86555],
    "66": [0, 0.68611, 0.0992, 0, 0.81666],
    "67": [0, 0.68611, 0.14208, 0, 0.82666],
    "68": [0, 0.68611, 0.09062, 0, 0.87555],
    "69": [0, 0.68611, 0.11431, 0, 0.75666],
    "70": [0, 0.68611, 0.12903, 0, 0.72722],
    "71": [0, 0.68611, 0.07347, 0, 0.89527],
    "72": [0, 0.68611, 0.17208, 0, 0.8961],
    "73": [0, 0.68611, 0.15681, 0, 0.47166],
    "74": [0, 0.68611, 0.145, 0, 0.61055],
    "75": [0, 0.68611, 0.14208, 0, 0.89499],
    "76": [0, 0.68611, 0, 0, 0.69777],
    "77": [0, 0.68611, 0.17208, 0, 1.07277],
    "78": [0, 0.68611, 0.17208, 0, 0.8961],
    "79": [0, 0.68611, 0.09062, 0, 0.85499],
    "80": [0, 0.68611, 0.0992, 0, 0.78721],
    "81": [0.19444, 0.68611, 0.09062, 0, 0.85499],
    "82": [0, 0.68611, 0.02559, 0, 0.85944],
    "83": [0, 0.68611, 0.11264, 0, 0.64999],
    "84": [0, 0.68611, 0.12903, 0, 0.7961],
    "85": [0, 0.68611, 0.17208, 0, 0.88083],
    "86": [0, 0.68611, 0.18625, 0, 0.86555],
    "87": [0, 0.68611, 0.18625, 0, 1.15999],
    "88": [0, 0.68611, 0.15681, 0, 0.86555],
    "89": [0, 0.68611, 0.19803, 0, 0.86555],
    "90": [0, 0.68611, 0.14208, 0, 0.70888],
    "91": [0.25, 0.75, 0.1875, 0, 0.35611],
    "93": [0.25, 0.75, 0.09972, 0, 0.35611],
    "94": [0, 0.69444, 0.06709, 0, 0.59111],
    "95": [0.31, 0.13444, 0.09811, 0, 0.59111],
    "97": [0, 0.44444, 0.09426, 0, 0.59111],
    "98": [0, 0.69444, 0.07861, 0, 0.53222],
    "99": [0, 0.44444, 0.05222, 0, 0.53222],
    "100": [0, 0.69444, 0.10861, 0, 0.59111],
    "101": [0, 0.44444, 0.085, 0, 0.53222],
    "102": [0.19444, 0.69444, 0.21778, 0, 0.4],
    "103": [0.19444, 0.44444, 0.105, 0, 0.53222],
    "104": [0, 0.69444, 0.09426, 0, 0.59111],
    "105": [0, 0.69326, 0.11387, 0, 0.35555],
    "106": [0.19444, 0.69326, 0.1672, 0, 0.35555],
    "107": [0, 0.69444, 0.11111, 0, 0.53222],
    "108": [0, 0.69444, 0.10861, 0, 0.29666],
    "109": [0, 0.44444, 0.09426, 0, 0.94444],
    "110": [0, 0.44444, 0.09426, 0, 0.64999],
    "111": [0, 0.44444, 0.07861, 0, 0.59111],
    "112": [0.19444, 0.44444, 0.07861, 0, 0.59111],
    "113": [0.19444, 0.44444, 0.105, 0, 0.53222],
    "114": [0, 0.44444, 0.11111, 0, 0.50167],
    "115": [0, 0.44444, 0.08167, 0, 0.48694],
    "116": [0, 0.63492, 0.09639, 0, 0.385],
    "117": [0, 0.44444, 0.09426, 0, 0.62055],
    "118": [0, 0.44444, 0.11111, 0, 0.53222],
    "119": [0, 0.44444, 0.11111, 0, 0.76777],
    "120": [0, 0.44444, 0.12583, 0, 0.56055],
    "121": [0.19444, 0.44444, 0.105, 0, 0.56166],
    "122": [0, 0.44444, 0.13889, 0, 0.49055],
    "126": [0.35, 0.34444, 0.11472, 0, 0.59111],
    "160": [0, 0, 0, 0, 0.25],
    "168": [0, 0.69444, 0.11473, 0, 0.59111],
    "176": [0, 0.69444, 0, 0, 0.94888],
    "184": [0.17014, 0, 0, 0, 0.53222],
    "198": [0, 0.68611, 0.11431, 0, 1.02277],
    "216": [0.04861, 0.73472, 0.09062, 0, 0.88555],
    "223": [0.19444, 0.69444, 0.09736, 0, 0.665],
    "230": [0, 0.44444, 0.085, 0, 0.82666],
    "248": [0.09722, 0.54167, 0.09458, 0, 0.59111],
    "305": [0, 0.44444, 0.09426, 0, 0.35555],
    "338": [0, 0.68611, 0.11431, 0, 1.14054],
    "339": [0, 0.44444, 0.085, 0, 0.82666],
    "567": [0.19444, 0.44444, 0.04611, 0, 0.385],
    "710": [0, 0.69444, 0.06709, 0, 0.59111],
    "711": [0, 0.63194, 0.08271, 0, 0.59111],
    "713": [0, 0.59444, 0.10444, 0, 0.59111],
    "714": [0, 0.69444, 0.08528, 0, 0.59111],
    "715": [0, 0.69444, 0, 0, 0.59111],
    "728": [0, 0.69444, 0.10333, 0, 0.59111],
    "729": [0, 0.69444, 0.12945, 0, 0.35555],
    "730": [0, 0.69444, 0, 0, 0.94888],
    "732": [0, 0.69444, 0.11472, 0, 0.59111],
    "733": [0, 0.69444, 0.11472, 0, 0.59111],
    "915": [0, 0.68611, 0.12903, 0, 0.69777],
    "916": [0, 0.68611, 0, 0, 0.94444],
    "920": [0, 0.68611, 0.09062, 0, 0.88555],
    "923": [0, 0.68611, 0, 0, 0.80666],
    "926": [0, 0.68611, 0.15092, 0, 0.76777],
    "928": [0, 0.68611, 0.17208, 0, 0.8961],
    "931": [0, 0.68611, 0.11431, 0, 0.82666],
    "933": [0, 0.68611, 0.10778, 0, 0.88555],
    "934": [0, 0.68611, 0.05632, 0, 0.82666],
    "936": [0, 0.68611, 0.10778, 0, 0.88555],
    "937": [0, 0.68611, 0.0992, 0, 0.82666],
    "8211": [0, 0.44444, 0.09811, 0, 0.59111],
    "8212": [0, 0.44444, 0.09811, 0, 1.18221],
    "8216": [0, 0.69444, 0.12945, 0, 0.35555],
    "8217": [0, 0.69444, 0.12945, 0, 0.35555],
    "8220": [0, 0.69444, 0.16772, 0, 0.62055],
    "8221": [0, 0.69444, 0.07939, 0, 0.62055]
  },
  "Main-Italic": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69444, 0.12417, 0, 0.30667],
    "34": [0, 0.69444, 0.06961, 0, 0.51444],
    "35": [0.19444, 0.69444, 0.06616, 0, 0.81777],
    "37": [0.05556, 0.75, 0.13639, 0, 0.81777],
    "38": [0, 0.69444, 0.09694, 0, 0.76666],
    "39": [0, 0.69444, 0.12417, 0, 0.30667],
    "40": [0.25, 0.75, 0.16194, 0, 0.40889],
    "41": [0.25, 0.75, 0.03694, 0, 0.40889],
    "42": [0, 0.75, 0.14917, 0, 0.51111],
    "43": [0.05667, 0.56167, 0.03694, 0, 0.76666],
    "44": [0.19444, 0.10556, 0, 0, 0.30667],
    "45": [0, 0.43056, 0.02826, 0, 0.35778],
    "46": [0, 0.10556, 0, 0, 0.30667],
    "47": [0.25, 0.75, 0.16194, 0, 0.51111],
    "48": [0, 0.64444, 0.13556, 0, 0.51111],
    "49": [0, 0.64444, 0.13556, 0, 0.51111],
    "50": [0, 0.64444, 0.13556, 0, 0.51111],
    "51": [0, 0.64444, 0.13556, 0, 0.51111],
    "52": [0.19444, 0.64444, 0.13556, 0, 0.51111],
    "53": [0, 0.64444, 0.13556, 0, 0.51111],
    "54": [0, 0.64444, 0.13556, 0, 0.51111],
    "55": [0.19444, 0.64444, 0.13556, 0, 0.51111],
    "56": [0, 0.64444, 0.13556, 0, 0.51111],
    "57": [0, 0.64444, 0.13556, 0, 0.51111],
    "58": [0, 0.43056, 0.0582, 0, 0.30667],
    "59": [0.19444, 0.43056, 0.0582, 0, 0.30667],
    "61": [-0.13313, 0.36687, 0.06616, 0, 0.76666],
    "63": [0, 0.69444, 0.1225, 0, 0.51111],
    "64": [0, 0.69444, 0.09597, 0, 0.76666],
    "65": [0, 0.68333, 0, 0, 0.74333],
    "66": [0, 0.68333, 0.10257, 0, 0.70389],
    "67": [0, 0.68333, 0.14528, 0, 0.71555],
    "68": [0, 0.68333, 0.09403, 0, 0.755],
    "69": [0, 0.68333, 0.12028, 0, 0.67833],
    "70": [0, 0.68333, 0.13305, 0, 0.65277],
    "71": [0, 0.68333, 0.08722, 0, 0.77361],
    "72": [0, 0.68333, 0.16389, 0, 0.74333],
    "73": [0, 0.68333, 0.15806, 0, 0.38555],
    "74": [0, 0.68333, 0.14028, 0, 0.525],
    "75": [0, 0.68333, 0.14528, 0, 0.76888],
    "76": [0, 0.68333, 0, 0, 0.62722],
    "77": [0, 0.68333, 0.16389, 0, 0.89666],
    "78": [0, 0.68333, 0.16389, 0, 0.74333],
    "79": [0, 0.68333, 0.09403, 0, 0.76666],
    "80": [0, 0.68333, 0.10257, 0, 0.67833],
    "81": [0.19444, 0.68333, 0.09403, 0, 0.76666],
    "82": [0, 0.68333, 0.03868, 0, 0.72944],
    "83": [0, 0.68333, 0.11972, 0, 0.56222],
    "84": [0, 0.68333, 0.13305, 0, 0.71555],
    "85": [0, 0.68333, 0.16389, 0, 0.74333],
    "86": [0, 0.68333, 0.18361, 0, 0.74333],
    "87": [0, 0.68333, 0.18361, 0, 0.99888],
    "88": [0, 0.68333, 0.15806, 0, 0.74333],
    "89": [0, 0.68333, 0.19383, 0, 0.74333],
    "90": [0, 0.68333, 0.14528, 0, 0.61333],
    "91": [0.25, 0.75, 0.1875, 0, 0.30667],
    "93": [0.25, 0.75, 0.10528, 0, 0.30667],
    "94": [0, 0.69444, 0.06646, 0, 0.51111],
    "95": [0.31, 0.12056, 0.09208, 0, 0.51111],
    "97": [0, 0.43056, 0.07671, 0, 0.51111],
    "98": [0, 0.69444, 0.06312, 0, 0.46],
    "99": [0, 0.43056, 0.05653, 0, 0.46],
    "100": [0, 0.69444, 0.10333, 0, 0.51111],
    "101": [0, 0.43056, 0.07514, 0, 0.46],
    "102": [0.19444, 0.69444, 0.21194, 0, 0.30667],
    "103": [0.19444, 0.43056, 0.08847, 0, 0.46],
    "104": [0, 0.69444, 0.07671, 0, 0.51111],
    "105": [0, 0.65536, 0.1019, 0, 0.30667],
    "106": [0.19444, 0.65536, 0.14467, 0, 0.30667],
    "107": [0, 0.69444, 0.10764, 0, 0.46],
    "108": [0, 0.69444, 0.10333, 0, 0.25555],
    "109": [0, 0.43056, 0.07671, 0, 0.81777],
    "110": [0, 0.43056, 0.07671, 0, 0.56222],
    "111": [0, 0.43056, 0.06312, 0, 0.51111],
    "112": [0.19444, 0.43056, 0.06312, 0, 0.51111],
    "113": [0.19444, 0.43056, 0.08847, 0, 0.46],
    "114": [0, 0.43056, 0.10764, 0, 0.42166],
    "115": [0, 0.43056, 0.08208, 0, 0.40889],
    "116": [0, 0.61508, 0.09486, 0, 0.33222],
    "117": [0, 0.43056, 0.07671, 0, 0.53666],
    "118": [0, 0.43056, 0.10764, 0, 0.46],
    "119": [0, 0.43056, 0.10764, 0, 0.66444],
    "120": [0, 0.43056, 0.12042, 0, 0.46389],
    "121": [0.19444, 0.43056, 0.08847, 0, 0.48555],
    "122": [0, 0.43056, 0.12292, 0, 0.40889],
    "126": [0.35, 0.31786, 0.11585, 0, 0.51111],
    "160": [0, 0, 0, 0, 0.25],
    "168": [0, 0.66786, 0.10474, 0, 0.51111],
    "176": [0, 0.69444, 0, 0, 0.83129],
    "184": [0.17014, 0, 0, 0, 0.46],
    "198": [0, 0.68333, 0.12028, 0, 0.88277],
    "216": [0.04861, 0.73194, 0.09403, 0, 0.76666],
    "223": [0.19444, 0.69444, 0.10514, 0, 0.53666],
    "230": [0, 0.43056, 0.07514, 0, 0.71555],
    "248": [0.09722, 0.52778, 0.09194, 0, 0.51111],
    "338": [0, 0.68333, 0.12028, 0, 0.98499],
    "339": [0, 0.43056, 0.07514, 0, 0.71555],
    "710": [0, 0.69444, 0.06646, 0, 0.51111],
    "711": [0, 0.62847, 0.08295, 0, 0.51111],
    "713": [0, 0.56167, 0.10333, 0, 0.51111],
    "714": [0, 0.69444, 0.09694, 0, 0.51111],
    "715": [0, 0.69444, 0, 0, 0.51111],
    "728": [0, 0.69444, 0.10806, 0, 0.51111],
    "729": [0, 0.66786, 0.11752, 0, 0.30667],
    "730": [0, 0.69444, 0, 0, 0.83129],
    "732": [0, 0.66786, 0.11585, 0, 0.51111],
    "733": [0, 0.69444, 0.1225, 0, 0.51111],
    "915": [0, 0.68333, 0.13305, 0, 0.62722],
    "916": [0, 0.68333, 0, 0, 0.81777],
    "920": [0, 0.68333, 0.09403, 0, 0.76666],
    "923": [0, 0.68333, 0, 0, 0.69222],
    "926": [0, 0.68333, 0.15294, 0, 0.66444],
    "928": [0, 0.68333, 0.16389, 0, 0.74333],
    "931": [0, 0.68333, 0.12028, 0, 0.71555],
    "933": [0, 0.68333, 0.11111, 0, 0.76666],
    "934": [0, 0.68333, 0.05986, 0, 0.71555],
    "936": [0, 0.68333, 0.11111, 0, 0.76666],
    "937": [0, 0.68333, 0.10257, 0, 0.71555],
    "8211": [0, 0.43056, 0.09208, 0, 0.51111],
    "8212": [0, 0.43056, 0.09208, 0, 1.02222],
    "8216": [0, 0.69444, 0.12417, 0, 0.30667],
    "8217": [0, 0.69444, 0.12417, 0, 0.30667],
    "8220": [0, 0.69444, 0.1685, 0, 0.51444],
    "8221": [0, 0.69444, 0.06961, 0, 0.51444],
    "8463": [0, 0.68889, 0, 0, 0.54028]
  },
  "Main-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69444, 0, 0, 0.27778],
    "34": [0, 0.69444, 0, 0, 0.5],
    "35": [0.19444, 0.69444, 0, 0, 0.83334],
    "36": [0.05556, 0.75, 0, 0, 0.5],
    "37": [0.05556, 0.75, 0, 0, 0.83334],
    "38": [0, 0.69444, 0, 0, 0.77778],
    "39": [0, 0.69444, 0, 0, 0.27778],
    "40": [0.25, 0.75, 0, 0, 0.38889],
    "41": [0.25, 0.75, 0, 0, 0.38889],
    "42": [0, 0.75, 0, 0, 0.5],
    "43": [0.08333, 0.58333, 0, 0, 0.77778],
    "44": [0.19444, 0.10556, 0, 0, 0.27778],
    "45": [0, 0.43056, 0, 0, 0.33333],
    "46": [0, 0.10556, 0, 0, 0.27778],
    "47": [0.25, 0.75, 0, 0, 0.5],
    "48": [0, 0.64444, 0, 0, 0.5],
    "49": [0, 0.64444, 0, 0, 0.5],
    "50": [0, 0.64444, 0, 0, 0.5],
    "51": [0, 0.64444, 0, 0, 0.5],
    "52": [0, 0.64444, 0, 0, 0.5],
    "53": [0, 0.64444, 0, 0, 0.5],
    "54": [0, 0.64444, 0, 0, 0.5],
    "55": [0, 0.64444, 0, 0, 0.5],
    "56": [0, 0.64444, 0, 0, 0.5],
    "57": [0, 0.64444, 0, 0, 0.5],
    "58": [0, 0.43056, 0, 0, 0.27778],
    "59": [0.19444, 0.43056, 0, 0, 0.27778],
    "60": [0.0391, 0.5391, 0, 0, 0.77778],
    "61": [-0.13313, 0.36687, 0, 0, 0.77778],
    "62": [0.0391, 0.5391, 0, 0, 0.77778],
    "63": [0, 0.69444, 0, 0, 0.47222],
    "64": [0, 0.69444, 0, 0, 0.77778],
    "65": [0, 0.68333, 0, 0, 0.75],
    "66": [0, 0.68333, 0, 0, 0.70834],
    "67": [0, 0.68333, 0, 0, 0.72222],
    "68": [0, 0.68333, 0, 0, 0.76389],
    "69": [0, 0.68333, 0, 0, 0.68056],
    "70": [0, 0.68333, 0, 0, 0.65278],
    "71": [0, 0.68333, 0, 0, 0.78472],
    "72": [0, 0.68333, 0, 0, 0.75],
    "73": [0, 0.68333, 0, 0, 0.36111],
    "74": [0, 0.68333, 0, 0, 0.51389],
    "75": [0, 0.68333, 0, 0, 0.77778],
    "76": [0, 0.68333, 0, 0, 0.625],
    "77": [0, 0.68333, 0, 0, 0.91667],
    "78": [0, 0.68333, 0, 0, 0.75],
    "79": [0, 0.68333, 0, 0, 0.77778],
    "80": [0, 0.68333, 0, 0, 0.68056],
    "81": [0.19444, 0.68333, 0, 0, 0.77778],
    "82": [0, 0.68333, 0, 0, 0.73611],
    "83": [0, 0.68333, 0, 0, 0.55556],
    "84": [0, 0.68333, 0, 0, 0.72222],
    "85": [0, 0.68333, 0, 0, 0.75],
    "86": [0, 0.68333, 0.01389, 0, 0.75],
    "87": [0, 0.68333, 0.01389, 0, 1.02778],
    "88": [0, 0.68333, 0, 0, 0.75],
    "89": [0, 0.68333, 0.025, 0, 0.75],
    "90": [0, 0.68333, 0, 0, 0.61111],
    "91": [0.25, 0.75, 0, 0, 0.27778],
    "92": [0.25, 0.75, 0, 0, 0.5],
    "93": [0.25, 0.75, 0, 0, 0.27778],
    "94": [0, 0.69444, 0, 0, 0.5],
    "95": [0.31, 0.12056, 0.02778, 0, 0.5],
    "97": [0, 0.43056, 0, 0, 0.5],
    "98": [0, 0.69444, 0, 0, 0.55556],
    "99": [0, 0.43056, 0, 0, 0.44445],
    "100": [0, 0.69444, 0, 0, 0.55556],
    "101": [0, 0.43056, 0, 0, 0.44445],
    "102": [0, 0.69444, 0.07778, 0, 0.30556],
    "103": [0.19444, 0.43056, 0.01389, 0, 0.5],
    "104": [0, 0.69444, 0, 0, 0.55556],
    "105": [0, 0.66786, 0, 0, 0.27778],
    "106": [0.19444, 0.66786, 0, 0, 0.30556],
    "107": [0, 0.69444, 0, 0, 0.52778],
    "108": [0, 0.69444, 0, 0, 0.27778],
    "109": [0, 0.43056, 0, 0, 0.83334],
    "110": [0, 0.43056, 0, 0, 0.55556],
    "111": [0, 0.43056, 0, 0, 0.5],
    "112": [0.19444, 0.43056, 0, 0, 0.55556],
    "113": [0.19444, 0.43056, 0, 0, 0.52778],
    "114": [0, 0.43056, 0, 0, 0.39167],
    "115": [0, 0.43056, 0, 0, 0.39445],
    "116": [0, 0.61508, 0, 0, 0.38889],
    "117": [0, 0.43056, 0, 0, 0.55556],
    "118": [0, 0.43056, 0.01389, 0, 0.52778],
    "119": [0, 0.43056, 0.01389, 0, 0.72222],
    "120": [0, 0.43056, 0, 0, 0.52778],
    "121": [0.19444, 0.43056, 0.01389, 0, 0.52778],
    "122": [0, 0.43056, 0, 0, 0.44445],
    "123": [0.25, 0.75, 0, 0, 0.5],
    "124": [0.25, 0.75, 0, 0, 0.27778],
    "125": [0.25, 0.75, 0, 0, 0.5],
    "126": [0.35, 0.31786, 0, 0, 0.5],
    "160": [0, 0, 0, 0, 0.25],
    "163": [0, 0.69444, 0, 0, 0.76909],
    "167": [0.19444, 0.69444, 0, 0, 0.44445],
    "168": [0, 0.66786, 0, 0, 0.5],
    "172": [0, 0.43056, 0, 0, 0.66667],
    "176": [0, 0.69444, 0, 0, 0.75],
    "177": [0.08333, 0.58333, 0, 0, 0.77778],
    "182": [0.19444, 0.69444, 0, 0, 0.61111],
    "184": [0.17014, 0, 0, 0, 0.44445],
    "198": [0, 0.68333, 0, 0, 0.90278],
    "215": [0.08333, 0.58333, 0, 0, 0.77778],
    "216": [0.04861, 0.73194, 0, 0, 0.77778],
    "223": [0, 0.69444, 0, 0, 0.5],
    "230": [0, 0.43056, 0, 0, 0.72222],
    "247": [0.08333, 0.58333, 0, 0, 0.77778],
    "248": [0.09722, 0.52778, 0, 0, 0.5],
    "305": [0, 0.43056, 0, 0, 0.27778],
    "338": [0, 0.68333, 0, 0, 1.01389],
    "339": [0, 0.43056, 0, 0, 0.77778],
    "567": [0.19444, 0.43056, 0, 0, 0.30556],
    "710": [0, 0.69444, 0, 0, 0.5],
    "711": [0, 0.62847, 0, 0, 0.5],
    "713": [0, 0.56778, 0, 0, 0.5],
    "714": [0, 0.69444, 0, 0, 0.5],
    "715": [0, 0.69444, 0, 0, 0.5],
    "728": [0, 0.69444, 0, 0, 0.5],
    "729": [0, 0.66786, 0, 0, 0.27778],
    "730": [0, 0.69444, 0, 0, 0.75],
    "732": [0, 0.66786, 0, 0, 0.5],
    "733": [0, 0.69444, 0, 0, 0.5],
    "915": [0, 0.68333, 0, 0, 0.625],
    "916": [0, 0.68333, 0, 0, 0.83334],
    "920": [0, 0.68333, 0, 0, 0.77778],
    "923": [0, 0.68333, 0, 0, 0.69445],
    "926": [0, 0.68333, 0, 0, 0.66667],
    "928": [0, 0.68333, 0, 0, 0.75],
    "931": [0, 0.68333, 0, 0, 0.72222],
    "933": [0, 0.68333, 0, 0, 0.77778],
    "934": [0, 0.68333, 0, 0, 0.72222],
    "936": [0, 0.68333, 0, 0, 0.77778],
    "937": [0, 0.68333, 0, 0, 0.72222],
    "8211": [0, 0.43056, 0.02778, 0, 0.5],
    "8212": [0, 0.43056, 0.02778, 0, 1],
    "8216": [0, 0.69444, 0, 0, 0.27778],
    "8217": [0, 0.69444, 0, 0, 0.27778],
    "8220": [0, 0.69444, 0, 0, 0.5],
    "8221": [0, 0.69444, 0, 0, 0.5],
    "8224": [0.19444, 0.69444, 0, 0, 0.44445],
    "8225": [0.19444, 0.69444, 0, 0, 0.44445],
    "8230": [0, 0.123, 0, 0, 1.172],
    "8242": [0, 0.55556, 0, 0, 0.275],
    "8407": [0, 0.71444, 0.15382, 0, 0.5],
    "8463": [0, 0.68889, 0, 0, 0.54028],
    "8465": [0, 0.69444, 0, 0, 0.72222],
    "8467": [0, 0.69444, 0, 0.11111, 0.41667],
    "8472": [0.19444, 0.43056, 0, 0.11111, 0.63646],
    "8476": [0, 0.69444, 0, 0, 0.72222],
    "8501": [0, 0.69444, 0, 0, 0.61111],
    "8592": [-0.13313, 0.36687, 0, 0, 1],
    "8593": [0.19444, 0.69444, 0, 0, 0.5],
    "8594": [-0.13313, 0.36687, 0, 0, 1],
    "8595": [0.19444, 0.69444, 0, 0, 0.5],
    "8596": [-0.13313, 0.36687, 0, 0, 1],
    "8597": [0.25, 0.75, 0, 0, 0.5],
    "8598": [0.19444, 0.69444, 0, 0, 1],
    "8599": [0.19444, 0.69444, 0, 0, 1],
    "8600": [0.19444, 0.69444, 0, 0, 1],
    "8601": [0.19444, 0.69444, 0, 0, 1],
    "8614": [0.011, 0.511, 0, 0, 1],
    "8617": [0.011, 0.511, 0, 0, 1.126],
    "8618": [0.011, 0.511, 0, 0, 1.126],
    "8636": [-0.13313, 0.36687, 0, 0, 1],
    "8637": [-0.13313, 0.36687, 0, 0, 1],
    "8640": [-0.13313, 0.36687, 0, 0, 1],
    "8641": [-0.13313, 0.36687, 0, 0, 1],
    "8652": [0.011, 0.671, 0, 0, 1],
    "8656": [-0.13313, 0.36687, 0, 0, 1],
    "8657": [0.19444, 0.69444, 0, 0, 0.61111],
    "8658": [-0.13313, 0.36687, 0, 0, 1],
    "8659": [0.19444, 0.69444, 0, 0, 0.61111],
    "8660": [-0.13313, 0.36687, 0, 0, 1],
    "8661": [0.25, 0.75, 0, 0, 0.61111],
    "8704": [0, 0.69444, 0, 0, 0.55556],
    "8706": [0, 0.69444, 0.05556, 0.08334, 0.5309],
    "8707": [0, 0.69444, 0, 0, 0.55556],
    "8709": [0.05556, 0.75, 0, 0, 0.5],
    "8711": [0, 0.68333, 0, 0, 0.83334],
    "8712": [0.0391, 0.5391, 0, 0, 0.66667],
    "8715": [0.0391, 0.5391, 0, 0, 0.66667],
    "8722": [0.08333, 0.58333, 0, 0, 0.77778],
    "8723": [0.08333, 0.58333, 0, 0, 0.77778],
    "8725": [0.25, 0.75, 0, 0, 0.5],
    "8726": [0.25, 0.75, 0, 0, 0.5],
    "8727": [-0.03472, 0.46528, 0, 0, 0.5],
    "8728": [-0.05555, 0.44445, 0, 0, 0.5],
    "8729": [-0.05555, 0.44445, 0, 0, 0.5],
    "8730": [0.2, 0.8, 0, 0, 0.83334],
    "8733": [0, 0.43056, 0, 0, 0.77778],
    "8734": [0, 0.43056, 0, 0, 1],
    "8736": [0, 0.69224, 0, 0, 0.72222],
    "8739": [0.25, 0.75, 0, 0, 0.27778],
    "8741": [0.25, 0.75, 0, 0, 0.5],
    "8743": [0, 0.55556, 0, 0, 0.66667],
    "8744": [0, 0.55556, 0, 0, 0.66667],
    "8745": [0, 0.55556, 0, 0, 0.66667],
    "8746": [0, 0.55556, 0, 0, 0.66667],
    "8747": [0.19444, 0.69444, 0.11111, 0, 0.41667],
    "8764": [-0.13313, 0.36687, 0, 0, 0.77778],
    "8768": [0.19444, 0.69444, 0, 0, 0.27778],
    "8771": [-0.03625, 0.46375, 0, 0, 0.77778],
    "8773": [-0.022, 0.589, 0, 0, 0.778],
    "8776": [-0.01688, 0.48312, 0, 0, 0.77778],
    "8781": [-0.03625, 0.46375, 0, 0, 0.77778],
    "8784": [-0.133, 0.673, 0, 0, 0.778],
    "8801": [-0.03625, 0.46375, 0, 0, 0.77778],
    "8804": [0.13597, 0.63597, 0, 0, 0.77778],
    "8805": [0.13597, 0.63597, 0, 0, 0.77778],
    "8810": [0.0391, 0.5391, 0, 0, 1],
    "8811": [0.0391, 0.5391, 0, 0, 1],
    "8826": [0.0391, 0.5391, 0, 0, 0.77778],
    "8827": [0.0391, 0.5391, 0, 0, 0.77778],
    "8834": [0.0391, 0.5391, 0, 0, 0.77778],
    "8835": [0.0391, 0.5391, 0, 0, 0.77778],
    "8838": [0.13597, 0.63597, 0, 0, 0.77778],
    "8839": [0.13597, 0.63597, 0, 0, 0.77778],
    "8846": [0, 0.55556, 0, 0, 0.66667],
    "8849": [0.13597, 0.63597, 0, 0, 0.77778],
    "8850": [0.13597, 0.63597, 0, 0, 0.77778],
    "8851": [0, 0.55556, 0, 0, 0.66667],
    "8852": [0, 0.55556, 0, 0, 0.66667],
    "8853": [0.08333, 0.58333, 0, 0, 0.77778],
    "8854": [0.08333, 0.58333, 0, 0, 0.77778],
    "8855": [0.08333, 0.58333, 0, 0, 0.77778],
    "8856": [0.08333, 0.58333, 0, 0, 0.77778],
    "8857": [0.08333, 0.58333, 0, 0, 0.77778],
    "8866": [0, 0.69444, 0, 0, 0.61111],
    "8867": [0, 0.69444, 0, 0, 0.61111],
    "8868": [0, 0.69444, 0, 0, 0.77778],
    "8869": [0, 0.69444, 0, 0, 0.77778],
    "8872": [0.249, 0.75, 0, 0, 0.867],
    "8900": [-0.05555, 0.44445, 0, 0, 0.5],
    "8901": [-0.05555, 0.44445, 0, 0, 0.27778],
    "8902": [-0.03472, 0.46528, 0, 0, 0.5],
    "8904": [0.005, 0.505, 0, 0, 0.9],
    "8942": [0.03, 0.903, 0, 0, 0.278],
    "8943": [-0.19, 0.313, 0, 0, 1.172],
    "8945": [-0.1, 0.823, 0, 0, 1.282],
    "8968": [0.25, 0.75, 0, 0, 0.44445],
    "8969": [0.25, 0.75, 0, 0, 0.44445],
    "8970": [0.25, 0.75, 0, 0, 0.44445],
    "8971": [0.25, 0.75, 0, 0, 0.44445],
    "8994": [-0.14236, 0.35764, 0, 0, 1],
    "8995": [-0.14236, 0.35764, 0, 0, 1],
    "9136": [0.244, 0.744, 0, 0, 0.412],
    "9137": [0.244, 0.745, 0, 0, 0.412],
    "9651": [0.19444, 0.69444, 0, 0, 0.88889],
    "9657": [-0.03472, 0.46528, 0, 0, 0.5],
    "9661": [0.19444, 0.69444, 0, 0, 0.88889],
    "9667": [-0.03472, 0.46528, 0, 0, 0.5],
    "9711": [0.19444, 0.69444, 0, 0, 1],
    "9824": [0.12963, 0.69444, 0, 0, 0.77778],
    "9825": [0.12963, 0.69444, 0, 0, 0.77778],
    "9826": [0.12963, 0.69444, 0, 0, 0.77778],
    "9827": [0.12963, 0.69444, 0, 0, 0.77778],
    "9837": [0, 0.75, 0, 0, 0.38889],
    "9838": [0.19444, 0.69444, 0, 0, 0.38889],
    "9839": [0.19444, 0.69444, 0, 0, 0.38889],
    "10216": [0.25, 0.75, 0, 0, 0.38889],
    "10217": [0.25, 0.75, 0, 0, 0.38889],
    "10222": [0.244, 0.744, 0, 0, 0.412],
    "10223": [0.244, 0.745, 0, 0, 0.412],
    "10229": [0.011, 0.511, 0, 0, 1.609],
    "10230": [0.011, 0.511, 0, 0, 1.638],
    "10231": [0.011, 0.511, 0, 0, 1.859],
    "10232": [0.024, 0.525, 0, 0, 1.609],
    "10233": [0.024, 0.525, 0, 0, 1.638],
    "10234": [0.024, 0.525, 0, 0, 1.858],
    "10236": [0.011, 0.511, 0, 0, 1.638],
    "10815": [0, 0.68333, 0, 0, 0.75],
    "10927": [0.13597, 0.63597, 0, 0, 0.77778],
    "10928": [0.13597, 0.63597, 0, 0, 0.77778],
    "57376": [0.19444, 0.69444, 0, 0, 0]
  },
  "Math-BoldItalic": {
    "32": [0, 0, 0, 0, 0.25],
    "48": [0, 0.44444, 0, 0, 0.575],
    "49": [0, 0.44444, 0, 0, 0.575],
    "50": [0, 0.44444, 0, 0, 0.575],
    "51": [0.19444, 0.44444, 0, 0, 0.575],
    "52": [0.19444, 0.44444, 0, 0, 0.575],
    "53": [0.19444, 0.44444, 0, 0, 0.575],
    "54": [0, 0.64444, 0, 0, 0.575],
    "55": [0.19444, 0.44444, 0, 0, 0.575],
    "56": [0, 0.64444, 0, 0, 0.575],
    "57": [0.19444, 0.44444, 0, 0, 0.575],
    "65": [0, 0.68611, 0, 0, 0.86944],
    "66": [0, 0.68611, 0.04835, 0, 0.8664],
    "67": [0, 0.68611, 0.06979, 0, 0.81694],
    "68": [0, 0.68611, 0.03194, 0, 0.93812],
    "69": [0, 0.68611, 0.05451, 0, 0.81007],
    "70": [0, 0.68611, 0.15972, 0, 0.68889],
    "71": [0, 0.68611, 0, 0, 0.88673],
    "72": [0, 0.68611, 0.08229, 0, 0.98229],
    "73": [0, 0.68611, 0.07778, 0, 0.51111],
    "74": [0, 0.68611, 0.10069, 0, 0.63125],
    "75": [0, 0.68611, 0.06979, 0, 0.97118],
    "76": [0, 0.68611, 0, 0, 0.75555],
    "77": [0, 0.68611, 0.11424, 0, 1.14201],
    "78": [0, 0.68611, 0.11424, 0, 0.95034],
    "79": [0, 0.68611, 0.03194, 0, 0.83666],
    "80": [0, 0.68611, 0.15972, 0, 0.72309],
    "81": [0.19444, 0.68611, 0, 0, 0.86861],
    "82": [0, 0.68611, 0.00421, 0, 0.87235],
    "83": [0, 0.68611, 0.05382, 0, 0.69271],
    "84": [0, 0.68611, 0.15972, 0, 0.63663],
    "85": [0, 0.68611, 0.11424, 0, 0.80027],
    "86": [0, 0.68611, 0.25555, 0, 0.67778],
    "87": [0, 0.68611, 0.15972, 0, 1.09305],
    "88": [0, 0.68611, 0.07778, 0, 0.94722],
    "89": [0, 0.68611, 0.25555, 0, 0.67458],
    "90": [0, 0.68611, 0.06979, 0, 0.77257],
    "97": [0, 0.44444, 0, 0, 0.63287],
    "98": [0, 0.69444, 0, 0, 0.52083],
    "99": [0, 0.44444, 0, 0, 0.51342],
    "100": [0, 0.69444, 0, 0, 0.60972],
    "101": [0, 0.44444, 0, 0, 0.55361],
    "102": [0.19444, 0.69444, 0.11042, 0, 0.56806],
    "103": [0.19444, 0.44444, 0.03704, 0, 0.5449],
    "104": [0, 0.69444, 0, 0, 0.66759],
    "105": [0, 0.69326, 0, 0, 0.4048],
    "106": [0.19444, 0.69326, 0.0622, 0, 0.47083],
    "107": [0, 0.69444, 0.01852, 0, 0.6037],
    "108": [0, 0.69444, 0.0088, 0, 0.34815],
    "109": [0, 0.44444, 0, 0, 1.0324],
    "110": [0, 0.44444, 0, 0, 0.71296],
    "111": [0, 0.44444, 0, 0, 0.58472],
    "112": [0.19444, 0.44444, 0, 0, 0.60092],
    "113": [0.19444, 0.44444, 0.03704, 0, 0.54213],
    "114": [0, 0.44444, 0.03194, 0, 0.5287],
    "115": [0, 0.44444, 0, 0, 0.53125],
    "116": [0, 0.63492, 0, 0, 0.41528],
    "117": [0, 0.44444, 0, 0, 0.68102],
    "118": [0, 0.44444, 0.03704, 0, 0.56666],
    "119": [0, 0.44444, 0.02778, 0, 0.83148],
    "120": [0, 0.44444, 0, 0, 0.65903],
    "121": [0.19444, 0.44444, 0.03704, 0, 0.59028],
    "122": [0, 0.44444, 0.04213, 0, 0.55509],
    "160": [0, 0, 0, 0, 0.25],
    "915": [0, 0.68611, 0.15972, 0, 0.65694],
    "916": [0, 0.68611, 0, 0, 0.95833],
    "920": [0, 0.68611, 0.03194, 0, 0.86722],
    "923": [0, 0.68611, 0, 0, 0.80555],
    "926": [0, 0.68611, 0.07458, 0, 0.84125],
    "928": [0, 0.68611, 0.08229, 0, 0.98229],
    "931": [0, 0.68611, 0.05451, 0, 0.88507],
    "933": [0, 0.68611, 0.15972, 0, 0.67083],
    "934": [0, 0.68611, 0, 0, 0.76666],
    "936": [0, 0.68611, 0.11653, 0, 0.71402],
    "937": [0, 0.68611, 0.04835, 0, 0.8789],
    "945": [0, 0.44444, 0, 0, 0.76064],
    "946": [0.19444, 0.69444, 0.03403, 0, 0.65972],
    "947": [0.19444, 0.44444, 0.06389, 0, 0.59003],
    "948": [0, 0.69444, 0.03819, 0, 0.52222],
    "949": [0, 0.44444, 0, 0, 0.52882],
    "950": [0.19444, 0.69444, 0.06215, 0, 0.50833],
    "951": [0.19444, 0.44444, 0.03704, 0, 0.6],
    "952": [0, 0.69444, 0.03194, 0, 0.5618],
    "953": [0, 0.44444, 0, 0, 0.41204],
    "954": [0, 0.44444, 0, 0, 0.66759],
    "955": [0, 0.69444, 0, 0, 0.67083],
    "956": [0.19444, 0.44444, 0, 0, 0.70787],
    "957": [0, 0.44444, 0.06898, 0, 0.57685],
    "958": [0.19444, 0.69444, 0.03021, 0, 0.50833],
    "959": [0, 0.44444, 0, 0, 0.58472],
    "960": [0, 0.44444, 0.03704, 0, 0.68241],
    "961": [0.19444, 0.44444, 0, 0, 0.6118],
    "962": [0.09722, 0.44444, 0.07917, 0, 0.42361],
    "963": [0, 0.44444, 0.03704, 0, 0.68588],
    "964": [0, 0.44444, 0.13472, 0, 0.52083],
    "965": [0, 0.44444, 0.03704, 0, 0.63055],
    "966": [0.19444, 0.44444, 0, 0, 0.74722],
    "967": [0.19444, 0.44444, 0, 0, 0.71805],
    "968": [0.19444, 0.69444, 0.03704, 0, 0.75833],
    "969": [0, 0.44444, 0.03704, 0, 0.71782],
    "977": [0, 0.69444, 0, 0, 0.69155],
    "981": [0.19444, 0.69444, 0, 0, 0.7125],
    "982": [0, 0.44444, 0.03194, 0, 0.975],
    "1009": [0.19444, 0.44444, 0, 0, 0.6118],
    "1013": [0, 0.44444, 0, 0, 0.48333],
    "57649": [0, 0.44444, 0, 0, 0.39352],
    "57911": [0.19444, 0.44444, 0, 0, 0.43889]
  },
  "Math-Italic": {
    "32": [0, 0, 0, 0, 0.25],
    "48": [0, 0.43056, 0, 0, 0.5],
    "49": [0, 0.43056, 0, 0, 0.5],
    "50": [0, 0.43056, 0, 0, 0.5],
    "51": [0.19444, 0.43056, 0, 0, 0.5],
    "52": [0.19444, 0.43056, 0, 0, 0.5],
    "53": [0.19444, 0.43056, 0, 0, 0.5],
    "54": [0, 0.64444, 0, 0, 0.5],
    "55": [0.19444, 0.43056, 0, 0, 0.5],
    "56": [0, 0.64444, 0, 0, 0.5],
    "57": [0.19444, 0.43056, 0, 0, 0.5],
    "65": [0, 0.68333, 0, 0.13889, 0.75],
    "66": [0, 0.68333, 0.05017, 0.08334, 0.75851],
    "67": [0, 0.68333, 0.07153, 0.08334, 0.71472],
    "68": [0, 0.68333, 0.02778, 0.05556, 0.82792],
    "69": [0, 0.68333, 0.05764, 0.08334, 0.7382],
    "70": [0, 0.68333, 0.13889, 0.08334, 0.64306],
    "71": [0, 0.68333, 0, 0.08334, 0.78625],
    "72": [0, 0.68333, 0.08125, 0.05556, 0.83125],
    "73": [0, 0.68333, 0.07847, 0.11111, 0.43958],
    "74": [0, 0.68333, 0.09618, 0.16667, 0.55451],
    "75": [0, 0.68333, 0.07153, 0.05556, 0.84931],
    "76": [0, 0.68333, 0, 0.02778, 0.68056],
    "77": [0, 0.68333, 0.10903, 0.08334, 0.97014],
    "78": [0, 0.68333, 0.10903, 0.08334, 0.80347],
    "79": [0, 0.68333, 0.02778, 0.08334, 0.76278],
    "80": [0, 0.68333, 0.13889, 0.08334, 0.64201],
    "81": [0.19444, 0.68333, 0, 0.08334, 0.79056],
    "82": [0, 0.68333, 0.00773, 0.08334, 0.75929],
    "83": [0, 0.68333, 0.05764, 0.08334, 0.6132],
    "84": [0, 0.68333, 0.13889, 0.08334, 0.58438],
    "85": [0, 0.68333, 0.10903, 0.02778, 0.68278],
    "86": [0, 0.68333, 0.22222, 0, 0.58333],
    "87": [0, 0.68333, 0.13889, 0, 0.94445],
    "88": [0, 0.68333, 0.07847, 0.08334, 0.82847],
    "89": [0, 0.68333, 0.22222, 0, 0.58056],
    "90": [0, 0.68333, 0.07153, 0.08334, 0.68264],
    "97": [0, 0.43056, 0, 0, 0.52859],
    "98": [0, 0.69444, 0, 0, 0.42917],
    "99": [0, 0.43056, 0, 0.05556, 0.43276],
    "100": [0, 0.69444, 0, 0.16667, 0.52049],
    "101": [0, 0.43056, 0, 0.05556, 0.46563],
    "102": [0.19444, 0.69444, 0.10764, 0.16667, 0.48959],
    "103": [0.19444, 0.43056, 0.03588, 0.02778, 0.47697],
    "104": [0, 0.69444, 0, 0, 0.57616],
    "105": [0, 0.65952, 0, 0, 0.34451],
    "106": [0.19444, 0.65952, 0.05724, 0, 0.41181],
    "107": [0, 0.69444, 0.03148, 0, 0.5206],
    "108": [0, 0.69444, 0.01968, 0.08334, 0.29838],
    "109": [0, 0.43056, 0, 0, 0.87801],
    "110": [0, 0.43056, 0, 0, 0.60023],
    "111": [0, 0.43056, 0, 0.05556, 0.48472],
    "112": [0.19444, 0.43056, 0, 0.08334, 0.50313],
    "113": [0.19444, 0.43056, 0.03588, 0.08334, 0.44641],
    "114": [0, 0.43056, 0.02778, 0.05556, 0.45116],
    "115": [0, 0.43056, 0, 0.05556, 0.46875],
    "116": [0, 0.61508, 0, 0.08334, 0.36111],
    "117": [0, 0.43056, 0, 0.02778, 0.57246],
    "118": [0, 0.43056, 0.03588, 0.02778, 0.48472],
    "119": [0, 0.43056, 0.02691, 0.08334, 0.71592],
    "120": [0, 0.43056, 0, 0.02778, 0.57153],
    "121": [0.19444, 0.43056, 0.03588, 0.05556, 0.49028],
    "122": [0, 0.43056, 0.04398, 0.05556, 0.46505],
    "160": [0, 0, 0, 0, 0.25],
    "915": [0, 0.68333, 0.13889, 0.08334, 0.61528],
    "916": [0, 0.68333, 0, 0.16667, 0.83334],
    "920": [0, 0.68333, 0.02778, 0.08334, 0.76278],
    "923": [0, 0.68333, 0, 0.16667, 0.69445],
    "926": [0, 0.68333, 0.07569, 0.08334, 0.74236],
    "928": [0, 0.68333, 0.08125, 0.05556, 0.83125],
    "931": [0, 0.68333, 0.05764, 0.08334, 0.77986],
    "933": [0, 0.68333, 0.13889, 0.05556, 0.58333],
    "934": [0, 0.68333, 0, 0.08334, 0.66667],
    "936": [0, 0.68333, 0.11, 0.05556, 0.61222],
    "937": [0, 0.68333, 0.05017, 0.08334, 0.7724],
    "945": [0, 0.43056, 0.0037, 0.02778, 0.6397],
    "946": [0.19444, 0.69444, 0.05278, 0.08334, 0.56563],
    "947": [0.19444, 0.43056, 0.05556, 0, 0.51773],
    "948": [0, 0.69444, 0.03785, 0.05556, 0.44444],
    "949": [0, 0.43056, 0, 0.08334, 0.46632],
    "950": [0.19444, 0.69444, 0.07378, 0.08334, 0.4375],
    "951": [0.19444, 0.43056, 0.03588, 0.05556, 0.49653],
    "952": [0, 0.69444, 0.02778, 0.08334, 0.46944],
    "953": [0, 0.43056, 0, 0.05556, 0.35394],
    "954": [0, 0.43056, 0, 0, 0.57616],
    "955": [0, 0.69444, 0, 0, 0.58334],
    "956": [0.19444, 0.43056, 0, 0.02778, 0.60255],
    "957": [0, 0.43056, 0.06366, 0.02778, 0.49398],
    "958": [0.19444, 0.69444, 0.04601, 0.11111, 0.4375],
    "959": [0, 0.43056, 0, 0.05556, 0.48472],
    "960": [0, 0.43056, 0.03588, 0, 0.57003],
    "961": [0.19444, 0.43056, 0, 0.08334, 0.51702],
    "962": [0.09722, 0.43056, 0.07986, 0.08334, 0.36285],
    "963": [0, 0.43056, 0.03588, 0, 0.57141],
    "964": [0, 0.43056, 0.1132, 0.02778, 0.43715],
    "965": [0, 0.43056, 0.03588, 0.02778, 0.54028],
    "966": [0.19444, 0.43056, 0, 0.08334, 0.65417],
    "967": [0.19444, 0.43056, 0, 0.05556, 0.62569],
    "968": [0.19444, 0.69444, 0.03588, 0.11111, 0.65139],
    "969": [0, 0.43056, 0.03588, 0, 0.62245],
    "977": [0, 0.69444, 0, 0.08334, 0.59144],
    "981": [0.19444, 0.69444, 0, 0.08334, 0.59583],
    "982": [0, 0.43056, 0.02778, 0, 0.82813],
    "1009": [0.19444, 0.43056, 0, 0.08334, 0.51702],
    "1013": [0, 0.43056, 0, 0.05556, 0.4059],
    "57649": [0, 0.43056, 0, 0.02778, 0.32246],
    "57911": [0.19444, 0.43056, 0, 0.08334, 0.38403]
  },
  "SansSerif-Bold": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69444, 0, 0, 0.36667],
    "34": [0, 0.69444, 0, 0, 0.55834],
    "35": [0.19444, 0.69444, 0, 0, 0.91667],
    "36": [0.05556, 0.75, 0, 0, 0.55],
    "37": [0.05556, 0.75, 0, 0, 1.02912],
    "38": [0, 0.69444, 0, 0, 0.83056],
    "39": [0, 0.69444, 0, 0, 0.30556],
    "40": [0.25, 0.75, 0, 0, 0.42778],
    "41": [0.25, 0.75, 0, 0, 0.42778],
    "42": [0, 0.75, 0, 0, 0.55],
    "43": [0.11667, 0.61667, 0, 0, 0.85556],
    "44": [0.10556, 0.13056, 0, 0, 0.30556],
    "45": [0, 0.45833, 0, 0, 0.36667],
    "46": [0, 0.13056, 0, 0, 0.30556],
    "47": [0.25, 0.75, 0, 0, 0.55],
    "48": [0, 0.69444, 0, 0, 0.55],
    "49": [0, 0.69444, 0, 0, 0.55],
    "50": [0, 0.69444, 0, 0, 0.55],
    "51": [0, 0.69444, 0, 0, 0.55],
    "52": [0, 0.69444, 0, 0, 0.55],
    "53": [0, 0.69444, 0, 0, 0.55],
    "54": [0, 0.69444, 0, 0, 0.55],
    "55": [0, 0.69444, 0, 0, 0.55],
    "56": [0, 0.69444, 0, 0, 0.55],
    "57": [0, 0.69444, 0, 0, 0.55],
    "58": [0, 0.45833, 0, 0, 0.30556],
    "59": [0.10556, 0.45833, 0, 0, 0.30556],
    "61": [-0.09375, 0.40625, 0, 0, 0.85556],
    "63": [0, 0.69444, 0, 0, 0.51945],
    "64": [0, 0.69444, 0, 0, 0.73334],
    "65": [0, 0.69444, 0, 0, 0.73334],
    "66": [0, 0.69444, 0, 0, 0.73334],
    "67": [0, 0.69444, 0, 0, 0.70278],
    "68": [0, 0.69444, 0, 0, 0.79445],
    "69": [0, 0.69444, 0, 0, 0.64167],
    "70": [0, 0.69444, 0, 0, 0.61111],
    "71": [0, 0.69444, 0, 0, 0.73334],
    "72": [0, 0.69444, 0, 0, 0.79445],
    "73": [0, 0.69444, 0, 0, 0.33056],
    "74": [0, 0.69444, 0, 0, 0.51945],
    "75": [0, 0.69444, 0, 0, 0.76389],
    "76": [0, 0.69444, 0, 0, 0.58056],
    "77": [0, 0.69444, 0, 0, 0.97778],
    "78": [0, 0.69444, 0, 0, 0.79445],
    "79": [0, 0.69444, 0, 0, 0.79445],
    "80": [0, 0.69444, 0, 0, 0.70278],
    "81": [0.10556, 0.69444, 0, 0, 0.79445],
    "82": [0, 0.69444, 0, 0, 0.70278],
    "83": [0, 0.69444, 0, 0, 0.61111],
    "84": [0, 0.69444, 0, 0, 0.73334],
    "85": [0, 0.69444, 0, 0, 0.76389],
    "86": [0, 0.69444, 0.01528, 0, 0.73334],
    "87": [0, 0.69444, 0.01528, 0, 1.03889],
    "88": [0, 0.69444, 0, 0, 0.73334],
    "89": [0, 0.69444, 0.0275, 0, 0.73334],
    "90": [0, 0.69444, 0, 0, 0.67223],
    "91": [0.25, 0.75, 0, 0, 0.34306],
    "93": [0.25, 0.75, 0, 0, 0.34306],
    "94": [0, 0.69444, 0, 0, 0.55],
    "95": [0.35, 0.10833, 0.03056, 0, 0.55],
    "97": [0, 0.45833, 0, 0, 0.525],
    "98": [0, 0.69444, 0, 0, 0.56111],
    "99": [0, 0.45833, 0, 0, 0.48889],
    "100": [0, 0.69444, 0, 0, 0.56111],
    "101": [0, 0.45833, 0, 0, 0.51111],
    "102": [0, 0.69444, 0.07639, 0, 0.33611],
    "103": [0.19444, 0.45833, 0.01528, 0, 0.55],
    "104": [0, 0.69444, 0, 0, 0.56111],
    "105": [0, 0.69444, 0, 0, 0.25556],
    "106": [0.19444, 0.69444, 0, 0, 0.28611],
    "107": [0, 0.69444, 0, 0, 0.53056],
    "108": [0, 0.69444, 0, 0, 0.25556],
    "109": [0, 0.45833, 0, 0, 0.86667],
    "110": [0, 0.45833, 0, 0, 0.56111],
    "111": [0, 0.45833, 0, 0, 0.55],
    "112": [0.19444, 0.45833, 0, 0, 0.56111],
    "113": [0.19444, 0.45833, 0, 0, 0.56111],
    "114": [0, 0.45833, 0.01528, 0, 0.37222],
    "115": [0, 0.45833, 0, 0, 0.42167],
    "116": [0, 0.58929, 0, 0, 0.40417],
    "117": [0, 0.45833, 0, 0, 0.56111],
    "118": [0, 0.45833, 0.01528, 0, 0.5],
    "119": [0, 0.45833, 0.01528, 0, 0.74445],
    "120": [0, 0.45833, 0, 0, 0.5],
    "121": [0.19444, 0.45833, 0.01528, 0, 0.5],
    "122": [0, 0.45833, 0, 0, 0.47639],
    "126": [0.35, 0.34444, 0, 0, 0.55],
    "160": [0, 0, 0, 0, 0.25],
    "168": [0, 0.69444, 0, 0, 0.55],
    "176": [0, 0.69444, 0, 0, 0.73334],
    "180": [0, 0.69444, 0, 0, 0.55],
    "184": [0.17014, 0, 0, 0, 0.48889],
    "305": [0, 0.45833, 0, 0, 0.25556],
    "567": [0.19444, 0.45833, 0, 0, 0.28611],
    "710": [0, 0.69444, 0, 0, 0.55],
    "711": [0, 0.63542, 0, 0, 0.55],
    "713": [0, 0.63778, 0, 0, 0.55],
    "728": [0, 0.69444, 0, 0, 0.55],
    "729": [0, 0.69444, 0, 0, 0.30556],
    "730": [0, 0.69444, 0, 0, 0.73334],
    "732": [0, 0.69444, 0, 0, 0.55],
    "733": [0, 0.69444, 0, 0, 0.55],
    "915": [0, 0.69444, 0, 0, 0.58056],
    "916": [0, 0.69444, 0, 0, 0.91667],
    "920": [0, 0.69444, 0, 0, 0.85556],
    "923": [0, 0.69444, 0, 0, 0.67223],
    "926": [0, 0.69444, 0, 0, 0.73334],
    "928": [0, 0.69444, 0, 0, 0.79445],
    "931": [0, 0.69444, 0, 0, 0.79445],
    "933": [0, 0.69444, 0, 0, 0.85556],
    "934": [0, 0.69444, 0, 0, 0.79445],
    "936": [0, 0.69444, 0, 0, 0.85556],
    "937": [0, 0.69444, 0, 0, 0.79445],
    "8211": [0, 0.45833, 0.03056, 0, 0.55],
    "8212": [0, 0.45833, 0.03056, 0, 1.10001],
    "8216": [0, 0.69444, 0, 0, 0.30556],
    "8217": [0, 0.69444, 0, 0, 0.30556],
    "8220": [0, 0.69444, 0, 0, 0.55834],
    "8221": [0, 0.69444, 0, 0, 0.55834]
  },
  "SansSerif-Italic": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69444, 0.05733, 0, 0.31945],
    "34": [0, 0.69444, 0.00316, 0, 0.5],
    "35": [0.19444, 0.69444, 0.05087, 0, 0.83334],
    "36": [0.05556, 0.75, 0.11156, 0, 0.5],
    "37": [0.05556, 0.75, 0.03126, 0, 0.83334],
    "38": [0, 0.69444, 0.03058, 0, 0.75834],
    "39": [0, 0.69444, 0.07816, 0, 0.27778],
    "40": [0.25, 0.75, 0.13164, 0, 0.38889],
    "41": [0.25, 0.75, 0.02536, 0, 0.38889],
    "42": [0, 0.75, 0.11775, 0, 0.5],
    "43": [0.08333, 0.58333, 0.02536, 0, 0.77778],
    "44": [0.125, 0.08333, 0, 0, 0.27778],
    "45": [0, 0.44444, 0.01946, 0, 0.33333],
    "46": [0, 0.08333, 0, 0, 0.27778],
    "47": [0.25, 0.75, 0.13164, 0, 0.5],
    "48": [0, 0.65556, 0.11156, 0, 0.5],
    "49": [0, 0.65556, 0.11156, 0, 0.5],
    "50": [0, 0.65556, 0.11156, 0, 0.5],
    "51": [0, 0.65556, 0.11156, 0, 0.5],
    "52": [0, 0.65556, 0.11156, 0, 0.5],
    "53": [0, 0.65556, 0.11156, 0, 0.5],
    "54": [0, 0.65556, 0.11156, 0, 0.5],
    "55": [0, 0.65556, 0.11156, 0, 0.5],
    "56": [0, 0.65556, 0.11156, 0, 0.5],
    "57": [0, 0.65556, 0.11156, 0, 0.5],
    "58": [0, 0.44444, 0.02502, 0, 0.27778],
    "59": [0.125, 0.44444, 0.02502, 0, 0.27778],
    "61": [-0.13, 0.37, 0.05087, 0, 0.77778],
    "63": [0, 0.69444, 0.11809, 0, 0.47222],
    "64": [0, 0.69444, 0.07555, 0, 0.66667],
    "65": [0, 0.69444, 0, 0, 0.66667],
    "66": [0, 0.69444, 0.08293, 0, 0.66667],
    "67": [0, 0.69444, 0.11983, 0, 0.63889],
    "68": [0, 0.69444, 0.07555, 0, 0.72223],
    "69": [0, 0.69444, 0.11983, 0, 0.59722],
    "70": [0, 0.69444, 0.13372, 0, 0.56945],
    "71": [0, 0.69444, 0.11983, 0, 0.66667],
    "72": [0, 0.69444, 0.08094, 0, 0.70834],
    "73": [0, 0.69444, 0.13372, 0, 0.27778],
    "74": [0, 0.69444, 0.08094, 0, 0.47222],
    "75": [0, 0.69444, 0.11983, 0, 0.69445],
    "76": [0, 0.69444, 0, 0, 0.54167],
    "77": [0, 0.69444, 0.08094, 0, 0.875],
    "78": [0, 0.69444, 0.08094, 0, 0.70834],
    "79": [0, 0.69444, 0.07555, 0, 0.73611],
    "80": [0, 0.69444, 0.08293, 0, 0.63889],
    "81": [0.125, 0.69444, 0.07555, 0, 0.73611],
    "82": [0, 0.69444, 0.08293, 0, 0.64584],
    "83": [0, 0.69444, 0.09205, 0, 0.55556],
    "84": [0, 0.69444, 0.13372, 0, 0.68056],
    "85": [0, 0.69444, 0.08094, 0, 0.6875],
    "86": [0, 0.69444, 0.1615, 0, 0.66667],
    "87": [0, 0.69444, 0.1615, 0, 0.94445],
    "88": [0, 0.69444, 0.13372, 0, 0.66667],
    "89": [0, 0.69444, 0.17261, 0, 0.66667],
    "90": [0, 0.69444, 0.11983, 0, 0.61111],
    "91": [0.25, 0.75, 0.15942, 0, 0.28889],
    "93": [0.25, 0.75, 0.08719, 0, 0.28889],
    "94": [0, 0.69444, 0.0799, 0, 0.5],
    "95": [0.35, 0.09444, 0.08616, 0, 0.5],
    "97": [0, 0.44444, 0.00981, 0, 0.48056],
    "98": [0, 0.69444, 0.03057, 0, 0.51667],
    "99": [0, 0.44444, 0.08336, 0, 0.44445],
    "100": [0, 0.69444, 0.09483, 0, 0.51667],
    "101": [0, 0.44444, 0.06778, 0, 0.44445],
    "102": [0, 0.69444, 0.21705, 0, 0.30556],
    "103": [0.19444, 0.44444, 0.10836, 0, 0.5],
    "104": [0, 0.69444, 0.01778, 0, 0.51667],
    "105": [0, 0.67937, 0.09718, 0, 0.23889],
    "106": [0.19444, 0.67937, 0.09162, 0, 0.26667],
    "107": [0, 0.69444, 0.08336, 0, 0.48889],
    "108": [0, 0.69444, 0.09483, 0, 0.23889],
    "109": [0, 0.44444, 0.01778, 0, 0.79445],
    "110": [0, 0.44444, 0.01778, 0, 0.51667],
    "111": [0, 0.44444, 0.06613, 0, 0.5],
    "112": [0.19444, 0.44444, 0.0389, 0, 0.51667],
    "113": [0.19444, 0.44444, 0.04169, 0, 0.51667],
    "114": [0, 0.44444, 0.10836, 0, 0.34167],
    "115": [0, 0.44444, 0.0778, 0, 0.38333],
    "116": [0, 0.57143, 0.07225, 0, 0.36111],
    "117": [0, 0.44444, 0.04169, 0, 0.51667],
    "118": [0, 0.44444, 0.10836, 0, 0.46111],
    "119": [0, 0.44444, 0.10836, 0, 0.68334],
    "120": [0, 0.44444, 0.09169, 0, 0.46111],
    "121": [0.19444, 0.44444, 0.10836, 0, 0.46111],
    "122": [0, 0.44444, 0.08752, 0, 0.43472],
    "126": [0.35, 0.32659, 0.08826, 0, 0.5],
    "160": [0, 0, 0, 0, 0.25],
    "168": [0, 0.67937, 0.06385, 0, 0.5],
    "176": [0, 0.69444, 0, 0, 0.73752],
    "184": [0.17014, 0, 0, 0, 0.44445],
    "305": [0, 0.44444, 0.04169, 0, 0.23889],
    "567": [0.19444, 0.44444, 0.04169, 0, 0.26667],
    "710": [0, 0.69444, 0.0799, 0, 0.5],
    "711": [0, 0.63194, 0.08432, 0, 0.5],
    "713": [0, 0.60889, 0.08776, 0, 0.5],
    "714": [0, 0.69444, 0.09205, 0, 0.5],
    "715": [0, 0.69444, 0, 0, 0.5],
    "728": [0, 0.69444, 0.09483, 0, 0.5],
    "729": [0, 0.67937, 0.07774, 0, 0.27778],
    "730": [0, 0.69444, 0, 0, 0.73752],
    "732": [0, 0.67659, 0.08826, 0, 0.5],
    "733": [0, 0.69444, 0.09205, 0, 0.5],
    "915": [0, 0.69444, 0.13372, 0, 0.54167],
    "916": [0, 0.69444, 0, 0, 0.83334],
    "920": [0, 0.69444, 0.07555, 0, 0.77778],
    "923": [0, 0.69444, 0, 0, 0.61111],
    "926": [0, 0.69444, 0.12816, 0, 0.66667],
    "928": [0, 0.69444, 0.08094, 0, 0.70834],
    "931": [0, 0.69444, 0.11983, 0, 0.72222],
    "933": [0, 0.69444, 0.09031, 0, 0.77778],
    "934": [0, 0.69444, 0.04603, 0, 0.72222],
    "936": [0, 0.69444, 0.09031, 0, 0.77778],
    "937": [0, 0.69444, 0.08293, 0, 0.72222],
    "8211": [0, 0.44444, 0.08616, 0, 0.5],
    "8212": [0, 0.44444, 0.08616, 0, 1],
    "8216": [0, 0.69444, 0.07816, 0, 0.27778],
    "8217": [0, 0.69444, 0.07816, 0, 0.27778],
    "8220": [0, 0.69444, 0.14205, 0, 0.5],
    "8221": [0, 0.69444, 0.00316, 0, 0.5]
  },
  "SansSerif-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "33": [0, 0.69444, 0, 0, 0.31945],
    "34": [0, 0.69444, 0, 0, 0.5],
    "35": [0.19444, 0.69444, 0, 0, 0.83334],
    "36": [0.05556, 0.75, 0, 0, 0.5],
    "37": [0.05556, 0.75, 0, 0, 0.83334],
    "38": [0, 0.69444, 0, 0, 0.75834],
    "39": [0, 0.69444, 0, 0, 0.27778],
    "40": [0.25, 0.75, 0, 0, 0.38889],
    "41": [0.25, 0.75, 0, 0, 0.38889],
    "42": [0, 0.75, 0, 0, 0.5],
    "43": [0.08333, 0.58333, 0, 0, 0.77778],
    "44": [0.125, 0.08333, 0, 0, 0.27778],
    "45": [0, 0.44444, 0, 0, 0.33333],
    "46": [0, 0.08333, 0, 0, 0.27778],
    "47": [0.25, 0.75, 0, 0, 0.5],
    "48": [0, 0.65556, 0, 0, 0.5],
    "49": [0, 0.65556, 0, 0, 0.5],
    "50": [0, 0.65556, 0, 0, 0.5],
    "51": [0, 0.65556, 0, 0, 0.5],
    "52": [0, 0.65556, 0, 0, 0.5],
    "53": [0, 0.65556, 0, 0, 0.5],
    "54": [0, 0.65556, 0, 0, 0.5],
    "55": [0, 0.65556, 0, 0, 0.5],
    "56": [0, 0.65556, 0, 0, 0.5],
    "57": [0, 0.65556, 0, 0, 0.5],
    "58": [0, 0.44444, 0, 0, 0.27778],
    "59": [0.125, 0.44444, 0, 0, 0.27778],
    "61": [-0.13, 0.37, 0, 0, 0.77778],
    "63": [0, 0.69444, 0, 0, 0.47222],
    "64": [0, 0.69444, 0, 0, 0.66667],
    "65": [0, 0.69444, 0, 0, 0.66667],
    "66": [0, 0.69444, 0, 0, 0.66667],
    "67": [0, 0.69444, 0, 0, 0.63889],
    "68": [0, 0.69444, 0, 0, 0.72223],
    "69": [0, 0.69444, 0, 0, 0.59722],
    "70": [0, 0.69444, 0, 0, 0.56945],
    "71": [0, 0.69444, 0, 0, 0.66667],
    "72": [0, 0.69444, 0, 0, 0.70834],
    "73": [0, 0.69444, 0, 0, 0.27778],
    "74": [0, 0.69444, 0, 0, 0.47222],
    "75": [0, 0.69444, 0, 0, 0.69445],
    "76": [0, 0.69444, 0, 0, 0.54167],
    "77": [0, 0.69444, 0, 0, 0.875],
    "78": [0, 0.69444, 0, 0, 0.70834],
    "79": [0, 0.69444, 0, 0, 0.73611],
    "80": [0, 0.69444, 0, 0, 0.63889],
    "81": [0.125, 0.69444, 0, 0, 0.73611],
    "82": [0, 0.69444, 0, 0, 0.64584],
    "83": [0, 0.69444, 0, 0, 0.55556],
    "84": [0, 0.69444, 0, 0, 0.68056],
    "85": [0, 0.69444, 0, 0, 0.6875],
    "86": [0, 0.69444, 0.01389, 0, 0.66667],
    "87": [0, 0.69444, 0.01389, 0, 0.94445],
    "88": [0, 0.69444, 0, 0, 0.66667],
    "89": [0, 0.69444, 0.025, 0, 0.66667],
    "90": [0, 0.69444, 0, 0, 0.61111],
    "91": [0.25, 0.75, 0, 0, 0.28889],
    "93": [0.25, 0.75, 0, 0, 0.28889],
    "94": [0, 0.69444, 0, 0, 0.5],
    "95": [0.35, 0.09444, 0.02778, 0, 0.5],
    "97": [0, 0.44444, 0, 0, 0.48056],
    "98": [0, 0.69444, 0, 0, 0.51667],
    "99": [0, 0.44444, 0, 0, 0.44445],
    "100": [0, 0.69444, 0, 0, 0.51667],
    "101": [0, 0.44444, 0, 0, 0.44445],
    "102": [0, 0.69444, 0.06944, 0, 0.30556],
    "103": [0.19444, 0.44444, 0.01389, 0, 0.5],
    "104": [0, 0.69444, 0, 0, 0.51667],
    "105": [0, 0.67937, 0, 0, 0.23889],
    "106": [0.19444, 0.67937, 0, 0, 0.26667],
    "107": [0, 0.69444, 0, 0, 0.48889],
    "108": [0, 0.69444, 0, 0, 0.23889],
    "109": [0, 0.44444, 0, 0, 0.79445],
    "110": [0, 0.44444, 0, 0, 0.51667],
    "111": [0, 0.44444, 0, 0, 0.5],
    "112": [0.19444, 0.44444, 0, 0, 0.51667],
    "113": [0.19444, 0.44444, 0, 0, 0.51667],
    "114": [0, 0.44444, 0.01389, 0, 0.34167],
    "115": [0, 0.44444, 0, 0, 0.38333],
    "116": [0, 0.57143, 0, 0, 0.36111],
    "117": [0, 0.44444, 0, 0, 0.51667],
    "118": [0, 0.44444, 0.01389, 0, 0.46111],
    "119": [0, 0.44444, 0.01389, 0, 0.68334],
    "120": [0, 0.44444, 0, 0, 0.46111],
    "121": [0.19444, 0.44444, 0.01389, 0, 0.46111],
    "122": [0, 0.44444, 0, 0, 0.43472],
    "126": [0.35, 0.32659, 0, 0, 0.5],
    "160": [0, 0, 0, 0, 0.25],
    "168": [0, 0.67937, 0, 0, 0.5],
    "176": [0, 0.69444, 0, 0, 0.66667],
    "184": [0.17014, 0, 0, 0, 0.44445],
    "305": [0, 0.44444, 0, 0, 0.23889],
    "567": [0.19444, 0.44444, 0, 0, 0.26667],
    "710": [0, 0.69444, 0, 0, 0.5],
    "711": [0, 0.63194, 0, 0, 0.5],
    "713": [0, 0.60889, 0, 0, 0.5],
    "714": [0, 0.69444, 0, 0, 0.5],
    "715": [0, 0.69444, 0, 0, 0.5],
    "728": [0, 0.69444, 0, 0, 0.5],
    "729": [0, 0.67937, 0, 0, 0.27778],
    "730": [0, 0.69444, 0, 0, 0.66667],
    "732": [0, 0.67659, 0, 0, 0.5],
    "733": [0, 0.69444, 0, 0, 0.5],
    "915": [0, 0.69444, 0, 0, 0.54167],
    "916": [0, 0.69444, 0, 0, 0.83334],
    "920": [0, 0.69444, 0, 0, 0.77778],
    "923": [0, 0.69444, 0, 0, 0.61111],
    "926": [0, 0.69444, 0, 0, 0.66667],
    "928": [0, 0.69444, 0, 0, 0.70834],
    "931": [0, 0.69444, 0, 0, 0.72222],
    "933": [0, 0.69444, 0, 0, 0.77778],
    "934": [0, 0.69444, 0, 0, 0.72222],
    "936": [0, 0.69444, 0, 0, 0.77778],
    "937": [0, 0.69444, 0, 0, 0.72222],
    "8211": [0, 0.44444, 0.02778, 0, 0.5],
    "8212": [0, 0.44444, 0.02778, 0, 1],
    "8216": [0, 0.69444, 0, 0, 0.27778],
    "8217": [0, 0.69444, 0, 0, 0.27778],
    "8220": [0, 0.69444, 0, 0, 0.5],
    "8221": [0, 0.69444, 0, 0, 0.5]
  },
  "Script-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "65": [0, 0.7, 0.22925, 0, 0.80253],
    "66": [0, 0.7, 0.04087, 0, 0.90757],
    "67": [0, 0.7, 0.1689, 0, 0.66619],
    "68": [0, 0.7, 0.09371, 0, 0.77443],
    "69": [0, 0.7, 0.18583, 0, 0.56162],
    "70": [0, 0.7, 0.13634, 0, 0.89544],
    "71": [0, 0.7, 0.17322, 0, 0.60961],
    "72": [0, 0.7, 0.29694, 0, 0.96919],
    "73": [0, 0.7, 0.19189, 0, 0.80907],
    "74": [0.27778, 0.7, 0.19189, 0, 1.05159],
    "75": [0, 0.7, 0.31259, 0, 0.91364],
    "76": [0, 0.7, 0.19189, 0, 0.87373],
    "77": [0, 0.7, 0.15981, 0, 1.08031],
    "78": [0, 0.7, 0.3525, 0, 0.9015],
    "79": [0, 0.7, 0.08078, 0, 0.73787],
    "80": [0, 0.7, 0.08078, 0, 1.01262],
    "81": [0, 0.7, 0.03305, 0, 0.88282],
    "82": [0, 0.7, 0.06259, 0, 0.85],
    "83": [0, 0.7, 0.19189, 0, 0.86767],
    "84": [0, 0.7, 0.29087, 0, 0.74697],
    "85": [0, 0.7, 0.25815, 0, 0.79996],
    "86": [0, 0.7, 0.27523, 0, 0.62204],
    "87": [0, 0.7, 0.27523, 0, 0.80532],
    "88": [0, 0.7, 0.26006, 0, 0.94445],
    "89": [0, 0.7, 0.2939, 0, 0.70961],
    "90": [0, 0.7, 0.24037, 0, 0.8212],
    "160": [0, 0, 0, 0, 0.25]
  },
  "Size1-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "40": [0.35001, 0.85, 0, 0, 0.45834],
    "41": [0.35001, 0.85, 0, 0, 0.45834],
    "47": [0.35001, 0.85, 0, 0, 0.57778],
    "91": [0.35001, 0.85, 0, 0, 0.41667],
    "92": [0.35001, 0.85, 0, 0, 0.57778],
    "93": [0.35001, 0.85, 0, 0, 0.41667],
    "123": [0.35001, 0.85, 0, 0, 0.58334],
    "125": [0.35001, 0.85, 0, 0, 0.58334],
    "160": [0, 0, 0, 0, 0.25],
    "710": [0, 0.72222, 0, 0, 0.55556],
    "732": [0, 0.72222, 0, 0, 0.55556],
    "770": [0, 0.72222, 0, 0, 0.55556],
    "771": [0, 0.72222, 0, 0, 0.55556],
    "8214": [-0.00099, 0.601, 0, 0, 0.77778],
    "8593": [0.00001, 0.6, 0, 0, 0.66667],
    "8595": [0.00001, 0.6, 0, 0, 0.66667],
    "8657": [0.00001, 0.6, 0, 0, 0.77778],
    "8659": [0.00001, 0.6, 0, 0, 0.77778],
    "8719": [0.25001, 0.75, 0, 0, 0.94445],
    "8720": [0.25001, 0.75, 0, 0, 0.94445],
    "8721": [0.25001, 0.75, 0, 0, 1.05556],
    "8730": [0.35001, 0.85, 0, 0, 1],
    "8739": [-0.00599, 0.606, 0, 0, 0.33333],
    "8741": [-0.00599, 0.606, 0, 0, 0.55556],
    "8747": [0.30612, 0.805, 0.19445, 0, 0.47222],
    "8748": [0.306, 0.805, 0.19445, 0, 0.47222],
    "8749": [0.306, 0.805, 0.19445, 0, 0.47222],
    "8750": [0.30612, 0.805, 0.19445, 0, 0.47222],
    "8896": [0.25001, 0.75, 0, 0, 0.83334],
    "8897": [0.25001, 0.75, 0, 0, 0.83334],
    "8898": [0.25001, 0.75, 0, 0, 0.83334],
    "8899": [0.25001, 0.75, 0, 0, 0.83334],
    "8968": [0.35001, 0.85, 0, 0, 0.47222],
    "8969": [0.35001, 0.85, 0, 0, 0.47222],
    "8970": [0.35001, 0.85, 0, 0, 0.47222],
    "8971": [0.35001, 0.85, 0, 0, 0.47222],
    "9168": [-0.00099, 0.601, 0, 0, 0.66667],
    "10216": [0.35001, 0.85, 0, 0, 0.47222],
    "10217": [0.35001, 0.85, 0, 0, 0.47222],
    "10752": [0.25001, 0.75, 0, 0, 1.11111],
    "10753": [0.25001, 0.75, 0, 0, 1.11111],
    "10754": [0.25001, 0.75, 0, 0, 1.11111],
    "10756": [0.25001, 0.75, 0, 0, 0.83334],
    "10758": [0.25001, 0.75, 0, 0, 0.83334]
  },
  "Size2-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "40": [0.65002, 1.15, 0, 0, 0.59722],
    "41": [0.65002, 1.15, 0, 0, 0.59722],
    "47": [0.65002, 1.15, 0, 0, 0.81111],
    "91": [0.65002, 1.15, 0, 0, 0.47222],
    "92": [0.65002, 1.15, 0, 0, 0.81111],
    "93": [0.65002, 1.15, 0, 0, 0.47222],
    "123": [0.65002, 1.15, 0, 0, 0.66667],
    "125": [0.65002, 1.15, 0, 0, 0.66667],
    "160": [0, 0, 0, 0, 0.25],
    "710": [0, 0.75, 0, 0, 1],
    "732": [0, 0.75, 0, 0, 1],
    "770": [0, 0.75, 0, 0, 1],
    "771": [0, 0.75, 0, 0, 1],
    "8719": [0.55001, 1.05, 0, 0, 1.27778],
    "8720": [0.55001, 1.05, 0, 0, 1.27778],
    "8721": [0.55001, 1.05, 0, 0, 1.44445],
    "8730": [0.65002, 1.15, 0, 0, 1],
    "8747": [0.86225, 1.36, 0.44445, 0, 0.55556],
    "8748": [0.862, 1.36, 0.44445, 0, 0.55556],
    "8749": [0.862, 1.36, 0.44445, 0, 0.55556],
    "8750": [0.86225, 1.36, 0.44445, 0, 0.55556],
    "8896": [0.55001, 1.05, 0, 0, 1.11111],
    "8897": [0.55001, 1.05, 0, 0, 1.11111],
    "8898": [0.55001, 1.05, 0, 0, 1.11111],
    "8899": [0.55001, 1.05, 0, 0, 1.11111],
    "8968": [0.65002, 1.15, 0, 0, 0.52778],
    "8969": [0.65002, 1.15, 0, 0, 0.52778],
    "8970": [0.65002, 1.15, 0, 0, 0.52778],
    "8971": [0.65002, 1.15, 0, 0, 0.52778],
    "10216": [0.65002, 1.15, 0, 0, 0.61111],
    "10217": [0.65002, 1.15, 0, 0, 0.61111],
    "10752": [0.55001, 1.05, 0, 0, 1.51112],
    "10753": [0.55001, 1.05, 0, 0, 1.51112],
    "10754": [0.55001, 1.05, 0, 0, 1.51112],
    "10756": [0.55001, 1.05, 0, 0, 1.11111],
    "10758": [0.55001, 1.05, 0, 0, 1.11111]
  },
  "Size3-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "40": [0.95003, 1.45, 0, 0, 0.73611],
    "41": [0.95003, 1.45, 0, 0, 0.73611],
    "47": [0.95003, 1.45, 0, 0, 1.04445],
    "91": [0.95003, 1.45, 0, 0, 0.52778],
    "92": [0.95003, 1.45, 0, 0, 1.04445],
    "93": [0.95003, 1.45, 0, 0, 0.52778],
    "123": [0.95003, 1.45, 0, 0, 0.75],
    "125": [0.95003, 1.45, 0, 0, 0.75],
    "160": [0, 0, 0, 0, 0.25],
    "710": [0, 0.75, 0, 0, 1.44445],
    "732": [0, 0.75, 0, 0, 1.44445],
    "770": [0, 0.75, 0, 0, 1.44445],
    "771": [0, 0.75, 0, 0, 1.44445],
    "8730": [0.95003, 1.45, 0, 0, 1],
    "8968": [0.95003, 1.45, 0, 0, 0.58334],
    "8969": [0.95003, 1.45, 0, 0, 0.58334],
    "8970": [0.95003, 1.45, 0, 0, 0.58334],
    "8971": [0.95003, 1.45, 0, 0, 0.58334],
    "10216": [0.95003, 1.45, 0, 0, 0.75],
    "10217": [0.95003, 1.45, 0, 0, 0.75]
  },
  "Size4-Regular": {
    "32": [0, 0, 0, 0, 0.25],
    "40": [1.25003, 1.75, 0, 0, 0.79167],
    "41": [1.25003, 1.75, 0, 0, 0.79167],
    "47": [1.25003, 1.75, 0, 0, 1.27778],
    "91": [1.25003, 1.75, 0, 0, 0.58334],
    "92": [1.25003, 1.75, 0, 0, 1.27778],
    "93": [1.25003, 1.75, 0, 0, 0.58334],
    "123": [1.25003, 1.75, 0, 0, 0.80556],
    "125": [1.25003, 1.75, 0, 0, 0.80556],
    "160": [0, 0, 0, 0, 0.25],
    "710": [0, 0.825, 0, 0, 1.8889],
    "732": [0, 0.825, 0, 0, 1.8889],
    "770": [0, 0.825, 0, 0, 1.8889],
    "771": [0, 0.825, 0, 0, 1.8889],
    "8730": [1.25003, 1.75, 0, 0, 1],
    "8968": [1.25003, 1.75, 0, 0, 0.63889],
    "8969": [1.25003, 1.75, 0, 0, 0.63889],
    "8970": [1.25003, 1.75, 0, 0, 0.63889],
    "8971": [1.25003, 1.75, 0, 0, 0.63889],
    "9115": [0.64502, 1.155, 0, 0, 0.875],
    "9116": [0.00001, 0.6, 0, 0, 0.875],
    "9117": [0.64502, 1.155, 0, 0, 0.875],
    "9118": [0.64502, 1.155, 0, 0, 0.875],
    "9119": [0.00001, 0.6, 0, 0, 0.875],
    "9120": [0.64502, 1.155, 0, 0, 0.875],
    "9121": [0.64502, 1.155, 0, 0, 0.66667],
    "9122": [-0.00099, 0.601, 0, 0, 0.66667],
    "9123": [0.64502, 1.155, 0, 0, 0.66667],
    "9124": [0.64502, 1.155, 0, 0, 0.66667],
    "9125": [-0.00099, 0.601, 0, 0, 0.66667],
    "9126": [0.64502, 1.155, 0, 0, 0.66667],
    "9127": [0.00001, 0.9, 0, 0, 0.88889],
    "9128": [0.65002, 1.15, 0, 0, 0.88889],
    "9129": [0.90001, 0, 0, 0, 0.88889],
    "9130": [0, 0.3, 0, 0, 0.88889],
    "9131": [0.00001, 0.9, 0, 0, 0.88889],
    "9132": [0.65002, 1.15, 0, 0, 0.88889],
    "9133": [0.90001, 0, 0, 0, 0.88889],
    "9143": [0.88502, 0.915, 0, 0, 1.05556],
    "10216": [1.25003, 1.75, 0, 0, 0.80556],
    "10217": [1.25003, 1.75, 0, 0, 0.80556],
    "57344": [-0.00499, 0.605, 0, 0, 1.05556],
    "57345": [-0.00499, 0.605, 0, 0, 1.05556],
    "57680": [0, 0.12, 0, 0, 0.45],
    "57681": [0, 0.12, 0, 0, 0.45],
    "57682": [0, 0.12, 0, 0, 0.45],
    "57683": [0, 0.12, 0, 0, 0.45]
  },
  "Typewriter-Regular": {
    "32": [0, 0, 0, 0, 0.525],
    "33": [0, 0.61111, 0, 0, 0.525],
    "34": [0, 0.61111, 0, 0, 0.525],
    "35": [0, 0.61111, 0, 0, 0.525],
    "36": [0.08333, 0.69444, 0, 0, 0.525],
    "37": [0.08333, 0.69444, 0, 0, 0.525],
    "38": [0, 0.61111, 0, 0, 0.525],
    "39": [0, 0.61111, 0, 0, 0.525],
    "40": [0.08333, 0.69444, 0, 0, 0.525],
    "41": [0.08333, 0.69444, 0, 0, 0.525],
    "42": [0, 0.52083, 0, 0, 0.525],
    "43": [-0.08056, 0.53055, 0, 0, 0.525],
    "44": [0.13889, 0.125, 0, 0, 0.525],
    "45": [-0.08056, 0.53055, 0, 0, 0.525],
    "46": [0, 0.125, 0, 0, 0.525],
    "47": [0.08333, 0.69444, 0, 0, 0.525],
    "48": [0, 0.61111, 0, 0, 0.525],
    "49": [0, 0.61111, 0, 0, 0.525],
    "50": [0, 0.61111, 0, 0, 0.525],
    "51": [0, 0.61111, 0, 0, 0.525],
    "52": [0, 0.61111, 0, 0, 0.525],
    "53": [0, 0.61111, 0, 0, 0.525],
    "54": [0, 0.61111, 0, 0, 0.525],
    "55": [0, 0.61111, 0, 0, 0.525],
    "56": [0, 0.61111, 0, 0, 0.525],
    "57": [0, 0.61111, 0, 0, 0.525],
    "58": [0, 0.43056, 0, 0, 0.525],
    "59": [0.13889, 0.43056, 0, 0, 0.525],
    "60": [-0.05556, 0.55556, 0, 0, 0.525],
    "61": [-0.19549, 0.41562, 0, 0, 0.525],
    "62": [-0.05556, 0.55556, 0, 0, 0.525],
    "63": [0, 0.61111, 0, 0, 0.525],
    "64": [0, 0.61111, 0, 0, 0.525],
    "65": [0, 0.61111, 0, 0, 0.525],
    "66": [0, 0.61111, 0, 0, 0.525],
    "67": [0, 0.61111, 0, 0, 0.525],
    "68": [0, 0.61111, 0, 0, 0.525],
    "69": [0, 0.61111, 0, 0, 0.525],
    "70": [0, 0.61111, 0, 0, 0.525],
    "71": [0, 0.61111, 0, 0, 0.525],
    "72": [0, 0.61111, 0, 0, 0.525],
    "73": [0, 0.61111, 0, 0, 0.525],
    "74": [0, 0.61111, 0, 0, 0.525],
    "75": [0, 0.61111, 0, 0, 0.525],
    "76": [0, 0.61111, 0, 0, 0.525],
    "77": [0, 0.61111, 0, 0, 0.525],
    "78": [0, 0.61111, 0, 0, 0.525],
    "79": [0, 0.61111, 0, 0, 0.525],
    "80": [0, 0.61111, 0, 0, 0.525],
    "81": [0.13889, 0.61111, 0, 0, 0.525],
    "82": [0, 0.61111, 0, 0, 0.525],
    "83": [0, 0.61111, 0, 0, 0.525],
    "84": [0, 0.61111, 0, 0, 0.525],
    "85": [0, 0.61111, 0, 0, 0.525],
    "86": [0, 0.61111, 0, 0, 0.525],
    "87": [0, 0.61111, 0, 0, 0.525],
    "88": [0, 0.61111, 0, 0, 0.525],
    "89": [0, 0.61111, 0, 0, 0.525],
    "90": [0, 0.61111, 0, 0, 0.525],
    "91": [0.08333, 0.69444, 0, 0, 0.525],
    "92": [0.08333, 0.69444, 0, 0, 0.525],
    "93": [0.08333, 0.69444, 0, 0, 0.525],
    "94": [0, 0.61111, 0, 0, 0.525],
    "95": [0.09514, 0, 0, 0, 0.525],
    "96": [0, 0.61111, 0, 0, 0.525],
    "97": [0, 0.43056, 0, 0, 0.525],
    "98": [0, 0.61111, 0, 0, 0.525],
    "99": [0, 0.43056, 0, 0, 0.525],
    "100": [0, 0.61111, 0, 0, 0.525],
    "101": [0, 0.43056, 0, 0, 0.525],
    "102": [0, 0.61111, 0, 0, 0.525],
    "103": [0.22222, 0.43056, 0, 0, 0.525],
    "104": [0, 0.61111, 0, 0, 0.525],
    "105": [0, 0.61111, 0, 0, 0.525],
    "106": [0.22222, 0.61111, 0, 0, 0.525],
    "107": [0, 0.61111, 0, 0, 0.525],
    "108": [0, 0.61111, 0, 0, 0.525],
    "109": [0, 0.43056, 0, 0, 0.525],
    "110": [0, 0.43056, 0, 0, 0.525],
    "111": [0, 0.43056, 0, 0, 0.525],
    "112": [0.22222, 0.43056, 0, 0, 0.525],
    "113": [0.22222, 0.43056, 0, 0, 0.525],
    "114": [0, 0.43056, 0, 0, 0.525],
    "115": [0, 0.43056, 0, 0, 0.525],
    "116": [0, 0.55358, 0, 0, 0.525],
    "117": [0, 0.43056, 0, 0, 0.525],
    "118": [0, 0.43056, 0, 0, 0.525],
    "119": [0, 0.43056, 0, 0, 0.525],
    "120": [0, 0.43056, 0, 0, 0.525],
    "121": [0.22222, 0.43056, 0, 0, 0.525],
    "122": [0, 0.43056, 0, 0, 0.525],
    "123": [0.08333, 0.69444, 0, 0, 0.525],
    "124": [0.08333, 0.69444, 0, 0, 0.525],
    "125": [0.08333, 0.69444, 0, 0, 0.525],
    "126": [0, 0.61111, 0, 0, 0.525],
    "127": [0, 0.61111, 0, 0, 0.525],
    "160": [0, 0, 0, 0, 0.525],
    "176": [0, 0.61111, 0, 0, 0.525],
    "184": [0.19445, 0, 0, 0, 0.525],
    "305": [0, 0.43056, 0, 0, 0.525],
    "567": [0.22222, 0.43056, 0, 0, 0.525],
    "711": [0, 0.56597, 0, 0, 0.525],
    "713": [0, 0.56555, 0, 0, 0.525],
    "714": [0, 0.61111, 0, 0, 0.525],
    "715": [0, 0.61111, 0, 0, 0.525],
    "728": [0, 0.61111, 0, 0, 0.525],
    "730": [0, 0.61111, 0, 0, 0.525],
    "770": [0, 0.61111, 0, 0, 0.525],
    "771": [0, 0.61111, 0, 0, 0.525],
    "776": [0, 0.61111, 0, 0, 0.525],
    "915": [0, 0.61111, 0, 0, 0.525],
    "916": [0, 0.61111, 0, 0, 0.525],
    "920": [0, 0.61111, 0, 0, 0.525],
    "923": [0, 0.61111, 0, 0, 0.525],
    "926": [0, 0.61111, 0, 0, 0.525],
    "928": [0, 0.61111, 0, 0, 0.525],
    "931": [0, 0.61111, 0, 0, 0.525],
    "933": [0, 0.61111, 0, 0, 0.525],
    "934": [0, 0.61111, 0, 0, 0.525],
    "936": [0, 0.61111, 0, 0, 0.525],
    "937": [0, 0.61111, 0, 0, 0.525],
    "8216": [0, 0.61111, 0, 0, 0.525],
    "8217": [0, 0.61111, 0, 0, 0.525],
    "8242": [0, 0.61111, 0, 0, 0.525],
    "9251": [0.11111, 0.21944, 0, 0, 0.525]
  }
};
var sigmasAndXis = {
  slant: [0.25, 0.25, 0.25],
  space: [0, 0, 0],
  stretch: [0, 0, 0],
  shrink: [0, 0, 0],
  xHeight: [0.431, 0.431, 0.431],
  quad: [1, 1.171, 1.472],
  extraSpace: [0, 0, 0],
  num1: [0.677, 0.732, 0.925],
  num2: [0.394, 0.384, 0.387],
  num3: [0.444, 0.471, 0.504],
  denom1: [0.686, 0.752, 1.025],
  denom2: [0.345, 0.344, 0.532],
  sup1: [0.413, 0.503, 0.504],
  sup2: [0.363, 0.431, 0.404],
  sup3: [0.289, 0.286, 0.294],
  sub1: [0.15, 0.143, 0.2],
  sub2: [0.247, 0.286, 0.4],
  supDrop: [0.386, 0.353, 0.494],
  subDrop: [0.05, 0.071, 0.1],
  delim1: [2.39, 1.7, 1.98],
  delim2: [1.01, 1.157, 1.42],
  axisHeight: [0.25, 0.25, 0.25],
  defaultRuleThickness: [0.04, 0.049, 0.049],
  bigOpSpacing1: [0.111, 0.111, 0.111],
  bigOpSpacing2: [0.166, 0.166, 0.166],
  bigOpSpacing3: [0.2, 0.2, 0.2],
  bigOpSpacing4: [0.6, 0.611, 0.611],
  bigOpSpacing5: [0.1, 0.143, 0.143],
  sqrtRuleThickness: [0.04, 0.04, 0.04],
  ptPerEm: [10, 10, 10],
  doubleRuleSep: [0.2, 0.2, 0.2],
  arrayRuleWidth: [0.04, 0.04, 0.04],
  fboxsep: [0.3, 0.3, 0.3],
  fboxrule: [0.04, 0.04, 0.04]
};
var extraCharacterMap = {
  Å: "A",
  Ð: "D",
  Þ: "o",
  å: "a",
  ð: "d",
  þ: "o",
  А: "A",
  Б: "B",
  В: "B",
  Г: "F",
  Д: "A",
  Е: "E",
  Ж: "K",
  З: "3",
  И: "N",
  Й: "N",
  К: "K",
  Л: "N",
  М: "M",
  Н: "H",
  О: "O",
  П: "N",
  Р: "P",
  С: "C",
  Т: "T",
  У: "y",
  Ф: "O",
  Х: "X",
  Ц: "U",
  Ч: "h",
  Ш: "W",
  Щ: "W",
  Ъ: "B",
  Ы: "X",
  Ь: "B",
  Э: "3",
  Ю: "X",
  Я: "R",
  а: "a",
  б: "b",
  в: "a",
  г: "r",
  д: "y",
  е: "e",
  ж: "m",
  з: "e",
  и: "n",
  й: "n",
  к: "n",
  л: "n",
  м: "m",
  н: "n",
  о: "o",
  п: "n",
  р: "p",
  с: "c",
  т: "o",
  у: "y",
  ф: "b",
  х: "x",
  ц: "n",
  ч: "n",
  ш: "w",
  щ: "w",
  ъ: "a",
  ы: "m",
  ь: "a",
  э: "e",
  ю: "m",
  я: "r"
};
function setFontMetrics(v177, v178) {
  fontMetricsData[v177] = v178;
}
function getCharacterMetrics(v179, v180, v181) {
  if (!fontMetricsData[v180]) {
    throw new Error("Font metrics not found for font: " + v180 + ".");
  }
  var v182 = v179.charCodeAt(0);
  var v183 = fontMetricsData[v180][v182];
  if (!v183 && v179[0] in extraCharacterMap) {
    v182 = extraCharacterMap[v179[0]].charCodeAt(0);
    v183 = fontMetricsData[v180][v182];
  }
  if (!v183 && v181 === "text") {
    if (supportedCodepoint(v182)) {
      v183 = fontMetricsData[v180][77];
    }
  }
  if (v183) {
    return {
      depth: v183[0],
      height: v183[1],
      italic: v183[2],
      skew: v183[3],
      width: v183[4]
    };
  }
}
var fontMetricsBySizeIndex = {};
function getGlobalMetrics(v184) {
  var v185;
  if (v184 >= 5) {
    v185 = 0;
  } else if (v184 >= 3) {
    v185 = 1;
  } else {
    v185 = 2;
  }
  if (!fontMetricsBySizeIndex[v185]) {
    var v186 = fontMetricsBySizeIndex[v185] = {
      cssEmPerMu: sigmasAndXis.quad[v185] / 18
    };
    for (var v187 in sigmasAndXis) {
      if (sigmasAndXis.hasOwnProperty(v187)) {
        v186[v187] = sigmasAndXis[v187][v185];
      }
    }
  }
  return fontMetricsBySizeIndex[v185];
}
var symbols = {
  math: {},
  text: {}
};
function defineSymbol(v188, v189, v190, v191, v192, v193) {
  symbols[v188][v192] = {
    font: v189,
    group: v190,
    replace: v191
  };
  if (v193 && v191) {
    symbols[v188][v191] = symbols[v188][v192];
  }
}
var math = "math";
var text = "text";
var main = "main";
var ams = "ams";
var accent = "accent-token";
var bin = "bin";
var close = "close";
var inner = "inner";
var mathord = "mathord";
var op = "op-token";
var open = "open";
var punct = "punct";
var rel = "rel";
var spacing = "spacing";
var textord = "textord";
defineSymbol(math, main, rel, "≡", "\\equiv", true);
defineSymbol(math, main, rel, "≺", "\\prec", true);
defineSymbol(math, main, rel, "≻", "\\succ", true);
defineSymbol(math, main, rel, "∼", "\\sim", true);
defineSymbol(math, main, rel, "⊥", "\\perp");
defineSymbol(math, main, rel, "⪯", "\\preceq", true);
defineSymbol(math, main, rel, "⪰", "\\succeq", true);
defineSymbol(math, main, rel, "≃", "\\simeq", true);
defineSymbol(math, main, rel, "∣", "\\mid", true);
defineSymbol(math, main, rel, "≪", "\\ll", true);
defineSymbol(math, main, rel, "≫", "\\gg", true);
defineSymbol(math, main, rel, "≍", "\\asymp", true);
defineSymbol(math, main, rel, "∥", "\\parallel");
defineSymbol(math, main, rel, "⋈", "\\bowtie", true);
defineSymbol(math, main, rel, "⌣", "\\smile", true);
defineSymbol(math, main, rel, "⊑", "\\sqsubseteq", true);
defineSymbol(math, main, rel, "⊒", "\\sqsupseteq", true);
defineSymbol(math, main, rel, "≐", "\\doteq", true);
defineSymbol(math, main, rel, "⌢", "\\frown", true);
defineSymbol(math, main, rel, "∋", "\\ni", true);
defineSymbol(math, main, rel, "∝", "\\propto", true);
defineSymbol(math, main, rel, "⊢", "\\vdash", true);
defineSymbol(math, main, rel, "⊣", "\\dashv", true);
defineSymbol(math, main, rel, "∋", "\\owns");
defineSymbol(math, main, punct, ".", "\\ldotp");
defineSymbol(math, main, punct, "⋅", "\\cdotp");
defineSymbol(math, main, punct, "⋅", "·");
defineSymbol(text, main, textord, "⋅", "·");
defineSymbol(math, main, textord, "#", "\\#");
defineSymbol(text, main, textord, "#", "\\#");
defineSymbol(math, main, textord, "&", "\\&");
defineSymbol(text, main, textord, "&", "\\&");
defineSymbol(math, main, textord, "ℵ", "\\aleph", true);
defineSymbol(math, main, textord, "∀", "\\forall", true);
defineSymbol(math, main, textord, "ℏ", "\\hbar", true);
defineSymbol(math, main, textord, "∃", "\\exists", true);
defineSymbol(math, main, textord, "∇", "\\nabla", true);
defineSymbol(math, main, textord, "♭", "\\flat", true);
defineSymbol(math, main, textord, "ℓ", "\\ell", true);
defineSymbol(math, main, textord, "♮", "\\natural", true);
defineSymbol(math, main, textord, "♣", "\\clubsuit", true);
defineSymbol(math, main, textord, "℘", "\\wp", true);
defineSymbol(math, main, textord, "♯", "\\sharp", true);
defineSymbol(math, main, textord, "♢", "\\diamondsuit", true);
defineSymbol(math, main, textord, "ℜ", "\\Re", true);
defineSymbol(math, main, textord, "♡", "\\heartsuit", true);
defineSymbol(math, main, textord, "ℑ", "\\Im", true);
defineSymbol(math, main, textord, "♠", "\\spadesuit", true);
defineSymbol(math, main, textord, "§", "\\S", true);
defineSymbol(text, main, textord, "§", "\\S");
defineSymbol(math, main, textord, "¶", "\\P", true);
defineSymbol(text, main, textord, "¶", "\\P");
defineSymbol(math, main, textord, "†", "\\dag");
defineSymbol(text, main, textord, "†", "\\dag");
defineSymbol(text, main, textord, "†", "\\textdagger");
defineSymbol(math, main, textord, "‡", "\\ddag");
defineSymbol(text, main, textord, "‡", "\\ddag");
defineSymbol(text, main, textord, "‡", "\\textdaggerdbl");
defineSymbol(math, main, close, "⎱", "\\rmoustache", true);
defineSymbol(math, main, open, "⎰", "\\lmoustache", true);
defineSymbol(math, main, close, "⟯", "\\rgroup", true);
defineSymbol(math, main, open, "⟮", "\\lgroup", true);
defineSymbol(math, main, bin, "∓", "\\mp", true);
defineSymbol(math, main, bin, "⊖", "\\ominus", true);
defineSymbol(math, main, bin, "⊎", "\\uplus", true);
defineSymbol(math, main, bin, "⊓", "\\sqcap", true);
defineSymbol(math, main, bin, "∗", "\\ast");
defineSymbol(math, main, bin, "⊔", "\\sqcup", true);
defineSymbol(math, main, bin, "◯", "\\bigcirc", true);
defineSymbol(math, main, bin, "∙", "\\bullet", true);
defineSymbol(math, main, bin, "‡", "\\ddagger");
defineSymbol(math, main, bin, "≀", "\\wr", true);
defineSymbol(math, main, bin, "⨿", "\\amalg");
defineSymbol(math, main, bin, "&", "\\And");
defineSymbol(math, main, rel, "⟵", "\\longleftarrow", true);
defineSymbol(math, main, rel, "⇐", "\\Leftarrow", true);
defineSymbol(math, main, rel, "⟸", "\\Longleftarrow", true);
defineSymbol(math, main, rel, "⟶", "\\longrightarrow", true);
defineSymbol(math, main, rel, "⇒", "\\Rightarrow", true);
defineSymbol(math, main, rel, "⟹", "\\Longrightarrow", true);
defineSymbol(math, main, rel, "↔", "\\leftrightarrow", true);
defineSymbol(math, main, rel, "⟷", "\\longleftrightarrow", true);
defineSymbol(math, main, rel, "⇔", "\\Leftrightarrow", true);
defineSymbol(math, main, rel, "⟺", "\\Longleftrightarrow", true);
defineSymbol(math, main, rel, "↦", "\\mapsto", true);
defineSymbol(math, main, rel, "⟼", "\\longmapsto", true);
defineSymbol(math, main, rel, "↗", "\\nearrow", true);
defineSymbol(math, main, rel, "↩", "\\hookleftarrow", true);
defineSymbol(math, main, rel, "↪", "\\hookrightarrow", true);
defineSymbol(math, main, rel, "↘", "\\searrow", true);
defineSymbol(math, main, rel, "↼", "\\leftharpoonup", true);
defineSymbol(math, main, rel, "⇀", "\\rightharpoonup", true);
defineSymbol(math, main, rel, "↙", "\\swarrow", true);
defineSymbol(math, main, rel, "↽", "\\leftharpoondown", true);
defineSymbol(math, main, rel, "⇁", "\\rightharpoondown", true);
defineSymbol(math, main, rel, "↖", "\\nwarrow", true);
defineSymbol(math, main, rel, "⇌", "\\rightleftharpoons", true);
defineSymbol(math, ams, rel, "≮", "\\nless", true);
defineSymbol(math, ams, rel, "", "\\@nleqslant");
defineSymbol(math, ams, rel, "", "\\@nleqq");
defineSymbol(math, ams, rel, "⪇", "\\lneq", true);
defineSymbol(math, ams, rel, "≨", "\\lneqq", true);
defineSymbol(math, ams, rel, "", "\\@lvertneqq");
defineSymbol(math, ams, rel, "⋦", "\\lnsim", true);
defineSymbol(math, ams, rel, "⪉", "\\lnapprox", true);
defineSymbol(math, ams, rel, "⊀", "\\nprec", true);
defineSymbol(math, ams, rel, "⋠", "\\npreceq", true);
defineSymbol(math, ams, rel, "⋨", "\\precnsim", true);
defineSymbol(math, ams, rel, "⪹", "\\precnapprox", true);
defineSymbol(math, ams, rel, "≁", "\\nsim", true);
defineSymbol(math, ams, rel, "", "\\@nshortmid");
defineSymbol(math, ams, rel, "∤", "\\nmid", true);
defineSymbol(math, ams, rel, "⊬", "\\nvdash", true);
defineSymbol(math, ams, rel, "⊭", "\\nvDash", true);
defineSymbol(math, ams, rel, "⋪", "\\ntriangleleft");
defineSymbol(math, ams, rel, "⋬", "\\ntrianglelefteq", true);
defineSymbol(math, ams, rel, "⊊", "\\subsetneq", true);
defineSymbol(math, ams, rel, "", "\\@varsubsetneq");
defineSymbol(math, ams, rel, "⫋", "\\subsetneqq", true);
defineSymbol(math, ams, rel, "", "\\@varsubsetneqq");
defineSymbol(math, ams, rel, "≯", "\\ngtr", true);
defineSymbol(math, ams, rel, "", "\\@ngeqslant");
defineSymbol(math, ams, rel, "", "\\@ngeqq");
defineSymbol(math, ams, rel, "⪈", "\\gneq", true);
defineSymbol(math, ams, rel, "≩", "\\gneqq", true);
defineSymbol(math, ams, rel, "", "\\@gvertneqq");
defineSymbol(math, ams, rel, "⋧", "\\gnsim", true);
defineSymbol(math, ams, rel, "⪊", "\\gnapprox", true);
defineSymbol(math, ams, rel, "⊁", "\\nsucc", true);
defineSymbol(math, ams, rel, "⋡", "\\nsucceq", true);
defineSymbol(math, ams, rel, "⋩", "\\succnsim", true);
defineSymbol(math, ams, rel, "⪺", "\\succnapprox", true);
defineSymbol(math, ams, rel, "≆", "\\ncong", true);
defineSymbol(math, ams, rel, "", "\\@nshortparallel");
defineSymbol(math, ams, rel, "∦", "\\nparallel", true);
defineSymbol(math, ams, rel, "⊯", "\\nVDash", true);
defineSymbol(math, ams, rel, "⋫", "\\ntriangleright");
defineSymbol(math, ams, rel, "⋭", "\\ntrianglerighteq", true);
defineSymbol(math, ams, rel, "", "\\@nsupseteqq");
defineSymbol(math, ams, rel, "⊋", "\\supsetneq", true);
defineSymbol(math, ams, rel, "", "\\@varsupsetneq");
defineSymbol(math, ams, rel, "⫌", "\\supsetneqq", true);
defineSymbol(math, ams, rel, "", "\\@varsupsetneqq");
defineSymbol(math, ams, rel, "⊮", "\\nVdash", true);
defineSymbol(math, ams, rel, "⪵", "\\precneqq", true);
defineSymbol(math, ams, rel, "⪶", "\\succneqq", true);
defineSymbol(math, ams, rel, "", "\\@nsubseteqq");
defineSymbol(math, ams, bin, "⊴", "\\unlhd");
defineSymbol(math, ams, bin, "⊵", "\\unrhd");
defineSymbol(math, ams, rel, "↚", "\\nleftarrow", true);
defineSymbol(math, ams, rel, "↛", "\\nrightarrow", true);
defineSymbol(math, ams, rel, "⇍", "\\nLeftarrow", true);
defineSymbol(math, ams, rel, "⇏", "\\nRightarrow", true);
defineSymbol(math, ams, rel, "↮", "\\nleftrightarrow", true);
defineSymbol(math, ams, rel, "⇎", "\\nLeftrightarrow", true);
defineSymbol(math, ams, rel, "△", "\\vartriangle");
defineSymbol(math, ams, textord, "ℏ", "\\hslash");
defineSymbol(math, ams, textord, "▽", "\\triangledown");
defineSymbol(math, ams, textord, "◊", "\\lozenge");
defineSymbol(math, ams, textord, "Ⓢ", "\\circledS");
defineSymbol(math, ams, textord, "®", "\\circledR");
defineSymbol(text, ams, textord, "®", "\\circledR");
defineSymbol(math, ams, textord, "∡", "\\measuredangle", true);
defineSymbol(math, ams, textord, "∄", "\\nexists");
defineSymbol(math, ams, textord, "℧", "\\mho");
defineSymbol(math, ams, textord, "Ⅎ", "\\Finv", true);
defineSymbol(math, ams, textord, "⅁", "\\Game", true);
defineSymbol(math, ams, textord, "‵", "\\backprime");
defineSymbol(math, ams, textord, "▲", "\\blacktriangle");
defineSymbol(math, ams, textord, "▼", "\\blacktriangledown");
defineSymbol(math, ams, textord, "■", "\\blacksquare");
defineSymbol(math, ams, textord, "⧫", "\\blacklozenge");
defineSymbol(math, ams, textord, "★", "\\bigstar");
defineSymbol(math, ams, textord, "∢", "\\sphericalangle", true);
defineSymbol(math, ams, textord, "∁", "\\complement", true);
defineSymbol(math, ams, textord, "ð", "\\eth", true);
defineSymbol(text, main, textord, "ð", "ð");
defineSymbol(math, ams, textord, "╱", "\\diagup");
defineSymbol(math, ams, textord, "╲", "\\diagdown");
defineSymbol(math, ams, textord, "□", "\\square");
defineSymbol(math, ams, textord, "□", "\\Box");
defineSymbol(math, ams, textord, "◊", "\\Diamond");
defineSymbol(math, ams, textord, "¥", "\\yen", true);
defineSymbol(text, ams, textord, "¥", "\\yen", true);
defineSymbol(math, ams, textord, "✓", "\\checkmark", true);
defineSymbol(text, ams, textord, "✓", "\\checkmark");
defineSymbol(math, ams, textord, "ℶ", "\\beth", true);
defineSymbol(math, ams, textord, "ℸ", "\\daleth", true);
defineSymbol(math, ams, textord, "ℷ", "\\gimel", true);
defineSymbol(math, ams, textord, "ϝ", "\\digamma", true);
defineSymbol(math, ams, textord, "ϰ", "\\varkappa");
defineSymbol(math, ams, open, "┌", "\\@ulcorner", true);
defineSymbol(math, ams, close, "┐", "\\@urcorner", true);
defineSymbol(math, ams, open, "└", "\\@llcorner", true);
defineSymbol(math, ams, close, "┘", "\\@lrcorner", true);
defineSymbol(math, ams, rel, "≦", "\\leqq", true);
defineSymbol(math, ams, rel, "⩽", "\\leqslant", true);
defineSymbol(math, ams, rel, "⪕", "\\eqslantless", true);
defineSymbol(math, ams, rel, "≲", "\\lesssim", true);
defineSymbol(math, ams, rel, "⪅", "\\lessapprox", true);
defineSymbol(math, ams, rel, "≊", "\\approxeq", true);
defineSymbol(math, ams, bin, "⋖", "\\lessdot");
defineSymbol(math, ams, rel, "⋘", "\\lll", true);
defineSymbol(math, ams, rel, "≶", "\\lessgtr", true);
defineSymbol(math, ams, rel, "⋚", "\\lesseqgtr", true);
defineSymbol(math, ams, rel, "⪋", "\\lesseqqgtr", true);
defineSymbol(math, ams, rel, "≑", "\\doteqdot");
defineSymbol(math, ams, rel, "≓", "\\risingdotseq", true);
defineSymbol(math, ams, rel, "≒", "\\fallingdotseq", true);
defineSymbol(math, ams, rel, "∽", "\\backsim", true);
defineSymbol(math, ams, rel, "⋍", "\\backsimeq", true);
defineSymbol(math, ams, rel, "⫅", "\\subseteqq", true);
defineSymbol(math, ams, rel, "⋐", "\\Subset", true);
defineSymbol(math, ams, rel, "⊏", "\\sqsubset", true);
defineSymbol(math, ams, rel, "≼", "\\preccurlyeq", true);
defineSymbol(math, ams, rel, "⋞", "\\curlyeqprec", true);
defineSymbol(math, ams, rel, "≾", "\\precsim", true);
defineSymbol(math, ams, rel, "⪷", "\\precapprox", true);
defineSymbol(math, ams, rel, "⊲", "\\vartriangleleft");
defineSymbol(math, ams, rel, "⊴", "\\trianglelefteq");
defineSymbol(math, ams, rel, "⊨", "\\vDash", true);
defineSymbol(math, ams, rel, "⊪", "\\Vvdash", true);
defineSymbol(math, ams, rel, "⌣", "\\smallsmile");
defineSymbol(math, ams, rel, "⌢", "\\smallfrown");
defineSymbol(math, ams, rel, "≏", "\\bumpeq", true);
defineSymbol(math, ams, rel, "≎", "\\Bumpeq", true);
defineSymbol(math, ams, rel, "≧", "\\geqq", true);
defineSymbol(math, ams, rel, "⩾", "\\geqslant", true);
defineSymbol(math, ams, rel, "⪖", "\\eqslantgtr", true);
defineSymbol(math, ams, rel, "≳", "\\gtrsim", true);
defineSymbol(math, ams, rel, "⪆", "\\gtrapprox", true);
defineSymbol(math, ams, bin, "⋗", "\\gtrdot");
defineSymbol(math, ams, rel, "⋙", "\\ggg", true);
defineSymbol(math, ams, rel, "≷", "\\gtrless", true);
defineSymbol(math, ams, rel, "⋛", "\\gtreqless", true);
defineSymbol(math, ams, rel, "⪌", "\\gtreqqless", true);
defineSymbol(math, ams, rel, "≖", "\\eqcirc", true);
defineSymbol(math, ams, rel, "≗", "\\circeq", true);
defineSymbol(math, ams, rel, "≜", "\\triangleq", true);
defineSymbol(math, ams, rel, "∼", "\\thicksim");
defineSymbol(math, ams, rel, "≈", "\\thickapprox");
defineSymbol(math, ams, rel, "⫆", "\\supseteqq", true);
defineSymbol(math, ams, rel, "⋑", "\\Supset", true);
defineSymbol(math, ams, rel, "⊐", "\\sqsupset", true);
defineSymbol(math, ams, rel, "≽", "\\succcurlyeq", true);
defineSymbol(math, ams, rel, "⋟", "\\curlyeqsucc", true);
defineSymbol(math, ams, rel, "≿", "\\succsim", true);
defineSymbol(math, ams, rel, "⪸", "\\succapprox", true);
defineSymbol(math, ams, rel, "⊳", "\\vartriangleright");
defineSymbol(math, ams, rel, "⊵", "\\trianglerighteq");
defineSymbol(math, ams, rel, "⊩", "\\Vdash", true);
defineSymbol(math, ams, rel, "∣", "\\shortmid");
defineSymbol(math, ams, rel, "∥", "\\shortparallel");
defineSymbol(math, ams, rel, "≬", "\\between", true);
defineSymbol(math, ams, rel, "⋔", "\\pitchfork", true);
defineSymbol(math, ams, rel, "∝", "\\varpropto");
defineSymbol(math, ams, rel, "◀", "\\blacktriangleleft");
defineSymbol(math, ams, rel, "∴", "\\therefore", true);
defineSymbol(math, ams, rel, "∍", "\\backepsilon");
defineSymbol(math, ams, rel, "▶", "\\blacktriangleright");
defineSymbol(math, ams, rel, "∵", "\\because", true);
defineSymbol(math, ams, rel, "⋘", "\\llless");
defineSymbol(math, ams, rel, "⋙", "\\gggtr");
defineSymbol(math, ams, bin, "⊲", "\\lhd");
defineSymbol(math, ams, bin, "⊳", "\\rhd");
defineSymbol(math, ams, rel, "≂", "\\eqsim", true);
defineSymbol(math, main, rel, "⋈", "\\Join");
defineSymbol(math, ams, rel, "≑", "\\Doteq", true);
defineSymbol(math, ams, bin, "∔", "\\dotplus", true);
defineSymbol(math, ams, bin, "∖", "\\smallsetminus");
defineSymbol(math, ams, bin, "⋒", "\\Cap", true);
defineSymbol(math, ams, bin, "⋓", "\\Cup", true);
defineSymbol(math, ams, bin, "⩞", "\\doublebarwedge", true);
defineSymbol(math, ams, bin, "⊟", "\\boxminus", true);
defineSymbol(math, ams, bin, "⊞", "\\boxplus", true);
defineSymbol(math, ams, bin, "⋇", "\\divideontimes", true);
defineSymbol(math, ams, bin, "⋉", "\\ltimes", true);
defineSymbol(math, ams, bin, "⋊", "\\rtimes", true);
defineSymbol(math, ams, bin, "⋋", "\\leftthreetimes", true);
defineSymbol(math, ams, bin, "⋌", "\\rightthreetimes", true);
defineSymbol(math, ams, bin, "⋏", "\\curlywedge", true);
defineSymbol(math, ams, bin, "⋎", "\\curlyvee", true);
defineSymbol(math, ams, bin, "⊝", "\\circleddash", true);
defineSymbol(math, ams, bin, "⊛", "\\circledast", true);
defineSymbol(math, ams, bin, "⋅", "\\centerdot");
defineSymbol(math, ams, bin, "⊺", "\\intercal", true);
defineSymbol(math, ams, bin, "⋒", "\\doublecap");
defineSymbol(math, ams, bin, "⋓", "\\doublecup");
defineSymbol(math, ams, bin, "⊠", "\\boxtimes", true);
defineSymbol(math, ams, rel, "⇢", "\\dashrightarrow", true);
defineSymbol(math, ams, rel, "⇠", "\\dashleftarrow", true);
defineSymbol(math, ams, rel, "⇇", "\\leftleftarrows", true);
defineSymbol(math, ams, rel, "⇆", "\\leftrightarrows", true);
defineSymbol(math, ams, rel, "⇚", "\\Lleftarrow", true);
defineSymbol(math, ams, rel, "↞", "\\twoheadleftarrow", true);
defineSymbol(math, ams, rel, "↢", "\\leftarrowtail", true);
defineSymbol(math, ams, rel, "↫", "\\looparrowleft", true);
defineSymbol(math, ams, rel, "⇋", "\\leftrightharpoons", true);
defineSymbol(math, ams, rel, "↶", "\\curvearrowleft", true);
defineSymbol(math, ams, rel, "↺", "\\circlearrowleft", true);
defineSymbol(math, ams, rel, "↰", "\\Lsh", true);
defineSymbol(math, ams, rel, "⇈", "\\upuparrows", true);
defineSymbol(math, ams, rel, "↿", "\\upharpoonleft", true);
defineSymbol(math, ams, rel, "⇃", "\\downharpoonleft", true);
defineSymbol(math, main, rel, "⊶", "\\origof", true);
defineSymbol(math, main, rel, "⊷", "\\imageof", true);
defineSymbol(math, ams, rel, "⊸", "\\multimap", true);
defineSymbol(math, ams, rel, "↭", "\\leftrightsquigarrow", true);
defineSymbol(math, ams, rel, "⇉", "\\rightrightarrows", true);
defineSymbol(math, ams, rel, "⇄", "\\rightleftarrows", true);
defineSymbol(math, ams, rel, "↠", "\\twoheadrightarrow", true);
defineSymbol(math, ams, rel, "↣", "\\rightarrowtail", true);
defineSymbol(math, ams, rel, "↬", "\\looparrowright", true);
defineSymbol(math, ams, rel, "↷", "\\curvearrowright", true);
defineSymbol(math, ams, rel, "↻", "\\circlearrowright", true);
defineSymbol(math, ams, rel, "↱", "\\Rsh", true);
defineSymbol(math, ams, rel, "⇊", "\\downdownarrows", true);
defineSymbol(math, ams, rel, "↾", "\\upharpoonright", true);
defineSymbol(math, ams, rel, "⇂", "\\downharpoonright", true);
defineSymbol(math, ams, rel, "⇝", "\\rightsquigarrow", true);
defineSymbol(math, ams, rel, "⇝", "\\leadsto");
defineSymbol(math, ams, rel, "⇛", "\\Rrightarrow", true);
defineSymbol(math, ams, rel, "↾", "\\restriction");
defineSymbol(math, main, textord, "‘", "`");
defineSymbol(math, main, textord, "$", "\\$");
defineSymbol(text, main, textord, "$", "\\$");
defineSymbol(text, main, textord, "$", "\\textdollar");
defineSymbol(math, main, textord, "%", "\\%");
defineSymbol(text, main, textord, "%", "\\%");
defineSymbol(math, main, textord, "_", "\\_");
defineSymbol(text, main, textord, "_", "\\_");
defineSymbol(text, main, textord, "_", "\\textunderscore");
defineSymbol(math, main, textord, "∠", "\\angle", true);
defineSymbol(math, main, textord, "∞", "\\infty", true);
defineSymbol(math, main, textord, "′", "\\prime");
defineSymbol(math, main, textord, "△", "\\triangle");
defineSymbol(math, main, textord, "Γ", "\\Gamma", true);
defineSymbol(math, main, textord, "Δ", "\\Delta", true);
defineSymbol(math, main, textord, "Θ", "\\Theta", true);
defineSymbol(math, main, textord, "Λ", "\\Lambda", true);
defineSymbol(math, main, textord, "Ξ", "\\Xi", true);
defineSymbol(math, main, textord, "Π", "\\Pi", true);
defineSymbol(math, main, textord, "Σ", "\\Sigma", true);
defineSymbol(math, main, textord, "Υ", "\\Upsilon", true);
defineSymbol(math, main, textord, "Φ", "\\Phi", true);
defineSymbol(math, main, textord, "Ψ", "\\Psi", true);
defineSymbol(math, main, textord, "Ω", "\\Omega", true);
defineSymbol(math, main, textord, "A", "Α");
defineSymbol(math, main, textord, "B", "Β");
defineSymbol(math, main, textord, "E", "Ε");
defineSymbol(math, main, textord, "Z", "Ζ");
defineSymbol(math, main, textord, "H", "Η");
defineSymbol(math, main, textord, "I", "Ι");
defineSymbol(math, main, textord, "K", "Κ");
defineSymbol(math, main, textord, "M", "Μ");
defineSymbol(math, main, textord, "N", "Ν");
defineSymbol(math, main, textord, "O", "Ο");
defineSymbol(math, main, textord, "P", "Ρ");
defineSymbol(math, main, textord, "T", "Τ");
defineSymbol(math, main, textord, "X", "Χ");
defineSymbol(math, main, textord, "¬", "\\neg", true);
defineSymbol(math, main, textord, "¬", "\\lnot");
defineSymbol(math, main, textord, "⊤", "\\top");
defineSymbol(math, main, textord, "⊥", "\\bot");
defineSymbol(math, main, textord, "∅", "\\emptyset");
defineSymbol(math, ams, textord, "∅", "\\varnothing");
defineSymbol(math, main, mathord, "α", "\\alpha", true);
defineSymbol(math, main, mathord, "β", "\\beta", true);
defineSymbol(math, main, mathord, "γ", "\\gamma", true);
defineSymbol(math, main, mathord, "δ", "\\delta", true);
defineSymbol(math, main, mathord, "ϵ", "\\epsilon", true);
defineSymbol(math, main, mathord, "ζ", "\\zeta", true);
defineSymbol(math, main, mathord, "η", "\\eta", true);
defineSymbol(math, main, mathord, "θ", "\\theta", true);
defineSymbol(math, main, mathord, "ι", "\\iota", true);
defineSymbol(math, main, mathord, "κ", "\\kappa", true);
defineSymbol(math, main, mathord, "λ", "\\lambda", true);
defineSymbol(math, main, mathord, "μ", "\\mu", true);
defineSymbol(math, main, mathord, "ν", "\\nu", true);
defineSymbol(math, main, mathord, "ξ", "\\xi", true);
defineSymbol(math, main, mathord, "ο", "\\omicron", true);
defineSymbol(math, main, mathord, "π", "\\pi", true);
defineSymbol(math, main, mathord, "ρ", "\\rho", true);
defineSymbol(math, main, mathord, "σ", "\\sigma", true);
defineSymbol(math, main, mathord, "τ", "\\tau", true);
defineSymbol(math, main, mathord, "υ", "\\upsilon", true);
defineSymbol(math, main, mathord, "ϕ", "\\phi", true);
defineSymbol(math, main, mathord, "χ", "\\chi", true);
defineSymbol(math, main, mathord, "ψ", "\\psi", true);
defineSymbol(math, main, mathord, "ω", "\\omega", true);
defineSymbol(math, main, mathord, "ε", "\\varepsilon", true);
defineSymbol(math, main, mathord, "ϑ", "\\vartheta", true);
defineSymbol(math, main, mathord, "ϖ", "\\varpi", true);
defineSymbol(math, main, mathord, "ϱ", "\\varrho", true);
defineSymbol(math, main, mathord, "ς", "\\varsigma", true);
defineSymbol(math, main, mathord, "φ", "\\varphi", true);
defineSymbol(math, main, bin, "∗", "*", true);
defineSymbol(math, main, bin, "+", "+");
defineSymbol(math, main, bin, "−", "-", true);
defineSymbol(math, main, bin, "⋅", "\\cdot", true);
defineSymbol(math, main, bin, "∘", "\\circ", true);
defineSymbol(math, main, bin, "÷", "\\div", true);
defineSymbol(math, main, bin, "±", "\\pm", true);
defineSymbol(math, main, bin, "×", "\\times", true);
defineSymbol(math, main, bin, "∩", "\\cap", true);
defineSymbol(math, main, bin, "∪", "\\cup", true);
defineSymbol(math, main, bin, "∖", "\\setminus", true);
defineSymbol(math, main, bin, "∧", "\\land");
defineSymbol(math, main, bin, "∨", "\\lor");
defineSymbol(math, main, bin, "∧", "\\wedge", true);
defineSymbol(math, main, bin, "∨", "\\vee", true);
defineSymbol(math, main, textord, "√", "\\surd");
defineSymbol(math, main, open, "⟨", "\\langle", true);
defineSymbol(math, main, open, "∣", "\\lvert");
defineSymbol(math, main, open, "∥", "\\lVert");
defineSymbol(math, main, close, "?", "?");
defineSymbol(math, main, close, "!", "!");
defineSymbol(math, main, close, "⟩", "\\rangle", true);
defineSymbol(math, main, close, "∣", "\\rvert");
defineSymbol(math, main, close, "∥", "\\rVert");
defineSymbol(math, main, rel, "=", "=");
defineSymbol(math, main, rel, ":", ":");
defineSymbol(math, main, rel, "≈", "\\approx", true);
defineSymbol(math, main, rel, "≅", "\\cong", true);
defineSymbol(math, main, rel, "≥", "\\ge");
defineSymbol(math, main, rel, "≥", "\\geq", true);
defineSymbol(math, main, rel, "←", "\\gets");
defineSymbol(math, main, rel, ">", "\\gt", true);
defineSymbol(math, main, rel, "∈", "\\in", true);
defineSymbol(math, main, rel, "", "\\@not");
defineSymbol(math, main, rel, "⊂", "\\subset", true);
defineSymbol(math, main, rel, "⊃", "\\supset", true);
defineSymbol(math, main, rel, "⊆", "\\subseteq", true);
defineSymbol(math, main, rel, "⊇", "\\supseteq", true);
defineSymbol(math, ams, rel, "⊈", "\\nsubseteq", true);
defineSymbol(math, ams, rel, "⊉", "\\nsupseteq", true);
defineSymbol(math, main, rel, "⊨", "\\models");
defineSymbol(math, main, rel, "←", "\\leftarrow", true);
defineSymbol(math, main, rel, "≤", "\\le");
defineSymbol(math, main, rel, "≤", "\\leq", true);
defineSymbol(math, main, rel, "<", "\\lt", true);
defineSymbol(math, main, rel, "→", "\\rightarrow", true);
defineSymbol(math, main, rel, "→", "\\to");
defineSymbol(math, ams, rel, "≱", "\\ngeq", true);
defineSymbol(math, ams, rel, "≰", "\\nleq", true);
defineSymbol(math, main, spacing, "\xA0", "\\ ");
defineSymbol(math, main, spacing, "\xA0", "\\space");
defineSymbol(math, main, spacing, "\xA0", "\\nobreakspace");
defineSymbol(text, main, spacing, "\xA0", "\\ ");
defineSymbol(text, main, spacing, "\xA0", " ");
defineSymbol(text, main, spacing, "\xA0", "\\space");
defineSymbol(text, main, spacing, "\xA0", "\\nobreakspace");
defineSymbol(math, main, spacing, "", "\\nobreak");
defineSymbol(math, main, spacing, "", "\\allowbreak");
defineSymbol(math, main, punct, ",", ",");
defineSymbol(math, main, punct, ";", ";");
defineSymbol(math, ams, bin, "⊼", "\\barwedge", true);
defineSymbol(math, ams, bin, "⊻", "\\veebar", true);
defineSymbol(math, main, bin, "⊙", "\\odot", true);
defineSymbol(math, main, bin, "⊕", "\\oplus", true);
defineSymbol(math, main, bin, "⊗", "\\otimes", true);
defineSymbol(math, main, textord, "∂", "\\partial", true);
defineSymbol(math, main, bin, "⊘", "\\oslash", true);
defineSymbol(math, ams, bin, "⊚", "\\circledcirc", true);
defineSymbol(math, ams, bin, "⊡", "\\boxdot", true);
defineSymbol(math, main, bin, "△", "\\bigtriangleup");
defineSymbol(math, main, bin, "▽", "\\bigtriangledown");
defineSymbol(math, main, bin, "†", "\\dagger");
defineSymbol(math, main, bin, "⋄", "\\diamond");
defineSymbol(math, main, bin, "⋆", "\\star");
defineSymbol(math, main, bin, "◃", "\\triangleleft");
defineSymbol(math, main, bin, "▹", "\\triangleright");
defineSymbol(math, main, open, "{", "\\{");
defineSymbol(text, main, textord, "{", "\\{");
defineSymbol(text, main, textord, "{", "\\textbraceleft");
defineSymbol(math, main, close, "}", "\\}");
defineSymbol(text, main, textord, "}", "\\}");
defineSymbol(text, main, textord, "}", "\\textbraceright");
defineSymbol(math, main, open, "{", "\\lbrace");
defineSymbol(math, main, close, "}", "\\rbrace");
defineSymbol(math, main, open, "[", "\\lbrack", true);
defineSymbol(text, main, textord, "[", "\\lbrack", true);
defineSymbol(math, main, close, "]", "\\rbrack", true);
defineSymbol(text, main, textord, "]", "\\rbrack", true);
defineSymbol(math, main, open, "(", "\\lparen", true);
defineSymbol(math, main, close, ")", "\\rparen", true);
defineSymbol(text, main, textord, "<", "\\textless", true);
defineSymbol(text, main, textord, ">", "\\textgreater", true);
defineSymbol(math, main, open, "⌊", "\\lfloor", true);
defineSymbol(math, main, close, "⌋", "\\rfloor", true);
defineSymbol(math, main, open, "⌈", "\\lceil", true);
defineSymbol(math, main, close, "⌉", "\\rceil", true);
defineSymbol(math, main, textord, "\\", "\\backslash");
defineSymbol(math, main, textord, "∣", "|");
defineSymbol(math, main, textord, "∣", "\\vert");
defineSymbol(text, main, textord, "|", "\\textbar", true);
defineSymbol(math, main, textord, "∥", "\\|");
defineSymbol(math, main, textord, "∥", "\\Vert");
defineSymbol(text, main, textord, "∥", "\\textbardbl");
defineSymbol(text, main, textord, "~", "\\textasciitilde");
defineSymbol(text, main, textord, "\\", "\\textbackslash");
defineSymbol(text, main, textord, "^", "\\textasciicircum");
defineSymbol(math, main, rel, "↑", "\\uparrow", true);
defineSymbol(math, main, rel, "⇑", "\\Uparrow", true);
defineSymbol(math, main, rel, "↓", "\\downarrow", true);
defineSymbol(math, main, rel, "⇓", "\\Downarrow", true);
defineSymbol(math, main, rel, "↕", "\\updownarrow", true);
defineSymbol(math, main, rel, "⇕", "\\Updownarrow", true);
defineSymbol(math, main, op, "∐", "\\coprod");
defineSymbol(math, main, op, "⋁", "\\bigvee");
defineSymbol(math, main, op, "⋀", "\\bigwedge");
defineSymbol(math, main, op, "⨄", "\\biguplus");
defineSymbol(math, main, op, "⋂", "\\bigcap");
defineSymbol(math, main, op, "⋃", "\\bigcup");
defineSymbol(math, main, op, "∫", "\\int");
defineSymbol(math, main, op, "∫", "\\intop");
defineSymbol(math, main, op, "∬", "\\iint");
defineSymbol(math, main, op, "∭", "\\iiint");
defineSymbol(math, main, op, "∏", "\\prod");
defineSymbol(math, main, op, "∑", "\\sum");
defineSymbol(math, main, op, "⨂", "\\bigotimes");
defineSymbol(math, main, op, "⨁", "\\bigoplus");
defineSymbol(math, main, op, "⨀", "\\bigodot");
defineSymbol(math, main, op, "∮", "\\oint");
defineSymbol(math, main, op, "∯", "\\oiint");
defineSymbol(math, main, op, "∰", "\\oiiint");
defineSymbol(math, main, op, "⨆", "\\bigsqcup");
defineSymbol(math, main, op, "∫", "\\smallint");
defineSymbol(text, main, inner, "…", "\\textellipsis");
defineSymbol(math, main, inner, "…", "\\mathellipsis");
defineSymbol(text, main, inner, "…", "\\ldots", true);
defineSymbol(math, main, inner, "…", "\\ldots", true);
defineSymbol(math, main, inner, "⋯", "\\@cdots", true);
defineSymbol(math, main, inner, "⋱", "\\ddots", true);
defineSymbol(math, main, textord, "⋮", "\\varvdots");
defineSymbol(text, main, textord, "⋮", "\\varvdots");
defineSymbol(math, main, accent, "ˊ", "\\acute");
defineSymbol(math, main, accent, "ˋ", "\\grave");
defineSymbol(math, main, accent, "¨", "\\ddot");
defineSymbol(math, main, accent, "~", "\\tilde");
defineSymbol(math, main, accent, "ˉ", "\\bar");
defineSymbol(math, main, accent, "˘", "\\breve");
defineSymbol(math, main, accent, "ˇ", "\\check");
defineSymbol(math, main, accent, "^", "\\hat");
defineSymbol(math, main, accent, "⃗", "\\vec");
defineSymbol(math, main, accent, "˙", "\\dot");
defineSymbol(math, main, accent, "˚", "\\mathring");
defineSymbol(math, main, mathord, "", "\\@imath");
defineSymbol(math, main, mathord, "", "\\@jmath");
defineSymbol(math, main, textord, "ı", "ı");
defineSymbol(math, main, textord, "ȷ", "ȷ");
defineSymbol(text, main, textord, "ı", "\\i", true);
defineSymbol(text, main, textord, "ȷ", "\\j", true);
defineSymbol(text, main, textord, "ß", "\\ss", true);
defineSymbol(text, main, textord, "æ", "\\ae", true);
defineSymbol(text, main, textord, "œ", "\\oe", true);
defineSymbol(text, main, textord, "ø", "\\o", true);
defineSymbol(text, main, textord, "Æ", "\\AE", true);
defineSymbol(text, main, textord, "Œ", "\\OE", true);
defineSymbol(text, main, textord, "Ø", "\\O", true);
defineSymbol(text, main, accent, "ˊ", "\\'");
defineSymbol(text, main, accent, "ˋ", "\\`");
defineSymbol(text, main, accent, "ˆ", "\\^");
defineSymbol(text, main, accent, "˜", "\\~");
defineSymbol(text, main, accent, "ˉ", "\\=");
defineSymbol(text, main, accent, "˘", "\\u");
defineSymbol(text, main, accent, "˙", "\\.");
defineSymbol(text, main, accent, "¸", "\\c");
defineSymbol(text, main, accent, "˚", "\\r");
defineSymbol(text, main, accent, "ˇ", "\\v");
defineSymbol(text, main, accent, "¨", "\\\"");
defineSymbol(text, main, accent, "˝", "\\H");
defineSymbol(text, main, accent, "◯", "\\textcircled");
var ligatures = {
  "--": true,
  "---": true,
  "``": true,
  "''": true
};
defineSymbol(text, main, textord, "–", "--", true);
defineSymbol(text, main, textord, "–", "\\textendash");
defineSymbol(text, main, textord, "—", "---", true);
defineSymbol(text, main, textord, "—", "\\textemdash");
defineSymbol(text, main, textord, "‘", "`", true);
defineSymbol(text, main, textord, "‘", "\\textquoteleft");
defineSymbol(text, main, textord, "’", "'", true);
defineSymbol(text, main, textord, "’", "\\textquoteright");
defineSymbol(text, main, textord, "“", "``", true);
defineSymbol(text, main, textord, "“", "\\textquotedblleft");
defineSymbol(text, main, textord, "”", "''", true);
defineSymbol(text, main, textord, "”", "\\textquotedblright");
defineSymbol(math, main, textord, "°", "\\degree", true);
defineSymbol(text, main, textord, "°", "\\degree");
defineSymbol(text, main, textord, "°", "\\textdegree", true);
defineSymbol(math, main, textord, "£", "\\pounds");
defineSymbol(math, main, textord, "£", "\\mathsterling", true);
defineSymbol(text, main, textord, "£", "\\pounds");
defineSymbol(text, main, textord, "£", "\\textsterling", true);
defineSymbol(math, ams, textord, "✠", "\\maltese");
defineSymbol(text, ams, textord, "✠", "\\maltese");
var mathTextSymbols = "0123456789/@.\"";
for (var i = 0; i < mathTextSymbols.length; i++) {
  var ch = mathTextSymbols.charAt(i);
  defineSymbol(math, main, textord, ch, ch);
}
var textSymbols = "0123456789!@*()-=+\";:?/.,";
for (var _i = 0; _i < textSymbols.length; _i++) {
  var _ch = textSymbols.charAt(_i);
  defineSymbol(text, main, textord, _ch, _ch);
}
var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
for (var _i2 = 0; _i2 < letters.length; _i2++) {
  var _ch2 = letters.charAt(_i2);
  defineSymbol(math, main, mathord, _ch2, _ch2);
  defineSymbol(text, main, textord, _ch2, _ch2);
}
defineSymbol(math, ams, textord, "C", "ℂ");
defineSymbol(text, ams, textord, "C", "ℂ");
defineSymbol(math, ams, textord, "H", "ℍ");
defineSymbol(text, ams, textord, "H", "ℍ");
defineSymbol(math, ams, textord, "N", "ℕ");
defineSymbol(text, ams, textord, "N", "ℕ");
defineSymbol(math, ams, textord, "P", "ℙ");
defineSymbol(text, ams, textord, "P", "ℙ");
defineSymbol(math, ams, textord, "Q", "ℚ");
defineSymbol(text, ams, textord, "Q", "ℚ");
defineSymbol(math, ams, textord, "R", "ℝ");
defineSymbol(text, ams, textord, "R", "ℝ");
defineSymbol(math, ams, textord, "Z", "ℤ");
defineSymbol(text, ams, textord, "Z", "ℤ");
defineSymbol(math, main, mathord, "h", "ℎ");
defineSymbol(text, main, mathord, "h", "ℎ");
var wideChar;
for (var _i3 = 0; _i3 < letters.length; _i3++) {
  var _ch3 = letters.charAt(_i3);
  wideChar = String.fromCharCode(55349, 56320 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56372 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56424 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56580 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56684 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56736 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56788 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56840 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  wideChar = String.fromCharCode(55349, 56944 + _i3);
  defineSymbol(math, main, mathord, _ch3, wideChar);
  defineSymbol(text, main, textord, _ch3, wideChar);
  if (_i3 < 26) {
    wideChar = String.fromCharCode(55349, 56632 + _i3);
    defineSymbol(math, main, mathord, _ch3, wideChar);
    defineSymbol(text, main, textord, _ch3, wideChar);
    wideChar = String.fromCharCode(55349, 56476 + _i3);
    defineSymbol(math, main, mathord, _ch3, wideChar);
    defineSymbol(text, main, textord, _ch3, wideChar);
  }
}
wideChar = String.fromCharCode(55349, 56668);
defineSymbol(math, main, mathord, "k", wideChar);
defineSymbol(text, main, textord, "k", wideChar);
for (var _i4 = 0; _i4 < 10; _i4++) {
  var _ch4 = _i4.toString();
  wideChar = String.fromCharCode(55349, 57294 + _i4);
  defineSymbol(math, main, mathord, _ch4, wideChar);
  defineSymbol(text, main, textord, _ch4, wideChar);
  wideChar = String.fromCharCode(55349, 57314 + _i4);
  defineSymbol(math, main, mathord, _ch4, wideChar);
  defineSymbol(text, main, textord, _ch4, wideChar);
  wideChar = String.fromCharCode(55349, 57324 + _i4);
  defineSymbol(math, main, mathord, _ch4, wideChar);
  defineSymbol(text, main, textord, _ch4, wideChar);
  wideChar = String.fromCharCode(55349, 57334 + _i4);
  defineSymbol(math, main, mathord, _ch4, wideChar);
  defineSymbol(text, main, textord, _ch4, wideChar);
}
var extraLatin = "ÐÞþ";
for (var _i5 = 0; _i5 < extraLatin.length; _i5++) {
  var _ch5 = extraLatin.charAt(_i5);
  defineSymbol(math, main, mathord, _ch5, _ch5);
  defineSymbol(text, main, textord, _ch5, _ch5);
}
var boldUpright = {
  mathClass: "mathbf",
  textClass: "textbf",
  font: "Main-Bold"
};
var italic = {
  mathClass: "mathnormal",
  textClass: "textit",
  font: "Math-Italic"
};
var boldItalic = {
  mathClass: "boldsymbol",
  textClass: "boldsymbol",
  font: "Main-BoldItalic"
};
var script = {
  mathClass: "mathscr",
  textClass: "textscr",
  font: "Script-Regular"
};
var noFont = {
  mathClass: "",
  textClass: "",
  font: ""
};
var fraktur = {
  mathClass: "mathfrak",
  textClass: "textfrak",
  font: "Fraktur-Regular"
};
var doubleStruck = {
  mathClass: "mathbb",
  textClass: "textbb",
  font: "AMS-Regular"
};
var boldFraktur = {
  mathClass: "mathboldfrak",
  textClass: "textboldfrak",
  font: "Fraktur-Regular"
};
var sansSerif = {
  mathClass: "mathsf",
  textClass: "textsf",
  font: "SansSerif-Regular"
};
var boldSansSerif = {
  mathClass: "mathboldsf",
  textClass: "textboldsf",
  font: "SansSerif-Bold"
};
var italicSansSerif = {
  mathClass: "mathitsf",
  textClass: "textitsf",
  font: "SansSerif-Italic"
};
var monospace = {
  mathClass: "mathtt",
  textClass: "texttt",
  font: "Typewriter-Regular"
};
var wideLatinLetterData = [boldUpright, boldUpright, italic, italic, boldItalic, boldItalic, script, noFont, noFont, noFont, fraktur, fraktur, doubleStruck, doubleStruck, boldFraktur, boldFraktur, sansSerif, sansSerif, boldSansSerif, boldSansSerif, italicSansSerif, italicSansSerif, noFont, noFont, monospace, monospace];
var wideNumeralData = [boldUpright, noFont, sansSerif, boldSansSerif, monospace];
var wideCharacterFont = v194 => {
  var v195 = v194.charCodeAt(0);
  var v196 = v194.charCodeAt(1);
  var v197 = (v195 - 55296) * 1024 + (v196 - 56320) + 65536;
  if (v197 >= 119808 && v197 < 120484) {
    var v198 = Math.floor((v197 - 119808) / 26);
    return wideLatinLetterData[v198];
  } else if (v197 >= 120782 && v197 <= 120831) {
    var v199 = Math.floor((v197 - 120782) / 10);
    return wideNumeralData[v199];
  } else if (v197 === 120485 || v197 === 120486) {
    return wideLatinLetterData[0];
  } else if (v197 > 120486 && v197 < 120782) {
    return noFont;
  } else {
    throw new ParseError("Unsupported character: " + v194);
  }
};
var lookupSymbol = function lookupSymbol2(v200, v201, v202) {
  if (symbols[v202][v200]) {
    var v203 = symbols[v202][v200].replace;
    if (v203) {
      v200 = v203;
    }
  }
  return {
    value: v200,
    metrics: getCharacterMetrics(v200, v201, v202)
  };
};
var makeSymbol = function makeSymbol2(v204, v205, v206, v207, v208) {
  var v209 = lookupSymbol(v204, v205, v206);
  var v210 = v209.metrics;
  v204 = v209.value;
  var v211;
  if (v210) {
    var v212 = v210.italic;
    if (v206 === "text" || v207 && v207.font === "mathit") {
      v212 = 0;
    }
    v211 = new SymbolNode(v204, v210.height, v210.depth, v212, v210.skew, v210.width, v208);
  } else {
    if (typeof console !== "undefined") {
      console.warn("No character metrics " + ("for '" + v204 + "' in style '" + v205 + "' and mode '" + v206 + "'"));
    }
    v211 = new SymbolNode(v204, 0, 0, 0, 0, 0, v208);
  }
  if (v207) {
    v211.maxFontSize = v207.sizeMultiplier;
    if (v207.style.isTight()) {
      v211.classes.push("mtight");
    }
    var v213 = v207.getColor();
    if (v213) {
      v211.style.color = v213;
    }
  }
  return v211;
};
var mathsym = function mathsym2(v214, v215, v216, v217 = []) {
  if (v216.font === "boldsymbol" && lookupSymbol(v214, "Main-Bold", v215).metrics) {
    return makeSymbol(v214, "Main-Bold", v215, v216, v217.concat(["mathbf"]));
  } else if (v214 === "\\" || symbols[v215][v214].font === "main") {
    return makeSymbol(v214, "Main-Regular", v215, v216, v217);
  } else {
    return makeSymbol(v214, "AMS-Regular", v215, v216, v217.concat(["amsrm"]));
  }
};
var boldSymbol = function boldSymbol2(v218, v219, v220) {
  if (v220 !== "textord" && lookupSymbol(v218, "Math-BoldItalic", v219).metrics) {
    return {
      fontName: "Math-BoldItalic",
      fontClass: "boldsymbol"
    };
  } else {
    return {
      fontName: "Main-Bold",
      fontClass: "mathbf"
    };
  }
};
var makeOrd = function makeOrd2(v221, v222, v223) {
  var v224 = v221.mode;
  var v225 = v221.text;
  var v226 = ["mord"];
  var {
    font: v227,
    fontFamily: v228,
    fontWeight: v229,
    fontShape: v230
  } = v222;
  var v231 = v224 === "math" || v224 === "text" && !!v227;
  var v232 = v231 ? v227 : v228;
  var v233 = "";
  var v234 = "";
  if (v225.charCodeAt(0) === 55349) {
    var v235 = wideCharacterFont(v225);
    v233 = v235.font;
    v234 = v235[v224 + "Class"];
  }
  if (v233) {
    return makeSymbol(v225, v233, v224, v222, v226.concat(v234));
  } else if (v232) {
    var v236;
    var v237;
    if (v232 === "boldsymbol") {
      var v238 = boldSymbol(v225, v224, v223);
      v236 = v238.fontName;
      v237 = [v238.fontClass];
    } else if (v231) {
      v236 = fontMap[v227].fontName;
      v237 = [v227];
    } else {
      v236 = retrieveTextFontName(v228, v229, v230);
      v237 = [v228, v229, v230];
    }
    if (lookupSymbol(v225, v236, v224).metrics) {
      return makeSymbol(v225, v236, v224, v222, v226.concat(v237));
    } else if (ligatures.hasOwnProperty(v225) && v236.slice(0, 10) === "Typewriter") {
      var v239 = [];
      for (var v240 = 0; v240 < v225.length; v240++) {
        v239.push(makeSymbol(v225[v240], v236, v224, v222, v226.concat(v237)));
      }
      return makeFragment(v239);
    }
  }
  if (v223 === "mathord") {
    return makeSymbol(v225, "Math-Italic", v224, v222, v226.concat(["mathnormal"]));
  } else if (v223 === "textord") {
    var v241 = symbols[v224][v225] && symbols[v224][v225].font;
    if (v241 === "ams") {
      var v242 = retrieveTextFontName("amsrm", v229, v230);
      return makeSymbol(v225, v242, v224, v222, v226.concat("amsrm", v229, v230));
    } else if (v241 === "main" || !v241) {
      var v243 = retrieveTextFontName("textrm", v229, v230);
      return makeSymbol(v225, v243, v224, v222, v226.concat(v229, v230));
    } else {
      var v244 = retrieveTextFontName(v241, v229, v230);
      return makeSymbol(v225, v244, v224, v222, v226.concat(v244, v229, v230));
    }
  } else {
    throw new Error("unexpected type: " + v223 + " in makeOrd");
  }
};
var canCombine = (v245, v246) => {
  if (createClass(v245.classes) !== createClass(v246.classes) || v245.skew !== v246.skew || v245.maxFontSize !== v246.maxFontSize || v245.italic !== 0 && v245.hasClass("mathnormal")) {
    return false;
  }
  if (v245.classes.length === 1) {
    var v247 = v245.classes[0];
    if (v247 === "mbin" || v247 === "mord") {
      return false;
    }
  }
  for (var v248 of Object.keys(v245.style)) {
    if (v245.style[v248] !== v246.style[v248]) {
      return false;
    }
  }
  for (var v249 of Object.keys(v246.style)) {
    if (v245.style[v249] !== v246.style[v249]) {
      return false;
    }
  }
  return true;
};
var tryCombineChars = v250 => {
  for (var v251 = 0; v251 < v250.length - 1; v251++) {
    var v252 = v250[v251];
    var v253 = v250[v251 + 1];
    if (v252 instanceof SymbolNode && v253 instanceof SymbolNode && canCombine(v252, v253)) {
      v252.text += v253.text;
      v252.height = Math.max(v252.height, v253.height);
      v252.depth = Math.max(v252.depth, v253.depth);
      v252.italic = v253.italic;
      v250.splice(v251 + 1, 1);
      v251--;
    }
  }
  return v250;
};
var sizeElementFromChildren = function sizeElementFromChildren2(v254) {
  var v255 = 0;
  var v256 = 0;
  var v257 = 0;
  for (var v258 = 0; v258 < v254.children.length; v258++) {
    var v259 = v254.children[v258];
    if (v259.height > v255) {
      v255 = v259.height;
    }
    if (v259.depth > v256) {
      v256 = v259.depth;
    }
    if (v259.maxFontSize > v257) {
      v257 = v259.maxFontSize;
    }
  }
  v254.height = v255;
  v254.depth = v256;
  v254.maxFontSize = v257;
};
var makeSpan = function makeSpan2(v260, v261, v262, v263) {
  var v264 = new Span(v260, v261, v262, v263);
  sizeElementFromChildren(v264);
  return v264;
};
var makeSvgSpan = (v265, v266, v267, v268) => new Span(v265, v266, v267, v268);
var makeLineSpan = function makeLineSpan2(v269, v270, v271) {
  var v272 = makeSpan([v269], [], v270);
  v272.height = Math.max(v271 || v270.fontMetrics().defaultRuleThickness, v270.minRuleThickness);
  v272.style.borderBottomWidth = makeEm(v272.height);
  v272.maxFontSize = 1;
  return v272;
};
var makeAnchor = function makeAnchor2(v273, v274, v275, v276) {
  var v277 = new Anchor(v273, v274, v275, v276);
  sizeElementFromChildren(v277);
  return v277;
};
var makeFragment = function makeFragment2(v278) {
  var v279 = new DocumentFragment(v278);
  sizeElementFromChildren(v279);
  return v279;
};
var wrapFragment = function wrapFragment2(v280, v281) {
  if (v280 instanceof DocumentFragment) {
    return makeSpan([], [v280], v281);
  }
  return v280;
};
var getVListChildrenAndDepth = function getVListChildrenAndDepth2(v282) {
  if (v282.positionType === "individualShift") {
    var v283 = v282.children;
    var v284 = [v283[0]];
    var v285 = -v283[0].shift - v283[0].elem.depth;
    var v286 = v285;
    for (var v287 = 1; v287 < v283.length; v287++) {
      var v288 = -v283[v287].shift - v286 - v283[v287].elem.depth;
      var v289 = v288 - (v283[v287 - 1].elem.height + v283[v287 - 1].elem.depth);
      v286 = v286 + v288;
      v284.push({
        type: "kern",
        size: v289
      });
      v284.push(v283[v287]);
    }
    return {
      children: v284,
      depth: v285
    };
  }
  var v290;
  if (v282.positionType === "top") {
    var v291 = v282.positionData;
    for (var v292 = 0; v292 < v282.children.length; v292++) {
      var v293 = v282.children[v292];
      v291 -= v293.type === "kern" ? v293.size : v293.elem.height + v293.elem.depth;
    }
    v290 = v291;
  } else if (v282.positionType === "bottom") {
    v290 = -v282.positionData;
  } else {
    var v294 = v282.children[0];
    if (v294.type !== "elem") {
      throw new Error("First child must have type \"elem\".");
    }
    if (v282.positionType === "shift") {
      v290 = -v294.elem.depth - v282.positionData;
    } else if (v282.positionType === "firstBaseline") {
      v290 = -v294.elem.depth;
    } else {
      throw new Error("Invalid positionType " + v282.positionType + ".");
    }
  }
  return {
    children: v282.children,
    depth: v290
  };
};
var makeVList = function makeVList2(v295, v296) {
  var {
    children: v297,
    depth: v298
  } = getVListChildrenAndDepth(v295);
  var v299 = 0;
  for (var v300 = 0; v300 < v297.length; v300++) {
    var v301 = v297[v300];
    if (v301.type === "elem") {
      var v302 = v301.elem;
      v299 = Math.max(v299, v302.maxFontSize, v302.height);
    }
  }
  v299 += 2;
  var v303 = makeSpan(["pstrut"], []);
  v303.style.height = makeEm(v299);
  var v304 = [];
  var v305 = v298;
  var v306 = v298;
  var v307 = v298;
  for (var v308 = 0; v308 < v297.length; v308++) {
    var v309 = v297[v308];
    if (v309.type === "kern") {
      v307 += v309.size;
    } else {
      var v310 = v309.elem;
      var v311 = v309.wrapperClasses || [];
      var v312 = v309.wrapperStyle || {};
      var v313 = makeSpan(v311, [v303, v310], undefined, v312);
      v313.style.top = makeEm(-v299 - v307 - v310.depth);
      if (v309.marginLeft) {
        v313.style.marginLeft = v309.marginLeft;
      }
      if (v309.marginRight) {
        v313.style.marginRight = v309.marginRight;
      }
      v304.push(v313);
      v307 += v310.height + v310.depth;
    }
    v305 = Math.min(v305, v307);
    v306 = Math.max(v306, v307);
  }
  var v314 = makeSpan(["vlist"], v304);
  v314.style.height = makeEm(v306);
  var v315;
  if (v305 < 0) {
    var v316 = makeSpan([], []);
    var v317 = makeSpan(["vlist"], [v316]);
    v317.style.height = makeEm(-v305);
    var v318 = makeSpan(["vlist-s"], [new SymbolNode("​")]);
    v315 = [makeSpan(["vlist-r"], [v314, v318]), makeSpan(["vlist-r"], [v317])];
  } else {
    v315 = [makeSpan(["vlist-r"], [v314])];
  }
  var v319 = makeSpan(["vlist-t"], v315);
  if (v315.length === 2) {
    v319.classes.push("vlist-t2");
  }
  v319.height = v306;
  v319.depth = -v305;
  return v319;
};
var makeGlue = (v320, v321) => {
  var v322 = makeSpan(["mspace"], [], v321);
  var v323 = calculateSize(v320, v321);
  v322.style.marginRight = makeEm(v323);
  return v322;
};
var retrieveTextFontName = (v324, v325, v326) => {
  var v327;
  var v328;
  switch (v324) {
    case "amsrm":
      v327 = "AMS";
      break;
    case "textrm":
      v327 = "Main";
      break;
    case "textsf":
      v327 = "SansSerif";
      break;
    case "texttt":
      v327 = "Typewriter";
      break;
    default:
      v327 = v324;
  }
  if (v325 === "textbf" && v326 === "textit") {
    v328 = "BoldItalic";
  } else if (v325 === "textbf") {
    v328 = "Bold";
  } else if (v326 === "textit") {
    v328 = "Italic";
  } else {
    v328 = "Regular";
  }
  return v327 + "-" + v328;
};
var fontMap = {
  mathbf: {
    variant: "bold",
    fontName: "Main-Bold"
  },
  mathrm: {
    variant: "normal",
    fontName: "Main-Regular"
  },
  textit: {
    variant: "italic",
    fontName: "Main-Italic"
  },
  mathit: {
    variant: "italic",
    fontName: "Main-Italic"
  },
  mathnormal: {
    variant: "italic",
    fontName: "Math-Italic"
  },
  mathsfit: {
    variant: "sans-serif-italic",
    fontName: "SansSerif-Italic"
  },
  mathbb: {
    variant: "double-struck",
    fontName: "AMS-Regular"
  },
  mathcal: {
    variant: "script",
    fontName: "Caligraphic-Regular"
  },
  mathfrak: {
    variant: "fraktur",
    fontName: "Fraktur-Regular"
  },
  mathscr: {
    variant: "script",
    fontName: "Script-Regular"
  },
  mathsf: {
    variant: "sans-serif",
    fontName: "SansSerif-Regular"
  },
  mathtt: {
    variant: "monospace",
    fontName: "Typewriter-Regular"
  }
};
var svgData = {
  vec: ["vec", 0.471, 0.714],
  oiintSize1: ["oiintSize1", 0.957, 0.499],
  oiintSize2: ["oiintSize2", 1.472, 0.659],
  oiiintSize1: ["oiiintSize1", 1.304, 0.499],
  oiiintSize2: ["oiiintSize2", 1.98, 0.659]
};
var staticSvg = function staticSvg2(v329, v330) {
  var [v331, v332, v333] = svgData[v329];
  var v334 = new PathNode(v331);
  var v335 = new SvgNode([v334], {
    width: makeEm(v332),
    height: makeEm(v333),
    style: "width:" + makeEm(v332),
    viewBox: "0 0 " + v332 * 1000 + " " + v333 * 1000,
    preserveAspectRatio: "xMinYMin"
  });
  var v336 = makeSvgSpan(["overlay"], [v335], v330);
  v336.height = v333;
  v336.style.height = makeEm(v333);
  v336.style.width = makeEm(v332);
  return v336;
};
var thinspace = {
  number: 3,
  unit: "mu"
};
var mediumspace = {
  number: 4,
  unit: "mu"
};
var thickspace = {
  number: 5,
  unit: "mu"
};
var spacings = {
  mord: {
    mop: thinspace,
    mbin: mediumspace,
    mrel: thickspace,
    minner: thinspace
  },
  mop: {
    mord: thinspace,
    mop: thinspace,
    mrel: thickspace,
    minner: thinspace
  },
  mbin: {
    mord: mediumspace,
    mop: mediumspace,
    mopen: mediumspace,
    minner: mediumspace
  },
  mrel: {
    mord: thickspace,
    mop: thickspace,
    mopen: thickspace,
    minner: thickspace
  },
  mopen: {},
  mclose: {
    mop: thinspace,
    mbin: mediumspace,
    mrel: thickspace,
    minner: thinspace
  },
  mpunct: {
    mord: thinspace,
    mop: thinspace,
    mrel: thickspace,
    mopen: thinspace,
    mclose: thinspace,
    mpunct: thinspace,
    minner: thinspace
  },
  minner: {
    mord: thinspace,
    mop: thinspace,
    mbin: mediumspace,
    mrel: thickspace,
    mopen: thinspace,
    mpunct: thinspace,
    minner: thinspace
  }
};
var tightSpacings = {
  mord: {
    mop: thinspace
  },
  mop: {
    mord: thinspace,
    mop: thinspace
  },
  mbin: {},
  mrel: {},
  mopen: {},
  mclose: {
    mop: thinspace
  },
  mpunct: {},
  minner: {
    mop: thinspace
  }
};
var _functions = {};
var _htmlGroupBuilders = {};
var _mathmlGroupBuilders = {};
function defineFunction(v337) {
  var {
    type: v338,
    names: v339,
    props: v340,
    handler: v341,
    htmlBuilder: v342,
    mathmlBuilder: v343
  } = v337;
  var v344 = {
    type: v338,
    numArgs: v340.numArgs,
    argTypes: v340.argTypes,
    allowedInArgument: !!v340.allowedInArgument,
    allowedInText: !!v340.allowedInText,
    allowedInMath: v340.allowedInMath === undefined ? true : v340.allowedInMath,
    numOptionalArgs: v340.numOptionalArgs || 0,
    infix: !!v340.infix,
    primitive: !!v340.primitive,
    handler: v341
  };
  for (var v345 = 0; v345 < v339.length; ++v345) {
    _functions[v339[v345]] = v344;
  }
  if (v338) {
    if (v342) {
      _htmlGroupBuilders[v338] = v342;
    }
    if (v343) {
      _mathmlGroupBuilders[v338] = v343;
    }
  }
}
function defineFunctionBuilders(v346) {
  var {
    type: v347,
    htmlBuilder: v348,
    mathmlBuilder: v349
  } = v346;
  defineFunction({
    type: v347,
    names: [],
    props: {
      numArgs: 0
    },
    handler() {
      throw new Error("Should never be called.");
    },
    htmlBuilder: v348,
    mathmlBuilder: v349
  });
}
var normalizeArgument = function normalizeArgument2(v350) {
  if (v350.type === "ordgroup" && v350.body.length === 1) {
    return v350.body[0];
  } else {
    return v350;
  }
};
var ordargument = function ordargument2(v351) {
  if (v351.type === "ordgroup") {
    return v351.body;
  } else {
    return [v351];
  }
};
var binLeftCanceller = new Set(["leftmost", "mbin", "mopen", "mrel", "mop", "mpunct"]);
var binRightCanceller = new Set(["rightmost", "mrel", "mclose", "mpunct"]);
var styleMap$1 = {
  display: Style$1.DISPLAY,
  text: Style$1.TEXT,
  script: Style$1.SCRIPT,
  scriptscript: Style$1.SCRIPTSCRIPT
};
var DomEnum = {
  mord: "mord",
  mop: "mop",
  mbin: "mbin",
  mrel: "mrel",
  mopen: "mopen",
  mclose: "mclose",
  mpunct: "mpunct",
  minner: "minner"
};
var buildExpression$1 = function buildExpression(v352, v353, v354, v355 = [null, null]) {
  var v356 = [];
  for (var v357 = 0; v357 < v352.length; v357++) {
    var v358 = buildGroup$1(v352[v357], v353);
    if (v358 instanceof DocumentFragment) {
      var v359 = v358.children;
      v356.push(...v359);
    } else {
      v356.push(v358);
    }
  }
  tryCombineChars(v356);
  if (!v354) {
    return v356;
  }
  var v360 = v353;
  if (v352.length === 1) {
    var v361 = v352[0];
    if (v361.type === "sizing") {
      v360 = v353.havingSize(v361.size);
    } else if (v361.type === "styling") {
      v360 = v353.havingStyle(styleMap$1[v361.style]);
    }
  }
  var v362 = makeSpan([v355[0] || "leftmost"], [], v353);
  var v363 = makeSpan([v355[1] || "rightmost"], [], v353);
  var v364 = v354 === "root";
  _traverseNonSpaceNodes(v356, (v365, v366) => {
    var v367 = v366.classes[0];
    var v368 = v365.classes[0];
    if (v367 === "mbin" && binRightCanceller.has(v368)) {
      v366.classes[0] = "mord";
    } else if (v368 === "mbin" && binLeftCanceller.has(v367)) {
      v365.classes[0] = "mord";
    }
  }, {
    node: v362
  }, v363, v364);
  _traverseNonSpaceNodes(v356, (v369, v370) => {
    var v371;
    var v372;
    var v373 = getTypeOfDomTree(v370);
    var v374 = getTypeOfDomTree(v369);
    var v375 = v373 && v374 ? v369.hasClass("mtight") ? (v371 = tightSpacings[v373]) == null ? undefined : v371[v374] : (v372 = spacings[v373]) == null ? undefined : v372[v374] : null;
    if (v375) {
      return makeGlue(v375, v360);
    }
  }, {
    node: v362
  }, v363, v364);
  return v356;
};
var _traverseNonSpaceNodes = function traverseNonSpaceNodes(v376, v377, v378, v379, v380) {
  if (v379) {
    v376.push(v379);
  }
  var v381 = 0;
  for (; v381 < v376.length; v381++) {
    var v382 = v376[v381];
    var v383 = checkPartialGroup(v382);
    if (v383) {
      _traverseNonSpaceNodes(v383.children, v377, v378, null, v380);
      continue;
    }
    var v384 = !v382.hasClass("mspace");
    if (v384) {
      var v385 = v377(v382, v378.node);
      if (v385) {
        if (v378.insertAfter) {
          v378.insertAfter(v385);
        } else {
          v376.unshift(v385);
          v381++;
        }
      }
    }
    if (v384) {
      v378.node = v382;
    } else if (v380 && v382.hasClass("newline")) {
      v378.node = makeSpan(["leftmost"]);
    }
    v378.insertAfter = (v386 => v387 => {
      v376.splice(v386 + 1, 0, v387);
      v381++;
    })(v381);
  }
  if (v379) {
    v376.pop();
  }
};
var checkPartialGroup = function checkPartialGroup2(v388) {
  if (v388 instanceof DocumentFragment || v388 instanceof Anchor || v388 instanceof Span && v388.hasClass("enclosing")) {
    return v388;
  }
  return null;
};
var _getOutermostNode = function getOutermostNode(v389, v390) {
  var v391 = checkPartialGroup(v389);
  if (v391) {
    var v392 = v391.children;
    if (v392.length) {
      if (v390 === "right") {
        return _getOutermostNode(v392[v392.length - 1], "right");
      } else if (v390 === "left") {
        return _getOutermostNode(v392[0], "left");
      }
    }
  }
  return v389;
};
var getTypeOfDomTree = function getTypeOfDomTree2(v393, v394) {
  if (!v393) {
    return null;
  }
  if (v394) {
    v393 = _getOutermostNode(v393, v394);
  }
  var v395 = v393.classes[0];
  return DomEnum[v395] || null;
};
var makeNullDelimiter = function makeNullDelimiter2(v396, v397) {
  var v398 = ["nulldelimiter"].concat(v396.baseSizingClasses());
  return makeSpan(v397.concat(v398));
};
var buildGroup$1 = function buildGroup(v399, v400, v401) {
  if (!v399) {
    return makeSpan();
  }
  if (_htmlGroupBuilders[v399.type]) {
    var v402 = _htmlGroupBuilders[v399.type](v399, v400);
    if (v401 && v400.size !== v401.size) {
      v402 = makeSpan(v400.sizingClasses(v401), [v402], v400);
      var v403 = v400.sizeMultiplier / v401.sizeMultiplier;
      v402.height *= v403;
      v402.depth *= v403;
    }
    return v402;
  } else {
    throw new ParseError("Got group of unknown type: '" + v399.type + "'");
  }
};
function buildHTMLUnbreakable(v404, v405) {
  var v406 = makeSpan(["base"], v404, v405);
  var v407 = makeSpan(["strut"]);
  v407.style.height = makeEm(v406.height + v406.depth);
  if (v406.depth) {
    v407.style.verticalAlign = makeEm(-v406.depth);
  }
  v406.children.unshift(v407);
  return v406;
}
function buildHTML(v408, v409) {
  var v410 = null;
  if (v408.length === 1 && v408[0].type === "tag") {
    v410 = v408[0].tag;
    v408 = v408[0].body;
  }
  var v411 = buildExpression$1(v408, v409, "root");
  var v412;
  if (v411.length === 2 && v411[1].hasClass("tag")) {
    v412 = v411.pop();
  }
  var v413 = [];
  var v414 = [];
  for (var v415 = 0; v415 < v411.length; v415++) {
    v414.push(v411[v415]);
    if (v411[v415].hasClass("mbin") || v411[v415].hasClass("mrel") || v411[v415].hasClass("allowbreak")) {
      var v416 = false;
      while (v415 < v411.length - 1 && v411[v415 + 1].hasClass("mspace") && !v411[v415 + 1].hasClass("newline")) {
        v415++;
        v414.push(v411[v415]);
        if (v411[v415].hasClass("nobreak")) {
          v416 = true;
        }
      }
      if (!v416) {
        v413.push(buildHTMLUnbreakable(v414, v409));
        v414 = [];
      }
    } else if (v411[v415].hasClass("newline")) {
      v414.pop();
      if (v414.length > 0) {
        v413.push(buildHTMLUnbreakable(v414, v409));
        v414 = [];
      }
      v413.push(v411[v415]);
    }
  }
  if (v414.length > 0) {
    v413.push(buildHTMLUnbreakable(v414, v409));
  }
  var v417;
  if (v410) {
    v417 = buildHTMLUnbreakable(buildExpression$1(v410, v409, true), v409);
    v417.classes = ["tag"];
    v413.push(v417);
  } else if (v412) {
    v413.push(v412);
  }
  var v418 = makeSpan(["katex-html"], v413);
  v418.setAttribute("aria-hidden", "true");
  if (v417) {
    var v419 = v417.children[0];
    v419.style.height = makeEm(v418.height + v418.depth);
    if (v418.depth) {
      v419.style.verticalAlign = makeEm(-v418.depth);
    }
  }
  return v418;
}
function newDocumentFragment(v420) {
  return new DocumentFragment(v420);
}
class MathNode {
  constructor(v421, v422, v423) {
    this.type = undefined;
    this.attributes = undefined;
    this.children = undefined;
    this.classes = undefined;
    this.type = v421;
    this.attributes = {};
    this.children = v422 || [];
    this.classes = v423 || [];
  }
  setAttribute(v424, v425) {
    this.attributes[v424] = v425;
  }
  getAttribute(v426) {
    return this.attributes[v426];
  }
  toNode() {
    var v427 = document.createElementNS("http://www.w3.org/1998/Math/MathML", this.type);
    for (var v428 in this.attributes) {
      if (Object.prototype.hasOwnProperty.call(this.attributes, v428)) {
        v427.setAttribute(v428, this.attributes[v428]);
      }
    }
    if (this.classes.length > 0) {
      v427.className = createClass(this.classes);
    }
    for (var v429 = 0; v429 < this.children.length; v429++) {
      if (this.children[v429] instanceof TextNode && this.children[v429 + 1] instanceof TextNode) {
        var v430 = this.children[v429].toText() + this.children[++v429].toText();
        while (this.children[v429 + 1] instanceof TextNode) {
          v430 += this.children[++v429].toText();
        }
        v427.appendChild(new TextNode(v430).toNode());
      } else {
        v427.appendChild(this.children[v429].toNode());
      }
    }
    return v427;
  }
  toMarkup() {
    var v431 = "<" + this.type;
    for (var v432 in this.attributes) {
      if (Object.prototype.hasOwnProperty.call(this.attributes, v432)) {
        v431 += " " + v432 + "=\"";
        v431 += escape(this.attributes[v432]);
        v431 += "\"";
      }
    }
    if (this.classes.length > 0) {
      v431 += " class =\"" + escape(createClass(this.classes)) + "\"";
    }
    v431 += ">";
    for (var v433 = 0; v433 < this.children.length; v433++) {
      v431 += this.children[v433].toMarkup();
    }
    v431 += "</" + this.type + ">";
    return v431;
  }
  toText() {
    return this.children.map(v434 => v434.toText()).join("");
  }
}
class TextNode {
  constructor(v435) {
    this.text = undefined;
    this.text = v435;
  }
  toNode() {
    return document.createTextNode(this.text);
  }
  toMarkup() {
    return escape(this.toText());
  }
  toText() {
    return this.text;
  }
}
class SpaceNode {
  constructor(v436) {
    this.width = undefined;
    this.character = undefined;
    this.width = v436;
    if (v436 >= 0.05555 && v436 <= 0.05556) {
      this.character = "\u200A";
    } else if (v436 >= 0.1666 && v436 <= 0.1667) {
      this.character = "\u2009";
    } else if (v436 >= 0.2222 && v436 <= 0.2223) {
      this.character = "\u2005";
    } else if (v436 >= 0.2777 && v436 <= 0.2778) {
      this.character = "\u2005\u200A";
    } else if (v436 >= -0.05556 && v436 <= -0.05555) {
      this.character = "\u200A⁣";
    } else if (v436 >= -0.1667 && v436 <= -0.1666) {
      this.character = "\u2009⁣";
    } else if (v436 >= -0.2223 && v436 <= -0.2222) {
      this.character = "\u205F⁣";
    } else if (v436 >= -0.2778 && v436 <= -0.2777) {
      this.character = "\u2005⁣";
    } else {
      this.character = null;
    }
  }
  toNode() {
    if (this.character) {
      return document.createTextNode(this.character);
    } else {
      var v437 = document.createElementNS("http://www.w3.org/1998/Math/MathML", "mspace");
      v437.setAttribute("width", makeEm(this.width));
      return v437;
    }
  }
  toMarkup() {
    if (this.character) {
      return "<mtext>" + this.character + "</mtext>";
    } else {
      return "<mspace width=\"" + makeEm(this.width) + "\"/>";
    }
  }
  toText() {
    if (this.character) {
      return this.character;
    } else {
      return " ";
    }
  }
}
var noVariantSymbols = new Set(["\\imath", "\\jmath"]);
var rowLikeTypes = new Set(["mrow", "mtable"]);
var makeText = function makeText2(v438, v439, v440) {
  if (symbols[v439][v438] && symbols[v439][v438].replace && v438.charCodeAt(0) !== 55349 && (!ligatures.hasOwnProperty(v438) || !v440 || (!v440.fontFamily || v440.fontFamily.slice(4, 6) !== "tt") && (!v440.font || v440.font.slice(4, 6) !== "tt"))) {
    v438 = symbols[v439][v438].replace;
  }
  return new TextNode(v438);
};
var makeRow = function makeRow2(v441) {
  if (v441.length === 1) {
    return v441[0];
  } else {
    return new MathNode("mrow", v441);
  }
};
var mathFontVariants = {
  mathit: "italic",
  boldsymbol: v442 => v442.type === "textord" ? "bold" : "bold-italic",
  mathbf: "bold",
  mathbb: "double-struck",
  mathsfit: "sans-serif-italic",
  mathfrak: "fraktur",
  mathscr: "script",
  mathcal: "script",
  mathsf: "sans-serif",
  mathtt: "monospace"
};
var getVariant = (v443, v444) => {
  if (v443.mode === "text") {
    if (v444.fontFamily === "texttt") {
      return "monospace";
    } else if (v444.fontFamily === "textsf") {
      if (v444.fontShape === "textit" && v444.fontWeight === "textbf") {
        return "sans-serif-bold-italic";
      } else if (v444.fontShape === "textit") {
        return "sans-serif-italic";
      } else if (v444.fontWeight === "textbf") {
        return "bold-sans-serif";
      } else {
        return "sans-serif";
      }
    } else if (v444.fontShape === "textit" && v444.fontWeight === "textbf") {
      return "bold-italic";
    } else if (v444.fontShape === "textit") {
      return "italic";
    } else if (v444.fontWeight === "textbf") {
      return "bold";
    }
  }
  var v445 = v444.font;
  if (!v445 || v445 === "mathnormal") {
    return null;
  }
  var v446 = v443.mode;
  var v447 = mathFontVariants[v445];
  if (v447) {
    if (typeof v447 === "function") {
      return v447(v443);
    } else {
      return v447;
    }
  }
  var v448 = v443.text;
  if (noVariantSymbols.has(v448)) {
    return null;
  }
  if (symbols[v446][v448]) {
    var v449 = symbols[v446][v448].replace;
    if (v449) {
      v448 = v449;
    }
  }
  var v450 = fontMap[v445].fontName;
  if (getCharacterMetrics(v448, v450, v446)) {
    return fontMap[v445].variant;
  }
  return null;
};
function isNumberPunctuation(v451) {
  if (!v451) {
    return false;
  }
  if (v451.type === "mi" && v451.children.length === 1) {
    var v452 = v451.children[0];
    return v452 instanceof TextNode && v452.text === ".";
  } else if (v451.type === "mo" && v451.children.length === 1 && v451.getAttribute("separator") === "true" && v451.getAttribute("lspace") === "0em" && v451.getAttribute("rspace") === "0em") {
    var v453 = v451.children[0];
    return v453 instanceof TextNode && v453.text === ",";
  } else {
    return false;
  }
}
var buildExpression2 = function buildExpression3(v454, v455, v456) {
  if (v454.length === 1) {
    var v457 = buildGroup2(v454[0], v455);
    if (v456 && v457 instanceof MathNode && v457.type === "mo") {
      v457.setAttribute("lspace", "0em");
      v457.setAttribute("rspace", "0em");
    }
    return [v457];
  }
  var v458 = [];
  var v459;
  for (var v460 = 0; v460 < v454.length; v460++) {
    var v461 = buildGroup2(v454[v460], v455);
    if (v461 instanceof MathNode && v459 instanceof MathNode) {
      if (v461.type === "mtext" && v459.type === "mtext" && v461.getAttribute("mathvariant") === v459.getAttribute("mathvariant")) {
        v459.children.push(...v461.children);
        continue;
      } else if (v461.type === "mn" && v459.type === "mn") {
        v459.children.push(...v461.children);
        continue;
      } else if (isNumberPunctuation(v461) && v459.type === "mn") {
        v459.children.push(...v461.children);
        continue;
      } else if (v461.type === "mn" && isNumberPunctuation(v459)) {
        v461.children = [...v459.children, ...v461.children];
        v458.pop();
      } else if ((v461.type === "msup" || v461.type === "msub") && v461.children.length >= 1 && (v459.type === "mn" || isNumberPunctuation(v459))) {
        var v462 = v461.children[0];
        if (v462 instanceof MathNode && v462.type === "mn") {
          v462.children = [...v459.children, ...v462.children];
          v458.pop();
        }
      } else if (v459.type === "mi" && v459.children.length === 1) {
        var v463 = v459.children[0];
        if (v463 instanceof TextNode && v463.text === "̸" && (v461.type === "mo" || v461.type === "mi" || v461.type === "mn")) {
          var v464 = v461.children[0];
          if (v464 instanceof TextNode && v464.text.length > 0) {
            v464.text = v464.text.slice(0, 1) + "̸" + v464.text.slice(1);
            v458.pop();
          }
        }
      }
    }
    v458.push(v461);
    v459 = v461;
  }
  return v458;
};
var buildExpressionRow = function buildExpressionRow2(v465, v466, v467) {
  return makeRow(buildExpression2(v465, v466, v467));
};
var buildGroup2 = function buildGroup3(v468, v469) {
  if (!v468) {
    return new MathNode("mrow");
  }
  if (_mathmlGroupBuilders[v468.type]) {
    return _mathmlGroupBuilders[v468.type](v468, v469);
  } else {
    throw new ParseError("Got group of unknown type: '" + v468.type + "'");
  }
};
function buildMathML(v470, v471, v472, v473, v474) {
  var v475 = buildExpression2(v470, v472);
  var v476;
  if (v475.length === 1 && v475[0] instanceof MathNode && rowLikeTypes.has(v475[0].type)) {
    v476 = v475[0];
  } else {
    v476 = new MathNode("mrow", v475);
  }
  var v477 = new MathNode("annotation", [new TextNode(v471)]);
  v477.setAttribute("encoding", "application/x-tex");
  var v478 = new MathNode("semantics", [v476, v477]);
  var v479 = new MathNode("math", [v478]);
  v479.setAttribute("xmlns", "http://www.w3.org/1998/Math/MathML");
  if (v473) {
    v479.setAttribute("display", "block");
  }
  var v480 = v474 ? "katex" : "katex-mathml";
  return makeSpan([v480], [v479]);
}
var sizeStyleMap = [[1, 1, 1], [2, 1, 1], [3, 1, 1], [4, 2, 1], [5, 2, 1], [6, 3, 1], [7, 4, 2], [8, 6, 3], [9, 7, 6], [10, 8, 7], [11, 10, 9]];
var sizeMultipliers = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.44, 1.728, 2.074, 2.488];
var sizeAtStyle = function sizeAtStyle2(v481, v482) {
  if (v482.size < 2) {
    return v481;
  } else {
    return sizeStyleMap[v481 - 1][v482.size - 1];
  }
};
class Options {
  constructor(v483) {
    this.style = undefined;
    this.color = undefined;
    this.size = undefined;
    this.textSize = undefined;
    this.phantom = undefined;
    this.font = undefined;
    this.fontFamily = undefined;
    this.fontWeight = undefined;
    this.fontShape = undefined;
    this.sizeMultiplier = undefined;
    this.maxSize = undefined;
    this.minRuleThickness = undefined;
    this._fontMetrics = undefined;
    this.style = v483.style;
    this.color = v483.color;
    this.size = v483.size || Options.BASESIZE;
    this.textSize = v483.textSize || this.size;
    this.phantom = !!v483.phantom;
    this.font = v483.font || "";
    this.fontFamily = v483.fontFamily || "";
    this.fontWeight = v483.fontWeight || "";
    this.fontShape = v483.fontShape || "";
    this.sizeMultiplier = sizeMultipliers[this.size - 1];
    this.maxSize = v483.maxSize;
    this.minRuleThickness = v483.minRuleThickness;
    this._fontMetrics = undefined;
  }
  extend(v484) {
    var v485 = {
      style: this.style,
      size: this.size,
      textSize: this.textSize,
      color: this.color,
      phantom: this.phantom,
      font: this.font,
      fontFamily: this.fontFamily,
      fontWeight: this.fontWeight,
      fontShape: this.fontShape,
      maxSize: this.maxSize,
      minRuleThickness: this.minRuleThickness
    };
    Object.assign(v485, v484);
    return new Options(v485);
  }
  havingStyle(v486) {
    if (this.style === v486) {
      return this;
    } else {
      return this.extend({
        style: v486,
        size: sizeAtStyle(this.textSize, v486)
      });
    }
  }
  havingCrampedStyle() {
    return this.havingStyle(this.style.cramp());
  }
  havingSize(v487) {
    if (this.size === v487 && this.textSize === v487) {
      return this;
    } else {
      return this.extend({
        style: this.style.text(),
        size: v487,
        textSize: v487,
        sizeMultiplier: sizeMultipliers[v487 - 1]
      });
    }
  }
  havingBaseStyle(v488) {
    v488 = v488 || this.style.text();
    var v489 = sizeAtStyle(Options.BASESIZE, v488);
    if (this.size === v489 && this.textSize === Options.BASESIZE && this.style === v488) {
      return this;
    } else {
      return this.extend({
        style: v488,
        size: v489
      });
    }
  }
  havingBaseSizing() {
    var v490;
    switch (this.style.id) {
      case 4:
      case 5:
        v490 = 3;
        break;
      case 6:
      case 7:
        v490 = 1;
        break;
      default:
        v490 = 6;
    }
    return this.extend({
      style: this.style.text(),
      size: v490
    });
  }
  withColor(v491) {
    return this.extend({
      color: v491
    });
  }
  withPhantom() {
    return this.extend({
      phantom: true
    });
  }
  withFont(v492) {
    return this.extend({
      font: v492
    });
  }
  withTextFontFamily(v493) {
    return this.extend({
      fontFamily: v493,
      font: ""
    });
  }
  withTextFontWeight(v494) {
    return this.extend({
      fontWeight: v494,
      font: ""
    });
  }
  withTextFontShape(v495) {
    return this.extend({
      fontShape: v495,
      font: ""
    });
  }
  sizingClasses(v496) {
    if (v496.size !== this.size) {
      return ["sizing", "reset-size" + v496.size, "size" + this.size];
    } else {
      return [];
    }
  }
  baseSizingClasses() {
    if (this.size !== Options.BASESIZE) {
      return ["sizing", "reset-size" + this.size, "size" + Options.BASESIZE];
    } else {
      return [];
    }
  }
  fontMetrics() {
    if (!this._fontMetrics) {
      this._fontMetrics = getGlobalMetrics(this.size);
    }
    return this._fontMetrics;
  }
  getColor() {
    if (this.phantom) {
      return "transparent";
    } else {
      return this.color;
    }
  }
}
Options.BASESIZE = 6;
var optionsFromSettings = function optionsFromSettings2(v497) {
  return new Options({
    style: v497.displayMode ? Style$1.DISPLAY : Style$1.TEXT,
    maxSize: v497.maxSize,
    minRuleThickness: v497.minRuleThickness
  });
};
var displayWrap = function displayWrap2(v498, v499) {
  if (v499.displayMode) {
    var v500 = ["katex-display"];
    if (v499.leqno) {
      v500.push("leqno");
    }
    if (v499.fleqn) {
      v500.push("fleqn");
    }
    v498 = makeSpan(v500, [v498]);
  }
  return v498;
};
var buildTree = function buildTree2(v501, v502, v503) {
  var v504 = optionsFromSettings(v503);
  var v505;
  if (v503.output === "mathml") {
    return buildMathML(v501, v502, v504, v503.displayMode, true);
  } else if (v503.output === "html") {
    var v506 = buildHTML(v501, v504);
    v505 = makeSpan(["katex"], [v506]);
  } else {
    var v507 = buildMathML(v501, v502, v504, v503.displayMode, false);
    var v508 = buildHTML(v501, v504);
    v505 = makeSpan(["katex"], [v507, v508]);
  }
  return displayWrap(v505, v503);
};
var buildHTMLTree = function buildHTMLTree2(v509, v510, v511) {
  var v512 = optionsFromSettings(v511);
  var v513 = buildHTML(v509, v512);
  var v514 = makeSpan(["katex"], [v513]);
  return displayWrap(v514, v511);
};
var stretchyCodePoint = {
  widehat: "^",
  widecheck: "ˇ",
  widetilde: "~",
  utilde: "~",
  overleftarrow: "←",
  underleftarrow: "←",
  xleftarrow: "←",
  overrightarrow: "→",
  underrightarrow: "→",
  xrightarrow: "→",
  underbrace: "⏟",
  overbrace: "⏞",
  underbracket: "⎵",
  overbracket: "⎴",
  overgroup: "⏠",
  undergroup: "⏡",
  overleftrightarrow: "↔",
  underleftrightarrow: "↔",
  xleftrightarrow: "↔",
  Overrightarrow: "⇒",
  xRightarrow: "⇒",
  overleftharpoon: "↼",
  xleftharpoonup: "↼",
  overrightharpoon: "⇀",
  xrightharpoonup: "⇀",
  xLeftarrow: "⇐",
  xLeftrightarrow: "⇔",
  xhookleftarrow: "↩",
  xhookrightarrow: "↪",
  xmapsto: "↦",
  xrightharpoondown: "⇁",
  xleftharpoondown: "↽",
  xrightleftharpoons: "⇌",
  xleftrightharpoons: "⇋",
  xtwoheadleftarrow: "↞",
  xtwoheadrightarrow: "↠",
  xlongequal: "=",
  xtofrom: "⇄",
  xrightleftarrows: "⇄",
  xrightequilibrium: "⇌",
  xleftequilibrium: "⇋",
  "\\cdrightarrow": "→",
  "\\cdleftarrow": "←",
  "\\cdlongequal": "="
};
var stretchyMathML = function stretchyMathML2(v515) {
  var v516 = new MathNode("mo", [new TextNode(stretchyCodePoint[v515.replace(/^\\/, "")])]);
  v516.setAttribute("stretchy", "true");
  return v516;
};
var katexImagesData = {
  overrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
  overleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
  underrightarrow: [["rightarrow"], 0.888, 522, "xMaxYMin"],
  underleftarrow: [["leftarrow"], 0.888, 522, "xMinYMin"],
  xrightarrow: [["rightarrow"], 1.469, 522, "xMaxYMin"],
  "\\cdrightarrow": [["rightarrow"], 3, 522, "xMaxYMin"],
  xleftarrow: [["leftarrow"], 1.469, 522, "xMinYMin"],
  "\\cdleftarrow": [["leftarrow"], 3, 522, "xMinYMin"],
  Overrightarrow: [["doublerightarrow"], 0.888, 560, "xMaxYMin"],
  xRightarrow: [["doublerightarrow"], 1.526, 560, "xMaxYMin"],
  xLeftarrow: [["doubleleftarrow"], 1.526, 560, "xMinYMin"],
  overleftharpoon: [["leftharpoon"], 0.888, 522, "xMinYMin"],
  xleftharpoonup: [["leftharpoon"], 0.888, 522, "xMinYMin"],
  xleftharpoondown: [["leftharpoondown"], 0.888, 522, "xMinYMin"],
  overrightharpoon: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
  xrightharpoonup: [["rightharpoon"], 0.888, 522, "xMaxYMin"],
  xrightharpoondown: [["rightharpoondown"], 0.888, 522, "xMaxYMin"],
  xlongequal: [["longequal"], 0.888, 334, "xMinYMin"],
  "\\cdlongequal": [["longequal"], 3, 334, "xMinYMin"],
  xtwoheadleftarrow: [["twoheadleftarrow"], 0.888, 334, "xMinYMin"],
  xtwoheadrightarrow: [["twoheadrightarrow"], 0.888, 334, "xMaxYMin"],
  overleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
  overbrace: [["leftbrace", "midbrace", "rightbrace"], 1.6, 548],
  underbrace: [["leftbraceunder", "midbraceunder", "rightbraceunder"], 1.6, 548],
  underleftrightarrow: [["leftarrow", "rightarrow"], 0.888, 522],
  xleftrightarrow: [["leftarrow", "rightarrow"], 1.75, 522],
  xLeftrightarrow: [["doubleleftarrow", "doublerightarrow"], 1.75, 560],
  xrightleftharpoons: [["leftharpoondownplus", "rightharpoonplus"], 1.75, 716],
  xleftrightharpoons: [["leftharpoonplus", "rightharpoondownplus"], 1.75, 716],
  xhookleftarrow: [["leftarrow", "righthook"], 1.08, 522],
  xhookrightarrow: [["lefthook", "rightarrow"], 1.08, 522],
  overlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
  underlinesegment: [["leftlinesegment", "rightlinesegment"], 0.888, 522],
  overbracket: [["leftbracketover", "rightbracketover"], 1.6, 440],
  underbracket: [["leftbracketunder", "rightbracketunder"], 1.6, 410],
  overgroup: [["leftgroup", "rightgroup"], 0.888, 342],
  undergroup: [["leftgroupunder", "rightgroupunder"], 0.888, 342],
  xmapsto: [["leftmapsto", "rightarrow"], 1.5, 522],
  xtofrom: [["leftToFrom", "rightToFrom"], 1.75, 528],
  xrightleftarrows: [["baraboveleftarrow", "rightarrowabovebar"], 1.75, 901],
  xrightequilibrium: [["baraboveshortleftharpoon", "rightharpoonaboveshortbar"], 1.75, 716],
  xleftequilibrium: [["shortbaraboveleftharpoon", "shortrightharpoonabovebar"], 1.75, 716]
};
var wideAccentLabels = new Set(["widehat", "widecheck", "widetilde", "utilde"]);
var stretchySvg = function stretchySvg2(v517, v518) {
  function v519() {
    var v520 = 400000;
    var v521 = v517.label.slice(1);
    if (wideAccentLabels.has(v521) && "base" in v517) {
      var v522 = v517.base.type === "ordgroup" ? v517.base.body.length : 1;
      var v523;
      var v524;
      var v525;
      if (v522 > 5) {
        if (v521 === "widehat" || v521 === "widecheck") {
          v523 = 420;
          v520 = 2364;
          v525 = 0.42;
          v524 = v521 + "4";
        } else {
          v523 = 312;
          v520 = 2340;
          v525 = 0.34;
          v524 = "tilde4";
        }
      } else {
        var v526 = [1, 1, 2, 2, 3, 3][v522];
        if (v521 === "widehat" || v521 === "widecheck") {
          v520 = [0, 1062, 2364, 2364, 2364][v526];
          v523 = [0, 239, 300, 360, 420][v526];
          v525 = [0, 0.24, 0.3, 0.3, 0.36, 0.42][v526];
          v524 = v521 + v526;
        } else {
          v520 = [0, 600, 1033, 2339, 2340][v526];
          v523 = [0, 260, 286, 306, 312][v526];
          v525 = [0, 0.26, 0.286, 0.3, 0.306, 0.34][v526];
          v524 = "tilde" + v526;
        }
      }
      var v527 = new PathNode(v524);
      var v528 = new SvgNode([v527], {
        width: "100%",
        height: makeEm(v525),
        viewBox: "0 0 " + v520 + " " + v523,
        preserveAspectRatio: "none"
      });
      return {
        span: makeSvgSpan([], [v528], v518),
        minWidth: 0,
        height: v525
      };
    } else {
      var v529 = [];
      var v530 = katexImagesData[v521];
      if (!v530) {
        throw new Error("No SVG data for \"" + v521 + "\".");
      }
      var [v531, v532, v533] = v530;
      var v534 = v533 / 1000;
      var v535 = v531.length;
      var v536;
      var v537;
      if (v535 === 1) {
        if (v530.length !== 4) {
          throw new Error("Expected 4-tuple for single-path SVG data \"" + v521 + "\".");
        }
        v536 = ["hide-tail"];
        v537 = [v530[3]];
      } else if (v535 === 2) {
        v536 = ["halfarrow-left", "halfarrow-right"];
        v537 = ["xMinYMin", "xMaxYMin"];
      } else if (v535 === 3) {
        v536 = ["brace-left", "brace-center", "brace-right"];
        v537 = ["xMinYMin", "xMidYMin", "xMaxYMin"];
      } else {
        throw new Error("Correct katexImagesData or update code here to support\n                    " + v535 + " children.");
      }
      for (var v538 = 0; v538 < v535; v538++) {
        var v539 = new PathNode(v531[v538]);
        var v540 = new SvgNode([v539], {
          width: "400em",
          height: makeEm(v534),
          viewBox: "0 0 " + v520 + " " + v533,
          preserveAspectRatio: v537[v538] + " slice"
        });
        var v541 = makeSvgSpan([v536[v538]], [v540], v518);
        if (v535 === 1) {
          return {
            span: v541,
            minWidth: v532,
            height: v534
          };
        } else {
          v541.style.height = makeEm(v534);
          v529.push(v541);
        }
      }
      return {
        span: makeSpan(["stretchy"], v529, v518),
        minWidth: v532,
        height: v534
      };
    }
  }
  var {
    span: v542,
    minWidth: v543,
    height: v544
  } = v519();
  v542.height = v544;
  v542.style.height = makeEm(v544);
  if (v543 > 0) {
    v542.style.minWidth = makeEm(v543);
  }
  return v542;
};
var stretchyEnclose = function stretchyEnclose2(v545, v546, v547, v548, v549) {
  var v550;
  var v551 = v545.height + v545.depth + v547 + v548;
  if (/fbox|color|angl/.test(v546)) {
    v550 = makeSpan(["stretchy", v546], [], v549);
    if (v546 === "fbox") {
      var v552 = v549.color && v549.getColor();
      if (v552) {
        v550.style.borderColor = v552;
      }
    }
  } else {
    var v553 = [];
    if (/^[bx]cancel$/.test(v546)) {
      v553.push(new LineNode({
        x1: "0",
        y1: "0",
        x2: "100%",
        y2: "100%",
        "stroke-width": "0.046em"
      }));
    }
    if (/^x?cancel$/.test(v546)) {
      v553.push(new LineNode({
        x1: "0",
        y1: "100%",
        x2: "100%",
        y2: "0",
        "stroke-width": "0.046em"
      }));
    }
    var v554 = new SvgNode(v553, {
      width: "100%",
      height: makeEm(v551)
    });
    v550 = makeSvgSpan([], [v554], v549);
  }
  v550.height = v551;
  v550.style.height = makeEm(v551);
  return v550;
};
var ATOMS = {
  bin: 1,
  close: 1,
  inner: 1,
  open: 1,
  punct: 1,
  rel: 1
};
var NON_ATOMS = {
  "accent-token": 1,
  mathord: 1,
  "op-token": 1,
  spacing: 1,
  textord: 1
};
function isAtom(v555) {
  return v555 in ATOMS;
}
function assertNodeType(v556, v557) {
  if (!v556 || v556.type !== v557) {
    throw new Error("Expected node of type " + v557 + ", but got " + (v556 ? "node of type " + v556.type : String(v556)));
  }
  return v556;
}
function assertSymbolNodeType(v558) {
  var v559 = checkSymbolNodeType(v558);
  if (!v559) {
    throw new Error("Expected node of symbol group type, but got " + (v558 ? "node of type " + v558.type : String(v558)));
  }
  return v559;
}
function checkSymbolNodeType(v560) {
  if (v560 && (v560.type === "atom" || NON_ATOMS.hasOwnProperty(v560.type))) {
    return v560;
  }
  return null;
}
var getBaseSymbol = v561 => {
  if (v561 instanceof SymbolNode) {
    return v561;
  }
  if (hasHtmlDomChildren(v561) && v561.children.length === 1) {
    return getBaseSymbol(v561.children[0]);
  }
};
var htmlBuilder$a = (v562, v563) => {
  var v564;
  var v565;
  var v566;
  if (v562 && v562.type === "supsub") {
    v565 = assertNodeType(v562.base, "accent");
    v564 = v565.base;
    v562.base = v564;
    v566 = assertSpan(buildGroup$1(v562, v563));
    v562.base = v565;
  } else {
    v565 = assertNodeType(v562, "accent");
    v564 = v565.base;
  }
  var v567 = buildGroup$1(v564, v563.havingCrampedStyle());
  var v568 = v565.isShifty && isCharacterBox(v564);
  var v569 = 0;
  if (v568) {
    var v570;
    v569 = ((v570 = getBaseSymbol(v567)) == null ? undefined : v570.skew) ?? 0;
  }
  var v571 = v565.label === "\\c";
  var v572 = v571 ? v567.height + v567.depth : Math.min(v567.height, v563.fontMetrics().xHeight);
  var v573;
  if (!v565.isStretchy) {
    var v574;
    var v575;
    if (v565.label === "\\vec") {
      v574 = staticSvg("vec", v563);
      v575 = svgData.vec[1];
    } else {
      v574 = makeOrd({
        mode: v565.mode,
        text: v565.label
      }, v563, "textord");
      v574 = assertSymbolDomNode(v574);
      v574.italic = 0;
      v575 = v574.width;
      if (v571) {
        v572 += v574.depth;
      }
    }
    v573 = makeSpan(["accent-body"], [v574]);
    var v576 = v565.label === "\\textcircled";
    if (v576) {
      v573.classes.push("accent-full");
      v572 = v567.height;
    }
    var v577 = v569;
    if (!v576) {
      v577 -= v575 / 2;
    }
    v573.style.left = makeEm(v577);
    if (v565.label === "\\textcircled") {
      v573.style.top = ".2em";
    }
    v573 = makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: v567
      }, {
        type: "kern",
        size: -v572
      }, {
        type: "elem",
        elem: v573
      }]
    });
  } else {
    v573 = stretchySvg(v565, v563);
    v573 = makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: v567
      }, {
        type: "elem",
        elem: v573,
        wrapperClasses: ["svg-align"],
        wrapperStyle: v569 > 0 ? {
          width: "calc(100% - " + makeEm(v569 * 2) + ")",
          marginLeft: makeEm(v569 * 2)
        } : undefined
      }]
    });
  }
  var v578 = makeSpan(["mord", "accent"], [v573], v563);
  if (v566) {
    v566.children[0] = v578;
    v566.height = Math.max(v578.height, v566.height);
    v566.classes[0] = "mord";
    return v566;
  } else {
    return v578;
  }
};
var mathmlBuilder$9 = (v579, v580) => {
  var v581 = v579.isStretchy ? stretchyMathML(v579.label) : new MathNode("mo", [makeText(v579.label, v579.mode)]);
  var v582 = new MathNode("mover", [buildGroup2(v579.base, v580), v581]);
  v582.setAttribute("accent", "true");
  return v582;
};
var NON_STRETCHY_ACCENT_REGEX = new RegExp(["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot", "\\mathring"].map(v583 => "\\" + v583).join("|"));
defineFunction({
  type: "accent",
  names: ["\\acute", "\\grave", "\\ddot", "\\tilde", "\\bar", "\\breve", "\\check", "\\hat", "\\vec", "\\dot", "\\mathring", "\\widecheck", "\\widehat", "\\widetilde", "\\overrightarrow", "\\overleftarrow", "\\Overrightarrow", "\\overleftrightarrow", "\\overgroup", "\\overlinesegment", "\\overleftharpoon", "\\overrightharpoon"],
  props: {
    numArgs: 1
  },
  handler: (v584, v585) => {
    var v586 = normalizeArgument(v585[0]);
    var v587 = !NON_STRETCHY_ACCENT_REGEX.test(v584.funcName);
    var v588 = !v587 || v584.funcName === "\\widehat" || v584.funcName === "\\widetilde" || v584.funcName === "\\widecheck";
    return {
      type: "accent",
      mode: v584.parser.mode,
      label: v584.funcName,
      isStretchy: v587,
      isShifty: v588,
      base: v586
    };
  },
  htmlBuilder: htmlBuilder$a,
  mathmlBuilder: mathmlBuilder$9
});
defineFunction({
  type: "accent",
  names: ["\\'", "\\`", "\\^", "\\~", "\\=", "\\u", "\\.", "\\\"", "\\c", "\\r", "\\H", "\\v", "\\textcircled"],
  props: {
    numArgs: 1,
    allowedInText: true,
    allowedInMath: true,
    argTypes: ["primitive"]
  },
  handler: (v589, v590) => {
    var v591 = v590[0];
    var v592 = v589.parser.mode;
    if (v592 === "math") {
      v589.parser.settings.reportNonstrict("mathVsTextAccents", "LaTeX's accent " + v589.funcName + " works only in text mode");
      v592 = "text";
    }
    return {
      type: "accent",
      mode: v592,
      label: v589.funcName,
      isStretchy: false,
      isShifty: true,
      base: v591
    };
  },
  htmlBuilder: htmlBuilder$a,
  mathmlBuilder: mathmlBuilder$9
});
defineFunction({
  type: "accentUnder",
  names: ["\\underleftarrow", "\\underrightarrow", "\\underleftrightarrow", "\\undergroup", "\\underlinesegment", "\\utilde"],
  props: {
    numArgs: 1
  },
  handler: (v593, v594) => {
    var {
      parser: v595,
      funcName: v596
    } = v593;
    var v597 = v594[0];
    return {
      type: "accentUnder",
      mode: v595.mode,
      label: v596,
      base: v597
    };
  },
  htmlBuilder: (v598, v599) => {
    var v600 = buildGroup$1(v598.base, v599);
    var v601 = stretchySvg(v598, v599);
    var v602 = v598.label === "\\utilde" ? 0.12 : 0;
    var v603 = makeVList({
      positionType: "top",
      positionData: v600.height,
      children: [{
        type: "elem",
        elem: v601,
        wrapperClasses: ["svg-align"]
      }, {
        type: "kern",
        size: v602
      }, {
        type: "elem",
        elem: v600
      }]
    });
    return makeSpan(["mord", "accentunder"], [v603], v599);
  },
  mathmlBuilder: (v604, v605) => {
    var v606 = stretchyMathML(v604.label);
    var v607 = new MathNode("munder", [buildGroup2(v604.base, v605), v606]);
    v607.setAttribute("accentunder", "true");
    return v607;
  }
});
var paddedNode = v608 => {
  var v609 = new MathNode("mpadded", v608 ? [v608] : []);
  v609.setAttribute("width", "+0.6em");
  v609.setAttribute("lspace", "0.3em");
  return v609;
};
defineFunction({
  type: "xArrow",
  names: ["\\xleftarrow", "\\xrightarrow", "\\xLeftarrow", "\\xRightarrow", "\\xleftrightarrow", "\\xLeftrightarrow", "\\xhookleftarrow", "\\xhookrightarrow", "\\xmapsto", "\\xrightharpoondown", "\\xrightharpoonup", "\\xleftharpoondown", "\\xleftharpoonup", "\\xrightleftharpoons", "\\xleftrightharpoons", "\\xlongequal", "\\xtwoheadrightarrow", "\\xtwoheadleftarrow", "\\xtofrom", "\\xrightleftarrows", "\\xrightequilibrium", "\\xleftequilibrium", "\\\\cdrightarrow", "\\\\cdleftarrow", "\\\\cdlongequal"],
  props: {
    numArgs: 1,
    numOptionalArgs: 1
  },
  handler(v610, v611, v612) {
    var {
      parser: v613,
      funcName: v614
    } = v610;
    return {
      type: "xArrow",
      mode: v613.mode,
      label: v614,
      body: v611[0],
      below: v612[0]
    };
  },
  htmlBuilder(v615, v616) {
    var v617 = v616.style;
    var v618 = v616.havingStyle(v617.sup());
    var v619 = wrapFragment(buildGroup$1(v615.body, v618, v616), v616);
    var v620 = v615.label.slice(0, 2) === "\\x" ? "x" : "cd";
    v619.classes.push(v620 + "-arrow-pad");
    var v621;
    if (v615.below) {
      v618 = v616.havingStyle(v617.sub());
      v621 = wrapFragment(buildGroup$1(v615.below, v618, v616), v616);
      v621.classes.push(v620 + "-arrow-pad");
    }
    var v622 = stretchySvg(v615, v616);
    var v623 = -v616.fontMetrics().axisHeight + v622.height * 0.5;
    var v624 = -v616.fontMetrics().axisHeight - v622.height * 0.5 - 0.111;
    if (v619.depth > 0.25 || v615.label === "\\xleftequilibrium") {
      v624 -= v619.depth;
    }
    var v625;
    if (v621) {
      var v626 = -v616.fontMetrics().axisHeight + v621.height + v622.height * 0.5 + 0.111;
      v625 = makeVList({
        positionType: "individualShift",
        children: [{
          type: "elem",
          elem: v619,
          shift: v624
        }, {
          type: "elem",
          elem: v622,
          shift: v623,
          wrapperClasses: ["svg-align"]
        }, {
          type: "elem",
          elem: v621,
          shift: v626
        }]
      });
    } else {
      v625 = makeVList({
        positionType: "individualShift",
        children: [{
          type: "elem",
          elem: v619,
          shift: v624
        }, {
          type: "elem",
          elem: v622,
          shift: v623,
          wrapperClasses: ["svg-align"]
        }]
      });
    }
    return makeSpan(["mrel", "x-arrow"], [v625], v616);
  },
  mathmlBuilder(v627, v628) {
    var v629 = stretchyMathML(v627.label);
    v629.setAttribute("minsize", v627.label.charAt(0) === "x" ? "1.75em" : "3.0em");
    var v630;
    if (v627.body) {
      var v631 = paddedNode(buildGroup2(v627.body, v628));
      if (v627.below) {
        var v632 = paddedNode(buildGroup2(v627.below, v628));
        v630 = new MathNode("munderover", [v629, v632, v631]);
      } else {
        v630 = new MathNode("mover", [v629, v631]);
      }
    } else if (v627.below) {
      var v633 = paddedNode(buildGroup2(v627.below, v628));
      v630 = new MathNode("munder", [v629, v633]);
    } else {
      v630 = paddedNode();
      v630 = new MathNode("mover", [v629, v630]);
    }
    return v630;
  }
});
function htmlBuilder$9(v634, v635) {
  var v636 = buildExpression$1(v634.body, v635, true);
  return makeSpan([v634.mclass], v636, v635);
}
function mathmlBuilder$8(v637, v638) {
  var v639;
  var v640 = buildExpression2(v637.body, v638);
  if (v637.mclass === "minner") {
    v639 = new MathNode("mpadded", v640);
  } else if (v637.mclass === "mord") {
    if (v637.isCharacterBox) {
      v639 = v640[0];
      v639.type = "mi";
    } else {
      v639 = new MathNode("mi", v640);
    }
  } else {
    if (v637.isCharacterBox) {
      v639 = v640[0];
      v639.type = "mo";
    } else {
      v639 = new MathNode("mo", v640);
    }
    if (v637.mclass === "mbin") {
      v639.attributes.lspace = "0.22em";
      v639.attributes.rspace = "0.22em";
    } else if (v637.mclass === "mpunct") {
      v639.attributes.lspace = "0em";
      v639.attributes.rspace = "0.17em";
    } else if (v637.mclass === "mopen" || v637.mclass === "mclose") {
      v639.attributes.lspace = "0em";
      v639.attributes.rspace = "0em";
    } else if (v637.mclass === "minner") {
      v639.attributes.lspace = "0.0556em";
      v639.attributes.width = "+0.1111em";
    }
  }
  return v639;
}
defineFunction({
  type: "mclass",
  names: ["\\mathord", "\\mathbin", "\\mathrel", "\\mathopen", "\\mathclose", "\\mathpunct", "\\mathinner"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler(v641, v642) {
    var {
      parser: v643,
      funcName: v644
    } = v641;
    var v645 = v642[0];
    return {
      type: "mclass",
      mode: v643.mode,
      mclass: "m" + v644.slice(5),
      body: ordargument(v645),
      isCharacterBox: isCharacterBox(v645)
    };
  },
  htmlBuilder: htmlBuilder$9,
  mathmlBuilder: mathmlBuilder$8
});
var binrelClass = v646 => {
  var v647 = v646.type === "ordgroup" && v646.body.length ? v646.body[0] : v646;
  if (v647.type === "atom" && (v647.family === "bin" || v647.family === "rel")) {
    return "m" + v647.family;
  } else {
    return "mord";
  }
};
defineFunction({
  type: "mclass",
  names: ["\\@binrel"],
  props: {
    numArgs: 2
  },
  handler(v648, v649) {
    var {
      parser: v650
    } = v648;
    return {
      type: "mclass",
      mode: v650.mode,
      mclass: binrelClass(v649[0]),
      body: ordargument(v649[1]),
      isCharacterBox: isCharacterBox(v649[1])
    };
  }
});
defineFunction({
  type: "mclass",
  names: ["\\stackrel", "\\overset", "\\underset"],
  props: {
    numArgs: 2
  },
  handler(v651, v652) {
    var {
      parser: v653,
      funcName: v654
    } = v651;
    var v655 = v652[1];
    var v656 = v652[0];
    var v657;
    if (v654 !== "\\stackrel") {
      v657 = binrelClass(v655);
    } else {
      v657 = "mrel";
    }
    var v658 = {
      type: "op",
      mode: v655.mode,
      limits: true,
      alwaysHandleSupSub: true,
      parentIsSupSub: false,
      symbol: false,
      suppressBaseShift: v654 !== "\\stackrel",
      body: ordargument(v655)
    };
    var v659 = {
      type: "supsub",
      mode: v656.mode,
      base: v658,
      sup: v654 === "\\underset" ? null : v656,
      sub: v654 === "\\underset" ? v656 : null
    };
    return {
      type: "mclass",
      mode: v653.mode,
      mclass: v657,
      body: [v659],
      isCharacterBox: isCharacterBox(v659)
    };
  },
  htmlBuilder: htmlBuilder$9,
  mathmlBuilder: mathmlBuilder$8
});
defineFunction({
  type: "pmb",
  names: ["\\pmb"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler(v660, v661) {
    var {
      parser: v662
    } = v660;
    return {
      type: "pmb",
      mode: v662.mode,
      mclass: binrelClass(v661[0]),
      body: ordargument(v661[0])
    };
  },
  htmlBuilder(v663, v664) {
    var v665 = buildExpression$1(v663.body, v664, true);
    var v666 = makeSpan([v663.mclass], v665, v664);
    v666.style.textShadow = "0.02em 0.01em 0.04px";
    return v666;
  },
  mathmlBuilder(v667, v668) {
    var v669 = buildExpression2(v667.body, v668);
    var v670 = new MathNode("mstyle", v669);
    v670.setAttribute("style", "text-shadow: 0.02em 0.01em 0.04px");
    return v670;
  }
});
var cdArrowFunctionName = {
  ">": "\\\\cdrightarrow",
  "<": "\\\\cdleftarrow",
  "=": "\\\\cdlongequal",
  A: "\\uparrow",
  V: "\\downarrow",
  "|": "\\Vert",
  ".": "no arrow"
};
var newCell = () => {
  return {
    type: "styling",
    body: [],
    mode: "math",
    style: "display",
    resetFont: true
  };
};
var isStartOfArrow = v671 => {
  return v671.type === "textord" && v671.text === "@";
};
var isLabelEnd = (v672, v673) => {
  return (v672.type === "mathord" || v672.type === "atom") && v672.text === v673;
};
function cdArrow(v674, v675, v676) {
  var v677 = cdArrowFunctionName[v674];
  switch (v677) {
    case "\\\\cdrightarrow":
    case "\\\\cdleftarrow":
      return v676.callFunction(v677, [v675[0]], [v675[1]]);
    case "\\uparrow":
    case "\\downarrow":
      {
        var v678 = v676.callFunction("\\\\cdleft", [v675[0]], []);
        var v679 = {
          type: "atom",
          text: v677,
          mode: "math",
          family: "rel"
        };
        var v680 = v676.callFunction("\\Big", [v679], []);
        var v681 = v676.callFunction("\\\\cdright", [v675[1]], []);
        var v682 = {
          type: "ordgroup",
          mode: "math",
          body: [v678, v680, v681]
        };
        return v676.callFunction("\\\\cdparent", [v682], []);
      }
    case "\\\\cdlongequal":
      return v676.callFunction("\\\\cdlongequal", [], []);
    case "\\Vert":
      {
        var v683 = {
          type: "textord",
          text: "\\Vert",
          mode: "math"
        };
        return v676.callFunction("\\Big", [v683], []);
      }
    default:
      return {
        type: "textord",
        text: " ",
        mode: "math"
      };
  }
}
function parseCD(v684) {
  var v685 = [];
  v684.gullet.beginGroup();
  v684.gullet.macros.set("\\cr", "\\\\\\relax");
  v684.gullet.beginGroup();
  while (true) {
    v685.push(v684.parseExpression(false, "\\\\"));
    v684.gullet.endGroup();
    v684.gullet.beginGroup();
    var v686 = v684.fetch().text;
    if (v686 === "&" || v686 === "\\\\") {
      v684.consume();
    } else if (v686 === "\\end") {
      if (v685[v685.length - 1].length === 0) {
        v685.pop();
      }
      break;
    } else {
      throw new ParseError("Expected \\\\ or \\cr or \\end", v684.nextToken);
    }
  }
  var v687 = [];
  var v688 = [v687];
  for (var v689 = 0; v689 < v685.length; v689++) {
    var v690 = v685[v689];
    var v691 = newCell();
    for (var v692 = 0; v692 < v690.length; v692++) {
      if (!isStartOfArrow(v690[v692])) {
        v691.body.push(v690[v692]);
      } else {
        v687.push(v691);
        v692 += 1;
        var v693 = assertSymbolNodeType(v690[v692]).text;
        var v694 = new Array(2);
        v694[0] = {
          type: "ordgroup",
          mode: "math",
          body: []
        };
        v694[1] = {
          type: "ordgroup",
          mode: "math",
          body: []
        };
        if ("=|.".includes(v693)) ;else if ("<>AV".includes(v693)) {
          for (var v695 = 0; v695 < 2; v695++) {
            var v696 = true;
            for (var v697 = v692 + 1; v697 < v690.length; v697++) {
              if (isLabelEnd(v690[v697], v693)) {
                v696 = false;
                v692 = v697;
                break;
              }
              if (isStartOfArrow(v690[v697])) {
                throw new ParseError("Missing a " + v693 + " character to complete a CD arrow.", v690[v697]);
              }
              v694[v695].body.push(v690[v697]);
            }
            if (v696) {
              throw new ParseError("Missing a " + v693 + " character to complete a CD arrow.", v690[v692]);
            }
          }
        } else {
          throw new ParseError("Expected one of \"<>AV=|.\" after @", v690[v692]);
        }
        var v698 = cdArrow(v693, v694, v684);
        var v699 = {
          type: "styling",
          body: [v698],
          mode: "math",
          style: "display",
          resetFont: true
        };
        v687.push(v699);
        v691 = newCell();
      }
    }
    if (v689 % 2 === 0) {
      v687.push(v691);
    } else {
      v687.shift();
    }
    v687 = [];
    v688.push(v687);
  }
  v684.gullet.endGroup();
  v684.gullet.endGroup();
  var v700 = new Array(v688[0].length).fill({
    type: "align",
    align: "c",
    pregap: 0.25,
    postgap: 0.25
  });
  return {
    type: "array",
    mode: "math",
    body: v688,
    arraystretch: 1,
    addJot: true,
    rowGaps: [null],
    cols: v700,
    colSeparationType: "CD",
    hLinesBeforeRow: new Array(v688.length + 1).fill([])
  };
}
defineFunction({
  type: "cdlabel",
  names: ["\\\\cdleft", "\\\\cdright"],
  props: {
    numArgs: 1
  },
  handler(v701, v702) {
    var {
      parser: v703,
      funcName: v704
    } = v701;
    return {
      type: "cdlabel",
      mode: v703.mode,
      side: v704.slice(4),
      label: v702[0]
    };
  },
  htmlBuilder(v705, v706) {
    var v707 = v706.havingStyle(v706.style.sup());
    var v708 = wrapFragment(buildGroup$1(v705.label, v707, v706), v706);
    v708.classes.push("cd-label-" + v705.side);
    v708.style.bottom = makeEm(0.8 - v708.depth);
    v708.height = 0;
    v708.depth = 0;
    return v708;
  },
  mathmlBuilder(v709, v710) {
    var v711 = new MathNode("mrow", [buildGroup2(v709.label, v710)]);
    v711 = new MathNode("mpadded", [v711]);
    v711.setAttribute("width", "0");
    if (v709.side === "left") {
      v711.setAttribute("lspace", "-1width");
    }
    v711.setAttribute("voffset", "0.7em");
    v711 = new MathNode("mstyle", [v711]);
    v711.setAttribute("displaystyle", "false");
    v711.setAttribute("scriptlevel", "1");
    return v711;
  }
});
defineFunction({
  type: "cdlabelparent",
  names: ["\\\\cdparent"],
  props: {
    numArgs: 1
  },
  handler(v712, v713) {
    var {
      parser: v714
    } = v712;
    return {
      type: "cdlabelparent",
      mode: v714.mode,
      fragment: v713[0]
    };
  },
  htmlBuilder(v715, v716) {
    var v717 = wrapFragment(buildGroup$1(v715.fragment, v716), v716);
    v717.classes.push("cd-vert-arrow");
    return v717;
  },
  mathmlBuilder(v718, v719) {
    return new MathNode("mrow", [buildGroup2(v718.fragment, v719)]);
  }
});
defineFunction({
  type: "textord",
  names: ["\\@char"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler(v720, v721) {
    var {
      parser: v722
    } = v720;
    var v723 = assertNodeType(v721[0], "ordgroup");
    var v724 = v723.body;
    var v725 = "";
    for (var v726 = 0; v726 < v724.length; v726++) {
      var v727 = assertNodeType(v724[v726], "textord");
      v725 += v727.text;
    }
    var v728 = parseInt(v725);
    var v729;
    if (isNaN(v728)) {
      throw new ParseError("\\@char has non-numeric argument " + v725);
    } else if (v728 < 0 || v728 >= 1114111) {
      throw new ParseError("\\@char with invalid code point " + v725);
    } else if (v728 <= 65535) {
      v729 = String.fromCharCode(v728);
    } else {
      v728 -= 65536;
      v729 = String.fromCharCode((v728 >> 10) + 55296, (v728 & 1023) + 56320);
    }
    return {
      type: "textord",
      mode: v722.mode,
      text: v729
    };
  }
});
var htmlBuilder$8 = (v730, v731) => {
  var v732 = buildExpression$1(v730.body, v731.withColor(v730.color), false);
  return makeFragment(v732);
};
var mathmlBuilder$7 = (v733, v734) => {
  var v735 = buildExpression2(v733.body, v734.withColor(v733.color));
  var v736 = new MathNode("mstyle", v735);
  v736.setAttribute("mathcolor", v733.color);
  return v736;
};
defineFunction({
  type: "color",
  names: ["\\textcolor"],
  props: {
    numArgs: 2,
    allowedInText: true,
    argTypes: ["color", "original"]
  },
  handler(v737, v738) {
    var {
      parser: v739
    } = v737;
    var v740 = assertNodeType(v738[0], "color-token").color;
    var v741 = v738[1];
    return {
      type: "color",
      mode: v739.mode,
      color: v740,
      body: ordargument(v741)
    };
  },
  htmlBuilder: htmlBuilder$8,
  mathmlBuilder: mathmlBuilder$7
});
defineFunction({
  type: "color",
  names: ["\\color"],
  props: {
    numArgs: 1,
    allowedInText: true,
    argTypes: ["color"]
  },
  handler(v742, v743) {
    var {
      parser: v744,
      breakOnTokenText: v745
    } = v742;
    var v746 = assertNodeType(v743[0], "color-token").color;
    v744.gullet.macros.set("\\current@color", v746);
    var v747 = v744.parseExpression(true, v745);
    return {
      type: "color",
      mode: v744.mode,
      color: v746,
      body: v747
    };
  },
  htmlBuilder: htmlBuilder$8,
  mathmlBuilder: mathmlBuilder$7
});
defineFunction({
  type: "cr",
  names: ["\\\\"],
  props: {
    numArgs: 0,
    numOptionalArgs: 0,
    allowedInText: true
  },
  handler(v748, v749, v750) {
    var {
      parser: v751
    } = v748;
    var v752 = v751.gullet.future().text === "[" ? v751.parseSizeGroup(true) : null;
    var v753 = !v751.settings.displayMode || !v751.settings.useStrictBehavior("newLineInDisplayMode", "In LaTeX, \\\\ or \\newline does nothing in display mode");
    return {
      type: "cr",
      mode: v751.mode,
      newLine: v753,
      size: v752 && assertNodeType(v752, "size").value
    };
  },
  htmlBuilder(v754, v755) {
    var v756 = makeSpan(["mspace"], [], v755);
    if (v754.newLine) {
      v756.classes.push("newline");
      if (v754.size) {
        v756.style.marginTop = makeEm(calculateSize(v754.size, v755));
      }
    }
    return v756;
  },
  mathmlBuilder(v757, v758) {
    var v759 = new MathNode("mspace");
    if (v757.newLine) {
      v759.setAttribute("linebreak", "newline");
      if (v757.size) {
        v759.setAttribute("height", makeEm(calculateSize(v757.size, v758)));
      }
    }
    return v759;
  }
});
var globalMap = {
  "\\global": "\\global",
  "\\long": "\\\\globallong",
  "\\\\globallong": "\\\\globallong",
  "\\def": "\\gdef",
  "\\gdef": "\\gdef",
  "\\edef": "\\xdef",
  "\\xdef": "\\xdef",
  "\\let": "\\\\globallet",
  "\\futurelet": "\\\\globalfuture"
};
var checkControlSequence = v760 => {
  var v761 = v760.text;
  if (/^(?:[\\{}$&#^_]|EOF)$/.test(v761)) {
    throw new ParseError("Expected a control sequence", v760);
  }
  return v761;
};
var getRHS = v762 => {
  var v763 = v762.gullet.popToken();
  if (v763.text === "=") {
    v763 = v762.gullet.popToken();
    if (v763.text === " ") {
      v763 = v762.gullet.popToken();
    }
  }
  return v763;
};
var letCommand = (v764, v765, v766, v767) => {
  var v768 = v764.gullet.macros.get(v766.text);
  if (v768 == null) {
    v766.noexpand = true;
    v768 = {
      tokens: [v766],
      numArgs: 0,
      unexpandable: !v764.gullet.isExpandable(v766.text)
    };
  }
  v764.gullet.macros.set(v765, v768, v767);
};
defineFunction({
  type: "internal",
  names: ["\\global", "\\long", "\\\\globallong"],
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler(v769) {
    var {
      parser: v770,
      funcName: v771
    } = v769;
    v770.consumeSpaces();
    var v772 = v770.fetch();
    if (globalMap[v772.text]) {
      if (v771 === "\\global" || v771 === "\\\\globallong") {
        v772.text = globalMap[v772.text];
      }
      return assertNodeType(v770.parseFunction(), "internal");
    }
    throw new ParseError("Invalid token after macro prefix", v772);
  }
});
defineFunction({
  type: "internal",
  names: ["\\def", "\\gdef", "\\edef", "\\xdef"],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(v773) {
    var {
      parser: v774,
      funcName: v775
    } = v773;
    var v776 = v774.gullet.popToken();
    var v777 = v776.text;
    if (/^(?:[\\{}$&#^_]|EOF)$/.test(v777)) {
      throw new ParseError("Expected a control sequence", v776);
    }
    var v778 = 0;
    var v779;
    var v780 = [[]];
    while (v774.gullet.future().text !== "{") {
      v776 = v774.gullet.popToken();
      if (v776.text === "#") {
        if (v774.gullet.future().text === "{") {
          v779 = v774.gullet.future();
          v780[v778].push("{");
          break;
        }
        v776 = v774.gullet.popToken();
        if (!/^[1-9]$/.test(v776.text)) {
          throw new ParseError("Invalid argument number \"" + v776.text + "\"");
        }
        if (parseInt(v776.text) !== v778 + 1) {
          throw new ParseError("Argument number \"" + v776.text + "\" out of order");
        }
        v778++;
        v780.push([]);
      } else if (v776.text === "EOF") {
        throw new ParseError("Expected a macro definition");
      } else {
        v780[v778].push(v776.text);
      }
    }
    var {
      tokens: v781
    } = v774.gullet.consumeArg();
    if (v779) {
      v781.unshift(v779);
    }
    if (v775 === "\\edef" || v775 === "\\xdef") {
      v781 = v774.gullet.expandTokens(v781);
      v781.reverse();
    }
    v774.gullet.macros.set(v777, {
      tokens: v781,
      numArgs: v778,
      delimiters: v780
    }, v775 === globalMap[v775]);
    return {
      type: "internal",
      mode: v774.mode
    };
  }
});
defineFunction({
  type: "internal",
  names: ["\\let", "\\\\globallet"],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(v782) {
    var {
      parser: v783,
      funcName: v784
    } = v782;
    var v785 = checkControlSequence(v783.gullet.popToken());
    v783.gullet.consumeSpaces();
    var v786 = getRHS(v783);
    letCommand(v783, v785, v786, v784 === "\\\\globallet");
    return {
      type: "internal",
      mode: v783.mode
    };
  }
});
defineFunction({
  type: "internal",
  names: ["\\futurelet", "\\\\globalfuture"],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(v787) {
    var {
      parser: v788,
      funcName: v789
    } = v787;
    var v790 = checkControlSequence(v788.gullet.popToken());
    var v791 = v788.gullet.popToken();
    var v792 = v788.gullet.popToken();
    letCommand(v788, v790, v792, v789 === "\\\\globalfuture");
    v788.gullet.pushToken(v792);
    v788.gullet.pushToken(v791);
    return {
      type: "internal",
      mode: v788.mode
    };
  }
});
var getMetrics = function getMetrics2(v793, v794, v795) {
  var v796 = symbols.math[v793] && symbols.math[v793].replace;
  var v797 = getCharacterMetrics(v796 || v793, v794, v795);
  if (!v797) {
    throw new Error("Unsupported symbol " + v793 + " and font size " + v794 + ".");
  }
  return v797;
};
var styleWrap = function styleWrap2(v798, v799, v800, v801) {
  var v802 = v800.havingBaseStyle(v799);
  var v803 = makeSpan(v801.concat(v802.sizingClasses(v800)), [v798], v800);
  var v804 = v802.sizeMultiplier / v800.sizeMultiplier;
  v803.height *= v804;
  v803.depth *= v804;
  v803.maxFontSize = v802.sizeMultiplier;
  return v803;
};
var centerSpan = function centerSpan2(v805, v806, v807) {
  var v808 = v806.havingBaseStyle(v807);
  var v809 = (1 - v806.sizeMultiplier / v808.sizeMultiplier) * v806.fontMetrics().axisHeight;
  v805.classes.push("delimcenter");
  v805.style.top = makeEm(v809);
  v805.height -= v809;
  v805.depth += v809;
};
var makeSmallDelim = function makeSmallDelim2(v810, v811, v812, v813, v814, v815) {
  var v816 = makeSymbol(v810, "Main-Regular", v814, v813);
  var v817 = styleWrap(v816, v811, v813, v815);
  {
    centerSpan(v817, v813, v811);
  }
  return v817;
};
var mathrmSize = function mathrmSize2(v818, v819, v820, v821) {
  return makeSymbol(v818, "Size" + v819 + "-Regular", v820, v821);
};
var makeLargeDelim = function makeLargeDelim2(v822, v823, v824, v825, v826, v827) {
  var v828 = mathrmSize(v822, v823, v826, v825);
  var v829 = styleWrap(makeSpan(["delimsizing", "size" + v823], [v828], v825), Style$1.TEXT, v825, v827);
  if (v824) {
    centerSpan(v829, v825, Style$1.TEXT);
  }
  return v829;
};
var makeGlyphSpan = function makeGlyphSpan2(v830, v831, v832) {
  var v833;
  if (v831 === "Size1-Regular") {
    v833 = "delim-size1";
  } else {
    v833 = "delim-size4";
  }
  var v834 = makeSpan(["delimsizinginner", v833], [makeSpan([], [makeSymbol(v830, v831, v832)])]);
  return {
    type: "elem",
    elem: v834
  };
};
var makeInner = function makeInner2(v835, v836, v837) {
  var v838 = fontMetricsData["Size4-Regular"][v835.charCodeAt(0)] ? fontMetricsData["Size4-Regular"][v835.charCodeAt(0)][4] : fontMetricsData["Size1-Regular"][v835.charCodeAt(0)][4];
  var v839 = new PathNode("inner", innerPath(v835, Math.round(v836 * 1000)));
  var v840 = new SvgNode([v839], {
    width: makeEm(v838),
    height: makeEm(v836),
    style: "width:" + makeEm(v838),
    viewBox: "0 0 " + v838 * 1000 + " " + Math.round(v836 * 1000),
    preserveAspectRatio: "xMinYMin"
  });
  var v841 = makeSvgSpan([], [v840], v837);
  v841.height = v836;
  v841.style.height = makeEm(v836);
  v841.style.width = makeEm(v838);
  return {
    type: "elem",
    elem: v841
  };
};
var lapInEms = 0.008;
var lap = {
  type: "kern",
  size: lapInEms * -1
};
var verts = new Set(["|", "\\lvert", "\\rvert", "\\vert"]);
var doubleVerts = new Set(["\\|", "\\lVert", "\\rVert", "\\Vert"]);
var makeStackedDelim = function makeStackedDelim2(v842, v843, v844, v845, v846, v847) {
  var v848;
  var v849;
  var v850;
  var v851;
  var v852 = "";
  var v853 = 0;
  v848 = v850 = v851 = v842;
  v849 = null;
  var v854 = "Size1-Regular";
  if (v842 === "\\uparrow") {
    v850 = v851 = "⏐";
  } else if (v842 === "\\Uparrow") {
    v850 = v851 = "‖";
  } else if (v842 === "\\downarrow") {
    v848 = v850 = "⏐";
  } else if (v842 === "\\Downarrow") {
    v848 = v850 = "‖";
  } else if (v842 === "\\updownarrow") {
    v848 = "\\uparrow";
    v850 = "⏐";
    v851 = "\\downarrow";
  } else if (v842 === "\\Updownarrow") {
    v848 = "\\Uparrow";
    v850 = "‖";
    v851 = "\\Downarrow";
  } else if (verts.has(v842)) {
    v850 = "∣";
    v852 = "vert";
    v853 = 333;
  } else if (doubleVerts.has(v842)) {
    v850 = "∥";
    v852 = "doublevert";
    v853 = 556;
  } else if (v842 === "[" || v842 === "\\lbrack") {
    v848 = "⎡";
    v850 = "⎢";
    v851 = "⎣";
    v854 = "Size4-Regular";
    v852 = "lbrack";
    v853 = 667;
  } else if (v842 === "]" || v842 === "\\rbrack") {
    v848 = "⎤";
    v850 = "⎥";
    v851 = "⎦";
    v854 = "Size4-Regular";
    v852 = "rbrack";
    v853 = 667;
  } else if (v842 === "\\lfloor" || v842 === "⌊") {
    v850 = v848 = "⎢";
    v851 = "⎣";
    v854 = "Size4-Regular";
    v852 = "lfloor";
    v853 = 667;
  } else if (v842 === "\\lceil" || v842 === "⌈") {
    v848 = "⎡";
    v850 = v851 = "⎢";
    v854 = "Size4-Regular";
    v852 = "lceil";
    v853 = 667;
  } else if (v842 === "\\rfloor" || v842 === "⌋") {
    v850 = v848 = "⎥";
    v851 = "⎦";
    v854 = "Size4-Regular";
    v852 = "rfloor";
    v853 = 667;
  } else if (v842 === "\\rceil" || v842 === "⌉") {
    v848 = "⎤";
    v850 = v851 = "⎥";
    v854 = "Size4-Regular";
    v852 = "rceil";
    v853 = 667;
  } else if (v842 === "(" || v842 === "\\lparen") {
    v848 = "⎛";
    v850 = "⎜";
    v851 = "⎝";
    v854 = "Size4-Regular";
    v852 = "lparen";
    v853 = 875;
  } else if (v842 === ")" || v842 === "\\rparen") {
    v848 = "⎞";
    v850 = "⎟";
    v851 = "⎠";
    v854 = "Size4-Regular";
    v852 = "rparen";
    v853 = 875;
  } else if (v842 === "\\{" || v842 === "\\lbrace") {
    v848 = "⎧";
    v849 = "⎨";
    v851 = "⎩";
    v850 = "⎪";
    v854 = "Size4-Regular";
  } else if (v842 === "\\}" || v842 === "\\rbrace") {
    v848 = "⎫";
    v849 = "⎬";
    v851 = "⎭";
    v850 = "⎪";
    v854 = "Size4-Regular";
  } else if (v842 === "\\lgroup" || v842 === "⟮") {
    v848 = "⎧";
    v851 = "⎩";
    v850 = "⎪";
    v854 = "Size4-Regular";
  } else if (v842 === "\\rgroup" || v842 === "⟯") {
    v848 = "⎫";
    v851 = "⎭";
    v850 = "⎪";
    v854 = "Size4-Regular";
  } else if (v842 === "\\lmoustache" || v842 === "⎰") {
    v848 = "⎧";
    v851 = "⎭";
    v850 = "⎪";
    v854 = "Size4-Regular";
  } else if (v842 === "\\rmoustache" || v842 === "⎱") {
    v848 = "⎫";
    v851 = "⎩";
    v850 = "⎪";
    v854 = "Size4-Regular";
  }
  var v855 = getMetrics(v848, v854, v846);
  var v856 = v855.height + v855.depth;
  var v857 = getMetrics(v850, v854, v846);
  var v858 = v857.height + v857.depth;
  var v859 = getMetrics(v851, v854, v846);
  var v860 = v859.height + v859.depth;
  var v861 = 0;
  var v862 = 1;
  if (v849 !== null) {
    var v863 = getMetrics(v849, v854, v846);
    v861 = v863.height + v863.depth;
    v862 = 2;
  }
  var v864 = v856 + v860 + v861;
  var v865 = Math.max(0, Math.ceil((v843 - v864) / (v862 * v858)));
  var v866 = v864 + v865 * v862 * v858;
  var v867 = v845.fontMetrics().axisHeight;
  if (v844) {
    v867 *= v845.sizeMultiplier;
  }
  var v868 = v866 / 2 - v867;
  var v869 = [];
  if (v852.length > 0) {
    var v870 = v866 - v856 - v860;
    var v871 = Math.round(v866 * 1000);
    var v872 = tallDelim(v852, Math.round(v870 * 1000));
    var v873 = new PathNode(v852, v872);
    var v874 = makeEm(v853 / 1000);
    var v875 = makeEm(v871 / 1000);
    var v876 = new SvgNode([v873], {
      width: v874,
      height: v875,
      viewBox: "0 0 " + v853 + " " + v871
    });
    var v877 = makeSvgSpan([], [v876], v845);
    v877.height = v871 / 1000;
    v877.style.width = v874;
    v877.style.height = v875;
    v869.push({
      type: "elem",
      elem: v877
    });
  } else {
    v869.push(makeGlyphSpan(v851, v854, v846));
    v869.push(lap);
    if (v849 === null) {
      var v878 = v866 - v856 - v860 + lapInEms * 2;
      v869.push(makeInner(v850, v878, v845));
    } else {
      var v879 = (v866 - v856 - v860 - v861) / 2 + lapInEms * 2;
      v869.push(makeInner(v850, v879, v845));
      v869.push(lap);
      v869.push(makeGlyphSpan(v849, v854, v846));
      v869.push(lap);
      v869.push(makeInner(v850, v879, v845));
    }
    v869.push(lap);
    v869.push(makeGlyphSpan(v848, v854, v846));
  }
  var v880 = v845.havingBaseStyle(Style$1.TEXT);
  var v881 = makeVList({
    positionType: "bottom",
    positionData: v868,
    children: v869
  });
  return styleWrap(makeSpan(["delimsizing", "mult"], [v881], v880), Style$1.TEXT, v845, v847);
};
var vbPad = 80;
var emPad = 0.08;
var sqrtSvg = function sqrtSvg2(v882, v883, v884, v885, v886) {
  var v887 = sqrtPath(v882, v885, v884);
  var v888 = new PathNode(v882, v887);
  var v889 = new SvgNode([v888], {
    width: "400em",
    height: makeEm(v883),
    viewBox: "0 0 400000 " + v884,
    preserveAspectRatio: "xMinYMin slice"
  });
  return makeSvgSpan(["hide-tail"], [v889], v886);
};
var makeSqrtImage = function makeSqrtImage2(v890, v891) {
  var v892 = v891.havingBaseSizing();
  var v893 = traverseSequence("\\surd", v890 * v892.sizeMultiplier, stackLargeDelimiterSequence, v892);
  var v894 = v892.sizeMultiplier;
  var v895 = Math.max(0, v891.minRuleThickness - v891.fontMetrics().sqrtRuleThickness);
  var v896;
  var v897;
  var v898;
  var v899;
  var v900;
  if (v893.type === "small") {
    v899 = 1000 + v895 * 1000 + vbPad;
    if (v890 < 1) {
      v894 = 1;
    } else if (v890 < 1.4) {
      v894 = 0.7;
    }
    v897 = (1 + v895 + emPad) / v894;
    v898 = (1 + v895) / v894;
    v896 = sqrtSvg("sqrtMain", v897, v899, v895, v891);
    v896.style.minWidth = "0.853em";
    v900 = 0.833 / v894;
  } else if (v893.type === "large") {
    v899 = (1000 + vbPad) * sizeToMaxHeight[v893.size];
    v898 = (sizeToMaxHeight[v893.size] + v895) / v894;
    v897 = (sizeToMaxHeight[v893.size] + v895 + emPad) / v894;
    v896 = sqrtSvg("sqrtSize" + v893.size, v897, v899, v895, v891);
    v896.style.minWidth = "1.02em";
    v900 = 1 / v894;
  } else {
    v897 = v890 + v895 + emPad;
    v898 = v890 + v895;
    v899 = Math.floor(v890 * 1000 + v895) + vbPad;
    v896 = sqrtSvg("sqrtTall", v897, v899, v895, v891);
    v896.style.minWidth = "0.742em";
    v900 = 1.056;
  }
  v896.height = v898;
  v896.style.height = makeEm(v897);
  return {
    span: v896,
    advanceWidth: v900,
    ruleWidth: (v891.fontMetrics().sqrtRuleThickness + v895) * v894
  };
};
var stackLargeDelimiters = new Set(["(", "\\lparen", ")", "\\rparen", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "⌊", "⌋", "\\lceil", "\\rceil", "⌈", "⌉", "\\surd"]);
var stackAlwaysDelimiters = new Set(["\\uparrow", "\\downarrow", "\\updownarrow", "\\Uparrow", "\\Downarrow", "\\Updownarrow", "|", "\\|", "\\vert", "\\Vert", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "⟮", "⟯", "\\lmoustache", "\\rmoustache", "⎰", "⎱"]);
var stackNeverDelimiters = new Set(["<", ">", "\\langle", "\\rangle", "/", "\\backslash", "\\lt", "\\gt"]);
var sizeToMaxHeight = [0, 1.2, 1.8, 2.4, 3];
var makeSizedDelim = function makeSizedDelim2(v901, v902, v903, v904, v905) {
  if (v901 === "<" || v901 === "\\lt" || v901 === "⟨") {
    v901 = "\\langle";
  } else if (v901 === ">" || v901 === "\\gt" || v901 === "⟩") {
    v901 = "\\rangle";
  }
  if (stackLargeDelimiters.has(v901) || stackNeverDelimiters.has(v901)) {
    return makeLargeDelim(v901, v902, false, v903, v904, v905);
  } else if (stackAlwaysDelimiters.has(v901)) {
    return makeStackedDelim(v901, sizeToMaxHeight[v902], false, v903, v904, v905);
  } else {
    throw new ParseError("Illegal delimiter: '" + v901 + "'");
  }
};
var stackNeverDelimiterSequence = [{
  type: "small",
  style: Style$1.SCRIPTSCRIPT
}, {
  type: "small",
  style: Style$1.SCRIPT
}, {
  type: "small",
  style: Style$1.TEXT
}, {
  type: "large",
  size: 1
}, {
  type: "large",
  size: 2
}, {
  type: "large",
  size: 3
}, {
  type: "large",
  size: 4
}];
var stackAlwaysDelimiterSequence = [{
  type: "small",
  style: Style$1.SCRIPTSCRIPT
}, {
  type: "small",
  style: Style$1.SCRIPT
}, {
  type: "small",
  style: Style$1.TEXT
}, {
  type: "stack"
}];
var stackLargeDelimiterSequence = [{
  type: "small",
  style: Style$1.SCRIPTSCRIPT
}, {
  type: "small",
  style: Style$1.SCRIPT
}, {
  type: "small",
  style: Style$1.TEXT
}, {
  type: "large",
  size: 1
}, {
  type: "large",
  size: 2
}, {
  type: "large",
  size: 3
}, {
  type: "large",
  size: 4
}, {
  type: "stack"
}];
var delimTypeToFont = function delimTypeToFont2(v906) {
  if (v906.type === "small") {
    return "Main-Regular";
  } else if (v906.type === "large") {
    return "Size" + v906.size + "-Regular";
  } else if (v906.type === "stack") {
    return "Size4-Regular";
  } else {
    var v907 = v906.type;
    throw new Error("Add support for delim type '" + v907 + "' here.");
  }
};
var traverseSequence = function traverseSequence2(v908, v909, v910, v911) {
  var v912 = Math.min(2, 3 - v911.style.size);
  for (var v913 = v912; v913 < v910.length; v913++) {
    var v914 = v910[v913];
    if (v914.type === "stack") {
      break;
    }
    var v915 = getMetrics(v908, delimTypeToFont(v914), "math");
    var v916 = v915.height + v915.depth;
    if (v914.type === "small") {
      var v917 = v911.havingBaseStyle(v914.style);
      v916 *= v917.sizeMultiplier;
    }
    if (v916 > v909) {
      return v914;
    }
  }
  return v910[v910.length - 1];
};
var makeCustomSizedDelim = function makeCustomSizedDelim2(v918, v919, v920, v921, v922, v923) {
  if (v918 === "<" || v918 === "\\lt" || v918 === "⟨") {
    v918 = "\\langle";
  } else if (v918 === ">" || v918 === "\\gt" || v918 === "⟩") {
    v918 = "\\rangle";
  }
  var v924;
  if (stackNeverDelimiters.has(v918)) {
    v924 = stackNeverDelimiterSequence;
  } else if (stackLargeDelimiters.has(v918)) {
    v924 = stackLargeDelimiterSequence;
  } else {
    v924 = stackAlwaysDelimiterSequence;
  }
  var v925 = traverseSequence(v918, v919, v924, v921);
  if (v925.type === "small") {
    return makeSmallDelim(v918, v925.style, v920, v921, v922, v923);
  } else if (v925.type === "large") {
    return makeLargeDelim(v918, v925.size, v920, v921, v922, v923);
  } else {
    return makeStackedDelim(v918, v919, v920, v921, v922, v923);
  }
};
var makeLeftRightDelim = function makeLeftRightDelim2(v926, v927, v928, v929, v930, v931) {
  var v932 = v929.fontMetrics().axisHeight * v929.sizeMultiplier;
  var v933 = 901;
  var v934 = 5 / v929.fontMetrics().ptPerEm;
  var v935 = Math.max(v927 - v932, v928 + v932);
  var v936 = Math.max(v935 / 500 * v933, v935 * 2 - v934);
  return makeCustomSizedDelim(v926, v936, true, v929, v930, v931);
};
var delimiterSizes = {
  "\\bigl": {
    mclass: "mopen",
    size: 1
  },
  "\\Bigl": {
    mclass: "mopen",
    size: 2
  },
  "\\biggl": {
    mclass: "mopen",
    size: 3
  },
  "\\Biggl": {
    mclass: "mopen",
    size: 4
  },
  "\\bigr": {
    mclass: "mclose",
    size: 1
  },
  "\\Bigr": {
    mclass: "mclose",
    size: 2
  },
  "\\biggr": {
    mclass: "mclose",
    size: 3
  },
  "\\Biggr": {
    mclass: "mclose",
    size: 4
  },
  "\\bigm": {
    mclass: "mrel",
    size: 1
  },
  "\\Bigm": {
    mclass: "mrel",
    size: 2
  },
  "\\biggm": {
    mclass: "mrel",
    size: 3
  },
  "\\Biggm": {
    mclass: "mrel",
    size: 4
  },
  "\\big": {
    mclass: "mord",
    size: 1
  },
  "\\Big": {
    mclass: "mord",
    size: 2
  },
  "\\bigg": {
    mclass: "mord",
    size: 3
  },
  "\\Bigg": {
    mclass: "mord",
    size: 4
  }
};
var delimiters = new Set(["(", "\\lparen", ")", "\\rparen", "[", "\\lbrack", "]", "\\rbrack", "\\{", "\\lbrace", "\\}", "\\rbrace", "\\lfloor", "\\rfloor", "⌊", "⌋", "\\lceil", "\\rceil", "⌈", "⌉", "<", ">", "\\langle", "⟨", "\\rangle", "⟩", "\\lt", "\\gt", "\\lvert", "\\rvert", "\\lVert", "\\rVert", "\\lgroup", "\\rgroup", "⟮", "⟯", "\\lmoustache", "\\rmoustache", "⎰", "⎱", "/", "\\backslash", "|", "\\vert", "\\|", "\\Vert", "\\uparrow", "\\Uparrow", "\\downarrow", "\\Downarrow", "\\updownarrow", "\\Updownarrow", "."]);
function isMiddleDelimNode(v937) {
  return "isMiddle" in v937;
}
function checkDelimiter(v938, v939) {
  var v940 = checkSymbolNodeType(v938);
  if (v940 && delimiters.has(v940.text)) {
    return v940;
  } else if (v940) {
    throw new ParseError("Invalid delimiter '" + v940.text + "' after '" + v939.funcName + "'", v938);
  } else {
    throw new ParseError("Invalid delimiter type '" + v938.type + "'", v938);
  }
}
defineFunction({
  type: "delimsizing",
  names: ["\\bigl", "\\Bigl", "\\biggl", "\\Biggl", "\\bigr", "\\Bigr", "\\biggr", "\\Biggr", "\\bigm", "\\Bigm", "\\biggm", "\\Biggm", "\\big", "\\Big", "\\bigg", "\\Bigg"],
  props: {
    numArgs: 1,
    argTypes: ["primitive"]
  },
  handler: (v941, v942) => {
    var v943 = checkDelimiter(v942[0], v941);
    return {
      type: "delimsizing",
      mode: v941.parser.mode,
      size: delimiterSizes[v941.funcName].size,
      mclass: delimiterSizes[v941.funcName].mclass,
      delim: v943.text
    };
  },
  htmlBuilder: (v944, v945) => {
    if (v944.delim === ".") {
      return makeSpan([v944.mclass]);
    }
    return makeSizedDelim(v944.delim, v944.size, v945, v944.mode, [v944.mclass]);
  },
  mathmlBuilder: v946 => {
    var v947 = [];
    if (v946.delim !== ".") {
      v947.push(makeText(v946.delim, v946.mode));
    }
    var v948 = new MathNode("mo", v947);
    if (v946.mclass === "mopen" || v946.mclass === "mclose") {
      v948.setAttribute("fence", "true");
    } else {
      v948.setAttribute("fence", "false");
    }
    v948.setAttribute("stretchy", "true");
    var v949 = makeEm(sizeToMaxHeight[v946.size]);
    v948.setAttribute("minsize", v949);
    v948.setAttribute("maxsize", v949);
    return v948;
  }
});
function assertParsed(v950) {
  if (!v950.body) {
    throw new Error("Bug: The leftright ParseNode wasn't fully parsed.");
  }
}
defineFunction({
  type: "leftright-right",
  names: ["\\right"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (v951, v952) => {
    var v953 = v951.parser.gullet.macros.get("\\current@color");
    if (v953 && typeof v953 !== "string") {
      throw new ParseError("\\current@color set to non-string in \\right");
    }
    return {
      type: "leftright-right",
      mode: v951.parser.mode,
      delim: checkDelimiter(v952[0], v951).text,
      color: v953
    };
  }
});
defineFunction({
  type: "leftright",
  names: ["\\left"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (v954, v955) => {
    var v956 = checkDelimiter(v955[0], v954);
    var v957 = v954.parser;
    ++v957.leftrightDepth;
    var v958 = v957.parseExpression(false);
    --v957.leftrightDepth;
    v957.expect("\\right", false);
    var v959 = assertNodeType(v957.parseFunction(), "leftright-right");
    return {
      type: "leftright",
      mode: v957.mode,
      body: v958,
      left: v956.text,
      right: v959.delim,
      rightColor: v959.color
    };
  },
  htmlBuilder: (v960, v961) => {
    assertParsed(v960);
    var v962 = buildExpression$1(v960.body, v961, true, ["mopen", "mclose"]);
    var v963 = 0;
    var v964 = 0;
    var v965 = false;
    for (var v966 = 0; v966 < v962.length; v966++) {
      var v967 = v962[v966];
      if (isMiddleDelimNode(v967)) {
        v965 = true;
      } else {
        v963 = Math.max(v962[v966].height, v963);
        v964 = Math.max(v962[v966].depth, v964);
      }
    }
    v963 *= v961.sizeMultiplier;
    v964 *= v961.sizeMultiplier;
    var v968;
    if (v960.left === ".") {
      v968 = makeNullDelimiter(v961, ["mopen"]);
    } else {
      v968 = makeLeftRightDelim(v960.left, v963, v964, v961, v960.mode, ["mopen"]);
    }
    v962.unshift(v968);
    if (v965) {
      for (var v969 = 1; v969 < v962.length; v969++) {
        var v970 = v962[v969];
        if (isMiddleDelimNode(v970)) {
          var v971 = v970.isMiddle;
          v962[v969] = makeLeftRightDelim(v971.delim, v963, v964, v971.options, v960.mode, []);
        }
      }
    }
    var v972;
    if (v960.right === ".") {
      v972 = makeNullDelimiter(v961, ["mclose"]);
    } else {
      var v973 = v960.rightColor ? v961.withColor(v960.rightColor) : v961;
      v972 = makeLeftRightDelim(v960.right, v963, v964, v973, v960.mode, ["mclose"]);
    }
    v962.push(v972);
    return makeSpan(["minner"], v962, v961);
  },
  mathmlBuilder: (v974, v975) => {
    assertParsed(v974);
    var v976 = buildExpression2(v974.body, v975);
    if (v974.left !== ".") {
      var v977 = new MathNode("mo", [makeText(v974.left, v974.mode)]);
      v977.setAttribute("fence", "true");
      v976.unshift(v977);
    }
    if (v974.right !== ".") {
      var v978 = new MathNode("mo", [makeText(v974.right, v974.mode)]);
      v978.setAttribute("fence", "true");
      if (v974.rightColor) {
        v978.setAttribute("mathcolor", v974.rightColor);
      }
      v976.push(v978);
    }
    return makeRow(v976);
  }
});
defineFunction({
  type: "middle",
  names: ["\\middle"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (v979, v980) => {
    var v981 = checkDelimiter(v980[0], v979);
    if (!v979.parser.leftrightDepth) {
      throw new ParseError("\\middle without preceding \\left", v981);
    }
    return {
      type: "middle",
      mode: v979.parser.mode,
      delim: v981.text
    };
  },
  htmlBuilder: (v982, v983) => {
    var v984;
    if (v982.delim === ".") {
      v984 = makeNullDelimiter(v983, []);
    } else {
      v984 = makeSizedDelim(v982.delim, 1, v983, v982.mode, []);
      v984.isMiddle = {
        delim: v982.delim,
        options: v983
      };
    }
    return v984;
  },
  mathmlBuilder: (v985, v986) => {
    var v987 = v985.delim === "\\vert" || v985.delim === "|" ? makeText("|", "text") : makeText(v985.delim, v985.mode);
    var v988 = new MathNode("mo", [v987]);
    v988.setAttribute("fence", "true");
    v988.setAttribute("lspace", "0.05em");
    v988.setAttribute("rspace", "0.05em");
    return v988;
  }
});
var htmlBuilder$7 = (v989, v990) => {
  var v991 = wrapFragment(buildGroup$1(v989.body, v990), v990);
  var v992 = v989.label.slice(1);
  var v993 = v990.sizeMultiplier;
  var v994;
  var v995;
  var v996 = isCharacterBox(v989.body);
  if (v992 === "sout") {
    v994 = makeSpan(["stretchy", "sout"]);
    v994.height = v990.fontMetrics().defaultRuleThickness / v993;
    v995 = v990.fontMetrics().xHeight * -0.5;
  } else if (v992 === "phase") {
    var v997 = calculateSize({
      number: 0.6,
      unit: "pt"
    }, v990);
    var v998 = calculateSize({
      number: 0.35,
      unit: "ex"
    }, v990);
    var v999 = v990.havingBaseSizing();
    v993 = v993 / v999.sizeMultiplier;
    var v1000 = v991.height + v991.depth + v997 + v998;
    v991.style.paddingLeft = makeEm(v1000 / 2 + v997);
    var v1001 = Math.floor(v1000 * 1000 * v993);
    var v1002 = phasePath(v1001);
    var v1003 = new SvgNode([new PathNode("phase", v1002)], {
      width: "400em",
      height: makeEm(v1001 / 1000),
      viewBox: "0 0 400000 " + v1001,
      preserveAspectRatio: "xMinYMin slice"
    });
    v994 = makeSvgSpan(["hide-tail"], [v1003], v990);
    v994.style.height = makeEm(v1000);
    v995 = v991.depth + v997 + v998;
  } else {
    if (/cancel/.test(v992)) {
      if (!v996) {
        v991.classes.push("cancel-pad");
      }
    } else if (v992 === "angl") {
      v991.classes.push("anglpad");
    } else {
      v991.classes.push("boxpad");
    }
    var v1004;
    var v1005;
    var v1006 = 0;
    if (/box/.test(v992)) {
      v1006 = Math.max(v990.fontMetrics().fboxrule, v990.minRuleThickness);
      v1004 = v990.fontMetrics().fboxsep + (v992 === "colorbox" ? 0 : v1006);
      v1005 = v1004;
    } else if (v992 === "angl") {
      v1006 = Math.max(v990.fontMetrics().defaultRuleThickness, v990.minRuleThickness);
      v1004 = v1006 * 4;
      v1005 = Math.max(0, 0.25 - v991.depth);
    } else {
      v1004 = v996 ? 0.2 : 0;
      v1005 = v1004;
    }
    v994 = stretchyEnclose(v991, v992, v1004, v1005, v990);
    if (/fbox|boxed|fcolorbox/.test(v992)) {
      v994.style.borderStyle = "solid";
      v994.style.borderWidth = makeEm(v1006);
    } else if (v992 === "angl" && v1006 !== 0.049) {
      v994.style.borderTopWidth = makeEm(v1006);
      v994.style.borderRightWidth = makeEm(v1006);
    }
    v995 = v991.depth + v1005;
    if (v989.backgroundColor) {
      v994.style.backgroundColor = v989.backgroundColor;
      if (v989.borderColor) {
        v994.style.borderColor = v989.borderColor;
      }
    }
  }
  var v1007;
  if (v989.backgroundColor) {
    v1007 = makeVList({
      positionType: "individualShift",
      children: [{
        type: "elem",
        elem: v994,
        shift: v995
      }, {
        type: "elem",
        elem: v991,
        shift: 0
      }]
    });
  } else {
    var v1008 = /cancel|phase/.test(v992) ? ["svg-align"] : [];
    v1007 = makeVList({
      positionType: "individualShift",
      children: [{
        type: "elem",
        elem: v991,
        shift: 0
      }, {
        type: "elem",
        elem: v994,
        shift: v995,
        wrapperClasses: v1008
      }]
    });
  }
  if (/cancel/.test(v992)) {
    v1007.height = v991.height;
    v1007.depth = v991.depth;
  }
  if (/cancel/.test(v992) && !v996) {
    return makeSpan(["mord", "cancel-lap"], [v1007], v990);
  } else {
    return makeSpan(["mord"], [v1007], v990);
  }
};
var mathmlBuilder$6 = (v1009, v1010) => {
  var v1011;
  var v1012 = new MathNode(v1009.label.includes("colorbox") ? "mpadded" : "menclose", [buildGroup2(v1009.body, v1010)]);
  switch (v1009.label) {
    case "\\cancel":
      v1012.setAttribute("notation", "updiagonalstrike");
      break;
    case "\\bcancel":
      v1012.setAttribute("notation", "downdiagonalstrike");
      break;
    case "\\phase":
      v1012.setAttribute("notation", "phasorangle");
      break;
    case "\\sout":
      v1012.setAttribute("notation", "horizontalstrike");
      break;
    case "\\fbox":
      v1012.setAttribute("notation", "box");
      break;
    case "\\angl":
      v1012.setAttribute("notation", "actuarial");
      break;
    case "\\fcolorbox":
    case "\\colorbox":
      v1011 = v1010.fontMetrics().fboxsep * v1010.fontMetrics().ptPerEm;
      v1012.setAttribute("width", "+" + v1011 * 2 + "pt");
      v1012.setAttribute("height", "+" + v1011 * 2 + "pt");
      v1012.setAttribute("lspace", v1011 + "pt");
      v1012.setAttribute("voffset", v1011 + "pt");
      if (v1009.label === "\\fcolorbox") {
        var v1013 = Math.max(v1010.fontMetrics().fboxrule, v1010.minRuleThickness);
        v1012.setAttribute("style", "border: " + makeEm(v1013) + " solid " + v1009.borderColor);
      }
      break;
    case "\\xcancel":
      v1012.setAttribute("notation", "updiagonalstrike downdiagonalstrike");
      break;
  }
  if (v1009.backgroundColor) {
    v1012.setAttribute("mathbackground", v1009.backgroundColor);
  }
  return v1012;
};
defineFunction({
  type: "enclose",
  names: ["\\colorbox"],
  props: {
    numArgs: 2,
    allowedInText: true,
    argTypes: ["color", "hbox"]
  },
  handler(v1014, v1015, v1016) {
    var {
      parser: v1017,
      funcName: v1018
    } = v1014;
    var v1019 = assertNodeType(v1015[0], "color-token").color;
    var v1020 = v1015[1];
    return {
      type: "enclose",
      mode: v1017.mode,
      label: v1018,
      backgroundColor: v1019,
      body: v1020
    };
  },
  htmlBuilder: htmlBuilder$7,
  mathmlBuilder: mathmlBuilder$6
});
defineFunction({
  type: "enclose",
  names: ["\\fcolorbox"],
  props: {
    numArgs: 3,
    allowedInText: true,
    argTypes: ["color", "color", "hbox"]
  },
  handler(v1021, v1022, v1023) {
    var {
      parser: v1024,
      funcName: v1025
    } = v1021;
    var v1026 = assertNodeType(v1022[0], "color-token").color;
    var v1027 = assertNodeType(v1022[1], "color-token").color;
    var v1028 = v1022[2];
    return {
      type: "enclose",
      mode: v1024.mode,
      label: v1025,
      backgroundColor: v1027,
      borderColor: v1026,
      body: v1028
    };
  },
  htmlBuilder: htmlBuilder$7,
  mathmlBuilder: mathmlBuilder$6
});
defineFunction({
  type: "enclose",
  names: ["\\fbox"],
  props: {
    numArgs: 1,
    argTypes: ["hbox"],
    allowedInText: true
  },
  handler(v1029, v1030) {
    var {
      parser: v1031
    } = v1029;
    return {
      type: "enclose",
      mode: v1031.mode,
      label: "\\fbox",
      body: v1030[0]
    };
  }
});
defineFunction({
  type: "enclose",
  names: ["\\cancel", "\\bcancel", "\\xcancel", "\\phase"],
  props: {
    numArgs: 1
  },
  handler(v1032, v1033) {
    var {
      parser: v1034,
      funcName: v1035
    } = v1032;
    var v1036 = v1033[0];
    return {
      type: "enclose",
      mode: v1034.mode,
      label: v1035,
      body: v1036
    };
  },
  htmlBuilder: htmlBuilder$7,
  mathmlBuilder: mathmlBuilder$6
});
defineFunction({
  type: "enclose",
  names: ["\\sout"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler(v1037, v1038) {
    var {
      parser: v1039,
      funcName: v1040
    } = v1037;
    if (v1039.mode === "math") {
      v1039.settings.reportNonstrict("mathVsSout", "LaTeX's \\sout works only in text mode");
    }
    var v1041 = v1038[0];
    return {
      type: "enclose",
      mode: v1039.mode,
      label: v1040,
      body: v1041
    };
  },
  htmlBuilder: htmlBuilder$7,
  mathmlBuilder: mathmlBuilder$6
});
defineFunction({
  type: "enclose",
  names: ["\\angl"],
  props: {
    numArgs: 1,
    argTypes: ["hbox"],
    allowedInText: false
  },
  handler(v1042, v1043) {
    var {
      parser: v1044
    } = v1042;
    return {
      type: "enclose",
      mode: v1044.mode,
      label: "\\angl",
      body: v1043[0]
    };
  }
});
var _environments = {};
function defineEnvironment(v1045) {
  var {
    type: v1046,
    names: v1047,
    props: v1048,
    handler: v1049,
    htmlBuilder: v1050,
    mathmlBuilder: v1051
  } = v1045;
  var v1052 = {
    type: v1046,
    numArgs: v1048.numArgs || 0,
    allowedInText: false,
    numOptionalArgs: 0,
    handler: v1049
  };
  for (var v1053 = 0; v1053 < v1047.length; ++v1053) {
    _environments[v1047[v1053]] = v1052;
  }
  if (v1050) {
    _htmlGroupBuilders[v1046] = v1050;
  }
  if (v1051) {
    _mathmlGroupBuilders[v1046] = v1051;
  }
}
var _macros = {};
function defineMacro(v1054, v1055) {
  _macros[v1054] = v1055;
}
class SourceLocation {
  constructor(v1056, v1057, v1058) {
    this.lexer = undefined;
    this.start = undefined;
    this.end = undefined;
    this.lexer = v1056;
    this.start = v1057;
    this.end = v1058;
  }
  static range(v1059, v1060) {
    if (!v1060) {
      return v1059 && v1059.loc;
    } else if (!v1059 || !v1059.loc || !v1060.loc || v1059.loc.lexer !== v1060.loc.lexer) {
      return null;
    } else {
      return new SourceLocation(v1059.loc.lexer, v1059.loc.start, v1060.loc.end);
    }
  }
}
class Token {
  constructor(v1061, v1062) {
    this.text = undefined;
    this.loc = undefined;
    this.noexpand = undefined;
    this.treatAsRelax = undefined;
    this.text = v1061;
    this.loc = v1062;
  }
  range(v1063, v1064) {
    return new Token(v1064, SourceLocation.range(this, v1063));
  }
}
function getHLines(v1065) {
  var v1066 = [];
  v1065.consumeSpaces();
  var v1067 = v1065.fetch().text;
  if (v1067 === "\\relax") {
    v1065.consume();
    v1065.consumeSpaces();
    v1067 = v1065.fetch().text;
  }
  while (v1067 === "\\hline" || v1067 === "\\hdashline") {
    v1065.consume();
    v1066.push(v1067 === "\\hdashline");
    v1065.consumeSpaces();
    v1067 = v1065.fetch().text;
  }
  return v1066;
}
var validateAmsEnvironmentContext = v1068 => {
  var v1069 = v1068.parser.settings;
  if (!v1069.displayMode) {
    throw new ParseError("{" + v1068.envName + "} can be used only in display mode.");
  }
};
var gatherEnvironments = new Set(["gather", "gather*"]);
function getAutoTag(v1070) {
  if (!v1070.includes("ed")) {
    return !v1070.includes("*");
  }
}
function parseArray(v1071, v1072, v1073) {
  var {
    hskipBeforeAndAfter: v1074,
    addJot: v1075,
    cols: v1076,
    arraystretch: v1077,
    colSeparationType: v1078,
    autoTag: v1079,
    singleRow: v1080,
    emptySingleRow: v1081,
    maxNumCols: v1082,
    leqno: v1083
  } = v1072;
  v1071.gullet.beginGroup();
  if (!v1080) {
    v1071.gullet.macros.set("\\cr", "\\\\\\relax");
  }
  if (!v1077) {
    var v1084 = v1071.gullet.expandMacroAsText("\\arraystretch");
    if (v1084 == null) {
      v1077 = 1;
    } else {
      v1077 = parseFloat(v1084);
      if (!v1077 || v1077 < 0) {
        throw new ParseError("Invalid \\arraystretch: " + v1084);
      }
    }
  }
  v1071.gullet.beginGroup();
  var v1085 = [];
  var v1086 = [v1085];
  var v1087 = [];
  var v1088 = [];
  var v1089 = v1079 != null ? [] : undefined;
  function v1090() {
    if (v1079) {
      v1071.gullet.macros.set("\\@eqnsw", "1", true);
    }
  }
  function v1091() {
    if (v1089) {
      if (v1071.gullet.macros.get("\\df@tag")) {
        v1089.push(v1071.subparse([new Token("\\df@tag")]));
        v1071.gullet.macros.set("\\df@tag", undefined, true);
      } else {
        v1089.push(Boolean(v1079) && v1071.gullet.macros.get("\\@eqnsw") === "1");
      }
    }
  }
  v1090();
  v1088.push(getHLines(v1071));
  while (true) {
    var v1092 = v1071.parseExpression(false, v1080 ? "\\end" : "\\\\");
    v1071.gullet.endGroup();
    v1071.gullet.beginGroup();
    var v1093 = {
      type: "ordgroup",
      mode: v1071.mode,
      body: v1092
    };
    if (v1073) {
      v1093 = {
        type: "styling",
        mode: v1071.mode,
        style: v1073,
        resetFont: true,
        body: [v1093]
      };
    }
    v1085.push(v1093);
    var v1094 = v1071.fetch().text;
    if (v1094 === "&") {
      if (v1082 && v1085.length === v1082) {
        if (v1080 || v1078) {
          throw new ParseError("Too many tab characters: &", v1071.nextToken);
        } else {
          v1071.settings.reportNonstrict("textEnv", "Too few columns specified in the {array} column argument.");
        }
      }
      v1071.consume();
    } else if (v1094 === "\\end") {
      v1091();
      if (v1085.length === 1 && v1093.type === "styling" && v1093.body.length === 1 && v1093.body[0].type === "ordgroup" && v1093.body[0].body.length === 0 && (v1086.length > 1 || !v1081)) {
        v1086.pop();
      }
      if (v1088.length < v1086.length + 1) {
        v1088.push([]);
      }
      break;
    } else if (v1094 === "\\\\") {
      v1071.consume();
      var v1095 = undefined;
      if (v1071.gullet.future().text !== " ") {
        v1095 = v1071.parseSizeGroup(true);
      }
      v1087.push(v1095 ? v1095.value : null);
      v1091();
      v1088.push(getHLines(v1071));
      v1085 = [];
      v1086.push(v1085);
      v1090();
    } else {
      throw new ParseError("Expected & or \\\\ or \\cr or \\end", v1071.nextToken);
    }
  }
  v1071.gullet.endGroup();
  v1071.gullet.endGroup();
  return {
    type: "array",
    mode: v1071.mode,
    addJot: v1075,
    arraystretch: v1077,
    body: v1086,
    cols: v1076,
    rowGaps: v1087,
    hskipBeforeAndAfter: v1074,
    hLinesBeforeRow: v1088,
    colSeparationType: v1078,
    tags: v1089,
    leqno: v1083
  };
}
function dCellStyle(v1096) {
  if (v1096.slice(0, 1) === "d") {
    return "display";
  } else {
    return "text";
  }
}
var htmlBuilder$6 = function htmlBuilder(v1097, v1098) {
  var v1099;
  var v1100;
  var v1101 = v1097.body.length;
  var v1102 = v1097.hLinesBeforeRow;
  var v1103 = 0;
  var v1104 = new Array(v1101);
  var v1105 = [];
  var v1106 = Math.max(v1098.fontMetrics().arrayRuleWidth, v1098.minRuleThickness);
  var v1107 = 1 / v1098.fontMetrics().ptPerEm;
  var v1108 = v1107 * 5;
  if (v1097.colSeparationType && v1097.colSeparationType === "small") {
    var v1109 = v1098.havingStyle(Style$1.SCRIPT).sizeMultiplier;
    v1108 = v1109 / v1098.sizeMultiplier * 0.2778;
  }
  var v1110 = v1097.colSeparationType === "CD" ? calculateSize({
    number: 3,
    unit: "ex"
  }, v1098) : v1107 * 12;
  var v1111 = v1107 * 3;
  var v1112 = v1097.arraystretch * v1110;
  var v1113 = v1112 * 0.7;
  var v1114 = v1112 * 0.3;
  var v1115 = 0;
  function v1116(v1117) {
    for (var v1118 = 0; v1118 < v1117.length; ++v1118) {
      if (v1118 > 0) {
        v1115 += 0.25;
      }
      v1105.push({
        pos: v1115,
        isDashed: v1117[v1118]
      });
    }
  }
  v1116(v1102[0]);
  for (v1099 = 0; v1099 < v1097.body.length; ++v1099) {
    var v1119 = v1097.body[v1099];
    var v1120 = v1113;
    var v1121 = v1114;
    if (v1103 < v1119.length) {
      v1103 = v1119.length;
    }
    var v1122 = {
      cells: new Array(v1119.length),
      height: 0,
      depth: 0,
      pos: 0
    };
    for (v1100 = 0; v1100 < v1119.length; ++v1100) {
      var v1123 = buildGroup$1(v1119[v1100], v1098);
      if (v1121 < v1123.depth) {
        v1121 = v1123.depth;
      }
      if (v1120 < v1123.height) {
        v1120 = v1123.height;
      }
      v1122.cells[v1100] = v1123;
    }
    var v1124 = v1097.rowGaps[v1099];
    var v1125 = 0;
    if (v1124) {
      v1125 = calculateSize(v1124, v1098);
      if (v1125 > 0) {
        v1125 += v1114;
        if (v1121 < v1125) {
          v1121 = v1125;
        }
        v1125 = 0;
      }
    }
    if (v1097.addJot && v1099 < v1097.body.length - 1) {
      v1121 += v1111;
    }
    v1122.height = v1120;
    v1122.depth = v1121;
    v1115 += v1120;
    v1122.pos = v1115;
    v1115 += v1121 + v1125;
    v1104[v1099] = v1122;
    v1116(v1102[v1099 + 1]);
  }
  var v1126 = v1115 / 2 + v1098.fontMetrics().axisHeight;
  var v1127 = v1097.cols || [];
  var v1128 = [];
  var v1129;
  var v1130;
  var v1131 = [];
  if (v1097.tags && v1097.tags.some(v1132 => v1132)) {
    for (v1099 = 0; v1099 < v1101; ++v1099) {
      var v1133 = v1104[v1099];
      var v1134 = v1133.pos - v1126;
      var v1135 = v1097.tags[v1099];
      var v1136 = undefined;
      if (v1135 === true) {
        v1136 = makeSpan(["eqn-num"], [], v1098);
      } else if (v1135 === false) {
        v1136 = makeSpan([], [], v1098);
      } else {
        v1136 = makeSpan([], buildExpression$1(v1135, v1098, true), v1098);
      }
      v1136.depth = v1133.depth;
      v1136.height = v1133.height;
      v1131.push({
        type: "elem",
        elem: v1136,
        shift: v1134
      });
    }
  }
  v1100 = 0;
  v1130 = 0;
  for (; v1100 < v1103 || v1130 < v1127.length; ++v1100, ++v1130) {
    var v1137;
    var v1138 = v1127[v1130];
    var v1139 = true;
    while (((v1140 = v1138) == null ? undefined : v1140.type) === "separator") {
      var v1140;
      if (!v1139) {
        v1129 = makeSpan(["arraycolsep"], []);
        v1129.style.width = makeEm(v1098.fontMetrics().doubleRuleSep);
        v1128.push(v1129);
      }
      if (v1138.separator === "|" || v1138.separator === ":") {
        var v1141 = v1138.separator === "|" ? "solid" : "dashed";
        var v1142 = makeSpan(["vertical-separator"], [], v1098);
        v1142.style.height = makeEm(v1115);
        v1142.style.borderRightWidth = makeEm(v1106);
        v1142.style.borderRightStyle = v1141;
        v1142.style.margin = "0 " + makeEm(-v1106 / 2);
        var v1143 = v1115 - v1126;
        if (v1143) {
          v1142.style.verticalAlign = makeEm(-v1143);
        }
        v1128.push(v1142);
      } else {
        throw new ParseError("Invalid separator type: " + v1138.separator);
      }
      v1130++;
      v1138 = v1127[v1130];
      v1139 = false;
    }
    if (v1100 >= v1103) {
      continue;
    }
    var v1144 = undefined;
    if (v1100 > 0 || v1097.hskipBeforeAndAfter) {
      var v1145;
      v1144 = ((v1145 = v1138) == null ? undefined : v1145.pregap) ?? v1108;
      if (v1144 !== 0) {
        v1129 = makeSpan(["arraycolsep"], []);
        v1129.style.width = makeEm(v1144);
        v1128.push(v1129);
      }
    }
    var v1146 = [];
    for (v1099 = 0; v1099 < v1101; ++v1099) {
      var v1147 = v1104[v1099];
      var v1148 = v1147.cells[v1100];
      if (!v1148) {
        continue;
      }
      var v1149 = v1147.pos - v1126;
      v1148.depth = v1147.depth;
      v1148.height = v1147.height;
      v1146.push({
        type: "elem",
        elem: v1148,
        shift: v1149
      });
    }
    var v1150 = makeVList({
      positionType: "individualShift",
      children: v1146
    });
    var v1151 = makeSpan(["col-align-" + (((v1137 = v1138) == null ? undefined : v1137.align) || "c")], [v1150]);
    v1128.push(v1151);
    if (v1100 < v1103 - 1 || v1097.hskipBeforeAndAfter) {
      var v1152;
      v1144 = ((v1152 = v1138) == null ? undefined : v1152.postgap) ?? v1108;
      if (v1144 !== 0) {
        v1129 = makeSpan(["arraycolsep"], []);
        v1129.style.width = makeEm(v1144);
        v1128.push(v1129);
      }
    }
  }
  var v1153 = makeSpan(["mtable"], v1128);
  if (v1105.length > 0) {
    var v1154 = makeLineSpan("hline", v1098, v1106);
    var v1155 = makeLineSpan("hdashline", v1098, v1106);
    var v1156 = [{
      type: "elem",
      elem: v1153,
      shift: 0
    }];
    while (v1105.length > 0) {
      var v1157 = v1105.pop();
      var v1158 = v1157.pos - v1126;
      if (v1157.isDashed) {
        v1156.push({
          type: "elem",
          elem: v1155,
          shift: v1158
        });
      } else {
        v1156.push({
          type: "elem",
          elem: v1154,
          shift: v1158
        });
      }
    }
    v1153 = makeVList({
      positionType: "individualShift",
      children: v1156
    });
  }
  if (v1131.length === 0) {
    return makeSpan(["mord"], [v1153], v1098);
  } else {
    var v1159 = makeVList({
      positionType: "individualShift",
      children: v1131
    });
    var v1160 = makeSpan(["tag"], [v1159], v1098);
    return makeFragment([v1153, v1160]);
  }
};
var alignMap = {
  c: "center ",
  l: "left ",
  r: "right "
};
var mathmlBuilder$5 = function mathmlBuilder(v1161, v1162) {
  var v1163 = [];
  var v1164 = new MathNode("mtd", [], ["mtr-glue"]);
  var v1165 = new MathNode("mtd", [], ["mml-eqn-num"]);
  for (var v1166 = 0; v1166 < v1161.body.length; v1166++) {
    var v1167 = v1161.body[v1166];
    var v1168 = [];
    for (var v1169 = 0; v1169 < v1167.length; v1169++) {
      v1168.push(new MathNode("mtd", [buildGroup2(v1167[v1169], v1162)]));
    }
    if (v1161.tags && v1161.tags[v1166]) {
      v1168.unshift(v1164);
      v1168.push(v1164);
      if (v1161.leqno) {
        v1168.unshift(v1165);
      } else {
        v1168.push(v1165);
      }
    }
    v1163.push(new MathNode("mtr", v1168));
  }
  var v1170 = new MathNode("mtable", v1163);
  var v1171 = v1161.arraystretch === 0.5 ? 0.1 : 0.16 + v1161.arraystretch - 1 + (v1161.addJot ? 0.09 : 0);
  v1170.setAttribute("rowspacing", makeEm(v1171));
  var v1172 = "";
  var v1173 = "";
  if (v1161.cols && v1161.cols.length > 0) {
    var v1174 = v1161.cols;
    var v1175 = "";
    var v1176 = false;
    var v1177 = 0;
    var v1178 = v1174.length;
    if (v1174[0].type === "separator") {
      v1172 += "top ";
      v1177 = 1;
    }
    if (v1174[v1174.length - 1].type === "separator") {
      v1172 += "bottom ";
      v1178 -= 1;
    }
    for (var v1179 = v1177; v1179 < v1178; v1179++) {
      var v1180 = v1174[v1179];
      if (v1180.type === "align") {
        v1173 += alignMap[v1180.align];
        if (v1176) {
          v1175 += "none ";
        }
        v1176 = true;
      } else if (v1180.type === "separator") {
        if (v1176) {
          v1175 += v1180.separator === "|" ? "solid " : "dashed ";
          v1176 = false;
        }
      }
    }
    v1170.setAttribute("columnalign", v1173.trim());
    if (/[sd]/.test(v1175)) {
      v1170.setAttribute("columnlines", v1175.trim());
    }
  }
  if (v1161.colSeparationType === "align") {
    var v1181 = v1161.cols || [];
    var v1182 = "";
    for (var v1183 = 1; v1183 < v1181.length; v1183++) {
      v1182 += v1183 % 2 ? "0em " : "1em ";
    }
    v1170.setAttribute("columnspacing", v1182.trim());
  } else if (v1161.colSeparationType === "alignat" || v1161.colSeparationType === "gather") {
    v1170.setAttribute("columnspacing", "0em");
  } else if (v1161.colSeparationType === "small") {
    v1170.setAttribute("columnspacing", "0.2778em");
  } else if (v1161.colSeparationType === "CD") {
    v1170.setAttribute("columnspacing", "0.5em");
  } else {
    v1170.setAttribute("columnspacing", "1em");
  }
  var v1184 = "";
  var v1185 = v1161.hLinesBeforeRow;
  v1172 += v1185[0].length > 0 ? "left " : "";
  v1172 += v1185[v1185.length - 1].length > 0 ? "right " : "";
  for (var v1186 = 1; v1186 < v1185.length - 1; v1186++) {
    v1184 += v1185[v1186].length === 0 ? "none " : v1185[v1186][0] ? "dashed " : "solid ";
  }
  if (/[sd]/.test(v1184)) {
    v1170.setAttribute("rowlines", v1184.trim());
  }
  if (v1172 !== "") {
    v1170 = new MathNode("menclose", [v1170]);
    v1170.setAttribute("notation", v1172.trim());
  }
  if (v1161.arraystretch && v1161.arraystretch < 1) {
    v1170 = new MathNode("mstyle", [v1170]);
    v1170.setAttribute("scriptlevel", "1");
  }
  return v1170;
};
var alignedHandler = function alignedHandler2(v1187, v1188) {
  if (!v1187.envName.includes("ed")) {
    validateAmsEnvironmentContext(v1187);
  }
  var v1189 = [];
  var v1190 = v1187.envName.includes("at") ? "alignat" : "align";
  var v1191 = v1187.envName === "split";
  var v1192 = parseArray(v1187.parser, {
    cols: v1189,
    addJot: true,
    autoTag: v1191 ? undefined : getAutoTag(v1187.envName),
    emptySingleRow: true,
    colSeparationType: v1190,
    maxNumCols: v1191 ? 2 : undefined,
    leqno: v1187.parser.settings.leqno
  }, "display");
  var v1193 = 0;
  var v1194 = 0;
  var v1195 = {
    type: "ordgroup",
    mode: v1187.mode,
    body: []
  };
  if (v1188[0] && v1188[0].type === "ordgroup") {
    var v1196 = "";
    for (var v1197 = 0; v1197 < v1188[0].body.length; v1197++) {
      var v1198 = assertNodeType(v1188[0].body[v1197], "textord");
      v1196 += v1198.text;
    }
    v1193 = Number(v1196);
    v1194 = v1193 * 2;
  }
  var v1199 = !v1194;
  v1192.body.forEach(function (v1200) {
    for (var v1201 = 1; v1201 < v1200.length; v1201 += 2) {
      var v1202 = assertNodeType(v1200[v1201], "styling");
      var v1203 = assertNodeType(v1202.body[0], "ordgroup");
      v1203.body.unshift(v1195);
    }
    if (!v1199) {
      var v1204 = v1200.length / 2;
      if (v1193 < v1204) {
        throw new ParseError("Too many math in a row: " + ("expected " + v1193 + ", but got " + v1204), v1200[0]);
      }
    } else if (v1194 < v1200.length) {
      v1194 = v1200.length;
    }
  });
  for (var v1205 = 0; v1205 < v1194; ++v1205) {
    var v1206 = "r";
    var v1207 = 0;
    if (v1205 % 2 === 1) {
      v1206 = "l";
    } else if (v1205 > 0 && v1199) {
      v1207 = 1;
    }
    v1189[v1205] = {
      type: "align",
      align: v1206,
      pregap: v1207,
      postgap: 0
    };
  }
  v1192.colSeparationType = v1199 ? "align" : "alignat";
  return v1192;
};
defineEnvironment({
  type: "array",
  names: ["array", "darray"],
  props: {
    numArgs: 1
  },
  handler(v1208, v1209) {
    var v1210 = checkSymbolNodeType(v1209[0]);
    var v1211 = v1210 ? [v1209[0]] : assertNodeType(v1209[0], "ordgroup").body;
    var v1212 = v1211.map(function (v1213) {
      var v1214 = assertSymbolNodeType(v1213);
      var v1215 = v1214.text;
      if ("lcr".includes(v1215)) {
        return {
          type: "align",
          align: v1215
        };
      } else if (v1215 === "|") {
        return {
          type: "separator",
          separator: "|"
        };
      } else if (v1215 === ":") {
        return {
          type: "separator",
          separator: ":"
        };
      }
      throw new ParseError("Unknown column alignment: " + v1215, v1213);
    });
    var v1216 = {
      cols: v1212,
      hskipBeforeAndAfter: true,
      maxNumCols: v1212.length
    };
    return parseArray(v1208.parser, v1216, dCellStyle(v1208.envName));
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["matrix", "pmatrix", "bmatrix", "Bmatrix", "vmatrix", "Vmatrix", "matrix*", "pmatrix*", "bmatrix*", "Bmatrix*", "vmatrix*", "Vmatrix*"],
  props: {
    numArgs: 0
  },
  handler(v1217) {
    var v1218 = {
      matrix: null,
      pmatrix: ["(", ")"],
      bmatrix: ["[", "]"],
      Bmatrix: ["\\{", "\\}"],
      vmatrix: ["|", "|"],
      Vmatrix: ["\\Vert", "\\Vert"]
    }[v1217.envName.replace("*", "")];
    var v1219 = "c";
    var v1220 = {
      hskipBeforeAndAfter: false,
      cols: [{
        type: "align",
        align: v1219
      }]
    };
    if (v1217.envName.charAt(v1217.envName.length - 1) === "*") {
      var v1221 = v1217.parser;
      v1221.consumeSpaces();
      if (v1221.fetch().text === "[") {
        v1221.consume();
        v1221.consumeSpaces();
        v1219 = v1221.fetch().text;
        if (!"lcr".includes(v1219)) {
          throw new ParseError("Expected l or c or r", v1221.nextToken);
        }
        v1221.consume();
        v1221.consumeSpaces();
        v1221.expect("]");
        v1221.consume();
        v1220.cols = [{
          type: "align",
          align: v1219
        }];
      }
    }
    var v1222 = parseArray(v1217.parser, v1220, dCellStyle(v1217.envName));
    var v1223 = Math.max(0, ...v1222.body.map(v1224 => v1224.length));
    v1222.cols = new Array(v1223).fill({
      type: "align",
      align: v1219
    });
    if (v1218) {
      return {
        type: "leftright",
        mode: v1217.mode,
        body: [v1222],
        left: v1218[0],
        right: v1218[1],
        rightColor: undefined
      };
    } else {
      return v1222;
    }
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["smallmatrix"],
  props: {
    numArgs: 0
  },
  handler(v1225) {
    var v1226 = {
      arraystretch: 0.5
    };
    var v1227 = parseArray(v1225.parser, v1226, "script");
    v1227.colSeparationType = "small";
    return v1227;
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["subarray"],
  props: {
    numArgs: 1
  },
  handler(v1228, v1229) {
    var v1230 = checkSymbolNodeType(v1229[0]);
    var v1231 = v1230 ? [v1229[0]] : assertNodeType(v1229[0], "ordgroup").body;
    var v1232 = v1231.map(function (v1233) {
      var v1234 = assertSymbolNodeType(v1233);
      var v1235 = v1234.text;
      if ("lc".includes(v1235)) {
        return {
          type: "align",
          align: v1235
        };
      }
      throw new ParseError("Unknown column alignment: " + v1235, v1233);
    });
    if (v1232.length > 1) {
      throw new ParseError("{subarray} can contain only one column");
    }
    var v1236 = {
      cols: v1232,
      hskipBeforeAndAfter: false,
      arraystretch: 0.5
    };
    var v1237 = parseArray(v1228.parser, v1236, "script");
    if (v1237.body.length > 0 && v1237.body[0].length > 1) {
      throw new ParseError("{subarray} can contain only one column");
    }
    return v1237;
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["cases", "dcases", "rcases", "drcases"],
  props: {
    numArgs: 0
  },
  handler(v1238) {
    var v1239 = {
      arraystretch: 1.2,
      cols: [{
        type: "align",
        align: "l",
        pregap: 0,
        postgap: 1
      }, {
        type: "align",
        align: "l",
        pregap: 0,
        postgap: 0
      }]
    };
    var v1240 = parseArray(v1238.parser, v1239, dCellStyle(v1238.envName));
    return {
      type: "leftright",
      mode: v1238.mode,
      body: [v1240],
      left: v1238.envName.includes("r") ? "." : "\\{",
      right: v1238.envName.includes("r") ? "\\}" : ".",
      rightColor: undefined
    };
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["align", "align*", "aligned", "split"],
  props: {
    numArgs: 0
  },
  handler: alignedHandler,
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["gathered", "gather", "gather*"],
  props: {
    numArgs: 0
  },
  handler(v1241) {
    if (gatherEnvironments.has(v1241.envName)) {
      validateAmsEnvironmentContext(v1241);
    }
    var v1242 = {
      cols: [{
        type: "align",
        align: "c"
      }],
      addJot: true,
      colSeparationType: "gather",
      autoTag: getAutoTag(v1241.envName),
      emptySingleRow: true,
      leqno: v1241.parser.settings.leqno
    };
    return parseArray(v1241.parser, v1242, "display");
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["alignat", "alignat*", "alignedat"],
  props: {
    numArgs: 1
  },
  handler: alignedHandler,
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["equation", "equation*"],
  props: {
    numArgs: 0
  },
  handler(v1243) {
    validateAmsEnvironmentContext(v1243);
    var v1244 = {
      autoTag: getAutoTag(v1243.envName),
      emptySingleRow: true,
      singleRow: true,
      maxNumCols: 1,
      leqno: v1243.parser.settings.leqno
    };
    return parseArray(v1243.parser, v1244, "display");
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineEnvironment({
  type: "array",
  names: ["CD"],
  props: {
    numArgs: 0
  },
  handler(v1245) {
    validateAmsEnvironmentContext(v1245);
    return parseCD(v1245.parser);
  },
  htmlBuilder: htmlBuilder$6,
  mathmlBuilder: mathmlBuilder$5
});
defineMacro("\\nonumber", "\\gdef\\@eqnsw{0}");
defineMacro("\\notag", "\\nonumber");
defineFunction({
  type: "text",
  names: ["\\hline", "\\hdashline"],
  props: {
    numArgs: 0,
    allowedInText: true,
    allowedInMath: true
  },
  handler(v1246, v1247) {
    throw new ParseError(v1246.funcName + " valid only within array environment");
  }
});
var environments = _environments;
defineFunction({
  type: "environment",
  names: ["\\begin", "\\end"],
  props: {
    numArgs: 1,
    argTypes: ["text"]
  },
  handler(v1248, v1249) {
    var {
      parser: v1250,
      funcName: v1251
    } = v1248;
    var v1252 = v1249[0];
    if (v1252.type !== "ordgroup") {
      throw new ParseError("Invalid environment name", v1252);
    }
    var v1253 = "";
    for (var v1254 = 0; v1254 < v1252.body.length; ++v1254) {
      v1253 += assertNodeType(v1252.body[v1254], "textord").text;
    }
    if (v1251 === "\\begin") {
      if (!environments.hasOwnProperty(v1253)) {
        throw new ParseError("No such environment: " + v1253, v1252);
      }
      var v1255 = environments[v1253];
      var {
        args: v1256,
        optArgs: v1257
      } = v1250.parseArguments("\\begin{" + v1253 + "}", v1255);
      var v1258 = {
        mode: v1250.mode,
        envName: v1253,
        parser: v1250
      };
      var v1259 = v1255.handler(v1258, v1256, v1257);
      v1250.expect("\\end", false);
      var v1260 = v1250.nextToken;
      var v1261 = assertNodeType(v1250.parseFunction(), "environment");
      if (v1261.name !== v1253) {
        throw new ParseError("Mismatch: \\begin{" + v1253 + "} matched by \\end{" + v1261.name + "}", v1260);
      }
      return v1259;
    }
    return {
      type: "environment",
      mode: v1250.mode,
      name: v1253,
      nameGroup: v1252
    };
  }
});
var htmlBuilder$5 = (v1262, v1263) => {
  var v1264 = v1262.font;
  var v1265 = v1263.withFont(v1264);
  return buildGroup$1(v1262.body, v1265);
};
var mathmlBuilder$4 = (v1266, v1267) => {
  var v1268 = v1266.font;
  var v1269 = v1267.withFont(v1268);
  return buildGroup2(v1266.body, v1269);
};
var fontAliases = {
  "\\Bbb": "\\mathbb",
  "\\bold": "\\mathbf",
  "\\frak": "\\mathfrak"
};
defineFunction({
  type: "font",
  names: ["\\mathrm", "\\mathit", "\\mathbf", "\\mathnormal", "\\mathsfit", "\\mathbb", "\\mathcal", "\\mathfrak", "\\mathscr", "\\mathsf", "\\mathtt", "\\Bbb", "\\bold", "\\frak"],
  props: {
    numArgs: 1,
    allowedInArgument: true
  },
  handler: (v1270, v1271) => {
    var {
      parser: v1272,
      funcName: v1273
    } = v1270;
    var v1274 = normalizeArgument(v1271[0]);
    var v1275 = v1273;
    if (v1275 in fontAliases) {
      v1275 = fontAliases[v1275];
    }
    return {
      type: "font",
      mode: v1272.mode,
      font: v1275.slice(1),
      body: v1274
    };
  },
  htmlBuilder: htmlBuilder$5,
  mathmlBuilder: mathmlBuilder$4
});
defineFunction({
  type: "mclass",
  names: ["\\boldsymbol", "\\bm"],
  props: {
    numArgs: 1
  },
  handler: (v1276, v1277) => {
    var {
      parser: v1278
    } = v1276;
    var v1279 = v1277[0];
    return {
      type: "mclass",
      mode: v1278.mode,
      mclass: binrelClass(v1279),
      body: [{
        type: "font",
        mode: v1278.mode,
        font: "boldsymbol",
        body: v1279
      }],
      isCharacterBox: isCharacterBox(v1279)
    };
  }
});
defineFunction({
  type: "font",
  names: ["\\rm", "\\sf", "\\tt", "\\bf", "\\it", "\\cal"],
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler: (v1280, v1281) => {
    var {
      parser: v1282,
      funcName: v1283,
      breakOnTokenText: v1284
    } = v1280;
    var {
      mode: v1285
    } = v1282;
    var v1286 = v1282.parseExpression(true, v1284);
    return {
      type: "font",
      mode: v1285,
      font: "math" + v1283.slice(1),
      body: {
        type: "ordgroup",
        mode: v1282.mode,
        body: v1286
      }
    };
  },
  htmlBuilder: htmlBuilder$5,
  mathmlBuilder: mathmlBuilder$4
});
var htmlBuilder$4 = (v1287, v1288) => {
  var v1289 = v1288.style;
  var v1290 = v1289.fracNum();
  var v1291 = v1289.fracDen();
  var v1292;
  v1292 = v1288.havingStyle(v1290);
  var v1293 = buildGroup$1(v1287.numer, v1292, v1288);
  if (v1287.continued) {
    var v1294 = 8.5 / v1288.fontMetrics().ptPerEm;
    var v1295 = 3.5 / v1288.fontMetrics().ptPerEm;
    v1293.height = v1293.height < v1294 ? v1294 : v1293.height;
    v1293.depth = v1293.depth < v1295 ? v1295 : v1293.depth;
  }
  v1292 = v1288.havingStyle(v1291);
  var v1296 = buildGroup$1(v1287.denom, v1292, v1288);
  var v1297;
  var v1298;
  var v1299;
  if (v1287.hasBarLine) {
    if (v1287.barSize) {
      v1298 = calculateSize(v1287.barSize, v1288);
      v1297 = makeLineSpan("frac-line", v1288, v1298);
    } else {
      v1297 = makeLineSpan("frac-line", v1288);
    }
    v1298 = v1297.height;
    v1299 = v1297.height;
  } else {
    v1297 = null;
    v1298 = 0;
    v1299 = v1288.fontMetrics().defaultRuleThickness;
  }
  var v1300;
  var v1301;
  var v1302;
  if (v1289.size === Style$1.DISPLAY.size) {
    v1300 = v1288.fontMetrics().num1;
    if (v1298 > 0) {
      v1301 = v1299 * 3;
    } else {
      v1301 = v1299 * 7;
    }
    v1302 = v1288.fontMetrics().denom1;
  } else {
    if (v1298 > 0) {
      v1300 = v1288.fontMetrics().num2;
      v1301 = v1299;
    } else {
      v1300 = v1288.fontMetrics().num3;
      v1301 = v1299 * 3;
    }
    v1302 = v1288.fontMetrics().denom2;
  }
  var v1303;
  if (!v1297) {
    var v1304 = v1300 - v1293.depth - (v1296.height - v1302);
    if (v1304 < v1301) {
      v1300 += (v1301 - v1304) * 0.5;
      v1302 += (v1301 - v1304) * 0.5;
    }
    v1303 = makeVList({
      positionType: "individualShift",
      children: [{
        type: "elem",
        elem: v1296,
        shift: v1302
      }, {
        type: "elem",
        elem: v1293,
        shift: -v1300
      }]
    });
  } else {
    var v1305 = v1288.fontMetrics().axisHeight;
    if (v1300 - v1293.depth - (v1305 + v1298 * 0.5) < v1301) {
      v1300 += v1301 - (v1300 - v1293.depth - (v1305 + v1298 * 0.5));
    }
    if (v1305 - v1298 * 0.5 - (v1296.height - v1302) < v1301) {
      v1302 += v1301 - (v1305 - v1298 * 0.5 - (v1296.height - v1302));
    }
    var v1306 = -(v1305 - v1298 * 0.5);
    v1303 = makeVList({
      positionType: "individualShift",
      children: [{
        type: "elem",
        elem: v1296,
        shift: v1302
      }, {
        type: "elem",
        elem: v1297,
        shift: v1306
      }, {
        type: "elem",
        elem: v1293,
        shift: -v1300
      }]
    });
  }
  v1292 = v1288.havingStyle(v1289);
  v1303.height *= v1292.sizeMultiplier / v1288.sizeMultiplier;
  v1303.depth *= v1292.sizeMultiplier / v1288.sizeMultiplier;
  var v1307;
  if (v1289.size === Style$1.DISPLAY.size) {
    v1307 = v1288.fontMetrics().delim1;
  } else if (v1289.size === Style$1.SCRIPTSCRIPT.size) {
    v1307 = v1288.havingStyle(Style$1.SCRIPT).fontMetrics().delim2;
  } else {
    v1307 = v1288.fontMetrics().delim2;
  }
  var v1308;
  var v1309;
  if (v1287.leftDelim == null) {
    v1308 = makeNullDelimiter(v1288, ["mopen"]);
  } else {
    v1308 = makeCustomSizedDelim(v1287.leftDelim, v1307, true, v1288.havingStyle(v1289), v1287.mode, ["mopen"]);
  }
  if (v1287.continued) {
    v1309 = makeSpan([]);
  } else if (v1287.rightDelim == null) {
    v1309 = makeNullDelimiter(v1288, ["mclose"]);
  } else {
    v1309 = makeCustomSizedDelim(v1287.rightDelim, v1307, true, v1288.havingStyle(v1289), v1287.mode, ["mclose"]);
  }
  return makeSpan(["mord"].concat(v1292.sizingClasses(v1288)), [v1308, makeSpan(["mfrac"], [v1303]), v1309], v1288);
};
var mathmlBuilder$3 = (v1310, v1311) => {
  var v1312 = new MathNode("mfrac", [buildGroup2(v1310.numer, v1311), buildGroup2(v1310.denom, v1311)]);
  if (!v1310.hasBarLine) {
    v1312.setAttribute("linethickness", "0px");
  } else if (v1310.barSize) {
    var v1313 = calculateSize(v1310.barSize, v1311);
    v1312.setAttribute("linethickness", makeEm(v1313));
  }
  if (v1310.leftDelim != null || v1310.rightDelim != null) {
    var v1314 = [];
    if (v1310.leftDelim != null) {
      var v1315 = new MathNode("mo", [new TextNode(v1310.leftDelim.replace("\\", ""))]);
      v1315.setAttribute("fence", "true");
      v1314.push(v1315);
    }
    v1314.push(v1312);
    if (v1310.rightDelim != null) {
      var v1316 = new MathNode("mo", [new TextNode(v1310.rightDelim.replace("\\", ""))]);
      v1316.setAttribute("fence", "true");
      v1314.push(v1316);
    }
    return makeRow(v1314);
  }
  return v1312;
};
var wrapWithStyle = (v1317, v1318) => {
  if (!v1318) {
    return v1317;
  }
  var v1319 = {
    type: "styling",
    mode: v1317.mode,
    style: v1318,
    body: [v1317]
  };
  return v1319;
};
defineFunction({
  type: "genfrac",
  names: ["\\cfrac", "\\dfrac", "\\frac", "\\tfrac", "\\dbinom", "\\binom", "\\tbinom", "\\\\atopfrac", "\\\\bracefrac", "\\\\brackfrac"],
  props: {
    numArgs: 2,
    allowedInArgument: true
  },
  handler: (v1320, v1321) => {
    var {
      parser: v1322,
      funcName: v1323
    } = v1320;
    var v1324 = v1321[0];
    var v1325 = v1321[1];
    var v1326;
    var v1327 = null;
    var v1328 = null;
    switch (v1323) {
      case "\\cfrac":
      case "\\dfrac":
      case "\\frac":
      case "\\tfrac":
        v1326 = true;
        break;
      case "\\\\atopfrac":
        v1326 = false;
        break;
      case "\\dbinom":
      case "\\binom":
      case "\\tbinom":
        v1326 = false;
        v1327 = "(";
        v1328 = ")";
        break;
      case "\\\\bracefrac":
        v1326 = false;
        v1327 = "\\{";
        v1328 = "\\}";
        break;
      case "\\\\brackfrac":
        v1326 = false;
        v1327 = "[";
        v1328 = "]";
        break;
      default:
        throw new Error("Unrecognized genfrac command");
    }
    var v1329 = v1323 === "\\cfrac";
    var v1330 = null;
    if (v1329 || v1323.startsWith("\\d")) {
      v1330 = "display";
    } else if (v1323.startsWith("\\t")) {
      v1330 = "text";
    }
    return wrapWithStyle({
      type: "genfrac",
      mode: v1322.mode,
      numer: v1324,
      denom: v1325,
      continued: v1329,
      hasBarLine: v1326,
      leftDelim: v1327,
      rightDelim: v1328,
      barSize: null
    }, v1330);
  },
  htmlBuilder: htmlBuilder$4,
  mathmlBuilder: mathmlBuilder$3
});
defineFunction({
  type: "infix",
  names: ["\\over", "\\choose", "\\atop", "\\brace", "\\brack"],
  props: {
    numArgs: 0,
    infix: true
  },
  handler(v1331) {
    var {
      parser: v1332,
      funcName: v1333,
      token: v1334
    } = v1331;
    var v1335;
    switch (v1333) {
      case "\\over":
        v1335 = "\\frac";
        break;
      case "\\choose":
        v1335 = "\\binom";
        break;
      case "\\atop":
        v1335 = "\\\\atopfrac";
        break;
      case "\\brace":
        v1335 = "\\\\bracefrac";
        break;
      case "\\brack":
        v1335 = "\\\\brackfrac";
        break;
      default:
        throw new Error("Unrecognized infix genfrac command");
    }
    return {
      type: "infix",
      mode: v1332.mode,
      replaceWith: v1335,
      token: v1334
    };
  }
});
var stylArray = ["display", "text", "script", "scriptscript"];
var delimFromValue = function delimFromValue2(v1336) {
  var v1337 = null;
  if (v1336.length > 0) {
    v1337 = v1336;
    v1337 = v1337 === "." ? null : v1337;
  }
  return v1337;
};
defineFunction({
  type: "genfrac",
  names: ["\\genfrac"],
  props: {
    numArgs: 6,
    allowedInArgument: true,
    argTypes: ["math", "math", "size", "text", "math", "math"]
  },
  handler(v1338, v1339) {
    var {
      parser: v1340
    } = v1338;
    var v1341 = v1339[4];
    var v1342 = v1339[5];
    var v1343 = normalizeArgument(v1339[0]);
    var v1344 = v1343.type === "atom" && v1343.family === "open" ? delimFromValue(v1343.text) : null;
    var v1345 = normalizeArgument(v1339[1]);
    var v1346 = v1345.type === "atom" && v1345.family === "close" ? delimFromValue(v1345.text) : null;
    var v1347 = assertNodeType(v1339[2], "size");
    var v1348;
    var v1349 = null;
    if (v1347.isBlank) {
      v1348 = true;
    } else {
      v1349 = v1347.value;
      v1348 = v1349.number > 0;
    }
    var v1350 = null;
    var v1351 = v1339[3];
    if (v1351.type === "ordgroup") {
      if (v1351.body.length > 0) {
        var v1352 = assertNodeType(v1351.body[0], "textord");
        v1350 = stylArray[Number(v1352.text)];
      }
    } else {
      v1351 = assertNodeType(v1351, "textord");
      v1350 = stylArray[Number(v1351.text)];
    }
    return wrapWithStyle({
      type: "genfrac",
      mode: v1340.mode,
      numer: v1341,
      denom: v1342,
      continued: false,
      hasBarLine: v1348,
      barSize: v1349,
      leftDelim: v1344,
      rightDelim: v1346
    }, v1350);
  }
});
defineFunction({
  type: "infix",
  names: ["\\above"],
  props: {
    numArgs: 1,
    argTypes: ["size"],
    infix: true
  },
  handler(v1353, v1354) {
    var {
      parser: v1355,
      funcName: v1356,
      token: v1357
    } = v1353;
    return {
      type: "infix",
      mode: v1355.mode,
      replaceWith: "\\\\abovefrac",
      size: assertNodeType(v1354[0], "size").value,
      token: v1357
    };
  }
});
defineFunction({
  type: "genfrac",
  names: ["\\\\abovefrac"],
  props: {
    numArgs: 3,
    argTypes: ["math", "size", "math"]
  },
  handler: (v1358, v1359) => {
    var {
      parser: v1360,
      funcName: v1361
    } = v1358;
    var v1362 = v1359[0];
    var v1363 = assertNodeType(v1359[1], "infix").size;
    if (!v1363) {
      throw new Error("\\\\abovefrac expected size, but got " + String(v1363));
    }
    var v1364 = v1359[2];
    var v1365 = v1363.number > 0;
    return {
      type: "genfrac",
      mode: v1360.mode,
      numer: v1362,
      denom: v1364,
      continued: false,
      hasBarLine: v1365,
      barSize: v1363,
      leftDelim: null,
      rightDelim: null
    };
  }
});
var htmlBuilder$3 = (v1366, v1367) => {
  var v1368 = v1367.style;
  var v1369;
  var v1370;
  if (v1366.type === "supsub") {
    v1369 = v1366.sup ? buildGroup$1(v1366.sup, v1367.havingStyle(v1368.sup()), v1367) : buildGroup$1(v1366.sub, v1367.havingStyle(v1368.sub()), v1367);
    v1370 = assertNodeType(v1366.base, "horizBrace");
  } else {
    v1370 = assertNodeType(v1366, "horizBrace");
  }
  var v1371 = buildGroup$1(v1370.base, v1367.havingBaseStyle(Style$1.DISPLAY));
  var v1372 = stretchySvg(v1370, v1367);
  var v1373;
  if (v1370.isOver) {
    v1373 = makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: v1371
      }, {
        type: "kern",
        size: 0.1
      }, {
        type: "elem",
        elem: v1372,
        wrapperClasses: ["svg-align"]
      }]
    });
  } else {
    v1373 = makeVList({
      positionType: "bottom",
      positionData: v1371.depth + 0.1 + v1372.height,
      children: [{
        type: "elem",
        elem: v1372,
        wrapperClasses: ["svg-align"]
      }, {
        type: "kern",
        size: 0.1
      }, {
        type: "elem",
        elem: v1371
      }]
    });
  }
  if (v1369) {
    var v1374 = makeSpan(["minner", v1370.isOver ? "mover" : "munder"], [v1373], v1367);
    if (v1370.isOver) {
      v1373 = makeVList({
        positionType: "firstBaseline",
        children: [{
          type: "elem",
          elem: v1374
        }, {
          type: "kern",
          size: 0.2
        }, {
          type: "elem",
          elem: v1369
        }]
      });
    } else {
      v1373 = makeVList({
        positionType: "bottom",
        positionData: v1374.depth + 0.2 + v1369.height + v1369.depth,
        children: [{
          type: "elem",
          elem: v1369
        }, {
          type: "kern",
          size: 0.2
        }, {
          type: "elem",
          elem: v1374
        }]
      });
    }
  }
  return makeSpan(["minner", v1370.isOver ? "mover" : "munder"], [v1373], v1367);
};
var mathmlBuilder$2 = (v1375, v1376) => {
  var v1377 = stretchyMathML(v1375.label);
  return new MathNode(v1375.isOver ? "mover" : "munder", [buildGroup2(v1375.base, v1376), v1377]);
};
defineFunction({
  type: "horizBrace",
  names: ["\\overbrace", "\\underbrace", "\\overbracket", "\\underbracket"],
  props: {
    numArgs: 1
  },
  handler(v1378, v1379) {
    var {
      parser: v1380,
      funcName: v1381
    } = v1378;
    return {
      type: "horizBrace",
      mode: v1380.mode,
      label: v1381,
      isOver: v1381.includes("\\over"),
      base: v1379[0]
    };
  },
  htmlBuilder: htmlBuilder$3,
  mathmlBuilder: mathmlBuilder$2
});
defineFunction({
  type: "href",
  names: ["\\href"],
  props: {
    numArgs: 2,
    argTypes: ["url", "original"],
    allowedInText: true
  },
  handler: (v1382, v1383) => {
    var {
      parser: v1384
    } = v1382;
    var v1385 = v1383[1];
    var v1386 = assertNodeType(v1383[0], "url").url;
    if (!v1384.settings.isTrusted({
      command: "\\href",
      url: v1386
    })) {
      return v1384.formatUnsupportedCmd("\\href");
    }
    return {
      type: "href",
      mode: v1384.mode,
      href: v1386,
      body: ordargument(v1385)
    };
  },
  htmlBuilder: (v1387, v1388) => {
    var v1389 = buildExpression$1(v1387.body, v1388, false);
    return makeAnchor(v1387.href, [], v1389, v1388);
  },
  mathmlBuilder: (v1390, v1391) => {
    var v1392 = buildExpressionRow(v1390.body, v1391);
    if (!(v1392 instanceof MathNode)) {
      v1392 = new MathNode("mrow", [v1392]);
    }
    v1392.setAttribute("href", v1390.href);
    return v1392;
  }
});
defineFunction({
  type: "href",
  names: ["\\url"],
  props: {
    numArgs: 1,
    argTypes: ["url"],
    allowedInText: true
  },
  handler: (v1393, v1394) => {
    var {
      parser: v1395
    } = v1393;
    var v1396 = assertNodeType(v1394[0], "url").url;
    if (!v1395.settings.isTrusted({
      command: "\\url",
      url: v1396
    })) {
      return v1395.formatUnsupportedCmd("\\url");
    }
    var v1397 = [];
    for (var v1398 = 0; v1398 < v1396.length; v1398++) {
      var v1399 = v1396[v1398];
      if (v1399 === "~") {
        v1399 = "\\textasciitilde";
      }
      v1397.push({
        type: "textord",
        mode: "text",
        text: v1399
      });
    }
    var v1400 = {
      type: "text",
      mode: v1395.mode,
      font: "\\texttt",
      body: v1397
    };
    return {
      type: "href",
      mode: v1395.mode,
      href: v1396,
      body: ordargument(v1400)
    };
  }
});
defineFunction({
  type: "hbox",
  names: ["\\hbox"],
  props: {
    numArgs: 1,
    argTypes: ["text"],
    allowedInText: true,
    primitive: true
  },
  handler(v1401, v1402) {
    var {
      parser: v1403
    } = v1401;
    return {
      type: "hbox",
      mode: v1403.mode,
      body: ordargument(v1402[0])
    };
  },
  htmlBuilder(v1404, v1405) {
    var v1406 = buildExpression$1(v1404.body, v1405.withFont(""), false);
    return makeFragment(v1406);
  },
  mathmlBuilder(v1407, v1408) {
    return new MathNode("mrow", buildExpression2(v1407.body, v1408.withFont("")));
  }
});
defineFunction({
  type: "html",
  names: ["\\htmlClass", "\\htmlId", "\\htmlStyle", "\\htmlData"],
  props: {
    numArgs: 2,
    argTypes: ["raw", "original"],
    allowedInText: true
  },
  handler: (v1409, v1410) => {
    var {
      parser: v1411,
      funcName: v1412,
      token: v1413
    } = v1409;
    var v1414 = assertNodeType(v1410[0], "raw").string;
    var v1415 = v1410[1];
    if (v1411.settings.strict) {
      v1411.settings.reportNonstrict("htmlExtension", "HTML extension is disabled on strict mode");
    }
    var v1416;
    var v1417 = {};
    switch (v1412) {
      case "\\htmlClass":
        v1417.class = v1414;
        v1416 = {
          command: "\\htmlClass",
          class: v1414
        };
        break;
      case "\\htmlId":
        v1417.id = v1414;
        v1416 = {
          command: "\\htmlId",
          id: v1414
        };
        break;
      case "\\htmlStyle":
        v1417.style = v1414;
        v1416 = {
          command: "\\htmlStyle",
          style: v1414
        };
        break;
      case "\\htmlData":
        {
          var v1418 = v1414.split(",");
          for (var v1419 = 0; v1419 < v1418.length; v1419++) {
            var v1420 = v1418[v1419];
            var v1421 = v1420.indexOf("=");
            if (v1421 < 0) {
              throw new ParseError("\\htmlData key/value '" + v1420 + "' missing equals sign");
            }
            var v1422 = v1420.slice(0, v1421);
            var v1423 = v1420.slice(v1421 + 1);
            v1417["data-" + v1422.trim()] = v1423;
          }
          v1416 = {
            command: "\\htmlData",
            attributes: v1417
          };
          break;
        }
      default:
        throw new Error("Unrecognized html command");
    }
    if (!v1411.settings.isTrusted(v1416)) {
      return v1411.formatUnsupportedCmd(v1412);
    }
    return {
      type: "html",
      mode: v1411.mode,
      attributes: v1417,
      body: ordargument(v1415)
    };
  },
  htmlBuilder: (v1424, v1425) => {
    var v1426 = buildExpression$1(v1424.body, v1425, false);
    var v1427 = ["enclosing"];
    if (v1424.attributes.class) {
      v1427.push(...v1424.attributes.class.trim().split(/\s+/));
    }
    var v1428 = makeSpan(v1427, v1426, v1425);
    for (var v1429 in v1424.attributes) {
      if (v1429 !== "class" && v1424.attributes.hasOwnProperty(v1429)) {
        v1428.setAttribute(v1429, v1424.attributes[v1429]);
      }
    }
    return v1428;
  },
  mathmlBuilder: (v1430, v1431) => {
    return buildExpressionRow(v1430.body, v1431);
  }
});
defineFunction({
  type: "htmlmathml",
  names: ["\\html@mathml"],
  props: {
    numArgs: 2,
    allowedInArgument: true,
    allowedInText: true
  },
  handler: (v1432, v1433) => {
    var {
      parser: v1434
    } = v1432;
    return {
      type: "htmlmathml",
      mode: v1434.mode,
      html: ordargument(v1433[0]),
      mathml: ordargument(v1433[1])
    };
  },
  htmlBuilder: (v1435, v1436) => {
    var v1437 = buildExpression$1(v1435.html, v1436, false);
    return makeFragment(v1437);
  },
  mathmlBuilder: (v1438, v1439) => {
    return buildExpressionRow(v1438.mathml, v1439);
  }
});
var sizeData = function sizeData2(v1440) {
  if (/^[-+]? *(\d+(\.\d*)?|\.\d+)$/.test(v1440)) {
    return {
      number: +v1440,
      unit: "bp"
    };
  } else {
    var v1441 = /([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(v1440);
    if (!v1441) {
      throw new ParseError("Invalid size: '" + v1440 + "' in \\includegraphics");
    }
    var v1442 = {
      number: +(v1441[1] + v1441[2]),
      unit: v1441[3]
    };
    if (!validUnit(v1442)) {
      throw new ParseError("Invalid unit: '" + v1442.unit + "' in \\includegraphics.");
    }
    return v1442;
  }
};
defineFunction({
  type: "includegraphics",
  names: ["\\includegraphics"],
  props: {
    numArgs: 1,
    numOptionalArgs: 1,
    argTypes: ["raw", "url"],
    allowedInText: false
  },
  handler: (v1443, v1444, v1445) => {
    var {
      parser: v1446
    } = v1443;
    var v1447 = {
      number: 0,
      unit: "em"
    };
    var v1448 = {
      number: 0.9,
      unit: "em"
    };
    var v1449 = {
      number: 0,
      unit: "em"
    };
    var v1450 = "";
    if (v1445[0]) {
      var v1451 = assertNodeType(v1445[0], "raw").string;
      var v1452 = v1451.split(",");
      for (var v1453 = 0; v1453 < v1452.length; v1453++) {
        var v1454 = v1452[v1453].split("=");
        if (v1454.length === 2) {
          var v1455 = v1454[1].trim();
          switch (v1454[0].trim()) {
            case "alt":
              v1450 = v1455;
              break;
            case "width":
              v1447 = sizeData(v1455);
              break;
            case "height":
              v1448 = sizeData(v1455);
              break;
            case "totalheight":
              v1449 = sizeData(v1455);
              break;
            default:
              throw new ParseError("Invalid key: '" + v1454[0] + "' in \\includegraphics.");
          }
        }
      }
    }
    var v1456 = assertNodeType(v1444[0], "url").url;
    if (v1450 === "") {
      v1450 = v1456;
      v1450 = v1450.replace(/^.*[\\/]/, "");
      v1450 = v1450.substring(0, v1450.lastIndexOf("."));
    }
    if (!v1446.settings.isTrusted({
      command: "\\includegraphics",
      url: v1456
    })) {
      return v1446.formatUnsupportedCmd("\\includegraphics");
    }
    return {
      type: "includegraphics",
      mode: v1446.mode,
      alt: v1450,
      width: v1447,
      height: v1448,
      totalheight: v1449,
      src: v1456
    };
  },
  htmlBuilder: (v1457, v1458) => {
    var v1459 = calculateSize(v1457.height, v1458);
    var v1460 = 0;
    if (v1457.totalheight.number > 0) {
      v1460 = calculateSize(v1457.totalheight, v1458) - v1459;
    }
    var v1461 = 0;
    if (v1457.width.number > 0) {
      v1461 = calculateSize(v1457.width, v1458);
    }
    var v1462 = {
      height: makeEm(v1459 + v1460)
    };
    if (v1461 > 0) {
      v1462.width = makeEm(v1461);
    }
    if (v1460 > 0) {
      v1462.verticalAlign = makeEm(-v1460);
    }
    var v1463 = new Img(v1457.src, v1457.alt, v1462);
    v1463.height = v1459;
    v1463.depth = v1460;
    return v1463;
  },
  mathmlBuilder: (v1464, v1465) => {
    var v1466 = new MathNode("mglyph", []);
    v1466.setAttribute("alt", v1464.alt);
    var v1467 = calculateSize(v1464.height, v1465);
    var v1468 = 0;
    if (v1464.totalheight.number > 0) {
      v1468 = calculateSize(v1464.totalheight, v1465) - v1467;
      v1466.setAttribute("valign", makeEm(-v1468));
    }
    v1466.setAttribute("height", makeEm(v1467 + v1468));
    if (v1464.width.number > 0) {
      var v1469 = calculateSize(v1464.width, v1465);
      v1466.setAttribute("width", makeEm(v1469));
    }
    v1466.setAttribute("src", v1464.src);
    return v1466;
  }
});
defineFunction({
  type: "kern",
  names: ["\\kern", "\\mkern", "\\hskip", "\\mskip"],
  props: {
    numArgs: 1,
    argTypes: ["size"],
    primitive: true,
    allowedInText: true
  },
  handler(v1470, v1471) {
    var {
      parser: v1472,
      funcName: v1473
    } = v1470;
    var v1474 = assertNodeType(v1471[0], "size");
    if (v1472.settings.strict) {
      var v1475 = v1473[1] === "m";
      var v1476 = v1474.value.unit === "mu";
      if (v1475) {
        if (!v1476) {
          v1472.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + v1473 + " supports only mu units, " + ("not " + v1474.value.unit + " units"));
        }
        if (v1472.mode !== "math") {
          v1472.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + v1473 + " works only in math mode");
        }
      } else if (v1476) {
        v1472.settings.reportNonstrict("mathVsTextUnits", "LaTeX's " + v1473 + " doesn't support mu units");
      }
    }
    return {
      type: "kern",
      mode: v1472.mode,
      dimension: v1474.value
    };
  },
  htmlBuilder(v1477, v1478) {
    return makeGlue(v1477.dimension, v1478);
  },
  mathmlBuilder(v1479, v1480) {
    var v1481 = calculateSize(v1479.dimension, v1480);
    return new SpaceNode(v1481);
  }
});
defineFunction({
  type: "lap",
  names: ["\\mathllap", "\\mathrlap", "\\mathclap"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler: (v1482, v1483) => {
    var {
      parser: v1484,
      funcName: v1485
    } = v1482;
    var v1486 = v1483[0];
    return {
      type: "lap",
      mode: v1484.mode,
      alignment: v1485.slice(5),
      body: v1486
    };
  },
  htmlBuilder: (v1487, v1488) => {
    var v1489;
    if (v1487.alignment === "clap") {
      v1489 = makeSpan([], [buildGroup$1(v1487.body, v1488)]);
      v1489 = makeSpan(["inner"], [v1489], v1488);
    } else {
      v1489 = makeSpan(["inner"], [buildGroup$1(v1487.body, v1488)]);
    }
    var v1490 = makeSpan(["fix"], []);
    var v1491 = makeSpan([v1487.alignment], [v1489, v1490], v1488);
    var v1492 = makeSpan(["strut"]);
    v1492.style.height = makeEm(v1491.height + v1491.depth);
    if (v1491.depth) {
      v1492.style.verticalAlign = makeEm(-v1491.depth);
    }
    v1491.children.unshift(v1492);
    v1491 = makeSpan(["thinbox"], [v1491], v1488);
    return makeSpan(["mord", "vbox"], [v1491], v1488);
  },
  mathmlBuilder: (v1493, v1494) => {
    var v1495 = new MathNode("mpadded", [buildGroup2(v1493.body, v1494)]);
    if (v1493.alignment !== "rlap") {
      var v1496 = v1493.alignment === "llap" ? "-1" : "-0.5";
      v1495.setAttribute("lspace", v1496 + "width");
    }
    v1495.setAttribute("width", "0px");
    return v1495;
  }
});
defineFunction({
  type: "styling",
  names: ["\\(", "$"],
  props: {
    numArgs: 0,
    allowedInText: true,
    allowedInMath: false
  },
  handler(v1497, v1498) {
    var {
      funcName: v1499,
      parser: v1500
    } = v1497;
    var v1501 = v1500.mode;
    v1500.switchMode("math");
    var v1502 = v1499 === "\\(" ? "\\)" : "$";
    var v1503 = v1500.parseExpression(false, v1502);
    v1500.expect(v1502);
    v1500.switchMode(v1501);
    return {
      type: "styling",
      mode: v1500.mode,
      style: "text",
      resetFont: true,
      body: v1503
    };
  }
});
defineFunction({
  type: "text",
  names: ["\\)", "\\]"],
  props: {
    numArgs: 0,
    allowedInText: true,
    allowedInMath: false
  },
  handler(v1504, v1505) {
    throw new ParseError("Mismatched " + v1504.funcName);
  }
});
var chooseMathStyle = (v1506, v1507) => {
  switch (v1507.style.size) {
    case Style$1.DISPLAY.size:
      return v1506.display;
    case Style$1.TEXT.size:
      return v1506.text;
    case Style$1.SCRIPT.size:
      return v1506.script;
    case Style$1.SCRIPTSCRIPT.size:
      return v1506.scriptscript;
    default:
      return v1506.text;
  }
};
defineFunction({
  type: "mathchoice",
  names: ["\\mathchoice"],
  props: {
    numArgs: 4,
    primitive: true
  },
  handler: (v1508, v1509) => {
    var {
      parser: v1510
    } = v1508;
    return {
      type: "mathchoice",
      mode: v1510.mode,
      display: ordargument(v1509[0]),
      text: ordargument(v1509[1]),
      script: ordargument(v1509[2]),
      scriptscript: ordargument(v1509[3])
    };
  },
  htmlBuilder: (v1511, v1512) => {
    var v1513 = chooseMathStyle(v1511, v1512);
    var v1514 = buildExpression$1(v1513, v1512, false);
    return makeFragment(v1514);
  },
  mathmlBuilder: (v1515, v1516) => {
    var v1517 = chooseMathStyle(v1515, v1516);
    return buildExpressionRow(v1517, v1516);
  }
});
var assembleSupSub = (v1518, v1519, v1520, v1521, v1522, v1523, v1524) => {
  v1518 = makeSpan([], [v1518]);
  var v1525 = v1520 && isCharacterBox(v1520);
  var v1526;
  var v1527;
  if (v1519) {
    var v1528 = buildGroup$1(v1519, v1521.havingStyle(v1522.sup()), v1521);
    v1527 = {
      elem: v1528,
      kern: Math.max(v1521.fontMetrics().bigOpSpacing1, v1521.fontMetrics().bigOpSpacing3 - v1528.depth)
    };
  }
  if (v1520) {
    var v1529 = buildGroup$1(v1520, v1521.havingStyle(v1522.sub()), v1521);
    v1526 = {
      elem: v1529,
      kern: Math.max(v1521.fontMetrics().bigOpSpacing2, v1521.fontMetrics().bigOpSpacing4 - v1529.height)
    };
  }
  var v1530;
  if (v1527 && v1526) {
    var v1531 = v1521.fontMetrics().bigOpSpacing5 + v1526.elem.height + v1526.elem.depth + v1526.kern + v1518.depth + v1524;
    v1530 = makeVList({
      positionType: "bottom",
      positionData: v1531,
      children: [{
        type: "kern",
        size: v1521.fontMetrics().bigOpSpacing5
      }, {
        type: "elem",
        elem: v1526.elem,
        marginLeft: makeEm(-v1523)
      }, {
        type: "kern",
        size: v1526.kern
      }, {
        type: "elem",
        elem: v1518
      }, {
        type: "kern",
        size: v1527.kern
      }, {
        type: "elem",
        elem: v1527.elem,
        marginLeft: makeEm(v1523)
      }, {
        type: "kern",
        size: v1521.fontMetrics().bigOpSpacing5
      }]
    });
  } else if (v1526) {
    var v1532 = v1518.height - v1524;
    v1530 = makeVList({
      positionType: "top",
      positionData: v1532,
      children: [{
        type: "kern",
        size: v1521.fontMetrics().bigOpSpacing5
      }, {
        type: "elem",
        elem: v1526.elem,
        marginLeft: makeEm(-v1523)
      }, {
        type: "kern",
        size: v1526.kern
      }, {
        type: "elem",
        elem: v1518
      }]
    });
  } else if (v1527) {
    var v1533 = v1518.depth + v1524;
    v1530 = makeVList({
      positionType: "bottom",
      positionData: v1533,
      children: [{
        type: "elem",
        elem: v1518
      }, {
        type: "kern",
        size: v1527.kern
      }, {
        type: "elem",
        elem: v1527.elem,
        marginLeft: makeEm(v1523)
      }, {
        type: "kern",
        size: v1521.fontMetrics().bigOpSpacing5
      }]
    });
  } else {
    return v1518;
  }
  var v1534 = [v1530];
  if (v1526 && v1523 !== 0 && !v1525) {
    var v1535 = makeSpan(["mspace"], [], v1521);
    v1535.style.marginRight = makeEm(v1523);
    v1534.unshift(v1535);
  }
  return makeSpan(["mop", "op-limits"], v1534, v1521);
};
var noSuccessor = new Set(["\\smallint"]);
var htmlBuilder$2 = (v1536, v1537) => {
  var v1538;
  var v1539;
  var v1540 = false;
  var v1541;
  if (v1536.type === "supsub") {
    v1538 = v1536.sup;
    v1539 = v1536.sub;
    v1541 = assertNodeType(v1536.base, "op");
    v1540 = true;
  } else {
    v1541 = assertNodeType(v1536, "op");
  }
  var v1542 = v1537.style;
  var v1543 = false;
  if (v1542.size === Style$1.DISPLAY.size && v1541.symbol && !noSuccessor.has(v1541.name)) {
    v1543 = true;
  }
  var v1544;
  var v1545;
  if (v1541.symbol) {
    var v1546 = v1543 ? "Size2-Regular" : "Size1-Regular";
    var v1547 = "";
    if (v1541.name === "\\oiint" || v1541.name === "\\oiiint") {
      v1547 = v1541.name.slice(1);
      v1541.name = v1547 === "oiint" ? "\\iint" : "\\iiint";
    }
    v1544 = makeSymbol(v1541.name, v1546, "math", v1537, ["mop", "op-symbol", v1543 ? "large-op" : "small-op"]);
    v1545 = v1544.italic;
    if (v1547.length > 0) {
      var v1548 = staticSvg(v1547 + "Size" + (v1543 ? "2" : "1"), v1537);
      v1544 = makeVList({
        positionType: "individualShift",
        children: [{
          type: "elem",
          elem: v1544,
          shift: 0
        }, {
          type: "elem",
          elem: v1548,
          shift: v1543 ? 0.08 : 0
        }]
      });
      v1541.name = "\\" + v1547;
      v1544.classes.unshift("mop");
      v1544.italic = v1545;
    }
  } else if (v1541.body) {
    var v1549 = buildExpression$1(v1541.body, v1537, true);
    if (v1549.length === 1 && v1549[0] instanceof SymbolNode) {
      v1544 = v1549[0];
      v1544.classes[0] = "mop";
    } else {
      v1544 = makeSpan(["mop"], v1549, v1537);
    }
  } else {
    var v1550 = [];
    for (var v1551 = 1; v1551 < v1541.name.length; v1551++) {
      v1550.push(mathsym(v1541.name[v1551], v1541.mode, v1537));
    }
    v1544 = makeSpan(["mop"], v1550, v1537);
  }
  var v1552 = 0;
  var v1553 = 0;
  if ((v1544 instanceof SymbolNode || v1541.name === "\\oiint" || v1541.name === "\\oiiint") && !v1541.suppressBaseShift) {
    v1552 = (v1544.height - v1544.depth) / 2 - v1537.fontMetrics().axisHeight;
    v1553 = v1544.italic ?? 0;
  }
  if (v1540) {
    return assembleSupSub(v1544, v1538, v1539, v1537, v1542, v1553, v1552);
  } else {
    if (v1552) {
      v1544.style.position = "relative";
      v1544.style.top = makeEm(v1552);
    }
    return v1544;
  }
};
var mathmlBuilder$1 = (v1554, v1555) => {
  var v1556;
  if (v1554.symbol) {
    v1556 = new MathNode("mo", [makeText(v1554.name, v1554.mode)]);
    if (noSuccessor.has(v1554.name)) {
      v1556.setAttribute("largeop", "false");
    }
  } else if (v1554.body) {
    v1556 = new MathNode("mo", buildExpression2(v1554.body, v1555));
  } else {
    v1556 = new MathNode("mi", [new TextNode(v1554.name.slice(1))]);
    var v1557 = new MathNode("mo", [makeText("⁡", "text")]);
    if (v1554.parentIsSupSub) {
      v1556 = new MathNode("mrow", [v1556, v1557]);
    } else {
      v1556 = newDocumentFragment([v1556, v1557]);
    }
  }
  return v1556;
};
var singleCharBigOps = {
  "∏": "\\prod",
  "∐": "\\coprod",
  "∑": "\\sum",
  "⋀": "\\bigwedge",
  "⋁": "\\bigvee",
  "⋂": "\\bigcap",
  "⋃": "\\bigcup",
  "⨀": "\\bigodot",
  "⨁": "\\bigoplus",
  "⨂": "\\bigotimes",
  "⨄": "\\biguplus",
  "⨆": "\\bigsqcup"
};
defineFunction({
  type: "op",
  names: ["\\coprod", "\\bigvee", "\\bigwedge", "\\biguplus", "\\bigcap", "\\bigcup", "\\intop", "\\prod", "\\sum", "\\bigotimes", "\\bigoplus", "\\bigodot", "\\bigsqcup", "\\smallint", "∏", "∐", "∑", "⋀", "⋁", "⋂", "⋃", "⨀", "⨁", "⨂", "⨄", "⨆"],
  props: {
    numArgs: 0
  },
  handler: (v1558, v1559) => {
    var {
      parser: v1560,
      funcName: v1561
    } = v1558;
    var v1562 = v1561;
    if (v1562.length === 1) {
      v1562 = singleCharBigOps[v1562];
    }
    return {
      type: "op",
      mode: v1560.mode,
      limits: true,
      parentIsSupSub: false,
      symbol: true,
      name: v1562
    };
  },
  htmlBuilder: htmlBuilder$2,
  mathmlBuilder: mathmlBuilder$1
});
defineFunction({
  type: "op",
  names: ["\\mathop"],
  props: {
    numArgs: 1,
    primitive: true
  },
  handler: (v1563, v1564) => {
    var {
      parser: v1565
    } = v1563;
    var v1566 = v1564[0];
    return {
      type: "op",
      mode: v1565.mode,
      limits: false,
      parentIsSupSub: false,
      symbol: false,
      body: ordargument(v1566)
    };
  },
  htmlBuilder: htmlBuilder$2,
  mathmlBuilder: mathmlBuilder$1
});
var singleCharIntegrals = {
  "∫": "\\int",
  "∬": "\\iint",
  "∭": "\\iiint",
  "∮": "\\oint",
  "∯": "\\oiint",
  "∰": "\\oiiint"
};
defineFunction({
  type: "op",
  names: ["\\arcsin", "\\arccos", "\\arctan", "\\arctg", "\\arcctg", "\\arg", "\\ch", "\\cos", "\\cosec", "\\cosh", "\\cot", "\\cotg", "\\coth", "\\csc", "\\ctg", "\\cth", "\\deg", "\\dim", "\\exp", "\\hom", "\\ker", "\\lg", "\\ln", "\\log", "\\sec", "\\sin", "\\sinh", "\\sh", "\\tan", "\\tanh", "\\tg", "\\th"],
  props: {
    numArgs: 0
  },
  handler(v1567) {
    var {
      parser: v1568,
      funcName: v1569
    } = v1567;
    return {
      type: "op",
      mode: v1568.mode,
      limits: false,
      parentIsSupSub: false,
      symbol: false,
      name: v1569
    };
  },
  htmlBuilder: htmlBuilder$2,
  mathmlBuilder: mathmlBuilder$1
});
defineFunction({
  type: "op",
  names: ["\\det", "\\gcd", "\\inf", "\\lim", "\\max", "\\min", "\\Pr", "\\sup"],
  props: {
    numArgs: 0
  },
  handler(v1570) {
    var {
      parser: v1571,
      funcName: v1572
    } = v1570;
    return {
      type: "op",
      mode: v1571.mode,
      limits: true,
      parentIsSupSub: false,
      symbol: false,
      name: v1572
    };
  },
  htmlBuilder: htmlBuilder$2,
  mathmlBuilder: mathmlBuilder$1
});
defineFunction({
  type: "op",
  names: ["\\int", "\\iint", "\\iiint", "\\oint", "\\oiint", "\\oiiint", "∫", "∬", "∭", "∮", "∯", "∰"],
  props: {
    numArgs: 0,
    allowedInArgument: true
  },
  handler(v1573) {
    var {
      parser: v1574,
      funcName: v1575
    } = v1573;
    var v1576 = v1575;
    if (v1576.length === 1) {
      v1576 = singleCharIntegrals[v1576];
    }
    return {
      type: "op",
      mode: v1574.mode,
      limits: false,
      parentIsSupSub: false,
      symbol: true,
      name: v1576
    };
  },
  htmlBuilder: htmlBuilder$2,
  mathmlBuilder: mathmlBuilder$1
});
var htmlBuilder$1 = (v1577, v1578) => {
  var v1579;
  var v1580;
  var v1581 = false;
  var v1582;
  if (v1577.type === "supsub") {
    v1579 = v1577.sup;
    v1580 = v1577.sub;
    v1582 = assertNodeType(v1577.base, "operatorname");
    v1581 = true;
  } else {
    v1582 = assertNodeType(v1577, "operatorname");
  }
  var v1583;
  if (v1582.body.length > 0) {
    var v1584 = v1582.body.map(v1585 => {
      var v1586 = "text" in v1585 ? v1585.text : undefined;
      if (typeof v1586 === "string") {
        return {
          type: "textord",
          mode: v1585.mode,
          text: v1586
        };
      } else {
        return v1585;
      }
    });
    var v1587 = buildExpression$1(v1584, v1578.withFont("mathrm"), true);
    for (var v1588 = 0; v1588 < v1587.length; v1588++) {
      var v1589 = v1587[v1588];
      if (v1589 instanceof SymbolNode) {
        v1589.text = v1589.text.replace(/\u2212/, "-").replace(/\u2217/, "*");
      }
    }
    v1583 = makeSpan(["mop"], v1587, v1578);
  } else {
    v1583 = makeSpan(["mop"], [], v1578);
  }
  if (v1581) {
    return assembleSupSub(v1583, v1579, v1580, v1578, v1578.style, 0, 0);
  } else {
    return v1583;
  }
};
var mathmlBuilder2 = (v1590, v1591) => {
  var v1592 = buildExpression2(v1590.body, v1591.withFont("mathrm"));
  var v1593 = true;
  for (var v1594 = 0; v1594 < v1592.length; v1594++) {
    var v1595 = v1592[v1594];
    if (v1595 instanceof SpaceNode) ;else if (v1595 instanceof MathNode) {
      switch (v1595.type) {
        case "mi":
        case "mn":
        case "mspace":
        case "mtext":
          break;
        case "mo":
          {
            var v1596 = v1595.children[0];
            if (v1595.children.length === 1 && v1596 instanceof TextNode) {
              v1596.text = v1596.text.replace(/\u2212/, "-").replace(/\u2217/, "*");
            } else {
              v1593 = false;
            }
            break;
          }
        default:
          v1593 = false;
      }
    } else {
      v1593 = false;
    }
  }
  if (v1593) {
    var v1597 = v1592.map(v1598 => v1598.toText()).join("");
    v1592 = [new TextNode(v1597)];
  }
  var v1599 = new MathNode("mi", v1592);
  v1599.setAttribute("mathvariant", "normal");
  var v1600 = new MathNode("mo", [makeText("⁡", "text")]);
  if (v1590.parentIsSupSub) {
    return new MathNode("mrow", [v1599, v1600]);
  } else {
    return newDocumentFragment([v1599, v1600]);
  }
};
defineFunction({
  type: "operatorname",
  names: ["\\operatorname@", "\\operatornamewithlimits"],
  props: {
    numArgs: 1
  },
  handler: (v1601, v1602) => {
    var {
      parser: v1603,
      funcName: v1604
    } = v1601;
    var v1605 = v1602[0];
    return {
      type: "operatorname",
      mode: v1603.mode,
      body: ordargument(v1605),
      alwaysHandleSupSub: v1604 === "\\operatornamewithlimits",
      limits: false,
      parentIsSupSub: false
    };
  },
  htmlBuilder: htmlBuilder$1,
  mathmlBuilder: mathmlBuilder2
});
defineMacro("\\operatorname", "\\@ifstar\\operatornamewithlimits\\operatorname@");
defineFunctionBuilders({
  type: "ordgroup",
  htmlBuilder(v1606, v1607) {
    if (v1606.semisimple) {
      return makeFragment(buildExpression$1(v1606.body, v1607, false));
    }
    return makeSpan(["mord"], buildExpression$1(v1606.body, v1607, true), v1607);
  },
  mathmlBuilder(v1608, v1609) {
    return buildExpressionRow(v1608.body, v1609, true);
  }
});
defineFunction({
  type: "overline",
  names: ["\\overline"],
  props: {
    numArgs: 1
  },
  handler(v1610, v1611) {
    var {
      parser: v1612
    } = v1610;
    var v1613 = v1611[0];
    return {
      type: "overline",
      mode: v1612.mode,
      body: v1613
    };
  },
  htmlBuilder(v1614, v1615) {
    var v1616 = buildGroup$1(v1614.body, v1615.havingCrampedStyle());
    var v1617 = makeLineSpan("overline-line", v1615);
    var v1618 = v1615.fontMetrics().defaultRuleThickness;
    var v1619 = makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: v1616
      }, {
        type: "kern",
        size: v1618 * 3
      }, {
        type: "elem",
        elem: v1617
      }, {
        type: "kern",
        size: v1618
      }]
    });
    return makeSpan(["mord", "overline"], [v1619], v1615);
  },
  mathmlBuilder(v1620, v1621) {
    var v1622 = new MathNode("mo", [new TextNode("‾")]);
    v1622.setAttribute("stretchy", "true");
    var v1623 = new MathNode("mover", [buildGroup2(v1620.body, v1621), v1622]);
    v1623.setAttribute("accent", "true");
    return v1623;
  }
});
defineFunction({
  type: "phantom",
  names: ["\\phantom"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler: (v1624, v1625) => {
    var {
      parser: v1626
    } = v1624;
    var v1627 = v1625[0];
    return {
      type: "phantom",
      mode: v1626.mode,
      body: ordargument(v1627)
    };
  },
  htmlBuilder: (v1628, v1629) => {
    var v1630 = buildExpression$1(v1628.body, v1629.withPhantom(), false);
    return makeFragment(v1630);
  },
  mathmlBuilder: (v1631, v1632) => {
    var v1633 = buildExpression2(v1631.body, v1632);
    return new MathNode("mphantom", v1633);
  }
});
defineMacro("\\hphantom", "\\smash{\\phantom{#1}}");
defineFunction({
  type: "vphantom",
  names: ["\\vphantom"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler: (v1634, v1635) => {
    var {
      parser: v1636
    } = v1634;
    var v1637 = v1635[0];
    return {
      type: "vphantom",
      mode: v1636.mode,
      body: v1637
    };
  },
  htmlBuilder: (v1638, v1639) => {
    var v1640 = makeSpan(["inner"], [buildGroup$1(v1638.body, v1639.withPhantom())]);
    var v1641 = makeSpan(["fix"], []);
    return makeSpan(["mord", "rlap"], [v1640, v1641], v1639);
  },
  mathmlBuilder: (v1642, v1643) => {
    var v1644 = buildExpression2(ordargument(v1642.body), v1643);
    var v1645 = new MathNode("mphantom", v1644);
    var v1646 = new MathNode("mpadded", [v1645]);
    v1646.setAttribute("width", "0px");
    return v1646;
  }
});
defineFunction({
  type: "raisebox",
  names: ["\\raisebox"],
  props: {
    numArgs: 2,
    argTypes: ["size", "hbox"],
    allowedInText: true
  },
  handler(v1647, v1648) {
    var {
      parser: v1649
    } = v1647;
    var v1650 = assertNodeType(v1648[0], "size").value;
    var v1651 = v1648[1];
    return {
      type: "raisebox",
      mode: v1649.mode,
      dy: v1650,
      body: v1651
    };
  },
  htmlBuilder(v1652, v1653) {
    var v1654 = buildGroup$1(v1652.body, v1653);
    var v1655 = calculateSize(v1652.dy, v1653);
    return makeVList({
      positionType: "shift",
      positionData: -v1655,
      children: [{
        type: "elem",
        elem: v1654
      }]
    });
  },
  mathmlBuilder(v1656, v1657) {
    var v1658 = new MathNode("mpadded", [buildGroup2(v1656.body, v1657)]);
    var v1659 = v1656.dy.number + v1656.dy.unit;
    v1658.setAttribute("voffset", v1659);
    return v1658;
  }
});
defineFunction({
  type: "internal",
  names: ["\\relax"],
  props: {
    numArgs: 0,
    allowedInText: true,
    allowedInArgument: true
  },
  handler(v1660) {
    var {
      parser: v1661
    } = v1660;
    return {
      type: "internal",
      mode: v1661.mode
    };
  }
});
defineFunction({
  type: "rule",
  names: ["\\rule"],
  props: {
    numArgs: 2,
    numOptionalArgs: 1,
    allowedInText: true,
    allowedInMath: true,
    argTypes: ["size", "size", "size"]
  },
  handler(v1662, v1663, v1664) {
    var {
      parser: v1665
    } = v1662;
    var v1666 = v1664[0];
    var v1667 = assertNodeType(v1663[0], "size");
    var v1668 = assertNodeType(v1663[1], "size");
    return {
      type: "rule",
      mode: v1665.mode,
      shift: v1666 && assertNodeType(v1666, "size").value,
      width: v1667.value,
      height: v1668.value
    };
  },
  htmlBuilder(v1669, v1670) {
    var v1671 = makeSpan(["mord", "rule"], [], v1670);
    var v1672 = calculateSize(v1669.width, v1670);
    var v1673 = calculateSize(v1669.height, v1670);
    var v1674 = v1669.shift ? calculateSize(v1669.shift, v1670) : 0;
    v1671.style.borderRightWidth = makeEm(v1672);
    v1671.style.borderTopWidth = makeEm(v1673);
    v1671.style.bottom = makeEm(v1674);
    v1671.width = v1672;
    v1671.height = v1673 + v1674;
    v1671.depth = -v1674;
    v1671.maxFontSize = v1673 * 1.125 * v1670.sizeMultiplier;
    return v1671;
  },
  mathmlBuilder(v1675, v1676) {
    var v1677 = calculateSize(v1675.width, v1676);
    var v1678 = calculateSize(v1675.height, v1676);
    var v1679 = v1675.shift ? calculateSize(v1675.shift, v1676) : 0;
    var v1680 = v1676.color && v1676.getColor() || "black";
    var v1681 = new MathNode("mspace");
    v1681.setAttribute("mathbackground", v1680);
    v1681.setAttribute("width", makeEm(v1677));
    v1681.setAttribute("height", makeEm(v1678));
    var v1682 = new MathNode("mpadded", [v1681]);
    if (v1679 >= 0) {
      v1682.setAttribute("height", makeEm(v1679));
    } else {
      v1682.setAttribute("height", makeEm(v1679));
      v1682.setAttribute("depth", makeEm(-v1679));
    }
    v1682.setAttribute("voffset", makeEm(v1679));
    return v1682;
  }
});
function sizingGroup(v1683, v1684, v1685) {
  var v1686 = buildExpression$1(v1683, v1684, false);
  var v1687 = v1684.sizeMultiplier / v1685.sizeMultiplier;
  for (var v1688 = 0; v1688 < v1686.length; v1688++) {
    var v1689 = v1686[v1688].classes.indexOf("sizing");
    if (v1689 < 0) {
      Array.prototype.push.apply(v1686[v1688].classes, v1684.sizingClasses(v1685));
    } else if (v1686[v1688].classes[v1689 + 1] === "reset-size" + v1684.size) {
      v1686[v1688].classes[v1689 + 1] = "reset-size" + v1685.size;
    }
    v1686[v1688].height *= v1687;
    v1686[v1688].depth *= v1687;
  }
  return makeFragment(v1686);
}
var sizeFuncs = ["\\tiny", "\\sixptsize", "\\scriptsize", "\\footnotesize", "\\small", "\\normalsize", "\\large", "\\Large", "\\LARGE", "\\huge", "\\Huge"];
var htmlBuilder2 = (v1690, v1691) => {
  var v1692 = v1691.havingSize(v1690.size);
  return sizingGroup(v1690.body, v1692, v1691);
};
defineFunction({
  type: "sizing",
  names: sizeFuncs,
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler: (v1693, v1694) => {
    var {
      breakOnTokenText: v1695,
      funcName: v1696,
      parser: v1697
    } = v1693;
    var v1698 = v1697.parseExpression(false, v1695);
    return {
      type: "sizing",
      mode: v1697.mode,
      size: sizeFuncs.indexOf(v1696) + 1,
      body: v1698
    };
  },
  htmlBuilder: htmlBuilder2,
  mathmlBuilder: (v1699, v1700) => {
    var v1701 = v1700.havingSize(v1699.size);
    var v1702 = buildExpression2(v1699.body, v1701);
    var v1703 = new MathNode("mstyle", v1702);
    v1703.setAttribute("mathsize", makeEm(v1701.sizeMultiplier));
    return v1703;
  }
});
defineFunction({
  type: "smash",
  names: ["\\smash"],
  props: {
    numArgs: 1,
    numOptionalArgs: 1,
    allowedInText: true
  },
  handler: (v1704, v1705, v1706) => {
    var {
      parser: v1707
    } = v1704;
    var v1708 = false;
    var v1709 = false;
    var v1710 = v1706[0] && assertNodeType(v1706[0], "ordgroup");
    if (v1710) {
      var v1711;
      for (var v1712 = 0; v1712 < v1710.body.length; ++v1712) {
        var v1713 = v1710.body[v1712];
        v1711 = assertSymbolNodeType(v1713).text;
        if (v1711 === "t") {
          v1708 = true;
        } else if (v1711 === "b") {
          v1709 = true;
        } else {
          v1708 = false;
          v1709 = false;
          break;
        }
      }
    } else {
      v1708 = true;
      v1709 = true;
    }
    var v1714 = v1705[0];
    return {
      type: "smash",
      mode: v1707.mode,
      body: v1714,
      smashHeight: v1708,
      smashDepth: v1709
    };
  },
  htmlBuilder: (v1715, v1716) => {
    var v1717 = makeSpan([], [buildGroup$1(v1715.body, v1716)]);
    if (!v1715.smashHeight && !v1715.smashDepth) {
      return v1717;
    }
    if (v1715.smashHeight) {
      v1717.height = 0;
    }
    if (v1715.smashDepth) {
      v1717.depth = 0;
    }
    if (v1715.smashHeight && v1715.smashDepth) {
      return makeSpan(["mord", "smash"], [v1717], v1716);
    }
    if (v1717.children) {
      for (var v1718 = 0; v1718 < v1717.children.length; v1718++) {
        if (v1715.smashHeight) {
          v1717.children[v1718].height = 0;
        }
        if (v1715.smashDepth) {
          v1717.children[v1718].depth = 0;
        }
      }
    }
    var v1719 = makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: v1717
      }]
    });
    return makeSpan(["mord"], [v1719], v1716);
  },
  mathmlBuilder: (v1720, v1721) => {
    var v1722 = new MathNode("mpadded", [buildGroup2(v1720.body, v1721)]);
    if (v1720.smashHeight) {
      v1722.setAttribute("height", "0px");
    }
    if (v1720.smashDepth) {
      v1722.setAttribute("depth", "0px");
    }
    return v1722;
  }
});
defineFunction({
  type: "sqrt",
  names: ["\\sqrt"],
  props: {
    numArgs: 1,
    numOptionalArgs: 1
  },
  handler(v1723, v1724, v1725) {
    var {
      parser: v1726
    } = v1723;
    var v1727 = v1725[0];
    var v1728 = v1724[0];
    return {
      type: "sqrt",
      mode: v1726.mode,
      body: v1728,
      index: v1727
    };
  },
  htmlBuilder(v1729, v1730) {
    var v1731 = buildGroup$1(v1729.body, v1730.havingCrampedStyle());
    if (v1731.height === 0) {
      v1731.height = v1730.fontMetrics().xHeight;
    }
    v1731 = wrapFragment(v1731, v1730);
    var v1732 = v1730.fontMetrics();
    var v1733 = v1732.defaultRuleThickness;
    var v1734 = v1733;
    if (v1730.style.id < Style$1.TEXT.id) {
      v1734 = v1730.fontMetrics().xHeight;
    }
    var v1735 = v1733 + v1734 / 4;
    var v1736 = v1731.height + v1731.depth + v1735 + v1733;
    var {
      span: v1737,
      ruleWidth: v1738,
      advanceWidth: v1739
    } = makeSqrtImage(v1736, v1730);
    var v1740 = v1737.height - v1738;
    if (v1740 > v1731.height + v1731.depth + v1735) {
      v1735 = (v1735 + v1740 - v1731.height - v1731.depth) / 2;
    }
    var v1741 = v1737.height - v1731.height - v1735 - v1738;
    v1731.style.paddingLeft = makeEm(v1739);
    var v1742 = makeVList({
      positionType: "firstBaseline",
      children: [{
        type: "elem",
        elem: v1731,
        wrapperClasses: ["svg-align"]
      }, {
        type: "kern",
        size: -(v1731.height + v1741)
      }, {
        type: "elem",
        elem: v1737
      }, {
        type: "kern",
        size: v1738
      }]
    });
    if (!v1729.index) {
      return makeSpan(["mord", "sqrt"], [v1742], v1730);
    } else {
      var v1743 = v1730.havingStyle(Style$1.SCRIPTSCRIPT);
      var v1744 = buildGroup$1(v1729.index, v1743, v1730);
      var v1745 = (v1742.height - v1742.depth) * 0.6;
      var v1746 = makeVList({
        positionType: "shift",
        positionData: -v1745,
        children: [{
          type: "elem",
          elem: v1744
        }]
      });
      var v1747 = makeSpan(["root"], [v1746]);
      return makeSpan(["mord", "sqrt"], [v1747, v1742], v1730);
    }
  },
  mathmlBuilder(v1748, v1749) {
    var {
      body: v1750,
      index: v1751
    } = v1748;
    if (v1751) {
      return new MathNode("mroot", [buildGroup2(v1750, v1749), buildGroup2(v1751, v1749)]);
    } else {
      return new MathNode("msqrt", [buildGroup2(v1750, v1749)]);
    }
  }
});
var styleMap = {
  display: Style$1.DISPLAY,
  text: Style$1.TEXT,
  script: Style$1.SCRIPT,
  scriptscript: Style$1.SCRIPTSCRIPT
};
function isStyleStr(v1752) {
  return v1752 in styleMap;
}
defineFunction({
  type: "styling",
  names: ["\\displaystyle", "\\textstyle", "\\scriptstyle", "\\scriptscriptstyle"],
  props: {
    numArgs: 0,
    allowedInText: true,
    primitive: true
  },
  handler(v1753, v1754) {
    var {
      breakOnTokenText: v1755,
      funcName: v1756,
      parser: v1757
    } = v1753;
    var v1758 = v1757.parseExpression(true, v1755);
    var v1759 = v1756.slice(1, v1756.length - 5);
    if (!isStyleStr(v1759)) {
      throw new Error("Unknown style: " + v1759);
    }
    return {
      type: "styling",
      mode: v1757.mode,
      style: v1759,
      body: v1758
    };
  },
  htmlBuilder(v1760, v1761) {
    var v1762 = styleMap[v1760.style];
    var v1763 = v1761.havingStyle(v1762);
    if (v1760.resetFont) {
      v1763 = v1763.withFont("");
    }
    return sizingGroup(v1760.body, v1763, v1761);
  },
  mathmlBuilder(v1764, v1765) {
    var v1766 = styleMap[v1764.style];
    var v1767 = v1765.havingStyle(v1766);
    if (v1764.resetFont) {
      v1767 = v1767.withFont("");
    }
    var v1768 = buildExpression2(v1764.body, v1767);
    var v1769 = new MathNode("mstyle", v1768);
    var v1770 = {
      display: ["0", "true"],
      text: ["0", "false"],
      script: ["1", "false"],
      scriptscript: ["2", "false"]
    };
    var v1771 = v1770[v1764.style];
    v1769.setAttribute("scriptlevel", v1771[0]);
    v1769.setAttribute("displaystyle", v1771[1]);
    return v1769;
  }
});
var htmlBuilderDelegate = function htmlBuilderDelegate2(v1772, v1773) {
  var v1774 = v1772.base;
  if (!v1774) {
    return null;
  } else if (v1774.type === "op") {
    var v1775 = v1774.limits && (v1773.style.size === Style$1.DISPLAY.size || v1774.alwaysHandleSupSub);
    if (v1775) {
      return htmlBuilder$2;
    } else {
      return null;
    }
  } else if (v1774.type === "operatorname") {
    var v1776 = v1774.alwaysHandleSupSub && (v1773.style.size === Style$1.DISPLAY.size || v1774.limits);
    if (v1776) {
      return htmlBuilder$1;
    } else {
      return null;
    }
  } else if (v1774.type === "accent") {
    if (isCharacterBox(v1774.base)) {
      return htmlBuilder$a;
    } else {
      return null;
    }
  } else if (v1774.type === "horizBrace") {
    var v1777 = !v1772.sub;
    if (v1777 === v1774.isOver) {
      return htmlBuilder$3;
    } else {
      return null;
    }
  } else {
    return null;
  }
};
defineFunctionBuilders({
  type: "supsub",
  htmlBuilder(v1778, v1779) {
    var v1780 = htmlBuilderDelegate(v1778, v1779);
    if (v1780) {
      return v1780(v1778, v1779);
    }
    var {
      base: v1781,
      sup: v1782,
      sub: v1783
    } = v1778;
    var v1784 = buildGroup$1(v1781, v1779);
    var v1785;
    var v1786;
    var v1787 = v1779.fontMetrics();
    var v1788 = 0;
    var v1789 = 0;
    var v1790 = v1781 && isCharacterBox(v1781);
    if (v1782) {
      var v1791 = v1779.havingStyle(v1779.style.sup());
      v1785 = buildGroup$1(v1782, v1791, v1779);
      if (!v1790) {
        v1788 = v1784.height - v1791.fontMetrics().supDrop * v1791.sizeMultiplier / v1779.sizeMultiplier;
      }
    }
    if (v1783) {
      var v1792 = v1779.havingStyle(v1779.style.sub());
      v1786 = buildGroup$1(v1783, v1792, v1779);
      if (!v1790) {
        v1789 = v1784.depth + v1792.fontMetrics().subDrop * v1792.sizeMultiplier / v1779.sizeMultiplier;
      }
    }
    var v1793;
    if (v1779.style === Style$1.DISPLAY) {
      v1793 = v1787.sup1;
    } else if (v1779.style.cramped) {
      v1793 = v1787.sup3;
    } else {
      v1793 = v1787.sup2;
    }
    var v1794 = v1779.sizeMultiplier;
    var v1795 = makeEm(0.5 / v1787.ptPerEm / v1794);
    var v1796 = null;
    if (v1786) {
      var v1797 = v1778.base && v1778.base.type === "op" && v1778.base.name && (v1778.base.name === "\\oiint" || v1778.base.name === "\\oiiint");
      if (v1784 instanceof SymbolNode || v1797) {
        v1796 = makeEm(-(v1784.italic ?? 0));
      }
    }
    var v1798;
    if (v1785 && v1786) {
      v1788 = Math.max(v1788, v1793, v1785.depth + v1787.xHeight * 0.25);
      v1789 = Math.max(v1789, v1787.sub2);
      var v1799 = v1787.defaultRuleThickness;
      var v1800 = v1799 * 4;
      if (v1788 - v1785.depth - (v1786.height - v1789) < v1800) {
        v1789 = v1800 - (v1788 - v1785.depth) + v1786.height;
        var v1801 = v1787.xHeight * 0.8 - (v1788 - v1785.depth);
        if (v1801 > 0) {
          v1788 += v1801;
          v1789 -= v1801;
        }
      }
      var v1802 = [{
        type: "elem",
        elem: v1786,
        shift: v1789,
        marginRight: v1795,
        marginLeft: v1796
      }, {
        type: "elem",
        elem: v1785,
        shift: -v1788,
        marginRight: v1795
      }];
      v1798 = makeVList({
        positionType: "individualShift",
        children: v1802
      });
    } else if (v1786) {
      v1789 = Math.max(v1789, v1787.sub1, v1786.height - v1787.xHeight * 0.8);
      var v1803 = [{
        type: "elem",
        elem: v1786,
        marginLeft: v1796,
        marginRight: v1795
      }];
      v1798 = makeVList({
        positionType: "shift",
        positionData: v1789,
        children: v1803
      });
    } else if (v1785) {
      v1788 = Math.max(v1788, v1793, v1785.depth + v1787.xHeight * 0.25);
      v1798 = makeVList({
        positionType: "shift",
        positionData: -v1788,
        children: [{
          type: "elem",
          elem: v1785,
          marginRight: v1795
        }]
      });
    } else {
      throw new Error("supsub must have either sup or sub.");
    }
    var v1804 = getTypeOfDomTree(v1784, "right") || "mord";
    return makeSpan([v1804], [v1784, makeSpan(["msupsub"], [v1798])], v1779);
  },
  mathmlBuilder(v1805, v1806) {
    var v1807 = false;
    var v1808;
    var v1809;
    if (v1805.base && v1805.base.type === "horizBrace") {
      v1809 = !!v1805.sup;
      if (v1809 === v1805.base.isOver) {
        v1807 = true;
        v1808 = v1805.base.isOver;
      }
    }
    if (v1805.base && (v1805.base.type === "op" || v1805.base.type === "operatorname")) {
      v1805.base.parentIsSupSub = true;
    }
    var v1810 = [buildGroup2(v1805.base, v1806)];
    if (v1805.sub) {
      v1810.push(buildGroup2(v1805.sub, v1806));
    }
    if (v1805.sup) {
      v1810.push(buildGroup2(v1805.sup, v1806));
    }
    var v1811;
    if (v1807) {
      v1811 = v1808 ? "mover" : "munder";
    } else if (!v1805.sub) {
      var v1812 = v1805.base;
      if (v1812 && v1812.type === "op" && v1812.limits && (v1806.style === Style$1.DISPLAY || v1812.alwaysHandleSupSub)) {
        v1811 = "mover";
      } else if (v1812 && v1812.type === "operatorname" && v1812.alwaysHandleSupSub && (v1812.limits || v1806.style === Style$1.DISPLAY)) {
        v1811 = "mover";
      } else {
        v1811 = "msup";
      }
    } else if (!v1805.sup) {
      var v1813 = v1805.base;
      if (v1813 && v1813.type === "op" && v1813.limits && (v1806.style === Style$1.DISPLAY || v1813.alwaysHandleSupSub)) {
        v1811 = "munder";
      } else if (v1813 && v1813.type === "operatorname" && v1813.alwaysHandleSupSub && (v1813.limits || v1806.style === Style$1.DISPLAY)) {
        v1811 = "munder";
      } else {
        v1811 = "msub";
      }
    } else {
      var v1814 = v1805.base;
      if (v1814 && v1814.type === "op" && v1814.limits && v1806.style === Style$1.DISPLAY) {
        v1811 = "munderover";
      } else if (v1814 && v1814.type === "operatorname" && v1814.alwaysHandleSupSub && (v1806.style === Style$1.DISPLAY || v1814.limits)) {
        v1811 = "munderover";
      } else {
        v1811 = "msubsup";
      }
    }
    return new MathNode(v1811, v1810);
  }
});
defineFunctionBuilders({
  type: "atom",
  htmlBuilder(v1815, v1816) {
    return mathsym(v1815.text, v1815.mode, v1816, ["m" + v1815.family]);
  },
  mathmlBuilder(v1817, v1818) {
    var v1819 = new MathNode("mo", [makeText(v1817.text, v1817.mode)]);
    if (v1817.family === "bin") {
      var v1820 = getVariant(v1817, v1818);
      if (v1820 === "bold-italic") {
        v1819.setAttribute("mathvariant", v1820);
      }
    } else if (v1817.family === "punct") {
      v1819.setAttribute("separator", "true");
    } else if (v1817.family === "open" || v1817.family === "close") {
      v1819.setAttribute("stretchy", "false");
    }
    return v1819;
  }
});
var defaultVariant = {
  mi: "italic",
  mn: "normal",
  mtext: "normal"
};
defineFunctionBuilders({
  type: "mathord",
  htmlBuilder(v1821, v1822) {
    return makeOrd(v1821, v1822, "mathord");
  },
  mathmlBuilder(v1823, v1824) {
    var v1825 = new MathNode("mi", [makeText(v1823.text, v1823.mode, v1824)]);
    var v1826 = getVariant(v1823, v1824) || "italic";
    if (v1826 !== defaultVariant[v1825.type]) {
      v1825.setAttribute("mathvariant", v1826);
    }
    return v1825;
  }
});
defineFunctionBuilders({
  type: "textord",
  htmlBuilder(v1827, v1828) {
    return makeOrd(v1827, v1828, "textord");
  },
  mathmlBuilder(v1829, v1830) {
    var v1831 = makeText(v1829.text, v1829.mode, v1830);
    var v1832 = getVariant(v1829, v1830) || "normal";
    var v1833;
    if (v1829.mode === "text") {
      v1833 = new MathNode("mtext", [v1831]);
    } else if (/[0-9]/.test(v1829.text)) {
      v1833 = new MathNode("mn", [v1831]);
    } else if (v1829.text === "\\prime") {
      v1833 = new MathNode("mo", [v1831]);
    } else {
      v1833 = new MathNode("mi", [v1831]);
    }
    if (v1832 !== defaultVariant[v1833.type]) {
      v1833.setAttribute("mathvariant", v1832);
    }
    return v1833;
  }
});
var cssSpace = {
  "\\nobreak": "nobreak",
  "\\allowbreak": "allowbreak"
};
var regularSpace = {
  " ": {},
  "\\ ": {},
  "~": {
    className: "nobreak"
  },
  "\\space": {},
  "\\nobreakspace": {
    className: "nobreak"
  }
};
defineFunctionBuilders({
  type: "spacing",
  htmlBuilder(v1834, v1835) {
    if (regularSpace.hasOwnProperty(v1834.text)) {
      var v1836 = regularSpace[v1834.text].className || "";
      if (v1834.mode === "text") {
        var v1837 = makeOrd(v1834, v1835, "textord");
        v1837.classes.push(v1836);
        return v1837;
      } else {
        return makeSpan(["mspace", v1836], [mathsym(v1834.text, v1834.mode, v1835)], v1835);
      }
    } else if (cssSpace.hasOwnProperty(v1834.text)) {
      return makeSpan(["mspace", cssSpace[v1834.text]], [], v1835);
    } else {
      throw new ParseError("Unknown type of space \"" + v1834.text + "\"");
    }
  },
  mathmlBuilder(v1838, v1839) {
    var v1840;
    if (regularSpace.hasOwnProperty(v1838.text)) {
      v1840 = new MathNode("mtext", [new TextNode("\xA0")]);
    } else if (cssSpace.hasOwnProperty(v1838.text)) {
      return new MathNode("mspace");
    } else {
      throw new ParseError("Unknown type of space \"" + v1838.text + "\"");
    }
    return v1840;
  }
});
var pad = () => {
  var v1841 = new MathNode("mtd", []);
  v1841.setAttribute("width", "50%");
  return v1841;
};
defineFunctionBuilders({
  type: "tag",
  mathmlBuilder(v1842, v1843) {
    var v1844 = new MathNode("mtable", [new MathNode("mtr", [pad(), new MathNode("mtd", [buildExpressionRow(v1842.body, v1843)]), pad(), new MathNode("mtd", [buildExpressionRow(v1842.tag, v1843)])])]);
    v1844.setAttribute("width", "100%");
    return v1844;
  }
});
var textFontFamilies = {
  "\\text": undefined,
  "\\textrm": "textrm",
  "\\textsf": "textsf",
  "\\texttt": "texttt",
  "\\textnormal": "textrm"
};
var textFontWeights = {
  "\\textbf": "textbf",
  "\\textmd": "textmd"
};
var textFontShapes = {
  "\\textit": "textit",
  "\\textup": "textup"
};
var optionsWithFont = (v1845, v1846) => {
  var v1847 = v1845.font;
  if (!v1847) {
    return v1846;
  } else if (textFontFamilies[v1847]) {
    return v1846.withTextFontFamily(textFontFamilies[v1847]);
  } else if (textFontWeights[v1847]) {
    return v1846.withTextFontWeight(textFontWeights[v1847]);
  } else if (v1847 === "\\emph") {
    if (v1846.fontShape === "textit") {
      return v1846.withTextFontShape("textup");
    } else {
      return v1846.withTextFontShape("textit");
    }
  }
  return v1846.withTextFontShape(textFontShapes[v1847]);
};
defineFunction({
  type: "text",
  names: ["\\text", "\\textrm", "\\textsf", "\\texttt", "\\textnormal", "\\textbf", "\\textmd", "\\textit", "\\textup", "\\emph"],
  props: {
    numArgs: 1,
    argTypes: ["text"],
    allowedInArgument: true,
    allowedInText: true
  },
  handler(v1848, v1849) {
    var {
      parser: v1850,
      funcName: v1851
    } = v1848;
    var v1852 = v1849[0];
    return {
      type: "text",
      mode: v1850.mode,
      body: ordargument(v1852),
      font: v1851
    };
  },
  htmlBuilder(v1853, v1854) {
    var v1855 = optionsWithFont(v1853, v1854);
    var v1856 = buildExpression$1(v1853.body, v1855, true);
    return makeSpan(["mord", "text"], v1856, v1855);
  },
  mathmlBuilder(v1857, v1858) {
    var v1859 = optionsWithFont(v1857, v1858);
    return buildExpressionRow(v1857.body, v1859);
  }
});
defineFunction({
  type: "underline",
  names: ["\\underline"],
  props: {
    numArgs: 1,
    allowedInText: true
  },
  handler(v1860, v1861) {
    var {
      parser: v1862
    } = v1860;
    return {
      type: "underline",
      mode: v1862.mode,
      body: v1861[0]
    };
  },
  htmlBuilder(v1863, v1864) {
    var v1865 = buildGroup$1(v1863.body, v1864);
    var v1866 = makeLineSpan("underline-line", v1864);
    var v1867 = v1864.fontMetrics().defaultRuleThickness;
    var v1868 = makeVList({
      positionType: "top",
      positionData: v1865.height,
      children: [{
        type: "kern",
        size: v1867
      }, {
        type: "elem",
        elem: v1866
      }, {
        type: "kern",
        size: v1867 * 3
      }, {
        type: "elem",
        elem: v1865
      }]
    });
    return makeSpan(["mord", "underline"], [v1868], v1864);
  },
  mathmlBuilder(v1869, v1870) {
    var v1871 = new MathNode("mo", [new TextNode("‾")]);
    v1871.setAttribute("stretchy", "true");
    var v1872 = new MathNode("munder", [buildGroup2(v1869.body, v1870), v1871]);
    v1872.setAttribute("accentunder", "true");
    return v1872;
  }
});
defineFunction({
  type: "vcenter",
  names: ["\\vcenter"],
  props: {
    numArgs: 1,
    argTypes: ["original"],
    allowedInText: false
  },
  handler(v1873, v1874) {
    var {
      parser: v1875
    } = v1873;
    return {
      type: "vcenter",
      mode: v1875.mode,
      body: v1874[0]
    };
  },
  htmlBuilder(v1876, v1877) {
    var v1878 = buildGroup$1(v1876.body, v1877);
    var v1879 = v1877.fontMetrics().axisHeight;
    var v1880 = (v1878.height - v1879 - (v1878.depth + v1879)) * 0.5;
    return makeVList({
      positionType: "shift",
      positionData: v1880,
      children: [{
        type: "elem",
        elem: v1878
      }]
    });
  },
  mathmlBuilder(v1881, v1882) {
    var v1883 = new MathNode("mpadded", [buildGroup2(v1881.body, v1882)], ["vcenter"]);
    return new MathNode("mrow", [v1883]);
  }
});
defineFunction({
  type: "verb",
  names: ["\\verb"],
  props: {
    numArgs: 0,
    allowedInText: true
  },
  handler(v1884, v1885, v1886) {
    throw new ParseError("\\verb ended by end of line instead of matching delimiter");
  },
  htmlBuilder(v1887, v1888) {
    var v1889 = makeVerb(v1887);
    var v1890 = [];
    var v1891 = v1888.havingStyle(v1888.style.text());
    for (var v1892 = 0; v1892 < v1889.length; v1892++) {
      var v1893 = v1889[v1892];
      if (v1893 === "~") {
        v1893 = "\\textasciitilde";
      }
      v1890.push(makeSymbol(v1893, "Typewriter-Regular", v1887.mode, v1891, ["mord", "texttt"]));
    }
    return makeSpan(["mord", "text"].concat(v1891.sizingClasses(v1888)), tryCombineChars(v1890), v1891);
  },
  mathmlBuilder(v1894, v1895) {
    var v1896 = new TextNode(makeVerb(v1894));
    var v1897 = new MathNode("mtext", [v1896]);
    v1897.setAttribute("mathvariant", "monospace");
    return v1897;
  }
});
var makeVerb = v1898 => v1898.body.replace(/ /g, v1898.star ? "␣" : "\xA0");
var functions = _functions;
var spaceRegexString = "[ \r\n\t]";
var controlWordRegexString = "\\\\[a-zA-Z@]+";
var controlSymbolRegexString = "\\\\[^\uD800-\uDFFF]";
var controlWordWhitespaceRegexString = "(" + controlWordRegexString + ")" + spaceRegexString + "*";
var controlSpaceRegexString = "\\\\(\n|[ \r\t]+\n?)[ \r\t]*";
var combiningDiacriticalMarkString = "[̀-ͯ]";
var combiningDiacriticalMarksEndRegex = new RegExp(combiningDiacriticalMarkString + "+$");
var tokenRegexString = "(" + spaceRegexString + "+)|" + (controlSpaceRegexString + "|") + "([!-\\[\\]-‧‪-퟿豈-￿]" + (combiningDiacriticalMarkString + "*") + "|[\uD800-\uDBFF][\uDC00-\uDFFF]" + (combiningDiacriticalMarkString + "*") + "|\\\\verb\\*([^]).*?\\4|\\\\verb([^*a-zA-Z]).*?\\5" + ("|" + controlWordWhitespaceRegexString) + ("|" + controlSymbolRegexString + ")");
class Lexer {
  constructor(v1899, v1900) {
    this.input = undefined;
    this.settings = undefined;
    this.tokenRegex = undefined;
    this.catcodes = undefined;
    this.input = v1899;
    this.settings = v1900;
    this.tokenRegex = new RegExp(tokenRegexString, "g");
    this.catcodes = {
      "%": 14,
      "~": 13
    };
  }
  setCatcode(v1901, v1902) {
    this.catcodes[v1901] = v1902;
  }
  lex() {
    var v1903 = this.input;
    var v1904 = this.tokenRegex.lastIndex;
    if (v1904 === v1903.length) {
      return new Token("EOF", new SourceLocation(this, v1904, v1904));
    }
    var v1905 = this.tokenRegex.exec(v1903);
    if (v1905 === null || v1905.index !== v1904) {
      throw new ParseError("Unexpected character: '" + v1903[v1904] + "'", new Token(v1903[v1904], new SourceLocation(this, v1904, v1904 + 1)));
    }
    var v1906 = v1905[6] || v1905[3] || (v1905[2] ? "\\ " : " ");
    if (this.catcodes[v1906] === 14) {
      var v1907 = v1903.indexOf("\n", this.tokenRegex.lastIndex);
      if (v1907 === -1) {
        this.tokenRegex.lastIndex = v1903.length;
        this.settings.reportNonstrict("commentAtEnd", "% comment has no terminating newline; LaTeX would fail because of commenting the end of math mode (e.g. $)");
      } else {
        this.tokenRegex.lastIndex = v1907 + 1;
      }
      return this.lex();
    }
    return new Token(v1906, new SourceLocation(this, v1904, this.tokenRegex.lastIndex));
  }
}
class Namespace {
  constructor(v1908 = {}, v1909 = {}) {
    this.current = undefined;
    this.builtins = undefined;
    this.undefStack = undefined;
    this.current = v1909;
    this.builtins = v1908;
    this.undefStack = [];
  }
  beginGroup() {
    this.undefStack.push({});
  }
  endGroup() {
    if (this.undefStack.length === 0) {
      throw new ParseError("Unbalanced namespace destruction: attempt to pop global namespace; please report this as a bug");
    }
    var v1910 = this.undefStack.pop();
    for (var v1911 in v1910) {
      if (v1910.hasOwnProperty(v1911)) {
        if (v1910[v1911] == null) {
          delete this.current[v1911];
        } else {
          this.current[v1911] = v1910[v1911];
        }
      }
    }
  }
  endGroups() {
    while (this.undefStack.length > 0) {
      this.endGroup();
    }
  }
  has(v1912) {
    return this.current.hasOwnProperty(v1912) || this.builtins.hasOwnProperty(v1912);
  }
  get(v1913) {
    if (this.current.hasOwnProperty(v1913)) {
      return this.current[v1913];
    } else {
      return this.builtins[v1913];
    }
  }
  set(v1914, v1915, v1916 = false) {
    if (v1916) {
      for (var v1917 = 0; v1917 < this.undefStack.length; v1917++) {
        delete this.undefStack[v1917][v1914];
      }
      if (this.undefStack.length > 0) {
        this.undefStack[this.undefStack.length - 1][v1914] = v1915;
      }
    } else {
      var v1918 = this.undefStack[this.undefStack.length - 1];
      if (v1918 && !v1918.hasOwnProperty(v1914)) {
        v1918[v1914] = this.current[v1914];
      }
    }
    if (v1915 == null) {
      delete this.current[v1914];
    } else {
      this.current[v1914] = v1915;
    }
  }
}
var macros = _macros;
defineMacro("\\noexpand", function (v1919) {
  var v1920 = v1919.popToken();
  if (v1919.isExpandable(v1920.text)) {
    v1920.noexpand = true;
    v1920.treatAsRelax = true;
  }
  return {
    tokens: [v1920],
    numArgs: 0
  };
});
defineMacro("\\expandafter", function (v1921) {
  var v1922 = v1921.popToken();
  v1921.expandOnce(true);
  return {
    tokens: [v1922],
    numArgs: 0
  };
});
defineMacro("\\@firstoftwo", function (v1923) {
  var v1924 = v1923.consumeArgs(2);
  return {
    tokens: v1924[0],
    numArgs: 0
  };
});
defineMacro("\\@secondoftwo", function (v1925) {
  var v1926 = v1925.consumeArgs(2);
  return {
    tokens: v1926[1],
    numArgs: 0
  };
});
defineMacro("\\@ifnextchar", function (v1927) {
  var v1928 = v1927.consumeArgs(3);
  v1927.consumeSpaces();
  var v1929 = v1927.future();
  if (v1928[0].length === 1 && v1928[0][0].text === v1929.text) {
    return {
      tokens: v1928[1],
      numArgs: 0
    };
  } else {
    return {
      tokens: v1928[2],
      numArgs: 0
    };
  }
});
defineMacro("\\@ifstar", "\\@ifnextchar *{\\@firstoftwo{#1}}");
defineMacro("\\TextOrMath", function (v1930) {
  var v1931 = v1930.consumeArgs(2);
  if (v1930.mode === "text") {
    return {
      tokens: v1931[0],
      numArgs: 0
    };
  } else {
    return {
      tokens: v1931[1],
      numArgs: 0
    };
  }
});
var digitToNumber = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  a: 10,
  A: 10,
  b: 11,
  B: 11,
  c: 12,
  C: 12,
  d: 13,
  D: 13,
  e: 14,
  E: 14,
  f: 15,
  F: 15
};
defineMacro("\\char", function (v1932) {
  var v1933 = v1932.popToken();
  var v1934;
  var v1935 = 0;
  if (v1933.text === "'") {
    v1934 = 8;
    v1933 = v1932.popToken();
  } else if (v1933.text === "\"") {
    v1934 = 16;
    v1933 = v1932.popToken();
  } else if (v1933.text === "`") {
    v1933 = v1932.popToken();
    if (v1933.text[0] === "\\") {
      v1935 = v1933.text.charCodeAt(1);
    } else if (v1933.text === "EOF") {
      throw new ParseError("\\char` missing argument");
    } else {
      v1935 = v1933.text.charCodeAt(0);
    }
  } else {
    v1934 = 10;
  }
  if (v1934) {
    v1935 = digitToNumber[v1933.text];
    if (v1935 == null || v1935 >= v1934) {
      throw new ParseError("Invalid base-" + v1934 + " digit " + v1933.text);
    }
    var v1936;
    while ((v1936 = digitToNumber[v1932.future().text]) != null && v1936 < v1934) {
      v1935 *= v1934;
      v1935 += v1936;
      v1932.popToken();
    }
  }
  return "\\@char{" + v1935 + "}";
});
var newcommand = (v1937, v1938, v1939, v1940) => {
  var v1941 = v1937.consumeArg().tokens;
  if (v1941.length !== 1) {
    throw new ParseError("\\newcommand's first argument must be a macro name");
  }
  var v1942 = v1941[0].text;
  var v1943 = v1937.isDefined(v1942);
  if (v1943 && !v1938) {
    throw new ParseError("\\newcommand{" + v1942 + "} attempting to redefine " + (v1942 + "; use \\renewcommand"));
  }
  if (!v1943 && !v1939) {
    throw new ParseError("\\renewcommand{" + v1942 + "} when command " + v1942 + " does not yet exist; use \\newcommand");
  }
  var v1944 = 0;
  v1941 = v1937.consumeArg().tokens;
  if (v1941.length === 1 && v1941[0].text === "[") {
    var v1945 = "";
    var v1946 = v1937.expandNextToken();
    while (v1946.text !== "]" && v1946.text !== "EOF") {
      v1945 += v1946.text;
      v1946 = v1937.expandNextToken();
    }
    if (!v1945.match(/^\s*[0-9]+\s*$/)) {
      throw new ParseError("Invalid number of arguments: " + v1945);
    }
    v1944 = parseInt(v1945);
    v1941 = v1937.consumeArg().tokens;
  }
  if (!v1943 || !v1940) {
    v1937.macros.set(v1942, {
      tokens: v1941,
      numArgs: v1944
    });
  }
  return "";
};
defineMacro("\\newcommand", v1947 => newcommand(v1947, false, true, false));
defineMacro("\\renewcommand", v1948 => newcommand(v1948, true, false, false));
defineMacro("\\providecommand", v1949 => newcommand(v1949, true, true, true));
defineMacro("\\message", v1950 => {
  var v1951 = v1950.consumeArgs(1)[0];
  console.log(v1951.reverse().map(v1952 => v1952.text).join(""));
  return "";
});
defineMacro("\\errmessage", v1953 => {
  var v1954 = v1953.consumeArgs(1)[0];
  console.error(v1954.reverse().map(v1955 => v1955.text).join(""));
  return "";
});
defineMacro("\\show", v1956 => {
  var v1957 = v1956.popToken();
  var v1958 = v1957.text;
  console.log(v1957, v1956.macros.get(v1958), functions[v1958], symbols.math[v1958], symbols.text[v1958]);
  return "";
});
defineMacro("\\bgroup", "{");
defineMacro("\\egroup", "}");
defineMacro("~", "\\nobreakspace");
defineMacro("\\lq", "`");
defineMacro("\\rq", "'");
defineMacro("\\aa", "\\r a");
defineMacro("\\AA", "\\r A");
defineMacro("\\textcopyright", "\\html@mathml{\\textcircled{c}}{\\char`©}");
defineMacro("\\copyright", "\\TextOrMath{\\textcopyright}{\\text{\\textcopyright}}");
defineMacro("\\textregistered", "\\html@mathml{\\textcircled{\\scriptsize R}}{\\char`®}");
defineMacro("ℬ", "\\mathscr{B}");
defineMacro("ℰ", "\\mathscr{E}");
defineMacro("ℱ", "\\mathscr{F}");
defineMacro("ℋ", "\\mathscr{H}");
defineMacro("ℐ", "\\mathscr{I}");
defineMacro("ℒ", "\\mathscr{L}");
defineMacro("ℳ", "\\mathscr{M}");
defineMacro("ℛ", "\\mathscr{R}");
defineMacro("ℭ", "\\mathfrak{C}");
defineMacro("ℌ", "\\mathfrak{H}");
defineMacro("ℨ", "\\mathfrak{Z}");
defineMacro("\\Bbbk", "\\Bbb{k}");
defineMacro("\\llap", "\\mathllap{\\textrm{#1}}");
defineMacro("\\rlap", "\\mathrlap{\\textrm{#1}}");
defineMacro("\\clap", "\\mathclap{\\textrm{#1}}");
defineMacro("\\mathstrut", "\\vphantom{(}");
defineMacro("\\underbar", "\\underline{\\text{#1}}");
defineMacro("\\not", "\\html@mathml{\\mathrel{\\mathrlap\\@not}\\nobreak}{\\char\"338}");
defineMacro("\\neq", "\\html@mathml{\\mathrel{\\not=}}{\\mathrel{\\char`≠}}");
defineMacro("\\ne", "\\neq");
defineMacro("≠", "\\neq");
defineMacro("\\notin", "\\html@mathml{\\mathrel{{\\in}\\mathllap{/\\mskip1mu}}}{\\mathrel{\\char`∉}}");
defineMacro("∉", "\\notin");
defineMacro("≘", "\\html@mathml{\\mathrel{=\\kern{-1em}\\raisebox{0.4em}{$\\scriptsize\\frown$}}}{\\mathrel{\\char`≘}}");
defineMacro("≙", "\\html@mathml{\\stackrel{\\tiny\\wedge}{=}}{\\mathrel{\\char`≘}}");
defineMacro("≚", "\\html@mathml{\\stackrel{\\tiny\\vee}{=}}{\\mathrel{\\char`≚}}");
defineMacro("≛", "\\html@mathml{\\stackrel{\\scriptsize\\star}{=}}{\\mathrel{\\char`≛}}");
defineMacro("≝", "\\html@mathml{\\stackrel{\\tiny\\mathrm{def}}{=}}{\\mathrel{\\char`≝}}");
defineMacro("≞", "\\html@mathml{\\stackrel{\\tiny\\mathrm{m}}{=}}{\\mathrel{\\char`≞}}");
defineMacro("≟", "\\html@mathml{\\stackrel{\\tiny?}{=}}{\\mathrel{\\char`≟}}");
defineMacro("⟂", "\\perp");
defineMacro("‼", "\\mathclose{!\\mkern-0.8mu!}");
defineMacro("∌", "\\notni");
defineMacro("⌜", "\\ulcorner");
defineMacro("⌝", "\\urcorner");
defineMacro("⌞", "\\llcorner");
defineMacro("⌟", "\\lrcorner");
defineMacro("©", "\\copyright");
defineMacro("®", "\\textregistered");
defineMacro("\\ulcorner", "\\html@mathml{\\@ulcorner}{\\mathop{\\char\"231c}}");
defineMacro("\\urcorner", "\\html@mathml{\\@urcorner}{\\mathop{\\char\"231d}}");
defineMacro("\\llcorner", "\\html@mathml{\\@llcorner}{\\mathop{\\char\"231e}}");
defineMacro("\\lrcorner", "\\html@mathml{\\@lrcorner}{\\mathop{\\char\"231f}}");
defineMacro("\\vdots", "{\\varvdots\\rule{0pt}{15pt}}");
defineMacro("⋮", "\\vdots");
defineMacro("\\varGamma", "\\mathit{\\Gamma}");
defineMacro("\\varDelta", "\\mathit{\\Delta}");
defineMacro("\\varTheta", "\\mathit{\\Theta}");
defineMacro("\\varLambda", "\\mathit{\\Lambda}");
defineMacro("\\varXi", "\\mathit{\\Xi}");
defineMacro("\\varPi", "\\mathit{\\Pi}");
defineMacro("\\varSigma", "\\mathit{\\Sigma}");
defineMacro("\\varUpsilon", "\\mathit{\\Upsilon}");
defineMacro("\\varPhi", "\\mathit{\\Phi}");
defineMacro("\\varPsi", "\\mathit{\\Psi}");
defineMacro("\\varOmega", "\\mathit{\\Omega}");
defineMacro("\\substack", "\\begin{subarray}{c}#1\\end{subarray}");
defineMacro("\\colon", "\\nobreak\\mskip2mu\\mathpunct{}\\mathchoice{\\mkern-3mu}{\\mkern-3mu}{}{}{:}\\mskip6mu\\relax");
defineMacro("\\boxed", "\\fbox{$\\displaystyle{#1}$}");
defineMacro("\\iff", "\\DOTSB\\;\\Longleftrightarrow\\;");
defineMacro("\\implies", "\\DOTSB\\;\\Longrightarrow\\;");
defineMacro("\\impliedby", "\\DOTSB\\;\\Longleftarrow\\;");
defineMacro("\\dddot", "{\\overset{\\raisebox{-0.1ex}{\\normalsize ...}}{#1}}");
defineMacro("\\ddddot", "{\\overset{\\raisebox{-0.1ex}{\\normalsize ....}}{#1}}");
var dotsByToken = {
  ",": "\\dotsc",
  "\\not": "\\dotsb",
  "+": "\\dotsb",
  "=": "\\dotsb",
  "<": "\\dotsb",
  ">": "\\dotsb",
  "-": "\\dotsb",
  "*": "\\dotsb",
  ":": "\\dotsb",
  "\\DOTSB": "\\dotsb",
  "\\coprod": "\\dotsb",
  "\\bigvee": "\\dotsb",
  "\\bigwedge": "\\dotsb",
  "\\biguplus": "\\dotsb",
  "\\bigcap": "\\dotsb",
  "\\bigcup": "\\dotsb",
  "\\prod": "\\dotsb",
  "\\sum": "\\dotsb",
  "\\bigotimes": "\\dotsb",
  "\\bigoplus": "\\dotsb",
  "\\bigodot": "\\dotsb",
  "\\bigsqcup": "\\dotsb",
  "\\And": "\\dotsb",
  "\\longrightarrow": "\\dotsb",
  "\\Longrightarrow": "\\dotsb",
  "\\longleftarrow": "\\dotsb",
  "\\Longleftarrow": "\\dotsb",
  "\\longleftrightarrow": "\\dotsb",
  "\\Longleftrightarrow": "\\dotsb",
  "\\mapsto": "\\dotsb",
  "\\longmapsto": "\\dotsb",
  "\\hookrightarrow": "\\dotsb",
  "\\doteq": "\\dotsb",
  "\\mathbin": "\\dotsb",
  "\\mathrel": "\\dotsb",
  "\\relbar": "\\dotsb",
  "\\Relbar": "\\dotsb",
  "\\xrightarrow": "\\dotsb",
  "\\xleftarrow": "\\dotsb",
  "\\DOTSI": "\\dotsi",
  "\\int": "\\dotsi",
  "\\oint": "\\dotsi",
  "\\iint": "\\dotsi",
  "\\iiint": "\\dotsi",
  "\\iiiint": "\\dotsi",
  "\\idotsint": "\\dotsi",
  "\\DOTSX": "\\dotsx"
};
var dotsbGroups = new Set(["bin", "rel"]);
defineMacro("\\dots", function (v1959) {
  var v1960 = "\\dotso";
  var v1961 = v1959.expandAfterFuture().text;
  if (v1961 in dotsByToken) {
    v1960 = dotsByToken[v1961];
  } else if (v1961.slice(0, 4) === "\\not") {
    v1960 = "\\dotsb";
  } else if (v1961 in symbols.math) {
    if (dotsbGroups.has(symbols.math[v1961].group)) {
      v1960 = "\\dotsb";
    }
  }
  return v1960;
});
var spaceAfterDots = {
  ")": true,
  "]": true,
  "\\rbrack": true,
  "\\}": true,
  "\\rbrace": true,
  "\\rangle": true,
  "\\rceil": true,
  "\\rfloor": true,
  "\\rgroup": true,
  "\\rmoustache": true,
  "\\right": true,
  "\\bigr": true,
  "\\biggr": true,
  "\\Bigr": true,
  "\\Biggr": true,
  $: true,
  ";": true,
  ".": true,
  ",": true
};
defineMacro("\\dotso", function (v1962) {
  var v1963 = v1962.future().text;
  if (v1963 in spaceAfterDots) {
    return "\\ldots\\,";
  } else {
    return "\\ldots";
  }
});
defineMacro("\\dotsc", function (v1964) {
  var v1965 = v1964.future().text;
  if (v1965 in spaceAfterDots && v1965 !== ",") {
    return "\\ldots\\,";
  } else {
    return "\\ldots";
  }
});
defineMacro("\\cdots", function (v1966) {
  var v1967 = v1966.future().text;
  if (v1967 in spaceAfterDots) {
    return "\\@cdots\\,";
  } else {
    return "\\@cdots";
  }
});
defineMacro("\\dotsb", "\\cdots");
defineMacro("\\dotsm", "\\cdots");
defineMacro("\\dotsi", "\\!\\cdots");
defineMacro("\\dotsx", "\\ldots\\,");
defineMacro("\\DOTSI", "\\relax");
defineMacro("\\DOTSB", "\\relax");
defineMacro("\\DOTSX", "\\relax");
defineMacro("\\tmspace", "\\TextOrMath{\\kern#1#3}{\\mskip#1#2}\\relax");
defineMacro("\\,", "\\tmspace+{3mu}{.1667em}");
defineMacro("\\thinspace", "\\,");
defineMacro("\\>", "\\mskip{4mu}");
defineMacro("\\:", "\\tmspace+{4mu}{.2222em}");
defineMacro("\\medspace", "\\:");
defineMacro("\\;", "\\tmspace+{5mu}{.2777em}");
defineMacro("\\thickspace", "\\;");
defineMacro("\\!", "\\tmspace-{3mu}{.1667em}");
defineMacro("\\negthinspace", "\\!");
defineMacro("\\negmedspace", "\\tmspace-{4mu}{.2222em}");
defineMacro("\\negthickspace", "\\tmspace-{5mu}{.277em}");
defineMacro("\\enspace", "\\kern.5em ");
defineMacro("\\enskip", "\\hskip.5em\\relax");
defineMacro("\\quad", "\\hskip1em\\relax");
defineMacro("\\qquad", "\\hskip2em\\relax");
defineMacro("\\tag", "\\@ifstar\\tag@literal\\tag@paren");
defineMacro("\\tag@paren", "\\tag@literal{({#1})}");
defineMacro("\\tag@literal", v1968 => {
  if (v1968.macros.get("\\df@tag")) {
    throw new ParseError("Multiple \\tag");
  }
  return "\\gdef\\df@tag{\\text{#1}}";
});
defineMacro("\\bmod", "\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}\\mathbin{\\rm mod}\\mathchoice{\\mskip1mu}{\\mskip1mu}{\\mskip5mu}{\\mskip5mu}");
defineMacro("\\pod", "\\allowbreak\\mathchoice{\\mkern18mu}{\\mkern8mu}{\\mkern8mu}{\\mkern8mu}(#1)");
defineMacro("\\pmod", "\\pod{{\\rm mod}\\mkern6mu#1}");
defineMacro("\\mod", "\\allowbreak\\mathchoice{\\mkern18mu}{\\mkern12mu}{\\mkern12mu}{\\mkern12mu}{\\rm mod}\\,\\,#1");
defineMacro("\\newline", "\\\\\\relax");
defineMacro("\\TeX", "\\textrm{\\html@mathml{T\\kern-.1667em\\raisebox{-.5ex}{E}\\kern-.125emX}{TeX}}");
var latexRaiseA = makeEm(fontMetricsData["Main-Regular"]["T".charCodeAt(0)][1] - fontMetricsData["Main-Regular"]["A".charCodeAt(0)][1] * 0.7);
defineMacro("\\LaTeX", "\\textrm{\\html@mathml{" + ("L\\kern-.36em\\raisebox{" + latexRaiseA + "}{\\scriptstyle A}") + "\\kern-.15em\\TeX}{LaTeX}}");
defineMacro("\\KaTeX", "\\textrm{\\html@mathml{" + ("K\\kern-.17em\\raisebox{" + latexRaiseA + "}{\\scriptstyle A}") + "\\kern-.15em\\TeX}{KaTeX}}");
defineMacro("\\hspace", "\\@ifstar\\@hspacer\\@hspace");
defineMacro("\\@hspace", "\\hskip #1\\relax");
defineMacro("\\@hspacer", "\\rule{0pt}{0pt}\\hskip #1\\relax");
defineMacro("\\ordinarycolon", ":");
defineMacro("\\vcentcolon", "\\mathrel{\\mathop\\ordinarycolon}");
defineMacro("\\dblcolon", "\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-.9mu}\\vcentcolon}}{\\mathop{\\char\"2237}}");
defineMacro("\\coloneqq", "\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}=}}{\\mathop{\\char\"2254}}");
defineMacro("\\Coloneqq", "\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}=}}{\\mathop{\\char\"2237\\char\"3d}}");
defineMacro("\\coloneq", "\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}{\\mathop{\\char\"3a\\char\"2212}}");
defineMacro("\\Coloneq", "\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\mathrel{-}}}{\\mathop{\\char\"2237\\char\"2212}}");
defineMacro("\\eqqcolon", "\\html@mathml{\\mathrel{=\\mathrel{\\mkern-1.2mu}\\vcentcolon}}{\\mathop{\\char\"2255}}");
defineMacro("\\Eqqcolon", "\\html@mathml{\\mathrel{=\\mathrel{\\mkern-1.2mu}\\dblcolon}}{\\mathop{\\char\"3d\\char\"2237}}");
defineMacro("\\eqcolon", "\\html@mathml{\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\vcentcolon}}{\\mathop{\\char\"2239}}");
defineMacro("\\Eqcolon", "\\html@mathml{\\mathrel{\\mathrel{-}\\mathrel{\\mkern-1.2mu}\\dblcolon}}{\\mathop{\\char\"2212\\char\"2237}}");
defineMacro("\\colonapprox", "\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\approx}}{\\mathop{\\char\"3a\\char\"2248}}");
defineMacro("\\Colonapprox", "\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\approx}}{\\mathop{\\char\"2237\\char\"2248}}");
defineMacro("\\colonsim", "\\html@mathml{\\mathrel{\\vcentcolon\\mathrel{\\mkern-1.2mu}\\sim}}{\\mathop{\\char\"3a\\char\"223c}}");
defineMacro("\\Colonsim", "\\html@mathml{\\mathrel{\\dblcolon\\mathrel{\\mkern-1.2mu}\\sim}}{\\mathop{\\char\"2237\\char\"223c}}");
defineMacro("∷", "\\dblcolon");
defineMacro("∹", "\\eqcolon");
defineMacro("≔", "\\coloneqq");
defineMacro("≕", "\\eqqcolon");
defineMacro("⩴", "\\Coloneqq");
defineMacro("\\ratio", "\\vcentcolon");
defineMacro("\\coloncolon", "\\dblcolon");
defineMacro("\\colonequals", "\\coloneqq");
defineMacro("\\coloncolonequals", "\\Coloneqq");
defineMacro("\\equalscolon", "\\eqqcolon");
defineMacro("\\equalscoloncolon", "\\Eqqcolon");
defineMacro("\\colonminus", "\\coloneq");
defineMacro("\\coloncolonminus", "\\Coloneq");
defineMacro("\\minuscolon", "\\eqcolon");
defineMacro("\\minuscoloncolon", "\\Eqcolon");
defineMacro("\\coloncolonapprox", "\\Colonapprox");
defineMacro("\\coloncolonsim", "\\Colonsim");
defineMacro("\\simcolon", "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
defineMacro("\\simcoloncolon", "\\mathrel{\\sim\\mathrel{\\mkern-1.2mu}\\dblcolon}");
defineMacro("\\approxcolon", "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\vcentcolon}");
defineMacro("\\approxcoloncolon", "\\mathrel{\\approx\\mathrel{\\mkern-1.2mu}\\dblcolon}");
defineMacro("\\notni", "\\html@mathml{\\not\\ni}{\\mathrel{\\char`∌}}");
defineMacro("\\limsup", "\\DOTSB\\operatorname*{lim\\,sup}");
defineMacro("\\liminf", "\\DOTSB\\operatorname*{lim\\,inf}");
defineMacro("\\injlim", "\\DOTSB\\operatorname*{inj\\,lim}");
defineMacro("\\projlim", "\\DOTSB\\operatorname*{proj\\,lim}");
defineMacro("\\varlimsup", "\\DOTSB\\operatorname*{\\overline{lim}}");
defineMacro("\\varliminf", "\\DOTSB\\operatorname*{\\underline{lim}}");
defineMacro("\\varinjlim", "\\DOTSB\\operatorname*{\\underrightarrow{lim}}");
defineMacro("\\varprojlim", "\\DOTSB\\operatorname*{\\underleftarrow{lim}}");
defineMacro("\\gvertneqq", "\\html@mathml{\\@gvertneqq}{≩}");
defineMacro("\\lvertneqq", "\\html@mathml{\\@lvertneqq}{≨}");
defineMacro("\\ngeqq", "\\html@mathml{\\@ngeqq}{≱}");
defineMacro("\\ngeqslant", "\\html@mathml{\\@ngeqslant}{≱}");
defineMacro("\\nleqq", "\\html@mathml{\\@nleqq}{≰}");
defineMacro("\\nleqslant", "\\html@mathml{\\@nleqslant}{≰}");
defineMacro("\\nshortmid", "\\html@mathml{\\@nshortmid}{∤}");
defineMacro("\\nshortparallel", "\\html@mathml{\\@nshortparallel}{∦}");
defineMacro("\\nsubseteqq", "\\html@mathml{\\@nsubseteqq}{⊈}");
defineMacro("\\nsupseteqq", "\\html@mathml{\\@nsupseteqq}{⊉}");
defineMacro("\\varsubsetneq", "\\html@mathml{\\@varsubsetneq}{⊊}");
defineMacro("\\varsubsetneqq", "\\html@mathml{\\@varsubsetneqq}{⫋}");
defineMacro("\\varsupsetneq", "\\html@mathml{\\@varsupsetneq}{⊋}");
defineMacro("\\varsupsetneqq", "\\html@mathml{\\@varsupsetneqq}{⫌}");
defineMacro("\\imath", "\\html@mathml{\\@imath}{ı}");
defineMacro("\\jmath", "\\html@mathml{\\@jmath}{ȷ}");
defineMacro("\\llbracket", "\\html@mathml{\\mathopen{[\\mkern-3.2mu[}}{\\mathopen{\\char`⟦}}");
defineMacro("\\rrbracket", "\\html@mathml{\\mathclose{]\\mkern-3.2mu]}}{\\mathclose{\\char`⟧}}");
defineMacro("⟦", "\\llbracket");
defineMacro("⟧", "\\rrbracket");
defineMacro("\\lBrace", "\\html@mathml{\\mathopen{\\{\\mkern-3.2mu[}}{\\mathopen{\\char`⦃}}");
defineMacro("\\rBrace", "\\html@mathml{\\mathclose{]\\mkern-3.2mu\\}}}{\\mathclose{\\char`⦄}}");
defineMacro("⦃", "\\lBrace");
defineMacro("⦄", "\\rBrace");
defineMacro("\\minuso", "\\mathbin{\\html@mathml{{\\mathrlap{\\mathchoice{\\kern{0.145em}}{\\kern{0.145em}}{\\kern{0.1015em}}{\\kern{0.0725em}}\\circ}{-}}}{\\char`⦵}}");
defineMacro("⦵", "\\minuso");
defineMacro("\\darr", "\\downarrow");
defineMacro("\\dArr", "\\Downarrow");
defineMacro("\\Darr", "\\Downarrow");
defineMacro("\\lang", "\\langle");
defineMacro("\\rang", "\\rangle");
defineMacro("\\uarr", "\\uparrow");
defineMacro("\\uArr", "\\Uparrow");
defineMacro("\\Uarr", "\\Uparrow");
defineMacro("\\N", "\\mathbb{N}");
defineMacro("\\R", "\\mathbb{R}");
defineMacro("\\Z", "\\mathbb{Z}");
defineMacro("\\alef", "\\aleph");
defineMacro("\\alefsym", "\\aleph");
defineMacro("\\Alpha", "\\mathrm{A}");
defineMacro("\\Beta", "\\mathrm{B}");
defineMacro("\\bull", "\\bullet");
defineMacro("\\Chi", "\\mathrm{X}");
defineMacro("\\clubs", "\\clubsuit");
defineMacro("\\cnums", "\\mathbb{C}");
defineMacro("\\Complex", "\\mathbb{C}");
defineMacro("\\Dagger", "\\ddagger");
defineMacro("\\diamonds", "\\diamondsuit");
defineMacro("\\empty", "\\emptyset");
defineMacro("\\Epsilon", "\\mathrm{E}");
defineMacro("\\Eta", "\\mathrm{H}");
defineMacro("\\exist", "\\exists");
defineMacro("\\harr", "\\leftrightarrow");
defineMacro("\\hArr", "\\Leftrightarrow");
defineMacro("\\Harr", "\\Leftrightarrow");
defineMacro("\\hearts", "\\heartsuit");
defineMacro("\\image", "\\Im");
defineMacro("\\infin", "\\infty");
defineMacro("\\Iota", "\\mathrm{I}");
defineMacro("\\isin", "\\in");
defineMacro("\\Kappa", "\\mathrm{K}");
defineMacro("\\larr", "\\leftarrow");
defineMacro("\\lArr", "\\Leftarrow");
defineMacro("\\Larr", "\\Leftarrow");
defineMacro("\\lrarr", "\\leftrightarrow");
defineMacro("\\lrArr", "\\Leftrightarrow");
defineMacro("\\Lrarr", "\\Leftrightarrow");
defineMacro("\\Mu", "\\mathrm{M}");
defineMacro("\\natnums", "\\mathbb{N}");
defineMacro("\\Nu", "\\mathrm{N}");
defineMacro("\\Omicron", "\\mathrm{O}");
defineMacro("\\plusmn", "\\pm");
defineMacro("\\rarr", "\\rightarrow");
defineMacro("\\rArr", "\\Rightarrow");
defineMacro("\\Rarr", "\\Rightarrow");
defineMacro("\\real", "\\Re");
defineMacro("\\reals", "\\mathbb{R}");
defineMacro("\\Reals", "\\mathbb{R}");
defineMacro("\\Rho", "\\mathrm{P}");
defineMacro("\\sdot", "\\cdot");
defineMacro("\\sect", "\\S");
defineMacro("\\spades", "\\spadesuit");
defineMacro("\\sub", "\\subset");
defineMacro("\\sube", "\\subseteq");
defineMacro("\\supe", "\\supseteq");
defineMacro("\\Tau", "\\mathrm{T}");
defineMacro("\\thetasym", "\\vartheta");
defineMacro("\\weierp", "\\wp");
defineMacro("\\Zeta", "\\mathrm{Z}");
defineMacro("\\argmin", "\\DOTSB\\operatorname*{arg\\,min}");
defineMacro("\\argmax", "\\DOTSB\\operatorname*{arg\\,max}");
defineMacro("\\plim", "\\DOTSB\\mathop{\\operatorname{plim}}\\limits");
defineMacro("\\bra", "\\mathinner{\\langle{#1}|}");
defineMacro("\\ket", "\\mathinner{|{#1}\\rangle}");
defineMacro("\\braket", "\\mathinner{\\langle{#1}\\rangle}");
defineMacro("\\Bra", "\\left\\langle#1\\right|");
defineMacro("\\Ket", "\\left|#1\\right\\rangle");
var braketHelper = v1969 => v1970 => {
  var v1971 = v1970.consumeArg().tokens;
  var v1972 = v1970.consumeArg().tokens;
  var v1973 = v1970.consumeArg().tokens;
  var v1974 = v1970.consumeArg().tokens;
  var v1975 = v1970.macros.get("|");
  var v1976 = v1970.macros.get("\\|");
  v1970.macros.beginGroup();
  var v1977 = v1978 => v1979 => {
    if (v1969) {
      v1979.macros.set("|", v1975);
      if (v1973.length) {
        v1979.macros.set("\\|", v1976);
      }
    }
    var v1980 = v1978;
    if (!v1978 && v1973.length) {
      var v1981 = v1979.future();
      if (v1981.text === "|") {
        v1979.popToken();
        v1980 = true;
      }
    }
    return {
      tokens: v1980 ? v1973 : v1972,
      numArgs: 0
    };
  };
  v1970.macros.set("|", v1977(false));
  if (v1973.length) {
    v1970.macros.set("\\|", v1977(true));
  }
  var v1982 = v1970.consumeArg().tokens;
  var v1983 = v1970.expandTokens([...v1974, ...v1982, ...v1971]);
  v1970.macros.endGroup();
  return {
    tokens: v1983.reverse(),
    numArgs: 0
  };
};
defineMacro("\\bra@ket", braketHelper(false));
defineMacro("\\bra@set", braketHelper(true));
defineMacro("\\Braket", "\\bra@ket{\\left\\langle}{\\,\\middle\\vert\\,}{\\,\\middle\\vert\\,}{\\right\\rangle}");
defineMacro("\\Set", "\\bra@set{\\left\\{\\:}{\\;\\middle\\vert\\;}{\\;\\middle\\Vert\\;}{\\:\\right\\}}");
defineMacro("\\set", "\\bra@set{\\{\\,}{\\mid}{}{\\,\\}}");
defineMacro("\\angln", "{\\angl n}");
defineMacro("\\blue", "\\textcolor{##6495ed}{#1}");
defineMacro("\\orange", "\\textcolor{##ffa500}{#1}");
defineMacro("\\pink", "\\textcolor{##ff00af}{#1}");
defineMacro("\\red", "\\textcolor{##df0030}{#1}");
defineMacro("\\green", "\\textcolor{##28ae7b}{#1}");
defineMacro("\\gray", "\\textcolor{gray}{#1}");
defineMacro("\\purple", "\\textcolor{##9d38bd}{#1}");
defineMacro("\\blueA", "\\textcolor{##ccfaff}{#1}");
defineMacro("\\blueB", "\\textcolor{##80f6ff}{#1}");
defineMacro("\\blueC", "\\textcolor{##63d9ea}{#1}");
defineMacro("\\blueD", "\\textcolor{##11accd}{#1}");
defineMacro("\\blueE", "\\textcolor{##0c7f99}{#1}");
defineMacro("\\tealA", "\\textcolor{##94fff5}{#1}");
defineMacro("\\tealB", "\\textcolor{##26edd5}{#1}");
defineMacro("\\tealC", "\\textcolor{##01d1c1}{#1}");
defineMacro("\\tealD", "\\textcolor{##01a995}{#1}");
defineMacro("\\tealE", "\\textcolor{##208170}{#1}");
defineMacro("\\greenA", "\\textcolor{##b6ffb0}{#1}");
defineMacro("\\greenB", "\\textcolor{##8af281}{#1}");
defineMacro("\\greenC", "\\textcolor{##74cf70}{#1}");
defineMacro("\\greenD", "\\textcolor{##1fab54}{#1}");
defineMacro("\\greenE", "\\textcolor{##0d923f}{#1}");
defineMacro("\\goldA", "\\textcolor{##ffd0a9}{#1}");
defineMacro("\\goldB", "\\textcolor{##ffbb71}{#1}");
defineMacro("\\goldC", "\\textcolor{##ff9c39}{#1}");
defineMacro("\\goldD", "\\textcolor{##e07d10}{#1}");
defineMacro("\\goldE", "\\textcolor{##a75a05}{#1}");
defineMacro("\\redA", "\\textcolor{##fca9a9}{#1}");
defineMacro("\\redB", "\\textcolor{##ff8482}{#1}");
defineMacro("\\redC", "\\textcolor{##f9685d}{#1}");
defineMacro("\\redD", "\\textcolor{##e84d39}{#1}");
defineMacro("\\redE", "\\textcolor{##bc2612}{#1}");
defineMacro("\\maroonA", "\\textcolor{##ffbde0}{#1}");
defineMacro("\\maroonB", "\\textcolor{##ff92c6}{#1}");
defineMacro("\\maroonC", "\\textcolor{##ed5fa6}{#1}");
defineMacro("\\maroonD", "\\textcolor{##ca337c}{#1}");
defineMacro("\\maroonE", "\\textcolor{##9e034e}{#1}");
defineMacro("\\purpleA", "\\textcolor{##ddd7ff}{#1}");
defineMacro("\\purpleB", "\\textcolor{##c6b9fc}{#1}");
defineMacro("\\purpleC", "\\textcolor{##aa87ff}{#1}");
defineMacro("\\purpleD", "\\textcolor{##7854ab}{#1}");
defineMacro("\\purpleE", "\\textcolor{##543b78}{#1}");
defineMacro("\\mintA", "\\textcolor{##f5f9e8}{#1}");
defineMacro("\\mintB", "\\textcolor{##edf2df}{#1}");
defineMacro("\\mintC", "\\textcolor{##e0e5cc}{#1}");
defineMacro("\\grayA", "\\textcolor{##f6f7f7}{#1}");
defineMacro("\\grayB", "\\textcolor{##f0f1f2}{#1}");
defineMacro("\\grayC", "\\textcolor{##e3e5e6}{#1}");
defineMacro("\\grayD", "\\textcolor{##d6d8da}{#1}");
defineMacro("\\grayE", "\\textcolor{##babec2}{#1}");
defineMacro("\\grayF", "\\textcolor{##888d93}{#1}");
defineMacro("\\grayG", "\\textcolor{##626569}{#1}");
defineMacro("\\grayH", "\\textcolor{##3b3e40}{#1}");
defineMacro("\\grayI", "\\textcolor{##21242c}{#1}");
defineMacro("\\kaBlue", "\\textcolor{##314453}{#1}");
defineMacro("\\kaGreen", "\\textcolor{##71B307}{#1}");
var implicitCommands = {
  "^": true,
  _: true,
  "\\limits": true,
  "\\nolimits": true
};
class MacroExpander {
  constructor(v1984, v1985, v1986) {
    this.settings = undefined;
    this.expansionCount = undefined;
    this.lexer = undefined;
    this.macros = undefined;
    this.stack = undefined;
    this.mode = undefined;
    this.settings = v1985;
    this.expansionCount = 0;
    this.feed(v1984);
    this.macros = new Namespace(macros, v1985.macros);
    this.mode = v1986;
    this.stack = [];
  }
  feed(v1987) {
    this.lexer = new Lexer(v1987, this.settings);
  }
  switchMode(v1988) {
    this.mode = v1988;
  }
  beginGroup() {
    this.macros.beginGroup();
  }
  endGroup() {
    this.macros.endGroup();
  }
  endGroups() {
    this.macros.endGroups();
  }
  future() {
    if (this.stack.length === 0) {
      this.pushToken(this.lexer.lex());
    }
    return this.stack[this.stack.length - 1];
  }
  popToken() {
    this.future();
    return this.stack.pop();
  }
  pushToken(v1989) {
    this.stack.push(v1989);
  }
  pushTokens(v1990) {
    this.stack.push(...v1990);
  }
  scanArgument(v1991) {
    var v1992;
    var v1993;
    var v1994;
    if (v1991) {
      this.consumeSpaces();
      if (this.future().text !== "[") {
        return null;
      }
      v1992 = this.popToken();
      ({
        tokens: v1994,
        end: v1993
      } = this.consumeArg(["]"]));
    } else {
      ({
        tokens: v1994,
        start: v1992,
        end: v1993
      } = this.consumeArg());
    }
    this.pushToken(new Token("EOF", v1993.loc));
    this.pushTokens(v1994);
    return new Token("", SourceLocation.range(v1992, v1993));
  }
  consumeSpaces() {
    while (true) {
      var v1995 = this.future();
      if (v1995.text === " ") {
        this.stack.pop();
      } else {
        break;
      }
    }
  }
  consumeArg(v1996) {
    var v1997 = [];
    var v1998 = v1996 && v1996.length > 0;
    if (!v1998) {
      this.consumeSpaces();
    }
    var v1999 = this.future();
    var v2000;
    var v2001 = 0;
    var v2002 = 0;
    do {
      v2000 = this.popToken();
      v1997.push(v2000);
      if (v2000.text === "{") {
        ++v2001;
      } else if (v2000.text === "}") {
        --v2001;
        if (v2001 === -1) {
          throw new ParseError("Extra }", v2000);
        }
      } else if (v2000.text === "EOF") {
        throw new ParseError("Unexpected end of input in a macro argument, expected '" + (v1996 && v1998 ? v1996[v2002] : "}") + "'", v2000);
      }
      if (v1996 && v1998) {
        if ((v2001 === 0 || v2001 === 1 && v1996[v2002] === "{") && v2000.text === v1996[v2002]) {
          ++v2002;
          if (v2002 === v1996.length) {
            v1997.splice(-v2002, v2002);
            break;
          }
        } else {
          v2002 = 0;
        }
      }
    } while (v2001 !== 0 || v1998);
    if (v1999.text === "{" && v1997[v1997.length - 1].text === "}") {
      v1997.pop();
      v1997.shift();
    }
    v1997.reverse();
    return {
      tokens: v1997,
      start: v1999,
      end: v2000
    };
  }
  consumeArgs(v2003, v2004) {
    if (v2004) {
      if (v2004.length !== v2003 + 1) {
        throw new ParseError("The length of delimiters doesn't match the number of args!");
      }
      var v2005 = v2004[0];
      for (var v2006 = 0; v2006 < v2005.length; v2006++) {
        var v2007 = this.popToken();
        if (v2005[v2006] !== v2007.text) {
          throw new ParseError("Use of the macro doesn't match its definition", v2007);
        }
      }
    }
    var v2008 = [];
    for (var v2009 = 0; v2009 < v2003; v2009++) {
      v2008.push(this.consumeArg(v2004 && v2004[v2009 + 1]).tokens);
    }
    return v2008;
  }
  countExpansion(v2010) {
    this.expansionCount += v2010;
    if (this.expansionCount > this.settings.maxExpand) {
      throw new ParseError("Too many expansions: infinite loop or need to increase maxExpand setting");
    }
  }
  expandOnce(v2011) {
    var v2012 = this.popToken();
    var v2013 = v2012.text;
    var v2014 = !v2012.noexpand ? this._getExpansion(v2013) : null;
    if (v2014 == null || v2011 && v2014.unexpandable) {
      if (v2011 && v2014 == null && v2013[0] === "\\" && !this.isDefined(v2013)) {
        throw new ParseError("Undefined control sequence: " + v2013);
      }
      this.pushToken(v2012);
      return false;
    }
    this.countExpansion(1);
    var v2015 = v2014.tokens;
    var v2016 = this.consumeArgs(v2014.numArgs, v2014.delimiters);
    if (v2014.numArgs) {
      v2015 = v2015.slice();
      for (var v2017 = v2015.length - 1; v2017 >= 0; --v2017) {
        var v2018 = v2015[v2017];
        if (v2018.text === "#") {
          if (v2017 === 0) {
            throw new ParseError("Incomplete placeholder at end of macro body", v2018);
          }
          v2018 = v2015[--v2017];
          if (v2018.text === "#") {
            v2015.splice(v2017 + 1, 1);
          } else if (/^[1-9]$/.test(v2018.text)) {
            v2015.splice(v2017, 2, ...v2016[+v2018.text - 1]);
          } else {
            throw new ParseError("Not a valid argument number", v2018);
          }
        }
      }
    }
    this.pushTokens(v2015);
    return v2015.length;
  }
  expandAfterFuture() {
    this.expandOnce();
    return this.future();
  }
  expandNextToken() {
    while (true) {
      if (this.expandOnce() === false) {
        var v2019 = this.stack.pop();
        if (v2019.treatAsRelax) {
          v2019.text = "\\relax";
        }
        return v2019;
      }
    }
  }
  expandMacro(v2020) {
    if (this.macros.has(v2020)) {
      return this.expandTokens([new Token(v2020)]);
    } else {
      return undefined;
    }
  }
  expandTokens(v2021) {
    var v2022 = [];
    var v2023 = this.stack.length;
    this.pushTokens(v2021);
    while (this.stack.length > v2023) {
      if (this.expandOnce(true) === false) {
        var v2024 = this.stack.pop();
        if (v2024.treatAsRelax) {
          v2024.noexpand = false;
          v2024.treatAsRelax = false;
        }
        v2022.push(v2024);
      }
    }
    this.countExpansion(v2022.length);
    return v2022;
  }
  expandMacroAsText(v2025) {
    var v2026 = this.expandMacro(v2025);
    if (v2026) {
      return v2026.map(v2027 => v2027.text).join("");
    } else {
      return v2026;
    }
  }
  _getExpansion(v2028) {
    var v2029 = this.macros.get(v2028);
    if (v2029 == null) {
      return v2029;
    }
    if (v2028.length === 1) {
      var v2030 = this.lexer.catcodes[v2028];
      if (v2030 != null && v2030 !== 13) {
        return;
      }
    }
    var v2031 = typeof v2029 === "function" ? v2029(this) : v2029;
    if (typeof v2031 === "string") {
      var v2032 = 0;
      if (v2031.includes("#")) {
        var v2033 = v2031.replace(/##/g, "");
        while (v2033.includes("#" + (v2032 + 1))) {
          ++v2032;
        }
      }
      var v2034 = new Lexer(v2031, this.settings);
      var v2035 = [];
      var v2036 = v2034.lex();
      while (v2036.text !== "EOF") {
        v2035.push(v2036);
        v2036 = v2034.lex();
      }
      v2035.reverse();
      var v2037 = {
        tokens: v2035,
        numArgs: v2032
      };
      return v2037;
    }
    return v2031;
  }
  isDefined(v2038) {
    return this.macros.has(v2038) || functions.hasOwnProperty(v2038) || symbols.math.hasOwnProperty(v2038) || symbols.text.hasOwnProperty(v2038) || implicitCommands.hasOwnProperty(v2038);
  }
  isExpandable(v2039) {
    var v2040 = this.macros.get(v2039);
    if (v2040 != null) {
      return typeof v2040 === "string" || typeof v2040 === "function" || !v2040.unexpandable;
    } else {
      return functions.hasOwnProperty(v2039) && !functions[v2039].primitive;
    }
  }
}
var unicodeSubRegEx = /^[₊₋₌₍₎₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓᵦᵧᵨᵩᵪ]/;
var uSubsAndSups = Object.freeze({
  "₊": "+",
  "₋": "-",
  "₌": "=",
  "₍": "(",
  "₎": ")",
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  ₐ: "a",
  ₑ: "e",
  ₕ: "h",
  ᵢ: "i",
  ⱼ: "j",
  ₖ: "k",
  ₗ: "l",
  ₘ: "m",
  ₙ: "n",
  ₒ: "o",
  ₚ: "p",
  ᵣ: "r",
  ₛ: "s",
  ₜ: "t",
  ᵤ: "u",
  ᵥ: "v",
  ₓ: "x",
  ᵦ: "β",
  ᵧ: "γ",
  ᵨ: "ρ",
  ᵩ: "ϕ",
  ᵪ: "χ",
  "⁺": "+",
  "⁻": "-",
  "⁼": "=",
  "⁽": "(",
  "⁾": ")",
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  ᴬ: "A",
  ᴮ: "B",
  ᴰ: "D",
  ᴱ: "E",
  ᴳ: "G",
  ᴴ: "H",
  ᴵ: "I",
  ᴶ: "J",
  ᴷ: "K",
  ᴸ: "L",
  ᴹ: "M",
  ᴺ: "N",
  ᴼ: "O",
  ᴾ: "P",
  ᴿ: "R",
  ᵀ: "T",
  ᵁ: "U",
  ⱽ: "V",
  ᵂ: "W",
  ᵃ: "a",
  ᵇ: "b",
  ᶜ: "c",
  ᵈ: "d",
  ᵉ: "e",
  ᶠ: "f",
  ᵍ: "g",
  ʰ: "h",
  ⁱ: "i",
  ʲ: "j",
  ᵏ: "k",
  ˡ: "l",
  ᵐ: "m",
  ⁿ: "n",
  ᵒ: "o",
  ᵖ: "p",
  ʳ: "r",
  ˢ: "s",
  ᵗ: "t",
  ᵘ: "u",
  ᵛ: "v",
  ʷ: "w",
  ˣ: "x",
  ʸ: "y",
  ᶻ: "z",
  ᵝ: "β",
  ᵞ: "γ",
  ᵟ: "δ",
  ᵠ: "ϕ",
  ᵡ: "χ",
  ᶿ: "θ"
});
var unicodeAccents = {
  "́": {
    text: "\\'",
    math: "\\acute"
  },
  "̀": {
    text: "\\`",
    math: "\\grave"
  },
  "̈": {
    text: "\\\"",
    math: "\\ddot"
  },
  "̃": {
    text: "\\~",
    math: "\\tilde"
  },
  "̄": {
    text: "\\=",
    math: "\\bar"
  },
  "̆": {
    text: "\\u",
    math: "\\breve"
  },
  "̌": {
    text: "\\v",
    math: "\\check"
  },
  "̂": {
    text: "\\^",
    math: "\\hat"
  },
  "̇": {
    text: "\\.",
    math: "\\dot"
  },
  "̊": {
    text: "\\r",
    math: "\\mathring"
  },
  "̋": {
    text: "\\H"
  },
  "̧": {
    text: "\\c"
  }
};
var unicodeSymbols = {
  á: "á",
  à: "à",
  ä: "ä",
  ǟ: "ǟ",
  ã: "ã",
  ā: "ā",
  ă: "ă",
  ắ: "ắ",
  ằ: "ằ",
  ẵ: "ẵ",
  ǎ: "ǎ",
  â: "â",
  ấ: "ấ",
  ầ: "ầ",
  ẫ: "ẫ",
  ȧ: "ȧ",
  ǡ: "ǡ",
  å: "å",
  ǻ: "ǻ",
  ḃ: "ḃ",
  ć: "ć",
  ḉ: "ḉ",
  č: "č",
  ĉ: "ĉ",
  ċ: "ċ",
  ç: "ç",
  ď: "ď",
  ḋ: "ḋ",
  ḑ: "ḑ",
  é: "é",
  è: "è",
  ë: "ë",
  ẽ: "ẽ",
  ē: "ē",
  ḗ: "ḗ",
  ḕ: "ḕ",
  ĕ: "ĕ",
  ḝ: "ḝ",
  ě: "ě",
  ê: "ê",
  ế: "ế",
  ề: "ề",
  ễ: "ễ",
  ė: "ė",
  ȩ: "ȩ",
  ḟ: "ḟ",
  ǵ: "ǵ",
  ḡ: "ḡ",
  ğ: "ğ",
  ǧ: "ǧ",
  ĝ: "ĝ",
  ġ: "ġ",
  ģ: "ģ",
  ḧ: "ḧ",
  ȟ: "ȟ",
  ĥ: "ĥ",
  ḣ: "ḣ",
  ḩ: "ḩ",
  í: "í",
  ì: "ì",
  ï: "ï",
  ḯ: "ḯ",
  ĩ: "ĩ",
  ī: "ī",
  ĭ: "ĭ",
  ǐ: "ǐ",
  î: "î",
  ǰ: "ǰ",
  ĵ: "ĵ",
  ḱ: "ḱ",
  ǩ: "ǩ",
  ķ: "ķ",
  ĺ: "ĺ",
  ľ: "ľ",
  ļ: "ļ",
  ḿ: "ḿ",
  ṁ: "ṁ",
  ń: "ń",
  ǹ: "ǹ",
  ñ: "ñ",
  ň: "ň",
  ṅ: "ṅ",
  ņ: "ņ",
  ó: "ó",
  ò: "ò",
  ö: "ö",
  ȫ: "ȫ",
  õ: "õ",
  ṍ: "ṍ",
  ṏ: "ṏ",
  ȭ: "ȭ",
  ō: "ō",
  ṓ: "ṓ",
  ṑ: "ṑ",
  ŏ: "ŏ",
  ǒ: "ǒ",
  ô: "ô",
  ố: "ố",
  ồ: "ồ",
  ỗ: "ỗ",
  ȯ: "ȯ",
  ȱ: "ȱ",
  ő: "ő",
  ṕ: "ṕ",
  ṗ: "ṗ",
  ŕ: "ŕ",
  ř: "ř",
  ṙ: "ṙ",
  ŗ: "ŗ",
  ś: "ś",
  ṥ: "ṥ",
  š: "š",
  ṧ: "ṧ",
  ŝ: "ŝ",
  ṡ: "ṡ",
  ş: "ş",
  ẗ: "ẗ",
  ť: "ť",
  ṫ: "ṫ",
  ţ: "ţ",
  ú: "ú",
  ù: "ù",
  ü: "ü",
  ǘ: "ǘ",
  ǜ: "ǜ",
  ǖ: "ǖ",
  ǚ: "ǚ",
  ũ: "ũ",
  ṹ: "ṹ",
  ū: "ū",
  ṻ: "ṻ",
  ŭ: "ŭ",
  ǔ: "ǔ",
  û: "û",
  ů: "ů",
  ű: "ű",
  ṽ: "ṽ",
  ẃ: "ẃ",
  ẁ: "ẁ",
  ẅ: "ẅ",
  ŵ: "ŵ",
  ẇ: "ẇ",
  ẘ: "ẘ",
  ẍ: "ẍ",
  ẋ: "ẋ",
  ý: "ý",
  ỳ: "ỳ",
  ÿ: "ÿ",
  ỹ: "ỹ",
  ȳ: "ȳ",
  ŷ: "ŷ",
  ẏ: "ẏ",
  ẙ: "ẙ",
  ź: "ź",
  ž: "ž",
  ẑ: "ẑ",
  ż: "ż",
  Á: "Á",
  À: "À",
  Ä: "Ä",
  Ǟ: "Ǟ",
  Ã: "Ã",
  Ā: "Ā",
  Ă: "Ă",
  Ắ: "Ắ",
  Ằ: "Ằ",
  Ẵ: "Ẵ",
  Ǎ: "Ǎ",
  Â: "Â",
  Ấ: "Ấ",
  Ầ: "Ầ",
  Ẫ: "Ẫ",
  Ȧ: "Ȧ",
  Ǡ: "Ǡ",
  Å: "Å",
  Ǻ: "Ǻ",
  Ḃ: "Ḃ",
  Ć: "Ć",
  Ḉ: "Ḉ",
  Č: "Č",
  Ĉ: "Ĉ",
  Ċ: "Ċ",
  Ç: "Ç",
  Ď: "Ď",
  Ḋ: "Ḋ",
  Ḑ: "Ḑ",
  É: "É",
  È: "È",
  Ë: "Ë",
  Ẽ: "Ẽ",
  Ē: "Ē",
  Ḗ: "Ḗ",
  Ḕ: "Ḕ",
  Ĕ: "Ĕ",
  Ḝ: "Ḝ",
  Ě: "Ě",
  Ê: "Ê",
  Ế: "Ế",
  Ề: "Ề",
  Ễ: "Ễ",
  Ė: "Ė",
  Ȩ: "Ȩ",
  Ḟ: "Ḟ",
  Ǵ: "Ǵ",
  Ḡ: "Ḡ",
  Ğ: "Ğ",
  Ǧ: "Ǧ",
  Ĝ: "Ĝ",
  Ġ: "Ġ",
  Ģ: "Ģ",
  Ḧ: "Ḧ",
  Ȟ: "Ȟ",
  Ĥ: "Ĥ",
  Ḣ: "Ḣ",
  Ḩ: "Ḩ",
  Í: "Í",
  Ì: "Ì",
  Ï: "Ï",
  Ḯ: "Ḯ",
  Ĩ: "Ĩ",
  Ī: "Ī",
  Ĭ: "Ĭ",
  Ǐ: "Ǐ",
  Î: "Î",
  İ: "İ",
  Ĵ: "Ĵ",
  Ḱ: "Ḱ",
  Ǩ: "Ǩ",
  Ķ: "Ķ",
  Ĺ: "Ĺ",
  Ľ: "Ľ",
  Ļ: "Ļ",
  Ḿ: "Ḿ",
  Ṁ: "Ṁ",
  Ń: "Ń",
  Ǹ: "Ǹ",
  Ñ: "Ñ",
  Ň: "Ň",
  Ṅ: "Ṅ",
  Ņ: "Ņ",
  Ó: "Ó",
  Ò: "Ò",
  Ö: "Ö",
  Ȫ: "Ȫ",
  Õ: "Õ",
  Ṍ: "Ṍ",
  Ṏ: "Ṏ",
  Ȭ: "Ȭ",
  Ō: "Ō",
  Ṓ: "Ṓ",
  Ṑ: "Ṑ",
  Ŏ: "Ŏ",
  Ǒ: "Ǒ",
  Ô: "Ô",
  Ố: "Ố",
  Ồ: "Ồ",
  Ỗ: "Ỗ",
  Ȯ: "Ȯ",
  Ȱ: "Ȱ",
  Ő: "Ő",
  Ṕ: "Ṕ",
  Ṗ: "Ṗ",
  Ŕ: "Ŕ",
  Ř: "Ř",
  Ṙ: "Ṙ",
  Ŗ: "Ŗ",
  Ś: "Ś",
  Ṥ: "Ṥ",
  Š: "Š",
  Ṧ: "Ṧ",
  Ŝ: "Ŝ",
  Ṡ: "Ṡ",
  Ş: "Ş",
  Ť: "Ť",
  Ṫ: "Ṫ",
  Ţ: "Ţ",
  Ú: "Ú",
  Ù: "Ù",
  Ü: "Ü",
  Ǘ: "Ǘ",
  Ǜ: "Ǜ",
  Ǖ: "Ǖ",
  Ǚ: "Ǚ",
  Ũ: "Ũ",
  Ṹ: "Ṹ",
  Ū: "Ū",
  Ṻ: "Ṻ",
  Ŭ: "Ŭ",
  Ǔ: "Ǔ",
  Û: "Û",
  Ů: "Ů",
  Ű: "Ű",
  Ṽ: "Ṽ",
  Ẃ: "Ẃ",
  Ẁ: "Ẁ",
  Ẅ: "Ẅ",
  Ŵ: "Ŵ",
  Ẇ: "Ẇ",
  Ẍ: "Ẍ",
  Ẋ: "Ẋ",
  Ý: "Ý",
  Ỳ: "Ỳ",
  Ÿ: "Ÿ",
  Ỹ: "Ỹ",
  Ȳ: "Ȳ",
  Ŷ: "Ŷ",
  Ẏ: "Ẏ",
  Ź: "Ź",
  Ž: "Ž",
  Ẑ: "Ẑ",
  Ż: "Ż",
  ά: "ά",
  ὰ: "ὰ",
  ᾱ: "ᾱ",
  ᾰ: "ᾰ",
  έ: "έ",
  ὲ: "ὲ",
  ή: "ή",
  ὴ: "ὴ",
  ί: "ί",
  ὶ: "ὶ",
  ϊ: "ϊ",
  ΐ: "ΐ",
  ῒ: "ῒ",
  ῑ: "ῑ",
  ῐ: "ῐ",
  ό: "ό",
  ὸ: "ὸ",
  ύ: "ύ",
  ὺ: "ὺ",
  ϋ: "ϋ",
  ΰ: "ΰ",
  ῢ: "ῢ",
  ῡ: "ῡ",
  ῠ: "ῠ",
  ώ: "ώ",
  ὼ: "ὼ",
  Ύ: "Ύ",
  Ὺ: "Ὺ",
  Ϋ: "Ϋ",
  Ῡ: "Ῡ",
  Ῠ: "Ῠ",
  Ώ: "Ώ",
  Ὼ: "Ὼ"
};
class Parser {
  constructor(v2041, v2042) {
    this.mode = undefined;
    this.gullet = undefined;
    this.settings = undefined;
    this.leftrightDepth = undefined;
    this.nextToken = undefined;
    this.mode = "math";
    this.gullet = new MacroExpander(v2041, v2042, this.mode);
    this.settings = v2042;
    this.leftrightDepth = 0;
    this.nextToken = null;
  }
  expect(v2043, v2044 = true) {
    if (this.fetch().text !== v2043) {
      throw new ParseError("Expected '" + v2043 + "', got '" + this.fetch().text + "'", this.fetch());
    }
    if (v2044) {
      this.consume();
    }
  }
  consume() {
    this.nextToken = null;
  }
  fetch() {
    if (this.nextToken == null) {
      this.nextToken = this.gullet.expandNextToken();
    }
    return this.nextToken;
  }
  switchMode(v2045) {
    this.mode = v2045;
    this.gullet.switchMode(v2045);
  }
  parse() {
    if (!this.settings.globalGroup) {
      this.gullet.beginGroup();
    }
    if (this.settings.colorIsTextColor) {
      this.gullet.macros.set("\\color", "\\textcolor");
    }
    try {
      var v2046 = this.parseExpression(false);
      this.expect("EOF");
      if (!this.settings.globalGroup) {
        this.gullet.endGroup();
      }
      return v2046;
    } finally {
      this.gullet.endGroups();
    }
  }
  subparse(v2047) {
    var v2048 = this.nextToken;
    this.consume();
    this.gullet.pushToken(new Token("}"));
    this.gullet.pushTokens(v2047);
    var v2049 = this.parseExpression(false);
    this.expect("}");
    this.nextToken = v2048;
    return v2049;
  }
  parseExpression(v2050, v2051) {
    var v2052 = [];
    while (true) {
      if (this.mode === "math") {
        this.consumeSpaces();
      }
      var v2053 = this.fetch();
      if (Parser.endOfExpression.has(v2053.text)) {
        break;
      }
      if (v2051 && v2053.text === v2051) {
        break;
      }
      if (v2050 && functions[v2053.text] && functions[v2053.text].infix) {
        break;
      }
      var v2054 = this.parseAtom(v2051);
      if (!v2054) {
        break;
      } else if (v2054.type === "internal") {
        continue;
      }
      v2052.push(v2054);
    }
    if (this.mode === "text") {
      this.formLigatures(v2052);
    }
    return this.handleInfixNodes(v2052);
  }
  handleInfixNodes(v2055) {
    var v2056 = -1;
    var v2057;
    for (var v2058 = 0; v2058 < v2055.length; v2058++) {
      var v2059 = v2055[v2058];
      if (v2059.type === "infix") {
        if (v2056 !== -1) {
          throw new ParseError("only one infix operator per group", v2059.token);
        }
        v2056 = v2058;
        v2057 = v2059.replaceWith;
      }
    }
    if (v2056 !== -1 && v2057) {
      var v2060;
      var v2061;
      var v2062 = v2055.slice(0, v2056);
      var v2063 = v2055.slice(v2056 + 1);
      if (v2062.length === 1 && v2062[0].type === "ordgroup") {
        v2060 = v2062[0];
      } else {
        v2060 = {
          type: "ordgroup",
          mode: this.mode,
          body: v2062
        };
      }
      if (v2063.length === 1 && v2063[0].type === "ordgroup") {
        v2061 = v2063[0];
      } else {
        v2061 = {
          type: "ordgroup",
          mode: this.mode,
          body: v2063
        };
      }
      var v2064;
      if (v2057 === "\\\\abovefrac") {
        v2064 = this.callFunction(v2057, [v2060, v2055[v2056], v2061], []);
      } else {
        v2064 = this.callFunction(v2057, [v2060, v2061], []);
      }
      return [v2064];
    } else {
      return v2055;
    }
  }
  handleSupSubscript(v2065) {
    var v2066 = this.fetch();
    var v2067 = v2066.text;
    this.consume();
    this.consumeSpaces();
    var v2068;
    do {
      var v2069;
      v2068 = this.parseGroup(v2065);
    } while (((v2069 = v2068) == null ? undefined : v2069.type) === "internal");
    if (!v2068) {
      throw new ParseError("Expected group after '" + v2067 + "'", v2066);
    }
    return v2068;
  }
  formatUnsupportedCmd(v2070) {
    var v2071 = [];
    for (var v2072 = 0; v2072 < v2070.length; v2072++) {
      v2071.push({
        type: "textord",
        mode: "text",
        text: v2070[v2072]
      });
    }
    var v2073 = {
      type: "text",
      mode: this.mode,
      body: v2071
    };
    var v2074 = {
      type: "color",
      mode: this.mode,
      color: this.settings.errorColor,
      body: [v2073]
    };
    return v2074;
  }
  parseAtom(v2075) {
    var v2076 = this.parseGroup("atom", v2075);
    if ((v2076 == null ? undefined : v2076.type) === "internal") {
      return v2076;
    }
    if (this.mode === "text") {
      return v2076;
    }
    var v2077;
    var v2078;
    while (true) {
      this.consumeSpaces();
      var v2079 = this.fetch();
      if (v2079.text === "\\limits" || v2079.text === "\\nolimits") {
        if (v2076 && v2076.type === "op") {
          var v2080 = v2079.text === "\\limits";
          v2076.limits = v2080;
          v2076.alwaysHandleSupSub = true;
        } else if (v2076 && v2076.type === "operatorname") {
          if (v2076.alwaysHandleSupSub) {
            v2076.limits = v2079.text === "\\limits";
          }
        } else {
          throw new ParseError("Limit controls must follow a math operator", v2079);
        }
        this.consume();
      } else if (v2079.text === "^") {
        if (v2077) {
          throw new ParseError("Double superscript", v2079);
        }
        v2077 = this.handleSupSubscript("superscript");
      } else if (v2079.text === "_") {
        if (v2078) {
          throw new ParseError("Double subscript", v2079);
        }
        v2078 = this.handleSupSubscript("subscript");
      } else if (v2079.text === "'") {
        if (v2077) {
          throw new ParseError("Double superscript", v2079);
        }
        var v2081 = {
          type: "textord",
          mode: this.mode,
          text: "\\prime"
        };
        var v2082 = [v2081];
        this.consume();
        while (this.fetch().text === "'") {
          v2082.push(v2081);
          this.consume();
        }
        if (this.fetch().text === "^") {
          v2082.push(this.handleSupSubscript("superscript"));
        }
        v2077 = {
          type: "ordgroup",
          mode: this.mode,
          body: v2082
        };
      } else if (uSubsAndSups[v2079.text]) {
        var v2083 = unicodeSubRegEx.test(v2079.text);
        var v2084 = [];
        v2084.push(new Token(uSubsAndSups[v2079.text]));
        this.consume();
        while (true) {
          var v2085 = this.fetch().text;
          if (!uSubsAndSups[v2085]) {
            break;
          }
          if (unicodeSubRegEx.test(v2085) !== v2083) {
            break;
          }
          v2084.unshift(new Token(uSubsAndSups[v2085]));
          this.consume();
        }
        var v2086 = this.subparse(v2084);
        if (v2083) {
          v2078 = {
            type: "ordgroup",
            mode: "math",
            body: v2086
          };
        } else {
          v2077 = {
            type: "ordgroup",
            mode: "math",
            body: v2086
          };
        }
      } else {
        break;
      }
    }
    if (v2077 || v2078) {
      return {
        type: "supsub",
        mode: this.mode,
        base: v2076,
        sup: v2077,
        sub: v2078
      };
    } else {
      return v2076;
    }
  }
  parseFunction(v2087, v2088) {
    var v2089 = this.fetch();
    var v2090 = v2089.text;
    var v2091 = functions[v2090];
    if (!v2091) {
      return null;
    }
    this.consume();
    if (v2088 && v2088 !== "atom" && !v2091.allowedInArgument) {
      throw new ParseError("Got function '" + v2090 + "' with no arguments" + (v2088 ? " as " + v2088 : ""), v2089);
    } else if (this.mode === "text" && !v2091.allowedInText) {
      throw new ParseError("Can't use function '" + v2090 + "' in text mode", v2089);
    } else if (this.mode === "math" && v2091.allowedInMath === false) {
      throw new ParseError("Can't use function '" + v2090 + "' in math mode", v2089);
    }
    var {
      args: v2092,
      optArgs: v2093
    } = this.parseArguments(v2090, v2091);
    return this.callFunction(v2090, v2092, v2093, v2089, v2087);
  }
  callFunction(v2094, v2095, v2096, v2097, v2098) {
    var v2099 = {
      funcName: v2094,
      parser: this,
      token: v2097,
      breakOnTokenText: v2098
    };
    var v2100 = functions[v2094];
    if (v2100 && v2100.handler) {
      return v2100.handler(v2099, v2095, v2096);
    } else {
      throw new ParseError("No function handler for " + v2094);
    }
  }
  parseArguments(v2101, v2102) {
    var v2103 = v2102.numArgs + v2102.numOptionalArgs;
    if (v2103 === 0) {
      return {
        args: [],
        optArgs: []
      };
    }
    var v2104 = [];
    var v2105 = [];
    for (var v2106 = 0; v2106 < v2103; v2106++) {
      var v2107 = v2102.argTypes && v2102.argTypes[v2106];
      var v2108 = v2106 < v2102.numOptionalArgs;
      if ("primitive" in v2102 && v2102.primitive && v2107 == null || v2102.type === "sqrt" && v2106 === 1 && v2105[0] == null) {
        v2107 = "primitive";
      }
      var v2109 = this.parseGroupOfType("argument to '" + v2101 + "'", v2107, v2108);
      if (v2108) {
        v2105.push(v2109);
      } else if (v2109 != null) {
        v2104.push(v2109);
      } else {
        throw new ParseError("Null argument, please report this as a bug");
      }
    }
    return {
      args: v2104,
      optArgs: v2105
    };
  }
  parseGroupOfType(v2110, v2111, v2112) {
    switch (v2111) {
      case "color":
        return this.parseColorGroup(v2112);
      case "size":
        return this.parseSizeGroup(v2112);
      case "url":
        return this.parseUrlGroup(v2112);
      case "math":
      case "text":
        return this.parseArgumentGroup(v2112, v2111);
      case "hbox":
        {
          var v2113 = this.parseArgumentGroup(v2112, "text");
          if (v2113 != null) {
            return {
              type: "styling",
              mode: v2113.mode,
              body: [v2113],
              style: "text",
              resetFont: true
            };
          } else {
            return null;
          }
        }
      case "raw":
        {
          var v2114 = this.parseStringGroup("raw", v2112);
          if (v2114 != null) {
            return {
              type: "raw",
              mode: "text",
              string: v2114.text
            };
          } else {
            return null;
          }
        }
      case "primitive":
        {
          if (v2112) {
            throw new ParseError("A primitive argument cannot be optional");
          }
          var v2115 = this.parseGroup(v2110);
          if (v2115 == null) {
            throw new ParseError("Expected group as " + v2110, this.fetch());
          }
          return v2115;
        }
      case "original":
      case null:
      case undefined:
        return this.parseArgumentGroup(v2112);
      default:
        throw new ParseError("Unknown group type as " + v2110, this.fetch());
    }
  }
  consumeSpaces() {
    while (this.fetch().text === " ") {
      this.consume();
    }
  }
  parseStringGroup(v2116, v2117) {
    var v2118 = this.gullet.scanArgument(v2117);
    if (v2118 == null) {
      return null;
    }
    var v2119 = "";
    var v2120;
    while ((v2120 = this.fetch()).text !== "EOF") {
      v2119 += v2120.text;
      this.consume();
    }
    this.consume();
    v2118.text = v2119;
    return v2118;
  }
  parseRegexGroup(v2121, v2122) {
    var v2123 = this.fetch();
    var v2124 = v2123;
    var v2125 = "";
    var v2126;
    while ((v2126 = this.fetch()).text !== "EOF" && v2121.test(v2125 + v2126.text)) {
      v2124 = v2126;
      v2125 += v2124.text;
      this.consume();
    }
    if (v2125 === "") {
      throw new ParseError("Invalid " + v2122 + ": '" + v2123.text + "'", v2123);
    }
    return v2123.range(v2124, v2125);
  }
  parseColorGroup(v2127) {
    var v2128 = this.parseStringGroup("color", v2127);
    if (v2128 == null) {
      return null;
    }
    var v2129 = /^(#[a-f0-9]{3,4}|#[a-f0-9]{6}|#[a-f0-9]{8}|[a-f0-9]{6}|[a-z]+)$/i.exec(v2128.text);
    if (!v2129) {
      throw new ParseError("Invalid color: '" + v2128.text + "'", v2128);
    }
    var v2130 = v2129[0];
    if (/^[0-9a-f]{6}$/i.test(v2130)) {
      v2130 = "#" + v2130;
    }
    return {
      type: "color-token",
      mode: this.mode,
      color: v2130
    };
  }
  parseSizeGroup(v2131) {
    var v2132;
    var v2133 = false;
    this.gullet.consumeSpaces();
    if (!v2131 && this.gullet.future().text !== "{") {
      v2132 = this.parseRegexGroup(/^[-+]? *(?:$|\d+|\d+\.\d*|\.\d*) *[a-z]{0,2} *$/, "size");
    } else {
      v2132 = this.parseStringGroup("size", v2131);
    }
    if (!v2132) {
      return null;
    }
    if (!v2131 && v2132.text.length === 0) {
      v2132.text = "0pt";
      v2133 = true;
    }
    var v2134 = /([-+]?) *(\d+(?:\.\d*)?|\.\d+) *([a-z]{2})/.exec(v2132.text);
    if (!v2134) {
      throw new ParseError("Invalid size: '" + v2132.text + "'", v2132);
    }
    var v2135 = {
      number: +(v2134[1] + v2134[2]),
      unit: v2134[3]
    };
    if (!validUnit(v2135)) {
      throw new ParseError("Invalid unit: '" + v2135.unit + "'", v2132);
    }
    return {
      type: "size",
      mode: this.mode,
      value: v2135,
      isBlank: v2133
    };
  }
  parseUrlGroup(v2136) {
    this.gullet.lexer.setCatcode("%", 13);
    this.gullet.lexer.setCatcode("~", 12);
    var v2137 = this.parseStringGroup("url", v2136);
    this.gullet.lexer.setCatcode("%", 14);
    this.gullet.lexer.setCatcode("~", 13);
    if (v2137 == null) {
      return null;
    }
    var v2138 = v2137.text.replace(/\\([#$%&~_^{}])/g, "$1");
    return {
      type: "url",
      mode: this.mode,
      url: v2138
    };
  }
  parseArgumentGroup(v2139, v2140) {
    var v2141 = this.gullet.scanArgument(v2139);
    if (v2141 == null) {
      return null;
    }
    var v2142 = this.mode;
    if (v2140) {
      this.switchMode(v2140);
    }
    this.gullet.beginGroup();
    var v2143 = this.parseExpression(false, "EOF");
    this.expect("EOF");
    this.gullet.endGroup();
    var v2144 = {
      type: "ordgroup",
      mode: this.mode,
      loc: v2141.loc,
      body: v2143
    };
    if (v2140) {
      this.switchMode(v2142);
    }
    return v2144;
  }
  parseGroup(v2145, v2146) {
    var v2147 = this.fetch();
    var v2148 = v2147.text;
    var v2149;
    if (v2148 === "{" || v2148 === "\\begingroup") {
      this.consume();
      var v2150 = v2148 === "{" ? "}" : "\\endgroup";
      this.gullet.beginGroup();
      var v2151 = this.parseExpression(false, v2150);
      var v2152 = this.fetch();
      this.expect(v2150);
      this.gullet.endGroup();
      v2149 = {
        type: "ordgroup",
        mode: this.mode,
        loc: SourceLocation.range(v2147, v2152),
        body: v2151,
        semisimple: v2148 === "\\begingroup" || undefined
      };
    } else {
      v2149 = this.parseFunction(v2146, v2145) || this.parseSymbol();
      if (v2149 == null && v2148[0] === "\\" && !implicitCommands.hasOwnProperty(v2148)) {
        if (this.settings.throwOnError) {
          throw new ParseError("Undefined control sequence: " + v2148, v2147);
        }
        v2149 = this.formatUnsupportedCmd(v2148);
        this.consume();
      }
    }
    return v2149;
  }
  formLigatures(v2153) {
    var v2154 = v2153.length - 1;
    for (var v2155 = 0; v2155 < v2154; ++v2155) {
      var v2156 = v2153[v2155];
      if (v2156.type !== "textord") {
        continue;
      }
      var v2157 = v2156.text;
      var v2158 = v2153[v2155 + 1];
      if (!v2158 || v2158.type !== "textord") {
        continue;
      }
      if (v2157 === "-" && v2158.text === "-") {
        var v2159 = v2153[v2155 + 2];
        if (v2155 + 1 < v2154 && v2159 && v2159.type === "textord" && v2159.text === "-") {
          v2153.splice(v2155, 3, {
            type: "textord",
            mode: "text",
            loc: SourceLocation.range(v2156, v2159),
            text: "---"
          });
          v2154 -= 2;
        } else {
          v2153.splice(v2155, 2, {
            type: "textord",
            mode: "text",
            loc: SourceLocation.range(v2156, v2158),
            text: "--"
          });
          v2154 -= 1;
        }
      }
      if ((v2157 === "'" || v2157 === "`") && v2158.text === v2157) {
        v2153.splice(v2155, 2, {
          type: "textord",
          mode: "text",
          loc: SourceLocation.range(v2156, v2158),
          text: v2157 + v2157
        });
        v2154 -= 1;
      }
    }
  }
  parseSymbol() {
    var v2160 = this.fetch();
    var v2161 = v2160.text;
    if (/^\\verb[^a-zA-Z]/.test(v2161)) {
      this.consume();
      var v2162 = v2161.slice(5);
      var v2163 = v2162.charAt(0) === "*";
      if (v2163) {
        v2162 = v2162.slice(1);
      }
      if (v2162.length < 2 || v2162.charAt(0) !== v2162.slice(-1)) {
        throw new ParseError("\\verb assertion failed --\n                    please report what input caused this bug");
      }
      v2162 = v2162.slice(1, -1);
      return {
        type: "verb",
        mode: "text",
        body: v2162,
        star: v2163
      };
    }
    if (unicodeSymbols.hasOwnProperty(v2161[0]) && !symbols[this.mode][v2161[0]]) {
      if (this.settings.strict && this.mode === "math") {
        this.settings.reportNonstrict("unicodeTextInMathMode", "Accented Unicode text character \"" + v2161[0] + "\" used in math mode", v2160);
      }
      v2161 = unicodeSymbols[v2161[0]] + v2161.slice(1);
    }
    var v2164 = combiningDiacriticalMarksEndRegex.exec(v2161);
    if (v2164) {
      v2161 = v2161.substring(0, v2164.index);
      if (v2161 === "i") {
        v2161 = "ı";
      } else if (v2161 === "j") {
        v2161 = "ȷ";
      }
    }
    var v2165;
    if (symbols[this.mode][v2161]) {
      if (this.settings.strict && this.mode === "math" && extraLatin.includes(v2161)) {
        this.settings.reportNonstrict("unicodeTextInMathMode", "Latin-1/Unicode text character \"" + v2161[0] + "\" used in math mode", v2160);
      }
      var v2166 = symbols[this.mode][v2161].group;
      var v2167 = SourceLocation.range(v2160);
      var v2168;
      if (isAtom(v2166)) {
        v2168 = {
          type: "atom",
          mode: this.mode,
          family: v2166,
          loc: v2167,
          text: v2161
        };
      } else {
        v2168 = {
          type: v2166,
          mode: this.mode,
          loc: v2167,
          text: v2161
        };
      }
      v2165 = v2168;
    } else if (v2161.charCodeAt(0) >= 128) {
      if (this.settings.strict) {
        if (!supportedCodepoint(v2161.charCodeAt(0))) {
          this.settings.reportNonstrict("unknownSymbol", "Unrecognized Unicode character \"" + v2161[0] + "\"" + (" (" + v2161.charCodeAt(0) + ")"), v2160);
        } else if (this.mode === "math") {
          this.settings.reportNonstrict("unicodeTextInMathMode", "Unicode text character \"" + v2161[0] + "\" used in math mode", v2160);
        }
      }
      v2165 = {
        type: "textord",
        mode: "text",
        loc: SourceLocation.range(v2160),
        text: v2161
      };
    } else {
      return null;
    }
    this.consume();
    if (v2164) {
      for (var v2169 = 0; v2169 < v2164[0].length; v2169++) {
        var v2170 = v2164[0][v2169];
        if (!unicodeAccents[v2170]) {
          throw new ParseError("Unknown accent ' " + v2170 + "'", v2160);
        }
        var v2171 = unicodeAccents[v2170][this.mode] || unicodeAccents[v2170].text;
        if (!v2171) {
          throw new ParseError("Accent " + v2170 + " unsupported in " + this.mode + " mode", v2160);
        }
        v2165 = {
          type: "accent",
          mode: this.mode,
          loc: SourceLocation.range(v2160),
          label: v2171,
          isStretchy: false,
          isShifty: true,
          base: v2165
        };
      }
    }
    return v2165;
  }
}
Parser.endOfExpression = new Set(["}", "\\endgroup", "\\end", "\\right", "&"]);
var parseTree = function parseTree2(v2172, v2173) {
  if (typeof v2172 !== "string" && !(v2172 instanceof String)) {
    throw new TypeError("KaTeX can only parse string typed expression");
  }
  var v2174 = new Parser(v2172, v2173);
  delete v2174.gullet.macros.current["\\df@tag"];
  var v2175 = v2174.parse();
  delete v2174.gullet.macros.current["\\current@color"];
  delete v2174.gullet.macros.current["\\color"];
  if (v2174.gullet.macros.get("\\df@tag")) {
    if (!v2173.displayMode) {
      throw new ParseError("\\tag works only in display equations");
    }
    v2175 = [{
      type: "tag",
      mode: "text",
      body: v2175,
      tag: v2174.subparse([new Token("\\df@tag")])
    }];
  }
  return v2175;
};
var render = function render2(v2176, v2177, v2178) {
  v2177.textContent = "";
  var v2179 = renderToDomTree(v2176, v2178).toNode();
  v2177.appendChild(v2179);
};
if (typeof document !== "undefined") {
  if (document.compatMode !== "CSS1Compat") {
    if (typeof console !== "undefined") {
      console.warn("Warning: KaTeX doesn't work in quirks mode. Make sure your website has a suitable doctype.");
    }
    render = function render3() {
      throw new ParseError("KaTeX doesn't work in quirks mode.");
    };
  }
}
var renderToString = function renderToString2(v2180, v2181) {
  var v2182 = renderToDomTree(v2180, v2181).toMarkup();
  return v2182;
};
var generateParseTree = function generateParseTree2(v2183, v2184) {
  var v2185 = new Settings(v2184);
  return parseTree(v2183, v2185);
};
var renderError = function renderError2(v2186, v2187, v2188) {
  if (v2188.throwOnError || !(v2186 instanceof ParseError)) {
    throw v2186;
  }
  var v2189 = makeSpan(["katex-error"], [new SymbolNode(v2187)]);
  v2189.setAttribute("title", v2186.toString());
  v2189.setAttribute("style", "color:" + v2188.errorColor);
  return v2189;
};
var renderToDomTree = function renderToDomTree2(v2190, v2191) {
  var v2192 = new Settings(v2191);
  try {
    var v2193 = parseTree(v2190, v2192);
    return buildTree(v2193, v2190, v2192);
  } catch (v2194) {
    return renderError(v2194, v2190, v2192);
  }
};
var renderToHTMLTree = function renderToHTMLTree2(v2195, v2196) {
  var v2197 = new Settings(v2196);
  try {
    var v2198 = parseTree(v2195, v2197);
    return buildHTMLTree(v2198, v2195, v2197);
  } catch (v2199) {
    return renderError(v2199, v2195, v2197);
  }
};
var version = "0.16.47";
var __domTree = {
  Span: Span,
  Anchor: Anchor,
  SymbolNode: SymbolNode,
  SvgNode: SvgNode,
  PathNode: PathNode,
  LineNode: LineNode
};
var katex = {
  version: version,
  render: render,
  renderToString: renderToString,
  ParseError: ParseError,
  SETTINGS_SCHEMA: SETTINGS_SCHEMA,
  __parse: generateParseTree,
  __renderToDomTree: renderToDomTree,
  __renderToHTMLTree: renderToHTMLTree,
  __setFontMetrics: setFontMetrics,
  __defineSymbol: defineSymbol,
  __defineFunction: defineFunction,
  __defineMacro: defineMacro,
  __domTree: __domTree
};
export { ParseError, SETTINGS_SCHEMA, defineFunction as __defineFunction, defineMacro as __defineMacro, defineSymbol as __defineSymbol, __domTree, generateParseTree as __parse, renderToDomTree as __renderToDomTree, renderToHTMLTree as __renderToHTMLTree, setFontMetrics as __setFontMetrics, katex as default, render, renderToString, version };