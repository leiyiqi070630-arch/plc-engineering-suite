import { _ as v1 } from "./index-CXb3UsfP.js";
var ImperativeState = class {
  constructor(v2) {
    this.init = v2;
    this.records = this.init();
  }
  static {
    v1(this, "ImperativeState");
  }
  reset() {
    this.records = this.init();
  }
};
export { ImperativeState as I };