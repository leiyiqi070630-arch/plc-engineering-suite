import { s as v1, g as v2, o as v3, n as v4, a as v5, b as v6, _ as v7, l as v8, D as v9, e as v10, p as v11, y as v12, i as v13, A as v14, B as v15, E as v16, aA as v17, P as v18 } from "./index-CXb3UsfP.js";
import { i as v19 } from "./init-ZxktEp_H.js";
import { o as v20 } from "./ordinal-CxptdPJm.js";
import { l as v21 } from "./linear-ZwJ7T20d.js";
import "./defaultLocale-B2RvLBDe.js";
function range(v22, v23, v24) {
  v22 = +v22;
  v23 = +v23;
  v24 = (v25 = arguments.length) < 2 ? (v23 = v22, v22 = 0, 1) : v25 < 3 ? 1 : +v24;
  var v26 = -1;
  var v25 = Math.max(0, Math.ceil((v23 - v22) / v24)) | 0;
  var v27 = new Array(v25);
  while (++v26 < v25) {
    v27[v26] = v22 + v26 * v24;
  }
  return v27;
}
function band() {
  var v28 = v20().unknown(undefined);
  var v29 = v28.domain;
  var v30 = v28.range;
  var v31 = 0;
  var v32 = 1;
  var v33;
  var v34;
  var v35 = false;
  var v36 = 0;
  var v37 = 0;
  var v38 = 0.5;
  delete v28.unknown;
  function v39() {
    var v40 = v29().length;
    var v41 = v32 < v31;
    var v42 = v41 ? v32 : v31;
    var v43 = v41 ? v31 : v32;
    v33 = (v43 - v42) / Math.max(1, v40 - v36 + v37 * 2);
    if (v35) {
      v33 = Math.floor(v33);
    }
    v42 += (v43 - v42 - v33 * (v40 - v36)) * v38;
    v34 = v33 * (1 - v36);
    if (v35) {
      v42 = Math.round(v42);
      v34 = Math.round(v34);
    }
    var v44 = range(v40).map(function (v45) {
      return v42 + v33 * v45;
    });
    return v30(v41 ? v44.reverse() : v44);
  }
  v28.domain = function (v46) {
    if (arguments.length) {
      v29(v46);
      return v39();
    } else {
      return v29();
    }
  };
  v28.range = function (v47) {
    if (arguments.length) {
      [v31, v32] = v47;
      v31 = +v31;
      v32 = +v32;
      return v39();
    } else {
      return [v31, v32];
    }
  };
  v28.rangeRound = function (v48) {
    [v31, v32] = v48;
    v31 = +v31;
    v32 = +v32;
    v35 = true;
    return v39();
  };
  v28.bandwidth = function () {
    return v34;
  };
  v28.step = function () {
    return v33;
  };
  v28.round = function (v49) {
    if (arguments.length) {
      v35 = !!v49;
      return v39();
    } else {
      return v35;
    }
  };
  v28.padding = function (v50) {
    if (arguments.length) {
      v36 = Math.min(1, v37 = +v50);
      return v39();
    } else {
      return v36;
    }
  };
  v28.paddingInner = function (v51) {
    if (arguments.length) {
      v36 = Math.min(1, v51);
      return v39();
    } else {
      return v36;
    }
  };
  v28.paddingOuter = function (v52) {
    if (arguments.length) {
      v37 = +v52;
      return v39();
    } else {
      return v37;
    }
  };
  v28.align = function (v53) {
    if (arguments.length) {
      v38 = Math.max(0, Math.min(1, v53));
      return v39();
    } else {
      return v38;
    }
  };
  v28.copy = function () {
    return band(v29(), [v31, v32]).round(v35).paddingInner(v36).paddingOuter(v37).align(v38);
  };
  return v19.apply(v39(), arguments);
}
var parser = function () {
  var v54 = v7(function (v55, v56, v57, v58) {
    v57 = v57 || {};
    v58 = v55.length;
    for (; v58--; v57[v55[v58]] = v56);
    return v57;
  }, "o");
  var v59 = [1, 10, 12, 14, 16, 18, 19, 21, 23];
  var v60 = [2, 6];
  var v61 = [1, 3];
  var v62 = [1, 5];
  var v63 = [1, 6];
  var v64 = [1, 7];
  var v65 = [1, 5, 10, 12, 14, 16, 18, 19, 21, 23, 36, 37, 38];
  var v66 = [1, 25];
  var v67 = [1, 26];
  var v68 = [1, 28];
  var v69 = [1, 29];
  var v70 = [1, 30];
  var v71 = [1, 31];
  var v72 = [1, 32];
  var v73 = [1, 33];
  var v74 = [1, 34];
  var v75 = [1, 35];
  var v76 = [1, 36];
  var v77 = [1, 37];
  var v78 = [1, 43];
  var v79 = [1, 42];
  var v80 = [1, 47];
  var v81 = [1, 50];
  var v82 = [1, 10, 12, 14, 16, 18, 19, 21, 23, 36, 37, 38];
  var v83 = [1, 10, 12, 14, 16, 18, 19, 21, 23, 24, 26, 28, 29, 36, 37, 38];
  var v84 = [1, 10, 12, 14, 16, 18, 19, 21, 23, 24, 26, 28, 29, 36, 37, 38, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
  var v85 = [1, 65];
  var v86 = [26, 28];
  var v87 = {
    trace: v7(function v88() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      eol: 4,
      XYCHART: 5,
      chartConfig: 6,
      document: 7,
      CHART_ORIENTATION: 8,
      statement: 9,
      title: 10,
      text: 11,
      X_AXIS: 12,
      parseXAxis: 13,
      Y_AXIS: 14,
      parseYAxis: 15,
      LINE: 16,
      plotData: 17,
      BAR: 18,
      acc_title: 19,
      acc_title_value: 20,
      acc_descr: 21,
      acc_descr_value: 22,
      acc_descr_multiline_value: 23,
      SQUARE_BRACES_START: 24,
      dataPoints: 25,
      SQUARE_BRACES_END: 26,
      dataPoint: 27,
      COMMA: 28,
      NUMBER_WITH_DECIMAL: 29,
      STR: 30,
      xAxisData: 31,
      bandData: 32,
      ARROW_DELIMITER: 33,
      commaSeparatedTexts: 34,
      yAxisData: 35,
      NEWLINE: 36,
      SEMI: 37,
      EOF: 38,
      alphaNum: 39,
      MD_STR: 40,
      alphaNumToken: 41,
      AMP: 42,
      NUM: 43,
      ALPHA: 44,
      PLUS: 45,
      EQUALS: 46,
      MULT: 47,
      DOT: 48,
      BRKT: 49,
      MINUS: 50,
      UNDERSCORE: 51,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      5: "XYCHART",
      8: "CHART_ORIENTATION",
      10: "title",
      12: "X_AXIS",
      14: "Y_AXIS",
      16: "LINE",
      18: "BAR",
      19: "acc_title",
      20: "acc_title_value",
      21: "acc_descr",
      22: "acc_descr_value",
      23: "acc_descr_multiline_value",
      24: "SQUARE_BRACES_START",
      26: "SQUARE_BRACES_END",
      28: "COMMA",
      29: "NUMBER_WITH_DECIMAL",
      30: "STR",
      33: "ARROW_DELIMITER",
      36: "NEWLINE",
      37: "SEMI",
      38: "EOF",
      40: "MD_STR",
      42: "AMP",
      43: "NUM",
      44: "ALPHA",
      45: "PLUS",
      46: "EQUALS",
      47: "MULT",
      48: "DOT",
      49: "BRKT",
      50: "MINUS",
      51: "UNDERSCORE"
    },
    productions_: [0, [3, 2], [3, 3], [3, 2], [3, 1], [6, 1], [7, 0], [7, 2], [9, 2], [9, 2], [9, 2], [9, 2], [9, 2], [9, 3], [9, 2], [9, 3], [9, 2], [9, 2], [9, 1], [17, 3], [25, 3], [25, 1], [27, 2], [27, 1], [13, 1], [13, 2], [13, 1], [31, 1], [31, 3], [32, 3], [34, 3], [34, 1], [15, 1], [15, 2], [15, 1], [35, 3], [4, 1], [4, 1], [4, 1], [11, 1], [11, 1], [11, 1], [39, 1], [39, 2], [41, 1], [41, 1], [41, 1], [41, 1], [41, 1], [41, 1], [41, 1], [41, 1], [41, 1], [41, 1]],
    performAction: v7(function v89(v90, v91, v92, v93, v94, v95, v96) {
      var v97 = v95.length - 1;
      switch (v94) {
        case 5:
          v93.setOrientation(v95[v97]);
          break;
        case 9:
          v93.setDiagramTitle(v95[v97].text.trim());
          break;
        case 12:
          v93.setLineData({
            text: "",
            type: "text"
          }, v95[v97]);
          break;
        case 13:
          v93.setLineData(v95[v97 - 1], v95[v97]);
          break;
        case 14:
          v93.setBarData({
            text: "",
            type: "text"
          }, v95[v97]);
          break;
        case 15:
          v93.setBarData(v95[v97 - 1], v95[v97]);
          break;
        case 16:
          this.$ = v95[v97].trim();
          v93.setAccTitle(this.$);
          break;
        case 17:
        case 18:
          this.$ = v95[v97].trim();
          v93.setAccDescription(this.$);
          break;
        case 19:
          this.$ = v95[v97 - 1];
          break;
        case 20:
        case 30:
          this.$ = [v95[v97 - 2], ...v95[v97]];
          break;
        case 21:
        case 31:
          this.$ = [v95[v97]];
          break;
        case 22:
          this.$ = {
            value: Number(v95[v97 - 1]),
            label: v95[v97]
          };
          break;
        case 23:
          this.$ = {
            value: Number(v95[v97]),
            label: ""
          };
          break;
        case 24:
          v93.setXAxisTitle(v95[v97]);
          break;
        case 25:
          v93.setXAxisTitle(v95[v97 - 1]);
          break;
        case 26:
          v93.setXAxisTitle({
            type: "text",
            text: ""
          });
          break;
        case 27:
          v93.setXAxisBand(v95[v97]);
          break;
        case 28:
          v93.setXAxisRangeData(Number(v95[v97 - 2]), Number(v95[v97]));
          break;
        case 29:
          this.$ = v95[v97 - 1];
          break;
        case 32:
          v93.setYAxisTitle(v95[v97]);
          break;
        case 33:
          v93.setYAxisTitle(v95[v97 - 1]);
          break;
        case 34:
          v93.setYAxisTitle({
            type: "text",
            text: ""
          });
          break;
        case 35:
          v93.setYAxisRangeData(Number(v95[v97 - 2]), Number(v95[v97]));
          break;
        case 39:
          this.$ = {
            text: v95[v97],
            type: "text"
          };
          break;
        case 40:
          this.$ = {
            text: v95[v97],
            type: "text"
          };
          break;
        case 41:
          this.$ = {
            text: v95[v97],
            type: "markdown"
          };
          break;
        case 42:
          this.$ = v95[v97];
          break;
        case 43:
          this.$ = v95[v97 - 1] + "" + v95[v97];
          break;
      }
    }, "anonymous"),
    table: [v54(v59, v60, {
      3: 1,
      4: 2,
      7: 4,
      5: v61,
      36: v62,
      37: v63,
      38: v64
    }), {
      1: [3]
    }, v54(v59, v60, {
      4: 2,
      7: 4,
      3: 8,
      5: v61,
      36: v62,
      37: v63,
      38: v64
    }), v54(v59, v60, {
      4: 2,
      7: 4,
      6: 9,
      3: 10,
      5: v61,
      8: [1, 11],
      36: v62,
      37: v63,
      38: v64
    }), {
      1: [2, 4],
      9: 12,
      10: [1, 13],
      12: [1, 14],
      14: [1, 15],
      16: [1, 16],
      18: [1, 17],
      19: [1, 18],
      21: [1, 19],
      23: [1, 20]
    }, v54(v65, [2, 36]), v54(v65, [2, 37]), v54(v65, [2, 38]), {
      1: [2, 1]
    }, v54(v59, v60, {
      4: 2,
      7: 4,
      3: 21,
      5: v61,
      36: v62,
      37: v63,
      38: v64
    }), {
      1: [2, 3]
    }, v54(v65, [2, 5]), v54(v59, [2, 7], {
      4: 22,
      36: v62,
      37: v63,
      38: v64
    }), {
      11: 23,
      30: v66,
      39: 24,
      40: v67,
      41: 27,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }, {
      11: 39,
      13: 38,
      24: v78,
      29: v79,
      30: v66,
      31: 40,
      32: 41,
      39: 24,
      40: v67,
      41: 27,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }, {
      11: 45,
      15: 44,
      29: v80,
      30: v66,
      35: 46,
      39: 24,
      40: v67,
      41: 27,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }, {
      11: 49,
      17: 48,
      24: v81,
      30: v66,
      39: 24,
      40: v67,
      41: 27,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }, {
      11: 52,
      17: 51,
      24: v81,
      30: v66,
      39: 24,
      40: v67,
      41: 27,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }, {
      20: [1, 53]
    }, {
      22: [1, 54]
    }, v54(v82, [2, 18]), {
      1: [2, 2]
    }, v54(v82, [2, 8]), v54(v82, [2, 9]), v54(v83, [2, 39], {
      41: 55,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }), v54(v83, [2, 40]), v54(v83, [2, 41]), v54(v84, [2, 42]), v54(v84, [2, 44]), v54(v84, [2, 45]), v54(v84, [2, 46]), v54(v84, [2, 47]), v54(v84, [2, 48]), v54(v84, [2, 49]), v54(v84, [2, 50]), v54(v84, [2, 51]), v54(v84, [2, 52]), v54(v84, [2, 53]), v54(v82, [2, 10]), v54(v82, [2, 24], {
      32: 41,
      31: 56,
      24: v78,
      29: v79
    }), v54(v82, [2, 26]), v54(v82, [2, 27]), {
      33: [1, 57]
    }, {
      11: 59,
      30: v66,
      34: 58,
      39: 24,
      40: v67,
      41: 27,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }, v54(v82, [2, 11]), v54(v82, [2, 32], {
      35: 60,
      29: v80
    }), v54(v82, [2, 34]), {
      33: [1, 61]
    }, v54(v82, [2, 12]), {
      17: 62,
      24: v81
    }, {
      25: 63,
      27: 64,
      29: v85
    }, v54(v82, [2, 14]), {
      17: 66,
      24: v81
    }, v54(v82, [2, 16]), v54(v82, [2, 17]), v54(v84, [2, 43]), v54(v82, [2, 25]), {
      29: [1, 67]
    }, {
      26: [1, 68]
    }, {
      26: [2, 31],
      28: [1, 69]
    }, v54(v82, [2, 33]), {
      29: [1, 70]
    }, v54(v82, [2, 13]), {
      26: [1, 71]
    }, {
      26: [2, 21],
      28: [1, 72]
    }, v54(v86, [2, 23], {
      30: [1, 73]
    }), v54(v82, [2, 15]), v54(v82, [2, 28]), v54(v82, [2, 29]), {
      11: 59,
      30: v66,
      34: 74,
      39: 24,
      40: v67,
      41: 27,
      42: v68,
      43: v69,
      44: v70,
      45: v71,
      46: v72,
      47: v73,
      48: v74,
      49: v75,
      50: v76,
      51: v77
    }, v54(v82, [2, 35]), v54(v82, [2, 19]), {
      25: 75,
      27: 64,
      29: v85
    }, v54(v86, [2, 22]), {
      26: [2, 30]
    }, {
      26: [2, 20]
    }],
    defaultActions: {
      8: [2, 1],
      10: [2, 3],
      21: [2, 2],
      74: [2, 30],
      75: [2, 20]
    },
    parseError: v7(function v98(v99, v100) {
      if (v100.recoverable) {
        this.trace(v99);
      } else {
        var v101 = new Error(v99);
        v101.hash = v100;
        throw v101;
      }
    }, "parseError"),
    parse: v7(function v102(v103) {
      var v104 = this;
      var v105 = [0];
      var v106 = [];
      var v107 = [null];
      var v108 = [];
      var v109 = this.table;
      var v110 = "";
      var v111 = 0;
      var v112 = 0;
      var v113 = 2;
      var v114 = 1;
      var v115 = v108.slice.call(arguments, 1);
      var v116 = Object.create(this.lexer);
      var v117 = {
        yy: {}
      };
      for (var v118 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v118)) {
          v117.yy[v118] = this.yy[v118];
        }
      }
      v116.setInput(v103, v117.yy);
      v117.yy.lexer = v116;
      v117.yy.parser = this;
      if (typeof v116.yylloc == "undefined") {
        v116.yylloc = {};
      }
      var v119 = v116.yylloc;
      v108.push(v119);
      var v120 = v116.options && v116.options.ranges;
      if (typeof v117.yy.parseError === "function") {
        this.parseError = v117.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v121(v122) {
        v105.length = v105.length - v122 * 2;
        v107.length = v107.length - v122;
        v108.length = v108.length - v122;
      }
      v7(v121, "popStack");
      function v123() {
        var v124;
        v124 = v106.pop() || v116.lex() || v114;
        if (typeof v124 !== "number") {
          if (v124 instanceof Array) {
            v106 = v124;
            v124 = v106.pop();
          }
          v124 = v104.symbols_[v124] || v124;
        }
        return v124;
      }
      v7(v123, "lex");
      var v125;
      var v126;
      var v127;
      var v128;
      var v129 = {};
      var v130;
      var v131;
      var v132;
      var v133;
      while (true) {
        v126 = v105[v105.length - 1];
        if (this.defaultActions[v126]) {
          v127 = this.defaultActions[v126];
        } else {
          if (v125 === null || typeof v125 == "undefined") {
            v125 = v123();
          }
          v127 = v109[v126] && v109[v126][v125];
        }
        if (typeof v127 === "undefined" || !v127.length || !v127[0]) {
          var v134 = "";
          v133 = [];
          for (v130 in v109[v126]) {
            if (this.terminals_[v130] && v130 > v113) {
              v133.push("'" + this.terminals_[v130] + "'");
            }
          }
          if (v116.showPosition) {
            v134 = "Parse error on line " + (v111 + 1) + ":\n" + v116.showPosition() + "\nExpecting " + v133.join(", ") + ", got '" + (this.terminals_[v125] || v125) + "'";
          } else {
            v134 = "Parse error on line " + (v111 + 1) + ": Unexpected " + (v125 == v114 ? "end of input" : "'" + (this.terminals_[v125] || v125) + "'");
          }
          this.parseError(v134, {
            text: v116.match,
            token: this.terminals_[v125] || v125,
            line: v116.yylineno,
            loc: v119,
            expected: v133
          });
        }
        if (v127[0] instanceof Array && v127.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v126 + ", token: " + v125);
        }
        switch (v127[0]) {
          case 1:
            v105.push(v125);
            v107.push(v116.yytext);
            v108.push(v116.yylloc);
            v105.push(v127[1]);
            v125 = null;
            {
              v112 = v116.yyleng;
              v110 = v116.yytext;
              v111 = v116.yylineno;
              v119 = v116.yylloc;
            }
            break;
          case 2:
            v131 = this.productions_[v127[1]][1];
            v129.$ = v107[v107.length - v131];
            v129._$ = {
              first_line: v108[v108.length - (v131 || 1)].first_line,
              last_line: v108[v108.length - 1].last_line,
              first_column: v108[v108.length - (v131 || 1)].first_column,
              last_column: v108[v108.length - 1].last_column
            };
            if (v120) {
              v129._$.range = [v108[v108.length - (v131 || 1)].range[0], v108[v108.length - 1].range[1]];
            }
            v128 = this.performAction.apply(v129, [v110, v112, v111, v117.yy, v127[1], v107, v108].concat(v115));
            if (typeof v128 !== "undefined") {
              return v128;
            }
            if (v131) {
              v105 = v105.slice(0, v131 * -1 * 2);
              v107 = v107.slice(0, v131 * -1);
              v108 = v108.slice(0, v131 * -1);
            }
            v105.push(this.productions_[v127[1]][0]);
            v107.push(v129.$);
            v108.push(v129._$);
            v132 = v109[v105[v105.length - 2]][v105[v105.length - 1]];
            v105.push(v132);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v135 = function () {
    var v136 = {
      EOF: 1,
      parseError: v7(function v137(v138, v139) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v138, v139);
        } else {
          throw new Error(v138);
        }
      }, "parseError"),
      setInput: v7(function (v140, v141) {
        this.yy = v141 || this.yy || {};
        this._input = v140;
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
      input: v7(function () {
        var v142 = this._input[0];
        this.yytext += v142;
        this.yyleng++;
        this.offset++;
        this.match += v142;
        this.matched += v142;
        var v143 = v142.match(/(?:\r\n?|\n).*/g);
        if (v143) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v142;
      }, "input"),
      unput: v7(function (v144) {
        var v145 = v144.length;
        var v146 = v144.split(/(?:\r\n?|\n)/g);
        this._input = v144 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v145);
        this.offset -= v145;
        var v147 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v146.length - 1) {
          this.yylineno -= v146.length - 1;
        }
        var v148 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v146 ? (v146.length === v147.length ? this.yylloc.first_column : 0) + v147[v147.length - v146.length].length - v146[0].length : this.yylloc.first_column - v145
        };
        if (this.options.ranges) {
          this.yylloc.range = [v148[0], v148[0] + this.yyleng - v145];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v7(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v7(function () {
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
      less: v7(function (v149) {
        this.unput(this.match.slice(v149));
      }, "less"),
      pastInput: v7(function () {
        var v150 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v150.length > 20 ? "..." : "") + v150.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v7(function () {
        var v151 = this.match;
        if (v151.length < 20) {
          v151 += this._input.substr(0, 20 - v151.length);
        }
        return (v151.substr(0, 20) + (v151.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v7(function () {
        var v152 = this.pastInput();
        var v153 = new Array(v152.length + 1).join("-");
        return v152 + this.upcomingInput() + "\n" + v153 + "^";
      }, "showPosition"),
      test_match: v7(function (v154, v155) {
        var v156;
        var v157;
        var v158;
        if (this.options.backtrack_lexer) {
          v158 = {
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
            v158.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v157 = v154[0].match(/(?:\r\n?|\n).*/g);
        if (v157) {
          this.yylineno += v157.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v157 ? v157[v157.length - 1].length - v157[v157.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v154[0].length
        };
        this.yytext += v154[0];
        this.match += v154[0];
        this.matches = v154;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v154[0].length);
        this.matched += v154[0];
        v156 = this.performAction.call(this, this.yy, this, v155, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v156) {
          return v156;
        } else if (this._backtrack) {
          for (var v159 in v158) {
            this[v159] = v158[v159];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v7(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v160;
        var v161;
        var v162;
        var v163;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v164 = this._currentRules();
        for (var v165 = 0; v165 < v164.length; v165++) {
          v162 = this._input.match(this.rules[v164[v165]]);
          if (v162 && (!v161 || v162[0].length > v161[0].length)) {
            v161 = v162;
            v163 = v165;
            if (this.options.backtrack_lexer) {
              v160 = this.test_match(v162, v164[v165]);
              if (v160 !== false) {
                return v160;
              } else if (this._backtrack) {
                v161 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v161) {
          v160 = this.test_match(v161, v164[v163]);
          if (v160 !== false) {
            return v160;
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
      lex: v7(function v166() {
        var v167 = this.next();
        if (v167) {
          return v167;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v7(function v168(v169) {
        this.conditionStack.push(v169);
      }, "begin"),
      popState: v7(function v170() {
        var v171 = this.conditionStack.length - 1;
        if (v171 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v7(function v172() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v7(function v173(v174) {
        v174 = this.conditionStack.length - 1 - Math.abs(v174 || 0);
        if (v174 >= 0) {
          return this.conditionStack[v174];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v7(function v175(v176) {
        this.begin(v176);
      }, "pushState"),
      stateStackSize: v7(function v177() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v7(function v178(v179, v180, v181, v182) {
        switch (v181) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            this.popState();
            return 36;
          case 3:
            this.popState();
            return 36;
          case 4:
            return 36;
          case 5:
            break;
          case 6:
            return 10;
          case 7:
            this.pushState("acc_title");
            return 19;
          case 8:
            this.popState();
            return "acc_title_value";
          case 9:
            this.pushState("acc_descr");
            return 21;
          case 10:
            this.popState();
            return "acc_descr_value";
          case 11:
            this.pushState("acc_descr_multiline");
            break;
          case 12:
            this.popState();
            break;
          case 13:
            return "acc_descr_multiline_value";
          case 14:
            return 5;
          case 15:
            return 5;
          case 16:
            return 8;
          case 17:
            this.pushState("axis_data");
            return "X_AXIS";
          case 18:
            this.pushState("axis_data");
            return "Y_AXIS";
          case 19:
            this.pushState("axis_band_data");
            return 24;
          case 20:
            return 33;
          case 21:
            this.pushState("data");
            return 16;
          case 22:
            this.pushState("data");
            return 18;
          case 23:
            this.pushState("data_inner");
            return 24;
          case 24:
            return 29;
          case 25:
            this.popState();
            return 26;
          case 26:
            this.popState();
            break;
          case 27:
            this.pushState("string");
            break;
          case 28:
            this.popState();
            break;
          case 29:
            return "STR";
          case 30:
            return 24;
          case 31:
            return 26;
          case 32:
            return 44;
          case 33:
            return "COLON";
          case 34:
            return 45;
          case 35:
            return 28;
          case 36:
            return 46;
          case 37:
            return 47;
          case 38:
            return 49;
          case 39:
            return 51;
          case 40:
            return 48;
          case 41:
            return 42;
          case 42:
            return 50;
          case 43:
            return 43;
          case 44:
            break;
          case 45:
            return 37;
          case 46:
            return 38;
        }
      }, "anonymous"),
      rules: [/^(?:%%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:(\r?\n))/i, /^(?:(\r?\n))/i, /^(?:[\n\r]+)/i, /^(?:%%[^\n]*)/i, /^(?:title\b)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:\})/i, /^(?:[^\}]*)/i, /^(?:xychart-beta\b)/i, /^(?:xychart\b)/i, /^(?:(?:vertical|horizontal))/i, /^(?:x-axis\b)/i, /^(?:y-axis\b)/i, /^(?:\[)/i, /^(?:-->)/i, /^(?:line\b)/i, /^(?:bar\b)/i, /^(?:\[)/i, /^(?:[+-]?(?:\d+(?:\.\d+)?|\.\d+))/i, /^(?:\])/i, /^(?:(?:`\)                                    \{ this\.pushState\(md_string\); \}\n<md_string>\(\?:\(\?!`"\)\.\)\+                  \{ return MD_STR; \}\n<md_string>\(\?:`))/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:\[)/i, /^(?:\])/i, /^(?:[A-Za-z]+)/i, /^(?::)/i, /^(?:\+)/i, /^(?:,)/i, /^(?:=)/i, /^(?:\*)/i, /^(?:#)/i, /^(?:[\_])/i, /^(?:\.)/i, /^(?:&)/i, /^(?:-)/i, /^(?:[0-9]+)/i, /^(?:\s+)/i, /^(?:;)/i, /^(?:$)/i],
      conditions: {
        data_inner: {
          rules: [0, 1, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 24, 25, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
          inclusive: true
        },
        data: {
          rules: [0, 1, 3, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 23, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
          inclusive: true
        },
        axis_band_data: {
          rules: [0, 1, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 25, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
          inclusive: true
        },
        axis_data: {
          rules: [0, 1, 2, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
          inclusive: true
        },
        acc_descr_multiline: {
          rules: [12, 13],
          inclusive: false
        },
        acc_descr: {
          rules: [10],
          inclusive: false
        },
        acc_title: {
          rules: [8],
          inclusive: false
        },
        title: {
          rules: [],
          inclusive: false
        },
        md_string: {
          rules: [],
          inclusive: false
        },
        string: {
          rules: [28, 29],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
          inclusive: true
        }
      }
    };
    return v136;
  }();
  v87.lexer = v135;
  function v183() {
    this.yy = {};
  }
  v7(v183, "Parser");
  v183.prototype = v87;
  v87.Parser = v183;
  return new v183();
}();
parser.parser = parser;
var xychart_default = parser;
function isBarPlot(v184) {
  return v184.type === "bar";
}
v7(isBarPlot, "isBarPlot");
function isBandAxisData(v185) {
  return v185.type === "band";
}
v7(isBandAxisData, "isBandAxisData");
function isLinearAxisData(v186) {
  return v186.type === "linear";
}
v7(isLinearAxisData, "isLinearAxisData");
var TextDimensionCalculatorWithFont = class {
  constructor(v187) {
    this.parentGroup = v187;
  }
  static {
    v7(this, "TextDimensionCalculatorWithFont");
  }
  getMaxDimension(v188, v189) {
    if (!this.parentGroup) {
      return {
        width: v188.reduce((v190, v191) => Math.max(v191.length, v190), 0) * v189,
        height: v189
      };
    }
    const v192 = {
      width: 0,
      height: 0
    };
    const v193 = this.parentGroup.append("g").attr("visibility", "hidden").attr("font-size", v189);
    for (const v194 of v188) {
      const v195 = v17(v193, 1, v194);
      const v196 = v195 ? v195.width : v194.length * v189;
      const v197 = v195 ? v195.height : v189;
      v192.width = Math.max(v192.width, v196);
      v192.height = Math.max(v192.height, v197);
    }
    v193.remove();
    return v192;
  }
};
var BAR_WIDTH_TO_TICK_WIDTH_RATIO = 0.7;
var MAX_OUTER_PADDING_PERCENT_FOR_WRT_LABEL = 0.2;
var BaseAxis = class {
  constructor(v198, v199, v200, v201) {
    this.axisConfig = v198;
    this.title = v199;
    this.textDimensionCalculator = v200;
    this.axisThemeConfig = v201;
    this.boundingRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.axisPosition = "left";
    this.showTitle = false;
    this.showLabel = false;
    this.showTick = false;
    this.showAxisLine = false;
    this.outerPadding = 0;
    this.titleTextHeight = 0;
    this.labelTextHeight = 0;
    this.normalizedLabelRotationInRad = 0;
    this.range = [0, 10];
    this.boundingRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.axisPosition = "left";
    this.normalizedLabelRotationInRad = this.axisConfig.labelRotation >= -90 && this.axisConfig.labelRotation <= 90 ? this.axisConfig.labelRotation * Math.PI / 180 : 0;
  }
  static {
    v7(this, "BaseAxis");
  }
  setRange(v202) {
    this.range = v202;
    if (this.axisPosition === "left" || this.axisPosition === "right") {
      this.boundingRect.height = v202[1] - v202[0];
    } else {
      this.boundingRect.width = v202[1] - v202[0];
    }
    this.recalculateScale();
  }
  getRange() {
    return [this.range[0] + this.outerPadding, this.range[1] - this.outerPadding];
  }
  setAxisPosition(v203) {
    this.axisPosition = v203;
    this.setRange(this.range);
  }
  getTickDistance() {
    const v204 = this.getRange();
    return Math.abs(v204[0] - v204[1]) / this.getTickValues().length;
  }
  getAxisOuterPadding() {
    return this.outerPadding;
  }
  getLabelDimension() {
    return this.textDimensionCalculator.getMaxDimension(this.getTickValues().map(v205 => v205.toString()), this.axisConfig.labelFontSize);
  }
  recalculateOuterPaddingToDrawBar() {
    if (BAR_WIDTH_TO_TICK_WIDTH_RATIO * this.getTickDistance() > this.outerPadding * 2) {
      this.outerPadding = Math.floor(BAR_WIDTH_TO_TICK_WIDTH_RATIO * this.getTickDistance() / 2);
    }
    this.recalculateScale();
  }
  calculateSpaceIfDrawnHorizontally(v206) {
    let v207 = v206.height;
    if (this.axisConfig.showAxisLine && v207 > this.axisConfig.axisLineWidth) {
      v207 -= this.axisConfig.axisLineWidth;
      this.showAxisLine = true;
    }
    if (this.axisConfig.showLabel) {
      const v208 = this.getLabelDimension();
      const v209 = MAX_OUTER_PADDING_PERCENT_FOR_WRT_LABEL * v206.width;
      this.outerPadding = Math.min(v208.width / 2, v209);
      let v210 = v208.height;
      if (this.axisPosition === "bottom" && this.normalizedLabelRotationInRad !== 0) {
        v210 = Math.max(v210, Math.abs(Math.sin(this.normalizedLabelRotationInRad) * v208.width) + Math.abs(Math.cos(this.normalizedLabelRotationInRad) * v208.height));
      }
      v210 += this.axisConfig.labelPadding * 2;
      this.labelTextHeight = v208.height;
      if (v210 <= v207) {
        v207 -= v210;
        this.showLabel = true;
      }
    }
    if (this.axisConfig.showTick && v207 >= this.axisConfig.tickLength) {
      this.showTick = true;
      v207 -= this.axisConfig.tickLength;
    }
    if (this.axisConfig.showTitle && this.title) {
      const v211 = this.textDimensionCalculator.getMaxDimension([this.title], this.axisConfig.titleFontSize);
      const v212 = v211.height + this.axisConfig.titlePadding * 2;
      this.titleTextHeight = v211.height;
      if (v212 <= v207) {
        v207 -= v212;
        this.showTitle = true;
      }
    }
    this.boundingRect.width = v206.width;
    this.boundingRect.height = v206.height - v207;
  }
  calculateSpaceIfDrawnVertical(v213) {
    let v214 = v213.width;
    if (this.axisConfig.showAxisLine && v214 > this.axisConfig.axisLineWidth) {
      v214 -= this.axisConfig.axisLineWidth;
      this.showAxisLine = true;
    }
    if (this.axisConfig.showLabel) {
      const v215 = this.getLabelDimension();
      const v216 = MAX_OUTER_PADDING_PERCENT_FOR_WRT_LABEL * v213.height;
      this.outerPadding = Math.min(v215.height / 2, v216);
      const v217 = v215.width + this.axisConfig.labelPadding * 2;
      if (v217 <= v214) {
        v214 -= v217;
        this.showLabel = true;
      }
    }
    if (this.axisConfig.showTick && v214 >= this.axisConfig.tickLength) {
      this.showTick = true;
      v214 -= this.axisConfig.tickLength;
    }
    if (this.axisConfig.showTitle && this.title) {
      const v218 = this.textDimensionCalculator.getMaxDimension([this.title], this.axisConfig.titleFontSize);
      const v219 = v218.height + this.axisConfig.titlePadding * 2;
      this.titleTextHeight = v218.height;
      if (v219 <= v214) {
        v214 -= v219;
        this.showTitle = true;
      }
    }
    this.boundingRect.width = v213.width - v214;
    this.boundingRect.height = v213.height;
  }
  calculateSpace(v220) {
    if (this.axisPosition === "left" || this.axisPosition === "right") {
      this.calculateSpaceIfDrawnVertical(v220);
    } else {
      this.calculateSpaceIfDrawnHorizontally(v220);
    }
    this.recalculateScale();
    return {
      width: this.boundingRect.width,
      height: this.boundingRect.height
    };
  }
  setBoundingBoxXY(v221) {
    this.boundingRect.x = v221.x;
    this.boundingRect.y = v221.y;
  }
  calculateOffsetByRotation(v222) {
    const v223 = this.normalizedLabelRotationInRad;
    if (v223 === 0) {
      return 0;
    }
    return Math.sin(v223) * this.getLabelDimension()[v222] / 2;
  }
  getDrawableElementsForLeftAxis() {
    const v224 = [];
    if (this.showAxisLine) {
      const v225 = this.boundingRect.x + this.boundingRect.width - this.axisConfig.axisLineWidth / 2;
      v224.push({
        type: "path",
        groupTexts: ["left-axis", "axisl-line"],
        data: [{
          path: "M " + v225 + "," + this.boundingRect.y + " L " + v225 + "," + (this.boundingRect.y + this.boundingRect.height) + " ",
          strokeFill: this.axisThemeConfig.axisLineColor,
          strokeWidth: this.axisConfig.axisLineWidth
        }]
      });
    }
    if (this.showLabel) {
      v224.push({
        type: "text",
        groupTexts: ["left-axis", "label"],
        data: this.getTickValues().map(v226 => ({
          text: v226.toString(),
          x: this.boundingRect.x + this.boundingRect.width - (this.showLabel ? this.axisConfig.labelPadding : 0) - (this.showTick ? this.axisConfig.tickLength : 0) - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0),
          y: this.getScaleValue(v226),
          fill: this.axisThemeConfig.labelColor,
          fontSize: this.axisConfig.labelFontSize,
          rotation: 0,
          verticalPos: "middle",
          horizontalPos: "right"
        }))
      });
    }
    if (this.showTick) {
      const v227 = this.boundingRect.x + this.boundingRect.width - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0);
      v224.push({
        type: "path",
        groupTexts: ["left-axis", "ticks"],
        data: this.getTickValues().map(v228 => ({
          path: "M " + v227 + "," + this.getScaleValue(v228) + " L " + (v227 - this.axisConfig.tickLength) + "," + this.getScaleValue(v228),
          strokeFill: this.axisThemeConfig.tickColor,
          strokeWidth: this.axisConfig.tickWidth
        }))
      });
    }
    if (this.showTitle) {
      v224.push({
        type: "text",
        groupTexts: ["left-axis", "title"],
        data: [{
          text: this.title,
          x: this.boundingRect.x + this.axisConfig.titlePadding,
          y: this.boundingRect.y + this.boundingRect.height / 2,
          fill: this.axisThemeConfig.titleColor,
          fontSize: this.axisConfig.titleFontSize,
          rotation: 270,
          verticalPos: "top",
          horizontalPos: "center"
        }]
      });
    }
    return v224;
  }
  getDrawableElementsForBottomAxis() {
    const v229 = [];
    if (this.showAxisLine) {
      const v230 = this.boundingRect.y + this.axisConfig.axisLineWidth / 2;
      v229.push({
        type: "path",
        groupTexts: ["bottom-axis", "axis-line"],
        data: [{
          path: "M " + this.boundingRect.x + "," + v230 + " L " + (this.boundingRect.x + this.boundingRect.width) + "," + v230,
          strokeFill: this.axisThemeConfig.axisLineColor,
          strokeWidth: this.axisConfig.axisLineWidth
        }]
      });
    }
    if (this.showLabel) {
      v229.push({
        type: "text",
        groupTexts: ["bottom-axis", "label"],
        data: this.getTickValues().map(v231 => ({
          text: v231.toString(),
          x: this.getScaleValue(v231) + this.calculateOffsetByRotation("height"),
          y: this.boundingRect.y + this.axisConfig.labelPadding + (this.showTick ? this.axisConfig.tickLength : 0) + (this.showAxisLine ? this.axisConfig.axisLineWidth : 0) + Math.abs(this.calculateOffsetByRotation("width")),
          fill: this.axisThemeConfig.labelColor,
          fontSize: this.axisConfig.labelFontSize,
          rotation: this.normalizedLabelRotationInRad * 180 / Math.PI,
          verticalPos: "top",
          horizontalPos: "center"
        }))
      });
    }
    if (this.showTick) {
      const v232 = this.boundingRect.y + (this.showAxisLine ? this.axisConfig.axisLineWidth : 0);
      v229.push({
        type: "path",
        groupTexts: ["bottom-axis", "ticks"],
        data: this.getTickValues().map(v233 => ({
          path: "M " + this.getScaleValue(v233) + "," + v232 + " L " + this.getScaleValue(v233) + "," + (v232 + this.axisConfig.tickLength),
          strokeFill: this.axisThemeConfig.tickColor,
          strokeWidth: this.axisConfig.tickWidth
        }))
      });
    }
    if (this.showTitle) {
      v229.push({
        type: "text",
        groupTexts: ["bottom-axis", "title"],
        data: [{
          text: this.title,
          x: this.range[0] + (this.range[1] - this.range[0]) / 2,
          y: this.boundingRect.y + this.boundingRect.height - this.axisConfig.titlePadding - this.titleTextHeight,
          fill: this.axisThemeConfig.titleColor,
          fontSize: this.axisConfig.titleFontSize,
          rotation: 0,
          verticalPos: "top",
          horizontalPos: "center"
        }]
      });
    }
    return v229;
  }
  getDrawableElementsForTopAxis() {
    const v234 = [];
    if (this.showAxisLine) {
      const v235 = this.boundingRect.y + this.boundingRect.height - this.axisConfig.axisLineWidth / 2;
      v234.push({
        type: "path",
        groupTexts: ["top-axis", "axis-line"],
        data: [{
          path: "M " + this.boundingRect.x + "," + v235 + " L " + (this.boundingRect.x + this.boundingRect.width) + "," + v235,
          strokeFill: this.axisThemeConfig.axisLineColor,
          strokeWidth: this.axisConfig.axisLineWidth
        }]
      });
    }
    if (this.showLabel) {
      v234.push({
        type: "text",
        groupTexts: ["top-axis", "label"],
        data: this.getTickValues().map(v236 => ({
          text: v236.toString(),
          x: this.getScaleValue(v236),
          y: this.boundingRect.y + (this.showTitle ? this.titleTextHeight + this.axisConfig.titlePadding * 2 : 0) + this.axisConfig.labelPadding,
          fill: this.axisThemeConfig.labelColor,
          fontSize: this.axisConfig.labelFontSize,
          rotation: 0,
          verticalPos: "top",
          horizontalPos: "center"
        }))
      });
    }
    if (this.showTick) {
      const v237 = this.boundingRect.y;
      v234.push({
        type: "path",
        groupTexts: ["top-axis", "ticks"],
        data: this.getTickValues().map(v238 => ({
          path: "M " + this.getScaleValue(v238) + "," + (v237 + this.boundingRect.height - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0)) + " L " + this.getScaleValue(v238) + "," + (v237 + this.boundingRect.height - this.axisConfig.tickLength - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0)),
          strokeFill: this.axisThemeConfig.tickColor,
          strokeWidth: this.axisConfig.tickWidth
        }))
      });
    }
    if (this.showTitle) {
      v234.push({
        type: "text",
        groupTexts: ["top-axis", "title"],
        data: [{
          text: this.title,
          x: this.boundingRect.x + this.boundingRect.width / 2,
          y: this.boundingRect.y + this.axisConfig.titlePadding,
          fill: this.axisThemeConfig.titleColor,
          fontSize: this.axisConfig.titleFontSize,
          rotation: 0,
          verticalPos: "top",
          horizontalPos: "center"
        }]
      });
    }
    return v234;
  }
  getDrawableElements() {
    if (this.axisPosition === "left") {
      return this.getDrawableElementsForLeftAxis();
    }
    if (this.axisPosition === "right") {
      throw Error("Drawing of right axis is not implemented");
    }
    if (this.axisPosition === "bottom") {
      return this.getDrawableElementsForBottomAxis();
    }
    if (this.axisPosition === "top") {
      return this.getDrawableElementsForTopAxis();
    }
    return [];
  }
};
var BandAxis = class extends BaseAxis {
  static {
    v7(this, "BandAxis");
  }
  constructor(v239, v240, v241, v242, v243) {
    super(v239, v242, v243, v240);
    this.categories = v241;
    this.scale = band().domain(this.categories).range(this.getRange());
  }
  setRange(v244) {
    super.setRange(v244);
  }
  recalculateScale() {
    this.scale = band().domain(this.categories).range(this.getRange()).paddingInner(1).paddingOuter(0).align(0.5);
    v8.trace("BandAxis axis final categories, range: ", this.categories, this.getRange());
  }
  getTickValues() {
    return this.categories;
  }
  getScaleValue(v245) {
    return this.scale(v245) ?? this.getRange()[0];
  }
};
var LinearAxis = class extends BaseAxis {
  static {
    v7(this, "LinearAxis");
  }
  constructor(v246, v247, v248, v249, v250) {
    super(v246, v249, v250, v247);
    this.domain = v248;
    this.scale = v21().domain(this.domain).range(this.getRange());
  }
  getTickValues() {
    return this.scale.ticks();
  }
  recalculateScale() {
    const v251 = [...this.domain];
    if (this.axisPosition === "left") {
      v251.reverse();
    }
    this.scale = v21().domain(v251).range(this.getRange());
  }
  getScaleValue(v252) {
    return this.scale(v252);
  }
};
function getAxis(v253, v254, v255, v256) {
  const v257 = new TextDimensionCalculatorWithFont(v256);
  if (isBandAxisData(v253)) {
    return new BandAxis(v254, v255, v253.categories, v253.title, v257);
  }
  return new LinearAxis(v254, v255, [v253.min, v253.max], v253.title, v257);
}
v7(getAxis, "getAxis");
var ChartTitle = class {
  constructor(v258, v259, v260, v261) {
    this.textDimensionCalculator = v258;
    this.chartConfig = v259;
    this.chartData = v260;
    this.chartThemeConfig = v261;
    this.boundingRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.showChartTitle = false;
  }
  static {
    v7(this, "ChartTitle");
  }
  setBoundingBoxXY(v262) {
    this.boundingRect.x = v262.x;
    this.boundingRect.y = v262.y;
  }
  calculateSpace(v263) {
    const v264 = this.textDimensionCalculator.getMaxDimension([this.chartData.title], this.chartConfig.titleFontSize);
    const v265 = Math.max(v264.width, v263.width);
    const v266 = v264.height + this.chartConfig.titlePadding * 2;
    if (v264.width <= v265 && v264.height <= v266 && this.chartConfig.showTitle && this.chartData.title) {
      this.boundingRect.width = v265;
      this.boundingRect.height = v266;
      this.showChartTitle = true;
    }
    return {
      width: this.boundingRect.width,
      height: this.boundingRect.height
    };
  }
  getDrawableElements() {
    const v267 = [];
    if (this.showChartTitle) {
      v267.push({
        groupTexts: ["chart-title"],
        type: "text",
        data: [{
          fontSize: this.chartConfig.titleFontSize,
          text: this.chartData.title,
          verticalPos: "middle",
          horizontalPos: "center",
          x: this.boundingRect.x + this.boundingRect.width / 2,
          y: this.boundingRect.y + this.boundingRect.height / 2,
          fill: this.chartThemeConfig.titleColor,
          rotation: 0
        }]
      });
    }
    return v267;
  }
};
function getChartTitleComponent(v268, v269, v270, v271) {
  const v272 = new TextDimensionCalculatorWithFont(v271);
  return new ChartTitle(v272, v268, v269, v270);
}
v7(getChartTitleComponent, "getChartTitleComponent");
var LinePlot = class {
  constructor(v273, v274, v275, v276, v277) {
    this.plotData = v273;
    this.xAxis = v274;
    this.yAxis = v275;
    this.orientation = v276;
    this.plotIndex = v277;
  }
  static {
    v7(this, "LinePlot");
  }
  getDrawableElement() {
    const v278 = this.plotData.data.map(v279 => [this.xAxis.getScaleValue(v279[0]), this.yAxis.getScaleValue(v279[1])]);
    let v280;
    if (this.orientation === "horizontal") {
      v280 = v18().y(v281 => v281[0]).x(v282 => v282[1])(v278);
    } else {
      v280 = v18().x(v283 => v283[0]).y(v284 => v284[1])(v278);
    }
    if (!v280) {
      return [];
    }
    const v285 = [{
      groupTexts: ["plot", "line-plot-" + this.plotIndex],
      type: "path",
      data: [{
        path: v280,
        strokeFill: this.plotData.strokeFill,
        strokeWidth: this.plotData.strokeWidth
      }]
    }];
    if (this.plotData.pointLabels && this.plotData.pointLabels.length > 0) {
      const v286 = 10;
      const v287 = 12;
      const v288 = [];
      for (const [v289, [v290, v291]] of v278.entries()) {
        const v292 = this.plotData.pointLabels[v289];
        if (!v292) {
          continue;
        }
        if (this.orientation === "horizontal") {
          v288.push({
            x: v291 + v286,
            y: v290,
            text: v292,
            fill: this.plotData.strokeFill,
            verticalPos: "middle",
            horizontalPos: "left",
            fontSize: v287,
            rotation: 0
          });
        } else {
          v288.push({
            x: v290,
            y: v291 - v286,
            text: v292,
            fill: this.plotData.strokeFill,
            verticalPos: "middle",
            horizontalPos: "center",
            fontSize: v287,
            rotation: 0
          });
        }
      }
      if (v288.length > 0) {
        v285.push({
          groupTexts: ["plot", "line-plot-" + this.plotIndex, "labels"],
          type: "text",
          data: v288
        });
      }
    }
    return v285;
  }
};
var BarPlot = class {
  constructor(v293, v294, v295, v296, v297, v298) {
    this.barData = v293;
    this.boundingRect = v294;
    this.xAxis = v295;
    this.yAxis = v296;
    this.orientation = v297;
    this.plotIndex = v298;
  }
  static {
    v7(this, "BarPlot");
  }
  getDrawableElement() {
    const v299 = this.barData.data.map(v300 => [this.xAxis.getScaleValue(v300[0]), this.yAxis.getScaleValue(v300[1])]);
    const v301 = 0.05;
    const v302 = Math.min(this.xAxis.getAxisOuterPadding() * 2, this.xAxis.getTickDistance()) * (1 - v301);
    const v303 = v302 / 2;
    if (this.orientation === "horizontal") {
      return [{
        groupTexts: ["plot", "bar-plot-" + this.plotIndex],
        type: "rect",
        data: v299.map(v304 => ({
          x: this.boundingRect.x,
          y: v304[0] - v303,
          height: v302,
          width: v304[1] - this.boundingRect.x,
          fill: this.barData.fill,
          strokeWidth: 0,
          strokeFill: this.barData.fill
        }))
      }];
    }
    return [{
      groupTexts: ["plot", "bar-plot-" + this.plotIndex],
      type: "rect",
      data: v299.map(v305 => ({
        x: v305[0] - v303,
        y: v305[1],
        width: v302,
        height: this.boundingRect.y + this.boundingRect.height - v305[1],
        fill: this.barData.fill,
        strokeWidth: 0,
        strokeFill: this.barData.fill
      }))
    }];
  }
};
var BasePlot = class {
  constructor(v306, v307, v308) {
    this.chartConfig = v306;
    this.chartData = v307;
    this.chartThemeConfig = v308;
    this.boundingRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }
  static {
    v7(this, "BasePlot");
  }
  setAxes(v309, v310) {
    this.xAxis = v309;
    this.yAxis = v310;
  }
  setBoundingBoxXY(v311) {
    this.boundingRect.x = v311.x;
    this.boundingRect.y = v311.y;
  }
  calculateSpace(v312) {
    this.boundingRect.width = v312.width;
    this.boundingRect.height = v312.height;
    return {
      width: this.boundingRect.width,
      height: this.boundingRect.height
    };
  }
  getDrawableElements() {
    if (!this.xAxis || !this.yAxis) {
      throw Error("Axes must be passed to render Plots");
    }
    const v313 = [];
    for (const [v314, v315] of this.chartData.plots.entries()) {
      switch (v315.type) {
        case "line":
          {
            const v316 = new LinePlot(v315, this.xAxis, this.yAxis, this.chartConfig.chartOrientation, v314);
            v313.push(...v316.getDrawableElement());
          }
          break;
        case "bar":
          {
            const v317 = new BarPlot(v315, this.boundingRect, this.xAxis, this.yAxis, this.chartConfig.chartOrientation, v314);
            v313.push(...v317.getDrawableElement());
          }
          break;
      }
    }
    return v313;
  }
};
function getPlotComponent(v318, v319, v320) {
  return new BasePlot(v318, v319, v320);
}
v7(getPlotComponent, "getPlotComponent");
var Orchestrator = class {
  constructor(v321, v322, v323, v324) {
    this.chartConfig = v321;
    this.chartData = v322;
    this.componentStore = {
      title: getChartTitleComponent(v321, v322, v323, v324),
      plot: getPlotComponent(v321, v322, v323),
      xAxis: getAxis(v322.xAxis, v321.xAxis, {
        titleColor: v323.xAxisTitleColor,
        labelColor: v323.xAxisLabelColor,
        tickColor: v323.xAxisTickColor,
        axisLineColor: v323.xAxisLineColor
      }, v324),
      yAxis: getAxis(v322.yAxis, v321.yAxis, {
        titleColor: v323.yAxisTitleColor,
        labelColor: v323.yAxisLabelColor,
        tickColor: v323.yAxisTickColor,
        axisLineColor: v323.yAxisLineColor
      }, v324)
    };
  }
  static {
    v7(this, "Orchestrator");
  }
  calculateVerticalSpace() {
    let v325 = this.chartConfig.width;
    let v326 = this.chartConfig.height;
    let v327 = 0;
    let v328 = 0;
    let v329 = Math.floor(v325 * this.chartConfig.plotReservedSpacePercent / 100);
    let v330 = Math.floor(v326 * this.chartConfig.plotReservedSpacePercent / 100);
    let v331 = this.componentStore.plot.calculateSpace({
      width: v329,
      height: v330
    });
    v325 -= v331.width;
    v326 -= v331.height;
    v331 = this.componentStore.title.calculateSpace({
      width: this.chartConfig.width,
      height: v326
    });
    v328 = v331.height;
    v326 -= v331.height;
    this.componentStore.xAxis.setAxisPosition("bottom");
    v331 = this.componentStore.xAxis.calculateSpace({
      width: v325,
      height: v326
    });
    v326 -= v331.height;
    this.componentStore.yAxis.setAxisPosition("left");
    v331 = this.componentStore.yAxis.calculateSpace({
      width: v325,
      height: v326
    });
    v327 = v331.width;
    v325 -= v331.width;
    if (v325 > 0) {
      v329 += v325;
      v325 = 0;
    }
    if (v326 > 0) {
      v330 += v326;
      v326 = 0;
    }
    this.componentStore.plot.calculateSpace({
      width: v329,
      height: v330
    });
    this.componentStore.plot.setBoundingBoxXY({
      x: v327,
      y: v328
    });
    this.componentStore.xAxis.setRange([v327, v327 + v329]);
    this.componentStore.xAxis.setBoundingBoxXY({
      x: v327,
      y: v328 + v330
    });
    this.componentStore.yAxis.setRange([v328, v328 + v330]);
    this.componentStore.yAxis.setBoundingBoxXY({
      x: 0,
      y: v328
    });
    if (this.chartData.plots.some(v332 => isBarPlot(v332))) {
      this.componentStore.xAxis.recalculateOuterPaddingToDrawBar();
    }
  }
  calculateHorizontalSpace() {
    let v333 = this.chartConfig.width;
    let v334 = this.chartConfig.height;
    let v335 = 0;
    let v336 = 0;
    let v337 = 0;
    let v338 = Math.floor(v333 * this.chartConfig.plotReservedSpacePercent / 100);
    let v339 = Math.floor(v334 * this.chartConfig.plotReservedSpacePercent / 100);
    let v340 = this.componentStore.plot.calculateSpace({
      width: v338,
      height: v339
    });
    v333 -= v340.width;
    v334 -= v340.height;
    v340 = this.componentStore.title.calculateSpace({
      width: this.chartConfig.width,
      height: v334
    });
    v335 = v340.height;
    v334 -= v340.height;
    this.componentStore.xAxis.setAxisPosition("left");
    v340 = this.componentStore.xAxis.calculateSpace({
      width: v333,
      height: v334
    });
    v333 -= v340.width;
    v336 = v340.width;
    this.componentStore.yAxis.setAxisPosition("top");
    v340 = this.componentStore.yAxis.calculateSpace({
      width: v333,
      height: v334
    });
    v334 -= v340.height;
    v337 = v335 + v340.height;
    if (v333 > 0) {
      v338 += v333;
      v333 = 0;
    }
    if (v334 > 0) {
      v339 += v334;
      v334 = 0;
    }
    this.componentStore.plot.calculateSpace({
      width: v338,
      height: v339
    });
    this.componentStore.plot.setBoundingBoxXY({
      x: v336,
      y: v337
    });
    this.componentStore.yAxis.setRange([v336, v336 + v338]);
    this.componentStore.yAxis.setBoundingBoxXY({
      x: v336,
      y: v335
    });
    this.componentStore.xAxis.setRange([v337, v337 + v339]);
    this.componentStore.xAxis.setBoundingBoxXY({
      x: 0,
      y: v337
    });
    if (this.chartData.plots.some(v341 => isBarPlot(v341))) {
      this.componentStore.xAxis.recalculateOuterPaddingToDrawBar();
    }
  }
  calculateSpace() {
    if (this.chartConfig.chartOrientation === "horizontal") {
      this.calculateHorizontalSpace();
    } else {
      this.calculateVerticalSpace();
    }
  }
  getDrawableElement() {
    this.calculateSpace();
    const v342 = [];
    this.componentStore.plot.setAxes(this.componentStore.xAxis, this.componentStore.yAxis);
    for (const v343 of Object.values(this.componentStore)) {
      v342.push(...v343.getDrawableElements());
    }
    return v342;
  }
};
var XYChartBuilder = class {
  static {
    v7(this, "XYChartBuilder");
  }
  static build(v344, v345, v346, v347) {
    const v348 = new Orchestrator(v344, v345, v346, v347);
    return v348.getDrawableElement();
  }
};
var plotIndex = 0;
var tmpSVGGroup;
var xyChartConfig = getChartDefaultConfig();
var xyChartThemeConfig = getChartDefaultThemeConfig();
var xyChartData = getChartDefaultData();
var plotColorPalette = xyChartThemeConfig.plotColorPalette.split(",").map(v349 => v349.trim());
var hasSetXAxis = false;
var hasSetYAxis = false;
function getChartDefaultThemeConfig() {
  const v350 = v16();
  const v351 = v12();
  return v14(v350.xyChart, v351.themeVariables.xyChart);
}
v7(getChartDefaultThemeConfig, "getChartDefaultThemeConfig");
function getChartDefaultConfig() {
  const v352 = v12();
  return v14(v15.xyChart, v352.xyChart);
}
v7(getChartDefaultConfig, "getChartDefaultConfig");
function getChartDefaultData() {
  return {
    yAxis: {
      type: "linear",
      title: "",
      min: Infinity,
      max: -Infinity
    },
    xAxis: {
      type: "band",
      title: "",
      categories: []
    },
    title: "",
    plots: []
  };
}
v7(getChartDefaultData, "getChartDefaultData");
function textSanitizer(v353) {
  const v354 = v12();
  return v13(v353.trim(), v354);
}
v7(textSanitizer, "textSanitizer");
function setTmpSVGG(v355) {
  tmpSVGGroup = v355;
}
v7(setTmpSVGG, "setTmpSVGG");
function setOrientation(v356) {
  if (v356 === "horizontal") {
    xyChartConfig.chartOrientation = "horizontal";
  } else {
    xyChartConfig.chartOrientation = "vertical";
  }
}
v7(setOrientation, "setOrientation");
function setXAxisTitle(v357) {
  xyChartData.xAxis.title = textSanitizer(v357.text);
}
v7(setXAxisTitle, "setXAxisTitle");
function setXAxisRangeData(v358, v359) {
  xyChartData.xAxis = {
    type: "linear",
    title: xyChartData.xAxis.title,
    min: v358,
    max: v359
  };
  hasSetXAxis = true;
}
v7(setXAxisRangeData, "setXAxisRangeData");
function setXAxisBand(v360) {
  xyChartData.xAxis = {
    type: "band",
    title: xyChartData.xAxis.title,
    categories: v360.map(v361 => textSanitizer(v361.text))
  };
  hasSetXAxis = true;
}
v7(setXAxisBand, "setXAxisBand");
function setYAxisTitle(v362) {
  xyChartData.yAxis.title = textSanitizer(v362.text);
}
v7(setYAxisTitle, "setYAxisTitle");
function setYAxisRangeData(v363, v364) {
  xyChartData.yAxis = {
    type: "linear",
    title: xyChartData.yAxis.title,
    min: v363,
    max: v364
  };
  hasSetYAxis = true;
}
v7(setYAxisRangeData, "setYAxisRangeData");
function setYAxisRangeFromPlotData(v365) {
  const v366 = Math.min(...v365);
  const v367 = Math.max(...v365);
  const v368 = isLinearAxisData(xyChartData.yAxis) ? xyChartData.yAxis.min : Infinity;
  const v369 = isLinearAxisData(xyChartData.yAxis) ? xyChartData.yAxis.max : -Infinity;
  xyChartData.yAxis = {
    type: "linear",
    title: xyChartData.yAxis.title,
    min: Math.min(v368, v366),
    max: Math.max(v369, v367)
  };
}
v7(setYAxisRangeFromPlotData, "setYAxisRangeFromPlotData");
function transformDataWithoutCategory(v370) {
  let v371 = [];
  if (v370.length === 0) {
    return v371;
  }
  if (!hasSetXAxis) {
    const v372 = isLinearAxisData(xyChartData.xAxis) ? xyChartData.xAxis.min : Infinity;
    const v373 = isLinearAxisData(xyChartData.xAxis) ? xyChartData.xAxis.max : -Infinity;
    setXAxisRangeData(Math.min(v372, 1), Math.max(v373, v370.length));
  }
  if (isBandAxisData(xyChartData.xAxis) && v370.length > xyChartData.xAxis.categories.length) {
    v370 = v370.slice(0, xyChartData.xAxis.categories.length);
  }
  if (!hasSetYAxis) {
    setYAxisRangeFromPlotData(v370);
  }
  if (isBandAxisData(xyChartData.xAxis)) {
    v371 = xyChartData.xAxis.categories.map((v374, v375) => [v374, v370[v375]]);
  }
  if (isLinearAxisData(xyChartData.xAxis)) {
    const v376 = xyChartData.xAxis.min;
    const v377 = xyChartData.xAxis.max;
    if (v370.length === 1) {
      v371 = [["" + v376, v370[0]]];
    } else {
      const v378 = (v377 - v376) / (v370.length - 1);
      v371 = v370.map((v379, v380) => ["" + (v376 + v380 * v378), v379]);
    }
  }
  return v371;
}
v7(transformDataWithoutCategory, "transformDataWithoutCategory");
function getPlotColorFromPalette(v381) {
  return plotColorPalette[v381 === 0 ? 0 : v381 % plotColorPalette.length];
}
v7(getPlotColorFromPalette, "getPlotColorFromPalette");
function setLineData(v382, v383) {
  const v384 = v383.map(v385 => v385.value);
  const v386 = v383.map(v387 => v387.label ? textSanitizer(v387.label) : "");
  const v388 = transformDataWithoutCategory(v384);
  const v389 = v386.some(v390 => v390 !== "");
  xyChartData.plots.push({
    type: "line",
    strokeFill: getPlotColorFromPalette(plotIndex),
    strokeWidth: 2,
    data: v388,
    ...(v389 ? {
      pointLabels: v386
    } : {})
  });
  plotIndex++;
}
v7(setLineData, "setLineData");
function setBarData(v391, v392) {
  const v393 = v392.map(v394 => v394.value);
  const v395 = transformDataWithoutCategory(v393);
  xyChartData.plots.push({
    type: "bar",
    fill: getPlotColorFromPalette(plotIndex),
    data: v395
  });
  plotIndex++;
}
v7(setBarData, "setBarData");
function getDrawableElem() {
  if (xyChartData.plots.length === 0) {
    throw Error("No Plot to render, please provide a plot with some data");
  }
  xyChartData.title = v3();
  return XYChartBuilder.build(xyChartConfig, xyChartData, xyChartThemeConfig, tmpSVGGroup);
}
v7(getDrawableElem, "getDrawableElem");
function getChartThemeConfig() {
  return xyChartThemeConfig;
}
v7(getChartThemeConfig, "getChartThemeConfig");
function getChartConfig() {
  return xyChartConfig;
}
v7(getChartConfig, "getChartConfig");
function getXYChartData() {
  return xyChartData;
}
v7(getXYChartData, "getXYChartData");
var clear2 = v7(function () {
  v11();
  plotIndex = 0;
  xyChartConfig = getChartDefaultConfig();
  xyChartData = getChartDefaultData();
  xyChartThemeConfig = getChartDefaultThemeConfig();
  plotColorPalette = xyChartThemeConfig.plotColorPalette.split(",").map(v396 => v396.trim());
  hasSetXAxis = false;
  hasSetYAxis = false;
}, "clear");
var xychartDb_default = {
  getDrawableElem: getDrawableElem,
  clear: clear2,
  setAccTitle: v6,
  getAccTitle: v5,
  setDiagramTitle: v4,
  getDiagramTitle: v3,
  getAccDescription: v2,
  setAccDescription: v1,
  setOrientation: setOrientation,
  setXAxisTitle: setXAxisTitle,
  setXAxisRangeData: setXAxisRangeData,
  setXAxisBand: setXAxisBand,
  setYAxisTitle: setYAxisTitle,
  setYAxisRangeData: setYAxisRangeData,
  setLineData: setLineData,
  setBarData: setBarData,
  setTmpSVGG: setTmpSVGG,
  getChartThemeConfig: getChartThemeConfig,
  getChartConfig: getChartConfig,
  getXYChartData: getXYChartData
};
var draw = v7((v397, v398, v399, v400) => {
  const v401 = v400.db;
  const v402 = v401.getChartThemeConfig();
  const v403 = v401.getChartConfig();
  const v404 = v401.getXYChartData().plots[0].data.map(v405 => v405[1]);
  function v406(v407) {
    if (v407 === "top") {
      return "text-before-edge";
    } else {
      return "middle";
    }
  }
  v7(v406, "getDominantBaseLine");
  function v408(v409) {
    if (v409 === "left") {
      return "start";
    } else if (v409 === "right") {
      return "end";
    } else {
      return "middle";
    }
  }
  v7(v408, "getTextAnchor");
  function v410(v411) {
    return "translate(" + v411.x + ", " + v411.y + ") rotate(" + (v411.rotation || 0) + ")";
  }
  v7(v410, "getTextTransformation");
  v8.debug("Rendering xychart chart\n" + v397);
  const v412 = v9(v398);
  const v413 = v412.append("g").attr("class", "main");
  const v414 = v413.append("rect").attr("width", v403.width).attr("height", v403.height).attr("class", "background");
  v10(v412, v403.height, v403.width, true);
  v412.attr("viewBox", "0 0 " + v403.width + " " + v403.height);
  v414.attr("fill", v402.backgroundColor);
  v401.setTmpSVGG(v412.append("g").attr("class", "mermaid-tmp-group"));
  const v415 = v401.getDrawableElem();
  const v416 = {};
  function v417(v418) {
    let v419 = v413;
    let v420 = "";
    for (const [v421] of v418.entries()) {
      let v422 = v413;
      if (v421 > 0 && v416[v420]) {
        v422 = v416[v420];
      }
      v420 += v418[v421];
      v419 = v416[v420];
      if (!v419) {
        v419 = v416[v420] = v422.append("g").attr("class", v418[v421]);
      }
    }
    return v419;
  }
  v7(v417, "getGroup");
  for (const v423 of v415) {
    if (v423.data.length === 0) {
      continue;
    }
    const v424 = v417(v423.groupTexts);
    switch (v423.type) {
      case "rect":
        v424.selectAll("rect").data(v423.data).enter().append("rect").attr("x", v425 => v425.x).attr("y", v426 => v426.y).attr("width", v427 => v427.width).attr("height", v428 => v428.height).attr("fill", v429 => v429.fill).attr("stroke", v430 => v430.strokeFill).attr("stroke-width", v431 => v431.strokeWidth);
        if (v403.showDataLabel) {
          const v432 = v403.showDataLabelOutsideBar;
          if (v403.chartOrientation === "horizontal") {
            let v433 = function (v434, v435) {
              const {
                data: v436,
                label: v437
              } = v434;
              const v438 = v435 * v437.length * v439;
              return v438 <= v436.width - v440;
            };
            v7(v433, "fitsHorizontally");
            const v439 = 0.7;
            const v440 = 10;
            const v441 = v423.data.map((v442, v443) => ({
              data: v442,
              label: v404[v443].toString()
            })).filter(v444 => v444.data.width > 0 && v444.data.height > 0);
            const v445 = v441.map(v446 => {
              const {
                data: v447
              } = v446;
              let v448 = v447.height * 0.7;
              while (!v433(v446, v448) && v448 > 0) {
                v448 -= 1;
              }
              return v448;
            });
            const v449 = Math.floor(Math.min(...v445));
            const v450 = v7(v451 => {
              if (v432) {
                return v451.data.x + v451.data.width + v440;
              } else {
                return v451.data.x + v451.data.width - v440;
              }
            }, "determineLabelXPosition");
            v424.selectAll("text").data(v441).enter().append("text").attr("x", v450).attr("y", v452 => v452.data.y + v452.data.height / 2).attr("text-anchor", v432 ? "start" : "end").attr("dominant-baseline", "middle").attr("fill", v402.dataLabelColor).attr("font-size", v449 + "px").text(v453 => v453.label);
          } else {
            let v454 = function (v455, v456, v457) {
              const {
                data: v458,
                label: v459
              } = v455;
              const v460 = 0.7;
              const v461 = v456 * v459.length * v460;
              const v462 = v458.x + v458.width / 2;
              const v463 = v462 - v461 / 2;
              const v464 = v462 + v461 / 2;
              const v465 = v463 >= v458.x && v464 <= v458.x + v458.width;
              const v466 = v458.y + v457 + v456 <= v458.y + v458.height;
              return v465 && v466;
            };
            v7(v454, "fitsInBar");
            const v467 = 10;
            const v468 = v423.data.map((v469, v470) => ({
              data: v469,
              label: v404[v470].toString()
            })).filter(v471 => v471.data.width > 0 && v471.data.height > 0);
            const v472 = v468.map(v473 => {
              const {
                data: v474,
                label: v475
              } = v473;
              let v476 = v474.width / (v475.length * 0.7);
              while (!v454(v473, v476, v467) && v476 > 0) {
                v476 -= 1;
              }
              return v476;
            });
            const v477 = Math.floor(Math.min(...v472));
            const v478 = v7(v479 => {
              if (v432) {
                return v479.data.y - v467;
              } else {
                return v479.data.y + v467;
              }
            }, "determineLabelYPosition");
            v424.selectAll("text").data(v468).enter().append("text").attr("x", v480 => v480.data.x + v480.data.width / 2).attr("y", v478).attr("text-anchor", "middle").attr("dominant-baseline", v432 ? "auto" : "hanging").attr("fill", v402.dataLabelColor).attr("font-size", v477 + "px").text(v481 => v481.label);
          }
        }
        break;
      case "text":
        v424.selectAll("text").data(v423.data).enter().append("text").attr("x", 0).attr("y", 0).attr("fill", v482 => v482.fill).attr("font-size", v483 => v483.fontSize).attr("dominant-baseline", v484 => v406(v484.verticalPos)).attr("text-anchor", v485 => v408(v485.horizontalPos)).attr("transform", v486 => v410(v486)).text(v487 => v487.text);
        break;
      case "path":
        v424.selectAll("path").data(v423.data).enter().append("path").attr("d", v488 => v488.path).attr("fill", v489 => v489.fill ? v489.fill : "none").attr("stroke", v490 => v490.strokeFill).attr("stroke-width", v491 => v491.strokeWidth);
        break;
    }
  }
}, "draw");
var xychartRenderer_default = {
  draw: draw
};
var diagram = {
  parser: xychart_default,
  db: xychartDb_default,
  renderer: xychartRenderer_default
};
export { diagram };