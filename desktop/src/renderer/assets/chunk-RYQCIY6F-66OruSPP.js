import { _ as v1, l as v2 } from "./index-CXb3UsfP.js";
import { i as v3, G as v4 } from "./graph-BMLV0goG.js";
import { b as v5, m as v6 } from "./map-BEO0Bu8q.js";
var CLONE_SYMBOLS_FLAG = 4;
function clone(v7) {
  return v5(v7, CLONE_SYMBOLS_FLAG);
}
function write(v8) {
  var v9 = {
    options: {
      directed: v8.isDirected(),
      multigraph: v8.isMultigraph(),
      compound: v8.isCompound()
    },
    nodes: writeNodes(v8),
    edges: writeEdges(v8)
  };
  if (!v3(v8.graph())) {
    v9.value = clone(v8.graph());
  }
  return v9;
}
function writeNodes(v10) {
  return v6(v10.nodes(), function (v11) {
    var v12 = v10.node(v11);
    var v13 = v10.parent(v11);
    var v14 = {
      v: v11
    };
    if (!v3(v12)) {
      v14.value = v12;
    }
    if (!v3(v13)) {
      v14.parent = v13;
    }
    return v14;
  });
}
function writeEdges(v15) {
  return v6(v15.edges(), function (v16) {
    var v17 = v15.edge(v16);
    var v18 = {
      v: v16.v,
      w: v16.w
    };
    if (!v3(v16.name)) {
      v18.name = v16.name;
    }
    if (!v3(v17)) {
      v18.value = v17;
    }
    return v18;
  });
}
var clusterDb = new Map();
var descendants = new Map();
var parents = new Map();
var clear = v1(() => {
  descendants.clear();
  parents.clear();
  clusterDb.clear();
}, "clear");
var isDescendant = v1((v19, v20) => {
  const v21 = descendants.get(v20) || [];
  v2.trace("In isDescendant", v20, " ", v19, " = ", v21.includes(v19));
  return v21.includes(v19);
}, "isDescendant");
var edgeInCluster = v1((v22, v23) => {
  const v24 = descendants.get(v23) || [];
  v2.info("Descendants of ", v23, " is ", v24);
  v2.info("Edge is ", v22);
  if (v22.v === v23 || v22.w === v23) {
    return false;
  }
  if (!v24) {
    v2.debug("Tilt, ", v23, ",not in descendants");
    return false;
  }
  return v24.includes(v22.v) || isDescendant(v22.v, v23) || isDescendant(v22.w, v23) || v24.includes(v22.w);
}, "edgeInCluster");
var copy = v1((v25, v26, v27, v28) => {
  v2.warn("Copying children of ", v25, "root", v28, "data", v26.node(v25), v28);
  const v29 = v26.children(v25) || [];
  if (v25 !== v28) {
    v29.push(v25);
  }
  v2.warn("Copying (nodes) clusterId", v25, "nodes", v29);
  v29.forEach(v30 => {
    if (v26.children(v30).length > 0) {
      copy(v30, v26, v27, v28);
    } else {
      const v31 = v26.node(v30);
      v2.info("cp ", v30, " to ", v28, " with parent ", v25);
      v27.setNode(v30, v31);
      if (v28 !== v26.parent(v30)) {
        v2.warn("Setting parent", v30, v26.parent(v30));
        v27.setParent(v30, v26.parent(v30));
      }
      if (v25 !== v28 && v30 !== v25) {
        v2.debug("Setting parent", v30, v25);
        v27.setParent(v30, v25);
      } else {
        v2.info("In copy ", v25, "root", v28, "data", v26.node(v25), v28);
        v2.debug("Not Setting parent for node=", v30, "cluster!==rootId", v25 !== v28, "node!==clusterId", v30 !== v25);
      }
      const v32 = v26.edges(v30);
      v2.debug("Copying Edges", v32);
      v32.forEach(v33 => {
        v2.info("Edge", v33);
        const v34 = v26.edge(v33.v, v33.w, v33.name);
        v2.info("Edge data", v34, v28);
        try {
          if (edgeInCluster(v33, v28)) {
            const v35 = descendants.get(v28) || [];
            const v36 = v35.includes(v33.v) || isDescendant(v33.v, v28) || v33.v === v28;
            const v37 = v35.includes(v33.w) || isDescendant(v33.w, v28) || v33.w === v28;
            if (v36 && v37) {
              v2.info("Copying as ", v33.v, v33.w, v34, v33.name);
              v27.setEdge(v33.v, v33.w, v34, v33.name);
              v2.info("newGraph edges ", v27.edges(), v27.edge(v27.edges()[0]));
            } else {
              const v38 = v36 ? v28 : v33.v;
              const v39 = v37 ? v28 : v33.w;
              v2.info("Rebinding cross-boundary edge as ", v38, v39, v34, v33.name);
              v26.setEdge(v38, v39, v34, v33.name);
            }
          } else {
            v2.info("Skipping copy of edge ", v33.v, "-->", v33.w, " rootId: ", v28, " clusterId:", v25);
          }
        } catch (v40) {
          v2.error(v40);
        }
      });
    }
    v2.debug("Removing node", v30);
    v26.removeNode(v30);
  });
}, "copy");
var extractDescendants = v1((v41, v42) => {
  const v43 = v42.children(v41);
  let v44 = [...v43];
  for (const v45 of v43) {
    parents.set(v45, v41);
    v44 = [...v44, ...extractDescendants(v45, v42)];
  }
  return v44;
}, "extractDescendants");
var findCommonEdges = v1((v46, v47, v48) => {
  const v49 = v46.edges().filter(v50 => v50.v === v47 || v50.w === v47);
  const v51 = v46.edges().filter(v52 => v52.v === v48 || v52.w === v48);
  const v53 = v49.map(v54 => {
    return {
      v: v54.v === v47 ? v48 : v54.v,
      w: v54.w === v47 ? v47 : v54.w
    };
  });
  const v55 = v51.map(v56 => {
    return {
      v: v56.v,
      w: v56.w
    };
  });
  const v57 = v53.filter(v58 => {
    return v55.some(v59 => v58.v === v59.v && v58.w === v59.w);
  });
  return v57;
}, "findCommonEdges");
var findNonClusterChild = v1((v60, v61, v62) => {
  const v63 = v61.children(v60);
  v2.trace("Searching children of id ", v60, v63);
  if (v63.length < 1) {
    return v60;
  }
  let v64;
  for (const v65 of v63) {
    const v66 = findNonClusterChild(v65, v61, v62);
    const v67 = findCommonEdges(v61, v62, v66);
    if (v66) {
      if (v67.length > 0) {
        v64 = v66;
      } else {
        return v66;
      }
    }
  }
  return v64;
}, "findNonClusterChild");
var getAnchorId = v1(v68 => {
  if (!clusterDb.has(v68)) {
    return v68;
  }
  if (!clusterDb.get(v68).externalConnections) {
    return v68;
  }
  if (clusterDb.has(v68)) {
    return clusterDb.get(v68).id;
  }
  return v68;
}, "getAnchorId");
var adjustClustersAndEdges = v1((v69, v70) => {
  if (!v69 || v70 > 10) {
    v2.debug("Opting out, no graph ");
    return;
  } else {
    v2.debug("Opting in, graph ");
  }
  v69.nodes().forEach(function (v71) {
    const v72 = v69.children(v71);
    if (v72.length > 0) {
      v2.warn("Cluster identified", v71, " Replacement id in edges: ", findNonClusterChild(v71, v69, v71));
      descendants.set(v71, extractDescendants(v71, v69));
      clusterDb.set(v71, {
        id: findNonClusterChild(v71, v69, v71),
        clusterData: v69.node(v71)
      });
    }
  });
  v69.nodes().forEach(function (v73) {
    const v74 = v69.children(v73);
    const v75 = v69.edges();
    if (v74.length > 0) {
      v2.debug("Cluster identified", v73, descendants);
      v75.forEach(v76 => {
        const v77 = isDescendant(v76.v, v73);
        const v78 = isDescendant(v76.w, v73);
        if (v77 ^ v78) {
          v2.warn("Edge: ", v76, " leaves cluster ", v73);
          v2.warn("Descendants of XXX ", v73, ": ", descendants.get(v73));
          clusterDb.get(v73).externalConnections = true;
        }
      });
    } else {
      v2.debug("Not a cluster ", v73, descendants);
    }
  });
  for (let v79 of clusterDb.keys()) {
    const v80 = clusterDb.get(v79).id;
    const v81 = v69.parent(v80);
    if (v81 !== v79 && clusterDb.has(v81) && !clusterDb.get(v81).externalConnections) {
      clusterDb.get(v79).id = v81;
    }
    const v82 = v69.edges().some(v83 => v83.v === v79);
    if (v80 && clusterDb.get(v79)?.externalConnections && v82 && isNodeInExtractableCluster(v69, v80, v79)) {
      const v84 = findSafeAnchorNode(v69, v79, v69.parent(v80));
      if (v84) {
        clusterDb.get(v79).id = v84;
      }
    }
  }
  v69.edges().forEach(function (v85) {
    const v86 = v69.edge(v85);
    v2.warn("Edge " + v85.v + " -> " + v85.w + ": " + JSON.stringify(v85));
    v2.warn("Edge " + v85.v + " -> " + v85.w + ": " + JSON.stringify(v69.edge(v85)));
    let v87 = v85.v;
    let v88 = v85.w;
    v2.warn("Fix XXX", clusterDb, "ids:", v85.v, v85.w, "Translating: ", clusterDb.get(v85.v), " --- ", clusterDb.get(v85.w));
    if (clusterDb.get(v85.v) || clusterDb.get(v85.w)) {
      v2.warn("Fixing and trying - removing XXX", v85.v, v85.w, v85.name);
      v87 = getAnchorId(v85.v);
      v88 = getAnchorId(v85.w);
      v69.removeEdge(v85.v, v85.w, v85.name);
      if (v87 !== v85.v) {
        const v89 = v69.parent(v87);
        clusterDb.get(v89).externalConnections = true;
        v86.fromCluster = v85.v;
      }
      if (v88 !== v85.w) {
        const v90 = v69.parent(v88);
        clusterDb.get(v90).externalConnections = true;
        v86.toCluster = v85.w;
      }
      v2.warn("Fix Replacing with XXX", v87, v88, v85.name);
      v69.setEdge(v87, v88, v86, v85.name);
    }
  });
  v2.warn("Adjusted Graph", write(v69));
  extractor(v69, 0);
  v2.trace(clusterDb);
}, "adjustClustersAndEdges");
var extractor = v1((v91, v92) => {
  v2.warn("extractor - ", v92, write(v91), v91.children("D"));
  if (v92 > 10) {
    v2.error("Bailing out");
    return;
  }
  let v93 = v91.nodes();
  let v94 = false;
  for (const v95 of v93) {
    const v96 = v91.children(v95);
    v94 = v94 || v96.length > 0;
  }
  if (!v94) {
    v2.debug("Done, no node has children", v91.nodes());
    return;
  }
  v2.debug("Nodes = ", v93, v92);
  for (const v97 of v93) {
    v2.debug("Extracting node", v97, clusterDb, clusterDb.has(v97) && !clusterDb.get(v97).externalConnections, !v91.parent(v97), v91.node(v97), v91.children("D"), " Depth ", v92);
    if (!clusterDb.has(v97)) {
      v2.debug("Not a cluster", v97, v92);
    } else if (clusterDb.get(v97)?.clusterData?.explicitDir && v91.children(v97) && v91.children(v97).length > 0) {
      v2.warn("Cluster with explicit dir, creating subgraph for children", v97, v92);
      const v98 = clusterDb.get(v97).clusterData.dir;
      const v99 = new v4({
        multigraph: true,
        compound: true
      }).setGraph({
        rankdir: v98,
        nodesep: 50,
        ranksep: 50,
        marginx: 8,
        marginy: 8
      }).setDefaultEdgeLabel(function () {
        return {};
      });
      copy(v97, v91, v99, v97);
      const v100 = v91.node(v97) || {};
      v91.setNode(v97, {
        ...v100,
        clusterNode: true,
        id: v97,
        clusterData: clusterDb.get(v97).clusterData,
        label: clusterDb.get(v97).label,
        graph: v99
      });
      v2.warn("Subgraph for cluster with explicit dir created:", v97, write(v99));
    } else if (!clusterDb.get(v97).externalConnections && v91.children(v97) && v91.children(v97).length > 0) {
      v2.warn("Cluster without external connections, without a parent and with children", v97, v92);
      const v101 = v91.graph();
      let v102 = v101.rankdir === "TB" ? "LR" : "TB";
      if (clusterDb.get(v97)?.clusterData?.dir) {
        v102 = clusterDb.get(v97).clusterData.dir;
        v2.warn("Fixing dir", clusterDb.get(v97).clusterData.dir, v102);
      }
      const v103 = new v4({
        multigraph: true,
        compound: true
      }).setGraph({
        rankdir: v102,
        nodesep: 50,
        ranksep: 50,
        marginx: 8,
        marginy: 8
      }).setDefaultEdgeLabel(function () {
        return {};
      });
      copy(v97, v91, v103, v97);
      const v104 = v91.node(v97) || {};
      v91.setNode(v97, {
        ...v104,
        clusterNode: true,
        id: v97,
        clusterData: clusterDb.get(v97).clusterData,
        label: clusterDb.get(v97).label,
        graph: v103
      });
      v2.debug("Old graph after copy", write(v91));
    } else {
      v2.warn("Cluster ** ", v97, " **not meeting the criteria !externalConnections:", !clusterDb.get(v97).externalConnections, " no parent: ", !v91.parent(v97), " children ", v91.children(v97) && v91.children(v97).length > 0, v91.children("D"), v92);
      v2.debug(clusterDb);
    }
  }
  v93 = v91.nodes();
  v2.warn("New list of nodes", v93);
  for (const v105 of v93) {
    const v106 = v91.node(v105);
    v2.warn(" Now next level", v105, v106);
    if (v106?.clusterNode) {
      extractor(v106.graph, v92 + 1);
    }
  }
}, "extractor");
var sorter = v1((v107, v108) => {
  if (v108.length === 0) {
    return [];
  }
  let v109 = Object.assign([], v108);
  v108.forEach(v110 => {
    const v111 = v107.children(v110);
    const v112 = sorter(v107, v111);
    v109 = [...v109, ...v112];
  });
  return v109;
}, "sorter");
var sortNodesByHierarchy = v1(v113 => sorter(v113, v113.children()), "sortNodesByHierarchy");
var isNodeInExtractableCluster = v1((v114, v115, v116) => {
  let v117 = v114.parent(v115);
  while (v117 && v117 !== v116) {
    const v118 = clusterDb.get(v117);
    if (v118 && !v118.externalConnections) {
      return true;
    }
    v117 = v114.parent(v117);
  }
  return false;
}, "isNodeInExtractableCluster");
var findSafeAnchorNode = v1((v119, v120, v121) => {
  const v122 = v119.children(v120) ?? [];
  for (const v123 of v122) {
    if (v123 === v121 || isDescendant(v123, v121)) {
      continue;
    }
    const v124 = findNonClusterChild(v123, v119, v120);
    if (!v124) {
      continue;
    }
    if (!isNodeInExtractableCluster(v119, v124, v120)) {
      return v124;
    }
  }
  return null;
}, "findSafeAnchorNode");
export { adjustClustersAndEdges as a, clusterDb as b, clear as c, findNonClusterChild as f, sortNodesByHierarchy as s, write as w };