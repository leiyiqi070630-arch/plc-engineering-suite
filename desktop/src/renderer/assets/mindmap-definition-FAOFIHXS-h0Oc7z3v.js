import { g as v1 } from "./chunk-XXDRQBXY-CzLCVi_O.js";
import { s as v2 } from "./chunk-KBJHAD2P-BXgOlElY.js";
import { _ as v3, l as v5, u as v6, v as v7, y as v8, B as v9, c as v10, i as v11, b7 as v12, T as v13, U as v14, V as v15 } from "./index-CXb3UsfP.js";
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(v16, v17 = 0) {
  return (byteToHex[v16[v17 + 0]] + byteToHex[v16[v17 + 1]] + byteToHex[v16[v17 + 2]] + byteToHex[v16[v17 + 3]] + "-" + byteToHex[v16[v17 + 4]] + byteToHex[v16[v17 + 5]] + "-" + byteToHex[v16[v17 + 6]] + byteToHex[v16[v17 + 7]] + "-" + byteToHex[v16[v17 + 8]] + byteToHex[v16[v17 + 9]] + "-" + byteToHex[v16[v17 + 10]] + byteToHex[v16[v17 + 11]] + byteToHex[v16[v17 + 12]] + byteToHex[v16[v17 + 13]] + byteToHex[v16[v17 + 14]] + byteToHex[v16[v17 + 15]]).toLowerCase();
}
const rnds8 = new Uint8Array(16);
function rng() {
  return crypto.getRandomValues(rnds8);
}
function v4(v18, v19, v20) {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return _v4(v18);
}
function _v4(v21, v22, v23) {
  v21 = v21 || {};
  const v24 = v21.random ?? v21.rng?.() ?? rng();
  if (v24.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  v24[6] = v24[6] & 15 | 64;
  v24[8] = v24[8] & 63 | 128;
  return unsafeStringify(v24);
}
var parser = function () {
  var v25 = v3(function (v26, v27, v28, v29) {
    v28 = v28 || {};
    v29 = v26.length;
    for (; v29--; v28[v26[v29]] = v27);
    return v28;
  }, "o");
  var v30 = [1, 4];
  var v31 = [1, 13];
  var v32 = [1, 12];
  var v33 = [1, 15];
  var v34 = [1, 16];
  var v35 = [1, 20];
  var v36 = [1, 19];
  var v37 = [6, 7, 8];
  var v38 = [1, 26];
  var v39 = [1, 24];
  var v40 = [1, 25];
  var v41 = [6, 7, 11];
  var v42 = [1, 6, 13, 15, 16, 19, 22];
  var v43 = [1, 33];
  var v44 = [1, 34];
  var v45 = [1, 6, 7, 11, 13, 15, 16, 19, 22];
  var v46 = {
    trace: v3(function v47() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      mindMap: 4,
      spaceLines: 5,
      SPACELINE: 6,
      NL: 7,
      MINDMAP: 8,
      document: 9,
      stop: 10,
      EOF: 11,
      statement: 12,
      SPACELIST: 13,
      node: 14,
      ICON: 15,
      CLASS: 16,
      nodeWithId: 17,
      nodeWithoutId: 18,
      NODE_DSTART: 19,
      NODE_DESCR: 20,
      NODE_DEND: 21,
      NODE_ID: 22,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      6: "SPACELINE",
      7: "NL",
      8: "MINDMAP",
      11: "EOF",
      13: "SPACELIST",
      15: "ICON",
      16: "CLASS",
      19: "NODE_DSTART",
      20: "NODE_DESCR",
      21: "NODE_DEND",
      22: "NODE_ID"
    },
    productions_: [0, [3, 1], [3, 2], [5, 1], [5, 2], [5, 2], [4, 2], [4, 3], [10, 1], [10, 1], [10, 1], [10, 2], [10, 2], [9, 3], [9, 2], [12, 2], [12, 2], [12, 2], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [14, 1], [14, 1], [18, 3], [17, 1], [17, 4]],
    performAction: v3(function v48(v49, v50, v51, v52, v53, v54, v55) {
      var v56 = v54.length - 1;
      switch (v53) {
        case 6:
        case 7:
          return v52;
        case 8:
          v52.getLogger().trace("Stop NL ");
          break;
        case 9:
          v52.getLogger().trace("Stop EOF ");
          break;
        case 11:
          v52.getLogger().trace("Stop NL2 ");
          break;
        case 12:
          v52.getLogger().trace("Stop EOF2 ");
          break;
        case 15:
          v52.getLogger().info("Node: ", v54[v56].id);
          v52.addNode(v54[v56 - 1].length, v54[v56].id, v54[v56].descr, v54[v56].type);
          break;
        case 16:
          v52.getLogger().trace("Icon: ", v54[v56]);
          v52.decorateNode({
            icon: v54[v56]
          });
          break;
        case 17:
        case 21:
          v52.decorateNode({
            class: v54[v56]
          });
          break;
        case 18:
          v52.getLogger().trace("SPACELIST");
          break;
        case 19:
          v52.getLogger().trace("Node: ", v54[v56].id);
          v52.addNode(0, v54[v56].id, v54[v56].descr, v54[v56].type);
          break;
        case 20:
          v52.decorateNode({
            icon: v54[v56]
          });
          break;
        case 25:
          v52.getLogger().trace("node found ..", v54[v56 - 2]);
          this.$ = {
            id: v54[v56 - 1],
            descr: v54[v56 - 1],
            type: v52.getType(v54[v56 - 2], v54[v56])
          };
          break;
        case 26:
          this.$ = {
            id: v54[v56],
            descr: v54[v56],
            type: v52.nodeType.DEFAULT
          };
          break;
        case 27:
          v52.getLogger().trace("node found ..", v54[v56 - 3]);
          this.$ = {
            id: v54[v56 - 3],
            descr: v54[v56 - 1],
            type: v52.getType(v54[v56 - 2], v54[v56])
          };
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: 2,
      5: 3,
      6: [1, 5],
      8: v30
    }, {
      1: [3]
    }, {
      1: [2, 1]
    }, {
      4: 6,
      6: [1, 7],
      7: [1, 8],
      8: v30
    }, {
      6: v31,
      7: [1, 10],
      9: 9,
      12: 11,
      13: v32,
      14: 14,
      15: v33,
      16: v34,
      17: 17,
      18: 18,
      19: v35,
      22: v36
    }, v25(v37, [2, 3]), {
      1: [2, 2]
    }, v25(v37, [2, 4]), v25(v37, [2, 5]), {
      1: [2, 6],
      6: v31,
      12: 21,
      13: v32,
      14: 14,
      15: v33,
      16: v34,
      17: 17,
      18: 18,
      19: v35,
      22: v36
    }, {
      6: v31,
      9: 22,
      12: 11,
      13: v32,
      14: 14,
      15: v33,
      16: v34,
      17: 17,
      18: 18,
      19: v35,
      22: v36
    }, {
      6: v38,
      7: v39,
      10: 23,
      11: v40
    }, v25(v41, [2, 22], {
      17: 17,
      18: 18,
      14: 27,
      15: [1, 28],
      16: [1, 29],
      19: v35,
      22: v36
    }), v25(v41, [2, 18]), v25(v41, [2, 19]), v25(v41, [2, 20]), v25(v41, [2, 21]), v25(v41, [2, 23]), v25(v41, [2, 24]), v25(v41, [2, 26], {
      19: [1, 30]
    }), {
      20: [1, 31]
    }, {
      6: v38,
      7: v39,
      10: 32,
      11: v40
    }, {
      1: [2, 7],
      6: v31,
      12: 21,
      13: v32,
      14: 14,
      15: v33,
      16: v34,
      17: 17,
      18: 18,
      19: v35,
      22: v36
    }, v25(v42, [2, 14], {
      7: v43,
      11: v44
    }), v25(v45, [2, 8]), v25(v45, [2, 9]), v25(v45, [2, 10]), v25(v41, [2, 15]), v25(v41, [2, 16]), v25(v41, [2, 17]), {
      20: [1, 35]
    }, {
      21: [1, 36]
    }, v25(v42, [2, 13], {
      7: v43,
      11: v44
    }), v25(v45, [2, 11]), v25(v45, [2, 12]), {
      21: [1, 37]
    }, v25(v41, [2, 25]), v25(v41, [2, 27])],
    defaultActions: {
      2: [2, 1],
      6: [2, 2]
    },
    parseError: v3(function v57(v58, v59) {
      if (v59.recoverable) {
        this.trace(v58);
      } else {
        var v60 = new Error(v58);
        v60.hash = v59;
        throw v60;
      }
    }, "parseError"),
    parse: v3(function v61(v62) {
      var v63 = this;
      var v64 = [0];
      var v65 = [];
      var v66 = [null];
      var v67 = [];
      var v68 = this.table;
      var v69 = "";
      var v70 = 0;
      var v71 = 0;
      var v72 = 2;
      var v73 = 1;
      var v74 = v67.slice.call(arguments, 1);
      var v75 = Object.create(this.lexer);
      var v76 = {
        yy: {}
      };
      for (var v77 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v77)) {
          v76.yy[v77] = this.yy[v77];
        }
      }
      v75.setInput(v62, v76.yy);
      v76.yy.lexer = v75;
      v76.yy.parser = this;
      if (typeof v75.yylloc == "undefined") {
        v75.yylloc = {};
      }
      var v78 = v75.yylloc;
      v67.push(v78);
      var v79 = v75.options && v75.options.ranges;
      if (typeof v76.yy.parseError === "function") {
        this.parseError = v76.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v80(v81) {
        v64.length = v64.length - v81 * 2;
        v66.length = v66.length - v81;
        v67.length = v67.length - v81;
      }
      v3(v80, "popStack");
      function v82() {
        var v83;
        v83 = v65.pop() || v75.lex() || v73;
        if (typeof v83 !== "number") {
          if (v83 instanceof Array) {
            v65 = v83;
            v83 = v65.pop();
          }
          v83 = v63.symbols_[v83] || v83;
        }
        return v83;
      }
      v3(v82, "lex");
      var v84;
      var v85;
      var v86;
      var v87;
      var v88 = {};
      var v89;
      var v90;
      var v91;
      var v92;
      while (true) {
        v85 = v64[v64.length - 1];
        if (this.defaultActions[v85]) {
          v86 = this.defaultActions[v85];
        } else {
          if (v84 === null || typeof v84 == "undefined") {
            v84 = v82();
          }
          v86 = v68[v85] && v68[v85][v84];
        }
        if (typeof v86 === "undefined" || !v86.length || !v86[0]) {
          var v93 = "";
          v92 = [];
          for (v89 in v68[v85]) {
            if (this.terminals_[v89] && v89 > v72) {
              v92.push("'" + this.terminals_[v89] + "'");
            }
          }
          if (v75.showPosition) {
            v93 = "Parse error on line " + (v70 + 1) + ":\n" + v75.showPosition() + "\nExpecting " + v92.join(", ") + ", got '" + (this.terminals_[v84] || v84) + "'";
          } else {
            v93 = "Parse error on line " + (v70 + 1) + ": Unexpected " + (v84 == v73 ? "end of input" : "'" + (this.terminals_[v84] || v84) + "'");
          }
          this.parseError(v93, {
            text: v75.match,
            token: this.terminals_[v84] || v84,
            line: v75.yylineno,
            loc: v78,
            expected: v92
          });
        }
        if (v86[0] instanceof Array && v86.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v85 + ", token: " + v84);
        }
        switch (v86[0]) {
          case 1:
            v64.push(v84);
            v66.push(v75.yytext);
            v67.push(v75.yylloc);
            v64.push(v86[1]);
            v84 = null;
            {
              v71 = v75.yyleng;
              v69 = v75.yytext;
              v70 = v75.yylineno;
              v78 = v75.yylloc;
            }
            break;
          case 2:
            v90 = this.productions_[v86[1]][1];
            v88.$ = v66[v66.length - v90];
            v88._$ = {
              first_line: v67[v67.length - (v90 || 1)].first_line,
              last_line: v67[v67.length - 1].last_line,
              first_column: v67[v67.length - (v90 || 1)].first_column,
              last_column: v67[v67.length - 1].last_column
            };
            if (v79) {
              v88._$.range = [v67[v67.length - (v90 || 1)].range[0], v67[v67.length - 1].range[1]];
            }
            v87 = this.performAction.apply(v88, [v69, v71, v70, v76.yy, v86[1], v66, v67].concat(v74));
            if (typeof v87 !== "undefined") {
              return v87;
            }
            if (v90) {
              v64 = v64.slice(0, v90 * -1 * 2);
              v66 = v66.slice(0, v90 * -1);
              v67 = v67.slice(0, v90 * -1);
            }
            v64.push(this.productions_[v86[1]][0]);
            v66.push(v88.$);
            v67.push(v88._$);
            v91 = v68[v64[v64.length - 2]][v64[v64.length - 1]];
            v64.push(v91);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v94 = function () {
    var v95 = {
      EOF: 1,
      parseError: v3(function v96(v97, v98) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v97, v98);
        } else {
          throw new Error(v97);
        }
      }, "parseError"),
      setInput: v3(function (v99, v100) {
        this.yy = v100 || this.yy || {};
        this._input = v99;
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
        var v101 = this._input[0];
        this.yytext += v101;
        this.yyleng++;
        this.offset++;
        this.match += v101;
        this.matched += v101;
        var v102 = v101.match(/(?:\r\n?|\n).*/g);
        if (v102) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v101;
      }, "input"),
      unput: v3(function (v103) {
        var v104 = v103.length;
        var v105 = v103.split(/(?:\r\n?|\n)/g);
        this._input = v103 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v104);
        this.offset -= v104;
        var v106 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v105.length - 1) {
          this.yylineno -= v105.length - 1;
        }
        var v107 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v105 ? (v105.length === v106.length ? this.yylloc.first_column : 0) + v106[v106.length - v105.length].length - v105[0].length : this.yylloc.first_column - v104
        };
        if (this.options.ranges) {
          this.yylloc.range = [v107[0], v107[0] + this.yyleng - v104];
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
      less: v3(function (v108) {
        this.unput(this.match.slice(v108));
      }, "less"),
      pastInput: v3(function () {
        var v109 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v109.length > 20 ? "..." : "") + v109.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v3(function () {
        var v110 = this.match;
        if (v110.length < 20) {
          v110 += this._input.substr(0, 20 - v110.length);
        }
        return (v110.substr(0, 20) + (v110.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v3(function () {
        var v111 = this.pastInput();
        var v112 = new Array(v111.length + 1).join("-");
        return v111 + this.upcomingInput() + "\n" + v112 + "^";
      }, "showPosition"),
      test_match: v3(function (v113, v114) {
        var v115;
        var v116;
        var v117;
        if (this.options.backtrack_lexer) {
          v117 = {
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
            v117.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v116 = v113[0].match(/(?:\r\n?|\n).*/g);
        if (v116) {
          this.yylineno += v116.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v116 ? v116[v116.length - 1].length - v116[v116.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v113[0].length
        };
        this.yytext += v113[0];
        this.match += v113[0];
        this.matches = v113;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v113[0].length);
        this.matched += v113[0];
        v115 = this.performAction.call(this, this.yy, this, v114, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v115) {
          return v115;
        } else if (this._backtrack) {
          for (var v118 in v117) {
            this[v118] = v117[v118];
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
        var v119;
        var v120;
        var v121;
        var v122;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v123 = this._currentRules();
        for (var v124 = 0; v124 < v123.length; v124++) {
          v121 = this._input.match(this.rules[v123[v124]]);
          if (v121 && (!v120 || v121[0].length > v120[0].length)) {
            v120 = v121;
            v122 = v124;
            if (this.options.backtrack_lexer) {
              v119 = this.test_match(v121, v123[v124]);
              if (v119 !== false) {
                return v119;
              } else if (this._backtrack) {
                v120 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v120) {
          v119 = this.test_match(v120, v123[v122]);
          if (v119 !== false) {
            return v119;
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
      lex: v3(function v125() {
        var v126 = this.next();
        if (v126) {
          return v126;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v3(function v127(v128) {
        this.conditionStack.push(v128);
      }, "begin"),
      popState: v3(function v129() {
        var v130 = this.conditionStack.length - 1;
        if (v130 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v3(function v131() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v3(function v132(v133) {
        v133 = this.conditionStack.length - 1 - Math.abs(v133 || 0);
        if (v133 >= 0) {
          return this.conditionStack[v133];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v3(function v134(v135) {
        this.begin(v135);
      }, "pushState"),
      stateStackSize: v3(function v136() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v3(function v137(v138, v139, v140, v141) {
        switch (v140) {
          case 0:
            v138.getLogger().trace("Found comment", v139.yytext);
            return 6;
          case 1:
            return 8;
          case 2:
            this.begin("CLASS");
            break;
          case 3:
            this.popState();
            return 16;
          case 4:
            this.popState();
            break;
          case 5:
            v138.getLogger().trace("Begin icon");
            this.begin("ICON");
            break;
          case 6:
            v138.getLogger().trace("SPACELINE");
            return 6;
          case 7:
            return 7;
          case 8:
            return 15;
          case 9:
            v138.getLogger().trace("end icon");
            this.popState();
            break;
          case 10:
            v138.getLogger().trace("Exploding node");
            this.begin("NODE");
            return 19;
          case 11:
            v138.getLogger().trace("Cloud");
            this.begin("NODE");
            return 19;
          case 12:
            v138.getLogger().trace("Explosion Bang");
            this.begin("NODE");
            return 19;
          case 13:
            v138.getLogger().trace("Cloud Bang");
            this.begin("NODE");
            return 19;
          case 14:
            this.begin("NODE");
            return 19;
          case 15:
            this.begin("NODE");
            return 19;
          case 16:
            this.begin("NODE");
            return 19;
          case 17:
            this.begin("NODE");
            return 19;
          case 18:
            return 13;
          case 19:
            return 22;
          case 20:
            return 11;
          case 21:
            this.begin("NSTR2");
            break;
          case 22:
            return "NODE_DESCR";
          case 23:
            this.popState();
            break;
          case 24:
            v138.getLogger().trace("Starting NSTR");
            this.begin("NSTR");
            break;
          case 25:
            v138.getLogger().trace("description:", v139.yytext);
            return "NODE_DESCR";
          case 26:
            this.popState();
            break;
          case 27:
            this.popState();
            v138.getLogger().trace("node end ))");
            return "NODE_DEND";
          case 28:
            this.popState();
            v138.getLogger().trace("node end )");
            return "NODE_DEND";
          case 29:
            this.popState();
            v138.getLogger().trace("node end ...", v139.yytext);
            return "NODE_DEND";
          case 30:
            this.popState();
            v138.getLogger().trace("node end ((");
            return "NODE_DEND";
          case 31:
            this.popState();
            v138.getLogger().trace("node end (-");
            return "NODE_DEND";
          case 32:
            this.popState();
            v138.getLogger().trace("node end (-");
            return "NODE_DEND";
          case 33:
            this.popState();
            v138.getLogger().trace("node end ((");
            return "NODE_DEND";
          case 34:
            this.popState();
            v138.getLogger().trace("node end ((");
            return "NODE_DEND";
          case 35:
            v138.getLogger().trace("Long description:", v139.yytext);
            return 20;
          case 36:
            v138.getLogger().trace("Long description:", v139.yytext);
            return 20;
        }
      }, "anonymous"),
      rules: [/^(?:\s*%%.*)/i, /^(?:mindmap\b)/i, /^(?::::)/i, /^(?:.+)/i, /^(?:\n)/i, /^(?:::icon\()/i, /^(?:[\s]+[\n])/i, /^(?:[\n]+)/i, /^(?:[^\)]+)/i, /^(?:\))/i, /^(?:-\))/i, /^(?:\(-)/i, /^(?:\)\))/i, /^(?:\))/i, /^(?:\(\()/i, /^(?:\{\{)/i, /^(?:\()/i, /^(?:\[)/i, /^(?:[\s]+)/i, /^(?:[^\(\[\n\)\{\}]+)/i, /^(?:$)/i, /^(?:["][`])/i, /^(?:[^`"]+)/i, /^(?:[`]["])/i, /^(?:["])/i, /^(?:[^"]+)/i, /^(?:["])/i, /^(?:[\)]\))/i, /^(?:[\)])/i, /^(?:[\]])/i, /^(?:\}\})/i, /^(?:\(-)/i, /^(?:-\))/i, /^(?:\(\()/i, /^(?:\()/i, /^(?:[^\)\]\(\}]+)/i, /^(?:.+(?!\(\())/i],
      conditions: {
        CLASS: {
          rules: [3, 4],
          inclusive: false
        },
        ICON: {
          rules: [8, 9],
          inclusive: false
        },
        NSTR2: {
          rules: [22, 23],
          inclusive: false
        },
        NSTR: {
          rules: [25, 26],
          inclusive: false
        },
        NODE: {
          rules: [21, 24, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 2, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          inclusive: true
        }
      }
    };
    return v95;
  }();
  v46.lexer = v94;
  function v142() {
    this.yy = {};
  }
  v3(v142, "Parser");
  v142.prototype = v46;
  v46.Parser = v142;
  return new v142();
}();
parser.parser = parser;
var mindmap_default = parser;
var MAX_SECTIONS = 12;
var nodeType = {
  DEFAULT: 0,
  NO_BORDER: 0,
  ROUNDED_RECT: 1,
  RECT: 2,
  CIRCLE: 3,
  CLOUD: 4,
  BANG: 5,
  HEXAGON: 6
};
var MindmapDB = class {
  constructor() {
    this.nodes = [];
    this.count = 0;
    this.elements = {};
    this.getLogger = this.getLogger.bind(this);
    this.nodeType = nodeType;
    this.clear();
    this.getType = this.getType.bind(this);
    this.getElementById = this.getElementById.bind(this);
    this.getParent = this.getParent.bind(this);
    this.getMindmap = this.getMindmap.bind(this);
    this.addNode = this.addNode.bind(this);
    this.decorateNode = this.decorateNode.bind(this);
  }
  static {
    v3(this, "MindmapDB");
  }
  clear() {
    this.nodes = [];
    this.count = 0;
    this.elements = {};
    this.baseLevel = undefined;
  }
  getParent(v143) {
    for (let v144 = this.nodes.length - 1; v144 >= 0; v144--) {
      if (this.nodes[v144].level < v143) {
        return this.nodes[v144];
      }
    }
    return null;
  }
  getMindmap() {
    if (this.nodes.length > 0) {
      return this.nodes[0];
    } else {
      return null;
    }
  }
  addNode(v145, v146, v147, v148) {
    v5.info("addNode", v145, v146, v147, v148);
    let v149 = false;
    if (this.nodes.length === 0) {
      this.baseLevel = v145;
      v145 = 0;
      v149 = true;
    } else if (this.baseLevel !== undefined) {
      v145 = v145 - this.baseLevel;
      v149 = false;
    }
    const v150 = v10();
    let v151 = v150.mindmap?.padding ?? v9.mindmap.padding;
    switch (v148) {
      case this.nodeType.ROUNDED_RECT:
      case this.nodeType.RECT:
      case this.nodeType.HEXAGON:
        v151 *= 2;
        break;
    }
    const v152 = {
      id: this.count++,
      nodeId: v11(v146, v150),
      level: v145,
      descr: v11(v147, v150),
      type: v148,
      children: [],
      width: v150.mindmap?.maxNodeWidth ?? v9.mindmap.maxNodeWidth,
      padding: v151,
      isRoot: v149
    };
    const v153 = this.getParent(v145);
    if (v153) {
      v153.children.push(v152);
      this.nodes.push(v152);
    } else if (v149) {
      this.nodes.push(v152);
    } else {
      throw new Error("There can be only one root. No parent could be found for (\"" + v152.descr + "\")");
    }
  }
  getType(v154, v155) {
    v5.debug("In get type", v154, v155);
    switch (v154) {
      case "[":
        return this.nodeType.RECT;
      case "(":
        if (v155 === ")") {
          return this.nodeType.ROUNDED_RECT;
        } else {
          return this.nodeType.CLOUD;
        }
      case "((":
        return this.nodeType.CIRCLE;
      case ")":
        return this.nodeType.CLOUD;
      case "))":
        return this.nodeType.BANG;
      case "{{":
        return this.nodeType.HEXAGON;
      default:
        return this.nodeType.DEFAULT;
    }
  }
  setElementForId(v156, v157) {
    this.elements[v156] = v157;
  }
  getElementById(v158) {
    return this.elements[v158];
  }
  decorateNode(v159) {
    if (!v159) {
      return;
    }
    const v160 = v10();
    const v161 = this.nodes[this.nodes.length - 1];
    if (v159.icon) {
      v161.icon = v11(v159.icon, v160);
    }
    if (v159.class) {
      v161.class = v11(v159.class, v160);
    }
  }
  type2Str(v162) {
    switch (v162) {
      case this.nodeType.DEFAULT:
        return "no-border";
      case this.nodeType.RECT:
        return "rect";
      case this.nodeType.ROUNDED_RECT:
        return "rounded-rect";
      case this.nodeType.CIRCLE:
        return "circle";
      case this.nodeType.CLOUD:
        return "cloud";
      case this.nodeType.BANG:
        return "bang";
      case this.nodeType.HEXAGON:
        return "hexgon";
      default:
        return "no-border";
    }
  }
  assignSections(v163, v164) {
    if (v163.level === 0) {
      v163.section = undefined;
    } else {
      v163.section = v164;
    }
    if (v163.children) {
      for (const [v165, v166] of v163.children.entries()) {
        const v167 = v163.level === 0 ? v165 % (MAX_SECTIONS - 1) : v164;
        this.assignSections(v166, v167);
      }
    }
  }
  flattenNodes(v168, v169) {
    const v170 = v10();
    const v171 = ["mindmap-node"];
    if (v168.isRoot === true) {
      v171.push("section-root", "section--1");
    } else if (v168.section !== undefined) {
      v171.push("section-" + v168.section);
    }
    if (v168.class) {
      v171.push(v168.class);
    }
    const v172 = v171.join(" ");
    const v173 = v3(v174 => {
      const v175 = v170.theme?.toLowerCase() ?? "";
      const v176 = v175.includes("redux");
      switch (v174) {
        case nodeType.CIRCLE:
          return "mindmapCircle";
        case nodeType.RECT:
          return "rect";
        case nodeType.ROUNDED_RECT:
          return "rounded";
        case nodeType.CLOUD:
          return "cloud";
        case nodeType.BANG:
          return "bang";
        case nodeType.HEXAGON:
          return "hexagon";
        case nodeType.DEFAULT:
          if (v176) {
            return "rounded";
          } else {
            return "defaultMindmapNode";
          }
        case nodeType.NO_BORDER:
        default:
          return "rect";
      }
    }, "getShapeFromType");
    const v177 = {
      id: v168.id.toString(),
      domId: "node_" + v168.id.toString(),
      label: v168.descr,
      labelType: "markdown",
      isGroup: false,
      shape: v173(v168.type),
      width: v168.width,
      height: v168.height ?? 0,
      padding: v168.padding,
      cssClasses: v172,
      cssStyles: [],
      look: v170.look,
      icon: v168.icon,
      x: v168.x,
      y: v168.y,
      level: v168.level,
      nodeId: v168.nodeId,
      type: v168.type,
      section: v168.section
    };
    v169.push(v177);
    if (v168.children) {
      for (const v178 of v168.children) {
        this.flattenNodes(v178, v169);
      }
    }
  }
  generateEdges(v179, v180) {
    if (!v179.children) {
      return;
    }
    const v181 = v10();
    for (const v182 of v179.children) {
      let v183 = "edge";
      if (v182.section !== undefined) {
        v183 += " section-edge-" + v182.section;
      }
      const v184 = v179.level + 1;
      v183 += " edge-depth-" + v184;
      const v185 = {
        id: "edge_" + v179.id + "_" + v182.id,
        start: v179.id.toString(),
        end: v182.id.toString(),
        type: "normal",
        curve: "basis",
        thickness: "normal",
        look: v181.look,
        classes: v183,
        depth: v179.level,
        section: v182.section
      };
      v180.push(v185);
      this.generateEdges(v182, v180);
    }
  }
  getData() {
    const v186 = this.getMindmap();
    const v187 = v10();
    const v188 = v12();
    const v189 = v188.layout !== undefined;
    const v190 = v187;
    if (!v189) {
      v190.layout = "cose-bilkent";
    }
    if (!v186) {
      return {
        nodes: [],
        edges: [],
        config: v190
      };
    }
    v5.debug("getData: mindmapRoot", v186, v187);
    this.assignSections(v186);
    const v191 = [];
    const v192 = [];
    this.flattenNodes(v186, v191);
    this.generateEdges(v186, v192);
    v5.debug("getData: processed " + v191.length + " nodes and " + v192.length + " edges");
    const v193 = new Map();
    for (const v194 of v191) {
      v193.set(v194.id, {
        shape: v194.shape,
        width: v194.width,
        height: v194.height,
        padding: v194.padding
      });
    }
    return {
      nodes: v191,
      edges: v192,
      config: v190,
      rootNode: v186,
      markers: ["point"],
      direction: "TB",
      nodeSpacing: 50,
      rankSpacing: 50,
      shapes: Object.fromEntries(v193),
      type: "mindmap",
      diagramId: "mindmap-" + v4()
    };
  }
  getLogger() {
    return v5;
  }
};
var draw = v3(async (v195, v196, v197, v198) => {
  v5.debug("Rendering mindmap diagram\n" + v195);
  const v199 = v198.db;
  const v200 = v199.getData();
  const v201 = v1(v196, v200.config.securityLevel);
  v200.type = v198.type;
  v200.layoutAlgorithm = v6(v200.config.layout, {
    fallback: "cose-bilkent"
  });
  v200.diagramId = v196;
  const v202 = v199.getMindmap();
  if (!v202) {
    return;
  }
  v200.nodes.forEach(v203 => {
    if (v203.shape === "rounded") {
      v203.radius = 15;
      v203.taper = 15;
      v203.stroke = "none";
      v203.width = 0;
      v203.padding = 15;
    } else if (v203.shape === "circle") {
      v203.padding = 10;
    } else if (v203.shape === "rect") {
      v203.width = 0;
      v203.padding = 10;
    } else if (v203.shape === "hexagon") {
      v203.width = 0;
      v203.height = 0;
    }
  });
  await v7(v200, v201);
  const {
    themeVariables: v204
  } = v8();
  const {
    useGradient: v205,
    gradientStart: v206,
    gradientStop: v207
  } = v204;
  if (v205 && v206 && v207) {
    const v208 = v201.attr("id");
    const v209 = v201.append("defs").append("linearGradient").attr("id", v208 + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    v209.append("stop").attr("offset", "0%").attr("stop-color", v206).attr("stop-opacity", 1);
    v209.append("stop").attr("offset", "100%").attr("stop-color", v207).attr("stop-opacity", 1);
  }
  v2(v201, v200.config.mindmap?.padding ?? v9.mindmap.padding, "mindmapDiagram", v200.config.mindmap?.useMaxWidth ?? v9.mindmap.useMaxWidth);
}, "draw");
var mindmapRenderer_default = {
  draw: draw
};
var genSections = v3(v210 => {
  const {
    theme: v211,
    look: v212
  } = v210;
  let v213 = "";
  for (let v214 = 0; v214 < v210.THEME_COLOR_LIMIT; v214++) {
    v210["lineColor" + v214] = v210["lineColor" + v214] || v210["cScaleInv" + v214];
    if (v13(v210["lineColor" + v214])) {
      v210["lineColor" + v214] = v14(v210["lineColor" + v214], 20);
    } else {
      v210["lineColor" + v214] = v15(v210["lineColor" + v214], 20);
    }
  }
  for (let v215 = 0; v215 < v210.THEME_COLOR_LIMIT; v215++) {
    const v216 = "" + (v212 === "neo" ? Math.max(10 - (v215 - 1) * 2, 2) : 17 - v215 * 3);
    v213 += "\n    .section-" + (v215 - 1) + " rect, .section-" + (v215 - 1) + " path, .section-" + (v215 - 1) + " circle, .section-" + (v215 - 1) + " polygon, .section-" + (v215 - 1) + " path  {\n      fill: " + v210["cScale" + v215] + ";\n    }\n    .section-" + (v215 - 1) + " text {\n     fill: " + v210["cScaleLabel" + v215] + ";\n    }\n     .section-" + (v215 - 1) + " span {\n     color: " + v210["cScaleLabel" + v215] + ";\n    }\n    .node-icon-" + (v215 - 1) + " {\n      font-size: 40px;\n      color: " + v210["cScaleLabel" + v215] + ";\n    }\n    .section-edge-" + (v215 - 1) + "{\n      stroke: " + v210["cScale" + v215] + ";\n    }\n    .edge-depth-" + (v215 - 1) + "{\n      stroke-width: " + v216 + ";\n    }\n    .section-" + (v215 - 1) + " line {\n      stroke: " + v210["cScaleInv" + v215] + " ;\n      stroke-width: 3;\n    }\n\n    .disabled, .disabled circle, .disabled text {\n      fill: lightgray;\n    }\n    .disabled text {\n      fill: #efefef;\n    }\n    [data-look=\"neo\"].mindmap-node.section-" + (v215 - 1) + " rect, [data-look=\"neo\"].mindmap-node.section-" + (v215 - 1) + " path, [data-look=\"neo\"].mindmap-node.section-" + (v215 - 1) + " circle, [data-look=\"neo\"].mindmap-node.section-" + (v215 - 1) + " polygon {\n      fill: " + (v211 === "redux" || v211 === "redux-dark" || v211 === "neutral" ? v210.mainBkg : v210["cScale" + v215]) + ";\n      stroke: " + (v211 === "redux" || v211 === "redux-dark" ? v210.nodeBorder : v210["cScale" + v215]) + ";\n      stroke-width: " + (v210.strokeWidth ?? 2) + "px;\n    }\n    [data-look=\"neo\"].section-edge-" + (v215 - 1) + "{\n      stroke: " + (v211?.includes("redux") || v211 === "neo-dark" ? v210.nodeBorder : v210["cScale" + v215]) + ";\n    }\n    [data-look=\"neo\"].mindmap-node.section-" + (v215 - 1) + " text {\n     fill: " + (v211 === "redux" || v211 === "redux-dark" ? v210.nodeBorder : v210["cScaleLabel" + (v211 === "neutral" ? 1 : v215)]) + ";\n    }\n    ";
  }
  return v213;
}, "genSections");
var genGradient = v3((v217, v218, v219) => {
  let v220 = "";
  for (let v221 = 0; v221 < v217; v221++) {
    v220 += "\n    [data-look=\"neo\"].mindmap-node.section-" + (v221 - 1) + " rect, [data-look=\"neo\"].mindmap-node.section-" + (v221 - 1) + " path, [data-look=\"neo\"].mindmap-node.section-" + (v221 - 1) + " circle, [data-look=\"neo\"].mindmap-node.section-" + (v221 - 1) + " polygon {\n      stroke: url(" + v218 + "-gradient);\n      fill: " + v219 + ";\n    }\n    .section-" + (v221 - 1) + " line {\n      stroke-width: 0;\n    }";
  }
  return v220;
}, "genGradient");
var getStyles = v3(v222 => {
  const {
    theme: v223
  } = v222;
  const v224 = v222.svgId;
  const v225 = v222.dropShadow ? v222.dropShadow.replace("url(#drop-shadow)", "url(" + v224 + "-drop-shadow)") : "none";
  return "\n  .edge {\n    stroke-width: 3;\n  }\n  " + genSections(v222) + "\n  .section-root rect, .section-root path, .section-root circle, .section-root polygon  {\n    fill: " + v222.git0 + ";\n  }\n  .section-root text {\n    fill: " + v222.gitBranchLabel0 + ";\n  }\n  .section-root span {\n    color: " + (v223?.includes("redux") ? v222.nodeBorder : v222.gitBranchLabel0) + ";\n  }\n  .icon-container {\n    height:100%;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n  .edge {\n    fill: none;\n  }\n  .mindmap-node-label {\n    dy: 1em;\n    alignment-baseline: middle;\n    text-anchor: middle;\n    dominant-baseline: middle;\n    text-align: center;\n  }\n  [data-look=\"neo\"].mindmap-node  {\n    filter: " + v225 + ";\n  }\n  [data-look=\"neo\"].mindmap-node.section-root rect, [data-look=\"neo\"].mindmap-node.section-root path, [data-look=\"neo\"].mindmap-node.section-root circle, [data-look=\"neo\"].mindmap-node.section-root polygon  {\n    fill: " + (v223?.includes("redux") ? v222.mainBkg : v222.git0) + ";\n  }\n  [data-look=\"neo\"].mindmap-node.section-root .text-inner-tspan {\n    fill:  " + (v223?.includes("redux") ? v222.nodeBorder : v222["cScaleLabel" + (v223 === "neutral" ? 1 : 0)]) + ";\n  }\n  " + (v222.useGradient && v224 && v222.mainBkg ? genGradient(v222.THEME_COLOR_LIMIT, v224, v222.mainBkg) : "") + "\n";
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  get db() {
    return new MindmapDB();
  },
  renderer: mindmapRenderer_default,
  parser: mindmap_default,
  styles: styles_default
};
export { diagram };