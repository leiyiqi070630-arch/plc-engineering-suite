import { _ as v1 } from "./index-CXb3UsfP.js";
function populateCommonDb(v2, v3) {
  if (v2.accDescr) {
    v3.setAccDescription?.(v2.accDescr);
  }
  if (v2.accTitle) {
    v3.setAccTitle?.(v2.accTitle);
  }
  if (v2.title) {
    v3.setDiagramTitle?.(v2.title);
  }
}
v1(populateCommonDb, "populateCommonDb");
export { populateCommonDb as p };