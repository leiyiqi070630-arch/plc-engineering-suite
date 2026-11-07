import { _ as v1 } from "./index-CXb3UsfP.js";
var DDLT_SIZE_CAPTURE_VERSION = 1;
function getCaptureGlobal() {
  if (typeof globalThis === "undefined") {
    return undefined;
  }
  return globalThis;
}
v1(getCaptureGlobal, "getCaptureGlobal");
function shouldCaptureSizes() {
  return Boolean(getCaptureGlobal()?.mermaidCaptureSizes);
}
v1(shouldCaptureSizes, "shouldCaptureSizes");
function capturedFromLocation() {
  if (typeof location === "undefined") {
    return "browser-dev";
  }
  return "" + location.pathname + location.search;
}
v1(capturedFromLocation, "capturedFromLocation");
function emitCapturedSizes(v2, v3) {
  const v4 = getCaptureGlobal();
  if (!v4) {
    return;
  }
  const v5 = v3.node();
  const v6 = (v5 && "ownerSVGElement" in v5 ? v5.ownerSVGElement : null) ?? v5;
  const v7 = v6?.id ?? "(unknown)";
  v4.mermaidCapturedSizes ??= [];
  const v8 = {
    svgId: v7,
    sizes: v2
  };
  v4.mermaidCapturedSizes.push(v8);
  v4.mermaidLastCapturedSizes = v8;
}
v1(emitCapturedSizes, "emitCapturedSizes");
function captureNodeSizes(v9, v10) {
  const v11 = [];
  for (const v12 of v10.nodes) {
    if (v12.isGroup) {
      continue;
    }
    v11.push({
      id: v12.id,
      width: v12.width ?? 0,
      height: v12.height ?? 0
    });
  }
  if (v11.length === 0) {
    return;
  }
  emitCapturedSizes({
    metadata: {
      captureVersion: DDLT_SIZE_CAPTURE_VERSION,
      capturedAt: new Date().toISOString(),
      capturedFrom: capturedFromLocation()
    },
    nodes: v11
  }, v9);
}
v1(captureNodeSizes, "captureNodeSizes");
export { captureNodeSizes, shouldCaptureSizes };