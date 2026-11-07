import { _ as v1, y as v2, T as v3, U as v4, V as v5, c as v6, l as v7, D as v8, K as v9, W as v10, d as v11, t as v12, X as v13, p as v14 } from "./index-CXb3UsfP.js";
import { d as v15 } from "./arc-irE1ePbe.js";
var parser = function () {
  var v16 = v1(function (v17, v18, v19, v20) {
    v19 = v19 || {};
    v20 = v17.length;
    for (; v20--; v19[v17[v20]] = v18);
    return v19;
  }, "o");
  var v21 = [6, 11, 13, 14, 15, 17, 19, 20, 23, 24];
  var v22 = [1, 12];
  var v23 = [1, 13];
  var v24 = [1, 14];
  var v25 = [1, 15];
  var v26 = [1, 16];
  var v27 = [1, 19];
  var v28 = [1, 20];
  var v29 = {
    trace: v1(function v30() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      timeline_header: 4,
      document: 5,
      EOF: 6,
      timeline: 7,
      timeline_lr: 8,
      timeline_td: 9,
      line: 10,
      SPACE: 11,
      statement: 12,
      NEWLINE: 13,
      title: 14,
      acc_title: 15,
      acc_title_value: 16,
      acc_descr: 17,
      acc_descr_value: 18,
      acc_descr_multiline_value: 19,
      section: 20,
      period_statement: 21,
      event_statement: 22,
      period: 23,
      event: 24,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      6: "EOF",
      7: "timeline",
      8: "timeline_lr",
      9: "timeline_td",
      11: "SPACE",
      13: "NEWLINE",
      14: "title",
      15: "acc_title",
      16: "acc_title_value",
      17: "acc_descr",
      18: "acc_descr_value",
      19: "acc_descr_multiline_value",
      20: "section",
      23: "period",
      24: "event"
    },
    productions_: [0, [3, 3], [4, 1], [4, 1], [4, 1], [5, 0], [5, 2], [10, 2], [10, 1], [10, 1], [10, 1], [12, 1], [12, 2], [12, 2], [12, 1], [12, 1], [12, 1], [12, 1], [21, 1], [22, 1]],
    performAction: v1(function v31(v32, v33, v34, v35, v36, v37, v38) {
      var v39 = v37.length - 1;
      switch (v36) {
        case 1:
          return v37[v39 - 1];
        case 3:
          v35.setDirection("LR");
          break;
        case 4:
          v35.setDirection("TD");
          break;
        case 5:
          this.$ = [];
          break;
        case 6:
          v37[v39 - 1].push(v37[v39]);
          this.$ = v37[v39 - 1];
          break;
        case 7:
        case 8:
          this.$ = v37[v39];
          break;
        case 9:
        case 10:
          this.$ = [];
          break;
        case 11:
          v35.getCommonDb().setDiagramTitle(v37[v39].substr(6));
          this.$ = v37[v39].substr(6);
          break;
        case 12:
          this.$ = v37[v39].trim();
          v35.getCommonDb().setAccTitle(this.$);
          break;
        case 13:
        case 14:
          this.$ = v37[v39].trim();
          v35.getCommonDb().setAccDescription(this.$);
          break;
        case 15:
          v35.addSection(v37[v39].substr(8));
          this.$ = v37[v39].substr(8);
          break;
        case 18:
          v35.addTask(v37[v39], 0, "");
          this.$ = v37[v39];
          break;
        case 19:
          v35.addEvent(v37[v39].substr(2));
          this.$ = v37[v39];
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: 2,
      7: [1, 3],
      8: [1, 4],
      9: [1, 5]
    }, {
      1: [3]
    }, v16(v21, [2, 5], {
      5: 6
    }), v16(v21, [2, 2]), v16(v21, [2, 3]), v16(v21, [2, 4]), {
      6: [1, 7],
      10: 8,
      11: [1, 9],
      12: 10,
      13: [1, 11],
      14: v22,
      15: v23,
      17: v24,
      19: v25,
      20: v26,
      21: 17,
      22: 18,
      23: v27,
      24: v28
    }, v16(v21, [2, 10], {
      1: [2, 1]
    }), v16(v21, [2, 6]), {
      12: 21,
      14: v22,
      15: v23,
      17: v24,
      19: v25,
      20: v26,
      21: 17,
      22: 18,
      23: v27,
      24: v28
    }, v16(v21, [2, 8]), v16(v21, [2, 9]), v16(v21, [2, 11]), {
      16: [1, 22]
    }, {
      18: [1, 23]
    }, v16(v21, [2, 14]), v16(v21, [2, 15]), v16(v21, [2, 16]), v16(v21, [2, 17]), v16(v21, [2, 18]), v16(v21, [2, 19]), v16(v21, [2, 7]), v16(v21, [2, 12]), v16(v21, [2, 13])],
    defaultActions: {},
    parseError: v1(function v40(v41, v42) {
      if (v42.recoverable) {
        this.trace(v41);
      } else {
        var v43 = new Error(v41);
        v43.hash = v42;
        throw v43;
      }
    }, "parseError"),
    parse: v1(function v44(v45) {
      var v46 = this;
      var v47 = [0];
      var v48 = [];
      var v49 = [null];
      var v50 = [];
      var v51 = this.table;
      var v52 = "";
      var v53 = 0;
      var v54 = 0;
      var v55 = 2;
      var v56 = 1;
      var v57 = v50.slice.call(arguments, 1);
      var v58 = Object.create(this.lexer);
      var v59 = {
        yy: {}
      };
      for (var v60 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v60)) {
          v59.yy[v60] = this.yy[v60];
        }
      }
      v58.setInput(v45, v59.yy);
      v59.yy.lexer = v58;
      v59.yy.parser = this;
      if (typeof v58.yylloc == "undefined") {
        v58.yylloc = {};
      }
      var v61 = v58.yylloc;
      v50.push(v61);
      var v62 = v58.options && v58.options.ranges;
      if (typeof v59.yy.parseError === "function") {
        this.parseError = v59.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v63(v64) {
        v47.length = v47.length - v64 * 2;
        v49.length = v49.length - v64;
        v50.length = v50.length - v64;
      }
      v1(v63, "popStack");
      function v65() {
        var v66;
        v66 = v48.pop() || v58.lex() || v56;
        if (typeof v66 !== "number") {
          if (v66 instanceof Array) {
            v48 = v66;
            v66 = v48.pop();
          }
          v66 = v46.symbols_[v66] || v66;
        }
        return v66;
      }
      v1(v65, "lex");
      var v67;
      var v68;
      var v69;
      var v70;
      var v71 = {};
      var v72;
      var v73;
      var v74;
      var v75;
      while (true) {
        v68 = v47[v47.length - 1];
        if (this.defaultActions[v68]) {
          v69 = this.defaultActions[v68];
        } else {
          if (v67 === null || typeof v67 == "undefined") {
            v67 = v65();
          }
          v69 = v51[v68] && v51[v68][v67];
        }
        if (typeof v69 === "undefined" || !v69.length || !v69[0]) {
          var v76 = "";
          v75 = [];
          for (v72 in v51[v68]) {
            if (this.terminals_[v72] && v72 > v55) {
              v75.push("'" + this.terminals_[v72] + "'");
            }
          }
          if (v58.showPosition) {
            v76 = "Parse error on line " + (v53 + 1) + ":\n" + v58.showPosition() + "\nExpecting " + v75.join(", ") + ", got '" + (this.terminals_[v67] || v67) + "'";
          } else {
            v76 = "Parse error on line " + (v53 + 1) + ": Unexpected " + (v67 == v56 ? "end of input" : "'" + (this.terminals_[v67] || v67) + "'");
          }
          this.parseError(v76, {
            text: v58.match,
            token: this.terminals_[v67] || v67,
            line: v58.yylineno,
            loc: v61,
            expected: v75
          });
        }
        if (v69[0] instanceof Array && v69.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v68 + ", token: " + v67);
        }
        switch (v69[0]) {
          case 1:
            v47.push(v67);
            v49.push(v58.yytext);
            v50.push(v58.yylloc);
            v47.push(v69[1]);
            v67 = null;
            {
              v54 = v58.yyleng;
              v52 = v58.yytext;
              v53 = v58.yylineno;
              v61 = v58.yylloc;
            }
            break;
          case 2:
            v73 = this.productions_[v69[1]][1];
            v71.$ = v49[v49.length - v73];
            v71._$ = {
              first_line: v50[v50.length - (v73 || 1)].first_line,
              last_line: v50[v50.length - 1].last_line,
              first_column: v50[v50.length - (v73 || 1)].first_column,
              last_column: v50[v50.length - 1].last_column
            };
            if (v62) {
              v71._$.range = [v50[v50.length - (v73 || 1)].range[0], v50[v50.length - 1].range[1]];
            }
            v70 = this.performAction.apply(v71, [v52, v54, v53, v59.yy, v69[1], v49, v50].concat(v57));
            if (typeof v70 !== "undefined") {
              return v70;
            }
            if (v73) {
              v47 = v47.slice(0, v73 * -1 * 2);
              v49 = v49.slice(0, v73 * -1);
              v50 = v50.slice(0, v73 * -1);
            }
            v47.push(this.productions_[v69[1]][0]);
            v49.push(v71.$);
            v50.push(v71._$);
            v74 = v51[v47[v47.length - 2]][v47[v47.length - 1]];
            v47.push(v74);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v77 = function () {
    var v78 = {
      EOF: 1,
      parseError: v1(function v79(v80, v81) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v80, v81);
        } else {
          throw new Error(v80);
        }
      }, "parseError"),
      setInput: v1(function (v82, v83) {
        this.yy = v83 || this.yy || {};
        this._input = v82;
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
        var v84 = this._input[0];
        this.yytext += v84;
        this.yyleng++;
        this.offset++;
        this.match += v84;
        this.matched += v84;
        var v85 = v84.match(/(?:\r\n?|\n).*/g);
        if (v85) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v84;
      }, "input"),
      unput: v1(function (v86) {
        var v87 = v86.length;
        var v88 = v86.split(/(?:\r\n?|\n)/g);
        this._input = v86 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v87);
        this.offset -= v87;
        var v89 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v88.length - 1) {
          this.yylineno -= v88.length - 1;
        }
        var v90 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v88 ? (v88.length === v89.length ? this.yylloc.first_column : 0) + v89[v89.length - v88.length].length - v88[0].length : this.yylloc.first_column - v87
        };
        if (this.options.ranges) {
          this.yylloc.range = [v90[0], v90[0] + this.yyleng - v87];
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
      less: v1(function (v91) {
        this.unput(this.match.slice(v91));
      }, "less"),
      pastInput: v1(function () {
        var v92 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v92.length > 20 ? "..." : "") + v92.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v1(function () {
        var v93 = this.match;
        if (v93.length < 20) {
          v93 += this._input.substr(0, 20 - v93.length);
        }
        return (v93.substr(0, 20) + (v93.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v1(function () {
        var v94 = this.pastInput();
        var v95 = new Array(v94.length + 1).join("-");
        return v94 + this.upcomingInput() + "\n" + v95 + "^";
      }, "showPosition"),
      test_match: v1(function (v96, v97) {
        var v98;
        var v99;
        var v100;
        if (this.options.backtrack_lexer) {
          v100 = {
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
            v100.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v99 = v96[0].match(/(?:\r\n?|\n).*/g);
        if (v99) {
          this.yylineno += v99.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v99 ? v99[v99.length - 1].length - v99[v99.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v96[0].length
        };
        this.yytext += v96[0];
        this.match += v96[0];
        this.matches = v96;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v96[0].length);
        this.matched += v96[0];
        v98 = this.performAction.call(this, this.yy, this, v97, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v98) {
          return v98;
        } else if (this._backtrack) {
          for (var v101 in v100) {
            this[v101] = v100[v101];
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
        var v102;
        var v103;
        var v104;
        var v105;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v106 = this._currentRules();
        for (var v107 = 0; v107 < v106.length; v107++) {
          v104 = this._input.match(this.rules[v106[v107]]);
          if (v104 && (!v103 || v104[0].length > v103[0].length)) {
            v103 = v104;
            v105 = v107;
            if (this.options.backtrack_lexer) {
              v102 = this.test_match(v104, v106[v107]);
              if (v102 !== false) {
                return v102;
              } else if (this._backtrack) {
                v103 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v103) {
          v102 = this.test_match(v103, v106[v105]);
          if (v102 !== false) {
            return v102;
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
      lex: v1(function v108() {
        var v109 = this.next();
        if (v109) {
          return v109;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v1(function v110(v111) {
        this.conditionStack.push(v111);
      }, "begin"),
      popState: v1(function v112() {
        var v113 = this.conditionStack.length - 1;
        if (v113 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v1(function v114() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v1(function v115(v116) {
        v116 = this.conditionStack.length - 1 - Math.abs(v116 || 0);
        if (v116 >= 0) {
          return this.conditionStack[v116];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v1(function v117(v118) {
        this.begin(v118);
      }, "pushState"),
      stateStackSize: v1(function v119() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v1(function v120(v121, v122, v123, v124) {
        switch (v123) {
          case 0:
            break;
          case 1:
            break;
          case 2:
            return 13;
          case 3:
            break;
          case 4:
            break;
          case 5:
            return 8;
          case 6:
            return 9;
          case 7:
            return 7;
          case 8:
            return 14;
          case 9:
            this.begin("acc_title");
            return 15;
          case 10:
            this.popState();
            return "acc_title_value";
          case 11:
            this.begin("acc_descr");
            return 17;
          case 12:
            this.popState();
            return "acc_descr_value";
          case 13:
            this.begin("acc_descr_multiline");
            break;
          case 14:
            this.popState();
            break;
          case 15:
            return "acc_descr_multiline_value";
          case 16:
            return 20;
          case 17:
            return 24;
          case 18:
            return 23;
          case 19:
            return 6;
          case 20:
            return "INVALID";
        }
      }, "anonymous"),
      rules: [/^(?:%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:#[^\n]*)/i, /^(?:timeline[ \t]+LR\b)/i, /^(?:timeline[ \t]+TD\b)/i, /^(?:timeline\b)/i, /^(?:title\s[^\n]+)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:section\s[^:\n]+)/i, /^(?::\s(?:[^:\n]|:(?!\s))+)/i, /^(?:[^#:\n]+)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: {
        acc_descr_multiline: {
          rules: [14, 15],
          inclusive: false
        },
        acc_descr: {
          rules: [12],
          inclusive: false
        },
        acc_title: {
          rules: [10],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 16, 17, 18, 19, 20],
          inclusive: true
        }
      }
    };
    return v78;
  }();
  v29.lexer = v77;
  function v125() {
    this.yy = {};
  }
  v1(v125, "Parser");
  v125.prototype = v29;
  v29.Parser = v125;
  return new v125();
}();
parser.parser = parser;
var timeline_default = parser;
var timelineDb_exports = {};
v12(timelineDb_exports, {
  addEvent: () => addEvent,
  addSection: () => addSection,
  addTask: () => addTask,
  addTaskOrg: () => addTaskOrg,
  clear: () => clear2,
  default: () => timelineDb_default,
  getCommonDb: () => getCommonDb,
  getDirection: () => getDirection,
  getSections: () => getSections,
  getTasks: () => getTasks,
  setDirection: () => setDirection
});
var currentSection = "";
var currentTaskId = 0;
var direction = "LR";
var sections = [];
var tasks = [];
var rawTasks = [];
var getCommonDb = v1(() => v13, "getCommonDb");
var clear2 = v1(function () {
  sections.length = 0;
  tasks.length = 0;
  currentSection = "";
  rawTasks.length = 0;
  direction = "LR";
  v14();
}, "clear");
var setDirection = v1(function (v126) {
  direction = v126;
}, "setDirection");
var getDirection = v1(function () {
  return direction;
}, "getDirection");
var addSection = v1(function (v127) {
  currentSection = v127;
  sections.push(v127);
}, "addSection");
var getSections = v1(function () {
  return sections;
}, "getSections");
var getTasks = v1(function () {
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
var addTask = v1(function (v131, v132, v133) {
  const v134 = {
    id: currentTaskId++,
    section: currentSection,
    type: currentSection,
    task: v131,
    score: v132 ? v132 : 0,
    events: v133 ? [v133] : []
  };
  rawTasks.push(v134);
}, "addTask");
var addEvent = v1(function (v135) {
  const v136 = rawTasks.find(v137 => v137.id === currentTaskId - 1);
  v136.events.push(v135);
}, "addEvent");
var addTaskOrg = v1(function (v138) {
  const v139 = {
    section: currentSection,
    type: currentSection,
    description: v138,
    task: v138,
    classes: []
  };
  tasks.push(v139);
}, "addTaskOrg");
var compileTasks = v1(function () {
  const v140 = v1(function (v141) {
    return rawTasks[v141].processed;
  }, "compileTask");
  let v142 = true;
  for (const [v143, v144] of rawTasks.entries()) {
    v140(v143);
    v142 = v142 && v144.processed;
  }
  return v142;
}, "compileTasks");
var timelineDb_default = {
  clear: clear2,
  getCommonDb: getCommonDb,
  getDirection: getDirection,
  setDirection: setDirection,
  addSection: addSection,
  getSections: getSections,
  getTasks: getTasks,
  addTask: addTask,
  addTaskOrg: addTaskOrg,
  addEvent: addEvent
};
var nodeCount = 0;
var drawRect = v1(function (v145, v146) {
  const v147 = v145.append("rect");
  v147.attr("x", v146.x);
  v147.attr("y", v146.y);
  v147.attr("fill", v146.fill);
  v147.attr("stroke", v146.stroke);
  v147.attr("width", v146.width);
  v147.attr("height", v146.height);
  v147.attr("rx", v146.rx);
  v147.attr("ry", v146.ry);
  if (v146.class !== undefined) {
    v147.attr("class", v146.class);
  }
  return v147;
}, "drawRect");
var drawFace = v1(function (v148, v149) {
  const v150 = 15;
  const v151 = v148.append("circle").attr("cx", v149.cx).attr("cy", v149.cy).attr("class", "face").attr("r", v150).attr("stroke-width", 2).attr("overflow", "visible");
  const v152 = v148.append("g");
  v152.append("circle").attr("cx", v149.cx - v150 / 3).attr("cy", v149.cy - v150 / 3).attr("r", 1.5).attr("stroke-width", 2).attr("fill", "#666").attr("stroke", "#666");
  v152.append("circle").attr("cx", v149.cx + v150 / 3).attr("cy", v149.cy - v150 / 3).attr("r", 1.5).attr("stroke-width", 2).attr("fill", "#666").attr("stroke", "#666");
  function v153(v154) {
    const v155 = v15().startAngle(Math.PI / 2).endAngle(Math.PI / 2 * 3).innerRadius(v150 / 2).outerRadius(v150 / 2.2);
    v154.append("path").attr("class", "mouth").attr("d", v155).attr("transform", "translate(" + v149.cx + "," + (v149.cy + 2) + ")");
  }
  v1(v153, "smile");
  function v156(v157) {
    const v158 = v15().startAngle(Math.PI * 3 / 2).endAngle(Math.PI / 2 * 5).innerRadius(v150 / 2).outerRadius(v150 / 2.2);
    v157.append("path").attr("class", "mouth").attr("d", v158).attr("transform", "translate(" + v149.cx + "," + (v149.cy + 7) + ")");
  }
  v1(v156, "sad");
  function v159(v160) {
    v160.append("line").attr("class", "mouth").attr("stroke", 2).attr("x1", v149.cx - 5).attr("y1", v149.cy + 7).attr("x2", v149.cx + 5).attr("y2", v149.cy + 7).attr("class", "mouth").attr("stroke-width", "1px").attr("stroke", "#666");
  }
  v1(v159, "ambivalent");
  if (v149.score > 3) {
    v153(v152);
  } else if (v149.score < 3) {
    v156(v152);
  } else {
    v159(v152);
  }
  return v151;
}, "drawFace");
var drawCircle = v1(function (v161, v162) {
  const v163 = v161.append("circle");
  v163.attr("cx", v162.cx);
  v163.attr("cy", v162.cy);
  v163.attr("class", "actor-" + v162.pos);
  v163.attr("fill", v162.fill);
  v163.attr("stroke", v162.stroke);
  v163.attr("r", v162.r);
  if (v163.class !== undefined) {
    v163.attr("class", v163.class);
  }
  if (v162.title !== undefined) {
    v163.append("title").text(v162.title);
  }
  return v163;
}, "drawCircle");
var drawText = v1(function (v164, v165) {
  const v166 = v165.text.replace(/<br\s*\/?>/gi, " ");
  const v167 = v164.append("text");
  v167.attr("x", v165.x);
  v167.attr("y", v165.y);
  v167.attr("class", "legend");
  v167.style("text-anchor", v165.anchor);
  if (v165.class !== undefined) {
    v167.attr("class", v165.class);
  }
  const v168 = v167.append("tspan");
  v168.attr("x", v165.x + v165.textMargin * 2);
  v168.text(v166);
  return v167;
}, "drawText");
var drawLabel = v1(function (v169, v170) {
  function v171(v172, v173, v174, v175, v176) {
    return v172 + "," + v173 + " " + (v172 + v174) + "," + v173 + " " + (v172 + v174) + "," + (v173 + v175 - v176) + " " + (v172 + v174 - v176 * 1.2) + "," + (v173 + v175) + " " + v172 + "," + (v173 + v175);
  }
  v1(v171, "genPoints");
  const v177 = v169.append("polygon");
  v177.attr("points", v171(v170.x, v170.y, 50, 20, 7));
  v177.attr("class", "labelBox");
  v170.y = v170.y + v170.labelMargin;
  v170.x = v170.x + v170.labelMargin * 0.5;
  drawText(v169, v170);
}, "drawLabel");
var drawSection = v1(function (v178, v179, v180) {
  const v181 = v178.append("g");
  const v182 = getNoteRect();
  v182.x = v179.x;
  v182.y = v179.y;
  v182.fill = v179.fill;
  v182.width = v180.width;
  v182.height = v180.height;
  v182.class = "journey-section section-type-" + v179.num;
  v182.rx = 3;
  v182.ry = 3;
  drawRect(v181, v182);
  _drawTextCandidateFunc(v180)(v179.text, v181, v182.x, v182.y, v182.width, v182.height, {
    class: "journey-section section-type-" + v179.num
  }, v180, v179.colour);
}, "drawSection");
var taskCount = -1;
var drawTask = v1(function (v183, v184, v185, v186) {
  const v187 = v184.x + v185.width / 2;
  const v188 = v183.append("g");
  taskCount++;
  const v189 = 450;
  v188.append("line").attr("id", v186 + "-task" + taskCount).attr("x1", v187).attr("y1", v184.y).attr("x2", v187).attr("y2", v189).attr("class", "task-line").attr("stroke-width", "1px").attr("stroke-dasharray", "4 2").attr("stroke", "#666");
  drawFace(v188, {
    cx: v187,
    cy: 300 + (5 - v184.score) * 30,
    score: v184.score
  });
  const v190 = getNoteRect();
  v190.x = v184.x;
  v190.y = v184.y;
  v190.fill = v184.fill;
  v190.width = v185.width;
  v190.height = v185.height;
  v190.class = "task task-type-" + v184.num;
  v190.rx = 3;
  v190.ry = 3;
  drawRect(v188, v190);
  _drawTextCandidateFunc(v185)(v184.task, v188, v190.x, v190.y, v190.width, v190.height, {
    class: "task"
  }, v185, v184.colour);
}, "drawTask");
var drawBackgroundRect = v1(function (v191, v192) {
  const v193 = drawRect(v191, {
    x: v192.startx,
    y: v192.starty,
    width: v192.stopx - v192.startx,
    height: v192.stopy - v192.starty,
    fill: v192.fill,
    class: "rect"
  });
  v193.lower();
}, "drawBackgroundRect");
var getTextObj = v1(function () {
  return {
    x: 0,
    y: 0,
    fill: undefined,
    "text-anchor": "start",
    width: 100,
    height: 100,
    textMargin: 0,
    rx: 0,
    ry: 0
  };
}, "getTextObj");
var getNoteRect = v1(function () {
  return {
    x: 0,
    y: 0,
    width: 100,
    anchor: "start",
    height: 100,
    rx: 0,
    ry: 0
  };
}, "getNoteRect");
var _drawTextCandidateFunc = function () {
  function v194(v195, v196, v197, v198, v199, v200, v201, v202) {
    const v203 = v196.append("text").attr("x", v197 + v199 / 2).attr("y", v198 + v200 / 2 + 5).style("font-color", v202).style("text-anchor", "middle").text(v195);
    v204(v203, v201);
  }
  v1(v194, "byText");
  function v205(v206, v207, v208, v209, v210, v211, v212, v213, v214) {
    const {
      taskFontSize: v215,
      taskFontFamily: v216
    } = v213;
    const v217 = v206.split(/<br\s*\/?>/gi);
    for (let v218 = 0; v218 < v217.length; v218++) {
      const v219 = v218 * v215 - v215 * (v217.length - 1) / 2;
      const v220 = v207.append("text").attr("x", v208 + v210 / 2).attr("y", v209).attr("fill", v214).style("text-anchor", "middle").style("font-size", v215).style("font-family", v216);
      v220.append("tspan").attr("x", v208 + v210 / 2).attr("dy", v219).text(v217[v218]);
      v220.attr("y", v209 + v211 / 2).attr("dominant-baseline", "central").attr("alignment-baseline", "central");
      v204(v220, v212);
    }
  }
  v1(v205, "byTspan");
  function v221(v222, v223, v224, v225, v226, v227, v228, v229) {
    const v230 = v223.append("switch");
    const v231 = v230.append("foreignObject").attr("x", v224).attr("y", v225).attr("width", v226).attr("height", v227).attr("position", "fixed");
    const v232 = v231.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
    v232.append("div").attr("class", "label").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").text(v222);
    v205(v222, v230, v224, v225, v226, v227, v228, v229);
    v204(v232, v228);
  }
  v1(v221, "byFo");
  function v204(v233, v234) {
    for (const v235 in v234) {
      if (v235 in v234) {
        v233.attr(v235, v234[v235]);
      }
    }
  }
  v1(v204, "_setTextAttrs");
  return function (v236) {
    if (v236.textPlacement === "fo") {
      return v221;
    } else if (v236.textPlacement === "old") {
      return v194;
    } else {
      return v205;
    }
  };
}();
var initGraphics = v1(function (v237, v238) {
  nodeCount = 0;
  taskCount = -1;
  v237.append("defs").append("marker").attr("id", v238 + "-arrowhead").attr("refX", 5).attr("refY", 2).attr("markerWidth", 6).attr("markerHeight", 4).attr("orient", "auto").append("path").attr("d", "M 0,0 V 4 L6,2 Z");
}, "initGraphics");
function wrap(v239, v240) {
  v239.each(function () {
    var v241 = v11(this);
    var v242 = v241.text().split(/(\s+|<br>)/).reverse();
    var v243;
    var v244 = [];
    var v245 = 1.1;
    var v246 = v241.attr("y");
    var v247 = parseFloat(v241.attr("dy"));
    var v248 = v241.text(null).append("tspan").attr("x", 0).attr("y", v246).attr("dy", v247 + "em");
    for (let v249 = 0; v249 < v242.length; v249++) {
      v243 = v242[v242.length - 1 - v249];
      v244.push(v243);
      v248.text(v244.join(" ").trim());
      if (v248.node().getComputedTextLength() > v240 || v243 === "<br>") {
        v244.pop();
        v248.text(v244.join(" ").trim());
        if (v243 === "<br>") {
          v244 = [""];
        } else {
          v244 = [v243];
        }
        v248 = v241.append("tspan").attr("x", 0).attr("y", v246).attr("dy", v245 + "em").text(v243);
      }
    }
  });
}
v1(wrap, "wrap");
var drawNode = v1(function (v250, v251, v252, v253, v254, v255 = false) {
  const {
    theme: v256,
    look: v257
  } = v253;
  const v258 = v256?.includes("redux");
  const v259 = v253?.themeVariables?.THEME_COLOR_LIMIT ?? 12;
  const v260 = v252 % v259 - 1;
  const v261 = v250.append("g");
  v251.section = v260;
  v261.attr("class", (v251.class ? v251.class + " " : "") + "timeline-node " + ("section-" + v260));
  const v262 = v261.append("g");
  const v263 = v261.append("g");
  const v264 = v263.append("text").text(v251.descr).attr("dy", "1em").attr("alignment-baseline", "middle").attr("dominant-baseline", "middle").attr("text-anchor", "middle").call(wrap, v251.width);
  const v265 = v264.node().getBBox();
  const v266 = v253.fontSize?.replace ? v253.fontSize.replace("px", "") : v253.fontSize;
  v251.height = v265.height + v266 * 1.1 * 0.5 + v251.padding;
  v251.height = Math.max(v251.height, v251.maxHeight);
  v251.width = v251.width + v251.padding * 2;
  v263.attr("transform", "translate(" + v251.width / 2 + ", " + v251.padding / 2 + ")");
  if (v258) {
    v263.attr("transform", "translate(" + v251.width / 2 + ", " + (v255 ? v251.padding / 2 + 3 : v251.padding) + ")");
  }
  defaultBkg(v262, v251, v260, v254, v253);
  if (v257 === "neo") {
    v261.attr("data-look", "neo");
    if (v258) {
      const v267 = v256.includes("dark");
      const v268 = v250.node()?.ownerSVGElement ?? v250.node();
      const v269 = v11(v268);
      const v270 = v269.attr("id") ?? "";
      const v271 = v270 ? v270 + "-drop-shadow" : "drop-shadow";
      if (v269.select("#" + v271).empty()) {
        const v272 = v269.select("defs");
        const v273 = v272.empty() ? v269.append("defs") : v272;
        v273.append("filter").attr("id", v271).attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", v267 ? "0.2" : "0.06").attr("flood-color", v267 ? "#FFFFFF" : "#000000");
      }
    }
  }
  return v251;
}, "drawNode");
var getVirtualNodeHeight = v1(function (v274, v275, v276) {
  const v277 = v274.append("g");
  const v278 = v277.append("text").text(v275.descr).attr("dy", "1em").attr("alignment-baseline", "middle").attr("dominant-baseline", "middle").attr("text-anchor", "middle").call(wrap, v275.width);
  const v279 = v278.node().getBBox();
  const v280 = v276.fontSize?.replace ? v276.fontSize.replace("px", "") : v276.fontSize;
  v277.remove();
  return v279.height + v280 * 1.1 * 0.5 + v275.padding;
}, "getVirtualNodeHeight");
var defaultBkg = v1(function (v281, v282, v283, v284, v285) {
  const {
    theme: v286
  } = v285;
  const v287 = v286?.includes("redux") ? 0 : 5;
  const v288 = 5;
  const v289 = v287 > 0 ? "M0 " + (v282.height - v288) + " v" + (-v282.height + v288 * 2) + " q0,-" + v287 + "," + v287 + ",-" + v287 + " h" + (v282.width - v288 * 2) + " q" + v287 + ",0," + v287 + "," + v287 + " v" + (v282.height - v288) + " H0 Z" : "M0 " + (v282.height - v288) + " v" + -(v282.height - v288) + " h" + v282.width + " v" + v282.height + " H0 Z";
  v281.append("path").attr("id", v284 + "-node-" + nodeCount++).attr("class", "node-bkg node-" + v282.type).attr("d", v289);
  if (!v286?.includes("redux")) {
    v281.append("line").attr("class", "node-line-" + v283).attr("x1", 0).attr("y1", v282.height).attr("x2", v282.width).attr("y2", v282.height);
  }
}, "defaultBkg");
var svgDraw_default = {
  drawRect: drawRect,
  drawCircle: drawCircle,
  drawSection: drawSection,
  drawText: drawText,
  drawLabel: drawLabel,
  drawTask: drawTask,
  drawBackgroundRect: drawBackgroundRect,
  getTextObj: getTextObj,
  getNoteRect: getNoteRect,
  initGraphics: initGraphics,
  drawNode: drawNode,
  getVirtualNodeHeight: getVirtualNodeHeight
};
var draw = v1(function (v290, v291, v292, v293) {
  const v294 = v6();
  const {
    look: v295,
    theme: v296,
    themeVariables: v297
  } = v294;
  const {
    useGradient: v298,
    gradientStart: v299,
    gradientStop: v300
  } = v297;
  const v301 = v294.timeline?.leftMargin ?? 50;
  v7.debug("timeline", v293.db);
  const v302 = v294.securityLevel;
  let v303;
  if (v302 === "sandbox") {
    v303 = v11("#i" + v291);
  }
  const v304 = v302 === "sandbox" ? v11(v303.nodes()[0].contentDocument.body) : v11("body");
  const v305 = v304.select("#" + v291);
  v305.append("g");
  const v306 = v293.db.getTasks();
  const v307 = v293.db.getCommonDb().getDiagramTitle();
  v7.debug("task", v306);
  svgDraw_default.initGraphics(v305, v291);
  const v308 = v293.db.getSections();
  v7.debug("sections", v308);
  let v309 = 0;
  let v310 = 0;
  let v311 = 0;
  let v312 = 0;
  let v313 = 50 + v301;
  let v314 = 50;
  v312 = 50;
  let v315 = 0;
  let v316 = true;
  v308.forEach(function (v317) {
    const v318 = {
      number: v315,
      descr: v317,
      section: v315,
      width: 150,
      padding: 20,
      maxHeight: v309
    };
    const v319 = svgDraw_default.getVirtualNodeHeight(v305, v318, v294);
    v7.debug("sectionHeight before draw", v319);
    v309 = Math.max(v309, v319 + 20);
  });
  let v320 = 0;
  let v321 = 0;
  v7.debug("tasks.length", v306.length);
  for (const [v322, v323] of v306.entries()) {
    const v324 = {
      number: v322,
      descr: v323,
      section: v323.section,
      width: 150,
      padding: 20,
      maxHeight: v310
    };
    const v325 = svgDraw_default.getVirtualNodeHeight(v305, v324, v294);
    v7.debug("taskHeight before draw", v325);
    v310 = Math.max(v310, v325 + 20);
    v320 = Math.max(v320, v323.events.length);
    let v326 = 0;
    for (const v327 of v323.events) {
      const v328 = {
        descr: v327,
        section: v323.section,
        number: v323.section,
        width: 150,
        padding: 20,
        maxHeight: 50
      };
      v326 += svgDraw_default.getVirtualNodeHeight(v305, v328, v294);
    }
    if (v323.events.length > 0) {
      v326 += (v323.events.length - 1) * 10;
    }
    v321 = Math.max(v321, v326);
  }
  v7.debug("maxSectionHeight before draw", v309);
  v7.debug("maxTaskHeight before draw", v310);
  if (v308 && v308.length > 0) {
    v308.forEach(v329 => {
      const v330 = v306.filter(v331 => v331.section === v329);
      const v332 = {
        number: v315,
        descr: v329,
        section: v315,
        width: Math.max(v330.length, 1) * 200 - 50,
        padding: 20,
        maxHeight: v309
      };
      v7.debug("sectionNode", v332);
      const v333 = v305.append("g");
      const v334 = svgDraw_default.drawNode(v333, v332, v315, v294, v291);
      v7.debug("sectionNode output", v334);
      v333.attr("transform", "translate(" + v313 + ", " + v312 + ")");
      v314 += v309 + 50;
      if (v330.length > 0) {
        drawTasks(v305, v330, v315, v313, v314, v310, v294, v320, v321, v309, false, v291);
      }
      v313 += Math.max(v330.length, 1) * 200;
      v314 = v312;
      v315++;
    });
  } else {
    v316 = false;
    drawTasks(v305, v306, v315, v313, v314, v310, v294, v320, v321, v309, true, v291);
  }
  const v335 = v305.node().getBBox();
  v7.debug("bounds", v335);
  if (v307) {
    v305.append("text").text(v307).attr("x", v295 === "neo" ? v335.x * 2 + v301 : v335.width / 2 - v301).attr("font-size", "4ex").attr("font-weight", "bold").attr("y", 20);
  }
  v311 = v316 ? v309 + v310 + 150 : v310 + 100;
  const v336 = v305.append("g").attr("class", "lineWrapper");
  v336.append("line").attr("x1", v301).attr("y1", v311).attr("x2", v335.width + v301 * 3).attr("y2", v311).attr("stroke-width", 4).attr("stroke", "black").attr("marker-end", "url(#" + v291 + "-arrowhead)");
  if (v295 === "neo" && v298 && v296 !== "neutral") {
    const v337 = v305.select("defs");
    const v338 = v337.empty() ? v305.append("defs") : v337;
    const v339 = v338.append("linearGradient").attr("id", v305.attr("id") + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    v339.append("stop").attr("offset", "0%").attr("stop-color", v299).attr("stop-opacity", 1);
    v339.append("stop").attr("offset", "100%").attr("stop-color", v300).attr("stop-opacity", 1);
  }
  v10(undefined, v305, v294.timeline?.padding ?? 50, v294.timeline?.useMaxWidth ?? false);
}, "draw");
var drawTasks = v1(function (v340, v341, v342, v343, v344, v345, v346, v347, v348, v349, v350, v351) {
  for (const v352 of v341) {
    const v353 = {
      descr: v352.task,
      section: v342,
      number: v342,
      width: 150,
      padding: 20,
      maxHeight: v345
    };
    v7.debug("taskNode", v353);
    const v354 = v340.append("g").attr("class", "taskWrapper");
    const v355 = svgDraw_default.drawNode(v354, v353, v342, v346, v351);
    const v356 = v355.height;
    v7.debug("taskHeight after draw", v356);
    v354.attr("transform", "translate(" + v343 + ", " + v344 + ")");
    v345 = Math.max(v345, v356);
    if (v352.events) {
      const v357 = v340.append("g").attr("class", "lineWrapper");
      let v358 = v345;
      v344 += 100;
      v358 = v358 + drawEvents(v340, v352.events, v342, v343, v344, v346, v351);
      v344 -= 100;
      v357.append("line").attr("x1", v343 + 95).attr("y1", v344 + v345).attr("x2", v343 + 95).attr("y2", v344 + v345 + 100 + v348 + 100).attr("stroke-width", 2).attr("stroke", "black").attr("marker-end", "url(#" + v351 + "-arrowhead)").attr("stroke-dasharray", "5,5");
    }
    v343 = v343 + 200;
    if (v350 && !v346.timeline?.disableMulticolor) {
      v342++;
    }
  }
  v344 = v344 - 10;
}, "drawTasks");
var drawEvents = v1(function (v359, v360, v361, v362, v363, v364, v365) {
  let v366 = 0;
  const v367 = v363;
  v363 = v363 + 100;
  for (const v368 of v360) {
    const v369 = {
      descr: v368,
      section: v361,
      number: v361,
      width: 150,
      padding: 20,
      maxHeight: 50
    };
    v7.debug("eventNode", v369);
    const v370 = v359.append("g").attr("class", "eventWrapper");
    const v371 = svgDraw_default.drawNode(v370, v369, v361, v364, v365, true);
    const v372 = v371.height;
    v366 = v366 + v372;
    v370.attr("transform", "translate(" + v362 + ", " + v363 + ")");
    v363 = v363 + 10 + v372;
  }
  v363 = v367;
  return v366;
}, "drawEvents");
var timelineRenderer_default = {
  setConf: v1(() => {}, "setConf"),
  draw: draw
};
var NODE_WIDTH = 200;
var NODE_PADDING = 5;
var NODE_TOTAL_WIDTH = NODE_WIDTH + NODE_PADDING * 2;
var EVENT_WIDTH = NODE_WIDTH + 100;
var EVENT_TOTAL_WIDTH = EVENT_WIDTH + NODE_PADDING * 2;
var EVENT_SPACING = 10;
var EVENT_VERTICAL_GAP = 0;
var SECTION_TASK_GAP = 20;
var TASK_AXIS_GAP = 20;
var TASK_VERTICAL_GAP = 30;
var EVENT_AXIS_GAP = 50;
var draw2 = v1(function (v373, v374, v375, v376) {
  const v377 = v6();
  const v378 = v377.timeline?.leftMargin ?? 50;
  v7.debug("timeline", v376.db);
  const v379 = v8(v374);
  v379.append("g");
  const v380 = v376.db.getTasks();
  const v381 = v376.db.getCommonDb().getDiagramTitle();
  v7.debug("task", v380);
  svgDraw_default.initGraphics(v379);
  const v382 = v376.db.getSections();
  v7.debug("sections", v382);
  let v383 = 0;
  let v384 = 0;
  const v385 = 50 + v378;
  let v386 = 50;
  const v387 = v386;
  const v388 = v385;
  const v389 = NODE_TOTAL_WIDTH + TASK_AXIS_GAP;
  const v390 = EVENT_TOTAL_WIDTH + EVENT_AXIS_GAP;
  const v391 = v388 + v389;
  let v392 = 0;
  const v393 = v382 && v382.length > 0;
  const v394 = v393 ? v391 : v385 + v389;
  const v395 = Math.max(50, v389 + v390 - NODE_PADDING * 2);
  v382.forEach(function (v396) {
    const v397 = {
      number: v392,
      descr: v396,
      section: v392,
      width: v395,
      padding: NODE_PADDING,
      maxHeight: v383
    };
    const v398 = svgDraw_default.getVirtualNodeHeight(v379, v397, v377);
    v7.debug("sectionHeight before draw", v398);
    v383 = Math.max(v383, v398);
  });
  let v399 = 0;
  v7.debug("tasks.length", v380.length);
  for (const [v400, v401] of v380.entries()) {
    const v402 = {
      number: v400,
      descr: v401,
      section: v401.section,
      width: NODE_WIDTH,
      padding: NODE_PADDING,
      maxHeight: v384
    };
    const v403 = svgDraw_default.getVirtualNodeHeight(v379, v402, v377);
    v7.debug("taskHeight before draw", v403);
    v384 = Math.max(v384, v403);
    let v404 = 0;
    for (const v405 of v401.events) {
      const v406 = {
        descr: v405,
        section: v401.section,
        number: v401.section,
        width: EVENT_WIDTH,
        padding: NODE_PADDING,
        maxHeight: 50
      };
      v404 += svgDraw_default.getVirtualNodeHeight(v379, v406, v377);
    }
    if (v401.events.length > 0) {
      v404 += (v401.events.length - 1) * EVENT_SPACING;
    }
    v399 = Math.max(v399, v404) + EVENT_VERTICAL_GAP;
  }
  v7.debug("maxSectionHeight before draw", v383);
  v7.debug("maxTaskHeight before draw", v384);
  const v407 = Math.max(v384, v399);
  const v408 = v407 + TASK_VERTICAL_GAP;
  if (v393) {
    v382.forEach(v409 => {
      const v410 = v380.filter(v411 => v411.section === v409);
      const v412 = {
        number: v392,
        descr: v409,
        section: v392,
        width: v395,
        padding: NODE_PADDING,
        maxHeight: v383
      };
      v7.debug("sectionNode", v412);
      const v413 = v379.append("g");
      const v414 = svgDraw_default.drawNode(v413, v412, v392, v377);
      v7.debug("sectionNode output", v414);
      const v415 = v394 - v389;
      v413.attr("transform", "translate(" + v415 + ", " + v386 + ")");
      const v416 = v386 + v414.height + SECTION_TASK_GAP;
      if (v410.length > 0) {
        drawTasks2(v379, v410, v392, v394, v416, v384, v377, v408, false);
      }
      const v417 = v410.length;
      const v418 = v414.height + SECTION_TASK_GAP + v408 * Math.max(v417, 1) - (v417 > 0 ? TASK_VERTICAL_GAP * 2 : 0);
      v386 += v418;
      v392++;
    });
  } else {
    drawTasks2(v379, v380, v392, v394, v386, v384, v377, v408, true);
  }
  let v419 = v379.node()?.getBBox();
  if (!v419) {
    throw new Error("bbox not found");
  }
  v7.debug("bounds", v419);
  if (v381) {
    v379.append("text").text(v381).attr("x", v419.width / 2 - v378).attr("font-size", "4ex").attr("font-weight", "bold").attr("y", 20);
    v419 = v379.node()?.getBBox();
    if (!v419) {
      throw new Error("bbox not found");
    }
    v7.debug("bounds after title", v419);
  }
  const [v420] = v9(v377.fontSize);
  const v421 = (v420 ?? 16) * 2;
  const v422 = (v420 ?? 16) * 0.5 + 20;
  const v423 = v379.append("g").attr("class", "lineWrapper");
  v423.append("line").attr("x1", v394).attr("y1", v387 - v421).attr("x2", v394).attr("y2", v419.y + v419.height + v422).attr("stroke-width", 4).attr("stroke", "black").attr("marker-end", "url(#arrowhead)");
  v423.lower();
  v10(undefined, v379, v377.timeline?.padding ?? 50, v377.timeline?.useMaxWidth ?? false);
}, "draw");
var drawTasks2 = v1(function (v424, v425, v426, v427, v428, v429, v430, v431, v432) {
  for (const v433 of v425) {
    const v434 = {
      descr: v433.task,
      section: v426,
      number: v426,
      width: NODE_WIDTH,
      padding: NODE_PADDING,
      maxHeight: v429
    };
    v7.debug("taskNode", v434);
    const v435 = v424.append("g").attr("class", "taskWrapper");
    const v436 = svgDraw_default.drawNode(v435, v434, v426, v430);
    const v437 = v436.height;
    v7.debug("taskHeight after draw", v437);
    const v438 = v427 - TASK_AXIS_GAP - v436.width;
    v435.attr("transform", "translate(" + v438 + ", " + v428 + ")");
    v429 = Math.max(v429, v437);
    if (v433.events && v433.events.length > 0) {
      const v439 = v428;
      const v440 = v427 + EVENT_AXIS_GAP;
      drawEvents2(v424, v433.events, v426, v427, v440, v439, v430);
    }
    v428 = v428 + v431;
    if (v432 && !v430.timeline?.disableMulticolor) {
      v426++;
    }
  }
}, "drawTasks");
var drawEvents2 = v1(function (v441, v442, v443, v444, v445, v446, v447) {
  let v448 = v446;
  for (const v449 of v442) {
    const v450 = {
      descr: v449,
      section: v443,
      number: v443,
      width: EVENT_WIDTH,
      padding: NODE_PADDING,
      maxHeight: 0
    };
    v7.debug("eventNode", v450);
    const v451 = v441.append("g").attr("class", "eventWrapper");
    const v452 = svgDraw_default.drawNode(v451, v450, v443, v447);
    const v453 = v452.height;
    v451.attr("transform", "translate(" + v445 + ", " + v448 + ")");
    const v454 = v441.append("g").attr("class", "lineWrapper");
    const v455 = v448 + v453 / 2;
    v454.append("line").attr("x1", v444).attr("y1", v455).attr("x2", v445).attr("y2", v455).attr("stroke-width", 2).attr("stroke", "black").attr("marker-end", "url(#arrowhead)").attr("stroke-dasharray", "5,5");
    v448 = v448 + v453 + EVENT_SPACING;
  }
  return v448 - v446;
}, "drawEvents");
var timelineRendererVertical_default = {
  setConf: v1(() => {}, "setConf"),
  draw: draw2
};
var genReduxSections = v1(v456 => {
  const {
    theme: v457
  } = v2();
  const v458 = v457?.includes("dark");
  const v459 = v457?.includes("color");
  const v460 = v456.svgId?.replace(/^#/, "") ?? "";
  const v461 = v460 ? "url(#" + v460 + "-drop-shadow)" : v456.dropShadow ?? "none";
  let v462 = "";
  for (let v463 = 0; v463 < v456.THEME_COLOR_LIMIT; v463++) {
    const v464 = "" + (17 - v463 * 3);
    const v465 = v459 ? v456.borderColorArray[v463] : v456.mainBkg;
    const v466 = v459 ? v456.borderColorArray[v463] : v456.nodeBorder;
    v462 += "\n    .section-" + (v463 - 1) + " rect,\n    .section-" + (v463 - 1) + " path,\n    .section-" + (v463 - 1) + " circle {\n      fill: " + (v458 && v459 ? v456.mainBkg : v465) + ";\n      stroke: " + v466 + ";\n      stroke-width: " + v456.strokeWidth + ";\n      filter: " + v461 + ";\n    }\n\n    .section-" + (v463 - 1) + " text {\n      fill: " + v456.nodeBorder + ";\n      font-weight: " + v456.fontWeight + "\n    }\n\n    .node-icon-" + (v463 - 1) + " {\n      font-size: 40px;\n      color: " + v456["cScaleLabel" + v463] + ";\n    }\n\n    .section-edge-" + (v463 - 1) + " {\n      stroke: " + v456["cScale" + v463] + ";\n    }\n\n    .edge-depth-" + (v463 - 1) + " {\n      stroke-width: " + v464 + ";\n    }\n\n    .section-" + (v463 - 1) + " line {\n      stroke: " + v456["cScaleInv" + v463] + ";\n      stroke-width: 3;\n    }\n\n    .lineWrapper line {\n      stroke: " + v456.nodeBorder + ";\n      stroke-width:" + v456.strokeWidth + "\n    }\n\n    .disabled,\n    .disabled circle,\n    .disabled text {\n      fill: " + (v456.tertiaryColor ?? "lightgray") + ";\n    }\n\n    .disabled text {\n      fill: " + (v456.clusterBorder ?? "#efefef") + ";\n    }\n    ";
  }
  return v462;
}, "genReduxSections");
var genSections = v1(v467 => {
  let v468 = "";
  for (let v469 = 0; v469 < v467.THEME_COLOR_LIMIT; v469++) {
    v467["lineColor" + v469] = v467["lineColor" + v469] || v467["cScaleInv" + v469];
    if (v3(v467["lineColor" + v469])) {
      v467["lineColor" + v469] = v4(v467["lineColor" + v469], 20);
    } else {
      v467["lineColor" + v469] = v5(v467["lineColor" + v469], 20);
    }
  }
  for (let v470 = 0; v470 < v467.THEME_COLOR_LIMIT; v470++) {
    const v471 = "" + (17 - v470 * 3);
    v468 += "\n    .section-" + (v470 - 1) + " rect, .section-" + (v470 - 1) + " path, .section-" + (v470 - 1) + " circle, .section-" + (v470 - 1) + " path  {\n      fill: " + v467["cScale" + v470] + ";\n    }\n    .section-" + (v470 - 1) + " text {\n     fill: " + v467["cScaleLabel" + v470] + ";\n    }\n    .node-icon-" + (v470 - 1) + " {\n      font-size: 40px;\n      color: " + v467["cScaleLabel" + v470] + ";\n    }\n    .section-edge-" + (v470 - 1) + "{\n      stroke: " + v467["cScale" + v470] + ";\n    }\n    .edge-depth-" + (v470 - 1) + "{\n      stroke-width: " + v471 + ";\n    }\n    .section-" + (v470 - 1) + " line {\n      stroke: " + v467["cScaleInv" + v470] + " ;\n      stroke-width: 3;\n    }\n\n    .lineWrapper line{\n      stroke: " + v467["cScaleLabel" + v470] + " ;\n    }\n\n    .disabled, .disabled circle, .disabled text {\n      fill: " + (v467.tertiaryColor ?? "lightgray") + ";\n    }\n    .disabled text {\n      fill: " + (v467.clusterBorder ?? "#efefef") + ";\n    }\n    ";
  }
  return v468;
}, "genSections");
var getStyles = v1(v472 => {
  const {
    theme: v473
  } = v2();
  const v474 = v473?.includes("redux");
  const v475 = v473 === "neutral";
  const v476 = v472.svgId?.replace(/^#/, "") ?? "";
  let v477 = "";
  if (v472.useGradient && v476 && v472.THEME_COLOR_LIMIT && !v475) {
    for (let v478 = 0; v478 < v472.THEME_COLOR_LIMIT; v478++) {
      v477 += "\n      .section-" + (v478 - 1) + "[data-look=\"neo\"] rect,\n      .section-" + (v478 - 1) + "[data-look=\"neo\"] path,\n      .section-" + (v478 - 1) + "[data-look=\"neo\"] circle {\n        fill: " + v472.mainBkg + ";\n        stroke: url(#" + v476 + "-gradient);\n        stroke-width: 2;\n      }\n      .section-" + (v478 - 1) + "[data-look=\"neo\"] line {\n        stroke: url(#" + v476 + "-gradient);\n        stroke-width: 2;\n      }";
    }
  }
  return "\n  .edge {\n    stroke-width: 3;\n  }\n  " + (v474 ? genReduxSections(v472) : genSections(v472)) + "\n  " + v477 + "\n  .section-root rect, .section-root path, .section-root circle  {\n    fill: " + v472.git0 + ";\n  }\n  .section-root text {\n    fill: " + v472.gitBranchLabel0 + ";\n  }\n  .icon-container {\n    height:100%;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n  }\n  .edge {\n    fill: none;\n  }\n  .eventWrapper  {\n   filter: brightness(120%);\n  }\n";
}, "getStyles");
var styles_default = getStyles;
var rendererSelector = {
  setConf: v1(() => {}, "setConf"),
  draw: v1((v479, v480, v481, v482) => {
    const v483 = v482?.db?.getDirection?.() ?? "LR";
    if (v483 === "TD") {
      return timelineRendererVertical_default.draw(v479, v480, v481, v482);
    }
    return timelineRenderer_default.draw(v479, v480, v481, v482);
  }, "draw")
};
var diagram = {
  db: timelineDb_exports,
  renderer: rendererSelector,
  parser: timeline_default,
  styles: styles_default
};
export { diagram };