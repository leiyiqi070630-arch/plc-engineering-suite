var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$c = Object.prototype;
var hasOwnProperty$9 = objectProto$c.hasOwnProperty;
var nativeObjectToString$1 = objectProto$c.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;
function getRawTag(v1) {
  var v2 = hasOwnProperty$9.call(v1, symToStringTag$1);
  var v3 = v1[symToStringTag$1];
  try {
    v1[symToStringTag$1] = undefined;
    var v4 = true;
  } catch (v5) {}
  var v6 = nativeObjectToString$1.call(v1);
  if (v4) {
    if (v2) {
      v1[symToStringTag$1] = v3;
    } else {
      delete v1[symToStringTag$1];
    }
  }
  return v6;
}
var objectProto$b = Object.prototype;
var nativeObjectToString = objectProto$b.toString;
function objectToString(v7) {
  return nativeObjectToString.call(v7);
}
var nullTag = "[object Null]";
var undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;
function baseGetTag(v8) {
  if (v8 == null) {
    if (v8 === undefined) {
      return undefinedTag;
    } else {
      return nullTag;
    }
  }
  if (symToStringTag && symToStringTag in Object(v8)) {
    return getRawTag(v8);
  } else {
    return objectToString(v8);
  }
}
function isObjectLike(v9) {
  return v9 != null && typeof v9 == "object";
}
var symbolTag$1 = "[object Symbol]";
function isSymbol(v10) {
  return typeof v10 == "symbol" || isObjectLike(v10) && baseGetTag(v10) == symbolTag$1;
}
function arrayMap(v11, v12) {
  var v13 = -1;
  var v14 = v11 == null ? 0 : v11.length;
  var v15 = Array(v14);
  while (++v13 < v14) {
    v15[v13] = v12(v11[v13], v13, v11);
  }
  return v15;
}
var isArray = Array.isArray;
var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
function baseToString(v16) {
  if (typeof v16 == "string") {
    return v16;
  }
  if (isArray(v16)) {
    return arrayMap(v16, baseToString) + "";
  }
  if (isSymbol(v16)) {
    if (symbolToString) {
      return symbolToString.call(v16);
    } else {
      return "";
    }
  }
  var v17 = v16 + "";
  if (v17 == "0" && 1 / v16 == -Infinity) {
    return "-0";
  } else {
    return v17;
  }
}
function isObject(v18) {
  var v19 = typeof v18;
  return v18 != null && (v19 == "object" || v19 == "function");
}
function identity(v20) {
  return v20;
}
var asyncTag = "[object AsyncFunction]";
var funcTag$1 = "[object Function]";
var genTag = "[object GeneratorFunction]";
var proxyTag = "[object Proxy]";
function isFunction(v21) {
  if (!isObject(v21)) {
    return false;
  }
  var v22 = baseGetTag(v21);
  return v22 == funcTag$1 || v22 == genTag || v22 == asyncTag || v22 == proxyTag;
}
var coreJsData = root["__core-js_shared__"];
var maskSrcKey = function () {
  var v23 = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  if (v23) {
    return "Symbol(src)_1." + v23;
  } else {
    return "";
  }
}();
function isMasked(v24) {
  return !!maskSrcKey && maskSrcKey in v24;
}
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource(v25) {
  if (v25 != null) {
    try {
      return funcToString$1.call(v25);
    } catch (v26) {}
    try {
      return v25 + "";
    } catch (v27) {}
  }
  return "";
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype;
var objectProto$a = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$8 = objectProto$a.hasOwnProperty;
var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty$8).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function baseIsNative(v28) {
  if (!isObject(v28) || isMasked(v28)) {
    return false;
  }
  var v29 = isFunction(v28) ? reIsNative : reIsHostCtor;
  return v29.test(toSource(v28));
}
function getValue(v30, v31) {
  if (v30 == null) {
    return undefined;
  } else {
    return v30[v31];
  }
}
function getNative(v32, v33) {
  var v34 = getValue(v32, v33);
  if (baseIsNative(v34)) {
    return v34;
  } else {
    return undefined;
  }
}
var WeakMap = getNative(root, "WeakMap");
function apply(v35, v36, v37) {
  switch (v37.length) {
    case 0:
      return v35.call(v36);
    case 1:
      return v35.call(v36, v37[0]);
    case 2:
      return v35.call(v36, v37[0], v37[1]);
    case 3:
      return v35.call(v36, v37[0], v37[1], v37[2]);
  }
  return v35.apply(v36, v37);
}
function noop() {}
var HOT_COUNT = 800;
var HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(v38) {
  var v39 = 0;
  var v40 = 0;
  return function () {
    var v41 = nativeNow();
    var v42 = HOT_SPAN - (v41 - v40);
    v40 = v41;
    if (v42 > 0) {
      if (++v39 >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      v39 = 0;
    }
    return v38.apply(undefined, arguments);
  };
}
function constant(v43) {
  return function () {
    return v43;
  };
}
var defineProperty = function () {
  try {
    var v44 = getNative(Object, "defineProperty");
    v44({}, "", {});
    return v44;
  } catch (v45) {}
}();
var baseSetToString = !defineProperty ? identity : function (v46, v47) {
  return defineProperty(v46, "toString", {
    configurable: true,
    enumerable: false,
    value: constant(v47),
    writable: true
  });
};
var setToString = shortOut(baseSetToString);
function arrayEach(v48, v49) {
  var v50 = -1;
  var v51 = v48 == null ? 0 : v48.length;
  while (++v50 < v51) {
    if (v49(v48[v50], v50, v48) === false) {
      break;
    }
  }
  return v48;
}
function baseFindIndex(v52, v53, v54, v55) {
  var v56 = v52.length;
  var v57 = v54 + -1;
  while (++v57 < v56) {
    if (v53(v52[v57], v57, v52)) {
      return v57;
    }
  }
  return -1;
}
function baseIsNaN(v58) {
  return v58 !== v58;
}
function strictIndexOf(v59, v60, v61) {
  var v62 = v61 - 1;
  var v63 = v59.length;
  while (++v62 < v63) {
    if (v59[v62] === v60) {
      return v62;
    }
  }
  return -1;
}
function baseIndexOf(v64, v65, v66) {
  if (v65 === v65) {
    return strictIndexOf(v64, v65, v66);
  } else {
    return baseFindIndex(v64, baseIsNaN, v66);
  }
}
function arrayIncludes(v67, v68) {
  var v69 = v67 == null ? 0 : v67.length;
  return !!v69 && baseIndexOf(v67, v68, 0) > -1;
}
var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(v70, v71) {
  var v72 = typeof v70;
  v71 = v71 == null ? MAX_SAFE_INTEGER$1 : v71;
  return !!v71 && (v72 == "number" || v72 != "symbol" && reIsUint.test(v70)) && v70 > -1 && v70 % 1 == 0 && v70 < v71;
}
function eq(v73, v74) {
  return v73 === v74 || v73 !== v73 && v74 !== v74;
}
var nativeMax = Math.max;
function overRest(v75, v76, v77) {
  v76 = nativeMax(v76 === undefined ? v75.length - 1 : v76, 0);
  return function () {
    var v78 = arguments;
    var v79 = -1;
    var v80 = nativeMax(v78.length - v76, 0);
    var v81 = Array(v80);
    while (++v79 < v80) {
      v81[v79] = v78[v76 + v79];
    }
    v79 = -1;
    var v82 = Array(v76 + 1);
    while (++v79 < v76) {
      v82[v79] = v78[v79];
    }
    v82[v76] = v77(v81);
    return apply(v75, this, v82);
  };
}
function baseRest(v83, v84) {
  return setToString(overRest(v83, v84, identity), v83 + "");
}
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(v85) {
  return typeof v85 == "number" && v85 > -1 && v85 % 1 == 0 && v85 <= MAX_SAFE_INTEGER;
}
function isArrayLike(v86) {
  return v86 != null && isLength(v86.length) && !isFunction(v86);
}
var objectProto$9 = Object.prototype;
function isPrototype(v87) {
  var v88 = v87 && v87.constructor;
  var v89 = typeof v88 == "function" && v88.prototype || objectProto$9;
  return v87 === v89;
}
function baseTimes(v90, v91) {
  var v92 = -1;
  var v93 = Array(v90);
  while (++v92 < v90) {
    v93[v92] = v91(v92);
  }
  return v93;
}
var argsTag$2 = "[object Arguments]";
function baseIsArguments(v94) {
  return isObjectLike(v94) && baseGetTag(v94) == argsTag$2;
}
var objectProto$8 = Object.prototype;
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$8.propertyIsEnumerable;
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (v95) {
  return isObjectLike(v95) && hasOwnProperty$7.call(v95, "callee") && !propertyIsEnumerable$1.call(v95, "callee");
};
function stubFalse() {
  return false;
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var Buffer = moduleExports$1 ? root.Buffer : undefined;
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
var isBuffer = nativeIsBuffer || stubFalse;
var argsTag$1 = "[object Arguments]";
var arrayTag$1 = "[object Array]";
var boolTag$1 = "[object Boolean]";
var dateTag$1 = "[object Date]";
var errorTag$1 = "[object Error]";
var funcTag = "[object Function]";
var mapTag$3 = "[object Map]";
var numberTag$1 = "[object Number]";
var objectTag$2 = "[object Object]";
var regexpTag$1 = "[object RegExp]";
var setTag$3 = "[object Set]";
var stringTag$1 = "[object String]";
var weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag$1 = "[object ArrayBuffer]";
var dataViewTag$2 = "[object DataView]";
var float32Tag = "[object Float32Array]";
var float64Tag = "[object Float64Array]";
var int8Tag = "[object Int8Array]";
var int16Tag = "[object Int16Array]";
var int32Tag = "[object Int32Array]";
var uint8Tag = "[object Uint8Array]";
var uint8ClampedTag = "[object Uint8ClampedArray]";
var uint16Tag = "[object Uint16Array]";
var uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$3] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$3] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray(v96) {
  return isObjectLike(v96) && isLength(v96.length) && !!typedArrayTags[baseGetTag(v96)];
}
function baseUnary(v97) {
  return function (v98) {
    return v97(v98);
  };
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var freeProcess = moduleExports && freeGlobal.process;
var nodeUtil = function () {
  try {
    var v99 = freeModule && freeModule.require && freeModule.require("util").types;
    if (v99) {
      return v99;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (v100) {}
}();
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var objectProto$7 = Object.prototype;
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
function arrayLikeKeys(v101, v102) {
  var v103 = isArray(v101);
  var v104 = !v103 && isArguments(v101);
  var v105 = !v103 && !v104 && isBuffer(v101);
  var v106 = !v103 && !v104 && !v105 && isTypedArray(v101);
  var v107 = v103 || v104 || v105 || v106;
  var v108 = v107 ? baseTimes(v101.length, String) : [];
  var v109 = v108.length;
  for (var v110 in v101) {
    if ((v102 || hasOwnProperty$6.call(v101, v110)) && (!v107 || v110 != "length" && (!v105 || v110 != "offset" && v110 != "parent") && (!v106 || v110 != "buffer" && v110 != "byteLength" && v110 != "byteOffset") && !isIndex(v110, v109))) {
      v108.push(v110);
    }
  }
  return v108;
}
function overArg(v111, v112) {
  return function (v113) {
    return v111(v112(v113));
  };
}
var nativeKeys = overArg(Object.keys, Object);
var objectProto$6 = Object.prototype;
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
function baseKeys(v114) {
  if (!isPrototype(v114)) {
    return nativeKeys(v114);
  }
  var v115 = [];
  for (var v116 in Object(v114)) {
    if (hasOwnProperty$5.call(v114, v116) && v116 != "constructor") {
      v115.push(v116);
    }
  }
  return v115;
}
function keys(v117) {
  if (isArrayLike(v117)) {
    return arrayLikeKeys(v117);
  } else {
    return baseKeys(v117);
  }
}
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;
function isKey(v118, v119) {
  if (isArray(v118)) {
    return false;
  }
  var v120 = typeof v118;
  if (v120 == "number" || v120 == "symbol" || v120 == "boolean" || v118 == null || isSymbol(v118)) {
    return true;
  }
  return reIsPlainProp.test(v118) || !reIsDeepProp.test(v118) || v119 != null && v118 in Object(v119);
}
var nativeCreate = getNative(Object, "create");
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}
function hashDelete(v121) {
  var v122 = this.has(v121) && delete this.__data__[v121];
  this.size -= v122 ? 1 : 0;
  return v122;
}
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$5 = Object.prototype;
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
function hashGet(v123) {
  var v124 = this.__data__;
  if (nativeCreate) {
    var v125 = v124[v123];
    if (v125 === HASH_UNDEFINED$2) {
      return undefined;
    } else {
      return v125;
    }
  }
  if (hasOwnProperty$4.call(v124, v123)) {
    return v124[v123];
  } else {
    return undefined;
  }
}
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function hashHas(v126) {
  var v127 = this.__data__;
  if (nativeCreate) {
    return v127[v126] !== undefined;
  } else {
    return hasOwnProperty$3.call(v127, v126);
  }
}
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet(v128, v129) {
  var v130 = this.__data__;
  this.size += this.has(v128) ? 0 : 1;
  v130[v128] = nativeCreate && v129 === undefined ? HASH_UNDEFINED$1 : v129;
  return this;
}
function Hash(v131) {
  var v132 = -1;
  var v133 = v131 == null ? 0 : v131.length;
  this.clear();
  while (++v132 < v133) {
    var v134 = v131[v132];
    this.set(v134[0], v134[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype.delete = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
function assocIndexOf(v135, v136) {
  var v137 = v135.length;
  while (v137--) {
    if (eq(v135[v137][0], v136)) {
      return v137;
    }
  }
  return -1;
}
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(v138) {
  var v139 = this.__data__;
  var v140 = assocIndexOf(v139, v138);
  if (v140 < 0) {
    return false;
  }
  var v141 = v139.length - 1;
  if (v140 == v141) {
    v139.pop();
  } else {
    splice.call(v139, v140, 1);
  }
  --this.size;
  return true;
}
function listCacheGet(v142) {
  var v143 = this.__data__;
  var v144 = assocIndexOf(v143, v142);
  if (v144 < 0) {
    return undefined;
  } else {
    return v143[v144][1];
  }
}
function listCacheHas(v145) {
  return assocIndexOf(this.__data__, v145) > -1;
}
function listCacheSet(v146, v147) {
  var v148 = this.__data__;
  var v149 = assocIndexOf(v148, v146);
  if (v149 < 0) {
    ++this.size;
    v148.push([v146, v147]);
  } else {
    v148[v149][1] = v147;
  }
  return this;
}
function ListCache(v150) {
  var v151 = -1;
  var v152 = v150 == null ? 0 : v150.length;
  this.clear();
  while (++v151 < v152) {
    var v153 = v150[v151];
    this.set(v153[0], v153[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype.delete = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
var Map = getNative(root, "Map");
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    hash: new Hash(),
    map: new (Map || ListCache)(),
    string: new Hash()
  };
}
function isKeyable(v154) {
  var v155 = typeof v154;
  if (v155 == "string" || v155 == "number" || v155 == "symbol" || v155 == "boolean") {
    return v154 !== "__proto__";
  } else {
    return v154 === null;
  }
}
function getMapData(v156, v157) {
  var v158 = v156.__data__;
  if (isKeyable(v157)) {
    return v158[typeof v157 == "string" ? "string" : "hash"];
  } else {
    return v158.map;
  }
}
function mapCacheDelete(v159) {
  var v160 = getMapData(this, v159).delete(v159);
  this.size -= v160 ? 1 : 0;
  return v160;
}
function mapCacheGet(v161) {
  return getMapData(this, v161).get(v161);
}
function mapCacheHas(v162) {
  return getMapData(this, v162).has(v162);
}
function mapCacheSet(v163, v164) {
  var v165 = getMapData(this, v163);
  var v166 = v165.size;
  v165.set(v163, v164);
  this.size += v165.size == v166 ? 0 : 1;
  return this;
}
function MapCache(v167) {
  var v168 = -1;
  var v169 = v167 == null ? 0 : v167.length;
  this.clear();
  while (++v168 < v169) {
    var v170 = v167[v168];
    this.set(v170[0], v170[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype.delete = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(v171, v172) {
  if (typeof v171 != "function" || v172 != null && typeof v172 != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  function v173() {
    var v174 = arguments;
    var v175 = v172 ? v172.apply(this, v174) : v174[0];
    var v176 = v173.cache;
    if (v176.has(v175)) {
      return v176.get(v175);
    }
    var v177 = v171.apply(this, v174);
    v173.cache = v176.set(v175, v177) || v176;
    return v177;
  }
  v173.cache = new (memoize.Cache || MapCache)();
  return v173;
}
memoize.Cache = MapCache;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(v178) {
  var v179 = memoize(v178, function (v180) {
    if (v181.size === MAX_MEMOIZE_SIZE) {
      v181.clear();
    }
    return v180;
  });
  var v181 = v179.cache;
  return v179;
}
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped(function (v182) {
  var v183 = [];
  if (v182.charCodeAt(0) === 46) {
    v183.push("");
  }
  v182.replace(rePropName, function (v184, v185, v186, v187) {
    v183.push(v186 ? v187.replace(reEscapeChar, "$1") : v185 || v184);
  });
  return v183;
});
function toString(v188) {
  if (v188 == null) {
    return "";
  } else {
    return baseToString(v188);
  }
}
function castPath(v189, v190) {
  if (isArray(v189)) {
    return v189;
  }
  if (isKey(v189, v190)) {
    return [v189];
  } else {
    return stringToPath(toString(v189));
  }
}
function toKey(v191) {
  if (typeof v191 == "string" || isSymbol(v191)) {
    return v191;
  }
  var v192 = v191 + "";
  if (v192 == "0" && 1 / v191 == -Infinity) {
    return "-0";
  } else {
    return v192;
  }
}
function baseGet(v193, v194) {
  v194 = castPath(v194, v193);
  var v195 = 0;
  var v196 = v194.length;
  while (v193 != null && v195 < v196) {
    v193 = v193[toKey(v194[v195++])];
  }
  if (v195 && v195 == v196) {
    return v193;
  } else {
    return undefined;
  }
}
function get(v197, v198, v199) {
  var v200 = v197 == null ? undefined : baseGet(v197, v198);
  if (v200 === undefined) {
    return v199;
  } else {
    return v200;
  }
}
function arrayPush(v201, v202) {
  var v203 = -1;
  var v204 = v202.length;
  var v205 = v201.length;
  while (++v203 < v204) {
    v201[v205 + v203] = v202[v203];
  }
  return v201;
}
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;
function isFlattenable(v206) {
  return isArray(v206) || isArguments(v206) || !!spreadableSymbol && !!v206 && !!v206[spreadableSymbol];
}
function baseFlatten(v207, v208, v209, v210, v211) {
  var v212 = -1;
  var v213 = v207.length;
  v209 ||= isFlattenable;
  v211 ||= [];
  while (++v212 < v213) {
    var v214 = v207[v212];
    if (v209(v214)) {
      arrayPush(v211, v214);
    } else if (!v210) {
      v211[v211.length] = v214;
    }
  }
  return v211;
}
function arrayReduce(v215, v216, v217, v218) {
  var v219 = -1;
  var v220 = v215 == null ? 0 : v215.length;
  if (v218 && v220) {
    v217 = v215[++v219];
  }
  while (++v219 < v220) {
    v217 = v216(v217, v215[v219], v219, v215);
  }
  return v217;
}
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
function stackDelete(v221) {
  var v222 = this.__data__;
  var v223 = v222.delete(v221);
  this.size = v222.size;
  return v223;
}
function stackGet(v224) {
  return this.__data__.get(v224);
}
function stackHas(v225) {
  return this.__data__.has(v225);
}
var LARGE_ARRAY_SIZE$1 = 200;
function stackSet(v226, v227) {
  var v228 = this.__data__;
  if (v228 instanceof ListCache) {
    var v229 = v228.__data__;
    if (!Map || v229.length < LARGE_ARRAY_SIZE$1 - 1) {
      v229.push([v226, v227]);
      this.size = ++v228.size;
      return this;
    }
    v228 = this.__data__ = new MapCache(v229);
  }
  v228.set(v226, v227);
  this.size = v228.size;
  return this;
}
function Stack(v230) {
  var v231 = this.__data__ = new ListCache(v230);
  this.size = v231.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype.delete = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function arrayFilter(v232, v233) {
  var v234 = -1;
  var v235 = v232 == null ? 0 : v232.length;
  var v236 = 0;
  var v237 = [];
  while (++v234 < v235) {
    var v238 = v232[v234];
    if (v233(v238, v234, v232)) {
      v237[v236++] = v238;
    }
  }
  return v237;
}
function stubArray() {
  return [];
}
var objectProto$3 = Object.prototype;
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray : function (v239) {
  if (v239 == null) {
    return [];
  }
  v239 = Object(v239);
  return arrayFilter(nativeGetSymbols(v239), function (v240) {
    return propertyIsEnumerable.call(v239, v240);
  });
};
function baseGetAllKeys(v241, v242, v243) {
  var v244 = v242(v241);
  if (isArray(v241)) {
    return v244;
  } else {
    return arrayPush(v244, v243(v241));
  }
}
function getAllKeys(v245) {
  return baseGetAllKeys(v245, keys, getSymbols);
}
var DataView = getNative(root, "DataView");
var Promise$1 = getNative(root, "Promise");
var Set = getNative(root, "Set");
var mapTag$2 = "[object Map]";
var objectTag$1 = "[object Object]";
var promiseTag = "[object Promise]";
var setTag$2 = "[object Set]";
var weakMapTag = "[object WeakMap]";
var dataViewTag$1 = "[object DataView]";
var dataViewCtorString = toSource(DataView);
var mapCtorString = toSource(Map);
var promiseCtorString = toSource(Promise$1);
var setCtorString = toSource(Set);
var weakMapCtorString = toSource(WeakMap);
var getTag = baseGetTag;
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1 || Map && getTag(new Map()) != mapTag$2 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set && getTag(new Set()) != setTag$2 || WeakMap && getTag(new WeakMap()) != weakMapTag) {
  getTag = function (v246) {
    var v247 = baseGetTag(v246);
    var v248 = v247 == objectTag$1 ? v246.constructor : undefined;
    var v249 = v248 ? toSource(v248) : "";
    if (v249) {
      switch (v249) {
        case dataViewCtorString:
          return dataViewTag$1;
        case mapCtorString:
          return mapTag$2;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$2;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return v247;
  };
}
var Uint8Array = root.Uint8Array;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd(v250) {
  this.__data__.set(v250, HASH_UNDEFINED);
  return this;
}
function setCacheHas(v251) {
  return this.__data__.has(v251);
}
function SetCache(v252) {
  var v253 = -1;
  var v254 = v252 == null ? 0 : v252.length;
  this.__data__ = new MapCache();
  while (++v253 < v254) {
    this.add(v252[v253]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function arraySome(v255, v256) {
  var v257 = -1;
  var v258 = v255 == null ? 0 : v255.length;
  while (++v257 < v258) {
    if (v256(v255[v257], v257, v255)) {
      return true;
    }
  }
  return false;
}
function cacheHas(v259, v260) {
  return v259.has(v260);
}
var COMPARE_PARTIAL_FLAG$5 = 1;
var COMPARE_UNORDERED_FLAG$3 = 2;
function equalArrays(v261, v262, v263, v264, v265, v266) {
  var v267 = v263 & COMPARE_PARTIAL_FLAG$5;
  var v268 = v261.length;
  var v269 = v262.length;
  if (v268 != v269 && (!v267 || !(v269 > v268))) {
    return false;
  }
  var v270 = v266.get(v261);
  var v271 = v266.get(v262);
  if (v270 && v271) {
    return v270 == v262 && v271 == v261;
  }
  var v272 = -1;
  var v273 = true;
  var v274 = v263 & COMPARE_UNORDERED_FLAG$3 ? new SetCache() : undefined;
  v266.set(v261, v262);
  v266.set(v262, v261);
  while (++v272 < v268) {
    var v275 = v261[v272];
    var v276 = v262[v272];
    if (v264) {
      var v277 = v267 ? v264(v276, v275, v272, v262, v261, v266) : v264(v275, v276, v272, v261, v262, v266);
    }
    if (v277 !== undefined) {
      if (v277) {
        continue;
      }
      v273 = false;
      break;
    }
    if (v274) {
      if (!arraySome(v262, function (v278, v279) {
        if (!cacheHas(v274, v279) && (v275 === v278 || v265(v275, v278, v263, v264, v266))) {
          return v274.push(v279);
        }
      })) {
        v273 = false;
        break;
      }
    } else if (v275 !== v276 && !v265(v275, v276, v263, v264, v266)) {
      v273 = false;
      break;
    }
  }
  v266.delete(v261);
  v266.delete(v262);
  return v273;
}
function mapToArray(v280) {
  var v281 = -1;
  var v282 = Array(v280.size);
  v280.forEach(function (v283, v284) {
    v282[++v281] = [v284, v283];
  });
  return v282;
}
function setToArray(v285) {
  var v286 = -1;
  var v287 = Array(v285.size);
  v285.forEach(function (v288) {
    v287[++v286] = v288;
  });
  return v287;
}
var COMPARE_PARTIAL_FLAG$4 = 1;
var COMPARE_UNORDERED_FLAG$2 = 2;
var boolTag = "[object Boolean]";
var dateTag = "[object Date]";
var errorTag = "[object Error]";
var mapTag$1 = "[object Map]";
var numberTag = "[object Number]";
var regexpTag = "[object RegExp]";
var setTag$1 = "[object Set]";
var stringTag = "[object String]";
var symbolTag = "[object Symbol]";
var arrayBufferTag = "[object ArrayBuffer]";
var dataViewTag = "[object DataView]";
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
function equalByTag(v289, v290, v291, v292, v293, v294, v295) {
  switch (v291) {
    case dataViewTag:
      if (v289.byteLength != v290.byteLength || v289.byteOffset != v290.byteOffset) {
        return false;
      }
      v289 = v289.buffer;
      v290 = v290.buffer;
    case arrayBufferTag:
      if (v289.byteLength != v290.byteLength || !v294(new Uint8Array(v289), new Uint8Array(v290))) {
        return false;
      }
      return true;
    case boolTag:
    case dateTag:
    case numberTag:
      return eq(+v289, +v290);
    case errorTag:
      return v289.name == v290.name && v289.message == v290.message;
    case regexpTag:
    case stringTag:
      return v289 == v290 + "";
    case mapTag$1:
      var v296 = mapToArray;
    case setTag$1:
      var v297 = v292 & COMPARE_PARTIAL_FLAG$4;
      v296 ||= setToArray;
      if (v289.size != v290.size && !v297) {
        return false;
      }
      var v298 = v295.get(v289);
      if (v298) {
        return v298 == v290;
      }
      v292 |= COMPARE_UNORDERED_FLAG$2;
      v295.set(v289, v290);
      var v299 = equalArrays(v296(v289), v296(v290), v292, v293, v294, v295);
      v295.delete(v289);
      return v299;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(v289) == symbolValueOf.call(v290);
      }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG$3 = 1;
var objectProto$2 = Object.prototype;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
function equalObjects(v300, v301, v302, v303, v304, v305) {
  var v306 = v302 & COMPARE_PARTIAL_FLAG$3;
  var v307 = getAllKeys(v300);
  var v308 = v307.length;
  var v309 = getAllKeys(v301);
  var v310 = v309.length;
  if (v308 != v310 && !v306) {
    return false;
  }
  var v311 = v308;
  while (v311--) {
    var v312 = v307[v311];
    if (!(v306 ? v312 in v301 : hasOwnProperty$2.call(v301, v312))) {
      return false;
    }
  }
  var v313 = v305.get(v300);
  var v314 = v305.get(v301);
  if (v313 && v314) {
    return v313 == v301 && v314 == v300;
  }
  var v315 = true;
  v305.set(v300, v301);
  v305.set(v301, v300);
  var v316 = v306;
  while (++v311 < v308) {
    v312 = v307[v311];
    var v317 = v300[v312];
    var v318 = v301[v312];
    if (v303) {
      var v319 = v306 ? v303(v318, v317, v312, v301, v300, v305) : v303(v317, v318, v312, v300, v301, v305);
    }
    if (!(v319 === undefined ? v317 === v318 || v304(v317, v318, v302, v303, v305) : v319)) {
      v315 = false;
      break;
    }
    v316 ||= v312 == "constructor";
  }
  if (v315 && !v316) {
    var v320 = v300.constructor;
    var v321 = v301.constructor;
    if (v320 != v321 && "constructor" in v300 && "constructor" in v301 && (typeof v320 != "function" || !(v320 instanceof v320) || typeof v321 != "function" || !(v321 instanceof v321))) {
      v315 = false;
    }
  }
  v305.delete(v300);
  v305.delete(v301);
  return v315;
}
var COMPARE_PARTIAL_FLAG$2 = 1;
var argsTag = "[object Arguments]";
var arrayTag = "[object Array]";
var objectTag = "[object Object]";
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function baseIsEqualDeep(v322, v323, v324, v325, v326, v327) {
  var v328 = isArray(v322);
  var v329 = isArray(v323);
  var v330 = v328 ? arrayTag : getTag(v322);
  var v331 = v329 ? arrayTag : getTag(v323);
  v330 = v330 == argsTag ? objectTag : v330;
  v331 = v331 == argsTag ? objectTag : v331;
  var v332 = v330 == objectTag;
  var v333 = v331 == objectTag;
  var v334 = v330 == v331;
  if (v334 && isBuffer(v322)) {
    if (!isBuffer(v323)) {
      return false;
    }
    v328 = true;
    v332 = false;
  }
  if (v334 && !v332) {
    v327 ||= new Stack();
    if (v328 || isTypedArray(v322)) {
      return equalArrays(v322, v323, v324, v325, v326, v327);
    } else {
      return equalByTag(v322, v323, v330, v324, v325, v326, v327);
    }
  }
  if (!(v324 & COMPARE_PARTIAL_FLAG$2)) {
    var v335 = v332 && hasOwnProperty$1.call(v322, "__wrapped__");
    var v336 = v333 && hasOwnProperty$1.call(v323, "__wrapped__");
    if (v335 || v336) {
      var v337 = v335 ? v322.value() : v322;
      var v338 = v336 ? v323.value() : v323;
      v327 ||= new Stack();
      return v326(v337, v338, v324, v325, v327);
    }
  }
  if (!v334) {
    return false;
  }
  v327 ||= new Stack();
  return equalObjects(v322, v323, v324, v325, v326, v327);
}
function baseIsEqual(v339, v340, v341, v342, v343) {
  if (v339 === v340) {
    return true;
  }
  if (v339 == null || v340 == null || !isObjectLike(v339) && !isObjectLike(v340)) {
    return v339 !== v339 && v340 !== v340;
  }
  return baseIsEqualDeep(v339, v340, v341, v342, baseIsEqual, v343);
}
var COMPARE_PARTIAL_FLAG$1 = 1;
var COMPARE_UNORDERED_FLAG$1 = 2;
function baseIsMatch(v344, v345, v346, v347) {
  var v348 = v346.length;
  var v349 = v348;
  if (v344 == null) {
    return !v349;
  }
  v344 = Object(v344);
  while (v348--) {
    var v350 = v346[v348];
    if (v350[2] ? v350[1] !== v344[v350[0]] : !(v350[0] in v344)) {
      return false;
    }
  }
  while (++v348 < v349) {
    v350 = v346[v348];
    var v351 = v350[0];
    var v352 = v344[v351];
    var v353 = v350[1];
    if (v350[2]) {
      if (v352 === undefined && !(v351 in v344)) {
        return false;
      }
    } else {
      var v354 = new Stack();
      var v355;
      if (!(v355 === undefined ? baseIsEqual(v353, v352, COMPARE_PARTIAL_FLAG$1 | COMPARE_UNORDERED_FLAG$1, v347, v354) : v355)) {
        return false;
      }
    }
  }
  return true;
}
function isStrictComparable(v356) {
  return v356 === v356 && !isObject(v356);
}
function getMatchData(v357) {
  var v358 = keys(v357);
  var v359 = v358.length;
  while (v359--) {
    var v360 = v358[v359];
    var v361 = v357[v360];
    v358[v359] = [v360, v361, isStrictComparable(v361)];
  }
  return v358;
}
function matchesStrictComparable(v362, v363) {
  return function (v364) {
    if (v364 == null) {
      return false;
    }
    return v364[v362] === v363 && (v363 !== undefined || v362 in Object(v364));
  };
}
function baseMatches(v365) {
  var v366 = getMatchData(v365);
  if (v366.length == 1 && v366[0][2]) {
    return matchesStrictComparable(v366[0][0], v366[0][1]);
  }
  return function (v367) {
    return v367 === v365 || baseIsMatch(v367, v365, v366);
  };
}
function baseHasIn(v368, v369) {
  return v368 != null && v369 in Object(v368);
}
function hasPath(v370, v371, v372) {
  v371 = castPath(v371, v370);
  var v373 = -1;
  var v374 = v371.length;
  var v375 = false;
  while (++v373 < v374) {
    var v376 = toKey(v371[v373]);
    if (!(v375 = v370 != null && v372(v370, v376))) {
      break;
    }
    v370 = v370[v376];
  }
  if (v375 || ++v373 != v374) {
    return v375;
  }
  v374 = v370 == null ? 0 : v370.length;
  return !!v374 && isLength(v374) && isIndex(v376, v374) && (isArray(v370) || isArguments(v370));
}
function hasIn(v377, v378) {
  return v377 != null && hasPath(v377, v378, baseHasIn);
}
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;
function baseMatchesProperty(v379, v380) {
  if (isKey(v379) && isStrictComparable(v380)) {
    return matchesStrictComparable(toKey(v379), v380);
  }
  return function (v381) {
    var v382 = get(v381, v379);
    if (v382 === undefined && v382 === v380) {
      return hasIn(v381, v379);
    } else {
      return baseIsEqual(v380, v382, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
    }
  };
}
function baseProperty(v383) {
  return function (v384) {
    if (v384 == null) {
      return undefined;
    } else {
      return v384[v383];
    }
  };
}
function basePropertyDeep(v385) {
  return function (v386) {
    return baseGet(v386, v385);
  };
}
function property(v387) {
  if (isKey(v387)) {
    return baseProperty(toKey(v387));
  } else {
    return basePropertyDeep(v387);
  }
}
function baseIteratee(v388) {
  if (typeof v388 == "function") {
    return v388;
  }
  if (v388 == null) {
    return identity;
  }
  if (typeof v388 == "object") {
    if (isArray(v388)) {
      return baseMatchesProperty(v388[0], v388[1]);
    } else {
      return baseMatches(v388);
    }
  }
  return property(v388);
}
function createBaseFor(v389) {
  return function (v390, v391, v392) {
    var v393 = -1;
    var v394 = Object(v390);
    var v395 = v392(v390);
    var v396 = v395.length;
    while (v396--) {
      var v397 = v395[++v393];
      if (v391(v394[v397], v397, v394) === false) {
        break;
      }
    }
    return v390;
  };
}
var baseFor = createBaseFor();
function baseForOwn(v398, v399) {
  return v398 && baseFor(v398, v399, keys);
}
function createBaseEach(v400, v401) {
  return function (v402, v403) {
    if (v402 == null) {
      return v402;
    }
    if (!isArrayLike(v402)) {
      return v400(v402, v403);
    }
    var v404 = v402.length;
    var v405 = -1;
    var v406 = Object(v402);
    while (++v405 < v404) {
      if (v403(v406[v405], v405, v406) === false) {
        break;
      }
    }
    return v402;
  };
}
var baseEach = createBaseEach(baseForOwn);
function isArrayLikeObject(v407) {
  return isObjectLike(v407) && isArrayLike(v407);
}
function castFunction(v408) {
  if (typeof v408 == "function") {
    return v408;
  } else {
    return identity;
  }
}
function forEach(v409, v410) {
  var v411 = isArray(v409) ? arrayEach : baseEach;
  return v411(v409, castFunction(v410));
}
function baseFilter(v412, v413) {
  var v414 = [];
  baseEach(v412, function (v415, v416, v417) {
    if (v413(v415, v416, v417)) {
      v414.push(v415);
    }
  });
  return v414;
}
function filter(v418, v419) {
  var v420 = isArray(v418) ? arrayFilter : baseFilter;
  return v420(v418, baseIteratee(v419));
}
function baseValues(v421, v422) {
  return arrayMap(v422, function (v423) {
    return v421[v423];
  });
}
function values(v424) {
  if (v424 == null) {
    return [];
  } else {
    return baseValues(v424, keys(v424));
  }
}
var mapTag = "[object Map]";
var setTag = "[object Set]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function isEmpty(v425) {
  if (v425 == null) {
    return true;
  }
  if (isArrayLike(v425) && (isArray(v425) || typeof v425 == "string" || typeof v425.splice == "function" || isBuffer(v425) || isTypedArray(v425) || isArguments(v425))) {
    return !v425.length;
  }
  var v426 = getTag(v425);
  if (v426 == mapTag || v426 == setTag) {
    return !v425.size;
  }
  if (isPrototype(v425)) {
    return !baseKeys(v425).length;
  }
  for (var v427 in v425) {
    if (hasOwnProperty.call(v425, v427)) {
      return false;
    }
  }
  return true;
}
function isUndefined(v428) {
  return v428 === undefined;
}
function baseReduce(v429, v430, v431, v432, v433) {
  v433(v429, function (v434, v435, v436) {
    v431 = v432 ? (v432 = false, v434) : v430(v431, v434, v435, v436);
  });
  return v431;
}
function reduce(v437, v438, v439) {
  var v440 = isArray(v437) ? arrayReduce : baseReduce;
  var v441 = arguments.length < 3;
  return v440(v437, baseIteratee(v438), v439, v441, baseEach);
}
var INFINITY = Infinity;
var createSet = !Set || 1 / setToArray(new Set([, -0]))[1] != INFINITY ? noop : function (v442) {
  return new Set(v442);
};
var LARGE_ARRAY_SIZE = 200;
function baseUniq(v443, v444, v445) {
  var v446 = -1;
  var v447 = arrayIncludes;
  var v448 = v443.length;
  var v449 = true;
  var v450 = [];
  var v451 = v450;
  if (v448 >= LARGE_ARRAY_SIZE) {
    var v452 = createSet(v443);
    if (v452) {
      return setToArray(v452);
    }
    v449 = false;
    v447 = cacheHas;
    v451 = new SetCache();
  } else {
    v451 = v450;
  }
  v453: while (++v446 < v448) {
    var v454 = v443[v446];
    var v455 = v454;
    v454 = v454 !== 0 ? v454 : 0;
    if (v449 && v455 === v455) {
      var v456 = v451.length;
      while (v456--) {
        if (v451[v456] === v455) {
          continue v453;
        }
      }
      v450.push(v454);
    } else if (!v447(v451, v455, v445)) {
      if (v451 !== v450) {
        v451.push(v455);
      }
      v450.push(v454);
    }
  }
  return v450;
}
var union = baseRest(function (v457) {
  return baseUniq(baseFlatten(v457, 1, isArrayLikeObject, true));
});
var DEFAULT_EDGE_NAME = "\0";
var GRAPH_NODE = "\0";
var EDGE_KEY_DELIM = "";
class Graph {
  constructor(v458 = {}) {
    this._isDirected = Object.prototype.hasOwnProperty.call(v458, "directed") ? v458.directed : true;
    this._isMultigraph = Object.prototype.hasOwnProperty.call(v458, "multigraph") ? v458.multigraph : false;
    this._isCompound = Object.prototype.hasOwnProperty.call(v458, "compound") ? v458.compound : false;
    this._label = undefined;
    this._defaultNodeLabelFn = constant(undefined);
    this._defaultEdgeLabelFn = constant(undefined);
    this._nodes = {};
    if (this._isCompound) {
      this._parent = {};
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }
    this._in = {};
    this._preds = {};
    this._out = {};
    this._sucs = {};
    this._edgeObjs = {};
    this._edgeLabels = {};
  }
  isDirected() {
    return this._isDirected;
  }
  isMultigraph() {
    return this._isMultigraph;
  }
  isCompound() {
    return this._isCompound;
  }
  setGraph(v459) {
    this._label = v459;
    return this;
  }
  graph() {
    return this._label;
  }
  setDefaultNodeLabel(v460) {
    if (!isFunction(v460)) {
      v460 = constant(v460);
    }
    this._defaultNodeLabelFn = v460;
    return this;
  }
  nodeCount() {
    return this._nodeCount;
  }
  nodes() {
    return keys(this._nodes);
  }
  sources() {
    var v461 = this;
    return filter(this.nodes(), function (v462) {
      return isEmpty(v461._in[v462]);
    });
  }
  sinks() {
    var v463 = this;
    return filter(this.nodes(), function (v464) {
      return isEmpty(v463._out[v464]);
    });
  }
  setNodes(v465, v466) {
    var v467 = arguments;
    var v468 = this;
    forEach(v465, function (v469) {
      if (v467.length > 1) {
        v468.setNode(v469, v466);
      } else {
        v468.setNode(v469);
      }
    });
    return this;
  }
  setNode(v470, v471) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v470)) {
      if (arguments.length > 1) {
        this._nodes[v470] = v471;
      }
      return this;
    }
    this._nodes[v470] = arguments.length > 1 ? v471 : this._defaultNodeLabelFn(v470);
    if (this._isCompound) {
      this._parent[v470] = GRAPH_NODE;
      this._children[v470] = {};
      this._children[GRAPH_NODE][v470] = true;
    }
    this._in[v470] = {};
    this._preds[v470] = {};
    this._out[v470] = {};
    this._sucs[v470] = {};
    ++this._nodeCount;
    return this;
  }
  node(v472) {
    return this._nodes[v472];
  }
  hasNode(v473) {
    return Object.prototype.hasOwnProperty.call(this._nodes, v473);
  }
  removeNode(v474) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v474)) {
      var v475 = v476 => this.removeEdge(this._edgeObjs[v476]);
      delete this._nodes[v474];
      if (this._isCompound) {
        this._removeFromParentsChildList(v474);
        delete this._parent[v474];
        forEach(this.children(v474), v477 => {
          this.setParent(v477);
        });
        delete this._children[v474];
      }
      forEach(keys(this._in[v474]), v475);
      delete this._in[v474];
      delete this._preds[v474];
      forEach(keys(this._out[v474]), v475);
      delete this._out[v474];
      delete this._sucs[v474];
      --this._nodeCount;
    }
    return this;
  }
  setParent(v478, v479) {
    if (!this._isCompound) {
      throw new Error("Cannot set parent in a non-compound graph");
    }
    if (isUndefined(v479)) {
      v479 = GRAPH_NODE;
    } else {
      v479 += "";
      for (var v480 = v479; !isUndefined(v480); v480 = this.parent(v480)) {
        if (v480 === v478) {
          throw new Error("Setting " + v479 + " as parent of " + v478 + " would create a cycle");
        }
      }
      this.setNode(v479);
    }
    this.setNode(v478);
    this._removeFromParentsChildList(v478);
    this._parent[v478] = v479;
    this._children[v479][v478] = true;
    return this;
  }
  _removeFromParentsChildList(v481) {
    delete this._children[this._parent[v481]][v481];
  }
  parent(v482) {
    if (this._isCompound) {
      var v483 = this._parent[v482];
      if (v483 !== GRAPH_NODE) {
        return v483;
      }
    }
  }
  children(v484) {
    if (isUndefined(v484)) {
      v484 = GRAPH_NODE;
    }
    if (this._isCompound) {
      var v485 = this._children[v484];
      if (v485) {
        return keys(v485);
      }
    } else if (v484 === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v484)) {
      return [];
    }
  }
  predecessors(v486) {
    var v487 = this._preds[v486];
    if (v487) {
      return keys(v487);
    }
  }
  successors(v488) {
    var v489 = this._sucs[v488];
    if (v489) {
      return keys(v489);
    }
  }
  neighbors(v490) {
    var v491 = this.predecessors(v490);
    if (v491) {
      return union(v491, this.successors(v490));
    }
  }
  isLeaf(v492) {
    var v493;
    if (this.isDirected()) {
      v493 = this.successors(v492);
    } else {
      v493 = this.neighbors(v492);
    }
    return v493.length === 0;
  }
  filterNodes(v494) {
    var v495 = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });
    v495.setGraph(this.graph());
    var v496 = this;
    forEach(this._nodes, function (v497, v498) {
      if (v494(v498)) {
        v495.setNode(v498, v497);
      }
    });
    forEach(this._edgeObjs, function (v499) {
      if (v495.hasNode(v499.v) && v495.hasNode(v499.w)) {
        v495.setEdge(v499, v496.edge(v499));
      }
    });
    var v500 = {};
    function v501(v502) {
      var v503 = v496.parent(v502);
      if (v503 === undefined || v495.hasNode(v503)) {
        v500[v502] = v503;
        return v503;
      } else if (v503 in v500) {
        return v500[v503];
      } else {
        return v501(v503);
      }
    }
    if (this._isCompound) {
      forEach(v495.nodes(), function (v504) {
        v495.setParent(v504, v501(v504));
      });
    }
    return v495;
  }
  setDefaultEdgeLabel(v505) {
    if (!isFunction(v505)) {
      v505 = constant(v505);
    }
    this._defaultEdgeLabelFn = v505;
    return this;
  }
  edgeCount() {
    return this._edgeCount;
  }
  edges() {
    return values(this._edgeObjs);
  }
  setPath(v506, v507) {
    var v508 = this;
    var v509 = arguments;
    reduce(v506, function (v510, v511) {
      if (v509.length > 1) {
        v508.setEdge(v510, v511, v507);
      } else {
        v508.setEdge(v510, v511);
      }
      return v511;
    });
    return this;
  }
  setEdge() {
    var v512;
    var v513;
    var v514;
    var v515;
    var v516 = false;
    var v517 = arguments[0];
    if (typeof v517 === "object" && v517 !== null && "v" in v517) {
      v512 = v517.v;
      v513 = v517.w;
      v514 = v517.name;
      if (arguments.length === 2) {
        v515 = arguments[1];
        v516 = true;
      }
    } else {
      v512 = v517;
      v513 = arguments[1];
      v514 = arguments[3];
      if (arguments.length > 2) {
        v515 = arguments[2];
        v516 = true;
      }
    }
    v512 = "" + v512;
    v513 = "" + v513;
    if (!isUndefined(v514)) {
      v514 = "" + v514;
    }
    var v518 = edgeArgsToId(this._isDirected, v512, v513, v514);
    if (Object.prototype.hasOwnProperty.call(this._edgeLabels, v518)) {
      if (v516) {
        this._edgeLabels[v518] = v515;
      }
      return this;
    }
    if (!isUndefined(v514) && !this._isMultigraph) {
      throw new Error("Cannot set a named edge when isMultigraph = false");
    }
    this.setNode(v512);
    this.setNode(v513);
    this._edgeLabels[v518] = v516 ? v515 : this._defaultEdgeLabelFn(v512, v513, v514);
    var v519 = edgeArgsToObj(this._isDirected, v512, v513, v514);
    v512 = v519.v;
    v513 = v519.w;
    Object.freeze(v519);
    this._edgeObjs[v518] = v519;
    incrementOrInitEntry(this._preds[v513], v512);
    incrementOrInitEntry(this._sucs[v512], v513);
    this._in[v513][v518] = v519;
    this._out[v512][v518] = v519;
    this._edgeCount++;
    return this;
  }
  edge(v520, v521, v522) {
    var v523 = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v520, v521, v522);
    return this._edgeLabels[v523];
  }
  hasEdge(v524, v525, v526) {
    var v527 = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v524, v525, v526);
    return Object.prototype.hasOwnProperty.call(this._edgeLabels, v527);
  }
  removeEdge(v528, v529, v530) {
    var v531 = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v528, v529, v530);
    var v532 = this._edgeObjs[v531];
    if (v532) {
      v528 = v532.v;
      v529 = v532.w;
      delete this._edgeLabels[v531];
      delete this._edgeObjs[v531];
      decrementOrRemoveEntry(this._preds[v529], v528);
      decrementOrRemoveEntry(this._sucs[v528], v529);
      delete this._in[v529][v531];
      delete this._out[v528][v531];
      this._edgeCount--;
    }
    return this;
  }
  inEdges(v533, v534) {
    var v535 = this._in[v533];
    if (v535) {
      var v536 = values(v535);
      if (!v534) {
        return v536;
      }
      return filter(v536, function (v537) {
        return v537.v === v534;
      });
    }
  }
  outEdges(v538, v539) {
    var v540 = this._out[v538];
    if (v540) {
      var v541 = values(v540);
      if (!v539) {
        return v541;
      }
      return filter(v541, function (v542) {
        return v542.w === v539;
      });
    }
  }
  nodeEdges(v543, v544) {
    var v545 = this.inEdges(v543, v544);
    if (v545) {
      return v545.concat(this.outEdges(v543, v544));
    }
  }
}
Graph.prototype._nodeCount = 0;
Graph.prototype._edgeCount = 0;
function incrementOrInitEntry(v546, v547) {
  if (v546[v547]) {
    v546[v547]++;
  } else {
    v546[v547] = 1;
  }
}
function decrementOrRemoveEntry(v548, v549) {
  if (! --v548[v549]) {
    delete v548[v549];
  }
}
function edgeArgsToId(v550, v551, v552, v553) {
  var v554 = "" + v551;
  var v555 = "" + v552;
  if (!v550 && v554 > v555) {
    var v556 = v554;
    v554 = v555;
    v555 = v556;
  }
  return v554 + EDGE_KEY_DELIM + v555 + EDGE_KEY_DELIM + (isUndefined(v553) ? DEFAULT_EDGE_NAME : v553);
}
function edgeArgsToObj(v557, v558, v559, v560) {
  var v561 = "" + v558;
  var v562 = "" + v559;
  if (!v557 && v561 > v562) {
    var v563 = v561;
    v561 = v562;
    v562 = v563;
  }
  var v564 = {
    v: v561,
    w: v562
  };
  if (v560) {
    v564.name = v560;
  }
  return v564;
}
function edgeObjToId(v565, v566) {
  return edgeArgsToId(v565, v566.v, v566.w, v566.name);
}
export { filter as $, isSymbol as A, isIndex as B, baseRest as C, baseFlatten as D, setToString as E, overRest as F, Graph as G, baseGetTag as H, isTypedArray as I, isArrayLikeObject as J, isArguments as K, isFunction as L, baseFor as M, baseFindIndex as N, castFunction as O, baseForOwn as P, hasPath as Q, identity as R, Symbol$1 as S, castPath as T, Uint8Array as U, toKey as V, baseGet as W, hasIn as X, toString as Y, forEach as Z, constant as _, isObject as a, values as a0, reduce as a1, isPrototype as b, isArrayLike as c, defineProperty as d, eq as e, arrayLikeKeys as f, getSymbols as g, arrayPush as h, isUndefined as i, baseGetAllKeys as j, keys as k, isObjectLike as l, getTag as m, baseUnary as n, overArg as o, nodeUtil as p, isBuffer as q, root as r, stubArray as s, Stack as t, arrayEach as u, isArray as v, getAllKeys as w, baseEach as x, baseIteratee as y, arrayMap as z };