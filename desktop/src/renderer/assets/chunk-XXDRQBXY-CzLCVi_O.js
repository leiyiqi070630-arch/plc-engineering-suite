import { _ as v1, d as v2 } from "./index-CXb3UsfP.js";
var getDiagramElement = v1((v3, v4) => {
  let v5;
  if (v4 === "sandbox") {
    v5 = v2("#i" + v3);
  }
  const v6 = v4 === "sandbox" ? v2(v5.nodes()[0].contentDocument.body) : v2("body");
  const v7 = v6.select("[id=\"" + v3 + "\"]");
  return v7;
}, "getDiagramElement");
export { getDiagramElement as g };