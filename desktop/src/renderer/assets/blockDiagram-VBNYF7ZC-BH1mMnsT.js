import { g as v1 } from "./chunk-5VM5RSS4-Cbnyy23B.js";
import { aB as v2, aC as v3, aD as v4, aE as v5, aF as v6, aG as v7, aH as v8, aI as v9, aJ as v10, aK as v11, aL as v12, aM as v13, aN as v14, aO as v15, aP as v16, aQ as v17, aR as v18, aS as v19, aT as v20, aU as v21, aV as v22, aW as v23, aX as v24, aY as v25, aZ as v26, _ as v27, y as v28, d as v29, e as v30, l as v31, p as v32, r as v33, c as v34, a_ as v35, P as v36, Q as v37, L as v38, a$ as v39, b0 as v40, b1 as v41, as as v42, x as v43, k as v44, b2 as v45, i as v46, b3 as v47, b4 as v48 } from "./index-CXb3UsfP.js";
import { G as v49 } from "./graph-BMLV0goG.js";
import { c as v50 } from "./channel-zu66cFrq.js";
function isArray(v51) {
  return Array.isArray(v51);
}
function clone(v52) {
  if (v2(v52)) {
    return v52;
  }
  const v53 = v3(v52);
  if (!isCloneableObject(v52)) {
    return {};
  }
  if (isArray(v52)) {
    const v54 = Array.from(v52);
    if (v52.length > 0 && typeof v52[0] === "string" && Object.hasOwn(v52, "index")) {
      v54.index = v52.index;
      v54.input = v52.input;
    }
    return v54;
  }
  if (v4(v52)) {
    const v55 = v52;
    const v56 = v55.constructor;
    return new v56(v55.buffer, v55.byteOffset, v55.length);
  }
  if (v53 === "[object ArrayBuffer]") {
    return new ArrayBuffer(v52.byteLength);
  }
  if (v53 === "[object DataView]") {
    const v57 = v52;
    const v58 = v57.buffer;
    const v59 = v57.byteOffset;
    const v60 = v57.byteLength;
    const v61 = new ArrayBuffer(v60);
    const v62 = new Uint8Array(v58, v59, v60);
    new Uint8Array(v61).set(v62);
    return new DataView(v61);
  }
  if (v53 === "[object Boolean]" || v53 === "[object Number]" || v53 === "[object String]") {
    const v63 = v52.constructor;
    const v64 = new v63(v52.valueOf());
    if (v53 === "[object String]") {
      cloneStringObjectProperties(v64, v52);
    } else {
      copyOwnProperties(v64, v52);
    }
    return v64;
  }
  if (v53 === "[object Date]") {
    return new Date(Number(v52));
  }
  if (v53 === "[object RegExp]") {
    const v65 = v52;
    const v66 = new RegExp(v65.source, v65.flags);
    v66.lastIndex = v65.lastIndex;
    return v66;
  }
  if (v53 === "[object Symbol]") {
    return Object(Symbol.prototype.valueOf.call(v52));
  }
  if (v53 === "[object Map]") {
    const v67 = v52;
    const v68 = new Map();
    v67.forEach((v69, v70) => {
      v68.set(v70, v69);
    });
    return v68;
  }
  if (v53 === "[object Set]") {
    const v71 = v52;
    const v72 = new Set();
    v71.forEach(v73 => {
      v72.add(v73);
    });
    return v72;
  }
  if (v53 === "[object Arguments]") {
    const v74 = v52;
    const v75 = {};
    copyOwnProperties(v75, v74);
    v75.length = v74.length;
    v75[Symbol.iterator] = v74[Symbol.iterator];
    return v75;
  }
  const v76 = {};
  copyPrototype(v76, v52);
  copyOwnProperties(v76, v52);
  copySymbolProperties(v76, v52);
  return v76;
}
function isCloneableObject(v77) {
  switch (v3(v77)) {
    case v26:
    case v25:
    case v24:
    case v23:
    case v22:
    case v21:
    case v20:
    case v19:
    case v18:
    case v17:
    case v16:
    case v15:
    case v14:
    case v13:
    case v12:
    case v11:
    case v10:
    case v9:
    case v8:
    case v7:
    case v6:
    case v5:
      return true;
    default:
      return false;
  }
}
function copyOwnProperties(v78, v79) {
  for (const v80 in v79) {
    if (Object.hasOwn(v79, v80)) {
      v78[v80] = v79[v80];
    }
  }
}
function copySymbolProperties(v81, v82) {
  const v83 = Object.getOwnPropertySymbols(v82);
  for (let v84 = 0; v84 < v83.length; v84++) {
    const v85 = v83[v84];
    if (Object.prototype.propertyIsEnumerable.call(v82, v85)) {
      v81[v85] = v82[v85];
    }
  }
}
function cloneStringObjectProperties(v86, v87) {
  const v88 = v87.valueOf().length;
  for (const v89 in v87) {
    if (Object.hasOwn(v87, v89) && (Number.isNaN(Number(v89)) || Number(v89) >= v88)) {
      v86[v89] = v87[v89];
    }
  }
}
function copyPrototype(v90, v91) {
  const v92 = Object.getPrototypeOf(v91);
  if (v92 !== null) {
    if (typeof v91.constructor === "function") {
      Object.setPrototypeOf(v90, v92);
    }
  }
}
var parser = function () {
  var v93 = v27(function (v94, v95, v96, v97) {
    v96 = v96 || {};
    v97 = v94.length;
    for (; v97--; v96[v94[v97]] = v95);
    return v96;
  }, "o");
  var v98 = [1, 15];
  var v99 = [1, 7];
  var v100 = [1, 13];
  var v101 = [1, 14];
  var v102 = [1, 19];
  var v103 = [1, 16];
  var v104 = [1, 17];
  var v105 = [1, 18];
  var v106 = [8, 30];
  var v107 = [8, 10, 21, 28, 29, 30, 31, 39, 43, 46];
  var v108 = [1, 23];
  var v109 = [1, 24];
  var v110 = [8, 10, 15, 16, 21, 28, 29, 30, 31, 39, 43, 46];
  var v111 = [8, 10, 15, 16, 21, 27, 28, 29, 30, 31, 39, 43, 46];
  var v112 = [1, 49];
  var v113 = {
    trace: v27(function v114() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      spaceLines: 3,
      SPACELINE: 4,
      NL: 5,
      separator: 6,
      SPACE: 7,
      EOF: 8,
      start: 9,
      BLOCK_DIAGRAM_KEY: 10,
      document: 11,
      stop: 12,
      statement: 13,
      link: 14,
      LINK: 15,
      START_LINK: 16,
      LINK_LABEL: 17,
      STR: 18,
      nodeStatement: 19,
      columnsStatement: 20,
      SPACE_BLOCK: 21,
      blockStatement: 22,
      classDefStatement: 23,
      cssClassStatement: 24,
      styleStatement: 25,
      node: 26,
      SIZE: 27,
      COLUMNS: 28,
      "id-block": 29,
      end: 30,
      NODE_ID: 31,
      nodeShapeNLabel: 32,
      dirList: 33,
      DIR: 34,
      NODE_DSTART: 35,
      NODE_DEND: 36,
      BLOCK_ARROW_START: 37,
      BLOCK_ARROW_END: 38,
      classDef: 39,
      CLASSDEF_ID: 40,
      CLASSDEF_STYLEOPTS: 41,
      DEFAULT: 42,
      class: 43,
      CLASSENTITY_IDS: 44,
      STYLECLASS: 45,
      style: 46,
      STYLE_ENTITY_IDS: 47,
      STYLE_DEFINITION_DATA: 48,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      4: "SPACELINE",
      5: "NL",
      7: "SPACE",
      8: "EOF",
      10: "BLOCK_DIAGRAM_KEY",
      15: "LINK",
      16: "START_LINK",
      17: "LINK_LABEL",
      18: "STR",
      21: "SPACE_BLOCK",
      27: "SIZE",
      28: "COLUMNS",
      29: "id-block",
      30: "end",
      31: "NODE_ID",
      34: "DIR",
      35: "NODE_DSTART",
      36: "NODE_DEND",
      37: "BLOCK_ARROW_START",
      38: "BLOCK_ARROW_END",
      39: "classDef",
      40: "CLASSDEF_ID",
      41: "CLASSDEF_STYLEOPTS",
      42: "DEFAULT",
      43: "class",
      44: "CLASSENTITY_IDS",
      45: "STYLECLASS",
      46: "style",
      47: "STYLE_ENTITY_IDS",
      48: "STYLE_DEFINITION_DATA"
    },
    productions_: [0, [3, 1], [3, 2], [3, 2], [6, 1], [6, 1], [6, 1], [9, 3], [12, 1], [12, 1], [12, 2], [12, 2], [11, 1], [11, 2], [14, 1], [14, 4], [13, 1], [13, 1], [13, 1], [13, 1], [13, 1], [13, 1], [13, 1], [19, 3], [19, 2], [19, 1], [20, 1], [22, 4], [22, 3], [26, 1], [26, 2], [33, 1], [33, 2], [32, 3], [32, 4], [23, 3], [23, 3], [24, 3], [25, 3]],
    performAction: v27(function v115(v116, v117, v118, v119, v120, v121, v122) {
      var v123 = v121.length - 1;
      switch (v120) {
        case 4:
          v119.getLogger().debug("Rule: separator (NL) ");
          break;
        case 5:
          v119.getLogger().debug("Rule: separator (Space) ");
          break;
        case 6:
          v119.getLogger().debug("Rule: separator (EOF) ");
          break;
        case 7:
          v119.getLogger().debug("Rule: hierarchy: ", v121[v123 - 1]);
          v119.setHierarchy(v121[v123 - 1]);
          break;
        case 8:
          v119.getLogger().debug("Stop NL ");
          break;
        case 9:
          v119.getLogger().debug("Stop EOF ");
          break;
        case 10:
          v119.getLogger().debug("Stop NL2 ");
          break;
        case 11:
          v119.getLogger().debug("Stop EOF2 ");
          break;
        case 12:
          v119.getLogger().debug("Rule: statement: ", v121[v123]);
          if (typeof v121[v123].length === "number") {
            this.$ = v121[v123];
          } else {
            this.$ = [v121[v123]];
          }
          break;
        case 13:
          v119.getLogger().debug("Rule: statement #2: ", v121[v123 - 1]);
          this.$ = [v121[v123 - 1]].concat(v121[v123]);
          break;
        case 14:
          v119.getLogger().debug("Rule: link: ", v121[v123], v116);
          this.$ = {
            edgeTypeStr: v121[v123],
            label: ""
          };
          break;
        case 15:
          v119.getLogger().debug("Rule: LABEL link: ", v121[v123 - 3], v121[v123 - 1], v121[v123]);
          this.$ = {
            edgeTypeStr: v121[v123],
            label: v121[v123 - 1]
          };
          break;
        case 18:
          const v124 = parseInt(v121[v123]);
          const v125 = v119.generateId();
          this.$ = {
            id: v125,
            type: "space",
            label: "",
            width: v124,
            children: []
          };
          break;
        case 23:
          v119.getLogger().debug("Rule: (nodeStatement link node) ", v121[v123 - 2], v121[v123 - 1], v121[v123], " typestr: ", v121[v123 - 1].edgeTypeStr);
          const v126 = v119.edgeStrToEdgeData(v121[v123 - 1].edgeTypeStr);
          const v127 = v119.edgeStrToEdgeStartData(v121[v123 - 1].edgeTypeStr);
          const v128 = v119.edgeStrToThickness(v121[v123 - 1].edgeTypeStr);
          const v129 = v119.edgeStrToPattern(v121[v123 - 1].edgeTypeStr);
          this.$ = [{
            id: v121[v123 - 2].id,
            label: v121[v123 - 2].label,
            type: v121[v123 - 2].type,
            directions: v121[v123 - 2].directions
          }, {
            id: v121[v123 - 2].id + "-" + v121[v123].id,
            start: v121[v123 - 2].id,
            end: v121[v123].id,
            label: v121[v123 - 1].label,
            type: "edge",
            thickness: v128,
            pattern: v129,
            directions: v121[v123].directions,
            arrowTypeEnd: v126,
            arrowTypeStart: v127
          }, {
            id: v121[v123].id,
            label: v121[v123].label,
            type: v119.typeStr2Type(v121[v123].typeStr),
            directions: v121[v123].directions
          }];
          break;
        case 24:
          v119.getLogger().debug("Rule: nodeStatement (abc88 node size) ", v121[v123 - 1], v121[v123]);
          this.$ = {
            id: v121[v123 - 1].id,
            label: v121[v123 - 1].label,
            type: v119.typeStr2Type(v121[v123 - 1].typeStr),
            directions: v121[v123 - 1].directions,
            widthInColumns: parseInt(v121[v123], 10)
          };
          break;
        case 25:
          v119.getLogger().debug("Rule: nodeStatement (node) ", v121[v123]);
          this.$ = {
            id: v121[v123].id,
            label: v121[v123].label,
            type: v119.typeStr2Type(v121[v123].typeStr),
            directions: v121[v123].directions,
            widthInColumns: 1
          };
          break;
        case 26:
          v119.getLogger().debug("APA123", this ? this : "na");
          v119.getLogger().debug("COLUMNS: ", v121[v123]);
          this.$ = {
            type: "column-setting",
            columns: v121[v123] === "auto" ? -1 : parseInt(v121[v123])
          };
          break;
        case 27:
          v119.getLogger().debug("Rule: id-block statement : ", v121[v123 - 2], v121[v123 - 1]);
          v119.generateId();
          this.$ = {
            ...v121[v123 - 2],
            type: "composite",
            children: v121[v123 - 1]
          };
          break;
        case 28:
          v119.getLogger().debug("Rule: blockStatement : ", v121[v123 - 2], v121[v123 - 1], v121[v123]);
          const v130 = v119.generateId();
          this.$ = {
            id: v130,
            type: "composite",
            label: "",
            children: v121[v123 - 1]
          };
          break;
        case 29:
          v119.getLogger().debug("Rule: node (NODE_ID separator): ", v121[v123]);
          this.$ = {
            id: v121[v123]
          };
          break;
        case 30:
          v119.getLogger().debug("Rule: node (NODE_ID nodeShapeNLabel separator): ", v121[v123 - 1], v121[v123]);
          this.$ = {
            id: v121[v123 - 1],
            label: v121[v123].label,
            typeStr: v121[v123].typeStr,
            directions: v121[v123].directions
          };
          break;
        case 31:
          v119.getLogger().debug("Rule: dirList: ", v121[v123]);
          this.$ = [v121[v123]];
          break;
        case 32:
          v119.getLogger().debug("Rule: dirList: ", v121[v123 - 1], v121[v123]);
          this.$ = [v121[v123 - 1]].concat(v121[v123]);
          break;
        case 33:
          v119.getLogger().debug("Rule: nodeShapeNLabel: ", v121[v123 - 2], v121[v123 - 1], v121[v123]);
          this.$ = {
            typeStr: v121[v123 - 2] + v121[v123],
            label: v121[v123 - 1]
          };
          break;
        case 34:
          v119.getLogger().debug("Rule: BLOCK_ARROW nodeShapeNLabel: ", v121[v123 - 3], v121[v123 - 2], " #3:", v121[v123 - 1], v121[v123]);
          this.$ = {
            typeStr: v121[v123 - 3] + v121[v123],
            label: v121[v123 - 2],
            directions: v121[v123 - 1]
          };
          break;
        case 35:
        case 36:
          this.$ = {
            type: "classDef",
            id: v121[v123 - 1].trim(),
            css: v121[v123].trim()
          };
          break;
        case 37:
          this.$ = {
            type: "applyClass",
            id: v121[v123 - 1].trim(),
            styleClass: v121[v123].trim()
          };
          break;
        case 38:
          this.$ = {
            type: "applyStyles",
            id: v121[v123 - 1].trim(),
            stylesStr: v121[v123].trim()
          };
          break;
      }
    }, "anonymous"),
    table: [{
      9: 1,
      10: [1, 2]
    }, {
      1: [3]
    }, {
      10: v98,
      11: 3,
      13: 4,
      19: 5,
      20: 6,
      21: v99,
      22: 8,
      23: 9,
      24: 10,
      25: 11,
      26: 12,
      28: v100,
      29: v101,
      31: v102,
      39: v103,
      43: v104,
      46: v105
    }, {
      8: [1, 20]
    }, v93(v106, [2, 12], {
      13: 4,
      19: 5,
      20: 6,
      22: 8,
      23: 9,
      24: 10,
      25: 11,
      26: 12,
      11: 21,
      10: v98,
      21: v99,
      28: v100,
      29: v101,
      31: v102,
      39: v103,
      43: v104,
      46: v105
    }), v93(v107, [2, 16], {
      14: 22,
      15: v108,
      16: v109
    }), v93(v107, [2, 17]), v93(v107, [2, 18]), v93(v107, [2, 19]), v93(v107, [2, 20]), v93(v107, [2, 21]), v93(v107, [2, 22]), v93(v110, [2, 25], {
      27: [1, 25]
    }), v93(v107, [2, 26]), {
      19: 26,
      26: 12,
      31: v102
    }, {
      10: v98,
      11: 27,
      13: 4,
      19: 5,
      20: 6,
      21: v99,
      22: 8,
      23: 9,
      24: 10,
      25: 11,
      26: 12,
      28: v100,
      29: v101,
      31: v102,
      39: v103,
      43: v104,
      46: v105
    }, {
      40: [1, 28],
      42: [1, 29]
    }, {
      44: [1, 30]
    }, {
      47: [1, 31]
    }, v93(v111, [2, 29], {
      32: 32,
      35: [1, 33],
      37: [1, 34]
    }), {
      1: [2, 7]
    }, v93(v106, [2, 13]), {
      26: 35,
      31: v102
    }, {
      31: [2, 14]
    }, {
      17: [1, 36]
    }, v93(v110, [2, 24]), {
      10: v98,
      11: 37,
      13: 4,
      14: 22,
      15: v108,
      16: v109,
      19: 5,
      20: 6,
      21: v99,
      22: 8,
      23: 9,
      24: 10,
      25: 11,
      26: 12,
      28: v100,
      29: v101,
      31: v102,
      39: v103,
      43: v104,
      46: v105
    }, {
      30: [1, 38]
    }, {
      41: [1, 39]
    }, {
      41: [1, 40]
    }, {
      45: [1, 41]
    }, {
      48: [1, 42]
    }, v93(v111, [2, 30]), {
      18: [1, 43]
    }, {
      18: [1, 44]
    }, v93(v110, [2, 23]), {
      18: [1, 45]
    }, {
      30: [1, 46]
    }, v93(v107, [2, 28]), v93(v107, [2, 35]), v93(v107, [2, 36]), v93(v107, [2, 37]), v93(v107, [2, 38]), {
      36: [1, 47]
    }, {
      33: 48,
      34: v112
    }, {
      15: [1, 50]
    }, v93(v107, [2, 27]), v93(v111, [2, 33]), {
      38: [1, 51]
    }, {
      33: 52,
      34: v112,
      38: [2, 31]
    }, {
      31: [2, 15]
    }, v93(v111, [2, 34]), {
      38: [2, 32]
    }],
    defaultActions: {
      20: [2, 7],
      23: [2, 14],
      50: [2, 15],
      52: [2, 32]
    },
    parseError: v27(function v131(v132, v133) {
      if (v133.recoverable) {
        this.trace(v132);
      } else {
        var v134 = new Error(v132);
        v134.hash = v133;
        throw v134;
      }
    }, "parseError"),
    parse: v27(function v135(v136) {
      var v137 = this;
      var v138 = [0];
      var v139 = [];
      var v140 = [null];
      var v141 = [];
      var v142 = this.table;
      var v143 = "";
      var v144 = 0;
      var v145 = 0;
      var v146 = 2;
      var v147 = 1;
      var v148 = v141.slice.call(arguments, 1);
      var v149 = Object.create(this.lexer);
      var v150 = {
        yy: {}
      };
      for (var v151 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v151)) {
          v150.yy[v151] = this.yy[v151];
        }
      }
      v149.setInput(v136, v150.yy);
      v150.yy.lexer = v149;
      v150.yy.parser = this;
      if (typeof v149.yylloc == "undefined") {
        v149.yylloc = {};
      }
      var v152 = v149.yylloc;
      v141.push(v152);
      var v153 = v149.options && v149.options.ranges;
      if (typeof v150.yy.parseError === "function") {
        this.parseError = v150.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v154(v155) {
        v138.length = v138.length - v155 * 2;
        v140.length = v140.length - v155;
        v141.length = v141.length - v155;
      }
      v27(v154, "popStack");
      function v156() {
        var v157;
        v157 = v139.pop() || v149.lex() || v147;
        if (typeof v157 !== "number") {
          if (v157 instanceof Array) {
            v139 = v157;
            v157 = v139.pop();
          }
          v157 = v137.symbols_[v157] || v157;
        }
        return v157;
      }
      v27(v156, "lex");
      var v158;
      var v159;
      var v160;
      var v161;
      var v162 = {};
      var v163;
      var v164;
      var v165;
      var v166;
      while (true) {
        v159 = v138[v138.length - 1];
        if (this.defaultActions[v159]) {
          v160 = this.defaultActions[v159];
        } else {
          if (v158 === null || typeof v158 == "undefined") {
            v158 = v156();
          }
          v160 = v142[v159] && v142[v159][v158];
        }
        if (typeof v160 === "undefined" || !v160.length || !v160[0]) {
          var v167 = "";
          v166 = [];
          for (v163 in v142[v159]) {
            if (this.terminals_[v163] && v163 > v146) {
              v166.push("'" + this.terminals_[v163] + "'");
            }
          }
          if (v149.showPosition) {
            v167 = "Parse error on line " + (v144 + 1) + ":\n" + v149.showPosition() + "\nExpecting " + v166.join(", ") + ", got '" + (this.terminals_[v158] || v158) + "'";
          } else {
            v167 = "Parse error on line " + (v144 + 1) + ": Unexpected " + (v158 == v147 ? "end of input" : "'" + (this.terminals_[v158] || v158) + "'");
          }
          this.parseError(v167, {
            text: v149.match,
            token: this.terminals_[v158] || v158,
            line: v149.yylineno,
            loc: v152,
            expected: v166
          });
        }
        if (v160[0] instanceof Array && v160.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v159 + ", token: " + v158);
        }
        switch (v160[0]) {
          case 1:
            v138.push(v158);
            v140.push(v149.yytext);
            v141.push(v149.yylloc);
            v138.push(v160[1]);
            v158 = null;
            {
              v145 = v149.yyleng;
              v143 = v149.yytext;
              v144 = v149.yylineno;
              v152 = v149.yylloc;
            }
            break;
          case 2:
            v164 = this.productions_[v160[1]][1];
            v162.$ = v140[v140.length - v164];
            v162._$ = {
              first_line: v141[v141.length - (v164 || 1)].first_line,
              last_line: v141[v141.length - 1].last_line,
              first_column: v141[v141.length - (v164 || 1)].first_column,
              last_column: v141[v141.length - 1].last_column
            };
            if (v153) {
              v162._$.range = [v141[v141.length - (v164 || 1)].range[0], v141[v141.length - 1].range[1]];
            }
            v161 = this.performAction.apply(v162, [v143, v145, v144, v150.yy, v160[1], v140, v141].concat(v148));
            if (typeof v161 !== "undefined") {
              return v161;
            }
            if (v164) {
              v138 = v138.slice(0, v164 * -1 * 2);
              v140 = v140.slice(0, v164 * -1);
              v141 = v141.slice(0, v164 * -1);
            }
            v138.push(this.productions_[v160[1]][0]);
            v140.push(v162.$);
            v141.push(v162._$);
            v165 = v142[v138[v138.length - 2]][v138[v138.length - 1]];
            v138.push(v165);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v168 = function () {
    var v169 = {
      EOF: 1,
      parseError: v27(function v170(v171, v172) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v171, v172);
        } else {
          throw new Error(v171);
        }
      }, "parseError"),
      setInput: v27(function (v173, v174) {
        this.yy = v174 || this.yy || {};
        this._input = v173;
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
      input: v27(function () {
        var v175 = this._input[0];
        this.yytext += v175;
        this.yyleng++;
        this.offset++;
        this.match += v175;
        this.matched += v175;
        var v176 = v175.match(/(?:\r\n?|\n).*/g);
        if (v176) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v175;
      }, "input"),
      unput: v27(function (v177) {
        var v178 = v177.length;
        var v179 = v177.split(/(?:\r\n?|\n)/g);
        this._input = v177 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v178);
        this.offset -= v178;
        var v180 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v179.length - 1) {
          this.yylineno -= v179.length - 1;
        }
        var v181 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v179 ? (v179.length === v180.length ? this.yylloc.first_column : 0) + v180[v180.length - v179.length].length - v179[0].length : this.yylloc.first_column - v178
        };
        if (this.options.ranges) {
          this.yylloc.range = [v181[0], v181[0] + this.yyleng - v178];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v27(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v27(function () {
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
      less: v27(function (v182) {
        this.unput(this.match.slice(v182));
      }, "less"),
      pastInput: v27(function () {
        var v183 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v183.length > 20 ? "..." : "") + v183.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v27(function () {
        var v184 = this.match;
        if (v184.length < 20) {
          v184 += this._input.substr(0, 20 - v184.length);
        }
        return (v184.substr(0, 20) + (v184.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v27(function () {
        var v185 = this.pastInput();
        var v186 = new Array(v185.length + 1).join("-");
        return v185 + this.upcomingInput() + "\n" + v186 + "^";
      }, "showPosition"),
      test_match: v27(function (v187, v188) {
        var v189;
        var v190;
        var v191;
        if (this.options.backtrack_lexer) {
          v191 = {
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
            v191.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v190 = v187[0].match(/(?:\r\n?|\n).*/g);
        if (v190) {
          this.yylineno += v190.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v190 ? v190[v190.length - 1].length - v190[v190.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v187[0].length
        };
        this.yytext += v187[0];
        this.match += v187[0];
        this.matches = v187;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v187[0].length);
        this.matched += v187[0];
        v189 = this.performAction.call(this, this.yy, this, v188, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v189) {
          return v189;
        } else if (this._backtrack) {
          for (var v192 in v191) {
            this[v192] = v191[v192];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v27(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v193;
        var v194;
        var v195;
        var v196;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v197 = this._currentRules();
        for (var v198 = 0; v198 < v197.length; v198++) {
          v195 = this._input.match(this.rules[v197[v198]]);
          if (v195 && (!v194 || v195[0].length > v194[0].length)) {
            v194 = v195;
            v196 = v198;
            if (this.options.backtrack_lexer) {
              v193 = this.test_match(v195, v197[v198]);
              if (v193 !== false) {
                return v193;
              } else if (this._backtrack) {
                v194 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v194) {
          v193 = this.test_match(v194, v197[v196]);
          if (v193 !== false) {
            return v193;
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
      lex: v27(function v199() {
        var v200 = this.next();
        if (v200) {
          return v200;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v27(function v201(v202) {
        this.conditionStack.push(v202);
      }, "begin"),
      popState: v27(function v203() {
        var v204 = this.conditionStack.length - 1;
        if (v204 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v27(function v205() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v27(function v206(v207) {
        v207 = this.conditionStack.length - 1 - Math.abs(v207 || 0);
        if (v207 >= 0) {
          return this.conditionStack[v207];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v27(function v208(v209) {
        this.begin(v209);
      }, "pushState"),
      stateStackSize: v27(function v210() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {},
      performAction: v27(function v211(v212, v213, v214, v215) {
        switch (v214) {
          case 0:
            v212.getLogger().debug("Found block-beta");
            return 10;
          case 1:
            v212.getLogger().debug("Found id-block");
            return 29;
          case 2:
            v212.getLogger().debug("Found block");
            return 10;
          case 3:
            v212.getLogger().debug(".", v213.yytext);
            break;
          case 4:
            v212.getLogger().debug("_", v213.yytext);
            break;
          case 5:
            return 5;
          case 6:
            v213.yytext = -1;
            return 28;
          case 7:
            v213.yytext = v213.yytext.replace(/columns\s+/, "");
            v212.getLogger().debug("COLUMNS (LEX)", v213.yytext);
            return 28;
          case 8:
            this.pushState("md_string");
            break;
          case 9:
            return "MD_STR";
          case 10:
            this.popState();
            break;
          case 11:
            this.pushState("string");
            break;
          case 12:
            v212.getLogger().debug("LEX: POPPING STR:", v213.yytext);
            this.popState();
            break;
          case 13:
            v212.getLogger().debug("LEX: STR end:", v213.yytext);
            return "STR";
          case 14:
            v213.yytext = v213.yytext.replace(/space\:/, "");
            v212.getLogger().debug("SPACE NUM (LEX)", v213.yytext);
            return 21;
          case 15:
            v213.yytext = "1";
            v212.getLogger().debug("COLUMNS (LEX)", v213.yytext);
            return 21;
          case 16:
            return 42;
          case 17:
            return "LINKSTYLE";
          case 18:
            return "INTERPOLATE";
          case 19:
            this.pushState("CLASSDEF");
            return 39;
          case 20:
            this.popState();
            this.pushState("CLASSDEFID");
            return "DEFAULT_CLASSDEF_ID";
          case 21:
            this.popState();
            this.pushState("CLASSDEFID");
            return 40;
          case 22:
            this.popState();
            return 41;
          case 23:
            this.pushState("CLASS");
            return 43;
          case 24:
            this.popState();
            this.pushState("CLASS_STYLE");
            return 44;
          case 25:
            this.popState();
            return 45;
          case 26:
            this.pushState("STYLE_STMNT");
            return 46;
          case 27:
            this.popState();
            this.pushState("STYLE_DEFINITION");
            return 47;
          case 28:
            this.popState();
            return 48;
          case 29:
            this.pushState("acc_title");
            return "acc_title";
          case 30:
            this.popState();
            return "acc_title_value";
          case 31:
            this.pushState("acc_descr");
            return "acc_descr";
          case 32:
            this.popState();
            return "acc_descr_value";
          case 33:
            this.pushState("acc_descr_multiline");
            break;
          case 34:
            this.popState();
            break;
          case 35:
            return "acc_descr_multiline_value";
          case 36:
            return 30;
          case 37:
            this.popState();
            v212.getLogger().debug("Lex: ((");
            return "NODE_DEND";
          case 38:
            this.popState();
            v212.getLogger().debug("Lex: ((");
            return "NODE_DEND";
          case 39:
            this.popState();
            v212.getLogger().debug("Lex: ))");
            return "NODE_DEND";
          case 40:
            this.popState();
            v212.getLogger().debug("Lex: ((");
            return "NODE_DEND";
          case 41:
            this.popState();
            v212.getLogger().debug("Lex: ((");
            return "NODE_DEND";
          case 42:
            this.popState();
            v212.getLogger().debug("Lex: (-");
            return "NODE_DEND";
          case 43:
            this.popState();
            v212.getLogger().debug("Lex: -)");
            return "NODE_DEND";
          case 44:
            this.popState();
            v212.getLogger().debug("Lex: ((");
            return "NODE_DEND";
          case 45:
            this.popState();
            v212.getLogger().debug("Lex: ]]");
            return "NODE_DEND";
          case 46:
            this.popState();
            v212.getLogger().debug("Lex: (");
            return "NODE_DEND";
          case 47:
            this.popState();
            v212.getLogger().debug("Lex: ])");
            return "NODE_DEND";
          case 48:
            this.popState();
            v212.getLogger().debug("Lex: /]");
            return "NODE_DEND";
          case 49:
            this.popState();
            v212.getLogger().debug("Lex: /]");
            return "NODE_DEND";
          case 50:
            this.popState();
            v212.getLogger().debug("Lex: )]");
            return "NODE_DEND";
          case 51:
            this.popState();
            v212.getLogger().debug("Lex: )");
            return "NODE_DEND";
          case 52:
            this.popState();
            v212.getLogger().debug("Lex: ]>");
            return "NODE_DEND";
          case 53:
            this.popState();
            v212.getLogger().debug("Lex: ]");
            return "NODE_DEND";
          case 54:
            v212.getLogger().debug("Lexa: -)");
            this.pushState("NODE");
            return 35;
          case 55:
            v212.getLogger().debug("Lexa: (-");
            this.pushState("NODE");
            return 35;
          case 56:
            v212.getLogger().debug("Lexa: ))");
            this.pushState("NODE");
            return 35;
          case 57:
            v212.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
          case 58:
            v212.getLogger().debug("Lex: (((");
            this.pushState("NODE");
            return 35;
          case 59:
            v212.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
          case 60:
            v212.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
          case 61:
            v212.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
          case 62:
            v212.getLogger().debug("Lexc: >");
            this.pushState("NODE");
            return 35;
          case 63:
            v212.getLogger().debug("Lexa: ([");
            this.pushState("NODE");
            return 35;
          case 64:
            v212.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
          case 65:
            this.pushState("NODE");
            return 35;
          case 66:
            this.pushState("NODE");
            return 35;
          case 67:
            this.pushState("NODE");
            return 35;
          case 68:
            this.pushState("NODE");
            return 35;
          case 69:
            this.pushState("NODE");
            return 35;
          case 70:
            this.pushState("NODE");
            return 35;
          case 71:
            this.pushState("NODE");
            return 35;
          case 72:
            v212.getLogger().debug("Lexa: [");
            this.pushState("NODE");
            return 35;
          case 73:
            this.pushState("BLOCK_ARROW");
            v212.getLogger().debug("LEX ARR START");
            return 37;
          case 74:
            v212.getLogger().debug("Lex: NODE_ID", v213.yytext);
            return 31;
          case 75:
            v212.getLogger().debug("Lex: EOF", v213.yytext);
            return 8;
          case 76:
            this.pushState("md_string");
            break;
          case 77:
            this.pushState("md_string");
            break;
          case 78:
            return "NODE_DESCR";
          case 79:
            this.popState();
            break;
          case 80:
            v212.getLogger().debug("Lex: Starting string");
            this.pushState("string");
            break;
          case 81:
            v212.getLogger().debug("LEX ARR: Starting string");
            this.pushState("string");
            break;
          case 82:
            v212.getLogger().debug("LEX: NODE_DESCR:", v213.yytext);
            return "NODE_DESCR";
          case 83:
            v212.getLogger().debug("LEX POPPING");
            this.popState();
            break;
          case 84:
            v212.getLogger().debug("Lex: =>BAE");
            this.pushState("ARROW_DIR");
            break;
          case 85:
            v213.yytext = v213.yytext.replace(/^,\s*/, "");
            v212.getLogger().debug("Lex (right): dir:", v213.yytext);
            return "DIR";
          case 86:
            v213.yytext = v213.yytext.replace(/^,\s*/, "");
            v212.getLogger().debug("Lex (left):", v213.yytext);
            return "DIR";
          case 87:
            v213.yytext = v213.yytext.replace(/^,\s*/, "");
            v212.getLogger().debug("Lex (x):", v213.yytext);
            return "DIR";
          case 88:
            v213.yytext = v213.yytext.replace(/^,\s*/, "");
            v212.getLogger().debug("Lex (y):", v213.yytext);
            return "DIR";
          case 89:
            v213.yytext = v213.yytext.replace(/^,\s*/, "");
            v212.getLogger().debug("Lex (up):", v213.yytext);
            return "DIR";
          case 90:
            v213.yytext = v213.yytext.replace(/^,\s*/, "");
            v212.getLogger().debug("Lex (down):", v213.yytext);
            return "DIR";
          case 91:
            v213.yytext = "]>";
            v212.getLogger().debug("Lex (ARROW_DIR end):", v213.yytext);
            this.popState();
            this.popState();
            return "BLOCK_ARROW_END";
          case 92:
            v212.getLogger().debug("Lex: LINK", "#" + v213.yytext + "#");
            return 15;
          case 93:
            v212.getLogger().debug("Lex: LINK", v213.yytext);
            return 15;
          case 94:
            v212.getLogger().debug("Lex: LINK", v213.yytext);
            return 15;
          case 95:
            v212.getLogger().debug("Lex: LINK", v213.yytext);
            return 15;
          case 96:
            v212.getLogger().debug("Lex: START_LINK", v213.yytext);
            this.pushState("LLABEL");
            return 16;
          case 97:
            v212.getLogger().debug("Lex: START_LINK", v213.yytext);
            this.pushState("LLABEL");
            return 16;
          case 98:
            v212.getLogger().debug("Lex: START_LINK", v213.yytext);
            this.pushState("LLABEL");
            return 16;
          case 99:
            this.pushState("md_string");
            break;
          case 100:
            v212.getLogger().debug("Lex: Starting string");
            this.pushState("string");
            return "LINK_LABEL";
          case 101:
            this.popState();
            v212.getLogger().debug("Lex: LINK", "#" + v213.yytext + "#");
            return 15;
          case 102:
            this.popState();
            v212.getLogger().debug("Lex: LINK", v213.yytext);
            return 15;
          case 103:
            this.popState();
            v212.getLogger().debug("Lex: LINK", v213.yytext);
            return 15;
          case 104:
            v212.getLogger().debug("Lex: COLON", v213.yytext);
            v213.yytext = v213.yytext.slice(1);
            return 27;
        }
      }, "anonymous"),
      rules: [/^(?:block-beta\b)/, /^(?:block:)/, /^(?:block\b)/, /^(?:[\s]+)/, /^(?:[\n]+)/, /^(?:((\u000D\u000A)|(\u000A)))/, /^(?:columns\s+auto\b)/, /^(?:columns\s+[\d]+)/, /^(?:["][`])/, /^(?:[^`"]+)/, /^(?:[`]["])/, /^(?:["])/, /^(?:["])/, /^(?:[^"]*)/, /^(?:space[:]\d+)/, /^(?:space\b)/, /^(?:default\b)/, /^(?:linkStyle\b)/, /^(?:interpolate\b)/, /^(?:classDef\s+)/, /^(?:DEFAULT\s+)/, /^(?:\w+\s+)/, /^(?:[^\n]*)/, /^(?:class\s+)/, /^(?:(\w+)+((,\s*\w+)*))/, /^(?:[^\n]*)/, /^(?:style\s+)/, /^(?:(\w+)+((,\s*\w+)*))/, /^(?:[^\n]*)/, /^(?:accTitle\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*\{\s*)/, /^(?:[\}])/, /^(?:[^\}]*)/, /^(?:end\b\s*)/, /^(?:\(\(\()/, /^(?:\)\)\))/, /^(?:[\)]\))/, /^(?:\}\})/, /^(?:\})/, /^(?:\(-)/, /^(?:-\))/, /^(?:\(\()/, /^(?:\]\])/, /^(?:\()/, /^(?:\]\))/, /^(?:\\\])/, /^(?:\/\])/, /^(?:\)\])/, /^(?:[\)])/, /^(?:\]>)/, /^(?:[\]])/, /^(?:-\))/, /^(?:\(-)/, /^(?:\)\))/, /^(?:\))/, /^(?:\(\(\()/, /^(?:\(\()/, /^(?:\{\{)/, /^(?:\{)/, /^(?:>)/, /^(?:\(\[)/, /^(?:\()/, /^(?:\[\[)/, /^(?:\[\|)/, /^(?:\[\()/, /^(?:\)\)\))/, /^(?:\[\\)/, /^(?:\[\/)/, /^(?:\[\\)/, /^(?:\[)/, /^(?:<\[)/, /^(?:[^\(\[\n\-\)\{\}\s\<\>:=]+)/, /^(?:$)/, /^(?:["][`])/, /^(?:["][`])/, /^(?:[^`"]+)/, /^(?:[`]["])/, /^(?:["])/, /^(?:["])/, /^(?:[^"]+)/, /^(?:["])/, /^(?:\]>\s*\()/, /^(?:,?\s*right\s*)/, /^(?:,?\s*left\s*)/, /^(?:,?\s*x\s*)/, /^(?:,?\s*y\s*)/, /^(?:,?\s*up\s*)/, /^(?:,?\s*down\s*)/, /^(?:\)\s*)/, /^(?:\s*[xo<]?--+[-xo>]\s*)/, /^(?:\s*[xo<]?==+[=xo>]\s*)/, /^(?:\s*[xo<]?-?\.+-[xo>]?\s*)/, /^(?:\s*~~[\~]+\s*)/, /^(?:\s*[xo<]?--\s*)/, /^(?:\s*[xo<]?==\s*)/, /^(?:\s*[xo<]?-\.\s*)/, /^(?:["][`])/, /^(?:["])/, /^(?:\s*[xo<]?--+[-xo>]\s*)/, /^(?:\s*[xo<]?==+[=xo>]\s*)/, /^(?:\s*[xo<]?-?\.+-[xo>]?\s*)/, /^(?::\d+)/],
      conditions: {
        STYLE_DEFINITION: {
          rules: [28],
          inclusive: false
        },
        STYLE_STMNT: {
          rules: [27],
          inclusive: false
        },
        CLASSDEFID: {
          rules: [22],
          inclusive: false
        },
        CLASSDEF: {
          rules: [20, 21],
          inclusive: false
        },
        CLASS_STYLE: {
          rules: [25],
          inclusive: false
        },
        CLASS: {
          rules: [24],
          inclusive: false
        },
        LLABEL: {
          rules: [99, 100, 101, 102, 103],
          inclusive: false
        },
        ARROW_DIR: {
          rules: [85, 86, 87, 88, 89, 90, 91],
          inclusive: false
        },
        BLOCK_ARROW: {
          rules: [76, 81, 84],
          inclusive: false
        },
        NODE: {
          rules: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 77, 80],
          inclusive: false
        },
        md_string: {
          rules: [9, 10, 78, 79],
          inclusive: false
        },
        space: {
          rules: [],
          inclusive: false
        },
        string: {
          rules: [12, 13, 82, 83],
          inclusive: false
        },
        acc_descr_multiline: {
          rules: [34, 35],
          inclusive: false
        },
        acc_descr: {
          rules: [32],
          inclusive: false
        },
        acc_title: {
          rules: [30],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 14, 15, 16, 17, 18, 19, 23, 26, 29, 31, 33, 36, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 92, 93, 94, 95, 96, 97, 98, 104],
          inclusive: true
        }
      }
    };
    return v169;
  }();
  v113.lexer = v168;
  function v216() {
    this.yy = {};
  }
  v27(v216, "Parser");
  v216.prototype = v113;
  v113.Parser = v216;
  return new v216();
}();
parser.parser = parser;
var block_default = parser;
var blockDatabase = new Map();
var edgeList = [];
var edgeCount = new Map();
var COLOR_KEYWORD = "color";
var FILL_KEYWORD = "fill";
var BG_FILL = "bgFill";
var STYLECLASS_SEP = ",";
var classes = new Map();
var diagramId = "";
var sanitizeText2 = v27(v217 => v44.sanitizeText(v217, v34()), "sanitizeText");
var addStyleClass = v27(function (v218, v219 = "") {
  let v220 = classes.get(v218);
  if (!v220) {
    v220 = {
      id: v218,
      styles: [],
      textStyles: []
    };
    classes.set(v218, v220);
  }
  if (v219 !== undefined && v219 !== null) {
    v219.split(STYLECLASS_SEP).forEach(v221 => {
      const v222 = v221.replace(/([^;]*);/, "$1").trim();
      if (RegExp(COLOR_KEYWORD).exec(v221)) {
        const v223 = v222.replace(FILL_KEYWORD, BG_FILL);
        const v224 = v223.replace(COLOR_KEYWORD, FILL_KEYWORD);
        v220.textStyles.push(v224);
      }
      v220.styles.push(v222);
    });
  }
}, "addStyleClass");
var addStyle2Node = v27(function (v225, v226 = "") {
  const v227 = blockDatabase.get(v225);
  if (v226 !== undefined && v226 !== null) {
    v227.styles = v226.split(STYLECLASS_SEP);
  }
}, "addStyle2Node");
var setCssClass = v27(function (v228, v229) {
  v228.split(",").forEach(function (v230) {
    let v231 = blockDatabase.get(v230);
    if (v231 === undefined) {
      const v232 = v230.trim();
      v231 = {
        id: v232,
        type: "na",
        children: []
      };
      blockDatabase.set(v232, v231);
    }
    if (!v231.classes) {
      v231.classes = [];
    }
    v231.classes.push(v229);
  });
}, "setCssClass");
var populateBlockDatabase = v27((v233, v234) => {
  const v235 = v233.flat();
  const v236 = [];
  const v237 = v235.find(v238 => v238?.type === "column-setting");
  const v239 = v237?.columns ?? -1;
  for (const v240 of v235) {
    if (typeof v239 === "number" && v239 > 0 && v240.type !== "column-setting" && typeof v240.widthInColumns === "number" && v240.widthInColumns > v239) {
      v31.warn("Block " + v240.id + " width " + v240.widthInColumns + " exceeds configured column width " + v239);
    }
    v240.label &&= sanitizeText2(v240.label);
    if (v240.type === "classDef") {
      addStyleClass(v240.id, v240.css);
      continue;
    }
    if (v240.type === "applyClass") {
      setCssClass(v240.id, v240?.styleClass ?? "");
      continue;
    }
    if (v240.type === "applyStyles") {
      if (v240?.stylesStr) {
        addStyle2Node(v240.id, v240?.stylesStr);
      }
      continue;
    }
    if (v240.type === "column-setting") {
      v234.columns = v240.columns ?? -1;
    } else if (v240.type === "edge") {
      const v241 = (edgeCount.get(v240.id) ?? 0) + 1;
      edgeCount.set(v240.id, v241);
      v240.id = v241 + "-" + v240.id;
      edgeList.push(v240);
    } else {
      if (!v240.label) {
        if (v240.type === "composite") {
          v240.label = "";
        } else {
          v240.label = v240.id;
        }
      }
      const v242 = blockDatabase.get(v240.id);
      if (v242 === undefined) {
        blockDatabase.set(v240.id, v240);
      } else {
        if (v240.type !== "na") {
          v242.type = v240.type;
        }
        if (v240.label !== v240.id) {
          v242.label = v240.label;
        }
      }
      if (v240.children) {
        populateBlockDatabase(v240.children, v240);
      }
      if (v240.type === "space") {
        const v243 = v240.width ?? 1;
        for (let v244 = 0; v244 < v243; v244++) {
          const v245 = clone(v240);
          v245.id = v245.id + "-" + v244;
          blockDatabase.set(v245.id, v245);
          v236.push(v245);
        }
      } else if (v242 === undefined) {
        v236.push(v240);
      }
    }
  }
  v234.children = v236;
}, "populateBlockDatabase");
var blocks = [];
var rootBlock = {
  id: "root",
  type: "composite",
  children: [],
  columns: -1
};
var clear2 = v27(() => {
  v31.debug("Clear called");
  v32();
  rootBlock = {
    id: "root",
    type: "composite",
    children: [],
    columns: -1
  };
  blockDatabase = new Map([["root", rootBlock]]);
  blocks = [];
  classes = new Map();
  edgeList = [];
  edgeCount = new Map();
  diagramId = "";
}, "clear");
function typeStr2Type(v246) {
  v31.debug("typeStr2Type", v246);
  switch (v246) {
    case "[]":
      return "square";
    case "()":
      v31.debug("we have a round");
      return "round";
    case "(())":
      return "circle";
    case ">]":
      return "rect_left_inv_arrow";
    case "{}":
      return "diamond";
    case "{{}}":
      return "hexagon";
    case "([])":
      return "stadium";
    case "[[]]":
      return "subroutine";
    case "[()]":
      return "cylinder";
    case "((()))":
      return "doublecircle";
    case "[//]":
      return "lean_right";
    case "[\\\\]":
      return "lean_left";
    case "[/\\]":
      return "trapezoid";
    case "[\\/]":
      return "inv_trapezoid";
    case "<[]>":
      return "block_arrow";
    default:
      return "na";
  }
}
v27(typeStr2Type, "typeStr2Type");
function edgeTypeStr2Type(v247) {
  v31.debug("typeStr2Type", v247);
  switch (v247) {
    case "==":
      return "thick";
    default:
      return "normal";
  }
}
v27(edgeTypeStr2Type, "edgeTypeStr2Type");
function edgeStrToEdgeData(v248) {
  const v249 = v248.trim().slice(-1);
  switch (v249) {
    case "x":
      return "arrow_cross";
    case "o":
      return "arrow_circle";
    case ">":
      return "arrow_point";
    default:
      return "";
  }
}
v27(edgeStrToEdgeData, "edgeStrToEdgeData");
function edgeStrToEdgeStartData(v250) {
  const v251 = v250.trim().charAt(0);
  switch (v251) {
    case "x":
      return "arrow_cross";
    case "o":
      return "arrow_circle";
    case "<":
      return "arrow_point";
    default:
      return "arrow_open";
  }
}
v27(edgeStrToEdgeStartData, "edgeStrToEdgeStartData");
function edgeStrToThickness(v252) {
  if (v252.includes("==")) {
    return "thick";
  } else {
    return "normal";
  }
}
v27(edgeStrToThickness, "edgeStrToThickness");
function edgeStrToPattern(v253) {
  if (v253.includes(".-")) {
    return "dotted";
  }
  return "solid";
}
v27(edgeStrToPattern, "edgeStrToPattern");
var cnt = 0;
var generateId = v27(() => {
  cnt++;
  return "id-" + Math.random().toString(36).substr(2, 12) + "-" + cnt;
}, "generateId");
var setHierarchy = v27(v254 => {
  rootBlock.children = v254;
  populateBlockDatabase(v254, rootBlock);
  blocks = rootBlock.children;
}, "setHierarchy");
var getColumns = v27(v255 => {
  const v256 = blockDatabase.get(v255);
  if (!v256) {
    return -1;
  }
  if (v256.columns) {
    return v256.columns;
  }
  if (!v256.children) {
    return -1;
  }
  return v256.children.length;
}, "getColumns");
var getBlocksFlat = v27(() => {
  return [...blockDatabase.values()];
}, "getBlocksFlat");
var getBlocks = v27(() => {
  return blocks || [];
}, "getBlocks");
var getEdges = v27(() => {
  return edgeList;
}, "getEdges");
var getBlock = v27(v257 => {
  return blockDatabase.get(v257);
}, "getBlock");
var setBlock = v27(v258 => {
  blockDatabase.set(v258.id, v258);
}, "setBlock");
var setDiagramId = v27(v259 => {
  diagramId = v259;
}, "setDiagramId");
var getDiagramId = v27(() => diagramId, "getDiagramId");
var getLogger = v27(() => v31, "getLogger");
var getClasses = v27(function () {
  return classes;
}, "getClasses");
var db = {
  getConfig: v27(() => v28().block, "getConfig"),
  typeStr2Type: typeStr2Type,
  edgeTypeStr2Type: edgeTypeStr2Type,
  edgeStrToEdgeData: edgeStrToEdgeData,
  edgeStrToEdgeStartData: edgeStrToEdgeStartData,
  edgeStrToThickness: edgeStrToThickness,
  edgeStrToPattern: edgeStrToPattern,
  getLogger: getLogger,
  getBlocksFlat: getBlocksFlat,
  getBlocks: getBlocks,
  getEdges: getEdges,
  setHierarchy: setHierarchy,
  getBlock: getBlock,
  setBlock: setBlock,
  getColumns: getColumns,
  getClasses: getClasses,
  clear: clear2,
  generateId: generateId,
  setDiagramId: setDiagramId,
  getDiagramId: getDiagramId
};
var blockDB_default = db;
var fade = v27((v260, v261) => {
  const v262 = v50;
  const v263 = v262(v260, "r");
  const v264 = v262(v260, "g");
  const v265 = v262(v260, "b");
  return v33(v263, v264, v265, v261);
}, "fade");
var getStyles = v27(v266 => ".label {\n    font-family: " + v266.fontFamily + ";\n    color: " + (v266.nodeTextColor || v266.textColor) + ";\n  }\n  .cluster-label text {\n    fill: " + v266.titleColor + ";\n  }\n  .cluster-label span,p {\n    color: " + v266.titleColor + ";\n  }\n\n\n\n  .label text,span,p {\n    fill: " + (v266.nodeTextColor || v266.textColor) + ";\n    color: " + (v266.nodeTextColor || v266.textColor) + ";\n  }\n\n  .node rect,\n  .node circle,\n  .node ellipse,\n  .node polygon,\n  .node path {\n    fill: " + v266.mainBkg + ";\n    stroke: " + v266.nodeBorder + ";\n    stroke-width: 1px;\n  }\n  .flowchart-label text {\n    text-anchor: middle;\n  }\n  // .flowchart-label .text-outer-tspan {\n  //   text-anchor: middle;\n  // }\n  // .flowchart-label .text-inner-tspan {\n  //   text-anchor: start;\n  // }\n\n  .node .label {\n    text-align: center;\n  }\n  .node.clickable {\n    cursor: pointer;\n  }\n\n  .arrowheadPath {\n    fill: " + v266.arrowheadColor + ";\n  }\n\n  .edgePath .path {\n    stroke: " + v266.lineColor + ";\n    stroke-width: 2.0px;\n  }\n\n  .flowchart-link {\n    stroke: " + v266.lineColor + ";\n    fill: none;\n  }\n\n  .edgeLabel {\n    background-color: " + v266.edgeLabelBackground + ";\n    /*\n     * This is for backward compatibility with existing code that didn't\n     * add a `<p>` around edge labels.\n     *\n     * TODO: We should probably remove this in a future release.\n     */\n    p {\n      margin: 0;\n      padding: 0;\n      display: inline;\n    }\n    rect {\n      opacity: 0.5;\n      background-color: " + v266.edgeLabelBackground + ";\n      fill: " + v266.edgeLabelBackground + ";\n    }\n    text-align: center;\n  }\n\n  /* For html labels only */\n  .labelBkg {\n    background-color: " + v266.edgeLabelBackground + ";\n  }\n\n  .node .cluster {\n    // fill: " + fade(v266.mainBkg, 0.5) + ";\n    fill: " + fade(v266.clusterBkg, 0.5) + ";\n    stroke: " + fade(v266.clusterBorder, 0.2) + ";\n    box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;\n    stroke-width: 1px;\n  }\n\n  .cluster text {\n    fill: " + v266.titleColor + ";\n  }\n\n  .cluster span,p {\n    color: " + v266.titleColor + ";\n  }\n  /* .cluster div {\n    color: " + v266.titleColor + ";\n  } */\n\n  div.mermaidTooltip {\n    position: absolute;\n    text-align: center;\n    max-width: 200px;\n    padding: 2px;\n    font-family: " + v266.fontFamily + ";\n    font-size: 12px;\n    background: " + v266.tertiaryColor + ";\n    border: 1px solid " + v266.border2 + ";\n    border-radius: 2px;\n    pointer-events: none;\n    z-index: 100;\n  }\n\n  .flowchartTitleText {\n    text-anchor: middle;\n    font-size: 18px;\n    fill: " + v266.textColor + ";\n  }\n  " + v1() + "\n", "getStyles");
var styles_default = getStyles;
var insertMarkers = v27((v267, v268, v269, v270) => {
  v268.forEach(v271 => {
    markers[v271](v267, v269, v270);
  });
}, "insertMarkers");
var extension = v27((v272, v273, v274) => {
  v31.trace("Making markers for ", v274);
  v272.append("defs").append("marker").attr("id", v274 + "_" + v273 + "-extensionStart").attr("class", "marker extension " + v273).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 1,7 L18,13 V 1 Z");
  v272.append("defs").append("marker").attr("id", v274 + "_" + v273 + "-extensionEnd").attr("class", "marker extension " + v273).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 1,1 V 13 L18,7 Z");
}, "extension");
var composition = v27((v275, v276, v277) => {
  v275.append("defs").append("marker").attr("id", v277 + "_" + v276 + "-compositionStart").attr("class", "marker composition " + v276).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  v275.append("defs").append("marker").attr("id", v277 + "_" + v276 + "-compositionEnd").attr("class", "marker composition " + v276).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "composition");
var aggregation = v27((v278, v279, v280) => {
  v278.append("defs").append("marker").attr("id", v280 + "_" + v279 + "-aggregationStart").attr("class", "marker aggregation " + v279).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  v278.append("defs").append("marker").attr("id", v280 + "_" + v279 + "-aggregationEnd").attr("class", "marker aggregation " + v279).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "aggregation");
var dependency = v27((v281, v282, v283) => {
  v281.append("defs").append("marker").attr("id", v283 + "_" + v282 + "-dependencyStart").attr("class", "marker dependency " + v282).attr("refX", 6).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 5,7 L9,13 L1,7 L9,1 Z");
  v281.append("defs").append("marker").attr("id", v283 + "_" + v282 + "-dependencyEnd").attr("class", "marker dependency " + v282).attr("refX", 13).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "dependency");
var lollipop = v27((v284, v285, v286) => {
  v284.append("defs").append("marker").attr("id", v286 + "_" + v285 + "-lollipopStart").attr("class", "marker lollipop " + v285).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
  v284.append("defs").append("marker").attr("id", v286 + "_" + v285 + "-lollipopEnd").attr("class", "marker lollipop " + v285).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
}, "lollipop");
var point = v27((v287, v288, v289) => {
  v287.append("marker").attr("id", v289 + "_" + v288 + "-pointEnd").attr("class", "marker " + v288).attr("viewBox", "0 0 10 10").attr("refX", 6).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  v287.append("marker").attr("id", v289 + "_" + v288 + "-pointStart").attr("class", "marker " + v288).attr("viewBox", "0 0 10 10").attr("refX", 4.5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 5 L 10 10 L 10 0 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
}, "point");
var circle = v27((v290, v291, v292) => {
  v290.append("marker").attr("id", v292 + "_" + v291 + "-circleEnd").attr("class", "marker " + v291).attr("viewBox", "0 0 10 10").attr("refX", 11).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  v290.append("marker").attr("id", v292 + "_" + v291 + "-circleStart").attr("class", "marker " + v291).attr("viewBox", "0 0 10 10").attr("refX", -1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
}, "circle");
var cross = v27((v293, v294, v295) => {
  v293.append("marker").attr("id", v295 + "_" + v294 + "-crossEnd").attr("class", "marker cross " + v294).attr("viewBox", "0 0 11 11").attr("refX", 12).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
  v293.append("marker").attr("id", v295 + "_" + v294 + "-crossStart").attr("class", "marker cross " + v294).attr("viewBox", "0 0 11 11").attr("refX", -1).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
}, "cross");
var barb = v27((v296, v297, v298) => {
  v296.append("defs").append("marker").attr("id", v298 + "_" + v297 + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "strokeWidth").attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
}, "barb");
var markers = {
  extension: extension,
  composition: composition,
  aggregation: aggregation,
  dependency: dependency,
  lollipop: lollipop,
  point: point,
  circle: circle,
  cross: cross,
  barb: barb
};
var markers_default = insertMarkers;
function calculateBlockPosition(v299, v300) {
  if (v299 === 0 || !Number.isInteger(v299)) {
    throw new Error("Columns must be an integer !== 0.");
  }
  if (v300 < 0 || !Number.isInteger(v300)) {
    throw new Error("Position must be a non-negative integer." + v300);
  }
  if (v299 < 0) {
    return {
      px: v300,
      py: 0
    };
  }
  if (v299 === 1) {
    return {
      px: 0,
      py: v300
    };
  }
  const v301 = v300 % v299;
  const v302 = Math.floor(v300 / v299);
  return {
    px: v301,
    py: v302
  };
}
v27(calculateBlockPosition, "calculateBlockPosition");
var getMaxChildSize = v27(v303 => {
  let v304 = 0;
  let v305 = 0;
  for (const v306 of v303.children) {
    const {
      width: v307,
      height: v308,
      x: v309,
      y: v310
    } = v306.size ?? {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    };
    v31.debug("getMaxChildSize abc95 child:", v306.id, "width:", v307, "height:", v308, "x:", v309, "y:", v310, v306.type);
    if (v306.type === "space") {
      continue;
    }
    const v311 = v307 / (v306.widthInColumns ?? 1);
    if (v311 > v304) {
      v304 = v311;
    }
    if (v308 > v305) {
      v305 = v308;
    }
  }
  return {
    width: v304,
    height: v305
  };
}, "getMaxChildSize");
function setBlockSizes(v312, v313, v314 = 0, v315 = 0, v316 = 8) {
  v31.debug("setBlockSizes abc95 (start)", v312.id, v312?.size?.x, "block width =", v312?.size, "siblingWidth", v314);
  if (!v312?.size?.width) {
    v312.size = {
      width: v314,
      height: v315,
      x: 0,
      y: 0
    };
  }
  let v317 = 0;
  let v318 = 0;
  if (v312.children?.length > 0) {
    for (const v319 of v312.children) {
      setBlockSizes(v319, v313, 0, 0, v316);
    }
    const v320 = getMaxChildSize(v312);
    v317 = v320.width;
    v318 = v320.height;
    v31.debug("setBlockSizes abc95 maxWidth of", v312.id, ":s children is ", v317, v318);
    for (const v321 of v312.children) {
      if (v321.size) {
        v31.debug("abc95 Setting size of children of " + v312.id + " id=" + v321.id + " " + v317 + " " + v318 + " " + JSON.stringify(v321.size));
        v321.size.width = v317 * (v321.widthInColumns ?? 1) + v316 * ((v321.widthInColumns ?? 1) - 1);
        v321.size.height = v318;
        v321.size.x = 0;
        v321.size.y = 0;
        v31.debug("abc95 updating size of " + v312.id + " children child:" + v321.id + " maxWidth:" + v317 + " maxHeight:" + v318);
      }
    }
    for (const v322 of v312.children) {
      setBlockSizes(v322, v313, v317, v318, v316);
    }
    const v323 = v312.columns ?? -1;
    let v324 = 0;
    for (const v325 of v312.children) {
      v324 += v325.widthInColumns ?? 1;
    }
    let v326 = v312.children.length;
    if (v323 > 0 && v323 < v324) {
      v326 = v323;
    }
    const v327 = Math.ceil(v324 / v326);
    let v328 = v326 * (v317 + v316) + v316;
    let v329 = v327 * (v318 + v316) + v316;
    if (v328 < v314) {
      v31.debug("Detected to small sibling: abc95 " + v312.id + " siblingWidth " + v314 + " siblingHeight " + v315 + " width " + v328);
      v328 = v314;
      v329 = v315;
      const v330 = (v314 - v326 * v316 - v316) / v326;
      const v331 = (v315 - v327 * v316 - v316) / v327;
      v31.debug("Size indata abc88", v312.id, "childWidth", v330, "maxWidth", v317);
      v31.debug("Size indata abc88", v312.id, "childHeight", v331, "maxHeight", v318);
      v31.debug("Size indata abc88 xSize", v326, "padding", v316);
      for (const v332 of v312.children) {
        if (v332.size) {
          v332.size.width = v330;
          v332.size.height = v331;
          v332.size.x = 0;
          v332.size.y = 0;
        }
      }
    }
    v31.debug("abc95 (finale calc) " + v312.id + " xSize " + v326 + " ySize " + v327 + " columns " + v323 + v312.children.length + " width=" + Math.max(v328, v312.size?.width || 0));
    if (v328 < (v312?.size?.width || 0)) {
      v328 = v312?.size?.width || 0;
      const v333 = v323 > 0 ? Math.min(v312.children.length, v323) : v312.children.length;
      if (v333 > 0) {
        const v334 = (v328 - v333 * v316 - v316) / v333;
        v31.debug("abc95 (growing to fit) width", v312.id, v328, v312.size?.width, v334);
        for (const v335 of v312.children) {
          if (v335.size) {
            v335.size.width = v334;
          }
        }
      }
    }
    v312.size = {
      width: v328,
      height: v329,
      x: 0,
      y: 0
    };
  }
  v31.debug("setBlockSizes abc94 (done)", v312.id, v312?.size?.x, v312?.size?.width, v312?.size?.y, v312?.size?.height);
}
v27(setBlockSizes, "setBlockSizes");
function layoutBlocks(v336, v337, v338 = 8) {
  v31.debug("abc85 layout blocks (=>layoutBlocks) " + v336.id + " x: " + v336?.size?.x + " y: " + v336?.size?.y + " width: " + v336?.size?.width);
  const v339 = v336.columns ?? -1;
  v31.debug("layoutBlocks columns abc95", v336.id, "=>", v339, v336);
  if (v336.children && v336.children.length > 0) {
    const v340 = v336?.children[0]?.size?.width ?? 0;
    const v341 = v336.children.length * v340 + (v336.children.length - 1) * v338;
    v31.debug("widthOfChildren 88", v341, "posX");
    const v342 = new Map();
    {
      let v343 = 0;
      for (const v344 of v336.children) {
        if (!v344.size) {
          continue;
        }
        const {
          py: v345
        } = calculateBlockPosition(v339, v343);
        const v346 = v342.get(v345) ?? 0;
        if (v344.size.height > v346) {
          v342.set(v345, v344.size.height);
        }
        let v347 = v344?.widthInColumns ?? 1;
        if (v339 > 0) {
          v347 = Math.min(v347, v339 - v343 % v339);
        }
        v343 += v347;
      }
    }
    const v348 = new Map();
    {
      let v349 = 0;
      const v350 = [...v342.keys()].sort((v351, v352) => v351 - v352);
      for (const v353 of v350) {
        v348.set(v353, v349);
        v349 += (v342.get(v353) ?? 0) + v338;
      }
    }
    let v354 = 0;
    v31.debug("abc91 block?.size?.x", v336.id, v336?.size?.x);
    let v355 = v336?.size?.x ? v336?.size?.x + (-v336?.size?.width / 2 || 0) : -v338;
    let v356 = 0;
    for (const v357 of v336.children) {
      const v358 = v336;
      if (!v357.size) {
        continue;
      }
      const {
        width: v359,
        height: v360
      } = v357.size;
      const {
        px: v361,
        py: v362
      } = calculateBlockPosition(v339, v354);
      if (v362 != v356) {
        v356 = v362;
        v355 = v336?.size?.x ? v336?.size?.x + (-v336?.size?.width / 2 || 0) : -v338;
        v31.debug("New row in layout for block", v336.id, " and child ", v357.id, v356);
      }
      v31.debug("abc89 layout blocks (child) id: " + v357.id + " Pos: " + v354 + " (px, py) " + v361 + "," + v362 + " (" + v358?.size?.x + "," + v358?.size?.y + ") parent: " + v358.id + " width: " + v359 + v338);
      if (v358.size) {
        const v363 = v359 / 2;
        v357.size.x = v355 + v338 + v363;
        v31.debug("abc91 layout blocks (calc) px, pyid:" + v357.id + " startingPos=X" + v355 + " new startingPosX" + v357.size.x + " " + v363 + " padding=" + v338 + " width=" + v359 + " halfWidth=" + v363 + " => x:" + v357.size.x + " y:" + v357.size.y + " " + v357.widthInColumns + " (width * (child?.w || 1)) / 2 " + v359 * (v357?.widthInColumns ?? 1) / 2);
        v355 = v357.size.x + v363;
        const v364 = v348.get(v362) ?? 0;
        const v365 = v342.get(v362) ?? v360;
        v357.size.y = v358.size.y - v358.size.height / 2 + v364 + v365 / 2 + v338;
        v31.debug("abc88 layout blocks (calc) px, pyid:" + v357.id + "startingPosX" + v355 + v338 + v363 + "=>x:" + v357.size.x + "y:" + v357.size.y + v357.widthInColumns + "(width * (child?.w || 1)) / 2" + v359 * (v357?.widthInColumns ?? 1) / 2);
      }
      if (v357.children) {
        layoutBlocks(v357, v337, v338);
      }
      let v366 = v357?.widthInColumns ?? 1;
      if (v339 > 0) {
        v366 = Math.min(v366, v339 - v354 % v339);
      }
      v354 += v366;
      v31.debug("abc88 columnsPos", v357, v354);
    }
  }
  v31.debug("layout blocks (<==layoutBlocks) " + v336.id + " x: " + v336?.size?.x + " y: " + v336?.size?.y + " width: " + v336?.size?.width);
}
v27(layoutBlocks, "layoutBlocks");
function findBounds(v367, {
  minX: v368,
  minY: v369,
  maxX: v370,
  maxY: v371
} = {
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0
}) {
  if (v367.size && v367.id !== "root") {
    const {
      x: v372,
      y: v373,
      width: v374,
      height: v375
    } = v367.size;
    if (v372 - v374 / 2 < v368) {
      v368 = v372 - v374 / 2;
    }
    if (v373 - v375 / 2 < v369) {
      v369 = v373 - v375 / 2;
    }
    if (v372 + v374 / 2 > v370) {
      v370 = v372 + v374 / 2;
    }
    if (v373 + v375 / 2 > v371) {
      v371 = v373 + v375 / 2;
    }
  }
  if (v367.children) {
    for (const v376 of v367.children) {
      ({
        minX: v368,
        minY: v369,
        maxX: v370,
        maxY: v371
      } = findBounds(v376, {
        minX: v368,
        minY: v369,
        maxX: v370,
        maxY: v371
      }));
    }
  }
  return {
    minX: v368,
    minY: v369,
    maxX: v370,
    maxY: v371
  };
}
v27(findBounds, "findBounds");
function layout(v377) {
  const v378 = v377.getBlock("root");
  if (!v378) {
    return;
  }
  const v379 = v34()?.block?.padding ?? 8;
  setBlockSizes(v378, v377, 0, 0, v379);
  layoutBlocks(v378, v377, v379);
  v31.debug("getBlocks", JSON.stringify(v378, null, 2));
  const {
    minX: v380,
    minY: v381,
    maxX: v382,
    maxY: v383
  } = findBounds(v378);
  const v384 = v383 - v381;
  const v385 = v382 - v380;
  return {
    x: v380,
    y: v381,
    width: v385,
    height: v384
  };
}
v27(layout, "layout");
var createLabel = v27(async (v386, v387, v388, v389 = false, v390 = false) => {
  let v391 = v387 || "";
  if (typeof v391 === "object") {
    v391 = v391[0];
  }
  const v392 = v34();
  const v393 = v39(v392);
  return await v40(v386, v391, {
    style: v388,
    isTitle: v389,
    useHtmlLabels: v393,
    markdown: false,
    isNode: v390,
    width: Number.POSITIVE_INFINITY
  }, v392);
}, "createLabel");
var createLabel_default = createLabel;
var addEdgeMarkers = v27((v394, v395, v396, v397, v398) => {
  if (v395.arrowTypeStart) {
    addEdgeMarker(v394, "start", v395.arrowTypeStart, v396, v397, v398);
  }
  if (v395.arrowTypeEnd) {
    addEdgeMarker(v394, "end", v395.arrowTypeEnd, v396, v397, v398);
  }
}, "addEdgeMarkers");
var arrowTypesMap = {
  arrow_cross: "cross",
  arrow_point: "point",
  arrow_barb: "barb",
  arrow_circle: "circle",
  aggregation: "aggregation",
  extension: "extension",
  composition: "composition",
  dependency: "dependency",
  lollipop: "lollipop"
};
var addEdgeMarker = v27((v399, v400, v401, v402, v403, v404) => {
  const v405 = arrowTypesMap[v401];
  if (!v405) {
    v31.warn("Unknown arrow type: " + v401);
    return;
  }
  const v406 = v400 === "start" ? "Start" : "End";
  v399.attr("marker-" + v400, "url(" + v402 + "#" + v403 + "_" + v404 + "-" + v405 + v406 + ")");
}, "addEdgeMarker");
var edgeLabels = {};
var terminalLabels = {};
var insertEdgeLabel = v27(async (v407, v408) => {
  const v409 = v34();
  const v410 = v39(v409);
  const v411 = v407.insert("g").attr("class", "edgeLabel");
  const v412 = v411.insert("g").attr("class", "label");
  const v413 = v408.labelType === "markdown";
  const v414 = await v40(v407, v408.label, {
    style: v408.labelStyle,
    useHtmlLabels: v410,
    addSvgBackground: v413,
    isNode: false,
    markdown: v413,
    width: v413 ? undefined : Number.POSITIVE_INFINITY
  }, v409);
  v412.node().appendChild(v414);
  let v415 = v414.getBBox();
  let v416 = v415;
  if (v410) {
    const v417 = v414.children[0];
    const v418 = v29(v414);
    v415 = v417.getBoundingClientRect();
    v416 = v415;
    v418.attr("width", v415.width);
    v418.attr("height", v415.height);
  } else {
    const v419 = v29(v414).select("text").node();
    if (v419 && typeof v419.getBBox === "function") {
      v416 = v419.getBBox();
    }
  }
  v412.attr("transform", v41(v416, v410));
  edgeLabels[v408.id] = v411;
  v408.width = v415.width;
  v408.height = v415.height;
  let v420;
  if (v408.startLabelLeft) {
    const v421 = v407.insert("g").attr("class", "edgeTerminals");
    const v422 = v421.insert("g").attr("class", "inner");
    const v423 = await createLabel_default(v422, v408.startLabelLeft, v408.labelStyle);
    v420 = v423;
    let v424 = v423.getBBox();
    if (v410) {
      const v425 = v423.children[0];
      const v426 = v29(v423);
      v424 = v425.getBoundingClientRect();
      v426.attr("width", v424.width);
      v426.attr("height", v424.height);
    }
    v422.attr("transform", v41(v424, v410));
    if (!terminalLabels[v408.id]) {
      terminalLabels[v408.id] = {};
    }
    terminalLabels[v408.id].startLeft = v421;
    setTerminalWidth(v420, v408.startLabelLeft);
  }
  if (v408.startLabelRight) {
    const v427 = v407.insert("g").attr("class", "edgeTerminals");
    const v428 = v427.insert("g").attr("class", "inner");
    const v429 = await createLabel_default(v428, v408.startLabelRight, v408.labelStyle);
    v420 = v429;
    let v430 = v429.getBBox();
    if (v410) {
      const v431 = v429.children[0];
      const v432 = v29(v429);
      v430 = v431.getBoundingClientRect();
      v432.attr("width", v430.width);
      v432.attr("height", v430.height);
    }
    v428.attr("transform", v41(v430, v410));
    if (!terminalLabels[v408.id]) {
      terminalLabels[v408.id] = {};
    }
    terminalLabels[v408.id].startRight = v427;
    setTerminalWidth(v420, v408.startLabelRight);
  }
  if (v408.endLabelLeft) {
    const v433 = v407.insert("g").attr("class", "edgeTerminals");
    const v434 = v433.insert("g").attr("class", "inner");
    const v435 = await createLabel_default(v433, v408.endLabelLeft, v408.labelStyle);
    v420 = v435;
    let v436 = v435.getBBox();
    if (v410) {
      const v437 = v435.children[0];
      const v438 = v29(v435);
      v436 = v437.getBoundingClientRect();
      v438.attr("width", v436.width);
      v438.attr("height", v436.height);
    }
    v434.attr("transform", v41(v436, v410));
    if (!terminalLabels[v408.id]) {
      terminalLabels[v408.id] = {};
    }
    terminalLabels[v408.id].endLeft = v433;
    setTerminalWidth(v420, v408.endLabelLeft);
  }
  if (v408.endLabelRight) {
    const v439 = v407.insert("g").attr("class", "edgeTerminals");
    const v440 = v439.insert("g").attr("class", "inner");
    const v441 = await createLabel_default(v439, v408.endLabelRight, v408.labelStyle);
    v420 = v441;
    let v442 = v441.getBBox();
    if (v410) {
      const v443 = v441.children[0];
      const v444 = v29(v441);
      v442 = v443.getBoundingClientRect();
      v444.attr("width", v442.width);
      v444.attr("height", v442.height);
    }
    v440.attr("transform", v41(v442, v410));
    if (!terminalLabels[v408.id]) {
      terminalLabels[v408.id] = {};
    }
    terminalLabels[v408.id].endRight = v439;
    setTerminalWidth(v420, v408.endLabelRight);
  }
  return v414;
}, "insertEdgeLabel");
function setTerminalWidth(v445, v446) {
  if (v39(v34()) && v445) {
    v445.style.width = v446.length * 9 + "px";
    v445.style.height = "12px";
  }
}
v27(setTerminalWidth, "setTerminalWidth");
var positionEdgeLabel = v27((v447, v448) => {
  v31.debug("Moving label abc88 ", v447.id, v447.label, edgeLabels[v447.id], v448);
  let v449 = v448.updatedPath ? v448.updatedPath : v448.originalPath;
  const v450 = v34();
  const {
    subGraphTitleTotalMargin: v451
  } = v42(v450);
  if (v447.label) {
    const v452 = edgeLabels[v447.id];
    let v453 = v447.x;
    let v454 = v447.y;
    if (v449) {
      const v455 = v43.calcLabelPosition(v449);
      v31.debug("Moving label " + v447.label + " from (", v453, ",", v454, ") to (", v455.x, ",", v455.y, ") abc88");
      if (v448.updatedPath) {
        v453 = v455.x;
        v454 = v455.y;
      }
    }
    v452.attr("transform", "translate(" + v453 + ", " + (v454 + v451 / 2) + ")");
  }
  if (v447.startLabelLeft) {
    const v456 = terminalLabels[v447.id].startLeft;
    let v457 = v447.x;
    let v458 = v447.y;
    if (v449) {
      const v459 = v43.calcTerminalLabelPosition(v447.arrowTypeStart ? 10 : 0, "start_left", v449);
      v457 = v459.x;
      v458 = v459.y;
    }
    v456.attr("transform", "translate(" + v457 + ", " + v458 + ")");
  }
  if (v447.startLabelRight) {
    const v460 = terminalLabels[v447.id].startRight;
    let v461 = v447.x;
    let v462 = v447.y;
    if (v449) {
      const v463 = v43.calcTerminalLabelPosition(v447.arrowTypeStart ? 10 : 0, "start_right", v449);
      v461 = v463.x;
      v462 = v463.y;
    }
    v460.attr("transform", "translate(" + v461 + ", " + v462 + ")");
  }
  if (v447.endLabelLeft) {
    const v464 = terminalLabels[v447.id].endLeft;
    let v465 = v447.x;
    let v466 = v447.y;
    if (v449) {
      const v467 = v43.calcTerminalLabelPosition(v447.arrowTypeEnd ? 10 : 0, "end_left", v449);
      v465 = v467.x;
      v466 = v467.y;
    }
    v464.attr("transform", "translate(" + v465 + ", " + v466 + ")");
  }
  if (v447.endLabelRight) {
    const v468 = terminalLabels[v447.id].endRight;
    let v469 = v447.x;
    let v470 = v447.y;
    if (v449) {
      const v471 = v43.calcTerminalLabelPosition(v447.arrowTypeEnd ? 10 : 0, "end_right", v449);
      v469 = v471.x;
      v470 = v471.y;
    }
    v468.attr("transform", "translate(" + v469 + ", " + v470 + ")");
  }
}, "positionEdgeLabel");
var outsideNode = v27((v472, v473) => {
  const v474 = v472.x;
  const v475 = v472.y;
  const v476 = Math.abs(v473.x - v474);
  const v477 = Math.abs(v473.y - v475);
  const v478 = v472.width / 2;
  const v479 = v472.height / 2;
  if (v476 >= v478 || v477 >= v479) {
    return true;
  }
  return false;
}, "outsideNode");
var intersection = v27((v480, v481, v482) => {
  v31.debug("intersection calc abc89:\n  outsidePoint: " + JSON.stringify(v481) + "\n  insidePoint : " + JSON.stringify(v482) + "\n  node        : x:" + v480.x + " y:" + v480.y + " w:" + v480.width + " h:" + v480.height);
  const v483 = v480.x;
  const v484 = v480.y;
  const v485 = Math.abs(v483 - v482.x);
  const v486 = v480.width / 2;
  let v487 = v482.x < v481.x ? v486 - v485 : v486 + v485;
  const v488 = v480.height / 2;
  const v489 = Math.abs(v481.y - v482.y);
  const v490 = Math.abs(v481.x - v482.x);
  if (Math.abs(v484 - v481.y) * v486 > Math.abs(v483 - v481.x) * v488) {
    let v491 = v482.y < v481.y ? v481.y - v488 - v484 : v484 - v488 - v481.y;
    v487 = v490 * v491 / v489;
    const v492 = {
      x: v482.x < v481.x ? v482.x + v487 : v482.x - v490 + v487,
      y: v482.y < v481.y ? v482.y + v489 - v491 : v482.y - v489 + v491
    };
    if (v487 === 0) {
      v492.x = v481.x;
      v492.y = v481.y;
    }
    if (v490 === 0) {
      v492.x = v481.x;
    }
    if (v489 === 0) {
      v492.y = v481.y;
    }
    v31.debug("abc89 topp/bott calc, Q " + v489 + ", q " + v491 + ", R " + v490 + ", r " + v487, v492);
    return v492;
  } else {
    if (v482.x < v481.x) {
      v487 = v481.x - v486 - v483;
    } else {
      v487 = v483 - v486 - v481.x;
    }
    let v493 = v489 * v487 / v490;
    let v494 = v482.x < v481.x ? v482.x + v490 - v487 : v482.x - v490 + v487;
    let v495 = v482.y < v481.y ? v482.y + v493 : v482.y - v493;
    v31.debug("sides calc abc89, Q " + v489 + ", q " + v493 + ", R " + v490 + ", r " + v487, {
      _x: v494,
      _y: v495
    });
    if (v487 === 0) {
      v494 = v481.x;
      v495 = v481.y;
    }
    if (v490 === 0) {
      v494 = v481.x;
    }
    if (v489 === 0) {
      v495 = v481.y;
    }
    return {
      x: v494,
      y: v495
    };
  }
}, "intersection");
var cutPathAtIntersect = v27((v496, v497) => {
  v31.debug("abc88 cutPathAtIntersect", v496, v497);
  let v498 = [];
  let v499 = v496[0];
  let v500 = false;
  v496.forEach(v501 => {
    if (!outsideNode(v497, v501) && !v500) {
      const v502 = intersection(v497, v499, v501);
      let v503 = false;
      v498.forEach(v504 => {
        v503 = v503 || v504.x === v502.x && v504.y === v502.y;
      });
      if (!v498.some(v505 => v505.x === v502.x && v505.y === v502.y)) {
        v498.push(v502);
      }
      v500 = true;
    } else {
      v499 = v501;
      if (!v500) {
        v498.push(v501);
      }
    }
  });
  return v498;
}, "cutPathAtIntersect");
var insertEdge = v27(function (v506, v507, v508, v509, v510, v511, v512) {
  let v513 = v508.points;
  v31.debug("abc88 InsertEdge: edge=", v508, "e=", v507);
  let v514 = false;
  const v515 = v511.node(v507.v);
  var v516 = v511.node(v507.w);
  if (v516?.intersect && v515?.intersect) {
    v513 = v513.slice(1, v508.points.length - 1);
    v513.unshift(v515.intersect(v513[0]));
    v513.push(v516.intersect(v513[v513.length - 1]));
  }
  if (v508.toCluster) {
    v31.debug("to cluster abc88", v509[v508.toCluster]);
    v513 = cutPathAtIntersect(v508.points, v509[v508.toCluster].node);
    v514 = true;
  }
  if (v508.fromCluster) {
    v31.debug("from cluster abc88", v509[v508.fromCluster]);
    v513 = cutPathAtIntersect(v513.reverse(), v509[v508.fromCluster].node).reverse();
    v514 = true;
  }
  const v517 = v513.filter(v518 => !Number.isNaN(v518.y));
  let v519 = v37;
  if (v508.curve && (v510 === "graph" || v510 === "flowchart")) {
    v519 = v508.curve;
  }
  const {
    x: v520,
    y: v521
  } = v35(v508);
  const v522 = v36().x(v520).y(v521).curve(v519);
  let v523;
  switch (v508.thickness) {
    case "normal":
      v523 = "edge-thickness-normal";
      break;
    case "thick":
      v523 = "edge-thickness-thick";
      break;
    case "invisible":
      v523 = "edge-thickness-thick";
      break;
    default:
      v523 = "";
  }
  switch (v508.pattern) {
    case "solid":
      v523 += " edge-pattern-solid";
      break;
    case "dotted":
      v523 += " edge-pattern-dotted";
      break;
    case "dashed":
      v523 += " edge-pattern-dashed";
      break;
  }
  const v524 = v506.append("path").attr("d", v522(v517)).attr("id", v508.id).attr("class", " " + v523 + (v508.classes ? " " + v508.classes : "")).attr("style", v508.style);
  let v525 = "";
  if (v34().flowchart.arrowMarkerAbsolute || v34().state.arrowMarkerAbsolute) {
    v525 = v38(true);
  }
  addEdgeMarkers(v524, v508, v525, v512, v510);
  let v526 = {};
  if (v514) {
    v526.updatedPath = v513;
  }
  v526.originalPath = v508.points;
  return v526;
}, "insertEdge");
var expandAndDeduplicateDirections = v27(v527 => {
  const v528 = new Set();
  for (const v529 of v527) {
    switch (v529) {
      case "x":
        v528.add("right");
        v528.add("left");
        break;
      case "y":
        v528.add("up");
        v528.add("down");
        break;
      default:
        v528.add(v529);
        break;
    }
  }
  return v528;
}, "expandAndDeduplicateDirections");
var getArrowPoints = v27((v530, v531, v532, v533) => {
  const v534 = expandAndDeduplicateDirections(v530);
  const v535 = 2;
  const v536 = v531.height + v532.padding * 2;
  const v537 = v536 / v535;
  const v538 = v533 ?? v531.width + v537 * 2 + v532.padding;
  const v539 = v532.padding / 2;
  if (v534.has("right") && v534.has("left") && v534.has("up") && v534.has("down")) {
    return [{
      x: 0,
      y: 0
    }, {
      x: v537,
      y: 0
    }, {
      x: v538 / 2,
      y: v539 * 2
    }, {
      x: v538 - v537,
      y: 0
    }, {
      x: v538,
      y: 0
    }, {
      x: v538,
      y: -v536 / 3
    }, {
      x: v538 + v539 * 2,
      y: -v536 / 2
    }, {
      x: v538,
      y: v536 * -2 / 3
    }, {
      x: v538,
      y: -v536
    }, {
      x: v538 - v537,
      y: -v536
    }, {
      x: v538 / 2,
      y: -v536 - v539 * 2
    }, {
      x: v537,
      y: -v536
    }, {
      x: 0,
      y: -v536
    }, {
      x: 0,
      y: v536 * -2 / 3
    }, {
      x: v539 * -2,
      y: -v536 / 2
    }, {
      x: 0,
      y: -v536 / 3
    }];
  }
  if (v534.has("right") && v534.has("left") && v534.has("up")) {
    return [{
      x: v537,
      y: 0
    }, {
      x: v538 - v537,
      y: 0
    }, {
      x: v538,
      y: -v536 / 2
    }, {
      x: v538 - v537,
      y: -v536
    }, {
      x: v537,
      y: -v536
    }, {
      x: 0,
      y: -v536 / 2
    }];
  }
  if (v534.has("right") && v534.has("left") && v534.has("down")) {
    return [{
      x: 0,
      y: 0
    }, {
      x: v537,
      y: -v536
    }, {
      x: v538 - v537,
      y: -v536
    }, {
      x: v538,
      y: 0
    }];
  }
  if (v534.has("right") && v534.has("up") && v534.has("down")) {
    return [{
      x: 0,
      y: 0
    }, {
      x: v538,
      y: -v537
    }, {
      x: v538,
      y: -v536 + v537
    }, {
      x: 0,
      y: -v536
    }];
  }
  if (v534.has("left") && v534.has("up") && v534.has("down")) {
    return [{
      x: v538,
      y: 0
    }, {
      x: 0,
      y: -v537
    }, {
      x: 0,
      y: -v536 + v537
    }, {
      x: v538,
      y: -v536
    }];
  }
  if (v534.has("right") && v534.has("left")) {
    return [{
      x: v537,
      y: 0
    }, {
      x: v537,
      y: -v539
    }, {
      x: v538 - v537,
      y: -v539
    }, {
      x: v538 - v537,
      y: 0
    }, {
      x: v538,
      y: -v536 / 2
    }, {
      x: v538 - v537,
      y: -v536
    }, {
      x: v538 - v537,
      y: -v536 + v539
    }, {
      x: v537,
      y: -v536 + v539
    }, {
      x: v537,
      y: -v536
    }, {
      x: 0,
      y: -v536 / 2
    }];
  }
  if (v534.has("up") && v534.has("down")) {
    return [{
      x: v538 / 2,
      y: 0
    }, {
      x: 0,
      y: -v539
    }, {
      x: v537,
      y: -v539
    }, {
      x: v537,
      y: -v536 + v539
    }, {
      x: 0,
      y: -v536 + v539
    }, {
      x: v538 / 2,
      y: -v536
    }, {
      x: v538,
      y: -v536 + v539
    }, {
      x: v538 - v537,
      y: -v536 + v539
    }, {
      x: v538 - v537,
      y: -v539
    }, {
      x: v538,
      y: -v539
    }];
  }
  if (v534.has("right") && v534.has("up")) {
    return [{
      x: 0,
      y: 0
    }, {
      x: v538,
      y: -v537
    }, {
      x: 0,
      y: -v536
    }];
  }
  if (v534.has("right") && v534.has("down")) {
    return [{
      x: 0,
      y: 0
    }, {
      x: v538,
      y: 0
    }, {
      x: 0,
      y: -v536
    }];
  }
  if (v534.has("left") && v534.has("up")) {
    return [{
      x: v538,
      y: 0
    }, {
      x: 0,
      y: -v537
    }, {
      x: v538,
      y: -v536
    }];
  }
  if (v534.has("left") && v534.has("down")) {
    return [{
      x: v538,
      y: 0
    }, {
      x: 0,
      y: 0
    }, {
      x: v538,
      y: -v536
    }];
  }
  if (v534.has("right")) {
    return [{
      x: v537,
      y: -v539
    }, {
      x: v537,
      y: -v539
    }, {
      x: v538 - v537,
      y: -v539
    }, {
      x: v538 - v537,
      y: 0
    }, {
      x: v538,
      y: -v536 / 2
    }, {
      x: v538 - v537,
      y: -v536
    }, {
      x: v538 - v537,
      y: -v536 + v539
    }, {
      x: v537,
      y: -v536 + v539
    }, {
      x: v537,
      y: -v536 + v539
    }];
  }
  if (v534.has("left")) {
    return [{
      x: v537,
      y: 0
    }, {
      x: v537,
      y: -v539
    }, {
      x: v538 - v537,
      y: -v539
    }, {
      x: v538 - v537,
      y: -v536 + v539
    }, {
      x: v537,
      y: -v536 + v539
    }, {
      x: v537,
      y: -v536
    }, {
      x: 0,
      y: -v536 / 2
    }];
  }
  if (v534.has("up")) {
    return [{
      x: v537,
      y: -v539
    }, {
      x: v537,
      y: -v536 + v539
    }, {
      x: 0,
      y: -v536 + v539
    }, {
      x: v538 / 2,
      y: -v536
    }, {
      x: v538,
      y: -v536 + v539
    }, {
      x: v538 - v537,
      y: -v536 + v539
    }, {
      x: v538 - v537,
      y: -v539
    }];
  }
  if (v534.has("down")) {
    return [{
      x: v538 / 2,
      y: 0
    }, {
      x: 0,
      y: -v539
    }, {
      x: v537,
      y: -v539
    }, {
      x: v537,
      y: -v536 + v539
    }, {
      x: v538 - v537,
      y: -v536 + v539
    }, {
      x: v538 - v537,
      y: -v539
    }, {
      x: v538,
      y: -v539
    }];
  }
  return [{
    x: 0,
    y: 0
  }];
}, "getArrowPoints");
function intersectNode(v540, v541) {
  return v540.intersect(v541);
}
v27(intersectNode, "intersectNode");
var intersect_node_default = intersectNode;
function intersectEllipse(v542, v543, v544, v545) {
  var v546 = v542.x;
  var v547 = v542.y;
  var v548 = v546 - v545.x;
  var v549 = v547 - v545.y;
  var v550 = Math.sqrt(v543 * v543 * v549 * v549 + v544 * v544 * v548 * v548);
  var v551 = Math.abs(v543 * v544 * v548 / v550);
  if (v545.x < v546) {
    v551 = -v551;
  }
  var v552 = Math.abs(v543 * v544 * v549 / v550);
  if (v545.y < v547) {
    v552 = -v552;
  }
  return {
    x: v546 + v551,
    y: v547 + v552
  };
}
v27(intersectEllipse, "intersectEllipse");
var intersect_ellipse_default = intersectEllipse;
function intersectCircle(v553, v554, v555) {
  return intersect_ellipse_default(v553, v554, v554, v555);
}
v27(intersectCircle, "intersectCircle");
var intersect_circle_default = intersectCircle;
function intersectLine(v556, v557, v558, v559) {
  var v560;
  var v561;
  var v562;
  var v563;
  var v564;
  var v565;
  var v566;
  var v567;
  var v568;
  var v569;
  var v570;
  var v571;
  var v572;
  var v573;
  var v574;
  v560 = v557.y - v556.y;
  v562 = v556.x - v557.x;
  v564 = v557.x * v556.y - v556.x * v557.y;
  v568 = v560 * v558.x + v562 * v558.y + v564;
  v569 = v560 * v559.x + v562 * v559.y + v564;
  if (v568 !== 0 && v569 !== 0 && sameSign(v568, v569)) {
    return;
  }
  v561 = v559.y - v558.y;
  v563 = v558.x - v559.x;
  v565 = v559.x * v558.y - v558.x * v559.y;
  v566 = v561 * v556.x + v563 * v556.y + v565;
  v567 = v561 * v557.x + v563 * v557.y + v565;
  if (v566 !== 0 && v567 !== 0 && sameSign(v566, v567)) {
    return;
  }
  v570 = v560 * v563 - v561 * v562;
  if (v570 === 0) {
    return;
  }
  v571 = Math.abs(v570 / 2);
  v572 = v562 * v565 - v563 * v564;
  v573 = v572 < 0 ? (v572 - v571) / v570 : (v572 + v571) / v570;
  v572 = v561 * v564 - v560 * v565;
  v574 = v572 < 0 ? (v572 - v571) / v570 : (v572 + v571) / v570;
  return {
    x: v573,
    y: v574
  };
}
v27(intersectLine, "intersectLine");
function sameSign(v575, v576) {
  return v575 * v576 > 0;
}
v27(sameSign, "sameSign");
var intersect_line_default = intersectLine;
var intersect_polygon_default = intersectPolygon;
function intersectPolygon(v577, v578, v579) {
  var v580 = v577.x;
  var v581 = v577.y;
  var v582 = [];
  var v583 = Number.POSITIVE_INFINITY;
  var v584 = Number.POSITIVE_INFINITY;
  if (typeof v578.forEach === "function") {
    v578.forEach(function (v585) {
      v583 = Math.min(v583, v585.x);
      v584 = Math.min(v584, v585.y);
    });
  } else {
    v583 = Math.min(v583, v578.x);
    v584 = Math.min(v584, v578.y);
  }
  var v586 = v580 - v577.width / 2 - v583;
  var v587 = v581 - v577.height / 2 - v584;
  for (var v588 = 0; v588 < v578.length; v588++) {
    var v589 = v578[v588];
    var v590 = v578[v588 < v578.length - 1 ? v588 + 1 : 0];
    var v591 = intersect_line_default(v577, v579, {
      x: v586 + v589.x,
      y: v587 + v589.y
    }, {
      x: v586 + v590.x,
      y: v587 + v590.y
    });
    if (v591) {
      v582.push(v591);
    }
  }
  if (!v582.length) {
    return v577;
  }
  if (v582.length > 1) {
    v582.sort(function (v592, v593) {
      var v594 = v592.x - v579.x;
      var v595 = v592.y - v579.y;
      var v596 = Math.sqrt(v594 * v594 + v595 * v595);
      var v597 = v593.x - v579.x;
      var v598 = v593.y - v579.y;
      var v599 = Math.sqrt(v597 * v597 + v598 * v598);
      if (v596 < v599) {
        return -1;
      } else if (v596 === v599) {
        return 0;
      } else {
        return 1;
      }
    });
  }
  return v582[0];
}
v27(intersectPolygon, "intersectPolygon");
var intersectRect = v27((v600, v601) => {
  var v602 = v600.x;
  var v603 = v600.y;
  var v604 = v601.x - v602;
  var v605 = v601.y - v603;
  var v606 = v600.width / 2;
  var v607 = v600.height / 2;
  var v608;
  var v609;
  if (Math.abs(v605) * v606 > Math.abs(v604) * v607) {
    if (v605 < 0) {
      v607 = -v607;
    }
    v608 = v605 === 0 ? 0 : v607 * v604 / v605;
    v609 = v607;
  } else {
    if (v604 < 0) {
      v606 = -v606;
    }
    v608 = v606;
    v609 = v604 === 0 ? 0 : v606 * v605 / v604;
  }
  return {
    x: v602 + v608,
    y: v603 + v609
  };
}, "intersectRect");
var intersect_rect_default = intersectRect;
var intersect_default = {
  node: intersect_node_default,
  circle: intersect_circle_default,
  ellipse: intersect_ellipse_default,
  polygon: intersect_polygon_default,
  rect: intersect_rect_default
};
var labelHelper = v27(async (v610, v611, v612, v613) => {
  const v614 = v34();
  let v615;
  const v616 = v611.useHtmlLabels || v39(v614);
  if (!v612) {
    v615 = "node default";
  } else {
    v615 = v612;
  }
  const v617 = v610.insert("g").attr("class", v615).attr("id", v611.domId || v611.id);
  const v618 = v617.insert("g").attr("class", "label").attr("style", v611.labelStyle);
  let v619;
  if (v611.labelText === undefined) {
    v619 = "";
  } else {
    v619 = typeof v611.labelText === "string" ? v611.labelText : v611.labelText[0];
  }
  let v620;
  if (v611.labelType === "markdown") {
    v620 = v40(v618, v46(v47(v619), v614), {
      useHtmlLabels: v616,
      width: v611.width || v614.flowchart.wrappingWidth,
      classes: "markdown-node-label"
    }, v614);
  } else {
    v620 = await createLabel_default(v618, v46(v47(v619), v614), v611.labelStyle, false, v613);
  }
  let v621 = v620.getBBox();
  const v622 = v611.padding / 2;
  if (v39(v614)) {
    const v623 = v620.children[0];
    const v624 = v29(v620);
    await v48(v623, v619);
    v621 = v623.getBoundingClientRect();
    v624.attr("width", v621.width);
    v624.attr("height", v621.height);
  }
  if (v616) {
    v618.attr("transform", "translate(" + -v621.width / 2 + ", " + -v621.height / 2 + ")");
  } else {
    v618.attr("transform", "translate(0, " + -v621.height / 2 + ")");
  }
  if (v611.centerLabel) {
    v618.attr("transform", "translate(" + -v621.width / 2 + ", " + -v621.height / 2 + ")");
  }
  v618.insert("rect", ":first-child");
  return {
    shapeSvg: v617,
    bbox: v621,
    halfPadding: v622,
    label: v618
  };
}, "labelHelper");
var updateNodeBounds = v27((v625, v626) => {
  const v627 = v626.node().getBBox();
  v625.width = v627.width;
  v625.height = v627.height;
}, "updateNodeBounds");
function insertPolygonShape(v628, v629, v630, v631) {
  return v628.insert("polygon", ":first-child").attr("points", v631.map(function (v632) {
    return v632.x + "," + v632.y;
  }).join(" ")).attr("class", "label-container").attr("transform", "translate(" + -v629 / 2 + "," + v630 / 2 + ")");
}
v27(insertPolygonShape, "insertPolygonShape");
var note = v27(async (v633, v634) => {
  const v635 = v634.useHtmlLabels || v39(v34());
  if (!v635) {
    v634.centerLabel = true;
  }
  const {
    shapeSvg: v636,
    bbox: v637,
    halfPadding: v638
  } = await labelHelper(v633, v634, "node " + v634.classes, true);
  v31.info("Classes = ", v634.classes);
  const v639 = v636.insert("rect", ":first-child");
  v639.attr("rx", v634.rx).attr("ry", v634.ry).attr("x", -v637.width / 2 - v638).attr("y", -v637.height / 2 - v638).attr("width", v637.width + v634.padding).attr("height", v637.height + v634.padding);
  updateNodeBounds(v634, v639);
  v634.intersect = function (v640) {
    return intersect_default.rect(v634, v640);
  };
  return v636;
}, "note");
var note_default = note;
var formatClass = v27(v641 => {
  if (v641) {
    return " " + v641;
  }
  return "";
}, "formatClass");
var getClassesFromNode = v27((v642, v643) => {
  return "" + (v643 ? v643 : "node default") + formatClass(v642.classes) + " " + formatClass(v642.class);
}, "getClassesFromNode");
var question = v27(async (v644, v645) => {
  const {
    shapeSvg: v646,
    bbox: v647
  } = await labelHelper(v644, v645, getClassesFromNode(v645, undefined), true);
  const v648 = v647.width + v645.padding;
  const v649 = v647.height + v645.padding;
  const v650 = v648 + v649;
  const v651 = [{
    x: v650 / 2,
    y: 0
  }, {
    x: v650,
    y: -v650 / 2
  }, {
    x: v650 / 2,
    y: -v650
  }, {
    x: 0,
    y: -v650 / 2
  }];
  v31.info("Question main (Circle)");
  const v652 = insertPolygonShape(v646, v650, v650, v651);
  v652.attr("style", v645.style);
  updateNodeBounds(v645, v652);
  v645.intersect = function (v653) {
    v31.warn("Intersect called");
    return intersect_default.polygon(v645, v651, v653);
  };
  return v646;
}, "question");
var choice = v27((v654, v655) => {
  const v656 = v654.insert("g").attr("class", "node default").attr("id", v655.domId || v655.id);
  const v657 = 28;
  const v658 = [{
    x: 0,
    y: v657 / 2
  }, {
    x: v657 / 2,
    y: 0
  }, {
    x: 0,
    y: -v657 / 2
  }, {
    x: -v657 / 2,
    y: 0
  }];
  const v659 = v656.insert("polygon", ":first-child").attr("points", v658.map(function (v660) {
    return v660.x + "," + v660.y;
  }).join(" "));
  v659.attr("class", "state-start").attr("r", 7).attr("width", 28).attr("height", 28);
  v655.width = 28;
  v655.height = 28;
  v655.intersect = function (v661) {
    return intersect_default.circle(v655, 14, v661);
  };
  return v656;
}, "choice");
var hexagon = v27(async (v662, v663) => {
  const {
    shapeSvg: v664,
    bbox: v665
  } = await labelHelper(v662, v663, getClassesFromNode(v663, undefined), true);
  const v666 = 4;
  const v667 = v663.positioned ? v663.height : v665.height + v663.padding;
  const v668 = v667 / v666;
  const v669 = v663.positioned ? v663.width : v665.width + v668 * 2 + v663.padding;
  const v670 = [{
    x: v668,
    y: 0
  }, {
    x: v669 - v668,
    y: 0
  }, {
    x: v669,
    y: -v667 / 2
  }, {
    x: v669 - v668,
    y: -v667
  }, {
    x: v668,
    y: -v667
  }, {
    x: 0,
    y: -v667 / 2
  }];
  const v671 = insertPolygonShape(v664, v669, v667, v670);
  v671.attr("style", v663.style);
  updateNodeBounds(v663, v671);
  v663.intersect = function (v672) {
    return intersect_default.polygon(v663, v670, v672);
  };
  return v664;
}, "hexagon");
var block_arrow = v27(async (v673, v674) => {
  const {
    shapeSvg: v675,
    bbox: v676
  } = await labelHelper(v673, v674, undefined, true);
  const v677 = 2;
  const v678 = v676.height + v674.padding * 2;
  const v679 = v678 / v677;
  const v680 = v676.width + v679 * 2 + v674.padding;
  const v681 = v674.positioned && (v674.widthInColumns ?? 1) > 1 && v674.width > v680;
  const v682 = v681 ? v674.width : v680;
  const v683 = getArrowPoints(v674.directions, v676, v674, v682);
  const v684 = insertPolygonShape(v675, v682, v678, v683);
  v684.attr("style", v674.style);
  updateNodeBounds(v674, v684);
  v674.intersect = function (v685) {
    return intersect_default.polygon(v674, v683, v685);
  };
  return v675;
}, "block_arrow");
var rect_left_inv_arrow = v27(async (v686, v687) => {
  const {
    shapeSvg: v688,
    bbox: v689
  } = await labelHelper(v686, v687, getClassesFromNode(v687, undefined), true);
  const v690 = v689.width + v687.padding;
  const v691 = v689.height + v687.padding;
  const v692 = [{
    x: -v691 / 2,
    y: 0
  }, {
    x: v690,
    y: 0
  }, {
    x: v690,
    y: -v691
  }, {
    x: -v691 / 2,
    y: -v691
  }, {
    x: 0,
    y: -v691 / 2
  }];
  const v693 = insertPolygonShape(v688, v690, v691, v692);
  v693.attr("style", v687.style);
  v687.width = v690 + v691;
  v687.height = v691;
  v687.intersect = function (v694) {
    return intersect_default.polygon(v687, v692, v694);
  };
  return v688;
}, "rect_left_inv_arrow");
var lean_right = v27(async (v695, v696) => {
  const {
    shapeSvg: v697,
    bbox: v698
  } = await labelHelper(v695, v696, getClassesFromNode(v696), true);
  const v699 = v698.width + v696.padding;
  const v700 = v698.height + v696.padding;
  const v701 = [{
    x: v700 * -2 / 6,
    y: 0
  }, {
    x: v699 - v700 / 6,
    y: 0
  }, {
    x: v699 + v700 * 2 / 6,
    y: -v700
  }, {
    x: v700 / 6,
    y: -v700
  }];
  const v702 = insertPolygonShape(v697, v699, v700, v701);
  v702.attr("style", v696.style);
  updateNodeBounds(v696, v702);
  v696.intersect = function (v703) {
    return intersect_default.polygon(v696, v701, v703);
  };
  return v697;
}, "lean_right");
var lean_left = v27(async (v704, v705) => {
  const {
    shapeSvg: v706,
    bbox: v707
  } = await labelHelper(v704, v705, getClassesFromNode(v705, undefined), true);
  const v708 = v707.width + v705.padding;
  const v709 = v707.height + v705.padding;
  const v710 = [{
    x: v709 * 2 / 6,
    y: 0
  }, {
    x: v708 + v709 / 6,
    y: 0
  }, {
    x: v708 - v709 * 2 / 6,
    y: -v709
  }, {
    x: -v709 / 6,
    y: -v709
  }];
  const v711 = insertPolygonShape(v706, v708, v709, v710);
  v711.attr("style", v705.style);
  updateNodeBounds(v705, v711);
  v705.intersect = function (v712) {
    return intersect_default.polygon(v705, v710, v712);
  };
  return v706;
}, "lean_left");
var trapezoid = v27(async (v713, v714) => {
  const {
    shapeSvg: v715,
    bbox: v716
  } = await labelHelper(v713, v714, getClassesFromNode(v714, undefined), true);
  const v717 = v716.width + v714.padding;
  const v718 = v716.height + v714.padding;
  const v719 = [{
    x: v718 * -2 / 6,
    y: 0
  }, {
    x: v717 + v718 * 2 / 6,
    y: 0
  }, {
    x: v717 - v718 / 6,
    y: -v718
  }, {
    x: v718 / 6,
    y: -v718
  }];
  const v720 = insertPolygonShape(v715, v717, v718, v719);
  v720.attr("style", v714.style);
  updateNodeBounds(v714, v720);
  v714.intersect = function (v721) {
    return intersect_default.polygon(v714, v719, v721);
  };
  return v715;
}, "trapezoid");
var inv_trapezoid = v27(async (v722, v723) => {
  const {
    shapeSvg: v724,
    bbox: v725
  } = await labelHelper(v722, v723, getClassesFromNode(v723, undefined), true);
  const v726 = v725.width + v723.padding;
  const v727 = v725.height + v723.padding;
  const v728 = [{
    x: v727 / 6,
    y: 0
  }, {
    x: v726 - v727 / 6,
    y: 0
  }, {
    x: v726 + v727 * 2 / 6,
    y: -v727
  }, {
    x: v727 * -2 / 6,
    y: -v727
  }];
  const v729 = insertPolygonShape(v724, v726, v727, v728);
  v729.attr("style", v723.style);
  updateNodeBounds(v723, v729);
  v723.intersect = function (v730) {
    return intersect_default.polygon(v723, v728, v730);
  };
  return v724;
}, "inv_trapezoid");
var rect_right_inv_arrow = v27(async (v731, v732) => {
  const {
    shapeSvg: v733,
    bbox: v734
  } = await labelHelper(v731, v732, getClassesFromNode(v732, undefined), true);
  const v735 = v734.width + v732.padding;
  const v736 = v734.height + v732.padding;
  const v737 = [{
    x: 0,
    y: 0
  }, {
    x: v735 + v736 / 2,
    y: 0
  }, {
    x: v735,
    y: -v736 / 2
  }, {
    x: v735 + v736 / 2,
    y: -v736
  }, {
    x: 0,
    y: -v736
  }];
  const v738 = insertPolygonShape(v733, v735, v736, v737);
  v738.attr("style", v732.style);
  updateNodeBounds(v732, v738);
  v732.intersect = function (v739) {
    return intersect_default.polygon(v732, v737, v739);
  };
  return v733;
}, "rect_right_inv_arrow");
var cylinder = v27(async (v740, v741) => {
  const {
    shapeSvg: v742,
    bbox: v743
  } = await labelHelper(v740, v741, getClassesFromNode(v741, undefined), true);
  const v744 = v743.width + v741.padding;
  const v745 = v744 / 2;
  const v746 = v745 / (2.5 + v744 / 50);
  const v747 = v743.height + v746 + v741.padding;
  const v748 = "M 0," + v746 + " a " + v745 + "," + v746 + " 0,0,0 " + v744 + " 0 a " + v745 + "," + v746 + " 0,0,0 " + -v744 + " 0 l 0," + v747 + " a " + v745 + "," + v746 + " 0,0,0 " + v744 + " 0 l 0," + -v747;
  const v749 = v742.attr("label-offset-y", v746).insert("path", ":first-child").attr("style", v741.style).attr("d", v748).attr("transform", "translate(" + -v744 / 2 + "," + -(v747 / 2 + v746) + ")");
  updateNodeBounds(v741, v749);
  v741.intersect = function (v750) {
    const v751 = intersect_default.rect(v741, v750);
    const v752 = v751.x - v741.x;
    if (v745 != 0 && (Math.abs(v752) < v741.width / 2 || Math.abs(v752) == v741.width / 2 && Math.abs(v751.y - v741.y) > v741.height / 2 - v746)) {
      let v753 = v746 * v746 * (1 - v752 * v752 / (v745 * v745));
      if (v753 != 0) {
        v753 = Math.sqrt(v753);
      }
      v753 = v746 - v753;
      if (v750.y - v741.y > 0) {
        v753 = -v753;
      }
      v751.y += v753;
    }
    return v751;
  };
  return v742;
}, "cylinder");
var rect = v27(async (v754, v755) => {
  const {
    shapeSvg: v756,
    bbox: v757,
    halfPadding: v758
  } = await labelHelper(v754, v755, "node " + v755.classes + " " + v755.class, true);
  const v759 = v756.insert("rect", ":first-child");
  const v760 = v755.positioned ? v755.width : v757.width + v755.padding;
  const v761 = v755.positioned ? v755.height : v757.height + v755.padding;
  const v762 = v755.positioned ? -v760 / 2 : -v757.width / 2 - v758;
  const v763 = v755.positioned ? -v761 / 2 : -v757.height / 2 - v758;
  v759.attr("class", "basic label-container").attr("style", v755.style).attr("rx", v755.rx).attr("ry", v755.ry).attr("x", v762).attr("y", v763).attr("width", v760).attr("height", v761);
  if (v755.props) {
    const v764 = new Set(Object.keys(v755.props));
    if (v755.props.borders) {
      applyNodePropertyBorders(v759, v755.props.borders, v760, v761);
      v764.delete("borders");
    }
    v764.forEach(v765 => {
      v31.warn("Unknown node property " + v765);
    });
  }
  updateNodeBounds(v755, v759);
  v755.intersect = function (v766) {
    return intersect_default.rect(v755, v766);
  };
  return v756;
}, "rect");
var composite = v27(async (v767, v768) => {
  const {
    shapeSvg: v769,
    bbox: v770,
    halfPadding: v771
  } = await labelHelper(v767, v768, "node " + v768.classes, true);
  const v772 = v769.insert("rect", ":first-child");
  const v773 = v768.positioned ? v768.width : v770.width + v768.padding;
  const v774 = v768.positioned ? v768.height : v770.height + v768.padding;
  const v775 = v768.positioned ? -v773 / 2 : -v770.width / 2 - v771;
  const v776 = v768.positioned ? -v774 / 2 : -v770.height / 2 - v771;
  v772.attr("class", "basic cluster composite label-container").attr("style", v768.style).attr("rx", v768.rx).attr("ry", v768.ry).attr("x", v775).attr("y", v776).attr("width", v773).attr("height", v774);
  if (v768.props) {
    const v777 = new Set(Object.keys(v768.props));
    if (v768.props.borders) {
      applyNodePropertyBorders(v772, v768.props.borders, v773, v774);
      v777.delete("borders");
    }
    v777.forEach(v778 => {
      v31.warn("Unknown node property " + v778);
    });
  }
  updateNodeBounds(v768, v772);
  v768.intersect = function (v779) {
    return intersect_default.rect(v768, v779);
  };
  return v769;
}, "composite");
var labelRect = v27(async (v780, v781) => {
  const {
    shapeSvg: v782
  } = await labelHelper(v780, v781, "label", true);
  v31.trace("Classes = ", v781.class);
  const v783 = v782.insert("rect", ":first-child");
  const v784 = 0;
  const v785 = 0;
  v783.attr("width", v784).attr("height", v785);
  v782.attr("class", "label edgeLabel");
  if (v781.props) {
    const v786 = new Set(Object.keys(v781.props));
    if (v781.props.borders) {
      applyNodePropertyBorders(v783, v781.props.borders, v784, v785);
      v786.delete("borders");
    }
    v786.forEach(v787 => {
      v31.warn("Unknown node property " + v787);
    });
  }
  updateNodeBounds(v781, v783);
  v781.intersect = function (v788) {
    return intersect_default.rect(v781, v788);
  };
  return v782;
}, "labelRect");
function applyNodePropertyBorders(v789, v790, v791, v792) {
  const v793 = [];
  const v794 = v27(v795 => {
    v793.push(v795, 0);
  }, "addBorder");
  const v796 = v27(v797 => {
    v793.push(0, v797);
  }, "skipBorder");
  if (v790.includes("t")) {
    v31.debug("add top border");
    v794(v791);
  } else {
    v796(v791);
  }
  if (v790.includes("r")) {
    v31.debug("add right border");
    v794(v792);
  } else {
    v796(v792);
  }
  if (v790.includes("b")) {
    v31.debug("add bottom border");
    v794(v791);
  } else {
    v796(v791);
  }
  if (v790.includes("l")) {
    v31.debug("add left border");
    v794(v792);
  } else {
    v796(v792);
  }
  v789.attr("stroke-dasharray", v793.join(" "));
}
v27(applyNodePropertyBorders, "applyNodePropertyBorders");
var rectWithTitle = v27(async (v798, v799) => {
  let v800;
  if (!v799.classes) {
    v800 = "node default";
  } else {
    v800 = "node " + v799.classes;
  }
  const v801 = v798.insert("g").attr("class", v800).attr("id", v799.domId || v799.id);
  const v802 = v801.insert("rect", ":first-child");
  const v803 = v801.insert("line");
  const v804 = v801.insert("g").attr("class", "label");
  const v805 = v799.labelText.flat ? v799.labelText.flat() : v799.labelText;
  let v806 = "";
  if (typeof v805 === "object") {
    v806 = v805[0];
  } else {
    v806 = v805;
  }
  v31.info("Label text abc79", v806, v805, typeof v805 === "object");
  const v807 = await createLabel_default(v804, v806, v799.labelStyle, true, true);
  let v808 = {
    width: 0,
    height: 0
  };
  if (v39(v34())) {
    const v809 = v807.children[0];
    const v810 = v29(v807);
    v808 = v809.getBoundingClientRect();
    v810.attr("width", v808.width);
    v810.attr("height", v808.height);
  }
  v31.info("Text 2", v805);
  const v811 = v805.slice(1, v805.length);
  let v812 = v807.getBBox();
  const v813 = await createLabel_default(v804, v811.join ? v811.join("<br/>") : v811, v799.labelStyle, true, true);
  if (v39(v34())) {
    const v814 = v813.children[0];
    const v815 = v29(v813);
    v808 = v814.getBoundingClientRect();
    v815.attr("width", v808.width);
    v815.attr("height", v808.height);
  }
  const v816 = v799.padding / 2;
  v29(v813).attr("transform", "translate( " + (v808.width > v812.width ? 0 : (v812.width - v808.width) / 2) + ", " + (v812.height + v816 + 5) + ")");
  v29(v807).attr("transform", "translate( " + (v808.width < v812.width ? 0 : -(v812.width - v808.width) / 2) + ", 0)");
  v808 = v804.node().getBBox();
  v804.attr("transform", "translate(" + -v808.width / 2 + ", " + (-v808.height / 2 - v816 + 3) + ")");
  v802.attr("class", "outer title-state").attr("x", -v808.width / 2 - v816).attr("y", -v808.height / 2 - v816).attr("width", v808.width + v799.padding).attr("height", v808.height + v799.padding);
  v803.attr("class", "divider").attr("x1", -v808.width / 2 - v816).attr("x2", v808.width / 2 + v816).attr("y1", -v808.height / 2 - v816 + v812.height + v816).attr("y2", -v808.height / 2 - v816 + v812.height + v816);
  updateNodeBounds(v799, v802);
  v799.intersect = function (v817) {
    return intersect_default.rect(v799, v817);
  };
  return v801;
}, "rectWithTitle");
var stadium = v27(async (v818, v819) => {
  const {
    shapeSvg: v820,
    bbox: v821
  } = await labelHelper(v818, v819, getClassesFromNode(v819, undefined), true);
  const v822 = v821.height + v819.padding;
  const v823 = v821.width + v822 / 4 + v819.padding;
  const v824 = v820.insert("rect", ":first-child").attr("style", v819.style).attr("rx", v822 / 2).attr("ry", v822 / 2).attr("x", -v823 / 2).attr("y", -v822 / 2).attr("width", v823).attr("height", v822);
  updateNodeBounds(v819, v824);
  v819.intersect = function (v825) {
    return intersect_default.rect(v819, v825);
  };
  return v820;
}, "stadium");
var circle2 = v27(async (v826, v827) => {
  const {
    shapeSvg: v828,
    bbox: v829,
    halfPadding: v830
  } = await labelHelper(v826, v827, getClassesFromNode(v827, undefined), true);
  const v831 = v828.insert("circle", ":first-child");
  v831.attr("style", v827.style).attr("rx", v827.rx).attr("ry", v827.ry).attr("r", v829.width / 2 + v830).attr("width", v829.width + v827.padding).attr("height", v829.height + v827.padding);
  v31.info("Circle main");
  updateNodeBounds(v827, v831);
  v827.intersect = function (v832) {
    v31.info("Circle intersect", v827, v829.width / 2 + v830, v832);
    return intersect_default.circle(v827, v829.width / 2 + v830, v832);
  };
  return v828;
}, "circle");
var doublecircle = v27(async (v833, v834) => {
  const {
    shapeSvg: v835,
    bbox: v836,
    halfPadding: v837
  } = await labelHelper(v833, v834, getClassesFromNode(v834, undefined), true);
  const v838 = 5;
  const v839 = v835.insert("g", ":first-child");
  const v840 = v839.insert("circle");
  const v841 = v839.insert("circle");
  v839.attr("class", v834.class);
  v840.attr("style", v834.style).attr("rx", v834.rx).attr("ry", v834.ry).attr("r", v836.width / 2 + v837 + v838).attr("width", v836.width + v834.padding + v838 * 2).attr("height", v836.height + v834.padding + v838 * 2);
  v841.attr("style", v834.style).attr("rx", v834.rx).attr("ry", v834.ry).attr("r", v836.width / 2 + v837).attr("width", v836.width + v834.padding).attr("height", v836.height + v834.padding);
  v31.info("DoubleCircle main");
  updateNodeBounds(v834, v840);
  v834.intersect = function (v842) {
    v31.info("DoubleCircle intersect", v834, v836.width / 2 + v837 + v838, v842);
    return intersect_default.circle(v834, v836.width / 2 + v837 + v838, v842);
  };
  return v835;
}, "doublecircle");
var subroutine = v27(async (v843, v844) => {
  const {
    shapeSvg: v845,
    bbox: v846
  } = await labelHelper(v843, v844, getClassesFromNode(v844, undefined), true);
  const v847 = v846.width + v844.padding;
  const v848 = v846.height + v844.padding;
  const v849 = [{
    x: 0,
    y: 0
  }, {
    x: v847,
    y: 0
  }, {
    x: v847,
    y: -v848
  }, {
    x: 0,
    y: -v848
  }, {
    x: 0,
    y: 0
  }, {
    x: -8,
    y: 0
  }, {
    x: v847 + 8,
    y: 0
  }, {
    x: v847 + 8,
    y: -v848
  }, {
    x: -8,
    y: -v848
  }, {
    x: -8,
    y: 0
  }];
  const v850 = insertPolygonShape(v845, v847, v848, v849);
  v850.attr("style", v844.style);
  updateNodeBounds(v844, v850);
  v844.intersect = function (v851) {
    return intersect_default.polygon(v844, v849, v851);
  };
  return v845;
}, "subroutine");
var start = v27((v852, v853) => {
  const v854 = v852.insert("g").attr("class", "node default").attr("id", v853.domId || v853.id);
  const v855 = v854.insert("circle", ":first-child");
  v855.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  updateNodeBounds(v853, v855);
  v853.intersect = function (v856) {
    return intersect_default.circle(v853, 7, v856);
  };
  return v854;
}, "start");
var forkJoin = v27((v857, v858, v859) => {
  const v860 = v857.insert("g").attr("class", "node default").attr("id", v858.domId || v858.id);
  let v861 = 70;
  let v862 = 10;
  if (v859 === "LR") {
    v861 = 10;
    v862 = 70;
  }
  const v863 = v860.append("rect").attr("x", v861 * -1 / 2).attr("y", v862 * -1 / 2).attr("width", v861).attr("height", v862).attr("class", "fork-join");
  updateNodeBounds(v858, v863);
  v858.height = v858.height + v858.padding / 2;
  v858.width = v858.width + v858.padding / 2;
  v858.intersect = function (v864) {
    return intersect_default.rect(v858, v864);
  };
  return v860;
}, "forkJoin");
var end = v27((v865, v866) => {
  const v867 = v865.insert("g").attr("class", "node default").attr("id", v866.domId || v866.id);
  const v868 = v867.insert("circle", ":first-child");
  const v869 = v867.insert("circle", ":first-child");
  v869.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  v868.attr("class", "state-end").attr("r", 5).attr("width", 10).attr("height", 10);
  updateNodeBounds(v866, v869);
  v866.intersect = function (v870) {
    return intersect_default.circle(v866, 7, v870);
  };
  return v867;
}, "end");
var class_box = v27(async (v871, v872) => {
  const v873 = v872.padding / 2;
  const v874 = 4;
  const v875 = 8;
  let v876;
  if (!v872.classes) {
    v876 = "node default";
  } else {
    v876 = "node " + v872.classes;
  }
  const v877 = v871.insert("g").attr("class", v876).attr("id", v872.domId || v872.id);
  const v878 = v877.insert("rect", ":first-child");
  const v879 = v877.insert("line");
  const v880 = v877.insert("line");
  let v881 = 0;
  let v882 = v874;
  const v883 = v877.insert("g").attr("class", "label");
  let v884 = 0;
  const v885 = v872.classData.annotations?.[0];
  const v886 = v872.classData.annotations[0] ? "«" + v872.classData.annotations[0] + "»" : "";
  const v887 = await createLabel_default(v883, v886, v872.labelStyle, true, true);
  let v888 = v887.getBBox();
  if (v39(v34())) {
    const v889 = v887.children[0];
    const v890 = v29(v887);
    v888 = v889.getBoundingClientRect();
    v890.attr("width", v888.width);
    v890.attr("height", v888.height);
  }
  if (v872.classData.annotations[0]) {
    v882 += v888.height + v874;
    v881 += v888.width;
  }
  let v891 = v872.classData.label;
  if (v872.classData.type !== undefined && v872.classData.type !== "") {
    if (v39(v34())) {
      v891 += "&lt;" + v872.classData.type + "&gt;";
    } else {
      v891 += "<" + v872.classData.type + ">";
    }
  }
  const v892 = await createLabel_default(v883, v891, v872.labelStyle, true, true);
  v29(v892).attr("class", "classTitle");
  let v893 = v892.getBBox();
  if (v39(v34())) {
    const v894 = v892.children[0];
    const v895 = v29(v892);
    v893 = v894.getBoundingClientRect();
    v895.attr("width", v893.width);
    v895.attr("height", v893.height);
  }
  v882 += v893.height + v874;
  if (v893.width > v881) {
    v881 = v893.width;
  }
  const v896 = [];
  v872.classData.members.forEach(async v897 => {
    const v898 = v897.getDisplayDetails();
    let v899 = v898.displayText;
    if (v39(v34())) {
      v899 = v899.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const v900 = await createLabel_default(v883, v899, v898.cssStyle ? v898.cssStyle : v872.labelStyle, true, true);
    let v901 = v900.getBBox();
    if (v39(v34())) {
      const v902 = v900.children[0];
      const v903 = v29(v900);
      v901 = v902.getBoundingClientRect();
      v903.attr("width", v901.width);
      v903.attr("height", v901.height);
    }
    if (v901.width > v881) {
      v881 = v901.width;
    }
    v882 += v901.height + v874;
    v896.push(v900);
  });
  v882 += v875;
  const v904 = [];
  v872.classData.methods.forEach(async v905 => {
    const v906 = v905.getDisplayDetails();
    let v907 = v906.displayText;
    if (v39(v34())) {
      v907 = v907.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const v908 = await createLabel_default(v883, v907, v906.cssStyle ? v906.cssStyle : v872.labelStyle, true, true);
    let v909 = v908.getBBox();
    if (v39(v34())) {
      const v910 = v908.children[0];
      const v911 = v29(v908);
      v909 = v910.getBoundingClientRect();
      v911.attr("width", v909.width);
      v911.attr("height", v909.height);
    }
    if (v909.width > v881) {
      v881 = v909.width;
    }
    v882 += v909.height + v874;
    v904.push(v908);
  });
  v882 += v875;
  if (v885) {
    let v912 = (v881 - v888.width) / 2;
    v29(v887).attr("transform", "translate( " + (v881 * -1 / 2 + v912) + ", " + v882 * -1 / 2 + ")");
    v884 = v888.height + v874;
  }
  let v913 = (v881 - v893.width) / 2;
  v29(v892).attr("transform", "translate( " + (v881 * -1 / 2 + v913) + ", " + (v882 * -1 / 2 + v884) + ")");
  v884 += v893.height + v874;
  v879.attr("class", "divider").attr("x1", -v881 / 2 - v873).attr("x2", v881 / 2 + v873).attr("y1", -v882 / 2 - v873 + v875 + v884).attr("y2", -v882 / 2 - v873 + v875 + v884);
  v884 += v875;
  v896.forEach(v914 => {
    v29(v914).attr("transform", "translate( " + -v881 / 2 + ", " + (v882 * -1 / 2 + v884 + v875 / 2) + ")");
    const v915 = v914?.getBBox();
    v884 += (v915?.height ?? 0) + v874;
  });
  v884 += v875;
  v880.attr("class", "divider").attr("x1", -v881 / 2 - v873).attr("x2", v881 / 2 + v873).attr("y1", -v882 / 2 - v873 + v875 + v884).attr("y2", -v882 / 2 - v873 + v875 + v884);
  v884 += v875;
  v904.forEach(v916 => {
    v29(v916).attr("transform", "translate( " + -v881 / 2 + ", " + (v882 * -1 / 2 + v884) + ")");
    const v917 = v916?.getBBox();
    v884 += (v917?.height ?? 0) + v874;
  });
  v878.attr("style", v872.style).attr("class", "outer title-state").attr("x", -v881 / 2 - v873).attr("y", -(v882 / 2) - v873).attr("width", v881 + v872.padding).attr("height", v882 + v872.padding);
  updateNodeBounds(v872, v878);
  v872.intersect = function (v918) {
    return intersect_default.rect(v872, v918);
  };
  return v877;
}, "class_box");
var shapes = {
  rhombus: question,
  composite: composite,
  question: question,
  rect: rect,
  labelRect: labelRect,
  rectWithTitle: rectWithTitle,
  choice: choice,
  circle: circle2,
  doublecircle: doublecircle,
  stadium: stadium,
  hexagon: hexagon,
  block_arrow: block_arrow,
  rect_left_inv_arrow: rect_left_inv_arrow,
  lean_right: lean_right,
  lean_left: lean_left,
  trapezoid: trapezoid,
  inv_trapezoid: inv_trapezoid,
  rect_right_inv_arrow: rect_right_inv_arrow,
  cylinder: cylinder,
  start: start,
  end: end,
  note: note_default,
  subroutine: subroutine,
  fork: forkJoin,
  join: forkJoin,
  class_box: class_box
};
var nodeElems = {};
var insertNode = v27(async (v919, v920, v921) => {
  let v922;
  let v923;
  if (v920.link) {
    let v924;
    if (v34().securityLevel === "sandbox") {
      v924 = "_top";
    } else if (v920.linkTarget) {
      v924 = v920.linkTarget || "_blank";
    }
    v922 = v919.insert("svg:a").attr("xlink:href", v920.link).attr("target", v924);
    v923 = await shapes[v920.shape](v922, v920, v921);
  } else {
    v923 = await shapes[v920.shape](v919, v920, v921);
    v922 = v923;
  }
  if (v920.tooltip) {
    v923.attr("title", v920.tooltip);
  }
  if (v920.class) {
    v923.attr("class", "node default " + v920.class);
  }
  nodeElems[v920.id] = v922;
  if (v920.haveCallback) {
    nodeElems[v920.id].attr("class", nodeElems[v920.id].attr("class") + " clickable");
  }
  return v922;
}, "insertNode");
var positionNode = v27(v925 => {
  const v926 = nodeElems[v925.id];
  v31.trace("Transforming node", v925.diff, v925, "translate(" + (v925.x - v925.width / 2 - 5) + ", " + v925.width / 2 + ")");
  const v927 = 8;
  const v928 = v925.diff || 0;
  if (v925.clusterNode) {
    v926.attr("transform", "translate(" + (v925.x + v928 - v925.width / 2) + ", " + (v925.y - v925.height / 2 - v927) + ")");
  } else {
    v926.attr("transform", "translate(" + v925.x + ", " + v925.y + ")");
  }
  return v928;
}, "positionNode");
function getNodeFromBlock(v929, v930, v931 = false) {
  const v932 = v929;
  let v933 = "default";
  if ((v932?.classes?.length || 0) > 0) {
    v933 = (v932?.classes ?? []).join(" ");
  }
  v933 = v933 + " flowchart-label";
  let v934 = 0;
  let v935 = "";
  let v936;
  switch (v932.type) {
    case "round":
      v934 = 5;
      v935 = "rect";
      break;
    case "composite":
      v934 = 0;
      v935 = "composite";
      v936 = 0;
      break;
    case "square":
      v935 = "rect";
      break;
    case "diamond":
      v935 = "question";
      break;
    case "hexagon":
      v935 = "hexagon";
      break;
    case "block_arrow":
      v935 = "block_arrow";
      break;
    case "odd":
      v935 = "rect_left_inv_arrow";
      break;
    case "lean_right":
      v935 = "lean_right";
      break;
    case "lean_left":
      v935 = "lean_left";
      break;
    case "trapezoid":
      v935 = "trapezoid";
      break;
    case "inv_trapezoid":
      v935 = "inv_trapezoid";
      break;
    case "rect_left_inv_arrow":
      v935 = "rect_left_inv_arrow";
      break;
    case "circle":
      v935 = "circle";
      break;
    case "ellipse":
      v935 = "ellipse";
      break;
    case "stadium":
      v935 = "stadium";
      break;
    case "subroutine":
      v935 = "subroutine";
      break;
    case "cylinder":
      v935 = "cylinder";
      break;
    case "group":
      v935 = "rect";
      break;
    case "doublecircle":
      v935 = "doublecircle";
      break;
    default:
      v935 = "rect";
  }
  const v937 = v45(v932?.styles ?? []);
  const v938 = v932.label;
  const v939 = v932.size ?? {
    width: 0,
    height: 0,
    x: 0,
    y: 0
  };
  const v940 = v930.getDiagramId();
  const v941 = {
    labelStyle: v937.labelStyle,
    shape: v935,
    labelText: v938,
    rx: v934,
    ry: v934,
    class: v933,
    style: v937.style,
    id: v932.id,
    domId: v940 ? v940 + "-" + v932.id : v932.id,
    directions: v932.directions,
    width: v939.width,
    height: v939.height,
    x: v939.x,
    y: v939.y,
    positioned: v931,
    intersect: undefined,
    type: v932.type,
    padding: v936 ?? v28()?.block?.padding ?? 0,
    widthInColumns: v932.widthInColumns ?? 1
  };
  return v941;
}
v27(getNodeFromBlock, "getNodeFromBlock");
async function calculateBlockSize(v942, v943, v944) {
  const v945 = getNodeFromBlock(v943, v944, false);
  if (v945.type === "group") {
    return;
  }
  const v946 = v28();
  const v947 = await insertNode(v942, v945, {
    config: v946
  });
  const v948 = v947.node().getBBox();
  const v949 = v944.getBlock(v945.id);
  v949.size = {
    width: v948.width,
    height: v948.height,
    x: 0,
    y: 0,
    node: v947
  };
  v944.setBlock(v949);
  v947.remove();
}
v27(calculateBlockSize, "calculateBlockSize");
async function insertBlockPositioned(v950, v951, v952) {
  const v953 = getNodeFromBlock(v951, v952, true);
  const v954 = v952.getBlock(v953.id);
  if (v954.type !== "space") {
    const v955 = v28();
    await insertNode(v950, v953, {
      config: v955
    });
    v951.intersect = v953?.intersect;
    positionNode(v953);
  }
}
v27(insertBlockPositioned, "insertBlockPositioned");
async function performOperations(v956, v957, v958, v959) {
  for (const v960 of v957) {
    await v959(v956, v960, v958);
    if (v960.children) {
      await performOperations(v956, v960.children, v958, v959);
    }
  }
}
v27(performOperations, "performOperations");
async function calculateBlockSizes(v961, v962, v963) {
  await performOperations(v961, v962, v963, calculateBlockSize);
}
v27(calculateBlockSizes, "calculateBlockSizes");
async function insertBlocks(v964, v965, v966) {
  await performOperations(v964, v965, v966, insertBlockPositioned);
}
v27(insertBlocks, "insertBlocks");
async function insertEdges(v967, v968, v969, v970, v971) {
  const v972 = new v49({
    multigraph: true,
    compound: true
  });
  v972.setGraph({
    rankdir: "TB",
    nodesep: 10,
    ranksep: 10,
    marginx: 8,
    marginy: 8
  });
  for (const v973 of v969) {
    if (v973.size) {
      v972.setNode(v973.id, {
        width: v973.size.width,
        height: v973.size.height,
        intersect: v973.intersect
      });
    }
  }
  for (const v974 of v968) {
    if (v974.start && v974.end) {
      const v975 = v970.getBlock(v974.start);
      const v976 = v970.getBlock(v974.end);
      if (v975?.size && v976?.size) {
        const v977 = v975.size;
        const v978 = v976.size;
        const v979 = [{
          x: v977.x,
          y: v977.y
        }, {
          x: v977.x + (v978.x - v977.x) / 2,
          y: v977.y + (v978.y - v977.y) / 2
        }, {
          x: v978.x,
          y: v978.y
        }];
        const v980 = v971 ? v971 + "-" + v974.id : v974.id;
        const v981 = v974.thickness === "thick" ? "edge-thickness-thick" : "edge-thickness-normal";
        const v982 = v974.pattern === "dotted" ? "edge-pattern-dotted" : "edge-pattern-solid";
        const v983 = v981 + " " + v982 + " flowchart-link LS-a1 LE-b1";
        insertEdge(v967, {
          v: v974.start,
          w: v974.end,
          name: v980
        }, {
          ...v974,
          id: v980,
          arrowTypeEnd: v974.arrowTypeEnd,
          arrowTypeStart: v974.arrowTypeStart,
          points: v979,
          classes: v983
        }, undefined, "block", v972, v971);
        if (v974.label) {
          await insertEdgeLabel(v967, {
            ...v974,
            label: v974.label,
            labelStyle: "stroke: #333; stroke-width: 1.5px;fill:none;",
            arrowTypeEnd: v974.arrowTypeEnd,
            arrowTypeStart: v974.arrowTypeStart,
            points: v979,
            classes: v983
          });
          positionEdgeLabel({
            ...v974,
            x: v979[1].x,
            y: v979[1].y
          }, {
            originalPath: v979
          });
        }
      }
    }
  }
}
v27(insertEdges, "insertEdges");
var getClasses2 = v27(function (v984, v985) {
  return v985.db.getClasses();
}, "getClasses");
var draw = v27(async function (v986, v987, v988, v989) {
  const {
    securityLevel: v990,
    block: v991
  } = v28();
  const v992 = v989.db;
  v992.setDiagramId(v987);
  let v993;
  if (v990 === "sandbox") {
    v993 = v29("#i" + v987);
  }
  const v994 = v990 === "sandbox" ? v29(v993.nodes()[0].contentDocument.body) : v29("body");
  const v995 = v990 === "sandbox" ? v994.select("[id=\"" + v987 + "\"]") : v29("[id=\"" + v987 + "\"]");
  const v996 = ["point", "circle", "cross"];
  markers_default(v995, v996, v989.type, v987);
  const v997 = v992.getBlocks();
  const v998 = v992.getBlocksFlat();
  const v999 = v992.getEdges();
  const v1000 = v995.insert("g").attr("class", "block");
  await calculateBlockSizes(v1000, v997, v992);
  const v1001 = layout(v992);
  await insertBlocks(v1000, v997, v992);
  await insertEdges(v1000, v999, v998, v992, v987);
  if (v1001) {
    const v1002 = v1001;
    const v1003 = Math.max(1, Math.round(v1002.width / v1002.height * 0.125));
    const v1004 = v1002.height + v1003 + 10;
    const v1005 = v1002.width + 10;
    const {
      useMaxWidth: v1006
    } = v991;
    v30(v995, v1004, v1005, !!v1006);
    v31.debug("Here Bounds", v1001, v1002);
    v995.attr("viewBox", v1002.x - 5 + " " + (v1002.y - 5) + " " + (v1002.width + 10) + " " + (v1002.height + 10));
  }
}, "draw");
var blockRenderer_default = {
  draw: draw,
  getClasses: getClasses2
};
var diagram = {
  parser: block_default,
  db: blockDB_default,
  renderer: blockRenderer_default,
  styles: styles_default
};
export { diagram };