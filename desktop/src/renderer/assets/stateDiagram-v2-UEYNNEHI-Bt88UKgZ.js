import { s as v1, b as v2, a as v3, S as v4 } from "./chunk-5RXB4S5H-CkzgmE21.js";
import { _ as v5 } from "./index-CXb3UsfP.js";
import "./chunk-XXDRQBXY-CzLCVi_O.js";
import "./chunk-KBJHAD2P-BXgOlElY.js";
import "./chunk-2GRJ4B5K-DGslyOWI.js";
var diagram = {
  parser: v3,
  get db() {
    return new v4(2);
  },
  renderer: v2,
  styles: v1,
  init: v5(v6 => {
    if (!v6.state) {
      v6.state = {};
    }
    v6.state.arrowMarkerAbsolute = v6.arrowMarkerAbsolute;
  }, "init")
};
export { diagram };