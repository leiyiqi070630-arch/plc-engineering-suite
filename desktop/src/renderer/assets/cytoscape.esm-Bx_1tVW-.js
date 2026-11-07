function _arrayLikeToArray(v3, v4) {
  if (v4 == null || v4 > v3.length) {
    v4 = v3.length;
  }
  for (var v5 = 0, v6 = Array(v4); v5 < v4; v5++) {
    v6[v5] = v3[v5];
  }
  return v6;
}
function _arrayWithHoles(v7) {
  if (Array.isArray(v7)) {
    return v7;
  }
}
function _arrayWithoutHoles(v8) {
  if (Array.isArray(v8)) {
    return _arrayLikeToArray(v8);
  }
}
function _classCallCheck(v9, v10) {
  if (!(v9 instanceof v10)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(v11, v12) {
  for (var v13 = 0; v13 < v12.length; v13++) {
    var v14 = v12[v13];
    v14.enumerable = v14.enumerable || false;
    v14.configurable = true;
    if ("value" in v14) {
      v14.writable = true;
    }
    Object.defineProperty(v11, _toPropertyKey(v14.key), v14);
  }
}
function _createClass(v15, v16, v17) {
  if (v16) {
    _defineProperties(v15.prototype, v16);
  }
  Object.defineProperty(v15, "prototype", {
    writable: false
  });
  return v15;
}
function _createForOfIteratorHelper(v18, v19) {
  var v20 = typeof Symbol != "undefined" && v18[Symbol.iterator] || v18["@@iterator"];
  if (!v20) {
    if (Array.isArray(v18) || (v20 = _unsupportedIterableToArray(v18)) || v19) {
      if (v20) {
        v18 = v20;
      }
      var v21 = 0;
      function v22() {}
      return {
        s: v22,
        n: function () {
          if (v21 >= v18.length) {
            return {
              done: true
            };
          } else {
            return {
              done: false,
              value: v18[v21++]
            };
          }
        },
        e: function (v23) {
          throw v23;
        },
        f: v22
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var v24;
  var v25 = true;
  var v26 = false;
  return {
    s: function () {
      v20 = v20.call(v18);
    },
    n: function () {
      var v27 = v20.next();
      v25 = v27.done;
      return v27;
    },
    e: function (v28) {
      v26 = true;
      v24 = v28;
    },
    f: function () {
      try {
        if (!v25 && v20.return != null) {
          v20.return();
        }
      } finally {
        if (v26) {
          throw v24;
        }
      }
    }
  };
}
function _defineProperty$1(v29, v30, v31) {
  if ((v30 = _toPropertyKey(v30)) in v29) {
    Object.defineProperty(v29, v30, {
      value: v31,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    v29[v30] = v31;
  }
  return v29;
}
function _iterableToArray(v32) {
  if (typeof Symbol != "undefined" && v32[Symbol.iterator] != null || v32["@@iterator"] != null) {
    return Array.from(v32);
  }
}
function _iterableToArrayLimit(v33, v34) {
  var v35 = v33 == null ? null : typeof Symbol != "undefined" && v33[Symbol.iterator] || v33["@@iterator"];
  if (v35 != null) {
    var v36;
    var v37;
    var v38;
    var v39;
    var v40 = [];
    var v41 = true;
    var v42 = false;
    try {
      v38 = (v35 = v35.call(v33)).next;
      if (v34 === 0) {
        if (Object(v35) !== v35) {
          return;
        }
        v41 = false;
      } else {
        for (; !(v41 = (v36 = v38.call(v35)).done) && (v40.push(v36.value), v40.length !== v34); v41 = true);
      }
    } catch (v43) {
      v42 = true;
      v37 = v43;
    } finally {
      try {
        if (!v41 && v35.return != null && (v39 = v35.return(), Object(v39) !== v39)) {
          return;
        }
      } finally {
        if (v42) {
          throw v37;
        }
      }
    }
    return v40;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _slicedToArray(v44, v45) {
  return _arrayWithHoles(v44) || _iterableToArrayLimit(v44, v45) || _unsupportedIterableToArray(v44, v45) || _nonIterableRest();
}
function _toConsumableArray(v46) {
  return _arrayWithoutHoles(v46) || _iterableToArray(v46) || _unsupportedIterableToArray(v46) || _nonIterableSpread();
}
function _toPrimitive(v47, v48) {
  if (typeof v47 != "object" || !v47) {
    return v47;
  }
  var v49 = v47[Symbol.toPrimitive];
  if (v49 !== undefined) {
    var v50 = v49.call(v47, v48);
    if (typeof v50 != "object") {
      return v50;
    }
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return String(v47);
}
function _toPropertyKey(v51) {
  var v52 = _toPrimitive(v51, "string");
  if (typeof v52 == "symbol") {
    return v52;
  } else {
    return v52 + "";
  }
}
function _typeof(v53) {
  '@babel/helpers - typeof';

  _typeof = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function (v54) {
    return typeof v54;
  } : function (v55) {
    if (v55 && typeof Symbol == "function" && v55.constructor === Symbol && v55 !== Symbol.prototype) {
      return "symbol";
    } else {
      return typeof v55;
    }
  };
  return _typeof(v53);
}
function _unsupportedIterableToArray(v56, v57) {
  if (v56) {
    if (typeof v56 == "string") {
      return _arrayLikeToArray(v56, v57);
    }
    var v58 = {}.toString.call(v56).slice(8, -1);
    if (v58 === "Object" && v56.constructor) {
      v58 = v56.constructor.name;
    }
    if (v58 === "Map" || v58 === "Set") {
      return Array.from(v56);
    } else if (v58 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(v58)) {
      return _arrayLikeToArray(v56, v57);
    } else {
      return undefined;
    }
  }
}
var _window = typeof window === "undefined" ? null : window;
var navigator = _window ? _window.navigator : null;
if (_window) {
  _window.document;
} else {
  null;
}
var typeofstr = _typeof("");
var typeofobj = _typeof({});
var typeoffn = _typeof(function () {});
var typeofhtmlele = typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement);
var instanceStr = function instanceStr2(v59) {
  if (v59 && v59.instanceString && fn$6(v59.instanceString)) {
    return v59.instanceString();
  } else {
    return null;
  }
};
var string = function string2(v60) {
  return v60 != null && _typeof(v60) == typeofstr;
};
var fn$6 = function fn(v61) {
  return v61 != null && _typeof(v61) === typeoffn;
};
var array = function array2(v62) {
  return !elementOrCollection(v62) && (Array.isArray ? Array.isArray(v62) : v62 != null && v62 instanceof Array);
};
var plainObject = function plainObject2(v63) {
  return v63 != null && _typeof(v63) === typeofobj && !array(v63) && v63.constructor === Object;
};
var object = function object2(v64) {
  return v64 != null && _typeof(v64) === typeofobj;
};
var number$1 = function number(v65) {
  return v65 != null && _typeof(v65) === _typeof(1) && !isNaN(v65);
};
var integer = function integer2(v66) {
  return number$1(v66) && Math.floor(v66) === v66;
};
var htmlElement = function htmlElement2(v67) {
  if (typeofhtmlele === "undefined") {
    return undefined;
  } else {
    return v67 != null && v67 instanceof HTMLElement;
  }
};
var elementOrCollection = function elementOrCollection2(v68) {
  return element(v68) || collection(v68);
};
var element = function element2(v69) {
  return instanceStr(v69) === "collection" && v69._private.single;
};
var collection = function collection2(v70) {
  return instanceStr(v70) === "collection" && !v70._private.single;
};
var core = function core2(v71) {
  return instanceStr(v71) === "core";
};
var stylesheet = function stylesheet2(v72) {
  return instanceStr(v72) === "stylesheet";
};
var event = function event2(v73) {
  return instanceStr(v73) === "event";
};
var emptyString = function emptyString2(v74) {
  if (v74 === undefined || v74 === null) {
    return true;
  } else if (v74 === "" || v74.match(/^\s+$/)) {
    return true;
  }
  return false;
};
var domElement = function domElement2(v75) {
  if (typeof HTMLElement === "undefined") {
    return false;
  } else {
    return v75 instanceof HTMLElement;
  }
};
var boundingBox = function boundingBox2(v76) {
  return plainObject(v76) && number$1(v76.x1) && number$1(v76.x2) && number$1(v76.y1) && number$1(v76.y2);
};
var promise = function promise2(v77) {
  return object(v77) && fn$6(v77.then);
};
var ms = function ms2() {
  return navigator && navigator.userAgent.match(/msie|trident|edge/i);
};
var memoize = function memoize2(v78, v79) {
  if (!v79) {
    v79 = function v80() {
      if (arguments.length === 1) {
        return arguments[0];
      } else if (arguments.length === 0) {
        return "undefined";
      }
      var v81 = [];
      for (var v82 = 0; v82 < arguments.length; v82++) {
        v81.push(arguments[v82]);
      }
      return v81.join("$");
    };
  }
  var v83 = function v84() {
    var v85 = this;
    var v86 = arguments;
    var v87;
    var v88 = v79.apply(v85, v86);
    var v89 = v83.cache;
    if (!(v87 = v89[v88])) {
      v87 = v89[v88] = v78.apply(v85, v86);
    }
    return v87;
  };
  v83.cache = {};
  return v83;
};
var camel2dash = memoize(function (v90) {
  return v90.replace(/([A-Z])/g, function (v91) {
    return "-" + v91.toLowerCase();
  });
});
var dash2camel = memoize(function (v92) {
  return v92.replace(/(-\w)/g, function (v93) {
    return v93[1].toUpperCase();
  });
});
var prependCamel = memoize(function (v94, v95) {
  return v94 + v95[0].toUpperCase() + v95.substring(1);
}, function (v96, v97) {
  return v96 + "$" + v97;
});
var capitalize = function capitalize2(v98) {
  if (emptyString(v98)) {
    return v98;
  }
  return v98.charAt(0).toUpperCase() + v98.substring(1);
};
var endsWith = function endsWith2(v99, v100) {
  return v99.slice(v100.length * -1) === v100;
};
var number2 = "(?:[-+]?(?:(?:\\d+|\\d*\\.\\d+)(?:[Ee][+-]?\\d+)?))";
var rgba = "rgb[a]?\\((" + number2 + "[%]?)\\s*,\\s*(" + number2 + "[%]?)\\s*,\\s*(" + number2 + "[%]?)(?:\\s*,\\s*(" + number2 + "))?\\)";
var rgbaNoBackRefs = "rgb[a]?\\((?:" + number2 + "[%]?)\\s*,\\s*(?:" + number2 + "[%]?)\\s*,\\s*(?:" + number2 + "[%]?)(?:\\s*,\\s*(?:" + number2 + "))?\\)";
var hsla = "hsl[a]?\\((" + number2 + ")\\s*,\\s*(" + number2 + "[%])\\s*,\\s*(" + number2 + "[%])(?:\\s*,\\s*(" + number2 + "))?\\)";
var hslaNoBackRefs = "hsl[a]?\\((?:" + number2 + ")\\s*,\\s*(?:" + number2 + "[%])\\s*,\\s*(?:" + number2 + "[%])(?:\\s*,\\s*(?:" + number2 + "))?\\)";
var hex3 = "\\#[0-9a-fA-F]{3}";
var hex6 = "\\#[0-9a-fA-F]{6}";
var ascending = function ascending2(v101, v102) {
  if (v101 < v102) {
    return -1;
  } else if (v101 > v102) {
    return 1;
  } else {
    return 0;
  }
};
var descending = function descending2(v103, v104) {
  return ascending(v103, v104) * -1;
};
var extend = Object.assign != null ? Object.assign.bind(Object) : function (v105) {
  var v106 = arguments;
  for (var v107 = 1; v107 < v106.length; v107++) {
    var v108 = v106[v107];
    if (v108 == null) {
      continue;
    }
    var v109 = Object.keys(v108);
    for (var v110 = 0; v110 < v109.length; v110++) {
      var v111 = v109[v110];
      v105[v111] = v108[v111];
    }
  }
  return v105;
};
var hex2tuple = function hex2tuple2(v112) {
  if (v112.length !== 4 && v112.length !== 7 || v112[0] !== "#") {
    return;
  }
  var v113 = v112.length === 4;
  var v114;
  var v115;
  var v116;
  var v117 = 16;
  if (v113) {
    v114 = parseInt(v112[1] + v112[1], v117);
    v115 = parseInt(v112[2] + v112[2], v117);
    v116 = parseInt(v112[3] + v112[3], v117);
  } else {
    v114 = parseInt(v112[1] + v112[2], v117);
    v115 = parseInt(v112[3] + v112[4], v117);
    v116 = parseInt(v112[5] + v112[6], v117);
  }
  return [v114, v115, v116];
};
var hsl2tuple = function hsl2tuple2(v118) {
  var v119;
  var v120;
  var v121;
  var v122;
  var v123;
  var v124;
  var v125;
  var v126;
  function v127(v128, v129, v130) {
    if (v130 < 0) {
      v130 += 1;
    }
    if (v130 > 1) {
      v130 -= 1;
    }
    if (v130 < 1 / 6) {
      return v128 + (v129 - v128) * 6 * v130;
    }
    if (v130 < 1 / 2) {
      return v129;
    }
    if (v130 < 2 / 3) {
      return v128 + (v129 - v128) * (2 / 3 - v130) * 6;
    }
    return v128;
  }
  var v131 = new RegExp("^" + hsla + "$").exec(v118);
  if (v131) {
    v120 = parseInt(v131[1]);
    if (v120 < 0) {
      v120 = (360 - v120 * -1 % 360) % 360;
    } else if (v120 > 360) {
      v120 = v120 % 360;
    }
    v120 /= 360;
    v121 = parseFloat(v131[2]);
    if (v121 < 0 || v121 > 100) {
      return;
    }
    v121 = v121 / 100;
    v122 = parseFloat(v131[3]);
    if (v122 < 0 || v122 > 100) {
      return;
    }
    v122 = v122 / 100;
    v123 = v131[4];
    if (v123 !== undefined) {
      v123 = parseFloat(v123);
      if (v123 < 0 || v123 > 1) {
        return;
      }
    }
    if (v121 === 0) {
      v124 = v125 = v126 = Math.round(v122 * 255);
    } else {
      var v132 = v122 < 0.5 ? v122 * (1 + v121) : v122 + v121 - v122 * v121;
      var v133 = v122 * 2 - v132;
      v124 = Math.round(v127(v133, v132, v120 + 1 / 3) * 255);
      v125 = Math.round(v127(v133, v132, v120) * 255);
      v126 = Math.round(v127(v133, v132, v120 - 1 / 3) * 255);
    }
    v119 = [v124, v125, v126, v123];
  }
  return v119;
};
var rgb2tuple = function rgb2tuple2(v134) {
  var v135;
  var v136 = new RegExp("^" + rgba + "$").exec(v134);
  if (v136) {
    v135 = [];
    var v137 = [];
    for (var v138 = 1; v138 <= 3; v138++) {
      var v139 = v136[v138];
      if (v139[v139.length - 1] === "%") {
        v137[v138] = true;
      }
      v139 = parseFloat(v139);
      if (v137[v138]) {
        v139 = v139 / 100 * 255;
      }
      if (v139 < 0 || v139 > 255) {
        return;
      }
      v135.push(Math.floor(v139));
    }
    var v140 = v137[1] || v137[2] || v137[3];
    var v141 = v137[1] && v137[2] && v137[3];
    if (v140 && !v141) {
      return;
    }
    var v142 = v136[4];
    if (v142 !== undefined) {
      v142 = parseFloat(v142);
      if (v142 < 0 || v142 > 1) {
        return;
      }
      v135.push(v142);
    }
  }
  return v135;
};
var colorname2tuple = function colorname2tuple2(v143) {
  return colors[v143.toLowerCase()];
};
var color2tuple = function color2tuple2(v144) {
  return (array(v144) ? v144 : null) || colorname2tuple(v144) || hex2tuple(v144) || rgb2tuple(v144) || hsl2tuple(v144);
};
var colors = {
  transparent: [0, 0, 0, 0],
  aliceblue: [240, 248, 255],
  antiquewhite: [250, 235, 215],
  aqua: [0, 255, 255],
  aquamarine: [127, 255, 212],
  azure: [240, 255, 255],
  beige: [245, 245, 220],
  bisque: [255, 228, 196],
  black: [0, 0, 0],
  blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255],
  blueviolet: [138, 43, 226],
  brown: [165, 42, 42],
  burlywood: [222, 184, 135],
  cadetblue: [95, 158, 160],
  chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30],
  coral: [255, 127, 80],
  cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220],
  crimson: [220, 20, 60],
  cyan: [0, 255, 255],
  darkblue: [0, 0, 139],
  darkcyan: [0, 139, 139],
  darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169],
  darkgreen: [0, 100, 0],
  darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107],
  darkmagenta: [139, 0, 139],
  darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0],
  darkorchid: [153, 50, 204],
  darkred: [139, 0, 0],
  darksalmon: [233, 150, 122],
  darkseagreen: [143, 188, 143],
  darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
  darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211],
  deeppink: [255, 20, 147],
  deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105],
  dimgrey: [105, 105, 105],
  dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34],
  floralwhite: [255, 250, 240],
  forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255],
  gainsboro: [220, 220, 220],
  ghostwhite: [248, 248, 255],
  gold: [255, 215, 0],
  goldenrod: [218, 165, 32],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  green: [0, 128, 0],
  greenyellow: [173, 255, 47],
  honeydew: [240, 255, 240],
  hotpink: [255, 105, 180],
  indianred: [205, 92, 92],
  indigo: [75, 0, 130],
  ivory: [255, 255, 240],
  khaki: [240, 230, 140],
  lavender: [230, 230, 250],
  lavenderblush: [255, 240, 245],
  lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205],
  lightblue: [173, 216, 230],
  lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255],
  lightgoldenrodyellow: [250, 250, 210],
  lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144],
  lightgrey: [211, 211, 211],
  lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122],
  lightseagreen: [32, 178, 170],
  lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153],
  lightslategrey: [119, 136, 153],
  lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224],
  lime: [0, 255, 0],
  limegreen: [50, 205, 50],
  linen: [250, 240, 230],
  magenta: [255, 0, 255],
  maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170],
  mediumblue: [0, 0, 205],
  mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219],
  mediumseagreen: [60, 179, 113],
  mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154],
  mediumturquoise: [72, 209, 204],
  mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112],
  mintcream: [245, 255, 250],
  mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181],
  navajowhite: [255, 222, 173],
  navy: [0, 0, 128],
  oldlace: [253, 245, 230],
  olive: [128, 128, 0],
  olivedrab: [107, 142, 35],
  orange: [255, 165, 0],
  orangered: [255, 69, 0],
  orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170],
  palegreen: [152, 251, 152],
  paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147],
  papayawhip: [255, 239, 213],
  peachpuff: [255, 218, 185],
  peru: [205, 133, 63],
  pink: [255, 192, 203],
  plum: [221, 160, 221],
  powderblue: [176, 224, 230],
  purple: [128, 0, 128],
  red: [255, 0, 0],
  rosybrown: [188, 143, 143],
  royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19],
  salmon: [250, 128, 114],
  sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87],
  seashell: [255, 245, 238],
  sienna: [160, 82, 45],
  silver: [192, 192, 192],
  skyblue: [135, 206, 235],
  slateblue: [106, 90, 205],
  slategray: [112, 128, 144],
  slategrey: [112, 128, 144],
  snow: [255, 250, 250],
  springgreen: [0, 255, 127],
  steelblue: [70, 130, 180],
  tan: [210, 180, 140],
  teal: [0, 128, 128],
  thistle: [216, 191, 216],
  tomato: [255, 99, 71],
  turquoise: [64, 224, 208],
  violet: [238, 130, 238],
  wheat: [245, 222, 179],
  white: [255, 255, 255],
  whitesmoke: [245, 245, 245],
  yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50]
};
var setMap = function setMap2(v145) {
  var v146 = v145.map;
  var v147 = v145.keys;
  var v148 = v147.length;
  for (var v149 = 0; v149 < v148; v149++) {
    var v150 = v147[v149];
    if (plainObject(v150)) {
      throw Error("Tried to set map with object key");
    }
    if (v149 < v147.length - 1) {
      if (v146[v150] == null) {
        v146[v150] = {};
      }
      v146 = v146[v150];
    } else {
      v146[v150] = v145.value;
    }
  }
};
var getMap = function getMap2(v151) {
  var v152 = v151.map;
  var v153 = v151.keys;
  var v154 = v153.length;
  for (var v155 = 0; v155 < v154; v155++) {
    var v156 = v153[v155];
    if (plainObject(v156)) {
      throw Error("Tried to get map with object key");
    }
    v152 = v152[v156];
    if (v152 == null) {
      return v152;
    }
  }
  return v152;
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(v157) {
  if (v157 && v157.__esModule && Object.prototype.hasOwnProperty.call(v157, "default")) {
    return v157.default;
  } else {
    return v157;
  }
}
var isObject_1;
var hasRequiredIsObject;
function requireIsObject() {
  if (hasRequiredIsObject) {
    return isObject_1;
  }
  hasRequiredIsObject = 1;
  function v158(v159) {
    var v160 = typeof v159;
    return v159 != null && (v160 == "object" || v160 == "function");
  }
  isObject_1 = v158;
  return isObject_1;
}
var _freeGlobal;
var hasRequired_freeGlobal;
function require_freeGlobal() {
  if (hasRequired_freeGlobal) {
    return _freeGlobal;
  }
  hasRequired_freeGlobal = 1;
  var v161 = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
  _freeGlobal = v161;
  return _freeGlobal;
}
var _root;
var hasRequired_root;
function require_root() {
  if (hasRequired_root) {
    return _root;
  }
  hasRequired_root = 1;
  var v162 = require_freeGlobal();
  var v163 = typeof self == "object" && self && self.Object === Object && self;
  var v164 = v162 || v163 || Function("return this")();
  _root = v164;
  return _root;
}
var now_1;
var hasRequiredNow;
function requireNow() {
  if (hasRequiredNow) {
    return now_1;
  }
  hasRequiredNow = 1;
  var v165 = require_root();
  function v166() {
    return v165.Date.now();
  }
  now_1 = v166;
  return now_1;
}
var _trimmedEndIndex;
var hasRequired_trimmedEndIndex;
function require_trimmedEndIndex() {
  if (hasRequired_trimmedEndIndex) {
    return _trimmedEndIndex;
  }
  hasRequired_trimmedEndIndex = 1;
  var v167 = /\s/;
  function v168(v169) {
    var v170 = v169.length;
    while (v170-- && v167.test(v169.charAt(v170))) {}
    return v170;
  }
  _trimmedEndIndex = v168;
  return _trimmedEndIndex;
}
var _baseTrim;
var hasRequired_baseTrim;
function require_baseTrim() {
  if (hasRequired_baseTrim) {
    return _baseTrim;
  }
  hasRequired_baseTrim = 1;
  var v171 = require_trimmedEndIndex();
  var v172 = /^\s+/;
  function v173(v174) {
    if (v174) {
      return v174.slice(0, v171(v174) + 1).replace(v172, "");
    } else {
      return v174;
    }
  }
  _baseTrim = v173;
  return _baseTrim;
}
var _Symbol;
var hasRequired_Symbol;
function require_Symbol() {
  if (hasRequired_Symbol) {
    return _Symbol;
  }
  hasRequired_Symbol = 1;
  var v175 = require_root();
  var v176 = v175.Symbol;
  _Symbol = v176;
  return _Symbol;
}
var _getRawTag;
var hasRequired_getRawTag;
function require_getRawTag() {
  if (hasRequired_getRawTag) {
    return _getRawTag;
  }
  hasRequired_getRawTag = 1;
  var v177 = require_Symbol();
  var v178 = Object.prototype;
  var v179 = v178.hasOwnProperty;
  var v180 = v178.toString;
  var v181 = v177 ? v177.toStringTag : undefined;
  function v182(v183) {
    var v184 = v179.call(v183, v181);
    var v185 = v183[v181];
    try {
      v183[v181] = undefined;
      var v186 = true;
    } catch (v187) {}
    var v188 = v180.call(v183);
    if (v186) {
      if (v184) {
        v183[v181] = v185;
      } else {
        delete v183[v181];
      }
    }
    return v188;
  }
  _getRawTag = v182;
  return _getRawTag;
}
var _objectToString;
var hasRequired_objectToString;
function require_objectToString() {
  if (hasRequired_objectToString) {
    return _objectToString;
  }
  hasRequired_objectToString = 1;
  var v189 = Object.prototype;
  var v190 = v189.toString;
  function v191(v192) {
    return v190.call(v192);
  }
  _objectToString = v191;
  return _objectToString;
}
var _baseGetTag;
var hasRequired_baseGetTag;
function require_baseGetTag() {
  if (hasRequired_baseGetTag) {
    return _baseGetTag;
  }
  hasRequired_baseGetTag = 1;
  var v193 = require_Symbol();
  var v194 = require_getRawTag();
  var v195 = require_objectToString();
  var v196 = "[object Null]";
  var v197 = "[object Undefined]";
  var v198 = v193 ? v193.toStringTag : undefined;
  function v199(v200) {
    if (v200 == null) {
      if (v200 === undefined) {
        return v197;
      } else {
        return v196;
      }
    }
    if (v198 && v198 in Object(v200)) {
      return v194(v200);
    } else {
      return v195(v200);
    }
  }
  _baseGetTag = v199;
  return _baseGetTag;
}
var isObjectLike_1;
var hasRequiredIsObjectLike;
function requireIsObjectLike() {
  if (hasRequiredIsObjectLike) {
    return isObjectLike_1;
  }
  hasRequiredIsObjectLike = 1;
  function v201(v202) {
    return v202 != null && typeof v202 == "object";
  }
  isObjectLike_1 = v201;
  return isObjectLike_1;
}
var isSymbol_1;
var hasRequiredIsSymbol;
function requireIsSymbol() {
  if (hasRequiredIsSymbol) {
    return isSymbol_1;
  }
  hasRequiredIsSymbol = 1;
  var v203 = require_baseGetTag();
  var v204 = requireIsObjectLike();
  var v205 = "[object Symbol]";
  function v206(v207) {
    return typeof v207 == "symbol" || v204(v207) && v203(v207) == v205;
  }
  isSymbol_1 = v206;
  return isSymbol_1;
}
var toNumber_1;
var hasRequiredToNumber;
function requireToNumber() {
  if (hasRequiredToNumber) {
    return toNumber_1;
  }
  hasRequiredToNumber = 1;
  var v208 = require_baseTrim();
  var v209 = requireIsObject();
  var v210 = requireIsSymbol();
  var v211 = 0 / 0;
  var v212 = /^[-+]0x[0-9a-f]+$/i;
  var v213 = /^0b[01]+$/i;
  var v214 = /^0o[0-7]+$/i;
  var v215 = parseInt;
  function v216(v217) {
    if (typeof v217 == "number") {
      return v217;
    }
    if (v210(v217)) {
      return v211;
    }
    if (v209(v217)) {
      var v218 = typeof v217.valueOf == "function" ? v217.valueOf() : v217;
      v217 = v209(v218) ? v218 + "" : v218;
    }
    if (typeof v217 != "string") {
      if (v217 === 0) {
        return v217;
      } else {
        return +v217;
      }
    }
    v217 = v208(v217);
    var v219 = v213.test(v217);
    if (v219 || v214.test(v217)) {
      return v215(v217.slice(2), v219 ? 2 : 8);
    } else if (v212.test(v217)) {
      return v211;
    } else {
      return +v217;
    }
  }
  toNumber_1 = v216;
  return toNumber_1;
}
var debounce_1;
var hasRequiredDebounce;
function requireDebounce() {
  if (hasRequiredDebounce) {
    return debounce_1;
  }
  hasRequiredDebounce = 1;
  var v220 = requireIsObject();
  var v221 = requireNow();
  var v222 = requireToNumber();
  var v223 = "Expected a function";
  var v224 = Math.max;
  var v225 = Math.min;
  function v226(v227, v228, v229) {
    var v230;
    var v231;
    var v232;
    var v233;
    var v234;
    var v235;
    var v236 = 0;
    var v237 = false;
    var v238 = false;
    var v239 = true;
    if (typeof v227 != "function") {
      throw new TypeError(v223);
    }
    v228 = v222(v228) || 0;
    if (v220(v229)) {
      v237 = !!v229.leading;
      v238 = "maxWait" in v229;
      v232 = v238 ? v224(v222(v229.maxWait) || 0, v228) : v232;
      v239 = "trailing" in v229 ? !!v229.trailing : v239;
    }
    function v240(v241) {
      var v242 = v230;
      var v243 = v231;
      v230 = v231 = undefined;
      v236 = v241;
      v233 = v227.apply(v243, v242);
      return v233;
    }
    function v244(v245) {
      v236 = v245;
      v234 = setTimeout(v246, v228);
      if (v237) {
        return v240(v245);
      } else {
        return v233;
      }
    }
    function v247(v248) {
      var v249 = v248 - v235;
      var v250 = v248 - v236;
      var v251 = v228 - v249;
      if (v238) {
        return v225(v251, v232 - v250);
      } else {
        return v251;
      }
    }
    function v252(v253) {
      var v254 = v253 - v235;
      var v255 = v253 - v236;
      return v235 === undefined || v254 >= v228 || v254 < 0 || v238 && v255 >= v232;
    }
    function v246() {
      var v256 = v221();
      if (v252(v256)) {
        return v257(v256);
      }
      v234 = setTimeout(v246, v247(v256));
    }
    function v257(v258) {
      v234 = undefined;
      if (v239 && v230) {
        return v240(v258);
      }
      v230 = v231 = undefined;
      return v233;
    }
    function v259() {
      if (v234 !== undefined) {
        clearTimeout(v234);
      }
      v236 = 0;
      v230 = v235 = v231 = v234 = undefined;
    }
    function v260() {
      if (v234 === undefined) {
        return v233;
      } else {
        return v257(v221());
      }
    }
    function v261() {
      var v262 = v221();
      var v263 = v252(v262);
      v230 = arguments;
      v231 = this;
      v235 = v262;
      if (v263) {
        if (v234 === undefined) {
          return v244(v235);
        }
        if (v238) {
          clearTimeout(v234);
          v234 = setTimeout(v246, v228);
          return v240(v235);
        }
      }
      if (v234 === undefined) {
        v234 = setTimeout(v246, v228);
      }
      return v233;
    }
    v261.cancel = v259;
    v261.flush = v260;
    return v261;
  }
  debounce_1 = v226;
  return debounce_1;
}
var debounceExports = requireDebounce();
var debounce = getDefaultExportFromCjs(debounceExports);
var performance$1 = _window ? _window.performance : null;
var pnow = performance$1 && performance$1.now ? function () {
  return performance$1.now();
} : function () {
  return Date.now();
};
var raf = function () {
  if (_window) {
    if (_window.requestAnimationFrame) {
      return function (v264) {
        _window.requestAnimationFrame(v264);
      };
    } else if (_window.mozRequestAnimationFrame) {
      return function (v265) {
        _window.mozRequestAnimationFrame(v265);
      };
    } else if (_window.webkitRequestAnimationFrame) {
      return function (v266) {
        _window.webkitRequestAnimationFrame(v266);
      };
    } else if (_window.msRequestAnimationFrame) {
      return function (v267) {
        _window.msRequestAnimationFrame(v267);
      };
    }
  }
  return function (v268) {
    if (v268) {
      setTimeout(function () {
        v268(pnow());
      }, 1000 / 60);
    }
  };
}();
var requestAnimationFrame = function requestAnimationFrame2(v269) {
  return raf(v269);
};
var performanceNow = pnow;
var DEFAULT_HASH_SEED = 9261;
var K = 65599;
var DEFAULT_HASH_SEED_ALT = 5381;
var hashIterableInts = function hashIterableInts2(v270, v271 = DEFAULT_HASH_SEED) {
  var v272 = v271;
  var v273;
  while (true) {
    v273 = v270.next();
    if (v273.done) {
      break;
    }
    v272 = v272 * K + v273.value | 0;
  }
  return v272;
};
var hashInt = function hashInt2(v274, v275 = DEFAULT_HASH_SEED) {
  return v275 * K + v274 | 0;
};
var hashIntAlt = function hashIntAlt2(v276, v277 = DEFAULT_HASH_SEED_ALT) {
  return (v277 << 5) + v277 + v276 | 0;
};
var combineHashes = function combineHashes2(v278, v279) {
  return v278 * 2097152 + v279;
};
var combineHashesArray = function combineHashesArray2(v280) {
  return v280[0] * 2097152 + v280[1];
};
var hashArrays = function hashArrays2(v281, v282) {
  return [hashInt(v281[0], v282[0]), hashIntAlt(v281[1], v282[1])];
};
var hashIntsArray = function hashIntsArray2(v283, v284) {
  var v285 = {
    value: 0,
    done: false
  };
  var v286 = 0;
  var v287 = v283.length;
  var v288 = {
    next: function v289() {
      if (v286 < v287) {
        v285.value = v283[v286++];
      } else {
        v285.done = true;
      }
      return v285;
    }
  };
  return hashIterableInts(v288, v284);
};
var hashString = function hashString2(v290, v291) {
  var v292 = {
    value: 0,
    done: false
  };
  var v293 = 0;
  var v294 = v290.length;
  var v295 = {
    next: function v296() {
      if (v293 < v294) {
        v292.value = v290.charCodeAt(v293++);
      } else {
        v292.done = true;
      }
      return v292;
    }
  };
  return hashIterableInts(v295, v291);
};
var hashStrings = function hashStrings2() {
  return hashStringsArray(arguments);
};
var hashStringsArray = function hashStringsArray2(v297) {
  var v298;
  for (var v299 = 0; v299 < v297.length; v299++) {
    var v300 = v297[v299];
    if (v299 === 0) {
      v298 = hashString(v300);
    } else {
      v298 = hashString(v300, v298);
    }
  }
  return v298;
};
function rotatePoint(v301, v302, v303, v304, v305) {
  var v306 = v305 * Math.PI / 180;
  var v307 = Math.cos(v306) * (v301 - v303) - Math.sin(v306) * (v302 - v304) + v303;
  var v308 = Math.sin(v306) * (v301 - v303) + Math.cos(v306) * (v302 - v304) + v304;
  return {
    x: v307,
    y: v308
  };
}
var movePointByBoxAspect = function movePointByBoxAspect2(v309, v310, v311, v312, v313, v314) {
  return {
    x: (v309 - v311) * v313 + v311,
    y: (v310 - v312) * v314 + v312
  };
};
function rotatePosAndSkewByBox(v315, v316, v317) {
  if (v317 === 0) {
    return v315;
  }
  var v318 = (v316.x1 + v316.x2) / 2;
  var v319 = (v316.y1 + v316.y2) / 2;
  var v320 = v316.w / v316.h;
  var v321 = 1 / v320;
  var v322 = rotatePoint(v315.x, v315.y, v318, v319, v317);
  var v323 = movePointByBoxAspect(v322.x, v322.y, v318, v319, v320, v321);
  return {
    x: v323.x,
    y: v323.y
  };
}
var warningsEnabled = true;
var warnSupported = console.warn != null;
var traceSupported = console.trace != null;
var MAX_INT$1 = Number.MAX_SAFE_INTEGER || 9007199254740991;
var trueify = function trueify2() {
  return true;
};
var falsify = function falsify2() {
  return false;
};
var zeroify = function zeroify2() {
  return 0;
};
var noop$1 = function noop() {};
var error = function error2(v324) {
  throw new Error(v324);
};
var warnings = function warnings2(v325) {
  if (v325 !== undefined) {
    warningsEnabled = !!v325;
  } else {
    return warningsEnabled;
  }
};
var warn = function warn2(v326) {
  if (!warnings()) {
    return;
  }
  if (warnSupported) {
    console.warn(v326);
  } else {
    console.log(v326);
    if (traceSupported) {
      console.trace();
    }
  }
};
var clone = function clone2(v327) {
  return extend({}, v327);
};
var copy = function copy2(v328) {
  if (v328 == null) {
    return v328;
  }
  if (array(v328)) {
    return v328.slice();
  } else if (plainObject(v328)) {
    return clone(v328);
  } else {
    return v328;
  }
};
var copyArray = function copyArray2(v329) {
  return v329.slice();
};
var uuid = function uuid2(v330, v331) {
  for (v331 = v330 = ""; v330++ < 36; v331 += v330 * 51 & 52 ? (v330 ^ 15 ? Math.random() * (v330 ^ 20 ? 16 : 4) ^ 8 : 4).toString(16) : "-");
  return v331;
};
var _staticEmptyObject = {};
var staticEmptyObject = function staticEmptyObject2() {
  return _staticEmptyObject;
};
var defaults$g = function defaults(v332) {
  var v333 = Object.keys(v332);
  return function (v334) {
    var v335 = {};
    for (var v336 = 0; v336 < v333.length; v336++) {
      var v337 = v333[v336];
      var v338 = v334 == null ? undefined : v334[v337];
      v335[v337] = v338 === undefined ? v332[v337] : v338;
    }
    return v335;
  };
};
var removeFromArray = function removeFromArray2(v339, v340, v341) {
  for (var v342 = v339.length - 1; v342 >= 0; v342--) {
    if (v339[v342] === v340) {
      v339.splice(v342, 1);
    }
  }
};
var clearArray = function clearArray2(v343) {
  v343.splice(0, v343.length);
};
var push = function push2(v344, v345) {
  for (var v346 = 0; v346 < v345.length; v346++) {
    var v347 = v345[v346];
    v344.push(v347);
  }
};
var getPrefixedProperty = function getPrefixedProperty2(v348, v349, v350) {
  if (v350) {
    v349 = prependCamel(v350, v349);
  }
  return v348[v349];
};
var setPrefixedProperty = function setPrefixedProperty2(v351, v352, v353, v354) {
  if (v353) {
    v352 = prependCamel(v353, v352);
  }
  v351[v352] = v354;
};
var ObjectMap = function () {
  function v355() {
    _classCallCheck(this, v355);
    this._obj = {};
  }
  return _createClass(v355, [{
    key: "set",
    value: function v356(v357, v358) {
      this._obj[v357] = v358;
      return this;
    }
  }, {
    key: "delete",
    value: function v359(v360) {
      this._obj[v360] = undefined;
      return this;
    }
  }, {
    key: "clear",
    value: function v361() {
      this._obj = {};
    }
  }, {
    key: "has",
    value: function v362(v363) {
      return this._obj[v363] !== undefined;
    }
  }, {
    key: "get",
    value: function v364(v365) {
      return this._obj[v365];
    }
  }]);
}();
var Map$1 = typeof Map !== "undefined" ? Map : ObjectMap;
var undef = "undefined";
var ObjectSet = function () {
  function v366(v367) {
    _classCallCheck(this, v366);
    this._obj = Object.create(null);
    this.size = 0;
    if (v367 != null) {
      var v368;
      if (v367.instanceString != null && v367.instanceString() === this.instanceString()) {
        v368 = v367.toArray();
      } else {
        v368 = v367;
      }
      for (var v369 = 0; v369 < v368.length; v369++) {
        this.add(v368[v369]);
      }
    }
  }
  return _createClass(v366, [{
    key: "instanceString",
    value: function v370() {
      return "set";
    }
  }, {
    key: "add",
    value: function v371(v372) {
      var v373 = this._obj;
      if (v373[v372] !== 1) {
        v373[v372] = 1;
        this.size++;
      }
    }
  }, {
    key: "delete",
    value: function v374(v375) {
      var v376 = this._obj;
      if (v376[v375] === 1) {
        v376[v375] = 0;
        this.size--;
      }
    }
  }, {
    key: "clear",
    value: function v377() {
      this._obj = Object.create(null);
    }
  }, {
    key: "has",
    value: function v378(v379) {
      return this._obj[v379] === 1;
    }
  }, {
    key: "toArray",
    value: function v380() {
      var v381 = this;
      return Object.keys(this._obj).filter(function (v382) {
        return v381.has(v382);
      });
    }
  }, {
    key: "forEach",
    value: function v383(v384, v385) {
      return this.toArray().forEach(v384, v385);
    }
  }]);
}();
var Set$1 = (typeof Set === "undefined" ? "undefined" : _typeof(Set)) !== undef ? Set : ObjectSet;
var Element = function Element2(v386, v387, v388 = true) {
  if (v386 === undefined || v387 === undefined || !core(v386)) {
    error("An element must have a core reference and parameters set");
    return;
  }
  var v389 = v387.group;
  if (v389 == null) {
    if (v387.data && v387.data.source != null && v387.data.target != null) {
      v389 = "edges";
    } else {
      v389 = "nodes";
    }
  }
  if (v389 !== "nodes" && v389 !== "edges") {
    error("An element must be of type `nodes` or `edges`; you specified `" + v389 + "`");
    return;
  }
  this.length = 1;
  this[0] = this;
  var v390 = this._private = {
    cy: v386,
    single: true,
    data: v387.data || {},
    position: v387.position || {
      x: 0,
      y: 0
    },
    autoWidth: undefined,
    autoHeight: undefined,
    autoPadding: undefined,
    compoundBoundsClean: false,
    listeners: [],
    group: v389,
    style: {},
    rstyle: {},
    styleCxts: [],
    styleKeys: {},
    removed: true,
    selected: v387.selected ? true : false,
    selectable: v387.selectable === undefined ? true : v387.selectable ? true : false,
    locked: v387.locked ? true : false,
    grabbed: false,
    grabbable: v387.grabbable === undefined ? true : v387.grabbable ? true : false,
    pannable: v387.pannable === undefined ? v389 === "edges" ? true : false : v387.pannable ? true : false,
    active: false,
    classes: new Set$1(),
    animation: {
      current: [],
      queue: []
    },
    rscratch: {},
    scratch: v387.scratch || {},
    edges: [],
    children: [],
    parent: v387.parent && v387.parent.isNode() ? v387.parent : null,
    traversalCache: {},
    backgrounding: false,
    bbCache: null,
    bbCacheShift: {
      x: 0,
      y: 0
    },
    bodyBounds: null,
    overlayBounds: null,
    labelBounds: {
      all: null,
      source: null,
      target: null,
      main: null
    },
    arrowBounds: {
      source: null,
      target: null,
      "mid-source": null,
      "mid-target": null
    }
  };
  if (v390.position.x == null) {
    v390.position.x = 0;
  }
  if (v390.position.y == null) {
    v390.position.y = 0;
  }
  if (v387.renderedPosition) {
    var v391 = v387.renderedPosition;
    var v392 = v386.pan();
    var v393 = v386.zoom();
    v390.position = {
      x: (v391.x - v392.x) / v393,
      y: (v391.y - v392.y) / v393
    };
  }
  var v394 = [];
  if (array(v387.classes)) {
    v394 = v387.classes;
  } else if (string(v387.classes)) {
    v394 = v387.classes.split(/\s+/);
  }
  for (var v395 = 0, v396 = v394.length; v395 < v396; v395++) {
    var v397 = v394[v395];
    if (!v397 || v397 === "") {
      continue;
    }
    v390.classes.add(v397);
  }
  this.createEmitter();
  if (v388 === undefined || v388) {
    this.restore();
  }
  var v398 = v387.style || v387.css;
  if (v398) {
    warn("Setting a `style` bypass at element creation should be done only when absolutely necessary.  Try to use the stylesheet instead.");
    this.style(v398);
  }
};
var defineSearch = function defineSearch2(v399) {
  v399 = {
    bfs: v399.bfs || !v399.dfs,
    dfs: v399.dfs || !v399.bfs
  };
  return function v400(v401, v402, v403) {
    var v404;
    if (plainObject(v401) && !elementOrCollection(v401)) {
      v404 = v401;
      v401 = v404.roots || v404.root;
      v402 = v404.visit;
      v403 = v404.directed;
    }
    v403 = arguments.length === 2 && !fn$6(v402) ? v402 : v403;
    v402 = fn$6(v402) ? v402 : function () {};
    var v405 = this._private.cy;
    var v406 = v401 = string(v401) ? this.filter(v401) : v401;
    var v407 = [];
    var v408 = [];
    var v409 = {};
    var v410 = {};
    var v411 = {};
    var v412 = 0;
    var v413;
    var v414 = this.byGroup();
    var v415 = v414.nodes;
    var v416 = v414.edges;
    for (var v417 = 0; v417 < v406.length; v417++) {
      var v418 = v406[v417];
      var v419 = v418.id();
      if (v418.isNode()) {
        v407.unshift(v418);
        if (v399.bfs) {
          v411[v419] = true;
          v408.push(v418);
        }
        v410[v419] = 0;
      }
    }
    var v420 = function v421() {
      var v422 = v399.bfs ? v407.shift() : v407.pop();
      var v423 = v422.id();
      if (v399.dfs) {
        if (v411[v423]) {
          return 0;
        }
        v411[v423] = true;
        v408.push(v422);
      }
      var v424 = v410[v423];
      var v425 = v409[v423];
      var v426 = v425 != null ? v425.source() : null;
      var v427 = v425 != null ? v425.target() : null;
      var v428 = v425 == null ? undefined : v422.same(v426) ? v427[0] : v426[0];
      var v429;
      v429 = v402(v422, v425, v428, v412++, v424);
      if (v429 === true) {
        v413 = v422;
        return 1;
      }
      if (v429 === false) {
        return 1;
      }
      var v430 = v422.connectedEdges().filter(function (v431) {
        return (!v403 || v431.source().same(v422)) && v416.has(v431);
      });
      for (var v432 = 0; v432 < v430.length; v432++) {
        var v433 = v430[v432];
        var v434 = v433.connectedNodes().filter(function (v435) {
          return !v435.same(v422) && v415.has(v435);
        });
        var v436 = v434.id();
        if (v434.length !== 0 && !v411[v436]) {
          v434 = v434[0];
          v407.push(v434);
          if (v399.bfs) {
            v411[v436] = true;
            v408.push(v434);
          }
          v409[v436] = v433;
          v410[v436] = v410[v423] + 1;
        }
      }
    };
    var v437;
    while (v407.length !== 0) {
      v437 = v420();
      if (v437 === 0) {
        continue;
      }
      if (v437 === 1) {
        break;
      }
    }
    var v438 = v405.collection();
    for (var v439 = 0; v439 < v408.length; v439++) {
      var v440 = v408[v439];
      var v441 = v409[v440.id()];
      if (v441 != null) {
        v438.push(v441);
      }
      v438.push(v440);
    }
    return {
      path: v405.collection(v438),
      found: v405.collection(v413)
    };
  };
};
var elesfn$v = {
  breadthFirstSearch: defineSearch({
    bfs: true
  }),
  depthFirstSearch: defineSearch({
    dfs: true
  })
};
elesfn$v.bfs = elesfn$v.breadthFirstSearch;
elesfn$v.dfs = elesfn$v.depthFirstSearch;
var heap$2 = {
  exports: {}
};
var heap$1 = heap$2.exports;
var hasRequiredHeap$1;
function requireHeap$1() {
  if (hasRequiredHeap$1) {
    return heap$2.exports;
  }
  hasRequiredHeap$1 = 1;
  (function (v442, v443) {
    (function () {
      var v444;
      var v445;
      var v446;
      var v447;
      var v448;
      var v449;
      var v450;
      var v451;
      var v452;
      var v453;
      var v454;
      var v455;
      var v456;
      var v457;
      var v458;
      v446 = Math.floor;
      v453 = Math.min;
      v445 = function (v459, v460) {
        if (v459 < v460) {
          return -1;
        }
        if (v459 > v460) {
          return 1;
        }
        return 0;
      };
      v452 = function (v461, v462, v463, v464, v465) {
        var v466;
        if (v463 == null) {
          v463 = 0;
        }
        if (v465 == null) {
          v465 = v445;
        }
        if (v463 < 0) {
          throw new Error("lo must be non-negative");
        }
        if (v464 == null) {
          v464 = v461.length;
        }
        while (v463 < v464) {
          v466 = v446((v463 + v464) / 2);
          if (v465(v462, v461[v466]) < 0) {
            v464 = v466;
          } else {
            v463 = v466 + 1;
          }
        }
        [].splice.apply(v461, [v463, v463 - v463].concat(v462));
        return v462;
      };
      v449 = function (v467, v468, v469) {
        if (v469 == null) {
          v469 = v445;
        }
        v467.push(v468);
        return v457(v467, 0, v467.length - 1, v469);
      };
      v448 = function (v470, v471) {
        var v472;
        var v473;
        if (v471 == null) {
          v471 = v445;
        }
        v472 = v470.pop();
        if (v470.length) {
          v473 = v470[0];
          v470[0] = v472;
          v458(v470, 0, v471);
        } else {
          v473 = v472;
        }
        return v473;
      };
      v451 = function (v474, v475, v476) {
        var v477;
        if (v476 == null) {
          v476 = v445;
        }
        v477 = v474[0];
        v474[0] = v475;
        v458(v474, 0, v476);
        return v477;
      };
      v450 = function (v478, v479, v480) {
        var v481;
        if (v480 == null) {
          v480 = v445;
        }
        if (v478.length && v480(v478[0], v479) < 0) {
          v481 = [v478[0], v479];
          v479 = v481[0];
          v478[0] = v481[1];
          v458(v478, 0, v480);
        }
        return v479;
      };
      v447 = function (v482, v483) {
        var v484;
        var v485;
        var v486;
        var v487;
        var v488;
        var v489;
        if (v483 == null) {
          v483 = v445;
        }
        v487 = function () {
          v489 = [];
          for (var v490 = 0, v491 = v446(v482.length / 2); v491 >= 0 ? v490 < v491 : v490 > v491; v491 >= 0 ? v490++ : v490--) {
            v489.push(v490);
          }
          return v489;
        }.apply(this).reverse();
        v488 = [];
        v485 = 0;
        v486 = v487.length;
        for (; v485 < v486; v485++) {
          v484 = v487[v485];
          v488.push(v458(v482, v484, v483));
        }
        return v488;
      };
      v456 = function (v492, v493, v494) {
        var v495;
        if (v494 == null) {
          v494 = v445;
        }
        v495 = v492.indexOf(v493);
        if (v495 === -1) {
          return;
        }
        v457(v492, 0, v495, v494);
        return v458(v492, v495, v494);
      };
      v454 = function (v496, v497, v498) {
        var v499;
        var v500;
        var v501;
        var v502;
        var v503;
        if (v498 == null) {
          v498 = v445;
        }
        v500 = v496.slice(0, v497);
        if (!v500.length) {
          return v500;
        }
        v447(v500, v498);
        v503 = v496.slice(v497);
        v501 = 0;
        v502 = v503.length;
        for (; v501 < v502; v501++) {
          v499 = v503[v501];
          v450(v500, v499, v498);
        }
        return v500.sort(v498).reverse();
      };
      v455 = function (v504, v505, v506) {
        var v507;
        var v508;
        var v509;
        var v510;
        var v511;
        var v512;
        var v513;
        var v514;
        var v515;
        if (v506 == null) {
          v506 = v445;
        }
        if (v505 * 10 <= v504.length) {
          v509 = v504.slice(0, v505).sort(v506);
          if (!v509.length) {
            return v509;
          }
          v508 = v509[v509.length - 1];
          v513 = v504.slice(v505);
          v510 = 0;
          v512 = v513.length;
          for (; v510 < v512; v510++) {
            v507 = v513[v510];
            if (v506(v507, v508) < 0) {
              v452(v509, v507, 0, null, v506);
              v509.pop();
              v508 = v509[v509.length - 1];
            }
          }
          return v509;
        }
        v447(v504, v506);
        v515 = [];
        v511 = 0;
        v514 = v453(v505, v504.length);
        for (; v514 >= 0 ? v511 < v514 : v511 > v514; v514 >= 0 ? ++v511 : --v511) {
          v515.push(v448(v504, v506));
        }
        return v515;
      };
      v457 = function (v516, v517, v518, v519) {
        var v520;
        var v521;
        var v522;
        if (v519 == null) {
          v519 = v445;
        }
        v520 = v516[v518];
        while (v518 > v517) {
          v522 = v518 - 1 >> 1;
          v521 = v516[v522];
          if (v519(v520, v521) < 0) {
            v516[v518] = v521;
            v518 = v522;
            continue;
          }
          break;
        }
        return v516[v518] = v520;
      };
      v458 = function (v523, v524, v525) {
        var v526;
        var v527;
        var v528;
        var v529;
        var v530;
        if (v525 == null) {
          v525 = v445;
        }
        v527 = v523.length;
        v530 = v524;
        v528 = v523[v524];
        v526 = v524 * 2 + 1;
        while (v526 < v527) {
          v529 = v526 + 1;
          if (v529 < v527 && !(v525(v523[v526], v523[v529]) < 0)) {
            v526 = v529;
          }
          v523[v524] = v523[v526];
          v524 = v526;
          v526 = v524 * 2 + 1;
        }
        v523[v524] = v528;
        return v457(v523, v530, v524, v525);
      };
      v444 = function () {
        v531.push = v449;
        v531.pop = v448;
        v531.replace = v451;
        v531.pushpop = v450;
        v531.heapify = v447;
        v531.updateItem = v456;
        v531.nlargest = v454;
        v531.nsmallest = v455;
        function v531(v532) {
          this.cmp = v532 ?? v445;
          this.nodes = [];
        }
        v531.prototype.push = function (v533) {
          return v449(this.nodes, v533, this.cmp);
        };
        v531.prototype.pop = function () {
          return v448(this.nodes, this.cmp);
        };
        v531.prototype.peek = function () {
          return this.nodes[0];
        };
        v531.prototype.contains = function (v534) {
          return this.nodes.indexOf(v534) !== -1;
        };
        v531.prototype.replace = function (v535) {
          return v451(this.nodes, v535, this.cmp);
        };
        v531.prototype.pushpop = function (v536) {
          return v450(this.nodes, v536, this.cmp);
        };
        v531.prototype.heapify = function () {
          return v447(this.nodes, this.cmp);
        };
        v531.prototype.updateItem = function (v537) {
          return v456(this.nodes, v537, this.cmp);
        };
        v531.prototype.clear = function () {
          return this.nodes = [];
        };
        v531.prototype.empty = function () {
          return this.nodes.length === 0;
        };
        v531.prototype.size = function () {
          return this.nodes.length;
        };
        v531.prototype.clone = function () {
          var v538;
          v538 = new v531();
          v538.nodes = this.nodes.slice(0);
          return v538;
        };
        v531.prototype.toArray = function () {
          return this.nodes.slice(0);
        };
        v531.prototype.insert = v531.prototype.push;
        v531.prototype.top = v531.prototype.peek;
        v531.prototype.front = v531.prototype.peek;
        v531.prototype.has = v531.prototype.contains;
        v531.prototype.copy = v531.prototype.clone;
        return v531;
      }();
      (function (v539, v540) {
        {
          return v442.exports = v540();
        }
      })(this, function () {
        return v444;
      });
    }).call(heap$1);
  })(heap$2);
  return heap$2.exports;
}
var heap;
var hasRequiredHeap;
function requireHeap() {
  if (hasRequiredHeap) {
    return heap;
  }
  hasRequiredHeap = 1;
  heap = requireHeap$1();
  return heap;
}
var heapExports = requireHeap();
var Heap = getDefaultExportFromCjs(heapExports);
var dijkstraDefaults = defaults$g({
  root: null,
  weight: function weight(v541) {
    return 1;
  },
  directed: false
});
var elesfn$u = {
  dijkstra: function dijkstra(v542) {
    if (!plainObject(v542)) {
      var v543 = arguments;
      v542 = {
        root: v543[0],
        weight: v543[1],
        directed: v543[2]
      };
    }
    var v544 = dijkstraDefaults(v542);
    var v545 = v544.root;
    var v546 = v544.weight;
    var v547 = v544.directed;
    var v548 = this;
    var v549 = v546;
    var v550 = string(v545) ? this.filter(v545)[0] : v545[0];
    var v551 = {};
    var v552 = {};
    var v553 = {};
    var v554 = this.byGroup();
    var v555 = v554.nodes;
    var v556 = v554.edges;
    v556.unmergeBy(function (v557) {
      return v557.isLoop();
    });
    var v558 = function v559(v560) {
      return v551[v560.id()];
    };
    var v561 = function v562(v563, v564) {
      v551[v563.id()] = v564;
      v565.updateItem(v563);
    };
    var v565 = new Heap(function (v566, v567) {
      return v558(v566) - v558(v567);
    });
    for (var v568 = 0; v568 < v555.length; v568++) {
      var v569 = v555[v568];
      v551[v569.id()] = v569.same(v550) ? 0 : Infinity;
      v565.push(v569);
    }
    var v570 = function v571(v572, v573) {
      var v574 = (v547 ? v572.edgesTo(v573) : v572.edgesWith(v573)).intersect(v556);
      var v575 = Infinity;
      var v576;
      for (var v577 = 0; v577 < v574.length; v577++) {
        var v578 = v574[v577];
        var v579 = v549(v578);
        if (v579 < v575 || !v576) {
          v575 = v579;
          v576 = v578;
        }
      }
      return {
        edge: v576,
        dist: v575
      };
    };
    while (v565.size() > 0) {
      var v580 = v565.pop();
      var v581 = v558(v580);
      var v582 = v580.id();
      v553[v582] = v581;
      if (v581 === Infinity) {
        continue;
      }
      var v583 = v580.neighborhood().intersect(v555);
      for (var v584 = 0; v584 < v583.length; v584++) {
        var v585 = v583[v584];
        var v586 = v585.id();
        var v587 = v570(v580, v585);
        var v588 = v581 + v587.dist;
        if (v588 < v558(v585)) {
          v561(v585, v588);
          v552[v586] = {
            node: v580,
            edge: v587.edge
          };
        }
      }
    }
    return {
      distanceTo: function v589(v590) {
        var v591 = string(v590) ? v555.filter(v590)[0] : v590[0];
        return v553[v591.id()];
      },
      pathTo: function v592(v593) {
        var v594 = string(v593) ? v555.filter(v593)[0] : v593[0];
        var v595 = [];
        var v596 = v594;
        var v597 = v596.id();
        if (v594.length > 0) {
          v595.unshift(v594);
          while (v552[v597]) {
            var v598 = v552[v597];
            v595.unshift(v598.edge);
            v595.unshift(v598.node);
            v596 = v598.node;
            v597 = v596.id();
          }
        }
        return v548.spawn(v595);
      }
    };
  }
};
var elesfn$t = {
  kruskal: function kruskal(v599) {
    v599 = v599 || function (v600) {
      return 1;
    };
    var v601 = this.byGroup();
    var v602 = v601.nodes;
    var v603 = v601.edges;
    var v604 = v602.length;
    var v605 = new Array(v604);
    var v606 = v602;
    var v607 = function v608(v609) {
      for (var v610 = 0; v610 < v605.length; v610++) {
        var v611 = v605[v610];
        if (v611.has(v609)) {
          return v610;
        }
      }
    };
    for (var v612 = 0; v612 < v604; v612++) {
      v605[v612] = this.spawn(v602[v612]);
    }
    var v613 = v603.sort(function (v614, v615) {
      return v599(v614) - v599(v615);
    });
    for (var v616 = 0; v616 < v613.length; v616++) {
      var v617 = v613[v616];
      var v618 = v617.source()[0];
      var v619 = v617.target()[0];
      var v620 = v607(v618);
      var v621 = v607(v619);
      var v622 = v605[v620];
      var v623 = v605[v621];
      if (v620 !== v621) {
        v606.merge(v617);
        v622.merge(v623);
        v605.splice(v621, 1);
      }
    }
    return v606;
  }
};
var aStarDefaults = defaults$g({
  root: null,
  goal: null,
  weight: function weight2(v624) {
    return 1;
  },
  heuristic: function heuristic(v625) {
    return 0;
  },
  directed: false
});
var elesfn$s = {
  aStar: function aStar(v626) {
    var v627 = this.cy();
    var v628 = aStarDefaults(v626);
    var v629 = v628.root;
    var v630 = v628.goal;
    var v631 = v628.heuristic;
    var v632 = v628.directed;
    var v633 = v628.weight;
    v629 = v627.collection(v629)[0];
    v630 = v627.collection(v630)[0];
    var v634 = v629.id();
    var v635 = v630.id();
    var v636 = {};
    var v637 = {};
    var v638 = {};
    var v639 = new Heap(function (v640, v641) {
      return v637[v640.id()] - v637[v641.id()];
    });
    var v642 = new Set$1();
    var v643 = {};
    var v644 = {};
    var v645 = function v646(v647, v648) {
      v639.push(v647);
      v642.add(v648);
    };
    var v649;
    var v650;
    var v651 = function v652() {
      v649 = v639.pop();
      v650 = v649.id();
      v642.delete(v650);
    };
    var v653 = function v654(v655) {
      return v642.has(v655);
    };
    v645(v629, v634);
    v636[v634] = 0;
    v637[v634] = v631(v629);
    var v656 = 0;
    while (v639.size() > 0) {
      v651();
      v656++;
      if (v650 === v635) {
        var v657 = [];
        var v658 = v630;
        var v659 = v635;
        var v660 = v644[v659];
        while (true) {
          v657.unshift(v658);
          if (v660 != null) {
            v657.unshift(v660);
          }
          v658 = v643[v659];
          if (v658 == null) {
            break;
          }
          v659 = v658.id();
          v660 = v644[v659];
        }
        return {
          found: true,
          distance: v636[v650],
          path: this.spawn(v657),
          steps: v656
        };
      }
      v638[v650] = true;
      var v661 = v649._private.edges;
      for (var v662 = 0; v662 < v661.length; v662++) {
        var v663 = v661[v662];
        if (!this.hasElementWithId(v663.id())) {
          continue;
        }
        if (v632 && v663.data("source") !== v650) {
          continue;
        }
        var v664 = v663.source();
        var v665 = v663.target();
        var v666 = v664.id() !== v650 ? v664 : v665;
        var v667 = v666.id();
        if (!this.hasElementWithId(v667)) {
          continue;
        }
        if (v638[v667]) {
          continue;
        }
        var v668 = v636[v650] + v633(v663);
        if (!v653(v667)) {
          v636[v667] = v668;
          v637[v667] = v668 + v631(v666);
          v645(v666, v667);
          v643[v667] = v649;
          v644[v667] = v663;
          continue;
        }
        if (v668 < v636[v667]) {
          v636[v667] = v668;
          v637[v667] = v668 + v631(v666);
          v643[v667] = v649;
          v644[v667] = v663;
        }
      }
    }
    return {
      found: false,
      distance: undefined,
      path: undefined,
      steps: v656
    };
  }
};
var floydWarshallDefaults = defaults$g({
  weight: function weight3(v669) {
    return 1;
  },
  directed: false
});
var elesfn$r = {
  floydWarshall: function floydWarshall(v670) {
    var v671 = this.cy();
    var v672 = floydWarshallDefaults(v670);
    var v673 = v672.weight;
    var v674 = v672.directed;
    var v675 = v673;
    var v676 = this.byGroup();
    var v677 = v676.nodes;
    var v678 = v676.edges;
    var v679 = v677.length;
    var v680 = v679 * v679;
    var v681 = function v682(v683) {
      return v677.indexOf(v683);
    };
    var v684 = function v685(v686) {
      return v677[v686];
    };
    var v687 = new Array(v680);
    for (var v688 = 0; v688 < v680; v688++) {
      var v689 = v688 % v679;
      var v690 = (v688 - v689) / v679;
      if (v690 === v689) {
        v687[v688] = 0;
      } else {
        v687[v688] = Infinity;
      }
    }
    var v691 = new Array(v680);
    var v692 = new Array(v680);
    for (var v693 = 0; v693 < v678.length; v693++) {
      var v694 = v678[v693];
      var v695 = v694.source()[0];
      var v696 = v694.target()[0];
      if (v695 === v696) {
        continue;
      }
      var v697 = v681(v695);
      var v698 = v681(v696);
      var v699 = v697 * v679 + v698;
      var v700 = v675(v694);
      if (v687[v699] > v700) {
        v687[v699] = v700;
        v691[v699] = v698;
        v692[v699] = v694;
      }
      if (!v674) {
        var v701 = v698 * v679 + v697;
        if (!v674 && v687[v701] > v700) {
          v687[v701] = v700;
          v691[v701] = v697;
          v692[v701] = v694;
        }
      }
    }
    for (var v702 = 0; v702 < v679; v702++) {
      for (var v703 = 0; v703 < v679; v703++) {
        var v704 = v703 * v679 + v702;
        for (var v705 = 0; v705 < v679; v705++) {
          var v706 = v703 * v679 + v705;
          var v707 = v702 * v679 + v705;
          if (v687[v704] + v687[v707] < v687[v706]) {
            v687[v706] = v687[v704] + v687[v707];
            v691[v706] = v691[v704];
          }
        }
      }
    }
    var v708 = function v709(v710) {
      return (string(v710) ? v671.filter(v710) : v710)[0];
    };
    var v711 = function v712(v713) {
      return v681(v708(v713));
    };
    var v714 = {
      distance: function v715(v716, v717) {
        var v718 = v711(v716);
        var v719 = v711(v717);
        return v687[v718 * v679 + v719];
      },
      path: function v720(v721, v722) {
        var v723 = v711(v721);
        var v724 = v711(v722);
        var v725 = v684(v723);
        if (v723 === v724) {
          return v725.collection();
        }
        if (v691[v723 * v679 + v724] == null) {
          return v671.collection();
        }
        var v726 = v671.collection();
        var v727 = v723;
        var v728;
        v726.merge(v725);
        while (v723 !== v724) {
          v727 = v723;
          v723 = v691[v723 * v679 + v724];
          v728 = v692[v727 * v679 + v723];
          v726.merge(v728);
          v726.merge(v684(v723));
        }
        return v726;
      }
    };
    return v714;
  }
};
var bellmanFordDefaults = defaults$g({
  weight: function weight4(v729) {
    return 1;
  },
  directed: false,
  root: null
});
var elesfn$q = {
  bellmanFord: function bellmanFord(v730) {
    var v731 = this;
    var v732 = bellmanFordDefaults(v730);
    var v733 = v732.weight;
    var v734 = v732.directed;
    var v735 = v732.root;
    var v736 = v733;
    var v737 = this;
    var v738 = this.cy();
    var v739 = this.byGroup();
    var v740 = v739.edges;
    var v741 = v739.nodes;
    var v742 = v741.length;
    var v743 = new Map$1();
    var v744 = false;
    var v745 = [];
    v735 = v738.collection(v735)[0];
    v740.unmergeBy(function (v746) {
      return v746.isLoop();
    });
    var v747 = v740.length;
    var v748 = function v749(v750) {
      var v751 = v743.get(v750.id());
      if (!v751) {
        v751 = {};
        v743.set(v750.id(), v751);
      }
      return v751;
    };
    var v752 = function v753(v754) {
      return (string(v754) ? v738.$(v754) : v754)[0];
    };
    var v755 = function v756(v757) {
      return v748(v752(v757)).dist;
    };
    var v758 = function v759(v760, v761 = v735) {
      var v762 = v752(v760);
      var v763 = [];
      var v764 = v762;
      while (true) {
        if (v764 == null) {
          return v731.spawn();
        }
        var v765 = v748(v764);
        var v766 = v765.edge;
        var v767 = v765.pred;
        v763.unshift(v764[0]);
        if (v764.same(v761) && v763.length > 0) {
          break;
        }
        if (v766 != null) {
          v763.unshift(v766);
        }
        v764 = v767;
      }
      return v737.spawn(v763);
    };
    for (var v768 = 0; v768 < v742; v768++) {
      var v769 = v741[v768];
      var v770 = v748(v769);
      if (v769.same(v735)) {
        v770.dist = 0;
      } else {
        v770.dist = Infinity;
      }
      v770.pred = null;
      v770.edge = null;
    }
    var v771 = false;
    var v772 = function v773(v774, v775, v776, v777, v778, v779) {
      var v780 = v777.dist + v779;
      if (v780 < v778.dist && !v776.same(v777.edge)) {
        v778.dist = v780;
        v778.pred = v774;
        v778.edge = v776;
        v771 = true;
      }
    };
    for (var v781 = 1; v781 < v742; v781++) {
      v771 = false;
      for (var v782 = 0; v782 < v747; v782++) {
        var v783 = v740[v782];
        var v784 = v783.source();
        var v785 = v783.target();
        var v786 = v736(v783);
        var v787 = v748(v784);
        var v788 = v748(v785);
        v772(v784, v785, v783, v787, v788, v786);
        if (!v734) {
          v772(v785, v784, v783, v788, v787, v786);
        }
      }
      if (!v771) {
        break;
      }
    }
    if (v771) {
      var v789 = [];
      for (var v790 = 0; v790 < v747; v790++) {
        var v791 = v740[v790];
        var v792 = v791.source();
        var v793 = v791.target();
        var v794 = v736(v791);
        var v795 = v748(v792).dist;
        var v796 = v748(v793).dist;
        if (v795 + v794 < v796 || !v734 && v796 + v794 < v795) {
          if (!v744) {
            warn("Graph contains a negative weight cycle for Bellman-Ford");
            v744 = true;
          }
          if (v730.findNegativeWeightCycles !== false) {
            var v797 = [];
            if (v795 + v794 < v796) {
              v797.push(v792);
            }
            if (!v734 && v796 + v794 < v795) {
              v797.push(v793);
            }
            var v798 = v797.length;
            for (var v799 = 0; v799 < v798; v799++) {
              var v800 = v797[v799];
              var v801 = [v800];
              v801.push(v748(v800).edge);
              var v802 = v748(v800).pred;
              while (v801.indexOf(v802) === -1) {
                v801.push(v802);
                v801.push(v748(v802).edge);
                v802 = v748(v802).pred;
              }
              v801 = v801.slice(v801.indexOf(v802));
              var v803 = v801[0].id();
              var v804 = 0;
              for (var v805 = 2; v805 < v801.length; v805 += 2) {
                if (v801[v805].id() < v803) {
                  v803 = v801[v805].id();
                  v804 = v805;
                }
              }
              v801 = v801.slice(v804).concat(v801.slice(0, v804));
              v801.push(v801[0]);
              var v806 = v801.map(function (v807) {
                return v807.id();
              }).join(",");
              if (v789.indexOf(v806) === -1) {
                v745.push(v737.spawn(v801));
                v789.push(v806);
              }
            }
          } else {
            break;
          }
        }
      }
    }
    return {
      distanceTo: v755,
      pathTo: v758,
      hasNegativeWeightCycle: v744,
      negativeWeightCycles: v745
    };
  }
};
var sqrt2 = Math.sqrt(2);
var collapse = function collapse2(v808, v809, v810) {
  if (v810.length === 0) {
    error("Karger-Stein must be run on a connected (sub)graph");
  }
  var v811 = v810[v808];
  var v812 = v811[1];
  var v813 = v811[2];
  var v814 = v809[v812];
  var v815 = v809[v813];
  var v816 = v810;
  for (var v817 = v816.length - 1; v817 >= 0; v817--) {
    var v818 = v816[v817];
    var v819 = v818[1];
    var v820 = v818[2];
    if (v809[v819] === v814 && v809[v820] === v815 || v809[v819] === v815 && v809[v820] === v814) {
      v816.splice(v817, 1);
    }
  }
  for (var v821 = 0; v821 < v816.length; v821++) {
    var v822 = v816[v821];
    if (v822[1] === v815) {
      v816[v821] = v822.slice();
      v816[v821][1] = v814;
    } else if (v822[2] === v815) {
      v816[v821] = v822.slice();
      v816[v821][2] = v814;
    }
  }
  for (var v823 = 0; v823 < v809.length; v823++) {
    if (v809[v823] === v815) {
      v809[v823] = v814;
    }
  }
  return v816;
};
var contractUntil = function contractUntil2(v824, v825, v826, v827) {
  while (v826 > v827) {
    var v828 = Math.floor(Math.random() * v825.length);
    v825 = collapse(v828, v824, v825);
    v826--;
  }
  return v825;
};
var elesfn$p = {
  kargerStein: function kargerStein() {
    var v829 = this;
    var v830 = this.byGroup();
    var v831 = v830.nodes;
    var v832 = v830.edges;
    v832.unmergeBy(function (v833) {
      return v833.isLoop();
    });
    var v834 = v831.length;
    var v835 = v832.length;
    var v836 = Math.ceil(Math.pow(Math.log(v834) / Math.LN2, 2));
    var v837 = Math.floor(v834 / sqrt2);
    if (v834 < 2) {
      error("At least 2 nodes are required for Karger-Stein algorithm");
      return undefined;
    }
    var v838 = [];
    for (var v839 = 0; v839 < v835; v839++) {
      var v840 = v832[v839];
      v838.push([v839, v831.indexOf(v840.source()), v831.indexOf(v840.target())]);
    }
    var v841 = Infinity;
    var v842 = [];
    var v843 = new Array(v834);
    var v844 = new Array(v834);
    var v845 = new Array(v834);
    var v846 = function v847(v848, v849) {
      for (var v850 = 0; v850 < v834; v850++) {
        v849[v850] = v848[v850];
      }
    };
    for (var v851 = 0; v851 <= v836; v851++) {
      for (var v852 = 0; v852 < v834; v852++) {
        v844[v852] = v852;
      }
      var v853 = contractUntil(v844, v838.slice(), v834, v837);
      var v854 = v853.slice();
      v846(v844, v845);
      var v855 = contractUntil(v844, v853, v837, 2);
      var v856 = contractUntil(v845, v854, v837, 2);
      if (v855.length <= v856.length && v855.length < v841) {
        v841 = v855.length;
        v842 = v855;
        v846(v844, v843);
      } else if (v856.length <= v855.length && v856.length < v841) {
        v841 = v856.length;
        v842 = v856;
        v846(v845, v843);
      }
    }
    var v857 = this.spawn(v842.map(function (v858) {
      return v832[v858[0]];
    }));
    var v859 = this.spawn();
    var v860 = this.spawn();
    var v861 = v843[0];
    for (var v862 = 0; v862 < v843.length; v862++) {
      var v863 = v843[v862];
      var v864 = v831[v862];
      if (v863 === v861) {
        v859.merge(v864);
      } else {
        v860.merge(v864);
      }
    }
    var v865 = function v866(v867) {
      var v868 = v829.spawn();
      v867.forEach(function (v869) {
        v868.merge(v869);
        v869.connectedEdges().forEach(function (v870) {
          if (v829.contains(v870) && !v857.contains(v870)) {
            v868.merge(v870);
          }
        });
      });
      return v868;
    };
    var v871 = [v865(v859), v865(v860)];
    var v872 = {
      cut: v857,
      components: v871,
      partition1: v859,
      partition2: v860
    };
    return v872;
  }
};
var copyPosition = function copyPosition2(v873) {
  return {
    x: v873.x,
    y: v873.y
  };
};
var modelToRenderedPosition$1 = function modelToRenderedPosition(v874, v875, v876) {
  return {
    x: v874.x * v875 + v876.x,
    y: v874.y * v875 + v876.y
  };
};
var renderedToModelPosition = function renderedToModelPosition2(v877, v878, v879) {
  return {
    x: (v877.x - v879.x) / v878,
    y: (v877.y - v879.y) / v878
  };
};
var array2point = function array2point2(v880) {
  return {
    x: v880[0],
    y: v880[1]
  };
};
var min = function min2(v881, v882 = 0, v883 = v881.length) {
  var v884 = Infinity;
  for (var v885 = v882; v885 < v883; v885++) {
    var v886 = v881[v885];
    if (isFinite(v886)) {
      v884 = Math.min(v886, v884);
    }
  }
  return v884;
};
var max = function max2(v887, v888 = 0, v889 = v887.length) {
  var v890 = -Infinity;
  for (var v891 = v888; v891 < v889; v891++) {
    var v892 = v887[v891];
    if (isFinite(v892)) {
      v890 = Math.max(v892, v890);
    }
  }
  return v890;
};
var mean = function mean2(v893, v894 = 0, v895 = v893.length) {
  var v896 = 0;
  var v897 = 0;
  for (var v898 = v894; v898 < v895; v898++) {
    var v899 = v893[v898];
    if (isFinite(v899)) {
      v896 += v899;
      v897++;
    }
  }
  return v896 / v897;
};
var median = function median2(v900, v901 = 0, v902 = v900.length, v903 = true, v904 = true, v905 = true) {
  if (v903) {
    v900 = v900.slice(v901, v902);
  } else {
    if (v902 < v900.length) {
      v900.splice(v902, v900.length - v902);
    }
    if (v901 > 0) {
      v900.splice(0, v901);
    }
  }
  var v906 = 0;
  for (var v907 = v900.length - 1; v907 >= 0; v907--) {
    var v908 = v900[v907];
    if (v905) {
      if (!isFinite(v908)) {
        v900[v907] = -Infinity;
        v906++;
      }
    } else {
      v900.splice(v907, 1);
    }
  }
  if (v904) {
    v900.sort(function (v909, v910) {
      return v909 - v910;
    });
  }
  var v911 = v900.length;
  var v912 = Math.floor(v911 / 2);
  if (v911 % 2 !== 0) {
    return v900[v912 + 1 + v906];
  } else {
    return (v900[v912 - 1 + v906] + v900[v912 + v906]) / 2;
  }
};
var deg2rad = function deg2rad2(v913) {
  return Math.PI * v913 / 180;
};
var getAngleFromDisp = function getAngleFromDisp2(v914, v915) {
  return Math.atan2(v915, v914) - Math.PI / 2;
};
var log2 = Math.log2 || function (v916) {
  return Math.log(v916) / Math.log(2);
};
var signum = function signum2(v917) {
  if (v917 > 0) {
    return 1;
  } else if (v917 < 0) {
    return -1;
  } else {
    return 0;
  }
};
var dist = function dist2(v918, v919) {
  return Math.sqrt(sqdist(v918, v919));
};
var sqdist = function sqdist2(v920, v921) {
  var v922 = v921.x - v920.x;
  var v923 = v921.y - v920.y;
  return v922 * v922 + v923 * v923;
};
var inPlaceSumNormalize = function inPlaceSumNormalize2(v924) {
  var v925 = v924.length;
  var v926 = 0;
  for (var v927 = 0; v927 < v925; v927++) {
    v926 += v924[v927];
  }
  for (var v928 = 0; v928 < v925; v928++) {
    v924[v928] = v924[v928] / v926;
  }
  return v924;
};
var qbezierAt = function qbezierAt2(v929, v930, v931, v932) {
  return (1 - v932) * (1 - v932) * v929 + (1 - v932) * 2 * v932 * v930 + v932 * v932 * v931;
};
var qbezierPtAt = function qbezierPtAt2(v933, v934, v935, v936) {
  return {
    x: qbezierAt(v933.x, v934.x, v935.x, v936),
    y: qbezierAt(v933.y, v934.y, v935.y, v936)
  };
};
var lineAt = function lineAt2(v937, v938, v939, v940) {
  var v941 = {
    x: v938.x - v937.x,
    y: v938.y - v937.y
  };
  var v942 = dist(v937, v938);
  var v943 = {
    x: v941.x / v942,
    y: v941.y / v942
  };
  v939 = v939 == null ? 0 : v939;
  v940 = v940 ?? v939 * v942;
  return {
    x: v937.x + v943.x * v940,
    y: v937.y + v943.y * v940
  };
};
var bound = function bound2(v944, v945, v946) {
  return Math.max(v944, Math.min(v946, v945));
};
var makeBoundingBox = function makeBoundingBox2(v947) {
  if (v947 == null) {
    return {
      x1: Infinity,
      y1: Infinity,
      x2: -Infinity,
      y2: -Infinity,
      w: 0,
      h: 0
    };
  } else if (v947.x1 != null && v947.y1 != null) {
    if (v947.x2 != null && v947.y2 != null && v947.x2 >= v947.x1 && v947.y2 >= v947.y1) {
      return {
        x1: v947.x1,
        y1: v947.y1,
        x2: v947.x2,
        y2: v947.y2,
        w: v947.x2 - v947.x1,
        h: v947.y2 - v947.y1
      };
    } else if (v947.w != null && v947.h != null && v947.w >= 0 && v947.h >= 0) {
      return {
        x1: v947.x1,
        y1: v947.y1,
        x2: v947.x1 + v947.w,
        y2: v947.y1 + v947.h,
        w: v947.w,
        h: v947.h
      };
    }
  }
};
var copyBoundingBox = function copyBoundingBox2(v948) {
  return {
    x1: v948.x1,
    x2: v948.x2,
    w: v948.w,
    y1: v948.y1,
    y2: v948.y2,
    h: v948.h
  };
};
var clearBoundingBox = function clearBoundingBox2(v949) {
  v949.x1 = Infinity;
  v949.y1 = Infinity;
  v949.x2 = -Infinity;
  v949.y2 = -Infinity;
  v949.w = 0;
  v949.h = 0;
};
var updateBoundingBox = function updateBoundingBox2(v950, v951) {
  v950.x1 = Math.min(v950.x1, v951.x1);
  v950.x2 = Math.max(v950.x2, v951.x2);
  v950.w = v950.x2 - v950.x1;
  v950.y1 = Math.min(v950.y1, v951.y1);
  v950.y2 = Math.max(v950.y2, v951.y2);
  v950.h = v950.y2 - v950.y1;
};
var expandBoundingBoxByPoint = function expandBoundingBoxByPoint2(v952, v953, v954) {
  v952.x1 = Math.min(v952.x1, v953);
  v952.x2 = Math.max(v952.x2, v953);
  v952.w = v952.x2 - v952.x1;
  v952.y1 = Math.min(v952.y1, v954);
  v952.y2 = Math.max(v952.y2, v954);
  v952.h = v952.y2 - v952.y1;
};
var expandBoundingBox = function expandBoundingBox2(v955, v956 = 0) {
  v955.x1 -= v956;
  v955.x2 += v956;
  v955.y1 -= v956;
  v955.y2 += v956;
  v955.w = v955.x2 - v955.x1;
  v955.h = v955.y2 - v955.y1;
  return v955;
};
var expandBoundingBoxSides = function expandBoundingBoxSides2(v957, v958 = [0]) {
  var v959;
  var v960;
  var v961;
  var v962;
  if (v958.length === 1) {
    v959 = v960 = v961 = v962 = v958[0];
  } else if (v958.length === 2) {
    v959 = v961 = v958[0];
    v962 = v960 = v958[1];
  } else if (v958.length === 4) {
    var v963 = _slicedToArray(v958, 4);
    v959 = v963[0];
    v960 = v963[1];
    v961 = v963[2];
    v962 = v963[3];
  }
  v957.x1 -= v962;
  v957.x2 += v960;
  v957.y1 -= v959;
  v957.y2 += v961;
  v957.w = v957.x2 - v957.x1;
  v957.h = v957.y2 - v957.y1;
  return v957;
};
var assignBoundingBox = function assignBoundingBox2(v964, v965) {
  v964.x1 = v965.x1;
  v964.y1 = v965.y1;
  v964.x2 = v965.x2;
  v964.y2 = v965.y2;
  v964.w = v964.x2 - v964.x1;
  v964.h = v964.y2 - v964.y1;
};
var boundingBoxesIntersect = function boundingBoxesIntersect2(v966, v967) {
  if (v966.x1 > v967.x2) {
    return false;
  }
  if (v967.x1 > v966.x2) {
    return false;
  }
  if (v966.x2 < v967.x1) {
    return false;
  }
  if (v967.x2 < v966.x1) {
    return false;
  }
  if (v966.y2 < v967.y1) {
    return false;
  }
  if (v967.y2 < v966.y1) {
    return false;
  }
  if (v966.y1 > v967.y2) {
    return false;
  }
  if (v967.y1 > v966.y2) {
    return false;
  }
  return true;
};
var inBoundingBox = function inBoundingBox2(v968, v969, v970) {
  return v968.x1 <= v969 && v969 <= v968.x2 && v968.y1 <= v970 && v970 <= v968.y2;
};
var pointInBoundingBox = function pointInBoundingBox2(v971, v972) {
  return inBoundingBox(v971, v972.x, v972.y);
};
var boundingBoxInBoundingBox = function boundingBoxInBoundingBox2(v973, v974) {
  return inBoundingBox(v973, v974.x1, v974.y1) && inBoundingBox(v973, v974.x2, v974.y2);
};
var hypot = Math.hypot ?? function (v975, v976) {
  return Math.sqrt(v975 * v975 + v976 * v976);
};
function inflatePolygon(v977, v978) {
  if (v977.length < 3) {
    throw new Error("Need at least 3 vertices");
  }
  var v979 = function v980(v981, v982) {
    return {
      x: v981.x + v982.x,
      y: v981.y + v982.y
    };
  };
  var v983 = function v984(v985, v986) {
    return {
      x: v985.x - v986.x,
      y: v985.y - v986.y
    };
  };
  var v987 = function v988(v989, v990) {
    return {
      x: v989.x * v990,
      y: v989.y * v990
    };
  };
  var v991 = function v992(v993, v994) {
    return v993.x * v994.y - v993.y * v994.x;
  };
  var v995 = function v996(v997) {
    var v998 = hypot(v997.x, v997.y);
    if (v998 === 0) {
      return {
        x: 0,
        y: 0
      };
    } else {
      return {
        x: v997.x / v998,
        y: v997.y / v998
      };
    }
  };
  var v999 = function v1000(v1001) {
    var v1002 = 0;
    for (var v1003 = 0; v1003 < v1001.length; v1003++) {
      var v1004 = v1001[v1003];
      var v1005 = v1001[(v1003 + 1) % v1001.length];
      v1002 += v1004.x * v1005.y - v1005.x * v1004.y;
    }
    return v1002 / 2;
  };
  var v1006 = function v1007(v1008, v1009, v1010, v1011) {
    var v1012 = v983(v1009, v1008);
    var v1013 = v983(v1011, v1010);
    var v1014 = v991(v1012, v1013);
    if (Math.abs(v1014) < 1e-9) {
      return v979(v1008, v987(v1012, 0.5));
    }
    var v1015 = v991(v983(v1010, v1008), v1013) / v1014;
    return v979(v1008, v987(v1012, v1015));
  };
  var v1016 = v977.map(function (v1017) {
    return {
      x: v1017.x,
      y: v1017.y
    };
  });
  if (v999(v1016) < 0) {
    v1016.reverse();
  }
  var v1018 = v1016.length;
  var v1019 = [];
  for (var v1020 = 0; v1020 < v1018; v1020++) {
    var v1021 = v1016[v1020];
    var v1022 = v1016[(v1020 + 1) % v1018];
    var v1023 = v983(v1022, v1021);
    var v1024 = v995({
      x: v1023.y,
      y: -v1023.x
    });
    v1019.push(v1024);
  }
  var v1025 = v1019.map(function (v1026, v1027) {
    var v1028 = v979(v1016[v1027], v987(v1026, v978));
    var v1029 = v979(v1016[(v1027 + 1) % v1018], v987(v1026, v978));
    return {
      p1: v1028,
      p2: v1029
    };
  });
  var v1030 = [];
  for (var v1031 = 0; v1031 < v1018; v1031++) {
    var v1032 = v1025[(v1031 - 1 + v1018) % v1018];
    var v1033 = v1025[v1031];
    var v1034 = v1006(v1032.p1, v1032.p2, v1033.p1, v1033.p2);
    v1030.push(v1034);
  }
  return v1030;
}
function miterBox(v1035, v1036, v1037, v1038, v1039, v1040) {
  var v1041 = transformPoints(v1035, v1036, v1037, v1038, v1039);
  var v1042 = inflatePolygon(v1041, v1040);
  var v1043 = makeBoundingBox();
  v1042.forEach(function (v1044) {
    return expandBoundingBoxByPoint(v1043, v1044.x, v1044.y);
  });
  return v1043;
}
var roundRectangleIntersectLine = function roundRectangleIntersectLine2(v1045, v1046, v1047, v1048, v1049, v1050, v1051, v1052 = "auto") {
  var v1053 = v1052 === "auto" ? getRoundRectangleRadius(v1049, v1050) : v1052;
  var v1054 = v1049 / 2;
  var v1055 = v1050 / 2;
  v1053 = Math.min(v1053, v1054, v1055);
  var v1056 = v1053 !== v1054;
  var v1057 = v1053 !== v1055;
  var v1058;
  if (v1056) {
    var v1059 = v1047 - v1054 + v1053 - v1051;
    var v1060 = v1048 - v1055 - v1051;
    var v1061 = v1047 + v1054 - v1053 + v1051;
    var v1062 = v1060;
    v1058 = finiteLinesIntersect(v1045, v1046, v1047, v1048, v1059, v1060, v1061, v1062, false);
    if (v1058.length > 0) {
      return v1058;
    }
  }
  if (v1057) {
    var v1063 = v1047 + v1054 + v1051;
    var v1064 = v1048 - v1055 + v1053 - v1051;
    var v1065 = v1063;
    var v1066 = v1048 + v1055 - v1053 + v1051;
    v1058 = finiteLinesIntersect(v1045, v1046, v1047, v1048, v1063, v1064, v1065, v1066, false);
    if (v1058.length > 0) {
      return v1058;
    }
  }
  if (v1056) {
    var v1067 = v1047 - v1054 + v1053 - v1051;
    var v1068 = v1048 + v1055 + v1051;
    var v1069 = v1047 + v1054 - v1053 + v1051;
    var v1070 = v1068;
    v1058 = finiteLinesIntersect(v1045, v1046, v1047, v1048, v1067, v1068, v1069, v1070, false);
    if (v1058.length > 0) {
      return v1058;
    }
  }
  if (v1057) {
    var v1071 = v1047 - v1054 - v1051;
    var v1072 = v1048 - v1055 + v1053 - v1051;
    var v1073 = v1071;
    var v1074 = v1048 + v1055 - v1053 + v1051;
    v1058 = finiteLinesIntersect(v1045, v1046, v1047, v1048, v1071, v1072, v1073, v1074, false);
    if (v1058.length > 0) {
      return v1058;
    }
  }
  var v1075;
  {
    var v1076 = v1047 - v1054 + v1053;
    var v1077 = v1048 - v1055 + v1053;
    v1075 = intersectLineCircle(v1045, v1046, v1047, v1048, v1076, v1077, v1053 + v1051);
    if (v1075.length > 0 && v1075[0] <= v1076 && v1075[1] <= v1077) {
      return [v1075[0], v1075[1]];
    }
  }
  {
    var v1078 = v1047 + v1054 - v1053;
    var v1079 = v1048 - v1055 + v1053;
    v1075 = intersectLineCircle(v1045, v1046, v1047, v1048, v1078, v1079, v1053 + v1051);
    if (v1075.length > 0 && v1075[0] >= v1078 && v1075[1] <= v1079) {
      return [v1075[0], v1075[1]];
    }
  }
  {
    var v1080 = v1047 + v1054 - v1053;
    var v1081 = v1048 + v1055 - v1053;
    v1075 = intersectLineCircle(v1045, v1046, v1047, v1048, v1080, v1081, v1053 + v1051);
    if (v1075.length > 0 && v1075[0] >= v1080 && v1075[1] >= v1081) {
      return [v1075[0], v1075[1]];
    }
  }
  {
    var v1082 = v1047 - v1054 + v1053;
    var v1083 = v1048 + v1055 - v1053;
    v1075 = intersectLineCircle(v1045, v1046, v1047, v1048, v1082, v1083, v1053 + v1051);
    if (v1075.length > 0 && v1075[0] <= v1082 && v1075[1] >= v1083) {
      return [v1075[0], v1075[1]];
    }
  }
  return [];
};
var inLineVicinity = function inLineVicinity2(v1084, v1085, v1086, v1087, v1088, v1089, v1090) {
  var v1091 = v1090;
  var v1092 = Math.min(v1086, v1088);
  var v1093 = Math.max(v1086, v1088);
  var v1094 = Math.min(v1087, v1089);
  var v1095 = Math.max(v1087, v1089);
  return v1092 - v1091 <= v1084 && v1084 <= v1093 + v1091 && v1094 - v1091 <= v1085 && v1085 <= v1095 + v1091;
};
var inBezierVicinity = function inBezierVicinity2(v1096, v1097, v1098, v1099, v1100, v1101, v1102, v1103, v1104) {
  var v1105 = {
    x1: Math.min(v1098, v1102, v1100) - v1104,
    x2: Math.max(v1098, v1102, v1100) + v1104,
    y1: Math.min(v1099, v1103, v1101) - v1104,
    y2: Math.max(v1099, v1103, v1101) + v1104
  };
  if (v1096 < v1105.x1 || v1096 > v1105.x2 || v1097 < v1105.y1 || v1097 > v1105.y2) {
    return false;
  } else {
    return true;
  }
};
var solveQuadratic = function solveQuadratic2(v1106, v1107, v1108, v1109) {
  v1108 -= v1109;
  var v1110 = v1107 * v1107 - v1106 * 4 * v1108;
  if (v1110 < 0) {
    return [];
  }
  var v1111 = Math.sqrt(v1110);
  var v1112 = v1106 * 2;
  var v1113 = (-v1107 + v1111) / v1112;
  var v1114 = (-v1107 - v1111) / v1112;
  return [v1113, v1114];
};
var solveCubic = function solveCubic2(v1115, v1116, v1117, v1118, v1119) {
  var v1120 = 0.00001;
  if (v1115 === 0) {
    v1115 = v1120;
  }
  v1116 /= v1115;
  v1117 /= v1115;
  v1118 /= v1115;
  var v1121;
  var v1122;
  var v1123;
  var v1124;
  var v1125;
  var v1126;
  var v1127;
  var v1128;
  v1122 = (v1117 * 3 - v1116 * v1116) / 9;
  v1123 = -(v1118 * 27) + v1116 * (v1117 * 9 - v1116 * v1116 * 2);
  v1123 /= 54;
  v1121 = v1122 * v1122 * v1122 + v1123 * v1123;
  v1119[1] = 0;
  v1127 = v1116 / 3;
  if (v1121 > 0) {
    v1125 = v1123 + Math.sqrt(v1121);
    v1125 = v1125 < 0 ? -Math.pow(-v1125, 1 / 3) : Math.pow(v1125, 1 / 3);
    v1126 = v1123 - Math.sqrt(v1121);
    v1126 = v1126 < 0 ? -Math.pow(-v1126, 1 / 3) : Math.pow(v1126, 1 / 3);
    v1119[0] = -v1127 + v1125 + v1126;
    v1127 += (v1125 + v1126) / 2;
    v1119[4] = v1119[2] = -v1127;
    v1127 = Math.sqrt(3) * (-v1126 + v1125) / 2;
    v1119[3] = v1127;
    v1119[5] = -v1127;
    return;
  }
  v1119[5] = v1119[3] = 0;
  if (v1121 === 0) {
    v1128 = v1123 < 0 ? -Math.pow(-v1123, 1 / 3) : Math.pow(v1123, 1 / 3);
    v1119[0] = -v1127 + v1128 * 2;
    v1119[4] = v1119[2] = -(v1128 + v1127);
    return;
  }
  v1122 = -v1122;
  v1124 = v1122 * v1122 * v1122;
  v1124 = Math.acos(v1123 / Math.sqrt(v1124));
  v1128 = Math.sqrt(v1122) * 2;
  v1119[0] = -v1127 + v1128 * Math.cos(v1124 / 3);
  v1119[2] = -v1127 + v1128 * Math.cos((v1124 + Math.PI * 2) / 3);
  v1119[4] = -v1127 + v1128 * Math.cos((v1124 + Math.PI * 4) / 3);
  return;
};
var sqdistToQuadraticBezier = function sqdistToQuadraticBezier2(v1129, v1130, v1131, v1132, v1133, v1134, v1135, v1136) {
  var v1137 = v1131 * 1 * v1131 - v1131 * 4 * v1133 + v1131 * 2 * v1135 + v1133 * 4 * v1133 - v1133 * 4 * v1135 + v1135 * v1135 + v1132 * v1132 - v1132 * 4 * v1134 + v1132 * 2 * v1136 + v1134 * 4 * v1134 - v1134 * 4 * v1136 + v1136 * v1136;
  var v1138 = v1131 * 9 * v1133 - v1131 * 3 * v1131 - v1131 * 3 * v1135 - v1133 * 6 * v1133 + v1133 * 3 * v1135 + v1132 * 9 * v1134 - v1132 * 3 * v1132 - v1132 * 3 * v1136 - v1134 * 6 * v1134 + v1134 * 3 * v1136;
  var v1139 = v1131 * 3 * v1131 - v1131 * 6 * v1133 + v1131 * v1135 - v1131 * v1129 + v1133 * 2 * v1133 + v1133 * 2 * v1129 - v1135 * v1129 + v1132 * 3 * v1132 - v1132 * 6 * v1134 + v1132 * v1136 - v1132 * v1130 + v1134 * 2 * v1134 + v1134 * 2 * v1130 - v1136 * v1130;
  var v1140 = v1131 * 1 * v1133 - v1131 * v1131 + v1131 * v1129 - v1133 * v1129 + v1132 * v1134 - v1132 * v1132 + v1132 * v1130 - v1134 * v1130;
  var v1141 = [];
  solveCubic(v1137, v1138, v1139, v1140, v1141);
  var v1142 = 1e-7;
  var v1143 = [];
  for (var v1144 = 0; v1144 < 6; v1144 += 2) {
    if (Math.abs(v1141[v1144 + 1]) < v1142 && v1141[v1144] >= 0 && v1141[v1144] <= 1) {
      v1143.push(v1141[v1144]);
    }
  }
  v1143.push(1);
  v1143.push(0);
  var v1145 = -1;
  var v1146;
  var v1147;
  var v1148;
  for (var v1149 = 0; v1149 < v1143.length; v1149++) {
    v1146 = Math.pow(1 - v1143[v1149], 2) * v1131 + (1 - v1143[v1149]) * 2 * v1143[v1149] * v1133 + v1143[v1149] * v1143[v1149] * v1135;
    v1147 = Math.pow(1 - v1143[v1149], 2) * v1132 + (1 - v1143[v1149]) * 2 * v1143[v1149] * v1134 + v1143[v1149] * v1143[v1149] * v1136;
    v1148 = Math.pow(v1146 - v1129, 2) + Math.pow(v1147 - v1130, 2);
    if (v1145 >= 0) {
      if (v1148 < v1145) {
        v1145 = v1148;
      }
    } else {
      v1145 = v1148;
    }
  }
  return v1145;
};
var sqdistToFiniteLine = function sqdistToFiniteLine2(v1150, v1151, v1152, v1153, v1154, v1155) {
  var v1156 = [v1150 - v1152, v1151 - v1153];
  var v1157 = [v1154 - v1152, v1155 - v1153];
  var v1158 = v1157[0] * v1157[0] + v1157[1] * v1157[1];
  var v1159 = v1156[0] * v1156[0] + v1156[1] * v1156[1];
  var v1160 = v1156[0] * v1157[0] + v1156[1] * v1157[1];
  var v1161 = v1160 * v1160 / v1158;
  if (v1160 < 0) {
    return v1159;
  }
  if (v1161 > v1158) {
    return (v1150 - v1154) * (v1150 - v1154) + (v1151 - v1155) * (v1151 - v1155);
  }
  return v1159 - v1161;
};
var pointInsidePolygonPoints = function pointInsidePolygonPoints2(v1162, v1163, v1164) {
  var v1165;
  var v1166;
  var v1167;
  var v1168;
  var v1169;
  var v1170 = 0;
  for (var v1171 = 0; v1171 < v1164.length / 2; v1171++) {
    v1165 = v1164[v1171 * 2];
    v1166 = v1164[v1171 * 2 + 1];
    if (v1171 + 1 < v1164.length / 2) {
      v1167 = v1164[(v1171 + 1) * 2];
      v1168 = v1164[(v1171 + 1) * 2 + 1];
    } else {
      v1167 = v1164[(v1171 + 1 - v1164.length / 2) * 2];
      v1168 = v1164[(v1171 + 1 - v1164.length / 2) * 2 + 1];
    }
    if (v1165 == v1162 && v1167 == v1162) ;else if (v1165 >= v1162 && v1162 >= v1167 || v1165 <= v1162 && v1162 <= v1167) {
      v1169 = (v1162 - v1165) / (v1167 - v1165) * (v1168 - v1166) + v1166;
      if (v1169 > v1163) {
        v1170++;
      }
    } else {
      continue;
    }
  }
  if (v1170 % 2 === 0) {
    return false;
  } else {
    return true;
  }
};
var pointInsidePolygon = function pointInsidePolygon2(v1172, v1173, v1174, v1175, v1176, v1177, v1178, v1179, v1180) {
  var v1181 = new Array(v1174.length);
  var v1182;
  if (v1179[0] != null) {
    v1182 = Math.atan(v1179[1] / v1179[0]);
    if (v1179[0] < 0) {
      v1182 = v1182 + Math.PI / 2;
    } else {
      v1182 = -v1182 - Math.PI / 2;
    }
  } else {
    v1182 = v1179;
  }
  var v1183 = Math.cos(-v1182);
  var v1184 = Math.sin(-v1182);
  for (var v1185 = 0; v1185 < v1181.length / 2; v1185++) {
    v1181[v1185 * 2] = v1177 / 2 * (v1174[v1185 * 2] * v1183 - v1174[v1185 * 2 + 1] * v1184);
    v1181[v1185 * 2 + 1] = v1178 / 2 * (v1174[v1185 * 2 + 1] * v1183 + v1174[v1185 * 2] * v1184);
    v1181[v1185 * 2] += v1175;
    v1181[v1185 * 2 + 1] += v1176;
  }
  var v1186;
  if (v1180 > 0) {
    var v1187 = expandPolygon(v1181, -v1180);
    v1186 = joinLines(v1187);
  } else {
    v1186 = v1181;
  }
  return pointInsidePolygonPoints(v1172, v1173, v1186);
};
var pointInsideRoundPolygon = function pointInsideRoundPolygon2(v1188, v1189, v1190, v1191, v1192, v1193, v1194, v1195) {
  var v1196 = new Array(v1190.length * 2);
  for (var v1197 = 0; v1197 < v1195.length; v1197++) {
    var v1198 = v1195[v1197];
    v1196[v1197 * 4 + 0] = v1198.startX;
    v1196[v1197 * 4 + 1] = v1198.startY;
    v1196[v1197 * 4 + 2] = v1198.stopX;
    v1196[v1197 * 4 + 3] = v1198.stopY;
    var v1199 = Math.pow(v1198.cx - v1188, 2) + Math.pow(v1198.cy - v1189, 2);
    if (v1199 <= Math.pow(v1198.radius, 2)) {
      return true;
    }
  }
  return pointInsidePolygonPoints(v1188, v1189, v1196);
};
var joinLines = function joinLines2(v1200) {
  var v1201 = new Array(v1200.length / 2);
  var v1202;
  var v1203;
  var v1204;
  var v1205;
  var v1206;
  var v1207;
  var v1208;
  var v1209;
  for (var v1210 = 0; v1210 < v1200.length / 4; v1210++) {
    v1202 = v1200[v1210 * 4];
    v1203 = v1200[v1210 * 4 + 1];
    v1204 = v1200[v1210 * 4 + 2];
    v1205 = v1200[v1210 * 4 + 3];
    if (v1210 < v1200.length / 4 - 1) {
      v1206 = v1200[(v1210 + 1) * 4];
      v1207 = v1200[(v1210 + 1) * 4 + 1];
      v1208 = v1200[(v1210 + 1) * 4 + 2];
      v1209 = v1200[(v1210 + 1) * 4 + 3];
    } else {
      v1206 = v1200[0];
      v1207 = v1200[1];
      v1208 = v1200[2];
      v1209 = v1200[3];
    }
    var v1211 = finiteLinesIntersect(v1202, v1203, v1204, v1205, v1206, v1207, v1208, v1209, true);
    v1201[v1210 * 2] = v1211[0];
    v1201[v1210 * 2 + 1] = v1211[1];
  }
  return v1201;
};
var expandPolygon = function expandPolygon2(v1212, v1213) {
  var v1214 = new Array(v1212.length * 2);
  var v1215;
  var v1216;
  var v1217;
  var v1218;
  for (var v1219 = 0; v1219 < v1212.length / 2; v1219++) {
    v1215 = v1212[v1219 * 2];
    v1216 = v1212[v1219 * 2 + 1];
    if (v1219 < v1212.length / 2 - 1) {
      v1217 = v1212[(v1219 + 1) * 2];
      v1218 = v1212[(v1219 + 1) * 2 + 1];
    } else {
      v1217 = v1212[0];
      v1218 = v1212[1];
    }
    var v1220 = v1218 - v1216;
    var v1221 = -(v1217 - v1215);
    var v1222 = Math.sqrt(v1220 * v1220 + v1221 * v1221);
    var v1223 = v1220 / v1222;
    var v1224 = v1221 / v1222;
    v1214[v1219 * 4] = v1215 + v1223 * v1213;
    v1214[v1219 * 4 + 1] = v1216 + v1224 * v1213;
    v1214[v1219 * 4 + 2] = v1217 + v1223 * v1213;
    v1214[v1219 * 4 + 3] = v1218 + v1224 * v1213;
  }
  return v1214;
};
var intersectLineEllipse = function intersectLineEllipse2(v1225, v1226, v1227, v1228, v1229, v1230) {
  var v1231 = v1227 - v1225;
  var v1232 = v1228 - v1226;
  v1231 /= v1229;
  v1232 /= v1230;
  var v1233 = Math.sqrt(v1231 * v1231 + v1232 * v1232);
  var v1234 = v1233 - 1;
  if (v1234 < 0) {
    return [];
  }
  var v1235 = v1234 / v1233;
  return [(v1227 - v1225) * v1235 + v1225, (v1228 - v1226) * v1235 + v1226];
};
var checkInEllipse = function checkInEllipse2(v1236, v1237, v1238, v1239, v1240, v1241, v1242) {
  v1236 -= v1240;
  v1237 -= v1241;
  v1236 /= v1238 / 2 + v1242;
  v1237 /= v1239 / 2 + v1242;
  return v1236 * v1236 + v1237 * v1237 <= 1;
};
var intersectLineCircle = function intersectLineCircle2(v1243, v1244, v1245, v1246, v1247, v1248, v1249) {
  var v1250 = [v1245 - v1243, v1246 - v1244];
  var v1251 = [v1243 - v1247, v1244 - v1248];
  var v1252 = v1250[0] * v1250[0] + v1250[1] * v1250[1];
  var v1253 = (v1251[0] * v1250[0] + v1251[1] * v1250[1]) * 2;
  var v1254 = v1251[0] * v1251[0] + v1251[1] * v1251[1] - v1249 * v1249;
  var v1255 = v1253 * v1253 - v1252 * 4 * v1254;
  if (v1255 < 0) {
    return [];
  }
  var v1256 = (-v1253 + Math.sqrt(v1255)) / (v1252 * 2);
  var v1257 = (-v1253 - Math.sqrt(v1255)) / (v1252 * 2);
  var v1258 = Math.min(v1256, v1257);
  var v1259 = Math.max(v1256, v1257);
  var v1260 = [];
  if (v1258 >= 0 && v1258 <= 1) {
    v1260.push(v1258);
  }
  if (v1259 >= 0 && v1259 <= 1) {
    v1260.push(v1259);
  }
  if (v1260.length === 0) {
    return [];
  }
  var v1261 = v1260[0] * v1250[0] + v1243;
  var v1262 = v1260[0] * v1250[1] + v1244;
  if (v1260.length > 1) {
    if (v1260[0] == v1260[1]) {
      return [v1261, v1262];
    } else {
      var v1263 = v1260[1] * v1250[0] + v1243;
      var v1264 = v1260[1] * v1250[1] + v1244;
      return [v1261, v1262, v1263, v1264];
    }
  } else {
    return [v1261, v1262];
  }
};
var midOfThree = function midOfThree2(v1265, v1266, v1267) {
  if (v1266 <= v1265 && v1265 <= v1267 || v1267 <= v1265 && v1265 <= v1266) {
    return v1265;
  } else if (v1265 <= v1266 && v1266 <= v1267 || v1267 <= v1266 && v1266 <= v1265) {
    return v1266;
  } else {
    return v1267;
  }
};
var finiteLinesIntersect = function finiteLinesIntersect2(v1268, v1269, v1270, v1271, v1272, v1273, v1274, v1275, v1276) {
  var v1277 = v1268 - v1272;
  var v1278 = v1270 - v1268;
  var v1279 = v1274 - v1272;
  var v1280 = v1269 - v1273;
  var v1281 = v1271 - v1269;
  var v1282 = v1275 - v1273;
  var v1283 = v1279 * v1280 - v1282 * v1277;
  var v1284 = v1278 * v1280 - v1281 * v1277;
  var v1285 = v1282 * v1278 - v1279 * v1281;
  if (v1285 !== 0) {
    var v1286 = v1283 / v1285;
    var v1287 = v1284 / v1285;
    var v1288 = 0.001;
    var v1289 = 0 - v1288;
    var v1290 = 1 + v1288;
    if (v1289 <= v1286 && v1286 <= v1290 && v1289 <= v1287 && v1287 <= v1290) {
      return [v1268 + v1286 * v1278, v1269 + v1286 * v1281];
    } else if (!v1276) {
      return [];
    } else {
      return [v1268 + v1286 * v1278, v1269 + v1286 * v1281];
    }
  } else if (v1283 === 0 || v1284 === 0) {
    if (midOfThree(v1268, v1270, v1274) === v1274) {
      return [v1274, v1275];
    }
    if (midOfThree(v1268, v1270, v1272) === v1272) {
      return [v1272, v1273];
    }
    if (midOfThree(v1272, v1274, v1270) === v1270) {
      return [v1270, v1271];
    }
    return [];
  } else {
    return [];
  }
};
var transformPoints = function transformPoints2(v1291, v1292, v1293, v1294, v1295) {
  var v1296 = [];
  var v1297 = v1294 / 2;
  var v1298 = v1295 / 2;
  var v1299 = v1292;
  var v1300 = v1293;
  v1296.push({
    x: v1299 + v1297 * v1291[0],
    y: v1300 + v1298 * v1291[1]
  });
  for (var v1301 = 1; v1301 < v1291.length / 2; v1301++) {
    v1296.push({
      x: v1299 + v1297 * v1291[v1301 * 2],
      y: v1300 + v1298 * v1291[v1301 * 2 + 1]
    });
  }
  return v1296;
};
var polygonIntersectLine = function polygonIntersectLine2(v1302, v1303, v1304, v1305, v1306, v1307, v1308, v1309) {
  var v1310 = [];
  var v1311;
  var v1312 = new Array(v1304.length);
  var v1313 = true;
  if (v1307 == null) {
    v1313 = false;
  }
  var v1314;
  if (v1313) {
    for (var v1315 = 0; v1315 < v1312.length / 2; v1315++) {
      v1312[v1315 * 2] = v1304[v1315 * 2] * v1307 + v1305;
      v1312[v1315 * 2 + 1] = v1304[v1315 * 2 + 1] * v1308 + v1306;
    }
    if (v1309 > 0) {
      var v1316 = expandPolygon(v1312, -v1309);
      v1314 = joinLines(v1316);
    } else {
      v1314 = v1312;
    }
  } else {
    v1314 = v1304;
  }
  var v1317;
  var v1318;
  var v1319;
  var v1320;
  for (var v1321 = 0; v1321 < v1314.length / 2; v1321++) {
    v1317 = v1314[v1321 * 2];
    v1318 = v1314[v1321 * 2 + 1];
    if (v1321 < v1314.length / 2 - 1) {
      v1319 = v1314[(v1321 + 1) * 2];
      v1320 = v1314[(v1321 + 1) * 2 + 1];
    } else {
      v1319 = v1314[0];
      v1320 = v1314[1];
    }
    v1311 = finiteLinesIntersect(v1302, v1303, v1305, v1306, v1317, v1318, v1319, v1320);
    if (v1311.length !== 0) {
      v1310.push(v1311[0], v1311[1]);
    }
  }
  return v1310;
};
var roundPolygonIntersectLine = function roundPolygonIntersectLine2(v1322, v1323, v1324, v1325, v1326, v1327, v1328, v1329, v1330) {
  var v1331 = [];
  var v1332;
  var v1333 = new Array(v1324.length * 2);
  v1330.forEach(function (v1334, v1335) {
    if (v1335 === 0) {
      v1333[v1333.length - 2] = v1334.startX;
      v1333[v1333.length - 1] = v1334.startY;
    } else {
      v1333[v1335 * 4 - 2] = v1334.startX;
      v1333[v1335 * 4 - 1] = v1334.startY;
    }
    v1333[v1335 * 4] = v1334.stopX;
    v1333[v1335 * 4 + 1] = v1334.stopY;
    v1332 = intersectLineCircle(v1322, v1323, v1325, v1326, v1334.cx, v1334.cy, v1334.radius);
    if (v1332.length !== 0) {
      v1331.push(v1332[0], v1332[1]);
    }
  });
  for (var v1336 = 0; v1336 < v1333.length / 4; v1336++) {
    v1332 = finiteLinesIntersect(v1322, v1323, v1325, v1326, v1333[v1336 * 4], v1333[v1336 * 4 + 1], v1333[v1336 * 4 + 2], v1333[v1336 * 4 + 3], false);
    if (v1332.length !== 0) {
      v1331.push(v1332[0], v1332[1]);
    }
  }
  if (v1331.length > 2) {
    var v1337 = [v1331[0], v1331[1]];
    var v1338 = Math.pow(v1337[0] - v1322, 2) + Math.pow(v1337[1] - v1323, 2);
    for (var v1339 = 1; v1339 < v1331.length / 2; v1339++) {
      var v1340 = Math.pow(v1331[v1339 * 2] - v1322, 2) + Math.pow(v1331[v1339 * 2 + 1] - v1323, 2);
      if (v1340 <= v1338) {
        v1337[0] = v1331[v1339 * 2];
        v1337[1] = v1331[v1339 * 2 + 1];
        v1338 = v1340;
      }
    }
    return v1337;
  }
  return v1331;
};
var shortenIntersection = function shortenIntersection2(v1341, v1342, v1343) {
  var v1344 = [v1341[0] - v1342[0], v1341[1] - v1342[1]];
  var v1345 = Math.sqrt(v1344[0] * v1344[0] + v1344[1] * v1344[1]);
  var v1346 = (v1345 - v1343) / v1345;
  if (v1346 < 0) {
    v1346 = 0.00001;
  }
  return [v1342[0] + v1346 * v1344[0], v1342[1] + v1346 * v1344[1]];
};
var generateUnitNgonPointsFitToSquare = function generateUnitNgonPointsFitToSquare2(v1347, v1348) {
  var v1349 = generateUnitNgonPoints(v1347, v1348);
  v1349 = fitPolygonToSquare(v1349);
  return v1349;
};
var fitPolygonToSquare = function fitPolygonToSquare2(v1350) {
  var v1351;
  var v1352;
  var v1353 = v1350.length / 2;
  var v1354 = Infinity;
  var v1355 = Infinity;
  var v1356 = -Infinity;
  var v1357 = -Infinity;
  for (var v1358 = 0; v1358 < v1353; v1358++) {
    v1351 = v1350[v1358 * 2];
    v1352 = v1350[v1358 * 2 + 1];
    v1354 = Math.min(v1354, v1351);
    v1356 = Math.max(v1356, v1351);
    v1355 = Math.min(v1355, v1352);
    v1357 = Math.max(v1357, v1352);
  }
  var v1359 = 2 / (v1356 - v1354);
  var v1360 = 2 / (v1357 - v1355);
  for (var v1361 = 0; v1361 < v1353; v1361++) {
    v1351 = v1350[v1361 * 2] = v1350[v1361 * 2] * v1359;
    v1352 = v1350[v1361 * 2 + 1] = v1350[v1361 * 2 + 1] * v1360;
    v1354 = Math.min(v1354, v1351);
    v1356 = Math.max(v1356, v1351);
    v1355 = Math.min(v1355, v1352);
    v1357 = Math.max(v1357, v1352);
  }
  if (v1355 < -1) {
    for (var v1362 = 0; v1362 < v1353; v1362++) {
      v1352 = v1350[v1362 * 2 + 1] = v1350[v1362 * 2 + 1] + (-1 - v1355);
    }
  }
  return v1350;
};
var generateUnitNgonPoints = function generateUnitNgonPoints2(v1363, v1364) {
  var v1365 = 1 / v1363 * 2 * Math.PI;
  var v1366 = v1363 % 2 === 0 ? Math.PI / 2 + v1365 / 2 : Math.PI / 2;
  v1366 += v1364;
  var v1367 = new Array(v1363 * 2);
  var v1368;
  for (var v1369 = 0; v1369 < v1363; v1369++) {
    v1368 = v1369 * v1365 + v1366;
    v1367[v1369 * 2] = Math.cos(v1368);
    v1367[v1369 * 2 + 1] = Math.sin(-v1368);
  }
  return v1367;
};
var getRoundRectangleRadius = function getRoundRectangleRadius2(v1370, v1371) {
  return Math.min(v1370 / 4, v1371 / 4, 8);
};
var getRoundPolygonRadius = function getRoundPolygonRadius2(v1372, v1373) {
  return Math.min(v1372 / 10, v1373 / 10, 8);
};
var getCutRectangleCornerLength = function getCutRectangleCornerLength2() {
  return 8;
};
var bezierPtsToQuadCoeff = function bezierPtsToQuadCoeff2(v1374, v1375, v1376) {
  return [v1374 - v1375 * 2 + v1376, (v1375 - v1374) * 2, v1374];
};
var getBarrelCurveConstants = function getBarrelCurveConstants2(v1377, v1378) {
  return {
    heightOffset: Math.min(15, v1378 * 0.05),
    widthOffset: Math.min(100, v1377 * 0.25),
    ctrlPtOffsetPct: 0.05
  };
};
function satPolygonIntersection(v1379, v1380) {
  function v1381(v1382) {
    var v1383 = [];
    for (var v1384 = 0; v1384 < v1382.length; v1384++) {
      var v1385 = v1382[v1384];
      var v1386 = v1382[(v1384 + 1) % v1382.length];
      var v1387 = {
        x: v1386.x - v1385.x,
        y: v1386.y - v1385.y
      };
      var v1388 = {
        x: -v1387.y,
        y: v1387.x
      };
      var v1389 = Math.sqrt(v1388.x * v1388.x + v1388.y * v1388.y);
      v1383.push({
        x: v1388.x / v1389,
        y: v1388.y / v1389
      });
    }
    return v1383;
  }
  function v1390(v1391, v1392) {
    var v1393 = Infinity;
    var v1394 = -Infinity;
    var v1395 = _createForOfIteratorHelper(v1391);
    var v1396;
    try {
      for (v1395.s(); !(v1396 = v1395.n()).done;) {
        var v1397 = v1396.value;
        var v1398 = v1397.x * v1392.x + v1397.y * v1392.y;
        v1393 = Math.min(v1393, v1398);
        v1394 = Math.max(v1394, v1398);
      }
    } catch (v1399) {
      v1395.e(v1399);
    } finally {
      v1395.f();
    }
    return {
      min: v1393,
      max: v1394
    };
  }
  function v1400(v1401, v1402) {
    return !(v1401.max < v1402.min) && !(v1402.max < v1401.min);
  }
  var v1403 = [].concat(_toConsumableArray(v1381(v1379)), _toConsumableArray(v1381(v1380)));
  var v1404 = _createForOfIteratorHelper(v1403);
  var v1405;
  try {
    for (v1404.s(); !(v1405 = v1404.n()).done;) {
      var v1406 = v1405.value;
      var v1407 = v1390(v1379, v1406);
      var v1408 = v1390(v1380, v1406);
      if (!v1400(v1407, v1408)) {
        return false;
      }
    }
  } catch (v1409) {
    v1404.e(v1409);
  } finally {
    v1404.f();
  }
  return true;
}
var pageRankDefaults = defaults$g({
  dampingFactor: 0.8,
  precision: 0.000001,
  iterations: 200,
  weight: function weight5(v1410) {
    return 1;
  }
});
var elesfn$o = {
  pageRank: function pageRank(v1411) {
    var v1412 = pageRankDefaults(v1411);
    var v1413 = v1412.dampingFactor;
    var v1414 = v1412.precision;
    var v1415 = v1412.iterations;
    var v1416 = v1412.weight;
    var v1417 = this._private.cy;
    var v1418 = this.byGroup();
    var v1419 = v1418.nodes;
    var v1420 = v1418.edges;
    var v1421 = v1419.length;
    var v1422 = v1421 * v1421;
    var v1423 = v1420.length;
    var v1424 = new Array(v1422);
    var v1425 = new Array(v1421);
    var v1426 = (1 - v1413) / v1421;
    for (var v1427 = 0; v1427 < v1421; v1427++) {
      for (var v1428 = 0; v1428 < v1421; v1428++) {
        var v1429 = v1427 * v1421 + v1428;
        v1424[v1429] = 0;
      }
      v1425[v1427] = 0;
    }
    for (var v1430 = 0; v1430 < v1423; v1430++) {
      var v1431 = v1420[v1430];
      var v1432 = v1431.data("source");
      var v1433 = v1431.data("target");
      if (v1432 === v1433) {
        continue;
      }
      var v1434 = v1419.indexOfId(v1432);
      var v1435 = v1419.indexOfId(v1433);
      var v1436 = v1416(v1431);
      var v1437 = v1435 * v1421 + v1434;
      v1424[v1437] += v1436;
      v1425[v1434] += v1436;
    }
    var v1438 = 1 / v1421 + v1426;
    for (var v1439 = 0; v1439 < v1421; v1439++) {
      if (v1425[v1439] === 0) {
        for (var v1440 = 0; v1440 < v1421; v1440++) {
          var v1441 = v1440 * v1421 + v1439;
          v1424[v1441] = v1438;
        }
      } else {
        for (var v1442 = 0; v1442 < v1421; v1442++) {
          var v1443 = v1442 * v1421 + v1439;
          v1424[v1443] = v1424[v1443] / v1425[v1439] + v1426;
        }
      }
    }
    var v1444 = new Array(v1421);
    var v1445 = new Array(v1421);
    var v1446;
    for (var v1447 = 0; v1447 < v1421; v1447++) {
      v1444[v1447] = 1;
    }
    for (var v1448 = 0; v1448 < v1415; v1448++) {
      for (var v1449 = 0; v1449 < v1421; v1449++) {
        v1445[v1449] = 0;
      }
      for (var v1450 = 0; v1450 < v1421; v1450++) {
        for (var v1451 = 0; v1451 < v1421; v1451++) {
          var v1452 = v1450 * v1421 + v1451;
          v1445[v1450] += v1424[v1452] * v1444[v1451];
        }
      }
      inPlaceSumNormalize(v1445);
      v1446 = v1444;
      v1444 = v1445;
      v1445 = v1446;
      var v1453 = 0;
      for (var v1454 = 0; v1454 < v1421; v1454++) {
        var v1455 = v1446[v1454] - v1444[v1454];
        v1453 += v1455 * v1455;
      }
      if (v1453 < v1414) {
        break;
      }
    }
    var v1456 = {
      rank: function v1457(v1458) {
        v1458 = v1417.collection(v1458)[0];
        return v1444[v1419.indexOf(v1458)];
      }
    };
    return v1456;
  }
};
var defaults$f = defaults$g({
  root: null,
  weight: function weight6(v1459) {
    return 1;
  },
  directed: false,
  alpha: 0
});
var elesfn$n = {
  degreeCentralityNormalized: function degreeCentralityNormalized(v1460) {
    v1460 = defaults$f(v1460);
    var v1461 = this.cy();
    var v1462 = this.nodes();
    var v1463 = v1462.length;
    if (!v1460.directed) {
      var v1464 = {};
      var v1465 = 0;
      for (var v1466 = 0; v1466 < v1463; v1466++) {
        var v1467 = v1462[v1466];
        v1460.root = v1467;
        var v1468 = this.degreeCentrality(v1460);
        if (v1465 < v1468.degree) {
          v1465 = v1468.degree;
        }
        v1464[v1467.id()] = v1468.degree;
      }
      return {
        degree: function v1469(v1470) {
          if (v1465 === 0) {
            return 0;
          }
          if (string(v1470)) {
            v1470 = v1461.filter(v1470);
          }
          return v1464[v1470.id()] / v1465;
        }
      };
    } else {
      var v1471 = {};
      var v1472 = {};
      var v1473 = 0;
      var v1474 = 0;
      for (var v1475 = 0; v1475 < v1463; v1475++) {
        var v1476 = v1462[v1475];
        var v1477 = v1476.id();
        v1460.root = v1476;
        var v1478 = this.degreeCentrality(v1460);
        if (v1473 < v1478.indegree) {
          v1473 = v1478.indegree;
        }
        if (v1474 < v1478.outdegree) {
          v1474 = v1478.outdegree;
        }
        v1471[v1477] = v1478.indegree;
        v1472[v1477] = v1478.outdegree;
      }
      return {
        indegree: function v1479(v1480) {
          if (v1473 == 0) {
            return 0;
          }
          if (string(v1480)) {
            v1480 = v1461.filter(v1480);
          }
          return v1471[v1480.id()] / v1473;
        },
        outdegree: function v1481(v1482) {
          if (v1474 === 0) {
            return 0;
          }
          if (string(v1482)) {
            v1482 = v1461.filter(v1482);
          }
          return v1472[v1482.id()] / v1474;
        }
      };
    }
  },
  degreeCentrality: function degreeCentrality(v1483) {
    v1483 = defaults$f(v1483);
    var v1484 = this.cy();
    var v1485 = this;
    var v1486 = v1483;
    var v1487 = v1486.root;
    var v1488 = v1486.weight;
    var v1489 = v1486.directed;
    var v1490 = v1486.alpha;
    v1487 = v1484.collection(v1487)[0];
    if (!v1489) {
      var v1491 = v1487.connectedEdges().intersection(v1485);
      var v1492 = v1491.length;
      var v1493 = 0;
      for (var v1494 = 0; v1494 < v1491.length; v1494++) {
        v1493 += v1488(v1491[v1494]);
      }
      return {
        degree: Math.pow(v1492, 1 - v1490) * Math.pow(v1493, v1490)
      };
    } else {
      var v1495 = v1487.connectedEdges();
      var v1496 = v1495.filter(function (v1497) {
        return v1497.target().same(v1487) && v1485.has(v1497);
      });
      var v1498 = v1495.filter(function (v1499) {
        return v1499.source().same(v1487) && v1485.has(v1499);
      });
      var v1500 = v1496.length;
      var v1501 = v1498.length;
      var v1502 = 0;
      var v1503 = 0;
      for (var v1504 = 0; v1504 < v1496.length; v1504++) {
        v1502 += v1488(v1496[v1504]);
      }
      for (var v1505 = 0; v1505 < v1498.length; v1505++) {
        v1503 += v1488(v1498[v1505]);
      }
      return {
        indegree: Math.pow(v1500, 1 - v1490) * Math.pow(v1502, v1490),
        outdegree: Math.pow(v1501, 1 - v1490) * Math.pow(v1503, v1490)
      };
    }
  }
};
elesfn$n.dc = elesfn$n.degreeCentrality;
elesfn$n.dcn = elesfn$n.degreeCentralityNormalised = elesfn$n.degreeCentralityNormalized;
var defaults$e = defaults$g({
  harmonic: true,
  weight: function weight7() {
    return 1;
  },
  directed: false,
  root: null
});
var elesfn$m = {
  closenessCentralityNormalized: function closenessCentralityNormalized(v1506) {
    var v1507 = defaults$e(v1506);
    var v1508 = v1507.harmonic;
    var v1509 = v1507.weight;
    var v1510 = v1507.directed;
    var v1511 = this.cy();
    var v1512 = {};
    var v1513 = 0;
    var v1514 = this.nodes();
    var v1515 = this.floydWarshall({
      weight: v1509,
      directed: v1510
    });
    for (var v1516 = 0; v1516 < v1514.length; v1516++) {
      var v1517 = 0;
      var v1518 = v1514[v1516];
      for (var v1519 = 0; v1519 < v1514.length; v1519++) {
        if (v1516 !== v1519) {
          var v1520 = v1515.distance(v1518, v1514[v1519]);
          if (v1508) {
            v1517 += 1 / v1520;
          } else {
            v1517 += v1520;
          }
        }
      }
      if (!v1508) {
        v1517 = 1 / v1517;
      }
      if (v1513 < v1517) {
        v1513 = v1517;
      }
      v1512[v1518.id()] = v1517;
    }
    return {
      closeness: function v1521(v1522) {
        if (v1513 == 0) {
          return 0;
        }
        if (string(v1522)) {
          v1522 = v1511.filter(v1522)[0].id();
        } else {
          v1522 = v1522.id();
        }
        return v1512[v1522] / v1513;
      }
    };
  },
  closenessCentrality: function closenessCentrality(v1523) {
    var v1524 = defaults$e(v1523);
    var v1525 = v1524.root;
    var v1526 = v1524.weight;
    var v1527 = v1524.directed;
    var v1528 = v1524.harmonic;
    v1525 = this.filter(v1525)[0];
    var v1529 = this.dijkstra({
      root: v1525,
      weight: v1526,
      directed: v1527
    });
    var v1530 = 0;
    var v1531 = this.nodes();
    for (var v1532 = 0; v1532 < v1531.length; v1532++) {
      var v1533 = v1531[v1532];
      if (!v1533.same(v1525)) {
        var v1534 = v1529.distanceTo(v1533);
        if (v1528) {
          v1530 += 1 / v1534;
        } else {
          v1530 += v1534;
        }
      }
    }
    if (v1528) {
      return v1530;
    } else {
      return 1 / v1530;
    }
  }
};
elesfn$m.cc = elesfn$m.closenessCentrality;
elesfn$m.ccn = elesfn$m.closenessCentralityNormalised = elesfn$m.closenessCentralityNormalized;
var defaults$d = defaults$g({
  weight: null,
  directed: false
});
var elesfn$l = {
  betweennessCentrality: function betweennessCentrality(v1535) {
    var v1536 = defaults$d(v1535);
    var v1537 = v1536.directed;
    var v1538 = v1536.weight;
    var v1539 = v1538 != null;
    var v1540 = this.cy();
    var v1541 = this.nodes();
    var v1542 = {};
    var v1543 = {};
    var v1544 = 0;
    var v1545 = {
      set: function v1546(v1547, v1548) {
        v1543[v1547] = v1548;
        if (v1548 > v1544) {
          v1544 = v1548;
        }
      },
      get: function v1549(v1550) {
        return v1543[v1550];
      }
    };
    for (var v1551 = 0; v1551 < v1541.length; v1551++) {
      var v1552 = v1541[v1551];
      var v1553 = v1552.id();
      if (v1537) {
        v1542[v1553] = v1552.outgoers().nodes();
      } else {
        v1542[v1553] = v1552.openNeighborhood().nodes();
      }
      v1545.set(v1553, 0);
    }
    var v1554 = function v1555() {
      var v1556 = v1541[v1557].id();
      var v1558 = [];
      var v1559 = {};
      var v1560 = {};
      var v1561 = {};
      var v1562 = new Heap(function (v1563, v1564) {
        return v1561[v1563] - v1561[v1564];
      });
      for (var v1565 = 0; v1565 < v1541.length; v1565++) {
        var v1566 = v1541[v1565].id();
        v1559[v1566] = [];
        v1560[v1566] = 0;
        v1561[v1566] = Infinity;
      }
      v1560[v1556] = 1;
      v1561[v1556] = 0;
      v1562.push(v1556);
      while (!v1562.empty()) {
        var v1567 = v1562.pop();
        v1558.push(v1567);
        if (v1539) {
          for (var v1568 = 0; v1568 < v1542[v1567].length; v1568++) {
            var v1569 = v1542[v1567][v1568];
            var v1570 = v1540.getElementById(v1567);
            var v1571 = undefined;
            if (v1570.edgesTo(v1569).length > 0) {
              v1571 = v1570.edgesTo(v1569)[0];
            } else {
              v1571 = v1569.edgesTo(v1570)[0];
            }
            var v1572 = v1538(v1571);
            v1569 = v1569.id();
            if (v1561[v1569] > v1561[v1567] + v1572) {
              v1561[v1569] = v1561[v1567] + v1572;
              if (v1562.nodes.indexOf(v1569) < 0) {
                v1562.push(v1569);
              } else {
                v1562.updateItem(v1569);
              }
              v1560[v1569] = 0;
              v1559[v1569] = [];
            }
            if (v1561[v1569] == v1561[v1567] + v1572) {
              v1560[v1569] = v1560[v1569] + v1560[v1567];
              v1559[v1569].push(v1567);
            }
          }
        } else {
          for (var v1573 = 0; v1573 < v1542[v1567].length; v1573++) {
            var v1574 = v1542[v1567][v1573].id();
            if (v1561[v1574] == Infinity) {
              v1562.push(v1574);
              v1561[v1574] = v1561[v1567] + 1;
            }
            if (v1561[v1574] == v1561[v1567] + 1) {
              v1560[v1574] = v1560[v1574] + v1560[v1567];
              v1559[v1574].push(v1567);
            }
          }
        }
      }
      var v1575 = {};
      for (var v1576 = 0; v1576 < v1541.length; v1576++) {
        v1575[v1541[v1576].id()] = 0;
      }
      while (v1558.length > 0) {
        var v1577 = v1558.pop();
        for (var v1578 = 0; v1578 < v1559[v1577].length; v1578++) {
          var v1579 = v1559[v1577][v1578];
          v1575[v1579] = v1575[v1579] + v1560[v1579] / v1560[v1577] * (1 + v1575[v1577]);
        }
        if (v1577 != v1541[v1557].id()) {
          v1545.set(v1577, v1545.get(v1577) + v1575[v1577]);
        }
      }
    };
    for (var v1557 = 0; v1557 < v1541.length; v1557++) {
      v1554();
    }
    var v1580 = {
      betweenness: function v1581(v1582) {
        var v1583 = v1540.collection(v1582).id();
        return v1545.get(v1583);
      },
      betweennessNormalized: function v1584(v1585) {
        if (v1544 == 0) {
          return 0;
        }
        var v1586 = v1540.collection(v1585).id();
        return v1545.get(v1586) / v1544;
      }
    };
    v1580.betweennessNormalised = v1580.betweennessNormalized;
    return v1580;
  }
};
elesfn$l.bc = elesfn$l.betweennessCentrality;
var defaults$c = defaults$g({
  expandFactor: 2,
  inflateFactor: 2,
  multFactor: 1,
  maxIterations: 20,
  attributes: [function (v1587) {
    return 1;
  }]
});
var setOptions$3 = function setOptions(v1588) {
  return defaults$c(v1588);
};
var getSimilarity$1 = function getSimilarity(v1589, v1590) {
  var v1591 = 0;
  for (var v1592 = 0; v1592 < v1590.length; v1592++) {
    v1591 += v1590[v1592](v1589);
  }
  return v1591;
};
var addLoops = function addLoops2(v1593, v1594, v1595) {
  for (var v1596 = 0; v1596 < v1594; v1596++) {
    v1593[v1596 * v1594 + v1596] = v1595;
  }
};
var normalize = function normalize2(v1597, v1598) {
  var v1599;
  for (var v1600 = 0; v1600 < v1598; v1600++) {
    v1599 = 0;
    for (var v1601 = 0; v1601 < v1598; v1601++) {
      v1599 += v1597[v1601 * v1598 + v1600];
    }
    for (var v1602 = 0; v1602 < v1598; v1602++) {
      v1597[v1602 * v1598 + v1600] = v1597[v1602 * v1598 + v1600] / v1599;
    }
  }
};
var mmult = function mmult2(v1603, v1604, v1605) {
  var v1606 = new Array(v1605 * v1605);
  for (var v1607 = 0; v1607 < v1605; v1607++) {
    for (var v1608 = 0; v1608 < v1605; v1608++) {
      v1606[v1607 * v1605 + v1608] = 0;
    }
    for (var v1609 = 0; v1609 < v1605; v1609++) {
      for (var v1610 = 0; v1610 < v1605; v1610++) {
        v1606[v1607 * v1605 + v1610] += v1603[v1607 * v1605 + v1609] * v1604[v1609 * v1605 + v1610];
      }
    }
  }
  return v1606;
};
var expand = function expand2(v1611, v1612, v1613) {
  var v1614 = v1611.slice(0);
  for (var v1615 = 1; v1615 < v1613; v1615++) {
    v1611 = mmult(v1611, v1614, v1612);
  }
  return v1611;
};
var inflate = function inflate2(v1616, v1617, v1618) {
  var v1619 = new Array(v1617 * v1617);
  for (var v1620 = 0; v1620 < v1617 * v1617; v1620++) {
    v1619[v1620] = Math.pow(v1616[v1620], v1618);
  }
  normalize(v1619, v1617);
  return v1619;
};
var hasConverged = function hasConverged2(v1621, v1622, v1623, v1624) {
  for (var v1625 = 0; v1625 < v1623; v1625++) {
    var v1626 = Math.round(v1621[v1625] * Math.pow(10, v1624)) / Math.pow(10, v1624);
    var v1627 = Math.round(v1622[v1625] * Math.pow(10, v1624)) / Math.pow(10, v1624);
    if (v1626 !== v1627) {
      return false;
    }
  }
  return true;
};
var assign$2 = function assign(v1628, v1629, v1630, v1631) {
  var v1632 = [];
  for (var v1633 = 0; v1633 < v1629; v1633++) {
    var v1634 = [];
    for (var v1635 = 0; v1635 < v1629; v1635++) {
      if (Math.round(v1628[v1633 * v1629 + v1635] * 1000) / 1000 > 0) {
        v1634.push(v1630[v1635]);
      }
    }
    if (v1634.length !== 0) {
      v1632.push(v1631.collection(v1634));
    }
  }
  return v1632;
};
var isDuplicate = function isDuplicate2(v1636, v1637) {
  for (var v1638 = 0; v1638 < v1636.length; v1638++) {
    if (!v1637[v1638] || v1636[v1638].id() !== v1637[v1638].id()) {
      return false;
    }
  }
  return true;
};
var removeDuplicates = function removeDuplicates2(v1639) {
  for (var v1640 = 0; v1640 < v1639.length; v1640++) {
    for (var v1641 = 0; v1641 < v1639.length; v1641++) {
      if (v1640 != v1641 && isDuplicate(v1639[v1640], v1639[v1641])) {
        v1639.splice(v1641, 1);
      }
    }
  }
  return v1639;
};
var markovClustering = function markovClustering2(v1642) {
  var v1643 = this.nodes();
  var v1644 = this.edges();
  var v1645 = this.cy();
  var v1646 = setOptions$3(v1642);
  var v1647 = {};
  for (var v1648 = 0; v1648 < v1643.length; v1648++) {
    v1647[v1643[v1648].id()] = v1648;
  }
  var v1649 = v1643.length;
  var v1650 = v1649 * v1649;
  var v1651 = new Array(v1650);
  var v1652;
  for (var v1653 = 0; v1653 < v1650; v1653++) {
    v1651[v1653] = 0;
  }
  for (var v1654 = 0; v1654 < v1644.length; v1654++) {
    var v1655 = v1644[v1654];
    var v1656 = v1647[v1655.source().id()];
    var v1657 = v1647[v1655.target().id()];
    var v1658 = getSimilarity$1(v1655, v1646.attributes);
    v1651[v1656 * v1649 + v1657] += v1658;
    v1651[v1657 * v1649 + v1656] += v1658;
  }
  addLoops(v1651, v1649, v1646.multFactor);
  normalize(v1651, v1649);
  var v1659 = true;
  var v1660 = 0;
  while (v1659 && v1660 < v1646.maxIterations) {
    v1659 = false;
    v1652 = expand(v1651, v1649, v1646.expandFactor);
    v1651 = inflate(v1652, v1649, v1646.inflateFactor);
    if (!hasConverged(v1651, v1652, v1650, 4)) {
      v1659 = true;
    }
    v1660++;
  }
  var v1661 = assign$2(v1651, v1649, v1643, v1645);
  v1661 = removeDuplicates(v1661);
  return v1661;
};
var markovClustering$1 = {
  markovClustering: markovClustering,
  mcl: markovClustering
};
var identity$1 = function identity(v1662) {
  return v1662;
};
var absDiff = function absDiff2(v1663, v1664) {
  return Math.abs(v1664 - v1663);
};
var addAbsDiff = function addAbsDiff2(v1665, v1666, v1667) {
  return v1665 + absDiff(v1666, v1667);
};
var addSquaredDiff = function addSquaredDiff2(v1668, v1669, v1670) {
  return v1668 + Math.pow(v1670 - v1669, 2);
};
var sqrt = function sqrt3(v1671) {
  return Math.sqrt(v1671);
};
var maxAbsDiff = function maxAbsDiff2(v1672, v1673, v1674) {
  return Math.max(v1672, absDiff(v1673, v1674));
};
var getDistance = function getDistance2(v1675, v1676, v1677, v1678, v1679, v1680 = identity$1) {
  var v1681 = v1678;
  var v1682;
  var v1683;
  for (var v1684 = 0; v1684 < v1675; v1684++) {
    v1682 = v1676(v1684);
    v1683 = v1677(v1684);
    v1681 = v1679(v1681, v1682, v1683);
  }
  return v1680(v1681);
};
var distances = {
  euclidean: function euclidean(v1685, v1686, v1687) {
    if (v1685 >= 2) {
      return getDistance(v1685, v1686, v1687, 0, addSquaredDiff, sqrt);
    } else {
      return getDistance(v1685, v1686, v1687, 0, addAbsDiff);
    }
  },
  squaredEuclidean: function squaredEuclidean(v1688, v1689, v1690) {
    return getDistance(v1688, v1689, v1690, 0, addSquaredDiff);
  },
  manhattan: function manhattan(v1691, v1692, v1693) {
    return getDistance(v1691, v1692, v1693, 0, addAbsDiff);
  },
  max: function max3(v1694, v1695, v1696) {
    return getDistance(v1694, v1695, v1696, -Infinity, maxAbsDiff);
  }
};
distances["squared-euclidean"] = distances.squaredEuclidean;
distances.squaredeuclidean = distances.squaredEuclidean;
function clusteringDistance(v1697, v1698, v1699, v1700, v1701, v1702) {
  var v1703;
  if (fn$6(v1697)) {
    v1703 = v1697;
  } else {
    v1703 = distances[v1697] || distances.euclidean;
  }
  if (v1698 === 0 && fn$6(v1697)) {
    return v1703(v1701, v1702);
  } else {
    return v1703(v1698, v1699, v1700, v1701, v1702);
  }
}
var defaults$b = defaults$g({
  k: 2,
  m: 2,
  sensitivityThreshold: 0.0001,
  distance: "euclidean",
  maxIterations: 10,
  attributes: [],
  testMode: false,
  testCentroids: null
});
var setOptions$2 = function setOptions2(v1704) {
  return defaults$b(v1704);
};
var getDist = function getDist2(v1705, v1706, v1707, v1708, v1709) {
  var v1710 = v1709 !== "kMedoids";
  var v1711 = v1710 ? function (v1712) {
    return v1707[v1712];
  } : function (v1713) {
    return v1708[v1713](v1707);
  };
  var v1714 = function v1715(v1716) {
    return v1708[v1716](v1706);
  };
  var v1717 = v1707;
  var v1718 = v1706;
  return clusteringDistance(v1705, v1708.length, v1711, v1714, v1717, v1718);
};
var randomCentroids = function randomCentroids2(v1719, v1720, v1721) {
  var v1722 = v1721.length;
  var v1723 = new Array(v1722);
  var v1724 = new Array(v1722);
  var v1725 = new Array(v1720);
  var v1726 = null;
  for (var v1727 = 0; v1727 < v1722; v1727++) {
    v1723[v1727] = v1719.min(v1721[v1727]).value;
    v1724[v1727] = v1719.max(v1721[v1727]).value;
  }
  for (var v1728 = 0; v1728 < v1720; v1728++) {
    v1726 = [];
    for (var v1729 = 0; v1729 < v1722; v1729++) {
      v1726[v1729] = Math.random() * (v1724[v1729] - v1723[v1729]) + v1723[v1729];
    }
    v1725[v1728] = v1726;
  }
  return v1725;
};
var classify = function classify2(v1730, v1731, v1732, v1733, v1734) {
  var v1735 = Infinity;
  var v1736 = 0;
  for (var v1737 = 0; v1737 < v1731.length; v1737++) {
    var v1738 = getDist(v1732, v1730, v1731[v1737], v1733, v1734);
    if (v1738 < v1735) {
      v1735 = v1738;
      v1736 = v1737;
    }
  }
  return v1736;
};
var buildCluster = function buildCluster2(v1739, v1740, v1741) {
  var v1742 = [];
  var v1743 = null;
  for (var v1744 = 0; v1744 < v1740.length; v1744++) {
    v1743 = v1740[v1744];
    if (v1741[v1743.id()] === v1739) {
      v1742.push(v1743);
    }
  }
  return v1742;
};
var haveValuesConverged = function haveValuesConverged2(v1745, v1746, v1747) {
  return Math.abs(v1746 - v1745) <= v1747;
};
var haveMatricesConverged = function haveMatricesConverged2(v1748, v1749, v1750) {
  for (var v1751 = 0; v1751 < v1748.length; v1751++) {
    for (var v1752 = 0; v1752 < v1748[v1751].length; v1752++) {
      var v1753 = Math.abs(v1748[v1751][v1752] - v1749[v1751][v1752]);
      if (v1753 > v1750) {
        return false;
      }
    }
  }
  return true;
};
var seenBefore = function seenBefore2(v1754, v1755, v1756) {
  for (var v1757 = 0; v1757 < v1756; v1757++) {
    if (v1754 === v1755[v1757]) {
      return true;
    }
  }
  return false;
};
var randomMedoids = function randomMedoids2(v1758, v1759) {
  var v1760 = new Array(v1759);
  if (v1758.length < 50) {
    for (var v1761 = 0; v1761 < v1759; v1761++) {
      var v1762 = v1758[Math.floor(Math.random() * v1758.length)];
      while (seenBefore(v1762, v1760, v1761)) {
        v1762 = v1758[Math.floor(Math.random() * v1758.length)];
      }
      v1760[v1761] = v1762;
    }
  } else {
    for (var v1763 = 0; v1763 < v1759; v1763++) {
      v1760[v1763] = v1758[Math.floor(Math.random() * v1758.length)];
    }
  }
  return v1760;
};
var findCost = function findCost2(v1764, v1765, v1766) {
  var v1767 = 0;
  for (var v1768 = 0; v1768 < v1765.length; v1768++) {
    v1767 += getDist("manhattan", v1765[v1768], v1764, v1766, "kMedoids");
  }
  return v1767;
};
var kMeans = function kMeans2(v1769) {
  var v1770 = this.cy();
  var v1771 = this.nodes();
  var v1772 = null;
  var v1773 = setOptions$2(v1769);
  var v1774 = new Array(v1773.k);
  var v1775 = {};
  var v1776;
  if (v1773.testMode) {
    if (typeof v1773.testCentroids === "number") {
      v1773.testCentroids;
      v1776 = randomCentroids(v1771, v1773.k, v1773.attributes);
    } else if (_typeof(v1773.testCentroids) === "object") {
      v1776 = v1773.testCentroids;
    } else {
      v1776 = randomCentroids(v1771, v1773.k, v1773.attributes);
    }
  } else {
    v1776 = randomCentroids(v1771, v1773.k, v1773.attributes);
  }
  var v1777 = true;
  var v1778 = 0;
  while (v1777 && v1778 < v1773.maxIterations) {
    for (var v1779 = 0; v1779 < v1771.length; v1779++) {
      v1772 = v1771[v1779];
      v1775[v1772.id()] = classify(v1772, v1776, v1773.distance, v1773.attributes, "kMeans");
    }
    v1777 = false;
    for (var v1780 = 0; v1780 < v1773.k; v1780++) {
      var v1781 = buildCluster(v1780, v1771, v1775);
      if (v1781.length === 0) {
        continue;
      }
      var v1782 = v1773.attributes.length;
      var v1783 = v1776[v1780];
      var v1784 = new Array(v1782);
      var v1785 = new Array(v1782);
      for (var v1786 = 0; v1786 < v1782; v1786++) {
        v1785[v1786] = 0;
        for (var v1787 = 0; v1787 < v1781.length; v1787++) {
          v1772 = v1781[v1787];
          v1785[v1786] += v1773.attributes[v1786](v1772);
        }
        v1784[v1786] = v1785[v1786] / v1781.length;
        if (!haveValuesConverged(v1784[v1786], v1783[v1786], v1773.sensitivityThreshold)) {
          v1777 = true;
        }
      }
      v1776[v1780] = v1784;
      v1774[v1780] = v1770.collection(v1781);
    }
    v1778++;
  }
  return v1774;
};
var kMedoids = function kMedoids2(v1788) {
  var v1789 = this.cy();
  var v1790 = this.nodes();
  var v1791 = null;
  var v1792 = setOptions$2(v1788);
  var v1793 = new Array(v1792.k);
  var v1794;
  var v1795 = {};
  var v1796;
  var v1797 = new Array(v1792.k);
  if (v1792.testMode) {
    if (typeof v1792.testCentroids === "number") ;else if (_typeof(v1792.testCentroids) === "object") {
      v1794 = v1792.testCentroids;
    } else {
      v1794 = randomMedoids(v1790, v1792.k);
    }
  } else {
    v1794 = randomMedoids(v1790, v1792.k);
  }
  var v1798 = true;
  var v1799 = 0;
  while (v1798 && v1799 < v1792.maxIterations) {
    for (var v1800 = 0; v1800 < v1790.length; v1800++) {
      v1791 = v1790[v1800];
      v1795[v1791.id()] = classify(v1791, v1794, v1792.distance, v1792.attributes, "kMedoids");
    }
    v1798 = false;
    for (var v1801 = 0; v1801 < v1794.length; v1801++) {
      var v1802 = buildCluster(v1801, v1790, v1795);
      if (v1802.length === 0) {
        continue;
      }
      v1797[v1801] = findCost(v1794[v1801], v1802, v1792.attributes);
      for (var v1803 = 0; v1803 < v1802.length; v1803++) {
        v1796 = findCost(v1802[v1803], v1802, v1792.attributes);
        if (v1796 < v1797[v1801]) {
          v1797[v1801] = v1796;
          v1794[v1801] = v1802[v1803];
          v1798 = true;
        }
      }
      v1793[v1801] = v1789.collection(v1802);
    }
    v1799++;
  }
  return v1793;
};
var updateCentroids = function updateCentroids2(v1804, v1805, v1806, v1807, v1808) {
  var v1809;
  var v1810;
  for (var v1811 = 0; v1811 < v1805.length; v1811++) {
    for (var v1812 = 0; v1812 < v1804.length; v1812++) {
      v1807[v1811][v1812] = Math.pow(v1806[v1811][v1812], v1808.m);
    }
  }
  for (var v1813 = 0; v1813 < v1804.length; v1813++) {
    for (var v1814 = 0; v1814 < v1808.attributes.length; v1814++) {
      v1809 = 0;
      v1810 = 0;
      for (var v1815 = 0; v1815 < v1805.length; v1815++) {
        v1809 += v1807[v1815][v1813] * v1808.attributes[v1814](v1805[v1815]);
        v1810 += v1807[v1815][v1813];
      }
      v1804[v1813][v1814] = v1809 / v1810;
    }
  }
};
var updateMembership = function updateMembership2(v1816, v1817, v1818, v1819, v1820) {
  for (var v1821 = 0; v1821 < v1816.length; v1821++) {
    v1817[v1821] = v1816[v1821].slice();
  }
  var v1822;
  var v1823;
  var v1824;
  var v1825 = 2 / (v1820.m - 1);
  for (var v1826 = 0; v1826 < v1818.length; v1826++) {
    for (var v1827 = 0; v1827 < v1819.length; v1827++) {
      v1822 = 0;
      for (var v1828 = 0; v1828 < v1818.length; v1828++) {
        v1823 = getDist(v1820.distance, v1819[v1827], v1818[v1826], v1820.attributes, "cmeans");
        v1824 = getDist(v1820.distance, v1819[v1827], v1818[v1828], v1820.attributes, "cmeans");
        v1822 += Math.pow(v1823 / v1824, v1825);
      }
      v1816[v1827][v1826] = 1 / v1822;
    }
  }
};
var assign$1 = function assign2(v1829, v1830, v1831, v1832) {
  var v1833 = new Array(v1831.k);
  for (var v1834 = 0; v1834 < v1833.length; v1834++) {
    v1833[v1834] = [];
  }
  var v1835;
  var v1836;
  for (var v1837 = 0; v1837 < v1830.length; v1837++) {
    v1835 = -Infinity;
    v1836 = -1;
    for (var v1838 = 0; v1838 < v1830[0].length; v1838++) {
      if (v1830[v1837][v1838] > v1835) {
        v1835 = v1830[v1837][v1838];
        v1836 = v1838;
      }
    }
    v1833[v1836].push(v1829[v1837]);
  }
  for (var v1839 = 0; v1839 < v1833.length; v1839++) {
    v1833[v1839] = v1832.collection(v1833[v1839]);
  }
  return v1833;
};
var fuzzyCMeans = function fuzzyCMeans2(v1840) {
  var v1841 = this.cy();
  var v1842 = this.nodes();
  var v1843 = setOptions$2(v1840);
  var v1844;
  var v1845;
  var v1846;
  var v1847;
  var v1848;
  v1847 = new Array(v1842.length);
  for (var v1849 = 0; v1849 < v1842.length; v1849++) {
    v1847[v1849] = new Array(v1843.k);
  }
  v1846 = new Array(v1842.length);
  for (var v1850 = 0; v1850 < v1842.length; v1850++) {
    v1846[v1850] = new Array(v1843.k);
  }
  for (var v1851 = 0; v1851 < v1842.length; v1851++) {
    var v1852 = 0;
    for (var v1853 = 0; v1853 < v1843.k; v1853++) {
      v1846[v1851][v1853] = Math.random();
      v1852 += v1846[v1851][v1853];
    }
    for (var v1854 = 0; v1854 < v1843.k; v1854++) {
      v1846[v1851][v1854] = v1846[v1851][v1854] / v1852;
    }
  }
  v1845 = new Array(v1843.k);
  for (var v1855 = 0; v1855 < v1843.k; v1855++) {
    v1845[v1855] = new Array(v1843.attributes.length);
  }
  v1848 = new Array(v1842.length);
  for (var v1856 = 0; v1856 < v1842.length; v1856++) {
    v1848[v1856] = new Array(v1843.k);
  }
  var v1857 = true;
  var v1858 = 0;
  while (v1857 && v1858 < v1843.maxIterations) {
    v1857 = false;
    updateCentroids(v1845, v1842, v1846, v1848, v1843);
    updateMembership(v1846, v1847, v1845, v1842, v1843);
    if (!haveMatricesConverged(v1846, v1847, v1843.sensitivityThreshold)) {
      v1857 = true;
    }
    v1858++;
  }
  v1844 = assign$1(v1842, v1846, v1843, v1841);
  return {
    clusters: v1844,
    degreeOfMembership: v1846
  };
};
var kClustering = {
  kMeans: kMeans,
  kMedoids: kMedoids,
  fuzzyCMeans: fuzzyCMeans,
  fcm: fuzzyCMeans
};
var defaults$a = defaults$g({
  distance: "euclidean",
  linkage: "min",
  mode: "threshold",
  threshold: Infinity,
  addDendrogram: false,
  dendrogramDepth: 0,
  attributes: []
});
var linkageAliases = {
  single: "min",
  complete: "max"
};
var setOptions$1 = function setOptions3(v1859) {
  var v1860 = defaults$a(v1859);
  var v1861 = linkageAliases[v1860.linkage];
  if (v1861 != null) {
    v1860.linkage = v1861;
  }
  return v1860;
};
var mergeClosest = function mergeClosest2(v1862, v1863, v1864, v1865, v1866) {
  var v1867 = 0;
  var v1868 = Infinity;
  var v1869;
  var v1870 = v1866.attributes;
  var v1871 = function v1872(v1873, v1874) {
    return clusteringDistance(v1866.distance, v1870.length, function (v1875) {
      return v1870[v1875](v1873);
    }, function (v1876) {
      return v1870[v1876](v1874);
    }, v1873, v1874);
  };
  for (var v1877 = 0; v1877 < v1862.length; v1877++) {
    var v1878 = v1862[v1877].key;
    var v1879 = v1864[v1878][v1865[v1878]];
    if (v1879 < v1868) {
      v1867 = v1878;
      v1868 = v1879;
    }
  }
  if (v1866.mode === "threshold" && v1868 >= v1866.threshold || v1866.mode === "dendrogram" && v1862.length === 1) {
    return false;
  }
  var v1880 = v1863[v1867];
  var v1881 = v1863[v1865[v1867]];
  var v1882;
  if (v1866.mode === "dendrogram") {
    v1882 = {
      left: v1880,
      right: v1881,
      key: v1880.key
    };
  } else {
    v1882 = {
      value: v1880.value.concat(v1881.value),
      key: v1880.key
    };
  }
  v1862[v1880.index] = v1882;
  v1862.splice(v1881.index, 1);
  v1863[v1880.key] = v1882;
  for (var v1883 = 0; v1883 < v1862.length; v1883++) {
    var v1884 = v1862[v1883];
    if (v1880.key === v1884.key) {
      v1869 = Infinity;
    } else if (v1866.linkage === "min") {
      v1869 = v1864[v1880.key][v1884.key];
      if (v1864[v1880.key][v1884.key] > v1864[v1881.key][v1884.key]) {
        v1869 = v1864[v1881.key][v1884.key];
      }
    } else if (v1866.linkage === "max") {
      v1869 = v1864[v1880.key][v1884.key];
      if (v1864[v1880.key][v1884.key] < v1864[v1881.key][v1884.key]) {
        v1869 = v1864[v1881.key][v1884.key];
      }
    } else if (v1866.linkage === "mean") {
      v1869 = (v1864[v1880.key][v1884.key] * v1880.size + v1864[v1881.key][v1884.key] * v1881.size) / (v1880.size + v1881.size);
    } else if (v1866.mode === "dendrogram") {
      v1869 = v1871(v1884.value, v1880.value);
    } else {
      v1869 = v1871(v1884.value[0], v1880.value[0]);
    }
    v1864[v1880.key][v1884.key] = v1864[v1884.key][v1880.key] = v1869;
  }
  for (var v1885 = 0; v1885 < v1862.length; v1885++) {
    var v1886 = v1862[v1885].key;
    if (v1865[v1886] === v1880.key || v1865[v1886] === v1881.key) {
      var v1887 = v1886;
      for (var v1888 = 0; v1888 < v1862.length; v1888++) {
        var v1889 = v1862[v1888].key;
        if (v1864[v1886][v1889] < v1864[v1886][v1887]) {
          v1887 = v1889;
        }
      }
      v1865[v1886] = v1887;
    }
    v1862[v1885].index = v1885;
  }
  v1880.key = v1881.key = v1880.index = v1881.index = null;
  return true;
};
var _getAllChildren = function getAllChildren(v1890, v1891, v1892) {
  if (!v1890) {
    return;
  }
  if (v1890.value) {
    v1891.push(v1890.value);
  } else {
    if (v1890.left) {
      _getAllChildren(v1890.left, v1891);
    }
    if (v1890.right) {
      _getAllChildren(v1890.right, v1891);
    }
  }
};
var _buildDendrogram = function buildDendrogram(v1893, v1894) {
  if (!v1893) {
    return "";
  }
  if (v1893.left && v1893.right) {
    var v1895 = _buildDendrogram(v1893.left, v1894);
    var v1896 = _buildDendrogram(v1893.right, v1894);
    var v1897 = v1894.add({
      group: "nodes",
      data: {
        id: v1895 + "," + v1896
      }
    });
    v1894.add({
      group: "edges",
      data: {
        source: v1895,
        target: v1897.id()
      }
    });
    v1894.add({
      group: "edges",
      data: {
        source: v1896,
        target: v1897.id()
      }
    });
    return v1897.id();
  } else if (v1893.value) {
    return v1893.value.id();
  }
};
var _buildClustersFromTree = function buildClustersFromTree(v1898, v1899, v1900) {
  if (!v1898) {
    return [];
  }
  var v1901 = [];
  var v1902 = [];
  var v1903 = [];
  if (v1899 === 0) {
    if (v1898.left) {
      _getAllChildren(v1898.left, v1901);
    }
    if (v1898.right) {
      _getAllChildren(v1898.right, v1902);
    }
    v1903 = v1901.concat(v1902);
    return [v1900.collection(v1903)];
  } else if (v1899 === 1) {
    if (v1898.value) {
      return [v1900.collection(v1898.value)];
    } else {
      if (v1898.left) {
        _getAllChildren(v1898.left, v1901);
      }
      if (v1898.right) {
        _getAllChildren(v1898.right, v1902);
      }
      return [v1900.collection(v1901), v1900.collection(v1902)];
    }
  } else if (v1898.value) {
    return [v1900.collection(v1898.value)];
  } else {
    if (v1898.left) {
      v1901 = _buildClustersFromTree(v1898.left, v1899 - 1, v1900);
    }
    if (v1898.right) {
      v1902 = _buildClustersFromTree(v1898.right, v1899 - 1, v1900);
    }
    return v1901.concat(v1902);
  }
};
var hierarchicalClustering = function hierarchicalClustering2(v1904) {
  var v1905 = this.cy();
  var v1906 = this.nodes();
  var v1907 = setOptions$1(v1904);
  var v1908 = v1907.attributes;
  var v1909 = function v1910(v1911, v1912) {
    return clusteringDistance(v1907.distance, v1908.length, function (v1913) {
      return v1908[v1913](v1911);
    }, function (v1914) {
      return v1908[v1914](v1912);
    }, v1911, v1912);
  };
  var v1915 = [];
  var v1916 = [];
  var v1917 = [];
  var v1918 = [];
  for (var v1919 = 0; v1919 < v1906.length; v1919++) {
    var v1920 = {
      value: v1907.mode === "dendrogram" ? v1906[v1919] : [v1906[v1919]],
      key: v1919,
      index: v1919
    };
    v1915[v1919] = v1920;
    v1918[v1919] = v1920;
    v1916[v1919] = [];
    v1917[v1919] = 0;
  }
  for (var v1921 = 0; v1921 < v1915.length; v1921++) {
    for (var v1922 = 0; v1922 <= v1921; v1922++) {
      var v1923 = undefined;
      if (v1907.mode === "dendrogram") {
        v1923 = v1921 === v1922 ? Infinity : v1909(v1915[v1921].value, v1915[v1922].value);
      } else {
        v1923 = v1921 === v1922 ? Infinity : v1909(v1915[v1921].value[0], v1915[v1922].value[0]);
      }
      v1916[v1921][v1922] = v1923;
      v1916[v1922][v1921] = v1923;
      if (v1923 < v1916[v1921][v1917[v1921]]) {
        v1917[v1921] = v1922;
      }
    }
  }
  var v1924 = mergeClosest(v1915, v1918, v1916, v1917, v1907);
  while (v1924) {
    v1924 = mergeClosest(v1915, v1918, v1916, v1917, v1907);
  }
  var v1925;
  if (v1907.mode === "dendrogram") {
    v1925 = _buildClustersFromTree(v1915[0], v1907.dendrogramDepth, v1905);
    if (v1907.addDendrogram) {
      _buildDendrogram(v1915[0], v1905);
    }
  } else {
    v1925 = new Array(v1915.length);
    v1915.forEach(function (v1926, v1927) {
      v1926.key = v1926.index = null;
      v1925[v1927] = v1905.collection(v1926.value);
    });
  }
  return v1925;
};
var hierarchicalClustering$1 = {
  hierarchicalClustering: hierarchicalClustering,
  hca: hierarchicalClustering
};
var defaults$9 = defaults$g({
  distance: "euclidean",
  preference: "median",
  damping: 0.8,
  maxIterations: 1000,
  minIterations: 100,
  attributes: []
});
var setOptions4 = function setOptions5(v1928) {
  var v1929 = v1928.damping;
  var v1930 = v1928.preference;
  if (!(v1929 >= 0.5) || !(v1929 < 1)) {
    error(`Damping must range on [0.5, 1).  Got: ${v1929}`);
  }
  var v1931 = ["median", "mean", "min", "max"];
  if (!v1931.some(function (v1932) {
    return v1932 === v1930;
  }) && !number$1(v1930)) {
    error(`Preference must be one of [${v1931.map(function (v1933) {
      return `'${v1933}'`;
    }).join(", ")}] or a number.  Got: ${v1930}`);
  }
  return defaults$9(v1928);
};
var getSimilarity2 = function getSimilarity3(v1934, v1935, v1936, v1937) {
  var v1938 = function v1939(v1940, v1941) {
    return v1937[v1941](v1940);
  };
  return -clusteringDistance(v1934, v1937.length, function (v1942) {
    return v1938(v1935, v1942);
  }, function (v1943) {
    return v1938(v1936, v1943);
  }, v1935, v1936);
};
var getPreference = function getPreference2(v1944, v1945) {
  var v1946 = null;
  if (v1945 === "median") {
    v1946 = median(v1944);
  } else if (v1945 === "mean") {
    v1946 = mean(v1944);
  } else if (v1945 === "min") {
    v1946 = min(v1944);
  } else if (v1945 === "max") {
    v1946 = max(v1944);
  } else {
    v1946 = v1945;
  }
  return v1946;
};
var findExemplars = function findExemplars2(v1947, v1948, v1949) {
  var v1950 = [];
  for (var v1951 = 0; v1951 < v1947; v1951++) {
    if (v1948[v1951 * v1947 + v1951] + v1949[v1951 * v1947 + v1951] > 0) {
      v1950.push(v1951);
    }
  }
  return v1950;
};
var assignClusters = function assignClusters2(v1952, v1953, v1954) {
  var v1955 = [];
  for (var v1956 = 0; v1956 < v1952; v1956++) {
    var v1957 = -1;
    var v1958 = -Infinity;
    for (var v1959 = 0; v1959 < v1954.length; v1959++) {
      var v1960 = v1954[v1959];
      if (v1953[v1956 * v1952 + v1960] > v1958) {
        v1957 = v1960;
        v1958 = v1953[v1956 * v1952 + v1960];
      }
    }
    if (v1957 > 0) {
      v1955.push(v1957);
    }
  }
  for (var v1961 = 0; v1961 < v1954.length; v1961++) {
    v1955[v1954[v1961]] = v1954[v1961];
  }
  return v1955;
};
var assign3 = function assign4(v1962, v1963, v1964) {
  var v1965 = assignClusters(v1962, v1963, v1964);
  for (var v1966 = 0; v1966 < v1964.length; v1966++) {
    var v1967 = [];
    for (var v1968 = 0; v1968 < v1965.length; v1968++) {
      if (v1965[v1968] === v1964[v1966]) {
        v1967.push(v1968);
      }
    }
    var v1969 = -1;
    var v1970 = -Infinity;
    for (var v1971 = 0; v1971 < v1967.length; v1971++) {
      var v1972 = 0;
      for (var v1973 = 0; v1973 < v1967.length; v1973++) {
        v1972 += v1963[v1967[v1973] * v1962 + v1967[v1971]];
      }
      if (v1972 > v1970) {
        v1969 = v1971;
        v1970 = v1972;
      }
    }
    v1964[v1966] = v1967[v1969];
  }
  v1965 = assignClusters(v1962, v1963, v1964);
  return v1965;
};
var affinityPropagation = function affinityPropagation2(v1974) {
  var v1975 = this.cy();
  var v1976 = this.nodes();
  var v1977 = setOptions4(v1974);
  var v1978 = {};
  for (var v1979 = 0; v1979 < v1976.length; v1979++) {
    v1978[v1976[v1979].id()] = v1979;
  }
  var v1980;
  var v1981;
  var v1982;
  var v1983;
  var v1984;
  var v1985;
  v1980 = v1976.length;
  v1981 = v1980 * v1980;
  v1982 = new Array(v1981);
  for (var v1986 = 0; v1986 < v1981; v1986++) {
    v1982[v1986] = -Infinity;
  }
  for (var v1987 = 0; v1987 < v1980; v1987++) {
    for (var v1988 = 0; v1988 < v1980; v1988++) {
      if (v1987 !== v1988) {
        v1982[v1987 * v1980 + v1988] = getSimilarity2(v1977.distance, v1976[v1987], v1976[v1988], v1977.attributes);
      }
    }
  }
  v1983 = getPreference(v1982, v1977.preference);
  for (var v1989 = 0; v1989 < v1980; v1989++) {
    v1982[v1989 * v1980 + v1989] = v1983;
  }
  v1984 = new Array(v1981);
  for (var v1990 = 0; v1990 < v1981; v1990++) {
    v1984[v1990] = 0;
  }
  v1985 = new Array(v1981);
  for (var v1991 = 0; v1991 < v1981; v1991++) {
    v1985[v1991] = 0;
  }
  var v1992 = new Array(v1980);
  var v1993 = new Array(v1980);
  var v1994 = new Array(v1980);
  for (var v1995 = 0; v1995 < v1980; v1995++) {
    v1992[v1995] = 0;
    v1993[v1995] = 0;
    v1994[v1995] = 0;
  }
  var v1996 = new Array(v1980 * v1977.minIterations);
  for (var v1997 = 0; v1997 < v1996.length; v1997++) {
    v1996[v1997] = 0;
  }
  var v1998;
  for (v1998 = 0; v1998 < v1977.maxIterations; v1998++) {
    for (var v1999 = 0; v1999 < v1980; v1999++) {
      var v2000 = -Infinity;
      var v2001 = -Infinity;
      var v2002 = -1;
      var v2003 = 0;
      for (var v2004 = 0; v2004 < v1980; v2004++) {
        v1992[v2004] = v1984[v1999 * v1980 + v2004];
        v2003 = v1985[v1999 * v1980 + v2004] + v1982[v1999 * v1980 + v2004];
        if (v2003 >= v2000) {
          v2001 = v2000;
          v2000 = v2003;
          v2002 = v2004;
        } else if (v2003 > v2001) {
          v2001 = v2003;
        }
      }
      for (var v2005 = 0; v2005 < v1980; v2005++) {
        v1984[v1999 * v1980 + v2005] = (1 - v1977.damping) * (v1982[v1999 * v1980 + v2005] - v2000) + v1977.damping * v1992[v2005];
      }
      v1984[v1999 * v1980 + v2002] = (1 - v1977.damping) * (v1982[v1999 * v1980 + v2002] - v2001) + v1977.damping * v1992[v2002];
    }
    for (var v2006 = 0; v2006 < v1980; v2006++) {
      var v2007 = 0;
      for (var v2008 = 0; v2008 < v1980; v2008++) {
        v1992[v2008] = v1985[v2008 * v1980 + v2006];
        v1993[v2008] = Math.max(0, v1984[v2008 * v1980 + v2006]);
        v2007 += v1993[v2008];
      }
      v2007 -= v1993[v2006];
      v1993[v2006] = v1984[v2006 * v1980 + v2006];
      v2007 += v1993[v2006];
      for (var v2009 = 0; v2009 < v1980; v2009++) {
        v1985[v2009 * v1980 + v2006] = (1 - v1977.damping) * Math.min(0, v2007 - v1993[v2009]) + v1977.damping * v1992[v2009];
      }
      v1985[v2006 * v1980 + v2006] = (1 - v1977.damping) * (v2007 - v1993[v2006]) + v1977.damping * v1992[v2006];
    }
    var v2010 = 0;
    for (var v2011 = 0; v2011 < v1980; v2011++) {
      var v2012 = v1985[v2011 * v1980 + v2011] + v1984[v2011 * v1980 + v2011] > 0 ? 1 : 0;
      v1996[v1998 % v1977.minIterations * v1980 + v2011] = v2012;
      v2010 += v2012;
    }
    if (v2010 > 0 && (v1998 >= v1977.minIterations - 1 || v1998 == v1977.maxIterations - 1)) {
      var v2013 = 0;
      for (var v2014 = 0; v2014 < v1980; v2014++) {
        v1994[v2014] = 0;
        for (var v2015 = 0; v2015 < v1977.minIterations; v2015++) {
          v1994[v2014] += v1996[v2015 * v1980 + v2014];
        }
        if (v1994[v2014] === 0 || v1994[v2014] === v1977.minIterations) {
          v2013++;
        }
      }
      if (v2013 === v1980) {
        break;
      }
    }
  }
  var v2016 = findExemplars(v1980, v1984, v1985);
  var v2017 = assign3(v1980, v1982, v2016);
  var v2018 = {};
  for (var v2019 = 0; v2019 < v2016.length; v2019++) {
    v2018[v2016[v2019]] = [];
  }
  for (var v2020 = 0; v2020 < v1976.length; v2020++) {
    var v2021 = v1978[v1976[v2020].id()];
    var v2022 = v2017[v2021];
    if (v2022 != null) {
      v2018[v2022].push(v1976[v2020]);
    }
  }
  var v2023 = new Array(v2016.length);
  for (var v2024 = 0; v2024 < v2016.length; v2024++) {
    v2023[v2024] = v1975.collection(v2018[v2016[v2024]]);
  }
  return v2023;
};
var affinityPropagation$1 = {
  affinityPropagation: affinityPropagation,
  ap: affinityPropagation
};
var hierholzerDefaults = defaults$g({
  root: undefined,
  directed: false
});
var elesfn$k = {
  hierholzer: function hierholzer(v2025) {
    if (!plainObject(v2025)) {
      var v2026 = arguments;
      v2025 = {
        root: v2026[0],
        directed: v2026[1]
      };
    }
    var v2027 = hierholzerDefaults(v2025);
    var v2028 = v2027.root;
    var v2029 = v2027.directed;
    var v2030 = this;
    var v2031 = false;
    var v2032;
    var v2033;
    var v2034;
    if (v2028) {
      v2034 = string(v2028) ? this.filter(v2028)[0].id() : v2028[0].id();
    }
    var v2035 = {};
    var v2036 = {};
    if (v2029) {
      v2030.forEach(function (v2037) {
        var v2038 = v2037.id();
        if (v2037.isNode()) {
          var v2039 = v2037.indegree(true);
          var v2040 = v2037.outdegree(true);
          var v2041 = v2039 - v2040;
          var v2042 = v2040 - v2039;
          if (v2041 == 1) {
            if (v2032) {
              v2031 = true;
            } else {
              v2032 = v2038;
            }
          } else if (v2042 == 1) {
            if (v2033) {
              v2031 = true;
            } else {
              v2033 = v2038;
            }
          } else if (v2042 > 1 || v2041 > 1) {
            v2031 = true;
          }
          v2035[v2038] = [];
          v2037.outgoers().forEach(function (v2043) {
            if (v2043.isEdge()) {
              v2035[v2038].push(v2043.id());
            }
          });
        } else {
          v2036[v2038] = [undefined, v2037.target().id()];
        }
      });
    } else {
      v2030.forEach(function (v2044) {
        var v2045 = v2044.id();
        if (v2044.isNode()) {
          var v2046 = v2044.degree(true);
          if (v2046 % 2) {
            if (!v2032) {
              v2032 = v2045;
            } else if (!v2033) {
              v2033 = v2045;
            } else {
              v2031 = true;
            }
          }
          v2035[v2045] = [];
          v2044.connectedEdges().forEach(function (v2047) {
            return v2035[v2045].push(v2047.id());
          });
        } else {
          v2036[v2045] = [v2044.source().id(), v2044.target().id()];
        }
      });
    }
    var v2048 = {
      found: false,
      trail: undefined
    };
    if (v2031) {
      return v2048;
    } else if (v2033 && v2032) {
      if (v2029) {
        if (v2034 && v2033 != v2034) {
          return v2048;
        }
        v2034 = v2033;
      } else if (v2034 && v2033 != v2034 && v2032 != v2034) {
        return v2048;
      } else if (!v2034) {
        v2034 = v2033;
      }
    } else if (!v2034) {
      v2034 = v2030[0].id();
    }
    var v2049 = function v2050(v2051) {
      var v2052 = v2051;
      var v2053 = [v2051];
      var v2054;
      var v2055;
      var v2056;
      while (v2035[v2052].length) {
        v2054 = v2035[v2052].shift();
        v2055 = v2036[v2054][0];
        v2056 = v2036[v2054][1];
        if (v2052 != v2056) {
          v2035[v2056] = v2035[v2056].filter(function (v2057) {
            return v2057 != v2054;
          });
          v2052 = v2056;
        } else if (!v2029 && v2052 != v2055) {
          v2035[v2055] = v2035[v2055].filter(function (v2058) {
            return v2058 != v2054;
          });
          v2052 = v2055;
        }
        v2053.unshift(v2054);
        v2053.unshift(v2052);
      }
      return v2053;
    };
    var v2059 = [];
    var v2060 = [];
    v2060 = v2049(v2034);
    while (v2060.length != 1) {
      if (v2035[v2060[0]].length == 0) {
        v2059.unshift(v2030.getElementById(v2060.shift()));
        v2059.unshift(v2030.getElementById(v2060.shift()));
      } else {
        v2060 = v2049(v2060.shift()).concat(v2060);
      }
    }
    v2059.unshift(v2030.getElementById(v2060.shift()));
    for (var v2061 in v2035) {
      if (v2035[v2061].length) {
        return v2048;
      }
    }
    v2048.found = true;
    v2048.trail = this.spawn(v2059, true);
    return v2048;
  }
};
var hopcroftTarjanBiconnected = function hopcroftTarjanBiconnected2() {
  var v2062 = this;
  var v2063 = {};
  var v2064 = 0;
  var v2065 = 0;
  var v2066 = [];
  var v2067 = [];
  var v2068 = {};
  var v2069 = function v2070(v2071, v2072) {
    var v2073 = v2067.length - 1;
    var v2074 = [];
    var v2075 = v2062.spawn();
    while (v2067[v2073].x != v2071 || v2067[v2073].y != v2072) {
      v2074.push(v2067.pop().edge);
      v2073--;
    }
    v2074.push(v2067.pop().edge);
    v2074.forEach(function (v2076) {
      var v2077 = v2076.connectedNodes().intersection(v2062);
      v2075.merge(v2076);
      v2077.forEach(function (v2078) {
        var v2079 = v2078.id();
        var v2080 = v2078.connectedEdges().intersection(v2062);
        v2075.merge(v2078);
        if (!v2063[v2079].cutVertex) {
          v2075.merge(v2080);
        } else {
          v2075.merge(v2080.filter(function (v2081) {
            return v2081.isLoop();
          }));
        }
      });
    });
    v2066.push(v2075);
  };
  var v2082 = function v2083(v2084, v2085, v2086) {
    if (v2084 === v2086) {
      v2065 += 1;
    }
    v2063[v2085] = {
      id: v2064,
      low: v2064++,
      cutVertex: false
    };
    var v2087 = v2062.getElementById(v2085).connectedEdges().intersection(v2062);
    if (v2087.size() === 0) {
      v2066.push(v2062.spawn(v2062.getElementById(v2085)));
    } else {
      var v2088;
      var v2089;
      var v2090;
      var v2091;
      v2087.forEach(function (v2092) {
        v2088 = v2092.source().id();
        v2089 = v2092.target().id();
        v2090 = v2088 === v2085 ? v2089 : v2088;
        if (v2090 !== v2086) {
          v2091 = v2092.id();
          if (!v2068[v2091]) {
            v2068[v2091] = true;
            v2067.push({
              x: v2085,
              y: v2090,
              edge: v2092
            });
          }
          if (!(v2090 in v2063)) {
            v2082(v2084, v2090, v2085);
            v2063[v2085].low = Math.min(v2063[v2085].low, v2063[v2090].low);
            if (v2063[v2085].id <= v2063[v2090].low) {
              v2063[v2085].cutVertex = true;
              v2069(v2085, v2090);
            }
          } else {
            v2063[v2085].low = Math.min(v2063[v2085].low, v2063[v2090].id);
          }
        }
      });
    }
  };
  v2062.forEach(function (v2093) {
    if (v2093.isNode()) {
      var v2094 = v2093.id();
      if (!(v2094 in v2063)) {
        v2065 = 0;
        v2082(v2094, v2094);
        v2063[v2094].cutVertex = v2065 > 1;
      }
    }
  });
  var v2095 = Object.keys(v2063).filter(function (v2096) {
    return v2063[v2096].cutVertex;
  }).map(function (v2097) {
    return v2062.getElementById(v2097);
  });
  return {
    cut: v2062.spawn(v2095),
    components: v2066
  };
};
var hopcroftTarjanBiconnected$1 = {
  hopcroftTarjanBiconnected: hopcroftTarjanBiconnected,
  htbc: hopcroftTarjanBiconnected,
  htb: hopcroftTarjanBiconnected,
  hopcroftTarjanBiconnectedComponents: hopcroftTarjanBiconnected
};
var tarjanStronglyConnected = function tarjanStronglyConnected2() {
  var v2098 = this;
  var v2099 = {};
  var v2100 = 0;
  var v2101 = [];
  var v2102 = [];
  var v2103 = v2098.spawn(v2098);
  var v2104 = function v2105(v2106) {
    v2102.push(v2106);
    v2099[v2106] = {
      index: v2100,
      low: v2100++,
      explored: false
    };
    var v2107 = v2098.getElementById(v2106).connectedEdges().intersection(v2098);
    v2107.forEach(function (v2108) {
      var v2109 = v2108.target().id();
      if (v2109 !== v2106) {
        if (!(v2109 in v2099)) {
          v2104(v2109);
        }
        if (!v2099[v2109].explored) {
          v2099[v2106].low = Math.min(v2099[v2106].low, v2099[v2109].low);
        }
      }
    });
    if (v2099[v2106].index === v2099[v2106].low) {
      var v2110 = v2098.spawn();
      while (true) {
        var v2111 = v2102.pop();
        v2110.merge(v2098.getElementById(v2111));
        v2099[v2111].low = v2099[v2106].index;
        v2099[v2111].explored = true;
        if (v2111 === v2106) {
          break;
        }
      }
      var v2112 = v2110.edgesWith(v2110);
      var v2113 = v2110.merge(v2112);
      v2101.push(v2113);
      v2103 = v2103.difference(v2113);
    }
  };
  v2098.forEach(function (v2114) {
    if (v2114.isNode()) {
      var v2115 = v2114.id();
      if (!(v2115 in v2099)) {
        v2104(v2115);
      }
    }
  });
  return {
    cut: v2103,
    components: v2101
  };
};
var tarjanStronglyConnected$1 = {
  tarjanStronglyConnected: tarjanStronglyConnected,
  tsc: tarjanStronglyConnected,
  tscc: tarjanStronglyConnected,
  tarjanStronglyConnectedComponents: tarjanStronglyConnected
};
var elesfn$j = {};
[elesfn$v, elesfn$u, elesfn$t, elesfn$s, elesfn$r, elesfn$q, elesfn$p, elesfn$o, elesfn$n, elesfn$m, elesfn$l, markovClustering$1, kClustering, hierarchicalClustering$1, affinityPropagation$1, elesfn$k, hopcroftTarjanBiconnected$1, tarjanStronglyConnected$1].forEach(function (v2116) {
  extend(elesfn$j, v2116);
});
var STATE_PENDING = 0;
var STATE_FULFILLED = 1;
var STATE_REJECTED = 2;
var _api = function api(v2117) {
  if (!(this instanceof _api)) {
    return new _api(v2117);
  }
  this.id = "Thenable/1.0.7";
  this.state = STATE_PENDING;
  this.fulfillValue = undefined;
  this.rejectReason = undefined;
  this.onFulfilled = [];
  this.onRejected = [];
  this.proxy = {
    then: this.then.bind(this)
  };
  if (typeof v2117 === "function") {
    v2117.call(this, this.fulfill.bind(this), this.reject.bind(this));
  }
};
_api.prototype = {
  fulfill: function fulfill(v2118) {
    return deliver(this, STATE_FULFILLED, "fulfillValue", v2118);
  },
  reject: function reject(v2119) {
    return deliver(this, STATE_REJECTED, "rejectReason", v2119);
  },
  then: function then(v2120, v2121) {
    var v2122 = this;
    var v2123 = new _api();
    v2122.onFulfilled.push(resolver(v2120, v2123, "fulfill"));
    v2122.onRejected.push(resolver(v2121, v2123, "reject"));
    execute(v2122);
    return v2123.proxy;
  }
};
var deliver = function deliver2(v2124, v2125, v2126, v2127) {
  if (v2124.state === STATE_PENDING) {
    v2124.state = v2125;
    v2124[v2126] = v2127;
    execute(v2124);
  }
  return v2124;
};
var execute = function execute2(v2128) {
  if (v2128.state === STATE_FULFILLED) {
    execute_handlers(v2128, "onFulfilled", v2128.fulfillValue);
  } else if (v2128.state === STATE_REJECTED) {
    execute_handlers(v2128, "onRejected", v2128.rejectReason);
  }
};
var execute_handlers = function execute_handlers2(v2129, v2130, v2131) {
  if (v2129[v2130].length === 0) {
    return;
  }
  var v2132 = v2129[v2130];
  v2129[v2130] = [];
  var v2133 = function v2134() {
    for (var v2135 = 0; v2135 < v2132.length; v2135++) {
      v2132[v2135](v2131);
    }
  };
  if (typeof setImmediate === "function") {
    setImmediate(v2133);
  } else {
    setTimeout(v2133, 0);
  }
};
var resolver = function resolver2(v2136, v2137, v2138) {
  return function (v2139) {
    if (typeof v2136 !== "function") {
      v2137[v2138].call(v2137, v2139);
    } else {
      var v2140;
      try {
        v2140 = v2136(v2139);
      } catch (v2141) {
        v2137.reject(v2141);
        return;
      }
      _resolve(v2137, v2140);
    }
  };
};
var _resolve = function resolve(v2142, v2143) {
  if (v2142 === v2143 || v2142.proxy === v2143) {
    v2142.reject(new TypeError("cannot resolve promise with itself"));
    return;
  }
  var v2144;
  if (_typeof(v2143) === "object" && v2143 !== null || typeof v2143 === "function") {
    try {
      v2144 = v2143.then;
    } catch (v2145) {
      v2142.reject(v2145);
      return;
    }
  }
  if (typeof v2144 === "function") {
    var v2146 = false;
    try {
      v2144.call(v2143, function (v2147) {
        if (v2146) {
          return;
        }
        v2146 = true;
        if (v2147 === v2143) {
          v2142.reject(new TypeError("circular thenable chain"));
        } else {
          _resolve(v2142, v2147);
        }
      }, function (v2148) {
        if (v2146) {
          return;
        }
        v2146 = true;
        v2142.reject(v2148);
      });
    } catch (v2149) {
      if (!v2146) {
        v2142.reject(v2149);
      }
    }
    return;
  }
  v2142.fulfill(v2143);
};
_api.all = function (v2150) {
  return new _api(function (v2151, v2152) {
    var v2153 = new Array(v2150.length);
    var v2154 = 0;
    var v2155 = function v2156(v2157, v2158) {
      v2153[v2157] = v2158;
      v2154++;
      if (v2154 === v2150.length) {
        v2151(v2153);
      }
    };
    for (var v2159 = 0; v2159 < v2150.length; v2159++) {
      (function (v2160) {
        var v2161 = v2150[v2160];
        var v2162 = v2161 != null && v2161.then != null;
        if (v2162) {
          v2161.then(function (v2163) {
            v2155(v2160, v2163);
          }, function (v2164) {
            v2152(v2164);
          });
        } else {
          var v2165 = v2161;
          v2155(v2160, v2165);
        }
      })(v2159);
    }
  });
};
_api.resolve = function (v2166) {
  return new _api(function (v2167, v2168) {
    v2167(v2166);
  });
};
_api.reject = function (v2169) {
  return new _api(function (v2170, v2171) {
    v2171(v2169);
  });
};
var Promise$1 = typeof Promise !== "undefined" ? Promise : _api;
var Animation = function Animation2(v2172, v2173, v2174) {
  var v2175 = core(v2172);
  var v2176 = !v2175;
  var v2177 = this._private = extend({
    duration: 1000
  }, v2173, v2174);
  v2177.target = v2172;
  v2177.style = v2177.style || v2177.css;
  v2177.started = false;
  v2177.playing = false;
  v2177.hooked = false;
  v2177.applying = false;
  v2177.progress = 0;
  v2177.completes = [];
  v2177.frames = [];
  if (v2177.complete && fn$6(v2177.complete)) {
    v2177.completes.push(v2177.complete);
  }
  if (v2176) {
    var v2178 = v2172.position();
    v2177.startPosition = v2177.startPosition || {
      x: v2178.x,
      y: v2178.y
    };
    v2177.startStyle = v2177.startStyle || v2172.cy().style().getAnimationStartStyle(v2172, v2177.style);
  }
  if (v2175) {
    var v2179 = v2172.pan();
    v2177.startPan = {
      x: v2179.x,
      y: v2179.y
    };
    v2177.startZoom = v2172.zoom();
  }
  this.length = 1;
  this[0] = this;
};
var anifn = Animation.prototype;
extend(anifn, {
  instanceString: function instanceString() {
    return "animation";
  },
  hook: function hook() {
    var v2180 = this._private;
    if (!v2180.hooked) {
      var v2181;
      var v2182 = v2180.target._private.animation;
      if (v2180.queue) {
        v2181 = v2182.queue;
      } else {
        v2181 = v2182.current;
      }
      v2181.push(this);
      if (elementOrCollection(v2180.target)) {
        v2180.target.cy().addToAnimationPool(v2180.target);
      }
      v2180.hooked = true;
    }
    return this;
  },
  play: function play() {
    var v2183 = this._private;
    if (v2183.progress === 1) {
      v2183.progress = 0;
    }
    v2183.playing = true;
    v2183.started = false;
    v2183.stopped = false;
    this.hook();
    return this;
  },
  playing: function playing() {
    return this._private.playing;
  },
  apply: function apply() {
    var v2184 = this._private;
    v2184.applying = true;
    v2184.started = false;
    v2184.stopped = false;
    this.hook();
    return this;
  },
  applying: function applying() {
    return this._private.applying;
  },
  pause: function pause() {
    var v2185 = this._private;
    v2185.playing = false;
    v2185.started = false;
    return this;
  },
  stop: function stop() {
    var v2186 = this._private;
    v2186.playing = false;
    v2186.started = false;
    v2186.stopped = true;
    return this;
  },
  rewind: function rewind() {
    return this.progress(0);
  },
  fastforward: function fastforward() {
    return this.progress(1);
  },
  time: function time(v2187) {
    var v2188 = this._private;
    if (v2187 === undefined) {
      return v2188.progress * v2188.duration;
    } else {
      return this.progress(v2187 / v2188.duration);
    }
  },
  progress: function progress(v2189) {
    var v2190 = this._private;
    var v2191 = v2190.playing;
    if (v2189 === undefined) {
      return v2190.progress;
    } else {
      if (v2191) {
        this.pause();
      }
      v2190.progress = v2189;
      v2190.started = false;
      if (v2191) {
        this.play();
      }
    }
    return this;
  },
  completed: function completed() {
    return this._private.progress === 1;
  },
  reverse: function reverse() {
    var v2192 = this._private;
    var v2193 = v2192.playing;
    if (v2193) {
      this.pause();
    }
    v2192.progress = 1 - v2192.progress;
    v2192.started = false;
    var v2194 = function v2195(v2196, v2197) {
      var v2198 = v2192[v2196];
      if (v2198 == null) {
        return;
      }
      v2192[v2196] = v2192[v2197];
      v2192[v2197] = v2198;
    };
    v2194("zoom", "startZoom");
    v2194("pan", "startPan");
    v2194("position", "startPosition");
    if (v2192.style) {
      for (var v2199 = 0; v2199 < v2192.style.length; v2199++) {
        var v2200 = v2192.style[v2199];
        var v2201 = v2200.name;
        var v2202 = v2192.startStyle[v2201];
        v2192.startStyle[v2201] = v2200;
        v2192.style[v2199] = v2202;
      }
    }
    if (v2193) {
      this.play();
    }
    return this;
  },
  promise: function promise3(v2203) {
    var v2204 = this._private;
    var v2205;
    switch (v2203) {
      case "frame":
        v2205 = v2204.frames;
        break;
      default:
      case "complete":
      case "completed":
        v2205 = v2204.completes;
    }
    return new Promise$1(function (v2206, v2207) {
      v2205.push(function () {
        v2206();
      });
    });
  }
});
anifn.complete = anifn.completed;
anifn.run = anifn.play;
anifn.running = anifn.playing;
var define$3 = {
  animated: function animated() {
    return function v2208() {
      var v2209 = this;
      var v2210 = v2209.length !== undefined;
      var v2211 = v2210 ? v2209 : [v2209];
      var v2212 = this._private.cy || this;
      if (!v2212.styleEnabled()) {
        return false;
      }
      var v2213 = v2211[0];
      if (v2213) {
        return v2213._private.animation.current.length > 0;
      }
    };
  },
  clearQueue: function clearQueue() {
    return function v2214() {
      var v2215 = this;
      var v2216 = v2215.length !== undefined;
      var v2217 = v2216 ? v2215 : [v2215];
      var v2218 = this._private.cy || this;
      if (!v2218.styleEnabled()) {
        return this;
      }
      for (var v2219 = 0; v2219 < v2217.length; v2219++) {
        var v2220 = v2217[v2219];
        v2220._private.animation.queue = [];
      }
      return this;
    };
  },
  delay: function delay() {
    return function v2221(v2222, v2223) {
      var v2224 = this._private.cy || this;
      if (!v2224.styleEnabled()) {
        return this;
      }
      return this.animate({
        delay: v2222,
        duration: v2222,
        complete: v2223
      });
    };
  },
  delayAnimation: function delayAnimation() {
    return function v2225(v2226, v2227) {
      var v2228 = this._private.cy || this;
      if (!v2228.styleEnabled()) {
        return this;
      }
      return this.animation({
        delay: v2226,
        duration: v2226,
        complete: v2227
      });
    };
  },
  animation: function animation() {
    return function v2229(v2230, v2231) {
      var v2232 = this;
      var v2233 = v2232.length !== undefined;
      var v2234 = v2233 ? v2232 : [v2232];
      var v2235 = this._private.cy || this;
      var v2236 = !v2233;
      var v2237 = !v2236;
      if (!v2235.styleEnabled()) {
        return this;
      }
      var v2238 = v2235.style();
      v2230 = extend({}, v2230, v2231);
      var v2239 = Object.keys(v2230).length === 0;
      if (v2239) {
        return new Animation(v2234[0], v2230);
      }
      if (v2230.duration === undefined) {
        v2230.duration = 400;
      }
      switch (v2230.duration) {
        case "slow":
          v2230.duration = 600;
          break;
        case "fast":
          v2230.duration = 200;
          break;
      }
      if (v2237) {
        v2230.style = v2238.getPropsList(v2230.style || v2230.css);
        v2230.css = undefined;
      }
      if (v2237 && v2230.renderedPosition != null) {
        var v2240 = v2230.renderedPosition;
        var v2241 = v2235.pan();
        var v2242 = v2235.zoom();
        v2230.position = renderedToModelPosition(v2240, v2242, v2241);
      }
      if (v2236 && v2230.panBy != null) {
        var v2243 = v2230.panBy;
        var v2244 = v2235.pan();
        v2230.pan = {
          x: v2244.x + v2243.x,
          y: v2244.y + v2243.y
        };
      }
      var v2245 = v2230.center || v2230.centre;
      if (v2236 && v2245 != null) {
        var v2246 = v2235.getCenterPan(v2245.eles, v2230.zoom);
        if (v2246 != null) {
          v2230.pan = v2246;
        }
      }
      if (v2236 && v2230.fit != null) {
        var v2247 = v2230.fit;
        var v2248 = v2235.getFitViewport(v2247.eles || v2247.boundingBox, v2247.padding);
        if (v2248 != null) {
          v2230.pan = v2248.pan;
          v2230.zoom = v2248.zoom;
        }
      }
      if (v2236 && plainObject(v2230.zoom)) {
        var v2249 = v2235.getZoomedViewport(v2230.zoom);
        if (v2249 != null) {
          if (v2249.zoomed) {
            v2230.zoom = v2249.zoom;
          }
          if (v2249.panned) {
            v2230.pan = v2249.pan;
          }
        } else {
          v2230.zoom = null;
        }
      }
      return new Animation(v2234[0], v2230);
    };
  },
  animate: function animate() {
    return function v2250(v2251, v2252) {
      var v2253 = this;
      var v2254 = v2253.length !== undefined;
      var v2255 = v2254 ? v2253 : [v2253];
      var v2256 = this._private.cy || this;
      if (!v2256.styleEnabled()) {
        return this;
      }
      if (v2252) {
        v2251 = extend({}, v2251, v2252);
      }
      for (var v2257 = 0; v2257 < v2255.length; v2257++) {
        var v2258 = v2255[v2257];
        var v2259 = v2258.animated() && (v2251.queue === undefined || v2251.queue);
        var v2260 = v2258.animation(v2251, v2259 ? {
          queue: true
        } : undefined);
        v2260.play();
      }
      return this;
    };
  },
  stop: function stop2() {
    return function v2261(v2262, v2263) {
      var v2264 = this;
      var v2265 = v2264.length !== undefined;
      var v2266 = v2265 ? v2264 : [v2264];
      var v2267 = this._private.cy || this;
      if (!v2267.styleEnabled()) {
        return this;
      }
      for (var v2268 = 0; v2268 < v2266.length; v2268++) {
        var v2269 = v2266[v2268];
        var v2270 = v2269._private;
        var v2271 = v2270.animation.current;
        for (var v2272 = 0; v2272 < v2271.length; v2272++) {
          var v2273 = v2271[v2272];
          var v2274 = v2273._private;
          if (v2263) {
            v2274.duration = 0;
          }
        }
        if (v2262) {
          v2270.animation.queue = [];
        }
        if (!v2263) {
          v2270.animation.current = [];
        }
      }
      v2267.notify("draw");
      return this;
    };
  }
};
var isArray_1;
var hasRequiredIsArray;
function requireIsArray() {
  if (hasRequiredIsArray) {
    return isArray_1;
  }
  hasRequiredIsArray = 1;
  var v2275 = Array.isArray;
  isArray_1 = v2275;
  return isArray_1;
}
var _isKey;
var hasRequired_isKey;
function require_isKey() {
  if (hasRequired_isKey) {
    return _isKey;
  }
  hasRequired_isKey = 1;
  var v2276 = requireIsArray();
  var v2277 = requireIsSymbol();
  var v2278 = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var v2279 = /^\w*$/;
  function v2280(v2281, v2282) {
    if (v2276(v2281)) {
      return false;
    }
    var v2283 = typeof v2281;
    if (v2283 == "number" || v2283 == "symbol" || v2283 == "boolean" || v2281 == null || v2277(v2281)) {
      return true;
    }
    return v2279.test(v2281) || !v2278.test(v2281) || v2282 != null && v2281 in Object(v2282);
  }
  _isKey = v2280;
  return _isKey;
}
var isFunction_1;
var hasRequiredIsFunction;
function requireIsFunction() {
  if (hasRequiredIsFunction) {
    return isFunction_1;
  }
  hasRequiredIsFunction = 1;
  var v2284 = require_baseGetTag();
  var v2285 = requireIsObject();
  var v2286 = "[object AsyncFunction]";
  var v2287 = "[object Function]";
  var v2288 = "[object GeneratorFunction]";
  var v2289 = "[object Proxy]";
  function v2290(v2291) {
    if (!v2285(v2291)) {
      return false;
    }
    var v2292 = v2284(v2291);
    return v2292 == v2287 || v2292 == v2288 || v2292 == v2286 || v2292 == v2289;
  }
  isFunction_1 = v2290;
  return isFunction_1;
}
var _coreJsData;
var hasRequired_coreJsData;
function require_coreJsData() {
  if (hasRequired_coreJsData) {
    return _coreJsData;
  }
  hasRequired_coreJsData = 1;
  var v2293 = require_root();
  var v2294 = v2293["__core-js_shared__"];
  _coreJsData = v2294;
  return _coreJsData;
}
var _isMasked;
var hasRequired_isMasked;
function require_isMasked() {
  if (hasRequired_isMasked) {
    return _isMasked;
  }
  hasRequired_isMasked = 1;
  var v2295 = require_coreJsData();
  var v2296 = function () {
    var v2297 = /[^.]+$/.exec(v2295 && v2295.keys && v2295.keys.IE_PROTO || "");
    if (v2297) {
      return "Symbol(src)_1." + v2297;
    } else {
      return "";
    }
  }();
  function v2298(v2299) {
    return !!v2296 && v2296 in v2299;
  }
  _isMasked = v2298;
  return _isMasked;
}
var _toSource;
var hasRequired_toSource;
function require_toSource() {
  if (hasRequired_toSource) {
    return _toSource;
  }
  hasRequired_toSource = 1;
  var v2300 = Function.prototype;
  var v2301 = v2300.toString;
  function v2302(v2303) {
    if (v2303 != null) {
      try {
        return v2301.call(v2303);
      } catch (v2304) {}
      try {
        return v2303 + "";
      } catch (v2305) {}
    }
    return "";
  }
  _toSource = v2302;
  return _toSource;
}
var _baseIsNative;
var hasRequired_baseIsNative;
function require_baseIsNative() {
  if (hasRequired_baseIsNative) {
    return _baseIsNative;
  }
  hasRequired_baseIsNative = 1;
  var v2306 = requireIsFunction();
  var v2307 = require_isMasked();
  var v2308 = requireIsObject();
  var v2309 = require_toSource();
  var v2310 = /[\\^$.*+?()[\]{}|]/g;
  var v2311 = /^\[object .+?Constructor\]$/;
  var v2312 = Function.prototype;
  var v2313 = Object.prototype;
  var v2314 = v2312.toString;
  var v2315 = v2313.hasOwnProperty;
  var v2316 = RegExp("^" + v2314.call(v2315).replace(v2310, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
  function v2317(v2318) {
    if (!v2308(v2318) || v2307(v2318)) {
      return false;
    }
    var v2319 = v2306(v2318) ? v2316 : v2311;
    return v2319.test(v2309(v2318));
  }
  _baseIsNative = v2317;
  return _baseIsNative;
}
var _getValue;
var hasRequired_getValue;
function require_getValue() {
  if (hasRequired_getValue) {
    return _getValue;
  }
  hasRequired_getValue = 1;
  function v2320(v2321, v2322) {
    if (v2321 == null) {
      return undefined;
    } else {
      return v2321[v2322];
    }
  }
  _getValue = v2320;
  return _getValue;
}
var _getNative;
var hasRequired_getNative;
function require_getNative() {
  if (hasRequired_getNative) {
    return _getNative;
  }
  hasRequired_getNative = 1;
  var v2323 = require_baseIsNative();
  var v2324 = require_getValue();
  function v2325(v2326, v2327) {
    var v2328 = v2324(v2326, v2327);
    if (v2323(v2328)) {
      return v2328;
    } else {
      return undefined;
    }
  }
  _getNative = v2325;
  return _getNative;
}
var _nativeCreate;
var hasRequired_nativeCreate;
function require_nativeCreate() {
  if (hasRequired_nativeCreate) {
    return _nativeCreate;
  }
  hasRequired_nativeCreate = 1;
  var v2329 = require_getNative();
  var v2330 = v2329(Object, "create");
  _nativeCreate = v2330;
  return _nativeCreate;
}
var _hashClear;
var hasRequired_hashClear;
function require_hashClear() {
  if (hasRequired_hashClear) {
    return _hashClear;
  }
  hasRequired_hashClear = 1;
  var v2331 = require_nativeCreate();
  function v2332() {
    this.__data__ = v2331 ? v2331(null) : {};
    this.size = 0;
  }
  _hashClear = v2332;
  return _hashClear;
}
var _hashDelete;
var hasRequired_hashDelete;
function require_hashDelete() {
  if (hasRequired_hashDelete) {
    return _hashDelete;
  }
  hasRequired_hashDelete = 1;
  function v2333(v2334) {
    var v2335 = this.has(v2334) && delete this.__data__[v2334];
    this.size -= v2335 ? 1 : 0;
    return v2335;
  }
  _hashDelete = v2333;
  return _hashDelete;
}
var _hashGet;
var hasRequired_hashGet;
function require_hashGet() {
  if (hasRequired_hashGet) {
    return _hashGet;
  }
  hasRequired_hashGet = 1;
  var v2336 = require_nativeCreate();
  var v2337 = "__lodash_hash_undefined__";
  var v2338 = Object.prototype;
  var v2339 = v2338.hasOwnProperty;
  function v2340(v2341) {
    var v2342 = this.__data__;
    if (v2336) {
      var v2343 = v2342[v2341];
      if (v2343 === v2337) {
        return undefined;
      } else {
        return v2343;
      }
    }
    if (v2339.call(v2342, v2341)) {
      return v2342[v2341];
    } else {
      return undefined;
    }
  }
  _hashGet = v2340;
  return _hashGet;
}
var _hashHas;
var hasRequired_hashHas;
function require_hashHas() {
  if (hasRequired_hashHas) {
    return _hashHas;
  }
  hasRequired_hashHas = 1;
  var v2344 = require_nativeCreate();
  var v2345 = Object.prototype;
  var v2346 = v2345.hasOwnProperty;
  function v2347(v2348) {
    var v2349 = this.__data__;
    if (v2344) {
      return v2349[v2348] !== undefined;
    } else {
      return v2346.call(v2349, v2348);
    }
  }
  _hashHas = v2347;
  return _hashHas;
}
var _hashSet;
var hasRequired_hashSet;
function require_hashSet() {
  if (hasRequired_hashSet) {
    return _hashSet;
  }
  hasRequired_hashSet = 1;
  var v2350 = require_nativeCreate();
  var v2351 = "__lodash_hash_undefined__";
  function v2352(v2353, v2354) {
    var v2355 = this.__data__;
    this.size += this.has(v2353) ? 0 : 1;
    v2355[v2353] = v2350 && v2354 === undefined ? v2351 : v2354;
    return this;
  }
  _hashSet = v2352;
  return _hashSet;
}
var _Hash;
var hasRequired_Hash;
function require_Hash() {
  if (hasRequired_Hash) {
    return _Hash;
  }
  hasRequired_Hash = 1;
  var v2356 = require_hashClear();
  var v2357 = require_hashDelete();
  var v2358 = require_hashGet();
  var v2359 = require_hashHas();
  var v2360 = require_hashSet();
  function v2361(v2362) {
    var v2363 = -1;
    var v2364 = v2362 == null ? 0 : v2362.length;
    this.clear();
    while (++v2363 < v2364) {
      var v2365 = v2362[v2363];
      this.set(v2365[0], v2365[1]);
    }
  }
  v2361.prototype.clear = v2356;
  v2361.prototype.delete = v2357;
  v2361.prototype.get = v2358;
  v2361.prototype.has = v2359;
  v2361.prototype.set = v2360;
  _Hash = v2361;
  return _Hash;
}
var _listCacheClear;
var hasRequired_listCacheClear;
function require_listCacheClear() {
  if (hasRequired_listCacheClear) {
    return _listCacheClear;
  }
  hasRequired_listCacheClear = 1;
  function v2366() {
    this.__data__ = [];
    this.size = 0;
  }
  _listCacheClear = v2366;
  return _listCacheClear;
}
var eq_1;
var hasRequiredEq;
function requireEq() {
  if (hasRequiredEq) {
    return eq_1;
  }
  hasRequiredEq = 1;
  function v2367(v2368, v2369) {
    return v2368 === v2369 || v2368 !== v2368 && v2369 !== v2369;
  }
  eq_1 = v2367;
  return eq_1;
}
var _assocIndexOf;
var hasRequired_assocIndexOf;
function require_assocIndexOf() {
  if (hasRequired_assocIndexOf) {
    return _assocIndexOf;
  }
  hasRequired_assocIndexOf = 1;
  var v2370 = requireEq();
  function v2371(v2372, v2373) {
    var v2374 = v2372.length;
    while (v2374--) {
      if (v2370(v2372[v2374][0], v2373)) {
        return v2374;
      }
    }
    return -1;
  }
  _assocIndexOf = v2371;
  return _assocIndexOf;
}
var _listCacheDelete;
var hasRequired_listCacheDelete;
function require_listCacheDelete() {
  if (hasRequired_listCacheDelete) {
    return _listCacheDelete;
  }
  hasRequired_listCacheDelete = 1;
  var v2375 = require_assocIndexOf();
  var v2376 = Array.prototype;
  var v2377 = v2376.splice;
  function v2378(v2379) {
    var v2380 = this.__data__;
    var v2381 = v2375(v2380, v2379);
    if (v2381 < 0) {
      return false;
    }
    var v2382 = v2380.length - 1;
    if (v2381 == v2382) {
      v2380.pop();
    } else {
      v2377.call(v2380, v2381, 1);
    }
    --this.size;
    return true;
  }
  _listCacheDelete = v2378;
  return _listCacheDelete;
}
var _listCacheGet;
var hasRequired_listCacheGet;
function require_listCacheGet() {
  if (hasRequired_listCacheGet) {
    return _listCacheGet;
  }
  hasRequired_listCacheGet = 1;
  var v2383 = require_assocIndexOf();
  function v2384(v2385) {
    var v2386 = this.__data__;
    var v2387 = v2383(v2386, v2385);
    if (v2387 < 0) {
      return undefined;
    } else {
      return v2386[v2387][1];
    }
  }
  _listCacheGet = v2384;
  return _listCacheGet;
}
var _listCacheHas;
var hasRequired_listCacheHas;
function require_listCacheHas() {
  if (hasRequired_listCacheHas) {
    return _listCacheHas;
  }
  hasRequired_listCacheHas = 1;
  var v2388 = require_assocIndexOf();
  function v2389(v2390) {
    return v2388(this.__data__, v2390) > -1;
  }
  _listCacheHas = v2389;
  return _listCacheHas;
}
var _listCacheSet;
var hasRequired_listCacheSet;
function require_listCacheSet() {
  if (hasRequired_listCacheSet) {
    return _listCacheSet;
  }
  hasRequired_listCacheSet = 1;
  var v2391 = require_assocIndexOf();
  function v2392(v2393, v2394) {
    var v2395 = this.__data__;
    var v2396 = v2391(v2395, v2393);
    if (v2396 < 0) {
      ++this.size;
      v2395.push([v2393, v2394]);
    } else {
      v2395[v2396][1] = v2394;
    }
    return this;
  }
  _listCacheSet = v2392;
  return _listCacheSet;
}
var _ListCache;
var hasRequired_ListCache;
function require_ListCache() {
  if (hasRequired_ListCache) {
    return _ListCache;
  }
  hasRequired_ListCache = 1;
  var v2397 = require_listCacheClear();
  var v2398 = require_listCacheDelete();
  var v2399 = require_listCacheGet();
  var v2400 = require_listCacheHas();
  var v2401 = require_listCacheSet();
  function v2402(v2403) {
    var v2404 = -1;
    var v2405 = v2403 == null ? 0 : v2403.length;
    this.clear();
    while (++v2404 < v2405) {
      var v2406 = v2403[v2404];
      this.set(v2406[0], v2406[1]);
    }
  }
  v2402.prototype.clear = v2397;
  v2402.prototype.delete = v2398;
  v2402.prototype.get = v2399;
  v2402.prototype.has = v2400;
  v2402.prototype.set = v2401;
  _ListCache = v2402;
  return _ListCache;
}
var _Map;
var hasRequired_Map;
function require_Map() {
  if (hasRequired_Map) {
    return _Map;
  }
  hasRequired_Map = 1;
  var v2407 = require_getNative();
  var v2408 = require_root();
  var v2409 = v2407(v2408, "Map");
  _Map = v2409;
  return _Map;
}
var _mapCacheClear;
var hasRequired_mapCacheClear;
function require_mapCacheClear() {
  if (hasRequired_mapCacheClear) {
    return _mapCacheClear;
  }
  hasRequired_mapCacheClear = 1;
  var v2410 = require_Hash();
  var v2411 = require_ListCache();
  var v2412 = require_Map();
  function v2413() {
    this.size = 0;
    this.__data__ = {
      hash: new v2410(),
      map: new (v2412 || v2411)(),
      string: new v2410()
    };
  }
  _mapCacheClear = v2413;
  return _mapCacheClear;
}
var _isKeyable;
var hasRequired_isKeyable;
function require_isKeyable() {
  if (hasRequired_isKeyable) {
    return _isKeyable;
  }
  hasRequired_isKeyable = 1;
  function v2414(v2415) {
    var v2416 = typeof v2415;
    if (v2416 == "string" || v2416 == "number" || v2416 == "symbol" || v2416 == "boolean") {
      return v2415 !== "__proto__";
    } else {
      return v2415 === null;
    }
  }
  _isKeyable = v2414;
  return _isKeyable;
}
var _getMapData;
var hasRequired_getMapData;
function require_getMapData() {
  if (hasRequired_getMapData) {
    return _getMapData;
  }
  hasRequired_getMapData = 1;
  var v2417 = require_isKeyable();
  function v2418(v2419, v2420) {
    var v2421 = v2419.__data__;
    if (v2417(v2420)) {
      return v2421[typeof v2420 == "string" ? "string" : "hash"];
    } else {
      return v2421.map;
    }
  }
  _getMapData = v2418;
  return _getMapData;
}
var _mapCacheDelete;
var hasRequired_mapCacheDelete;
function require_mapCacheDelete() {
  if (hasRequired_mapCacheDelete) {
    return _mapCacheDelete;
  }
  hasRequired_mapCacheDelete = 1;
  var v2422 = require_getMapData();
  function v2423(v2424) {
    var v2425 = v2422(this, v2424).delete(v2424);
    this.size -= v2425 ? 1 : 0;
    return v2425;
  }
  _mapCacheDelete = v2423;
  return _mapCacheDelete;
}
var _mapCacheGet;
var hasRequired_mapCacheGet;
function require_mapCacheGet() {
  if (hasRequired_mapCacheGet) {
    return _mapCacheGet;
  }
  hasRequired_mapCacheGet = 1;
  var v2426 = require_getMapData();
  function v2427(v2428) {
    return v2426(this, v2428).get(v2428);
  }
  _mapCacheGet = v2427;
  return _mapCacheGet;
}
var _mapCacheHas;
var hasRequired_mapCacheHas;
function require_mapCacheHas() {
  if (hasRequired_mapCacheHas) {
    return _mapCacheHas;
  }
  hasRequired_mapCacheHas = 1;
  var v2429 = require_getMapData();
  function v2430(v2431) {
    return v2429(this, v2431).has(v2431);
  }
  _mapCacheHas = v2430;
  return _mapCacheHas;
}
var _mapCacheSet;
var hasRequired_mapCacheSet;
function require_mapCacheSet() {
  if (hasRequired_mapCacheSet) {
    return _mapCacheSet;
  }
  hasRequired_mapCacheSet = 1;
  var v2432 = require_getMapData();
  function v2433(v2434, v2435) {
    var v2436 = v2432(this, v2434);
    var v2437 = v2436.size;
    v2436.set(v2434, v2435);
    this.size += v2436.size == v2437 ? 0 : 1;
    return this;
  }
  _mapCacheSet = v2433;
  return _mapCacheSet;
}
var _MapCache;
var hasRequired_MapCache;
function require_MapCache() {
  if (hasRequired_MapCache) {
    return _MapCache;
  }
  hasRequired_MapCache = 1;
  var v2438 = require_mapCacheClear();
  var v2439 = require_mapCacheDelete();
  var v2440 = require_mapCacheGet();
  var v2441 = require_mapCacheHas();
  var v2442 = require_mapCacheSet();
  function v2443(v2444) {
    var v2445 = -1;
    var v2446 = v2444 == null ? 0 : v2444.length;
    this.clear();
    while (++v2445 < v2446) {
      var v2447 = v2444[v2445];
      this.set(v2447[0], v2447[1]);
    }
  }
  v2443.prototype.clear = v2438;
  v2443.prototype.delete = v2439;
  v2443.prototype.get = v2440;
  v2443.prototype.has = v2441;
  v2443.prototype.set = v2442;
  _MapCache = v2443;
  return _MapCache;
}
var memoize_1;
var hasRequiredMemoize;
function requireMemoize() {
  if (hasRequiredMemoize) {
    return memoize_1;
  }
  hasRequiredMemoize = 1;
  var v2448 = require_MapCache();
  var v2449 = "Expected a function";
  function v2450(v2451, v2452) {
    if (typeof v2451 != "function" || v2452 != null && typeof v2452 != "function") {
      throw new TypeError(v2449);
    }
    function v2453() {
      var v2454 = arguments;
      var v2455 = v2452 ? v2452.apply(this, v2454) : v2454[0];
      var v2456 = v2453.cache;
      if (v2456.has(v2455)) {
        return v2456.get(v2455);
      }
      var v2457 = v2451.apply(this, v2454);
      v2453.cache = v2456.set(v2455, v2457) || v2456;
      return v2457;
    }
    v2453.cache = new (v2450.Cache || v2448)();
    return v2453;
  }
  v2450.Cache = v2448;
  memoize_1 = v2450;
  return memoize_1;
}
var _memoizeCapped;
var hasRequired_memoizeCapped;
function require_memoizeCapped() {
  if (hasRequired_memoizeCapped) {
    return _memoizeCapped;
  }
  hasRequired_memoizeCapped = 1;
  var v2458 = requireMemoize();
  var v2459 = 500;
  function v2460(v2461) {
    var v2462 = v2458(v2461, function (v2463) {
      if (v2464.size === v2459) {
        v2464.clear();
      }
      return v2463;
    });
    var v2464 = v2462.cache;
    return v2462;
  }
  _memoizeCapped = v2460;
  return _memoizeCapped;
}
var _stringToPath;
var hasRequired_stringToPath;
function require_stringToPath() {
  if (hasRequired_stringToPath) {
    return _stringToPath;
  }
  hasRequired_stringToPath = 1;
  var v2465 = require_memoizeCapped();
  var v2466 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var v2467 = /\\(\\)?/g;
  var v2468 = v2465(function (v2469) {
    var v2470 = [];
    if (v2469.charCodeAt(0) === 46) {
      v2470.push("");
    }
    v2469.replace(v2466, function (v2471, v2472, v2473, v2474) {
      v2470.push(v2473 ? v2474.replace(v2467, "$1") : v2472 || v2471);
    });
    return v2470;
  });
  _stringToPath = v2468;
  return _stringToPath;
}
var _arrayMap;
var hasRequired_arrayMap;
function require_arrayMap() {
  if (hasRequired_arrayMap) {
    return _arrayMap;
  }
  hasRequired_arrayMap = 1;
  function v2475(v2476, v2477) {
    var v2478 = -1;
    var v2479 = v2476 == null ? 0 : v2476.length;
    var v2480 = Array(v2479);
    while (++v2478 < v2479) {
      v2480[v2478] = v2477(v2476[v2478], v2478, v2476);
    }
    return v2480;
  }
  _arrayMap = v2475;
  return _arrayMap;
}
var _baseToString;
var hasRequired_baseToString;
function require_baseToString() {
  if (hasRequired_baseToString) {
    return _baseToString;
  }
  hasRequired_baseToString = 1;
  var v2481 = require_Symbol();
  var v2482 = require_arrayMap();
  var v2483 = requireIsArray();
  var v2484 = requireIsSymbol();
  var v2485 = v2481 ? v2481.prototype : undefined;
  var v2486 = v2485 ? v2485.toString : undefined;
  function v2487(v2488) {
    if (typeof v2488 == "string") {
      return v2488;
    }
    if (v2483(v2488)) {
      return v2482(v2488, v2487) + "";
    }
    if (v2484(v2488)) {
      if (v2486) {
        return v2486.call(v2488);
      } else {
        return "";
      }
    }
    var v2489 = v2488 + "";
    if (v2489 == "0" && 1 / v2488 == -Infinity) {
      return "-0";
    } else {
      return v2489;
    }
  }
  _baseToString = v2487;
  return _baseToString;
}
var toString_1;
var hasRequiredToString;
function requireToString() {
  if (hasRequiredToString) {
    return toString_1;
  }
  hasRequiredToString = 1;
  var v2490 = require_baseToString();
  function v2491(v2492) {
    if (v2492 == null) {
      return "";
    } else {
      return v2490(v2492);
    }
  }
  toString_1 = v2491;
  return toString_1;
}
var _castPath;
var hasRequired_castPath;
function require_castPath() {
  if (hasRequired_castPath) {
    return _castPath;
  }
  hasRequired_castPath = 1;
  var v2493 = requireIsArray();
  var v2494 = require_isKey();
  var v2495 = require_stringToPath();
  var v2496 = requireToString();
  function v2497(v2498, v2499) {
    if (v2493(v2498)) {
      return v2498;
    }
    if (v2494(v2498, v2499)) {
      return [v2498];
    } else {
      return v2495(v2496(v2498));
    }
  }
  _castPath = v2497;
  return _castPath;
}
var _toKey;
var hasRequired_toKey;
function require_toKey() {
  if (hasRequired_toKey) {
    return _toKey;
  }
  hasRequired_toKey = 1;
  var v2500 = requireIsSymbol();
  function v2501(v2502) {
    if (typeof v2502 == "string" || v2500(v2502)) {
      return v2502;
    }
    var v2503 = v2502 + "";
    if (v2503 == "0" && 1 / v2502 == -Infinity) {
      return "-0";
    } else {
      return v2503;
    }
  }
  _toKey = v2501;
  return _toKey;
}
var _baseGet;
var hasRequired_baseGet;
function require_baseGet() {
  if (hasRequired_baseGet) {
    return _baseGet;
  }
  hasRequired_baseGet = 1;
  var v2504 = require_castPath();
  var v2505 = require_toKey();
  function v2506(v2507, v2508) {
    v2508 = v2504(v2508, v2507);
    var v2509 = 0;
    var v2510 = v2508.length;
    while (v2507 != null && v2509 < v2510) {
      v2507 = v2507[v2505(v2508[v2509++])];
    }
    if (v2509 && v2509 == v2510) {
      return v2507;
    } else {
      return undefined;
    }
  }
  _baseGet = v2506;
  return _baseGet;
}
var get_1;
var hasRequiredGet;
function requireGet() {
  if (hasRequiredGet) {
    return get_1;
  }
  hasRequiredGet = 1;
  var v2511 = require_baseGet();
  function v2512(v2513, v2514, v2515) {
    var v2516 = v2513 == null ? undefined : v2511(v2513, v2514);
    if (v2516 === undefined) {
      return v2515;
    } else {
      return v2516;
    }
  }
  get_1 = v2512;
  return get_1;
}
var getExports = requireGet();
var get = getDefaultExportFromCjs(getExports);
var _defineProperty;
var hasRequired_defineProperty;
function require_defineProperty() {
  if (hasRequired_defineProperty) {
    return _defineProperty;
  }
  hasRequired_defineProperty = 1;
  var v2517 = require_getNative();
  var v2518 = function () {
    try {
      var v2519 = v2517(Object, "defineProperty");
      v2519({}, "", {});
      return v2519;
    } catch (v2520) {}
  }();
  _defineProperty = v2518;
  return _defineProperty;
}
var _baseAssignValue;
var hasRequired_baseAssignValue;
function require_baseAssignValue() {
  if (hasRequired_baseAssignValue) {
    return _baseAssignValue;
  }
  hasRequired_baseAssignValue = 1;
  var v2521 = require_defineProperty();
  function v2522(v2523, v2524, v2525) {
    if (v2524 == "__proto__" && v2521) {
      v2521(v2523, v2524, {
        configurable: true,
        enumerable: true,
        value: v2525,
        writable: true
      });
    } else {
      v2523[v2524] = v2525;
    }
  }
  _baseAssignValue = v2522;
  return _baseAssignValue;
}
var _assignValue;
var hasRequired_assignValue;
function require_assignValue() {
  if (hasRequired_assignValue) {
    return _assignValue;
  }
  hasRequired_assignValue = 1;
  var v2526 = require_baseAssignValue();
  var v2527 = requireEq();
  var v2528 = Object.prototype;
  var v2529 = v2528.hasOwnProperty;
  function v2530(v2531, v2532, v2533) {
    var v2534 = v2531[v2532];
    if (!v2529.call(v2531, v2532) || !v2527(v2534, v2533) || v2533 === undefined && !(v2532 in v2531)) {
      v2526(v2531, v2532, v2533);
    }
  }
  _assignValue = v2530;
  return _assignValue;
}
var _isIndex;
var hasRequired_isIndex;
function require_isIndex() {
  if (hasRequired_isIndex) {
    return _isIndex;
  }
  hasRequired_isIndex = 1;
  var v2535 = 9007199254740991;
  var v2536 = /^(?:0|[1-9]\d*)$/;
  function v2537(v2538, v2539) {
    var v2540 = typeof v2538;
    v2539 = v2539 == null ? v2535 : v2539;
    return !!v2539 && (v2540 == "number" || v2540 != "symbol" && v2536.test(v2538)) && v2538 > -1 && v2538 % 1 == 0 && v2538 < v2539;
  }
  _isIndex = v2537;
  return _isIndex;
}
var _baseSet;
var hasRequired_baseSet;
function require_baseSet() {
  if (hasRequired_baseSet) {
    return _baseSet;
  }
  hasRequired_baseSet = 1;
  var v2541 = require_assignValue();
  var v2542 = require_castPath();
  var v2543 = require_isIndex();
  var v2544 = requireIsObject();
  var v2545 = require_toKey();
  function v2546(v2547, v2548, v2549, v2550) {
    if (!v2544(v2547)) {
      return v2547;
    }
    v2548 = v2542(v2548, v2547);
    var v2551 = -1;
    var v2552 = v2548.length;
    var v2553 = v2552 - 1;
    var v2554 = v2547;
    while (v2554 != null && ++v2551 < v2552) {
      var v2555 = v2545(v2548[v2551]);
      var v2556 = v2549;
      if (v2555 === "__proto__" || v2555 === "constructor" || v2555 === "prototype") {
        return v2547;
      }
      if (v2551 != v2553) {
        var v2557 = v2554[v2555];
        v2556 = v2550 ? v2550(v2557, v2555, v2554) : undefined;
        if (v2556 === undefined) {
          v2556 = v2544(v2557) ? v2557 : v2543(v2548[v2551 + 1]) ? [] : {};
        }
      }
      v2541(v2554, v2555, v2556);
      v2554 = v2554[v2555];
    }
    return v2547;
  }
  _baseSet = v2546;
  return _baseSet;
}
var set_1;
var hasRequiredSet;
function requireSet() {
  if (hasRequiredSet) {
    return set_1;
  }
  hasRequiredSet = 1;
  var v2558 = require_baseSet();
  function v2559(v2560, v2561, v2562) {
    if (v2560 == null) {
      return v2560;
    } else {
      return v2558(v2560, v2561, v2562);
    }
  }
  set_1 = v2559;
  return set_1;
}
var setExports = requireSet();
var set = getDefaultExportFromCjs(setExports);
var _copyArray;
var hasRequired_copyArray;
function require_copyArray() {
  if (hasRequired_copyArray) {
    return _copyArray;
  }
  hasRequired_copyArray = 1;
  function v2563(v2564, v2565) {
    var v2566 = -1;
    var v2567 = v2564.length;
    v2565 ||= Array(v2567);
    while (++v2566 < v2567) {
      v2565[v2566] = v2564[v2566];
    }
    return v2565;
  }
  _copyArray = v2563;
  return _copyArray;
}
var toPath_1;
var hasRequiredToPath;
function requireToPath() {
  if (hasRequiredToPath) {
    return toPath_1;
  }
  hasRequiredToPath = 1;
  var v2568 = require_arrayMap();
  var v2569 = require_copyArray();
  var v2570 = requireIsArray();
  var v2571 = requireIsSymbol();
  var v2572 = require_stringToPath();
  var v2573 = require_toKey();
  var v2574 = requireToString();
  function v2575(v2576) {
    if (v2570(v2576)) {
      return v2568(v2576, v2573);
    }
    if (v2571(v2576)) {
      return [v2576];
    } else {
      return v2569(v2572(v2574(v2576)));
    }
  }
  toPath_1 = v2575;
  return toPath_1;
}
var toPathExports = requireToPath();
var toPath = getDefaultExportFromCjs(toPathExports);
var define$2 = {
  data: function data(v2577) {
    var v2578 = {
      field: "data",
      bindingEvent: "data",
      allowBinding: false,
      allowSetting: false,
      allowGetting: false,
      settingEvent: "data",
      settingTriggersEvent: false,
      triggerFnName: "trigger",
      immutableKeys: {},
      updateStyle: false,
      beforeGet: function v2579(v2580) {},
      beforeSet: function v2581(v2582, v2583) {},
      onSet: function v2584(v2585) {},
      canSet: function v2586(v2587) {
        return true;
      }
    };
    v2577 = extend({}, v2578, v2577);
    return function v2588(v2589, v2590) {
      var v2591 = v2577;
      var v2592 = this;
      var v2593 = v2592.length !== undefined;
      var v2594 = v2593 ? v2592 : [v2592];
      var v2595 = v2593 ? v2592[0] : v2592;
      if (string(v2589)) {
        var v2596 = v2589.indexOf(".") !== -1;
        var v2597 = v2596 && toPath(v2589);
        if (v2591.allowGetting && v2590 === undefined) {
          var v2598;
          if (v2595) {
            v2591.beforeGet(v2595);
            if (v2597 && v2595._private[v2591.field][v2589] === undefined) {
              v2598 = get(v2595._private[v2591.field], v2597);
            } else {
              v2598 = v2595._private[v2591.field][v2589];
            }
          }
          return v2598;
        } else if (v2591.allowSetting && v2590 !== undefined) {
          var v2599 = !v2591.immutableKeys[v2589];
          if (v2599) {
            var v2600 = _defineProperty$1({}, v2589, v2590);
            v2591.beforeSet(v2592, v2600);
            for (var v2601 = 0, v2602 = v2594.length; v2601 < v2602; v2601++) {
              var v2603 = v2594[v2601];
              if (v2591.canSet(v2603)) {
                if (v2597 && v2595._private[v2591.field][v2589] === undefined) {
                  set(v2603._private[v2591.field], v2597, v2590);
                } else {
                  v2603._private[v2591.field][v2589] = v2590;
                }
              }
            }
            if (v2591.updateStyle) {
              v2592.updateStyle();
            }
            v2591.onSet(v2592);
            if (v2591.settingTriggersEvent) {
              v2592[v2591.triggerFnName](v2591.settingEvent);
            }
          }
        }
      } else if (v2591.allowSetting && plainObject(v2589)) {
        var v2604 = v2589;
        var v2605;
        var v2606;
        var v2607 = Object.keys(v2604);
        v2591.beforeSet(v2592, v2604);
        for (var v2608 = 0; v2608 < v2607.length; v2608++) {
          v2605 = v2607[v2608];
          v2606 = v2604[v2605];
          var v2609 = !v2591.immutableKeys[v2605];
          if (v2609) {
            for (var v2610 = 0; v2610 < v2594.length; v2610++) {
              var v2611 = v2594[v2610];
              if (v2591.canSet(v2611)) {
                v2611._private[v2591.field][v2605] = v2606;
              }
            }
          }
        }
        if (v2591.updateStyle) {
          v2592.updateStyle();
        }
        v2591.onSet(v2592);
        if (v2591.settingTriggersEvent) {
          v2592[v2591.triggerFnName](v2591.settingEvent);
        }
      } else if (v2591.allowBinding && fn$6(v2589)) {
        var v2612 = v2589;
        v2592.on(v2591.bindingEvent, v2612);
      } else if (v2591.allowGetting && v2589 === undefined) {
        var v2613;
        if (v2595) {
          v2591.beforeGet(v2595);
          v2613 = v2595._private[v2591.field];
        }
        return v2613;
      }
      return v2592;
    };
  },
  removeData: function removeData(v2614) {
    var v2615 = {
      field: "data",
      event: "data",
      triggerFnName: "trigger",
      triggerEvent: false,
      immutableKeys: {}
    };
    v2614 = extend({}, v2615, v2614);
    return function v2616(v2617) {
      var v2618 = v2614;
      var v2619 = this;
      var v2620 = v2619.length !== undefined;
      var v2621 = v2620 ? v2619 : [v2619];
      if (string(v2617)) {
        var v2622 = v2617.split(/\s+/);
        var v2623 = v2622.length;
        for (var v2624 = 0; v2624 < v2623; v2624++) {
          var v2625 = v2622[v2624];
          if (emptyString(v2625)) {
            continue;
          }
          var v2626 = !v2618.immutableKeys[v2625];
          if (v2626) {
            for (var v2627 = 0, v2628 = v2621.length; v2627 < v2628; v2627++) {
              v2621[v2627]._private[v2618.field][v2625] = undefined;
            }
          }
        }
        if (v2618.triggerEvent) {
          v2619[v2618.triggerFnName](v2618.event);
        }
      } else if (v2617 === undefined) {
        for (var v2629 = 0, v2630 = v2621.length; v2629 < v2630; v2629++) {
          var v2631 = v2621[v2629]._private[v2618.field];
          var v2632 = Object.keys(v2631);
          for (var v2633 = 0; v2633 < v2632.length; v2633++) {
            var v2634 = v2632[v2633];
            var v2635 = !v2618.immutableKeys[v2634];
            if (v2635) {
              v2631[v2634] = undefined;
            }
          }
        }
        if (v2618.triggerEvent) {
          v2619[v2618.triggerFnName](v2618.event);
        }
      }
      return v2619;
    };
  }
};
var define$1 = {
  eventAliasesOn: function eventAliasesOn(v2636) {
    var v2637 = v2636;
    v2637.addListener = v2637.listen = v2637.bind = v2637.on;
    v2637.unlisten = v2637.unbind = v2637.off = v2637.removeListener;
    v2637.trigger = v2637.emit;
    v2637.pon = v2637.promiseOn = function (v2638, v2639) {
      var v2640 = this;
      var v2641 = Array.prototype.slice.call(arguments, 0);
      return new Promise$1(function (v2642, v2643) {
        var v2644 = function v2645(v2646) {
          v2640.off.apply(v2640, v2647);
          v2642(v2646);
        };
        var v2648 = v2641.concat([v2644]);
        var v2647 = v2648.concat([]);
        v2640.on.apply(v2640, v2648);
      });
    };
  }
};
var define = {};
[define$3, define$2, define$1].forEach(function (v2649) {
  extend(define, v2649);
});
var elesfn$i = {
  animate: define.animate(),
  animation: define.animation(),
  animated: define.animated(),
  clearQueue: define.clearQueue(),
  delay: define.delay(),
  delayAnimation: define.delayAnimation(),
  stop: define.stop()
};
var elesfn$h = {
  classes: function classes(v2650) {
    var v2651 = this;
    if (v2650 === undefined) {
      var v2652 = [];
      v2651[0]._private.classes.forEach(function (v2653) {
        return v2652.push(v2653);
      });
      return v2652;
    } else if (!array(v2650)) {
      v2650 = (v2650 || "").match(/\S+/g) || [];
    }
    var v2654 = [];
    var v2655 = new Set$1(v2650);
    for (var v2656 = 0; v2656 < v2651.length; v2656++) {
      var v2657 = v2651[v2656];
      var v2658 = v2657._private;
      var v2659 = v2658.classes;
      var v2660 = false;
      for (var v2661 = 0; v2661 < v2650.length; v2661++) {
        var v2662 = v2650[v2661];
        var v2663 = v2659.has(v2662);
        if (!v2663) {
          v2660 = true;
          break;
        }
      }
      if (!v2660) {
        v2660 = v2659.size !== v2650.length;
      }
      if (v2660) {
        v2658.classes = v2655;
        v2654.push(v2657);
      }
    }
    if (v2654.length > 0) {
      this.spawn(v2654).updateStyle().emit("class");
    }
    return v2651;
  },
  addClass: function addClass(v2664) {
    return this.toggleClass(v2664, true);
  },
  hasClass: function hasClass(v2665) {
    var v2666 = this[0];
    return v2666 != null && v2666._private.classes.has(v2665);
  },
  toggleClass: function toggleClass(v2667, v2668) {
    if (!array(v2667)) {
      v2667 = v2667.match(/\S+/g) || [];
    }
    var v2669 = this;
    var v2670 = v2668 === undefined;
    var v2671 = [];
    for (var v2672 = 0, v2673 = v2669.length; v2672 < v2673; v2672++) {
      var v2674 = v2669[v2672];
      var v2675 = v2674._private.classes;
      var v2676 = false;
      for (var v2677 = 0; v2677 < v2667.length; v2677++) {
        var v2678 = v2667[v2677];
        var v2679 = v2675.has(v2678);
        var v2680 = false;
        if (v2668 || v2670 && !v2679) {
          v2675.add(v2678);
          v2680 = true;
        } else if (!v2668 || v2670 && v2679) {
          v2675.delete(v2678);
          v2680 = true;
        }
        if (!v2676 && v2680) {
          v2671.push(v2674);
          v2676 = true;
        }
      }
    }
    if (v2671.length > 0) {
      this.spawn(v2671).updateStyle().emit("class");
    }
    return v2669;
  },
  removeClass: function removeClass(v2681) {
    return this.toggleClass(v2681, false);
  },
  flashClass: function flashClass(v2682, v2683) {
    var v2684 = this;
    if (v2683 == null) {
      v2683 = 250;
    } else if (v2683 === 0) {
      return v2684;
    }
    v2684.addClass(v2682);
    setTimeout(function () {
      v2684.removeClass(v2682);
    }, v2683);
    return v2684;
  }
};
elesfn$h.className = elesfn$h.classNames = elesfn$h.classes;
var tokens = {
  metaChar: "[\\!\\\"\\#\\$\\%\\&\\'\\(\\)\\*\\+\\,\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\]\\^\\`\\{\\|\\}\\~]",
  comparatorOp: "=|\\!=|>|>=|<|<=|\\$=|\\^=|\\*=",
  boolOp: "\\?|\\!|\\^",
  string: "\"(?:\\\\\"|[^\"])*\"|'(?:\\\\'|[^'])*'",
  number: number2,
  meta: "degree|indegree|outdegree",
  separator: "\\s*,\\s*",
  descendant: "\\s+",
  child: "\\s+>\\s+",
  subject: "\\$",
  group: "node|edge|\\*",
  directedEdge: "\\s+->\\s+",
  undirectedEdge: "\\s+<->\\s+"
};
tokens.variable = "(?:[\\w-.]|(?:\\\\" + tokens.metaChar + "))+";
tokens.className = "(?:[\\w-]|(?:\\\\" + tokens.metaChar + "))+";
tokens.value = tokens.string + "|" + tokens.number;
tokens.id = tokens.variable;
(function () {
  var v2685;
  var v2686;
  var v2687;
  v2685 = tokens.comparatorOp.split("|");
  for (v2687 = 0; v2687 < v2685.length; v2687++) {
    v2686 = v2685[v2687];
    tokens.comparatorOp += "|@" + v2686;
  }
  v2685 = tokens.comparatorOp.split("|");
  for (v2687 = 0; v2687 < v2685.length; v2687++) {
    v2686 = v2685[v2687];
    if (v2686.indexOf("!") >= 0) {
      continue;
    }
    if (v2686 === "=") {
      continue;
    }
    tokens.comparatorOp += "|\\!" + v2686;
  }
})();
var newQuery = function newQuery2() {
  return {
    checks: []
  };
};
var Type = {
  GROUP: 0,
  COLLECTION: 1,
  FILTER: 2,
  DATA_COMPARE: 3,
  DATA_EXIST: 4,
  DATA_BOOL: 5,
  META_COMPARE: 6,
  STATE: 7,
  ID: 8,
  CLASS: 9,
  UNDIRECTED_EDGE: 10,
  DIRECTED_EDGE: 11,
  NODE_SOURCE: 12,
  NODE_TARGET: 13,
  NODE_NEIGHBOR: 14,
  CHILD: 15,
  DESCENDANT: 16,
  PARENT: 17,
  ANCESTOR: 18,
  COMPOUND_SPLIT: 19,
  TRUE: 20
};
var stateSelectors = [{
  selector: ":selected",
  matches: function matches(v2688) {
    return v2688.selected();
  }
}, {
  selector: ":unselected",
  matches: function matches2(v2689) {
    return !v2689.selected();
  }
}, {
  selector: ":selectable",
  matches: function matches3(v2690) {
    return v2690.selectable();
  }
}, {
  selector: ":unselectable",
  matches: function matches4(v2691) {
    return !v2691.selectable();
  }
}, {
  selector: ":locked",
  matches: function matches5(v2692) {
    return v2692.locked();
  }
}, {
  selector: ":unlocked",
  matches: function matches6(v2693) {
    return !v2693.locked();
  }
}, {
  selector: ":visible",
  matches: function matches7(v2694) {
    return v2694.visible();
  }
}, {
  selector: ":hidden",
  matches: function matches8(v2695) {
    return !v2695.visible();
  }
}, {
  selector: ":transparent",
  matches: function matches9(v2696) {
    return v2696.transparent();
  }
}, {
  selector: ":grabbed",
  matches: function matches10(v2697) {
    return v2697.grabbed();
  }
}, {
  selector: ":free",
  matches: function matches11(v2698) {
    return !v2698.grabbed();
  }
}, {
  selector: ":removed",
  matches: function matches12(v2699) {
    return v2699.removed();
  }
}, {
  selector: ":inside",
  matches: function matches13(v2700) {
    return !v2700.removed();
  }
}, {
  selector: ":grabbable",
  matches: function matches14(v2701) {
    return v2701.grabbable();
  }
}, {
  selector: ":ungrabbable",
  matches: function matches15(v2702) {
    return !v2702.grabbable();
  }
}, {
  selector: ":animated",
  matches: function matches16(v2703) {
    return v2703.animated();
  }
}, {
  selector: ":unanimated",
  matches: function matches17(v2704) {
    return !v2704.animated();
  }
}, {
  selector: ":parent",
  matches: function matches18(v2705) {
    return v2705.isParent();
  }
}, {
  selector: ":childless",
  matches: function matches19(v2706) {
    return v2706.isChildless();
  }
}, {
  selector: ":child",
  matches: function matches20(v2707) {
    return v2707.isChild();
  }
}, {
  selector: ":orphan",
  matches: function matches21(v2708) {
    return v2708.isOrphan();
  }
}, {
  selector: ":nonorphan",
  matches: function matches22(v2709) {
    return v2709.isChild();
  }
}, {
  selector: ":compound",
  matches: function matches23(v2710) {
    if (v2710.isNode()) {
      return v2710.isParent();
    } else {
      return v2710.source().isParent() || v2710.target().isParent();
    }
  }
}, {
  selector: ":loop",
  matches: function matches24(v2711) {
    return v2711.isLoop();
  }
}, {
  selector: ":simple",
  matches: function matches25(v2712) {
    return v2712.isSimple();
  }
}, {
  selector: ":active",
  matches: function matches26(v2713) {
    return v2713.active();
  }
}, {
  selector: ":inactive",
  matches: function matches27(v2714) {
    return !v2714.active();
  }
}, {
  selector: ":backgrounding",
  matches: function matches28(v2715) {
    return v2715.backgrounding();
  }
}, {
  selector: ":nonbackgrounding",
  matches: function matches29(v2716) {
    return !v2716.backgrounding();
  }
}].sort(function (v2717, v2718) {
  return descending(v2717.selector, v2718.selector);
});
var lookup = function () {
  var v2719 = {};
  var v2720;
  for (var v2721 = 0; v2721 < stateSelectors.length; v2721++) {
    v2720 = stateSelectors[v2721];
    v2719[v2720.selector] = v2720.matches;
  }
  return v2719;
}();
var stateSelectorMatches = function stateSelectorMatches2(v2722, v2723) {
  return lookup[v2722](v2723);
};
var stateSelectorRegex = "(" + stateSelectors.map(function (v2724) {
  return v2724.selector;
}).join("|") + ")";
var cleanMetaChars = function cleanMetaChars2(v2725) {
  return v2725.replace(new RegExp("\\\\(" + tokens.metaChar + ")", "g"), function (v2726, v2727) {
    return v2727;
  });
};
var replaceLastQuery = function replaceLastQuery2(v2728, v2729, v2730) {
  v2728[v2728.length - 1] = v2730;
};
var exprs = [{
  name: "group",
  query: true,
  regex: "(" + tokens.group + ")",
  populate: function populate(v2731, v2732, v2733) {
    var v2734 = _slicedToArray(v2733, 1);
    var v2735 = v2734[0];
    v2732.checks.push({
      type: Type.GROUP,
      value: v2735 === "*" ? v2735 : v2735 + "s"
    });
  }
}, {
  name: "state",
  query: true,
  regex: stateSelectorRegex,
  populate: function populate2(v2736, v2737, v2738) {
    var v2739 = _slicedToArray(v2738, 1);
    var v2740 = v2739[0];
    v2737.checks.push({
      type: Type.STATE,
      value: v2740
    });
  }
}, {
  name: "id",
  query: true,
  regex: "\\#(" + tokens.id + ")",
  populate: function populate3(v2741, v2742, v2743) {
    var v2744 = _slicedToArray(v2743, 1);
    var v2745 = v2744[0];
    v2742.checks.push({
      type: Type.ID,
      value: cleanMetaChars(v2745)
    });
  }
}, {
  name: "className",
  query: true,
  regex: "\\.(" + tokens.className + ")",
  populate: function populate4(v2746, v2747, v2748) {
    var v2749 = _slicedToArray(v2748, 1);
    var v2750 = v2749[0];
    v2747.checks.push({
      type: Type.CLASS,
      value: cleanMetaChars(v2750)
    });
  }
}, {
  name: "dataExists",
  query: true,
  regex: "\\[\\s*(" + tokens.variable + ")\\s*\\]",
  populate: function populate5(v2751, v2752, v2753) {
    var v2754 = _slicedToArray(v2753, 1);
    var v2755 = v2754[0];
    v2752.checks.push({
      type: Type.DATA_EXIST,
      field: cleanMetaChars(v2755)
    });
  }
}, {
  name: "dataCompare",
  query: true,
  regex: "\\[\\s*(" + tokens.variable + ")\\s*(" + tokens.comparatorOp + ")\\s*(" + tokens.value + ")\\s*\\]",
  populate: function populate6(v2756, v2757, v2758) {
    var v2759 = _slicedToArray(v2758, 3);
    var v2760 = v2759[0];
    var v2761 = v2759[1];
    var v2762 = v2759[2];
    var v2763 = new RegExp("^" + tokens.string + "$").exec(v2762) != null;
    if (v2763) {
      v2762 = v2762.substring(1, v2762.length - 1);
    } else {
      v2762 = parseFloat(v2762);
    }
    v2757.checks.push({
      type: Type.DATA_COMPARE,
      field: cleanMetaChars(v2760),
      operator: v2761,
      value: v2762
    });
  }
}, {
  name: "dataBool",
  query: true,
  regex: "\\[\\s*(" + tokens.boolOp + ")\\s*(" + tokens.variable + ")\\s*\\]",
  populate: function populate7(v2764, v2765, v2766) {
    var v2767 = _slicedToArray(v2766, 2);
    var v2768 = v2767[0];
    var v2769 = v2767[1];
    v2765.checks.push({
      type: Type.DATA_BOOL,
      field: cleanMetaChars(v2769),
      operator: v2768
    });
  }
}, {
  name: "metaCompare",
  query: true,
  regex: "\\[\\[\\s*(" + tokens.meta + ")\\s*(" + tokens.comparatorOp + ")\\s*(" + tokens.number + ")\\s*\\]\\]",
  populate: function populate8(v2770, v2771, v2772) {
    var v2773 = _slicedToArray(v2772, 3);
    var v2774 = v2773[0];
    var v2775 = v2773[1];
    var v2776 = v2773[2];
    v2771.checks.push({
      type: Type.META_COMPARE,
      field: cleanMetaChars(v2774),
      operator: v2775,
      value: parseFloat(v2776)
    });
  }
}, {
  name: "nextQuery",
  separator: true,
  regex: tokens.separator,
  populate: function populate9(v2777, v2778) {
    var v2779 = v2777.currentSubject;
    var v2780 = v2777.edgeCount;
    var v2781 = v2777.compoundCount;
    var v2782 = v2777[v2777.length - 1];
    if (v2779 != null) {
      v2782.subject = v2779;
      v2777.currentSubject = null;
    }
    v2782.edgeCount = v2780;
    v2782.compoundCount = v2781;
    v2777.edgeCount = 0;
    v2777.compoundCount = 0;
    var v2783 = v2777[v2777.length++] = newQuery();
    return v2783;
  }
}, {
  name: "directedEdge",
  separator: true,
  regex: tokens.directedEdge,
  populate: function populate10(v2784, v2785) {
    if (v2784.currentSubject == null) {
      var v2786 = newQuery();
      var v2787 = v2785;
      var v2788 = newQuery();
      v2786.checks.push({
        type: Type.DIRECTED_EDGE,
        source: v2787,
        target: v2788
      });
      replaceLastQuery(v2784, v2785, v2786);
      v2784.edgeCount++;
      return v2788;
    } else {
      var v2789 = newQuery();
      var v2790 = v2785;
      var v2791 = newQuery();
      v2789.checks.push({
        type: Type.NODE_SOURCE,
        source: v2790,
        target: v2791
      });
      replaceLastQuery(v2784, v2785, v2789);
      v2784.edgeCount++;
      return v2791;
    }
  }
}, {
  name: "undirectedEdge",
  separator: true,
  regex: tokens.undirectedEdge,
  populate: function populate11(v2792, v2793) {
    if (v2792.currentSubject == null) {
      var v2794 = newQuery();
      var v2795 = v2793;
      var v2796 = newQuery();
      v2794.checks.push({
        type: Type.UNDIRECTED_EDGE,
        nodes: [v2795, v2796]
      });
      replaceLastQuery(v2792, v2793, v2794);
      v2792.edgeCount++;
      return v2796;
    } else {
      var v2797 = newQuery();
      var v2798 = v2793;
      var v2799 = newQuery();
      v2797.checks.push({
        type: Type.NODE_NEIGHBOR,
        node: v2798,
        neighbor: v2799
      });
      replaceLastQuery(v2792, v2793, v2797);
      return v2799;
    }
  }
}, {
  name: "child",
  separator: true,
  regex: tokens.child,
  populate: function populate12(v2800, v2801) {
    if (v2800.currentSubject == null) {
      var v2802 = newQuery();
      var v2803 = newQuery();
      var v2804 = v2800[v2800.length - 1];
      v2802.checks.push({
        type: Type.CHILD,
        parent: v2804,
        child: v2803
      });
      replaceLastQuery(v2800, v2801, v2802);
      v2800.compoundCount++;
      return v2803;
    } else if (v2800.currentSubject === v2801) {
      var v2805 = newQuery();
      var v2806 = v2800[v2800.length - 1];
      var v2807 = newQuery();
      var v2808 = newQuery();
      var v2809 = newQuery();
      var v2810 = newQuery();
      v2805.checks.push({
        type: Type.COMPOUND_SPLIT,
        left: v2806,
        right: v2807,
        subject: v2808
      });
      v2808.checks = v2801.checks;
      v2801.checks = [{
        type: Type.TRUE
      }];
      v2810.checks.push({
        type: Type.TRUE
      });
      v2807.checks.push({
        type: Type.PARENT,
        parent: v2810,
        child: v2809
      });
      replaceLastQuery(v2800, v2806, v2805);
      v2800.currentSubject = v2808;
      v2800.compoundCount++;
      return v2809;
    } else {
      var v2811 = newQuery();
      var v2812 = newQuery();
      var v2813 = [{
        type: Type.PARENT,
        parent: v2811,
        child: v2812
      }];
      v2811.checks = v2801.checks;
      v2801.checks = v2813;
      v2800.compoundCount++;
      return v2812;
    }
  }
}, {
  name: "descendant",
  separator: true,
  regex: tokens.descendant,
  populate: function populate13(v2814, v2815) {
    if (v2814.currentSubject == null) {
      var v2816 = newQuery();
      var v2817 = newQuery();
      var v2818 = v2814[v2814.length - 1];
      v2816.checks.push({
        type: Type.DESCENDANT,
        ancestor: v2818,
        descendant: v2817
      });
      replaceLastQuery(v2814, v2815, v2816);
      v2814.compoundCount++;
      return v2817;
    } else if (v2814.currentSubject === v2815) {
      var v2819 = newQuery();
      var v2820 = v2814[v2814.length - 1];
      var v2821 = newQuery();
      var v2822 = newQuery();
      var v2823 = newQuery();
      var v2824 = newQuery();
      v2819.checks.push({
        type: Type.COMPOUND_SPLIT,
        left: v2820,
        right: v2821,
        subject: v2822
      });
      v2822.checks = v2815.checks;
      v2815.checks = [{
        type: Type.TRUE
      }];
      v2824.checks.push({
        type: Type.TRUE
      });
      v2821.checks.push({
        type: Type.ANCESTOR,
        ancestor: v2824,
        descendant: v2823
      });
      replaceLastQuery(v2814, v2820, v2819);
      v2814.currentSubject = v2822;
      v2814.compoundCount++;
      return v2823;
    } else {
      var v2825 = newQuery();
      var v2826 = newQuery();
      var v2827 = [{
        type: Type.ANCESTOR,
        ancestor: v2825,
        descendant: v2826
      }];
      v2825.checks = v2815.checks;
      v2815.checks = v2827;
      v2814.compoundCount++;
      return v2826;
    }
  }
}, {
  name: "subject",
  modifier: true,
  regex: tokens.subject,
  populate: function populate14(v2828, v2829) {
    if (v2828.currentSubject != null && v2828.currentSubject !== v2829) {
      warn("Redefinition of subject in selector `" + v2828.toString() + "`");
      return false;
    }
    v2828.currentSubject = v2829;
    var v2830 = v2828[v2828.length - 1];
    var v2831 = v2830.checks[0];
    var v2832 = v2831 == null ? null : v2831.type;
    if (v2832 === Type.DIRECTED_EDGE) {
      v2831.type = Type.NODE_TARGET;
    } else if (v2832 === Type.UNDIRECTED_EDGE) {
      v2831.type = Type.NODE_NEIGHBOR;
      v2831.node = v2831.nodes[1];
      v2831.neighbor = v2831.nodes[0];
      v2831.nodes = null;
    }
  }
}];
exprs.forEach(function (v2833) {
  return v2833.regexObj = new RegExp("^" + v2833.regex);
});
var consumeExpr = function consumeExpr2(v2834) {
  var v2835;
  var v2836;
  var v2837;
  for (var v2838 = 0; v2838 < exprs.length; v2838++) {
    var v2839 = exprs[v2838];
    var v2840 = v2839.name;
    var v2841 = v2834.match(v2839.regexObj);
    if (v2841 != null) {
      v2836 = v2841;
      v2835 = v2839;
      v2837 = v2840;
      var v2842 = v2841[0];
      v2834 = v2834.substring(v2842.length);
      break;
    }
  }
  return {
    expr: v2835,
    match: v2836,
    name: v2837,
    remaining: v2834
  };
};
var consumeWhitespace = function consumeWhitespace2(v2843) {
  var v2844 = v2843.match(/^\s+/);
  if (v2844) {
    var v2845 = v2844[0];
    v2843 = v2843.substring(v2845.length);
  }
  return v2843;
};
var parse = function parse2(v2846) {
  var v2847 = this;
  var v2848 = v2847.inputText = v2846;
  var v2849 = v2847[0] = newQuery();
  v2847.length = 1;
  v2848 = consumeWhitespace(v2848);
  while (true) {
    var v2850 = consumeExpr(v2848);
    if (v2850.expr == null) {
      warn("The selector `" + v2846 + "`is invalid");
      return false;
    } else {
      var v2851 = v2850.match.slice(1);
      var v2852 = v2850.expr.populate(v2847, v2849, v2851);
      if (v2852 === false) {
        return false;
      } else if (v2852 != null) {
        v2849 = v2852;
      }
    }
    v2848 = v2850.remaining;
    if (v2848.match(/^\s*$/)) {
      break;
    }
  }
  var v2853 = v2847[v2847.length - 1];
  if (v2847.currentSubject != null) {
    v2853.subject = v2847.currentSubject;
  }
  v2853.edgeCount = v2847.edgeCount;
  v2853.compoundCount = v2847.compoundCount;
  for (var v2854 = 0; v2854 < v2847.length; v2854++) {
    var v2855 = v2847[v2854];
    if (v2855.compoundCount > 0 && v2855.edgeCount > 0) {
      warn("The selector `" + v2846 + "` is invalid because it uses both a compound selector and an edge selector");
      return false;
    }
    if (v2855.edgeCount > 1) {
      warn("The selector `" + v2846 + "` is invalid because it uses multiple edge selectors");
      return false;
    } else if (v2855.edgeCount === 1) {
      warn("The selector `" + v2846 + "` is deprecated.  Edge selectors do not take effect on changes to source and target nodes after an edge is added, for performance reasons.  Use a class or data selector on edges instead, updating the class or data of an edge when your app detects a change in source or target nodes.");
    }
  }
  return true;
};
var toString = function toString2() {
  if (this.toStringCache != null) {
    return this.toStringCache;
  }
  var v2856 = function v2857(v2858) {
    if (v2858 == null) {
      return "";
    } else {
      return v2858;
    }
  };
  var v2859 = function v2860(v2861) {
    if (string(v2861)) {
      return "\"" + v2861 + "\"";
    } else {
      return v2856(v2861);
    }
  };
  var v2862 = function v2863(v2864) {
    return " " + v2864 + " ";
  };
  var v2865 = function v2866(v2867, v2868) {
    var v2869 = v2867.type;
    var v2870 = v2867.value;
    switch (v2869) {
      case Type.GROUP:
        {
          var v2871 = v2856(v2870);
          return v2871.substring(0, v2871.length - 1);
        }
      case Type.DATA_COMPARE:
        {
          var v2872 = v2867.field;
          var v2873 = v2867.operator;
          return "[" + v2872 + v2862(v2856(v2873)) + v2859(v2870) + "]";
        }
      case Type.DATA_BOOL:
        {
          var v2874 = v2867.operator;
          var v2875 = v2867.field;
          return "[" + v2856(v2874) + v2875 + "]";
        }
      case Type.DATA_EXIST:
        {
          var v2876 = v2867.field;
          return "[" + v2876 + "]";
        }
      case Type.META_COMPARE:
        {
          var v2877 = v2867.operator;
          var v2878 = v2867.field;
          return "[[" + v2878 + v2862(v2856(v2877)) + v2859(v2870) + "]]";
        }
      case Type.STATE:
        {
          return v2870;
        }
      case Type.ID:
        {
          return "#" + v2870;
        }
      case Type.CLASS:
        {
          return "." + v2870;
        }
      case Type.PARENT:
      case Type.CHILD:
        {
          return v2879(v2867.parent, v2868) + v2862(">") + v2879(v2867.child, v2868);
        }
      case Type.ANCESTOR:
      case Type.DESCENDANT:
        {
          return v2879(v2867.ancestor, v2868) + " " + v2879(v2867.descendant, v2868);
        }
      case Type.COMPOUND_SPLIT:
        {
          var v2880 = v2879(v2867.left, v2868);
          var v2881 = v2879(v2867.subject, v2868);
          var v2882 = v2879(v2867.right, v2868);
          return v2880 + (v2880.length > 0 ? " " : "") + v2881 + v2882;
        }
      case Type.TRUE:
        {
          return "";
        }
    }
  };
  var v2879 = function v2883(v2884, v2885) {
    return v2884.checks.reduce(function (v2886, v2887, v2888) {
      return v2886 + (v2885 === v2884 && v2888 === 0 ? "$" : "") + v2865(v2887, v2885);
    }, "");
  };
  var v2889 = "";
  for (var v2890 = 0; v2890 < this.length; v2890++) {
    var v2891 = this[v2890];
    v2889 += v2879(v2891, v2891.subject);
    if (this.length > 1 && v2890 < this.length - 1) {
      v2889 += ", ";
    }
  }
  this.toStringCache = v2889;
  return v2889;
};
var parse$1 = {
  parse: parse,
  toString: toString
};
var valCmp = function valCmp2(v2892, v2893, v2894) {
  var v2895;
  var v2896 = string(v2892);
  var v2897 = number$1(v2892);
  var v2898 = string(v2894);
  var v2899;
  var v2900;
  var v2901 = false;
  var v2902 = false;
  var v2903 = false;
  if (v2893.indexOf("!") >= 0) {
    v2893 = v2893.replace("!", "");
    v2902 = true;
  }
  if (v2893.indexOf("@") >= 0) {
    v2893 = v2893.replace("@", "");
    v2901 = true;
  }
  if (v2896 || v2898 || v2901) {
    v2899 = !v2896 && !v2897 ? "" : "" + v2892;
    v2900 = "" + v2894;
  }
  if (v2901) {
    v2892 = v2899 = v2899.toLowerCase();
    v2894 = v2900 = v2900.toLowerCase();
  }
  switch (v2893) {
    case "*=":
      v2895 = v2899.indexOf(v2900) >= 0;
      break;
    case "$=":
      v2895 = v2899.indexOf(v2900, v2899.length - v2900.length) >= 0;
      break;
    case "^=":
      v2895 = v2899.indexOf(v2900) === 0;
      break;
    case "=":
      v2895 = v2892 === v2894;
      break;
    case ">":
      v2903 = true;
      v2895 = v2892 > v2894;
      break;
    case ">=":
      v2903 = true;
      v2895 = v2892 >= v2894;
      break;
    case "<":
      v2903 = true;
      v2895 = v2892 < v2894;
      break;
    case "<=":
      v2903 = true;
      v2895 = v2892 <= v2894;
      break;
    default:
      v2895 = false;
      break;
  }
  if (v2902 && (v2892 != null || !v2903)) {
    v2895 = !v2895;
  }
  return v2895;
};
var boolCmp = function boolCmp2(v2904, v2905) {
  switch (v2905) {
    case "?":
      if (v2904) {
        return true;
      } else {
        return false;
      }
    case "!":
      if (v2904) {
        return false;
      } else {
        return true;
      }
    case "^":
      return v2904 === undefined;
  }
};
var existCmp = function existCmp2(v2906) {
  return v2906 !== undefined;
};
var data$1 = function data2(v2907, v2908) {
  return v2907.data(v2908);
};
var meta = function meta2(v2909, v2910) {
  return v2909[v2910]();
};
var match = [];
var matches$1 = function matches30(v2911, v2912) {
  return v2911.checks.every(function (v2913) {
    return match[v2913.type](v2913, v2912);
  });
};
match[Type.GROUP] = function (v2914, v2915) {
  var v2916 = v2914.value;
  return v2916 === "*" || v2916 === v2915.group();
};
match[Type.STATE] = function (v2917, v2918) {
  var v2919 = v2917.value;
  return stateSelectorMatches(v2919, v2918);
};
match[Type.ID] = function (v2920, v2921) {
  var v2922 = v2920.value;
  return v2921.id() === v2922;
};
match[Type.CLASS] = function (v2923, v2924) {
  var v2925 = v2923.value;
  return v2924.hasClass(v2925);
};
match[Type.META_COMPARE] = function (v2926, v2927) {
  var v2928 = v2926.field;
  var v2929 = v2926.operator;
  var v2930 = v2926.value;
  return valCmp(meta(v2927, v2928), v2929, v2930);
};
match[Type.DATA_COMPARE] = function (v2931, v2932) {
  var v2933 = v2931.field;
  var v2934 = v2931.operator;
  var v2935 = v2931.value;
  return valCmp(data$1(v2932, v2933), v2934, v2935);
};
match[Type.DATA_BOOL] = function (v2936, v2937) {
  var v2938 = v2936.field;
  var v2939 = v2936.operator;
  return boolCmp(data$1(v2937, v2938), v2939);
};
match[Type.DATA_EXIST] = function (v2940, v2941) {
  var v2942 = v2940.field;
  v2940.operator;
  return existCmp(data$1(v2941, v2942));
};
match[Type.UNDIRECTED_EDGE] = function (v2943, v2944) {
  var v2945 = v2943.nodes[0];
  var v2946 = v2943.nodes[1];
  var v2947 = v2944.source();
  var v2948 = v2944.target();
  return matches$1(v2945, v2947) && matches$1(v2946, v2948) || matches$1(v2946, v2947) && matches$1(v2945, v2948);
};
match[Type.NODE_NEIGHBOR] = function (v2949, v2950) {
  return matches$1(v2949.node, v2950) && v2950.neighborhood().some(function (v2951) {
    return v2951.isNode() && matches$1(v2949.neighbor, v2951);
  });
};
match[Type.DIRECTED_EDGE] = function (v2952, v2953) {
  return matches$1(v2952.source, v2953.source()) && matches$1(v2952.target, v2953.target());
};
match[Type.NODE_SOURCE] = function (v2954, v2955) {
  return matches$1(v2954.source, v2955) && v2955.outgoers().some(function (v2956) {
    return v2956.isNode() && matches$1(v2954.target, v2956);
  });
};
match[Type.NODE_TARGET] = function (v2957, v2958) {
  return matches$1(v2957.target, v2958) && v2958.incomers().some(function (v2959) {
    return v2959.isNode() && matches$1(v2957.source, v2959);
  });
};
match[Type.CHILD] = function (v2960, v2961) {
  return matches$1(v2960.child, v2961) && matches$1(v2960.parent, v2961.parent());
};
match[Type.PARENT] = function (v2962, v2963) {
  return matches$1(v2962.parent, v2963) && v2963.children().some(function (v2964) {
    return matches$1(v2962.child, v2964);
  });
};
match[Type.DESCENDANT] = function (v2965, v2966) {
  return matches$1(v2965.descendant, v2966) && v2966.ancestors().some(function (v2967) {
    return matches$1(v2965.ancestor, v2967);
  });
};
match[Type.ANCESTOR] = function (v2968, v2969) {
  return matches$1(v2968.ancestor, v2969) && v2969.descendants().some(function (v2970) {
    return matches$1(v2968.descendant, v2970);
  });
};
match[Type.COMPOUND_SPLIT] = function (v2971, v2972) {
  return matches$1(v2971.subject, v2972) && matches$1(v2971.left, v2972) && matches$1(v2971.right, v2972);
};
match[Type.TRUE] = function () {
  return true;
};
match[Type.COLLECTION] = function (v2973, v2974) {
  var v2975 = v2973.value;
  return v2975.has(v2974);
};
match[Type.FILTER] = function (v2976, v2977) {
  var v2978 = v2976.value;
  return v2978(v2977);
};
var filter = function filter2(v2979) {
  var v2980 = this;
  if (v2980.length === 1 && v2980[0].checks.length === 1 && v2980[0].checks[0].type === Type.ID) {
    return v2979.getElementById(v2980[0].checks[0].value).collection();
  }
  var v2981 = function v2982(v2983) {
    for (var v2984 = 0; v2984 < v2980.length; v2984++) {
      var v2985 = v2980[v2984];
      if (matches$1(v2985, v2983)) {
        return true;
      }
    }
    return false;
  };
  if (v2980.text() == null) {
    v2981 = function v2986() {
      return true;
    };
  }
  return v2979.filter(v2981);
};
var matches31 = function matches32(v2987) {
  var v2988 = this;
  for (var v2989 = 0; v2989 < v2988.length; v2989++) {
    var v2990 = v2988[v2989];
    if (matches$1(v2990, v2987)) {
      return true;
    }
  }
  return false;
};
var matching = {
  matches: matches31,
  filter: filter
};
var Selector = function Selector2(v2991) {
  this.inputText = v2991;
  this.currentSubject = null;
  this.compoundCount = 0;
  this.edgeCount = 0;
  this.length = 0;
  if (v2991 == null || string(v2991) && v2991.match(/^\s*$/)) ;else if (elementOrCollection(v2991)) {
    this.addQuery({
      checks: [{
        type: Type.COLLECTION,
        value: v2991.collection()
      }]
    });
  } else if (fn$6(v2991)) {
    this.addQuery({
      checks: [{
        type: Type.FILTER,
        value: v2991
      }]
    });
  } else if (string(v2991)) {
    if (!this.parse(v2991)) {
      this.invalid = true;
    }
  } else {
    error("A selector must be created from a string; found ");
  }
};
var selfn = Selector.prototype;
[parse$1, matching].forEach(function (v2992) {
  return extend(selfn, v2992);
});
selfn.text = function () {
  return this.inputText;
};
selfn.size = function () {
  return this.length;
};
selfn.eq = function (v2993) {
  return this[v2993];
};
selfn.sameText = function (v2994) {
  return !this.invalid && !v2994.invalid && this.text() === v2994.text();
};
selfn.addQuery = function (v2995) {
  this[this.length++] = v2995;
};
selfn.selector = selfn.toString;
var elesfn$g = {
  allAre: function allAre(v2996) {
    var v2997 = new Selector(v2996);
    return this.every(function (v2998) {
      return v2997.matches(v2998);
    });
  },
  is: function is(v2999) {
    var v3000 = new Selector(v2999);
    return this.some(function (v3001) {
      return v3000.matches(v3001);
    });
  },
  some: function some(v3002, v3003) {
    for (var v3004 = 0; v3004 < this.length; v3004++) {
      var v3005 = !v3003 ? v3002(this[v3004], v3004, this) : v3002.apply(v3003, [this[v3004], v3004, this]);
      if (v3005) {
        return true;
      }
    }
    return false;
  },
  every: function every(v3006, v3007) {
    for (var v3008 = 0; v3008 < this.length; v3008++) {
      var v3009 = !v3007 ? v3006(this[v3008], v3008, this) : v3006.apply(v3007, [this[v3008], v3008, this]);
      if (!v3009) {
        return false;
      }
    }
    return true;
  },
  same: function same(v3010) {
    if (this === v3010) {
      return true;
    }
    v3010 = this.cy().collection(v3010);
    var v3011 = this.length;
    var v3012 = v3010.length;
    if (v3011 !== v3012) {
      return false;
    }
    if (v3011 === 1) {
      return this[0] === v3010[0];
    }
    return this.every(function (v3013) {
      return v3010.hasElementWithId(v3013.id());
    });
  },
  anySame: function anySame(v3014) {
    v3014 = this.cy().collection(v3014);
    return this.some(function (v3015) {
      return v3014.hasElementWithId(v3015.id());
    });
  },
  allAreNeighbors: function allAreNeighbors(v3016) {
    v3016 = this.cy().collection(v3016);
    var v3017 = this.neighborhood();
    return v3016.every(function (v3018) {
      return v3017.hasElementWithId(v3018.id());
    });
  },
  contains: function contains(v3019) {
    v3019 = this.cy().collection(v3019);
    var v3020 = this;
    return v3019.every(function (v3021) {
      return v3020.hasElementWithId(v3021.id());
    });
  }
};
elesfn$g.allAreNeighbours = elesfn$g.allAreNeighbors;
elesfn$g.has = elesfn$g.contains;
elesfn$g.equal = elesfn$g.equals = elesfn$g.same;
var cache = function cache2(v3022, v3023) {
  return function v3024(v3025, v3026, v3027, v3028) {
    var v3029 = v3025;
    var v3030 = this;
    var v3031;
    if (v3029 == null) {
      v3031 = "";
    } else if (elementOrCollection(v3029) && v3029.length === 1) {
      v3031 = v3029.id();
    }
    if (v3030.length === 1 && v3031) {
      var v3032 = v3030[0]._private;
      var v3033 = v3032.traversalCache = v3032.traversalCache || {};
      var v3034 = v3033[v3023] = v3033[v3023] || [];
      var v3035 = hashString(v3031);
      var v3036 = v3034[v3035];
      if (v3036) {
        return v3036;
      } else {
        return v3034[v3035] = v3022.call(v3030, v3025, v3026, v3027, v3028);
      }
    } else {
      return v3022.call(v3030, v3025, v3026, v3027, v3028);
    }
  };
};
var elesfn$f = {
  parent: function parent(v3037) {
    var v3038 = [];
    if (this.length === 1) {
      var v3039 = this[0]._private.parent;
      if (v3039) {
        return v3039;
      }
    }
    for (var v3040 = 0; v3040 < this.length; v3040++) {
      var v3041 = this[v3040];
      var v3042 = v3041._private.parent;
      if (v3042) {
        v3038.push(v3042);
      }
    }
    return this.spawn(v3038, true).filter(v3037);
  },
  parents: function parents(v3043) {
    var v3044 = [];
    var v3045 = this.parent();
    while (v3045.nonempty()) {
      for (var v3046 = 0; v3046 < v3045.length; v3046++) {
        var v3047 = v3045[v3046];
        v3044.push(v3047);
      }
      v3045 = v3045.parent();
    }
    return this.spawn(v3044, true).filter(v3043);
  },
  commonAncestors: function commonAncestors(v3048) {
    var v3049;
    for (var v3050 = 0; v3050 < this.length; v3050++) {
      var v3051 = this[v3050];
      var v3052 = v3051.parents();
      v3049 = v3049 || v3052;
      v3049 = v3049.intersect(v3052);
    }
    return v3049.filter(v3048);
  },
  orphans: function orphans(v3053) {
    return this.stdFilter(function (v3054) {
      return v3054.isOrphan();
    }).filter(v3053);
  },
  nonorphans: function nonorphans(v3055) {
    return this.stdFilter(function (v3056) {
      return v3056.isChild();
    }).filter(v3055);
  },
  children: cache(function (v3057) {
    var v3058 = [];
    for (var v3059 = 0; v3059 < this.length; v3059++) {
      var v3060 = this[v3059];
      var v3061 = v3060._private.children;
      for (var v3062 = 0; v3062 < v3061.length; v3062++) {
        v3058.push(v3061[v3062]);
      }
    }
    return this.spawn(v3058, true).filter(v3057);
  }, "children"),
  siblings: function siblings(v3063) {
    return this.parent().children().not(this).filter(v3063);
  },
  isParent: function isParent() {
    var v3064 = this[0];
    if (v3064) {
      return v3064.isNode() && v3064._private.children.length !== 0;
    }
  },
  isChildless: function isChildless() {
    var v3065 = this[0];
    if (v3065) {
      return v3065.isNode() && v3065._private.children.length === 0;
    }
  },
  isChild: function isChild() {
    var v3066 = this[0];
    if (v3066) {
      return v3066.isNode() && v3066._private.parent != null;
    }
  },
  isOrphan: function isOrphan() {
    var v3067 = this[0];
    if (v3067) {
      return v3067.isNode() && v3067._private.parent == null;
    }
  },
  descendants: function descendants(v3068) {
    var v3069 = [];
    function v3070(v3071) {
      for (var v3072 = 0; v3072 < v3071.length; v3072++) {
        var v3073 = v3071[v3072];
        v3069.push(v3073);
        if (v3073.children().nonempty()) {
          v3070(v3073.children());
        }
      }
    }
    v3070(this.children());
    return this.spawn(v3069, true).filter(v3068);
  }
};
function forEachCompound(v3074, v3075, v3076, v3077) {
  var v3078 = [];
  var v3079 = new Set$1();
  var v3080 = v3074.cy();
  var v3081 = v3080.hasCompoundNodes();
  for (var v3082 = 0; v3082 < v3074.length; v3082++) {
    var v3083 = v3074[v3082];
    if (v3076) {
      v3078.push(v3083);
    } else if (v3081) {
      v3077(v3078, v3079, v3083);
    }
  }
  while (v3078.length > 0) {
    var v3084 = v3078.shift();
    v3075(v3084);
    v3079.add(v3084.id());
    if (v3081) {
      v3077(v3078, v3079, v3084);
    }
  }
  return v3074;
}
function addChildren(v3085, v3086, v3087) {
  if (v3087.isParent()) {
    var v3088 = v3087._private.children;
    for (var v3089 = 0; v3089 < v3088.length; v3089++) {
      var v3090 = v3088[v3089];
      if (!v3086.has(v3090.id())) {
        v3085.push(v3090);
      }
    }
  }
}
elesfn$f.forEachDown = function (v3091, v3092 = true) {
  return forEachCompound(this, v3091, v3092, addChildren);
};
function addParent(v3093, v3094, v3095) {
  if (v3095.isChild()) {
    var v3096 = v3095._private.parent;
    if (!v3094.has(v3096.id())) {
      v3093.push(v3096);
    }
  }
}
elesfn$f.forEachUp = function (v3097, v3098 = true) {
  return forEachCompound(this, v3097, v3098, addParent);
};
function addParentAndChildren(v3099, v3100, v3101) {
  addParent(v3099, v3100, v3101);
  addChildren(v3099, v3100, v3101);
}
elesfn$f.forEachUpAndDown = function (v3102, v3103 = true) {
  return forEachCompound(this, v3102, v3103, addParentAndChildren);
};
elesfn$f.ancestors = elesfn$f.parents;
var fn$5;
var elesfn$e;
fn$5 = elesfn$e = {
  data: define.data({
    field: "data",
    bindingEvent: "data",
    allowBinding: true,
    allowSetting: true,
    settingEvent: "data",
    settingTriggersEvent: true,
    triggerFnName: "trigger",
    allowGetting: true,
    immutableKeys: {
      id: true,
      source: true,
      target: true,
      parent: true
    },
    updateStyle: true
  }),
  removeData: define.removeData({
    field: "data",
    event: "data",
    triggerFnName: "trigger",
    triggerEvent: true,
    immutableKeys: {
      id: true,
      source: true,
      target: true,
      parent: true
    },
    updateStyle: true
  }),
  scratch: define.data({
    field: "scratch",
    bindingEvent: "scratch",
    allowBinding: true,
    allowSetting: true,
    settingEvent: "scratch",
    settingTriggersEvent: true,
    triggerFnName: "trigger",
    allowGetting: true,
    updateStyle: true
  }),
  removeScratch: define.removeData({
    field: "scratch",
    event: "scratch",
    triggerFnName: "trigger",
    triggerEvent: true,
    updateStyle: true
  }),
  rscratch: define.data({
    field: "rscratch",
    allowBinding: false,
    allowSetting: true,
    settingTriggersEvent: false,
    allowGetting: true
  }),
  removeRscratch: define.removeData({
    field: "rscratch",
    triggerEvent: false
  }),
  id: function id() {
    var v3104 = this[0];
    if (v3104) {
      return v3104._private.data.id;
    }
  }
};
fn$5.attr = fn$5.data;
fn$5.removeAttr = fn$5.removeData;
var data3 = elesfn$e;
var elesfn$d = {};
function defineDegreeFunction(v3105) {
  return function (v3106) {
    var v3107 = this;
    if (v3106 === undefined) {
      v3106 = true;
    }
    if (v3107.length === 0) {
      return;
    }
    if (v3107.isNode() && !v3107.removed()) {
      var v3108 = 0;
      var v3109 = v3107[0];
      var v3110 = v3109._private.edges;
      for (var v3111 = 0; v3111 < v3110.length; v3111++) {
        var v3112 = v3110[v3111];
        if (!v3106 && v3112.isLoop()) {
          continue;
        }
        v3108 += v3105(v3109, v3112);
      }
      return v3108;
    } else {
      return;
    }
  };
}
extend(elesfn$d, {
  degree: defineDegreeFunction(function (v3113, v3114) {
    if (v3114.source().same(v3114.target())) {
      return 2;
    } else {
      return 1;
    }
  }),
  indegree: defineDegreeFunction(function (v3115, v3116) {
    if (v3116.target().same(v3115)) {
      return 1;
    } else {
      return 0;
    }
  }),
  outdegree: defineDegreeFunction(function (v3117, v3118) {
    if (v3118.source().same(v3117)) {
      return 1;
    } else {
      return 0;
    }
  })
});
function defineDegreeBoundsFunction(v3119, v3120) {
  return function (v3121) {
    var v3122;
    var v3123 = this.nodes();
    for (var v3124 = 0; v3124 < v3123.length; v3124++) {
      var v3125 = v3123[v3124];
      var v3126 = v3125[v3119](v3121);
      if (v3126 !== undefined && (v3122 === undefined || v3120(v3126, v3122))) {
        v3122 = v3126;
      }
    }
    return v3122;
  };
}
extend(elesfn$d, {
  minDegree: defineDegreeBoundsFunction("degree", function (v3127, v3128) {
    return v3127 < v3128;
  }),
  maxDegree: defineDegreeBoundsFunction("degree", function (v3129, v3130) {
    return v3129 > v3130;
  }),
  minIndegree: defineDegreeBoundsFunction("indegree", function (v3131, v3132) {
    return v3131 < v3132;
  }),
  maxIndegree: defineDegreeBoundsFunction("indegree", function (v3133, v3134) {
    return v3133 > v3134;
  }),
  minOutdegree: defineDegreeBoundsFunction("outdegree", function (v3135, v3136) {
    return v3135 < v3136;
  }),
  maxOutdegree: defineDegreeBoundsFunction("outdegree", function (v3137, v3138) {
    return v3137 > v3138;
  })
});
extend(elesfn$d, {
  totalDegree: function totalDegree(v3139) {
    var v3140 = 0;
    var v3141 = this.nodes();
    for (var v3142 = 0; v3142 < v3141.length; v3142++) {
      v3140 += v3141[v3142].degree(v3139);
    }
    return v3140;
  }
});
var fn$4;
var elesfn$c;
var beforePositionSet = function beforePositionSet2(v3143, v3144, v3145) {
  for (var v3146 = 0; v3146 < v3143.length; v3146++) {
    var v3147 = v3143[v3146];
    if (!v3147.locked()) {
      var v3148 = v3147._private.position;
      var v3149 = {
        x: v3144.x != null ? v3144.x - v3148.x : 0,
        y: v3144.y != null ? v3144.y - v3148.y : 0
      };
      if (v3147.isParent() && (v3149.x !== 0 || v3149.y !== 0)) {
        v3147.children().shift(v3149, v3145);
      }
      v3147.dirtyBoundingBoxCache();
    }
  }
};
var positionDef = {
  field: "position",
  bindingEvent: "position",
  allowBinding: true,
  allowSetting: true,
  settingEvent: "position",
  settingTriggersEvent: true,
  triggerFnName: "emitAndNotify",
  allowGetting: true,
  validKeys: ["x", "y"],
  beforeGet: function beforeGet(v3150) {
    v3150.updateCompoundBounds();
  },
  beforeSet: function beforeSet(v3151, v3152) {
    beforePositionSet(v3151, v3152, false);
  },
  onSet: function onSet(v3153) {
    v3153.dirtyCompoundBoundsCache();
  },
  canSet: function canSet(v3154) {
    return !v3154.locked();
  }
};
fn$4 = elesfn$c = {
  position: define.data(positionDef),
  silentPosition: define.data(extend({}, positionDef, {
    allowBinding: false,
    allowSetting: true,
    settingTriggersEvent: false,
    allowGetting: false,
    beforeSet: function beforeSet2(v3155, v3156) {
      beforePositionSet(v3155, v3156, true);
    },
    onSet: function onSet2(v3157) {
      v3157.dirtyCompoundBoundsCache();
    }
  })),
  positions: function positions(v3158, v3159) {
    if (plainObject(v3158)) {
      if (v3159) {
        this.silentPosition(v3158);
      } else {
        this.position(v3158);
      }
    } else if (fn$6(v3158)) {
      var v3160 = v3158;
      var v3161 = this.cy();
      v3161.startBatch();
      for (var v3162 = 0; v3162 < this.length; v3162++) {
        var v3163 = this[v3162];
        var v3164 = undefined;
        if (v3164 = v3160(v3163, v3162)) {
          if (v3159) {
            v3163.silentPosition(v3164);
          } else {
            v3163.position(v3164);
          }
        }
      }
      v3161.endBatch();
    }
    return this;
  },
  silentPositions: function silentPositions(v3165) {
    return this.positions(v3165, true);
  },
  shift: function shift(v3166, v3167, v3168) {
    var v3169;
    if (plainObject(v3166)) {
      v3169 = {
        x: number$1(v3166.x) ? v3166.x : 0,
        y: number$1(v3166.y) ? v3166.y : 0
      };
      v3168 = v3167;
    } else if (string(v3166) && number$1(v3167)) {
      v3169 = {
        x: 0,
        y: 0
      };
      v3169[v3166] = v3167;
    }
    if (v3169 != null) {
      var v3170 = this.cy();
      v3170.startBatch();
      for (var v3171 = 0; v3171 < this.length; v3171++) {
        var v3172 = this[v3171];
        if (v3170.hasCompoundNodes() && v3172.isChild() && v3172.ancestors().anySame(this)) {
          continue;
        }
        var v3173 = v3172.position();
        var v3174 = {
          x: v3173.x + v3169.x,
          y: v3173.y + v3169.y
        };
        if (v3168) {
          v3172.silentPosition(v3174);
        } else {
          v3172.position(v3174);
        }
      }
      v3170.endBatch();
    }
    return this;
  },
  silentShift: function silentShift(v3175, v3176) {
    if (plainObject(v3175)) {
      this.shift(v3175, true);
    } else if (string(v3175) && number$1(v3176)) {
      this.shift(v3175, v3176, true);
    }
    return this;
  },
  renderedPosition: function renderedPosition(v3177, v3178) {
    var v3179 = this[0];
    var v3180 = this.cy();
    var v3181 = v3180.zoom();
    var v3182 = v3180.pan();
    var v3183 = plainObject(v3177) ? v3177 : undefined;
    var v3184 = v3183 !== undefined || v3178 !== undefined && string(v3177);
    if (v3179 && v3179.isNode()) {
      if (v3184) {
        for (var v3185 = 0; v3185 < this.length; v3185++) {
          var v3186 = this[v3185];
          if (v3178 !== undefined) {
            v3186.position(v3177, (v3178 - v3182[v3177]) / v3181);
          } else if (v3183 !== undefined) {
            v3186.position(renderedToModelPosition(v3183, v3181, v3182));
          }
        }
      } else {
        var v3187 = v3179.position();
        v3183 = modelToRenderedPosition$1(v3187, v3181, v3182);
        if (v3177 === undefined) {
          return v3183;
        } else {
          return v3183[v3177];
        }
      }
    } else if (!v3184) {
      return undefined;
    }
    return this;
  },
  relativePosition: function relativePosition(v3188, v3189) {
    var v3190 = this[0];
    var v3191 = this.cy();
    var v3192 = plainObject(v3188) ? v3188 : undefined;
    var v3193 = v3192 !== undefined || v3189 !== undefined && string(v3188);
    var v3194 = v3191.hasCompoundNodes();
    if (v3190 && v3190.isNode()) {
      if (v3193) {
        for (var v3195 = 0; v3195 < this.length; v3195++) {
          var v3196 = this[v3195];
          var v3197 = v3194 ? v3196.parent() : null;
          var v3198 = v3197 && v3197.length > 0;
          var v3199 = v3198;
          if (v3198) {
            v3197 = v3197[0];
          }
          var v3200 = v3199 ? v3197.position() : {
            x: 0,
            y: 0
          };
          if (v3189 !== undefined) {
            v3196.position(v3188, v3189 + v3200[v3188]);
          } else if (v3192 !== undefined) {
            v3196.position({
              x: v3192.x + v3200.x,
              y: v3192.y + v3200.y
            });
          }
        }
      } else {
        var v3201 = v3190.position();
        var v3202 = v3194 ? v3190.parent() : null;
        var v3203 = v3202 && v3202.length > 0;
        var v3204 = v3203;
        if (v3203) {
          v3202 = v3202[0];
        }
        var v3205 = v3204 ? v3202.position() : {
          x: 0,
          y: 0
        };
        v3192 = {
          x: v3201.x - v3205.x,
          y: v3201.y - v3205.y
        };
        if (v3188 === undefined) {
          return v3192;
        } else {
          return v3192[v3188];
        }
      }
    } else if (!v3193) {
      return undefined;
    }
    return this;
  }
};
fn$4.modelPosition = fn$4.point = fn$4.position;
fn$4.modelPositions = fn$4.points = fn$4.positions;
fn$4.renderedPoint = fn$4.renderedPosition;
fn$4.relativePoint = fn$4.relativePosition;
var position = elesfn$c;
var labelHalign = function labelHalign2(v3206) {
  switch (v3206) {
    case "left":
    case "right-inside":
      return "left";
    case "right":
    case "left-inside":
      return "right";
    default:
      return "center";
  }
};
var labelValign = function labelValign2(v3207) {
  switch (v3207) {
    case "top":
    case "bottom-inside":
      return "top";
    case "bottom":
    case "top-inside":
      return "bottom";
    default:
      return "center";
  }
};
var labelJustification = function labelJustification2(v3208) {
  switch (v3208) {
    case "left":
      return "right";
    case "right":
      return "left";
    case "left-inside":
      return "left";
    case "right-inside":
      return "right";
    default:
      return "center";
  }
};
var fn$3;
var elesfn$b;
fn$3 = elesfn$b = {};
elesfn$b.renderedBoundingBox = function (v3209) {
  var v3210 = this.boundingBox(v3209);
  var v3211 = this.cy();
  var v3212 = v3211.zoom();
  var v3213 = v3211.pan();
  var v3214 = v3210.x1 * v3212 + v3213.x;
  var v3215 = v3210.x2 * v3212 + v3213.x;
  var v3216 = v3210.y1 * v3212 + v3213.y;
  var v3217 = v3210.y2 * v3212 + v3213.y;
  return {
    x1: v3214,
    x2: v3215,
    y1: v3216,
    y2: v3217,
    w: v3215 - v3214,
    h: v3217 - v3216
  };
};
elesfn$b.dirtyCompoundBoundsCache = function (v3218 = false) {
  var v3219 = this.cy();
  if (!v3219.styleEnabled() || !v3219.hasCompoundNodes()) {
    return this;
  }
  this.forEachUp(function (v3220) {
    if (v3220.isParent()) {
      var v3221 = v3220._private;
      v3221.compoundBoundsClean = false;
      v3221.bbCache = null;
      if (!v3218) {
        v3220.emitAndNotify("bounds");
      }
    }
  });
  return this;
};
elesfn$b.updateCompoundBounds = function (v3222 = false) {
  var v3223 = this.cy();
  if (!v3223.styleEnabled() || !v3223.hasCompoundNodes()) {
    return this;
  }
  if (!v3222 && v3223.batching()) {
    return this;
  }
  function v3224(v3225) {
    if (!v3225.isParent()) {
      return;
    }
    var v3226 = v3225._private;
    var v3227 = v3225.children();
    var v3228 = v3225.pstyle("compound-sizing-wrt-labels").value === "include";
    var v3229 = {
      width: {
        val: v3225.pstyle("min-width").pfValue,
        left: v3225.pstyle("min-width-bias-left"),
        right: v3225.pstyle("min-width-bias-right")
      },
      height: {
        val: v3225.pstyle("min-height").pfValue,
        top: v3225.pstyle("min-height-bias-top"),
        bottom: v3225.pstyle("min-height-bias-bottom")
      }
    };
    var v3230 = v3227.boundingBox({
      includeLabels: v3228,
      includeOverlays: false,
      useCache: false
    });
    var v3231 = v3226.position;
    if (v3230.w === 0 || v3230.h === 0) {
      v3230 = {
        w: v3225.pstyle("width").pfValue,
        h: v3225.pstyle("height").pfValue
      };
      v3230.x1 = v3231.x - v3230.w / 2;
      v3230.x2 = v3231.x + v3230.w / 2;
      v3230.y1 = v3231.y - v3230.h / 2;
      v3230.y2 = v3231.y + v3230.h / 2;
    }
    function v3232(v3233, v3234, v3235) {
      var v3236 = 0;
      var v3237 = 0;
      var v3238 = v3234 + v3235;
      if (v3233 > 0 && v3238 > 0) {
        v3236 = v3234 / v3238 * v3233;
        v3237 = v3235 / v3238 * v3233;
      }
      return {
        biasDiff: v3236,
        biasComplementDiff: v3237
      };
    }
    function v3239(v3240, v3241, v3242, v3243) {
      if (v3242.units === "%") {
        switch (v3243) {
          case "width":
            if (v3240 > 0) {
              return v3242.pfValue * v3240;
            } else {
              return 0;
            }
          case "height":
            if (v3241 > 0) {
              return v3242.pfValue * v3241;
            } else {
              return 0;
            }
          case "average":
            if (v3240 > 0 && v3241 > 0) {
              return v3242.pfValue * (v3240 + v3241) / 2;
            } else {
              return 0;
            }
          case "min":
            if (v3240 > 0 && v3241 > 0) {
              if (v3240 > v3241) {
                return v3242.pfValue * v3241;
              } else {
                return v3242.pfValue * v3240;
              }
            } else {
              return 0;
            }
          case "max":
            if (v3240 > 0 && v3241 > 0) {
              if (v3240 > v3241) {
                return v3242.pfValue * v3240;
              } else {
                return v3242.pfValue * v3241;
              }
            } else {
              return 0;
            }
          default:
            return 0;
        }
      } else if (v3242.units === "px") {
        return v3242.pfValue;
      } else {
        return 0;
      }
    }
    var v3244 = v3229.width.left.value;
    if (v3229.width.left.units === "px" && v3229.width.val > 0) {
      v3244 = v3244 * 100 / v3229.width.val;
    }
    var v3245 = v3229.width.right.value;
    if (v3229.width.right.units === "px" && v3229.width.val > 0) {
      v3245 = v3245 * 100 / v3229.width.val;
    }
    var v3246 = v3229.height.top.value;
    if (v3229.height.top.units === "px" && v3229.height.val > 0) {
      v3246 = v3246 * 100 / v3229.height.val;
    }
    var v3247 = v3229.height.bottom.value;
    if (v3229.height.bottom.units === "px" && v3229.height.val > 0) {
      v3247 = v3247 * 100 / v3229.height.val;
    }
    var v3248 = v3232(v3229.width.val - v3230.w, v3244, v3245);
    var v3249 = v3248.biasDiff;
    var v3250 = v3248.biasComplementDiff;
    var v3251 = v3232(v3229.height.val - v3230.h, v3246, v3247);
    var v3252 = v3251.biasDiff;
    var v3253 = v3251.biasComplementDiff;
    v3226.autoPadding = v3239(v3230.w, v3230.h, v3225.pstyle("padding"), v3225.pstyle("padding-relative-to").value);
    v3226.autoWidth = Math.max(v3230.w, v3229.width.val);
    v3231.x = (-v3249 + v3230.x1 + v3230.x2 + v3250) / 2;
    v3226.autoHeight = Math.max(v3230.h, v3229.height.val);
    v3231.y = (-v3252 + v3230.y1 + v3230.y2 + v3253) / 2;
  }
  for (var v3254 = 0; v3254 < this.length; v3254++) {
    var v3255 = this[v3254];
    var v3256 = v3255._private;
    if (!v3256.compoundBoundsClean || v3222) {
      v3224(v3255);
      if (!v3223.batching()) {
        v3256.compoundBoundsClean = true;
      }
    }
  }
  return this;
};
var noninf = function noninf2(v3257) {
  if (v3257 === Infinity || v3257 === -Infinity) {
    return 0;
  }
  return v3257;
};
var updateBounds = function updateBounds2(v3258, v3259, v3260, v3261, v3262) {
  if (v3261 - v3259 === 0 || v3262 - v3260 === 0) {
    return;
  }
  if (v3259 == null || v3260 == null || v3261 == null || v3262 == null) {
    return;
  }
  v3258.x1 = v3259 < v3258.x1 ? v3259 : v3258.x1;
  v3258.x2 = v3261 > v3258.x2 ? v3261 : v3258.x2;
  v3258.y1 = v3260 < v3258.y1 ? v3260 : v3258.y1;
  v3258.y2 = v3262 > v3258.y2 ? v3262 : v3258.y2;
  v3258.w = v3258.x2 - v3258.x1;
  v3258.h = v3258.y2 - v3258.y1;
};
var updateBoundsFromBox = function updateBoundsFromBox2(v3263, v3264) {
  if (v3264 == null) {
    return v3263;
  }
  return updateBounds(v3263, v3264.x1, v3264.y1, v3264.x2, v3264.y2);
};
var prefixedProperty = function prefixedProperty2(v3265, v3266, v3267) {
  return getPrefixedProperty(v3265, v3266, v3267);
};
var updateBoundsFromArrow = function updateBoundsFromArrow2(v3268, v3269, v3270) {
  if (v3269.cy().headless()) {
    return;
  }
  var v3271 = v3269._private;
  var v3272 = v3271.rstyle;
  var v3273 = v3272.arrowWidth / 2;
  var v3274 = v3269.pstyle(v3270 + "-arrow-shape").value;
  var v3275;
  var v3276;
  if (v3274 !== "none") {
    if (v3270 === "source") {
      v3275 = v3272.srcX;
      v3276 = v3272.srcY;
    } else if (v3270 === "target") {
      v3275 = v3272.tgtX;
      v3276 = v3272.tgtY;
    } else {
      v3275 = v3272.midX;
      v3276 = v3272.midY;
    }
    var v3277 = v3271.arrowBounds = v3271.arrowBounds || {};
    var v3278 = v3277[v3270] = v3277[v3270] || {};
    v3278.x1 = v3275 - v3273;
    v3278.y1 = v3276 - v3273;
    v3278.x2 = v3275 + v3273;
    v3278.y2 = v3276 + v3273;
    v3278.w = v3278.x2 - v3278.x1;
    v3278.h = v3278.y2 - v3278.y1;
    expandBoundingBox(v3278, 1);
    updateBounds(v3268, v3278.x1, v3278.y1, v3278.x2, v3278.y2);
  }
};
var updateBoundsFromLabel = function updateBoundsFromLabel2(v3279, v3280, v3281) {
  if (v3280.cy().headless()) {
    return;
  }
  var v3282;
  if (v3281) {
    v3282 = v3281 + "-";
  } else {
    v3282 = "";
  }
  var v3283 = v3280._private;
  var v3284 = v3283.rstyle;
  var v3285 = v3280.pstyle(v3282 + "label").strValue;
  if (v3285) {
    var v3286 = v3280.pstyle("text-halign");
    var v3287 = v3280.pstyle("text-valign");
    var v3288 = prefixedProperty(v3284, "labelWidth", v3281);
    var v3289 = prefixedProperty(v3284, "labelHeight", v3281);
    var v3290 = prefixedProperty(v3284, "labelX", v3281);
    var v3291 = prefixedProperty(v3284, "labelY", v3281);
    var v3292 = v3280.pstyle(v3282 + "text-margin-x").pfValue;
    var v3293 = v3280.pstyle(v3282 + "text-margin-y").pfValue;
    var v3294 = v3280.isEdge();
    var v3295 = v3280.pstyle(v3282 + "text-rotation");
    var v3296 = v3280.pstyle("text-outline-width").pfValue;
    var v3297 = v3280.pstyle("text-border-width").pfValue;
    var v3298 = v3297 / 2;
    var v3299 = v3280.pstyle("text-background-padding").pfValue;
    var v3300 = 2;
    var v3301 = v3289;
    var v3302 = v3288;
    var v3303 = v3302 / 2;
    var v3304 = v3301 / 2;
    var v3305;
    var v3306;
    var v3307;
    var v3308;
    if (v3294) {
      v3305 = v3290 - v3303;
      v3306 = v3290 + v3303;
      v3307 = v3291 - v3304;
      v3308 = v3291 + v3304;
    } else {
      switch (labelHalign(v3286.value)) {
        case "left":
          v3305 = v3290 - v3302;
          v3306 = v3290;
          break;
        case "center":
          v3305 = v3290 - v3303;
          v3306 = v3290 + v3303;
          break;
        case "right":
          v3305 = v3290;
          v3306 = v3290 + v3302;
          break;
      }
      switch (labelValign(v3287.value)) {
        case "top":
          v3307 = v3291 - v3301;
          v3308 = v3291;
          break;
        case "center":
          v3307 = v3291 - v3304;
          v3308 = v3291 + v3304;
          break;
        case "bottom":
          v3307 = v3291;
          v3308 = v3291 + v3301;
          break;
      }
    }
    var v3309 = v3292 - Math.max(v3296, v3298) - v3299 - v3300;
    var v3310 = v3292 + Math.max(v3296, v3298) + v3299 + v3300;
    var v3311 = v3293 - Math.max(v3296, v3298) - v3299 - v3300;
    var v3312 = v3293 + Math.max(v3296, v3298) + v3299 + v3300;
    v3305 += v3309;
    v3306 += v3310;
    v3307 += v3311;
    v3308 += v3312;
    var v3313 = v3281 || "main";
    var v3314 = v3283.labelBounds;
    var v3315 = v3314[v3313] = v3314[v3313] || {};
    v3315.x1 = v3305;
    v3315.y1 = v3307;
    v3315.x2 = v3306;
    v3315.y2 = v3308;
    v3315.w = v3306 - v3305;
    v3315.h = v3308 - v3307;
    v3315.leftPad = v3309;
    v3315.rightPad = v3310;
    v3315.topPad = v3311;
    v3315.botPad = v3312;
    var v3316 = v3294 && v3295.strValue === "autorotate";
    var v3317 = v3295.pfValue != null && v3295.pfValue !== 0;
    if (v3316 || v3317) {
      var v3318 = v3316 ? prefixedProperty(v3283.rstyle, "labelAngle", v3281) : v3295.pfValue;
      var v3319 = Math.cos(v3318);
      var v3320 = Math.sin(v3318);
      var v3321 = (v3305 + v3306) / 2;
      var v3322 = (v3307 + v3308) / 2;
      if (!v3294) {
        switch (labelHalign(v3286.value)) {
          case "left":
            v3321 = v3306;
            break;
          case "right":
            v3321 = v3305;
            break;
        }
        switch (labelValign(v3287.value)) {
          case "top":
            v3322 = v3308;
            break;
          case "bottom":
            v3322 = v3307;
            break;
        }
      }
      var v3323 = function v3324(v3325, v3326) {
        v3325 = v3325 - v3321;
        v3326 = v3326 - v3322;
        return {
          x: v3325 * v3319 - v3326 * v3320 + v3321,
          y: v3325 * v3320 + v3326 * v3319 + v3322
        };
      };
      var v3327 = v3323(v3305, v3307);
      var v3328 = v3323(v3305, v3308);
      var v3329 = v3323(v3306, v3307);
      var v3330 = v3323(v3306, v3308);
      v3305 = Math.min(v3327.x, v3328.x, v3329.x, v3330.x);
      v3306 = Math.max(v3327.x, v3328.x, v3329.x, v3330.x);
      v3307 = Math.min(v3327.y, v3328.y, v3329.y, v3330.y);
      v3308 = Math.max(v3327.y, v3328.y, v3329.y, v3330.y);
    }
    var v3331 = v3313 + "Rot";
    var v3332 = v3314[v3331] = v3314[v3331] || {};
    v3332.x1 = v3305;
    v3332.y1 = v3307;
    v3332.x2 = v3306;
    v3332.y2 = v3308;
    v3332.w = v3306 - v3305;
    v3332.h = v3308 - v3307;
    updateBounds(v3279, v3305, v3307, v3306, v3308);
    updateBounds(v3283.labelBounds.all, v3305, v3307, v3306, v3308);
  }
  return v3279;
};
var updateBoundsFromOutline = function updateBoundsFromOutline2(v3333, v3334) {
  if (v3334.cy().headless()) {
    return;
  }
  var v3335 = v3334.pstyle("outline-opacity").value;
  var v3336 = v3334.pstyle("outline-width").value;
  var v3337 = v3334.pstyle("outline-offset").value;
  var v3338 = v3336 + v3337;
  updateBoundsFromMiter(v3333, v3334, v3335, v3338, "outside", v3338 / 2);
};
var updateBoundsFromMiter = function updateBoundsFromMiter2(v3339, v3340, v3341, v3342, v3343, v3344) {
  if (v3341 === 0 || v3342 <= 0 || v3343 === "inside") {
    return;
  }
  var v3345 = v3340.cy();
  var v3346 = v3345.renderer();
  var v3347 = v3346.nodeShapes[v3346.getNodeShape(v3340)];
  if (!v3347) {
    return;
  }
  var v3348 = v3340.position();
  var v3349 = v3348.x;
  var v3350 = v3348.y;
  var v3351 = v3340.width();
  var v3352 = v3340.height();
  if (v3347.hasMiterBounds) {
    if (v3343 === "center") {
      v3342 /= 2;
    }
    var v3353 = v3347.miterBounds(v3349, v3350, v3351, v3352, v3342);
    updateBoundsFromBox(v3339, v3353);
  } else if (v3344 != null && v3344 > 0) {
    expandBoundingBoxSides(v3339, [v3344, v3344, v3344, v3344]);
  }
};
var updateBoundsFromMiterBorder = function updateBoundsFromMiterBorder2(v3354, v3355) {
  if (v3355.cy().headless()) {
    return;
  }
  var v3356 = v3355.pstyle("border-opacity").value;
  var v3357 = v3355.pstyle("border-width").pfValue;
  var v3358 = v3355.pstyle("border-position").value;
  updateBoundsFromMiter(v3354, v3355, v3356, v3357, v3358);
};
var boundingBoxImpl = function boundingBoxImpl2(v3359, v3360) {
  var v3361 = v3359._private.cy;
  var v3362 = v3361.styleEnabled();
  var v3363 = v3361.headless();
  var v3364 = makeBoundingBox();
  var v3365 = v3359._private;
  var v3366 = v3359.isNode();
  var v3367 = v3359.isEdge();
  var v3368;
  var v3369;
  var v3370;
  var v3371;
  var v3372;
  var v3373;
  var v3374 = v3365.rstyle;
  var v3375 = v3366 && v3362 ? v3359.pstyle("bounds-expansion").pfValue : [0];
  var v3376 = function v3377(v3378) {
    return v3378.pstyle("display").value !== "none";
  };
  var v3379 = !v3362 || v3376(v3359) && (!v3367 || v3376(v3359.source()) && v3376(v3359.target()));
  if (v3379) {
    var v3380 = 0;
    var v3381 = 0;
    if (v3362 && v3360.includeOverlays) {
      v3380 = v3359.pstyle("overlay-opacity").value;
      if (v3380 !== 0) {
        v3381 = v3359.pstyle("overlay-padding").value;
      }
    }
    var v3382 = 0;
    var v3383 = 0;
    if (v3362 && v3360.includeUnderlays) {
      v3382 = v3359.pstyle("underlay-opacity").value;
      if (v3382 !== 0) {
        v3383 = v3359.pstyle("underlay-padding").value;
      }
    }
    var v3384 = Math.max(v3381, v3383);
    var v3385 = 0;
    var v3386 = 0;
    if (v3362) {
      v3385 = v3359.pstyle("width").pfValue;
      v3386 = v3385 / 2;
    }
    if (v3366 && v3360.includeNodes) {
      var v3387 = v3359.position();
      v3372 = v3387.x;
      v3373 = v3387.y;
      var v3388 = v3359.outerWidth();
      var v3389 = v3388 / 2;
      var v3390 = v3359.outerHeight();
      var v3391 = v3390 / 2;
      v3368 = v3372 - v3389;
      v3369 = v3372 + v3389;
      v3370 = v3373 - v3391;
      v3371 = v3373 + v3391;
      updateBounds(v3364, v3368, v3370, v3369, v3371);
      if (v3362) {
        updateBoundsFromOutline(v3364, v3359);
      }
      if (v3362 && v3360.includeOutlines && !v3363) {
        updateBoundsFromOutline(v3364, v3359);
      }
      if (v3362) {
        updateBoundsFromMiterBorder(v3364, v3359);
      }
    } else if (v3367 && v3360.includeEdges) {
      if (v3362 && !v3363) {
        var v3392 = v3359.pstyle("curve-style").strValue;
        v3368 = Math.min(v3374.srcX, v3374.midX, v3374.tgtX);
        v3369 = Math.max(v3374.srcX, v3374.midX, v3374.tgtX);
        v3370 = Math.min(v3374.srcY, v3374.midY, v3374.tgtY);
        v3371 = Math.max(v3374.srcY, v3374.midY, v3374.tgtY);
        v3368 -= v3386;
        v3369 += v3386;
        v3370 -= v3386;
        v3371 += v3386;
        updateBounds(v3364, v3368, v3370, v3369, v3371);
        if (v3392 === "haystack") {
          var v3393 = v3374.haystackPts;
          if (v3393 && v3393.length === 2) {
            v3368 = v3393[0].x;
            v3370 = v3393[0].y;
            v3369 = v3393[1].x;
            v3371 = v3393[1].y;
            if (v3368 > v3369) {
              var v3394 = v3368;
              v3368 = v3369;
              v3369 = v3394;
            }
            if (v3370 > v3371) {
              var v3395 = v3370;
              v3370 = v3371;
              v3371 = v3395;
            }
            updateBounds(v3364, v3368 - v3386, v3370 - v3386, v3369 + v3386, v3371 + v3386);
          }
        } else if (v3392 === "bezier" || v3392 === "unbundled-bezier" || endsWith(v3392, "segments") || endsWith(v3392, "taxi")) {
          var v3396;
          switch (v3392) {
            case "bezier":
            case "unbundled-bezier":
              v3396 = v3374.bezierPts;
              break;
            case "segments":
            case "taxi":
            case "round-segments":
            case "round-taxi":
              v3396 = v3374.linePts;
              break;
          }
          if (v3396 != null) {
            for (var v3397 = 0; v3397 < v3396.length; v3397++) {
              var v3398 = v3396[v3397];
              v3368 = v3398.x - v3386;
              v3369 = v3398.x + v3386;
              v3370 = v3398.y - v3386;
              v3371 = v3398.y + v3386;
              updateBounds(v3364, v3368, v3370, v3369, v3371);
            }
          }
        }
      } else {
        var v3399 = v3359.source();
        var v3400 = v3399.position();
        var v3401 = v3359.target();
        var v3402 = v3401.position();
        v3368 = v3400.x;
        v3369 = v3402.x;
        v3370 = v3400.y;
        v3371 = v3402.y;
        if (v3368 > v3369) {
          var v3403 = v3368;
          v3368 = v3369;
          v3369 = v3403;
        }
        if (v3370 > v3371) {
          var v3404 = v3370;
          v3370 = v3371;
          v3371 = v3404;
        }
        v3368 -= v3386;
        v3369 += v3386;
        v3370 -= v3386;
        v3371 += v3386;
        updateBounds(v3364, v3368, v3370, v3369, v3371);
      }
    }
    if (v3362 && v3360.includeEdges && v3367) {
      updateBoundsFromArrow(v3364, v3359, "mid-source");
      updateBoundsFromArrow(v3364, v3359, "mid-target");
      updateBoundsFromArrow(v3364, v3359, "source");
      updateBoundsFromArrow(v3364, v3359, "target");
    }
    if (v3362) {
      var v3405 = v3359.pstyle("ghost").value === "yes";
      if (v3405) {
        var v3406 = v3359.pstyle("ghost-offset-x").pfValue;
        var v3407 = v3359.pstyle("ghost-offset-y").pfValue;
        updateBounds(v3364, v3364.x1 + v3406, v3364.y1 + v3407, v3364.x2 + v3406, v3364.y2 + v3407);
      }
    }
    var v3408 = v3365.bodyBounds = v3365.bodyBounds || {};
    assignBoundingBox(v3408, v3364);
    expandBoundingBoxSides(v3408, v3375);
    expandBoundingBox(v3408, 1);
    if (v3362) {
      v3368 = v3364.x1;
      v3369 = v3364.x2;
      v3370 = v3364.y1;
      v3371 = v3364.y2;
      updateBounds(v3364, v3368 - v3384, v3370 - v3384, v3369 + v3384, v3371 + v3384);
    }
    var v3409 = v3365.overlayBounds = v3365.overlayBounds || {};
    assignBoundingBox(v3409, v3364);
    expandBoundingBoxSides(v3409, v3375);
    expandBoundingBox(v3409, 1);
    var v3410 = v3365.labelBounds = v3365.labelBounds || {};
    if (v3410.all != null) {
      clearBoundingBox(v3410.all);
    } else {
      v3410.all = makeBoundingBox();
    }
    if (v3362 && v3360.includeLabels) {
      if (v3360.includeMainLabels) {
        updateBoundsFromLabel(v3364, v3359, null);
      }
      if (v3367) {
        if (v3360.includeSourceLabels) {
          updateBoundsFromLabel(v3364, v3359, "source");
        }
        if (v3360.includeTargetLabels) {
          updateBoundsFromLabel(v3364, v3359, "target");
        }
      }
    }
  }
  v3364.x1 = noninf(v3364.x1);
  v3364.y1 = noninf(v3364.y1);
  v3364.x2 = noninf(v3364.x2);
  v3364.y2 = noninf(v3364.y2);
  v3364.w = noninf(v3364.x2 - v3364.x1);
  v3364.h = noninf(v3364.y2 - v3364.y1);
  if (v3364.w > 0 && v3364.h > 0 && v3379) {
    expandBoundingBoxSides(v3364, v3375);
    expandBoundingBox(v3364, 1);
  }
  return v3364;
};
var getKey = function getKey2(v3411) {
  var v3412 = 0;
  var v3413 = function v3414(v3415) {
    return (v3415 ? 1 : 0) << v3412++;
  };
  var v3416 = 0;
  v3416 += v3413(v3411.incudeNodes);
  v3416 += v3413(v3411.includeEdges);
  v3416 += v3413(v3411.includeLabels);
  v3416 += v3413(v3411.includeMainLabels);
  v3416 += v3413(v3411.includeSourceLabels);
  v3416 += v3413(v3411.includeTargetLabels);
  v3416 += v3413(v3411.includeOverlays);
  v3416 += v3413(v3411.includeOutlines);
  return v3416;
};
var getBoundingBoxPosKey = function getBoundingBoxPosKey2(v3417) {
  var v3418 = function v3419(v3420) {
    return Math.round(v3420);
  };
  if (v3417.isEdge()) {
    var v3421 = v3417.source().position();
    var v3422 = v3417.target().position();
    return hashIntsArray([v3418(v3421.x), v3418(v3421.y), v3418(v3422.x), v3418(v3422.y)]);
  } else {
    var v3423 = v3417.position();
    return hashIntsArray([v3418(v3423.x), v3418(v3423.y)]);
  }
};
var cachedBoundingBoxImpl = function cachedBoundingBoxImpl2(v3424, v3425) {
  var v3426 = v3424._private;
  var v3427;
  var v3428 = v3424.isEdge();
  var v3429 = v3425 == null ? defBbOptsKey : getKey(v3425);
  var v3430 = v3429 === defBbOptsKey;
  if (v3426.bbCache == null) {
    v3427 = boundingBoxImpl(v3424, defBbOpts);
    v3426.bbCache = v3427;
    v3426.bbCachePosKey = getBoundingBoxPosKey(v3424);
  } else {
    v3427 = v3426.bbCache;
  }
  if (!v3430) {
    var v3431 = v3424.isNode();
    v3427 = makeBoundingBox();
    if (v3425.includeNodes && v3431 || v3425.includeEdges && !v3431) {
      if (v3425.includeOverlays) {
        updateBoundsFromBox(v3427, v3426.overlayBounds);
      } else {
        updateBoundsFromBox(v3427, v3426.bodyBounds);
      }
    }
    if (v3425.includeLabels) {
      if (v3425.includeMainLabels && (!v3428 || v3425.includeSourceLabels && v3425.includeTargetLabels)) {
        updateBoundsFromBox(v3427, v3426.labelBounds.all);
      } else {
        if (v3425.includeMainLabels) {
          updateBoundsFromBox(v3427, v3426.labelBounds.mainRot);
        }
        if (v3425.includeSourceLabels) {
          updateBoundsFromBox(v3427, v3426.labelBounds.sourceRot);
        }
        if (v3425.includeTargetLabels) {
          updateBoundsFromBox(v3427, v3426.labelBounds.targetRot);
        }
      }
    }
    v3427.w = v3427.x2 - v3427.x1;
    v3427.h = v3427.y2 - v3427.y1;
  }
  return v3427;
};
var defBbOpts = {
  includeNodes: true,
  includeEdges: true,
  includeLabels: true,
  includeMainLabels: true,
  includeSourceLabels: true,
  includeTargetLabels: true,
  includeOverlays: true,
  includeUnderlays: true,
  includeOutlines: true,
  useCache: true
};
var defBbOptsKey = getKey(defBbOpts);
var filledBbOpts = defaults$g(defBbOpts);
elesfn$b.boundingBox = function (v3432) {
  var v3433;
  var v3434 = v3432 === undefined || v3432.useCache === undefined || v3432.useCache === true;
  var v3435 = memoize(function (v3436) {
    var v3437 = v3436._private;
    return v3437.bbCache == null || v3437.styleDirty || v3437.bbCachePosKey !== getBoundingBoxPosKey(v3436);
  }, function (v3438) {
    return v3438.id();
  });
  if (v3434 && this.length === 1 && !v3435(this[0])) {
    if (v3432 === undefined) {
      v3432 = defBbOpts;
    } else {
      v3432 = filledBbOpts(v3432);
    }
    v3433 = cachedBoundingBoxImpl(this[0], v3432);
  } else {
    v3433 = makeBoundingBox();
    v3432 = v3432 || defBbOpts;
    var v3439 = filledBbOpts(v3432);
    var v3440 = this;
    var v3441 = v3440.cy();
    var v3442 = v3441.styleEnabled();
    this.edges().forEach(v3435);
    this.nodes().forEach(v3435);
    if (v3442) {
      this.recalculateRenderedStyle(v3434);
    }
    this.updateCompoundBounds(!v3434);
    for (var v3443 = 0; v3443 < v3440.length; v3443++) {
      var v3444 = v3440[v3443];
      if (v3435(v3444)) {
        v3444.dirtyBoundingBoxCache();
      }
      updateBoundsFromBox(v3433, cachedBoundingBoxImpl(v3444, v3439));
    }
  }
  v3433.x1 = noninf(v3433.x1);
  v3433.y1 = noninf(v3433.y1);
  v3433.x2 = noninf(v3433.x2);
  v3433.y2 = noninf(v3433.y2);
  v3433.w = noninf(v3433.x2 - v3433.x1);
  v3433.h = noninf(v3433.y2 - v3433.y1);
  return v3433;
};
elesfn$b.dirtyBoundingBoxCache = function () {
  for (var v3445 = 0; v3445 < this.length; v3445++) {
    var v3446 = this[v3445]._private;
    v3446.bbCache = null;
    v3446.bbCachePosKey = null;
    v3446.bodyBounds = null;
    v3446.overlayBounds = null;
    v3446.labelBounds.all = null;
    v3446.labelBounds.source = null;
    v3446.labelBounds.target = null;
    v3446.labelBounds.main = null;
    v3446.labelBounds.sourceRot = null;
    v3446.labelBounds.targetRot = null;
    v3446.labelBounds.mainRot = null;
    v3446.arrowBounds.source = null;
    v3446.arrowBounds.target = null;
    v3446.arrowBounds["mid-source"] = null;
    v3446.arrowBounds["mid-target"] = null;
  }
  this.emitAndNotify("bounds");
  return this;
};
elesfn$b.boundingBoxAt = function (v3447) {
  var v3448 = this.nodes();
  var v3449 = this.cy();
  var v3450 = v3449.hasCompoundNodes();
  var v3451 = v3449.collection();
  if (v3450) {
    v3451 = v3448.filter(function (v3452) {
      return v3452.isParent();
    });
    v3448 = v3448.not(v3451);
  }
  if (plainObject(v3447)) {
    var v3453 = v3447;
    v3447 = function v3454() {
      return v3453;
    };
  }
  var v3455 = function v3456(v3457, v3458) {
    return v3457._private.bbAtOldPos = v3447(v3457, v3458);
  };
  var v3459 = function v3460(v3461) {
    return v3461._private.bbAtOldPos;
  };
  v3449.startBatch();
  v3448.forEach(v3455).silentPositions(v3447);
  if (v3450) {
    v3451.dirtyCompoundBoundsCache();
    v3451.dirtyBoundingBoxCache();
    v3451.updateCompoundBounds(true);
  }
  var v3462 = copyBoundingBox(this.boundingBox({
    useCache: false
  }));
  v3448.silentPositions(v3459);
  if (v3450) {
    v3451.dirtyCompoundBoundsCache();
    v3451.dirtyBoundingBoxCache();
    v3451.updateCompoundBounds(true);
  }
  v3449.endBatch();
  return v3462;
};
fn$3.boundingbox = fn$3.bb = fn$3.boundingBox;
fn$3.renderedBoundingbox = fn$3.renderedBoundingBox;
var bounds = elesfn$b;
var fn$2;
var elesfn$a;
fn$2 = elesfn$a = {};
var defineDimFns = function defineDimFns2(v3463) {
  v3463.uppercaseName = capitalize(v3463.name);
  v3463.autoName = "auto" + v3463.uppercaseName;
  v3463.labelName = "label" + v3463.uppercaseName;
  v3463.outerName = "outer" + v3463.uppercaseName;
  v3463.uppercaseOuterName = capitalize(v3463.outerName);
  fn$2[v3463.name] = function v3464() {
    var v3465 = this[0];
    var v3466 = v3465._private;
    var v3467 = v3466.cy;
    var v3468 = v3467._private.styleEnabled;
    if (v3465) {
      if (v3468) {
        if (v3465.isParent()) {
          v3465.updateCompoundBounds();
          return v3466[v3463.autoName] || 0;
        }
        var v3469 = v3465.pstyle(v3463.name);
        switch (v3469.strValue) {
          case "label":
            v3465.recalculateRenderedStyle();
            return v3466.rstyle[v3463.labelName] || 0;
          default:
            return v3469.pfValue;
        }
      } else {
        return 1;
      }
    }
  };
  fn$2["outer" + v3463.uppercaseName] = function v3470() {
    var v3471 = this[0];
    var v3472 = v3471._private;
    var v3473 = v3472.cy;
    var v3474 = v3473._private.styleEnabled;
    if (v3471) {
      if (v3474) {
        var v3475 = v3471[v3463.name]();
        var v3476 = v3471.pstyle("border-position").value;
        var v3477;
        if (v3476 === "center") {
          v3477 = v3471.pstyle("border-width").pfValue;
        } else if (v3476 === "outside") {
          v3477 = v3471.pstyle("border-width").pfValue * 2;
        } else {
          v3477 = 0;
        }
        var v3478 = v3471.padding() * 2;
        return v3475 + v3477 + v3478;
      } else {
        return 1;
      }
    }
  };
  fn$2["rendered" + v3463.uppercaseName] = function v3479() {
    var v3480 = this[0];
    if (v3480) {
      var v3481 = v3480[v3463.name]();
      return v3481 * this.cy().zoom();
    }
  };
  fn$2["rendered" + v3463.uppercaseOuterName] = function v3482() {
    var v3483 = this[0];
    if (v3483) {
      var v3484 = v3483[v3463.outerName]();
      return v3484 * this.cy().zoom();
    }
  };
};
defineDimFns({
  name: "width"
});
defineDimFns({
  name: "height"
});
elesfn$a.padding = function () {
  var v3485 = this[0];
  var v3486 = v3485._private;
  if (v3485.isParent()) {
    v3485.updateCompoundBounds();
    if (v3486.autoPadding !== undefined) {
      return v3486.autoPadding;
    } else {
      return v3485.pstyle("padding").pfValue;
    }
  } else {
    return v3485.pstyle("padding").pfValue;
  }
};
elesfn$a.paddedHeight = function () {
  var v3487 = this[0];
  return v3487.height() + v3487.padding() * 2;
};
elesfn$a.paddedWidth = function () {
  var v3488 = this[0];
  return v3488.width() + v3488.padding() * 2;
};
var widthHeight = elesfn$a;
var ifEdge = function ifEdge2(v3489, v3490) {
  if (v3489.isEdge() && v3489.takesUpSpace()) {
    return v3490(v3489);
  }
};
var ifEdgeRenderedPosition = function ifEdgeRenderedPosition2(v3491, v3492) {
  if (v3491.isEdge() && v3491.takesUpSpace()) {
    var v3493 = v3491.cy();
    return modelToRenderedPosition$1(v3492(v3491), v3493.zoom(), v3493.pan());
  }
};
var ifEdgeRenderedPositions = function ifEdgeRenderedPositions2(v3494, v3495) {
  if (v3494.isEdge() && v3494.takesUpSpace()) {
    var v3496 = v3494.cy();
    var v3497 = v3496.pan();
    var v3498 = v3496.zoom();
    return v3495(v3494).map(function (v3499) {
      return modelToRenderedPosition$1(v3499, v3498, v3497);
    });
  }
};
var controlPoints = function controlPoints2(v3500) {
  return v3500.renderer().getControlPoints(v3500);
};
var segmentPoints = function segmentPoints2(v3501) {
  return v3501.renderer().getSegmentPoints(v3501);
};
var sourceEndpoint = function sourceEndpoint2(v3502) {
  return v3502.renderer().getSourceEndpoint(v3502);
};
var targetEndpoint = function targetEndpoint2(v3503) {
  return v3503.renderer().getTargetEndpoint(v3503);
};
var midpoint = function midpoint2(v3504) {
  return v3504.renderer().getEdgeMidpoint(v3504);
};
var pts = {
  controlPoints: {
    get: controlPoints,
    mult: true
  },
  segmentPoints: {
    get: segmentPoints,
    mult: true
  },
  sourceEndpoint: {
    get: sourceEndpoint
  },
  targetEndpoint: {
    get: targetEndpoint
  },
  midpoint: {
    get: midpoint
  }
};
var renderedName = function renderedName2(v3505) {
  return "rendered" + v3505[0].toUpperCase() + v3505.substr(1);
};
var edgePoints = Object.keys(pts).reduce(function (v3506, v3507) {
  var v3508 = pts[v3507];
  var v3509 = renderedName(v3507);
  v3506[v3507] = function () {
    return ifEdge(this, v3508.get);
  };
  if (v3508.mult) {
    v3506[v3509] = function () {
      return ifEdgeRenderedPositions(this, v3508.get);
    };
  } else {
    v3506[v3509] = function () {
      return ifEdgeRenderedPosition(this, v3508.get);
    };
  }
  return v3506;
}, {});
var dimensions = extend({}, position, bounds, widthHeight, edgePoints);
var Event = function Event2(v3510, v3511) {
  this.recycle(v3510, v3511);
};
function returnFalse() {
  return false;
}
function returnTrue() {
  return true;
}
Event.prototype = {
  instanceString: function instanceString2() {
    return "event";
  },
  recycle: function recycle(v3512, v3513) {
    this.isImmediatePropagationStopped = this.isPropagationStopped = this.isDefaultPrevented = returnFalse;
    if (v3512 != null && v3512.preventDefault) {
      this.type = v3512.type;
      this.isDefaultPrevented = v3512.defaultPrevented ? returnTrue : returnFalse;
    } else if (v3512 != null && v3512.type) {
      v3513 = v3512;
    } else {
      this.type = v3512;
    }
    if (v3513 != null) {
      this.originalEvent = v3513.originalEvent;
      this.type = v3513.type ?? this.type;
      this.cy = v3513.cy;
      this.target = v3513.target;
      this.position = v3513.position;
      this.renderedPosition = v3513.renderedPosition;
      this.namespace = v3513.namespace;
      this.layout = v3513.layout;
    }
    if (this.cy != null && this.position != null && this.renderedPosition == null) {
      var v3514 = this.position;
      var v3515 = this.cy.zoom();
      var v3516 = this.cy.pan();
      this.renderedPosition = {
        x: v3514.x * v3515 + v3516.x,
        y: v3514.y * v3515 + v3516.y
      };
    }
    this.timeStamp = v3512 && v3512.timeStamp || Date.now();
  },
  preventDefault: function preventDefault() {
    this.isDefaultPrevented = returnTrue;
    var v3517 = this.originalEvent;
    if (!v3517) {
      return;
    }
    if (v3517.preventDefault) {
      v3517.preventDefault();
    }
  },
  stopPropagation: function stopPropagation() {
    this.isPropagationStopped = returnTrue;
    var v3518 = this.originalEvent;
    if (!v3518) {
      return;
    }
    if (v3518.stopPropagation) {
      v3518.stopPropagation();
    }
  },
  stopImmediatePropagation: function stopImmediatePropagation() {
    this.isImmediatePropagationStopped = returnTrue;
    this.stopPropagation();
  },
  isDefaultPrevented: returnFalse,
  isPropagationStopped: returnFalse,
  isImmediatePropagationStopped: returnFalse
};
var eventRegex = /^([^.]+)(\.(?:[^.]+))?$/;
var universalNamespace = ".*";
var defaults$8 = {
  qualifierCompare: function qualifierCompare(v3519, v3520) {
    return v3519 === v3520;
  },
  eventMatches: function eventMatches() {
    return true;
  },
  addEventFields: function addEventFields() {},
  callbackContext: function callbackContext(v3521) {
    return v3521;
  },
  beforeEmit: function beforeEmit() {},
  afterEmit: function afterEmit() {},
  bubble: function bubble() {
    return false;
  },
  parent: function parent2() {
    return null;
  },
  context: null
};
var defaultsKeys = Object.keys(defaults$8);
var emptyOpts = {};
function Emitter(v3522 = emptyOpts, v3523) {
  for (var v3524 = 0; v3524 < defaultsKeys.length; v3524++) {
    var v3525 = defaultsKeys[v3524];
    this[v3525] = v3522[v3525] || defaults$8[v3525];
  }
  this.context = v3523 || this.context;
  this.listeners = [];
  this.emitting = 0;
}
var p = Emitter.prototype;
var forEachEvent = function forEachEvent2(v3526, v3527, v3528, v3529, v3530, v3531, v3532) {
  if (fn$6(v3529)) {
    v3530 = v3529;
    v3529 = null;
  }
  if (v3532) {
    if (v3531 == null) {
      v3531 = v3532;
    } else {
      v3531 = extend({}, v3531, v3532);
    }
  }
  var v3533 = array(v3528) ? v3528 : v3528.split(/\s+/);
  for (var v3534 = 0; v3534 < v3533.length; v3534++) {
    var v3535 = v3533[v3534];
    if (emptyString(v3535)) {
      continue;
    }
    var v3536 = v3535.match(eventRegex);
    if (v3536) {
      var v3537 = v3536[1];
      var v3538 = v3536[2] ? v3536[2] : null;
      var v3539 = v3527(v3526, v3535, v3537, v3538, v3529, v3530, v3531);
      if (v3539 === false) {
        break;
      }
    }
  }
};
var makeEventObj = function makeEventObj2(v3540, v3541) {
  v3540.addEventFields(v3540.context, v3541);
  return new Event(v3541.type, v3541);
};
var forEachEventObj = function forEachEventObj2(v3542, v3543, v3544) {
  if (event(v3544)) {
    v3543(v3542, v3544);
    return;
  } else if (plainObject(v3544)) {
    v3543(v3542, makeEventObj(v3542, v3544));
    return;
  }
  var v3545 = array(v3544) ? v3544 : v3544.split(/\s+/);
  for (var v3546 = 0; v3546 < v3545.length; v3546++) {
    var v3547 = v3545[v3546];
    if (emptyString(v3547)) {
      continue;
    }
    var v3548 = v3547.match(eventRegex);
    if (v3548) {
      var v3549 = v3548[1];
      var v3550 = v3548[2] ? v3548[2] : null;
      var v3551 = makeEventObj(v3542, {
        type: v3549,
        namespace: v3550,
        target: v3542.context
      });
      v3543(v3542, v3551);
    }
  }
};
p.on = p.addListener = function (v3552, v3553, v3554, v3555, v3556) {
  forEachEvent(this, function (v3557, v3558, v3559, v3560, v3561, v3562, v3563) {
    if (fn$6(v3562)) {
      v3557.listeners.push({
        event: v3558,
        callback: v3562,
        type: v3559,
        namespace: v3560,
        qualifier: v3561,
        conf: v3563
      });
    }
  }, v3552, v3553, v3554, v3555, v3556);
  return this;
};
p.one = function (v3564, v3565, v3566, v3567) {
  return this.on(v3564, v3565, v3566, v3567, {
    one: true
  });
};
p.removeListener = p.off = function (v3568, v3569, v3570, v3571) {
  var v3572 = this;
  if (this.emitting !== 0) {
    this.listeners = copyArray(this.listeners);
  }
  var v3573 = this.listeners;
  var v3574 = function v3575(v3576) {
    var v3577 = v3573[v3576];
    forEachEvent(v3572, function (v3578, v3579, v3580, v3581, v3582, v3583) {
      if ((v3577.type === v3580 || v3568 === "*") && (!v3581 && v3577.namespace !== ".*" || v3577.namespace === v3581) && (!v3582 || v3578.qualifierCompare(v3577.qualifier, v3582)) && (!v3583 || v3577.callback === v3583)) {
        v3573.splice(v3576, 1);
        return false;
      }
    }, v3568, v3569, v3570, v3571);
  };
  for (var v3584 = v3573.length - 1; v3584 >= 0; v3584--) {
    v3574(v3584);
  }
  return this;
};
p.removeAllListeners = function () {
  return this.removeListener("*");
};
p.emit = p.trigger = function (v3585, v3586, v3587) {
  var v3588 = this.listeners;
  var v3589 = v3588.length;
  this.emitting++;
  if (!array(v3586)) {
    v3586 = [v3586];
  }
  forEachEventObj(this, function (v3590, v3591) {
    if (v3587 != null) {
      v3588 = [{
        event: v3591.event,
        type: v3591.type,
        namespace: v3591.namespace,
        callback: v3587
      }];
      v3589 = v3588.length;
    }
    var v3592 = function v3593() {
      var v3594 = v3588[v3595];
      if (v3594.type === v3591.type && (!v3594.namespace || v3594.namespace === v3591.namespace || v3594.namespace === universalNamespace) && v3590.eventMatches(v3590.context, v3594, v3591)) {
        var v3596 = [v3591];
        if (v3586 != null) {
          push(v3596, v3586);
        }
        v3590.beforeEmit(v3590.context, v3594, v3591);
        if (v3594.conf && v3594.conf.one) {
          v3590.listeners = v3590.listeners.filter(function (v3597) {
            return v3597 !== v3594;
          });
        }
        var v3598 = v3590.callbackContext(v3590.context, v3594, v3591);
        var v3599 = v3594.callback.apply(v3598, v3596);
        v3590.afterEmit(v3590.context, v3594, v3591);
        if (v3599 === false) {
          v3591.stopPropagation();
          v3591.preventDefault();
        }
      }
    };
    for (var v3595 = 0; v3595 < v3589; v3595++) {
      v3592();
    }
    if (v3590.bubble(v3590.context) && !v3591.isPropagationStopped()) {
      v3590.parent(v3590.context).emit(v3591, v3586);
    }
  }, v3585);
  this.emitting--;
  return this;
};
var emitterOptions$1 = {
  qualifierCompare: function qualifierCompare2(v3600, v3601) {
    if (v3600 == null || v3601 == null) {
      return v3600 == null && v3601 == null;
    } else {
      return v3600.sameText(v3601);
    }
  },
  eventMatches: function eventMatches2(v3602, v3603, v3604) {
    var v3605 = v3603.qualifier;
    if (v3605 != null) {
      return v3602 !== v3604.target && element(v3604.target) && v3605.matches(v3604.target);
    }
    return true;
  },
  addEventFields: function addEventFields2(v3606, v3607) {
    v3607.cy = v3606.cy();
    v3607.target = v3606;
  },
  callbackContext: function callbackContext2(v3608, v3609, v3610) {
    if (v3609.qualifier != null) {
      return v3610.target;
    } else {
      return v3608;
    }
  },
  beforeEmit: function beforeEmit2(v3611, v3612) {
    if (v3612.conf && v3612.conf.once) {
      v3612.conf.onceCollection.removeListener(v3612.event, v3612.qualifier, v3612.callback);
    }
  },
  bubble: function bubble2() {
    return true;
  },
  parent: function parent3(v3613) {
    if (v3613.isChild()) {
      return v3613.parent();
    } else {
      return v3613.cy();
    }
  }
};
var argSelector$1 = function argSelector(v3614) {
  if (string(v3614)) {
    return new Selector(v3614);
  } else {
    return v3614;
  }
};
var elesfn$9 = {
  createEmitter: function createEmitter() {
    for (var v3615 = 0; v3615 < this.length; v3615++) {
      var v3616 = this[v3615];
      var v3617 = v3616._private;
      if (!v3617.emitter) {
        v3617.emitter = new Emitter(emitterOptions$1, v3616);
      }
    }
    return this;
  },
  emitter: function emitter() {
    return this._private.emitter;
  },
  on: function on(v3618, v3619, v3620) {
    var v3621 = argSelector$1(v3619);
    for (var v3622 = 0; v3622 < this.length; v3622++) {
      var v3623 = this[v3622];
      v3623.emitter().on(v3618, v3621, v3620);
    }
    return this;
  },
  removeListener: function removeListener(v3624, v3625, v3626) {
    var v3627 = argSelector$1(v3625);
    for (var v3628 = 0; v3628 < this.length; v3628++) {
      var v3629 = this[v3628];
      v3629.emitter().removeListener(v3624, v3627, v3626);
    }
    return this;
  },
  removeAllListeners: function removeAllListeners() {
    for (var v3630 = 0; v3630 < this.length; v3630++) {
      var v3631 = this[v3630];
      v3631.emitter().removeAllListeners();
    }
    return this;
  },
  one: function one(v3632, v3633, v3634) {
    var v3635 = argSelector$1(v3633);
    for (var v3636 = 0; v3636 < this.length; v3636++) {
      var v3637 = this[v3636];
      v3637.emitter().one(v3632, v3635, v3634);
    }
    return this;
  },
  once: function once(v3638, v3639, v3640) {
    var v3641 = argSelector$1(v3639);
    for (var v3642 = 0; v3642 < this.length; v3642++) {
      var v3643 = this[v3642];
      v3643.emitter().on(v3638, v3641, v3640, {
        once: true,
        onceCollection: this
      });
    }
  },
  emit: function emit(v3644, v3645) {
    for (var v3646 = 0; v3646 < this.length; v3646++) {
      var v3647 = this[v3646];
      v3647.emitter().emit(v3644, v3645);
    }
    return this;
  },
  emitAndNotify: function emitAndNotify(v3648, v3649) {
    if (this.length === 0) {
      return;
    }
    this.cy().notify(v3648, this);
    this.emit(v3648, v3649);
    return this;
  }
};
define.eventAliasesOn(elesfn$9);
var elesfn$8 = {
  nodes: function nodes(v3650) {
    return this.filter(function (v3651) {
      return v3651.isNode();
    }).filter(v3650);
  },
  edges: function edges(v3652) {
    return this.filter(function (v3653) {
      return v3653.isEdge();
    }).filter(v3652);
  },
  byGroup: function byGroup() {
    var v3654 = this.spawn();
    var v3655 = this.spawn();
    for (var v3656 = 0; v3656 < this.length; v3656++) {
      var v3657 = this[v3656];
      if (v3657.isNode()) {
        v3654.push(v3657);
      } else {
        v3655.push(v3657);
      }
    }
    return {
      nodes: v3654,
      edges: v3655
    };
  },
  filter: function filter3(v3658, v3659) {
    if (v3658 === undefined) {
      return this;
    } else if (string(v3658) || elementOrCollection(v3658)) {
      return new Selector(v3658).filter(this);
    } else if (fn$6(v3658)) {
      var v3660 = this.spawn();
      var v3661 = this;
      for (var v3662 = 0; v3662 < v3661.length; v3662++) {
        var v3663 = v3661[v3662];
        var v3664 = v3659 ? v3658.apply(v3659, [v3663, v3662, v3661]) : v3658(v3663, v3662, v3661);
        if (v3664) {
          v3660.push(v3663);
        }
      }
      return v3660;
    }
    return this.spawn();
  },
  not: function not(v3665) {
    if (!v3665) {
      return this;
    } else {
      if (string(v3665)) {
        v3665 = this.filter(v3665);
      }
      var v3666 = this.spawn();
      for (var v3667 = 0; v3667 < this.length; v3667++) {
        var v3668 = this[v3667];
        var v3669 = v3665.has(v3668);
        if (!v3669) {
          v3666.push(v3668);
        }
      }
      return v3666;
    }
  },
  absoluteComplement: function absoluteComplement() {
    var v3670 = this.cy();
    return v3670.mutableElements().not(this);
  },
  intersect: function intersect(v3671) {
    if (string(v3671)) {
      var v3672 = v3671;
      return this.filter(v3672);
    }
    var v3673 = this.spawn();
    var v3674 = this;
    var v3675 = v3671;
    var v3676 = this.length < v3671.length;
    var v3677 = v3676 ? v3674 : v3675;
    var v3678 = v3676 ? v3675 : v3674;
    for (var v3679 = 0; v3679 < v3677.length; v3679++) {
      var v3680 = v3677[v3679];
      if (v3678.has(v3680)) {
        v3673.push(v3680);
      }
    }
    return v3673;
  },
  xor: function xor(v3681) {
    var v3682 = this._private.cy;
    if (string(v3681)) {
      v3681 = v3682.$(v3681);
    }
    var v3683 = this.spawn();
    var v3684 = this;
    var v3685 = v3681;
    var v3686 = function v3687(v3688, v3689) {
      for (var v3690 = 0; v3690 < v3688.length; v3690++) {
        var v3691 = v3688[v3690];
        var v3692 = v3691._private.data.id;
        var v3693 = v3689.hasElementWithId(v3692);
        if (!v3693) {
          v3683.push(v3691);
        }
      }
    };
    v3686(v3684, v3685);
    v3686(v3685, v3684);
    return v3683;
  },
  diff: function diff(v3694) {
    var v3695 = this._private.cy;
    if (string(v3694)) {
      v3694 = v3695.$(v3694);
    }
    var v3696 = this.spawn();
    var v3697 = this.spawn();
    var v3698 = this.spawn();
    var v3699 = this;
    var v3700 = v3694;
    var v3701 = function v3702(v3703, v3704, v3705) {
      for (var v3706 = 0; v3706 < v3703.length; v3706++) {
        var v3707 = v3703[v3706];
        var v3708 = v3707._private.data.id;
        var v3709 = v3704.hasElementWithId(v3708);
        if (v3709) {
          v3698.merge(v3707);
        } else {
          v3705.push(v3707);
        }
      }
    };
    v3701(v3699, v3700, v3696);
    v3701(v3700, v3699, v3697);
    return {
      left: v3696,
      right: v3697,
      both: v3698
    };
  },
  add: function add(v3710) {
    var v3711 = this._private.cy;
    if (!v3710) {
      return this;
    }
    if (string(v3710)) {
      var v3712 = v3710;
      v3710 = v3711.mutableElements().filter(v3712);
    }
    var v3713 = this.spawnSelf();
    for (var v3714 = 0; v3714 < v3710.length; v3714++) {
      var v3715 = v3710[v3714];
      var v3716 = !this.has(v3715);
      if (v3716) {
        v3713.push(v3715);
      }
    }
    return v3713;
  },
  merge: function merge(v3717) {
    var v3718 = this._private;
    var v3719 = v3718.cy;
    if (!v3717) {
      return this;
    }
    if (v3717 && string(v3717)) {
      var v3720 = v3717;
      v3717 = v3719.mutableElements().filter(v3720);
    }
    var v3721 = v3718.map;
    for (var v3722 = 0; v3722 < v3717.length; v3722++) {
      var v3723 = v3717[v3722];
      var v3724 = v3723._private.data.id;
      var v3725 = !v3721.has(v3724);
      if (v3725) {
        var v3726 = this.length++;
        this[v3726] = v3723;
        v3721.set(v3724, {
          ele: v3723,
          index: v3726
        });
      }
    }
    return this;
  },
  unmergeAt: function unmergeAt(v3727) {
    var v3728 = this[v3727];
    var v3729 = v3728.id();
    var v3730 = this._private;
    var v3731 = v3730.map;
    this[v3727] = undefined;
    v3731.delete(v3729);
    var v3732 = v3727 === this.length - 1;
    if (this.length > 1 && !v3732) {
      var v3733 = this.length - 1;
      var v3734 = this[v3733];
      var v3735 = v3734._private.data.id;
      this[v3733] = undefined;
      this[v3727] = v3734;
      v3731.set(v3735, {
        ele: v3734,
        index: v3727
      });
    }
    this.length--;
    return this;
  },
  unmergeOne: function unmergeOne(v3736) {
    v3736 = v3736[0];
    var v3737 = this._private;
    var v3738 = v3736._private.data.id;
    var v3739 = v3737.map;
    var v3740 = v3739.get(v3738);
    if (!v3740) {
      return this;
    }
    var v3741 = v3740.index;
    this.unmergeAt(v3741);
    return this;
  },
  unmerge: function unmerge(v3742) {
    var v3743 = this._private.cy;
    if (!v3742) {
      return this;
    }
    if (v3742 && string(v3742)) {
      var v3744 = v3742;
      v3742 = v3743.mutableElements().filter(v3744);
    }
    for (var v3745 = 0; v3745 < v3742.length; v3745++) {
      this.unmergeOne(v3742[v3745]);
    }
    return this;
  },
  unmergeBy: function unmergeBy(v3746) {
    for (var v3747 = this.length - 1; v3747 >= 0; v3747--) {
      var v3748 = this[v3747];
      if (v3746(v3748)) {
        this.unmergeAt(v3747);
      }
    }
    return this;
  },
  map: function map(v3749, v3750) {
    var v3751 = [];
    var v3752 = this;
    for (var v3753 = 0; v3753 < v3752.length; v3753++) {
      var v3754 = v3752[v3753];
      var v3755 = v3750 ? v3749.apply(v3750, [v3754, v3753, v3752]) : v3749(v3754, v3753, v3752);
      v3751.push(v3755);
    }
    return v3751;
  },
  reduce: function reduce(v3756, v3757) {
    var v3758 = v3757;
    var v3759 = this;
    for (var v3760 = 0; v3760 < v3759.length; v3760++) {
      v3758 = v3756(v3758, v3759[v3760], v3760, v3759);
    }
    return v3758;
  },
  max: function max4(v3761, v3762) {
    var v3763 = -Infinity;
    var v3764;
    var v3765 = this;
    for (var v3766 = 0; v3766 < v3765.length; v3766++) {
      var v3767 = v3765[v3766];
      var v3768 = v3762 ? v3761.apply(v3762, [v3767, v3766, v3765]) : v3761(v3767, v3766, v3765);
      if (v3768 > v3763) {
        v3763 = v3768;
        v3764 = v3767;
      }
    }
    return {
      value: v3763,
      ele: v3764
    };
  },
  min: function min3(v3769, v3770) {
    var v3771 = Infinity;
    var v3772;
    var v3773 = this;
    for (var v3774 = 0; v3774 < v3773.length; v3774++) {
      var v3775 = v3773[v3774];
      var v3776 = v3770 ? v3769.apply(v3770, [v3775, v3774, v3773]) : v3769(v3775, v3774, v3773);
      if (v3776 < v3771) {
        v3771 = v3776;
        v3772 = v3775;
      }
    }
    return {
      value: v3771,
      ele: v3772
    };
  }
};
var fn$1 = elesfn$8;
fn$1.u = fn$1["|"] = fn$1["+"] = fn$1.union = fn$1.or = fn$1.add;
fn$1["\\"] = fn$1["!"] = fn$1["-"] = fn$1.difference = fn$1.relativeComplement = fn$1.subtract = fn$1.not;
fn$1.n = fn$1["&"] = fn$1["."] = fn$1.and = fn$1.intersection = fn$1.intersect;
fn$1["^"] = fn$1["(+)"] = fn$1["(-)"] = fn$1.symmetricDifference = fn$1.symdiff = fn$1.xor;
fn$1.fnFilter = fn$1.filterFn = fn$1.stdFilter = fn$1.filter;
fn$1.complement = fn$1.abscomp = fn$1.absoluteComplement;
var elesfn$7 = {
  isNode: function isNode() {
    return this.group() === "nodes";
  },
  isEdge: function isEdge() {
    return this.group() === "edges";
  },
  isLoop: function isLoop() {
    return this.isEdge() && this.source()[0] === this.target()[0];
  },
  isSimple: function isSimple() {
    return this.isEdge() && this.source()[0] !== this.target()[0];
  },
  group: function group() {
    var v3777 = this[0];
    if (v3777) {
      return v3777._private.group;
    }
  }
};
var zIndexSort = function zIndexSort2(v3778, v3779) {
  var v3780 = v3778.cy();
  var v3781 = v3780.hasCompoundNodes();
  function v3782(v3783) {
    var v3784 = v3783.pstyle("z-compound-depth");
    if (v3784.value === "auto") {
      if (v3781) {
        return v3783.zDepth();
      } else {
        return 0;
      }
    } else if (v3784.value === "bottom") {
      return -1;
    } else if (v3784.value === "top") {
      return MAX_INT$1;
    }
    return 0;
  }
  var v3785 = v3782(v3778) - v3782(v3779);
  if (v3785 !== 0) {
    return v3785;
  }
  function v3786(v3787) {
    var v3788 = v3787.pstyle("z-index-compare");
    if (v3788.value === "auto") {
      if (v3787.isNode()) {
        return 1;
      } else {
        return 0;
      }
    }
    return 0;
  }
  var v3789 = v3786(v3778) - v3786(v3779);
  if (v3789 !== 0) {
    return v3789;
  }
  var v3790 = v3778.pstyle("z-index").value - v3779.pstyle("z-index").value;
  if (v3790 !== 0) {
    return v3790;
  }
  return v3778.poolIndex() - v3779.poolIndex();
};
var elesfn$6 = {
  forEach: function forEach(v3791, v3792) {
    if (fn$6(v3791)) {
      var v3793 = this.length;
      for (var v3794 = 0; v3794 < v3793; v3794++) {
        var v3795 = this[v3794];
        var v3796 = v3792 ? v3791.apply(v3792, [v3795, v3794, this]) : v3791(v3795, v3794, this);
        if (v3796 === false) {
          break;
        }
      }
    }
    return this;
  },
  toArray: function toArray() {
    var v3797 = [];
    for (var v3798 = 0; v3798 < this.length; v3798++) {
      v3797.push(this[v3798]);
    }
    return v3797;
  },
  slice: function slice(v3799, v3800) {
    var v3801 = [];
    var v3802 = this.length;
    if (v3800 == null) {
      v3800 = v3802;
    }
    if (v3799 == null) {
      v3799 = 0;
    }
    if (v3799 < 0) {
      v3799 = v3802 + v3799;
    }
    if (v3800 < 0) {
      v3800 = v3802 + v3800;
    }
    for (var v3803 = v3799; v3803 >= 0 && v3803 < v3800 && v3803 < v3802; v3803++) {
      v3801.push(this[v3803]);
    }
    return this.spawn(v3801);
  },
  size: function size() {
    return this.length;
  },
  eq: function eq(v3804) {
    return this[v3804] || this.spawn();
  },
  first: function first() {
    return this[0] || this.spawn();
  },
  last: function last() {
    return this[this.length - 1] || this.spawn();
  },
  empty: function empty() {
    return this.length === 0;
  },
  nonempty: function nonempty() {
    return !this.empty();
  },
  sort: function sort(v3805) {
    if (!fn$6(v3805)) {
      return this;
    }
    var v3806 = this.toArray().sort(v3805);
    return this.spawn(v3806);
  },
  sortByZIndex: function sortByZIndex() {
    return this.sort(zIndexSort);
  },
  zDepth: function zDepth() {
    var v3807 = this[0];
    if (!v3807) {
      return undefined;
    }
    var v3808 = v3807._private;
    var v3809 = v3808.group;
    if (v3809 === "nodes") {
      var v3810 = v3808.data.parent ? v3807.parents().size() : 0;
      if (!v3807.isParent()) {
        return MAX_INT$1 - 1;
      }
      return v3810;
    } else {
      var v3811 = v3808.source;
      var v3812 = v3808.target;
      var v3813 = v3811.zDepth();
      var v3814 = v3812.zDepth();
      return Math.max(v3813, v3814, 0);
    }
  }
};
elesfn$6.each = elesfn$6.forEach;
var defineSymbolIterator = function defineSymbolIterator2() {
  var v3815 = "undefined";
  var v3816 = (typeof Symbol === "undefined" ? "undefined" : _typeof(Symbol)) != v3815 && _typeof(Symbol.iterator) != v3815;
  if (v3816) {
    elesfn$6[Symbol.iterator] = function () {
      var v3817 = this;
      var v3818 = {
        value: undefined,
        done: false
      };
      var v3819 = 0;
      var v3820 = this.length;
      return _defineProperty$1({
        next: function v3821() {
          if (v3819 < v3820) {
            v3818.value = v3817[v3819++];
          } else {
            v3818.value = undefined;
            v3818.done = true;
          }
          return v3818;
        }
      }, Symbol.iterator, function () {
        return this;
      });
    };
  }
};
defineSymbolIterator();
var getLayoutDimensionOptions = defaults$g({
  nodeDimensionsIncludeLabels: false
});
var elesfn$5 = {
  layoutDimensions: function layoutDimensions(v3822) {
    v3822 = getLayoutDimensionOptions(v3822);
    var v3823;
    if (!this.takesUpSpace()) {
      v3823 = {
        w: 0,
        h: 0
      };
    } else if (v3822.nodeDimensionsIncludeLabels) {
      var v3824 = this.boundingBox();
      v3823 = {
        w: v3824.w,
        h: v3824.h
      };
    } else {
      v3823 = {
        w: this.outerWidth(),
        h: this.outerHeight()
      };
    }
    if (v3823.w === 0 || v3823.h === 0) {
      v3823.w = v3823.h = 1;
    }
    return v3823;
  },
  layoutPositions: function layoutPositions(v3825, v3826, v3827) {
    var v3828 = this.nodes().filter(function (v3829) {
      return !v3829.isParent();
    });
    var v3830 = this.cy();
    var v3831 = v3826.eles;
    var v3832 = function v3833(v3834) {
      return v3834.id();
    };
    var v3835 = memoize(v3827, v3832);
    v3825.emit({
      type: "layoutstart",
      layout: v3825
    });
    v3825.animations = [];
    var v3836 = function v3837(v3838, v3839, v3840) {
      var v3841 = {
        x: v3839.x1 + v3839.w / 2,
        y: v3839.y1 + v3839.h / 2
      };
      var v3842 = {
        x: (v3840.x - v3841.x) * v3838,
        y: (v3840.y - v3841.y) * v3838
      };
      return {
        x: v3841.x + v3842.x,
        y: v3841.y + v3842.y
      };
    };
    var v3843 = v3826.spacingFactor && v3826.spacingFactor !== 1;
    var v3844 = function v3845() {
      if (!v3843) {
        return null;
      }
      var v3846 = makeBoundingBox();
      for (var v3847 = 0; v3847 < v3828.length; v3847++) {
        var v3848 = v3828[v3847];
        var v3849 = v3835(v3848, v3847);
        expandBoundingBoxByPoint(v3846, v3849.x, v3849.y);
      }
      return v3846;
    };
    var v3850 = v3844();
    var v3851 = memoize(function (v3852, v3853) {
      var v3854 = v3835(v3852, v3853);
      if (v3843) {
        var v3855 = Math.abs(v3826.spacingFactor);
        v3854 = v3836(v3855, v3850, v3854);
      }
      if (v3826.transform != null) {
        v3854 = v3826.transform(v3852, v3854);
      }
      return v3854;
    }, v3832);
    if (v3826.animate) {
      for (var v3856 = 0; v3856 < v3828.length; v3856++) {
        var v3857 = v3828[v3856];
        var v3858 = v3851(v3857, v3856);
        var v3859 = v3826.animateFilter == null || v3826.animateFilter(v3857, v3856);
        if (v3859) {
          var v3860 = v3857.animation({
            position: v3858,
            duration: v3826.animationDuration,
            easing: v3826.animationEasing
          });
          v3825.animations.push(v3860);
        } else {
          v3857.position(v3858);
        }
      }
      if (v3826.fit) {
        var v3861 = v3830.animation({
          fit: {
            boundingBox: v3831.boundingBoxAt(v3851),
            padding: v3826.padding
          },
          duration: v3826.animationDuration,
          easing: v3826.animationEasing
        });
        v3825.animations.push(v3861);
      } else if (v3826.zoom !== undefined && v3826.pan !== undefined) {
        var v3862 = v3830.animation({
          zoom: v3826.zoom,
          pan: v3826.pan,
          duration: v3826.animationDuration,
          easing: v3826.animationEasing
        });
        v3825.animations.push(v3862);
      }
      v3825.animations.forEach(function (v3863) {
        return v3863.play();
      });
      v3825.one("layoutready", v3826.ready);
      v3825.emit({
        type: "layoutready",
        layout: v3825
      });
      Promise$1.all(v3825.animations.map(function (v3864) {
        return v3864.promise();
      })).then(function () {
        v3825.one("layoutstop", v3826.stop);
        v3825.emit({
          type: "layoutstop",
          layout: v3825
        });
      });
    } else {
      v3828.positions(v3851);
      if (v3826.fit) {
        v3830.fit(v3826.eles, v3826.padding);
      }
      if (v3826.zoom != null) {
        v3830.zoom(v3826.zoom);
      }
      if (v3826.pan) {
        v3830.pan(v3826.pan);
      }
      v3825.one("layoutready", v3826.ready);
      v3825.emit({
        type: "layoutready",
        layout: v3825
      });
      v3825.one("layoutstop", v3826.stop);
      v3825.emit({
        type: "layoutstop",
        layout: v3825
      });
    }
    return this;
  },
  layout: function layout(v3865) {
    var v3866 = this.cy();
    return v3866.makeLayout(extend({}, v3865, {
      eles: this
    }));
  }
};
elesfn$5.createLayout = elesfn$5.makeLayout = elesfn$5.layout;
function styleCache(v3867, v3868, v3869) {
  var v3870 = v3869._private;
  var v3871 = v3870.styleCache = v3870.styleCache || [];
  var v3872;
  if ((v3872 = v3871[v3867]) != null) {
    return v3872;
  } else {
    v3872 = v3871[v3867] = v3868(v3869);
    return v3872;
  }
}
function cacheStyleFunction(v3873, v3874) {
  v3873 = hashString(v3873);
  return function v3875(v3876) {
    return styleCache(v3873, v3874, v3876);
  };
}
function cachePrototypeStyleFunction(v3877, v3878) {
  v3877 = hashString(v3877);
  var v3879 = function v3880(v3881) {
    return v3878.call(v3881);
  };
  return function v3882() {
    var v3883 = this[0];
    if (v3883) {
      return styleCache(v3877, v3879, v3883);
    }
  };
}
var elesfn$4 = {
  recalculateRenderedStyle: function recalculateRenderedStyle(v3884) {
    var v3885 = this.cy();
    var v3886 = v3885.renderer();
    var v3887 = v3885.styleEnabled();
    if (v3886 && v3887) {
      v3886.recalculateRenderedStyle(this, v3884);
    }
    return this;
  },
  dirtyStyleCache: function dirtyStyleCache() {
    var v3888 = this.cy();
    var v3889 = function v3890(v3891) {
      return v3891._private.styleCache = null;
    };
    if (v3888.hasCompoundNodes()) {
      var v3892;
      v3892 = this.spawnSelf().merge(this.descendants()).merge(this.parents());
      v3892.merge(v3892.connectedEdges());
      v3892.forEach(v3889);
    } else {
      this.forEach(function (v3893) {
        v3889(v3893);
        v3893.connectedEdges().forEach(v3889);
      });
    }
    return this;
  },
  updateStyle: function updateStyle(v3894) {
    var v3895 = this._private.cy;
    if (!v3895.styleEnabled()) {
      return this;
    }
    if (v3895.batching()) {
      var v3896 = v3895._private.batchStyleEles;
      v3896.merge(this);
      return this;
    }
    var v3897 = v3895.hasCompoundNodes();
    var v3898 = this;
    v3894 = v3894 || v3894 === undefined ? true : false;
    if (v3897) {
      v3898 = this.spawnSelf().merge(this.descendants()).merge(this.parents());
    }
    var v3899 = v3898;
    if (v3894) {
      v3899.emitAndNotify("style");
    } else {
      v3899.emit("style");
    }
    v3898.forEach(function (v3900) {
      return v3900._private.styleDirty = true;
    });
    return this;
  },
  cleanStyle: function cleanStyle() {
    var v3901 = this.cy();
    if (!v3901.styleEnabled()) {
      return;
    }
    for (var v3902 = 0; v3902 < this.length; v3902++) {
      var v3903 = this[v3902];
      if (v3903._private.styleDirty) {
        v3903._private.styleDirty = false;
        v3901.style().apply(v3903);
      }
    }
  },
  parsedStyle: function parsedStyle(v3904, v3905 = true) {
    var v3906 = this[0];
    var v3907 = v3906.cy();
    if (!v3907.styleEnabled()) {
      return;
    }
    if (v3906) {
      if (v3906._private.styleDirty) {
        v3906._private.styleDirty = false;
        v3907.style().apply(v3906);
      }
      var v3908 = v3906._private.style[v3904];
      if (v3908 != null) {
        return v3908;
      } else if (v3905) {
        return v3907.style().getDefaultProperty(v3904);
      } else {
        return null;
      }
    }
  },
  numericStyle: function numericStyle(v3909) {
    var v3910 = this[0];
    if (!v3910.cy().styleEnabled()) {
      return;
    }
    if (v3910) {
      var v3911 = v3910.pstyle(v3909);
      if (v3911.pfValue !== undefined) {
        return v3911.pfValue;
      } else {
        return v3911.value;
      }
    }
  },
  numericStyleUnits: function numericStyleUnits(v3912) {
    var v3913 = this[0];
    if (!v3913.cy().styleEnabled()) {
      return;
    }
    if (v3913) {
      return v3913.pstyle(v3912).units;
    }
  },
  renderedStyle: function renderedStyle(v3914) {
    var v3915 = this.cy();
    if (!v3915.styleEnabled()) {
      return this;
    }
    var v3916 = this[0];
    if (v3916) {
      return v3915.style().getRenderedStyle(v3916, v3914);
    }
  },
  style: function style(v3917, v3918) {
    var v3919 = this.cy();
    if (!v3919.styleEnabled()) {
      return this;
    }
    var v3920 = false;
    var v3921 = v3919.style();
    if (plainObject(v3917)) {
      var v3922 = v3917;
      v3921.applyBypass(this, v3922, v3920);
      this.emitAndNotify("style");
    } else if (string(v3917)) {
      if (v3918 === undefined) {
        var v3923 = this[0];
        if (v3923) {
          return v3921.getStylePropertyValue(v3923, v3917);
        } else {
          return;
        }
      } else {
        v3921.applyBypass(this, v3917, v3918, v3920);
        this.emitAndNotify("style");
      }
    } else if (v3917 === undefined) {
      var v3924 = this[0];
      if (v3924) {
        return v3921.getRawStyle(v3924);
      } else {
        return;
      }
    }
    return this;
  },
  removeStyle: function removeStyle(v3925) {
    var v3926 = this.cy();
    if (!v3926.styleEnabled()) {
      return this;
    }
    var v3927 = false;
    var v3928 = v3926.style();
    var v3929 = this;
    if (v3925 === undefined) {
      for (var v3930 = 0; v3930 < v3929.length; v3930++) {
        var v3931 = v3929[v3930];
        v3928.removeAllBypasses(v3931, v3927);
      }
    } else {
      v3925 = v3925.split(/\s+/);
      for (var v3932 = 0; v3932 < v3929.length; v3932++) {
        var v3933 = v3929[v3932];
        v3928.removeBypasses(v3933, v3925, v3927);
      }
    }
    this.emitAndNotify("style");
    return this;
  },
  show: function show() {
    this.css("display", "element");
    return this;
  },
  hide: function hide() {
    this.css("display", "none");
    return this;
  },
  effectiveOpacity: function effectiveOpacity() {
    var v3934 = this.cy();
    if (!v3934.styleEnabled()) {
      return 1;
    }
    var v3935 = v3934.hasCompoundNodes();
    var v3936 = this[0];
    if (v3936) {
      var v3937 = v3936._private;
      var v3938 = v3936.pstyle("opacity").value;
      if (!v3935) {
        return v3938;
      }
      var v3939 = !v3937.data.parent ? null : v3936.parents();
      if (v3939) {
        for (var v3940 = 0; v3940 < v3939.length; v3940++) {
          var v3941 = v3939[v3940];
          var v3942 = v3941.pstyle("opacity").value;
          v3938 = v3942 * v3938;
        }
      }
      return v3938;
    }
  },
  transparent: function transparent() {
    var v3943 = this.cy();
    if (!v3943.styleEnabled()) {
      return false;
    }
    var v3944 = this[0];
    var v3945 = v3944.cy().hasCompoundNodes();
    if (v3944) {
      if (!v3945) {
        return v3944.pstyle("opacity").value === 0;
      } else {
        return v3944.effectiveOpacity() === 0;
      }
    }
  },
  backgrounding: function backgrounding() {
    var v3946 = this.cy();
    if (!v3946.styleEnabled()) {
      return false;
    }
    var v3947 = this[0];
    if (v3947._private.backgrounding) {
      return true;
    } else {
      return false;
    }
  }
};
function checkCompound(v3948, v3949) {
  var v3950 = v3948._private;
  var v3951 = v3950.data.parent ? v3948.parents() : null;
  if (v3951) {
    for (var v3952 = 0; v3952 < v3951.length; v3952++) {
      var v3953 = v3951[v3952];
      if (!v3949(v3953)) {
        return false;
      }
    }
  }
  return true;
}
function defineDerivedStateFunction(v3954) {
  var v3955 = v3954.ok;
  var v3956 = v3954.edgeOkViaNode || v3954.ok;
  var v3957 = v3954.parentOk || v3954.ok;
  return function () {
    var v3958 = this.cy();
    if (!v3958.styleEnabled()) {
      return true;
    }
    var v3959 = this[0];
    var v3960 = v3958.hasCompoundNodes();
    if (v3959) {
      var v3961 = v3959._private;
      if (!v3955(v3959)) {
        return false;
      }
      if (v3959.isNode()) {
        return !v3960 || checkCompound(v3959, v3957);
      } else {
        var v3962 = v3961.source;
        var v3963 = v3961.target;
        return v3956(v3962) && (!v3960 || checkCompound(v3962, v3956)) && (v3962 === v3963 || v3956(v3963) && (!v3960 || checkCompound(v3963, v3956)));
      }
    }
  };
}
var eleTakesUpSpace = cacheStyleFunction("eleTakesUpSpace", function (v3964) {
  return v3964.pstyle("display").value === "element" && v3964.width() !== 0 && (v3964.isNode() ? v3964.height() !== 0 : true);
});
elesfn$4.takesUpSpace = cachePrototypeStyleFunction("takesUpSpace", defineDerivedStateFunction({
  ok: eleTakesUpSpace
}));
var eleInteractive = cacheStyleFunction("eleInteractive", function (v3965) {
  return v3965.pstyle("events").value === "yes" && v3965.pstyle("visibility").value === "visible" && eleTakesUpSpace(v3965);
});
var parentInteractive = cacheStyleFunction("parentInteractive", function (v3966) {
  return v3966.pstyle("visibility").value === "visible" && eleTakesUpSpace(v3966);
});
elesfn$4.interactive = cachePrototypeStyleFunction("interactive", defineDerivedStateFunction({
  ok: eleInteractive,
  parentOk: parentInteractive,
  edgeOkViaNode: eleTakesUpSpace
}));
elesfn$4.noninteractive = function () {
  var v3967 = this[0];
  if (v3967) {
    return !v3967.interactive();
  }
};
var eleVisible = cacheStyleFunction("eleVisible", function (v3968) {
  return v3968.pstyle("visibility").value === "visible" && v3968.pstyle("opacity").pfValue !== 0 && eleTakesUpSpace(v3968);
});
var edgeVisibleViaNode = eleTakesUpSpace;
elesfn$4.visible = cachePrototypeStyleFunction("visible", defineDerivedStateFunction({
  ok: eleVisible,
  edgeOkViaNode: edgeVisibleViaNode
}));
elesfn$4.hidden = function () {
  var v3969 = this[0];
  if (v3969) {
    return !v3969.visible();
  }
};
elesfn$4.isBundledBezier = cachePrototypeStyleFunction("isBundledBezier", function () {
  if (!this.cy().styleEnabled()) {
    return false;
  }
  return !this.removed() && this.pstyle("curve-style").value === "bezier" && this.takesUpSpace();
});
elesfn$4.bypass = elesfn$4.css = elesfn$4.style;
elesfn$4.renderedCss = elesfn$4.renderedStyle;
elesfn$4.removeBypass = elesfn$4.removeCss = elesfn$4.removeStyle;
elesfn$4.pstyle = elesfn$4.parsedStyle;
var elesfn$3 = {};
function defineSwitchFunction(v3970) {
  return function () {
    var v3971 = arguments;
    var v3972 = [];
    if (v3971.length === 2) {
      var v3973 = v3971[0];
      var v3974 = v3971[1];
      this.on(v3970.event, v3973, v3974);
    } else if (v3971.length === 1 && fn$6(v3971[0])) {
      var v3975 = v3971[0];
      this.on(v3970.event, v3975);
    } else if (v3971.length === 0 || v3971.length === 1 && array(v3971[0])) {
      var v3976 = v3971.length === 1 ? v3971[0] : null;
      for (var v3977 = 0; v3977 < this.length; v3977++) {
        var v3978 = this[v3977];
        var v3979 = !v3970.ableField || v3978._private[v3970.ableField];
        var v3980 = v3978._private[v3970.field] != v3970.value;
        if (v3970.overrideAble) {
          var v3981 = v3970.overrideAble(v3978);
          if (v3981 !== undefined) {
            v3979 = v3981;
            if (!v3981) {
              return this;
            }
          }
        }
        if (v3979) {
          v3978._private[v3970.field] = v3970.value;
          if (v3980) {
            v3972.push(v3978);
          }
        }
      }
      var v3982 = this.spawn(v3972);
      v3982.updateStyle();
      v3982.emit(v3970.event);
      if (v3976) {
        v3982.emit(v3976);
      }
    }
    return this;
  };
}
function defineSwitchSet(v3983) {
  elesfn$3[v3983.field] = function () {
    var v3984 = this[0];
    if (v3984) {
      if (v3983.overrideField) {
        var v3985 = v3983.overrideField(v3984);
        if (v3985 !== undefined) {
          return v3985;
        }
      }
      return v3984._private[v3983.field];
    }
  };
  elesfn$3[v3983.on] = defineSwitchFunction({
    event: v3983.on,
    field: v3983.field,
    ableField: v3983.ableField,
    overrideAble: v3983.overrideAble,
    value: true
  });
  elesfn$3[v3983.off] = defineSwitchFunction({
    event: v3983.off,
    field: v3983.field,
    ableField: v3983.ableField,
    overrideAble: v3983.overrideAble,
    value: false
  });
}
defineSwitchSet({
  field: "locked",
  overrideField: function overrideField(v3986) {
    if (v3986.cy().autolock()) {
      return true;
    } else {
      return undefined;
    }
  },
  on: "lock",
  off: "unlock"
});
defineSwitchSet({
  field: "grabbable",
  overrideField: function overrideField2(v3987) {
    if (v3987.cy().autoungrabify() || v3987.pannable()) {
      return false;
    } else {
      return undefined;
    }
  },
  on: "grabify",
  off: "ungrabify"
});
defineSwitchSet({
  field: "selected",
  ableField: "selectable",
  overrideAble: function overrideAble(v3988) {
    if (v3988.cy().autounselectify()) {
      return false;
    } else {
      return undefined;
    }
  },
  on: "select",
  off: "unselect"
});
defineSwitchSet({
  field: "selectable",
  overrideField: function overrideField3(v3989) {
    if (v3989.cy().autounselectify()) {
      return false;
    } else {
      return undefined;
    }
  },
  on: "selectify",
  off: "unselectify"
});
elesfn$3.deselect = elesfn$3.unselect;
elesfn$3.grabbed = function () {
  var v3990 = this[0];
  if (v3990) {
    return v3990._private.grabbed;
  }
};
defineSwitchSet({
  field: "active",
  on: "activate",
  off: "unactivate"
});
defineSwitchSet({
  field: "pannable",
  on: "panify",
  off: "unpanify"
});
elesfn$3.inactive = function () {
  var v3991 = this[0];
  if (v3991) {
    return !v3991._private.active;
  }
};
var elesfn$2 = {};
var defineDagExtremity = function defineDagExtremity2(v3992) {
  return function v3993(v3994) {
    var v3995 = this;
    var v3996 = [];
    for (var v3997 = 0; v3997 < v3995.length; v3997++) {
      var v3998 = v3995[v3997];
      if (!v3998.isNode()) {
        continue;
      }
      var v3999 = false;
      var v4000 = v3998.connectedEdges();
      for (var v4001 = 0; v4001 < v4000.length; v4001++) {
        var v4002 = v4000[v4001];
        var v4003 = v4002.source();
        var v4004 = v4002.target();
        if (v3992.noIncomingEdges && v4004 === v3998 && v4003 !== v3998 || v3992.noOutgoingEdges && v4003 === v3998 && v4004 !== v3998) {
          v3999 = true;
          break;
        }
      }
      if (!v3999) {
        v3996.push(v3998);
      }
    }
    return this.spawn(v3996, true).filter(v3994);
  };
};
var defineDagOneHop = function defineDagOneHop2(v4005) {
  return function (v4006) {
    var v4007 = this;
    var v4008 = [];
    for (var v4009 = 0; v4009 < v4007.length; v4009++) {
      var v4010 = v4007[v4009];
      if (!v4010.isNode()) {
        continue;
      }
      var v4011 = v4010.connectedEdges();
      for (var v4012 = 0; v4012 < v4011.length; v4012++) {
        var v4013 = v4011[v4012];
        var v4014 = v4013.source();
        var v4015 = v4013.target();
        if (v4005.outgoing && v4014 === v4010) {
          v4008.push(v4013);
          v4008.push(v4015);
        } else if (v4005.incoming && v4015 === v4010) {
          v4008.push(v4013);
          v4008.push(v4014);
        }
      }
    }
    return this.spawn(v4008, true).filter(v4006);
  };
};
var defineDagAllHops = function defineDagAllHops2(v4016) {
  return function (v4017) {
    var v4018 = this;
    var v4019 = [];
    var v4020 = {};
    while (true) {
      var v4021 = v4016.outgoing ? v4018.outgoers() : v4018.incomers();
      if (v4021.length === 0) {
        break;
      }
      var v4022 = false;
      for (var v4023 = 0; v4023 < v4021.length; v4023++) {
        var v4024 = v4021[v4023];
        var v4025 = v4024.id();
        if (!v4020[v4025]) {
          v4020[v4025] = true;
          v4019.push(v4024);
          v4022 = true;
        }
      }
      if (!v4022) {
        break;
      }
      v4018 = v4021;
    }
    return this.spawn(v4019, true).filter(v4017);
  };
};
elesfn$2.clearTraversalCache = function () {
  for (var v4026 = 0; v4026 < this.length; v4026++) {
    this[v4026]._private.traversalCache = null;
  }
};
extend(elesfn$2, {
  roots: defineDagExtremity({
    noIncomingEdges: true
  }),
  leaves: defineDagExtremity({
    noOutgoingEdges: true
  }),
  outgoers: cache(defineDagOneHop({
    outgoing: true
  }), "outgoers"),
  successors: defineDagAllHops({
    outgoing: true
  }),
  incomers: cache(defineDagOneHop({
    incoming: true
  }), "incomers"),
  predecessors: defineDagAllHops({})
});
extend(elesfn$2, {
  neighborhood: cache(function (v4027) {
    var v4028 = [];
    var v4029 = this.nodes();
    for (var v4030 = 0; v4030 < v4029.length; v4030++) {
      var v4031 = v4029[v4030];
      var v4032 = v4031.connectedEdges();
      for (var v4033 = 0; v4033 < v4032.length; v4033++) {
        var v4034 = v4032[v4033];
        var v4035 = v4034.source();
        var v4036 = v4034.target();
        var v4037 = v4031 === v4035 ? v4036 : v4035;
        if (v4037.length > 0) {
          v4028.push(v4037[0]);
        }
        v4028.push(v4034[0]);
      }
    }
    return this.spawn(v4028, true).filter(v4027);
  }, "neighborhood"),
  closedNeighborhood: function closedNeighborhood(v4038) {
    return this.neighborhood().add(this).filter(v4038);
  },
  openNeighborhood: function openNeighborhood(v4039) {
    return this.neighborhood(v4039);
  }
});
elesfn$2.neighbourhood = elesfn$2.neighborhood;
elesfn$2.closedNeighbourhood = elesfn$2.closedNeighborhood;
elesfn$2.openNeighbourhood = elesfn$2.openNeighborhood;
extend(elesfn$2, {
  source: cache(function sourceImpl(v4040) {
    var v4041 = this[0];
    var v4042;
    if (v4041) {
      v4042 = v4041._private.source || v4041.cy().collection();
    }
    if (v4042 && v4040) {
      return v4042.filter(v4040);
    } else {
      return v4042;
    }
  }, "source"),
  target: cache(function targetImpl(v4043) {
    var v4044 = this[0];
    var v4045;
    if (v4044) {
      v4045 = v4044._private.target || v4044.cy().collection();
    }
    if (v4045 && v4043) {
      return v4045.filter(v4043);
    } else {
      return v4045;
    }
  }, "target"),
  sources: defineSourceFunction({
    attr: "source"
  }),
  targets: defineSourceFunction({
    attr: "target"
  })
});
function defineSourceFunction(v4046) {
  return function v4047(v4048) {
    var v4049 = [];
    for (var v4050 = 0; v4050 < this.length; v4050++) {
      var v4051 = this[v4050];
      var v4052 = v4051._private[v4046.attr];
      if (v4052) {
        v4049.push(v4052);
      }
    }
    return this.spawn(v4049, true).filter(v4048);
  };
}
extend(elesfn$2, {
  edgesWith: cache(defineEdgesWithFunction(), "edgesWith"),
  edgesTo: cache(defineEdgesWithFunction({
    thisIsSrc: true
  }), "edgesTo")
});
function defineEdgesWithFunction(v4053) {
  return function v4054(v4055) {
    var v4056 = [];
    var v4057 = this._private.cy;
    var v4058 = v4053 || {};
    if (string(v4055)) {
      v4055 = v4057.$(v4055);
    }
    for (var v4059 = 0; v4059 < v4055.length; v4059++) {
      var v4060 = v4055[v4059]._private.edges;
      for (var v4061 = 0; v4061 < v4060.length; v4061++) {
        var v4062 = v4060[v4061];
        var v4063 = v4062._private.data;
        var v4064 = this.hasElementWithId(v4063.source) && v4055.hasElementWithId(v4063.target);
        var v4065 = v4055.hasElementWithId(v4063.source) && this.hasElementWithId(v4063.target);
        var v4066 = v4064 || v4065;
        if (!v4066) {
          continue;
        }
        if (v4058.thisIsSrc || v4058.thisIsTgt) {
          if (v4058.thisIsSrc && !v4064) {
            continue;
          }
          if (v4058.thisIsTgt && !v4065) {
            continue;
          }
        }
        v4056.push(v4062);
      }
    }
    return this.spawn(v4056, true);
  };
}
extend(elesfn$2, {
  connectedEdges: cache(function (v4067) {
    var v4068 = [];
    var v4069 = this;
    for (var v4070 = 0; v4070 < v4069.length; v4070++) {
      var v4071 = v4069[v4070];
      if (!v4071.isNode()) {
        continue;
      }
      var v4072 = v4071._private.edges;
      for (var v4073 = 0; v4073 < v4072.length; v4073++) {
        var v4074 = v4072[v4073];
        v4068.push(v4074);
      }
    }
    return this.spawn(v4068, true).filter(v4067);
  }, "connectedEdges"),
  connectedNodes: cache(function (v4075) {
    var v4076 = [];
    var v4077 = this;
    for (var v4078 = 0; v4078 < v4077.length; v4078++) {
      var v4079 = v4077[v4078];
      if (!v4079.isEdge()) {
        continue;
      }
      v4076.push(v4079.source()[0]);
      v4076.push(v4079.target()[0]);
    }
    return this.spawn(v4076, true).filter(v4075);
  }, "connectedNodes"),
  parallelEdges: cache(defineParallelEdgesFunction(), "parallelEdges"),
  codirectedEdges: cache(defineParallelEdgesFunction({
    codirected: true
  }), "codirectedEdges")
});
function defineParallelEdgesFunction(v4080) {
  var v4081 = {
    codirected: false
  };
  v4080 = extend({}, v4081, v4080);
  return function v4082(v4083) {
    var v4084 = [];
    var v4085 = this.edges();
    var v4086 = v4080;
    for (var v4087 = 0; v4087 < v4085.length; v4087++) {
      var v4088 = v4085[v4087];
      var v4089 = v4088._private;
      var v4090 = v4089.source;
      var v4091 = v4090._private.data.id;
      var v4092 = v4089.data.target;
      var v4093 = v4090._private.edges;
      for (var v4094 = 0; v4094 < v4093.length; v4094++) {
        var v4095 = v4093[v4094];
        var v4096 = v4095._private.data;
        var v4097 = v4096.target;
        var v4098 = v4096.source;
        var v4099 = v4097 === v4092 && v4098 === v4091;
        var v4100 = v4091 === v4097 && v4092 === v4098;
        if (v4086.codirected && v4099 || !v4086.codirected && (v4099 || v4100)) {
          v4084.push(v4095);
        }
      }
    }
    return this.spawn(v4084, true).filter(v4083);
  };
}
extend(elesfn$2, {
  components: function components(v4101) {
    var v4102 = this;
    var v4103 = v4102.cy();
    var v4104 = v4103.collection();
    var v4105 = v4101 == null ? v4102.nodes() : v4101.nodes();
    var v4106 = [];
    if (v4101 != null && v4105.empty()) {
      v4105 = v4101.sources();
    }
    var v4107 = function v4108(v4109, v4110) {
      v4104.merge(v4109);
      v4105.unmerge(v4109);
      v4110.merge(v4109);
    };
    if (v4105.empty()) {
      return v4102.spawn();
    }
    var v4111 = function v4112() {
      var v4113 = v4103.collection();
      v4106.push(v4113);
      var v4114 = v4105[0];
      v4107(v4114, v4113);
      v4102.bfs({
        directed: false,
        roots: v4114,
        visit: function v4115(v4116) {
          return v4107(v4116, v4113);
        }
      });
      v4113.forEach(function (v4117) {
        v4117.connectedEdges().forEach(function (v4118) {
          if (v4102.has(v4118) && v4113.has(v4118.source()) && v4113.has(v4118.target())) {
            v4113.merge(v4118);
          }
        });
      });
    };
    do {
      v4111();
    } while (v4105.length > 0);
    return v4106;
  },
  component: function component() {
    var v4119 = this[0];
    return v4119.cy().mutableElements().components(v4119)[0];
  }
});
elesfn$2.componentsOf = elesfn$2.components;
var Collection = function Collection2(v4120, v4121, v4122 = false, v4123 = false) {
  if (v4120 === undefined) {
    error("A collection must have a reference to the core");
    return;
  }
  var v4124 = new Map$1();
  var v4125 = false;
  if (!v4121) {
    v4121 = [];
  } else if (v4121.length > 0 && plainObject(v4121[0]) && !element(v4121[0])) {
    v4125 = true;
    var v4126 = [];
    var v4127 = new Set$1();
    for (var v4128 = 0, v4129 = v4121.length; v4128 < v4129; v4128++) {
      var v4130 = v4121[v4128];
      if (v4130.data == null) {
        v4130.data = {};
      }
      var v4131 = v4130.data;
      if (v4131.id == null) {
        v4131.id = uuid();
      } else if (v4120.hasElementWithId(v4131.id) || v4127.has(v4131.id)) {
        continue;
      }
      var v4132 = new Element(v4120, v4130, false);
      v4126.push(v4132);
      v4127.add(v4131.id);
    }
    v4121 = v4126;
  }
  this.length = 0;
  for (var v4133 = 0, v4134 = v4121.length; v4133 < v4134; v4133++) {
    var v4135 = v4121[v4133][0];
    if (v4135 == null) {
      continue;
    }
    var v4136 = v4135._private.data.id;
    if (!v4122 || !v4124.has(v4136)) {
      if (v4122) {
        v4124.set(v4136, {
          index: this.length,
          ele: v4135
        });
      }
      this[this.length] = v4135;
      this.length++;
    }
  }
  this._private = {
    eles: this,
    cy: v4120,
    get map() {
      if (this.lazyMap == null) {
        this.rebuildMap();
      }
      return this.lazyMap;
    },
    set map(v4137) {
      this.lazyMap = v4137;
    },
    rebuildMap: function v4138() {
      var v4139 = this.lazyMap = new Map$1();
      var v4140 = this.eles;
      for (var v4141 = 0; v4141 < v4140.length; v4141++) {
        var v4142 = v4140[v4141];
        v4139.set(v4142.id(), {
          index: v4141,
          ele: v4142
        });
      }
    }
  };
  if (v4122) {
    this._private.map = v4124;
  }
  if (v4125 && !v4123) {
    this.restore();
  }
};
var elesfn$1 = Element.prototype = Collection.prototype = Object.create(Array.prototype);
elesfn$1.instanceString = function () {
  return "collection";
};
elesfn$1.spawn = function (v4143, v4144) {
  return new Collection(this.cy(), v4143, v4144);
};
elesfn$1.spawnSelf = function () {
  return this.spawn(this);
};
elesfn$1.cy = function () {
  return this._private.cy;
};
elesfn$1.renderer = function () {
  return this._private.cy.renderer();
};
elesfn$1.element = function () {
  return this[0];
};
elesfn$1.collection = function () {
  if (collection(this)) {
    return this;
  } else {
    return new Collection(this._private.cy, [this]);
  }
};
elesfn$1.unique = function () {
  return new Collection(this._private.cy, this, true);
};
elesfn$1.hasElementWithId = function (v4145) {
  v4145 = "" + v4145;
  return this._private.map.has(v4145);
};
elesfn$1.getElementById = function (v4146) {
  v4146 = "" + v4146;
  var v4147 = this._private.cy;
  var v4148 = this._private.map.get(v4146);
  if (v4148) {
    return v4148.ele;
  } else {
    return new Collection(v4147);
  }
};
elesfn$1.$id = elesfn$1.getElementById;
elesfn$1.poolIndex = function () {
  var v4149 = this._private.cy;
  var v4150 = v4149._private.elements;
  var v4151 = this[0]._private.data.id;
  return v4150._private.map.get(v4151).index;
};
elesfn$1.indexOf = function (v4152) {
  var v4153 = v4152[0]._private.data.id;
  return this._private.map.get(v4153).index;
};
elesfn$1.indexOfId = function (v4154) {
  v4154 = "" + v4154;
  return this._private.map.get(v4154).index;
};
elesfn$1.json = function (v4155) {
  var v4156 = this.element();
  var v4157 = this.cy();
  if (v4156 == null && v4155) {
    return this;
  }
  if (v4156 == null) {
    return undefined;
  }
  var v4158 = v4156._private;
  if (plainObject(v4155)) {
    v4157.startBatch();
    if (v4155.data) {
      v4156.data(v4155.data);
      var v4159 = v4158.data;
      if (v4156.isEdge()) {
        var v4160 = false;
        var v4161 = {};
        var v4162 = v4155.data.source;
        var v4163 = v4155.data.target;
        if (v4162 != null && v4162 != v4159.source) {
          v4161.source = "" + v4162;
          v4160 = true;
        }
        if (v4163 != null && v4163 != v4159.target) {
          v4161.target = "" + v4163;
          v4160 = true;
        }
        if (v4160) {
          v4156 = v4156.move(v4161);
        }
      } else {
        var v4164 = "parent" in v4155.data;
        var v4165 = v4155.data.parent;
        if (v4164 && (v4165 != null || v4159.parent != null) && v4165 != v4159.parent) {
          if (v4165 === undefined) {
            v4165 = null;
          }
          if (v4165 != null) {
            v4165 = "" + v4165;
          }
          v4156 = v4156.move({
            parent: v4165
          });
        }
      }
    }
    if (v4155.position) {
      v4156.position(v4155.position);
    }
    var v4166 = function v4167(v4168, v4169, v4170) {
      var v4171 = v4155[v4168];
      if (v4171 != null && v4171 !== v4158[v4168]) {
        if (v4171) {
          v4156[v4169]();
        } else {
          v4156[v4170]();
        }
      }
    };
    v4166("removed", "remove", "restore");
    v4166("selected", "select", "unselect");
    v4166("selectable", "selectify", "unselectify");
    v4166("locked", "lock", "unlock");
    v4166("grabbable", "grabify", "ungrabify");
    v4166("pannable", "panify", "unpanify");
    if (v4155.classes != null) {
      v4156.classes(v4155.classes);
    }
    v4157.endBatch();
    return this;
  } else if (v4155 === undefined) {
    var v4172 = {
      data: copy(v4158.data),
      position: copy(v4158.position),
      group: v4158.group,
      removed: v4158.removed,
      selected: v4158.selected,
      selectable: v4158.selectable,
      locked: v4158.locked,
      grabbable: v4158.grabbable,
      pannable: v4158.pannable,
      classes: null
    };
    v4172.classes = "";
    var v4173 = 0;
    v4158.classes.forEach(function (v4174) {
      return v4172.classes += v4173++ === 0 ? v4174 : " " + v4174;
    });
    return v4172;
  }
};
elesfn$1.jsons = function () {
  var v4175 = [];
  for (var v4176 = 0; v4176 < this.length; v4176++) {
    var v4177 = this[v4176];
    var v4178 = v4177.json();
    v4175.push(v4178);
  }
  return v4175;
};
elesfn$1.clone = function () {
  var v4179 = this.cy();
  var v4180 = [];
  for (var v4181 = 0; v4181 < this.length; v4181++) {
    var v4182 = this[v4181];
    var v4183 = v4182.json();
    var v4184 = new Element(v4179, v4183, false);
    v4180.push(v4184);
  }
  return new Collection(v4179, v4180);
};
elesfn$1.copy = elesfn$1.clone;
elesfn$1.restore = function (v4185 = true, v4186 = true) {
  var v4187 = this;
  var v4188 = v4187.cy();
  var v4189 = v4188._private;
  var v4190 = [];
  var v4191 = [];
  var v4192;
  for (var v4193 = 0, v4194 = v4187.length; v4193 < v4194; v4193++) {
    var v4195 = v4187[v4193];
    if (v4186 && !v4195.removed()) {
      continue;
    }
    if (v4195.isNode()) {
      v4190.push(v4195);
    } else {
      v4191.push(v4195);
    }
  }
  v4192 = v4190.concat(v4191);
  var v4196;
  var v4197 = function v4198() {
    v4192.splice(v4196, 1);
    v4196--;
  };
  for (v4196 = 0; v4196 < v4192.length; v4196++) {
    var v4199 = v4192[v4196];
    var v4200 = v4199._private;
    var v4201 = v4200.data;
    v4199.clearTraversalCache();
    if (!v4186 && !v4200.removed) ;else if (v4201.id === undefined) {
      v4201.id = uuid();
    } else if (number$1(v4201.id)) {
      v4201.id = "" + v4201.id;
    } else if (emptyString(v4201.id) || !string(v4201.id)) {
      error("Can not create element with invalid string ID `" + v4201.id + "`");
      v4197();
      continue;
    } else if (v4188.hasElementWithId(v4201.id)) {
      error("Can not create second element with ID `" + v4201.id + "`");
      v4197();
      continue;
    }
    var v4202 = v4201.id;
    if (v4199.isNode()) {
      var v4203 = v4200.position;
      if (v4203.x == null) {
        v4203.x = 0;
      }
      if (v4203.y == null) {
        v4203.y = 0;
      }
    }
    if (v4199.isEdge()) {
      var v4204 = v4199;
      var v4205 = ["source", "target"];
      var v4206 = v4205.length;
      var v4207 = false;
      for (var v4208 = 0; v4208 < v4206; v4208++) {
        var v4209 = v4205[v4208];
        var v4210 = v4201[v4209];
        if (number$1(v4210)) {
          v4210 = v4201[v4209] = "" + v4201[v4209];
        }
        if (v4210 == null || v4210 === "") {
          error("Can not create edge `" + v4202 + "` with unspecified " + v4209);
          v4207 = true;
        } else if (!v4188.hasElementWithId(v4210)) {
          error("Can not create edge `" + v4202 + "` with nonexistent " + v4209 + " `" + v4210 + "`");
          v4207 = true;
        }
      }
      if (v4207) {
        v4197();
        continue;
      }
      var v4211 = v4188.getElementById(v4201.source);
      var v4212 = v4188.getElementById(v4201.target);
      if (v4211.same(v4212)) {
        v4211._private.edges.push(v4204);
      } else {
        v4211._private.edges.push(v4204);
        v4212._private.edges.push(v4204);
      }
      v4204._private.source = v4211;
      v4204._private.target = v4212;
    }
    v4200.map = new Map$1();
    v4200.map.set(v4202, {
      ele: v4199,
      index: 0
    });
    v4200.removed = false;
    if (v4186) {
      v4188.addToPool(v4199);
    }
  }
  for (var v4213 = 0; v4213 < v4190.length; v4213++) {
    var v4214 = v4190[v4213];
    var v4215 = v4214._private.data;
    if (number$1(v4215.parent)) {
      v4215.parent = "" + v4215.parent;
    }
    var v4216 = v4215.parent;
    var v4217 = v4216 != null;
    if (v4217 || v4214._private.parent) {
      var v4218 = v4214._private.parent ? v4188.collection().merge(v4214._private.parent) : v4188.getElementById(v4216);
      if (v4218.empty()) {
        v4215.parent = undefined;
      } else if (v4218[0].removed()) {
        warn("Node added with missing parent, reference to parent removed");
        v4215.parent = undefined;
        v4214._private.parent = null;
      } else {
        var v4219 = false;
        var v4220 = v4218;
        while (!v4220.empty()) {
          if (v4214.same(v4220)) {
            v4219 = true;
            v4215.parent = undefined;
            break;
          }
          v4220 = v4220.parent();
        }
        if (!v4219) {
          v4218[0]._private.children.push(v4214);
          v4214._private.parent = v4218[0];
          v4189.hasCompoundNodes = true;
        }
      }
    }
  }
  if (v4192.length > 0) {
    var v4221 = v4192.length === v4187.length ? v4187 : new Collection(v4188, v4192);
    for (var v4222 = 0; v4222 < v4221.length; v4222++) {
      var v4223 = v4221[v4222];
      if (v4223.isNode()) {
        continue;
      }
      v4223.parallelEdges().clearTraversalCache();
      v4223.source().clearTraversalCache();
      v4223.target().clearTraversalCache();
    }
    var v4224;
    if (v4189.hasCompoundNodes) {
      v4224 = v4188.collection().merge(v4221).merge(v4221.connectedNodes()).merge(v4221.parent());
    } else {
      v4224 = v4221;
    }
    v4224.dirtyCompoundBoundsCache().dirtyBoundingBoxCache().updateStyle(v4185);
    if (v4185) {
      v4221.emitAndNotify("add");
    } else if (v4186) {
      v4221.emit("add");
    }
  }
  return v4187;
};
elesfn$1.removed = function () {
  var v4225 = this[0];
  return v4225 && v4225._private.removed;
};
elesfn$1.inside = function () {
  var v4226 = this[0];
  return v4226 && !v4226._private.removed;
};
elesfn$1.remove = function (v4227 = true, v4228 = true) {
  var v4229 = this;
  var v4230 = [];
  var v4231 = {};
  var v4232 = v4229._private.cy;
  function v4233(v4234) {
    var v4235 = v4234._private.edges;
    for (var v4236 = 0; v4236 < v4235.length; v4236++) {
      v4237(v4235[v4236]);
    }
  }
  function v4238(v4239) {
    var v4240 = v4239._private.children;
    for (var v4241 = 0; v4241 < v4240.length; v4241++) {
      v4237(v4240[v4241]);
    }
  }
  function v4237(v4242) {
    var v4243 = v4231[v4242.id()];
    if (v4228 && v4242.removed() || v4243) {
      return;
    } else {
      v4231[v4242.id()] = true;
    }
    if (v4242.isNode()) {
      v4230.push(v4242);
      v4233(v4242);
      v4238(v4242);
    } else {
      v4230.unshift(v4242);
    }
  }
  for (var v4244 = 0, v4245 = v4229.length; v4244 < v4245; v4244++) {
    var v4246 = v4229[v4244];
    v4237(v4246);
  }
  function v4247(v4248, v4249) {
    var v4250 = v4248._private.edges;
    removeFromArray(v4250, v4249);
    v4248.clearTraversalCache();
  }
  function v4251(v4252) {
    v4252.clearTraversalCache();
  }
  var v4253 = [];
  v4253.ids = {};
  function v4254(v4255, v4256) {
    v4256 = v4256[0];
    v4255 = v4255[0];
    var v4257 = v4255._private.children;
    var v4258 = v4255.id();
    removeFromArray(v4257, v4256);
    v4256._private.parent = null;
    if (!v4253.ids[v4258]) {
      v4253.ids[v4258] = true;
      v4253.push(v4255);
    }
  }
  v4229.dirtyCompoundBoundsCache();
  if (v4228) {
    v4232.removeFromPool(v4230);
  }
  for (var v4259 = 0; v4259 < v4230.length; v4259++) {
    var v4260 = v4230[v4259];
    if (v4260.isEdge()) {
      var v4261 = v4260.source()[0];
      var v4262 = v4260.target()[0];
      v4247(v4261, v4260);
      v4247(v4262, v4260);
      var v4263 = v4260.parallelEdges();
      for (var v4264 = 0; v4264 < v4263.length; v4264++) {
        var v4265 = v4263[v4264];
        v4251(v4265);
        if (v4265.isBundledBezier()) {
          v4265.dirtyBoundingBoxCache();
        }
      }
    } else {
      var v4266 = v4260.parent();
      if (v4266.length !== 0) {
        v4254(v4266, v4260);
      }
    }
    if (v4228) {
      v4260._private.removed = true;
    }
  }
  var v4267 = v4232._private.elements;
  v4232._private.hasCompoundNodes = false;
  for (var v4268 = 0; v4268 < v4267.length; v4268++) {
    var v4269 = v4267[v4268];
    if (v4269.isParent()) {
      v4232._private.hasCompoundNodes = true;
      break;
    }
  }
  var v4270 = new Collection(this.cy(), v4230);
  if (v4270.size() > 0) {
    if (v4227) {
      v4270.emitAndNotify("remove");
    } else if (v4228) {
      v4270.emit("remove");
    }
  }
  for (var v4271 = 0; v4271 < v4253.length; v4271++) {
    var v4272 = v4253[v4271];
    if (!v4228 || !v4272.removed()) {
      v4272.updateStyle();
    }
  }
  return v4270;
};
elesfn$1.move = function (v4273) {
  var v4274 = this._private.cy;
  var v4275 = this;
  var v4276 = false;
  var v4277 = false;
  var v4278 = function v4279(v4280) {
    if (v4280 == null) {
      return v4280;
    } else {
      return "" + v4280;
    }
  };
  if (v4273.source !== undefined || v4273.target !== undefined) {
    var v4281 = v4278(v4273.source);
    var v4282 = v4278(v4273.target);
    var v4283 = v4281 != null && v4274.hasElementWithId(v4281);
    var v4284 = v4282 != null && v4274.hasElementWithId(v4282);
    if (v4283 || v4284) {
      v4274.batch(function () {
        v4275.remove(v4276, v4277);
        v4275.emitAndNotify("moveout");
        for (var v4285 = 0; v4285 < v4275.length; v4285++) {
          var v4286 = v4275[v4285];
          var v4287 = v4286._private.data;
          if (v4286.isEdge()) {
            if (v4283) {
              v4287.source = v4281;
            }
            if (v4284) {
              v4287.target = v4282;
            }
          }
        }
        v4275.restore(v4276, v4277);
      });
      v4275.emitAndNotify("move");
    }
  } else if (v4273.parent !== undefined) {
    var v4288 = v4278(v4273.parent);
    var v4289 = v4288 === null || v4274.hasElementWithId(v4288);
    if (v4289) {
      var v4290 = v4288 === null ? undefined : v4288;
      v4274.batch(function () {
        var v4291 = v4275.remove(v4276, v4277);
        v4291.emitAndNotify("moveout");
        for (var v4292 = 0; v4292 < v4275.length; v4292++) {
          var v4293 = v4275[v4292];
          var v4294 = v4293._private.data;
          if (v4293.isNode()) {
            v4294.parent = v4290;
          }
        }
        v4291.restore(v4276, v4277);
      });
      v4275.emitAndNotify("move");
    }
  }
  return this;
};
[elesfn$j, elesfn$i, elesfn$h, elesfn$g, elesfn$f, data3, elesfn$d, dimensions, elesfn$9, elesfn$8, elesfn$7, elesfn$6, elesfn$5, elesfn$4, elesfn$3, elesfn$2].forEach(function (v4295) {
  extend(elesfn$1, v4295);
});
var corefn$9 = {
  add: function add2(v4296) {
    var v4297;
    var v4298 = this;
    if (elementOrCollection(v4296)) {
      var v4299 = v4296;
      if (v4299._private.cy === v4298) {
        v4297 = v4299.restore();
      } else {
        var v4300 = [];
        for (var v4301 = 0; v4301 < v4299.length; v4301++) {
          var v4302 = v4299[v4301];
          v4300.push(v4302.json());
        }
        v4297 = new Collection(v4298, v4300);
      }
    } else if (array(v4296)) {
      var v4303 = v4296;
      v4297 = new Collection(v4298, v4303);
    } else if (plainObject(v4296) && (array(v4296.nodes) || array(v4296.edges))) {
      var v4304 = v4296;
      var v4305 = [];
      var v4306 = ["nodes", "edges"];
      for (var v4307 = 0, v4308 = v4306.length; v4307 < v4308; v4307++) {
        var v4309 = v4306[v4307];
        var v4310 = v4304[v4309];
        if (array(v4310)) {
          for (var v4311 = 0, v4312 = v4310.length; v4311 < v4312; v4311++) {
            var v4313 = extend({
              group: v4309
            }, v4310[v4311]);
            v4305.push(v4313);
          }
        }
      }
      v4297 = new Collection(v4298, v4305);
    } else {
      var v4314 = v4296;
      v4297 = new Element(v4298, v4314).collection();
    }
    return v4297;
  },
  remove: function remove(v4315) {
    if (elementOrCollection(v4315)) ;else if (string(v4315)) {
      var v4316 = v4315;
      v4315 = this.$(v4316);
    }
    return v4315.remove();
  }
};
function generateCubicBezier(v4317, v4318, v4319, v4320) {
  var v4321 = 4;
  var v4322 = 0.001;
  var v4323 = 1e-7;
  var v4324 = 10;
  var v4325 = 11;
  var v4326 = 1 / (v4325 - 1);
  var v4327 = typeof Float32Array !== "undefined";
  if (arguments.length !== 4) {
    return false;
  }
  for (var v4328 = 0; v4328 < 4; ++v4328) {
    if (typeof arguments[v4328] !== "number" || isNaN(arguments[v4328]) || !isFinite(arguments[v4328])) {
      return false;
    }
  }
  v4317 = Math.min(v4317, 1);
  v4319 = Math.min(v4319, 1);
  v4317 = Math.max(v4317, 0);
  v4319 = Math.max(v4319, 0);
  var v4329 = v4327 ? new Float32Array(v4325) : new Array(v4325);
  function v4330(v4331, v4332) {
    return 1 - v4332 * 3 + v4331 * 3;
  }
  function v4333(v4334, v4335) {
    return v4335 * 3 - v4334 * 6;
  }
  function v4336(v4337) {
    return v4337 * 3;
  }
  function v4338(v4339, v4340, v4341) {
    return ((v4330(v4340, v4341) * v4339 + v4333(v4340, v4341)) * v4339 + v4336(v4340)) * v4339;
  }
  function v4342(v4343, v4344, v4345) {
    return v4330(v4344, v4345) * 3 * v4343 * v4343 + v4333(v4344, v4345) * 2 * v4343 + v4336(v4344);
  }
  function v4346(v4347, v4348) {
    for (var v4349 = 0; v4349 < v4321; ++v4349) {
      var v4350 = v4342(v4348, v4317, v4319);
      if (v4350 === 0) {
        return v4348;
      }
      var v4351 = v4338(v4348, v4317, v4319) - v4347;
      v4348 -= v4351 / v4350;
    }
    return v4348;
  }
  function v4352() {
    for (var v4353 = 0; v4353 < v4325; ++v4353) {
      v4329[v4353] = v4338(v4353 * v4326, v4317, v4319);
    }
  }
  function v4354(v4355, v4356, v4357) {
    var v4358;
    var v4359;
    var v4360 = 0;
    do {
      v4359 = v4356 + (v4357 - v4356) / 2;
      v4358 = v4338(v4359, v4317, v4319) - v4355;
      if (v4358 > 0) {
        v4357 = v4359;
      } else {
        v4356 = v4359;
      }
    } while (Math.abs(v4358) > v4323 && ++v4360 < v4324);
    return v4359;
  }
  function v4361(v4362) {
    var v4363 = 0;
    var v4364 = 1;
    var v4365 = v4325 - 1;
    for (; v4364 !== v4365 && v4329[v4364] <= v4362; ++v4364) {
      v4363 += v4326;
    }
    --v4364;
    var v4366 = (v4362 - v4329[v4364]) / (v4329[v4364 + 1] - v4329[v4364]);
    var v4367 = v4363 + v4366 * v4326;
    var v4368 = v4342(v4367, v4317, v4319);
    if (v4368 >= v4322) {
      return v4346(v4362, v4367);
    } else if (v4368 === 0) {
      return v4367;
    } else {
      return v4354(v4362, v4363, v4363 + v4326);
    }
  }
  var v4369 = false;
  function v4370() {
    v4369 = true;
    if (v4317 !== v4318 || v4319 !== v4320) {
      v4352();
    }
  }
  var v4371 = function v4372(v4373) {
    if (!v4369) {
      v4370();
    }
    if (v4317 === v4318 && v4319 === v4320) {
      return v4373;
    }
    if (v4373 === 0) {
      return 0;
    }
    if (v4373 === 1) {
      return 1;
    }
    return v4338(v4361(v4373), v4318, v4320);
  };
  v4371.getControlPoints = function () {
    return [{
      x: v4317,
      y: v4318
    }, {
      x: v4319,
      y: v4320
    }];
  };
  var v4374 = "generateBezier(" + [v4317, v4318, v4319, v4320] + ")";
  v4371.toString = function () {
    return v4374;
  };
  return v4371;
}
var generateSpringRK4 = function () {
  function v4375(v4376) {
    return -v4376.tension * v4376.x - v4376.friction * v4376.v;
  }
  function v4377(v4378, v4379, v4380) {
    var v4381 = {
      x: v4378.x + v4380.dx * v4379,
      v: v4378.v + v4380.dv * v4379,
      tension: v4378.tension,
      friction: v4378.friction
    };
    return {
      dx: v4381.v,
      dv: v4375(v4381)
    };
  }
  function v4382(v4383, v4384) {
    var v4385 = {
      dx: v4383.v,
      dv: v4375(v4383)
    };
    var v4386 = v4377(v4383, v4384 * 0.5, v4385);
    var v4387 = v4377(v4383, v4384 * 0.5, v4386);
    var v4388 = v4377(v4383, v4384, v4387);
    var v4389 = 1 / 6 * (v4385.dx + (v4386.dx + v4387.dx) * 2 + v4388.dx);
    var v4390 = 1 / 6 * (v4385.dv + (v4386.dv + v4387.dv) * 2 + v4388.dv);
    v4383.x = v4383.x + v4389 * v4384;
    v4383.v = v4383.v + v4390 * v4384;
    return v4383;
  }
  return function v4391(v4392, v4393, v4394) {
    var v4395 = {
      x: -1,
      v: 0,
      tension: null,
      friction: null
    };
    var v4396 = [0];
    var v4397 = 0;
    var v4398 = 1 / 10000;
    var v4399 = 16 / 1000;
    var v4400;
    var v4401;
    var v4402;
    v4392 = parseFloat(v4392) || 500;
    v4393 = parseFloat(v4393) || 20;
    v4394 = v4394 || null;
    v4395.tension = v4392;
    v4395.friction = v4393;
    v4400 = v4394 !== null;
    if (v4400) {
      v4397 = v4391(v4392, v4393);
      v4401 = v4397 / v4394 * v4399;
    } else {
      v4401 = v4399;
    }
    while (true) {
      v4402 = v4382(v4402 || v4395, v4401);
      v4396.push(1 + v4402.x);
      v4397 += 16;
      if (!(Math.abs(v4402.x) > v4398) || !(Math.abs(v4402.v) > v4398)) {
        break;
      }
    }
    if (!v4400) {
      return v4397;
    } else {
      return function (v4403) {
        return v4396[v4403 * (v4396.length - 1) | 0];
      };
    }
  };
}();
var cubicBezier = function cubicBezier2(v4404, v4405, v4406, v4407) {
  var v4408 = generateCubicBezier(v4404, v4405, v4406, v4407);
  return function (v4409, v4410, v4411) {
    return v4409 + (v4410 - v4409) * v4408(v4411);
  };
};
var easings = {
  linear: function linear(v4412, v4413, v4414) {
    return v4412 + (v4413 - v4412) * v4414;
  },
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  "ease-in": cubicBezier(0.42, 0, 1, 1),
  "ease-out": cubicBezier(0, 0, 0.58, 1),
  "ease-in-out": cubicBezier(0.42, 0, 0.58, 1),
  "ease-in-sine": cubicBezier(0.47, 0, 0.745, 0.715),
  "ease-out-sine": cubicBezier(0.39, 0.575, 0.565, 1),
  "ease-in-out-sine": cubicBezier(0.445, 0.05, 0.55, 0.95),
  "ease-in-quad": cubicBezier(0.55, 0.085, 0.68, 0.53),
  "ease-out-quad": cubicBezier(0.25, 0.46, 0.45, 0.94),
  "ease-in-out-quad": cubicBezier(0.455, 0.03, 0.515, 0.955),
  "ease-in-cubic": cubicBezier(0.55, 0.055, 0.675, 0.19),
  "ease-out-cubic": cubicBezier(0.215, 0.61, 0.355, 1),
  "ease-in-out-cubic": cubicBezier(0.645, 0.045, 0.355, 1),
  "ease-in-quart": cubicBezier(0.895, 0.03, 0.685, 0.22),
  "ease-out-quart": cubicBezier(0.165, 0.84, 0.44, 1),
  "ease-in-out-quart": cubicBezier(0.77, 0, 0.175, 1),
  "ease-in-quint": cubicBezier(0.755, 0.05, 0.855, 0.06),
  "ease-out-quint": cubicBezier(0.23, 1, 0.32, 1),
  "ease-in-out-quint": cubicBezier(0.86, 0, 0.07, 1),
  "ease-in-expo": cubicBezier(0.95, 0.05, 0.795, 0.035),
  "ease-out-expo": cubicBezier(0.19, 1, 0.22, 1),
  "ease-in-out-expo": cubicBezier(1, 0, 0, 1),
  "ease-in-circ": cubicBezier(0.6, 0.04, 0.98, 0.335),
  "ease-out-circ": cubicBezier(0.075, 0.82, 0.165, 1),
  "ease-in-out-circ": cubicBezier(0.785, 0.135, 0.15, 0.86),
  spring: function spring(v4415, v4416, v4417) {
    if (v4417 === 0) {
      return easings.linear;
    }
    var v4418 = generateSpringRK4(v4415, v4416, v4417);
    return function (v4419, v4420, v4421) {
      return v4419 + (v4420 - v4419) * v4418(v4421);
    };
  },
  "cubic-bezier": cubicBezier
};
function getEasedValue(v4422, v4423, v4424, v4425, v4426) {
  if (v4425 === 1) {
    return v4424;
  }
  if (v4423 === v4424) {
    return v4424;
  }
  var v4427 = v4426(v4423, v4424, v4425);
  if (v4422 == null) {
    return v4427;
  }
  if (v4422.roundValue || v4422.color) {
    v4427 = Math.round(v4427);
  }
  if (v4422.min !== undefined) {
    v4427 = Math.max(v4427, v4422.min);
  }
  if (v4422.max !== undefined) {
    v4427 = Math.min(v4427, v4422.max);
  }
  return v4427;
}
function getValue(v4428, v4429) {
  if (v4428.pfValue != null || v4428.value != null) {
    if (v4428.pfValue != null && (v4429 == null || v4429.type.units !== "%")) {
      return v4428.pfValue;
    } else {
      return v4428.value;
    }
  } else {
    return v4428;
  }
}
function ease(v4430, v4431, v4432, v4433, v4434) {
  var v4435 = v4434 != null ? v4434.type : null;
  if (v4432 < 0) {
    v4432 = 0;
  } else if (v4432 > 1) {
    v4432 = 1;
  }
  var v4436 = getValue(v4430, v4434);
  var v4437 = getValue(v4431, v4434);
  if (number$1(v4436) && number$1(v4437)) {
    return getEasedValue(v4435, v4436, v4437, v4432, v4433);
  } else if (array(v4436) && array(v4437)) {
    var v4438 = [];
    for (var v4439 = 0; v4439 < v4437.length; v4439++) {
      var v4440 = v4436[v4439];
      var v4441 = v4437[v4439];
      if (v4440 != null && v4441 != null) {
        var v4442 = getEasedValue(v4435, v4440, v4441, v4432, v4433);
        v4438.push(v4442);
      } else {
        v4438.push(v4441);
      }
    }
    return v4438;
  }
  return undefined;
}
function step$1(v4443, v4444, v4445, v4446) {
  var v4447 = !v4446;
  var v4448 = v4443._private;
  var v4449 = v4444._private;
  var v4450 = v4449.easing;
  var v4451 = v4449.startTime;
  var v4452 = v4446 ? v4443 : v4443.cy();
  var v4453 = v4452.style();
  if (!v4449.easingImpl) {
    if (v4450 == null) {
      v4449.easingImpl = easings.linear;
    } else {
      var v4454;
      if (string(v4450)) {
        var v4455 = v4453.parse("transition-timing-function", v4450);
        v4454 = v4455.value;
      } else {
        v4454 = v4450;
      }
      var v4456;
      var v4457;
      if (string(v4454)) {
        v4456 = v4454;
        v4457 = [];
      } else {
        v4456 = v4454[1];
        v4457 = v4454.slice(2).map(function (v4458) {
          return +v4458;
        });
      }
      if (v4457.length > 0) {
        if (v4456 === "spring") {
          v4457.push(v4449.duration);
        }
        v4449.easingImpl = easings[v4456].apply(null, v4457);
      } else {
        v4449.easingImpl = easings[v4456];
      }
    }
  }
  var v4459 = v4449.easingImpl;
  var v4460;
  if (v4449.duration === 0) {
    v4460 = 1;
  } else {
    v4460 = (v4445 - v4451) / v4449.duration;
  }
  if (v4449.applying) {
    v4460 = v4449.progress;
  }
  if (v4460 < 0) {
    v4460 = 0;
  } else if (v4460 > 1) {
    v4460 = 1;
  }
  if (v4449.delay == null) {
    var v4461 = v4449.startPosition;
    var v4462 = v4449.position;
    if (v4462 && v4447 && !v4443.locked()) {
      var v4463 = {};
      if (valid(v4461.x, v4462.x)) {
        v4463.x = ease(v4461.x, v4462.x, v4460, v4459);
      }
      if (valid(v4461.y, v4462.y)) {
        v4463.y = ease(v4461.y, v4462.y, v4460, v4459);
      }
      v4443.position(v4463);
    }
    var v4464 = v4449.startPan;
    var v4465 = v4449.pan;
    var v4466 = v4448.pan;
    var v4467 = v4465 != null && v4446;
    if (v4467) {
      if (valid(v4464.x, v4465.x)) {
        v4466.x = ease(v4464.x, v4465.x, v4460, v4459);
      }
      if (valid(v4464.y, v4465.y)) {
        v4466.y = ease(v4464.y, v4465.y, v4460, v4459);
      }
      v4443.emit("pan");
    }
    var v4468 = v4449.startZoom;
    var v4469 = v4449.zoom;
    var v4470 = v4469 != null && v4446;
    if (v4470) {
      if (valid(v4468, v4469)) {
        v4448.zoom = bound(v4448.minZoom, ease(v4468, v4469, v4460, v4459), v4448.maxZoom);
      }
      v4443.emit("zoom");
    }
    if (v4467 || v4470) {
      v4443.emit("viewport");
    }
    var v4471 = v4449.style;
    if (v4471 && v4471.length > 0 && v4447) {
      for (var v4472 = 0; v4472 < v4471.length; v4472++) {
        var v4473 = v4471[v4472];
        var v4474 = v4473.name;
        var v4475 = v4473;
        var v4476 = v4449.startStyle[v4474];
        var v4477 = v4453.properties[v4476.name];
        var v4478 = ease(v4476, v4475, v4460, v4459, v4477);
        v4453.overrideBypass(v4443, v4474, v4478);
      }
      v4443.emit("style");
    }
  }
  v4449.progress = v4460;
  return v4460;
}
function valid(v4479, v4480) {
  if (v4479 == null || v4480 == null) {
    return false;
  }
  if (number$1(v4479) && number$1(v4480)) {
    return true;
  } else if (v4479 && v4480) {
    return true;
  }
  return false;
}
function startAnimation(v4481, v4482, v4483, v4484) {
  var v4485 = v4482._private;
  v4485.started = true;
  v4485.startTime = v4483 - v4485.progress * v4485.duration;
}
function stepAll(v4486, v4487) {
  var v4488 = v4487._private.aniEles;
  var v4489 = [];
  function v4490(v4491, v4492) {
    var v4493 = v4491._private;
    var v4494 = v4493.animation.current;
    var v4495 = v4493.animation.queue;
    var v4496 = false;
    if (v4494.length === 0) {
      var v4497 = v4495.shift();
      if (v4497) {
        v4494.push(v4497);
      }
    }
    var v4498 = function v4499(v4500) {
      for (var v4501 = v4500.length - 1; v4501 >= 0; v4501--) {
        var v4502 = v4500[v4501];
        v4502();
      }
      v4500.splice(0, v4500.length);
    };
    for (var v4503 = v4494.length - 1; v4503 >= 0; v4503--) {
      var v4504 = v4494[v4503];
      var v4505 = v4504._private;
      if (v4505.stopped) {
        v4494.splice(v4503, 1);
        v4505.hooked = false;
        v4505.playing = false;
        v4505.started = false;
        v4498(v4505.frames);
        continue;
      }
      if (!v4505.playing && !v4505.applying) {
        continue;
      }
      if (v4505.playing && v4505.applying) {
        v4505.applying = false;
      }
      if (!v4505.started) {
        startAnimation(v4491, v4504, v4486);
      }
      step$1(v4491, v4504, v4486, v4492);
      v4505.applying &&= false;
      v4498(v4505.frames);
      if (v4505.step != null) {
        v4505.step(v4486);
      }
      if (v4504.completed()) {
        v4494.splice(v4503, 1);
        v4505.hooked = false;
        v4505.playing = false;
        v4505.started = false;
        v4498(v4505.completes);
      }
      v4496 = true;
    }
    if (!v4492 && v4494.length === 0 && v4495.length === 0) {
      v4489.push(v4491);
    }
    return v4496;
  }
  var v4506 = false;
  for (var v4507 = 0; v4507 < v4488.length; v4507++) {
    var v4508 = v4488[v4507];
    var v4509 = v4490(v4508);
    v4506 = v4506 || v4509;
  }
  var v4510 = v4490(v4487, true);
  if (v4506 || v4510) {
    if (v4488.length > 0) {
      v4487.notify("draw", v4488);
    } else {
      v4487.notify("draw");
    }
  }
  v4488.unmerge(v4489);
  v4487.emit("step");
}
var corefn$8 = {
  animate: define.animate(),
  animation: define.animation(),
  animated: define.animated(),
  clearQueue: define.clearQueue(),
  delay: define.delay(),
  delayAnimation: define.delayAnimation(),
  stop: define.stop(),
  addToAnimationPool: function addToAnimationPool(v4511) {
    var v4512 = this;
    if (!v4512.styleEnabled()) {
      return;
    }
    v4512._private.aniEles.merge(v4511);
  },
  stopAnimationLoop: function stopAnimationLoop() {
    this._private.animationsRunning = false;
  },
  startAnimationLoop: function startAnimationLoop() {
    var v4513 = this;
    v4513._private.animationsRunning = true;
    if (!v4513.styleEnabled()) {
      return;
    }
    function v4514() {
      if (!v4513._private.animationsRunning) {
        return;
      }
      requestAnimationFrame(function v4515(v4516) {
        stepAll(v4516, v4513);
        v4514();
      });
    }
    var v4517 = v4513.renderer();
    if (v4517 && v4517.beforeRender) {
      v4517.beforeRender(function v4518(v4519, v4520) {
        stepAll(v4520, v4513);
      }, v4517.beforeRenderPriorities.animations);
    } else {
      v4514();
    }
  }
};
var emitterOptions = {
  qualifierCompare: function qualifierCompare3(v4521, v4522) {
    if (v4521 == null || v4522 == null) {
      return v4521 == null && v4522 == null;
    } else {
      return v4521.sameText(v4522);
    }
  },
  eventMatches: function eventMatches3(v4523, v4524, v4525) {
    var v4526 = v4524.qualifier;
    if (v4526 != null) {
      return v4523 !== v4525.target && element(v4525.target) && v4526.matches(v4525.target);
    }
    return true;
  },
  addEventFields: function addEventFields3(v4527, v4528) {
    v4528.cy = v4527;
    v4528.target = v4527;
  },
  callbackContext: function callbackContext3(v4529, v4530, v4531) {
    if (v4530.qualifier != null) {
      return v4531.target;
    } else {
      return v4529;
    }
  }
};
var argSelector2 = function argSelector3(v4532) {
  if (string(v4532)) {
    return new Selector(v4532);
  } else {
    return v4532;
  }
};
var elesfn = {
  createEmitter: function createEmitter2() {
    var v4533 = this._private;
    if (!v4533.emitter) {
      v4533.emitter = new Emitter(emitterOptions, this);
    }
    return this;
  },
  emitter: function emitter2() {
    return this._private.emitter;
  },
  on: function on2(v4534, v4535, v4536) {
    this.emitter().on(v4534, argSelector2(v4535), v4536);
    return this;
  },
  removeListener: function removeListener2(v4537, v4538, v4539) {
    this.emitter().removeListener(v4537, argSelector2(v4538), v4539);
    return this;
  },
  removeAllListeners: function removeAllListeners2() {
    this.emitter().removeAllListeners();
    return this;
  },
  one: function one2(v4540, v4541, v4542) {
    this.emitter().one(v4540, argSelector2(v4541), v4542);
    return this;
  },
  once: function once2(v4543, v4544, v4545) {
    this.emitter().one(v4543, argSelector2(v4544), v4545);
    return this;
  },
  emit: function emit2(v4546, v4547) {
    this.emitter().emit(v4546, v4547);
    return this;
  },
  emitAndNotify: function emitAndNotify2(v4548, v4549) {
    this.emit(v4548);
    this.notify(v4548, v4549);
    return this;
  }
};
define.eventAliasesOn(elesfn);
var corefn$7 = {
  png: function png(v4550) {
    var v4551 = this._private.renderer;
    v4550 = v4550 || {};
    return v4551.png(v4550);
  },
  jpg: function jpg(v4552) {
    var v4553 = this._private.renderer;
    v4552 = v4552 || {};
    v4552.bg = v4552.bg || "#fff";
    return v4553.jpg(v4552);
  }
};
corefn$7.jpeg = corefn$7.jpg;
var corefn$6 = {
  layout: function layout2(v4554) {
    var v4555 = this;
    if (v4554 == null) {
      error("Layout options must be specified to make a layout");
      return;
    }
    if (v4554.name == null) {
      error("A `name` must be specified to make a layout");
      return;
    }
    var v4556 = v4554.name;
    var v4557 = v4555.extension("layout", v4556);
    if (v4557 == null) {
      error("No such layout `" + v4556 + "` found.  Did you forget to import it and `cytoscape.use()` it?");
      return;
    }
    var v4558;
    if (string(v4554.eles)) {
      v4558 = v4555.$(v4554.eles);
    } else {
      v4558 = v4554.eles ?? v4555.$();
    }
    var v4559 = new v4557(extend({}, v4554, {
      cy: v4555,
      eles: v4558
    }));
    return v4559;
  }
};
corefn$6.createLayout = corefn$6.makeLayout = corefn$6.layout;
var corefn$5 = {
  notify: function notify(v4560, v4561) {
    var v4562 = this._private;
    if (this.batching()) {
      v4562.batchNotifications = v4562.batchNotifications || {};
      var v4563 = v4562.batchNotifications[v4560] = v4562.batchNotifications[v4560] || this.collection();
      if (v4561 != null) {
        v4563.merge(v4561);
      }
      return;
    }
    if (!v4562.notificationsEnabled) {
      return;
    }
    var v4564 = this.renderer();
    if (this.destroyed() || !v4564) {
      return;
    }
    v4564.notify(v4560, v4561);
  },
  notifications: function notifications(v4565) {
    var v4566 = this._private;
    if (v4565 === undefined) {
      return v4566.notificationsEnabled;
    } else {
      v4566.notificationsEnabled = v4565 ? true : false;
    }
    return this;
  },
  noNotifications: function noNotifications(v4567) {
    this.notifications(false);
    v4567();
    this.notifications(true);
  },
  batching: function batching() {
    return this._private.batchCount > 0;
  },
  startBatch: function startBatch() {
    var v4568 = this._private;
    if (v4568.batchCount == null) {
      v4568.batchCount = 0;
    }
    if (v4568.batchCount === 0) {
      v4568.batchStyleEles = this.collection();
      v4568.batchNotifications = {};
    }
    v4568.batchCount++;
    return this;
  },
  endBatch: function endBatch() {
    var v4569 = this._private;
    if (v4569.batchCount === 0) {
      return this;
    }
    v4569.batchCount--;
    if (v4569.batchCount === 0) {
      v4569.batchStyleEles.updateStyle();
      var v4570 = this.renderer();
      Object.keys(v4569.batchNotifications).forEach(function (v4571) {
        var v4572 = v4569.batchNotifications[v4571];
        if (v4572.empty()) {
          v4570.notify(v4571);
        } else {
          v4570.notify(v4571, v4572);
        }
      });
    }
    return this;
  },
  batch: function batch(v4573) {
    this.startBatch();
    v4573();
    this.endBatch();
    return this;
  },
  batchData: function batchData(v4574) {
    var v4575 = this;
    return this.batch(function () {
      var v4576 = Object.keys(v4574);
      for (var v4577 = 0; v4577 < v4576.length; v4577++) {
        var v4578 = v4576[v4577];
        var v4579 = v4574[v4578];
        var v4580 = v4575.getElementById(v4578);
        v4580.data(v4579);
      }
    });
  }
};
var rendererDefaults = defaults$g({
  hideEdgesOnViewport: false,
  textureOnViewport: false,
  motionBlur: false,
  motionBlurOpacity: 0.05,
  pixelRatio: undefined,
  desktopTapThreshold: 4,
  touchTapThreshold: 8,
  wheelSensitivity: 1,
  debug: false,
  showFps: false,
  webgl: false,
  webglDebug: false,
  webglDebugShowAtlases: false,
  webglTexSize: 2048,
  webglTexRows: 36,
  webglTexRowsNodes: 18,
  webglBatchSize: 2048,
  webglTexPerBatch: 14,
  webglBgColor: [255, 255, 255]
});
var corefn$4 = {
  renderTo: function renderTo(v4581, v4582, v4583, v4584) {
    var v4585 = this._private.renderer;
    v4585.renderTo(v4581, v4582, v4583, v4584);
    return this;
  },
  renderer: function renderer() {
    return this._private.renderer;
  },
  forceRender: function forceRender() {
    this.notify("draw");
    return this;
  },
  resize: function resize() {
    this.invalidateSize();
    this.emitAndNotify("resize");
    return this;
  },
  initRenderer: function initRenderer(v4586) {
    var v4587 = this;
    var v4588 = v4587.extension("renderer", v4586.name);
    if (v4588 == null) {
      error(`Can not initialise: No such renderer \`${v4586.name}\` found. Did you forget to import it and \`cytoscape.use()\` it?`);
      return;
    }
    if (v4586.wheelSensitivity !== undefined) {
      warn("You have set a custom wheel sensitivity.  This will make your app zoom unnaturally when using mainstream mice.  You should change this value from the default only if you can guarantee that all your users will use the same hardware and OS configuration as your current machine.");
    }
    var v4589 = rendererDefaults(v4586);
    v4589.cy = v4587;
    v4587._private.renderer = new v4588(v4589);
    this.notify("init");
  },
  destroyRenderer: function destroyRenderer() {
    var v4590 = this;
    v4590.notify("destroy");
    var v4591 = v4590.container();
    if (v4591) {
      v4591._cyreg = null;
      while (v4591.childNodes.length > 0) {
        v4591.removeChild(v4591.childNodes[0]);
      }
    }
    v4590._private.renderer = null;
    v4590.mutableElements().forEach(function (v4592) {
      var v4593 = v4592._private;
      v4593.rscratch = {};
      v4593.rstyle = {};
      v4593.animation.current = [];
      v4593.animation.queue = [];
    });
  },
  onRender: function onRender(v4594) {
    return this.on("render", v4594);
  },
  offRender: function offRender(v4595) {
    return this.off("render", v4595);
  }
};
corefn$4.invalidateDimensions = corefn$4.resize;
var corefn$3 = {
  collection: function collection3(v4596, v4597) {
    if (string(v4596)) {
      return this.$(v4596);
    } else if (elementOrCollection(v4596)) {
      return v4596.collection();
    } else if (array(v4596)) {
      if (!v4597) {
        v4597 = {};
      }
      return new Collection(this, v4596, v4597.unique, v4597.removed);
    }
    return new Collection(this);
  },
  nodes: function nodes2(v4598) {
    var v4599 = this.$(function (v4600) {
      return v4600.isNode();
    });
    if (v4598) {
      return v4599.filter(v4598);
    }
    return v4599;
  },
  edges: function edges2(v4601) {
    var v4602 = this.$(function (v4603) {
      return v4603.isEdge();
    });
    if (v4601) {
      return v4602.filter(v4601);
    }
    return v4602;
  },
  $: function $(v4604) {
    var v4605 = this._private.elements;
    if (v4604) {
      return v4605.filter(v4604);
    } else {
      return v4605.spawnSelf();
    }
  },
  mutableElements: function mutableElements() {
    return this._private.elements;
  }
};
corefn$3.elements = corefn$3.filter = corefn$3.$;
var styfn$8 = {};
var TRUE = "t";
var FALSE = "f";
styfn$8.apply = function (v4606) {
  var v4607 = this;
  var v4608 = v4607._private;
  var v4609 = v4608.cy;
  var v4610 = v4609.collection();
  for (var v4611 = 0; v4611 < v4606.length; v4611++) {
    var v4612 = v4606[v4611];
    var v4613 = v4607.getContextMeta(v4612);
    if (v4613.empty) {
      continue;
    }
    var v4614 = v4607.getContextStyle(v4613);
    var v4615 = v4607.applyContextStyle(v4613, v4614, v4612);
    if (v4612._private.appliedInitStyle) {
      v4607.updateTransitions(v4612, v4615.diffProps);
    } else {
      v4612._private.appliedInitStyle = true;
    }
    var v4616 = v4607.updateStyleHints(v4612);
    if (v4616) {
      v4610.push(v4612);
    }
  }
  return v4610;
};
styfn$8.getPropertiesDiff = function (v4617, v4618) {
  var v4619 = this;
  var v4620 = v4619._private.propDiffs = v4619._private.propDiffs || {};
  var v4621 = v4617 + "-" + v4618;
  var v4622 = v4620[v4621];
  if (v4622) {
    return v4622;
  }
  var v4623 = [];
  var v4624 = {};
  for (var v4625 = 0; v4625 < v4619.length; v4625++) {
    var v4626 = v4619[v4625];
    var v4627 = v4617[v4625] === TRUE;
    var v4628 = v4618[v4625] === TRUE;
    var v4629 = v4627 !== v4628;
    var v4630 = v4626.mappedProperties.length > 0;
    if (v4629 || v4628 && v4630) {
      var v4631 = undefined;
      if (v4629 && v4630) {
        v4631 = v4626.properties;
      } else if (v4629) {
        v4631 = v4626.properties;
      } else if (v4630) {
        v4631 = v4626.mappedProperties;
      }
      for (var v4632 = 0; v4632 < v4631.length; v4632++) {
        var v4633 = v4631[v4632];
        var v4634 = v4633.name;
        var v4635 = false;
        for (var v4636 = v4625 + 1; v4636 < v4619.length; v4636++) {
          var v4637 = v4619[v4636];
          var v4638 = v4618[v4636] === TRUE;
          if (!v4638) {
            continue;
          }
          v4635 = v4637.properties[v4633.name] != null;
          if (v4635) {
            break;
          }
        }
        if (!v4624[v4634] && !v4635) {
          v4624[v4634] = true;
          v4623.push(v4634);
        }
      }
    }
  }
  v4620[v4621] = v4623;
  return v4623;
};
styfn$8.getContextMeta = function (v4639) {
  var v4640 = this;
  var v4641 = "";
  var v4642;
  var v4643 = v4639._private.styleCxtKey || "";
  for (var v4644 = 0; v4644 < v4640.length; v4644++) {
    var v4645 = v4640[v4644];
    var v4646 = v4645.selector && v4645.selector.matches(v4639);
    if (v4646) {
      v4641 += TRUE;
    } else {
      v4641 += FALSE;
    }
  }
  v4642 = v4640.getPropertiesDiff(v4643, v4641);
  v4639._private.styleCxtKey = v4641;
  return {
    key: v4641,
    diffPropNames: v4642,
    empty: v4642.length === 0
  };
};
styfn$8.getContextStyle = function (v4647) {
  var v4648 = v4647.key;
  var v4649 = this;
  var v4650 = this._private.contextStyles = this._private.contextStyles || {};
  if (v4650[v4648]) {
    return v4650[v4648];
  }
  var v4651 = {
    _private: {
      key: v4648
    }
  };
  for (var v4652 = 0; v4652 < v4649.length; v4652++) {
    var v4653 = v4649[v4652];
    var v4654 = v4648[v4652] === TRUE;
    if (!v4654) {
      continue;
    }
    for (var v4655 = 0; v4655 < v4653.properties.length; v4655++) {
      var v4656 = v4653.properties[v4655];
      v4651[v4656.name] = v4656;
    }
  }
  v4650[v4648] = v4651;
  return v4651;
};
styfn$8.applyContextStyle = function (v4657, v4658, v4659) {
  var v4660 = this;
  var v4661 = v4657.diffPropNames;
  var v4662 = {};
  var v4663 = v4660.types;
  for (var v4664 = 0; v4664 < v4661.length; v4664++) {
    var v4665 = v4661[v4664];
    var v4666 = v4658[v4665];
    var v4667 = v4659.pstyle(v4665);
    if (!v4666) {
      if (!v4667) {
        continue;
      } else if (v4667.bypass) {
        v4666 = {
          name: v4665,
          deleteBypassed: true
        };
      } else {
        v4666 = {
          name: v4665,
          delete: true
        };
      }
    }
    if (v4667 === v4666) {
      continue;
    }
    if (v4666.mapped === v4663.fn && v4667 != null && v4667.mapping != null && v4667.mapping.value === v4666.value) {
      var v4668 = v4667.mapping;
      var v4669 = v4668.fnValue = v4666.value(v4659);
      if (v4669 === v4668.prevFnValue) {
        continue;
      }
    }
    var v4670 = v4662[v4665] = {
      prev: v4667
    };
    v4660.applyParsedProperty(v4659, v4666);
    v4670.next = v4659.pstyle(v4665);
    if (v4670.next && v4670.next.bypass) {
      v4670.next = v4670.next.bypassed;
    }
  }
  return {
    diffProps: v4662
  };
};
styfn$8.updateStyleHints = function (v4671) {
  var v4672 = v4671._private;
  var v4673 = this;
  var v4674 = v4673.propertyGroupNames;
  var v4675 = v4673.propertyGroupKeys;
  var v4676 = function v4677(v4678, v4679, v4680) {
    return v4673.getPropertiesHash(v4678, v4679, v4680);
  };
  var v4681 = v4672.styleKey;
  if (v4671.removed()) {
    return false;
  }
  var v4682 = v4672.group === "nodes";
  var v4683 = v4671._private.style;
  v4674 = Object.keys(v4683);
  for (var v4684 = 0; v4684 < v4675.length; v4684++) {
    var v4685 = v4675[v4684];
    v4672.styleKeys[v4685] = [DEFAULT_HASH_SEED, DEFAULT_HASH_SEED_ALT];
  }
  var v4686 = function v4687(v4688, v4689) {
    return v4672.styleKeys[v4689][0] = hashInt(v4688, v4672.styleKeys[v4689][0]);
  };
  var v4690 = function v4691(v4692, v4693) {
    return v4672.styleKeys[v4693][1] = hashIntAlt(v4692, v4672.styleKeys[v4693][1]);
  };
  var v4694 = function v4695(v4696, v4697) {
    v4686(v4696, v4697);
    v4690(v4696, v4697);
  };
  var v4698 = function v4699(v4700, v4701) {
    for (var v4702 = 0; v4702 < v4700.length; v4702++) {
      var v4703 = v4700.charCodeAt(v4702);
      v4686(v4703, v4701);
      v4690(v4703, v4701);
    }
  };
  var v4704 = 2000000000;
  var v4705 = function v4706(v4707) {
    if (v4707 > -128 && v4707 < 128 && Math.floor(v4707) !== v4707) {
      return v4704 - (v4707 * 1024 | 0);
    } else {
      return v4707;
    }
  };
  for (var v4708 = 0; v4708 < v4674.length; v4708++) {
    var v4709 = v4674[v4708];
    var v4710 = v4683[v4709];
    if (v4710 == null) {
      continue;
    }
    var v4711 = this.properties[v4709];
    var v4712 = v4711.type;
    var v4713 = v4711.groupKey;
    var v4714 = undefined;
    if (v4711.hashOverride != null) {
      v4714 = v4711.hashOverride(v4671, v4710);
    } else if (v4710.pfValue != null) {
      v4714 = v4710.pfValue;
    }
    var v4715 = v4711.enums == null ? v4710.value : null;
    var v4716 = v4714 != null;
    var v4717 = v4715 != null;
    var v4718 = v4716 || v4717;
    var v4719 = v4710.units;
    if (v4712.number && v4718 && !v4712.multiple) {
      var v4720 = v4716 ? v4714 : v4715;
      v4694(v4705(v4720), v4713);
      if (!v4716 && v4719 != null) {
        v4698(v4719, v4713);
      }
    } else {
      v4698(v4710.strValue, v4713);
    }
  }
  var v4721 = [DEFAULT_HASH_SEED, DEFAULT_HASH_SEED_ALT];
  for (var v4722 = 0; v4722 < v4675.length; v4722++) {
    var v4723 = v4675[v4722];
    var v4724 = v4672.styleKeys[v4723];
    v4721[0] = hashInt(v4724[0], v4721[0]);
    v4721[1] = hashIntAlt(v4724[1], v4721[1]);
  }
  v4672.styleKey = combineHashes(v4721[0], v4721[1]);
  var v4725 = v4672.styleKeys;
  v4672.labelDimsKey = combineHashesArray(v4725.labelDimensions);
  var v4726 = v4676(v4671, ["label"], v4725.labelDimensions);
  v4672.labelKey = combineHashesArray(v4726);
  v4672.labelStyleKey = combineHashesArray(hashArrays(v4725.commonLabel, v4726));
  if (!v4682) {
    var v4727 = v4676(v4671, ["source-label"], v4725.labelDimensions);
    v4672.sourceLabelKey = combineHashesArray(v4727);
    v4672.sourceLabelStyleKey = combineHashesArray(hashArrays(v4725.commonLabel, v4727));
    var v4728 = v4676(v4671, ["target-label"], v4725.labelDimensions);
    v4672.targetLabelKey = combineHashesArray(v4728);
    v4672.targetLabelStyleKey = combineHashesArray(hashArrays(v4725.commonLabel, v4728));
  }
  if (v4682) {
    var v4729 = v4672.styleKeys;
    var v4730 = v4729.nodeBody;
    var v4731 = v4729.nodeBorder;
    var v4732 = v4729.nodeOutline;
    var v4733 = v4729.backgroundImage;
    var v4734 = v4729.compound;
    var v4735 = v4729.pie;
    var v4736 = v4729.stripe;
    var v4737 = [v4730, v4731, v4732, v4733, v4734, v4735, v4736].filter(function (v4738) {
      return v4738 != null;
    }).reduce(hashArrays, [DEFAULT_HASH_SEED, DEFAULT_HASH_SEED_ALT]);
    v4672.nodeKey = combineHashesArray(v4737);
    v4672.hasPie = v4735 != null && v4735[0] !== DEFAULT_HASH_SEED && v4735[1] !== DEFAULT_HASH_SEED_ALT;
    v4672.hasStripe = v4736 != null && v4736[0] !== DEFAULT_HASH_SEED && v4736[1] !== DEFAULT_HASH_SEED_ALT;
  }
  return v4681 !== v4672.styleKey;
};
styfn$8.clearStyleHints = function (v4739) {
  var v4740 = v4739._private;
  v4740.styleCxtKey = "";
  v4740.styleKeys = {};
  v4740.styleKey = null;
  v4740.labelKey = null;
  v4740.labelStyleKey = null;
  v4740.sourceLabelKey = null;
  v4740.sourceLabelStyleKey = null;
  v4740.targetLabelKey = null;
  v4740.targetLabelStyleKey = null;
  v4740.nodeKey = null;
  v4740.hasPie = null;
  v4740.hasStripe = null;
};
styfn$8.applyParsedProperty = function (v4741, v4742) {
  var v4743 = this;
  var v4744 = v4742;
  var v4745 = v4741._private.style;
  var v4746;
  var v4747 = v4743.types;
  var v4748 = v4743.properties[v4744.name].type;
  var v4749 = v4744.bypass;
  var v4750 = v4745[v4744.name];
  var v4751 = v4750 && v4750.bypass;
  var v4752 = v4741._private;
  var v4753 = "mapping";
  var v4754 = function v4755(v4756) {
    if (v4756 == null) {
      return null;
    } else {
      return v4756.pfValue ?? v4756.value;
    }
  };
  var v4757 = function v4758() {
    var v4759 = v4754(v4750);
    var v4760 = v4754(v4744);
    v4743.checkTriggers(v4741, v4744.name, v4759, v4760);
  };
  if (v4742.name === "curve-style" && v4741.isEdge() && (v4742.value !== "bezier" && v4741.isLoop() || v4742.value === "haystack" && (v4741.source().isParent() || v4741.target().isParent()))) {
    v4744 = v4742 = this.parse(v4742.name, "bezier", v4749);
  }
  if (v4744.delete) {
    v4745[v4744.name] = undefined;
    v4757();
    return true;
  }
  if (v4744.deleteBypassed) {
    if (!v4750) {
      v4757();
      return true;
    } else if (v4750.bypass) {
      v4750.bypassed = undefined;
      v4757();
      return true;
    } else {
      return false;
    }
  }
  if (v4744.deleteBypass) {
    if (!v4750) {
      v4757();
      return true;
    } else if (v4750.bypass) {
      v4745[v4744.name] = v4750.bypassed;
      v4757();
      return true;
    } else {
      return false;
    }
  }
  var v4761 = function v4762() {
    warn("Do not assign mappings to elements without corresponding data (i.e. ele `" + v4741.id() + "` has no mapping for property `" + v4744.name + "` with data field `" + v4744.field + "`); try a `[" + v4744.field + "]` selector to limit scope to elements with `" + v4744.field + "` defined");
  };
  switch (v4744.mapped) {
    case v4747.mapData:
      {
        var v4763 = v4744.field.split(".");
        var v4764 = v4752.data;
        for (var v4765 = 0; v4765 < v4763.length && v4764; v4765++) {
          var v4766 = v4763[v4765];
          v4764 = v4764[v4766];
        }
        if (v4764 == null) {
          v4761();
          return false;
        }
        var v4767;
        if (!number$1(v4764)) {
          warn("Do not use continuous mappers without specifying numeric data (i.e. `" + v4744.field + ": " + v4764 + "` for `" + v4741.id() + "` is non-numeric)");
          return false;
        } else {
          var v4768 = v4744.fieldMax - v4744.fieldMin;
          if (v4768 === 0) {
            v4767 = 0;
          } else {
            v4767 = (v4764 - v4744.fieldMin) / v4768;
          }
        }
        if (v4767 < 0) {
          v4767 = 0;
        } else if (v4767 > 1) {
          v4767 = 1;
        }
        if (v4748.color) {
          var v4769 = v4744.valueMin[0];
          var v4770 = v4744.valueMax[0];
          var v4771 = v4744.valueMin[1];
          var v4772 = v4744.valueMax[1];
          var v4773 = v4744.valueMin[2];
          var v4774 = v4744.valueMax[2];
          var v4775 = v4744.valueMin[3] == null ? 1 : v4744.valueMin[3];
          var v4776 = v4744.valueMax[3] == null ? 1 : v4744.valueMax[3];
          var v4777 = [Math.round(v4769 + (v4770 - v4769) * v4767), Math.round(v4771 + (v4772 - v4771) * v4767), Math.round(v4773 + (v4774 - v4773) * v4767), Math.round(v4775 + (v4776 - v4775) * v4767)];
          v4746 = {
            bypass: v4744.bypass,
            name: v4744.name,
            value: v4777,
            strValue: "rgb(" + v4777[0] + ", " + v4777[1] + ", " + v4777[2] + ")"
          };
        } else if (v4748.number) {
          var v4778 = v4744.valueMin + (v4744.valueMax - v4744.valueMin) * v4767;
          v4746 = this.parse(v4744.name, v4778, v4744.bypass, v4753);
        } else {
          return false;
        }
        if (!v4746) {
          v4761();
          return false;
        }
        v4746.mapping = v4744;
        v4744 = v4746;
        break;
      }
    case v4747.data:
      {
        var v4779 = v4744.field.split(".");
        var v4780 = v4752.data;
        for (var v4781 = 0; v4781 < v4779.length && v4780; v4781++) {
          var v4782 = v4779[v4781];
          v4780 = v4780[v4782];
        }
        if (v4780 != null) {
          v4746 = this.parse(v4744.name, v4780, v4744.bypass, v4753);
        }
        if (!v4746) {
          v4761();
          return false;
        }
        v4746.mapping = v4744;
        v4744 = v4746;
        break;
      }
    case v4747.fn:
      {
        var v4783 = v4744.value;
        var v4784 = v4744.fnValue ?? v4783(v4741);
        v4744.prevFnValue = v4784;
        if (v4784 == null) {
          warn("Custom function mappers may not return null (i.e. `" + v4744.name + "` for ele `" + v4741.id() + "` is null)");
          return false;
        }
        v4746 = this.parse(v4744.name, v4784, v4744.bypass, v4753);
        if (!v4746) {
          warn("Custom function mappers may not return invalid values for the property type (i.e. `" + v4744.name + "` for ele `" + v4741.id() + "` is invalid)");
          return false;
        }
        v4746.mapping = copy(v4744);
        v4744 = v4746;
        break;
      }
    case undefined:
      break;
    default:
      return false;
  }
  if (v4749) {
    if (v4751) {
      v4744.bypassed = v4750.bypassed;
    } else {
      v4744.bypassed = v4750;
    }
    v4745[v4744.name] = v4744;
  } else if (v4751) {
    v4750.bypassed = v4744;
  } else {
    v4745[v4744.name] = v4744;
  }
  v4757();
  return true;
};
styfn$8.cleanElements = function (v4785, v4786) {
  for (var v4787 = 0; v4787 < v4785.length; v4787++) {
    var v4788 = v4785[v4787];
    this.clearStyleHints(v4788);
    v4788.dirtyCompoundBoundsCache();
    v4788.dirtyBoundingBoxCache();
    if (!v4786) {
      v4788._private.style = {};
    } else {
      var v4789 = v4788._private.style;
      var v4790 = Object.keys(v4789);
      for (var v4791 = 0; v4791 < v4790.length; v4791++) {
        var v4792 = v4790[v4791];
        var v4793 = v4789[v4792];
        if (v4793 != null) {
          if (v4793.bypass) {
            v4793.bypassed = null;
          } else {
            v4789[v4792] = null;
          }
        }
      }
    }
  }
};
styfn$8.update = function () {
  var v4794 = this._private.cy;
  var v4795 = v4794.mutableElements();
  v4795.updateStyle();
};
styfn$8.updateTransitions = function (v4796, v4797) {
  var v4798 = this;
  var v4799 = v4796._private;
  var v4800 = v4796.pstyle("transition-property").value;
  var v4801 = v4796.pstyle("transition-duration").pfValue;
  var v4802 = v4796.pstyle("transition-delay").pfValue;
  if (v4800.length > 0 && v4801 > 0) {
    var v4803 = {};
    var v4804 = false;
    for (var v4805 = 0; v4805 < v4800.length; v4805++) {
      var v4806 = v4800[v4805];
      var v4807 = v4796.pstyle(v4806);
      var v4808 = v4797[v4806];
      if (!v4808) {
        continue;
      }
      var v4809 = v4808.prev;
      var v4810 = v4809;
      var v4811 = v4808.next ?? v4807;
      var v4812 = false;
      var v4813 = undefined;
      var v4814 = 0.000001;
      if (!v4810) {
        continue;
      }
      if (number$1(v4810.pfValue) && number$1(v4811.pfValue)) {
        v4812 = v4811.pfValue - v4810.pfValue;
        v4813 = v4810.pfValue + v4814 * v4812;
      } else if (number$1(v4810.value) && number$1(v4811.value)) {
        v4812 = v4811.value - v4810.value;
        v4813 = v4810.value + v4814 * v4812;
      } else if (array(v4810.value) && array(v4811.value)) {
        v4812 = v4810.value[0] !== v4811.value[0] || v4810.value[1] !== v4811.value[1] || v4810.value[2] !== v4811.value[2];
        v4813 = v4810.strValue;
      }
      if (v4812) {
        v4803[v4806] = v4811.strValue;
        this.applyBypass(v4796, v4806, v4813);
        v4804 = true;
      }
    }
    if (!v4804) {
      return;
    }
    v4799.transitioning = true;
    new Promise$1(function (v4815) {
      if (v4802 > 0) {
        v4796.delayAnimation(v4802).play().promise().then(v4815);
      } else {
        v4815();
      }
    }).then(function () {
      return v4796.animation({
        style: v4803,
        duration: v4801,
        easing: v4796.pstyle("transition-timing-function").value,
        queue: false
      }).play().promise();
    }).then(function () {
      v4798.removeBypasses(v4796, v4800);
      v4796.emitAndNotify("style");
      v4799.transitioning = false;
    });
  } else if (v4799.transitioning) {
    this.removeBypasses(v4796, v4800);
    v4796.emitAndNotify("style");
    v4799.transitioning = false;
  }
};
styfn$8.checkTrigger = function (v4816, v4817, v4818, v4819, v4820, v4821) {
  var v4822 = this.properties[v4817];
  var v4823 = v4820(v4822);
  if (v4816.removed()) {
    return;
  }
  if (v4823 != null && v4823(v4818, v4819, v4816)) {
    v4821(v4822);
  }
};
styfn$8.checkZOrderTrigger = function (v4824, v4825, v4826, v4827) {
  var v4828 = this;
  this.checkTrigger(v4824, v4825, v4826, v4827, function (v4829) {
    return v4829.triggersZOrder;
  }, function () {
    v4828._private.cy.notify("zorder", v4824);
  });
};
styfn$8.checkBoundsTrigger = function (v4830, v4831, v4832, v4833) {
  this.checkTrigger(v4830, v4831, v4832, v4833, function (v4834) {
    return v4834.triggersBounds;
  }, function (v4835) {
    v4830.dirtyCompoundBoundsCache();
    v4830.dirtyBoundingBoxCache();
  });
};
styfn$8.checkConnectedEdgesBoundsTrigger = function (v4836, v4837, v4838, v4839) {
  this.checkTrigger(v4836, v4837, v4838, v4839, function (v4840) {
    return v4840.triggersBoundsOfConnectedEdges;
  }, function (v4841) {
    v4836.connectedEdges().forEach(function (v4842) {
      v4842.dirtyBoundingBoxCache();
    });
  });
};
styfn$8.checkParallelEdgesBoundsTrigger = function (v4843, v4844, v4845, v4846) {
  this.checkTrigger(v4843, v4844, v4845, v4846, function (v4847) {
    return v4847.triggersBoundsOfParallelEdges;
  }, function (v4848) {
    v4843.parallelEdges().forEach(function (v4849) {
      v4849.dirtyBoundingBoxCache();
    });
  });
};
styfn$8.checkTriggers = function (v4850, v4851, v4852, v4853) {
  v4850.dirtyStyleCache();
  this.checkZOrderTrigger(v4850, v4851, v4852, v4853);
  this.checkBoundsTrigger(v4850, v4851, v4852, v4853);
  this.checkConnectedEdgesBoundsTrigger(v4850, v4851, v4852, v4853);
  this.checkParallelEdgesBoundsTrigger(v4850, v4851, v4852, v4853);
};
var styfn$7 = {};
styfn$7.applyBypass = function (v4854, v4855, v4856, v4857) {
  var v4858 = this;
  var v4859 = [];
  var v4860 = true;
  if (v4855 === "*" || v4855 === "**") {
    if (v4856 !== undefined) {
      for (var v4861 = 0; v4861 < v4858.properties.length; v4861++) {
        var v4862 = v4858.properties[v4861];
        var v4863 = v4862.name;
        var v4864 = this.parse(v4863, v4856, true);
        if (v4864) {
          v4859.push(v4864);
        }
      }
    }
  } else if (string(v4855)) {
    var v4865 = this.parse(v4855, v4856, true);
    if (v4865) {
      v4859.push(v4865);
    }
  } else if (plainObject(v4855)) {
    var v4866 = v4855;
    v4857 = v4856;
    var v4867 = Object.keys(v4866);
    for (var v4868 = 0; v4868 < v4867.length; v4868++) {
      var v4869 = v4867[v4868];
      var v4870 = v4866[v4869];
      if (v4870 === undefined) {
        v4870 = v4866[dash2camel(v4869)];
      }
      if (v4870 !== undefined) {
        var v4871 = this.parse(v4869, v4870, true);
        if (v4871) {
          v4859.push(v4871);
        }
      }
    }
  } else {
    return false;
  }
  if (v4859.length === 0) {
    return false;
  }
  var v4872 = false;
  for (var v4873 = 0; v4873 < v4854.length; v4873++) {
    var v4874 = v4854[v4873];
    var v4875 = {};
    var v4876 = undefined;
    for (var v4877 = 0; v4877 < v4859.length; v4877++) {
      var v4878 = v4859[v4877];
      if (v4857) {
        var v4879 = v4874.pstyle(v4878.name);
        v4876 = v4875[v4878.name] = {
          prev: v4879
        };
      }
      v4872 = this.applyParsedProperty(v4874, copy(v4878)) || v4872;
      if (v4857) {
        v4876.next = v4874.pstyle(v4878.name);
      }
    }
    if (v4872) {
      this.updateStyleHints(v4874);
    }
    if (v4857) {
      this.updateTransitions(v4874, v4875, v4860);
    }
  }
  return v4872;
};
styfn$7.overrideBypass = function (v4880, v4881, v4882) {
  v4881 = camel2dash(v4881);
  for (var v4883 = 0; v4883 < v4880.length; v4883++) {
    var v4884 = v4880[v4883];
    var v4885 = v4884._private.style[v4881];
    var v4886 = this.properties[v4881].type;
    var v4887 = v4886.color;
    var v4888 = v4886.mutiple;
    var v4889 = !v4885 ? null : v4885.pfValue ?? v4885.value;
    if (!v4885 || !v4885.bypass) {
      this.applyBypass(v4884, v4881, v4882);
    } else {
      v4885.value = v4882;
      if (v4885.pfValue != null) {
        v4885.pfValue = v4882;
      }
      if (v4887) {
        v4885.strValue = "rgb(" + v4882.join(",") + ")";
      } else if (v4888) {
        v4885.strValue = v4882.join(" ");
      } else {
        v4885.strValue = "" + v4882;
      }
      this.updateStyleHints(v4884);
    }
    this.checkTriggers(v4884, v4881, v4889, v4882);
  }
};
styfn$7.removeAllBypasses = function (v4890, v4891) {
  return this.removeBypasses(v4890, this.propertyNames, v4891);
};
styfn$7.removeBypasses = function (v4892, v4893, v4894) {
  var v4895 = true;
  for (var v4896 = 0; v4896 < v4892.length; v4896++) {
    var v4897 = v4892[v4896];
    var v4898 = {};
    for (var v4899 = 0; v4899 < v4893.length; v4899++) {
      var v4900 = v4893[v4899];
      var v4901 = this.properties[v4900];
      var v4902 = v4897.pstyle(v4901.name);
      if (!v4902 || !v4902.bypass) {
        continue;
      }
      var v4903 = "";
      var v4904 = this.parse(v4900, v4903, true);
      var v4905 = v4898[v4901.name] = {
        prev: v4902
      };
      this.applyParsedProperty(v4897, v4904);
      v4905.next = v4897.pstyle(v4901.name);
    }
    this.updateStyleHints(v4897);
    if (v4894) {
      this.updateTransitions(v4897, v4898, v4895);
    }
  }
};
var styfn$6 = {};
styfn$6.getEmSizeInPixels = function () {
  var v4906 = this.containerCss("font-size");
  if (v4906 != null) {
    return parseFloat(v4906);
  } else {
    return 1;
  }
};
styfn$6.containerCss = function (v4907) {
  var v4908 = this._private.cy;
  var v4909 = v4908.container();
  var v4910 = v4908.window();
  if (v4910 && v4909 && v4910.getComputedStyle) {
    return v4910.getComputedStyle(v4909).getPropertyValue(v4907);
  }
};
var styfn$5 = {};
styfn$5.getRenderedStyle = function (v4911, v4912) {
  if (v4912) {
    return this.getStylePropertyValue(v4911, v4912, true);
  } else {
    return this.getRawStyle(v4911, true);
  }
};
styfn$5.getRawStyle = function (v4913, v4914) {
  var v4915 = this;
  v4913 = v4913[0];
  if (v4913) {
    var v4916 = {};
    for (var v4917 = 0; v4917 < v4915.properties.length; v4917++) {
      var v4918 = v4915.properties[v4917];
      var v4919 = v4915.getStylePropertyValue(v4913, v4918.name, v4914);
      if (v4919 != null) {
        v4916[v4918.name] = v4919;
        v4916[dash2camel(v4918.name)] = v4919;
      }
    }
    return v4916;
  }
};
styfn$5.getIndexedStyle = function (v4920, v4921, v4922, v4923) {
  var v4924 = v4920.pstyle(v4921)[v4922][v4923];
  return v4924 ?? v4920.cy().style().getDefaultProperty(v4921)[v4922][0];
};
styfn$5.getStylePropertyValue = function (v4925, v4926, v4927) {
  var v4928 = this;
  v4925 = v4925[0];
  if (v4925) {
    var v4929 = v4928.properties[v4926];
    if (v4929.alias) {
      v4929 = v4929.pointsTo;
    }
    var v4930 = v4929.type;
    var v4931 = v4925.pstyle(v4929.name);
    if (v4931) {
      var v4932 = v4931.value;
      var v4933 = v4931.units;
      var v4934 = v4931.strValue;
      if (v4927 && v4930.number && v4932 != null && number$1(v4932)) {
        var v4935 = v4925.cy().zoom();
        var v4936 = function v4937(v4938) {
          return v4938 * v4935;
        };
        var v4939 = function v4940(v4941, v4942) {
          return v4936(v4941) + v4942;
        };
        var v4943 = array(v4932);
        var v4944 = v4943 ? v4933.every(function (v4945) {
          return v4945 != null;
        }) : v4933 != null;
        if (v4944) {
          if (v4943) {
            return v4932.map(function (v4946, v4947) {
              return v4939(v4946, v4933[v4947]);
            }).join(" ");
          } else {
            return v4939(v4932, v4933);
          }
        } else if (v4943) {
          return v4932.map(function (v4948) {
            if (string(v4948)) {
              return v4948;
            } else {
              return "" + v4936(v4948);
            }
          }).join(" ");
        } else {
          return "" + v4936(v4932);
        }
      } else if (v4934 != null) {
        return v4934;
      }
    }
    return null;
  }
};
styfn$5.getAnimationStartStyle = function (v4949, v4950) {
  var v4951 = {};
  for (var v4952 = 0; v4952 < v4950.length; v4952++) {
    var v4953 = v4950[v4952];
    var v4954 = v4953.name;
    var v4955 = v4949.pstyle(v4954);
    if (v4955 !== undefined) {
      if (plainObject(v4955)) {
        v4955 = this.parse(v4954, v4955.strValue);
      } else {
        v4955 = this.parse(v4954, v4955);
      }
    }
    if (v4955) {
      v4951[v4954] = v4955;
    }
  }
  return v4951;
};
styfn$5.getPropsList = function (v4956) {
  var v4957 = this;
  var v4958 = [];
  var v4959 = v4956;
  var v4960 = v4957.properties;
  if (v4959) {
    var v4961 = Object.keys(v4959);
    for (var v4962 = 0; v4962 < v4961.length; v4962++) {
      var v4963 = v4961[v4962];
      var v4964 = v4959[v4963];
      var v4965 = v4960[v4963] || v4960[camel2dash(v4963)];
      var v4966 = this.parse(v4965.name, v4964);
      if (v4966) {
        v4958.push(v4966);
      }
    }
  }
  return v4958;
};
styfn$5.getNonDefaultPropertiesHash = function (v4967, v4968, v4969) {
  var v4970 = v4969.slice();
  var v4971;
  var v4972;
  var v4973;
  var v4974;
  var v4975;
  var v4976;
  for (v4975 = 0; v4975 < v4968.length; v4975++) {
    v4971 = v4968[v4975];
    v4972 = v4967.pstyle(v4971, false);
    if (v4972 == null) {
      continue;
    } else if (v4972.pfValue != null) {
      v4970[0] = hashInt(v4974, v4970[0]);
      v4970[1] = hashIntAlt(v4974, v4970[1]);
    } else {
      v4973 = v4972.strValue;
      for (v4976 = 0; v4976 < v4973.length; v4976++) {
        v4974 = v4973.charCodeAt(v4976);
        v4970[0] = hashInt(v4974, v4970[0]);
        v4970[1] = hashIntAlt(v4974, v4970[1]);
      }
    }
  }
  return v4970;
};
styfn$5.getPropertiesHash = styfn$5.getNonDefaultPropertiesHash;
var styfn$4 = {};
styfn$4.appendFromJson = function (v4977) {
  var v4978 = this;
  for (var v4979 = 0; v4979 < v4977.length; v4979++) {
    var v4980 = v4977[v4979];
    var v4981 = v4980.selector;
    var v4982 = v4980.style || v4980.css;
    var v4983 = Object.keys(v4982);
    v4978.selector(v4981);
    for (var v4984 = 0; v4984 < v4983.length; v4984++) {
      var v4985 = v4983[v4984];
      var v4986 = v4982[v4985];
      v4978.css(v4985, v4986);
    }
  }
  return v4978;
};
styfn$4.fromJson = function (v4987) {
  var v4988 = this;
  v4988.resetToDefault();
  v4988.appendFromJson(v4987);
  return v4988;
};
styfn$4.json = function () {
  var v4989 = [];
  for (var v4990 = this.defaultLength; v4990 < this.length; v4990++) {
    var v4991 = this[v4990];
    var v4992 = v4991.selector;
    var v4993 = v4991.properties;
    var v4994 = {};
    for (var v4995 = 0; v4995 < v4993.length; v4995++) {
      var v4996 = v4993[v4995];
      v4994[v4996.name] = v4996.strValue;
    }
    v4989.push({
      selector: !v4992 ? "core" : v4992.toString(),
      style: v4994
    });
  }
  return v4989;
};
var styfn$3 = {};
styfn$3.appendFromString = function (v4997) {
  var v4998 = this;
  var v4999 = this;
  var v5000 = "" + v4997;
  var v5001;
  var v5002;
  var v5003;
  v5000 = v5000.replace(/[/][*](\s|.)+?[*][/]/g, "");
  function v5004() {
    if (v5000.length > v5001.length) {
      v5000 = v5000.substr(v5001.length);
    } else {
      v5000 = "";
    }
  }
  function v5005() {
    if (v5002.length > v5003.length) {
      v5002 = v5002.substr(v5003.length);
    } else {
      v5002 = "";
    }
  }
  while (true) {
    var v5006 = v5000.match(/^\s*$/);
    if (v5006) {
      break;
    }
    var v5007 = v5000.match(/^\s*((?:.|\s)+?)\s*\{((?:.|\s)+?)\}/);
    if (!v5007) {
      warn("Halting stylesheet parsing: String stylesheet contains more to parse but no selector and block found in: " + v5000);
      break;
    }
    v5001 = v5007[0];
    var v5008 = v5007[1];
    if (v5008 !== "core") {
      var v5009 = new Selector(v5008);
      if (v5009.invalid) {
        warn("Skipping parsing of block: Invalid selector found in string stylesheet: " + v5008);
        v5004();
        continue;
      }
    }
    var v5010 = v5007[2];
    var v5011 = false;
    v5002 = v5010;
    var v5012 = [];
    while (true) {
      var v5013 = v5002.match(/^\s*$/);
      if (v5013) {
        break;
      }
      var v5014 = v5002.match(/^\s*(.+?)\s*:\s*(.+?)(?:\s*;|\s*$)/);
      if (!v5014) {
        warn("Skipping parsing of block: Invalid formatting of style property and value definitions found in:" + v5010);
        v5011 = true;
        break;
      }
      v5003 = v5014[0];
      var v5015 = v5014[1];
      var v5016 = v5014[2];
      var v5017 = v4998.properties[v5015];
      if (!v5017) {
        warn("Skipping property: Invalid property name in: " + v5003);
        v5005();
        continue;
      }
      var v5018 = v4999.parse(v5015, v5016);
      if (!v5018) {
        warn("Skipping property: Invalid property definition in: " + v5003);
        v5005();
        continue;
      }
      v5012.push({
        name: v5015,
        val: v5016
      });
      v5005();
    }
    if (v5011) {
      v5004();
      break;
    }
    v4999.selector(v5008);
    for (var v5019 = 0; v5019 < v5012.length; v5019++) {
      var v5020 = v5012[v5019];
      v4999.css(v5020.name, v5020.val);
    }
    v5004();
  }
  return v4999;
};
styfn$3.fromString = function (v5021) {
  var v5022 = this;
  v5022.resetToDefault();
  v5022.appendFromString(v5021);
  return v5022;
};
var styfn$2 = {};
(function () {
  var v5023 = number2;
  var v5024 = rgbaNoBackRefs;
  var v5025 = hslaNoBackRefs;
  var v5026 = hex3;
  var v5027 = hex6;
  var v5028 = function v5029(v5030) {
    return "^" + v5030 + "\\s*\\(\\s*([\\w\\.]+)\\s*\\)$";
  };
  var v5031 = function v5032(v5033) {
    var v5034 = v5023 + "|\\w+|" + v5024 + "|" + v5025 + "|" + v5026 + "|" + v5027;
    return "^" + v5033 + "\\s*\\(([\\w\\.]+)\\s*\\,\\s*(" + v5023 + ")\\s*\\,\\s*(" + v5023 + ")\\s*,\\s*(" + v5034 + ")\\s*\\,\\s*(" + v5034 + ")\\)$";
  };
  var v5035 = ["^url\\s*\\(\\s*['\"]?(.+?)['\"]?\\s*\\)$", "^(none)$", "^(.+)$"];
  styfn$2.types = {
    time: {
      number: true,
      min: 0,
      units: "s|ms",
      implicitUnits: "ms"
    },
    percent: {
      number: true,
      min: 0,
      max: 100,
      units: "%",
      implicitUnits: "%"
    },
    percentages: {
      number: true,
      min: 0,
      max: 100,
      units: "%",
      implicitUnits: "%",
      multiple: true
    },
    zeroOneNumber: {
      number: true,
      min: 0,
      max: 1,
      unitless: true
    },
    zeroOneNumbers: {
      number: true,
      min: 0,
      max: 1,
      unitless: true,
      multiple: true
    },
    nOneOneNumber: {
      number: true,
      min: -1,
      max: 1,
      unitless: true
    },
    nonNegativeInt: {
      number: true,
      min: 0,
      integer: true,
      unitless: true
    },
    nonNegativeNumber: {
      number: true,
      min: 0,
      unitless: true
    },
    position: {
      enums: ["parent", "origin"]
    },
    nodeSize: {
      number: true,
      min: 0,
      enums: ["label"]
    },
    number: {
      number: true,
      unitless: true
    },
    numbers: {
      number: true,
      unitless: true,
      multiple: true
    },
    positiveNumber: {
      number: true,
      unitless: true,
      min: 0,
      strictMin: true
    },
    size: {
      number: true,
      min: 0
    },
    bidirectionalSize: {
      number: true
    },
    bidirectionalSizeMaybePercent: {
      number: true,
      allowPercent: true
    },
    bidirectionalSizes: {
      number: true,
      multiple: true
    },
    sizeMaybePercent: {
      number: true,
      min: 0,
      allowPercent: true
    },
    axisDirection: {
      enums: ["horizontal", "leftward", "rightward", "vertical", "upward", "downward", "auto"]
    },
    axisDirectionExplicit: {
      enums: ["leftward", "rightward", "upward", "downward"]
    },
    axisDirectionPrimary: {
      enums: ["horizontal", "vertical"]
    },
    paddingRelativeTo: {
      enums: ["width", "height", "average", "min", "max"]
    },
    bgWH: {
      number: true,
      min: 0,
      allowPercent: true,
      enums: ["auto"],
      multiple: true
    },
    bgPos: {
      number: true,
      allowPercent: true,
      multiple: true
    },
    bgRelativeTo: {
      enums: ["inner", "include-padding"],
      multiple: true
    },
    bgRepeat: {
      enums: ["repeat", "repeat-x", "repeat-y", "no-repeat"],
      multiple: true
    },
    bgFit: {
      enums: ["none", "contain", "cover"],
      multiple: true
    },
    bgCrossOrigin: {
      enums: ["anonymous", "use-credentials", "null"],
      multiple: true
    },
    bgClip: {
      enums: ["none", "node"],
      multiple: true
    },
    bgContainment: {
      enums: ["inside", "over"],
      multiple: true
    },
    boxSelection: {
      enums: ["contain", "overlap", "none"]
    },
    color: {
      color: true
    },
    colors: {
      color: true,
      multiple: true
    },
    fill: {
      enums: ["solid", "linear-gradient", "radial-gradient"]
    },
    bool: {
      enums: ["yes", "no"]
    },
    bools: {
      enums: ["yes", "no"],
      multiple: true
    },
    lineStyle: {
      enums: ["solid", "dotted", "dashed"]
    },
    lineCap: {
      enums: ["butt", "round", "square"]
    },
    linePosition: {
      enums: ["center", "inside", "outside"]
    },
    lineJoin: {
      enums: ["round", "bevel", "miter"]
    },
    borderStyle: {
      enums: ["solid", "dotted", "dashed", "double"]
    },
    curveStyle: {
      enums: ["bezier", "unbundled-bezier", "haystack", "segments", "straight", "straight-triangle", "taxi", "round-segments", "round-taxi"]
    },
    radiusType: {
      enums: ["arc-radius", "influence-radius"],
      multiple: true
    },
    fontFamily: {
      regex: "^([\\w- \\\"]+(?:\\s*,\\s*[\\w- \\\"]+)*)$"
    },
    fontStyle: {
      enums: ["italic", "normal", "oblique"]
    },
    fontWeight: {
      enums: ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "800", "900", 100, 200, 300, 400, 500, 600, 700, 800, 900]
    },
    textDecoration: {
      enums: ["none", "underline", "overline", "line-through"]
    },
    textTransform: {
      enums: ["none", "uppercase", "lowercase"]
    },
    textWrap: {
      enums: ["none", "wrap", "ellipsis"]
    },
    textOverflowWrap: {
      enums: ["whitespace", "anywhere"]
    },
    textBackgroundShape: {
      enums: ["rectangle", "roundrectangle", "round-rectangle", "circle"]
    },
    nodeShape: {
      enums: ["rectangle", "roundrectangle", "round-rectangle", "cutrectangle", "cut-rectangle", "bottomroundrectangle", "bottom-round-rectangle", "barrel", "ellipse", "triangle", "round-triangle", "square", "pentagon", "round-pentagon", "hexagon", "round-hexagon", "concavehexagon", "concave-hexagon", "heptagon", "round-heptagon", "octagon", "round-octagon", "tag", "round-tag", "star", "diamond", "round-diamond", "vee", "rhomboid", "right-rhomboid", "polygon"]
    },
    overlayShape: {
      enums: ["roundrectangle", "round-rectangle", "ellipse"]
    },
    cornerRadius: {
      number: true,
      min: 0,
      units: "px|em",
      implicitUnits: "px",
      enums: ["auto"]
    },
    compoundIncludeLabels: {
      enums: ["include", "exclude"]
    },
    arrowShape: {
      enums: ["tee", "triangle", "triangle-tee", "circle-triangle", "triangle-cross", "triangle-backcurve", "vee", "square", "circle", "diamond", "chevron", "none"]
    },
    arrowFill: {
      enums: ["filled", "hollow"]
    },
    arrowWidth: {
      number: true,
      units: "%|px|em",
      implicitUnits: "px",
      enums: ["match-line"]
    },
    display: {
      enums: ["element", "none"]
    },
    visibility: {
      enums: ["hidden", "visible"]
    },
    zCompoundDepth: {
      enums: ["bottom", "orphan", "auto", "top"]
    },
    zIndexCompare: {
      enums: ["auto", "manual"]
    },
    valign: {
      enums: ["top", "top-inside", "center", "bottom", "bottom-inside"]
    },
    halign: {
      enums: ["left", "left-inside", "center", "right", "right-inside"]
    },
    justification: {
      enums: ["left", "center", "right", "auto"]
    },
    textMetrics: {
      enums: ["font", "glyph"]
    },
    text: {
      string: true
    },
    data: {
      mapping: true,
      regex: v5028("data")
    },
    layoutData: {
      mapping: true,
      regex: v5028("layoutData")
    },
    scratch: {
      mapping: true,
      regex: v5028("scratch")
    },
    mapData: {
      mapping: true,
      regex: v5031("mapData")
    },
    mapLayoutData: {
      mapping: true,
      regex: v5031("mapLayoutData")
    },
    mapScratch: {
      mapping: true,
      regex: v5031("mapScratch")
    },
    fn: {
      mapping: true,
      fn: true
    },
    url: {
      regexes: v5035,
      singleRegexMatchValue: true
    },
    urls: {
      regexes: v5035,
      singleRegexMatchValue: true,
      multiple: true
    },
    propList: {
      propList: true
    },
    angle: {
      number: true,
      units: "deg|rad",
      implicitUnits: "rad"
    },
    textRotation: {
      number: true,
      units: "deg|rad",
      implicitUnits: "rad",
      enums: ["none", "autorotate"]
    },
    polygonPointList: {
      number: true,
      multiple: true,
      evenMultiple: true,
      min: -1,
      max: 1,
      unitless: true
    },
    edgeDistances: {
      enums: ["intersection", "node-position", "endpoints"]
    },
    edgeEndpoint: {
      number: true,
      multiple: true,
      units: "%|px|em|deg|rad",
      implicitUnits: "px",
      enums: ["inside-to-node", "outside-to-node", "outside-to-node-or-label", "outside-to-line", "outside-to-line-or-label"],
      singleEnum: true,
      validate: function v5036(v5037, v5038) {
        switch (v5037.length) {
          case 2:
            return v5038[0] !== "deg" && v5038[0] !== "rad" && v5038[1] !== "deg" && v5038[1] !== "rad";
          case 1:
            return string(v5037[0]) || v5038[0] === "deg" || v5038[0] === "rad";
          default:
            return false;
        }
      }
    },
    easing: {
      regexes: ["^(spring)\\s*\\(\\s*(" + v5023 + ")\\s*,\\s*(" + v5023 + ")\\s*\\)$", "^(cubic-bezier)\\s*\\(\\s*(" + v5023 + ")\\s*,\\s*(" + v5023 + ")\\s*,\\s*(" + v5023 + ")\\s*,\\s*(" + v5023 + ")\\s*\\)$"],
      enums: ["linear", "ease", "ease-in", "ease-out", "ease-in-out", "ease-in-sine", "ease-out-sine", "ease-in-out-sine", "ease-in-quad", "ease-out-quad", "ease-in-out-quad", "ease-in-cubic", "ease-out-cubic", "ease-in-out-cubic", "ease-in-quart", "ease-out-quart", "ease-in-out-quart", "ease-in-quint", "ease-out-quint", "ease-in-out-quint", "ease-in-expo", "ease-out-expo", "ease-in-out-expo", "ease-in-circ", "ease-out-circ", "ease-in-out-circ"]
    },
    gradientDirection: {
      enums: ["to-bottom", "to-top", "to-left", "to-right", "to-bottom-right", "to-bottom-left", "to-top-right", "to-top-left", "to-right-bottom", "to-left-bottom", "to-right-top", "to-left-top"]
    },
    boundsExpansion: {
      number: true,
      multiple: true,
      min: 0,
      validate: function v5039(v5040) {
        var v5041 = v5040.length;
        return v5041 === 1 || v5041 === 2 || v5041 === 4;
      }
    }
  };
  var v5042 = {
    zeroNonZero: function v5043(v5044, v5045) {
      if ((v5044 == null || v5045 == null) && v5044 !== v5045) {
        return true;
      }
      if (v5044 == 0 && v5045 != 0) {
        return true;
      } else if (v5044 != 0 && v5045 == 0) {
        return true;
      } else {
        return false;
      }
    },
    any: function v5046(v5047, v5048) {
      return v5047 != v5048;
    },
    emptyNonEmpty: function v5049(v5050, v5051) {
      var v5052 = emptyString(v5050);
      var v5053 = emptyString(v5051);
      return v5052 && !v5053 || !v5052 && v5053;
    }
  };
  var v5054 = styfn$2.types;
  var v5055 = [{
    name: "label",
    type: v5054.text,
    triggersBounds: v5042.any,
    triggersZOrder: v5042.emptyNonEmpty
  }, {
    name: "text-rotation",
    type: v5054.textRotation,
    triggersBounds: v5042.any
  }, {
    name: "text-margin-x",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }, {
    name: "text-margin-y",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }];
  var v5056 = [{
    name: "source-label",
    type: v5054.text,
    triggersBounds: v5042.any
  }, {
    name: "source-text-rotation",
    type: v5054.textRotation,
    triggersBounds: v5042.any
  }, {
    name: "source-text-margin-x",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }, {
    name: "source-text-margin-y",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }, {
    name: "source-text-offset",
    type: v5054.size,
    triggersBounds: v5042.any
  }];
  var v5057 = [{
    name: "target-label",
    type: v5054.text,
    triggersBounds: v5042.any
  }, {
    name: "target-text-rotation",
    type: v5054.textRotation,
    triggersBounds: v5042.any
  }, {
    name: "target-text-margin-x",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }, {
    name: "target-text-margin-y",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }, {
    name: "target-text-offset",
    type: v5054.size,
    triggersBounds: v5042.any
  }];
  var v5058 = [{
    name: "font-family",
    type: v5054.fontFamily,
    triggersBounds: v5042.any
  }, {
    name: "font-style",
    type: v5054.fontStyle,
    triggersBounds: v5042.any
  }, {
    name: "font-weight",
    type: v5054.fontWeight,
    triggersBounds: v5042.any
  }, {
    name: "font-size",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "text-transform",
    type: v5054.textTransform,
    triggersBounds: v5042.any
  }, {
    name: "text-wrap",
    type: v5054.textWrap,
    triggersBounds: v5042.any
  }, {
    name: "text-overflow-wrap",
    type: v5054.textOverflowWrap,
    triggersBounds: v5042.any
  }, {
    name: "text-max-width",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "text-outline-width",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "line-height",
    type: v5054.positiveNumber,
    triggersBounds: v5042.any
  }];
  var v5059 = [{
    name: "text-valign",
    type: v5054.valign,
    triggersBounds: v5042.any
  }, {
    name: "text-halign",
    type: v5054.halign,
    triggersBounds: v5042.any
  }, {
    name: "color",
    type: v5054.color
  }, {
    name: "text-outline-color",
    type: v5054.color
  }, {
    name: "text-outline-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "text-background-color",
    type: v5054.color
  }, {
    name: "text-background-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "text-background-padding",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "text-border-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "text-border-color",
    type: v5054.color
  }, {
    name: "text-border-width",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "text-border-style",
    type: v5054.borderStyle,
    triggersBounds: v5042.any
  }, {
    name: "text-background-shape",
    type: v5054.textBackgroundShape,
    triggersBounds: v5042.any
  }, {
    name: "text-justification",
    type: v5054.justification
  }, {
    name: "text-metrics",
    type: v5054.textMetrics
  }, {
    name: "box-select-labels",
    type: v5054.bool,
    triggersBounds: v5042.any
  }];
  var v5060 = [{
    name: "events",
    type: v5054.bool,
    triggersZOrder: v5042.any
  }, {
    name: "text-events",
    type: v5054.bool,
    triggersZOrder: v5042.any
  }, {
    name: "box-selection",
    type: v5054.boxSelection,
    triggersZOrder: v5042.any
  }];
  var v5061 = [{
    name: "display",
    type: v5054.display,
    triggersZOrder: v5042.any,
    triggersBounds: v5042.any,
    triggersBoundsOfConnectedEdges: v5042.any,
    triggersBoundsOfParallelEdges: function v5062(v5063, v5064, v5065) {
      if (v5063 === v5064) {
        return false;
      }
      return v5065.pstyle("curve-style").value === "bezier";
    }
  }, {
    name: "visibility",
    type: v5054.visibility,
    triggersZOrder: v5042.any
  }, {
    name: "opacity",
    type: v5054.zeroOneNumber,
    triggersZOrder: v5042.zeroNonZero
  }, {
    name: "text-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "min-zoomed-font-size",
    type: v5054.size
  }, {
    name: "z-compound-depth",
    type: v5054.zCompoundDepth,
    triggersZOrder: v5042.any
  }, {
    name: "z-index-compare",
    type: v5054.zIndexCompare,
    triggersZOrder: v5042.any
  }, {
    name: "z-index",
    type: v5054.number,
    triggersZOrder: v5042.any
  }];
  var v5066 = [{
    name: "overlay-padding",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "overlay-color",
    type: v5054.color
  }, {
    name: "overlay-opacity",
    type: v5054.zeroOneNumber,
    triggersBounds: v5042.zeroNonZero
  }, {
    name: "overlay-shape",
    type: v5054.overlayShape,
    triggersBounds: v5042.any
  }, {
    name: "overlay-corner-radius",
    type: v5054.cornerRadius
  }];
  var v5067 = [{
    name: "underlay-padding",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "underlay-color",
    type: v5054.color
  }, {
    name: "underlay-opacity",
    type: v5054.zeroOneNumber,
    triggersBounds: v5042.zeroNonZero
  }, {
    name: "underlay-shape",
    type: v5054.overlayShape,
    triggersBounds: v5042.any
  }, {
    name: "underlay-corner-radius",
    type: v5054.cornerRadius
  }];
  var v5068 = [{
    name: "transition-property",
    type: v5054.propList
  }, {
    name: "transition-duration",
    type: v5054.time
  }, {
    name: "transition-delay",
    type: v5054.time
  }, {
    name: "transition-timing-function",
    type: v5054.easing
  }];
  var v5069 = function v5070(v5071, v5072) {
    if (v5072.value === "label") {
      return -v5071.poolIndex();
    } else {
      return v5072.pfValue;
    }
  };
  var v5073 = [{
    name: "height",
    type: v5054.nodeSize,
    triggersBounds: v5042.any,
    hashOverride: v5069
  }, {
    name: "width",
    type: v5054.nodeSize,
    triggersBounds: v5042.any,
    hashOverride: v5069
  }, {
    name: "shape",
    type: v5054.nodeShape,
    triggersBounds: v5042.any
  }, {
    name: "shape-polygon-points",
    type: v5054.polygonPointList,
    triggersBounds: v5042.any
  }, {
    name: "corner-radius",
    type: v5054.cornerRadius
  }, {
    name: "background-color",
    type: v5054.color
  }, {
    name: "background-fill",
    type: v5054.fill
  }, {
    name: "background-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "background-blacken",
    type: v5054.nOneOneNumber
  }, {
    name: "background-gradient-stop-colors",
    type: v5054.colors
  }, {
    name: "background-gradient-stop-positions",
    type: v5054.percentages
  }, {
    name: "background-gradient-direction",
    type: v5054.gradientDirection
  }, {
    name: "padding",
    type: v5054.sizeMaybePercent,
    triggersBounds: v5042.any
  }, {
    name: "padding-relative-to",
    type: v5054.paddingRelativeTo,
    triggersBounds: v5042.any
  }, {
    name: "bounds-expansion",
    type: v5054.boundsExpansion,
    triggersBounds: v5042.any
  }];
  var v5074 = [{
    name: "border-color",
    type: v5054.color
  }, {
    name: "border-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "border-width",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "border-style",
    type: v5054.borderStyle
  }, {
    name: "border-cap",
    type: v5054.lineCap
  }, {
    name: "border-join",
    type: v5054.lineJoin
  }, {
    name: "border-dash-pattern",
    type: v5054.numbers
  }, {
    name: "border-dash-offset",
    type: v5054.number
  }, {
    name: "border-position",
    type: v5054.linePosition
  }];
  var v5075 = [{
    name: "outline-color",
    type: v5054.color
  }, {
    name: "outline-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "outline-width",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "outline-style",
    type: v5054.borderStyle
  }, {
    name: "outline-offset",
    type: v5054.size,
    triggersBounds: v5042.any
  }];
  var v5076 = [{
    name: "background-image",
    type: v5054.urls
  }, {
    name: "background-image-crossorigin",
    type: v5054.bgCrossOrigin
  }, {
    name: "background-image-opacity",
    type: v5054.zeroOneNumbers
  }, {
    name: "background-image-containment",
    type: v5054.bgContainment
  }, {
    name: "background-image-smoothing",
    type: v5054.bools
  }, {
    name: "background-position-x",
    type: v5054.bgPos
  }, {
    name: "background-position-y",
    type: v5054.bgPos
  }, {
    name: "background-width-relative-to",
    type: v5054.bgRelativeTo
  }, {
    name: "background-height-relative-to",
    type: v5054.bgRelativeTo
  }, {
    name: "background-repeat",
    type: v5054.bgRepeat
  }, {
    name: "background-fit",
    type: v5054.bgFit
  }, {
    name: "background-clip",
    type: v5054.bgClip
  }, {
    name: "background-width",
    type: v5054.bgWH
  }, {
    name: "background-height",
    type: v5054.bgWH
  }, {
    name: "background-offset-x",
    type: v5054.bgPos
  }, {
    name: "background-offset-y",
    type: v5054.bgPos
  }];
  var v5077 = [{
    name: "position",
    type: v5054.position,
    triggersBounds: v5042.any
  }, {
    name: "compound-sizing-wrt-labels",
    type: v5054.compoundIncludeLabels,
    triggersBounds: v5042.any
  }, {
    name: "min-width",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "min-width-bias-left",
    type: v5054.sizeMaybePercent,
    triggersBounds: v5042.any
  }, {
    name: "min-width-bias-right",
    type: v5054.sizeMaybePercent,
    triggersBounds: v5042.any
  }, {
    name: "min-height",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "min-height-bias-top",
    type: v5054.sizeMaybePercent,
    triggersBounds: v5042.any
  }, {
    name: "min-height-bias-bottom",
    type: v5054.sizeMaybePercent,
    triggersBounds: v5042.any
  }];
  var v5078 = [{
    name: "line-style",
    type: v5054.lineStyle
  }, {
    name: "line-color",
    type: v5054.color
  }, {
    name: "line-fill",
    type: v5054.fill
  }, {
    name: "line-cap",
    type: v5054.lineCap
  }, {
    name: "line-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "line-dash-pattern",
    type: v5054.numbers
  }, {
    name: "line-dash-offset",
    type: v5054.number
  }, {
    name: "line-outline-width",
    type: v5054.size
  }, {
    name: "line-outline-color",
    type: v5054.color
  }, {
    name: "line-gradient-stop-colors",
    type: v5054.colors
  }, {
    name: "line-gradient-stop-positions",
    type: v5054.percentages
  }, {
    name: "curve-style",
    type: v5054.curveStyle,
    triggersBounds: v5042.any,
    triggersBoundsOfParallelEdges: function v5079(v5080, v5081) {
      if (v5080 === v5081) {
        return false;
      }
      return v5080 === "bezier" || v5081 === "bezier";
    }
  }, {
    name: "haystack-radius",
    type: v5054.zeroOneNumber,
    triggersBounds: v5042.any
  }, {
    name: "source-endpoint",
    type: v5054.edgeEndpoint,
    triggersBounds: v5042.any
  }, {
    name: "target-endpoint",
    type: v5054.edgeEndpoint,
    triggersBounds: v5042.any
  }, {
    name: "control-point-step-size",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "control-point-distances",
    type: v5054.bidirectionalSizes,
    triggersBounds: v5042.any
  }, {
    name: "control-point-weights",
    type: v5054.numbers,
    triggersBounds: v5042.any
  }, {
    name: "segment-distances",
    type: v5054.bidirectionalSizes,
    triggersBounds: v5042.any
  }, {
    name: "segment-weights",
    type: v5054.numbers,
    triggersBounds: v5042.any
  }, {
    name: "segment-radii",
    type: v5054.numbers,
    triggersBounds: v5042.any
  }, {
    name: "radius-type",
    type: v5054.radiusType,
    triggersBounds: v5042.any
  }, {
    name: "taxi-turn",
    type: v5054.bidirectionalSizeMaybePercent,
    triggersBounds: v5042.any
  }, {
    name: "taxi-turn-min-distance",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "taxi-direction",
    type: v5054.axisDirection,
    triggersBounds: v5042.any
  }, {
    name: "taxi-radius",
    type: v5054.number,
    triggersBounds: v5042.any
  }, {
    name: "edge-distances",
    type: v5054.edgeDistances,
    triggersBounds: v5042.any
  }, {
    name: "arrow-scale",
    type: v5054.positiveNumber,
    triggersBounds: v5042.any
  }, {
    name: "loop-direction",
    type: v5054.angle,
    triggersBounds: v5042.any
  }, {
    name: "loop-sweep",
    type: v5054.angle,
    triggersBounds: v5042.any
  }, {
    name: "source-distance-from-node",
    type: v5054.size,
    triggersBounds: v5042.any
  }, {
    name: "target-distance-from-node",
    type: v5054.size,
    triggersBounds: v5042.any
  }];
  var v5082 = [{
    name: "ghost",
    type: v5054.bool,
    triggersBounds: v5042.any
  }, {
    name: "ghost-offset-x",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }, {
    name: "ghost-offset-y",
    type: v5054.bidirectionalSize,
    triggersBounds: v5042.any
  }, {
    name: "ghost-opacity",
    type: v5054.zeroOneNumber
  }];
  var v5083 = [{
    name: "selection-box-color",
    type: v5054.color
  }, {
    name: "selection-box-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "selection-box-border-color",
    type: v5054.color
  }, {
    name: "selection-box-border-width",
    type: v5054.size
  }, {
    name: "active-bg-color",
    type: v5054.color
  }, {
    name: "active-bg-opacity",
    type: v5054.zeroOneNumber
  }, {
    name: "active-bg-size",
    type: v5054.size
  }, {
    name: "outside-texture-bg-color",
    type: v5054.color
  }, {
    name: "outside-texture-bg-opacity",
    type: v5054.zeroOneNumber
  }];
  var v5084 = [];
  styfn$2.pieBackgroundN = 16;
  v5084.push({
    name: "pie-size",
    type: v5054.sizeMaybePercent
  });
  v5084.push({
    name: "pie-hole",
    type: v5054.sizeMaybePercent
  });
  v5084.push({
    name: "pie-start-angle",
    type: v5054.angle
  });
  for (var v5085 = 1; v5085 <= styfn$2.pieBackgroundN; v5085++) {
    v5084.push({
      name: "pie-" + v5085 + "-background-color",
      type: v5054.color
    });
    v5084.push({
      name: "pie-" + v5085 + "-background-size",
      type: v5054.percent
    });
    v5084.push({
      name: "pie-" + v5085 + "-background-opacity",
      type: v5054.zeroOneNumber
    });
  }
  var v5086 = [];
  styfn$2.stripeBackgroundN = 16;
  v5086.push({
    name: "stripe-size",
    type: v5054.sizeMaybePercent
  });
  v5086.push({
    name: "stripe-direction",
    type: v5054.axisDirectionPrimary
  });
  for (var v5087 = 1; v5087 <= styfn$2.stripeBackgroundN; v5087++) {
    v5086.push({
      name: "stripe-" + v5087 + "-background-color",
      type: v5054.color
    });
    v5086.push({
      name: "stripe-" + v5087 + "-background-size",
      type: v5054.percent
    });
    v5086.push({
      name: "stripe-" + v5087 + "-background-opacity",
      type: v5054.zeroOneNumber
    });
  }
  var v5088 = [];
  var v5089 = styfn$2.arrowPrefixes = ["source", "mid-source", "target", "mid-target"];
  [{
    name: "arrow-shape",
    type: v5054.arrowShape,
    triggersBounds: v5042.any
  }, {
    name: "arrow-color",
    type: v5054.color
  }, {
    name: "arrow-fill",
    type: v5054.arrowFill
  }, {
    name: "arrow-width",
    type: v5054.arrowWidth
  }].forEach(function (v5090) {
    v5089.forEach(function (v5091) {
      var v5092 = v5091 + "-" + v5090.name;
      var v5093 = v5090.type;
      var v5094 = v5090.triggersBounds;
      v5088.push({
        name: v5092,
        type: v5093,
        triggersBounds: v5094
      });
    });
  }, {});
  var v5095 = styfn$2.properties = [].concat(v5060, v5068, v5061, v5066, v5067, v5082, v5059, v5058, v5055, v5056, v5057, v5073, v5074, v5075, v5076, v5084, v5086, v5077, v5078, v5088, v5083);
  var v5096 = styfn$2.propertyGroups = {
    behavior: v5060,
    transition: v5068,
    visibility: v5061,
    overlay: v5066,
    underlay: v5067,
    ghost: v5082,
    commonLabel: v5059,
    labelDimensions: v5058,
    mainLabel: v5055,
    sourceLabel: v5056,
    targetLabel: v5057,
    nodeBody: v5073,
    nodeBorder: v5074,
    nodeOutline: v5075,
    backgroundImage: v5076,
    pie: v5084,
    stripe: v5086,
    compound: v5077,
    edgeLine: v5078,
    edgeArrow: v5088,
    core: v5083
  };
  var v5097 = styfn$2.propertyGroupNames = {};
  var v5098 = styfn$2.propertyGroupKeys = Object.keys(v5096);
  v5098.forEach(function (v5099) {
    v5097[v5099] = v5096[v5099].map(function (v5100) {
      return v5100.name;
    });
    v5096[v5099].forEach(function (v5101) {
      return v5101.groupKey = v5099;
    });
  });
  var v5102 = styfn$2.aliases = [{
    name: "content",
    pointsTo: "label"
  }, {
    name: "control-point-distance",
    pointsTo: "control-point-distances"
  }, {
    name: "control-point-weight",
    pointsTo: "control-point-weights"
  }, {
    name: "segment-distance",
    pointsTo: "segment-distances"
  }, {
    name: "segment-weight",
    pointsTo: "segment-weights"
  }, {
    name: "segment-radius",
    pointsTo: "segment-radii"
  }, {
    name: "edge-text-rotation",
    pointsTo: "text-rotation"
  }, {
    name: "padding-left",
    pointsTo: "padding"
  }, {
    name: "padding-right",
    pointsTo: "padding"
  }, {
    name: "padding-top",
    pointsTo: "padding"
  }, {
    name: "padding-bottom",
    pointsTo: "padding"
  }];
  styfn$2.propertyNames = v5095.map(function (v5103) {
    return v5103.name;
  });
  for (var v5104 = 0; v5104 < v5095.length; v5104++) {
    var v5105 = v5095[v5104];
    v5095[v5105.name] = v5105;
  }
  for (var v5106 = 0; v5106 < v5102.length; v5106++) {
    var v5107 = v5102[v5106];
    var v5108 = v5095[v5107.pointsTo];
    var v5109 = {
      name: v5107.name,
      alias: true,
      pointsTo: v5108
    };
    v5095.push(v5109);
    v5095[v5107.name] = v5109;
  }
})();
styfn$2.getDefaultProperty = function (v5110) {
  return this.getDefaultProperties()[v5110];
};
styfn$2.getDefaultProperties = function () {
  var v5111 = this._private;
  if (v5111.defaultProperties != null) {
    return v5111.defaultProperties;
  }
  var v5112 = extend({
    "selection-box-color": "#ddd",
    "selection-box-opacity": 0.65,
    "selection-box-border-color": "#aaa",
    "selection-box-border-width": 1,
    "active-bg-color": "black",
    "active-bg-opacity": 0.15,
    "active-bg-size": 30,
    "outside-texture-bg-color": "#000",
    "outside-texture-bg-opacity": 0.125,
    events: "yes",
    "text-events": "no",
    "text-valign": "top",
    "text-halign": "center",
    "text-justification": "auto",
    "line-height": 1,
    color: "#000",
    "box-selection": "contain",
    "text-outline-color": "#000",
    "text-outline-width": 0,
    "text-outline-opacity": 1,
    "text-opacity": 1,
    "text-decoration": "none",
    "text-transform": "none",
    "text-wrap": "none",
    "text-overflow-wrap": "whitespace",
    "text-max-width": 9999,
    "text-background-color": "#000",
    "text-background-opacity": 0,
    "text-background-shape": "rectangle",
    "text-background-padding": 0,
    "text-border-opacity": 0,
    "text-border-width": 0,
    "text-border-style": "solid",
    "text-border-color": "#000",
    "font-family": "Helvetica Neue, Helvetica, sans-serif",
    "font-style": "normal",
    "font-weight": "normal",
    "font-size": 16,
    "min-zoomed-font-size": 0,
    "text-rotation": "none",
    "source-text-rotation": "none",
    "target-text-rotation": "none",
    visibility: "visible",
    display: "element",
    opacity: 1,
    "z-compound-depth": "auto",
    "z-index-compare": "auto",
    "z-index": 0,
    label: "",
    "text-margin-x": 0,
    "text-margin-y": 0,
    "source-label": "",
    "source-text-offset": 0,
    "source-text-margin-x": 0,
    "source-text-margin-y": 0,
    "target-label": "",
    "target-text-offset": 0,
    "target-text-margin-x": 0,
    "target-text-margin-y": 0,
    "overlay-opacity": 0,
    "overlay-color": "#000",
    "overlay-padding": 10,
    "overlay-shape": "round-rectangle",
    "overlay-corner-radius": "auto",
    "underlay-opacity": 0,
    "underlay-color": "#000",
    "underlay-padding": 10,
    "underlay-shape": "round-rectangle",
    "underlay-corner-radius": "auto",
    "text-metrics": "font",
    "transition-property": "none",
    "transition-duration": 0,
    "transition-delay": 0,
    "transition-timing-function": "linear",
    "box-select-labels": "no",
    "background-blacken": 0,
    "background-color": "#999",
    "background-fill": "solid",
    "background-opacity": 1,
    "background-image": "none",
    "background-image-crossorigin": "anonymous",
    "background-image-opacity": 1,
    "background-image-containment": "inside",
    "background-image-smoothing": "yes",
    "background-position-x": "50%",
    "background-position-y": "50%",
    "background-offset-x": 0,
    "background-offset-y": 0,
    "background-width-relative-to": "include-padding",
    "background-height-relative-to": "include-padding",
    "background-repeat": "no-repeat",
    "background-fit": "none",
    "background-clip": "node",
    "background-width": "auto",
    "background-height": "auto",
    "border-color": "#000",
    "border-opacity": 1,
    "border-width": 0,
    "border-style": "solid",
    "border-dash-pattern": [4, 2],
    "border-dash-offset": 0,
    "border-cap": "butt",
    "border-join": "miter",
    "border-position": "center",
    "outline-color": "#999",
    "outline-opacity": 1,
    "outline-width": 0,
    "outline-offset": 0,
    "outline-style": "solid",
    height: 30,
    width: 30,
    shape: "ellipse",
    "shape-polygon-points": "-1, -1,   1, -1,   1, 1,   -1, 1",
    "corner-radius": "auto",
    "bounds-expansion": 0,
    "background-gradient-direction": "to-bottom",
    "background-gradient-stop-colors": "#999",
    "background-gradient-stop-positions": "0%",
    ghost: "no",
    "ghost-offset-y": 0,
    "ghost-offset-x": 0,
    "ghost-opacity": 0,
    padding: 0,
    "padding-relative-to": "width",
    position: "origin",
    "compound-sizing-wrt-labels": "include",
    "min-width": 0,
    "min-width-bias-left": 0,
    "min-width-bias-right": 0,
    "min-height": 0,
    "min-height-bias-top": 0,
    "min-height-bias-bottom": 0
  }, {
    "pie-size": "100%",
    "pie-hole": 0,
    "pie-start-angle": "0deg"
  }, [{
    name: "pie-{{i}}-background-color",
    value: "black"
  }, {
    name: "pie-{{i}}-background-size",
    value: "0%"
  }, {
    name: "pie-{{i}}-background-opacity",
    value: 1
  }].reduce(function (v5113, v5114) {
    for (var v5115 = 1; v5115 <= styfn$2.pieBackgroundN; v5115++) {
      var v5116 = v5114.name.replace("{{i}}", v5115);
      var v5117 = v5114.value;
      v5113[v5116] = v5117;
    }
    return v5113;
  }, {}), {
    "stripe-size": "100%",
    "stripe-direction": "horizontal"
  }, [{
    name: "stripe-{{i}}-background-color",
    value: "black"
  }, {
    name: "stripe-{{i}}-background-size",
    value: "0%"
  }, {
    name: "stripe-{{i}}-background-opacity",
    value: 1
  }].reduce(function (v5118, v5119) {
    for (var v5120 = 1; v5120 <= styfn$2.stripeBackgroundN; v5120++) {
      var v5121 = v5119.name.replace("{{i}}", v5120);
      var v5122 = v5119.value;
      v5118[v5121] = v5122;
    }
    return v5118;
  }, {}), {
    "line-style": "solid",
    "line-color": "#999",
    "line-fill": "solid",
    "line-cap": "butt",
    "line-opacity": 1,
    "line-outline-width": 0,
    "line-outline-color": "#000",
    "line-gradient-stop-colors": "#999",
    "line-gradient-stop-positions": "0%",
    "control-point-step-size": 40,
    "control-point-weights": 0.5,
    "segment-weights": 0.5,
    "segment-distances": 20,
    "segment-radii": 15,
    "radius-type": "arc-radius",
    "taxi-turn": "50%",
    "taxi-radius": 15,
    "taxi-turn-min-distance": 10,
    "taxi-direction": "auto",
    "edge-distances": "intersection",
    "curve-style": "haystack",
    "haystack-radius": 0,
    "arrow-scale": 1,
    "loop-direction": "-45deg",
    "loop-sweep": "-90deg",
    "source-distance-from-node": 0,
    "target-distance-from-node": 0,
    "source-endpoint": "outside-to-node",
    "target-endpoint": "outside-to-node",
    "line-dash-pattern": [6, 3],
    "line-dash-offset": 0
  }, [{
    name: "arrow-shape",
    value: "none"
  }, {
    name: "arrow-color",
    value: "#999"
  }, {
    name: "arrow-fill",
    value: "filled"
  }, {
    name: "arrow-width",
    value: 1
  }].reduce(function (v5123, v5124) {
    styfn$2.arrowPrefixes.forEach(function (v5125) {
      var v5126 = v5125 + "-" + v5124.name;
      var v5127 = v5124.value;
      v5123[v5126] = v5127;
    });
    return v5123;
  }, {}));
  var v5128 = {};
  for (var v5129 = 0; v5129 < this.properties.length; v5129++) {
    var v5130 = this.properties[v5129];
    if (v5130.pointsTo) {
      continue;
    }
    var v5131 = v5130.name;
    var v5132 = v5112[v5131];
    var v5133 = this.parse(v5131, v5132);
    v5128[v5131] = v5133;
  }
  v5111.defaultProperties = v5128;
  return v5111.defaultProperties;
};
styfn$2.addDefaultStylesheet = function () {
  this.selector(":parent").css({
    shape: "rectangle",
    padding: 10,
    "background-color": "#eee",
    "border-color": "#ccc",
    "border-width": 1
  }).selector("edge").css({
    width: 3
  }).selector(":loop").css({
    "curve-style": "bezier"
  }).selector("edge:compound").css({
    "curve-style": "bezier",
    "source-endpoint": "outside-to-line",
    "target-endpoint": "outside-to-line"
  }).selector(":selected").css({
    "background-color": "#0169D9",
    "line-color": "#0169D9",
    "source-arrow-color": "#0169D9",
    "target-arrow-color": "#0169D9",
    "mid-source-arrow-color": "#0169D9",
    "mid-target-arrow-color": "#0169D9"
  }).selector(":parent:selected").css({
    "background-color": "#CCE1F9",
    "border-color": "#aec8e5"
  }).selector(":active").css({
    "overlay-color": "black",
    "overlay-padding": 10,
    "overlay-opacity": 0.25
  });
  this.defaultLength = this.length;
};
var styfn$1 = {};
styfn$1.parse = function (v5134, v5135, v5136, v5137) {
  var v5138 = this;
  if (fn$6(v5135)) {
    return v5138.parseImplWarn(v5134, v5135, v5136, v5137);
  }
  var v5139 = v5137 === "mapping" || v5137 === true || v5137 === false || v5137 == null ? "dontcare" : v5137;
  var v5140 = v5136 ? "t" : "f";
  var v5141 = "" + v5135;
  var v5142 = hashStrings(v5134, v5141, v5140, v5139);
  var v5143 = v5138.propCache = v5138.propCache || [];
  var v5144;
  if (!(v5144 = v5143[v5142])) {
    v5144 = v5143[v5142] = v5138.parseImplWarn(v5134, v5135, v5136, v5137);
  }
  if (v5136 || v5137 === "mapping") {
    v5144 = copy(v5144);
    if (v5144) {
      v5144.value = copy(v5144.value);
    }
  }
  return v5144;
};
styfn$1.parseImplWarn = function (v5145, v5146, v5147, v5148) {
  var v5149 = this.parseImpl(v5145, v5146, v5147, v5148);
  if (!v5149 && v5146 != null) {
    warn(`The style property \`${v5145}: ${v5146}\` is invalid`);
  }
  if (v5149 && (v5149.name === "width" || v5149.name === "height") && v5146 === "label") {
    warn("The style value of `label` is deprecated for `" + v5149.name + "`");
  }
  return v5149;
};
styfn$1.parseImpl = function (v5150, v5151, v5152, v5153) {
  var v5154 = this;
  v5150 = camel2dash(v5150);
  var v5155 = v5154.properties[v5150];
  var v5156 = v5151;
  var v5157 = v5154.types;
  if (!v5155) {
    return null;
  }
  if (v5151 === undefined) {
    return null;
  }
  if (v5155.alias) {
    v5155 = v5155.pointsTo;
    v5150 = v5155.name;
  }
  var v5158 = string(v5151);
  if (v5158) {
    v5151 = v5151.trim();
  }
  var v5159 = v5155.type;
  if (!v5159) {
    return null;
  }
  if (v5152 && (v5151 === "" || v5151 === null)) {
    return {
      name: v5150,
      value: v5151,
      bypass: true,
      deleteBypass: true
    };
  }
  if (fn$6(v5151)) {
    return {
      name: v5150,
      value: v5151,
      strValue: "fn",
      mapped: v5157.fn,
      bypass: v5152
    };
  }
  var v5160;
  var v5161;
  if (!v5158 || v5153 || v5151.length < 7 || v5151[1] !== "a") ;else if (v5151.length >= 7 && v5151[0] === "d" && (v5160 = new RegExp(v5157.data.regex).exec(v5151))) {
    if (v5152) {
      return false;
    }
    var v5162 = v5157.data;
    return {
      name: v5150,
      value: v5160,
      strValue: "" + v5151,
      mapped: v5162,
      field: v5160[1],
      bypass: v5152
    };
  } else if (v5151.length >= 10 && v5151[0] === "m" && (v5161 = new RegExp(v5157.mapData.regex).exec(v5151))) {
    if (v5152) {
      return false;
    }
    if (v5159.multiple) {
      return false;
    }
    var v5163 = v5157.mapData;
    if (!v5159.color && !v5159.number) {
      return false;
    }
    var v5164 = this.parse(v5150, v5161[4]);
    if (!v5164 || v5164.mapped) {
      return false;
    }
    var v5165 = this.parse(v5150, v5161[5]);
    if (!v5165 || v5165.mapped) {
      return false;
    }
    if (v5164.pfValue === v5165.pfValue || v5164.strValue === v5165.strValue) {
      warn("`" + v5150 + ": " + v5151 + "` is not a valid mapper because the output range is zero; converting to `" + v5150 + ": " + v5164.strValue + "`");
      return this.parse(v5150, v5164.strValue);
    } else if (v5159.color) {
      var v5166 = v5164.value;
      var v5167 = v5165.value;
      var v5168 = v5166[0] === v5167[0] && v5166[1] === v5167[1] && v5166[2] === v5167[2] && (v5166[3] === v5167[3] || (v5166[3] == null || v5166[3] === 1) && (v5167[3] == null || v5167[3] === 1));
      if (v5168) {
        return false;
      }
    }
    return {
      name: v5150,
      value: v5161,
      strValue: "" + v5151,
      mapped: v5163,
      field: v5161[1],
      fieldMin: parseFloat(v5161[2]),
      fieldMax: parseFloat(v5161[3]),
      valueMin: v5164.value,
      valueMax: v5165.value,
      bypass: v5152
    };
  }
  if (v5159.multiple && v5153 !== "multiple") {
    var v5169;
    if (v5158) {
      v5169 = v5151.split(/\s+/);
    } else if (array(v5151)) {
      v5169 = v5151;
    } else {
      v5169 = [v5151];
    }
    if (v5159.evenMultiple && v5169.length % 2 !== 0) {
      return null;
    }
    var v5170 = [];
    var v5171 = [];
    var v5172 = [];
    var v5173 = "";
    var v5174 = false;
    for (var v5175 = 0; v5175 < v5169.length; v5175++) {
      var v5176 = v5154.parse(v5150, v5169[v5175], v5152, "multiple");
      v5174 = v5174 || string(v5176.value);
      v5170.push(v5176.value);
      v5172.push(v5176.pfValue ?? v5176.value);
      v5171.push(v5176.units);
      v5173 += (v5175 > 0 ? " " : "") + v5176.strValue;
    }
    if (v5159.validate && !v5159.validate(v5170, v5171)) {
      return null;
    }
    if (v5159.singleEnum && v5174) {
      if (v5170.length === 1 && string(v5170[0])) {
        return {
          name: v5150,
          value: v5170[0],
          strValue: v5170[0],
          bypass: v5152
        };
      } else {
        return null;
      }
    }
    return {
      name: v5150,
      value: v5170,
      pfValue: v5172,
      strValue: v5173,
      bypass: v5152,
      units: v5171
    };
  }
  var v5177 = function v5178() {
    for (var v5179 = 0; v5179 < v5159.enums.length; v5179++) {
      var v5180 = v5159.enums[v5179];
      if (v5180 === v5151) {
        return {
          name: v5150,
          value: v5151,
          strValue: "" + v5151,
          bypass: v5152
        };
      }
    }
    return null;
  };
  if (v5159.number) {
    var v5181;
    var v5182 = "px";
    if (v5159.units) {
      v5181 = v5159.units;
    }
    if (v5159.implicitUnits) {
      v5182 = v5159.implicitUnits;
    }
    if (!v5159.unitless) {
      if (v5158) {
        var v5183 = "px|em" + (v5159.allowPercent ? "|\\%" : "");
        if (v5181) {
          v5183 = v5181;
        }
        var v5184 = v5151.match("^(" + number2 + ")(" + v5183 + ")?$");
        if (v5184) {
          v5151 = v5184[1];
          v5181 = v5184[2] || v5182;
        }
      } else if (!v5181 || v5159.implicitUnits) {
        v5181 = v5182;
      }
    }
    v5151 = parseFloat(v5151);
    if (isNaN(v5151) && v5159.enums === undefined) {
      return null;
    }
    if (isNaN(v5151) && v5159.enums !== undefined) {
      v5151 = v5156;
      return v5177();
    }
    if (v5159.integer && !integer(v5151)) {
      return null;
    }
    if (v5159.min !== undefined && (v5151 < v5159.min || v5159.strictMin && v5151 === v5159.min) || v5159.max !== undefined && (v5151 > v5159.max || v5159.strictMax && v5151 === v5159.max)) {
      return null;
    }
    var v5185 = {
      name: v5150,
      value: v5151,
      strValue: "" + v5151 + (v5181 ? v5181 : ""),
      units: v5181,
      bypass: v5152
    };
    if (v5159.unitless || v5181 !== "px" && v5181 !== "em") {
      v5185.pfValue = v5151;
    } else {
      v5185.pfValue = v5181 === "px" || !v5181 ? v5151 : this.getEmSizeInPixels() * v5151;
    }
    if (v5181 === "ms" || v5181 === "s") {
      v5185.pfValue = v5181 === "ms" ? v5151 : v5151 * 1000;
    }
    if (v5181 === "deg" || v5181 === "rad") {
      v5185.pfValue = v5181 === "rad" ? v5151 : deg2rad(v5151);
    }
    if (v5181 === "%") {
      v5185.pfValue = v5151 / 100;
    }
    return v5185;
  } else if (v5159.propList) {
    var v5186 = [];
    var v5187 = "" + v5151;
    if (v5187 === "none") ;else {
      var v5188 = v5187.split(/\s*,\s*|\s+/);
      for (var v5189 = 0; v5189 < v5188.length; v5189++) {
        var v5190 = v5188[v5189].trim();
        if (v5154.properties[v5190]) {
          v5186.push(v5190);
        } else {
          warn("`" + v5190 + "` is not a valid property name");
        }
      }
      if (v5186.length === 0) {
        return null;
      }
    }
    return {
      name: v5150,
      value: v5186,
      strValue: v5186.length === 0 ? "none" : v5186.join(" "),
      bypass: v5152
    };
  } else if (v5159.color) {
    var v5191 = color2tuple(v5151);
    if (!v5191) {
      return null;
    }
    return {
      name: v5150,
      value: v5191,
      pfValue: v5191,
      strValue: "rgb(" + v5191[0] + "," + v5191[1] + "," + v5191[2] + ")",
      bypass: v5152
    };
  } else if (v5159.regex || v5159.regexes) {
    if (v5159.enums) {
      var v5192 = v5177();
      if (v5192) {
        return v5192;
      }
    }
    var v5193 = v5159.regexes ? v5159.regexes : [v5159.regex];
    for (var v5194 = 0; v5194 < v5193.length; v5194++) {
      var v5195 = new RegExp(v5193[v5194]);
      var v5196 = v5195.exec(v5151);
      if (v5196) {
        return {
          name: v5150,
          value: v5159.singleRegexMatchValue ? v5196[1] : v5196,
          strValue: "" + v5151,
          bypass: v5152
        };
      }
    }
    return null;
  } else if (v5159.string) {
    return {
      name: v5150,
      value: "" + v5151,
      strValue: "" + v5151,
      bypass: v5152
    };
  } else if (v5159.enums) {
    return v5177();
  } else {
    return null;
  }
};
var _Style = function Style(v5197) {
  if (!(this instanceof _Style)) {
    return new _Style(v5197);
  }
  if (!core(v5197)) {
    error("A style must have a core reference");
    return;
  }
  this._private = {
    cy: v5197,
    coreStyle: {}
  };
  this.length = 0;
  this.resetToDefault();
};
var styfn = _Style.prototype;
styfn.instanceString = function () {
  return "style";
};
styfn.clear = function () {
  var v5198 = this._private;
  var v5199 = v5198.cy;
  var v5200 = v5199.elements();
  for (var v5201 = 0; v5201 < this.length; v5201++) {
    this[v5201] = undefined;
  }
  this.length = 0;
  v5198.contextStyles = {};
  v5198.propDiffs = {};
  this.cleanElements(v5200, true);
  v5200.forEach(function (v5202) {
    var v5203 = v5202[0]._private;
    v5203.styleDirty = true;
    v5203.appliedInitStyle = false;
  });
  return this;
};
styfn.resetToDefault = function () {
  this.clear();
  this.addDefaultStylesheet();
  return this;
};
styfn.core = function (v5204) {
  return this._private.coreStyle[v5204] || this.getDefaultProperty(v5204);
};
styfn.selector = function (v5205) {
  var v5206 = v5205 === "core" ? null : new Selector(v5205);
  var v5207 = this.length++;
  this[v5207] = {
    selector: v5206,
    properties: [],
    mappedProperties: [],
    index: v5207
  };
  return this;
};
styfn.css = function () {
  var v5208 = this;
  var v5209 = arguments;
  if (v5209.length === 1) {
    var v5210 = v5209[0];
    for (var v5211 = 0; v5211 < v5208.properties.length; v5211++) {
      var v5212 = v5208.properties[v5211];
      var v5213 = v5210[v5212.name];
      if (v5213 === undefined) {
        v5213 = v5210[dash2camel(v5212.name)];
      }
      if (v5213 !== undefined) {
        this.cssRule(v5212.name, v5213);
      }
    }
  } else if (v5209.length === 2) {
    this.cssRule(v5209[0], v5209[1]);
  }
  return this;
};
styfn.style = styfn.css;
styfn.cssRule = function (v5214, v5215) {
  var v5216 = this.parse(v5214, v5215);
  if (v5216) {
    var v5217 = this.length - 1;
    this[v5217].properties.push(v5216);
    this[v5217].properties[v5216.name] = v5216;
    if (v5216.name.match(/pie-(\d+)-background-size/) && v5216.value) {
      this._private.hasPie = true;
    }
    if (v5216.name.match(/stripe-(\d+)-background-size/) && v5216.value) {
      this._private.hasStripe = true;
    }
    if (v5216.mapped) {
      this[v5217].mappedProperties.push(v5216);
    }
    var v5218 = !this[v5217].selector;
    if (v5218) {
      this._private.coreStyle[v5216.name] = v5216;
    }
  }
  return this;
};
styfn.append = function (v5219) {
  if (stylesheet(v5219)) {
    v5219.appendToStyle(this);
  } else if (array(v5219)) {
    this.appendFromJson(v5219);
  } else if (string(v5219)) {
    this.appendFromString(v5219);
  }
  return this;
};
_Style.fromJson = function (v5220, v5221) {
  var v5222 = new _Style(v5220);
  v5222.fromJson(v5221);
  return v5222;
};
_Style.fromString = function (v5223, v5224) {
  return new _Style(v5223).fromString(v5224);
};
[styfn$8, styfn$7, styfn$6, styfn$5, styfn$4, styfn$3, styfn$2, styfn$1].forEach(function (v5225) {
  extend(styfn, v5225);
});
_Style.types = styfn.types;
_Style.properties = styfn.properties;
_Style.propertyGroups = styfn.propertyGroups;
_Style.propertyGroupNames = styfn.propertyGroupNames;
_Style.propertyGroupKeys = styfn.propertyGroupKeys;
var corefn$2 = {
  style: function style2(v5226) {
    if (v5226) {
      var v5227 = this.setStyle(v5226);
      v5227.update();
    }
    return this._private.style;
  },
  setStyle: function setStyle(v5228) {
    var v5229 = this._private;
    if (stylesheet(v5228)) {
      v5229.style = v5228.generateStyle(this);
    } else if (array(v5228)) {
      v5229.style = _Style.fromJson(this, v5228);
    } else if (string(v5228)) {
      v5229.style = _Style.fromString(this, v5228);
    } else {
      v5229.style = _Style(this);
    }
    return v5229.style;
  },
  updateStyle: function updateStyle2() {
    this.mutableElements().updateStyle();
  }
};
var defaultSelectionType = "single";
var corefn$1 = {
  autolock: function autolock(v5230) {
    if (v5230 !== undefined) {
      this._private.autolock = v5230 ? true : false;
    } else {
      return this._private.autolock;
    }
    return this;
  },
  autoungrabify: function autoungrabify(v5231) {
    if (v5231 !== undefined) {
      this._private.autoungrabify = v5231 ? true : false;
    } else {
      return this._private.autoungrabify;
    }
    return this;
  },
  autounselectify: function autounselectify(v5232) {
    if (v5232 !== undefined) {
      this._private.autounselectify = v5232 ? true : false;
    } else {
      return this._private.autounselectify;
    }
    return this;
  },
  selectionType: function selectionType(v5233) {
    var v5234 = this._private;
    if (v5234.selectionType == null) {
      v5234.selectionType = defaultSelectionType;
    }
    if (v5233 !== undefined) {
      if (v5233 === "additive" || v5233 === "single") {
        v5234.selectionType = v5233;
      }
    } else {
      return v5234.selectionType;
    }
    return this;
  },
  panningEnabled: function panningEnabled(v5235) {
    if (v5235 !== undefined) {
      this._private.panningEnabled = v5235 ? true : false;
    } else {
      return this._private.panningEnabled;
    }
    return this;
  },
  userPanningEnabled: function userPanningEnabled(v5236) {
    if (v5236 !== undefined) {
      this._private.userPanningEnabled = v5236 ? true : false;
    } else {
      return this._private.userPanningEnabled;
    }
    return this;
  },
  zoomingEnabled: function zoomingEnabled(v5237) {
    if (v5237 !== undefined) {
      this._private.zoomingEnabled = v5237 ? true : false;
    } else {
      return this._private.zoomingEnabled;
    }
    return this;
  },
  userZoomingEnabled: function userZoomingEnabled(v5238) {
    if (v5238 !== undefined) {
      this._private.userZoomingEnabled = v5238 ? true : false;
    } else {
      return this._private.userZoomingEnabled;
    }
    return this;
  },
  boxSelectionEnabled: function boxSelectionEnabled(v5239) {
    if (v5239 !== undefined) {
      this._private.boxSelectionEnabled = v5239 ? true : false;
    } else {
      return this._private.boxSelectionEnabled;
    }
    return this;
  },
  pan: function pan() {
    var v5240 = arguments;
    var v5241 = this._private.pan;
    var v5242;
    var v5243;
    var v5244;
    var v5245;
    var v5246;
    switch (v5240.length) {
      case 0:
        return v5241;
      case 1:
        if (string(v5240[0])) {
          v5242 = v5240[0];
          return v5241[v5242];
        } else if (plainObject(v5240[0])) {
          if (!this._private.panningEnabled) {
            return this;
          }
          v5244 = v5240[0];
          v5245 = v5244.x;
          v5246 = v5244.y;
          if (number$1(v5245)) {
            v5241.x = v5245;
          }
          if (number$1(v5246)) {
            v5241.y = v5246;
          }
          this.emit("pan viewport");
        }
        break;
      case 2:
        if (!this._private.panningEnabled) {
          return this;
        }
        v5242 = v5240[0];
        v5243 = v5240[1];
        if ((v5242 === "x" || v5242 === "y") && number$1(v5243)) {
          v5241[v5242] = v5243;
        }
        this.emit("pan viewport");
        break;
    }
    this.notify("viewport");
    return this;
  },
  panBy: function panBy(v5247, v5248) {
    var v5249 = arguments;
    var v5250 = this._private.pan;
    var v5251;
    var v5252;
    var v5253;
    var v5254;
    var v5255;
    if (!this._private.panningEnabled) {
      return this;
    }
    switch (v5249.length) {
      case 1:
        if (plainObject(v5247)) {
          v5253 = v5249[0];
          v5254 = v5253.x;
          v5255 = v5253.y;
          if (number$1(v5254)) {
            v5250.x += v5254;
          }
          if (number$1(v5255)) {
            v5250.y += v5255;
          }
          this.emit("pan viewport");
        }
        break;
      case 2:
        v5251 = v5247;
        v5252 = v5248;
        if ((v5251 === "x" || v5251 === "y") && number$1(v5252)) {
          v5250[v5251] += v5252;
        }
        this.emit("pan viewport");
        break;
    }
    this.notify("viewport");
    return this;
  },
  gc: function gc() {
    this.notify("gc");
  },
  fit: function fit(v5256, v5257) {
    var v5258 = this.getFitViewport(v5256, v5257);
    if (v5258) {
      var v5259 = this._private;
      v5259.zoom = v5258.zoom;
      v5259.pan = v5258.pan;
      this.emit("pan zoom viewport");
      this.notify("viewport");
    }
    return this;
  },
  getFitViewport: function getFitViewport(v5260, v5261) {
    if (number$1(v5260) && v5261 === undefined) {
      v5261 = v5260;
      v5260 = undefined;
    }
    if (!this._private.panningEnabled || !this._private.zoomingEnabled) {
      return;
    }
    var v5262;
    if (string(v5260)) {
      var v5263 = v5260;
      v5260 = this.$(v5263);
    } else if (boundingBox(v5260)) {
      var v5264 = v5260;
      v5262 = {
        x1: v5264.x1,
        y1: v5264.y1,
        x2: v5264.x2,
        y2: v5264.y2
      };
      v5262.w = v5262.x2 - v5262.x1;
      v5262.h = v5262.y2 - v5262.y1;
    } else if (!elementOrCollection(v5260)) {
      v5260 = this.mutableElements();
    }
    if (elementOrCollection(v5260) && v5260.empty()) {
      return;
    }
    v5262 = v5262 || v5260.boundingBox();
    var v5265 = this.width();
    var v5266 = this.height();
    var v5267;
    v5261 = number$1(v5261) ? v5261 : 0;
    if (!isNaN(v5265) && !isNaN(v5266) && v5265 > 0 && v5266 > 0 && !isNaN(v5262.w) && !isNaN(v5262.h) && v5262.w > 0 && v5262.h > 0) {
      v5267 = Math.min((v5265 - v5261 * 2) / v5262.w, (v5266 - v5261 * 2) / v5262.h);
      v5267 = v5267 > this._private.maxZoom ? this._private.maxZoom : v5267;
      v5267 = v5267 < this._private.minZoom ? this._private.minZoom : v5267;
      var v5268 = {
        x: (v5265 - v5267 * (v5262.x1 + v5262.x2)) / 2,
        y: (v5266 - v5267 * (v5262.y1 + v5262.y2)) / 2
      };
      return {
        zoom: v5267,
        pan: v5268
      };
    }
    return;
  },
  zoomRange: function zoomRange(v5269, v5270) {
    var v5271 = this._private;
    if (v5270 == null) {
      var v5272 = v5269;
      v5269 = v5272.min;
      v5270 = v5272.max;
    }
    if (number$1(v5269) && number$1(v5270) && v5269 <= v5270) {
      v5271.minZoom = v5269;
      v5271.maxZoom = v5270;
    } else if (number$1(v5269) && v5270 === undefined && v5269 <= v5271.maxZoom) {
      v5271.minZoom = v5269;
    } else if (number$1(v5270) && v5269 === undefined && v5270 >= v5271.minZoom) {
      v5271.maxZoom = v5270;
    }
    return this;
  },
  minZoom: function minZoom(v5273) {
    if (v5273 === undefined) {
      return this._private.minZoom;
    } else {
      return this.zoomRange({
        min: v5273
      });
    }
  },
  maxZoom: function maxZoom(v5274) {
    if (v5274 === undefined) {
      return this._private.maxZoom;
    } else {
      return this.zoomRange({
        max: v5274
      });
    }
  },
  getZoomedViewport: function getZoomedViewport(v5275) {
    var v5276 = this._private;
    var v5277 = v5276.pan;
    var v5278 = v5276.zoom;
    var v5279;
    var v5280;
    var v5281 = false;
    if (!v5276.zoomingEnabled) {
      v5281 = true;
    }
    if (number$1(v5275)) {
      v5280 = v5275;
    } else if (plainObject(v5275)) {
      v5280 = v5275.level;
      if (v5275.position != null) {
        v5279 = modelToRenderedPosition$1(v5275.position, v5278, v5277);
      } else if (v5275.renderedPosition != null) {
        v5279 = v5275.renderedPosition;
      }
      if (v5279 != null && !v5276.panningEnabled) {
        v5281 = true;
      }
    }
    v5280 = v5280 > v5276.maxZoom ? v5276.maxZoom : v5280;
    v5280 = v5280 < v5276.minZoom ? v5276.minZoom : v5280;
    if (v5281 || !number$1(v5280) || v5280 === v5278 || v5279 != null && (!number$1(v5279.x) || !number$1(v5279.y))) {
      return null;
    }
    if (v5279 != null) {
      var v5282 = v5277;
      var v5283 = v5278;
      var v5284 = v5280;
      var v5285 = {
        x: -v5284 / v5283 * (v5279.x - v5282.x) + v5279.x,
        y: -v5284 / v5283 * (v5279.y - v5282.y) + v5279.y
      };
      return {
        zoomed: true,
        panned: true,
        zoom: v5284,
        pan: v5285
      };
    } else {
      return {
        zoomed: true,
        panned: false,
        zoom: v5280,
        pan: v5277
      };
    }
  },
  zoom: function zoom(v5286) {
    if (v5286 === undefined) {
      return this._private.zoom;
    } else {
      var v5287 = this.getZoomedViewport(v5286);
      var v5288 = this._private;
      if (v5287 == null || !v5287.zoomed) {
        return this;
      }
      v5288.zoom = v5287.zoom;
      if (v5287.panned) {
        v5288.pan.x = v5287.pan.x;
        v5288.pan.y = v5287.pan.y;
      }
      this.emit("zoom" + (v5287.panned ? " pan" : "") + " viewport");
      this.notify("viewport");
      return this;
    }
  },
  viewport: function viewport(v5289) {
    var v5290 = this._private;
    var v5291 = true;
    var v5292 = true;
    var v5293 = [];
    var v5294 = false;
    var v5295 = false;
    if (!v5289) {
      return this;
    }
    if (!number$1(v5289.zoom)) {
      v5291 = false;
    }
    if (!plainObject(v5289.pan)) {
      v5292 = false;
    }
    if (!v5291 && !v5292) {
      return this;
    }
    if (v5291) {
      var v5296 = v5289.zoom;
      if (v5296 < v5290.minZoom || v5296 > v5290.maxZoom || !v5290.zoomingEnabled) {
        v5294 = true;
      } else {
        v5290.zoom = v5296;
        v5293.push("zoom");
      }
    }
    if (v5292 && (!v5294 || !v5289.cancelOnFailedZoom) && v5290.panningEnabled) {
      var v5297 = v5289.pan;
      if (number$1(v5297.x)) {
        v5290.pan.x = v5297.x;
        v5295 = false;
      }
      if (number$1(v5297.y)) {
        v5290.pan.y = v5297.y;
        v5295 = false;
      }
      if (!v5295) {
        v5293.push("pan");
      }
    }
    if (v5293.length > 0) {
      v5293.push("viewport");
      this.emit(v5293.join(" "));
      this.notify("viewport");
    }
    return this;
  },
  center: function center(v5298) {
    var v5299 = this.getCenterPan(v5298);
    if (v5299) {
      this._private.pan = v5299;
      this.emit("pan viewport");
      this.notify("viewport");
    }
    return this;
  },
  getCenterPan: function getCenterPan(v5300, v5301) {
    if (!this._private.panningEnabled) {
      return;
    }
    if (string(v5300)) {
      var v5302 = v5300;
      v5300 = this.mutableElements().filter(v5302);
    } else if (!elementOrCollection(v5300)) {
      v5300 = this.mutableElements();
    }
    if (v5300.length === 0) {
      return;
    }
    var v5303 = v5300.boundingBox();
    var v5304 = this.width();
    var v5305 = this.height();
    v5301 = v5301 === undefined ? this._private.zoom : v5301;
    var v5306 = {
      x: (v5304 - v5301 * (v5303.x1 + v5303.x2)) / 2,
      y: (v5305 - v5301 * (v5303.y1 + v5303.y2)) / 2
    };
    return v5306;
  },
  reset: function reset() {
    if (!this._private.panningEnabled || !this._private.zoomingEnabled) {
      return this;
    }
    this.viewport({
      pan: {
        x: 0,
        y: 0
      },
      zoom: 1
    });
    return this;
  },
  invalidateSize: function invalidateSize() {
    this._private.sizeCache = null;
  },
  size: function size2() {
    var v5307 = this._private;
    var v5308 = v5307.container;
    var v5309 = this;
    return v5307.sizeCache = v5307.sizeCache || (v5308 ? function () {
      var v5310 = v5309.window().getComputedStyle(v5308);
      var v5311 = function v5312(v5313) {
        return parseFloat(v5310.getPropertyValue(v5313));
      };
      return {
        width: v5308.clientWidth - v5311("padding-left") - v5311("padding-right"),
        height: v5308.clientHeight - v5311("padding-top") - v5311("padding-bottom")
      };
    }() : {
      width: 1,
      height: 1
    });
  },
  width: function width() {
    return this.size().width;
  },
  height: function height() {
    return this.size().height;
  },
  extent: function extent() {
    var v5314 = this._private.pan;
    var v5315 = this._private.zoom;
    var v5316 = this.renderedExtent();
    var v5317 = {
      x1: (v5316.x1 - v5314.x) / v5315,
      x2: (v5316.x2 - v5314.x) / v5315,
      y1: (v5316.y1 - v5314.y) / v5315,
      y2: (v5316.y2 - v5314.y) / v5315
    };
    v5317.w = v5317.x2 - v5317.x1;
    v5317.h = v5317.y2 - v5317.y1;
    return v5317;
  },
  renderedExtent: function renderedExtent() {
    var v5318 = this.width();
    var v5319 = this.height();
    return {
      x1: 0,
      y1: 0,
      x2: v5318,
      y2: v5319,
      w: v5318,
      h: v5319
    };
  },
  multiClickDebounceTime: function multiClickDebounceTime(v5320) {
    if (v5320) {
      this._private.multiClickDebounceTime = v5320;
    } else {
      return this._private.multiClickDebounceTime;
    }
    return this;
  }
};
corefn$1.centre = corefn$1.center;
corefn$1.autolockNodes = corefn$1.autolock;
corefn$1.autoungrabifyNodes = corefn$1.autoungrabify;
var fn2 = {
  data: define.data({
    field: "data",
    bindingEvent: "data",
    allowBinding: true,
    allowSetting: true,
    settingEvent: "data",
    settingTriggersEvent: true,
    triggerFnName: "trigger",
    allowGetting: true,
    updateStyle: true
  }),
  removeData: define.removeData({
    field: "data",
    event: "data",
    triggerFnName: "trigger",
    triggerEvent: true,
    updateStyle: true
  }),
  scratch: define.data({
    field: "scratch",
    bindingEvent: "scratch",
    allowBinding: true,
    allowSetting: true,
    settingEvent: "scratch",
    settingTriggersEvent: true,
    triggerFnName: "trigger",
    allowGetting: true,
    updateStyle: true
  }),
  removeScratch: define.removeData({
    field: "scratch",
    event: "scratch",
    triggerFnName: "trigger",
    triggerEvent: true,
    updateStyle: true
  })
};
fn2.attr = fn2.data;
fn2.removeAttr = fn2.removeData;
var Core = function Core2(v5321) {
  var v5322 = this;
  v5321 = extend({}, v5321);
  var v5323 = v5321.container;
  if (v5323 && !htmlElement(v5323) && htmlElement(v5323[0])) {
    v5323 = v5323[0];
  }
  var v5324 = v5323 ? v5323._cyreg : null;
  v5324 = v5324 || {};
  if (v5324 && v5324.cy) {
    v5324.cy.destroy();
    v5324 = {};
  }
  var v5325 = v5324.readies = v5324.readies || [];
  if (v5323) {
    v5323._cyreg = v5324;
  }
  v5324.cy = v5322;
  var v5326 = _window !== undefined && v5323 !== undefined && !v5321.headless;
  var v5327 = v5321;
  v5327.layout = extend({
    name: v5326 ? "grid" : "null"
  }, v5327.layout);
  v5327.renderer = extend({
    name: v5326 ? "canvas" : "null"
  }, v5327.renderer);
  var v5328 = function v5329(v5330, v5331, v5332) {
    if (v5331 !== undefined) {
      return v5331;
    } else if (v5332 !== undefined) {
      return v5332;
    } else {
      return v5330;
    }
  };
  var v5333 = this._private = {
    container: v5323,
    ready: false,
    options: v5327,
    elements: new Collection(this),
    listeners: [],
    aniEles: new Collection(this),
    data: v5327.data || {},
    scratch: {},
    layout: null,
    renderer: null,
    destroyed: false,
    notificationsEnabled: true,
    minZoom: 1e-50,
    maxZoom: 1e+50,
    zoomingEnabled: v5328(true, v5327.zoomingEnabled),
    userZoomingEnabled: v5328(true, v5327.userZoomingEnabled),
    panningEnabled: v5328(true, v5327.panningEnabled),
    userPanningEnabled: v5328(true, v5327.userPanningEnabled),
    boxSelectionEnabled: v5328(true, v5327.boxSelectionEnabled),
    autolock: v5328(false, v5327.autolock, v5327.autolockNodes),
    autoungrabify: v5328(false, v5327.autoungrabify, v5327.autoungrabifyNodes),
    autounselectify: v5328(false, v5327.autounselectify),
    styleEnabled: v5327.styleEnabled === undefined ? v5326 : v5327.styleEnabled,
    zoom: number$1(v5327.zoom) ? v5327.zoom : 1,
    pan: {
      x: plainObject(v5327.pan) && number$1(v5327.pan.x) ? v5327.pan.x : 0,
      y: plainObject(v5327.pan) && number$1(v5327.pan.y) ? v5327.pan.y : 0
    },
    animation: {
      current: [],
      queue: []
    },
    hasCompoundNodes: false,
    multiClickDebounceTime: v5328(250, v5327.multiClickDebounceTime)
  };
  this.createEmitter();
  this.selectionType(v5327.selectionType);
  this.zoomRange({
    min: v5327.minZoom,
    max: v5327.maxZoom
  });
  var v5334 = function v5335(v5336, v5337) {
    var v5338 = v5336.some(promise);
    if (v5338) {
      return Promise$1.all(v5336).then(v5337);
    } else {
      v5337(v5336);
    }
  };
  if (v5333.styleEnabled) {
    v5322.setStyle([]);
  }
  var v5339 = extend({}, v5327, v5327.renderer);
  v5322.initRenderer(v5339);
  var v5340 = function v5341(v5342, v5343, v5344) {
    v5322.notifications(false);
    var v5345 = v5322.mutableElements();
    if (v5345.length > 0) {
      v5345.remove();
    }
    if (v5342 != null) {
      if (plainObject(v5342) || array(v5342)) {
        v5322.add(v5342);
      }
    }
    v5322.one("layoutready", function (v5346) {
      v5322.notifications(true);
      v5322.emit(v5346);
      v5322.one("load", v5343);
      v5322.emitAndNotify("load");
    }).one("layoutstop", function () {
      v5322.one("done", v5344);
      v5322.emit("done");
    });
    var v5347 = extend({}, v5322._private.options.layout);
    v5347.eles = v5322.elements();
    v5322.layout(v5347).run();
  };
  v5334([v5327.style, v5327.elements], function (v5348) {
    var v5349 = v5348[0];
    var v5350 = v5348[1];
    if (v5333.styleEnabled) {
      v5322.style().append(v5349);
    }
    v5340(v5350, function () {
      v5322.startAnimationLoop();
      v5333.ready = true;
      if (fn$6(v5327.ready)) {
        v5322.on("ready", v5327.ready);
      }
      for (var v5351 = 0; v5351 < v5325.length; v5351++) {
        var v5352 = v5325[v5351];
        v5322.on("ready", v5352);
      }
      if (v5324) {
        v5324.readies = [];
      }
      v5322.emit("ready");
    }, v5327.done);
  });
};
var corefn = Core.prototype;
extend(corefn, {
  instanceString: function instanceString3() {
    return "core";
  },
  isReady: function isReady() {
    return this._private.ready;
  },
  destroyed: function destroyed() {
    return this._private.destroyed;
  },
  ready: function ready(v5353) {
    if (this.isReady()) {
      this.emitter().emit("ready", [], v5353);
    } else {
      this.on("ready", v5353);
    }
    return this;
  },
  destroy: function destroy() {
    var v5354 = this;
    if (v5354.destroyed()) {
      return;
    }
    v5354.stopAnimationLoop();
    v5354.destroyRenderer();
    this.emit("destroy");
    v5354._private.destroyed = true;
    return v5354;
  },
  hasElementWithId: function hasElementWithId(v5355) {
    return this._private.elements.hasElementWithId(v5355);
  },
  getElementById: function getElementById(v5356) {
    return this._private.elements.getElementById(v5356);
  },
  hasCompoundNodes: function hasCompoundNodes() {
    return this._private.hasCompoundNodes;
  },
  headless: function headless() {
    return this._private.renderer.isHeadless();
  },
  styleEnabled: function styleEnabled() {
    return this._private.styleEnabled;
  },
  addToPool: function addToPool(v5357) {
    this._private.elements.merge(v5357);
    return this;
  },
  removeFromPool: function removeFromPool(v5358) {
    this._private.elements.unmerge(v5358);
    return this;
  },
  container: function container() {
    return this._private.container || null;
  },
  window: function window2() {
    var v5359 = this._private.container;
    if (v5359 == null) {
      return _window;
    }
    var v5360 = this._private.container.ownerDocument;
    if (v5360 === undefined || v5360 == null) {
      return _window;
    }
    return v5360.defaultView || _window;
  },
  mount: function mount(v5361) {
    if (v5361 == null) {
      return;
    }
    var v5362 = this;
    var v5363 = v5362._private;
    var v5364 = v5363.options;
    if (!htmlElement(v5361) && htmlElement(v5361[0])) {
      v5361 = v5361[0];
    }
    v5362.stopAnimationLoop();
    v5362.destroyRenderer();
    v5363.container = v5361;
    v5363.styleEnabled = true;
    v5362.invalidateSize();
    v5362.initRenderer(extend({}, v5364, v5364.renderer, {
      name: v5364.renderer.name === "null" ? "canvas" : v5364.renderer.name
    }));
    v5362.startAnimationLoop();
    v5362.style(v5364.style);
    v5362.emit("mount");
    return v5362;
  },
  unmount: function unmount() {
    var v5365 = this;
    v5365.stopAnimationLoop();
    v5365.destroyRenderer();
    v5365.initRenderer({
      name: "null"
    });
    v5365.emit("unmount");
    return v5365;
  },
  options: function options() {
    return copy(this._private.options);
  },
  json: function json(v5366) {
    var v5367 = this;
    var v5368 = v5367._private;
    var v5369 = v5367.mutableElements();
    var v5370 = function v5371(v5372) {
      return v5367.getElementById(v5372.id());
    };
    if (plainObject(v5366)) {
      v5367.startBatch();
      if (v5366.elements) {
        var v5373 = {};
        var v5374 = function v5375(v5376, v5377) {
          var v5378 = [];
          var v5379 = [];
          for (var v5380 = 0; v5380 < v5376.length; v5380++) {
            var v5381 = v5376[v5380];
            if (!v5381.data.id) {
              warn("cy.json() cannot handle elements without an ID attribute");
              continue;
            }
            var v5382 = "" + v5381.data.id;
            var v5383 = v5367.getElementById(v5382);
            v5373[v5382] = true;
            if (v5383.length !== 0) {
              v5379.push({
                ele: v5383,
                json: v5381
              });
            } else if (v5377) {
              v5381.group = v5377;
              v5378.push(v5381);
            } else {
              v5378.push(v5381);
            }
          }
          v5367.add(v5378);
          for (var v5384 = 0; v5384 < v5379.length; v5384++) {
            var v5385 = v5379[v5384];
            var v5386 = v5385.ele;
            var v5387 = v5385.json;
            v5386.json(v5387);
          }
        };
        if (array(v5366.elements)) {
          v5374(v5366.elements);
        } else {
          var v5388 = ["nodes", "edges"];
          for (var v5389 = 0; v5389 < v5388.length; v5389++) {
            var v5390 = v5388[v5389];
            var v5391 = v5366.elements[v5390];
            if (array(v5391)) {
              v5374(v5391, v5390);
            }
          }
        }
        var v5392 = v5367.collection();
        v5369.filter(function (v5393) {
          return !v5373[v5393.id()];
        }).forEach(function (v5394) {
          if (v5394.isParent()) {
            v5392.merge(v5394);
          } else {
            v5394.remove();
          }
        });
        v5392.forEach(function (v5395) {
          return v5395.children().move({
            parent: null
          });
        });
        v5392.forEach(function (v5396) {
          return v5370(v5396).remove();
        });
      }
      if (v5366.style) {
        v5367.style(v5366.style);
      }
      if (v5366.zoom != null && v5366.zoom !== v5368.zoom) {
        v5367.zoom(v5366.zoom);
      }
      if (v5366.pan) {
        if (v5366.pan.x !== v5368.pan.x || v5366.pan.y !== v5368.pan.y) {
          v5367.pan(v5366.pan);
        }
      }
      if (v5366.data) {
        v5367.data(v5366.data);
      }
      var v5397 = ["minZoom", "maxZoom", "zoomingEnabled", "userZoomingEnabled", "panningEnabled", "userPanningEnabled", "boxSelectionEnabled", "autolock", "autoungrabify", "autounselectify", "multiClickDebounceTime"];
      for (var v5398 = 0; v5398 < v5397.length; v5398++) {
        var v5399 = v5397[v5398];
        if (v5366[v5399] != null) {
          v5367[v5399](v5366[v5399]);
        }
      }
      v5367.endBatch();
      return this;
    } else {
      var v5400 = !!v5366;
      var v5401 = {};
      if (v5400) {
        v5401.elements = this.elements().map(function (v5402) {
          return v5402.json();
        });
      } else {
        v5401.elements = {};
        v5369.forEach(function (v5403) {
          var v5404 = v5403.group();
          if (!v5401.elements[v5404]) {
            v5401.elements[v5404] = [];
          }
          v5401.elements[v5404].push(v5403.json());
        });
      }
      if (this._private.styleEnabled) {
        v5401.style = v5367.style().json();
      }
      v5401.data = copy(v5367.data());
      var v5405 = v5368.options;
      v5401.zoomingEnabled = v5368.zoomingEnabled;
      v5401.userZoomingEnabled = v5368.userZoomingEnabled;
      v5401.zoom = v5368.zoom;
      v5401.minZoom = v5368.minZoom;
      v5401.maxZoom = v5368.maxZoom;
      v5401.panningEnabled = v5368.panningEnabled;
      v5401.userPanningEnabled = v5368.userPanningEnabled;
      v5401.pan = copy(v5368.pan);
      v5401.boxSelectionEnabled = v5368.boxSelectionEnabled;
      v5401.renderer = copy(v5405.renderer);
      v5401.hideEdgesOnViewport = v5405.hideEdgesOnViewport;
      v5401.textureOnViewport = v5405.textureOnViewport;
      v5401.wheelSensitivity = v5405.wheelSensitivity;
      v5401.motionBlur = v5405.motionBlur;
      v5401.multiClickDebounceTime = v5405.multiClickDebounceTime;
      return v5401;
    }
  }
});
corefn.$id = corefn.getElementById;
[corefn$9, corefn$8, elesfn, corefn$7, corefn$6, corefn$5, corefn$4, corefn$3, corefn$2, corefn$1, fn2].forEach(function (v5406) {
  extend(corefn, v5406);
});
var defaults$7 = {
  fit: true,
  directed: false,
  direction: "downward",
  padding: 30,
  circle: false,
  grid: false,
  spacingFactor: 1.75,
  boundingBox: undefined,
  avoidOverlap: true,
  nodeDimensionsIncludeLabels: false,
  roots: undefined,
  depthSort: undefined,
  animate: false,
  animationDuration: 500,
  animationEasing: undefined,
  animateFilter: function animateFilter(v5407, v5408) {
    return true;
  },
  ready: undefined,
  stop: undefined,
  transform: function transform(v5409, v5410) {
    return v5410;
  }
};
var deprecatedOptionDefaults = {
  maximal: false,
  acyclic: false
};
var getInfo = function getInfo2(v5411) {
  return v5411.scratch("breadthfirst");
};
var setInfo = function setInfo2(v5412, v5413) {
  return v5412.scratch("breadthfirst", v5413);
};
function BreadthFirstLayout(v5414) {
  this.options = extend({}, defaults$7, deprecatedOptionDefaults, v5414);
}
BreadthFirstLayout.prototype.run = function () {
  var v5415 = this.options;
  var v5416 = v5415.cy;
  var v5417 = v5415.eles;
  var v5418 = v5417.nodes().filter(function (v5419) {
    return v5419.isChildless();
  });
  var v5420 = v5417;
  var v5421 = v5415.directed;
  var v5422 = v5415.acyclic || v5415.maximal || v5415.maximalAdjustments > 0;
  var v5423 = !!v5415.boundingBox;
  var v5424 = makeBoundingBox(v5423 ? v5415.boundingBox : structuredClone(v5416.extent()));
  var v5425;
  if (elementOrCollection(v5415.roots)) {
    v5425 = v5415.roots;
  } else if (array(v5415.roots)) {
    var v5426 = [];
    for (var v5427 = 0; v5427 < v5415.roots.length; v5427++) {
      var v5428 = v5415.roots[v5427];
      var v5429 = v5416.getElementById(v5428);
      v5426.push(v5429);
    }
    v5425 = v5416.collection(v5426);
  } else if (string(v5415.roots)) {
    v5425 = v5416.$(v5415.roots);
  } else if (v5421) {
    v5425 = v5418.roots();
  } else {
    var v5430 = v5417.components();
    v5425 = v5416.collection();
    var v5431 = function v5432() {
      var v5433 = v5430[v5434];
      var v5435 = v5433.maxDegree(false);
      var v5436 = v5433.filter(function (v5437) {
        return v5437.degree(false) === v5435;
      });
      v5425 = v5425.add(v5436);
    };
    for (var v5434 = 0; v5434 < v5430.length; v5434++) {
      v5431();
    }
  }
  var v5438 = [];
  var v5439 = {};
  var v5440 = function v5441(v5442, v5443) {
    if (v5438[v5443] == null) {
      v5438[v5443] = [];
    }
    var v5444 = v5438[v5443].length;
    v5438[v5443].push(v5442);
    setInfo(v5442, {
      index: v5444,
      depth: v5443
    });
  };
  var v5445 = function v5446(v5447, v5448) {
    var v5449 = getInfo(v5447);
    var v5450 = v5449.depth;
    var v5451 = v5449.index;
    v5438[v5450][v5451] = null;
    if (v5447.isChildless()) {
      v5440(v5447, v5448);
    }
  };
  v5420.bfs({
    roots: v5425,
    directed: v5415.directed,
    visit: function v5452(v5453, v5454, v5455, v5456, v5457) {
      var v5458 = v5453[0];
      var v5459 = v5458.id();
      if (v5458.isChildless()) {
        v5440(v5458, v5457);
      }
      v5439[v5459] = true;
    }
  });
  var v5460 = [];
  for (var v5461 = 0; v5461 < v5418.length; v5461++) {
    var v5462 = v5418[v5461];
    if (v5439[v5462.id()]) {
      continue;
    } else {
      v5460.push(v5462);
    }
  }
  var v5463 = function v5464(v5465) {
    var v5466 = v5438[v5465];
    for (var v5467 = 0; v5467 < v5466.length; v5467++) {
      var v5468 = v5466[v5467];
      if (v5468 == null) {
        v5466.splice(v5467, 1);
        v5467--;
        continue;
      }
      setInfo(v5468, {
        depth: v5465,
        index: v5467
      });
    }
  };
  var v5469 = function v5470(v5471, v5472) {
    var v5473 = getInfo(v5471);
    var v5474 = v5471.incomers().filter(function (v5475) {
      return v5475.isNode() && v5417.has(v5475);
    });
    var v5476 = -1;
    var v5477 = v5471.id();
    for (var v5478 = 0; v5478 < v5474.length; v5478++) {
      var v5479 = v5474[v5478];
      var v5480 = getInfo(v5479);
      v5476 = Math.max(v5476, v5480.depth);
    }
    if (v5473.depth <= v5476) {
      if (!v5415.acyclic && v5472[v5477]) {
        return null;
      }
      var v5481 = v5476 + 1;
      v5445(v5471, v5481);
      v5472[v5477] = v5481;
      return true;
    }
    return false;
  };
  if (v5421 && v5422) {
    var v5482 = [];
    var v5483 = {};
    var v5484 = function v5485(v5486) {
      return v5482.push(v5486);
    };
    var v5487 = function v5488() {
      return v5482.shift();
    };
    v5418.forEach(function (v5489) {
      return v5482.push(v5489);
    });
    while (v5482.length > 0) {
      var v5490 = v5487();
      var v5491 = v5469(v5490, v5483);
      if (v5491) {
        v5490.outgoers().filter(function (v5492) {
          return v5492.isNode() && v5417.has(v5492);
        }).forEach(v5484);
      } else if (v5491 === null) {
        warn("Detected double maximal shift for node `" + v5490.id() + "`.  Bailing maximal adjustment due to cycle.  Use `options.maximal: true` only on DAGs.");
        break;
      }
    }
  }
  var v5493 = 0;
  if (v5415.avoidOverlap) {
    for (var v5494 = 0; v5494 < v5418.length; v5494++) {
      var v5495 = v5418[v5494];
      var v5496 = v5495.layoutDimensions(v5415);
      var v5497 = v5496.w;
      var v5498 = v5496.h;
      v5493 = Math.max(v5493, v5497, v5498);
    }
  }
  var v5499 = {};
  var v5500 = function v5501(v5502) {
    if (v5499[v5502.id()]) {
      return v5499[v5502.id()];
    }
    var v5503 = getInfo(v5502).depth;
    var v5504 = v5502.neighborhood();
    var v5505 = 0;
    var v5506 = 0;
    for (var v5507 = 0; v5507 < v5504.length; v5507++) {
      var v5508 = v5504[v5507];
      if (v5508.isEdge() || v5508.isParent() || !v5418.has(v5508)) {
        continue;
      }
      var v5509 = getInfo(v5508);
      if (v5509 == null) {
        continue;
      }
      var v5510 = v5509.index;
      var v5511 = v5509.depth;
      if (v5510 == null || v5511 == null) {
        continue;
      }
      var v5512 = v5438[v5511].length;
      if (v5511 < v5503) {
        v5505 += v5510 / v5512;
        v5506++;
      }
    }
    v5506 = Math.max(1, v5506);
    v5505 = v5505 / v5506;
    if (v5506 === 0) {
      v5505 = 0;
    }
    v5499[v5502.id()] = v5505;
    return v5505;
  };
  var v5513 = function v5514(v5515, v5516) {
    var v5517 = v5500(v5515);
    var v5518 = v5500(v5516);
    var v5519 = v5517 - v5518;
    if (v5519 === 0) {
      return ascending(v5515.id(), v5516.id());
    } else {
      return v5519;
    }
  };
  if (v5415.depthSort !== undefined) {
    v5513 = v5415.depthSort;
  }
  var v5520 = v5438.length;
  for (var v5521 = 0; v5521 < v5520; v5521++) {
    v5438[v5521].sort(v5513);
    v5463(v5521);
  }
  var v5522 = [];
  for (var v5523 = 0; v5523 < v5460.length; v5523++) {
    v5522.push(v5460[v5523]);
  }
  var v5524 = function v5525() {
    for (var v5526 = 0; v5526 < v5520; v5526++) {
      v5463(v5526);
    }
  };
  if (v5522.length) {
    v5438.unshift(v5522);
    v5520 = v5438.length;
    v5524();
  }
  var v5527 = 0;
  for (var v5528 = 0; v5528 < v5520; v5528++) {
    v5527 = Math.max(v5438[v5528].length, v5527);
  }
  var v5529 = {
    x: v5424.x1 + v5424.w / 2,
    y: v5424.y1 + v5424.h / 2
  };
  var v5530 = v5418.reduce(function (v5531, v5532) {
    return function (v5533) {
      return {
        w: v5531.w === -1 ? v5533.w : (v5531.w + v5533.w) / 2,
        h: v5531.h === -1 ? v5533.h : (v5531.h + v5533.h) / 2
      };
    }(v5532.boundingBox({
      includeLabels: v5415.nodeDimensionsIncludeLabels
    }));
  }, {
    w: -1,
    h: -1
  });
  var v5534 = Math.max(v5520 === 1 ? 0 : v5423 ? (v5424.h - v5415.padding * 2 - v5530.h) / (v5520 - 1) : (v5424.h - v5415.padding * 2 - v5530.h) / (v5520 + 1), v5493);
  var v5535 = v5438.reduce(function (v5536, v5537) {
    return Math.max(v5536, v5537.length);
  }, 0);
  var v5538 = function v5539(v5540) {
    var v5541 = getInfo(v5540);
    var v5542 = v5541.depth;
    var v5543 = v5541.index;
    if (v5415.circle) {
      var v5544 = Math.min(v5424.w / 2 / v5520, v5424.h / 2 / v5520);
      v5544 = Math.max(v5544, v5493);
      var v5545 = v5544 * v5542 + v5544 - (v5520 > 0 && v5438[0].length <= 3 ? v5544 / 2 : 0);
      var v5546 = Math.PI * 2 / v5438[v5542].length * v5543;
      if (v5542 === 0 && v5438[0].length === 1) {
        v5545 = 1;
      }
      return {
        x: v5529.x + v5545 * Math.cos(v5546),
        y: v5529.y + v5545 * Math.sin(v5546)
      };
    } else {
      var v5547 = v5438[v5542].length;
      var v5548 = Math.max(v5547 === 1 ? 0 : v5423 ? (v5424.w - v5415.padding * 2 - v5530.w) / ((v5415.grid ? v5535 : v5547) - 1) : (v5424.w - v5415.padding * 2 - v5530.w) / ((v5415.grid ? v5535 : v5547) + 1), v5493);
      var v5549 = {
        x: v5529.x + (v5543 + 1 - (v5547 + 1) / 2) * v5548,
        y: v5529.y + (v5542 + 1 - (v5520 + 1) / 2) * v5534
      };
      return v5549;
    }
  };
  var v5550 = {
    downward: 0,
    leftward: 90,
    upward: 180,
    rightward: -90
  };
  if (Object.keys(v5550).indexOf(v5415.direction) === -1) {
    error(`Invalid direction '${v5415.direction}' specified for breadthfirst layout. Valid values are: ${Object.keys(v5550).join(", ")}`);
  }
  var v5551 = function v5552(v5553) {
    return rotatePosAndSkewByBox(v5538(v5553), v5424, v5550[v5415.direction]);
  };
  v5417.nodes().layoutPositions(this, v5415, v5551);
  return this;
};
var defaults$6 = {
  fit: true,
  padding: 30,
  boundingBox: undefined,
  avoidOverlap: true,
  nodeDimensionsIncludeLabels: false,
  spacingFactor: undefined,
  radius: undefined,
  startAngle: 3 / 2 * Math.PI,
  sweep: undefined,
  clockwise: true,
  sort: undefined,
  animate: false,
  animationDuration: 500,
  animationEasing: undefined,
  animateFilter: function animateFilter2(v5554, v5555) {
    return true;
  },
  ready: undefined,
  stop: undefined,
  transform: function transform2(v5556, v5557) {
    return v5557;
  }
};
function CircleLayout(v5558) {
  this.options = extend({}, defaults$6, v5558);
}
CircleLayout.prototype.run = function () {
  var v5559 = this.options;
  var v5560 = v5559;
  var v5561 = v5559.cy;
  var v5562 = v5560.eles;
  var v5563 = v5560.counterclockwise !== undefined ? !v5560.counterclockwise : v5560.clockwise;
  var v5564 = v5562.nodes().not(":parent");
  if (v5560.sort) {
    v5564 = v5564.sort(v5560.sort);
  }
  var v5565 = makeBoundingBox(v5560.boundingBox ? v5560.boundingBox : {
    x1: 0,
    y1: 0,
    w: v5561.width(),
    h: v5561.height()
  });
  var v5566 = {
    x: v5565.x1 + v5565.w / 2,
    y: v5565.y1 + v5565.h / 2
  };
  var v5567 = v5560.sweep === undefined ? Math.PI * 2 - Math.PI * 2 / v5564.length : v5560.sweep;
  var v5568 = v5567 / Math.max(1, v5564.length - 1);
  var v5569;
  var v5570 = 0;
  for (var v5571 = 0; v5571 < v5564.length; v5571++) {
    var v5572 = v5564[v5571];
    var v5573 = v5572.layoutDimensions(v5560);
    var v5574 = v5573.w;
    var v5575 = v5573.h;
    v5570 = Math.max(v5570, v5574, v5575);
  }
  if (number$1(v5560.radius)) {
    v5569 = v5560.radius;
  } else if (v5564.length <= 1) {
    v5569 = 0;
  } else {
    v5569 = Math.min(v5565.h, v5565.w) / 2 - v5570;
  }
  if (v5564.length > 1 && v5560.avoidOverlap) {
    v5570 *= 1.75;
    var v5576 = Math.cos(v5568) - Math.cos(0);
    var v5577 = Math.sin(v5568) - Math.sin(0);
    var v5578 = Math.sqrt(v5570 * v5570 / (v5576 * v5576 + v5577 * v5577));
    v5569 = Math.max(v5578, v5569);
  }
  var v5579 = function v5580(v5581, v5582) {
    var v5583 = v5560.startAngle + v5582 * v5568 * (v5563 ? 1 : -1);
    var v5584 = v5569 * Math.cos(v5583);
    var v5585 = v5569 * Math.sin(v5583);
    var v5586 = {
      x: v5566.x + v5584,
      y: v5566.y + v5585
    };
    return v5586;
  };
  v5562.nodes().layoutPositions(this, v5560, v5579);
  return this;
};
var defaults$5 = {
  fit: true,
  padding: 30,
  startAngle: 3 / 2 * Math.PI,
  sweep: undefined,
  clockwise: true,
  equidistant: false,
  minNodeSpacing: 10,
  boundingBox: undefined,
  avoidOverlap: true,
  nodeDimensionsIncludeLabels: false,
  height: undefined,
  width: undefined,
  spacingFactor: undefined,
  concentric: function concentric(v5587) {
    return v5587.degree();
  },
  levelWidth: function levelWidth(v5588) {
    return v5588.maxDegree() / 4;
  },
  animate: false,
  animationDuration: 500,
  animationEasing: undefined,
  animateFilter: function animateFilter3(v5589, v5590) {
    return true;
  },
  ready: undefined,
  stop: undefined,
  transform: function transform3(v5591, v5592) {
    return v5592;
  }
};
function ConcentricLayout(v5593) {
  this.options = extend({}, defaults$5, v5593);
}
ConcentricLayout.prototype.run = function () {
  var v5594 = this.options;
  var v5595 = v5594;
  var v5596 = v5595.counterclockwise !== undefined ? !v5595.counterclockwise : v5595.clockwise;
  var v5597 = v5594.cy;
  var v5598 = v5595.eles;
  var v5599 = v5598.nodes().not(":parent");
  var v5600 = makeBoundingBox(v5595.boundingBox ? v5595.boundingBox : {
    x1: 0,
    y1: 0,
    w: v5597.width(),
    h: v5597.height()
  });
  var v5601 = {
    x: v5600.x1 + v5600.w / 2,
    y: v5600.y1 + v5600.h / 2
  };
  var v5602 = [];
  var v5603 = 0;
  for (var v5604 = 0; v5604 < v5599.length; v5604++) {
    var v5605 = v5599[v5604];
    var v5606 = undefined;
    v5606 = v5595.concentric(v5605);
    v5602.push({
      value: v5606,
      node: v5605
    });
    v5605._private.scratch.concentric = v5606;
  }
  v5599.updateStyle();
  for (var v5607 = 0; v5607 < v5599.length; v5607++) {
    var v5608 = v5599[v5607];
    var v5609 = v5608.layoutDimensions(v5595);
    v5603 = Math.max(v5603, v5609.w, v5609.h);
  }
  v5602.sort(function (v5610, v5611) {
    return v5611.value - v5610.value;
  });
  var v5612 = v5595.levelWidth(v5599);
  var v5613 = [[]];
  var v5614 = v5613[0];
  for (var v5615 = 0; v5615 < v5602.length; v5615++) {
    var v5616 = v5602[v5615];
    if (v5614.length > 0) {
      var v5617 = Math.abs(v5614[0].value - v5616.value);
      if (v5617 >= v5612) {
        v5614 = [];
        v5613.push(v5614);
      }
    }
    v5614.push(v5616);
  }
  var v5618 = v5603 + v5595.minNodeSpacing;
  if (!v5595.avoidOverlap) {
    var v5619 = v5613.length > 0 && v5613[0].length > 1;
    var v5620 = Math.min(v5600.w, v5600.h) / 2 - v5618;
    var v5621 = v5620 / (v5613.length + v5619 ? 1 : 0);
    v5618 = Math.min(v5618, v5621);
  }
  var v5622 = 0;
  for (var v5623 = 0; v5623 < v5613.length; v5623++) {
    var v5624 = v5613[v5623];
    var v5625 = v5595.sweep === undefined ? Math.PI * 2 - Math.PI * 2 / v5624.length : v5595.sweep;
    var v5626 = v5624.dTheta = v5625 / Math.max(1, v5624.length - 1);
    if (v5624.length > 1 && v5595.avoidOverlap) {
      var v5627 = Math.cos(v5626) - Math.cos(0);
      var v5628 = Math.sin(v5626) - Math.sin(0);
      var v5629 = Math.sqrt(v5618 * v5618 / (v5627 * v5627 + v5628 * v5628));
      v5622 = Math.max(v5629, v5622);
    }
    v5624.r = v5622;
    v5622 += v5618;
  }
  if (v5595.equidistant) {
    var v5630 = 0;
    var v5631 = 0;
    for (var v5632 = 0; v5632 < v5613.length; v5632++) {
      var v5633 = v5613[v5632];
      var v5634 = v5633.r - v5631;
      v5630 = Math.max(v5630, v5634);
    }
    v5631 = 0;
    for (var v5635 = 0; v5635 < v5613.length; v5635++) {
      var v5636 = v5613[v5635];
      if (v5635 === 0) {
        v5631 = v5636.r;
      }
      v5636.r = v5631;
      v5631 += v5630;
    }
  }
  var v5637 = {};
  for (var v5638 = 0; v5638 < v5613.length; v5638++) {
    var v5639 = v5613[v5638];
    var v5640 = v5639.dTheta;
    var v5641 = v5639.r;
    for (var v5642 = 0; v5642 < v5639.length; v5642++) {
      var v5643 = v5639[v5642];
      var v5644 = v5595.startAngle + (v5596 ? 1 : -1) * v5640 * v5642;
      var v5645 = {
        x: v5601.x + v5641 * Math.cos(v5644),
        y: v5601.y + v5641 * Math.sin(v5644)
      };
      v5637[v5643.node.id()] = v5645;
    }
  }
  v5598.nodes().layoutPositions(this, v5595, function (v5646) {
    var v5647 = v5646.id();
    return v5637[v5647];
  });
  return this;
};
var DEBUG;
var defaults$4 = {
  ready: function ready2() {},
  stop: function stop3() {},
  animate: true,
  animationEasing: undefined,
  animationDuration: undefined,
  animateFilter: function animateFilter4(v5648, v5649) {
    return true;
  },
  animationThreshold: 250,
  refresh: 20,
  fit: true,
  padding: 30,
  boundingBox: undefined,
  nodeDimensionsIncludeLabels: false,
  randomize: false,
  componentSpacing: 40,
  nodeRepulsion: function nodeRepulsion(v5650) {
    return 2048;
  },
  nodeOverlap: 4,
  idealEdgeLength: function idealEdgeLength(v5651) {
    return 32;
  },
  edgeElasticity: function edgeElasticity(v5652) {
    return 32;
  },
  nestingFactor: 1.2,
  gravity: 1,
  numIter: 1000,
  initialTemp: 1000,
  coolingFactor: 0.99,
  minTemp: 1
};
function CoseLayout(v5653) {
  this.options = extend({}, defaults$4, v5653);
  this.options.layout = this;
  var v5654 = this.options.eles.nodes();
  var v5655 = this.options.eles.edges();
  var v5656 = v5655.filter(function (v5657) {
    var v5658 = v5657.source().data("id");
    var v5659 = v5657.target().data("id");
    var v5660 = v5654.some(function (v5661) {
      return v5661.data("id") === v5658;
    });
    var v5662 = v5654.some(function (v5663) {
      return v5663.data("id") === v5659;
    });
    return !v5660 || !v5662;
  });
  this.options.eles = this.options.eles.not(v5656);
}
CoseLayout.prototype.run = function () {
  var v5664 = this.options;
  var v5665 = v5664.cy;
  var v5666 = this;
  v5666.stopped = false;
  if (v5664.animate === true || v5664.animate === false) {
    v5666.emit({
      type: "layoutstart",
      layout: v5666
    });
  }
  if (v5664.debug === true) {
    DEBUG = true;
  } else {
    DEBUG = false;
  }
  var v5667 = createLayoutInfo(v5665, v5666, v5664);
  if (DEBUG) {
    printLayoutInfo(v5667);
  }
  if (v5664.randomize) {
    randomizePositions(v5667);
  }
  var v5668 = performanceNow();
  var v5669 = function v5670() {
    refreshPositions(v5667, v5665, v5664);
    if (v5664.fit === true) {
      v5665.fit(v5664.padding);
    }
  };
  var v5671 = function v5672(v5673) {
    if (v5666.stopped || v5673 >= v5664.numIter) {
      return false;
    }
    step(v5667, v5664);
    v5667.temperature = v5667.temperature * v5664.coolingFactor;
    if (v5667.temperature < v5664.minTemp) {
      return false;
    }
    return true;
  };
  var v5674 = function v5675() {
    if (v5664.animate === true || v5664.animate === false) {
      v5669();
      v5666.one("layoutstop", v5664.stop);
      v5666.emit({
        type: "layoutstop",
        layout: v5666
      });
    } else {
      var v5676 = v5664.eles.nodes();
      var v5677 = getScaleInBoundsFn(v5667, v5664, v5676);
      v5676.layoutPositions(v5666, v5664, v5677);
    }
  };
  var v5678 = 0;
  var v5679 = true;
  if (v5664.animate === true) {
    var v5680 = function v5681() {
      var v5682 = 0;
      while (v5679 && v5682 < v5664.refresh) {
        v5679 = v5671(v5678);
        v5678++;
        v5682++;
      }
      if (!v5679) {
        separateComponents(v5667, v5664);
        v5674();
      } else {
        var v5683 = performanceNow();
        if (v5683 - v5668 >= v5664.animationThreshold) {
          v5669();
        }
        requestAnimationFrame(v5680);
      }
    };
    v5680();
  } else {
    while (v5679) {
      v5679 = v5671(v5678);
      v5678++;
    }
    separateComponents(v5667, v5664);
    v5674();
  }
  return this;
};
CoseLayout.prototype.stop = function () {
  this.stopped = true;
  if (this.thread) {
    this.thread.stop();
  }
  this.emit("layoutstop");
  return this;
};
CoseLayout.prototype.destroy = function () {
  if (this.thread) {
    this.thread.stop();
  }
  return this;
};
var createLayoutInfo = function createLayoutInfo2(v5684, v5685, v5686) {
  var v5687 = v5686.eles.edges();
  var v5688 = v5686.eles.nodes();
  var v5689 = makeBoundingBox(v5686.boundingBox ? v5686.boundingBox : {
    x1: 0,
    y1: 0,
    w: v5684.width(),
    h: v5684.height()
  });
  var v5690 = {
    isCompound: v5684.hasCompoundNodes(),
    layoutNodes: [],
    idToIndex: {},
    nodeSize: v5688.size(),
    graphSet: [],
    indexToGraph: [],
    layoutEdges: [],
    edgeSize: v5687.size(),
    temperature: v5686.initialTemp,
    clientWidth: v5689.w,
    clientHeight: v5689.h,
    boundingBox: v5689
  };
  var v5691 = v5686.eles.components();
  var v5692 = {};
  for (var v5693 = 0; v5693 < v5691.length; v5693++) {
    var v5694 = v5691[v5693];
    for (var v5695 = 0; v5695 < v5694.length; v5695++) {
      var v5696 = v5694[v5695];
      v5692[v5696.id()] = v5693;
    }
  }
  for (var v5693 = 0; v5693 < v5690.nodeSize; v5693++) {
    var v5697 = v5688[v5693];
    var v5698 = v5697.layoutDimensions(v5686);
    var v5699 = {};
    v5699.isLocked = v5697.locked();
    v5699.id = v5697.data("id");
    v5699.parentId = v5697.data("parent");
    v5699.cmptId = v5692[v5697.id()];
    v5699.children = [];
    v5699.positionX = v5697.position("x");
    v5699.positionY = v5697.position("y");
    v5699.offsetX = 0;
    v5699.offsetY = 0;
    v5699.height = v5698.w;
    v5699.width = v5698.h;
    v5699.maxX = v5699.positionX + v5699.width / 2;
    v5699.minX = v5699.positionX - v5699.width / 2;
    v5699.maxY = v5699.positionY + v5699.height / 2;
    v5699.minY = v5699.positionY - v5699.height / 2;
    v5699.padLeft = parseFloat(v5697.style("padding"));
    v5699.padRight = parseFloat(v5697.style("padding"));
    v5699.padTop = parseFloat(v5697.style("padding"));
    v5699.padBottom = parseFloat(v5697.style("padding"));
    v5699.nodeRepulsion = fn$6(v5686.nodeRepulsion) ? v5686.nodeRepulsion(v5697) : v5686.nodeRepulsion;
    v5690.layoutNodes.push(v5699);
    v5690.idToIndex[v5699.id] = v5693;
  }
  var v5700 = [];
  var v5701 = 0;
  var v5702 = -1;
  var v5703 = [];
  for (var v5693 = 0; v5693 < v5690.nodeSize; v5693++) {
    var v5697 = v5690.layoutNodes[v5693];
    var v5704 = v5697.parentId;
    if (v5704 != null) {
      v5690.layoutNodes[v5690.idToIndex[v5704]].children.push(v5697.id);
    } else {
      v5700[++v5702] = v5697.id;
      v5703.push(v5697.id);
    }
  }
  v5690.graphSet.push(v5703);
  while (v5701 <= v5702) {
    var v5705 = v5700[v5701++];
    var v5706 = v5690.idToIndex[v5705];
    var v5696 = v5690.layoutNodes[v5706];
    var v5707 = v5696.children;
    if (v5707.length > 0) {
      v5690.graphSet.push(v5707);
      for (var v5693 = 0; v5693 < v5707.length; v5693++) {
        v5700[++v5702] = v5707[v5693];
      }
    }
  }
  for (var v5693 = 0; v5693 < v5690.graphSet.length; v5693++) {
    var v5708 = v5690.graphSet[v5693];
    for (var v5695 = 0; v5695 < v5708.length; v5695++) {
      var v5709 = v5690.idToIndex[v5708[v5695]];
      v5690.indexToGraph[v5709] = v5693;
    }
  }
  for (var v5693 = 0; v5693 < v5690.edgeSize; v5693++) {
    var v5710 = v5687[v5693];
    var v5711 = {};
    v5711.id = v5710.data("id");
    v5711.sourceId = v5710.data("source");
    v5711.targetId = v5710.data("target");
    var v5712 = fn$6(v5686.idealEdgeLength) ? v5686.idealEdgeLength(v5710) : v5686.idealEdgeLength;
    var v5713 = fn$6(v5686.edgeElasticity) ? v5686.edgeElasticity(v5710) : v5686.edgeElasticity;
    var v5714 = v5690.idToIndex[v5711.sourceId];
    var v5715 = v5690.idToIndex[v5711.targetId];
    var v5716 = v5690.indexToGraph[v5714];
    var v5717 = v5690.indexToGraph[v5715];
    if (v5716 != v5717) {
      var v5718 = findLCA(v5711.sourceId, v5711.targetId, v5690);
      var v5719 = v5690.graphSet[v5718];
      var v5720 = 0;
      var v5699 = v5690.layoutNodes[v5714];
      while (v5719.indexOf(v5699.id) === -1) {
        v5699 = v5690.layoutNodes[v5690.idToIndex[v5699.parentId]];
        v5720++;
      }
      v5699 = v5690.layoutNodes[v5715];
      while (v5719.indexOf(v5699.id) === -1) {
        v5699 = v5690.layoutNodes[v5690.idToIndex[v5699.parentId]];
        v5720++;
      }
      v5712 *= v5720 * v5686.nestingFactor;
    }
    v5711.idealLength = v5712;
    v5711.elasticity = v5713;
    v5690.layoutEdges.push(v5711);
  }
  return v5690;
};
var findLCA = function findLCA2(v5721, v5722, v5723) {
  var v5724 = _findLCA_aux(v5721, v5722, 0, v5723);
  if (v5724.count < 2) {
    return 0;
  } else {
    return v5724.graph;
  }
};
var _findLCA_aux = function findLCA_aux(v5725, v5726, v5727, v5728) {
  var v5729 = v5728.graphSet[v5727];
  if (v5729.indexOf(v5725) > -1 && v5729.indexOf(v5726) > -1) {
    return {
      count: 2,
      graph: v5727
    };
  }
  var v5730 = 0;
  for (var v5731 = 0; v5731 < v5729.length; v5731++) {
    var v5732 = v5729[v5731];
    var v5733 = v5728.idToIndex[v5732];
    var v5734 = v5728.layoutNodes[v5733].children;
    if (v5734.length === 0) {
      continue;
    }
    var v5735 = v5728.indexToGraph[v5728.idToIndex[v5734[0]]];
    var v5736 = _findLCA_aux(v5725, v5726, v5735, v5728);
    if (v5736.count === 0) {
      continue;
    } else if (v5736.count === 1) {
      v5730++;
      if (v5730 === 2) {
        break;
      }
    } else {
      return v5736;
    }
  }
  return {
    count: v5730,
    graph: v5727
  };
};
var printLayoutInfo;
var randomizePositions = function randomizePositions2(v5737, v5738) {
  var v5739 = v5737.clientWidth;
  var v5740 = v5737.clientHeight;
  for (var v5741 = 0; v5741 < v5737.nodeSize; v5741++) {
    var v5742 = v5737.layoutNodes[v5741];
    if (v5742.children.length === 0 && !v5742.isLocked) {
      v5742.positionX = Math.random() * v5739;
      v5742.positionY = Math.random() * v5740;
    }
  }
};
var getScaleInBoundsFn = function getScaleInBoundsFn2(v5743, v5744, v5745) {
  var v5746 = v5743.boundingBox;
  var v5747 = {
    x1: Infinity,
    x2: -Infinity,
    y1: Infinity,
    y2: -Infinity
  };
  if (v5744.boundingBox) {
    v5745.forEach(function (v5748) {
      var v5749 = v5743.layoutNodes[v5743.idToIndex[v5748.data("id")]];
      v5747.x1 = Math.min(v5747.x1, v5749.positionX);
      v5747.x2 = Math.max(v5747.x2, v5749.positionX);
      v5747.y1 = Math.min(v5747.y1, v5749.positionY);
      v5747.y2 = Math.max(v5747.y2, v5749.positionY);
    });
    v5747.w = v5747.x2 - v5747.x1;
    v5747.h = v5747.y2 - v5747.y1;
  }
  return function (v5750, v5751) {
    var v5752 = v5743.layoutNodes[v5743.idToIndex[v5750.data("id")]];
    if (v5744.boundingBox) {
      var v5753 = v5747.w === 0 ? 0.5 : (v5752.positionX - v5747.x1) / v5747.w;
      var v5754 = v5747.h === 0 ? 0.5 : (v5752.positionY - v5747.y1) / v5747.h;
      return {
        x: v5746.x1 + v5753 * v5746.w,
        y: v5746.y1 + v5754 * v5746.h
      };
    } else {
      return {
        x: v5752.positionX,
        y: v5752.positionY
      };
    }
  };
};
var refreshPositions = function refreshPositions2(v5755, v5756, v5757) {
  var v5758 = v5757.layout;
  var v5759 = v5757.eles.nodes();
  var v5760 = getScaleInBoundsFn(v5755, v5757, v5759);
  v5759.positions(v5760);
  if (v5755.ready !== true) {
    v5755.ready = true;
    v5758.one("layoutready", v5757.ready);
    v5758.emit({
      type: "layoutready",
      layout: this
    });
  }
};
var step = function step2(v5761, v5762, v5763) {
  calculateNodeForces(v5761, v5762);
  calculateEdgeForces(v5761);
  calculateGravityForces(v5761, v5762);
  propagateForces(v5761);
  updatePositions(v5761);
};
var calculateNodeForces = function calculateNodeForces2(v5764, v5765) {
  for (var v5766 = 0; v5766 < v5764.graphSet.length; v5766++) {
    var v5767 = v5764.graphSet[v5766];
    var v5768 = v5767.length;
    for (var v5769 = 0; v5769 < v5768; v5769++) {
      var v5770 = v5764.layoutNodes[v5764.idToIndex[v5767[v5769]]];
      for (var v5771 = v5769 + 1; v5771 < v5768; v5771++) {
        var v5772 = v5764.layoutNodes[v5764.idToIndex[v5767[v5771]]];
        nodeRepulsion2(v5770, v5772, v5764, v5765);
      }
    }
  }
};
var randomDistance = function randomDistance2(v5773) {
  return -v5773 + v5773 * 2 * Math.random();
};
var nodeRepulsion2 = function nodeRepulsion3(v5774, v5775, v5776, v5777) {
  var v5778 = v5774.cmptId;
  var v5779 = v5775.cmptId;
  if (v5778 !== v5779 && !v5776.isCompound) {
    return;
  }
  var v5780 = v5775.positionX - v5774.positionX;
  var v5781 = v5775.positionY - v5774.positionY;
  var v5782 = 1;
  if (v5780 === 0 && v5781 === 0) {
    v5780 = randomDistance(v5782);
    v5781 = randomDistance(v5782);
  }
  var v5783 = nodesOverlap(v5774, v5775, v5780, v5781);
  if (v5783 > 0) {
    var v5784 = v5777.nodeOverlap * v5783;
    var v5785 = Math.sqrt(v5780 * v5780 + v5781 * v5781);
    var v5786 = v5784 * v5780 / v5785;
    var v5787 = v5784 * v5781 / v5785;
  } else {
    var v5788 = findClippingPoint(v5774, v5780, v5781);
    var v5789 = findClippingPoint(v5775, v5780 * -1, v5781 * -1);
    var v5790 = v5789.x - v5788.x;
    var v5791 = v5789.y - v5788.y;
    var v5792 = v5790 * v5790 + v5791 * v5791;
    var v5785 = Math.sqrt(v5792);
    var v5784 = (v5774.nodeRepulsion + v5775.nodeRepulsion) / v5792;
    var v5786 = v5784 * v5790 / v5785;
    var v5787 = v5784 * v5791 / v5785;
  }
  if (!v5774.isLocked) {
    v5774.offsetX -= v5786;
    v5774.offsetY -= v5787;
  }
  if (!v5775.isLocked) {
    v5775.offsetX += v5786;
    v5775.offsetY += v5787;
  }
  return;
};
var nodesOverlap = function nodesOverlap2(v5793, v5794, v5795, v5796) {
  if (v5795 > 0) {
    var v5797 = v5793.maxX - v5794.minX;
  } else {
    var v5797 = v5794.maxX - v5793.minX;
  }
  if (v5796 > 0) {
    var v5798 = v5793.maxY - v5794.minY;
  } else {
    var v5798 = v5794.maxY - v5793.minY;
  }
  if (v5797 >= 0 && v5798 >= 0) {
    return Math.sqrt(v5797 * v5797 + v5798 * v5798);
  } else {
    return 0;
  }
};
var findClippingPoint = function findClippingPoint2(v5799, v5800, v5801) {
  var v5802 = v5799.positionX;
  var v5803 = v5799.positionY;
  var v5804 = v5799.height || 1;
  var v5805 = v5799.width || 1;
  var v5806 = v5801 / v5800;
  var v5807 = v5804 / v5805;
  var v5808 = {};
  if (v5800 === 0 && v5801 > 0) {
    v5808.x = v5802;
    v5808.y = v5803 + v5804 / 2;
    return v5808;
  }
  if (v5800 === 0 && v5801 < 0) {
    v5808.x = v5802;
    v5808.y = v5803 + v5804 / 2;
    return v5808;
  }
  if (v5800 > 0 && v5807 * -1 <= v5806 && v5806 <= v5807) {
    v5808.x = v5802 + v5805 / 2;
    v5808.y = v5803 + v5805 * v5801 / 2 / v5800;
    return v5808;
  }
  if (v5800 < 0 && v5807 * -1 <= v5806 && v5806 <= v5807) {
    v5808.x = v5802 - v5805 / 2;
    v5808.y = v5803 - v5805 * v5801 / 2 / v5800;
    return v5808;
  }
  if (v5801 > 0 && (v5806 <= v5807 * -1 || v5806 >= v5807)) {
    v5808.x = v5802 + v5804 * v5800 / 2 / v5801;
    v5808.y = v5803 + v5804 / 2;
    return v5808;
  }
  if (v5801 < 0 && (v5806 <= v5807 * -1 || v5806 >= v5807)) {
    v5808.x = v5802 - v5804 * v5800 / 2 / v5801;
    v5808.y = v5803 - v5804 / 2;
    return v5808;
  }
  return v5808;
};
var calculateEdgeForces = function calculateEdgeForces2(v5809, v5810) {
  for (var v5811 = 0; v5811 < v5809.edgeSize; v5811++) {
    var v5812 = v5809.layoutEdges[v5811];
    var v5813 = v5809.idToIndex[v5812.sourceId];
    var v5814 = v5809.layoutNodes[v5813];
    var v5815 = v5809.idToIndex[v5812.targetId];
    var v5816 = v5809.layoutNodes[v5815];
    var v5817 = v5816.positionX - v5814.positionX;
    var v5818 = v5816.positionY - v5814.positionY;
    if (v5817 === 0 && v5818 === 0) {
      continue;
    }
    var v5819 = findClippingPoint(v5814, v5817, v5818);
    var v5820 = findClippingPoint(v5816, v5817 * -1, v5818 * -1);
    var v5821 = v5820.x - v5819.x;
    var v5822 = v5820.y - v5819.y;
    var v5823 = Math.sqrt(v5821 * v5821 + v5822 * v5822);
    var v5824 = Math.pow(v5812.idealLength - v5823, 2) / v5812.elasticity;
    if (v5823 !== 0) {
      var v5825 = v5824 * v5821 / v5823;
      var v5826 = v5824 * v5822 / v5823;
    } else {
      var v5825 = 0;
      var v5826 = 0;
    }
    if (!v5814.isLocked) {
      v5814.offsetX += v5825;
      v5814.offsetY += v5826;
    }
    if (!v5816.isLocked) {
      v5816.offsetX -= v5825;
      v5816.offsetY -= v5826;
    }
  }
};
var calculateGravityForces = function calculateGravityForces2(v5827, v5828) {
  if (v5828.gravity === 0) {
    return;
  }
  var v5829 = 1;
  for (var v5830 = 0; v5830 < v5827.graphSet.length; v5830++) {
    var v5831 = v5827.graphSet[v5830];
    var v5832 = v5831.length;
    if (v5830 === 0) {
      var v5833 = v5827.clientHeight / 2;
      var v5834 = v5827.clientWidth / 2;
    } else {
      var v5835 = v5827.layoutNodes[v5827.idToIndex[v5831[0]]];
      var v5836 = v5827.layoutNodes[v5827.idToIndex[v5835.parentId]];
      var v5833 = v5836.positionX;
      var v5834 = v5836.positionY;
    }
    for (var v5837 = 0; v5837 < v5832; v5837++) {
      var v5838 = v5827.layoutNodes[v5827.idToIndex[v5831[v5837]]];
      if (v5838.isLocked) {
        continue;
      }
      var v5839 = v5833 - v5838.positionX;
      var v5840 = v5834 - v5838.positionY;
      var v5841 = Math.sqrt(v5839 * v5839 + v5840 * v5840);
      if (v5841 > v5829) {
        var v5842 = v5828.gravity * v5839 / v5841;
        var v5843 = v5828.gravity * v5840 / v5841;
        v5838.offsetX += v5842;
        v5838.offsetY += v5843;
      }
    }
  }
};
var propagateForces = function propagateForces2(v5844, v5845) {
  var v5846 = [];
  var v5847 = 0;
  var v5848 = -1;
  v5846.push.apply(v5846, v5844.graphSet[0]);
  v5848 += v5844.graphSet[0].length;
  while (v5847 <= v5848) {
    var v5849 = v5846[v5847++];
    var v5850 = v5844.idToIndex[v5849];
    var v5851 = v5844.layoutNodes[v5850];
    var v5852 = v5851.children;
    if (v5852.length > 0 && !v5851.isLocked) {
      var v5853 = v5851.offsetX;
      var v5854 = v5851.offsetY;
      for (var v5855 = 0; v5855 < v5852.length; v5855++) {
        var v5856 = v5844.layoutNodes[v5844.idToIndex[v5852[v5855]]];
        v5856.offsetX += v5853;
        v5856.offsetY += v5854;
        v5846[++v5848] = v5852[v5855];
      }
      v5851.offsetX = 0;
      v5851.offsetY = 0;
    }
  }
};
var updatePositions = function updatePositions2(v5857, v5858) {
  for (var v5859 = 0; v5859 < v5857.nodeSize; v5859++) {
    var v5860 = v5857.layoutNodes[v5859];
    if (v5860.children.length > 0) {
      v5860.maxX = undefined;
      v5860.minX = undefined;
      v5860.maxY = undefined;
      v5860.minY = undefined;
    }
  }
  for (var v5859 = 0; v5859 < v5857.nodeSize; v5859++) {
    var v5860 = v5857.layoutNodes[v5859];
    if (v5860.children.length > 0 || v5860.isLocked) {
      continue;
    }
    var v5861 = limitForce(v5860.offsetX, v5860.offsetY, v5857.temperature);
    v5860.positionX += v5861.x;
    v5860.positionY += v5861.y;
    v5860.offsetX = 0;
    v5860.offsetY = 0;
    v5860.minX = v5860.positionX - v5860.width;
    v5860.maxX = v5860.positionX + v5860.width;
    v5860.minY = v5860.positionY - v5860.height;
    v5860.maxY = v5860.positionY + v5860.height;
    _updateAncestryBoundaries(v5860, v5857);
  }
  for (var v5859 = 0; v5859 < v5857.nodeSize; v5859++) {
    var v5860 = v5857.layoutNodes[v5859];
    if (v5860.children.length > 0 && !v5860.isLocked) {
      v5860.positionX = (v5860.maxX + v5860.minX) / 2;
      v5860.positionY = (v5860.maxY + v5860.minY) / 2;
      v5860.width = v5860.maxX - v5860.minX;
      v5860.height = v5860.maxY - v5860.minY;
    }
  }
};
var limitForce = function limitForce2(v5862, v5863, v5864) {
  var v5865 = Math.sqrt(v5862 * v5862 + v5863 * v5863);
  if (v5865 > v5864) {
    var v5866 = {
      x: v5864 * v5862 / v5865,
      y: v5864 * v5863 / v5865
    };
  } else {
    var v5866 = {
      x: v5862,
      y: v5863
    };
  }
  return v5866;
};
var _updateAncestryBoundaries = function updateAncestryBoundaries(v5867, v5868) {
  var v5869 = v5867.parentId;
  if (v5869 == null) {
    return;
  }
  var v5870 = v5868.layoutNodes[v5868.idToIndex[v5869]];
  var v5871 = false;
  if (v5870.maxX == null || v5867.maxX + v5870.padRight > v5870.maxX) {
    v5870.maxX = v5867.maxX + v5870.padRight;
    v5871 = true;
  }
  if (v5870.minX == null || v5867.minX - v5870.padLeft < v5870.minX) {
    v5870.minX = v5867.minX - v5870.padLeft;
    v5871 = true;
  }
  if (v5870.maxY == null || v5867.maxY + v5870.padBottom > v5870.maxY) {
    v5870.maxY = v5867.maxY + v5870.padBottom;
    v5871 = true;
  }
  if (v5870.minY == null || v5867.minY - v5870.padTop < v5870.minY) {
    v5870.minY = v5867.minY - v5870.padTop;
    v5871 = true;
  }
  if (v5871) {
    return _updateAncestryBoundaries(v5870, v5868);
  }
  return;
};
var separateComponents = function separateComponents2(v5872, v5873) {
  var v5874 = v5872.layoutNodes;
  var v5875 = [];
  for (var v5876 = 0; v5876 < v5874.length; v5876++) {
    var v5877 = v5874[v5876];
    var v5878 = v5877.cmptId;
    var v5879 = v5875[v5878] = v5875[v5878] || [];
    v5879.push(v5877);
  }
  var v5880 = 0;
  for (var v5876 = 0; v5876 < v5875.length; v5876++) {
    var v5881 = v5875[v5876];
    if (!v5881) {
      continue;
    }
    v5881.x1 = Infinity;
    v5881.x2 = -Infinity;
    v5881.y1 = Infinity;
    v5881.y2 = -Infinity;
    for (var v5882 = 0; v5882 < v5881.length; v5882++) {
      var v5883 = v5881[v5882];
      v5881.x1 = Math.min(v5881.x1, v5883.positionX - v5883.width / 2);
      v5881.x2 = Math.max(v5881.x2, v5883.positionX + v5883.width / 2);
      v5881.y1 = Math.min(v5881.y1, v5883.positionY - v5883.height / 2);
      v5881.y2 = Math.max(v5881.y2, v5883.positionY + v5883.height / 2);
    }
    v5881.w = v5881.x2 - v5881.x1;
    v5881.h = v5881.y2 - v5881.y1;
    v5880 += v5881.w * v5881.h;
  }
  v5875.sort(function (v5884, v5885) {
    return v5885.w * v5885.h - v5884.w * v5884.h;
  });
  var v5886 = 0;
  var v5887 = 0;
  var v5888 = 0;
  var v5889 = 0;
  var v5890 = Math.sqrt(v5880) * v5872.clientWidth / v5872.clientHeight;
  for (var v5876 = 0; v5876 < v5875.length; v5876++) {
    var v5881 = v5875[v5876];
    if (!v5881) {
      continue;
    }
    for (var v5882 = 0; v5882 < v5881.length; v5882++) {
      var v5883 = v5881[v5882];
      if (!v5883.isLocked) {
        v5883.positionX += v5886 - v5881.x1;
        v5883.positionY += v5887 - v5881.y1;
      }
    }
    v5886 += v5881.w + v5873.componentSpacing;
    v5888 += v5881.w + v5873.componentSpacing;
    v5889 = Math.max(v5889, v5881.h);
    if (v5888 > v5890) {
      v5887 += v5889 + v5873.componentSpacing;
      v5886 = 0;
      v5888 = 0;
      v5889 = 0;
    }
  }
};
var defaults$3 = {
  fit: true,
  padding: 30,
  boundingBox: undefined,
  avoidOverlap: true,
  avoidOverlapPadding: 10,
  nodeDimensionsIncludeLabels: false,
  spacingFactor: undefined,
  condense: false,
  rows: undefined,
  cols: undefined,
  position: function position2(v5891) {},
  sort: undefined,
  animate: false,
  animationDuration: 500,
  animationEasing: undefined,
  animateFilter: function animateFilter5(v5892, v5893) {
    return true;
  },
  ready: undefined,
  stop: undefined,
  transform: function transform4(v5894, v5895) {
    return v5895;
  }
};
function GridLayout(v5896) {
  this.options = extend({}, defaults$3, v5896);
}
GridLayout.prototype.run = function () {
  var v5897 = this.options;
  var v5898 = v5897;
  var v5899 = v5897.cy;
  var v5900 = v5898.eles;
  var v5901 = v5900.nodes().not(":parent");
  if (v5898.sort) {
    v5901 = v5901.sort(v5898.sort);
  }
  var v5902 = makeBoundingBox(v5898.boundingBox ? v5898.boundingBox : {
    x1: 0,
    y1: 0,
    w: v5899.width(),
    h: v5899.height()
  });
  if (v5902.h === 0 || v5902.w === 0) {
    v5900.nodes().layoutPositions(this, v5898, function (v5903) {
      return {
        x: v5902.x1,
        y: v5902.y1
      };
    });
  } else {
    var v5904 = v5901.size();
    var v5905 = Math.sqrt(v5904 * v5902.h / v5902.w);
    var v5906 = Math.round(v5905);
    var v5907 = Math.round(v5902.w / v5902.h * v5905);
    var v5908 = function v5909(v5910) {
      if (v5910 == null) {
        return Math.min(v5906, v5907);
      } else {
        var v5911 = Math.min(v5906, v5907);
        if (v5911 == v5906) {
          v5906 = v5910;
        } else {
          v5907 = v5910;
        }
      }
    };
    var v5912 = function v5913(v5914) {
      if (v5914 == null) {
        return Math.max(v5906, v5907);
      } else {
        var v5915 = Math.max(v5906, v5907);
        if (v5915 == v5906) {
          v5906 = v5914;
        } else {
          v5907 = v5914;
        }
      }
    };
    var v5916 = v5898.rows;
    var v5917 = v5898.cols ?? v5898.columns;
    if (v5916 != null && v5917 != null) {
      v5906 = v5916;
      v5907 = v5917;
    } else if (v5916 != null && v5917 == null) {
      v5906 = v5916;
      v5907 = Math.ceil(v5904 / v5906);
    } else if (v5916 == null && v5917 != null) {
      v5907 = v5917;
      v5906 = Math.ceil(v5904 / v5907);
    } else if (v5907 * v5906 > v5904) {
      var v5918 = v5908();
      var v5919 = v5912();
      if ((v5918 - 1) * v5919 >= v5904) {
        v5908(v5918 - 1);
      } else if ((v5919 - 1) * v5918 >= v5904) {
        v5912(v5919 - 1);
      }
    } else {
      while (v5907 * v5906 < v5904) {
        var v5920 = v5908();
        var v5921 = v5912();
        if ((v5921 + 1) * v5920 >= v5904) {
          v5912(v5921 + 1);
        } else {
          v5908(v5920 + 1);
        }
      }
    }
    var v5922 = v5902.w / v5907;
    var v5923 = v5902.h / v5906;
    if (v5898.condense) {
      v5922 = 0;
      v5923 = 0;
    }
    if (v5898.avoidOverlap) {
      for (var v5924 = 0; v5924 < v5901.length; v5924++) {
        var v5925 = v5901[v5924];
        var v5926 = v5925._private.position;
        if (v5926.x == null || v5926.y == null) {
          v5926.x = 0;
          v5926.y = 0;
        }
        var v5927 = v5925.layoutDimensions(v5898);
        var v5928 = v5898.avoidOverlapPadding;
        var v5929 = v5927.w + v5928;
        var v5930 = v5927.h + v5928;
        v5922 = Math.max(v5922, v5929);
        v5923 = Math.max(v5923, v5930);
      }
    }
    var v5931 = {};
    var v5932 = function v5933(v5934, v5935) {
      if (v5931["c-" + v5934 + "-" + v5935]) {
        return true;
      } else {
        return false;
      }
    };
    var v5936 = function v5937(v5938, v5939) {
      v5931["c-" + v5938 + "-" + v5939] = true;
    };
    var v5940 = 0;
    var v5941 = 0;
    var v5942 = function v5943() {
      v5941++;
      if (v5941 >= v5907) {
        v5941 = 0;
        v5940++;
      }
    };
    var v5944 = {};
    for (var v5945 = 0; v5945 < v5901.length; v5945++) {
      var v5946 = v5901[v5945];
      var v5947 = v5898.position(v5946);
      if (v5947 && (v5947.row !== undefined || v5947.col !== undefined)) {
        var v5948 = {
          row: v5947.row,
          col: v5947.col
        };
        if (v5948.col === undefined) {
          v5948.col = 0;
          while (v5932(v5948.row, v5948.col)) {
            v5948.col++;
          }
        } else if (v5948.row === undefined) {
          v5948.row = 0;
          while (v5932(v5948.row, v5948.col)) {
            v5948.row++;
          }
        }
        v5944[v5946.id()] = v5948;
        v5936(v5948.row, v5948.col);
      }
    }
    var v5949 = function v5950(v5951, v5952) {
      var v5953;
      var v5954;
      if (v5951.locked() || v5951.isParent()) {
        return false;
      }
      var v5955 = v5944[v5951.id()];
      if (v5955) {
        v5953 = v5955.col * v5922 + v5922 / 2 + v5902.x1;
        v5954 = v5955.row * v5923 + v5923 / 2 + v5902.y1;
      } else {
        while (v5932(v5940, v5941)) {
          v5942();
        }
        v5953 = v5941 * v5922 + v5922 / 2 + v5902.x1;
        v5954 = v5940 * v5923 + v5923 / 2 + v5902.y1;
        v5936(v5940, v5941);
        v5942();
      }
      return {
        x: v5953,
        y: v5954
      };
    };
    v5901.layoutPositions(this, v5898, v5949);
  }
  return this;
};
var defaults$2 = {
  ready: function ready3() {},
  stop: function stop4() {}
};
function NullLayout(v5956) {
  this.options = extend({}, defaults$2, v5956);
}
NullLayout.prototype.run = function () {
  var v5957 = this.options;
  var v5958 = v5957.eles;
  var v5959 = this;
  v5957.cy;
  v5959.emit("layoutstart");
  v5958.nodes().positions(function () {
    return {
      x: 0,
      y: 0
    };
  });
  v5959.one("layoutready", v5957.ready);
  v5959.emit("layoutready");
  v5959.one("layoutstop", v5957.stop);
  v5959.emit("layoutstop");
  return this;
};
NullLayout.prototype.stop = function () {
  return this;
};
var defaults$1 = {
  positions: undefined,
  zoom: undefined,
  pan: undefined,
  fit: true,
  padding: 30,
  spacingFactor: undefined,
  animate: false,
  animationDuration: 500,
  animationEasing: undefined,
  animateFilter: function animateFilter6(v5960, v5961) {
    return true;
  },
  ready: undefined,
  stop: undefined,
  transform: function transform5(v5962, v5963) {
    return v5963;
  }
};
function PresetLayout(v5964) {
  this.options = extend({}, defaults$1, v5964);
}
PresetLayout.prototype.run = function () {
  var v5965 = this.options;
  var v5966 = v5965.eles;
  var v5967 = v5966.nodes();
  var v5968 = fn$6(v5965.positions);
  function v5969(v5970) {
    if (v5965.positions == null) {
      return copyPosition(v5970.position());
    }
    if (v5968) {
      return v5965.positions(v5970);
    }
    var v5971 = v5965.positions[v5970._private.data.id];
    if (v5971 == null) {
      return null;
    }
    return v5971;
  }
  v5967.layoutPositions(this, v5965, function (v5972, v5973) {
    var v5974 = v5969(v5972);
    if (v5972.locked() || v5974 == null) {
      return false;
    }
    return v5974;
  });
  return this;
};
var defaults2 = {
  fit: true,
  padding: 30,
  boundingBox: undefined,
  animate: false,
  animationDuration: 500,
  animationEasing: undefined,
  animateFilter: function animateFilter7(v5975, v5976) {
    return true;
  },
  ready: undefined,
  stop: undefined,
  transform: function transform6(v5977, v5978) {
    return v5978;
  }
};
function RandomLayout(v5979) {
  this.options = extend({}, defaults2, v5979);
}
RandomLayout.prototype.run = function () {
  var v5980 = this.options;
  var v5981 = v5980.cy;
  var v5982 = v5980.eles;
  var v5983 = makeBoundingBox(v5980.boundingBox ? v5980.boundingBox : {
    x1: 0,
    y1: 0,
    w: v5981.width(),
    h: v5981.height()
  });
  var v5984 = function v5985(v5986, v5987) {
    return {
      x: v5983.x1 + Math.round(Math.random() * v5983.w),
      y: v5983.y1 + Math.round(Math.random() * v5983.h)
    };
  };
  v5982.nodes().layoutPositions(this, v5980, v5984);
  return this;
};
var layout3 = [{
  name: "breadthfirst",
  impl: BreadthFirstLayout
}, {
  name: "circle",
  impl: CircleLayout
}, {
  name: "concentric",
  impl: ConcentricLayout
}, {
  name: "cose",
  impl: CoseLayout
}, {
  name: "grid",
  impl: GridLayout
}, {
  name: "null",
  impl: NullLayout
}, {
  name: "preset",
  impl: PresetLayout
}, {
  name: "random",
  impl: RandomLayout
}];
function NullRenderer(v5988) {
  this.options = v5988;
  this.notifications = 0;
}
var noop2 = function noop3() {};
var throwImgErr = function throwImgErr2() {
  throw new Error("A headless instance can not render images");
};
NullRenderer.prototype = {
  recalculateRenderedStyle: noop2,
  notify: function notify2() {
    this.notifications++;
  },
  init: noop2,
  isHeadless: function isHeadless() {
    return true;
  },
  png: throwImgErr,
  jpg: throwImgErr
};
var BRp$f = {
  arrowShapeWidth: 0.3
};
BRp$f.registerArrowShapes = function () {
  var v5989 = this.arrowShapes = {};
  var v5990 = this;
  var v5991 = function v5992(v5993, v5994, v5995, v5996, v5997, v5998, v5999) {
    var v6000 = v5997.x - v5995 / 2 - v5999;
    var v6001 = v5997.x + v5995 / 2 + v5999;
    var v6002 = v5997.y - v5995 / 2 - v5999;
    var v6003 = v5997.y + v5995 / 2 + v5999;
    var v6004 = v6000 <= v5993 && v5993 <= v6001 && v6002 <= v5994 && v5994 <= v6003;
    return v6004;
  };
  var v6005 = function v6006(v6007, v6008, v6009, v6010, v6011) {
    var v6012 = v6007 * Math.cos(v6010) - v6008 * Math.sin(v6010);
    var v6013 = v6007 * Math.sin(v6010) + v6008 * Math.cos(v6010);
    var v6014 = v6012 * v6009;
    var v6015 = v6013 * v6009;
    var v6016 = v6014 + v6011.x;
    var v6017 = v6015 + v6011.y;
    return {
      x: v6016,
      y: v6017
    };
  };
  var v6018 = function v6019(v6020, v6021, v6022, v6023) {
    var v6024 = [];
    for (var v6025 = 0; v6025 < v6020.length; v6025 += 2) {
      var v6026 = v6020[v6025];
      var v6027 = v6020[v6025 + 1];
      v6024.push(v6005(v6026, v6027, v6021, v6022, v6023));
    }
    return v6024;
  };
  var v6028 = function v6029(v6030) {
    var v6031 = [];
    for (var v6032 = 0; v6032 < v6030.length; v6032++) {
      var v6033 = v6030[v6032];
      v6031.push(v6033.x, v6033.y);
    }
    return v6031;
  };
  var v6034 = function v6035(v6036) {
    return v6036.pstyle("width").pfValue * v6036.pstyle("arrow-scale").pfValue * 2;
  };
  var v6037 = function v6038(v6039, v6040) {
    if (string(v6040)) {
      v6040 = v5989[v6040];
    }
    v5989[v6039] = extend({
      name: v6039,
      points: [-0.15, -0.3, 0.15, -0.3, 0.15, 0.3, -0.15, 0.3],
      collide: function v6041(v6042, v6043, v6044, v6045, v6046, v6047) {
        var v6048 = v6028(v6018(this.points, v6044 + v6047 * 2, v6045, v6046));
        var v6049 = pointInsidePolygonPoints(v6042, v6043, v6048);
        return v6049;
      },
      roughCollide: v5991,
      draw: function v6050(v6051, v6052, v6053, v6054) {
        var v6055 = v6018(this.points, v6052, v6053, v6054);
        v5990.arrowShapeImpl("polygon")(v6051, v6055);
      },
      spacing: function v6056(v6057) {
        return 0;
      },
      gap: v6034
    }, v6040);
  };
  v6037("none", {
    collide: falsify,
    roughCollide: falsify,
    draw: noop$1,
    spacing: zeroify,
    gap: zeroify
  });
  v6037("triangle", {
    points: [-0.15, -0.3, 0, 0, 0.15, -0.3]
  });
  v6037("arrow", "triangle");
  v6037("triangle-backcurve", {
    points: v5989.triangle.points,
    controlPoint: [0, -0.15],
    roughCollide: v5991,
    draw: function v6058(v6059, v6060, v6061, v6062, v6063) {
      var v6064 = v6018(this.points, v6060, v6061, v6062);
      var v6065 = this.controlPoint;
      var v6066 = v6005(v6065[0], v6065[1], v6060, v6061, v6062);
      v5990.arrowShapeImpl(this.name)(v6059, v6064, v6066);
    },
    gap: function v6067(v6068) {
      return v6034(v6068) * 0.8;
    }
  });
  v6037("triangle-tee", {
    points: [0, 0, 0.15, -0.3, -0.15, -0.3, 0, 0],
    pointsTee: [-0.15, -0.4, -0.15, -0.5, 0.15, -0.5, 0.15, -0.4],
    collide: function v6069(v6070, v6071, v6072, v6073, v6074, v6075, v6076) {
      var v6077 = v6028(v6018(this.points, v6072 + v6076 * 2, v6073, v6074));
      var v6078 = v6028(v6018(this.pointsTee, v6072 + v6076 * 2, v6073, v6074));
      var v6079 = pointInsidePolygonPoints(v6070, v6071, v6077) || pointInsidePolygonPoints(v6070, v6071, v6078);
      return v6079;
    },
    draw: function v6080(v6081, v6082, v6083, v6084, v6085) {
      var v6086 = v6018(this.points, v6082, v6083, v6084);
      var v6087 = v6018(this.pointsTee, v6082, v6083, v6084);
      v5990.arrowShapeImpl(this.name)(v6081, v6086, v6087);
    }
  });
  v6037("circle-triangle", {
    radius: 0.15,
    pointsTr: [0, -0.15, 0.15, -0.45, -0.15, -0.45, 0, -0.15],
    collide: function v6088(v6089, v6090, v6091, v6092, v6093, v6094, v6095) {
      var v6096 = v6093;
      var v6097 = Math.pow(v6096.x - v6089, 2) + Math.pow(v6096.y - v6090, 2) <= Math.pow((v6091 + v6095 * 2) * this.radius, 2);
      var v6098 = v6028(v6018(this.points, v6091 + v6095 * 2, v6092, v6093));
      return pointInsidePolygonPoints(v6089, v6090, v6098) || v6097;
    },
    draw: function v6099(v6100, v6101, v6102, v6103, v6104) {
      var v6105 = v6018(this.pointsTr, v6101, v6102, v6103);
      v5990.arrowShapeImpl(this.name)(v6100, v6105, v6103.x, v6103.y, this.radius * v6101);
    },
    spacing: function v6106(v6107) {
      return v5990.getArrowWidth(v6107.pstyle("width").pfValue, v6107.pstyle("arrow-scale").value) * this.radius;
    }
  });
  v6037("triangle-cross", {
    points: [0, 0, 0.15, -0.3, -0.15, -0.3, 0, 0],
    baseCrossLinePts: [-0.15, -0.4, -0.15, -0.4, 0.15, -0.4, 0.15, -0.4],
    crossLinePts: function v6108(v6109, v6110) {
      var v6111 = this.baseCrossLinePts.slice();
      var v6112 = v6110 / v6109;
      var v6113 = 3;
      var v6114 = 5;
      v6111[v6113] = v6111[v6113] - v6112;
      v6111[v6114] = v6111[v6114] - v6112;
      return v6111;
    },
    collide: function v6115(v6116, v6117, v6118, v6119, v6120, v6121, v6122) {
      var v6123 = v6028(v6018(this.points, v6118 + v6122 * 2, v6119, v6120));
      var v6124 = v6028(v6018(this.crossLinePts(v6118, v6121), v6118 + v6122 * 2, v6119, v6120));
      var v6125 = pointInsidePolygonPoints(v6116, v6117, v6123) || pointInsidePolygonPoints(v6116, v6117, v6124);
      return v6125;
    },
    draw: function v6126(v6127, v6128, v6129, v6130, v6131) {
      var v6132 = v6018(this.points, v6128, v6129, v6130);
      var v6133 = v6018(this.crossLinePts(v6128, v6131), v6128, v6129, v6130);
      v5990.arrowShapeImpl(this.name)(v6127, v6132, v6133);
    }
  });
  v6037("vee", {
    points: [-0.15, -0.3, 0, 0, 0.15, -0.3, 0, -0.15],
    gap: function v6134(v6135) {
      return v6034(v6135) * 0.525;
    }
  });
  v6037("circle", {
    radius: 0.15,
    collide: function v6136(v6137, v6138, v6139, v6140, v6141, v6142, v6143) {
      var v6144 = v6141;
      var v6145 = Math.pow(v6144.x - v6137, 2) + Math.pow(v6144.y - v6138, 2) <= Math.pow((v6139 + v6143 * 2) * this.radius, 2);
      return v6145;
    },
    draw: function v6146(v6147, v6148, v6149, v6150, v6151) {
      v5990.arrowShapeImpl(this.name)(v6147, v6150.x, v6150.y, this.radius * v6148);
    },
    spacing: function v6152(v6153) {
      return v5990.getArrowWidth(v6153.pstyle("width").pfValue, v6153.pstyle("arrow-scale").value) * this.radius;
    }
  });
  v6037("tee", {
    points: [-0.15, 0, -0.15, -0.1, 0.15, -0.1, 0.15, 0],
    spacing: function v6154(v6155) {
      return 1;
    },
    gap: function v6156(v6157) {
      return 1;
    }
  });
  v6037("square", {
    points: [-0.15, 0, 0.15, 0, 0.15, -0.3, -0.15, -0.3]
  });
  v6037("diamond", {
    points: [-0.15, -0.15, 0, -0.3, 0.15, -0.15, 0, 0],
    gap: function v6158(v6159) {
      return v6159.pstyle("width").pfValue * v6159.pstyle("arrow-scale").value;
    }
  });
  v6037("chevron", {
    points: [0, 0, -0.15, -0.15, -0.1, -0.2, 0, -0.1, 0.1, -0.2, 0.15, -0.15],
    gap: function v6160(v6161) {
      return v6161.pstyle("width").pfValue * 0.95 * v6161.pstyle("arrow-scale").value;
    }
  });
};
var BRp$e = {};
BRp$e.projectIntoViewport = function (v6162, v6163) {
  var v6164 = this.cy;
  var v6165 = this.findContainerClientCoords();
  var v6166 = v6165[0];
  var v6167 = v6165[1];
  var v6168 = v6165[4];
  var v6169 = v6164.pan();
  var v6170 = v6164.zoom();
  var v6171 = ((v6162 - v6166) / v6168 - v6169.x) / v6170;
  var v6172 = ((v6163 - v6167) / v6168 - v6169.y) / v6170;
  return [v6171, v6172];
};
BRp$e.findContainerClientCoords = function () {
  if (this.containerBB) {
    return this.containerBB;
  }
  var v6173 = this.container;
  var v6174 = v6173.getBoundingClientRect();
  var v6175 = this.cy.window().getComputedStyle(v6173);
  var v6176 = function v6177(v6178) {
    return parseFloat(v6175.getPropertyValue(v6178));
  };
  var v6179 = {
    left: v6176("padding-left"),
    right: v6176("padding-right"),
    top: v6176("padding-top"),
    bottom: v6176("padding-bottom")
  };
  var v6180 = {
    left: v6176("border-left-width"),
    right: v6176("border-right-width"),
    top: v6176("border-top-width"),
    bottom: v6176("border-bottom-width")
  };
  var v6181 = v6173.clientWidth;
  var v6182 = v6173.clientHeight;
  var v6183 = v6179.left + v6179.right;
  var v6184 = v6179.top + v6179.bottom;
  var v6185 = v6180.left + v6180.right;
  var v6186 = v6174.width / (v6181 + v6185);
  var v6187 = v6181 - v6183;
  var v6188 = v6182 - v6184;
  var v6189 = v6174.left + v6179.left + v6180.left;
  var v6190 = v6174.top + v6179.top + v6180.top;
  return this.containerBB = [v6189, v6190, v6187, v6188, v6186];
};
BRp$e.invalidateContainerClientCoordsCache = function () {
  this.containerBB = null;
};
BRp$e.findNearestElement = function (v6191, v6192, v6193, v6194) {
  return this.findNearestElements(v6191, v6192, v6193, v6194)[0];
};
BRp$e.findNearestElements = function (v6195, v6196, v6197, v6198) {
  var v6199 = this;
  var v6200 = this;
  var v6201 = v6200.getCachedZSortedEles();
  var v6202 = [];
  var v6203 = v6200.cy.zoom();
  var v6204 = v6200.cy.hasCompoundNodes();
  var v6205 = (v6198 ? 24 : 8) / v6203;
  var v6206 = (v6198 ? 8 : 2) / v6203;
  var v6207 = (v6198 ? 8 : 2) / v6203;
  var v6208 = Infinity;
  var v6209;
  var v6210;
  if (v6197) {
    v6201 = v6201.interactive;
  }
  function v6211(v6212, v6213) {
    if (v6212.isNode()) {
      if (v6210) {
        return;
      } else {
        v6210 = v6212;
        v6202.push(v6212);
      }
    }
    if (v6212.isEdge() && (v6213 == null || v6213 < v6208)) {
      if (v6209) {
        if (v6209.pstyle("z-compound-depth").value === v6212.pstyle("z-compound-depth").value && v6209.pstyle("z-compound-depth").value === v6212.pstyle("z-compound-depth").value) {
          for (var v6214 = 0; v6214 < v6202.length; v6214++) {
            if (v6202[v6214].isEdge()) {
              v6202[v6214] = v6212;
              v6209 = v6212;
              v6208 = v6213 ?? v6208;
              break;
            }
          }
        }
      } else {
        v6202.push(v6212);
        v6209 = v6212;
        v6208 = v6213 ?? v6208;
      }
    }
  }
  function v6215(v6216) {
    var v6217 = v6216.outerWidth() + v6206 * 2;
    var v6218 = v6216.outerHeight() + v6206 * 2;
    var v6219 = v6217 / 2;
    var v6220 = v6218 / 2;
    var v6221 = v6216.position();
    var v6222 = v6216.pstyle("corner-radius").value === "auto" ? "auto" : v6216.pstyle("corner-radius").pfValue;
    var v6223 = v6216._private.rscratch;
    if (v6221.x - v6219 <= v6195 && v6195 <= v6221.x + v6219 && v6221.y - v6220 <= v6196 && v6196 <= v6221.y + v6220) {
      var v6224 = v6200.nodeShapes[v6199.getNodeShape(v6216)];
      if (v6224.checkPoint(v6195, v6196, 0, v6217, v6218, v6221.x, v6221.y, v6222, v6223)) {
        v6211(v6216, 0);
        return true;
      }
    }
  }
  function v6225(v6226) {
    var v6227 = v6226._private;
    var v6228 = v6227.rscratch;
    var v6229 = v6226.pstyle("width").pfValue;
    var v6230 = v6226.pstyle("arrow-scale").value;
    var v6231 = v6229 / 2 + v6205;
    var v6232 = v6231 * v6231;
    var v6233 = v6231 * 2;
    var v6234 = v6227.source;
    var v6235 = v6227.target;
    var v6236;
    if (v6228.edgeType === "segments" || v6228.edgeType === "straight" || v6228.edgeType === "haystack") {
      var v6237 = v6228.allpts;
      for (var v6238 = 0; v6238 + 3 < v6237.length; v6238 += 2) {
        if (inLineVicinity(v6195, v6196, v6237[v6238], v6237[v6238 + 1], v6237[v6238 + 2], v6237[v6238 + 3], v6233) && v6232 > (v6236 = sqdistToFiniteLine(v6195, v6196, v6237[v6238], v6237[v6238 + 1], v6237[v6238 + 2], v6237[v6238 + 3]))) {
          v6211(v6226, v6236);
          return true;
        }
      }
    } else if (v6228.edgeType === "bezier" || v6228.edgeType === "multibezier" || v6228.edgeType === "self" || v6228.edgeType === "compound") {
      var v6237 = v6228.allpts;
      for (var v6238 = 0; v6238 + 5 < v6228.allpts.length; v6238 += 4) {
        if (inBezierVicinity(v6195, v6196, v6237[v6238], v6237[v6238 + 1], v6237[v6238 + 2], v6237[v6238 + 3], v6237[v6238 + 4], v6237[v6238 + 5], v6233) && v6232 > (v6236 = sqdistToQuadraticBezier(v6195, v6196, v6237[v6238], v6237[v6238 + 1], v6237[v6238 + 2], v6237[v6238 + 3], v6237[v6238 + 4], v6237[v6238 + 5]))) {
          v6211(v6226, v6236);
          return true;
        }
      }
    }
    var v6234 = v6234 || v6227.source;
    var v6235 = v6235 || v6227.target;
    var v6239 = v6199.getArrowWidth(v6229, v6230);
    var v6240 = [{
      name: "source",
      x: v6228.arrowStartX,
      y: v6228.arrowStartY,
      angle: v6228.srcArrowAngle
    }, {
      name: "target",
      x: v6228.arrowEndX,
      y: v6228.arrowEndY,
      angle: v6228.tgtArrowAngle
    }, {
      name: "mid-source",
      x: v6228.midX,
      y: v6228.midY,
      angle: v6228.midsrcArrowAngle
    }, {
      name: "mid-target",
      x: v6228.midX,
      y: v6228.midY,
      angle: v6228.midtgtArrowAngle
    }];
    for (var v6238 = 0; v6238 < v6240.length; v6238++) {
      var v6241 = v6240[v6238];
      var v6242 = v6200.arrowShapes[v6226.pstyle(v6241.name + "-arrow-shape").value];
      var v6243 = v6226.pstyle("width").pfValue;
      if (v6242.roughCollide(v6195, v6196, v6239, v6241.angle, {
        x: v6241.x,
        y: v6241.y
      }, v6243, v6205) && v6242.collide(v6195, v6196, v6239, v6241.angle, {
        x: v6241.x,
        y: v6241.y
      }, v6243, v6205)) {
        v6211(v6226);
        return true;
      }
    }
    if (v6204 && v6202.length > 0) {
      v6215(v6234);
      v6215(v6235);
    }
  }
  function v6244(v6245, v6246, v6247) {
    return getPrefixedProperty(v6245, v6246, v6247);
  }
  function v6248(v6249, v6250) {
    var v6251 = v6249._private;
    var v6252 = v6207;
    var v6253;
    if (v6250) {
      v6253 = v6250 + "-";
    } else {
      v6253 = "";
    }
    v6249.boundingBox();
    var v6254 = v6251.labelBounds[v6250 || "main"];
    var v6255 = v6249.pstyle(v6253 + "label").value;
    var v6256 = v6249.pstyle("text-events").strValue === "yes";
    if (!v6256 || !v6255) {
      return;
    }
    var v6257 = v6244(v6251.rscratch, "labelX", v6250);
    var v6258 = v6244(v6251.rscratch, "labelY", v6250);
    var v6259 = v6244(v6251.rscratch, "labelAngle", v6250);
    var v6260 = v6249.pstyle(v6253 + "text-margin-x").pfValue;
    var v6261 = v6249.pstyle(v6253 + "text-margin-y").pfValue;
    var v6262 = v6254.x1 - v6252 - v6260;
    var v6263 = v6254.x2 + v6252 - v6260;
    var v6264 = v6254.y1 - v6252 - v6261;
    var v6265 = v6254.y2 + v6252 - v6261;
    if (v6259) {
      var v6266 = Math.cos(v6259);
      var v6267 = Math.sin(v6259);
      var v6268 = function v6269(v6270, v6271) {
        v6270 = v6270 - v6257;
        v6271 = v6271 - v6258;
        return {
          x: v6270 * v6266 - v6271 * v6267 + v6257,
          y: v6270 * v6267 + v6271 * v6266 + v6258
        };
      };
      var v6272 = v6268(v6262, v6264);
      var v6273 = v6268(v6262, v6265);
      var v6274 = v6268(v6263, v6264);
      var v6275 = v6268(v6263, v6265);
      var v6276 = [v6272.x + v6260, v6272.y + v6261, v6274.x + v6260, v6274.y + v6261, v6275.x + v6260, v6275.y + v6261, v6273.x + v6260, v6273.y + v6261];
      if (pointInsidePolygonPoints(v6195, v6196, v6276)) {
        v6211(v6249);
        return true;
      }
    } else if (inBoundingBox(v6254, v6195, v6196)) {
      v6211(v6249);
      return true;
    }
  }
  for (var v6277 = v6201.length - 1; v6277 >= 0; v6277--) {
    var v6278 = v6201[v6277];
    if (v6278.isNode()) {
      if (!v6215(v6278)) {
        v6248(v6278);
      }
    } else if (!v6225(v6278) && !v6248(v6278) && !v6248(v6278, "source")) {
      v6248(v6278, "target");
    }
  }
  return v6202;
};
BRp$e.getAllInBox = function (v6279, v6280, v6281, v6282) {
  var v6283 = this.getCachedZSortedEles().interactive;
  var v6284 = this.cy.zoom();
  var v6285 = 2 / v6284;
  var v6286 = [];
  var v6287 = Math.min(v6279, v6281);
  var v6288 = Math.max(v6279, v6281);
  var v6289 = Math.min(v6280, v6282);
  var v6290 = Math.max(v6280, v6282);
  v6279 = v6287;
  v6281 = v6288;
  v6280 = v6289;
  v6282 = v6290;
  var v6291 = makeBoundingBox({
    x1: v6279,
    y1: v6280,
    x2: v6281,
    y2: v6282
  });
  var v6292 = [{
    x: v6291.x1,
    y: v6291.y1
  }, {
    x: v6291.x2,
    y: v6291.y1
  }, {
    x: v6291.x2,
    y: v6291.y2
  }, {
    x: v6291.x1,
    y: v6291.y2
  }];
  var v6293 = [[v6292[0], v6292[1]], [v6292[1], v6292[2]], [v6292[2], v6292[3]], [v6292[3], v6292[0]]];
  function v6294(v6295, v6296, v6297) {
    return getPrefixedProperty(v6295, v6296, v6297);
  }
  function v6298(v6299, v6300) {
    var v6301 = v6299._private;
    var v6302 = v6285;
    var v6303 = "";
    v6299.boundingBox();
    var v6304 = v6301.labelBounds.main;
    if (!v6304) {
      return null;
    }
    var v6305 = v6294(v6301.rscratch, "labelX", v6300);
    var v6306 = v6294(v6301.rscratch, "labelY", v6300);
    var v6307 = v6294(v6301.rscratch, "labelAngle", v6300);
    var v6308 = v6299.pstyle(v6303 + "text-margin-x").pfValue;
    var v6309 = v6299.pstyle(v6303 + "text-margin-y").pfValue;
    var v6310 = v6304.x1 - v6302 - v6308;
    var v6311 = v6304.x2 + v6302 - v6308;
    var v6312 = v6304.y1 - v6302 - v6309;
    var v6313 = v6304.y2 + v6302 - v6309;
    if (v6307) {
      var v6314 = Math.cos(v6307);
      var v6315 = Math.sin(v6307);
      var v6316 = function v6317(v6318, v6319) {
        v6318 = v6318 - v6305;
        v6319 = v6319 - v6306;
        return {
          x: v6318 * v6314 - v6319 * v6315 + v6305,
          y: v6318 * v6315 + v6319 * v6314 + v6306
        };
      };
      return [v6316(v6310, v6312), v6316(v6311, v6312), v6316(v6311, v6313), v6316(v6310, v6313)];
    } else {
      return [{
        x: v6310,
        y: v6312
      }, {
        x: v6311,
        y: v6312
      }, {
        x: v6311,
        y: v6313
      }, {
        x: v6310,
        y: v6313
      }];
    }
  }
  function v6320(v6321, v6322, v6323, v6324) {
    function v6325(v6326, v6327, v6328) {
      return (v6328.y - v6326.y) * (v6327.x - v6326.x) > (v6327.y - v6326.y) * (v6328.x - v6326.x);
    }
    return v6325(v6321, v6323, v6324) !== v6325(v6322, v6323, v6324) && v6325(v6321, v6322, v6323) !== v6325(v6321, v6322, v6324);
  }
  for (var v6329 = 0; v6329 < v6283.length; v6329++) {
    var v6330 = v6283[v6329];
    if (v6330.isNode()) {
      var v6331 = v6330;
      var v6332 = v6331.pstyle("text-events").strValue === "yes";
      var v6333 = v6331.pstyle("box-selection").strValue;
      var v6334 = v6331.pstyle("box-select-labels").strValue === "yes";
      if (v6333 === "none") {
        continue;
      }
      var v6335 = (v6333 === "overlap" || v6334) && v6332;
      var v6336 = v6331.boundingBox({
        includeNodes: true,
        includeEdges: false,
        includeLabels: v6335
      });
      if (v6333 === "contain") {
        var v6337 = false;
        if (v6334 && v6332) {
          var v6338 = v6298(v6331);
          if (v6338 && satPolygonIntersection(v6338, v6292)) {
            v6286.push(v6331);
            v6337 = true;
          }
        }
        if (!v6337 && boundingBoxInBoundingBox(v6291, v6336)) {
          v6286.push(v6331);
        }
      } else if (v6333 === "overlap") {
        if (boundingBoxesIntersect(v6291, v6336)) {
          var v6339 = v6331.boundingBox({
            includeNodes: true,
            includeEdges: true,
            includeLabels: false,
            includeMainLabels: false,
            includeSourceLabels: false,
            includeTargetLabels: false
          });
          var v6340 = [{
            x: v6339.x1,
            y: v6339.y1
          }, {
            x: v6339.x2,
            y: v6339.y1
          }, {
            x: v6339.x2,
            y: v6339.y2
          }, {
            x: v6339.x1,
            y: v6339.y2
          }];
          if (satPolygonIntersection(v6340, v6292)) {
            v6286.push(v6331);
          } else {
            var v6341 = v6298(v6331);
            if (v6341 && satPolygonIntersection(v6341, v6292)) {
              v6286.push(v6331);
            }
          }
        }
      }
    } else {
      var v6342 = v6330;
      var v6343 = v6342._private;
      var v6344 = v6343.rscratch;
      var v6345 = v6342.pstyle("box-selection").strValue;
      if (v6345 === "none") {
        continue;
      }
      if (v6345 === "contain") {
        if (v6344.startX != null && v6344.startY != null && !inBoundingBox(v6291, v6344.startX, v6344.startY)) {
          continue;
        }
        if (v6344.endX != null && v6344.endY != null && !inBoundingBox(v6291, v6344.endX, v6344.endY)) {
          continue;
        }
        if (v6344.edgeType === "bezier" || v6344.edgeType === "multibezier" || v6344.edgeType === "self" || v6344.edgeType === "compound" || v6344.edgeType === "segments" || v6344.edgeType === "haystack") {
          var v6346 = v6343.rstyle.bezierPts || v6343.rstyle.linePts || v6343.rstyle.haystackPts;
          var v6347 = true;
          for (var v6348 = 0; v6348 < v6346.length; v6348++) {
            if (!pointInBoundingBox(v6291, v6346[v6348])) {
              v6347 = false;
              break;
            }
          }
          if (v6347) {
            v6286.push(v6342);
          }
        } else if (v6344.edgeType === "straight") {
          v6286.push(v6342);
        }
      } else if (v6345 === "overlap") {
        var v6349 = false;
        if (v6344.startX != null && v6344.startY != null && v6344.endX != null && v6344.endY != null && (inBoundingBox(v6291, v6344.startX, v6344.startY) || inBoundingBox(v6291, v6344.endX, v6344.endY))) {
          v6286.push(v6342);
          v6349 = true;
        } else if (!v6349 && v6344.edgeType === "haystack") {
          var v6350 = v6343.rstyle.haystackPts;
          for (var v6351 = 0; v6351 < v6350.length; v6351++) {
            if (pointInBoundingBox(v6291, v6350[v6351])) {
              v6286.push(v6342);
              v6349 = true;
              break;
            }
          }
        }
        if (!v6349) {
          var v6352 = v6343.rstyle.bezierPts || v6343.rstyle.linePts || v6343.rstyle.haystackPts;
          if ((!v6352 || v6352.length < 2) && v6344.edgeType === "straight") {
            if (v6344.startX != null && v6344.startY != null && v6344.endX != null && v6344.endY != null) {
              v6352 = [{
                x: v6344.startX,
                y: v6344.startY
              }, {
                x: v6344.endX,
                y: v6344.endY
              }];
            }
          }
          if (!v6352 || v6352.length < 2) {
            continue;
          }
          for (var v6353 = 0; v6353 < v6352.length - 1; v6353++) {
            var v6354 = v6352[v6353];
            var v6355 = v6352[v6353 + 1];
            for (var v6356 = 0; v6356 < v6293.length; v6356++) {
              var v6357 = _slicedToArray(v6293[v6356], 2);
              var v6358 = v6357[0];
              var v6359 = v6357[1];
              if (v6320(v6354, v6355, v6358, v6359)) {
                v6286.push(v6342);
                v6349 = true;
                break;
              }
            }
            if (v6349) {
              break;
            }
          }
        }
      }
    }
  }
  return v6286;
};
var BRp$d = {};
BRp$d.calculateArrowAngles = function (v6360) {
  var v6361 = v6360._private.rscratch;
  var v6362 = v6361.edgeType === "haystack";
  var v6363 = v6361.edgeType === "bezier";
  var v6364 = v6361.edgeType === "multibezier";
  var v6365 = v6361.edgeType === "segments";
  var v6366 = v6361.edgeType === "compound";
  var v6367 = v6361.edgeType === "self";
  var v6368;
  var v6369;
  var v6370;
  var v6371;
  var v6372;
  var v6373;
  var v6374;
  var v6375;
  if (v6362) {
    v6370 = v6361.haystackPts[0];
    v6371 = v6361.haystackPts[1];
    v6372 = v6361.haystackPts[2];
    v6373 = v6361.haystackPts[3];
  } else {
    v6370 = v6361.arrowStartX;
    v6371 = v6361.arrowStartY;
    v6372 = v6361.arrowEndX;
    v6373 = v6361.arrowEndY;
  }
  v6374 = v6361.midX;
  v6375 = v6361.midY;
  if (v6365) {
    v6368 = v6370 - v6361.segpts[0];
    v6369 = v6371 - v6361.segpts[1];
  } else if (v6364 || v6366 || v6367 || v6363) {
    var v6376 = v6361.allpts;
    var v6377 = qbezierAt(v6376[0], v6376[2], v6376[4], 0.1);
    var v6378 = qbezierAt(v6376[1], v6376[3], v6376[5], 0.1);
    v6368 = v6370 - v6377;
    v6369 = v6371 - v6378;
  } else {
    v6368 = v6370 - v6374;
    v6369 = v6371 - v6375;
  }
  v6361.srcArrowAngle = getAngleFromDisp(v6368, v6369);
  var v6374 = v6361.midX;
  var v6375 = v6361.midY;
  if (v6362) {
    v6374 = (v6370 + v6372) / 2;
    v6375 = (v6371 + v6373) / 2;
  }
  v6368 = v6372 - v6370;
  v6369 = v6373 - v6371;
  if (v6365) {
    var v6376 = v6361.allpts;
    if (v6376.length / 2 % 2 === 0) {
      var v6379 = v6376.length / 2;
      var v6380 = v6379 - 2;
      v6368 = v6376[v6379] - v6376[v6380];
      v6369 = v6376[v6379 + 1] - v6376[v6380 + 1];
    } else if (v6361.isRound) {
      v6368 = v6361.midVector[1];
      v6369 = -v6361.midVector[0];
    } else {
      var v6379 = v6376.length / 2 - 1;
      var v6380 = v6379 - 2;
      v6368 = v6376[v6379] - v6376[v6380];
      v6369 = v6376[v6379 + 1] - v6376[v6380 + 1];
    }
  } else if (v6364 || v6366 || v6367) {
    var v6376 = v6361.allpts;
    var v6381 = v6361.ctrlpts;
    var v6382;
    var v6383;
    var v6384;
    var v6385;
    if (v6381.length / 2 % 2 === 0) {
      var v6386 = v6376.length / 2 - 1;
      var v6387 = v6386 + 2;
      var v6388 = v6387 + 2;
      v6382 = qbezierAt(v6376[v6386], v6376[v6387], v6376[v6388], 0);
      v6383 = qbezierAt(v6376[v6386 + 1], v6376[v6387 + 1], v6376[v6388 + 1], 0);
      v6384 = qbezierAt(v6376[v6386], v6376[v6387], v6376[v6388], 0.0001);
      v6385 = qbezierAt(v6376[v6386 + 1], v6376[v6387 + 1], v6376[v6388 + 1], 0.0001);
    } else {
      var v6387 = v6376.length / 2 - 1;
      var v6386 = v6387 - 2;
      var v6388 = v6387 + 2;
      v6382 = qbezierAt(v6376[v6386], v6376[v6387], v6376[v6388], 0.4999);
      v6383 = qbezierAt(v6376[v6386 + 1], v6376[v6387 + 1], v6376[v6388 + 1], 0.4999);
      v6384 = qbezierAt(v6376[v6386], v6376[v6387], v6376[v6388], 0.5);
      v6385 = qbezierAt(v6376[v6386 + 1], v6376[v6387 + 1], v6376[v6388 + 1], 0.5);
    }
    v6368 = v6384 - v6382;
    v6369 = v6385 - v6383;
  }
  v6361.midtgtArrowAngle = getAngleFromDisp(v6368, v6369);
  v6361.midDispX = v6368;
  v6361.midDispY = v6369;
  v6368 *= -1;
  v6369 *= -1;
  if (v6365) {
    var v6376 = v6361.allpts;
    if (v6376.length / 2 % 2 === 0) ;else if (!v6361.isRound) {
      var v6379 = v6376.length / 2 - 1;
      var v6389 = v6379 + 2;
      v6368 = -(v6376[v6389] - v6376[v6379]);
      v6369 = -(v6376[v6389 + 1] - v6376[v6379 + 1]);
    }
  }
  v6361.midsrcArrowAngle = getAngleFromDisp(v6368, v6369);
  if (v6365) {
    v6368 = v6372 - v6361.segpts[v6361.segpts.length - 2];
    v6369 = v6373 - v6361.segpts[v6361.segpts.length - 1];
  } else if (v6364 || v6366 || v6367 || v6363) {
    var v6376 = v6361.allpts;
    var v6390 = v6376.length;
    var v6377 = qbezierAt(v6376[v6390 - 6], v6376[v6390 - 4], v6376[v6390 - 2], 0.9);
    var v6378 = qbezierAt(v6376[v6390 - 5], v6376[v6390 - 3], v6376[v6390 - 1], 0.9);
    v6368 = v6372 - v6377;
    v6369 = v6373 - v6378;
  } else {
    v6368 = v6372 - v6374;
    v6369 = v6373 - v6375;
  }
  v6361.tgtArrowAngle = getAngleFromDisp(v6368, v6369);
};
BRp$d.getArrowWidth = BRp$d.getArrowHeight = function (v6391, v6392) {
  var v6393 = this.arrowWidthCache = this.arrowWidthCache || {};
  var v6394 = v6393[v6391 + ", " + v6392];
  if (v6394) {
    return v6394;
  }
  v6394 = Math.max(Math.pow(v6391 * 13.37, 0.9), 29) * v6392;
  v6393[v6391 + ", " + v6392] = v6394;
  return v6394;
};
var x;
var y;
var v1 = {};
var v2 = {};
var sinA;
var sinA90;
var radDirection;
var drawDirection;
var angle;
var halfAngle;
var cRadius;
var lenOut;
var radius;
var limit;
var startX;
var startY;
var stopX;
var stopY;
var lastPoint;
var asVec = function asVec2(v6395, v6396, v6397) {
  v6397.x = v6396.x - v6395.x;
  v6397.y = v6396.y - v6395.y;
  v6397.len = Math.sqrt(v6397.x * v6397.x + v6397.y * v6397.y);
  v6397.nx = v6397.x / v6397.len;
  v6397.ny = v6397.y / v6397.len;
  v6397.ang = Math.atan2(v6397.ny, v6397.nx);
};
var invertVec = function invertVec2(v6398, v6399) {
  v6399.x = v6398.x * -1;
  v6399.y = v6398.y * -1;
  v6399.nx = v6398.nx * -1;
  v6399.ny = v6398.ny * -1;
  v6399.ang = v6398.ang > 0 ? -(Math.PI - v6398.ang) : Math.PI + v6398.ang;
};
var calcCornerArc = function calcCornerArc2(v6400, v6401, v6402, v6403, v6404) {
  if (v6400 !== lastPoint) {
    asVec(v6401, v6400, v1);
  } else {
    invertVec(v2, v1);
  }
  asVec(v6401, v6402, v2);
  sinA = v1.nx * v2.ny - v1.ny * v2.nx;
  sinA90 = v1.nx * v2.nx - v1.ny * -v2.ny;
  angle = Math.asin(Math.max(-1, Math.min(1, sinA)));
  if (Math.abs(angle) < 0.000001) {
    x = v6401.x;
    y = v6401.y;
    cRadius = radius = 0;
    return;
  }
  radDirection = 1;
  drawDirection = false;
  if (sinA90 < 0) {
    if (angle < 0) {
      angle = Math.PI + angle;
    } else {
      angle = Math.PI - angle;
      radDirection = -1;
      drawDirection = true;
    }
  } else if (angle > 0) {
    radDirection = -1;
    drawDirection = true;
  }
  if (v6401.radius !== undefined) {
    radius = v6401.radius;
  } else {
    radius = v6403;
  }
  halfAngle = angle / 2;
  limit = Math.min(v1.len / 2, v2.len / 2);
  if (v6404) {
    lenOut = Math.abs(Math.cos(halfAngle) * radius / Math.sin(halfAngle));
    if (lenOut > limit) {
      lenOut = limit;
      cRadius = Math.abs(lenOut * Math.sin(halfAngle) / Math.cos(halfAngle));
    } else {
      cRadius = radius;
    }
  } else {
    lenOut = Math.min(limit, radius);
    cRadius = Math.abs(lenOut * Math.sin(halfAngle) / Math.cos(halfAngle));
  }
  stopX = v6401.x + v2.nx * lenOut;
  stopY = v6401.y + v2.ny * lenOut;
  x = stopX - v2.ny * cRadius * radDirection;
  y = stopY + v2.nx * cRadius * radDirection;
  startX = v6401.x + v1.nx * lenOut;
  startY = v6401.y + v1.ny * lenOut;
  lastPoint = v6401;
};
function drawPreparedRoundCorner(v6405, v6406) {
  if (v6406.radius === 0) {
    v6405.lineTo(v6406.cx, v6406.cy);
  } else {
    v6405.arc(v6406.cx, v6406.cy, v6406.radius, v6406.startAngle, v6406.endAngle, v6406.counterClockwise);
  }
}
function getRoundCorner(v6407, v6408, v6409, v6410, v6411 = true) {
  if (v6410 === 0 || v6408.radius === 0) {
    return {
      cx: v6408.x,
      cy: v6408.y,
      radius: 0,
      startX: v6408.x,
      startY: v6408.y,
      stopX: v6408.x,
      stopY: v6408.y,
      startAngle: undefined,
      endAngle: undefined,
      counterClockwise: undefined
    };
  }
  calcCornerArc(v6407, v6408, v6409, v6410, v6411);
  return {
    cx: x,
    cy: y,
    radius: cRadius,
    startX: startX,
    startY: startY,
    stopX: stopX,
    stopY: stopY,
    startAngle: v1.ang + Math.PI / 2 * radDirection,
    endAngle: v2.ang - Math.PI / 2 * radDirection,
    counterClockwise: drawDirection
  };
}
var AVOID_IMPOSSIBLE_BEZIER_CONSTANT = 0.01;
var AVOID_IMPOSSIBLE_BEZIER_CONSTANT_L = Math.sqrt(AVOID_IMPOSSIBLE_BEZIER_CONSTANT * 2);
var BRp$c = {};
BRp$c.findMidptPtsEtc = function (v6412, v6413) {
  var v6414 = v6413.posPts;
  var v6415 = v6413.intersectionPts;
  var v6416 = v6413.vectorNormInverse;
  var v6417;
  var v6418 = v6412.pstyle("source-endpoint");
  var v6419 = v6412.pstyle("target-endpoint");
  var v6420 = v6418.units != null && v6419.units != null;
  var v6421 = function v6422(v6423, v6424, v6425, v6426) {
    var v6427 = v6426 - v6424;
    var v6428 = v6425 - v6423;
    var v6429 = Math.sqrt(v6428 * v6428 + v6427 * v6427);
    return {
      x: -v6427 / v6429,
      y: v6428 / v6429
    };
  };
  var v6430 = v6412.pstyle("edge-distances").value;
  switch (v6430) {
    case "node-position":
      v6417 = v6414;
      break;
    case "intersection":
      v6417 = v6415;
      break;
    case "endpoints":
      {
        if (v6420) {
          var v6431 = this.manualEndptToPx(v6412.source()[0], v6418);
          var v6432 = _slicedToArray(v6431, 2);
          var v6433 = v6432[0];
          var v6434 = v6432[1];
          var v6435 = this.manualEndptToPx(v6412.target()[0], v6419);
          var v6436 = _slicedToArray(v6435, 2);
          var v6437 = v6436[0];
          var v6438 = v6436[1];
          var v6439 = {
            x1: v6433,
            y1: v6434,
            x2: v6437,
            y2: v6438
          };
          v6416 = v6421(v6433, v6434, v6437, v6438);
          v6417 = v6439;
        } else {
          warn(`Edge ${v6412.id()} has edge-distances:endpoints specified without manual endpoints specified via source-endpoint and target-endpoint.  Falling back on edge-distances:intersection (default).`);
          v6417 = v6415;
        }
        break;
      }
  }
  return {
    midptPts: v6417,
    vectorNormInverse: v6416
  };
};
BRp$c.findHaystackPoints = function (v6440) {
  for (var v6441 = 0; v6441 < v6440.length; v6441++) {
    var v6442 = v6440[v6441];
    var v6443 = v6442._private;
    var v6444 = v6443.rscratch;
    if (!v6444.haystack) {
      var v6445 = Math.random() * 2 * Math.PI;
      v6444.source = {
        x: Math.cos(v6445),
        y: Math.sin(v6445)
      };
      v6445 = Math.random() * 2 * Math.PI;
      v6444.target = {
        x: Math.cos(v6445),
        y: Math.sin(v6445)
      };
    }
    var v6446 = v6443.source;
    var v6447 = v6443.target;
    var v6448 = v6446.position();
    var v6449 = v6447.position();
    var v6450 = v6446.width();
    var v6451 = v6447.width();
    var v6452 = v6446.height();
    var v6453 = v6447.height();
    var v6454 = v6442.pstyle("haystack-radius").value;
    var v6455 = v6454 / 2;
    v6444.haystackPts = v6444.allpts = [v6444.source.x * v6450 * v6455 + v6448.x, v6444.source.y * v6452 * v6455 + v6448.y, v6444.target.x * v6451 * v6455 + v6449.x, v6444.target.y * v6453 * v6455 + v6449.y];
    v6444.midX = (v6444.allpts[0] + v6444.allpts[2]) / 2;
    v6444.midY = (v6444.allpts[1] + v6444.allpts[3]) / 2;
    v6444.edgeType = "haystack";
    v6444.haystack = true;
    this.storeEdgeProjections(v6442);
    this.calculateArrowAngles(v6442);
    this.recalculateEdgeLabelProjections(v6442);
    this.calculateLabelAngles(v6442);
  }
};
BRp$c.findSegmentsPoints = function (v6456, v6457) {
  var v6458 = v6456._private.rscratch;
  var v6459 = v6456.pstyle("segment-weights");
  var v6460 = v6456.pstyle("segment-distances");
  var v6461 = v6456.pstyle("segment-radii");
  var v6462 = v6456.pstyle("radius-type");
  var v6463 = Math.min(v6459.pfValue.length, v6460.pfValue.length);
  var v6464 = v6461.pfValue[v6461.pfValue.length - 1];
  var v6465 = v6462.pfValue[v6462.pfValue.length - 1];
  v6458.edgeType = "segments";
  v6458.segpts = [];
  v6458.radii = [];
  v6458.isArcRadius = [];
  for (var v6466 = 0; v6466 < v6463; v6466++) {
    var v6467 = v6459.pfValue[v6466];
    var v6468 = v6460.pfValue[v6466];
    var v6469 = 1 - v6467;
    var v6470 = v6467;
    var v6471 = this.findMidptPtsEtc(v6456, v6457);
    var v6472 = v6471.midptPts;
    var v6473 = v6471.vectorNormInverse;
    var v6474 = {
      x: v6472.x1 * v6469 + v6472.x2 * v6470,
      y: v6472.y1 * v6469 + v6472.y2 * v6470
    };
    v6458.segpts.push(v6474.x + v6473.x * v6468, v6474.y + v6473.y * v6468);
    v6458.radii.push(v6461.pfValue[v6466] !== undefined ? v6461.pfValue[v6466] : v6464);
    v6458.isArcRadius.push((v6462.pfValue[v6466] !== undefined ? v6462.pfValue[v6466] : v6465) === "arc-radius");
  }
};
BRp$c.findLoopPoints = function (v6475, v6476, v6477, v6478) {
  var v6479 = v6475._private.rscratch;
  var v6480 = v6476.dirCounts;
  var v6481 = v6476.srcPos;
  var v6482 = v6475.pstyle("control-point-distances");
  var v6483 = v6482 ? v6482.pfValue[0] : undefined;
  var v6484 = v6475.pstyle("loop-direction").pfValue;
  var v6485 = v6475.pstyle("loop-sweep").pfValue;
  var v6486 = v6475.pstyle("control-point-step-size").pfValue;
  v6479.edgeType = "self";
  var v6487 = v6477;
  var v6488 = v6486;
  if (v6478) {
    v6487 = 0;
    v6488 = v6483;
  }
  var v6489 = v6484 - Math.PI / 2;
  var v6490 = v6489 - v6485 / 2;
  var v6491 = v6489 + v6485 / 2;
  var v6492 = String(v6484 + "_" + v6485);
  v6487 = v6480[v6492] === undefined ? v6480[v6492] = 0 : ++v6480[v6492];
  v6479.ctrlpts = [v6481.x + Math.cos(v6490) * 1.4 * v6488 * (v6487 / 3 + 1), v6481.y + Math.sin(v6490) * 1.4 * v6488 * (v6487 / 3 + 1), v6481.x + Math.cos(v6491) * 1.4 * v6488 * (v6487 / 3 + 1), v6481.y + Math.sin(v6491) * 1.4 * v6488 * (v6487 / 3 + 1)];
};
BRp$c.findCompoundLoopPoints = function (v6493, v6494, v6495, v6496) {
  var v6497 = v6493._private.rscratch;
  v6497.edgeType = "compound";
  var v6498 = v6494.srcPos;
  var v6499 = v6494.tgtPos;
  var v6500 = v6494.srcW;
  var v6501 = v6494.srcH;
  var v6502 = v6494.tgtW;
  var v6503 = v6494.tgtH;
  var v6504 = v6493.pstyle("control-point-step-size").pfValue;
  var v6505 = v6493.pstyle("control-point-distances");
  var v6506 = v6505 ? v6505.pfValue[0] : undefined;
  var v6507 = v6495;
  var v6508 = v6504;
  if (v6496) {
    v6507 = 0;
    v6508 = v6506;
  }
  var v6509 = 50;
  var v6510 = {
    x: v6498.x - v6500 / 2,
    y: v6498.y - v6501 / 2
  };
  var v6511 = {
    x: v6499.x - v6502 / 2,
    y: v6499.y - v6503 / 2
  };
  var v6512 = {
    x: Math.min(v6510.x, v6511.x),
    y: Math.min(v6510.y, v6511.y)
  };
  var v6513 = 0.5;
  var v6514 = Math.max(v6513, Math.log(v6500 * AVOID_IMPOSSIBLE_BEZIER_CONSTANT));
  var v6515 = Math.max(v6513, Math.log(v6502 * AVOID_IMPOSSIBLE_BEZIER_CONSTANT));
  v6497.ctrlpts = [v6512.x, v6512.y - (1 + Math.pow(v6509, 1.12) / 100) * v6508 * (v6507 / 3 + 1) * v6514, v6512.x - (1 + Math.pow(v6509, 1.12) / 100) * v6508 * (v6507 / 3 + 1) * v6515, v6512.y];
};
BRp$c.findStraightEdgePoints = function (v6516) {
  v6516._private.rscratch.edgeType = "straight";
};
BRp$c.findBezierPoints = function (v6517, v6518, v6519, v6520, v6521) {
  var v6522 = v6517._private.rscratch;
  var v6523 = v6517.pstyle("control-point-step-size").pfValue;
  var v6524 = v6517.pstyle("control-point-distances");
  var v6525 = v6517.pstyle("control-point-weights");
  var v6526 = v6524 && v6525 ? Math.min(v6524.value.length, v6525.value.length) : 1;
  var v6527 = v6524 ? v6524.pfValue[0] : undefined;
  var v6528 = v6525.value[0];
  var v6529 = v6520;
  v6522.edgeType = v6529 ? "multibezier" : "bezier";
  v6522.ctrlpts = [];
  for (var v6530 = 0; v6530 < v6526; v6530++) {
    var v6531 = (0.5 - v6518.eles.length / 2 + v6519) * v6523 * (v6521 ? -1 : 1);
    var v6532 = undefined;
    var v6533 = signum(v6531);
    if (v6529) {
      v6527 = v6524 ? v6524.pfValue[v6530] : v6523;
      v6528 = v6525.value[v6530];
    }
    if (v6520) {
      v6532 = v6527;
    } else {
      v6532 = v6527 !== undefined ? v6533 * v6527 : undefined;
    }
    var v6534 = v6532 !== undefined ? v6532 : v6531;
    var v6535 = 1 - v6528;
    var v6536 = v6528;
    var v6537 = this.findMidptPtsEtc(v6517, v6518);
    var v6538 = v6537.midptPts;
    var v6539 = v6537.vectorNormInverse;
    var v6540 = {
      x: v6538.x1 * v6535 + v6538.x2 * v6536,
      y: v6538.y1 * v6535 + v6538.y2 * v6536
    };
    v6522.ctrlpts.push(v6540.x + v6539.x * v6534, v6540.y + v6539.y * v6534);
  }
};
BRp$c.findTaxiPoints = function (v6541, v6542) {
  var v6543 = v6541._private.rscratch;
  v6543.edgeType = "segments";
  var v6544 = "vertical";
  var v6545 = "horizontal";
  var v6546 = "leftward";
  var v6547 = "rightward";
  var v6548 = "downward";
  var v6549 = "upward";
  var v6550 = "auto";
  var v6551 = v6542.posPts;
  var v6552 = v6542.srcW;
  var v6553 = v6542.srcH;
  var v6554 = v6542.tgtW;
  var v6555 = v6542.tgtH;
  var v6556 = v6541.pstyle("edge-distances").value;
  var v6557 = v6556 !== "node-position";
  var v6558 = v6541.pstyle("taxi-direction").value;
  var v6559 = v6558;
  var v6560 = v6541.pstyle("taxi-turn");
  var v6561 = v6560.units === "%";
  var v6562 = v6560.pfValue;
  var v6563 = v6562 < 0;
  var v6564 = v6541.pstyle("taxi-turn-min-distance").pfValue;
  var v6565 = v6557 ? (v6552 + v6554) / 2 : 0;
  var v6566 = v6557 ? (v6553 + v6555) / 2 : 0;
  var v6567 = v6551.x2 - v6551.x1;
  var v6568 = v6551.y2 - v6551.y1;
  var v6569 = function v6570(v6571, v6572) {
    if (v6571 > 0) {
      return Math.max(v6571 - v6572, 0);
    } else {
      return Math.min(v6571 + v6572, 0);
    }
  };
  var v6573 = v6569(v6567, v6565);
  var v6574 = v6569(v6568, v6566);
  var v6575 = false;
  if (v6559 === v6550) {
    v6558 = Math.abs(v6573) > Math.abs(v6574) ? v6545 : v6544;
  } else if (v6559 === v6549 || v6559 === v6548) {
    v6558 = v6544;
    v6575 = true;
  } else if (v6559 === v6546 || v6559 === v6547) {
    v6558 = v6545;
    v6575 = true;
  }
  var v6576 = v6558 === v6544;
  var v6577 = v6576 ? v6574 : v6573;
  var v6578 = v6576 ? v6568 : v6567;
  var v6579 = signum(v6578);
  var v6580 = false;
  if ((!v6575 || !v6561 && !v6563) && (v6559 === v6548 && v6578 < 0 || v6559 === v6549 && v6578 > 0 || v6559 === v6546 && v6578 > 0 || v6559 === v6547 && v6578 < 0)) {
    v6579 *= -1;
    v6577 = v6579 * Math.abs(v6577);
    v6580 = true;
  }
  var v6581;
  if (v6561) {
    var v6582 = v6562 < 0 ? 1 + v6562 : v6562;
    v6581 = v6582 * v6577;
  } else {
    var v6583 = v6562 < 0 ? v6577 : 0;
    v6581 = v6583 + v6562 * v6579;
  }
  var v6584 = function v6585(v6586) {
    return Math.abs(v6586) < v6564 || Math.abs(v6586) >= Math.abs(v6577);
  };
  var v6587 = v6584(v6581);
  var v6588 = v6584(Math.abs(v6577) - Math.abs(v6581));
  var v6589 = v6587 || v6588;
  if (v6589 && !v6580) {
    if (v6576) {
      var v6590 = Math.abs(v6578) <= v6553 / 2;
      var v6591 = Math.abs(v6567) <= v6554 / 2;
      if (v6590) {
        var v6592 = (v6551.x1 + v6551.x2) / 2;
        var v6593 = v6551.y1;
        var v6594 = v6551.y2;
        v6543.segpts = [v6592, v6593, v6592, v6594];
      } else if (v6591) {
        var v6595 = (v6551.y1 + v6551.y2) / 2;
        var v6596 = v6551.x1;
        var v6597 = v6551.x2;
        v6543.segpts = [v6596, v6595, v6597, v6595];
      } else {
        v6543.segpts = [v6551.x1, v6551.y2];
      }
    } else {
      var v6598 = Math.abs(v6578) <= v6552 / 2;
      var v6599 = Math.abs(v6568) <= v6555 / 2;
      if (v6598) {
        var v6600 = (v6551.y1 + v6551.y2) / 2;
        var v6601 = v6551.x1;
        var v6602 = v6551.x2;
        v6543.segpts = [v6601, v6600, v6602, v6600];
      } else if (v6599) {
        var v6603 = (v6551.x1 + v6551.x2) / 2;
        var v6604 = v6551.y1;
        var v6605 = v6551.y2;
        v6543.segpts = [v6603, v6604, v6603, v6605];
      } else {
        v6543.segpts = [v6551.x2, v6551.y1];
      }
    }
  } else if (v6576) {
    var v6606 = v6551.y1 + v6581 + (v6557 ? v6553 / 2 * v6579 : 0);
    var v6607 = v6551.x1;
    var v6608 = v6551.x2;
    v6543.segpts = [v6607, v6606, v6608, v6606];
  } else {
    var v6609 = v6551.x1 + v6581 + (v6557 ? v6552 / 2 * v6579 : 0);
    var v6610 = v6551.y1;
    var v6611 = v6551.y2;
    v6543.segpts = [v6609, v6610, v6609, v6611];
  }
  if (v6543.isRound) {
    var v6612 = v6541.pstyle("taxi-radius").value;
    var v6613 = v6541.pstyle("radius-type").value[0] === "arc-radius";
    v6543.radii = new Array(v6543.segpts.length / 2).fill(v6612);
    v6543.isArcRadius = new Array(v6543.segpts.length / 2).fill(v6613);
  }
};
BRp$c.tryToCorrectInvalidPoints = function (v6614, v6615) {
  var v6616 = v6614._private.rscratch;
  if (v6616.edgeType === "bezier") {
    var v6617 = v6615.srcPos;
    var v6618 = v6615.tgtPos;
    var v6619 = v6615.srcW;
    var v6620 = v6615.srcH;
    var v6621 = v6615.tgtW;
    var v6622 = v6615.tgtH;
    var v6623 = v6615.srcShape;
    var v6624 = v6615.tgtShape;
    var v6625 = v6615.srcCornerRadius;
    var v6626 = v6615.tgtCornerRadius;
    var v6627 = v6615.srcRs;
    var v6628 = v6615.tgtRs;
    var v6629 = !number$1(v6616.startX) || !number$1(v6616.startY);
    var v6630 = !number$1(v6616.arrowStartX) || !number$1(v6616.arrowStartY);
    var v6631 = !number$1(v6616.endX) || !number$1(v6616.endY);
    var v6632 = !number$1(v6616.arrowEndX) || !number$1(v6616.arrowEndY);
    var v6633 = 3;
    var v6634 = this.getArrowWidth(v6614.pstyle("width").pfValue, v6614.pstyle("arrow-scale").value) * this.arrowShapeWidth;
    var v6635 = v6633 * v6634;
    var v6636 = dist({
      x: v6616.ctrlpts[0],
      y: v6616.ctrlpts[1]
    }, {
      x: v6616.startX,
      y: v6616.startY
    });
    var v6637 = v6636 < v6635;
    var v6638 = dist({
      x: v6616.ctrlpts[0],
      y: v6616.ctrlpts[1]
    }, {
      x: v6616.endX,
      y: v6616.endY
    });
    var v6639 = v6638 < v6635;
    var v6640 = false;
    if (v6629 || v6630 || v6637) {
      v6640 = true;
      var v6641 = {
        x: v6616.ctrlpts[0] - v6617.x,
        y: v6616.ctrlpts[1] - v6617.y
      };
      var v6642 = Math.sqrt(v6641.x * v6641.x + v6641.y * v6641.y);
      var v6643 = {
        x: v6641.x / v6642,
        y: v6641.y / v6642
      };
      var v6644 = Math.max(v6619, v6620);
      var v6645 = {
        x: v6616.ctrlpts[0] + v6643.x * 2 * v6644,
        y: v6616.ctrlpts[1] + v6643.y * 2 * v6644
      };
      var v6646 = v6623.intersectLine(v6617.x, v6617.y, v6619, v6620, v6645.x, v6645.y, 0, v6625, v6627);
      if (v6637) {
        v6616.ctrlpts[0] = v6616.ctrlpts[0] + v6643.x * (v6635 - v6636);
        v6616.ctrlpts[1] = v6616.ctrlpts[1] + v6643.y * (v6635 - v6636);
      } else {
        v6616.ctrlpts[0] = v6646[0] + v6643.x * v6635;
        v6616.ctrlpts[1] = v6646[1] + v6643.y * v6635;
      }
    }
    if (v6631 || v6632 || v6639) {
      v6640 = true;
      var v6647 = {
        x: v6616.ctrlpts[0] - v6618.x,
        y: v6616.ctrlpts[1] - v6618.y
      };
      var v6648 = Math.sqrt(v6647.x * v6647.x + v6647.y * v6647.y);
      var v6649 = {
        x: v6647.x / v6648,
        y: v6647.y / v6648
      };
      var v6650 = Math.max(v6619, v6620);
      var v6651 = {
        x: v6616.ctrlpts[0] + v6649.x * 2 * v6650,
        y: v6616.ctrlpts[1] + v6649.y * 2 * v6650
      };
      var v6652 = v6624.intersectLine(v6618.x, v6618.y, v6621, v6622, v6651.x, v6651.y, 0, v6626, v6628);
      if (v6639) {
        v6616.ctrlpts[0] = v6616.ctrlpts[0] + v6649.x * (v6635 - v6638);
        v6616.ctrlpts[1] = v6616.ctrlpts[1] + v6649.y * (v6635 - v6638);
      } else {
        v6616.ctrlpts[0] = v6652[0] + v6649.x * v6635;
        v6616.ctrlpts[1] = v6652[1] + v6649.y * v6635;
      }
    }
    if (v6640) {
      this.findEndpoints(v6614);
    }
  }
};
BRp$c.storeAllpts = function (v6653) {
  var v6654 = v6653._private.rscratch;
  if (v6654.edgeType === "multibezier" || v6654.edgeType === "bezier" || v6654.edgeType === "self" || v6654.edgeType === "compound") {
    v6654.allpts = [];
    v6654.allpts.push(v6654.startX, v6654.startY);
    for (var v6655 = 0; v6655 + 1 < v6654.ctrlpts.length; v6655 += 2) {
      v6654.allpts.push(v6654.ctrlpts[v6655], v6654.ctrlpts[v6655 + 1]);
      if (v6655 + 3 < v6654.ctrlpts.length) {
        v6654.allpts.push((v6654.ctrlpts[v6655] + v6654.ctrlpts[v6655 + 2]) / 2, (v6654.ctrlpts[v6655 + 1] + v6654.ctrlpts[v6655 + 3]) / 2);
      }
    }
    v6654.allpts.push(v6654.endX, v6654.endY);
    var v6656;
    var v6657;
    if (v6654.ctrlpts.length / 2 % 2 === 0) {
      v6656 = v6654.allpts.length / 2 - 1;
      v6654.midX = v6654.allpts[v6656];
      v6654.midY = v6654.allpts[v6656 + 1];
    } else {
      v6656 = v6654.allpts.length / 2 - 3;
      v6657 = 0.5;
      v6654.midX = qbezierAt(v6654.allpts[v6656], v6654.allpts[v6656 + 2], v6654.allpts[v6656 + 4], v6657);
      v6654.midY = qbezierAt(v6654.allpts[v6656 + 1], v6654.allpts[v6656 + 3], v6654.allpts[v6656 + 5], v6657);
    }
  } else if (v6654.edgeType === "straight") {
    v6654.allpts = [v6654.startX, v6654.startY, v6654.endX, v6654.endY];
    v6654.midX = (v6654.startX + v6654.endX + v6654.arrowStartX + v6654.arrowEndX) / 4;
    v6654.midY = (v6654.startY + v6654.endY + v6654.arrowStartY + v6654.arrowEndY) / 4;
  } else if (v6654.edgeType === "segments") {
    v6654.allpts = [];
    v6654.allpts.push(v6654.startX, v6654.startY);
    v6654.allpts.push.apply(v6654.allpts, v6654.segpts);
    v6654.allpts.push(v6654.endX, v6654.endY);
    if (v6654.isRound) {
      v6654.roundCorners = [];
      for (var v6658 = 2; v6658 + 3 < v6654.allpts.length; v6658 += 2) {
        var v6659 = v6654.radii[v6658 / 2 - 1];
        var v6660 = v6654.isArcRadius[v6658 / 2 - 1];
        v6654.roundCorners.push(getRoundCorner({
          x: v6654.allpts[v6658 - 2],
          y: v6654.allpts[v6658 - 1]
        }, {
          x: v6654.allpts[v6658],
          y: v6654.allpts[v6658 + 1],
          radius: v6659
        }, {
          x: v6654.allpts[v6658 + 2],
          y: v6654.allpts[v6658 + 3]
        }, v6659, v6660));
      }
    }
    if (v6654.segpts.length % 4 === 0) {
      var v6661 = v6654.segpts.length / 2;
      var v6662 = v6661 - 2;
      v6654.midX = (v6654.segpts[v6662] + v6654.segpts[v6661]) / 2;
      v6654.midY = (v6654.segpts[v6662 + 1] + v6654.segpts[v6661 + 1]) / 2;
    } else {
      var v6663 = v6654.segpts.length / 2 - 1;
      if (!v6654.isRound) {
        v6654.midX = v6654.segpts[v6663];
        v6654.midY = v6654.segpts[v6663 + 1];
      } else {
        var v6664 = {
          x: v6654.segpts[v6663],
          y: v6654.segpts[v6663 + 1]
        };
        var v6665 = v6654.roundCorners[v6663 / 2];
        if (v6665.radius === 0) {
          var v6666 = {
            x: v6654.segpts[v6663 + 2],
            y: v6654.segpts[v6663 + 3]
          };
          v6654.midX = v6664.x;
          v6654.midY = v6664.y;
          v6654.midVector = [v6664.y - v6666.y, v6666.x - v6664.x];
        } else {
          var v6667 = [v6664.x - v6665.cx, v6664.y - v6665.cy];
          var v6668 = v6665.radius / Math.sqrt(Math.pow(v6667[0], 2) + Math.pow(v6667[1], 2));
          v6667 = v6667.map(function (v6669) {
            return v6669 * v6668;
          });
          v6654.midX = v6665.cx + v6667[0];
          v6654.midY = v6665.cy + v6667[1];
          v6654.midVector = v6667;
        }
      }
    }
  }
};
BRp$c.checkForInvalidEdgeWarning = function (v6670) {
  var v6671 = v6670[0]._private.rscratch;
  if (v6671.nodesOverlap || number$1(v6671.startX) && number$1(v6671.startY) && number$1(v6671.endX) && number$1(v6671.endY)) {
    v6671.loggedErr = false;
  } else if (!v6671.loggedErr) {
    v6671.loggedErr = true;
    warn("Edge `" + v6670.id() + "` has invalid endpoints and so it is impossible to draw.  Adjust your edge style (e.g. control points) accordingly or use an alternative edge type.  This is expected behaviour when the source node and the target node overlap.");
  }
};
BRp$c.findEdgeControlPoints = function (v6672) {
  var v6673 = this;
  if (!v6672 || v6672.length === 0) {
    return;
  }
  var v6674 = this;
  var v6675 = v6674.cy;
  var v6676 = v6675.hasCompoundNodes();
  var v6677 = new Map$1();
  var v6678 = function v6679(v6680, v6681) {
    return [].concat(_toConsumableArray(v6680), [v6681 ? 1 : 0]).join("-");
  };
  var v6682 = [];
  var v6683 = [];
  for (var v6684 = 0; v6684 < v6672.length; v6684++) {
    var v6685 = v6672[v6684];
    var v6686 = v6685._private;
    var v6687 = v6685.pstyle("curve-style").value;
    if (v6685.removed() || !v6685.takesUpSpace()) {
      continue;
    }
    if (v6687 === "haystack") {
      v6683.push(v6685);
      continue;
    }
    var v6688 = v6687 === "unbundled-bezier" || endsWith(v6687, "segments") || v6687 === "straight" || v6687 === "straight-triangle" || endsWith(v6687, "taxi");
    var v6689 = v6687 === "unbundled-bezier" || v6687 === "bezier";
    var v6690 = v6686.source;
    var v6691 = v6686.target;
    var v6692 = v6690.poolIndex();
    var v6693 = v6691.poolIndex();
    var v6694 = [v6692, v6693].sort();
    var v6695 = v6678(v6694, v6688);
    var v6696 = v6677.get(v6695);
    if (v6696 == null) {
      v6696 = {
        eles: []
      };
      v6682.push({
        pairId: v6694,
        edgeIsUnbundled: v6688
      });
      v6677.set(v6695, v6696);
    }
    v6696.eles.push(v6685);
    if (v6688) {
      v6696.hasUnbundled = true;
    }
    if (v6689) {
      v6696.hasBezier = true;
    }
  }
  var v6697 = function v6698() {
    var v6699 = v6682[v6700];
    var v6701 = v6699.pairId;
    var v6702 = v6699.edgeIsUnbundled;
    var v6703 = v6678(v6701, v6702);
    var v6704 = v6677.get(v6703);
    var v6705;
    if (!v6704.hasUnbundled) {
      var v6706 = v6704.eles[0].parallelEdges().filter(function (v6707) {
        return v6707.isBundledBezier();
      });
      clearArray(v6704.eles);
      v6706.forEach(function (v6708) {
        return v6704.eles.push(v6708);
      });
      v6704.eles.sort(function (v6709, v6710) {
        return v6709.poolIndex() - v6710.poolIndex();
      });
    }
    var v6711 = v6704.eles[0];
    var v6712 = v6711.source();
    var v6713 = v6711.target();
    if (v6712.poolIndex() > v6713.poolIndex()) {
      var v6714 = v6712;
      v6712 = v6713;
      v6713 = v6714;
    }
    var v6715 = v6704.srcPos = v6712.position();
    var v6716 = v6704.tgtPos = v6713.position();
    var v6717 = v6704.srcW = v6712.outerWidth();
    var v6718 = v6704.srcH = v6712.outerHeight();
    var v6719 = v6704.tgtW = v6713.outerWidth();
    var v6720 = v6704.tgtH = v6713.outerHeight();
    var v6721 = v6704.srcShape = v6674.nodeShapes[v6673.getNodeShape(v6712)];
    var v6722 = v6704.tgtShape = v6674.nodeShapes[v6673.getNodeShape(v6713)];
    var v6723 = v6704.srcCornerRadius = v6712.pstyle("corner-radius").value === "auto" ? "auto" : v6712.pstyle("corner-radius").pfValue;
    var v6724 = v6704.tgtCornerRadius = v6713.pstyle("corner-radius").value === "auto" ? "auto" : v6713.pstyle("corner-radius").pfValue;
    var v6725 = v6704.tgtRs = v6713._private.rscratch;
    var v6726 = v6704.srcRs = v6712._private.rscratch;
    v6704.dirCounts = {
      north: 0,
      west: 0,
      south: 0,
      east: 0,
      northwest: 0,
      southwest: 0,
      northeast: 0,
      southeast: 0
    };
    for (var v6727 = 0; v6727 < v6704.eles.length; v6727++) {
      var v6728 = v6704.eles[v6727];
      var v6729 = v6728[0]._private.rscratch;
      var v6730 = v6728.pstyle("curve-style").value;
      var v6731 = v6730 === "unbundled-bezier" || endsWith(v6730, "segments") || endsWith(v6730, "taxi");
      var v6732 = !v6712.same(v6728.source());
      if (!v6704.calculatedIntersection && v6712 !== v6713 && (v6704.hasBezier || v6704.hasUnbundled)) {
        v6704.calculatedIntersection = true;
        var v6733 = v6721.intersectLine(v6715.x, v6715.y, v6717, v6718, v6716.x, v6716.y, 0, v6723, v6726);
        var v6734 = v6704.srcIntn = v6733;
        var v6735 = v6722.intersectLine(v6716.x, v6716.y, v6719, v6720, v6715.x, v6715.y, 0, v6724, v6725);
        var v6736 = v6704.tgtIntn = v6735;
        var v6737 = v6704.intersectionPts = {
          x1: v6733[0],
          x2: v6735[0],
          y1: v6733[1],
          y2: v6735[1]
        };
        var v6738 = v6704.posPts = {
          x1: v6715.x,
          x2: v6716.x,
          y1: v6715.y,
          y2: v6716.y
        };
        var v6739 = v6735[1] - v6733[1];
        var v6740 = v6735[0] - v6733[0];
        var v6741 = Math.sqrt(v6740 * v6740 + v6739 * v6739);
        if (number$1(v6741) && v6741 >= AVOID_IMPOSSIBLE_BEZIER_CONSTANT_L) ;else {
          v6741 = Math.sqrt(Math.max(v6740 * v6740, AVOID_IMPOSSIBLE_BEZIER_CONSTANT) + Math.max(v6739 * v6739, AVOID_IMPOSSIBLE_BEZIER_CONSTANT));
        }
        var v6742 = v6704.vector = {
          x: v6740,
          y: v6739
        };
        var v6743 = v6704.vectorNorm = {
          x: v6742.x / v6741,
          y: v6742.y / v6741
        };
        var v6744 = {
          x: -v6743.y,
          y: v6743.x
        };
        v6704.nodesOverlap = !number$1(v6741) || v6722.checkPoint(v6733[0], v6733[1], 0, v6719, v6720, v6716.x, v6716.y, v6724, v6725) || v6721.checkPoint(v6735[0], v6735[1], 0, v6717, v6718, v6715.x, v6715.y, v6723, v6726);
        v6704.vectorNormInverse = v6744;
        v6705 = {
          nodesOverlap: v6704.nodesOverlap,
          dirCounts: v6704.dirCounts,
          calculatedIntersection: true,
          hasBezier: v6704.hasBezier,
          hasUnbundled: v6704.hasUnbundled,
          eles: v6704.eles,
          srcPos: v6716,
          srcRs: v6725,
          tgtPos: v6715,
          tgtRs: v6726,
          srcW: v6719,
          srcH: v6720,
          tgtW: v6717,
          tgtH: v6718,
          srcIntn: v6736,
          tgtIntn: v6734,
          srcShape: v6722,
          tgtShape: v6721,
          posPts: {
            x1: v6738.x2,
            y1: v6738.y2,
            x2: v6738.x1,
            y2: v6738.y1
          },
          intersectionPts: {
            x1: v6737.x2,
            y1: v6737.y2,
            x2: v6737.x1,
            y2: v6737.y1
          },
          vector: {
            x: -v6742.x,
            y: -v6742.y
          },
          vectorNorm: {
            x: -v6743.x,
            y: -v6743.y
          },
          vectorNormInverse: {
            x: -v6744.x,
            y: -v6744.y
          }
        };
      }
      var v6745 = v6732 ? v6705 : v6704;
      v6729.nodesOverlap = v6745.nodesOverlap;
      v6729.srcIntn = v6745.srcIntn;
      v6729.tgtIntn = v6745.tgtIntn;
      v6729.isRound = v6730.startsWith("round");
      if (v6676 && (v6712.isParent() || v6712.isChild() || v6713.isParent() || v6713.isChild()) && (v6712.parents().anySame(v6713) || v6713.parents().anySame(v6712) || v6712.same(v6713) && v6712.isParent())) {
        v6673.findCompoundLoopPoints(v6728, v6745, v6727, v6731);
      } else if (v6712 === v6713) {
        v6673.findLoopPoints(v6728, v6745, v6727, v6731);
      } else if (v6730.endsWith("segments")) {
        v6673.findSegmentsPoints(v6728, v6745);
      } else if (v6730.endsWith("taxi")) {
        v6673.findTaxiPoints(v6728, v6745);
      } else if (v6730 === "straight" || !v6731 && v6704.eles.length % 2 === 1 && v6727 === Math.floor(v6704.eles.length / 2)) {
        v6673.findStraightEdgePoints(v6728);
      } else {
        v6673.findBezierPoints(v6728, v6745, v6727, v6731, v6732);
      }
      v6673.findEndpoints(v6728);
      v6673.tryToCorrectInvalidPoints(v6728, v6745);
      v6673.checkForInvalidEdgeWarning(v6728);
      v6673.storeAllpts(v6728);
      v6673.storeEdgeProjections(v6728);
      v6673.calculateArrowAngles(v6728);
      v6673.recalculateEdgeLabelProjections(v6728);
      v6673.calculateLabelAngles(v6728);
    }
  };
  for (var v6700 = 0; v6700 < v6682.length; v6700++) {
    v6697();
  }
  this.findHaystackPoints(v6683);
};
function getPts(v6746) {
  var v6747 = [];
  if (v6746 == null) {
    return;
  }
  for (var v6748 = 0; v6748 < v6746.length; v6748 += 2) {
    var v6749 = v6746[v6748];
    var v6750 = v6746[v6748 + 1];
    v6747.push({
      x: v6749,
      y: v6750
    });
  }
  return v6747;
}
BRp$c.getSegmentPoints = function (v6751) {
  var v6752 = v6751[0]._private.rscratch;
  this.recalculateRenderedStyle(v6751);
  var v6753 = v6752.edgeType;
  if (v6753 === "segments") {
    return getPts(v6752.segpts);
  }
};
BRp$c.getControlPoints = function (v6754) {
  var v6755 = v6754[0]._private.rscratch;
  this.recalculateRenderedStyle(v6754);
  var v6756 = v6755.edgeType;
  if (v6756 === "bezier" || v6756 === "multibezier" || v6756 === "self" || v6756 === "compound") {
    return getPts(v6755.ctrlpts);
  }
};
BRp$c.getEdgeMidpoint = function (v6757) {
  var v6758 = v6757[0]._private.rscratch;
  this.recalculateRenderedStyle(v6757);
  return {
    x: v6758.midX,
    y: v6758.midY
  };
};
var BRp$b = {};
BRp$b.manualEndptToPx = function (v6759, v6760) {
  var v6761 = this;
  var v6762 = v6759.position();
  var v6763 = v6759.outerWidth();
  var v6764 = v6759.outerHeight();
  var v6765 = v6759._private.rscratch;
  if (v6760.value.length === 2) {
    var v6766 = [v6760.pfValue[0], v6760.pfValue[1]];
    if (v6760.units[0] === "%") {
      v6766[0] = v6766[0] * v6763;
    }
    if (v6760.units[1] === "%") {
      v6766[1] = v6766[1] * v6764;
    }
    v6766[0] += v6762.x;
    v6766[1] += v6762.y;
    return v6766;
  } else {
    var v6767 = v6760.pfValue[0];
    v6767 = -Math.PI / 2 + v6767;
    var v6768 = Math.max(v6763, v6764) * 2;
    var v6769 = [v6762.x + Math.cos(v6767) * v6768, v6762.y + Math.sin(v6767) * v6768];
    return v6761.nodeShapes[this.getNodeShape(v6759)].intersectLine(v6762.x, v6762.y, v6763, v6764, v6769[0], v6769[1], 0, v6759.pstyle("corner-radius").value === "auto" ? "auto" : v6759.pstyle("corner-radius").pfValue, v6765);
  }
};
BRp$b.findEndpoints = function (v6770) {
  var v6771;
  var v6772;
  var v6773 = this;
  var v6774;
  var v6775 = v6770.source()[0];
  var v6776 = v6770.target()[0];
  var v6777 = v6775.position();
  var v6778 = v6776.position();
  var v6779 = v6770.pstyle("target-arrow-shape").value;
  var v6780 = v6770.pstyle("source-arrow-shape").value;
  var v6781 = v6770.pstyle("target-distance-from-node").pfValue;
  var v6782 = v6770.pstyle("source-distance-from-node").pfValue;
  var v6783 = v6775._private.rscratch;
  var v6784 = v6776._private.rscratch;
  var v6785 = v6770.pstyle("curve-style").value;
  var v6786 = v6770._private.rscratch;
  var v6787 = v6786.edgeType;
  var v6788 = endsWith(v6785, "taxi");
  var v6789 = v6787 === "self" || v6787 === "compound";
  var v6790 = v6787 === "bezier" || v6787 === "multibezier" || v6789;
  var v6791 = v6787 !== "bezier";
  var v6792 = v6787 === "straight" || v6787 === "segments";
  var v6793 = v6787 === "segments";
  var v6794 = v6790 || v6791 || v6792;
  var v6795 = v6789 || v6788;
  var v6796 = v6770.pstyle("source-endpoint");
  var v6797 = v6795 ? "outside-to-node" : v6796.value;
  var v6798 = v6775.pstyle("corner-radius").value === "auto" ? "auto" : v6775.pstyle("corner-radius").pfValue;
  var v6799 = v6770.pstyle("target-endpoint");
  var v6800 = v6795 ? "outside-to-node" : v6799.value;
  var v6801 = v6776.pstyle("corner-radius").value === "auto" ? "auto" : v6776.pstyle("corner-radius").pfValue;
  v6786.srcManEndpt = v6796;
  v6786.tgtManEndpt = v6799;
  var v6802;
  var v6803;
  var v6804;
  var v6805;
  var v6806 = ((v6799 === null || v6799 === undefined || (v6771 = v6799.pfValue) === null || v6771 === undefined ? undefined : v6771.length) === 2 ? v6799.pfValue : null) ?? [0, 0];
  var v6807 = ((v6796 === null || v6796 === undefined || (v6772 = v6796.pfValue) === null || v6772 === undefined ? undefined : v6772.length) === 2 ? v6796.pfValue : null) ?? [0, 0];
  if (v6790) {
    var v6808 = [v6786.ctrlpts[0], v6786.ctrlpts[1]];
    var v6809 = v6791 ? [v6786.ctrlpts[v6786.ctrlpts.length - 2], v6786.ctrlpts[v6786.ctrlpts.length - 1]] : v6808;
    v6802 = v6809;
    v6803 = v6808;
  } else if (v6792) {
    var v6810 = !v6793 ? [v6778.x + v6806[0], v6778.y + v6806[1]] : v6786.segpts.slice(0, 2);
    var v6811 = !v6793 ? [v6777.x + v6807[0], v6777.y + v6807[1]] : v6786.segpts.slice(v6786.segpts.length - 2);
    v6802 = v6811;
    v6803 = v6810;
  }
  if (v6800 === "inside-to-node") {
    v6774 = [v6778.x, v6778.y];
  } else if (v6799.units) {
    v6774 = this.manualEndptToPx(v6776, v6799);
  } else if (v6800 === "outside-to-line") {
    v6774 = v6786.tgtIntn;
  } else {
    if (v6800 === "outside-to-node" || v6800 === "outside-to-node-or-label") {
      v6804 = v6802;
    } else if (v6800 === "outside-to-line" || v6800 === "outside-to-line-or-label") {
      v6804 = [v6777.x, v6777.y];
    }
    v6774 = v6773.nodeShapes[this.getNodeShape(v6776)].intersectLine(v6778.x, v6778.y, v6776.outerWidth(), v6776.outerHeight(), v6804[0], v6804[1], 0, v6801, v6784);
    if (v6800 === "outside-to-node-or-label" || v6800 === "outside-to-line-or-label") {
      var v6812 = v6776._private.rscratch;
      var v6813 = v6812.labelWidth;
      var v6814 = v6812.labelHeight;
      var v6815 = v6812.labelX;
      var v6816 = v6812.labelY;
      var v6817 = v6813 / 2;
      var v6818 = v6814 / 2;
      var v6819 = v6776.pstyle("text-valign").value;
      v6819 = labelValign(v6819);
      if (v6819 === "top") {
        v6816 -= v6818;
      } else if (v6819 === "bottom") {
        v6816 += v6818;
      }
      var v6820 = v6776.pstyle("text-halign").value;
      v6820 = labelHalign(v6820);
      if (v6820 === "left") {
        v6815 -= v6817;
      } else if (v6820 === "right") {
        v6815 += v6817;
      }
      var v6821 = polygonIntersectLine(v6804[0], v6804[1], [v6815 - v6817, v6816 - v6818, v6815 + v6817, v6816 - v6818, v6815 + v6817, v6816 + v6818, v6815 - v6817, v6816 + v6818], v6778.x, v6778.y);
      if (v6821.length > 0) {
        var v6822 = v6777;
        var v6823 = sqdist(v6822, array2point(v6774));
        var v6824 = sqdist(v6822, array2point(v6821));
        var v6825 = v6823;
        if (v6824 < v6823) {
          v6774 = v6821;
          v6825 = v6824;
        }
        if (v6821.length > 2) {
          var v6826 = sqdist(v6822, {
            x: v6821[2],
            y: v6821[3]
          });
          if (v6826 < v6825) {
            v6774 = [v6821[2], v6821[3]];
          }
        }
      }
    }
  }
  var v6827 = shortenIntersection(v6774, v6802, v6773.arrowShapes[v6779].spacing(v6770) + v6781);
  var v6828 = shortenIntersection(v6774, v6802, v6773.arrowShapes[v6779].gap(v6770) + v6781);
  v6786.endX = v6828[0];
  v6786.endY = v6828[1];
  v6786.arrowEndX = v6827[0];
  v6786.arrowEndY = v6827[1];
  if (v6797 === "inside-to-node") {
    v6774 = [v6777.x, v6777.y];
  } else if (v6796.units) {
    v6774 = this.manualEndptToPx(v6775, v6796);
  } else if (v6797 === "outside-to-line") {
    v6774 = v6786.srcIntn;
  } else {
    if (v6797 === "outside-to-node" || v6797 === "outside-to-node-or-label") {
      v6805 = v6803;
    } else if (v6797 === "outside-to-line" || v6797 === "outside-to-line-or-label") {
      v6805 = [v6778.x, v6778.y];
    }
    v6774 = v6773.nodeShapes[this.getNodeShape(v6775)].intersectLine(v6777.x, v6777.y, v6775.outerWidth(), v6775.outerHeight(), v6805[0], v6805[1], 0, v6798, v6783);
    if (v6797 === "outside-to-node-or-label" || v6797 === "outside-to-line-or-label") {
      var v6829 = v6775._private.rscratch;
      var v6830 = v6829.labelWidth;
      var v6831 = v6829.labelHeight;
      var v6832 = v6829.labelX;
      var v6833 = v6829.labelY;
      var v6834 = v6830 / 2;
      var v6835 = v6831 / 2;
      var v6836 = v6775.pstyle("text-valign").value;
      v6836 = labelValign(v6836);
      if (v6836 === "top") {
        v6833 -= v6835;
      } else if (v6836 === "bottom") {
        v6833 += v6835;
      }
      var v6837 = v6775.pstyle("text-halign").value;
      v6837 = labelHalign(v6837);
      if (v6837 === "left") {
        v6832 -= v6834;
      } else if (v6837 === "right") {
        v6832 += v6834;
      }
      var v6838 = polygonIntersectLine(v6805[0], v6805[1], [v6832 - v6834, v6833 - v6835, v6832 + v6834, v6833 - v6835, v6832 + v6834, v6833 + v6835, v6832 - v6834, v6833 + v6835], v6777.x, v6777.y);
      if (v6838.length > 0) {
        var v6839 = v6778;
        var v6840 = sqdist(v6839, array2point(v6774));
        var v6841 = sqdist(v6839, array2point(v6838));
        var v6842 = v6840;
        if (v6841 < v6840) {
          v6774 = [v6838[0], v6838[1]];
          v6842 = v6841;
        }
        if (v6838.length > 2) {
          var v6843 = sqdist(v6839, {
            x: v6838[2],
            y: v6838[3]
          });
          if (v6843 < v6842) {
            v6774 = [v6838[2], v6838[3]];
          }
        }
      }
    }
  }
  var v6844 = shortenIntersection(v6774, v6803, v6773.arrowShapes[v6780].spacing(v6770) + v6782);
  var v6845 = shortenIntersection(v6774, v6803, v6773.arrowShapes[v6780].gap(v6770) + v6782);
  v6786.startX = v6845[0];
  v6786.startY = v6845[1];
  v6786.arrowStartX = v6844[0];
  v6786.arrowStartY = v6844[1];
  if (v6794) {
    if (!number$1(v6786.startX) || !number$1(v6786.startY) || !number$1(v6786.endX) || !number$1(v6786.endY)) {
      v6786.badLine = true;
    } else {
      v6786.badLine = false;
    }
  }
};
BRp$b.getSourceEndpoint = function (v6846) {
  var v6847 = v6846[0]._private.rscratch;
  this.recalculateRenderedStyle(v6846);
  switch (v6847.edgeType) {
    case "haystack":
      return {
        x: v6847.haystackPts[0],
        y: v6847.haystackPts[1]
      };
    default:
      return {
        x: v6847.arrowStartX,
        y: v6847.arrowStartY
      };
  }
};
BRp$b.getTargetEndpoint = function (v6848) {
  var v6849 = v6848[0]._private.rscratch;
  this.recalculateRenderedStyle(v6848);
  switch (v6849.edgeType) {
    case "haystack":
      return {
        x: v6849.haystackPts[2],
        y: v6849.haystackPts[3]
      };
    default:
      return {
        x: v6849.arrowEndX,
        y: v6849.arrowEndY
      };
  }
};
var BRp$a = {};
function pushBezierPts(v6850, v6851, v6852) {
  var v6853 = function v6854(v6855, v6856, v6857, v6858) {
    return qbezierAt(v6855, v6856, v6857, v6858);
  };
  var v6859 = v6851._private;
  var v6860 = v6859.rstyle.bezierPts;
  for (var v6861 = 0; v6861 < v6850.bezierProjPcts.length; v6861++) {
    var v6862 = v6850.bezierProjPcts[v6861];
    v6860.push({
      x: v6853(v6852[0], v6852[2], v6852[4], v6862),
      y: v6853(v6852[1], v6852[3], v6852[5], v6862)
    });
  }
}
BRp$a.storeEdgeProjections = function (v6863) {
  var v6864 = v6863._private;
  var v6865 = v6864.rscratch;
  var v6866 = v6865.edgeType;
  v6864.rstyle.bezierPts = null;
  v6864.rstyle.linePts = null;
  v6864.rstyle.haystackPts = null;
  if (v6866 === "multibezier" || v6866 === "bezier" || v6866 === "self" || v6866 === "compound") {
    v6864.rstyle.bezierPts = [];
    for (var v6867 = 0; v6867 + 5 < v6865.allpts.length; v6867 += 4) {
      pushBezierPts(this, v6863, v6865.allpts.slice(v6867, v6867 + 6));
    }
  } else if (v6866 === "segments") {
    var v6868 = v6864.rstyle.linePts = [];
    for (var v6867 = 0; v6867 + 1 < v6865.allpts.length; v6867 += 2) {
      v6868.push({
        x: v6865.allpts[v6867],
        y: v6865.allpts[v6867 + 1]
      });
    }
  } else if (v6866 === "haystack") {
    var v6869 = v6865.haystackPts;
    v6864.rstyle.haystackPts = [{
      x: v6869[0],
      y: v6869[1]
    }, {
      x: v6869[2],
      y: v6869[3]
    }];
  }
  v6864.rstyle.arrowWidth = this.getArrowWidth(v6863.pstyle("width").pfValue, v6863.pstyle("arrow-scale").value) * this.arrowShapeWidth;
};
BRp$a.recalculateEdgeProjections = function (v6870) {
  this.findEdgeControlPoints(v6870);
};
var BRp$9 = {};
BRp$9.recalculateNodeLabelProjection = function (v6871) {
  var v6872 = v6871.pstyle("label").strValue;
  if (emptyString(v6872)) {
    return;
  }
  var v6873;
  var v6874;
  var v6875 = v6871._private;
  var v6876 = v6871.width();
  var v6877 = v6871.height();
  var v6878 = v6871.padding();
  var v6879 = v6871.position();
  var v6880 = v6871.pstyle("text-halign").strValue;
  var v6881 = v6871.pstyle("text-valign").strValue;
  var v6882 = v6875.rscratch;
  var v6883 = v6875.rstyle;
  switch (v6880) {
    case "left":
      v6873 = v6879.x - v6876 / 2 - v6878;
      break;
    case "left-inside":
      v6873 = v6879.x - v6876 / 2 + v6878;
      break;
    case "right":
      v6873 = v6879.x + v6876 / 2 + v6878;
      break;
    case "right-inside":
      v6873 = v6879.x + v6876 / 2 - v6878;
      break;
    default:
      v6873 = v6879.x;
  }
  switch (v6881) {
    case "top":
      v6874 = v6879.y - v6877 / 2 - v6878;
      break;
    case "top-inside":
      v6874 = v6879.y - v6877 / 2 + v6878;
      break;
    case "bottom":
      v6874 = v6879.y + v6877 / 2 + v6878;
      break;
    case "bottom-inside":
      v6874 = v6879.y + v6877 / 2 - v6878;
      break;
    default:
      v6874 = v6879.y;
  }
  v6882.labelX = v6873;
  v6882.labelY = v6874;
  v6883.labelX = v6873;
  v6883.labelY = v6874;
  this.calculateLabelAngles(v6871);
  this.applyLabelDimensions(v6871);
};
var lineAngleFromDelta = function lineAngleFromDelta2(v6884, v6885) {
  var v6886 = Math.atan(v6885 / v6884);
  if (v6884 === 0 && v6886 < 0) {
    v6886 = v6886 * -1;
  }
  return v6886;
};
var lineAngle = function lineAngle2(v6887, v6888) {
  var v6889 = v6888.x - v6887.x;
  var v6890 = v6888.y - v6887.y;
  return lineAngleFromDelta(v6889, v6890);
};
var bezierAngle = function bezierAngle2(v6891, v6892, v6893, v6894) {
  var v6895 = bound(0, v6894 - 0.001, 1);
  var v6896 = bound(0, v6894 + 0.001, 1);
  var v6897 = qbezierPtAt(v6891, v6892, v6893, v6895);
  var v6898 = qbezierPtAt(v6891, v6892, v6893, v6896);
  return lineAngle(v6897, v6898);
};
BRp$9.recalculateEdgeLabelProjections = function (v6899) {
  var v6900;
  var v6901 = v6899._private;
  var v6902 = v6901.rscratch;
  var v6903 = this;
  var v6904 = {
    mid: v6899.pstyle("label").strValue,
    source: v6899.pstyle("source-label").strValue,
    target: v6899.pstyle("target-label").strValue
  };
  if (v6904.mid || v6904.source || v6904.target) ;else {
    return;
  }
  v6900 = {
    x: v6902.midX,
    y: v6902.midY
  };
  var v6905 = function v6906(v6907, v6908, v6909) {
    setPrefixedProperty(v6901.rscratch, v6907, v6908, v6909);
    setPrefixedProperty(v6901.rstyle, v6907, v6908, v6909);
  };
  v6905("labelX", null, v6900.x);
  v6905("labelY", null, v6900.y);
  var v6910 = lineAngleFromDelta(v6902.midDispX, v6902.midDispY);
  v6905("labelAutoAngle", null, v6910);
  var v6911 = function v6912() {
    if (v6911.cache) {
      return v6911.cache;
    }
    var v6913 = [];
    for (var v6914 = 0; v6914 + 5 < v6902.allpts.length; v6914 += 4) {
      var v6915 = {
        x: v6902.allpts[v6914],
        y: v6902.allpts[v6914 + 1]
      };
      var v6916 = {
        x: v6902.allpts[v6914 + 2],
        y: v6902.allpts[v6914 + 3]
      };
      var v6917 = {
        x: v6902.allpts[v6914 + 4],
        y: v6902.allpts[v6914 + 5]
      };
      v6913.push({
        p0: v6915,
        p1: v6916,
        p2: v6917,
        startDist: 0,
        length: 0,
        segments: []
      });
    }
    var v6918 = v6901.rstyle.bezierPts;
    var v6919 = v6903.bezierProjPcts.length;
    function v6920(v6921, v6922, v6923, v6924, v6925) {
      var v6926 = dist(v6922, v6923);
      var v6927 = v6921.segments[v6921.segments.length - 1];
      var v6928 = {
        p0: v6922,
        p1: v6923,
        t0: v6924,
        t1: v6925,
        startDist: v6927 ? v6927.startDist + v6927.length : 0,
        length: v6926
      };
      v6921.segments.push(v6928);
      v6921.length += v6926;
    }
    for (var v6929 = 0; v6929 < v6913.length; v6929++) {
      var v6930 = v6913[v6929];
      var v6931 = v6913[v6929 - 1];
      if (v6931) {
        v6930.startDist = v6931.startDist + v6931.length;
      }
      v6920(v6930, v6930.p0, v6918[v6929 * v6919], 0, v6903.bezierProjPcts[0]);
      for (var v6932 = 0; v6932 < v6919 - 1; v6932++) {
        v6920(v6930, v6918[v6929 * v6919 + v6932], v6918[v6929 * v6919 + v6932 + 1], v6903.bezierProjPcts[v6932], v6903.bezierProjPcts[v6932 + 1]);
      }
      v6920(v6930, v6918[v6929 * v6919 + v6919 - 1], v6930.p2, v6903.bezierProjPcts[v6919 - 1], 1);
    }
    return v6911.cache = v6913;
  };
  var v6933 = function v6934(v6935) {
    var v6936;
    var v6937 = v6935 === "source";
    if (!v6904[v6935]) {
      return;
    }
    var v6938 = v6899.pstyle(v6935 + "-text-offset").pfValue;
    switch (v6902.edgeType) {
      case "self":
      case "compound":
      case "bezier":
      case "multibezier":
        {
          var v6939 = v6911();
          var v6940;
          var v6941 = 0;
          var v6942 = 0;
          for (var v6943 = 0; v6943 < v6939.length; v6943++) {
            var v6944 = v6939[v6937 ? v6943 : v6939.length - 1 - v6943];
            for (var v6945 = 0; v6945 < v6944.segments.length; v6945++) {
              var v6946 = v6944.segments[v6937 ? v6945 : v6944.segments.length - 1 - v6945];
              var v6947 = v6943 === v6939.length - 1 && v6945 === v6944.segments.length - 1;
              v6941 = v6942;
              v6942 += v6946.length;
              if (v6942 >= v6938 || v6947) {
                v6940 = {
                  cp: v6944,
                  segment: v6946
                };
                break;
              }
            }
            if (v6940) {
              break;
            }
          }
          var v6948 = v6940.cp;
          var v6949 = v6940.segment;
          var v6950 = (v6938 - v6941) / v6949.length;
          var v6951 = v6949.t1 - v6949.t0;
          var v6952 = v6937 ? v6949.t0 + v6951 * v6950 : v6949.t1 - v6951 * v6950;
          v6952 = bound(0, v6952, 1);
          v6900 = qbezierPtAt(v6948.p0, v6948.p1, v6948.p2, v6952);
          v6936 = bezierAngle(v6948.p0, v6948.p1, v6948.p2, v6952);
          break;
        }
      case "straight":
      case "segments":
      case "haystack":
        {
          var v6953 = 0;
          var v6954;
          var v6955;
          var v6956;
          var v6957;
          var v6958 = v6902.allpts.length;
          for (var v6959 = 0; v6959 + 3 < v6958; v6959 += 2) {
            if (v6937) {
              v6956 = {
                x: v6902.allpts[v6959],
                y: v6902.allpts[v6959 + 1]
              };
              v6957 = {
                x: v6902.allpts[v6959 + 2],
                y: v6902.allpts[v6959 + 3]
              };
            } else {
              v6956 = {
                x: v6902.allpts[v6958 - 2 - v6959],
                y: v6902.allpts[v6958 - 1 - v6959]
              };
              v6957 = {
                x: v6902.allpts[v6958 - 4 - v6959],
                y: v6902.allpts[v6958 - 3 - v6959]
              };
            }
            v6954 = dist(v6956, v6957);
            v6955 = v6953;
            v6953 += v6954;
            if (v6953 >= v6938) {
              break;
            }
          }
          var v6960 = v6938 - v6955;
          var v6961 = v6960 / v6954;
          v6961 = bound(0, v6961, 1);
          v6900 = lineAt(v6956, v6957, v6961);
          v6936 = lineAngle(v6956, v6957);
          break;
        }
    }
    v6905("labelX", v6935, v6900.x);
    v6905("labelY", v6935, v6900.y);
    v6905("labelAutoAngle", v6935, v6936);
  };
  v6933("source");
  v6933("target");
  this.applyLabelDimensions(v6899);
};
BRp$9.applyLabelDimensions = function (v6962) {
  this.applyPrefixedLabelDimensions(v6962);
  if (v6962.isEdge()) {
    this.applyPrefixedLabelDimensions(v6962, "source");
    this.applyPrefixedLabelDimensions(v6962, "target");
  }
};
BRp$9.applyPrefixedLabelDimensions = function (v6963, v6964) {
  var v6965 = v6963._private;
  var v6966 = this.getLabelText(v6963, v6964);
  var v6967 = hashString(v6966, v6963._private.labelDimsKey);
  if (getPrefixedProperty(v6965.rscratch, "prefixedLabelDimsKey", v6964) === v6967) {
    return;
  }
  setPrefixedProperty(v6965.rscratch, "prefixedLabelDimsKey", v6964, v6967);
  var v6968 = this.calculateLabelDimensions(v6963, v6966);
  var v6969 = v6963.pstyle("line-height").pfValue;
  var v6970 = v6963.pstyle("font-size").pfValue;
  var v6971 = v6963.pstyle("text-wrap").strValue;
  var v6972 = getPrefixedProperty(v6965.rscratch, "labelWrapCachedLines", v6964) || [];
  var v6973 = v6971 !== "wrap" ? 1 : Math.max(v6972.length, 1);
  var v6974 = v6970 * v6969;
  var v6975 = v6968.width;
  var v6976 = v6968.height + (v6973 - 1) * (v6969 - 1) * v6970;
  setPrefixedProperty(v6965.rstyle, "labelWidth", v6964, v6975);
  setPrefixedProperty(v6965.rscratch, "labelWidth", v6964, v6975);
  setPrefixedProperty(v6965.rstyle, "labelHeight", v6964, v6976);
  setPrefixedProperty(v6965.rscratch, "labelHeight", v6964, v6976);
  setPrefixedProperty(v6965.rscratch, "labelLineHeight", v6964, v6974);
  setPrefixedProperty(v6965.rscratch, "labelActualDescent", v6964, v6968.labelActualDescent);
};
BRp$9.getLabelText = function (v6977, v6978) {
  var v6979 = v6977._private;
  var v6980 = v6978 ? v6978 + "-" : "";
  var v6981 = v6977.pstyle(v6980 + "label").strValue;
  var v6982 = v6977.pstyle("text-transform").value;
  var v6983 = function v6984(v6985, v6986) {
    if (v6986) {
      setPrefixedProperty(v6979.rscratch, v6985, v6978, v6986);
      return v6986;
    } else {
      return getPrefixedProperty(v6979.rscratch, v6985, v6978);
    }
  };
  if (!v6981) {
    return "";
  }
  if (v6982 == "none") ;else if (v6982 == "uppercase") {
    v6981 = v6981.toUpperCase();
  } else if (v6982 == "lowercase") {
    v6981 = v6981.toLowerCase();
  }
  var v6987 = v6977.pstyle("text-wrap").value;
  if (v6987 === "wrap") {
    var v6988 = v6983("labelKey");
    if (v6988 != null && v6983("labelWrapKey") === v6988) {
      return v6983("labelWrapCachedText");
    }
    var v6989 = "​";
    var v6990 = v6981.split("\n");
    var v6991 = v6977.pstyle("text-max-width").pfValue;
    var v6992 = v6977.pstyle("text-overflow-wrap").value;
    var v6993 = v6992 === "anywhere";
    var v6994 = [];
    var v6995 = /[\s\u200b]+|$/g;
    for (var v6996 = 0; v6996 < v6990.length; v6996++) {
      var v6997 = v6990[v6996];
      var v6998 = this.calculateLabelDimensions(v6977, v6997);
      var v6999 = v6998.width;
      if (v6993) {
        var v7000 = v6997.split("").join(v6989);
        v6997 = v7000;
      }
      if (v6999 > v6991) {
        var v7001 = v6997.matchAll(v6995);
        var v7002 = "";
        var v7003 = 0;
        var v7004 = _createForOfIteratorHelper(v7001);
        var v7005;
        try {
          for (v7004.s(); !(v7005 = v7004.n()).done;) {
            var v7006 = v7005.value;
            var v7007 = v7006[0];
            var v7008 = v6997.substring(v7003, v7006.index);
            v7003 = v7006.index + v7007.length;
            var v7009 = v7002.length === 0 ? v7008 : v7002 + v7008 + v7007;
            var v7010 = this.calculateLabelDimensions(v6977, v7009);
            var v7011 = v7010.width;
            if (v7011 <= v6991) {
              v7002 += v7008 + v7007;
            } else {
              if (v7002) {
                v6994.push(v7002);
              }
              v7002 = v7008 + v7007;
            }
          }
        } catch (v7012) {
          v7004.e(v7012);
        } finally {
          v7004.f();
        }
        if (!v7002.match(/^[\s\u200b]+$/)) {
          v6994.push(v7002);
        }
      } else {
        v6994.push(v6997);
      }
    }
    v6983("labelWrapCachedLines", v6994);
    v6981 = v6983("labelWrapCachedText", v6994.join("\n"));
    v6983("labelWrapKey", v6988);
  } else if (v6987 === "ellipsis") {
    var v7013 = v6977.pstyle("text-max-width").pfValue;
    var v7014 = "";
    var v7015 = "…";
    var v7016 = false;
    if (this.calculateLabelDimensions(v6977, v6981).width < v7013) {
      return v6981;
    }
    for (var v7017 = 0; v7017 < v6981.length; v7017++) {
      var v7018 = this.calculateLabelDimensions(v6977, v7014 + v6981[v7017] + v7015).width;
      if (v7018 > v7013) {
        break;
      }
      v7014 += v6981[v7017];
      if (v7017 === v6981.length - 1) {
        v7016 = true;
      }
    }
    if (!v7016) {
      v7014 += v7015;
    }
    return v7014;
  }
  return v6981;
};
BRp$9.getLabelJustification = function (v7019) {
  var v7020 = v7019.pstyle("text-justification").strValue;
  var v7021 = v7019.pstyle("text-halign").strValue;
  if (v7020 === "auto") {
    if (v7019.isNode()) {
      return labelJustification(v7021);
    } else {
      return "center";
    }
  } else {
    return v7020;
  }
};
BRp$9.calculateLabelDimensions = function (v7022, v7023) {
  var v7024 = this;
  var v7025 = v7024.cy.window();
  var v7026 = v7025.document;
  var v7027 = 0;
  var v7028 = v7022.pstyle("font-style").strValue;
  var v7029 = v7022.pstyle("font-size").pfValue;
  var v7030 = v7022.pstyle("font-family").strValue;
  var v7031 = v7022.pstyle("font-weight").strValue;
  var v7032 = v7022.pstyle("text-metrics").strValue || "font";
  var v7033 = this.labelCalcCanvas;
  var v7034 = this.labelCalcCanvasContext;
  if (!v7033) {
    v7033 = this.labelCalcCanvas = v7026.createElement("canvas");
    v7034 = this.labelCalcCanvasContext = v7033.getContext("2d");
    var v7035 = v7033.style;
    v7035.position = "absolute";
    v7035.left = "-9999px";
    v7035.top = "-9999px";
    v7035.zIndex = "-1";
    v7035.visibility = "hidden";
    v7035.pointerEvents = "none";
  }
  v7034.font = `${v7028} ${v7031} ${v7029}px ${v7030}`;
  var v7036 = 0;
  var v7037 = 0;
  var v7038 = v7023.split("\n");
  var v7039 = v7038.length;
  var v7040 = 0;
  var v7041 = 0;
  for (var v7042 = 0; v7042 < v7039; v7042++) {
    var v7043 = v7038[v7042];
    var v7044 = v7034.measureText(v7043);
    var v7045 = Math.ceil(v7044.width);
    var v7046 = v7029;
    if (v7032 === "glyph") {
      if (v7042 === 0) {
        v7041 = v7044.actualBoundingBoxAscent;
      }
      if (v7042 === v7039 - 1) {
        v7040 = v7044.actualBoundingBoxDescent;
      }
    }
    v7036 = Math.max(v7045, v7036);
    v7037 += v7046;
  }
  if (v7032 === "glyph") {
    v7037 -= v7029 - v7041 - v7040;
  }
  v7036 += v7027;
  v7037 += v7027;
  return {
    width: v7036,
    height: v7037,
    labelActualAscent: v7041,
    labelActualDescent: v7040
  };
};
BRp$9.calculateLabelAngle = function (v7047, v7048) {
  var v7049 = v7047._private;
  var v7050 = v7049.rscratch;
  var v7051 = v7047.isEdge();
  var v7052 = v7048 ? v7048 + "-" : "";
  var v7053 = v7047.pstyle(v7052 + "text-rotation");
  var v7054 = v7053.strValue;
  if (v7054 === "none") {
    return 0;
  } else if (v7051 && v7054 === "autorotate") {
    return v7050.labelAutoAngle;
  } else if (v7054 === "autorotate") {
    return 0;
  } else {
    return v7053.pfValue;
  }
};
BRp$9.calculateLabelAngles = function (v7055) {
  var v7056 = this;
  var v7057 = v7055.isEdge();
  var v7058 = v7055._private;
  var v7059 = v7058.rscratch;
  v7059.labelAngle = v7056.calculateLabelAngle(v7055);
  if (v7057) {
    v7059.sourceLabelAngle = v7056.calculateLabelAngle(v7055, "source");
    v7059.targetLabelAngle = v7056.calculateLabelAngle(v7055, "target");
  }
};
var BRp$8 = {};
var TOO_SMALL_CUT_RECT = 28;
var warnedCutRect = false;
BRp$8.getNodeShape = function (v7060) {
  var v7061 = this;
  var v7062 = v7060.pstyle("shape").value;
  if (v7062 === "cutrectangle" && (v7060.width() < TOO_SMALL_CUT_RECT || v7060.height() < TOO_SMALL_CUT_RECT)) {
    if (!warnedCutRect) {
      warn("The `cutrectangle` node shape can not be used at small sizes so `rectangle` is used instead");
      warnedCutRect = true;
    }
    return "rectangle";
  }
  if (v7060.isParent()) {
    if (v7062 === "rectangle" || v7062 === "roundrectangle" || v7062 === "round-rectangle" || v7062 === "cutrectangle" || v7062 === "cut-rectangle" || v7062 === "barrel") {
      return v7062;
    } else {
      return "rectangle";
    }
  }
  if (v7062 === "polygon") {
    var v7063 = v7060.pstyle("shape-polygon-points").value;
    return v7061.nodeShapes.makePolygon(v7063).name;
  }
  return v7062;
};
var BRp$7 = {};
BRp$7.registerCalculationListeners = function () {
  var v7064 = this.cy;
  var v7065 = v7064.collection();
  var v7066 = this;
  var v7067 = function v7068(v7069, v7070 = true) {
    v7065.merge(v7069);
    if (v7070) {
      for (var v7071 = 0; v7071 < v7069.length; v7071++) {
        var v7072 = v7069[v7071];
        var v7073 = v7072._private;
        var v7074 = v7073.rstyle;
        v7074.clean = false;
        v7074.cleanConnected = false;
      }
    }
  };
  v7066.binder(v7064).on("bounds.* dirty.*", function v7075(v7076) {
    var v7077 = v7076.target;
    v7067(v7077);
  }).on("style.* background.*", function v7078(v7079) {
    var v7080 = v7079.target;
    v7067(v7080, false);
  });
  var v7081 = function v7082(v7083) {
    if (v7083) {
      var v7084 = v7066.onUpdateEleCalcsFns;
      v7065.cleanStyle();
      for (var v7085 = 0; v7085 < v7065.length; v7085++) {
        var v7086 = v7065[v7085];
        var v7087 = v7086._private.rstyle;
        if (v7086.isNode() && !v7087.cleanConnected) {
          v7067(v7086.connectedEdges());
          v7087.cleanConnected = true;
        }
      }
      if (v7084) {
        for (var v7088 = 0; v7088 < v7084.length; v7088++) {
          var v7089 = v7084[v7088];
          v7089(v7083, v7065);
        }
      }
      v7066.recalculateRenderedStyle(v7065);
      v7065 = v7064.collection();
    }
  };
  v7066.flushRenderedStyleQueue = function () {
    v7081(true);
  };
  v7066.beforeRender(v7081, v7066.beforeRenderPriorities.eleCalcs);
};
BRp$7.onUpdateEleCalcs = function (v7090) {
  var v7091 = this.onUpdateEleCalcsFns = this.onUpdateEleCalcsFns || [];
  v7091.push(v7090);
};
BRp$7.recalculateRenderedStyle = function (v7092, v7093) {
  var v7094 = function v7095(v7096) {
    return v7096._private.rstyle.cleanConnected;
  };
  if (v7092.length === 0) {
    return;
  }
  var v7097 = [];
  var v7098 = [];
  if (this.destroyed) {
    return;
  }
  if (v7093 === undefined) {
    v7093 = true;
  }
  for (var v7099 = 0; v7099 < v7092.length; v7099++) {
    var v7100 = v7092[v7099];
    var v7101 = v7100._private;
    var v7102 = v7101.rstyle;
    if (v7100.isEdge() && (!v7094(v7100.source()) || !v7094(v7100.target()))) {
      v7102.clean = false;
    }
    if (v7100.isEdge() && v7100.isBundledBezier()) {
      if (v7100.parallelEdges().some(function (v7103) {
        return !v7103._private.rstyle.clean && v7103.isBundledBezier();
      })) {
        v7102.clean = false;
      }
    }
    if (v7093 && v7102.clean || v7100.removed()) {
      continue;
    }
    if (v7100.pstyle("display").value === "none") {
      continue;
    }
    if (v7101.group === "nodes") {
      v7098.push(v7100);
    } else {
      v7097.push(v7100);
    }
    v7102.clean = true;
  }
  for (var v7104 = 0; v7104 < v7098.length; v7104++) {
    var v7105 = v7098[v7104];
    var v7106 = v7105._private;
    var v7107 = v7106.rstyle;
    var v7108 = v7105.position();
    this.recalculateNodeLabelProjection(v7105);
    v7107.nodeX = v7108.x;
    v7107.nodeY = v7108.y;
    v7107.nodeW = v7105.pstyle("width").pfValue;
    v7107.nodeH = v7105.pstyle("height").pfValue;
  }
  this.recalculateEdgeProjections(v7097);
  for (var v7109 = 0; v7109 < v7097.length; v7109++) {
    var v7110 = v7097[v7109];
    var v7111 = v7110._private;
    var v7112 = v7111.rstyle;
    var v7113 = v7111.rscratch;
    v7112.srcX = v7113.arrowStartX;
    v7112.srcY = v7113.arrowStartY;
    v7112.tgtX = v7113.arrowEndX;
    v7112.tgtY = v7113.arrowEndY;
    v7112.midX = v7113.midX;
    v7112.midY = v7113.midY;
    v7112.labelAngle = v7113.labelAngle;
    v7112.sourceLabelAngle = v7113.sourceLabelAngle;
    v7112.targetLabelAngle = v7113.targetLabelAngle;
  }
};
var BRp$6 = {};
BRp$6.updateCachedGrabbedEles = function () {
  var v7114 = this.cachedZSortedEles;
  if (!v7114) {
    return;
  }
  v7114.drag = [];
  v7114.nondrag = [];
  var v7115 = [];
  for (var v7116 = 0; v7116 < v7114.length; v7116++) {
    var v7117 = v7114[v7116];
    var v7118 = v7117._private.rscratch;
    if (v7117.grabbed() && !v7117.isParent()) {
      v7115.push(v7117);
    } else if (v7118.inDragLayer) {
      v7114.drag.push(v7117);
    } else {
      v7114.nondrag.push(v7117);
    }
  }
  for (var v7116 = 0; v7116 < v7115.length; v7116++) {
    var v7117 = v7115[v7116];
    v7114.drag.push(v7117);
  }
};
BRp$6.invalidateCachedZSortedEles = function () {
  this.cachedZSortedEles = null;
};
BRp$6.getCachedZSortedEles = function (v7119) {
  if (v7119 || !this.cachedZSortedEles) {
    var v7120 = this.cy.mutableElements().toArray();
    v7120.sort(zIndexSort);
    v7120.interactive = v7120.filter(function (v7121) {
      return v7121.interactive();
    });
    this.cachedZSortedEles = v7120;
    this.updateCachedGrabbedEles();
  } else {
    v7120 = this.cachedZSortedEles;
  }
  return v7120;
};
var BRp$5 = {};
[BRp$e, BRp$d, BRp$c, BRp$b, BRp$a, BRp$9, BRp$8, BRp$7, BRp$6].forEach(function (v7122) {
  extend(BRp$5, v7122);
});
var BRp$4 = {};
BRp$4.getCachedImage = function (v7123, v7124, v7125) {
  var v7126 = this;
  var v7127 = v7126.imageCache = v7126.imageCache || {};
  var v7128 = v7127[v7123];
  if (v7128) {
    if (!v7128.image.complete) {
      v7128.image.addEventListener("load", v7125);
    }
    return v7128.image;
  } else {
    v7128 = v7127[v7123] = v7127[v7123] || {};
    var v7129 = v7128.image = new Image();
    v7129.addEventListener("load", v7125);
    v7129.addEventListener("error", function () {
      v7129.error = true;
    });
    var v7130 = "data:";
    var v7131 = v7123.substring(0, v7130.length).toLowerCase() === v7130;
    if (!v7131) {
      v7124 = v7124 === "null" ? null : v7124;
      v7129.crossOrigin = v7124;
    }
    v7129.src = v7123;
    return v7129;
  }
};
var setGrabState = function setGrabState2(v7132, v7133) {
  var v7134 = v7132[0];
  if (!v7134 || v7134._private.grabbed === v7133) {
    return;
  }
  v7134._private.grabbed = v7133;
  v7132.updateStyle(false);
};
var setGrabbed = function setGrabbed2(v7135) {
  setGrabState(v7135, true);
};
var setFreed = function setFreed2(v7136) {
  setGrabState(v7136, false);
};
var BRp$3 = {};
BRp$3.registerBinding = function (v7137, v7138, v7139, v7140) {
  var v7141 = Array.prototype.slice.apply(arguments, [1]);
  if (Array.isArray(v7137)) {
    var v7142 = [];
    for (var v7143 = 0; v7143 < v7137.length; v7143++) {
      var v7144 = v7137[v7143];
      if (v7144 !== undefined) {
        var v7145 = this.binder(v7144);
        v7142.push(v7145.on.apply(v7145, v7141));
      }
    }
    return v7142;
  }
  var v7145 = this.binder(v7137);
  return v7145.on.apply(v7145, v7141);
};
BRp$3.binder = function (v7146) {
  var v7147 = this;
  var v7148 = v7147.cy.window();
  var v7149 = v7146 === v7148 || v7146 === v7148.document || v7146 === v7148.document.body || domElement(v7146);
  if (v7147.supportsPassiveEvents == null) {
    var v7150 = false;
    try {
      var v7151 = Object.defineProperty({}, "passive", {
        get: function v7152() {
          v7150 = true;
          return true;
        }
      });
      v7148.addEventListener("test", null, v7151);
    } catch (v7153) {}
    v7147.supportsPassiveEvents = v7150;
  }
  var v7154 = function v7155(v7156, v7157, v7158) {
    var v7159 = Array.prototype.slice.call(arguments);
    if (v7149 && v7147.supportsPassiveEvents) {
      v7159[2] = {
        capture: v7158 ?? false,
        passive: false,
        once: false
      };
    }
    v7147.bindings.push({
      target: v7146,
      args: v7159
    });
    (v7146.addEventListener || v7146.on).apply(v7146, v7159);
    return this;
  };
  return {
    on: v7154,
    addEventListener: v7154,
    addListener: v7154,
    bind: v7154
  };
};
BRp$3.nodeIsDraggable = function (v7160) {
  return v7160 && v7160.isNode() && !v7160.locked() && v7160.grabbable();
};
BRp$3.nodeIsGrabbable = function (v7161) {
  return this.nodeIsDraggable(v7161) && v7161.interactive();
};
BRp$3.load = function () {
  var v7162 = this;
  var v7163 = v7162.cy.window();
  var v7164 = function v7165(v7166) {
    return v7166.selected();
  };
  var v7167 = function v7168(v7169) {
    var v7170 = v7169.getRootNode();
    if (v7170 && v7170.nodeType === 11 && v7170.host !== undefined) {
      return v7170;
    }
  };
  var v7171 = function v7172(v7173, v7174, v7175, v7176) {
    if (v7173 == null) {
      v7173 = v7162.cy;
    }
    for (var v7177 = 0; v7177 < v7174.length; v7177++) {
      var v7178 = v7174[v7177];
      v7173.emit({
        originalEvent: v7175,
        type: v7178,
        position: v7176
      });
    }
  };
  var v7179 = function v7180(v7181) {
    return v7181.shiftKey || v7181.metaKey || v7181.ctrlKey;
  };
  var v7182 = function v7183(v7184, v7185) {
    var v7186 = true;
    if (v7162.cy.hasCompoundNodes() && v7184 && v7184.pannable()) {
      for (var v7187 = 0; v7185 && v7187 < v7185.length; v7187++) {
        var v7184 = v7185[v7187];
        if (v7184.isNode() && v7184.isParent() && !v7184.pannable()) {
          v7186 = false;
          break;
        }
      }
    } else {
      v7186 = true;
    }
    return v7186;
  };
  var v7188 = function v7189(v7190) {
    v7190[0]._private.rscratch.inDragLayer = true;
  };
  var v7191 = function v7192(v7193) {
    v7193[0]._private.rscratch.inDragLayer = false;
  };
  var v7194 = function v7195(v7196) {
    v7196[0]._private.rscratch.isGrabTarget = true;
  };
  var v7197 = function v7198(v7199) {
    v7199[0]._private.rscratch.isGrabTarget = false;
  };
  var v7200 = function v7201(v7202, v7203) {
    var v7204 = v7203.addToList;
    var v7205 = v7204.has(v7202);
    if (!v7205 && v7202.grabbable() && !v7202.locked()) {
      v7204.merge(v7202);
      setGrabbed(v7202);
    }
  };
  var v7206 = function v7207(v7208, v7209) {
    if (!v7208.cy().hasCompoundNodes()) {
      return;
    }
    if (v7209.inDragLayer == null && v7209.addToList == null) {
      return;
    }
    var v7210 = v7208.descendants();
    if (v7209.inDragLayer) {
      v7210.forEach(v7188);
      v7210.connectedEdges().forEach(v7188);
    }
    if (v7209.addToList) {
      v7200(v7210, v7209);
    }
  };
  var v7211 = function v7212(v7213, v7214) {
    v7214 = v7214 || {};
    var v7215 = v7213.cy().hasCompoundNodes();
    if (v7214.inDragLayer) {
      v7213.forEach(v7188);
      v7213.neighborhood().stdFilter(function (v7216) {
        return !v7215 || v7216.isEdge();
      }).forEach(v7188);
    }
    if (v7214.addToList) {
      v7213.forEach(function (v7217) {
        v7200(v7217, v7214);
      });
    }
    v7206(v7213, v7214);
    v7218(v7213, {
      inDragLayer: v7214.inDragLayer
    });
    v7162.updateCachedGrabbedEles();
  };
  var v7219 = v7211;
  var v7220 = function v7221(v7222) {
    if (!v7222) {
      return;
    }
    v7162.getCachedZSortedEles().forEach(function (v7223) {
      setFreed(v7223);
      v7191(v7223);
      v7197(v7223);
    });
    v7162.updateCachedGrabbedEles();
  };
  var v7218 = function v7224(v7225, v7226) {
    if (v7226.inDragLayer == null && v7226.addToList == null) {
      return;
    }
    if (!v7225.cy().hasCompoundNodes()) {
      return;
    }
    var v7227 = v7225.ancestors().orphans();
    if (v7227.same(v7225)) {
      return;
    }
    var v7228 = v7227.descendants().spawnSelf().merge(v7227).unmerge(v7225).unmerge(v7225.descendants());
    var v7229 = v7228.connectedEdges();
    if (v7226.inDragLayer) {
      v7229.forEach(v7188);
      v7228.forEach(v7188);
    }
    if (v7226.addToList) {
      v7228.forEach(function (v7230) {
        v7200(v7230, v7226);
      });
    }
  };
  var v7231 = function v7232() {
    if (document.activeElement != null && document.activeElement.blur != null) {
      document.activeElement.blur();
    }
  };
  var v7233 = typeof MutationObserver !== "undefined";
  var v7234 = typeof ResizeObserver !== "undefined";
  if (v7233) {
    v7162.removeObserver = new MutationObserver(function (v7235) {
      for (var v7236 = 0; v7236 < v7235.length; v7236++) {
        var v7237 = v7235[v7236];
        var v7238 = v7237.removedNodes;
        if (v7238) {
          for (var v7239 = 0; v7239 < v7238.length; v7239++) {
            var v7240 = v7238[v7239];
            if (v7240 === v7162.container) {
              v7162.destroy();
              break;
            }
          }
        }
      }
    });
    if (v7162.container.parentNode) {
      v7162.removeObserver.observe(v7162.container.parentNode, {
        childList: true
      });
    }
  } else {
    v7162.registerBinding(v7162.container, "DOMNodeRemoved", function (v7241) {
      v7162.destroy();
    });
  }
  var v7242 = debounce(function () {
    v7162.cy.resize();
  }, 100);
  if (v7233) {
    v7162.styleObserver = new MutationObserver(v7242);
    v7162.styleObserver.observe(v7162.container, {
      attributes: true
    });
  }
  v7162.registerBinding(v7163, "resize", v7242);
  if (v7234) {
    v7162.resizeObserver = new ResizeObserver(v7242);
    v7162.resizeObserver.observe(v7162.container);
  }
  var v7243 = function v7244(v7245, v7246) {
    while (v7245 != null) {
      v7246(v7245);
      v7245 = v7245.parentNode;
    }
  };
  var v7247 = function v7248() {
    v7162.invalidateContainerClientCoordsCache();
  };
  v7243(v7162.container, function (v7249) {
    v7162.registerBinding(v7249, "transitionend", v7247);
    v7162.registerBinding(v7249, "animationend", v7247);
    v7162.registerBinding(v7249, "scroll", v7247);
  });
  v7162.registerBinding(v7162.container, "contextmenu", function (v7250) {
    v7250.preventDefault();
  });
  var v7251 = function v7252() {
    return v7162.selection[4] !== 0;
  };
  var v7253 = function v7254(v7255) {
    var v7256 = v7162.findContainerClientCoords();
    var v7257 = v7256[0];
    var v7258 = v7256[1];
    var v7259 = v7256[2];
    var v7260 = v7256[3];
    var v7261 = v7255.touches ? v7255.touches : [v7255];
    var v7262 = false;
    for (var v7263 = 0; v7263 < v7261.length; v7263++) {
      var v7264 = v7261[v7263];
      if (v7257 <= v7264.clientX && v7264.clientX <= v7257 + v7259 && v7258 <= v7264.clientY && v7264.clientY <= v7258 + v7260) {
        v7262 = true;
        break;
      }
    }
    if (!v7262) {
      return false;
    }
    var v7265 = v7162.container;
    var v7266 = v7255.target;
    var v7267 = v7266.parentNode;
    var v7268 = false;
    while (v7267) {
      if (v7267 === v7265) {
        v7268 = true;
        break;
      }
      v7267 = v7267.parentNode;
    }
    if (!v7268) {
      return false;
    }
    return true;
  };
  v7162.registerBinding(v7162.container, "mousedown", function v7269(v7270) {
    if (!v7253(v7270)) {
      return;
    }
    if (v7162.hoverData.which === 1 && v7270.which !== 1) {
      return;
    }
    v7270.preventDefault();
    v7231();
    v7162.hoverData.capture = true;
    v7162.hoverData.which = v7270.which;
    var v7271 = v7162.cy;
    var v7272 = [v7270.clientX, v7270.clientY];
    var v7273 = v7162.projectIntoViewport(v7272[0], v7272[1]);
    var v7274 = v7162.selection;
    var v7275 = v7162.findNearestElements(v7273[0], v7273[1], true, false);
    var v7276 = v7275[0];
    var v7277 = v7162.dragData.possibleDragElements;
    v7162.hoverData.mdownPos = v7273;
    v7162.hoverData.mdownGPos = v7272;
    var v7278 = function v7279(v7280) {
      return {
        originalEvent: v7270,
        type: v7280,
        position: {
          x: v7273[0],
          y: v7273[1]
        }
      };
    };
    var v7281 = function v7282() {
      v7162.hoverData.tapholdCancelled = false;
      clearTimeout(v7162.hoverData.tapholdTimeout);
      v7162.hoverData.tapholdTimeout = setTimeout(function () {
        if (v7162.hoverData.tapholdCancelled) {
          return;
        } else {
          var v7283 = v7162.hoverData.down;
          if (v7283) {
            v7283.emit(v7278("taphold"));
          } else {
            v7271.emit(v7278("taphold"));
          }
        }
      }, v7162.tapholdDuration);
    };
    if (v7270.which == 3) {
      v7162.hoverData.cxtStarted = true;
      var v7284 = {
        originalEvent: v7270,
        type: "cxttapstart",
        position: {
          x: v7273[0],
          y: v7273[1]
        }
      };
      if (v7276) {
        v7276.activate();
        v7276.emit(v7284);
        v7162.hoverData.down = v7276;
      } else {
        v7271.emit(v7284);
      }
      v7162.hoverData.downTime = new Date().getTime();
      v7162.hoverData.cxtDragged = false;
    } else if (v7270.which == 1) {
      if (v7276) {
        v7276.activate();
      }
      {
        if (v7276 != null) {
          if (v7162.nodeIsGrabbable(v7276)) {
            var v7285 = function v7286(v7287) {
              v7287.emit(v7278("grab"));
            };
            v7194(v7276);
            if (!v7276.selected()) {
              v7277 = v7162.dragData.possibleDragElements = v7271.collection();
              v7219(v7276, {
                addToList: v7277
              });
              v7276.emit(v7278("grabon")).emit(v7278("grab"));
            } else {
              v7277 = v7162.dragData.possibleDragElements = v7271.collection();
              var v7288 = v7271.$(function (v7289) {
                return v7289.isNode() && v7289.selected() && v7162.nodeIsGrabbable(v7289);
              });
              v7211(v7288, {
                addToList: v7277
              });
              v7276.emit(v7278("grabon"));
              v7288.forEach(v7285);
            }
            v7162.redrawHint("eles", true);
            v7162.redrawHint("drag", true);
          }
        }
        v7162.hoverData.down = v7276;
        v7162.hoverData.downs = v7275;
        v7162.hoverData.downTime = new Date().getTime();
      }
      v7171(v7276, ["mousedown", "tapstart", "vmousedown"], v7270, {
        x: v7273[0],
        y: v7273[1]
      });
      if (v7276 == null) {
        v7274[4] = 1;
        v7162.data.bgActivePosistion = {
          x: v7273[0],
          y: v7273[1]
        };
        v7162.redrawHint("select", true);
        v7162.redraw();
      } else if (v7276.pannable()) {
        v7274[4] = 1;
      }
      v7281();
    }
    v7274[0] = v7274[2] = v7273[0];
    v7274[1] = v7274[3] = v7273[1];
  }, false);
  var v7290 = v7167(v7162.container);
  v7162.registerBinding([v7163, v7290], "mousemove", function v7291(v7292) {
    var v7293 = v7162.hoverData.capture;
    if (!v7293 && !v7253(v7292)) {
      return;
    }
    var v7294 = false;
    var v7295 = v7162.cy;
    var v7296 = v7295.zoom();
    var v7297 = [v7292.clientX, v7292.clientY];
    var v7298 = v7162.projectIntoViewport(v7297[0], v7297[1]);
    var v7299 = v7162.hoverData.mdownPos;
    var v7300 = v7162.hoverData.mdownGPos;
    var v7301 = v7162.selection;
    var v7302 = null;
    if (!v7162.hoverData.draggingEles && !v7162.hoverData.dragging && !v7162.hoverData.selecting) {
      v7302 = v7162.findNearestElement(v7298[0], v7298[1], true, false);
    }
    var v7303 = v7162.hoverData.last;
    var v7304 = v7162.hoverData.down;
    var v7305 = [v7298[0] - v7301[2], v7298[1] - v7301[3]];
    var v7306 = v7162.dragData.possibleDragElements;
    var v7307;
    if (v7300) {
      var v7308 = v7297[0] - v7300[0];
      var v7309 = v7308 * v7308;
      var v7310 = v7297[1] - v7300[1];
      var v7311 = v7310 * v7310;
      var v7312 = v7309 + v7311;
      v7162.hoverData.isOverThresholdDrag = v7307 = v7312 >= v7162.desktopTapThreshold2;
    }
    var v7313 = v7179(v7292);
    if (v7307) {
      v7162.hoverData.tapholdCancelled = true;
    }
    var v7314 = function v7315() {
      var v7316 = v7162.hoverData.dragDelta = v7162.hoverData.dragDelta || [];
      if (v7316.length === 0) {
        v7316.push(v7305[0]);
        v7316.push(v7305[1]);
      } else {
        v7316[0] += v7305[0];
        v7316[1] += v7305[1];
      }
    };
    v7294 = true;
    v7171(v7302, ["mousemove", "vmousemove", "tapdrag"], v7292, {
      x: v7298[0],
      y: v7298[1]
    });
    var v7317 = function v7318(v7319) {
      return {
        originalEvent: v7292,
        type: v7319,
        position: {
          x: v7298[0],
          y: v7298[1]
        }
      };
    };
    var v7320 = function v7321() {
      v7162.data.bgActivePosistion = undefined;
      if (!v7162.hoverData.selecting) {
        v7295.emit(v7317("boxstart"));
      }
      v7301[4] = 1;
      v7162.hoverData.selecting = true;
      v7162.redrawHint("select", true);
      v7162.redraw();
    };
    if (v7162.hoverData.which === 3) {
      if (v7307) {
        var v7322 = v7317("cxtdrag");
        if (v7304) {
          v7304.emit(v7322);
        } else {
          v7295.emit(v7322);
        }
        v7162.hoverData.cxtDragged = true;
        if (!v7162.hoverData.cxtOver || v7302 !== v7162.hoverData.cxtOver) {
          if (v7162.hoverData.cxtOver) {
            v7162.hoverData.cxtOver.emit(v7317("cxtdragout"));
          }
          v7162.hoverData.cxtOver = v7302;
          if (v7302) {
            v7302.emit(v7317("cxtdragover"));
          }
        }
      }
    } else if (v7162.hoverData.dragging) {
      v7294 = true;
      if (v7295.panningEnabled() && v7295.userPanningEnabled()) {
        var v7323;
        if (v7162.hoverData.justStartedPan) {
          var v7324 = v7162.hoverData.mdownPos;
          v7323 = {
            x: (v7298[0] - v7324[0]) * v7296,
            y: (v7298[1] - v7324[1]) * v7296
          };
          v7162.hoverData.justStartedPan = false;
        } else {
          v7323 = {
            x: v7305[0] * v7296,
            y: v7305[1] * v7296
          };
        }
        v7295.panBy(v7323);
        v7295.emit(v7317("dragpan"));
        v7162.hoverData.dragged = true;
      }
      v7298 = v7162.projectIntoViewport(v7292.clientX, v7292.clientY);
    } else if (v7301[4] == 1 && (v7304 == null || v7304.pannable())) {
      if (v7307) {
        if (!v7162.hoverData.dragging && v7295.boxSelectionEnabled() && (v7313 || !v7295.panningEnabled() || !v7295.userPanningEnabled())) {
          v7320();
        } else if (!v7162.hoverData.selecting && v7295.panningEnabled() && v7295.userPanningEnabled()) {
          var v7325 = v7182(v7304, v7162.hoverData.downs);
          if (v7325) {
            v7162.hoverData.dragging = true;
            v7162.hoverData.justStartedPan = true;
            v7301[4] = 0;
            v7162.data.bgActivePosistion = array2point(v7299);
            v7162.redrawHint("select", true);
            v7162.redraw();
          }
        }
        if (v7304 && v7304.pannable() && v7304.active()) {
          v7304.unactivate();
        }
      }
    } else {
      if (v7304 && v7304.pannable() && v7304.active()) {
        v7304.unactivate();
      }
      if ((!v7304 || !v7304.grabbed()) && v7302 != v7303) {
        if (v7303) {
          v7171(v7303, ["mouseout", "tapdragout"], v7292, {
            x: v7298[0],
            y: v7298[1]
          });
        }
        if (v7302) {
          v7171(v7302, ["mouseover", "tapdragover"], v7292, {
            x: v7298[0],
            y: v7298[1]
          });
        }
        v7162.hoverData.last = v7302;
      }
      if (v7304) {
        if (v7307) {
          if (v7295.boxSelectionEnabled() && v7313) {
            if (v7304 && v7304.grabbed()) {
              v7220(v7306);
              v7304.emit(v7317("freeon"));
              v7306.emit(v7317("free"));
              if (v7162.dragData.didDrag) {
                v7304.emit(v7317("dragfreeon"));
                v7306.emit(v7317("dragfree"));
              }
            }
            v7320();
          } else if (v7304 && v7304.grabbed() && v7162.nodeIsDraggable(v7304)) {
            var v7326 = !v7162.dragData.didDrag;
            if (v7326) {
              v7162.redrawHint("eles", true);
            }
            v7162.dragData.didDrag = true;
            if (!v7162.hoverData.draggingEles) {
              v7211(v7306, {
                inDragLayer: true
              });
            }
            var v7327 = {
              x: 0,
              y: 0
            };
            if (number$1(v7305[0]) && number$1(v7305[1])) {
              v7327.x += v7305[0];
              v7327.y += v7305[1];
              if (v7326) {
                var v7328 = v7162.hoverData.dragDelta;
                if (v7328 && number$1(v7328[0]) && number$1(v7328[1])) {
                  v7327.x += v7328[0];
                  v7327.y += v7328[1];
                }
              }
            }
            v7162.hoverData.draggingEles = true;
            v7306.silentShift(v7327).emit(v7317("position")).emit(v7317("drag"));
            v7162.redrawHint("drag", true);
            v7162.redraw();
          }
        } else {
          v7314();
        }
      }
      v7294 = true;
    }
    v7301[2] = v7298[0];
    v7301[3] = v7298[1];
    if (v7294) {
      if (v7292.stopPropagation) {
        v7292.stopPropagation();
      }
      if (v7292.preventDefault) {
        v7292.preventDefault();
      }
      return false;
    }
  }, false);
  var v7329;
  var v7330;
  var v7331;
  v7162.registerBinding(v7163, "mouseup", function v7332(v7333) {
    if (v7162.hoverData.which === 1 && v7333.which !== 1 && v7162.hoverData.capture) {
      return;
    }
    var v7334 = v7162.hoverData.capture;
    if (!v7334) {
      return;
    }
    v7162.hoverData.capture = false;
    var v7335 = v7162.cy;
    var v7336 = v7162.projectIntoViewport(v7333.clientX, v7333.clientY);
    var v7337 = v7162.selection;
    var v7338 = v7162.findNearestElement(v7336[0], v7336[1], true, false);
    var v7339 = v7162.dragData.possibleDragElements;
    var v7340 = v7162.hoverData.down;
    var v7341 = v7179(v7333);
    if (v7162.data.bgActivePosistion) {
      v7162.redrawHint("select", true);
      v7162.redraw();
    }
    v7162.hoverData.tapholdCancelled = true;
    v7162.data.bgActivePosistion = undefined;
    if (v7340) {
      v7340.unactivate();
    }
    var v7342 = function v7343(v7344) {
      return {
        originalEvent: v7333,
        type: v7344,
        position: {
          x: v7336[0],
          y: v7336[1]
        }
      };
    };
    if (v7162.hoverData.which === 3) {
      var v7345 = v7342("cxttapend");
      if (v7340) {
        v7340.emit(v7345);
      } else {
        v7335.emit(v7345);
      }
      if (!v7162.hoverData.cxtDragged) {
        var v7346 = v7342("cxttap");
        if (v7340) {
          v7340.emit(v7346);
        } else {
          v7335.emit(v7346);
        }
      }
      v7162.hoverData.cxtDragged = false;
      v7162.hoverData.which = null;
    } else if (v7162.hoverData.which === 1) {
      v7171(v7338, ["mouseup", "tapend", "vmouseup"], v7333, {
        x: v7336[0],
        y: v7336[1]
      });
      if (!v7162.dragData.didDrag && !v7162.hoverData.dragged && !v7162.hoverData.selecting && !v7162.hoverData.isOverThresholdDrag) {
        v7171(v7340, ["click", "tap", "vclick"], v7333, {
          x: v7336[0],
          y: v7336[1]
        });
        v7330 = false;
        if (v7333.timeStamp - v7331 <= v7335.multiClickDebounceTime()) {
          if (v7329) {
            clearTimeout(v7329);
          }
          v7330 = true;
          v7331 = null;
          v7171(v7340, ["dblclick", "dbltap", "vdblclick"], v7333, {
            x: v7336[0],
            y: v7336[1]
          });
        } else {
          v7329 = setTimeout(function () {
            if (v7330) {
              return;
            }
            v7171(v7340, ["oneclick", "onetap", "voneclick"], v7333, {
              x: v7336[0],
              y: v7336[1]
            });
          }, v7335.multiClickDebounceTime());
          v7331 = v7333.timeStamp;
        }
      }
      if (v7340 == null && !v7162.dragData.didDrag && !v7162.hoverData.selecting && !v7162.hoverData.dragged && !v7179(v7333)) {
        v7335.$(v7164).unselect(["tapunselect"]);
        if (v7339.length > 0) {
          v7162.redrawHint("eles", true);
        }
        v7162.dragData.possibleDragElements = v7339 = v7335.collection();
      }
      if (v7338 == v7340 && !v7162.dragData.didDrag && !v7162.hoverData.selecting) {
        if (v7338 != null && v7338._private.selectable) {
          if (v7162.hoverData.dragging) ;else if (v7335.selectionType() === "additive" || v7341) {
            if (v7338.selected()) {
              v7338.unselect(["tapunselect"]);
            } else {
              v7338.select(["tapselect"]);
            }
          } else if (!v7341) {
            v7335.$(v7164).unmerge(v7338).unselect(["tapunselect"]);
            v7338.select(["tapselect"]);
          }
          v7162.redrawHint("eles", true);
        }
      }
      if (v7162.hoverData.selecting) {
        var v7347 = v7335.collection(v7162.getAllInBox(v7337[0], v7337[1], v7337[2], v7337[3]));
        v7162.redrawHint("select", true);
        if (v7347.length > 0) {
          v7162.redrawHint("eles", true);
        }
        v7335.emit(v7342("boxend"));
        var v7348 = function v7349(v7350) {
          return v7350.selectable() && !v7350.selected();
        };
        if (v7335.selectionType() === "additive") {
          v7347.emit(v7342("box")).stdFilter(v7348).select().emit(v7342("boxselect"));
        } else {
          if (!v7341) {
            v7335.$(v7164).unmerge(v7347).unselect();
          }
          v7347.emit(v7342("box")).stdFilter(v7348).select().emit(v7342("boxselect"));
        }
        v7162.redraw();
      }
      if (v7162.hoverData.dragging) {
        v7162.hoverData.dragging = false;
        v7162.redrawHint("select", true);
        v7162.redrawHint("eles", true);
        v7162.redraw();
      }
      if (!v7337[4]) {
        v7162.redrawHint("drag", true);
        v7162.redrawHint("eles", true);
        var v7351 = v7340 && v7340.grabbed();
        v7220(v7339);
        if (v7351) {
          v7340.emit(v7342("freeon"));
          v7339.emit(v7342("free"));
          if (v7162.dragData.didDrag) {
            v7340.emit(v7342("dragfreeon"));
            v7339.emit(v7342("dragfree"));
          }
        }
      }
    }
    v7337[4] = 0;
    v7162.hoverData.down = null;
    v7162.hoverData.cxtStarted = false;
    v7162.hoverData.draggingEles = false;
    v7162.hoverData.selecting = false;
    v7162.hoverData.isOverThresholdDrag = false;
    v7162.dragData.didDrag = false;
    v7162.hoverData.dragged = false;
    v7162.hoverData.dragDelta = [];
    v7162.hoverData.mdownPos = null;
    v7162.hoverData.mdownGPos = null;
    v7162.hoverData.which = null;
  }, false);
  var v7352 = [];
  var v7353 = 4;
  var v7354;
  var v7355 = 100000;
  var v7356 = function v7357(v7358, v7359) {
    for (var v7360 = 0; v7360 < v7358.length; v7360++) {
      if (v7358[v7360] % v7359 !== 0) {
        return false;
      }
    }
    return true;
  };
  var v7361 = function v7362(v7363) {
    var v7364 = Math.abs(v7363[0]);
    for (var v7365 = 1; v7365 < v7363.length; v7365++) {
      if (Math.abs(v7363[v7365]) !== v7364) {
        return false;
      }
    }
    return true;
  };
  var v7366 = function v7367(v7368) {
    var v7369 = false;
    var v7370 = v7368.deltaY;
    if (v7370 == null) {
      if (v7368.wheelDeltaY != null) {
        v7370 = v7368.wheelDeltaY / 4;
      } else if (v7368.wheelDelta != null) {
        v7370 = v7368.wheelDelta / 4;
      }
    }
    if (v7370 === 0) {
      return;
    }
    if (v7354 == null) {
      if (v7352.length >= v7353) {
        var v7371 = v7352;
        v7354 = v7356(v7371, 5);
        if (!v7354) {
          var v7372 = Math.abs(v7371[0]);
          v7354 = v7361(v7371) && v7372 > 5;
        }
        if (v7354) {
          for (var v7373 = 0; v7373 < v7371.length; v7373++) {
            v7355 = Math.min(Math.abs(v7371[v7373]), v7355);
          }
        }
      } else {
        v7352.push(v7370);
        v7369 = true;
      }
    } else if (v7354) {
      v7355 = Math.min(Math.abs(v7370), v7355);
    }
    if (v7162.scrollingPage) {
      return;
    }
    var v7374 = v7162.cy;
    var v7375 = v7374.zoom();
    var v7376 = v7374.pan();
    var v7377 = v7162.projectIntoViewport(v7368.clientX, v7368.clientY);
    var v7378 = [v7377[0] * v7375 + v7376.x, v7377[1] * v7375 + v7376.y];
    if (v7162.hoverData.draggingEles || v7162.hoverData.dragging || v7162.hoverData.cxtStarted || v7251()) {
      v7368.preventDefault();
      return;
    }
    if (v7374.panningEnabled() && v7374.userPanningEnabled() && v7374.zoomingEnabled() && v7374.userZoomingEnabled()) {
      v7368.preventDefault();
      v7162.data.wheelZooming = true;
      clearTimeout(v7162.data.wheelTimeout);
      v7162.data.wheelTimeout = setTimeout(function () {
        v7162.data.wheelZooming = false;
        v7162.redrawHint("eles", true);
        v7162.redraw();
      }, 150);
      var v7379;
      if (v7369 && Math.abs(v7370) > 5) {
        v7370 = signum(v7370) * 5;
      }
      v7379 = v7370 / -250;
      if (v7354) {
        v7379 /= v7355;
        v7379 *= 3;
      }
      v7379 = v7379 * v7162.wheelSensitivity;
      var v7380 = v7368.deltaMode === 1;
      if (v7380) {
        v7379 *= 33;
      }
      var v7381 = v7374.zoom() * Math.pow(10, v7379);
      if (v7368.type === "gesturechange") {
        v7381 = v7162.gestureStartZoom * v7368.scale;
      }
      v7374.zoom({
        level: v7381,
        renderedPosition: {
          x: v7378[0],
          y: v7378[1]
        }
      });
      v7374.emit({
        type: v7368.type === "gesturechange" ? "pinchzoom" : "scrollzoom",
        originalEvent: v7368,
        position: {
          x: v7377[0],
          y: v7377[1]
        }
      });
    }
  };
  v7162.registerBinding(v7162.container, "wheel", v7366, true);
  v7162.registerBinding(v7163, "scroll", function v7382(v7383) {
    v7162.scrollingPage = true;
    clearTimeout(v7162.scrollingPageTimeout);
    v7162.scrollingPageTimeout = setTimeout(function () {
      v7162.scrollingPage = false;
    }, 250);
  }, true);
  v7162.registerBinding(v7162.container, "gesturestart", function v7384(v7385) {
    v7162.gestureStartZoom = v7162.cy.zoom();
    if (!v7162.hasTouchStarted) {
      v7385.preventDefault();
    }
  }, true);
  v7162.registerBinding(v7162.container, "gesturechange", function (v7386) {
    if (!v7162.hasTouchStarted) {
      v7366(v7386);
    }
  }, true);
  v7162.registerBinding(v7162.container, "mouseout", function v7387(v7388) {
    var v7389 = v7162.projectIntoViewport(v7388.clientX, v7388.clientY);
    v7162.cy.emit({
      originalEvent: v7388,
      type: "mouseout",
      position: {
        x: v7389[0],
        y: v7389[1]
      }
    });
  }, false);
  v7162.registerBinding(v7162.container, "mouseover", function v7390(v7391) {
    var v7392 = v7162.projectIntoViewport(v7391.clientX, v7391.clientY);
    v7162.cy.emit({
      originalEvent: v7391,
      type: "mouseover",
      position: {
        x: v7392[0],
        y: v7392[1]
      }
    });
  }, false);
  var v7393;
  var v7394;
  var v7395;
  var v7396;
  var v7397;
  var v7398;
  var v7399;
  var v7400;
  var v7401;
  var v7402;
  var v7403;
  var v7404;
  var v7405;
  var v7406 = function v7407(v7408, v7409, v7410, v7411) {
    return Math.sqrt((v7410 - v7408) * (v7410 - v7408) + (v7411 - v7409) * (v7411 - v7409));
  };
  var v7412 = function v7413(v7414, v7415, v7416, v7417) {
    return (v7416 - v7414) * (v7416 - v7414) + (v7417 - v7415) * (v7417 - v7415);
  };
  var v7418;
  v7162.registerBinding(v7162.container, "touchstart", v7418 = function v7419(v7420) {
    v7162.hasTouchStarted = true;
    if (!v7253(v7420)) {
      return;
    }
    v7231();
    v7162.touchData.capture = true;
    v7162.data.bgActivePosistion = undefined;
    var v7421 = v7162.cy;
    var v7422 = v7162.touchData.now;
    var v7423 = v7162.touchData.earlier;
    if (v7420.touches[0]) {
      var v7424 = v7162.projectIntoViewport(v7420.touches[0].clientX, v7420.touches[0].clientY);
      v7422[0] = v7424[0];
      v7422[1] = v7424[1];
    }
    if (v7420.touches[1]) {
      var v7424 = v7162.projectIntoViewport(v7420.touches[1].clientX, v7420.touches[1].clientY);
      v7422[2] = v7424[0];
      v7422[3] = v7424[1];
    }
    if (v7420.touches[2]) {
      var v7424 = v7162.projectIntoViewport(v7420.touches[2].clientX, v7420.touches[2].clientY);
      v7422[4] = v7424[0];
      v7422[5] = v7424[1];
    }
    var v7425 = function v7426(v7427) {
      return {
        originalEvent: v7420,
        type: v7427,
        position: {
          x: v7422[0],
          y: v7422[1]
        }
      };
    };
    if (v7420.touches[1]) {
      v7162.touchData.singleTouchMoved = true;
      v7220(v7162.dragData.touchDragEles);
      var v7428 = v7162.findContainerClientCoords();
      v7401 = v7428[0];
      v7402 = v7428[1];
      v7403 = v7428[2];
      v7404 = v7428[3];
      v7393 = v7420.touches[0].clientX - v7401;
      v7394 = v7420.touches[0].clientY - v7402;
      v7395 = v7420.touches[1].clientX - v7401;
      v7396 = v7420.touches[1].clientY - v7402;
      v7405 = v7393 >= 0 && v7393 <= v7403 && v7395 >= 0 && v7395 <= v7403 && v7394 >= 0 && v7394 <= v7404 && v7396 >= 0 && v7396 <= v7404;
      var v7429 = v7421.pan();
      var v7430 = v7421.zoom();
      v7397 = v7406(v7393, v7394, v7395, v7396);
      v7398 = v7412(v7393, v7394, v7395, v7396);
      v7399 = [(v7393 + v7395) / 2, (v7394 + v7396) / 2];
      v7400 = [(v7399[0] - v7429.x) / v7430, (v7399[1] - v7429.y) / v7430];
      var v7431 = 200;
      var v7432 = v7431 * v7431;
      if (v7398 < v7432 && !v7420.touches[2]) {
        var v7433 = v7162.findNearestElement(v7422[0], v7422[1], true, true);
        var v7434 = v7162.findNearestElement(v7422[2], v7422[3], true, true);
        if (v7433 && v7433.isNode()) {
          v7433.activate().emit(v7425("cxttapstart"));
          v7162.touchData.start = v7433;
        } else if (v7434 && v7434.isNode()) {
          v7434.activate().emit(v7425("cxttapstart"));
          v7162.touchData.start = v7434;
        } else {
          v7421.emit(v7425("cxttapstart"));
        }
        if (v7162.touchData.start) {
          v7162.touchData.start._private.grabbed = false;
        }
        v7162.touchData.cxt = true;
        v7162.touchData.cxtDragged = false;
        v7162.data.bgActivePosistion = undefined;
        v7162.redraw();
        return;
      }
    }
    if (v7420.touches[2]) {
      if (v7421.boxSelectionEnabled()) {
        v7420.preventDefault();
      }
    } else if (v7420.touches[1]) ;else if (v7420.touches[0]) {
      var v7435 = v7162.findNearestElements(v7422[0], v7422[1], true, true);
      var v7436 = v7435[0];
      if (v7436 != null) {
        v7436.activate();
        v7162.touchData.start = v7436;
        v7162.touchData.starts = v7435;
        if (v7162.nodeIsGrabbable(v7436)) {
          var v7437 = v7162.dragData.touchDragEles = v7421.collection();
          var v7438 = null;
          v7162.redrawHint("eles", true);
          v7162.redrawHint("drag", true);
          if (v7436.selected()) {
            v7438 = v7421.$(function (v7439) {
              return v7439.selected() && v7162.nodeIsGrabbable(v7439);
            });
            v7211(v7438, {
              addToList: v7437
            });
          } else {
            v7219(v7436, {
              addToList: v7437
            });
          }
          v7194(v7436);
          v7436.emit(v7425("grabon"));
          if (v7438) {
            v7438.forEach(function (v7440) {
              v7440.emit(v7425("grab"));
            });
          } else {
            v7436.emit(v7425("grab"));
          }
        }
      }
      v7171(v7436, ["touchstart", "tapstart", "vmousedown"], v7420, {
        x: v7422[0],
        y: v7422[1]
      });
      if (v7436 == null) {
        v7162.data.bgActivePosistion = {
          x: v7424[0],
          y: v7424[1]
        };
        v7162.redrawHint("select", true);
        v7162.redraw();
      }
      v7162.touchData.singleTouchMoved = false;
      v7162.touchData.singleTouchStartTime = +new Date();
      clearTimeout(v7162.touchData.tapholdTimeout);
      v7162.touchData.tapholdTimeout = setTimeout(function () {
        if (v7162.touchData.singleTouchMoved === false && !v7162.pinching && !v7162.touchData.selecting) {
          v7171(v7162.touchData.start, ["taphold"], v7420, {
            x: v7422[0],
            y: v7422[1]
          });
        }
      }, v7162.tapholdDuration);
    }
    if (v7420.touches.length >= 1) {
      var v7441 = v7162.touchData.startPosition = [null, null, null, null, null, null];
      for (var v7442 = 0; v7442 < v7422.length; v7442++) {
        v7441[v7442] = v7423[v7442] = v7422[v7442];
      }
      var v7443 = v7420.touches[0];
      v7162.touchData.startGPosition = [v7443.clientX, v7443.clientY];
    }
  }, false);
  var v7444;
  v7162.registerBinding(v7163, "touchmove", v7444 = function v7445(v7446) {
    var v7447 = v7162.touchData.capture;
    if (!v7447 && !v7253(v7446)) {
      return;
    }
    var v7448 = v7162.selection;
    var v7449 = v7162.cy;
    var v7450 = v7162.touchData.now;
    var v7451 = v7162.touchData.earlier;
    var v7452 = v7449.zoom();
    if (v7446.touches[0]) {
      var v7453 = v7162.projectIntoViewport(v7446.touches[0].clientX, v7446.touches[0].clientY);
      v7450[0] = v7453[0];
      v7450[1] = v7453[1];
    }
    if (v7446.touches[1]) {
      var v7453 = v7162.projectIntoViewport(v7446.touches[1].clientX, v7446.touches[1].clientY);
      v7450[2] = v7453[0];
      v7450[3] = v7453[1];
    }
    if (v7446.touches[2]) {
      var v7453 = v7162.projectIntoViewport(v7446.touches[2].clientX, v7446.touches[2].clientY);
      v7450[4] = v7453[0];
      v7450[5] = v7453[1];
    }
    var v7454 = function v7455(v7456) {
      return {
        originalEvent: v7446,
        type: v7456,
        position: {
          x: v7450[0],
          y: v7450[1]
        }
      };
    };
    var v7457 = v7162.touchData.startGPosition;
    var v7458;
    if (v7447 && v7446.touches[0] && v7457) {
      var v7459 = [];
      for (var v7460 = 0; v7460 < v7450.length; v7460++) {
        v7459[v7460] = v7450[v7460] - v7451[v7460];
      }
      var v7461 = v7446.touches[0].clientX - v7457[0];
      var v7462 = v7461 * v7461;
      var v7463 = v7446.touches[0].clientY - v7457[1];
      var v7464 = v7463 * v7463;
      var v7465 = v7462 + v7464;
      v7458 = v7465 >= v7162.touchTapThreshold2;
    }
    if (v7447 && v7162.touchData.cxt) {
      v7446.preventDefault();
      var v7466 = v7446.touches[0].clientX - v7401;
      var v7467 = v7446.touches[0].clientY - v7402;
      var v7468 = v7446.touches[1].clientX - v7401;
      var v7469 = v7446.touches[1].clientY - v7402;
      var v7470 = v7412(v7466, v7467, v7468, v7469);
      var v7471 = v7470 / v7398;
      var v7472 = 150;
      var v7473 = v7472 * v7472;
      var v7474 = 1.5;
      var v7475 = v7474 * v7474;
      if (v7471 >= v7475 || v7470 >= v7473) {
        v7162.touchData.cxt = false;
        v7162.data.bgActivePosistion = undefined;
        v7162.redrawHint("select", true);
        var v7476 = v7454("cxttapend");
        if (v7162.touchData.start) {
          v7162.touchData.start.unactivate().emit(v7476);
          v7162.touchData.start = null;
        } else {
          v7449.emit(v7476);
        }
      }
    }
    if (v7447 && v7162.touchData.cxt) {
      var v7476 = v7454("cxtdrag");
      v7162.data.bgActivePosistion = undefined;
      v7162.redrawHint("select", true);
      if (v7162.touchData.start) {
        v7162.touchData.start.emit(v7476);
      } else {
        v7449.emit(v7476);
      }
      if (v7162.touchData.start) {
        v7162.touchData.start._private.grabbed = false;
      }
      v7162.touchData.cxtDragged = true;
      var v7477 = v7162.findNearestElement(v7450[0], v7450[1], true, true);
      if (!v7162.touchData.cxtOver || v7477 !== v7162.touchData.cxtOver) {
        if (v7162.touchData.cxtOver) {
          v7162.touchData.cxtOver.emit(v7454("cxtdragout"));
        }
        v7162.touchData.cxtOver = v7477;
        if (v7477) {
          v7477.emit(v7454("cxtdragover"));
        }
      }
    } else if (v7447 && v7446.touches[2] && v7449.boxSelectionEnabled()) {
      v7446.preventDefault();
      v7162.data.bgActivePosistion = undefined;
      this.lastThreeTouch = +new Date();
      if (!v7162.touchData.selecting) {
        v7449.emit(v7454("boxstart"));
      }
      v7162.touchData.selecting = true;
      v7162.touchData.didSelect = true;
      v7448[4] = 1;
      if (!v7448 || v7448.length === 0 || v7448[0] === undefined) {
        v7448[0] = (v7450[0] + v7450[2] + v7450[4]) / 3;
        v7448[1] = (v7450[1] + v7450[3] + v7450[5]) / 3;
        v7448[2] = (v7450[0] + v7450[2] + v7450[4]) / 3 + 1;
        v7448[3] = (v7450[1] + v7450[3] + v7450[5]) / 3 + 1;
      } else {
        v7448[2] = (v7450[0] + v7450[2] + v7450[4]) / 3;
        v7448[3] = (v7450[1] + v7450[3] + v7450[5]) / 3;
      }
      v7162.redrawHint("select", true);
      v7162.redraw();
    } else if (v7447 && v7446.touches[1] && !v7162.touchData.didSelect && v7449.zoomingEnabled() && v7449.panningEnabled() && v7449.userZoomingEnabled() && v7449.userPanningEnabled()) {
      v7446.preventDefault();
      v7162.data.bgActivePosistion = undefined;
      v7162.redrawHint("select", true);
      var v7478 = v7162.dragData.touchDragEles;
      if (v7478) {
        v7162.redrawHint("drag", true);
        for (var v7479 = 0; v7479 < v7478.length; v7479++) {
          var v7480 = v7478[v7479]._private;
          v7480.grabbed = false;
          v7480.rscratch.inDragLayer = false;
        }
      }
      var v7481 = v7162.touchData.start;
      var v7466 = v7446.touches[0].clientX - v7401;
      var v7467 = v7446.touches[0].clientY - v7402;
      var v7468 = v7446.touches[1].clientX - v7401;
      var v7469 = v7446.touches[1].clientY - v7402;
      var v7482 = v7406(v7466, v7467, v7468, v7469);
      var v7483 = v7482 / v7397;
      if (v7405) {
        var v7484 = v7466 - v7393;
        var v7485 = v7467 - v7394;
        var v7486 = v7468 - v7395;
        var v7487 = v7469 - v7396;
        var v7488 = (v7484 + v7486) / 2;
        var v7489 = (v7485 + v7487) / 2;
        var v7490 = v7449.zoom();
        var v7491 = v7490 * v7483;
        var v7492 = v7449.pan();
        var v7493 = v7400[0] * v7490 + v7492.x;
        var v7494 = v7400[1] * v7490 + v7492.y;
        var v7495 = {
          x: -v7491 / v7490 * (v7493 - v7492.x - v7488) + v7493,
          y: -v7491 / v7490 * (v7494 - v7492.y - v7489) + v7494
        };
        if (v7481 && v7481.active()) {
          var v7478 = v7162.dragData.touchDragEles;
          v7220(v7478);
          v7162.redrawHint("drag", true);
          v7162.redrawHint("eles", true);
          v7481.unactivate().emit(v7454("freeon"));
          v7478.emit(v7454("free"));
          if (v7162.dragData.didDrag) {
            v7481.emit(v7454("dragfreeon"));
            v7478.emit(v7454("dragfree"));
          }
        }
        v7449.viewport({
          zoom: v7491,
          pan: v7495,
          cancelOnFailedZoom: true
        });
        v7449.emit(v7454("pinchzoom"));
        v7397 = v7482;
        v7393 = v7466;
        v7394 = v7467;
        v7395 = v7468;
        v7396 = v7469;
        v7162.pinching = true;
      }
      if (v7446.touches[0]) {
        var v7453 = v7162.projectIntoViewport(v7446.touches[0].clientX, v7446.touches[0].clientY);
        v7450[0] = v7453[0];
        v7450[1] = v7453[1];
      }
      if (v7446.touches[1]) {
        var v7453 = v7162.projectIntoViewport(v7446.touches[1].clientX, v7446.touches[1].clientY);
        v7450[2] = v7453[0];
        v7450[3] = v7453[1];
      }
      if (v7446.touches[2]) {
        var v7453 = v7162.projectIntoViewport(v7446.touches[2].clientX, v7446.touches[2].clientY);
        v7450[4] = v7453[0];
        v7450[5] = v7453[1];
      }
    } else if (v7446.touches[0] && !v7162.touchData.didSelect) {
      var v7496 = v7162.touchData.start;
      var v7497 = v7162.touchData.last;
      var v7477;
      if (!v7162.hoverData.draggingEles && !v7162.swipePanning) {
        v7477 = v7162.findNearestElement(v7450[0], v7450[1], true, true);
      }
      if (v7447 && v7496 != null) {
        v7446.preventDefault();
      }
      if (v7447 && v7496 != null && v7162.nodeIsDraggable(v7496)) {
        if (v7458) {
          var v7478 = v7162.dragData.touchDragEles;
          var v7498 = !v7162.dragData.didDrag;
          if (v7498) {
            v7211(v7478, {
              inDragLayer: true
            });
          }
          v7162.dragData.didDrag = true;
          var v7499 = {
            x: 0,
            y: 0
          };
          if (number$1(v7459[0]) && number$1(v7459[1])) {
            v7499.x += v7459[0];
            v7499.y += v7459[1];
            if (v7498) {
              v7162.redrawHint("eles", true);
              var v7500 = v7162.touchData.dragDelta;
              if (v7500 && number$1(v7500[0]) && number$1(v7500[1])) {
                v7499.x += v7500[0];
                v7499.y += v7500[1];
              }
            }
          }
          v7162.hoverData.draggingEles = true;
          v7478.silentShift(v7499).emit(v7454("position")).emit(v7454("drag"));
          v7162.redrawHint("drag", true);
          if (v7162.touchData.startPosition[0] == v7451[0] && v7162.touchData.startPosition[1] == v7451[1]) {
            v7162.redrawHint("eles", true);
          }
          v7162.redraw();
        } else {
          var v7500 = v7162.touchData.dragDelta = v7162.touchData.dragDelta || [];
          if (v7500.length === 0) {
            v7500.push(v7459[0]);
            v7500.push(v7459[1]);
          } else {
            v7500[0] += v7459[0];
            v7500[1] += v7459[1];
          }
        }
      }
      {
        v7171(v7496 || v7477, ["touchmove", "tapdrag", "vmousemove"], v7446, {
          x: v7450[0],
          y: v7450[1]
        });
        if ((!v7496 || !v7496.grabbed()) && v7477 != v7497) {
          if (v7497) {
            v7497.emit(v7454("tapdragout"));
          }
          if (v7477) {
            v7477.emit(v7454("tapdragover"));
          }
        }
        v7162.touchData.last = v7477;
      }
      if (v7447) {
        for (var v7479 = 0; v7479 < v7450.length; v7479++) {
          if (v7450[v7479] && v7162.touchData.startPosition[v7479] && v7458) {
            v7162.touchData.singleTouchMoved = true;
          }
        }
      }
      if (v7447 && (v7496 == null || v7496.pannable()) && v7449.panningEnabled() && v7449.userPanningEnabled()) {
        var v7501 = v7182(v7496, v7162.touchData.starts);
        if (v7501) {
          v7446.preventDefault();
          if (!v7162.data.bgActivePosistion) {
            v7162.data.bgActivePosistion = array2point(v7162.touchData.startPosition);
          }
          if (v7162.swipePanning) {
            v7449.panBy({
              x: v7459[0] * v7452,
              y: v7459[1] * v7452
            });
            v7449.emit(v7454("dragpan"));
          } else if (v7458) {
            v7162.swipePanning = true;
            v7449.panBy({
              x: v7461 * v7452,
              y: v7463 * v7452
            });
            v7449.emit(v7454("dragpan"));
            if (v7496) {
              v7496.unactivate();
              v7162.redrawHint("select", true);
              v7162.touchData.start = null;
            }
          }
        }
        var v7453 = v7162.projectIntoViewport(v7446.touches[0].clientX, v7446.touches[0].clientY);
        v7450[0] = v7453[0];
        v7450[1] = v7453[1];
      }
    }
    for (var v7460 = 0; v7460 < v7450.length; v7460++) {
      v7451[v7460] = v7450[v7460];
    }
    if (v7447 && v7446.touches.length > 0 && !v7162.hoverData.draggingEles && !v7162.swipePanning && v7162.data.bgActivePosistion != null) {
      v7162.data.bgActivePosistion = undefined;
      v7162.redrawHint("select", true);
      v7162.redraw();
    }
  }, false);
  var v7502;
  v7162.registerBinding(v7163, "touchcancel", v7502 = function v7503(v7504) {
    var v7505 = v7162.touchData.start;
    v7162.touchData.capture = false;
    if (v7505) {
      v7505.unactivate();
    }
  });
  var v7506;
  var v7507;
  var v7508;
  var v7509;
  v7162.registerBinding(v7163, "touchend", v7506 = function v7510(v7511) {
    var v7512 = v7162.touchData.start;
    var v7513 = v7162.touchData.capture;
    if (v7513) {
      if (v7511.touches.length === 0) {
        v7162.touchData.capture = false;
      }
      v7511.preventDefault();
    } else {
      return;
    }
    var v7514 = v7162.selection;
    v7162.swipePanning = false;
    v7162.hoverData.draggingEles = false;
    var v7515 = v7162.cy;
    var v7516 = v7515.zoom();
    var v7517 = v7162.touchData.now;
    var v7518 = v7162.touchData.earlier;
    if (v7511.touches[0]) {
      var v7519 = v7162.projectIntoViewport(v7511.touches[0].clientX, v7511.touches[0].clientY);
      v7517[0] = v7519[0];
      v7517[1] = v7519[1];
    }
    if (v7511.touches[1]) {
      var v7519 = v7162.projectIntoViewport(v7511.touches[1].clientX, v7511.touches[1].clientY);
      v7517[2] = v7519[0];
      v7517[3] = v7519[1];
    }
    if (v7511.touches[2]) {
      var v7519 = v7162.projectIntoViewport(v7511.touches[2].clientX, v7511.touches[2].clientY);
      v7517[4] = v7519[0];
      v7517[5] = v7519[1];
    }
    var v7520 = function v7521(v7522) {
      return {
        originalEvent: v7511,
        type: v7522,
        position: {
          x: v7517[0],
          y: v7517[1]
        }
      };
    };
    if (v7512) {
      v7512.unactivate();
    }
    var v7523;
    if (v7162.touchData.cxt) {
      v7523 = v7520("cxttapend");
      if (v7512) {
        v7512.emit(v7523);
      } else {
        v7515.emit(v7523);
      }
      if (!v7162.touchData.cxtDragged) {
        var v7524 = v7520("cxttap");
        if (v7512) {
          v7512.emit(v7524);
        } else {
          v7515.emit(v7524);
        }
      }
      if (v7162.touchData.start) {
        v7162.touchData.start._private.grabbed = false;
      }
      v7162.touchData.cxt = false;
      v7162.touchData.start = null;
      v7162.redraw();
      return;
    }
    if (!v7511.touches[2] && v7515.boxSelectionEnabled() && v7162.touchData.selecting) {
      v7162.touchData.selecting = false;
      var v7525 = v7515.collection(v7162.getAllInBox(v7514[0], v7514[1], v7514[2], v7514[3]));
      v7514[0] = undefined;
      v7514[1] = undefined;
      v7514[2] = undefined;
      v7514[3] = undefined;
      v7514[4] = 0;
      v7162.redrawHint("select", true);
      v7515.emit(v7520("boxend"));
      var v7526 = function v7527(v7528) {
        return v7528.selectable() && !v7528.selected();
      };
      v7525.emit(v7520("box")).stdFilter(v7526).select().emit(v7520("boxselect"));
      if (v7525.nonempty()) {
        v7162.redrawHint("eles", true);
      }
      v7162.redraw();
    }
    if (v7512 != null) {
      v7512.unactivate();
    }
    if (v7511.touches[2]) {
      v7162.data.bgActivePosistion = undefined;
      v7162.redrawHint("select", true);
    } else if (v7511.touches[1]) ;else if (v7511.touches[0]) ;else if (!v7511.touches[0]) {
      v7162.data.bgActivePosistion = undefined;
      v7162.redrawHint("select", true);
      var v7529 = v7162.dragData.touchDragEles;
      if (v7512 != null) {
        var v7530 = v7512._private.grabbed;
        v7220(v7529);
        v7162.redrawHint("drag", true);
        v7162.redrawHint("eles", true);
        if (v7530) {
          v7512.emit(v7520("freeon"));
          v7529.emit(v7520("free"));
          if (v7162.dragData.didDrag) {
            v7512.emit(v7520("dragfreeon"));
            v7529.emit(v7520("dragfree"));
          }
        }
        v7171(v7512, ["touchend", "tapend", "vmouseup", "tapdragout"], v7511, {
          x: v7517[0],
          y: v7517[1]
        });
        v7512.unactivate();
        v7162.touchData.start = null;
      } else {
        var v7531 = v7162.findNearestElement(v7517[0], v7517[1], true, true);
        v7171(v7531, ["touchend", "tapend", "vmouseup", "tapdragout"], v7511, {
          x: v7517[0],
          y: v7517[1]
        });
      }
      var v7532 = v7162.touchData.startPosition[0] - v7517[0];
      var v7533 = v7532 * v7532;
      var v7534 = v7162.touchData.startPosition[1] - v7517[1];
      var v7535 = v7534 * v7534;
      var v7536 = v7533 + v7535;
      var v7537 = v7536 * v7516 * v7516;
      if (!v7162.touchData.singleTouchMoved) {
        if (!v7512) {
          v7515.$(":selected").unselect(["tapunselect"]);
        }
        v7171(v7512, ["tap", "vclick"], v7511, {
          x: v7517[0],
          y: v7517[1]
        });
        v7507 = false;
        if (v7511.timeStamp - v7509 <= v7515.multiClickDebounceTime()) {
          if (v7508) {
            clearTimeout(v7508);
          }
          v7507 = true;
          v7509 = null;
          v7171(v7512, ["dbltap", "vdblclick"], v7511, {
            x: v7517[0],
            y: v7517[1]
          });
        } else {
          v7508 = setTimeout(function () {
            if (v7507) {
              return;
            }
            v7171(v7512, ["onetap", "voneclick"], v7511, {
              x: v7517[0],
              y: v7517[1]
            });
          }, v7515.multiClickDebounceTime());
          v7509 = v7511.timeStamp;
        }
      }
      if (v7512 != null && !v7162.dragData.didDrag && v7512._private.selectable && v7537 < v7162.touchTapThreshold2 && !v7162.pinching) {
        if (v7515.selectionType() === "single") {
          v7515.$(v7164).unmerge(v7512).unselect(["tapunselect"]);
          v7512.select(["tapselect"]);
        } else if (v7512.selected()) {
          v7512.unselect(["tapunselect"]);
        } else {
          v7512.select(["tapselect"]);
        }
        v7162.redrawHint("eles", true);
      }
      v7162.touchData.singleTouchMoved = true;
    }
    for (var v7538 = 0; v7538 < v7517.length; v7538++) {
      v7518[v7538] = v7517[v7538];
    }
    v7162.dragData.didDrag = false;
    if (v7511.touches.length === 0) {
      v7162.touchData.dragDelta = [];
      v7162.touchData.startPosition = [null, null, null, null, null, null];
      v7162.touchData.startGPosition = null;
      v7162.touchData.didSelect = false;
    }
    if (v7511.touches.length < 2) {
      if (v7511.touches.length === 1) {
        v7162.touchData.startGPosition = [v7511.touches[0].clientX, v7511.touches[0].clientY];
      }
      v7162.pinching = false;
      v7162.redrawHint("eles", true);
      v7162.redraw();
    }
  }, false);
  if (typeof TouchEvent === "undefined") {
    var v7539 = [];
    var v7540 = function v7541(v7542) {
      return {
        clientX: v7542.clientX,
        clientY: v7542.clientY,
        force: 1,
        identifier: v7542.pointerId,
        pageX: v7542.pageX,
        pageY: v7542.pageY,
        radiusX: v7542.width / 2,
        radiusY: v7542.height / 2,
        screenX: v7542.screenX,
        screenY: v7542.screenY,
        target: v7542.target
      };
    };
    var v7543 = function v7544(v7545) {
      return {
        event: v7545,
        touch: v7540(v7545)
      };
    };
    var v7546 = function v7547(v7548) {
      v7539.push(v7543(v7548));
    };
    var v7549 = function v7550(v7551) {
      for (var v7552 = 0; v7552 < v7539.length; v7552++) {
        var v7553 = v7539[v7552];
        if (v7553.event.pointerId === v7551.pointerId) {
          v7539.splice(v7552, 1);
          return;
        }
      }
    };
    var v7554 = function v7555(v7556) {
      var v7557 = v7539.filter(function (v7558) {
        return v7558.event.pointerId === v7556.pointerId;
      })[0];
      v7557.event = v7556;
      v7557.touch = v7540(v7556);
    };
    var v7559 = function v7560(v7561) {
      v7561.touches = v7539.map(function (v7562) {
        return v7562.touch;
      });
    };
    var v7563 = function v7564(v7565) {
      return v7565.pointerType === "mouse" || v7565.pointerType === 4;
    };
    v7162.registerBinding(v7162.container, "pointerdown", function (v7566) {
      if (v7563(v7566)) {
        return;
      }
      v7566.preventDefault();
      v7546(v7566);
      v7559(v7566);
      v7418(v7566);
    });
    v7162.registerBinding(v7162.container, "pointerup", function (v7567) {
      if (v7563(v7567)) {
        return;
      }
      v7549(v7567);
      v7559(v7567);
      v7506(v7567);
    });
    v7162.registerBinding(v7162.container, "pointercancel", function (v7568) {
      if (v7563(v7568)) {
        return;
      }
      v7549(v7568);
      v7559(v7568);
      v7502(v7568);
    });
    v7162.registerBinding(v7162.container, "pointermove", function (v7569) {
      if (v7563(v7569)) {
        return;
      }
      v7569.preventDefault();
      v7554(v7569);
      v7559(v7569);
      v7444(v7569);
    });
  }
};
var BRp$2 = {};
BRp$2.generatePolygon = function (v7570, v7571) {
  return this.nodeShapes[v7570] = {
    renderer: this,
    name: v7570,
    points: v7571,
    draw: function v7572(v7573, v7574, v7575, v7576, v7577, v7578) {
      this.renderer.nodeShapeImpl("polygon", v7573, v7574, v7575, v7576, v7577, this.points);
    },
    intersectLine: function v7579(v7580, v7581, v7582, v7583, v7584, v7585, v7586, v7587) {
      return polygonIntersectLine(v7584, v7585, this.points, v7580, v7581, v7582 / 2, v7583 / 2, v7586);
    },
    checkPoint: function v7588(v7589, v7590, v7591, v7592, v7593, v7594, v7595, v7596) {
      return pointInsidePolygon(v7589, v7590, this.points, v7594, v7595, v7592, v7593, [0, -1], v7591);
    },
    hasMiterBounds: v7570 !== "rectangle",
    miterBounds: function v7597(v7598, v7599, v7600, v7601, v7602, v7603) {
      return miterBox(this.points, v7598, v7599, v7600, v7601, v7602);
    }
  };
};
BRp$2.generateEllipse = function () {
  return this.nodeShapes.ellipse = {
    renderer: this,
    name: "ellipse",
    draw: function v7604(v7605, v7606, v7607, v7608, v7609, v7610) {
      this.renderer.nodeShapeImpl(this.name, v7605, v7606, v7607, v7608, v7609);
    },
    intersectLine: function v7611(v7612, v7613, v7614, v7615, v7616, v7617, v7618, v7619) {
      return intersectLineEllipse(v7616, v7617, v7612, v7613, v7614 / 2 + v7618, v7615 / 2 + v7618);
    },
    checkPoint: function v7620(v7621, v7622, v7623, v7624, v7625, v7626, v7627, v7628) {
      return checkInEllipse(v7621, v7622, v7624, v7625, v7626, v7627, v7623);
    }
  };
};
BRp$2.generateRoundPolygon = function (v7629, v7630) {
  return this.nodeShapes[v7629] = {
    renderer: this,
    name: v7629,
    points: v7630,
    getOrCreateCorners: function v7631(v7632, v7633, v7634, v7635, v7636, v7637, v7638) {
      if (v7637[v7638] !== undefined && v7637[v7638 + "-cx"] === v7632 && v7637[v7638 + "-cy"] === v7633) {
        return v7637[v7638];
      }
      v7637[v7638] = new Array(v7630.length / 2);
      v7637[v7638 + "-cx"] = v7632;
      v7637[v7638 + "-cy"] = v7633;
      var v7639 = v7634 / 2;
      var v7640 = v7635 / 2;
      v7636 = v7636 === "auto" ? getRoundPolygonRadius(v7634, v7635) : v7636;
      var v7641 = new Array(v7630.length / 2);
      for (var v7642 = 0; v7642 < v7630.length / 2; v7642++) {
        v7641[v7642] = {
          x: v7632 + v7639 * v7630[v7642 * 2],
          y: v7633 + v7640 * v7630[v7642 * 2 + 1]
        };
      }
      var v7643;
      var v7644;
      var v7645;
      var v7646;
      var v7647 = v7641.length;
      v7644 = v7641[v7647 - 1];
      for (v7643 = 0; v7643 < v7647; v7643++) {
        v7645 = v7641[v7643 % v7647];
        v7646 = v7641[(v7643 + 1) % v7647];
        v7637[v7638][v7643] = getRoundCorner(v7644, v7645, v7646, v7636);
        v7644 = v7645;
        v7645 = v7646;
      }
      return v7637[v7638];
    },
    draw: function v7648(v7649, v7650, v7651, v7652, v7653, v7654, v7655) {
      this.renderer.nodeShapeImpl("round-polygon", v7649, v7650, v7651, v7652, v7653, this.points, this.getOrCreateCorners(v7650, v7651, v7652, v7653, v7654, v7655, "drawCorners"));
    },
    intersectLine: function v7656(v7657, v7658, v7659, v7660, v7661, v7662, v7663, v7664, v7665) {
      return roundPolygonIntersectLine(v7661, v7662, this.points, v7657, v7658, v7659, v7660, v7663, this.getOrCreateCorners(v7657, v7658, v7659, v7660, v7664, v7665, "corners"));
    },
    checkPoint: function v7666(v7667, v7668, v7669, v7670, v7671, v7672, v7673, v7674, v7675) {
      return pointInsideRoundPolygon(v7667, v7668, this.points, v7672, v7673, v7670, v7671, this.getOrCreateCorners(v7672, v7673, v7670, v7671, v7674, v7675, "corners"));
    }
  };
};
BRp$2.generateRoundRectangle = function () {
  return this.nodeShapes["round-rectangle"] = this.nodeShapes.roundrectangle = {
    renderer: this,
    name: "round-rectangle",
    points: generateUnitNgonPointsFitToSquare(4, 0),
    draw: function v7676(v7677, v7678, v7679, v7680, v7681, v7682) {
      this.renderer.nodeShapeImpl(this.name, v7677, v7678, v7679, v7680, v7681, this.points, v7682);
    },
    intersectLine: function v7683(v7684, v7685, v7686, v7687, v7688, v7689, v7690, v7691) {
      return roundRectangleIntersectLine(v7688, v7689, v7684, v7685, v7686, v7687, v7690, v7691);
    },
    checkPoint: function v7692(v7693, v7694, v7695, v7696, v7697, v7698, v7699, v7700) {
      var v7701 = v7696 / 2;
      var v7702 = v7697 / 2;
      v7700 = v7700 === "auto" ? getRoundRectangleRadius(v7696, v7697) : v7700;
      v7700 = Math.min(v7701, v7702, v7700);
      var v7703 = v7700 * 2;
      if (pointInsidePolygon(v7693, v7694, this.points, v7698, v7699, v7696, v7697 - v7703, [0, -1], v7695)) {
        return true;
      }
      if (pointInsidePolygon(v7693, v7694, this.points, v7698, v7699, v7696 - v7703, v7697, [0, -1], v7695)) {
        return true;
      }
      if (checkInEllipse(v7693, v7694, v7703, v7703, v7698 - v7701 + v7700, v7699 - v7702 + v7700, v7695)) {
        return true;
      }
      if (checkInEllipse(v7693, v7694, v7703, v7703, v7698 + v7701 - v7700, v7699 - v7702 + v7700, v7695)) {
        return true;
      }
      if (checkInEllipse(v7693, v7694, v7703, v7703, v7698 + v7701 - v7700, v7699 + v7702 - v7700, v7695)) {
        return true;
      }
      if (checkInEllipse(v7693, v7694, v7703, v7703, v7698 - v7701 + v7700, v7699 + v7702 - v7700, v7695)) {
        return true;
      }
      return false;
    }
  };
};
BRp$2.generateCutRectangle = function () {
  return this.nodeShapes["cut-rectangle"] = this.nodeShapes.cutrectangle = {
    renderer: this,
    name: "cut-rectangle",
    cornerLength: getCutRectangleCornerLength(),
    points: generateUnitNgonPointsFitToSquare(4, 0),
    draw: function v7704(v7705, v7706, v7707, v7708, v7709, v7710) {
      this.renderer.nodeShapeImpl(this.name, v7705, v7706, v7707, v7708, v7709, null, v7710);
    },
    generateCutTrianglePts: function v7711(v7712, v7713, v7714, v7715, v7716) {
      var v7717 = v7716 === "auto" ? this.cornerLength : v7716;
      var v7718 = v7713 / 2;
      var v7719 = v7712 / 2;
      var v7720 = v7714 - v7719;
      var v7721 = v7714 + v7719;
      var v7722 = v7715 - v7718;
      var v7723 = v7715 + v7718;
      return {
        topLeft: [v7720, v7722 + v7717, v7720 + v7717, v7722, v7720 + v7717, v7722 + v7717],
        topRight: [v7721 - v7717, v7722, v7721, v7722 + v7717, v7721 - v7717, v7722 + v7717],
        bottomRight: [v7721, v7723 - v7717, v7721 - v7717, v7723, v7721 - v7717, v7723 - v7717],
        bottomLeft: [v7720 + v7717, v7723, v7720, v7723 - v7717, v7720 + v7717, v7723 - v7717]
      };
    },
    intersectLine: function v7724(v7725, v7726, v7727, v7728, v7729, v7730, v7731, v7732) {
      var v7733 = this.generateCutTrianglePts(v7727 + v7731 * 2, v7728 + v7731 * 2, v7725, v7726, v7732);
      var v7734 = [].concat.apply([], [v7733.topLeft.splice(0, 4), v7733.topRight.splice(0, 4), v7733.bottomRight.splice(0, 4), v7733.bottomLeft.splice(0, 4)]);
      return polygonIntersectLine(v7729, v7730, v7734, v7725, v7726);
    },
    checkPoint: function v7735(v7736, v7737, v7738, v7739, v7740, v7741, v7742, v7743) {
      var v7744 = v7743 === "auto" ? this.cornerLength : v7743;
      if (pointInsidePolygon(v7736, v7737, this.points, v7741, v7742, v7739, v7740 - v7744 * 2, [0, -1], v7738)) {
        return true;
      }
      if (pointInsidePolygon(v7736, v7737, this.points, v7741, v7742, v7739 - v7744 * 2, v7740, [0, -1], v7738)) {
        return true;
      }
      var v7745 = this.generateCutTrianglePts(v7739, v7740, v7741, v7742);
      return pointInsidePolygonPoints(v7736, v7737, v7745.topLeft) || pointInsidePolygonPoints(v7736, v7737, v7745.topRight) || pointInsidePolygonPoints(v7736, v7737, v7745.bottomRight) || pointInsidePolygonPoints(v7736, v7737, v7745.bottomLeft);
    }
  };
};
BRp$2.generateBarrel = function () {
  return this.nodeShapes.barrel = {
    renderer: this,
    name: "barrel",
    points: generateUnitNgonPointsFitToSquare(4, 0),
    draw: function v7746(v7747, v7748, v7749, v7750, v7751, v7752) {
      this.renderer.nodeShapeImpl(this.name, v7747, v7748, v7749, v7750, v7751);
    },
    intersectLine: function v7753(v7754, v7755, v7756, v7757, v7758, v7759, v7760, v7761) {
      var v7762 = 0.15;
      var v7763 = 0.5;
      var v7764 = 0.85;
      var v7765 = this.generateBarrelBezierPts(v7756 + v7760 * 2, v7757 + v7760 * 2, v7754, v7755);
      var v7766 = function v7767(v7768) {
        var v7769 = qbezierPtAt({
          x: v7768[0],
          y: v7768[1]
        }, {
          x: v7768[2],
          y: v7768[3]
        }, {
          x: v7768[4],
          y: v7768[5]
        }, v7762);
        var v7770 = qbezierPtAt({
          x: v7768[0],
          y: v7768[1]
        }, {
          x: v7768[2],
          y: v7768[3]
        }, {
          x: v7768[4],
          y: v7768[5]
        }, v7763);
        var v7771 = qbezierPtAt({
          x: v7768[0],
          y: v7768[1]
        }, {
          x: v7768[2],
          y: v7768[3]
        }, {
          x: v7768[4],
          y: v7768[5]
        }, v7764);
        return [v7768[0], v7768[1], v7769.x, v7769.y, v7770.x, v7770.y, v7771.x, v7771.y, v7768[4], v7768[5]];
      };
      var v7772 = [].concat(v7766(v7765.topLeft), v7766(v7765.topRight), v7766(v7765.bottomRight), v7766(v7765.bottomLeft));
      return polygonIntersectLine(v7758, v7759, v7772, v7754, v7755);
    },
    generateBarrelBezierPts: function v7773(v7774, v7775, v7776, v7777) {
      var v7778 = v7775 / 2;
      var v7779 = v7774 / 2;
      var v7780 = v7776 - v7779;
      var v7781 = v7776 + v7779;
      var v7782 = v7777 - v7778;
      var v7783 = v7777 + v7778;
      var v7784 = getBarrelCurveConstants(v7774, v7775);
      var v7785 = v7784.heightOffset;
      var v7786 = v7784.widthOffset;
      var v7787 = v7784.ctrlPtOffsetPct * v7774;
      var v7788 = {
        topLeft: [v7780, v7782 + v7785, v7780 + v7787, v7782, v7780 + v7786, v7782],
        topRight: [v7781 - v7786, v7782, v7781 - v7787, v7782, v7781, v7782 + v7785],
        bottomRight: [v7781, v7783 - v7785, v7781 - v7787, v7783, v7781 - v7786, v7783],
        bottomLeft: [v7780 + v7786, v7783, v7780 + v7787, v7783, v7780, v7783 - v7785]
      };
      v7788.topLeft.isTop = true;
      v7788.topRight.isTop = true;
      v7788.bottomLeft.isBottom = true;
      v7788.bottomRight.isBottom = true;
      return v7788;
    },
    checkPoint: function v7789(v7790, v7791, v7792, v7793, v7794, v7795, v7796, v7797) {
      var v7798 = getBarrelCurveConstants(v7793, v7794);
      var v7799 = v7798.heightOffset;
      var v7800 = v7798.widthOffset;
      if (pointInsidePolygon(v7790, v7791, this.points, v7795, v7796, v7793, v7794 - v7799 * 2, [0, -1], v7792)) {
        return true;
      }
      if (pointInsidePolygon(v7790, v7791, this.points, v7795, v7796, v7793 - v7800 * 2, v7794, [0, -1], v7792)) {
        return true;
      }
      var v7801 = this.generateBarrelBezierPts(v7793, v7794, v7795, v7796);
      var v7802 = function v7803(v7804, v7805, v7806) {
        var v7807 = v7806[4];
        var v7808 = v7806[2];
        var v7809 = v7806[0];
        var v7810 = v7806[5];
        var v7811 = v7806[1];
        var v7812 = Math.min(v7807, v7809);
        var v7813 = Math.max(v7807, v7809);
        var v7814 = Math.min(v7810, v7811);
        var v7815 = Math.max(v7810, v7811);
        if (v7812 <= v7804 && v7804 <= v7813 && v7814 <= v7805 && v7805 <= v7815) {
          var v7816 = bezierPtsToQuadCoeff(v7807, v7808, v7809);
          var v7817 = solveQuadratic(v7816[0], v7816[1], v7816[2], v7804);
          var v7818 = v7817.filter(function (v7819) {
            return v7819 >= 0 && v7819 <= 1;
          });
          if (v7818.length > 0) {
            return v7818[0];
          }
        }
        return null;
      };
      var v7820 = Object.keys(v7801);
      for (var v7821 = 0; v7821 < v7820.length; v7821++) {
        var v7822 = v7820[v7821];
        var v7823 = v7801[v7822];
        var v7824 = v7802(v7790, v7791, v7823);
        if (v7824 == null) {
          continue;
        }
        var v7825 = v7823[5];
        var v7826 = v7823[3];
        var v7827 = v7823[1];
        var v7828 = qbezierAt(v7825, v7826, v7827, v7824);
        if (v7823.isTop && v7828 <= v7791) {
          return true;
        }
        if (v7823.isBottom && v7791 <= v7828) {
          return true;
        }
      }
      return false;
    }
  };
};
BRp$2.generateBottomRoundrectangle = function () {
  return this.nodeShapes["bottom-round-rectangle"] = this.nodeShapes.bottomroundrectangle = {
    renderer: this,
    name: "bottom-round-rectangle",
    points: generateUnitNgonPointsFitToSquare(4, 0),
    draw: function v7829(v7830, v7831, v7832, v7833, v7834, v7835) {
      this.renderer.nodeShapeImpl(this.name, v7830, v7831, v7832, v7833, v7834, this.points, v7835);
    },
    intersectLine: function v7836(v7837, v7838, v7839, v7840, v7841, v7842, v7843, v7844) {
      var v7845 = v7837 - (v7839 / 2 + v7843);
      var v7846 = v7838 - (v7840 / 2 + v7843);
      var v7847 = v7846;
      var v7848 = v7837 + (v7839 / 2 + v7843);
      var v7849 = finiteLinesIntersect(v7841, v7842, v7837, v7838, v7845, v7846, v7848, v7847, false);
      if (v7849.length > 0) {
        return v7849;
      }
      return roundRectangleIntersectLine(v7841, v7842, v7837, v7838, v7839, v7840, v7843, v7844);
    },
    checkPoint: function v7850(v7851, v7852, v7853, v7854, v7855, v7856, v7857, v7858) {
      v7858 = v7858 === "auto" ? getRoundRectangleRadius(v7854, v7855) : v7858;
      var v7859 = v7858 * 2;
      if (pointInsidePolygon(v7851, v7852, this.points, v7856, v7857, v7854, v7855 - v7859, [0, -1], v7853)) {
        return true;
      }
      if (pointInsidePolygon(v7851, v7852, this.points, v7856, v7857, v7854 - v7859, v7855, [0, -1], v7853)) {
        return true;
      }
      var v7860 = v7854 / 2 + v7853 * 2;
      var v7861 = v7855 / 2 + v7853 * 2;
      var v7862 = [v7856 - v7860, v7857 - v7861, v7856 - v7860, v7857, v7856 + v7860, v7857, v7856 + v7860, v7857 - v7861];
      if (pointInsidePolygonPoints(v7851, v7852, v7862)) {
        return true;
      }
      if (checkInEllipse(v7851, v7852, v7859, v7859, v7856 + v7854 / 2 - v7858, v7857 + v7855 / 2 - v7858, v7853)) {
        return true;
      }
      if (checkInEllipse(v7851, v7852, v7859, v7859, v7856 - v7854 / 2 + v7858, v7857 + v7855 / 2 - v7858, v7853)) {
        return true;
      }
      return false;
    }
  };
};
BRp$2.registerNodeShapes = function () {
  var v7863 = this.nodeShapes = {};
  var v7864 = this;
  this.generateEllipse();
  this.generatePolygon("triangle", generateUnitNgonPointsFitToSquare(3, 0));
  this.generateRoundPolygon("round-triangle", generateUnitNgonPointsFitToSquare(3, 0));
  this.generatePolygon("rectangle", generateUnitNgonPointsFitToSquare(4, 0));
  v7863.square = v7863.rectangle;
  this.generateRoundRectangle();
  this.generateCutRectangle();
  this.generateBarrel();
  this.generateBottomRoundrectangle();
  {
    var v7865 = [0, 1, 1, 0, 0, -1, -1, 0];
    this.generatePolygon("diamond", v7865);
    this.generateRoundPolygon("round-diamond", v7865);
  }
  this.generatePolygon("pentagon", generateUnitNgonPointsFitToSquare(5, 0));
  this.generateRoundPolygon("round-pentagon", generateUnitNgonPointsFitToSquare(5, 0));
  this.generatePolygon("hexagon", generateUnitNgonPointsFitToSquare(6, 0));
  this.generateRoundPolygon("round-hexagon", generateUnitNgonPointsFitToSquare(6, 0));
  this.generatePolygon("heptagon", generateUnitNgonPointsFitToSquare(7, 0));
  this.generateRoundPolygon("round-heptagon", generateUnitNgonPointsFitToSquare(7, 0));
  this.generatePolygon("octagon", generateUnitNgonPointsFitToSquare(8, 0));
  this.generateRoundPolygon("round-octagon", generateUnitNgonPointsFitToSquare(8, 0));
  var v7866 = new Array(20);
  {
    var v7867 = generateUnitNgonPoints(5, 0);
    var v7868 = generateUnitNgonPoints(5, Math.PI / 5);
    var v7869 = (3 - Math.sqrt(5)) * 0.5;
    v7869 *= 1.57;
    for (var v7870 = 0; v7870 < v7868.length / 2; v7870++) {
      v7868[v7870 * 2] *= v7869;
      v7868[v7870 * 2 + 1] *= v7869;
    }
    for (var v7870 = 0; v7870 < 5; v7870++) {
      v7866[v7870 * 4] = v7867[v7870 * 2];
      v7866[v7870 * 4 + 1] = v7867[v7870 * 2 + 1];
      v7866[v7870 * 4 + 2] = v7868[v7870 * 2];
      v7866[v7870 * 4 + 3] = v7868[v7870 * 2 + 1];
    }
  }
  v7866 = fitPolygonToSquare(v7866);
  this.generatePolygon("star", v7866);
  this.generatePolygon("vee", [-1, -1, 0, -0.333, 1, -1, 0, 1]);
  this.generatePolygon("rhomboid", [-1, -1, 0.333, -1, 1, 1, -0.333, 1]);
  this.generatePolygon("right-rhomboid", [-0.333, -1, 1, -1, 0.333, 1, -1, 1]);
  this.nodeShapes.concavehexagon = this.generatePolygon("concave-hexagon", [-1, -0.95, -0.75, 0, -1, 0.95, 1, 0.95, 0.75, 0, 1, -0.95]);
  {
    var v7871 = [-1, -1, 0.25, -1, 1, 0, 0.25, 1, -1, 1];
    this.generatePolygon("tag", v7871);
    this.generateRoundPolygon("round-tag", v7871);
  }
  v7863.makePolygon = function (v7872) {
    var v7873 = v7872.join("$");
    var v7874 = "polygon-" + v7873;
    var v7875;
    if (v7875 = this[v7874]) {
      return v7875;
    }
    return v7864.generatePolygon(v7874, v7872);
  };
};
var BRp$1 = {
  timeToRender: function () {
    return this.redrawTotalTime / this.redrawCount;
  }
};
BRp$1.redraw = function (v7876) {
  v7876 = v7876 || staticEmptyObject();
  var v7877 = this;
  if (v7877.averageRedrawTime === undefined) {
    v7877.averageRedrawTime = 0;
  }
  if (v7877.lastRedrawTime === undefined) {
    v7877.lastRedrawTime = 0;
  }
  if (v7877.lastDrawTime === undefined) {
    v7877.lastDrawTime = 0;
  }
  v7877.requestedFrame = true;
  v7877.renderOptions = v7876;
};
BRp$1.beforeRender = function (v7878, v7879) {
  if (this.destroyed) {
    return;
  }
  if (v7879 == null) {
    error("Priority is not optional for beforeRender");
  }
  var v7880 = this.beforeRenderCallbacks;
  v7880.push({
    fn: v7878,
    priority: v7879
  });
  v7880.sort(function (v7881, v7882) {
    return v7882.priority - v7881.priority;
  });
};
var beforeRenderCallbacks = function beforeRenderCallbacks2(v7883, v7884, v7885) {
  var v7886 = v7883.beforeRenderCallbacks;
  for (var v7887 = 0; v7887 < v7886.length; v7887++) {
    v7886[v7887].fn(v7884, v7885);
  }
};
BRp$1.startRenderLoop = function () {
  var v7888 = this;
  var v7889 = v7888.cy;
  if (v7888.renderLoopStarted) {
    return;
  } else {
    v7888.renderLoopStarted = true;
  }
  var v7890 = function v7891(v7892) {
    if (v7888.destroyed) {
      return;
    }
    if (v7889.batching()) ;else if (v7888.requestedFrame && !v7888.skipFrame) {
      beforeRenderCallbacks(v7888, true, v7892);
      var v7893 = performanceNow();
      v7888.render(v7888.renderOptions);
      var v7894 = v7888.lastDrawTime = performanceNow();
      if (v7888.averageRedrawTime === undefined) {
        v7888.averageRedrawTime = v7894 - v7893;
      }
      if (v7888.redrawCount === undefined) {
        v7888.redrawCount = 0;
      }
      v7888.redrawCount++;
      if (v7888.redrawTotalTime === undefined) {
        v7888.redrawTotalTime = 0;
      }
      var v7895 = v7894 - v7893;
      v7888.redrawTotalTime += v7895;
      v7888.lastRedrawTime = v7895;
      v7888.averageRedrawTime = v7888.averageRedrawTime / 2 + v7895 / 2;
      v7888.requestedFrame = false;
    } else {
      beforeRenderCallbacks(v7888, false, v7892);
    }
    v7888.skipFrame = false;
    requestAnimationFrame(v7890);
  };
  requestAnimationFrame(v7890);
};
var BaseRenderer = function BaseRenderer2(v7896) {
  this.init(v7896);
};
var BR = BaseRenderer;
var BRp = BR.prototype;
BRp.clientFunctions = ["redrawHint", "render", "renderTo", "matchCanvasSize", "nodeShapeImpl", "arrowShapeImpl"];
BRp.init = function (v7897) {
  var v7898 = this;
  v7898.options = v7897;
  v7898.cy = v7897.cy;
  var v7899 = v7898.container = v7897.cy.container();
  var v7900 = v7898.cy.window();
  if (v7900) {
    var v7901 = v7900.document;
    var v7902 = v7901.head;
    var v7903 = "__________cytoscape_stylesheet";
    var v7904 = "__________cytoscape_container";
    var v7905 = v7901.getElementById(v7903) != null;
    if (v7899.className.indexOf(v7904) < 0) {
      v7899.className = (v7899.className || "") + " " + v7904;
    }
    if (!v7905) {
      var v7906 = v7901.createElement("style");
      v7906.id = v7903;
      v7906.textContent = "." + v7904 + " { position: relative; }";
      v7902.insertBefore(v7906, v7902.children[0]);
    }
    var v7907 = v7900.getComputedStyle(v7899);
    var v7908 = v7907.getPropertyValue("position");
    if (v7908 === "static") {
      warn("A Cytoscape container has style position:static and so can not use UI extensions properly");
    }
  }
  v7898.selection = [undefined, undefined, undefined, undefined, 0];
  v7898.bezierProjPcts = [0.05, 0.225, 0.4, 0.5, 0.6, 0.775, 0.95];
  v7898.hoverData = {
    down: null,
    last: null,
    downTime: null,
    triggerMode: null,
    dragging: false,
    initialPan: [null, null],
    capture: false
  };
  v7898.dragData = {
    possibleDragElements: []
  };
  v7898.touchData = {
    start: null,
    capture: false,
    startPosition: [null, null, null, null, null, null],
    singleTouchStartTime: null,
    singleTouchMoved: true,
    now: [null, null, null, null, null, null],
    earlier: [null, null, null, null, null, null]
  };
  v7898.redraws = 0;
  v7898.showFps = v7897.showFps;
  v7898.debug = v7897.debug;
  v7898.webgl = v7897.webgl;
  v7898.hideEdgesOnViewport = v7897.hideEdgesOnViewport;
  v7898.textureOnViewport = v7897.textureOnViewport;
  v7898.wheelSensitivity = v7897.wheelSensitivity;
  v7898.motionBlurEnabled = v7897.motionBlur;
  v7898.forcedPixelRatio = number$1(v7897.pixelRatio) ? v7897.pixelRatio : null;
  v7898.motionBlur = v7897.motionBlur;
  v7898.motionBlurOpacity = v7897.motionBlurOpacity;
  v7898.motionBlurTransparency = 1 - v7898.motionBlurOpacity;
  v7898.motionBlurPxRatio = 1;
  v7898.mbPxRBlurry = 1;
  v7898.minMbLowQualFrames = 4;
  v7898.fullQualityMb = false;
  v7898.clearedForMotionBlur = [];
  v7898.desktopTapThreshold = v7897.desktopTapThreshold;
  v7898.desktopTapThreshold2 = v7897.desktopTapThreshold * v7897.desktopTapThreshold;
  v7898.touchTapThreshold = v7897.touchTapThreshold;
  v7898.touchTapThreshold2 = v7897.touchTapThreshold * v7897.touchTapThreshold;
  v7898.tapholdDuration = 500;
  v7898.bindings = [];
  v7898.beforeRenderCallbacks = [];
  v7898.beforeRenderPriorities = {
    animations: 400,
    eleCalcs: 300,
    eleTxrDeq: 200,
    lyrTxrDeq: 150,
    lyrTxrSkip: 100
  };
  v7898.registerNodeShapes();
  v7898.registerArrowShapes();
  v7898.registerCalculationListeners();
};
BRp.notify = function (v7909, v7910) {
  var v7911 = this;
  var v7912 = v7911.cy;
  if (this.destroyed) {
    return;
  }
  if (v7909 === "init") {
    v7911.load();
    return;
  }
  if (v7909 === "destroy") {
    v7911.destroy();
    return;
  }
  if (v7909 === "add" || v7909 === "remove" || v7909 === "move" && v7912.hasCompoundNodes() || v7909 === "load" || v7909 === "zorder" || v7909 === "mount") {
    v7911.invalidateCachedZSortedEles();
  }
  if (v7909 === "viewport") {
    v7911.redrawHint("select", true);
  }
  if (v7909 === "gc") {
    v7911.redrawHint("gc", true);
  }
  if (v7909 === "load" || v7909 === "resize" || v7909 === "mount") {
    v7911.invalidateContainerClientCoordsCache();
    v7911.matchCanvasSize(v7911.container);
  }
  v7911.redrawHint("eles", true);
  v7911.redrawHint("drag", true);
  this.startRenderLoop();
  this.redraw();
};
BRp.destroy = function () {
  var v7913 = this;
  v7913.destroyed = true;
  v7913.cy.stopAnimationLoop();
  for (var v7914 = 0; v7914 < v7913.bindings.length; v7914++) {
    var v7915 = v7913.bindings[v7914];
    var v7916 = v7915;
    var v7917 = v7916.target;
    (v7917.off || v7917.removeEventListener).apply(v7917, v7916.args);
  }
  v7913.bindings = [];
  v7913.beforeRenderCallbacks = [];
  v7913.onUpdateEleCalcsFns = [];
  if (v7913.removeObserver) {
    v7913.removeObserver.disconnect();
  }
  if (v7913.styleObserver) {
    v7913.styleObserver.disconnect();
  }
  if (v7913.resizeObserver) {
    v7913.resizeObserver.disconnect();
  }
  if (v7913.labelCalcDiv) {
    try {
      document.body.removeChild(v7913.labelCalcDiv);
    } catch (v7918) {}
  }
};
BRp.isHeadless = function () {
  return false;
};
[BRp$f, BRp$5, BRp$4, BRp$3, BRp$2, BRp$1].forEach(function (v7919) {
  extend(BRp, v7919);
});
var fullFpsTime = 1000 / 60;
var defs = {
  setupDequeueing: function setupDequeueing(v7920) {
    return function v7921() {
      var v7922 = this;
      var v7923 = this.renderer;
      if (v7922.dequeueingSetup) {
        return;
      } else {
        v7922.dequeueingSetup = true;
      }
      var v7924 = debounce(function () {
        v7923.redrawHint("eles", true);
        v7923.redrawHint("drag", true);
        v7923.redraw();
      }, v7920.deqRedrawThreshold);
      var v7925 = function v7926(v7927, v7928) {
        var v7929 = performanceNow();
        var v7930 = v7923.averageRedrawTime;
        var v7931 = v7923.lastRedrawTime;
        var v7932 = [];
        var v7933 = v7923.cy.extent();
        var v7934 = v7923.getPixelRatio();
        if (!v7927) {
          v7923.flushRenderedStyleQueue();
        }
        while (true) {
          var v7935 = performanceNow();
          var v7936 = v7935 - v7929;
          var v7937 = v7935 - v7928;
          if (v7931 < fullFpsTime) {
            var v7938 = fullFpsTime - (v7927 ? v7930 : 0);
            if (v7937 >= v7920.deqFastCost * v7938) {
              break;
            }
          } else if (v7927) {
            if (v7936 >= v7920.deqCost * v7931 || v7936 >= v7920.deqAvgCost * v7930) {
              break;
            }
          } else if (v7937 >= v7920.deqNoDrawCost * fullFpsTime) {
            break;
          }
          var v7939 = v7920.deq(v7922, v7934, v7933);
          if (v7939.length > 0) {
            for (var v7940 = 0; v7940 < v7939.length; v7940++) {
              v7932.push(v7939[v7940]);
            }
          } else {
            break;
          }
        }
        if (v7932.length > 0) {
          v7920.onDeqd(v7922, v7932);
          if (!v7927 && v7920.shouldRedraw(v7922, v7932, v7934, v7933)) {
            v7924();
          }
        }
      };
      var v7941 = v7920.priority || noop$1;
      v7923.beforeRender(v7925, v7941(v7922));
    };
  }
};
var ElementTextureCacheLookup = function () {
  function v7942(v7943, v7944 = falsify) {
    _classCallCheck(this, v7942);
    this.idsByKey = new Map$1();
    this.keyForId = new Map$1();
    this.cachesByLvl = new Map$1();
    this.lvls = [];
    this.getKey = v7943;
    this.doesEleInvalidateKey = v7944;
  }
  return _createClass(v7942, [{
    key: "getIdsFor",
    value: function v7945(v7946) {
      if (v7946 == null) {
        error("Can not get id list for null key");
      }
      var v7947 = this.idsByKey;
      var v7948 = this.idsByKey.get(v7946);
      if (!v7948) {
        v7948 = new Set$1();
        v7947.set(v7946, v7948);
      }
      return v7948;
    }
  }, {
    key: "addIdForKey",
    value: function v7949(v7950, v7951) {
      if (v7950 != null) {
        this.getIdsFor(v7950).add(v7951);
      }
    }
  }, {
    key: "deleteIdForKey",
    value: function v7952(v7953, v7954) {
      if (v7953 != null) {
        this.getIdsFor(v7953).delete(v7954);
      }
    }
  }, {
    key: "getNumberOfIdsForKey",
    value: function v7955(v7956) {
      if (v7956 == null) {
        return 0;
      } else {
        return this.getIdsFor(v7956).size;
      }
    }
  }, {
    key: "updateKeyMappingFor",
    value: function v7957(v7958) {
      var v7959 = v7958.id();
      var v7960 = this.keyForId.get(v7959);
      var v7961 = this.getKey(v7958);
      this.deleteIdForKey(v7960, v7959);
      this.addIdForKey(v7961, v7959);
      this.keyForId.set(v7959, v7961);
    }
  }, {
    key: "deleteKeyMappingFor",
    value: function v7962(v7963) {
      var v7964 = v7963.id();
      var v7965 = this.keyForId.get(v7964);
      this.deleteIdForKey(v7965, v7964);
      this.keyForId.delete(v7964);
    }
  }, {
    key: "keyHasChangedFor",
    value: function v7966(v7967) {
      var v7968 = v7967.id();
      var v7969 = this.keyForId.get(v7968);
      var v7970 = this.getKey(v7967);
      return v7969 !== v7970;
    }
  }, {
    key: "isInvalid",
    value: function v7971(v7972) {
      return this.keyHasChangedFor(v7972) || this.doesEleInvalidateKey(v7972);
    }
  }, {
    key: "getCachesAt",
    value: function v7973(v7974) {
      var v7975 = this.cachesByLvl;
      var v7976 = this.lvls;
      var v7977 = v7975.get(v7974);
      if (!v7977) {
        v7977 = new Map$1();
        v7975.set(v7974, v7977);
        v7976.push(v7974);
      }
      return v7977;
    }
  }, {
    key: "getCache",
    value: function v7978(v7979, v7980) {
      return this.getCachesAt(v7980).get(v7979);
    }
  }, {
    key: "get",
    value: function v7981(v7982, v7983) {
      var v7984 = this.getKey(v7982);
      var v7985 = this.getCache(v7984, v7983);
      if (v7985 != null) {
        this.updateKeyMappingFor(v7982);
      }
      return v7985;
    }
  }, {
    key: "getForCachedKey",
    value: function v7986(v7987, v7988) {
      var v7989 = this.keyForId.get(v7987.id());
      var v7990 = this.getCache(v7989, v7988);
      return v7990;
    }
  }, {
    key: "hasCache",
    value: function v7991(v7992, v7993) {
      return this.getCachesAt(v7993).has(v7992);
    }
  }, {
    key: "has",
    value: function v7994(v7995, v7996) {
      var v7997 = this.getKey(v7995);
      return this.hasCache(v7997, v7996);
    }
  }, {
    key: "setCache",
    value: function v7998(v7999, v8000, v8001) {
      v8001.key = v7999;
      this.getCachesAt(v8000).set(v7999, v8001);
    }
  }, {
    key: "set",
    value: function v8002(v8003, v8004, v8005) {
      var v8006 = this.getKey(v8003);
      this.setCache(v8006, v8004, v8005);
      this.updateKeyMappingFor(v8003);
    }
  }, {
    key: "deleteCache",
    value: function v8007(v8008, v8009) {
      this.getCachesAt(v8009).delete(v8008);
    }
  }, {
    key: "delete",
    value: function v8010(v8011, v8012) {
      var v8013 = this.getKey(v8011);
      this.deleteCache(v8013, v8012);
    }
  }, {
    key: "invalidateKey",
    value: function v8014(v8015) {
      var v8016 = this;
      this.lvls.forEach(function (v8017) {
        return v8016.deleteCache(v8015, v8017);
      });
    }
  }, {
    key: "invalidate",
    value: function v8018(v8019) {
      var v8020 = v8019.id();
      var v8021 = this.keyForId.get(v8020);
      this.deleteKeyMappingFor(v8019);
      var v8022 = this.doesEleInvalidateKey(v8019);
      if (v8022) {
        this.invalidateKey(v8021);
      }
      return v8022 || this.getNumberOfIdsForKey(v8021) === 0;
    }
  }]);
}();
var minTxrH = 25;
var txrStepH = 50;
var minLvl$1 = -4;
var maxLvl$1 = 3;
var maxZoom$1 = 7.99;
var eleTxrSpacing = 8;
var defTxrWidth = 1024;
var maxTxrW = 1024;
var maxTxrH = 1024;
var minUtility = 0.2;
var maxFullness = 0.8;
var maxFullnessChecks = 10;
var deqCost$1 = 0.15;
var deqAvgCost$1 = 0.1;
var deqNoDrawCost$1 = 0.9;
var deqFastCost$1 = 0.9;
var deqRedrawThreshold$1 = 100;
var maxDeqSize$1 = 1;
var getTxrReasons = {
  dequeue: "dequeue",
  downscale: "downscale",
  highQuality: "highQuality"
};
var initDefaults = defaults$g({
  getKey: null,
  doesEleInvalidateKey: falsify,
  drawElement: null,
  getBoundingBox: null,
  getRotationPoint: null,
  getRotationOffset: null,
  isVisible: trueify,
  allowEdgeTxrCaching: true,
  allowParentTxrCaching: true
});
var ElementTextureCache = function ElementTextureCache2(v8023, v8024) {
  var v8025 = this;
  v8025.renderer = v8023;
  v8025.onDequeues = [];
  var v8026 = initDefaults(v8024);
  extend(v8025, v8026);
  v8025.lookup = new ElementTextureCacheLookup(v8026.getKey, v8026.doesEleInvalidateKey);
  v8025.setupDequeueing();
};
var ETCp = ElementTextureCache.prototype;
ETCp.reasons = getTxrReasons;
ETCp.getTextureQueue = function (v8027) {
  var v8028 = this;
  v8028.eleImgCaches = v8028.eleImgCaches || {};
  return v8028.eleImgCaches[v8027] = v8028.eleImgCaches[v8027] || [];
};
ETCp.getRetiredTextureQueue = function (v8029) {
  var v8030 = this;
  var v8031 = v8030.eleImgCaches.retired = v8030.eleImgCaches.retired || {};
  var v8032 = v8031[v8029] = v8031[v8029] || [];
  return v8032;
};
ETCp.getElementQueue = function () {
  var v8033 = this;
  var v8034 = v8033.eleCacheQueue = v8033.eleCacheQueue || new Heap(function (v8035, v8036) {
    return v8036.reqs - v8035.reqs;
  });
  return v8034;
};
ETCp.getElementKeyToQueue = function () {
  var v8037 = this;
  var v8038 = v8037.eleKeyToCacheQueue = v8037.eleKeyToCacheQueue || {};
  return v8038;
};
ETCp.getElement = function (v8039, v8040, v8041, v8042, v8043) {
  var v8044 = this;
  var v8045 = this.renderer;
  var v8046 = v8045.cy.zoom();
  var v8047 = this.lookup;
  if (!v8040 || v8040.w === 0 || v8040.h === 0 || isNaN(v8040.w) || isNaN(v8040.h) || !v8039.visible() || v8039.removed()) {
    return null;
  }
  if (!v8044.allowEdgeTxrCaching && v8039.isEdge() || !v8044.allowParentTxrCaching && v8039.isParent()) {
    return null;
  }
  if (v8042 == null) {
    v8042 = Math.ceil(log2(v8046 * v8041));
  }
  if (v8042 < minLvl$1) {
    v8042 = minLvl$1;
  } else if (v8046 >= maxZoom$1 || v8042 > maxLvl$1) {
    return null;
  }
  var v8048 = Math.pow(2, v8042);
  var v8049 = v8040.h * v8048;
  var v8050 = v8040.w * v8048;
  var v8051 = v8045.eleTextBiggerThanMin(v8039, v8048);
  if (!this.isVisible(v8039, v8051)) {
    return null;
  }
  var v8052 = v8047.get(v8039, v8042);
  if (v8052 && v8052.invalidated) {
    v8052.invalidated = false;
    v8052.texture.invalidatedWidth -= v8052.width;
  }
  if (v8052) {
    return v8052;
  }
  var v8053;
  if (v8049 <= minTxrH) {
    v8053 = minTxrH;
  } else if (v8049 <= txrStepH) {
    v8053 = txrStepH;
  } else {
    v8053 = Math.ceil(v8049 / txrStepH) * txrStepH;
  }
  if (v8049 > maxTxrH || v8050 > maxTxrW) {
    return null;
  }
  var v8054 = v8044.getTextureQueue(v8053);
  var v8055 = v8054[v8054.length - 2];
  var v8056 = function v8057() {
    return v8044.recycleTexture(v8053, v8050) || v8044.addTexture(v8053, v8050);
  };
  if (!v8055) {
    v8055 = v8054[v8054.length - 1];
  }
  if (!v8055) {
    v8055 = v8056();
  }
  if (v8055.width - v8055.usedWidth < v8050) {
    v8055 = v8056();
  }
  var v8058 = function v8059(v8060) {
    return v8060 && v8060.scaledLabelShown === v8051;
  };
  var v8061 = v8043 && v8043 === getTxrReasons.dequeue;
  var v8062 = v8043 && v8043 === getTxrReasons.highQuality;
  var v8063 = v8043 && v8043 === getTxrReasons.downscale;
  var v8064;
  for (var v8065 = v8042 + 1; v8065 <= maxLvl$1; v8065++) {
    var v8066 = v8047.get(v8039, v8065);
    if (v8066) {
      v8064 = v8066;
      break;
    }
  }
  var v8067 = v8064 && v8064.level === v8042 + 1 ? v8064 : null;
  var v8068 = function v8069() {
    v8055.context.drawImage(v8067.texture.canvas, v8067.x, 0, v8067.width, v8067.height, v8055.usedWidth, 0, v8050, v8049);
  };
  v8055.context.setTransform(1, 0, 0, 1, 0, 0);
  v8055.context.clearRect(v8055.usedWidth, 0, v8050, v8053);
  if (v8058(v8067)) {
    v8068();
  } else if (v8058(v8064)) {
    if (v8062) {
      for (var v8070 = v8064.level; v8070 > v8042; v8070--) {
        v8067 = v8044.getElement(v8039, v8040, v8041, v8070, getTxrReasons.downscale);
      }
      v8068();
    } else {
      v8044.queueElement(v8039, v8064.level - 1);
      return v8064;
    }
  } else {
    var v8071;
    if (!v8061 && !v8062 && !v8063) {
      for (var v8072 = v8042 - 1; v8072 >= minLvl$1; v8072--) {
        var v8073 = v8047.get(v8039, v8072);
        if (v8073) {
          v8071 = v8073;
          break;
        }
      }
    }
    if (v8058(v8071)) {
      v8044.queueElement(v8039, v8042);
      return v8071;
    }
    v8055.context.translate(v8055.usedWidth, 0);
    v8055.context.scale(v8048, v8048);
    this.drawElement(v8055.context, v8039, v8040, v8051, false);
    v8055.context.scale(1 / v8048, 1 / v8048);
    v8055.context.translate(-v8055.usedWidth, 0);
  }
  v8052 = {
    x: v8055.usedWidth,
    texture: v8055,
    level: v8042,
    scale: v8048,
    width: v8050,
    height: v8049,
    scaledLabelShown: v8051
  };
  v8055.usedWidth += Math.ceil(v8050 + eleTxrSpacing);
  v8055.eleCaches.push(v8052);
  v8047.set(v8039, v8042, v8052);
  v8044.checkTextureFullness(v8055);
  return v8052;
};
ETCp.invalidateElements = function (v8074) {
  for (var v8075 = 0; v8075 < v8074.length; v8075++) {
    this.invalidateElement(v8074[v8075]);
  }
};
ETCp.invalidateElement = function (v8076) {
  var v8077 = this;
  var v8078 = v8077.lookup;
  var v8079 = [];
  var v8080 = v8078.isInvalid(v8076);
  if (!v8080) {
    return;
  }
  for (var v8081 = minLvl$1; v8081 <= maxLvl$1; v8081++) {
    var v8082 = v8078.getForCachedKey(v8076, v8081);
    if (v8082) {
      v8079.push(v8082);
    }
  }
  var v8083 = v8078.invalidate(v8076);
  if (v8083) {
    for (var v8084 = 0; v8084 < v8079.length; v8084++) {
      var v8085 = v8079[v8084];
      var v8086 = v8085.texture;
      v8086.invalidatedWidth += v8085.width;
      v8085.invalidated = true;
      v8077.checkTextureUtility(v8086);
    }
  }
  v8077.removeFromQueue(v8076);
};
ETCp.checkTextureUtility = function (v8087) {
  if (v8087.invalidatedWidth >= minUtility * v8087.width) {
    this.retireTexture(v8087);
  }
};
ETCp.checkTextureFullness = function (v8088) {
  var v8089 = this;
  var v8090 = v8089.getTextureQueue(v8088.height);
  if (v8088.usedWidth / v8088.width > maxFullness && v8088.fullnessChecks >= maxFullnessChecks) {
    removeFromArray(v8090, v8088);
  } else {
    v8088.fullnessChecks++;
  }
};
ETCp.retireTexture = function (v8091) {
  var v8092 = this;
  var v8093 = v8091.height;
  var v8094 = v8092.getTextureQueue(v8093);
  var v8095 = this.lookup;
  removeFromArray(v8094, v8091);
  v8091.retired = true;
  var v8096 = v8091.eleCaches;
  for (var v8097 = 0; v8097 < v8096.length; v8097++) {
    var v8098 = v8096[v8097];
    v8095.deleteCache(v8098.key, v8098.level);
  }
  clearArray(v8096);
  var v8099 = v8092.getRetiredTextureQueue(v8093);
  v8099.push(v8091);
};
ETCp.addTexture = function (v8100, v8101) {
  var v8102 = this;
  var v8103 = v8102.getTextureQueue(v8100);
  var v8104 = {};
  v8103.push(v8104);
  v8104.eleCaches = [];
  v8104.height = v8100;
  v8104.width = Math.max(defTxrWidth, v8101);
  v8104.usedWidth = 0;
  v8104.invalidatedWidth = 0;
  v8104.fullnessChecks = 0;
  v8104.canvas = v8102.renderer.makeOffscreenCanvas(v8104.width, v8104.height);
  v8104.context = v8104.canvas.getContext("2d");
  return v8104;
};
ETCp.recycleTexture = function (v8105, v8106) {
  var v8107 = this;
  var v8108 = v8107.getTextureQueue(v8105);
  var v8109 = v8107.getRetiredTextureQueue(v8105);
  for (var v8110 = 0; v8110 < v8109.length; v8110++) {
    var v8111 = v8109[v8110];
    if (v8111.width >= v8106) {
      v8111.retired = false;
      v8111.usedWidth = 0;
      v8111.invalidatedWidth = 0;
      v8111.fullnessChecks = 0;
      clearArray(v8111.eleCaches);
      v8111.context.setTransform(1, 0, 0, 1, 0, 0);
      v8111.context.clearRect(0, 0, v8111.width, v8111.height);
      removeFromArray(v8109, v8111);
      v8108.push(v8111);
      return v8111;
    }
  }
};
ETCp.queueElement = function (v8112, v8113) {
  var v8114 = this;
  var v8115 = v8114.getElementQueue();
  var v8116 = v8114.getElementKeyToQueue();
  var v8117 = this.getKey(v8112);
  var v8118 = v8116[v8117];
  if (v8118) {
    v8118.level = Math.max(v8118.level, v8113);
    v8118.eles.merge(v8112);
    v8118.reqs++;
    v8115.updateItem(v8118);
  } else {
    var v8119 = {
      eles: v8112.spawn().merge(v8112),
      level: v8113,
      reqs: 1,
      key: v8117
    };
    v8115.push(v8119);
    v8116[v8117] = v8119;
  }
};
ETCp.dequeue = function (v8120) {
  var v8121 = this;
  var v8122 = v8121.getElementQueue();
  var v8123 = v8121.getElementKeyToQueue();
  var v8124 = [];
  var v8125 = v8121.lookup;
  for (var v8126 = 0; v8126 < maxDeqSize$1; v8126++) {
    if (v8122.size() > 0) {
      var v8127 = v8122.pop();
      var v8128 = v8127.key;
      var v8129 = v8127.eles[0];
      var v8130 = v8125.hasCache(v8129, v8127.level);
      v8123[v8128] = null;
      if (v8130) {
        continue;
      }
      v8124.push(v8127);
      var v8131 = v8121.getBoundingBox(v8129);
      v8121.getElement(v8129, v8131, v8120, v8127.level, getTxrReasons.dequeue);
    } else {
      break;
    }
  }
  return v8124;
};
ETCp.removeFromQueue = function (v8132) {
  var v8133 = this;
  var v8134 = v8133.getElementQueue();
  var v8135 = v8133.getElementKeyToQueue();
  var v8136 = this.getKey(v8132);
  var v8137 = v8135[v8136];
  if (v8137 != null) {
    if (v8137.eles.length === 1) {
      v8137.reqs = MAX_INT$1;
      v8134.updateItem(v8137);
      v8134.pop();
      v8135[v8136] = null;
    } else {
      v8137.eles.unmerge(v8132);
    }
  }
};
ETCp.onDequeue = function (v8138) {
  this.onDequeues.push(v8138);
};
ETCp.offDequeue = function (v8139) {
  removeFromArray(this.onDequeues, v8139);
};
ETCp.setupDequeueing = defs.setupDequeueing({
  deqRedrawThreshold: deqRedrawThreshold$1,
  deqCost: deqCost$1,
  deqAvgCost: deqAvgCost$1,
  deqNoDrawCost: deqNoDrawCost$1,
  deqFastCost: deqFastCost$1,
  deq: function deq(v8140, v8141, v8142) {
    return v8140.dequeue(v8141, v8142);
  },
  onDeqd: function onDeqd(v8143, v8144) {
    for (var v8145 = 0; v8145 < v8143.onDequeues.length; v8145++) {
      var v8146 = v8143.onDequeues[v8145];
      v8146(v8144);
    }
  },
  shouldRedraw: function shouldRedraw(v8147, v8148, v8149, v8150) {
    for (var v8151 = 0; v8151 < v8148.length; v8151++) {
      var v8152 = v8148[v8151].eles;
      for (var v8153 = 0; v8153 < v8152.length; v8153++) {
        var v8154 = v8152[v8153].boundingBox();
        if (boundingBoxesIntersect(v8154, v8150)) {
          return true;
        }
      }
    }
    return false;
  },
  priority: function priority(v8155) {
    return v8155.renderer.beforeRenderPriorities.eleTxrDeq;
  }
});
var defNumLayers = 1;
var minLvl = -4;
var maxLvl = 2;
var maxZoom2 = 3.99;
var deqRedrawThreshold = 50;
var refineEleDebounceTime = 50;
var deqCost = 0.15;
var deqAvgCost = 0.1;
var deqNoDrawCost = 0.9;
var deqFastCost = 0.9;
var maxDeqSize = 1;
var invalidThreshold = 250;
var maxLayerArea = 16000000;
var maxLayerDim = 32767;
var useHighQualityEleTxrReqs = true;
var LayeredTextureCache = function LayeredTextureCache2(v8156) {
  var v8157 = this;
  var v8158 = v8157.renderer = v8156;
  var v8159 = v8158.cy;
  v8157.layersByLevel = {};
  v8157.firstGet = true;
  v8157.lastInvalidationTime = performanceNow() - invalidThreshold * 2;
  v8157.skipping = false;
  v8157.eleTxrDeqs = v8159.collection();
  v8157.scheduleElementRefinement = debounce(function () {
    v8157.refineElementTextures(v8157.eleTxrDeqs);
    v8157.eleTxrDeqs.unmerge(v8157.eleTxrDeqs);
  }, refineEleDebounceTime);
  v8158.beforeRender(function (v8160, v8161) {
    if (v8161 - v8157.lastInvalidationTime <= invalidThreshold) {
      v8157.skipping = true;
    } else {
      v8157.skipping = false;
    }
  }, v8158.beforeRenderPriorities.lyrTxrSkip);
  var v8162 = function v8163(v8164, v8165) {
    return v8165.reqs - v8164.reqs;
  };
  v8157.layersQueue = new Heap(v8162);
  v8157.setupDequeueing();
};
var LTCp = LayeredTextureCache.prototype;
var layerIdPool = 0;
var MAX_INT = Math.pow(2, 53) - 1;
LTCp.makeLayer = function (v8166, v8167) {
  var v8168 = Math.pow(2, v8167);
  var v8169 = Math.ceil(v8166.w * v8168);
  var v8170 = Math.ceil(v8166.h * v8168);
  var v8171 = this.renderer.makeOffscreenCanvas(v8169, v8170);
  var v8172 = {
    id: layerIdPool = ++layerIdPool % MAX_INT,
    bb: v8166,
    level: v8167,
    width: v8169,
    height: v8170,
    canvas: v8171,
    context: v8171.getContext("2d"),
    eles: [],
    elesQueue: [],
    reqs: 0
  };
  var v8173 = v8172.context;
  var v8174 = -v8172.bb.x1;
  var v8175 = -v8172.bb.y1;
  v8173.scale(v8168, v8168);
  v8173.translate(v8174, v8175);
  return v8172;
};
LTCp.getLayers = function (v8176, v8177, v8178) {
  var v8179 = this;
  var v8180 = v8179.renderer;
  var v8181 = v8180.cy;
  var v8182 = v8181.zoom();
  var v8183 = v8179.firstGet;
  v8179.firstGet = false;
  if (v8178 == null) {
    v8178 = Math.ceil(log2(v8182 * v8177));
    if (v8178 < minLvl) {
      v8178 = minLvl;
    } else if (v8182 >= maxZoom2 || v8178 > maxLvl) {
      return null;
    }
  }
  v8179.validateLayersElesOrdering(v8178, v8176);
  var v8184 = v8179.layersByLevel;
  var v8185 = Math.pow(2, v8178);
  var v8186 = v8184[v8178] = v8184[v8178] || [];
  var v8187;
  var v8188 = v8179.levelIsComplete(v8178, v8176);
  var v8189;
  var v8190 = function v8191() {
    var v8192 = function v8193(v8194) {
      v8179.validateLayersElesOrdering(v8194, v8176);
      if (v8179.levelIsComplete(v8194, v8176)) {
        v8189 = v8184[v8194];
        return true;
      }
    };
    var v8195 = function v8196(v8197) {
      if (v8189) {
        return;
      }
      for (var v8198 = v8178 + v8197; minLvl <= v8198 && v8198 <= maxLvl; v8198 += v8197) {
        if (v8192(v8198)) {
          break;
        }
      }
    };
    v8195(1);
    v8195(-1);
    for (var v8199 = v8186.length - 1; v8199 >= 0; v8199--) {
      var v8200 = v8186[v8199];
      if (v8200.invalid) {
        removeFromArray(v8186, v8200);
      }
    }
  };
  if (!v8188) {
    v8190();
  } else {
    return v8186;
  }
  var v8201 = function v8202() {
    if (!v8187) {
      v8187 = makeBoundingBox();
      for (var v8203 = 0; v8203 < v8176.length; v8203++) {
        updateBoundingBox(v8187, v8176[v8203].boundingBox());
      }
    }
    return v8187;
  };
  var v8204 = function v8205(v8206) {
    v8206 = v8206 || {};
    var v8207 = v8206.after;
    v8201();
    var v8208 = Math.ceil(v8187.w * v8185);
    var v8209 = Math.ceil(v8187.h * v8185);
    if (v8208 > maxLayerDim || v8209 > maxLayerDim) {
      return null;
    }
    var v8210 = v8208 * v8209;
    if (v8210 > maxLayerArea) {
      return null;
    }
    var v8211 = v8179.makeLayer(v8187, v8178);
    if (v8207 != null) {
      var v8212 = v8186.indexOf(v8207) + 1;
      v8186.splice(v8212, 0, v8211);
    } else if (v8206.insert === undefined || v8206.insert) {
      v8186.unshift(v8211);
    }
    return v8211;
  };
  if (v8179.skipping && !v8183) {
    return null;
  }
  var v8213 = null;
  var v8214 = v8176.length / defNumLayers;
  var v8215 = !v8183;
  for (var v8216 = 0; v8216 < v8176.length; v8216++) {
    var v8217 = v8176[v8216];
    var v8218 = v8217._private.rscratch;
    var v8219 = v8218.imgLayerCaches = v8218.imgLayerCaches || {};
    var v8220 = v8219[v8178];
    if (v8220) {
      v8213 = v8220;
      continue;
    }
    if (!v8213 || v8213.eles.length >= v8214 || !boundingBoxInBoundingBox(v8213.bb, v8217.boundingBox())) {
      v8213 = v8204({
        insert: true,
        after: v8213
      });
      if (!v8213) {
        return null;
      }
    }
    if (v8189 || v8215) {
      v8179.queueLayer(v8213, v8217);
    } else {
      v8179.drawEleInLayer(v8213, v8217, v8178, v8177);
    }
    v8213.eles.push(v8217);
    v8219[v8178] = v8213;
  }
  if (v8189) {
    return v8189;
  }
  if (v8215) {
    return null;
  }
  return v8186;
};
LTCp.getEleLevelForLayerLevel = function (v8221, v8222) {
  return v8221;
};
LTCp.drawEleInLayer = function (v8223, v8224, v8225, v8226) {
  var v8227 = this;
  var v8228 = this.renderer;
  var v8229 = v8223.context;
  var v8230 = v8224.boundingBox();
  if (v8230.w === 0 || v8230.h === 0 || !v8224.visible()) {
    return;
  }
  v8225 = v8227.getEleLevelForLayerLevel(v8225, v8226);
  {
    v8228.setImgSmoothing(v8229, false);
  }
  {
    v8228.drawCachedElement(v8229, v8224, null, null, v8225, useHighQualityEleTxrReqs);
  }
  {
    v8228.setImgSmoothing(v8229, true);
  }
};
LTCp.levelIsComplete = function (v8231, v8232) {
  var v8233 = this;
  var v8234 = v8233.layersByLevel[v8231];
  if (!v8234 || v8234.length === 0) {
    return false;
  }
  var v8235 = 0;
  for (var v8236 = 0; v8236 < v8234.length; v8236++) {
    var v8237 = v8234[v8236];
    if (v8237.reqs > 0) {
      return false;
    }
    if (v8237.invalid) {
      return false;
    }
    v8235 += v8237.eles.length;
  }
  if (v8235 !== v8232.length) {
    return false;
  }
  return true;
};
LTCp.validateLayersElesOrdering = function (v8238, v8239) {
  var v8240 = this.layersByLevel[v8238];
  if (!v8240) {
    return;
  }
  for (var v8241 = 0; v8241 < v8240.length; v8241++) {
    var v8242 = v8240[v8241];
    var v8243 = -1;
    for (var v8244 = 0; v8244 < v8239.length; v8244++) {
      if (v8242.eles[0] === v8239[v8244]) {
        v8243 = v8244;
        break;
      }
    }
    if (v8243 < 0) {
      this.invalidateLayer(v8242);
      continue;
    }
    var v8245 = v8243;
    for (var v8244 = 0; v8244 < v8242.eles.length; v8244++) {
      if (v8242.eles[v8244] !== v8239[v8245 + v8244]) {
        this.invalidateLayer(v8242);
        break;
      }
    }
  }
};
LTCp.updateElementsInLayers = function (v8246, v8247) {
  var v8248 = this;
  var v8249 = element(v8246[0]);
  for (var v8250 = 0; v8250 < v8246.length; v8250++) {
    var v8251 = v8249 ? null : v8246[v8250];
    var v8252 = v8249 ? v8246[v8250] : v8246[v8250].ele;
    var v8253 = v8252._private.rscratch;
    var v8254 = v8253.imgLayerCaches = v8253.imgLayerCaches || {};
    for (var v8255 = minLvl; v8255 <= maxLvl; v8255++) {
      var v8256 = v8254[v8255];
      if (!v8256) {
        continue;
      }
      if (v8251 && v8248.getEleLevelForLayerLevel(v8256.level) !== v8251.level) {
        continue;
      }
      v8247(v8256, v8252, v8251);
    }
  }
};
LTCp.haveLayers = function () {
  var v8257 = this;
  var v8258 = false;
  for (var v8259 = minLvl; v8259 <= maxLvl; v8259++) {
    var v8260 = v8257.layersByLevel[v8259];
    if (v8260 && v8260.length > 0) {
      v8258 = true;
      break;
    }
  }
  return v8258;
};
LTCp.invalidateElements = function (v8261) {
  var v8262 = this;
  if (v8261.length === 0) {
    return;
  }
  v8262.lastInvalidationTime = performanceNow();
  if (v8261.length === 0 || !v8262.haveLayers()) {
    return;
  }
  v8262.updateElementsInLayers(v8261, function v8263(v8264, v8265, v8266) {
    v8262.invalidateLayer(v8264);
  });
};
LTCp.invalidateLayer = function (v8267) {
  this.lastInvalidationTime = performanceNow();
  if (v8267.invalid) {
    return;
  }
  var v8268 = v8267.level;
  var v8269 = v8267.eles;
  var v8270 = this.layersByLevel[v8268];
  removeFromArray(v8270, v8267);
  v8267.elesQueue = [];
  v8267.invalid = true;
  if (v8267.replacement) {
    v8267.replacement.invalid = true;
  }
  for (var v8271 = 0; v8271 < v8269.length; v8271++) {
    var v8272 = v8269[v8271]._private.rscratch.imgLayerCaches;
    if (v8272) {
      v8272[v8268] = null;
    }
  }
};
LTCp.refineElementTextures = function (v8273) {
  var v8274 = this;
  v8274.updateElementsInLayers(v8273, function v8275(v8276, v8277, v8278) {
    var v8279 = v8276.replacement;
    if (!v8279) {
      v8279 = v8276.replacement = v8274.makeLayer(v8276.bb, v8276.level);
      v8279.replaces = v8276;
      v8279.eles = v8276.eles;
    }
    if (!v8279.reqs) {
      for (var v8280 = 0; v8280 < v8279.eles.length; v8280++) {
        v8274.queueLayer(v8279, v8279.eles[v8280]);
      }
    }
  });
};
LTCp.enqueueElementRefinement = function (v8281) {
  this.eleTxrDeqs.merge(v8281);
  this.scheduleElementRefinement();
};
LTCp.queueLayer = function (v8282, v8283) {
  var v8284 = this;
  var v8285 = v8284.layersQueue;
  var v8286 = v8282.elesQueue;
  var v8287 = v8286.hasId = v8286.hasId || {};
  if (v8282.replacement) {
    return;
  }
  if (v8283) {
    if (v8287[v8283.id()]) {
      return;
    }
    v8286.push(v8283);
    v8287[v8283.id()] = true;
  }
  if (v8282.reqs) {
    v8282.reqs++;
    v8285.updateItem(v8282);
  } else {
    v8282.reqs = 1;
    v8285.push(v8282);
  }
};
LTCp.dequeue = function (v8288) {
  var v8289 = this;
  var v8290 = v8289.layersQueue;
  var v8291 = [];
  var v8292 = 0;
  while (v8292 < maxDeqSize) {
    if (v8290.size() === 0) {
      break;
    }
    var v8293 = v8290.peek();
    if (v8293.replacement) {
      v8290.pop();
      continue;
    }
    if (v8293.replaces && v8293 !== v8293.replaces.replacement) {
      v8290.pop();
      continue;
    }
    if (v8293.invalid) {
      v8290.pop();
      continue;
    }
    var v8294 = v8293.elesQueue.shift();
    if (v8294) {
      v8289.drawEleInLayer(v8293, v8294, v8293.level, v8288);
      v8292++;
    }
    if (v8291.length === 0) {
      v8291.push(true);
    }
    if (v8293.elesQueue.length === 0) {
      v8290.pop();
      v8293.reqs = 0;
      if (v8293.replaces) {
        v8289.applyLayerReplacement(v8293);
      }
      v8289.requestRedraw();
    }
  }
  return v8291;
};
LTCp.applyLayerReplacement = function (v8295) {
  var v8296 = this;
  var v8297 = v8296.layersByLevel[v8295.level];
  var v8298 = v8295.replaces;
  var v8299 = v8297.indexOf(v8298);
  if (v8299 < 0 || v8298.invalid) {
    return;
  }
  v8297[v8299] = v8295;
  for (var v8300 = 0; v8300 < v8295.eles.length; v8300++) {
    var v8301 = v8295.eles[v8300]._private;
    var v8302 = v8301.imgLayerCaches = v8301.imgLayerCaches || {};
    if (v8302) {
      v8302[v8295.level] = v8295;
    }
  }
  v8296.requestRedraw();
};
LTCp.requestRedraw = debounce(function () {
  var v8303 = this.renderer;
  v8303.redrawHint("eles", true);
  v8303.redrawHint("drag", true);
  v8303.redraw();
}, 100);
LTCp.setupDequeueing = defs.setupDequeueing({
  deqRedrawThreshold: deqRedrawThreshold,
  deqCost: deqCost,
  deqAvgCost: deqAvgCost,
  deqNoDrawCost: deqNoDrawCost,
  deqFastCost: deqFastCost,
  deq: function deq2(v8304, v8305) {
    return v8304.dequeue(v8305);
  },
  onDeqd: noop$1,
  shouldRedraw: trueify,
  priority: function priority2(v8306) {
    return v8306.renderer.beforeRenderPriorities.lyrTxrDeq;
  }
});
var CRp$b = {};
var impl;
function polygon(v8307, v8308) {
  for (var v8309 = 0; v8309 < v8308.length; v8309++) {
    var v8310 = v8308[v8309];
    v8307.lineTo(v8310.x, v8310.y);
  }
}
function triangleBackcurve(v8311, v8312, v8313) {
  var v8314;
  for (var v8315 = 0; v8315 < v8312.length; v8315++) {
    var v8316 = v8312[v8315];
    if (v8315 === 0) {
      v8314 = v8316;
    }
    v8311.lineTo(v8316.x, v8316.y);
  }
  v8311.quadraticCurveTo(v8313.x, v8313.y, v8314.x, v8314.y);
}
function triangleTee(v8317, v8318, v8319) {
  if (v8317.beginPath) {
    v8317.beginPath();
  }
  var v8320 = v8318;
  for (var v8321 = 0; v8321 < v8320.length; v8321++) {
    var v8322 = v8320[v8321];
    v8317.lineTo(v8322.x, v8322.y);
  }
  var v8323 = v8319;
  var v8324 = v8319[0];
  v8317.moveTo(v8324.x, v8324.y);
  for (var v8321 = 1; v8321 < v8323.length; v8321++) {
    var v8322 = v8323[v8321];
    v8317.lineTo(v8322.x, v8322.y);
  }
  if (v8317.closePath) {
    v8317.closePath();
  }
}
function circleTriangle(v8325, v8326, v8327, v8328, v8329) {
  if (v8325.beginPath) {
    v8325.beginPath();
  }
  v8325.arc(v8327, v8328, v8329, 0, Math.PI * 2, false);
  var v8330 = v8326;
  var v8331 = v8330[0];
  v8325.moveTo(v8331.x, v8331.y);
  for (var v8332 = 0; v8332 < v8330.length; v8332++) {
    var v8333 = v8330[v8332];
    v8325.lineTo(v8333.x, v8333.y);
  }
  if (v8325.closePath) {
    v8325.closePath();
  }
}
function circle$1(v8334, v8335, v8336, v8337) {
  v8334.arc(v8335, v8336, v8337, 0, Math.PI * 2, false);
}
CRp$b.arrowShapeImpl = function (v8338) {
  return (impl ||= {
    polygon: polygon,
    "triangle-backcurve": triangleBackcurve,
    "triangle-tee": triangleTee,
    "circle-triangle": circleTriangle,
    "triangle-cross": triangleTee,
    circle: circle$1
  })[v8338];
};
var CRp$a = {};
CRp$a.drawElement = function (v8339, v8340, v8341, v8342, v8343, v8344) {
  var v8345 = this;
  if (v8340.isNode()) {
    v8345.drawNode(v8339, v8340, v8341, v8342, v8343, v8344);
  } else {
    v8345.drawEdge(v8339, v8340, v8341, v8342, v8343, v8344);
  }
};
CRp$a.drawElementOverlay = function (v8346, v8347) {
  var v8348 = this;
  if (v8347.isNode()) {
    v8348.drawNodeOverlay(v8346, v8347);
  } else {
    v8348.drawEdgeOverlay(v8346, v8347);
  }
};
CRp$a.drawElementUnderlay = function (v8349, v8350) {
  var v8351 = this;
  if (v8350.isNode()) {
    v8351.drawNodeUnderlay(v8349, v8350);
  } else {
    v8351.drawEdgeUnderlay(v8349, v8350);
  }
};
CRp$a.drawCachedElementPortion = function (v8352, v8353, v8354, v8355, v8356, v8357, v8358, v8359) {
  var v8360 = this;
  var v8361 = v8354.getBoundingBox(v8353);
  if (v8361.w === 0 || v8361.h === 0) {
    return;
  }
  var v8362 = v8354.getElement(v8353, v8361, v8355, v8356, v8357);
  if (v8362 != null) {
    var v8363 = v8359(v8360, v8353);
    if (v8363 === 0) {
      return;
    }
    var v8364 = v8358(v8360, v8353);
    var v8365 = v8361.x1;
    var v8366 = v8361.y1;
    var v8367 = v8361.w;
    var v8368 = v8361.h;
    var v8369;
    var v8370;
    var v8371;
    var v8372;
    var v8373;
    if (v8364 !== 0) {
      var v8374 = v8354.getRotationPoint(v8353);
      v8371 = v8374.x;
      v8372 = v8374.y;
      v8352.translate(v8371, v8372);
      v8352.rotate(v8364);
      v8373 = v8360.getImgSmoothing(v8352);
      if (!v8373) {
        v8360.setImgSmoothing(v8352, true);
      }
      var v8375 = v8354.getRotationOffset(v8353);
      v8369 = v8375.x;
      v8370 = v8375.y;
    } else {
      v8369 = v8365;
      v8370 = v8366;
    }
    var v8376;
    if (v8363 !== 1) {
      v8376 = v8352.globalAlpha;
      v8352.globalAlpha = v8376 * v8363;
    }
    v8352.drawImage(v8362.texture.canvas, v8362.x, 0, v8362.width, v8362.height, v8369, v8370, v8367, v8368);
    if (v8363 !== 1) {
      v8352.globalAlpha = v8376;
    }
    if (v8364 !== 0) {
      v8352.rotate(-v8364);
      v8352.translate(-v8371, -v8372);
      if (!v8373) {
        v8360.setImgSmoothing(v8352, false);
      }
    }
  } else {
    v8354.drawElement(v8352, v8353);
  }
};
var getZeroRotation = function getZeroRotation2() {
  return 0;
};
var getLabelRotation = function getLabelRotation2(v8377, v8378) {
  return v8377.getTextAngle(v8378, null);
};
var getSourceLabelRotation = function getSourceLabelRotation2(v8379, v8380) {
  return v8379.getTextAngle(v8380, "source");
};
var getTargetLabelRotation = function getTargetLabelRotation2(v8381, v8382) {
  return v8381.getTextAngle(v8382, "target");
};
var getOpacity = function getOpacity2(v8383, v8384) {
  return v8384.effectiveOpacity();
};
var getTextOpacity = function getTextOpacity2(v8385, v8386) {
  return v8386.pstyle("text-opacity").pfValue * v8386.effectiveOpacity();
};
CRp$a.drawCachedElement = function (v8387, v8388, v8389, v8390, v8391, v8392) {
  var v8393 = this;
  var v8394 = v8393.data;
  var v8395 = v8394.eleTxrCache;
  var v8396 = v8394.lblTxrCache;
  var v8397 = v8394.slbTxrCache;
  var v8398 = v8394.tlbTxrCache;
  var v8399 = v8388.boundingBox();
  var v8400 = v8392 === true ? v8395.reasons.highQuality : null;
  if (v8399.w === 0 || v8399.h === 0 || !v8388.visible()) {
    return;
  }
  if (!v8390 || boundingBoxesIntersect(v8399, v8390)) {
    var v8401 = v8388.isEdge();
    var v8402 = v8388.element()._private.rscratch.badLine;
    v8393.drawElementUnderlay(v8387, v8388);
    v8393.drawCachedElementPortion(v8387, v8388, v8395, v8389, v8391, v8400, getZeroRotation, getOpacity);
    if (!v8401 || !v8402) {
      v8393.drawCachedElementPortion(v8387, v8388, v8396, v8389, v8391, v8400, getLabelRotation, getTextOpacity);
    }
    if (v8401 && !v8402) {
      v8393.drawCachedElementPortion(v8387, v8388, v8397, v8389, v8391, v8400, getSourceLabelRotation, getTextOpacity);
      v8393.drawCachedElementPortion(v8387, v8388, v8398, v8389, v8391, v8400, getTargetLabelRotation, getTextOpacity);
    }
    v8393.drawElementOverlay(v8387, v8388);
  }
};
CRp$a.drawElements = function (v8403, v8404) {
  var v8405 = this;
  for (var v8406 = 0; v8406 < v8404.length; v8406++) {
    var v8407 = v8404[v8406];
    v8405.drawElement(v8403, v8407);
  }
};
CRp$a.drawCachedElements = function (v8408, v8409, v8410, v8411) {
  var v8412 = this;
  for (var v8413 = 0; v8413 < v8409.length; v8413++) {
    var v8414 = v8409[v8413];
    v8412.drawCachedElement(v8408, v8414, v8410, v8411);
  }
};
CRp$a.drawCachedNodes = function (v8415, v8416, v8417, v8418) {
  var v8419 = this;
  for (var v8420 = 0; v8420 < v8416.length; v8420++) {
    var v8421 = v8416[v8420];
    if (!v8421.isNode()) {
      continue;
    }
    v8419.drawCachedElement(v8415, v8421, v8417, v8418);
  }
};
CRp$a.drawLayeredElements = function (v8422, v8423, v8424, v8425) {
  var v8426 = this;
  var v8427 = v8426.data.lyrTxrCache.getLayers(v8423, v8424);
  if (v8427) {
    for (var v8428 = 0; v8428 < v8427.length; v8428++) {
      var v8429 = v8427[v8428];
      var v8430 = v8429.bb;
      if (v8430.w === 0 || v8430.h === 0) {
        continue;
      }
      v8422.drawImage(v8429.canvas, v8430.x1, v8430.y1, v8430.w, v8430.h);
    }
  } else {
    v8426.drawCachedElements(v8422, v8423, v8424, v8425);
  }
};
var CRp$9 = {};
CRp$9.drawEdge = function (v8431, v8432, v8433, v8434 = true, v8435 = true, v8436 = true) {
  var v8437 = this;
  var v8438 = v8432._private.rscratch;
  if (v8436 && !v8432.visible()) {
    return;
  }
  if (v8438.badLine || v8438.allpts == null || isNaN(v8438.allpts[0])) {
    return;
  }
  var v8439;
  if (v8433) {
    v8439 = v8433;
    v8431.translate(-v8439.x1, -v8439.y1);
  }
  var v8440 = v8436 ? v8432.pstyle("opacity").value : 1;
  var v8441 = v8436 ? v8432.pstyle("line-opacity").value : 1;
  var v8442 = v8432.pstyle("curve-style").value;
  var v8443 = v8432.pstyle("line-style").value;
  var v8444 = v8432.pstyle("width").pfValue;
  var v8445 = v8432.pstyle("line-cap").value;
  var v8446 = v8432.pstyle("line-outline-width").value;
  var v8447 = v8432.pstyle("line-outline-color").value;
  var v8448 = v8440 * v8441;
  var v8449 = v8440 * v8441;
  var v8450 = function v8451(v8452 = v8448) {
    if (v8442 === "straight-triangle") {
      v8437.eleStrokeStyle(v8431, v8432, v8452);
      v8437.drawEdgeTrianglePath(v8432, v8431, v8438.allpts);
    } else {
      v8431.lineWidth = v8444;
      v8431.lineCap = v8445;
      v8437.eleStrokeStyle(v8431, v8432, v8452);
      v8437.drawEdgePath(v8432, v8431, v8438.allpts, v8443);
      v8431.lineCap = "butt";
    }
  };
  var v8453 = function v8454(v8455 = v8448) {
    v8431.lineWidth = v8444 + v8446;
    v8431.lineCap = v8445;
    if (v8446 > 0) {
      v8437.colorStrokeStyle(v8431, v8447[0], v8447[1], v8447[2], v8455);
    } else {
      v8431.lineCap = "butt";
      return;
    }
    if (v8442 === "straight-triangle") {
      v8437.drawEdgeTrianglePath(v8432, v8431, v8438.allpts);
    } else {
      v8437.drawEdgePath(v8432, v8431, v8438.allpts, v8443);
      v8431.lineCap = "butt";
    }
  };
  var v8456 = function v8457() {
    if (!v8435) {
      return;
    }
    v8437.drawEdgeOverlay(v8431, v8432);
  };
  var v8458 = function v8459() {
    if (!v8435) {
      return;
    }
    v8437.drawEdgeUnderlay(v8431, v8432);
  };
  var v8460 = function v8461(v8462 = v8449) {
    v8437.drawArrowheads(v8431, v8432, v8462);
  };
  var v8463 = function v8464() {
    v8437.drawElementText(v8431, v8432, null, v8434);
  };
  v8431.lineJoin = "round";
  var v8465 = v8432.pstyle("ghost").value === "yes";
  if (v8465) {
    var v8466 = v8432.pstyle("ghost-offset-x").pfValue;
    var v8467 = v8432.pstyle("ghost-offset-y").pfValue;
    var v8468 = v8432.pstyle("ghost-opacity").value;
    var v8469 = v8448 * v8468;
    v8431.translate(v8466, v8467);
    v8450(v8469);
    v8460(v8469);
    v8431.translate(-v8466, -v8467);
  } else {
    v8453();
  }
  v8458();
  v8450();
  v8460();
  v8456();
  v8463();
  if (v8433) {
    v8431.translate(v8439.x1, v8439.y1);
  }
};
var drawEdgeOverlayUnderlay = function drawEdgeOverlayUnderlay2(v8470) {
  if (!["overlay", "underlay"].includes(v8470)) {
    throw new Error("Invalid state");
  }
  return function (v8471, v8472) {
    if (!v8472.visible()) {
      return;
    }
    var v8473 = v8472.pstyle(`${v8470}-opacity`).value;
    if (v8473 === 0) {
      return;
    }
    var v8474 = this;
    var v8475 = v8474.usePaths();
    var v8476 = v8472._private.rscratch;
    var v8477 = v8472.pstyle(`${v8470}-padding`).pfValue;
    var v8478 = v8477 * 2;
    var v8479 = v8472.pstyle(`${v8470}-color`).value;
    v8471.lineWidth = v8478;
    if (v8476.edgeType === "self" && !v8475) {
      v8471.lineCap = "butt";
    } else {
      v8471.lineCap = "round";
    }
    v8474.colorStrokeStyle(v8471, v8479[0], v8479[1], v8479[2], v8473);
    v8474.drawEdgePath(v8472, v8471, v8476.allpts, "solid");
  };
};
CRp$9.drawEdgeOverlay = drawEdgeOverlayUnderlay("overlay");
CRp$9.drawEdgeUnderlay = drawEdgeOverlayUnderlay("underlay");
CRp$9.drawEdgePath = function (v8480, v8481, v8482, v8483) {
  var v8484 = v8480._private.rscratch;
  var v8485 = v8481;
  var v8486;
  var v8487 = false;
  var v8488 = this.usePaths();
  var v8489 = v8480.pstyle("line-dash-pattern").pfValue;
  var v8490 = v8480.pstyle("line-dash-offset").pfValue;
  if (v8488) {
    var v8491 = v8482.join("$");
    var v8492 = v8484.pathCacheKey && v8484.pathCacheKey === v8491;
    if (v8492) {
      v8486 = v8481 = v8484.pathCache;
      v8487 = true;
    } else {
      v8486 = v8481 = new Path2D();
      v8484.pathCacheKey = v8491;
      v8484.pathCache = v8486;
    }
  }
  if (v8485.setLineDash) {
    switch (v8483) {
      case "dotted":
        v8485.setLineDash([1, 1]);
        break;
      case "dashed":
        v8485.setLineDash(v8489);
        v8485.lineDashOffset = v8490;
        break;
      case "solid":
        v8485.setLineDash([]);
        break;
    }
  }
  if (!v8487 && !v8484.badLine) {
    if (v8481.beginPath) {
      v8481.beginPath();
    }
    v8481.moveTo(v8482[0], v8482[1]);
    switch (v8484.edgeType) {
      case "bezier":
      case "self":
      case "compound":
      case "multibezier":
        for (var v8493 = 2; v8493 + 3 < v8482.length; v8493 += 4) {
          v8481.quadraticCurveTo(v8482[v8493], v8482[v8493 + 1], v8482[v8493 + 2], v8482[v8493 + 3]);
        }
        break;
      case "straight":
      case "haystack":
        for (var v8494 = 2; v8494 + 1 < v8482.length; v8494 += 2) {
          v8481.lineTo(v8482[v8494], v8482[v8494 + 1]);
        }
        break;
      case "segments":
        if (v8484.isRound) {
          var v8495 = _createForOfIteratorHelper(v8484.roundCorners);
          var v8496;
          try {
            for (v8495.s(); !(v8496 = v8495.n()).done;) {
              var v8497 = v8496.value;
              drawPreparedRoundCorner(v8481, v8497);
            }
          } catch (v8498) {
            v8495.e(v8498);
          } finally {
            v8495.f();
          }
          v8481.lineTo(v8482[v8482.length - 2], v8482[v8482.length - 1]);
        } else {
          for (var v8499 = 2; v8499 + 1 < v8482.length; v8499 += 2) {
            v8481.lineTo(v8482[v8499], v8482[v8499 + 1]);
          }
        }
        break;
    }
  }
  v8481 = v8485;
  if (v8488) {
    v8481.stroke(v8486);
  } else {
    v8481.stroke();
  }
  if (v8481.setLineDash) {
    v8481.setLineDash([]);
  }
};
CRp$9.drawEdgeTrianglePath = function (v8500, v8501, v8502) {
  v8501.fillStyle = v8501.strokeStyle;
  var v8503 = v8500.pstyle("width").pfValue;
  for (var v8504 = 0; v8504 + 1 < v8502.length; v8504 += 2) {
    var v8505 = [v8502[v8504 + 2] - v8502[v8504], v8502[v8504 + 3] - v8502[v8504 + 1]];
    var v8506 = Math.sqrt(v8505[0] * v8505[0] + v8505[1] * v8505[1]);
    var v8507 = [v8505[1] / v8506, -v8505[0] / v8506];
    var v8508 = [v8507[0] * v8503 / 2, v8507[1] * v8503 / 2];
    v8501.beginPath();
    v8501.moveTo(v8502[v8504] - v8508[0], v8502[v8504 + 1] - v8508[1]);
    v8501.lineTo(v8502[v8504] + v8508[0], v8502[v8504 + 1] + v8508[1]);
    v8501.lineTo(v8502[v8504 + 2], v8502[v8504 + 3]);
    v8501.closePath();
    v8501.fill();
  }
};
CRp$9.drawArrowheads = function (v8509, v8510, v8511) {
  var v8512 = v8510._private.rscratch;
  var v8513 = v8512.edgeType === "haystack";
  if (!v8513) {
    this.drawArrowhead(v8509, v8510, "source", v8512.arrowStartX, v8512.arrowStartY, v8512.srcArrowAngle, v8511);
  }
  this.drawArrowhead(v8509, v8510, "mid-target", v8512.midX, v8512.midY, v8512.midtgtArrowAngle, v8511);
  this.drawArrowhead(v8509, v8510, "mid-source", v8512.midX, v8512.midY, v8512.midsrcArrowAngle, v8511);
  if (!v8513) {
    this.drawArrowhead(v8509, v8510, "target", v8512.arrowEndX, v8512.arrowEndY, v8512.tgtArrowAngle, v8511);
  }
};
CRp$9.drawArrowhead = function (v8514, v8515, v8516, v8517, v8518, v8519, v8520) {
  if (isNaN(v8517) || v8517 == null || isNaN(v8518) || v8518 == null || isNaN(v8519) || v8519 == null) {
    return;
  }
  var v8521 = this;
  var v8522 = v8515.pstyle(v8516 + "-arrow-shape").value;
  if (v8522 === "none") {
    return;
  }
  var v8523 = v8515.pstyle(v8516 + "-arrow-fill").value === "hollow" ? "both" : "filled";
  var v8524 = v8515.pstyle(v8516 + "-arrow-fill").value;
  var v8525 = v8515.pstyle("width").pfValue;
  var v8526 = v8515.pstyle(v8516 + "-arrow-width");
  var v8527 = v8526.value === "match-line" ? v8525 : v8526.pfValue;
  if (v8526.units === "%") {
    v8527 *= v8525;
  }
  var v8528 = v8515.pstyle("opacity").value;
  if (v8520 === undefined) {
    v8520 = v8528;
  }
  var v8529 = v8514.globalCompositeOperation;
  if (v8520 !== 1 || v8524 === "hollow") {
    v8514.globalCompositeOperation = "destination-out";
    v8521.colorFillStyle(v8514, 255, 255, 255, 1);
    v8521.colorStrokeStyle(v8514, 255, 255, 255, 1);
    v8521.drawArrowShape(v8515, v8514, v8523, v8525, v8522, v8527, v8517, v8518, v8519);
    v8514.globalCompositeOperation = v8529;
  }
  var v8530 = v8515.pstyle(v8516 + "-arrow-color").value;
  v8521.colorFillStyle(v8514, v8530[0], v8530[1], v8530[2], v8520);
  v8521.colorStrokeStyle(v8514, v8530[0], v8530[1], v8530[2], v8520);
  v8521.drawArrowShape(v8515, v8514, v8524, v8525, v8522, v8527, v8517, v8518, v8519);
};
CRp$9.drawArrowShape = function (v8531, v8532, v8533, v8534, v8535, v8536, v8537, v8538, v8539) {
  var v8540 = this;
  var v8541 = this.usePaths() && v8535 !== "triangle-cross";
  var v8542 = false;
  var v8543;
  var v8544 = v8532;
  var v8545 = {
    x: v8537,
    y: v8538
  };
  var v8546 = v8531.pstyle("arrow-scale").value;
  var v8547 = this.getArrowWidth(v8534, v8546);
  var v8548 = v8540.arrowShapes[v8535];
  if (v8541) {
    var v8549 = v8540.arrowPathCache = v8540.arrowPathCache || [];
    var v8550 = hashString(v8535);
    var v8551 = v8549[v8550];
    if (v8551 != null) {
      v8543 = v8532 = v8551;
      v8542 = true;
    } else {
      v8543 = v8532 = new Path2D();
      v8549[v8550] = v8543;
    }
  }
  if (!v8542) {
    if (v8532.beginPath) {
      v8532.beginPath();
    }
    if (v8541) {
      v8548.draw(v8532, 1, 0, {
        x: 0,
        y: 0
      }, 1);
    } else {
      v8548.draw(v8532, v8547, v8539, v8545, v8534);
    }
    if (v8532.closePath) {
      v8532.closePath();
    }
  }
  v8532 = v8544;
  if (v8541) {
    v8532.translate(v8537, v8538);
    v8532.rotate(v8539);
    v8532.scale(v8547, v8547);
  }
  if (v8533 === "filled" || v8533 === "both") {
    if (v8541) {
      v8532.fill(v8543);
    } else {
      v8532.fill();
    }
  }
  if (v8533 === "hollow" || v8533 === "both") {
    v8532.lineWidth = v8536 / (v8541 ? v8547 : 1);
    v8532.lineJoin = "miter";
    if (v8541) {
      v8532.stroke(v8543);
    } else {
      v8532.stroke();
    }
  }
  if (v8541) {
    v8532.scale(1 / v8547, 1 / v8547);
    v8532.rotate(-v8539);
    v8532.translate(-v8537, -v8538);
  }
};
var CRp$8 = {};
CRp$8.safeDrawImage = function (v8552, v8553, v8554, v8555, v8556, v8557, v8558, v8559, v8560, v8561) {
  if (v8556 <= 0 || v8557 <= 0 || v8560 <= 0 || v8561 <= 0) {
    return;
  }
  try {
    v8552.drawImage(v8553, v8554, v8555, v8556, v8557, v8558, v8559, v8560, v8561);
  } catch (v8562) {
    warn(v8562);
  }
};
CRp$8.drawInscribedImage = function (v8563, v8564, v8565, v8566, v8567) {
  var v8568 = this;
  var v8569 = v8565.position();
  var v8570 = v8569.x;
  var v8571 = v8569.y;
  var v8572 = v8565.cy().style();
  var v8573 = v8572.getIndexedStyle.bind(v8572);
  var v8574 = v8573(v8565, "background-fit", "value", v8566);
  var v8575 = v8573(v8565, "background-repeat", "value", v8566);
  var v8576 = v8565.width();
  var v8577 = v8565.height();
  var v8578 = v8565.padding() * 2;
  var v8579 = v8576 + (v8573(v8565, "background-width-relative-to", "value", v8566) === "inner" ? 0 : v8578);
  var v8580 = v8577 + (v8573(v8565, "background-height-relative-to", "value", v8566) === "inner" ? 0 : v8578);
  var v8581 = v8565._private.rscratch;
  var v8582 = v8573(v8565, "background-clip", "value", v8566);
  var v8583 = v8582 === "node";
  var v8584 = v8573(v8565, "background-image-opacity", "value", v8566) * v8567;
  var v8585 = v8573(v8565, "background-image-smoothing", "value", v8566);
  var v8586 = v8565.pstyle("corner-radius").value;
  if (v8586 !== "auto") {
    v8586 = v8565.pstyle("corner-radius").pfValue;
  }
  var v8587 = v8564.width || v8564.cachedW;
  var v8588 = v8564.height || v8564.cachedH;
  if (v8587 == null || v8588 == null) {
    document.body.appendChild(v8564);
    v8587 = v8564.cachedW = v8564.width || v8564.offsetWidth;
    v8588 = v8564.cachedH = v8564.height || v8564.offsetHeight;
    document.body.removeChild(v8564);
  }
  var v8589 = v8587;
  var v8590 = v8588;
  if (v8573(v8565, "background-width", "value", v8566) !== "auto") {
    if (v8573(v8565, "background-width", "units", v8566) === "%") {
      v8589 = v8573(v8565, "background-width", "pfValue", v8566) * v8579;
    } else {
      v8589 = v8573(v8565, "background-width", "pfValue", v8566);
    }
  }
  if (v8573(v8565, "background-height", "value", v8566) !== "auto") {
    if (v8573(v8565, "background-height", "units", v8566) === "%") {
      v8590 = v8573(v8565, "background-height", "pfValue", v8566) * v8580;
    } else {
      v8590 = v8573(v8565, "background-height", "pfValue", v8566);
    }
  }
  if (v8589 === 0 || v8590 === 0) {
    return;
  }
  if (v8574 === "contain") {
    var v8591 = Math.min(v8579 / v8589, v8580 / v8590);
    v8589 *= v8591;
    v8590 *= v8591;
  } else if (v8574 === "cover") {
    var v8591 = Math.max(v8579 / v8589, v8580 / v8590);
    v8589 *= v8591;
    v8590 *= v8591;
  }
  var v8592 = v8570 - v8579 / 2;
  var v8593 = v8573(v8565, "background-position-x", "units", v8566);
  var v8594 = v8573(v8565, "background-position-x", "pfValue", v8566);
  if (v8593 === "%") {
    v8592 += (v8579 - v8589) * v8594;
  } else {
    v8592 += v8594;
  }
  var v8595 = v8573(v8565, "background-offset-x", "units", v8566);
  var v8596 = v8573(v8565, "background-offset-x", "pfValue", v8566);
  if (v8595 === "%") {
    v8592 += (v8579 - v8589) * v8596;
  } else {
    v8592 += v8596;
  }
  var v8597 = v8571 - v8580 / 2;
  var v8598 = v8573(v8565, "background-position-y", "units", v8566);
  var v8599 = v8573(v8565, "background-position-y", "pfValue", v8566);
  if (v8598 === "%") {
    v8597 += (v8580 - v8590) * v8599;
  } else {
    v8597 += v8599;
  }
  var v8600 = v8573(v8565, "background-offset-y", "units", v8566);
  var v8601 = v8573(v8565, "background-offset-y", "pfValue", v8566);
  if (v8600 === "%") {
    v8597 += (v8580 - v8590) * v8601;
  } else {
    v8597 += v8601;
  }
  if (v8581.pathCache) {
    v8592 -= v8570;
    v8597 -= v8571;
    v8570 = 0;
    v8571 = 0;
  }
  var v8602 = v8563.globalAlpha;
  v8563.globalAlpha = v8584;
  var v8603 = v8568.getImgSmoothing(v8563);
  var v8604 = false;
  if (v8585 === "no" && v8603) {
    v8568.setImgSmoothing(v8563, false);
    v8604 = true;
  } else if (v8585 === "yes" && !v8603) {
    v8568.setImgSmoothing(v8563, true);
    v8604 = true;
  }
  if (v8575 === "no-repeat") {
    if (v8583) {
      v8563.save();
      if (v8581.pathCache) {
        v8563.clip(v8581.pathCache);
      } else {
        v8568.nodeShapes[v8568.getNodeShape(v8565)].draw(v8563, v8570, v8571, v8579, v8580, v8586, v8581);
        v8563.clip();
      }
    }
    v8568.safeDrawImage(v8563, v8564, 0, 0, v8587, v8588, v8592, v8597, v8589, v8590);
    if (v8583) {
      v8563.restore();
    }
  } else {
    var v8605 = v8563.createPattern(v8564, v8575);
    v8563.fillStyle = v8605;
    v8568.nodeShapes[v8568.getNodeShape(v8565)].draw(v8563, v8570, v8571, v8579, v8580, v8586, v8581);
    v8563.translate(v8592, v8597);
    v8563.fill();
    v8563.translate(-v8592, -v8597);
  }
  v8563.globalAlpha = v8602;
  if (v8604) {
    v8568.setImgSmoothing(v8563, v8603);
  }
};
var CRp$7 = {};
CRp$7.eleTextBiggerThanMin = function (v8606, v8607) {
  if (!v8607) {
    var v8608 = v8606.cy().zoom();
    var v8609 = this.getPixelRatio();
    var v8610 = Math.ceil(log2(v8608 * v8609));
    v8607 = Math.pow(2, v8610);
  }
  var v8611 = v8606.pstyle("font-size").pfValue * v8607;
  var v8612 = v8606.pstyle("min-zoomed-font-size").pfValue;
  if (v8611 < v8612) {
    return false;
  }
  return true;
};
CRp$7.drawElementText = function (v8613, v8614, v8615, v8616, v8617, v8618 = true) {
  var v8619 = this;
  if (v8616 == null) {
    if (v8618 && !v8619.eleTextBiggerThanMin(v8614)) {
      return;
    }
  } else if (v8616 === false) {
    return;
  }
  if (v8614.isNode()) {
    var v8620 = v8614.pstyle("label");
    if (!v8620 || !v8620.value) {
      return;
    }
    var v8621 = v8619.getLabelJustification(v8614);
    var v8622 = v8614.pstyle("text-metrics").strValue === "glyph";
    v8613.textAlign = v8621;
    v8613.textBaseline = v8622 ? "alphabetic" : "bottom";
  } else {
    var v8623 = v8614.element()._private.rscratch.badLine;
    var v8624 = v8614.pstyle("label");
    var v8625 = v8614.pstyle("source-label");
    var v8626 = v8614.pstyle("target-label");
    if (v8623 || (!v8624 || !v8624.value) && (!v8625 || !v8625.value) && (!v8626 || !v8626.value)) {
      return;
    }
    v8613.textAlign = "center";
    v8613.textBaseline = "bottom";
  }
  var v8627 = !v8615;
  var v8628;
  if (v8615) {
    v8628 = v8615;
    v8613.translate(-v8628.x1, -v8628.y1);
  }
  if (v8617 == null) {
    v8619.drawText(v8613, v8614, null, v8627, v8618);
    if (v8614.isEdge()) {
      v8619.drawText(v8613, v8614, "source", v8627, v8618);
      v8619.drawText(v8613, v8614, "target", v8627, v8618);
    }
  } else {
    v8619.drawText(v8613, v8614, v8617, v8627, v8618);
  }
  if (v8615) {
    v8613.translate(v8628.x1, v8628.y1);
  }
};
CRp$7.getFontCache = function (v8629) {
  var v8630;
  this.fontCaches = this.fontCaches || [];
  for (var v8631 = 0; v8631 < this.fontCaches.length; v8631++) {
    v8630 = this.fontCaches[v8631];
    if (v8630.context === v8629) {
      return v8630;
    }
  }
  v8630 = {
    context: v8629
  };
  this.fontCaches.push(v8630);
  return v8630;
};
CRp$7.setupTextStyle = function (v8632, v8633, v8634 = true) {
  var v8635 = v8633.pstyle("font-style").strValue;
  var v8636 = v8633.pstyle("font-size").pfValue + "px";
  var v8637 = v8633.pstyle("font-family").strValue;
  var v8638 = v8633.pstyle("font-weight").strValue;
  var v8639 = v8634 ? v8633.effectiveOpacity() * v8633.pstyle("text-opacity").value : 1;
  var v8640 = v8633.pstyle("text-outline-opacity").value * v8639;
  var v8641 = v8633.pstyle("color").value;
  var v8642 = v8633.pstyle("text-outline-color").value;
  v8632.font = v8635 + " " + v8638 + " " + v8636 + " " + v8637;
  v8632.lineJoin = "round";
  this.colorFillStyle(v8632, v8641[0], v8641[1], v8641[2], v8639);
  this.colorStrokeStyle(v8632, v8642[0], v8642[1], v8642[2], v8640);
};
function circle(v8643, v8644, v8645, v8646, v8647) {
  var v8648 = Math.min(v8646, v8647);
  var v8649 = v8648 / 2;
  var v8650 = v8644 + v8646 / 2;
  var v8651 = v8645 + v8647 / 2;
  v8643.beginPath();
  v8643.arc(v8650, v8651, v8649, 0, Math.PI * 2);
  v8643.closePath();
}
function roundRect(v8652, v8653, v8654, v8655, v8656, v8657 = 5) {
  var v8658 = Math.min(v8657, v8655 / 2, v8656 / 2);
  v8652.beginPath();
  v8652.moveTo(v8653 + v8658, v8654);
  v8652.lineTo(v8653 + v8655 - v8658, v8654);
  v8652.quadraticCurveTo(v8653 + v8655, v8654, v8653 + v8655, v8654 + v8658);
  v8652.lineTo(v8653 + v8655, v8654 + v8656 - v8658);
  v8652.quadraticCurveTo(v8653 + v8655, v8654 + v8656, v8653 + v8655 - v8658, v8654 + v8656);
  v8652.lineTo(v8653 + v8658, v8654 + v8656);
  v8652.quadraticCurveTo(v8653, v8654 + v8656, v8653, v8654 + v8656 - v8658);
  v8652.lineTo(v8653, v8654 + v8658);
  v8652.quadraticCurveTo(v8653, v8654, v8653 + v8658, v8654);
  v8652.closePath();
}
CRp$7.getTextAngle = function (v8659, v8660) {
  var v8661;
  var v8662 = v8659._private;
  var v8663 = v8662.rscratch;
  var v8664 = v8660 ? v8660 + "-" : "";
  var v8665 = v8659.pstyle(v8664 + "text-rotation");
  if (v8665.strValue === "autorotate") {
    var v8666 = getPrefixedProperty(v8663, "labelAngle", v8660);
    v8661 = v8659.isEdge() ? v8666 : 0;
  } else if (v8665.strValue === "none") {
    v8661 = 0;
  } else {
    v8661 = v8665.pfValue;
  }
  return v8661;
};
CRp$7.drawText = function (v8667, v8668, v8669, v8670 = true, v8671 = true) {
  var v8672 = v8668._private;
  var v8673 = v8672.rscratch;
  var v8674 = v8671 ? v8668.effectiveOpacity() : 1;
  if (v8671 && (v8674 === 0 || v8668.pstyle("text-opacity").value === 0)) {
    return;
  }
  if (v8669 === "main") {
    v8669 = null;
  }
  var v8675 = getPrefixedProperty(v8673, "labelX", v8669);
  var v8676 = getPrefixedProperty(v8673, "labelY", v8669);
  var v8677;
  var v8678;
  var v8679 = this.getLabelText(v8668, v8669);
  if (v8679 != null && v8679 !== "" && !isNaN(v8675) && !isNaN(v8676)) {
    this.setupTextStyle(v8667, v8668, v8671);
    var v8680 = v8669 ? v8669 + "-" : "";
    var v8681 = getPrefixedProperty(v8673, "labelWidth", v8669);
    var v8682 = getPrefixedProperty(v8673, "labelHeight", v8669);
    var v8683 = getPrefixedProperty(v8673, "labelActualDescent", v8669);
    var v8684 = v8668.pstyle(v8680 + "text-margin-x").pfValue;
    var v8685 = v8668.pstyle(v8680 + "text-margin-y").pfValue;
    var v8686 = v8668.isEdge();
    var v8687 = v8668.pstyle("text-halign").value;
    var v8688 = v8668.pstyle("text-valign").value;
    if (v8686) {
      v8687 = "center";
      v8688 = "center";
    }
    v8675 += v8684;
    v8676 += v8685;
    var v8689;
    if (!v8670) {
      v8689 = 0;
    } else {
      v8689 = this.getTextAngle(v8668, v8669);
    }
    if (v8689 !== 0) {
      v8677 = v8675;
      v8678 = v8676;
      v8667.translate(v8677, v8678);
      v8667.rotate(v8689);
      v8675 = 0;
      v8676 = 0;
    }
    var v8690 = labelHalign(v8687);
    var v8691 = labelValign(v8688);
    switch (v8691) {
      case "top":
        break;
      case "center":
        v8676 += v8682 / 2;
        break;
      case "bottom":
        v8676 += v8682;
        break;
    }
    var v8692 = v8668.pstyle("text-background-opacity").value;
    var v8693 = v8668.pstyle("text-border-opacity").value;
    var v8694 = v8668.pstyle("text-border-width").pfValue;
    var v8695 = v8668.pstyle("text-background-padding").pfValue;
    var v8696 = v8668.pstyle("text-background-shape").strValue;
    var v8697 = v8696 === "round-rectangle" || v8696 === "roundrectangle";
    var v8698 = v8696 === "circle";
    var v8699 = 2;
    if (v8692 > 0 || v8694 > 0 && v8693 > 0) {
      var v8700 = v8667.fillStyle;
      var v8701 = v8667.strokeStyle;
      var v8702 = v8667.lineWidth;
      var v8703 = v8668.pstyle("text-background-color").value;
      var v8704 = v8668.pstyle("text-border-color").value;
      var v8705 = v8668.pstyle("text-border-style").value;
      var v8706 = v8692 > 0;
      var v8707 = v8694 > 0 && v8693 > 0;
      var v8708 = v8675 - v8695;
      switch (v8690) {
        case "left":
          v8708 -= v8681;
          break;
        case "center":
          v8708 -= v8681 / 2;
          break;
      }
      var v8709 = v8676 - v8682 - v8695;
      var v8710 = v8681 + v8695 * 2;
      var v8711 = v8682 + v8695 * 2;
      if (v8706) {
        v8667.fillStyle = `rgba(${v8703[0]},${v8703[1]},${v8703[2]},${v8692 * v8674})`;
      }
      if (v8707) {
        v8667.strokeStyle = `rgba(${v8704[0]},${v8704[1]},${v8704[2]},${v8693 * v8674})`;
        v8667.lineWidth = v8694;
        if (v8667.setLineDash) {
          switch (v8705) {
            case "dotted":
              v8667.setLineDash([1, 1]);
              break;
            case "dashed":
              v8667.setLineDash([4, 2]);
              break;
            case "double":
              v8667.lineWidth = v8694 / 4;
              v8667.setLineDash([]);
              break;
            case "solid":
            default:
              v8667.setLineDash([]);
              break;
          }
        }
      }
      if (v8697) {
        v8667.beginPath();
        roundRect(v8667, v8708, v8709, v8710, v8711, v8699);
      } else if (v8698) {
        v8667.beginPath();
        circle(v8667, v8708, v8709, v8710, v8711);
      } else {
        v8667.beginPath();
        v8667.rect(v8708, v8709, v8710, v8711);
      }
      if (v8706) {
        v8667.fill();
      }
      if (v8707) {
        v8667.stroke();
      }
      if (v8707 && v8705 === "double") {
        var v8712 = v8694 / 2;
        v8667.beginPath();
        if (v8697) {
          roundRect(v8667, v8708 + v8712, v8709 + v8712, v8710 - v8712 * 2, v8711 - v8712 * 2, v8699);
        } else {
          v8667.rect(v8708 + v8712, v8709 + v8712, v8710 - v8712 * 2, v8711 - v8712 * 2);
        }
        v8667.stroke();
      }
      v8667.fillStyle = v8700;
      v8667.strokeStyle = v8701;
      v8667.lineWidth = v8702;
      if (v8667.setLineDash) {
        v8667.setLineDash([]);
      }
    }
    var v8713 = v8668.pstyle("text-outline-width").pfValue * 2;
    if (v8713 > 0) {
      v8667.lineWidth = v8713;
    }
    v8676 -= v8683;
    if (v8668.pstyle("text-wrap").value === "wrap") {
      var v8714 = getPrefixedProperty(v8673, "labelWrapCachedLines", v8669);
      var v8715 = getPrefixedProperty(v8673, "labelLineHeight", v8669);
      var v8716 = v8681 / 2;
      var v8717 = this.getLabelJustification(v8668);
      if (v8717 === "auto") ;else if (v8690 === "left") {
        if (v8717 === "left") {
          v8675 += -v8681;
        } else if (v8717 === "center") {
          v8675 += -v8716;
        }
      } else if (v8690 === "center") {
        if (v8717 === "left") {
          v8675 += -v8716;
        } else if (v8717 === "right") {
          v8675 += v8716;
        }
      } else if (v8690 === "right") {
        if (v8717 === "center") {
          v8675 += v8716;
        } else if (v8717 === "right") {
          v8675 += v8681;
        }
      }
      switch (v8691) {
        case "top":
          v8676 -= (v8714.length - 1) * v8715;
          break;
        case "center":
        case "bottom":
          v8676 -= (v8714.length - 1) * v8715;
          break;
      }
      for (var v8718 = 0; v8718 < v8714.length; v8718++) {
        if (v8713 > 0) {
          v8667.strokeText(v8714[v8718], v8675, v8676);
        }
        v8667.fillText(v8714[v8718], v8675, v8676);
        v8676 += v8715;
      }
    } else {
      if (v8713 > 0) {
        v8667.strokeText(v8679, v8675, v8676);
      }
      v8667.fillText(v8679, v8675, v8676);
    }
    if (v8689 !== 0) {
      v8667.rotate(-v8689);
      v8667.translate(-v8677, -v8678);
    }
  }
};
var CRp$6 = {};
CRp$6.drawNode = function (v8719, v8720, v8721, v8722 = true, v8723 = true, v8724 = true) {
  var v8725 = this;
  var v8726;
  var v8727;
  var v8728 = v8720._private;
  var v8729 = v8728.rscratch;
  var v8730 = v8720.position();
  if (!number$1(v8730.x) || !number$1(v8730.y)) {
    return;
  }
  if (v8724 && !v8720.visible()) {
    return;
  }
  var v8731 = v8724 ? v8720.effectiveOpacity() : 1;
  var v8732 = v8725.usePaths();
  var v8733;
  var v8734 = false;
  var v8735 = v8720.padding();
  v8726 = v8720.width() + v8735 * 2;
  v8727 = v8720.height() + v8735 * 2;
  var v8736;
  if (v8721) {
    v8736 = v8721;
    v8719.translate(-v8736.x1, -v8736.y1);
  }
  var v8737 = v8720.pstyle("background-image");
  var v8738 = v8737.value;
  var v8739 = new Array(v8738.length);
  var v8740 = new Array(v8738.length);
  var v8741 = 0;
  for (var v8742 = 0; v8742 < v8738.length; v8742++) {
    var v8743 = v8738[v8742];
    var v8744 = v8739[v8742] = v8743 != null && v8743 !== "none";
    if (v8744) {
      var v8745 = v8720.cy().style().getIndexedStyle(v8720, "background-image-crossorigin", "value", v8742);
      v8741++;
      v8740[v8742] = v8725.getCachedImage(v8743, v8745, function () {
        v8728.backgroundTimestamp = Date.now();
        v8720.emitAndNotify("background");
      });
    }
  }
  var v8746 = v8720.pstyle("background-blacken").value;
  var v8747 = v8720.pstyle("border-width").pfValue;
  var v8748 = v8720.pstyle("background-opacity").value * v8731;
  var v8749 = v8720.pstyle("border-color").value;
  var v8750 = v8720.pstyle("border-style").value;
  var v8751 = v8720.pstyle("border-join").value;
  var v8752 = v8720.pstyle("border-cap").value;
  var v8753 = v8720.pstyle("border-position").value;
  var v8754 = v8720.pstyle("border-dash-pattern").pfValue;
  var v8755 = v8720.pstyle("border-dash-offset").pfValue;
  var v8756 = v8720.pstyle("border-opacity").value * v8731;
  var v8757 = v8720.pstyle("outline-width").pfValue;
  var v8758 = v8720.pstyle("outline-color").value;
  var v8759 = v8720.pstyle("outline-style").value;
  var v8760 = v8720.pstyle("outline-opacity").value * v8731;
  var v8761 = v8720.pstyle("outline-offset").value;
  var v8762 = v8720.pstyle("corner-radius").value;
  if (v8762 !== "auto") {
    v8762 = v8720.pstyle("corner-radius").pfValue;
  }
  var v8763 = function v8764(v8765 = v8748) {
    v8725.eleFillStyle(v8719, v8720, v8765);
  };
  var v8766 = function v8767(v8768 = v8756) {
    v8725.colorStrokeStyle(v8719, v8749[0], v8749[1], v8749[2], v8768);
  };
  var v8769 = function v8770(v8771 = v8760) {
    v8725.colorStrokeStyle(v8719, v8758[0], v8758[1], v8758[2], v8771);
  };
  var v8772 = function v8773(v8774, v8775, v8776, v8777) {
    var v8778 = v8725.nodePathCache = v8725.nodePathCache || [];
    var v8779 = hashStrings(v8776 === "polygon" ? v8776 + "," + v8777.join(",") : v8776, "" + v8775, "" + v8774, "" + v8762);
    var v8780 = v8778[v8779];
    var v8781;
    var v8782 = false;
    if (v8780 != null) {
      v8781 = v8780;
      v8782 = true;
      v8729.pathCache = v8781;
    } else {
      v8781 = new Path2D();
      v8778[v8779] = v8729.pathCache = v8781;
    }
    return {
      path: v8781,
      cacheHit: v8782
    };
  };
  var v8783 = v8720.pstyle("shape").strValue;
  var v8784 = v8720.pstyle("shape-polygon-points").pfValue;
  if (v8732) {
    v8719.translate(v8730.x, v8730.y);
    var v8785 = v8772(v8726, v8727, v8783, v8784);
    v8733 = v8785.path;
    v8734 = v8785.cacheHit;
  }
  var v8786 = function v8787() {
    if (!v8734) {
      var v8788 = v8730;
      if (v8732) {
        v8788 = {
          x: 0,
          y: 0
        };
      }
      v8725.nodeShapes[v8725.getNodeShape(v8720)].draw(v8733 || v8719, v8788.x, v8788.y, v8726, v8727, v8762, v8729);
    }
    if (v8732) {
      v8719.fill(v8733);
    } else {
      v8719.fill();
    }
  };
  var v8789 = function v8790(v8791 = v8731, v8792 = true) {
    var v8793 = v8728.backgrounding;
    var v8794 = 0;
    for (var v8795 = 0; v8795 < v8740.length; v8795++) {
      var v8796 = v8720.cy().style().getIndexedStyle(v8720, "background-image-containment", "value", v8795);
      if (v8792 && v8796 === "over" || !v8792 && v8796 === "inside") {
        v8794++;
        continue;
      }
      if (v8739[v8795] && v8740[v8795].complete && !v8740[v8795].error) {
        v8794++;
        v8725.drawInscribedImage(v8719, v8740[v8795], v8720, v8795, v8791);
      }
    }
    v8728.backgrounding = v8794 !== v8741;
    if (v8793 !== v8728.backgrounding) {
      v8720.updateStyle(false);
    }
  };
  var v8797 = function v8798(v8799 = false, v8800 = v8731) {
    if (v8725.hasPie(v8720)) {
      v8725.drawPie(v8719, v8720, v8800);
      if (v8799) {
        if (!v8732) {
          v8725.nodeShapes[v8725.getNodeShape(v8720)].draw(v8719, v8730.x, v8730.y, v8726, v8727, v8762, v8729);
        }
      }
    }
  };
  var v8801 = function v8802(v8803 = false, v8804 = v8731) {
    if (v8725.hasStripe(v8720)) {
      v8719.save();
      if (v8732) {
        v8719.clip(v8729.pathCache);
      } else {
        v8725.nodeShapes[v8725.getNodeShape(v8720)].draw(v8719, v8730.x, v8730.y, v8726, v8727, v8762, v8729);
        v8719.clip();
      }
      v8725.drawStripe(v8719, v8720, v8804);
      v8719.restore();
      if (v8803) {
        if (!v8732) {
          v8725.nodeShapes[v8725.getNodeShape(v8720)].draw(v8719, v8730.x, v8730.y, v8726, v8727, v8762, v8729);
        }
      }
    }
  };
  var v8805 = function v8806(v8807 = v8731) {
    var v8808 = (v8746 > 0 ? v8746 : -v8746) * v8807;
    var v8809 = v8746 > 0 ? 0 : 255;
    if (v8746 !== 0) {
      v8725.colorFillStyle(v8719, v8809, v8809, v8809, v8808);
      if (v8732) {
        v8719.fill(v8733);
      } else {
        v8719.fill();
      }
    }
  };
  var v8810 = function v8811() {
    if (v8747 > 0) {
      v8719.lineWidth = v8747;
      v8719.lineCap = v8752;
      v8719.lineJoin = v8751;
      if (v8719.setLineDash) {
        switch (v8750) {
          case "dotted":
            v8719.setLineDash([1, 1]);
            break;
          case "dashed":
            v8719.setLineDash(v8754);
            v8719.lineDashOffset = v8755;
            break;
          case "solid":
          case "double":
            v8719.setLineDash([]);
            break;
        }
      }
      if (v8753 !== "center") {
        v8719.save();
        v8719.lineWidth *= 2;
        if (v8753 === "inside") {
          if (v8732) {
            v8719.clip(v8733);
          } else {
            v8719.clip();
          }
        } else {
          var v8812 = new Path2D();
          v8812.rect(-v8726 / 2 - v8747, -v8727 / 2 - v8747, v8726 + v8747 * 2, v8727 + v8747 * 2);
          v8812.addPath(v8733);
          v8719.clip(v8812, "evenodd");
        }
        if (v8732) {
          v8719.stroke(v8733);
        } else {
          v8719.stroke();
        }
        v8719.restore();
      } else if (v8732) {
        v8719.stroke(v8733);
      } else {
        v8719.stroke();
      }
      if (v8750 === "double") {
        v8719.lineWidth = v8747 / 3;
        var v8813 = v8719.globalCompositeOperation;
        v8719.globalCompositeOperation = "destination-out";
        if (v8732) {
          v8719.stroke(v8733);
        } else {
          v8719.stroke();
        }
        v8719.globalCompositeOperation = v8813;
      }
      if (v8719.setLineDash) {
        v8719.setLineDash([]);
      }
    }
  };
  var v8814 = function v8815() {
    if (v8757 > 0) {
      v8719.lineWidth = v8757;
      v8719.lineCap = "butt";
      if (v8719.setLineDash) {
        switch (v8759) {
          case "dotted":
            v8719.setLineDash([1, 1]);
            break;
          case "dashed":
            v8719.setLineDash([4, 2]);
            break;
          case "solid":
          case "double":
            v8719.setLineDash([]);
            break;
        }
      }
      var v8816 = v8730;
      if (v8732) {
        v8816 = {
          x: 0,
          y: 0
        };
      }
      var v8817 = v8725.getNodeShape(v8720);
      var v8818 = v8747;
      if (v8753 === "inside") {
        v8818 = 0;
      }
      if (v8753 === "outside") {
        v8818 *= 2;
      }
      var v8819 = (v8726 + v8818 + (v8757 + v8761)) / v8726;
      var v8820 = (v8727 + v8818 + (v8757 + v8761)) / v8727;
      var v8821 = v8726 * v8819;
      var v8822 = v8727 * v8820;
      var v8823 = v8725.nodeShapes[v8817].points;
      var v8824;
      if (v8732) {
        var v8825 = v8772(v8821, v8822, v8817, v8823);
        v8824 = v8825.path;
      }
      if (v8817 === "ellipse") {
        v8725.drawEllipsePath(v8824 || v8719, v8816.x, v8816.y, v8821, v8822);
      } else if (["round-diamond", "round-heptagon", "round-hexagon", "round-octagon", "round-pentagon", "round-polygon", "round-triangle", "round-tag"].includes(v8817)) {
        var v8826 = 0;
        var v8827 = 0;
        var v8828 = 0;
        if (v8817 === "round-diamond") {
          v8826 = (v8818 + v8761 + v8757) * 1.4;
        } else if (v8817 === "round-heptagon") {
          v8826 = (v8818 + v8761 + v8757) * 1.075;
          v8828 = -(v8818 / 2 + v8761 + v8757) / 35;
        } else if (v8817 === "round-hexagon") {
          v8826 = (v8818 + v8761 + v8757) * 1.12;
        } else if (v8817 === "round-pentagon") {
          v8826 = (v8818 + v8761 + v8757) * 1.13;
          v8828 = -(v8818 / 2 + v8761 + v8757) / 15;
        } else if (v8817 === "round-tag") {
          v8826 = (v8818 + v8761 + v8757) * 1.12;
          v8827 = (v8818 / 2 + v8757 + v8761) * 0.07;
        } else if (v8817 === "round-triangle") {
          v8826 = (v8818 + v8761 + v8757) * (Math.PI / 2);
          v8828 = -(v8818 + v8761 / 2 + v8757) / Math.PI;
        }
        if (v8826 !== 0) {
          v8819 = (v8726 + v8826) / v8726;
          v8821 = v8726 * v8819;
          if (!["round-hexagon", "round-tag"].includes(v8817)) {
            v8820 = (v8727 + v8826) / v8727;
            v8822 = v8727 * v8820;
          }
        }
        v8762 = v8762 === "auto" ? getRoundPolygonRadius(v8821, v8822) : v8762;
        var v8829 = v8821 / 2;
        var v8830 = v8822 / 2;
        var v8831 = v8762 + (v8818 + v8757 + v8761) / 2;
        var v8832 = new Array(v8823.length / 2);
        var v8833 = new Array(v8823.length / 2);
        for (var v8834 = 0; v8834 < v8823.length / 2; v8834++) {
          v8832[v8834] = {
            x: v8816.x + v8827 + v8829 * v8823[v8834 * 2],
            y: v8816.y + v8828 + v8830 * v8823[v8834 * 2 + 1]
          };
        }
        var v8835;
        var v8836;
        var v8837;
        var v8838;
        var v8839 = v8832.length;
        v8836 = v8832[v8839 - 1];
        for (v8835 = 0; v8835 < v8839; v8835++) {
          v8837 = v8832[v8835 % v8839];
          v8838 = v8832[(v8835 + 1) % v8839];
          v8833[v8835] = getRoundCorner(v8836, v8837, v8838, v8831);
          v8836 = v8837;
          v8837 = v8838;
        }
        v8725.drawRoundPolygonPath(v8824 || v8719, v8816.x + v8827, v8816.y + v8828, v8726 * v8819, v8727 * v8820, v8823, v8833);
      } else if (["roundrectangle", "round-rectangle"].includes(v8817)) {
        v8762 = v8762 === "auto" ? getRoundRectangleRadius(v8821, v8822) : v8762;
        v8725.drawRoundRectanglePath(v8824 || v8719, v8816.x, v8816.y, v8821, v8822, v8762 + (v8818 + v8757 + v8761) / 2);
      } else if (["cutrectangle", "cut-rectangle"].includes(v8817)) {
        v8762 = v8762 === "auto" ? getCutRectangleCornerLength() : v8762;
        v8725.drawCutRectanglePath(v8824 || v8719, v8816.x, v8816.y, v8821, v8822, null, v8762 + (v8818 + v8757 + v8761) / 4);
      } else if (["bottomroundrectangle", "bottom-round-rectangle"].includes(v8817)) {
        v8762 = v8762 === "auto" ? getRoundRectangleRadius(v8821, v8822) : v8762;
        v8725.drawBottomRoundRectanglePath(v8824 || v8719, v8816.x, v8816.y, v8821, v8822, v8762 + (v8818 + v8757 + v8761) / 2);
      } else if (v8817 === "barrel") {
        v8725.drawBarrelPath(v8824 || v8719, v8816.x, v8816.y, v8821, v8822);
      } else if (v8817.startsWith("polygon") || ["rhomboid", "right-rhomboid", "round-tag", "tag", "vee"].includes(v8817)) {
        var v8840 = (v8818 + v8757 + v8761) / v8726;
        v8823 = joinLines(expandPolygon(v8823, v8840));
        v8725.drawPolygonPath(v8824 || v8719, v8816.x, v8816.y, v8726, v8727, v8823);
      } else {
        var v8841 = (v8818 + v8757 + v8761) / v8726;
        v8823 = joinLines(expandPolygon(v8823, -v8841));
        v8725.drawPolygonPath(v8824 || v8719, v8816.x, v8816.y, v8726, v8727, v8823);
      }
      if (v8732) {
        v8719.stroke(v8824);
      } else {
        v8719.stroke();
      }
      if (v8759 === "double") {
        v8719.lineWidth = v8818 / 3;
        var v8842 = v8719.globalCompositeOperation;
        v8719.globalCompositeOperation = "destination-out";
        if (v8732) {
          v8719.stroke(v8824);
        } else {
          v8719.stroke();
        }
        v8719.globalCompositeOperation = v8842;
      }
      if (v8719.setLineDash) {
        v8719.setLineDash([]);
      }
    }
  };
  var v8843 = function v8844() {
    if (v8723) {
      v8725.drawNodeOverlay(v8719, v8720, v8730, v8726, v8727);
    }
  };
  var v8845 = function v8846() {
    if (v8723) {
      v8725.drawNodeUnderlay(v8719, v8720, v8730, v8726, v8727);
    }
  };
  var v8847 = function v8848() {
    v8725.drawElementText(v8719, v8720, null, v8722);
  };
  var v8849 = v8720.pstyle("ghost").value === "yes";
  if (v8849) {
    var v8850 = v8720.pstyle("ghost-offset-x").pfValue;
    var v8851 = v8720.pstyle("ghost-offset-y").pfValue;
    var v8852 = v8720.pstyle("ghost-opacity").value;
    var v8853 = v8852 * v8731;
    v8719.translate(v8850, v8851);
    v8769();
    v8814();
    v8763(v8852 * v8748);
    v8786();
    v8789(v8853, true);
    v8766(v8852 * v8756);
    v8810();
    v8797(v8746 !== 0 || v8747 !== 0);
    v8801(v8746 !== 0 || v8747 !== 0);
    v8789(v8853, false);
    v8805(v8853);
    v8719.translate(-v8850, -v8851);
  }
  if (v8732) {
    v8719.translate(-v8730.x, -v8730.y);
  }
  v8845();
  if (v8732) {
    v8719.translate(v8730.x, v8730.y);
  }
  v8769();
  v8814();
  v8763();
  v8786();
  v8789(v8731, true);
  v8766();
  v8810();
  v8797(v8746 !== 0 || v8747 !== 0);
  v8801(v8746 !== 0 || v8747 !== 0);
  v8789(v8731, false);
  v8805();
  if (v8732) {
    v8719.translate(-v8730.x, -v8730.y);
  }
  v8847();
  v8843();
  if (v8721) {
    v8719.translate(v8736.x1, v8736.y1);
  }
};
var drawNodeOverlayUnderlay = function drawNodeOverlayUnderlay2(v8854) {
  if (!["overlay", "underlay"].includes(v8854)) {
    throw new Error("Invalid state");
  }
  return function (v8855, v8856, v8857, v8858, v8859) {
    var v8860 = this;
    if (!v8856.visible()) {
      return;
    }
    var v8861 = v8856.pstyle(`${v8854}-padding`).pfValue;
    var v8862 = v8856.pstyle(`${v8854}-opacity`).value;
    var v8863 = v8856.pstyle(`${v8854}-color`).value;
    var v8864 = v8856.pstyle(`${v8854}-shape`).value;
    var v8865 = v8856.pstyle(`${v8854}-corner-radius`).value;
    if (v8862 > 0) {
      v8857 = v8857 || v8856.position();
      if (v8858 == null || v8859 == null) {
        var v8866 = v8856.padding();
        v8858 = v8856.width() + v8866 * 2;
        v8859 = v8856.height() + v8866 * 2;
      }
      v8860.colorFillStyle(v8855, v8863[0], v8863[1], v8863[2], v8862);
      v8860.nodeShapes[v8864].draw(v8855, v8857.x, v8857.y, v8858 + v8861 * 2, v8859 + v8861 * 2, v8865);
      v8855.fill();
    }
  };
};
CRp$6.drawNodeOverlay = drawNodeOverlayUnderlay("overlay");
CRp$6.drawNodeUnderlay = drawNodeOverlayUnderlay("underlay");
CRp$6.hasPie = function (v8867) {
  v8867 = v8867[0];
  return v8867._private.hasPie;
};
CRp$6.hasStripe = function (v8868) {
  v8868 = v8868[0];
  return v8868._private.hasStripe;
};
CRp$6.drawPie = function (v8869, v8870, v8871, v8872) {
  v8870 = v8870[0];
  v8872 = v8872 || v8870.position();
  var v8873 = v8870.cy().style();
  var v8874 = v8870.pstyle("pie-size");
  var v8875 = v8870.pstyle("pie-hole");
  var v8876 = v8870.pstyle("pie-start-angle").pfValue;
  var v8877 = v8872.x;
  var v8878 = v8872.y;
  var v8879 = v8870.width();
  var v8880 = v8870.height();
  var v8881 = Math.min(v8879, v8880) / 2;
  var v8882;
  var v8883 = 0;
  var v8884 = this.usePaths();
  if (v8884) {
    v8877 = 0;
    v8878 = 0;
  }
  if (v8874.units === "%") {
    v8881 = v8881 * v8874.pfValue;
  } else if (v8874.pfValue !== undefined) {
    v8881 = v8874.pfValue / 2;
  }
  if (v8875.units === "%") {
    v8882 = v8881 * v8875.pfValue;
  } else if (v8875.pfValue !== undefined) {
    v8882 = v8875.pfValue / 2;
  }
  if (v8882 >= v8881) {
    return;
  }
  for (var v8885 = 1; v8885 <= v8873.pieBackgroundN; v8885++) {
    var v8886 = v8870.pstyle("pie-" + v8885 + "-background-size").value;
    var v8887 = v8870.pstyle("pie-" + v8885 + "-background-color").value;
    var v8888 = v8870.pstyle("pie-" + v8885 + "-background-opacity").value * v8871;
    var v8889 = v8886 / 100;
    if (v8889 + v8883 > 1) {
      v8889 = 1 - v8883;
    }
    var v8890 = Math.PI * 1.5 + Math.PI * 2 * v8883;
    v8890 += v8876;
    var v8891 = Math.PI * 2 * v8889;
    var v8892 = v8890 + v8891;
    if (v8886 === 0 || v8883 >= 1 || v8883 + v8889 > 1) {
      continue;
    }
    if (v8882 === 0) {
      v8869.beginPath();
      v8869.moveTo(v8877, v8878);
      v8869.arc(v8877, v8878, v8881, v8890, v8892);
      v8869.closePath();
    } else {
      v8869.beginPath();
      v8869.arc(v8877, v8878, v8881, v8890, v8892);
      v8869.arc(v8877, v8878, v8882, v8892, v8890, true);
      v8869.closePath();
    }
    this.colorFillStyle(v8869, v8887[0], v8887[1], v8887[2], v8888);
    v8869.fill();
    v8883 += v8889;
  }
};
CRp$6.drawStripe = function (v8893, v8894, v8895, v8896) {
  v8894 = v8894[0];
  v8896 = v8896 || v8894.position();
  var v8897 = v8894.cy().style();
  var v8898 = v8896.x;
  var v8899 = v8896.y;
  var v8900 = v8894.width();
  var v8901 = v8894.height();
  var v8902 = 0;
  var v8903 = this.usePaths();
  v8893.save();
  var v8904 = v8894.pstyle("stripe-direction").value;
  var v8905 = v8894.pstyle("stripe-size");
  switch (v8904) {
    case "vertical":
      break;
    case "righward":
      v8893.rotate(-Math.PI / 2);
      break;
  }
  var v8906 = v8900;
  var v8907 = v8901;
  if (v8905.units === "%") {
    v8906 = v8906 * v8905.pfValue;
    v8907 = v8907 * v8905.pfValue;
  } else if (v8905.pfValue !== undefined) {
    v8906 = v8905.pfValue;
    v8907 = v8905.pfValue;
  }
  if (v8903) {
    v8898 = 0;
    v8899 = 0;
  }
  v8899 -= v8906 / 2;
  v8898 -= v8907 / 2;
  for (var v8908 = 1; v8908 <= v8897.stripeBackgroundN; v8908++) {
    var v8909 = v8894.pstyle("stripe-" + v8908 + "-background-size").value;
    var v8910 = v8894.pstyle("stripe-" + v8908 + "-background-color").value;
    var v8911 = v8894.pstyle("stripe-" + v8908 + "-background-opacity").value * v8895;
    var v8912 = v8909 / 100;
    if (v8912 + v8902 > 1) {
      v8912 = 1 - v8902;
    }
    if (v8909 === 0 || v8902 >= 1 || v8902 + v8912 > 1) {
      continue;
    }
    v8893.beginPath();
    v8893.rect(v8898, v8899 + v8907 * v8902, v8906, v8907 * v8912);
    v8893.closePath();
    this.colorFillStyle(v8893, v8910[0], v8910[1], v8910[2], v8911);
    v8893.fill();
    v8902 += v8912;
  }
  v8893.restore();
};
var CRp$5 = {};
var motionBlurDelay = 100;
CRp$5.getPixelRatio = function () {
  var v8913 = this.data.contexts[0];
  if (this.forcedPixelRatio != null) {
    return this.forcedPixelRatio;
  }
  var v8914 = this.cy.window();
  var v8915 = v8913.backingStorePixelRatio || v8913.webkitBackingStorePixelRatio || v8913.mozBackingStorePixelRatio || v8913.msBackingStorePixelRatio || v8913.oBackingStorePixelRatio || v8913.backingStorePixelRatio || 1;
  return (v8914.devicePixelRatio || 1) / v8915;
};
CRp$5.paintCache = function (v8916) {
  var v8917 = this.paintCaches = this.paintCaches || [];
  var v8918 = true;
  var v8919;
  for (var v8920 = 0; v8920 < v8917.length; v8920++) {
    v8919 = v8917[v8920];
    if (v8919.context === v8916) {
      v8918 = false;
      break;
    }
  }
  if (v8918) {
    v8919 = {
      context: v8916
    };
    v8917.push(v8919);
  }
  return v8919;
};
CRp$5.createGradientStyleFor = function (v8921, v8922, v8923, v8924, v8925) {
  var v8926;
  var v8927 = this.usePaths();
  var v8928 = v8923.pstyle(v8922 + "-gradient-stop-colors").value;
  var v8929 = v8923.pstyle(v8922 + "-gradient-stop-positions").pfValue;
  if (v8924 === "radial-gradient") {
    if (v8923.isEdge()) {
      var v8930 = v8923.sourceEndpoint();
      var v8931 = v8923.targetEndpoint();
      var v8932 = v8923.midpoint();
      var v8933 = dist(v8930, v8932);
      var v8934 = dist(v8931, v8932);
      v8926 = v8921.createRadialGradient(v8932.x, v8932.y, 0, v8932.x, v8932.y, Math.max(v8933, v8934));
    } else {
      var v8935 = v8927 ? {
        x: 0,
        y: 0
      } : v8923.position();
      var v8936 = v8923.paddedWidth();
      var v8937 = v8923.paddedHeight();
      v8926 = v8921.createRadialGradient(v8935.x, v8935.y, 0, v8935.x, v8935.y, Math.max(v8936, v8937));
    }
  } else if (v8923.isEdge()) {
    var v8938 = v8923.sourceEndpoint();
    var v8939 = v8923.targetEndpoint();
    v8926 = v8921.createLinearGradient(v8938.x, v8938.y, v8939.x, v8939.y);
  } else {
    var v8940 = v8927 ? {
      x: 0,
      y: 0
    } : v8923.position();
    var v8941 = v8923.paddedWidth();
    var v8942 = v8923.paddedHeight();
    var v8943 = v8941 / 2;
    var v8944 = v8942 / 2;
    var v8945 = v8923.pstyle("background-gradient-direction").value;
    switch (v8945) {
      case "to-bottom":
        v8926 = v8921.createLinearGradient(v8940.x, v8940.y - v8944, v8940.x, v8940.y + v8944);
        break;
      case "to-top":
        v8926 = v8921.createLinearGradient(v8940.x, v8940.y + v8944, v8940.x, v8940.y - v8944);
        break;
      case "to-left":
        v8926 = v8921.createLinearGradient(v8940.x + v8943, v8940.y, v8940.x - v8943, v8940.y);
        break;
      case "to-right":
        v8926 = v8921.createLinearGradient(v8940.x - v8943, v8940.y, v8940.x + v8943, v8940.y);
        break;
      case "to-bottom-right":
      case "to-right-bottom":
        v8926 = v8921.createLinearGradient(v8940.x - v8943, v8940.y - v8944, v8940.x + v8943, v8940.y + v8944);
        break;
      case "to-top-right":
      case "to-right-top":
        v8926 = v8921.createLinearGradient(v8940.x - v8943, v8940.y + v8944, v8940.x + v8943, v8940.y - v8944);
        break;
      case "to-bottom-left":
      case "to-left-bottom":
        v8926 = v8921.createLinearGradient(v8940.x + v8943, v8940.y - v8944, v8940.x - v8943, v8940.y + v8944);
        break;
      case "to-top-left":
      case "to-left-top":
        v8926 = v8921.createLinearGradient(v8940.x + v8943, v8940.y + v8944, v8940.x - v8943, v8940.y - v8944);
        break;
    }
  }
  if (!v8926) {
    return null;
  }
  var v8946 = v8929.length === v8928.length;
  var v8947 = v8928.length;
  for (var v8948 = 0; v8948 < v8947; v8948++) {
    v8926.addColorStop(v8946 ? v8929[v8948] : v8948 / (v8947 - 1), "rgba(" + v8928[v8948][0] + "," + v8928[v8948][1] + "," + v8928[v8948][2] + "," + v8925 + ")");
  }
  return v8926;
};
CRp$5.gradientFillStyle = function (v8949, v8950, v8951, v8952) {
  var v8953 = this.createGradientStyleFor(v8949, "background", v8950, v8951, v8952);
  if (!v8953) {
    return null;
  }
  v8949.fillStyle = v8953;
};
CRp$5.colorFillStyle = function (v8954, v8955, v8956, v8957, v8958) {
  v8954.fillStyle = "rgba(" + v8955 + "," + v8956 + "," + v8957 + "," + v8958 + ")";
};
CRp$5.eleFillStyle = function (v8959, v8960, v8961) {
  var v8962 = v8960.pstyle("background-fill").value;
  if (v8962 === "linear-gradient" || v8962 === "radial-gradient") {
    this.gradientFillStyle(v8959, v8960, v8962, v8961);
  } else {
    var v8963 = v8960.pstyle("background-color").value;
    this.colorFillStyle(v8959, v8963[0], v8963[1], v8963[2], v8961);
  }
};
CRp$5.gradientStrokeStyle = function (v8964, v8965, v8966, v8967) {
  var v8968 = this.createGradientStyleFor(v8964, "line", v8965, v8966, v8967);
  if (!v8968) {
    return null;
  }
  v8964.strokeStyle = v8968;
};
CRp$5.colorStrokeStyle = function (v8969, v8970, v8971, v8972, v8973) {
  v8969.strokeStyle = "rgba(" + v8970 + "," + v8971 + "," + v8972 + "," + v8973 + ")";
};
CRp$5.eleStrokeStyle = function (v8974, v8975, v8976) {
  var v8977 = v8975.pstyle("line-fill").value;
  if (v8977 === "linear-gradient" || v8977 === "radial-gradient") {
    this.gradientStrokeStyle(v8974, v8975, v8977, v8976);
  } else {
    var v8978 = v8975.pstyle("line-color").value;
    this.colorStrokeStyle(v8974, v8978[0], v8978[1], v8978[2], v8976);
  }
};
CRp$5.matchCanvasSize = function (v8979) {
  var v8980 = this;
  var v8981 = v8980.data;
  var v8982 = v8980.findContainerClientCoords();
  var v8983 = v8982[2];
  var v8984 = v8982[3];
  var v8985 = v8980.getPixelRatio();
  var v8986 = v8980.motionBlurPxRatio;
  if (v8979 === v8980.data.bufferCanvases[v8980.MOTIONBLUR_BUFFER_NODE] || v8979 === v8980.data.bufferCanvases[v8980.MOTIONBLUR_BUFFER_DRAG]) {
    v8985 = v8986;
  }
  var v8987 = v8983 * v8985;
  var v8988 = v8984 * v8985;
  var v8989;
  if (v8987 === v8980.canvasWidth && v8988 === v8980.canvasHeight) {
    return;
  }
  v8980.fontCaches = null;
  var v8990 = v8981.canvasContainer;
  v8990.style.width = v8983 + "px";
  v8990.style.height = v8984 + "px";
  for (var v8991 = 0; v8991 < v8980.CANVAS_LAYERS; v8991++) {
    v8989 = v8981.canvases[v8991];
    v8989.width = v8987;
    v8989.height = v8988;
    v8989.style.width = v8983 + "px";
    v8989.style.height = v8984 + "px";
  }
  for (var v8991 = 0; v8991 < v8980.BUFFER_COUNT; v8991++) {
    v8989 = v8981.bufferCanvases[v8991];
    v8989.width = v8987;
    v8989.height = v8988;
    v8989.style.width = v8983 + "px";
    v8989.style.height = v8984 + "px";
  }
  v8980.textureMult = 1;
  if (v8985 <= 1) {
    v8989 = v8981.bufferCanvases[v8980.TEXTURE_BUFFER];
    v8980.textureMult = 2;
    v8989.width = v8987 * v8980.textureMult;
    v8989.height = v8988 * v8980.textureMult;
  }
  v8980.canvasWidth = v8987;
  v8980.canvasHeight = v8988;
  v8980.pixelRatio = v8985;
};
CRp$5.renderTo = function (v8992, v8993, v8994, v8995) {
  this.render({
    forcedContext: v8992,
    forcedZoom: v8993,
    forcedPan: v8994,
    drawAllLayers: true,
    forcedPxRatio: v8995
  });
};
CRp$5.clearCanvas = function () {
  var v8996 = this;
  var v8997 = v8996.data;
  function v8998(v8999) {
    v8999.clearRect(0, 0, v8996.canvasWidth, v8996.canvasHeight);
  }
  v8998(v8997.contexts[v8996.NODE]);
  v8998(v8997.contexts[v8996.DRAG]);
};
CRp$5.render = function (v9000) {
  var v9001 = this;
  v9000 = v9000 || staticEmptyObject();
  var v9002 = v9001.cy;
  var v9003 = v9000.forcedContext;
  var v9004 = v9000.drawAllLayers;
  var v9005 = v9000.drawOnlyNodeLayer;
  var v9006 = v9000.forcedZoom;
  var v9007 = v9000.forcedPan;
  var v9008 = v9000.forcedPxRatio === undefined ? this.getPixelRatio() : v9000.forcedPxRatio;
  var v9009 = v9001.data;
  var v9010 = v9009.canvasNeedsRedraw;
  var v9011 = v9001.textureOnViewport && !v9003 && (v9001.pinching || v9001.hoverData.dragging || v9001.swipePanning || v9001.data.wheelZooming);
  var v9012 = v9000.motionBlur !== undefined ? v9000.motionBlur : v9001.motionBlur;
  var v9013 = v9001.motionBlurPxRatio;
  var v9014 = v9002.hasCompoundNodes();
  var v9015 = v9001.hoverData.draggingEles;
  var v9016 = v9001.hoverData.selecting || v9001.touchData.selecting ? true : false;
  v9012 = v9012 && !v9003 && v9001.motionBlurEnabled && !v9016;
  var v9017 = v9012;
  if (!v9003) {
    if (v9001.prevPxRatio !== v9008) {
      v9001.invalidateContainerClientCoordsCache();
      v9001.matchCanvasSize(v9001.container);
      v9001.redrawHint("eles", true);
      v9001.redrawHint("drag", true);
    }
    v9001.prevPxRatio = v9008;
  }
  if (!v9003 && v9001.motionBlurTimeout) {
    clearTimeout(v9001.motionBlurTimeout);
  }
  if (v9012) {
    if (v9001.mbFrames == null) {
      v9001.mbFrames = 0;
    }
    v9001.mbFrames++;
    if (v9001.mbFrames < 3) {
      v9017 = false;
    }
    if (v9001.mbFrames > v9001.minMbLowQualFrames) {
      v9001.motionBlurPxRatio = v9001.mbPxRBlurry;
    }
  }
  if (v9001.clearingMotionBlur) {
    v9001.motionBlurPxRatio = 1;
  }
  if (v9001.textureDrawLastFrame && !v9011) {
    v9010[v9001.NODE] = true;
    v9010[v9001.SELECT_BOX] = true;
  }
  var v9018 = v9002.style();
  var v9019 = v9002.zoom();
  var v9020 = v9006 !== undefined ? v9006 : v9019;
  var v9021 = v9002.pan();
  var v9022 = {
    x: v9021.x,
    y: v9021.y
  };
  var v9023 = {
    zoom: v9019,
    pan: {
      x: v9021.x,
      y: v9021.y
    }
  };
  var v9024 = v9001.prevViewport;
  var v9025 = v9024 === undefined || v9023.zoom !== v9024.zoom || v9023.pan.x !== v9024.pan.x || v9023.pan.y !== v9024.pan.y;
  if (!v9025 && (!v9015 || !!v9014)) {
    v9001.motionBlurPxRatio = 1;
  }
  if (v9007) {
    v9022 = v9007;
  }
  v9020 *= v9008;
  v9022.x *= v9008;
  v9022.y *= v9008;
  var v9026 = v9001.getCachedZSortedEles();
  function v9027(v9028, v9029, v9030, v9031, v9032) {
    var v9033 = v9028.globalCompositeOperation;
    v9028.globalCompositeOperation = "destination-out";
    v9001.colorFillStyle(v9028, 255, 255, 255, v9001.motionBlurTransparency);
    v9028.fillRect(v9029, v9030, v9031, v9032);
    v9028.globalCompositeOperation = v9033;
  }
  function v9034(v9035, v9036) {
    var v9037;
    var v9038;
    var v9039;
    var v9040;
    if (!v9001.clearingMotionBlur && (v9035 === v9009.bufferContexts[v9001.MOTIONBLUR_BUFFER_NODE] || v9035 === v9009.bufferContexts[v9001.MOTIONBLUR_BUFFER_DRAG])) {
      v9037 = {
        x: v9021.x * v9013,
        y: v9021.y * v9013
      };
      v9038 = v9019 * v9013;
      v9039 = v9001.canvasWidth * v9013;
      v9040 = v9001.canvasHeight * v9013;
    } else {
      v9037 = v9022;
      v9038 = v9020;
      v9039 = v9001.canvasWidth;
      v9040 = v9001.canvasHeight;
    }
    v9035.setTransform(1, 0, 0, 1, 0, 0);
    if (v9036 === "motionBlur") {
      v9027(v9035, 0, 0, v9039, v9040);
    } else if (!v9003 && (v9036 === undefined || v9036)) {
      v9035.clearRect(0, 0, v9039, v9040);
    }
    if (!v9004) {
      v9035.translate(v9037.x, v9037.y);
      v9035.scale(v9038, v9038);
    }
    if (v9007) {
      v9035.translate(v9007.x, v9007.y);
    }
    if (v9006) {
      v9035.scale(v9006, v9006);
    }
  }
  if (!v9011) {
    v9001.textureDrawLastFrame = false;
  }
  if (v9011) {
    v9001.textureDrawLastFrame = true;
    if (!v9001.textureCache) {
      v9001.textureCache = {};
      v9001.textureCache.bb = v9002.mutableElements().boundingBox();
      v9001.textureCache.texture = v9001.data.bufferCanvases[v9001.TEXTURE_BUFFER];
      var v9041 = v9001.data.bufferContexts[v9001.TEXTURE_BUFFER];
      v9041.setTransform(1, 0, 0, 1, 0, 0);
      v9041.clearRect(0, 0, v9001.canvasWidth * v9001.textureMult, v9001.canvasHeight * v9001.textureMult);
      v9001.render({
        forcedContext: v9041,
        drawOnlyNodeLayer: true,
        forcedPxRatio: v9008 * v9001.textureMult
      });
      var v9023 = v9001.textureCache.viewport = {
        zoom: v9002.zoom(),
        pan: v9002.pan(),
        width: v9001.canvasWidth,
        height: v9001.canvasHeight
      };
      v9023.mpan = {
        x: (0 - v9023.pan.x) / v9023.zoom,
        y: (0 - v9023.pan.y) / v9023.zoom
      };
    }
    v9010[v9001.DRAG] = false;
    v9010[v9001.NODE] = false;
    var v9042 = v9009.contexts[v9001.NODE];
    var v9043 = v9001.textureCache.texture;
    var v9023 = v9001.textureCache.viewport;
    v9042.setTransform(1, 0, 0, 1, 0, 0);
    if (v9012) {
      v9027(v9042, 0, 0, v9023.width, v9023.height);
    } else {
      v9042.clearRect(0, 0, v9023.width, v9023.height);
    }
    var v9044 = v9018.core("outside-texture-bg-color").value;
    var v9045 = v9018.core("outside-texture-bg-opacity").value;
    v9001.colorFillStyle(v9042, v9044[0], v9044[1], v9044[2], v9045);
    v9042.fillRect(0, 0, v9023.width, v9023.height);
    var v9019 = v9002.zoom();
    v9034(v9042, false);
    v9042.clearRect(v9023.mpan.x, v9023.mpan.y, v9023.width / v9023.zoom / v9008, v9023.height / v9023.zoom / v9008);
    v9042.drawImage(v9043, v9023.mpan.x, v9023.mpan.y, v9023.width / v9023.zoom / v9008, v9023.height / v9023.zoom / v9008);
  } else if (v9001.textureOnViewport && !v9003) {
    v9001.textureCache = null;
  }
  var v9046 = v9002.extent();
  var v9047 = v9001.pinching || v9001.hoverData.dragging || v9001.swipePanning || v9001.data.wheelZooming || v9001.hoverData.draggingEles || v9001.cy.animated();
  var v9048 = v9001.hideEdgesOnViewport && v9047;
  var v9049 = [];
  v9049[v9001.NODE] = !v9010[v9001.NODE] && v9012 && !v9001.clearedForMotionBlur[v9001.NODE] || v9001.clearingMotionBlur;
  if (v9049[v9001.NODE]) {
    v9001.clearedForMotionBlur[v9001.NODE] = true;
  }
  v9049[v9001.DRAG] = !v9010[v9001.DRAG] && v9012 && !v9001.clearedForMotionBlur[v9001.DRAG] || v9001.clearingMotionBlur;
  if (v9049[v9001.DRAG]) {
    v9001.clearedForMotionBlur[v9001.DRAG] = true;
  }
  if (v9010[v9001.NODE] || v9004 || v9005 || v9049[v9001.NODE]) {
    var v9050 = v9012 && !v9049[v9001.NODE] && v9013 !== 1;
    var v9042 = v9003 || (v9050 ? v9001.data.bufferContexts[v9001.MOTIONBLUR_BUFFER_NODE] : v9009.contexts[v9001.NODE]);
    var v9051 = v9012 && !v9050 ? "motionBlur" : undefined;
    v9034(v9042, v9051);
    if (v9048) {
      v9001.drawCachedNodes(v9042, v9026.nondrag, v9008, v9046);
    } else {
      v9001.drawLayeredElements(v9042, v9026.nondrag, v9008, v9046);
    }
    if (v9001.debug) {
      v9001.drawDebugPoints(v9042, v9026.nondrag);
    }
    if (!v9004 && !v9012) {
      v9010[v9001.NODE] = false;
    }
  }
  if (!v9005 && (v9010[v9001.DRAG] || v9004 || v9049[v9001.DRAG])) {
    var v9050 = v9012 && !v9049[v9001.DRAG] && v9013 !== 1;
    var v9042 = v9003 || (v9050 ? v9001.data.bufferContexts[v9001.MOTIONBLUR_BUFFER_DRAG] : v9009.contexts[v9001.DRAG]);
    v9034(v9042, v9012 && !v9050 ? "motionBlur" : undefined);
    if (v9048) {
      v9001.drawCachedNodes(v9042, v9026.drag, v9008, v9046);
    } else {
      v9001.drawCachedElements(v9042, v9026.drag, v9008, v9046);
    }
    if (v9001.debug) {
      v9001.drawDebugPoints(v9042, v9026.drag);
    }
    if (!v9004 && !v9012) {
      v9010[v9001.DRAG] = false;
    }
  }
  this.drawSelectionRectangle(v9000, v9034);
  if (v9012 && v9013 !== 1) {
    var v9052 = v9009.contexts[v9001.NODE];
    var v9053 = v9001.data.bufferCanvases[v9001.MOTIONBLUR_BUFFER_NODE];
    var v9054 = v9009.contexts[v9001.DRAG];
    var v9055 = v9001.data.bufferCanvases[v9001.MOTIONBLUR_BUFFER_DRAG];
    var v9056 = function v9057(v9058, v9059, v9060) {
      v9058.setTransform(1, 0, 0, 1, 0, 0);
      if (v9060 || !v9017) {
        v9058.clearRect(0, 0, v9001.canvasWidth, v9001.canvasHeight);
      } else {
        v9027(v9058, 0, 0, v9001.canvasWidth, v9001.canvasHeight);
      }
      var v9061 = v9013;
      v9058.drawImage(v9059, 0, 0, v9001.canvasWidth * v9061, v9001.canvasHeight * v9061, 0, 0, v9001.canvasWidth, v9001.canvasHeight);
    };
    if (v9010[v9001.NODE] || v9049[v9001.NODE]) {
      v9056(v9052, v9053, v9049[v9001.NODE]);
      v9010[v9001.NODE] = false;
    }
    if (v9010[v9001.DRAG] || v9049[v9001.DRAG]) {
      v9056(v9054, v9055, v9049[v9001.DRAG]);
      v9010[v9001.DRAG] = false;
    }
  }
  v9001.prevViewport = v9023;
  if (v9001.clearingMotionBlur) {
    v9001.clearingMotionBlur = false;
    v9001.motionBlurCleared = true;
    v9001.motionBlur = true;
  }
  if (v9012) {
    v9001.motionBlurTimeout = setTimeout(function () {
      v9001.motionBlurTimeout = null;
      v9001.clearedForMotionBlur[v9001.NODE] = false;
      v9001.clearedForMotionBlur[v9001.DRAG] = false;
      v9001.motionBlur = false;
      v9001.clearingMotionBlur = !v9011;
      v9001.mbFrames = 0;
      v9010[v9001.NODE] = true;
      v9010[v9001.DRAG] = true;
      v9001.redraw();
    }, motionBlurDelay);
  }
  if (!v9003) {
    v9002.emit("render");
  }
};
var fpsHeight;
CRp$5.drawSelectionRectangle = function (v9062, v9063) {
  var v9064 = this;
  var v9065 = v9064.cy;
  var v9066 = v9064.data;
  var v9067 = v9065.style();
  var v9068 = v9062.drawOnlyNodeLayer;
  var v9069 = v9062.drawAllLayers;
  var v9070 = v9066.canvasNeedsRedraw;
  var v9071 = v9062.forcedContext;
  if (v9064.showFps || !v9068 && v9070[v9064.SELECT_BOX] && !v9069) {
    var v9072 = v9071 || v9066.contexts[v9064.SELECT_BOX];
    v9063(v9072);
    if (v9064.selection[4] == 1 && (v9064.hoverData.selecting || v9064.touchData.selecting)) {
      var v9073 = v9064.cy.zoom();
      var v9074 = v9067.core("selection-box-border-width").value / v9073;
      v9072.lineWidth = v9074;
      v9072.fillStyle = "rgba(" + v9067.core("selection-box-color").value[0] + "," + v9067.core("selection-box-color").value[1] + "," + v9067.core("selection-box-color").value[2] + "," + v9067.core("selection-box-opacity").value + ")";
      v9072.fillRect(v9064.selection[0], v9064.selection[1], v9064.selection[2] - v9064.selection[0], v9064.selection[3] - v9064.selection[1]);
      if (v9074 > 0) {
        v9072.strokeStyle = "rgba(" + v9067.core("selection-box-border-color").value[0] + "," + v9067.core("selection-box-border-color").value[1] + "," + v9067.core("selection-box-border-color").value[2] + "," + v9067.core("selection-box-opacity").value + ")";
        v9072.strokeRect(v9064.selection[0], v9064.selection[1], v9064.selection[2] - v9064.selection[0], v9064.selection[3] - v9064.selection[1]);
      }
    }
    if (v9066.bgActivePosistion && !v9064.hoverData.selecting) {
      var v9073 = v9064.cy.zoom();
      var v9075 = v9066.bgActivePosistion;
      v9072.fillStyle = "rgba(" + v9067.core("active-bg-color").value[0] + "," + v9067.core("active-bg-color").value[1] + "," + v9067.core("active-bg-color").value[2] + "," + v9067.core("active-bg-opacity").value + ")";
      v9072.beginPath();
      v9072.arc(v9075.x, v9075.y, v9067.core("active-bg-size").pfValue / v9073, 0, Math.PI * 2);
      v9072.fill();
    }
    var v9076 = v9064.lastRedrawTime;
    if (v9064.showFps && v9076) {
      v9076 = Math.round(v9076);
      var v9077 = Math.round(1000 / v9076);
      var v9078 = "1 frame = " + v9076 + " ms = " + v9077 + " fps";
      v9072.setTransform(1, 0, 0, 1, 0, 0);
      v9072.fillStyle = "rgba(255, 0, 0, 0.75)";
      v9072.strokeStyle = "rgba(255, 0, 0, 0.75)";
      v9072.font = "30px Arial";
      if (!fpsHeight) {
        var v9079 = v9072.measureText(v9078);
        fpsHeight = v9079.actualBoundingBoxAscent;
      }
      v9072.fillText(v9078, 0, fpsHeight);
      var v9080 = 60;
      v9072.strokeRect(0, fpsHeight + 10, 250, 20);
      v9072.fillRect(0, fpsHeight + 10, Math.min(v9077 / v9080, 1) * 250, 20);
    }
    if (!v9069) {
      v9070[v9064.SELECT_BOX] = false;
    }
  }
};
function compileShader(v9081, v9082, v9083) {
  var v9084 = v9081.createShader(v9082);
  v9081.shaderSource(v9084, v9083);
  v9081.compileShader(v9084);
  if (!v9081.getShaderParameter(v9084, v9081.COMPILE_STATUS)) {
    throw new Error(v9081.getShaderInfoLog(v9084));
  }
  return v9084;
}
function createProgram(v9085, v9086, v9087) {
  var v9088 = compileShader(v9085, v9085.VERTEX_SHADER, v9086);
  var v9089 = compileShader(v9085, v9085.FRAGMENT_SHADER, v9087);
  var v9090 = v9085.createProgram();
  v9085.attachShader(v9090, v9088);
  v9085.attachShader(v9090, v9089);
  v9085.linkProgram(v9090);
  if (!v9085.getProgramParameter(v9090, v9085.LINK_STATUS)) {
    throw new Error("Could not initialize shaders");
  }
  return v9090;
}
function createTextureCanvas(v9091, v9092, v9093 = v9092) {
  var v9094 = v9091.makeOffscreenCanvas(v9092, v9093);
  var v9095 = v9094.context = v9094.getContext("2d");
  v9094.clear = function () {
    return v9095.clearRect(0, 0, v9094.width, v9094.height);
  };
  v9094.clear();
  return v9094;
}
function getEffectivePanZoom(v9096) {
  var v9097 = v9096.pixelRatio;
  var v9098 = v9096.cy.zoom();
  var v9099 = v9096.cy.pan();
  return {
    zoom: v9098 * v9097,
    pan: {
      x: v9099.x * v9097,
      y: v9099.y * v9097
    }
  };
}
function getEffectiveZoom(v9100) {
  var v9101 = v9100.pixelRatio;
  var v9102 = v9100.cy.zoom();
  return v9102 * v9101;
}
function modelToRenderedPosition2(v9103, v9104, v9105, v9106, v9107) {
  var v9108 = v9106 * v9105 + v9104.x;
  var v9109 = v9107 * v9105 + v9104.y;
  v9109 = Math.round(v9103.canvasHeight - v9109);
  return [v9108, v9109];
}
function isSimpleShape(v9110, v9111) {
  if (v9111.picking) {
    return true;
  } else {
    if (v9110.pstyle("background-fill").value !== "solid") {
      return false;
    }
    if (v9110.pstyle("background-image").strValue !== "none") {
      return false;
    }
    if (v9110.pstyle("border-width").value === 0) {
      return true;
    }
    if (v9110.pstyle("border-opacity").value === 0) {
      return true;
    }
    if (v9110.pstyle("border-style").value !== "solid") {
      return false;
    }
    return true;
  }
}
function arrayEqual(v9112, v9113) {
  if (v9112.length !== v9113.length) {
    return false;
  }
  for (var v9114 = 0; v9114 < v9112.length; v9114++) {
    if (v9112[v9114] !== v9113[v9114]) {
      return false;
    }
  }
  return true;
}
function toWebGLColor(v9115, v9116, v9117) {
  var v9118 = v9115[0] / 255;
  var v9119 = v9115[1] / 255;
  var v9120 = v9115[2] / 255;
  var v9121 = v9116;
  var v9122 = v9117 || new Array(4);
  v9122[0] = v9118 * v9121;
  v9122[1] = v9119 * v9121;
  v9122[2] = v9120 * v9121;
  v9122[3] = v9121;
  return v9122;
}
function indexToVec4(v9123, v9124) {
  var v9125 = v9124 || new Array(4);
  v9125[0] = (v9123 >> 0 & 255) / 255;
  v9125[1] = (v9123 >> 8 & 255) / 255;
  v9125[2] = (v9123 >> 16 & 255) / 255;
  v9125[3] = (v9123 >> 24 & 255) / 255;
  return v9125;
}
function vec4ToIndex(v9126) {
  return v9126[0] + (v9126[1] << 8) + (v9126[2] << 16) + (v9126[3] << 24);
}
function createTexture(v9127, v9128) {
  var v9129 = v9127.createTexture();
  v9129.buffer = function (v9130) {
    v9127.bindTexture(v9127.TEXTURE_2D, v9129);
    v9127.texParameteri(v9127.TEXTURE_2D, v9127.TEXTURE_WRAP_S, v9127.CLAMP_TO_EDGE);
    v9127.texParameteri(v9127.TEXTURE_2D, v9127.TEXTURE_WRAP_T, v9127.CLAMP_TO_EDGE);
    v9127.texParameteri(v9127.TEXTURE_2D, v9127.TEXTURE_MAG_FILTER, v9127.LINEAR);
    v9127.texParameteri(v9127.TEXTURE_2D, v9127.TEXTURE_MIN_FILTER, v9127.LINEAR_MIPMAP_NEAREST);
    v9127.pixelStorei(v9127.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    v9127.texImage2D(v9127.TEXTURE_2D, 0, v9127.RGBA, v9127.RGBA, v9127.UNSIGNED_BYTE, v9130);
    v9127.generateMipmap(v9127.TEXTURE_2D);
    v9127.bindTexture(v9127.TEXTURE_2D, null);
  };
  v9129.deleteTexture = function () {
    v9127.deleteTexture(v9129);
  };
  return v9129;
}
function getTypeInfo(v9131, v9132) {
  switch (v9132) {
    case "float":
      return [1, v9131.FLOAT, 4];
    case "vec2":
      return [2, v9131.FLOAT, 4];
    case "vec3":
      return [3, v9131.FLOAT, 4];
    case "vec4":
      return [4, v9131.FLOAT, 4];
    case "int":
      return [1, v9131.INT, 4];
    case "ivec2":
      return [2, v9131.INT, 4];
  }
}
function createTypedArray(v9133, v9134, v9135) {
  switch (v9134) {
    case v9133.FLOAT:
      return new Float32Array(v9135);
    case v9133.INT:
      return new Int32Array(v9135);
  }
}
function createTypedArrayView(v9136, v9137, v9138, v9139, v9140, v9141) {
  switch (v9137) {
    case v9136.FLOAT:
      return new Float32Array(v9138.buffer, v9141 * v9139, v9140);
    case v9136.INT:
      return new Int32Array(v9138.buffer, v9141 * v9139, v9140);
  }
}
function createBufferStaticDraw(v9142, v9143, v9144, v9145) {
  var v9146 = getTypeInfo(v9142, v9143);
  var v9147 = _slicedToArray(v9146, 2);
  var v9148 = v9147[0];
  var v9149 = v9147[1];
  var v9150 = createTypedArray(v9142, v9149, v9145);
  var v9151 = v9142.createBuffer();
  v9142.bindBuffer(v9142.ARRAY_BUFFER, v9151);
  v9142.bufferData(v9142.ARRAY_BUFFER, v9150, v9142.STATIC_DRAW);
  if (v9149 === v9142.FLOAT) {
    v9142.vertexAttribPointer(v9144, v9148, v9149, false, 0, 0);
  } else if (v9149 === v9142.INT) {
    v9142.vertexAttribIPointer(v9144, v9148, v9149, 0, 0);
  }
  v9142.enableVertexAttribArray(v9144);
  v9142.bindBuffer(v9142.ARRAY_BUFFER, null);
  return v9151;
}
function createBufferDynamicDraw(v9152, v9153, v9154, v9155) {
  var v9156 = getTypeInfo(v9152, v9154);
  var v9157 = _slicedToArray(v9156, 3);
  var v9158 = v9157[0];
  var v9159 = v9157[1];
  var v9160 = v9157[2];
  var v9161 = createTypedArray(v9152, v9159, v9153 * v9158);
  var v9162 = v9158 * v9160;
  var v9163 = v9152.createBuffer();
  v9152.bindBuffer(v9152.ARRAY_BUFFER, v9163);
  v9152.bufferData(v9152.ARRAY_BUFFER, v9153 * v9162, v9152.DYNAMIC_DRAW);
  v9152.enableVertexAttribArray(v9155);
  if (v9159 === v9152.FLOAT) {
    v9152.vertexAttribPointer(v9155, v9158, v9159, false, v9162, 0);
  } else if (v9159 === v9152.INT) {
    v9152.vertexAttribIPointer(v9155, v9158, v9159, v9162, 0);
  }
  v9152.vertexAttribDivisor(v9155, 1);
  v9152.bindBuffer(v9152.ARRAY_BUFFER, null);
  var v9164 = new Array(v9153);
  for (var v9165 = 0; v9165 < v9153; v9165++) {
    v9164[v9165] = createTypedArrayView(v9152, v9159, v9161, v9162, v9158, v9165);
  }
  v9163.dataArray = v9161;
  v9163.stride = v9162;
  v9163.size = v9158;
  v9163.getView = function (v9166) {
    return v9164[v9166];
  };
  v9163.setPoint = function (v9167, v9168, v9169) {
    var v9170 = v9164[v9167];
    v9170[0] = v9168;
    v9170[1] = v9169;
  };
  v9163.bufferSubData = function (v9171) {
    v9152.bindBuffer(v9152.ARRAY_BUFFER, v9163);
    if (v9171) {
      v9152.bufferSubData(v9152.ARRAY_BUFFER, 0, v9161, 0, v9171 * v9158);
    } else {
      v9152.bufferSubData(v9152.ARRAY_BUFFER, 0, v9161);
    }
  };
  return v9163;
}
function create3x3MatrixBufferDynamicDraw(v9172, v9173, v9174) {
  var v9175 = 9;
  var v9176 = new Float32Array(v9173 * v9175);
  var v9177 = new Array(v9173);
  for (var v9178 = 0; v9178 < v9173; v9178++) {
    var v9179 = v9178 * v9175 * 4;
    v9177[v9178] = new Float32Array(v9176.buffer, v9179, v9175);
  }
  var v9180 = v9172.createBuffer();
  v9172.bindBuffer(v9172.ARRAY_BUFFER, v9180);
  v9172.bufferData(v9172.ARRAY_BUFFER, v9176.byteLength, v9172.DYNAMIC_DRAW);
  for (var v9181 = 0; v9181 < 3; v9181++) {
    var v9182 = v9174 + v9181;
    v9172.enableVertexAttribArray(v9182);
    v9172.vertexAttribPointer(v9182, 3, v9172.FLOAT, false, 36, v9181 * 12);
    v9172.vertexAttribDivisor(v9182, 1);
  }
  v9172.bindBuffer(v9172.ARRAY_BUFFER, null);
  v9180.getMatrixView = function (v9183) {
    return v9177[v9183];
  };
  v9180.setData = function (v9184, v9185) {
    v9177[v9185].set(v9184, 0);
  };
  v9180.bufferSubData = function () {
    v9172.bindBuffer(v9172.ARRAY_BUFFER, v9180);
    v9172.bufferSubData(v9172.ARRAY_BUFFER, 0, v9176);
  };
  return v9180;
}
function createPickingFrameBuffer(v9186) {
  var v9187 = v9186.createFramebuffer();
  v9186.bindFramebuffer(v9186.FRAMEBUFFER, v9187);
  var v9188 = v9186.createTexture();
  v9186.bindTexture(v9186.TEXTURE_2D, v9188);
  v9186.texParameteri(v9186.TEXTURE_2D, v9186.TEXTURE_MIN_FILTER, v9186.LINEAR);
  v9186.texParameteri(v9186.TEXTURE_2D, v9186.TEXTURE_WRAP_S, v9186.CLAMP_TO_EDGE);
  v9186.texParameteri(v9186.TEXTURE_2D, v9186.TEXTURE_WRAP_T, v9186.CLAMP_TO_EDGE);
  v9186.framebufferTexture2D(v9186.FRAMEBUFFER, v9186.COLOR_ATTACHMENT0, v9186.TEXTURE_2D, v9188, 0);
  v9186.bindFramebuffer(v9186.FRAMEBUFFER, null);
  v9187.setFramebufferAttachmentSizes = function (v9189, v9190) {
    v9186.bindTexture(v9186.TEXTURE_2D, v9188);
    v9186.texImage2D(v9186.TEXTURE_2D, 0, v9186.RGBA, v9189, v9190, 0, v9186.RGBA, v9186.UNSIGNED_BYTE, null);
  };
  return v9187;
}
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
if (!Math.hypot) {
  Math.hypot = function () {
    var v9191 = 0;
    var v9192 = arguments.length;
    while (v9192--) {
      v9191 += arguments[v9192] * arguments[v9192];
    }
    return Math.sqrt(v9191);
  };
}
function create() {
  var v9193 = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    v9193[1] = 0;
    v9193[2] = 0;
    v9193[3] = 0;
    v9193[5] = 0;
    v9193[6] = 0;
    v9193[7] = 0;
  }
  v9193[0] = 1;
  v9193[4] = 1;
  v9193[8] = 1;
  return v9193;
}
function identity2(v9194) {
  v9194[0] = 1;
  v9194[1] = 0;
  v9194[2] = 0;
  v9194[3] = 0;
  v9194[4] = 1;
  v9194[5] = 0;
  v9194[6] = 0;
  v9194[7] = 0;
  v9194[8] = 1;
  return v9194;
}
function multiply(v9195, v9196, v9197) {
  var v9198 = v9196[0];
  var v9199 = v9196[1];
  var v9200 = v9196[2];
  var v9201 = v9196[3];
  var v9202 = v9196[4];
  var v9203 = v9196[5];
  var v9204 = v9196[6];
  var v9205 = v9196[7];
  var v9206 = v9196[8];
  var v9207 = v9197[0];
  var v9208 = v9197[1];
  var v9209 = v9197[2];
  var v9210 = v9197[3];
  var v9211 = v9197[4];
  var v9212 = v9197[5];
  var v9213 = v9197[6];
  var v9214 = v9197[7];
  var v9215 = v9197[8];
  v9195[0] = v9207 * v9198 + v9208 * v9201 + v9209 * v9204;
  v9195[1] = v9207 * v9199 + v9208 * v9202 + v9209 * v9205;
  v9195[2] = v9207 * v9200 + v9208 * v9203 + v9209 * v9206;
  v9195[3] = v9210 * v9198 + v9211 * v9201 + v9212 * v9204;
  v9195[4] = v9210 * v9199 + v9211 * v9202 + v9212 * v9205;
  v9195[5] = v9210 * v9200 + v9211 * v9203 + v9212 * v9206;
  v9195[6] = v9213 * v9198 + v9214 * v9201 + v9215 * v9204;
  v9195[7] = v9213 * v9199 + v9214 * v9202 + v9215 * v9205;
  v9195[8] = v9213 * v9200 + v9214 * v9203 + v9215 * v9206;
  return v9195;
}
function translate(v9216, v9217, v9218) {
  var v9219 = v9217[0];
  var v9220 = v9217[1];
  var v9221 = v9217[2];
  var v9222 = v9217[3];
  var v9223 = v9217[4];
  var v9224 = v9217[5];
  var v9225 = v9217[6];
  var v9226 = v9217[7];
  var v9227 = v9217[8];
  var v9228 = v9218[0];
  var v9229 = v9218[1];
  v9216[0] = v9219;
  v9216[1] = v9220;
  v9216[2] = v9221;
  v9216[3] = v9222;
  v9216[4] = v9223;
  v9216[5] = v9224;
  v9216[6] = v9228 * v9219 + v9229 * v9222 + v9225;
  v9216[7] = v9228 * v9220 + v9229 * v9223 + v9226;
  v9216[8] = v9228 * v9221 + v9229 * v9224 + v9227;
  return v9216;
}
function rotate(v9230, v9231, v9232) {
  var v9233 = v9231[0];
  var v9234 = v9231[1];
  var v9235 = v9231[2];
  var v9236 = v9231[3];
  var v9237 = v9231[4];
  var v9238 = v9231[5];
  var v9239 = v9231[6];
  var v9240 = v9231[7];
  var v9241 = v9231[8];
  var v9242 = Math.sin(v9232);
  var v9243 = Math.cos(v9232);
  v9230[0] = v9243 * v9233 + v9242 * v9236;
  v9230[1] = v9243 * v9234 + v9242 * v9237;
  v9230[2] = v9243 * v9235 + v9242 * v9238;
  v9230[3] = v9243 * v9236 - v9242 * v9233;
  v9230[4] = v9243 * v9237 - v9242 * v9234;
  v9230[5] = v9243 * v9238 - v9242 * v9235;
  v9230[6] = v9239;
  v9230[7] = v9240;
  v9230[8] = v9241;
  return v9230;
}
function scale(v9244, v9245, v9246) {
  var v9247 = v9246[0];
  var v9248 = v9246[1];
  v9244[0] = v9247 * v9245[0];
  v9244[1] = v9247 * v9245[1];
  v9244[2] = v9247 * v9245[2];
  v9244[3] = v9248 * v9245[3];
  v9244[4] = v9248 * v9245[4];
  v9244[5] = v9248 * v9245[5];
  v9244[6] = v9245[6];
  v9244[7] = v9245[7];
  v9244[8] = v9245[8];
  return v9244;
}
function projection(v9249, v9250, v9251) {
  v9249[0] = 2 / v9250;
  v9249[1] = 0;
  v9249[2] = 0;
  v9249[3] = 0;
  v9249[4] = -2 / v9251;
  v9249[5] = 0;
  v9249[6] = -1;
  v9249[7] = 1;
  v9249[8] = 1;
  return v9249;
}
var Atlas = function () {
  function v9252(v9253, v9254, v9255, v9256) {
    _classCallCheck(this, v9252);
    this.debugID = Math.floor(Math.random() * 10000);
    this.r = v9253;
    this.texSize = v9254;
    this.texRows = v9255;
    this.texHeight = Math.floor(v9254 / v9255);
    this.enableWrapping = true;
    this.locked = false;
    this.texture = null;
    this.needsBuffer = true;
    this.freePointer = {
      x: 0,
      row: 0
    };
    this.keyToLocation = new Map();
    this.canvas = v9256(v9253, v9254, v9254);
    this.scratch = v9256(v9253, v9254, this.texHeight, "scratch");
  }
  return _createClass(v9252, [{
    key: "lock",
    value: function v9257() {
      this.locked = true;
    }
  }, {
    key: "getKeys",
    value: function v9258() {
      return new Set(this.keyToLocation.keys());
    }
  }, {
    key: "getScale",
    value: function v9259(v9260) {
      var v9261 = v9260.w;
      var v9262 = v9260.h;
      var v9263 = this.texHeight;
      var v9264 = this.texSize;
      var v9265 = v9263 / v9262;
      var v9266 = v9261 * v9265;
      var v9267 = v9262 * v9265;
      if (v9266 > v9264) {
        v9265 = v9264 / v9261;
        v9266 = v9261 * v9265;
        v9267 = v9262 * v9265;
      }
      return {
        scale: v9265,
        texW: v9266,
        texH: v9267
      };
    }
  }, {
    key: "draw",
    value: function v9268(v9269, v9270, v9271) {
      var v9272 = this;
      if (this.locked) {
        throw new Error("can't draw, atlas is locked");
      }
      var v9273 = this.texSize;
      var v9274 = this.texRows;
      var v9275 = this.texHeight;
      var v9276 = this.getScale(v9270);
      var v9277 = v9276.scale;
      var v9278 = v9276.texW;
      var v9279 = v9276.texH;
      var v9280 = function v9281(v9282, v9283) {
        if (v9271 && v9283) {
          var v9284 = v9283.context;
          var v9285 = v9282.x;
          var v9286 = v9282.row;
          var v9287 = v9285;
          var v9288 = v9275 * v9286;
          v9284.save();
          v9284.translate(v9287, v9288);
          v9284.scale(v9277, v9277);
          v9271(v9284, v9270);
          v9284.restore();
        }
      };
      var v9289 = [null, null];
      var v9290 = function v9291() {
        v9280(v9272.freePointer, v9272.canvas);
        v9289[0] = {
          x: v9272.freePointer.x,
          y: v9272.freePointer.row * v9275,
          w: v9278,
          h: v9279
        };
        v9289[1] = {
          x: v9272.freePointer.x + v9278,
          y: v9272.freePointer.row * v9275,
          w: 0,
          h: v9279
        };
        v9272.freePointer.x += v9278;
        if (v9272.freePointer.x == v9273) {
          v9272.freePointer.x = 0;
          v9272.freePointer.row++;
        }
      };
      var v9292 = function v9293() {
        var v9294 = v9272.scratch;
        var v9295 = v9272.canvas;
        v9294.clear();
        v9280({
          x: 0,
          row: 0
        }, v9294);
        var v9296 = v9273 - v9272.freePointer.x;
        var v9297 = v9278 - v9296;
        var v9298 = v9275;
        {
          var v9299 = v9272.freePointer.x;
          var v9300 = v9272.freePointer.row * v9275;
          var v9301 = v9296;
          v9295.context.drawImage(v9294, 0, 0, v9301, v9298, v9299, v9300, v9301, v9298);
          v9289[0] = {
            x: v9299,
            y: v9300,
            w: v9301,
            h: v9279
          };
        }
        {
          var v9302 = v9296;
          var v9303 = (v9272.freePointer.row + 1) * v9275;
          var v9304 = v9297;
          if (v9295) {
            v9295.context.drawImage(v9294, v9302, 0, v9304, v9298, 0, v9303, v9304, v9298);
          }
          v9289[1] = {
            x: 0,
            y: v9303,
            w: v9304,
            h: v9279
          };
        }
        v9272.freePointer.x = v9297;
        v9272.freePointer.row++;
      };
      var v9305 = function v9306() {
        v9272.freePointer.x = 0;
        v9272.freePointer.row++;
      };
      if (this.freePointer.x + v9278 <= v9273) {
        v9290();
      } else if (this.freePointer.row >= v9274 - 1) {
        return false;
      } else if (this.freePointer.x === v9273) {
        v9305();
        v9290();
      } else if (this.enableWrapping) {
        v9292();
      } else {
        v9305();
        v9290();
      }
      this.keyToLocation.set(v9269, v9289);
      this.needsBuffer = true;
      return v9289;
    }
  }, {
    key: "getOffsets",
    value: function v9307(v9308) {
      return this.keyToLocation.get(v9308);
    }
  }, {
    key: "isEmpty",
    value: function v9309() {
      return this.freePointer.x === 0 && this.freePointer.row === 0;
    }
  }, {
    key: "canFit",
    value: function v9310(v9311) {
      if (this.locked) {
        return false;
      }
      var v9312 = this.texSize;
      var v9313 = this.texRows;
      var v9314 = this.getScale(v9311);
      var v9315 = v9314.texW;
      if (this.freePointer.x + v9315 > v9312) {
        return this.freePointer.row < v9313 - 1;
      }
      return true;
    }
  }, {
    key: "bufferIfNeeded",
    value: function v9316(v9317) {
      if (!this.texture) {
        this.texture = createTexture(v9317, this.debugID);
      }
      if (this.needsBuffer) {
        this.texture.buffer(this.canvas);
        this.needsBuffer = false;
        if (this.locked) {
          this.canvas = null;
          this.scratch = null;
        }
      }
    }
  }, {
    key: "dispose",
    value: function v9318() {
      if (this.texture) {
        this.texture.deleteTexture();
        this.texture = null;
      }
      this.canvas = null;
      this.scratch = null;
      this.locked = true;
    }
  }]);
}();
var AtlasCollection = function () {
  function v9319(v9320, v9321, v9322, v9323) {
    _classCallCheck(this, v9319);
    this.r = v9320;
    this.texSize = v9321;
    this.texRows = v9322;
    this.createTextureCanvas = v9323;
    this.atlases = [];
    this.styleKeyToAtlas = new Map();
    this.markedKeys = new Set();
  }
  return _createClass(v9319, [{
    key: "getKeys",
    value: function v9324() {
      return new Set(this.styleKeyToAtlas.keys());
    }
  }, {
    key: "_createAtlas",
    value: function v9325() {
      var v9326 = this.r;
      var v9327 = this.texSize;
      var v9328 = this.texRows;
      var v9329 = this.createTextureCanvas;
      return new Atlas(v9326, v9327, v9328, v9329);
    }
  }, {
    key: "_getScratchCanvas",
    value: function v9330() {
      if (!this.scratch) {
        var v9331 = this.r;
        var v9332 = this.texSize;
        var v9333 = this.texRows;
        var v9334 = this.createTextureCanvas;
        var v9335 = Math.floor(v9332 / v9333);
        this.scratch = v9334(v9331, v9332, v9335, "scratch");
      }
      return this.scratch;
    }
  }, {
    key: "draw",
    value: function v9336(v9337, v9338, v9339) {
      var v9340 = this.styleKeyToAtlas.get(v9337);
      if (!v9340) {
        v9340 = this.atlases[this.atlases.length - 1];
        if (!v9340 || !v9340.canFit(v9338)) {
          if (v9340) {
            v9340.lock();
          }
          v9340 = this._createAtlas();
          this.atlases.push(v9340);
        }
        v9340.draw(v9337, v9338, v9339);
        this.styleKeyToAtlas.set(v9337, v9340);
      }
      return v9340;
    }
  }, {
    key: "getAtlas",
    value: function v9341(v9342) {
      return this.styleKeyToAtlas.get(v9342);
    }
  }, {
    key: "hasAtlas",
    value: function v9343(v9344) {
      return this.styleKeyToAtlas.has(v9344);
    }
  }, {
    key: "markKeyForGC",
    value: function v9345(v9346) {
      this.markedKeys.add(v9346);
    }
  }, {
    key: "gc",
    value: function v9347() {
      var v9348 = this;
      var v9349 = this.markedKeys;
      if (v9349.size === 0) {
        console.log("nothing to garbage collect");
        return;
      }
      var v9350 = [];
      var v9351 = new Map();
      var v9352 = null;
      var v9353 = _createForOfIteratorHelper(this.atlases);
      var v9354;
      try {
        var v9355 = function v9356() {
          var v9357 = v9354.value;
          var v9358 = v9357.getKeys();
          var v9359 = intersection(v9349, v9358);
          if (v9359.size === 0) {
            v9350.push(v9357);
            v9358.forEach(function (v9360) {
              return v9351.set(v9360, v9357);
            });
            return 1;
          }
          if (!v9352) {
            v9352 = v9348._createAtlas();
            v9350.push(v9352);
          }
          var v9361 = _createForOfIteratorHelper(v9358);
          var v9362;
          try {
            for (v9361.s(); !(v9362 = v9361.n()).done;) {
              var v9363 = v9362.value;
              if (!v9359.has(v9363)) {
                var v9364 = v9357.getOffsets(v9363);
                var v9365 = _slicedToArray(v9364, 2);
                var v9366 = v9365[0];
                var v9367 = v9365[1];
                if (!v9352.canFit({
                  w: v9366.w + v9367.w,
                  h: v9366.h
                })) {
                  v9352.lock();
                  v9352 = v9348._createAtlas();
                  v9350.push(v9352);
                }
                if (v9357.canvas) {
                  v9348._copyTextureToNewAtlas(v9363, v9357, v9352);
                  v9351.set(v9363, v9352);
                }
              }
            }
          } catch (v9368) {
            v9361.e(v9368);
          } finally {
            v9361.f();
          }
          v9357.dispose();
        };
        for (v9353.s(); !(v9354 = v9353.n()).done;) {
          if (v9355()) {
            continue;
          }
        }
      } catch (v9369) {
        v9353.e(v9369);
      } finally {
        v9353.f();
      }
      this.atlases = v9350;
      this.styleKeyToAtlas = v9351;
      this.markedKeys = new Set();
    }
  }, {
    key: "_copyTextureToNewAtlas",
    value: function v9370(v9371, v9372, v9373) {
      var v9374 = v9372.getOffsets(v9371);
      var v9375 = _slicedToArray(v9374, 2);
      var v9376 = v9375[0];
      var v9377 = v9375[1];
      if (v9377.w === 0) {
        v9373.draw(v9371, v9376, function (v9378) {
          v9378.drawImage(v9372.canvas, v9376.x, v9376.y, v9376.w, v9376.h, 0, 0, v9376.w, v9376.h);
        });
      } else {
        var v9379 = this._getScratchCanvas();
        v9379.clear();
        v9379.context.drawImage(v9372.canvas, v9376.x, v9376.y, v9376.w, v9376.h, 0, 0, v9376.w, v9376.h);
        v9379.context.drawImage(v9372.canvas, v9377.x, v9377.y, v9377.w, v9377.h, v9376.w, 0, v9377.w, v9377.h);
        var v9380 = v9376.w + v9377.w;
        var v9381 = v9376.h;
        v9373.draw(v9371, {
          w: v9380,
          h: v9381
        }, function (v9382) {
          v9382.drawImage(v9379, 0, 0, v9380, v9381, 0, 0, v9380, v9381);
        });
      }
    }
  }, {
    key: "getCounts",
    value: function v9383() {
      return {
        keyCount: this.styleKeyToAtlas.size,
        atlasCount: new Set(this.styleKeyToAtlas.values()).size
      };
    }
  }]);
}();
function intersection(v9384, v9385) {
  if (v9384.intersection) {
    return v9384.intersection(v9385);
  } else {
    return new Set(_toConsumableArray(v9384).filter(function (v9386) {
      return v9385.has(v9386);
    }));
  }
}
var AtlasManager = function () {
  function v9387(v9388, v9389) {
    _classCallCheck(this, v9387);
    this.r = v9388;
    this.globalOptions = v9389;
    this.atlasSize = v9389.webglTexSize;
    this.maxAtlasesPerBatch = v9389.webglTexPerBatch;
    this.renderTypes = new Map();
    this.collections = new Map();
    this.typeAndIdToKey = new Map();
  }
  return _createClass(v9387, [{
    key: "getAtlasSize",
    value: function v9390() {
      return this.atlasSize;
    }
  }, {
    key: "addAtlasCollection",
    value: function v9391(v9392, v9393) {
      var v9394 = this.globalOptions;
      var v9395 = v9394.webglTexSize;
      var v9396 = v9394.createTextureCanvas;
      var v9397 = v9393.texRows;
      var v9398 = this._cacheScratchCanvas(v9396);
      var v9399 = new AtlasCollection(this.r, v9395, v9397, v9398);
      this.collections.set(v9392, v9399);
    }
  }, {
    key: "addRenderType",
    value: function v9400(v9401, v9402) {
      var v9403 = v9402.collection;
      if (!this.collections.has(v9403)) {
        throw new Error(`invalid atlas collection name '${v9403}'`);
      }
      var v9404 = this.collections.get(v9403);
      var v9405 = extend({
        type: v9401,
        atlasCollection: v9404
      }, v9402);
      this.renderTypes.set(v9401, v9405);
    }
  }, {
    key: "getRenderTypeOpts",
    value: function v9406(v9407) {
      return this.renderTypes.get(v9407);
    }
  }, {
    key: "getAtlasCollection",
    value: function v9408(v9409) {
      return this.collections.get(v9409);
    }
  }, {
    key: "_cacheScratchCanvas",
    value: function v9410(v9411) {
      var v9412 = -1;
      var v9413 = -1;
      var v9414 = null;
      return function (v9415, v9416, v9417, v9418) {
        if (v9418) {
          if (!v9414 || v9416 != v9412 || v9417 != v9413) {
            v9412 = v9416;
            v9413 = v9417;
            v9414 = v9411(v9415, v9416, v9417);
          }
          return v9414;
        } else {
          return v9411(v9415, v9416, v9417);
        }
      };
    }
  }, {
    key: "_key",
    value: function v9419(v9420, v9421) {
      return `${v9420}-${v9421}`;
    }
  }, {
    key: "invalidate",
    value: function v9422(v9423) {
      var v9424 = this;
      var v9425 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var v9426 = v9425.forceRedraw;
      var v9427 = v9426 === undefined ? false : v9426;
      var v9428 = v9425.filterEle;
      var v9429 = v9428 === undefined ? function () {
        return true;
      } : v9428;
      var v9430 = v9425.filterType;
      var v9431 = v9430 === undefined ? function () {
        return true;
      } : v9430;
      var v9432 = false;
      var v9433 = false;
      var v9434 = _createForOfIteratorHelper(v9423);
      var v9435;
      try {
        for (v9434.s(); !(v9435 = v9434.n()).done;) {
          var v9436 = v9435.value;
          if (v9429(v9436)) {
            var v9437 = _createForOfIteratorHelper(this.renderTypes.values());
            var v9438;
            try {
              var v9439 = function v9440() {
                var v9441 = v9438.value;
                var v9442 = v9441.type;
                if (v9431(v9442)) {
                  var v9443 = v9424.collections.get(v9441.collection);
                  var v9444 = v9441.getKey(v9436);
                  var v9445 = Array.isArray(v9444) ? v9444 : [v9444];
                  if (v9427) {
                    v9445.forEach(function (v9446) {
                      return v9443.markKeyForGC(v9446);
                    });
                    v9433 = true;
                  } else {
                    var v9447 = v9441.getID ? v9441.getID(v9436) : v9436.id();
                    var v9448 = v9424._key(v9442, v9447);
                    var v9449 = v9424.typeAndIdToKey.get(v9448);
                    if (v9449 !== undefined && !arrayEqual(v9445, v9449)) {
                      v9432 = true;
                      v9424.typeAndIdToKey.delete(v9448);
                      v9449.forEach(function (v9450) {
                        return v9443.markKeyForGC(v9450);
                      });
                    }
                  }
                }
              };
              for (v9437.s(); !(v9438 = v9437.n()).done;) {
                v9439();
              }
            } catch (v9451) {
              v9437.e(v9451);
            } finally {
              v9437.f();
            }
          }
        }
      } catch (v9452) {
        v9434.e(v9452);
      } finally {
        v9434.f();
      }
      if (v9433) {
        this.gc();
        v9432 = false;
      }
      return v9432;
    }
  }, {
    key: "gc",
    value: function v9453() {
      var v9454 = _createForOfIteratorHelper(this.collections.values());
      var v9455;
      try {
        for (v9454.s(); !(v9455 = v9454.n()).done;) {
          var v9456 = v9455.value;
          v9456.gc();
        }
      } catch (v9457) {
        v9454.e(v9457);
      } finally {
        v9454.f();
      }
    }
  }, {
    key: "getOrCreateAtlas",
    value: function v9458(v9459, v9460, v9461, v9462) {
      var v9463 = this.renderTypes.get(v9460);
      var v9464 = this.collections.get(v9463.collection);
      var v9465 = false;
      var v9466 = v9464.draw(v9462, v9461, function (v9467) {
        if (v9463.drawClipped) {
          v9467.save();
          v9467.beginPath();
          v9467.rect(0, 0, v9461.w, v9461.h);
          v9467.clip();
          v9463.drawElement(v9467, v9459, v9461, true, true);
          v9467.restore();
        } else {
          v9463.drawElement(v9467, v9459, v9461, true, true);
        }
        v9465 = true;
      });
      if (v9465) {
        var v9468 = v9463.getID ? v9463.getID(v9459) : v9459.id();
        var v9469 = this._key(v9460, v9468);
        if (this.typeAndIdToKey.has(v9469)) {
          this.typeAndIdToKey.get(v9469).push(v9462);
        } else {
          this.typeAndIdToKey.set(v9469, [v9462]);
        }
      }
      return v9466;
    }
  }, {
    key: "getAtlasInfo",
    value: function v9470(v9471, v9472) {
      var v9473 = this;
      var v9474 = this.renderTypes.get(v9472);
      var v9475 = v9474.getKey(v9471);
      var v9476 = Array.isArray(v9475) ? v9475 : [v9475];
      return v9476.map(function (v9477) {
        var v9478 = v9474.getBoundingBox(v9471, v9477);
        var v9479 = v9473.getOrCreateAtlas(v9471, v9472, v9478, v9477);
        var v9480 = v9479.getOffsets(v9477);
        var v9481 = _slicedToArray(v9480, 2);
        var v9482 = v9481[0];
        var v9483 = v9481[1];
        return {
          atlas: v9479,
          tex: v9482,
          tex1: v9482,
          tex2: v9483,
          bb: v9478
        };
      });
    }
  }, {
    key: "getDebugInfo",
    value: function v9484() {
      var v9485 = [];
      var v9486 = _createForOfIteratorHelper(this.collections);
      var v9487;
      try {
        for (v9486.s(); !(v9487 = v9486.n()).done;) {
          var v9488 = _slicedToArray(v9487.value, 2);
          var v9489 = v9488[0];
          var v9490 = v9488[1];
          var v9491 = v9490.getCounts();
          var v9492 = v9491.keyCount;
          var v9493 = v9491.atlasCount;
          v9485.push({
            type: v9489,
            keyCount: v9492,
            atlasCount: v9493
          });
        }
      } catch (v9494) {
        v9486.e(v9494);
      } finally {
        v9486.f();
      }
      return v9485;
    }
  }]);
}();
var AtlasBatchManager = function () {
  function v9495(v9496) {
    _classCallCheck(this, v9495);
    this.globalOptions = v9496;
    this.atlasSize = v9496.webglTexSize;
    this.maxAtlasesPerBatch = v9496.webglTexPerBatch;
    this.batchAtlases = [];
  }
  return _createClass(v9495, [{
    key: "getMaxAtlasesPerBatch",
    value: function v9497() {
      return this.maxAtlasesPerBatch;
    }
  }, {
    key: "getAtlasSize",
    value: function v9498() {
      return this.atlasSize;
    }
  }, {
    key: "getIndexArray",
    value: function v9499() {
      return Array.from({
        length: this.maxAtlasesPerBatch
      }, function (v9500, v9501) {
        return v9501;
      });
    }
  }, {
    key: "startBatch",
    value: function v9502() {
      this.batchAtlases = [];
    }
  }, {
    key: "getAtlasCount",
    value: function v9503() {
      return this.batchAtlases.length;
    }
  }, {
    key: "getAtlases",
    value: function v9504() {
      return this.batchAtlases;
    }
  }, {
    key: "canAddToCurrentBatch",
    value: function v9505(v9506) {
      if (this.batchAtlases.length === this.maxAtlasesPerBatch) {
        return this.batchAtlases.includes(v9506);
      }
      return true;
    }
  }, {
    key: "getAtlasIndexForBatch",
    value: function v9507(v9508) {
      var v9509 = this.batchAtlases.indexOf(v9508);
      if (v9509 < 0) {
        if (this.batchAtlases.length === this.maxAtlasesPerBatch) {
          throw new Error("cannot add more atlases to batch");
        }
        this.batchAtlases.push(v9508);
        v9509 = this.batchAtlases.length - 1;
      }
      return v9509;
    }
  }]);
}();
var circleSD = "\n  float circleSD(vec2 p, float r) {\n    return distance(vec2(0), p) - r; // signed distance\n  }\n";
var rectangleSD = "\n  float rectangleSD(vec2 p, vec2 b) {\n    vec2 d = abs(p)-b;\n    return distance(vec2(0),max(d,0.0)) + min(max(d.x,d.y),0.0);\n  }\n";
var roundRectangleSD = "\n  float roundRectangleSD(vec2 p, vec2 b, vec4 cr) {\n    cr.xy = (p.x > 0.0) ? cr.xy : cr.zw;\n    cr.x  = (p.y > 0.0) ? cr.x  : cr.y;\n    vec2 q = abs(p) - b + cr.x;\n    return min(max(q.x, q.y), 0.0) + distance(vec2(0), max(q, 0.0)) - cr.x;\n  }\n";
var ellipseSD = "\n  float ellipseSD(vec2 p, vec2 ab) {\n    p = abs( p ); // symmetry\n\n    // find root with Newton solver\n    vec2 q = ab*(p-ab);\n    float w = (q.x<q.y)? 1.570796327 : 0.0;\n    for( int i=0; i<5; i++ ) {\n      vec2 cs = vec2(cos(w),sin(w));\n      vec2 u = ab*vec2( cs.x,cs.y);\n      vec2 v = ab*vec2(-cs.y,cs.x);\n      w = w + dot(p-u,v)/(dot(p-u,u)+dot(v,v));\n    }\n    \n    // compute final point and distance\n    float d = length(p-ab*vec2(cos(w),sin(w)));\n    \n    // return signed distance\n    return (dot(p/ab,p/ab)>1.0) ? d : -d;\n  }\n";
var RENDER_TARGET = {
  SCREEN: {
    name: "screen",
    screen: true
  },
  PICKING: {
    name: "picking",
    picking: true
  }
};
var TEX_PICKING_MODE = {
  IGNORE: 1,
  USE_BB: 2
};
var TEXTURE = 0;
var EDGE_STRAIGHT = 1;
var EDGE_CURVE_SEGMENT = 2;
var EDGE_ARROW = 3;
var RECTANGLE = 4;
var ROUND_RECTANGLE = 5;
var BOTTOM_ROUND_RECTANGLE = 6;
var ELLIPSE = 7;
var ElementDrawingWebGL = function () {
  function v9510(v9511, v9512, v9513) {
    _classCallCheck(this, v9510);
    this.r = v9511;
    this.gl = v9512;
    this.maxInstances = v9513.webglBatchSize;
    this.atlasSize = v9513.webglTexSize;
    this.bgColor = v9513.bgColor;
    this.debug = v9513.webglDebug;
    this.batchDebugInfo = [];
    v9513.enableWrapping = true;
    v9513.createTextureCanvas = createTextureCanvas;
    this.atlasManager = new AtlasManager(v9511, v9513);
    this.batchManager = new AtlasBatchManager(v9513);
    this.simpleShapeOptions = new Map();
    this.program = this._createShaderProgram(RENDER_TARGET.SCREEN);
    this.pickingProgram = this._createShaderProgram(RENDER_TARGET.PICKING);
    this.vao = this._createVAO();
  }
  return _createClass(v9510, [{
    key: "addAtlasCollection",
    value: function v9514(v9515, v9516) {
      this.atlasManager.addAtlasCollection(v9515, v9516);
    }
  }, {
    key: "addTextureAtlasRenderType",
    value: function v9517(v9518, v9519) {
      this.atlasManager.addRenderType(v9518, v9519);
    }
  }, {
    key: "addSimpleShapeRenderType",
    value: function v9520(v9521, v9522) {
      this.simpleShapeOptions.set(v9521, v9522);
    }
  }, {
    key: "invalidate",
    value: function v9523(v9524, v9525 = {}) {
      var v9526 = v9525.type;
      var v9527 = this.atlasManager;
      if (v9526) {
        return v9527.invalidate(v9524, {
          filterType: function v9528(v9529) {
            return v9529 === v9526;
          },
          forceRedraw: true
        });
      } else {
        return v9527.invalidate(v9524);
      }
    }
  }, {
    key: "gc",
    value: function v9530() {
      this.atlasManager.gc();
    }
  }, {
    key: "_createShaderProgram",
    value: function v9531(v9532) {
      var v9533 = this.gl;
      var v9534 = `#version 300 es
      precision highp float;

      uniform mat3 uPanZoomMatrix;
      uniform int  uAtlasSize;
      
      // instanced
      in vec2 aPosition; // a vertex from the unit square
      
      in mat3 aTransform; // used to transform verticies, eg into a bounding box
      in int aVertType; // the type of thing we are rendering

      // the z-index that is output when using picking mode
      in vec4 aIndex;
      
      // For textures
      in int aAtlasId; // which shader unit/atlas to use
      in vec4 aTex; // x/y/w/h of texture in atlas

      // for edges
      in vec4 aPointAPointB;
      in vec4 aPointCPointD;
      in vec2 aLineWidth; // also used for node border width

      // simple shapes
      in vec4 aCornerRadius; // for round-rectangle [top-right, bottom-right, top-left, bottom-left]
      in vec4 aColor; // also used for edges
      in vec4 aBorderColor; // aLineWidth is used for border width

      // output values passed to the fragment shader
      out vec2 vTexCoord;
      out vec4 vColor;
      out vec2 vPosition;
      // flat values are not interpolated
      flat out int vAtlasId; 
      flat out int vVertType;
      flat out vec2 vTopRight;
      flat out vec2 vBotLeft;
      flat out vec4 vCornerRadius;
      flat out vec4 vBorderColor;
      flat out vec2 vBorderWidth;
      flat out vec4 vIndex;
      
      void main(void) {
        int vid = gl_VertexID;
        vec2 position = aPosition; // TODO make this a vec3, simplifies some code below

        if(aVertType == ${TEXTURE}) {
          float texX = aTex.x; // texture coordinates
          float texY = aTex.y;
          float texW = aTex.z;
          float texH = aTex.w;

          if(vid == 1 || vid == 2 || vid == 4) {
            texX += texW;
          }
          if(vid == 2 || vid == 4 || vid == 5) {
            texY += texH;
          }

          float d = float(uAtlasSize);
          vTexCoord = vec2(texX / d, texY / d); // tex coords must be between 0 and 1

          gl_Position = vec4(uPanZoomMatrix * aTransform * vec3(position, 1.0), 1.0);
        }
        else if(aVertType == ${RECTANGLE} || aVertType == ${ELLIPSE} 
             || aVertType == ${ROUND_RECTANGLE} || aVertType == ${BOTTOM_ROUND_RECTANGLE}) { // simple shapes

          // the bounding box is needed by the fragment shader
          vBotLeft  = (aTransform * vec3(0, 0, 1)).xy; // flat
          vTopRight = (aTransform * vec3(1, 1, 1)).xy; // flat
          vPosition = (aTransform * vec3(position, 1)).xy; // will be interpolated

          // calculations are done in the fragment shader, just pass these along
          vColor = aColor;
          vCornerRadius = aCornerRadius;
          vBorderColor = aBorderColor;
          vBorderWidth = aLineWidth;

          gl_Position = vec4(uPanZoomMatrix * aTransform * vec3(position, 1.0), 1.0);
        }
        else if(aVertType == ${EDGE_STRAIGHT}) {
          vec2 source = aPointAPointB.xy;
          vec2 target = aPointAPointB.zw;

          // adjust the geometry so that the line is centered on the edge
          position.y = position.y - 0.5;

          // stretch the unit square into a long skinny rectangle
          vec2 xBasis = target - source;
          vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
          vec2 point = source + xBasis * position.x + yBasis * aLineWidth[0] * position.y;

          gl_Position = vec4(uPanZoomMatrix * vec3(point, 1.0), 1.0);
          vColor = aColor;
        } 
        else if(aVertType == ${EDGE_CURVE_SEGMENT}) {
          vec2 pointA = aPointAPointB.xy;
          vec2 pointB = aPointAPointB.zw;
          vec2 pointC = aPointCPointD.xy;
          vec2 pointD = aPointCPointD.zw;

          // adjust the geometry so that the line is centered on the edge
          position.y = position.y - 0.5;

          vec2 p0, p1, p2, pos;
          if(position.x == 0.0) { // The left side of the unit square
            p0 = pointA;
            p1 = pointB;
            p2 = pointC;
            pos = position;
          } else { // The right side of the unit square, use same approach but flip the geometry upside down
            p0 = pointD;
            p1 = pointC;
            p2 = pointB;
            pos = vec2(0.0, -position.y);
          }

          vec2 p01 = p1 - p0;
          vec2 p12 = p2 - p1;
          vec2 p21 = p1 - p2;

          // Find the normal vector.
          vec2 tangent = normalize(normalize(p12) + normalize(p01));
          vec2 normal = vec2(-tangent.y, tangent.x);

          // Find the vector perpendicular to p0 -> p1.
          vec2 p01Norm = normalize(vec2(-p01.y, p01.x));

          // Determine the bend direction.
          float sigma = sign(dot(p01 + p21, normal));
          float width = aLineWidth[0];

          if(sign(pos.y) == -sigma) {
            // This is an intersecting vertex. Adjust the position so that there's no overlap.
            vec2 point = 0.5 * width * normal * -sigma / dot(normal, p01Norm);
            gl_Position = vec4(uPanZoomMatrix * vec3(p1 + point, 1.0), 1.0);
          } else {
            // This is a non-intersecting vertex. Treat it like a mitre join.
            vec2 point = 0.5 * width * normal * sigma * dot(normal, p01Norm);
            gl_Position = vec4(uPanZoomMatrix * vec3(p1 + point, 1.0), 1.0);
          }

          vColor = aColor;
        } 
        else if(aVertType == ${EDGE_ARROW} && vid < 3) {
          // massage the first triangle into an edge arrow
          if(vid == 0)
            position = vec2(-0.15, -0.3);
          if(vid == 1)
            position = vec2(  0.0,  0.0);
          if(vid == 2)
            position = vec2( 0.15, -0.3);

          gl_Position = vec4(uPanZoomMatrix * aTransform * vec3(position, 1.0), 1.0);
          vColor = aColor;
        }
        else {
          gl_Position = vec4(2.0, 0.0, 0.0, 1.0); // discard vertex by putting it outside webgl clip space
        }

        vAtlasId = aAtlasId;
        vVertType = aVertType;
        vIndex = aIndex;
      }
    `;
      var v9535 = this.batchManager.getIndexArray();
      var v9536 = `#version 300 es
      precision highp float;

      // declare texture unit for each texture atlas in the batch
      ${v9535.map(function (v9537) {
        return `uniform sampler2D uTexture${v9537};`;
      }).join("\n\t")}

      uniform vec4 uBGColor;
      uniform float uZoom;

      in vec2 vTexCoord;
      in vec4 vColor;
      in vec2 vPosition; // model coordinates

      flat in int vAtlasId;
      flat in vec4 vIndex;
      flat in int vVertType;
      flat in vec2 vTopRight;
      flat in vec2 vBotLeft;
      flat in vec4 vCornerRadius;
      flat in vec4 vBorderColor;
      flat in vec2 vBorderWidth;

      out vec4 outColor;

      ${circleSD}
      ${rectangleSD}
      ${roundRectangleSD}
      ${ellipseSD}

      vec4 blend(vec4 top, vec4 bot) { // blend colors with premultiplied alpha
        return vec4( 
          top.rgb + (bot.rgb * (1.0 - top.a)),
          top.a   + (bot.a   * (1.0 - top.a)) 
        );
      }

      vec4 distInterp(vec4 cA, vec4 cB, float d) { // interpolate color using Signed Distance
        // scale to the zoom level so that borders don't look blurry when zoomed in
        // note 1.5 is an aribitrary value chosen because it looks good
        return mix(cA, cB, 1.0 - smoothstep(0.0, 1.5 / uZoom, abs(d))); 
      }

      void main(void) {
        if(vVertType == ${TEXTURE}) {
          // look up the texel from the texture unit
          ${v9535.map(function (v9538) {
        return `if(vAtlasId == ${v9538}) outColor = texture(uTexture${v9538}, vTexCoord);`;
      }).join("\n\telse ")}
        } 
        else if(vVertType == ${EDGE_ARROW}) {
          // mimics how canvas renderer uses context.globalCompositeOperation = 'destination-out';
          outColor = blend(vColor, uBGColor);
          outColor.a = 1.0; // make opaque, masks out line under arrow
        }
        else if(vVertType == ${RECTANGLE} && vBorderWidth == vec2(0.0)) { // simple rectangle with no border
          outColor = vColor; // unit square is already transformed to the rectangle, nothing else needs to be done
        }
        else if(vVertType == ${RECTANGLE} || vVertType == ${ELLIPSE} 
          || vVertType == ${ROUND_RECTANGLE} || vVertType == ${BOTTOM_ROUND_RECTANGLE}) { // use SDF

          float outerBorder = vBorderWidth[0];
          float innerBorder = vBorderWidth[1];
          float borderPadding = outerBorder * 2.0;
          float w = vTopRight.x - vBotLeft.x - borderPadding;
          float h = vTopRight.y - vBotLeft.y - borderPadding;
          vec2 b = vec2(w/2.0, h/2.0); // half width, half height
          vec2 p = vPosition - vec2(vTopRight.x - b[0] - outerBorder, vTopRight.y - b[1] - outerBorder); // translate to center

          float d; // signed distance
          if(vVertType == ${RECTANGLE}) {
            d = rectangleSD(p, b);
          } else if(vVertType == ${ELLIPSE} && w == h) {
            d = circleSD(p, b.x); // faster than ellipse
          } else if(vVertType == ${ELLIPSE}) {
            d = ellipseSD(p, b);
          } else {
            d = roundRectangleSD(p, b, vCornerRadius.wzyx);
          }

          // use the distance to interpolate a color to smooth the edges of the shape, doesn't need multisampling
          // we must smooth colors inwards, because we can't change pixels outside the shape's bounding box
          if(d > 0.0) {
            if(d > outerBorder) {
              discard;
            } else {
              outColor = distInterp(vBorderColor, vec4(0), d - outerBorder);
            }
          } else {
            if(d > innerBorder) {
              vec4 outerColor = outerBorder == 0.0 ? vec4(0) : vBorderColor;
              vec4 innerBorderColor = blend(vBorderColor, vColor);
              outColor = distInterp(innerBorderColor, outerColor, d);
            } 
            else {
              vec4 outerColor;
              if(innerBorder == 0.0 && outerBorder == 0.0) {
                outerColor = vec4(0);
              } else if(innerBorder == 0.0) {
                outerColor = vBorderColor;
              } else {
                outerColor = blend(vBorderColor, vColor);
              }
              outColor = distInterp(vColor, outerColor, d - innerBorder);
            }
          }
        }
        else {
          outColor = vColor;
        }

        ${v9532.picking ? "if(outColor.a == 0.0) discard;\n             else outColor = vIndex;" : ""}
      }
    `;
      var v9539 = createProgram(v9533, v9534, v9536);
      v9539.aPosition = v9533.getAttribLocation(v9539, "aPosition");
      v9539.aIndex = v9533.getAttribLocation(v9539, "aIndex");
      v9539.aVertType = v9533.getAttribLocation(v9539, "aVertType");
      v9539.aTransform = v9533.getAttribLocation(v9539, "aTransform");
      v9539.aAtlasId = v9533.getAttribLocation(v9539, "aAtlasId");
      v9539.aTex = v9533.getAttribLocation(v9539, "aTex");
      v9539.aPointAPointB = v9533.getAttribLocation(v9539, "aPointAPointB");
      v9539.aPointCPointD = v9533.getAttribLocation(v9539, "aPointCPointD");
      v9539.aLineWidth = v9533.getAttribLocation(v9539, "aLineWidth");
      v9539.aColor = v9533.getAttribLocation(v9539, "aColor");
      v9539.aCornerRadius = v9533.getAttribLocation(v9539, "aCornerRadius");
      v9539.aBorderColor = v9533.getAttribLocation(v9539, "aBorderColor");
      v9539.uPanZoomMatrix = v9533.getUniformLocation(v9539, "uPanZoomMatrix");
      v9539.uAtlasSize = v9533.getUniformLocation(v9539, "uAtlasSize");
      v9539.uBGColor = v9533.getUniformLocation(v9539, "uBGColor");
      v9539.uZoom = v9533.getUniformLocation(v9539, "uZoom");
      v9539.uTextures = [];
      for (var v9540 = 0; v9540 < this.batchManager.getMaxAtlasesPerBatch(); v9540++) {
        v9539.uTextures.push(v9533.getUniformLocation(v9539, `uTexture${v9540}`));
      }
      return v9539;
    }
  }, {
    key: "_createVAO",
    value: function v9541() {
      var v9542 = [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1];
      this.vertexCount = v9542.length / 2;
      var v9543 = this.maxInstances;
      var v9544 = this.gl;
      var v9545 = this.program;
      var v9546 = v9544.createVertexArray();
      v9544.bindVertexArray(v9546);
      createBufferStaticDraw(v9544, "vec2", v9545.aPosition, v9542);
      this.transformBuffer = create3x3MatrixBufferDynamicDraw(v9544, v9543, v9545.aTransform);
      this.indexBuffer = createBufferDynamicDraw(v9544, v9543, "vec4", v9545.aIndex);
      this.vertTypeBuffer = createBufferDynamicDraw(v9544, v9543, "int", v9545.aVertType);
      this.atlasIdBuffer = createBufferDynamicDraw(v9544, v9543, "int", v9545.aAtlasId);
      this.texBuffer = createBufferDynamicDraw(v9544, v9543, "vec4", v9545.aTex);
      this.pointAPointBBuffer = createBufferDynamicDraw(v9544, v9543, "vec4", v9545.aPointAPointB);
      this.pointCPointDBuffer = createBufferDynamicDraw(v9544, v9543, "vec4", v9545.aPointCPointD);
      this.lineWidthBuffer = createBufferDynamicDraw(v9544, v9543, "vec2", v9545.aLineWidth);
      this.colorBuffer = createBufferDynamicDraw(v9544, v9543, "vec4", v9545.aColor);
      this.cornerRadiusBuffer = createBufferDynamicDraw(v9544, v9543, "vec4", v9545.aCornerRadius);
      this.borderColorBuffer = createBufferDynamicDraw(v9544, v9543, "vec4", v9545.aBorderColor);
      v9544.bindVertexArray(null);
      return v9546;
    }
  }, {
    key: "buffers",
    get: function v9547() {
      var v9548 = this;
      if (!this._buffers) {
        this._buffers = Object.keys(this).filter(function (v9549) {
          return endsWith(v9549, "Buffer");
        }).map(function (v9550) {
          return v9548[v9550];
        });
      }
      return this._buffers;
    }
  }, {
    key: "startFrame",
    value: function v9551(v9552, v9553 = RENDER_TARGET.SCREEN) {
      this.panZoomMatrix = v9552;
      this.renderTarget = v9553;
      this.batchDebugInfo = [];
      this.wrappedCount = 0;
      this.simpleCount = 0;
      this.startBatch();
    }
  }, {
    key: "startBatch",
    value: function v9554() {
      this.instanceCount = 0;
      this.batchManager.startBatch();
    }
  }, {
    key: "endFrame",
    value: function v9555() {
      this.endBatch();
    }
  }, {
    key: "_isVisible",
    value: function v9556(v9557, v9558) {
      if (v9557.visible()) {
        if (v9558 && v9558.isVisible) {
          return v9558.isVisible(v9557);
        }
        return true;
      }
      return false;
    }
  }, {
    key: "drawTexture",
    value: function v9559(v9560, v9561, v9562) {
      var v9563 = this.atlasManager;
      var v9564 = this.batchManager;
      var v9565 = v9563.getRenderTypeOpts(v9562);
      if (!this._isVisible(v9560, v9565)) {
        return;
      }
      if (v9560.isEdge() && !this._isValidEdge(v9560)) {
        return;
      }
      if (this.renderTarget.picking && v9565.getTexPickingMode) {
        var v9566 = v9565.getTexPickingMode(v9560);
        if (v9566 === TEX_PICKING_MODE.IGNORE) {
          return;
        } else if (v9566 == TEX_PICKING_MODE.USE_BB) {
          this.drawPickingRectangle(v9560, v9561, v9562);
          return;
        }
      }
      var v9567 = v9563.getAtlasInfo(v9560, v9562);
      var v9568 = _createForOfIteratorHelper(v9567);
      var v9569;
      try {
        for (v9568.s(); !(v9569 = v9568.n()).done;) {
          var v9570 = v9569.value;
          var v9571 = v9570.atlas;
          var v9572 = v9570.tex1;
          var v9573 = v9570.tex2;
          if (!v9564.canAddToCurrentBatch(v9571)) {
            this.endBatch();
          }
          var v9574 = v9564.getAtlasIndexForBatch(v9571);
          for (var v9575 = 0, v9576 = [[v9572, true], [v9573, false]]; v9575 < v9576.length; v9575++) {
            var v9577 = _slicedToArray(v9576[v9575], 2);
            var v9578 = v9577[0];
            var v9579 = v9577[1];
            if (v9578.w != 0) {
              var v9580 = this.instanceCount;
              this.vertTypeBuffer.getView(v9580)[0] = TEXTURE;
              var v9581 = this.indexBuffer.getView(v9580);
              indexToVec4(v9561, v9581);
              var v9582 = this.atlasIdBuffer.getView(v9580);
              v9582[0] = v9574;
              var v9583 = this.texBuffer.getView(v9580);
              v9583[0] = v9578.x;
              v9583[1] = v9578.y;
              v9583[2] = v9578.w;
              v9583[3] = v9578.h;
              var v9584 = this.transformBuffer.getMatrixView(v9580);
              this.setTransformMatrix(v9560, v9584, v9565, v9570, v9579);
              this.instanceCount++;
              if (!v9579) {
                this.wrappedCount++;
              }
              if (this.instanceCount >= this.maxInstances) {
                this.endBatch();
              }
            }
          }
        }
      } catch (v9585) {
        v9568.e(v9585);
      } finally {
        v9568.f();
      }
    }
  }, {
    key: "setTransformMatrix",
    value: function v9586(v9587, v9588, v9589, v9590, v9591 = true) {
      var v9592 = 0;
      if (v9589.shapeProps && v9589.shapeProps.padding) {
        v9592 = v9587.pstyle(v9589.shapeProps.padding).pfValue;
      }
      if (v9590) {
        var v9593 = v9590.bb;
        var v9594 = v9590.tex1;
        var v9595 = v9590.tex2;
        var v9596 = v9594.w / (v9594.w + v9595.w);
        if (!v9591) {
          v9596 = 1 - v9596;
        }
        var v9597 = this._getAdjustedBB(v9593, v9592, v9591, v9596);
        this._applyTransformMatrix(v9588, v9597, v9589, v9587);
      } else {
        var v9598 = v9589.getBoundingBox(v9587);
        var v9599 = this._getAdjustedBB(v9598, v9592, true, 1);
        this._applyTransformMatrix(v9588, v9599, v9589, v9587);
      }
    }
  }, {
    key: "_applyTransformMatrix",
    value: function v9600(v9601, v9602, v9603, v9604) {
      var v9605;
      var v9606;
      identity2(v9601);
      var v9607 = v9603.getRotation ? v9603.getRotation(v9604) : 0;
      if (v9607 !== 0) {
        var v9608 = v9603.getRotationPoint(v9604);
        var v9609 = v9608.x;
        var v9610 = v9608.y;
        translate(v9601, v9601, [v9609, v9610]);
        rotate(v9601, v9601, v9607);
        var v9611 = v9603.getRotationOffset(v9604);
        v9605 = v9611.x + (v9602.xOffset || 0);
        v9606 = v9611.y + (v9602.yOffset || 0);
      } else {
        v9605 = v9602.x1;
        v9606 = v9602.y1;
      }
      translate(v9601, v9601, [v9605, v9606]);
      scale(v9601, v9601, [v9602.w, v9602.h]);
    }
  }, {
    key: "_getAdjustedBB",
    value: function v9612(v9613, v9614, v9615, v9616) {
      var v9617 = v9613.x1;
      var v9618 = v9613.y1;
      var v9619 = v9613.w;
      var v9620 = v9613.h;
      var v9621 = v9613.yOffset;
      if (v9614) {
        v9617 -= v9614;
        v9618 -= v9614;
        v9619 += v9614 * 2;
        v9620 += v9614 * 2;
      }
      var v9622 = 0;
      var v9623 = v9619 * v9616;
      if (v9615 && v9616 < 1) {
        v9619 = v9623;
      } else if (!v9615 && v9616 < 1) {
        v9622 = v9619 - v9623;
        v9617 += v9622;
        v9619 = v9623;
      }
      return {
        x1: v9617,
        y1: v9618,
        w: v9619,
        h: v9620,
        xOffset: v9622,
        yOffset: v9621
      };
    }
  }, {
    key: "drawPickingRectangle",
    value: function v9624(v9625, v9626, v9627) {
      var v9628 = this.atlasManager.getRenderTypeOpts(v9627);
      var v9629 = this.instanceCount;
      this.vertTypeBuffer.getView(v9629)[0] = RECTANGLE;
      var v9630 = this.indexBuffer.getView(v9629);
      indexToVec4(v9626, v9630);
      var v9631 = this.colorBuffer.getView(v9629);
      toWebGLColor([0, 0, 0], 1, v9631);
      var v9632 = this.transformBuffer.getMatrixView(v9629);
      this.setTransformMatrix(v9625, v9632, v9628);
      this.simpleCount++;
      this.instanceCount++;
      if (this.instanceCount >= this.maxInstances) {
        this.endBatch();
      }
    }
  }, {
    key: "drawNode",
    value: function v9633(v9634, v9635, v9636) {
      var v9637 = this.simpleShapeOptions.get(v9636);
      if (!this._isVisible(v9634, v9637)) {
        return;
      }
      var v9638 = v9637.shapeProps;
      var v9639 = this._getVertTypeForShape(v9634, v9638.shape);
      if (v9639 === undefined || v9637.isSimple && !v9637.isSimple(v9634, this.renderTarget)) {
        this.drawTexture(v9634, v9635, v9636);
        return;
      }
      var v9640 = this.instanceCount;
      this.vertTypeBuffer.getView(v9640)[0] = v9639;
      if (v9639 === ROUND_RECTANGLE || v9639 === BOTTOM_ROUND_RECTANGLE) {
        var v9641 = v9637.getBoundingBox(v9634);
        var v9642 = this._getCornerRadius(v9634, v9638.radius, v9641);
        var v9643 = this.cornerRadiusBuffer.getView(v9640);
        v9643[0] = v9642;
        v9643[1] = v9642;
        v9643[2] = v9642;
        v9643[3] = v9642;
        if (v9639 === BOTTOM_ROUND_RECTANGLE) {
          v9643[0] = 0;
          v9643[2] = 0;
        }
      }
      var v9644 = this.indexBuffer.getView(v9640);
      indexToVec4(v9635, v9644);
      var v9645 = this.renderTarget.picking ? 1 : v9636 === "node-body" ? v9634.effectiveOpacity() : 1;
      var v9646 = this.renderTarget.picking ? 1 : v9634.pstyle(v9638.opacity).value * v9645;
      var v9647 = v9634.pstyle(v9638.color).value;
      var v9648 = this.colorBuffer.getView(v9640);
      toWebGLColor(v9647, v9646, v9648);
      var v9649 = this.lineWidthBuffer.getView(v9640);
      v9649[0] = 0;
      v9649[1] = 0;
      if (v9638.border) {
        var v9650 = v9634.pstyle("border-width").value;
        if (v9650 > 0) {
          var v9651 = v9634.pstyle("border-color").value;
          var v9652 = v9645 * v9634.pstyle("border-opacity").value;
          var v9653 = this.borderColorBuffer.getView(v9640);
          toWebGLColor(v9651, v9652, v9653);
          var v9654 = v9634.pstyle("border-position").value;
          if (v9654 === "inside") {
            v9649[0] = 0;
            v9649[1] = -v9650;
          } else if (v9654 === "outside") {
            v9649[0] = v9650;
            v9649[1] = 0;
          } else {
            var v9655 = v9650 / 2;
            v9649[0] = v9655;
            v9649[1] = -v9655;
          }
        }
      }
      var v9656 = this.transformBuffer.getMatrixView(v9640);
      this.setTransformMatrix(v9634, v9656, v9637);
      this.simpleCount++;
      this.instanceCount++;
      if (this.instanceCount >= this.maxInstances) {
        this.endBatch();
      }
    }
  }, {
    key: "_getVertTypeForShape",
    value: function v9657(v9658, v9659) {
      var v9660 = v9658.pstyle(v9659).value;
      switch (v9660) {
        case "rectangle":
          return RECTANGLE;
        case "ellipse":
          return ELLIPSE;
        case "roundrectangle":
        case "round-rectangle":
          return ROUND_RECTANGLE;
        case "bottom-round-rectangle":
          return BOTTOM_ROUND_RECTANGLE;
        default:
          return undefined;
      }
    }
  }, {
    key: "_getCornerRadius",
    value: function v9661(v9662, v9663, v9664) {
      var v9665 = v9664.w;
      var v9666 = v9664.h;
      if (v9662.pstyle(v9663).value === "auto") {
        return getRoundRectangleRadius(v9665, v9666);
      } else {
        var v9667 = v9662.pstyle(v9663).pfValue;
        var v9668 = v9665 / 2;
        var v9669 = v9666 / 2;
        return Math.min(v9667, v9669, v9668);
      }
    }
  }, {
    key: "drawEdgeArrow",
    value: function v9670(v9671, v9672, v9673) {
      if (!v9671.visible()) {
        return;
      }
      var v9674 = v9671._private.rscratch;
      var v9675;
      var v9676;
      var v9677;
      if (v9673 === "source") {
        v9675 = v9674.arrowStartX;
        v9676 = v9674.arrowStartY;
        v9677 = v9674.srcArrowAngle;
      } else {
        v9675 = v9674.arrowEndX;
        v9676 = v9674.arrowEndY;
        v9677 = v9674.tgtArrowAngle;
      }
      if (isNaN(v9675) || v9675 == null || isNaN(v9676) || v9676 == null || isNaN(v9677) || v9677 == null) {
        return;
      }
      var v9678 = v9671.pstyle(v9673 + "-arrow-shape").value;
      if (v9678 === "none") {
        return;
      }
      var v9679 = v9671.pstyle(v9673 + "-arrow-color").value;
      var v9680 = v9671.pstyle("opacity").value;
      var v9681 = v9671.pstyle("line-opacity").value;
      var v9682 = v9680 * v9681;
      var v9683 = v9671.pstyle("width").pfValue;
      var v9684 = v9671.pstyle("arrow-scale").value;
      var v9685 = this.r.getArrowWidth(v9683, v9684);
      var v9686 = this.instanceCount;
      var v9687 = this.transformBuffer.getMatrixView(v9686);
      identity2(v9687);
      translate(v9687, v9687, [v9675, v9676]);
      scale(v9687, v9687, [v9685, v9685]);
      rotate(v9687, v9687, v9677);
      this.vertTypeBuffer.getView(v9686)[0] = EDGE_ARROW;
      var v9688 = this.indexBuffer.getView(v9686);
      indexToVec4(v9672, v9688);
      var v9689 = this.colorBuffer.getView(v9686);
      toWebGLColor(v9679, v9682, v9689);
      this.instanceCount++;
      if (this.instanceCount >= this.maxInstances) {
        this.endBatch();
      }
    }
  }, {
    key: "drawEdgeLine",
    value: function v9690(v9691, v9692) {
      if (!v9691.visible()) {
        return;
      }
      var v9693 = this._getEdgePoints(v9691);
      if (!v9693) {
        return;
      }
      var v9694 = v9691.pstyle("opacity").value;
      var v9695 = v9691.pstyle("line-opacity").value;
      var v9696 = v9691.pstyle("width").pfValue;
      var v9697 = v9691.pstyle("line-color").value;
      var v9698 = v9694 * v9695;
      if (v9693.length / 2 + this.instanceCount > this.maxInstances) {
        this.endBatch();
      }
      if (v9693.length == 4) {
        var v9699 = this.instanceCount;
        this.vertTypeBuffer.getView(v9699)[0] = EDGE_STRAIGHT;
        var v9700 = this.indexBuffer.getView(v9699);
        indexToVec4(v9692, v9700);
        var v9701 = this.colorBuffer.getView(v9699);
        toWebGLColor(v9697, v9698, v9701);
        var v9702 = this.lineWidthBuffer.getView(v9699);
        v9702[0] = v9696;
        var v9703 = this.pointAPointBBuffer.getView(v9699);
        v9703[0] = v9693[0];
        v9703[1] = v9693[1];
        v9703[2] = v9693[2];
        v9703[3] = v9693[3];
        this.instanceCount++;
        if (this.instanceCount >= this.maxInstances) {
          this.endBatch();
        }
      } else {
        for (var v9704 = 0; v9704 < v9693.length - 2; v9704 += 2) {
          var v9705 = this.instanceCount;
          this.vertTypeBuffer.getView(v9705)[0] = EDGE_CURVE_SEGMENT;
          var v9706 = this.indexBuffer.getView(v9705);
          indexToVec4(v9692, v9706);
          var v9707 = this.colorBuffer.getView(v9705);
          toWebGLColor(v9697, v9698, v9707);
          var v9708 = this.lineWidthBuffer.getView(v9705);
          v9708[0] = v9696;
          var v9709 = v9693[v9704 - 2];
          var v9710 = v9693[v9704 - 1];
          var v9711 = v9693[v9704];
          var v9712 = v9693[v9704 + 1];
          var v9713 = v9693[v9704 + 2];
          var v9714 = v9693[v9704 + 3];
          var v9715 = v9693[v9704 + 4];
          var v9716 = v9693[v9704 + 5];
          if (v9704 == 0) {
            v9709 = v9711 * 2 - v9713 + 0.001;
            v9710 = v9712 * 2 - v9714 + 0.001;
          }
          if (v9704 == v9693.length - 4) {
            v9715 = v9713 * 2 - v9711 + 0.001;
            v9716 = v9714 * 2 - v9712 + 0.001;
          }
          var v9717 = this.pointAPointBBuffer.getView(v9705);
          v9717[0] = v9709;
          v9717[1] = v9710;
          v9717[2] = v9711;
          v9717[3] = v9712;
          var v9718 = this.pointCPointDBuffer.getView(v9705);
          v9718[0] = v9713;
          v9718[1] = v9714;
          v9718[2] = v9715;
          v9718[3] = v9716;
          this.instanceCount++;
          if (this.instanceCount >= this.maxInstances) {
            this.endBatch();
          }
        }
      }
    }
  }, {
    key: "_isValidEdge",
    value: function v9719(v9720) {
      var v9721 = v9720._private.rscratch;
      if (v9721.badLine || v9721.allpts == null || isNaN(v9721.allpts[0])) {
        return false;
      }
      return true;
    }
  }, {
    key: "_getEdgePoints",
    value: function v9722(v9723) {
      var v9724 = v9723._private.rscratch;
      if (!this._isValidEdge(v9723)) {
        return;
      }
      var v9725 = v9724.allpts;
      if (v9725.length == 4) {
        return v9725;
      }
      var v9726 = this._getNumSegments(v9723);
      return this._getCurveSegmentPoints(v9725, v9726);
    }
  }, {
    key: "_getNumSegments",
    value: function v9727(v9728) {
      var v9729 = 15;
      return Math.min(Math.max(v9729, 5), this.maxInstances);
    }
  }, {
    key: "_getCurveSegmentPoints",
    value: function v9730(v9731, v9732) {
      if (v9731.length == 4) {
        return v9731;
      }
      var v9733 = Array((v9732 + 1) * 2);
      for (var v9734 = 0; v9734 <= v9732; v9734++) {
        if (v9734 == 0) {
          v9733[0] = v9731[0];
          v9733[1] = v9731[1];
        } else if (v9734 == v9732) {
          v9733[v9734 * 2] = v9731[v9731.length - 2];
          v9733[v9734 * 2 + 1] = v9731[v9731.length - 1];
        } else {
          var v9735 = v9734 / v9732;
          this._setCurvePoint(v9731, v9735, v9733, v9734 * 2);
        }
      }
      return v9733;
    }
  }, {
    key: "_setCurvePoint",
    value: function v9736(v9737, v9738, v9739, v9740) {
      if (v9737.length <= 2) {
        v9739[v9740] = v9737[0];
        v9739[v9740 + 1] = v9737[1];
      } else {
        var v9741 = Array(v9737.length - 2);
        for (var v9742 = 0; v9742 < v9741.length; v9742 += 2) {
          var v9743 = (1 - v9738) * v9737[v9742] + v9738 * v9737[v9742 + 2];
          var v9744 = (1 - v9738) * v9737[v9742 + 1] + v9738 * v9737[v9742 + 3];
          v9741[v9742] = v9743;
          v9741[v9742 + 1] = v9744;
        }
        return this._setCurvePoint(v9741, v9738, v9739, v9740);
      }
    }
  }, {
    key: "endBatch",
    value: function v9745() {
      var v9746 = this.gl;
      var v9747 = this.vao;
      var v9748 = this.vertexCount;
      var v9749 = this.instanceCount;
      if (v9749 === 0) {
        return;
      }
      var v9750 = this.renderTarget.picking ? this.pickingProgram : this.program;
      v9746.useProgram(v9750);
      v9746.bindVertexArray(v9747);
      var v9751 = _createForOfIteratorHelper(this.buffers);
      var v9752;
      try {
        for (v9751.s(); !(v9752 = v9751.n()).done;) {
          var v9753 = v9752.value;
          v9753.bufferSubData(v9749);
        }
      } catch (v9754) {
        v9751.e(v9754);
      } finally {
        v9751.f();
      }
      var v9755 = this.batchManager.getAtlases();
      for (var v9756 = 0; v9756 < v9755.length; v9756++) {
        v9755[v9756].bufferIfNeeded(v9746);
      }
      for (var v9757 = 0; v9757 < v9755.length; v9757++) {
        v9746.activeTexture(v9746.TEXTURE0 + v9757);
        v9746.bindTexture(v9746.TEXTURE_2D, v9755[v9757].texture);
        v9746.uniform1i(v9750.uTextures[v9757], v9757);
      }
      v9746.uniform1f(v9750.uZoom, getEffectiveZoom(this.r));
      v9746.uniformMatrix3fv(v9750.uPanZoomMatrix, false, this.panZoomMatrix);
      v9746.uniform1i(v9750.uAtlasSize, this.batchManager.getAtlasSize());
      var v9758 = toWebGLColor(this.bgColor, 1);
      v9746.uniform4fv(v9750.uBGColor, v9758);
      v9746.drawArraysInstanced(v9746.TRIANGLES, 0, v9748, v9749);
      v9746.bindVertexArray(null);
      v9746.bindTexture(v9746.TEXTURE_2D, null);
      if (this.debug) {
        this.batchDebugInfo.push({
          count: v9749,
          atlasCount: v9755.length
        });
      }
      this.startBatch();
    }
  }, {
    key: "getDebugInfo",
    value: function v9759() {
      var v9760 = this.atlasManager.getDebugInfo();
      var v9761 = v9760.reduce(function (v9762, v9763) {
        return v9762 + v9763.atlasCount;
      }, 0);
      var v9764 = this.batchDebugInfo;
      var v9765 = v9764.reduce(function (v9766, v9767) {
        return v9766 + v9767.count;
      }, 0);
      return {
        atlasInfo: v9760,
        totalAtlases: v9761,
        wrappedCount: this.wrappedCount,
        simpleCount: this.simpleCount,
        batchCount: v9764.length,
        batchInfo: v9764,
        totalInstances: v9765
      };
    }
  }]);
}();
var CRp$4 = {};
CRp$4.initWebgl = function (v9768, v9769) {
  var v9770 = this;
  var v9771 = v9770.data.contexts[v9770.WEBGL];
  v9768.bgColor = getBGColor(v9770);
  v9768.webglTexSize = Math.min(v9768.webglTexSize, v9771.getParameter(v9771.MAX_TEXTURE_SIZE));
  v9768.webglTexRows = Math.min(v9768.webglTexRows, 54);
  v9768.webglTexRowsNodes = Math.min(v9768.webglTexRowsNodes, 54);
  v9768.webglBatchSize = Math.min(v9768.webglBatchSize, 16384);
  v9768.webglTexPerBatch = Math.min(v9768.webglTexPerBatch, v9771.getParameter(v9771.MAX_TEXTURE_IMAGE_UNITS));
  v9770.webglDebug = v9768.webglDebug;
  v9770.webglDebugShowAtlases = v9768.webglDebugShowAtlases;
  v9770.pickingFrameBuffer = createPickingFrameBuffer(v9771);
  v9770.pickingFrameBuffer.needsDraw = true;
  v9770.drawing = new ElementDrawingWebGL(v9770, v9771, v9768);
  var v9772 = function v9773(v9774) {
    return function (v9775) {
      return v9770.getTextAngle(v9775, v9774);
    };
  };
  var v9776 = function v9777(v9778) {
    return function (v9779) {
      var v9780 = v9779.pstyle(v9778);
      return v9780 && v9780.value;
    };
  };
  var v9781 = function v9782(v9783) {
    return function (v9784) {
      return v9784.pstyle(`${v9783}-opacity`).value > 0;
    };
  };
  var v9785 = function v9786(v9787) {
    var v9788 = v9787.pstyle("text-events").strValue === "yes";
    if (v9788) {
      return TEX_PICKING_MODE.USE_BB;
    } else {
      return TEX_PICKING_MODE.IGNORE;
    }
  };
  var v9789 = function v9790(v9791) {
    var v9792 = v9791.position();
    var v9793 = v9792.x;
    var v9794 = v9792.y;
    var v9795 = v9791.outerWidth();
    var v9796 = v9791.outerHeight();
    return {
      w: v9795,
      h: v9796,
      x1: v9793 - v9795 / 2,
      y1: v9794 - v9796 / 2
    };
  };
  v9770.drawing.addAtlasCollection("node", {
    texRows: v9768.webglTexRowsNodes
  });
  v9770.drawing.addAtlasCollection("label", {
    texRows: v9768.webglTexRows
  });
  v9770.drawing.addTextureAtlasRenderType("node-body", {
    collection: "node",
    getKey: v9769.getStyleKey,
    getBoundingBox: v9769.getElementBox,
    drawElement: v9769.drawElement
  });
  v9770.drawing.addSimpleShapeRenderType("node-body", {
    getBoundingBox: v9789,
    isSimple: isSimpleShape,
    shapeProps: {
      shape: "shape",
      color: "background-color",
      opacity: "background-opacity",
      radius: "corner-radius",
      border: true
    }
  });
  v9770.drawing.addSimpleShapeRenderType("node-overlay", {
    getBoundingBox: v9789,
    isVisible: v9781("overlay"),
    shapeProps: {
      shape: "overlay-shape",
      color: "overlay-color",
      opacity: "overlay-opacity",
      padding: "overlay-padding",
      radius: "overlay-corner-radius"
    }
  });
  v9770.drawing.addSimpleShapeRenderType("node-underlay", {
    getBoundingBox: v9789,
    isVisible: v9781("underlay"),
    shapeProps: {
      shape: "underlay-shape",
      color: "underlay-color",
      opacity: "underlay-opacity",
      padding: "underlay-padding",
      radius: "underlay-corner-radius"
    }
  });
  v9770.drawing.addTextureAtlasRenderType("label", {
    collection: "label",
    getTexPickingMode: v9785,
    getKey: getStyleKeysForLabel(v9769.getLabelKey, null),
    getBoundingBox: getBoundingBoxForLabel(v9769.getLabelBox, null),
    drawClipped: true,
    drawElement: v9769.drawLabel,
    getRotation: v9772(null),
    getRotationPoint: v9769.getLabelRotationPoint,
    getRotationOffset: v9769.getLabelRotationOffset,
    isVisible: v9776("label")
  });
  v9770.drawing.addTextureAtlasRenderType("edge-source-label", {
    collection: "label",
    getTexPickingMode: v9785,
    getKey: getStyleKeysForLabel(v9769.getSourceLabelKey, "source"),
    getBoundingBox: getBoundingBoxForLabel(v9769.getSourceLabelBox, "source"),
    drawClipped: true,
    drawElement: v9769.drawSourceLabel,
    getRotation: v9772("source"),
    getRotationPoint: v9769.getSourceLabelRotationPoint,
    getRotationOffset: v9769.getSourceLabelRotationOffset,
    isVisible: v9776("source-label")
  });
  v9770.drawing.addTextureAtlasRenderType("edge-target-label", {
    collection: "label",
    getTexPickingMode: v9785,
    getKey: getStyleKeysForLabel(v9769.getTargetLabelKey, "target"),
    getBoundingBox: getBoundingBoxForLabel(v9769.getTargetLabelBox, "target"),
    drawClipped: true,
    drawElement: v9769.drawTargetLabel,
    getRotation: v9772("target"),
    getRotationPoint: v9769.getTargetLabelRotationPoint,
    getRotationOffset: v9769.getTargetLabelRotationOffset,
    isVisible: v9776("target-label")
  });
  var v9797 = debounce(function () {
    console.log("garbage collect flag set");
    v9770.data.gc = true;
  }, 10000);
  v9770.onUpdateEleCalcs(function (v9798, v9799) {
    var v9800 = false;
    if (v9799 && v9799.length > 0) {
      v9800 |= v9770.drawing.invalidate(v9799);
    }
    if (v9800) {
      v9797();
    }
  });
  overrideCanvasRendererFunctions(v9770);
};
function getBGColor(v9801) {
  var v9802 = v9801.cy.container();
  var v9803 = v9802 && v9802.style && v9802.style.backgroundColor || "white";
  return color2tuple(v9803);
}
function getLabelLines(v9804, v9805) {
  var v9806 = v9804._private.rscratch;
  return getPrefixedProperty(v9806, "labelWrapCachedLines", v9805) || [];
}
var getStyleKeysForLabel = function getStyleKeysForLabel2(v9807, v9808) {
  return function (v9809) {
    var v9810 = v9807(v9809);
    var v9811 = getLabelLines(v9809, v9808);
    if (v9811.length > 1) {
      return v9811.map(function (v9812, v9813) {
        return `${v9810}_${v9813}`;
      });
    }
    return v9810;
  };
};
var getBoundingBoxForLabel = function getBoundingBoxForLabel2(v9814, v9815) {
  return function (v9816, v9817) {
    var v9818 = v9814(v9816);
    if (typeof v9817 === "string") {
      var v9819 = v9817.indexOf("_");
      if (v9819 > 0) {
        var v9820 = Number(v9817.substring(v9819 + 1));
        var v9821 = getLabelLines(v9816, v9815);
        var v9822 = v9818.h / v9821.length;
        var v9823 = v9822 * v9820;
        var v9824 = v9818.y1 + v9823;
        return {
          x1: v9818.x1,
          w: v9818.w,
          y1: v9824,
          h: v9822,
          yOffset: v9823
        };
      }
    }
    return v9818;
  };
};
function overrideCanvasRendererFunctions(v9825) {
  {
    var v9826 = v9825.render;
    v9825.render = function (v9827) {
      v9827 = v9827 || {};
      var v9828 = v9825.cy;
      if (v9825.webgl) {
        if (v9828.zoom() > maxZoom$1) {
          clearWebgl(v9825);
          v9826.call(v9825, v9827);
        } else {
          clearCanvas(v9825);
          renderWebgl(v9825, v9827, RENDER_TARGET.SCREEN);
        }
      }
    };
  }
  {
    var v9829 = v9825.matchCanvasSize;
    v9825.matchCanvasSize = function (v9830) {
      v9829.call(v9825, v9830);
      v9825.pickingFrameBuffer.setFramebufferAttachmentSizes(v9825.canvasWidth, v9825.canvasHeight);
      v9825.pickingFrameBuffer.needsDraw = true;
    };
  }
  {
    v9825.findNearestElements = function (v9831, v9832, v9833, v9834) {
      return findNearestElementsWebgl(v9825, v9831, v9832);
    };
  }
  {
    var v9835 = v9825.invalidateCachedZSortedEles;
    v9825.invalidateCachedZSortedEles = function () {
      v9835.call(v9825);
      v9825.pickingFrameBuffer.needsDraw = true;
    };
  }
  {
    var v9836 = v9825.notify;
    v9825.notify = function (v9837, v9838) {
      v9836.call(v9825, v9837, v9838);
      if (v9837 === "viewport" || v9837 === "bounds") {
        v9825.pickingFrameBuffer.needsDraw = true;
      } else if (v9837 === "background") {
        v9825.drawing.invalidate(v9838, {
          type: "node-body"
        });
      }
    };
  }
}
function clearWebgl(v9839) {
  var v9840 = v9839.data.contexts[v9839.WEBGL];
  v9840.clear(v9840.COLOR_BUFFER_BIT | v9840.DEPTH_BUFFER_BIT);
}
function clearCanvas(v9841) {
  var v9842 = function v9843(v9844) {
    v9844.save();
    v9844.setTransform(1, 0, 0, 1, 0, 0);
    v9844.clearRect(0, 0, v9841.canvasWidth, v9841.canvasHeight);
    v9844.restore();
  };
  v9842(v9841.data.contexts[v9841.NODE]);
  v9842(v9841.data.contexts[v9841.DRAG]);
}
function createPanZoomMatrix(v9845) {
  var v9846 = v9845.canvasWidth;
  var v9847 = v9845.canvasHeight;
  var v9848 = getEffectivePanZoom(v9845);
  var v9849 = v9848.pan;
  var v9850 = v9848.zoom;
  var v9851 = create();
  translate(v9851, v9851, [v9849.x, v9849.y]);
  scale(v9851, v9851, [v9850, v9850]);
  var v9852 = create();
  projection(v9852, v9846, v9847);
  var v9853 = create();
  multiply(v9853, v9852, v9851);
  return v9853;
}
function setContextTransform(v9854, v9855) {
  var v9856 = v9854.canvasWidth;
  var v9857 = v9854.canvasHeight;
  var v9858 = getEffectivePanZoom(v9854);
  var v9859 = v9858.pan;
  var v9860 = v9858.zoom;
  v9855.setTransform(1, 0, 0, 1, 0, 0);
  v9855.clearRect(0, 0, v9856, v9857);
  v9855.translate(v9859.x, v9859.y);
  v9855.scale(v9860, v9860);
}
function drawSelectionRectangle(v9861, v9862) {
  v9861.drawSelectionRectangle(v9862, function (v9863) {
    return setContextTransform(v9861, v9863);
  });
}
function drawAxes(v9864) {
  var v9865 = v9864.data.contexts[v9864.NODE];
  v9865.save();
  setContextTransform(v9864, v9865);
  v9865.strokeStyle = "rgba(0, 0, 0, 0.3)";
  v9865.beginPath();
  v9865.moveTo(-1000, 0);
  v9865.lineTo(1000, 0);
  v9865.stroke();
  v9865.beginPath();
  v9865.moveTo(0, -1000);
  v9865.lineTo(0, 1000);
  v9865.stroke();
  v9865.restore();
}
function drawAtlases(v9866) {
  var v9867 = function v9868(v9869, v9870, v9871) {
    var v9872 = v9869.atlasManager.getAtlasCollection(v9870);
    var v9873 = v9866.data.contexts[v9866.NODE];
    var v9874 = v9872.atlases;
    for (var v9875 = 0; v9875 < v9874.length; v9875++) {
      var v9876 = v9874[v9875];
      var v9877 = v9876.canvas;
      if (v9877) {
        var v9878 = v9877.width;
        var v9879 = v9877.height;
        var v9880 = v9878 * v9875;
        var v9881 = v9877.height * v9871;
        var v9882 = 0.4;
        v9873.save();
        v9873.scale(v9882, v9882);
        v9873.drawImage(v9877, v9880, v9881);
        v9873.strokeStyle = "black";
        v9873.rect(v9880, v9881, v9878, v9879);
        v9873.stroke();
        v9873.restore();
      }
    }
  };
  var v9883 = 0;
  v9867(v9866.drawing, "node", v9883++);
  v9867(v9866.drawing, "label", v9883++);
}
function getPickingIndexes(v9884, v9885, v9886, v9887, v9888) {
  var v9889;
  var v9890;
  var v9891;
  var v9892;
  var v9893 = getEffectivePanZoom(v9884);
  var v9894 = v9893.pan;
  var v9895 = v9893.zoom;
  {
    var v9896 = modelToRenderedPosition2(v9884, v9894, v9895, v9885, v9886);
    var v9897 = _slicedToArray(v9896, 2);
    var v9898 = v9897[0];
    var v9899 = v9897[1];
    var v9900 = 6;
    v9889 = v9898 - v9900 / 2;
    v9890 = v9899 - v9900 / 2;
    v9891 = v9900;
    v9892 = v9900;
  }
  if (v9891 === 0 || v9892 === 0) {
    return [];
  }
  var v9901 = v9884.data.contexts[v9884.WEBGL];
  v9901.bindFramebuffer(v9901.FRAMEBUFFER, v9884.pickingFrameBuffer);
  if (v9884.pickingFrameBuffer.needsDraw) {
    v9901.viewport(0, 0, v9901.canvas.width, v9901.canvas.height);
    renderWebgl(v9884, null, RENDER_TARGET.PICKING);
    v9884.pickingFrameBuffer.needsDraw = false;
  }
  var v9902 = v9891 * v9892;
  var v9903 = new Uint8Array(v9902 * 4);
  v9901.readPixels(v9889, v9890, v9891, v9892, v9901.RGBA, v9901.UNSIGNED_BYTE, v9903);
  v9901.bindFramebuffer(v9901.FRAMEBUFFER, null);
  var v9904 = new Set();
  for (var v9905 = 0; v9905 < v9902; v9905++) {
    var v9906 = v9903.slice(v9905 * 4, v9905 * 4 + 4);
    var v9907 = vec4ToIndex(v9906) - 1;
    if (v9907 >= 0) {
      v9904.add(v9907);
    }
  }
  return v9904;
}
function findNearestElementsWebgl(v9908, v9909, v9910) {
  var v9911 = getPickingIndexes(v9908, v9909, v9910);
  var v9912 = v9908.getCachedZSortedEles();
  var v9913;
  var v9914;
  var v9915 = _createForOfIteratorHelper(v9911);
  var v9916;
  try {
    for (v9915.s(); !(v9916 = v9915.n()).done;) {
      var v9917 = v9916.value;
      var v9918 = v9912[v9917];
      if (!v9913 && v9918.isNode()) {
        v9913 = v9918;
      }
      if (!v9914 && v9918.isEdge()) {
        v9914 = v9918;
      }
      if (v9913 && v9914) {
        break;
      }
    }
  } catch (v9919) {
    v9915.e(v9919);
  } finally {
    v9915.f();
  }
  return [v9913, v9914].filter(Boolean);
}
function drawEle(v9920, v9921, v9922) {
  var v9923 = v9920.drawing;
  v9921 += 1;
  if (v9922.isNode()) {
    v9923.drawNode(v9922, v9921, "node-underlay");
    v9923.drawNode(v9922, v9921, "node-body");
    v9923.drawTexture(v9922, v9921, "label");
    v9923.drawNode(v9922, v9921, "node-overlay");
  } else {
    v9923.drawEdgeLine(v9922, v9921);
    v9923.drawEdgeArrow(v9922, v9921, "source");
    v9923.drawEdgeArrow(v9922, v9921, "target");
    v9923.drawTexture(v9922, v9921, "label");
    v9923.drawTexture(v9922, v9921, "edge-source-label");
    v9923.drawTexture(v9922, v9921, "edge-target-label");
  }
}
function renderWebgl(v9924, v9925, v9926) {
  var v9927;
  if (v9924.webglDebug) {
    v9927 = performance.now();
  }
  var v9928 = v9924.drawing;
  var v9929 = 0;
  if (v9926.screen) {
    if (v9924.data.canvasNeedsRedraw[v9924.SELECT_BOX]) {
      drawSelectionRectangle(v9924, v9925);
    }
  }
  if (v9924.data.canvasNeedsRedraw[v9924.NODE] || v9926.picking) {
    var v9930 = v9924.data.contexts[v9924.WEBGL];
    if (v9926.screen) {
      v9930.clearColor(0, 0, 0, 0);
      v9930.enable(v9930.BLEND);
      v9930.blendFunc(v9930.ONE, v9930.ONE_MINUS_SRC_ALPHA);
    } else {
      v9930.disable(v9930.BLEND);
    }
    v9930.clear(v9930.COLOR_BUFFER_BIT | v9930.DEPTH_BUFFER_BIT);
    v9930.viewport(0, 0, v9930.canvas.width, v9930.canvas.height);
    var v9931 = createPanZoomMatrix(v9924);
    var v9932 = v9924.getCachedZSortedEles();
    v9929 = v9932.length;
    v9928.startFrame(v9931, v9926);
    if (v9926.screen) {
      for (var v9933 = 0; v9933 < v9932.nondrag.length; v9933++) {
        drawEle(v9924, v9933, v9932.nondrag[v9933]);
      }
      for (var v9934 = 0; v9934 < v9932.drag.length; v9934++) {
        drawEle(v9924, v9934, v9932.drag[v9934]);
      }
    } else if (v9926.picking) {
      for (var v9935 = 0; v9935 < v9932.length; v9935++) {
        drawEle(v9924, v9935, v9932[v9935]);
      }
    }
    v9928.endFrame();
    if (v9926.screen && v9924.webglDebugShowAtlases) {
      drawAxes(v9924);
      drawAtlases(v9924);
    }
    v9924.data.canvasNeedsRedraw[v9924.NODE] = false;
    v9924.data.canvasNeedsRedraw[v9924.DRAG] = false;
  }
  if (v9924.webglDebug) {
    var v9936 = performance.now();
    var v9937 = false;
    var v9938 = Math.ceil(v9936 - v9927);
    var v9939 = v9928.getDebugInfo();
    var v9940 = [`${v9929} elements`, `${v9939.totalInstances} instances`, `${v9939.batchCount} batches`, `${v9939.totalAtlases} atlases`, `${v9939.wrappedCount} wrapped textures`, `${v9939.simpleCount} simple shapes`].join(", ");
    if (v9937) {
      console.log(`WebGL (${v9926.name}) - time ${v9938}ms, ${v9940}`);
    } else {
      console.log(`WebGL (${v9926.name}) - frame time ${v9938}ms`);
      console.log("Totals:");
      console.log(`  ${v9940}`);
      console.log("Texture Atlases Used:");
      var v9941 = v9939.atlasInfo;
      var v9942 = _createForOfIteratorHelper(v9941);
      var v9943;
      try {
        for (v9942.s(); !(v9943 = v9942.n()).done;) {
          var v9944 = v9943.value;
          console.log(`  ${v9944.type}: ${v9944.keyCount} keys, ${v9944.atlasCount} atlases`);
        }
      } catch (v9945) {
        v9942.e(v9945);
      } finally {
        v9942.f();
      }
      console.log("");
    }
  }
  if (v9924.data.gc) {
    console.log("Garbage Collect!");
    v9924.data.gc = false;
    v9928.gc();
  }
}
var CRp$3 = {};
CRp$3.drawPolygonPath = function (v9946, v9947, v9948, v9949, v9950, v9951) {
  var v9952 = v9949 / 2;
  var v9953 = v9950 / 2;
  if (v9946.beginPath) {
    v9946.beginPath();
  }
  v9946.moveTo(v9947 + v9952 * v9951[0], v9948 + v9953 * v9951[1]);
  for (var v9954 = 1; v9954 < v9951.length / 2; v9954++) {
    v9946.lineTo(v9947 + v9952 * v9951[v9954 * 2], v9948 + v9953 * v9951[v9954 * 2 + 1]);
  }
  v9946.closePath();
};
CRp$3.drawRoundPolygonPath = function (v9955, v9956, v9957, v9958, v9959, v9960, v9961) {
  v9961.forEach(function (v9962) {
    return drawPreparedRoundCorner(v9955, v9962);
  });
  v9955.closePath();
};
CRp$3.drawRoundRectanglePath = function (v9963, v9964, v9965, v9966, v9967, v9968) {
  var v9969 = v9966 / 2;
  var v9970 = v9967 / 2;
  var v9971 = v9968 === "auto" ? getRoundRectangleRadius(v9966, v9967) : Math.min(v9968, v9970, v9969);
  if (v9963.beginPath) {
    v9963.beginPath();
  }
  v9963.moveTo(v9964, v9965 - v9970);
  v9963.arcTo(v9964 + v9969, v9965 - v9970, v9964 + v9969, v9965, v9971);
  v9963.arcTo(v9964 + v9969, v9965 + v9970, v9964, v9965 + v9970, v9971);
  v9963.arcTo(v9964 - v9969, v9965 + v9970, v9964 - v9969, v9965, v9971);
  v9963.arcTo(v9964 - v9969, v9965 - v9970, v9964, v9965 - v9970, v9971);
  v9963.lineTo(v9964, v9965 - v9970);
  v9963.closePath();
};
CRp$3.drawBottomRoundRectanglePath = function (v9972, v9973, v9974, v9975, v9976, v9977) {
  var v9978 = v9975 / 2;
  var v9979 = v9976 / 2;
  var v9980 = v9977 === "auto" ? getRoundRectangleRadius(v9975, v9976) : v9977;
  if (v9972.beginPath) {
    v9972.beginPath();
  }
  v9972.moveTo(v9973, v9974 - v9979);
  v9972.lineTo(v9973 + v9978, v9974 - v9979);
  v9972.lineTo(v9973 + v9978, v9974);
  v9972.arcTo(v9973 + v9978, v9974 + v9979, v9973, v9974 + v9979, v9980);
  v9972.arcTo(v9973 - v9978, v9974 + v9979, v9973 - v9978, v9974, v9980);
  v9972.lineTo(v9973 - v9978, v9974 - v9979);
  v9972.lineTo(v9973, v9974 - v9979);
  v9972.closePath();
};
CRp$3.drawCutRectanglePath = function (v9981, v9982, v9983, v9984, v9985, v9986, v9987) {
  var v9988 = v9984 / 2;
  var v9989 = v9985 / 2;
  var v9990 = v9987 === "auto" ? getCutRectangleCornerLength() : v9987;
  if (v9981.beginPath) {
    v9981.beginPath();
  }
  v9981.moveTo(v9982 - v9988 + v9990, v9983 - v9989);
  v9981.lineTo(v9982 + v9988 - v9990, v9983 - v9989);
  v9981.lineTo(v9982 + v9988, v9983 - v9989 + v9990);
  v9981.lineTo(v9982 + v9988, v9983 + v9989 - v9990);
  v9981.lineTo(v9982 + v9988 - v9990, v9983 + v9989);
  v9981.lineTo(v9982 - v9988 + v9990, v9983 + v9989);
  v9981.lineTo(v9982 - v9988, v9983 + v9989 - v9990);
  v9981.lineTo(v9982 - v9988, v9983 - v9989 + v9990);
  v9981.closePath();
};
CRp$3.drawBarrelPath = function (v9991, v9992, v9993, v9994, v9995) {
  var v9996 = v9994 / 2;
  var v9997 = v9995 / 2;
  var v9998 = v9992 - v9996;
  var v9999 = v9992 + v9996;
  var v10000 = v9993 - v9997;
  var v10001 = v9993 + v9997;
  var v10002 = getBarrelCurveConstants(v9994, v9995);
  var v10003 = v10002.widthOffset;
  var v10004 = v10002.heightOffset;
  var v10005 = v10002.ctrlPtOffsetPct * v10003;
  if (v9991.beginPath) {
    v9991.beginPath();
  }
  v9991.moveTo(v9998, v10000 + v10004);
  v9991.lineTo(v9998, v10001 - v10004);
  v9991.quadraticCurveTo(v9998 + v10005, v10001, v9998 + v10003, v10001);
  v9991.lineTo(v9999 - v10003, v10001);
  v9991.quadraticCurveTo(v9999 - v10005, v10001, v9999, v10001 - v10004);
  v9991.lineTo(v9999, v10000 + v10004);
  v9991.quadraticCurveTo(v9999 - v10005, v10000, v9999 - v10003, v10000);
  v9991.lineTo(v9998 + v10003, v10000);
  v9991.quadraticCurveTo(v9998 + v10005, v10000, v9998, v10000 + v10004);
  v9991.closePath();
};
var sin0 = Math.sin(0);
var cos0 = Math.cos(0);
var sin = {};
var cos = {};
var ellipseStepSize = Math.PI / 40;
for (var i = Math.PI * 0; i < Math.PI * 2; i += ellipseStepSize) {
  sin[i] = Math.sin(i);
  cos[i] = Math.cos(i);
}
CRp$3.drawEllipsePath = function (v10006, v10007, v10008, v10009, v10010) {
  if (v10006.beginPath) {
    v10006.beginPath();
  }
  if (v10006.ellipse) {
    v10006.ellipse(v10007, v10008, v10009 / 2, v10010 / 2, 0, 0, Math.PI * 2);
  } else {
    var v10011;
    var v10012;
    var v10013 = v10009 / 2;
    var v10014 = v10010 / 2;
    for (var v10015 = Math.PI * 0; v10015 < Math.PI * 2; v10015 += ellipseStepSize) {
      v10011 = v10007 - v10013 * sin[v10015] * sin0 + v10013 * cos[v10015] * cos0;
      v10012 = v10008 + v10014 * cos[v10015] * sin0 + v10014 * sin[v10015] * cos0;
      if (v10015 === 0) {
        v10006.moveTo(v10011, v10012);
      } else {
        v10006.lineTo(v10011, v10012);
      }
    }
  }
  v10006.closePath();
};
var CRp$2 = {};
CRp$2.createBuffer = function (v10016, v10017) {
  var v10018 = document.createElement("canvas");
  v10018.width = v10016;
  v10018.height = v10017;
  return [v10018, v10018.getContext("2d")];
};
CRp$2.bufferCanvasImage = function (v10019) {
  var v10020 = this.cy;
  var v10021 = v10020.mutableElements();
  var v10022 = v10021.boundingBox();
  var v10023 = this.findContainerClientCoords();
  var v10024 = v10019.full ? Math.ceil(v10022.w) : v10023[2];
  var v10025 = v10019.full ? Math.ceil(v10022.h) : v10023[3];
  var v10026 = number$1(v10019.maxWidth) || number$1(v10019.maxHeight);
  var v10027 = this.getPixelRatio();
  var v10028 = 1;
  if (v10019.scale !== undefined) {
    v10024 *= v10019.scale;
    v10025 *= v10019.scale;
    v10028 = v10019.scale;
  } else if (v10026) {
    var v10029 = Infinity;
    var v10030 = Infinity;
    if (number$1(v10019.maxWidth)) {
      v10029 = v10028 * v10019.maxWidth / v10024;
    }
    if (number$1(v10019.maxHeight)) {
      v10030 = v10028 * v10019.maxHeight / v10025;
    }
    v10028 = Math.min(v10029, v10030);
    v10024 *= v10028;
    v10025 *= v10028;
  }
  if (!v10026) {
    v10024 *= v10027;
    v10025 *= v10027;
    v10028 *= v10027;
  }
  var v10031 = document.createElement("canvas");
  v10031.width = v10024;
  v10031.height = v10025;
  v10031.style.width = v10024 + "px";
  v10031.style.height = v10025 + "px";
  var v10032 = v10031.getContext("2d");
  if (v10024 > 0 && v10025 > 0) {
    v10032.clearRect(0, 0, v10024, v10025);
    v10032.globalCompositeOperation = "source-over";
    var v10033 = this.getCachedZSortedEles();
    if (v10019.full) {
      v10032.translate(-v10022.x1 * v10028, -v10022.y1 * v10028);
      v10032.scale(v10028, v10028);
      this.drawElements(v10032, v10033);
      v10032.scale(1 / v10028, 1 / v10028);
      v10032.translate(v10022.x1 * v10028, v10022.y1 * v10028);
    } else {
      var v10034 = v10020.pan();
      var v10035 = {
        x: v10034.x * v10028,
        y: v10034.y * v10028
      };
      v10028 *= v10020.zoom();
      v10032.translate(v10035.x, v10035.y);
      v10032.scale(v10028, v10028);
      this.drawElements(v10032, v10033);
      v10032.scale(1 / v10028, 1 / v10028);
      v10032.translate(-v10035.x, -v10035.y);
    }
    if (v10019.bg) {
      v10032.globalCompositeOperation = "destination-over";
      v10032.fillStyle = v10019.bg;
      v10032.rect(0, 0, v10024, v10025);
      v10032.fill();
    }
  }
  return v10031;
};
function b64ToBlob(v10036, v10037) {
  var v10038 = atob(v10036);
  var v10039 = new ArrayBuffer(v10038.length);
  var v10040 = new Uint8Array(v10039);
  for (var v10041 = 0; v10041 < v10038.length; v10041++) {
    v10040[v10041] = v10038.charCodeAt(v10041);
  }
  return new Blob([v10039], {
    type: v10037
  });
}
function b64UriToB64(v10042) {
  var v10043 = v10042.indexOf(",");
  return v10042.substr(v10043 + 1);
}
function output(v10044, v10045, v10046) {
  var v10047 = function v10048() {
    return v10045.toDataURL(v10046, v10044.quality);
  };
  switch (v10044.output) {
    case "blob-promise":
      return new Promise$1(function (v10049, v10050) {
        try {
          v10045.toBlob(function (v10051) {
            if (v10051 != null) {
              v10049(v10051);
            } else {
              v10050(new Error("`canvas.toBlob()` sent a null value in its callback"));
            }
          }, v10046, v10044.quality);
        } catch (v10052) {
          v10050(v10052);
        }
      });
    case "blob":
      return b64ToBlob(b64UriToB64(v10047()), v10046);
    case "base64":
      return b64UriToB64(v10047());
    case "base64uri":
    default:
      return v10047();
  }
}
CRp$2.png = function (v10053) {
  return output(v10053, this.bufferCanvasImage(v10053), "image/png");
};
CRp$2.jpg = function (v10054) {
  return output(v10054, this.bufferCanvasImage(v10054), "image/jpeg");
};
var CRp$1 = {};
CRp$1.nodeShapeImpl = function (v10055, v10056, v10057, v10058, v10059, v10060, v10061, v10062) {
  switch (v10055) {
    case "ellipse":
      return this.drawEllipsePath(v10056, v10057, v10058, v10059, v10060);
    case "polygon":
      return this.drawPolygonPath(v10056, v10057, v10058, v10059, v10060, v10061);
    case "round-polygon":
      return this.drawRoundPolygonPath(v10056, v10057, v10058, v10059, v10060, v10061, v10062);
    case "roundrectangle":
    case "round-rectangle":
      return this.drawRoundRectanglePath(v10056, v10057, v10058, v10059, v10060, v10062);
    case "cutrectangle":
    case "cut-rectangle":
      return this.drawCutRectanglePath(v10056, v10057, v10058, v10059, v10060, v10061, v10062);
    case "bottomroundrectangle":
    case "bottom-round-rectangle":
      return this.drawBottomRoundRectanglePath(v10056, v10057, v10058, v10059, v10060, v10062);
    case "barrel":
      return this.drawBarrelPath(v10056, v10057, v10058, v10059, v10060);
  }
};
var CR = CanvasRenderer;
var CRp = CanvasRenderer.prototype;
CRp.CANVAS_LAYERS = 3;
CRp.SELECT_BOX = 0;
CRp.DRAG = 1;
CRp.NODE = 2;
CRp.WEBGL = 3;
CRp.CANVAS_TYPES = ["2d", "2d", "2d", "webgl2"];
CRp.BUFFER_COUNT = 3;
CRp.TEXTURE_BUFFER = 0;
CRp.MOTIONBLUR_BUFFER_NODE = 1;
CRp.MOTIONBLUR_BUFFER_DRAG = 2;
function CanvasRenderer(v10063) {
  var v10064 = this;
  var v10065 = v10064.cy.window();
  var v10066 = v10065.document;
  if (v10063.webgl) {
    CRp.CANVAS_LAYERS = v10064.CANVAS_LAYERS = 4;
    console.log("webgl rendering enabled");
  }
  v10064.data = {
    canvases: new Array(CRp.CANVAS_LAYERS),
    contexts: new Array(CRp.CANVAS_LAYERS),
    canvasNeedsRedraw: new Array(CRp.CANVAS_LAYERS),
    bufferCanvases: new Array(CRp.BUFFER_COUNT),
    bufferContexts: new Array(CRp.CANVAS_LAYERS)
  };
  var v10067 = "-webkit-tap-highlight-color";
  var v10068 = "rgba(0,0,0,0)";
  v10064.data.canvasContainer = v10066.createElement("div");
  var v10069 = v10064.data.canvasContainer.style;
  v10064.data.canvasContainer.style[v10067] = v10068;
  v10069.position = "relative";
  v10069.zIndex = "0";
  v10069.overflow = "hidden";
  var v10070 = v10063.cy.container();
  v10070.appendChild(v10064.data.canvasContainer);
  v10070.style[v10067] = v10068;
  var v10071 = {
    "-webkit-user-select": "none",
    "-moz-user-select": "-moz-none",
    "user-select": "none",
    "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
    "outline-style": "none"
  };
  if (ms()) {
    v10071["-ms-touch-action"] = "none";
    v10071["touch-action"] = "none";
  }
  for (var v10072 = 0; v10072 < CRp.CANVAS_LAYERS; v10072++) {
    var v10073 = v10064.data.canvases[v10072] = v10066.createElement("canvas");
    var v10074 = CRp.CANVAS_TYPES[v10072];
    v10064.data.contexts[v10072] = v10073.getContext(v10074);
    if (!v10064.data.contexts[v10072]) {
      error("Could not create canvas of type " + v10074);
    }
    Object.keys(v10071).forEach(function (v10075) {
      v10073.style[v10075] = v10071[v10075];
    });
    v10073.style.position = "absolute";
    v10073.setAttribute("data-id", "layer" + v10072);
    v10073.style.zIndex = String(CRp.CANVAS_LAYERS - v10072);
    v10064.data.canvasContainer.appendChild(v10073);
    v10064.data.canvasNeedsRedraw[v10072] = false;
  }
  v10064.data.topCanvas = v10064.data.canvases[0];
  v10064.data.canvases[CRp.NODE].setAttribute("data-id", "layer" + CRp.NODE + "-node");
  v10064.data.canvases[CRp.SELECT_BOX].setAttribute("data-id", "layer" + CRp.SELECT_BOX + "-selectbox");
  v10064.data.canvases[CRp.DRAG].setAttribute("data-id", "layer" + CRp.DRAG + "-drag");
  if (v10064.data.canvases[CRp.WEBGL]) {
    v10064.data.canvases[CRp.WEBGL].setAttribute("data-id", "layer" + CRp.WEBGL + "-webgl");
  }
  for (var v10072 = 0; v10072 < CRp.BUFFER_COUNT; v10072++) {
    v10064.data.bufferCanvases[v10072] = v10066.createElement("canvas");
    v10064.data.bufferContexts[v10072] = v10064.data.bufferCanvases[v10072].getContext("2d");
    v10064.data.bufferCanvases[v10072].style.position = "absolute";
    v10064.data.bufferCanvases[v10072].setAttribute("data-id", "buffer" + v10072);
    v10064.data.bufferCanvases[v10072].style.zIndex = String(-v10072 - 1);
    v10064.data.bufferCanvases[v10072].style.visibility = "hidden";
  }
  v10064.pathsEnabled = true;
  var v10076 = makeBoundingBox();
  var v10077 = function v10078(v10079) {
    return {
      x: (v10079.x1 + v10079.x2) / 2,
      y: (v10079.y1 + v10079.y2) / 2
    };
  };
  var v10080 = function v10081(v10082) {
    return {
      x: -v10082.w / 2,
      y: -v10082.h / 2
    };
  };
  var v10083 = function v10084(v10085) {
    var v10086 = v10085[0]._private;
    var v10087 = v10086.oldBackgroundTimestamp === v10086.backgroundTimestamp;
    return !v10087;
  };
  var v10088 = function v10089(v10090) {
    return v10090[0]._private.nodeKey;
  };
  var v10091 = function v10092(v10093) {
    return v10093[0]._private.labelStyleKey;
  };
  var v10094 = function v10095(v10096) {
    return v10096[0]._private.sourceLabelStyleKey;
  };
  var v10097 = function v10098(v10099) {
    return v10099[0]._private.targetLabelStyleKey;
  };
  var v10100 = function v10101(v10102, v10103, v10104, v10105, v10106) {
    return v10064.drawElement(v10102, v10103, v10104, false, false, v10106);
  };
  var v10107 = function v10108(v10109, v10110, v10111, v10112, v10113) {
    return v10064.drawElementText(v10109, v10110, v10111, v10112, "main", v10113);
  };
  var v10114 = function v10115(v10116, v10117, v10118, v10119, v10120) {
    return v10064.drawElementText(v10116, v10117, v10118, v10119, "source", v10120);
  };
  var v10121 = function v10122(v10123, v10124, v10125, v10126, v10127) {
    return v10064.drawElementText(v10123, v10124, v10125, v10126, "target", v10127);
  };
  var v10128 = function v10129(v10130) {
    v10130.boundingBox();
    return v10130[0]._private.bodyBounds;
  };
  var v10131 = function v10132(v10133) {
    v10133.boundingBox();
    return v10133[0]._private.labelBounds.main || v10076;
  };
  var v10134 = function v10135(v10136) {
    v10136.boundingBox();
    return v10136[0]._private.labelBounds.source || v10076;
  };
  var v10137 = function v10138(v10139) {
    v10139.boundingBox();
    return v10139[0]._private.labelBounds.target || v10076;
  };
  var v10140 = function v10141(v10142, v10143) {
    return v10143;
  };
  var v10144 = function v10145(v10146) {
    return v10077(v10128(v10146));
  };
  var v10147 = function v10148(v10149, v10150, v10151) {
    var v10152 = v10149 ? v10149 + "-" : "";
    return {
      x: v10150.x + v10151.pstyle(v10152 + "text-margin-x").pfValue,
      y: v10150.y + v10151.pstyle(v10152 + "text-margin-y").pfValue
    };
  };
  var v10153 = function v10154(v10155, v10156, v10157) {
    var v10158 = v10155[0]._private.rscratch;
    return {
      x: v10158[v10156],
      y: v10158[v10157]
    };
  };
  var v10159 = function v10160(v10161) {
    return v10147("", v10153(v10161, "labelX", "labelY"), v10161);
  };
  var v10162 = function v10163(v10164) {
    return v10147("source", v10153(v10164, "sourceLabelX", "sourceLabelY"), v10164);
  };
  var v10165 = function v10166(v10167) {
    return v10147("target", v10153(v10167, "targetLabelX", "targetLabelY"), v10167);
  };
  var v10168 = function v10169(v10170) {
    return v10080(v10128(v10170));
  };
  var v10171 = function v10172(v10173) {
    return v10080(v10134(v10173));
  };
  var v10174 = function v10175(v10176) {
    return v10080(v10137(v10176));
  };
  var v10177 = function v10178(v10179) {
    var v10180 = v10131(v10179);
    var v10181 = v10080(v10131(v10179));
    if (v10179.isNode()) {
      switch (labelHalign(v10179.pstyle("text-halign").value)) {
        case "left":
          v10181.x = -v10180.w - (v10180.leftPad || 0);
          break;
        case "right":
          v10181.x = -(v10180.rightPad || 0);
          break;
      }
      switch (labelValign(v10179.pstyle("text-valign").value)) {
        case "top":
          v10181.y = -v10180.h - (v10180.topPad || 0);
          break;
        case "bottom":
          v10181.y = -(v10180.botPad || 0);
          break;
      }
    }
    return v10181;
  };
  var v10182 = v10064.data.eleTxrCache = new ElementTextureCache(v10064, {
    getKey: v10088,
    doesEleInvalidateKey: v10083,
    drawElement: v10100,
    getBoundingBox: v10128,
    getRotationPoint: v10144,
    getRotationOffset: v10168,
    allowEdgeTxrCaching: false,
    allowParentTxrCaching: false
  });
  var v10183 = v10064.data.lblTxrCache = new ElementTextureCache(v10064, {
    getKey: v10091,
    drawElement: v10107,
    getBoundingBox: v10131,
    getRotationPoint: v10159,
    getRotationOffset: v10177,
    isVisible: v10140
  });
  var v10184 = v10064.data.slbTxrCache = new ElementTextureCache(v10064, {
    getKey: v10094,
    drawElement: v10114,
    getBoundingBox: v10134,
    getRotationPoint: v10162,
    getRotationOffset: v10171,
    isVisible: v10140
  });
  var v10185 = v10064.data.tlbTxrCache = new ElementTextureCache(v10064, {
    getKey: v10097,
    drawElement: v10121,
    getBoundingBox: v10137,
    getRotationPoint: v10165,
    getRotationOffset: v10174,
    isVisible: v10140
  });
  var v10186 = v10064.data.lyrTxrCache = new LayeredTextureCache(v10064);
  v10064.onUpdateEleCalcs(function v10187(v10188, v10189) {
    v10182.invalidateElements(v10189);
    v10183.invalidateElements(v10189);
    v10184.invalidateElements(v10189);
    v10185.invalidateElements(v10189);
    v10186.invalidateElements(v10189);
    for (var v10190 = 0; v10190 < v10189.length; v10190++) {
      var v10191 = v10189[v10190]._private;
      v10191.oldBackgroundTimestamp = v10191.backgroundTimestamp;
    }
  });
  var v10192 = function v10193(v10194) {
    for (var v10195 = 0; v10195 < v10194.length; v10195++) {
      v10186.enqueueElementRefinement(v10194[v10195].ele);
    }
  };
  v10182.onDequeue(v10192);
  v10183.onDequeue(v10192);
  v10184.onDequeue(v10192);
  v10185.onDequeue(v10192);
  if (v10063.webgl) {
    v10064.initWebgl(v10063, {
      getStyleKey: v10088,
      getLabelKey: v10091,
      getSourceLabelKey: v10094,
      getTargetLabelKey: v10097,
      drawElement: v10100,
      drawLabel: v10107,
      drawSourceLabel: v10114,
      drawTargetLabel: v10121,
      getElementBox: v10128,
      getLabelBox: v10131,
      getSourceLabelBox: v10134,
      getTargetLabelBox: v10137,
      getElementRotationPoint: v10144,
      getElementRotationOffset: v10168,
      getLabelRotationPoint: v10159,
      getSourceLabelRotationPoint: v10162,
      getTargetLabelRotationPoint: v10165,
      getLabelRotationOffset: v10177,
      getSourceLabelRotationOffset: v10171,
      getTargetLabelRotationOffset: v10174
    });
  }
}
CRp.redrawHint = function (v10196, v10197) {
  var v10198 = this;
  switch (v10196) {
    case "eles":
      v10198.data.canvasNeedsRedraw[CRp.NODE] = v10197;
      break;
    case "drag":
      v10198.data.canvasNeedsRedraw[CRp.DRAG] = v10197;
      break;
    case "select":
      v10198.data.canvasNeedsRedraw[CRp.SELECT_BOX] = v10197;
      break;
    case "gc":
      v10198.data.gc = true;
      break;
  }
};
var pathsImpld = typeof Path2D !== "undefined";
CRp.path2dEnabled = function (v10199) {
  if (v10199 === undefined) {
    return this.pathsEnabled;
  }
  this.pathsEnabled = v10199 ? true : false;
};
CRp.usePaths = function () {
  return pathsImpld && this.pathsEnabled;
};
CRp.setImgSmoothing = function (v10200, v10201) {
  if (v10200.imageSmoothingEnabled != null) {
    v10200.imageSmoothingEnabled = v10201;
  } else {
    v10200.webkitImageSmoothingEnabled = v10201;
    v10200.mozImageSmoothingEnabled = v10201;
    v10200.msImageSmoothingEnabled = v10201;
  }
};
CRp.getImgSmoothing = function (v10202) {
  return v10202.imageSmoothingEnabled ?? (v10202.webkitImageSmoothingEnabled || v10202.mozImageSmoothingEnabled || v10202.msImageSmoothingEnabled);
};
CRp.makeOffscreenCanvas = function (v10203, v10204) {
  var v10205;
  if ((typeof OffscreenCanvas === "undefined" ? "undefined" : _typeof(OffscreenCanvas)) !== "undefined") {
    v10205 = new OffscreenCanvas(v10203, v10204);
  } else {
    var v10206 = this.cy.window();
    var v10207 = v10206.document;
    v10205 = v10207.createElement("canvas");
    v10205.width = v10203;
    v10205.height = v10204;
  }
  return v10205;
};
[CRp$b, CRp$a, CRp$9, CRp$8, CRp$7, CRp$6, CRp$5, CRp$4, CRp$3, CRp$2, CRp$1].forEach(function (v10208) {
  extend(CRp, v10208);
});
var renderer2 = [{
  name: "null",
  impl: NullRenderer
}, {
  name: "base",
  impl: BR
}, {
  name: "canvas",
  impl: CR
}];
var incExts = [{
  type: "layout",
  extensions: layout3
}, {
  type: "renderer",
  extensions: renderer2
}];
var extensions = {};
var modules = {};
function setExtension(v10209, v10210, v10211) {
  var v10212 = v10211;
  var v10213 = function v10214(v10215) {
    warn("Can not register `" + v10210 + "` for `" + v10209 + "` since `" + v10215 + "` already exists in the prototype and can not be overridden");
  };
  if (v10209 === "core") {
    if (Core.prototype[v10210]) {
      return v10213(v10210);
    } else {
      Core.prototype[v10210] = v10211;
    }
  } else if (v10209 === "collection") {
    if (Collection.prototype[v10210]) {
      return v10213(v10210);
    } else {
      Collection.prototype[v10210] = v10211;
    }
  } else if (v10209 === "layout") {
    var v10216 = function v10217(v10218) {
      this.options = v10218;
      v10211.call(this, v10218);
      if (!plainObject(this._private)) {
        this._private = {};
      }
      this._private.cy = v10218.cy;
      this._private.listeners = [];
      this.createEmitter();
    };
    var v10219 = v10216.prototype = Object.create(v10211.prototype);
    var v10220 = [];
    for (var v10221 = 0; v10221 < v10220.length; v10221++) {
      var v10222 = v10220[v10221];
      v10219[v10222] = v10219[v10222] || function () {
        return this;
      };
    }
    if (v10219.start && !v10219.run) {
      v10219.run = function () {
        this.start();
        return this;
      };
    } else if (!v10219.start && v10219.run) {
      v10219.start = function () {
        this.run();
        return this;
      };
    }
    var v10223 = v10211.prototype.stop;
    v10219.stop = function () {
      var v10224 = this.options;
      if (v10224 && v10224.animate) {
        var v10225 = this.animations;
        if (v10225) {
          for (var v10226 = 0; v10226 < v10225.length; v10226++) {
            v10225[v10226].stop();
          }
        }
      }
      if (v10223) {
        v10223.call(this);
      } else {
        this.emit("layoutstop");
      }
      return this;
    };
    if (!v10219.destroy) {
      v10219.destroy = function () {
        return this;
      };
    }
    v10219.cy = function () {
      return this._private.cy;
    };
    var v10227 = function v10228(v10229) {
      return v10229._private.cy;
    };
    var v10230 = {
      addEventFields: function v10231(v10232, v10233) {
        v10233.layout = v10232;
        v10233.cy = v10227(v10232);
        v10233.target = v10232;
      },
      bubble: function v10234() {
        return true;
      },
      parent: function v10235(v10236) {
        return v10227(v10236);
      }
    };
    extend(v10219, {
      createEmitter: function v10237() {
        this._private.emitter = new Emitter(v10230, this);
        return this;
      },
      emitter: function v10238() {
        return this._private.emitter;
      },
      on: function v10239(v10240, v10241) {
        this.emitter().on(v10240, v10241);
        return this;
      },
      one: function v10242(v10243, v10244) {
        this.emitter().one(v10243, v10244);
        return this;
      },
      once: function v10245(v10246, v10247) {
        this.emitter().one(v10246, v10247);
        return this;
      },
      removeListener: function v10248(v10249, v10250) {
        this.emitter().removeListener(v10249, v10250);
        return this;
      },
      removeAllListeners: function v10251() {
        this.emitter().removeAllListeners();
        return this;
      },
      emit: function v10252(v10253, v10254) {
        this.emitter().emit(v10253, v10254);
        return this;
      }
    });
    define.eventAliasesOn(v10219);
    v10212 = v10216;
  } else if (v10209 === "renderer" && v10210 !== "null" && v10210 !== "base") {
    var v10255 = getExtension("renderer", "base");
    var v10256 = v10255.prototype;
    var v10257 = v10211;
    var v10258 = v10211.prototype;
    var v10259 = function v10260() {
      v10255.apply(this, arguments);
      v10257.apply(this, arguments);
    };
    var v10261 = v10259.prototype;
    for (var v10262 in v10256) {
      var v10263 = v10256[v10262];
      var v10264 = v10258[v10262] != null;
      if (v10264) {
        return v10213(v10262);
      }
      v10261[v10262] = v10263;
    }
    for (var v10265 in v10258) {
      v10261[v10265] = v10258[v10265];
    }
    v10256.clientFunctions.forEach(function (v10266) {
      v10261[v10266] = v10261[v10266] || function () {
        error("Renderer does not implement `renderer." + v10266 + "()` on its prototype");
      };
    });
    v10212 = v10259;
  } else if (v10209 === "__proto__" || v10209 === "constructor" || v10209 === "prototype") {
    return error(v10209 + " is an illegal type to be registered, possibly lead to prototype pollutions");
  }
  return setMap({
    map: extensions,
    keys: [v10209, v10210],
    value: v10212
  });
}
function getExtension(v10267, v10268) {
  return getMap({
    map: extensions,
    keys: [v10267, v10268]
  });
}
function setModule(v10269, v10270, v10271, v10272, v10273) {
  return setMap({
    map: modules,
    keys: [v10269, v10270, v10271, v10272],
    value: v10273
  });
}
function getModule(v10274, v10275, v10276, v10277) {
  return getMap({
    map: modules,
    keys: [v10274, v10275, v10276, v10277]
  });
}
var extension = function extension2() {
  if (arguments.length === 2) {
    return getExtension.apply(null, arguments);
  } else if (arguments.length === 3) {
    return setExtension.apply(null, arguments);
  } else if (arguments.length === 4) {
    return getModule.apply(null, arguments);
  } else if (arguments.length === 5) {
    return setModule.apply(null, arguments);
  } else {
    error("Invalid extension access syntax");
  }
};
Core.prototype.extension = extension;
incExts.forEach(function (v10278) {
  v10278.extensions.forEach(function (v10279) {
    setExtension(v10278.type, v10279.name, v10279.impl);
  });
});
var _Stylesheet = function Stylesheet() {
  if (!(this instanceof _Stylesheet)) {
    return new _Stylesheet();
  }
  this.length = 0;
};
var sheetfn = _Stylesheet.prototype;
sheetfn.instanceString = function () {
  return "stylesheet";
};
sheetfn.selector = function (v10280) {
  var v10281 = this.length++;
  this[v10281] = {
    selector: v10280,
    properties: []
  };
  return this;
};
sheetfn.css = function (v10282, v10283) {
  var v10284 = this.length - 1;
  if (string(v10282)) {
    this[v10284].properties.push({
      name: v10282,
      value: v10283
    });
  } else if (plainObject(v10282)) {
    var v10285 = v10282;
    var v10286 = Object.keys(v10285);
    for (var v10287 = 0; v10287 < v10286.length; v10287++) {
      var v10288 = v10286[v10287];
      var v10289 = v10285[v10288];
      if (v10289 == null) {
        continue;
      }
      var v10290 = _Style.properties[v10288] || _Style.properties[dash2camel(v10288)];
      if (v10290 == null) {
        continue;
      }
      var v10291 = v10290.name;
      var v10292 = v10289;
      this[v10284].properties.push({
        name: v10291,
        value: v10292
      });
    }
  }
  return this;
};
sheetfn.style = sheetfn.css;
sheetfn.generateStyle = function (v10293) {
  var v10294 = new _Style(v10293);
  return this.appendToStyle(v10294);
};
sheetfn.appendToStyle = function (v10295) {
  for (var v10296 = 0; v10296 < this.length; v10296++) {
    var v10297 = this[v10296];
    var v10298 = v10297.selector;
    var v10299 = v10297.properties;
    v10295.selector(v10298);
    for (var v10300 = 0; v10300 < v10299.length; v10300++) {
      var v10301 = v10299[v10300];
      v10295.css(v10301.name, v10301.value);
    }
  }
  return v10295;
};
var version = "3.34.0";
var cytoscape = function cytoscape2(v10302 = {}) {
  if (plainObject(v10302)) {
    return new Core(v10302);
  } else if (string(v10302)) {
    return extension.apply(extension, arguments);
  }
};
cytoscape.use = function (v10303) {
  var v10304 = Array.prototype.slice.call(arguments, 1);
  v10304.unshift(cytoscape);
  v10303.apply(null, v10304);
  return this;
};
cytoscape.warnings = function (v10305) {
  return warnings(v10305);
};
cytoscape.version = version;
cytoscape.stylesheet = cytoscape.Stylesheet = _Stylesheet;
export { cytoscape as c };