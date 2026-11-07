import { g as v1 } from "./chunk-XXDRQBXY-CzLCVi_O.js";
import { s as v2 } from "./chunk-KBJHAD2P-BXgOlElY.js";
import { _ as v3, b as v4, a as v5, s as v6, g as v7, n as v8, o as v9, c as v10, l as v11, p as v12, q as v13, r as v14, t as v15, u as v16, v as v17, d as v18, x as v19 } from "./index-CXb3UsfP.js";
import { c as v20 } from "./channel-zu66cFrq.js";
var parser = function () {
  var v21 = v3(function (v22, v23, v24, v25) {
    v24 = v24 || {};
    v25 = v22.length;
    for (; v25--; v24[v22[v25]] = v23);
    return v24;
  }, "o");
  var v26 = [6, 8, 10, 22, 24, 26, 28, 33, 34, 35, 36, 37, 40, 43, 44, 48, 50, 51, 52];
  var v27 = [1, 10];
  var v28 = [1, 11];
  var v29 = [1, 12];
  var v30 = [1, 13];
  var v31 = [1, 23];
  var v32 = [1, 24];
  var v33 = [1, 25];
  var v34 = [1, 26];
  var v35 = [1, 27];
  var v36 = [1, 19];
  var v37 = [1, 28];
  var v38 = [1, 29];
  var v39 = [1, 20];
  var v40 = [1, 18];
  var v41 = [1, 21];
  var v42 = [1, 22];
  var v43 = [1, 36];
  var v44 = [1, 37];
  var v45 = [1, 38];
  var v46 = [1, 39];
  var v47 = [1, 40];
  var v48 = [6, 8, 10, 13, 15, 17, 20, 21, 22, 24, 26, 28, 33, 34, 35, 36, 37, 40, 43, 44, 48, 50, 51, 52, 66, 67, 68, 69, 70];
  var v49 = [1, 45];
  var v50 = [1, 46];
  var v51 = [1, 55];
  var v52 = [40, 48, 50, 51, 52, 71, 72];
  var v53 = [1, 66];
  var v54 = [1, 64];
  var v55 = [1, 61];
  var v56 = [1, 65];
  var v57 = [1, 67];
  var v58 = [6, 8, 10, 13, 17, 22, 24, 26, 28, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 48, 49, 50, 51, 52, 66, 67, 68, 69, 70];
  var v59 = [66, 67, 68, 69, 70];
  var v60 = [1, 85];
  var v61 = [1, 84];
  var v62 = [1, 82];
  var v63 = [1, 83];
  var v64 = [6, 10, 42, 47];
  var v65 = [6, 10, 13, 41, 42, 47, 48, 49];
  var v66 = [1, 93];
  var v67 = [1, 92];
  var v68 = [1, 91];
  var v69 = [19, 58];
  var v70 = [1, 102];
  var v71 = [1, 101];
  var v72 = [19, 58, 61, 63];
  var v73 = {
    trace: v3(function v74() {}, "trace"),
    yy: {},
    symbols_: {
      error: 2,
      start: 3,
      ER_DIAGRAM: 4,
      document: 5,
      EOF: 6,
      line: 7,
      SPACE: 8,
      statement: 9,
      NEWLINE: 10,
      entityName: 11,
      relSpec: 12,
      COLON: 13,
      role: 14,
      STYLE_SEPARATOR: 15,
      idList: 16,
      BLOCK_START: 17,
      attributes: 18,
      BLOCK_STOP: 19,
      SQS: 20,
      SQE: 21,
      title: 22,
      title_value: 23,
      acc_title: 24,
      acc_title_value: 25,
      acc_descr: 26,
      acc_descr_value: 27,
      acc_descr_multiline_value: 28,
      direction: 29,
      classDefStatement: 30,
      classStatement: 31,
      styleStatement: 32,
      direction_tb: 33,
      direction_bt: 34,
      direction_rl: 35,
      direction_lr: 36,
      CLASSDEF: 37,
      stylesOpt: 38,
      separator: 39,
      UNICODE_TEXT: 40,
      STYLE_TEXT: 41,
      COMMA: 42,
      CLASS: 43,
      STYLE: 44,
      style: 45,
      styleComponent: 46,
      SEMI: 47,
      NUM: 48,
      BRKT: 49,
      ENTITY_NAME: 50,
      DECIMAL_NUM: 51,
      ENTITY_ONE: 52,
      attribute: 53,
      attributeType: 54,
      attributeName: 55,
      attributeKeyTypeList: 56,
      attributeComment: 57,
      ATTRIBUTE_WORD: 58,
      "?": 59,
      attributeKeyType: 60,
      ",": 61,
      ATTRIBUTE_KEY: 62,
      COMMENT: 63,
      cardinality: 64,
      relType: 65,
      ZERO_OR_ONE: 66,
      ZERO_OR_MORE: 67,
      ONE_OR_MORE: 68,
      ONLY_ONE: 69,
      MD_PARENT: 70,
      NON_IDENTIFYING: 71,
      IDENTIFYING: 72,
      WORD: 73,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: "error",
      4: "ER_DIAGRAM",
      6: "EOF",
      8: "SPACE",
      10: "NEWLINE",
      13: "COLON",
      15: "STYLE_SEPARATOR",
      17: "BLOCK_START",
      19: "BLOCK_STOP",
      20: "SQS",
      21: "SQE",
      22: "title",
      23: "title_value",
      24: "acc_title",
      25: "acc_title_value",
      26: "acc_descr",
      27: "acc_descr_value",
      28: "acc_descr_multiline_value",
      33: "direction_tb",
      34: "direction_bt",
      35: "direction_rl",
      36: "direction_lr",
      37: "CLASSDEF",
      40: "UNICODE_TEXT",
      41: "STYLE_TEXT",
      42: "COMMA",
      43: "CLASS",
      44: "STYLE",
      47: "SEMI",
      48: "NUM",
      49: "BRKT",
      50: "ENTITY_NAME",
      51: "DECIMAL_NUM",
      52: "ENTITY_ONE",
      58: "ATTRIBUTE_WORD",
      59: "?",
      61: ",",
      62: "ATTRIBUTE_KEY",
      63: "COMMENT",
      66: "ZERO_OR_ONE",
      67: "ZERO_OR_MORE",
      68: "ONE_OR_MORE",
      69: "ONLY_ONE",
      70: "MD_PARENT",
      71: "NON_IDENTIFYING",
      72: "IDENTIFYING",
      73: "WORD"
    },
    productions_: [0, [3, 3], [5, 0], [5, 2], [7, 2], [7, 1], [7, 1], [7, 1], [9, 5], [9, 9], [9, 7], [9, 7], [9, 4], [9, 6], [9, 3], [9, 5], [9, 1], [9, 3], [9, 7], [9, 9], [9, 6], [9, 8], [9, 4], [9, 6], [9, 2], [9, 2], [9, 2], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [29, 1], [29, 1], [29, 1], [29, 1], [30, 4], [16, 1], [16, 1], [16, 3], [16, 3], [31, 3], [32, 4], [38, 1], [38, 3], [45, 1], [45, 2], [39, 1], [39, 1], [39, 1], [46, 1], [46, 1], [46, 1], [46, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [18, 1], [18, 2], [53, 2], [53, 3], [53, 3], [53, 4], [54, 1], [54, 2], [55, 1], [56, 1], [56, 3], [60, 1], [57, 1], [12, 3], [64, 1], [64, 1], [64, 1], [64, 1], [64, 1], [65, 1], [65, 1], [14, 1], [14, 1], [14, 1]],
    performAction: v3(function v75(v76, v77, v78, v79, v80, v81, v82) {
      var v83 = v81.length - 1;
      switch (v80) {
        case 1:
          break;
        case 2:
          this.$ = [];
          break;
        case 3:
          v81[v83 - 1].push(v81[v83]);
          this.$ = v81[v83 - 1];
          break;
        case 4:
        case 5:
          this.$ = v81[v83];
          break;
        case 6:
        case 7:
          this.$ = [];
          break;
        case 8:
          v79.addEntity(v81[v83 - 4]);
          v79.addEntity(v81[v83 - 2]);
          v79.addRelationship(v81[v83 - 4], v81[v83], v81[v83 - 2], v81[v83 - 3]);
          break;
        case 9:
          v79.addEntity(v81[v83 - 8]);
          v79.addEntity(v81[v83 - 4]);
          v79.addRelationship(v81[v83 - 8], v81[v83], v81[v83 - 4], v81[v83 - 5]);
          v79.setClass([v81[v83 - 8]], v81[v83 - 6]);
          v79.setClass([v81[v83 - 4]], v81[v83 - 2]);
          break;
        case 10:
          v79.addEntity(v81[v83 - 6]);
          v79.addEntity(v81[v83 - 2]);
          v79.addRelationship(v81[v83 - 6], v81[v83], v81[v83 - 2], v81[v83 - 3]);
          v79.setClass([v81[v83 - 6]], v81[v83 - 4]);
          break;
        case 11:
          v79.addEntity(v81[v83 - 6]);
          v79.addEntity(v81[v83 - 4]);
          v79.addRelationship(v81[v83 - 6], v81[v83], v81[v83 - 4], v81[v83 - 5]);
          v79.setClass([v81[v83 - 4]], v81[v83 - 2]);
          break;
        case 12:
          v79.addEntity(v81[v83 - 3]);
          v79.addAttributes(v81[v83 - 3], v81[v83 - 1]);
          break;
        case 13:
          v79.addEntity(v81[v83 - 5]);
          v79.addAttributes(v81[v83 - 5], v81[v83 - 1]);
          v79.setClass([v81[v83 - 5]], v81[v83 - 3]);
          break;
        case 14:
          v79.addEntity(v81[v83 - 2]);
          break;
        case 15:
          v79.addEntity(v81[v83 - 4]);
          v79.setClass([v81[v83 - 4]], v81[v83 - 2]);
          break;
        case 16:
          v79.addEntity(v81[v83]);
          break;
        case 17:
          v79.addEntity(v81[v83 - 2]);
          v79.setClass([v81[v83 - 2]], v81[v83]);
          break;
        case 18:
          v79.addEntity(v81[v83 - 6], v81[v83 - 4]);
          v79.addAttributes(v81[v83 - 6], v81[v83 - 1]);
          break;
        case 19:
          v79.addEntity(v81[v83 - 8], v81[v83 - 6]);
          v79.addAttributes(v81[v83 - 8], v81[v83 - 1]);
          v79.setClass([v81[v83 - 8]], v81[v83 - 3]);
          break;
        case 20:
          v79.addEntity(v81[v83 - 5], v81[v83 - 3]);
          break;
        case 21:
          v79.addEntity(v81[v83 - 7], v81[v83 - 5]);
          v79.setClass([v81[v83 - 7]], v81[v83 - 2]);
          break;
        case 22:
          v79.addEntity(v81[v83 - 3], v81[v83 - 1]);
          break;
        case 23:
          v79.addEntity(v81[v83 - 5], v81[v83 - 3]);
          v79.setClass([v81[v83 - 5]], v81[v83]);
          break;
        case 24:
        case 25:
          this.$ = v81[v83].trim();
          v79.setAccTitle(this.$);
          break;
        case 26:
        case 27:
          this.$ = v81[v83].trim();
          v79.setAccDescription(this.$);
          break;
        case 32:
          v79.setDirection("TB");
          break;
        case 33:
          v79.setDirection("BT");
          break;
        case 34:
          v79.setDirection("RL");
          break;
        case 35:
          v79.setDirection("LR");
          break;
        case 36:
          this.$ = v81[v83 - 3];
          v79.addClass(v81[v83 - 2], v81[v83 - 1]);
          break;
        case 37:
        case 38:
        case 59:
        case 68:
          this.$ = [v81[v83]];
          break;
        case 39:
        case 40:
          this.$ = v81[v83 - 2].concat([v81[v83]]);
          break;
        case 41:
          this.$ = v81[v83 - 2];
          v79.setClass(v81[v83 - 1], v81[v83]);
          break;
        case 42:
          this.$ = v81[v83 - 3];
          v79.addCssStyles(v81[v83 - 2], v81[v83 - 1]);
          break;
        case 43:
          this.$ = [v81[v83]];
          break;
        case 44:
          v81[v83 - 2].push(v81[v83]);
          this.$ = v81[v83 - 2];
          break;
        case 46:
          this.$ = v81[v83 - 1] + v81[v83];
          break;
        case 54:
        case 80:
        case 81:
          this.$ = v81[v83].replace(/"/g, "");
          break;
        case 55:
        case 56:
        case 57:
        case 58:
        case 82:
          this.$ = v81[v83];
          break;
        case 60:
          v81[v83].push(v81[v83 - 1]);
          this.$ = v81[v83];
          break;
        case 61:
          this.$ = {
            type: v81[v83 - 1],
            name: v81[v83]
          };
          break;
        case 62:
          this.$ = {
            type: v81[v83 - 2],
            name: v81[v83 - 1],
            keys: v81[v83]
          };
          break;
        case 63:
          this.$ = {
            type: v81[v83 - 2],
            name: v81[v83 - 1],
            comment: v81[v83]
          };
          break;
        case 64:
          this.$ = {
            type: v81[v83 - 3],
            name: v81[v83 - 2],
            keys: v81[v83 - 1],
            comment: v81[v83]
          };
          break;
        case 65:
        case 67:
        case 70:
          this.$ = v81[v83];
          break;
        case 66:
          this.$ = v81[v83 - 1] + v81[v83];
          break;
        case 69:
          v81[v83 - 2].push(v81[v83]);
          this.$ = v81[v83 - 2];
          break;
        case 71:
          this.$ = v81[v83].replace(/"/g, "");
          break;
        case 72:
          this.$ = {
            cardA: v81[v83],
            relType: v81[v83 - 1],
            cardB: v81[v83 - 2]
          };
          break;
        case 73:
          this.$ = v79.Cardinality.ZERO_OR_ONE;
          break;
        case 74:
          this.$ = v79.Cardinality.ZERO_OR_MORE;
          break;
        case 75:
          this.$ = v79.Cardinality.ONE_OR_MORE;
          break;
        case 76:
          this.$ = v79.Cardinality.ONLY_ONE;
          break;
        case 77:
          this.$ = v79.Cardinality.MD_PARENT;
          break;
        case 78:
          this.$ = v79.Identification.NON_IDENTIFYING;
          break;
        case 79:
          this.$ = v79.Identification.IDENTIFYING;
          break;
      }
    }, "anonymous"),
    table: [{
      3: 1,
      4: [1, 2]
    }, {
      1: [3]
    }, v21(v26, [2, 2], {
      5: 3
    }), {
      6: [1, 4],
      7: 5,
      8: [1, 6],
      9: 7,
      10: [1, 8],
      11: 9,
      22: v27,
      24: v28,
      26: v29,
      28: v30,
      29: 14,
      30: 15,
      31: 16,
      32: 17,
      33: v31,
      34: v32,
      35: v33,
      36: v34,
      37: v35,
      40: v36,
      43: v37,
      44: v38,
      48: v39,
      50: v40,
      51: v41,
      52: v42
    }, v21(v26, [2, 7], {
      1: [2, 1]
    }), v21(v26, [2, 3]), {
      9: 30,
      11: 9,
      22: v27,
      24: v28,
      26: v29,
      28: v30,
      29: 14,
      30: 15,
      31: 16,
      32: 17,
      33: v31,
      34: v32,
      35: v33,
      36: v34,
      37: v35,
      40: v36,
      43: v37,
      44: v38,
      48: v39,
      50: v40,
      51: v41,
      52: v42
    }, v21(v26, [2, 5]), v21(v26, [2, 6]), v21(v26, [2, 16], {
      12: 31,
      64: 35,
      15: [1, 32],
      17: [1, 33],
      20: [1, 34],
      66: v43,
      67: v44,
      68: v45,
      69: v46,
      70: v47
    }), {
      23: [1, 41]
    }, {
      25: [1, 42]
    }, {
      27: [1, 43]
    }, v21(v26, [2, 27]), v21(v26, [2, 28]), v21(v26, [2, 29]), v21(v26, [2, 30]), v21(v26, [2, 31]), v21(v48, [2, 54]), v21(v48, [2, 55]), v21(v48, [2, 56]), v21(v48, [2, 57]), v21(v48, [2, 58]), v21(v26, [2, 32]), v21(v26, [2, 33]), v21(v26, [2, 34]), v21(v26, [2, 35]), {
      16: 44,
      40: v49,
      41: v50
    }, {
      16: 47,
      40: v49,
      41: v50
    }, {
      16: 48,
      40: v49,
      41: v50
    }, v21(v26, [2, 4]), {
      11: 49,
      40: v36,
      48: v39,
      50: v40,
      51: v41,
      52: v42
    }, {
      16: 50,
      40: v49,
      41: v50
    }, {
      18: 51,
      19: [1, 52],
      53: 53,
      54: 54,
      58: v51
    }, {
      11: 56,
      40: v36,
      48: v39,
      50: v40,
      51: v41,
      52: v42
    }, {
      65: 57,
      71: [1, 58],
      72: [1, 59]
    }, v21(v52, [2, 73]), v21(v52, [2, 74]), v21(v52, [2, 75]), v21(v52, [2, 76]), v21(v52, [2, 77]), v21(v26, [2, 24]), v21(v26, [2, 25]), v21(v26, [2, 26]), {
      13: v53,
      38: 60,
      41: v54,
      42: v55,
      45: 62,
      46: 63,
      48: v56,
      49: v57
    }, v21(v58, [2, 37]), v21(v58, [2, 38]), {
      16: 68,
      40: v49,
      41: v50,
      42: v55
    }, {
      13: v53,
      38: 69,
      41: v54,
      42: v55,
      45: 62,
      46: 63,
      48: v56,
      49: v57
    }, {
      13: [1, 70],
      15: [1, 71]
    }, v21(v26, [2, 17], {
      64: 35,
      12: 72,
      17: [1, 73],
      42: v55,
      66: v43,
      67: v44,
      68: v45,
      69: v46,
      70: v47
    }), {
      19: [1, 74]
    }, v21(v26, [2, 14]), {
      18: 75,
      19: [2, 59],
      53: 53,
      54: 54,
      58: v51
    }, {
      55: 76,
      58: [1, 77]
    }, {
      58: [2, 65],
      59: [1, 78]
    }, {
      21: [1, 79]
    }, {
      64: 80,
      66: v43,
      67: v44,
      68: v45,
      69: v46,
      70: v47
    }, v21(v59, [2, 78]), v21(v59, [2, 79]), {
      6: v60,
      10: v61,
      39: 81,
      42: v62,
      47: v63
    }, {
      40: [1, 86],
      41: [1, 87]
    }, v21(v64, [2, 43], {
      46: 88,
      13: v53,
      41: v54,
      48: v56,
      49: v57
    }), v21(v65, [2, 45]), v21(v65, [2, 50]), v21(v65, [2, 51]), v21(v65, [2, 52]), v21(v65, [2, 53]), v21(v26, [2, 41], {
      42: v55
    }), {
      6: v60,
      10: v61,
      39: 89,
      42: v62,
      47: v63
    }, {
      14: 90,
      40: v66,
      50: v67,
      73: v68
    }, {
      16: 94,
      40: v49,
      41: v50
    }, {
      11: 95,
      40: v36,
      48: v39,
      50: v40,
      51: v41,
      52: v42
    }, {
      18: 96,
      19: [1, 97],
      53: 53,
      54: 54,
      58: v51
    }, v21(v26, [2, 12]), {
      19: [2, 60]
    }, v21(v69, [2, 61], {
      56: 98,
      57: 99,
      60: 100,
      62: v70,
      63: v71
    }), v21([19, 58, 62, 63], [2, 67]), {
      58: [2, 66]
    }, v21(v26, [2, 22], {
      15: [1, 104],
      17: [1, 103]
    }), v21([40, 48, 50, 51, 52], [2, 72]), v21(v26, [2, 36]), {
      13: v53,
      41: v54,
      45: 105,
      46: 63,
      48: v56,
      49: v57
    }, v21(v26, [2, 47]), v21(v26, [2, 48]), v21(v26, [2, 49]), v21(v58, [2, 39]), v21(v58, [2, 40]), v21(v65, [2, 46]), v21(v26, [2, 42]), v21(v26, [2, 8]), v21(v26, [2, 80]), v21(v26, [2, 81]), v21(v26, [2, 82]), {
      13: [1, 106],
      42: v55
    }, {
      13: [1, 108],
      15: [1, 107]
    }, {
      19: [1, 109]
    }, v21(v26, [2, 15]), v21(v69, [2, 62], {
      57: 110,
      61: [1, 111],
      63: v71
    }), v21(v69, [2, 63]), v21(v72, [2, 68]), v21(v69, [2, 71]), v21(v72, [2, 70]), {
      18: 112,
      19: [1, 113],
      53: 53,
      54: 54,
      58: v51
    }, {
      16: 114,
      40: v49,
      41: v50
    }, v21(v64, [2, 44], {
      46: 88,
      13: v53,
      41: v54,
      48: v56,
      49: v57
    }), {
      14: 115,
      40: v66,
      50: v67,
      73: v68
    }, {
      16: 116,
      40: v49,
      41: v50
    }, {
      14: 117,
      40: v66,
      50: v67,
      73: v68
    }, v21(v26, [2, 13]), v21(v69, [2, 64]), {
      60: 118,
      62: v70
    }, {
      19: [1, 119]
    }, v21(v26, [2, 20]), v21(v26, [2, 23], {
      17: [1, 120],
      42: v55
    }), v21(v26, [2, 11]), {
      13: [1, 121],
      42: v55
    }, v21(v26, [2, 10]), v21(v72, [2, 69]), v21(v26, [2, 18]), {
      18: 122,
      19: [1, 123],
      53: 53,
      54: 54,
      58: v51
    }, {
      14: 124,
      40: v66,
      50: v67,
      73: v68
    }, {
      19: [1, 125]
    }, v21(v26, [2, 21]), v21(v26, [2, 9]), v21(v26, [2, 19])],
    defaultActions: {
      75: [2, 60],
      78: [2, 66]
    },
    parseError: v3(function v84(v85, v86) {
      if (v86.recoverable) {
        this.trace(v85);
      } else {
        var v87 = new Error(v85);
        v87.hash = v86;
        throw v87;
      }
    }, "parseError"),
    parse: v3(function v88(v89) {
      var v90 = this;
      var v91 = [0];
      var v92 = [];
      var v93 = [null];
      var v94 = [];
      var v95 = this.table;
      var v96 = "";
      var v97 = 0;
      var v98 = 0;
      var v99 = 2;
      var v100 = 1;
      var v101 = v94.slice.call(arguments, 1);
      var v102 = Object.create(this.lexer);
      var v103 = {
        yy: {}
      };
      for (var v104 in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, v104)) {
          v103.yy[v104] = this.yy[v104];
        }
      }
      v102.setInput(v89, v103.yy);
      v103.yy.lexer = v102;
      v103.yy.parser = this;
      if (typeof v102.yylloc == "undefined") {
        v102.yylloc = {};
      }
      var v105 = v102.yylloc;
      v94.push(v105);
      var v106 = v102.options && v102.options.ranges;
      if (typeof v103.yy.parseError === "function") {
        this.parseError = v103.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function v107(v108) {
        v91.length = v91.length - v108 * 2;
        v93.length = v93.length - v108;
        v94.length = v94.length - v108;
      }
      v3(v107, "popStack");
      function v109() {
        var v110;
        v110 = v92.pop() || v102.lex() || v100;
        if (typeof v110 !== "number") {
          if (v110 instanceof Array) {
            v92 = v110;
            v110 = v92.pop();
          }
          v110 = v90.symbols_[v110] || v110;
        }
        return v110;
      }
      v3(v109, "lex");
      var v111;
      var v112;
      var v113;
      var v114;
      var v115 = {};
      var v116;
      var v117;
      var v118;
      var v119;
      while (true) {
        v112 = v91[v91.length - 1];
        if (this.defaultActions[v112]) {
          v113 = this.defaultActions[v112];
        } else {
          if (v111 === null || typeof v111 == "undefined") {
            v111 = v109();
          }
          v113 = v95[v112] && v95[v112][v111];
        }
        if (typeof v113 === "undefined" || !v113.length || !v113[0]) {
          var v120 = "";
          v119 = [];
          for (v116 in v95[v112]) {
            if (this.terminals_[v116] && v116 > v99) {
              v119.push("'" + this.terminals_[v116] + "'");
            }
          }
          if (v102.showPosition) {
            v120 = "Parse error on line " + (v97 + 1) + ":\n" + v102.showPosition() + "\nExpecting " + v119.join(", ") + ", got '" + (this.terminals_[v111] || v111) + "'";
          } else {
            v120 = "Parse error on line " + (v97 + 1) + ": Unexpected " + (v111 == v100 ? "end of input" : "'" + (this.terminals_[v111] || v111) + "'");
          }
          this.parseError(v120, {
            text: v102.match,
            token: this.terminals_[v111] || v111,
            line: v102.yylineno,
            loc: v105,
            expected: v119
          });
        }
        if (v113[0] instanceof Array && v113.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + v112 + ", token: " + v111);
        }
        switch (v113[0]) {
          case 1:
            v91.push(v111);
            v93.push(v102.yytext);
            v94.push(v102.yylloc);
            v91.push(v113[1]);
            v111 = null;
            {
              v98 = v102.yyleng;
              v96 = v102.yytext;
              v97 = v102.yylineno;
              v105 = v102.yylloc;
            }
            break;
          case 2:
            v117 = this.productions_[v113[1]][1];
            v115.$ = v93[v93.length - v117];
            v115._$ = {
              first_line: v94[v94.length - (v117 || 1)].first_line,
              last_line: v94[v94.length - 1].last_line,
              first_column: v94[v94.length - (v117 || 1)].first_column,
              last_column: v94[v94.length - 1].last_column
            };
            if (v106) {
              v115._$.range = [v94[v94.length - (v117 || 1)].range[0], v94[v94.length - 1].range[1]];
            }
            v114 = this.performAction.apply(v115, [v96, v98, v97, v103.yy, v113[1], v93, v94].concat(v101));
            if (typeof v114 !== "undefined") {
              return v114;
            }
            if (v117) {
              v91 = v91.slice(0, v117 * -1 * 2);
              v93 = v93.slice(0, v117 * -1);
              v94 = v94.slice(0, v117 * -1);
            }
            v91.push(this.productions_[v113[1]][0]);
            v93.push(v115.$);
            v94.push(v115._$);
            v118 = v95[v91[v91.length - 2]][v91[v91.length - 1]];
            v91.push(v118);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var v121 = function () {
    var v122 = {
      EOF: 1,
      parseError: v3(function v123(v124, v125) {
        if (this.yy.parser) {
          this.yy.parser.parseError(v124, v125);
        } else {
          throw new Error(v124);
        }
      }, "parseError"),
      setInput: v3(function (v126, v127) {
        this.yy = v127 || this.yy || {};
        this._input = v126;
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
        var v128 = this._input[0];
        this.yytext += v128;
        this.yyleng++;
        this.offset++;
        this.match += v128;
        this.matched += v128;
        var v129 = v128.match(/(?:\r\n?|\n).*/g);
        if (v129) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return v128;
      }, "input"),
      unput: v3(function (v130) {
        var v131 = v130.length;
        var v132 = v130.split(/(?:\r\n?|\n)/g);
        this._input = v130 + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - v131);
        this.offset -= v131;
        var v133 = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (v132.length - 1) {
          this.yylineno -= v132.length - 1;
        }
        var v134 = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: v132 ? (v132.length === v133.length ? this.yylloc.first_column : 0) + v133[v133.length - v132.length].length - v132[0].length : this.yylloc.first_column - v131
        };
        if (this.options.ranges) {
          this.yylloc.range = [v134[0], v134[0] + this.yyleng - v131];
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
      less: v3(function (v135) {
        this.unput(this.match.slice(v135));
      }, "less"),
      pastInput: v3(function () {
        var v136 = this.matched.substr(0, this.matched.length - this.match.length);
        return (v136.length > 20 ? "..." : "") + v136.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: v3(function () {
        var v137 = this.match;
        if (v137.length < 20) {
          v137 += this._input.substr(0, 20 - v137.length);
        }
        return (v137.substr(0, 20) + (v137.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: v3(function () {
        var v138 = this.pastInput();
        var v139 = new Array(v138.length + 1).join("-");
        return v138 + this.upcomingInput() + "\n" + v139 + "^";
      }, "showPosition"),
      test_match: v3(function (v140, v141) {
        var v142;
        var v143;
        var v144;
        if (this.options.backtrack_lexer) {
          v144 = {
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
            v144.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        v143 = v140[0].match(/(?:\r\n?|\n).*/g);
        if (v143) {
          this.yylineno += v143.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: v143 ? v143[v143.length - 1].length - v143[v143.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + v140[0].length
        };
        this.yytext += v140[0];
        this.match += v140[0];
        this.matches = v140;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(v140[0].length);
        this.matched += v140[0];
        v142 = this.performAction.call(this, this.yy, this, v141, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (v142) {
          return v142;
        } else if (this._backtrack) {
          for (var v145 in v144) {
            this[v145] = v144[v145];
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
        var v146;
        var v147;
        var v148;
        var v149;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var v150 = this._currentRules();
        for (var v151 = 0; v151 < v150.length; v151++) {
          v148 = this._input.match(this.rules[v150[v151]]);
          if (v148 && (!v147 || v148[0].length > v147[0].length)) {
            v147 = v148;
            v149 = v151;
            if (this.options.backtrack_lexer) {
              v146 = this.test_match(v148, v150[v151]);
              if (v146 !== false) {
                return v146;
              } else if (this._backtrack) {
                v147 = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (v147) {
          v146 = this.test_match(v147, v150[v149]);
          if (v146 !== false) {
            return v146;
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
      lex: v3(function v152() {
        var v153 = this.next();
        if (v153) {
          return v153;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: v3(function v154(v155) {
        this.conditionStack.push(v155);
      }, "begin"),
      popState: v3(function v156() {
        var v157 = this.conditionStack.length - 1;
        if (v157 > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: v3(function v158() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions.INITIAL.rules;
        }
      }, "_currentRules"),
      topState: v3(function v159(v160) {
        v160 = this.conditionStack.length - 1 - Math.abs(v160 || 0);
        if (v160 >= 0) {
          return this.conditionStack[v160];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: v3(function v161(v162) {
        this.begin(v162);
      }, "pushState"),
      stateStackSize: v3(function v163() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {
        "case-insensitive": true
      },
      performAction: v3(function v164(v165, v166, v167, v168) {
        switch (v167) {
          case 0:
            this.begin("acc_title");
            return 24;
          case 1:
            this.popState();
            return "acc_title_value";
          case 2:
            this.begin("acc_descr");
            return 26;
          case 3:
            this.popState();
            return "acc_descr_value";
          case 4:
            this.begin("acc_descr_multiline");
            break;
          case 5:
            this.popState();
            break;
          case 6:
            return "acc_descr_multiline_value";
          case 7:
            return 33;
          case 8:
            return 34;
          case 9:
            return 35;
          case 10:
            return 36;
          case 11:
            return 10;
          case 12:
            break;
          case 13:
            return 8;
          case 14:
            return 50;
          case 15:
            return 73;
          case 16:
            return 4;
          case 17:
            this.begin("block");
            return 17;
          case 18:
            return 49;
          case 19:
            return 49;
          case 20:
            return 42;
          case 21:
            return 15;
          case 22:
            return 13;
          case 23:
            break;
          case 24:
            return 62;
          case 25:
            return 58;
          case 26:
            return 58;
          case 27:
            this.begin("block_bq");
            break;
          case 28:
            return 58;
          case 29:
            this.popState();
            break;
          case 30:
            return 63;
          case 31:
            break;
          case 32:
            this.popState();
            return 19;
          case 33:
            return v166.yytext[0];
          case 34:
            return 20;
          case 35:
            return 21;
          case 36:
            this.begin("style");
            return 44;
          case 37:
            this.popState();
            return 10;
          case 38:
            break;
          case 39:
            return 13;
          case 40:
            return 42;
          case 41:
            return 49;
          case 42:
            this.begin("style");
            return 37;
          case 43:
            return 43;
          case 44:
            return 66;
          case 45:
            return 68;
          case 46:
            return 68;
          case 47:
            return 68;
          case 48:
            return 66;
          case 49:
            return 66;
          case 50:
            return 67;
          case 51:
            return 67;
          case 52:
            return 67;
          case 53:
            return 67;
          case 54:
            return 67;
          case 55:
            return 68;
          case 56:
            return 67;
          case 57:
            return 68;
          case 58:
            return 69;
          case 59:
            return 69;
          case 60:
            return 51;
          case 61:
            return 69;
          case 62:
            return 69;
          case 63:
            return 69;
          case 64:
            return 52;
          case 65:
            return 48;
          case 66:
            return 69;
          case 67:
            return 66;
          case 68:
            return 67;
          case 69:
            return 68;
          case 70:
            return 70;
          case 71:
            return 71;
          case 72:
            return 72;
          case 73:
            return 72;
          case 74:
            return 71;
          case 75:
            return 71;
          case 76:
            return 71;
          case 77:
            return 41;
          case 78:
            return 47;
          case 79:
            return 40;
          case 80:
            return v166.yytext[0];
          case 81:
            return 6;
        }
      }, "anonymous"),
      rules: [/^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:.*direction\s+TB[^\n]*)/i, /^(?:.*direction\s+BT[^\n]*)/i, /^(?:.*direction\s+RL[^\n]*)/i, /^(?:.*direction\s+LR[^\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:[\s]+)/i, /^(?:"[^"%\r\n\v\b\\]+")/i, /^(?:"[^"]*")/i, /^(?:erDiagram\b)/i, /^(?:\{)/i, /^(?:#)/i, /^(?:#)/i, /^(?:,)/i, /^(?::::)/i, /^(?::)/i, /^(?:\s+)/i, /^(?:\b((?:PK)|(?:FK)|(?:UK))\b)/i, /^(?:([^\s]*)[~].*[~]([^\s]*))/i, /^(?:([\*A-Za-z_\u00C0-\uFFFF][A-Za-z0-9\-\_\[\]\(\)\.,\u00C0-\uFFFF\*]*))/i, /^(?:[`])/i, /^(?:[^`]+)/i, /^(?:[`])/i, /^(?:"[^"]*")/i, /^(?:[\n]+)/i, /^(?:\})/i, /^(?:.)/i, /^(?:\[)/i, /^(?:\])/i, /^(?:style\b)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?::)/i, /^(?:,)/i, /^(?:#)/i, /^(?:classDef\b)/i, /^(?:class\b)/i, /^(?:one or zero\b)/i, /^(?:one or more\b)/i, /^(?:one or many\b)/i, /^(?:1\+)/i, /^(?:\|o\b)/i, /^(?:zero or one\b)/i, /^(?:zero or more\b)/i, /^(?:zero or many\b)/i, /^(?:0\+)/i, /^(?:\}o\b)/i, /^(?:many\(0\))/i, /^(?:many\(1\))/i, /^(?:many\b)/i, /^(?:\}\|)/i, /^(?:one\b)/i, /^(?:only one\b)/i, /^(?:[0-9]+\.[0-9]+)/i, /^(?:1(?=\s+[A-Za-z_"']))/i, /^(?:1(?=\s+[0-9]))/i, /^(?:1(?=(--|\.\.|\.-|-\.)))/i, /^(?:1\b)/i, /^(?:[0-9]+)/i, /^(?:\|\|)/i, /^(?:o\|)/i, /^(?:o\{)/i, /^(?:\|\{)/i, /^(?:u(?=[\.\-\|]))/i, /^(?:\.\.)/i, /^(?:--)/i, /^(?:to\b)/i, /^(?:optionally to\b)/i, /^(?:\.-)/i, /^(?:-\.)/i, /^(?:([^\x00-\x7F]|\w|-|\*)+)/i, /^(?:;)/i, /^(?:([^\x00-\x7F]|\w|-|\*|\.)+)/i, /^(?:.)/i, /^(?:$)/i],
      conditions: {
        style: {
          rules: [37, 38, 39, 40, 41, 77, 78],
          inclusive: false
        },
        acc_descr_multiline: {
          rules: [5, 6],
          inclusive: false
        },
        acc_descr: {
          rules: [3],
          inclusive: false
        },
        acc_title: {
          rules: [1],
          inclusive: false
        },
        block_bq: {
          rules: [28, 29],
          inclusive: false
        },
        block: {
          rules: [23, 24, 25, 26, 27, 30, 31, 32, 33],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 2, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 34, 35, 36, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 79, 80, 81],
          inclusive: true
        }
      }
    };
    return v122;
  }();
  v73.lexer = v121;
  function v169() {
    this.yy = {};
  }
  v3(v169, "Parser");
  v169.prototype = v73;
  v73.Parser = v169;
  return new v169();
}();
parser.parser = parser;
var erDiagram_default = parser;
var ErDB = class {
  constructor() {
    this.entities = new Map();
    this.relationships = [];
    this.classes = new Map();
    this.direction = "TB";
    this.Cardinality = {
      ZERO_OR_ONE: "ZERO_OR_ONE",
      ZERO_OR_MORE: "ZERO_OR_MORE",
      ONE_OR_MORE: "ONE_OR_MORE",
      ONLY_ONE: "ONLY_ONE",
      MD_PARENT: "MD_PARENT"
    };
    this.Identification = {
      NON_IDENTIFYING: "NON_IDENTIFYING",
      IDENTIFYING: "IDENTIFYING"
    };
    this.setAccTitle = v4;
    this.getAccTitle = v5;
    this.setAccDescription = v6;
    this.getAccDescription = v7;
    this.setDiagramTitle = v8;
    this.getDiagramTitle = v9;
    this.getConfig = v3(() => v10().er, "getConfig");
    this.clear();
    this.addEntity = this.addEntity.bind(this);
    this.addAttributes = this.addAttributes.bind(this);
    this.addRelationship = this.addRelationship.bind(this);
    this.setDirection = this.setDirection.bind(this);
    this.addCssStyles = this.addCssStyles.bind(this);
    this.addClass = this.addClass.bind(this);
    this.setClass = this.setClass.bind(this);
    this.setAccTitle = this.setAccTitle.bind(this);
    this.setAccDescription = this.setAccDescription.bind(this);
  }
  static {
    v3(this, "ErDB");
  }
  addEntity(v170, v171 = "") {
    if (!this.entities.has(v170)) {
      this.entities.set(v170, {
        id: "entity-" + v170 + "-" + this.entities.size,
        label: v170,
        attributes: [],
        alias: v171,
        shape: "erBox",
        look: v10().look ?? "default",
        cssClasses: "default",
        cssStyles: [],
        labelType: "markdown"
      });
      v11.info("Added new entity :", v170);
    } else if (!this.entities.get(v170)?.alias && v171) {
      this.entities.get(v170).alias = v171;
      v11.info("Add alias '" + v171 + "' to entity '" + v170 + "'");
    }
    return this.entities.get(v170);
  }
  getEntity(v172) {
    return this.entities.get(v172);
  }
  getEntities() {
    return this.entities;
  }
  getClasses() {
    return this.classes;
  }
  addAttributes(v173, v174) {
    const v175 = this.addEntity(v173);
    let v176;
    for (v176 = v174.length - 1; v176 >= 0; v176--) {
      if (!v174[v176].keys) {
        v174[v176].keys = [];
      }
      if (!v174[v176].comment) {
        v174[v176].comment = "";
      }
      v175.attributes.push(v174[v176]);
      v11.debug("Added attribute ", v174[v176].name);
    }
  }
  addRelationship(v177, v178, v179, v180) {
    const v181 = this.entities.get(v177);
    const v182 = this.entities.get(v179);
    if (!v181 || !v182) {
      return;
    }
    const v183 = {
      entityA: v181.id,
      roleA: v178,
      entityB: v182.id,
      relSpec: v180
    };
    this.relationships.push(v183);
    v11.debug("Added new relationship :", v183);
  }
  getRelationships() {
    return this.relationships;
  }
  getDirection() {
    return this.direction;
  }
  setDirection(v184) {
    this.direction = v184;
  }
  getCompiledStyles(v185) {
    let v186 = [];
    for (const v187 of v185) {
      const v188 = this.classes.get(v187);
      if (v188?.styles) {
        v186 = [...v186, ...(v188.styles ?? [])].map(v189 => v189.trim());
      }
      if (v188?.textStyles) {
        v186 = [...v186, ...(v188.textStyles ?? [])].map(v190 => v190.trim());
      }
    }
    return v186;
  }
  addCssStyles(v191, v192) {
    for (const v193 of v191) {
      const v194 = this.entities.get(v193);
      if (!v192 || !v194) {
        return;
      }
      for (const v195 of v192) {
        v194.cssStyles.push(v195);
      }
    }
  }
  addClass(v196, v197) {
    v196.forEach(v198 => {
      let v199 = this.classes.get(v198);
      if (v199 === undefined) {
        v199 = {
          id: v198,
          styles: [],
          textStyles: []
        };
        this.classes.set(v198, v199);
      }
      if (v197) {
        v197.forEach(function (v200) {
          if (/color/.exec(v200)) {
            const v201 = v200.replace("fill", "bgFill");
            v199.textStyles.push(v201);
          }
          v199.styles.push(v200);
        });
      }
    });
  }
  setClass(v202, v203) {
    for (const v204 of v202) {
      const v205 = this.entities.get(v204);
      if (v205) {
        for (const v206 of v203) {
          v205.cssClasses += " " + v206;
        }
      }
    }
  }
  clear() {
    this.entities = new Map();
    this.classes = new Map();
    this.relationships = [];
    v12();
  }
  getData() {
    const v207 = [];
    const v208 = [];
    const v209 = v10();
    let v210 = 0;
    for (const v211 of this.entities.keys()) {
      const v212 = this.entities.get(v211);
      if (v212) {
        v212.cssCompiledStyles = this.getCompiledStyles(v212.cssClasses.split(" "));
        v212.colorIndex = v210++;
        v207.push(v212);
      }
    }
    let v213 = 0;
    for (const v214 of this.relationships) {
      const v215 = {
        id: v13(v214.entityA, v214.entityB, {
          prefix: "id",
          counter: v213++
        }),
        type: "normal",
        curve: "basis",
        start: v214.entityA,
        end: v214.entityB,
        label: v214.roleA,
        labelpos: "c",
        thickness: "normal",
        classes: "relationshipLine",
        arrowTypeStart: v214.relSpec.cardB.toLowerCase(),
        arrowTypeEnd: v214.relSpec.cardA.toLowerCase(),
        pattern: v214.relSpec.relType == "IDENTIFYING" ? "solid" : "dashed",
        look: v209.look,
        labelType: "markdown"
      };
      v208.push(v215);
    }
    return {
      nodes: v207,
      edges: v208,
      other: {},
      config: v209,
      direction: "TB"
    };
  }
};
var erRenderer_unified_exports = {};
v15(erRenderer_unified_exports, {
  draw: () => draw
});
var draw = v3(async function (v216, v217, v218, v219) {
  v11.info("REF0:");
  v11.info("Drawing er diagram (unified)", v217);
  const {
    securityLevel: v220,
    er: v221,
    layout: v222
  } = v10();
  const v223 = v219.db.getData();
  const v224 = v1(v217, v220);
  v223.type = v219.type;
  v223.layoutAlgorithm = v16(v222);
  v223.config.flowchart.nodeSpacing = v221?.nodeSpacing || 140;
  v223.config.flowchart.rankSpacing = v221?.rankSpacing || 80;
  v223.direction = v219.db.getDirection();
  const {
    config: v225
  } = v223;
  const {
    look: v226
  } = v225;
  if (v226 === "neo") {
    v223.markers = ["only_one_neo", "zero_or_one_neo", "one_or_more_neo", "zero_or_more_neo"];
  } else {
    v223.markers = ["only_one", "zero_or_one", "one_or_more", "zero_or_more"];
  }
  v223.diagramId = v217;
  await v17(v223, v224);
  if (v223.layoutAlgorithm === "elk") {
    v224.select(".edges").lower();
  }
  const v227 = v224.selectAll("[id*=\"-background\"]");
  if (Array.from(v227).length > 0) {
    v227.each(function () {
      const v228 = v18(this);
      const v229 = v228.attr("id");
      const v230 = v229.replace("-background", "");
      const v231 = v224.select("#" + CSS.escape(v230));
      if (!v231.empty()) {
        const v232 = v231.attr("transform");
        v228.attr("transform", v232);
      }
    });
  }
  const v233 = 8;
  v19.insertTitle(v224, "erDiagramTitleText", v221?.titleTopMargin ?? 25, v219.db.getDiagramTitle());
  v2(v224, v233, "erDiagram", v221?.useMaxWidth ?? true);
}, "draw");
var fade = v3((v234, v235) => {
  const v236 = v20;
  const v237 = v236(v234, "r");
  const v238 = v236(v234, "g");
  const v239 = v236(v234, "b");
  return v14(v237, v238, v239, v235);
}, "fade");
var COLOR_THEMES = new Set(["redux-color", "redux-dark-color"]);
var genColor = v3(v240 => {
  const {
    theme: v241,
    look: v242,
    bkgColorArray: v243,
    borderColorArray: v244
  } = v240;
  if (!COLOR_THEMES.has(v241)) {
    return "";
  }
  const v245 = v243?.length > 0;
  let v246 = "";
  for (let v247 = 0; v247 < v240.THEME_COLOR_LIMIT; v247++) {
    v246 += "\n\n    [data-look=\"" + v242 + "\"][data-color-id=\"color-" + v247 + "\"].node path {\n    stroke: " + v244[v247] + ";\n    " + (v245 ? "fill: " + v243[v247] + ";" : "") + "\n    }\n\n    [data-look=\"" + v242 + "\"][data-color-id=\"color-" + v247 + "\"].node  rect {\n    stroke: " + v244[v247] + ";\n    " + (v245 ? "fill: " + v243[v247] + ";" : "") + "\n     }\n    ";
  }
  return v246;
}, "genColor");
var getStyles = v3(v248 => {
  const {
    look: v249,
    theme: v250,
    erEdgeLabelBackground: v251,
    strokeWidth: v252
  } = v248;
  return "\n    " + genColor(v248) + "\n  .entityBox {\n    fill: " + v248.mainBkg + ";\n    stroke: " + v248.nodeBorder + ";\n  }\n\n  .relationshipLabelBox {\n    fill: " + v248.tertiaryColor + ";\n    opacity: 0.7;\n    background-color: " + v248.tertiaryColor + ";\n      rect {\n        opacity: 0.5;\n      }\n  }\n\n  .labelBkg {\n    background-color: " + (COLOR_THEMES.has(v250) && v251 ? v251 : fade(v248.tertiaryColor, 0.5)) + ";\n  }\n\n  .edgeLabel {\n    background-color: " + (COLOR_THEMES.has(v250) && v251 ? v251 : v248.edgeLabelBackground) + ";\n  }\n  .edgeLabel .label rect {\n    fill: " + (COLOR_THEMES.has(v250) && v251 ? v251 : v248.edgeLabelBackground) + ";\n  }\n  .edgeLabel .label text {\n    fill: " + v248.textColor + ";\n  }\n\n  .edgeLabel .label {\n    fill: " + v248.nodeBorder + ";\n    font-size: 14px;\n  }\n\n  .label {\n    font-family: " + v248.fontFamily + ";\n    color: " + (v248.nodeTextColor || v248.textColor) + ";\n  }\n\n  .edge-pattern-dashed {\n    stroke-dasharray: 8,8;\n  }\n\n  .node rect,\n  .node circle,\n  .node ellipse,\n  .node polygon\n  {\n    fill: " + v248.mainBkg + ";\n    stroke: " + v248.nodeBorder + ";\n    stroke-width: " + (v249 === "neo" ? v252 : "1px") + ";\n  }\n\n  .relationshipLine {\n    stroke: " + v248.lineColor + ";\n    stroke-width: " + (v249 === "neo" ? v252 : "1px") + ";\n    fill: none;\n  }\n\n  .marker {\n    fill: none !important;\n    stroke: " + v248.lineColor + " !important;\n    stroke-width: 1;\n  }\n  [data-look=neo].labelBkg {\n    background-color: " + fade(v248.tertiaryColor, 0.5) + ";\n  }\n";
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: erDiagram_default,
  get db() {
    return new ErDB();
  },
  renderer: erRenderer_unified_exports,
  styles: styles_default
};
export { diagram };