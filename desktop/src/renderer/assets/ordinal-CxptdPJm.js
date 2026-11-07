import { i as v1 } from "./init-ZxktEp_H.js";
class InternMap extends Map {
  constructor(v2, v3 = keyof) {
    super();
    Object.defineProperties(this, {
      _intern: {
        value: new Map()
      },
      _key: {
        value: v3
      }
    });
    if (v2 != null) {
      for (const [v4, v5] of v2) {
        this.set(v4, v5);
      }
    }
  }
  get(v6) {
    return super.get(intern_get(this, v6));
  }
  has(v7) {
    return super.has(intern_get(this, v7));
  }
  set(v8, v9) {
    return super.set(intern_set(this, v8), v9);
  }
  delete(v10) {
    return super.delete(intern_delete(this, v10));
  }
}
function intern_get({
  _intern: v11,
  _key: v12
}, v13) {
  const v14 = v12(v13);
  if (v11.has(v14)) {
    return v11.get(v14);
  } else {
    return v13;
  }
}
function intern_set({
  _intern: v15,
  _key: v16
}, v17) {
  const v18 = v16(v17);
  if (v15.has(v18)) {
    return v15.get(v18);
  }
  v15.set(v18, v17);
  return v17;
}
function intern_delete({
  _intern: v19,
  _key: v20
}, v21) {
  const v22 = v20(v21);
  if (v19.has(v22)) {
    v21 = v19.get(v22);
    v19.delete(v22);
  }
  return v21;
}
function keyof(v23) {
  if (v23 !== null && typeof v23 === "object") {
    return v23.valueOf();
  } else {
    return v23;
  }
}
const implicit = Symbol("implicit");
function ordinal() {
  var v24 = new InternMap();
  var v25 = [];
  var v26 = [];
  var v27 = implicit;
  function v28(v29) {
    let v30 = v24.get(v29);
    if (v30 === undefined) {
      if (v27 !== implicit) {
        return v27;
      }
      v24.set(v29, v30 = v25.push(v29) - 1);
    }
    return v26[v30 % v26.length];
  }
  v28.domain = function (v31) {
    if (!arguments.length) {
      return v25.slice();
    }
    v25 = [];
    v24 = new InternMap();
    for (const v32 of v31) {
      if (v24.has(v32)) {
        continue;
      }
      v24.set(v32, v25.push(v32) - 1);
    }
    return v28;
  };
  v28.range = function (v33) {
    if (arguments.length) {
      v26 = Array.from(v33);
      return v28;
    } else {
      return v26.slice();
    }
  };
  v28.unknown = function (v34) {
    if (arguments.length) {
      v27 = v34;
      return v28;
    } else {
      return v27;
    }
  };
  v28.copy = function () {
    return ordinal(v25, v26).unknown(v27);
  };
  v1.apply(v28, arguments);
  return v28;
}
export { ordinal as o };