function formatDecimal(v1) {
  if (Math.abs(v1 = Math.round(v1)) >= 1e+21) {
    return v1.toLocaleString("en").replace(/,/g, "");
  } else {
    return v1.toString(10);
  }
}
function formatDecimalParts(v2, v3) {
  if (!isFinite(v2) || v2 === 0) {
    return null;
  }
  var v4 = (v2 = v3 ? v2.toExponential(v3 - 1) : v2.toExponential()).indexOf("e");
  var v5 = v2.slice(0, v4);
  return [v5.length > 1 ? v5[0] + v5.slice(2) : v5, +v2.slice(v4 + 1)];
}
function exponent(v6) {
  v6 = formatDecimalParts(Math.abs(v6));
  if (v6) {
    return v6[1];
  } else {
    return NaN;
  }
}
function formatGroup(v7, v8) {
  return function (v9, v10) {
    var v11 = v9.length;
    var v12 = [];
    var v13 = 0;
    var v14 = v7[0];
    var v15 = 0;
    while (v11 > 0 && v14 > 0) {
      if (v15 + v14 + 1 > v10) {
        v14 = Math.max(1, v10 - v15);
      }
      v12.push(v9.substring(v11 -= v14, v11 + v14));
      if ((v15 += v14 + 1) > v10) {
        break;
      }
      v14 = v7[v13 = (v13 + 1) % v7.length];
    }
    return v12.reverse().join(v8);
  };
}
function formatNumerals(v16) {
  return function (v17) {
    return v17.replace(/[0-9]/g, function (v18) {
      return v16[+v18];
    });
  };
}
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(v19) {
  if (!(v20 = re.exec(v19))) {
    throw new Error("invalid format: " + v19);
  }
  var v20;
  return new FormatSpecifier({
    fill: v20[1],
    align: v20[2],
    sign: v20[3],
    symbol: v20[4],
    zero: v20[5],
    width: v20[6],
    comma: v20[7],
    precision: v20[8] && v20[8].slice(1),
    trim: v20[9],
    type: v20[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(v21) {
  this.fill = v21.fill === undefined ? " " : v21.fill + "";
  this.align = v21.align === undefined ? ">" : v21.align + "";
  this.sign = v21.sign === undefined ? "-" : v21.sign + "";
  this.symbol = v21.symbol === undefined ? "" : v21.symbol + "";
  this.zero = !!v21.zero;
  this.width = v21.width === undefined ? undefined : +v21.width;
  this.comma = !!v21.comma;
  this.precision = v21.precision === undefined ? undefined : +v21.precision;
  this.trim = !!v21.trim;
  this.type = v21.type === undefined ? "" : v21.type + "";
}
FormatSpecifier.prototype.toString = function () {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === undefined ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function formatTrim(v22) {
  v23: for (var v24 = v22.length, v25 = 1, v26 = -1, v27; v25 < v24; ++v25) {
    switch (v22[v25]) {
      case ".":
        v26 = v27 = v25;
        break;
      case "0":
        if (v26 === 0) {
          v26 = v25;
        }
        v27 = v25;
        break;
      default:
        if (!+v22[v25]) {
          break v23;
        }
        if (v26 > 0) {
          v26 = 0;
        }
        break;
    }
  }
  if (v26 > 0) {
    return v22.slice(0, v26) + v22.slice(v27 + 1);
  } else {
    return v22;
  }
}
var prefixExponent;
function formatPrefixAuto(v28, v29) {
  var v30 = formatDecimalParts(v28, v29);
  if (!v30) {
    prefixExponent = undefined;
    return v28.toPrecision(v29);
  }
  var v31 = v30[0];
  var v32 = v30[1];
  var v33 = v32 - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(v32 / 3))) * 3) + 1;
  var v34 = v31.length;
  if (v33 === v34) {
    return v31;
  } else if (v33 > v34) {
    return v31 + new Array(v33 - v34 + 1).join("0");
  } else if (v33 > 0) {
    return v31.slice(0, v33) + "." + v31.slice(v33);
  } else {
    return "0." + new Array(1 - v33).join("0") + formatDecimalParts(v28, Math.max(0, v29 + v33 - 1))[0];
  }
}
function formatRounded(v35, v36) {
  var v37 = formatDecimalParts(v35, v36);
  if (!v37) {
    return v35 + "";
  }
  var v38 = v37[0];
  var v39 = v37[1];
  if (v39 < 0) {
    return "0." + new Array(-v39).join("0") + v38;
  } else if (v38.length > v39 + 1) {
    return v38.slice(0, v39 + 1) + "." + v38.slice(v39 + 1);
  } else {
    return v38 + new Array(v39 - v38.length + 2).join("0");
  }
}
const formatTypes = {
  "%": (v40, v41) => (v40 * 100).toFixed(v41),
  b: v42 => Math.round(v42).toString(2),
  c: v43 => v43 + "",
  d: formatDecimal,
  e: (v44, v45) => v44.toExponential(v45),
  f: (v46, v47) => v46.toFixed(v47),
  g: (v48, v49) => v48.toPrecision(v49),
  o: v50 => Math.round(v50).toString(8),
  p: (v51, v52) => formatRounded(v51 * 100, v52),
  r: formatRounded,
  s: formatPrefixAuto,
  X: v53 => Math.round(v53).toString(16).toUpperCase(),
  x: v54 => Math.round(v54).toString(16)
};
function identity(v55) {
  return v55;
}
var map = Array.prototype.map;
var prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function formatLocale(v56) {
  var v57 = v56.grouping === undefined || v56.thousands === undefined ? identity : formatGroup(map.call(v56.grouping, Number), v56.thousands + "");
  var v58 = v56.currency === undefined ? "" : v56.currency[0] + "";
  var v59 = v56.currency === undefined ? "" : v56.currency[1] + "";
  var v60 = v56.decimal === undefined ? "." : v56.decimal + "";
  var v61 = v56.numerals === undefined ? identity : formatNumerals(map.call(v56.numerals, String));
  var v62 = v56.percent === undefined ? "%" : v56.percent + "";
  var v63 = v56.minus === undefined ? "−" : v56.minus + "";
  var v64 = v56.nan === undefined ? "NaN" : v56.nan + "";
  function v65(v66, v67) {
    v66 = formatSpecifier(v66);
    var v68 = v66.fill;
    var v69 = v66.align;
    var v70 = v66.sign;
    var v71 = v66.symbol;
    var v72 = v66.zero;
    var v73 = v66.width;
    var v74 = v66.comma;
    var v75 = v66.precision;
    var v76 = v66.trim;
    var v77 = v66.type;
    if (v77 === "n") {
      v74 = true;
      v77 = "g";
    } else if (!formatTypes[v77]) {
      if (v75 === undefined) {
        v75 = 12;
      }
      v76 = true;
      v77 = "g";
    }
    if (v72 || v68 === "0" && v69 === "=") {
      v72 = true;
      v68 = "0";
      v69 = "=";
    }
    var v78 = (v67 && v67.prefix !== undefined ? v67.prefix : "") + (v71 === "$" ? v58 : v71 === "#" && /[boxX]/.test(v77) ? "0" + v77.toLowerCase() : "");
    var v79 = (v71 === "$" ? v59 : /[%p]/.test(v77) ? v62 : "") + (v67 && v67.suffix !== undefined ? v67.suffix : "");
    var v80 = formatTypes[v77];
    var v81 = /[defgprs%]/.test(v77);
    v75 = v75 === undefined ? 6 : /[gprs]/.test(v77) ? Math.max(1, Math.min(21, v75)) : Math.max(0, Math.min(20, v75));
    function v82(v83) {
      var v84 = v78;
      var v85 = v79;
      var v86;
      var v87;
      var v88;
      if (v77 === "c") {
        v85 = v80(v83) + v85;
        v83 = "";
      } else {
        v83 = +v83;
        var v89 = v83 < 0 || 1 / v83 < 0;
        v83 = isNaN(v83) ? v64 : v80(Math.abs(v83), v75);
        if (v76) {
          v83 = formatTrim(v83);
        }
        if (v89 && +v83 === 0 && v70 !== "+") {
          v89 = false;
        }
        v84 = (v89 ? v70 === "(" ? v70 : v63 : v70 === "-" || v70 === "(" ? "" : v70) + v84;
        v85 = (v77 === "s" && !isNaN(v83) && prefixExponent !== undefined ? prefixes[8 + prefixExponent / 3] : "") + v85 + (v89 && v70 === "(" ? ")" : "");
        if (v81) {
          v86 = -1;
          v87 = v83.length;
          while (++v86 < v87) {
            v88 = v83.charCodeAt(v86);
            if (v88 < 48 || v88 > 57) {
              v85 = (v88 === 46 ? v60 + v83.slice(v86 + 1) : v83.slice(v86)) + v85;
              v83 = v83.slice(0, v86);
              break;
            }
          }
        }
      }
      if (v74 && !v72) {
        v83 = v57(v83, Infinity);
      }
      var v90 = v84.length + v83.length + v85.length;
      var v91 = v90 < v73 ? new Array(v73 - v90 + 1).join(v68) : "";
      if (v74 && v72) {
        v83 = v57(v91 + v83, v91.length ? v73 - v85.length : Infinity);
        v91 = "";
      }
      switch (v69) {
        case "<":
          v83 = v84 + v83 + v85 + v91;
          break;
        case "=":
          v83 = v84 + v91 + v83 + v85;
          break;
        case "^":
          v83 = v91.slice(0, v90 = v91.length >> 1) + v84 + v83 + v85 + v91.slice(v90);
          break;
        default:
          v83 = v91 + v84 + v83 + v85;
          break;
      }
      return v61(v83);
    }
    v82.toString = function () {
      return v66 + "";
    };
    return v82;
  }
  function v92(v93, v94) {
    var v95 = Math.max(-8, Math.min(8, Math.floor(exponent(v94) / 3))) * 3;
    var v96 = Math.pow(10, -v95);
    var v97 = v65((v93 = formatSpecifier(v93), v93.type = "f", v93), {
      suffix: prefixes[8 + v95 / 3]
    });
    return function (v98) {
      return v97(v96 * v98);
    };
  }
  return {
    format: v65,
    formatPrefix: v92
  };
}
var locale;
var format;
var formatPrefix;
defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale(v99) {
  locale = formatLocale(v99);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}
export { formatPrefix as a, format as b, exponent as e, formatSpecifier as f };