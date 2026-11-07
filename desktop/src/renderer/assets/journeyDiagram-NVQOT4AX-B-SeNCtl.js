import { g as v1 } from "./chunk-5VM5RSS4-Cbnyy23B.js";
import { a as v2, g as v3, h as v4, d as v5 } from "./chunk-2GRJ4B5K-DGslyOWI.js";
import { g as v6, s as v7, a as v8, b as v9, o as v10, n as v11, _ as v12, c as v13, d as v14, e as v15, p as v16 } from "./index-CXb3UsfP.js";
import { d as v17 } from "./arc-irE1ePbe.js";
var parser = function () {
  var v18 = v12(function (v19, v20, v21, v22) {
    v21 = v21 || {};
    v22 = v19.length;
    for (; v22--; v21[v19[v22]] = v20);
    return v21;
  }, "o");
  var v23 = [6, 8, 10, 11, 12, 14, 16, 17, 18];
  var v24 = [1, 9];
  var v25 = [1, 10];
  var v26 = [1, 11];
  var v27 = [1, 12];
  var v28 = [1, 13];
  var v29 = [1, 14];
  var v30 = {
    trace: v12(function v31() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      journey: 4,
      document: 5,
      EOF: 6,
      line: 7,
      SPACE: 8,
      statement: 9,
      NEWLINE: 10,
      title: 11,
      acc_title: 12,
      acc_title_value: 13,
      acc_descr: 14,
      acc_descr_value: 15,
      acc_descr_multiline_value: 16,
      section: 17,
      taskName: 18,
      taskData: 19,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      4: "journey",
      6: "EOF",
      8: "SPACE",
      10: "NEWLINE",
      11: "title",
      12: "acc_title",
      13: "acc_title_value",
      14: "acc_descr",
      15: "acc_descr_value",
      16: "acc_descr_multiline_value",
      17: "section",
      18: "taskName",
      19: "taskData"
    },
    productions_: [0, [3, 3], [5, 0], [5, 2], [7, 2], [7, 1], [7, 1], [7, 1], [9, 1], [9, 2], [9, 2], [9, 1], [9, 1], [9, 2]],
    performAction: v12(function v32(v33, v34, v35, v36, v37, v38, v39) {
      var v40 = v38.length - 1;
      switch (v37) {
        case 1:
          return v38[v40 - 1];
        case 2:
          this.$ = [];
          break;
        case 3:
          v38[v40 - 1].push(v38[v40]);
          this.$ = v38[v40 - 1];
          break;
        case 4:
        case 5:
          this.$ = v38[v40];
          break;
        case 6:
        case 7:
          this.$ = [];
          break;
        case 8:
          v36.setDiagramTitle(v38[v40].substr(6));
          this.$ = v38[v40].substr(6);
          break;
        case 9:
          this.$ = v38[v40].trim();
          v36.setAccTitle(this.$);
          break;
        case 10:
        case 11:
          this.$ = v38[v40].trim();
          v36.setAccDescription(this.$);
          break;
        case 12:
          v36.addSection(v38[v40].substr(8));
          this.$ = v38[v40].substr(8);
          break;
        case 13:
          v36.addTask(v38[v40 - 1], v38[v40]);
          this.$ = "task";
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: [1, 2]
    }, {
      1: [3]
    }, v18(v23, [2, 2], {
      5: 3
    }), {
      6: [1, 4],
      7: 5,
      8: [1, 6],
      9: 7,
      10: [1, 8],
      11: v24,
      12: v25,
      14: v26,
      16: v27,
      17: v28,
      18: v29
    }, v18(v23, [2, 7], {
      1: [2, 1]
    }), v18(v23, [2, 3]), {
      9: 15,
      11: v24,
      12: v25,
      14: v26,
      16: v27,
      17: v28,
      18: v29
    }, v18(v23, [2, 5]), v18(v23, [2, 6]), v18(v23, [2, 8]), {
      13: [1, 16]
    }, {
      15: [1, 17]
    }, v18(v23, [2, 11]), v18(v23, [2, 12]), {
      19: [1, 18]
    }, v18(v23, [2, 4]), v18(v23, [2, 9]), v18(v23, [2, 10]), v18(v23, [2, 13])],
    defaultActions: {},
    parseError: v12(function v41(v42, v43) {
      if (v43.recoverable) {
        this.trace(v42);
      } else {
        var v44 = new Error(v42);
        v44.hash = v43;
        throw v44;
      }
    }, "parseError"),
    parse: v12(function v45(v46) {
      var v47 = this;
      var v48 = [0];
      var v49 = [];
      var v50 = [null];
      var v51 = [];
      var v52 = this.table;
      var v53 = "";
      var v54 = 0;
      var v55 = 0;
      var v56 = 2;
      var v57 = 1;
      var v58 = v51.slice.call(arguments, 1);
      var v59 = Object.create(this.lexer);
      var v60 = {
        yy: {}
      };
      for (var v61 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v61)) {
          v60.yy[v61] = this.yy[v61];
        }
      }
      v59.setInput(v46, v60.yy);
      v60.yy.lexer = v59;
      v60.yy.parser = this;
      if (typeof v59.yylloc == "undefined") {
        v59.yylloc = {};
      }
      var v62 = v59.yylloc;
      v51.push(v62);
      var v63 = v59.options && v59.options.ranges;
      if (typeof v60.yy.parseError === "function") {
        this.parseError = v60.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v64(v65) {
        v48.length = v48.length - v65 * 2;
        v50.length = v50.length - v65;
        v51.length = v51.length - v65;
      }
      v12(v64, "popStack");
      function v66() {
        var v67;
        v67 = v49.pop() || v59.lex() || v57;
        if (typeof v67 !== "number") {
          if (v67 instanceof Array) {
            v49 = v67;
            v67 = v49.pop();
          }
          v67 = v47.symbols_[v67] || v67;
        }
        return v67;
      }
      v12(v66, "lex");
      var v68;
      var v69;
      var v70;
      var v71;
      var v72 = {};
      var v73;
      var v74;
      var v75;
      var v76;
      while (true) {
        v69 = v48[v48.length - 1];
        if (this.defaultActions[v69]) {
          v70 = this.defaultActions[v69];
        } else {
          if (v68 === null || typeof v68 == "undefined") {
            v68 = v66();
          }
          v70 = v52[v69] && v52[v69][v68];
        }
        if (typeof v70 === "undefined" || !v70.length || !v70[0]) {
          var v77 = "";
          v76 = [];
          for (v73 in v52[v69]) {
            if (this.terminals_[v73] && v73 > v56) {
              v76.push("'" + this.terminals_[v73] + "'");
            }
          }
          if (v59.showPosition) {
            v77 = "Parse error on line " + (v54 + 1) + ":\n" + v59.showPosition() + "\nExpecting " + v76.join(", ") + ", got '" + (this.terminals_[v68] || v68) + "'";
          } else {
            v77 = "Parse error on line " + (v54 + 1) + ": Unexpected " + (v68 == v57 ? "end of input" : "'" + (this.terminals_[v68] || v68) + "'");
          }
          this.parseError(v77, {
            text: v59.match,
            token: this.terminals_[v68] || v68,
            line: v59.yylineno,
            loc: v62,
            expected: v76
          });
        }
        if (v70[0] instanceof Array && v70.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v69 + ", token: " + v68);
        }
        switch (v70[0]) {
          case 1:
            v48.push(v68);
            v50.push(v59.yytext);
            v51.push(v59.yylloc);
            v48.push(v70[1]);
            v68 = null;
            {
              v55 = v59.yyleng;
              v53 = v59.yytext;
              v54 = v59.yylineno;
              v62 = v59.yylloc;
            }
            break;
          case 2:
            v74 = this.productions_[v70[1]][1];
            v72.$ = v50[v50.length - v74];
            v72._$ = {
              first_line: v51[v51.length - (v74 || 1)].first_line,
              last_line: v51[v51.length - 1].last_line,
              first_column: v51[v51.length - (v74 || 1)].first_column,
              last_column: v51[v51.length - 1].last_column
            };
            if (v63) {
              v72._$.range = [v51[v51.length - (v74 || 1)].range[0], v51[v51.length - 1].range[1]];
            }
            v71 = this.performAction.apply(v72, [v53, v55, v54, v60.yy, v70[1], v50, v51].concat(v58));
            if (typeof v71 !== "undefined") {
              return v71;
            }
            if (v74) {
              v48 = v48.slice(0, v74 * -1 * 2);
              v50 = v50.slice(0, v74 * -1);
              v51 = v51.slice(0, v74 * -1);
            }
            v48.push(this.productions_[v70[1]][0]);
            v50.push(v72.$);
            v51.push(v72._$);
            v75 = v52[v48[v48.length - 2]][v48[v48.length - 1]];
            v48.push(v75);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v78 = function () {
    var v79 = {
      EOF: 1,
      parseError: v12(function v80(v81, v82) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v81, v82);
        } else {
          throw new Error(v81);
        }
      }, "parseError"),
      setInput: v12(function (v83, v84) {
        this.yy = v84 || this.yy || {};
        this._input = v83;
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
      input: v12(function () {
        var v85 = this._input[0];
        this.yytext += v85;
        this.yyleng++;
        this.offset++;
        this.match += v85;
        this.matched += v85;
        var v86 = v85.match(/(?:\r\n?|\n).*/g);
        if (v86) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v85;
      }, "input"),
      unput: v12(function (v87) {
        var v88 = v87.length;
        var v89 = v87.split(/(?:\r\n?|\n)/g);
        this._input = v87 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v88);
        this.offset -= v88;
        var v90 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v89.length - 1) {
          this.yylineno -= v89.length - 1;
        }
        var v91 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v89 ? (v89.length === v90.length ? this.yylloc.first_column : 0) + v90[v90.length - v89.length].length - v89[0].length : this.yylloc.first_column - v88
        };
        if (this.options.ranges) {
          this.yylloc.range = [v91[0], v91[0] + this.yyleng - v88];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: v12(function () {
        this._more = true;
        return this;
      }, "more"),
      reject: v12(function () {
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
      less: v12(function (v92) {
        this.unput(this.match.slice(v92));
      }, "less"),
      pastInput: v12(function () {
        var v93 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v93.length > 20 ? "..." : "") + v93.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v12(function () {
        var v94 = this.match;
        if (v94.length < 20) {
          v94 += this._input.substr(0, 20 - v94.length);
        }
        return (v94.substr(0, 20) + (v94.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v12(function () {
        var v95 = this.pastInput();
        var v96 = new Array(v95.length + 1).join("-");
        return v95 + this.upcomingInput() + "\n" + v96 + "^";
      }, "showPosition"),
      test_match: v12(function (v97, v98) {
        var v99;
        var v100;
        var v101;
        if (this.options.backtrack_lexer) {
          v101 = {
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
            v101.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v100 = v97[0].match(/(?:\r\n?|\n).*/g);
        if (v100) {
          this.yylineno += v100.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v100 ? v100[v100.length - 1].length - v100[v100.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v97[0].length
        };
        this.yytext += v97[0];
        this.match += v97[0];
        this.matches = v97;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v97[0].length);
        this.matched += v97[0];
        v99 = this.performAction.call(this, this.yy, this, v98, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v99) {
          return v99;
        } else if (this._backtrack) {
          for (var v102 in v101) {
            this[v102] = v101[v102];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: v12(function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var v103;
        var v104;
        var v105;
        var v106;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v107 = this._currentRules();
        for (var v108 = 0; v108 < v107.length; v108++) {
          v105 = this._input.match(this.rules[v107[v108]]);
          if (v105 && (!v104 || v105[0].length > v104[0].length)) {
            v104 = v105;
            v106 = v108;
            if (this.options.backtrack_lexer) {
              v103 = this.test_match(v105, v107[v108]);
              if (v103 !== false) {
                return v103;
              } else if (this._backtrack) {
                v104 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v104) {
          v103 = this.test_match(v104, v107[v106]);
          if (v103 !== false) {
            return v103;
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
      lex: v12(function v109() {
        var v110 = this.next();
        if (v110) {
          return v110;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v12(function v111(v112) {
        this.conditionStack.push(v112);
      }, "begin"),
      popState: v12(function v113() {
        var v114 = this.conditionStack.length - 1;
        if (v114 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v12(function v115() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v12(function v116(v117) {
        v117 = this.conditionStack.length - 1 - Math.abs(v117 || 0);
        if (v117 >= 0) {
          return this.conditionStack[v117];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v12(function v118(v119) {
        this.begin(v119);
      }, "pushState"),
      stateStackSize: v12(function v120() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v12(function v121(v122, v123, v124, v125) {
        switch (v124) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            return 10;
          case 3:
            break;
          case 4:
            break;
          case 5:
            return 4;
          case 6:
            return 11;
          case 7:
            this.begin("acc_title");
            return 12;
          case 8:
            this.popState();
            return "acc_title_value";
          case 9:
            this.begin("acc_descr");
            return 14;
          case 10:
            this.popState();
            return "acc_descr_value";
          case 11:
            this.begin("acc_descr_multiline");
            break;
          case 12:
            this.popState();
            break;
          case 13:
            return "acc_descr_multiline_value";
          case 14:
            return 17;
          case 15:
            return 18;
          case 16:
            return 19;
          case 17:
            return ":";
          case 18:
            return 6;
          case 19:
            return "INVALID";
        }
      }, "anonymous"),
      rules: [/^(?:%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:#[^\n]*)/i, /^(?:journey\b)/i, /^(?:title\s[^#\n;]+)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:section\s[^#:\n;]+)/i, /^(?:[^#:\n;]+)/i, /^(?::[^#\n;]+)/i, /^(?::)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: {
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
        INITIAL: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 19],
          inclusive: true
        }
      }
    };
    return v79;
  }();
  v30.lexer = v78;
  function v126() {
    this.yy = {};
  }
  v12(v126, "Parser");
  v126.prototype = v30;
  v30.Parser = v126;
  return new v126();
}();
parser.parser = parser;
var journey_default = parser;
var currentSection = "";
var sections = [];
var tasks = [];
var rawTasks = [];
var clear2 = v12(function () {
  sections.length = 0;
  tasks.length = 0;
  currentSection = "";
  rawTasks.length = 0;
  v16();
}, "clear");
var addSection = v12(function (v127) {
  currentSection = v127;
  sections.push(v127);
}, "addSection");
var getSections = v12(function () {
  return sections;
}, "getSections");
var getTasks = v12(function () {
  let v128 = compileTasks();
  const v129 = 100;
  let v130 = 0;
  while (!v128 && v130 < v129) {
    v128 = compileTasks();
    v130++;
  }
  tasks.push(...rawTasks);
  return tasks;
}, "getTasks");
var updateActors = v12(function () {
  const v131 = [];
  tasks.forEach(v132 => {
    if (v132.people) {
      v131.push(...v132.people);
    }
  });
  const v133 = new Set(v131);
  return [...v133].sort();
}, "updateActors");
var addTask = v12(function (v134, v135) {
  const v136 = v135.substr(1).split(":");
  let v137 = 0;
  let v138 = [];
  if (v136.length === 1) {
    v137 = Number(v136[0]);
    v138 = [];
  } else {
    v137 = Number(v136[0]);
    v138 = v136[1].split(",");
  }
  const v139 = v138.map(v140 => v140.trim());
  const v141 = {
    section: currentSection,
    type: currentSection,
    people: v139,
    task: v134,
    score: v137
  };
  rawTasks.push(v141);
}, "addTask");
var addTaskOrg = v12(function (v142) {
  const v143 = {
    section: currentSection,
    type: currentSection,
    description: v142,
    task: v142,
    classes: []
  };
  tasks.push(v143);
}, "addTaskOrg");
var compileTasks = v12(function () {
  const v144 = v12(function (v145) {
    return rawTasks[v145].processed;
  }, "compileTask");
  let v146 = true;
  for (const [v147, v148] of rawTasks.entries()) {
    v144(v147);
    v146 = v146 && v148.processed;
  }
  return v146;
}, "compileTasks");
var getActors = v12(function () {
  return updateActors();
}, "getActors");
var journeyDb_default = {
  getConfig: v12(() => v13().journey, "getConfig"),
  clear: clear2,
  setDiagramTitle: v11,
  getDiagramTitle: v10,
  setAccTitle: v9,
  getAccTitle: v8,
  setAccDescription: v7,
  getAccDescription: v6,
  addSection: addSection,
  getSections: getSections,
  getTasks: getTasks,
  addTask: addTask,
  addTaskOrg: addTaskOrg,
  getActors: getActors
};
var getStyles = v12(v149 => ".label {\n    font-family: " + v149.fontFamily + ";\n    color: " + v149.textColor + ";\n  }\n  .mouth {\n    stroke: #666;\n  }\n\n  line {\n    stroke: " + v149.textColor + "\n  }\n\n  .legend {\n    fill: " + v149.textColor + ";\n    font-family: " + v149.fontFamily + ";\n  }\n\n  .label text {\n    fill: #333;\n  }\n  .label {\n    color: " + v149.textColor + "\n  }\n\n  .face {\n    " + (v149.faceColor ? "fill: " + v149.faceColor : "fill: #FFF8DC") + ";\n    stroke: #999;\n  }\n\n  .node rect,\n  .node circle,\n  .node ellipse,\n  .node polygon,\n  .node path {\n    fill: " + v149.mainBkg + ";\n    stroke: " + v149.nodeBorder + ";\n    stroke-width: 1px;\n  }\n\n  .node .label {\n    text-align: center;\n  }\n  .node.clickable {\n    cursor: pointer;\n  }\n\n  .arrowheadPath {\n    fill: " + v149.arrowheadColor + ";\n  }\n\n  .edgePath .path {\n    stroke: " + v149.lineColor + ";\n    stroke-width: 1.5px;\n  }\n\n  .flowchart-link {\n    stroke: " + v149.lineColor + ";\n    fill: none;\n  }\n\n  .edgeLabel {\n    background-color: " + v149.edgeLabelBackground + ";\n    rect {\n      opacity: 0.5;\n    }\n    text-align: center;\n  }\n\n  .cluster rect {\n  }\n\n  .cluster text {\n    fill: " + v149.titleColor + ";\n  }\n\n  div.mermaidTooltip {\n    position: absolute;\n    text-align: center;\n    max-width: 200px;\n    padding: 2px;\n    font-family: " + v149.fontFamily + ";\n    font-size: 12px;\n    background: " + v149.tertiaryColor + ";\n    border: 1px solid " + v149.border2 + ";\n    border-radius: 2px;\n    pointer-events: none;\n    z-index: 100;\n  }\n\n  .task-type-0, .section-type-0  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType0 : "") + ";\n  }\n  .task-type-1, .section-type-1  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType1 : "") + ";\n  }\n  .task-type-2, .section-type-2  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType2 : "") + ";\n  }\n  .task-type-3, .section-type-3  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType3 : "") + ";\n  }\n  .task-type-4, .section-type-4  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType4 : "") + ";\n  }\n  .task-type-5, .section-type-5  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType5 : "") + ";\n  }\n  .task-type-6, .section-type-6  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType6 : "") + ";\n  }\n  .task-type-7, .section-type-7  {\n    " + (v149.fillType0 ? "fill: " + v149.fillType7 : "") + ";\n  }\n\n  .actor-0 {\n    " + (v149.actor0 ? "fill: " + v149.actor0 : "") + ";\n  }\n  .actor-1 {\n    " + (v149.actor1 ? "fill: " + v149.actor1 : "") + ";\n  }\n  .actor-2 {\n    " + (v149.actor2 ? "fill: " + v149.actor2 : "") + ";\n  }\n  .actor-3 {\n    " + (v149.actor3 ? "fill: " + v149.actor3 : "") + ";\n  }\n  .actor-4 {\n    " + (v149.actor4 ? "fill: " + v149.actor4 : "") + ";\n  }\n  .actor-5 {\n    " + (v149.actor5 ? "fill: " + v149.actor5 : "") + ";\n  }\n  " + v1() + "\n", "getStyles");
var styles_default = getStyles;
var drawRect2 = v12(function (v150, v151) {
  return v5(v150, v151);
}, "drawRect");
var drawFace = v12(function (v152, v153) {
  const v154 = 15;
  const v155 = v152.append("circle").attr("cx", v153.cx).attr("cy", v153.cy).attr("class", "face").attr("r", v154).attr("stroke-width", 2).attr("overflow", "visible");
  const v156 = v152.append("g");
  v156.append("circle").attr("cx", v153.cx - v154 / 3).attr("cy", v153.cy - v154 / 3).attr("r", 1.5).attr("stroke-width", 2).attr("fill", "#666").attr("stroke", "#666");
  v156.append("circle").attr("cx", v153.cx + v154 / 3).attr("cy", v153.cy - v154 / 3).attr("r", 1.5).attr("stroke-width", 2).attr("fill", "#666").attr("stroke", "#666");
  function v157(v158) {
    const v159 = v17().startAngle(Math.PI / 2).endAngle(Math.PI / 2 * 3).innerRadius(v154 / 2).outerRadius(v154 / 2.2);
    v158.append("path").attr("class", "mouth").attr("d", v159).attr("transform", "translate(" + v153.cx + "," + (v153.cy + 2) + ")");
  }
  v12(v157, "smile");
  function v160(v161) {
    const v162 = v17().startAngle(Math.PI * 3 / 2).endAngle(Math.PI / 2 * 5).innerRadius(v154 / 2).outerRadius(v154 / 2.2);
    v161.append("path").attr("class", "mouth").attr("d", v162).attr("transform", "translate(" + v153.cx + "," + (v153.cy + 7) + ")");
  }
  v12(v160, "sad");
  function v163(v164) {
    v164.append("line").attr("class", "mouth").attr("stroke", 2).attr("x1", v153.cx - 5).attr("y1", v153.cy + 7).attr("x2", v153.cx + 5).attr("y2", v153.cy + 7).attr("class", "mouth").attr("stroke-width", "1px").attr("stroke", "#666");
  }
  v12(v163, "ambivalent");
  if (v153.score > 3) {
    v157(v156);
  } else if (v153.score < 3) {
    v160(v156);
  } else {
    v163(v156);
  }
  return v155;
}, "drawFace");
var drawCircle = v12(function (v165, v166) {
  const v167 = v165.append("circle");
  v167.attr("cx", v166.cx);
  v167.attr("cy", v166.cy);
  v167.attr("class", "actor-" + v166.pos);
  v167.attr("fill", v166.fill);
  v167.attr("stroke", v166.stroke);
  v167.attr("r", v166.r);
  if (v167.class !== undefined) {
    v167.attr("class", v167.class);
  }
  if (v166.title !== undefined) {
    v167.append("title").text(v166.title);
  }
  return v167;
}, "drawCircle");
var drawText2 = v12(function (v168, v169) {
  return v4(v168, v169);
}, "drawText");
var drawLabel = v12(function (v170, v171) {
  function v172(v173, v174, v175, v176, v177) {
    return v173 + "," + v174 + " " + (v173 + v175) + "," + v174 + " " + (v173 + v175) + "," + (v174 + v176 - v177) + " " + (v173 + v175 - v177 * 1.2) + "," + (v174 + v176) + " " + v173 + "," + (v174 + v176);
  }
  v12(v172, "genPoints");
  const v178 = v170.append("polygon");
  v178.attr("points", v172(v171.x, v171.y, 50, 20, 7));
  v178.attr("class", "labelBox");
  v171.y = v171.y + v171.labelMargin;
  v171.x = v171.x + v171.labelMargin * 0.5;
  drawText2(v170, v171);
}, "drawLabel");
var drawSection = v12(function (v179, v180, v181) {
  const v182 = v179.append("g");
  const v183 = v3();
  v183.x = v180.x;
  v183.y = v180.y;
  v183.fill = v180.fill;
  v183.width = v181.width * v180.taskCount + v181.diagramMarginX * (v180.taskCount - 1);
  v183.height = v181.height;
  v183.class = "journey-section section-type-" + v180.num;
  v183.rx = 3;
  v183.ry = 3;
  drawRect2(v182, v183);
  _drawTextCandidateFunc(v181)(v180.text, v182, v183.x, v183.y, v183.width, v183.height, {
    class: "journey-section section-type-" + v180.num
  }, v181, v180.colour);
}, "drawSection");
var taskCount = -1;
var drawTask = v12(function (v184, v185, v186, v187) {
  const v188 = v185.x + v186.width / 2;
  const v189 = v184.append("g");
  taskCount++;
  const v190 = 450;
  v189.append("line").attr("id", v187 + "-task" + taskCount).attr("x1", v188).attr("y1", v185.y).attr("x2", v188).attr("y2", v190).attr("class", "task-line").attr("stroke-width", "1px").attr("stroke-dasharray", "4 2").attr("stroke", "#666");
  drawFace(v189, {
    cx: v188,
    cy: 300 + (5 - v185.score) * 30,
    score: v185.score
  });
  const v191 = v3();
  v191.x = v185.x;
  v191.y = v185.y;
  v191.fill = v185.fill;
  v191.width = v186.width;
  v191.height = v186.height;
  v191.class = "task task-type-" + v185.num;
  v191.rx = 3;
  v191.ry = 3;
  drawRect2(v189, v191);
  let v192 = v185.x + 14;
  v185.people.forEach(v193 => {
    const v194 = v185.actors[v193].color;
    const v195 = {
      cx: v192,
      cy: v185.y,
      r: 7,
      fill: v194,
      stroke: "#000",
      title: v193,
      pos: v185.actors[v193].position
    };
    drawCircle(v189, v195);
    v192 += 10;
  });
  _drawTextCandidateFunc(v186)(v185.task, v189, v191.x, v191.y, v191.width, v191.height, {
    class: "task"
  }, v186, v185.colour);
}, "drawTask");
var drawBackgroundRect2 = v12(function (v196, v197) {
  v2(v196, v197);
}, "drawBackgroundRect");
var _drawTextCandidateFunc = function () {
  function v198(v199, v200, v201, v202, v203, v204, v205, v206) {
    const v207 = v200.append("text").attr("x", v201 + v203 / 2).attr("y", v202 + v204 / 2 + 5).style("font-color", v206).style("text-anchor", "middle").text(v199);
    v208(v207, v205);
  }
  v12(v198, "byText");
  function v209(v210, v211, v212, v213, v214, v215, v216, v217, v218) {
    const {
      taskFontSize: v219,
      taskFontFamily: v220
    } = v217;
    const v221 = v210.split(/<br\s*\/?>/gi);
    for (let v222 = 0; v222 < v221.length; v222++) {
      const v223 = v222 * v219 - v219 * (v221.length - 1) / 2;
      const v224 = v211.append("text").attr("x", v212 + v214 / 2).attr("y", v213).attr("fill", v218).style("text-anchor", "middle").style("font-size", v219).style("font-family", v220);
      v224.append("tspan").attr("x", v212 + v214 / 2).attr("dy", v223).text(v221[v222]);
      v224.attr("y", v213 + v215 / 2).attr("dominant-baseline", "central").attr("alignment-baseline", "central");
      v208(v224, v216);
    }
  }
  v12(v209, "byTspan");
  function v225(v226, v227, v228, v229, v230, v231, v232, v233) {
    const v234 = v227.append("switch");
    const v235 = v234.append("foreignObject").attr("x", v228).attr("y", v229).attr("width", v230).attr("height", v231).attr("position", "fixed");
    const v236 = v235.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
    v236.append("div").attr("class", "label").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").text(v226);
    v209(v226, v234, v228, v229, v230, v231, v232, v233);
    v208(v236, v232);
  }
  v12(v225, "byFo");
  function v208(v237, v238) {
    for (const v239 in v238) {
      if (v239 in v238) {
        v237.attr(v239, v238[v239]);
      }
    }
  }
  v12(v208, "_setTextAttrs");
  return function (v240) {
    if (v240.textPlacement === "fo") {
      return v225;
    } else if (v240.textPlacement === "old") {
      return v198;
    } else {
      return v209;
    }
  };
}();
var initGraphics = v12(function (v241, v242) {
  taskCount = -1;
  v241.append("defs").append("marker").attr("id", v242 + "-arrowhead").attr("refX", 5).attr("refY", 2).attr("markerWidth", 6).attr("markerHeight", 4).attr("orient", "auto").append("path").attr("d", "M 0,0 V 4 L6,2 Z");
}, "initGraphics");
var svgDraw_default = {
  drawRect: drawRect2,
  drawCircle: drawCircle,
  drawSection: drawSection,
  drawText: drawText2,
  drawLabel: drawLabel,
  drawTask: drawTask,
  drawBackgroundRect: drawBackgroundRect2,
  initGraphics: initGraphics
};
var setConf = v12(function (v243) {
  const v244 = Object.keys(v243);
  v244.forEach(function (v245) {
    conf[v245] = v243[v245];
  });
}, "setConf");
var actors = {};
var maxWidth = 0;
function drawActorLegend(v246) {
  const v247 = v13().journey;
  const v248 = v247.maxLabelWidth;
  maxWidth = 0;
  let v249 = 60;
  Object.keys(actors).forEach(v250 => {
    const v251 = actors[v250].color;
    const v252 = {
      cx: 20,
      cy: v249,
      r: 7,
      fill: v251,
      stroke: "#000",
      pos: actors[v250].position
    };
    svgDraw_default.drawCircle(v246, v252);
    let v253 = v246.append("text").attr("visibility", "hidden").text(v250);
    const v254 = v253.node().getBoundingClientRect().width;
    v253.remove();
    let v255 = [];
    if (v254 <= v248) {
      v255 = [v250];
    } else {
      const v256 = v250.split(" ");
      let v257 = "";
      v253 = v246.append("text").attr("visibility", "hidden");
      v256.forEach(v258 => {
        const v259 = v257 ? v257 + " " + v258 : v258;
        v253.text(v259);
        const v260 = v253.node().getBoundingClientRect().width;
        if (v260 > v248) {
          if (v257) {
            v255.push(v257);
          }
          v257 = v258;
          v253.text(v258);
          if (v253.node().getBoundingClientRect().width > v248) {
            let v261 = "";
            for (const v262 of v258) {
              v261 += v262;
              v253.text(v261 + "-");
              if (v253.node().getBoundingClientRect().width > v248) {
                v255.push(v261.slice(0, -1) + "-");
                v261 = v262;
              }
            }
            v257 = v261;
          }
        } else {
          v257 = v259;
        }
      });
      if (v257) {
        v255.push(v257);
      }
      v253.remove();
    }
    v255.forEach((v263, v264) => {
      const v265 = {
        x: 40,
        y: v249 + 7 + v264 * 20,
        fill: "#666",
        text: v263,
        textMargin: v247.boxTextMargin ?? 5
      };
      const v266 = svgDraw_default.drawText(v246, v265);
      const v267 = v266.node().getBoundingClientRect().width;
      if (v267 > maxWidth && v267 > v247.leftMargin - v267) {
        maxWidth = v267;
      }
    });
    v249 += Math.max(20, v255.length * 20);
  });
}
v12(drawActorLegend, "drawActorLegend");
var conf = v13().journey;
var leftMargin = 0;
var draw = v12(function (v268, v269, v270, v271) {
  const v272 = v13();
  const v273 = v272.journey.titleColor;
  const v274 = v272.journey.titleFontSize;
  const v275 = v272.journey.titleFontFamily;
  const v276 = v272.securityLevel;
  let v277;
  if (v276 === "sandbox") {
    v277 = v14("#i" + v269);
  }
  const v278 = v276 === "sandbox" ? v14(v277.nodes()[0].contentDocument.body) : v14("body");
  bounds.init();
  const v279 = v278.select("#" + v269);
  svgDraw_default.initGraphics(v279, v269);
  const v280 = v271.db.getTasks();
  const v281 = v271.db.getDiagramTitle();
  const v282 = v271.db.getActors();
  for (const v283 in actors) {
    delete actors[v283];
  }
  let v284 = 0;
  v282.forEach(v285 => {
    actors[v285] = {
      color: conf.actorColours[v284 % conf.actorColours.length],
      position: v284
    };
    v284++;
  });
  drawActorLegend(v279);
  leftMargin = conf.leftMargin + maxWidth;
  bounds.insert(0, 0, leftMargin, Object.keys(actors).length * 50);
  drawTasks(v279, v280, 0, v269);
  const v286 = bounds.getBounds();
  if (v281) {
    v279.append("text").text(v281).attr("x", leftMargin).attr("font-size", v274).attr("font-weight", "bold").attr("y", 25).attr("fill", v273).attr("font-family", v275);
  }
  const v287 = v286.stopy - v286.starty + conf.diagramMarginY * 2;
  const v288 = leftMargin + v286.stopx + conf.diagramMarginX * 2;
  v15(v279, v287, v288, conf.useMaxWidth);
  v279.append("line").attr("x1", leftMargin).attr("y1", conf.height * 4).attr("x2", v288 - leftMargin - 4).attr("y2", conf.height * 4).attr("stroke-width", 4).attr("stroke", "black").attr("marker-end", "url(#" + v269 + "-arrowhead)");
  const v289 = v281 ? 70 : 0;
  v279.attr("viewBox", v286.startx + " -25 " + v288 + " " + (v287 + v289));
  v279.attr("preserveAspectRatio", "xMinYMin meet");
  v279.attr("height", v287 + v289 + 25);
}, "draw");
var bounds = {
  data: {
    startx: undefined,
    stopx: undefined,
    starty: undefined,
    stopy: undefined
  },
  verticalPos: 0,
  sequenceItems: [],
  init: v12(function () {
    this.sequenceItems = [];
    this.data = {
      startx: undefined,
      stopx: undefined,
      starty: undefined,
      stopy: undefined
    };
    this.verticalPos = 0;
  }, "init"),
  updateVal: v12(function (v290, v291, v292, v293) {
    if (v290[v291] === undefined) {
      v290[v291] = v292;
    } else {
      v290[v291] = v293(v292, v290[v291]);
    }
  }, "updateVal"),
  updateBounds: v12(function (v294, v295, v296, v297) {
    const v298 = v13().journey;
    const v299 = this;
    let v300 = 0;
    function v301(v302) {
      return v12(function v303(v304) {
        v300++;
        const v305 = v299.sequenceItems.length - v300 + 1;
        v299.updateVal(v304, "starty", v295 - v305 * v298.boxMargin, Math.min);
        v299.updateVal(v304, "stopy", v297 + v305 * v298.boxMargin, Math.max);
        v299.updateVal(bounds.data, "startx", v294 - v305 * v298.boxMargin, Math.min);
        v299.updateVal(bounds.data, "stopx", v296 + v305 * v298.boxMargin, Math.max);
        if (v302 !== "activation") {
          v299.updateVal(v304, "startx", v294 - v305 * v298.boxMargin, Math.min);
          v299.updateVal(v304, "stopx", v296 + v305 * v298.boxMargin, Math.max);
          v299.updateVal(bounds.data, "starty", v295 - v305 * v298.boxMargin, Math.min);
          v299.updateVal(bounds.data, "stopy", v297 + v305 * v298.boxMargin, Math.max);
        }
      }, "updateItemBounds");
    }
    v12(v301, "updateFn");
    this.sequenceItems.forEach(v301());
  }, "updateBounds"),
  insert: v12(function (v306, v307, v308, v309) {
    const v310 = Math.min(v306, v308);
    const v311 = Math.max(v306, v308);
    const v312 = Math.min(v307, v309);
    const v313 = Math.max(v307, v309);
    this.updateVal(bounds.data, "startx", v310, Math.min);
    this.updateVal(bounds.data, "starty", v312, Math.min);
    this.updateVal(bounds.data, "stopx", v311, Math.max);
    this.updateVal(bounds.data, "stopy", v313, Math.max);
    this.updateBounds(v310, v312, v311, v313);
  }, "insert"),
  bumpVerticalPos: v12(function (v314) {
    this.verticalPos = this.verticalPos + v314;
    this.data.stopy = this.verticalPos;
  }, "bumpVerticalPos"),
  getVerticalPos: v12(function () {
    return this.verticalPos;
  }, "getVerticalPos"),
  getBounds: v12(function () {
    return this.data;
  }, "getBounds")
};
var fills = conf.sectionFills;
var textColours = conf.sectionColours;
var drawTasks = v12(function (v315, v316, v317, v318) {
  const v319 = v13().journey;
  let v320 = "";
  const v321 = v319.height * 2 + v319.diagramMarginY;
  const v322 = v317 + v321;
  let v323 = 0;
  let v324 = "#CCC";
  let v325 = "black";
  let v326 = 0;
  for (const [v327, v328] of v316.entries()) {
    if (v320 !== v328.section) {
      v324 = fills[v323 % fills.length];
      v326 = v323 % fills.length;
      v325 = textColours[v323 % textColours.length];
      let v329 = 0;
      const v330 = v328.section;
      for (let v331 = v327; v331 < v316.length; v331++) {
        if (v316[v331].section == v330) {
          v329 = v329 + 1;
        } else {
          break;
        }
      }
      const v332 = {
        x: v327 * v319.taskMargin + v327 * v319.width + leftMargin,
        y: 50,
        text: v328.section,
        fill: v324,
        num: v326,
        colour: v325,
        taskCount: v329
      };
      svgDraw_default.drawSection(v315, v332, v319);
      v320 = v328.section;
      v323++;
    }
    const v333 = v328.people.reduce((v334, v335) => {
      if (actors[v335]) {
        v334[v335] = actors[v335];
      }
      return v334;
    }, {});
    v328.x = v327 * v319.taskMargin + v327 * v319.width + leftMargin;
    v328.y = v322;
    v328.width = v319.diagramMarginX;
    v328.height = v319.diagramMarginY;
    v328.colour = v325;
    v328.fill = v324;
    v328.num = v326;
    v328.actors = v333;
    svgDraw_default.drawTask(v315, v328, v319, v318);
    bounds.insert(v328.x, v328.y, v328.x + v328.width + v319.taskMargin, 450);
  }
}, "drawTasks");
var journeyRenderer_default = {
  setConf: setConf,
  draw: draw
};
var diagram = {
  parser: journey_default,
  db: journeyDb_default,
  renderer: journeyRenderer_default,
  styles: styles_default,
  init: v12(v336 => {
    journeyRenderer_default.setConf(v336.journey);
    journeyDb_default.clear();
  }, "init")
};
export { diagram };