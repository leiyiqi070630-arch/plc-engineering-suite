import { _ as v1, e as v2, l as v3 } from "./index-CXb3UsfP.js";
var setupViewPortForSVG = v1((v4, v5, v6, v7) => {
  v4.attr("class", v6);
  const {
    width: v8,
    height: v9,
    x: v10,
    y: v11
  } = calculateDimensionsWithPadding(v4, v5);
  v2(v4, v9, v8, v7);
  const v12 = createViewBox(v10, v11, v8, v9, v5);
  v4.attr("viewBox", v12);
  v3.debug("viewBox configured: " + v12 + " with padding: " + v5);
}, "setupViewPortForSVG");
var calculateDimensionsWithPadding = v1((v13, v14) => {
  const v15 = v13.node()?.getBBox() || {
    width: 0,
    height: 0,
    x: 0,
    y: 0
  };
  return {
    width: v15.width + v14 * 2,
    height: v15.height + v14 * 2,
    x: v15.x,
    y: v15.y
  };
}, "calculateDimensionsWithPadding");
var createViewBox = v1((v16, v17, v18, v19, v20) => {
  return v16 - v20 + " " + (v17 - v20) + " " + v18 + " " + v19;
}, "createViewBox");
export { setupViewPortForSVG as s };