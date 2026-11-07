import { _ as v1, l as v2, c as v3, D as v4, ad as v5, ae as v6, af as v7, W as v8, B as v9, i as v10, G as v11, J as v12, T as v13, U as v14, V as v15 } from "./index-CXb3UsfP.js";
import { g as v16 } from "./chunk-5VM5RSS4-Cbnyy23B.js";
var parser = function () {
  var v17 = v1(function (v18, v19, v20, v21) {
    v20 = v20 || {};
    v21 = v18.length;
    for (; v21--; v20[v18[v21]] = v19);
    return v20;
  }, "o");
  var v22 = [1, 4];
  var v23 = [1, 13];
  var v24 = [1, 12];
  var v25 = [1, 15];
  var v26 = [1, 16];
  var v27 = [1, 20];
  var v28 = [1, 19];
  var v29 = [6, 7, 8];
  var v30 = [1, 26];
  var v31 = [1, 24];
  var v32 = [1, 25];
  var v33 = [6, 7, 11];
  var v34 = [1, 31];
  var v35 = [6, 7, 11, 24];
  var v36 = [1, 6, 13, 16, 17, 20, 23];
  var v37 = [1, 35];
  var v38 = [1, 36];
  var v39 = [1, 6, 7, 11, 13, 16, 17, 20, 23];
  var v40 = [1, 38];
  var v41 = {
    trace: v1(function v42() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      mindMap: 4,
      spaceLines: 5,
      SPACELINE: 6,
      NL: 7,
      KANBAN: 8,
      document: 9,
      stop: 10,
      EOF: 11,
      statement: 12,
      SPACELIST: 13,
      node: 14,
      shapeData: 15,
      ICON: 16,
      CLASS: 17,
      nodeWithId: 18,
      nodeWithoutId: 19,
      NODE_DSTART: 20,
      NODE_DESCR: 21,
      NODE_DEND: 22,
      NODE_ID: 23,
      SHAPE_DATA: 24,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      6: "SPACELINE",
      7: "NL",
      8: "KANBAN",
      11: "EOF",
      13: "SPACELIST",
      16: "ICON",
      17: "CLASS",
      20: "NODE_DSTART",
      21: "NODE_DESCR",
      22: "NODE_DEND",
      23: "NODE_ID",
      24: "SHAPE_DATA"
    },
    productions_: [0, [3, 1], [3, 2], [5, 1], [5, 2], [5, 2], [4, 2], [4, 3], [10, 1], [10, 1], [10, 1], [10, 2], [10, 2], [9, 3], [9, 2], [12, 3], [12, 2], [12, 2], [12, 2], [12, 1], [12, 2], [12, 1], [12, 1], [12, 1], [12, 1], [14, 1], [14, 1], [19, 3], [18, 1], [18, 4], [15, 2], [15, 1]],
    performAction: v1(function v43(v44, v45, v46, v47, v48, v49, v50) {
      var v51 = v49.length - 1;
      switch (v48) {
        case 6:
        case 7:
          return v47;
        case 8:
          v47.getLogger().trace("Stop NL ");
          break;
        case 9:
          v47.getLogger().trace("Stop EOF ");
          break;
        case 11:
          v47.getLogger().trace("Stop NL2 ");
          break;
        case 12:
          v47.getLogger().trace("Stop EOF2 ");
          break;
        case 15:
          v47.getLogger().info("Node: ", v49[v51 - 1].id);
          v47.addNode(v49[v51 - 2].length, v49[v51 - 1].id, v49[v51 - 1].descr, v49[v51 - 1].type, v49[v51]);
          break;
        case 16:
          v47.getLogger().info("Node: ", v49[v51].id);
          v47.addNode(v49[v51 - 1].length, v49[v51].id, v49[v51].descr, v49[v51].type);
          break;
        case 17:
          v47.getLogger().trace("Icon: ", v49[v51]);
          v47.decorateNode({
            icon: v49[v51]
          });
          break;
        case 18:
        case 23:
          v47.decorateNode({
            class: v49[v51]
          });
          break;
        case 19:
          v47.getLogger().trace("SPACELIST");
          break;
        case 20:
          v47.getLogger().trace("Node: ", v49[v51 - 1].id);
          v47.addNode(0, v49[v51 - 1].id, v49[v51 - 1].descr, v49[v51 - 1].type, v49[v51]);
          break;
        case 21:
          v47.getLogger().trace("Node: ", v49[v51].id);
          v47.addNode(0, v49[v51].id, v49[v51].descr, v49[v51].type);
          break;
        case 22:
          v47.decorateNode({
            icon: v49[v51]
          });
          break;
        case 27:
          v47.getLogger().trace("node found ..", v49[v51 - 2]);
          this.$ = {
            id: v49[v51 - 1],
            descr: v49[v51 - 1],
            type: v47.getType(v49[v51 - 2], v49[v51])
          };
          break;
        case 28:
          this.$ = {
            id: v49[v51],
            descr: v49[v51],
            type: 0
          };
          break;
        case 29:
          v47.getLogger().trace("node found ..", v49[v51 - 3]);
          this.$ = {
            id: v49[v51 - 3],
            descr: v49[v51 - 1],
            type: v47.getType(v49[v51 - 2], v49[v51])
          };
          break;
        case 30:
          this.$ = v49[v51 - 1] + v49[v51];
          break;
        case 31:
          this.$ = v49[v51];
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: 2,
      5: 3,
      6: [1, 5],
      8: v22
    }, {
      1: [3]
    }, {
      1: [2, 1]
    }, {
      4: 6,
      6: [1, 7],
      7: [1, 8],
      8: v22
    }, {
      6: v23,
      7: [1, 10],
      9: 9,
      12: 11,
      13: v24,
      14: 14,
      16: v25,
      17: v26,
      18: 17,
      19: 18,
      20: v27,
      23: v28
    }, v17(v29, [2, 3]), {
      1: [2, 2]
    }, v17(v29, [2, 4]), v17(v29, [2, 5]), {
      1: [2, 6],
      6: v23,
      12: 21,
      13: v24,
      14: 14,
      16: v25,
      17: v26,
      18: 17,
      19: 18,
      20: v27,
      23: v28
    }, {
      6: v23,
      9: 22,
      12: 11,
      13: v24,
      14: 14,
      16: v25,
      17: v26,
      18: 17,
      19: 18,
      20: v27,
      23: v28
    }, {
      6: v30,
      7: v31,
      10: 23,
      11: v32
    }, v17(v33, [2, 24], {
      18: 17,
      19: 18,
      14: 27,
      16: [1, 28],
      17: [1, 29],
      20: v27,
      23: v28
    }), v17(v33, [2, 19]), v17(v33, [2, 21], {
      15: 30,
      24: v34
    }), v17(v33, [2, 22]), v17(v33, [2, 23]), v17(v35, [2, 25]), v17(v35, [2, 26]), v17(v35, [2, 28], {
      20: [1, 32]
    }), {
      21: [1, 33]
    }, {
      6: v30,
      7: v31,
      10: 34,
      11: v32
    }, {
      1: [2, 7],
      6: v23,
      12: 21,
      13: v24,
      14: 14,
      16: v25,
      17: v26,
      18: 17,
      19: 18,
      20: v27,
      23: v28
    }, v17(v36, [2, 14], {
      7: v37,
      11: v38
    }), v17(v39, [2, 8]), v17(v39, [2, 9]), v17(v39, [2, 10]), v17(v33, [2, 16], {
      15: 37,
      24: v34
    }), v17(v33, [2, 17]), v17(v33, [2, 18]), v17(v33, [2, 20], {
      24: v40
    }), v17(v35, [2, 31]), {
      21: [1, 39]
    }, {
      22: [1, 40]
    }, v17(v36, [2, 13], {
      7: v37,
      11: v38
    }), v17(v39, [2, 11]), v17(v39, [2, 12]), v17(v33, [2, 15], {
      24: v40
    }), v17(v35, [2, 30]), {
      22: [1, 41]
    }, v17(v35, [2, 27]), v17(v35, [2, 29])],
    defaultActions: {
      2: [2, 1],
      6: [2, 2]
    },
    parseError: v1(function v52(v53, v54) {
      if (v54.recoverable) {
        this.trace(v53);
      } else {
        var v55 = new Error(v53);
        v55.hash = v54;
        throw v55;
      }
    }, "parseError"),
    parse: v1(function v56(v57) {
      var v58 = this;
      var v59 = [0];
      var v60 = [];
      var v61 = [null];
      var v62 = [];
      var v63 = this.table;
      var v64 = "";
      var v65 = 0;
      var v66 = 0;
      var v67 = 2;
      var v68 = 1;
      var v69 = v62.slice.call(arguments, 1);
      var v70 = Object.create(this.lexer);
      var v71 = {
        yy: {}
      };
      for (var v72 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v72)) {
          v71.yy[v72] = this.yy[v72];
        }
      }
      v70.setInput(v57, v71.yy);
      v71.yy.lexer = v70;
      v71.yy.parser = this;
      if (typeof v70.yylloc == "undefined") {
        v70.yylloc = {};
      }
      var v73 = v70.yylloc;
      v62.push(v73);
      var v74 = v70.options && v70.options.ranges;
      if (typeof v71.yy.parseError === "function") {
        this.parseError = v71.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v75(v76) {
        v59.length = v59.length - v76 * 2;
        v61.length = v61.length - v76;
        v62.length = v62.length - v76;
      }
      v1(v75, "popStack");
      function v77() {
        var v78;
        v78 = v60.pop() || v70.lex() || v68;
        if (typeof v78 !== "number") {
          if (v78 instanceof Array) {
            v60 = v78;
            v78 = v60.pop();
          }
          v78 = v58.symbols_[v78] || v78;
        }
        return v78;
      }
      v1(v77, "lex");
      var v79;
      var v80;
      var v81;
      var v82;
      var v83 = {};
      var v84;
      var v85;
      var v86;
      var v87;
      while (true) {
        v80 = v59[v59.length - 1];
        if (this.defaultActions[v80]) {
          v81 = this.defaultActions[v80];
        } else {
          if (v79 === null || typeof v79 == "undefined") {
            v79 = v77();
          }
          v81 = v63[v80] && v63[v80][v79];
        }
        if (typeof v81 === "undefined" || !v81.length || !v81[0]) {
          var v88 = "";
          v87 = [];
          for (v84 in v63[v80]) {
            if (this.terminals_[v84] && v84 > v67) {
              v87.push("'" + this.terminals_[v84] + "'");
            }
          }
          if (v70.showPosition) {
            v88 = "Parse error on line " + (v65 + 1) + ":\n" + v70.showPosition() + "\nExpecting " + v87.join(", ") + ", got '" + (this.terminals_[v79] || v79) + "'";
          } else {
            v88 = "Parse error on line " + (v65 + 1) + ": Unexpected " + (v79 == v68 ? "end of input" : "'" + (this.terminals_[v79] || v79) + "'");
          }
          this.parseError(v88, {
            text: v70.match,
            token: this.terminals_[v79] || v79,
            line: v70.yylineno,
            loc: v73,
            expected: v87
          });
        }
        if (v81[0] instanceof Array && v81.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v80 + ", token: " + v79);
        }
        switch (v81[0]) {
          case 1:
            v59.push(v79);
            v61.push(v70.yytext);
            v62.push(v70.yylloc);
            v59.push(v81[1]);
            v79 = null;
            {
              v66 = v70.yyleng;
              v64 = v70.yytext;
              v65 = v70.yylineno;
              v73 = v70.yylloc;
            }
            break;
          case 2:
            v85 = this.productions_[v81[1]][1];
            v83.$ = v61[v61.length - v85];
            v83._$ = {
              first_line: v62[v62.length - (v85 || 1)].first_line,
              last_line: v62[v62.length - 1].last_line,
              first_column: v62[v62.length - (v85 || 1)].first_column,
              last_column: v62[v62.length - 1].last_column
            };
            if (v74) {
              v83._$.range = [v62[v62.length - (v85 || 1)].range[0], v62[v62.length - 1].range[1]];
            }
            v82 = this.performAction.apply(v83, [v64, v66, v65, v71.yy, v81[1], v61, v62].concat(v69));
            if (typeof v82 !== "undefined") {
              return v82;
            }
            if (v85) {
              v59 = v59.slice(0, v85 * -1 * 2);
              v61 = v61.slice(0, v85 * -1);
              v62 = v62.slice(0, v85 * -1);
            }
            v59.push(this.productions_[v81[1]][0]);
            v61.push(v83.$);
            v62.push(v83._$);
            v86 = v63[v59[v59.length - 2]][v59[v59.length - 1]];
            v59.push(v86);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v89 = function () {
    var v90 = {
      EOF: 1,
      parseError: v1(function v91(v92, v93) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v92, v93);
        } else {
          throw new Error(v92);
        }
      }, "parseError"),
      setInput: v1(function (v94, v95) {
        this.yy = v95 || this.yy || {};
        this._input = v94;
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
      input: v1(function () {
        var v96 = this._input[0];
        this.yytext += v96;
        this.yyleng++;
        this.offset++;
        this.match += v96;
        this.matched += v96;
        var v97 = v96.match(/(?:\r\n?|\n).*/g);
        if (v97) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v96;
      }, "input"),
      unput: v1(function (v98) {
        var v99 = v98.length;
        var v100 = v98.split(/(?:\r\n?|\n)/g);
        this._input = v98 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v99);
        this.offset -= v99;
        var v101 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v100.length - 1) {
          this.yylineno -= v100.length - 1;
        }
        var v102 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v100 ? (v100.length === v101.length ? this.yylloc.first_column : 0) + v101[v101.length - v100.length].length - v100[0].length : this.yylloc.first_column - v99
        };
        if (this.options.ranges) {
          this.yylloc.range = [v102[0], v102[0] + this.yyleng - v99];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v1(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v1(function () {
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
      less: v1(function (v103) {
        this.unput(this.match.slice(v103));
      }, "less"),
      pastInput: v1(function () {
        var v104 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v104.length > 20 ? "..." : "") + v104.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v1(function () {
        var v105 = this.match;
        if (v105.length < 20) {
          v105 += this._input.substr(0, 20 - v105.length);
        }
        return (v105.substr(0, 20) + (v105.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v1(function () {
        var v106 = this.pastInput();
        var v107 = new Array(v106.length + 1).join("-");
        return v106 + this.upcomingInput() + "\n" + v107 + "^";
      }, "showPosition"),
      test_match: v1(function (v108, v109) {
        var v110;
        var v111;
        var v112;
        if (this.options.backtrack_lexer) {
          v112 = {
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
            v112.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v111 = v108[0].match(/(?:\r\n?|\n).*/g);
        if (v111) {
          this.yylineno += v111.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v111 ? v111[v111.length - 1].length - v111[v111.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v108[0].length
        };
        this.yytext += v108[0];
        this.match += v108[0];
        this.matches = v108;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v108[0].length);
        this.matched += v108[0];
        v110 = this.performAction.call(this, this.yy, this, v109, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v110) {
          return v110;
        } else if (this._backtrack) {
          for (var v113 in v112) {
            this[v113] = v112[v113];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v1(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v114;
        var v115;
        var v116;
        var v117;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v118 = this._currentRules();
        for (var v119 = 0; v119 < v118.length; v119++) {
          v116 = this._input.match(this.rules[v118[v119]]);
          if (v116 && (!v115 || v116[0].length > v115[0].length)) {
            v115 = v116;
            v117 = v119;
            if (this.options.backtrack_lexer) {
              v114 = this.test_match(v116, v118[v119]);
              if (v114 !== false) {
                return v114;
              } else if (this._backtrack) {
                v115 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v115) {
          v114 = this.test_match(v115, v118[v117]);
          if (v114 !== false) {
            return v114;
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
      lex: v1(function v120() {
        var v121 = this.next();
        if (v121) {
          return v121;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v1(function v122(v123) {
        this.conditionStack.push(v123);
      }, "begin"),
      popState: v1(function v124() {
        var v125 = this.conditionStack.length - 1;
        if (v125 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v1(function v126() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v1(function v127(v128) {
        v128 = this.conditionStack.length - 1 - Math.abs(v128 || 0);
        if (v128 >= 0) {
          return this.conditionStack[v128];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v1(function v129(v130) {
        this.begin(v130);
      }, "pushState"),
      stateStackSize: v1(function v131() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v1(function v132(v133, v134, v135, v136) {
        switch (v135) {
          case 0:
            this.pushState("shapeData");
            v134.yytext = "";
            return 24;
          case 1:
            this.pushState("shapeDataStr");
            return 24;
          case 2:
            this.popState();
            return 24;
          case 3:
            const v137 = /\n\s*/g;
            v134.yytext = v134.yytext.replace(v137, "<br/>");
            return 24;
          case 4:
            return 24;
          case 5:
            this.popState();
            break;
          case 6:
            v133.getLogger().trace("Found comment", v134.yytext);
            return 6;
          case 7:
            return 8;
          case 8:
            this.begin("CLASS");
            break;
          case 9:
            this.popState();
            return 17;
          case 10:
            this.popState();
            break;
          case 11:
            v133.getLogger().trace("Begin icon");
            this.begin("ICON");
            break;
          case 12:
            v133.getLogger().trace("SPACELINE");
            return 6;
          case 13:
            return 7;
          case 14:
            return 16;
          case 15:
            v133.getLogger().trace("end icon");
            this.popState();
            break;
          case 16:
            v133.getLogger().trace("Exploding node");
            this.begin("NODE");
            return 20;
          case 17:
            v133.getLogger().trace("Cloud");
            this.begin("NODE");
            return 20;
          case 18:
            v133.getLogger().trace("Explosion Bang");
            this.begin("NODE");
            return 20;
          case 19:
            v133.getLogger().trace("Cloud Bang");
            this.begin("NODE");
            return 20;
          case 20:
            this.begin("NODE");
            return 20;
          case 21:
            this.begin("NODE");
            return 20;
          case 22:
            this.begin("NODE");
            return 20;
          case 23:
            this.begin("NODE");
            return 20;
          case 24:
            return 13;
          case 25:
            return 23;
          case 26:
            return 11;
          case 27:
            this.begin("NSTR2");
            break;
          case 28:
            return "NODE_DESCR";
          case 29:
            this.popState();
            break;
          case 30:
            v133.getLogger().trace("Starting NSTR");
            this.begin("NSTR");
            break;
          case 31:
            v133.getLogger().trace("description:", v134.yytext);
            return "NODE_DESCR";
          case 32:
            this.popState();
            break;
          case 33:
            this.popState();
            v133.getLogger().trace("node end ))");
            return "NODE_DEND";
          case 34:
            this.popState();
            v133.getLogger().trace("node end )");
            return "NODE_DEND";
          case 35:
            this.popState();
            v133.getLogger().trace("node end ...", v134.yytext);
            return "NODE_DEND";
          case 36:
            this.popState();
            v133.getLogger().trace("node end ((");
            return "NODE_DEND";
          case 37:
            this.popState();
            v133.getLogger().trace("node end (-");
            return "NODE_DEND";
          case 38:
            this.popState();
            v133.getLogger().trace("node end (-");
            return "NODE_DEND";
          case 39:
            this.popState();
            v133.getLogger().trace("node end ((");
            return "NODE_DEND";
          case 40:
            this.popState();
            v133.getLogger().trace("node end ((");
            return "NODE_DEND";
          case 41:
            v133.getLogger().trace("Long description:", v134.yytext);
            return 21;
          case 42:
            v133.getLogger().trace("Long description:", v134.yytext);
            return 21;
        }
      }, "anonymous"),
      rules: [/^(?:@\{)/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^\"]+)/i, /^(?:[^}^"]+)/i, /^(?:\})/i, /^(?:\s*%%.*)/i, /^(?:kanban\b)/i, /^(?::::)/i, /^(?:.+)/i, /^(?:\n)/i, /^(?:::icon\()/i, /^(?:[\s]+[\n])/i, /^(?:[\n]+)/i, /^(?:[^\)]+)/i, /^(?:\))/i, /^(?:-\))/i, /^(?:\(-)/i, /^(?:\)\))/i, /^(?:\))/i, /^(?:\(\()/i, /^(?:\{\{)/i, /^(?:\()/i, /^(?:\[)/i, /^(?:[\s]+)/i, /^(?:[^\(\[\n\)\{\}@]+)/i, /^(?:$)/i, /^(?:["][`])/i, /^(?:[^`"]+)/i, /^(?:[`]["])/i, /^(?:["])/i, /^(?:[^"]+)/i, /^(?:["])/i, /^(?:[\)]\))/i, /^(?:[\)])/i, /^(?:[\]])/i, /^(?:\}\})/i, /^(?:\(-)/i, /^(?:-\))/i, /^(?:\(\()/i, /^(?:\()/i, /^(?:[^\)\]\(\}]+)/i, /^(?:.+(?!\(\())/i],
      conditions: {
        shapeDataEndBracket: {
          rules: [],
          inclusive: false
        },
        shapeDataStr: {
          rules: [2, 3],
          inclusive: false
        },
        shapeData: {
          rules: [1, 4, 5],
          inclusive: false
        },
        CLASS: {
          rules: [9, 10],
          inclusive: false
        },
        ICON: {
          rules: [14, 15],
          inclusive: false
        },
        NSTR2: {
          rules: [28, 29],
          inclusive: false
        },
        NSTR: {
          rules: [31, 32],
          inclusive: false
        },
        NODE: {
          rules: [27, 30, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 6, 7, 8, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
          inclusive: true
        }
      }
    };
    return v90;
  }();
  v41.lexer = v89;
  function v138() {
    this.yy = {};
  }
  v1(v138, "Parser");
  v138.prototype = v41;
  v41.Parser = v138;
  return new v138();
}();
parser.parser = parser;
var kanban_default = parser;
var nodes = [];
var sections = [];
var cnt = 0;
var elements = {};
var clear = v1(() => {
  nodes = [];
  sections = [];
  cnt = 0;
  elements = {};
}, "clear");
var getSection = v1(v139 => {
  if (nodes.length === 0) {
    return null;
  }
  const v140 = nodes[0].level;
  let v141 = null;
  for (let v142 = nodes.length - 1; v142 >= 0; v142--) {
    if (nodes[v142].level === v140 && !v141) {
      v141 = nodes[v142];
    }
    if (nodes[v142].level < v140) {
      throw new Error("Items without section detected, found section (\"" + nodes[v142].label + "\")");
    }
  }
  if (v139 === v141?.level) {
    return null;
  }
  return v141;
}, "getSection");
var getSections = v1(function () {
  return sections;
}, "getSections");
var getData = v1(function () {
  const v143 = [];
  const v144 = [];
  const v145 = getSections();
  const v146 = v3();
  for (const v147 of v145) {
    const v148 = {
      id: v147.id,
      label: v10(v147.label ?? "", v146),
      labelType: "markdown",
      isGroup: true,
      ticket: v147.ticket,
      shape: "kanbanSection",
      level: v147.level,
      look: v146.look
    };
    v144.push(v148);
    const v149 = nodes.filter(v150 => v150.parentId === v147.id);
    for (const v151 of v149) {
      const v152 = {
        id: v151.id,
        parentId: v147.id,
        label: v10(v151.label ?? "", v146),
        labelType: "markdown",
        isGroup: false,
        ticket: v151?.ticket,
        priority: v151?.priority,
        assigned: v151?.assigned,
        icon: v151?.icon,
        shape: "kanbanItem",
        level: v151.level,
        rx: 5,
        ry: 5,
        cssStyles: ["text-align: left"]
      };
      v144.push(v152);
    }
  }
  return {
    nodes: v144,
    edges: v143,
    other: {},
    config: v3()
  };
}, "getData");
var addNode = v1((v153, v154, v155, v156, v157) => {
  const v158 = v3();
  let v159 = v158.mindmap?.padding ?? v9.mindmap.padding;
  switch (v156) {
    case nodeType.ROUNDED_RECT:
    case nodeType.RECT:
    case nodeType.HEXAGON:
      v159 *= 2;
  }
  const v160 = {
    id: v10(v154, v158) || "kbn" + cnt++,
    level: v153,
    label: v10(v155, v158),
    width: v158.mindmap?.maxNodeWidth ?? v9.mindmap.maxNodeWidth,
    padding: v159,
    isGroup: false
  };
  if (v157 !== undefined) {
    let v161;
    if (!v157.includes("\n")) {
      v161 = "{\n" + v157 + "\n}";
    } else {
      v161 = v157 + "\n";
    }
    const v162 = v11(v161, {
      schema: v12
    });
    if (v162.shape && (v162.shape !== v162.shape.toLowerCase() || v162.shape.includes("_"))) {
      throw new Error("No such shape: " + v162.shape + ". Shape names should be lowercase.");
    }
    if (v162?.shape && v162.shape === "kanbanItem") {
      v160.shape = v162?.shape;
    }
    if (v162?.label) {
      v160.label = v162?.label;
    }
    if (v162?.icon) {
      v160.icon = v162?.icon.toString();
    }
    if (v162?.assigned) {
      v160.assigned = v162?.assigned.toString();
    }
    if (v162?.ticket) {
      v160.ticket = v162?.ticket.toString();
    }
    if (v162?.priority) {
      v160.priority = v162?.priority;
    }
  }
  const v163 = getSection(v153);
  if (v163) {
    v160.parentId = v163.id || "kbn" + cnt++;
  } else {
    sections.push(v160);
  }
  nodes.push(v160);
}, "addNode");
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
var getType = v1((v164, v165) => {
  v2.debug("In get type", v164, v165);
  switch (v164) {
    case "[":
      return nodeType.RECT;
    case "(":
      if (v165 === ")") {
        return nodeType.ROUNDED_RECT;
      } else {
        return nodeType.CLOUD;
      }
    case "((":
      return nodeType.CIRCLE;
    case ")":
      return nodeType.CLOUD;
    case "))":
      return nodeType.BANG;
    case "{{":
      return nodeType.HEXAGON;
    default:
      return nodeType.DEFAULT;
  }
}, "getType");
var setElementForId = v1((v166, v167) => {
  elements[v166] = v167;
}, "setElementForId");
var decorateNode = v1(v168 => {
  if (!v168) {
    return;
  }
  const v169 = v3();
  const v170 = nodes[nodes.length - 1];
  if (v168.icon) {
    v170.icon = v10(v168.icon, v169);
  }
  if (v168.class) {
    v170.cssClasses = v10(v168.class, v169);
  }
}, "decorateNode");
var type2Str = v1(v171 => {
  switch (v171) {
    case nodeType.DEFAULT:
      return "no-border";
    case nodeType.RECT:
      return "rect";
    case nodeType.ROUNDED_RECT:
      return "rounded-rect";
    case nodeType.CIRCLE:
      return "circle";
    case nodeType.CLOUD:
      return "cloud";
    case nodeType.BANG:
      return "bang";
    case nodeType.HEXAGON:
      return "hexgon";
    default:
      return "no-border";
  }
}, "type2Str");
var getLogger = v1(() => v2, "getLogger");
var getElementById = v1(v172 => elements[v172], "getElementById");
var db = {
  clear: clear,
  addNode: addNode,
  getSections: getSections,
  getData: getData,
  nodeType: nodeType,
  getType: getType,
  setElementForId: setElementForId,
  decorateNode: decorateNode,
  type2Str: type2Str,
  getLogger: getLogger,
  getElementById: getElementById
};
var kanbanDb_default = db;
var draw = v1(async (v173, v174, v175, v176) => {
  v2.debug("Rendering kanban diagram\n" + v173);
  const v177 = v176.db;
  const v178 = v177.getData();
  const v179 = v3();
  v179.htmlLabels = false;
  const v180 = v4(v174);
  for (const v181 of v178.nodes) {
    v181.domId = v174 + "-" + v181.id;
  }
  const v182 = v180.append("g");
  v182.attr("class", "sections");
  const v183 = v180.append("g");
  v183.attr("class", "items");
  const v184 = v178.nodes.filter(v185 => v185.isGroup);
  let v186 = 0;
  const v187 = 10;
  const v188 = [];
  let v189 = 25;
  for (const v190 of v184) {
    const v191 = v179?.kanban?.sectionWidth || 200;
    v186 = v186 + 1;
    v190.x = v191 * v186 + (v186 - 1) * v187 / 2;
    v190.width = v191;
    v190.y = 0;
    v190.height = v191 * 3;
    v190.rx = 5;
    v190.ry = 5;
    v190.cssClasses = v190.cssClasses + " section-" + v186;
    const v192 = await v5(v182, v190);
    v189 = Math.max(v189, v192?.labelBBox?.height);
    v188.push(v192);
  }
  let v193 = 0;
  for (const v194 of v184) {
    const v195 = v188[v193];
    v193 = v193 + 1;
    const v196 = v179?.kanban?.sectionWidth || 200;
    const v197 = -v196 * 3 / 2 + v189;
    let v198 = v197;
    const v199 = v178.nodes.filter(v200 => v200.parentId === v194.id);
    for (const v201 of v199) {
      if (v201.isGroup) {
        throw new Error("Groups within groups are not allowed in Kanban diagrams");
      }
      v201.x = v194.x;
      v201.width = v196 - v187 * 1.5;
      const v202 = await v6(v183, v201, {
        config: v179
      });
      const v203 = v202.node().getBBox();
      v201.y = v198 + v203.height / 2;
      await v7(v201);
      v198 = v201.y + v203.height / 2 + v187 / 2;
    }
    const v204 = v195.cluster.select("rect");
    const v205 = Math.max(v198 - v197 + v187 * 3, 50) + (v189 - 25);
    v204.attr("height", v205);
  }
  v8(undefined, v180, v179.mindmap?.padding ?? v9.kanban.padding, v179.mindmap?.useMaxWidth ?? v9.kanban.useMaxWidth);
}, "draw");
var kanbanRenderer_default = {
  draw: draw
};
var genSections = v1(v206 => {
  let v207 = "";
  for (let v208 = 0; v208 < v206.THEME_COLOR_LIMIT; v208++) {
    v206["lineColor" + v208] = v206["lineColor" + v208] || v206["cScaleInv" + v208];
    if (v13(v206["lineColor" + v208])) {
      v206["lineColor" + v208] = v14(v206["lineColor" + v208], 20);
    } else {
      v206["lineColor" + v208] = v15(v206["lineColor" + v208], 20);
    }
  }
  const v209 = v1((v210, v211) => v206.darkMode ? v15(v210, v211) : v14(v210, v211), "adjuster");
  for (let v212 = 0; v212 < v206.THEME_COLOR_LIMIT; v212++) {
    const v213 = "" + (17 - v212 * 3);
    v207 += "\n    .section-" + (v212 - 1) + " rect, .section-" + (v212 - 1) + " path, .section-" + (v212 - 1) + " circle, .section-" + (v212 - 1) + " polygon, .section-" + (v212 - 1) + " path  {\n      fill: " + v209(v206["cScale" + v212], 10) + ";\n      stroke: " + v209(v206["cScale" + v212], 10) + ";\n\n    }\n    .section-" + (v212 - 1) + " text {\n     fill: " + v206["cScaleLabel" + v212] + ";\n    }\n    .node-icon-" + (v212 - 1) + " {\n      font-size: 40px;\n      color: " + v206["cScaleLabel" + v212] + ";\n    }\n    .section-edge-" + (v212 - 1) + "{\n      stroke: " + v206["cScale" + v212] + ";\n    }\n    .edge-depth-" + (v212 - 1) + "{\n      stroke-width: " + v213 + ";\n    }\n    .section-" + (v212 - 1) + " line {\n      stroke: " + v206["cScaleInv" + v212] + " ;\n      stroke-width: 3;\n    }\n\n    .disabled, .disabled circle, .disabled text {\n      fill: lightgray;\n    }\n    .disabled text {\n      fill: #efefef;\n    }\n\n  .node rect,\n  .node circle,\n  .node ellipse,\n  .node polygon,\n  .node path {\n    fill: " + v206.background + ";\n    stroke: " + v206.nodeBorder + ";\n    stroke-width: 1px;\n  }\n\n  .kanban-ticket-link {\n    fill: " + v206.background + ";\n    stroke: " + v206.nodeBorder + ";\n    text-decoration: underline;\n  }\n    ";
  }
  return v207;
}, "genSections");
var getStyles = v1(v214 => "\n  .edge {\n    stroke-width: 3;\n  }\n  " + genSections(v214) + "\n  .section-root rect, .section-root path, .section-root circle, .section-root polygon  {\n    fill: " + v214.git0 + ";\n  }\n  .section-root text {\n    fill: " + v214.gitBranchLabel0 + ";\n  }\n  .icon-container {\n    height:100%;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n  .edge {\n    fill: none;\n  }\n  .cluster-label, .label {\n    color: " + v214.textColor + ";\n    fill: " + v214.textColor + ";\n    }\n  .kanban-label {\n    dy: 1em;\n    alignment-baseline: middle;\n    text-anchor: middle;\n    dominant-baseline: middle;\n    text-align: center;\n  }\n    " + v16() + "\n", "getStyles");
var styles_default = getStyles;
var diagram = {
  db: kanbanDb_default,
  renderer: kanbanRenderer_default,
  parser: kanban_default,
  styles: styles_default
};
export { diagram };