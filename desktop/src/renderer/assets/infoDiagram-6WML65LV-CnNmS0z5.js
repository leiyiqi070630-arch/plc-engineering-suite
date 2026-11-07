import { _ as v1, l as v2, D as v3, e as v4 } from "./index-CXb3UsfP.js";
import { p as v5 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var parser = {
  parse: v1(async v6 => {
    const v7 = await v5("info", v6);
    v2.debug(v7);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: "11.16.1"
};
var getVersion = v1(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion: getVersion
};
var draw = v1((v8, v9, v10) => {
  v2.debug("rendering info diagram\n" + v8);
  const v11 = v3(v9);
  v4(v11, 100, 400, true);
  const v12 = v11.append("g");
  v12.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text("v" + v10);
}, "draw");
var renderer = {
  draw: draw
};
var diagram = {
  parser: parser,
  db: db,
  renderer: renderer
};
export { diagram };