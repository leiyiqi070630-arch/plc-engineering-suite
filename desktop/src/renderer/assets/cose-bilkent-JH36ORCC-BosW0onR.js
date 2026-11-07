import { b8 as v1, _ as v2, l as v3, d as v4 } from "./index-CXb3UsfP.js";
import { c as v5 } from "./cytoscape.esm-Bx_1tVW-.js";
var cytoscapeCoseBilkent$1 = {
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
  (function (v6, v7) {
    (function v8(v9, v10) {
      v6.exports = v10();
    })(layoutBase, function () {
      return function (v11) {
        var v12 = {};
        function v13(v14) {
          if (v12[v14]) {
            return v12[v14].exports;
          }
          var v15 = v12[v14] = {
            i: v14,
            l: false,
            exports: {}
          };
          v11[v14].call(v15.exports, v15, v15.exports, v13);
          v15.l = true;
          return v15.exports;
        }
        v13.m = v11;
        v13.c = v12;
        v13.i = function (v16) {
          return v16;
        };
        v13.d = function (v17, v18, v19) {
          if (!v13.o(v17, v18)) {
            Object.defineProperty(v17, v18, {
              configurable: false,
              enumerable: true,
              get: v19
            });
          }
        };
        v13.n = function (v20) {
          var v21 = v20 && v20.__esModule ? function v22() {
            return v20.default;
          } : function v23() {
            return v20;
          };
          v13.d(v21, "a", v21);
          return v21;
        };
        v13.o = function (v24, v25) {
          return Object.prototype.hasOwnProperty.call(v24, v25);
        };
        v13.p = "";
        return v13(v13.s = 26);
      }([function (v26, v27, v28) {
        function v29() {}
        v29.QUALITY = 1;
        v29.DEFAULT_CREATE_BENDS_AS_NEEDED = false;
        v29.DEFAULT_INCREMENTAL = false;
        v29.DEFAULT_ANIMATION_ON_LAYOUT = true;
        v29.DEFAULT_ANIMATION_DURING_LAYOUT = false;
        v29.DEFAULT_ANIMATION_PERIOD = 50;
        v29.DEFAULT_UNIFORM_LEAF_NODE_SIZES = false;
        v29.DEFAULT_GRAPH_MARGIN = 15;
        v29.NODE_DIMENSIONS_INCLUDE_LABELS = false;
        v29.SIMPLE_NODE_SIZE = 40;
        v29.SIMPLE_NODE_HALF_SIZE = v29.SIMPLE_NODE_SIZE / 2;
        v29.EMPTY_COMPOUND_NODE_SIZE = 40;
        v29.MIN_EDGE_LENGTH = 1;
        v29.WORLD_BOUNDARY = 1000000;
        v29.INITIAL_WORLD_BOUNDARY = v29.WORLD_BOUNDARY / 1000;
        v29.WORLD_CENTER_X = 1200;
        v29.WORLD_CENTER_Y = 900;
        v26.exports = v29;
      }, function (v30, v31, v32) {
        var v33 = v32(2);
        var v34 = v32(8);
        var v35 = v32(9);
        function v36(v37, v38, v39) {
          v33.call(this, v39);
          this.isOverlapingSourceAndTarget = false;
          this.vGraphObject = v39;
          this.bendpoints = [];
          this.source = v37;
          this.target = v38;
        }
        v36.prototype = Object.create(v33.prototype);
        for (var v40 in v33) {
          v36[v40] = v33[v40];
        }
        v36.prototype.getSource = function () {
          return this.source;
        };
        v36.prototype.getTarget = function () {
          return this.target;
        };
        v36.prototype.isInterGraph = function () {
          return this.isInterGraph;
        };
        v36.prototype.getLength = function () {
          return this.length;
        };
        v36.prototype.isOverlapingSourceAndTarget = function () {
          return this.isOverlapingSourceAndTarget;
        };
        v36.prototype.getBendpoints = function () {
          return this.bendpoints;
        };
        v36.prototype.getLca = function () {
          return this.lca;
        };
        v36.prototype.getSourceInLca = function () {
          return this.sourceInLca;
        };
        v36.prototype.getTargetInLca = function () {
          return this.targetInLca;
        };
        v36.prototype.getOtherEnd = function (v41) {
          if (this.source === v41) {
            return this.target;
          } else if (this.target === v41) {
            return this.source;
          } else {
            throw "Node is not incident with this edge";
          }
        };
        v36.prototype.getOtherEndInGraph = function (v42, v43) {
          var v44 = this.getOtherEnd(v42);
          var v45 = v43.getGraphManager().getRoot();
          while (true) {
            if (v44.getOwner() == v43) {
              return v44;
            }
            if (v44.getOwner() == v45) {
              break;
            }
            v44 = v44.getOwner().getParent();
          }
          return null;
        };
        v36.prototype.updateLength = function () {
          var v46 = new Array(4);
          this.isOverlapingSourceAndTarget = v34.getIntersection(this.target.getRect(), this.source.getRect(), v46);
          if (!this.isOverlapingSourceAndTarget) {
            this.lengthX = v46[0] - v46[2];
            this.lengthY = v46[1] - v46[3];
            if (Math.abs(this.lengthX) < 1) {
              this.lengthX = v35.sign(this.lengthX);
            }
            if (Math.abs(this.lengthY) < 1) {
              this.lengthY = v35.sign(this.lengthY);
            }
            this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
          }
        };
        v36.prototype.updateLengthSimple = function () {
          this.lengthX = this.target.getCenterX() - this.source.getCenterX();
          this.lengthY = this.target.getCenterY() - this.source.getCenterY();
          if (Math.abs(this.lengthX) < 1) {
            this.lengthX = v35.sign(this.lengthX);
          }
          if (Math.abs(this.lengthY) < 1) {
            this.lengthY = v35.sign(this.lengthY);
          }
          this.length = Math.sqrt(this.lengthX * this.lengthX + this.lengthY * this.lengthY);
        };
        v30.exports = v36;
      }, function (v47, v48, v49) {
        function v50(v51) {
          this.vGraphObject = v51;
        }
        v47.exports = v50;
      }, function (v52, v53, v54) {
        var v55 = v54(2);
        var v56 = v54(10);
        var v57 = v54(13);
        var v58 = v54(0);
        var v59 = v54(16);
        var v60 = v54(4);
        function v61(v62, v63, v64, v65) {
          if (v64 == null && v65 == null) {
            v65 = v63;
          }
          v55.call(this, v65);
          if (v62.graphManager != null) {
            v62 = v62.graphManager;
          }
          this.estimatedSize = v56.MIN_VALUE;
          this.inclusionTreeDepth = v56.MAX_VALUE;
          this.vGraphObject = v65;
          this.edges = [];
          this.graphManager = v62;
          if (v64 != null && v63 != null) {
            this.rect = new v57(v63.x, v63.y, v64.width, v64.height);
          } else {
            this.rect = new v57();
          }
        }
        v61.prototype = Object.create(v55.prototype);
        for (var v66 in v55) {
          v61[v66] = v55[v66];
        }
        v61.prototype.getEdges = function () {
          return this.edges;
        };
        v61.prototype.getChild = function () {
          return this.child;
        };
        v61.prototype.getOwner = function () {
          return this.owner;
        };
        v61.prototype.getWidth = function () {
          return this.rect.width;
        };
        v61.prototype.setWidth = function (v67) {
          this.rect.width = v67;
        };
        v61.prototype.getHeight = function () {
          return this.rect.height;
        };
        v61.prototype.setHeight = function (v68) {
          this.rect.height = v68;
        };
        v61.prototype.getCenterX = function () {
          return this.rect.x + this.rect.width / 2;
        };
        v61.prototype.getCenterY = function () {
          return this.rect.y + this.rect.height / 2;
        };
        v61.prototype.getCenter = function () {
          return new v60(this.rect.x + this.rect.width / 2, this.rect.y + this.rect.height / 2);
        };
        v61.prototype.getLocation = function () {
          return new v60(this.rect.x, this.rect.y);
        };
        v61.prototype.getRect = function () {
          return this.rect;
        };
        v61.prototype.getDiagonal = function () {
          return Math.sqrt(this.rect.width * this.rect.width + this.rect.height * this.rect.height);
        };
        v61.prototype.getHalfTheDiagonal = function () {
          return Math.sqrt(this.rect.height * this.rect.height + this.rect.width * this.rect.width) / 2;
        };
        v61.prototype.setRect = function (v69, v70) {
          this.rect.x = v69.x;
          this.rect.y = v69.y;
          this.rect.width = v70.width;
          this.rect.height = v70.height;
        };
        v61.prototype.setCenter = function (v71, v72) {
          this.rect.x = v71 - this.rect.width / 2;
          this.rect.y = v72 - this.rect.height / 2;
        };
        v61.prototype.setLocation = function (v73, v74) {
          this.rect.x = v73;
          this.rect.y = v74;
        };
        v61.prototype.moveBy = function (v75, v76) {
          this.rect.x += v75;
          this.rect.y += v76;
        };
        v61.prototype.getEdgeListToNode = function (v77) {
          var v78 = [];
          var v79 = this;
          v79.edges.forEach(function (v80) {
            if (v80.target == v77) {
              if (v80.source != v79) {
                throw "Incorrect edge source!";
              }
              v78.push(v80);
            }
          });
          return v78;
        };
        v61.prototype.getEdgesBetween = function (v81) {
          var v82 = [];
          var v83 = this;
          v83.edges.forEach(function (v84) {
            if (v84.source != v83 && v84.target != v83) {
              throw "Incorrect edge source and/or target";
            }
            if (v84.target == v81 || v84.source == v81) {
              v82.push(v84);
            }
          });
          return v82;
        };
        v61.prototype.getNeighborsList = function () {
          var v85 = new Set();
          var v86 = this;
          v86.edges.forEach(function (v87) {
            if (v87.source == v86) {
              v85.add(v87.target);
            } else {
              if (v87.target != v86) {
                throw "Incorrect incidency!";
              }
              v85.add(v87.source);
            }
          });
          return v85;
        };
        v61.prototype.withChildren = function () {
          var v88 = new Set();
          var v89;
          var v90;
          v88.add(this);
          if (this.child != null) {
            var v91 = this.child.getNodes();
            for (var v92 = 0; v92 < v91.length; v92++) {
              v89 = v91[v92];
              v90 = v89.withChildren();
              v90.forEach(function (v93) {
                v88.add(v93);
              });
            }
          }
          return v88;
        };
        v61.prototype.getNoOfChildren = function () {
          var v94 = 0;
          var v95;
          if (this.child == null) {
            v94 = 1;
          } else {
            var v96 = this.child.getNodes();
            for (var v97 = 0; v97 < v96.length; v97++) {
              v95 = v96[v97];
              v94 += v95.getNoOfChildren();
            }
          }
          if (v94 == 0) {
            v94 = 1;
          }
          return v94;
        };
        v61.prototype.getEstimatedSize = function () {
          if (this.estimatedSize == v56.MIN_VALUE) {
            throw "assert failed";
          }
          return this.estimatedSize;
        };
        v61.prototype.calcEstimatedSize = function () {
          if (this.child == null) {
            return this.estimatedSize = (this.rect.width + this.rect.height) / 2;
          } else {
            this.estimatedSize = this.child.calcEstimatedSize();
            this.rect.width = this.estimatedSize;
            this.rect.height = this.estimatedSize;
            return this.estimatedSize;
          }
        };
        v61.prototype.scatter = function () {
          var v98;
          var v99;
          var v100 = -v58.INITIAL_WORLD_BOUNDARY;
          var v101 = v58.INITIAL_WORLD_BOUNDARY;
          v98 = v58.WORLD_CENTER_X + v59.nextDouble() * (v101 - v100) + v100;
          var v102 = -v58.INITIAL_WORLD_BOUNDARY;
          var v103 = v58.INITIAL_WORLD_BOUNDARY;
          v99 = v58.WORLD_CENTER_Y + v59.nextDouble() * (v103 - v102) + v102;
          this.rect.x = v98;
          this.rect.y = v99;
        };
        v61.prototype.updateBounds = function () {
          if (this.getChild() == null) {
            throw "assert failed";
          }
          if (this.getChild().getNodes().length != 0) {
            var v104 = this.getChild();
            v104.updateBounds(true);
            this.rect.x = v104.getLeft();
            this.rect.y = v104.getTop();
            this.setWidth(v104.getRight() - v104.getLeft());
            this.setHeight(v104.getBottom() - v104.getTop());
            if (v58.NODE_DIMENSIONS_INCLUDE_LABELS) {
              var v105 = v104.getRight() - v104.getLeft();
              var v106 = v104.getBottom() - v104.getTop();
              if (this.labelWidth > v105) {
                this.rect.x -= (this.labelWidth - v105) / 2;
                this.setWidth(this.labelWidth);
              }
              if (this.labelHeight > v106) {
                if (this.labelPos == "center") {
                  this.rect.y -= (this.labelHeight - v106) / 2;
                } else if (this.labelPos == "top") {
                  this.rect.y -= this.labelHeight - v106;
                }
                this.setHeight(this.labelHeight);
              }
            }
          }
        };
        v61.prototype.getInclusionTreeDepth = function () {
          if (this.inclusionTreeDepth == v56.MAX_VALUE) {
            throw "assert failed";
          }
          return this.inclusionTreeDepth;
        };
        v61.prototype.transform = function (v107) {
          var v108 = this.rect.x;
          if (v108 > v58.WORLD_BOUNDARY) {
            v108 = v58.WORLD_BOUNDARY;
          } else if (v108 < -v58.WORLD_BOUNDARY) {
            v108 = -v58.WORLD_BOUNDARY;
          }
          var v109 = this.rect.y;
          if (v109 > v58.WORLD_BOUNDARY) {
            v109 = v58.WORLD_BOUNDARY;
          } else if (v109 < -v58.WORLD_BOUNDARY) {
            v109 = -v58.WORLD_BOUNDARY;
          }
          var v110 = new v60(v108, v109);
          var v111 = v107.inverseTransformPoint(v110);
          this.setLocation(v111.x, v111.y);
        };
        v61.prototype.getLeft = function () {
          return this.rect.x;
        };
        v61.prototype.getRight = function () {
          return this.rect.x + this.rect.width;
        };
        v61.prototype.getTop = function () {
          return this.rect.y;
        };
        v61.prototype.getBottom = function () {
          return this.rect.y + this.rect.height;
        };
        v61.prototype.getParent = function () {
          if (this.owner == null) {
            return null;
          }
          return this.owner.getParent();
        };
        v52.exports = v61;
      }, function (v112, v113, v114) {
        function v115(v116, v117) {
          if (v116 == null && v117 == null) {
            this.x = 0;
            this.y = 0;
          } else {
            this.x = v116;
            this.y = v117;
          }
        }
        v115.prototype.getX = function () {
          return this.x;
        };
        v115.prototype.getY = function () {
          return this.y;
        };
        v115.prototype.setX = function (v118) {
          this.x = v118;
        };
        v115.prototype.setY = function (v119) {
          this.y = v119;
        };
        v115.prototype.getDifference = function (v120) {
          return new DimensionD(this.x - v120.x, this.y - v120.y);
        };
        v115.prototype.getCopy = function () {
          return new v115(this.x, this.y);
        };
        v115.prototype.translate = function (v121) {
          this.x += v121.width;
          this.y += v121.height;
          return this;
        };
        v112.exports = v115;
      }, function (v122, v123, v124) {
        var v125 = v124(2);
        var v126 = v124(10);
        var v127 = v124(0);
        var v128 = v124(6);
        var v129 = v124(3);
        var v130 = v124(1);
        var v131 = v124(13);
        var v132 = v124(12);
        var v133 = v124(11);
        function v134(v135, v136, v137) {
          v125.call(this, v137);
          this.estimatedSize = v126.MIN_VALUE;
          this.margin = v127.DEFAULT_GRAPH_MARGIN;
          this.edges = [];
          this.nodes = [];
          this.isConnected = false;
          this.parent = v135;
          if (v136 != null && v136 instanceof v128) {
            this.graphManager = v136;
          } else if (v136 != null && v136 instanceof Layout) {
            this.graphManager = v136.graphManager;
          }
        }
        v134.prototype = Object.create(v125.prototype);
        for (var v138 in v125) {
          v134[v138] = v125[v138];
        }
        v134.prototype.getNodes = function () {
          return this.nodes;
        };
        v134.prototype.getEdges = function () {
          return this.edges;
        };
        v134.prototype.getGraphManager = function () {
          return this.graphManager;
        };
        v134.prototype.getParent = function () {
          return this.parent;
        };
        v134.prototype.getLeft = function () {
          return this.left;
        };
        v134.prototype.getRight = function () {
          return this.right;
        };
        v134.prototype.getTop = function () {
          return this.top;
        };
        v134.prototype.getBottom = function () {
          return this.bottom;
        };
        v134.prototype.isConnected = function () {
          return this.isConnected;
        };
        v134.prototype.add = function (v139, v140, v141) {
          if (v140 == null && v141 == null) {
            var v142 = v139;
            if (this.graphManager == null) {
              throw "Graph has no graph mgr!";
            }
            if (this.getNodes().indexOf(v142) > -1) {
              throw "Node already in graph!";
            }
            v142.owner = this;
            this.getNodes().push(v142);
            return v142;
          } else {
            var v143 = v139;
            if (!(this.getNodes().indexOf(v140) > -1) || !(this.getNodes().indexOf(v141) > -1)) {
              throw "Source or target not in graph!";
            }
            if (v140.owner != v141.owner || v140.owner != this) {
              throw "Both owners must be this graph!";
            }
            if (v140.owner != v141.owner) {
              return null;
            }
            v143.source = v140;
            v143.target = v141;
            v143.isInterGraph = false;
            this.getEdges().push(v143);
            v140.edges.push(v143);
            if (v141 != v140) {
              v141.edges.push(v143);
            }
            return v143;
          }
        };
        v134.prototype.remove = function (v144) {
          var v145 = v144;
          if (v144 instanceof v129) {
            if (v145 == null) {
              throw "Node is null!";
            }
            if (v145.owner == null || v145.owner != this) {
              throw "Owner graph is invalid!";
            }
            if (this.graphManager == null) {
              throw "Owner graph manager is invalid!";
            }
            var v146 = v145.edges.slice();
            var v147;
            var v148 = v146.length;
            for (var v149 = 0; v149 < v148; v149++) {
              v147 = v146[v149];
              if (v147.isInterGraph) {
                this.graphManager.remove(v147);
              } else {
                v147.source.owner.remove(v147);
              }
            }
            var v150 = this.nodes.indexOf(v145);
            if (v150 == -1) {
              throw "Node not in owner node list!";
            }
            this.nodes.splice(v150, 1);
          } else if (v144 instanceof v130) {
            var v147 = v144;
            if (v147 == null) {
              throw "Edge is null!";
            }
            if (v147.source == null || v147.target == null) {
              throw "Source and/or target is null!";
            }
            if (v147.source.owner == null || v147.target.owner == null || v147.source.owner != this || v147.target.owner != this) {
              throw "Source and/or target owner is invalid!";
            }
            var v151 = v147.source.edges.indexOf(v147);
            var v152 = v147.target.edges.indexOf(v147);
            if (!(v151 > -1) || !(v152 > -1)) {
              throw "Source and/or target doesn't know this edge!";
            }
            v147.source.edges.splice(v151, 1);
            if (v147.target != v147.source) {
              v147.target.edges.splice(v152, 1);
            }
            var v150 = v147.source.owner.getEdges().indexOf(v147);
            if (v150 == -1) {
              throw "Not in owner's edge list!";
            }
            v147.source.owner.getEdges().splice(v150, 1);
          }
        };
        v134.prototype.updateLeftTop = function () {
          var v153 = v126.MAX_VALUE;
          var v154 = v126.MAX_VALUE;
          var v155;
          var v156;
          var v157;
          var v158 = this.getNodes();
          var v159 = v158.length;
          for (var v160 = 0; v160 < v159; v160++) {
            var v161 = v158[v160];
            v155 = v161.getTop();
            v156 = v161.getLeft();
            if (v153 > v155) {
              v153 = v155;
            }
            if (v154 > v156) {
              v154 = v156;
            }
          }
          if (v153 == v126.MAX_VALUE) {
            return null;
          }
          if (v158[0].getParent().paddingLeft != undefined) {
            v157 = v158[0].getParent().paddingLeft;
          } else {
            v157 = this.margin;
          }
          this.left = v154 - v157;
          this.top = v153 - v157;
          return new v132(this.left, this.top);
        };
        v134.prototype.updateBounds = function (v162) {
          var v163 = v126.MAX_VALUE;
          var v164 = -v126.MAX_VALUE;
          var v165 = v126.MAX_VALUE;
          var v166 = -v126.MAX_VALUE;
          var v167;
          var v168;
          var v169;
          var v170;
          var v171;
          var v172 = this.nodes;
          var v173 = v172.length;
          for (var v174 = 0; v174 < v173; v174++) {
            var v175 = v172[v174];
            if (v162 && v175.child != null) {
              v175.updateBounds();
            }
            v167 = v175.getLeft();
            v168 = v175.getRight();
            v169 = v175.getTop();
            v170 = v175.getBottom();
            if (v163 > v167) {
              v163 = v167;
            }
            if (v164 < v168) {
              v164 = v168;
            }
            if (v165 > v169) {
              v165 = v169;
            }
            if (v166 < v170) {
              v166 = v170;
            }
          }
          var v176 = new v131(v163, v165, v164 - v163, v166 - v165);
          if (v163 == v126.MAX_VALUE) {
            this.left = this.parent.getLeft();
            this.right = this.parent.getRight();
            this.top = this.parent.getTop();
            this.bottom = this.parent.getBottom();
          }
          if (v172[0].getParent().paddingLeft != undefined) {
            v171 = v172[0].getParent().paddingLeft;
          } else {
            v171 = this.margin;
          }
          this.left = v176.x - v171;
          this.right = v176.x + v176.width + v171;
          this.top = v176.y - v171;
          this.bottom = v176.y + v176.height + v171;
        };
        v134.calculateBounds = function (v177) {
          var v178 = v126.MAX_VALUE;
          var v179 = -v126.MAX_VALUE;
          var v180 = v126.MAX_VALUE;
          var v181 = -v126.MAX_VALUE;
          var v182;
          var v183;
          var v184;
          var v185;
          var v186 = v177.length;
          for (var v187 = 0; v187 < v186; v187++) {
            var v188 = v177[v187];
            v182 = v188.getLeft();
            v183 = v188.getRight();
            v184 = v188.getTop();
            v185 = v188.getBottom();
            if (v178 > v182) {
              v178 = v182;
            }
            if (v179 < v183) {
              v179 = v183;
            }
            if (v180 > v184) {
              v180 = v184;
            }
            if (v181 < v185) {
              v181 = v185;
            }
          }
          var v189 = new v131(v178, v180, v179 - v178, v181 - v180);
          return v189;
        };
        v134.prototype.getInclusionTreeDepth = function () {
          if (this == this.graphManager.getRoot()) {
            return 1;
          } else {
            return this.parent.getInclusionTreeDepth();
          }
        };
        v134.prototype.getEstimatedSize = function () {
          if (this.estimatedSize == v126.MIN_VALUE) {
            throw "assert failed";
          }
          return this.estimatedSize;
        };
        v134.prototype.calcEstimatedSize = function () {
          var v190 = 0;
          var v191 = this.nodes;
          var v192 = v191.length;
          for (var v193 = 0; v193 < v192; v193++) {
            var v194 = v191[v193];
            v190 += v194.calcEstimatedSize();
          }
          if (v190 == 0) {
            this.estimatedSize = v127.EMPTY_COMPOUND_NODE_SIZE;
          } else {
            this.estimatedSize = v190 / Math.sqrt(this.nodes.length);
          }
          return this.estimatedSize;
        };
        v134.prototype.updateConnected = function () {
          var v195 = this;
          if (this.nodes.length == 0) {
            this.isConnected = true;
            return;
          }
          var v196 = new v133();
          var v197 = new Set();
          var v198 = this.nodes[0];
          var v199;
          var v200;
          var v201 = v198.withChildren();
          v201.forEach(function (v202) {
            v196.push(v202);
            v197.add(v202);
          });
          while (v196.length !== 0) {
            v198 = v196.shift();
            v199 = v198.getEdges();
            var v203 = v199.length;
            for (var v204 = 0; v204 < v203; v204++) {
              var v205 = v199[v204];
              v200 = v205.getOtherEndInGraph(v198, this);
              if (v200 != null && !v197.has(v200)) {
                var v206 = v200.withChildren();
                v206.forEach(function (v207) {
                  v196.push(v207);
                  v197.add(v207);
                });
              }
            }
          }
          this.isConnected = false;
          if (v197.size >= this.nodes.length) {
            var v208 = 0;
            v197.forEach(function (v209) {
              if (v209.owner == v195) {
                v208++;
              }
            });
            if (v208 == this.nodes.length) {
              this.isConnected = true;
            }
          }
        };
        v122.exports = v134;
      }, function (v210, v211, v212) {
        var v213;
        var v214 = v212(1);
        function v215(v216) {
          v213 = v212(5);
          this.layout = v216;
          this.graphs = [];
          this.edges = [];
        }
        v215.prototype.addRoot = function () {
          var v217 = this.layout.newGraph();
          var v218 = this.layout.newNode(null);
          var v219 = this.add(v217, v218);
          this.setRootGraph(v219);
          return this.rootGraph;
        };
        v215.prototype.add = function (v220, v221, v222, v223, v224) {
          if (v222 == null && v223 == null && v224 == null) {
            if (v220 == null) {
              throw "Graph is null!";
            }
            if (v221 == null) {
              throw "Parent node is null!";
            }
            if (this.graphs.indexOf(v220) > -1) {
              throw "Graph already in this graph mgr!";
            }
            this.graphs.push(v220);
            if (v220.parent != null) {
              throw "Already has a parent!";
            }
            if (v221.child != null) {
              throw "Already has a child!";
            }
            v220.parent = v221;
            v221.child = v220;
            return v220;
          } else {
            v224 = v222;
            v223 = v221;
            v222 = v220;
            var v225 = v223.getOwner();
            var v226 = v224.getOwner();
            if (v225 == null || v225.getGraphManager() != this) {
              throw "Source not in this graph mgr!";
            }
            if (v226 == null || v226.getGraphManager() != this) {
              throw "Target not in this graph mgr!";
            }
            if (v225 == v226) {
              v222.isInterGraph = false;
              return v225.add(v222, v223, v224);
            } else {
              v222.isInterGraph = true;
              v222.source = v223;
              v222.target = v224;
              if (this.edges.indexOf(v222) > -1) {
                throw "Edge already in inter-graph edge list!";
              }
              this.edges.push(v222);
              if (v222.source == null || v222.target == null) {
                throw "Edge source and/or target is null!";
              }
              if (v222.source.edges.indexOf(v222) != -1 || v222.target.edges.indexOf(v222) != -1) {
                throw "Edge already in source and/or target incidency list!";
              }
              v222.source.edges.push(v222);
              v222.target.edges.push(v222);
              return v222;
            }
          }
        };
        v215.prototype.remove = function (v227) {
          if (v227 instanceof v213) {
            var v228 = v227;
            if (v228.getGraphManager() != this) {
              throw "Graph not in this graph mgr";
            }
            if (v228 != this.rootGraph && (v228.parent == null || v228.parent.graphManager != this)) {
              throw "Invalid parent node!";
            }
            var v229 = [];
            v229 = v229.concat(v228.getEdges());
            var v230;
            var v231 = v229.length;
            for (var v232 = 0; v232 < v231; v232++) {
              v230 = v229[v232];
              v228.remove(v230);
            }
            var v233 = [];
            v233 = v233.concat(v228.getNodes());
            var v234;
            v231 = v233.length;
            for (var v232 = 0; v232 < v231; v232++) {
              v234 = v233[v232];
              v228.remove(v234);
            }
            if (v228 == this.rootGraph) {
              this.setRootGraph(null);
            }
            var v235 = this.graphs.indexOf(v228);
            this.graphs.splice(v235, 1);
            v228.parent = null;
          } else if (v227 instanceof v214) {
            v230 = v227;
            if (v230 == null) {
              throw "Edge is null!";
            }
            if (!v230.isInterGraph) {
              throw "Not an inter-graph edge!";
            }
            if (v230.source == null || v230.target == null) {
              throw "Source and/or target is null!";
            }
            if (v230.source.edges.indexOf(v230) == -1 || v230.target.edges.indexOf(v230) == -1) {
              throw "Source and/or target doesn't know this edge!";
            }
            var v235 = v230.source.edges.indexOf(v230);
            v230.source.edges.splice(v235, 1);
            v235 = v230.target.edges.indexOf(v230);
            v230.target.edges.splice(v235, 1);
            if (v230.source.owner == null || v230.source.owner.getGraphManager() == null) {
              throw "Edge owner graph or owner graph manager is null!";
            }
            if (v230.source.owner.getGraphManager().edges.indexOf(v230) == -1) {
              throw "Not in owner graph manager's edge list!";
            }
            var v235 = v230.source.owner.getGraphManager().edges.indexOf(v230);
            v230.source.owner.getGraphManager().edges.splice(v235, 1);
          }
        };
        v215.prototype.updateBounds = function () {
          this.rootGraph.updateBounds(true);
        };
        v215.prototype.getGraphs = function () {
          return this.graphs;
        };
        v215.prototype.getAllNodes = function () {
          if (this.allNodes == null) {
            var v236 = [];
            var v237 = this.getGraphs();
            var v238 = v237.length;
            for (var v239 = 0; v239 < v238; v239++) {
              v236 = v236.concat(v237[v239].getNodes());
            }
            this.allNodes = v236;
          }
          return this.allNodes;
        };
        v215.prototype.resetAllNodes = function () {
          this.allNodes = null;
        };
        v215.prototype.resetAllEdges = function () {
          this.allEdges = null;
        };
        v215.prototype.resetAllNodesToApplyGravitation = function () {
          this.allNodesToApplyGravitation = null;
        };
        v215.prototype.getAllEdges = function () {
          if (this.allEdges == null) {
            var v240 = [];
            var v241 = this.getGraphs();
            v241.length;
            for (var v242 = 0; v242 < v241.length; v242++) {
              v240 = v240.concat(v241[v242].getEdges());
            }
            v240 = v240.concat(this.edges);
            this.allEdges = v240;
          }
          return this.allEdges;
        };
        v215.prototype.getAllNodesToApplyGravitation = function () {
          return this.allNodesToApplyGravitation;
        };
        v215.prototype.setAllNodesToApplyGravitation = function (v243) {
          if (this.allNodesToApplyGravitation != null) {
            throw "assert failed";
          }
          this.allNodesToApplyGravitation = v243;
        };
        v215.prototype.getRoot = function () {
          return this.rootGraph;
        };
        v215.prototype.setRootGraph = function (v244) {
          if (v244.getGraphManager() != this) {
            throw "Root not in this graph mgr!";
          }
          this.rootGraph = v244;
          if (v244.parent == null) {
            v244.parent = this.layout.newNode("Root node");
          }
        };
        v215.prototype.getLayout = function () {
          return this.layout;
        };
        v215.prototype.isOneAncestorOfOther = function (v245, v246) {
          if (v245 == null || v246 == null) {
            throw "assert failed";
          }
          if (v245 == v246) {
            return true;
          }
          var v247 = v245.getOwner();
          var v248;
          do {
            v248 = v247.getParent();
            if (v248 == null) {
              break;
            }
            if (v248 == v246) {
              return true;
            }
            v247 = v248.getOwner();
            if (v247 == null) {
              break;
            }
          } while (true);
          v247 = v246.getOwner();
          do {
            v248 = v247.getParent();
            if (v248 == null) {
              break;
            }
            if (v248 == v245) {
              return true;
            }
            v247 = v248.getOwner();
            if (v247 == null) {
              break;
            }
          } while (true);
          return false;
        };
        v215.prototype.calcLowestCommonAncestors = function () {
          var v249;
          var v250;
          var v251;
          var v252;
          var v253;
          var v254 = this.getAllEdges();
          var v255 = v254.length;
          for (var v256 = 0; v256 < v255; v256++) {
            v249 = v254[v256];
            v250 = v249.source;
            v251 = v249.target;
            v249.lca = null;
            v249.sourceInLca = v250;
            v249.targetInLca = v251;
            if (v250 == v251) {
              v249.lca = v250.getOwner();
              continue;
            }
            v252 = v250.getOwner();
            while (v249.lca == null) {
              v249.targetInLca = v251;
              v253 = v251.getOwner();
              while (v249.lca == null) {
                if (v253 == v252) {
                  v249.lca = v253;
                  break;
                }
                if (v253 == this.rootGraph) {
                  break;
                }
                if (v249.lca != null) {
                  throw "assert failed";
                }
                v249.targetInLca = v253.getParent();
                v253 = v249.targetInLca.getOwner();
              }
              if (v252 == this.rootGraph) {
                break;
              }
              if (v249.lca == null) {
                v249.sourceInLca = v252.getParent();
                v252 = v249.sourceInLca.getOwner();
              }
            }
            if (v249.lca == null) {
              throw "assert failed";
            }
          }
        };
        v215.prototype.calcLowestCommonAncestor = function (v257, v258) {
          if (v257 == v258) {
            return v257.getOwner();
          }
          var v259 = v257.getOwner();
          do {
            if (v259 == null) {
              break;
            }
            var v260 = v258.getOwner();
            do {
              if (v260 == null) {
                break;
              }
              if (v260 == v259) {
                return v260;
              }
              v260 = v260.getParent().getOwner();
            } while (true);
            v259 = v259.getParent().getOwner();
          } while (true);
          return v259;
        };
        v215.prototype.calcInclusionTreeDepths = function (v261, v262) {
          if (v261 == null && v262 == null) {
            v261 = this.rootGraph;
            v262 = 1;
          }
          var v263;
          var v264 = v261.getNodes();
          var v265 = v264.length;
          for (var v266 = 0; v266 < v265; v266++) {
            v263 = v264[v266];
            v263.inclusionTreeDepth = v262;
            if (v263.child != null) {
              this.calcInclusionTreeDepths(v263.child, v262 + 1);
            }
          }
        };
        v215.prototype.includesInvalidEdge = function () {
          var v267;
          var v268 = this.edges.length;
          for (var v269 = 0; v269 < v268; v269++) {
            v267 = this.edges[v269];
            if (this.isOneAncestorOfOther(v267.source, v267.target)) {
              return true;
            }
          }
          return false;
        };
        v210.exports = v215;
      }, function (v270, v271, v272) {
        var v273 = v272(0);
        function v274() {}
        for (var v275 in v273) {
          v274[v275] = v273[v275];
        }
        v274.MAX_ITERATIONS = 2500;
        v274.DEFAULT_EDGE_LENGTH = 50;
        v274.DEFAULT_SPRING_STRENGTH = 0.45;
        v274.DEFAULT_REPULSION_STRENGTH = 4500;
        v274.DEFAULT_GRAVITY_STRENGTH = 0.4;
        v274.DEFAULT_COMPOUND_GRAVITY_STRENGTH = 1;
        v274.DEFAULT_GRAVITY_RANGE_FACTOR = 3.8;
        v274.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = 1.5;
        v274.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION = true;
        v274.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION = true;
        v274.DEFAULT_COOLING_FACTOR_INCREMENTAL = 0.3;
        v274.COOLING_ADAPTATION_FACTOR = 0.33;
        v274.ADAPTATION_LOWER_NODE_LIMIT = 1000;
        v274.ADAPTATION_UPPER_NODE_LIMIT = 5000;
        v274.MAX_NODE_DISPLACEMENT_INCREMENTAL = 100;
        v274.MAX_NODE_DISPLACEMENT = v274.MAX_NODE_DISPLACEMENT_INCREMENTAL * 3;
        v274.MIN_REPULSION_DIST = v274.DEFAULT_EDGE_LENGTH / 10;
        v274.CONVERGENCE_CHECK_PERIOD = 100;
        v274.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = 0.1;
        v274.MIN_EDGE_LENGTH = 1;
        v274.GRID_CALCULATION_CHECK_PERIOD = 10;
        v270.exports = v274;
      }, function (v276, v277, v278) {
        var v279 = v278(12);
        function v280() {}
        v280.calcSeparationAmount = function (v281, v282, v283, v284) {
          if (!v281.intersects(v282)) {
            throw "assert failed";
          }
          var v285 = new Array(2);
          this.decideDirectionsForOverlappingNodes(v281, v282, v285);
          v283[0] = Math.min(v281.getRight(), v282.getRight()) - Math.max(v281.x, v282.x);
          v283[1] = Math.min(v281.getBottom(), v282.getBottom()) - Math.max(v281.y, v282.y);
          if (v281.getX() <= v282.getX() && v281.getRight() >= v282.getRight()) {
            v283[0] += Math.min(v282.getX() - v281.getX(), v281.getRight() - v282.getRight());
          } else if (v282.getX() <= v281.getX() && v282.getRight() >= v281.getRight()) {
            v283[0] += Math.min(v281.getX() - v282.getX(), v282.getRight() - v281.getRight());
          }
          if (v281.getY() <= v282.getY() && v281.getBottom() >= v282.getBottom()) {
            v283[1] += Math.min(v282.getY() - v281.getY(), v281.getBottom() - v282.getBottom());
          } else if (v282.getY() <= v281.getY() && v282.getBottom() >= v281.getBottom()) {
            v283[1] += Math.min(v281.getY() - v282.getY(), v282.getBottom() - v281.getBottom());
          }
          var v286 = Math.abs((v282.getCenterY() - v281.getCenterY()) / (v282.getCenterX() - v281.getCenterX()));
          if (v282.getCenterY() === v281.getCenterY() && v282.getCenterX() === v281.getCenterX()) {
            v286 = 1;
          }
          var v287 = v286 * v283[0];
          var v288 = v283[1] / v286;
          if (v283[0] < v288) {
            v288 = v283[0];
          } else {
            v287 = v283[1];
          }
          v283[0] = v285[0] * -1 * (v288 / 2 + v284);
          v283[1] = v285[1] * -1 * (v287 / 2 + v284);
        };
        v280.decideDirectionsForOverlappingNodes = function (v289, v290, v291) {
          if (v289.getCenterX() < v290.getCenterX()) {
            v291[0] = -1;
          } else {
            v291[0] = 1;
          }
          if (v289.getCenterY() < v290.getCenterY()) {
            v291[1] = -1;
          } else {
            v291[1] = 1;
          }
        };
        v280.getIntersection2 = function (v292, v293, v294) {
          var v295 = v292.getCenterX();
          var v296 = v292.getCenterY();
          var v297 = v293.getCenterX();
          var v298 = v293.getCenterY();
          if (v292.intersects(v293)) {
            v294[0] = v295;
            v294[1] = v296;
            v294[2] = v297;
            v294[3] = v298;
            return true;
          }
          var v299 = v292.getX();
          var v300 = v292.getY();
          var v301 = v292.getRight();
          var v302 = v292.getX();
          var v303 = v292.getBottom();
          var v304 = v292.getRight();
          var v305 = v292.getWidthHalf();
          var v306 = v292.getHeightHalf();
          var v307 = v293.getX();
          var v308 = v293.getY();
          var v309 = v293.getRight();
          var v310 = v293.getX();
          var v311 = v293.getBottom();
          var v312 = v293.getRight();
          var v313 = v293.getWidthHalf();
          var v314 = v293.getHeightHalf();
          var v315 = false;
          var v316 = false;
          if (v295 === v297) {
            if (v296 > v298) {
              v294[0] = v295;
              v294[1] = v300;
              v294[2] = v297;
              v294[3] = v311;
              return false;
            } else if (v296 < v298) {
              v294[0] = v295;
              v294[1] = v303;
              v294[2] = v297;
              v294[3] = v308;
              return false;
            } else {
              ;
            }
          } else if (v296 === v298) {
            if (v295 > v297) {
              v294[0] = v299;
              v294[1] = v296;
              v294[2] = v309;
              v294[3] = v298;
              return false;
            } else if (v295 < v297) {
              v294[0] = v301;
              v294[1] = v296;
              v294[2] = v307;
              v294[3] = v298;
              return false;
            } else {
              ;
            }
          } else {
            var v317 = v292.height / v292.width;
            var v318 = v293.height / v293.width;
            var v319 = (v298 - v296) / (v297 - v295);
            var v320 = undefined;
            var v321 = undefined;
            var v322 = undefined;
            var v323 = undefined;
            var v324 = undefined;
            var v325 = undefined;
            if (-v317 === v319) {
              if (v295 > v297) {
                v294[0] = v302;
                v294[1] = v303;
                v315 = true;
              } else {
                v294[0] = v301;
                v294[1] = v300;
                v315 = true;
              }
            } else if (v317 === v319) {
              if (v295 > v297) {
                v294[0] = v299;
                v294[1] = v300;
                v315 = true;
              } else {
                v294[0] = v304;
                v294[1] = v303;
                v315 = true;
              }
            }
            if (-v318 === v319) {
              if (v297 > v295) {
                v294[2] = v310;
                v294[3] = v311;
                v316 = true;
              } else {
                v294[2] = v309;
                v294[3] = v308;
                v316 = true;
              }
            } else if (v318 === v319) {
              if (v297 > v295) {
                v294[2] = v307;
                v294[3] = v308;
                v316 = true;
              } else {
                v294[2] = v312;
                v294[3] = v311;
                v316 = true;
              }
            }
            if (v315 && v316) {
              return false;
            }
            if (v295 > v297) {
              if (v296 > v298) {
                v320 = this.getCardinalDirection(v317, v319, 4);
                v321 = this.getCardinalDirection(v318, v319, 2);
              } else {
                v320 = this.getCardinalDirection(-v317, v319, 3);
                v321 = this.getCardinalDirection(-v318, v319, 1);
              }
            } else if (v296 > v298) {
              v320 = this.getCardinalDirection(-v317, v319, 1);
              v321 = this.getCardinalDirection(-v318, v319, 3);
            } else {
              v320 = this.getCardinalDirection(v317, v319, 2);
              v321 = this.getCardinalDirection(v318, v319, 4);
            }
            if (!v315) {
              switch (v320) {
                case 1:
                  v323 = v300;
                  v322 = v295 + -v306 / v319;
                  v294[0] = v322;
                  v294[1] = v323;
                  break;
                case 2:
                  v322 = v304;
                  v323 = v296 + v305 * v319;
                  v294[0] = v322;
                  v294[1] = v323;
                  break;
                case 3:
                  v323 = v303;
                  v322 = v295 + v306 / v319;
                  v294[0] = v322;
                  v294[1] = v323;
                  break;
                case 4:
                  v322 = v302;
                  v323 = v296 + -v305 * v319;
                  v294[0] = v322;
                  v294[1] = v323;
                  break;
              }
            }
            if (!v316) {
              switch (v321) {
                case 1:
                  v325 = v308;
                  v324 = v297 + -v314 / v319;
                  v294[2] = v324;
                  v294[3] = v325;
                  break;
                case 2:
                  v324 = v312;
                  v325 = v298 + v313 * v319;
                  v294[2] = v324;
                  v294[3] = v325;
                  break;
                case 3:
                  v325 = v311;
                  v324 = v297 + v314 / v319;
                  v294[2] = v324;
                  v294[3] = v325;
                  break;
                case 4:
                  v324 = v310;
                  v325 = v298 + -v313 * v319;
                  v294[2] = v324;
                  v294[3] = v325;
                  break;
              }
            }
          }
          return false;
        };
        v280.getCardinalDirection = function (v326, v327, v328) {
          if (v326 > v327) {
            return v328;
          } else {
            return 1 + v328 % 4;
          }
        };
        v280.getIntersection = function (v329, v330, v331, v332) {
          if (v332 == null) {
            return this.getIntersection2(v329, v330, v331);
          }
          var v333 = v329.x;
          var v334 = v329.y;
          var v335 = v330.x;
          var v336 = v330.y;
          var v337 = v331.x;
          var v338 = v331.y;
          var v339 = v332.x;
          var v340 = v332.y;
          var v341 = undefined;
          var v342 = undefined;
          var v343 = undefined;
          var v344 = undefined;
          var v345 = undefined;
          var v346 = undefined;
          var v347 = undefined;
          var v348 = undefined;
          var v349 = undefined;
          v343 = v336 - v334;
          v345 = v333 - v335;
          v347 = v335 * v334 - v333 * v336;
          v344 = v340 - v338;
          v346 = v337 - v339;
          v348 = v339 * v338 - v337 * v340;
          v349 = v343 * v346 - v344 * v345;
          if (v349 === 0) {
            return null;
          }
          v341 = (v345 * v348 - v346 * v347) / v349;
          v342 = (v344 * v347 - v343 * v348) / v349;
          return new v279(v341, v342);
        };
        v280.angleOfVector = function (v350, v351, v352, v353) {
          var v354 = undefined;
          if (v350 !== v352) {
            v354 = Math.atan((v353 - v351) / (v352 - v350));
            if (v352 < v350) {
              v354 += Math.PI;
            } else if (v353 < v351) {
              v354 += this.TWO_PI;
            }
          } else if (v353 < v351) {
            v354 = this.ONE_AND_HALF_PI;
          } else {
            v354 = this.HALF_PI;
          }
          return v354;
        };
        v280.doIntersect = function (v355, v356, v357, v358) {
          var v359 = v355.x;
          var v360 = v355.y;
          var v361 = v356.x;
          var v362 = v356.y;
          var v363 = v357.x;
          var v364 = v357.y;
          var v365 = v358.x;
          var v366 = v358.y;
          var v367 = (v361 - v359) * (v366 - v364) - (v365 - v363) * (v362 - v360);
          if (v367 === 0) {
            return false;
          } else {
            var v368 = ((v366 - v364) * (v365 - v359) + (v363 - v365) * (v366 - v360)) / v367;
            var v369 = ((v360 - v362) * (v365 - v359) + (v361 - v359) * (v366 - v360)) / v367;
            return v368 > 0 && v368 < 1 && v369 > 0 && v369 < 1;
          }
        };
        v280.HALF_PI = Math.PI * 0.5;
        v280.ONE_AND_HALF_PI = Math.PI * 1.5;
        v280.TWO_PI = Math.PI * 2;
        v280.THREE_PI = Math.PI * 3;
        v276.exports = v280;
      }, function (v370, v371, v372) {
        function v373() {}
        v373.sign = function (v374) {
          if (v374 > 0) {
            return 1;
          } else if (v374 < 0) {
            return -1;
          } else {
            return 0;
          }
        };
        v373.floor = function (v375) {
          if (v375 < 0) {
            return Math.ceil(v375);
          } else {
            return Math.floor(v375);
          }
        };
        v373.ceil = function (v376) {
          if (v376 < 0) {
            return Math.floor(v376);
          } else {
            return Math.ceil(v376);
          }
        };
        v370.exports = v373;
      }, function (v377, v378, v379) {
        function v380() {}
        v380.MAX_VALUE = 2147483647;
        v380.MIN_VALUE = -2147483648;
        v377.exports = v380;
      }, function (v381, v382, v383) {
        var v384 = function () {
          function v385(v386, v387) {
            for (var v388 = 0; v388 < v387.length; v388++) {
              var v389 = v387[v388];
              v389.enumerable = v389.enumerable || false;
              v389.configurable = true;
              if ("value" in v389) {
                v389.writable = true;
              }
              Object.defineProperty(v386, v389.key, v389);
            }
          }
          return function (v390, v391, v392) {
            if (v391) {
              v385(v390.prototype, v391);
            }
            if (v392) {
              v385(v390, v392);
            }
            return v390;
          };
        }();
        function v393(v394, v395) {
          if (!(v394 instanceof v395)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var v396 = function v397(v398) {
          return {
            value: v398,
            next: null,
            prev: null
          };
        };
        var v399 = function v400(v401, v402, v403, v404) {
          if (v401 !== null) {
            v401.next = v402;
          } else {
            v404.head = v402;
          }
          if (v403 !== null) {
            v403.prev = v402;
          } else {
            v404.tail = v402;
          }
          v402.prev = v401;
          v402.next = v403;
          v404.length++;
          return v402;
        };
        var v405 = function v406(v407, v408) {
          var v409 = v407.prev;
          var v410 = v407.next;
          if (v409 !== null) {
            v409.next = v410;
          } else {
            v408.head = v410;
          }
          if (v410 !== null) {
            v410.prev = v409;
          } else {
            v408.tail = v409;
          }
          v407.prev = v407.next = null;
          v408.length--;
          return v407;
        };
        var v411 = function () {
          function v412(v413) {
            var v414 = this;
            v393(this, v412);
            this.length = 0;
            this.head = null;
            this.tail = null;
            if (v413 != null) {
              v413.forEach(function (v415) {
                return v414.push(v415);
              });
            }
          }
          v384(v412, [{
            key: "size",
            value: function v416() {
              return this.length;
            }
          }, {
            key: "insertBefore",
            value: function v417(v418, v419) {
              return v399(v419.prev, v396(v418), v419, this);
            }
          }, {
            key: "insertAfter",
            value: function v420(v421, v422) {
              return v399(v422, v396(v421), v422.next, this);
            }
          }, {
            key: "insertNodeBefore",
            value: function v423(v424, v425) {
              return v399(v425.prev, v424, v425, this);
            }
          }, {
            key: "insertNodeAfter",
            value: function v426(v427, v428) {
              return v399(v428, v427, v428.next, this);
            }
          }, {
            key: "push",
            value: function v429(v430) {
              return v399(this.tail, v396(v430), null, this);
            }
          }, {
            key: "unshift",
            value: function v431(v432) {
              return v399(null, v396(v432), this.head, this);
            }
          }, {
            key: "remove",
            value: function v433(v434) {
              return v405(v434, this);
            }
          }, {
            key: "pop",
            value: function v435() {
              return v405(this.tail, this).value;
            }
          }, {
            key: "popNode",
            value: function v436() {
              return v405(this.tail, this);
            }
          }, {
            key: "shift",
            value: function v437() {
              return v405(this.head, this).value;
            }
          }, {
            key: "shiftNode",
            value: function v438() {
              return v405(this.head, this);
            }
          }, {
            key: "get_object_at",
            value: function v439(v440) {
              if (v440 <= this.length()) {
                var v441 = 1;
                var v442 = this.head;
                while (v441 < v440) {
                  v442 = v442.next;
                  v441++;
                }
                return v442.value;
              }
            }
          }, {
            key: "set_object_at",
            value: function v443(v444, v445) {
              if (v444 <= this.length()) {
                var v446 = 1;
                var v447 = this.head;
                while (v446 < v444) {
                  v447 = v447.next;
                  v446++;
                }
                v447.value = v445;
              }
            }
          }]);
          return v412;
        }();
        v381.exports = v411;
      }, function (v448, v449, v450) {
        function v451(v452, v453, v454) {
          this.x = null;
          this.y = null;
          if (v452 == null && v453 == null && v454 == null) {
            this.x = 0;
            this.y = 0;
          } else if (typeof v452 == "number" && typeof v453 == "number" && v454 == null) {
            this.x = v452;
            this.y = v453;
          } else if (v452.constructor.name == "Point" && v453 == null && v454 == null) {
            v454 = v452;
            this.x = v454.x;
            this.y = v454.y;
          }
        }
        v451.prototype.getX = function () {
          return this.x;
        };
        v451.prototype.getY = function () {
          return this.y;
        };
        v451.prototype.getLocation = function () {
          return new v451(this.x, this.y);
        };
        v451.prototype.setLocation = function (v455, v456, v457) {
          if (v455.constructor.name == "Point" && v456 == null && v457 == null) {
            v457 = v455;
            this.setLocation(v457.x, v457.y);
          } else if (typeof v455 == "number" && typeof v456 == "number" && v457 == null) {
            if (parseInt(v455) == v455 && parseInt(v456) == v456) {
              this.move(v455, v456);
            } else {
              this.x = Math.floor(v455 + 0.5);
              this.y = Math.floor(v456 + 0.5);
            }
          }
        };
        v451.prototype.move = function (v458, v459) {
          this.x = v458;
          this.y = v459;
        };
        v451.prototype.translate = function (v460, v461) {
          this.x += v460;
          this.y += v461;
        };
        v451.prototype.equals = function (v462) {
          if (v462.constructor.name == "Point") {
            var v463 = v462;
            return this.x == v463.x && this.y == v463.y;
          }
          return this == v462;
        };
        v451.prototype.toString = function () {
          return new v451().constructor.name + "[x=" + this.x + ",y=" + this.y + "]";
        };
        v448.exports = v451;
      }, function (v464, v465, v466) {
        function v467(v468, v469, v470, v471) {
          this.x = 0;
          this.y = 0;
          this.width = 0;
          this.height = 0;
          if (v468 != null && v469 != null && v470 != null && v471 != null) {
            this.x = v468;
            this.y = v469;
            this.width = v470;
            this.height = v471;
          }
        }
        v467.prototype.getX = function () {
          return this.x;
        };
        v467.prototype.setX = function (v472) {
          this.x = v472;
        };
        v467.prototype.getY = function () {
          return this.y;
        };
        v467.prototype.setY = function (v473) {
          this.y = v473;
        };
        v467.prototype.getWidth = function () {
          return this.width;
        };
        v467.prototype.setWidth = function (v474) {
          this.width = v474;
        };
        v467.prototype.getHeight = function () {
          return this.height;
        };
        v467.prototype.setHeight = function (v475) {
          this.height = v475;
        };
        v467.prototype.getRight = function () {
          return this.x + this.width;
        };
        v467.prototype.getBottom = function () {
          return this.y + this.height;
        };
        v467.prototype.intersects = function (v476) {
          if (this.getRight() < v476.x) {
            return false;
          }
          if (this.getBottom() < v476.y) {
            return false;
          }
          if (v476.getRight() < this.x) {
            return false;
          }
          if (v476.getBottom() < this.y) {
            return false;
          }
          return true;
        };
        v467.prototype.getCenterX = function () {
          return this.x + this.width / 2;
        };
        v467.prototype.getMinX = function () {
          return this.getX();
        };
        v467.prototype.getMaxX = function () {
          return this.getX() + this.width;
        };
        v467.prototype.getCenterY = function () {
          return this.y + this.height / 2;
        };
        v467.prototype.getMinY = function () {
          return this.getY();
        };
        v467.prototype.getMaxY = function () {
          return this.getY() + this.height;
        };
        v467.prototype.getWidthHalf = function () {
          return this.width / 2;
        };
        v467.prototype.getHeightHalf = function () {
          return this.height / 2;
        };
        v464.exports = v467;
      }, function (v477, v478, v479) {
        var v480 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (v481) {
          return typeof v481;
        } : function (v482) {
          if (v482 && typeof Symbol === "function" && v482.constructor === Symbol && v482 !== Symbol.prototype) {
            return "symbol";
          } else {
            return typeof v482;
          }
        };
        function v483() {}
        v483.lastID = 0;
        v483.createID = function (v484) {
          if (v483.isPrimitive(v484)) {
            return v484;
          }
          if (v484.uniqueID != null) {
            return v484.uniqueID;
          }
          v484.uniqueID = v483.getString();
          v483.lastID++;
          return v484.uniqueID;
        };
        v483.getString = function (v485) {
          if (v485 == null) {
            v485 = v483.lastID;
          }
          return "Object#" + v485;
        };
        v483.isPrimitive = function (v486) {
          var v487 = typeof v486 === "undefined" ? "undefined" : v480(v486);
          return v486 == null || v487 != "object" && v487 != "function";
        };
        v477.exports = v483;
      }, function (v488, v489, v490) {
        function v491(v492) {
          if (Array.isArray(v492)) {
            for (var v493 = 0, v494 = Array(v492.length); v493 < v492.length; v493++) {
              v494[v493] = v492[v493];
            }
            return v494;
          } else {
            return Array.from(v492);
          }
        }
        var v495 = v490(0);
        var v496 = v490(6);
        var v497 = v490(3);
        var v498 = v490(1);
        var v499 = v490(5);
        var v500 = v490(4);
        var v501 = v490(17);
        var v502 = v490(27);
        function v503(v504) {
          v502.call(this);
          this.layoutQuality = v495.QUALITY;
          this.createBendsAsNeeded = v495.DEFAULT_CREATE_BENDS_AS_NEEDED;
          this.incremental = v495.DEFAULT_INCREMENTAL;
          this.animationOnLayout = v495.DEFAULT_ANIMATION_ON_LAYOUT;
          this.animationDuringLayout = v495.DEFAULT_ANIMATION_DURING_LAYOUT;
          this.animationPeriod = v495.DEFAULT_ANIMATION_PERIOD;
          this.uniformLeafNodeSizes = v495.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
          this.edgeToDummyNodes = new Map();
          this.graphManager = new v496(this);
          this.isLayoutFinished = false;
          this.isSubLayout = false;
          this.isRemoteUse = false;
          if (v504 != null) {
            this.isRemoteUse = v504;
          }
        }
        v503.RANDOM_SEED = 1;
        v503.prototype = Object.create(v502.prototype);
        v503.prototype.getGraphManager = function () {
          return this.graphManager;
        };
        v503.prototype.getAllNodes = function () {
          return this.graphManager.getAllNodes();
        };
        v503.prototype.getAllEdges = function () {
          return this.graphManager.getAllEdges();
        };
        v503.prototype.getAllNodesToApplyGravitation = function () {
          return this.graphManager.getAllNodesToApplyGravitation();
        };
        v503.prototype.newGraphManager = function () {
          var v505 = new v496(this);
          this.graphManager = v505;
          return v505;
        };
        v503.prototype.newGraph = function (v506) {
          return new v499(null, this.graphManager, v506);
        };
        v503.prototype.newNode = function (v507) {
          return new v497(this.graphManager, v507);
        };
        v503.prototype.newEdge = function (v508) {
          return new v498(null, null, v508);
        };
        v503.prototype.checkLayoutSuccess = function () {
          return this.graphManager.getRoot() == null || this.graphManager.getRoot().getNodes().length == 0 || this.graphManager.includesInvalidEdge();
        };
        v503.prototype.runLayout = function () {
          this.isLayoutFinished = false;
          if (this.tilingPreLayout) {
            this.tilingPreLayout();
          }
          this.initParameters();
          var v509;
          if (this.checkLayoutSuccess()) {
            v509 = false;
          } else {
            v509 = this.layout();
          }
          if (v495.ANIMATE === "during") {
            return false;
          }
          if (v509) {
            if (!this.isSubLayout) {
              this.doPostLayout();
            }
          }
          if (this.tilingPostLayout) {
            this.tilingPostLayout();
          }
          this.isLayoutFinished = true;
          return v509;
        };
        v503.prototype.doPostLayout = function () {
          if (!this.incremental) {
            this.transform();
          }
          this.update();
        };
        v503.prototype.update2 = function () {
          if (this.createBendsAsNeeded) {
            this.createBendpointsFromDummyNodes();
            this.graphManager.resetAllEdges();
          }
          if (!this.isRemoteUse) {
            var v510 = this.graphManager.getAllEdges();
            for (var v511 = 0; v511 < v510.length; v511++) {
              v510[v511];
            }
            var v512 = this.graphManager.getRoot().getNodes();
            for (var v511 = 0; v511 < v512.length; v511++) {
              v512[v511];
            }
            this.update(this.graphManager.getRoot());
          }
        };
        v503.prototype.update = function (v513) {
          if (v513 == null) {
            this.update2();
          } else if (v513 instanceof v497) {
            var v514 = v513;
            if (v514.getChild() != null) {
              var v515 = v514.getChild().getNodes();
              for (var v516 = 0; v516 < v515.length; v516++) {
                update(v515[v516]);
              }
            }
            if (v514.vGraphObject != null) {
              var v517 = v514.vGraphObject;
              v517.update(v514);
            }
          } else if (v513 instanceof v498) {
            var v518 = v513;
            if (v518.vGraphObject != null) {
              var v519 = v518.vGraphObject;
              v519.update(v518);
            }
          } else if (v513 instanceof v499) {
            var v520 = v513;
            if (v520.vGraphObject != null) {
              var v521 = v520.vGraphObject;
              v521.update(v520);
            }
          }
        };
        v503.prototype.initParameters = function () {
          if (!this.isSubLayout) {
            this.layoutQuality = v495.QUALITY;
            this.animationDuringLayout = v495.DEFAULT_ANIMATION_DURING_LAYOUT;
            this.animationPeriod = v495.DEFAULT_ANIMATION_PERIOD;
            this.animationOnLayout = v495.DEFAULT_ANIMATION_ON_LAYOUT;
            this.incremental = v495.DEFAULT_INCREMENTAL;
            this.createBendsAsNeeded = v495.DEFAULT_CREATE_BENDS_AS_NEEDED;
            this.uniformLeafNodeSizes = v495.DEFAULT_UNIFORM_LEAF_NODE_SIZES;
          }
          if (this.animationDuringLayout) {
            this.animationOnLayout = false;
          }
        };
        v503.prototype.transform = function (v522) {
          if (v522 == undefined) {
            this.transform(new v500(0, 0));
          } else {
            var v523 = new v501();
            var v524 = this.graphManager.getRoot().updateLeftTop();
            if (v524 != null) {
              v523.setWorldOrgX(v522.x);
              v523.setWorldOrgY(v522.y);
              v523.setDeviceOrgX(v524.x);
              v523.setDeviceOrgY(v524.y);
              var v525 = this.getAllNodes();
              var v526;
              for (var v527 = 0; v527 < v525.length; v527++) {
                v526 = v525[v527];
                v526.transform(v523);
              }
            }
          }
        };
        v503.prototype.positionNodesRandomly = function (v528) {
          if (v528 == undefined) {
            this.positionNodesRandomly(this.getGraphManager().getRoot());
            this.getGraphManager().getRoot().updateBounds(true);
          } else {
            var v529;
            var v530;
            var v531 = v528.getNodes();
            for (var v532 = 0; v532 < v531.length; v532++) {
              v529 = v531[v532];
              v530 = v529.getChild();
              if (v530 == null) {
                v529.scatter();
              } else if (v530.getNodes().length == 0) {
                v529.scatter();
              } else {
                this.positionNodesRandomly(v530);
                v529.updateBounds();
              }
            }
          }
        };
        v503.prototype.getFlatForest = function () {
          var v533 = [];
          var v534 = true;
          var v535 = this.graphManager.getRoot().getNodes();
          var v536 = true;
          for (var v537 = 0; v537 < v535.length; v537++) {
            if (v535[v537].getChild() != null) {
              v536 = false;
            }
          }
          if (!v536) {
            return v533;
          }
          var v538 = new Set();
          var v539 = [];
          var v540 = new Map();
          var v541 = [];
          v541 = v541.concat(v535);
          while (v541.length > 0 && v534) {
            v539.push(v541[0]);
            while (v539.length > 0 && v534) {
              var v542 = v539[0];
              v539.splice(0, 1);
              v538.add(v542);
              var v543 = v542.getEdges();
              for (var v537 = 0; v537 < v543.length; v537++) {
                var v544 = v543[v537].getOtherEnd(v542);
                if (v540.get(v542) != v544) {
                  if (!v538.has(v544)) {
                    v539.push(v544);
                    v540.set(v544, v542);
                  } else {
                    v534 = false;
                    break;
                  }
                }
              }
            }
            if (!v534) {
              v533 = [];
            } else {
              var v545 = [].concat(v491(v538));
              v533.push(v545);
              for (var v537 = 0; v537 < v545.length; v537++) {
                var v546 = v545[v537];
                var v547 = v541.indexOf(v546);
                if (v547 > -1) {
                  v541.splice(v547, 1);
                }
              }
              v538 = new Set();
              v540 = new Map();
            }
          }
          return v533;
        };
        v503.prototype.createDummyNodesForBendpoints = function (v548) {
          var v549 = [];
          var v550 = v548.source;
          var v551 = this.graphManager.calcLowestCommonAncestor(v548.source, v548.target);
          for (var v552 = 0; v552 < v548.bendpoints.length; v552++) {
            var v553 = this.newNode(null);
            v553.setRect(new Point(0, 0), new Dimension(1, 1));
            v551.add(v553);
            var v554 = this.newEdge(null);
            this.graphManager.add(v554, v550, v553);
            v549.add(v553);
            v550 = v553;
          }
          var v554 = this.newEdge(null);
          this.graphManager.add(v554, v550, v548.target);
          this.edgeToDummyNodes.set(v548, v549);
          if (v548.isInterGraph()) {
            this.graphManager.remove(v548);
          } else {
            v551.remove(v548);
          }
          return v549;
        };
        v503.prototype.createBendpointsFromDummyNodes = function () {
          var v555 = [];
          v555 = v555.concat(this.graphManager.getAllEdges());
          v555 = [].concat(v491(this.edgeToDummyNodes.keys())).concat(v555);
          for (var v556 = 0; v556 < v555.length; v556++) {
            var v557 = v555[v556];
            if (v557.bendpoints.length > 0) {
              var v558 = this.edgeToDummyNodes.get(v557);
              for (var v559 = 0; v559 < v558.length; v559++) {
                var v560 = v558[v559];
                var v561 = new v500(v560.getCenterX(), v560.getCenterY());
                var v562 = v557.bendpoints.get(v559);
                v562.x = v561.x;
                v562.y = v561.y;
                v560.getOwner().remove(v560);
              }
              this.graphManager.add(v557, v557.source, v557.target);
            }
          }
        };
        v503.transform = function (v563, v564, v565, v566) {
          if (v565 != undefined && v566 != undefined) {
            var v567 = v564;
            if (v563 <= 50) {
              var v568 = v564 / v565;
              v567 -= (v564 - v568) / 50 * (50 - v563);
            } else {
              var v569 = v564 * v566;
              v567 += (v569 - v564) / 50 * (v563 - 50);
            }
            return v567;
          } else {
            var v570;
            var v571;
            if (v563 <= 50) {
              v570 = v564 * 9 / 500;
              v571 = v564 / 10;
            } else {
              v570 = v564 * 9 / 50;
              v571 = v564 * -8;
            }
            return v570 * v563 + v571;
          }
        };
        v503.findCenterOfTree = function (v572) {
          var v573 = [];
          v573 = v573.concat(v572);
          var v574 = [];
          var v575 = new Map();
          var v576 = false;
          var v577 = null;
          if (v573.length == 1 || v573.length == 2) {
            v576 = true;
            v577 = v573[0];
          }
          for (var v578 = 0; v578 < v573.length; v578++) {
            var v579 = v573[v578];
            var v580 = v579.getNeighborsList().size;
            v575.set(v579, v579.getNeighborsList().size);
            if (v580 == 1) {
              v574.push(v579);
            }
          }
          var v581 = [];
          v581 = v581.concat(v574);
          while (!v576) {
            var v582 = [];
            v582 = v582.concat(v581);
            v581 = [];
            for (var v578 = 0; v578 < v573.length; v578++) {
              var v579 = v573[v578];
              var v583 = v573.indexOf(v579);
              if (v583 >= 0) {
                v573.splice(v583, 1);
              }
              var v584 = v579.getNeighborsList();
              v584.forEach(function (v585) {
                if (v574.indexOf(v585) < 0) {
                  var v586 = v575.get(v585);
                  var v587 = v586 - 1;
                  if (v587 == 1) {
                    v581.push(v585);
                  }
                  v575.set(v585, v587);
                }
              });
            }
            v574 = v574.concat(v581);
            if (v573.length == 1 || v573.length == 2) {
              v576 = true;
              v577 = v573[0];
            }
          }
          return v577;
        };
        v503.prototype.setGraphManager = function (v588) {
          this.graphManager = v588;
        };
        v488.exports = v503;
      }, function (v589, v590, v591) {
        function v592() {}
        v592.seed = 1;
        v592.x = 0;
        v592.nextDouble = function () {
          v592.x = Math.sin(v592.seed++) * 10000;
          return v592.x - Math.floor(v592.x);
        };
        v589.exports = v592;
      }, function (v593, v594, v595) {
        var v596 = v595(4);
        function v597(v598, v599) {
          this.lworldOrgX = 0;
          this.lworldOrgY = 0;
          this.ldeviceOrgX = 0;
          this.ldeviceOrgY = 0;
          this.lworldExtX = 1;
          this.lworldExtY = 1;
          this.ldeviceExtX = 1;
          this.ldeviceExtY = 1;
        }
        v597.prototype.getWorldOrgX = function () {
          return this.lworldOrgX;
        };
        v597.prototype.setWorldOrgX = function (v600) {
          this.lworldOrgX = v600;
        };
        v597.prototype.getWorldOrgY = function () {
          return this.lworldOrgY;
        };
        v597.prototype.setWorldOrgY = function (v601) {
          this.lworldOrgY = v601;
        };
        v597.prototype.getWorldExtX = function () {
          return this.lworldExtX;
        };
        v597.prototype.setWorldExtX = function (v602) {
          this.lworldExtX = v602;
        };
        v597.prototype.getWorldExtY = function () {
          return this.lworldExtY;
        };
        v597.prototype.setWorldExtY = function (v603) {
          this.lworldExtY = v603;
        };
        v597.prototype.getDeviceOrgX = function () {
          return this.ldeviceOrgX;
        };
        v597.prototype.setDeviceOrgX = function (v604) {
          this.ldeviceOrgX = v604;
        };
        v597.prototype.getDeviceOrgY = function () {
          return this.ldeviceOrgY;
        };
        v597.prototype.setDeviceOrgY = function (v605) {
          this.ldeviceOrgY = v605;
        };
        v597.prototype.getDeviceExtX = function () {
          return this.ldeviceExtX;
        };
        v597.prototype.setDeviceExtX = function (v606) {
          this.ldeviceExtX = v606;
        };
        v597.prototype.getDeviceExtY = function () {
          return this.ldeviceExtY;
        };
        v597.prototype.setDeviceExtY = function (v607) {
          this.ldeviceExtY = v607;
        };
        v597.prototype.transformX = function (v608) {
          var v609 = 0;
          var v610 = this.lworldExtX;
          if (v610 != 0) {
            v609 = this.ldeviceOrgX + (v608 - this.lworldOrgX) * this.ldeviceExtX / v610;
          }
          return v609;
        };
        v597.prototype.transformY = function (v611) {
          var v612 = 0;
          var v613 = this.lworldExtY;
          if (v613 != 0) {
            v612 = this.ldeviceOrgY + (v611 - this.lworldOrgY) * this.ldeviceExtY / v613;
          }
          return v612;
        };
        v597.prototype.inverseTransformX = function (v614) {
          var v615 = 0;
          var v616 = this.ldeviceExtX;
          if (v616 != 0) {
            v615 = this.lworldOrgX + (v614 - this.ldeviceOrgX) * this.lworldExtX / v616;
          }
          return v615;
        };
        v597.prototype.inverseTransformY = function (v617) {
          var v618 = 0;
          var v619 = this.ldeviceExtY;
          if (v619 != 0) {
            v618 = this.lworldOrgY + (v617 - this.ldeviceOrgY) * this.lworldExtY / v619;
          }
          return v618;
        };
        v597.prototype.inverseTransformPoint = function (v620) {
          var v621 = new v596(this.inverseTransformX(v620.x), this.inverseTransformY(v620.y));
          return v621;
        };
        v593.exports = v597;
      }, function (v622, v623, v624) {
        function v625(v626) {
          if (Array.isArray(v626)) {
            for (var v627 = 0, v628 = Array(v626.length); v627 < v626.length; v627++) {
              v628[v627] = v626[v627];
            }
            return v628;
          } else {
            return Array.from(v626);
          }
        }
        var v629 = v624(15);
        var v630 = v624(7);
        var v631 = v624(0);
        var v632 = v624(8);
        var v633 = v624(9);
        function v634() {
          v629.call(this);
          this.useSmartIdealEdgeLengthCalculation = v630.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
          this.idealEdgeLength = v630.DEFAULT_EDGE_LENGTH;
          this.springConstant = v630.DEFAULT_SPRING_STRENGTH;
          this.repulsionConstant = v630.DEFAULT_REPULSION_STRENGTH;
          this.gravityConstant = v630.DEFAULT_GRAVITY_STRENGTH;
          this.compoundGravityConstant = v630.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
          this.gravityRangeFactor = v630.DEFAULT_GRAVITY_RANGE_FACTOR;
          this.compoundGravityRangeFactor = v630.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
          this.displacementThresholdPerNode = v630.DEFAULT_EDGE_LENGTH * 3 / 100;
          this.coolingFactor = v630.DEFAULT_COOLING_FACTOR_INCREMENTAL;
          this.initialCoolingFactor = v630.DEFAULT_COOLING_FACTOR_INCREMENTAL;
          this.totalDisplacement = 0;
          this.oldTotalDisplacement = 0;
          this.maxIterations = v630.MAX_ITERATIONS;
        }
        v634.prototype = Object.create(v629.prototype);
        for (var v635 in v629) {
          v634[v635] = v629[v635];
        }
        v634.prototype.initParameters = function () {
          v629.prototype.initParameters.call(this, arguments);
          this.totalIterations = 0;
          this.notAnimatedIterations = 0;
          this.useFRGridVariant = v630.DEFAULT_USE_SMART_REPULSION_RANGE_CALCULATION;
          this.grid = [];
        };
        v634.prototype.calcIdealEdgeLengths = function () {
          var v636;
          var v637;
          var v638;
          var v639;
          var v640;
          var v641;
          var v642 = this.getGraphManager().getAllEdges();
          for (var v643 = 0; v643 < v642.length; v643++) {
            v636 = v642[v643];
            v636.idealLength = this.idealEdgeLength;
            if (v636.isInterGraph) {
              v638 = v636.getSource();
              v639 = v636.getTarget();
              v640 = v636.getSourceInLca().getEstimatedSize();
              v641 = v636.getTargetInLca().getEstimatedSize();
              if (this.useSmartIdealEdgeLengthCalculation) {
                v636.idealLength += v640 + v641 - v631.SIMPLE_NODE_SIZE * 2;
              }
              v637 = v636.getLca().getInclusionTreeDepth();
              v636.idealLength += v630.DEFAULT_EDGE_LENGTH * v630.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR * (v638.getInclusionTreeDepth() + v639.getInclusionTreeDepth() - v637 * 2);
            }
          }
        };
        v634.prototype.initSpringEmbedder = function () {
          var v644 = this.getAllNodes().length;
          if (this.incremental) {
            if (v644 > v630.ADAPTATION_LOWER_NODE_LIMIT) {
              this.coolingFactor = Math.max(this.coolingFactor * v630.COOLING_ADAPTATION_FACTOR, this.coolingFactor - (v644 - v630.ADAPTATION_LOWER_NODE_LIMIT) / (v630.ADAPTATION_UPPER_NODE_LIMIT - v630.ADAPTATION_LOWER_NODE_LIMIT) * this.coolingFactor * (1 - v630.COOLING_ADAPTATION_FACTOR));
            }
            this.maxNodeDisplacement = v630.MAX_NODE_DISPLACEMENT_INCREMENTAL;
          } else {
            if (v644 > v630.ADAPTATION_LOWER_NODE_LIMIT) {
              this.coolingFactor = Math.max(v630.COOLING_ADAPTATION_FACTOR, 1 - (v644 - v630.ADAPTATION_LOWER_NODE_LIMIT) / (v630.ADAPTATION_UPPER_NODE_LIMIT - v630.ADAPTATION_LOWER_NODE_LIMIT) * (1 - v630.COOLING_ADAPTATION_FACTOR));
            } else {
              this.coolingFactor = 1;
            }
            this.initialCoolingFactor = this.coolingFactor;
            this.maxNodeDisplacement = v630.MAX_NODE_DISPLACEMENT;
          }
          this.maxIterations = Math.max(this.getAllNodes().length * 5, this.maxIterations);
          this.totalDisplacementThreshold = this.displacementThresholdPerNode * this.getAllNodes().length;
          this.repulsionRange = this.calcRepulsionRange();
        };
        v634.prototype.calcSpringForces = function () {
          var v645 = this.getAllEdges();
          var v646;
          for (var v647 = 0; v647 < v645.length; v647++) {
            v646 = v645[v647];
            this.calcSpringForce(v646, v646.idealLength);
          }
        };
        v634.prototype.calcRepulsionForces = function (v648 = true, v649 = false) {
          var v650;
          var v651;
          var v652;
          var v653;
          var v654 = this.getAllNodes();
          var v655;
          if (this.useFRGridVariant) {
            if (this.totalIterations % v630.GRID_CALCULATION_CHECK_PERIOD == 1 && v648) {
              this.updateGrid();
            }
            v655 = new Set();
            for (v650 = 0; v650 < v654.length; v650++) {
              v652 = v654[v650];
              this.calculateRepulsionForceOfANode(v652, v655, v648, v649);
              v655.add(v652);
            }
          } else {
            for (v650 = 0; v650 < v654.length; v650++) {
              v652 = v654[v650];
              for (v651 = v650 + 1; v651 < v654.length; v651++) {
                v653 = v654[v651];
                if (v652.getOwner() != v653.getOwner()) {
                  continue;
                }
                this.calcRepulsionForce(v652, v653);
              }
            }
          }
        };
        v634.prototype.calcGravitationalForces = function () {
          var v656;
          var v657 = this.getAllNodesToApplyGravitation();
          for (var v658 = 0; v658 < v657.length; v658++) {
            v656 = v657[v658];
            this.calcGravitationalForce(v656);
          }
        };
        v634.prototype.moveNodes = function () {
          var v659 = this.getAllNodes();
          var v660;
          for (var v661 = 0; v661 < v659.length; v661++) {
            v660 = v659[v661];
            v660.move();
          }
        };
        v634.prototype.calcSpringForce = function (v662, v663) {
          var v664 = v662.getSource();
          var v665 = v662.getTarget();
          var v666;
          var v667;
          var v668;
          var v669;
          if (this.uniformLeafNodeSizes && v664.getChild() == null && v665.getChild() == null) {
            v662.updateLengthSimple();
          } else {
            v662.updateLength();
            if (v662.isOverlapingSourceAndTarget) {
              return;
            }
          }
          v666 = v662.getLength();
          if (v666 == 0) {
            return;
          }
          v667 = this.springConstant * (v666 - v663);
          v668 = v667 * (v662.lengthX / v666);
          v669 = v667 * (v662.lengthY / v666);
          v664.springForceX += v668;
          v664.springForceY += v669;
          v665.springForceX -= v668;
          v665.springForceY -= v669;
        };
        v634.prototype.calcRepulsionForce = function (v670, v671) {
          var v672 = v670.getRect();
          var v673 = v671.getRect();
          var v674 = new Array(2);
          var v675 = new Array(4);
          var v676;
          var v677;
          var v678;
          var v679;
          var v680;
          var v681;
          var v682;
          if (v672.intersects(v673)) {
            v632.calcSeparationAmount(v672, v673, v674, v630.DEFAULT_EDGE_LENGTH / 2);
            v681 = v674[0] * 2;
            v682 = v674[1] * 2;
            var v683 = v670.noOfChildren * v671.noOfChildren / (v670.noOfChildren + v671.noOfChildren);
            v670.repulsionForceX -= v683 * v681;
            v670.repulsionForceY -= v683 * v682;
            v671.repulsionForceX += v683 * v681;
            v671.repulsionForceY += v683 * v682;
          } else {
            if (this.uniformLeafNodeSizes && v670.getChild() == null && v671.getChild() == null) {
              v676 = v673.getCenterX() - v672.getCenterX();
              v677 = v673.getCenterY() - v672.getCenterY();
            } else {
              v632.getIntersection(v672, v673, v675);
              v676 = v675[2] - v675[0];
              v677 = v675[3] - v675[1];
            }
            if (Math.abs(v676) < v630.MIN_REPULSION_DIST) {
              v676 = v633.sign(v676) * v630.MIN_REPULSION_DIST;
            }
            if (Math.abs(v677) < v630.MIN_REPULSION_DIST) {
              v677 = v633.sign(v677) * v630.MIN_REPULSION_DIST;
            }
            v678 = v676 * v676 + v677 * v677;
            v679 = Math.sqrt(v678);
            v680 = this.repulsionConstant * v670.noOfChildren * v671.noOfChildren / v678;
            v681 = v680 * v676 / v679;
            v682 = v680 * v677 / v679;
            v670.repulsionForceX -= v681;
            v670.repulsionForceY -= v682;
            v671.repulsionForceX += v681;
            v671.repulsionForceY += v682;
          }
        };
        v634.prototype.calcGravitationalForce = function (v684) {
          var v685;
          var v686;
          var v687;
          var v688;
          var v689;
          var v690;
          var v691;
          var v692;
          v685 = v684.getOwner();
          v686 = (v685.getRight() + v685.getLeft()) / 2;
          v687 = (v685.getTop() + v685.getBottom()) / 2;
          v688 = v684.getCenterX() - v686;
          v689 = v684.getCenterY() - v687;
          v690 = Math.abs(v688) + v684.getWidth() / 2;
          v691 = Math.abs(v689) + v684.getHeight() / 2;
          if (v684.getOwner() == this.graphManager.getRoot()) {
            v692 = v685.getEstimatedSize() * this.gravityRangeFactor;
            if (v690 > v692 || v691 > v692) {
              v684.gravitationForceX = -this.gravityConstant * v688;
              v684.gravitationForceY = -this.gravityConstant * v689;
            }
          } else {
            v692 = v685.getEstimatedSize() * this.compoundGravityRangeFactor;
            if (v690 > v692 || v691 > v692) {
              v684.gravitationForceX = -this.gravityConstant * v688 * this.compoundGravityConstant;
              v684.gravitationForceY = -this.gravityConstant * v689 * this.compoundGravityConstant;
            }
          }
        };
        v634.prototype.isConverged = function () {
          var v693;
          var v694 = false;
          if (this.totalIterations > this.maxIterations / 3) {
            v694 = Math.abs(this.totalDisplacement - this.oldTotalDisplacement) < 2;
          }
          v693 = this.totalDisplacement < this.totalDisplacementThreshold;
          this.oldTotalDisplacement = this.totalDisplacement;
          return v693 || v694;
        };
        v634.prototype.animate = function () {
          if (this.animationDuringLayout && !this.isSubLayout) {
            if (this.notAnimatedIterations == this.animationPeriod) {
              this.update();
              this.notAnimatedIterations = 0;
            } else {
              this.notAnimatedIterations++;
            }
          }
        };
        v634.prototype.calcNoOfChildrenForAllNodes = function () {
          var v695;
          var v696 = this.graphManager.getAllNodes();
          for (var v697 = 0; v697 < v696.length; v697++) {
            v695 = v696[v697];
            v695.noOfChildren = v695.getNoOfChildren();
          }
        };
        v634.prototype.calcGrid = function (v698) {
          var v699 = 0;
          var v700 = 0;
          v699 = parseInt(Math.ceil((v698.getRight() - v698.getLeft()) / this.repulsionRange));
          v700 = parseInt(Math.ceil((v698.getBottom() - v698.getTop()) / this.repulsionRange));
          var v701 = new Array(v699);
          for (var v702 = 0; v702 < v699; v702++) {
            v701[v702] = new Array(v700);
          }
          for (var v702 = 0; v702 < v699; v702++) {
            for (var v703 = 0; v703 < v700; v703++) {
              v701[v702][v703] = new Array();
            }
          }
          return v701;
        };
        v634.prototype.addNodeToGrid = function (v704, v705, v706) {
          var v707 = 0;
          var v708 = 0;
          var v709 = 0;
          var v710 = 0;
          v707 = parseInt(Math.floor((v704.getRect().x - v705) / this.repulsionRange));
          v708 = parseInt(Math.floor((v704.getRect().width + v704.getRect().x - v705) / this.repulsionRange));
          v709 = parseInt(Math.floor((v704.getRect().y - v706) / this.repulsionRange));
          v710 = parseInt(Math.floor((v704.getRect().height + v704.getRect().y - v706) / this.repulsionRange));
          for (var v711 = v707; v711 <= v708; v711++) {
            for (var v712 = v709; v712 <= v710; v712++) {
              this.grid[v711][v712].push(v704);
              v704.setGridCoordinates(v707, v708, v709, v710);
            }
          }
        };
        v634.prototype.updateGrid = function () {
          var v713;
          var v714;
          var v715 = this.getAllNodes();
          this.grid = this.calcGrid(this.graphManager.getRoot());
          for (v713 = 0; v713 < v715.length; v713++) {
            v714 = v715[v713];
            this.addNodeToGrid(v714, this.graphManager.getRoot().getLeft(), this.graphManager.getRoot().getTop());
          }
        };
        v634.prototype.calculateRepulsionForceOfANode = function (v716, v717, v718, v719) {
          if (this.totalIterations % v630.GRID_CALCULATION_CHECK_PERIOD == 1 && v718 || v719) {
            var v720 = new Set();
            v716.surrounding = new Array();
            var v721;
            var v722 = this.grid;
            for (var v723 = v716.startX - 1; v723 < v716.finishX + 2; v723++) {
              for (var v724 = v716.startY - 1; v724 < v716.finishY + 2; v724++) {
                if (!(v723 < 0) && !(v724 < 0) && !(v723 >= v722.length) && !(v724 >= v722[0].length)) {
                  for (var v725 = 0; v725 < v722[v723][v724].length; v725++) {
                    v721 = v722[v723][v724][v725];
                    if (v716.getOwner() != v721.getOwner() || v716 == v721) {
                      continue;
                    }
                    if (!v717.has(v721) && !v720.has(v721)) {
                      var v726 = Math.abs(v716.getCenterX() - v721.getCenterX()) - (v716.getWidth() / 2 + v721.getWidth() / 2);
                      var v727 = Math.abs(v716.getCenterY() - v721.getCenterY()) - (v716.getHeight() / 2 + v721.getHeight() / 2);
                      if (v726 <= this.repulsionRange && v727 <= this.repulsionRange) {
                        v720.add(v721);
                      }
                    }
                  }
                }
              }
            }
            v716.surrounding = [].concat(v625(v720));
          }
          for (v723 = 0; v723 < v716.surrounding.length; v723++) {
            this.calcRepulsionForce(v716, v716.surrounding[v723]);
          }
        };
        v634.prototype.calcRepulsionRange = function () {
          return 0;
        };
        v622.exports = v634;
      }, function (v728, v729, v730) {
        var v731 = v730(1);
        var v732 = v730(7);
        function v733(v734, v735, v736) {
          v731.call(this, v734, v735, v736);
          this.idealLength = v732.DEFAULT_EDGE_LENGTH;
        }
        v733.prototype = Object.create(v731.prototype);
        for (var v737 in v731) {
          v733[v737] = v731[v737];
        }
        v728.exports = v733;
      }, function (v738, v739, v740) {
        var v741 = v740(3);
        function v742(v743, v744, v745, v746) {
          v741.call(this, v743, v744, v745, v746);
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
        v742.prototype = Object.create(v741.prototype);
        for (var v747 in v741) {
          v742[v747] = v741[v747];
        }
        v742.prototype.setGridCoordinates = function (v748, v749, v750, v751) {
          this.startX = v748;
          this.finishX = v749;
          this.startY = v750;
          this.finishY = v751;
        };
        v738.exports = v742;
      }, function (v752, v753, v754) {
        function v755(v756, v757) {
          this.width = 0;
          this.height = 0;
          if (v756 !== null && v757 !== null) {
            this.height = v757;
            this.width = v756;
          }
        }
        v755.prototype.getWidth = function () {
          return this.width;
        };
        v755.prototype.setWidth = function (v758) {
          this.width = v758;
        };
        v755.prototype.getHeight = function () {
          return this.height;
        };
        v755.prototype.setHeight = function (v759) {
          this.height = v759;
        };
        v752.exports = v755;
      }, function (v760, v761, v762) {
        var v763 = v762(14);
        function v764() {
          this.map = {};
          this.keys = [];
        }
        v764.prototype.put = function (v765, v766) {
          var v767 = v763.createID(v765);
          if (!this.contains(v767)) {
            this.map[v767] = v766;
            this.keys.push(v765);
          }
        };
        v764.prototype.contains = function (v768) {
          v763.createID(v768);
          return this.map[v768] != null;
        };
        v764.prototype.get = function (v769) {
          var v770 = v763.createID(v769);
          return this.map[v770];
        };
        v764.prototype.keySet = function () {
          return this.keys;
        };
        v760.exports = v764;
      }, function (v771, v772, v773) {
        var v774 = v773(14);
        function v775() {
          this.set = {};
        }
        v775.prototype.add = function (v776) {
          var v777 = v774.createID(v776);
          if (!this.contains(v777)) {
            this.set[v777] = v776;
          }
        };
        v775.prototype.remove = function (v778) {
          delete this.set[v774.createID(v778)];
        };
        v775.prototype.clear = function () {
          this.set = {};
        };
        v775.prototype.contains = function (v779) {
          return this.set[v774.createID(v779)] == v779;
        };
        v775.prototype.isEmpty = function () {
          return this.size() === 0;
        };
        v775.prototype.size = function () {
          return Object.keys(this.set).length;
        };
        v775.prototype.addAllTo = function (v780) {
          var v781 = Object.keys(this.set);
          var v782 = v781.length;
          for (var v783 = 0; v783 < v782; v783++) {
            v780.push(this.set[v781[v783]]);
          }
        };
        v775.prototype.size = function () {
          return Object.keys(this.set).length;
        };
        v775.prototype.addAll = function (v784) {
          var v785 = v784.length;
          for (var v786 = 0; v786 < v785; v786++) {
            var v787 = v784[v786];
            this.add(v787);
          }
        };
        v771.exports = v775;
      }, function (v788, v789, v790) {
        var v791 = function () {
          function v792(v793, v794) {
            for (var v795 = 0; v795 < v794.length; v795++) {
              var v796 = v794[v795];
              v796.enumerable = v796.enumerable || false;
              v796.configurable = true;
              if ("value" in v796) {
                v796.writable = true;
              }
              Object.defineProperty(v793, v796.key, v796);
            }
          }
          return function (v797, v798, v799) {
            if (v798) {
              v792(v797.prototype, v798);
            }
            if (v799) {
              v792(v797, v799);
            }
            return v797;
          };
        }();
        function v800(v801, v802) {
          if (!(v801 instanceof v802)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var v803 = v790(11);
        var v804 = function () {
          function v805(v806, v807) {
            v800(this, v805);
            if (v807 !== null || v807 !== undefined) {
              this.compareFunction = this._defaultCompareFunction;
            }
            var v808 = undefined;
            if (v806 instanceof v803) {
              v808 = v806.size();
            } else {
              v808 = v806.length;
            }
            this._quicksort(v806, 0, v808 - 1);
          }
          v791(v805, [{
            key: "_quicksort",
            value: function v809(v810, v811, v812) {
              if (v811 < v812) {
                var v813 = this._partition(v810, v811, v812);
                this._quicksort(v810, v811, v813);
                this._quicksort(v810, v813 + 1, v812);
              }
            }
          }, {
            key: "_partition",
            value: function v814(v815, v816, v817) {
              var v818 = this._get(v815, v816);
              var v819 = v816;
              var v820 = v817;
              while (true) {
                while (this.compareFunction(v818, this._get(v815, v820))) {
                  v820--;
                }
                while (this.compareFunction(this._get(v815, v819), v818)) {
                  v819++;
                }
                if (v819 < v820) {
                  this._swap(v815, v819, v820);
                  v819++;
                  v820--;
                } else {
                  return v820;
                }
              }
            }
          }, {
            key: "_get",
            value: function v821(v822, v823) {
              if (v822 instanceof v803) {
                return v822.get_object_at(v823);
              } else {
                return v822[v823];
              }
            }
          }, {
            key: "_set",
            value: function v824(v825, v826, v827) {
              if (v825 instanceof v803) {
                v825.set_object_at(v826, v827);
              } else {
                v825[v826] = v827;
              }
            }
          }, {
            key: "_swap",
            value: function v828(v829, v830, v831) {
              var v832 = this._get(v829, v830);
              this._set(v829, v830, this._get(v829, v831));
              this._set(v829, v831, v832);
            }
          }, {
            key: "_defaultCompareFunction",
            value: function v833(v834, v835) {
              return v835 > v834;
            }
          }]);
          return v805;
        }();
        v788.exports = v804;
      }, function (v836, v837, v838) {
        var v839 = function () {
          function v840(v841, v842) {
            for (var v843 = 0; v843 < v842.length; v843++) {
              var v844 = v842[v843];
              v844.enumerable = v844.enumerable || false;
              v844.configurable = true;
              if ("value" in v844) {
                v844.writable = true;
              }
              Object.defineProperty(v841, v844.key, v844);
            }
          }
          return function (v845, v846, v847) {
            if (v846) {
              v840(v845.prototype, v846);
            }
            if (v847) {
              v840(v845, v847);
            }
            return v845;
          };
        }();
        function v848(v849, v850) {
          if (!(v849 instanceof v850)) {
            throw new TypeError("Cannot call a class as a function");
          }
        }
        var v851 = function () {
          function v852(v853, v854, v855 = 1, v856 = -1, v857 = -1) {
            v848(this, v852);
            this.sequence1 = v853;
            this.sequence2 = v854;
            this.match_score = v855;
            this.mismatch_penalty = v856;
            this.gap_penalty = v857;
            this.iMax = v853.length + 1;
            this.jMax = v854.length + 1;
            this.grid = new Array(this.iMax);
            for (var v858 = 0; v858 < this.iMax; v858++) {
              this.grid[v858] = new Array(this.jMax);
              for (var v859 = 0; v859 < this.jMax; v859++) {
                this.grid[v858][v859] = 0;
              }
            }
            this.tracebackGrid = new Array(this.iMax);
            for (var v860 = 0; v860 < this.iMax; v860++) {
              this.tracebackGrid[v860] = new Array(this.jMax);
              for (var v861 = 0; v861 < this.jMax; v861++) {
                this.tracebackGrid[v860][v861] = [null, null, null];
              }
            }
            this.alignments = [];
            this.score = -1;
            this.computeGrids();
          }
          v839(v852, [{
            key: "getScore",
            value: function v862() {
              return this.score;
            }
          }, {
            key: "getAlignments",
            value: function v863() {
              return this.alignments;
            }
          }, {
            key: "computeGrids",
            value: function v864() {
              for (var v865 = 1; v865 < this.jMax; v865++) {
                this.grid[0][v865] = this.grid[0][v865 - 1] + this.gap_penalty;
                this.tracebackGrid[0][v865] = [false, false, true];
              }
              for (var v866 = 1; v866 < this.iMax; v866++) {
                this.grid[v866][0] = this.grid[v866 - 1][0] + this.gap_penalty;
                this.tracebackGrid[v866][0] = [false, true, false];
              }
              for (var v867 = 1; v867 < this.iMax; v867++) {
                for (var v868 = 1; v868 < this.jMax; v868++) {
                  var v869 = undefined;
                  if (this.sequence1[v867 - 1] === this.sequence2[v868 - 1]) {
                    v869 = this.grid[v867 - 1][v868 - 1] + this.match_score;
                  } else {
                    v869 = this.grid[v867 - 1][v868 - 1] + this.mismatch_penalty;
                  }
                  var v870 = this.grid[v867 - 1][v868] + this.gap_penalty;
                  var v871 = this.grid[v867][v868 - 1] + this.gap_penalty;
                  var v872 = [v869, v870, v871];
                  var v873 = this.arrayAllMaxIndexes(v872);
                  this.grid[v867][v868] = v872[v873[0]];
                  this.tracebackGrid[v867][v868] = [v873.includes(0), v873.includes(1), v873.includes(2)];
                }
              }
              this.score = this.grid[this.iMax - 1][this.jMax - 1];
            }
          }, {
            key: "alignmentTraceback",
            value: function v874() {
              var v875 = [];
              v875.push({
                pos: [this.sequence1.length, this.sequence2.length],
                seq1: "",
                seq2: ""
              });
              while (v875[0]) {
                var v876 = v875[0];
                var v877 = this.tracebackGrid[v876.pos[0]][v876.pos[1]];
                if (v877[0]) {
                  v875.push({
                    pos: [v876.pos[0] - 1, v876.pos[1] - 1],
                    seq1: this.sequence1[v876.pos[0] - 1] + v876.seq1,
                    seq2: this.sequence2[v876.pos[1] - 1] + v876.seq2
                  });
                }
                if (v877[1]) {
                  v875.push({
                    pos: [v876.pos[0] - 1, v876.pos[1]],
                    seq1: this.sequence1[v876.pos[0] - 1] + v876.seq1,
                    seq2: "-" + v876.seq2
                  });
                }
                if (v877[2]) {
                  v875.push({
                    pos: [v876.pos[0], v876.pos[1] - 1],
                    seq1: "-" + v876.seq1,
                    seq2: this.sequence2[v876.pos[1] - 1] + v876.seq2
                  });
                }
                if (v876.pos[0] === 0 && v876.pos[1] === 0) {
                  this.alignments.push({
                    sequence1: v876.seq1,
                    sequence2: v876.seq2
                  });
                }
                v875.shift();
              }
              return this.alignments;
            }
          }, {
            key: "getAllIndexes",
            value: function v878(v879, v880) {
              var v881 = [];
              var v882 = -1;
              while ((v882 = v879.indexOf(v880, v882 + 1)) !== -1) {
                v881.push(v882);
              }
              return v881;
            }
          }, {
            key: "arrayAllMaxIndexes",
            value: function v883(v884) {
              return this.getAllIndexes(v884, Math.max.apply(null, v884));
            }
          }]);
          return v852;
        }();
        v836.exports = v851;
      }, function (v885, v886, v887) {
        var v888 = function v889() {
          return;
        };
        v888.FDLayout = v887(18);
        v888.FDLayoutConstants = v887(7);
        v888.FDLayoutEdge = v887(19);
        v888.FDLayoutNode = v887(20);
        v888.DimensionD = v887(21);
        v888.HashMap = v887(22);
        v888.HashSet = v887(23);
        v888.IGeometry = v887(8);
        v888.IMath = v887(9);
        v888.Integer = v887(10);
        v888.Point = v887(12);
        v888.PointD = v887(4);
        v888.RandomSeed = v887(16);
        v888.RectangleD = v887(13);
        v888.Transform = v887(17);
        v888.UniqueIDGeneretor = v887(14);
        v888.Quicksort = v887(24);
        v888.LinkedList = v887(11);
        v888.LGraphObject = v887(2);
        v888.LGraph = v887(5);
        v888.LEdge = v887(1);
        v888.LGraphManager = v887(6);
        v888.LNode = v887(3);
        v888.Layout = v887(15);
        v888.LayoutConstants = v887(0);
        v888.NeedlemanWunsch = v887(25);
        v885.exports = v888;
      }, function (v890, v891, v892) {
        function v893() {
          this.listeners = [];
        }
        var v894 = v893.prototype;
        v894.addListener = function (v895, v896) {
          this.listeners.push({
            event: v895,
            callback: v896
          });
        };
        v894.removeListener = function (v897, v898) {
          for (var v899 = this.listeners.length; v899 >= 0; v899--) {
            var v900 = this.listeners[v899];
            if (v900.event === v897 && v900.callback === v898) {
              this.listeners.splice(v899, 1);
            }
          }
        };
        v894.emit = function (v901, v902) {
          for (var v903 = 0; v903 < this.listeners.length; v903++) {
            var v904 = this.listeners[v903];
            if (v901 === v904.event) {
              v904.callback(v902);
            }
          }
        };
        v890.exports = v893;
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
  (function (v905, v906) {
    (function v907(v908, v909) {
      v905.exports = v909(requireLayoutBase());
    })(coseBase, function (v910) {
      return function (v911) {
        var v912 = {};
        function v913(v914) {
          if (v912[v914]) {
            return v912[v914].exports;
          }
          var v915 = v912[v914] = {
            i: v914,
            l: false,
            exports: {}
          };
          v911[v914].call(v915.exports, v915, v915.exports, v913);
          v915.l = true;
          return v915.exports;
        }
        v913.m = v911;
        v913.c = v912;
        v913.i = function (v916) {
          return v916;
        };
        v913.d = function (v917, v918, v919) {
          if (!v913.o(v917, v918)) {
            Object.defineProperty(v917, v918, {
              configurable: false,
              enumerable: true,
              get: v919
            });
          }
        };
        v913.n = function (v920) {
          var v921 = v920 && v920.__esModule ? function v922() {
            return v920.default;
          } : function v923() {
            return v920;
          };
          v913.d(v921, "a", v921);
          return v921;
        };
        v913.o = function (v924, v925) {
          return Object.prototype.hasOwnProperty.call(v924, v925);
        };
        v913.p = "";
        return v913(v913.s = 7);
      }([function (v926, v927) {
        v926.exports = v910;
      }, function (v928, v929, v930) {
        var v931 = v930(0).FDLayoutConstants;
        function v932() {}
        for (var v933 in v931) {
          v932[v933] = v931[v933];
        }
        v932.DEFAULT_USE_MULTI_LEVEL_SCALING = false;
        v932.DEFAULT_RADIAL_SEPARATION = v931.DEFAULT_EDGE_LENGTH;
        v932.DEFAULT_COMPONENT_SEPERATION = 60;
        v932.TILE = true;
        v932.TILING_PADDING_VERTICAL = 10;
        v932.TILING_PADDING_HORIZONTAL = 10;
        v932.TREE_REDUCTION_ON_INCREMENTAL = false;
        v928.exports = v932;
      }, function (v934, v935, v936) {
        var v937 = v936(0).FDLayoutEdge;
        function v938(v939, v940, v941) {
          v937.call(this, v939, v940, v941);
        }
        v938.prototype = Object.create(v937.prototype);
        for (var v942 in v937) {
          v938[v942] = v937[v942];
        }
        v934.exports = v938;
      }, function (v943, v944, v945) {
        var v946 = v945(0).LGraph;
        function v947(v948, v949, v950) {
          v946.call(this, v948, v949, v950);
        }
        v947.prototype = Object.create(v946.prototype);
        for (var v951 in v946) {
          v947[v951] = v946[v951];
        }
        v943.exports = v947;
      }, function (v952, v953, v954) {
        var v955 = v954(0).LGraphManager;
        function v956(v957) {
          v955.call(this, v957);
        }
        v956.prototype = Object.create(v955.prototype);
        for (var v958 in v955) {
          v956[v958] = v955[v958];
        }
        v952.exports = v956;
      }, function (v959, v960, v961) {
        var v962 = v961(0).FDLayoutNode;
        var v963 = v961(0).IMath;
        function v964(v965, v966, v967, v968) {
          v962.call(this, v965, v966, v967, v968);
        }
        v964.prototype = Object.create(v962.prototype);
        for (var v969 in v962) {
          v964[v969] = v962[v969];
        }
        v964.prototype.move = function () {
          var v970 = this.graphManager.getLayout();
          this.displacementX = v970.coolingFactor * (this.springForceX + this.repulsionForceX + this.gravitationForceX) / this.noOfChildren;
          this.displacementY = v970.coolingFactor * (this.springForceY + this.repulsionForceY + this.gravitationForceY) / this.noOfChildren;
          if (Math.abs(this.displacementX) > v970.coolingFactor * v970.maxNodeDisplacement) {
            this.displacementX = v970.coolingFactor * v970.maxNodeDisplacement * v963.sign(this.displacementX);
          }
          if (Math.abs(this.displacementY) > v970.coolingFactor * v970.maxNodeDisplacement) {
            this.displacementY = v970.coolingFactor * v970.maxNodeDisplacement * v963.sign(this.displacementY);
          }
          if (this.child == null) {
            this.moveBy(this.displacementX, this.displacementY);
          } else if (this.child.getNodes().length == 0) {
            this.moveBy(this.displacementX, this.displacementY);
          } else {
            this.propogateDisplacementToChildren(this.displacementX, this.displacementY);
          }
          v970.totalDisplacement += Math.abs(this.displacementX) + Math.abs(this.displacementY);
          this.springForceX = 0;
          this.springForceY = 0;
          this.repulsionForceX = 0;
          this.repulsionForceY = 0;
          this.gravitationForceX = 0;
          this.gravitationForceY = 0;
          this.displacementX = 0;
          this.displacementY = 0;
        };
        v964.prototype.propogateDisplacementToChildren = function (v971, v972) {
          var v973 = this.getChild().getNodes();
          var v974;
          for (var v975 = 0; v975 < v973.length; v975++) {
            v974 = v973[v975];
            if (v974.getChild() == null) {
              v974.moveBy(v971, v972);
              v974.displacementX += v971;
              v974.displacementY += v972;
            } else {
              v974.propogateDisplacementToChildren(v971, v972);
            }
          }
        };
        v964.prototype.setPred1 = function (v976) {
          this.pred1 = v976;
        };
        v964.prototype.getPred1 = function () {
          return pred1;
        };
        v964.prototype.getPred2 = function () {
          return pred2;
        };
        v964.prototype.setNext = function (v977) {
          this.next = v977;
        };
        v964.prototype.getNext = function () {
          return next;
        };
        v964.prototype.setProcessed = function (v978) {
          this.processed = v978;
        };
        v964.prototype.isProcessed = function () {
          return processed;
        };
        v959.exports = v964;
      }, function (v979, v980, v981) {
        var v982 = v981(0).FDLayout;
        var v983 = v981(4);
        var v984 = v981(3);
        var v985 = v981(5);
        var v986 = v981(2);
        var v987 = v981(1);
        var v988 = v981(0).FDLayoutConstants;
        var v989 = v981(0).LayoutConstants;
        var v990 = v981(0).Point;
        var v991 = v981(0).PointD;
        var v992 = v981(0).Layout;
        var v993 = v981(0).Integer;
        var v994 = v981(0).IGeometry;
        var v995 = v981(0).LGraph;
        var v996 = v981(0).Transform;
        function v997() {
          v982.call(this);
          this.toBeTiled = {};
        }
        v997.prototype = Object.create(v982.prototype);
        for (var v998 in v982) {
          v997[v998] = v982[v998];
        }
        v997.prototype.newGraphManager = function () {
          var v999 = new v983(this);
          this.graphManager = v999;
          return v999;
        };
        v997.prototype.newGraph = function (v1000) {
          return new v984(null, this.graphManager, v1000);
        };
        v997.prototype.newNode = function (v1001) {
          return new v985(this.graphManager, v1001);
        };
        v997.prototype.newEdge = function (v1002) {
          return new v986(null, null, v1002);
        };
        v997.prototype.initParameters = function () {
          v982.prototype.initParameters.call(this, arguments);
          if (!this.isSubLayout) {
            if (v987.DEFAULT_EDGE_LENGTH < 10) {
              this.idealEdgeLength = 10;
            } else {
              this.idealEdgeLength = v987.DEFAULT_EDGE_LENGTH;
            }
            this.useSmartIdealEdgeLengthCalculation = v987.DEFAULT_USE_SMART_IDEAL_EDGE_LENGTH_CALCULATION;
            this.springConstant = v988.DEFAULT_SPRING_STRENGTH;
            this.repulsionConstant = v988.DEFAULT_REPULSION_STRENGTH;
            this.gravityConstant = v988.DEFAULT_GRAVITY_STRENGTH;
            this.compoundGravityConstant = v988.DEFAULT_COMPOUND_GRAVITY_STRENGTH;
            this.gravityRangeFactor = v988.DEFAULT_GRAVITY_RANGE_FACTOR;
            this.compoundGravityRangeFactor = v988.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR;
            this.prunedNodesAll = [];
            this.growTreeIterations = 0;
            this.afterGrowthIterations = 0;
            this.isTreeGrowing = false;
            this.isGrowthFinished = false;
            this.coolingCycle = 0;
            this.maxCoolingCycle = this.maxIterations / v988.CONVERGENCE_CHECK_PERIOD;
            this.finalTemperature = v988.CONVERGENCE_CHECK_PERIOD / this.maxIterations;
            this.coolingAdjuster = 1;
          }
        };
        v997.prototype.layout = function () {
          var v1003 = v989.DEFAULT_CREATE_BENDS_AS_NEEDED;
          if (v1003) {
            this.createBendpoints();
            this.graphManager.resetAllEdges();
          }
          this.level = 0;
          return this.classicLayout();
        };
        v997.prototype.classicLayout = function () {
          this.nodesWithGravity = this.calculateNodesToApplyGravitationTo();
          this.graphManager.setAllNodesToApplyGravitation(this.nodesWithGravity);
          this.calcNoOfChildrenForAllNodes();
          this.graphManager.calcLowestCommonAncestors();
          this.graphManager.calcInclusionTreeDepths();
          this.graphManager.getRoot().calcEstimatedSize();
          this.calcIdealEdgeLengths();
          if (!this.incremental) {
            var v1004 = this.getFlatForest();
            if (v1004.length > 0) {
              this.positionNodesRadially(v1004);
            } else {
              this.reduceTrees();
              this.graphManager.resetAllNodesToApplyGravitation();
              var v1005 = new Set(this.getAllNodes());
              var v1006 = this.nodesWithGravity.filter(function (v1007) {
                return v1005.has(v1007);
              });
              this.graphManager.setAllNodesToApplyGravitation(v1006);
              this.positionNodesRandomly();
            }
          } else if (v987.TREE_REDUCTION_ON_INCREMENTAL) {
            this.reduceTrees();
            this.graphManager.resetAllNodesToApplyGravitation();
            var v1005 = new Set(this.getAllNodes());
            var v1006 = this.nodesWithGravity.filter(function (v1008) {
              return v1005.has(v1008);
            });
            this.graphManager.setAllNodesToApplyGravitation(v1006);
          }
          this.initSpringEmbedder();
          this.runSpringEmbedder();
          return true;
        };
        v997.prototype.tick = function () {
          this.totalIterations++;
          if (this.totalIterations === this.maxIterations && !this.isTreeGrowing && !this.isGrowthFinished) {
            if (this.prunedNodesAll.length > 0) {
              this.isTreeGrowing = true;
            } else {
              return true;
            }
          }
          if (this.totalIterations % v988.CONVERGENCE_CHECK_PERIOD == 0 && !this.isTreeGrowing && !this.isGrowthFinished) {
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
                var v1009 = new Set(this.getAllNodes());
                var v1010 = this.nodesWithGravity.filter(function (v1011) {
                  return v1009.has(v1011);
                });
                this.graphManager.setAllNodesToApplyGravitation(v1010);
                this.graphManager.updateBounds();
                this.updateGrid();
                this.coolingFactor = v988.DEFAULT_COOLING_FACTOR_INCREMENTAL;
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
            this.coolingFactor = v988.DEFAULT_COOLING_FACTOR_INCREMENTAL * ((100 - this.afterGrowthIterations) / 100);
            this.afterGrowthIterations++;
          }
          var v1012 = !this.isTreeGrowing && !this.isGrowthFinished;
          var v1013 = this.growTreeIterations % 10 == 1 && this.isTreeGrowing || this.afterGrowthIterations % 10 == 1 && this.isGrowthFinished;
          this.totalDisplacement = 0;
          this.graphManager.updateBounds();
          this.calcSpringForces();
          this.calcRepulsionForces(v1012, v1013);
          this.calcGravitationalForces();
          this.moveNodes();
          this.animate();
          return false;
        };
        v997.prototype.getPositionsData = function () {
          var v1014 = this.graphManager.getAllNodes();
          var v1015 = {};
          for (var v1016 = 0; v1016 < v1014.length; v1016++) {
            var v1017 = v1014[v1016].rect;
            var v1018 = v1014[v1016].id;
            v1015[v1018] = {
              id: v1018,
              x: v1017.getCenterX(),
              y: v1017.getCenterY(),
              w: v1017.width,
              h: v1017.height
            };
          }
          return v1015;
        };
        v997.prototype.runSpringEmbedder = function () {
          this.initialAnimationPeriod = 25;
          this.animationPeriod = this.initialAnimationPeriod;
          var v1019 = false;
          if (v988.ANIMATE === "during") {
            this.emit("layoutstarted");
          } else {
            while (!v1019) {
              v1019 = this.tick();
            }
            this.graphManager.updateBounds();
          }
        };
        v997.prototype.calculateNodesToApplyGravitationTo = function () {
          var v1020 = [];
          var v1021;
          var v1022 = this.graphManager.getGraphs();
          var v1023 = v1022.length;
          var v1024;
          for (v1024 = 0; v1024 < v1023; v1024++) {
            v1021 = v1022[v1024];
            v1021.updateConnected();
            if (!v1021.isConnected) {
              v1020 = v1020.concat(v1021.getNodes());
            }
          }
          return v1020;
        };
        v997.prototype.createBendpoints = function () {
          var v1025 = [];
          v1025 = v1025.concat(this.graphManager.getAllEdges());
          var v1026 = new Set();
          var v1027;
          for (v1027 = 0; v1027 < v1025.length; v1027++) {
            var v1028 = v1025[v1027];
            if (!v1026.has(v1028)) {
              var v1029 = v1028.getSource();
              var v1030 = v1028.getTarget();
              if (v1029 == v1030) {
                v1028.getBendpoints().push(new v991());
                v1028.getBendpoints().push(new v991());
                this.createDummyNodesForBendpoints(v1028);
                v1026.add(v1028);
              } else {
                var v1031 = [];
                v1031 = v1031.concat(v1029.getEdgeListToNode(v1030));
                v1031 = v1031.concat(v1030.getEdgeListToNode(v1029));
                if (!v1026.has(v1031[0])) {
                  if (v1031.length > 1) {
                    var v1032;
                    for (v1032 = 0; v1032 < v1031.length; v1032++) {
                      var v1033 = v1031[v1032];
                      v1033.getBendpoints().push(new v991());
                      this.createDummyNodesForBendpoints(v1033);
                    }
                  }
                  v1031.forEach(function (v1034) {
                    v1026.add(v1034);
                  });
                }
              }
            }
            if (v1026.size == v1025.length) {
              break;
            }
          }
        };
        v997.prototype.positionNodesRadially = function (v1035) {
          var v1036 = new v990(0, 0);
          var v1037 = Math.ceil(Math.sqrt(v1035.length));
          var v1038 = 0;
          var v1039 = 0;
          var v1040 = 0;
          var v1041 = new v991(0, 0);
          for (var v1042 = 0; v1042 < v1035.length; v1042++) {
            if (v1042 % v1037 == 0) {
              v1040 = 0;
              v1039 = v1038;
              if (v1042 != 0) {
                v1039 += v987.DEFAULT_COMPONENT_SEPERATION;
              }
              v1038 = 0;
            }
            var v1043 = v1035[v1042];
            var v1044 = v992.findCenterOfTree(v1043);
            v1036.x = v1040;
            v1036.y = v1039;
            v1041 = v997.radialLayout(v1043, v1044, v1036);
            if (v1041.y > v1038) {
              v1038 = Math.floor(v1041.y);
            }
            v1040 = Math.floor(v1041.x + v987.DEFAULT_COMPONENT_SEPERATION);
          }
          this.transform(new v991(v989.WORLD_CENTER_X - v1041.x / 2, v989.WORLD_CENTER_Y - v1041.y / 2));
        };
        v997.radialLayout = function (v1045, v1046, v1047) {
          var v1048 = Math.max(this.maxDiagonalInTree(v1045), v987.DEFAULT_RADIAL_SEPARATION);
          v997.branchRadialLayout(v1046, null, 0, 359, 0, v1048);
          var v1049 = v995.calculateBounds(v1045);
          var v1050 = new v996();
          v1050.setDeviceOrgX(v1049.getMinX());
          v1050.setDeviceOrgY(v1049.getMinY());
          v1050.setWorldOrgX(v1047.x);
          v1050.setWorldOrgY(v1047.y);
          for (var v1051 = 0; v1051 < v1045.length; v1051++) {
            var v1052 = v1045[v1051];
            v1052.transform(v1050);
          }
          var v1053 = new v991(v1049.getMaxX(), v1049.getMaxY());
          return v1050.inverseTransformPoint(v1053);
        };
        v997.branchRadialLayout = function (v1054, v1055, v1056, v1057, v1058, v1059) {
          var v1060 = (v1057 - v1056 + 1) / 2;
          if (v1060 < 0) {
            v1060 += 180;
          }
          var v1061 = (v1060 + v1056) % 360;
          var v1062 = v1061 * v994.TWO_PI / 360;
          var v1063 = v1058 * Math.cos(v1062);
          var v1064 = v1058 * Math.sin(v1062);
          v1054.setCenter(v1063, v1064);
          var v1065 = [];
          v1065 = v1065.concat(v1054.getEdges());
          var v1066 = v1065.length;
          if (v1055 != null) {
            v1066--;
          }
          var v1067 = 0;
          var v1068 = v1065.length;
          var v1069;
          var v1070 = v1054.getEdgesBetween(v1055);
          while (v1070.length > 1) {
            var v1071 = v1070[0];
            v1070.splice(0, 1);
            var v1072 = v1065.indexOf(v1071);
            if (v1072 >= 0) {
              v1065.splice(v1072, 1);
            }
            v1068--;
            v1066--;
          }
          if (v1055 != null) {
            v1069 = (v1065.indexOf(v1070[0]) + 1) % v1068;
          } else {
            v1069 = 0;
          }
          var v1073 = Math.abs(v1057 - v1056) / v1066;
          for (var v1074 = v1069; v1067 != v1066; v1074 = ++v1074 % v1068) {
            var v1075 = v1065[v1074].getOtherEnd(v1054);
            if (v1075 == v1055) {
              continue;
            }
            var v1076 = (v1056 + v1067 * v1073) % 360;
            var v1077 = (v1076 + v1073) % 360;
            v997.branchRadialLayout(v1075, v1054, v1076, v1077, v1058 + v1059, v1059);
            v1067++;
          }
        };
        v997.maxDiagonalInTree = function (v1078) {
          var v1079 = v993.MIN_VALUE;
          for (var v1080 = 0; v1080 < v1078.length; v1080++) {
            var v1081 = v1078[v1080];
            var v1082 = v1081.getDiagonal();
            if (v1082 > v1079) {
              v1079 = v1082;
            }
          }
          return v1079;
        };
        v997.prototype.calcRepulsionRange = function () {
          return (this.level + 1) * 2 * this.idealEdgeLength;
        };
        v997.prototype.groupZeroDegreeMembers = function () {
          var v1083 = this;
          var v1084 = {};
          this.memberGroups = {};
          this.idToDummyNode = {};
          var v1085 = [];
          var v1086 = this.graphManager.getAllNodes();
          for (var v1087 = 0; v1087 < v1086.length; v1087++) {
            var v1088 = v1086[v1087];
            var v1089 = v1088.getParent();
            if (this.getNodeDegreeWithChildren(v1088) === 0 && (v1089.id == undefined || !this.getToBeTiled(v1089))) {
              v1085.push(v1088);
            }
          }
          for (var v1087 = 0; v1087 < v1085.length; v1087++) {
            var v1088 = v1085[v1087];
            var v1090 = v1088.getParent().id;
            if (typeof v1084[v1090] === "undefined") {
              v1084[v1090] = [];
            }
            v1084[v1090] = v1084[v1090].concat(v1088);
          }
          Object.keys(v1084).forEach(function (v1091) {
            if (v1084[v1091].length > 1) {
              var v1092 = "DummyCompound_" + v1091;
              v1083.memberGroups[v1092] = v1084[v1091];
              var v1093 = v1084[v1091][0].getParent();
              var v1094 = new v985(v1083.graphManager);
              v1094.id = v1092;
              v1094.paddingLeft = v1093.paddingLeft || 0;
              v1094.paddingRight = v1093.paddingRight || 0;
              v1094.paddingBottom = v1093.paddingBottom || 0;
              v1094.paddingTop = v1093.paddingTop || 0;
              v1083.idToDummyNode[v1092] = v1094;
              var v1095 = v1083.getGraphManager().add(v1083.newGraph(), v1094);
              var v1096 = v1093.getChild();
              v1096.add(v1094);
              for (var v1097 = 0; v1097 < v1084[v1091].length; v1097++) {
                var v1098 = v1084[v1091][v1097];
                v1096.remove(v1098);
                v1095.add(v1098);
              }
            }
          });
        };
        v997.prototype.clearCompounds = function () {
          var v1099 = {};
          var v1100 = {};
          this.performDFSOnCompounds();
          for (var v1101 = 0; v1101 < this.compoundOrder.length; v1101++) {
            v1100[this.compoundOrder[v1101].id] = this.compoundOrder[v1101];
            v1099[this.compoundOrder[v1101].id] = [].concat(this.compoundOrder[v1101].getChild().getNodes());
            this.graphManager.remove(this.compoundOrder[v1101].getChild());
            this.compoundOrder[v1101].child = null;
          }
          this.graphManager.resetAllNodes();
          this.tileCompoundMembers(v1099, v1100);
        };
        v997.prototype.clearZeroDegreeMembers = function () {
          var v1102 = this;
          var v1103 = this.tiledZeroDegreePack = [];
          Object.keys(this.memberGroups).forEach(function (v1104) {
            var v1105 = v1102.idToDummyNode[v1104];
            v1103[v1104] = v1102.tileNodes(v1102.memberGroups[v1104], v1105.paddingLeft + v1105.paddingRight);
            v1105.rect.width = v1103[v1104].width;
            v1105.rect.height = v1103[v1104].height;
          });
        };
        v997.prototype.repopulateCompounds = function () {
          for (var v1106 = this.compoundOrder.length - 1; v1106 >= 0; v1106--) {
            var v1107 = this.compoundOrder[v1106];
            var v1108 = v1107.id;
            var v1109 = v1107.paddingLeft;
            var v1110 = v1107.paddingTop;
            this.adjustLocations(this.tiledMemberPack[v1108], v1107.rect.x, v1107.rect.y, v1109, v1110);
          }
        };
        v997.prototype.repopulateZeroDegreeMembers = function () {
          var v1111 = this;
          var v1112 = this.tiledZeroDegreePack;
          Object.keys(v1112).forEach(function (v1113) {
            var v1114 = v1111.idToDummyNode[v1113];
            var v1115 = v1114.paddingLeft;
            var v1116 = v1114.paddingTop;
            v1111.adjustLocations(v1112[v1113], v1114.rect.x, v1114.rect.y, v1115, v1116);
          });
        };
        v997.prototype.getToBeTiled = function (v1117) {
          var v1118 = v1117.id;
          if (this.toBeTiled[v1118] != null) {
            return this.toBeTiled[v1118];
          }
          var v1119 = v1117.getChild();
          if (v1119 == null) {
            this.toBeTiled[v1118] = false;
            return false;
          }
          var v1120 = v1119.getNodes();
          for (var v1121 = 0; v1121 < v1120.length; v1121++) {
            var v1122 = v1120[v1121];
            if (this.getNodeDegree(v1122) > 0) {
              this.toBeTiled[v1118] = false;
              return false;
            }
            if (v1122.getChild() == null) {
              this.toBeTiled[v1122.id] = false;
              continue;
            }
            if (!this.getToBeTiled(v1122)) {
              this.toBeTiled[v1118] = false;
              return false;
            }
          }
          this.toBeTiled[v1118] = true;
          return true;
        };
        v997.prototype.getNodeDegree = function (v1123) {
          v1123.id;
          var v1124 = v1123.getEdges();
          var v1125 = 0;
          for (var v1126 = 0; v1126 < v1124.length; v1126++) {
            var v1127 = v1124[v1126];
            if (v1127.getSource().id !== v1127.getTarget().id) {
              v1125 = v1125 + 1;
            }
          }
          return v1125;
        };
        v997.prototype.getNodeDegreeWithChildren = function (v1128) {
          var v1129 = this.getNodeDegree(v1128);
          if (v1128.getChild() == null) {
            return v1129;
          }
          var v1130 = v1128.getChild().getNodes();
          for (var v1131 = 0; v1131 < v1130.length; v1131++) {
            var v1132 = v1130[v1131];
            v1129 += this.getNodeDegreeWithChildren(v1132);
          }
          return v1129;
        };
        v997.prototype.performDFSOnCompounds = function () {
          this.compoundOrder = [];
          this.fillCompexOrderByDFS(this.graphManager.getRoot().getNodes());
        };
        v997.prototype.fillCompexOrderByDFS = function (v1133) {
          for (var v1134 = 0; v1134 < v1133.length; v1134++) {
            var v1135 = v1133[v1134];
            if (v1135.getChild() != null) {
              this.fillCompexOrderByDFS(v1135.getChild().getNodes());
            }
            if (this.getToBeTiled(v1135)) {
              this.compoundOrder.push(v1135);
            }
          }
        };
        v997.prototype.adjustLocations = function (v1136, v1137, v1138, v1139, v1140) {
          v1137 += v1139;
          v1138 += v1140;
          var v1141 = v1137;
          for (var v1142 = 0; v1142 < v1136.rows.length; v1142++) {
            var v1143 = v1136.rows[v1142];
            v1137 = v1141;
            var v1144 = 0;
            for (var v1145 = 0; v1145 < v1143.length; v1145++) {
              var v1146 = v1143[v1145];
              v1146.rect.x = v1137;
              v1146.rect.y = v1138;
              v1137 += v1146.rect.width + v1136.horizontalPadding;
              if (v1146.rect.height > v1144) {
                v1144 = v1146.rect.height;
              }
            }
            v1138 += v1144 + v1136.verticalPadding;
          }
        };
        v997.prototype.tileCompoundMembers = function (v1147, v1148) {
          var v1149 = this;
          this.tiledMemberPack = [];
          Object.keys(v1147).forEach(function (v1150) {
            var v1151 = v1148[v1150];
            v1149.tiledMemberPack[v1150] = v1149.tileNodes(v1147[v1150], v1151.paddingLeft + v1151.paddingRight);
            v1151.rect.width = v1149.tiledMemberPack[v1150].width;
            v1151.rect.height = v1149.tiledMemberPack[v1150].height;
          });
        };
        v997.prototype.tileNodes = function (v1152, v1153) {
          var v1154 = v987.TILING_PADDING_VERTICAL;
          var v1155 = v987.TILING_PADDING_HORIZONTAL;
          var v1156 = {
            rows: [],
            rowWidth: [],
            rowHeight: [],
            width: 0,
            height: v1153,
            verticalPadding: v1154,
            horizontalPadding: v1155
          };
          v1152.sort(function (v1157, v1158) {
            if (v1157.rect.width * v1157.rect.height > v1158.rect.width * v1158.rect.height) {
              return -1;
            }
            if (v1157.rect.width * v1157.rect.height < v1158.rect.width * v1158.rect.height) {
              return 1;
            }
            return 0;
          });
          for (var v1159 = 0; v1159 < v1152.length; v1159++) {
            var v1160 = v1152[v1159];
            if (v1156.rows.length == 0) {
              this.insertNodeToRow(v1156, v1160, 0, v1153);
            } else if (this.canAddHorizontal(v1156, v1160.rect.width, v1160.rect.height)) {
              this.insertNodeToRow(v1156, v1160, this.getShortestRowIndex(v1156), v1153);
            } else {
              this.insertNodeToRow(v1156, v1160, v1156.rows.length, v1153);
            }
            this.shiftToLastRow(v1156);
          }
          return v1156;
        };
        v997.prototype.insertNodeToRow = function (v1161, v1162, v1163, v1164) {
          var v1165 = v1164;
          if (v1163 == v1161.rows.length) {
            var v1166 = [];
            v1161.rows.push(v1166);
            v1161.rowWidth.push(v1165);
            v1161.rowHeight.push(0);
          }
          var v1167 = v1161.rowWidth[v1163] + v1162.rect.width;
          if (v1161.rows[v1163].length > 0) {
            v1167 += v1161.horizontalPadding;
          }
          v1161.rowWidth[v1163] = v1167;
          if (v1161.width < v1167) {
            v1161.width = v1167;
          }
          var v1168 = v1162.rect.height;
          if (v1163 > 0) {
            v1168 += v1161.verticalPadding;
          }
          var v1169 = 0;
          if (v1168 > v1161.rowHeight[v1163]) {
            v1169 = v1161.rowHeight[v1163];
            v1161.rowHeight[v1163] = v1168;
            v1169 = v1161.rowHeight[v1163] - v1169;
          }
          v1161.height += v1169;
          v1161.rows[v1163].push(v1162);
        };
        v997.prototype.getShortestRowIndex = function (v1170) {
          var v1171 = -1;
          var v1172 = Number.MAX_VALUE;
          for (var v1173 = 0; v1173 < v1170.rows.length; v1173++) {
            if (v1170.rowWidth[v1173] < v1172) {
              v1171 = v1173;
              v1172 = v1170.rowWidth[v1173];
            }
          }
          return v1171;
        };
        v997.prototype.getLongestRowIndex = function (v1174) {
          var v1175 = -1;
          var v1176 = Number.MIN_VALUE;
          for (var v1177 = 0; v1177 < v1174.rows.length; v1177++) {
            if (v1174.rowWidth[v1177] > v1176) {
              v1175 = v1177;
              v1176 = v1174.rowWidth[v1177];
            }
          }
          return v1175;
        };
        v997.prototype.canAddHorizontal = function (v1178, v1179, v1180) {
          var v1181 = this.getShortestRowIndex(v1178);
          if (v1181 < 0) {
            return true;
          }
          var v1182 = v1178.rowWidth[v1181];
          if (v1182 + v1178.horizontalPadding + v1179 <= v1178.width) {
            return true;
          }
          var v1183 = 0;
          if (v1178.rowHeight[v1181] < v1180) {
            if (v1181 > 0) {
              v1183 = v1180 + v1178.verticalPadding - v1178.rowHeight[v1181];
            }
          }
          var v1184;
          if (v1178.width - v1182 >= v1179 + v1178.horizontalPadding) {
            v1184 = (v1178.height + v1183) / (v1182 + v1179 + v1178.horizontalPadding);
          } else {
            v1184 = (v1178.height + v1183) / v1178.width;
          }
          v1183 = v1180 + v1178.verticalPadding;
          var v1185;
          if (v1178.width < v1179) {
            v1185 = (v1178.height + v1183) / v1179;
          } else {
            v1185 = (v1178.height + v1183) / v1178.width;
          }
          if (v1185 < 1) {
            v1185 = 1 / v1185;
          }
          if (v1184 < 1) {
            v1184 = 1 / v1184;
          }
          return v1184 < v1185;
        };
        v997.prototype.shiftToLastRow = function (v1186) {
          var v1187 = this.getLongestRowIndex(v1186);
          var v1188 = v1186.rowWidth.length - 1;
          var v1189 = v1186.rows[v1187];
          var v1190 = v1189[v1189.length - 1];
          var v1191 = v1190.width + v1186.horizontalPadding;
          if (v1186.width - v1186.rowWidth[v1188] > v1191 && v1187 != v1188) {
            v1189.splice(-1, 1);
            v1186.rows[v1188].push(v1190);
            v1186.rowWidth[v1187] = v1186.rowWidth[v1187] - v1191;
            v1186.rowWidth[v1188] = v1186.rowWidth[v1188] + v1191;
            v1186.width = v1186.rowWidth[instance.getLongestRowIndex(v1186)];
            var v1192 = Number.MIN_VALUE;
            for (var v1193 = 0; v1193 < v1189.length; v1193++) {
              if (v1189[v1193].height > v1192) {
                v1192 = v1189[v1193].height;
              }
            }
            if (v1187 > 0) {
              v1192 += v1186.verticalPadding;
            }
            var v1194 = v1186.rowHeight[v1187] + v1186.rowHeight[v1188];
            v1186.rowHeight[v1187] = v1192;
            if (v1186.rowHeight[v1188] < v1190.height + v1186.verticalPadding) {
              v1186.rowHeight[v1188] = v1190.height + v1186.verticalPadding;
            }
            var v1195 = v1186.rowHeight[v1187] + v1186.rowHeight[v1188];
            v1186.height += v1195 - v1194;
            this.shiftToLastRow(v1186);
          }
        };
        v997.prototype.tilingPreLayout = function () {
          if (v987.TILE) {
            this.groupZeroDegreeMembers();
            this.clearCompounds();
            this.clearZeroDegreeMembers();
          }
        };
        v997.prototype.tilingPostLayout = function () {
          if (v987.TILE) {
            this.repopulateZeroDegreeMembers();
            this.repopulateCompounds();
          }
        };
        v997.prototype.reduceTrees = function () {
          var v1196 = [];
          var v1197 = true;
          var v1198;
          while (v1197) {
            var v1199 = this.graphManager.getAllNodes();
            var v1200 = [];
            v1197 = false;
            for (var v1201 = 0; v1201 < v1199.length; v1201++) {
              v1198 = v1199[v1201];
              if (v1198.getEdges().length == 1 && !v1198.getEdges()[0].isInterGraph && v1198.getChild() == null) {
                v1200.push([v1198, v1198.getEdges()[0], v1198.getOwner()]);
                v1197 = true;
              }
            }
            if (v1197 == true) {
              var v1202 = [];
              for (var v1203 = 0; v1203 < v1200.length; v1203++) {
                if (v1200[v1203][0].getEdges().length == 1) {
                  v1202.push(v1200[v1203]);
                  v1200[v1203][0].getOwner().remove(v1200[v1203][0]);
                }
              }
              v1196.push(v1202);
              this.graphManager.resetAllNodes();
              this.graphManager.resetAllEdges();
            }
          }
          this.prunedNodesAll = v1196;
        };
        v997.prototype.growTree = function (v1204) {
          var v1205 = v1204.length;
          var v1206 = v1204[v1205 - 1];
          var v1207;
          for (var v1208 = 0; v1208 < v1206.length; v1208++) {
            v1207 = v1206[v1208];
            this.findPlaceforPrunedNode(v1207);
            v1207[2].add(v1207[0]);
            v1207[2].add(v1207[1], v1207[1].source, v1207[1].target);
          }
          v1204.splice(v1204.length - 1, 1);
          this.graphManager.resetAllNodes();
          this.graphManager.resetAllEdges();
        };
        v997.prototype.findPlaceforPrunedNode = function (v1209) {
          var v1210;
          var v1211;
          var v1212 = v1209[0];
          if (v1212 == v1209[1].source) {
            v1211 = v1209[1].target;
          } else {
            v1211 = v1209[1].source;
          }
          var v1213 = v1211.startX;
          var v1214 = v1211.finishX;
          var v1215 = v1211.startY;
          var v1216 = v1211.finishY;
          var v1217 = 0;
          var v1218 = 0;
          var v1219 = 0;
          var v1220 = 0;
          var v1221 = [v1217, v1219, v1218, v1220];
          if (v1215 > 0) {
            for (var v1222 = v1213; v1222 <= v1214; v1222++) {
              v1221[0] += this.grid[v1222][v1215 - 1].length + this.grid[v1222][v1215].length - 1;
            }
          }
          if (v1214 < this.grid.length - 1) {
            for (var v1222 = v1215; v1222 <= v1216; v1222++) {
              v1221[1] += this.grid[v1214 + 1][v1222].length + this.grid[v1214][v1222].length - 1;
            }
          }
          if (v1216 < this.grid[0].length - 1) {
            for (var v1222 = v1213; v1222 <= v1214; v1222++) {
              v1221[2] += this.grid[v1222][v1216 + 1].length + this.grid[v1222][v1216].length - 1;
            }
          }
          if (v1213 > 0) {
            for (var v1222 = v1215; v1222 <= v1216; v1222++) {
              v1221[3] += this.grid[v1213 - 1][v1222].length + this.grid[v1213][v1222].length - 1;
            }
          }
          var v1223 = v993.MAX_VALUE;
          var v1224;
          var v1225;
          for (var v1226 = 0; v1226 < v1221.length; v1226++) {
            if (v1221[v1226] < v1223) {
              v1223 = v1221[v1226];
              v1224 = 1;
              v1225 = v1226;
            } else if (v1221[v1226] == v1223) {
              v1224++;
            }
          }
          if (v1224 == 3 && v1223 == 0) {
            if (v1221[0] == 0 && v1221[1] == 0 && v1221[2] == 0) {
              v1210 = 1;
            } else if (v1221[0] == 0 && v1221[1] == 0 && v1221[3] == 0) {
              v1210 = 0;
            } else if (v1221[0] == 0 && v1221[2] == 0 && v1221[3] == 0) {
              v1210 = 3;
            } else if (v1221[1] == 0 && v1221[2] == 0 && v1221[3] == 0) {
              v1210 = 2;
            }
          } else if (v1224 == 2 && v1223 == 0) {
            var v1227 = Math.floor(Math.random() * 2);
            if (v1221[0] == 0 && v1221[1] == 0) {
              if (v1227 == 0) {
                v1210 = 0;
              } else {
                v1210 = 1;
              }
            } else if (v1221[0] == 0 && v1221[2] == 0) {
              if (v1227 == 0) {
                v1210 = 0;
              } else {
                v1210 = 2;
              }
            } else if (v1221[0] == 0 && v1221[3] == 0) {
              if (v1227 == 0) {
                v1210 = 0;
              } else {
                v1210 = 3;
              }
            } else if (v1221[1] == 0 && v1221[2] == 0) {
              if (v1227 == 0) {
                v1210 = 1;
              } else {
                v1210 = 2;
              }
            } else if (v1221[1] == 0 && v1221[3] == 0) {
              if (v1227 == 0) {
                v1210 = 1;
              } else {
                v1210 = 3;
              }
            } else if (v1227 == 0) {
              v1210 = 2;
            } else {
              v1210 = 3;
            }
          } else if (v1224 == 4 && v1223 == 0) {
            var v1227 = Math.floor(Math.random() * 4);
            v1210 = v1227;
          } else {
            v1210 = v1225;
          }
          if (v1210 == 0) {
            v1212.setCenter(v1211.getCenterX(), v1211.getCenterY() - v1211.getHeight() / 2 - v988.DEFAULT_EDGE_LENGTH - v1212.getHeight() / 2);
          } else if (v1210 == 1) {
            v1212.setCenter(v1211.getCenterX() + v1211.getWidth() / 2 + v988.DEFAULT_EDGE_LENGTH + v1212.getWidth() / 2, v1211.getCenterY());
          } else if (v1210 == 2) {
            v1212.setCenter(v1211.getCenterX(), v1211.getCenterY() + v1211.getHeight() / 2 + v988.DEFAULT_EDGE_LENGTH + v1212.getHeight() / 2);
          } else {
            v1212.setCenter(v1211.getCenterX() - v1211.getWidth() / 2 - v988.DEFAULT_EDGE_LENGTH - v1212.getWidth() / 2, v1211.getCenterY());
          }
        };
        v979.exports = v997;
      }, function (v1228, v1229, v1230) {
        var v1231 = {};
        v1231.layoutBase = v1230(0);
        v1231.CoSEConstants = v1230(1);
        v1231.CoSEEdge = v1230(2);
        v1231.CoSEGraph = v1230(3);
        v1231.CoSEGraphManager = v1230(4);
        v1231.CoSELayout = v1230(6);
        v1231.CoSENode = v1230(5);
        v1228.exports = v1231;
      }]);
    });
  })(coseBase$1);
  return coseBase$1.exports;
}
var cytoscapeCoseBilkent = cytoscapeCoseBilkent$1.exports;
var hasRequiredCytoscapeCoseBilkent;
function requireCytoscapeCoseBilkent() {
  if (hasRequiredCytoscapeCoseBilkent) {
    return cytoscapeCoseBilkent$1.exports;
  }
  hasRequiredCytoscapeCoseBilkent = 1;
  (function (v1232, v1233) {
    (function v1234(v1235, v1236) {
      v1232.exports = v1236(requireCoseBase());
    })(cytoscapeCoseBilkent, function (v1237) {
      return function (v1238) {
        var v1239 = {};
        function v1240(v1241) {
          if (v1239[v1241]) {
            return v1239[v1241].exports;
          }
          var v1242 = v1239[v1241] = {
            i: v1241,
            l: false,
            exports: {}
          };
          v1238[v1241].call(v1242.exports, v1242, v1242.exports, v1240);
          v1242.l = true;
          return v1242.exports;
        }
        v1240.m = v1238;
        v1240.c = v1239;
        v1240.i = function (v1243) {
          return v1243;
        };
        v1240.d = function (v1244, v1245, v1246) {
          if (!v1240.o(v1244, v1245)) {
            Object.defineProperty(v1244, v1245, {
              configurable: false,
              enumerable: true,
              get: v1246
            });
          }
        };
        v1240.n = function (v1247) {
          var v1248 = v1247 && v1247.__esModule ? function v1249() {
            return v1247.default;
          } : function v1250() {
            return v1247;
          };
          v1240.d(v1248, "a", v1248);
          return v1248;
        };
        v1240.o = function (v1251, v1252) {
          return Object.prototype.hasOwnProperty.call(v1251, v1252);
        };
        v1240.p = "";
        return v1240(v1240.s = 1);
      }([function (v1253, v1254) {
        v1253.exports = v1237;
      }, function (v1255, v1256, v1257) {
        var v1258 = v1257(0).layoutBase.LayoutConstants;
        var v1259 = v1257(0).layoutBase.FDLayoutConstants;
        var v1260 = v1257(0).CoSEConstants;
        var v1261 = v1257(0).CoSELayout;
        var v1262 = v1257(0).CoSENode;
        var v1263 = v1257(0).layoutBase.PointD;
        var v1264 = v1257(0).layoutBase.DimensionD;
        var v1265 = {
          ready: function v1266() {},
          stop: function v1267() {},
          quality: "default",
          nodeDimensionsIncludeLabels: false,
          refresh: 30,
          fit: true,
          padding: 10,
          randomize: true,
          nodeRepulsion: 4500,
          idealEdgeLength: 50,
          edgeElasticity: 0.45,
          nestingFactor: 0.1,
          gravity: 0.25,
          numIter: 2500,
          tile: true,
          animate: "end",
          animationDuration: 500,
          tilingPaddingVertical: 10,
          tilingPaddingHorizontal: 10,
          gravityRangeCompound: 1.5,
          gravityCompound: 1,
          gravityRange: 3.8,
          initialEnergyOnIncremental: 0.5
        };
        function v1268(v1269, v1270) {
          var v1271 = {};
          for (var v1272 in v1269) {
            v1271[v1272] = v1269[v1272];
          }
          for (var v1272 in v1270) {
            v1271[v1272] = v1270[v1272];
          }
          return v1271;
        }
        function v1273(v1274) {
          this.options = v1268(v1265, v1274);
          v1275(this.options);
        }
        var v1275 = function v1276(v1277) {
          if (v1277.nodeRepulsion != null) {
            v1260.DEFAULT_REPULSION_STRENGTH = v1259.DEFAULT_REPULSION_STRENGTH = v1277.nodeRepulsion;
          }
          if (v1277.idealEdgeLength != null) {
            v1260.DEFAULT_EDGE_LENGTH = v1259.DEFAULT_EDGE_LENGTH = v1277.idealEdgeLength;
          }
          if (v1277.edgeElasticity != null) {
            v1260.DEFAULT_SPRING_STRENGTH = v1259.DEFAULT_SPRING_STRENGTH = v1277.edgeElasticity;
          }
          if (v1277.nestingFactor != null) {
            v1260.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = v1259.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = v1277.nestingFactor;
          }
          if (v1277.gravity != null) {
            v1260.DEFAULT_GRAVITY_STRENGTH = v1259.DEFAULT_GRAVITY_STRENGTH = v1277.gravity;
          }
          if (v1277.numIter != null) {
            v1260.MAX_ITERATIONS = v1259.MAX_ITERATIONS = v1277.numIter;
          }
          if (v1277.gravityRange != null) {
            v1260.DEFAULT_GRAVITY_RANGE_FACTOR = v1259.DEFAULT_GRAVITY_RANGE_FACTOR = v1277.gravityRange;
          }
          if (v1277.gravityCompound != null) {
            v1260.DEFAULT_COMPOUND_GRAVITY_STRENGTH = v1259.DEFAULT_COMPOUND_GRAVITY_STRENGTH = v1277.gravityCompound;
          }
          if (v1277.gravityRangeCompound != null) {
            v1260.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = v1259.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = v1277.gravityRangeCompound;
          }
          if (v1277.initialEnergyOnIncremental != null) {
            v1260.DEFAULT_COOLING_FACTOR_INCREMENTAL = v1259.DEFAULT_COOLING_FACTOR_INCREMENTAL = v1277.initialEnergyOnIncremental;
          }
          if (v1277.quality == "draft") {
            v1258.QUALITY = 0;
          } else if (v1277.quality == "proof") {
            v1258.QUALITY = 2;
          } else {
            v1258.QUALITY = 1;
          }
          v1260.NODE_DIMENSIONS_INCLUDE_LABELS = v1259.NODE_DIMENSIONS_INCLUDE_LABELS = v1258.NODE_DIMENSIONS_INCLUDE_LABELS = v1277.nodeDimensionsIncludeLabels;
          v1260.DEFAULT_INCREMENTAL = v1259.DEFAULT_INCREMENTAL = v1258.DEFAULT_INCREMENTAL = !v1277.randomize;
          v1260.ANIMATE = v1259.ANIMATE = v1258.ANIMATE = v1277.animate;
          v1260.TILE = v1277.tile;
          v1260.TILING_PADDING_VERTICAL = typeof v1277.tilingPaddingVertical === "function" ? v1277.tilingPaddingVertical.call() : v1277.tilingPaddingVertical;
          v1260.TILING_PADDING_HORIZONTAL = typeof v1277.tilingPaddingHorizontal === "function" ? v1277.tilingPaddingHorizontal.call() : v1277.tilingPaddingHorizontal;
        };
        v1273.prototype.run = function () {
          var v1278;
          var v1279;
          var v1280 = this.options;
          this.idToLNode = {};
          var v1281 = this.layout = new v1261();
          var v1282 = this;
          v1282.stopped = false;
          this.cy = this.options.cy;
          this.cy.trigger({
            type: "layoutstart",
            layout: this
          });
          var v1283 = v1281.newGraphManager();
          this.gm = v1283;
          var v1284 = this.options.eles.nodes();
          var v1285 = this.options.eles.edges();
          this.root = v1283.addRoot();
          this.processChildrenList(this.root, this.getTopMostNodes(v1284), v1281);
          for (var v1286 = 0; v1286 < v1285.length; v1286++) {
            var v1287 = v1285[v1286];
            var v1288 = this.idToLNode[v1287.data("source")];
            var v1289 = this.idToLNode[v1287.data("target")];
            if (v1288 !== v1289 && v1288.getEdgesBetween(v1289).length == 0) {
              var v1290 = v1283.add(v1281.newEdge(), v1288, v1289);
              v1290.id = v1287.id();
            }
          }
          var v1291 = function v1292(v1293, v1294) {
            if (typeof v1293 === "number") {
              v1293 = v1294;
            }
            var v1295 = v1293.data("id");
            var v1296 = v1282.idToLNode[v1295];
            return {
              x: v1296.getRect().getCenterX(),
              y: v1296.getRect().getCenterY()
            };
          };
          var v1297 = function v1298() {
            var v1299 = function v1300() {
              if (v1280.fit) {
                v1280.cy.fit(v1280.eles, v1280.padding);
              }
              if (!v1278) {
                v1278 = true;
                v1282.cy.one("layoutready", v1280.ready);
                v1282.cy.trigger({
                  type: "layoutready",
                  layout: v1282
                });
              }
            };
            var v1301 = v1282.options.refresh;
            var v1302;
            for (var v1303 = 0; v1303 < v1301 && !v1302; v1303++) {
              v1302 = v1282.stopped || v1282.layout.tick();
            }
            if (v1302) {
              if (v1281.checkLayoutSuccess() && !v1281.isSubLayout) {
                v1281.doPostLayout();
              }
              if (v1281.tilingPostLayout) {
                v1281.tilingPostLayout();
              }
              v1281.isLayoutFinished = true;
              v1282.options.eles.nodes().positions(v1291);
              v1299();
              v1282.cy.one("layoutstop", v1282.options.stop);
              v1282.cy.trigger({
                type: "layoutstop",
                layout: v1282
              });
              if (v1279) {
                cancelAnimationFrame(v1279);
              }
              v1278 = false;
              return;
            }
            var v1304 = v1282.layout.getPositionsData();
            v1280.eles.nodes().positions(function (v1305, v1306) {
              if (typeof v1305 === "number") {
                v1305 = v1306;
              }
              if (!v1305.isParent()) {
                var v1307 = v1305.id();
                var v1308 = v1304[v1307];
                var v1309 = v1305;
                while (v1308 == null) {
                  v1308 = v1304[v1309.data("parent")] || v1304["DummyCompound_" + v1309.data("parent")];
                  v1304[v1307] = v1308;
                  v1309 = v1309.parent()[0];
                  if (v1309 == undefined) {
                    break;
                  }
                }
                if (v1308 != null) {
                  return {
                    x: v1308.x,
                    y: v1308.y
                  };
                } else {
                  return {
                    x: v1305.position("x"),
                    y: v1305.position("y")
                  };
                }
              }
            });
            v1299();
            v1279 = requestAnimationFrame(v1298);
          };
          v1281.addListener("layoutstarted", function () {
            if (v1282.options.animate === "during") {
              v1279 = requestAnimationFrame(v1297);
            }
          });
          v1281.runLayout();
          if (this.options.animate !== "during") {
            v1282.options.eles.nodes().not(":parent").layoutPositions(v1282, v1282.options, v1291);
            v1278 = false;
          }
          return this;
        };
        v1273.prototype.getTopMostNodes = function (v1310) {
          var v1311 = {};
          for (var v1312 = 0; v1312 < v1310.length; v1312++) {
            v1311[v1310[v1312].id()] = true;
          }
          var v1313 = v1310.filter(function (v1314, v1315) {
            if (typeof v1314 === "number") {
              v1314 = v1315;
            }
            var v1316 = v1314.parent()[0];
            while (v1316 != null) {
              if (v1311[v1316.id()]) {
                return false;
              }
              v1316 = v1316.parent()[0];
            }
            return true;
          });
          return v1313;
        };
        v1273.prototype.processChildrenList = function (v1317, v1318, v1319) {
          var v1320 = v1318.length;
          for (var v1321 = 0; v1321 < v1320; v1321++) {
            var v1322 = v1318[v1321];
            var v1323 = v1322.children();
            var v1324;
            var v1325 = v1322.layoutDimensions({
              nodeDimensionsIncludeLabels: this.options.nodeDimensionsIncludeLabels
            });
            if (v1322.outerWidth() != null && v1322.outerHeight() != null) {
              v1324 = v1317.add(new v1262(v1319.graphManager, new v1263(v1322.position("x") - v1325.w / 2, v1322.position("y") - v1325.h / 2), new v1264(parseFloat(v1325.w), parseFloat(v1325.h))));
            } else {
              v1324 = v1317.add(new v1262(this.graphManager));
            }
            v1324.id = v1322.data("id");
            v1324.paddingLeft = parseInt(v1322.css("padding"));
            v1324.paddingTop = parseInt(v1322.css("padding"));
            v1324.paddingRight = parseInt(v1322.css("padding"));
            v1324.paddingBottom = parseInt(v1322.css("padding"));
            if (this.options.nodeDimensionsIncludeLabels) {
              if (v1322.isParent()) {
                var v1326 = v1322.boundingBox({
                  includeLabels: true,
                  includeNodes: false
                }).w;
                var v1327 = v1322.boundingBox({
                  includeLabels: true,
                  includeNodes: false
                }).h;
                var v1328 = v1322.css("text-halign");
                v1324.labelWidth = v1326;
                v1324.labelHeight = v1327;
                v1324.labelPos = v1328;
              }
            }
            this.idToLNode[v1322.data("id")] = v1324;
            if (isNaN(v1324.rect.x)) {
              v1324.rect.x = 0;
            }
            if (isNaN(v1324.rect.y)) {
              v1324.rect.y = 0;
            }
            if (v1323 != null && v1323.length > 0) {
              var v1329;
              v1329 = v1319.getGraphManager().add(v1319.newGraph(), v1324);
              this.processChildrenList(v1329, v1323, v1319);
            }
          }
        };
        v1273.prototype.stop = function () {
          this.stopped = true;
          return this;
        };
        var v1330 = function v1331(v1332) {
          v1332("layout", "cose-bilkent", v1273);
        };
        if (typeof cytoscape !== "undefined") {
          v1330(cytoscape);
        }
        v1255.exports = v1330;
      }]);
    });
  })(cytoscapeCoseBilkent$1);
  return cytoscapeCoseBilkent$1.exports;
}
var cytoscapeCoseBilkentExports = requireCytoscapeCoseBilkent();
const coseBilkent = v1(cytoscapeCoseBilkentExports);
v5.use(coseBilkent);
function addNodes(v1333, v1334) {
  v1333.forEach(v1335 => {
    const v1336 = {
      id: v1335.id,
      labelText: v1335.label,
      height: v1335.height,
      width: v1335.width,
      padding: v1335.padding ?? 0
    };
    Object.keys(v1335).forEach(v1337 => {
      if (!["id", "label", "height", "width", "padding", "x", "y"].includes(v1337)) {
        v1336[v1337] = v1335[v1337];
      }
    });
    v1334.add({
      group: "nodes",
      data: v1336,
      position: {
        x: v1335.x ?? 0,
        y: v1335.y ?? 0
      }
    });
  });
}
v2(addNodes, "addNodes");
function addEdges(v1338, v1339) {
  v1338.forEach(v1340 => {
    const v1341 = {
      id: v1340.id,
      source: v1340.start,
      target: v1340.end
    };
    Object.keys(v1340).forEach(v1342 => {
      if (!["id", "start", "end"].includes(v1342)) {
        v1341[v1342] = v1340[v1342];
      }
    });
    v1339.add({
      group: "edges",
      data: v1341
    });
  });
}
v2(addEdges, "addEdges");
function createCytoscapeInstance(v1343) {
  return new Promise(v1344 => {
    const v1345 = v4("body").append("div").attr("id", "cy").attr("style", "display:none");
    const v1346 = v5({
      container: document.getElementById("cy"),
      style: [{
        selector: "edge",
        style: {
          "curve-style": "bezier"
        }
      }]
    });
    v1345.remove();
    addNodes(v1343.nodes, v1346);
    addEdges(v1343.edges, v1346);
    v1346.nodes().forEach(function (v1347) {
      v1347.layoutDimensions = () => {
        const v1348 = v1347.data();
        return {
          w: v1348.width,
          h: v1348.height
        };
      };
    });
    const v1349 = {
      name: "cose-bilkent",
      quality: "proof",
      styleEnabled: false,
      animate: false
    };
    v1346.layout(v1349).run();
    v1346.ready(v1350 => {
      v3.info("Cytoscape ready", v1350);
      v1344(v1346);
    });
  });
}
v2(createCytoscapeInstance, "createCytoscapeInstance");
function extractPositionedNodes(v1351) {
  return v1351.nodes().map(v1352 => {
    const v1353 = v1352.data();
    const v1354 = v1352.position();
    const v1355 = {
      id: v1353.id,
      x: v1354.x,
      y: v1354.y
    };
    Object.keys(v1353).forEach(v1356 => {
      if (v1356 !== "id") {
        v1355[v1356] = v1353[v1356];
      }
    });
    return v1355;
  });
}
v2(extractPositionedNodes, "extractPositionedNodes");
function extractPositionedEdges(v1357) {
  return v1357.edges().map(v1358 => {
    const v1359 = v1358.data();
    const v1360 = v1358._private.rscratch;
    const v1361 = {
      id: v1359.id,
      source: v1359.source,
      target: v1359.target,
      startX: v1360.startX,
      startY: v1360.startY,
      midX: v1360.midX,
      midY: v1360.midY,
      endX: v1360.endX,
      endY: v1360.endY
    };
    Object.keys(v1359).forEach(v1362 => {
      if (!["id", "source", "target"].includes(v1362)) {
        v1361[v1362] = v1359[v1362];
      }
    });
    return v1361;
  });
}
v2(extractPositionedEdges, "extractPositionedEdges");
async function executeCoseBilkentLayout(v1363, v1364) {
  v3.debug("Starting cose-bilkent layout algorithm");
  try {
    validateLayoutData(v1363);
    const v1365 = await createCytoscapeInstance(v1363);
    const v1366 = extractPositionedNodes(v1365);
    const v1367 = extractPositionedEdges(v1365);
    v3.debug("Layout completed: " + v1366.length + " nodes, " + v1367.length + " edges");
    return {
      nodes: v1366,
      edges: v1367
    };
  } catch (v1368) {
    v3.error("Error in cose-bilkent layout algorithm:", v1368);
    throw v1368;
  }
}
v2(executeCoseBilkentLayout, "executeCoseBilkentLayout");
function validateLayoutData(v1369) {
  if (!v1369) {
    throw new Error("Layout data is required");
  }
  if (!v1369.config) {
    throw new Error("Configuration is required in layout data");
  }
  if (!v1369.rootNode) {
    throw new Error("Root node is required");
  }
  if (!v1369.nodes || !Array.isArray(v1369.nodes)) {
    throw new Error("No nodes found in layout data");
  }
  if (!Array.isArray(v1369.edges)) {
    throw new Error("Edges array is required in layout data");
  }
  return true;
}
v2(validateLayoutData, "validateLayoutData");
var render = v2(async (v1370, v1371, {
  insertCluster: v1372,
  insertEdge: v1373,
  insertEdgeLabel: v1374,
  insertMarkers: v1375,
  insertNode: v1376,
  log: v1377,
  positionEdgeLabel: v1378
}, {
  algorithm: v1379
}) => {
  const v1380 = {};
  const v1381 = {};
  const v1382 = v1371.select("g");
  v1375(v1382, v1370.markers, v1370.type, v1370.diagramId);
  const v1383 = v1382.insert("g").attr("class", "subgraphs");
  const v1384 = v1382.insert("g").attr("class", "edgePaths");
  const v1385 = v1382.insert("g").attr("class", "edgeLabels");
  const v1386 = v1382.insert("g").attr("class", "nodes");
  v1377.debug("Inserting nodes into DOM for dimension calculation");
  await Promise.all(v1370.nodes.map(async v1387 => {
    if (v1387.isGroup) {
      const v1388 = {
        ...v1387
      };
      v1381[v1387.id] = v1388;
      v1380[v1387.id] = v1388;
      await v1372(v1383, v1387);
    } else {
      const v1389 = {
        ...v1387
      };
      v1380[v1387.id] = v1389;
      const v1390 = await v1376(v1386, v1387, {
        config: v1370.config,
        dir: v1370.direction || "TB"
      });
      const v1391 = v1390.node().getBBox();
      v1389.width = v1391.width;
      v1389.height = v1391.height;
      v1389.domId = v1390;
      v1377.debug("Node " + v1387.id + " dimensions: " + v1391.width + "x" + v1391.height);
    }
  }));
  v1377.debug("Running cose-bilkent layout algorithm");
  const v1392 = {
    ...v1370,
    nodes: v1370.nodes.map(v1393 => {
      const v1394 = v1380[v1393.id];
      return {
        ...v1393,
        width: v1394.width,
        height: v1394.height
      };
    })
  };
  const v1395 = await executeCoseBilkentLayout(v1392, v1370.config);
  v1377.debug("Positioning nodes based on layout results");
  v1395.nodes.forEach(v1396 => {
    const v1397 = v1380[v1396.id];
    if (v1397?.domId) {
      v1397.domId.attr("transform", "translate(" + v1396.x + ", " + v1396.y + ")");
      v1397.x = v1396.x;
      v1397.y = v1396.y;
      v1377.debug("Positioned node " + v1397.id + " at center (" + v1396.x + ", " + v1396.y + ")");
    }
  });
  v1395.edges.forEach(v1398 => {
    const v1399 = v1370.edges.find(v1400 => v1400.id === v1398.id);
    if (v1399) {
      v1399.points = [{
        x: v1398.startX,
        y: v1398.startY
      }, {
        x: v1398.midX,
        y: v1398.midY
      }, {
        x: v1398.endX,
        y: v1398.endY
      }];
    }
  });
  v1377.debug("Inserting and positioning edges");
  await Promise.all(v1370.edges.map(async v1401 => {
    await v1374(v1385, v1401);
    const v1402 = v1380[v1401.start ?? ""];
    const v1403 = v1380[v1401.end ?? ""];
    if (v1402 && v1403) {
      const v1404 = v1395.edges.find(v1405 => v1405.id === v1401.id);
      if (v1404) {
        v1377.debug("APA01 positionedEdge", v1404);
        const v1406 = {
          ...v1401
        };
        const v1407 = v1373(v1384, v1406, v1381, v1370.type, v1402, v1403, v1370.diagramId);
        v1378(v1406, v1407);
      } else {
        const v1408 = {
          ...v1401,
          points: [{
            x: v1402.x || 0,
            y: v1402.y || 0
          }, {
            x: v1403.x || 0,
            y: v1403.y || 0
          }]
        };
        const v1409 = v1373(v1384, v1408, v1381, v1370.type, v1402, v1403, v1370.diagramId);
        v1378(v1408, v1409);
      }
    }
  }));
  v1377.debug("Cose-bilkent rendering completed");
}, "render");
var render2 = render;
export { render2 as render };