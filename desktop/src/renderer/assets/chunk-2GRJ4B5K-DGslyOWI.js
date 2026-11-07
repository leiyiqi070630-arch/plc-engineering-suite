import { _ as v1, d as v2, S as v3, j as v4 } from "./index-CXb3UsfP.js";
var drawRect = v1((v5, v6) => {
  const v7 = v5.append("rect");
  v7.attr("x", v6.x);
  v7.attr("y", v6.y);
  v7.attr("fill", v6.fill);
  v7.attr("stroke", v6.stroke);
  v7.attr("width", v6.width);
  v7.attr("height", v6.height);
  if (v6.name) {
    v7.attr("name", v6.name);
  }
  if (v6.rx) {
    v7.attr("rx", v6.rx);
  }
  if (v6.ry) {
    v7.attr("ry", v6.ry);
  }
  if (v6.attrs !== undefined) {
    for (const v8 in v6.attrs) {
      v7.attr(v8, v6.attrs[v8]);
    }
  }
  if (v6.class) {
    v7.attr("class", v6.class);
  }
  return v7;
}, "drawRect");
var drawBackgroundRect = v1((v9, v10) => {
  const v11 = {
    x: v10.startx,
    y: v10.starty,
    width: v10.stopx - v10.startx,
    height: v10.stopy - v10.starty,
    fill: v10.fill,
    stroke: v10.stroke,
    class: "rect"
  };
  const v12 = drawRect(v9, v11);
  v12.lower();
}, "drawBackgroundRect");
var drawText = v1((v13, v14) => {
  const v15 = v14.text.replace(v3, " ");
  const v16 = v13.append("text");
  v16.attr("x", v14.x);
  v16.attr("y", v14.y);
  v16.attr("class", "legend");
  v16.style("text-anchor", v14.anchor);
  if (v14.class) {
    v16.attr("class", v14.class);
  }
  const v17 = v16.append("tspan");
  v17.attr("x", v14.x + v14.textMargin * 2);
  v17.text(v15);
  return v16;
}, "drawText");
var drawImage = v1((v18, v19, v20, v21) => {
  const v22 = v18.append("image");
  v22.attr("x", v19);
  v22.attr("y", v20);
  const v23 = v4.sanitizeUrl(v21);
  v22.attr("xlink:href", v23);
}, "drawImage");
var drawEmbeddedImage = v1((v24, v25, v26, v27) => {
  const v28 = v24.append("use");
  v28.attr("x", v25);
  v28.attr("y", v26);
  const v29 = v4.sanitizeUrl(v27);
  v28.attr("xlink:href", "#" + v29);
}, "drawEmbeddedImage");
var getNoteRect = v1(() => {
  const v30 = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: "#EDF2AE",
    stroke: "#666",
    anchor: "start",
    rx: 0,
    ry: 0
  };
  return v30;
}, "getNoteRect");
var getTextObj = v1(() => {
  const v31 = {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    "text-anchor": "start",
    style: "#666",
    textMargin: 0,
    rx: 0,
    ry: 0,
    tspan: true
  };
  return v31;
}, "getTextObj");
var createTooltip = v1(() => {
  let v32 = v2(".mermaidTooltip");
  if (v32.empty()) {
    v32 = v2("body").append("div").attr("class", "mermaidTooltip").style("opacity", 0).style("position", "absolute").style("text-align", "center").style("max-width", "200px").style("padding", "2px").style("font-size", "12px").style("background", "#ffffde").style("border", "1px solid #333").style("border-radius", "2px").style("pointer-events", "none").style("z-index", "100");
  }
  return v32;
}, "createTooltip");
export { drawBackgroundRect as a, getTextObj as b, drawEmbeddedImage as c, drawRect as d, drawImage as e, createTooltip as f, getNoteRect as g, drawText as h };