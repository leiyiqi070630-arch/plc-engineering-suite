import { g as v1 } from "./chunk-XXDRQBXY-CzLCVi_O.js";
import { s as v2 } from "./chunk-KBJHAD2P-BXgOlElY.js";
import { _ as v3, l as v4, c as v5, v as v6, x as v7, a as v8, b as v9, g as v10, s as v11, n as v12, o as v13, R as v14, k as v15, p as v16, d as v17, N as v18 } from "./index-CXb3UsfP.js";
import { f as v19 } from "./chunk-2GRJ4B5K-DGslyOWI.js";
var parser = function () {
  var v20 = v3(function (v21, v22, v23, v24) {
    v23 = v23 || {};
    v24 = v21.length;
    for (; v24--; v23[v21[v24]] = v22);
    return v23;
  }, "o");
  var v25 = [1, 2];
  var v26 = [1, 3];
  var v27 = [1, 4];
  var v28 = [2, 4];
  var v29 = [1, 9];
  var v30 = [1, 11];
  var v31 = [1, 16];
  var v32 = [1, 17];
  var v33 = [1, 18];
  var v34 = [1, 19];
  var v35 = [1, 33];
  var v36 = [1, 20];
  var v37 = [1, 21];
  var v38 = [1, 22];
  var v39 = [1, 23];
  var v40 = [1, 24];
  var v41 = [1, 26];
  var v42 = [1, 27];
  var v43 = [1, 28];
  var v44 = [1, 29];
  var v45 = [1, 30];
  var v46 = [1, 31];
  var v47 = [1, 32];
  var v48 = [1, 35];
  var v49 = [1, 36];
  var v50 = [1, 37];
  var v51 = [1, 38];
  var v52 = [1, 34];
  var v53 = [1, 4, 5, 16, 17, 19, 21, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 41, 45, 48, 51, 52, 53, 54, 57];
  var v54 = [1, 4, 5, 14, 15, 16, 17, 19, 21, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 39, 40, 41, 45, 48, 51, 52, 53, 54, 57];
  var v55 = [4, 5, 16, 17, 19, 21, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 41, 45, 48, 51, 52, 53, 54, 57];
  var v56 = {
    trace: v3(function v57() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      SPACE: 4,
      NL: 5,
      SD: 6,
      document: 7,
      line: 8,
      statement: 9,
      classDefStatement: 10,
      styleStatement: 11,
      cssClassStatement: 12,
      idStatement: 13,
      DESCR: 14,
      "-->": 15,
      HIDE_EMPTY: 16,
      scale: 17,
      WIDTH: 18,
      COMPOSIT_STATE: 19,
      STRUCT_START: 20,
      STRUCT_STOP: 21,
      STATE_DESCR: 22,
      AS: 23,
      ID: 24,
      FORK: 25,
      JOIN: 26,
      CHOICE: 27,
      CONCURRENT: 28,
      note: 29,
      notePosition: 30,
      NOTE_TEXT: 31,
      direction: 32,
      acc_title: 33,
      acc_title_value: 34,
      acc_descr: 35,
      acc_descr_value: 36,
      acc_descr_multiline_value: 37,
      CLICK: 38,
      STRING: 39,
      HREF: 40,
      classDef: 41,
      CLASSDEF_ID: 42,
      CLASSDEF_STYLEOPTS: 43,
      DEFAULT: 44,
      style: 45,
      STYLE_IDS: 46,
      STYLEDEF_STYLEOPTS: 47,
      class: 48,
      CLASSENTITY_IDS: 49,
      STYLECLASS: 50,
      direction_tb: 51,
      direction_bt: 52,
      direction_rl: 53,
      direction_lr: 54,
      eol: 55,
      ";": 56,
      EDGE_STATE: 57,
      STYLE_SEPARATOR: 58,
      left_of: 59,
      right_of: 60,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      4: "SPACE",
      5: "NL",
      6: "SD",
      14: "DESCR",
      15: "-->",
      16: "HIDE_EMPTY",
      17: "scale",
      18: "WIDTH",
      19: "COMPOSIT_STATE",
      20: "STRUCT_START",
      21: "STRUCT_STOP",
      22: "STATE_DESCR",
      23: "AS",
      24: "ID",
      25: "FORK",
      26: "JOIN",
      27: "CHOICE",
      28: "CONCURRENT",
      29: "note",
      31: "NOTE_TEXT",
      33: "acc_title",
      34: "acc_title_value",
      35: "acc_descr",
      36: "acc_descr_value",
      37: "acc_descr_multiline_value",
      38: "CLICK",
      39: "STRING",
      40: "HREF",
      41: "classDef",
      42: "CLASSDEF_ID",
      43: "CLASSDEF_STYLEOPTS",
      44: "DEFAULT",
      45: "style",
      46: "STYLE_IDS",
      47: "STYLEDEF_STYLEOPTS",
      48: "class",
      49: "CLASSENTITY_IDS",
      50: "STYLECLASS",
      51: "direction_tb",
      52: "direction_bt",
      53: "direction_rl",
      54: "direction_lr",
      56: ";",
      57: "EDGE_STATE",
      58: "STYLE_SEPARATOR",
      59: "left_of",
      60: "right_of"
    },
    productions_: [0, [3, 2], [3, 2], [3, 2], [7, 0], [7, 2], [8, 2], [8, 1], [8, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 2], [9, 3], [9, 4], [9, 1], [9, 2], [9, 1], [9, 4], [9, 3], [9, 6], [9, 1], [9, 1], [9, 1], [9, 1], [9, 4], [9, 4], [9, 1], [9, 2], [9, 2], [9, 1], [9, 5], [9, 5], [10, 3], [10, 3], [11, 3], [12, 3], [32, 1], [32, 1], [32, 1], [32, 1], [55, 1], [55, 1], [13, 1], [13, 1], [13, 3], [13, 3], [30, 1], [30, 1]],
    performAction: v3(function v58(v59, v60, v61, v62, v63, v64, v65) {
      var v66 = v64.length - 1;
      switch (v63) {
        case 3:
          v62.setRootDoc(v64[v66]);
          return v64[v66];
        case 4:
          this.$ = [];
          break;
        case 5:
          if (v64[v66] != "nl") {
            v64[v66 - 1].push(v64[v66]);
            this.$ = v64[v66 - 1];
          }
          break;
        case 6:
        case 7:
          this.$ = v64[v66];
          break;
        case 8:
          this.$ = "nl";
          break;
        case 12:
          this.$ = v64[v66];
          break;
        case 13:
          const v67 = v64[v66 - 1];
          v67.description = v62.trimColon(v64[v66]);
          this.$ = v67;
          break;
        case 14:
          this.$ = {
            stmt: "relation",
            state1: v64[v66 - 2],
            state2: v64[v66]
          };
          break;
        case 15:
          const v68 = v62.trimColon(v64[v66]);
          this.$ = {
            stmt: "relation",
            state1: v64[v66 - 3],
            state2: v64[v66 - 1],
            description: v68
          };
          break;
        case 19:
          this.$ = {
            stmt: "state",
            id: v64[v66 - 3],
            type: "default",
            description: "",
            doc: v64[v66 - 1]
          };
          break;
        case 20:
          var v69 = v64[v66];
          var v70 = v64[v66 - 2].trim();
          if (v64[v66].match(":")) {
            var v71 = v64[v66].split(":");
            v69 = v71[0];
            v70 = [v70, v71[1]];
          }
          this.$ = {
            stmt: "state",
            id: v69,
            type: "default",
            description: v70
          };
          break;
        case 21:
          this.$ = {
            stmt: "state",
            id: v64[v66 - 3],
            type: "default",
            description: v64[v66 - 5],
            doc: v64[v66 - 1]
          };
          break;
        case 22:
          this.$ = {
            stmt: "state",
            id: v64[v66],
            type: "fork"
          };
          break;
        case 23:
          this.$ = {
            stmt: "state",
            id: v64[v66],
            type: "join"
          };
          break;
        case 24:
          this.$ = {
            stmt: "state",
            id: v64[v66],
            type: "choice"
          };
          break;
        case 25:
          this.$ = {
            stmt: "state",
            id: v62.getDividerId(),
            type: "divider"
          };
          break;
        case 26:
          this.$ = {
            stmt: "state",
            id: v64[v66 - 1].trim(),
            note: {
              position: v64[v66 - 2].trim(),
              text: v64[v66].trim()
            }
          };
          break;
        case 29:
          this.$ = v64[v66].trim();
          v62.setAccTitle(this.$);
          break;
        case 30:
        case 31:
          this.$ = v64[v66].trim();
          v62.setAccDescription(this.$);
          break;
        case 32:
          this.$ = {
            stmt: "click",
            id: v64[v66 - 3],
            url: v64[v66 - 2],
            tooltip: v64[v66 - 1]
          };
          break;
        case 33:
          this.$ = {
            stmt: "click",
            id: v64[v66 - 3],
            url: v64[v66 - 1],
            tooltip: ""
          };
          break;
        case 34:
        case 35:
          this.$ = {
            stmt: "classDef",
            id: v64[v66 - 1].trim(),
            classes: v64[v66].trim()
          };
          break;
        case 36:
          this.$ = {
            stmt: "style",
            id: v64[v66 - 1].trim(),
            styleClass: v64[v66].trim()
          };
          break;
        case 37:
          this.$ = {
            stmt: "applyClass",
            id: v64[v66 - 1].trim(),
            styleClass: v64[v66].trim()
          };
          break;
        case 38:
          v62.setDirection("TB");
          this.$ = {
            stmt: "dir",
            value: "TB"
          };
          break;
        case 39:
          v62.setDirection("BT");
          this.$ = {
            stmt: "dir",
            value: "BT"
          };
          break;
        case 40:
          v62.setDirection("RL");
          this.$ = {
            stmt: "dir",
            value: "RL"
          };
          break;
        case 41:
          v62.setDirection("LR");
          this.$ = {
            stmt: "dir",
            value: "LR"
          };
          break;
        case 44:
        case 45:
          this.$ = {
            stmt: "state",
            id: v64[v66].trim(),
            type: "default",
            description: ""
          };
          break;
        case 46:
          this.$ = {
            stmt: "state",
            id: v64[v66 - 2].trim(),
            classes: [v64[v66].trim()],
            type: "default",
            description: ""
          };
          break;
        case 47:
          this.$ = {
            stmt: "state",
            id: v64[v66 - 2].trim(),
            classes: [v64[v66].trim()],
            type: "default",
            description: ""
          };
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: v25,
      5: v26,
      6: v27
    }, {
      1: [3]
    }, {
      3: 5,
      4: v25,
      5: v26,
      6: v27
    }, {
      3: 6,
      4: v25,
      5: v26,
      6: v27
    }, v20([1, 4, 5, 16, 17, 19, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 41, 45, 48, 51, 52, 53, 54, 57], v28, {
      7: 7
    }), {
      1: [2, 1]
    }, {
      1: [2, 2]
    }, {
      1: [2, 3],
      4: v29,
      5: v30,
      8: 8,
      9: 10,
      10: 12,
      11: 13,
      12: 14,
      13: 15,
      16: v31,
      17: v32,
      19: v33,
      22: v34,
      24: v35,
      25: v36,
      26: v37,
      27: v38,
      28: v39,
      29: v40,
      32: 25,
      33: v41,
      35: v42,
      37: v43,
      38: v44,
      41: v45,
      45: v46,
      48: v47,
      51: v48,
      52: v49,
      53: v50,
      54: v51,
      57: v52
    }, v20(v53, [2, 5]), {
      9: 39,
      10: 12,
      11: 13,
      12: 14,
      13: 15,
      16: v31,
      17: v32,
      19: v33,
      22: v34,
      24: v35,
      25: v36,
      26: v37,
      27: v38,
      28: v39,
      29: v40,
      32: 25,
      33: v41,
      35: v42,
      37: v43,
      38: v44,
      41: v45,
      45: v46,
      48: v47,
      51: v48,
      52: v49,
      53: v50,
      54: v51,
      57: v52
    }, v20(v53, [2, 7]), v20(v53, [2, 8]), v20(v53, [2, 9]), v20(v53, [2, 10]), v20(v53, [2, 11]), v20(v53, [2, 12], {
      14: [1, 40],
      15: [1, 41]
    }), v20(v53, [2, 16]), {
      18: [1, 42]
    }, v20(v53, [2, 18], {
      20: [1, 43]
    }), {
      23: [1, 44]
    }, v20(v53, [2, 22]), v20(v53, [2, 23]), v20(v53, [2, 24]), v20(v53, [2, 25]), {
      30: 45,
      31: [1, 46],
      59: [1, 47],
      60: [1, 48]
    }, v20(v53, [2, 28]), {
      34: [1, 49]
    }, {
      36: [1, 50]
    }, v20(v53, [2, 31]), {
      13: 51,
      24: v35,
      57: v52
    }, {
      42: [1, 52],
      44: [1, 53]
    }, {
      46: [1, 54]
    }, {
      49: [1, 55]
    }, v20(v54, [2, 44], {
      58: [1, 56]
    }), v20(v54, [2, 45], {
      58: [1, 57]
    }), v20(v53, [2, 38]), v20(v53, [2, 39]), v20(v53, [2, 40]), v20(v53, [2, 41]), v20(v53, [2, 6]), v20(v53, [2, 13]), {
      13: 58,
      24: v35,
      57: v52
    }, v20(v53, [2, 17]), v20(v55, v28, {
      7: 59
    }), {
      24: [1, 60]
    }, {
      24: [1, 61]
    }, {
      23: [1, 62]
    }, {
      24: [2, 48]
    }, {
      24: [2, 49]
    }, v20(v53, [2, 29]), v20(v53, [2, 30]), {
      39: [1, 63],
      40: [1, 64]
    }, {
      43: [1, 65]
    }, {
      43: [1, 66]
    }, {
      47: [1, 67]
    }, {
      50: [1, 68]
    }, {
      24: [1, 69]
    }, {
      24: [1, 70]
    }, v20(v53, [2, 14], {
      14: [1, 71]
    }), {
      4: v29,
      5: v30,
      8: 8,
      9: 10,
      10: 12,
      11: 13,
      12: 14,
      13: 15,
      16: v31,
      17: v32,
      19: v33,
      21: [1, 72],
      22: v34,
      24: v35,
      25: v36,
      26: v37,
      27: v38,
      28: v39,
      29: v40,
      32: 25,
      33: v41,
      35: v42,
      37: v43,
      38: v44,
      41: v45,
      45: v46,
      48: v47,
      51: v48,
      52: v49,
      53: v50,
      54: v51,
      57: v52
    }, v20(v53, [2, 20], {
      20: [1, 73]
    }), {
      31: [1, 74]
    }, {
      24: [1, 75]
    }, {
      39: [1, 76]
    }, {
      39: [1, 77]
    }, v20(v53, [2, 34]), v20(v53, [2, 35]), v20(v53, [2, 36]), v20(v53, [2, 37]), v20(v54, [2, 46]), v20(v54, [2, 47]), v20(v53, [2, 15]), v20(v53, [2, 19]), v20(v55, v28, {
      7: 78
    }), v20(v53, [2, 26]), v20(v53, [2, 27]), {
      5: [1, 79]
    }, {
      5: [1, 80]
    }, {
      4: v29,
      5: v30,
      8: 8,
      9: 10,
      10: 12,
      11: 13,
      12: 14,
      13: 15,
      16: v31,
      17: v32,
      19: v33,
      21: [1, 81],
      22: v34,
      24: v35,
      25: v36,
      26: v37,
      27: v38,
      28: v39,
      29: v40,
      32: 25,
      33: v41,
      35: v42,
      37: v43,
      38: v44,
      41: v45,
      45: v46,
      48: v47,
      51: v48,
      52: v49,
      53: v50,
      54: v51,
      57: v52
    }, v20(v53, [2, 32]), v20(v53, [2, 33]), v20(v53, [2, 21])],
    defaultActions: {
      5: [2, 1],
      6: [2, 2],
      47: [2, 48],
      48: [2, 49]
    },
    parseError: v3(function v72(v73, v74) {
      if (v74.recoverable) {
        this.trace(v73);
      } else {
        var v75 = new Error(v73);
        v75.hash = v74;
        throw v75;
      }
    }, "parseError"),
    parse: v3(function v76(v77) {
      var v78 = this;
      var v79 = [0];
      var v80 = [];
      var v81 = [null];
      var v82 = [];
      var v83 = this.table;
      var v84 = "";
      var v85 = 0;
      var v86 = 0;
      var v87 = 2;
      var v88 = 1;
      var v89 = v82.slice.call(arguments, 1);
      var v90 = Object.create(this.lexer);
      var v91 = {
        yy: {}
      };
      for (var v92 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v92)) {
          v91.yy[v92] = this.yy[v92];
        }
      }
      v90.setInput(v77, v91.yy);
      v91.yy.lexer = v90;
      v91.yy.parser = this;
      if (typeof v90.yylloc == "undefined") {
        v90.yylloc = {};
      }
      var v93 = v90.yylloc;
      v82.push(v93);
      var v94 = v90.options && v90.options.ranges;
      if (typeof v91.yy.parseError === "function") {
        this.parseError = v91.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v95(v96) {
        v79.length = v79.length - v96 * 2;
        v81.length = v81.length - v96;
        v82.length = v82.length - v96;
      }
      v3(v95, "popStack");
      function v97() {
        var v98;
        v98 = v80.pop() || v90.lex() || v88;
        if (typeof v98 !== "number") {
          if (v98 instanceof Array) {
            v80 = v98;
            v98 = v80.pop();
          }
          v98 = v78.symbols_[v98] || v98;
        }
        return v98;
      }
      v3(v97, "lex");
      var v99;
      var v100;
      var v101;
      var v102;
      var v103 = {};
      var v104;
      var v105;
      var v106;
      var v107;
      while (true) {
        v100 = v79[v79.length - 1];
        if (this.defaultActions[v100]) {
          v101 = this.defaultActions[v100];
        } else {
          if (v99 === null || typeof v99 == "undefined") {
            v99 = v97();
          }
          v101 = v83[v100] && v83[v100][v99];
        }
        if (typeof v101 === "undefined" || !v101.length || !v101[0]) {
          var v108 = "";
          v107 = [];
          for (v104 in v83[v100]) {
            if (this.terminals_[v104] && v104 > v87) {
              v107.push("'" + this.terminals_[v104] + "'");
            }
          }
          if (v90.showPosition) {
            v108 = "Parse error on line " + (v85 + 1) + ":\n" + v90.showPosition() + "\nExpecting " + v107.join(", ") + ", got '" + (this.terminals_[v99] || v99) + "'";
          } else {
            v108 = "Parse error on line " + (v85 + 1) + ": Unexpected " + (v99 == v88 ? "end of input" : "'" + (this.terminals_[v99] || v99) + "'");
          }
          this.parseError(v108, {
            text: v90.match,
            token: this.terminals_[v99] || v99,
            line: v90.yylineno,
            loc: v93,
            expected: v107
          });
        }
        if (v101[0] instanceof Array && v101.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v100 + ", token: " + v99);
        }
        switch (v101[0]) {
          case 1:
            v79.push(v99);
            v81.push(v90.yytext);
            v82.push(v90.yylloc);
            v79.push(v101[1]);
            v99 = null;
            {
              v86 = v90.yyleng;
              v84 = v90.yytext;
              v85 = v90.yylineno;
              v93 = v90.yylloc;
            }
            break;
          case 2:
            v105 = this.productions_[v101[1]][1];
            v103.$ = v81[v81.length - v105];
            v103._$ = {
              first_line: v82[v82.length - (v105 || 1)].first_line,
              last_line: v82[v82.length - 1].last_line,
              first_column: v82[v82.length - (v105 || 1)].first_column,
              last_column: v82[v82.length - 1].last_column
            };
            if (v94) {
              v103._$.range = [v82[v82.length - (v105 || 1)].range[0], v82[v82.length - 1].range[1]];
            }
            v102 = this.performAction.apply(v103, [v84, v86, v85, v91.yy, v101[1], v81, v82].concat(v89));
            if (typeof v102 !== "undefined") {
              return v102;
            }
            if (v105) {
              v79 = v79.slice(0, v105 * -1 * 2);
              v81 = v81.slice(0, v105 * -1);
              v82 = v82.slice(0, v105 * -1);
            }
            v79.push(this.productions_[v101[1]][0]);
            v81.push(v103.$);
            v82.push(v103._$);
            v106 = v83[v79[v79.length - 2]][v79[v79.length - 1]];
            v79.push(v106);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v109 = function () {
    var v110 = {
      EOF: 1,
      parseError: v3(function v111(v112, v113) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v112, v113);
        } else {
          throw new Error(v112);
        }
      }, "parseError"),
      setInput: v3(function (v114, v115) {
        this.yy = v115 || this.yy || {};
        this._input = v114;
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
      input: v3(function () {
        var v116 = this._input[0];
        this.yytext += v116;
        this.yyleng++;
        this.offset++;
        this.match += v116;
        this.matched += v116;
        var v117 = v116.match(/(?:\r\n?|\n).*/g);
        if (v117) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v116;
      }, "input"),
      unput: v3(function (v118) {
        var v119 = v118.length;
        var v120 = v118.split(/(?:\r\n?|\n)/g);
        this._input = v118 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v119);
        this.offset -= v119;
        var v121 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v120.length - 1) {
          this.yylineno -= v120.length - 1;
        }
        var v122 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v120 ? (v120.length === v121.length ? this.yylloc.first_column : 0) + v121[v121.length - v120.length].length - v120[0].length : this.yylloc.first_column - v119
        };
        if (this.options.ranges) {
          this.yylloc.range = [v122[0], v122[0] + this.yyleng - v119];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v3(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v3(function () {
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
      less: v3(function (v123) {
        this.unput(this.match.slice(v123));
      }, "less"),
      pastInput: v3(function () {
        var v124 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v124.length > 20 ? "..." : "") + v124.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v3(function () {
        var v125 = this.match;
        if (v125.length < 20) {
          v125 += this._input.substr(0, 20 - v125.length);
        }
        return (v125.substr(0, 20) + (v125.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v3(function () {
        var v126 = this.pastInput();
        var v127 = new Array(v126.length + 1).join("-");
        return v126 + this.upcomingInput() + "\n" + v127 + "^";
      }, "showPosition"),
      test_match: v3(function (v128, v129) {
        var v130;
        var v131;
        var v132;
        if (this.options.backtrack_lexer) {
          v132 = {
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
            v132.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v131 = v128[0].match(/(?:\r\n?|\n).*/g);
        if (v131) {
          this.yylineno += v131.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v131 ? v131[v131.length - 1].length - v131[v131.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v128[0].length
        };
        this.yytext += v128[0];
        this.match += v128[0];
        this.matches = v128;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v128[0].length);
        this.matched += v128[0];
        v130 = this.performAction.call(this, this.yy, this, v129, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v130) {
          return v130;
        } else if (this._backtrack) {
          for (var v133 in v132) {
            this[v133] = v132[v133];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v3(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v134;
        var v135;
        var v136;
        var v137;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v138 = this._currentRules();
        for (var v139 = 0; v139 < v138.length; v139++) {
          v136 = this._input.match(this.rules[v138[v139]]);
          if (v136 && (!v135 || v136[0].length > v135[0].length)) {
            v135 = v136;
            v137 = v139;
            if (this.options.backtrack_lexer) {
              v134 = this.test_match(v136, v138[v139]);
              if (v134 !== false) {
                return v134;
              } else if (this._backtrack) {
                v135 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v135) {
          v134 = this.test_match(v135, v138[v137]);
          if (v134 !== false) {
            return v134;
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
      lex: v3(function v140() {
        var v141 = this.next();
        if (v141) {
          return v141;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v3(function v142(v143) {
        this.conditionStack.push(v143);
      }, "begin"),
      popState: v3(function v144() {
        var v145 = this.conditionStack.length - 1;
        if (v145 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v3(function v146() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v3(function v147(v148) {
        v148 = this.conditionStack.length - 1 - Math.abs(v148 || 0);
        if (v148 >= 0) {
          return this.conditionStack[v148];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v3(function v149(v150) {
        this.begin(v150);
      }, "pushState"),
      stateStackSize: v3(function v151() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v3(function v152(v153, v154, v155, v156) {
        function v157() {
          const v158 = v154.yytext.indexOf("%%");
          if (v158 === 0) {
            return false;
          }
          if (v158 > 0) {
            const v159 = v154.yytext.slice(0, v158);
            const v160 = v154.yytext.slice(v158);
            if (v160) {
              v153.lexer.unput(v160);
            }
            v154.yytext = v159;
          }
          return true;
        }
        v3(v157, "processId");
        switch (v155) {
          case 0:
            return 38;
          case 1:
            return 40;
          case 2:
            return 39;
          case 3:
            return 44;
          case 4:
            return 51;
          case 5:
            return 52;
          case 6:
            return 53;
          case 7:
            return 54;
          case 8:
            return 5;
          case 9:
            break;
          case 10:
            break;
          case 11:
            break;
          case 12:
            break;
          case 13:
            this.pushState("SCALE");
            return 17;
          case 14:
            return 18;
          case 15:
            this.popState();
            break;
          case 16:
            this.begin("acc_title");
            return 33;
          case 17:
            this.popState();
            return "acc_title_value";
          case 18:
            this.begin("acc_descr");
            return 35;
          case 19:
            this.popState();
            return "acc_descr_value";
          case 20:
            this.begin("acc_descr_multiline");
            break;
          case 21:
            this.popState();
            break;
          case 22:
            return "acc_descr_multiline_value";
          case 23:
            this.pushState("CLASSDEF");
            return 41;
          case 24:
            this.popState();
            this.pushState("CLASSDEFID");
            return "DEFAULT_CLASSDEF_ID";
          case 25:
            this.popState();
            this.pushState("CLASSDEFID");
            return 42;
          case 26:
            this.popState();
            return 43;
          case 27:
            this.pushState("CLASS");
            return 48;
          case 28:
            this.popState();
            this.pushState("CLASS_STYLE");
            return 49;
          case 29:
            this.popState();
            return 50;
          case 30:
            this.pushState("STYLE");
            return 45;
          case 31:
            this.popState();
            this.pushState("STYLEDEF_STYLES");
            return 46;
          case 32:
            this.popState();
            return 47;
          case 33:
            this.pushState("SCALE");
            return 17;
          case 34:
            return 18;
          case 35:
            this.popState();
            break;
          case 36:
            this.pushState("STATE");
            break;
          case 37:
            this.popState();
            v154.yytext = v154.yytext.slice(0, -8).trim();
            return 25;
          case 38:
            this.popState();
            v154.yytext = v154.yytext.slice(0, -8).trim();
            return 26;
          case 39:
            this.popState();
            v154.yytext = v154.yytext.slice(0, -10).trim();
            return 27;
          case 40:
            this.popState();
            v154.yytext = v154.yytext.slice(0, -8).trim();
            return 25;
          case 41:
            this.popState();
            v154.yytext = v154.yytext.slice(0, -8).trim();
            return 26;
          case 42:
            this.popState();
            v154.yytext = v154.yytext.slice(0, -10).trim();
            return 27;
          case 43:
            return 51;
          case 44:
            return 52;
          case 45:
            return 53;
          case 46:
            return 54;
          case 47:
            this.pushState("STATE_STRING");
            break;
          case 48:
            this.pushState("STATE_ID");
            return "AS";
          case 49:
            if (!v157()) {
              return;
            }
            this.popState();
            return "ID";
          case 50:
            this.popState();
            break;
          case 51:
            return "STATE_DESCR";
          case 52:
            throw new Error("Error: State name must be a single word. Found: \"" + v154.yytext.trim() + "\"");
          case 53:
            return 19;
          case 54:
            this.popState();
            break;
          case 55:
            this.popState();
            this.pushState("struct");
            return 20;
          case 56:
            this.popState();
            return 21;
          case 57:
            break;
          case 58:
            this.begin("NOTE");
            return 29;
          case 59:
            this.popState();
            this.pushState("NOTE_ID");
            return 59;
          case 60:
            this.popState();
            this.pushState("NOTE_ID");
            return 60;
          case 61:
            this.popState();
            this.pushState("FLOATING_NOTE");
            break;
          case 62:
            this.popState();
            this.pushState("FLOATING_NOTE_ID");
            return "AS";
          case 63:
            break;
          case 64:
            return "NOTE_TEXT";
          case 65:
            if (!v157()) {
              return;
            }
            this.popState();
            return "ID";
          case 66:
            if (!v157()) {
              return;
            }
            this.popState();
            this.pushState("NOTE_TEXT");
            return 24;
          case 67:
            this.popState();
            v154.yytext = v154.yytext.substr(2).trim();
            return 31;
          case 68:
            this.popState();
            v154.yytext = v154.yytext.slice(0, -8).trim();
            return 31;
          case 69:
            return 6;
          case 70:
            return 6;
          case 71:
            return 16;
          case 72:
            return 57;
          case 73:
            if (!v157()) {
              return;
            }
            return 24;
          case 74:
            v154.yytext = v154.yytext.trim();
            return 14;
          case 75:
            return 15;
          case 76:
            return 28;
          case 77:
            return 58;
          case 78:
            return 5;
          case 79:
            return "INVALID";
        }
      }, "anonymous"),
      rules: [/^(?:click\b)/i, /^(?:href\b)/i, /^(?:"[^"]*")/i, /^(?:default\b)/i, /^(?:.*direction\s+TB[^\n]*)/i, /^(?:.*direction\s+BT[^\n]*)/i, /^(?:.*direction\s+RL[^\n]*)/i, /^(?:.*direction\s+LR[^\n]*)/i, /^(?:[\n]+)/i, /^(?:[\s]+)/i, /^(?:((?!\n)\s)+)/i, /^(?:#[^\n]*)/i, /^(?:%%(?!\{)[^\n]*)/i, /^(?:scale\s+)/i, /^(?:\d+)/i, /^(?:\s+width\b)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:classDef\s+)/i, /^(?:DEFAULT\s+)/i, /^(?:\w+\s+)/i, /^(?:[^\n]*)/i, /^(?:class\s+)/i, /^(?:(\w+)+((,\s*\w+)*))/i, /^(?:[^\n]*)/i, /^(?:style\s+)/i, /^(?:[\w,]+\s+)/i, /^(?:[^\n]*)/i, /^(?:scale\s+)/i, /^(?:\d+)/i, /^(?:\s+width\b)/i, /^(?:state\s+)/i, /^(?:.*<<fork>>)/i, /^(?:.*<<join>>)/i, /^(?:.*<<choice>>)/i, /^(?:.*\[\[fork\]\])/i, /^(?:.*\[\[join\]\])/i, /^(?:.*\[\[choice\]\])/i, /^(?:.*direction\s+TB[^\n]*)/i, /^(?:.*direction\s+BT[^\n]*)/i, /^(?:.*direction\s+RL[^\n]*)/i, /^(?:.*direction\s+LR[^\n]*)/i, /^(?:["])/i, /^(?:\s*as\s+)/i, /^(?:[^\n\{]*)/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:\w+\s+\w+.*?\{)/i, /^(?:[^\n\s\{]+)/i, /^(?:\n)/i, /^(?:\{)/i, /^(?:\})/i, /^(?:[\n])/i, /^(?:note\s+)/i, /^(?:left of\b)/i, /^(?:right of\b)/i, /^(?:")/i, /^(?:\s*as\s*)/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:[^\n]*)/i, /^(?:\s*[^:\n\s\-]+)/i, /^(?:\s*:[^:\n;]+)/i, /^(?:[\s\S]*?\n\s*end note\b)/i, /^(?:stateDiagram\s+)/i, /^(?:stateDiagram-v2\s+)/i, /^(?:hide empty description\b)/i, /^(?:\[\*\])/i, /^(?:[^:\n\s\-\{]+)/i, /^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i, /^(?:-->)/i, /^(?:--)/i, /^(?::::)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: {
        LINE: {
          rules: [10, 11, 12],
          inclusive: false
        },
        struct: {
          rules: [10, 11, 12, 23, 27, 30, 36, 43, 44, 45, 46, 56, 57, 58, 72, 73, 74, 75, 76, 77],
          inclusive: false
        },
        FLOATING_NOTE_ID: {
          rules: [65],
          inclusive: false
        },
        FLOATING_NOTE: {
          rules: [62, 63, 64],
          inclusive: false
        },
        NOTE_TEXT: {
          rules: [67, 68],
          inclusive: false
        },
        NOTE_ID: {
          rules: [66],
          inclusive: false
        },
        NOTE: {
          rules: [59, 60, 61],
          inclusive: false
        },
        STYLEDEF_STYLEOPTS: {
          rules: [],
          inclusive: false
        },
        STYLEDEF_STYLES: {
          rules: [32],
          inclusive: false
        },
        STYLE_IDS: {
          rules: [],
          inclusive: false
        },
        STYLE: {
          rules: [31],
          inclusive: false
        },
        CLASS_STYLE: {
          rules: [29],
          inclusive: false
        },
        CLASS: {
          rules: [28],
          inclusive: false
        },
        CLASSDEFID: {
          rules: [26],
          inclusive: false
        },
        CLASSDEF: {
          rules: [24, 25],
          inclusive: false
        },
        acc_descr_multiline: {
          rules: [21, 22],
          inclusive: false
        },
        acc_descr: {
          rules: [19],
          inclusive: false
        },
        acc_title: {
          rules: [17],
          inclusive: false
        },
        SCALE: {
          rules: [14, 15, 34, 35],
          inclusive: false
        },
        ALIAS: {
          rules: [],
          inclusive: false
        },
        STATE_ID: {
          rules: [49],
          inclusive: false
        },
        STATE_STRING: {
          rules: [50, 51],
          inclusive: false
        },
        FORK_STATE: {
          rules: [],
          inclusive: false
        },
        STATE: {
          rules: [10, 11, 12, 37, 38, 39, 40, 41, 42, 47, 48, 52, 53, 54, 55],
          inclusive: false
        },
        ID: {
          rules: [10, 11, 12],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 16, 18, 20, 23, 27, 30, 33, 36, 55, 58, 69, 70, 71, 72, 73, 74, 75, 77, 78, 79],
          inclusive: true
        }
      }
    };
    return v110;
  }();
  v56.lexer = v109;
  function v161() {
    this.yy = {};
  }
  v3(v161, "Parser");
  v161.prototype = v56;
  v56.Parser = v161;
  return new v161();
}();
parser.parser = parser;
var stateDiagram_default = parser;
var DEFAULT_DIAGRAM_DIRECTION = "TB";
var DEFAULT_NESTED_DOC_DIR = "TB";
var STMT_DIRECTION = "dir";
var STMT_STATE = "state";
var STMT_ROOT = "root";
var STMT_RELATION = "relation";
var STMT_CLASSDEF = "classDef";
var STMT_STYLEDEF = "style";
var STMT_APPLYCLASS = "applyClass";
var DEFAULT_STATE_TYPE = "default";
var DIVIDER_TYPE = "divider";
var G_EDGE_STYLE = "fill:none";
var G_EDGE_ARROWHEADSTYLE = "fill: #333";
var G_EDGE_LABELPOS = "c";
var G_EDGE_LABELTYPE = "markdown";
var G_EDGE_THICKNESS = "normal";
var SHAPE_STATE = "rect";
var SHAPE_STATE_WITH_DESC = "rectWithTitle";
var SHAPE_START = "stateStart";
var SHAPE_END = "stateEnd";
var SHAPE_DIVIDER = "divider";
var SHAPE_GROUP = "roundedWithTitle";
var SHAPE_NOTE = "note";
var SHAPE_NOTEGROUP = "noteGroup";
var CSS_DIAGRAM = "statediagram";
var CSS_STATE = "state";
var CSS_DIAGRAM_STATE = CSS_DIAGRAM + "-" + CSS_STATE;
var CSS_EDGE = "transition";
var CSS_NOTE = "note";
var CSS_NOTE_EDGE = "note-edge";
var CSS_EDGE_NOTE_EDGE = CSS_EDGE + " " + CSS_NOTE_EDGE;
var CSS_DIAGRAM_NOTE = CSS_DIAGRAM + "-" + CSS_NOTE;
var CSS_CLUSTER = "cluster";
var CSS_DIAGRAM_CLUSTER = CSS_DIAGRAM + "-" + CSS_CLUSTER;
var CSS_CLUSTER_ALT = "cluster-alt";
var CSS_DIAGRAM_CLUSTER_ALT = CSS_DIAGRAM + "-" + CSS_CLUSTER_ALT;
var PARENT = "parent";
var NOTE = "note";
var DOMID_STATE = "state";
var DOMID_TYPE_SPACER = "----";
var NOTE_ID = "" + DOMID_TYPE_SPACER + NOTE;
var PARENT_ID = "" + DOMID_TYPE_SPACER + PARENT;
var getDir = v3((v162, v163 = DEFAULT_NESTED_DOC_DIR) => {
  if (!v162.doc) {
    return v163;
  }
  let v164 = v163;
  for (const v165 of v162.doc) {
    if (v165.stmt === "dir") {
      v164 = v165.value;
    }
  }
  return v164;
}, "getDir");
var getClasses = v3(function (v166, v167) {
  return v167.db.getClasses();
}, "getClasses");
var draw = v3(async function (v168, v169, v170, v171) {
  v4.info("REF0:");
  v4.info("Drawing state diagram (v2)", v169);
  const {
    securityLevel: v172,
    state: v173,
    layout: v174
  } = v5();
  v171.db.extract(v171.db.getRootDocV2());
  const v175 = v171.db.getData();
  const v176 = v1(v169, v172);
  v175.type = v171.type;
  v175.layoutAlgorithm = v174;
  v175.nodeSpacing = v173?.nodeSpacing || 50;
  v175.rankSpacing = v173?.rankSpacing || 50;
  const v177 = v5();
  if (v177.look === "neo") {
    v175.markers = ["barbNeo"];
  } else {
    v175.markers = ["barb"];
  }
  v175.diagramId = v169;
  await v6(v175, v176);
  const v178 = 8;
  try {
    const v179 = typeof v171.db.getLinks === "function" ? v171.db.getLinks() : new Map();
    v179.forEach((v180, v181) => {
      const v182 = typeof v181 === "string" ? v181 : typeof v181?.id === "string" ? v181.id : "";
      const v183 = v175.nodes.find(v184 => v184.id === v182);
      if (!v182) {
        v4.warn("⚠️ Invalid or missing stateId from key:", JSON.stringify(v181));
        return;
      }
      const v185 = v176.node()?.querySelectorAll("g.node, g.rough-node");
      let v186;
      v185?.forEach(v187 => {
        const v188 = v187.textContent?.trim();
        if (v187.id === v183?.domId || v188 === v182) {
          v186 = v187;
        }
      });
      if (!v186) {
        v4.warn("⚠️ Could not find node matching text:", v182);
        return;
      }
      const v189 = v186.parentNode;
      if (!v189) {
        v4.warn("⚠️ Node has no parent, cannot wrap:", v182);
        return;
      }
      const v190 = document.createElementNS("http://www.w3.org/2000/svg", "a");
      const v191 = v180.url.replace(/^"+|"+$/g, "");
      v190.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", v191);
      v190.setAttribute("target", "_blank");
      if (v180.tooltip) {
        const v192 = v180.tooltip.replace(/^"+|"+$/g, "");
        v190.setAttribute("title", v192);
        v186.setAttribute("title", v192);
      }
      v189.replaceChild(v190, v186);
      v190.appendChild(v186);
      v4.info("🔗 Wrapped node in <a> tag for:", v182, v180.url);
    });
  } catch (v193) {
    v4.error("❌ Error injecting clickable links:", v193);
  }
  v7.insertTitle(v176, "statediagramTitleText", v173?.titleTopMargin ?? 25, v171.db.getDiagramTitle());
  v2(v176, v178, CSS_DIAGRAM, v173?.useMaxWidth ?? true);
}, "draw");
var stateRenderer_v3_unified_default = {
  getClasses: getClasses,
  draw: draw,
  getDir: getDir
};
var nodeDb = new Map();
var graphItemCount = 0;
function stateDomId(v194 = "", v195 = 0, v196 = "", v197 = DOMID_TYPE_SPACER) {
  const v198 = v196 !== null && v196.length > 0 ? "" + v197 + v196 : "";
  return DOMID_STATE + "-" + v194 + v198 + "-" + v195;
}
v3(stateDomId, "stateDomId");
var setupDoc = v3((v199, v200, v201, v202, v203, v204, v205, v206) => {
  v4.trace("items", v200);
  v200.forEach(v207 => {
    switch (v207.stmt) {
      case STMT_STATE:
        dataFetcher(v199, v207, v201, v202, v203, v204, v205, v206);
        break;
      case DEFAULT_STATE_TYPE:
        dataFetcher(v199, v207, v201, v202, v203, v204, v205, v206);
        break;
      case STMT_RELATION:
        {
          dataFetcher(v199, v207.state1, v201, v202, v203, v204, v205, v206);
          dataFetcher(v199, v207.state2, v201, v202, v203, v204, v205, v206);
          const v208 = v205 === "neo";
          const v209 = {
            id: "edge" + graphItemCount,
            start: v207.state1.id,
            end: v207.state2.id,
            arrowhead: "normal",
            arrowTypeEnd: v208 ? "arrow_barb_neo" : "arrow_barb",
            style: G_EDGE_STYLE,
            labelStyle: "",
            label: v15.sanitizeText(v207.description ?? "", v5()),
            arrowheadStyle: G_EDGE_ARROWHEADSTYLE,
            labelpos: G_EDGE_LABELPOS,
            labelType: G_EDGE_LABELTYPE,
            thickness: G_EDGE_THICKNESS,
            classes: CSS_EDGE,
            look: v205
          };
          v203.push(v209);
          graphItemCount++;
        }
        break;
    }
  });
}, "setupDoc");
var getDir2 = v3((v210, v211 = DEFAULT_NESTED_DOC_DIR) => {
  let v212 = v211;
  if (v210.doc) {
    for (const v213 of v210.doc) {
      if (v213.stmt === "dir") {
        v212 = v213.value;
      }
    }
  }
  return v212;
}, "getDir");
function insertOrUpdateNode(v214, v215, v216) {
  if (!v215.id || v215.id === "</join></fork>" || v215.id === "</choice>") {
    return;
  }
  if (v215.cssClasses) {
    if (!Array.isArray(v215.cssCompiledStyles)) {
      v215.cssCompiledStyles = [];
    }
    v215.cssClasses.split(" ").forEach(v217 => {
      const v218 = v216.get(v217);
      if (v218) {
        v215.cssCompiledStyles = [...(v215.cssCompiledStyles ?? []), ...v218.styles];
      }
    });
  }
  const v219 = v214.find(v220 => v220.id === v215.id);
  if (v219) {
    Object.assign(v219, v215);
  } else {
    v214.push(v215);
  }
}
v3(insertOrUpdateNode, "insertOrUpdateNode");
function getClassesFromDbInfo(v221) {
  return v221?.classes?.join(" ") ?? "";
}
v3(getClassesFromDbInfo, "getClassesFromDbInfo");
function getStylesFromDbInfo(v222) {
  return v222?.styles ?? [];
}
v3(getStylesFromDbInfo, "getStylesFromDbInfo");
var dataFetcher = v3((v223, v224, v225, v226, v227, v228, v229, v230) => {
  const v231 = v224.id;
  const v232 = v225.get(v231);
  const v233 = getClassesFromDbInfo(v232);
  const v234 = getStylesFromDbInfo(v232);
  const v235 = v5();
  v4.info("dataFetcher parsedItem", v224, v232, v234);
  if (v231 !== "root") {
    let v236 = SHAPE_STATE;
    if (v224.start === true) {
      v236 = SHAPE_START;
    } else if (v224.start === false) {
      v236 = SHAPE_END;
    }
    if (v224.type !== DEFAULT_STATE_TYPE) {
      v236 = v224.type;
    }
    if (!nodeDb.get(v231)) {
      nodeDb.set(v231, {
        id: v231,
        shape: v236,
        description: v15.sanitizeText(v231, v235),
        cssClasses: v233 + " " + CSS_DIAGRAM_STATE,
        cssStyles: v234
      });
    }
    const v237 = nodeDb.get(v231);
    if (v224.description) {
      if (Array.isArray(v237.description)) {
        v237.shape = SHAPE_STATE_WITH_DESC;
        v237.description.push(v224.description);
      } else if (v237.description?.length && v237.description.length > 0) {
        v237.shape = SHAPE_STATE_WITH_DESC;
        if (v237.description === v231) {
          v237.description = [v224.description];
        } else {
          v237.description = [v237.description, v224.description];
        }
      } else {
        v237.shape = SHAPE_STATE;
        v237.description = v224.description;
      }
      v237.description = v15.sanitizeTextOrArray(v237.description, v235);
    }
    if (v237.description?.length === 1 && v237.shape === SHAPE_STATE_WITH_DESC) {
      if (v237.type === "group") {
        v237.shape = SHAPE_GROUP;
      } else {
        v237.shape = SHAPE_STATE;
      }
    }
    if (!v237.type && v224.doc) {
      v4.info("Setting cluster for XCX", v231, getDir2(v224));
      v237.type = "group";
      v237.isGroup = true;
      v237.dir = getDir2(v224);
      v237.explicitDir = v224.doc.some(v238 => v238.stmt === "dir");
      v237.shape = v224.type === DIVIDER_TYPE ? SHAPE_DIVIDER : SHAPE_GROUP;
      v237.cssClasses = v237.cssClasses + " " + CSS_DIAGRAM_CLUSTER + " " + (v228 ? CSS_DIAGRAM_CLUSTER_ALT : "");
    }
    const v239 = {
      labelStyle: "",
      shape: v237.shape,
      label: v237.description,
      cssClasses: v237.cssClasses,
      cssCompiledStyles: [],
      cssStyles: v237.cssStyles,
      id: v231,
      dir: v237.dir,
      domId: stateDomId(v231, graphItemCount),
      type: v237.type,
      isGroup: v237.type === "group",
      padding: 8,
      rx: 10,
      ry: 10,
      look: v229,
      labelType: "markdown"
    };
    if (v239.shape === SHAPE_DIVIDER) {
      v239.label = "";
    }
    if (v223 && v223.id !== "root") {
      v4.trace("Setting node ", v231, " to be child of its parent ", v223.id);
      v239.parentId = v223.id;
    }
    v239.centerLabel = true;
    if (v224.note) {
      const v240 = {
        labelStyle: "",
        shape: SHAPE_NOTE,
        label: v224.note.text,
        labelType: "markdown",
        cssClasses: CSS_DIAGRAM_NOTE,
        cssStyles: [],
        cssCompiledStyles: [],
        id: v231 + NOTE_ID + "-" + graphItemCount,
        domId: stateDomId(v231, graphItemCount, NOTE),
        type: v237.type,
        isGroup: v237.type === "group",
        padding: v235.flowchart?.padding,
        look: v229,
        position: v224.note.position
      };
      const v241 = v231 + PARENT_ID;
      const v242 = {
        labelStyle: "",
        shape: SHAPE_NOTEGROUP,
        label: v224.note.text,
        cssClasses: v237.cssClasses,
        cssStyles: [],
        id: v231 + PARENT_ID,
        domId: stateDomId(v231, graphItemCount, PARENT),
        type: "group",
        isGroup: true,
        padding: 16,
        look: v229,
        position: v224.note.position
      };
      graphItemCount++;
      v242.id = v241;
      v240.parentId = v241;
      insertOrUpdateNode(v226, v242, v230);
      insertOrUpdateNode(v226, v240, v230);
      insertOrUpdateNode(v226, v239, v230);
      let v243 = v231;
      let v244 = v240.id;
      if (v224.note.position === "left of") {
        v243 = v240.id;
        v244 = v231;
      }
      v227.push({
        id: v243 + "-" + v244,
        start: v243,
        end: v244,
        arrowhead: "none",
        arrowTypeEnd: "",
        style: G_EDGE_STYLE,
        labelStyle: "",
        classes: CSS_EDGE_NOTE_EDGE,
        arrowheadStyle: G_EDGE_ARROWHEADSTYLE,
        labelpos: G_EDGE_LABELPOS,
        labelType: G_EDGE_LABELTYPE,
        thickness: G_EDGE_THICKNESS,
        look: v229
      });
    } else {
      insertOrUpdateNode(v226, v239, v230);
    }
  }
  if (v224.doc) {
    v4.trace("Adding nodes children ");
    setupDoc(v224, v224.doc, v225, v226, v227, !v228, v229, v230);
  }
}, "dataFetcher");
var reset = v3(() => {
  nodeDb.clear();
  graphItemCount = 0;
}, "reset");
var CONSTANTS = {
  START_NODE: "[*]",
  START_TYPE: "start",
  END_NODE: "[*]",
  END_TYPE: "end",
  COLOR_KEYWORD: "color",
  FILL_KEYWORD: "fill",
  BG_FILL: "bgFill",
  STYLECLASS_SEP: ","
};
var newClassesList = v3(() => new Map(), "newClassesList");
var newDoc = v3(() => ({
  relations: [],
  states: new Map(),
  documents: {}
}), "newDoc");
var clone = v3(v245 => JSON.parse(JSON.stringify(v245)), "clone");
var StateDB = class {
  constructor(v246) {
    this.version = v246;
    this.nodes = [];
    this.edges = [];
    this.rootDoc = [];
    this.classes = newClassesList();
    this.documents = {
      root: newDoc()
    };
    this.currentDocument = this.documents.root;
    this.startEndCount = 0;
    this.dividerCnt = 0;
    this.links = new Map();
    this.funs = [];
    this.getAccTitle = v8;
    this.setAccTitle = v9;
    this.getAccDescription = v10;
    this.setAccDescription = v11;
    this.setDiagramTitle = v12;
    this.getDiagramTitle = v13;
    this.clear();
    this.setRootDoc = this.setRootDoc.bind(this);
    this.getDividerId = this.getDividerId.bind(this);
    this.setDirection = this.setDirection.bind(this);
    this.trimColon = this.trimColon.bind(this);
    this.bindFunctions = this.bindFunctions.bind(this);
  }
  static {
    v3(this, "StateDB");
  }
  static {
    this.relationType = {
      AGGREGATION: 0,
      EXTENSION: 1,
      COMPOSITION: 2,
      DEPENDENCY: 3
    };
  }
  extract(v247) {
    this.clear(true);
    for (const v248 of Array.isArray(v247) ? v247 : v247.doc) {
      switch (v248.stmt) {
        case STMT_STATE:
          this.addState(v248.id.trim(), v248.type, v248.doc, v248.description, v248.note);
          break;
        case STMT_RELATION:
          this.addRelation(v248.state1, v248.state2, v248.description);
          break;
        case STMT_CLASSDEF:
          this.addStyleClass(v248.id.trim(), v248.classes);
          break;
        case STMT_STYLEDEF:
          this.handleStyleDef(v248);
          break;
        case STMT_APPLYCLASS:
          this.setCssClass(v248.id.trim(), v248.styleClass);
          break;
        case "click":
          this.addLink(v248.id, v248.url, v248.tooltip);
          break;
      }
    }
    const v249 = this.getStates();
    const v250 = v5();
    reset();
    dataFetcher(undefined, this.getRootDocV2(), v249, this.nodes, this.edges, true, v250.look, this.classes);
    for (const v251 of this.nodes) {
      if (!Array.isArray(v251.label)) {
        continue;
      }
      v251.description = v251.label.slice(1);
      if (v251.isGroup && v251.description.length > 0) {
        throw new Error("Group nodes can only have label. Remove the additional description for node [" + v251.id + "]");
      }
      v251.label = v251.label[0];
    }
  }
  handleStyleDef(v252) {
    const v253 = v252.id.trim().split(",");
    const v254 = v252.styleClass.split(",");
    for (const v255 of v253) {
      let v256 = this.getState(v255);
      if (!v256) {
        const v257 = v255.trim();
        this.addState(v257);
        v256 = this.getState(v257);
      }
      if (v256) {
        v256.styles = v254.map(v258 => v258.replace(/;/g, "")?.trim());
      }
    }
  }
  setRootDoc(v259) {
    v4.info("Setting root doc", v259);
    this.rootDoc = v259;
    if (this.version === 1) {
      this.extract(v259);
    } else {
      this.extract(this.getRootDocV2());
    }
  }
  docTranslator(v260, v261, v262) {
    if (v261.stmt === STMT_RELATION) {
      this.docTranslator(v260, v261.state1, true);
      this.docTranslator(v260, v261.state2, false);
      return;
    }
    if (v261.stmt === STMT_STATE) {
      if (v261.id === CONSTANTS.START_NODE) {
        v261.id = v260.id + (v262 ? "_start" : "_end");
        v261.start = v262;
      } else {
        v261.id = v261.id.trim();
      }
    }
    if (v261.stmt !== STMT_ROOT && v261.stmt !== STMT_STATE || !v261.doc) {
      return;
    }
    const v263 = [];
    let v264 = [];
    for (const v265 of v261.doc) {
      if (v265.type === DIVIDER_TYPE) {
        const v266 = clone(v265);
        v266.doc = clone(v264);
        v263.push(v266);
        v264 = [];
      } else {
        v264.push(v265);
      }
    }
    if (v263.length > 0 && v264.length > 0) {
      const v267 = {
        stmt: STMT_STATE,
        id: v14(),
        type: "divider",
        doc: clone(v264)
      };
      v263.push(clone(v267));
      v261.doc = v263;
    }
    v261.doc.forEach(v268 => this.docTranslator(v261, v268, true));
  }
  getRootDocV2() {
    this.docTranslator({
      id: STMT_ROOT,
      stmt: STMT_ROOT
    }, {
      id: STMT_ROOT,
      stmt: STMT_ROOT,
      doc: this.rootDoc
    }, true);
    return {
      id: STMT_ROOT,
      doc: this.rootDoc
    };
  }
  addState(v269, v270 = DEFAULT_STATE_TYPE, v271 = undefined, v272 = undefined, v273 = undefined, v274 = undefined, v275 = undefined, v276 = undefined) {
    const v277 = v269?.trim();
    if (!this.currentDocument.states.has(v277)) {
      v4.info("Adding state ", v277, v272);
      this.currentDocument.states.set(v277, {
        stmt: STMT_STATE,
        id: v277,
        descriptions: [],
        type: v270,
        doc: v271,
        note: v273,
        classes: [],
        styles: [],
        textStyles: []
      });
    } else {
      const v278 = this.currentDocument.states.get(v277);
      if (!v278) {
        throw new Error("State not found: " + v277);
      }
      if (!v278.doc) {
        v278.doc = v271;
      }
      if (!v278.type) {
        v278.type = v270;
      }
    }
    if (v272) {
      v4.info("Setting state description", v277, v272);
      const v279 = Array.isArray(v272) ? v272 : [v272];
      v279.forEach(v280 => this.addDescription(v277, v280.trim()));
    }
    if (v273) {
      const v281 = this.currentDocument.states.get(v277);
      if (!v281) {
        throw new Error("State not found: " + v277);
      }
      v281.note = v273;
      v281.note.text = v15.sanitizeText(v281.note.text, v5());
    }
    if (v274) {
      v4.info("Setting state classes", v277, v274);
      const v282 = Array.isArray(v274) ? v274 : [v274];
      v282.forEach(v283 => this.setCssClass(v277, v283.trim()));
    }
    if (v275) {
      v4.info("Setting state styles", v277, v275);
      const v284 = Array.isArray(v275) ? v275 : [v275];
      v284.forEach(v285 => this.setStyle(v277, v285.trim()));
    }
    if (v276) {
      v4.info("Setting state styles", v277, v275);
      const v286 = Array.isArray(v276) ? v276 : [v276];
      v286.forEach(v287 => this.setTextStyle(v277, v287.trim()));
    }
  }
  clear(v288) {
    this.nodes = [];
    this.edges = [];
    this.funs = [this.setupToolTips.bind(this)];
    this.documents = {
      root: newDoc()
    };
    this.currentDocument = this.documents.root;
    this.startEndCount = 0;
    this.classes = newClassesList();
    if (!v288) {
      this.links = new Map();
      v16();
    }
  }
  getState(v289) {
    return this.currentDocument.states.get(v289);
  }
  getStates() {
    return this.currentDocument.states;
  }
  logDocuments() {
    v4.info("Documents = ", this.documents);
  }
  getRelations() {
    return this.currentDocument.relations;
  }
  addLink(v290, v291, v292) {
    this.links.set(v290, {
      url: v291,
      tooltip: v292
    });
    v4.warn("Adding link", v290, v291, v292);
  }
  getLinks() {
    return this.links;
  }
  startIdIfNeeded(v293 = "") {
    if (v293 === CONSTANTS.START_NODE) {
      this.startEndCount++;
      return "" + CONSTANTS.START_TYPE + this.startEndCount;
    }
    return v293;
  }
  startTypeIfNeeded(v294 = "", v295 = DEFAULT_STATE_TYPE) {
    if (v294 === CONSTANTS.START_NODE) {
      return CONSTANTS.START_TYPE;
    } else {
      return v295;
    }
  }
  endIdIfNeeded(v296 = "") {
    if (v296 === CONSTANTS.END_NODE) {
      this.startEndCount++;
      return "" + CONSTANTS.END_TYPE + this.startEndCount;
    }
    return v296;
  }
  endTypeIfNeeded(v297 = "", v298 = DEFAULT_STATE_TYPE) {
    if (v297 === CONSTANTS.END_NODE) {
      return CONSTANTS.END_TYPE;
    } else {
      return v298;
    }
  }
  addRelationObjs(v299, v300, v301 = "") {
    const v302 = this.startIdIfNeeded(v299.id.trim());
    const v303 = this.startTypeIfNeeded(v299.id.trim(), v299.type);
    const v304 = this.startIdIfNeeded(v300.id.trim());
    const v305 = this.startTypeIfNeeded(v300.id.trim(), v300.type);
    this.addState(v302, v303, v299.doc, v299.description, v299.note, v299.classes, v299.styles, v299.textStyles);
    this.addState(v304, v305, v300.doc, v300.description, v300.note, v300.classes, v300.styles, v300.textStyles);
    this.currentDocument.relations.push({
      id1: v302,
      id2: v304,
      relationTitle: v15.sanitizeText(v301, v5())
    });
  }
  addRelation(v306, v307, v308) {
    if (typeof v306 === "object" && typeof v307 === "object") {
      this.addRelationObjs(v306, v307, v308);
    } else if (typeof v306 === "string" && typeof v307 === "string") {
      const v309 = this.startIdIfNeeded(v306.trim());
      const v310 = this.startTypeIfNeeded(v306);
      const v311 = this.endIdIfNeeded(v307.trim());
      const v312 = this.endTypeIfNeeded(v307);
      this.addState(v309, v310);
      this.addState(v311, v312);
      this.currentDocument.relations.push({
        id1: v309,
        id2: v311,
        relationTitle: v308 ? v15.sanitizeText(v308, v5()) : undefined
      });
    }
  }
  addDescription(v313, v314) {
    const v315 = this.currentDocument.states.get(v313);
    const v316 = v314.startsWith(":") ? v314.replace(":", "").trim() : v314;
    v315?.descriptions?.push(v15.sanitizeText(v316, v5()));
  }
  cleanupLabel(v317) {
    if (v317.startsWith(":")) {
      return v317.slice(2).trim();
    } else {
      return v317.trim();
    }
  }
  getDividerId() {
    this.dividerCnt++;
    return "divider-id-" + this.dividerCnt;
  }
  addStyleClass(v318, v319 = "") {
    if (!this.classes.has(v318)) {
      this.classes.set(v318, {
        id: v318,
        styles: [],
        textStyles: []
      });
    }
    const v320 = this.classes.get(v318);
    if (v319 && v320) {
      v319.split(CONSTANTS.STYLECLASS_SEP).forEach(v321 => {
        const v322 = v321.replace(/([^;]*);/, "$1").trim();
        if (RegExp(CONSTANTS.COLOR_KEYWORD).exec(v321)) {
          const v323 = v322.replace(CONSTANTS.FILL_KEYWORD, CONSTANTS.BG_FILL);
          const v324 = v323.replace(CONSTANTS.COLOR_KEYWORD, CONSTANTS.FILL_KEYWORD);
          v320.textStyles.push(v324);
        }
        v320.styles.push(v322);
      });
    }
  }
  getClasses() {
    return this.classes;
  }
  setupToolTips(v325) {
    const v326 = v19();
    const v327 = v17(v325).select("svg");
    const v328 = v327.selectAll("g.node, g.rough-node");
    v328.on("mouseover", v329 => {
      const v330 = v17(v329.currentTarget);
      const v331 = v330.attr("title");
      if (v331 === null) {
        return;
      }
      const v332 = v329.currentTarget?.getBoundingClientRect();
      v326.transition().duration(200).style("opacity", ".9");
      v326.style("left", window.scrollX + v332.left + (v332.right - v332.left) / 2 + "px").style("top", window.scrollY + v332.bottom + "px");
      v326.html(v18.sanitize(v331));
      v330.classed("hover", true);
    }).on("mouseout", v333 => {
      v326.transition().duration(500).style("opacity", 0);
      const v334 = v17(v333.currentTarget);
      v334.classed("hover", false);
    });
  }
  setCssClass(v335, v336) {
    v335.split(",").forEach(v337 => {
      let v338 = this.getState(v337);
      if (!v338) {
        const v339 = v337.trim();
        this.addState(v339);
        v338 = this.getState(v339);
      }
      v338?.classes?.push(v336);
    });
  }
  setStyle(v340, v341) {
    this.getState(v340)?.styles?.push(v341);
  }
  setTextStyle(v342, v343) {
    this.getState(v342)?.textStyles?.push(v343);
  }
  bindFunctions(v344) {
    this.funs.forEach(v345 => {
      v345(v344);
    });
  }
  getDirectionStatement() {
    return this.rootDoc.find(v346 => v346.stmt === STMT_DIRECTION);
  }
  getDirection() {
    return this.getDirectionStatement()?.value ?? DEFAULT_DIAGRAM_DIRECTION;
  }
  setDirection(v347) {
    const v348 = this.getDirectionStatement();
    if (v348) {
      v348.value = v347;
    } else {
      this.rootDoc.unshift({
        stmt: STMT_DIRECTION,
        value: v347
      });
    }
  }
  trimColon(v349) {
    if (v349.startsWith(":")) {
      return v349.slice(1).trim();
    } else {
      return v349.trim();
    }
  }
  getData() {
    const v350 = v5();
    return {
      nodes: this.nodes,
      edges: this.edges,
      other: {},
      config: v350,
      direction: getDir(this.getRootDocV2())
    };
  }
  getConfig() {
    return v5().state;
  }
};
var getStyles = v3(v351 => "\ndefs [id$=\"-barbEnd\"] {\n    fill: " + v351.transitionColor + ";\n    stroke: " + v351.transitionColor + ";\n  }\ng.stateGroup text {\n  fill: " + v351.nodeBorder + ";\n  stroke: none;\n  font-size: 10px;\n}\ng.stateGroup text {\n  fill: " + v351.textColor + ";\n  stroke: none;\n  font-size: 10px;\n\n}\ng.stateGroup .state-title {\n  font-weight: bolder;\n  fill: " + v351.stateLabelColor + ";\n}\n\ng.stateGroup rect {\n  fill: " + v351.mainBkg + ";\n  stroke: " + v351.nodeBorder + ";\n}\n\ng.stateGroup line {\n  stroke: " + v351.lineColor + ";\n  stroke-width: " + (v351.strokeWidth || 1) + ";\n}\n\n.transition {\n  stroke: " + v351.transitionColor + ";\n  stroke-width: " + (v351.strokeWidth || 1) + ";\n  fill: none;\n}\n\n.stateGroup .composit {\n  fill: " + v351.background + ";\n  border-bottom: 1px\n}\n\n.stateGroup .alt-composit {\n  fill: #e0e0e0;\n  border-bottom: 1px\n}\n\n.state-note {\n  stroke: " + v351.noteBorderColor + ";\n  fill: " + v351.noteBkgColor + ";\n\n  text {\n    fill: " + v351.noteTextColor + ";\n    stroke: none;\n    font-size: 10px;\n  }\n}\n\n.stateLabel .box {\n  stroke: none;\n  stroke-width: 0;\n  fill: " + v351.mainBkg + ";\n  opacity: 0.5;\n}\n\n.edgeLabel .label rect {\n  fill: " + v351.labelBackgroundColor + ";\n  opacity: 0.5;\n}\n.edgeLabel {\n  background-color: " + v351.edgeLabelBackground + ";\n  p {\n    background-color: " + v351.edgeLabelBackground + ";\n  }\n  rect {\n    opacity: 0.5;\n    background-color: " + v351.edgeLabelBackground + ";\n    fill: " + v351.edgeLabelBackground + ";\n  }\n  text-align: center;\n}\n.edgeLabel .label text {\n  fill: " + (v351.transitionLabelColor || v351.tertiaryTextColor) + ";\n}\n.label div .edgeLabel {\n  color: " + (v351.transitionLabelColor || v351.tertiaryTextColor) + ";\n}\n\n.stateLabel text {\n  fill: " + v351.stateLabelColor + ";\n  font-size: 10px;\n  font-weight: bold;\n}\n\n.node circle.state-start {\n  fill: " + v351.specialStateColor + ";\n  stroke: " + v351.specialStateColor + ";\n}\n\n.node .fork-join {\n  fill: " + v351.specialStateColor + ";\n  stroke: " + v351.specialStateColor + ";\n}\n\n.node circle.state-end {\n  fill: " + v351.innerEndBackground + ";\n  stroke: " + v351.background + ";\n  stroke-width: 1.5\n}\n.end-state-inner {\n  fill: " + (v351.compositeBackground || v351.background) + ";\n  // stroke: " + v351.background + ";\n  stroke-width: 1.5\n}\n\n.node rect {\n  fill: " + (v351.stateBkg || v351.mainBkg) + ";\n  stroke: " + (v351.stateBorder || v351.nodeBorder) + ";\n  stroke-width: " + (v351.strokeWidth || 1) + "px;\n}\n.node polygon {\n  fill: " + v351.mainBkg + ";\n  stroke: " + (v351.stateBorder || v351.nodeBorder) + ";;\n  stroke-width: " + (v351.strokeWidth || 1) + "px;\n}\n[id$=\"-barbEnd\"] {\n  fill: " + v351.lineColor + ";\n}\n\n.statediagram-cluster rect {\n  fill: " + v351.compositeTitleBackground + ";\n  stroke: " + (v351.stateBorder || v351.nodeBorder) + ";\n  stroke-width: " + (v351.strokeWidth || 1) + "px;\n}\n\n.cluster-label, .nodeLabel {\n  color: " + v351.stateLabelColor + ";\n  // line-height: 1;\n}\n\n.statediagram-cluster rect.outer {\n  rx: 5px;\n  ry: 5px;\n}\n.statediagram-state .divider {\n  stroke: " + (v351.stateBorder || v351.nodeBorder) + ";\n}\n\n.statediagram-state .title-state {\n  rx: 5px;\n  ry: 5px;\n}\n.statediagram-cluster.statediagram-cluster .inner {\n  fill: " + (v351.compositeBackground || v351.background) + ";\n}\n.statediagram-cluster.statediagram-cluster-alt .inner {\n  fill: " + (v351.altBackground ? v351.altBackground : "#efefef") + ";\n}\n\n.statediagram-cluster .inner {\n  rx:0;\n  ry:0;\n}\n\n.statediagram-state rect.basic {\n  rx: 5px;\n  ry: 5px;\n}\n.statediagram-state rect.divider {\n  stroke-dasharray: 10,10;\n  fill: " + (v351.altBackground ? v351.altBackground : "#efefef") + ";\n}\n\n.note-edge {\n  stroke-dasharray: 5;\n}\n\n.statediagram-note rect {\n  fill: " + v351.noteBkgColor + ";\n  stroke: " + v351.noteBorderColor + ";\n  stroke-width: 1px;\n  rx: 0;\n  ry: 0;\n}\n.statediagram-note rect {\n  fill: " + v351.noteBkgColor + ";\n  stroke: " + v351.noteBorderColor + ";\n  stroke-width: 1px;\n  rx: 0;\n  ry: 0;\n}\n\n.statediagram-note text {\n  fill: " + v351.noteTextColor + ";\n}\n\n.statediagram-note .nodeLabel {\n  color: " + v351.noteTextColor + ";\n}\n.statediagram .edgeLabel {\n  color: red; // " + v351.noteTextColor + ";\n}\n\n[id$=\"-dependencyStart\"], [id$=\"-dependencyEnd\"] {\n  fill: " + v351.lineColor + ";\n  stroke: " + v351.lineColor + ";\n  stroke-width: " + (v351.strokeWidth || 1) + ";\n}\n\n.statediagramTitleText {\n  text-anchor: middle;\n  font-size: 18px;\n  fill: " + v351.textColor + ";\n}\n\n[data-look=\"neo\"].statediagram-cluster rect {\n  fill: " + v351.mainBkg + ";\n  stroke: " + (v351.useGradient ? "url(" + v351.svgId + "-gradient)" : v351.stateBorder || v351.nodeBorder) + ";\n  stroke-width: " + (v351.strokeWidth ?? 1) + ";\n}\n[data-look=\"neo\"].statediagram-cluster rect.outer {\n  rx: " + v351.radius + "px;\n  ry: " + v351.radius + "px;\n  filter: " + (v351.dropShadow ? v351.dropShadow.replace("url(#drop-shadow)", "url(" + v351.svgId + "-drop-shadow)") : "none") + "\n}\n", "getStyles");
var styles_default = getStyles;
export { StateDB as S, stateDiagram_default as a, stateRenderer_v3_unified_default as b, styles_default as s };