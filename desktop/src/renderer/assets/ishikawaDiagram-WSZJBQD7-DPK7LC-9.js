import { _ as v1, c as v2, K as v3, D as v4, al as v5, p as v6, k as v7, n as v8, a as v9, b as v10, g as v11, s as v12, o as v13, e as v14 } from "./index-CXb3UsfP.js";
var parser = function () {
  var v15 = v1(function (v16, v17, v18, v19) {
    v18 = v18 || {};
    v19 = v16.length;
    for (; v19--; v18[v16[v19]] = v17);
    return v18;
  }, "o");
  var v20 = [1, 4];
  var v21 = [1, 14];
  var v22 = [1, 12];
  var v23 = [1, 13];
  var v24 = [6, 7, 8];
  var v25 = [1, 20];
  var v26 = [1, 18];
  var v27 = [1, 19];
  var v28 = [6, 7, 11];
  var v29 = [1, 6, 13, 14];
  var v30 = [1, 23];
  var v31 = [1, 24];
  var v32 = [1, 6, 7, 11, 13, 14];
  var v33 = {
    trace: v1(function v34() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      ishikawa: 4,
      spaceLines: 5,
      SPACELINE: 6,
      NL: 7,
      ISHIKAWA: 8,
      document: 9,
      stop: 10,
      EOF: 11,
      statement: 12,
      SPACELIST: 13,
      TEXT: 14,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      6: "SPACELINE",
      7: "NL",
      8: "ISHIKAWA",
      11: "EOF",
      13: "SPACELIST",
      14: "TEXT"
    },
    productions_: [0, [3, 1], [3, 2], [5, 1], [5, 2], [5, 2], [4, 2], [4, 3], [10, 1], [10, 1], [10, 1], [10, 2], [10, 2], [9, 3], [9, 2], [12, 2], [12, 1], [12, 1], [12, 1]],
    performAction: v1(function v35(v36, v37, v38, v39, v40, v41, v42) {
      var v43 = v41.length - 1;
      switch (v40) {
        case 6:
        case 7:
          return v39;
        case 15:
          v39.addNode(v41[v43 - 1].length, v41[v43].trim());
          break;
        case 16:
          v39.addNode(0, v41[v43].trim());
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: 2,
      5: 3,
      6: [1, 5],
      8: v20
    }, {
      1: [3]
    }, {
      1: [2, 1]
    }, {
      4: 6,
      6: [1, 7],
      7: [1, 8],
      8: v20
    }, {
      6: v21,
      7: [1, 10],
      9: 9,
      12: 11,
      13: v22,
      14: v23
    }, v15(v24, [2, 3]), {
      1: [2, 2]
    }, v15(v24, [2, 4]), v15(v24, [2, 5]), {
      1: [2, 6],
      6: v21,
      12: 15,
      13: v22,
      14: v23
    }, {
      6: v21,
      9: 16,
      12: 11,
      13: v22,
      14: v23
    }, {
      6: v25,
      7: v26,
      10: 17,
      11: v27
    }, v15(v28, [2, 18], {
      14: [1, 21]
    }), v15(v28, [2, 16]), v15(v28, [2, 17]), {
      6: v25,
      7: v26,
      10: 22,
      11: v27
    }, {
      1: [2, 7],
      6: v21,
      12: 15,
      13: v22,
      14: v23
    }, v15(v29, [2, 14], {
      7: v30,
      11: v31
    }), v15(v32, [2, 8]), v15(v32, [2, 9]), v15(v32, [2, 10]), v15(v28, [2, 15]), v15(v29, [2, 13], {
      7: v30,
      11: v31
    }), v15(v32, [2, 11]), v15(v32, [2, 12])],
    defaultActions: {
      2: [2, 1],
      6: [2, 2]
    },
    parseError: v1(function v44(v45, v46) {
      if (v46.recoverable) {
        this.trace(v45);
      } else {
        var v47 = new Error(v45);
        v47.hash = v46;
        throw v47;
      }
    }, "parseError"),
    parse: v1(function v48(v49) {
      var v50 = this;
      var v51 = [0];
      var v52 = [];
      var v53 = [null];
      var v54 = [];
      var v55 = this.table;
      var v56 = "";
      var v57 = 0;
      var v58 = 0;
      var v59 = 2;
      var v60 = 1;
      var v61 = v54.slice.call(arguments, 1);
      var v62 = Object.create(this.lexer);
      var v63 = {
        yy: {}
      };
      for (var v64 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v64)) {
          v63.yy[v64] = this.yy[v64];
        }
      }
      v62.setInput(v49, v63.yy);
      v63.yy.lexer = v62;
      v63.yy.parser = this;
      if (typeof v62.yylloc == "undefined") {
        v62.yylloc = {};
      }
      var v65 = v62.yylloc;
      v54.push(v65);
      var v66 = v62.options && v62.options.ranges;
      if (typeof v63.yy.parseError === "function") {
        this.parseError = v63.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v67(v68) {
        v51.length = v51.length - v68 * 2;
        v53.length = v53.length - v68;
        v54.length = v54.length - v68;
      }
      v1(v67, "popStack");
      function v69() {
        var v70;
        v70 = v52.pop() || v62.lex() || v60;
        if (typeof v70 !== "number") {
          if (v70 instanceof Array) {
            v52 = v70;
            v70 = v52.pop();
          }
          v70 = v50.symbols_[v70] || v70;
        }
        return v70;
      }
      v1(v69, "lex");
      var v71;
      var v72;
      var v73;
      var v74;
      var v75 = {};
      var v76;
      var v77;
      var v78;
      var v79;
      while (true) {
        v72 = v51[v51.length - 1];
        if (this.defaultActions[v72]) {
          v73 = this.defaultActions[v72];
        } else {
          if (v71 === null || typeof v71 == "undefined") {
            v71 = v69();
          }
          v73 = v55[v72] && v55[v72][v71];
        }
        if (typeof v73 === "undefined" || !v73.length || !v73[0]) {
          var v80 = "";
          v79 = [];
          for (v76 in v55[v72]) {
            if (this.terminals_[v76] && v76 > v59) {
              v79.push("'" + this.terminals_[v76] + "'");
            }
          }
          if (v62.showPosition) {
            v80 = "Parse error on line " + (v57 + 1) + ":\n" + v62.showPosition() + "\nExpecting " + v79.join(", ") + ", got '" + (this.terminals_[v71] || v71) + "'";
          } else {
            v80 = "Parse error on line " + (v57 + 1) + ": Unexpected " + (v71 == v60 ? "end of input" : "'" + (this.terminals_[v71] || v71) + "'");
          }
          this.parseError(v80, {
            text: v62.match,
            token: this.terminals_[v71] || v71,
            line: v62.yylineno,
            loc: v65,
            expected: v79
          });
        }
        if (v73[0] instanceof Array && v73.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v72 + ", token: " + v71);
        }
        switch (v73[0]) {
          case 1:
            v51.push(v71);
            v53.push(v62.yytext);
            v54.push(v62.yylloc);
            v51.push(v73[1]);
            v71 = null;
            {
              v58 = v62.yyleng;
              v56 = v62.yytext;
              v57 = v62.yylineno;
              v65 = v62.yylloc;
            }
            break;
          case 2:
            v77 = this.productions_[v73[1]][1];
            v75.$ = v53[v53.length - v77];
            v75._$ = {
              first_line: v54[v54.length - (v77 || 1)].first_line,
              last_line: v54[v54.length - 1].last_line,
              first_column: v54[v54.length - (v77 || 1)].first_column,
              last_column: v54[v54.length - 1].last_column
            };
            if (v66) {
              v75._$.range = [v54[v54.length - (v77 || 1)].range[0], v54[v54.length - 1].range[1]];
            }
            v74 = this.performAction.apply(v75, [v56, v58, v57, v63.yy, v73[1], v53, v54].concat(v61));
            if (typeof v74 !== "undefined") {
              return v74;
            }
            if (v77) {
              v51 = v51.slice(0, v77 * -1 * 2);
              v53 = v53.slice(0, v77 * -1);
              v54 = v54.slice(0, v77 * -1);
            }
            v51.push(this.productions_[v73[1]][0]);
            v53.push(v75.$);
            v54.push(v75._$);
            v78 = v55[v51[v51.length - 2]][v51[v51.length - 1]];
            v51.push(v78);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v81 = function () {
    var v82 = {
      EOF: 1,
      parseError: v1(function v83(v84, v85) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v84, v85);
        } else {
          throw new Error(v84);
        }
      }, "parseError"),
      setInput: v1(function (v86, v87) {
        this.yy = v87 || this.yy || {};
        this._input = v86;
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
        var v88 = this._input[0];
        this.yytext += v88;
        this.yyleng++;
        this.offset++;
        this.match += v88;
        this.matched += v88;
        var v89 = v88.match(/(?:\r\n?|\n).*/g);
        if (v89) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v88;
      }, "input"),
      unput: v1(function (v90) {
        var v91 = v90.length;
        var v92 = v90.split(/(?:\r\n?|\n)/g);
        this._input = v90 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v91);
        this.offset -= v91;
        var v93 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v92.length - 1) {
          this.yylineno -= v92.length - 1;
        }
        var v94 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v92 ? (v92.length === v93.length ? this.yylloc.first_column : 0) + v93[v93.length - v92.length].length - v92[0].length : this.yylloc.first_column - v91
        };
        if (this.options.ranges) {
          this.yylloc.range = [v94[0], v94[0] + this.yyleng - v91];
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
      less: v1(function (v95) {
        this.unput(this.match.slice(v95));
      }, "less"),
      pastInput: v1(function () {
        var v96 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v96.length > 20 ? "..." : "") + v96.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v1(function () {
        var v97 = this.match;
        if (v97.length < 20) {
          v97 += this._input.substr(0, 20 - v97.length);
        }
        return (v97.substr(0, 20) + (v97.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v1(function () {
        var v98 = this.pastInput();
        var v99 = new Array(v98.length + 1).join("-");
        return v98 + this.upcomingInput() + "\n" + v99 + "^";
      }, "showPosition"),
      test_match: v1(function (v100, v101) {
        var v102;
        var v103;
        var v104;
        if (this.options.backtrack_lexer) {
          v104 = {
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
            v104.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v103 = v100[0].match(/(?:\r\n?|\n).*/g);
        if (v103) {
          this.yylineno += v103.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v103 ? v103[v103.length - 1].length - v103[v103.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v100[0].length
        };
        this.yytext += v100[0];
        this.match += v100[0];
        this.matches = v100;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v100[0].length);
        this.matched += v100[0];
        v102 = this.performAction.call(this, this.yy, this, v101, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v102) {
          return v102;
        } else if (this._backtrack) {
          for (var v105 in v104) {
            this[v105] = v104[v105];
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
        var v106;
        var v107;
        var v108;
        var v109;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v110 = this._currentRules();
        for (var v111 = 0; v111 < v110.length; v111++) {
          v108 = this._input.match(this.rules[v110[v111]]);
          if (v108 && (!v107 || v108[0].length > v107[0].length)) {
            v107 = v108;
            v109 = v111;
            if (this.options.backtrack_lexer) {
              v106 = this.test_match(v108, v110[v111]);
              if (v106 !== false) {
                return v106;
              } else if (this._backtrack) {
                v107 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v107) {
          v106 = this.test_match(v107, v110[v109]);
          if (v106 !== false) {
            return v106;
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
      lex: v1(function v112() {
        var v113 = this.next();
        if (v113) {
          return v113;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v1(function v114(v115) {
        this.conditionStack.push(v115);
      }, "begin"),
      popState: v1(function v116() {
        var v117 = this.conditionStack.length - 1;
        if (v117 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v1(function v118() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v1(function v119(v120) {
        v120 = this.conditionStack.length - 1 - Math.abs(v120 || 0);
        if (v120 >= 0) {
          return this.conditionStack[v120];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v1(function v121(v122) {
        this.begin(v122);
      }, "pushState"),
      stateStackSize: v1(function v123() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v1(function v124(v125, v126, v127, v128) {
        switch (v127) {
          case 0:
            return 6;
          case 1:
            return 8;
          case 2:
            return 8;
          case 3:
            return 6;
          case 4:
            return 7;
          case 5:
            return 13;
          case 6:
            return 14;
          case 7:
            return 11;
        }
      }, "anonymous"),
      rules: [/^(?:\s*%%.*)/i, /^(?:ishikawa-beta\b)/i, /^(?:ishikawa\b)/i, /^(?:[\s]+[\n])/i, /^(?:[\n]+)/i, /^(?:[\s]+)/i, /^(?:[^\n]+)/i, /^(?:$)/i],
      conditions: {
        INITIAL: {
          rules: [0, 1, 2, 3, 4, 5, 6, 7],
          inclusive: true
        }
      }
    };
    return v82;
  }();
  v33.lexer = v81;
  function v129() {
    this.yy = {};
  }
  v1(v129, "Parser");
  v129.prototype = v33;
  v33.Parser = v129;
  return new v129();
}();
parser.parser = parser;
var ishikawa_default = parser;
var IshikawaDB = class {
  constructor() {
    this.stack = [];
    this.clear = this.clear.bind(this);
    this.addNode = this.addNode.bind(this);
    this.getRoot = this.getRoot.bind(this);
  }
  static {
    v1(this, "IshikawaDB");
  }
  clear() {
    this.root = undefined;
    this.stack = [];
    this.baseLevel = undefined;
    v6();
  }
  getRoot() {
    return this.root;
  }
  addNode(v130, v131) {
    const v132 = v7.sanitizeText(v131, v2());
    if (!this.root) {
      this.root = {
        text: v132,
        children: []
      };
      this.stack = [{
        level: 0,
        node: this.root
      }];
      v8(v132);
      return;
    }
    this.baseLevel ??= v130;
    let v133 = v130 - this.baseLevel + 1;
    if (v133 <= 0) {
      v133 = 1;
    }
    while (this.stack.length > 1 && this.stack[this.stack.length - 1].level >= v133) {
      this.stack.pop();
    }
    const v134 = this.stack[this.stack.length - 1].node;
    const v135 = {
      text: v132,
      children: []
    };
    v134.children.push(v135);
    this.stack.push({
      level: v133,
      node: v135
    });
  }
  getAccTitle() {
    return v9();
  }
  setAccTitle(v136) {
    v10(v136);
  }
  getAccDescription() {
    return v11();
  }
  setAccDescription(v137) {
    v12(v137);
  }
  getDiagramTitle() {
    return v13();
  }
  setDiagramTitle(v138) {
    v8(v138);
  }
};
var FONT_SIZE_DEFAULT = 14;
var SPINE_BASE_LENGTH = 250;
var BONE_STUB = 30;
var BONE_BASE = 60;
var BONE_PER_CHILD = 5;
var ANGLE = Math.PI * 82 / 180;
var COS_A = Math.cos(ANGLE);
var SIN_A = Math.sin(ANGLE);
var applyPaddedViewBox = v1((v139, v140, v141) => {
  const v142 = v139.node().getBBox();
  const v143 = v142.width + v140 * 2;
  const v144 = v142.height + v140 * 2;
  v14(v139, v144, v143, v141);
  v139.attr("viewBox", v142.x - v140 + " " + (v142.y - v140) + " " + v143 + " " + v144);
}, "applyPaddedViewBox");
var draw = v1((v145, v146, v147, v148) => {
  const v149 = v148.db;
  const v150 = v149.getRoot();
  if (!v150) {
    return;
  }
  const v151 = v2();
  const {
    look: v152,
    handDrawnSeed: v153,
    themeVariables: v154
  } = v151;
  const v155 = v3(v151.fontSize)[0] ?? FONT_SIZE_DEFAULT;
  const v156 = v152 === "handDrawn";
  const v157 = v150.children ?? [];
  const v158 = v151.ishikawa?.diagramPadding ?? 20;
  const v159 = v151.ishikawa?.useMaxWidth ?? false;
  const v160 = v4(v146);
  const v161 = v160.append("g").attr("class", "ishikawa");
  const v162 = v156 ? v5.svg(v160.node()) : undefined;
  const v163 = v162 ? {
    roughSvg: v162,
    seed: v153 ?? 0,
    lineColor: v154?.lineColor ?? "#333",
    fillColor: v154?.mainBkg ?? "#fff"
  } : undefined;
  const v164 = "ishikawa-arrow-" + v146;
  if (!v156) {
    v161.append("defs").append("marker").attr("id", v164).attr("viewBox", "0 0 10 10").attr("refX", 0).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M 10 0 L 0 5 L 10 10 Z").attr("class", "ishikawa-arrow");
  }
  let v165 = 0;
  let v166 = SPINE_BASE_LENGTH;
  const v167 = v156 ? undefined : drawLine(v161, v165, v166, v165, v166, "ishikawa-spine");
  drawHead(v161, v165, v166, v150.text, v155, v163);
  if (!v157.length) {
    if (v156) {
      drawLine(v161, v165, v166, v165, v166, "ishikawa-spine", v163);
    }
    applyPaddedViewBox(v160, v158, v159);
    return;
  }
  v165 -= 20;
  const v168 = v157.filter((v169, v170) => v170 % 2 === 0);
  const v171 = v157.filter((v172, v173) => v173 % 2 === 1);
  const v174 = sideStats(v168);
  const v175 = sideStats(v171);
  const v176 = v174.total + v175.total;
  let v177 = SPINE_BASE_LENGTH;
  let v178 = SPINE_BASE_LENGTH;
  if (v176 > 0) {
    const v179 = SPINE_BASE_LENGTH * 2;
    const v180 = SPINE_BASE_LENGTH * 0.3;
    v177 = Math.max(v180, v179 * (v174.total / v176));
    v178 = Math.max(v180, v179 * (v175.total / v176));
  }
  const v181 = v155 * 2;
  v177 = Math.max(v177, v174.max * v181);
  v178 = Math.max(v178, v175.max * v181);
  v166 = Math.max(v177, SPINE_BASE_LENGTH);
  if (v167) {
    v167.attr("y1", v166).attr("y2", v166);
  }
  v161.select(".ishikawa-head-group").attr("transform", "translate(0," + v166 + ")");
  const v182 = Math.ceil(v157.length / 2);
  for (let v183 = 0; v183 < v182; v183++) {
    const v184 = v161.append("g").attr("class", "ishikawa-pair");
    for (const [v185, v186, v187] of [[v157[v183 * 2], -1, v177], [v157[v183 * 2 + 1], 1, v178]]) {
      if (v185) {
        drawBranch(v184, v185, v165, v166, v186, v187, v155, v163);
      }
    }
    v165 = v184.selectAll("text").nodes().reduce((v188, v189) => Math.min(v188, v189.getBBox().x), Infinity);
  }
  if (v156) {
    drawLine(v161, v165, v166, 0, v166, "ishikawa-spine", v163);
  } else {
    v167.attr("x1", v165);
    const v190 = "url(#" + v164 + ")";
    v161.selectAll("line.ishikawa-branch, line.ishikawa-sub-branch").attr("marker-start", v190);
  }
  applyPaddedViewBox(v160, v158, v159);
}, "draw");
var sideStats = v1(v191 => {
  const v192 = v1(v193 => v193.children.reduce((v194, v195) => v194 + 1 + v192(v195), 0), "countDescendants");
  return v191.reduce((v196, v197) => {
    const v198 = v192(v197);
    v196.total += v198;
    v196.max = Math.max(v196.max, v198);
    return v196;
  }, {
    total: 0,
    max: 0
  });
}, "sideStats");
var drawHead = v1((v199, v200, v201, v202, v203, v204) => {
  const v205 = Math.max(6, Math.floor(110 / (v203 * 0.6)));
  const v206 = v199.append("g").attr("class", "ishikawa-head-group").attr("transform", "translate(" + v200 + "," + v201 + ")");
  const v207 = drawMultilineText(v206, wrapText(v202, v205), 0, 0, "ishikawa-head-label", "start", v203);
  const v208 = v207.node().getBBox();
  const v209 = Math.max(60, v208.width + 6);
  const v210 = Math.max(40, v208.height * 2 + 40);
  const v211 = "M 0 " + -v210 / 2 + " L 0 " + v210 / 2 + " Q " + v209 * 2.4 + " 0 0 " + -v210 / 2 + " Z";
  if (v204) {
    const v212 = v204.roughSvg.path(v211, {
      roughness: 1.5,
      seed: v204.seed,
      fill: v204.fillColor,
      fillStyle: "hachure",
      fillWeight: 2.5,
      hachureGap: 5,
      stroke: v204.lineColor,
      strokeWidth: 2
    });
    v206.insert(() => v212, ":first-child").attr("class", "ishikawa-head");
  } else {
    v206.insert("path", ":first-child").attr("class", "ishikawa-head").attr("d", v211);
  }
  v207.attr("transform", "translate(" + ((v209 - v208.width) / 2 - v208.x + 3) + "," + (-v208.y - v208.height / 2) + ")");
}, "drawHead");
var flattenTree = v1((v213, v214) => {
  const v215 = [];
  const v216 = [];
  const v217 = v1((v218, v219, v220) => {
    const v221 = v214 === -1 ? [...v218].reverse() : v218;
    for (const v222 of v221) {
      const v223 = v215.length;
      const v224 = v222.children ?? [];
      v215.push({
        depth: v220,
        text: wrapText(v222.text, 15),
        parentIndex: v219,
        childCount: v224.length
      });
      if (v220 % 2 === 0) {
        v216.push(v223);
        if (v224.length) {
          v217(v224, v223, v220 + 1);
        }
      } else {
        if (v224.length) {
          v217(v224, v223, v220 + 1);
        }
        v216.push(v223);
      }
    }
  }, "walk");
  v217(v213, -1, 2);
  return {
    entries: v215,
    yOrder: v216
  };
}, "flattenTree");
var drawCauseLabel = v1((v225, v226, v227, v228, v229, v230, v231) => {
  const v232 = v225.append("g").attr("class", "ishikawa-label-group");
  const v233 = drawMultilineText(v232, v226, v227, v228 + v229 * 11, "ishikawa-label cause", "middle", v230);
  const v234 = v233.node().getBBox();
  if (v231) {
    const v235 = v231.roughSvg.rectangle(v234.x - 20, v234.y - 2, v234.width + 40, v234.height + 4, {
      roughness: 1.5,
      seed: v231.seed,
      fill: v231.fillColor,
      fillStyle: "hachure",
      fillWeight: 2.5,
      hachureGap: 5,
      stroke: v231.lineColor,
      strokeWidth: 2
    });
    v232.insert(() => v235, ":first-child").attr("class", "ishikawa-label-box");
  } else {
    v232.insert("rect", ":first-child").attr("class", "ishikawa-label-box").attr("x", v234.x - 20).attr("y", v234.y - 2).attr("width", v234.width + 40).attr("height", v234.height + 4);
  }
}, "drawCauseLabel");
var drawArrowMarker = v1((v236, v237, v238, v239, v240, v241) => {
  const v242 = Math.sqrt(v239 * v239 + v240 * v240);
  if (v242 === 0) {
    return;
  }
  const v243 = v239 / v242;
  const v244 = v240 / v242;
  const v245 = 6;
  const v246 = -v244 * v245;
  const v247 = v243 * v245;
  const v248 = v237;
  const v249 = v238;
  const v250 = "M " + v248 + " " + v249 + " L " + (v248 - v243 * v245 * 2 + v246) + " " + (v249 - v244 * v245 * 2 + v247) + " L " + (v248 - v243 * v245 * 2 - v246) + " " + (v249 - v244 * v245 * 2 - v247) + " Z";
  const v251 = v241.roughSvg.path(v250, {
    roughness: 1,
    seed: v241.seed,
    fill: v241.lineColor,
    fillStyle: "solid",
    stroke: v241.lineColor,
    strokeWidth: 1
  });
  v236.append(() => v251);
}, "drawArrowMarker");
var drawBranch = v1((v252, v253, v254, v255, v256, v257, v258, v259) => {
  const v260 = v253.children ?? [];
  const v261 = v257 * (v260.length ? 1 : 0.2);
  const v262 = -COS_A * v261;
  const v263 = SIN_A * v261 * v256;
  const v264 = v254 + v262;
  const v265 = v255 + v263;
  drawLine(v252, v254, v255, v264, v265, "ishikawa-branch", v259);
  if (v259) {
    drawArrowMarker(v252, v254, v255, v254 - v264, v255 - v265, v259);
  }
  drawCauseLabel(v252, v253.text, v264, v265, v256, v258, v259);
  if (!v260.length) {
    return;
  }
  const {
    entries: v266,
    yOrder: v267
  } = flattenTree(v260, v256);
  const v268 = v266.length;
  const v269 = new Array(v268);
  for (const [v270, v271] of v267.entries()) {
    v269[v271] = v255 + v263 * ((v270 + 1) / (v268 + 1));
  }
  const v272 = new Map();
  v272.set(-1, {
    x0: v254,
    y0: v255,
    x1: v264,
    y1: v265,
    childCount: v260.length,
    childrenDrawn: 0
  });
  const v273 = -COS_A;
  const v274 = SIN_A * v256;
  const v275 = v256 < 0 ? "ishikawa-label up" : "ishikawa-label down";
  for (const [v276, v277] of v266.entries()) {
    const v278 = v269[v276];
    const v279 = v272.get(v277.parentIndex);
    const v280 = v252.append("g").attr("class", "ishikawa-sub-group");
    let v281 = 0;
    let v282 = 0;
    let v283 = 0;
    if (v277.depth % 2 === 0) {
      const v284 = v279.y1 - v279.y0;
      v281 = lerp(v279.x0, v279.x1, v284 ? (v278 - v279.y0) / v284 : 0.5);
      v282 = v278;
      v283 = v281 - (v277.childCount > 0 ? BONE_BASE + v277.childCount * BONE_PER_CHILD : BONE_STUB);
      drawLine(v280, v281, v278, v283, v278, "ishikawa-sub-branch", v259);
      if (v259) {
        drawArrowMarker(v280, v281, v278, 1, 0, v259);
      }
      drawMultilineText(v280, v277.text, v283, v278, "ishikawa-label align", "end", v258);
    } else {
      const v285 = v279.childrenDrawn++;
      v281 = lerp(v279.x0, v279.x1, (v279.childCount - v285) / (v279.childCount + 1));
      v282 = v279.y0;
      v283 = v281 + v273 * ((v278 - v282) / v274);
      drawLine(v280, v281, v282, v283, v278, "ishikawa-sub-branch", v259);
      if (v259) {
        drawArrowMarker(v280, v281, v282, v281 - v283, v282 - v278, v259);
      }
      drawMultilineText(v280, v277.text, v283, v278, v275, "end", v258);
    }
    if (v277.childCount > 0) {
      v272.set(v276, {
        x0: v281,
        y0: v282,
        x1: v283,
        y1: v278,
        childCount: v277.childCount,
        childrenDrawn: 0
      });
    }
  }
}, "drawBranch");
var splitLines = v1(v286 => v286.split(/<br\s*\/?>|\n/), "splitLines");
var wrapText = v1((v287, v288) => {
  if (v287.length <= v288) {
    return v287;
  }
  const v289 = [];
  for (const v290 of v287.split(/\s+/)) {
    const v291 = v289.length - 1;
    if (v291 >= 0 && v289[v291].length + 1 + v290.length <= v288) {
      v289[v291] += " " + v290;
    } else {
      v289.push(v290);
    }
  }
  return v289.join("\n");
}, "wrapText");
var drawMultilineText = v1((v292, v293, v294, v295, v296, v297, v298) => {
  const v299 = splitLines(v293);
  const v300 = v298 * 1.05;
  const v301 = v292.append("text").attr("class", v296).attr("text-anchor", v297).attr("x", v294).attr("y", v295 - (v299.length - 1) * v300 / 2);
  for (const [v302, v303] of v299.entries()) {
    v301.append("tspan").attr("x", v294).attr("dy", v302 === 0 ? 0 : v300).text(v303);
  }
  return v301;
}, "drawMultilineText");
var lerp = v1((v304, v305, v306) => v304 + (v305 - v304) * v306, "lerp");
var drawLine = v1((v307, v308, v309, v310, v311, v312, v313) => {
  if (v313) {
    const v314 = v313.roughSvg.line(v308, v309, v310, v311, {
      roughness: 1.5,
      seed: v313.seed,
      stroke: v313.lineColor,
      strokeWidth: 2
    });
    v307.append(() => v314).attr("class", v312);
    return undefined;
  }
  return v307.append("line").attr("class", v312).attr("x1", v308).attr("y1", v309).attr("x2", v310).attr("y2", v311);
}, "drawLine");
var renderer = {
  draw: draw
};
var getStyles = v1(v315 => "\n.ishikawa .ishikawa-spine,\n.ishikawa .ishikawa-branch,\n.ishikawa .ishikawa-sub-branch {\n  stroke: " + v315.lineColor + ";\n  stroke-width: 2;\n  fill: none;\n}\n\n.ishikawa .ishikawa-sub-branch {\n  stroke-width: 1;\n}\n\n.ishikawa .ishikawa-arrow {\n  fill: " + v315.lineColor + ";\n}\n\n.ishikawa .ishikawa-head {\n  fill: " + v315.mainBkg + ";\n  stroke: " + v315.lineColor + ";\n  stroke-width: 2;\n}\n\n.ishikawa .ishikawa-label-box {\n  fill: " + v315.mainBkg + ";\n  stroke: " + v315.lineColor + ";\n  stroke-width: 2;\n}\n\n.ishikawa text {\n  font-family: " + v315.fontFamily + ";\n  font-size: " + v315.fontSize + ";\n  fill: " + v315.textColor + ";\n}\n\n.ishikawa .ishikawa-head-label {\n  font-weight: 600;\n  text-anchor: middle;\n  dominant-baseline: middle;\n  font-size: 14px;\n}\n\n.ishikawa .ishikawa-label {\n  text-anchor: end;\n}\n\n.ishikawa .ishikawa-label.cause {\n  text-anchor: middle;\n  dominant-baseline: middle;\n}\n\n.ishikawa .ishikawa-label.align {\n  text-anchor: end;\n  dominant-baseline: middle;\n}\n\n.ishikawa .ishikawa-label.up {\n  dominant-baseline: baseline;\n}\n\n.ishikawa .ishikawa-label.down {\n  dominant-baseline: hanging;\n}\n", "getStyles");
var ishikawaStyles_default = getStyles;
var diagram = {
  parser: ishikawa_default,
  get db() {
    return new IshikawaDB();
  },
  renderer: renderer,
  styles: ishikawaStyles_default
};
export { diagram };