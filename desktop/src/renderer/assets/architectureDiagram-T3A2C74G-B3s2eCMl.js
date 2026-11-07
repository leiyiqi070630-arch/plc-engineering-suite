import { p as v1 } from "./chunk-JWPE2WC7-tA1pS24c.js";
import { b8 as v2, _ as v3, D as v4, W as v5, l as v6, b as v7, a as v8, n as v9, o as v10, g as v11, s as v12, p as v13, A as v14, y as v15, B as v16, c as v17, b0 as v18, ai as v19, i as v20, d as v21, q as v22, aj as v23, b9 as v24 } from "./index-CXb3UsfP.js";
import { p as v25 } from "./cynefin-VYW2F7L2-RPOqF6Wz.js";
import { c as v26 } from "./cytoscape.esm-Bx_1tVW-.js";
var cytoscapeFcose$1 = {
  exports: {}
};
var coseBase$1 = {
  exports: {}
};
var layoutBase$1 = {
  exports: {}
};
var layoutBase = layoutBase$1.exports;
var hasRequiredLayoutBase;
function requireLayoutBase() {
  if (hasRequiredLayoutBase) {
    return layoutBase$1.exports;
  }
  hasRequiredLayoutBase = 1;
  (function (v27, v28) {
    (function v29(v30, v31) {
      v27.exports = v31();
    })(layoutBase, function () {
      return function (v32) {
        var v33 = {};
        function v34(v35) {
          if (v33[v35]) {
            return v33[v35].exports;
          }
          var v36 = v33[v35] = {
            i: v35,
            l: false,
            exports: {}
          };
          v32[v35].call(v36.exports, v36, v36.exports, v34);
          v36.l = true;
          return v36.exports;
        }
        v34.m = v32;
        v34.c = v33;
        v34.i = function (v37) {
          return v37;
        };
        v34.d = function (v38, v39, v40) {
          if (!v34.o(v38, v39)) {
            Object.defineProperty(v38, v39, {
              configurable: false,
              enumerable: true,
              get: v40
            });
          }
        };
        v34.n = function (v41) {
          var v42 = v41 && v41.__esModule ? function v43() {
            return v41.default;
          } : function v44() {
            return v41;
          };
          v34.d(v42, "a", v42);
          return v42;
        };
        v34.o = function (v45, v46) {
          return Object.prototype.hasOwnProperty.call(v45, v46);
        };
        v34.p = "";
        return v34(v34.s = 28);
      }([function (v47, v48, v49) {
        function v50() {}
        v50.QUALITY = 1;
        v50.DEFAULT_CREATE_BENDS_AS_NEEDED = false;
        v50.DEFAULT_INCREMENTAL = false;
        v50.DEFAULT_ANIMATION_ON_LAYOUT = true;
        v50.DEFAULT_ANIMATION_DURING_LAYOUT = false;
        v50.DEFAULT_ANIMATION_PERIOD = 50;
        v50.DEFAULT_UNIFORM_LEAF_NODE_SIZES = false;
        v50.DEFAULT_GRAPH_MARGIN = 15;
        v50.NODE_DIMENSIONS_INCLUDE_LABELS = false;
        v50.SIMPLE_NODE_SIZE = 40;
        v50.SIMPLE_NODE_HALF_SIZE = v50.SIMPLE_NODE_SIZE / 2;
        v50.EMPTY_COMPOUND_NODE_SIZE = 40;
        v50.MIN_EDGE_LENGTH = 1;
        v50.WORLD_BOUNDARY = 1000000;
        v50.INITIAL_WORLD_BOUNDARY = v50.WORLD_BOUNDARY / 1000;
        v50.WORLD_CENTER_X = 1200;
        v50.WORLD_CENTER_Y = 900;
        v47.exports = v50;
      }, function (v51, v52, v53) {
        var v54 = v53(2);
        var v55 = v53(8);
        var v56 = v53(9);
        function v57(v58, v59, v60) {
          v54.call(this, v60);
          this.isOverlapingSourceAndTarget = false;
          this.vGraphObject = v60;
          this.bendpoints = [];
          this.source = v58;
          this.target = v59;
        }
        v57.prototype = Object.create(v54.prototype);
        for (var v61 in v54) {
          v57[v61] = v54[v61];
        }
        v57.prototype.getSource = function () {
          return this.source;
        };
        v57.prototype.getTarget = function () {
          return this.target;
        };
        v57.prototype.isInterGraph = function () {
          return this.isInterGraph;
        };
        v57.prototype.getLength = function () {
          return this.length;
        };
        v57.prototype.isOverlapingSourceAndTarget = function () {
          return this.isOverlapingSourceAndTarget;
        };
        v57.prototype.getBendpoints = function () {
          return this.bendpoints;
        };
        v57.prototype.getLca = function () {
          return this.lca;
        };
        v57.prototype.getSourceInLca = function () {
          return this.sourceInLca;
        };
        v57.prototype.getTargetInLca = function () {
          return this.targetInLca;
        };
        v57.prototype.getOtherEnd = function (v62) {
          if (this.source === v62) {
            return this.target;
          } else if (this.target === v62) {
            return this.source;
          } else {
            throw "Node is not incident with this edge";
          }
        };
        v57.prototype.getOtherEndInGraph = function (v63, v64) {
          var v65 = this.getOtherEnd(v63);
          var v66 = v64.getGraphManager().getRoot();
          while (true) {
            if (v65.getOwner() == v64) {
              return v65;
            }
            if (v65.getOwner() == v66) {
              break;
            }
            v65 = v65.getOwner().getParent();
          }
          return null;
        };
        v57.prototype.updateLength = function () {
          var v67 = new Array(4);
          this.isOverlapingSourceAndTarget = v55.getIntersection(this.target.getRect(), this.source.getRect(), v67);
          if (!this.isOverlapingSourceAndTarget) {
            this.lengthX = v67[0] - v67[2];
            this.lengthY = v67[1] - v67[3];
            if (Math.abs(this.lengthX) < 1) {
              this.lengthX = v56.sign(this.lengthX);
            }
            if (Math.abs(this.lengthY) < 1) {
              this.lengthY = v56.sign(this.lengthY);
            }
            this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
          }
        };
        v57.prototype.updateLengthSimple = function () {
          this.lengthX = this.target.getCenterX() - this.source.getCenterX();
          this.lengthY = this.target.getCenterY() - this.source.getCenterY();
          if (Math.abs(this.lengthX) < 1) {
            this.lengthX = v56.sign(this.lengthX);
          }
          if (Math.abs(this.lengthY) < 1) {
            this.lengthY = v56.sign(this.lengthY);
          }
          this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
        };
        v51.exports = v57;
      }, function (v68, v69, v70) {
        function v71(v72) {
          this.vGraphObject = v72;
        }
        v68.exports = v71;
      }, function (v73, v74, v75) {
        var v76 = v75(2);
        var v77 = v75(10);
        var v78 = v75(13);
        var v79 = v75(0);
        var v80 = v75(16);
        var v81 = v75(5);
        function v82(v83, v84, v85, v86) {
          if (v85 == null && v86 == null) {
            v86 = v84;
          }
          v76.call(this, v86);
          if (v83.graphManager != null) {
            v83 = v83.graphManager;
          }
          this.estimatedSize = v77.MIN_VALUE;
          this.inclusionTreeDepth = v77.MAX_VALUE;
          this.vGraphObject = v86;
          this.edges = [];
          this.graphManager = v83;
          if (v85 != null && v84 != null) {
            this.rect = new v78(v84.x, v84.y, v85.width, v85.height);
          } else {
            this.rect = new v78();
          }
        }
        v82.prototype = Object.create(v76.prototype);
        for (var v87 in v76) {
          v82[v87] = v76[v87];
        }
        v82.prototype.getEdges = function () {
          return this.edges;
        };
        v82.prototype.getChild = function () {
          return this.child;
        };
        v82.prototype.getOwner = function () {
          return this.owner;
        };
        v82.prototype.getWidth = function () {
          return this.rect.width;
        };
        v82.prototype.setWidth = function (v88) {
          this.rect.width = v88;
        };
        v82.prototype.getHeight = function () {
          return this.rect.height;
        };
        v82.prototype.setHeight = function (v89) {
          this.rect.height = v89;
        };
        v82.prototype.getCenterX = function () {
          return this.rect.x + this.rect.width / 2;
        };
        v82.prototype.getCenterY = function () {
          return this.rect.y + this.rect.height / 2;
        };
        v82.prototype.getCenter = function () {
          return new v81(this.rect.x + this.rect.width / 2, this.rect.y + this.rect.height / 2);
        };
        v82.prototype.getLocation = function () {
          return new v81(this.rect.x, this.rect.y);
        };
        v82.prototype.getRect = function () {
          return this.rect;
        };
        v82.prototype.getDiagonal = function () {
          return Math.sqrt(this.rect.width * this.rect.width + this.rect.height * this.rect.height);
        };
        v82.prototype.getHalfTheDiagonal = function () {
          return Math.sqrt(this.rect.height * this.rect.height + this.rect.width * this.rect.width) / 2;
        };
        v82.prototype.setRect = function (v90, v91) {
          this.rect.x = v90.x;
          this.rect.y = v90.y;
          this.rect.width = v91.width;
          this.rect.height = v91.height;
        };
        v82.prototype.setCenter = function (v92, v93) {
          this.rect.x = v92 - this.rect.width / 2;
          this.rect.y = v93 - this.rect.height / 2;
        };
        v82.prototype.setLocation = function (v94, v95) {
          this.rect.x = v94;
          this.rect.y = v95;
        };
        v82.prototype.moveBy = function (v96, v97) {
          this.rect.x += v96;
          this.rect.y += v97;
        };
        v82.prototype.getEdgeListToNode = function (v98) {
          var v99 = [];
          var v100 = this;
          v100.edges.forEach(function (v101) {
            if (v101.target == v98) {
              if (v101.source != v100) {
                throw "Incorrect edge source!";
              }
              v99.push(v101);
            }
          });
          return v99;
        };
        v82.prototype.getEdgesBetween = function (v102) {
          var v103 = [];
          var v104 = this;
          v104.edges.forEach(function (v105) {
            if (v105.source != v104 && v105.target != v104) {
              throw "Incorrect edge source and/or target";
            }
            if (v105.target == v102 || v105.source == v102) {
              v103.push(v105);
            }
          });
          return v103;
        };
        v82.prototype.getNeighborsList = function () {
          var v106 = new Set();
          var v107 = this;
          v107.edges.forEach(function (v108) {
            if (v108.source == v107) {
              v106.add(v108.target);
            } else {
              if (v108.target != v107) {
                throw "Incorrect incidency!";
              }
              v106.add(v108.source);
            }
          });
          return v106;
        };
        v82.prototype.withChildren = function () {
          var v109 = new Set();
          var v110;
          var v111;
          v109.add(this);
          if (this.child != null) {
            var v112 = this.child.getNodes();
            for (var v113 = 0; v113 < v112.length; v113++) {
              v110 = v112[v113];
              v111 = v110.withChildren();
              v111.forEach(function (v114) {
                v109.add(v114);
              });
            }
          }
          return v109;
        };
        v82.prototype.getNoOfChildren = function () {
          var v115 = 0;
          var v116;
          if (this.child == null) {
            v115 = 1;
          } else {
            var v117 = this.child.getNodes();
            for (var v118 = 0; v118 < v117.length; v118++) {
              v116 = v117[v118];
              v115 += v116.getNoOfChildren();
            }
          }
          if (v115 == 0) {
            v115 = 1;
          }
          return v115;
        };
        v82.prototype.getEstimatedSize = function () {
          if (this.estimatedSize == v77.MIN_VALUE) {
            throw "assert failed";
          }
          return this.estimatedSize;
        };
        v82.prototype.calcEstimatedSize = function () {
          if (this.child == null) {
            return this.estimatedSize = (this.rect.width + this.rect.height) / 2;
          } else {
            this.estimatedSize = this.child.calcEstimatedSize();
            this.rect.width = this.estimatedSize;
            this.rect.height = this.estimatedSize;
            return this.estimatedSize;
          }
        };
        v82.prototype.scatter = function () {
          var v119;
          var v120;
          var v121 = -v79.INITIAL_WORLD_BOUNDARY;
          var v122 = v79.INITIAL_WORLD_BOUNDARY;
          v119 = v79.WORLD_CENTER_X + v80.nextDouble() * (v122 - v121) + v121;
          var v123 = -v79.INITIAL_WORLD_BOUNDARY;
          var v124 = v79.INITIAL_WORLD_BOUNDARY;
          v120 = v79.WORLD_CENTER_Y + v80.nextDouble() * (v124 - v123) + v123;
          this.rect.x = v119;
          this.rect.y = v120;
        };
        v82.prototype.updateBounds = function () {
          if (this.getChild() == null) {
            throw "assert failed";
          }
          if (this.getChild().getNodes().length != 0) {
            var v125 = this.getChild();
            v125.updateBounds(true);
            this.rect.x = v125.getLeft();
            this.rect.y = v125.getTop();
            this.setWidth(v125.getRight() - v125.getLeft());
            this.setHeight(v125.getBottom() - v125.getTop());
            if (v79.NODE_DIMENSIONS_INCLUDE_LABELS) {
              var v126 = v125.getRight() - v125.getLeft();
              var v127 = v125.getBottom() - v125.getTop();
              if (this.labelWidth) {
                if (this.labelPosHorizontal == "left") {
                  this.rect.x -= this.labelWidth;
                  this.setWidth(v126 + this.labelWidth);
                } else if (this.labelPosHorizontal == "center" && this.labelWidth > v126) {
                  this.rect.x -= (this.labelWidth - v126) / 2;
                  this.setWidth(this.labelWidth);
                } else if (this.labelPosHorizontal == "right") {
                  this.setWidth(v126 + this.labelWidth);
                }
              }
              if (this.labelHeight) {
                if (this.labelPosVertical == "top") {
                  this.rect.y -= this.labelHeight;
                  this.setHeight(v127 + this.labelHeight);
                } else if (this.labelPosVertical == "center" && this.labelHeight > v127) {
                  this.rect.y -= (this.labelHeight - v127) / 2;
                  this.setHeight(this.labelHeight);
                } else if (this.labelPosVertical == "bottom") {
                  this.setHeight(v127 + this.labelHeight);
                }
              }
            }
          }
        };
        v82.prototype.getInclusionTreeDepth = function () {
          if (this.inclusionTreeDepth == v77.MAX_VALUE) {
            throw "assert failed";
          }
          return this.inclusionTreeDepth;
        };
        v82.prototype.transform = function (v128) {
          var v129 = this.rect.x;
          if (v129 > v79.WORLD_BOUNDARY) {
            v129 = v79.WORLD_BOUNDARY;
          } else if (v129 < -v79.WORLD_BOUNDARY) {
            v129 = -v79.WORLD_BOUNDARY;
          }
          var v130 = this.rect.y;
          if (v130 > v79.WORLD_BOUNDARY) {
            v130 = v79.WORLD_BOUNDARY;
          } else if (v130 < -v79.WORLD_BOUNDARY) {
            v130 = -v79.WORLD_BOUNDARY;
          }
          var v131 = new v81(v129, v130);
          var v132 = v128.inverseTransformPoint(v131);
          this.setLocation(v132.x, v132.y);
        };
        v82.prototype.getLeft = function () {
          return this.rect.x;
        };
        v82.prototype.getRight = function () {
          return this.rect.x + this.rect.width;
        };
        v82.prototype.getTop = function () {
          return this.rect.y;
        };
        v82.prototype.getBottom = function () {
          return this.rect.y + this.rect.height;
        };
        v82.prototype.getParent = function () {
          if (this.owner == null) {
            return null;
          }
          return this.owner.getParent();
        };
        v73.exports = v82;
      }, function (v133, v134, v135) {
        var v136 = v135(0);
        function v137() {}
        for (var v138 in v136) {
          v137[v138] = v136[v138];
        }
        v137.MAX_ITERATIONS = 2500;
        v137.DEFAULT_EDGE_LENGTH = 50;
        v137.DEFAULT_SPRING_STRENGTH = 0.45;
        v137.DEFAULT_REPULSION_STRENGTH = 4500;
        v137.DEFAULT_GRAVITY_STRENGTH = 0.4;
        v137.DEFAULT_COMPOUND_GRAVITY_STRENGTH = 1;
        v137.DEFAULT_GRAVITY_RANGE_FACTOR = 3.8;
        v137.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = 1.5;
        v137.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION = true;
        v137.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION = true;
        v137.DEFAULT_COOLING_FACTOR_INCREMENTAL = 0.3;
        v137.COOLING_ADAPTATION_FACTOR = 0.33;
        v137.ADAPTATION_LOWER_NODE_LIMIT = 1000;
        v137.ADAPTATION_UPPER_NODE_LIMIT = 5000;
        v137.MAX_NODE_DISPLACEMENT_INCREMENTAL = 100;
        v137.MAX_NODE_DISPLACEMENT = v137.MAX_NODE_DISPLACEMENT_INCREMENTAL * 3;
        v137.MIN_REPULSION_DIST = v137.DEFAULT_EDGE_LENGTH / 10;
        v137.CONVERGENCE_CHECK_PERIOD = 100;
        v137.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = 0.1;
        v137.MIN_EDGE_LENGTH = 1;
        v137.GRID_CALCULATION_CHECK_PERIOD = 10;
        v133.exports = v137;
      }, function (v139, v140, v141) {
        function v142(v143, v144) {
          if (v143 == null && v144 == null) {
            this.x = 0;
            this.y = 0;
          } else {
            this.x = v143;
            this.y = v144;
          }
        }
        v142.prototype.getX = function () {
          return this.x;
        };
        v142.prototype.getY = function () {
          return this.y;
        };
        v142.prototype.setX = function (v145) {
          this.x = v145;
        };
        v142.prototype.setY = function (v146) {
          this.y = v146;
        };
        v142.prototype.getDifference = function (v147) {
          return new DimensionD(this.x - v147.x, this.y - v147.y);
        };
        v142.prototype.getCopy = function () {
          return new v142(this.x, this.y);
        };
        v142.prototype.translate = function (v148) {
          this.x += v148.width;
          this.y += v148.height;
          return this;
        };
        v139.exports = v142;
      }, function (v149, v150, v151) {
        var v152 = v151(2);
        var v153 = v151(10);
        var v154 = v151(0);
        var v155 = v151(7);
        var v156 = v151(3);
        var v157 = v151(1);
        var v158 = v151(13);
        var v159 = v151(12);
        var v160 = v151(11);
        function v161(v162, v163, v164) {
          v152.call(this, v164);
          this.estimatedSize = v153.MIN_VALUE;
          this.margin = v154.DEFAULT_GRAPH_MARGIN;
          this.edges = [];
          this.nodes = [];
          this.isConnected = false;
          this.parent = v162;
          if (v163 != null && v163 instanceof v155) {
            this.graphManager = v163;
          } else if (v163 != null && v163 instanceof Layout) {
            this.graphManager = v163.graphManager;
          }
        }
        v161.prototype = Object.create(v152.prototype);
        for (var v165 in v152) {
          v161[v165] = v152[v165];
        }
        v161.prototype.getNodes = function () {
          return this.nodes;
        };
        v161.prototype.getEdges = function () {
          return this.edges;
        };
        v161.prototype.getGraphManager = function () {
          return this.graphManager;
        };
        v161.prototype.getParent = function () {
          return this.parent;
        };
        v161.prototype.getLeft = function () {
          return this.left;
        };
        v161.prototype.getRight = function () {
          return this.right;
        };
        v161.prototype.getTop = function () {
          return this.top;
        };
        v161.prototype.getBottom = function () {
          return this.bottom;
        };
        v161.prototype.isConnected = function () {
          return this.isConnected;
        };
        v161.prototype.add = function (v166, v167, v168) {
          if (v167 == null && v168 == null) {
            var v169 = v166;
            if (this.graphManager == null) {
              throw "Graph has no graph mgr!";
            }
            if (this.getNodes().indexOf(v169) > -1) {
              throw "Node already in graph!";
            }
            v169.owner = this;
            this.getNodes().push(v169);
            return v169;
          } else {
            var v170 = v166;
            if (!(this.getNodes().indexOf(v167) > -1) || !(this.getNodes().indexOf(v168) > -1)) {
              throw "Source or target not in graph!";
            }
            if (v167.owner != v168.owner || v167.owner != this) {
              throw "Both owners must be this graph!";
            }
            if (v167.owner != v168.owner) {
              return null;
            }
            v170.source = v167;
            v170.target = v168;
            v170.isInterGraph = false;
            this.getEdges().push(v170);
            v167.edges.push(v170);
            if (v168 != v167) {
              v168.edges.push(v170);
            }
            return v170;
          }
        };
        v161.prototype.remove = function (v171) {
          var v172 = v171;
          if (v171 instanceof v156) {
            if (v172 == null) {
              throw "Node is null!";
            }
            if (v172.owner == null || v172.owner != this) {
              throw "Owner graph is invalid!";
            }
            if (this.graphManager == null) {
              throw "Owner graph manager is invalid!";
            }
            var v173 = v172.edges.slice();
            var v174;
            var v175 = v173.length;
            for (var v176 = 0; v176 < v175; v176++) {
              v174 = v173[v176];
              if (v174.isInterGraph) {
                this.graphManager.remove(v174);
              } else {
                v174.source.owner.remove(v174);
              }
            }
            var v177 = this.nodes.indexOf(v172);
            if (v177 == -1) {
              throw "Node not in owner node list!";
            }
            this.nodes.splice(v177, 1);
          } else if (v171 instanceof v157) {
            var v174 = v171;
            if (v174 == null) {
              throw "Edge is null!";
            }
            if (v174.source == null || v174.target == null) {
              throw "Source and/or target is null!";
            }
            if (v174.source.owner == null || v174.target.owner == null || v174.source.owner != this || v174.target.owner != this) {
              throw "Source and/or target owner is invalid!";
            }
            var v178 = v174.source.edges.indexOf(v174);
            var v179 = v174.target.edges.indexOf(v174);
            if (!(v178 > -1) || !(v179 > -1)) {
              throw "Source and/or target doesn't know this edge!";
            }
            v174.source.edges.splice(v178, 1);
            if (v174.target != v174.source) {
              v174.target.edges.splice(v179, 1);
            }
            var v177 = v174.source.owner.getEdges().indexOf(v174);
            if (v177 == -1) {
              throw "Not in owner's edge list!";
            }
            v174.source.owner.getEdges().splice(v177, 1);
          }
        };
        v161.prototype.updateLeftTop = function () {
          var v180 = v153.MAX_VALUE;
          var v181 = v153.MAX_VALUE;
          var v182;
          var v183;
          var v184;
          var v185 = this.getNodes();
          var v186 = v185.length;
          for (var v187 = 0; v187 < v186; v187++) {
            var v188 = v185[v187];
            v182 = v188.getTop();
            v183 = v188.getLeft();
            if (v180 > v182) {
              v180 = v182;
            }
            if (v181 > v183) {
              v181 = v183;
            }
          }
          if (v180 == v153.MAX_VALUE) {
            return null;
          }
          if (v185[0].getParent().paddingLeft != undefined) {
            v184 = v185[0].getParent().paddingLeft;
          } else {
            v184 = this.margin;
          }
          this.left = v181 - v184;
          this.top = v180 - v184;
          return new v159(this.left, this.top);
        };
        v161.prototype.updateBounds = function (v189) {
          var v190 = v153.MAX_VALUE;
          var v191 = -v153.MAX_VALUE;
          var v192 = v153.MAX_VALUE;
          var v193 = -v153.MAX_VALUE;
          var v194;
          var v195;
          var v196;
          var v197;
          var v198;
          var v199 = this.nodes;
          var v200 = v199.length;
          for (var v201 = 0; v201 < v200; v201++) {
            var v202 = v199[v201];
            if (v189 && v202.child != null) {
              v202.updateBounds();
            }
            v194 = v202.getLeft();
            v195 = v202.getRight();
            v196 = v202.getTop();
            v197 = v202.getBottom();
            if (v190 > v194) {
              v190 = v194;
            }
            if (v191 < v195) {
              v191 = v195;
            }
            if (v192 > v196) {
              v192 = v196;
            }
            if (v193 < v197) {
              v193 = v197;
            }
          }
          var v203 = new v158(v190, v192, v191 - v190, v193 - v192);
          if (v190 == v153.MAX_VALUE) {
            this.left = this.parent.getLeft();
            this.right = this.parent.getRight();
            this.top = this.parent.getTop();
            this.bottom = this.parent.getBottom();
          }
          if (v199[0].getParent().paddingLeft != undefined) {
            v198 = v199[0].getParent().paddingLeft;
          } else {
            v198 = this.margin;
          }
          this.left = v203.x - v198;
          this.right = v203.x + v203.width + v198;
          this.top = v203.y - v198;
          this.bottom = v203.y + v203.height + v198;
        };
        v161.calculateBounds = function (v204) {
          var v205 = v153.MAX_VALUE;
          var v206 = -v153.MAX_VALUE;
          var v207 = v153.MAX_VALUE;
          var v208 = -v153.MAX_VALUE;
          var v209;
          var v210;
          var v211;
          var v212;
          var v213 = v204.length;
          for (var v214 = 0; v214 < v213; v214++) {
            var v215 = v204[v214];
            v209 = v215.getLeft();
            v210 = v215.getRight();
            v211 = v215.getTop();
            v212 = v215.getBottom();
            if (v205 > v209) {
              v205 = v209;
            }
            if (v206 < v210) {
              v206 = v210;
            }
            if (v207 > v211) {
              v207 = v211;
            }
            if (v208 < v212) {
              v208 = v212;
            }
          }
          var v216 = new v158(v205, v207, v206 - v205, v208 - v207);
          return v216;
        };
        v161.prototype.getInclusionTreeDepth = function () {
          if (this == this.graphManager.getRoot()) {
            return 1;
          } else {
            return this.parent.getInclusionTreeDepth();
          }
        };
        v161.prototype.getEstimatedSize = function () {
          if (this.estimatedSize == v153.MIN_VALUE) {
            throw "assert failed";
          }
          return this.estimatedSize;
        };
        v161.prototype.calcEstimatedSize = function () {
          var v217 = 0;
          var v218 = this.nodes;
          var v219 = v218.length;
          for (var v220 = 0; v220 < v219; v220++) {
            var v221 = v218[v220];
            v217 += v221.calcEstimatedSize();
          }
          if (v217 == 0) {
            this.estimatedSize = v154.EMPTY_COMPOUND_NODE_SIZE;
          } else {
            this.estimatedSize = v217 / Math.sqrt(this.nodes.length);
          }
          return this.estimatedSize;
        };
        v161.prototype.updateConnected = function () {
          var v222 = this;
          if (this.nodes.length == 0) {
            this.isConnected = true;
            return;
          }
          var v223 = new v160();
          var v224 = new Set();
          var v225 = this.nodes[0];
          var v226;
          var v227;
          var v228 = v225.withChildren();
          v228.forEach(function (v229) {
            v223.push(v229);
            v224.add(v229);
          });
          while (v223.length !== 0) {
            v225 = v223.shift();
            v226 = v225.getEdges();
            var v230 = v226.length;
            for (var v231 = 0; v231 < v230; v231++) {
              var v232 = v226[v231];
              v227 = v232.getOtherEndInGraph(v225, this);
              if (v227 != null && !v224.has(v227)) {
                var v233 = v227.withChildren();
                v233.forEach(function (v234) {
                  v223.push(v234);
                  v224.add(v234);
                });
              }
            }
          }
          this.isConnected = false;
          if (v224.size >= this.nodes.length) {
            var v235 = 0;
            v224.forEach(function (v236) {
              if (v236.owner == v222) {
                v235++;
              }
            });
            if (v235 == this.nodes.length) {
              this.isConnected = true;
            }
          }
        };
        v149.exports = v161;
      }, function (v237, v238, v239) {
        var v240;
        var v241 = v239(1);
        function v242(v243) {
          v240 = v239(6);
          this.layout = v243;
          this.graphs = [];
          this.edges = [];
        }
        v242.prototype.addRoot = function () {
          var v244 = this.layout.newGraph();
          var v245 = this.layout.newNode(null);
          var v246 = this.add(v244, v245);
          this.setRootGraph(v246);
          return this.rootGraph;
        };
        v242.prototype.add = function (v247, v248, v249, v250, v251) {
          if (v249 == null && v250 == null && v251 == null) {
            if (v247 == null) {
              throw "Graph is null!";
            }
            if (v248 == null) {
              throw "Parent node is null!";
            }
            if (this.graphs.indexOf(v247) > -1) {
              throw "Graph already in this graph mgr!";
            }
            this.graphs.push(v247);
            if (v247.parent != null) {
              throw "Already has a parent!";
            }
            if (v248.child != null) {
              throw "Already has a child!";
            }
            v247.parent = v248;
            v248.child = v247;
            return v247;
          } else {
            v251 = v249;
            v250 = v248;
            v249 = v247;
            var v252 = v250.getOwner();
            var v253 = v251.getOwner();
            if (v252 == null || v252.getGraphManager() != this) {
              throw "Source not in this graph mgr!";
            }
            if (v253 == null || v253.getGraphManager() != this) {
              throw "Target not in this graph mgr!";
            }
            if (v252 == v253) {
              v249.isInterGraph = false;
              return v252.add(v249, v250, v251);
            } else {
              v249.isInterGraph = true;
              v249.source = v250;
              v249.target = v251;
              if (this.edges.indexOf(v249) > -1) {
                throw "Edge already in inter-graph edge list!";
              }
              this.edges.push(v249);
              if (v249.source == null || v249.target == null) {
                throw "Edge source and/or target is null!";
              }
              if (v249.source.edges.indexOf(v249) != -1 || v249.target.edges.indexOf(v249) != -1) {
                throw "Edge already in source and/or target incidency list!";
              }
              v249.source.edges.push(v249);
              v249.target.edges.push(v249);
              return v249;
            }
          }
        };
        v242.prototype.remove = function (v254) {
          if (v254 instanceof v240) {
            var v255 = v254;
            if (v255.getGraphManager() != this) {
              throw "Graph not in this graph mgr";
            }
            if (v255 != this.rootGraph && (v255.parent == null || v255.parent.graphManager != this)) {
              throw "Invalid parent node!";
            }
            var v256 = [];
            v256 = v256.concat(v255.getEdges());
            var v257;
            var v258 = v256.length;
            for (var v259 = 0; v259 < v258; v259++) {
              v257 = v256[v259];
              v255.remove(v257);
            }
            var v260 = [];
            v260 = v260.concat(v255.getNodes());
            var v261;
            v258 = v260.length;
            for (var v259 = 0; v259 < v258; v259++) {
              v261 = v260[v259];
              v255.remove(v261);
            }
            if (v255 == this.rootGraph) {
              this.setRootGraph(null);
            }
            var v262 = this.graphs.indexOf(v255);
            this.graphs.splice(v262, 1);
            v255.parent = null;
          } else if (v254 instanceof v241) {
            v257 = v254;
            if (v257 == null) {
              throw "Edge is null!";
            }
            if (!v257.isInterGraph) {
              throw "Not an inter-graph edge!";
            }
            if (v257.source == null || v257.target == null) {
              throw "Source and/or target is null!";
            }
            if (v257.source.edges.indexOf(v257) == -1 || v257.target.edges.indexOf(v257) == -1) {
              throw "Source and/or target doesn't know this edge!";
            }
            var v262 = v257.source.edges.indexOf(v257);
            v257.source.edges.splice(v262, 1);
            v262 = v257.target.edges.indexOf(v257);
            v257.target.edges.splice(v262, 1);
            if (v257.source.owner == null || v257.source.owner.getGraphManager() == null) {
              throw "Edge owner graph or owner graph manager is null!";
            }
            if (v257.source.owner.getGraphManager().edges.indexOf(v257) == -1) {
              throw "Not in owner graph manager's edge list!";
            }
            var v262 = v257.source.owner.getGraphManager().edges.indexOf(v257);
            v257.source.owner.getGraphManager().edges.splice(v262, 1);
          }
        };
        v242.prototype.updateBounds = function () {
          this.rootGraph.updateBounds(true);
        };
        v242.prototype.getGraphs = function () {
          return this.graphs;
        };
        v242.prototype.getAllNodes = function () {
          if (this.allNodes == null) {
            var v263 = [];
            var v264 = this.getGraphs();
            var v265 = v264.length;
            for (var v266 = 0; v266 < v265; v266++) {
              v263 = v263.concat(v264[v266].getNodes());
            }
            this.allNodes = v263;
          }
          return this.allNodes;
        };
        v242.prototype.resetAllNodes = function () {
          this.allNodes = null;
        };
        v242.prototype.resetAllEdges = function () {
          this.allEdges = null;
        };
        v242.prototype.resetAllNodesToApplyGravitation = function () {
          this.allNodesToApplyGravitation = null;
        };
        v242.prototype.getAllEdges = function () {
          if (this.allEdges == null) {
            var v267 = [];
            var v268 = this.getGraphs();
            v268.length;
            for (var v269 = 0; v269 < v268.length; v269++) {
              v267 = v267.concat(v268[v269].getEdges());
            }
            v267 = v267.concat(this.edges);
            this.allEdges = v267;
          }
          return this.allEdges;
        };
        v242.prototype.getAllNodesToApplyGravitation = function () {
          return this.allNodesToApplyGravitation;
        };
        v242.prototype.setAllNodesToApplyGravitation = function (v270) {
          if (this.allNodesToApplyGravitation != null) {
            throw "assert failed";
          }
          this.allNodesToApplyGravitation = v270;
        };
        v242.prototype.getRoot = function () {
          return this.rootGraph;
        };
        v242.prototype.setRootGraph = function (v271) {
          if (v271.getGraphManager() != this) {
            throw "Root not in this graph mgr!";
          }
          this.rootGraph = v271;
          if (v271.parent == null) {
            v271.parent = this.layout.newNode("Root node");
          }
        };
        v242.prototype.getLayout = function () {
          return this.layout;
        };
        v242.prototype.isOneAncestorOfOther = function (v272, v273) {
          if (v272 == null || v273 == null) {
            throw "assert failed";
          }
          if (v272 == v273) {
            return true;
          }
          var v274 = v272.getOwner();
          var v275;
          do {
            v275 = v274.getParent();
            if (v275 == null) {
              break;
            }
            if (v275 == v273) {
              return true;
            }
            v274 = v275.getOwner();
            if (v274 == null) {
              break;
            }
          } while (true);
          v274 = v273.getOwner();
          do {
            v275 = v274.getParent();
            if (v275 == null) {
              break;
            }
            if (v275 == v272) {
              return true;
            }
            v274 = v275.getOwner();
            if (v274 == null) {
              break;
            }
          } while (true);
          return false;
        };
        v242.prototype.calcLowestCommonAncestors = function () {
          var v276;
          var v277;
          var v278;
          var v279;
          var v280;
          var v281 = this.getAllEdges();
          var v282 = v281.length;
          for (var v283 = 0; v283 < v282; v283++) {
            v276 = v281[v283];
            v277 = v276.source;
            v278 = v276.target;
            v276.lca = null;
            v276.sourceInLca = v277;
            v276.targetInLca = v278;
            if (v277 == v278) {
              v276.lca = v277.getOwner();
              continue;
            }
            v279 = v277.getOwner();
            while (v276.lca == null) {
              v276.targetInLca = v278;
              v280 = v278.getOwner();
              while (v276.lca == null) {
                if (v280 == v279) {
                  v276.lca = v280;
                  break;
                }
                if (v280 == this.rootGraph) {
                  break;
                }
                if (v276.lca != null) {
                  throw "assert failed";
                }
                v276.targetInLca = v280.getParent();
                v280 = v276.targetInLca.getOwner();
              }
              if (v279 == this.rootGraph) {
                break;
              }
              if (v276.lca == null) {
                v276.sourceInLca = v279.getParent();
                v279 = v276.sourceInLca.getOwner();
              }
            }
            if (v276.lca == null) {
              throw "assert failed";
            }
          }
        };
        v242.prototype.calcLowestCommonAncestor = function (v284, v285) {
          if (v284 == v285) {
            return v284.getOwner();
          }
          var v286 = v284.getOwner();
          do {
            if (v286 == null) {
              break;
            }
            var v287 = v285.getOwner();
            do {
              if (v287 == null) {
                break;
              }
              if (v287 == v286) {
                return v287;
              }
              v287 = v287.getParent().getOwner();
            } while (true);
            v286 = v286.getParent().getOwner();
          } while (true);
          return v286;
        };
        v242.prototype.calcInclusionTreeDepths = function (v288, v289) {
          if (v288 == null && v289 == null) {
            v288 = this.rootGraph;
            v289 = 1;
          }
          var v290;
          var v291 = v288.getNodes();
          var v292 = v291.length;
          for (var v293 = 0; v293 < v292; v293++) {
            v290 = v291[v293];
            v290.inclusionTreeDepth = v289;
            if (v290.child != null) {
              this.calcInclusionTreeDepths(v290.child, v289 + 1);
            }
          }
        };
        v242.prototype.includesInvalidEdge = function () {
          var v294;
          var v295 = [];
          var v296 = this.edges.length;
          for (var v297 = 0; v297 < v296; v297++) {
            v294 = this.edges[v297];
            if (this.isOneAncestorOfOther(v294.source, v294.target)) {
              v295.push(v294);
            }
          }
          for (var v297 = 0; v297 < v295.length; v297++) {
            this.remove(v295[v297]);
          }
          return false;
        };
        v237.exports = v242;
      }, function (v298, v299, v300) {
        var v301 = v300(12);
        function v302() {}
        v302.calcSeparationAmount = function (v303, v304, v305, v306) {
          if (!v303.intersects(v304)) {
            throw "assert failed";
          }
          var v307 = new Array(2);
          this.decideDirectionsForOverlappingNodes(v303, v304, v307);
          v305[0] = Math.min(v303.getRight(), v304.getRight()) - Math.max(v303.x, v304.x);
          v305[1] = Math.min(v303.getBottom(), v304.getBottom()) - Math.max(v303.y, v304.y);
          if (v303.getX() <= v304.getX() && v303.getRight() >= v304.getRight()) {
            v305[0] += Math.min(v304.getX() - v303.getX(), v303.getRight() - v304.getRight());
          } else if (v304.getX() <= v303.getX() && v304.getRight() >= v303.getRight()) {
            v305[0] += Math.min(v303.getX() - v304.getX(), v304.getRight() - v303.getRight());
          }
          if (v303.getY() <= v304.getY() && v303.getBottom() >= v304.getBottom()) {
            v305[1] += Math.min(v304.getY() - v303.getY(), v303.getBottom() - v304.getBottom());
          } else if (v304.getY() <= v303.getY() && v304.getBottom() >= v303.getBottom()) {
            v305[1] += Math.min(v303.getY() - v304.getY(), v304.getBottom() - v303.getBottom());
          }
          var v308 = Math.abs((v304.getCenterY() - v303.getCenterY()) / (v304.getCenterX() - v303.getCenterX()));
          if (v304.getCenterY() === v303.getCenterY() && v304.getCenterX() === v303.getCenterX()) {
            v308 = 1;
          }
          var v309 = v308 * v305[0];
          var v310 = v305[1] / v308;
          if (v305[0] < v310) {
            v310 = v305[0];
          } else {
            v309 = v305[1];
          }
          v305[0] = v307[0] * -1 * (v310 / 2 + v306);
          v305[1] = v307[1] * -1 * (v309 / 2 + v306);
        };
        v302.decideDirectionsForOverlappingNodes = function (v311, v312, v313) {
          if (v311.getCenterX() < v312.getCenterX()) {
            v313[0] = -1;
          } else {
            v313[0] = 1;
          }
          if (v311.getCenterY() < v312.getCenterY()) {
            v313[1] = -1;
          } else {
            v313[1] = 1;
          }
        };
        v302.getIntersection2 = function (v314, v315, v316) {
          var v317 = v314.getCenterX();
          var v318 = v314.getCenterY();
          var v319 = v315.getCenterX();
          var v320 = v315.getCenterY();
          if (v314.intersects(v315)) {
            v316[0] = v317;
            v316[1] = v318;
            v316[2] = v319;
            v316[3] = v320;
            return true;
          }
          var v321 = v314.getX();
          var v322 = v314.getY();
          var v323 = v314.getRight();
          var v324 = v314.getX();
          var v325 = v314.getBottom();
          var v326 = v314.getRight();
          var v327 = v314.getWidthHalf();
          var v328 = v314.getHeightHalf();
          var v329 = v315.getX();
          var v330 = v315.getY();
          var v331 = v315.getRight();
          var v332 = v315.getX();
          var v333 = v315.getBottom();
          var v334 = v315.getRight();
          var v335 = v315.getWidthHalf();
          var v336 = v315.getHeightHalf();
          var v337 = false;
          var v338 = false;
          if (v317 === v319) {
            if (v318 > v320) {
              v316[0] = v317;
              v316[1] = v322;
              v316[2] = v319;
              v316[3] = v333;
              return false;
            } else if (v318 < v320) {
              v316[0] = v317;
              v316[1] = v325;
              v316[2] = v319;
              v316[3] = v330;
              return false;
            } else {
              ;
            }
          } else if (v318 === v320) {
            if (v317 > v319) {
              v316[0] = v321;
              v316[1] = v318;
              v316[2] = v331;
              v316[3] = v320;
              return false;
            } else if (v317 < v319) {
              v316[0] = v323;
              v316[1] = v318;
              v316[2] = v329;
              v316[3] = v320;
              return false;
            } else {
              ;
            }
          } else {
            var v339 = v314.height / v314.width;
            var v340 = v315.height / v315.width;
            var v341 = (v320 - v318) / (v319 - v317);
            var v342 = undefined;
            var v343 = undefined;
            var v344 = undefined;
            var v345 = undefined;
            var v346 = undefined;
            var v347 = undefined;
            if (-v339 === v341) {
              if (v317 > v319) {
                v316[0] = v324;
                v316[1] = v325;
                v337 = true;
              } else {
                v316[0] = v323;
                v316[1] = v322;
                v337 = true;
              }
            } else if (v339 === v341) {
              if (v317 > v319) {
                v316[0] = v321;
                v316[1] = v322;
                v337 = true;
              } else {
                v316[0] = v326;
                v316[1] = v325;
                v337 = true;
              }
            }
            if (-v340 === v341) {
              if (v319 > v317) {
                v316[2] = v332;
                v316[3] = v333;
                v338 = true;
              } else {
                v316[2] = v331;
                v316[3] = v330;
                v338 = true;
              }
            } else if (v340 === v341) {
              if (v319 > v317) {
                v316[2] = v329;
                v316[3] = v330;
                v338 = true;
              } else {
                v316[2] = v334;
                v316[3] = v333;
                v338 = true;
              }
            }
            if (v337 && v338) {
              return false;
            }
            if (v317 > v319) {
              if (v318 > v320) {
                v342 = this.getCardinalDirection(v339, v341, 4);
                v343 = this.getCardinalDirection(v340, v341, 2);
              } else {
                v342 = this.getCardinalDirection(-v339, v341, 3);
                v343 = this.getCardinalDirection(-v340, v341, 1);
              }
            } else if (v318 > v320) {
              v342 = this.getCardinalDirection(-v339, v341, 1);
              v343 = this.getCardinalDirection(-v340, v341, 3);
            } else {
              v342 = this.getCardinalDirection(v339, v341, 2);
              v343 = this.getCardinalDirection(v340, v341, 4);
            }
            if (!v337) {
              switch (v342) {
                case 1:
                  v345 = v322;
                  v344 = v317 + -v328 / v341;
                  v316[0] = v344;
                  v316[1] = v345;
                  break;
                case 2:
                  v344 = v326;
                  v345 = v318 + v327 * v341;
                  v316[0] = v344;
                  v316[1] = v345;
                  break;
                case 3:
                  v345 = v325;
                  v344 = v317 + v328 / v341;
                  v316[0] = v344;
                  v316[1] = v345;
                  break;
                case 4:
                  v344 = v324;
                  v345 = v318 + -v327 * v341;
                  v316[0] = v344;
                  v316[1] = v345;
                  break;
              }
            }
            if (!v338) {
              switch (v343) {
                case 1:
                  v347 = v330;
                  v346 = v319 + -v336 / v341;
                  v316[2] = v346;
                  v316[3] = v347;
                  break;
                case 2:
                  v346 = v334;
                  v347 = v320 + v335 * v341;
                  v316[2] = v346;
                  v316[3] = v347;
                  break;
                case 3:
                  v347 = v333;
                  v346 = v319 + v336 / v341;
                  v316[2] = v346;
                  v316[3] = v347;
                  break;
                case 4:
                  v346 = v332;
                  v347 = v320 + -v335 * v341;
                  v316[2] = v346;
                  v316[3] = v347;
                  break;
              }
            }
          }
          return false;
        };
        v302.getCardinalDirection = function (v348, v349, v350) {
          if (v348 > v349) {
            return v350;
          } else {
            return 1 + v350 % 4;
          }
        };
        v302.getIntersection = function (v351, v352, v353, v354) {
          if (v354 == null) {
            return this.getIntersection2(v351, v352, v353);
          }
          var v355 = v351.x;
          var v356 = v351.y;
          var v357 = v352.x;
          var v358 = v352.y;
          var v359 = v353.x;
          var v360 = v353.y;
          var v361 = v354.x;
          var v362 = v354.y;
          var v363 = undefined;
          var v364 = undefined;
          var v365 = undefined;
          var v366 = undefined;
          var v367 = undefined;
          var v368 = undefined;
          var v369 = undefined;
          var v370 = undefined;
          var v371 = undefined;
          v365 = v358 - v356;
          v367 = v355 - v357;
          v369 = v357 * v356 - v355 * v358;
          v366 = v362 - v360;
          v368 = v359 - v361;
          v370 = v361 * v360 - v359 * v362;
          v371 = v365 * v368 - v366 * v367;
          if (v371 === 0) {
            return null;
          }
          v363 = (v367 * v370 - v368 * v369) / v371;
          v364 = (v366 * v369 - v365 * v370) / v371;
          return new v301(v363, v364);
        };
        v302.angleOfVector = function (v372, v373, v374, v375) {
          var v376 = undefined;
          if (v372 !== v374) {
            v376 = Math.atan((v375 - v373) / (v374 - v372));
            if (v374 < v372) {
              v376 += Math.PI;
            } else if (v375 < v373) {
              v376 += this.TWO_PI;
            }
          } else if (v375 < v373) {
            v376 = this.ONE_AND_HALF_PI;
          } else {
            v376 = this.HALF_PI;
          }
          return v376;
        };
        v302.doIntersect = function (v377, v378, v379, v380) {
          var v381 = v377.x;
          var v382 = v377.y;
          var v383 = v378.x;
          var v384 = v378.y;
          var v385 = v379.x;
          var v386 = v379.y;
          var v387 = v380.x;
          var v388 = v380.y;
          var v389 = (v383 - v381) * (v388 - v386) - (v387 - v385) * (v384 - v382);
          if (v389 === 0) {
            return false;
          } else {
            var v390 = ((v388 - v386) * (v387 - v381) + (v385 - v387) * (v388 - v382)) / v389;
            var v391 = ((v382 - v384) * (v387 - v381) + (v383 - v381) * (v388 - v382)) / v389;
            return v390 > 0 && v390 < 1 && v391 > 0 && v391 < 1;
          }
        };
        v302.findCircleLineIntersections = function (v392, v393, v394, v395, v396, v397, v398) {
          var v399 = (v394 - v392) * (v394 - v392) + (v395 - v393) * (v395 - v393);
          var v400 = ((v392 - v396) * (v394 - v392) + (v393 - v397) * (v395 - v393)) * 2;
          var v401 = (v392 - v396) * (v392 - v396) + (v393 - v397) * (v393 - v397) - v398 * v398;
          var v402 = v400 * v400 - v399 * 4 * v401;
          if (v402 >= 0) {
            var v403 = (-v400 + Math.sqrt(v400 * v400 - v399 * 4 * v401)) / (v399 * 2);
            var v404 = (-v400 - Math.sqrt(v400 * v400 - v399 * 4 * v401)) / (v399 * 2);
            var v405 = null;
            if (v403 >= 0 && v403 <= 1) {
              return [v403];
            }
            if (v404 >= 0 && v404 <= 1) {
              return [v404];
            }
            return v405;
          } else {
            return null;
          }
        };
        v302.HALF_PI = Math.PI * 0.5;
        v302.ONE_AND_HALF_PI = Math.PI * 1.5;
        v302.TWO_PI = Math.PI * 2;
        v302.THREE_PI = Math.PI * 3;
        v298.exports = v302;
      }, function (v406, v407, v408) {
        function v409() {}
        v409.sign = function (v410) {
          if (v410 > 0) {
            return 1;
          } else if (v410 < 0) {
            return -1;
          } else {
            return 0;
          }
        };
        v409.floor = function (v411) {
          if (v411 < 0) {
            return Math.ceil(v411);
          } else {
            return Math.floor(v411);
          }
        };
        v409.ceil = function (v412) {
          if (v412 < 0) {
            return Math.floor(v412);
          } else {
            return Math.ceil(v412);
          }
        };
        v406.exports = v409;
      }, function (v413, v414, v415) {
        function v416() {}
        v416.MAX_VALUE = 2147483647;
        v416.MIN_VALUE = -2147483648;
        v413.exports = v416;
      }, function (v417, v418, v419) {
        var v420 = function () {
          function v421(v422, v423) {
            for (var v424 = 0; v424 < v423.length; v424++) {
              var v425 = v423[v424];
              v425.enumerable = v425.enumerable || false;
              v425.configurable = true;
              if ("value" in v425) {
                v425.writable = true;
              }
              Object.defineProperty(v422, v425.key, v425);
            }
          }
          return function (v426, v427, v428) {
            if (v427) {
              v421(v426.prototype, v427);
            }
            if (v428) {
              v421(v426, v428);
            }
            return v426;
          };
        }();
        function v429(v430, v431) {
          if (!(v430 instanceof v431)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var v432 = function v433(v434) {
          return {
            value: v434,
            next: null,
            prev: null
          };
        };
        var v435 = function v436(v437, v438, v439, v440) {
          if (v437 !== null) {
            v437.next = v438;
          } else {
            v440.head = v438;
          }
          if (v439 !== null) {
            v439.prev = v438;
          } else {
            v440.tail = v438;
          }
          v438.prev = v437;
          v438.next = v439;
          v440.length++;
          return v438;
        };
        var v441 = function v442(v443, v444) {
          var v445 = v443.prev;
          var v446 = v443.next;
          if (v445 !== null) {
            v445.next = v446;
          } else {
            v444.head = v446;
          }
          if (v446 !== null) {
            v446.prev = v445;
          } else {
            v444.tail = v445;
          }
          v443.prev = v443.next = null;
          v444.length--;
          return v443;
        };
        var v447 = function () {
          function v448(v449) {
            var v450 = this;
            v429(this, v448);
            this.length = 0;
            this.head = null;
            this.tail = null;
            if (v449 != null) {
              v449.forEach(function (v451) {
                return v450.push(v451);
              });
            }
          }
          v420(v448, [{
            key: "size",
            value: function v452() {
              return this.length;
            }
          }, {
            key: "insertBefore",
            value: function v453(v454, v455) {
              return v435(v455.prev, v432(v454), v455, this);
            }
          }, {
            key: "insertAfter",
            value: function v456(v457, v458) {
              return v435(v458, v432(v457), v458.next, this);
            }
          }, {
            key: "insertNodeBefore",
            value: function v459(v460, v461) {
              return v435(v461.prev, v460, v461, this);
            }
          }, {
            key: "insertNodeAfter",
            value: function v462(v463, v464) {
              return v435(v464, v463, v464.next, this);
            }
          }, {
            key: "push",
            value: function v465(v466) {
              return v435(this.tail, v432(v466), null, this);
            }
          }, {
            key: "unshift",
            value: function v467(v468) {
              return v435(null, v432(v468), this.head, this);
            }
          }, {
            key: "remove",
            value: function v469(v470) {
              return v441(v470, this);
            }
          }, {
            key: "pop",
            value: function v471() {
              return v441(this.tail, this).value;
            }
          }, {
            key: "popNode",
            value: function v472() {
              return v441(this.tail, this);
            }
          }, {
            key: "shift",
            value: function v473() {
              return v441(this.head, this).value;
            }
          }, {
            key: "shiftNode",
            value: function v474() {
              return v441(this.head, this);
            }
          }, {
            key: "get_object_at",
            value: function v475(v476) {
              if (v476 <= this.length()) {
                var v477 = 1;
                var v478 = this.head;
                while (v477 < v476) {
                  v478 = v478.next;
                  v477++;
                }
                return v478.value;
              }
            }
          }, {
            key: "set_object_at",
            value: function v479(v480, v481) {
              if (v480 <= this.length()) {
                var v482 = 1;
                var v483 = this.head;
                while (v482 < v480) {
                  v483 = v483.next;
                  v482++;
                }
                v483.value = v481;
              }
            }
          }]);
          return v448;
        }();
        v417.exports = v447;
      }, function (v484, v485, v486) {
        function v487(v488, v489, v490) {
          this.x = null;
          this.y = null;
          if (v488 == null && v489 == null && v490 == null) {
            this.x = 0;
            this.y = 0;
          } else if (typeof v488 == "number" && typeof v489 == "number" && v490 == null) {
            this.x = v488;
            this.y = v489;
          } else if (v488.constructor.name == "Point" && v489 == null && v490 == null) {
            v490 = v488;
            this.x = v490.x;
            this.y = v490.y;
          }
        }
        v487.prototype.getX = function () {
          return this.x;
        };
        v487.prototype.getY = function () {
          return this.y;
        };
        v487.prototype.getLocation = function () {
          return new v487(this.x, this.y);
        };
        v487.prototype.setLocation = function (v491, v492, v493) {
          if (v491.constructor.name == "Point" && v492 == null && v493 == null) {
            v493 = v491;
            this.setLocation(v493.x, v493.y);
          } else if (typeof v491 == "number" && typeof v492 == "number" && v493 == null) {
            if (parseInt(v491) == v491 && parseInt(v492) == v492) {
              this.move(v491, v492);
            } else {
              this.x = Math.floor(v491 + 0.5);
              this.y = Math.floor(v492 + 0.5);
            }
          }
        };
        v487.prototype.move = function (v494, v495) {
          this.x = v494;
          this.y = v495;
        };
        v487.prototype.translate = function (v496, v497) {
          this.x += v496;
          this.y += v497;
        };
        v487.prototype.equals = function (v498) {
          if (v498.constructor.name == "Point") {
            var v499 = v498;
            return this.x == v499.x && this.y == v499.y;
          }
          return this == v498;
        };
        v487.prototype.toString = function () {
          return new v487().constructor.name + "[x=" + this.x + ",y=" + this.y + "]";
        };
        v484.exports = v487;
      }, function (v500, v501, v502) {
        function v503(v504, v505, v506, v507) {
          this.x = 0;
          this.y = 0;
          this.width = 0;
          this.height = 0;
          if (v504 != null && v505 != null && v506 != null && v507 != null) {
            this.x = v504;
            this.y = v505;
            this.width = v506;
            this.height = v507;
          }
        }
        v503.prototype.getX = function () {
          return this.x;
        };
        v503.prototype.setX = function (v508) {
          this.x = v508;
        };
        v503.prototype.getY = function () {
          return this.y;
        };
        v503.prototype.setY = function (v509) {
          this.y = v509;
        };
        v503.prototype.getWidth = function () {
          return this.width;
        };
        v503.prototype.setWidth = function (v510) {
          this.width = v510;
        };
        v503.prototype.getHeight = function () {
          return this.height;
        };
        v503.prototype.setHeight = function (v511) {
          this.height = v511;
        };
        v503.prototype.getRight = function () {
          return this.x + this.width;
        };
        v503.prototype.getBottom = function () {
          return this.y + this.height;
        };
        v503.prototype.intersects = function (v512) {
          if (this.getRight() < v512.x) {
            return false;
          }
          if (this.getBottom() < v512.y) {
            return false;
          }
          if (v512.getRight() < this.x) {
            return false;
          }
          if (v512.getBottom() < this.y) {
            return false;
          }
          return true;
        };
        v503.prototype.getCenterX = function () {
          return this.x + this.width / 2;
        };
        v503.prototype.getMinX = function () {
          return this.getX();
        };
        v503.prototype.getMaxX = function () {
          return this.getX() + this.width;
        };
        v503.prototype.getCenterY = function () {
          return this.y + this.height / 2;
        };
        v503.prototype.getMinY = function () {
          return this.getY();
        };
        v503.prototype.getMaxY = function () {
          return this.getY() + this.height;
        };
        v503.prototype.getWidthHalf = function () {
          return this.width / 2;
        };
        v503.prototype.getHeightHalf = function () {
          return this.height / 2;
        };
        v500.exports = v503;
      }, function (v513, v514, v515) {
        var v516 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (v517) {
          return typeof v517;
        } : function (v518) {
          if (v518 && typeof Symbol === "function" && v518.constructor === Symbol && v518 !== Symbol.prototype) {
            return "symbol";
          } else {
            return typeof v518;
          }
        };
        function v519() {}
        v519.lastID = 0;
        v519.createID = function (v520) {
          if (v519.isPrimitive(v520)) {
            return v520;
          }
          if (v520.uniqueID != null) {
            return v520.uniqueID;
          }
          v520.uniqueID = v519.getString();
          v519.lastID++;
          return v520.uniqueID;
        };
        v519.getString = function (v521) {
          if (v521 == null) {
            v521 = v519.lastID;
          }
          return "Object#" + v521;
        };
        v519.isPrimitive = function (v522) {
          var v523 = typeof v522 === "undefined" ? "undefined" : v516(v522);
          return v522 == null || v523 != "object" && v523 != "function";
        };
        v513.exports = v519;
      }, function (v524, v525, v526) {
        function v527(v528) {
          if (Array.isArray(v528)) {
            for (var v529 = 0, v530 = Array(v528.length); v529 < v528.length; v529++) {
              v530[v529] = v528[v529];
            }
            return v530;
          } else {
            return Array.from(v528);
          }
        }
        var v531 = v526(0);
        var v532 = v526(7);
        var v533 = v526(3);
        var v534 = v526(1);
        var v535 = v526(6);
        var v536 = v526(5);
        var v537 = v526(17);
        var v538 = v526(29);
        function v539(v540) {
          v538.call(this);
          this.layoutQuality = v531.QUALITY;
          this.createBendsAsNeeded = v531.DEFAULT_CREATE_BENDS_AS_NEEDED;
          this.incremental = v531.DEFAULT_INCREMENTAL;
          this.animationOnLayout = v531.DEFAULT_ANIMATION_ON_LAYOUT;
          this.animationDuringLayout = v531.DEFAULT_ANIMATION_DURING_LAYOUT;
          this.animationPeriod = v531.DEFAULT_ANIMATION_PERIOD;
          this.uniformLeafNodeSizes = v531.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
          this.edgeToDummyNodes = new Map();
          this.graphManager = new v532(this);
          this.isLayoutFinished = false;
          this.isSubLayout = false;
          this.isRemoteUse = false;
          if (v540 != null) {
            this.isRemoteUse = v540;
          }
        }
        v539.RANDOM_SEED = 1;
        v539.prototype = Object.create(v538.prototype);
        v539.prototype.getGraphManager = function () {
          return this.graphManager;
        };
        v539.prototype.getAllNodes = function () {
          return this.graphManager.getAllNodes();
        };
        v539.prototype.getAllEdges = function () {
          return this.graphManager.getAllEdges();
        };
        v539.prototype.getAllNodesToApplyGravitation = function () {
          return this.graphManager.getAllNodesToApplyGravitation();
        };
        v539.prototype.newGraphManager = function () {
          var v541 = new v532(this);
          this.graphManager = v541;
          return v541;
        };
        v539.prototype.newGraph = function (v542) {
          return new v535(null, this.graphManager, v542);
        };
        v539.prototype.newNode = function (v543) {
          return new v533(this.graphManager, v543);
        };
        v539.prototype.newEdge = function (v544) {
          return new v534(null, null, v544);
        };
        v539.prototype.checkLayoutSuccess = function () {
          return this.graphManager.getRoot() == null || this.graphManager.getRoot().getNodes().length == 0 || this.graphManager.includesInvalidEdge();
        };
        v539.prototype.runLayout = function () {
          this.isLayoutFinished = false;
          if (this.tilingPreLayout) {
            this.tilingPreLayout();
          }
          this.initParameters();
          var v545;
          if (this.checkLayoutSuccess()) {
            v545 = false;
          } else {
            v545 = this.layout();
          }
          if (v531.ANIMATE === "during") {
            return false;
          }
          if (v545) {
            if (!this.isSubLayout) {
              this.doPostLayout();
            }
          }
          if (this.tilingPostLayout) {
            this.tilingPostLayout();
          }
          this.isLayoutFinished = true;
          return v545;
        };
        v539.prototype.doPostLayout = function () {
          if (!this.incremental) {
            this.transform();
          }
          this.update();
        };
        v539.prototype.update2 = function () {
          if (this.createBendsAsNeeded) {
            this.createBendpointsFromDummyNodes();
            this.graphManager.resetAllEdges();
          }
          if (!this.isRemoteUse) {
            var v546 = this.graphManager.getAllEdges();
            for (var v547 = 0; v547 < v546.length; v547++) {
              v546[v547];
            }
            var v548 = this.graphManager.getRoot().getNodes();
            for (var v547 = 0; v547 < v548.length; v547++) {
              v548[v547];
            }
            this.update(this.graphManager.getRoot());
          }
        };
        v539.prototype.update = function (v549) {
          if (v549 == null) {
            this.update2();
          } else if (v549 instanceof v533) {
            var v550 = v549;
            if (v550.getChild() != null) {
              var v551 = v550.getChild().getNodes();
              for (var v552 = 0; v552 < v551.length; v552++) {
                update(v551[v552]);
              }
            }
            if (v550.vGraphObject != null) {
              var v553 = v550.vGraphObject;
              v553.update(v550);
            }
          } else if (v549 instanceof v534) {
            var v554 = v549;
            if (v554.vGraphObject != null) {
              var v555 = v554.vGraphObject;
              v555.update(v554);
            }
          } else if (v549 instanceof v535) {
            var v556 = v549;
            if (v556.vGraphObject != null) {
              var v557 = v556.vGraphObject;
              v557.update(v556);
            }
          }
        };
        v539.prototype.initParameters = function () {
          if (!this.isSubLayout) {
            this.layoutQuality = v531.QUALITY;
            this.animationDuringLayout = v531.DEFAULT_ANIMATION_DURING_LAYOUT;
            this.animationPeriod = v531.DEFAULT_ANIMATION_PERIOD;
            this.animationOnLayout = v531.DEFAULT_ANIMATION_ON_LAYOUT;
            this.incremental = v531.DEFAULT_INCREMENTAL;
            this.createBendsAsNeeded = v531.DEFAULT_CREATE_BENDS_AS_NEEDED;
            this.uniformLeafNodeSizes = v531.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
          }
          if (this.animationDuringLayout) {
            this.animationOnLayout = false;
          }
        };
        v539.prototype.transform = function (v558) {
          if (v558 == undefined) {
            this.transform(new v536(0, 0));
          } else {
            var v559 = new v537();
            var v560 = this.graphManager.getRoot().updateLeftTop();
            if (v560 != null) {
              v559.setWorldOrgX(v558.x);
              v559.setWorldOrgY(v558.y);
              v559.setDeviceOrgX(v560.x);
              v559.setDeviceOrgY(v560.y);
              var v561 = this.getAllNodes();
              var v562;
              for (var v563 = 0; v563 < v561.length; v563++) {
                v562 = v561[v563];
                v562.transform(v559);
              }
            }
          }
        };
        v539.prototype.positionNodesRandomly = function (v564) {
          if (v564 == undefined) {
            this.positionNodesRandomly(this.getGraphManager().getRoot());
            this.getGraphManager().getRoot().updateBounds(true);
          } else {
            var v565;
            var v566;
            var v567 = v564.getNodes();
            for (var v568 = 0; v568 < v567.length; v568++) {
              v565 = v567[v568];
              v566 = v565.getChild();
              if (v566 == null) {
                v565.scatter();
              } else if (v566.getNodes().length == 0) {
                v565.scatter();
              } else {
                this.positionNodesRandomly(v566);
                v565.updateBounds();
              }
            }
          }
        };
        v539.prototype.getFlatForest = function () {
          var v569 = [];
          var v570 = true;
          var v571 = this.graphManager.getRoot().getNodes();
          var v572 = true;
          for (var v573 = 0; v573 < v571.length; v573++) {
            if (v571[v573].getChild() != null) {
              v572 = false;
            }
          }
          if (!v572) {
            return v569;
          }
          var v574 = new Set();
          var v575 = [];
          var v576 = new Map();
          var v577 = [];
          v577 = v577.concat(v571);
          while (v577.length > 0 && v570) {
            v575.push(v577[0]);
            while (v575.length > 0 && v570) {
              var v578 = v575[0];
              v575.splice(0, 1);
              v574.add(v578);
              var v579 = v578.getEdges();
              for (var v573 = 0; v573 < v579.length; v573++) {
                var v580 = v579[v573].getOtherEnd(v578);
                if (v576.get(v578) != v580) {
                  if (!v574.has(v580)) {
                    v575.push(v580);
                    v576.set(v580, v578);
                  } else {
                    v570 = false;
                    break;
                  }
                }
              }
            }
            if (!v570) {
              v569 = [];
            } else {
              var v581 = [].concat(v527(v574));
              v569.push(v581);
              for (var v573 = 0; v573 < v581.length; v573++) {
                var v582 = v581[v573];
                var v583 = v577.indexOf(v582);
                if (v583 > -1) {
                  v577.splice(v583, 1);
                }
              }
              v574 = new Set();
              v576 = new Map();
            }
          }
          return v569;
        };
        v539.prototype.createDummyNodesForBendpoints = function (v584) {
          var v585 = [];
          var v586 = v584.source;
          var v587 = this.graphManager.calcLowestCommonAncestor(v584.source, v584.target);
          for (var v588 = 0; v588 < v584.bendpoints.length; v588++) {
            var v589 = this.newNode(null);
            v589.setRect(new Point(0, 0), new Dimension(1, 1));
            v587.add(v589);
            var v590 = this.newEdge(null);
            this.graphManager.add(v590, v586, v589);
            v585.add(v589);
            v586 = v589;
          }
          var v590 = this.newEdge(null);
          this.graphManager.add(v590, v586, v584.target);
          this.edgeToDummyNodes.set(v584, v585);
          if (v584.isInterGraph()) {
            this.graphManager.remove(v584);
          } else {
            v587.remove(v584);
          }
          return v585;
        };
        v539.prototype.createBendpointsFromDummyNodes = function () {
          var v591 = [];
          v591 = v591.concat(this.graphManager.getAllEdges());
          v591 = [].concat(v527(this.edgeToDummyNodes.keys())).concat(v591);
          for (var v592 = 0; v592 < v591.length; v592++) {
            var v593 = v591[v592];
            if (v593.bendpoints.length > 0) {
              var v594 = this.edgeToDummyNodes.get(v593);
              for (var v595 = 0; v595 < v594.length; v595++) {
                var v596 = v594[v595];
                var v597 = new v536(v596.getCenterX(), v596.getCenterY());
                var v598 = v593.bendpoints.get(v595);
                v598.x = v597.x;
                v598.y = v597.y;
                v596.getOwner().remove(v596);
              }
              this.graphManager.add(v593, v593.source, v593.target);
            }
          }
        };
        v539.transform = function (v599, v600, v601, v602) {
          if (v601 != undefined && v602 != undefined) {
            var v603 = v600;
            if (v599 <= 50) {
              var v604 = v600 / v601;
              v603 -= (v600 - v604) / 50 * (50 - v599);
            } else {
              var v605 = v600 * v602;
              v603 += (v605 - v600) / 50 * (v599 - 50);
            }
            return v603;
          } else {
            var v606;
            var v607;
            if (v599 <= 50) {
              v606 = v600 * 9 / 500;
              v607 = v600 / 10;
            } else {
              v606 = v600 * 9 / 50;
              v607 = v600 * -8;
            }
            return v606 * v599 + v607;
          }
        };
        v539.findCenterOfTree = function (v608) {
          var v609 = [];
          v609 = v609.concat(v608);
          var v610 = [];
          var v611 = new Map();
          var v612 = false;
          var v613 = null;
          if (v609.length == 1 || v609.length == 2) {
            v612 = true;
            v613 = v609[0];
          }
          for (var v614 = 0; v614 < v609.length; v614++) {
            var v615 = v609[v614];
            var v616 = v615.getNeighborsList().size;
            v611.set(v615, v615.getNeighborsList().size);
            if (v616 == 1) {
              v610.push(v615);
            }
          }
          var v617 = [];
          v617 = v617.concat(v610);
          while (!v612) {
            var v618 = [];
            v618 = v618.concat(v617);
            v617 = [];
            for (var v614 = 0; v614 < v609.length; v614++) {
              var v615 = v609[v614];
              var v619 = v609.indexOf(v615);
              if (v619 >= 0) {
                v609.splice(v619, 1);
              }
              var v620 = v615.getNeighborsList();
              v620.forEach(function (v621) {
                if (v610.indexOf(v621) < 0) {
                  var v622 = v611.get(v621);
                  var v623 = v622 - 1;
                  if (v623 == 1) {
                    v617.push(v621);
                  }
                  v611.set(v621, v623);
                }
              });
            }
            v610 = v610.concat(v617);
            if (v609.length == 1 || v609.length == 2) {
              v612 = true;
              v613 = v609[0];
            }
          }
          return v613;
        };
        v539.prototype.setGraphManager = function (v624) {
          this.graphManager = v624;
        };
        v524.exports = v539;
      }, function (v625, v626, v627) {
        function v628() {}
        v628.seed = 1;
        v628.x = 0;
        v628.nextDouble = function () {
          v628.x = Math.sin(v628.seed++) * 10000;
          return v628.x - Math.floor(v628.x);
        };
        v625.exports = v628;
      }, function (v629, v630, v631) {
        var v632 = v631(5);
        function v633(v634, v635) {
          this.lworldOrgX = 0;
          this.lworldOrgY = 0;
          this.ldeviceOrgX = 0;
          this.ldeviceOrgY = 0;
          this.lworldExtX = 1;
          this.lworldExtY = 1;
          this.ldeviceExtX = 1;
          this.ldeviceExtY = 1;
        }
        v633.prototype.getWorldOrgX = function () {
          return this.lworldOrgX;
        };
        v633.prototype.setWorldOrgX = function (v636) {
          this.lworldOrgX = v636;
        };
        v633.prototype.getWorldOrgY = function () {
          return this.lworldOrgY;
        };
        v633.prototype.setWorldOrgY = function (v637) {
          this.lworldOrgY = v637;
        };
        v633.prototype.getWorldExtX = function () {
          return this.lworldExtX;
        };
        v633.prototype.setWorldExtX = function (v638) {
          this.lworldExtX = v638;
        };
        v633.prototype.getWorldExtY = function () {
          return this.lworldExtY;
        };
        v633.prototype.setWorldExtY = function (v639) {
          this.lworldExtY = v639;
        };
        v633.prototype.getDeviceOrgX = function () {
          return this.ldeviceOrgX;
        };
        v633.prototype.setDeviceOrgX = function (v640) {
          this.ldeviceOrgX = v640;
        };
        v633.prototype.getDeviceOrgY = function () {
          return this.ldeviceOrgY;
        };
        v633.prototype.setDeviceOrgY = function (v641) {
          this.ldeviceOrgY = v641;
        };
        v633.prototype.getDeviceExtX = function () {
          return this.ldeviceExtX;
        };
        v633.prototype.setDeviceExtX = function (v642) {
          this.ldeviceExtX = v642;
        };
        v633.prototype.getDeviceExtY = function () {
          return this.ldeviceExtY;
        };
        v633.prototype.setDeviceExtY = function (v643) {
          this.ldeviceExtY = v643;
        };
        v633.prototype.transformX = function (v644) {
          var v645 = 0;
          var v646 = this.lworldExtX;
          if (v646 != 0) {
            v645 = this.ldeviceOrgX + (v644 - this.lworldOrgX) * this.ldeviceExtX / v646;
          }
          return v645;
        };
        v633.prototype.transformY = function (v647) {
          var v648 = 0;
          var v649 = this.lworldExtY;
          if (v649 != 0) {
            v648 = this.ldeviceOrgY + (v647 - this.lworldOrgY) * this.ldeviceExtY / v649;
          }
          return v648;
        };
        v633.prototype.inverseTransformX = function (v650) {
          var v651 = 0;
          var v652 = this.ldeviceExtX;
          if (v652 != 0) {
            v651 = this.lworldOrgX + (v650 - this.ldeviceOrgX) * this.lworldExtX / v652;
          }
          return v651;
        };
        v633.prototype.inverseTransformY = function (v653) {
          var v654 = 0;
          var v655 = this.ldeviceExtY;
          if (v655 != 0) {
            v654 = this.lworldOrgY + (v653 - this.ldeviceOrgY) * this.lworldExtY / v655;
          }
          return v654;
        };
        v633.prototype.inverseTransformPoint = function (v656) {
          var v657 = new v632(this.inverseTransformX(v656.x), this.inverseTransformY(v656.y));
          return v657;
        };
        v629.exports = v633;
      }, function (v658, v659, v660) {
        function v661(v662) {
          if (Array.isArray(v662)) {
            for (var v663 = 0, v664 = Array(v662.length); v663 < v662.length; v663++) {
              v664[v663] = v662[v663];
            }
            return v664;
          } else {
            return Array.from(v662);
          }
        }
        var v665 = v660(15);
        var v666 = v660(4);
        var v667 = v660(0);
        var v668 = v660(8);
        var v669 = v660(9);
        function v670() {
          v665.call(this);
          this.useSmartIdealEdgeLengthCalculation = v666.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
          this.gravityConstant = v666.DEFAULT_GRAVITY_STRENGTH;
          this.compoundGravityConstant = v666.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
          this.gravityRangeFactor = v666.DEFAULT_GRAVITY_RANGE_FACTOR;
          this.compoundGravityRangeFactor = v666.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
          this.displacementThresholdPerNode = v666.DEFAULT_EDGE_LENGTH * 3 / 100;
          this.coolingFactor = v666.DEFAULT_COOLING_FACTOR_INCREMENTAL;
          this.initialCoolingFactor = v666.DEFAULT_COOLING_FACTOR_INCREMENTAL;
          this.totalDisplacement = 0;
          this.oldTotalDisplacement = 0;
          this.maxIterations = v666.MAX_ITERATIONS;
        }
        v670.prototype = Object.create(v665.prototype);
        for (var v671 in v665) {
          v670[v671] = v665[v671];
        }
        v670.prototype.initParameters = function () {
          v665.prototype.initParameters.call(this, arguments);
          this.totalIterations = 0;
          this.notAnimatedIterations = 0;
          this.useFRGridVariant = v666.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION;
          this.grid = [];
        };
        v670.prototype.calcIdealEdgeLengths = function () {
          var v672;
          var v673;
          var v674;
          var v675;
          var v676;
          var v677;
          var v678;
          var v679 = this.getGraphManager().getAllEdges();
          for (var v680 = 0; v680 < v679.length; v680++) {
            v672 = v679[v680];
            v673 = v672.idealLength;
            if (v672.isInterGraph) {
              v675 = v672.getSource();
              v676 = v672.getTarget();
              v677 = v672.getSourceInLca().getEstimatedSize();
              v678 = v672.getTargetInLca().getEstimatedSize();
              if (this.useSmartIdealEdgeLengthCalculation) {
                v672.idealLength += v677 + v678 - v667.SIMPLE_NODE_SIZE * 2;
              }
              v674 = v672.getLca().getInclusionTreeDepth();
              v672.idealLength += v673 * v666.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR * (v675.getInclusionTreeDepth() + v676.getInclusionTreeDepth() - v674 * 2);
            }
          }
        };
        v670.prototype.initSpringEmbedder = function () {
          var v681 = this.getAllNodes().length;
          if (this.incremental) {
            if (v681 > v666.ADAPTATION_LOWER_NODE_LIMIT) {
              this.coolingFactor = Math.max(this.coolingFactor * v666.COOLING_ADAPTATION_FACTOR, this.coolingFactor - (v681 - v666.ADAPTATION_LOWER_NODE_LIMIT) / (v666.ADAPTATION_UPPER_NODE_LIMIT - v666.ADAPTATION_LOWER_NODE_LIMIT) * this.coolingFactor * (1 - v666.COOLING_ADAPTATION_FACTOR));
            }
            this.maxNodeDisplacement = v666.MAX_NODE_DISPLACEMENT_INCREMENTAL;
          } else {
            if (v681 > v666.ADAPTATION_LOWER_NODE_LIMIT) {
              this.coolingFactor = Math.max(v666.COOLING_ADAPTATION_FACTOR, 1 - (v681 - v666.ADAPTATION_LOWER_NODE_LIMIT) / (v666.ADAPTATION_UPPER_NODE_LIMIT - v666.ADAPTATION_LOWER_NODE_LIMIT) * (1 - v666.COOLING_ADAPTATION_FACTOR));
            } else {
              this.coolingFactor = 1;
            }
            this.initialCoolingFactor = this.coolingFactor;
            this.maxNodeDisplacement = v666.MAX_NODE_DISPLACEMENT;
          }
          this.maxIterations = Math.max(this.getAllNodes().length * 5, this.maxIterations);
          this.displacementThresholdPerNode = v666.DEFAULT_EDGE_LENGTH * 3 / 100;
          this.totalDisplacementThreshold = this.displacementThresholdPerNode * this.getAllNodes().length;
          this.repulsionRange = this.calcRepulsionRange();
        };
        v670.prototype.calcSpringForces = function () {
          var v682 = this.getAllEdges();
          var v683;
          for (var v684 = 0; v684 < v682.length; v684++) {
            v683 = v682[v684];
            this.calcSpringForce(v683, v683.idealLength);
          }
        };
        v670.prototype.calcRepulsionForces = function (v685 = true, v686 = false) {
          var v687;
          var v688;
          var v689;
          var v690;
          var v691 = this.getAllNodes();
          var v692;
          if (this.useFRGridVariant) {
            if (this.totalIterations % v666.GRID_CALCULATION_CHECK_PERIOD == 1 && v685) {
              this.updateGrid();
            }
            v692 = new Set();
            for (v687 = 0; v687 < v691.length; v687++) {
              v689 = v691[v687];
              this.calculateRepulsionForceOfANode(v689, v692, v685, v686);
              v692.add(v689);
            }
          } else {
            for (v687 = 0; v687 < v691.length; v687++) {
              v689 = v691[v687];
              for (v688 = v687 + 1; v688 < v691.length; v688++) {
                v690 = v691[v688];
                if (v689.getOwner() != v690.getOwner()) {
                  continue;
                }
                this.calcRepulsionForce(v689, v690);
              }
            }
          }
        };
        v670.prototype.calcGravitationalForces = function () {
          var v693;
          var v694 = this.getAllNodesToApplyGravitation();
          for (var v695 = 0; v695 < v694.length; v695++) {
            v693 = v694[v695];
            this.calcGravitationalForce(v693);
          }
        };
        v670.prototype.moveNodes = function () {
          var v696 = this.getAllNodes();
          var v697;
          for (var v698 = 0; v698 < v696.length; v698++) {
            v697 = v696[v698];
            v697.move();
          }
        };
        v670.prototype.calcSpringForce = function (v699, v700) {
          var v701 = v699.getSource();
          var v702 = v699.getTarget();
          var v703;
          var v704;
          var v705;
          var v706;
          if (this.uniformLeafNodeSizes && v701.getChild() == null && v702.getChild() == null) {
            v699.updateLengthSimple();
          } else {
            v699.updateLength();
            if (v699.isOverlapingSourceAndTarget) {
              return;
            }
          }
          v703 = v699.getLength();
          if (v703 == 0) {
            return;
          }
          v704 = v699.edgeElasticity * (v703 - v700);
          v705 = v704 * (v699.lengthX / v703);
          v706 = v704 * (v699.lengthY / v703);
          v701.springForceX += v705;
          v701.springForceY += v706;
          v702.springForceX -= v705;
          v702.springForceY -= v706;
        };
        v670.prototype.calcRepulsionForce = function (v707, v708) {
          var v709 = v707.getRect();
          var v710 = v708.getRect();
          var v711 = new Array(2);
          var v712 = new Array(4);
          var v713;
          var v714;
          var v715;
          var v716;
          var v717;
          var v718;
          var v719;
          if (v709.intersects(v710)) {
            v668.calcSeparationAmount(v709, v710, v711, v666.DEFAULT_EDGE_LENGTH / 2);
            v718 = v711[0] * 2;
            v719 = v711[1] * 2;
            var v720 = v707.noOfChildren * v708.noOfChildren / (v707.noOfChildren + v708.noOfChildren);
            v707.repulsionForceX -= v720 * v718;
            v707.repulsionForceY -= v720 * v719;
            v708.repulsionForceX += v720 * v718;
            v708.repulsionForceY += v720 * v719;
          } else {
            if (this.uniformLeafNodeSizes && v707.getChild() == null && v708.getChild() == null) {
              v713 = v710.getCenterX() - v709.getCenterX();
              v714 = v710.getCenterY() - v709.getCenterY();
            } else {
              v668.getIntersection(v709, v710, v712);
              v713 = v712[2] - v712[0];
              v714 = v712[3] - v712[1];
            }
            if (Math.abs(v713) < v666.MIN_REPULSION_DIST) {
              v713 = v669.sign(v713) * v666.MIN_REPULSION_DIST;
            }
            if (Math.abs(v714) < v666.MIN_REPULSION_DIST) {
              v714 = v669.sign(v714) * v666.MIN_REPULSION_DIST;
            }
            v715 = v713 * v713 + v714 * v714;
            v716 = Math.sqrt(v715);
            v717 = (v707.nodeRepulsion / 2 + v708.nodeRepulsion / 2) * v707.noOfChildren * v708.noOfChildren / v715;
            v718 = v717 * v713 / v716;
            v719 = v717 * v714 / v716;
            v707.repulsionForceX -= v718;
            v707.repulsionForceY -= v719;
            v708.repulsionForceX += v718;
            v708.repulsionForceY += v719;
          }
        };
        v670.prototype.calcGravitationalForce = function (v721) {
          var v722;
          var v723;
          var v724;
          var v725;
          var v726;
          var v727;
          var v728;
          var v729;
          v722 = v721.getOwner();
          v723 = (v722.getRight() + v722.getLeft()) / 2;
          v724 = (v722.getTop() + v722.getBottom()) / 2;
          v725 = v721.getCenterX() - v723;
          v726 = v721.getCenterY() - v724;
          v727 = Math.abs(v725) + v721.getWidth() / 2;
          v728 = Math.abs(v726) + v721.getHeight() / 2;
          if (v721.getOwner() == this.graphManager.getRoot()) {
            v729 = v722.getEstimatedSize() * this.gravityRangeFactor;
            if (v727 > v729 || v728 > v729) {
              v721.gravitationForceX = -this.gravityConstant * v725;
              v721.gravitationForceY = -this.gravityConstant * v726;
            }
          } else {
            v729 = v722.getEstimatedSize() * this.compoundGravityRangeFactor;
            if (v727 > v729 || v728 > v729) {
              v721.gravitationForceX = -this.gravityConstant * v725 * this.compoundGravityConstant;
              v721.gravitationForceY = -this.gravityConstant * v726 * this.compoundGravityConstant;
            }
          }
        };
        v670.prototype.isConverged = function () {
          var v730;
          var v731 = false;
          if (this.totalIterations > this.maxIterations / 3) {
            v731 = Math.abs(this.totalDisplacement - this.oldTotalDisplacement) < 2;
          }
          v730 = this.totalDisplacement < this.totalDisplacementThreshold;
          this.oldTotalDisplacement = this.totalDisplacement;
          return v730 || v731;
        };
        v670.prototype.animate = function () {
          if (this.animationDuringLayout && !this.isSubLayout) {
            if (this.notAnimatedIterations == this.animationPeriod) {
              this.update();
              this.notAnimatedIterations = 0;
            } else {
              this.notAnimatedIterations++;
            }
          }
        };
        v670.prototype.calcNoOfChildrenForAllNodes = function () {
          var v732;
          var v733 = this.graphManager.getAllNodes();
          for (var v734 = 0; v734 < v733.length; v734++) {
            v732 = v733[v734];
            v732.noOfChildren = v732.getNoOfChildren();
          }
        };
        v670.prototype.calcGrid = function (v735) {
          var v736 = 0;
          var v737 = 0;
          v736 = parseInt(Math.ceil((v735.getRight() - v735.getLeft()) / this.repulsionRange));
          v737 = parseInt(Math.ceil((v735.getBottom() - v735.getTop()) / this.repulsionRange));
          var v738 = new Array(v736);
          for (var v739 = 0; v739 < v736; v739++) {
            v738[v739] = new Array(v737);
          }
          for (var v739 = 0; v739 < v736; v739++) {
            for (var v740 = 0; v740 < v737; v740++) {
              v738[v739][v740] = new Array();
            }
          }
          return v738;
        };
        v670.prototype.addNodeToGrid = function (v741, v742, v743) {
          var v744 = 0;
          var v745 = 0;
          var v746 = 0;
          var v747 = 0;
          v744 = parseInt(Math.floor((v741.getRect().x - v742) / this.repulsionRange));
          v745 = parseInt(Math.floor((v741.getRect().width + v741.getRect().x - v742) / this.repulsionRange));
          v746 = parseInt(Math.floor((v741.getRect().y - v743) / this.repulsionRange));
          v747 = parseInt(Math.floor((v741.getRect().height + v741.getRect().y - v743) / this.repulsionRange));
          for (var v748 = v744; v748 <= v745; v748++) {
            for (var v749 = v746; v749 <= v747; v749++) {
              this.grid[v748][v749].push(v741);
              v741.setGridCoordinates(v744, v745, v746, v747);
            }
          }
        };
        v670.prototype.updateGrid = function () {
          var v750;
          var v751;
          var v752 = this.getAllNodes();
          this.grid = this.calcGrid(this.graphManager.getRoot());
          for (v750 = 0; v750 < v752.length; v750++) {
            v751 = v752[v750];
            this.addNodeToGrid(v751, this.graphManager.getRoot().getLeft(), this.graphManager.getRoot().getTop());
          }
        };
        v670.prototype.calculateRepulsionForceOfANode = function (v753, v754, v755, v756) {
          if (this.totalIterations % v666.GRID_CALCULATION_CHECK_PERIOD == 1 && v755 || v756) {
            var v757 = new Set();
            v753.surrounding = new Array();
            var v758;
            var v759 = this.grid;
            for (var v760 = v753.startX - 1; v760 < v753.finishX + 2; v760++) {
              for (var v761 = v753.startY - 1; v761 < v753.finishY + 2; v761++) {
                if (!(v760 < 0) && !(v761 < 0) && !(v760 >= v759.length) && !(v761 >= v759[0].length)) {
                  for (var v762 = 0; v762 < v759[v760][v761].length; v762++) {
                    v758 = v759[v760][v761][v762];
                    if (v753.getOwner() != v758.getOwner() || v753 == v758) {
                      continue;
                    }
                    if (!v754.has(v758) && !v757.has(v758)) {
                      var v763 = Math.abs(v753.getCenterX() - v758.getCenterX()) - (v753.getWidth() / 2 + v758.getWidth() / 2);
                      var v764 = Math.abs(v753.getCenterY() - v758.getCenterY()) - (v753.getHeight() / 2 + v758.getHeight() / 2);
                      if (v763 <= this.repulsionRange && v764 <= this.repulsionRange) {
                        v757.add(v758);
                      }
                    }
                  }
                }
              }
            }
            v753.surrounding = [].concat(v661(v757));
          }
          for (v760 = 0; v760 < v753.surrounding.length; v760++) {
            this.calcRepulsionForce(v753, v753.surrounding[v760]);
          }
        };
        v670.prototype.calcRepulsionRange = function () {
          return 0;
        };
        v658.exports = v670;
      }, function (v765, v766, v767) {
        var v768 = v767(1);
        var v769 = v767(4);
        function v770(v771, v772, v773) {
          v768.call(this, v771, v772, v773);
          this.idealLength = v769.DEFAULT_EDGE_LENGTH;
          this.edgeElasticity = v769.DEFAULT_SPRING_STRENGTH;
        }
        v770.prototype = Object.create(v768.prototype);
        for (var v774 in v768) {
          v770[v774] = v768[v774];
        }
        v765.exports = v770;
      }, function (v775, v776, v777) {
        var v778 = v777(3);
        var v779 = v777(4);
        function v780(v781, v782, v783, v784) {
          v778.call(this, v781, v782, v783, v784);
          this.nodeRepulsion = v779.DEFAULT_REPULSION_STRENGTH;
          this.springForceX = 0;
          this.springForceY = 0;
          this.repulsionForceX = 0;
          this.repulsionForceY = 0;
          this.gravitationForceX = 0;
          this.gravitationForceY = 0;
          this.displacementX = 0;
          this.displacementY = 0;
          this.startX = 0;
          this.finishX = 0;
          this.startY = 0;
          this.finishY = 0;
          this.surrounding = [];
        }
        v780.prototype = Object.create(v778.prototype);
        for (var v785 in v778) {
          v780[v785] = v778[v785];
        }
        v780.prototype.setGridCoordinates = function (v786, v787, v788, v789) {
          this.startX = v786;
          this.finishX = v787;
          this.startY = v788;
          this.finishY = v789;
        };
        v775.exports = v780;
      }, function (v790, v791, v792) {
        function v793(v794, v795) {
          this.width = 0;
          this.height = 0;
          if (v794 !== null && v795 !== null) {
            this.height = v795;
            this.width = v794;
          }
        }
        v793.prototype.getWidth = function () {
          return this.width;
        };
        v793.prototype.setWidth = function (v796) {
          this.width = v796;
        };
        v793.prototype.getHeight = function () {
          return this.height;
        };
        v793.prototype.setHeight = function (v797) {
          this.height = v797;
        };
        v790.exports = v793;
      }, function (v798, v799, v800) {
        var v801 = v800(14);
        function v802() {
          this.map = {};
          this.keys = [];
        }
        v802.prototype.put = function (v803, v804) {
          var v805 = v801.createID(v803);
          if (!this.contains(v805)) {
            this.map[v805] = v804;
            this.keys.push(v803);
          }
        };
        v802.prototype.contains = function (v806) {
          v801.createID(v806);
          return this.map[v806] != null;
        };
        v802.prototype.get = function (v807) {
          var v808 = v801.createID(v807);
          return this.map[v808];
        };
        v802.prototype.keySet = function () {
          return this.keys;
        };
        v798.exports = v802;
      }, function (v809, v810, v811) {
        var v812 = v811(14);
        function v813() {
          this.set = {};
        }
        v813.prototype.add = function (v814) {
          var v815 = v812.createID(v814);
          if (!this.contains(v815)) {
            this.set[v815] = v814;
          }
        };
        v813.prototype.remove = function (v816) {
          delete this.set[v812.createID(v816)];
        };
        v813.prototype.clear = function () {
          this.set = {};
        };
        v813.prototype.contains = function (v817) {
          return this.set[v812.createID(v817)] == v817;
        };
        v813.prototype.isEmpty = function () {
          return this.size() === 0;
        };
        v813.prototype.size = function () {
          return Object.keys(this.set).length;
        };
        v813.prototype.addAllTo = function (v818) {
          var v819 = Object.keys(this.set);
          var v820 = v819.length;
          for (var v821 = 0; v821 < v820; v821++) {
            v818.push(this.set[v819[v821]]);
          }
        };
        v813.prototype.size = function () {
          return Object.keys(this.set).length;
        };
        v813.prototype.addAll = function (v822) {
          var v823 = v822.length;
          for (var v824 = 0; v824 < v823; v824++) {
            var v825 = v822[v824];
            this.add(v825);
          }
        };
        v809.exports = v813;
      }, function (v826, v827, v828) {
        function v829() {}
        v829.multMat = function (v830, v831) {
          var v832 = [];
          for (var v833 = 0; v833 < v830.length; v833++) {
            v832[v833] = [];
            for (var v834 = 0; v834 < v831[0].length; v834++) {
              v832[v833][v834] = 0;
              for (var v835 = 0; v835 < v830[0].length; v835++) {
                v832[v833][v834] += v830[v833][v835] * v831[v835][v834];
              }
            }
          }
          return v832;
        };
        v829.transpose = function (v836) {
          var v837 = [];
          for (var v838 = 0; v838 < v836[0].length; v838++) {
            v837[v838] = [];
            for (var v839 = 0; v839 < v836.length; v839++) {
              v837[v838][v839] = v836[v839][v838];
            }
          }
          return v837;
        };
        v829.multCons = function (v840, v841) {
          var v842 = [];
          for (var v843 = 0; v843 < v840.length; v843++) {
            v842[v843] = v840[v843] * v841;
          }
          return v842;
        };
        v829.minusOp = function (v844, v845) {
          var v846 = [];
          for (var v847 = 0; v847 < v844.length; v847++) {
            v846[v847] = v844[v847] - v845[v847];
          }
          return v846;
        };
        v829.dotProduct = function (v848, v849) {
          var v850 = 0;
          for (var v851 = 0; v851 < v848.length; v851++) {
            v850 += v848[v851] * v849[v851];
          }
          return v850;
        };
        v829.mag = function (v852) {
          return Math.sqrt(this.dotProduct(v852, v852));
        };
        v829.normalize = function (v853) {
          var v854 = [];
          var v855 = this.mag(v853);
          for (var v856 = 0; v856 < v853.length; v856++) {
            v854[v856] = v853[v856] / v855;
          }
          return v854;
        };
        v829.multGamma = function (v857) {
          var v858 = [];
          var v859 = 0;
          for (var v860 = 0; v860 < v857.length; v860++) {
            v859 += v857[v860];
          }
          v859 *= -1 / v857.length;
          for (var v861 = 0; v861 < v857.length; v861++) {
            v858[v861] = v859 + v857[v861];
          }
          return v858;
        };
        v829.multL = function (v862, v863, v864) {
          var v865 = [];
          var v866 = [];
          var v867 = [];
          for (var v868 = 0; v868 < v863[0].length; v868++) {
            var v869 = 0;
            for (var v870 = 0; v870 < v863.length; v870++) {
              v869 += v863[v870][v868] * -0.5 * v862[v870];
            }
            v866[v868] = v869;
          }
          for (var v871 = 0; v871 < v864.length; v871++) {
            var v872 = 0;
            for (var v873 = 0; v873 < v864.length; v873++) {
              v872 += v864[v871][v873] * v866[v873];
            }
            v867[v871] = v872;
          }
          for (var v874 = 0; v874 < v863.length; v874++) {
            var v875 = 0;
            for (var v876 = 0; v876 < v863[0].length; v876++) {
              v875 += v863[v874][v876] * v867[v876];
            }
            v865[v874] = v875;
          }
          return v865;
        };
        v826.exports = v829;
      }, function (v877, v878, v879) {
        var v880 = function () {
          function v881(v882, v883) {
            for (var v884 = 0; v884 < v883.length; v884++) {
              var v885 = v883[v884];
              v885.enumerable = v885.enumerable || false;
              v885.configurable = true;
              if ("value" in v885) {
                v885.writable = true;
              }
              Object.defineProperty(v882, v885.key, v885);
            }
          }
          return function (v886, v887, v888) {
            if (v887) {
              v881(v886.prototype, v887);
            }
            if (v888) {
              v881(v886, v888);
            }
            return v886;
          };
        }();
        function v889(v890, v891) {
          if (!(v890 instanceof v891)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var v892 = v879(11);
        var v893 = function () {
          function v894(v895, v896) {
            v889(this, v894);
            if (v896 !== null || v896 !== undefined) {
              this.compareFunction = this._defaultCompareFunction;
            }
            var v897 = undefined;
            if (v895 instanceof v892) {
              v897 = v895.size();
            } else {
              v897 = v895.length;
            }
            this._quicksort(v895, 0, v897 - 1);
          }
          v880(v894, [{
            key: "_quicksort",
            value: function v898(v899, v900, v901) {
              if (v900 < v901) {
                var v902 = this._partition(v899, v900, v901);
                this._quicksort(v899, v900, v902);
                this._quicksort(v899, v902 + 1, v901);
              }
            }
          }, {
            key: "_partition",
            value: function v903(v904, v905, v906) {
              var v907 = this._get(v904, v905);
              var v908 = v905;
              var v909 = v906;
              while (true) {
                while (this.compareFunction(v907, this._get(v904, v909))) {
                  v909--;
                }
                while (this.compareFunction(this._get(v904, v908), v907)) {
                  v908++;
                }
                if (v908 < v909) {
                  this._swap(v904, v908, v909);
                  v908++;
                  v909--;
                } else {
                  return v909;
                }
              }
            }
          }, {
            key: "_get",
            value: function v910(v911, v912) {
              if (v911 instanceof v892) {
                return v911.get_object_at(v912);
              } else {
                return v911[v912];
              }
            }
          }, {
            key: "_set",
            value: function v913(v914, v915, v916) {
              if (v914 instanceof v892) {
                v914.set_object_at(v915, v916);
              } else {
                v914[v915] = v916;
              }
            }
          }, {
            key: "_swap",
            value: function v917(v918, v919, v920) {
              var v921 = this._get(v918, v919);
              this._set(v918, v919, this._get(v918, v920));
              this._set(v918, v920, v921);
            }
          }, {
            key: "_defaultCompareFunction",
            value: function v922(v923, v924) {
              return v924 > v923;
            }
          }]);
          return v894;
        }();
        v877.exports = v893;
      }, function (v925, v926, v927) {
        function v928() {}
        v928.svd = function (v929) {
          this.U = null;
          this.V = null;
          this.s = null;
          this.m = 0;
          this.n = 0;
          this.m = v929.length;
          this.n = v929[0].length;
          var v930 = Math.min(this.m, this.n);
          this.s = function (v931) {
            var v932 = [];
            while (v931-- > 0) {
              v932.push(0);
            }
            return v932;
          }(Math.min(this.m + 1, this.n));
          this.U = function (v933) {
            var v934 = function v935(v936) {
              if (v936.length == 0) {
                return 0;
              } else {
                var v937 = [];
                for (var v938 = 0; v938 < v936[0]; v938++) {
                  v937.push(v935(v936.slice(1)));
                }
                return v937;
              }
            };
            return v934(v933);
          }([this.m, v930]);
          this.V = function (v939) {
            var v940 = function v941(v942) {
              if (v942.length == 0) {
                return 0;
              } else {
                var v943 = [];
                for (var v944 = 0; v944 < v942[0]; v944++) {
                  v943.push(v941(v942.slice(1)));
                }
                return v943;
              }
            };
            return v940(v939);
          }([this.n, this.n]);
          var v945 = function (v946) {
            var v947 = [];
            while (v946-- > 0) {
              v947.push(0);
            }
            return v947;
          }(this.n);
          var v948 = function (v949) {
            var v950 = [];
            while (v949-- > 0) {
              v950.push(0);
            }
            return v950;
          }(this.m);
          var v951 = true;
          var v952 = Math.min(this.m - 1, this.n);
          var v953 = Math.max(0, Math.min(this.n - 2, this.m));
          for (var v954 = 0; v954 < Math.max(v952, v953); v954++) {
            if (v954 < v952) {
              this.s[v954] = 0;
              for (var v955 = v954; v955 < this.m; v955++) {
                this.s[v954] = v928.hypot(this.s[v954], v929[v955][v954]);
              }
              if (this.s[v954] !== 0) {
                if (v929[v954][v954] < 0) {
                  this.s[v954] = -this.s[v954];
                }
                for (var v956 = v954; v956 < this.m; v956++) {
                  v929[v956][v954] /= this.s[v954];
                }
                v929[v954][v954] += 1;
              }
              this.s[v954] = -this.s[v954];
            }
            for (var v957 = v954 + 1; v957 < this.n; v957++) {
              if (function (v958, v959) {
                return v958 && v959;
              }(v954 < v952, this.s[v954] !== 0)) {
                var v960 = 0;
                for (var v961 = v954; v961 < this.m; v961++) {
                  v960 += v929[v961][v954] * v929[v961][v957];
                }
                v960 = -v960 / v929[v954][v954];
                for (var v962 = v954; v962 < this.m; v962++) {
                  v929[v962][v957] += v960 * v929[v962][v954];
                }
              }
              v945[v957] = v929[v954][v957];
            }
            if (function (v963, v964) {
              return v964;
            }(v951, v954 < v952)) {
              for (var v965 = v954; v965 < this.m; v965++) {
                this.U[v965][v954] = v929[v965][v954];
              }
            }
            if (v954 < v953) {
              v945[v954] = 0;
              for (var v966 = v954 + 1; v966 < this.n; v966++) {
                v945[v954] = v928.hypot(v945[v954], v945[v966]);
              }
              if (v945[v954] !== 0) {
                if (v945[v954 + 1] < 0) {
                  v945[v954] = -v945[v954];
                }
                for (var v967 = v954 + 1; v967 < this.n; v967++) {
                  v945[v967] /= v945[v954];
                }
                v945[v954 + 1] += 1;
              }
              v945[v954] = -v945[v954];
              if (function (v968, v969) {
                return v968 && v969;
              }(v954 + 1 < this.m, v945[v954] !== 0)) {
                for (var v970 = v954 + 1; v970 < this.m; v970++) {
                  v948[v970] = 0;
                }
                for (var v971 = v954 + 1; v971 < this.n; v971++) {
                  for (var v972 = v954 + 1; v972 < this.m; v972++) {
                    v948[v972] += v945[v971] * v929[v972][v971];
                  }
                }
                for (var v973 = v954 + 1; v973 < this.n; v973++) {
                  var v974 = -v945[v973] / v945[v954 + 1];
                  for (var v975 = v954 + 1; v975 < this.m; v975++) {
                    v929[v975][v973] += v974 * v948[v975];
                  }
                }
              }
              {
                for (var v976 = v954 + 1; v976 < this.n; v976++) {
                  this.V[v976][v954] = v945[v976];
                }
              }
            }
          }
          var v977 = Math.min(this.n, this.m + 1);
          if (v952 < this.n) {
            this.s[v952] = v929[v952][v952];
          }
          if (this.m < v977) {
            this.s[v977 - 1] = 0;
          }
          if (v953 + 1 < v977) {
            v945[v953] = v929[v953][v977 - 1];
          }
          v945[v977 - 1] = 0;
          {
            for (var v978 = v952; v978 < v930; v978++) {
              for (var v979 = 0; v979 < this.m; v979++) {
                this.U[v979][v978] = 0;
              }
              this.U[v978][v978] = 1;
            }
            for (var v980 = v952 - 1; v980 >= 0; v980--) {
              if (this.s[v980] !== 0) {
                for (var v981 = v980 + 1; v981 < v930; v981++) {
                  var v982 = 0;
                  for (var v983 = v980; v983 < this.m; v983++) {
                    v982 += this.U[v983][v980] * this.U[v983][v981];
                  }
                  v982 = -v982 / this.U[v980][v980];
                  for (var v984 = v980; v984 < this.m; v984++) {
                    this.U[v984][v981] += v982 * this.U[v984][v980];
                  }
                }
                for (var v985 = v980; v985 < this.m; v985++) {
                  this.U[v985][v980] = -this.U[v985][v980];
                }
                this.U[v980][v980] = 1 + this.U[v980][v980];
                for (var v986 = 0; v986 < v980 - 1; v986++) {
                  this.U[v986][v980] = 0;
                }
              } else {
                for (var v987 = 0; v987 < this.m; v987++) {
                  this.U[v987][v980] = 0;
                }
                this.U[v980][v980] = 1;
              }
            }
          }
          {
            for (var v988 = this.n - 1; v988 >= 0; v988--) {
              if (function (v989, v990) {
                return v989 && v990;
              }(v988 < v953, v945[v988] !== 0)) {
                for (var v991 = v988 + 1; v991 < v930; v991++) {
                  var v992 = 0;
                  for (var v993 = v988 + 1; v993 < this.n; v993++) {
                    v992 += this.V[v993][v988] * this.V[v993][v991];
                  }
                  v992 = -v992 / this.V[v988 + 1][v988];
                  for (var v994 = v988 + 1; v994 < this.n; v994++) {
                    this.V[v994][v991] += v992 * this.V[v994][v988];
                  }
                }
              }
              for (var v995 = 0; v995 < this.n; v995++) {
                this.V[v995][v988] = 0;
              }
              this.V[v988][v988] = 1;
            }
          }
          var v996 = v977 - 1;
          var v997 = Math.pow(2, -52);
          var v998 = Math.pow(2, -966);
          while (v977 > 0) {
            var v999 = undefined;
            var v1000 = undefined;
            for (v999 = v977 - 2; v999 >= -1; v999--) {
              if (v999 === -1) {
                break;
              }
              if (Math.abs(v945[v999]) <= v998 + v997 * (Math.abs(this.s[v999]) + Math.abs(this.s[v999 + 1]))) {
                v945[v999] = 0;
                break;
              }
            }
            if (v999 === v977 - 2) {
              v1000 = 4;
            } else {
              var v1001 = undefined;
              for (v1001 = v977 - 1; v1001 >= v999; v1001--) {
                if (v1001 === v999) {
                  break;
                }
                var v1002 = (v1001 !== v977 ? Math.abs(v945[v1001]) : 0) + (v1001 !== v999 + 1 ? Math.abs(v945[v1001 - 1]) : 0);
                if (Math.abs(this.s[v1001]) <= v998 + v997 * v1002) {
                  this.s[v1001] = 0;
                  break;
                }
              }
              if (v1001 === v999) {
                v1000 = 3;
              } else if (v1001 === v977 - 1) {
                v1000 = 1;
              } else {
                v1000 = 2;
                v999 = v1001;
              }
            }
            v999++;
            switch (v1000) {
              case 1:
                {
                  var v1003 = v945[v977 - 2];
                  v945[v977 - 2] = 0;
                  for (var v1004 = v977 - 2; v1004 >= v999; v1004--) {
                    var v1005 = v928.hypot(this.s[v1004], v1003);
                    var v1006 = this.s[v1004] / v1005;
                    var v1007 = v1003 / v1005;
                    this.s[v1004] = v1005;
                    if (v1004 !== v999) {
                      v1003 = -v1007 * v945[v1004 - 1];
                      v945[v1004 - 1] = v1006 * v945[v1004 - 1];
                    }
                    {
                      for (var v1008 = 0; v1008 < this.n; v1008++) {
                        v1005 = v1006 * this.V[v1008][v1004] + v1007 * this.V[v1008][v977 - 1];
                        this.V[v1008][v977 - 1] = -v1007 * this.V[v1008][v1004] + v1006 * this.V[v1008][v977 - 1];
                        this.V[v1008][v1004] = v1005;
                      }
                    }
                  }
                }
                break;
              case 2:
                {
                  var v1009 = v945[v999 - 1];
                  v945[v999 - 1] = 0;
                  for (var v1010 = v999; v1010 < v977; v1010++) {
                    var v1011 = v928.hypot(this.s[v1010], v1009);
                    var v1012 = this.s[v1010] / v1011;
                    var v1013 = v1009 / v1011;
                    this.s[v1010] = v1011;
                    v1009 = -v1013 * v945[v1010];
                    v945[v1010] = v1012 * v945[v1010];
                    {
                      for (var v1014 = 0; v1014 < this.m; v1014++) {
                        v1011 = v1012 * this.U[v1014][v1010] + v1013 * this.U[v1014][v999 - 1];
                        this.U[v1014][v999 - 1] = -v1013 * this.U[v1014][v1010] + v1012 * this.U[v1014][v999 - 1];
                        this.U[v1014][v1010] = v1011;
                      }
                    }
                  }
                }
                break;
              case 3:
                {
                  var v1015 = Math.max(Math.max(Math.max(Math.max(Math.abs(this.s[v977 - 1]), Math.abs(this.s[v977 - 2])), Math.abs(v945[v977 - 2])), Math.abs(this.s[v999])), Math.abs(v945[v999]));
                  var v1016 = this.s[v977 - 1] / v1015;
                  var v1017 = this.s[v977 - 2] / v1015;
                  var v1018 = v945[v977 - 2] / v1015;
                  var v1019 = this.s[v999] / v1015;
                  var v1020 = v945[v999] / v1015;
                  var v1021 = ((v1017 + v1016) * (v1017 - v1016) + v1018 * v1018) / 2;
                  var v1022 = v1016 * v1018 * (v1016 * v1018);
                  var v1023 = 0;
                  if (function (v1024, v1025) {
                    return v1024 || v1025;
                  }(v1021 !== 0, v1022 !== 0)) {
                    v1023 = Math.sqrt(v1021 * v1021 + v1022);
                    if (v1021 < 0) {
                      v1023 = -v1023;
                    }
                    v1023 = v1022 / (v1021 + v1023);
                  }
                  var v1026 = (v1019 + v1016) * (v1019 - v1016) + v1023;
                  var v1027 = v1019 * v1020;
                  for (var v1028 = v999; v1028 < v977 - 1; v1028++) {
                    var v1029 = v928.hypot(v1026, v1027);
                    var v1030 = v1026 / v1029;
                    var v1031 = v1027 / v1029;
                    if (v1028 !== v999) {
                      v945[v1028 - 1] = v1029;
                    }
                    v1026 = v1030 * this.s[v1028] + v1031 * v945[v1028];
                    v945[v1028] = v1030 * v945[v1028] - v1031 * this.s[v1028];
                    v1027 = v1031 * this.s[v1028 + 1];
                    this.s[v1028 + 1] = v1030 * this.s[v1028 + 1];
                    {
                      for (var v1032 = 0; v1032 < this.n; v1032++) {
                        v1029 = v1030 * this.V[v1032][v1028] + v1031 * this.V[v1032][v1028 + 1];
                        this.V[v1032][v1028 + 1] = -v1031 * this.V[v1032][v1028] + v1030 * this.V[v1032][v1028 + 1];
                        this.V[v1032][v1028] = v1029;
                      }
                    }
                    v1029 = v928.hypot(v1026, v1027);
                    v1030 = v1026 / v1029;
                    v1031 = v1027 / v1029;
                    this.s[v1028] = v1029;
                    v1026 = v1030 * v945[v1028] + v1031 * this.s[v1028 + 1];
                    this.s[v1028 + 1] = -v1031 * v945[v1028] + v1030 * this.s[v1028 + 1];
                    v1027 = v1031 * v945[v1028 + 1];
                    v945[v1028 + 1] = v1030 * v945[v1028 + 1];
                    if (v1028 < this.m - 1) {
                      for (var v1033 = 0; v1033 < this.m; v1033++) {
                        v1029 = v1030 * this.U[v1033][v1028] + v1031 * this.U[v1033][v1028 + 1];
                        this.U[v1033][v1028 + 1] = -v1031 * this.U[v1033][v1028] + v1030 * this.U[v1033][v1028 + 1];
                        this.U[v1033][v1028] = v1029;
                      }
                    }
                  }
                  v945[v977 - 2] = v1026;
                }
                break;
              case 4:
                {
                  if (this.s[v999] <= 0) {
                    this.s[v999] = this.s[v999] < 0 ? -this.s[v999] : 0;
                    {
                      for (var v1034 = 0; v1034 <= v996; v1034++) {
                        this.V[v1034][v999] = -this.V[v1034][v999];
                      }
                    }
                  }
                  while (v999 < v996) {
                    if (this.s[v999] >= this.s[v999 + 1]) {
                      break;
                    }
                    var v1035 = this.s[v999];
                    this.s[v999] = this.s[v999 + 1];
                    this.s[v999 + 1] = v1035;
                    if (v999 < this.n - 1) {
                      for (var v1036 = 0; v1036 < this.n; v1036++) {
                        v1035 = this.V[v1036][v999 + 1];
                        this.V[v1036][v999 + 1] = this.V[v1036][v999];
                        this.V[v1036][v999] = v1035;
                      }
                    }
                    if (v999 < this.m - 1) {
                      for (var v1037 = 0; v1037 < this.m; v1037++) {
                        v1035 = this.U[v1037][v999 + 1];
                        this.U[v1037][v999 + 1] = this.U[v1037][v999];
                        this.U[v1037][v999] = v1035;
                      }
                    }
                    v999++;
                  }
                  v977--;
                }
                break;
            }
          }
          var v1038 = {
            U: this.U,
            V: this.V,
            S: this.s
          };
          return v1038;
        };
        v928.hypot = function (v1039, v1040) {
          var v1041 = undefined;
          if (Math.abs(v1039) > Math.abs(v1040)) {
            v1041 = v1040 / v1039;
            v1041 = Math.abs(v1039) * Math.sqrt(1 + v1041 * v1041);
          } else if (v1040 != 0) {
            v1041 = v1039 / v1040;
            v1041 = Math.abs(v1040) * Math.sqrt(1 + v1041 * v1041);
          } else {
            v1041 = 0;
          }
          return v1041;
        };
        v925.exports = v928;
      }, function (v1042, v1043, v1044) {
        var v1045 = function () {
          function v1046(v1047, v1048) {
            for (var v1049 = 0; v1049 < v1048.length; v1049++) {
              var v1050 = v1048[v1049];
              v1050.enumerable = v1050.enumerable || false;
              v1050.configurable = true;
              if ("value" in v1050) {
                v1050.writable = true;
              }
              Object.defineProperty(v1047, v1050.key, v1050);
            }
          }
          return function (v1051, v1052, v1053) {
            if (v1052) {
              v1046(v1051.prototype, v1052);
            }
            if (v1053) {
              v1046(v1051, v1053);
            }
            return v1051;
          };
        }();
        function v1054(v1055, v1056) {
          if (!(v1055 instanceof v1056)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var v1057 = function () {
          function v1058(v1059, v1060, v1061 = 1, v1062 = -1, v1063 = -1) {
            v1054(this, v1058);
            this.sequence1 = v1059;
            this.sequence2 = v1060;
            this.match_score = v1061;
            this.mismatch_penalty = v1062;
            this.gap_penalty = v1063;
            this.iMax = v1059.length + 1;
            this.jMax = v1060.length + 1;
            this.grid = new Array(this.iMax);
            for (var v1064 = 0; v1064 < this.iMax; v1064++) {
              this.grid[v1064] = new Array(this.jMax);
              for (var v1065 = 0; v1065 < this.jMax; v1065++) {
                this.grid[v1064][v1065] = 0;
              }
            }
            this.tracebackGrid = new Array(this.iMax);
            for (var v1066 = 0; v1066 < this.iMax; v1066++) {
              this.tracebackGrid[v1066] = new Array(this.jMax);
              for (var v1067 = 0; v1067 < this.jMax; v1067++) {
                this.tracebackGrid[v1066][v1067] = [null, null, null];
              }
            }
            this.alignments = [];
            this.score = -1;
            this.computeGrids();
          }
          v1045(v1058, [{
            key: "getScore",
            value: function v1068() {
              return this.score;
            }
          }, {
            key: "getAlignments",
            value: function v1069() {
              return this.alignments;
            }
          }, {
            key: "computeGrids",
            value: function v1070() {
              for (var v1071 = 1; v1071 < this.jMax; v1071++) {
                this.grid[0][v1071] = this.grid[0][v1071 - 1] + this.gap_penalty;
                this.tracebackGrid[0][v1071] = [false, false, true];
              }
              for (var v1072 = 1; v1072 < this.iMax; v1072++) {
                this.grid[v1072][0] = this.grid[v1072 - 1][0] + this.gap_penalty;
                this.tracebackGrid[v1072][0] = [false, true, false];
              }
              for (var v1073 = 1; v1073 < this.iMax; v1073++) {
                for (var v1074 = 1; v1074 < this.jMax; v1074++) {
                  var v1075 = undefined;
                  if (this.sequence1[v1073 - 1] === this.sequence2[v1074 - 1]) {
                    v1075 = this.grid[v1073 - 1][v1074 - 1] + this.match_score;
                  } else {
                    v1075 = this.grid[v1073 - 1][v1074 - 1] + this.mismatch_penalty;
                  }
                  var v1076 = this.grid[v1073 - 1][v1074] + this.gap_penalty;
                  var v1077 = this.grid[v1073][v1074 - 1] + this.gap_penalty;
                  var v1078 = [v1075, v1076, v1077];
                  var v1079 = this.arrayAllMaxIndexes(v1078);
                  this.grid[v1073][v1074] = v1078[v1079[0]];
                  this.tracebackGrid[v1073][v1074] = [v1079.includes(0), v1079.includes(1), v1079.includes(2)];
                }
              }
              this.score = this.grid[this.iMax - 1][this.jMax - 1];
            }
          }, {
            key: "alignmentTraceback",
            value: function v1080() {
              var v1081 = [];
              v1081.push({
                pos: [this.sequence1.length, this.sequence2.length],
                seq1: "",
                seq2: ""
              });
              while (v1081[0]) {
                var v1082 = v1081[0];
                var v1083 = this.tracebackGrid[v1082.pos[0]][v1082.pos[1]];
                if (v1083[0]) {
                  v1081.push({
                    pos: [v1082.pos[0] - 1, v1082.pos[1] - 1],
                    seq1: this.sequence1[v1082.pos[0] - 1] + v1082.seq1,
                    seq2: this.sequence2[v1082.pos[1] - 1] + v1082.seq2
                  });
                }
                if (v1083[1]) {
                  v1081.push({
                    pos: [v1082.pos[0] - 1, v1082.pos[1]],
                    seq1: this.sequence1[v1082.pos[0] - 1] + v1082.seq1,
                    seq2: "-" + v1082.seq2
                  });
                }
                if (v1083[2]) {
                  v1081.push({
                    pos: [v1082.pos[0], v1082.pos[1] - 1],
                    seq1: "-" + v1082.seq1,
                    seq2: this.sequence2[v1082.pos[1] - 1] + v1082.seq2
                  });
                }
                if (v1082.pos[0] === 0 && v1082.pos[1] === 0) {
                  this.alignments.push({
                    sequence1: v1082.seq1,
                    sequence2: v1082.seq2
                  });
                }
                v1081.shift();
              }
              return this.alignments;
            }
          }, {
            key: "getAllIndexes",
            value: function v1084(v1085, v1086) {
              var v1087 = [];
              var v1088 = -1;
              while ((v1088 = v1085.indexOf(v1086, v1088 + 1)) !== -1) {
                v1087.push(v1088);
              }
              return v1087;
            }
          }, {
            key: "arrayAllMaxIndexes",
            value: function v1089(v1090) {
              return this.getAllIndexes(v1090, Math.max.apply(null, v1090));
            }
          }]);
          return v1058;
        }();
        v1042.exports = v1057;
      }, function (v1091, v1092, v1093) {
        var v1094 = function v1095() {
          return;
        };
        v1094.FDLayout = v1093(18);
        v1094.FDLayoutConstants = v1093(4);
        v1094.FDLayoutEdge = v1093(19);
        v1094.FDLayoutNode = v1093(20);
        v1094.DimensionD = v1093(21);
        v1094.HashMap = v1093(22);
        v1094.HashSet = v1093(23);
        v1094.IGeometry = v1093(8);
        v1094.IMath = v1093(9);
        v1094.Integer = v1093(10);
        v1094.Point = v1093(12);
        v1094.PointD = v1093(5);
        v1094.RandomSeed = v1093(16);
        v1094.RectangleD = v1093(13);
        v1094.Transform = v1093(17);
        v1094.UniqueIDGeneretor = v1093(14);
        v1094.Quicksort = v1093(25);
        v1094.LinkedList = v1093(11);
        v1094.LGraphObject = v1093(2);
        v1094.LGraph = v1093(6);
        v1094.LEdge = v1093(1);
        v1094.LGraphManager = v1093(7);
        v1094.LNode = v1093(3);
        v1094.Layout = v1093(15);
        v1094.LayoutConstants = v1093(0);
        v1094.NeedlemanWunsch = v1093(27);
        v1094.Matrix = v1093(24);
        v1094.SVD = v1093(26);
        v1091.exports = v1094;
      }, function (v1096, v1097, v1098) {
        function v1099() {
          this.listeners = [];
        }
        var v1100 = v1099.prototype;
        v1100.addListener = function (v1101, v1102) {
          this.listeners.push({
            event: v1101,
            callback: v1102
          });
        };
        v1100.removeListener = function (v1103, v1104) {
          for (var v1105 = this.listeners.length; v1105 >= 0; v1105--) {
            var v1106 = this.listeners[v1105];
            if (v1106.event === v1103 && v1106.callback === v1104) {
              this.listeners.splice(v1105, 1);
            }
          }
        };
        v1100.emit = function (v1107, v1108) {
          for (var v1109 = 0; v1109 < this.listeners.length; v1109++) {
            var v1110 = this.listeners[v1109];
            if (v1107 === v1110.event) {
              v1110.callback(v1108);
            }
          }
        };
        v1096.exports = v1099;
      }]);
    });
  })(layoutBase$1);
  return layoutBase$1.exports;
}
var coseBase = coseBase$1.exports;
var hasRequiredCoseBase;
function requireCoseBase() {
  if (hasRequiredCoseBase) {
    return coseBase$1.exports;
  }
  hasRequiredCoseBase = 1;
  (function (v1111, v1112) {
    (function v1113(v1114, v1115) {
      v1111.exports = v1115(requireLayoutBase());
    })(coseBase, function (v1116) {
      return (() => {
        var v1117 = {
          45: (v1118, v1119, v1120) => {
            var v1121 = {};
            v1121.layoutBase = v1120(551);
            v1121.CoSEConstants = v1120(806);
            v1121.CoSEEdge = v1120(767);
            v1121.CoSEGraph = v1120(880);
            v1121.CoSEGraphManager = v1120(578);
            v1121.CoSELayout = v1120(765);
            v1121.CoSENode = v1120(991);
            v1121.ConstraintHandler = v1120(902);
            v1118.exports = v1121;
          },
          806: (v1122, v1123, v1124) => {
            var v1125 = v1124(551).FDLayoutConstants;
            function v1126() {}
            for (var v1127 in v1125) {
              v1126[v1127] = v1125[v1127];
            }
            v1126.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
            v1126.DEFAULT_RADIAL_SEPARATION = v1125.DEFAULT_EDGE_LENGTH;
            v1126.DEFAULT_COMPONENT_SEPERATION = 60;
            v1126.TILE = true;
            v1126.TILING_PADDING_VERTICAL = 10;
            v1126.TILING_PADDING_HORIZONTAL = 10;
            v1126.TRANSFORM_ON_CONSTRAINT_HANDLING = true;
            v1126.ENFORCE_CONSTRAINTS = true;
            v1126.APPLY_LAYOUT = true;
            v1126.RELAX_MOVEMENT_ON_CONSTRAINTS = true;
            v1126.TREE_REDUCTION_ON_INCREMENTAL = true;
            v1126.PURE_INCREMENTAL = v1126.DEFAULT_INCREMENTAL;
            v1122.exports = v1126;
          },
          767: (v1128, v1129, v1130) => {
            var v1131 = v1130(551).FDLayoutEdge;
            function v1132(v1133, v1134, v1135) {
              v1131.call(this, v1133, v1134, v1135);
            }
            v1132.prototype = Object.create(v1131.prototype);
            for (var v1136 in v1131) {
              v1132[v1136] = v1131[v1136];
            }
            v1128.exports = v1132;
          },
          880: (v1137, v1138, v1139) => {
            var v1140 = v1139(551).LGraph;
            function v1141(v1142, v1143, v1144) {
              v1140.call(this, v1142, v1143, v1144);
            }
            v1141.prototype = Object.create(v1140.prototype);
            for (var v1145 in v1140) {
              v1141[v1145] = v1140[v1145];
            }
            v1137.exports = v1141;
          },
          578: (v1146, v1147, v1148) => {
            var v1149 = v1148(551).LGraphManager;
            function v1150(v1151) {
              v1149.call(this, v1151);
            }
            v1150.prototype = Object.create(v1149.prototype);
            for (var v1152 in v1149) {
              v1150[v1152] = v1149[v1152];
            }
            v1146.exports = v1150;
          },
          765: (v1153, v1154, v1155) => {
            var v1156 = v1155(551).FDLayout;
            var v1157 = v1155(578);
            var v1158 = v1155(880);
            var v1159 = v1155(991);
            var v1160 = v1155(767);
            var v1161 = v1155(806);
            var v1162 = v1155(902);
            var v1163 = v1155(551).FDLayoutConstants;
            var v1164 = v1155(551).LayoutConstants;
            var v1165 = v1155(551).Point;
            var v1166 = v1155(551).PointD;
            var v1167 = v1155(551).DimensionD;
            var v1168 = v1155(551).Layout;
            var v1169 = v1155(551).Integer;
            var v1170 = v1155(551).IGeometry;
            var v1171 = v1155(551).LGraph;
            var v1172 = v1155(551).Transform;
            var v1173 = v1155(551).LinkedList;
            function v1174() {
              v1156.call(this);
              this.toBeTiled = {};
              this.constraints = {};
            }
            v1174.prototype = Object.create(v1156.prototype);
            for (var v1175 in v1156) {
              v1174[v1175] = v1156[v1175];
            }
            v1174.prototype.newGraphManager = function () {
              var v1176 = new v1157(this);
              this.graphManager = v1176;
              return v1176;
            };
            v1174.prototype.newGraph = function (v1177) {
              return new v1158(null, this.graphManager, v1177);
            };
            v1174.prototype.newNode = function (v1178) {
              return new v1159(this.graphManager, v1178);
            };
            v1174.prototype.newEdge = function (v1179) {
              return new v1160(null, null, v1179);
            };
            v1174.prototype.initParameters = function () {
              v1156.prototype.initParameters.call(this, arguments);
              if (!this.isSubLayout) {
                if (v1161.DEFAULT_EDGE_LENGTH < 10) {
                  this.idealEdgeLength = 10;
                } else {
                  this.idealEdgeLength = v1161.DEFAULT_EDGE_LENGTH;
                }
                this.useSmartIdealEdgeLengthCalculation = v1161.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
                this.gravityConstant = v1163.DEFAULT_GRAVITY_STRENGTH;
                this.compoundGravityConstant = v1163.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
                this.gravityRangeFactor = v1163.DEFAULT_GRAVITY_RANGE_FACTOR;
                this.compoundGravityRangeFactor = v1163.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
                this.prunedNodesAll = [];
                this.growTreeIterations = 0;
                this.afterGrowthIterations = 0;
                this.isTreeGrowing = false;
                this.isGrowthFinished = false;
              }
            };
            v1174.prototype.initSpringEmbedder = function () {
              v1156.prototype.initSpringEmbedder.call(this);
              this.coolingCycle = 0;
              this.maxCoolingCycle = this.maxIterations / v1163.CONVERGENCE_CHECK_PERIOD;
              this.finalTemperature = 0.04;
              this.coolingAdjuster = 1;
            };
            v1174.prototype.layout = function () {
              var v1180 = v1164.DEFAULT_CREATE_BENDS_AS_NEEDED;
              if (v1180) {
                this.createBendpoints();
                this.graphManager.resetAllEdges();
              }
              this.level = 0;
              return this.classicLayout();
            };
            v1174.prototype.classicLayout = function () {
              this.nodesWithGravity = this.calculateNodesToApplyGravitationTo();
              this.graphManager.setAllNodesToApplyGravitation(this.nodesWithGravity);
              this.calcNoOfChildrenForAllNodes();
              this.graphManager.calcLowestCommonAncestors();
              this.graphManager.calcInclusionTreeDepths();
              this.graphManager.getRoot().calcEstimatedSize();
              this.calcIdealEdgeLengths();
              if (!this.incremental) {
                var v1181 = this.getFlatForest();
                if (v1181.length > 0) {
                  this.positionNodesRadially(v1181);
                } else {
                  this.reduceTrees();
                  this.graphManager.resetAllNodesToApplyGravitation();
                  var v1182 = new Set(this.getAllNodes());
                  var v1183 = this.nodesWithGravity.filter(function (v1184) {
                    return v1182.has(v1184);
                  });
                  this.graphManager.setAllNodesToApplyGravitation(v1183);
                  this.positionNodesRandomly();
                }
              } else if (v1161.TREE_REDUCTION_ON_INCREMENTAL) {
                this.reduceTrees();
                this.graphManager.resetAllNodesToApplyGravitation();
                var v1182 = new Set(this.getAllNodes());
                var v1183 = this.nodesWithGravity.filter(function (v1185) {
                  return v1182.has(v1185);
                });
                this.graphManager.setAllNodesToApplyGravitation(v1183);
              }
              if (Object.keys(this.constraints).length > 0) {
                v1162.handleConstraints(this);
                this.initConstraintVariables();
              }
              this.initSpringEmbedder();
              if (v1161.APPLY_LAYOUT) {
                this.runSpringEmbedder();
              }
              return true;
            };
            v1174.prototype.tick = function () {
              this.totalIterations++;
              if (this.totalIterations === this.maxIterations && !this.isTreeGrowing && !this.isGrowthFinished) {
                if (this.prunedNodesAll.length > 0) {
                  this.isTreeGrowing = true;
                } else {
                  return true;
                }
              }
              if (this.totalIterations % v1163.CONVERGENCE_CHECK_PERIOD == 0 && !this.isTreeGrowing && !this.isGrowthFinished) {
                if (this.isConverged()) {
                  if (this.prunedNodesAll.length > 0) {
                    this.isTreeGrowing = true;
                  } else {
                    return true;
                  }
                }
                this.coolingCycle++;
                if (this.layoutQuality == 0) {
                  this.coolingAdjuster = this.coolingCycle;
                } else if (this.layoutQuality == 1) {
                  this.coolingAdjuster = this.coolingCycle / 3;
                }
                this.coolingFactor = Math.max(this.initialCoolingFactor - Math.pow(this.coolingCycle, Math.log((this.initialCoolingFactor - this.finalTemperature) * 100) / Math.log(this.maxCoolingCycle)) / 100 * this.coolingAdjuster, this.finalTemperature);
                this.animationPeriod = Math.ceil(this.initialAnimationPeriod * Math.sqrt(this.coolingFactor));
              }
              if (this.isTreeGrowing) {
                if (this.growTreeIterations % 10 == 0) {
                  if (this.prunedNodesAll.length > 0) {
                    this.graphManager.updateBounds();
                    this.updateGrid();
                    this.growTree(this.prunedNodesAll);
                    this.graphManager.resetAllNodesToApplyGravitation();
                    var v1186 = new Set(this.getAllNodes());
                    var v1187 = this.nodesWithGravity.filter(function (v1188) {
                      return v1186.has(v1188);
                    });
                    this.graphManager.setAllNodesToApplyGravitation(v1187);
                    this.graphManager.updateBounds();
                    this.updateGrid();
                    if (v1161.PURE_INCREMENTAL) {
                      this.coolingFactor = v1163.DEFAULT_COOLING_FACTOR_INCREMENTAL / 2;
                    } else {
                      this.coolingFactor = v1163.DEFAULT_COOLING_FACTOR_INCREMENTAL;
                    }
                  } else {
                    this.isTreeGrowing = false;
                    this.isGrowthFinished = true;
                  }
                }
                this.growTreeIterations++;
              }
              if (this.isGrowthFinished) {
                if (this.isConverged()) {
                  return true;
                }
                if (this.afterGrowthIterations % 10 == 0) {
                  this.graphManager.updateBounds();
                  this.updateGrid();
                }
                if (v1161.PURE_INCREMENTAL) {
                  this.coolingFactor = v1163.DEFAULT_COOLING_FACTOR_INCREMENTAL / 2 * ((100 - this.afterGrowthIterations) / 100);
                } else {
                  this.coolingFactor = v1163.DEFAULT_COOLING_FACTOR_INCREMENTAL * ((100 - this.afterGrowthIterations) / 100);
                }
                this.afterGrowthIterations++;
              }
              var v1189 = !this.isTreeGrowing && !this.isGrowthFinished;
              var v1190 = this.growTreeIterations % 10 == 1 && this.isTreeGrowing || this.afterGrowthIterations % 10 == 1 && this.isGrowthFinished;
              this.totalDisplacement = 0;
              this.graphManager.updateBounds();
              this.calcSpringForces();
              this.calcRepulsionForces(v1189, v1190);
              this.calcGravitationalForces();
              this.moveNodes();
              this.animate();
              return false;
            };
            v1174.prototype.getPositionsData = function () {
              var v1191 = this.graphManager.getAllNodes();
              var v1192 = {};
              for (var v1193 = 0; v1193 < v1191.length; v1193++) {
                var v1194 = v1191[v1193].rect;
                var v1195 = v1191[v1193].id;
                v1192[v1195] = {
                  id: v1195,
                  x: v1194.getCenterX(),
                  y: v1194.getCenterY(),
                  w: v1194.width,
                  h: v1194.height
                };
              }
              return v1192;
            };
            v1174.prototype.runSpringEmbedder = function () {
              this.initialAnimationPeriod = 25;
              this.animationPeriod = this.initialAnimationPeriod;
              var v1196 = false;
              if (v1163.ANIMATE === "during") {
                this.emit("layoutstarted");
              } else {
                while (!v1196) {
                  v1196 = this.tick();
                }
                this.graphManager.updateBounds();
              }
            };
            v1174.prototype.moveNodes = function () {
              var v1197 = this.getAllNodes();
              var v1198;
              for (var v1199 = 0; v1199 < v1197.length; v1199++) {
                v1198 = v1197[v1199];
                v1198.calculateDisplacement();
              }
              if (Object.keys(this.constraints).length > 0) {
                this.updateDisplacements();
              }
              for (var v1199 = 0; v1199 < v1197.length; v1199++) {
                v1198 = v1197[v1199];
                v1198.move();
              }
            };
            v1174.prototype.initConstraintVariables = function () {
              var v1200 = this;
              this.idToNodeMap = new Map();
              this.fixedNodeSet = new Set();
              var v1201 = this.graphManager.getAllNodes();
              for (var v1202 = 0; v1202 < v1201.length; v1202++) {
                var v1203 = v1201[v1202];
                this.idToNodeMap.set(v1203.id, v1203);
              }
              var v1204 = function v1205(v1206) {
                var v1207 = v1206.getChild().getNodes();
                var v1208;
                var v1209 = 0;
                for (var v1210 = 0; v1210 < v1207.length; v1210++) {
                  v1208 = v1207[v1210];
                  if (v1208.getChild() == null) {
                    if (v1200.fixedNodeSet.has(v1208.id)) {
                      v1209 += 100;
                    }
                  } else {
                    v1209 += v1205(v1208);
                  }
                }
                return v1209;
              };
              if (this.constraints.fixedNodeConstraint) {
                this.constraints.fixedNodeConstraint.forEach(function (v1211) {
                  v1200.fixedNodeSet.add(v1211.nodeId);
                });
                var v1201 = this.graphManager.getAllNodes();
                var v1203;
                for (var v1202 = 0; v1202 < v1201.length; v1202++) {
                  v1203 = v1201[v1202];
                  if (v1203.getChild() != null) {
                    var v1212 = v1204(v1203);
                    if (v1212 > 0) {
                      v1203.fixedNodeWeight = v1212;
                    }
                  }
                }
              }
              if (this.constraints.relativePlacementConstraint) {
                var v1213 = new Map();
                var v1214 = new Map();
                this.dummyToNodeForVerticalAlignment = new Map();
                this.dummyToNodeForHorizontalAlignment = new Map();
                this.fixedNodesOnHorizontal = new Set();
                this.fixedNodesOnVertical = new Set();
                this.fixedNodeSet.forEach(function (v1215) {
                  v1200.fixedNodesOnHorizontal.add(v1215);
                  v1200.fixedNodesOnVertical.add(v1215);
                });
                if (this.constraints.alignmentConstraint) {
                  if (this.constraints.alignmentConstraint.vertical) {
                    var v1216 = this.constraints.alignmentConstraint.vertical;
                    for (var v1202 = 0; v1202 < v1216.length; v1202++) {
                      this.dummyToNodeForVerticalAlignment.set("dummy" + v1202, []);
                      v1216[v1202].forEach(function (v1217) {
                        v1213.set(v1217, "dummy" + v1202);
                        v1200.dummyToNodeForVerticalAlignment.get("dummy" + v1202).push(v1217);
                        if (v1200.fixedNodeSet.has(v1217)) {
                          v1200.fixedNodesOnHorizontal.add("dummy" + v1202);
                        }
                      });
                    }
                  }
                  if (this.constraints.alignmentConstraint.horizontal) {
                    var v1218 = this.constraints.alignmentConstraint.horizontal;
                    for (var v1202 = 0; v1202 < v1218.length; v1202++) {
                      this.dummyToNodeForHorizontalAlignment.set("dummy" + v1202, []);
                      v1218[v1202].forEach(function (v1219) {
                        v1214.set(v1219, "dummy" + v1202);
                        v1200.dummyToNodeForHorizontalAlignment.get("dummy" + v1202).push(v1219);
                        if (v1200.fixedNodeSet.has(v1219)) {
                          v1200.fixedNodesOnVertical.add("dummy" + v1202);
                        }
                      });
                    }
                  }
                }
                if (v1161.RELAX_MOVEMENT_ON_CONSTRAINTS) {
                  this.shuffle = function (v1220) {
                    var v1221;
                    var v1222;
                    var v1223;
                    for (v1223 = v1220.length - 1; v1223 >= v1220.length * 2 / 3; v1223--) {
                      v1221 = Math.floor(Math.random() * (v1223 + 1));
                      v1222 = v1220[v1223];
                      v1220[v1223] = v1220[v1221];
                      v1220[v1221] = v1222;
                    }
                    return v1220;
                  };
                  this.nodesInRelativeHorizontal = [];
                  this.nodesInRelativeVertical = [];
                  this.nodeToRelativeConstraintMapHorizontal = new Map();
                  this.nodeToRelativeConstraintMapVertical = new Map();
                  this.nodeToTempPositionMapHorizontal = new Map();
                  this.nodeToTempPositionMapVertical = new Map();
                  this.constraints.relativePlacementConstraint.forEach(function (v1224) {
                    if (v1224.left) {
                      var v1225 = v1213.has(v1224.left) ? v1213.get(v1224.left) : v1224.left;
                      var v1226 = v1213.has(v1224.right) ? v1213.get(v1224.right) : v1224.right;
                      if (!v1200.nodesInRelativeHorizontal.includes(v1225)) {
                        v1200.nodesInRelativeHorizontal.push(v1225);
                        v1200.nodeToRelativeConstraintMapHorizontal.set(v1225, []);
                        if (v1200.dummyToNodeForVerticalAlignment.has(v1225)) {
                          v1200.nodeToTempPositionMapHorizontal.set(v1225, v1200.idToNodeMap.get(v1200.dummyToNodeForVerticalAlignment.get(v1225)[0]).getCenterX());
                        } else {
                          v1200.nodeToTempPositionMapHorizontal.set(v1225, v1200.idToNodeMap.get(v1225).getCenterX());
                        }
                      }
                      if (!v1200.nodesInRelativeHorizontal.includes(v1226)) {
                        v1200.nodesInRelativeHorizontal.push(v1226);
                        v1200.nodeToRelativeConstraintMapHorizontal.set(v1226, []);
                        if (v1200.dummyToNodeForVerticalAlignment.has(v1226)) {
                          v1200.nodeToTempPositionMapHorizontal.set(v1226, v1200.idToNodeMap.get(v1200.dummyToNodeForVerticalAlignment.get(v1226)[0]).getCenterX());
                        } else {
                          v1200.nodeToTempPositionMapHorizontal.set(v1226, v1200.idToNodeMap.get(v1226).getCenterX());
                        }
                      }
                      v1200.nodeToRelativeConstraintMapHorizontal.get(v1225).push({
                        right: v1226,
                        gap: v1224.gap
                      });
                      v1200.nodeToRelativeConstraintMapHorizontal.get(v1226).push({
                        left: v1225,
                        gap: v1224.gap
                      });
                    } else {
                      var v1227 = v1214.has(v1224.top) ? v1214.get(v1224.top) : v1224.top;
                      var v1228 = v1214.has(v1224.bottom) ? v1214.get(v1224.bottom) : v1224.bottom;
                      if (!v1200.nodesInRelativeVertical.includes(v1227)) {
                        v1200.nodesInRelativeVertical.push(v1227);
                        v1200.nodeToRelativeConstraintMapVertical.set(v1227, []);
                        if (v1200.dummyToNodeForHorizontalAlignment.has(v1227)) {
                          v1200.nodeToTempPositionMapVertical.set(v1227, v1200.idToNodeMap.get(v1200.dummyToNodeForHorizontalAlignment.get(v1227)[0]).getCenterY());
                        } else {
                          v1200.nodeToTempPositionMapVertical.set(v1227, v1200.idToNodeMap.get(v1227).getCenterY());
                        }
                      }
                      if (!v1200.nodesInRelativeVertical.includes(v1228)) {
                        v1200.nodesInRelativeVertical.push(v1228);
                        v1200.nodeToRelativeConstraintMapVertical.set(v1228, []);
                        if (v1200.dummyToNodeForHorizontalAlignment.has(v1228)) {
                          v1200.nodeToTempPositionMapVertical.set(v1228, v1200.idToNodeMap.get(v1200.dummyToNodeForHorizontalAlignment.get(v1228)[0]).getCenterY());
                        } else {
                          v1200.nodeToTempPositionMapVertical.set(v1228, v1200.idToNodeMap.get(v1228).getCenterY());
                        }
                      }
                      v1200.nodeToRelativeConstraintMapVertical.get(v1227).push({
                        bottom: v1228,
                        gap: v1224.gap
                      });
                      v1200.nodeToRelativeConstraintMapVertical.get(v1228).push({
                        top: v1227,
                        gap: v1224.gap
                      });
                    }
                  });
                } else {
                  var v1229 = new Map();
                  var v1230 = new Map();
                  this.constraints.relativePlacementConstraint.forEach(function (v1231) {
                    if (v1231.left) {
                      var v1232 = v1213.has(v1231.left) ? v1213.get(v1231.left) : v1231.left;
                      var v1233 = v1213.has(v1231.right) ? v1213.get(v1231.right) : v1231.right;
                      if (v1229.has(v1232)) {
                        v1229.get(v1232).push(v1233);
                      } else {
                        v1229.set(v1232, [v1233]);
                      }
                      if (v1229.has(v1233)) {
                        v1229.get(v1233).push(v1232);
                      } else {
                        v1229.set(v1233, [v1232]);
                      }
                    } else {
                      var v1234 = v1214.has(v1231.top) ? v1214.get(v1231.top) : v1231.top;
                      var v1235 = v1214.has(v1231.bottom) ? v1214.get(v1231.bottom) : v1231.bottom;
                      if (v1230.has(v1234)) {
                        v1230.get(v1234).push(v1235);
                      } else {
                        v1230.set(v1234, [v1235]);
                      }
                      if (v1230.has(v1235)) {
                        v1230.get(v1235).push(v1234);
                      } else {
                        v1230.set(v1235, [v1234]);
                      }
                    }
                  });
                  var v1236 = function v1237(v1238, v1239) {
                    var v1240 = [];
                    var v1241 = [];
                    var v1242 = new v1173();
                    var v1243 = new Set();
                    var v1244 = 0;
                    v1238.forEach(function (v1245, v1246) {
                      if (!v1243.has(v1246)) {
                        v1240[v1244] = [];
                        v1241[v1244] = false;
                        var v1247 = v1246;
                        v1242.push(v1247);
                        v1243.add(v1247);
                        v1240[v1244].push(v1247);
                        while (v1242.length != 0) {
                          v1247 = v1242.shift();
                          if (v1239.has(v1247)) {
                            v1241[v1244] = true;
                          }
                          var v1248 = v1238.get(v1247);
                          v1248.forEach(function (v1249) {
                            if (!v1243.has(v1249)) {
                              v1242.push(v1249);
                              v1243.add(v1249);
                              v1240[v1244].push(v1249);
                            }
                          });
                        }
                        v1244++;
                      }
                    });
                    return {
                      components: v1240,
                      isFixed: v1241
                    };
                  };
                  var v1250 = v1236(v1229, v1200.fixedNodesOnHorizontal);
                  this.componentsOnHorizontal = v1250.components;
                  this.fixedComponentsOnHorizontal = v1250.isFixed;
                  var v1251 = v1236(v1230, v1200.fixedNodesOnVertical);
                  this.componentsOnVertical = v1251.components;
                  this.fixedComponentsOnVertical = v1251.isFixed;
                }
              }
            };
            v1174.prototype.updateDisplacements = function () {
              var v1252 = this;
              if (this.constraints.fixedNodeConstraint) {
                this.constraints.fixedNodeConstraint.forEach(function (v1253) {
                  var v1254 = v1252.idToNodeMap.get(v1253.nodeId);
                  v1254.displacementX = 0;
                  v1254.displacementY = 0;
                });
              }
              if (this.constraints.alignmentConstraint) {
                if (this.constraints.alignmentConstraint.vertical) {
                  var v1255 = this.constraints.alignmentConstraint.vertical;
                  for (var v1256 = 0; v1256 < v1255.length; v1256++) {
                    var v1257 = 0;
                    for (var v1258 = 0; v1258 < v1255[v1256].length; v1258++) {
                      if (this.fixedNodeSet.has(v1255[v1256][v1258])) {
                        v1257 = 0;
                        break;
                      }
                      v1257 += this.idToNodeMap.get(v1255[v1256][v1258]).displacementX;
                    }
                    var v1259 = v1257 / v1255[v1256].length;
                    for (var v1258 = 0; v1258 < v1255[v1256].length; v1258++) {
                      this.idToNodeMap.get(v1255[v1256][v1258]).displacementX = v1259;
                    }
                  }
                }
                if (this.constraints.alignmentConstraint.horizontal) {
                  var v1260 = this.constraints.alignmentConstraint.horizontal;
                  for (var v1256 = 0; v1256 < v1260.length; v1256++) {
                    var v1261 = 0;
                    for (var v1258 = 0; v1258 < v1260[v1256].length; v1258++) {
                      if (this.fixedNodeSet.has(v1260[v1256][v1258])) {
                        v1261 = 0;
                        break;
                      }
                      v1261 += this.idToNodeMap.get(v1260[v1256][v1258]).displacementY;
                    }
                    var v1262 = v1261 / v1260[v1256].length;
                    for (var v1258 = 0; v1258 < v1260[v1256].length; v1258++) {
                      this.idToNodeMap.get(v1260[v1256][v1258]).displacementY = v1262;
                    }
                  }
                }
              }
              if (this.constraints.relativePlacementConstraint) {
                if (v1161.RELAX_MOVEMENT_ON_CONSTRAINTS) {
                  if (this.totalIterations % 10 == 0) {
                    this.shuffle(this.nodesInRelativeHorizontal);
                    this.shuffle(this.nodesInRelativeVertical);
                  }
                  this.nodesInRelativeHorizontal.forEach(function (v1263) {
                    if (!v1252.fixedNodesOnHorizontal.has(v1263)) {
                      var v1264 = 0;
                      if (v1252.dummyToNodeForVerticalAlignment.has(v1263)) {
                        v1264 = v1252.idToNodeMap.get(v1252.dummyToNodeForVerticalAlignment.get(v1263)[0]).displacementX;
                      } else {
                        v1264 = v1252.idToNodeMap.get(v1263).displacementX;
                      }
                      v1252.nodeToRelativeConstraintMapHorizontal.get(v1263).forEach(function (v1265) {
                        if (v1265.right) {
                          var v1266 = v1252.nodeToTempPositionMapHorizontal.get(v1265.right) - v1252.nodeToTempPositionMapHorizontal.get(v1263) - v1264;
                          if (v1266 < v1265.gap) {
                            v1264 -= v1265.gap - v1266;
                          }
                        } else {
                          var v1266 = v1252.nodeToTempPositionMapHorizontal.get(v1263) - v1252.nodeToTempPositionMapHorizontal.get(v1265.left) + v1264;
                          if (v1266 < v1265.gap) {
                            v1264 += v1265.gap - v1266;
                          }
                        }
                      });
                      v1252.nodeToTempPositionMapHorizontal.set(v1263, v1252.nodeToTempPositionMapHorizontal.get(v1263) + v1264);
                      if (v1252.dummyToNodeForVerticalAlignment.has(v1263)) {
                        v1252.dummyToNodeForVerticalAlignment.get(v1263).forEach(function (v1267) {
                          v1252.idToNodeMap.get(v1267).displacementX = v1264;
                        });
                      } else {
                        v1252.idToNodeMap.get(v1263).displacementX = v1264;
                      }
                    }
                  });
                  this.nodesInRelativeVertical.forEach(function (v1268) {
                    if (!v1252.fixedNodesOnHorizontal.has(v1268)) {
                      var v1269 = 0;
                      if (v1252.dummyToNodeForHorizontalAlignment.has(v1268)) {
                        v1269 = v1252.idToNodeMap.get(v1252.dummyToNodeForHorizontalAlignment.get(v1268)[0]).displacementY;
                      } else {
                        v1269 = v1252.idToNodeMap.get(v1268).displacementY;
                      }
                      v1252.nodeToRelativeConstraintMapVertical.get(v1268).forEach(function (v1270) {
                        if (v1270.bottom) {
                          var v1271 = v1252.nodeToTempPositionMapVertical.get(v1270.bottom) - v1252.nodeToTempPositionMapVertical.get(v1268) - v1269;
                          if (v1271 < v1270.gap) {
                            v1269 -= v1270.gap - v1271;
                          }
                        } else {
                          var v1271 = v1252.nodeToTempPositionMapVertical.get(v1268) - v1252.nodeToTempPositionMapVertical.get(v1270.top) + v1269;
                          if (v1271 < v1270.gap) {
                            v1269 += v1270.gap - v1271;
                          }
                        }
                      });
                      v1252.nodeToTempPositionMapVertical.set(v1268, v1252.nodeToTempPositionMapVertical.get(v1268) + v1269);
                      if (v1252.dummyToNodeForHorizontalAlignment.has(v1268)) {
                        v1252.dummyToNodeForHorizontalAlignment.get(v1268).forEach(function (v1272) {
                          v1252.idToNodeMap.get(v1272).displacementY = v1269;
                        });
                      } else {
                        v1252.idToNodeMap.get(v1268).displacementY = v1269;
                      }
                    }
                  });
                } else {
                  for (var v1256 = 0; v1256 < this.componentsOnHorizontal.length; v1256++) {
                    var v1273 = this.componentsOnHorizontal[v1256];
                    if (this.fixedComponentsOnHorizontal[v1256]) {
                      for (var v1258 = 0; v1258 < v1273.length; v1258++) {
                        if (this.dummyToNodeForVerticalAlignment.has(v1273[v1258])) {
                          this.dummyToNodeForVerticalAlignment.get(v1273[v1258]).forEach(function (v1274) {
                            v1252.idToNodeMap.get(v1274).displacementX = 0;
                          });
                        } else {
                          this.idToNodeMap.get(v1273[v1258]).displacementX = 0;
                        }
                      }
                    } else {
                      var v1275 = 0;
                      var v1276 = 0;
                      for (var v1258 = 0; v1258 < v1273.length; v1258++) {
                        if (this.dummyToNodeForVerticalAlignment.has(v1273[v1258])) {
                          var v1277 = this.dummyToNodeForVerticalAlignment.get(v1273[v1258]);
                          v1275 += v1277.length * this.idToNodeMap.get(v1277[0]).displacementX;
                          v1276 += v1277.length;
                        } else {
                          v1275 += this.idToNodeMap.get(v1273[v1258]).displacementX;
                          v1276++;
                        }
                      }
                      var v1278 = v1275 / v1276;
                      for (var v1258 = 0; v1258 < v1273.length; v1258++) {
                        if (this.dummyToNodeForVerticalAlignment.has(v1273[v1258])) {
                          this.dummyToNodeForVerticalAlignment.get(v1273[v1258]).forEach(function (v1279) {
                            v1252.idToNodeMap.get(v1279).displacementX = v1278;
                          });
                        } else {
                          this.idToNodeMap.get(v1273[v1258]).displacementX = v1278;
                        }
                      }
                    }
                  }
                  for (var v1256 = 0; v1256 < this.componentsOnVertical.length; v1256++) {
                    var v1273 = this.componentsOnVertical[v1256];
                    if (this.fixedComponentsOnVertical[v1256]) {
                      for (var v1258 = 0; v1258 < v1273.length; v1258++) {
                        if (this.dummyToNodeForHorizontalAlignment.has(v1273[v1258])) {
                          this.dummyToNodeForHorizontalAlignment.get(v1273[v1258]).forEach(function (v1280) {
                            v1252.idToNodeMap.get(v1280).displacementY = 0;
                          });
                        } else {
                          this.idToNodeMap.get(v1273[v1258]).displacementY = 0;
                        }
                      }
                    } else {
                      var v1275 = 0;
                      var v1276 = 0;
                      for (var v1258 = 0; v1258 < v1273.length; v1258++) {
                        if (this.dummyToNodeForHorizontalAlignment.has(v1273[v1258])) {
                          var v1277 = this.dummyToNodeForHorizontalAlignment.get(v1273[v1258]);
                          v1275 += v1277.length * this.idToNodeMap.get(v1277[0]).displacementY;
                          v1276 += v1277.length;
                        } else {
                          v1275 += this.idToNodeMap.get(v1273[v1258]).displacementY;
                          v1276++;
                        }
                      }
                      var v1278 = v1275 / v1276;
                      for (var v1258 = 0; v1258 < v1273.length; v1258++) {
                        if (this.dummyToNodeForHorizontalAlignment.has(v1273[v1258])) {
                          this.dummyToNodeForHorizontalAlignment.get(v1273[v1258]).forEach(function (v1281) {
                            v1252.idToNodeMap.get(v1281).displacementY = v1278;
                          });
                        } else {
                          this.idToNodeMap.get(v1273[v1258]).displacementY = v1278;
                        }
                      }
                    }
                  }
                }
              }
            };
            v1174.prototype.calculateNodesToApplyGravitationTo = function () {
              var v1282 = [];
              var v1283;
              var v1284 = this.graphManager.getGraphs();
              var v1285 = v1284.length;
              var v1286;
              for (v1286 = 0; v1286 < v1285; v1286++) {
                v1283 = v1284[v1286];
                v1283.updateConnected();
                if (!v1283.isConnected) {
                  v1282 = v1282.concat(v1283.getNodes());
                }
              }
              return v1282;
            };
            v1174.prototype.createBendpoints = function () {
              var v1287 = [];
              v1287 = v1287.concat(this.graphManager.getAllEdges());
              var v1288 = new Set();
              var v1289;
              for (v1289 = 0; v1289 < v1287.length; v1289++) {
                var v1290 = v1287[v1289];
                if (!v1288.has(v1290)) {
                  var v1291 = v1290.getSource();
                  var v1292 = v1290.getTarget();
                  if (v1291 == v1292) {
                    v1290.getBendpoints().push(new v1166());
                    v1290.getBendpoints().push(new v1166());
                    this.createDummyNodesForBendpoints(v1290);
                    v1288.add(v1290);
                  } else {
                    var v1293 = [];
                    v1293 = v1293.concat(v1291.getEdgeListToNode(v1292));
                    v1293 = v1293.concat(v1292.getEdgeListToNode(v1291));
                    if (!v1288.has(v1293[0])) {
                      if (v1293.length > 1) {
                        var v1294;
                        for (v1294 = 0; v1294 < v1293.length; v1294++) {
                          var v1295 = v1293[v1294];
                          v1295.getBendpoints().push(new v1166());
                          this.createDummyNodesForBendpoints(v1295);
                        }
                      }
                      v1293.forEach(function (v1296) {
                        v1288.add(v1296);
                      });
                    }
                  }
                }
                if (v1288.size == v1287.length) {
                  break;
                }
              }
            };
            v1174.prototype.positionNodesRadially = function (v1297) {
              var v1298 = new v1165(0, 0);
              var v1299 = Math.ceil(Math.sqrt(v1297.length));
              var v1300 = 0;
              var v1301 = 0;
              var v1302 = 0;
              var v1303 = new v1166(0, 0);
              for (var v1304 = 0; v1304 < v1297.length; v1304++) {
                if (v1304 % v1299 == 0) {
                  v1302 = 0;
                  v1301 = v1300;
                  if (v1304 != 0) {
                    v1301 += v1161.DEFAULT_COMPONENT_SEPERATION;
                  }
                  v1300 = 0;
                }
                var v1305 = v1297[v1304];
                var v1306 = v1168.findCenterOfTree(v1305);
                v1298.x = v1302;
                v1298.y = v1301;
                v1303 = v1174.radialLayout(v1305, v1306, v1298);
                if (v1303.y > v1300) {
                  v1300 = Math.floor(v1303.y);
                }
                v1302 = Math.floor(v1303.x + v1161.DEFAULT_COMPONENT_SEPERATION);
              }
              this.transform(new v1166(v1164.WORLD_CENTER_X - v1303.x / 2, v1164.WORLD_CENTER_Y - v1303.y / 2));
            };
            v1174.radialLayout = function (v1307, v1308, v1309) {
              var v1310 = Math.max(this.maxDiagonalInTree(v1307), v1161.DEFAULT_RADIAL_SEPARATION);
              v1174.branchRadialLayout(v1308, null, 0, 359, 0, v1310);
              var v1311 = v1171.calculateBounds(v1307);
              var v1312 = new v1172();
              v1312.setDeviceOrgX(v1311.getMinX());
              v1312.setDeviceOrgY(v1311.getMinY());
              v1312.setWorldOrgX(v1309.x);
              v1312.setWorldOrgY(v1309.y);
              for (var v1313 = 0; v1313 < v1307.length; v1313++) {
                var v1314 = v1307[v1313];
                v1314.transform(v1312);
              }
              var v1315 = new v1166(v1311.getMaxX(), v1311.getMaxY());
              return v1312.inverseTransformPoint(v1315);
            };
            v1174.branchRadialLayout = function (v1316, v1317, v1318, v1319, v1320, v1321) {
              var v1322 = (v1319 - v1318 + 1) / 2;
              if (v1322 < 0) {
                v1322 += 180;
              }
              var v1323 = (v1322 + v1318) % 360;
              var v1324 = v1323 * v1170.TWO_PI / 360;
              var v1325 = v1320 * Math.cos(v1324);
              var v1326 = v1320 * Math.sin(v1324);
              v1316.setCenter(v1325, v1326);
              var v1327 = [];
              v1327 = v1327.concat(v1316.getEdges());
              var v1328 = v1327.length;
              if (v1317 != null) {
                v1328--;
              }
              var v1329 = 0;
              var v1330 = v1327.length;
              var v1331;
              var v1332 = v1316.getEdgesBetween(v1317);
              while (v1332.length > 1) {
                var v1333 = v1332[0];
                v1332.splice(0, 1);
                var v1334 = v1327.indexOf(v1333);
                if (v1334 >= 0) {
                  v1327.splice(v1334, 1);
                }
                v1330--;
                v1328--;
              }
              if (v1317 != null) {
                v1331 = (v1327.indexOf(v1332[0]) + 1) % v1330;
              } else {
                v1331 = 0;
              }
              var v1335 = Math.abs(v1319 - v1318) / v1328;
              for (var v1336 = v1331; v1329 != v1328; v1336 = ++v1336 % v1330) {
                var v1337 = v1327[v1336].getOtherEnd(v1316);
                if (v1337 == v1317) {
                  continue;
                }
                var v1338 = (v1318 + v1329 * v1335) % 360;
                var v1339 = (v1338 + v1335) % 360;
                v1174.branchRadialLayout(v1337, v1316, v1338, v1339, v1320 + v1321, v1321);
                v1329++;
              }
            };
            v1174.maxDiagonalInTree = function (v1340) {
              var v1341 = v1169.MIN_VALUE;
              for (var v1342 = 0; v1342 < v1340.length; v1342++) {
                var v1343 = v1340[v1342];
                var v1344 = v1343.getDiagonal();
                if (v1344 > v1341) {
                  v1341 = v1344;
                }
              }
              return v1341;
            };
            v1174.prototype.calcRepulsionRange = function () {
              return (this.level + 1) * 2 * this.idealEdgeLength;
            };
            v1174.prototype.groupZeroDegreeMembers = function () {
              var v1345 = this;
              var v1346 = {};
              this.memberGroups = {};
              this.idToDummyNode = {};
              var v1347 = [];
              var v1348 = this.graphManager.getAllNodes();
              for (var v1349 = 0; v1349 < v1348.length; v1349++) {
                var v1350 = v1348[v1349];
                var v1351 = v1350.getParent();
                if (this.getNodeDegreeWithChildren(v1350) === 0 && (v1351.id == undefined || !this.getToBeTiled(v1351))) {
                  v1347.push(v1350);
                }
              }
              for (var v1349 = 0; v1349 < v1347.length; v1349++) {
                var v1350 = v1347[v1349];
                var v1352 = v1350.getParent().id;
                if (typeof v1346[v1352] === "undefined") {
                  v1346[v1352] = [];
                }
                v1346[v1352] = v1346[v1352].concat(v1350);
              }
              Object.keys(v1346).forEach(function (v1353) {
                if (v1346[v1353].length > 1) {
                  var v1354 = "DummyCompound_" + v1353;
                  v1345.memberGroups[v1354] = v1346[v1353];
                  var v1355 = v1346[v1353][0].getParent();
                  var v1356 = new v1159(v1345.graphManager);
                  v1356.id = v1354;
                  v1356.paddingLeft = v1355.paddingLeft || 0;
                  v1356.paddingRight = v1355.paddingRight || 0;
                  v1356.paddingBottom = v1355.paddingBottom || 0;
                  v1356.paddingTop = v1355.paddingTop || 0;
                  v1345.idToDummyNode[v1354] = v1356;
                  var v1357 = v1345.getGraphManager().add(v1345.newGraph(), v1356);
                  var v1358 = v1355.getChild();
                  v1358.add(v1356);
                  for (var v1359 = 0; v1359 < v1346[v1353].length; v1359++) {
                    var v1360 = v1346[v1353][v1359];
                    v1358.remove(v1360);
                    v1357.add(v1360);
                  }
                }
              });
            };
            v1174.prototype.clearCompounds = function () {
              var v1361 = {};
              var v1362 = {};
              this.performDFSOnCompounds();
              for (var v1363 = 0; v1363 < this.compoundOrder.length; v1363++) {
                v1362[this.compoundOrder[v1363].id] = this.compoundOrder[v1363];
                v1361[this.compoundOrder[v1363].id] = [].concat(this.compoundOrder[v1363].getChild().getNodes());
                this.graphManager.remove(this.compoundOrder[v1363].getChild());
                this.compoundOrder[v1363].child = null;
              }
              this.graphManager.resetAllNodes();
              this.tileCompoundMembers(v1361, v1362);
            };
            v1174.prototype.clearZeroDegreeMembers = function () {
              var v1364 = this;
              var v1365 = this.tiledZeroDegreePack = [];
              Object.keys(this.memberGroups).forEach(function (v1366) {
                var v1367 = v1364.idToDummyNode[v1366];
                v1365[v1366] = v1364.tileNodes(v1364.memberGroups[v1366], v1367.paddingLeft + v1367.paddingRight);
                v1367.rect.width = v1365[v1366].width;
                v1367.rect.height = v1365[v1366].height;
                v1367.setCenter(v1365[v1366].centerX, v1365[v1366].centerY);
                v1367.labelMarginLeft = 0;
                v1367.labelMarginTop = 0;
                if (v1161.NODE_DIMENSIONS_INCLUDE_LABELS) {
                  var v1368 = v1367.rect.width;
                  var v1369 = v1367.rect.height;
                  if (v1367.labelWidth) {
                    if (v1367.labelPosHorizontal == "left") {
                      v1367.rect.x -= v1367.labelWidth;
                      v1367.setWidth(v1368 + v1367.labelWidth);
                      v1367.labelMarginLeft = v1367.labelWidth;
                    } else if (v1367.labelPosHorizontal == "center" && v1367.labelWidth > v1368) {
                      v1367.rect.x -= (v1367.labelWidth - v1368) / 2;
                      v1367.setWidth(v1367.labelWidth);
                      v1367.labelMarginLeft = (v1367.labelWidth - v1368) / 2;
                    } else if (v1367.labelPosHorizontal == "right") {
                      v1367.setWidth(v1368 + v1367.labelWidth);
                    }
                  }
                  if (v1367.labelHeight) {
                    if (v1367.labelPosVertical == "top") {
                      v1367.rect.y -= v1367.labelHeight;
                      v1367.setHeight(v1369 + v1367.labelHeight);
                      v1367.labelMarginTop = v1367.labelHeight;
                    } else if (v1367.labelPosVertical == "center" && v1367.labelHeight > v1369) {
                      v1367.rect.y -= (v1367.labelHeight - v1369) / 2;
                      v1367.setHeight(v1367.labelHeight);
                      v1367.labelMarginTop = (v1367.labelHeight - v1369) / 2;
                    } else if (v1367.labelPosVertical == "bottom") {
                      v1367.setHeight(v1369 + v1367.labelHeight);
                    }
                  }
                }
              });
            };
            v1174.prototype.repopulateCompounds = function () {
              for (var v1370 = this.compoundOrder.length - 1; v1370 >= 0; v1370--) {
                var v1371 = this.compoundOrder[v1370];
                var v1372 = v1371.id;
                var v1373 = v1371.paddingLeft;
                var v1374 = v1371.paddingTop;
                var v1375 = v1371.labelMarginLeft;
                var v1376 = v1371.labelMarginTop;
                this.adjustLocations(this.tiledMemberPack[v1372], v1371.rect.x, v1371.rect.y, v1373, v1374, v1375, v1376);
              }
            };
            v1174.prototype.repopulateZeroDegreeMembers = function () {
              var v1377 = this;
              var v1378 = this.tiledZeroDegreePack;
              Object.keys(v1378).forEach(function (v1379) {
                var v1380 = v1377.idToDummyNode[v1379];
                var v1381 = v1380.paddingLeft;
                var v1382 = v1380.paddingTop;
                var v1383 = v1380.labelMarginLeft;
                var v1384 = v1380.labelMarginTop;
                v1377.adjustLocations(v1378[v1379], v1380.rect.x, v1380.rect.y, v1381, v1382, v1383, v1384);
              });
            };
            v1174.prototype.getToBeTiled = function (v1385) {
              var v1386 = v1385.id;
              if (this.toBeTiled[v1386] != null) {
                return this.toBeTiled[v1386];
              }
              var v1387 = v1385.getChild();
              if (v1387 == null) {
                this.toBeTiled[v1386] = false;
                return false;
              }
              var v1388 = v1387.getNodes();
              for (var v1389 = 0; v1389 < v1388.length; v1389++) {
                var v1390 = v1388[v1389];
                if (this.getNodeDegree(v1390) > 0) {
                  this.toBeTiled[v1386] = false;
                  return false;
                }
                if (v1390.getChild() == null) {
                  this.toBeTiled[v1390.id] = false;
                  continue;
                }
                if (!this.getToBeTiled(v1390)) {
                  this.toBeTiled[v1386] = false;
                  return false;
                }
              }
              this.toBeTiled[v1386] = true;
              return true;
            };
            v1174.prototype.getNodeDegree = function (v1391) {
              v1391.id;
              var v1392 = v1391.getEdges();
              var v1393 = 0;
              for (var v1394 = 0; v1394 < v1392.length; v1394++) {
                var v1395 = v1392[v1394];
                if (v1395.getSource().id !== v1395.getTarget().id) {
                  v1393 = v1393 + 1;
                }
              }
              return v1393;
            };
            v1174.prototype.getNodeDegreeWithChildren = function (v1396) {
              var v1397 = this.getNodeDegree(v1396);
              if (v1396.getChild() == null) {
                return v1397;
              }
              var v1398 = v1396.getChild().getNodes();
              for (var v1399 = 0; v1399 < v1398.length; v1399++) {
                var v1400 = v1398[v1399];
                v1397 += this.getNodeDegreeWithChildren(v1400);
              }
              return v1397;
            };
            v1174.prototype.performDFSOnCompounds = function () {
              this.compoundOrder = [];
              this.fillCompexOrderByDFS(this.graphManager.getRoot().getNodes());
            };
            v1174.prototype.fillCompexOrderByDFS = function (v1401) {
              for (var v1402 = 0; v1402 < v1401.length; v1402++) {
                var v1403 = v1401[v1402];
                if (v1403.getChild() != null) {
                  this.fillCompexOrderByDFS(v1403.getChild().getNodes());
                }
                if (this.getToBeTiled(v1403)) {
                  this.compoundOrder.push(v1403);
                }
              }
            };
            v1174.prototype.adjustLocations = function (v1404, v1405, v1406, v1407, v1408, v1409, v1410) {
              v1405 += v1407 + v1409;
              v1406 += v1408 + v1410;
              var v1411 = v1405;
              for (var v1412 = 0; v1412 < v1404.rows.length; v1412++) {
                var v1413 = v1404.rows[v1412];
                v1405 = v1411;
                var v1414 = 0;
                for (var v1415 = 0; v1415 < v1413.length; v1415++) {
                  var v1416 = v1413[v1415];
                  v1416.rect.x = v1405;
                  v1416.rect.y = v1406;
                  v1405 += v1416.rect.width + v1404.horizontalPadding;
                  if (v1416.rect.height > v1414) {
                    v1414 = v1416.rect.height;
                  }
                }
                v1406 += v1414 + v1404.verticalPadding;
              }
            };
            v1174.prototype.tileCompoundMembers = function (v1417, v1418) {
              var v1419 = this;
              this.tiledMemberPack = [];
              Object.keys(v1417).forEach(function (v1420) {
                var v1421 = v1418[v1420];
                v1419.tiledMemberPack[v1420] = v1419.tileNodes(v1417[v1420], v1421.paddingLeft + v1421.paddingRight);
                v1421.rect.width = v1419.tiledMemberPack[v1420].width;
                v1421.rect.height = v1419.tiledMemberPack[v1420].height;
                v1421.setCenter(v1419.tiledMemberPack[v1420].centerX, v1419.tiledMemberPack[v1420].centerY);
                v1421.labelMarginLeft = 0;
                v1421.labelMarginTop = 0;
                if (v1161.NODE_DIMENSIONS_INCLUDE_LABELS) {
                  var v1422 = v1421.rect.width;
                  var v1423 = v1421.rect.height;
                  if (v1421.labelWidth) {
                    if (v1421.labelPosHorizontal == "left") {
                      v1421.rect.x -= v1421.labelWidth;
                      v1421.setWidth(v1422 + v1421.labelWidth);
                      v1421.labelMarginLeft = v1421.labelWidth;
                    } else if (v1421.labelPosHorizontal == "center" && v1421.labelWidth > v1422) {
                      v1421.rect.x -= (v1421.labelWidth - v1422) / 2;
                      v1421.setWidth(v1421.labelWidth);
                      v1421.labelMarginLeft = (v1421.labelWidth - v1422) / 2;
                    } else if (v1421.labelPosHorizontal == "right") {
                      v1421.setWidth(v1422 + v1421.labelWidth);
                    }
                  }
                  if (v1421.labelHeight) {
                    if (v1421.labelPosVertical == "top") {
                      v1421.rect.y -= v1421.labelHeight;
                      v1421.setHeight(v1423 + v1421.labelHeight);
                      v1421.labelMarginTop = v1421.labelHeight;
                    } else if (v1421.labelPosVertical == "center" && v1421.labelHeight > v1423) {
                      v1421.rect.y -= (v1421.labelHeight - v1423) / 2;
                      v1421.setHeight(v1421.labelHeight);
                      v1421.labelMarginTop = (v1421.labelHeight - v1423) / 2;
                    } else if (v1421.labelPosVertical == "bottom") {
                      v1421.setHeight(v1423 + v1421.labelHeight);
                    }
                  }
                }
              });
            };
            v1174.prototype.tileNodes = function (v1424, v1425) {
              var v1426 = this.tileNodesByFavoringDim(v1424, v1425, true);
              var v1427 = this.tileNodesByFavoringDim(v1424, v1425, false);
              var v1428 = this.getOrgRatio(v1426);
              var v1429 = this.getOrgRatio(v1427);
              var v1430;
              if (v1429 < v1428) {
                v1430 = v1427;
              } else {
                v1430 = v1426;
              }
              return v1430;
            };
            v1174.prototype.getOrgRatio = function (v1431) {
              var v1432 = v1431.width;
              var v1433 = v1431.height;
              var v1434 = v1432 / v1433;
              if (v1434 < 1) {
                v1434 = 1 / v1434;
              }
              return v1434;
            };
            v1174.prototype.calcIdealRowWidth = function (v1435, v1436) {
              var v1437 = v1161.TILING_PADDING_VERTICAL;
              var v1438 = v1161.TILING_PADDING_HORIZONTAL;
              var v1439 = v1435.length;
              var v1440 = 0;
              var v1441 = 0;
              var v1442 = 0;
              v1435.forEach(function (v1443) {
                v1440 += v1443.getWidth();
                v1441 += v1443.getHeight();
                if (v1443.getWidth() > v1442) {
                  v1442 = v1443.getWidth();
                }
              });
              var v1444 = v1440 / v1439;
              var v1445 = v1441 / v1439;
              var v1446 = Math.pow(v1437 - v1438, 2) + (v1444 + v1438) * 4 * (v1445 + v1437) * v1439;
              var v1447 = (v1438 - v1437 + Math.sqrt(v1446)) / ((v1444 + v1438) * 2);
              var v1448;
              if (v1436) {
                v1448 = Math.ceil(v1447);
                if (v1448 == v1447) {
                  v1448++;
                }
              } else {
                v1448 = Math.floor(v1447);
              }
              var v1449 = v1448 * (v1444 + v1438) - v1438;
              if (v1442 > v1449) {
                v1449 = v1442;
              }
              v1449 += v1438 * 2;
              return v1449;
            };
            v1174.prototype.tileNodesByFavoringDim = function (v1450, v1451, v1452) {
              var v1453 = v1161.TILING_PADDING_VERTICAL;
              var v1454 = v1161.TILING_PADDING_HORIZONTAL;
              var v1455 = v1161.TILING_COMPARE_BY;
              var v1456 = {
                rows: [],
                rowWidth: [],
                rowHeight: [],
                width: 0,
                height: v1451,
                verticalPadding: v1453,
                horizontalPadding: v1454,
                centerX: 0,
                centerY: 0
              };
              if (v1455) {
                v1456.idealRowWidth = this.calcIdealRowWidth(v1450, v1452);
              }
              var v1457 = function v1458(v1459) {
                return v1459.rect.width * v1459.rect.height;
              };
              var v1460 = function v1461(v1462, v1463) {
                return v1457(v1463) - v1457(v1462);
              };
              v1450.sort(function (v1464, v1465) {
                var v1466 = v1460;
                if (v1456.idealRowWidth) {
                  v1466 = v1455;
                  return v1466(v1464.id, v1465.id);
                }
                return v1466(v1464, v1465);
              });
              var v1467 = 0;
              var v1468 = 0;
              for (var v1469 = 0; v1469 < v1450.length; v1469++) {
                var v1470 = v1450[v1469];
                v1467 += v1470.getCenterX();
                v1468 += v1470.getCenterY();
              }
              v1456.centerX = v1467 / v1450.length;
              v1456.centerY = v1468 / v1450.length;
              for (var v1469 = 0; v1469 < v1450.length; v1469++) {
                var v1470 = v1450[v1469];
                if (v1456.rows.length == 0) {
                  this.insertNodeToRow(v1456, v1470, 0, v1451);
                } else if (this.canAddHorizontal(v1456, v1470.rect.width, v1470.rect.height)) {
                  var v1471 = v1456.rows.length - 1;
                  if (!v1456.idealRowWidth) {
                    v1471 = this.getShortestRowIndex(v1456);
                  }
                  this.insertNodeToRow(v1456, v1470, v1471, v1451);
                } else {
                  this.insertNodeToRow(v1456, v1470, v1456.rows.length, v1451);
                }
                this.shiftToLastRow(v1456);
              }
              return v1456;
            };
            v1174.prototype.insertNodeToRow = function (v1472, v1473, v1474, v1475) {
              var v1476 = v1475;
              if (v1474 == v1472.rows.length) {
                var v1477 = [];
                v1472.rows.push(v1477);
                v1472.rowWidth.push(v1476);
                v1472.rowHeight.push(0);
              }
              var v1478 = v1472.rowWidth[v1474] + v1473.rect.width;
              if (v1472.rows[v1474].length > 0) {
                v1478 += v1472.horizontalPadding;
              }
              v1472.rowWidth[v1474] = v1478;
              if (v1472.width < v1478) {
                v1472.width = v1478;
              }
              var v1479 = v1473.rect.height;
              if (v1474 > 0) {
                v1479 += v1472.verticalPadding;
              }
              var v1480 = 0;
              if (v1479 > v1472.rowHeight[v1474]) {
                v1480 = v1472.rowHeight[v1474];
                v1472.rowHeight[v1474] = v1479;
                v1480 = v1472.rowHeight[v1474] - v1480;
              }
              v1472.height += v1480;
              v1472.rows[v1474].push(v1473);
            };
            v1174.prototype.getShortestRowIndex = function (v1481) {
              var v1482 = -1;
              var v1483 = Number.MAX_VALUE;
              for (var v1484 = 0; v1484 < v1481.rows.length; v1484++) {
                if (v1481.rowWidth[v1484] < v1483) {
                  v1482 = v1484;
                  v1483 = v1481.rowWidth[v1484];
                }
              }
              return v1482;
            };
            v1174.prototype.getLongestRowIndex = function (v1485) {
              var v1486 = -1;
              var v1487 = Number.MIN_VALUE;
              for (var v1488 = 0; v1488 < v1485.rows.length; v1488++) {
                if (v1485.rowWidth[v1488] > v1487) {
                  v1486 = v1488;
                  v1487 = v1485.rowWidth[v1488];
                }
              }
              return v1486;
            };
            v1174.prototype.canAddHorizontal = function (v1489, v1490, v1491) {
              if (v1489.idealRowWidth) {
                var v1492 = v1489.rows.length - 1;
                var v1493 = v1489.rowWidth[v1492];
                return v1493 + v1490 + v1489.horizontalPadding <= v1489.idealRowWidth;
              }
              var v1494 = this.getShortestRowIndex(v1489);
              if (v1494 < 0) {
                return true;
              }
              var v1495 = v1489.rowWidth[v1494];
              if (v1495 + v1489.horizontalPadding + v1490 <= v1489.width) {
                return true;
              }
              var v1496 = 0;
              if (v1489.rowHeight[v1494] < v1491) {
                if (v1494 > 0) {
                  v1496 = v1491 + v1489.verticalPadding - v1489.rowHeight[v1494];
                }
              }
              var v1497;
              if (v1489.width - v1495 >= v1490 + v1489.horizontalPadding) {
                v1497 = (v1489.height + v1496) / (v1495 + v1490 + v1489.horizontalPadding);
              } else {
                v1497 = (v1489.height + v1496) / v1489.width;
              }
              v1496 = v1491 + v1489.verticalPadding;
              var v1498;
              if (v1489.width < v1490) {
                v1498 = (v1489.height + v1496) / v1490;
              } else {
                v1498 = (v1489.height + v1496) / v1489.width;
              }
              if (v1498 < 1) {
                v1498 = 1 / v1498;
              }
              if (v1497 < 1) {
                v1497 = 1 / v1497;
              }
              return v1497 < v1498;
            };
            v1174.prototype.shiftToLastRow = function (v1499) {
              var v1500 = this.getLongestRowIndex(v1499);
              var v1501 = v1499.rowWidth.length - 1;
              var v1502 = v1499.rows[v1500];
              var v1503 = v1502[v1502.length - 1];
              var v1504 = v1503.width + v1499.horizontalPadding;
              if (v1499.width - v1499.rowWidth[v1501] > v1504 && v1500 != v1501) {
                v1502.splice(-1, 1);
                v1499.rows[v1501].push(v1503);
                v1499.rowWidth[v1500] = v1499.rowWidth[v1500] - v1504;
                v1499.rowWidth[v1501] = v1499.rowWidth[v1501] + v1504;
                v1499.width = v1499.rowWidth[instance.getLongestRowIndex(v1499)];
                var v1505 = Number.MIN_VALUE;
                for (var v1506 = 0; v1506 < v1502.length; v1506++) {
                  if (v1502[v1506].height > v1505) {
                    v1505 = v1502[v1506].height;
                  }
                }
                if (v1500 > 0) {
                  v1505 += v1499.verticalPadding;
                }
                var v1507 = v1499.rowHeight[v1500] + v1499.rowHeight[v1501];
                v1499.rowHeight[v1500] = v1505;
                if (v1499.rowHeight[v1501] < v1503.height + v1499.verticalPadding) {
                  v1499.rowHeight[v1501] = v1503.height + v1499.verticalPadding;
                }
                var v1508 = v1499.rowHeight[v1500] + v1499.rowHeight[v1501];
                v1499.height += v1508 - v1507;
                this.shiftToLastRow(v1499);
              }
            };
            v1174.prototype.tilingPreLayout = function () {
              if (v1161.TILE) {
                this.groupZeroDegreeMembers();
                this.clearCompounds();
                this.clearZeroDegreeMembers();
              }
            };
            v1174.prototype.tilingPostLayout = function () {
              if (v1161.TILE) {
                this.repopulateZeroDegreeMembers();
                this.repopulateCompounds();
              }
            };
            v1174.prototype.reduceTrees = function () {
              var v1509 = [];
              var v1510 = true;
              var v1511;
              while (v1510) {
                var v1512 = this.graphManager.getAllNodes();
                var v1513 = [];
                v1510 = false;
                for (var v1514 = 0; v1514 < v1512.length; v1514++) {
                  v1511 = v1512[v1514];
                  if (v1511.getEdges().length == 1 && !v1511.getEdges()[0].isInterGraph && v1511.getChild() == null) {
                    if (v1161.PURE_INCREMENTAL) {
                      var v1515 = v1511.getEdges()[0].getOtherEnd(v1511);
                      var v1516 = new v1167(v1511.getCenterX() - v1515.getCenterX(), v1511.getCenterY() - v1515.getCenterY());
                      v1513.push([v1511, v1511.getEdges()[0], v1511.getOwner(), v1516]);
                    } else {
                      v1513.push([v1511, v1511.getEdges()[0], v1511.getOwner()]);
                    }
                    v1510 = true;
                  }
                }
                if (v1510 == true) {
                  var v1517 = [];
                  for (var v1518 = 0; v1518 < v1513.length; v1518++) {
                    if (v1513[v1518][0].getEdges().length == 1) {
                      v1517.push(v1513[v1518]);
                      v1513[v1518][0].getOwner().remove(v1513[v1518][0]);
                    }
                  }
                  v1509.push(v1517);
                  this.graphManager.resetAllNodes();
                  this.graphManager.resetAllEdges();
                }
              }
              this.prunedNodesAll = v1509;
            };
            v1174.prototype.growTree = function (v1519) {
              var v1520 = v1519.length;
              var v1521 = v1519[v1520 - 1];
              var v1522;
              for (var v1523 = 0; v1523 < v1521.length; v1523++) {
                v1522 = v1521[v1523];
                this.findPlaceforPrunedNode(v1522);
                v1522[2].add(v1522[0]);
                v1522[2].add(v1522[1], v1522[1].source, v1522[1].target);
              }
              v1519.splice(v1519.length - 1, 1);
              this.graphManager.resetAllNodes();
              this.graphManager.resetAllEdges();
            };
            v1174.prototype.findPlaceforPrunedNode = function (v1524) {
              var v1525;
              var v1526;
              var v1527 = v1524[0];
              if (v1527 == v1524[1].source) {
                v1526 = v1524[1].target;
              } else {
                v1526 = v1524[1].source;
              }
              if (v1161.PURE_INCREMENTAL) {
                v1527.setCenter(v1526.getCenterX() + v1524[3].getWidth(), v1526.getCenterY() + v1524[3].getHeight());
              } else {
                var v1528 = v1526.startX;
                var v1529 = v1526.finishX;
                var v1530 = v1526.startY;
                var v1531 = v1526.finishY;
                var v1532 = 0;
                var v1533 = 0;
                var v1534 = 0;
                var v1535 = 0;
                var v1536 = [v1532, v1534, v1533, v1535];
                if (v1530 > 0) {
                  for (var v1537 = v1528; v1537 <= v1529; v1537++) {
                    v1536[0] += this.grid[v1537][v1530 - 1].length + this.grid[v1537][v1530].length - 1;
                  }
                }
                if (v1529 < this.grid.length - 1) {
                  for (var v1537 = v1530; v1537 <= v1531; v1537++) {
                    v1536[1] += this.grid[v1529 + 1][v1537].length + this.grid[v1529][v1537].length - 1;
                  }
                }
                if (v1531 < this.grid[0].length - 1) {
                  for (var v1537 = v1528; v1537 <= v1529; v1537++) {
                    v1536[2] += this.grid[v1537][v1531 + 1].length + this.grid[v1537][v1531].length - 1;
                  }
                }
                if (v1528 > 0) {
                  for (var v1537 = v1530; v1537 <= v1531; v1537++) {
                    v1536[3] += this.grid[v1528 - 1][v1537].length + this.grid[v1528][v1537].length - 1;
                  }
                }
                var v1538 = v1169.MAX_VALUE;
                var v1539;
                var v1540;
                for (var v1541 = 0; v1541 < v1536.length; v1541++) {
                  if (v1536[v1541] < v1538) {
                    v1538 = v1536[v1541];
                    v1539 = 1;
                    v1540 = v1541;
                  } else if (v1536[v1541] == v1538) {
                    v1539++;
                  }
                }
                if (v1539 == 3 && v1538 == 0) {
                  if (v1536[0] == 0 && v1536[1] == 0 && v1536[2] == 0) {
                    v1525 = 1;
                  } else if (v1536[0] == 0 && v1536[1] == 0 && v1536[3] == 0) {
                    v1525 = 0;
                  } else if (v1536[0] == 0 && v1536[2] == 0 && v1536[3] == 0) {
                    v1525 = 3;
                  } else if (v1536[1] == 0 && v1536[2] == 0 && v1536[3] == 0) {
                    v1525 = 2;
                  }
                } else if (v1539 == 2 && v1538 == 0) {
                  var v1542 = Math.floor(Math.random() * 2);
                  if (v1536[0] == 0 && v1536[1] == 0) {
                    if (v1542 == 0) {
                      v1525 = 0;
                    } else {
                      v1525 = 1;
                    }
                  } else if (v1536[0] == 0 && v1536[2] == 0) {
                    if (v1542 == 0) {
                      v1525 = 0;
                    } else {
                      v1525 = 2;
                    }
                  } else if (v1536[0] == 0 && v1536[3] == 0) {
                    if (v1542 == 0) {
                      v1525 = 0;
                    } else {
                      v1525 = 3;
                    }
                  } else if (v1536[1] == 0 && v1536[2] == 0) {
                    if (v1542 == 0) {
                      v1525 = 1;
                    } else {
                      v1525 = 2;
                    }
                  } else if (v1536[1] == 0 && v1536[3] == 0) {
                    if (v1542 == 0) {
                      v1525 = 1;
                    } else {
                      v1525 = 3;
                    }
                  } else if (v1542 == 0) {
                    v1525 = 2;
                  } else {
                    v1525 = 3;
                  }
                } else if (v1539 == 4 && v1538 == 0) {
                  var v1542 = Math.floor(Math.random() * 4);
                  v1525 = v1542;
                } else {
                  v1525 = v1540;
                }
                if (v1525 == 0) {
                  v1527.setCenter(v1526.getCenterX(), v1526.getCenterY() - v1526.getHeight() / 2 - v1163.DEFAULT_EDGE_LENGTH - v1527.getHeight() / 2);
                } else if (v1525 == 1) {
                  v1527.setCenter(v1526.getCenterX() + v1526.getWidth() / 2 + v1163.DEFAULT_EDGE_LENGTH + v1527.getWidth() / 2, v1526.getCenterY());
                } else if (v1525 == 2) {
                  v1527.setCenter(v1526.getCenterX(), v1526.getCenterY() + v1526.getHeight() / 2 + v1163.DEFAULT_EDGE_LENGTH + v1527.getHeight() / 2);
                } else {
                  v1527.setCenter(v1526.getCenterX() - v1526.getWidth() / 2 - v1163.DEFAULT_EDGE_LENGTH - v1527.getWidth() / 2, v1526.getCenterY());
                }
              }
            };
            v1153.exports = v1174;
          },
          991: (v1543, v1544, v1545) => {
            var v1546 = v1545(551).FDLayoutNode;
            var v1547 = v1545(551).IMath;
            function v1548(v1549, v1550, v1551, v1552) {
              v1546.call(this, v1549, v1550, v1551, v1552);
            }
            v1548.prototype = Object.create(v1546.prototype);
            for (var v1553 in v1546) {
              v1548[v1553] = v1546[v1553];
            }
            v1548.prototype.calculateDisplacement = function () {
              var v1554 = this.graphManager.getLayout();
              if (this.getChild() != null && this.fixedNodeWeight) {
                this.displacementX += v1554.coolingFactor * (this.springForceX + this.repulsionForceX + this.gravitationForceX) / this.fixedNodeWeight;
                this.displacementY += v1554.coolingFactor * (this.springForceY + this.repulsionForceY + this.gravitationForceY) / this.fixedNodeWeight;
              } else {
                this.displacementX += v1554.coolingFactor * (this.springForceX + this.repulsionForceX + this.gravitationForceX) / this.noOfChildren;
                this.displacementY += v1554.coolingFactor * (this.springForceY + this.repulsionForceY + this.gravitationForceY) / this.noOfChildren;
              }
              if (Math.abs(this.displacementX) > v1554.coolingFactor * v1554.maxNodeDisplacement) {
                this.displacementX = v1554.coolingFactor * v1554.maxNodeDisplacement * v1547.sign(this.displacementX);
              }
              if (Math.abs(this.displacementY) > v1554.coolingFactor * v1554.maxNodeDisplacement) {
                this.displacementY = v1554.coolingFactor * v1554.maxNodeDisplacement * v1547.sign(this.displacementY);
              }
              if (this.child && this.child.getNodes().length > 0) {
                this.propogateDisplacementToChildren(this.displacementX, this.displacementY);
              }
            };
            v1548.prototype.propogateDisplacementToChildren = function (v1555, v1556) {
              var v1557 = this.getChild().getNodes();
              var v1558;
              for (var v1559 = 0; v1559 < v1557.length; v1559++) {
                v1558 = v1557[v1559];
                if (v1558.getChild() == null) {
                  v1558.displacementX += v1555;
                  v1558.displacementY += v1556;
                } else {
                  v1558.propogateDisplacementToChildren(v1555, v1556);
                }
              }
            };
            v1548.prototype.move = function () {
              var v1560 = this.graphManager.getLayout();
              if (this.child == null || this.child.getNodes().length == 0) {
                this.moveBy(this.displacementX, this.displacementY);
                v1560.totalDisplacement += Math.abs(this.displacementX) + Math.abs(this.displacementY);
              }
              this.springForceX = 0;
              this.springForceY = 0;
              this.repulsionForceX = 0;
              this.repulsionForceY = 0;
              this.gravitationForceX = 0;
              this.gravitationForceY = 0;
              this.displacementX = 0;
              this.displacementY = 0;
            };
            v1548.prototype.setPred1 = function (v1561) {
              this.pred1 = v1561;
            };
            v1548.prototype.getPred1 = function () {
              return pred1;
            };
            v1548.prototype.getPred2 = function () {
              return pred2;
            };
            v1548.prototype.setNext = function (v1562) {
              this.next = v1562;
            };
            v1548.prototype.getNext = function () {
              return next;
            };
            v1548.prototype.setProcessed = function (v1563) {
              this.processed = v1563;
            };
            v1548.prototype.isProcessed = function () {
              return processed;
            };
            v1543.exports = v1548;
          },
          902: (v1564, v1565, v1566) => {
            function v1567(v1568) {
              if (Array.isArray(v1568)) {
                for (var v1569 = 0, v1570 = Array(v1568.length); v1569 < v1568.length; v1569++) {
                  v1570[v1569] = v1568[v1569];
                }
                return v1570;
              } else {
                return Array.from(v1568);
              }
            }
            var v1571 = v1566(806);
            var v1572 = v1566(551).LinkedList;
            var v1573 = v1566(551).Matrix;
            var v1574 = v1566(551).SVD;
            function v1575() {}
            v1575.handleConstraints = function (v1576) {
              var v1577 = {
                fixedNodeConstraint: v1576.constraints.fixedNodeConstraint,
                alignmentConstraint: v1576.constraints.alignmentConstraint,
                relativePlacementConstraint: v1576.constraints.relativePlacementConstraint
              };
              var v1578 = new Map();
              var v1579 = new Map();
              var v1580 = [];
              var v1581 = [];
              var v1582 = v1576.getAllNodes();
              var v1583 = 0;
              for (var v1584 = 0; v1584 < v1582.length; v1584++) {
                var v1585 = v1582[v1584];
                if (v1585.getChild() == null) {
                  v1579.set(v1585.id, v1583++);
                  v1580.push(v1585.getCenterX());
                  v1581.push(v1585.getCenterY());
                  v1578.set(v1585.id, v1585);
                }
              }
              if (v1577.relativePlacementConstraint) {
                v1577.relativePlacementConstraint.forEach(function (v1586) {
                  if (!v1586.gap && v1586.gap != 0) {
                    if (v1586.left) {
                      v1586.gap = v1571.DEFAULT_EDGE_LENGTH + v1578.get(v1586.left).getWidth() / 2 + v1578.get(v1586.right).getWidth() / 2;
                    } else {
                      v1586.gap = v1571.DEFAULT_EDGE_LENGTH + v1578.get(v1586.top).getHeight() / 2 + v1578.get(v1586.bottom).getHeight() / 2;
                    }
                  }
                });
              }
              var v1587 = function v1588(v1589, v1590) {
                return {
                  x: v1589.x - v1590.x,
                  y: v1589.y - v1590.y
                };
              };
              var v1591 = function v1592(v1593) {
                var v1594 = 0;
                var v1595 = 0;
                v1593.forEach(function (v1596) {
                  v1594 += v1580[v1579.get(v1596)];
                  v1595 += v1581[v1579.get(v1596)];
                });
                return {
                  x: v1594 / v1593.size,
                  y: v1595 / v1593.size
                };
              };
              var v1597 = function v1598(v1599, v1600, v1601, v1602, v1603) {
                function v1604(v1605, v1606) {
                  var v1607 = new Set(v1605);
                  var v1608 = true;
                  var v1609 = false;
                  var v1610 = undefined;
                  try {
                    for (var v1611 = v1606[Symbol.iterator](), v1612; !(v1608 = (v1612 = v1611.next()).done); v1608 = true) {
                      var v1613 = v1612.value;
                      v1607.add(v1613);
                    }
                  } catch (v1614) {
                    v1609 = true;
                    v1610 = v1614;
                  } finally {
                    try {
                      if (!v1608 && v1611.return) {
                        v1611.return();
                      }
                    } finally {
                      if (v1609) {
                        throw v1610;
                      }
                    }
                  }
                  return v1607;
                }
                var v1615 = new Map();
                v1599.forEach(function (v1616, v1617) {
                  v1615.set(v1617, 0);
                });
                v1599.forEach(function (v1618, v1619) {
                  v1618.forEach(function (v1620) {
                    v1615.set(v1620.id, v1615.get(v1620.id) + 1);
                  });
                });
                var v1621 = new Map();
                var v1622 = new Map();
                var v1623 = new v1572();
                v1615.forEach(function (v1624, v1625) {
                  if (v1624 == 0) {
                    v1623.push(v1625);
                    if (!v1601) {
                      if (v1600 == "horizontal") {
                        v1621.set(v1625, v1579.has(v1625) ? v1580[v1579.get(v1625)] : v1602.get(v1625));
                      } else {
                        v1621.set(v1625, v1579.has(v1625) ? v1581[v1579.get(v1625)] : v1602.get(v1625));
                      }
                    }
                  } else {
                    v1621.set(v1625, Number.NEGATIVE_INFINITY);
                  }
                  if (v1601) {
                    v1622.set(v1625, new Set([v1625]));
                  }
                });
                if (v1601) {
                  v1603.forEach(function (v1626) {
                    var v1627 = [];
                    v1626.forEach(function (v1628) {
                      if (v1601.has(v1628)) {
                        v1627.push(v1628);
                      }
                    });
                    if (v1627.length > 0) {
                      var v1629 = 0;
                      v1627.forEach(function (v1630) {
                        if (v1600 == "horizontal") {
                          v1621.set(v1630, v1579.has(v1630) ? v1580[v1579.get(v1630)] : v1602.get(v1630));
                          v1629 += v1621.get(v1630);
                        } else {
                          v1621.set(v1630, v1579.has(v1630) ? v1581[v1579.get(v1630)] : v1602.get(v1630));
                          v1629 += v1621.get(v1630);
                        }
                      });
                      v1629 = v1629 / v1627.length;
                      v1626.forEach(function (v1631) {
                        if (!v1601.has(v1631)) {
                          v1621.set(v1631, v1629);
                        }
                      });
                    } else {
                      var v1632 = 0;
                      v1626.forEach(function (v1633) {
                        if (v1600 == "horizontal") {
                          v1632 += v1579.has(v1633) ? v1580[v1579.get(v1633)] : v1602.get(v1633);
                        } else {
                          v1632 += v1579.has(v1633) ? v1581[v1579.get(v1633)] : v1602.get(v1633);
                        }
                      });
                      v1632 = v1632 / v1626.length;
                      v1626.forEach(function (v1634) {
                        v1621.set(v1634, v1632);
                      });
                    }
                  });
                }
                var v1635 = function v1636() {
                  var v1637 = v1623.shift();
                  var v1638 = v1599.get(v1637);
                  v1638.forEach(function (v1639) {
                    if (v1621.get(v1639.id) < v1621.get(v1637) + v1639.gap) {
                      if (v1601 && v1601.has(v1639.id)) {
                        var v1640 = undefined;
                        if (v1600 == "horizontal") {
                          v1640 = v1579.has(v1639.id) ? v1580[v1579.get(v1639.id)] : v1602.get(v1639.id);
                        } else {
                          v1640 = v1579.has(v1639.id) ? v1581[v1579.get(v1639.id)] : v1602.get(v1639.id);
                        }
                        v1621.set(v1639.id, v1640);
                        if (v1640 < v1621.get(v1637) + v1639.gap) {
                          var v1641 = v1621.get(v1637) + v1639.gap - v1640;
                          v1622.get(v1637).forEach(function (v1642) {
                            v1621.set(v1642, v1621.get(v1642) - v1641);
                          });
                        }
                      } else {
                        v1621.set(v1639.id, v1621.get(v1637) + v1639.gap);
                      }
                    }
                    v1615.set(v1639.id, v1615.get(v1639.id) - 1);
                    if (v1615.get(v1639.id) == 0) {
                      v1623.push(v1639.id);
                    }
                    if (v1601) {
                      v1622.set(v1639.id, v1604(v1622.get(v1637), v1622.get(v1639.id)));
                    }
                  });
                };
                while (v1623.length != 0) {
                  v1635();
                }
                if (v1601) {
                  var v1643 = new Set();
                  v1599.forEach(function (v1644, v1645) {
                    if (v1644.length == 0) {
                      v1643.add(v1645);
                    }
                  });
                  var v1646 = [];
                  v1622.forEach(function (v1647, v1648) {
                    if (v1643.has(v1648)) {
                      var v1649 = false;
                      var v1650 = true;
                      var v1651 = false;
                      var v1652 = undefined;
                      try {
                        for (var v1653 = v1647[Symbol.iterator](), v1654; !(v1650 = (v1654 = v1653.next()).done); v1650 = true) {
                          var v1655 = v1654.value;
                          if (v1601.has(v1655)) {
                            v1649 = true;
                          }
                        }
                      } catch (v1656) {
                        v1651 = true;
                        v1652 = v1656;
                      } finally {
                        try {
                          if (!v1650 && v1653.return) {
                            v1653.return();
                          }
                        } finally {
                          if (v1651) {
                            throw v1652;
                          }
                        }
                      }
                      if (!v1649) {
                        var v1657 = false;
                        var v1658 = undefined;
                        v1646.forEach(function (v1659, v1660) {
                          if (v1659.has([].concat(v1567(v1647))[0])) {
                            v1657 = true;
                            v1658 = v1660;
                          }
                        });
                        if (!v1657) {
                          v1646.push(new Set(v1647));
                        } else {
                          v1647.forEach(function (v1661) {
                            v1646[v1658].add(v1661);
                          });
                        }
                      }
                    }
                  });
                  v1646.forEach(function (v1662, v1663) {
                    var v1664 = Number.POSITIVE_INFINITY;
                    var v1665 = Number.POSITIVE_INFINITY;
                    var v1666 = Number.NEGATIVE_INFINITY;
                    var v1667 = Number.NEGATIVE_INFINITY;
                    var v1668 = true;
                    var v1669 = false;
                    var v1670 = undefined;
                    try {
                      for (var v1671 = v1662[Symbol.iterator](), v1672; !(v1668 = (v1672 = v1671.next()).done); v1668 = true) {
                        var v1673 = v1672.value;
                        var v1674 = undefined;
                        if (v1600 == "horizontal") {
                          v1674 = v1579.has(v1673) ? v1580[v1579.get(v1673)] : v1602.get(v1673);
                        } else {
                          v1674 = v1579.has(v1673) ? v1581[v1579.get(v1673)] : v1602.get(v1673);
                        }
                        var v1675 = v1621.get(v1673);
                        if (v1674 < v1664) {
                          v1664 = v1674;
                        }
                        if (v1674 > v1666) {
                          v1666 = v1674;
                        }
                        if (v1675 < v1665) {
                          v1665 = v1675;
                        }
                        if (v1675 > v1667) {
                          v1667 = v1675;
                        }
                      }
                    } catch (v1676) {
                      v1669 = true;
                      v1670 = v1676;
                    } finally {
                      try {
                        if (!v1668 && v1671.return) {
                          v1671.return();
                        }
                      } finally {
                        if (v1669) {
                          throw v1670;
                        }
                      }
                    }
                    var v1677 = (v1664 + v1666) / 2 - (v1665 + v1667) / 2;
                    var v1678 = true;
                    var v1679 = false;
                    var v1680 = undefined;
                    try {
                      for (var v1681 = v1662[Symbol.iterator](), v1682; !(v1678 = (v1682 = v1681.next()).done); v1678 = true) {
                        var v1683 = v1682.value;
                        v1621.set(v1683, v1621.get(v1683) + v1677);
                      }
                    } catch (v1684) {
                      v1679 = true;
                      v1680 = v1684;
                    } finally {
                      try {
                        if (!v1678 && v1681.return) {
                          v1681.return();
                        }
                      } finally {
                        if (v1679) {
                          throw v1680;
                        }
                      }
                    }
                  });
                }
                return v1621;
              };
              var v1685 = function v1686(v1687) {
                var v1688 = 0;
                var v1689 = 0;
                var v1690 = 0;
                var v1691 = 0;
                v1687.forEach(function (v1692) {
                  if (v1692.left) {
                    if (v1580[v1579.get(v1692.left)] - v1580[v1579.get(v1692.right)] >= 0) {
                      v1688++;
                    } else {
                      v1689++;
                    }
                  } else if (v1581[v1579.get(v1692.top)] - v1581[v1579.get(v1692.bottom)] >= 0) {
                    v1690++;
                  } else {
                    v1691++;
                  }
                });
                if (v1688 > v1689 && v1690 > v1691) {
                  for (var v1693 = 0; v1693 < v1579.size; v1693++) {
                    v1580[v1693] = v1580[v1693] * -1;
                    v1581[v1693] = v1581[v1693] * -1;
                  }
                } else if (v1688 > v1689) {
                  for (var v1694 = 0; v1694 < v1579.size; v1694++) {
                    v1580[v1694] = v1580[v1694] * -1;
                  }
                } else if (v1690 > v1691) {
                  for (var v1695 = 0; v1695 < v1579.size; v1695++) {
                    v1581[v1695] = v1581[v1695] * -1;
                  }
                }
              };
              var v1696 = function v1697(v1698) {
                var v1699 = [];
                var v1700 = new v1572();
                var v1701 = new Set();
                var v1702 = 0;
                v1698.forEach(function (v1703, v1704) {
                  if (!v1701.has(v1704)) {
                    v1699[v1702] = [];
                    var v1705 = v1704;
                    v1700.push(v1705);
                    v1701.add(v1705);
                    v1699[v1702].push(v1705);
                    while (v1700.length != 0) {
                      v1705 = v1700.shift();
                      var v1706 = v1698.get(v1705);
                      v1706.forEach(function (v1707) {
                        if (!v1701.has(v1707.id)) {
                          v1700.push(v1707.id);
                          v1701.add(v1707.id);
                          v1699[v1702].push(v1707.id);
                        }
                      });
                    }
                    v1702++;
                  }
                });
                return v1699;
              };
              var v1708 = function v1709(v1710) {
                var v1711 = new Map();
                v1710.forEach(function (v1712, v1713) {
                  v1711.set(v1713, []);
                });
                v1710.forEach(function (v1714, v1715) {
                  v1714.forEach(function (v1716) {
                    v1711.get(v1715).push(v1716);
                    v1711.get(v1716.id).push({
                      id: v1715,
                      gap: v1716.gap,
                      direction: v1716.direction
                    });
                  });
                });
                return v1711;
              };
              var v1717 = function v1718(v1719) {
                var v1720 = new Map();
                v1719.forEach(function (v1721, v1722) {
                  v1720.set(v1722, []);
                });
                v1719.forEach(function (v1723, v1724) {
                  v1723.forEach(function (v1725) {
                    v1720.get(v1725.id).push({
                      id: v1724,
                      gap: v1725.gap,
                      direction: v1725.direction
                    });
                  });
                });
                return v1720;
              };
              var v1726 = [];
              var v1727 = [];
              var v1728 = false;
              var v1729 = false;
              var v1730 = new Set();
              var v1731 = new Map();
              var v1732 = new Map();
              var v1733 = [];
              if (v1577.fixedNodeConstraint) {
                v1577.fixedNodeConstraint.forEach(function (v1734) {
                  v1730.add(v1734.nodeId);
                });
              }
              if (v1577.relativePlacementConstraint) {
                v1577.relativePlacementConstraint.forEach(function (v1735) {
                  if (v1735.left) {
                    if (v1731.has(v1735.left)) {
                      v1731.get(v1735.left).push({
                        id: v1735.right,
                        gap: v1735.gap,
                        direction: "horizontal"
                      });
                    } else {
                      v1731.set(v1735.left, [{
                        id: v1735.right,
                        gap: v1735.gap,
                        direction: "horizontal"
                      }]);
                    }
                    if (!v1731.has(v1735.right)) {
                      v1731.set(v1735.right, []);
                    }
                  } else {
                    if (v1731.has(v1735.top)) {
                      v1731.get(v1735.top).push({
                        id: v1735.bottom,
                        gap: v1735.gap,
                        direction: "vertical"
                      });
                    } else {
                      v1731.set(v1735.top, [{
                        id: v1735.bottom,
                        gap: v1735.gap,
                        direction: "vertical"
                      }]);
                    }
                    if (!v1731.has(v1735.bottom)) {
                      v1731.set(v1735.bottom, []);
                    }
                  }
                });
                v1732 = v1708(v1731);
                v1733 = v1696(v1732);
              }
              if (v1571.TRANSFORM_ON_CONSTRAINT_HANDLING) {
                if (v1577.fixedNodeConstraint && v1577.fixedNodeConstraint.length > 1) {
                  v1577.fixedNodeConstraint.forEach(function (v1736, v1737) {
                    v1726[v1737] = [v1736.position.x, v1736.position.y];
                    v1727[v1737] = [v1580[v1579.get(v1736.nodeId)], v1581[v1579.get(v1736.nodeId)]];
                  });
                  v1728 = true;
                } else if (v1577.alignmentConstraint) {
                  (function () {
                    var v1738 = 0;
                    if (v1577.alignmentConstraint.vertical) {
                      var v1739 = v1577.alignmentConstraint.vertical;
                      var v1740 = function v1741(v1742) {
                        var v1743 = new Set();
                        v1739[v1742].forEach(function (v1744) {
                          v1743.add(v1744);
                        });
                        var v1745 = new Set([].concat(v1567(v1743)).filter(function (v1746) {
                          return v1730.has(v1746);
                        }));
                        var v1747 = undefined;
                        if (v1745.size > 0) {
                          v1747 = v1580[v1579.get(v1745.values().next().value)];
                        } else {
                          v1747 = v1591(v1743).x;
                        }
                        v1739[v1742].forEach(function (v1748) {
                          v1726[v1738] = [v1747, v1581[v1579.get(v1748)]];
                          v1727[v1738] = [v1580[v1579.get(v1748)], v1581[v1579.get(v1748)]];
                          v1738++;
                        });
                      };
                      for (var v1749 = 0; v1749 < v1739.length; v1749++) {
                        v1740(v1749);
                      }
                      v1728 = true;
                    }
                    if (v1577.alignmentConstraint.horizontal) {
                      var v1750 = v1577.alignmentConstraint.horizontal;
                      var v1751 = function v1752(v1753) {
                        var v1754 = new Set();
                        v1750[v1753].forEach(function (v1755) {
                          v1754.add(v1755);
                        });
                        var v1756 = new Set([].concat(v1567(v1754)).filter(function (v1757) {
                          return v1730.has(v1757);
                        }));
                        var v1758 = undefined;
                        if (v1756.size > 0) {
                          v1758 = v1580[v1579.get(v1756.values().next().value)];
                        } else {
                          v1758 = v1591(v1754).y;
                        }
                        v1750[v1753].forEach(function (v1759) {
                          v1726[v1738] = [v1580[v1579.get(v1759)], v1758];
                          v1727[v1738] = [v1580[v1579.get(v1759)], v1581[v1579.get(v1759)]];
                          v1738++;
                        });
                      };
                      for (var v1760 = 0; v1760 < v1750.length; v1760++) {
                        v1751(v1760);
                      }
                      v1728 = true;
                    }
                    if (v1577.relativePlacementConstraint) {
                      v1729 = true;
                    }
                  })();
                } else if (v1577.relativePlacementConstraint) {
                  var v1761 = 0;
                  var v1762 = 0;
                  for (var v1763 = 0; v1763 < v1733.length; v1763++) {
                    if (v1733[v1763].length > v1761) {
                      v1761 = v1733[v1763].length;
                      v1762 = v1763;
                    }
                  }
                  if (v1761 < v1732.size / 2) {
                    v1685(v1577.relativePlacementConstraint);
                    v1728 = false;
                    v1729 = false;
                  } else {
                    var v1764 = new Map();
                    var v1765 = new Map();
                    var v1766 = [];
                    v1733[v1762].forEach(function (v1767) {
                      v1731.get(v1767).forEach(function (v1768) {
                        if (v1768.direction == "horizontal") {
                          if (v1764.has(v1767)) {
                            v1764.get(v1767).push(v1768);
                          } else {
                            v1764.set(v1767, [v1768]);
                          }
                          if (!v1764.has(v1768.id)) {
                            v1764.set(v1768.id, []);
                          }
                          v1766.push({
                            left: v1767,
                            right: v1768.id
                          });
                        } else {
                          if (v1765.has(v1767)) {
                            v1765.get(v1767).push(v1768);
                          } else {
                            v1765.set(v1767, [v1768]);
                          }
                          if (!v1765.has(v1768.id)) {
                            v1765.set(v1768.id, []);
                          }
                          v1766.push({
                            top: v1767,
                            bottom: v1768.id
                          });
                        }
                      });
                    });
                    v1685(v1766);
                    v1729 = false;
                    var v1769 = v1597(v1764, "horizontal");
                    var v1770 = v1597(v1765, "vertical");
                    v1733[v1762].forEach(function (v1771, v1772) {
                      v1727[v1772] = [v1580[v1579.get(v1771)], v1581[v1579.get(v1771)]];
                      v1726[v1772] = [];
                      if (v1769.has(v1771)) {
                        v1726[v1772][0] = v1769.get(v1771);
                      } else {
                        v1726[v1772][0] = v1580[v1579.get(v1771)];
                      }
                      if (v1770.has(v1771)) {
                        v1726[v1772][1] = v1770.get(v1771);
                      } else {
                        v1726[v1772][1] = v1581[v1579.get(v1771)];
                      }
                    });
                    v1728 = true;
                  }
                }
                if (v1728) {
                  var v1773 = undefined;
                  var v1774 = v1573.transpose(v1726);
                  var v1775 = v1573.transpose(v1727);
                  for (var v1776 = 0; v1776 < v1774.length; v1776++) {
                    v1774[v1776] = v1573.multGamma(v1774[v1776]);
                    v1775[v1776] = v1573.multGamma(v1775[v1776]);
                  }
                  var v1777 = v1573.multMat(v1774, v1573.transpose(v1775));
                  var v1778 = v1574.svd(v1777);
                  v1773 = v1573.multMat(v1778.V, v1573.transpose(v1778.U));
                  for (var v1779 = 0; v1779 < v1579.size; v1779++) {
                    var v1780 = [v1580[v1779], v1581[v1779]];
                    var v1781 = [v1773[0][0], v1773[1][0]];
                    var v1782 = [v1773[0][1], v1773[1][1]];
                    v1580[v1779] = v1573.dotProduct(v1780, v1781);
                    v1581[v1779] = v1573.dotProduct(v1780, v1782);
                  }
                  if (v1729) {
                    v1685(v1577.relativePlacementConstraint);
                  }
                }
              }
              if (v1571.ENFORCE_CONSTRAINTS) {
                if (v1577.fixedNodeConstraint && v1577.fixedNodeConstraint.length > 0) {
                  var v1783 = {
                    x: 0,
                    y: 0
                  };
                  v1577.fixedNodeConstraint.forEach(function (v1784, v1785) {
                    var v1786 = {
                      x: v1580[v1579.get(v1784.nodeId)],
                      y: v1581[v1579.get(v1784.nodeId)]
                    };
                    var v1787 = v1784.position;
                    var v1788 = v1587(v1787, v1786);
                    v1783.x += v1788.x;
                    v1783.y += v1788.y;
                  });
                  v1783.x /= v1577.fixedNodeConstraint.length;
                  v1783.y /= v1577.fixedNodeConstraint.length;
                  v1580.forEach(function (v1789, v1790) {
                    v1580[v1790] += v1783.x;
                  });
                  v1581.forEach(function (v1791, v1792) {
                    v1581[v1792] += v1783.y;
                  });
                  v1577.fixedNodeConstraint.forEach(function (v1793) {
                    v1580[v1579.get(v1793.nodeId)] = v1793.position.x;
                    v1581[v1579.get(v1793.nodeId)] = v1793.position.y;
                  });
                }
                if (v1577.alignmentConstraint) {
                  if (v1577.alignmentConstraint.vertical) {
                    var v1794 = v1577.alignmentConstraint.vertical;
                    var v1795 = function v1796(v1797) {
                      var v1798 = new Set();
                      v1794[v1797].forEach(function (v1799) {
                        v1798.add(v1799);
                      });
                      var v1800 = new Set([].concat(v1567(v1798)).filter(function (v1801) {
                        return v1730.has(v1801);
                      }));
                      var v1802 = undefined;
                      if (v1800.size > 0) {
                        v1802 = v1580[v1579.get(v1800.values().next().value)];
                      } else {
                        v1802 = v1591(v1798).x;
                      }
                      v1798.forEach(function (v1803) {
                        if (!v1730.has(v1803)) {
                          v1580[v1579.get(v1803)] = v1802;
                        }
                      });
                    };
                    for (var v1804 = 0; v1804 < v1794.length; v1804++) {
                      v1795(v1804);
                    }
                  }
                  if (v1577.alignmentConstraint.horizontal) {
                    var v1805 = v1577.alignmentConstraint.horizontal;
                    var v1806 = function v1807(v1808) {
                      var v1809 = new Set();
                      v1805[v1808].forEach(function (v1810) {
                        v1809.add(v1810);
                      });
                      var v1811 = new Set([].concat(v1567(v1809)).filter(function (v1812) {
                        return v1730.has(v1812);
                      }));
                      var v1813 = undefined;
                      if (v1811.size > 0) {
                        v1813 = v1581[v1579.get(v1811.values().next().value)];
                      } else {
                        v1813 = v1591(v1809).y;
                      }
                      v1809.forEach(function (v1814) {
                        if (!v1730.has(v1814)) {
                          v1581[v1579.get(v1814)] = v1813;
                        }
                      });
                    };
                    for (var v1815 = 0; v1815 < v1805.length; v1815++) {
                      v1806(v1815);
                    }
                  }
                }
                if (v1577.relativePlacementConstraint) {
                  (function () {
                    var v1816 = new Map();
                    var v1817 = new Map();
                    var v1818 = new Map();
                    var v1819 = new Map();
                    var v1820 = new Map();
                    var v1821 = new Map();
                    var v1822 = new Set();
                    var v1823 = new Set();
                    v1730.forEach(function (v1824) {
                      v1822.add(v1824);
                      v1823.add(v1824);
                    });
                    if (v1577.alignmentConstraint) {
                      if (v1577.alignmentConstraint.vertical) {
                        var v1825 = v1577.alignmentConstraint.vertical;
                        var v1826 = function v1827(v1828) {
                          v1818.set("dummy" + v1828, []);
                          v1825[v1828].forEach(function (v1829) {
                            v1816.set(v1829, "dummy" + v1828);
                            v1818.get("dummy" + v1828).push(v1829);
                            if (v1730.has(v1829)) {
                              v1822.add("dummy" + v1828);
                            }
                          });
                          v1820.set("dummy" + v1828, v1580[v1579.get(v1825[v1828][0])]);
                        };
                        for (var v1830 = 0; v1830 < v1825.length; v1830++) {
                          v1826(v1830);
                        }
                      }
                      if (v1577.alignmentConstraint.horizontal) {
                        var v1831 = v1577.alignmentConstraint.horizontal;
                        var v1832 = function v1833(v1834) {
                          v1819.set("dummy" + v1834, []);
                          v1831[v1834].forEach(function (v1835) {
                            v1817.set(v1835, "dummy" + v1834);
                            v1819.get("dummy" + v1834).push(v1835);
                            if (v1730.has(v1835)) {
                              v1823.add("dummy" + v1834);
                            }
                          });
                          v1821.set("dummy" + v1834, v1581[v1579.get(v1831[v1834][0])]);
                        };
                        for (var v1836 = 0; v1836 < v1831.length; v1836++) {
                          v1832(v1836);
                        }
                      }
                    }
                    var v1837 = new Map();
                    var v1838 = new Map();
                    var v1839 = function v1840(v1841) {
                      v1731.get(v1841).forEach(function (v1842) {
                        var v1843 = undefined;
                        var v1844 = undefined;
                        if (v1842.direction == "horizontal") {
                          v1843 = v1816.get(v1841) ? v1816.get(v1841) : v1841;
                          if (v1816.get(v1842.id)) {
                            v1844 = {
                              id: v1816.get(v1842.id),
                              gap: v1842.gap,
                              direction: v1842.direction
                            };
                          } else {
                            v1844 = v1842;
                          }
                          if (v1837.has(v1843)) {
                            v1837.get(v1843).push(v1844);
                          } else {
                            v1837.set(v1843, [v1844]);
                          }
                          if (!v1837.has(v1844.id)) {
                            v1837.set(v1844.id, []);
                          }
                        } else {
                          v1843 = v1817.get(v1841) ? v1817.get(v1841) : v1841;
                          if (v1817.get(v1842.id)) {
                            v1844 = {
                              id: v1817.get(v1842.id),
                              gap: v1842.gap,
                              direction: v1842.direction
                            };
                          } else {
                            v1844 = v1842;
                          }
                          if (v1838.has(v1843)) {
                            v1838.get(v1843).push(v1844);
                          } else {
                            v1838.set(v1843, [v1844]);
                          }
                          if (!v1838.has(v1844.id)) {
                            v1838.set(v1844.id, []);
                          }
                        }
                      });
                    };
                    var v1845 = true;
                    var v1846 = false;
                    var v1847 = undefined;
                    try {
                      for (var v1848 = v1731.keys()[Symbol.iterator](), v1849; !(v1845 = (v1849 = v1848.next()).done); v1845 = true) {
                        var v1850 = v1849.value;
                        v1839(v1850);
                      }
                    } catch (v1851) {
                      v1846 = true;
                      v1847 = v1851;
                    } finally {
                      try {
                        if (!v1845 && v1848.return) {
                          v1848.return();
                        }
                      } finally {
                        if (v1846) {
                          throw v1847;
                        }
                      }
                    }
                    var v1852 = v1708(v1837);
                    var v1853 = v1708(v1838);
                    var v1854 = v1696(v1852);
                    var v1855 = v1696(v1853);
                    var v1856 = v1717(v1837);
                    var v1857 = v1717(v1838);
                    var v1858 = [];
                    var v1859 = [];
                    v1854.forEach(function (v1860, v1861) {
                      v1858[v1861] = [];
                      v1860.forEach(function (v1862) {
                        if (v1856.get(v1862).length == 0) {
                          v1858[v1861].push(v1862);
                        }
                      });
                    });
                    v1855.forEach(function (v1863, v1864) {
                      v1859[v1864] = [];
                      v1863.forEach(function (v1865) {
                        if (v1857.get(v1865).length == 0) {
                          v1859[v1864].push(v1865);
                        }
                      });
                    });
                    var v1866 = v1597(v1837, "horizontal", v1822, v1820, v1858);
                    var v1867 = v1597(v1838, "vertical", v1823, v1821, v1859);
                    var v1868 = function v1869(v1870) {
                      if (v1818.get(v1870)) {
                        v1818.get(v1870).forEach(function (v1871) {
                          v1580[v1579.get(v1871)] = v1866.get(v1870);
                        });
                      } else {
                        v1580[v1579.get(v1870)] = v1866.get(v1870);
                      }
                    };
                    var v1872 = true;
                    var v1873 = false;
                    var v1874 = undefined;
                    try {
                      for (var v1875 = v1866.keys()[Symbol.iterator](), v1876; !(v1872 = (v1876 = v1875.next()).done); v1872 = true) {
                        var v1877 = v1876.value;
                        v1868(v1877);
                      }
                    } catch (v1878) {
                      v1873 = true;
                      v1874 = v1878;
                    } finally {
                      try {
                        if (!v1872 && v1875.return) {
                          v1875.return();
                        }
                      } finally {
                        if (v1873) {
                          throw v1874;
                        }
                      }
                    }
                    var v1879 = function v1880(v1881) {
                      if (v1819.get(v1881)) {
                        v1819.get(v1881).forEach(function (v1882) {
                          v1581[v1579.get(v1882)] = v1867.get(v1881);
                        });
                      } else {
                        v1581[v1579.get(v1881)] = v1867.get(v1881);
                      }
                    };
                    var v1883 = true;
                    var v1884 = false;
                    var v1885 = undefined;
                    try {
                      for (var v1886 = v1867.keys()[Symbol.iterator](), v1887; !(v1883 = (v1887 = v1886.next()).done); v1883 = true) {
                        var v1877 = v1887.value;
                        v1879(v1877);
                      }
                    } catch (v1888) {
                      v1884 = true;
                      v1885 = v1888;
                    } finally {
                      try {
                        if (!v1883 && v1886.return) {
                          v1886.return();
                        }
                      } finally {
                        if (v1884) {
                          throw v1885;
                        }
                      }
                    }
                  })();
                }
              }
              for (var v1889 = 0; v1889 < v1582.length; v1889++) {
                var v1890 = v1582[v1889];
                if (v1890.getChild() == null) {
                  v1890.setCenter(v1580[v1579.get(v1890.id)], v1581[v1579.get(v1890.id)]);
                }
              }
            };
            v1564.exports = v1575;
          },
          551: v1891 => {
            v1891.exports = v1116;
          }
        };
        var v1892 = {};
        function v1893(v1894) {
          var v1895 = v1892[v1894];
          if (v1895 !== undefined) {
            return v1895.exports;
          }
          var v1896 = v1892[v1894] = {
            exports: {}
          };
          v1117[v1894](v1896, v1896.exports, v1893);
          return v1896.exports;
        }
        var v1897 = v1893(45);
        return v1897;
      })();
    });
  })(coseBase$1);
  return coseBase$1.exports;
}
var cytoscapeFcose = cytoscapeFcose$1.exports;
var hasRequiredCytoscapeFcose;
function requireCytoscapeFcose() {
  if (hasRequiredCytoscapeFcose) {
    return cytoscapeFcose$1.exports;
  }
  hasRequiredCytoscapeFcose = 1;
  (function (v1898, v1899) {
    (function v1900(v1901, v1902) {
      v1898.exports = v1902(requireCoseBase());
    })(cytoscapeFcose, function (v1903) {
      return (() => {
        var v1904 = {
          658: v1905 => {
            v1905.exports = Object.assign != null ? Object.assign.bind(Object) : function (v1906) {
              for (var v1907 = arguments.length, v1908 = Array(v1907 > 1 ? v1907 - 1 : 0), v1909 = 1; v1909 < v1907; v1909++) {
                v1908[v1909 - 1] = arguments[v1909];
              }
              v1908.forEach(function (v1910) {
                Object.keys(v1910).forEach(function (v1911) {
                  return v1906[v1911] = v1910[v1911];
                });
              });
              return v1906;
            };
          },
          548: (v1912, v1913, v1914) => {
            var v1915 = function () {
              function v1916(v1917, v1918) {
                var v1919 = [];
                var v1920 = true;
                var v1921 = false;
                var v1922 = undefined;
                try {
                  for (var v1923 = v1917[Symbol.iterator](), v1924; !(v1920 = (v1924 = v1923.next()).done); v1920 = true) {
                    v1919.push(v1924.value);
                    if (v1918 && v1919.length === v1918) {
                      break;
                    }
                  }
                } catch (v1925) {
                  v1921 = true;
                  v1922 = v1925;
                } finally {
                  try {
                    if (!v1920 && v1923.return) {
                      v1923.return();
                    }
                  } finally {
                    if (v1921) {
                      throw v1922;
                    }
                  }
                }
                return v1919;
              }
              return function (v1926, v1927) {
                if (Array.isArray(v1926)) {
                  return v1926;
                } else if (Symbol.iterator in Object(v1926)) {
                  return v1916(v1926, v1927);
                } else {
                  throw new TypeError("Invalid attempt to destructure non-iterable instance");
                }
              };
            }();
            var v1928 = v1914(140).layoutBase.LinkedList;
            var v1929 = {};
            v1929.getTopMostNodes = function (v1930) {
              var v1931 = {};
              for (var v1932 = 0; v1932 < v1930.length; v1932++) {
                v1931[v1930[v1932].id()] = true;
              }
              var v1933 = v1930.filter(function (v1934, v1935) {
                if (typeof v1934 === "number") {
                  v1934 = v1935;
                }
                var v1936 = v1934.parent()[0];
                while (v1936 != null) {
                  if (v1931[v1936.id()]) {
                    return false;
                  }
                  v1936 = v1936.parent()[0];
                }
                return true;
              });
              return v1933;
            };
            v1929.connectComponents = function (v1937, v1938, v1939, v1940) {
              var v1941 = new v1928();
              var v1942 = new Set();
              var v1943 = [];
              var v1944 = undefined;
              var v1945 = undefined;
              var v1946 = undefined;
              var v1947 = false;
              var v1948 = 1;
              var v1949 = [];
              var v1950 = [];
              var v1951 = function v1952() {
                var v1953 = v1937.collection();
                v1950.push(v1953);
                var v1954 = v1939[0];
                var v1955 = v1937.collection();
                v1955.merge(v1954).merge(v1954.descendants().intersection(v1938));
                v1943.push(v1954);
                v1955.forEach(function (v1956) {
                  v1941.push(v1956);
                  v1942.add(v1956);
                  v1953.merge(v1956);
                });
                var v1957 = function v1958() {
                  v1954 = v1941.shift();
                  var v1959 = v1937.collection();
                  v1954.neighborhood().nodes().forEach(function (v1960) {
                    if (v1938.intersection(v1954.edgesWith(v1960)).length > 0) {
                      v1959.merge(v1960);
                    }
                  });
                  for (var v1961 = 0; v1961 < v1959.length; v1961++) {
                    var v1962 = v1959[v1961];
                    v1944 = v1939.intersection(v1962.union(v1962.ancestors()));
                    if (v1944 != null && !v1942.has(v1944[0])) {
                      var v1963 = v1944.union(v1944.descendants());
                      v1963.forEach(function (v1964) {
                        v1941.push(v1964);
                        v1942.add(v1964);
                        v1953.merge(v1964);
                        if (v1939.has(v1964)) {
                          v1943.push(v1964);
                        }
                      });
                    }
                  }
                };
                while (v1941.length != 0) {
                  v1957();
                }
                v1953.forEach(function (v1965) {
                  v1938.intersection(v1965.connectedEdges()).forEach(function (v1966) {
                    if (v1953.has(v1966.source()) && v1953.has(v1966.target())) {
                      v1953.merge(v1966);
                    }
                  });
                });
                if (v1943.length == v1939.length) {
                  v1947 = true;
                }
                if (!v1947 || v1947 && v1948 > 1) {
                  v1945 = v1943[0];
                  v1946 = v1945.connectedEdges().length;
                  v1943.forEach(function (v1967) {
                    if (v1967.connectedEdges().length < v1946) {
                      v1946 = v1967.connectedEdges().length;
                      v1945 = v1967;
                    }
                  });
                  v1949.push(v1945.id());
                  var v1968 = v1937.collection();
                  v1968.merge(v1943[0]);
                  v1943.forEach(function (v1969) {
                    v1968.merge(v1969);
                  });
                  v1943 = [];
                  v1939 = v1939.difference(v1968);
                  v1948++;
                }
              };
              do {
                v1951();
              } while (!v1947);
              if (v1940) {
                if (v1949.length > 0) {
                  v1940.set("dummy" + (v1940.size + 1), v1949);
                }
              }
              return v1950;
            };
            v1929.relocateComponent = function (v1970, v1971, v1972) {
              if (!v1972.fixedNodeConstraint) {
                var v1973 = Number.POSITIVE_INFINITY;
                var v1974 = Number.NEGATIVE_INFINITY;
                var v1975 = Number.POSITIVE_INFINITY;
                var v1976 = Number.NEGATIVE_INFINITY;
                if (v1972.quality == "draft") {
                  var v1977 = true;
                  var v1978 = false;
                  var v1979 = undefined;
                  try {
                    for (var v1980 = v1971.nodeIndexes[Symbol.iterator](), v1981; !(v1977 = (v1981 = v1980.next()).done); v1977 = true) {
                      var v1982 = v1981.value;
                      var v1983 = v1915(v1982, 2);
                      var v1984 = v1983[0];
                      var v1985 = v1983[1];
                      var v1986 = v1972.cy.getElementById(v1984);
                      if (v1986) {
                        var v1987 = v1986.boundingBox();
                        var v1988 = v1971.xCoords[v1985] - v1987.w / 2;
                        var v1989 = v1971.xCoords[v1985] + v1987.w / 2;
                        var v1990 = v1971.yCoords[v1985] - v1987.h / 2;
                        var v1991 = v1971.yCoords[v1985] + v1987.h / 2;
                        if (v1988 < v1973) {
                          v1973 = v1988;
                        }
                        if (v1989 > v1974) {
                          v1974 = v1989;
                        }
                        if (v1990 < v1975) {
                          v1975 = v1990;
                        }
                        if (v1991 > v1976) {
                          v1976 = v1991;
                        }
                      }
                    }
                  } catch (v1992) {
                    v1978 = true;
                    v1979 = v1992;
                  } finally {
                    try {
                      if (!v1977 && v1980.return) {
                        v1980.return();
                      }
                    } finally {
                      if (v1978) {
                        throw v1979;
                      }
                    }
                  }
                  var v1993 = v1970.x - (v1974 + v1973) / 2;
                  var v1994 = v1970.y - (v1976 + v1975) / 2;
                  v1971.xCoords = v1971.xCoords.map(function (v1995) {
                    return v1995 + v1993;
                  });
                  v1971.yCoords = v1971.yCoords.map(function (v1996) {
                    return v1996 + v1994;
                  });
                } else {
                  Object.keys(v1971).forEach(function (v1997) {
                    var v1998 = v1971[v1997];
                    var v1999 = v1998.getRect().x;
                    var v2000 = v1998.getRect().x + v1998.getRect().width;
                    var v2001 = v1998.getRect().y;
                    var v2002 = v1998.getRect().y + v1998.getRect().height;
                    if (v1999 < v1973) {
                      v1973 = v1999;
                    }
                    if (v2000 > v1974) {
                      v1974 = v2000;
                    }
                    if (v2001 < v1975) {
                      v1975 = v2001;
                    }
                    if (v2002 > v1976) {
                      v1976 = v2002;
                    }
                  });
                  var v2003 = v1970.x - (v1974 + v1973) / 2;
                  var v2004 = v1970.y - (v1976 + v1975) / 2;
                  Object.keys(v1971).forEach(function (v2005) {
                    var v2006 = v1971[v2005];
                    v2006.setCenter(v2006.getCenterX() + v2003, v2006.getCenterY() + v2004);
                  });
                }
              }
            };
            v1929.calcBoundingBox = function (v2007, v2008, v2009, v2010) {
              var v2011 = Number.MAX_SAFE_INTEGER;
              var v2012 = Number.MIN_SAFE_INTEGER;
              var v2013 = Number.MAX_SAFE_INTEGER;
              var v2014 = Number.MIN_SAFE_INTEGER;
              var v2015 = undefined;
              var v2016 = undefined;
              var v2017 = undefined;
              var v2018 = undefined;
              var v2019 = v2007.descendants().not(":parent");
              var v2020 = v2019.length;
              for (var v2021 = 0; v2021 < v2020; v2021++) {
                var v2022 = v2019[v2021];
                v2015 = v2008[v2010.get(v2022.id())] - v2022.width() / 2;
                v2016 = v2008[v2010.get(v2022.id())] + v2022.width() / 2;
                v2017 = v2009[v2010.get(v2022.id())] - v2022.height() / 2;
                v2018 = v2009[v2010.get(v2022.id())] + v2022.height() / 2;
                if (v2011 > v2015) {
                  v2011 = v2015;
                }
                if (v2012 < v2016) {
                  v2012 = v2016;
                }
                if (v2013 > v2017) {
                  v2013 = v2017;
                }
                if (v2014 < v2018) {
                  v2014 = v2018;
                }
              }
              var v2023 = {
                topLeftX: v2011,
                topLeftY: v2013,
                width: v2012 - v2011,
                height: v2014 - v2013
              };
              return v2023;
            };
            v1929.calcParentsWithoutChildren = function (v2024, v2025) {
              var v2026 = v2024.collection();
              v2025.nodes(":parent").forEach(function (v2027) {
                var v2028 = false;
                v2027.children().forEach(function (v2029) {
                  if (v2029.css("display") != "none") {
                    v2028 = true;
                  }
                });
                if (!v2028) {
                  v2026.merge(v2027);
                }
              });
              return v2026;
            };
            v1912.exports = v1929;
          },
          816: (v2030, v2031, v2032) => {
            var v2033 = v2032(548);
            var v2034 = v2032(140).CoSELayout;
            var v2035 = v2032(140).CoSENode;
            var v2036 = v2032(140).layoutBase.PointD;
            var v2037 = v2032(140).layoutBase.DimensionD;
            var v2038 = v2032(140).layoutBase.LayoutConstants;
            var v2039 = v2032(140).layoutBase.FDLayoutConstants;
            var v2040 = v2032(140).CoSEConstants;
            var v2041 = function v2042(v2043, v2044) {
              var v2045 = v2043.cy;
              var v2046 = v2043.eles;
              var v2047 = v2046.nodes();
              var v2048 = v2046.edges();
              var v2049 = undefined;
              var v2050 = undefined;
              var v2051 = undefined;
              var v2052 = {};
              if (v2043.randomize) {
                v2049 = v2044.nodeIndexes;
                v2050 = v2044.xCoords;
                v2051 = v2044.yCoords;
              }
              var v2053 = function v2054(v2055) {
                return typeof v2055 === "function";
              };
              var v2056 = function v2057(v2058, v2059) {
                if (v2053(v2058)) {
                  return v2058(v2059);
                } else {
                  return v2058;
                }
              };
              var v2060 = v2033.calcParentsWithoutChildren(v2045, v2046);
              var v2061 = function v2062(v2063, v2064, v2065, v2066) {
                var v2067 = v2064.length;
                for (var v2068 = 0; v2068 < v2067; v2068++) {
                  var v2069 = v2064[v2068];
                  var v2070 = null;
                  if (v2069.intersection(v2060).length == 0) {
                    v2070 = v2069.children();
                  }
                  var v2071 = undefined;
                  var v2072 = v2069.layoutDimensions({
                    nodeDimensionsIncludeLabels: v2066.nodeDimensionsIncludeLabels
                  });
                  if (v2069.outerWidth() != null && v2069.outerHeight() != null) {
                    if (v2066.randomize) {
                      if (!v2069.isParent()) {
                        v2071 = v2063.add(new v2035(v2065.graphManager, new v2036(v2050[v2049.get(v2069.id())] - v2072.w / 2, v2051[v2049.get(v2069.id())] - v2072.h / 2), new v2037(parseFloat(v2072.w), parseFloat(v2072.h))));
                      } else {
                        var v2073 = v2033.calcBoundingBox(v2069, v2050, v2051, v2049);
                        if (v2069.intersection(v2060).length == 0) {
                          v2071 = v2063.add(new v2035(v2065.graphManager, new v2036(v2073.topLeftX, v2073.topLeftY), new v2037(v2073.width, v2073.height)));
                        } else {
                          v2071 = v2063.add(new v2035(v2065.graphManager, new v2036(v2073.topLeftX, v2073.topLeftY), new v2037(parseFloat(v2072.w), parseFloat(v2072.h))));
                        }
                      }
                    } else {
                      v2071 = v2063.add(new v2035(v2065.graphManager, new v2036(v2069.position("x") - v2072.w / 2, v2069.position("y") - v2072.h / 2), new v2037(parseFloat(v2072.w), parseFloat(v2072.h))));
                    }
                  } else {
                    v2071 = v2063.add(new v2035(this.graphManager));
                  }
                  v2071.id = v2069.data("id");
                  v2071.nodeRepulsion = v2056(v2066.nodeRepulsion, v2069);
                  v2071.paddingLeft = parseInt(v2069.css("padding"));
                  v2071.paddingTop = parseInt(v2069.css("padding"));
                  v2071.paddingRight = parseInt(v2069.css("padding"));
                  v2071.paddingBottom = parseInt(v2069.css("padding"));
                  if (v2066.nodeDimensionsIncludeLabels) {
                    v2071.labelWidth = v2069.boundingBox({
                      includeLabels: true,
                      includeNodes: false,
                      includeOverlays: false
                    }).w;
                    v2071.labelHeight = v2069.boundingBox({
                      includeLabels: true,
                      includeNodes: false,
                      includeOverlays: false
                    }).h;
                    v2071.labelPosVertical = v2069.css("text-valign");
                    v2071.labelPosHorizontal = v2069.css("text-halign");
                  }
                  v2052[v2069.data("id")] = v2071;
                  if (isNaN(v2071.rect.x)) {
                    v2071.rect.x = 0;
                  }
                  if (isNaN(v2071.rect.y)) {
                    v2071.rect.y = 0;
                  }
                  if (v2070 != null && v2070.length > 0) {
                    var v2074 = undefined;
                    v2074 = v2065.getGraphManager().add(v2065.newGraph(), v2071);
                    v2062(v2074, v2070, v2065, v2066);
                  }
                }
              };
              var v2075 = function v2076(v2077, v2078, v2079) {
                var v2080 = 0;
                var v2081 = 0;
                for (var v2082 = 0; v2082 < v2079.length; v2082++) {
                  var v2083 = v2079[v2082];
                  var v2084 = v2052[v2083.data("source")];
                  var v2085 = v2052[v2083.data("target")];
                  if (v2084 && v2085 && v2084 !== v2085 && v2084.getEdgesBetween(v2085).length == 0) {
                    var v2086 = v2078.add(v2077.newEdge(), v2084, v2085);
                    v2086.id = v2083.id();
                    v2086.idealLength = v2056(v2043.idealEdgeLength, v2083);
                    v2086.edgeElasticity = v2056(v2043.edgeElasticity, v2083);
                    v2080 += v2086.idealLength;
                    v2081++;
                  }
                }
                if (v2043.idealEdgeLength != null) {
                  if (v2081 > 0) {
                    v2040.DEFAULT_EDGE_LENGTH = v2039.DEFAULT_EDGE_LENGTH = v2080 / v2081;
                  } else if (!v2053(v2043.idealEdgeLength)) {
                    v2040.DEFAULT_EDGE_LENGTH = v2039.DEFAULT_EDGE_LENGTH = v2043.idealEdgeLength;
                  } else {
                    v2040.DEFAULT_EDGE_LENGTH = v2039.DEFAULT_EDGE_LENGTH = 50;
                  }
                  v2040.MIN_REPULSION_DIST = v2039.MIN_REPULSION_DIST = v2039.DEFAULT_EDGE_LENGTH / 10;
                  v2040.DEFAULT_RADIAL_SEPARATION = v2039.DEFAULT_EDGE_LENGTH;
                }
              };
              var v2087 = function v2088(v2089, v2090) {
                if (v2090.fixedNodeConstraint) {
                  v2089.constraints.fixedNodeConstraint = v2090.fixedNodeConstraint;
                }
                if (v2090.alignmentConstraint) {
                  v2089.constraints.alignmentConstraint = v2090.alignmentConstraint;
                }
                if (v2090.relativePlacementConstraint) {
                  v2089.constraints.relativePlacementConstraint = v2090.relativePlacementConstraint;
                }
              };
              if (v2043.nestingFactor != null) {
                v2040.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = v2039.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = v2043.nestingFactor;
              }
              if (v2043.gravity != null) {
                v2040.DEFAULT_GRAVITY_STRENGTH = v2039.DEFAULT_GRAVITY_STRENGTH = v2043.gravity;
              }
              if (v2043.numIter != null) {
                v2040.MAX_ITERATIONS = v2039.MAX_ITERATIONS = v2043.numIter;
              }
              if (v2043.gravityRange != null) {
                v2040.DEFAULT_GRAVITY_RANGE_FACTOR = v2039.DEFAULT_GRAVITY_RANGE_FACTOR = v2043.gravityRange;
              }
              if (v2043.gravityCompound != null) {
                v2040.DEFAULT_COMPOUND_GRAVITY_STRENGTH = v2039.DEFAULT_COMPOUND_GRAVITY_STRENGTH = v2043.gravityCompound;
              }
              if (v2043.gravityRangeCompound != null) {
                v2040.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = v2039.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = v2043.gravityRangeCompound;
              }
              if (v2043.initialEnergyOnIncremental != null) {
                v2040.DEFAULT_COOLING_FACTOR_INCREMENTAL = v2039.DEFAULT_COOLING_FACTOR_INCREMENTAL = v2043.initialEnergyOnIncremental;
              }
              if (v2043.tilingCompareBy != null) {
                v2040.TILING_COMPARE_BY = v2043.tilingCompareBy;
              }
              if (v2043.quality == "proof") {
                v2038.QUALITY = 2;
              } else {
                v2038.QUALITY = 0;
              }
              v2040.NODE_DIMENSIONS_INCLUDE_LABELS = v2039.NODE_DIMENSIONS_INCLUDE_LABELS = v2038.NODE_DIMENSIONS_INCLUDE_LABELS = v2043.nodeDimensionsIncludeLabels;
              v2040.DEFAULT_INCREMENTAL = v2039.DEFAULT_INCREMENTAL = v2038.DEFAULT_INCREMENTAL = !v2043.randomize;
              v2040.ANIMATE = v2039.ANIMATE = v2038.ANIMATE = v2043.animate;
              v2040.TILE = v2043.tile;
              v2040.TILING_PADDING_VERTICAL = typeof v2043.tilingPaddingVertical === "function" ? v2043.tilingPaddingVertical.call() : v2043.tilingPaddingVertical;
              v2040.TILING_PADDING_HORIZONTAL = typeof v2043.tilingPaddingHorizontal === "function" ? v2043.tilingPaddingHorizontal.call() : v2043.tilingPaddingHorizontal;
              v2040.DEFAULT_INCREMENTAL = v2039.DEFAULT_INCREMENTAL = v2038.DEFAULT_INCREMENTAL = true;
              v2040.PURE_INCREMENTAL = !v2043.randomize;
              v2038.DEFAULT_UNIFORM_LEAF_NODE_SIZES = v2043.uniformNodeDimensions;
              if (v2043.step == "transformed") {
                v2040.TRANSFORM_ON_CONSTRAINT_HANDLING = true;
                v2040.ENFORCE_CONSTRAINTS = false;
                v2040.APPLY_LAYOUT = false;
              }
              if (v2043.step == "enforced") {
                v2040.TRANSFORM_ON_CONSTRAINT_HANDLING = false;
                v2040.ENFORCE_CONSTRAINTS = true;
                v2040.APPLY_LAYOUT = false;
              }
              if (v2043.step == "cose") {
                v2040.TRANSFORM_ON_CONSTRAINT_HANDLING = false;
                v2040.ENFORCE_CONSTRAINTS = false;
                v2040.APPLY_LAYOUT = true;
              }
              if (v2043.step == "all") {
                if (v2043.randomize) {
                  v2040.TRANSFORM_ON_CONSTRAINT_HANDLING = true;
                } else {
                  v2040.TRANSFORM_ON_CONSTRAINT_HANDLING = false;
                }
                v2040.ENFORCE_CONSTRAINTS = true;
                v2040.APPLY_LAYOUT = true;
              }
              if (v2043.fixedNodeConstraint || v2043.alignmentConstraint || v2043.relativePlacementConstraint) {
                v2040.TREE_REDUCTION_ON_INCREMENTAL = false;
              } else {
                v2040.TREE_REDUCTION_ON_INCREMENTAL = true;
              }
              var v2091 = new v2034();
              var v2092 = v2091.newGraphManager();
              v2061(v2092.addRoot(), v2033.getTopMostNodes(v2047), v2091, v2043);
              v2075(v2091, v2092, v2048);
              v2087(v2091, v2043);
              v2091.runLayout();
              return v2052;
            };
            v2030.exports = {
              coseLayout: v2041
            };
          },
          212: (v2093, v2094, v2095) => {
            var v2096 = function () {
              function v2097(v2098, v2099) {
                for (var v2100 = 0; v2100 < v2099.length; v2100++) {
                  var v2101 = v2099[v2100];
                  v2101.enumerable = v2101.enumerable || false;
                  v2101.configurable = true;
                  if ("value" in v2101) {
                    v2101.writable = true;
                  }
                  Object.defineProperty(v2098, v2101.key, v2101);
                }
              }
              return function (v2102, v2103, v2104) {
                if (v2103) {
                  v2097(v2102.prototype, v2103);
                }
                if (v2104) {
                  v2097(v2102, v2104);
                }
                return v2102;
              };
            }();
            function v2105(v2106, v2107) {
              if (!(v2106 instanceof v2107)) {
                throw new TypeError("Cannot call a class as a function");
              }
            }
            var v2108 = v2095(658);
            var v2109 = v2095(548);
            var v2110 = v2095(657);
            var v2111 = v2110.spectralLayout;
            var v2112 = v2095(816);
            var v2113 = v2112.coseLayout;
            var v2114 = Object.freeze({
              quality: "default",
              randomize: true,
              animate: true,
              animationDuration: 1000,
              animationEasing: undefined,
              fit: true,
              padding: 30,
              nodeDimensionsIncludeLabels: false,
              uniformNodeDimensions: false,
              packComponents: true,
              step: "all",
              samplingType: true,
              sampleSize: 25,
              nodeSeparation: 75,
              piTol: 1e-7,
              nodeRepulsion: function v2115(v2116) {
                return 4500;
              },
              idealEdgeLength: function v2117(v2118) {
                return 50;
              },
              edgeElasticity: function v2119(v2120) {
                return 0.45;
              },
              nestingFactor: 0.1,
              gravity: 0.25,
              numIter: 2500,
              tile: true,
              tilingCompareBy: undefined,
              tilingPaddingVertical: 10,
              tilingPaddingHorizontal: 10,
              gravityRangeCompound: 1.5,
              gravityCompound: 1,
              gravityRange: 3.8,
              initialEnergyOnIncremental: 0.3,
              fixedNodeConstraint: undefined,
              alignmentConstraint: undefined,
              relativePlacementConstraint: undefined,
              ready: function v2121() {},
              stop: function v2122() {}
            });
            var v2123 = function () {
              function v2124(v2125) {
                v2105(this, v2124);
                this.options = v2108({}, v2114, v2125);
              }
              v2096(v2124, [{
                key: "run",
                value: function v2126() {
                  var v2127 = this;
                  var v2128 = this.options;
                  var v2129 = v2128.cy;
                  var v2130 = v2128.eles;
                  var v2131 = [];
                  var v2132 = [];
                  var v2133 = undefined;
                  var v2134 = [];
                  if (v2128.fixedNodeConstraint && (!Array.isArray(v2128.fixedNodeConstraint) || v2128.fixedNodeConstraint.length == 0)) {
                    v2128.fixedNodeConstraint = undefined;
                  }
                  if (v2128.alignmentConstraint) {
                    if (v2128.alignmentConstraint.vertical && (!Array.isArray(v2128.alignmentConstraint.vertical) || v2128.alignmentConstraint.vertical.length == 0)) {
                      v2128.alignmentConstraint.vertical = undefined;
                    }
                    if (v2128.alignmentConstraint.horizontal && (!Array.isArray(v2128.alignmentConstraint.horizontal) || v2128.alignmentConstraint.horizontal.length == 0)) {
                      v2128.alignmentConstraint.horizontal = undefined;
                    }
                  }
                  if (v2128.relativePlacementConstraint && (!Array.isArray(v2128.relativePlacementConstraint) || v2128.relativePlacementConstraint.length == 0)) {
                    v2128.relativePlacementConstraint = undefined;
                  }
                  var v2135 = v2128.fixedNodeConstraint || v2128.alignmentConstraint || v2128.relativePlacementConstraint;
                  if (v2135) {
                    v2128.tile = false;
                    v2128.packComponents = false;
                  }
                  var v2136 = undefined;
                  var v2137 = false;
                  if (v2129.layoutUtilities && v2128.packComponents) {
                    v2136 = v2129.layoutUtilities("get");
                    if (!v2136) {
                      v2136 = v2129.layoutUtilities();
                    }
                    v2137 = true;
                  }
                  if (v2130.nodes().length > 0) {
                    if (!v2137) {
                      var v2138 = v2128.eles.boundingBox();
                      v2134.push({
                        x: v2138.x1 + v2138.w / 2,
                        y: v2138.y1 + v2138.h / 2
                      });
                      if (v2128.randomize) {
                        var v2139 = v2111(v2128);
                        v2131.push(v2139);
                      }
                      if (v2128.quality == "default" || v2128.quality == "proof") {
                        v2132.push(v2113(v2128, v2131[0]));
                        v2109.relocateComponent(v2134[0], v2132[0], v2128);
                      } else {
                        v2109.relocateComponent(v2134[0], v2131[0], v2128);
                      }
                    } else {
                      var v2140 = v2109.getTopMostNodes(v2128.eles.nodes());
                      v2133 = v2109.connectComponents(v2129, v2128.eles, v2140);
                      v2133.forEach(function (v2141) {
                        var v2142 = v2141.boundingBox();
                        v2134.push({
                          x: v2142.x1 + v2142.w / 2,
                          y: v2142.y1 + v2142.h / 2
                        });
                      });
                      if (v2128.randomize) {
                        v2133.forEach(function (v2143) {
                          v2128.eles = v2143;
                          v2131.push(v2111(v2128));
                        });
                      }
                      if (v2128.quality == "default" || v2128.quality == "proof") {
                        var v2144 = v2129.collection();
                        if (v2128.tile) {
                          var v2145 = new Map();
                          var v2146 = [];
                          var v2147 = [];
                          var v2148 = 0;
                          var v2149 = {
                            nodeIndexes: v2145,
                            xCoords: v2146,
                            yCoords: v2147
                          };
                          var v2150 = [];
                          v2133.forEach(function (v2151, v2152) {
                            if (v2151.edges().length == 0) {
                              v2151.nodes().forEach(function (v2153, v2154) {
                                v2144.merge(v2151.nodes()[v2154]);
                                if (!v2153.isParent()) {
                                  v2149.nodeIndexes.set(v2151.nodes()[v2154].id(), v2148++);
                                  v2149.xCoords.push(v2151.nodes()[0].position().x);
                                  v2149.yCoords.push(v2151.nodes()[0].position().y);
                                }
                              });
                              v2150.push(v2152);
                            }
                          });
                          if (v2144.length > 1) {
                            var v2155 = v2144.boundingBox();
                            v2134.push({
                              x: v2155.x1 + v2155.w / 2,
                              y: v2155.y1 + v2155.h / 2
                            });
                            v2133.push(v2144);
                            v2131.push(v2149);
                            for (var v2156 = v2150.length - 1; v2156 >= 0; v2156--) {
                              v2133.splice(v2150[v2156], 1);
                              v2131.splice(v2150[v2156], 1);
                              v2134.splice(v2150[v2156], 1);
                            }
                          }
                        }
                        v2133.forEach(function (v2157, v2158) {
                          v2128.eles = v2157;
                          v2132.push(v2113(v2128, v2131[v2158]));
                          v2109.relocateComponent(v2134[v2158], v2132[v2158], v2128);
                        });
                      } else {
                        v2133.forEach(function (v2159, v2160) {
                          v2109.relocateComponent(v2134[v2160], v2131[v2160], v2128);
                        });
                      }
                      var v2161 = new Set();
                      if (v2133.length > 1) {
                        var v2162 = [];
                        var v2163 = v2130.filter(function (v2164) {
                          return v2164.css("display") == "none";
                        });
                        v2133.forEach(function (v2165, v2166) {
                          var v2167 = undefined;
                          if (v2128.quality == "draft") {
                            v2167 = v2131[v2166].nodeIndexes;
                          }
                          if (v2165.nodes().not(v2163).length > 0) {
                            var v2168 = {
                              edges: [],
                              nodes: []
                            };
                            var v2169 = undefined;
                            v2165.nodes().not(v2163).forEach(function (v2170) {
                              if (v2128.quality == "draft") {
                                if (!v2170.isParent()) {
                                  v2169 = v2167.get(v2170.id());
                                  v2168.nodes.push({
                                    x: v2131[v2166].xCoords[v2169] - v2170.boundingbox().w / 2,
                                    y: v2131[v2166].yCoords[v2169] - v2170.boundingbox().h / 2,
                                    width: v2170.boundingbox().w,
                                    height: v2170.boundingbox().h
                                  });
                                } else {
                                  var v2171 = v2109.calcBoundingBox(v2170, v2131[v2166].xCoords, v2131[v2166].yCoords, v2167);
                                  v2168.nodes.push({
                                    x: v2171.topLeftX,
                                    y: v2171.topLeftY,
                                    width: v2171.width,
                                    height: v2171.height
                                  });
                                }
                              } else if (v2132[v2166][v2170.id()]) {
                                v2168.nodes.push({
                                  x: v2132[v2166][v2170.id()].getLeft(),
                                  y: v2132[v2166][v2170.id()].getTop(),
                                  width: v2132[v2166][v2170.id()].getWidth(),
                                  height: v2132[v2166][v2170.id()].getHeight()
                                });
                              }
                            });
                            v2165.edges().forEach(function (v2172) {
                              var v2173 = v2172.source();
                              var v2174 = v2172.target();
                              if (v2173.css("display") != "none" && v2174.css("display") != "none") {
                                if (v2128.quality == "draft") {
                                  var v2175 = v2167.get(v2173.id());
                                  var v2176 = v2167.get(v2174.id());
                                  var v2177 = [];
                                  var v2178 = [];
                                  if (v2173.isParent()) {
                                    var v2179 = v2109.calcBoundingBox(v2173, v2131[v2166].xCoords, v2131[v2166].yCoords, v2167);
                                    v2177.push(v2179.topLeftX + v2179.width / 2);
                                    v2177.push(v2179.topLeftY + v2179.height / 2);
                                  } else {
                                    v2177.push(v2131[v2166].xCoords[v2175]);
                                    v2177.push(v2131[v2166].yCoords[v2175]);
                                  }
                                  if (v2174.isParent()) {
                                    var v2180 = v2109.calcBoundingBox(v2174, v2131[v2166].xCoords, v2131[v2166].yCoords, v2167);
                                    v2178.push(v2180.topLeftX + v2180.width / 2);
                                    v2178.push(v2180.topLeftY + v2180.height / 2);
                                  } else {
                                    v2178.push(v2131[v2166].xCoords[v2176]);
                                    v2178.push(v2131[v2166].yCoords[v2176]);
                                  }
                                  v2168.edges.push({
                                    startX: v2177[0],
                                    startY: v2177[1],
                                    endX: v2178[0],
                                    endY: v2178[1]
                                  });
                                } else if (v2132[v2166][v2173.id()] && v2132[v2166][v2174.id()]) {
                                  v2168.edges.push({
                                    startX: v2132[v2166][v2173.id()].getCenterX(),
                                    startY: v2132[v2166][v2173.id()].getCenterY(),
                                    endX: v2132[v2166][v2174.id()].getCenterX(),
                                    endY: v2132[v2166][v2174.id()].getCenterY()
                                  });
                                }
                              }
                            });
                            if (v2168.nodes.length > 0) {
                              v2162.push(v2168);
                              v2161.add(v2166);
                            }
                          }
                        });
                        var v2181 = v2136.packComponents(v2162, v2128.randomize).shifts;
                        if (v2128.quality == "draft") {
                          v2131.forEach(function (v2182, v2183) {
                            var v2184 = v2182.xCoords.map(function (v2185) {
                              return v2185 + v2181[v2183].dx;
                            });
                            var v2186 = v2182.yCoords.map(function (v2187) {
                              return v2187 + v2181[v2183].dy;
                            });
                            v2182.xCoords = v2184;
                            v2182.yCoords = v2186;
                          });
                        } else {
                          var v2188 = 0;
                          v2161.forEach(function (v2189) {
                            Object.keys(v2132[v2189]).forEach(function (v2190) {
                              var v2191 = v2132[v2189][v2190];
                              v2191.setCenter(v2191.getCenterX() + v2181[v2188].dx, v2191.getCenterY() + v2181[v2188].dy);
                            });
                            v2188++;
                          });
                        }
                      }
                    }
                  }
                  var v2192 = function v2193(v2194, v2195) {
                    if (v2128.quality == "default" || v2128.quality == "proof") {
                      if (typeof v2194 === "number") {
                        v2194 = v2195;
                      }
                      var v2196 = undefined;
                      var v2197 = undefined;
                      var v2198 = v2194.data("id");
                      v2132.forEach(function (v2199) {
                        if (v2198 in v2199) {
                          v2196 = {
                            x: v2199[v2198].getRect().getCenterX(),
                            y: v2199[v2198].getRect().getCenterY()
                          };
                          v2197 = v2199[v2198];
                        }
                      });
                      if (v2128.nodeDimensionsIncludeLabels) {
                        if (v2197.labelWidth) {
                          if (v2197.labelPosHorizontal == "left") {
                            v2196.x += v2197.labelWidth / 2;
                          } else if (v2197.labelPosHorizontal == "right") {
                            v2196.x -= v2197.labelWidth / 2;
                          }
                        }
                        if (v2197.labelHeight) {
                          if (v2197.labelPosVertical == "top") {
                            v2196.y += v2197.labelHeight / 2;
                          } else if (v2197.labelPosVertical == "bottom") {
                            v2196.y -= v2197.labelHeight / 2;
                          }
                        }
                      }
                      if (v2196 == undefined) {
                        v2196 = {
                          x: v2194.position("x"),
                          y: v2194.position("y")
                        };
                      }
                      return {
                        x: v2196.x,
                        y: v2196.y
                      };
                    } else {
                      var v2200 = undefined;
                      v2131.forEach(function (v2201) {
                        var v2202 = v2201.nodeIndexes.get(v2194.id());
                        if (v2202 != undefined) {
                          v2200 = {
                            x: v2201.xCoords[v2202],
                            y: v2201.yCoords[v2202]
                          };
                        }
                      });
                      if (v2200 == undefined) {
                        v2200 = {
                          x: v2194.position("x"),
                          y: v2194.position("y")
                        };
                      }
                      return {
                        x: v2200.x,
                        y: v2200.y
                      };
                    }
                  };
                  if (v2128.quality == "default" || v2128.quality == "proof" || v2128.randomize) {
                    var v2203 = v2109.calcParentsWithoutChildren(v2129, v2130);
                    var v2204 = v2130.filter(function (v2205) {
                      return v2205.css("display") == "none";
                    });
                    v2128.eles = v2130.not(v2204);
                    v2130.nodes().not(":parent").not(v2204).layoutPositions(v2127, v2128, v2192);
                    if (v2203.length > 0) {
                      v2203.forEach(function (v2206) {
                        v2206.position(v2192(v2206));
                      });
                    }
                  } else {
                    console.log("If randomize option is set to false, then quality option must be 'default' or 'proof'.");
                  }
                }
              }]);
              return v2124;
            }();
            v2093.exports = v2123;
          },
          657: (v2207, v2208, v2209) => {
            var v2210 = v2209(548);
            var v2211 = v2209(140).layoutBase.Matrix;
            var v2212 = v2209(140).layoutBase.SVD;
            var v2213 = function v2214(v2215) {
              var v2216 = v2215.cy;
              var v2217 = v2215.eles;
              var v2218 = v2217.nodes();
              var v2219 = v2217.nodes(":parent");
              var v2220 = new Map();
              var v2221 = new Map();
              var v2222 = new Map();
              var v2223 = [];
              var v2224 = [];
              var v2225 = [];
              var v2226 = [];
              var v2227 = [];
              var v2228 = [];
              var v2229 = [];
              var v2230 = [];
              var v2231 = undefined;
              var v2232 = 100000000;
              var v2233 = 1e-9;
              var v2234 = v2215.piTol;
              var v2235 = v2215.samplingType;
              var v2236 = v2215.nodeSeparation;
              var v2237 = undefined;
              var v2238 = function v2239() {
                var v2240 = 0;
                var v2241 = 0;
                var v2242 = false;
                while (v2241 < v2237) {
                  v2240 = Math.floor(Math.random() * v2231);
                  v2242 = false;
                  for (var v2243 = 0; v2243 < v2241; v2243++) {
                    if (v2226[v2243] == v2240) {
                      v2242 = true;
                      break;
                    }
                  }
                  if (!v2242) {
                    v2226[v2241] = v2240;
                    v2241++;
                  } else {
                    continue;
                  }
                }
              };
              var v2244 = function v2245(v2246, v2247, v2248) {
                var v2249 = [];
                var v2250 = 0;
                var v2251 = 0;
                var v2252 = 0;
                var v2253 = undefined;
                var v2254 = [];
                var v2255 = 0;
                var v2256 = 1;
                for (var v2257 = 0; v2257 < v2231; v2257++) {
                  v2254[v2257] = v2232;
                }
                v2249[v2251] = v2246;
                v2254[v2246] = 0;
                while (v2251 >= v2250) {
                  v2252 = v2249[v2250++];
                  var v2258 = v2223[v2252];
                  for (var v2259 = 0; v2259 < v2258.length; v2259++) {
                    v2253 = v2221.get(v2258[v2259]);
                    if (v2254[v2253] == v2232) {
                      v2254[v2253] = v2254[v2252] + 1;
                      v2249[++v2251] = v2253;
                    }
                  }
                  v2228[v2252][v2247] = v2254[v2252] * v2236;
                }
                if (v2248) {
                  for (var v2260 = 0; v2260 < v2231; v2260++) {
                    if (v2228[v2260][v2247] < v2227[v2260]) {
                      v2227[v2260] = v2228[v2260][v2247];
                    }
                  }
                  for (var v2261 = 0; v2261 < v2231; v2261++) {
                    if (v2227[v2261] > v2255) {
                      v2255 = v2227[v2261];
                      v2256 = v2261;
                    }
                  }
                }
                return v2256;
              };
              var v2262 = function v2263(v2264) {
                var v2265 = undefined;
                if (!v2264) {
                  v2238();
                  for (var v2266 = 0; v2266 < v2237; v2266++) {
                    v2244(v2226[v2266], v2266, v2264);
                  }
                } else {
                  v2265 = Math.floor(Math.random() * v2231);
                  for (var v2267 = 0; v2267 < v2231; v2267++) {
                    v2227[v2267] = v2232;
                  }
                  for (var v2268 = 0; v2268 < v2237; v2268++) {
                    v2226[v2268] = v2265;
                    v2265 = v2244(v2265, v2268, v2264);
                  }
                }
                for (var v2269 = 0; v2269 < v2231; v2269++) {
                  for (var v2270 = 0; v2270 < v2237; v2270++) {
                    v2228[v2269][v2270] *= v2228[v2269][v2270];
                  }
                }
                for (var v2271 = 0; v2271 < v2237; v2271++) {
                  v2229[v2271] = [];
                }
                for (var v2272 = 0; v2272 < v2237; v2272++) {
                  for (var v2273 = 0; v2273 < v2237; v2273++) {
                    v2229[v2272][v2273] = v2228[v2226[v2273]][v2272];
                  }
                }
              };
              var v2274 = function v2275() {
                var v2276 = v2212.svd(v2229);
                var v2277 = v2276.S;
                var v2278 = v2276.U;
                var v2279 = v2276.V;
                var v2280 = v2277[0] * v2277[0] * v2277[0];
                var v2281 = [];
                for (var v2282 = 0; v2282 < v2237; v2282++) {
                  v2281[v2282] = [];
                  for (var v2283 = 0; v2283 < v2237; v2283++) {
                    v2281[v2282][v2283] = 0;
                    if (v2282 == v2283) {
                      v2281[v2282][v2283] = v2277[v2282] / (v2277[v2282] * v2277[v2282] + v2280 / (v2277[v2282] * v2277[v2282]));
                    }
                  }
                }
                v2230 = v2211.multMat(v2211.multMat(v2279, v2281), v2211.transpose(v2278));
              };
              var v2284 = function v2285() {
                var v2286 = undefined;
                var v2287 = undefined;
                var v2288 = [];
                var v2289 = [];
                var v2290 = [];
                var v2291 = [];
                for (var v2292 = 0; v2292 < v2231; v2292++) {
                  v2288[v2292] = Math.random();
                  v2289[v2292] = Math.random();
                }
                v2288 = v2211.normalize(v2288);
                v2289 = v2211.normalize(v2289);
                var v2293 = v2233;
                var v2294 = v2233;
                var v2295 = undefined;
                while (true) {
                  for (var v2296 = 0; v2296 < v2231; v2296++) {
                    v2290[v2296] = v2288[v2296];
                  }
                  v2288 = v2211.multGamma(v2211.multL(v2211.multGamma(v2290), v2228, v2230));
                  v2286 = v2211.dotProduct(v2290, v2288);
                  v2288 = v2211.normalize(v2288);
                  v2293 = v2211.dotProduct(v2290, v2288);
                  v2295 = Math.abs(v2293 / v2294);
                  if (v2295 <= 1 + v2234 && v2295 >= 1) {
                    break;
                  }
                  v2294 = v2293;
                }
                for (var v2297 = 0; v2297 < v2231; v2297++) {
                  v2290[v2297] = v2288[v2297];
                }
                v2294 = v2233;
                while (true) {
                  for (var v2298 = 0; v2298 < v2231; v2298++) {
                    v2291[v2298] = v2289[v2298];
                  }
                  v2291 = v2211.minusOp(v2291, v2211.multCons(v2290, v2211.dotProduct(v2290, v2291)));
                  v2289 = v2211.multGamma(v2211.multL(v2211.multGamma(v2291), v2228, v2230));
                  v2287 = v2211.dotProduct(v2291, v2289);
                  v2289 = v2211.normalize(v2289);
                  v2293 = v2211.dotProduct(v2291, v2289);
                  v2295 = Math.abs(v2293 / v2294);
                  if (v2295 <= 1 + v2234 && v2295 >= 1) {
                    break;
                  }
                  v2294 = v2293;
                }
                for (var v2299 = 0; v2299 < v2231; v2299++) {
                  v2291[v2299] = v2289[v2299];
                }
                v2224 = v2211.multCons(v2290, Math.sqrt(Math.abs(v2286)));
                v2225 = v2211.multCons(v2291, Math.sqrt(Math.abs(v2287)));
              };
              v2210.connectComponents(v2216, v2217, v2210.getTopMostNodes(v2218), v2220);
              v2219.forEach(function (v2300) {
                v2210.connectComponents(v2216, v2217, v2210.getTopMostNodes(v2300.descendants().intersection(v2217)), v2220);
              });
              var v2301 = 0;
              for (var v2302 = 0; v2302 < v2218.length; v2302++) {
                if (!v2218[v2302].isParent()) {
                  v2221.set(v2218[v2302].id(), v2301++);
                }
              }
              var v2303 = true;
              var v2304 = false;
              var v2305 = undefined;
              try {
                for (var v2306 = v2220.keys()[Symbol.iterator](), v2307; !(v2303 = (v2307 = v2306.next()).done); v2303 = true) {
                  var v2308 = v2307.value;
                  v2221.set(v2308, v2301++);
                }
              } catch (v2309) {
                v2304 = true;
                v2305 = v2309;
              } finally {
                try {
                  if (!v2303 && v2306.return) {
                    v2306.return();
                  }
                } finally {
                  if (v2304) {
                    throw v2305;
                  }
                }
              }
              for (var v2310 = 0; v2310 < v2221.size; v2310++) {
                v2223[v2310] = [];
              }
              v2219.forEach(function (v2311) {
                var v2312 = v2311.children().intersection(v2217);
                while (v2312.nodes(":childless").length == 0) {
                  v2312 = v2312.nodes()[0].children().intersection(v2217);
                }
                var v2313 = 0;
                var v2314 = v2312.nodes(":childless")[0].connectedEdges().length;
                v2312.nodes(":childless").forEach(function (v2315, v2316) {
                  if (v2315.connectedEdges().length < v2314) {
                    v2314 = v2315.connectedEdges().length;
                    v2313 = v2316;
                  }
                });
                v2222.set(v2311.id(), v2312.nodes(":childless")[v2313].id());
              });
              v2218.forEach(function (v2317) {
                var v2318 = undefined;
                if (v2317.isParent()) {
                  v2318 = v2221.get(v2222.get(v2317.id()));
                } else {
                  v2318 = v2221.get(v2317.id());
                }
                v2317.neighborhood().nodes().forEach(function (v2319) {
                  if (v2217.intersection(v2317.edgesWith(v2319)).length > 0) {
                    if (v2319.isParent()) {
                      v2223[v2318].push(v2222.get(v2319.id()));
                    } else {
                      v2223[v2318].push(v2319.id());
                    }
                  }
                });
              });
              var v2320 = function v2321(v2322) {
                var v2323 = v2221.get(v2322);
                var v2324 = undefined;
                v2220.get(v2322).forEach(function (v2325) {
                  if (v2216.getElementById(v2325).isParent()) {
                    v2324 = v2222.get(v2325);
                  } else {
                    v2324 = v2325;
                  }
                  v2223[v2323].push(v2324);
                  v2223[v2221.get(v2324)].push(v2322);
                });
              };
              var v2326 = true;
              var v2327 = false;
              var v2328 = undefined;
              try {
                for (var v2329 = v2220.keys()[Symbol.iterator](), v2330; !(v2326 = (v2330 = v2329.next()).done); v2326 = true) {
                  var v2331 = v2330.value;
                  v2320(v2331);
                }
              } catch (v2332) {
                v2327 = true;
                v2328 = v2332;
              } finally {
                try {
                  if (!v2326 && v2329.return) {
                    v2329.return();
                  }
                } finally {
                  if (v2327) {
                    throw v2328;
                  }
                }
              }
              v2231 = v2221.size;
              var v2333 = undefined;
              if (v2231 > 2) {
                v2237 = v2231 < v2215.sampleSize ? v2231 : v2215.sampleSize;
                for (var v2334 = 0; v2334 < v2231; v2334++) {
                  v2228[v2334] = [];
                }
                for (var v2335 = 0; v2335 < v2237; v2335++) {
                  v2230[v2335] = [];
                }
                if (v2215.quality == "draft" || v2215.step == "all") {
                  v2262(v2235);
                  v2274();
                  v2284();
                  v2333 = {
                    nodeIndexes: v2221,
                    xCoords: v2224,
                    yCoords: v2225
                  };
                } else {
                  v2221.forEach(function (v2336, v2337) {
                    v2224.push(v2216.getElementById(v2337).position("x"));
                    v2225.push(v2216.getElementById(v2337).position("y"));
                  });
                  v2333 = {
                    nodeIndexes: v2221,
                    xCoords: v2224,
                    yCoords: v2225
                  };
                }
                return v2333;
              } else {
                var v2338 = v2221.keys();
                var v2339 = v2216.getElementById(v2338.next().value);
                var v2340 = v2339.position();
                var v2341 = v2339.outerWidth();
                v2224.push(v2340.x);
                v2225.push(v2340.y);
                if (v2231 == 2) {
                  var v2342 = v2216.getElementById(v2338.next().value);
                  var v2343 = v2342.outerWidth();
                  v2224.push(v2340.x + v2341 / 2 + v2343 / 2 + v2215.idealEdgeLength);
                  v2225.push(v2340.y);
                }
                v2333 = {
                  nodeIndexes: v2221,
                  xCoords: v2224,
                  yCoords: v2225
                };
                return v2333;
              }
            };
            v2207.exports = {
              spectralLayout: v2213
            };
          },
          579: (v2344, v2345, v2346) => {
            var v2347 = v2346(212);
            var v2348 = function v2349(v2350) {
              if (!v2350) {
                return;
              }
              v2350("layout", "fcose", v2347);
            };
            if (typeof cytoscape !== "undefined") {
              v2348(cytoscape);
            }
            v2344.exports = v2348;
          },
          140: v2351 => {
            v2351.exports = v1903;
          }
        };
        var v2352 = {};
        function v2353(v2354) {
          var v2355 = v2352[v2354];
          if (v2355 !== undefined) {
            return v2355.exports;
          }
          var v2356 = v2352[v2354] = {
            exports: {}
          };
          v1904[v2354](v2356, v2356.exports, v2353);
          return v2356.exports;
        }
        var v2357 = v2353(579);
        return v2357;
      })();
    });
  })(cytoscapeFcose$1);
  return cytoscapeFcose$1.exports;
}
var cytoscapeFcoseExports = requireCytoscapeFcose();
const fcose = v2(cytoscapeFcoseExports);
var ArchitectureDirectionName = {
  L: "left",
  R: "right",
  T: "top",
  B: "bottom"
};
var ArchitectureDirectionArrow = {
  L: v3(v2358 => v2358 + "," + v2358 / 2 + " 0," + v2358 + " 0,0", "L"),
  R: v3(v2359 => "0," + v2359 / 2 + " " + v2359 + ",0 " + v2359 + "," + v2359, "R"),
  T: v3(v2360 => "0,0 " + v2360 + ",0 " + v2360 / 2 + "," + v2360, "T"),
  B: v3(v2361 => v2361 / 2 + ",0 " + v2361 + "," + v2361 + " 0," + v2361, "B")
};
var ArchitectureDirectionArrowShift = {
  L: v3((v2362, v2363) => v2362 - v2363 + 2, "L"),
  R: v3((v2364, v2365) => v2364 - 2, "R"),
  T: v3((v2366, v2367) => v2366 - v2367 + 2, "T"),
  B: v3((v2368, v2369) => v2368 - 2, "B")
};
var getOppositeArchitectureDirection = v3(function (v2370) {
  if (isArchitectureDirectionX(v2370)) {
    if (v2370 === "L") {
      return "R";
    } else {
      return "L";
    }
  } else if (v2370 === "T") {
    return "B";
  } else {
    return "T";
  }
}, "getOppositeArchitectureDirection");
var isArchitectureDirection = v3(function (v2371) {
  const v2372 = v2371;
  return v2372 === "L" || v2372 === "R" || v2372 === "T" || v2372 === "B";
}, "isArchitectureDirection");
var isArchitectureDirectionX = v3(function (v2373) {
  const v2374 = v2373;
  return v2374 === "L" || v2374 === "R";
}, "isArchitectureDirectionX");
var isArchitectureDirectionY = v3(function (v2375) {
  const v2376 = v2375;
  return v2376 === "T" || v2376 === "B";
}, "isArchitectureDirectionY");
var isArchitectureDirectionXY = v3(function (v2377, v2378) {
  const v2379 = isArchitectureDirectionX(v2377) && isArchitectureDirectionY(v2378);
  const v2380 = isArchitectureDirectionY(v2377) && isArchitectureDirectionX(v2378);
  return v2379 || v2380;
}, "isArchitectureDirectionXY");
var isArchitecturePairXY = v3(function (v2381) {
  const v2382 = v2381[0];
  const v2383 = v2381[1];
  const v2384 = isArchitectureDirectionX(v2382) && isArchitectureDirectionY(v2383);
  const v2385 = isArchitectureDirectionY(v2382) && isArchitectureDirectionX(v2383);
  return v2384 || v2385;
}, "isArchitecturePairXY");
var isValidArchitectureDirectionPair = v3(function (v2386) {
  return v2386 !== "LL" && v2386 !== "RR" && v2386 !== "TT" && v2386 !== "BB";
}, "isValidArchitectureDirectionPair");
var getArchitectureDirectionPair = v3(function (v2387, v2388) {
  const v2389 = "" + v2387 + v2388;
  if (isValidArchitectureDirectionPair(v2389)) {
    return v2389;
  } else {
    return undefined;
  }
}, "getArchitectureDirectionPair");
var shiftPositionByArchitectureDirectionPair = v3(function ([v2390, v2391], v2392) {
  const v2393 = v2392[0];
  const v2394 = v2392[1];
  if (isArchitectureDirectionX(v2393)) {
    if (isArchitectureDirectionY(v2394)) {
      return [v2390 + (v2393 === "L" ? -1 : 1), v2391 + (v2394 === "T" ? 1 : -1)];
    } else {
      return [v2390 + (v2393 === "L" ? -1 : 1), v2391];
    }
  } else if (isArchitectureDirectionX(v2394)) {
    return [v2390 + (v2394 === "L" ? 1 : -1), v2391 + (v2393 === "T" ? 1 : -1)];
  } else {
    return [v2390, v2391 + (v2393 === "T" ? 1 : -1)];
  }
}, "shiftPositionByArchitectureDirectionPair");
var getArchitectureDirectionXYFactors = v3(function (v2395) {
  if (v2395 === "LT" || v2395 === "TL") {
    return [1, 1];
  } else if (v2395 === "BL" || v2395 === "LB") {
    return [1, -1];
  } else if (v2395 === "BR" || v2395 === "RB") {
    return [-1, -1];
  } else {
    return [-1, 1];
  }
}, "getArchitectureDirectionXYFactors");
var getArchitectureDirectionAlignment = v3(function (v2396, v2397) {
  if (isArchitectureDirectionXY(v2396, v2397)) {
    return "bend";
  } else if (isArchitectureDirectionX(v2396)) {
    return "horizontal";
  }
  return "vertical";
}, "getArchitectureDirectionAlignment");
var isArchitectureService = v3(function (v2398) {
  const v2399 = v2398;
  return v2399.type === "service";
}, "isArchitectureService");
var isArchitectureJunction = v3(function (v2400) {
  const v2401 = v2400;
  return v2401.type === "junction";
}, "isArchitectureJunction");
var architectureGroupAlignmentKey = v3((v2402, v2403) => {
  const [v2404, v2405] = [v2402, v2403].sort();
  return JSON.stringify(v2404) + "-" + JSON.stringify(v2405);
}, "architectureGroupAlignmentKey");
var edgeData = v3(v2406 => {
  return v2406.data();
}, "edgeData");
var nodeData = v3(v2407 => {
  return v2407.data();
}, "nodeData");
var DEFAULT_ARCHITECTURE_CONFIG = v16.architecture;
var ArchitectureDB = class {
  constructor() {
    this.nodes = new Map();
    this.groups = new Map();
    this.edges = [];
    this.layoutHints = [];
    this.registeredIds = new Map();
    this.elements = new Map();
    this.diagramId = "";
    this.setAccTitle = v7;
    this.getAccTitle = v8;
    this.setDiagramTitle = v9;
    this.getDiagramTitle = v10;
    this.getAccDescription = v11;
    this.setAccDescription = v12;
    this.clear();
  }
  static {
    v3(this, "ArchitectureDB");
  }
  setDiagramId(v2408) {
    this.diagramId = v2408;
  }
  getDiagramId() {
    return this.diagramId;
  }
  clear() {
    this.nodes = new Map();
    this.groups = new Map();
    this.edges = [];
    this.layoutHints = [];
    this.registeredIds = new Map();
    this.dataStructures = undefined;
    this.elements = new Map();
    this.diagramId = "";
    v13();
  }
  addService({
    id: v2409,
    icon: v2410,
    in: v2411,
    title: v2412,
    iconText: v2413
  }) {
    if (this.registeredIds.has(v2409)) {
      throw new Error("The service id [" + v2409 + "] is already in use by another " + this.registeredIds.get(v2409));
    }
    if (v2411 !== undefined) {
      if (v2409 === v2411) {
        throw new Error("The service [" + v2409 + "] cannot be placed within itself");
      }
      if (!this.registeredIds.has(v2411)) {
        throw new Error("The service [" + v2409 + "]'s parent does not exist. Please make sure the parent is created before this service");
      }
      if (this.registeredIds.get(v2411) === "node") {
        throw new Error("The service [" + v2409 + "]'s parent is not a group");
      }
    }
    this.registeredIds.set(v2409, "node");
    this.nodes.set(v2409, {
      id: v2409,
      type: "service",
      icon: v2410,
      iconText: v2413,
      title: v2412,
      edges: [],
      in: v2411
    });
  }
  getServices() {
    return [...this.nodes.values()].filter(isArchitectureService);
  }
  addJunction({
    id: v2414,
    in: v2415
  }) {
    if (this.registeredIds.has(v2414)) {
      throw new Error("The junction id [" + v2414 + "] is already in use by another " + this.registeredIds.get(v2414));
    }
    if (v2415 !== undefined) {
      if (v2414 === v2415) {
        throw new Error("The junction [" + v2414 + "] cannot be placed within itself");
      }
      if (!this.registeredIds.has(v2415)) {
        throw new Error("The junction [" + v2414 + "]'s parent does not exist. Please make sure the parent is created before this junction");
      }
      if (this.registeredIds.get(v2415) === "node") {
        throw new Error("The junction [" + v2414 + "]'s parent is not a group");
      }
    }
    this.registeredIds.set(v2414, "node");
    this.nodes.set(v2414, {
      id: v2414,
      type: "junction",
      edges: [],
      in: v2415
    });
  }
  getJunctions() {
    return [...this.nodes.values()].filter(isArchitectureJunction);
  }
  getNodes() {
    return [...this.nodes.values()];
  }
  getNode(v2416) {
    return this.nodes.get(v2416) ?? null;
  }
  addGroup({
    id: v2417,
    icon: v2418,
    in: v2419,
    title: v2420
  }) {
    if (this.registeredIds.has(v2417)) {
      throw new Error("The group id [" + v2417 + "] is already in use by another " + this.registeredIds.get(v2417));
    }
    if (v2419 !== undefined) {
      if (v2417 === v2419) {
        throw new Error("The group [" + v2417 + "] cannot be placed within itself");
      }
      if (!this.registeredIds.has(v2419)) {
        throw new Error("The group [" + v2417 + "]'s parent does not exist. Please make sure the parent is created before this group");
      }
      if (this.registeredIds.get(v2419) === "node") {
        throw new Error("The group [" + v2417 + "]'s parent is not a group");
      }
    }
    this.registeredIds.set(v2417, "group");
    this.groups.set(v2417, {
      id: v2417,
      icon: v2418,
      title: v2420,
      in: v2419
    });
  }
  getGroups() {
    return [...this.groups.values()];
  }
  addEdge({
    lhsId: v2421,
    rhsId: v2422,
    lhsDir: v2423,
    rhsDir: v2424,
    lhsInto: v2425,
    rhsInto: v2426,
    lhsGroup: v2427,
    rhsGroup: v2428,
    title: v2429
  }) {
    if (!isArchitectureDirection(v2423)) {
      throw new Error("Invalid direction given for left hand side of edge " + v2421 + "--" + v2422 + ". Expected (L,R,T,B) got " + String(v2423));
    }
    if (!isArchitectureDirection(v2424)) {
      throw new Error("Invalid direction given for right hand side of edge " + v2421 + "--" + v2422 + ". Expected (L,R,T,B) got " + String(v2424));
    }
    if (!this.nodes.has(v2421) && !this.groups.has(v2421)) {
      throw new Error("The left-hand id [" + v2421 + "] does not yet exist. Please create the service/group before declaring an edge to it.");
    }
    if (!this.nodes.has(v2422) && !this.groups.has(v2422)) {
      throw new Error("The right-hand id [" + v2422 + "] does not yet exist. Please create the service/group before declaring an edge to it.");
    }
    const v2430 = this.nodes.get(v2421).in;
    const v2431 = this.nodes.get(v2422).in;
    if (v2427 && v2430 && v2431 && v2430 == v2431) {
      throw new Error("The left-hand id [" + v2421 + "] is modified to traverse the group boundary, but the edge does not pass through two groups.");
    }
    if (v2428 && v2430 && v2431 && v2430 == v2431) {
      throw new Error("The right-hand id [" + v2422 + "] is modified to traverse the group boundary, but the edge does not pass through two groups.");
    }
    const v2432 = {
      lhsId: v2421,
      lhsDir: v2423,
      lhsInto: v2425,
      lhsGroup: v2427,
      rhsId: v2422,
      rhsDir: v2424,
      rhsInto: v2426,
      rhsGroup: v2428,
      title: v2429
    };
    this.edges.push(v2432);
    const v2433 = this.nodes.get(v2421);
    const v2434 = this.nodes.get(v2422);
    if (v2433 && v2434) {
      v2433.edges.push(this.edges[this.edges.length - 1]);
      v2434.edges.push(this.edges[this.edges.length - 1]);
    }
  }
  getEdges() {
    return this.edges;
  }
  addLayoutHint(v2435) {
    if (v2435.members.length < 2) {
      throw new Error("An align directive requires at least two members; got " + v2435.members.length);
    }
    const v2436 = new Set();
    v2435.members.forEach(v2437 => {
      if (this.registeredIds.get(v2437) !== "node") {
        throw new Error("align " + v2435.direction + " references [" + v2437 + "], which is not a service or junction");
      }
      if (v2436.has(v2437)) {
        throw new Error("align " + v2435.direction + " lists [" + v2437 + "] more than once");
      }
      v2436.add(v2437);
    });
    this.layoutHints.push(v2435);
  }
  getLayoutHints() {
    return this.layoutHints;
  }
  getDataStructures() {
    if (this.dataStructures === undefined) {
      const v2438 = new Map();
      const v2439 = new Map();
      for (const [v2440, v2441] of this.nodes.entries()) {
        const v2442 = new Map();
        for (const v2443 of v2441.edges) {
          const v2444 = this.getNode(v2443.lhsId)?.in;
          const v2445 = this.getNode(v2443.rhsId)?.in;
          if (v2444 && v2445 && v2444 !== v2445) {
            const v2446 = getArchitectureDirectionAlignment(v2443.lhsDir, v2443.rhsDir);
            if (v2446 !== "bend") {
              v2438.set(architectureGroupAlignmentKey(v2444, v2445), v2446);
            }
          }
          if (v2443.lhsId === v2440) {
            const v2447 = getArchitectureDirectionPair(v2443.lhsDir, v2443.rhsDir);
            if (v2447) {
              v2442.set(v2447, v2443.rhsId);
            }
          } else {
            const v2448 = getArchitectureDirectionPair(v2443.rhsDir, v2443.lhsDir);
            if (v2448) {
              v2442.set(v2448, v2443.lhsId);
            }
          }
        }
        v2439.set(v2440, v2442);
      }
      const v2449 = new Set();
      const v2450 = new Set(v2439.keys());
      const v2451 = v3(v2452 => {
        const v2453 = new Map([[v2452, [0, 0]]]);
        const v2454 = [v2452];
        while (v2454.length > 0) {
          const v2455 = v2454.shift();
          if (v2455) {
            v2449.add(v2455);
            v2450.delete(v2455);
            const v2456 = v2439.get(v2455);
            if (!v2456) {
              throw new Error("BFS error: adjacency list for id " + v2455 + " not found. Please report this as a bug.");
            }
            const v2457 = v2453.get(v2455);
            if (!v2457) {
              throw new Error("BFS error: position for id " + v2455 + " not found in spatial map. Please report this as a bug.");
            }
            const [v2458, v2459] = v2457;
            v2456.forEach((v2460, v2461) => {
              if (!v2449.has(v2460)) {
                v2453.set(v2460, shiftPositionByArchitectureDirectionPair([v2458, v2459], v2461));
                v2454.push(v2460);
              }
            });
          }
        }
        return v2453;
      }, "BFS");
      const v2462 = [];
      while (v2450.size > 0) {
        const v2463 = v2450.values().next().value;
        v2462.push(v2451(v2463));
      }
      this.dataStructures = {
        adjList: v2439,
        spatialMaps: v2462,
        groupAlignments: v2438
      };
    }
    return this.dataStructures;
  }
  setElementForId(v2464, v2465) {
    this.elements.set(v2464, v2465);
  }
  getElementById(v2466) {
    return this.elements.get(v2466);
  }
  getConfig() {
    return v14({
      ...DEFAULT_ARCHITECTURE_CONFIG,
      ...v15().architecture
    });
  }
  getConfigField(v2467) {
    return this.getConfig()[v2467];
  }
};
var populateDb = v3((v2468, v2469) => {
  v1(v2468, v2469);
  v2468.groups.map(v2470 => v2469.addGroup(v2470));
  v2468.services.map(v2471 => v2469.addService({
    ...v2471,
    type: "service"
  }));
  v2468.junctions.map(v2472 => v2469.addJunction({
    ...v2472,
    type: "junction"
  }));
  v2468.edges.map(v2473 => v2469.addEdge(v2473));
  v2468.alignments?.map(v2474 => v2469.addLayoutHint({
    direction: v2474.direction,
    members: [...v2474.members]
  }));
}, "populateDb");
var parser = {
  parser: {
    yy: undefined
  },
  parse: v3(async v2475 => {
    const v2476 = await v25("architecture", v2475);
    v6.debug(v2476);
    const v2477 = parser.parser?.yy;
    if (!(v2477 instanceof ArchitectureDB)) {
      throw new Error("parser.parser?.yy was not a ArchitectureDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");
    }
    populateDb(v2476, v2477);
  }, "parse")
};
var getStyles = v3(v2478 => "\n  .edge {\n    stroke-width: " + v2478.archEdgeWidth + ";\n    stroke: " + v2478.archEdgeColor + ";\n    fill: none;\n  }\n\n  .arrow {\n    fill: " + v2478.archEdgeArrowColor + ";\n  }\n\n  .node-bkg {\n    fill: none;\n    stroke: " + v2478.archGroupBorderColor + ";\n    stroke-width: " + v2478.archGroupBorderWidth + ";\n    stroke-dasharray: 8;\n  }\n  .node-icon-text {\n    display: flex; \n    align-items: center;\n  }\n  \n  .node-icon-text > div {\n    color: #fff;\n    margin: 1px;\n    height: fit-content;\n    text-align: center;\n    overflow: hidden;\n    display: -webkit-box;\n    -webkit-box-orient: vertical;\n  }\n", "getStyles");
var architectureStyles_default = getStyles;
function withSeededRandom(v2479, v2480) {
  if (v2479 === 0) {
    return v2480();
  }
  const v2481 = Math.random;
  let v2482 = v2479 >>> 0;
  Math.random = function () {
    v2482 = v2482 + 1831565813 >>> 0;
    let v2483 = v2482;
    v2483 = Math.imul(v2483 ^ v2483 >>> 15, v2483 | 1);
    v2483 ^= v2483 + Math.imul(v2483 ^ v2483 >>> 7, v2483 | 61);
    return ((v2483 ^ v2483 >>> 14) >>> 0) / 4294967296;
  };
  try {
    return v2480();
  } finally {
    Math.random = v2481;
  }
}
v3(withSeededRandom, "withSeededRandom");
var wrapIcon = v3(v2484 => {
  return "<g><rect width=\"80\" height=\"80\" style=\"fill: #087ebf; stroke-width: 0px;\"/>" + v2484 + "</g>";
}, "wrapIcon");
var architectureIcons = {
  prefix: "mermaid-architecture",
  height: 80,
  width: 80,
  icons: {
    database: {
      body: wrapIcon("<path id=\"b\" data-name=\"4\" d=\"m20,57.86c0,3.94,8.95,7.14,20,7.14s20-3.2,20-7.14\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><path id=\"c\" data-name=\"3\" d=\"m20,45.95c0,3.94,8.95,7.14,20,7.14s20-3.2,20-7.14\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><path id=\"d\" data-name=\"2\" d=\"m20,34.05c0,3.94,8.95,7.14,20,7.14s20-3.2,20-7.14\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><ellipse id=\"e\" data-name=\"1\" cx=\"40\" cy=\"22.14\" rx=\"20\" ry=\"7.14\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"20\" y1=\"57.86\" x2=\"20\" y2=\"22.14\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"60\" y1=\"57.86\" x2=\"60\" y2=\"22.14\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/>")
    },
    server: {
      body: wrapIcon("<rect x=\"17.5\" y=\"17.5\" width=\"45\" height=\"45\" rx=\"2\" ry=\"2\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"17.5\" y1=\"32.5\" x2=\"62.5\" y2=\"32.5\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"17.5\" y1=\"47.5\" x2=\"62.5\" y2=\"47.5\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><g><path d=\"m56.25,25c0,.27-.45.5-1,.5h-10.5c-.55,0-1-.23-1-.5s.45-.5,1-.5h10.5c.55,0,1,.23,1,.5Z\" style=\"fill: #fff; stroke-width: 0px;\"/><path d=\"m56.25,25c0,.27-.45.5-1,.5h-10.5c-.55,0-1-.23-1-.5s.45-.5,1-.5h10.5c.55,0,1,.23,1,.5Z\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10;\"/></g><g><path d=\"m56.25,40c0,.27-.45.5-1,.5h-10.5c-.55,0-1-.23-1-.5s.45-.5,1-.5h10.5c.55,0,1,.23,1,.5Z\" style=\"fill: #fff; stroke-width: 0px;\"/><path d=\"m56.25,40c0,.27-.45.5-1,.5h-10.5c-.55,0-1-.23-1-.5s.45-.5,1-.5h10.5c.55,0,1,.23,1,.5Z\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10;\"/></g><g><path d=\"m56.25,55c0,.27-.45.5-1,.5h-10.5c-.55,0-1-.23-1-.5s.45-.5,1-.5h10.5c.55,0,1,.23,1,.5Z\" style=\"fill: #fff; stroke-width: 0px;\"/><path d=\"m56.25,55c0,.27-.45.5-1,.5h-10.5c-.55,0-1-.23-1-.5s.45-.5,1-.5h10.5c.55,0,1,.23,1,.5Z\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10;\"/></g><g><circle cx=\"32.5\" cy=\"25\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/><circle cx=\"27.5\" cy=\"25\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/><circle cx=\"22.5\" cy=\"25\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/></g><g><circle cx=\"32.5\" cy=\"40\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/><circle cx=\"27.5\" cy=\"40\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/><circle cx=\"22.5\" cy=\"40\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/></g><g><circle cx=\"32.5\" cy=\"55\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/><circle cx=\"27.5\" cy=\"55\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/><circle cx=\"22.5\" cy=\"55\" r=\".75\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10;\"/></g>")
    },
    disk: {
      body: wrapIcon("<rect x=\"20\" y=\"15\" width=\"40\" height=\"50\" rx=\"1\" ry=\"1\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><ellipse cx=\"24\" cy=\"19.17\" rx=\".8\" ry=\".83\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><ellipse cx=\"56\" cy=\"19.17\" rx=\".8\" ry=\".83\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><ellipse cx=\"24\" cy=\"60.83\" rx=\".8\" ry=\".83\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><ellipse cx=\"56\" cy=\"60.83\" rx=\".8\" ry=\".83\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><ellipse cx=\"40\" cy=\"33.75\" rx=\"14\" ry=\"14.58\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><ellipse cx=\"40\" cy=\"33.75\" rx=\"4\" ry=\"4.17\" style=\"fill: #fff; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><path d=\"m37.51,42.52l-4.83,13.22c-.26.71-1.1,1.02-1.76.64l-4.18-2.42c-.66-.38-.81-1.26-.33-1.84l9.01-10.8c.88-1.05,2.56-.08,2.09,1.2Z\" style=\"fill: #fff; stroke-width: 0px;\"/>")
    },
    internet: {
      body: wrapIcon("<circle cx=\"40\" cy=\"40\" r=\"22.5\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"40\" y1=\"17.5\" x2=\"40\" y2=\"62.5\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"17.5\" y1=\"40\" x2=\"62.5\" y2=\"40\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><path d=\"m39.99,17.51c-15.28,11.1-15.28,33.88,0,44.98\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><path d=\"m40.01,17.51c15.28,11.1,15.28,33.88,0,44.98\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"19.75\" y1=\"30.1\" x2=\"60.25\" y2=\"30.1\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/><line x1=\"19.75\" y1=\"49.9\" x2=\"60.25\" y2=\"49.9\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/>")
    },
    cloud: {
      body: wrapIcon("<path d=\"m65,47.5c0,2.76-2.24,5-5,5H20c-2.76,0-5-2.24-5-5,0-1.87,1.03-3.51,2.56-4.36-.04-.21-.06-.42-.06-.64,0-2.6,2.48-4.74,5.65-4.97,1.65-4.51,6.34-7.76,11.85-7.76.86,0,1.69.08,2.5.23,2.09-1.57,4.69-2.5,7.5-2.5,6.1,0,11.19,4.38,12.28,10.17,2.14.56,3.72,2.51,3.72,4.83,0,.03,0,.07-.01.1,2.29.46,4.01,2.48,4.01,4.9Z\" style=\"fill: none; stroke: #fff; stroke-miterlimit: 10; stroke-width: 2px;\"/>")
    },
    unknown: v24,
    blank: {
      body: wrapIcon("")
    }
  }
};
var drawEdges = v3(async function (v2485, v2486, v2487, v2488) {
  const v2489 = v2487.getConfigField("padding");
  const v2490 = v2487.getConfigField("iconSize");
  const v2491 = v2490 / 2;
  const v2492 = v2490 / 6;
  const v2493 = v2492 / 2;
  await Promise.all(v2486.edges().map(async v2494 => {
    const {
      source: v2495,
      sourceDir: v2496,
      sourceArrow: v2497,
      sourceGroup: v2498,
      target: v2499,
      targetDir: v2500,
      targetArrow: v2501,
      targetGroup: v2502,
      label: v2503
    } = edgeData(v2494);
    let {
      x: v2504,
      y: v2505
    } = v2494[0].sourceEndpoint();
    const {
      x: v2506,
      y: v2507
    } = v2494[0].midpoint();
    let {
      x: v2508,
      y: v2509
    } = v2494[0].targetEndpoint();
    const v2510 = v2489 + 4;
    if (v2498) {
      if (isArchitectureDirectionX(v2496)) {
        v2504 += v2496 === "L" ? -v2510 : v2510;
      } else {
        v2505 += v2496 === "T" ? -v2510 : v2510 + 18;
      }
    }
    if (v2502) {
      if (isArchitectureDirectionX(v2500)) {
        v2508 += v2500 === "L" ? -v2510 : v2510;
      } else {
        v2509 += v2500 === "T" ? -v2510 : v2510 + 18;
      }
    }
    if (!v2498 && v2487.getNode(v2495)?.type === "junction") {
      if (isArchitectureDirectionX(v2496)) {
        v2504 += v2496 === "L" ? v2491 : -v2491;
      } else {
        v2505 += v2496 === "T" ? v2491 : -v2491;
      }
    }
    if (!v2502 && v2487.getNode(v2499)?.type === "junction") {
      if (isArchitectureDirectionX(v2500)) {
        v2508 += v2500 === "L" ? v2491 : -v2491;
      } else {
        v2509 += v2500 === "T" ? v2491 : -v2491;
      }
    }
    if (v2494[0]._private.rscratch) {
      const v2511 = v2485.insert("g");
      v2511.insert("path").attr("d", "M " + v2504 + "," + v2505 + " L " + v2506 + "," + v2507 + " L" + v2508 + "," + v2509 + " ").attr("class", "edge").attr("id", v2488 + "-" + v22(v2495, v2499, {
        prefix: "L"
      }));
      if (v2497) {
        const v2512 = isArchitectureDirectionX(v2496) ? ArchitectureDirectionArrowShift[v2496](v2504, v2492) : v2504 - v2493;
        const v2513 = isArchitectureDirectionY(v2496) ? ArchitectureDirectionArrowShift[v2496](v2505, v2492) : v2505 - v2493;
        v2511.insert("polygon").attr("points", ArchitectureDirectionArrow[v2496](v2492)).attr("transform", "translate(" + v2512 + "," + v2513 + ")").attr("class", "arrow");
      }
      if (v2501) {
        const v2514 = isArchitectureDirectionX(v2500) ? ArchitectureDirectionArrowShift[v2500](v2508, v2492) : v2508 - v2493;
        const v2515 = isArchitectureDirectionY(v2500) ? ArchitectureDirectionArrowShift[v2500](v2509, v2492) : v2509 - v2493;
        v2511.insert("polygon").attr("points", ArchitectureDirectionArrow[v2500](v2492)).attr("transform", "translate(" + v2514 + "," + v2515 + ")").attr("class", "arrow");
      }
      if (v2503) {
        const v2516 = !isArchitectureDirectionXY(v2496, v2500) ? isArchitectureDirectionX(v2496) ? "X" : "Y" : "XY";
        let v2517 = 0;
        if (v2516 === "X") {
          v2517 = Math.abs(v2504 - v2508);
        } else if (v2516 === "Y") {
          v2517 = Math.abs(v2505 - v2509) / 1.5;
        } else {
          v2517 = Math.abs(v2504 - v2508) / 2;
        }
        const v2518 = v2511.append("g");
        await v18(v2518, v2503, {
          useHtmlLabels: false,
          width: v2517,
          classes: "architecture-service-label"
        }, v17());
        v2518.attr("dy", "1em").attr("alignment-baseline", "middle").attr("dominant-baseline", "middle").attr("text-anchor", "middle");
        if (v2516 === "X") {
          v2518.attr("transform", "translate(" + v2506 + ", " + v2507 + ")");
        } else if (v2516 === "Y") {
          v2518.attr("transform", "translate(" + v2506 + ", " + v2507 + ") rotate(-90)");
        } else if (v2516 === "XY") {
          const v2519 = getArchitectureDirectionPair(v2496, v2500);
          if (v2519 && isArchitecturePairXY(v2519)) {
            const v2520 = v2518.node().getBoundingClientRect();
            const [v2521, v2522] = getArchitectureDirectionXYFactors(v2519);
            v2518.attr("dominant-baseline", "auto").attr("transform", "rotate(" + v2521 * -1 * v2522 * 45 + ")");
            const v2523 = v2518.node().getBoundingClientRect();
            v2518.attr("transform", "\n                translate(" + v2506 + ", " + (v2507 - v2520.height / 2) + ")\n                translate(" + v2521 * v2523.width / 2 + ", " + v2522 * v2523.height / 2 + ")\n                rotate(" + v2521 * -1 * v2522 * 45 + ", 0, " + v2520.height / 2 + ")\n              ");
          }
        }
      }
    }
  }));
}, "drawEdges");
var drawGroups = v3(async function (v2524, v2525, v2526, v2527) {
  const v2528 = v2526.getConfigField("padding");
  const v2529 = v2528 * 0.75;
  const v2530 = v2526.getConfigField("fontSize");
  const v2531 = v2526.getConfigField("iconSize");
  const v2532 = v2531 / 2;
  await Promise.all(v2525.nodes().map(async v2533 => {
    const v2534 = nodeData(v2533);
    if (v2534.type === "group") {
      const {
        h: v2535,
        w: v2536,
        x1: v2537,
        y1: v2538
      } = v2533.boundingBox();
      const v2539 = v2524.append("rect");
      v2539.attr("id", v2527 + "-group-" + v2534.id).attr("x", v2537 + v2532).attr("y", v2538 + v2532).attr("width", v2536).attr("height", v2535).attr("class", "node-bkg");
      const v2540 = v2524.append("g");
      let v2541 = v2537;
      let v2542 = v2538;
      if (v2534.icon) {
        const v2543 = v2540.append("g");
        v2543.html("<g>" + (await v19(v2534.icon, {
          height: v2529,
          width: v2529,
          fallbackPrefix: architectureIcons.prefix
        })) + "</g>");
        v2543.attr("transform", "translate(" + (v2541 + v2532 + 1) + ", " + (v2542 + v2532 + 1) + ")");
        v2541 += v2529;
        v2542 += v2530 / 2 - 1 - 2;
      }
      if (v2534.label) {
        const v2544 = v2540.append("g");
        await v18(v2544, v2534.label, {
          useHtmlLabels: false,
          width: v2536,
          classes: "architecture-service-label"
        }, v17());
        v2544.attr("dy", "1em").attr("alignment-baseline", "middle").attr("dominant-baseline", "start").attr("text-anchor", "start");
        v2544.attr("transform", "translate(" + (v2541 + v2532 + 4) + ", " + (v2542 + v2532 + 2) + ")");
      }
      v2526.setElementForId(v2534.id, v2539);
    }
  }));
}, "drawGroups");
var drawServices = v3(async function (v2545, v2546, v2547, v2548) {
  const v2549 = v17();
  for (const v2550 of v2547) {
    const v2551 = v2546.append("g");
    const v2552 = v2545.getConfigField("iconSize");
    if (v2550.title) {
      const v2553 = v2551.append("g");
      await v18(v2553, v2550.title, {
        useHtmlLabels: false,
        width: v2552 * 1.5,
        classes: "architecture-service-label"
      }, v2549);
      v2553.attr("dy", "1em").attr("alignment-baseline", "middle").attr("dominant-baseline", "middle").attr("text-anchor", "middle");
      v2553.attr("transform", "translate(" + v2552 / 2 + ", " + v2552 + ")");
    }
    const v2554 = v2551.append("g");
    if (v2550.icon) {
      v2554.html("<g>" + (await v19(v2550.icon, {
        height: v2552,
        width: v2552,
        fallbackPrefix: architectureIcons.prefix
      })) + "</g>");
    } else if (v2550.iconText) {
      v2554.html("<g>" + (await v19("blank", {
        height: v2552,
        width: v2552,
        fallbackPrefix: architectureIcons.prefix
      })) + "</g>");
      const v2555 = v2554.append("g");
      const v2556 = v2555.append("foreignObject").attr("width", v2552).attr("height", v2552);
      const v2557 = v2556.append("div").attr("class", "node-icon-text").attr("style", "height: " + v2552 + "px;").append("div").html(v20(v2550.iconText, v2549));
      const v2558 = parseInt(window.getComputedStyle(v2557.node(), null).getPropertyValue("font-size").replace(/\D/g, "")) ?? 16;
      v2557.attr("style", "-webkit-line-clamp: " + Math.floor((v2552 - 2) / v2558) + ";");
    } else {
      v2554.append("path").attr("class", "node-bkg").attr("id", v2548 + "-node-" + v2550.id).attr("d", "M0," + v2552 + " V5 Q0,0 5,0 H" + (v2552 - 5) + " Q" + v2552 + ",0 " + v2552 + ",5 V" + v2552 + " Z");
    }
    v2551.attr("id", v2548 + "-service-" + v2550.id).attr("class", "architecture-service");
    const {
      width: v2559,
      height: v2560
    } = v2551.node().getBBox();
    v2550.width = v2559;
    v2550.height = v2560;
    v2545.setElementForId(v2550.id, v2551);
  }
  return 0;
}, "drawServices");
var drawJunctions = v3(function (v2561, v2562, v2563, v2564) {
  v2563.forEach(v2565 => {
    const v2566 = v2562.append("g");
    const v2567 = v2561.getConfigField("iconSize");
    const v2568 = v2566.append("g");
    v2568.append("rect").attr("id", v2564 + "-node-" + v2565.id).attr("fill-opacity", "0").attr("width", v2567).attr("height", v2567);
    v2566.attr("class", "architecture-junction");
    const {
      width: v2569,
      height: v2570
    } = v2566._groups[0][0].getBBox();
    v2566.width = v2569;
    v2566.height = v2570;
    v2561.setElementForId(v2565.id, v2566);
  });
}, "drawJunctions");
v23([{
  name: architectureIcons.prefix,
  icons: architectureIcons
}]);
v26.use(fcose);
function addServices(v2571, v2572, v2573) {
  v2571.forEach(v2574 => {
    v2572.add({
      group: "nodes",
      data: {
        type: "service",
        id: v2574.id,
        icon: v2574.icon,
        label: v2574.title,
        parent: v2574.in,
        width: v2573.getConfigField("iconSize"),
        height: v2573.getConfigField("iconSize")
      },
      classes: "node-service"
    });
  });
}
v3(addServices, "addServices");
function addJunctions(v2575, v2576, v2577) {
  v2575.forEach(v2578 => {
    v2576.add({
      group: "nodes",
      data: {
        type: "junction",
        id: v2578.id,
        parent: v2578.in,
        width: v2577.getConfigField("iconSize"),
        height: v2577.getConfigField("iconSize")
      },
      classes: "node-junction"
    });
  });
}
v3(addJunctions, "addJunctions");
function positionNodes(v2579, v2580) {
  v2580.nodes().map(v2581 => {
    const v2582 = nodeData(v2581);
    if (v2582.type === "group") {
      return;
    }
    v2582.x = v2581.position().x;
    v2582.y = v2581.position().y;
    const v2583 = v2579.getElementById(v2582.id);
    v2583.attr("transform", "translate(" + (v2582.x || 0) + "," + (v2582.y || 0) + ")");
  });
}
v3(positionNodes, "positionNodes");
function addGroups(v2584, v2585) {
  v2584.forEach(v2586 => {
    v2585.add({
      group: "nodes",
      data: {
        type: "group",
        id: v2586.id,
        icon: v2586.icon,
        label: v2586.title,
        parent: v2586.in
      },
      classes: "node-group"
    });
  });
}
v3(addGroups, "addGroups");
function addEdges(v2587, v2588) {
  v2587.forEach(v2589 => {
    const {
      lhsId: v2590,
      rhsId: v2591,
      lhsInto: v2592,
      lhsGroup: v2593,
      rhsInto: v2594,
      lhsDir: v2595,
      rhsDir: v2596,
      rhsGroup: v2597,
      title: v2598
    } = v2589;
    const v2599 = isArchitectureDirectionXY(v2589.lhsDir, v2589.rhsDir) ? "segments" : "straight";
    const v2600 = {
      id: v2590 + "-" + v2591,
      label: v2598,
      source: v2590,
      sourceDir: v2595,
      sourceArrow: v2592,
      sourceGroup: v2593,
      sourceEndpoint: v2595 === "L" ? "0 50%" : v2595 === "R" ? "100% 50%" : v2595 === "T" ? "50% 0" : "50% 100%",
      target: v2591,
      targetDir: v2596,
      targetArrow: v2594,
      targetGroup: v2597,
      targetEndpoint: v2596 === "L" ? "0 50%" : v2596 === "R" ? "100% 50%" : v2596 === "T" ? "50% 0" : "50% 100%"
    };
    v2588.add({
      group: "edges",
      data: v2600,
      classes: v2599
    });
  });
}
v3(addEdges, "addEdges");
function getAlignments(v2601, v2602, v2603, v2604 = []) {
  const v2605 = v3((v2606, v2607) => {
    const v2608 = new Map();
    for (const [v2609, v2610] of v2606.entries()) {
      const v2611 = "" + v2609;
      let v2612 = 0;
      const v2613 = [...v2610.entries()];
      if (v2613.length === 1) {
        v2608.set(v2611, v2613[0][1]);
        continue;
      }
      for (let v2614 = 0; v2614 < v2613.length - 1; v2614++) {
        for (let v2615 = v2614 + 1; v2615 < v2613.length; v2615++) {
          const [v2616, v2617] = v2613[v2614];
          const [v2618, v2619] = v2613[v2615];
          const v2620 = v2603.get(architectureGroupAlignmentKey(v2616, v2618));
          if (v2620 === v2607) {
            v2608.set(v2611, [...(v2608.get(v2611) ?? []), ...v2617, ...v2619]);
          } else if (v2616 === "default" || v2618 === "default") {
            v2608.set(v2611, [...(v2608.get(v2611) ?? []), ...v2617, ...v2619]);
          } else {
            const v2621 = v2611 + "-" + v2612++;
            v2608.set(v2621, v2617);
            const v2622 = v2611 + "-" + v2612++;
            v2608.set(v2622, v2619);
          }
        }
      }
    }
    return v2608;
  }, "flattenAlignments");
  const v2623 = v2602.map(v2624 => {
    const v2625 = new Map();
    const v2626 = new Map();
    v2624.forEach(([v2627, v2628], v2629) => {
      const v2630 = v2601.getNode(v2629)?.in ?? "default";
      const v2631 = v2625.get(v2628) ?? new Map();
      if (!v2625.has(v2628)) {
        v2625.set(v2628, v2631);
      }
      const v2632 = v2626.get(v2627) ?? new Map();
      if (!v2626.has(v2627)) {
        v2626.set(v2627, v2632);
      }
      for (const v2633 of [v2631, v2632]) {
        const v2634 = v2633.get(v2630) ?? [];
        if (!v2633.has(v2630)) {
          v2633.set(v2630, v2634);
        }
        v2634.push(v2629);
      }
    });
    return {
      horiz: [...v2605(v2625, "horizontal").values()].filter(v2635 => v2635.length > 1),
      vert: [...v2605(v2626, "vertical").values()].filter(v2636 => v2636.length > 1)
    };
  });
  const [v2637, v2638] = v2623.reduce(([v2639, v2640], {
    horiz: v2641,
    vert: v2642
  }) => {
    return [[...v2639, ...v2641], [...v2640, ...v2642]];
  }, [[], []]);
  const v2643 = new Set();
  v2604.forEach(v2644 => v2644.members.forEach(v2645 => v2643.add(v2645)));
  const v2646 = v3(v2647 => v2647.filter(v2648 => !v2648.some(v2649 => v2643.has(v2649))), "dropOverlapping");
  const v2650 = v2646(v2637);
  const v2651 = v2646(v2638);
  v2604.forEach(v2652 => {
    if (v2652.members.length < 2) {
      return;
    }
    if (v2652.direction === "row") {
      v2650.push([...v2652.members]);
    } else {
      v2651.push([...v2652.members]);
    }
  });
  return {
    horizontal: v2650,
    vertical: v2651
  };
}
v3(getAlignments, "getAlignments");
function getRelativeConstraints(v2653, v2654, v2655 = []) {
  const v2656 = [];
  const v2657 = v2654.getConfigField("iconSize");
  const v2658 = v2654.getConfigField("idealEdgeLengthMultiplier");
  const v2659 = v2658 * v2657;
  const v2660 = new Set();
  v2655.forEach(v2661 => {
    for (let v2662 = 0; v2662 < v2661.members.length - 1; v2662++) {
      const v2663 = v2661.members[v2662];
      const v2664 = v2661.members[v2662 + 1];
      v2660.add(v2663 + "|" + v2664);
      v2660.add(v2664 + "|" + v2663);
      if (v2661.direction === "row") {
        v2656.push({
          left: v2663,
          right: v2664,
          gap: v2659
        });
      } else {
        v2656.push({
          top: v2663,
          bottom: v2664,
          gap: v2659
        });
      }
    }
  });
  const v2665 = v3(v2666 => v2666[0] + "," + v2666[1], "posToStr");
  const v2667 = v3(v2668 => v2668.split(",").map(v2669 => parseInt(v2669)), "strToPos");
  v2653.forEach(v2670 => {
    const v2671 = new Map([...v2670.entries()].map(([v2672, v2673]) => [v2665(v2673), v2672]));
    const v2674 = [v2665([0, 0])];
    const v2675 = {};
    const v2676 = {
      L: [-1, 0],
      R: [1, 0],
      T: [0, 1],
      B: [0, -1]
    };
    while (v2674.length > 0) {
      const v2677 = v2674.shift();
      if (v2677) {
        v2675[v2677] = 1;
        const v2678 = v2671.get(v2677);
        if (v2678) {
          const v2679 = v2667(v2677);
          Object.entries(v2676).forEach(([v2680, v2681]) => {
            const v2682 = v2665([v2679[0] + v2681[0], v2679[1] + v2681[1]]);
            const v2683 = v2671.get(v2682);
            if (v2683 && !v2675[v2682]) {
              v2674.push(v2682);
              if (v2660.has(v2678 + "|" + v2683)) {
                return;
              }
              v2656.push({
                [ArchitectureDirectionName[v2680]]: v2683,
                [ArchitectureDirectionName[getOppositeArchitectureDirection(v2680)]]: v2678,
                gap: v2658 * v2657
              });
            }
          });
        }
      }
    }
  });
  return v2656;
}
v3(getRelativeConstraints, "getRelativeConstraints");
function layoutArchitecture(v2684, v2685, v2686, v2687, v2688, {
  spatialMaps: v2689,
  groupAlignments: v2690
}) {
  return new Promise(v2691 => {
    const v2692 = v21("body").append("div").attr("id", "cy").attr("style", "display:none");
    const v2693 = v26({
      container: document.getElementById("cy"),
      style: [{
        selector: "edge",
        style: {
          "curve-style": "straight",
          "source-endpoint": "data(sourceEndpoint)",
          "target-endpoint": "data(targetEndpoint)"
        }
      }, {
        selector: "edge[label]",
        style: {
          label: "data(label)"
        }
      }, {
        selector: "edge.segments",
        style: {
          "curve-style": "segments",
          "segment-weights": "0",
          "segment-distances": [0.5],
          "edge-distances": "endpoints",
          "source-endpoint": "data(sourceEndpoint)",
          "target-endpoint": "data(targetEndpoint)"
        }
      }, {
        selector: "node",
        style: {
          "compound-sizing-wrt-labels": "include"
        }
      }, {
        selector: "node[label]",
        style: {
          "text-valign": "bottom",
          "text-halign": "center",
          "font-size": v2688.getConfigField("fontSize") + "px"
        }
      }, {
        selector: ".node-service",
        style: {
          label: "data(label)",
          width: "data(width)",
          height: "data(height)"
        }
      }, {
        selector: ".node-junction",
        style: {
          width: "data(width)",
          height: "data(height)"
        }
      }, {
        selector: ".node-group",
        style: {
          padding: v2688.getConfigField("padding") + "px"
        }
      }],
      layout: {
        name: "grid",
        boundingBox: {
          x1: 0,
          x2: 100,
          y1: 0,
          y2: 100
        }
      }
    });
    v2692.remove();
    addGroups(v2686, v2693);
    addServices(v2684, v2693, v2688);
    addJunctions(v2685, v2693, v2688);
    addEdges(v2687, v2693);
    const v2694 = v2688.getLayoutHints();
    const v2695 = getAlignments(v2688, v2689, v2690, v2694);
    const v2696 = getRelativeConstraints(v2689, v2688, v2694);
    const v2697 = v2688.getConfigField("iconSize");
    const v2698 = v2688.getConfigField("idealEdgeLengthMultiplier") * v2697;
    const v2699 = v2697 * 0.5;
    const v2700 = v2688.getConfigField("edgeElasticity");
    const v2701 = v2688.getConfigField("seed");
    const v2702 = v2693.layout({
      name: "fcose",
      quality: "proof",
      randomize: v2688.getConfigField("randomize"),
      nodeSeparation: v2688.getConfigField("nodeSeparation"),
      numIter: v2688.getConfigField("numIter"),
      styleEnabled: false,
      animate: false,
      nodeDimensionsIncludeLabels: false,
      idealEdgeLength(v2703) {
        const [v2704, v2705] = v2703.connectedNodes();
        const {
          parent: v2706
        } = nodeData(v2704);
        const {
          parent: v2707
        } = nodeData(v2705);
        if (v2706 === v2707) {
          return v2698;
        } else {
          return v2699;
        }
      },
      edgeElasticity(v2708) {
        const [v2709, v2710] = v2708.connectedNodes();
        const {
          parent: v2711
        } = nodeData(v2709);
        const {
          parent: v2712
        } = nodeData(v2710);
        if (v2711 === v2712) {
          return v2700;
        } else {
          return 0.001;
        }
      },
      alignmentConstraint: v2695,
      relativePlacementConstraint: v2696
    });
    v2702.one("layoutstop", () => {
      function v2713(v2714, v2715, v2716, v2717) {
        let v2718;
        let v2719;
        const {
          x: v2720,
          y: v2721
        } = v2714;
        const {
          x: v2722,
          y: v2723
        } = v2715;
        v2719 = (v2717 - v2721 + (v2720 - v2716) * (v2721 - v2723) / (v2720 - v2722)) / Math.sqrt(1 + Math.pow((v2721 - v2723) / (v2720 - v2722), 2));
        v2718 = Math.sqrt(Math.pow(v2717 - v2721, 2) + Math.pow(v2716 - v2720, 2) - Math.pow(v2719, 2));
        const v2724 = Math.sqrt(Math.pow(v2722 - v2720, 2) + Math.pow(v2723 - v2721, 2));
        v2718 = v2718 / v2724;
        let v2725 = (v2722 - v2720) * (v2717 - v2721) - (v2723 - v2721) * (v2716 - v2720);
        switch (true) {
          case v2725 >= 0:
            v2725 = 1;
            break;
          case v2725 < 0:
            v2725 = -1;
            break;
        }
        let v2726 = (v2722 - v2720) * (v2716 - v2720) + (v2723 - v2721) * (v2717 - v2721);
        switch (true) {
          case v2726 >= 0:
            v2726 = 1;
            break;
          case v2726 < 0:
            v2726 = -1;
            break;
        }
        v2719 = Math.abs(v2719) * v2725;
        v2718 = v2718 * v2726;
        return {
          distances: v2719,
          weights: v2718
        };
      }
      v3(v2713, "getSegmentWeights");
      v2693.startBatch();
      for (const v2727 of Object.values(v2693.edges())) {
        if (v2727.data?.()) {
          const {
            x: v2728,
            y: v2729
          } = v2727.source().position();
          const {
            x: v2730,
            y: v2731
          } = v2727.target().position();
          if (v2728 !== v2730 && v2729 !== v2731) {
            const v2732 = v2727.sourceEndpoint();
            const v2733 = v2727.targetEndpoint();
            const {
              sourceDir: v2734
            } = edgeData(v2727);
            const [v2735, v2736] = isArchitectureDirectionY(v2734) ? [v2732.x, v2733.y] : [v2733.x, v2732.y];
            const {
              weights: v2737,
              distances: v2738
            } = v2713(v2732, v2733, v2735, v2736);
            v2727.style("segment-distances", v2738);
            v2727.style("segment-weights", v2737);
          }
        }
      }
      v2693.endBatch();
      withSeededRandom(v2701, () => v2702.run());
    });
    try {
      withSeededRandom(v2701, () => v2702.run());
    } catch (v2739) {
      if (v2739 instanceof RangeError && v2739.message.includes("Invalid array length")) {
        throw new Error("Architecture layout failed: a declared `align row|column` directive likely contradicts the edge directions, or two declared alignments overlap on a shared node. Check that the order of members in each `align` chain is consistent with the edges between them, and that no node appears in two `align` directives along the same axis.");
      }
      throw v2739;
    }
    v2693.ready(v2740 => {
      v6.info("Ready", v2740);
      v2691(v2693);
    });
  });
}
v3(layoutArchitecture, "layoutArchitecture");
var draw = v3(async (v2741, v2742, v2743, v2744) => {
  const v2745 = v2744.db;
  v2745.setDiagramId(v2742);
  const v2746 = v2745.getServices();
  const v2747 = v2745.getJunctions();
  const v2748 = v2745.getGroups();
  const v2749 = v2745.getEdges();
  const v2750 = v2745.getDataStructures();
  const v2751 = v4(v2742);
  const v2752 = v2751.append("g");
  v2752.attr("class", "architecture-edges");
  const v2753 = v2751.append("g");
  v2753.attr("class", "architecture-services");
  const v2754 = v2751.append("g");
  v2754.attr("class", "architecture-groups");
  await drawServices(v2745, v2753, v2746, v2742);
  drawJunctions(v2745, v2753, v2747, v2742);
  const v2755 = await layoutArchitecture(v2746, v2747, v2748, v2749, v2745, v2750);
  await drawEdges(v2752, v2755, v2745, v2742);
  await drawGroups(v2754, v2755, v2745, v2742);
  positionNodes(v2745, v2755);
  v5(undefined, v2751, v2745.getConfigField("padding"), v2745.getConfigField("useMaxWidth"));
}, "draw");
var renderer = {
  draw: draw
};
var diagram = {
  parser: parser,
  get db() {
    return new ArchitectureDB();
  },
  renderer: renderer,
  styles: architectureStyles_default
};
export { diagram };