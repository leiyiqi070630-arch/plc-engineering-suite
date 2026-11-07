import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { o as v2, n as v3, s as v4, g as v5, a as v6, b as v7, _ as v8, l as v9, c as v10, d as v11, z as v12, p as v13, A as v14, y as v15, B as v16, i as v17, w as v18, ak as v19 } from "./index-CXb3UsfP.js";
import { p as v20, i as v21 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var PositionFrameKind = "position frame";
var FramePositionedKind = "frame positioned";
var PositionRelationKind = "position relation";
var RelationPositionedKind = "relation positioned";
var setOptions = v8(function (v22) {
  v9.debug("options str", v22);
}, "setOptions");
var getOptions = v8(function () {
  return {};
}, "getOptions");
var clear2 = v8(function () {
  reset();
  v13();
}, "clear");
function reset() {
  store = {};
}
v8(reset, "reset");
var DEFAULT_EVENTMODELING_CONFIG = v16.eventmodeling;
var getConfig3 = v8(() => {
  const v23 = v14({
    ...DEFAULT_EVENTMODELING_CONFIG,
    ...v15().eventmodeling
  });
  return v23;
}, "getConfig");
var store = {};
function getState() {
  let v24 = initial;
  const {
    ast: v25
  } = store;
  const v26 = getDiagramProps();
  if (!v25) {
    throw new Error("No data for EventModel");
  }
  v25.frames.forEach((v27, v28) => {
    const v29 = calculateTextProps(v27, v25.dataEntities, v26);
    v24 = dispatch(v24, {
      $kind: PositionFrameKind,
      index: v28,
      frame: v27,
      textProps: v29
    });
    let v30 = undefined;
    if (hasSourceFrame(v27)) {
      v9.debug("source frame", v27.sourceFrames);
      v30 = v25.frames.filter(v31 => {
        return v27.sourceFrames.some(v32 => v32.$refText === v31.name);
      });
      v30.forEach(v33 => {
        v24 = dispatch(v24, {
          $kind: PositionRelationKind,
          index: v28,
          frame: v27,
          sourceFrame: v33
        });
      });
    } else {
      v24 = dispatch(v24, {
        $kind: PositionRelationKind,
        index: v28,
        frame: v27
      });
    }
  });
  v24 = {
    ...v24,
    sortedSwimlanesArray: sortedSwimlanesArray(v24.swimlanes)
  };
  return v24;
}
v8(getState, "getState");
function setAst(v34) {
  store.ast = v34;
}
v8(setAst, "setAst");
var diagramProps = {
  swimlaneMinHeight: 70,
  swimlanePadding: 15,
  swimlaneGap: 10,
  boxPadding: 10,
  boxOverlap: 90,
  boxDefaultY: 0,
  boxMinWidth: 80,
  boxMaxWidth: 450,
  boxMinHeight: 80,
  boxMaxHeight: 750,
  contentStartX: 250,
  textMaxWidth: 430,
  boxTextFontWeight: "bold",
  boxTextPadding: 10,
  swimlaneTextFontWeight: "bold",
  labelUiAutomation: "UI/Automation",
  labelUiAutomationPrefix: "UI/A: ",
  labelCommandReadModel: "Command/Read Model",
  labelCommandReadModelPrefix: "C/RM: ",
  labelEvents: "Events",
  labelEventsPrefix: "Stream: "
};
function getDiagramProps() {
  return diagramProps;
}
v8(getDiagramProps, "getDiagramProps");
var initial = {
  boxes: [],
  swimlanes: {},
  relations: [],
  maxR: 0,
  sortedSwimlanesArray: []
};
function extractNamespace(v35) {
  const v36 = v35.split(".");
  if (v36.length === 2) {
    return v36[0];
  }
  return undefined;
}
v8(extractNamespace, "extractNamespace");
function extractName(v37) {
  const v38 = v37.split(".");
  if (v38.length === 2) {
    return v38[1];
  }
  return v37;
}
v8(extractName, "extractName");
function findSwimlaneByNamespace(v39, v40) {
  if (!v40 || v40.length === 0) {
    return undefined;
  }
  return Object.values(v39).find(v41 => v41.namespace === v40);
}
v8(findSwimlaneByNamespace, "findSwimlaneByNamespace");
function findNextAvailableIndex(v42, v43, v44) {
  return Math.max(v43, ...Object.keys(v42).filter(v45 => {
    const v46 = Number.parseInt(v45);
    return v46 > v43 && v46 < v44;
  }).map(v47 => Number.parseInt(v47))) + 1;
}
v8(findNextAvailableIndex, "findNextAvailableIndex");
function calculateSwimlaneProps(v48, v49) {
  const v50 = extractNamespace(v48.entityIdentifier);
  const v51 = findSwimlaneByNamespace(v49, v50);
  switch (v48.modelEntityType) {
    case "ui":
    case "pcr":
    case "processor":
      if (v51) {
        return {
          index: v51.index,
          label: v51.namespace || diagramProps.labelUiAutomation
        };
      } else if (v50) {
        return {
          index: findNextAvailableIndex(v49, 0, 100),
          label: diagramProps.labelUiAutomationPrefix + v50
        };
      }
      return {
        index: 0,
        label: diagramProps.labelUiAutomation
      };
    case "rmo":
    case "readmodel":
    case "cmd":
    case "command":
      if (v51) {
        return {
          index: v51.index,
          label: v51.namespace || diagramProps.labelCommandReadModel
        };
      } else if (v50) {
        return {
          index: findNextAvailableIndex(v49, 100, 200),
          label: diagramProps.labelCommandReadModelPrefix + v50
        };
      }
      return {
        index: 100,
        label: diagramProps.labelCommandReadModel
      };
    case "evt":
    case "event":
    default:
      if (v51) {
        return {
          index: v51.index,
          label: v51.namespace || diagramProps.labelEvents
        };
      } else if (v50) {
        return {
          index: findNextAvailableIndex(v49, 200, 300),
          label: diagramProps.labelEventsPrefix + v50
        };
      }
      return {
        index: 200,
        label: diagramProps.labelEvents
      };
  }
}
v8(calculateSwimlaneProps, "calculateSwimlaneProps");
function calculateEntityVisualProps(v52) {
  const {
    themeVariables: v53
  } = v15();
  switch (v52.modelEntityType) {
    case "ui":
      return {
        fill: v53.emUiFill ?? "white",
        stroke: v53.emUiStroke ?? "#dbdada"
      };
    case "pcr":
    case "processor":
      return {
        fill: v53.emProcessorFill ?? "#edb3f6",
        stroke: v53.emProcessorStroke ?? "#b88cbf"
      };
    case "rmo":
    case "readmodel":
      return {
        fill: v53.emReadModelFill ?? "#d3f1a2",
        stroke: v53.emReadModelStroke ?? "#a3b732"
      };
    case "cmd":
    case "command":
      return {
        fill: v53.emCommandFill ?? "#bcd6fe",
        stroke: v53.emCommandStroke ?? "#679ac3"
      };
    case "evt":
    case "event":
      return {
        fill: v53.emEventFill ?? "#ffb778",
        stroke: v53.emEventStroke ?? "#c19a0f"
      };
    default:
      return {
        fill: "red",
        stroke: "black"
      };
  }
}
v8(calculateEntityVisualProps, "calculateEntityVisualProps");
function calculateTextProps(v54, v55, v56) {
  const v57 = v15();
  const v58 = v17(extractName(v54.entityIdentifier) ?? "", v57);
  let v59;
  const v60 = {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "\"trebuchet ms\", verdana, arial, sans-serif",
    joinWith: "<br/>"
  };
  const v61 = v18(v58, v56.textMaxWidth, v60);
  let v62 = "<b>" + v61 + "</b>";
  if (v54.dataInlineValue) {
    v59 = v54.dataInlineValue;
    v59 = v59.substring(v59.indexOf("{") + 1);
    v59 = v59.substring(0, v59.lastIndexOf("}") - 1);
    v59 = v17(v59, v57);
    v59 = v18(v59, v56.textMaxWidth, v60);
    v59 = v59.replaceAll(" ", "&nbsp;");
  }
  if (v54.dataReference) {
    const v63 = v55.find(v64 => v64.name === v54.dataReference?.$refText);
    if (v63) {
      v59 = v63.dataBlockValue;
      v59 = v59.substring(v59.indexOf("{\n") + 2);
      v59 = v59.substring(0, v59.lastIndexOf("}") - 1);
      v59 = v17(v59, v57);
      v59 = v18(v59, v56.textMaxWidth, v60);
      v59 = v59.replaceAll(" ", "&nbsp;");
      v59 += "<br/>";
    }
  }
  const v65 = v59 !== undefined;
  if (v65) {
    v62 += "<br/><br/><code style=\"text-align: left; display: block;max-width:" + v56.textMaxWidth + "px\">" + v59 + "</code>";
  }
  const v66 = {
    fontSize: v60.fontSize,
    fontWeight: v60.fontWeight,
    fontFamily: v60.fontFamily
  };
  const v67 = v19(v62, v66);
  const v68 = v65 ? v67.width / 3 : v67.width;
  const v69 = {
    content: v62,
    width: v68,
    height: v67.height
  };
  v9.debug("[" + v54.name + "] " + v54.entityIdentifier + " text", v69);
  return v69;
}
v8(calculateTextProps, "calculateTextProps");
function decidePositionFrame(v70, v71) {
  const v72 = v71;
  const v73 = calculateEntityVisualProps(v72.frame);
  const v74 = {
    width: v72.textProps.width + diagramProps.boxTextPadding * 2,
    height: v72.textProps.height + diagramProps.boxTextPadding * 2
  };
  const v75 = {
    $kind: FramePositionedKind,
    frame: v72.frame,
    index: v72.index,
    visual: v73,
    dimension: v74,
    textProps: v72.textProps
  };
  return [v75];
}
v8(decidePositionFrame, "decidePositionFrame");
function calculateX(v76, v77, v78) {
  if (v77 === undefined) {
    return diagramProps.contentStartX;
  }
  if (v77.index === v76.index && v76.r) {
    return v76.r + diagramProps.boxPadding;
  }
  if (v78 === undefined) {
    return diagramProps.contentStartX;
  }
  return v78.r - diagramProps.boxOverlap + diagramProps.boxPadding;
}
v8(calculateX, "calculateX");
function calculateMaxRight(v79, v80) {
  const v81 = [...v79.map(v82 => v82.r), v80];
  return Math.max(...v81);
}
v8(calculateMaxRight, "calculateMaxRight");
function sortedSwimlanesArray(v83) {
  return Object.values(v83).sort((v84, v85) => v84.index - v85.index);
}
v8(sortedSwimlanesArray, "sortedSwimlanesArray");
function evolveFramePositioned(v86, v87) {
  const v88 = v87;
  const v89 = calculateSwimlaneProps(v88.frame, v86.swimlanes);
  let v90;
  if (v89.index in v86.swimlanes) {
    v90 = v86.swimlanes[v89.index];
  } else {
    v90 = {
      index: v89.index,
      label: v89.label,
      r: 0,
      y: v89.index * diagramProps.swimlaneMinHeight + diagramProps.swimlaneGap,
      height: diagramProps.swimlaneMinHeight,
      maxHeight: diagramProps.swimlaneMinHeight
    };
  }
  const v91 = v86.boxes.length > 0 ? v86.boxes[v86.boxes.length - 1] : undefined;
  const v92 = v86.previousSwimlaneNumber !== undefined ? v86.swimlanes[v86.previousSwimlaneNumber] : undefined;
  const v93 = {
    width: Math.max(diagramProps.boxMinWidth, Math.min(diagramProps.boxMaxWidth, v88.dimension.width)) + diagramProps.boxPadding * 2,
    height: Math.max(diagramProps.boxMinHeight, Math.min(diagramProps.boxMaxHeight, v88.dimension.height)) + diagramProps.boxPadding * 2
  };
  const v94 = calculateX(v90, v92, v91);
  const v95 = v94 + v93.width + diagramProps.boxPadding;
  const v96 = calculateMaxRight(Object.values(v86.swimlanes), v95);
  v90.r = v94 + v93.width;
  v90.maxHeight = Math.max(v90.maxHeight, v93.height);
  v90.height = Math.max(diagramProps.swimlaneMinHeight, v90.maxHeight) + diagramProps.swimlanePadding * 2;
  const v97 = {
    x: v94,
    y: diagramProps.swimlanePadding + v90.y,
    r: v95,
    dimension: v93,
    leftSibling: false,
    swimlane: v90,
    visual: v88.visual,
    text: v88.textProps.content,
    frame: v88.frame,
    index: v88.index
  };
  const v98 = {
    ...v86,
    boxes: [...v86.boxes, v97],
    swimlanes: {
      ...v86.swimlanes,
      ["" + v90.index]: v90
    },
    previousSwimlaneNumber: v89.index,
    previousFrame: v88.frame,
    maxR: v96
  };
  const v99 = sortedSwimlanesArray(v98.swimlanes);
  if (v99.length > 0) {
    v99[0].y = 0;
  }
  for (let v100 = 1; v100 < v99.length; v100++) {
    const v101 = v99[v100];
    const v102 = v99[v100 - 1];
    v101.y = v102.y + v102.height + diagramProps.swimlaneGap;
  }
  return v98;
}
v8(evolveFramePositioned, "evolveFramePositioned");
function isFirstFrame(v103, v104) {
  if (v103 === 0 && v104.sourceFrames.length === 0) {
    return true;
  }
  return false;
}
v8(isFirstFrame, "isFirstFrame");
function hasSourceFrame(v105) {
  return v105.sourceFrames !== undefined && v105.sourceFrames !== null && v105.sourceFrames.length > 0;
}
v8(hasSourceFrame, "hasSourceFrame");
function findBoxByFrame(v106, v107) {
  if (v107 === undefined || v107 === null) {
    return undefined;
  }
  return v106.find(v108 => v108.frame.name === v107.name);
}
v8(findBoxByFrame, "findBoxByFrame");
function findBoxByLineIndex(v109, v110, v111) {
  if (v111 < 0) {
    return undefined;
  }
  for (let v112 = v111; v112 >= 0; v112--) {
    const v113 = v109[v112];
    if (v113.swimlane.index !== v110) {
      return v113;
    }
  }
  return undefined;
}
v8(findBoxByLineIndex, "findBoxByLineIndex");
function decidePositionRelation(v114, v115) {
  const v116 = v115;
  if (v21(v116.frame) || isFirstFrame(v116.index, v116.frame)) {
    return [];
  }
  const v117 = findBoxByFrame(v114.boxes, v116.frame);
  if (v117 === undefined) {
    throw new Error("Target box not found for frame " + v116.frame.name);
  }
  let v118;
  if (v116.sourceFrame) {
    v118 = findBoxByFrame(v114.boxes, v116.sourceFrame);
  } else {
    v118 = findBoxByLineIndex(v114.boxes, v117.swimlane.index, v116.index - 1);
  }
  if (v118 === undefined) {
    return [];
  }
  const v119 = {
    $kind: RelationPositionedKind,
    frame: v116.frame,
    index: v116.index,
    sourceBox: v118,
    targetBox: v117
  };
  return [v119];
}
v8(decidePositionRelation, "decidePositionRelation");
function evolveRelationPositioned(v120, v121) {
  const v122 = v121;
  const v123 = {
    visual: {
      fill: "none",
      stroke: "#000"
    },
    source: {
      x: v122.sourceBox.x,
      y: v122.sourceBox.y
    },
    target: {
      x: v122.targetBox.x,
      y: v122.targetBox.y
    },
    sourceBox: v122.sourceBox,
    targetBox: v122.targetBox
  };
  const v124 = {
    ...v120,
    relations: [...v120.relations, v123]
  };
  return v124;
}
v8(evolveRelationPositioned, "evolveRelationPositioned");
var deciders = {
  [PositionFrameKind]: decidePositionFrame,
  [PositionRelationKind]: decidePositionRelation
};
var evolvers = {
  [FramePositionedKind]: evolveFramePositioned,
  [RelationPositionedKind]: evolveRelationPositioned
};
function decide(v125, v126) {
  const v127 = deciders[v126.$kind];
  if (v127 === undefined || v127 === null) {
    return [];
  }
  const v128 = v127(v125, v126);
  v9.debug("decided events", v128);
  return v128;
}
v8(decide, "decide");
function evolve(v129, v130) {
  const v131 = v130.reduce((v132, v133) => {
    const v134 = evolvers[v133.$kind];
    if (v134 === undefined || v134 === null) {
      return v132;
    }
    return v134(v132, v133);
  }, v129);
  v9.debug("evolve events", {
    state: v129,
    newState: v131,
    events: v130
  });
  return v131;
}
v8(evolve, "evolve");
function dispatch(v135, v136) {
  const v137 = decide(v135, v136);
  const v138 = evolve(v135, v137);
  return v138;
}
v8(dispatch, "dispatch");
var db = {
  getConfig: getConfig3,
  setOptions: setOptions,
  getOptions: getOptions,
  clear: clear2,
  setAccTitle: v7,
  getAccTitle: v6,
  getAccDescription: v5,
  setAccDescription: v4,
  setDiagramTitle: v3,
  getDiagramTitle: v2,
  setAst: setAst,
  getDiagramProps: getDiagramProps,
  getState: getState
};
var parser = {
  parse: v8(async v139 => {
    const v140 = await v20("eventmodeling", v139);
    v9.debug(v140);
    db.setAst(v140);
    v1(v140, db);
  }, "parse")
};
var DEFAULT_CONFIG = v10();
var DEFAULT_EVENTMODELING_CONFIG2 = DEFAULT_CONFIG?.eventmodeling;
function renderD3Box(v141, v142) {
  return v143 => {
    const v144 = v143.swimlane.y + v142.swimlanePadding;
    const v145 = v141.append("g").attr("class", "em-box");
    v145.append("rect").attr("x", v143.x).attr("y", v144).attr("rx", "3").attr("width", v143.dimension.width).attr("height", v143.dimension.height).attr("stroke", v143.visual.stroke).attr("fill", v143.visual.fill);
    const v146 = v145.append("foreignObject").attr("x", v143.x + v142.boxPadding).attr("y", v144 + 10).attr("width", v143.dimension.width - v142.boxPadding * 2).attr("height", v143.dimension.height - v142.boxPadding * 2);
    const v147 = v146.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
    v147.append("span").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").html(v143.text);
  };
}
v8(renderD3Box, "renderD3Box");
function dirUpwards(v148, v149) {
  return v148 > v149;
}
v8(dirUpwards, "dirUpwards");
function renderD3Relation(v150, v151, v152, v153) {
  return v154 => {
    const v155 = v154.sourceBox.swimlane.y + v151.swimlanePadding;
    const v156 = v154.targetBox.swimlane.y + v151.swimlanePadding;
    const v157 = dirUpwards(v155, v156);
    const v158 = v154.sourceBox.x + v154.sourceBox.dimension.width * 2 / 3;
    const v159 = v154.targetBox.x + v154.targetBox.dimension.width / 3;
    let v160;
    let v161;
    v9.debug("rendering relation up=" + v157 + " for ", {
      sourceBox: v154.sourceBox,
      targetBox: v154.targetBox
    });
    if (v157) {
      v160 = v155;
      v161 = v156 + v154.targetBox.dimension.height;
    } else {
      v160 = v155 + v154.sourceBox.dimension.height;
      v161 = v156;
    }
    const v162 = v153.emRelationStroke ?? v154.visual.stroke;
    v150.append("path").attr("class", "em-relation").attr("fill", v154.visual.fill).attr("stroke", v162).attr("stroke-width", "1").attr("marker-end", "url(#" + v152 + ")").attr("d", "M" + v158 + " " + v160 + " L" + v159 + " " + v161);
  };
}
v8(renderD3Relation, "renderD3Relation");
function renderD3Swimlane(v163, v164, v165, v166) {
  return v167 => {
    const v168 = v163.append("g").attr("class", "em-swimlane");
    const v169 = v166.emSwimlaneBackgroundOdd ?? "rgb(250,250,250)";
    const v170 = v166.emSwimlaneBackgroundStroke ?? "rgb(240,240,240)";
    v168.append("rect").attr("x", 0).attr("y", v167.y).attr("rx", "3").attr("width", v164 + v165.swimlanePadding).attr("height", v167.height).attr("fill", v169).attr("stroke", v170);
    v168.append("text").attr("font-weight", v165.swimlaneTextFontWeight).attr("x", 30).attr("y", v167.y + 30).text(v167.label);
  };
}
v8(renderD3Swimlane, "renderD3Swimlane");
var draw = v8(function (v171, v172, v173, v174) {
  v9.debug("in eventmodeling renderer", v171 + "\n", "id:", v172, v173);
  if (!DEFAULT_EVENTMODELING_CONFIG2) {
    throw new Error("EventModeling config not found");
  }
  const v175 = v174.db;
  const {
    themeVariables: v176,
    eventmodeling: v177
  } = v10();
  const v178 = v11("[id=\"" + v172 + "\"]");
  const v179 = v175.getDiagramProps();
  const v180 = v175.getState();
  const v181 = "em-arrowhead-" + v172;
  const v182 = v176.emArrowhead ?? "#000000";
  v180.sortedSwimlanesArray.forEach(renderD3Swimlane(v178, v180.maxR, v179, v176));
  v180.boxes.forEach(renderD3Box(v178, v179));
  v180.relations.forEach(renderD3Relation(v178, v179, v181, v176));
  const v183 = v178.append("defs").append("marker").attr("id", v181).attr("markerWidth", "10").attr("markerHeight", "7").attr("refX", "10").attr("refY", "3.5").attr("orient", "auto");
  v183.append("polygon").attr("points", "0 0, 10 3.5, 0 7").attr("fill", v182);
  v12(undefined, v178, v177?.padding ?? 30, v177?.useMaxWidth);
}, "draw");
var renderer_default = {
  draw: draw
};
var getStyles = v8(v184 => "", "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: parser,
  db: db,
  renderer: renderer_default,
  styles: styles_default
};
export { diagram };