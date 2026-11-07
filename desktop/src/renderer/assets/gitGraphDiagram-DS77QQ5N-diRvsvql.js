import { I as v1 } from "./chunk-2Q5K7J3B-CRp8dvLz.js";
import { p as v2 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { o as v3, n as v4, s as v5, g as v6, a as v7, b as v8, _ as v9, y as v10, l as v11, d as v12, c as v13, x as v14, z as v15, p as v16, k as v17, A as v18, B as v19, C as v20 } from "./index-CXb3UsfP.js";
import { p as v21 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
var commitType = {
  NORMAL: 0,
  REVERSE: 1,
  HIGHLIGHT: 2,
  MERGE: 3,
  CHERRY_PICK: 4
};
var DEFAULT_GITGRAPH_CONFIG = v19.gitGraph;
var getConfig3 = v9(() => {
  const v22 = v18({
    ...DEFAULT_GITGRAPH_CONFIG,
    ...v10().gitGraph
  });
  return v22;
}, "getConfig");
var state = new v1(() => {
  const v23 = getConfig3();
  const v24 = v23.mainBranchName;
  const v25 = v23.mainBranchOrder;
  return {
    mainBranchName: v24,
    commits: new Map(),
    head: null,
    branchConfig: new Map([[v24, {
      name: v24,
      order: v25
    }]]),
    branches: new Map([[v24, null]]),
    currBranch: v24,
    direction: "LR",
    seq: 0,
    options: {}
  };
});
function getID() {
  return v20({
    length: 7
  });
}
v9(getID, "getID");
function uniqBy(v26, v27) {
  const v28 = Object.create(null);
  return v26.reduce((v29, v30) => {
    const v31 = v27(v30);
    if (!v28[v31]) {
      v28[v31] = true;
      v29.push(v30);
    }
    return v29;
  }, []);
}
v9(uniqBy, "uniqBy");
var setDirection = v9(function (v32) {
  state.records.direction = v32;
}, "setDirection");
var setOptions = v9(function (v33) {
  v11.debug("options str", v33);
  v33 = v33?.trim();
  v33 = v33 || "{}";
  try {
    state.records.options = JSON.parse(v33);
  } catch (v34) {
    v11.error("error while parsing gitGraph options", v34.message);
  }
}, "setOptions");
var getOptions = v9(function () {
  return state.records.options;
}, "getOptions");
var commit = v9(function (v35) {
  let v36 = v35.msg;
  let v37 = v35.id;
  const v38 = v35.type;
  let v39 = v35.tags;
  v11.info("commit", v36, v37, v38, v39);
  v11.debug("Entering commit:", v36, v37, v38, v39);
  const v40 = getConfig3();
  v37 = v17.sanitizeText(v37, v40);
  v36 = v17.sanitizeText(v36, v40);
  v39 = v39?.map(v41 => v17.sanitizeText(v41, v40));
  const v42 = {
    id: v37 ? v37 : state.records.seq + "-" + getID(),
    message: v36,
    seq: state.records.seq++,
    type: v38 ?? commitType.NORMAL,
    tags: v39 ?? [],
    parents: state.records.head == null ? [] : [state.records.head.id],
    branch: state.records.currBranch
  };
  state.records.head = v42;
  v11.info("main branch", v40.mainBranchName);
  if (state.records.commits.has(v42.id)) {
    v11.warn("Commit ID " + v42.id + " already exists");
  }
  state.records.commits.set(v42.id, v42);
  state.records.branches.set(state.records.currBranch, v42.id);
  v11.debug("in pushCommit " + v42.id);
}, "commit");
var branch = v9(function (v43) {
  let v44 = v43.name;
  const v45 = v43.order;
  v44 = v17.sanitizeText(v44, getConfig3());
  if (state.records.branches.has(v44)) {
    throw new Error("Trying to create an existing branch. (Help: Either use a new name if you want create a new branch or try using \"checkout " + v44 + "\")");
  }
  state.records.branches.set(v44, state.records.head != null ? state.records.head.id : null);
  state.records.branchConfig.set(v44, {
    name: v44,
    order: v45
  });
  checkout(v44);
  v11.debug("in createBranch");
}, "branch");
var merge = v9(v46 => {
  let v47 = v46.branch;
  let v48 = v46.id;
  const v49 = v46.type;
  const v50 = v46.tags;
  const v51 = getConfig3();
  v47 = v17.sanitizeText(v47, v51);
  v48 &&= v17.sanitizeText(v48, v51);
  const v52 = state.records.branches.get(state.records.currBranch);
  const v53 = state.records.branches.get(v47);
  const v54 = v52 ? state.records.commits.get(v52) : undefined;
  const v55 = v53 ? state.records.commits.get(v53) : undefined;
  if (v54 && v55 && v54.branch === v47) {
    throw new Error("Cannot merge branch '" + v47 + "' into itself.");
  }
  if (state.records.currBranch === v47) {
    const v56 = new Error("Incorrect usage of \"merge\". Cannot merge a branch to itself");
    v56.hash = {
      text: "merge " + v47,
      token: "merge " + v47,
      expected: ["branch abc"]
    };
    throw v56;
  }
  if (v54 === undefined || !v54) {
    const v57 = new Error("Incorrect usage of \"merge\". Current branch (" + state.records.currBranch + ")has no commits");
    v57.hash = {
      text: "merge " + v47,
      token: "merge " + v47,
      expected: ["commit"]
    };
    throw v57;
  }
  if (!state.records.branches.has(v47)) {
    const v58 = new Error("Incorrect usage of \"merge\". Branch to be merged (" + v47 + ") does not exist");
    v58.hash = {
      text: "merge " + v47,
      token: "merge " + v47,
      expected: ["branch " + v47]
    };
    throw v58;
  }
  if (v55 === undefined || !v55) {
    const v59 = new Error("Incorrect usage of \"merge\". Branch to be merged (" + v47 + ") has no commits");
    v59.hash = {
      text: "merge " + v47,
      token: "merge " + v47,
      expected: ["\"commit\""]
    };
    throw v59;
  }
  if (v54 === v55) {
    const v60 = new Error("Incorrect usage of \"merge\". Both branches have same head");
    v60.hash = {
      text: "merge " + v47,
      token: "merge " + v47,
      expected: ["branch abc"]
    };
    throw v60;
  }
  if (v48 && state.records.commits.has(v48)) {
    const v61 = new Error("Incorrect usage of \"merge\". Commit with id:" + v48 + " already exists, use different custom id");
    v61.hash = {
      text: "merge " + v47 + " " + v48 + " " + v49 + " " + v50?.join(" "),
      token: "merge " + v47 + " " + v48 + " " + v49 + " " + v50?.join(" "),
      expected: ["merge " + v47 + " " + v48 + "_UNIQUE " + v49 + " " + v50?.join(" ")]
    };
    throw v61;
  }
  const v62 = v53 ? v53 : "";
  const v63 = {
    id: v48 || state.records.seq + "-" + getID(),
    message: "merged branch " + v47 + " into " + state.records.currBranch,
    seq: state.records.seq++,
    parents: state.records.head == null ? [] : [state.records.head.id, v62],
    branch: state.records.currBranch,
    type: commitType.MERGE,
    customType: v49,
    customId: v48 ? true : false,
    tags: v50 ?? []
  };
  state.records.head = v63;
  state.records.commits.set(v63.id, v63);
  state.records.branches.set(state.records.currBranch, v63.id);
  v11.debug(state.records.branches);
  v11.debug("in mergeBranch");
}, "merge");
var cherryPick = v9(function (v64) {
  let v65 = v64.id;
  let v66 = v64.targetId;
  let v67 = v64.tags;
  let v68 = v64.parent;
  v11.debug("Entering cherryPick:", v65, v66, v67);
  const v69 = getConfig3();
  v65 = v17.sanitizeText(v65, v69);
  v66 = v17.sanitizeText(v66, v69);
  v67 = v67?.map(v70 => v17.sanitizeText(v70, v69));
  v68 = v17.sanitizeText(v68, v69);
  if (!v65 || !state.records.commits.has(v65)) {
    const v71 = new Error("Incorrect usage of \"cherryPick\". Source commit id should exist and provided");
    v71.hash = {
      text: "cherryPick " + v65 + " " + v66,
      token: "cherryPick " + v65 + " " + v66,
      expected: ["cherry-pick abc"]
    };
    throw v71;
  }
  const v72 = state.records.commits.get(v65);
  if (v72 === undefined || !v72) {
    throw new Error("Incorrect usage of \"cherryPick\". Source commit id should exist and provided");
  }
  if (v68 && (!Array.isArray(v72.parents) || !v72.parents.includes(v68))) {
    const v73 = new Error("Invalid operation: The specified parent commit is not an immediate parent of the cherry-picked commit.");
    throw v73;
  }
  const v74 = v72.branch;
  if (v72.type === commitType.MERGE && !v68) {
    const v75 = new Error("Incorrect usage of cherry-pick: If the source commit is a merge commit, an immediate parent commit must be specified.");
    throw v75;
  }
  if (!v66 || !state.records.commits.has(v66)) {
    if (v74 === state.records.currBranch) {
      const v76 = new Error("Incorrect usage of \"cherryPick\". Source commit is already on current branch");
      v76.hash = {
        text: "cherryPick " + v65 + " " + v66,
        token: "cherryPick " + v65 + " " + v66,
        expected: ["cherry-pick abc"]
      };
      throw v76;
    }
    const v77 = state.records.branches.get(state.records.currBranch);
    if (v77 === undefined || !v77) {
      const v78 = new Error("Incorrect usage of \"cherry-pick\". Current branch (" + state.records.currBranch + ")has no commits");
      v78.hash = {
        text: "cherryPick " + v65 + " " + v66,
        token: "cherryPick " + v65 + " " + v66,
        expected: ["cherry-pick abc"]
      };
      throw v78;
    }
    const v79 = state.records.commits.get(v77);
    if (v79 === undefined || !v79) {
      const v80 = new Error("Incorrect usage of \"cherry-pick\". Current branch (" + state.records.currBranch + ")has no commits");
      v80.hash = {
        text: "cherryPick " + v65 + " " + v66,
        token: "cherryPick " + v65 + " " + v66,
        expected: ["cherry-pick abc"]
      };
      throw v80;
    }
    const v81 = {
      id: state.records.seq + "-" + getID(),
      message: "cherry-picked " + v72?.message + " into " + state.records.currBranch,
      seq: state.records.seq++,
      parents: state.records.head == null ? [] : [state.records.head.id, v72.id],
      branch: state.records.currBranch,
      type: commitType.CHERRY_PICK,
      tags: v67 ? v67.filter(Boolean) : ["cherry-pick:" + v72.id + (v72.type === commitType.MERGE ? "|parent:" + v68 : "")]
    };
    state.records.head = v81;
    state.records.commits.set(v81.id, v81);
    state.records.branches.set(state.records.currBranch, v81.id);
    v11.debug(state.records.branches);
    v11.debug("in cherryPick");
  }
}, "cherryPick");
var checkout = v9(function (v82) {
  v82 = v17.sanitizeText(v82, getConfig3());
  if (!state.records.branches.has(v82)) {
    const v83 = new Error("Trying to checkout branch which is not yet created. (Help try using \"branch " + v82 + "\")");
    v83.hash = {
      text: "checkout " + v82,
      token: "checkout " + v82,
      expected: ["branch " + v82]
    };
    throw v83;
  } else {
    state.records.currBranch = v82;
    const v84 = state.records.branches.get(state.records.currBranch);
    if (v84 === undefined || !v84) {
      state.records.head = null;
    } else {
      state.records.head = state.records.commits.get(v84) ?? null;
    }
  }
}, "checkout");
function upsert(v85, v86, v87) {
  const v88 = v85.indexOf(v86);
  if (v88 === -1) {
    v85.push(v87);
  } else {
    v85.splice(v88, 1, v87);
  }
}
v9(upsert, "upsert");
function prettyPrintCommitHistory(v89) {
  const v90 = v89.reduce((v91, v92) => {
    if (v91.seq > v92.seq) {
      return v91;
    }
    return v92;
  }, v89[0]);
  let v93 = "";
  v89.forEach(function (v94) {
    if (v94 === v90) {
      v93 += "\t*";
    } else {
      v93 += "\t|";
    }
  });
  const v95 = [v93, v90.id, v90.seq];
  for (const v96 in state.records.branches) {
    if (state.records.branches.get(v96) === v90.id) {
      v95.push(v96);
    }
  }
  v11.debug(v95.join(" "));
  if (v90.parents && v90.parents.length == 2 && v90.parents[0] && v90.parents[1]) {
    const v97 = state.records.commits.get(v90.parents[0]);
    upsert(v89, v90, v97);
    if (v90.parents[1]) {
      v89.push(state.records.commits.get(v90.parents[1]));
    }
  } else if (v90.parents.length == 0) {
    return;
  } else if (v90.parents[0]) {
    const v98 = state.records.commits.get(v90.parents[0]);
    upsert(v89, v90, v98);
  }
  v89 = uniqBy(v89, v99 => v99.id);
  prettyPrintCommitHistory(v89);
}
v9(prettyPrintCommitHistory, "prettyPrintCommitHistory");
var prettyPrint = v9(function () {
  v11.debug(state.records.commits);
  const v100 = getCommitsArray()[0];
  prettyPrintCommitHistory([v100]);
}, "prettyPrint");
var clear2 = v9(function () {
  state.reset();
  v16();
}, "clear");
var getBranchesAsObjArray = v9(function () {
  const v101 = [...state.records.branchConfig.values()].map((v102, v103) => {
    if (v102.order !== null && v102.order !== undefined) {
      return v102;
    }
    return {
      ...v102,
      order: parseFloat("0." + v103)
    };
  }).sort((v104, v105) => (v104.order ?? 0) - (v105.order ?? 0)).map(({
    name: v106
  }) => ({
    name: v106
  }));
  return v101;
}, "getBranchesAsObjArray");
var getBranches = v9(function () {
  return state.records.branches;
}, "getBranches");
var getCommits = v9(function () {
  return state.records.commits;
}, "getCommits");
var getCommitsArray = v9(function () {
  const v107 = [...state.records.commits.values()];
  v107.forEach(function (v108) {
    v11.debug(v108.id);
  });
  v107.sort((v109, v110) => v109.seq - v110.seq);
  return v107;
}, "getCommitsArray");
var getCurrentBranch = v9(function () {
  return state.records.currBranch;
}, "getCurrentBranch");
var getDirection = v9(function () {
  return state.records.direction;
}, "getDirection");
var getHead = v9(function () {
  return state.records.head;
}, "getHead");
var db = {
  commitType: commitType,
  getConfig: getConfig3,
  setDirection: setDirection,
  setOptions: setOptions,
  getOptions: getOptions,
  commit: commit,
  branch: branch,
  merge: merge,
  cherryPick: cherryPick,
  checkout: checkout,
  prettyPrint: prettyPrint,
  clear: clear2,
  getBranchesAsObjArray: getBranchesAsObjArray,
  getBranches: getBranches,
  getCommits: getCommits,
  getCommitsArray: getCommitsArray,
  getCurrentBranch: getCurrentBranch,
  getDirection: getDirection,
  getHead: getHead,
  setAccTitle: v8,
  getAccTitle: v7,
  getAccDescription: v6,
  setAccDescription: v5,
  setDiagramTitle: v4,
  getDiagramTitle: v3
};
var populate = v9((v111, v112) => {
  v2(v111, v112);
  if (v111.dir) {
    v112.setDirection(v111.dir);
  }
  for (const v113 of v111.statements) {
    parseStatement(v113, v112);
  }
}, "populate");
var parseStatement = v9((v114, v115) => {
  const v116 = {
    Commit: v9(v117 => v115.commit(parseCommit(v117)), "Commit"),
    Branch: v9(v118 => v115.branch(parseBranch(v118)), "Branch"),
    Merge: v9(v119 => v115.merge(parseMerge(v119)), "Merge"),
    Checkout: v9(v120 => v115.checkout(parseCheckout(v120)), "Checkout"),
    CherryPicking: v9(v121 => v115.cherryPick(parseCherryPicking(v121)), "CherryPicking")
  };
  const v122 = v116[v114.$type];
  if (v122) {
    v122(v114);
  } else {
    v11.error("Unknown statement type: " + v114.$type);
  }
}, "parseStatement");
var parseCommit = v9(v123 => {
  const v124 = {
    id: v123.id,
    msg: v123.message ?? "",
    type: v123.type !== undefined ? commitType[v123.type] : commitType.NORMAL,
    tags: v123.tags ?? undefined
  };
  return v124;
}, "parseCommit");
var parseBranch = v9(v125 => {
  const v126 = {
    name: v125.name,
    order: v125.order ?? 0
  };
  return v126;
}, "parseBranch");
var parseMerge = v9(v127 => {
  const v128 = {
    branch: v127.branch,
    id: v127.id ?? "",
    type: v127.type !== undefined ? commitType[v127.type] : undefined,
    tags: v127.tags ?? undefined
  };
  return v128;
}, "parseMerge");
var parseCheckout = v9(v129 => {
  const v130 = v129.branch;
  return v130;
}, "parseCheckout");
var parseCherryPicking = v9(v131 => {
  const v132 = {
    id: v131.id,
    targetId: "",
    tags: v131.tags?.length === 0 ? undefined : v131.tags,
    parent: v131.parent
  };
  return v132;
}, "parseCherryPicking");
var parser = {
  parse: v9(async v133 => {
    const v134 = await v21("gitGraph", v133);
    v11.debug(v134);
    populate(v134, db);
  }, "parse")
};
var LAYOUT_OFFSET = 10;
var COMMIT_STEP = 40;
var PX = 4;
var PY = 2;
var THEME_COLOR_LIMIT = 8;
var REDUX_GEOMETRY_THEMES = new Set(["redux", "redux-dark", "redux-color", "redux-dark-color"]);
var REDUX_BRANCH_LABEL_PADDING_Y = 12;
var COLOR_THEMES = new Set(["redux-color", "redux-dark-color"]);
var DARK_THEMES = new Set(["dark", "redux-dark", "redux-dark-color", "neo-dark"]);
var calcColorIndex = v9((v135, v136, v137 = false) => {
  if (v137 && v135 > 0) {
    return (v135 - 1) % (v136 - 1) + 1;
  }
  return v135 % v136;
}, "calcColorIndex");
var branchPos = new Map();
var commitPos = new Map();
var defaultPos = 30;
var allCommitsDict = new Map();
var lanes = [];
var maxPos = 0;
var dir = "LR";
var clear3 = v9(() => {
  branchPos.clear();
  commitPos.clear();
  allCommitsDict.clear();
  maxPos = 0;
  lanes = [];
  dir = "LR";
}, "clear");
var drawText = v9(v138 => {
  const v139 = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const v140 = typeof v138 === "string" ? v138.split(/\\n|\n|<br\s*\/?>/gi) : v138;
  v140.forEach(v141 => {
    const v142 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    v142.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
    v142.setAttribute("dy", "1em");
    v142.setAttribute("x", "0");
    v142.setAttribute("class", "row");
    v142.textContent = v141.trim();
    v139.appendChild(v142);
  });
  return v139;
}, "drawText");
var findClosestParent = v9(v143 => {
  let v144;
  let v145;
  let v146;
  if (dir === "BT") {
    v145 = v9((v147, v148) => v147 <= v148, "comparisonFunc");
    v146 = Infinity;
  } else {
    v145 = v9((v149, v150) => v149 >= v150, "comparisonFunc");
    v146 = 0;
  }
  v143.forEach(v151 => {
    const v152 = dir === "TB" || dir == "BT" ? commitPos.get(v151)?.y : commitPos.get(v151)?.x;
    if (v152 !== undefined && v145(v152, v146)) {
      v144 = v151;
      v146 = v152;
    }
  });
  return v144;
}, "findClosestParent");
var findClosestParentBT = v9(v153 => {
  let v154 = "";
  let v155 = Infinity;
  v153.forEach(v156 => {
    const v157 = commitPos.get(v156).y;
    if (v157 <= v155) {
      v154 = v156;
      v155 = v157;
    }
  });
  return v154 || undefined;
}, "findClosestParentBT");
var setParallelBTPos = v9((v158, v159, v160) => {
  let v161 = v160;
  let v162 = v160;
  const v163 = [];
  v158.forEach(v164 => {
    const v165 = v159.get(v164);
    if (!v165) {
      throw new Error("Commit not found for key " + v164);
    }
    if (v165.parents.length) {
      v161 = calculateCommitPosition(v165);
      v162 = Math.max(v161, v162);
    } else {
      v163.push(v165);
    }
    setCommitPosition(v165, v161);
  });
  v161 = v162;
  v163.forEach(v166 => {
    setRootPosition(v166, v161, v160);
  });
  v158.forEach(v167 => {
    const v168 = v159.get(v167);
    if (v168?.parents.length) {
      const v169 = findClosestParentBT(v168.parents);
      v161 = commitPos.get(v169).y - COMMIT_STEP;
      if (v161 <= v162) {
        v162 = v161;
      }
      const v170 = branchPos.get(v168.branch).pos;
      const v171 = v161 - LAYOUT_OFFSET;
      commitPos.set(v168.id, {
        x: v170,
        y: v171
      });
    }
  });
}, "setParallelBTPos");
var findClosestParentPos = v9(v172 => {
  const v173 = findClosestParent(v172.parents.filter(v174 => v174 !== null));
  if (!v173) {
    throw new Error("Closest parent not found for commit " + v172.id);
  }
  const v175 = commitPos.get(v173)?.y;
  if (v175 === undefined) {
    throw new Error("Closest parent position not found for commit " + v172.id);
  }
  return v175;
}, "findClosestParentPos");
var calculateCommitPosition = v9(v176 => {
  const v177 = findClosestParentPos(v176);
  return v177 + COMMIT_STEP;
}, "calculateCommitPosition");
var setCommitPosition = v9((v178, v179) => {
  const v180 = branchPos.get(v178.branch);
  if (!v180) {
    throw new Error("Branch not found for commit " + v178.id);
  }
  const v181 = v180.pos;
  const v182 = v179 + LAYOUT_OFFSET;
  commitPos.set(v178.id, {
    x: v181,
    y: v182
  });
  return {
    x: v181,
    y: v182
  };
}, "setCommitPosition");
var setRootPosition = v9((v183, v184, v185) => {
  const v186 = branchPos.get(v183.branch);
  if (!v186) {
    throw new Error("Branch not found for commit " + v183.id);
  }
  const v187 = v184 + v185;
  const v188 = v186.pos;
  commitPos.set(v183.id, {
    x: v188,
    y: v187
  });
}, "setRootPosition");
var drawCommitBullet = v9((v189, v190, v191, v192, v193, v194) => {
  const {
    theme: v195
  } = v13();
  const v196 = REDUX_GEOMETRY_THEMES.has(v195 ?? "");
  const v197 = COLOR_THEMES.has(v195 ?? "");
  const v198 = DARK_THEMES.has(v195 ?? "");
  if (v194 === commitType.HIGHLIGHT) {
    v189.append("rect").attr("x", v191.x - 10 + (v196 ? 3 : 0)).attr("y", v191.y - 10 + (v196 ? 3 : 0)).attr("width", v196 ? 14 : 20).attr("height", v196 ? 14 : 20).attr("class", "commit " + v190.id + " commit-highlight" + calcColorIndex(v193, THEME_COLOR_LIMIT, v197) + " " + v192 + "-outer");
    v189.append("rect").attr("x", v191.x - 6 + (v196 ? 2 : 0)).attr("y", v191.y - 6 + (v196 ? 2 : 0)).attr("width", v196 ? 8 : 12).attr("height", v196 ? 8 : 12).attr("class", "commit " + v190.id + " commit" + calcColorIndex(v193, THEME_COLOR_LIMIT, v197) + " " + v192 + "-inner");
  } else if (v194 === commitType.CHERRY_PICK) {
    v189.append("circle").attr("cx", v191.x).attr("cy", v191.y).attr("r", v196 ? 7 : 10).attr("class", "commit " + v190.id + " " + v192);
    v189.append("circle").attr("cx", v191.x - 3).attr("cy", v191.y + 2).attr("r", v196 ? 2.5 : 2.75).attr("fill", v198 ? "#000000" : "#fff").attr("class", "commit " + v190.id + " " + v192);
    v189.append("circle").attr("cx", v191.x + 3).attr("cy", v191.y + 2).attr("r", v196 ? 2.5 : 2.75).attr("fill", v198 ? "#000000" : "#fff").attr("class", "commit " + v190.id + " " + v192);
    v189.append("line").attr("x1", v191.x + 3).attr("y1", v191.y + 1).attr("x2", v191.x).attr("y2", v191.y - 5).attr("stroke", v198 ? "#000000" : "#fff").attr("class", "commit " + v190.id + " " + v192);
    v189.append("line").attr("x1", v191.x - 3).attr("y1", v191.y + 1).attr("x2", v191.x).attr("y2", v191.y - 5).attr("stroke", v198 ? "#000000" : "#fff").attr("class", "commit " + v190.id + " " + v192);
  } else {
    const v199 = v189.append("circle");
    v199.attr("cx", v191.x);
    v199.attr("cy", v191.y);
    v199.attr("r", v196 ? 7 : 10);
    v199.attr("class", "commit " + v190.id + " commit" + calcColorIndex(v193, THEME_COLOR_LIMIT, v197));
    if (v194 === commitType.MERGE) {
      const v200 = v189.append("circle");
      v200.attr("cx", v191.x);
      v200.attr("cy", v191.y);
      v200.attr("r", v196 ? 5 : 6);
      v200.attr("class", "commit " + v192 + " " + v190.id + " commit" + calcColorIndex(v193, THEME_COLOR_LIMIT, v197));
    }
    if (v194 === commitType.REVERSE) {
      const v201 = v189.append("path");
      const v202 = v196 ? 4 : 5;
      v201.attr("d", "M " + (v191.x - v202) + "," + (v191.y - v202) + "L" + (v191.x + v202) + "," + (v191.y + v202) + "M" + (v191.x - v202) + "," + (v191.y + v202) + "L" + (v191.x + v202) + "," + (v191.y - v202)).attr("class", "commit " + v192 + " " + v190.id + " commit" + calcColorIndex(v193, THEME_COLOR_LIMIT, v197));
    }
  }
}, "drawCommitBullet");
var drawCommitLabel = v9((v203, v204, v205, v206, v207) => {
  if (v204.type !== commitType.CHERRY_PICK && (v204.customId && v204.type === commitType.MERGE || v204.type !== commitType.MERGE) && v207.showCommitLabel) {
    const v208 = v203.append("g");
    const v209 = v208.insert("rect").attr("class", "commit-label-bkg");
    const v210 = v208.append("text").attr("x", v206).attr("y", v205.y + 25).attr("class", "commit-label").text(v204.id);
    const v211 = v210.node()?.getBBox();
    if (v211) {
      v209.attr("x", v205.posWithOffset - v211.width / 2 - PY).attr("y", v205.y + 13.5).attr("width", v211.width + PY * 2).attr("height", v211.height + PY * 2);
      if (dir === "TB" || dir === "BT") {
        v209.attr("x", v205.x - (v211.width + PX * 4 + 5)).attr("y", v205.y - 12);
        v210.attr("x", v205.x - (v211.width + PX * 4)).attr("y", v205.y + v211.height - 12);
      } else {
        v210.attr("x", v205.posWithOffset - v211.width / 2);
      }
      if (v207.rotateCommitLabel) {
        if (dir === "TB" || dir === "BT") {
          v210.attr("transform", "rotate(-45, " + v205.x + ", " + v205.y + ")");
          v209.attr("transform", "rotate(-45, " + v205.x + ", " + v205.y + ")");
        } else {
          const v212 = -7.5 - (v211.width + 10) / 25 * 9.5;
          const v213 = 10 + v211.width / 25 * 8.5;
          v208.attr("transform", "translate(" + v212 + ", " + v213 + ") rotate(-45, " + v206 + ", " + v205.y + ")");
        }
      }
    }
  }
}, "drawCommitLabel");
var drawCommitTags = v9((v214, v215, v216, v217) => {
  if (v215.tags.length > 0) {
    let v218 = 0;
    let v219 = 0;
    let v220 = 0;
    const v221 = [];
    for (const v222 of v215.tags.reverse()) {
      const v223 = v214.insert("polygon");
      const v224 = v214.append("circle");
      const v225 = v214.append("text").attr("y", v216.y - 16 - v218).attr("class", "tag-label").text(v222);
      const v226 = v225.node()?.getBBox();
      if (!v226) {
        throw new Error("Tag bbox not found");
      }
      v219 = Math.max(v219, v226.width);
      v220 = Math.max(v220, v226.height);
      v225.attr("x", v216.posWithOffset - v226.width / 2);
      v221.push({
        tag: v225,
        hole: v224,
        rect: v223,
        yOffset: v218
      });
      v218 += 20;
    }
    for (const {
      tag: v227,
      hole: v228,
      rect: v229,
      yOffset: v230
    } of v221) {
      const v231 = v220 / 2;
      const v232 = v216.y - 19.2 - v230;
      v229.attr("class", "tag-label-bkg").attr("points", "\n      " + (v217 - v219 / 2 - PX / 2) + "," + (v232 + PY) + "  \n      " + (v217 - v219 / 2 - PX / 2) + "," + (v232 - PY) + "\n      " + (v216.posWithOffset - v219 / 2 - PX) + "," + (v232 - v231 - PY) + "\n      " + (v216.posWithOffset + v219 / 2 + PX) + "," + (v232 - v231 - PY) + "\n      " + (v216.posWithOffset + v219 / 2 + PX) + "," + (v232 + v231 + PY) + "\n      " + (v216.posWithOffset - v219 / 2 - PX) + "," + (v232 + v231 + PY));
      v228.attr("cy", v232).attr("cx", v217 - v219 / 2 + PX / 2).attr("r", 1.5).attr("class", "tag-hole");
      if (dir === "TB" || dir === "BT") {
        const v233 = v217 + v230;
        v229.attr("class", "tag-label-bkg").attr("points", "\n        " + v216.x + "," + (v233 + 2) + "\n        " + v216.x + "," + (v233 - 2) + "\n        " + (v216.x + LAYOUT_OFFSET) + "," + (v233 - v231 - 2) + "\n        " + (v216.x + LAYOUT_OFFSET + v219 + 4) + "," + (v233 - v231 - 2) + "\n        " + (v216.x + LAYOUT_OFFSET + v219 + 4) + "," + (v233 + v231 + 2) + "\n        " + (v216.x + LAYOUT_OFFSET) + "," + (v233 + v231 + 2)).attr("transform", "translate(12,12) rotate(45, " + v216.x + "," + v217 + ")");
        v228.attr("cx", v216.x + PX / 2).attr("cy", v233).attr("transform", "translate(12,12) rotate(45, " + v216.x + "," + v217 + ")");
        v227.attr("x", v216.x + 5).attr("y", v233 + 3).attr("transform", "translate(14,14) rotate(45, " + v216.x + "," + v217 + ")");
      }
    }
  }
}, "drawCommitTags");
var getCommitClassType = v9(v234 => {
  const v235 = v234.customType ?? v234.type;
  switch (v235) {
    case commitType.NORMAL:
      return "commit-normal";
    case commitType.REVERSE:
      return "commit-reverse";
    case commitType.HIGHLIGHT:
      return "commit-highlight";
    case commitType.MERGE:
      return "commit-merge";
    case commitType.CHERRY_PICK:
      return "commit-cherry-pick";
    default:
      return "commit-normal";
  }
}, "getCommitClassType");
var calculatePosition = v9((v236, v237, v238, v239) => {
  const v240 = {
    x: 0,
    y: 0
  };
  if (v236.parents.length > 0) {
    const v241 = findClosestParent(v236.parents);
    if (v241) {
      const v242 = v239.get(v241) ?? v240;
      if (v237 === "TB") {
        return v242.y + COMMIT_STEP;
      } else if (v237 === "BT") {
        const v243 = v239.get(v236.id) ?? v240;
        return v243.y - COMMIT_STEP;
      } else {
        return v242.x + COMMIT_STEP;
      }
    }
  } else if (v237 === "TB") {
    return defaultPos;
  } else if (v237 === "BT") {
    const v244 = v239.get(v236.id) ?? v240;
    return v244.y - COMMIT_STEP;
  } else {
    return 0;
  }
  return 0;
}, "calculatePosition");
var getCommitPosition = v9((v245, v246, v247) => {
  const v248 = dir === "BT" && v247 ? v246 : v246 + LAYOUT_OFFSET;
  const v249 = branchPos.get(v245.branch)?.pos;
  const v250 = dir === "TB" || dir === "BT" ? branchPos.get(v245.branch)?.pos : v248;
  if (v250 === undefined || v249 === undefined) {
    throw new Error("Position were undefined for commit " + v245.id);
  }
  const v251 = REDUX_GEOMETRY_THEMES.has(v13().theme ?? "");
  const v252 = dir === "TB" || dir === "BT" ? v248 : v249 + (v251 ? REDUX_BRANCH_LABEL_PADDING_Y / 2 + 1 : -2);
  return {
    x: v250,
    y: v252,
    posWithOffset: v248
  };
}, "getCommitPosition");
var drawCommits = v9((v253, v254, v255, v256) => {
  const v257 = v253.append("g").attr("class", "commit-bullets");
  const v258 = v253.append("g").attr("class", "commit-labels");
  let v259 = dir === "TB" || dir === "BT" ? defaultPos : 0;
  const v260 = [...v254.keys()];
  const v261 = v256.parallelCommits ?? false;
  const v262 = v9((v263, v264) => {
    const v265 = v254.get(v263)?.seq;
    const v266 = v254.get(v264)?.seq;
    if (v265 !== undefined && v266 !== undefined) {
      return v265 - v266;
    } else {
      return 0;
    }
  }, "sortKeys");
  let v267 = v260.sort(v262);
  if (dir === "BT") {
    if (v261) {
      setParallelBTPos(v267, v254, v259);
    }
    v267 = v267.reverse();
  }
  v267.forEach(v268 => {
    const v269 = v254.get(v268);
    if (!v269) {
      throw new Error("Commit not found for key " + v268);
    }
    if (v261) {
      v259 = calculatePosition(v269, dir, v259, commitPos);
    }
    const v270 = getCommitPosition(v269, v259, v261);
    if (v255) {
      const v271 = getCommitClassType(v269);
      const v272 = v269.customType ?? v269.type;
      const v273 = branchPos.get(v269.branch)?.index ?? 0;
      drawCommitBullet(v257, v269, v270, v271, v273, v272);
      drawCommitLabel(v258, v269, v270, v259, v256);
      drawCommitTags(v258, v269, v270, v259);
    }
    if (dir === "TB" || dir === "BT") {
      commitPos.set(v269.id, {
        x: v270.x,
        y: v270.posWithOffset
      });
    } else {
      commitPos.set(v269.id, {
        x: v270.posWithOffset,
        y: v270.y
      });
    }
    v259 = dir === "BT" && v261 ? v259 + COMMIT_STEP : v259 + COMMIT_STEP + LAYOUT_OFFSET;
    if (v259 > maxPos) {
      maxPos = v259;
    }
  });
}, "drawCommits");
var shouldRerouteArrow = v9((v274, v275, v276, v277, v278) => {
  const v279 = dir === "TB" || dir === "BT" ? v276.x < v277.x : v276.y < v277.y;
  const v280 = v279 ? v275.branch : v274.branch;
  const v281 = v9(v282 => v282.branch === v280, "isOnBranchToGetCurve");
  const v283 = v9(v284 => v284.seq > v274.seq && v284.seq < v275.seq, "isBetweenCommits");
  return [...v278.values()].some(v285 => {
    return v283(v285) && v281(v285);
  });
}, "shouldRerouteArrow");
var findLane = v9((v286, v287, v288 = 0) => {
  const v289 = v286 + Math.abs(v286 - v287) / 2;
  if (v288 > 5) {
    return v289;
  }
  const v290 = lanes.every(v291 => Math.abs(v291 - v289) >= 10);
  if (v290) {
    lanes.push(v289);
    return v289;
  }
  const v292 = Math.abs(v286 - v287);
  return findLane(v286, v287 - v292 / 5, v288 + 1);
}, "findLane");
var drawArrow = v9((v293, v294, v295, v296) => {
  const {
    theme: v297
  } = v13();
  const v298 = COLOR_THEMES.has(v297 ?? "");
  const v299 = commitPos.get(v294.id);
  const v300 = commitPos.get(v295.id);
  if (v299 === undefined || v300 === undefined) {
    throw new Error("Commit positions not found for commits " + v294.id + " and " + v295.id);
  }
  const v301 = shouldRerouteArrow(v294, v295, v299, v300, v296);
  let v302 = "";
  let v303 = "";
  let v304 = 0;
  let v305 = 0;
  let v306 = branchPos.get(v295.branch)?.index;
  if (v295.type === commitType.MERGE && v294.id !== v295.parents[0]) {
    v306 = branchPos.get(v294.branch)?.index;
  }
  let v307;
  if (v301) {
    v302 = "A 10 10, 0, 0, 0,";
    v303 = "A 10 10, 0, 0, 1,";
    v304 = 10;
    v305 = 10;
    const v308 = v299.y < v300.y ? findLane(v299.y, v300.y) : findLane(v300.y, v299.y);
    const v309 = v299.x < v300.x ? findLane(v299.x, v300.x) : findLane(v300.x, v299.x);
    if (dir === "TB") {
      if (v299.x < v300.x) {
        v307 = "M " + v299.x + " " + v299.y + " L " + (v309 - v304) + " " + v299.y + " " + v303 + " " + v309 + " " + (v299.y + v305) + " L " + v309 + " " + (v300.y - v304) + " " + v302 + " " + (v309 + v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
      } else {
        v306 = branchPos.get(v294.branch)?.index;
        v307 = "M " + v299.x + " " + v299.y + " L " + (v309 + v304) + " " + v299.y + " " + v302 + " " + v309 + " " + (v299.y + v305) + " L " + v309 + " " + (v300.y - v304) + " " + v303 + " " + (v309 - v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
      }
    } else if (dir === "BT") {
      if (v299.x < v300.x) {
        v307 = "M " + v299.x + " " + v299.y + " L " + (v309 - v304) + " " + v299.y + " " + v302 + " " + v309 + " " + (v299.y - v305) + " L " + v309 + " " + (v300.y + v304) + " " + v303 + " " + (v309 + v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
      } else {
        v306 = branchPos.get(v294.branch)?.index;
        v307 = "M " + v299.x + " " + v299.y + " L " + (v309 + v304) + " " + v299.y + " " + v303 + " " + v309 + " " + (v299.y - v305) + " L " + v309 + " " + (v300.y + v304) + " " + v302 + " " + (v309 - v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
      }
    } else if (v299.y < v300.y) {
      v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v308 - v304) + " " + v302 + " " + (v299.x + v305) + " " + v308 + " L " + (v300.x - v304) + " " + v308 + " " + v303 + " " + v300.x + " " + (v308 + v305) + " L " + v300.x + " " + v300.y;
    } else {
      v306 = branchPos.get(v294.branch)?.index;
      v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v308 + v304) + " " + v303 + " " + (v299.x + v305) + " " + v308 + " L " + (v300.x - v304) + " " + v308 + " " + v302 + " " + v300.x + " " + (v308 - v305) + " L " + v300.x + " " + v300.y;
    }
  } else {
    v302 = "A 20 20, 0, 0, 0,";
    v303 = "A 20 20, 0, 0, 1,";
    v304 = 20;
    v305 = 20;
    if (dir === "TB") {
      if (v299.x < v300.x) {
        if (v295.type === commitType.MERGE && v294.id !== v295.parents[0]) {
          v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v300.y - v304) + " " + v302 + " " + (v299.x + v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
        } else {
          v307 = "M " + v299.x + " " + v299.y + " L " + (v300.x - v304) + " " + v299.y + " " + v303 + " " + v300.x + " " + (v299.y + v305) + " L " + v300.x + " " + v300.y;
        }
      }
      if (v299.x > v300.x) {
        v302 = "A 20 20, 0, 0, 0,";
        v303 = "A 20 20, 0, 0, 1,";
        v304 = 20;
        v305 = 20;
        if (v295.type === commitType.MERGE && v294.id !== v295.parents[0]) {
          v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v300.y - v304) + " " + v303 + " " + (v299.x - v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
        } else {
          v307 = "M " + v299.x + " " + v299.y + " L " + (v300.x + v304) + " " + v299.y + " " + v302 + " " + v300.x + " " + (v299.y + v305) + " L " + v300.x + " " + v300.y;
        }
      }
      if (v299.x === v300.x) {
        v307 = "M " + v299.x + " " + v299.y + " L " + v300.x + " " + v300.y;
      }
    } else if (dir === "BT") {
      if (v299.x < v300.x) {
        if (v295.type === commitType.MERGE && v294.id !== v295.parents[0]) {
          v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v300.y + v304) + " " + v303 + " " + (v299.x + v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
        } else {
          v307 = "M " + v299.x + " " + v299.y + " L " + (v300.x - v304) + " " + v299.y + " " + v302 + " " + v300.x + " " + (v299.y - v305) + " L " + v300.x + " " + v300.y;
        }
      }
      if (v299.x > v300.x) {
        v302 = "A 20 20, 0, 0, 0,";
        v303 = "A 20 20, 0, 0, 1,";
        v304 = 20;
        v305 = 20;
        if (v295.type === commitType.MERGE && v294.id !== v295.parents[0]) {
          v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v300.y + v304) + " " + v302 + " " + (v299.x - v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
        } else {
          v307 = "M " + v299.x + " " + v299.y + " L " + (v300.x + v304) + " " + v299.y + " " + v303 + " " + v300.x + " " + (v299.y - v305) + " L " + v300.x + " " + v300.y;
        }
      }
      if (v299.x === v300.x) {
        v307 = "M " + v299.x + " " + v299.y + " L " + v300.x + " " + v300.y;
      }
    } else {
      if (v299.y < v300.y) {
        if (v295.type === commitType.MERGE && v294.id !== v295.parents[0]) {
          v307 = "M " + v299.x + " " + v299.y + " L " + (v300.x - v304) + " " + v299.y + " " + v303 + " " + v300.x + " " + (v299.y + v305) + " L " + v300.x + " " + v300.y;
        } else {
          v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v300.y - v304) + " " + v302 + " " + (v299.x + v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
        }
      }
      if (v299.y > v300.y) {
        if (v295.type === commitType.MERGE && v294.id !== v295.parents[0]) {
          v307 = "M " + v299.x + " " + v299.y + " L " + (v300.x - v304) + " " + v299.y + " " + v302 + " " + v300.x + " " + (v299.y - v305) + " L " + v300.x + " " + v300.y;
        } else {
          v307 = "M " + v299.x + " " + v299.y + " L " + v299.x + " " + (v300.y + v304) + " " + v303 + " " + (v299.x + v305) + " " + v300.y + " L " + v300.x + " " + v300.y;
        }
      }
      if (v299.y === v300.y) {
        v307 = "M " + v299.x + " " + v299.y + " L " + v300.x + " " + v300.y;
      }
    }
  }
  if (v307 === undefined) {
    throw new Error("Line definition not found");
  }
  v293.append("path").attr("d", v307).attr("class", "arrow arrow" + calcColorIndex(v306, THEME_COLOR_LIMIT, v298));
}, "drawArrow");
var drawArrows = v9((v310, v311) => {
  const v312 = v310.append("g").attr("class", "commit-arrows");
  [...v311.keys()].forEach(v313 => {
    const v314 = v311.get(v313);
    if (v314.parents && v314.parents.length > 0) {
      v314.parents.forEach(v315 => {
        drawArrow(v312, v311.get(v315), v314, v311);
      });
    }
  });
}, "drawArrows");
var drawBranches = v9((v316, v317, v318, v319) => {
  const {
    look: v320,
    theme: v321,
    themeVariables: v322
  } = v13();
  const {
    dropShadow: v323,
    THEME_COLOR_LIMIT: v324
  } = v322;
  const v325 = REDUX_GEOMETRY_THEMES.has(v321 ?? "");
  const v326 = COLOR_THEMES.has(v321 ?? "");
  const v327 = v316.append("g");
  v317.forEach((v328, v329) => {
    const v330 = calcColorIndex(v329, v325 ? v324 : THEME_COLOR_LIMIT, v326);
    const v331 = branchPos.get(v328.name)?.pos;
    if (v331 === undefined) {
      throw new Error("Position not found for branch " + v328.name);
    }
    const v332 = dir === "TB" || dir === "BT" ? v331 : v325 ? v331 + REDUX_BRANCH_LABEL_PADDING_Y / 2 + 1 : v331 - 2;
    const v333 = v327.append("line");
    v333.attr("x1", 0);
    v333.attr("y1", v332);
    v333.attr("x2", maxPos);
    v333.attr("y2", v332);
    v333.attr("class", "branch branch" + v330);
    if (dir === "TB") {
      v333.attr("y1", defaultPos);
      v333.attr("x1", v331);
      v333.attr("y2", maxPos);
      v333.attr("x2", v331);
    } else if (dir === "BT") {
      v333.attr("y1", maxPos);
      v333.attr("x1", v331);
      v333.attr("y2", defaultPos);
      v333.attr("x2", v331);
    }
    lanes.push(v332);
    const v334 = v328.name;
    const v335 = drawText(v334);
    const v336 = v327.insert("rect");
    const v337 = v327.insert("g").attr("class", "branchLabel");
    const v338 = v337.insert("g").attr("class", "label branch-label" + v330);
    v338.node().appendChild(v335);
    const v339 = v335.getBBox();
    const v340 = v325 ? 0 : 4;
    const v341 = v325 ? 16 : 0;
    const v342 = v325 ? REDUX_BRANCH_LABEL_PADDING_Y : 0;
    if (v320 === "neo") {
      v336.attr("data-look", "neo");
    }
    v336.attr("class", "branchLabelBkg label" + v330).attr("style", v320 === "neo" ? "filter:" + (v325 ? "url(#" + v319 + "-drop-shadow)" : v323) : "").attr("rx", v340).attr("ry", v340).attr("x", -v339.width - 4 - (v318.rotateCommitLabel === true ? 30 : 0)).attr("y", -v339.height / 2 + 10).attr("width", v339.width + 18 + v341).attr("height", v339.height + 4 + v342);
    v338.attr("transform", "translate(" + (-v339.width - 14 - (v318.rotateCommitLabel === true ? 30 : 0) + v341 / 2) + ", " + (v332 - v339.height / 2 - 2) + ")");
    if (dir === "TB") {
      v336.attr("x", v331 - v339.width / 2 - 10).attr("y", 0);
      v338.attr("transform", "translate(" + (v331 - v339.width / 2 - 5) + ", 0)");
      if (v325) {
        v336.attr("transform", "translate(" + (-v341 / 2 - 3) + ", " + (-v342 - 10) + ")");
        v338.attr("transform", "translate(" + (v331 - v339.width / 2 - 5) + ", " + (-v342 * 2 + 7) + ")");
      }
    } else if (dir === "BT") {
      v336.attr("x", v331 - v339.width / 2 - 10).attr("y", maxPos);
      v338.attr("transform", "translate(" + (v331 - v339.width / 2 - 5) + ", " + maxPos + ")");
      if (v325) {
        v336.attr("transform", "translate(" + (-v341 / 2 - 3) + ", " + (v342 + 10) + ")");
        v338.attr("transform", "translate(" + (v331 - v339.width / 2 - 5) + ", " + (maxPos + v342 * 2 + 4) + ")");
      }
    } else {
      v336.attr("transform", "translate(-19, " + (v332 - 12 - v342 / 2) + ")");
    }
  });
}, "drawBranches");
var setBranchPosition = v9(function (v343, v344, v345, v346, v347) {
  branchPos.set(v343, {
    pos: v344,
    index: v345
  });
  v344 += 50 + (v347 ? 40 : 0) + (dir === "TB" || dir === "BT" ? v346.width / 2 : 0);
  return v344;
}, "setBranchPosition");
var draw = v9(function (v348, v349, v350, v351) {
  clear3();
  v11.debug("in gitgraph renderer", v348 + "\n", "id:", v349, v350);
  const v352 = v351.db;
  if (!v352.getConfig) {
    v11.error("getConfig method is not available on db");
    return;
  }
  const v353 = v352.getConfig();
  const v354 = v353.rotateCommitLabel ?? false;
  allCommitsDict = v352.getCommits();
  const v355 = v352.getBranchesAsObjArray();
  dir = v352.getDirection();
  const v356 = v12("[id=\"" + v349 + "\"]");
  const {
    look: v357,
    theme: v358,
    themeVariables: v359
  } = v13();
  const {
    useGradient: v360,
    gradientStart: v361,
    gradientStop: v362,
    filterColor: v363
  } = v359;
  if (v360) {
    const v364 = v356.append("defs").append("linearGradient").attr("id", v349 + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    v364.append("stop").attr("offset", "0%").attr("stop-color", v361).attr("stop-opacity", 1);
    v364.append("stop").attr("offset", "100%").attr("stop-color", v362).attr("stop-opacity", 1);
  }
  if (v357 === "neo" && REDUX_GEOMETRY_THEMES.has(v358 ?? "")) {
    v356.append("defs").append("filter").attr("id", v349 + "-drop-shadow").attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", v363);
  }
  let v365 = 0;
  v355.forEach((v366, v367) => {
    const v368 = drawText(v366.name);
    const v369 = v356.append("g");
    const v370 = v369.insert("g").attr("class", "branchLabel");
    const v371 = v370.insert("g").attr("class", "label branch-label");
    v371.node()?.appendChild(v368);
    const v372 = v368.getBBox();
    v365 = setBranchPosition(v366.name, v365, v367, v372, v354);
    v371.remove();
    v370.remove();
    v369.remove();
  });
  drawCommits(v356, allCommitsDict, false, v353);
  if (v353.showBranches) {
    drawBranches(v356, v355, v353, v349);
  }
  drawArrows(v356, allCommitsDict);
  drawCommits(v356, allCommitsDict, true, v353);
  v14.insertTitle(v356, "gitTitleText", v353.titleTopMargin ?? 0, v352.getDiagramTitle());
  v15(undefined, v356, v353.diagramPadding, v353.useMaxWidth);
}, "draw");
var gitGraphRenderer_default = {
  draw: draw
};
var GIT_NAMED_COLOR_COUNT = 8;
var REDUX_GEOMETRY_THEMES2 = new Set(["redux", "redux-dark", "redux-color", "redux-dark-color"]);
var COLOR_THEMES2 = new Set(["redux-color", "redux-dark-color"]);
var NEO_THEMES = new Set(["neo", "neo-dark"]);
var DARK_THEMES2 = new Set(["dark", "redux-dark", "redux-dark-color", "neo-dark"]);
var NEO_COLOR_GEN_THEMES = new Set(["redux", "redux-dark", "redux-color", "redux-dark-color", "neo", "neo-dark"]);
var genGitGraphGradient = v9(v373 => {
  const {
    svgId: v374
  } = v373;
  let v375 = "";
  if (v373.useGradient && v374) {
    for (let v376 = 0; v376 < v373.THEME_COLOR_LIMIT; v376++) {
      v375 += "\n      .label" + v376 + "  { fill: " + v373.mainBkg + "; stroke: url(" + v374 + "-gradient); stroke-width: " + v373.strokeWidth + ";}\n             ";
    }
  }
  return v375;
}, "genGitGraphGradient");
var genColor = v9(v377 => {
  const v378 = v10();
  const {
    theme: v379,
    themeVariables: v380
  } = v378;
  const {
    borderColorArray: v381
  } = v380;
  const v382 = REDUX_GEOMETRY_THEMES2.has(v379);
  if (NEO_THEMES.has(v379)) {
    let v383 = "";
    for (let v384 = 0; v384 < v377.THEME_COLOR_LIMIT; v384++) {
      if (v384 === 0) {
        v383 += "\n        .branch-label" + v384 + " { fill: " + v377.nodeBorder + ";}\n        .commit" + v384 + " { stroke: " + v377.nodeBorder + ";   }\n        .commit-highlight" + v384 + " { stroke: " + v377.nodeBorder + "; fill: " + v377.nodeBorder + "; }\n        .arrow" + v384 + " { stroke: " + v377.nodeBorder + "; }\n        .commit-bullets { fill: " + v377.nodeBorder + "; }\n        .commit-cherry-pick" + v384 + " { stroke: " + v377.nodeBorder + "; }\n        " + genGitGraphGradient(v377);
      } else {
        const v385 = v384 % GIT_NAMED_COLOR_COUNT;
        v383 += "\n        .branch-label" + v384 + " { fill: " + v377["gitBranchLabel" + v385] + "; }\n        .commit" + v384 + " { stroke: " + v377["git" + v385] + "; fill: " + v377["git" + v385] + "; }\n        .commit-highlight" + v384 + " { stroke: " + v377["gitInv" + v385] + "; fill: " + v377["gitInv" + v385] + "; }\n        .arrow" + v384 + " { stroke: " + v377["git" + v385] + "; }\n        ";
      }
    }
    return v383;
  } else if (!COLOR_THEMES2.has(v379)) {
    let v386 = "";
    for (let v387 = 0; v387 < v377.THEME_COLOR_LIMIT; v387++) {
      v386 += "\n        .branch-label" + v387 + " { fill: " + v377.nodeBorder + "; " + (v382 ? "font-weight:" + v377.noteFontWeight : "") + " }\n        .commit" + v387 + " { stroke: " + v377.nodeBorder + ";   }\n        .commit-highlight" + v387 + " { stroke: " + v377.nodeBorder + "; fill: " + v377.nodeBorder + "; }\n        .label" + v387 + "  { fill: " + v377.mainBkg + "; stroke: " + v377.nodeBorder + "; stroke-width: " + v377.strokeWidth + "; " + (v382 ? "font-weight:" + v377.noteFontWeight : "") + "}\n        .arrow" + v387 + " { stroke: " + v377.nodeBorder + "; }\n        .commit-bullets { fill: " + v377.nodeBorder + "; }\n        .commit-cherry-pick" + v387 + " { stroke: " + v377.nodeBorder + "; }\n        ";
    }
    return v386;
  } else {
    let v388 = "";
    for (let v389 = 0; v389 < v377.THEME_COLOR_LIMIT; v389++) {
      if (v389 === 0) {
        v388 += "\n        .branch-label" + v389 + " { fill: " + v377.nodeBorder + "; " + (v382 ? "font-weight:" + v377.noteFontWeight : "") + " }\n        .commit" + v389 + " { stroke: " + v377.nodeBorder + "; }\n        .commit-highlight" + v389 + " { stroke: " + v377.nodeBorder + "; fill: " + v377.mainBkg + "; }\n        .label" + v389 + "  { fill: " + v377.mainBkg + "; stroke: " + v377.nodeBorder + "; stroke-width: " + v377.strokeWidth + "; " + (v382 ? "font-weight:" + v377.noteFontWeight : "") + " }\n        .arrow" + v389 + " { stroke: " + v377.nodeBorder + "; }\n        .commit-bullets { fill: " + v377.nodeBorder + "; }\n        ";
      } else {
        const v390 = v389 % v381.length;
        v388 += "\n        .branch-label" + v389 + " { fill: " + v377.nodeBorder + "; " + (v382 ? "font-weight:" + v377.noteFontWeight : "") + " }\n        .commit" + v389 + " { stroke: " + v381[v390] + "; fill: " + v381[v390] + "; }\n        .commit-highlight" + v389 + " { stroke: " + v381[v390] + "; fill: " + v381[v390] + "; }\n        .label" + v389 + "  { fill: " + (DARK_THEMES2.has(v379) ? v377.mainBkg : v381[v390]) + "; stroke: " + v381[v390] + ";  stroke-width: " + v377.strokeWidth + "; }\n        .arrow" + v389 + " { stroke: " + v381[v390] + "; }\n        ";
      }
    }
    return v388;
  }
}, "genColor");
var normalTheme = v9(v391 => {
  return "" + Array.from({
    length: v391.THEME_COLOR_LIMIT
  }, (v392, v393) => v393).map(v394 => {
    const v395 = v394 % GIT_NAMED_COLOR_COUNT;
    return "\n        .branch-label" + v394 + " { fill: " + v391["gitBranchLabel" + v395] + "; }\n        .commit" + v394 + " { stroke: " + v391["git" + v395] + "; fill: " + v391["git" + v395] + "; }\n        .commit-highlight" + v394 + " { stroke: " + v391["gitInv" + v395] + "; fill: " + v391["gitInv" + v395] + "; }\n        .label" + v394 + "  { fill: " + v391["git" + v395] + "; }\n        .arrow" + v394 + " { stroke: " + v391["git" + v395] + "; }\n        ";
  }).join("\n");
}, "normalTheme");
var getStyles = v9(v396 => {
  const v397 = v10();
  const {
    theme: v398
  } = v397;
  const v399 = NEO_COLOR_GEN_THEMES.has(v398);
  return "\n  .commit-id,\n  .commit-msg,\n  .branch-label {\n    fill: lightgrey;\n    color: lightgrey;\n    font-family: 'trebuchet ms', verdana, arial, sans-serif;\n    font-family: var(--mermaid-font-family);\n  }\n  \n  " + (v399 ? genColor(v396) : normalTheme(v396)) + "\n\n  .branch {\n    stroke-width: " + v396.strokeWidth + ";\n    stroke: " + (v396.commitLineColor ?? v396.lineColor) + ";\n    stroke-dasharray:  " + (v399 ? "4 2" : "2") + ";\n  }\n  .commit-label { font-size: " + v396.commitLabelFontSize + "; fill: " + (v399 ? v396.nodeBorder : v396.commitLabelColor) + "; " + (v399 ? "font-weight:" + v396.noteFontWeight + ";" : "") + "}\n  .commit-label-bkg { font-size: " + v396.commitLabelFontSize + "; fill: " + (v399 ? "transparent" : v396.commitLabelBackground) + "; opacity: " + (v399 ? "" : 0.5) + ";  }\n  .tag-label { font-size: " + v396.tagLabelFontSize + "; fill: " + v396.tagLabelColor + ";}\n  .tag-label-bkg { fill: " + (v399 ? v396.mainBkg : v396.tagLabelBackground) + "; stroke: " + (v399 ? v396.nodeBorder : v396.tagLabelBorder) + "; " + (v399 ? "filter:" + v396.dropShadow : "") + "  }\n  .tag-hole { fill: " + v396.textColor + "; }\n\n  .commit-merge {\n    stroke: " + (v399 ? v396.mainBkg : v396.primaryColor) + ";\n    fill: " + (v399 ? v396.mainBkg : v396.primaryColor) + ";\n  }\n  .commit-reverse {\n    stroke: " + (v399 ? v396.mainBkg : v396.primaryColor) + ";\n    fill: " + (v399 ? v396.mainBkg : v396.primaryColor) + ";\n    stroke-width: " + (v399 ? v396.strokeWidth : 3) + ";\n  }\n  .commit-highlight-outer {\n  }\n  .commit-highlight-inner {\n    stroke: " + (v399 ? v396.mainBkg : v396.primaryColor) + ";\n    fill: " + (v399 ? v396.mainBkg : v396.primaryColor) + ";\n  }\n\n  .arrow {\n    /* Intentional: neo themes keep the bold 8px arrow (like classic themes); only redux-geometry themes use the thinner options.strokeWidth. */\n    stroke-width: " + (REDUX_GEOMETRY_THEMES2.has(v398) ? v396.strokeWidth : 8) + ";\n    stroke-linecap: round;\n    fill: none\n  }\n  .gitTitleText {\n    text-anchor: middle;\n    font-size: 18px;\n    fill: " + v396.textColor + ";\n  }\n";
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: parser,
  db: db,
  renderer: gitGraphRenderer_default,
  styles: styles_default
};
export { diagram };