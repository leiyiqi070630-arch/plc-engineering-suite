'use strict';

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (v1, v2, v3, v4) => {
  if (v2 && typeof v2 === "object" || typeof v2 === "function") {
    for (let v5 of __getOwnPropNames(v2)) {
      if (!__hasOwnProp.call(v1, v5) && v5 !== v3) {
        __defProp(v1, v5, {
          get: () => v2[v5],
          enumerable: !(v4 = __getOwnPropDesc(v2, v5)) || v4.enumerable
        });
      }
    }
  }
  return v1;
};
var __toESM = (v6, v7, v8) => {
  v8 = v6 != null ? __create(__getProtoOf(v6)) : {};
  return __copyProps(v7 || !v6 || !v6.__esModule ? __defProp(v8, "default", {
    value: v6,
    enumerable: true
  }) : v8, v6);
};
const require$$0$2 = require("child_process");
const require$$0$1 = require("path");
const require$$0 = require("fs");
const process$2 = require("node:process");
const node_stream = require("node:stream");
const node_crypto = require("node:crypto");
const node_fs = require("node:fs");
const promises = require("node:fs/promises");
const node_path = require("node:path");
const KNOWLEDGE_SOFTWARE = [{
  id: "mitsubishi",
  name: "三菱",
  detail: "GX Works2"
}, {
  id: "siemens",
  name: "西门子",
  detail: "TIA Portal"
}, {
  id: "smart200",
  name: "SMART 200",
  detail: "Micro/WIN SMART"
}, {
  id: "inovance",
  name: "汇川",
  detail: "InoProShop"
}, {
  id: "codesys",
  name: "CODESYS",
  detail: "CODESYS Development System"
}];
function defaultWorkbenchPreferences() {
  return {
    version: 1,
    revision: 0,
    responseStyle: "default",
    instructionsEnabled: false,
    instructions: "",
    experienceEnabled: true,
    knowledge: [],
    mcp: []
  };
}
const softwareIds = new Set(KNOWLEDGE_SOFTWARE.map(v9 => v9.id));
function safeFolderName(v10) {
  const v11 = v10.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/[. ]+$/g, "").slice(0, 80) || "未备注的知识";
  if (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(v11)) {
    return "_" + v11;
  } else {
    return v11;
  }
}
function within(v12, v13) {
  const v14 = node_path.relative(v12, v13);
  return v14 === "" || !node_path.isAbsolute(v14) && v14 !== ".." && !v14.startsWith(".." + node_path.sep);
}
function atomicJson(v15, v16) {
  node_fs.mkdirSync(node_path.dirname(v15), {
    recursive: true
  });
  const v17 = v15 + ".tmp-" + node_crypto.randomUUID();
  node_fs.writeFileSync(v17, JSON.stringify(v16, null, 2), "utf8");
  node_fs.renameSync(v17, v15);
}
function validateMcp(v18) {
  if (!v18 || !["stdio", "http", "sse"].includes(v18.transport)) {
    throw new Error("请选择有效的连接方式");
  }
  const v19 = String(v18.name ?? "").trim();
  if (!v19 || v19.length > 60) {
    throw new Error("服务名称需要在 1 到 60 个字符之间");
  }
  const v20 = v21 => {
    if (!v21 || typeof v21 !== "object" || Array.isArray(v21)) {
      throw new Error("环境变量和请求头必须是键值对象");
    }
    const v22 = Object.entries(v21);
    if (v22.length > 100 || v22.some(([v23, v24]) => !v23 || v23.includes("\0") || typeof v24 !== "string" || v24.includes("\0"))) {
      throw new Error("环境变量或请求头的格式不正确");
    }
    return Object.fromEntries(v22);
  };
  if (!Array.isArray(v18.args) || v18.args.some(v25 => typeof v25 !== "string" || v25.includes("\0"))) {
    throw new Error("参数需要是字符串列表");
  }
  if (v18.transport === "stdio" && (!v18.command?.trim() || /[\r\n\0]/.test(v18.command))) {
    throw new Error("请填写可执行程序或启动命令");
  }
  if (v18.transport !== "stdio") {
    const v26 = new URL(v18.url);
    if (!["http:", "https:"].includes(v26.protocol) || v26.username || v26.password) {
      throw new Error("服务地址需要是 HTTP 或 HTTPS，凭据请放在请求头里");
    }
  }
  return {
    id: v18.id || node_crypto.randomUUID(),
    name: v19,
    transport: v18.transport,
    command: v18.command.trim(),
    args: [...v18.args],
    env: v20(v18.env),
    url: v18.url.trim(),
    headers: v20(v18.headers),
    enabled: v18.enabled === true
  };
}
class WorkbenchStore {
  constructor(v27) {
    this.home = v27;
    this.path = node_path.join(v27, "workbench.json");
    this.knowledgeRoot = node_path.join(v27, "private-knowledge");
  }
  home;
  state = defaultWorkbenchPreferences();
  path;
  knowledgeRoot;
  pending = Promise.resolve();
  load() {
    if (node_fs.existsSync(this.path)) {
      const v28 = JSON.parse(node_fs.readFileSync(this.path, "utf8"));
      if (v28.version !== 1 || !Array.isArray(v28.knowledge) || !Array.isArray(v28.mcp)) {
        throw new Error("设置资料文件无法读取，请保留文件并联系支持");
      }
      this.state = {
        ...defaultWorkbenchPreferences(),
        ...v28
      };
    }
    for (const v29 of KNOWLEDGE_SOFTWARE) {
      node_fs.mkdirSync(node_path.join(this.knowledgeRoot, v29.id), {
        recursive: true
      });
    }
    return this.current;
  }
  get current() {
    return structuredClone(this.state);
  }
  save(v30) {
    v30.revision = Math.max(Date.now(), this.state.revision + 1);
    atomicJson(this.path, v30);
    this.state = v30;
  }
  collection(v31) {
    const v32 = this.state.knowledge.find(v33 => v33.id === v31);
    if (!v32 || !softwareIds.has(v32.software) || safeFolderName(v32.folderName) !== v32.folderName) {
      throw new Error("资料夹不存在");
    }
    return v32;
  }
  collectionPath(v34) {
    const v35 = this.collection(v34);
    const v36 = node_fs.realpathSync(this.knowledgeRoot);
    const v37 = node_path.join(v36, v35.software, v35.folderName);
    if (node_fs.existsSync(v37) && (!within(v36, node_fs.realpathSync(v37)) || node_fs.lstatSync(v37).isSymbolicLink())) {
      throw new Error("资料夹路径已改变，请重新导入");
    }
    return v37;
  }
  availableFolder(v38, v39, v40) {
    const v41 = safeFolderName(v39);
    let v42 = v41;
    let v43 = 2;
    while (v42 !== v40 && node_fs.existsSync(node_path.join(this.knowledgeRoot, v38, v42))) {
      v42 = v41 + " (" + v43++ + ")";
    }
    return v42;
  }
  mutate(v44) {
    const v45 = this.pending.then(() => this.perform(v44));
    this.pending = v45.catch(() => undefined);
    return v45;
  }
  async perform(v46) {
    const v47 = this.current;
    if (v46.type === "preferences") {
      const v48 = v46.values;
      if (v48.responseStyle !== undefined) {
        if (!["default", "friendly", "practical", "efficient"].includes(v48.responseStyle)) {
          throw new Error("未知的回复风格");
        }
        v47.responseStyle = v48.responseStyle;
      }
      if (v48.instructions !== undefined) {
        if (typeof v48.instructions !== "string" || v48.instructions.length > 12000) {
          throw new Error("自定义指令最多 12000 字");
        }
        v47.instructions = v48.instructions;
      }
      for (const v49 of ["experienceEnabled", "instructionsEnabled"]) {
        if (typeof v48[v49] === "boolean") {
          v47[v49] = v48[v49];
        }
      }
    } else if (v46.type === "knowledge-create") {
      if (!softwareIds.has(v46.software)) {
        throw new Error("请选择支持的软件");
      }
      const v50 = v46.note.trim().slice(0, 200);
      const v51 = this.availableFolder(v46.software, v50);
      node_fs.mkdirSync(node_path.join(this.knowledgeRoot, v46.software, v51));
      v47.knowledge.push({
        id: node_crypto.randomUUID(),
        software: v46.software,
        note: v50,
        folderName: v51,
        allowed: false,
        createdAt: Date.now()
      });
    } else if (v46.type === "knowledge-update") {
      const v52 = this.collection(v46.id);
      const v53 = v47.knowledge.find(v54 => v54.id === v52.id);
      if (v46.note !== undefined) {
        v53.note = v46.note.trim().slice(0, 200);
        v53.folderName = this.availableFolder(v53.software, v53.note, v52.folderName);
        if (v53.folderName !== v52.folderName) {
          const v55 = this.collectionPath(v53.id);
          const v56 = node_path.join(node_path.dirname(v55), v53.folderName);
          await promises.rename(v55, v56);
          try {
            this.save(v47);
          } catch (v57) {
            await promises.rename(v56, v55);
            throw v57;
          }
        }
      }
      if (v46.allowed !== undefined) {
        v53.allowed = v46.allowed === true;
      }
    } else if (v46.type === "knowledge-delete") {
      const v58 = this.collectionPath(v46.id);
      const v59 = node_path.join(this.home, "knowledge-trash", Date.now() + "-" + v46.id);
      node_fs.mkdirSync(node_path.dirname(v59), {
        recursive: true
      });
      if (node_fs.existsSync(v58)) {
        await promises.rename(v58, v59);
      }
      v47.knowledge = v47.knowledge.filter(v60 => v60.id !== v46.id);
      try {
        this.save(v47);
      } catch (v61) {
        if (node_fs.existsSync(v59)) {
          await promises.rename(v59, v58);
        }
        throw v61;
      }
      return this.current;
    } else if (v46.type === "knowledge-import") {
      const v62 = this.collectionPath(v46.id);
      if (!Array.isArray(v46.paths) || !v46.paths.length || v46.paths.length > 200) {
        throw new Error("每次请选择 1 到 200 个文件或文件夹");
      }
      const v63 = node_path.join(this.home, "knowledge-imports", node_crypto.randomUUID());
      node_fs.mkdirSync(v63, {
        recursive: true
      });
      const v64 = [];
      const v65 = [];
      try {
        for (const v66 of v46.paths) {
          const v67 = node_path.resolve(v66);
          if (!node_path.isAbsolute(v66) || within(node_fs.realpathSync(this.knowledgeRoot), node_fs.realpathSync(v67))) {
            throw new Error("请选择资料库以外的源文件");
          }
          const v68 = await promises.lstat(v67);
          if (v68.isSymbolicLink() || !v68.isFile() && !v68.isDirectory() || within(node_fs.realpathSync(v67), node_fs.realpathSync(v62))) {
            throw new Error("无法导入链接或包含资料库的目录");
          }
          const v69 = node_path.basename(v67);
          let v70 = v69;
          let v71 = 2;
          while (node_fs.existsSync(node_path.join(v62, v70)) || v64.includes(v70)) {
            v70 = v69 + " (" + v71++ + ")";
          }
          await promises.cp(v67, node_path.join(v63, v70), {
            recursive: true,
            force: false,
            errorOnExist: true,
            filter: async v72 => {
              if ((await promises.lstat(v72)).isSymbolicLink()) {
                throw new Error("资料中包含链接：" + node_path.basename(v72));
              }
              return true;
            }
          });
          v64.push(v70);
        }
        for (const v73 of v64) {
          await promises.rename(node_path.join(v63, v73), node_path.join(v62, v73));
          v65.push(v73);
        }
      } catch (v74) {
        for (const v75 of v65) {
          await promises.rename(node_path.join(v62, v75), node_path.join(v63, v75));
        }
        throw v74;
      } finally {
        await promises.rm(v63, {
          recursive: true,
          force: true
        });
      }
    } else if (v46.type === "knowledge-delete-file") {
      const v76 = this.collectionPath(v46.id);
      const v77 = node_path.resolve(v76, v46.path);
      if (v77 === v76 || !within(v76, v77) || !within(node_fs.realpathSync(v76), node_fs.realpathSync(v77))) {
        throw new Error("无效的资料路径");
      }
      const v78 = node_path.join(this.home, "knowledge-trash", Date.now() + "-" + node_crypto.randomUUID(), node_path.basename(v77));
      node_fs.mkdirSync(node_path.dirname(v78), {
        recursive: true
      });
      await promises.rename(v77, v78);
    } else if (v46.type === "mcp-save") {
      const v79 = validateMcp(v46.connection);
      if (v47.mcp.some(v80 => v80.id !== v79.id && v80.name.toLowerCase() === v79.name.toLowerCase())) {
        throw new Error("这个服务名称已经存在");
      }
      v47.mcp = [...v47.mcp.filter(v81 => v81.id !== v79.id), v79];
    } else if (v46.type === "mcp-delete") {
      v47.mcp = v47.mcp.filter(v82 => v82.id !== v46.id);
    } else {
      throw new Error("未知设置操作");
    }
    this.save(v47);
    return this.current;
  }
  async files(v83, v84 = "") {
    const v85 = this.collectionPath(v83);
    const v86 = node_path.resolve(v85, v84);
    if (!within(v85, v86) || !within(node_fs.realpathSync(v85), node_fs.realpathSync(v86))) {
      throw new Error("无效的资料路径");
    }
    const v87 = [];
    for (const v88 of await promises.readdir(v86, {
      withFileTypes: true
    })) {
      if (v88.isSymbolicLink()) {
        continue;
      }
      const v89 = node_path.join(v86, v88.name);
      v87.push({
        path: node_path.relative(v85, v89).replace(/\\/g, "/"),
        name: v88.name,
        directory: v88.isDirectory(),
        bytes: v88.isFile() ? (await promises.stat(v89)).size : 0
      });
    }
    return v87.sort((v90, v91) => Number(v91.directory) - Number(v90.directory) || v90.name.localeCompare(v91.name));
  }
  writeMcpRuntimeConfig(v92, v93, v94 = {}) {
    const v95 = node_path.join(this.home, "desktop-mcp.json");
    const v96 = this.state.mcp.filter(v97 => v97.enabled).map(v98 => ["desktop_" + v98.id.replace(/-/g, ""), v98.transport === "stdio" ? {
      type: "stdio",
      command: v98.command,
      args: v98.args,
      env: v98.env
    } : {
      type: "stdio",
      command: v92,
      args: [v93, this.path, v98.id],
      env: {
        ELECTRON_RUN_AS_NODE: "1"
      }
    }]);
    atomicJson(v95, {
      mcpServers: {
        ...v94,
        ...Object.fromEntries(v96)
      }
    });
    return v95;
  }
}
const NEVER = Object.freeze({
  status: "aborted"
});
function $constructor(v99, v100, v101) {
  function v102(v103, v104) {
    if (!v103._zod) {
      Object.defineProperty(v103, "_zod", {
        value: {
          def: v104,
          constr: v105,
          traits: new Set()
        },
        enumerable: false
      });
    }
    if (v103._zod.traits.has(v99)) {
      return;
    }
    v103._zod.traits.add(v99);
    v100(v103, v104);
    const v106 = v105.prototype;
    const v107 = Object.keys(v106);
    for (let v108 = 0; v108 < v107.length; v108++) {
      const v109 = v107[v108];
      if (!(v109 in v103)) {
        v103[v109] = v106[v109].bind(v103);
      }
    }
  }
  const v110 = v101?.Parent ?? Object;
  class v111 extends v110 {}
  Object.defineProperty(v111, "name", {
    value: v99
  });
  function v105(v112) {
    var v113;
    const v114 = v101?.Parent ? new v111() : this;
    v102(v114, v112);
    (v113 = v114._zod).deferred ?? (v113.deferred = []);
    for (const v115 of v114._zod.deferred) {
      v115();
    }
    return v114;
  }
  Object.defineProperty(v105, "init", {
    value: v102
  });
  Object.defineProperty(v105, Symbol.hasInstance, {
    value: v116 => {
      if (v101?.Parent && v116 instanceof v101.Parent) {
        return true;
      }
      return v116?._zod?.traits?.has(v99);
    }
  });
  Object.defineProperty(v105, "name", {
    value: v99
  });
  return v105;
}
class $ZodAsyncError extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class $ZodEncodeError extends Error {
  constructor(v117) {
    super("Encountered unidirectional transform during encode: " + v117);
    this.name = "ZodEncodeError";
  }
}
globalThis.__zod_globalConfig ??= {};
const globalConfig = globalThis.__zod_globalConfig;
function config(v118) {
  return globalConfig;
}
function getEnumValues(v119) {
  const v120 = Object.values(v119).filter(v121 => typeof v121 === "number");
  const v122 = Object.entries(v119).filter(([v123, v124]) => v120.indexOf(+v123) === -1).map(([v125, v126]) => v126);
  return v122;
}
function jsonStringifyReplacer(v127, v128) {
  if (typeof v128 === "bigint") {
    return v128.toString();
  }
  return v128;
}
function cached(v129) {
  return {
    get value() {
      {
        const v130 = v129();
        Object.defineProperty(this, "value", {
          value: v130
        });
        return v130;
      }
    }
  };
}
function nullish(v131) {
  return v131 === null || v131 === undefined;
}
function cleanRegex(v132) {
  const v133 = v132.startsWith("^") ? 1 : 0;
  const v134 = v132.endsWith("$") ? v132.length - 1 : v132.length;
  return v132.slice(v133, v134);
}
function floatSafeRemainder(v135, v136) {
  const v137 = v135 / v136;
  const v138 = Math.round(v137);
  const v139 = Number.EPSILON * Math.max(Math.abs(v137), 1);
  if (Math.abs(v137 - v138) < v139) {
    return 0;
  }
  return v137 - v138;
}
const EVALUATING = Symbol("evaluating");
function defineLazy(v140, v141, v142) {
  let v143 = undefined;
  Object.defineProperty(v140, v141, {
    get() {
      if (v143 === EVALUATING) {
        return undefined;
      }
      if (v143 === undefined) {
        v143 = EVALUATING;
        v143 = v142();
      }
      return v143;
    },
    set(v144) {
      Object.defineProperty(v140, v141, {
        value: v144
      });
    },
    configurable: true
  });
}
function assignProp(v145, v146, v147) {
  Object.defineProperty(v145, v146, {
    value: v147,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...v148) {
  const v149 = {};
  for (const v150 of v148) {
    const v151 = Object.getOwnPropertyDescriptors(v150);
    Object.assign(v149, v151);
  }
  return Object.defineProperties({}, v149);
}
function esc(v152) {
  return JSON.stringify(v152);
}
function slugify(v153) {
  return v153.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (...v154) => {};
function isObject(v155) {
  return typeof v155 === "object" && v155 !== null && !Array.isArray(v155);
}
const allowsEval = cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const v156 = Function;
    new v156("");
    return true;
  } catch (v157) {
    return false;
  }
});
function isPlainObject$1(v158) {
  if (isObject(v158) === false) {
    return false;
  }
  const v159 = v158.constructor;
  if (v159 === undefined) {
    return true;
  }
  if (typeof v159 !== "function") {
    return true;
  }
  const v160 = v159.prototype;
  if (isObject(v160) === false) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(v160, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(v161) {
  if (isPlainObject$1(v161)) {
    return {
      ...v161
    };
  }
  if (Array.isArray(v161)) {
    return [...v161];
  }
  if (v161 instanceof Map) {
    return new Map(v161);
  }
  if (v161 instanceof Set) {
    return new Set(v161);
  }
  return v161;
}
const propertyKeyTypes = new Set(["string", "number", "symbol"]);
function escapeRegex(v162) {
  return v162.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(v163, v164, v165) {
  const v166 = new v163._zod.constr(v164 ?? v163._zod.def);
  if (!v164 || v165?.parent) {
    v166._zod.parent = v163;
  }
  return v166;
}
function normalizeParams(v167) {
  const v168 = v167;
  if (!v168) {
    return {};
  }
  if (typeof v168 === "string") {
    return {
      error: () => v168
    };
  }
  if (v168?.message !== undefined) {
    if (v168?.error !== undefined) {
      throw new Error("Cannot specify both `message` and `error` params");
    }
    v168.error = v168.message;
  }
  delete v168.message;
  if (typeof v168.error === "string") {
    return {
      ...v168,
      error: () => v168.error
    };
  }
  return v168;
}
function optionalKeys(v169) {
  return Object.keys(v169).filter(v170 => {
    return v169[v170]._zod.optin === "optional" && v169[v170]._zod.optout === "optional";
  });
}
const NUMBER_FORMAT_RANGES = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-3.4028234663852886e+38, 3.4028234663852886e+38],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function pick(v171, v172) {
  const v173 = v171._zod.def;
  const v174 = v173.checks;
  const v175 = v174 && v174.length > 0;
  if (v175) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const v176 = mergeDefs(v171._zod.def, {
    get shape() {
      const v177 = {};
      for (const v178 in v172) {
        if (!(v178 in v173.shape)) {
          throw new Error("Unrecognized key: \"" + v178 + "\"");
        }
        if (!v172[v178]) {
          continue;
        }
        v177[v178] = v173.shape[v178];
      }
      assignProp(this, "shape", v177);
      return v177;
    },
    checks: []
  });
  return clone(v171, v176);
}
function omit(v179, v180) {
  const v181 = v179._zod.def;
  const v182 = v181.checks;
  const v183 = v182 && v182.length > 0;
  if (v183) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const v184 = mergeDefs(v179._zod.def, {
    get shape() {
      const v185 = {
        ...v179._zod.def.shape
      };
      for (const v186 in v180) {
        if (!(v186 in v181.shape)) {
          throw new Error("Unrecognized key: \"" + v186 + "\"");
        }
        if (!v180[v186]) {
          continue;
        }
        delete v185[v186];
      }
      assignProp(this, "shape", v185);
      return v185;
    },
    checks: []
  });
  return clone(v179, v184);
}
function extend(v187, v188) {
  if (!isPlainObject$1(v188)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const v189 = v187._zod.def.checks;
  const v190 = v189 && v189.length > 0;
  if (v190) {
    const v191 = v187._zod.def.shape;
    for (const v192 in v188) {
      if (Object.getOwnPropertyDescriptor(v191, v192) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const v193 = mergeDefs(v187._zod.def, {
    get shape() {
      const v194 = {
        ...v187._zod.def.shape,
        ...v188
      };
      assignProp(this, "shape", v194);
      return v194;
    }
  });
  return clone(v187, v193);
}
function safeExtend(v195, v196) {
  if (!isPlainObject$1(v196)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const v197 = mergeDefs(v195._zod.def, {
    get shape() {
      const v198 = {
        ...v195._zod.def.shape,
        ...v196
      };
      assignProp(this, "shape", v198);
      return v198;
    }
  });
  return clone(v195, v197);
}
function merge(v199, v200) {
  if (v199._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const v201 = mergeDefs(v199._zod.def, {
    get shape() {
      const v202 = {
        ...v199._zod.def.shape,
        ...v200._zod.def.shape
      };
      assignProp(this, "shape", v202);
      return v202;
    },
    get catchall() {
      return v200._zod.def.catchall;
    },
    checks: v200._zod.def.checks ?? []
  });
  return clone(v199, v201);
}
function partial(v203, v204, v205) {
  const v206 = v204._zod.def;
  const v207 = v206.checks;
  const v208 = v207 && v207.length > 0;
  if (v208) {
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  }
  const v209 = mergeDefs(v204._zod.def, {
    get shape() {
      const v210 = v204._zod.def.shape;
      const v211 = {
        ...v210
      };
      if (v205) {
        for (const v212 in v205) {
          if (!(v212 in v210)) {
            throw new Error("Unrecognized key: \"" + v212 + "\"");
          }
          if (!v205[v212]) {
            continue;
          }
          v211[v212] = v203 ? new v203({
            type: "optional",
            innerType: v210[v212]
          }) : v210[v212];
        }
      } else {
        for (const v213 in v210) {
          v211[v213] = v203 ? new v203({
            type: "optional",
            innerType: v210[v213]
          }) : v210[v213];
        }
      }
      assignProp(this, "shape", v211);
      return v211;
    },
    checks: []
  });
  return clone(v204, v209);
}
function required$2(v214, v215, v216) {
  const v217 = mergeDefs(v215._zod.def, {
    get shape() {
      const v218 = v215._zod.def.shape;
      const v219 = {
        ...v218
      };
      if (v216) {
        for (const v220 in v216) {
          if (!(v220 in v219)) {
            throw new Error("Unrecognized key: \"" + v220 + "\"");
          }
          if (!v216[v220]) {
            continue;
          }
          v219[v220] = new v214({
            type: "nonoptional",
            innerType: v218[v220]
          });
        }
      } else {
        for (const v221 in v218) {
          v219[v221] = new v214({
            type: "nonoptional",
            innerType: v218[v221]
          });
        }
      }
      assignProp(this, "shape", v219);
      return v219;
    }
  });
  return clone(v215, v217);
}
function aborted(v222, v223 = 0) {
  if (v222.aborted === true) {
    return true;
  }
  for (let v224 = v223; v224 < v222.issues.length; v224++) {
    if (v222.issues[v224]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(v225, v226 = 0) {
  if (v225.aborted === true) {
    return true;
  }
  for (let v227 = v226; v227 < v225.issues.length; v227++) {
    if (v225.issues[v227]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(v228, v229) {
  return v229.map(v230 => {
    v230.path ??= [];
    v230.path.unshift(v228);
    return v230;
  });
}
function unwrapMessage(v231) {
  if (typeof v231 === "string") {
    return v231;
  } else {
    return v231?.message;
  }
}
function finalizeIssue(v232, v233, v234) {
  const v235 = v232.message ? v232.message : unwrapMessage(v232.inst?._zod.def?.error?.(v232)) ?? unwrapMessage(v233?.error?.(v232)) ?? unwrapMessage(v234.customError?.(v232)) ?? unwrapMessage(v234.localeError?.(v232)) ?? "Invalid input";
  const {
    inst: v236,
    continue: v237,
    input: v238,
    ...v239
  } = v232;
  v239.path ??= [];
  v239.message = v235;
  if (v233?.reportInput) {
    v239.input = v238;
  }
  return v239;
}
function getLengthableOrigin(v240) {
  if (Array.isArray(v240)) {
    return "array";
  }
  if (typeof v240 === "string") {
    return "string";
  }
  return "unknown";
}
function issue(...v241) {
  const [v242, v243, v244] = v241;
  if (typeof v242 === "string") {
    return {
      message: v242,
      code: "custom",
      input: v243,
      inst: v244
    };
  }
  return {
    ...v242
  };
}
const initializer$1 = (v245, v246) => {
  v245.name = "$ZodError";
  Object.defineProperty(v245, "_zod", {
    value: v245._zod,
    enumerable: false
  });
  Object.defineProperty(v245, "issues", {
    value: v246,
    enumerable: false
  });
  v245.message = JSON.stringify(v246, jsonStringifyReplacer, 2);
  Object.defineProperty(v245, "toString", {
    value: () => v245.message,
    enumerable: false
  });
};
const $ZodError = $constructor("$ZodError", initializer$1);
const $ZodRealError = $constructor("$ZodError", initializer$1, {
  Parent: Error
});
function flattenError$1(v247, v248 = v249 => v249.message) {
  const v250 = {};
  const v251 = [];
  for (const v252 of v247.issues) {
    if (v252.path.length > 0) {
      v250[v252.path[0]] = v250[v252.path[0]] || [];
      v250[v252.path[0]].push(v248(v252));
    } else {
      v251.push(v248(v252));
    }
  }
  return {
    formErrors: v251,
    fieldErrors: v250
  };
}
function formatError(v253, v254 = v255 => v255.message) {
  const v256 = {
    _errors: []
  };
  const v257 = (v258, v259 = []) => {
    for (const v260 of v258.issues) {
      if (v260.code === "invalid_union" && v260.errors.length) {
        v260.errors.map(v261 => v257({
          issues: v261
        }, [...v259, ...v260.path]));
      } else if (v260.code === "invalid_key") {
        v257({
          issues: v260.issues
        }, [...v259, ...v260.path]);
      } else if (v260.code === "invalid_element") {
        v257({
          issues: v260.issues
        }, [...v259, ...v260.path]);
      } else {
        const v262 = [...v259, ...v260.path];
        if (v262.length === 0) {
          v256._errors.push(v254(v260));
        } else {
          let v263 = v256;
          let v264 = 0;
          while (v264 < v262.length) {
            const v265 = v262[v264];
            const v266 = v264 === v262.length - 1;
            if (!v266) {
              v263[v265] = v263[v265] || {
                _errors: []
              };
            } else {
              v263[v265] = v263[v265] || {
                _errors: []
              };
              v263[v265]._errors.push(v254(v260));
            }
            v263 = v263[v265];
            v264++;
          }
        }
      }
    }
  };
  v257(v253);
  return v256;
}
const _parse = v267 => (v268, v269, v270, v271) => {
  const v272 = v270 ? {
    ...v270,
    async: false
  } : {
    async: false
  };
  const v273 = v268._zod.run({
    value: v269,
    issues: []
  }, v272);
  if (v273 instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (v273.issues.length) {
    const v274 = new (v271?.Err ?? v267)(v273.issues.map(v275 => finalizeIssue(v275, v272, config())));
    captureStackTrace(v274, v271?.callee);
    throw v274;
  }
  return v273.value;
};
const _parseAsync = v276 => async (v277, v278, v279, v280) => {
  const v281 = v279 ? {
    ...v279,
    async: true
  } : {
    async: true
  };
  let v282 = v277._zod.run({
    value: v278,
    issues: []
  }, v281);
  if (v282 instanceof Promise) {
    v282 = await v282;
  }
  if (v282.issues.length) {
    const v283 = new (v280?.Err ?? v276)(v282.issues.map(v284 => finalizeIssue(v284, v281, config())));
    captureStackTrace(v283, v280?.callee);
    throw v283;
  }
  return v282.value;
};
const _safeParse = v285 => (v286, v287, v288) => {
  const v289 = v288 ? {
    ...v288,
    async: false
  } : {
    async: false
  };
  const v290 = v286._zod.run({
    value: v287,
    issues: []
  }, v289);
  if (v290 instanceof Promise) {
    throw new $ZodAsyncError();
  }
  if (v290.issues.length) {
    return {
      success: false,
      error: new (v285 ?? $ZodError)(v290.issues.map(v291 => finalizeIssue(v291, v289, config())))
    };
  } else {
    return {
      success: true,
      data: v290.value
    };
  }
};
const safeParse$2 = _safeParse($ZodRealError);
const _safeParseAsync = v292 => async (v293, v294, v295) => {
  const v296 = v295 ? {
    ...v295,
    async: true
  } : {
    async: true
  };
  let v297 = v293._zod.run({
    value: v294,
    issues: []
  }, v296);
  if (v297 instanceof Promise) {
    v297 = await v297;
  }
  if (v297.issues.length) {
    return {
      success: false,
      error: new v292(v297.issues.map(v298 => finalizeIssue(v298, v296, config())))
    };
  } else {
    return {
      success: true,
      data: v297.value
    };
  }
};
const safeParseAsync$1 = _safeParseAsync($ZodRealError);
const _encode = v299 => (v300, v301, v302) => {
  const v303 = v302 ? {
    ...v302,
    direction: "backward"
  } : {
    direction: "backward"
  };
  return _parse(v299)(v300, v301, v303);
};
const _decode = v304 => (v305, v306, v307) => {
  return _parse(v304)(v305, v306, v307);
};
const _encodeAsync = v308 => async (v309, v310, v311) => {
  const v312 = v311 ? {
    ...v311,
    direction: "backward"
  } : {
    direction: "backward"
  };
  return _parseAsync(v308)(v309, v310, v312);
};
const _decodeAsync = v313 => async (v314, v315, v316) => {
  return _parseAsync(v313)(v314, v315, v316);
};
const _safeEncode = v317 => (v318, v319, v320) => {
  const v321 = v320 ? {
    ...v320,
    direction: "backward"
  } : {
    direction: "backward"
  };
  return _safeParse(v317)(v318, v319, v321);
};
const _safeDecode = v322 => (v323, v324, v325) => {
  return _safeParse(v322)(v323, v324, v325);
};
const _safeEncodeAsync = v326 => async (v327, v328, v329) => {
  const v330 = v329 ? {
    ...v329,
    direction: "backward"
  } : {
    direction: "backward"
  };
  return _safeParseAsync(v326)(v327, v328, v330);
};
const _safeDecodeAsync = v331 => async (v332, v333, v334) => {
  return _safeParseAsync(v331)(v332, v333, v334);
};
const cuid = /^[cC][0-9a-z]{6,}$/;
const cuid2 = /^[0-9a-z]+$/;
const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
const xid = /^[0-9a-vA-V]{20}$/;
const ksuid = /^[A-Za-z0-9]{27}$/;
const nanoid = /^[a-zA-Z0-9_-]{21}$/;
const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
const uuid = v335 => {
  if (!v335) {
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  }
  return new RegExp("^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-" + v335 + "[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$");
};
const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
const _emoji$1 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function emoji() {
  return new RegExp(_emoji$1, "u");
}
const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
const base64url = /^[A-Za-z0-9_-]*$/;
const httpProtocol = /^https?$/;
const e164 = /^\+[1-9]\d{6,14}$/;
const dateSource = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
const date$1 = new RegExp("^" + dateSource + "$");
function timeSource(v336) {
  const v337 = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  const v338 = typeof v336.precision === "number" ? v336.precision === -1 ? "" + v337 : v336.precision === 0 ? v337 + ":[0-5]\\d" : v337 + ":[0-5]\\d\\.\\d{" + v336.precision + "}" : v337 + "(?::[0-5]\\d(?:\\.\\d+)?)?";
  return v338;
}
function time$1(v339) {
  return new RegExp("^" + timeSource(v339) + "$");
}
function datetime$1(v340) {
  const v341 = timeSource({
    precision: v340.precision
  });
  const v342 = ["Z"];
  if (v340.local) {
    v342.push("");
  }
  if (v340.offset) {
    v342.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  }
  const v343 = v341 + "(?:" + v342.join("|") + ")";
  return new RegExp("^" + dateSource + "T(?:" + v343 + ")$");
}
const string$1 = v344 => {
  const v345 = v344 ? "[\\s\\S]{" + (v344?.minimum ?? 0) + "," + (v344?.maximum ?? "") + "}" : "[\\s\\S]*";
  return new RegExp("^" + v345 + "$");
};
const integer = /^-?\d+$/;
const number$2 = /^-?\d+(?:\.\d+)?$/;
const boolean$1 = /^(?:true|false)$/i;
const _null$2 = /^null$/i;
const lowercase = /^[^A-Z]*$/;
const uppercase = /^[^a-z]*$/;
const $ZodCheck = $constructor("$ZodCheck", (v346, v347) => {
  var v348;
  v346._zod ??= {};
  v346._zod.def = v347;
  (v348 = v346._zod).onattach ?? (v348.onattach = []);
});
const numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
const $ZodCheckLessThan = $constructor("$ZodCheckLessThan", (v349, v350) => {
  $ZodCheck.init(v349, v350);
  const v351 = numericOriginMap[typeof v350.value];
  v349._zod.onattach.push(v352 => {
    const v353 = v352._zod.bag;
    const v354 = (v350.inclusive ? v353.maximum : v353.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (v350.value < v354) {
      if (v350.inclusive) {
        v353.maximum = v350.value;
      } else {
        v353.exclusiveMaximum = v350.value;
      }
    }
  });
  v349._zod.check = v355 => {
    if (v350.inclusive ? v355.value <= v350.value : v355.value < v350.value) {
      return;
    }
    v355.issues.push({
      origin: v351,
      code: "too_big",
      maximum: typeof v350.value === "object" ? v350.value.getTime() : v350.value,
      input: v355.value,
      inclusive: v350.inclusive,
      inst: v349,
      continue: !v350.abort
    });
  };
});
const $ZodCheckGreaterThan = $constructor("$ZodCheckGreaterThan", (v356, v357) => {
  $ZodCheck.init(v356, v357);
  const v358 = numericOriginMap[typeof v357.value];
  v356._zod.onattach.push(v359 => {
    const v360 = v359._zod.bag;
    const v361 = (v357.inclusive ? v360.minimum : v360.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (v357.value > v361) {
      if (v357.inclusive) {
        v360.minimum = v357.value;
      } else {
        v360.exclusiveMinimum = v357.value;
      }
    }
  });
  v356._zod.check = v362 => {
    if (v357.inclusive ? v362.value >= v357.value : v362.value > v357.value) {
      return;
    }
    v362.issues.push({
      origin: v358,
      code: "too_small",
      minimum: typeof v357.value === "object" ? v357.value.getTime() : v357.value,
      input: v362.value,
      inclusive: v357.inclusive,
      inst: v356,
      continue: !v357.abort
    });
  };
});
const $ZodCheckMultipleOf = $constructor("$ZodCheckMultipleOf", (v363, v364) => {
  $ZodCheck.init(v363, v364);
  v363._zod.onattach.push(v365 => {
    var v366;
    (v366 = v365._zod.bag).multipleOf ?? (v366.multipleOf = v364.value);
  });
  v363._zod.check = v367 => {
    if (typeof v367.value !== typeof v364.value) {
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    }
    const v368 = typeof v367.value === "bigint" ? v367.value % v364.value === BigInt(0) : floatSafeRemainder(v367.value, v364.value) === 0;
    if (v368) {
      return;
    }
    v367.issues.push({
      origin: typeof v367.value,
      code: "not_multiple_of",
      divisor: v364.value,
      input: v367.value,
      inst: v363,
      continue: !v364.abort
    });
  };
});
const $ZodCheckNumberFormat = $constructor("$ZodCheckNumberFormat", (v369, v370) => {
  $ZodCheck.init(v369, v370);
  v370.format = v370.format || "float64";
  const v371 = v370.format?.includes("int");
  const v372 = v371 ? "int" : "number";
  const [v373, v374] = NUMBER_FORMAT_RANGES[v370.format];
  v369._zod.onattach.push(v375 => {
    const v376 = v375._zod.bag;
    v376.format = v370.format;
    v376.minimum = v373;
    v376.maximum = v374;
    if (v371) {
      v376.pattern = integer;
    }
  });
  v369._zod.check = v377 => {
    const v378 = v377.value;
    if (v371) {
      if (!Number.isInteger(v378)) {
        v377.issues.push({
          expected: v372,
          format: v370.format,
          code: "invalid_type",
          continue: false,
          input: v378,
          inst: v369
        });
        return;
      }
      if (!Number.isSafeInteger(v378)) {
        if (v378 > 0) {
          v377.issues.push({
            input: v378,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst: v369,
            origin: v372,
            inclusive: true,
            continue: !v370.abort
          });
        } else {
          v377.issues.push({
            input: v378,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst: v369,
            origin: v372,
            inclusive: true,
            continue: !v370.abort
          });
        }
        return;
      }
    }
    if (v378 < v373) {
      v377.issues.push({
        origin: "number",
        input: v378,
        code: "too_small",
        minimum: v373,
        inclusive: true,
        inst: v369,
        continue: !v370.abort
      });
    }
    if (v378 > v374) {
      v377.issues.push({
        origin: "number",
        input: v378,
        code: "too_big",
        maximum: v374,
        inclusive: true,
        inst: v369,
        continue: !v370.abort
      });
    }
  };
});
const $ZodCheckMaxLength = $constructor("$ZodCheckMaxLength", (v379, v380) => {
  var v381;
  $ZodCheck.init(v379, v380);
  (v381 = v379._zod.def).when ?? (v381.when = v382 => {
    const v383 = v382.value;
    return !nullish(v383) && v383.length !== undefined;
  });
  v379._zod.onattach.push(v384 => {
    const v385 = v384._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (v380.maximum < v385) {
      v384._zod.bag.maximum = v380.maximum;
    }
  });
  v379._zod.check = v386 => {
    const v387 = v386.value;
    const v388 = v387.length;
    if (v388 <= v380.maximum) {
      return;
    }
    const v389 = getLengthableOrigin(v387);
    v386.issues.push({
      origin: v389,
      code: "too_big",
      maximum: v380.maximum,
      inclusive: true,
      input: v387,
      inst: v379,
      continue: !v380.abort
    });
  };
});
const $ZodCheckMinLength = $constructor("$ZodCheckMinLength", (v390, v391) => {
  var v392;
  $ZodCheck.init(v390, v391);
  (v392 = v390._zod.def).when ?? (v392.when = v393 => {
    const v394 = v393.value;
    return !nullish(v394) && v394.length !== undefined;
  });
  v390._zod.onattach.push(v395 => {
    const v396 = v395._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (v391.minimum > v396) {
      v395._zod.bag.minimum = v391.minimum;
    }
  });
  v390._zod.check = v397 => {
    const v398 = v397.value;
    const v399 = v398.length;
    if (v399 >= v391.minimum) {
      return;
    }
    const v400 = getLengthableOrigin(v398);
    v397.issues.push({
      origin: v400,
      code: "too_small",
      minimum: v391.minimum,
      inclusive: true,
      input: v398,
      inst: v390,
      continue: !v391.abort
    });
  };
});
const $ZodCheckLengthEquals = $constructor("$ZodCheckLengthEquals", (v401, v402) => {
  var v403;
  $ZodCheck.init(v401, v402);
  (v403 = v401._zod.def).when ?? (v403.when = v404 => {
    const v405 = v404.value;
    return !nullish(v405) && v405.length !== undefined;
  });
  v401._zod.onattach.push(v406 => {
    const v407 = v406._zod.bag;
    v407.minimum = v402.length;
    v407.maximum = v402.length;
    v407.length = v402.length;
  });
  v401._zod.check = v408 => {
    const v409 = v408.value;
    const v410 = v409.length;
    if (v410 === v402.length) {
      return;
    }
    const v411 = getLengthableOrigin(v409);
    const v412 = v410 > v402.length;
    v408.issues.push({
      origin: v411,
      ...(v412 ? {
        code: "too_big",
        maximum: v402.length
      } : {
        code: "too_small",
        minimum: v402.length
      }),
      inclusive: true,
      exact: true,
      input: v408.value,
      inst: v401,
      continue: !v402.abort
    });
  };
});
const $ZodCheckStringFormat = $constructor("$ZodCheckStringFormat", (v413, v414) => {
  var v415;
  var v416;
  $ZodCheck.init(v413, v414);
  v413._zod.onattach.push(v417 => {
    const v418 = v417._zod.bag;
    v418.format = v414.format;
    if (v414.pattern) {
      v418.patterns ??= new Set();
      v418.patterns.add(v414.pattern);
    }
  });
  if (v414.pattern) {
    (v415 = v413._zod).check ?? (v415.check = v419 => {
      v414.pattern.lastIndex = 0;
      if (v414.pattern.test(v419.value)) {
        return;
      }
      v419.issues.push({
        origin: "string",
        code: "invalid_format",
        format: v414.format,
        input: v419.value,
        ...(v414.pattern ? {
          pattern: v414.pattern.toString()
        } : {}),
        inst: v413,
        continue: !v414.abort
      });
    });
  } else {
    (v416 = v413._zod).check ?? (v416.check = () => {});
  }
});
const $ZodCheckRegex = $constructor("$ZodCheckRegex", (v420, v421) => {
  $ZodCheckStringFormat.init(v420, v421);
  v420._zod.check = v422 => {
    v421.pattern.lastIndex = 0;
    if (v421.pattern.test(v422.value)) {
      return;
    }
    v422.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: v422.value,
      pattern: v421.pattern.toString(),
      inst: v420,
      continue: !v421.abort
    });
  };
});
const $ZodCheckLowerCase = $constructor("$ZodCheckLowerCase", (v423, v424) => {
  v424.pattern ??= lowercase;
  $ZodCheckStringFormat.init(v423, v424);
});
const $ZodCheckUpperCase = $constructor("$ZodCheckUpperCase", (v425, v426) => {
  v426.pattern ??= uppercase;
  $ZodCheckStringFormat.init(v425, v426);
});
const $ZodCheckIncludes = $constructor("$ZodCheckIncludes", (v427, v428) => {
  $ZodCheck.init(v427, v428);
  const v429 = escapeRegex(v428.includes);
  const v430 = new RegExp(typeof v428.position === "number" ? "^.{" + v428.position + "}" + v429 : v429);
  v428.pattern = v430;
  v427._zod.onattach.push(v431 => {
    const v432 = v431._zod.bag;
    v432.patterns ??= new Set();
    v432.patterns.add(v430);
  });
  v427._zod.check = v433 => {
    if (v433.value.includes(v428.includes, v428.position)) {
      return;
    }
    v433.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: v428.includes,
      input: v433.value,
      inst: v427,
      continue: !v428.abort
    });
  };
});
const $ZodCheckStartsWith = $constructor("$ZodCheckStartsWith", (v434, v435) => {
  $ZodCheck.init(v434, v435);
  const v436 = new RegExp("^" + escapeRegex(v435.prefix) + ".*");
  v435.pattern ??= v436;
  v434._zod.onattach.push(v437 => {
    const v438 = v437._zod.bag;
    v438.patterns ??= new Set();
    v438.patterns.add(v436);
  });
  v434._zod.check = v439 => {
    if (v439.value.startsWith(v435.prefix)) {
      return;
    }
    v439.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: v435.prefix,
      input: v439.value,
      inst: v434,
      continue: !v435.abort
    });
  };
});
const $ZodCheckEndsWith = $constructor("$ZodCheckEndsWith", (v440, v441) => {
  $ZodCheck.init(v440, v441);
  const v442 = new RegExp(".*" + escapeRegex(v441.suffix) + "$");
  v441.pattern ??= v442;
  v440._zod.onattach.push(v443 => {
    const v444 = v443._zod.bag;
    v444.patterns ??= new Set();
    v444.patterns.add(v442);
  });
  v440._zod.check = v445 => {
    if (v445.value.endsWith(v441.suffix)) {
      return;
    }
    v445.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: v441.suffix,
      input: v445.value,
      inst: v440,
      continue: !v441.abort
    });
  };
});
const $ZodCheckOverwrite = $constructor("$ZodCheckOverwrite", (v446, v447) => {
  $ZodCheck.init(v446, v447);
  v446._zod.check = v448 => {
    v448.value = v447.tx(v448.value);
  };
});
class Doc {
  constructor(v449 = []) {
    this.content = [];
    this.indent = 0;
    if (this) {
      this.args = v449;
    }
  }
  indented(v450) {
    this.indent += 1;
    v450(this);
    this.indent -= 1;
  }
  write(v451) {
    if (typeof v451 === "function") {
      v451(this, {
        execution: "sync"
      });
      v451(this, {
        execution: "async"
      });
      return;
    }
    const v452 = v451;
    const v453 = v452.split("\n").filter(v454 => v454);
    const v455 = Math.min(...v453.map(v456 => v456.length - v456.trimStart().length));
    const v457 = v453.map(v458 => v458.slice(v455)).map(v459 => " ".repeat(this.indent * 2) + v459);
    for (const v460 of v457) {
      this.content.push(v460);
    }
  }
  compile() {
    const v461 = Function;
    const v462 = this?.args;
    const v463 = this?.content ?? [""];
    const v464 = [...v463.map(v465 => "  " + v465)];
    return new v461(...v462, v464.join("\n"));
  }
}
const version = {
  major: 4,
  minor: 4,
  patch: 3
};
const $ZodType = $constructor("$ZodType", (v466, v467) => {
  var v468;
  v466 ??= {};
  v466._zod.def = v467;
  v466._zod.bag = v466._zod.bag || {};
  v466._zod.version = version;
  const v469 = [...(v466._zod.def.checks ?? [])];
  if (v466._zod.traits.has("$ZodCheck")) {
    v469.unshift(v466);
  }
  for (const v470 of v469) {
    for (const v471 of v470._zod.onattach) {
      v471(v466);
    }
  }
  if (v469.length === 0) {
    (v468 = v466._zod).deferred ?? (v468.deferred = []);
    v466._zod.deferred?.push(() => {
      v466._zod.run = v466._zod.parse;
    });
  } else {
    const v472 = (v473, v474, v475) => {
      let v476 = aborted(v473);
      let v477;
      for (const v478 of v474) {
        if (v478._zod.def.when) {
          if (explicitlyAborted(v473)) {
            continue;
          }
          const v479 = v478._zod.def.when(v473);
          if (!v479) {
            continue;
          }
        } else if (v476) {
          continue;
        }
        const v480 = v473.issues.length;
        const v481 = v478._zod.check(v473);
        if (v481 instanceof Promise && v475?.async === false) {
          throw new $ZodAsyncError();
        }
        if (v477 || v481 instanceof Promise) {
          v477 = (v477 ?? Promise.resolve()).then(async () => {
            await v481;
            const v482 = v473.issues.length;
            if (v482 === v480) {
              return;
            }
            if (!v476) {
              v476 = aborted(v473, v480);
            }
          });
        } else {
          const v483 = v473.issues.length;
          if (v483 === v480) {
            continue;
          }
          if (!v476) {
            v476 = aborted(v473, v480);
          }
        }
      }
      if (v477) {
        return v477.then(() => {
          return v473;
        });
      }
      return v473;
    };
    const v484 = (v485, v486, v487) => {
      if (aborted(v485)) {
        v485.aborted = true;
        return v485;
      }
      const v488 = v472(v486, v469, v487);
      if (v488 instanceof Promise) {
        if (v487.async === false) {
          throw new $ZodAsyncError();
        }
        return v488.then(v489 => v466._zod.parse(v489, v487));
      }
      return v466._zod.parse(v488, v487);
    };
    v466._zod.run = (v490, v491) => {
      if (v491.skipChecks) {
        return v466._zod.parse(v490, v491);
      }
      if (v491.direction === "backward") {
        const v492 = v466._zod.parse({
          value: v490.value,
          issues: []
        }, {
          ...v491,
          skipChecks: true
        });
        if (v492 instanceof Promise) {
          return v492.then(v493 => {
            return v484(v493, v490, v491);
          });
        }
        return v484(v492, v490, v491);
      }
      const v494 = v466._zod.parse(v490, v491);
      if (v494 instanceof Promise) {
        if (v491.async === false) {
          throw new $ZodAsyncError();
        }
        return v494.then(v495 => v472(v495, v469, v491));
      }
      return v472(v494, v469, v491);
    };
  }
  defineLazy(v466, "~standard", () => ({
    validate: v496 => {
      try {
        const v497 = safeParse$2(v466, v496);
        if (v497.success) {
          return {
            value: v497.data
          };
        } else {
          return {
            issues: v497.error?.issues
          };
        }
      } catch (v498) {
        return safeParseAsync$1(v466, v496).then(v499 => v499.success ? {
          value: v499.data
        } : {
          issues: v499.error?.issues
        });
      }
    },
    vendor: "zod",
    version: 1
  }));
});
const $ZodString = $constructor("$ZodString", (v500, v501) => {
  $ZodType.init(v500, v501);
  v500._zod.pattern = [...(v500?._zod.bag?.patterns ?? [])].pop() ?? string$1(v500._zod.bag);
  v500._zod.parse = (v502, v503) => {
    if (v501.coerce) {
      try {
        v502.value = String(v502.value);
      } catch (v504) {}
    }
    if (typeof v502.value === "string") {
      return v502;
    }
    v502.issues.push({
      expected: "string",
      code: "invalid_type",
      input: v502.value,
      inst: v500
    });
    return v502;
  };
});
const $ZodStringFormat = $constructor("$ZodStringFormat", (v505, v506) => {
  $ZodCheckStringFormat.init(v505, v506);
  $ZodString.init(v505, v506);
});
const $ZodGUID = $constructor("$ZodGUID", (v507, v508) => {
  v508.pattern ??= guid;
  $ZodStringFormat.init(v507, v508);
});
const $ZodUUID = $constructor("$ZodUUID", (v509, v510) => {
  if (v510.version) {
    const v511 = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v512 = v511[v510.version];
    if (v512 === undefined) {
      throw new Error("Invalid UUID version: \"" + v510.version + "\"");
    }
    v510.pattern ??= uuid(v512);
  } else {
    v510.pattern ??= uuid();
  }
  $ZodStringFormat.init(v509, v510);
});
const $ZodEmail = $constructor("$ZodEmail", (v513, v514) => {
  v514.pattern ??= email;
  $ZodStringFormat.init(v513, v514);
});
const $ZodURL = $constructor("$ZodURL", (v515, v516) => {
  $ZodStringFormat.init(v515, v516);
  v515._zod.check = v517 => {
    try {
      const v518 = v517.value.trim();
      if (!v516.normalize && v516.protocol?.source === httpProtocol.source) {
        if (!/^https?:\/\//i.test(v518)) {
          v517.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid URL format",
            input: v517.value,
            inst: v515,
            continue: !v516.abort
          });
          return;
        }
      }
      const v519 = new URL(v518);
      if (v516.hostname) {
        v516.hostname.lastIndex = 0;
        if (!v516.hostname.test(v519.hostname)) {
          v517.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid hostname",
            pattern: v516.hostname.source,
            input: v517.value,
            inst: v515,
            continue: !v516.abort
          });
        }
      }
      if (v516.protocol) {
        v516.protocol.lastIndex = 0;
        if (!v516.protocol.test(v519.protocol.endsWith(":") ? v519.protocol.slice(0, -1) : v519.protocol)) {
          v517.issues.push({
            code: "invalid_format",
            format: "url",
            note: "Invalid protocol",
            pattern: v516.protocol.source,
            input: v517.value,
            inst: v515,
            continue: !v516.abort
          });
        }
      }
      if (v516.normalize) {
        v517.value = v519.href;
      } else {
        v517.value = v518;
      }
      return;
    } catch (v520) {
      v517.issues.push({
        code: "invalid_format",
        format: "url",
        input: v517.value,
        inst: v515,
        continue: !v516.abort
      });
    }
  };
});
const $ZodEmoji = $constructor("$ZodEmoji", (v521, v522) => {
  v522.pattern ??= emoji();
  $ZodStringFormat.init(v521, v522);
});
const $ZodNanoID = $constructor("$ZodNanoID", (v523, v524) => {
  v524.pattern ??= nanoid;
  $ZodStringFormat.init(v523, v524);
});
const $ZodCUID = $constructor("$ZodCUID", (v525, v526) => {
  v526.pattern ??= cuid;
  $ZodStringFormat.init(v525, v526);
});
const $ZodCUID2 = $constructor("$ZodCUID2", (v527, v528) => {
  v528.pattern ??= cuid2;
  $ZodStringFormat.init(v527, v528);
});
const $ZodULID = $constructor("$ZodULID", (v529, v530) => {
  v530.pattern ??= ulid;
  $ZodStringFormat.init(v529, v530);
});
const $ZodXID = $constructor("$ZodXID", (v531, v532) => {
  v532.pattern ??= xid;
  $ZodStringFormat.init(v531, v532);
});
const $ZodKSUID = $constructor("$ZodKSUID", (v533, v534) => {
  v534.pattern ??= ksuid;
  $ZodStringFormat.init(v533, v534);
});
const $ZodISODateTime = $constructor("$ZodISODateTime", (v535, v536) => {
  v536.pattern ??= datetime$1(v536);
  $ZodStringFormat.init(v535, v536);
});
const $ZodISODate = $constructor("$ZodISODate", (v537, v538) => {
  v538.pattern ??= date$1;
  $ZodStringFormat.init(v537, v538);
});
const $ZodISOTime = $constructor("$ZodISOTime", (v539, v540) => {
  v540.pattern ??= time$1(v540);
  $ZodStringFormat.init(v539, v540);
});
const $ZodISODuration = $constructor("$ZodISODuration", (v541, v542) => {
  v542.pattern ??= duration$1;
  $ZodStringFormat.init(v541, v542);
});
const $ZodIPv4 = $constructor("$ZodIPv4", (v543, v544) => {
  v544.pattern ??= ipv4;
  $ZodStringFormat.init(v543, v544);
  v543._zod.bag.format = "ipv4";
});
const $ZodIPv6 = $constructor("$ZodIPv6", (v545, v546) => {
  v546.pattern ??= ipv6;
  $ZodStringFormat.init(v545, v546);
  v545._zod.bag.format = "ipv6";
  v545._zod.check = v547 => {
    try {
      new URL("http://[" + v547.value + "]");
    } catch {
      v547.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: v547.value,
        inst: v545,
        continue: !v546.abort
      });
    }
  };
});
const $ZodCIDRv4 = $constructor("$ZodCIDRv4", (v548, v549) => {
  v549.pattern ??= cidrv4;
  $ZodStringFormat.init(v548, v549);
});
const $ZodCIDRv6 = $constructor("$ZodCIDRv6", (v550, v551) => {
  v551.pattern ??= cidrv6;
  $ZodStringFormat.init(v550, v551);
  v550._zod.check = v552 => {
    const v553 = v552.value.split("/");
    try {
      if (v553.length !== 2) {
        throw new Error();
      }
      const [v554, v555] = v553;
      if (!v555) {
        throw new Error();
      }
      const v556 = Number(v555);
      if ("" + v556 !== v555) {
        throw new Error();
      }
      if (v556 < 0 || v556 > 128) {
        throw new Error();
      }
      new URL("http://[" + v554 + "]");
    } catch {
      v552.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: v552.value,
        inst: v550,
        continue: !v551.abort
      });
    }
  };
});
function isValidBase64(v557) {
  if (v557 === "") {
    return true;
  }
  if (/\s/.test(v557)) {
    return false;
  }
  if (v557.length % 4 !== 0) {
    return false;
  }
  try {
    atob(v557);
    return true;
  } catch {
    return false;
  }
}
const $ZodBase64 = $constructor("$ZodBase64", (v558, v559) => {
  v559.pattern ??= base64;
  $ZodStringFormat.init(v558, v559);
  v558._zod.bag.contentEncoding = "base64";
  v558._zod.check = v560 => {
    if (isValidBase64(v560.value)) {
      return;
    }
    v560.issues.push({
      code: "invalid_format",
      format: "base64",
      input: v560.value,
      inst: v558,
      continue: !v559.abort
    });
  };
});
function isValidBase64URL(v561) {
  if (!base64url.test(v561)) {
    return false;
  }
  const v562 = v561.replace(/[-_]/g, v563 => v563 === "-" ? "+" : "/");
  const v564 = v562.padEnd(Math.ceil(v562.length / 4) * 4, "=");
  return isValidBase64(v564);
}
const $ZodBase64URL = $constructor("$ZodBase64URL", (v565, v566) => {
  v566.pattern ??= base64url;
  $ZodStringFormat.init(v565, v566);
  v565._zod.bag.contentEncoding = "base64url";
  v565._zod.check = v567 => {
    if (isValidBase64URL(v567.value)) {
      return;
    }
    v567.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: v567.value,
      inst: v565,
      continue: !v566.abort
    });
  };
});
const $ZodE164 = $constructor("$ZodE164", (v568, v569) => {
  v569.pattern ??= e164;
  $ZodStringFormat.init(v568, v569);
});
function isValidJWT(v570, v571 = null) {
  try {
    const v572 = v570.split(".");
    if (v572.length !== 3) {
      return false;
    }
    const [v573] = v572;
    if (!v573) {
      return false;
    }
    const v574 = JSON.parse(atob(v573));
    if ("typ" in v574 && v574?.typ !== "JWT") {
      return false;
    }
    if (!v574.alg) {
      return false;
    }
    if (v571 && (!("alg" in v574) || v574.alg !== v571)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
const $ZodJWT = $constructor("$ZodJWT", (v575, v576) => {
  $ZodStringFormat.init(v575, v576);
  v575._zod.check = v577 => {
    if (isValidJWT(v577.value, v576.alg)) {
      return;
    }
    v577.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: v577.value,
      inst: v575,
      continue: !v576.abort
    });
  };
});
const $ZodNumber = $constructor("$ZodNumber", (v578, v579) => {
  $ZodType.init(v578, v579);
  v578._zod.pattern = v578._zod.bag.pattern ?? number$2;
  v578._zod.parse = (v580, v581) => {
    if (v579.coerce) {
      try {
        v580.value = Number(v580.value);
      } catch (v582) {}
    }
    const v583 = v580.value;
    if (typeof v583 === "number" && !Number.isNaN(v583) && Number.isFinite(v583)) {
      return v580;
    }
    const v584 = typeof v583 === "number" ? Number.isNaN(v583) ? "NaN" : !Number.isFinite(v583) ? "Infinity" : undefined : undefined;
    v580.issues.push({
      expected: "number",
      code: "invalid_type",
      input: v583,
      inst: v578,
      ...(v584 ? {
        received: v584
      } : {})
    });
    return v580;
  };
});
const $ZodNumberFormat = $constructor("$ZodNumberFormat", (v585, v586) => {
  $ZodCheckNumberFormat.init(v585, v586);
  $ZodNumber.init(v585, v586);
});
const $ZodBoolean = $constructor("$ZodBoolean", (v587, v588) => {
  $ZodType.init(v587, v588);
  v587._zod.pattern = boolean$1;
  v587._zod.parse = (v589, v590) => {
    if (v588.coerce) {
      try {
        v589.value = Boolean(v589.value);
      } catch (v591) {}
    }
    const v592 = v589.value;
    if (typeof v592 === "boolean") {
      return v589;
    }
    v589.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: v592,
      inst: v587
    });
    return v589;
  };
});
const $ZodNull = $constructor("$ZodNull", (v593, v594) => {
  $ZodType.init(v593, v594);
  v593._zod.pattern = _null$2;
  v593._zod.values = new Set([null]);
  v593._zod.parse = (v595, v596) => {
    const v597 = v595.value;
    if (v597 === null) {
      return v595;
    }
    v595.issues.push({
      expected: "null",
      code: "invalid_type",
      input: v597,
      inst: v593
    });
    return v595;
  };
});
const $ZodAny = $constructor("$ZodAny", (v598, v599) => {
  $ZodType.init(v598, v599);
  v598._zod.parse = v600 => v600;
});
const $ZodUnknown = $constructor("$ZodUnknown", (v601, v602) => {
  $ZodType.init(v601, v602);
  v601._zod.parse = v603 => v603;
});
const $ZodNever = $constructor("$ZodNever", (v604, v605) => {
  $ZodType.init(v604, v605);
  v604._zod.parse = (v606, v607) => {
    v606.issues.push({
      expected: "never",
      code: "invalid_type",
      input: v606.value,
      inst: v604
    });
    return v606;
  };
});
function handleArrayResult(v608, v609, v610) {
  if (v608.issues.length) {
    v609.issues.push(...prefixIssues(v610, v608.issues));
  }
  v609.value[v610] = v608.value;
}
const $ZodArray = $constructor("$ZodArray", (v611, v612) => {
  $ZodType.init(v611, v612);
  v611._zod.parse = (v613, v614) => {
    const v615 = v613.value;
    if (!Array.isArray(v615)) {
      v613.issues.push({
        expected: "array",
        code: "invalid_type",
        input: v615,
        inst: v611
      });
      return v613;
    }
    v613.value = Array(v615.length);
    const v616 = [];
    for (let v617 = 0; v617 < v615.length; v617++) {
      const v618 = v615[v617];
      const v619 = v612.element._zod.run({
        value: v618,
        issues: []
      }, v614);
      if (v619 instanceof Promise) {
        v616.push(v619.then(v620 => handleArrayResult(v620, v613, v617)));
      } else {
        handleArrayResult(v619, v613, v617);
      }
    }
    if (v616.length) {
      return Promise.all(v616).then(() => v613);
    }
    return v613;
  };
});
function handlePropertyResult(v621, v622, v623, v624, v625, v626) {
  const v627 = v623 in v624;
  if (v621.issues.length) {
    if (v625 && v626 && !v627) {
      return;
    }
    v622.issues.push(...prefixIssues(v623, v621.issues));
  }
  if (!v627 && !v625) {
    if (!v621.issues.length) {
      v622.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: undefined,
        path: [v623]
      });
    }
    return;
  }
  if (v621.value === undefined) {
    if (v627) {
      v622.value[v623] = undefined;
    }
  } else {
    v622.value[v623] = v621.value;
  }
}
function normalizeDef(v628) {
  const v629 = Object.keys(v628.shape);
  for (const v630 of v629) {
    if (!v628.shape?.[v630]?._zod?.traits?.has("$ZodType")) {
      throw new Error("Invalid element at key \"" + v630 + "\": expected a Zod schema");
    }
  }
  const v631 = optionalKeys(v628.shape);
  return {
    ...v628,
    keys: v629,
    keySet: new Set(v629),
    numKeys: v629.length,
    optionalKeys: new Set(v631)
  };
}
function handleCatchall(v632, v633, v634, v635, v636, v637) {
  const v638 = [];
  const v639 = v636.keySet;
  const v640 = v636.catchall._zod;
  const v641 = v640.def.type;
  const v642 = v640.optin === "optional";
  const v643 = v640.optout === "optional";
  for (const v644 in v633) {
    if (v644 === "__proto__") {
      continue;
    }
    if (v639.has(v644)) {
      continue;
    }
    if (v641 === "never") {
      v638.push(v644);
      continue;
    }
    const v645 = v640.run({
      value: v633[v644],
      issues: []
    }, v635);
    if (v645 instanceof Promise) {
      v632.push(v645.then(v646 => handlePropertyResult(v646, v634, v644, v633, v642, v643)));
    } else {
      handlePropertyResult(v645, v634, v644, v633, v642, v643);
    }
  }
  if (v638.length) {
    v634.issues.push({
      code: "unrecognized_keys",
      keys: v638,
      input: v633,
      inst: v637
    });
  }
  if (!v632.length) {
    return v634;
  }
  return Promise.all(v632).then(() => {
    return v634;
  });
}
const $ZodObject = $constructor("$ZodObject", (v647, v648) => {
  $ZodType.init(v647, v648);
  const v649 = Object.getOwnPropertyDescriptor(v648, "shape");
  if (!v649?.get) {
    const v650 = v648.shape;
    Object.defineProperty(v648, "shape", {
      get: () => {
        const v651 = {
          ...v650
        };
        Object.defineProperty(v648, "shape", {
          value: v651
        });
        return v651;
      }
    });
  }
  const v652 = cached(() => normalizeDef(v648));
  defineLazy(v647._zod, "propValues", () => {
    const v653 = v648.shape;
    const v654 = {};
    for (const v655 in v653) {
      const v656 = v653[v655]._zod;
      if (v656.values) {
        v654[v655] ??= new Set();
        for (const v657 of v656.values) {
          v654[v655].add(v657);
        }
      }
    }
    return v654;
  });
  const v658 = isObject;
  const v659 = v648.catchall;
  let v660;
  v647._zod.parse = (v661, v662) => {
    v660 ??= v652.value;
    const v663 = v661.value;
    if (!v658(v663)) {
      v661.issues.push({
        expected: "object",
        code: "invalid_type",
        input: v663,
        inst: v647
      });
      return v661;
    }
    v661.value = {};
    const v664 = [];
    const v665 = v660.shape;
    for (const v666 of v660.keys) {
      const v667 = v665[v666];
      const v668 = v667._zod.optin === "optional";
      const v669 = v667._zod.optout === "optional";
      const v670 = v667._zod.run({
        value: v663[v666],
        issues: []
      }, v662);
      if (v670 instanceof Promise) {
        v664.push(v670.then(v671 => handlePropertyResult(v671, v661, v666, v663, v668, v669)));
      } else {
        handlePropertyResult(v670, v661, v666, v663, v668, v669);
      }
    }
    if (!v659) {
      if (v664.length) {
        return Promise.all(v664).then(() => v661);
      } else {
        return v661;
      }
    }
    return handleCatchall(v664, v663, v661, v662, v652.value, v647);
  };
});
const $ZodObjectJIT = $constructor("$ZodObjectJIT", (v672, v673) => {
  $ZodObject.init(v672, v673);
  const v674 = v672._zod.parse;
  const v675 = cached(() => normalizeDef(v673));
  const v676 = v677 => {
    const v678 = new Doc(["shape", "payload", "ctx"]);
    const v679 = v675.value;
    const v680 = v681 => {
      const v682 = esc(v681);
      return "shape[" + v682 + "]._zod.run({ value: input[" + v682 + "], issues: [] }, ctx)";
    };
    v678.write("const input = payload.value;");
    const v683 = Object.create(null);
    let v684 = 0;
    for (const v685 of v679.keys) {
      v683[v685] = "key_" + v684++;
    }
    v678.write("const newResult = {};");
    for (const v686 of v679.keys) {
      const v687 = v683[v686];
      const v688 = esc(v686);
      const v689 = v677[v686];
      const v690 = v689?._zod?.optin === "optional";
      const v691 = v689?._zod?.optout === "optional";
      v678.write("const " + v687 + " = " + v680(v686) + ";");
      if (v690 && v691) {
        v678.write("\n        if (" + v687 + ".issues.length) {\n          if (" + v688 + " in input) {\n            payload.issues = payload.issues.concat(" + v687 + ".issues.map(iss => ({\n              ...iss,\n              path: iss.path ? [" + v688 + ", ...iss.path] : [" + v688 + "]\n            })));\n          }\n        }\n        \n        if (" + v687 + ".value === undefined) {\n          if (" + v688 + " in input) {\n            newResult[" + v688 + "] = undefined;\n          }\n        } else {\n          newResult[" + v688 + "] = " + v687 + ".value;\n        }\n        \n      ");
      } else if (!v690) {
        v678.write("\n        const " + v687 + "_present = " + v688 + " in input;\n        if (" + v687 + ".issues.length) {\n          payload.issues = payload.issues.concat(" + v687 + ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [" + v688 + ", ...iss.path] : [" + v688 + "]\n          })));\n        }\n        if (!" + v687 + "_present && !" + v687 + ".issues.length) {\n          payload.issues.push({\n            code: \"invalid_type\",\n            expected: \"nonoptional\",\n            input: undefined,\n            path: [" + v688 + "]\n          });\n        }\n\n        if (" + v687 + "_present) {\n          if (" + v687 + ".value === undefined) {\n            newResult[" + v688 + "] = undefined;\n          } else {\n            newResult[" + v688 + "] = " + v687 + ".value;\n          }\n        }\n\n      ");
      } else {
        v678.write("\n        if (" + v687 + ".issues.length) {\n          payload.issues = payload.issues.concat(" + v687 + ".issues.map(iss => ({\n            ...iss,\n            path: iss.path ? [" + v688 + ", ...iss.path] : [" + v688 + "]\n          })));\n        }\n        \n        if (" + v687 + ".value === undefined) {\n          if (" + v688 + " in input) {\n            newResult[" + v688 + "] = undefined;\n          }\n        } else {\n          newResult[" + v688 + "] = " + v687 + ".value;\n        }\n        \n      ");
      }
    }
    v678.write("payload.value = newResult;");
    v678.write("return payload;");
    const v692 = v678.compile();
    return (v693, v694) => v692(v677, v693, v694);
  };
  let v695;
  const v696 = isObject;
  const v697 = !globalConfig.jitless;
  const v698 = allowsEval;
  const v699 = v697 && v698.value;
  const v700 = v673.catchall;
  let v701;
  v672._zod.parse = (v702, v703) => {
    v701 ??= v675.value;
    const v704 = v702.value;
    if (!v696(v704)) {
      v702.issues.push({
        expected: "object",
        code: "invalid_type",
        input: v704,
        inst: v672
      });
      return v702;
    }
    if (v697 && v699 && v703?.async === false && v703.jitless !== true) {
      if (!v695) {
        v695 = v676(v673.shape);
      }
      v702 = v695(v702, v703);
      if (!v700) {
        return v702;
      }
      return handleCatchall([], v704, v702, v703, v701, v672);
    }
    return v674(v702, v703);
  };
});
function handleUnionResults(v705, v706, v707, v708) {
  for (const v709 of v705) {
    if (v709.issues.length === 0) {
      v706.value = v709.value;
      return v706;
    }
  }
  const v710 = v705.filter(v711 => !aborted(v711));
  if (v710.length === 1) {
    v706.value = v710[0].value;
    return v710[0];
  }
  v706.issues.push({
    code: "invalid_union",
    input: v706.value,
    inst: v707,
    errors: v705.map(v712 => v712.issues.map(v713 => finalizeIssue(v713, v708, config())))
  });
  return v706;
}
const $ZodUnion = $constructor("$ZodUnion", (v714, v715) => {
  $ZodType.init(v714, v715);
  defineLazy(v714._zod, "optin", () => v715.options.some(v716 => v716._zod.optin === "optional") ? "optional" : undefined);
  defineLazy(v714._zod, "optout", () => v715.options.some(v717 => v717._zod.optout === "optional") ? "optional" : undefined);
  defineLazy(v714._zod, "values", () => {
    if (v715.options.every(v718 => v718._zod.values)) {
      return new Set(v715.options.flatMap(v719 => Array.from(v719._zod.values)));
    }
    return undefined;
  });
  defineLazy(v714._zod, "pattern", () => {
    if (v715.options.every(v720 => v720._zod.pattern)) {
      const v721 = v715.options.map(v722 => v722._zod.pattern);
      return new RegExp("^(" + v721.map(v723 => cleanRegex(v723.source)).join("|") + ")$");
    }
    return undefined;
  });
  const v724 = v715.options.length === 1 ? v715.options[0]._zod.run : null;
  v714._zod.parse = (v725, v726) => {
    if (v724) {
      return v724(v725, v726);
    }
    let v727 = false;
    const v728 = [];
    for (const v729 of v715.options) {
      const v730 = v729._zod.run({
        value: v725.value,
        issues: []
      }, v726);
      if (v730 instanceof Promise) {
        v728.push(v730);
        v727 = true;
      } else {
        if (v730.issues.length === 0) {
          return v730;
        }
        v728.push(v730);
      }
    }
    if (!v727) {
      return handleUnionResults(v728, v725, v714, v726);
    }
    return Promise.all(v728).then(v731 => {
      return handleUnionResults(v731, v725, v714, v726);
    });
  };
});
const $ZodDiscriminatedUnion = $constructor("$ZodDiscriminatedUnion", (v732, v733) => {
  v733.inclusive = false;
  $ZodUnion.init(v732, v733);
  const v734 = v732._zod.parse;
  defineLazy(v732._zod, "propValues", () => {
    const v735 = {};
    for (const v736 of v733.options) {
      const v737 = v736._zod.propValues;
      if (!v737 || Object.keys(v737).length === 0) {
        throw new Error("Invalid discriminated union option at index \"" + v733.options.indexOf(v736) + "\"");
      }
      for (const [v738, v739] of Object.entries(v737)) {
        if (!v735[v738]) {
          v735[v738] = new Set();
        }
        for (const v740 of v739) {
          v735[v738].add(v740);
        }
      }
    }
    return v735;
  });
  const v741 = cached(() => {
    const v742 = v733.options;
    const v743 = new Map();
    for (const v744 of v742) {
      const v745 = v744._zod.propValues?.[v733.discriminator];
      if (!v745 || v745.size === 0) {
        throw new Error("Invalid discriminated union option at index \"" + v733.options.indexOf(v744) + "\"");
      }
      for (const v746 of v745) {
        if (v743.has(v746)) {
          throw new Error("Duplicate discriminator value \"" + String(v746) + "\"");
        }
        v743.set(v746, v744);
      }
    }
    return v743;
  });
  v732._zod.parse = (v747, v748) => {
    const v749 = v747.value;
    if (!isObject(v749)) {
      v747.issues.push({
        code: "invalid_type",
        expected: "object",
        input: v749,
        inst: v732
      });
      return v747;
    }
    const v750 = v741.value.get(v749?.[v733.discriminator]);
    if (v750) {
      return v750._zod.run(v747, v748);
    }
    if (v733.unionFallback || v748.direction === "backward") {
      return v734(v747, v748);
    }
    v747.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: v733.discriminator,
      options: Array.from(v741.value.keys()),
      input: v749,
      path: [v733.discriminator],
      inst: v732
    });
    return v747;
  };
});
const $ZodIntersection = $constructor("$ZodIntersection", (v751, v752) => {
  $ZodType.init(v751, v752);
  v751._zod.parse = (v753, v754) => {
    const v755 = v753.value;
    const v756 = v752.left._zod.run({
      value: v755,
      issues: []
    }, v754);
    const v757 = v752.right._zod.run({
      value: v755,
      issues: []
    }, v754);
    const v758 = v756 instanceof Promise || v757 instanceof Promise;
    if (v758) {
      return Promise.all([v756, v757]).then(([v759, v760]) => {
        return handleIntersectionResults(v753, v759, v760);
      });
    }
    return handleIntersectionResults(v753, v756, v757);
  };
});
function mergeValues(v761, v762) {
  if (v761 === v762) {
    return {
      valid: true,
      data: v761
    };
  }
  if (v761 instanceof Date && v762 instanceof Date && +v761 === +v762) {
    return {
      valid: true,
      data: v761
    };
  }
  if (isPlainObject$1(v761) && isPlainObject$1(v762)) {
    const v763 = Object.keys(v762);
    const v764 = Object.keys(v761).filter(v765 => v763.indexOf(v765) !== -1);
    const v766 = {
      ...v761,
      ...v762
    };
    for (const v767 of v764) {
      const v768 = mergeValues(v761[v767], v762[v767]);
      if (!v768.valid) {
        return {
          valid: false,
          mergeErrorPath: [v767, ...v768.mergeErrorPath]
        };
      }
      v766[v767] = v768.data;
    }
    return {
      valid: true,
      data: v766
    };
  }
  if (Array.isArray(v761) && Array.isArray(v762)) {
    if (v761.length !== v762.length) {
      return {
        valid: false,
        mergeErrorPath: []
      };
    }
    const v769 = [];
    for (let v770 = 0; v770 < v761.length; v770++) {
      const v771 = v761[v770];
      const v772 = v762[v770];
      const v773 = mergeValues(v771, v772);
      if (!v773.valid) {
        return {
          valid: false,
          mergeErrorPath: [v770, ...v773.mergeErrorPath]
        };
      }
      v769.push(v773.data);
    }
    return {
      valid: true,
      data: v769
    };
  }
  return {
    valid: false,
    mergeErrorPath: []
  };
}
function handleIntersectionResults(v774, v775, v776) {
  const v777 = new Map();
  let v778;
  for (const v779 of v775.issues) {
    if (v779.code === "unrecognized_keys") {
      v778 ??= v779;
      for (const v780 of v779.keys) {
        if (!v777.has(v780)) {
          v777.set(v780, {});
        }
        v777.get(v780).l = true;
      }
    } else {
      v774.issues.push(v779);
    }
  }
  for (const v781 of v776.issues) {
    if (v781.code === "unrecognized_keys") {
      for (const v782 of v781.keys) {
        if (!v777.has(v782)) {
          v777.set(v782, {});
        }
        v777.get(v782).r = true;
      }
    } else {
      v774.issues.push(v781);
    }
  }
  const v783 = [...v777].filter(([, v784]) => v784.l && v784.r).map(([v785]) => v785);
  if (v783.length && v778) {
    v774.issues.push({
      ...v778,
      keys: v783
    });
  }
  if (aborted(v774)) {
    return v774;
  }
  const v786 = mergeValues(v775.value, v776.value);
  if (!v786.valid) {
    throw new Error("Unmergable intersection. Error path: " + JSON.stringify(v786.mergeErrorPath));
  }
  v774.value = v786.data;
  return v774;
}
const $ZodRecord = $constructor("$ZodRecord", (v787, v788) => {
  $ZodType.init(v787, v788);
  v787._zod.parse = (v789, v790) => {
    const v791 = v789.value;
    if (!isPlainObject$1(v791)) {
      v789.issues.push({
        expected: "record",
        code: "invalid_type",
        input: v791,
        inst: v787
      });
      return v789;
    }
    const v792 = [];
    const v793 = v788.keyType._zod.values;
    if (v793) {
      v789.value = {};
      const v794 = new Set();
      for (const v795 of v793) {
        if (typeof v795 === "string" || typeof v795 === "number" || typeof v795 === "symbol") {
          v794.add(typeof v795 === "number" ? v795.toString() : v795);
          const v796 = v788.keyType._zod.run({
            value: v795,
            issues: []
          }, v790);
          if (v796 instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (v796.issues.length) {
            v789.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: v796.issues.map(v797 => finalizeIssue(v797, v790, config())),
              input: v795,
              path: [v795],
              inst: v787
            });
            continue;
          }
          const v798 = v796.value;
          const v799 = v788.valueType._zod.run({
            value: v791[v795],
            issues: []
          }, v790);
          if (v799 instanceof Promise) {
            v792.push(v799.then(v800 => {
              if (v800.issues.length) {
                v789.issues.push(...prefixIssues(v795, v800.issues));
              }
              v789.value[v798] = v800.value;
            }));
          } else {
            if (v799.issues.length) {
              v789.issues.push(...prefixIssues(v795, v799.issues));
            }
            v789.value[v798] = v799.value;
          }
        }
      }
      let v801;
      for (const v802 in v791) {
        if (!v794.has(v802)) {
          v801 = v801 ?? [];
          v801.push(v802);
        }
      }
      if (v801 && v801.length > 0) {
        v789.issues.push({
          code: "unrecognized_keys",
          input: v791,
          inst: v787,
          keys: v801
        });
      }
    } else {
      v789.value = {};
      for (const v803 of Reflect.ownKeys(v791)) {
        if (v803 === "__proto__") {
          continue;
        }
        if (!Object.prototype.propertyIsEnumerable.call(v791, v803)) {
          continue;
        }
        let v804 = v788.keyType._zod.run({
          value: v803,
          issues: []
        }, v790);
        if (v804 instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const v805 = typeof v803 === "string" && number$2.test(v803) && v804.issues.length;
        if (v805) {
          const v806 = v788.keyType._zod.run({
            value: Number(v803),
            issues: []
          }, v790);
          if (v806 instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (v806.issues.length === 0) {
            v804 = v806;
          }
        }
        if (v804.issues.length) {
          if (v788.mode === "loose") {
            v789.value[v803] = v791[v803];
          } else {
            v789.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: v804.issues.map(v807 => finalizeIssue(v807, v790, config())),
              input: v803,
              path: [v803],
              inst: v787
            });
          }
          continue;
        }
        const v808 = v788.valueType._zod.run({
          value: v791[v803],
          issues: []
        }, v790);
        if (v808 instanceof Promise) {
          v792.push(v808.then(v809 => {
            if (v809.issues.length) {
              v789.issues.push(...prefixIssues(v803, v809.issues));
            }
            v789.value[v804.value] = v809.value;
          }));
        } else {
          if (v808.issues.length) {
            v789.issues.push(...prefixIssues(v803, v808.issues));
          }
          v789.value[v804.value] = v808.value;
        }
      }
    }
    if (v792.length) {
      return Promise.all(v792).then(() => v789);
    }
    return v789;
  };
});
const $ZodEnum = $constructor("$ZodEnum", (v810, v811) => {
  $ZodType.init(v810, v811);
  const v812 = getEnumValues(v811.entries);
  const v813 = new Set(v812);
  v810._zod.values = v813;
  v810._zod.pattern = new RegExp("^(" + v812.filter(v814 => propertyKeyTypes.has(typeof v814)).map(v815 => typeof v815 === "string" ? escapeRegex(v815) : v815.toString()).join("|") + ")$");
  v810._zod.parse = (v816, v817) => {
    const v818 = v816.value;
    if (v813.has(v818)) {
      return v816;
    }
    v816.issues.push({
      code: "invalid_value",
      values: v812,
      input: v818,
      inst: v810
    });
    return v816;
  };
});
const $ZodLiteral = $constructor("$ZodLiteral", (v819, v820) => {
  $ZodType.init(v819, v820);
  if (v820.values.length === 0) {
    throw new Error("Cannot create literal schema with no valid values");
  }
  const v821 = new Set(v820.values);
  v819._zod.values = v821;
  v819._zod.pattern = new RegExp("^(" + v820.values.map(v822 => typeof v822 === "string" ? escapeRegex(v822) : v822 ? escapeRegex(v822.toString()) : String(v822)).join("|") + ")$");
  v819._zod.parse = (v823, v824) => {
    const v825 = v823.value;
    if (v821.has(v825)) {
      return v823;
    }
    v823.issues.push({
      code: "invalid_value",
      values: v820.values,
      input: v825,
      inst: v819
    });
    return v823;
  };
});
const $ZodTransform = $constructor("$ZodTransform", (v826, v827) => {
  $ZodType.init(v826, v827);
  v826._zod.optin = "optional";
  v826._zod.parse = (v828, v829) => {
    if (v829.direction === "backward") {
      throw new $ZodEncodeError(v826.constructor.name);
    }
    const v830 = v827.transform(v828.value, v828);
    if (v829.async) {
      const v831 = v830 instanceof Promise ? v830 : Promise.resolve(v830);
      return v831.then(v832 => {
        v828.value = v832;
        v828.fallback = true;
        return v828;
      });
    }
    if (v830 instanceof Promise) {
      throw new $ZodAsyncError();
    }
    v828.value = v830;
    v828.fallback = true;
    return v828;
  };
});
function handleOptionalResult(v833, v834) {
  if (v834 === undefined && (v833.issues.length || v833.fallback)) {
    return {
      issues: [],
      value: undefined
    };
  }
  return v833;
}
const $ZodOptional = $constructor("$ZodOptional", (v835, v836) => {
  $ZodType.init(v835, v836);
  v835._zod.optin = "optional";
  v835._zod.optout = "optional";
  defineLazy(v835._zod, "values", () => {
    if (v836.innerType._zod.values) {
      return new Set([...v836.innerType._zod.values, undefined]);
    } else {
      return undefined;
    }
  });
  defineLazy(v835._zod, "pattern", () => {
    const v837 = v836.innerType._zod.pattern;
    if (v837) {
      return new RegExp("^(" + cleanRegex(v837.source) + ")?$");
    } else {
      return undefined;
    }
  });
  v835._zod.parse = (v838, v839) => {
    if (v836.innerType._zod.optin === "optional") {
      const v840 = v838.value;
      const v841 = v836.innerType._zod.run(v838, v839);
      if (v841 instanceof Promise) {
        return v841.then(v842 => handleOptionalResult(v842, v840));
      }
      return handleOptionalResult(v841, v840);
    }
    if (v838.value === undefined) {
      return v838;
    }
    return v836.innerType._zod.run(v838, v839);
  };
});
const $ZodExactOptional = $constructor("$ZodExactOptional", (v843, v844) => {
  $ZodOptional.init(v843, v844);
  defineLazy(v843._zod, "values", () => v844.innerType._zod.values);
  defineLazy(v843._zod, "pattern", () => v844.innerType._zod.pattern);
  v843._zod.parse = (v845, v846) => {
    return v844.innerType._zod.run(v845, v846);
  };
});
const $ZodNullable = $constructor("$ZodNullable", (v847, v848) => {
  $ZodType.init(v847, v848);
  defineLazy(v847._zod, "optin", () => v848.innerType._zod.optin);
  defineLazy(v847._zod, "optout", () => v848.innerType._zod.optout);
  defineLazy(v847._zod, "pattern", () => {
    const v849 = v848.innerType._zod.pattern;
    if (v849) {
      return new RegExp("^(" + cleanRegex(v849.source) + "|null)$");
    } else {
      return undefined;
    }
  });
  defineLazy(v847._zod, "values", () => {
    if (v848.innerType._zod.values) {
      return new Set([...v848.innerType._zod.values, null]);
    } else {
      return undefined;
    }
  });
  v847._zod.parse = (v850, v851) => {
    if (v850.value === null) {
      return v850;
    }
    return v848.innerType._zod.run(v850, v851);
  };
});
const $ZodDefault = $constructor("$ZodDefault", (v852, v853) => {
  $ZodType.init(v852, v853);
  v852._zod.optin = "optional";
  defineLazy(v852._zod, "values", () => v853.innerType._zod.values);
  v852._zod.parse = (v854, v855) => {
    if (v855.direction === "backward") {
      return v853.innerType._zod.run(v854, v855);
    }
    if (v854.value === undefined) {
      v854.value = v853.defaultValue;
      return v854;
    }
    const v856 = v853.innerType._zod.run(v854, v855);
    if (v856 instanceof Promise) {
      return v856.then(v857 => handleDefaultResult(v857, v853));
    }
    return handleDefaultResult(v856, v853);
  };
});
function handleDefaultResult(v858, v859) {
  if (v858.value === undefined) {
    v858.value = v859.defaultValue;
  }
  return v858;
}
const $ZodPrefault = $constructor("$ZodPrefault", (v860, v861) => {
  $ZodType.init(v860, v861);
  v860._zod.optin = "optional";
  defineLazy(v860._zod, "values", () => v861.innerType._zod.values);
  v860._zod.parse = (v862, v863) => {
    if (v863.direction === "backward") {
      return v861.innerType._zod.run(v862, v863);
    }
    if (v862.value === undefined) {
      v862.value = v861.defaultValue;
    }
    return v861.innerType._zod.run(v862, v863);
  };
});
const $ZodNonOptional = $constructor("$ZodNonOptional", (v864, v865) => {
  $ZodType.init(v864, v865);
  defineLazy(v864._zod, "values", () => {
    const v866 = v865.innerType._zod.values;
    if (v866) {
      return new Set([...v866].filter(v867 => v867 !== undefined));
    } else {
      return undefined;
    }
  });
  v864._zod.parse = (v868, v869) => {
    const v870 = v865.innerType._zod.run(v868, v869);
    if (v870 instanceof Promise) {
      return v870.then(v871 => handleNonOptionalResult(v871, v864));
    }
    return handleNonOptionalResult(v870, v864);
  };
});
function handleNonOptionalResult(v872, v873) {
  if (!v872.issues.length && v872.value === undefined) {
    v872.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: v872.value,
      inst: v873
    });
  }
  return v872;
}
const $ZodCatch = $constructor("$ZodCatch", (v874, v875) => {
  $ZodType.init(v874, v875);
  v874._zod.optin = "optional";
  defineLazy(v874._zod, "optout", () => v875.innerType._zod.optout);
  defineLazy(v874._zod, "values", () => v875.innerType._zod.values);
  v874._zod.parse = (v876, v877) => {
    if (v877.direction === "backward") {
      return v875.innerType._zod.run(v876, v877);
    }
    const v878 = v875.innerType._zod.run(v876, v877);
    if (v878 instanceof Promise) {
      return v878.then(v879 => {
        v876.value = v879.value;
        if (v879.issues.length) {
          v876.value = v875.catchValue({
            ...v876,
            error: {
              issues: v879.issues.map(v880 => finalizeIssue(v880, v877, config()))
            },
            input: v876.value
          });
          v876.issues = [];
          v876.fallback = true;
        }
        return v876;
      });
    }
    v876.value = v878.value;
    if (v878.issues.length) {
      v876.value = v875.catchValue({
        ...v876,
        error: {
          issues: v878.issues.map(v881 => finalizeIssue(v881, v877, config()))
        },
        input: v876.value
      });
      v876.issues = [];
      v876.fallback = true;
    }
    return v876;
  };
});
const $ZodPipe = $constructor("$ZodPipe", (v882, v883) => {
  $ZodType.init(v882, v883);
  defineLazy(v882._zod, "values", () => v883.in._zod.values);
  defineLazy(v882._zod, "optin", () => v883.in._zod.optin);
  defineLazy(v882._zod, "optout", () => v883.out._zod.optout);
  defineLazy(v882._zod, "propValues", () => v883.in._zod.propValues);
  v882._zod.parse = (v884, v885) => {
    if (v885.direction === "backward") {
      const v886 = v883.out._zod.run(v884, v885);
      if (v886 instanceof Promise) {
        return v886.then(v887 => handlePipeResult(v887, v883.in, v885));
      }
      return handlePipeResult(v886, v883.in, v885);
    }
    const v888 = v883.in._zod.run(v884, v885);
    if (v888 instanceof Promise) {
      return v888.then(v889 => handlePipeResult(v889, v883.out, v885));
    }
    return handlePipeResult(v888, v883.out, v885);
  };
});
function handlePipeResult(v890, v891, v892) {
  if (v890.issues.length) {
    v890.aborted = true;
    return v890;
  }
  return v891._zod.run({
    value: v890.value,
    issues: v890.issues,
    fallback: v890.fallback
  }, v892);
}
const $ZodPreprocess = $constructor("$ZodPreprocess", (v893, v894) => {
  $ZodPipe.init(v893, v894);
});
const $ZodReadonly = $constructor("$ZodReadonly", (v895, v896) => {
  $ZodType.init(v895, v896);
  defineLazy(v895._zod, "propValues", () => v896.innerType._zod.propValues);
  defineLazy(v895._zod, "values", () => v896.innerType._zod.values);
  defineLazy(v895._zod, "optin", () => v896.innerType?._zod?.optin);
  defineLazy(v895._zod, "optout", () => v896.innerType?._zod?.optout);
  v895._zod.parse = (v897, v898) => {
    if (v898.direction === "backward") {
      return v896.innerType._zod.run(v897, v898);
    }
    const v899 = v896.innerType._zod.run(v897, v898);
    if (v899 instanceof Promise) {
      return v899.then(handleReadonlyResult);
    }
    return handleReadonlyResult(v899);
  };
});
function handleReadonlyResult(v900) {
  v900.value = Object.freeze(v900.value);
  return v900;
}
const $ZodCustom = $constructor("$ZodCustom", (v901, v902) => {
  $ZodCheck.init(v901, v902);
  $ZodType.init(v901, v902);
  v901._zod.parse = (v903, v904) => {
    return v903;
  };
  v901._zod.check = v905 => {
    const v906 = v905.value;
    const v907 = v902.fn(v906);
    if (v907 instanceof Promise) {
      return v907.then(v908 => handleRefineResult(v908, v905, v906, v901));
    }
    handleRefineResult(v907, v905, v906, v901);
    return;
  };
});
function handleRefineResult(v909, v910, v911, v912) {
  if (!v909) {
    const v913 = {
      code: "custom",
      input: v911,
      inst: v912,
      path: [...(v912._zod.def.path ?? [])],
      continue: !v912._zod.def.abort
    };
    if (v912._zod.def.params) {
      v913.params = v912._zod.def.params;
    }
    v910.issues.push(issue(v913));
  }
}
class $ZodRegistry {
  constructor() {
    this._map = new WeakMap();
    this._idmap = new Map();
  }
  add(v914, ...v915) {
    const v916 = v915[0];
    this._map.set(v914, v916);
    if (v916 && typeof v916 === "object" && "id" in v916) {
      this._idmap.set(v916.id, v914);
    }
    return this;
  }
  clear() {
    this._map = new WeakMap();
    this._idmap = new Map();
    return this;
  }
  remove(v917) {
    const v918 = this._map.get(v917);
    if (v918 && typeof v918 === "object" && "id" in v918) {
      this._idmap.delete(v918.id);
    }
    this._map.delete(v917);
    return this;
  }
  get(v919) {
    const v920 = v919._zod.parent;
    if (v920) {
      const v921 = {
        ...(this.get(v920) ?? {})
      };
      delete v921.id;
      const v922 = {
        ...v921,
        ...this._map.get(v919)
      };
      if (Object.keys(v922).length) {
        return v922;
      } else {
        return undefined;
      }
    }
    return this._map.get(v919);
  }
  has(v923) {
    return this._map.has(v923);
  }
}
function registry() {
  return new $ZodRegistry();
}
globalThis.__zod_globalRegistry ??= registry();
const globalRegistry = globalThis.__zod_globalRegistry;
function _string(v924, v925) {
  return new v924({
    type: "string",
    ...normalizeParams(v925)
  });
}
function _email(v926, v927) {
  return new v926({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(v927)
  });
}
function _guid(v928, v929) {
  return new v928({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(v929)
  });
}
function _uuid(v930, v931) {
  return new v930({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(v931)
  });
}
function _uuidv4(v932, v933) {
  return new v932({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(v933)
  });
}
function _uuidv6(v934, v935) {
  return new v934({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(v935)
  });
}
function _uuidv7(v936, v937) {
  return new v936({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(v937)
  });
}
function _url$1(v938, v939) {
  return new v938({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(v939)
  });
}
function _emoji(v940, v941) {
  return new v940({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(v941)
  });
}
function _nanoid(v942, v943) {
  return new v942({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(v943)
  });
}
function _cuid(v944, v945) {
  return new v944({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(v945)
  });
}
function _cuid2(v946, v947) {
  return new v946({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(v947)
  });
}
function _ulid(v948, v949) {
  return new v948({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(v949)
  });
}
function _xid(v950, v951) {
  return new v950({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(v951)
  });
}
function _ksuid(v952, v953) {
  return new v952({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(v953)
  });
}
function _ipv4(v954, v955) {
  return new v954({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(v955)
  });
}
function _ipv6(v956, v957) {
  return new v956({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(v957)
  });
}
function _cidrv4(v958, v959) {
  return new v958({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(v959)
  });
}
function _cidrv6(v960, v961) {
  return new v960({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(v961)
  });
}
function _base64(v962, v963) {
  return new v962({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(v963)
  });
}
function _base64url(v964, v965) {
  return new v964({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(v965)
  });
}
function _e164(v966, v967) {
  return new v966({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(v967)
  });
}
function _jwt(v968, v969) {
  return new v968({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(v969)
  });
}
function _isoDateTime(v970, v971) {
  return new v970({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(v971)
  });
}
function _isoDate(v972, v973) {
  return new v972({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(v973)
  });
}
function _isoTime(v974, v975) {
  return new v974({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(v975)
  });
}
function _isoDuration(v976, v977) {
  return new v976({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(v977)
  });
}
function _number(v978, v979) {
  return new v978({
    type: "number",
    checks: [],
    ...normalizeParams(v979)
  });
}
function _coercedNumber(v980, v981) {
  return new v980({
    type: "number",
    coerce: true,
    checks: [],
    ...normalizeParams(v981)
  });
}
function _int(v982, v983) {
  return new v982({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(v983)
  });
}
function _boolean(v984, v985) {
  return new v984({
    type: "boolean",
    ...normalizeParams(v985)
  });
}
function _null$1(v986, v987) {
  return new v986({
    type: "null",
    ...normalizeParams(v987)
  });
}
function _any(v988) {
  return new v988({
    type: "any"
  });
}
function _unknown(v989) {
  return new v989({
    type: "unknown"
  });
}
function _never(v990, v991) {
  return new v990({
    type: "never",
    ...normalizeParams(v991)
  });
}
function _lt(v992, v993) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(v993),
    value: v992,
    inclusive: false
  });
}
function _lte(v994, v995) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(v995),
    value: v994,
    inclusive: true
  });
}
function _gt(v996, v997) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(v997),
    value: v996,
    inclusive: false
  });
}
function _gte(v998, v999) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(v999),
    value: v998,
    inclusive: true
  });
}
function _multipleOf(v1000, v1001) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(v1001),
    value: v1000
  });
}
function _maxLength(v1002, v1003) {
  const v1004 = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(v1003),
    maximum: v1002
  });
  return v1004;
}
function _minLength(v1005, v1006) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(v1006),
    minimum: v1005
  });
}
function _length(v1007, v1008) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(v1008),
    length: v1007
  });
}
function _regex(v1009, v1010) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(v1010),
    pattern: v1009
  });
}
function _lowercase(v1011) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(v1011)
  });
}
function _uppercase(v1012) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(v1012)
  });
}
function _includes(v1013, v1014) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(v1014),
    includes: v1013
  });
}
function _startsWith(v1015, v1016) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(v1016),
    prefix: v1015
  });
}
function _endsWith(v1017, v1018) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(v1018),
    suffix: v1017
  });
}
function _overwrite(v1019) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx: v1019
  });
}
function _normalize(v1020) {
  return _overwrite(v1021 => v1021.normalize(v1020));
}
function _trim() {
  return _overwrite(v1022 => v1022.trim());
}
function _toLowerCase() {
  return _overwrite(v1023 => v1023.toLowerCase());
}
function _toUpperCase() {
  return _overwrite(v1024 => v1024.toUpperCase());
}
function _slugify() {
  return _overwrite(v1025 => slugify(v1025));
}
function _array(v1026, v1027, v1028) {
  return new v1026({
    type: "array",
    element: v1027,
    ...normalizeParams(v1028)
  });
}
function _custom(v1029, v1030, v1031) {
  const v1032 = normalizeParams(v1031);
  v1032.abort ??= true;
  const v1033 = new v1029({
    type: "custom",
    check: "custom",
    fn: v1030,
    ...v1032
  });
  return v1033;
}
function _refine(v1034, v1035, v1036) {
  const v1037 = new v1034({
    type: "custom",
    check: "custom",
    fn: v1035,
    ...normalizeParams(v1036)
  });
  return v1037;
}
function _superRefine(v1038, v1039) {
  const v1040 = _check(v1041 => {
    v1041.addIssue = v1042 => {
      if (typeof v1042 === "string") {
        v1041.issues.push(issue(v1042, v1041.value, v1040._zod.def));
      } else {
        const v1043 = v1042;
        if (v1043.fatal) {
          v1043.continue = false;
        }
        v1043.code ??= "custom";
        v1043.input ??= v1041.value;
        v1043.inst ??= v1040;
        v1043.continue ??= !v1040._zod.def.abort;
        v1041.issues.push(issue(v1043));
      }
    };
    return v1038(v1041.value, v1041);
  }, v1039);
  return v1040;
}
function _check(v1044, v1045) {
  const v1046 = new $ZodCheck({
    check: "custom",
    ...normalizeParams(v1045)
  });
  v1046._zod.check = v1044;
  return v1046;
}
function initializeContext(v1047) {
  let v1048 = v1047?.target ?? "draft-2020-12";
  if (v1048 === "draft-4") {
    v1048 = "draft-04";
  }
  if (v1048 === "draft-7") {
    v1048 = "draft-07";
  }
  return {
    processors: v1047.processors ?? {},
    metadataRegistry: v1047?.metadata ?? globalRegistry,
    target: v1048,
    unrepresentable: v1047?.unrepresentable ?? "throw",
    override: v1047?.override ?? (() => {}),
    io: v1047?.io ?? "output",
    counter: 0,
    seen: new Map(),
    cycles: v1047?.cycles ?? "ref",
    reused: v1047?.reused ?? "inline",
    external: v1047?.external ?? undefined
  };
}
function process$1(v1049, v1050, v1051 = {
  path: [],
  schemaPath: []
}) {
  var v1052;
  const v1053 = v1049._zod.def;
  const v1054 = v1050.seen.get(v1049);
  if (v1054) {
    v1054.count++;
    const v1055 = v1051.schemaPath.includes(v1049);
    if (v1055) {
      v1054.cycle = v1051.path;
    }
    return v1054.schema;
  }
  const v1056 = {
    schema: {},
    count: 1,
    cycle: undefined,
    path: v1051.path
  };
  v1050.seen.set(v1049, v1056);
  const v1057 = v1049._zod.toJSONSchema?.();
  if (v1057) {
    v1056.schema = v1057;
  } else {
    const v1058 = {
      ...v1051,
      schemaPath: [...v1051.schemaPath, v1049],
      path: v1051.path
    };
    if (v1049._zod.processJSONSchema) {
      v1049._zod.processJSONSchema(v1050, v1056.schema, v1058);
    } else {
      const v1059 = v1056.schema;
      const v1060 = v1050.processors[v1053.type];
      if (!v1060) {
        throw new Error("[toJSONSchema]: Non-representable type encountered: " + v1053.type);
      }
      v1060(v1049, v1050, v1059, v1058);
    }
    const v1061 = v1049._zod.parent;
    if (v1061) {
      if (!v1056.ref) {
        v1056.ref = v1061;
      }
      process$1(v1061, v1050, v1058);
      v1050.seen.get(v1061).isParent = true;
    }
  }
  const v1062 = v1050.metadataRegistry.get(v1049);
  if (v1062) {
    Object.assign(v1056.schema, v1062);
  }
  if (v1050.io === "input" && isTransforming(v1049)) {
    delete v1056.schema.examples;
    delete v1056.schema.default;
  }
  if (v1050.io === "input" && "_prefault" in v1056.schema) {
    (v1052 = v1056.schema).default ?? (v1052.default = v1056.schema._prefault);
  }
  delete v1056.schema._prefault;
  const v1063 = v1050.seen.get(v1049);
  return v1063.schema;
}
function extractDefs(v1064, v1065) {
  const v1066 = v1064.seen.get(v1065);
  if (!v1066) {
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  }
  const v1067 = new Map();
  for (const v1068 of v1064.seen.entries()) {
    const v1069 = v1064.metadataRegistry.get(v1068[0])?.id;
    if (v1069) {
      const v1070 = v1067.get(v1069);
      if (v1070 && v1070 !== v1068[0]) {
        throw new Error("Duplicate schema id \"" + v1069 + "\" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.");
      }
      v1067.set(v1069, v1068[0]);
    }
  }
  const v1071 = v1072 => {
    const v1073 = v1064.target === "draft-2020-12" ? "$defs" : "definitions";
    if (v1064.external) {
      const v1074 = v1064.external.registry.get(v1072[0])?.id;
      const v1075 = v1064.external.uri ?? (v1076 => v1076);
      if (v1074) {
        return {
          ref: v1075(v1074)
        };
      }
      const v1077 = v1072[1].defId ?? v1072[1].schema.id ?? "schema" + v1064.counter++;
      v1072[1].defId = v1077;
      return {
        defId: v1077,
        ref: v1075("__shared") + "#/" + v1073 + "/" + v1077
      };
    }
    if (v1072[1] === v1066) {
      return {
        ref: "#"
      };
    }
    const v1078 = "#";
    const v1079 = v1078 + "/" + v1073 + "/";
    const v1080 = v1072[1].schema.id ?? "__schema" + v1064.counter++;
    return {
      defId: v1080,
      ref: v1079 + v1080
    };
  };
  const v1081 = v1082 => {
    if (v1082[1].schema.$ref) {
      return;
    }
    const v1083 = v1082[1];
    const {
      ref: v1084,
      defId: v1085
    } = v1071(v1082);
    v1083.def = {
      ...v1083.schema
    };
    if (v1085) {
      v1083.defId = v1085;
    }
    const v1086 = v1083.schema;
    for (const v1087 in v1086) {
      delete v1086[v1087];
    }
    v1086.$ref = v1084;
  };
  if (v1064.cycles === "throw") {
    for (const v1088 of v1064.seen.entries()) {
      const v1089 = v1088[1];
      if (v1089.cycle) {
        throw new Error("Cycle detected: #/" + v1089.cycle?.join("/") + "/<root>\n\nSet the `cycles` parameter to `\"ref\"` to resolve cyclical schemas with defs.");
      }
    }
  }
  for (const v1090 of v1064.seen.entries()) {
    const v1091 = v1090[1];
    if (v1065 === v1090[0]) {
      v1081(v1090);
      continue;
    }
    if (v1064.external) {
      const v1092 = v1064.external.registry.get(v1090[0])?.id;
      if (v1065 !== v1090[0] && v1092) {
        v1081(v1090);
        continue;
      }
    }
    const v1093 = v1064.metadataRegistry.get(v1090[0])?.id;
    if (v1093) {
      v1081(v1090);
      continue;
    }
    if (v1091.cycle) {
      v1081(v1090);
      continue;
    }
    if (v1091.count > 1) {
      if (v1064.reused === "ref") {
        v1081(v1090);
        continue;
      }
    }
  }
}
function finalize(v1094, v1095) {
  const v1096 = v1094.seen.get(v1095);
  if (!v1096) {
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  }
  const v1097 = v1098 => {
    const v1099 = v1094.seen.get(v1098);
    if (v1099.ref === null) {
      return;
    }
    const v1100 = v1099.def ?? v1099.schema;
    const v1101 = {
      ...v1100
    };
    const v1102 = v1099.ref;
    v1099.ref = null;
    if (v1102) {
      v1097(v1102);
      const v1103 = v1094.seen.get(v1102);
      const v1104 = v1103.schema;
      if (v1104.$ref && (v1094.target === "draft-07" || v1094.target === "draft-04" || v1094.target === "openapi-3.0")) {
        v1100.allOf = v1100.allOf ?? [];
        v1100.allOf.push(v1104);
      } else {
        Object.assign(v1100, v1104);
      }
      Object.assign(v1100, v1101);
      const v1105 = v1098._zod.parent === v1102;
      if (v1105) {
        for (const v1106 in v1100) {
          if (v1106 === "$ref" || v1106 === "allOf") {
            continue;
          }
          if (!(v1106 in v1101)) {
            delete v1100[v1106];
          }
        }
      }
      if (v1104.$ref && v1103.def) {
        for (const v1107 in v1100) {
          if (v1107 === "$ref" || v1107 === "allOf") {
            continue;
          }
          if (v1107 in v1103.def && JSON.stringify(v1100[v1107]) === JSON.stringify(v1103.def[v1107])) {
            delete v1100[v1107];
          }
        }
      }
    }
    const v1108 = v1098._zod.parent;
    if (v1108 && v1108 !== v1102) {
      v1097(v1108);
      const v1109 = v1094.seen.get(v1108);
      if (v1109?.schema.$ref) {
        v1100.$ref = v1109.schema.$ref;
        if (v1109.def) {
          for (const v1110 in v1100) {
            if (v1110 === "$ref" || v1110 === "allOf") {
              continue;
            }
            if (v1110 in v1109.def && JSON.stringify(v1100[v1110]) === JSON.stringify(v1109.def[v1110])) {
              delete v1100[v1110];
            }
          }
        }
      }
    }
    v1094.override({
      zodSchema: v1098,
      jsonSchema: v1100,
      path: v1099.path ?? []
    });
  };
  for (const v1111 of [...v1094.seen.entries()].reverse()) {
    v1097(v1111[0]);
  }
  const v1112 = {};
  if (v1094.target === "draft-2020-12") {
    v1112.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (v1094.target === "draft-07") {
    v1112.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (v1094.target === "draft-04") {
    v1112.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (v1094.target === "openapi-3.0") ;else {
    ;
  }
  if (v1094.external?.uri) {
    const v1113 = v1094.external.registry.get(v1095)?.id;
    if (!v1113) {
      throw new Error("Schema is missing an `id` property");
    }
    v1112.$id = v1094.external.uri(v1113);
  }
  Object.assign(v1112, v1096.def ?? v1096.schema);
  const v1114 = v1094.metadataRegistry.get(v1095)?.id;
  if (v1114 !== undefined && v1112.id === v1114) {
    delete v1112.id;
  }
  const v1115 = v1094.external?.defs ?? {};
  for (const v1116 of v1094.seen.entries()) {
    const v1117 = v1116[1];
    if (v1117.def && v1117.defId) {
      if (v1117.def.id === v1117.defId) {
        delete v1117.def.id;
      }
      v1115[v1117.defId] = v1117.def;
    }
  }
  if (v1094.external) ;else if (Object.keys(v1115).length > 0) {
    if (v1094.target === "draft-2020-12") {
      v1112.$defs = v1115;
    } else {
      v1112.definitions = v1115;
    }
  }
  try {
    const v1118 = JSON.parse(JSON.stringify(v1112));
    Object.defineProperty(v1118, "~standard", {
      value: {
        ...v1095["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(v1095, "input", v1094.processors),
          output: createStandardJSONSchemaMethod(v1095, "output", v1094.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return v1118;
  } catch (v1119) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(v1120, v1121) {
  const v1122 = v1121 ?? {
    seen: new Set()
  };
  if (v1122.seen.has(v1120)) {
    return false;
  }
  v1122.seen.add(v1120);
  const v1123 = v1120._zod.def;
  if (v1123.type === "transform") {
    return true;
  }
  if (v1123.type === "array") {
    return isTransforming(v1123.element, v1122);
  }
  if (v1123.type === "set") {
    return isTransforming(v1123.valueType, v1122);
  }
  if (v1123.type === "lazy") {
    return isTransforming(v1123.getter(), v1122);
  }
  if (v1123.type === "promise" || v1123.type === "optional" || v1123.type === "nonoptional" || v1123.type === "nullable" || v1123.type === "readonly" || v1123.type === "default" || v1123.type === "prefault") {
    return isTransforming(v1123.innerType, v1122);
  }
  if (v1123.type === "intersection") {
    return isTransforming(v1123.left, v1122) || isTransforming(v1123.right, v1122);
  }
  if (v1123.type === "record" || v1123.type === "map") {
    return isTransforming(v1123.keyType, v1122) || isTransforming(v1123.valueType, v1122);
  }
  if (v1123.type === "pipe") {
    if (v1120._zod.traits.has("$ZodCodec")) {
      return true;
    }
    return isTransforming(v1123.in, v1122) || isTransforming(v1123.out, v1122);
  }
  if (v1123.type === "object") {
    for (const v1124 in v1123.shape) {
      if (isTransforming(v1123.shape[v1124], v1122)) {
        return true;
      }
    }
    return false;
  }
  if (v1123.type === "union") {
    for (const v1125 of v1123.options) {
      if (isTransforming(v1125, v1122)) {
        return true;
      }
    }
    return false;
  }
  if (v1123.type === "tuple") {
    for (const v1126 of v1123.items) {
      if (isTransforming(v1126, v1122)) {
        return true;
      }
    }
    if (v1123.rest && isTransforming(v1123.rest, v1122)) {
      return true;
    }
    return false;
  }
  return false;
}
const createToJSONSchemaMethod = (v1127, v1128 = {}) => v1129 => {
  const v1130 = initializeContext({
    ...v1129,
    processors: v1128
  });
  process$1(v1127, v1130);
  extractDefs(v1130, v1127);
  return finalize(v1130, v1127);
};
const createStandardJSONSchemaMethod = (v1131, v1132, v1133 = {}) => v1134 => {
  const {
    libraryOptions: v1135,
    target: v1136
  } = v1134 ?? {};
  const v1137 = initializeContext({
    ...(v1135 ?? {}),
    target: v1136,
    io: v1132,
    processors: v1133
  });
  process$1(v1131, v1137);
  extractDefs(v1137, v1131);
  return finalize(v1137, v1131);
};
const formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
};
const stringProcessor = (v1138, v1139, v1140, v1141) => {
  const v1142 = v1140;
  v1142.type = "string";
  const {
    minimum: v1143,
    maximum: v1144,
    format: v1145,
    patterns: v1146,
    contentEncoding: v1147
  } = v1138._zod.bag;
  if (typeof v1143 === "number") {
    v1142.minLength = v1143;
  }
  if (typeof v1144 === "number") {
    v1142.maxLength = v1144;
  }
  if (v1145) {
    v1142.format = formatMap[v1145] ?? v1145;
    if (v1142.format === "") {
      delete v1142.format;
    }
    if (v1145 === "time") {
      delete v1142.format;
    }
  }
  if (v1147) {
    v1142.contentEncoding = v1147;
  }
  if (v1146 && v1146.size > 0) {
    const v1148 = [...v1146];
    if (v1148.length === 1) {
      v1142.pattern = v1148[0].source;
    } else if (v1148.length > 1) {
      v1142.allOf = [...v1148.map(v1149 => ({
        ...(v1139.target === "draft-07" || v1139.target === "draft-04" || v1139.target === "openapi-3.0" ? {
          type: "string"
        } : {}),
        pattern: v1149.source
      }))];
    }
  }
};
const numberProcessor = (v1150, v1151, v1152, v1153) => {
  const v1154 = v1152;
  const {
    minimum: v1155,
    maximum: v1156,
    format: v1157,
    multipleOf: v1158,
    exclusiveMaximum: v1159,
    exclusiveMinimum: v1160
  } = v1150._zod.bag;
  if (typeof v1157 === "string" && v1157.includes("int")) {
    v1154.type = "integer";
  } else {
    v1154.type = "number";
  }
  const v1161 = typeof v1160 === "number" && v1160 >= (v1155 ?? Number.NEGATIVE_INFINITY);
  const v1162 = typeof v1159 === "number" && v1159 <= (v1156 ?? Number.POSITIVE_INFINITY);
  const v1163 = v1151.target === "draft-04" || v1151.target === "openapi-3.0";
  if (v1161) {
    if (v1163) {
      v1154.minimum = v1160;
      v1154.exclusiveMinimum = true;
    } else {
      v1154.exclusiveMinimum = v1160;
    }
  } else if (typeof v1155 === "number") {
    v1154.minimum = v1155;
  }
  if (v1162) {
    if (v1163) {
      v1154.maximum = v1159;
      v1154.exclusiveMaximum = true;
    } else {
      v1154.exclusiveMaximum = v1159;
    }
  } else if (typeof v1156 === "number") {
    v1154.maximum = v1156;
  }
  if (typeof v1158 === "number") {
    v1154.multipleOf = v1158;
  }
};
const booleanProcessor = (v1164, v1165, v1166, v1167) => {
  v1166.type = "boolean";
};
const nullProcessor = (v1168, v1169, v1170, v1171) => {
  if (v1169.target === "openapi-3.0") {
    v1170.type = "string";
    v1170.nullable = true;
    v1170.enum = [null];
  } else {
    v1170.type = "null";
  }
};
const neverProcessor = (v1172, v1173, v1174, v1175) => {
  v1174.not = {};
};
const anyProcessor = (v1176, v1177, v1178, v1179) => {};
const unknownProcessor = (v1180, v1181, v1182, v1183) => {};
const enumProcessor = (v1184, v1185, v1186, v1187) => {
  const v1188 = v1184._zod.def;
  const v1189 = getEnumValues(v1188.entries);
  if (v1189.every(v1190 => typeof v1190 === "number")) {
    v1186.type = "number";
  }
  if (v1189.every(v1191 => typeof v1191 === "string")) {
    v1186.type = "string";
  }
  v1186.enum = v1189;
};
const literalProcessor = (v1192, v1193, v1194, v1195) => {
  const v1196 = v1192._zod.def;
  const v1197 = [];
  for (const v1198 of v1196.values) {
    if (v1198 === undefined) {
      if (v1193.unrepresentable === "throw") {
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      }
    } else if (typeof v1198 === "bigint") {
      if (v1193.unrepresentable === "throw") {
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      } else {
        v1197.push(Number(v1198));
      }
    } else {
      v1197.push(v1198);
    }
  }
  if (v1197.length === 0) ;else if (v1197.length === 1) {
    const v1199 = v1197[0];
    v1194.type = v1199 === null ? "null" : typeof v1199;
    if (v1193.target === "draft-04" || v1193.target === "openapi-3.0") {
      v1194.enum = [v1199];
    } else {
      v1194.const = v1199;
    }
  } else {
    if (v1197.every(v1200 => typeof v1200 === "number")) {
      v1194.type = "number";
    }
    if (v1197.every(v1201 => typeof v1201 === "string")) {
      v1194.type = "string";
    }
    if (v1197.every(v1202 => typeof v1202 === "boolean")) {
      v1194.type = "boolean";
    }
    if (v1197.every(v1203 => v1203 === null)) {
      v1194.type = "null";
    }
    v1194.enum = v1197;
  }
};
const customProcessor = (v1204, v1205, v1206, v1207) => {
  if (v1205.unrepresentable === "throw") {
    throw new Error("Custom types cannot be represented in JSON Schema");
  }
};
const transformProcessor = (v1208, v1209, v1210, v1211) => {
  if (v1209.unrepresentable === "throw") {
    throw new Error("Transforms cannot be represented in JSON Schema");
  }
};
const arrayProcessor = (v1212, v1213, v1214, v1215) => {
  const v1216 = v1214;
  const v1217 = v1212._zod.def;
  const {
    minimum: v1218,
    maximum: v1219
  } = v1212._zod.bag;
  if (typeof v1218 === "number") {
    v1216.minItems = v1218;
  }
  if (typeof v1219 === "number") {
    v1216.maxItems = v1219;
  }
  v1216.type = "array";
  v1216.items = process$1(v1217.element, v1213, {
    ...v1215,
    path: [...v1215.path, "items"]
  });
};
const objectProcessor = (v1220, v1221, v1222, v1223) => {
  const v1224 = v1222;
  const v1225 = v1220._zod.def;
  v1224.type = "object";
  v1224.properties = {};
  const v1226 = v1225.shape;
  for (const v1227 in v1226) {
    v1224.properties[v1227] = process$1(v1226[v1227], v1221, {
      ...v1223,
      path: [...v1223.path, "properties", v1227]
    });
  }
  const v1228 = new Set(Object.keys(v1226));
  const v1229 = new Set([...v1228].filter(v1230 => {
    const v1231 = v1225.shape[v1230]._zod;
    if (v1221.io === "input") {
      return v1231.optin === undefined;
    } else {
      return v1231.optout === undefined;
    }
  }));
  if (v1229.size > 0) {
    v1224.required = Array.from(v1229);
  }
  if (v1225.catchall?._zod.def.type === "never") {
    v1224.additionalProperties = false;
  } else if (!v1225.catchall) {
    if (v1221.io === "output") {
      v1224.additionalProperties = false;
    }
  } else if (v1225.catchall) {
    v1224.additionalProperties = process$1(v1225.catchall, v1221, {
      ...v1223,
      path: [...v1223.path, "additionalProperties"]
    });
  }
};
const unionProcessor = (v1232, v1233, v1234, v1235) => {
  const v1236 = v1232._zod.def;
  const v1237 = v1236.inclusive === false;
  const v1238 = v1236.options.map((v1239, v1240) => process$1(v1239, v1233, {
    ...v1235,
    path: [...v1235.path, v1237 ? "oneOf" : "anyOf", v1240]
  }));
  if (v1237) {
    v1234.oneOf = v1238;
  } else {
    v1234.anyOf = v1238;
  }
};
const intersectionProcessor = (v1241, v1242, v1243, v1244) => {
  const v1245 = v1241._zod.def;
  const v1246 = process$1(v1245.left, v1242, {
    ...v1244,
    path: [...v1244.path, "allOf", 0]
  });
  const v1247 = process$1(v1245.right, v1242, {
    ...v1244,
    path: [...v1244.path, "allOf", 1]
  });
  const v1248 = v1249 => "allOf" in v1249 && Object.keys(v1249).length === 1;
  const v1250 = [...(v1248(v1246) ? v1246.allOf : [v1246]), ...(v1248(v1247) ? v1247.allOf : [v1247])];
  v1243.allOf = v1250;
};
const recordProcessor = (v1251, v1252, v1253, v1254) => {
  const v1255 = v1253;
  const v1256 = v1251._zod.def;
  v1255.type = "object";
  const v1257 = v1256.keyType;
  const v1258 = v1257._zod.bag;
  const v1259 = v1258?.patterns;
  if (v1256.mode === "loose" && v1259 && v1259.size > 0) {
    const v1260 = process$1(v1256.valueType, v1252, {
      ...v1254,
      path: [...v1254.path, "patternProperties", "*"]
    });
    v1255.patternProperties = {};
    for (const v1261 of v1259) {
      v1255.patternProperties[v1261.source] = v1260;
    }
  } else {
    if (v1252.target === "draft-07" || v1252.target === "draft-2020-12") {
      v1255.propertyNames = process$1(v1256.keyType, v1252, {
        ...v1254,
        path: [...v1254.path, "propertyNames"]
      });
    }
    v1255.additionalProperties = process$1(v1256.valueType, v1252, {
      ...v1254,
      path: [...v1254.path, "additionalProperties"]
    });
  }
  const v1262 = v1257._zod.values;
  if (v1262) {
    const v1263 = [...v1262].filter(v1264 => typeof v1264 === "string" || typeof v1264 === "number");
    if (v1263.length > 0) {
      v1255.required = v1263;
    }
  }
};
const nullableProcessor = (v1265, v1266, v1267, v1268) => {
  const v1269 = v1265._zod.def;
  const v1270 = process$1(v1269.innerType, v1266, v1268);
  const v1271 = v1266.seen.get(v1265);
  if (v1266.target === "openapi-3.0") {
    v1271.ref = v1269.innerType;
    v1267.nullable = true;
  } else {
    v1267.anyOf = [v1270, {
      type: "null"
    }];
  }
};
const nonoptionalProcessor = (v1272, v1273, v1274, v1275) => {
  const v1276 = v1272._zod.def;
  process$1(v1276.innerType, v1273, v1275);
  const v1277 = v1273.seen.get(v1272);
  v1277.ref = v1276.innerType;
};
const defaultProcessor = (v1278, v1279, v1280, v1281) => {
  const v1282 = v1278._zod.def;
  process$1(v1282.innerType, v1279, v1281);
  const v1283 = v1279.seen.get(v1278);
  v1283.ref = v1282.innerType;
  v1280.default = JSON.parse(JSON.stringify(v1282.defaultValue));
};
const prefaultProcessor = (v1284, v1285, v1286, v1287) => {
  const v1288 = v1284._zod.def;
  process$1(v1288.innerType, v1285, v1287);
  const v1289 = v1285.seen.get(v1284);
  v1289.ref = v1288.innerType;
  if (v1285.io === "input") {
    v1286._prefault = JSON.parse(JSON.stringify(v1288.defaultValue));
  }
};
const catchProcessor = (v1290, v1291, v1292, v1293) => {
  const v1294 = v1290._zod.def;
  process$1(v1294.innerType, v1291, v1293);
  const v1295 = v1291.seen.get(v1290);
  v1295.ref = v1294.innerType;
  let v1296;
  try {
    v1296 = v1294.catchValue(undefined);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  v1292.default = v1296;
};
const pipeProcessor = (v1297, v1298, v1299, v1300) => {
  const v1301 = v1297._zod.def;
  const v1302 = v1301.in._zod.traits.has("$ZodTransform");
  const v1303 = v1298.io === "input" ? v1302 ? v1301.out : v1301.in : v1301.out;
  process$1(v1303, v1298, v1300);
  const v1304 = v1298.seen.get(v1297);
  v1304.ref = v1303;
};
const readonlyProcessor = (v1305, v1306, v1307, v1308) => {
  const v1309 = v1305._zod.def;
  process$1(v1309.innerType, v1306, v1308);
  const v1310 = v1306.seen.get(v1305);
  v1310.ref = v1309.innerType;
  v1307.readOnly = true;
};
const optionalProcessor = (v1311, v1312, v1313, v1314) => {
  const v1315 = v1311._zod.def;
  process$1(v1315.innerType, v1312, v1314);
  const v1316 = v1312.seen.get(v1311);
  v1316.ref = v1315.innerType;
};
function isZ4Schema(v1317) {
  const v1318 = v1317;
  return !!v1318._zod;
}
function safeParse$1(v1319, v1320) {
  if (isZ4Schema(v1319)) {
    const v1321 = safeParse$2(v1319, v1320);
    return v1321;
  }
  const v1322 = v1319;
  const v1323 = v1322.safeParse(v1320);
  return v1323;
}
function getObjectShape(v1324) {
  if (!v1324) {
    return undefined;
  }
  let v1325;
  if (isZ4Schema(v1324)) {
    const v1326 = v1324;
    v1325 = v1326._zod?.def?.shape;
  } else {
    const v1327 = v1324;
    v1325 = v1327.shape;
  }
  if (!v1325) {
    return undefined;
  }
  if (typeof v1325 === "function") {
    try {
      return v1325();
    } catch {
      return undefined;
    }
  }
  return v1325;
}
function getLiteralValue(v1328) {
  if (isZ4Schema(v1328)) {
    const v1329 = v1328;
    const v1330 = v1329._zod?.def;
    if (v1330) {
      if (v1330.value !== undefined) {
        return v1330.value;
      }
      if (Array.isArray(v1330.values) && v1330.values.length > 0) {
        return v1330.values[0];
      }
    }
  }
  const v1331 = v1328;
  const v1332 = v1331._def;
  if (v1332) {
    if (v1332.value !== undefined) {
      return v1332.value;
    }
    if (Array.isArray(v1332.values) && v1332.values.length > 0) {
      return v1332.values[0];
    }
  }
  const v1333 = v1328.value;
  if (v1333 !== undefined) {
    return v1333;
  }
  return undefined;
}
const ZodISODateTime = $constructor("ZodISODateTime", (v1334, v1335) => {
  $ZodISODateTime.init(v1334, v1335);
  ZodStringFormat.init(v1334, v1335);
});
function datetime(v1336) {
  return _isoDateTime(ZodISODateTime, v1336);
}
const ZodISODate = $constructor("ZodISODate", (v1337, v1338) => {
  $ZodISODate.init(v1337, v1338);
  ZodStringFormat.init(v1337, v1338);
});
function date(v1339) {
  return _isoDate(ZodISODate, v1339);
}
const ZodISOTime = $constructor("ZodISOTime", (v1340, v1341) => {
  $ZodISOTime.init(v1340, v1341);
  ZodStringFormat.init(v1340, v1341);
});
function time(v1342) {
  return _isoTime(ZodISOTime, v1342);
}
const ZodISODuration = $constructor("ZodISODuration", (v1343, v1344) => {
  $ZodISODuration.init(v1343, v1344);
  ZodStringFormat.init(v1343, v1344);
});
function duration(v1345) {
  return _isoDuration(ZodISODuration, v1345);
}
const initializer = (v1346, v1347) => {
  $ZodError.init(v1346, v1347);
  v1346.name = "ZodError";
  Object.defineProperties(v1346, {
    format: {
      value: v1348 => formatError(v1346, v1348)
    },
    flatten: {
      value: v1349 => flattenError$1(v1346, v1349)
    },
    addIssue: {
      value: v1350 => {
        v1346.issues.push(v1350);
        v1346.message = JSON.stringify(v1346.issues, jsonStringifyReplacer, 2);
      }
    },
    addIssues: {
      value: v1351 => {
        v1346.issues.push(...v1351);
        v1346.message = JSON.stringify(v1346.issues, jsonStringifyReplacer, 2);
      }
    },
    isEmpty: {
      get() {
        return v1346.issues.length === 0;
      }
    }
  });
};
const ZodRealError = $constructor("ZodError", initializer, {
  Parent: Error
});
const parse = _parse(ZodRealError);
const parseAsync = _parseAsync(ZodRealError);
const safeParse = _safeParse(ZodRealError);
const safeParseAsync = _safeParseAsync(ZodRealError);
const encode = _encode(ZodRealError);
const decode = _decode(ZodRealError);
const encodeAsync = _encodeAsync(ZodRealError);
const decodeAsync = _decodeAsync(ZodRealError);
const safeEncode = _safeEncode(ZodRealError);
const safeDecode = _safeDecode(ZodRealError);
const safeEncodeAsync = _safeEncodeAsync(ZodRealError);
const safeDecodeAsync = _safeDecodeAsync(ZodRealError);
const _installedGroups = new WeakMap();
function _installLazyMethods(v1352, v1353, v1354) {
  const v1355 = Object.getPrototypeOf(v1352);
  let v1356 = _installedGroups.get(v1355);
  if (!v1356) {
    v1356 = new Set();
    _installedGroups.set(v1355, v1356);
  }
  if (v1356.has(v1353)) {
    return;
  }
  v1356.add(v1353);
  for (const v1357 in v1354) {
    const v1358 = v1354[v1357];
    Object.defineProperty(v1355, v1357, {
      configurable: true,
      enumerable: false,
      get() {
        const v1359 = v1358.bind(this);
        Object.defineProperty(this, v1357, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v1359
        });
        return v1359;
      },
      set(v1360) {
        Object.defineProperty(this, v1357, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: v1360
        });
      }
    });
  }
}
const ZodType = $constructor("ZodType", (v1361, v1362) => {
  $ZodType.init(v1361, v1362);
  Object.assign(v1361["~standard"], {
    jsonSchema: {
      input: createStandardJSONSchemaMethod(v1361, "input"),
      output: createStandardJSONSchemaMethod(v1361, "output")
    }
  });
  v1361.toJSONSchema = createToJSONSchemaMethod(v1361, {});
  v1361.def = v1362;
  v1361.type = v1362.type;
  Object.defineProperty(v1361, "_def", {
    value: v1362
  });
  v1361.parse = (v1363, v1364) => parse(v1361, v1363, v1364, {
    callee: v1361.parse
  });
  v1361.safeParse = (v1365, v1366) => safeParse(v1361, v1365, v1366);
  v1361.parseAsync = async (v1367, v1368) => parseAsync(v1361, v1367, v1368, {
    callee: v1361.parseAsync
  });
  v1361.safeParseAsync = async (v1369, v1370) => safeParseAsync(v1361, v1369, v1370);
  v1361.spa = v1361.safeParseAsync;
  v1361.encode = (v1371, v1372) => encode(v1361, v1371, v1372);
  v1361.decode = (v1373, v1374) => decode(v1361, v1373, v1374);
  v1361.encodeAsync = async (v1375, v1376) => encodeAsync(v1361, v1375, v1376);
  v1361.decodeAsync = async (v1377, v1378) => decodeAsync(v1361, v1377, v1378);
  v1361.safeEncode = (v1379, v1380) => safeEncode(v1361, v1379, v1380);
  v1361.safeDecode = (v1381, v1382) => safeDecode(v1361, v1381, v1382);
  v1361.safeEncodeAsync = async (v1383, v1384) => safeEncodeAsync(v1361, v1383, v1384);
  v1361.safeDecodeAsync = async (v1385, v1386) => safeDecodeAsync(v1361, v1385, v1386);
  _installLazyMethods(v1361, "ZodType", {
    check(...v1387) {
      const v1388 = this.def;
      return this.clone(mergeDefs(v1388, {
        checks: [...(v1388.checks ?? []), ...v1387.map(v1389 => typeof v1389 === "function" ? {
          _zod: {
            check: v1389,
            def: {
              check: "custom"
            },
            onattach: []
          }
        } : v1389)]
      }), {
        parent: true
      });
    },
    with(...v1390) {
      return this.check(...v1390);
    },
    clone(v1391, v1392) {
      return clone(this, v1391, v1392);
    },
    brand() {
      return this;
    },
    register(v1393, v1394) {
      v1393.add(this, v1394);
      return this;
    },
    refine(v1395, v1396) {
      return this.check(refine(v1395, v1396));
    },
    superRefine(v1397, v1398) {
      return this.check(superRefine(v1397, v1398));
    },
    overwrite(v1399) {
      return this.check(_overwrite(v1399));
    },
    optional() {
      return optional(this);
    },
    exactOptional() {
      return exactOptional(this);
    },
    nullable() {
      return nullable(this);
    },
    nullish() {
      return optional(nullable(this));
    },
    nonoptional(v1400) {
      return nonoptional(this, v1400);
    },
    array() {
      return array(this);
    },
    or(v1401) {
      return union([this, v1401]);
    },
    and(v1402) {
      return intersection(this, v1402);
    },
    transform(v1403) {
      return pipe(this, transform(v1403));
    },
    default(v1404) {
      return _default(this, v1404);
    },
    prefault(v1405) {
      return prefault(this, v1405);
    },
    catch(v1406) {
      return _catch(this, v1406);
    },
    pipe(v1407) {
      return pipe(this, v1407);
    },
    readonly() {
      return readonly(this);
    },
    describe(v1408) {
      const v1409 = this.clone();
      globalRegistry.add(v1409, {
        description: v1408
      });
      return v1409;
    },
    meta(...v1410) {
      if (v1410.length === 0) {
        return globalRegistry.get(this);
      }
      const v1411 = this.clone();
      globalRegistry.add(v1411, v1410[0]);
      return v1411;
    },
    isOptional() {
      return this.safeParse(undefined).success;
    },
    isNullable() {
      return this.safeParse(null).success;
    },
    apply(v1412) {
      return v1412(this);
    }
  });
  Object.defineProperty(v1361, "description", {
    get() {
      return globalRegistry.get(v1361)?.description;
    },
    configurable: true
  });
  return v1361;
});
const _ZodString = $constructor("_ZodString", (v1413, v1414) => {
  $ZodString.init(v1413, v1414);
  ZodType.init(v1413, v1414);
  v1413._zod.processJSONSchema = (v1415, v1416, v1417) => stringProcessor(v1413, v1415, v1416);
  const v1418 = v1413._zod.bag;
  v1413.format = v1418.format ?? null;
  v1413.minLength = v1418.minimum ?? null;
  v1413.maxLength = v1418.maximum ?? null;
  _installLazyMethods(v1413, "_ZodString", {
    regex(...v1419) {
      return this.check(_regex(...v1419));
    },
    includes(...v1420) {
      return this.check(_includes(...v1420));
    },
    startsWith(...v1421) {
      return this.check(_startsWith(...v1421));
    },
    endsWith(...v1422) {
      return this.check(_endsWith(...v1422));
    },
    min(...v1423) {
      return this.check(_minLength(...v1423));
    },
    max(...v1424) {
      return this.check(_maxLength(...v1424));
    },
    length(...v1425) {
      return this.check(_length(...v1425));
    },
    nonempty(...v1426) {
      return this.check(_minLength(1, ...v1426));
    },
    lowercase(v1427) {
      return this.check(_lowercase(v1427));
    },
    uppercase(v1428) {
      return this.check(_uppercase(v1428));
    },
    trim() {
      return this.check(_trim());
    },
    normalize(...v1429) {
      return this.check(_normalize(...v1429));
    },
    toLowerCase() {
      return this.check(_toLowerCase());
    },
    toUpperCase() {
      return this.check(_toUpperCase());
    },
    slugify() {
      return this.check(_slugify());
    }
  });
});
const ZodString = $constructor("ZodString", (v1430, v1431) => {
  $ZodString.init(v1430, v1431);
  _ZodString.init(v1430, v1431);
  v1430.email = v1432 => v1430.check(_email(ZodEmail, v1432));
  v1430.url = v1433 => v1430.check(_url$1(ZodURL, v1433));
  v1430.jwt = v1434 => v1430.check(_jwt(ZodJWT, v1434));
  v1430.emoji = v1435 => v1430.check(_emoji(ZodEmoji, v1435));
  v1430.guid = v1436 => v1430.check(_guid(ZodGUID, v1436));
  v1430.uuid = v1437 => v1430.check(_uuid(ZodUUID, v1437));
  v1430.uuidv4 = v1438 => v1430.check(_uuidv4(ZodUUID, v1438));
  v1430.uuidv6 = v1439 => v1430.check(_uuidv6(ZodUUID, v1439));
  v1430.uuidv7 = v1440 => v1430.check(_uuidv7(ZodUUID, v1440));
  v1430.nanoid = v1441 => v1430.check(_nanoid(ZodNanoID, v1441));
  v1430.guid = v1442 => v1430.check(_guid(ZodGUID, v1442));
  v1430.cuid = v1443 => v1430.check(_cuid(ZodCUID, v1443));
  v1430.cuid2 = v1444 => v1430.check(_cuid2(ZodCUID2, v1444));
  v1430.ulid = v1445 => v1430.check(_ulid(ZodULID, v1445));
  v1430.base64 = v1446 => v1430.check(_base64(ZodBase64, v1446));
  v1430.base64url = v1447 => v1430.check(_base64url(ZodBase64URL, v1447));
  v1430.xid = v1448 => v1430.check(_xid(ZodXID, v1448));
  v1430.ksuid = v1449 => v1430.check(_ksuid(ZodKSUID, v1449));
  v1430.ipv4 = v1450 => v1430.check(_ipv4(ZodIPv4, v1450));
  v1430.ipv6 = v1451 => v1430.check(_ipv6(ZodIPv6, v1451));
  v1430.cidrv4 = v1452 => v1430.check(_cidrv4(ZodCIDRv4, v1452));
  v1430.cidrv6 = v1453 => v1430.check(_cidrv6(ZodCIDRv6, v1453));
  v1430.e164 = v1454 => v1430.check(_e164(ZodE164, v1454));
  v1430.datetime = v1455 => v1430.check(datetime(v1455));
  v1430.date = v1456 => v1430.check(date(v1456));
  v1430.time = v1457 => v1430.check(time(v1457));
  v1430.duration = v1458 => v1430.check(duration(v1458));
});
function string(v1459) {
  return _string(ZodString, v1459);
}
const ZodStringFormat = $constructor("ZodStringFormat", (v1460, v1461) => {
  $ZodStringFormat.init(v1460, v1461);
  _ZodString.init(v1460, v1461);
});
const ZodEmail = $constructor("ZodEmail", (v1462, v1463) => {
  $ZodEmail.init(v1462, v1463);
  ZodStringFormat.init(v1462, v1463);
});
const ZodGUID = $constructor("ZodGUID", (v1464, v1465) => {
  $ZodGUID.init(v1464, v1465);
  ZodStringFormat.init(v1464, v1465);
});
const ZodUUID = $constructor("ZodUUID", (v1466, v1467) => {
  $ZodUUID.init(v1466, v1467);
  ZodStringFormat.init(v1466, v1467);
});
const ZodURL = $constructor("ZodURL", (v1468, v1469) => {
  $ZodURL.init(v1468, v1469);
  ZodStringFormat.init(v1468, v1469);
});
function url(v1470) {
  return _url$1(ZodURL, v1470);
}
const ZodEmoji = $constructor("ZodEmoji", (v1471, v1472) => {
  $ZodEmoji.init(v1471, v1472);
  ZodStringFormat.init(v1471, v1472);
});
const ZodNanoID = $constructor("ZodNanoID", (v1473, v1474) => {
  $ZodNanoID.init(v1473, v1474);
  ZodStringFormat.init(v1473, v1474);
});
const ZodCUID = $constructor("ZodCUID", (v1475, v1476) => {
  $ZodCUID.init(v1475, v1476);
  ZodStringFormat.init(v1475, v1476);
});
const ZodCUID2 = $constructor("ZodCUID2", (v1477, v1478) => {
  $ZodCUID2.init(v1477, v1478);
  ZodStringFormat.init(v1477, v1478);
});
const ZodULID = $constructor("ZodULID", (v1479, v1480) => {
  $ZodULID.init(v1479, v1480);
  ZodStringFormat.init(v1479, v1480);
});
const ZodXID = $constructor("ZodXID", (v1481, v1482) => {
  $ZodXID.init(v1481, v1482);
  ZodStringFormat.init(v1481, v1482);
});
const ZodKSUID = $constructor("ZodKSUID", (v1483, v1484) => {
  $ZodKSUID.init(v1483, v1484);
  ZodStringFormat.init(v1483, v1484);
});
const ZodIPv4 = $constructor("ZodIPv4", (v1485, v1486) => {
  $ZodIPv4.init(v1485, v1486);
  ZodStringFormat.init(v1485, v1486);
});
const ZodIPv6 = $constructor("ZodIPv6", (v1487, v1488) => {
  $ZodIPv6.init(v1487, v1488);
  ZodStringFormat.init(v1487, v1488);
});
const ZodCIDRv4 = $constructor("ZodCIDRv4", (v1489, v1490) => {
  $ZodCIDRv4.init(v1489, v1490);
  ZodStringFormat.init(v1489, v1490);
});
const ZodCIDRv6 = $constructor("ZodCIDRv6", (v1491, v1492) => {
  $ZodCIDRv6.init(v1491, v1492);
  ZodStringFormat.init(v1491, v1492);
});
const ZodBase64 = $constructor("ZodBase64", (v1493, v1494) => {
  $ZodBase64.init(v1493, v1494);
  ZodStringFormat.init(v1493, v1494);
});
const ZodBase64URL = $constructor("ZodBase64URL", (v1495, v1496) => {
  $ZodBase64URL.init(v1495, v1496);
  ZodStringFormat.init(v1495, v1496);
});
const ZodE164 = $constructor("ZodE164", (v1497, v1498) => {
  $ZodE164.init(v1497, v1498);
  ZodStringFormat.init(v1497, v1498);
});
const ZodJWT = $constructor("ZodJWT", (v1499, v1500) => {
  $ZodJWT.init(v1499, v1500);
  ZodStringFormat.init(v1499, v1500);
});
const ZodNumber = $constructor("ZodNumber", (v1501, v1502) => {
  $ZodNumber.init(v1501, v1502);
  ZodType.init(v1501, v1502);
  v1501._zod.processJSONSchema = (v1503, v1504, v1505) => numberProcessor(v1501, v1503, v1504);
  _installLazyMethods(v1501, "ZodNumber", {
    gt(v1506, v1507) {
      return this.check(_gt(v1506, v1507));
    },
    gte(v1508, v1509) {
      return this.check(_gte(v1508, v1509));
    },
    min(v1510, v1511) {
      return this.check(_gte(v1510, v1511));
    },
    lt(v1512, v1513) {
      return this.check(_lt(v1512, v1513));
    },
    lte(v1514, v1515) {
      return this.check(_lte(v1514, v1515));
    },
    max(v1516, v1517) {
      return this.check(_lte(v1516, v1517));
    },
    int(v1518) {
      return this.check(int(v1518));
    },
    safe(v1519) {
      return this.check(int(v1519));
    },
    positive(v1520) {
      return this.check(_gt(0, v1520));
    },
    nonnegative(v1521) {
      return this.check(_gte(0, v1521));
    },
    negative(v1522) {
      return this.check(_lt(0, v1522));
    },
    nonpositive(v1523) {
      return this.check(_lte(0, v1523));
    },
    multipleOf(v1524, v1525) {
      return this.check(_multipleOf(v1524, v1525));
    },
    step(v1526, v1527) {
      return this.check(_multipleOf(v1526, v1527));
    },
    finite() {
      return this;
    }
  });
  const v1528 = v1501._zod.bag;
  v1501.minValue = Math.max(v1528.minimum ?? Number.NEGATIVE_INFINITY, v1528.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  v1501.maxValue = Math.min(v1528.maximum ?? Number.POSITIVE_INFINITY, v1528.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  v1501.isInt = (v1528.format ?? "").includes("int") || Number.isSafeInteger(v1528.multipleOf ?? 0.5);
  v1501.isFinite = true;
  v1501.format = v1528.format ?? null;
});
function number$1(v1529) {
  return _number(ZodNumber, v1529);
}
const ZodNumberFormat = $constructor("ZodNumberFormat", (v1530, v1531) => {
  $ZodNumberFormat.init(v1530, v1531);
  ZodNumber.init(v1530, v1531);
});
function int(v1532) {
  return _int(ZodNumberFormat, v1532);
}
const ZodBoolean = $constructor("ZodBoolean", (v1533, v1534) => {
  $ZodBoolean.init(v1533, v1534);
  ZodType.init(v1533, v1534);
  v1533._zod.processJSONSchema = (v1535, v1536, v1537) => booleanProcessor(v1533, v1535, v1536);
});
function boolean(v1538) {
  return _boolean(ZodBoolean, v1538);
}
const ZodNull = $constructor("ZodNull", (v1539, v1540) => {
  $ZodNull.init(v1539, v1540);
  ZodType.init(v1539, v1540);
  v1539._zod.processJSONSchema = (v1541, v1542, v1543) => nullProcessor(v1539, v1541, v1542);
});
function _null(v1544) {
  return _null$1(ZodNull, v1544);
}
const ZodAny = $constructor("ZodAny", (v1545, v1546) => {
  $ZodAny.init(v1545, v1546);
  ZodType.init(v1545, v1546);
  v1545._zod.processJSONSchema = (v1547, v1548, v1549) => anyProcessor();
});
function any() {
  return _any(ZodAny);
}
const ZodUnknown = $constructor("ZodUnknown", (v1550, v1551) => {
  $ZodUnknown.init(v1550, v1551);
  ZodType.init(v1550, v1551);
  v1550._zod.processJSONSchema = (v1552, v1553, v1554) => unknownProcessor();
});
function unknown() {
  return _unknown(ZodUnknown);
}
const ZodNever = $constructor("ZodNever", (v1555, v1556) => {
  $ZodNever.init(v1555, v1556);
  ZodType.init(v1555, v1556);
  v1555._zod.processJSONSchema = (v1557, v1558, v1559) => neverProcessor(v1555, v1557, v1558);
});
function never(v1560) {
  return _never(ZodNever, v1560);
}
const ZodArray = $constructor("ZodArray", (v1561, v1562) => {
  $ZodArray.init(v1561, v1562);
  ZodType.init(v1561, v1562);
  v1561._zod.processJSONSchema = (v1563, v1564, v1565) => arrayProcessor(v1561, v1563, v1564, v1565);
  v1561.element = v1562.element;
  _installLazyMethods(v1561, "ZodArray", {
    min(v1566, v1567) {
      return this.check(_minLength(v1566, v1567));
    },
    nonempty(v1568) {
      return this.check(_minLength(1, v1568));
    },
    max(v1569, v1570) {
      return this.check(_maxLength(v1569, v1570));
    },
    length(v1571, v1572) {
      return this.check(_length(v1571, v1572));
    },
    unwrap() {
      return this.element;
    }
  });
});
function array(v1573, v1574) {
  return _array(ZodArray, v1573, v1574);
}
const ZodObject = $constructor("ZodObject", (v1575, v1576) => {
  $ZodObjectJIT.init(v1575, v1576);
  ZodType.init(v1575, v1576);
  v1575._zod.processJSONSchema = (v1577, v1578, v1579) => objectProcessor(v1575, v1577, v1578, v1579);
  defineLazy(v1575, "shape", () => {
    return v1576.shape;
  });
  _installLazyMethods(v1575, "ZodObject", {
    keyof() {
      return _enum$1(Object.keys(this._zod.def.shape));
    },
    catchall(v1580) {
      return this.clone({
        ...this._zod.def,
        catchall: v1580
      });
    },
    passthrough() {
      return this.clone({
        ...this._zod.def,
        catchall: unknown()
      });
    },
    loose() {
      return this.clone({
        ...this._zod.def,
        catchall: unknown()
      });
    },
    strict() {
      return this.clone({
        ...this._zod.def,
        catchall: never()
      });
    },
    strip() {
      return this.clone({
        ...this._zod.def,
        catchall: undefined
      });
    },
    extend(v1581) {
      return extend(this, v1581);
    },
    safeExtend(v1582) {
      return safeExtend(this, v1582);
    },
    merge(v1583) {
      return merge(this, v1583);
    },
    pick(v1584) {
      return pick(this, v1584);
    },
    omit(v1585) {
      return omit(this, v1585);
    },
    partial(...v1586) {
      return partial(ZodOptional, this, v1586[0]);
    },
    required(...v1587) {
      return required$2(ZodNonOptional, this, v1587[0]);
    }
  });
});
function object(v1588, v1589) {
  const v1590 = {
    type: "object",
    shape: v1588 ?? {},
    ...normalizeParams(v1589)
  };
  return new ZodObject(v1590);
}
function looseObject(v1591, v1592) {
  return new ZodObject({
    type: "object",
    shape: v1591,
    catchall: unknown(),
    ...normalizeParams(v1592)
  });
}
const ZodUnion = $constructor("ZodUnion", (v1593, v1594) => {
  $ZodUnion.init(v1593, v1594);
  ZodType.init(v1593, v1594);
  v1593._zod.processJSONSchema = (v1595, v1596, v1597) => unionProcessor(v1593, v1595, v1596, v1597);
  v1593.options = v1594.options;
});
function union(v1598, v1599) {
  return new ZodUnion({
    type: "union",
    options: v1598,
    ...normalizeParams(v1599)
  });
}
const ZodDiscriminatedUnion = $constructor("ZodDiscriminatedUnion", (v1600, v1601) => {
  ZodUnion.init(v1600, v1601);
  $ZodDiscriminatedUnion.init(v1600, v1601);
});
function discriminatedUnion(v1602, v1603, v1604) {
  return new ZodDiscriminatedUnion({
    type: "union",
    options: v1603,
    discriminator: v1602,
    ...normalizeParams(v1604)
  });
}
const ZodIntersection = $constructor("ZodIntersection", (v1605, v1606) => {
  $ZodIntersection.init(v1605, v1606);
  ZodType.init(v1605, v1606);
  v1605._zod.processJSONSchema = (v1607, v1608, v1609) => intersectionProcessor(v1605, v1607, v1608, v1609);
});
function intersection(v1610, v1611) {
  return new ZodIntersection({
    type: "intersection",
    left: v1610,
    right: v1611
  });
}
const ZodRecord = $constructor("ZodRecord", (v1612, v1613) => {
  $ZodRecord.init(v1612, v1613);
  ZodType.init(v1612, v1613);
  v1612._zod.processJSONSchema = (v1614, v1615, v1616) => recordProcessor(v1612, v1614, v1615, v1616);
  v1612.keyType = v1613.keyType;
  v1612.valueType = v1613.valueType;
});
function record(v1617, v1618, v1619) {
  if (!v1618 || !v1618._zod) {
    return new ZodRecord({
      type: "record",
      keyType: string(),
      valueType: v1617,
      ...normalizeParams(v1618)
    });
  }
  return new ZodRecord({
    type: "record",
    keyType: v1617,
    valueType: v1618,
    ...normalizeParams(v1619)
  });
}
const ZodEnum = $constructor("ZodEnum", (v1620, v1621) => {
  $ZodEnum.init(v1620, v1621);
  ZodType.init(v1620, v1621);
  v1620._zod.processJSONSchema = (v1622, v1623, v1624) => enumProcessor(v1620, v1622, v1623);
  v1620.enum = v1621.entries;
  v1620.options = Object.values(v1621.entries);
  const v1625 = new Set(Object.keys(v1621.entries));
  v1620.extract = (v1626, v1627) => {
    const v1628 = {};
    for (const v1629 of v1626) {
      if (v1625.has(v1629)) {
        v1628[v1629] = v1621.entries[v1629];
      } else {
        throw new Error("Key " + v1629 + " not found in enum");
      }
    }
    return new ZodEnum({
      ...v1621,
      checks: [],
      ...normalizeParams(v1627),
      entries: v1628
    });
  };
  v1620.exclude = (v1630, v1631) => {
    const v1632 = {
      ...v1621.entries
    };
    for (const v1633 of v1630) {
      if (v1625.has(v1633)) {
        delete v1632[v1633];
      } else {
        throw new Error("Key " + v1633 + " not found in enum");
      }
    }
    return new ZodEnum({
      ...v1621,
      checks: [],
      ...normalizeParams(v1631),
      entries: v1632
    });
  };
});
function _enum$1(v1634, v1635) {
  const v1636 = Array.isArray(v1634) ? Object.fromEntries(v1634.map(v1637 => [v1637, v1637])) : v1634;
  return new ZodEnum({
    type: "enum",
    entries: v1636,
    ...normalizeParams(v1635)
  });
}
const ZodLiteral = $constructor("ZodLiteral", (v1638, v1639) => {
  $ZodLiteral.init(v1638, v1639);
  ZodType.init(v1638, v1639);
  v1638._zod.processJSONSchema = (v1640, v1641, v1642) => literalProcessor(v1638, v1640, v1641);
  v1638.values = new Set(v1639.values);
  Object.defineProperty(v1638, "value", {
    get() {
      if (v1639.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return v1639.values[0];
    }
  });
});
function literal(v1643, v1644) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(v1643) ? v1643 : [v1643],
    ...normalizeParams(v1644)
  });
}
const ZodTransform = $constructor("ZodTransform", (v1645, v1646) => {
  $ZodTransform.init(v1645, v1646);
  ZodType.init(v1645, v1646);
  v1645._zod.processJSONSchema = (v1647, v1648, v1649) => transformProcessor(v1645, v1647);
  v1645._zod.parse = (v1650, v1651) => {
    if (v1651.direction === "backward") {
      throw new $ZodEncodeError(v1645.constructor.name);
    }
    v1650.addIssue = v1652 => {
      if (typeof v1652 === "string") {
        v1650.issues.push(issue(v1652, v1650.value, v1646));
      } else {
        const v1653 = v1652;
        if (v1653.fatal) {
          v1653.continue = false;
        }
        v1653.code ??= "custom";
        v1653.input ??= v1650.value;
        v1653.inst ??= v1645;
        v1650.issues.push(issue(v1653));
      }
    };
    const v1654 = v1646.transform(v1650.value, v1650);
    if (v1654 instanceof Promise) {
      return v1654.then(v1655 => {
        v1650.value = v1655;
        v1650.fallback = true;
        return v1650;
      });
    }
    v1650.value = v1654;
    v1650.fallback = true;
    return v1650;
  };
});
function transform(v1656) {
  return new ZodTransform({
    type: "transform",
    transform: v1656
  });
}
const ZodOptional = $constructor("ZodOptional", (v1657, v1658) => {
  $ZodOptional.init(v1657, v1658);
  ZodType.init(v1657, v1658);
  v1657._zod.processJSONSchema = (v1659, v1660, v1661) => optionalProcessor(v1657, v1659, v1660, v1661);
  v1657.unwrap = () => v1657._zod.def.innerType;
});
function optional(v1662) {
  return new ZodOptional({
    type: "optional",
    innerType: v1662
  });
}
const ZodExactOptional = $constructor("ZodExactOptional", (v1663, v1664) => {
  $ZodExactOptional.init(v1663, v1664);
  ZodType.init(v1663, v1664);
  v1663._zod.processJSONSchema = (v1665, v1666, v1667) => optionalProcessor(v1663, v1665, v1666, v1667);
  v1663.unwrap = () => v1663._zod.def.innerType;
});
function exactOptional(v1668) {
  return new ZodExactOptional({
    type: "optional",
    innerType: v1668
  });
}
const ZodNullable = $constructor("ZodNullable", (v1669, v1670) => {
  $ZodNullable.init(v1669, v1670);
  ZodType.init(v1669, v1670);
  v1669._zod.processJSONSchema = (v1671, v1672, v1673) => nullableProcessor(v1669, v1671, v1672, v1673);
  v1669.unwrap = () => v1669._zod.def.innerType;
});
function nullable(v1674) {
  return new ZodNullable({
    type: "nullable",
    innerType: v1674
  });
}
const ZodDefault = $constructor("ZodDefault", (v1675, v1676) => {
  $ZodDefault.init(v1675, v1676);
  ZodType.init(v1675, v1676);
  v1675._zod.processJSONSchema = (v1677, v1678, v1679) => defaultProcessor(v1675, v1677, v1678, v1679);
  v1675.unwrap = () => v1675._zod.def.innerType;
  v1675.removeDefault = v1675.unwrap;
});
function _default(v1680, v1681) {
  return new ZodDefault({
    type: "default",
    innerType: v1680,
    get defaultValue() {
      if (typeof v1681 === "function") {
        return v1681();
      } else {
        return shallowClone(v1681);
      }
    }
  });
}
const ZodPrefault = $constructor("ZodPrefault", (v1682, v1683) => {
  $ZodPrefault.init(v1682, v1683);
  ZodType.init(v1682, v1683);
  v1682._zod.processJSONSchema = (v1684, v1685, v1686) => prefaultProcessor(v1682, v1684, v1685, v1686);
  v1682.unwrap = () => v1682._zod.def.innerType;
});
function prefault(v1687, v1688) {
  return new ZodPrefault({
    type: "prefault",
    innerType: v1687,
    get defaultValue() {
      if (typeof v1688 === "function") {
        return v1688();
      } else {
        return shallowClone(v1688);
      }
    }
  });
}
const ZodNonOptional = $constructor("ZodNonOptional", (v1689, v1690) => {
  $ZodNonOptional.init(v1689, v1690);
  ZodType.init(v1689, v1690);
  v1689._zod.processJSONSchema = (v1691, v1692, v1693) => nonoptionalProcessor(v1689, v1691, v1692, v1693);
  v1689.unwrap = () => v1689._zod.def.innerType;
});
function nonoptional(v1694, v1695) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType: v1694,
    ...normalizeParams(v1695)
  });
}
const ZodCatch = $constructor("ZodCatch", (v1696, v1697) => {
  $ZodCatch.init(v1696, v1697);
  ZodType.init(v1696, v1697);
  v1696._zod.processJSONSchema = (v1698, v1699, v1700) => catchProcessor(v1696, v1698, v1699, v1700);
  v1696.unwrap = () => v1696._zod.def.innerType;
  v1696.removeCatch = v1696.unwrap;
});
function _catch(v1701, v1702) {
  return new ZodCatch({
    type: "catch",
    innerType: v1701,
    catchValue: typeof v1702 === "function" ? v1702 : () => v1702
  });
}
const ZodPipe = $constructor("ZodPipe", (v1703, v1704) => {
  $ZodPipe.init(v1703, v1704);
  ZodType.init(v1703, v1704);
  v1703._zod.processJSONSchema = (v1705, v1706, v1707) => pipeProcessor(v1703, v1705, v1706, v1707);
  v1703.in = v1704.in;
  v1703.out = v1704.out;
});
function pipe(v1708, v1709) {
  return new ZodPipe({
    type: "pipe",
    in: v1708,
    out: v1709
  });
}
const ZodPreprocess = $constructor("ZodPreprocess", (v1710, v1711) => {
  ZodPipe.init(v1710, v1711);
  $ZodPreprocess.init(v1710, v1711);
});
const ZodReadonly = $constructor("ZodReadonly", (v1712, v1713) => {
  $ZodReadonly.init(v1712, v1713);
  ZodType.init(v1712, v1713);
  v1712._zod.processJSONSchema = (v1714, v1715, v1716) => readonlyProcessor(v1712, v1714, v1715, v1716);
  v1712.unwrap = () => v1712._zod.def.innerType;
});
function readonly(v1717) {
  return new ZodReadonly({
    type: "readonly",
    innerType: v1717
  });
}
const ZodCustom = $constructor("ZodCustom", (v1718, v1719) => {
  $ZodCustom.init(v1718, v1719);
  ZodType.init(v1718, v1719);
  v1718._zod.processJSONSchema = (v1720, v1721, v1722) => customProcessor(v1718, v1720);
});
function custom(v1723, v1724) {
  return _custom(ZodCustom, v1723 ?? (() => true), v1724);
}
function refine(v1725, v1726 = {}) {
  return _refine(ZodCustom, v1725, v1726);
}
function superRefine(v1727, v1728) {
  return _superRefine(v1727, v1728);
}
function preprocess(v1729, v1730) {
  return new ZodPreprocess({
    type: "pipe",
    in: transform(v1729),
    out: v1730
  });
}
const ZodIssueCode = {
  custom: "custom"
};
function number(v1731) {
  return _coercedNumber(ZodNumber, v1731);
}
const LATEST_PROTOCOL_VERSION = "2025-11-25";
const SUPPORTED_PROTOCOL_VERSIONS = [LATEST_PROTOCOL_VERSION, "2025-06-18", "2025-03-26", "2024-11-05", "2024-10-07"];
const RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";
const JSONRPC_VERSION = "2.0";
const AssertObjectSchema = custom(v1732 => v1732 !== null && (typeof v1732 === "object" || typeof v1732 === "function"));
const ProgressTokenSchema = union([string(), number$1().int()]);
const CursorSchema = string();
looseObject({
  ttl: union([number$1(), _null()]).optional(),
  pollInterval: number$1().optional()
});
const TaskMetadataSchema = object({
  ttl: number$1().optional()
});
const RelatedTaskMetadataSchema = object({
  taskId: string()
});
const RequestMetaSchema = looseObject({
  progressToken: ProgressTokenSchema.optional(),
  [RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional()
});
const BaseRequestParamsSchema = object({
  _meta: RequestMetaSchema.optional()
});
const TaskAugmentedRequestParamsSchema = BaseRequestParamsSchema.extend({
  task: TaskMetadataSchema.optional()
});
const isTaskAugmentedRequestParams = v1733 => TaskAugmentedRequestParamsSchema.safeParse(v1733).success;
const RequestSchema = object({
  method: string(),
  params: BaseRequestParamsSchema.loose().optional()
});
const NotificationsParamsSchema = object({
  _meta: RequestMetaSchema.optional()
});
const NotificationSchema = object({
  method: string(),
  params: NotificationsParamsSchema.loose().optional()
});
const ResultSchema = looseObject({
  _meta: RequestMetaSchema.optional()
});
const RequestIdSchema = union([string(), number$1().int()]);
const JSONRPCRequestSchema = object({
  jsonrpc: literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  ...RequestSchema.shape
}).strict();
const isJSONRPCRequest = v1734 => JSONRPCRequestSchema.safeParse(v1734).success;
const JSONRPCNotificationSchema = object({
  jsonrpc: literal(JSONRPC_VERSION),
  ...NotificationSchema.shape
}).strict();
const isJSONRPCNotification = v1735 => JSONRPCNotificationSchema.safeParse(v1735).success;
const JSONRPCResultResponseSchema = object({
  jsonrpc: literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  result: ResultSchema
}).strict();
const isJSONRPCResultResponse = v1736 => JSONRPCResultResponseSchema.safeParse(v1736).success;
exports.ErrorCode = undefined;
(function (v1737) {
  v1737[v1737.ConnectionClosed = -32000] = "ConnectionClosed";
  v1737[v1737.RequestTimeout = -32001] = "RequestTimeout";
  v1737[v1737.ParseError = -32700] = "ParseError";
  v1737[v1737.InvalidRequest = -32600] = "InvalidRequest";
  v1737[v1737.MethodNotFound = -32601] = "MethodNotFound";
  v1737[v1737.InvalidParams = -32602] = "InvalidParams";
  v1737[v1737.InternalError = -32603] = "InternalError";
  v1737[v1737.UrlElicitationRequired = -32042] = "UrlElicitationRequired";
})(exports.ErrorCode ||= {});
const JSONRPCErrorResponseSchema = object({
  jsonrpc: literal(JSONRPC_VERSION),
  id: RequestIdSchema.optional(),
  error: object({
    code: number$1().int(),
    message: string(),
    data: unknown().optional()
  })
}).strict();
const isJSONRPCErrorResponse = v1738 => JSONRPCErrorResponseSchema.safeParse(v1738).success;
const JSONRPCMessageSchema = union([JSONRPCRequestSchema, JSONRPCNotificationSchema, JSONRPCResultResponseSchema, JSONRPCErrorResponseSchema]);
union([JSONRPCResultResponseSchema, JSONRPCErrorResponseSchema]);
const EmptyResultSchema = ResultSchema.strict();
const CancelledNotificationParamsSchema = NotificationsParamsSchema.extend({
  requestId: RequestIdSchema.optional(),
  reason: string().optional()
});
const CancelledNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/cancelled"),
  params: CancelledNotificationParamsSchema
});
const IconSchema = object({
  src: string(),
  mimeType: string().optional(),
  sizes: array(string()).optional(),
  theme: _enum$1(["light", "dark"]).optional()
});
const IconsSchema = object({
  icons: array(IconSchema).optional()
});
const BaseMetadataSchema = object({
  name: string(),
  title: string().optional()
});
const ImplementationSchema = BaseMetadataSchema.extend({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  version: string(),
  websiteUrl: string().optional(),
  description: string().optional()
});
const FormElicitationCapabilitySchema = intersection(object({
  applyDefaults: boolean().optional()
}), record(string(), unknown()));
const ElicitationCapabilitySchema = preprocess(v1739 => {
  if (v1739 && typeof v1739 === "object" && !Array.isArray(v1739)) {
    if (Object.keys(v1739).length === 0) {
      return {
        form: {}
      };
    }
  }
  return v1739;
}, intersection(object({
  form: FormElicitationCapabilitySchema.optional(),
  url: AssertObjectSchema.optional()
}), record(string(), unknown()).optional()));
const ClientTasksCapabilitySchema = looseObject({
  list: AssertObjectSchema.optional(),
  cancel: AssertObjectSchema.optional(),
  requests: looseObject({
    sampling: looseObject({
      createMessage: AssertObjectSchema.optional()
    }).optional(),
    elicitation: looseObject({
      create: AssertObjectSchema.optional()
    }).optional()
  }).optional()
});
const ServerTasksCapabilitySchema = looseObject({
  list: AssertObjectSchema.optional(),
  cancel: AssertObjectSchema.optional(),
  requests: looseObject({
    tools: looseObject({
      call: AssertObjectSchema.optional()
    }).optional()
  }).optional()
});
const ClientCapabilitiesSchema = object({
  experimental: record(string(), AssertObjectSchema).optional(),
  sampling: object({
    context: AssertObjectSchema.optional(),
    tools: AssertObjectSchema.optional()
  }).optional(),
  elicitation: ElicitationCapabilitySchema.optional(),
  roots: object({
    listChanged: boolean().optional()
  }).optional(),
  tasks: ClientTasksCapabilitySchema.optional()
});
const InitializeRequestParamsSchema = BaseRequestParamsSchema.extend({
  protocolVersion: string(),
  capabilities: ClientCapabilitiesSchema,
  clientInfo: ImplementationSchema
});
const InitializeRequestSchema = RequestSchema.extend({
  method: literal("initialize"),
  params: InitializeRequestParamsSchema
});
const ServerCapabilitiesSchema = object({
  experimental: record(string(), AssertObjectSchema).optional(),
  logging: AssertObjectSchema.optional(),
  completions: AssertObjectSchema.optional(),
  prompts: object({
    listChanged: boolean().optional()
  }).optional(),
  resources: object({
    subscribe: boolean().optional(),
    listChanged: boolean().optional()
  }).optional(),
  tools: object({
    listChanged: boolean().optional()
  }).optional(),
  tasks: ServerTasksCapabilitySchema.optional()
});
const InitializeResultSchema = ResultSchema.extend({
  protocolVersion: string(),
  capabilities: ServerCapabilitiesSchema,
  serverInfo: ImplementationSchema,
  instructions: string().optional()
});
const InitializedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/initialized"),
  params: NotificationsParamsSchema.optional()
});
const isInitializedNotification = v1740 => InitializedNotificationSchema.safeParse(v1740).success;
const PingRequestSchema = RequestSchema.extend({
  method: literal("ping"),
  params: BaseRequestParamsSchema.optional()
});
const ProgressSchema = object({
  progress: number$1(),
  total: optional(number$1()),
  message: optional(string())
});
const ProgressNotificationParamsSchema = object({
  ...NotificationsParamsSchema.shape,
  ...ProgressSchema.shape,
  progressToken: ProgressTokenSchema
});
const ProgressNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/progress"),
  params: ProgressNotificationParamsSchema
});
const PaginatedRequestParamsSchema = BaseRequestParamsSchema.extend({
  cursor: CursorSchema.optional()
});
const PaginatedRequestSchema = RequestSchema.extend({
  params: PaginatedRequestParamsSchema.optional()
});
const PaginatedResultSchema = ResultSchema.extend({
  nextCursor: CursorSchema.optional()
});
const TaskStatusSchema = _enum$1(["working", "input_required", "completed", "failed", "cancelled"]);
const TaskSchema = object({
  taskId: string(),
  status: TaskStatusSchema,
  ttl: union([number$1(), _null()]),
  createdAt: string(),
  lastUpdatedAt: string(),
  pollInterval: optional(number$1()),
  statusMessage: optional(string())
});
const CreateTaskResultSchema = ResultSchema.extend({
  task: TaskSchema
});
const TaskStatusNotificationParamsSchema = NotificationsParamsSchema.merge(TaskSchema);
const TaskStatusNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/tasks/status"),
  params: TaskStatusNotificationParamsSchema
});
const GetTaskRequestSchema = RequestSchema.extend({
  method: literal("tasks/get"),
  params: BaseRequestParamsSchema.extend({
    taskId: string()
  })
});
const GetTaskResultSchema = ResultSchema.merge(TaskSchema);
const GetTaskPayloadRequestSchema = RequestSchema.extend({
  method: literal("tasks/result"),
  params: BaseRequestParamsSchema.extend({
    taskId: string()
  })
});
ResultSchema.loose();
const ListTasksRequestSchema = PaginatedRequestSchema.extend({
  method: literal("tasks/list")
});
const ListTasksResultSchema = PaginatedResultSchema.extend({
  tasks: array(TaskSchema)
});
const CancelTaskRequestSchema = RequestSchema.extend({
  method: literal("tasks/cancel"),
  params: BaseRequestParamsSchema.extend({
    taskId: string()
  })
});
const CancelTaskResultSchema = ResultSchema.merge(TaskSchema);
const ResourceContentsSchema = object({
  uri: string(),
  mimeType: optional(string()),
  _meta: record(string(), unknown()).optional()
});
const TextResourceContentsSchema = ResourceContentsSchema.extend({
  text: string()
});
const Base64Schema = string().refine(v1741 => {
  try {
    atob(v1741);
    return true;
  } catch {
    return false;
  }
}, {
  message: "Invalid Base64 string"
});
const BlobResourceContentsSchema = ResourceContentsSchema.extend({
  blob: Base64Schema
});
const RoleSchema = _enum$1(["user", "assistant"]);
const AnnotationsSchema = object({
  audience: array(RoleSchema).optional(),
  priority: number$1().min(0).max(1).optional(),
  lastModified: datetime({
    offset: true
  }).optional()
});
const ResourceSchema = object({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  uri: string(),
  description: optional(string()),
  mimeType: optional(string()),
  annotations: AnnotationsSchema.optional(),
  _meta: optional(looseObject({}))
});
const ResourceTemplateSchema = object({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  uriTemplate: string(),
  description: optional(string()),
  mimeType: optional(string()),
  annotations: AnnotationsSchema.optional(),
  _meta: optional(looseObject({}))
});
const ListResourcesRequestSchema = PaginatedRequestSchema.extend({
  method: literal("resources/list")
});
const ListResourcesResultSchema = PaginatedResultSchema.extend({
  resources: array(ResourceSchema)
});
const ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
  method: literal("resources/templates/list")
});
const ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
  resourceTemplates: array(ResourceTemplateSchema)
});
const ResourceRequestParamsSchema = BaseRequestParamsSchema.extend({
  uri: string()
});
const ReadResourceRequestParamsSchema = ResourceRequestParamsSchema;
const ReadResourceRequestSchema = RequestSchema.extend({
  method: literal("resources/read"),
  params: ReadResourceRequestParamsSchema
});
const ReadResourceResultSchema = ResultSchema.extend({
  contents: array(union([TextResourceContentsSchema, BlobResourceContentsSchema]))
});
const ResourceListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/resources/list_changed"),
  params: NotificationsParamsSchema.optional()
});
const SubscribeRequestParamsSchema = ResourceRequestParamsSchema;
const SubscribeRequestSchema = RequestSchema.extend({
  method: literal("resources/subscribe"),
  params: SubscribeRequestParamsSchema
});
const UnsubscribeRequestParamsSchema = ResourceRequestParamsSchema;
const UnsubscribeRequestSchema = RequestSchema.extend({
  method: literal("resources/unsubscribe"),
  params: UnsubscribeRequestParamsSchema
});
const ResourceUpdatedNotificationParamsSchema = NotificationsParamsSchema.extend({
  uri: string()
});
const ResourceUpdatedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/resources/updated"),
  params: ResourceUpdatedNotificationParamsSchema
});
const PromptArgumentSchema = object({
  name: string(),
  description: optional(string()),
  required: optional(boolean())
});
const PromptSchema = object({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  description: optional(string()),
  arguments: optional(array(PromptArgumentSchema)),
  _meta: optional(looseObject({}))
});
const ListPromptsRequestSchema = PaginatedRequestSchema.extend({
  method: literal("prompts/list")
});
const ListPromptsResultSchema = PaginatedResultSchema.extend({
  prompts: array(PromptSchema)
});
const GetPromptRequestParamsSchema = BaseRequestParamsSchema.extend({
  name: string(),
  arguments: record(string(), string()).optional()
});
const GetPromptRequestSchema = RequestSchema.extend({
  method: literal("prompts/get"),
  params: GetPromptRequestParamsSchema
});
const TextContentSchema = object({
  type: literal("text"),
  text: string(),
  annotations: AnnotationsSchema.optional(),
  _meta: record(string(), unknown()).optional()
});
const ImageContentSchema = object({
  type: literal("image"),
  data: Base64Schema,
  mimeType: string(),
  annotations: AnnotationsSchema.optional(),
  _meta: record(string(), unknown()).optional()
});
const AudioContentSchema = object({
  type: literal("audio"),
  data: Base64Schema,
  mimeType: string(),
  annotations: AnnotationsSchema.optional(),
  _meta: record(string(), unknown()).optional()
});
const ToolUseContentSchema = object({
  type: literal("tool_use"),
  name: string(),
  id: string(),
  input: record(string(), unknown()),
  _meta: record(string(), unknown()).optional()
});
const EmbeddedResourceSchema = object({
  type: literal("resource"),
  resource: union([TextResourceContentsSchema, BlobResourceContentsSchema]),
  annotations: AnnotationsSchema.optional(),
  _meta: record(string(), unknown()).optional()
});
const ResourceLinkSchema = ResourceSchema.extend({
  type: literal("resource_link")
});
const ContentBlockSchema = union([TextContentSchema, ImageContentSchema, AudioContentSchema, ResourceLinkSchema, EmbeddedResourceSchema]);
const PromptMessageSchema = object({
  role: RoleSchema,
  content: ContentBlockSchema
});
const GetPromptResultSchema = ResultSchema.extend({
  description: string().optional(),
  messages: array(PromptMessageSchema)
});
const PromptListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/prompts/list_changed"),
  params: NotificationsParamsSchema.optional()
});
const ToolAnnotationsSchema = object({
  title: string().optional(),
  readOnlyHint: boolean().optional(),
  destructiveHint: boolean().optional(),
  idempotentHint: boolean().optional(),
  openWorldHint: boolean().optional()
});
const ToolExecutionSchema = object({
  taskSupport: _enum$1(["required", "optional", "forbidden"]).optional()
});
const ToolSchema = object({
  ...BaseMetadataSchema.shape,
  ...IconsSchema.shape,
  description: string().optional(),
  inputSchema: object({
    type: literal("object"),
    properties: record(string(), AssertObjectSchema).optional(),
    required: array(string()).optional()
  }).catchall(unknown()),
  outputSchema: object({
    type: literal("object"),
    properties: record(string(), AssertObjectSchema).optional(),
    required: array(string()).optional()
  }).catchall(unknown()).optional(),
  annotations: ToolAnnotationsSchema.optional(),
  execution: ToolExecutionSchema.optional(),
  _meta: record(string(), unknown()).optional()
});
const ListToolsRequestSchema = PaginatedRequestSchema.extend({
  method: literal("tools/list")
});
const ListToolsResultSchema = PaginatedResultSchema.extend({
  tools: array(ToolSchema)
});
const CallToolResultSchema = ResultSchema.extend({
  content: array(ContentBlockSchema).default([]),
  structuredContent: record(string(), unknown()).optional(),
  isError: boolean().optional()
});
CallToolResultSchema.or(ResultSchema.extend({
  toolResult: unknown()
}));
const CallToolRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  name: string(),
  arguments: record(string(), unknown()).optional()
});
const CallToolRequestSchema = RequestSchema.extend({
  method: literal("tools/call"),
  params: CallToolRequestParamsSchema
});
const ToolListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/tools/list_changed"),
  params: NotificationsParamsSchema.optional()
});
const ListChangedOptionsBaseSchema = object({
  autoRefresh: boolean().default(true),
  debounceMs: number$1().int().nonnegative().default(300)
});
const LoggingLevelSchema = _enum$1(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]);
const SetLevelRequestParamsSchema = BaseRequestParamsSchema.extend({
  level: LoggingLevelSchema
});
const SetLevelRequestSchema = RequestSchema.extend({
  method: literal("logging/setLevel"),
  params: SetLevelRequestParamsSchema
});
const LoggingMessageNotificationParamsSchema = NotificationsParamsSchema.extend({
  level: LoggingLevelSchema,
  logger: string().optional(),
  data: unknown()
});
const LoggingMessageNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/message"),
  params: LoggingMessageNotificationParamsSchema
});
const ModelHintSchema = object({
  name: string().optional()
});
const ModelPreferencesSchema = object({
  hints: array(ModelHintSchema).optional(),
  costPriority: number$1().min(0).max(1).optional(),
  speedPriority: number$1().min(0).max(1).optional(),
  intelligencePriority: number$1().min(0).max(1).optional()
});
const ToolChoiceSchema = object({
  mode: _enum$1(["auto", "required", "none"]).optional()
});
const ToolResultContentSchema = object({
  type: literal("tool_result"),
  toolUseId: string().describe("The unique identifier for the corresponding tool call."),
  content: array(ContentBlockSchema).default([]),
  structuredContent: object({}).loose().optional(),
  isError: boolean().optional(),
  _meta: record(string(), unknown()).optional()
});
const SamplingContentSchema = discriminatedUnion("type", [TextContentSchema, ImageContentSchema, AudioContentSchema]);
const SamplingMessageContentBlockSchema = discriminatedUnion("type", [TextContentSchema, ImageContentSchema, AudioContentSchema, ToolUseContentSchema, ToolResultContentSchema]);
const SamplingMessageSchema = object({
  role: RoleSchema,
  content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)]),
  _meta: record(string(), unknown()).optional()
});
const CreateMessageRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  messages: array(SamplingMessageSchema),
  modelPreferences: ModelPreferencesSchema.optional(),
  systemPrompt: string().optional(),
  includeContext: _enum$1(["none", "thisServer", "allServers"]).optional(),
  temperature: number$1().optional(),
  maxTokens: number$1().int(),
  stopSequences: array(string()).optional(),
  metadata: AssertObjectSchema.optional(),
  tools: array(ToolSchema).optional(),
  toolChoice: ToolChoiceSchema.optional()
});
const CreateMessageRequestSchema = RequestSchema.extend({
  method: literal("sampling/createMessage"),
  params: CreateMessageRequestParamsSchema
});
const CreateMessageResultSchema = ResultSchema.extend({
  model: string(),
  stopReason: optional(_enum$1(["endTurn", "stopSequence", "maxTokens"]).or(string())),
  role: RoleSchema,
  content: SamplingContentSchema
});
const CreateMessageResultWithToolsSchema = ResultSchema.extend({
  model: string(),
  stopReason: optional(_enum$1(["endTurn", "stopSequence", "maxTokens", "toolUse"]).or(string())),
  role: RoleSchema,
  content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)])
});
const BooleanSchemaSchema = object({
  type: literal("boolean"),
  title: string().optional(),
  description: string().optional(),
  default: boolean().optional()
});
const StringSchemaSchema = object({
  type: literal("string"),
  title: string().optional(),
  description: string().optional(),
  minLength: number$1().optional(),
  maxLength: number$1().optional(),
  format: _enum$1(["email", "uri", "date", "date-time"]).optional(),
  default: string().optional()
});
const NumberSchemaSchema = object({
  type: _enum$1(["number", "integer"]),
  title: string().optional(),
  description: string().optional(),
  minimum: number$1().optional(),
  maximum: number$1().optional(),
  default: number$1().optional()
});
const UntitledSingleSelectEnumSchemaSchema = object({
  type: literal("string"),
  title: string().optional(),
  description: string().optional(),
  enum: array(string()),
  default: string().optional()
});
const TitledSingleSelectEnumSchemaSchema = object({
  type: literal("string"),
  title: string().optional(),
  description: string().optional(),
  oneOf: array(object({
    const: string(),
    title: string()
  })),
  default: string().optional()
});
const LegacyTitledEnumSchemaSchema = object({
  type: literal("string"),
  title: string().optional(),
  description: string().optional(),
  enum: array(string()),
  enumNames: array(string()).optional(),
  default: string().optional()
});
const SingleSelectEnumSchemaSchema = union([UntitledSingleSelectEnumSchemaSchema, TitledSingleSelectEnumSchemaSchema]);
const UntitledMultiSelectEnumSchemaSchema = object({
  type: literal("array"),
  title: string().optional(),
  description: string().optional(),
  minItems: number$1().optional(),
  maxItems: number$1().optional(),
  items: object({
    type: literal("string"),
    enum: array(string())
  }),
  default: array(string()).optional()
});
const TitledMultiSelectEnumSchemaSchema = object({
  type: literal("array"),
  title: string().optional(),
  description: string().optional(),
  minItems: number$1().optional(),
  maxItems: number$1().optional(),
  items: object({
    anyOf: array(object({
      const: string(),
      title: string()
    }))
  }),
  default: array(string()).optional()
});
const MultiSelectEnumSchemaSchema = union([UntitledMultiSelectEnumSchemaSchema, TitledMultiSelectEnumSchemaSchema]);
const EnumSchemaSchema = union([LegacyTitledEnumSchemaSchema, SingleSelectEnumSchemaSchema, MultiSelectEnumSchemaSchema]);
const PrimitiveSchemaDefinitionSchema = union([EnumSchemaSchema, BooleanSchemaSchema, StringSchemaSchema, NumberSchemaSchema]);
const ElicitRequestFormParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  mode: literal("form").optional(),
  message: string(),
  requestedSchema: object({
    type: literal("object"),
    properties: record(string(), PrimitiveSchemaDefinitionSchema),
    required: array(string()).optional()
  })
});
const ElicitRequestURLParamsSchema = TaskAugmentedRequestParamsSchema.extend({
  mode: literal("url"),
  message: string(),
  elicitationId: string(),
  url: string().url()
});
const ElicitRequestParamsSchema = union([ElicitRequestFormParamsSchema, ElicitRequestURLParamsSchema]);
const ElicitRequestSchema = RequestSchema.extend({
  method: literal("elicitation/create"),
  params: ElicitRequestParamsSchema
});
const ElicitationCompleteNotificationParamsSchema = NotificationsParamsSchema.extend({
  elicitationId: string()
});
const ElicitationCompleteNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/elicitation/complete"),
  params: ElicitationCompleteNotificationParamsSchema
});
const ElicitResultSchema = ResultSchema.extend({
  action: _enum$1(["accept", "decline", "cancel"]),
  content: preprocess(v1742 => v1742 === null ? undefined : v1742, record(string(), union([string(), number$1(), boolean(), array(string())])).optional())
});
const ResourceTemplateReferenceSchema = object({
  type: literal("ref/resource"),
  uri: string()
});
const PromptReferenceSchema = object({
  type: literal("ref/prompt"),
  name: string()
});
const CompleteRequestParamsSchema = BaseRequestParamsSchema.extend({
  ref: union([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
  argument: object({
    name: string(),
    value: string()
  }),
  context: object({
    arguments: record(string(), string()).optional()
  }).optional()
});
const CompleteRequestSchema = RequestSchema.extend({
  method: literal("completion/complete"),
  params: CompleteRequestParamsSchema
});
const CompleteResultSchema = ResultSchema.extend({
  completion: looseObject({
    values: array(string()).max(100),
    total: optional(number$1().int()),
    hasMore: optional(boolean())
  })
});
const RootSchema = object({
  uri: string().startsWith("file://"),
  name: string().optional(),
  _meta: record(string(), unknown()).optional()
});
const ListRootsRequestSchema = RequestSchema.extend({
  method: literal("roots/list"),
  params: BaseRequestParamsSchema.optional()
});
const ListRootsResultSchema = ResultSchema.extend({
  roots: array(RootSchema)
});
const RootsListChangedNotificationSchema = NotificationSchema.extend({
  method: literal("notifications/roots/list_changed"),
  params: NotificationsParamsSchema.optional()
});
union([PingRequestSchema, InitializeRequestSchema, CompleteRequestSchema, SetLevelRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ReadResourceRequestSchema, SubscribeRequestSchema, UnsubscribeRequestSchema, CallToolRequestSchema, ListToolsRequestSchema, GetTaskRequestSchema, GetTaskPayloadRequestSchema, ListTasksRequestSchema, CancelTaskRequestSchema]);
union([CancelledNotificationSchema, ProgressNotificationSchema, InitializedNotificationSchema, RootsListChangedNotificationSchema, TaskStatusNotificationSchema]);
union([EmptyResultSchema, CreateMessageResultSchema, CreateMessageResultWithToolsSchema, ElicitResultSchema, ListRootsResultSchema, GetTaskResultSchema, ListTasksResultSchema, CreateTaskResultSchema]);
union([PingRequestSchema, CreateMessageRequestSchema, ElicitRequestSchema, ListRootsRequestSchema, GetTaskRequestSchema, GetTaskPayloadRequestSchema, ListTasksRequestSchema, CancelTaskRequestSchema]);
union([CancelledNotificationSchema, ProgressNotificationSchema, LoggingMessageNotificationSchema, ResourceUpdatedNotificationSchema, ResourceListChangedNotificationSchema, ToolListChangedNotificationSchema, PromptListChangedNotificationSchema, TaskStatusNotificationSchema, ElicitationCompleteNotificationSchema]);
union([EmptyResultSchema, InitializeResultSchema, CompleteResultSchema, GetPromptResultSchema, ListPromptsResultSchema, ListResourcesResultSchema, ListResourceTemplatesResultSchema, ReadResourceResultSchema, CallToolResultSchema, ListToolsResultSchema, GetTaskResultSchema, ListTasksResultSchema, CreateTaskResultSchema]);
class McpError extends Error {
  constructor(v1743, v1744, v1745) {
    super("MCP error " + v1743 + ": " + v1744);
    this.code = v1743;
    this.data = v1745;
    this.name = "McpError";
  }
  static fromError(v1746, v1747, v1748) {
    if (v1746 === exports.ErrorCode.UrlElicitationRequired && v1748) {
      const v1749 = v1748;
      if (v1749.elicitations) {
        return new UrlElicitationRequiredError(v1749.elicitations, v1747);
      }
    }
    return new McpError(v1746, v1747, v1748);
  }
}
class UrlElicitationRequiredError extends McpError {
  constructor(v1750, v1751 = "URL elicitation" + (v1750.length > 1 ? "s" : "") + " required") {
    super(exports.ErrorCode.UrlElicitationRequired, v1751, {
      elicitations: v1750
    });
  }
  get elicitations() {
    return this.data?.elicitations ?? [];
  }
}
function isTerminal(v1752) {
  return v1752 === "completed" || v1752 === "failed" || v1752 === "cancelled";
}
new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
function getMethodLiteral(v1753) {
  const v1754 = getObjectShape(v1753);
  const v1755 = v1754?.method;
  if (!v1755) {
    throw new Error("Schema is missing a method literal");
  }
  const v1756 = getLiteralValue(v1755);
  if (typeof v1756 !== "string") {
    throw new Error("Schema method literal must be a string");
  }
  return v1756;
}
function parseWithCompat(v1757, v1758) {
  const v1759 = safeParse$1(v1757, v1758);
  if (!v1759.success) {
    throw v1759.error;
  }
  return v1759.data;
}
const DEFAULT_REQUEST_TIMEOUT_MSEC = 60000;
class Protocol {
  constructor(v1760) {
    this._options = v1760;
    this._requestMessageId = 0;
    this._requestHandlers = new Map();
    this._requestHandlerAbortControllers = new Map();
    this._notificationHandlers = new Map();
    this._responseHandlers = new Map();
    this._progressHandlers = new Map();
    this._timeoutInfo = new Map();
    this._pendingDebouncedNotifications = new Set();
    this._taskProgressTokens = new Map();
    this._requestResolvers = new Map();
    this.setNotificationHandler(CancelledNotificationSchema, v1761 => {
      this._oncancel(v1761);
    });
    this.setNotificationHandler(ProgressNotificationSchema, v1762 => {
      this._onprogress(v1762);
    });
    this.setRequestHandler(PingRequestSchema, v1763 => ({}));
    this._taskStore = v1760?.taskStore;
    this._taskMessageQueue = v1760?.taskMessageQueue;
    if (this._taskStore) {
      this.setRequestHandler(GetTaskRequestSchema, async (v1764, v1765) => {
        const v1766 = await this._taskStore.getTask(v1764.params.taskId, v1765.sessionId);
        if (!v1766) {
          throw new McpError(exports.ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
        }
        return {
          ...v1766
        };
      });
      this.setRequestHandler(GetTaskPayloadRequestSchema, async (v1767, v1768) => {
        const v1769 = async () => {
          const v1770 = v1767.params.taskId;
          if (this._taskMessageQueue) {
            let v1771;
            while (v1771 = await this._taskMessageQueue.dequeue(v1770, v1768.sessionId)) {
              if (v1771.type === "response" || v1771.type === "error") {
                const v1772 = v1771.message;
                const v1773 = v1772.id;
                const v1774 = this._requestResolvers.get(v1773);
                if (v1774) {
                  this._requestResolvers.delete(v1773);
                  if (v1771.type === "response") {
                    v1774(v1772);
                  } else {
                    const v1775 = v1772;
                    const v1776 = new McpError(v1775.error.code, v1775.error.message, v1775.error.data);
                    v1774(v1776);
                  }
                } else {
                  const v1777 = v1771.type === "response" ? "Response" : "Error";
                  this._onerror(new Error(v1777 + " handler missing for request " + v1773));
                }
                continue;
              }
              await this._transport?.send(v1771.message, {
                relatedRequestId: v1768.requestId
              });
            }
          }
          const v1778 = await this._taskStore.getTask(v1770, v1768.sessionId);
          if (!v1778) {
            throw new McpError(exports.ErrorCode.InvalidParams, "Task not found: " + v1770);
          }
          if (!isTerminal(v1778.status)) {
            await this._waitForTaskUpdate(v1770, v1768.signal);
            return await v1769();
          }
          if (isTerminal(v1778.status)) {
            const v1779 = await this._taskStore.getTaskResult(v1770, v1768.sessionId);
            this._clearTaskQueue(v1770);
            return {
              ...v1779,
              _meta: {
                ...v1779._meta,
                [RELATED_TASK_META_KEY]: {
                  taskId: v1770
                }
              }
            };
          }
          return await v1769();
        };
        return await v1769();
      });
      this.setRequestHandler(ListTasksRequestSchema, async (v1780, v1781) => {
        try {
          const {
            tasks: v1782,
            nextCursor: v1783
          } = await this._taskStore.listTasks(v1780.params?.cursor, v1781.sessionId);
          return {
            tasks: v1782,
            nextCursor: v1783,
            _meta: {}
          };
        } catch (v1784) {
          throw new McpError(exports.ErrorCode.InvalidParams, "Failed to list tasks: " + (v1784 instanceof Error ? v1784.message : String(v1784)));
        }
      });
      this.setRequestHandler(CancelTaskRequestSchema, async (v1785, v1786) => {
        try {
          const v1787 = await this._taskStore.getTask(v1785.params.taskId, v1786.sessionId);
          if (!v1787) {
            throw new McpError(exports.ErrorCode.InvalidParams, "Task not found: " + v1785.params.taskId);
          }
          if (isTerminal(v1787.status)) {
            throw new McpError(exports.ErrorCode.InvalidParams, "Cannot cancel task in terminal status: " + v1787.status);
          }
          await this._taskStore.updateTaskStatus(v1785.params.taskId, "cancelled", "Client cancelled task execution.", v1786.sessionId);
          this._clearTaskQueue(v1785.params.taskId);
          const v1788 = await this._taskStore.getTask(v1785.params.taskId, v1786.sessionId);
          if (!v1788) {
            throw new McpError(exports.ErrorCode.InvalidParams, "Task not found after cancellation: " + v1785.params.taskId);
          }
          return {
            _meta: {},
            ...v1788
          };
        } catch (v1789) {
          if (v1789 instanceof McpError) {
            throw v1789;
          }
          throw new McpError(exports.ErrorCode.InvalidRequest, "Failed to cancel task: " + (v1789 instanceof Error ? v1789.message : String(v1789)));
        }
      });
    }
  }
  async _oncancel(v1790) {
    if (!v1790.params.requestId) {
      return;
    }
    const v1791 = this._requestHandlerAbortControllers.get(v1790.params.requestId);
    v1791?.abort(v1790.params.reason);
  }
  _setupTimeout(v1792, v1793, v1794, v1795, v1796 = false) {
    this._timeoutInfo.set(v1792, {
      timeoutId: setTimeout(v1795, v1793),
      startTime: Date.now(),
      timeout: v1793,
      maxTotalTimeout: v1794,
      resetTimeoutOnProgress: v1796,
      onTimeout: v1795
    });
  }
  _resetTimeout(v1797) {
    const v1798 = this._timeoutInfo.get(v1797);
    if (!v1798) {
      return false;
    }
    const v1799 = Date.now() - v1798.startTime;
    if (v1798.maxTotalTimeout && v1799 >= v1798.maxTotalTimeout) {
      this._timeoutInfo.delete(v1797);
      throw McpError.fromError(exports.ErrorCode.RequestTimeout, "Maximum total timeout exceeded", {
        maxTotalTimeout: v1798.maxTotalTimeout,
        totalElapsed: v1799
      });
    }
    clearTimeout(v1798.timeoutId);
    v1798.timeoutId = setTimeout(v1798.onTimeout, v1798.timeout);
    return true;
  }
  _cleanupTimeout(v1800) {
    const v1801 = this._timeoutInfo.get(v1800);
    if (v1801) {
      clearTimeout(v1801.timeoutId);
      this._timeoutInfo.delete(v1800);
    }
  }
  async connect(v1802) {
    if (this._transport) {
      throw new Error("Already connected to a transport. Call close() before connecting to a new transport, or use a separate Protocol instance per connection.");
    }
    this._transport = v1802;
    const v1803 = this.transport?.onclose;
    this._transport.onclose = () => {
      v1803?.();
      this._onclose();
    };
    const v1804 = this.transport?.onerror;
    this._transport.onerror = v1805 => {
      v1804?.(v1805);
      this._onerror(v1805);
    };
    const v1806 = this._transport?.onmessage;
    this._transport.onmessage = (v1807, v1808) => {
      v1806?.(v1807, v1808);
      if (isJSONRPCResultResponse(v1807) || isJSONRPCErrorResponse(v1807)) {
        this._onresponse(v1807);
      } else if (isJSONRPCRequest(v1807)) {
        this._onrequest(v1807, v1808);
      } else if (isJSONRPCNotification(v1807)) {
        this._onnotification(v1807);
      } else {
        this._onerror(new Error("Unknown message type: " + JSON.stringify(v1807)));
      }
    };
    await this._transport.start();
  }
  _onclose() {
    const v1809 = this._responseHandlers;
    this._responseHandlers = new Map();
    this._progressHandlers.clear();
    this._taskProgressTokens.clear();
    this._pendingDebouncedNotifications.clear();
    for (const v1810 of this._requestHandlerAbortControllers.values()) {
      v1810.abort();
    }
    this._requestHandlerAbortControllers.clear();
    const v1811 = McpError.fromError(exports.ErrorCode.ConnectionClosed, "Connection closed");
    this._transport = undefined;
    this.onclose?.();
    for (const v1812 of v1809.values()) {
      v1812(v1811);
    }
  }
  _onerror(v1813) {
    this.onerror?.(v1813);
  }
  _onnotification(v1814) {
    const v1815 = this._notificationHandlers.get(v1814.method) ?? this.fallbackNotificationHandler;
    if (v1815 === undefined) {
      return;
    }
    Promise.resolve().then(() => v1815(v1814)).catch(v1816 => this._onerror(new Error("Uncaught error in notification handler: " + v1816)));
  }
  _onrequest(v1817, v1818) {
    const v1819 = this._requestHandlers.get(v1817.method) ?? this.fallbackRequestHandler;
    const v1820 = this._transport;
    const v1821 = v1817.params?._meta?.[RELATED_TASK_META_KEY]?.taskId;
    if (v1819 === undefined) {
      const v1822 = {
        jsonrpc: "2.0",
        id: v1817.id,
        error: {
          code: exports.ErrorCode.MethodNotFound,
          message: "Method not found"
        }
      };
      if (v1821 && this._taskMessageQueue) {
        this._enqueueTaskMessage(v1821, {
          type: "error",
          message: v1822,
          timestamp: Date.now()
        }, v1820?.sessionId).catch(v1823 => this._onerror(new Error("Failed to enqueue error response: " + v1823)));
      } else {
        v1820?.send(v1822).catch(v1824 => this._onerror(new Error("Failed to send an error response: " + v1824)));
      }
      return;
    }
    const v1825 = new AbortController();
    this._requestHandlerAbortControllers.set(v1817.id, v1825);
    const v1826 = isTaskAugmentedRequestParams(v1817.params) ? v1817.params.task : undefined;
    const v1827 = this._taskStore ? this.requestTaskStore(v1817, v1820?.sessionId) : undefined;
    const v1828 = {
      signal: v1825.signal,
      sessionId: v1820?.sessionId,
      _meta: v1817.params?._meta,
      sendNotification: async v1829 => {
        if (v1825.signal.aborted) {
          return;
        }
        const v1830 = {
          relatedRequestId: v1817.id
        };
        if (v1821) {
          v1830.relatedTask = {
            taskId: v1821
          };
        }
        await this.notification(v1829, v1830);
      },
      sendRequest: async (v1831, v1832, v1833) => {
        if (v1825.signal.aborted) {
          throw new McpError(exports.ErrorCode.ConnectionClosed, "Request was cancelled");
        }
        const v1834 = {
          ...v1833,
          relatedRequestId: v1817.id
        };
        if (v1821 && !v1834.relatedTask) {
          v1834.relatedTask = {
            taskId: v1821
          };
        }
        const v1835 = v1834.relatedTask?.taskId ?? v1821;
        if (v1835 && v1827) {
          await v1827.updateTaskStatus(v1835, "input_required");
        }
        return await this.request(v1831, v1832, v1834);
      },
      authInfo: v1818?.authInfo,
      requestId: v1817.id,
      requestInfo: v1818?.requestInfo,
      taskId: v1821,
      taskStore: v1827,
      taskRequestedTtl: v1826?.ttl,
      closeSSEStream: v1818?.closeSSEStream,
      closeStandaloneSSEStream: v1818?.closeStandaloneSSEStream
    };
    Promise.resolve().then(() => {
      if (v1826) {
        this.assertTaskHandlerCapability(v1817.method);
      }
    }).then(() => v1819(v1817, v1828)).then(async v1836 => {
      if (v1825.signal.aborted) {
        return;
      }
      const v1837 = {
        result: v1836,
        jsonrpc: "2.0",
        id: v1817.id
      };
      if (v1821 && this._taskMessageQueue) {
        await this._enqueueTaskMessage(v1821, {
          type: "response",
          message: v1837,
          timestamp: Date.now()
        }, v1820?.sessionId);
      } else {
        await v1820?.send(v1837);
      }
    }, async v1838 => {
      if (v1825.signal.aborted) {
        return;
      }
      const v1839 = {
        jsonrpc: "2.0",
        id: v1817.id,
        error: {
          code: Number.isSafeInteger(v1838.code) ? v1838.code : exports.ErrorCode.InternalError,
          message: v1838.message ?? "Internal error",
          ...(v1838.data !== undefined && {
            data: v1838.data
          })
        }
      };
      if (v1821 && this._taskMessageQueue) {
        await this._enqueueTaskMessage(v1821, {
          type: "error",
          message: v1839,
          timestamp: Date.now()
        }, v1820?.sessionId);
      } else {
        await v1820?.send(v1839);
      }
    }).catch(v1840 => this._onerror(new Error("Failed to send response: " + v1840))).finally(() => {
      this._requestHandlerAbortControllers.delete(v1817.id);
    });
  }
  _onprogress(v1841) {
    const {
      progressToken: v1842,
      ...v1843
    } = v1841.params;
    const v1844 = Number(v1842);
    const v1845 = this._progressHandlers.get(v1844);
    if (!v1845) {
      this._onerror(new Error("Received a progress notification for an unknown token: " + JSON.stringify(v1841)));
      return;
    }
    const v1846 = this._responseHandlers.get(v1844);
    const v1847 = this._timeoutInfo.get(v1844);
    if (v1847 && v1846 && v1847.resetTimeoutOnProgress) {
      try {
        this._resetTimeout(v1844);
      } catch (v1848) {
        this._responseHandlers.delete(v1844);
        this._progressHandlers.delete(v1844);
        this._cleanupTimeout(v1844);
        v1846(v1848);
        return;
      }
    }
    v1845(v1843);
  }
  _onresponse(v1849) {
    const v1850 = Number(v1849.id);
    const v1851 = this._requestResolvers.get(v1850);
    if (v1851) {
      this._requestResolvers.delete(v1850);
      if (isJSONRPCResultResponse(v1849)) {
        v1851(v1849);
      } else {
        const v1852 = new McpError(v1849.error.code, v1849.error.message, v1849.error.data);
        v1851(v1852);
      }
      return;
    }
    const v1853 = this._responseHandlers.get(v1850);
    if (v1853 === undefined) {
      this._onerror(new Error("Received a response for an unknown message ID: " + JSON.stringify(v1849)));
      return;
    }
    this._responseHandlers.delete(v1850);
    this._cleanupTimeout(v1850);
    let v1854 = false;
    if (isJSONRPCResultResponse(v1849) && v1849.result && typeof v1849.result === "object") {
      const v1855 = v1849.result;
      if (v1855.task && typeof v1855.task === "object") {
        const v1856 = v1855.task;
        if (typeof v1856.taskId === "string") {
          v1854 = true;
          this._taskProgressTokens.set(v1856.taskId, v1850);
        }
      }
    }
    if (!v1854) {
      this._progressHandlers.delete(v1850);
    }
    if (isJSONRPCResultResponse(v1849)) {
      v1853(v1849);
    } else {
      const v1857 = McpError.fromError(v1849.error.code, v1849.error.message, v1849.error.data);
      v1853(v1857);
    }
  }
  get transport() {
    return this._transport;
  }
  async close() {
    await this._transport?.close();
  }
  async *requestStream(v1858, v1859, v1860) {
    const {
      task: v1861
    } = v1860 ?? {};
    if (!v1861) {
      try {
        const v1862 = await this.request(v1858, v1859, v1860);
        yield {
          type: "result",
          result: v1862
        };
      } catch (v1863) {
        yield {
          type: "error",
          error: v1863 instanceof McpError ? v1863 : new McpError(exports.ErrorCode.InternalError, String(v1863))
        };
      }
      return;
    }
    let v1864;
    try {
      const v1865 = await this.request(v1858, CreateTaskResultSchema, v1860);
      if (v1865.task) {
        v1864 = v1865.task.taskId;
        yield {
          type: "taskCreated",
          task: v1865.task
        };
      } else {
        throw new McpError(exports.ErrorCode.InternalError, "Task creation did not return a task");
      }
      while (true) {
        const v1866 = await this.getTask({
          taskId: v1864
        }, v1860);
        yield {
          type: "taskStatus",
          task: v1866
        };
        if (isTerminal(v1866.status)) {
          if (v1866.status === "completed") {
            const v1867 = await this.getTaskResult({
              taskId: v1864
            }, v1859, v1860);
            yield {
              type: "result",
              result: v1867
            };
          } else if (v1866.status === "failed") {
            yield {
              type: "error",
              error: new McpError(exports.ErrorCode.InternalError, "Task " + v1864 + " failed")
            };
          } else if (v1866.status === "cancelled") {
            yield {
              type: "error",
              error: new McpError(exports.ErrorCode.InternalError, "Task " + v1864 + " was cancelled")
            };
          }
          return;
        }
        if (v1866.status === "input_required") {
          const v1868 = await this.getTaskResult({
            taskId: v1864
          }, v1859, v1860);
          yield {
            type: "result",
            result: v1868
          };
          return;
        }
        const v1869 = v1866.pollInterval ?? this._options?.defaultTaskPollInterval ?? 1000;
        await new Promise(v1870 => setTimeout(v1870, v1869));
        v1860?.signal?.throwIfAborted();
      }
    } catch (v1871) {
      yield {
        type: "error",
        error: v1871 instanceof McpError ? v1871 : new McpError(exports.ErrorCode.InternalError, String(v1871))
      };
    }
  }
  request(v1872, v1873, v1874) {
    const {
      relatedRequestId: v1875,
      resumptionToken: v1876,
      onresumptiontoken: v1877,
      task: v1878,
      relatedTask: v1879
    } = v1874 ?? {};
    return new Promise((v1880, v1881) => {
      const v1882 = v1883 => {
        v1881(v1883);
      };
      if (!this._transport) {
        v1882(new Error("Not connected"));
        return;
      }
      if (this._options?.enforceStrictCapabilities === true) {
        try {
          this.assertCapabilityForMethod(v1872.method);
          if (v1878) {
            this.assertTaskCapability(v1872.method);
          }
        } catch (v1884) {
          v1882(v1884);
          return;
        }
      }
      v1874?.signal?.throwIfAborted();
      const v1885 = this._requestMessageId++;
      const v1886 = {
        ...v1872,
        jsonrpc: "2.0",
        id: v1885
      };
      if (v1874?.onprogress) {
        this._progressHandlers.set(v1885, v1874.onprogress);
        v1886.params = {
          ...v1872.params,
          _meta: {
            ...(v1872.params?._meta || {}),
            progressToken: v1885
          }
        };
      }
      if (v1878) {
        v1886.params = {
          ...v1886.params,
          task: v1878
        };
      }
      if (v1879) {
        v1886.params = {
          ...v1886.params,
          _meta: {
            ...(v1886.params?._meta || {}),
            [RELATED_TASK_META_KEY]: v1879
          }
        };
      }
      const v1887 = v1888 => {
        this._responseHandlers.delete(v1885);
        this._progressHandlers.delete(v1885);
        this._cleanupTimeout(v1885);
        this._transport?.send({
          jsonrpc: "2.0",
          method: "notifications/cancelled",
          params: {
            requestId: v1885,
            reason: String(v1888)
          }
        }, {
          relatedRequestId: v1875,
          resumptionToken: v1876,
          onresumptiontoken: v1877
        }).catch(v1889 => this._onerror(new Error("Failed to send cancellation: " + v1889)));
        const v1890 = v1888 instanceof McpError ? v1888 : new McpError(exports.ErrorCode.RequestTimeout, String(v1888));
        v1881(v1890);
      };
      this._responseHandlers.set(v1885, v1891 => {
        if (v1874?.signal?.aborted) {
          return;
        }
        if (v1891 instanceof Error) {
          return v1881(v1891);
        }
        try {
          const v1892 = safeParse$1(v1873, v1891.result);
          if (!v1892.success) {
            v1881(v1892.error);
          } else {
            v1880(v1892.data);
          }
        } catch (v1893) {
          v1881(v1893);
        }
      });
      v1874?.signal?.addEventListener("abort", () => {
        v1887(v1874?.signal?.reason);
      });
      const v1894 = v1874?.timeout ?? DEFAULT_REQUEST_TIMEOUT_MSEC;
      const v1895 = () => v1887(McpError.fromError(exports.ErrorCode.RequestTimeout, "Request timed out", {
        timeout: v1894
      }));
      this._setupTimeout(v1885, v1894, v1874?.maxTotalTimeout, v1895, v1874?.resetTimeoutOnProgress ?? false);
      const v1896 = v1879?.taskId;
      if (v1896) {
        const v1897 = v1898 => {
          const v1899 = this._responseHandlers.get(v1885);
          if (v1899) {
            v1899(v1898);
          } else {
            this._onerror(new Error("Response handler missing for side-channeled request " + v1885));
          }
        };
        this._requestResolvers.set(v1885, v1897);
        this._enqueueTaskMessage(v1896, {
          type: "request",
          message: v1886,
          timestamp: Date.now()
        }).catch(v1900 => {
          this._cleanupTimeout(v1885);
          v1881(v1900);
        });
      } else {
        this._transport.send(v1886, {
          relatedRequestId: v1875,
          resumptionToken: v1876,
          onresumptiontoken: v1877
        }).catch(v1901 => {
          this._cleanupTimeout(v1885);
          v1881(v1901);
        });
      }
    });
  }
  async getTask(v1902, v1903) {
    return this.request({
      method: "tasks/get",
      params: v1902
    }, GetTaskResultSchema, v1903);
  }
  async getTaskResult(v1904, v1905, v1906) {
    return this.request({
      method: "tasks/result",
      params: v1904
    }, v1905, v1906);
  }
  async listTasks(v1907, v1908) {
    return this.request({
      method: "tasks/list",
      params: v1907
    }, ListTasksResultSchema, v1908);
  }
  async cancelTask(v1909, v1910) {
    return this.request({
      method: "tasks/cancel",
      params: v1909
    }, CancelTaskResultSchema, v1910);
  }
  async notification(v1911, v1912) {
    if (!this._transport) {
      throw new Error("Not connected");
    }
    this.assertNotificationCapability(v1911.method);
    const v1913 = v1912?.relatedTask?.taskId;
    if (v1913) {
      const v1914 = {
        ...v1911,
        jsonrpc: "2.0",
        params: {
          ...v1911.params,
          _meta: {
            ...(v1911.params?._meta || {}),
            [RELATED_TASK_META_KEY]: v1912.relatedTask
          }
        }
      };
      await this._enqueueTaskMessage(v1913, {
        type: "notification",
        message: v1914,
        timestamp: Date.now()
      });
      return;
    }
    const v1915 = this._options?.debouncedNotificationMethods ?? [];
    const v1916 = v1915.includes(v1911.method) && !v1911.params && !v1912?.relatedRequestId && !v1912?.relatedTask;
    if (v1916) {
      if (this._pendingDebouncedNotifications.has(v1911.method)) {
        return;
      }
      this._pendingDebouncedNotifications.add(v1911.method);
      Promise.resolve().then(() => {
        this._pendingDebouncedNotifications.delete(v1911.method);
        if (!this._transport) {
          return;
        }
        let v1917 = {
          ...v1911,
          jsonrpc: "2.0"
        };
        if (v1912?.relatedTask) {
          v1917 = {
            ...v1917,
            params: {
              ...v1917.params,
              _meta: {
                ...(v1917.params?._meta || {}),
                [RELATED_TASK_META_KEY]: v1912.relatedTask
              }
            }
          };
        }
        this._transport?.send(v1917, v1912).catch(v1918 => this._onerror(v1918));
      });
      return;
    }
    let v1919 = {
      ...v1911,
      jsonrpc: "2.0"
    };
    if (v1912?.relatedTask) {
      v1919 = {
        ...v1919,
        params: {
          ...v1919.params,
          _meta: {
            ...(v1919.params?._meta || {}),
            [RELATED_TASK_META_KEY]: v1912.relatedTask
          }
        }
      };
    }
    await this._transport.send(v1919, v1912);
  }
  setRequestHandler(v1920, v1921) {
    const v1922 = getMethodLiteral(v1920);
    this.assertRequestHandlerCapability(v1922);
    this._requestHandlers.set(v1922, (v1923, v1924) => {
      const v1925 = parseWithCompat(v1920, v1923);
      return Promise.resolve(v1921(v1925, v1924));
    });
  }
  removeRequestHandler(v1926) {
    this._requestHandlers.delete(v1926);
  }
  assertCanSetRequestHandler(v1927) {
    if (this._requestHandlers.has(v1927)) {
      throw new Error("A request handler for " + v1927 + " already exists, which would be overridden");
    }
  }
  setNotificationHandler(v1928, v1929) {
    const v1930 = getMethodLiteral(v1928);
    this._notificationHandlers.set(v1930, v1931 => {
      const v1932 = parseWithCompat(v1928, v1931);
      return Promise.resolve(v1929(v1932));
    });
  }
  removeNotificationHandler(v1933) {
    this._notificationHandlers.delete(v1933);
  }
  _cleanupTaskProgressHandler(v1934) {
    const v1935 = this._taskProgressTokens.get(v1934);
    if (v1935 !== undefined) {
      this._progressHandlers.delete(v1935);
      this._taskProgressTokens.delete(v1934);
    }
  }
  async _enqueueTaskMessage(v1936, v1937, v1938) {
    if (!this._taskStore || !this._taskMessageQueue) {
      throw new Error("Cannot enqueue task message: taskStore and taskMessageQueue are not configured");
    }
    const v1939 = this._options?.maxTaskQueueSize;
    await this._taskMessageQueue.enqueue(v1936, v1937, v1938, v1939);
  }
  async _clearTaskQueue(v1940, v1941) {
    if (this._taskMessageQueue) {
      const v1942 = await this._taskMessageQueue.dequeueAll(v1940, v1941);
      for (const v1943 of v1942) {
        if (v1943.type === "request" && isJSONRPCRequest(v1943.message)) {
          const v1944 = v1943.message.id;
          const v1945 = this._requestResolvers.get(v1944);
          if (v1945) {
            v1945(new McpError(exports.ErrorCode.InternalError, "Task cancelled or completed"));
            this._requestResolvers.delete(v1944);
          } else {
            this._onerror(new Error("Resolver missing for request " + v1944 + " during task " + v1940 + " cleanup"));
          }
        }
      }
    }
  }
  async _waitForTaskUpdate(v1946, v1947) {
    let v1948 = this._options?.defaultTaskPollInterval ?? 1000;
    try {
      const v1949 = await this._taskStore?.getTask(v1946);
      if (v1949?.pollInterval) {
        v1948 = v1949.pollInterval;
      }
    } catch {}
    return new Promise((v1950, v1951) => {
      if (v1947.aborted) {
        v1951(new McpError(exports.ErrorCode.InvalidRequest, "Request cancelled"));
        return;
      }
      const v1952 = setTimeout(v1950, v1948);
      v1947.addEventListener("abort", () => {
        clearTimeout(v1952);
        v1951(new McpError(exports.ErrorCode.InvalidRequest, "Request cancelled"));
      }, {
        once: true
      });
    });
  }
  requestTaskStore(v1953, v1954) {
    const v1955 = this._taskStore;
    if (!v1955) {
      throw new Error("No task store configured");
    }
    return {
      createTask: async v1956 => {
        if (!v1953) {
          throw new Error("No request provided");
        }
        return await v1955.createTask(v1956, v1953.id, {
          method: v1953.method,
          params: v1953.params
        }, v1954);
      },
      getTask: async v1957 => {
        const v1958 = await v1955.getTask(v1957, v1954);
        if (!v1958) {
          throw new McpError(exports.ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
        }
        return v1958;
      },
      storeTaskResult: async (v1959, v1960, v1961) => {
        await v1955.storeTaskResult(v1959, v1960, v1961, v1954);
        const v1962 = await v1955.getTask(v1959, v1954);
        if (v1962) {
          const v1963 = TaskStatusNotificationSchema.parse({
            method: "notifications/tasks/status",
            params: v1962
          });
          await this.notification(v1963);
          if (isTerminal(v1962.status)) {
            this._cleanupTaskProgressHandler(v1959);
          }
        }
      },
      getTaskResult: v1964 => {
        return v1955.getTaskResult(v1964, v1954);
      },
      updateTaskStatus: async (v1965, v1966, v1967) => {
        const v1968 = await v1955.getTask(v1965, v1954);
        if (!v1968) {
          throw new McpError(exports.ErrorCode.InvalidParams, "Task \"" + v1965 + "\" not found - it may have been cleaned up");
        }
        if (isTerminal(v1968.status)) {
          throw new McpError(exports.ErrorCode.InvalidParams, "Cannot update task \"" + v1965 + "\" from terminal status \"" + v1968.status + "\" to \"" + v1966 + "\". Terminal states (completed, failed, cancelled) cannot transition to other states.");
        }
        await v1955.updateTaskStatus(v1965, v1966, v1967, v1954);
        const v1969 = await v1955.getTask(v1965, v1954);
        if (v1969) {
          const v1970 = TaskStatusNotificationSchema.parse({
            method: "notifications/tasks/status",
            params: v1969
          });
          await this.notification(v1970);
          if (isTerminal(v1969.status)) {
            this._cleanupTaskProgressHandler(v1965);
          }
        }
      },
      listTasks: v1971 => {
        return v1955.listTasks(v1971, v1954);
      }
    };
  }
}
function isPlainObject(v1972) {
  return v1972 !== null && typeof v1972 === "object" && !Array.isArray(v1972);
}
function mergeCapabilities(v1973, v1974) {
  const v1975 = {
    ...v1973
  };
  for (const v1976 in v1974) {
    const v1977 = v1976;
    const v1978 = v1974[v1977];
    if (v1978 === undefined) {
      continue;
    }
    const v1979 = v1975[v1977];
    if (isPlainObject(v1979) && isPlainObject(v1978)) {
      v1975[v1977] = {
        ...v1979,
        ...v1978
      };
    } else {
      v1975[v1977] = v1978;
    }
  }
  return v1975;
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(v1980) {
  if (v1980 && v1980.__esModule && Object.prototype.hasOwnProperty.call(v1980, "default")) {
    return v1980.default;
  } else {
    return v1980;
  }
}
var ajv = {
  exports: {}
};
var core$1 = {};
var validate = {};
var boolSchema = {};
var errors = {};
var codegen = {};
var code$1 = {};
var hasRequiredCode$1;
function requireCode$1() {
  if (hasRequiredCode$1) {
    return code$1;
  }
  hasRequiredCode$1 = 1;
  (function (v1981) {
    Object.defineProperty(v1981, "__esModule", {
      value: true
    });
    v1981.regexpCode = v1981.getEsmExportName = v1981.getProperty = v1981.safeStringify = v1981.stringify = v1981.strConcat = v1981.addCodeArg = v1981.str = v1981._ = v1981.nil = v1981._Code = v1981.Name = v1981.IDENTIFIER = v1981._CodeOrName = undefined;
    class v1982 {}
    v1981._CodeOrName = v1982;
    v1981.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class v1983 extends v1982 {
      constructor(v1984) {
        super();
        if (!v1981.IDENTIFIER.test(v1984)) {
          throw new Error("CodeGen: name must be a valid identifier");
        }
        this.str = v1984;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return false;
      }
      get names() {
        return {
          [this.str]: 1
        };
      }
    }
    v1981.Name = v1983;
    class v1985 extends v1982 {
      constructor(v1986) {
        super();
        this._items = typeof v1986 === "string" ? [v1986] : v1986;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1) {
          return false;
        }
        const v1987 = this._items[0];
        return v1987 === "" || v1987 === "\"\"";
      }
      get str() {
        return this._str ??= this._items.reduce((v1988, v1989) => "" + v1988 + v1989, "");
      }
      get names() {
        return this._names ??= this._items.reduce((v1990, v1991) => {
          if (v1991 instanceof v1983) {
            v1990[v1991.str] = (v1990[v1991.str] || 0) + 1;
          }
          return v1990;
        }, {});
      }
    }
    v1981._Code = v1985;
    v1981.nil = new v1985("");
    function v1992(v1993, ...v1994) {
      const v1995 = [v1993[0]];
      let v1996 = 0;
      while (v1996 < v1994.length) {
        v1997(v1995, v1994[v1996]);
        v1995.push(v1993[++v1996]);
      }
      return new v1985(v1995);
    }
    v1981._ = v1992;
    const v1998 = new v1985("+");
    function v1999(v2000, ...v2001) {
      const v2002 = [v2003(v2000[0])];
      let v2004 = 0;
      while (v2004 < v2001.length) {
        v2002.push(v1998);
        v1997(v2002, v2001[v2004]);
        v2002.push(v1998, v2003(v2000[++v2004]));
      }
      v2005(v2002);
      return new v1985(v2002);
    }
    v1981.str = v1999;
    function v1997(v2006, v2007) {
      if (v2007 instanceof v1985) {
        v2006.push(...v2007._items);
      } else if (v2007 instanceof v1983) {
        v2006.push(v2007);
      } else {
        v2006.push(v2008(v2007));
      }
    }
    v1981.addCodeArg = v1997;
    function v2005(v2009) {
      let v2010 = 1;
      while (v2010 < v2009.length - 1) {
        if (v2009[v2010] === v1998) {
          const v2011 = v2012(v2009[v2010 - 1], v2009[v2010 + 1]);
          if (v2011 !== undefined) {
            v2009.splice(v2010 - 1, 3, v2011);
            continue;
          }
          v2009[v2010++] = "+";
        }
        v2010++;
      }
    }
    function v2012(v2013, v2014) {
      if (v2014 === "\"\"") {
        return v2013;
      }
      if (v2013 === "\"\"") {
        return v2014;
      }
      if (typeof v2013 == "string") {
        if (v2014 instanceof v1983 || v2013[v2013.length - 1] !== "\"") {
          return;
        }
        if (typeof v2014 != "string") {
          return "" + v2013.slice(0, -1) + v2014 + "\"";
        }
        if (v2014[0] === "\"") {
          return v2013.slice(0, -1) + v2014.slice(1);
        }
        return;
      }
      if (typeof v2014 == "string" && v2014[0] === "\"" && !(v2013 instanceof v1983)) {
        return "\"" + v2013 + v2014.slice(1);
      }
      return;
    }
    function v2015(v2016, v2017) {
      if (v2017.emptyStr()) {
        return v2016;
      } else if (v2016.emptyStr()) {
        return v2017;
      } else {
        return v1999`${v2016}${v2017}`;
      }
    }
    v1981.strConcat = v2015;
    function v2008(v2018) {
      if (typeof v2018 == "number" || typeof v2018 == "boolean" || v2018 === null) {
        return v2018;
      } else {
        return v2003(Array.isArray(v2018) ? v2018.join(",") : v2018);
      }
    }
    function v2019(v2020) {
      return new v1985(v2003(v2020));
    }
    v1981.stringify = v2019;
    function v2003(v2021) {
      return JSON.stringify(v2021).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    v1981.safeStringify = v2003;
    function v2022(v2023) {
      if (typeof v2023 == "string" && v1981.IDENTIFIER.test(v2023)) {
        return new v1985("." + v2023);
      } else {
        return v1992`[${v2023}]`;
      }
    }
    v1981.getProperty = v2022;
    function v2024(v2025) {
      if (typeof v2025 == "string" && v1981.IDENTIFIER.test(v2025)) {
        return new v1985("" + v2025);
      }
      throw new Error("CodeGen: invalid export name: " + v2025 + ", use explicit $id name mapping");
    }
    v1981.getEsmExportName = v2024;
    function v2026(v2027) {
      return new v1985(v2027.toString());
    }
    v1981.regexpCode = v2026;
  })(code$1);
  return code$1;
}
var scope = {};
var hasRequiredScope;
function requireScope() {
  if (hasRequiredScope) {
    return scope;
  }
  hasRequiredScope = 1;
  (function (v2028) {
    Object.defineProperty(v2028, "__esModule", {
      value: true
    });
    v2028.ValueScope = v2028.ValueScopeName = v2028.Scope = v2028.varKinds = v2028.UsedValueState = undefined;
    const v2029 = requireCode$1();
    class v2030 extends Error {
      constructor(v2031) {
        super("CodeGen: \"code\" for " + v2031 + " not defined");
        this.value = v2031.value;
      }
    }
    var v2032;
    (function (v2033) {
      v2033[v2033.Started = 0] = "Started";
      v2033[v2033.Completed = 1] = "Completed";
    })(v2032 || (v2028.UsedValueState = v2032 = {}));
    v2028.varKinds = {
      const: new v2029.Name("const"),
      let: new v2029.Name("let"),
      var: new v2029.Name("var")
    };
    class v2034 {
      constructor({
        prefixes: v2035,
        parent: v2036
      } = {}) {
        this._names = {};
        this._prefixes = v2035;
        this._parent = v2036;
      }
      toName(v2037) {
        if (v2037 instanceof v2029.Name) {
          return v2037;
        } else {
          return this.name(v2037);
        }
      }
      name(v2038) {
        return new v2029.Name(this._newName(v2038));
      }
      _newName(v2039) {
        const v2040 = this._names[v2039] || this._nameGroup(v2039);
        return "" + v2039 + v2040.index++;
      }
      _nameGroup(v2041) {
        var v2042;
        if (((v2042 = this._parent?._prefixes) === null || v2042 === undefined ? undefined : v2042.has(v2041)) || this._prefixes && !this._prefixes.has(v2041)) {
          throw new Error("CodeGen: prefix \"" + v2041 + "\" is not allowed in this scope");
        }
        return this._names[v2041] = {
          prefix: v2041,
          index: 0
        };
      }
    }
    v2028.Scope = v2034;
    class v2043 extends v2029.Name {
      constructor(v2044, v2045) {
        super(v2045);
        this.prefix = v2044;
      }
      setValue(v2046, {
        property: v2047,
        itemIndex: v2048
      }) {
        this.value = v2046;
        this.scopePath = (0, v2029._)`.${new v2029.Name(v2047)}[${v2048}]`;
      }
    }
    v2028.ValueScopeName = v2043;
    const v2049 = (0, v2029._)`\n`;
    class v2050 extends v2034 {
      constructor(v2051) {
        super(v2051);
        this._values = {};
        this._scope = v2051.scope;
        this.opts = {
          ...v2051,
          _n: v2051.lines ? v2049 : v2029.nil
        };
      }
      get() {
        return this._scope;
      }
      name(v2052) {
        return new v2043(v2052, this._newName(v2052));
      }
      value(v2053, v2054) {
        if (v2054.ref === undefined) {
          throw new Error("CodeGen: ref must be passed in value");
        }
        const v2055 = this.toName(v2053);
        const {
          prefix: v2056
        } = v2055;
        const v2057 = v2054.key ?? v2054.ref;
        let v2058 = this._values[v2056];
        if (v2058) {
          const v2059 = v2058.get(v2057);
          if (v2059) {
            return v2059;
          }
        } else {
          v2058 = this._values[v2056] = new Map();
        }
        v2058.set(v2057, v2055);
        const v2060 = this._scope[v2056] ||= [];
        const v2061 = v2060.length;
        v2060[v2061] = v2054.ref;
        v2055.setValue(v2054, {
          property: v2056,
          itemIndex: v2061
        });
        return v2055;
      }
      getValue(v2062, v2063) {
        const v2064 = this._values[v2062];
        if (!v2064) {
          return;
        }
        return v2064.get(v2063);
      }
      scopeRefs(v2065, v2066 = this._values) {
        return this._reduceValues(v2066, v2067 => {
          if (v2067.scopePath === undefined) {
            throw new Error("CodeGen: name \"" + v2067 + "\" has no value");
          }
          return (0, v2029._)`${v2065}${v2067.scopePath}`;
        });
      }
      scopeCode(v2068 = this._values, v2069, v2070) {
        return this._reduceValues(v2068, v2071 => {
          if (v2071.value === undefined) {
            throw new Error("CodeGen: name \"" + v2071 + "\" has no value");
          }
          return v2071.value.code;
        }, v2069, v2070);
      }
      _reduceValues(v2072, v2073, v2074 = {}, v2075) {
        let v2076 = v2029.nil;
        for (const v2077 in v2072) {
          const v2078 = v2072[v2077];
          if (!v2078) {
            continue;
          }
          const v2079 = v2074[v2077] = v2074[v2077] || new Map();
          v2078.forEach(v2080 => {
            if (v2079.has(v2080)) {
              return;
            }
            v2079.set(v2080, v2032.Started);
            let v2081 = v2073(v2080);
            if (v2081) {
              const v2082 = this.opts.es5 ? v2028.varKinds.var : v2028.varKinds.const;
              v2076 = (0, v2029._)`${v2076}${v2082} ${v2080} = ${v2081};${this.opts._n}`;
            } else if (v2081 = v2075 === null || v2075 === undefined ? undefined : v2075(v2080)) {
              v2076 = (0, v2029._)`${v2076}${v2081}${this.opts._n}`;
            } else {
              throw new v2030(v2080);
            }
            v2079.set(v2080, v2032.Completed);
          });
        }
        return v2076;
      }
    }
    v2028.ValueScope = v2050;
  })(scope);
  return scope;
}
var hasRequiredCodegen;
function requireCodegen() {
  if (hasRequiredCodegen) {
    return codegen;
  }
  hasRequiredCodegen = 1;
  (function (v2083) {
    Object.defineProperty(v2083, "__esModule", {
      value: true
    });
    v2083.or = v2083.and = v2083.not = v2083.CodeGen = v2083.operators = v2083.varKinds = v2083.ValueScopeName = v2083.ValueScope = v2083.Scope = v2083.Name = v2083.regexpCode = v2083.stringify = v2083.getProperty = v2083.nil = v2083.strConcat = v2083.str = v2083._ = undefined;
    const v2084 = requireCode$1();
    const v2085 = requireScope();
    var v2086 = requireCode$1();
    Object.defineProperty(v2083, "_", {
      enumerable: true,
      get: function () {
        return v2086._;
      }
    });
    Object.defineProperty(v2083, "str", {
      enumerable: true,
      get: function () {
        return v2086.str;
      }
    });
    Object.defineProperty(v2083, "strConcat", {
      enumerable: true,
      get: function () {
        return v2086.strConcat;
      }
    });
    Object.defineProperty(v2083, "nil", {
      enumerable: true,
      get: function () {
        return v2086.nil;
      }
    });
    Object.defineProperty(v2083, "getProperty", {
      enumerable: true,
      get: function () {
        return v2086.getProperty;
      }
    });
    Object.defineProperty(v2083, "stringify", {
      enumerable: true,
      get: function () {
        return v2086.stringify;
      }
    });
    Object.defineProperty(v2083, "regexpCode", {
      enumerable: true,
      get: function () {
        return v2086.regexpCode;
      }
    });
    Object.defineProperty(v2083, "Name", {
      enumerable: true,
      get: function () {
        return v2086.Name;
      }
    });
    var v2087 = requireScope();
    Object.defineProperty(v2083, "Scope", {
      enumerable: true,
      get: function () {
        return v2087.Scope;
      }
    });
    Object.defineProperty(v2083, "ValueScope", {
      enumerable: true,
      get: function () {
        return v2087.ValueScope;
      }
    });
    Object.defineProperty(v2083, "ValueScopeName", {
      enumerable: true,
      get: function () {
        return v2087.ValueScopeName;
      }
    });
    Object.defineProperty(v2083, "varKinds", {
      enumerable: true,
      get: function () {
        return v2087.varKinds;
      }
    });
    v2083.operators = {
      GT: new v2084._Code(">"),
      GTE: new v2084._Code(">="),
      LT: new v2084._Code("<"),
      LTE: new v2084._Code("<="),
      EQ: new v2084._Code("==="),
      NEQ: new v2084._Code("!=="),
      NOT: new v2084._Code("!"),
      OR: new v2084._Code("||"),
      AND: new v2084._Code("&&"),
      ADD: new v2084._Code("+")
    };
    class v2088 {
      optimizeNodes() {
        return this;
      }
      optimizeNames(v2089, v2090) {
        return this;
      }
    }
    class v2091 extends v2088 {
      constructor(v2092, v2093, v2094) {
        super();
        this.varKind = v2092;
        this.name = v2093;
        this.rhs = v2094;
      }
      render({
        es5: v2095,
        _n: v2096
      }) {
        const v2097 = v2095 ? v2085.varKinds.var : this.varKind;
        const v2098 = this.rhs === undefined ? "" : " = " + this.rhs;
        return v2097 + " " + this.name + v2098 + ";" + v2096;
      }
      optimizeNames(v2099, v2100) {
        if (!v2099[this.name.str]) {
          return;
        }
        if (this.rhs) {
          this.rhs = v2101(this.rhs, v2099, v2100);
        }
        return this;
      }
      get names() {
        if (this.rhs instanceof v2084._CodeOrName) {
          return this.rhs.names;
        } else {
          return {};
        }
      }
    }
    class v2102 extends v2088 {
      constructor(v2103, v2104, v2105) {
        super();
        this.lhs = v2103;
        this.rhs = v2104;
        this.sideEffects = v2105;
      }
      render({
        _n: v2106
      }) {
        return this.lhs + " = " + this.rhs + ";" + v2106;
      }
      optimizeNames(v2107, v2108) {
        if (this.lhs instanceof v2084.Name && !v2107[this.lhs.str] && !this.sideEffects) {
          return;
        }
        this.rhs = v2101(this.rhs, v2107, v2108);
        return this;
      }
      get names() {
        const v2109 = this.lhs instanceof v2084.Name ? {} : {
          ...this.lhs.names
        };
        return v2110(v2109, this.rhs);
      }
    }
    class v2111 extends v2102 {
      constructor(v2112, v2113, v2114, v2115) {
        super(v2112, v2114, v2115);
        this.op = v2113;
      }
      render({
        _n: v2116
      }) {
        return this.lhs + " " + this.op + "= " + this.rhs + ";" + v2116;
      }
    }
    class v2117 extends v2088 {
      constructor(v2118) {
        super();
        this.label = v2118;
        this.names = {};
      }
      render({
        _n: v2119
      }) {
        return this.label + ":" + v2119;
      }
    }
    class v2120 extends v2088 {
      constructor(v2121) {
        super();
        this.label = v2121;
        this.names = {};
      }
      render({
        _n: v2122
      }) {
        const v2123 = this.label ? " " + this.label : "";
        return "break" + v2123 + ";" + v2122;
      }
    }
    class v2124 extends v2088 {
      constructor(v2125) {
        super();
        this.error = v2125;
      }
      render({
        _n: v2126
      }) {
        return "throw " + this.error + ";" + v2126;
      }
      get names() {
        return this.error.names;
      }
    }
    class v2127 extends v2088 {
      constructor(v2128) {
        super();
        this.code = v2128;
      }
      render({
        _n: v2129
      }) {
        return this.code + ";" + v2129;
      }
      optimizeNodes() {
        if ("" + this.code) {
          return this;
        } else {
          return undefined;
        }
      }
      optimizeNames(v2130, v2131) {
        this.code = v2101(this.code, v2130, v2131);
        return this;
      }
      get names() {
        if (this.code instanceof v2084._CodeOrName) {
          return this.code.names;
        } else {
          return {};
        }
      }
    }
    class v2132 extends v2088 {
      constructor(v2133 = []) {
        super();
        this.nodes = v2133;
      }
      render(v2134) {
        return this.nodes.reduce((v2135, v2136) => v2135 + v2136.render(v2134), "");
      }
      optimizeNodes() {
        const {
          nodes: v2137
        } = this;
        let v2138 = v2137.length;
        while (v2138--) {
          const v2139 = v2137[v2138].optimizeNodes();
          if (Array.isArray(v2139)) {
            v2137.splice(v2138, 1, ...v2139);
          } else if (v2139) {
            v2137[v2138] = v2139;
          } else {
            v2137.splice(v2138, 1);
          }
        }
        if (v2137.length > 0) {
          return this;
        } else {
          return undefined;
        }
      }
      optimizeNames(v2140, v2141) {
        const {
          nodes: v2142
        } = this;
        let v2143 = v2142.length;
        while (v2143--) {
          const v2144 = v2142[v2143];
          if (v2144.optimizeNames(v2140, v2141)) {
            continue;
          }
          v2145(v2140, v2144.names);
          v2142.splice(v2143, 1);
        }
        if (v2142.length > 0) {
          return this;
        } else {
          return undefined;
        }
      }
      get names() {
        return this.nodes.reduce((v2146, v2147) => v2148(v2146, v2147.names), {});
      }
    }
    class v2149 extends v2132 {
      render(v2150) {
        return "{" + v2150._n + super.render(v2150) + "}" + v2150._n;
      }
    }
    class v2151 extends v2132 {}
    class v2152 extends v2149 {}
    v2152.kind = "else";
    class v2153 extends v2149 {
      constructor(v2154, v2155) {
        super(v2155);
        this.condition = v2154;
      }
      render(v2156) {
        let v2157 = "if(" + this.condition + ")" + super.render(v2156);
        if (this.else) {
          v2157 += "else " + this.else.render(v2156);
        }
        return v2157;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const v2158 = this.condition;
        if (v2158 === true) {
          return this.nodes;
        }
        let v2159 = this.else;
        if (v2159) {
          const v2160 = v2159.optimizeNodes();
          v2159 = this.else = Array.isArray(v2160) ? new v2152(v2160) : v2160;
        }
        if (v2159) {
          if (v2158 === false) {
            if (v2159 instanceof v2153) {
              return v2159;
            } else {
              return v2159.nodes;
            }
          }
          if (this.nodes.length) {
            return this;
          }
          return new v2153(v2161(v2158), v2159 instanceof v2153 ? [v2159] : v2159.nodes);
        }
        if (v2158 === false || !this.nodes.length) {
          return undefined;
        }
        return this;
      }
      optimizeNames(v2162, v2163) {
        var v2164;
        this.else = (v2164 = this.else) === null || v2164 === undefined ? undefined : v2164.optimizeNames(v2162, v2163);
        if (!super.optimizeNames(v2162, v2163) && !this.else) {
          return;
        }
        this.condition = v2101(this.condition, v2162, v2163);
        return this;
      }
      get names() {
        const v2165 = super.names;
        v2110(v2165, this.condition);
        if (this.else) {
          v2148(v2165, this.else.names);
        }
        return v2165;
      }
    }
    v2153.kind = "if";
    class v2166 extends v2149 {}
    v2166.kind = "for";
    class v2167 extends v2166 {
      constructor(v2168) {
        super();
        this.iteration = v2168;
      }
      render(v2169) {
        return "for(" + this.iteration + ")" + super.render(v2169);
      }
      optimizeNames(v2170, v2171) {
        if (!super.optimizeNames(v2170, v2171)) {
          return;
        }
        this.iteration = v2101(this.iteration, v2170, v2171);
        return this;
      }
      get names() {
        return v2148(super.names, this.iteration.names);
      }
    }
    class v2172 extends v2166 {
      constructor(v2173, v2174, v2175, v2176) {
        super();
        this.varKind = v2173;
        this.name = v2174;
        this.from = v2175;
        this.to = v2176;
      }
      render(v2177) {
        const v2178 = v2177.es5 ? v2085.varKinds.var : this.varKind;
        const {
          name: v2179,
          from: v2180,
          to: v2181
        } = this;
        return "for(" + v2178 + " " + v2179 + "=" + v2180 + "; " + v2179 + "<" + v2181 + "; " + v2179 + "++)" + super.render(v2177);
      }
      get names() {
        const v2182 = v2110(super.names, this.from);
        return v2110(v2182, this.to);
      }
    }
    class v2183 extends v2166 {
      constructor(v2184, v2185, v2186, v2187) {
        super();
        this.loop = v2184;
        this.varKind = v2185;
        this.name = v2186;
        this.iterable = v2187;
      }
      render(v2188) {
        return "for(" + this.varKind + " " + this.name + " " + this.loop + " " + this.iterable + ")" + super.render(v2188);
      }
      optimizeNames(v2189, v2190) {
        if (!super.optimizeNames(v2189, v2190)) {
          return;
        }
        this.iterable = v2101(this.iterable, v2189, v2190);
        return this;
      }
      get names() {
        return v2148(super.names, this.iterable.names);
      }
    }
    class v2191 extends v2149 {
      constructor(v2192, v2193, v2194) {
        super();
        this.name = v2192;
        this.args = v2193;
        this.async = v2194;
      }
      render(v2195) {
        const v2196 = this.async ? "async " : "";
        return v2196 + "function " + this.name + "(" + this.args + ")" + super.render(v2195);
      }
    }
    v2191.kind = "func";
    class v2197 extends v2132 {
      render(v2198) {
        return "return " + super.render(v2198);
      }
    }
    v2197.kind = "return";
    class v2199 extends v2149 {
      render(v2200) {
        let v2201 = "try" + super.render(v2200);
        if (this.catch) {
          v2201 += this.catch.render(v2200);
        }
        if (this.finally) {
          v2201 += this.finally.render(v2200);
        }
        return v2201;
      }
      optimizeNodes() {
        var v2202;
        var v2203;
        super.optimizeNodes();
        if ((v2202 = this.catch) === null || v2202 === undefined) {
          undefined;
        } else {
          v2202.optimizeNodes();
        }
        if ((v2203 = this.finally) === null || v2203 === undefined) {
          undefined;
        } else {
          v2203.optimizeNodes();
        }
        return this;
      }
      optimizeNames(v2204, v2205) {
        var v2206;
        var v2207;
        super.optimizeNames(v2204, v2205);
        if ((v2206 = this.catch) === null || v2206 === undefined) {
          undefined;
        } else {
          v2206.optimizeNames(v2204, v2205);
        }
        if ((v2207 = this.finally) === null || v2207 === undefined) {
          undefined;
        } else {
          v2207.optimizeNames(v2204, v2205);
        }
        return this;
      }
      get names() {
        const v2208 = super.names;
        if (this.catch) {
          v2148(v2208, this.catch.names);
        }
        if (this.finally) {
          v2148(v2208, this.finally.names);
        }
        return v2208;
      }
    }
    class v2209 extends v2149 {
      constructor(v2210) {
        super();
        this.error = v2210;
      }
      render(v2211) {
        return "catch(" + this.error + ")" + super.render(v2211);
      }
    }
    v2209.kind = "catch";
    class v2212 extends v2149 {
      render(v2213) {
        return "finally" + super.render(v2213);
      }
    }
    v2212.kind = "finally";
    class v2214 {
      constructor(v2215, v2216 = {}) {
        this._values = {};
        this._blockStarts = [];
        this._constants = {};
        this.opts = {
          ...v2216,
          _n: v2216.lines ? "\n" : ""
        };
        this._extScope = v2215;
        this._scope = new v2085.Scope({
          parent: v2215
        });
        this._nodes = [new v2151()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      name(v2217) {
        return this._scope.name(v2217);
      }
      scopeName(v2218) {
        return this._extScope.name(v2218);
      }
      scopeValue(v2219, v2220) {
        const v2221 = this._extScope.value(v2219, v2220);
        const v2222 = this._values[v2221.prefix] ||= new Set();
        v2222.add(v2221);
        return v2221;
      }
      getScopeValue(v2223, v2224) {
        return this._extScope.getValue(v2223, v2224);
      }
      scopeRefs(v2225) {
        return this._extScope.scopeRefs(v2225, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(v2226, v2227, v2228, v2229) {
        const v2230 = this._scope.toName(v2227);
        if (v2228 !== undefined && v2229) {
          this._constants[v2230.str] = v2228;
        }
        this._leafNode(new v2091(v2226, v2230, v2228));
        return v2230;
      }
      const(v2231, v2232, v2233) {
        return this._def(v2085.varKinds.const, v2231, v2232, v2233);
      }
      let(v2234, v2235, v2236) {
        return this._def(v2085.varKinds.let, v2234, v2235, v2236);
      }
      var(v2237, v2238, v2239) {
        return this._def(v2085.varKinds.var, v2237, v2238, v2239);
      }
      assign(v2240, v2241, v2242) {
        return this._leafNode(new v2102(v2240, v2241, v2242));
      }
      add(v2243, v2244) {
        return this._leafNode(new v2111(v2243, v2083.operators.ADD, v2244));
      }
      code(v2245) {
        if (typeof v2245 == "function") {
          v2245();
        } else if (v2245 !== v2084.nil) {
          this._leafNode(new v2127(v2245));
        }
        return this;
      }
      object(...v2246) {
        const v2247 = ["{"];
        for (const [v2248, v2249] of v2246) {
          if (v2247.length > 1) {
            v2247.push(",");
          }
          v2247.push(v2248);
          if (v2248 !== v2249 || this.opts.es5) {
            v2247.push(":");
            (0, v2084.addCodeArg)(v2247, v2249);
          }
        }
        v2247.push("}");
        return new v2084._Code(v2247);
      }
      if(v2250, v2251, v2252) {
        this._blockNode(new v2153(v2250));
        if (v2251 && v2252) {
          this.code(v2251).else().code(v2252).endIf();
        } else if (v2251) {
          this.code(v2251).endIf();
        } else if (v2252) {
          throw new Error("CodeGen: \"else\" body without \"then\" body");
        }
        return this;
      }
      elseIf(v2253) {
        return this._elseNode(new v2153(v2253));
      }
      else() {
        return this._elseNode(new v2152());
      }
      endIf() {
        return this._endBlockNode(v2153, v2152);
      }
      _for(v2254, v2255) {
        this._blockNode(v2254);
        if (v2255) {
          this.code(v2255).endFor();
        }
        return this;
      }
      for(v2256, v2257) {
        return this._for(new v2167(v2256), v2257);
      }
      forRange(v2258, v2259, v2260, v2261, v2262 = this.opts.es5 ? v2085.varKinds.var : v2085.varKinds.let) {
        const v2263 = this._scope.toName(v2258);
        return this._for(new v2172(v2262, v2263, v2259, v2260), () => v2261(v2263));
      }
      forOf(v2264, v2265, v2266, v2267 = v2085.varKinds.const) {
        const v2268 = this._scope.toName(v2264);
        if (this.opts.es5) {
          const v2269 = v2265 instanceof v2084.Name ? v2265 : this.var("_arr", v2265);
          return this.forRange("_i", 0, (0, v2084._)`${v2269}.length`, v2270 => {
            this.var(v2268, (0, v2084._)`${v2269}[${v2270}]`);
            v2266(v2268);
          });
        }
        return this._for(new v2183("of", v2267, v2268, v2265), () => v2266(v2268));
      }
      forIn(v2271, v2272, v2273, v2274 = this.opts.es5 ? v2085.varKinds.var : v2085.varKinds.const) {
        if (this.opts.ownProperties) {
          return this.forOf(v2271, (0, v2084._)`Object.keys(${v2272})`, v2273);
        }
        const v2275 = this._scope.toName(v2271);
        return this._for(new v2183("in", v2274, v2275, v2272), () => v2273(v2275));
      }
      endFor() {
        return this._endBlockNode(v2166);
      }
      label(v2276) {
        return this._leafNode(new v2117(v2276));
      }
      break(v2277) {
        return this._leafNode(new v2120(v2277));
      }
      return(v2278) {
        const v2279 = new v2197();
        this._blockNode(v2279);
        this.code(v2278);
        if (v2279.nodes.length !== 1) {
          throw new Error("CodeGen: \"return\" should have one node");
        }
        return this._endBlockNode(v2197);
      }
      try(v2280, v2281, v2282) {
        if (!v2281 && !v2282) {
          throw new Error("CodeGen: \"try\" without \"catch\" and \"finally\"");
        }
        const v2283 = new v2199();
        this._blockNode(v2283);
        this.code(v2280);
        if (v2281) {
          const v2284 = this.name("e");
          this._currNode = v2283.catch = new v2209(v2284);
          v2281(v2284);
        }
        if (v2282) {
          this._currNode = v2283.finally = new v2212();
          this.code(v2282);
        }
        return this._endBlockNode(v2209, v2212);
      }
      throw(v2285) {
        return this._leafNode(new v2124(v2285));
      }
      block(v2286, v2287) {
        this._blockStarts.push(this._nodes.length);
        if (v2286) {
          this.code(v2286).endBlock(v2287);
        }
        return this;
      }
      endBlock(v2288) {
        const v2289 = this._blockStarts.pop();
        if (v2289 === undefined) {
          throw new Error("CodeGen: not in self-balancing block");
        }
        const v2290 = this._nodes.length - v2289;
        if (v2290 < 0 || v2288 !== undefined && v2290 !== v2288) {
          throw new Error("CodeGen: wrong number of nodes: " + v2290 + " vs " + v2288 + " expected");
        }
        this._nodes.length = v2289;
        return this;
      }
      func(v2291, v2292 = v2084.nil, v2293, v2294) {
        this._blockNode(new v2191(v2291, v2292, v2293));
        if (v2294) {
          this.code(v2294).endFunc();
        }
        return this;
      }
      endFunc() {
        return this._endBlockNode(v2191);
      }
      optimize(v2295 = 1) {
        while (v2295-- > 0) {
          this._root.optimizeNodes();
          this._root.optimizeNames(this._root.names, this._constants);
        }
      }
      _leafNode(v2296) {
        this._currNode.nodes.push(v2296);
        return this;
      }
      _blockNode(v2297) {
        this._currNode.nodes.push(v2297);
        this._nodes.push(v2297);
      }
      _endBlockNode(v2298, v2299) {
        const v2300 = this._currNode;
        if (v2300 instanceof v2298 || v2299 && v2300 instanceof v2299) {
          this._nodes.pop();
          return this;
        }
        throw new Error("CodeGen: not in block \"" + (v2299 ? v2298.kind + "/" + v2299.kind : v2298.kind) + "\"");
      }
      _elseNode(v2301) {
        const v2302 = this._currNode;
        if (!(v2302 instanceof v2153)) {
          throw new Error("CodeGen: \"else\" without \"if\"");
        }
        this._currNode = v2302.else = v2301;
        return this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const v2303 = this._nodes;
        return v2303[v2303.length - 1];
      }
      set _currNode(v2304) {
        const v2305 = this._nodes;
        v2305[v2305.length - 1] = v2304;
      }
    }
    v2083.CodeGen = v2214;
    function v2148(v2306, v2307) {
      for (const v2308 in v2307) {
        v2306[v2308] = (v2306[v2308] || 0) + (v2307[v2308] || 0);
      }
      return v2306;
    }
    function v2110(v2309, v2310) {
      if (v2310 instanceof v2084._CodeOrName) {
        return v2148(v2309, v2310.names);
      } else {
        return v2309;
      }
    }
    function v2101(v2311, v2312, v2313) {
      if (v2311 instanceof v2084.Name) {
        return v2314(v2311);
      }
      if (!v2315(v2311)) {
        return v2311;
      }
      return new v2084._Code(v2311._items.reduce((v2316, v2317) => {
        if (v2317 instanceof v2084.Name) {
          v2317 = v2314(v2317);
        }
        if (v2317 instanceof v2084._Code) {
          v2316.push(...v2317._items);
        } else {
          v2316.push(v2317);
        }
        return v2316;
      }, []));
      function v2314(v2318) {
        const v2319 = v2313[v2318.str];
        if (v2319 === undefined || v2312[v2318.str] !== 1) {
          return v2318;
        }
        delete v2312[v2318.str];
        return v2319;
      }
      function v2315(v2320) {
        return v2320 instanceof v2084._Code && v2320._items.some(v2321 => v2321 instanceof v2084.Name && v2312[v2321.str] === 1 && v2313[v2321.str] !== undefined);
      }
    }
    function v2145(v2322, v2323) {
      for (const v2324 in v2323) {
        v2322[v2324] = (v2322[v2324] || 0) - (v2323[v2324] || 0);
      }
    }
    function v2161(v2325) {
      if (typeof v2325 == "boolean" || typeof v2325 == "number" || v2325 === null) {
        return !v2325;
      } else {
        return (0, v2084._)`!${v2326(v2325)}`;
      }
    }
    v2083.not = v2161;
    const v2327 = v2328(v2083.operators.AND);
    function v2329(...v2330) {
      return v2330.reduce(v2327);
    }
    v2083.and = v2329;
    const v2331 = v2328(v2083.operators.OR);
    function v2332(...v2333) {
      return v2333.reduce(v2331);
    }
    v2083.or = v2332;
    function v2328(v2334) {
      return (v2335, v2336) => v2335 === v2084.nil ? v2336 : v2336 === v2084.nil ? v2335 : (0, v2084._)`${v2326(v2335)} ${v2334} ${v2326(v2336)}`;
    }
    function v2326(v2337) {
      if (v2337 instanceof v2084.Name) {
        return v2337;
      } else {
        return (0, v2084._)`(${v2337})`;
      }
    }
  })(codegen);
  return codegen;
}
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) {
    return util;
  }
  hasRequiredUtil = 1;
  Object.defineProperty(util, "__esModule", {
    value: true
  });
  util.checkStrictMode = util.getErrorPath = util.Type = util.useFunc = util.setEvaluated = util.evaluatedPropsToName = util.mergeEvaluated = util.eachItem = util.unescapeJsonPointer = util.escapeJsonPointer = util.escapeFragment = util.unescapeFragment = util.schemaRefOrVal = util.schemaHasRulesButRef = util.schemaHasRules = util.checkUnknownRules = util.alwaysValidSchema = util.toHash = undefined;
  const v2338 = requireCodegen();
  const v2339 = requireCode$1();
  function v2340(v2341) {
    const v2342 = {};
    for (const v2343 of v2341) {
      v2342[v2343] = true;
    }
    return v2342;
  }
  util.toHash = v2340;
  function v2344(v2345, v2346) {
    if (typeof v2346 == "boolean") {
      return v2346;
    }
    if (Object.keys(v2346).length === 0) {
      return true;
    }
    v2347(v2345, v2346);
    return !v2348(v2346, v2345.self.RULES.all);
  }
  util.alwaysValidSchema = v2344;
  function v2347(v2349, v2350 = v2349.schema) {
    const {
      opts: v2351,
      self: v2352
    } = v2349;
    if (!v2351.strictSchema) {
      return;
    }
    if (typeof v2350 === "boolean") {
      return;
    }
    const v2353 = v2352.RULES.keywords;
    for (const v2354 in v2350) {
      if (!v2353[v2354]) {
        v2355(v2349, "unknown keyword: \"" + v2354 + "\"");
      }
    }
  }
  util.checkUnknownRules = v2347;
  function v2348(v2356, v2357) {
    if (typeof v2356 == "boolean") {
      return !v2356;
    }
    for (const v2358 in v2356) {
      if (v2357[v2358]) {
        return true;
      }
    }
    return false;
  }
  util.schemaHasRules = v2348;
  function v2359(v2360, v2361) {
    if (typeof v2360 == "boolean") {
      return !v2360;
    }
    for (const v2362 in v2360) {
      if (v2362 !== "$ref" && v2361.all[v2362]) {
        return true;
      }
    }
    return false;
  }
  util.schemaHasRulesButRef = v2359;
  function v2363({
    topSchemaRef: v2364,
    schemaPath: v2365
  }, v2366, v2367, v2368) {
    if (!v2368) {
      if (typeof v2366 == "number" || typeof v2366 == "boolean") {
        return v2366;
      }
      if (typeof v2366 == "string") {
        return (0, v2338._)`${v2366}`;
      }
    }
    return (0, v2338._)`${v2364}${v2365}${(0, v2338.getProperty)(v2367)}`;
  }
  util.schemaRefOrVal = v2363;
  function v2369(v2370) {
    return v2371(decodeURIComponent(v2370));
  }
  util.unescapeFragment = v2369;
  function v2372(v2373) {
    return encodeURIComponent(v2374(v2373));
  }
  util.escapeFragment = v2372;
  function v2374(v2375) {
    if (typeof v2375 == "number") {
      return "" + v2375;
    }
    return v2375.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  util.escapeJsonPointer = v2374;
  function v2371(v2376) {
    return v2376.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  util.unescapeJsonPointer = v2371;
  function v2377(v2378, v2379) {
    if (Array.isArray(v2378)) {
      for (const v2380 of v2378) {
        v2379(v2380);
      }
    } else {
      v2379(v2378);
    }
  }
  util.eachItem = v2377;
  function v2381({
    mergeNames: v2382,
    mergeToName: v2383,
    mergeValues: v2384,
    resultToName: v2385
  }) {
    return (v2386, v2387, v2388, v2389) => {
      const v2390 = v2388 === undefined ? v2387 : v2388 instanceof v2338.Name ? (v2387 instanceof v2338.Name ? v2382(v2386, v2387, v2388) : v2383(v2386, v2387, v2388), v2388) : v2387 instanceof v2338.Name ? (v2383(v2386, v2388, v2387), v2387) : v2384(v2387, v2388);
      if (v2389 === v2338.Name && !(v2390 instanceof v2338.Name)) {
        return v2385(v2386, v2390);
      } else {
        return v2390;
      }
    };
  }
  util.mergeEvaluated = {
    props: v2381({
      mergeNames: (v2391, v2392, v2393) => v2391.if((0, v2338._)`${v2393} !== true && ${v2392} !== undefined`, () => {
        v2391.if((0, v2338._)`${v2392} === true`, () => v2391.assign(v2393, true), () => v2391.assign(v2393, (0, v2338._)`${v2393} || {}`).code((0, v2338._)`Object.assign(${v2393}, ${v2392})`));
      }),
      mergeToName: (v2394, v2395, v2396) => v2394.if((0, v2338._)`${v2396} !== true`, () => {
        if (v2395 === true) {
          v2394.assign(v2396, true);
        } else {
          v2394.assign(v2396, (0, v2338._)`${v2396} || {}`);
          v2397(v2394, v2396, v2395);
        }
      }),
      mergeValues: (v2398, v2399) => v2398 === true ? true : {
        ...v2398,
        ...v2399
      },
      resultToName: v2400
    }),
    items: v2381({
      mergeNames: (v2401, v2402, v2403) => v2401.if((0, v2338._)`${v2403} !== true && ${v2402} !== undefined`, () => v2401.assign(v2403, (0, v2338._)`${v2402} === true ? true : ${v2403} > ${v2402} ? ${v2403} : ${v2402}`)),
      mergeToName: (v2404, v2405, v2406) => v2404.if((0, v2338._)`${v2406} !== true`, () => v2404.assign(v2406, v2405 === true ? true : (0, v2338._)`${v2406} > ${v2405} ? ${v2406} : ${v2405}`)),
      mergeValues: (v2407, v2408) => v2407 === true ? true : Math.max(v2407, v2408),
      resultToName: (v2409, v2410) => v2409.var("items", v2410)
    })
  };
  function v2400(v2411, v2412) {
    if (v2412 === true) {
      return v2411.var("props", true);
    }
    const v2413 = v2411.var("props", (0, v2338._)`{}`);
    if (v2412 !== undefined) {
      v2397(v2411, v2413, v2412);
    }
    return v2413;
  }
  util.evaluatedPropsToName = v2400;
  function v2397(v2414, v2415, v2416) {
    Object.keys(v2416).forEach(v2417 => v2414.assign((0, v2338._)`${v2415}${(0, v2338.getProperty)(v2417)}`, true));
  }
  util.setEvaluated = v2397;
  const v2418 = {};
  function v2419(v2420, v2421) {
    return v2420.scopeValue("func", {
      ref: v2421,
      code: v2418[v2421.code] ||= new v2339._Code(v2421.code)
    });
  }
  util.useFunc = v2419;
  var v2422;
  (function (v2423) {
    v2423[v2423.Num = 0] = "Num";
    v2423[v2423.Str = 1] = "Str";
  })(v2422 || (util.Type = v2422 = {}));
  function v2424(v2425, v2426, v2427) {
    if (v2425 instanceof v2338.Name) {
      const v2428 = v2426 === v2422.Num;
      if (v2427) {
        if (v2428) {
          return (0, v2338._)`"[" + ${v2425} + "]"`;
        } else {
          return (0, v2338._)`"['" + ${v2425} + "']"`;
        }
      } else if (v2428) {
        return (0, v2338._)`"/" + ${v2425}`;
      } else {
        return (0, v2338._)`"/" + ${v2425}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
      }
    }
    if (v2427) {
      return (0, v2338.getProperty)(v2425).toString();
    } else {
      return "/" + v2374(v2425);
    }
  }
  util.getErrorPath = v2424;
  function v2355(v2429, v2430, v2431 = v2429.opts.strictSchema) {
    if (!v2431) {
      return;
    }
    v2430 = "strict mode: " + v2430;
    if (v2431 === true) {
      throw new Error(v2430);
    }
    v2429.self.logger.warn(v2430);
  }
  util.checkStrictMode = v2355;
  return util;
}
var names = {};
var hasRequiredNames;
function requireNames() {
  if (hasRequiredNames) {
    return names;
  }
  hasRequiredNames = 1;
  Object.defineProperty(names, "__esModule", {
    value: true
  });
  const v2432 = requireCodegen();
  const v2433 = {
    data: new v2432.Name("data"),
    valCxt: new v2432.Name("valCxt"),
    instancePath: new v2432.Name("instancePath"),
    parentData: new v2432.Name("parentData"),
    parentDataProperty: new v2432.Name("parentDataProperty"),
    rootData: new v2432.Name("rootData"),
    dynamicAnchors: new v2432.Name("dynamicAnchors"),
    vErrors: new v2432.Name("vErrors"),
    errors: new v2432.Name("errors"),
    this: new v2432.Name("this"),
    self: new v2432.Name("self"),
    scope: new v2432.Name("scope"),
    json: new v2432.Name("json"),
    jsonPos: new v2432.Name("jsonPos"),
    jsonLen: new v2432.Name("jsonLen"),
    jsonPart: new v2432.Name("jsonPart")
  };
  names.default = v2433;
  return names;
}
var hasRequiredErrors;
function requireErrors() {
  if (hasRequiredErrors) {
    return errors;
  }
  hasRequiredErrors = 1;
  (function (v2434) {
    Object.defineProperty(v2434, "__esModule", {
      value: true
    });
    v2434.extendErrors = v2434.resetErrorsCount = v2434.reportExtraError = v2434.reportError = v2434.keyword$DataError = v2434.keywordError = undefined;
    const v2435 = requireCodegen();
    const v2436 = requireUtil();
    const v2437 = requireNames();
    v2434.keywordError = {
      message: ({
        keyword: v2438
      }) => (0, v2435.str)`must pass "${v2438}" keyword validation`
    };
    v2434.keyword$DataError = {
      message: ({
        keyword: v2439,
        schemaType: v2440
      }) => v2440 ? (0, v2435.str)`"${v2439}" keyword must be ${v2440} ($data)` : (0, v2435.str)`"${v2439}" keyword is invalid ($data)`
    };
    function v2441(v2442, v2443 = v2434.keywordError, v2444, v2445) {
      const {
        it: v2446
      } = v2442;
      const {
        gen: v2447,
        compositeRule: v2448,
        allErrors: v2449
      } = v2446;
      const v2450 = v2451(v2442, v2443, v2444);
      if (v2445 ?? (v2448 || v2449)) {
        v2452(v2447, v2450);
      } else {
        v2453(v2446, (0, v2435._)`[${v2450}]`);
      }
    }
    v2434.reportError = v2441;
    function v2454(v2455, v2456 = v2434.keywordError, v2457) {
      const {
        it: v2458
      } = v2455;
      const {
        gen: v2459,
        compositeRule: v2460,
        allErrors: v2461
      } = v2458;
      const v2462 = v2451(v2455, v2456, v2457);
      v2452(v2459, v2462);
      if (!v2460 && !v2461) {
        v2453(v2458, v2437.default.vErrors);
      }
    }
    v2434.reportExtraError = v2454;
    function v2463(v2464, v2465) {
      v2464.assign(v2437.default.errors, v2465);
      v2464.if((0, v2435._)`${v2437.default.vErrors} !== null`, () => v2464.if(v2465, () => v2464.assign((0, v2435._)`${v2437.default.vErrors}.length`, v2465), () => v2464.assign(v2437.default.vErrors, null)));
    }
    v2434.resetErrorsCount = v2463;
    function v2466({
      gen: v2467,
      keyword: v2468,
      schemaValue: v2469,
      data: v2470,
      errsCount: v2471,
      it: v2472
    }) {
      if (v2471 === undefined) {
        throw new Error("ajv implementation error");
      }
      const v2473 = v2467.name("err");
      v2467.forRange("i", v2471, v2437.default.errors, v2474 => {
        v2467.const(v2473, (0, v2435._)`${v2437.default.vErrors}[${v2474}]`);
        v2467.if((0, v2435._)`${v2473}.instancePath === undefined`, () => v2467.assign((0, v2435._)`${v2473}.instancePath`, (0, v2435.strConcat)(v2437.default.instancePath, v2472.errorPath)));
        v2467.assign((0, v2435._)`${v2473}.schemaPath`, (0, v2435.str)`${v2472.errSchemaPath}/${v2468}`);
        if (v2472.opts.verbose) {
          v2467.assign((0, v2435._)`${v2473}.schema`, v2469);
          v2467.assign((0, v2435._)`${v2473}.data`, v2470);
        }
      });
    }
    v2434.extendErrors = v2466;
    function v2452(v2475, v2476) {
      const v2477 = v2475.const("err", v2476);
      v2475.if((0, v2435._)`${v2437.default.vErrors} === null`, () => v2475.assign(v2437.default.vErrors, (0, v2435._)`[${v2477}]`), (0, v2435._)`${v2437.default.vErrors}.push(${v2477})`);
      v2475.code((0, v2435._)`${v2437.default.errors}++`);
    }
    function v2453(v2478, v2479) {
      const {
        gen: v2480,
        validateName: v2481,
        schemaEnv: v2482
      } = v2478;
      if (v2482.$async) {
        v2480.throw((0, v2435._)`new ${v2478.ValidationError}(${v2479})`);
      } else {
        v2480.assign((0, v2435._)`${v2481}.errors`, v2479);
        v2480.return(false);
      }
    }
    const v2483 = {
      keyword: new v2435.Name("keyword"),
      schemaPath: new v2435.Name("schemaPath"),
      params: new v2435.Name("params"),
      propertyName: new v2435.Name("propertyName"),
      message: new v2435.Name("message"),
      schema: new v2435.Name("schema"),
      parentSchema: new v2435.Name("parentSchema")
    };
    function v2451(v2484, v2485, v2486) {
      const {
        createErrors: v2487
      } = v2484.it;
      if (v2487 === false) {
        return (0, v2435._)`{}`;
      }
      return v2488(v2484, v2485, v2486);
    }
    function v2488(v2489, v2490, v2491 = {}) {
      const {
        gen: v2492,
        it: v2493
      } = v2489;
      const v2494 = [v2495(v2493, v2491), v2496(v2489, v2491)];
      v2497(v2489, v2490, v2494);
      return v2492.object(...v2494);
    }
    function v2495({
      errorPath: v2498
    }, {
      instancePath: v2499
    }) {
      const v2500 = v2499 ? (0, v2435.str)`${v2498}${(0, v2436.getErrorPath)(v2499, v2436.Type.Str)}` : v2498;
      return [v2437.default.instancePath, (0, v2435.strConcat)(v2437.default.instancePath, v2500)];
    }
    function v2496({
      keyword: v2501,
      it: {
        errSchemaPath: v2502
      }
    }, {
      schemaPath: v2503,
      parentSchema: v2504
    }) {
      let v2505 = v2504 ? v2502 : (0, v2435.str)`${v2502}/${v2501}`;
      if (v2503) {
        v2505 = (0, v2435.str)`${v2505}${(0, v2436.getErrorPath)(v2503, v2436.Type.Str)}`;
      }
      return [v2483.schemaPath, v2505];
    }
    function v2497(v2506, {
      params: v2507,
      message: v2508
    }, v2509) {
      const {
        keyword: v2510,
        data: v2511,
        schemaValue: v2512,
        it: v2513
      } = v2506;
      const {
        opts: v2514,
        propertyName: v2515,
        topSchemaRef: v2516,
        schemaPath: v2517
      } = v2513;
      v2509.push([v2483.keyword, v2510], [v2483.params, typeof v2507 == "function" ? v2507(v2506) : v2507 || (0, v2435._)`{}`]);
      if (v2514.messages) {
        v2509.push([v2483.message, typeof v2508 == "function" ? v2508(v2506) : v2508]);
      }
      if (v2514.verbose) {
        v2509.push([v2483.schema, v2512], [v2483.parentSchema, (0, v2435._)`${v2516}${v2517}`], [v2437.default.data, v2511]);
      }
      if (v2515) {
        v2509.push([v2483.propertyName, v2515]);
      }
    }
  })(errors);
  return errors;
}
var hasRequiredBoolSchema;
function requireBoolSchema() {
  if (hasRequiredBoolSchema) {
    return boolSchema;
  }
  hasRequiredBoolSchema = 1;
  Object.defineProperty(boolSchema, "__esModule", {
    value: true
  });
  boolSchema.boolOrEmptySchema = boolSchema.topBoolOrEmptySchema = undefined;
  const v2518 = requireErrors();
  const v2519 = requireCodegen();
  const v2520 = requireNames();
  const v2521 = {
    message: "boolean schema is false"
  };
  function v2522(v2523) {
    const {
      gen: v2524,
      schema: v2525,
      validateName: v2526
    } = v2523;
    if (v2525 === false) {
      v2527(v2523, false);
    } else if (typeof v2525 == "object" && v2525.$async === true) {
      v2524.return(v2520.default.data);
    } else {
      v2524.assign((0, v2519._)`${v2526}.errors`, null);
      v2524.return(true);
    }
  }
  boolSchema.topBoolOrEmptySchema = v2522;
  function v2528(v2529, v2530) {
    const {
      gen: v2531,
      schema: v2532
    } = v2529;
    if (v2532 === false) {
      v2531.var(v2530, false);
      v2527(v2529);
    } else {
      v2531.var(v2530, true);
    }
  }
  boolSchema.boolOrEmptySchema = v2528;
  function v2527(v2533, v2534) {
    const {
      gen: v2535,
      data: v2536
    } = v2533;
    const v2537 = {
      gen: v2535,
      keyword: "false schema",
      data: v2536,
      schema: false,
      schemaCode: false,
      schemaValue: false,
      params: {},
      it: v2533
    };
    (0, v2518.reportError)(v2537, v2521, undefined, v2534);
  }
  return boolSchema;
}
var dataType = {};
var rules = {};
var hasRequiredRules;
function requireRules() {
  if (hasRequiredRules) {
    return rules;
  }
  hasRequiredRules = 1;
  Object.defineProperty(rules, "__esModule", {
    value: true
  });
  rules.getRules = rules.isJSONType = undefined;
  const v2538 = ["string", "number", "integer", "boolean", "null", "object", "array"];
  const v2539 = new Set(v2538);
  function v2540(v2541) {
    return typeof v2541 == "string" && v2539.has(v2541);
  }
  rules.isJSONType = v2540;
  function v2542() {
    const v2543 = {
      number: {
        type: "number",
        rules: []
      },
      string: {
        type: "string",
        rules: []
      },
      array: {
        type: "array",
        rules: []
      },
      object: {
        type: "object",
        rules: []
      }
    };
    return {
      types: {
        ...v2543,
        integer: true,
        boolean: true,
        null: true
      },
      rules: [{
        rules: []
      }, v2543.number, v2543.string, v2543.array, v2543.object],
      post: {
        rules: []
      },
      all: {},
      keywords: {}
    };
  }
  rules.getRules = v2542;
  return rules;
}
var applicability = {};
var hasRequiredApplicability;
function requireApplicability() {
  if (hasRequiredApplicability) {
    return applicability;
  }
  hasRequiredApplicability = 1;
  Object.defineProperty(applicability, "__esModule", {
    value: true
  });
  applicability.shouldUseRule = applicability.shouldUseGroup = applicability.schemaHasRulesForType = undefined;
  function v2544({
    schema: v2545,
    self: v2546
  }, v2547) {
    const v2548 = v2546.RULES.types[v2547];
    return v2548 && v2548 !== true && v2549(v2545, v2548);
  }
  applicability.schemaHasRulesForType = v2544;
  function v2549(v2550, v2551) {
    return v2551.rules.some(v2552 => v2553(v2550, v2552));
  }
  applicability.shouldUseGroup = v2549;
  function v2553(v2554, v2555) {
    var v2556;
    return v2554[v2555.keyword] !== undefined || ((v2556 = v2555.definition.implements) === null || v2556 === undefined ? undefined : v2556.some(v2557 => v2554[v2557] !== undefined));
  }
  applicability.shouldUseRule = v2553;
  return applicability;
}
var hasRequiredDataType;
function requireDataType() {
  if (hasRequiredDataType) {
    return dataType;
  }
  hasRequiredDataType = 1;
  Object.defineProperty(dataType, "__esModule", {
    value: true
  });
  dataType.reportTypeError = dataType.checkDataTypes = dataType.checkDataType = dataType.coerceAndCheckDataType = dataType.getJSONTypes = dataType.getSchemaTypes = dataType.DataType = undefined;
  const v2558 = requireRules();
  const v2559 = requireApplicability();
  const v2560 = requireErrors();
  const v2561 = requireCodegen();
  const v2562 = requireUtil();
  var v2563;
  (function (v2564) {
    v2564[v2564.Correct = 0] = "Correct";
    v2564[v2564.Wrong = 1] = "Wrong";
  })(v2563 || (dataType.DataType = v2563 = {}));
  function v2565(v2566) {
    const v2567 = v2568(v2566.type);
    const v2569 = v2567.includes("null");
    if (v2569) {
      if (v2566.nullable === false) {
        throw new Error("type: null contradicts nullable: false");
      }
    } else {
      if (!v2567.length && v2566.nullable !== undefined) {
        throw new Error("\"nullable\" cannot be used without \"type\"");
      }
      if (v2566.nullable === true) {
        v2567.push("null");
      }
    }
    return v2567;
  }
  dataType.getSchemaTypes = v2565;
  function v2568(v2570) {
    const v2571 = Array.isArray(v2570) ? v2570 : v2570 ? [v2570] : [];
    if (v2571.every(v2558.isJSONType)) {
      return v2571;
    }
    throw new Error("type must be JSONType or JSONType[]: " + v2571.join(","));
  }
  dataType.getJSONTypes = v2568;
  function v2572(v2573, v2574) {
    const {
      gen: v2575,
      data: v2576,
      opts: v2577
    } = v2573;
    const v2578 = v2579(v2574, v2577.coerceTypes);
    const v2580 = v2574.length > 0 && (v2578.length !== 0 || v2574.length !== 1 || !(0, v2559.schemaHasRulesForType)(v2573, v2574[0]));
    if (v2580) {
      const v2581 = v2582(v2574, v2576, v2577.strictNumbers, v2563.Wrong);
      v2575.if(v2581, () => {
        if (v2578.length) {
          v2583(v2573, v2574, v2578);
        } else {
          v2584(v2573);
        }
      });
    }
    return v2580;
  }
  dataType.coerceAndCheckDataType = v2572;
  const v2585 = new Set(["string", "number", "integer", "boolean", "null"]);
  function v2579(v2586, v2587) {
    if (v2587) {
      return v2586.filter(v2588 => v2585.has(v2588) || v2587 === "array" && v2588 === "array");
    } else {
      return [];
    }
  }
  function v2583(v2589, v2590, v2591) {
    const {
      gen: v2592,
      data: v2593,
      opts: v2594
    } = v2589;
    const v2595 = v2592.let("dataType", (0, v2561._)`typeof ${v2593}`);
    const v2596 = v2592.let("coerced", (0, v2561._)`undefined`);
    if (v2594.coerceTypes === "array") {
      v2592.if((0, v2561._)`${v2595} == 'object' && Array.isArray(${v2593}) && ${v2593}.length == 1`, () => v2592.assign(v2593, (0, v2561._)`${v2593}[0]`).assign(v2595, (0, v2561._)`typeof ${v2593}`).if(v2582(v2590, v2593, v2594.strictNumbers), () => v2592.assign(v2596, v2593)));
    }
    v2592.if((0, v2561._)`${v2596} !== undefined`);
    for (const v2597 of v2591) {
      if (v2585.has(v2597) || v2597 === "array" && v2594.coerceTypes === "array") {
        v2598(v2597);
      }
    }
    v2592.else();
    v2584(v2589);
    v2592.endIf();
    v2592.if((0, v2561._)`${v2596} !== undefined`, () => {
      v2592.assign(v2593, v2596);
      v2599(v2589, v2596);
    });
    function v2598(v2600) {
      switch (v2600) {
        case "string":
          v2592.elseIf((0, v2561._)`${v2595} == "number" || ${v2595} == "boolean"`).assign(v2596, (0, v2561._)`"" + ${v2593}`).elseIf((0, v2561._)`${v2593} === null`).assign(v2596, (0, v2561._)`""`);
          return;
        case "number":
          v2592.elseIf((0, v2561._)`${v2595} == "boolean" || ${v2593} === null
              || (${v2595} == "string" && ${v2593} && ${v2593} == +${v2593})`).assign(v2596, (0, v2561._)`+${v2593}`);
          return;
        case "integer":
          v2592.elseIf((0, v2561._)`${v2595} === "boolean" || ${v2593} === null
              || (${v2595} === "string" && ${v2593} && ${v2593} == +${v2593} && !(${v2593} % 1))`).assign(v2596, (0, v2561._)`+${v2593}`);
          return;
        case "boolean":
          v2592.elseIf((0, v2561._)`${v2593} === "false" || ${v2593} === 0 || ${v2593} === null`).assign(v2596, false).elseIf((0, v2561._)`${v2593} === "true" || ${v2593} === 1`).assign(v2596, true);
          return;
        case "null":
          v2592.elseIf((0, v2561._)`${v2593} === "" || ${v2593} === 0 || ${v2593} === false`);
          v2592.assign(v2596, null);
          return;
        case "array":
          v2592.elseIf((0, v2561._)`${v2595} === "string" || ${v2595} === "number"
              || ${v2595} === "boolean" || ${v2593} === null`).assign(v2596, (0, v2561._)`[${v2593}]`);
      }
    }
  }
  function v2599({
    gen: v2601,
    parentData: v2602,
    parentDataProperty: v2603
  }, v2604) {
    v2601.if((0, v2561._)`${v2602} !== undefined`, () => v2601.assign((0, v2561._)`${v2602}[${v2603}]`, v2604));
  }
  function v2605(v2606, v2607, v2608, v2609 = v2563.Correct) {
    const v2610 = v2609 === v2563.Correct ? v2561.operators.EQ : v2561.operators.NEQ;
    let v2611;
    switch (v2606) {
      case "null":
        return (0, v2561._)`${v2607} ${v2610} null`;
      case "array":
        v2611 = (0, v2561._)`Array.isArray(${v2607})`;
        break;
      case "object":
        v2611 = (0, v2561._)`${v2607} && typeof ${v2607} == "object" && !Array.isArray(${v2607})`;
        break;
      case "integer":
        v2611 = v2612((0, v2561._)`!(${v2607} % 1) && !isNaN(${v2607})`);
        break;
      case "number":
        v2611 = v2612();
        break;
      default:
        return (0, v2561._)`typeof ${v2607} ${v2610} ${v2606}`;
    }
    if (v2609 === v2563.Correct) {
      return v2611;
    } else {
      return (0, v2561.not)(v2611);
    }
    function v2612(v2613 = v2561.nil) {
      return (0, v2561.and)((0, v2561._)`typeof ${v2607} == "number"`, v2613, v2608 ? (0, v2561._)`isFinite(${v2607})` : v2561.nil);
    }
  }
  dataType.checkDataType = v2605;
  function v2582(v2614, v2615, v2616, v2617) {
    if (v2614.length === 1) {
      return v2605(v2614[0], v2615, v2616, v2617);
    }
    let v2618;
    const v2619 = (0, v2562.toHash)(v2614);
    if (v2619.array && v2619.object) {
      const v2620 = (0, v2561._)`typeof ${v2615} != "object"`;
      v2618 = v2619.null ? v2620 : (0, v2561._)`!${v2615} || ${v2620}`;
      delete v2619.null;
      delete v2619.array;
      delete v2619.object;
    } else {
      v2618 = v2561.nil;
    }
    if (v2619.number) {
      delete v2619.integer;
    }
    for (const v2621 in v2619) {
      v2618 = (0, v2561.and)(v2618, v2605(v2621, v2615, v2616, v2617));
    }
    return v2618;
  }
  dataType.checkDataTypes = v2582;
  const v2622 = {
    message: ({
      schema: v2623
    }) => "must be " + v2623,
    params: ({
      schema: v2624,
      schemaValue: v2625
    }) => typeof v2624 == "string" ? (0, v2561._)`{type: ${v2624}}` : (0, v2561._)`{type: ${v2625}}`
  };
  function v2584(v2626) {
    const v2627 = v2628(v2626);
    (0, v2560.reportError)(v2627, v2622);
  }
  dataType.reportTypeError = v2584;
  function v2628(v2629) {
    const {
      gen: v2630,
      data: v2631,
      schema: v2632
    } = v2629;
    const v2633 = (0, v2562.schemaRefOrVal)(v2629, v2632, "type");
    return {
      gen: v2630,
      keyword: "type",
      data: v2631,
      schema: v2632.type,
      schemaCode: v2633,
      schemaValue: v2633,
      parentSchema: v2632,
      params: {},
      it: v2629
    };
  }
  return dataType;
}
var defaults = {};
var hasRequiredDefaults;
function requireDefaults() {
  if (hasRequiredDefaults) {
    return defaults;
  }
  hasRequiredDefaults = 1;
  Object.defineProperty(defaults, "__esModule", {
    value: true
  });
  defaults.assignDefaults = undefined;
  const v2634 = requireCodegen();
  const v2635 = requireUtil();
  function v2636(v2637, v2638) {
    const {
      properties: v2639,
      items: v2640
    } = v2637.schema;
    if (v2638 === "object" && v2639) {
      for (const v2641 in v2639) {
        v2642(v2637, v2641, v2639[v2641].default);
      }
    } else if (v2638 === "array" && Array.isArray(v2640)) {
      v2640.forEach((v2643, v2644) => v2642(v2637, v2644, v2643.default));
    }
  }
  defaults.assignDefaults = v2636;
  function v2642(v2645, v2646, v2647) {
    const {
      gen: v2648,
      compositeRule: v2649,
      data: v2650,
      opts: v2651
    } = v2645;
    if (v2647 === undefined) {
      return;
    }
    const v2652 = (0, v2634._)`${v2650}${(0, v2634.getProperty)(v2646)}`;
    if (v2649) {
      (0, v2635.checkStrictMode)(v2645, "default is ignored for: " + v2652);
      return;
    }
    let v2653 = (0, v2634._)`${v2652} === undefined`;
    if (v2651.useDefaults === "empty") {
      v2653 = (0, v2634._)`${v2653} || ${v2652} === null || ${v2652} === ""`;
    }
    v2648.if(v2653, (0, v2634._)`${v2652} = ${(0, v2634.stringify)(v2647)}`);
  }
  return defaults;
}
var keyword = {};
var code = {};
var hasRequiredCode;
function requireCode() {
  if (hasRequiredCode) {
    return code;
  }
  hasRequiredCode = 1;
  Object.defineProperty(code, "__esModule", {
    value: true
  });
  code.validateUnion = code.validateArray = code.usePattern = code.callValidateCode = code.schemaProperties = code.allSchemaProperties = code.noPropertyInData = code.propertyInData = code.isOwnProperty = code.hasPropFunc = code.reportMissingProp = code.checkMissingProp = code.checkReportMissingProp = undefined;
  const v2654 = requireCodegen();
  const v2655 = requireUtil();
  const v2656 = requireNames();
  const v2657 = requireUtil();
  function v2658(v2659, v2660) {
    const {
      gen: v2661,
      data: v2662,
      it: v2663
    } = v2659;
    v2661.if(v2664(v2661, v2662, v2660, v2663.opts.ownProperties), () => {
      v2659.setParams({
        missingProperty: (0, v2654._)`${v2660}`
      }, true);
      v2659.error();
    });
  }
  code.checkReportMissingProp = v2658;
  function v2665({
    gen: v2666,
    data: v2667,
    it: {
      opts: v2668
    }
  }, v2669, v2670) {
    return (0, v2654.or)(...v2669.map(v2671 => (0, v2654.and)(v2664(v2666, v2667, v2671, v2668.ownProperties), (0, v2654._)`${v2670} = ${v2671}`)));
  }
  code.checkMissingProp = v2665;
  function v2672(v2673, v2674) {
    v2673.setParams({
      missingProperty: v2674
    }, true);
    v2673.error();
  }
  code.reportMissingProp = v2672;
  function v2675(v2676) {
    return v2676.scopeValue("func", {
      ref: Object.prototype.hasOwnProperty,
      code: (0, v2654._)`Object.prototype.hasOwnProperty`
    });
  }
  code.hasPropFunc = v2675;
  function v2677(v2678, v2679, v2680) {
    return (0, v2654._)`${v2675(v2678)}.call(${v2679}, ${v2680})`;
  }
  code.isOwnProperty = v2677;
  function v2681(v2682, v2683, v2684, v2685) {
    const v2686 = (0, v2654._)`${v2683}${(0, v2654.getProperty)(v2684)} !== undefined`;
    if (v2685) {
      return (0, v2654._)`${v2686} && ${v2677(v2682, v2683, v2684)}`;
    } else {
      return v2686;
    }
  }
  code.propertyInData = v2681;
  function v2664(v2687, v2688, v2689, v2690) {
    const v2691 = (0, v2654._)`${v2688}${(0, v2654.getProperty)(v2689)} === undefined`;
    if (v2690) {
      return (0, v2654.or)(v2691, (0, v2654.not)(v2677(v2687, v2688, v2689)));
    } else {
      return v2691;
    }
  }
  code.noPropertyInData = v2664;
  function v2692(v2693) {
    if (v2693) {
      return Object.keys(v2693).filter(v2694 => v2694 !== "__proto__");
    } else {
      return [];
    }
  }
  code.allSchemaProperties = v2692;
  function v2695(v2696, v2697) {
    return v2692(v2697).filter(v2698 => !(0, v2655.alwaysValidSchema)(v2696, v2697[v2698]));
  }
  code.schemaProperties = v2695;
  function v2699({
    schemaCode: v2700,
    data: v2701,
    it: {
      gen: v2702,
      topSchemaRef: v2703,
      schemaPath: v2704,
      errorPath: v2705
    },
    it: v2706
  }, v2707, v2708, v2709) {
    const v2710 = v2709 ? (0, v2654._)`${v2700}, ${v2701}, ${v2703}${v2704}` : v2701;
    const v2711 = [[v2656.default.instancePath, (0, v2654.strConcat)(v2656.default.instancePath, v2705)], [v2656.default.parentData, v2706.parentData], [v2656.default.parentDataProperty, v2706.parentDataProperty], [v2656.default.rootData, v2656.default.rootData]];
    if (v2706.opts.dynamicRef) {
      v2711.push([v2656.default.dynamicAnchors, v2656.default.dynamicAnchors]);
    }
    const v2712 = (0, v2654._)`${v2710}, ${v2702.object(...v2711)}`;
    if (v2708 !== v2654.nil) {
      return (0, v2654._)`${v2707}.call(${v2708}, ${v2712})`;
    } else {
      return (0, v2654._)`${v2707}(${v2712})`;
    }
  }
  code.callValidateCode = v2699;
  const v2713 = (0, v2654._)`new RegExp`;
  function v2714({
    gen: v2715,
    it: {
      opts: v2716
    }
  }, v2717) {
    const v2718 = v2716.unicodeRegExp ? "u" : "";
    const {
      regExp: v2719
    } = v2716.code;
    const v2720 = v2719(v2717, v2718);
    return v2715.scopeValue("pattern", {
      key: v2720.toString(),
      ref: v2720,
      code: (0, v2654._)`${v2719.code === "new RegExp" ? v2713 : (0, v2657.useFunc)(v2715, v2719)}(${v2717}, ${v2718})`
    });
  }
  code.usePattern = v2714;
  function v2721(v2722) {
    const {
      gen: v2723,
      data: v2724,
      keyword: v2725,
      it: v2726
    } = v2722;
    const v2727 = v2723.name("valid");
    if (v2726.allErrors) {
      const v2728 = v2723.let("valid", true);
      v2729(() => v2723.assign(v2728, false));
      return v2728;
    }
    v2723.var(v2727, true);
    v2729(() => v2723.break());
    return v2727;
    function v2729(v2730) {
      const v2731 = v2723.const("len", (0, v2654._)`${v2724}.length`);
      v2723.forRange("i", 0, v2731, v2732 => {
        v2722.subschema({
          keyword: v2725,
          dataProp: v2732,
          dataPropType: v2655.Type.Num
        }, v2727);
        v2723.if((0, v2654.not)(v2727), v2730);
      });
    }
  }
  code.validateArray = v2721;
  function v2733(v2734) {
    const {
      gen: v2735,
      schema: v2736,
      keyword: v2737,
      it: v2738
    } = v2734;
    if (!Array.isArray(v2736)) {
      throw new Error("ajv implementation error");
    }
    const v2739 = v2736.some(v2740 => (0, v2655.alwaysValidSchema)(v2738, v2740));
    if (v2739 && !v2738.opts.unevaluated) {
      return;
    }
    const v2741 = v2735.let("valid", false);
    const v2742 = v2735.name("_valid");
    v2735.block(() => v2736.forEach((v2743, v2744) => {
      const v2745 = v2734.subschema({
        keyword: v2737,
        schemaProp: v2744,
        compositeRule: true
      }, v2742);
      v2735.assign(v2741, (0, v2654._)`${v2741} || ${v2742}`);
      const v2746 = v2734.mergeValidEvaluated(v2745, v2742);
      if (!v2746) {
        v2735.if((0, v2654.not)(v2741));
      }
    }));
    v2734.result(v2741, () => v2734.reset(), () => v2734.error(true));
  }
  code.validateUnion = v2733;
  return code;
}
var hasRequiredKeyword;
function requireKeyword() {
  if (hasRequiredKeyword) {
    return keyword;
  }
  hasRequiredKeyword = 1;
  Object.defineProperty(keyword, "__esModule", {
    value: true
  });
  keyword.validateKeywordUsage = keyword.validSchemaType = keyword.funcKeywordCode = keyword.macroKeywordCode = undefined;
  const v2747 = requireCodegen();
  const v2748 = requireNames();
  const v2749 = requireCode();
  const v2750 = requireErrors();
  function v2751(v2752, v2753) {
    const {
      gen: v2754,
      keyword: v2755,
      schema: v2756,
      parentSchema: v2757,
      it: v2758
    } = v2752;
    const v2759 = v2753.macro.call(v2758.self, v2756, v2757, v2758);
    const v2760 = v2761(v2754, v2755, v2759);
    if (v2758.opts.validateSchema !== false) {
      v2758.self.validateSchema(v2759, true);
    }
    const v2762 = v2754.name("valid");
    v2752.subschema({
      schema: v2759,
      schemaPath: v2747.nil,
      errSchemaPath: v2758.errSchemaPath + "/" + v2755,
      topSchemaRef: v2760,
      compositeRule: true
    }, v2762);
    v2752.pass(v2762, () => v2752.error(true));
  }
  keyword.macroKeywordCode = v2751;
  function v2763(v2764, v2765) {
    const {
      gen: v2766,
      keyword: v2767,
      schema: v2768,
      parentSchema: v2769,
      $data: v2770,
      it: v2771
    } = v2764;
    v2772(v2771, v2765);
    const v2773 = !v2770 && v2765.compile ? v2765.compile.call(v2771.self, v2768, v2769, v2771) : v2765.validate;
    const v2774 = v2761(v2766, v2767, v2773);
    const v2775 = v2766.let("valid");
    v2764.block$data(v2775, v2776);
    v2764.ok(v2765.valid ?? v2775);
    function v2776() {
      if (v2765.errors === false) {
        v2777();
        if (v2765.modifying) {
          v2778(v2764);
        }
        v2779(() => v2764.error());
      } else {
        const v2780 = v2765.async ? v2781() : v2782();
        if (v2765.modifying) {
          v2778(v2764);
        }
        v2779(() => v2783(v2764, v2780));
      }
    }
    function v2781() {
      const v2784 = v2766.let("ruleErrs", null);
      v2766.try(() => v2777((0, v2747._)`await `), v2785 => v2766.assign(v2775, false).if((0, v2747._)`${v2785} instanceof ${v2771.ValidationError}`, () => v2766.assign(v2784, (0, v2747._)`${v2785}.errors`), () => v2766.throw(v2785)));
      return v2784;
    }
    function v2782() {
      const v2786 = (0, v2747._)`${v2774}.errors`;
      v2766.assign(v2786, null);
      v2777(v2747.nil);
      return v2786;
    }
    function v2777(v2787 = v2765.async ? (0, v2747._)`await ` : v2747.nil) {
      const v2788 = v2771.opts.passContext ? v2748.default.this : v2748.default.self;
      const v2789 = (!("compile" in v2765) || !!v2770) && v2765.schema !== false;
      v2766.assign(v2775, (0, v2747._)`${v2787}${(0, v2749.callValidateCode)(v2764, v2774, v2788, v2789)}`, v2765.modifying);
    }
    function v2779(v2790) {
      v2766.if((0, v2747.not)(v2765.valid ?? v2775), v2790);
    }
  }
  keyword.funcKeywordCode = v2763;
  function v2778(v2791) {
    const {
      gen: v2792,
      data: v2793,
      it: v2794
    } = v2791;
    v2792.if(v2794.parentData, () => v2792.assign(v2793, (0, v2747._)`${v2794.parentData}[${v2794.parentDataProperty}]`));
  }
  function v2783(v2795, v2796) {
    const {
      gen: v2797
    } = v2795;
    v2797.if((0, v2747._)`Array.isArray(${v2796})`, () => {
      v2797.assign(v2748.default.vErrors, (0, v2747._)`${v2748.default.vErrors} === null ? ${v2796} : ${v2748.default.vErrors}.concat(${v2796})`).assign(v2748.default.errors, (0, v2747._)`${v2748.default.vErrors}.length`);
      (0, v2750.extendErrors)(v2795);
    }, () => v2795.error());
  }
  function v2772({
    schemaEnv: v2798
  }, v2799) {
    if (v2799.async && !v2798.$async) {
      throw new Error("async keyword in sync schema");
    }
  }
  function v2761(v2800, v2801, v2802) {
    if (v2802 === undefined) {
      throw new Error("keyword \"" + v2801 + "\" failed to compile");
    }
    return v2800.scopeValue("keyword", typeof v2802 == "function" ? {
      ref: v2802
    } : {
      ref: v2802,
      code: (0, v2747.stringify)(v2802)
    });
  }
  function v2803(v2804, v2805, v2806 = false) {
    return !v2805.length || v2805.some(v2807 => v2807 === "array" ? Array.isArray(v2804) : v2807 === "object" ? v2804 && typeof v2804 == "object" && !Array.isArray(v2804) : typeof v2804 == v2807 || v2806 && typeof v2804 == "undefined");
  }
  keyword.validSchemaType = v2803;
  function v2808({
    schema: v2809,
    opts: v2810,
    self: v2811,
    errSchemaPath: v2812
  }, v2813, v2814) {
    if (Array.isArray(v2813.keyword) ? !v2813.keyword.includes(v2814) : v2813.keyword !== v2814) {
      throw new Error("ajv implementation error");
    }
    const v2815 = v2813.dependencies;
    if (v2815 === null || v2815 === undefined ? undefined : v2815.some(v2816 => !Object.prototype.hasOwnProperty.call(v2809, v2816))) {
      throw new Error("parent schema must have dependencies of " + v2814 + ": " + v2815.join(","));
    }
    if (v2813.validateSchema) {
      const v2817 = v2813.validateSchema(v2809[v2814]);
      if (!v2817) {
        const v2818 = "keyword \"" + v2814 + "\" value is invalid at path \"" + v2812 + "\": " + v2811.errorsText(v2813.validateSchema.errors);
        if (v2810.validateSchema === "log") {
          v2811.logger.error(v2818);
        } else {
          throw new Error(v2818);
        }
      }
    }
  }
  keyword.validateKeywordUsage = v2808;
  return keyword;
}
var subschema = {};
var hasRequiredSubschema;
function requireSubschema() {
  if (hasRequiredSubschema) {
    return subschema;
  }
  hasRequiredSubschema = 1;
  Object.defineProperty(subschema, "__esModule", {
    value: true
  });
  subschema.extendSubschemaMode = subschema.extendSubschemaData = subschema.getSubschema = undefined;
  const v2819 = requireCodegen();
  const v2820 = requireUtil();
  function v2821(v2822, {
    keyword: v2823,
    schemaProp: v2824,
    schema: v2825,
    schemaPath: v2826,
    errSchemaPath: v2827,
    topSchemaRef: v2828
  }) {
    if (v2823 !== undefined && v2825 !== undefined) {
      throw new Error("both \"keyword\" and \"schema\" passed, only one allowed");
    }
    if (v2823 !== undefined) {
      const v2829 = v2822.schema[v2823];
      if (v2824 === undefined) {
        return {
          schema: v2829,
          schemaPath: (0, v2819._)`${v2822.schemaPath}${(0, v2819.getProperty)(v2823)}`,
          errSchemaPath: v2822.errSchemaPath + "/" + v2823
        };
      } else {
        return {
          schema: v2829[v2824],
          schemaPath: (0, v2819._)`${v2822.schemaPath}${(0, v2819.getProperty)(v2823)}${(0, v2819.getProperty)(v2824)}`,
          errSchemaPath: v2822.errSchemaPath + "/" + v2823 + "/" + (0, v2820.escapeFragment)(v2824)
        };
      }
    }
    if (v2825 !== undefined) {
      if (v2826 === undefined || v2827 === undefined || v2828 === undefined) {
        throw new Error("\"schemaPath\", \"errSchemaPath\" and \"topSchemaRef\" are required with \"schema\"");
      }
      return {
        schema: v2825,
        schemaPath: v2826,
        topSchemaRef: v2828,
        errSchemaPath: v2827
      };
    }
    throw new Error("either \"keyword\" or \"schema\" must be passed");
  }
  subschema.getSubschema = v2821;
  function v2830(v2831, v2832, {
    dataProp: v2833,
    dataPropType: v2834,
    data: v2835,
    dataTypes: v2836,
    propertyName: v2837
  }) {
    if (v2835 !== undefined && v2833 !== undefined) {
      throw new Error("both \"data\" and \"dataProp\" passed, only one allowed");
    }
    const {
      gen: v2838
    } = v2832;
    if (v2833 !== undefined) {
      const {
        errorPath: v2839,
        dataPathArr: v2840,
        opts: v2841
      } = v2832;
      const v2842 = v2838.let("data", (0, v2819._)`${v2832.data}${(0, v2819.getProperty)(v2833)}`, true);
      v2843(v2842);
      v2831.errorPath = (0, v2819.str)`${v2839}${(0, v2820.getErrorPath)(v2833, v2834, v2841.jsPropertySyntax)}`;
      v2831.parentDataProperty = (0, v2819._)`${v2833}`;
      v2831.dataPathArr = [...v2840, v2831.parentDataProperty];
    }
    if (v2835 !== undefined) {
      const v2844 = v2835 instanceof v2819.Name ? v2835 : v2838.let("data", v2835, true);
      v2843(v2844);
      if (v2837 !== undefined) {
        v2831.propertyName = v2837;
      }
    }
    if (v2836) {
      v2831.dataTypes = v2836;
    }
    function v2843(v2845) {
      v2831.data = v2845;
      v2831.dataLevel = v2832.dataLevel + 1;
      v2831.dataTypes = [];
      v2832.definedProperties = new Set();
      v2831.parentData = v2832.data;
      v2831.dataNames = [...v2832.dataNames, v2845];
    }
  }
  subschema.extendSubschemaData = v2830;
  function v2846(v2847, {
    jtdDiscriminator: v2848,
    jtdMetadata: v2849,
    compositeRule: v2850,
    createErrors: v2851,
    allErrors: v2852
  }) {
    if (v2850 !== undefined) {
      v2847.compositeRule = v2850;
    }
    if (v2851 !== undefined) {
      v2847.createErrors = v2851;
    }
    if (v2852 !== undefined) {
      v2847.allErrors = v2852;
    }
    v2847.jtdDiscriminator = v2848;
    v2847.jtdMetadata = v2849;
  }
  subschema.extendSubschemaMode = v2846;
  return subschema;
}
var resolve = {};
var fastDeepEqual;
var hasRequiredFastDeepEqual;
function requireFastDeepEqual() {
  if (hasRequiredFastDeepEqual) {
    return fastDeepEqual;
  }
  hasRequiredFastDeepEqual = 1;
  fastDeepEqual = function v2853(v2854, v2855) {
    if (v2854 === v2855) {
      return true;
    }
    if (v2854 && v2855 && typeof v2854 == "object" && typeof v2855 == "object") {
      if (v2854.constructor !== v2855.constructor) {
        return false;
      }
      var v2856;
      var v2857;
      var v2858;
      if (Array.isArray(v2854)) {
        v2856 = v2854.length;
        if (v2856 != v2855.length) {
          return false;
        }
        for (v2857 = v2856; v2857-- !== 0;) {
          if (!v2853(v2854[v2857], v2855[v2857])) {
            return false;
          }
        }
        return true;
      }
      if (v2854.constructor === RegExp) {
        return v2854.source === v2855.source && v2854.flags === v2855.flags;
      }
      if (v2854.valueOf !== Object.prototype.valueOf) {
        return v2854.valueOf() === v2855.valueOf();
      }
      if (v2854.toString !== Object.prototype.toString) {
        return v2854.toString() === v2855.toString();
      }
      v2858 = Object.keys(v2854);
      v2856 = v2858.length;
      if (v2856 !== Object.keys(v2855).length) {
        return false;
      }
      for (v2857 = v2856; v2857-- !== 0;) {
        if (!Object.prototype.hasOwnProperty.call(v2855, v2858[v2857])) {
          return false;
        }
      }
      for (v2857 = v2856; v2857-- !== 0;) {
        var v2859 = v2858[v2857];
        if (!v2853(v2854[v2859], v2855[v2859])) {
          return false;
        }
      }
      return true;
    }
    return v2854 !== v2854 && v2855 !== v2855;
  };
  return fastDeepEqual;
}
var jsonSchemaTraverse = {
  exports: {}
};
var hasRequiredJsonSchemaTraverse;
function requireJsonSchemaTraverse() {
  if (hasRequiredJsonSchemaTraverse) {
    return jsonSchemaTraverse.exports;
  }
  hasRequiredJsonSchemaTraverse = 1;
  var v2860 = jsonSchemaTraverse.exports = function (v2861, v2862, v2863) {
    if (typeof v2862 == "function") {
      v2863 = v2862;
      v2862 = {};
    }
    v2863 = v2862.cb || v2863;
    var v2864 = typeof v2863 == "function" ? v2863 : v2863.pre || function () {};
    var v2865 = v2863.post || function () {};
    v2866(v2862, v2864, v2865, v2861, "", v2861);
  };
  v2860.keywords = {
    additionalItems: true,
    items: true,
    contains: true,
    additionalProperties: true,
    propertyNames: true,
    not: true,
    if: true,
    then: true,
    else: true
  };
  v2860.arrayKeywords = {
    items: true,
    allOf: true,
    anyOf: true,
    oneOf: true
  };
  v2860.propsKeywords = {
    $defs: true,
    definitions: true,
    properties: true,
    patternProperties: true,
    dependencies: true
  };
  v2860.skipKeywords = {
    default: true,
    enum: true,
    const: true,
    required: true,
    maximum: true,
    minimum: true,
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    multipleOf: true,
    maxLength: true,
    minLength: true,
    pattern: true,
    format: true,
    maxItems: true,
    minItems: true,
    uniqueItems: true,
    maxProperties: true,
    minProperties: true
  };
  function v2866(v2867, v2868, v2869, v2870, v2871, v2872, v2873, v2874, v2875, v2876) {
    if (v2870 && typeof v2870 == "object" && !Array.isArray(v2870)) {
      v2868(v2870, v2871, v2872, v2873, v2874, v2875, v2876);
      for (var v2877 in v2870) {
        var v2878 = v2870[v2877];
        if (Array.isArray(v2878)) {
          if (v2877 in v2860.arrayKeywords) {
            for (var v2879 = 0; v2879 < v2878.length; v2879++) {
              v2866(v2867, v2868, v2869, v2878[v2879], v2871 + "/" + v2877 + "/" + v2879, v2872, v2871, v2877, v2870, v2879);
            }
          }
        } else if (v2877 in v2860.propsKeywords) {
          if (v2878 && typeof v2878 == "object") {
            for (var v2880 in v2878) {
              v2866(v2867, v2868, v2869, v2878[v2880], v2871 + "/" + v2877 + "/" + v2881(v2880), v2872, v2871, v2877, v2870, v2880);
            }
          }
        } else if (v2877 in v2860.keywords || v2867.allKeys && !(v2877 in v2860.skipKeywords)) {
          v2866(v2867, v2868, v2869, v2878, v2871 + "/" + v2877, v2872, v2871, v2877, v2870);
        }
      }
      v2869(v2870, v2871, v2872, v2873, v2874, v2875, v2876);
    }
  }
  function v2881(v2882) {
    return v2882.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return jsonSchemaTraverse.exports;
}
var hasRequiredResolve;
function requireResolve() {
  if (hasRequiredResolve) {
    return resolve;
  }
  hasRequiredResolve = 1;
  Object.defineProperty(resolve, "__esModule", {
    value: true
  });
  resolve.getSchemaRefs = resolve.resolveUrl = resolve.normalizeId = resolve._getFullPath = resolve.getFullPath = resolve.inlineRef = undefined;
  const v2883 = requireUtil();
  const v2884 = requireFastDeepEqual();
  const v2885 = requireJsonSchemaTraverse();
  const v2886 = new Set(["type", "format", "pattern", "maxLength", "minLength", "maxProperties", "minProperties", "maxItems", "minItems", "maximum", "minimum", "uniqueItems", "multipleOf", "required", "enum", "const"]);
  function v2887(v2888, v2889 = true) {
    if (typeof v2888 == "boolean") {
      return true;
    }
    if (v2889 === true) {
      return !v2890(v2888);
    }
    if (!v2889) {
      return false;
    }
    return v2891(v2888) <= v2889;
  }
  resolve.inlineRef = v2887;
  const v2892 = new Set(["$ref", "$recursiveRef", "$recursiveAnchor", "$dynamicRef", "$dynamicAnchor"]);
  function v2890(v2893) {
    for (const v2894 in v2893) {
      if (v2892.has(v2894)) {
        return true;
      }
      const v2895 = v2893[v2894];
      if (Array.isArray(v2895) && v2895.some(v2890)) {
        return true;
      }
      if (typeof v2895 == "object" && v2890(v2895)) {
        return true;
      }
    }
    return false;
  }
  function v2891(v2896) {
    let v2897 = 0;
    for (const v2898 in v2896) {
      if (v2898 === "$ref") {
        return Infinity;
      }
      v2897++;
      if (v2886.has(v2898)) {
        continue;
      }
      if (typeof v2896[v2898] == "object") {
        (0, v2883.eachItem)(v2896[v2898], v2899 => v2897 += v2891(v2899));
      }
      if (v2897 === Infinity) {
        return Infinity;
      }
    }
    return v2897;
  }
  function v2900(v2901, v2902 = "", v2903) {
    if (v2903 !== false) {
      v2902 = v2904(v2902);
    }
    const v2905 = v2901.parse(v2902);
    return v2906(v2901, v2905);
  }
  resolve.getFullPath = v2900;
  function v2906(v2907, v2908) {
    const v2909 = v2907.serialize(v2908);
    return v2909.split("#")[0] + "#";
  }
  resolve._getFullPath = v2906;
  const v2910 = /#\/?$/;
  function v2904(v2911) {
    if (v2911) {
      return v2911.replace(v2910, "");
    } else {
      return "";
    }
  }
  resolve.normalizeId = v2904;
  function v2912(v2913, v2914, v2915) {
    v2915 = v2904(v2915);
    return v2913.resolve(v2914, v2915);
  }
  resolve.resolveUrl = v2912;
  const v2916 = /^[a-z_][-a-z0-9._]*$/i;
  function v2917(v2918, v2919) {
    if (typeof v2918 == "boolean") {
      return {};
    }
    const {
      schemaId: v2920,
      uriResolver: v2921
    } = this.opts;
    const v2922 = v2904(v2918[v2920] || v2919);
    const v2923 = {
      "": v2922
    };
    const v2924 = v2900(v2921, v2922, false);
    const v2925 = {};
    const v2926 = new Set();
    v2885(v2918, {
      allKeys: true
    }, (v2927, v2928, v2929, v2930) => {
      if (v2930 === undefined) {
        return;
      }
      const v2931 = v2924 + v2928;
      let v2932 = v2923[v2930];
      if (typeof v2927[v2920] == "string") {
        v2932 = v2933.call(this, v2927[v2920]);
      }
      v2934.call(this, v2927.$anchor);
      v2934.call(this, v2927.$dynamicAnchor);
      v2923[v2928] = v2932;
      function v2933(v2935) {
        const v2936 = this.opts.uriResolver.resolve;
        v2935 = v2904(v2932 ? v2936(v2932, v2935) : v2935);
        if (v2926.has(v2935)) {
          throw v2937(v2935);
        }
        v2926.add(v2935);
        let v2938 = this.refs[v2935];
        if (typeof v2938 == "string") {
          v2938 = this.refs[v2938];
        }
        if (typeof v2938 == "object") {
          v2939(v2927, v2938.schema, v2935);
        } else if (v2935 !== v2904(v2931)) {
          if (v2935[0] === "#") {
            v2939(v2927, v2925[v2935], v2935);
            v2925[v2935] = v2927;
          } else {
            this.refs[v2935] = v2931;
          }
        }
        return v2935;
      }
      function v2934(v2940) {
        if (typeof v2940 == "string") {
          if (!v2916.test(v2940)) {
            throw new Error("invalid anchor \"" + v2940 + "\"");
          }
          v2933.call(this, "#" + v2940);
        }
      }
    });
    return v2925;
    function v2939(v2941, v2942, v2943) {
      if (v2942 !== undefined && !v2884(v2941, v2942)) {
        throw v2937(v2943);
      }
    }
    function v2937(v2944) {
      return new Error("reference \"" + v2944 + "\" resolves to more than one schema");
    }
  }
  resolve.getSchemaRefs = v2917;
  return resolve;
}
var hasRequiredValidate;
function requireValidate() {
  if (hasRequiredValidate) {
    return validate;
  }
  hasRequiredValidate = 1;
  Object.defineProperty(validate, "__esModule", {
    value: true
  });
  validate.getData = validate.KeywordCxt = validate.validateFunctionCode = undefined;
  const v2945 = requireBoolSchema();
  const v2946 = requireDataType();
  const v2947 = requireApplicability();
  const v2948 = requireDataType();
  const v2949 = requireDefaults();
  const v2950 = requireKeyword();
  const v2951 = requireSubschema();
  const v2952 = requireCodegen();
  const v2953 = requireNames();
  const v2954 = requireResolve();
  const v2955 = requireUtil();
  const v2956 = requireErrors();
  function v2957(v2958) {
    if (v2959(v2958)) {
      v2960(v2958);
      if (v2961(v2958)) {
        v2962(v2958);
        return;
      }
    }
    v2963(v2958, () => (0, v2945.topBoolOrEmptySchema)(v2958));
  }
  validate.validateFunctionCode = v2957;
  function v2963({
    gen: v2964,
    validateName: v2965,
    schema: v2966,
    schemaEnv: v2967,
    opts: v2968
  }, v2969) {
    if (v2968.code.es5) {
      v2964.func(v2965, (0, v2952._)`${v2953.default.data}, ${v2953.default.valCxt}`, v2967.$async, () => {
        v2964.code((0, v2952._)`"use strict"; ${v2970(v2966, v2968)}`);
        v2971(v2964, v2968);
        v2964.code(v2969);
      });
    } else {
      v2964.func(v2965, (0, v2952._)`${v2953.default.data}, ${v2972(v2968)}`, v2967.$async, () => v2964.code(v2970(v2966, v2968)).code(v2969));
    }
  }
  function v2972(v2973) {
    return (0, v2952._)`{${v2953.default.instancePath}="", ${v2953.default.parentData}, ${v2953.default.parentDataProperty}, ${v2953.default.rootData}=${v2953.default.data}${v2973.dynamicRef ? (0, v2952._)`, ${v2953.default.dynamicAnchors}={}` : v2952.nil}}={}`;
  }
  function v2971(v2974, v2975) {
    v2974.if(v2953.default.valCxt, () => {
      v2974.var(v2953.default.instancePath, (0, v2952._)`${v2953.default.valCxt}.${v2953.default.instancePath}`);
      v2974.var(v2953.default.parentData, (0, v2952._)`${v2953.default.valCxt}.${v2953.default.parentData}`);
      v2974.var(v2953.default.parentDataProperty, (0, v2952._)`${v2953.default.valCxt}.${v2953.default.parentDataProperty}`);
      v2974.var(v2953.default.rootData, (0, v2952._)`${v2953.default.valCxt}.${v2953.default.rootData}`);
      if (v2975.dynamicRef) {
        v2974.var(v2953.default.dynamicAnchors, (0, v2952._)`${v2953.default.valCxt}.${v2953.default.dynamicAnchors}`);
      }
    }, () => {
      v2974.var(v2953.default.instancePath, (0, v2952._)`""`);
      v2974.var(v2953.default.parentData, (0, v2952._)`undefined`);
      v2974.var(v2953.default.parentDataProperty, (0, v2952._)`undefined`);
      v2974.var(v2953.default.rootData, v2953.default.data);
      if (v2975.dynamicRef) {
        v2974.var(v2953.default.dynamicAnchors, (0, v2952._)`{}`);
      }
    });
  }
  function v2962(v2976) {
    const {
      schema: v2977,
      opts: v2978,
      gen: v2979
    } = v2976;
    v2963(v2976, () => {
      if (v2978.$comment && v2977.$comment) {
        v2980(v2976);
      }
      v2981(v2976);
      v2979.let(v2953.default.vErrors, null);
      v2979.let(v2953.default.errors, 0);
      if (v2978.unevaluated) {
        v2982(v2976);
      }
      v2983(v2976);
      v2984(v2976);
    });
    return;
  }
  function v2982(v2985) {
    const {
      gen: v2986,
      validateName: v2987
    } = v2985;
    v2985.evaluated = v2986.const("evaluated", (0, v2952._)`${v2987}.evaluated`);
    v2986.if((0, v2952._)`${v2985.evaluated}.dynamicProps`, () => v2986.assign((0, v2952._)`${v2985.evaluated}.props`, (0, v2952._)`undefined`));
    v2986.if((0, v2952._)`${v2985.evaluated}.dynamicItems`, () => v2986.assign((0, v2952._)`${v2985.evaluated}.items`, (0, v2952._)`undefined`));
  }
  function v2970(v2988, v2989) {
    const v2990 = typeof v2988 == "object" && v2988[v2989.schemaId];
    if (v2990 && (v2989.code.source || v2989.code.process)) {
      return (0, v2952._)`/*# sourceURL=${v2990} */`;
    } else {
      return v2952.nil;
    }
  }
  function v2991(v2992, v2993) {
    if (v2959(v2992)) {
      v2960(v2992);
      if (v2961(v2992)) {
        v2994(v2992, v2993);
        return;
      }
    }
    (0, v2945.boolOrEmptySchema)(v2992, v2993);
  }
  function v2961({
    schema: v2995,
    self: v2996
  }) {
    if (typeof v2995 == "boolean") {
      return !v2995;
    }
    for (const v2997 in v2995) {
      if (v2996.RULES.all[v2997]) {
        return true;
      }
    }
    return false;
  }
  function v2959(v2998) {
    return typeof v2998.schema != "boolean";
  }
  function v2994(v2999, v3000) {
    const {
      schema: v3001,
      gen: v3002,
      opts: v3003
    } = v2999;
    if (v3003.$comment && v3001.$comment) {
      v2980(v2999);
    }
    v3004(v2999);
    v3005(v2999);
    const v3006 = v3002.const("_errs", v2953.default.errors);
    v2983(v2999, v3006);
    v3002.var(v3000, (0, v2952._)`${v3006} === ${v2953.default.errors}`);
  }
  function v2960(v3007) {
    (0, v2955.checkUnknownRules)(v3007);
    v3008(v3007);
  }
  function v2983(v3009, v3010) {
    if (v3009.opts.jtd) {
      return v3011(v3009, [], false, v3010);
    }
    const v3012 = (0, v2946.getSchemaTypes)(v3009.schema);
    const v3013 = (0, v2946.coerceAndCheckDataType)(v3009, v3012);
    v3011(v3009, v3012, !v3013, v3010);
  }
  function v3008(v3014) {
    const {
      schema: v3015,
      errSchemaPath: v3016,
      opts: v3017,
      self: v3018
    } = v3014;
    if (v3015.$ref && v3017.ignoreKeywordsWithRef && (0, v2955.schemaHasRulesButRef)(v3015, v3018.RULES)) {
      v3018.logger.warn("$ref: keywords ignored in schema at path \"" + v3016 + "\"");
    }
  }
  function v2981(v3019) {
    const {
      schema: v3020,
      opts: v3021
    } = v3019;
    if (v3020.default !== undefined && v3021.useDefaults && v3021.strictSchema) {
      (0, v2955.checkStrictMode)(v3019, "default is ignored in the schema root");
    }
  }
  function v3004(v3022) {
    const v3023 = v3022.schema[v3022.opts.schemaId];
    if (v3023) {
      v3022.baseId = (0, v2954.resolveUrl)(v3022.opts.uriResolver, v3022.baseId, v3023);
    }
  }
  function v3005(v3024) {
    if (v3024.schema.$async && !v3024.schemaEnv.$async) {
      throw new Error("async schema in sync schema");
    }
  }
  function v2980({
    gen: v3025,
    schemaEnv: v3026,
    schema: v3027,
    errSchemaPath: v3028,
    opts: v3029
  }) {
    const v3030 = v3027.$comment;
    if (v3029.$comment === true) {
      v3025.code((0, v2952._)`${v2953.default.self}.logger.log(${v3030})`);
    } else if (typeof v3029.$comment == "function") {
      const v3031 = (0, v2952.str)`${v3028}/$comment`;
      const v3032 = v3025.scopeValue("root", {
        ref: v3026.root
      });
      v3025.code((0, v2952._)`${v2953.default.self}.opts.$comment(${v3030}, ${v3031}, ${v3032}.schema)`);
    }
  }
  function v2984(v3033) {
    const {
      gen: v3034,
      schemaEnv: v3035,
      validateName: v3036,
      ValidationError: v3037,
      opts: v3038
    } = v3033;
    if (v3035.$async) {
      v3034.if((0, v2952._)`${v2953.default.errors} === 0`, () => v3034.return(v2953.default.data), () => v3034.throw((0, v2952._)`new ${v3037}(${v2953.default.vErrors})`));
    } else {
      v3034.assign((0, v2952._)`${v3036}.errors`, v2953.default.vErrors);
      if (v3038.unevaluated) {
        v3039(v3033);
      }
      v3034.return((0, v2952._)`${v2953.default.errors} === 0`);
    }
  }
  function v3039({
    gen: v3040,
    evaluated: v3041,
    props: v3042,
    items: v3043
  }) {
    if (v3042 instanceof v2952.Name) {
      v3040.assign((0, v2952._)`${v3041}.props`, v3042);
    }
    if (v3043 instanceof v2952.Name) {
      v3040.assign((0, v2952._)`${v3041}.items`, v3043);
    }
  }
  function v3011(v3044, v3045, v3046, v3047) {
    const {
      gen: v3048,
      schema: v3049,
      data: v3050,
      allErrors: v3051,
      opts: v3052,
      self: v3053
    } = v3044;
    const {
      RULES: v3054
    } = v3053;
    if (v3049.$ref && (v3052.ignoreKeywordsWithRef || !(0, v2955.schemaHasRulesButRef)(v3049, v3054))) {
      v3048.block(() => v3055(v3044, "$ref", v3054.all.$ref.definition));
      return;
    }
    if (!v3052.jtd) {
      v3056(v3044, v3045);
    }
    v3048.block(() => {
      for (const v3057 of v3054.rules) {
        v3058(v3057);
      }
      v3058(v3054.post);
    });
    function v3058(v3059) {
      if (!(0, v2947.shouldUseGroup)(v3049, v3059)) {
        return;
      }
      if (v3059.type) {
        v3048.if((0, v2948.checkDataType)(v3059.type, v3050, v3052.strictNumbers));
        v3060(v3044, v3059);
        if (v3045.length === 1 && v3045[0] === v3059.type && v3046) {
          v3048.else();
          (0, v2948.reportTypeError)(v3044);
        }
        v3048.endIf();
      } else {
        v3060(v3044, v3059);
      }
      if (!v3051) {
        v3048.if((0, v2952._)`${v2953.default.errors} === ${v3047 || 0}`);
      }
    }
  }
  function v3060(v3061, v3062) {
    const {
      gen: v3063,
      schema: v3064,
      opts: {
        useDefaults: v3065
      }
    } = v3061;
    if (v3065) {
      (0, v2949.assignDefaults)(v3061, v3062.type);
    }
    v3063.block(() => {
      for (const v3066 of v3062.rules) {
        if ((0, v2947.shouldUseRule)(v3064, v3066)) {
          v3055(v3061, v3066.keyword, v3066.definition, v3062.type);
        }
      }
    });
  }
  function v3056(v3067, v3068) {
    if (v3067.schemaEnv.meta || !v3067.opts.strictTypes) {
      return;
    }
    v3069(v3067, v3068);
    if (!v3067.opts.allowUnionTypes) {
      v3070(v3067, v3068);
    }
    v3071(v3067, v3067.dataTypes);
  }
  function v3069(v3072, v3073) {
    if (!v3073.length) {
      return;
    }
    if (!v3072.dataTypes.length) {
      v3072.dataTypes = v3073;
      return;
    }
    v3073.forEach(v3074 => {
      if (!v3075(v3072.dataTypes, v3074)) {
        v3076(v3072, "type \"" + v3074 + "\" not allowed by context \"" + v3072.dataTypes.join(",") + "\"");
      }
    });
    v3077(v3072, v3073);
  }
  function v3070(v3078, v3079) {
    if (v3079.length > 1 && (v3079.length !== 2 || !v3079.includes("null"))) {
      v3076(v3078, "use allowUnionTypes to allow union type keyword");
    }
  }
  function v3071(v3080, v3081) {
    const v3082 = v3080.self.RULES.all;
    for (const v3083 in v3082) {
      const v3084 = v3082[v3083];
      if (typeof v3084 == "object" && (0, v2947.shouldUseRule)(v3080.schema, v3084)) {
        const {
          type: v3085
        } = v3084.definition;
        if (v3085.length && !v3085.some(v3086 => v3087(v3081, v3086))) {
          v3076(v3080, "missing type \"" + v3085.join(",") + "\" for keyword \"" + v3083 + "\"");
        }
      }
    }
  }
  function v3087(v3088, v3089) {
    return v3088.includes(v3089) || v3089 === "number" && v3088.includes("integer");
  }
  function v3075(v3090, v3091) {
    return v3090.includes(v3091) || v3091 === "integer" && v3090.includes("number");
  }
  function v3077(v3092, v3093) {
    const v3094 = [];
    for (const v3095 of v3092.dataTypes) {
      if (v3075(v3093, v3095)) {
        v3094.push(v3095);
      } else if (v3093.includes("integer") && v3095 === "number") {
        v3094.push("integer");
      }
    }
    v3092.dataTypes = v3094;
  }
  function v3076(v3096, v3097) {
    const v3098 = v3096.schemaEnv.baseId + v3096.errSchemaPath;
    v3097 += " at \"" + v3098 + "\" (strictTypes)";
    (0, v2955.checkStrictMode)(v3096, v3097, v3096.opts.strictTypes);
  }
  class v3099 {
    constructor(v3100, v3101, v3102) {
      (0, v2950.validateKeywordUsage)(v3100, v3101, v3102);
      this.gen = v3100.gen;
      this.allErrors = v3100.allErrors;
      this.keyword = v3102;
      this.data = v3100.data;
      this.schema = v3100.schema[v3102];
      this.$data = v3101.$data && v3100.opts.$data && this.schema && this.schema.$data;
      this.schemaValue = (0, v2955.schemaRefOrVal)(v3100, this.schema, v3102, this.$data);
      this.schemaType = v3101.schemaType;
      this.parentSchema = v3100.schema;
      this.params = {};
      this.it = v3100;
      this.def = v3101;
      if (this.$data) {
        this.schemaCode = v3100.gen.const("vSchema", v3103(this.$data, v3100));
      } else {
        this.schemaCode = this.schemaValue;
        if (!(0, v2950.validSchemaType)(this.schema, v3101.schemaType, v3101.allowUndefined)) {
          throw new Error(v3102 + " value must be " + JSON.stringify(v3101.schemaType));
        }
      }
      if ("code" in v3101 ? v3101.trackErrors : v3101.errors !== false) {
        this.errsCount = v3100.gen.const("_errs", v2953.default.errors);
      }
    }
    result(v3104, v3105, v3106) {
      this.failResult((0, v2952.not)(v3104), v3105, v3106);
    }
    failResult(v3107, v3108, v3109) {
      this.gen.if(v3107);
      if (v3109) {
        v3109();
      } else {
        this.error();
      }
      if (v3108) {
        this.gen.else();
        v3108();
        if (this.allErrors) {
          this.gen.endIf();
        }
      } else if (this.allErrors) {
        this.gen.endIf();
      } else {
        this.gen.else();
      }
    }
    pass(v3110, v3111) {
      this.failResult((0, v2952.not)(v3110), undefined, v3111);
    }
    fail(v3112) {
      if (v3112 === undefined) {
        this.error();
        if (!this.allErrors) {
          this.gen.if(false);
        }
        return;
      }
      this.gen.if(v3112);
      this.error();
      if (this.allErrors) {
        this.gen.endIf();
      } else {
        this.gen.else();
      }
    }
    fail$data(v3113) {
      if (!this.$data) {
        return this.fail(v3113);
      }
      const {
        schemaCode: v3114
      } = this;
      this.fail((0, v2952._)`${v3114} !== undefined && (${(0, v2952.or)(this.invalid$data(), v3113)})`);
    }
    error(v3115, v3116, v3117) {
      if (v3116) {
        this.setParams(v3116);
        this._error(v3115, v3117);
        this.setParams({});
        return;
      }
      this._error(v3115, v3117);
    }
    _error(v3118, v3119) {
      (v3118 ? v2956.reportExtraError : v2956.reportError)(this, this.def.error, v3119);
    }
    $dataError() {
      (0, v2956.reportError)(this, this.def.$dataError || v2956.keyword$DataError);
    }
    reset() {
      if (this.errsCount === undefined) {
        throw new Error("add \"trackErrors\" to keyword definition");
      }
      (0, v2956.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(v3120) {
      if (!this.allErrors) {
        this.gen.if(v3120);
      }
    }
    setParams(v3121, v3122) {
      if (v3122) {
        Object.assign(this.params, v3121);
      } else {
        this.params = v3121;
      }
    }
    block$data(v3123, v3124, v3125 = v2952.nil) {
      this.gen.block(() => {
        this.check$data(v3123, v3125);
        v3124();
      });
    }
    check$data(v3126 = v2952.nil, v3127 = v2952.nil) {
      if (!this.$data) {
        return;
      }
      const {
        gen: v3128,
        schemaCode: v3129,
        schemaType: v3130,
        def: v3131
      } = this;
      v3128.if((0, v2952.or)((0, v2952._)`${v3129} === undefined`, v3127));
      if (v3126 !== v2952.nil) {
        v3128.assign(v3126, true);
      }
      if (v3130.length || v3131.validateSchema) {
        v3128.elseIf(this.invalid$data());
        this.$dataError();
        if (v3126 !== v2952.nil) {
          v3128.assign(v3126, false);
        }
      }
      v3128.else();
    }
    invalid$data() {
      const {
        gen: v3132,
        schemaCode: v3133,
        schemaType: v3134,
        def: v3135,
        it: v3136
      } = this;
      return (0, v2952.or)(v3137(), v3138());
      function v3137() {
        if (v3134.length) {
          if (!(v3133 instanceof v2952.Name)) {
            throw new Error("ajv implementation error");
          }
          const v3139 = Array.isArray(v3134) ? v3134 : [v3134];
          return (0, v2952._)`${(0, v2948.checkDataTypes)(v3139, v3133, v3136.opts.strictNumbers, v2948.DataType.Wrong)}`;
        }
        return v2952.nil;
      }
      function v3138() {
        if (v3135.validateSchema) {
          const v3140 = v3132.scopeValue("validate$data", {
            ref: v3135.validateSchema
          });
          return (0, v2952._)`!${v3140}(${v3133})`;
        }
        return v2952.nil;
      }
    }
    subschema(v3141, v3142) {
      const v3143 = (0, v2951.getSubschema)(this.it, v3141);
      (0, v2951.extendSubschemaData)(v3143, this.it, v3141);
      (0, v2951.extendSubschemaMode)(v3143, v3141);
      const v3144 = {
        ...this.it,
        ...v3143,
        items: undefined,
        props: undefined
      };
      v2991(v3144, v3142);
      return v3144;
    }
    mergeEvaluated(v3145, v3146) {
      const {
        it: v3147,
        gen: v3148
      } = this;
      if (!v3147.opts.unevaluated) {
        return;
      }
      if (v3147.props !== true && v3145.props !== undefined) {
        v3147.props = v2955.mergeEvaluated.props(v3148, v3145.props, v3147.props, v3146);
      }
      if (v3147.items !== true && v3145.items !== undefined) {
        v3147.items = v2955.mergeEvaluated.items(v3148, v3145.items, v3147.items, v3146);
      }
    }
    mergeValidEvaluated(v3149, v3150) {
      const {
        it: v3151,
        gen: v3152
      } = this;
      if (v3151.opts.unevaluated && (v3151.props !== true || v3151.items !== true)) {
        v3152.if(v3150, () => this.mergeEvaluated(v3149, v2952.Name));
        return true;
      }
    }
  }
  validate.KeywordCxt = v3099;
  function v3055(v3153, v3154, v3155, v3156) {
    const v3157 = new v3099(v3153, v3155, v3154);
    if ("code" in v3155) {
      v3155.code(v3157, v3156);
    } else if (v3157.$data && v3155.validate) {
      (0, v2950.funcKeywordCode)(v3157, v3155);
    } else if ("macro" in v3155) {
      (0, v2950.macroKeywordCode)(v3157, v3155);
    } else if (v3155.compile || v3155.validate) {
      (0, v2950.funcKeywordCode)(v3157, v3155);
    }
  }
  const v3158 = /^\/(?:[^~]|~0|~1)*$/;
  const v3159 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function v3103(v3160, {
    dataLevel: v3161,
    dataNames: v3162,
    dataPathArr: v3163
  }) {
    let v3164;
    let v3165;
    if (v3160 === "") {
      return v2953.default.rootData;
    }
    if (v3160[0] === "/") {
      if (!v3158.test(v3160)) {
        throw new Error("Invalid JSON-pointer: " + v3160);
      }
      v3164 = v3160;
      v3165 = v2953.default.rootData;
    } else {
      const v3166 = v3159.exec(v3160);
      if (!v3166) {
        throw new Error("Invalid JSON-pointer: " + v3160);
      }
      const v3167 = +v3166[1];
      v3164 = v3166[2];
      if (v3164 === "#") {
        if (v3167 >= v3161) {
          throw new Error(v3168("property/index", v3167));
        }
        return v3163[v3161 - v3167];
      }
      if (v3167 > v3161) {
        throw new Error(v3168("data", v3167));
      }
      v3165 = v3162[v3161 - v3167];
      if (!v3164) {
        return v3165;
      }
    }
    let v3169 = v3165;
    const v3170 = v3164.split("/");
    for (const v3171 of v3170) {
      if (v3171) {
        v3165 = (0, v2952._)`${v3165}${(0, v2952.getProperty)((0, v2955.unescapeJsonPointer)(v3171))}`;
        v3169 = (0, v2952._)`${v3169} && ${v3165}`;
      }
    }
    return v3169;
    function v3168(v3172, v3173) {
      return "Cannot access " + v3172 + " " + v3173 + " levels up, current level is " + v3161;
    }
  }
  validate.getData = v3103;
  return validate;
}
var validation_error = {};
var hasRequiredValidation_error;
function requireValidation_error() {
  if (hasRequiredValidation_error) {
    return validation_error;
  }
  hasRequiredValidation_error = 1;
  Object.defineProperty(validation_error, "__esModule", {
    value: true
  });
  class v3174 extends Error {
    constructor(v3175) {
      super("validation failed");
      this.errors = v3175;
      this.ajv = this.validation = true;
    }
  }
  validation_error.default = v3174;
  return validation_error;
}
var ref_error = {};
var hasRequiredRef_error;
function requireRef_error() {
  if (hasRequiredRef_error) {
    return ref_error;
  }
  hasRequiredRef_error = 1;
  Object.defineProperty(ref_error, "__esModule", {
    value: true
  });
  const v3176 = requireResolve();
  class v3177 extends Error {
    constructor(v3178, v3179, v3180, v3181) {
      super(v3181 || "can't resolve reference " + v3180 + " from id " + v3179);
      this.missingRef = (0, v3176.resolveUrl)(v3178, v3179, v3180);
      this.missingSchema = (0, v3176.normalizeId)((0, v3176.getFullPath)(v3178, this.missingRef));
    }
  }
  ref_error.default = v3177;
  return ref_error;
}
var compile = {};
var hasRequiredCompile;
function requireCompile() {
  if (hasRequiredCompile) {
    return compile;
  }
  hasRequiredCompile = 1;
  Object.defineProperty(compile, "__esModule", {
    value: true
  });
  compile.resolveSchema = compile.getCompilingSchema = compile.resolveRef = compile.compileSchema = compile.SchemaEnv = undefined;
  const v3182 = requireCodegen();
  const v3183 = requireValidation_error();
  const v3184 = requireNames();
  const v3185 = requireResolve();
  const v3186 = requireUtil();
  const v3187 = requireValidate();
  class v3188 {
    constructor(v3189) {
      this.refs = {};
      this.dynamicAnchors = {};
      let v3190;
      if (typeof v3189.schema == "object") {
        v3190 = v3189.schema;
      }
      this.schema = v3189.schema;
      this.schemaId = v3189.schemaId;
      this.root = v3189.root || this;
      this.baseId = v3189.baseId ?? (0, v3185.normalizeId)(v3190?.[v3189.schemaId || "$id"]);
      this.schemaPath = v3189.schemaPath;
      this.localRefs = v3189.localRefs;
      this.meta = v3189.meta;
      this.$async = v3190?.$async;
      this.refs = {};
    }
  }
  compile.SchemaEnv = v3188;
  function v3191(v3192) {
    const v3193 = v3194.call(this, v3192);
    if (v3193) {
      return v3193;
    }
    const v3195 = (0, v3185.getFullPath)(this.opts.uriResolver, v3192.root.baseId);
    const {
      es5: v3196,
      lines: v3197
    } = this.opts.code;
    const {
      ownProperties: v3198
    } = this.opts;
    const v3199 = new v3182.CodeGen(this.scope, {
      es5: v3196,
      lines: v3197,
      ownProperties: v3198
    });
    let v3200;
    if (v3192.$async) {
      v3200 = v3199.scopeValue("Error", {
        ref: v3183.default,
        code: (0, v3182._)`require("ajv/dist/runtime/validation_error").default`
      });
    }
    const v3201 = v3199.scopeName("validate");
    v3192.validateName = v3201;
    const v3202 = {
      gen: v3199,
      allErrors: this.opts.allErrors,
      data: v3184.default.data,
      parentData: v3184.default.parentData,
      parentDataProperty: v3184.default.parentDataProperty,
      dataNames: [v3184.default.data],
      dataPathArr: [v3182.nil],
      dataLevel: 0,
      dataTypes: [],
      definedProperties: new Set(),
      topSchemaRef: v3199.scopeValue("schema", this.opts.code.source === true ? {
        ref: v3192.schema,
        code: (0, v3182.stringify)(v3192.schema)
      } : {
        ref: v3192.schema
      }),
      validateName: v3201,
      ValidationError: v3200,
      schema: v3192.schema,
      schemaEnv: v3192,
      rootId: v3195,
      baseId: v3192.baseId || v3195,
      schemaPath: v3182.nil,
      errSchemaPath: v3192.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, v3182._)`""`,
      opts: this.opts,
      self: this
    };
    let v3203;
    try {
      this._compilations.add(v3192);
      (0, v3187.validateFunctionCode)(v3202);
      v3199.optimize(this.opts.code.optimize);
      const v3204 = v3199.toString();
      v3203 = v3199.scopeRefs(v3184.default.scope) + "return " + v3204;
      if (this.opts.code.process) {
        v3203 = this.opts.code.process(v3203, v3192);
      }
      const v3205 = new Function("" + v3184.default.self, "" + v3184.default.scope, v3203);
      const v3206 = v3205(this, this.scope.get());
      this.scope.value(v3201, {
        ref: v3206
      });
      v3206.errors = null;
      v3206.schema = v3192.schema;
      v3206.schemaEnv = v3192;
      if (v3192.$async) {
        v3206.$async = true;
      }
      if (this.opts.code.source === true) {
        v3206.source = {
          validateName: v3201,
          validateCode: v3204,
          scopeValues: v3199._values
        };
      }
      if (this.opts.unevaluated) {
        const {
          props: v3207,
          items: v3208
        } = v3202;
        v3206.evaluated = {
          props: v3207 instanceof v3182.Name ? undefined : v3207,
          items: v3208 instanceof v3182.Name ? undefined : v3208,
          dynamicProps: v3207 instanceof v3182.Name,
          dynamicItems: v3208 instanceof v3182.Name
        };
        if (v3206.source) {
          v3206.source.evaluated = (0, v3182.stringify)(v3206.evaluated);
        }
      }
      v3192.validate = v3206;
      return v3192;
    } catch (v3209) {
      delete v3192.validate;
      delete v3192.validateName;
      if (v3203) {
        this.logger.error("Error compiling schema, function code:", v3203);
      }
      throw v3209;
    } finally {
      this._compilations.delete(v3192);
    }
  }
  compile.compileSchema = v3191;
  function v3210(v3211, v3212, v3213) {
    v3213 = (0, v3185.resolveUrl)(this.opts.uriResolver, v3212, v3213);
    const v3214 = v3211.refs[v3213];
    if (v3214) {
      return v3214;
    }
    let v3215 = v3216.call(this, v3211, v3213);
    if (v3215 === undefined) {
      const v3217 = v3211.localRefs?.[v3213];
      const {
        schemaId: v3218
      } = this.opts;
      if (v3217) {
        v3215 = new v3188({
          schema: v3217,
          schemaId: v3218,
          root: v3211,
          baseId: v3212
        });
      }
    }
    if (v3215 === undefined) {
      return;
    }
    return v3211.refs[v3213] = v3219.call(this, v3215);
  }
  compile.resolveRef = v3210;
  function v3219(v3220) {
    if ((0, v3185.inlineRef)(v3220.schema, this.opts.inlineRefs)) {
      return v3220.schema;
    }
    if (v3220.validate) {
      return v3220;
    } else {
      return v3191.call(this, v3220);
    }
  }
  function v3194(v3221) {
    for (const v3222 of this._compilations) {
      if (v3223(v3222, v3221)) {
        return v3222;
      }
    }
  }
  compile.getCompilingSchema = v3194;
  function v3223(v3224, v3225) {
    return v3224.schema === v3225.schema && v3224.root === v3225.root && v3224.baseId === v3225.baseId;
  }
  function v3216(v3226, v3227) {
    let v3228;
    while (typeof (v3228 = this.refs[v3227]) == "string") {
      v3227 = v3228;
    }
    return v3228 || this.schemas[v3227] || v3229.call(this, v3226, v3227);
  }
  function v3229(v3230, v3231) {
    const v3232 = this.opts.uriResolver.parse(v3231);
    const v3233 = (0, v3185._getFullPath)(this.opts.uriResolver, v3232);
    let v3234 = (0, v3185.getFullPath)(this.opts.uriResolver, v3230.baseId, undefined);
    if (Object.keys(v3230.schema).length > 0 && v3233 === v3234) {
      return v3235.call(this, v3232, v3230);
    }
    const v3236 = (0, v3185.normalizeId)(v3233);
    const v3237 = this.refs[v3236] || this.schemas[v3236];
    if (typeof v3237 == "string") {
      const v3238 = v3229.call(this, v3230, v3237);
      if (typeof v3238?.schema !== "object") {
        return;
      }
      return v3235.call(this, v3232, v3238);
    }
    if (typeof v3237?.schema !== "object") {
      return;
    }
    if (!v3237.validate) {
      v3191.call(this, v3237);
    }
    if (v3236 === (0, v3185.normalizeId)(v3231)) {
      const {
        schema: v3239
      } = v3237;
      const {
        schemaId: v3240
      } = this.opts;
      const v3241 = v3239[v3240];
      if (v3241) {
        v3234 = (0, v3185.resolveUrl)(this.opts.uriResolver, v3234, v3241);
      }
      return new v3188({
        schema: v3239,
        schemaId: v3240,
        root: v3230,
        baseId: v3234
      });
    }
    return v3235.call(this, v3232, v3237);
  }
  compile.resolveSchema = v3229;
  const v3242 = new Set(["properties", "patternProperties", "enum", "dependencies", "definitions"]);
  function v3235(v3243, {
    baseId: v3244,
    schema: v3245,
    root: v3246
  }) {
    if (v3243.fragment?.[0] !== "/") {
      return;
    }
    for (const v3247 of v3243.fragment.slice(1).split("/")) {
      if (typeof v3245 === "boolean") {
        return;
      }
      const v3248 = v3245[(0, v3186.unescapeFragment)(v3247)];
      if (v3248 === undefined) {
        return;
      }
      v3245 = v3248;
      const v3249 = typeof v3245 === "object" && v3245[this.opts.schemaId];
      if (!v3242.has(v3247) && v3249) {
        v3244 = (0, v3185.resolveUrl)(this.opts.uriResolver, v3244, v3249);
      }
    }
    let v3250;
    if (typeof v3245 != "boolean" && v3245.$ref && !(0, v3186.schemaHasRulesButRef)(v3245, this.RULES)) {
      const v3251 = (0, v3185.resolveUrl)(this.opts.uriResolver, v3244, v3245.$ref);
      v3250 = v3229.call(this, v3246, v3251);
    }
    const {
      schemaId: v3252
    } = this.opts;
    v3250 = v3250 || new v3188({
      schema: v3245,
      schemaId: v3252,
      root: v3246,
      baseId: v3244
    });
    if (v3250.schema !== v3250.root.schema) {
      return v3250;
    }
    return undefined;
  }
  return compile;
}
const $id$1 = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#";
const description = "Meta-schema for $data reference (JSON AnySchema extension proposal)";
const type$1 = "object";
const required$1 = ["$data"];
const properties$2 = {
  $data: {
    type: "string",
    anyOf: [{
      format: "relative-json-pointer"
    }, {
      format: "json-pointer"
    }]
  }
};
const additionalProperties$1 = false;
const require$$9 = {
  $id: $id$1,
  description: description,
  type: type$1,
  required: required$1,
  properties: properties$2,
  additionalProperties: additionalProperties$1
};
var uri = {};
var fastUri = {
  exports: {}
};
var utils;
var hasRequiredUtils;
function requireUtils() {
  if (hasRequiredUtils) {
    return utils;
  }
  hasRequiredUtils = 1;
  const v3253 = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
  const v3254 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  const v3255 = RegExp.prototype.test.bind(/^\d*$/u);
  const v3256 = RegExp.prototype.test.bind(/^[\da-f]{2}$/iu);
  const v3257 = RegExp.prototype.test.bind(/^[\da-z\-._~]$/iu);
  const v3258 = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/u);
  const v3259 = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?]$/u);
  const v3260 = RegExp.prototype.test.bind(/^[A-Za-z0-9\-._~!$&'()*+,;=:]$/u);
  const v3261 = new Array(256);
  {
    const v3262 = "0123456789ABCDEF";
    for (let v3263 = 0; v3263 < 256; v3263++) {
      v3261[v3263] = "%" + v3262[v3263 >> 4] + v3262[v3263 & 15];
    }
  }
  function v3264(v3265) {
    if (v3265 < 2048) {
      return v3261[v3265 >> 6 | 192] + v3261[v3265 & 63 | 128];
    }
    if (v3265 < 65536) {
      return v3261[v3265 >> 12 | 224] + v3261[v3265 >> 6 & 63 | 128] + v3261[v3265 & 63 | 128];
    }
    return v3261[v3265 >> 18 | 240] + v3261[v3265 >> 12 & 63 | 128] + v3261[v3265 >> 6 & 63 | 128] + v3261[v3265 & 63 | 128];
  }
  function v3266(v3267) {
    let v3268 = "";
    let v3269 = 0;
    let v3270 = 0;
    for (v3270 = 0; v3270 < v3267.length; v3270++) {
      v3269 = v3267[v3270].charCodeAt(0);
      if (v3269 === 48) {
        continue;
      }
      if ((!(v3269 >= 48) || !(v3269 <= 57)) && (!(v3269 >= 65) || !(v3269 <= 70)) && (!(v3269 >= 97) || !(v3269 <= 102))) {
        return "";
      }
      v3268 += v3267[v3270];
      break;
    }
    for (v3270 += 1; v3270 < v3267.length; v3270++) {
      v3269 = v3267[v3270].charCodeAt(0);
      if ((!(v3269 >= 48) || !(v3269 <= 57)) && (!(v3269 >= 65) || !(v3269 <= 70)) && (!(v3269 >= 97) || !(v3269 <= 102))) {
        return "";
      }
      v3268 += v3267[v3270];
    }
    return v3268;
  }
  const v3271 = RegExp.prototype.test.bind(/^[\dA-Fa-f]{1,4}$/);
  const v3272 = RegExp.prototype.test.bind(/^[vV][\dA-Fa-f]+\.[A-Za-z\d\-._~!$&'()*+,;=:]+$/);
  const v3273 = RegExp.prototype.test.bind(/^[A-Za-z\d\-._~]$/);
  const v3274 = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function v3275(v3276) {
    if (v3276.length === 0) {
      return false;
    }
    for (let v3277 = 0; v3277 < v3276.length; v3277++) {
      if (v3273(v3276[v3277])) {
        continue;
      }
      if (v3276[v3277] === "%" && v3277 + 2 < v3276.length && v3256(v3276.slice(v3277 + 1, v3277 + 3))) {
        v3277 += 2;
        continue;
      }
      return false;
    }
    return true;
  }
  function v3278(v3279) {
    let v3280 = -1;
    let v3281 = 0;
    let v3282 = -1;
    let v3283 = 0;
    for (let v3284 = 0; v3284 < v3279.length; v3284++) {
      if (v3279[v3284] === "0") {
        if (v3282 === -1) {
          v3282 = v3284;
        }
        v3283++;
        if (v3283 > v3281) {
          v3281 = v3283;
          v3280 = v3282;
        }
      } else {
        v3282 = -1;
        v3283 = 0;
      }
    }
    if (v3281 < 2) {
      return v3279.join(":");
    }
    const v3285 = v3279.slice(0, v3280).join(":");
    const v3286 = v3279.slice(v3280 + v3281).join(":");
    return v3285 + "::" + v3286;
  }
  function v3287(v3288) {
    const v3289 = v3288.indexOf("::");
    if (v3289 !== -1 && v3288.indexOf("::", v3289 + 1) !== -1) {
      return undefined;
    }
    const v3290 = v3289 === -1 ? v3288.split(":") : v3288.slice(0, v3289).split(":");
    const v3291 = v3289 === -1 ? [] : v3288.slice(v3289 + 2).split(":");
    if (v3289 !== -1) {
      if (v3290.length === 1 && v3290[0] === "") {
        v3290.length = 0;
      }
      if (v3291.length === 1 && v3291[0] === "") {
        v3291.length = 0;
      }
    }
    const v3292 = v3290.concat(v3291);
    let v3293 = 0;
    for (let v3294 = 0; v3294 < v3292.length; v3294++) {
      const v3295 = v3292[v3294];
      if (v3295 === "") {
        return undefined;
      }
      if (v3295.indexOf(".") !== -1) {
        if (v3294 !== v3292.length - 1 || v3289 !== -1 && v3291.length === 0 || !v3254(v3295)) {
          return undefined;
        }
        v3293 += 2;
        continue;
      }
      if (!v3271(v3295)) {
        return undefined;
      }
      v3292[v3294] = parseInt(v3295, 16).toString(16);
      v3293++;
    }
    if (v3289 === -1) {
      if (v3293 !== 8) {
        return undefined;
      }
      return v3278(v3292);
    }
    if (v3293 >= 8) {
      return undefined;
    }
    const v3296 = v3292.slice(0, v3290.length);
    for (let v3297 = v3293; v3297 < 8; v3297++) {
      v3296.push("0");
    }
    for (let v3298 = v3290.length; v3298 < v3292.length; v3298++) {
      v3296.push(v3292[v3298]);
    }
    return v3278(v3296);
  }
  function v3299(v3300) {
    const v3301 = v3300[0] === "[" && v3300[v3300.length - 1] === "]";
    const v3302 = v3300[0] === "[" || v3300[v3300.length - 1] === "]";
    if (v3302 && !v3301) {
      return {
        host: v3300,
        isIPV6: false,
        error: true
      };
    }
    let v3303 = v3301 ? v3300.slice(1, -1) : v3300;
    if (v3301 && v3272(v3303)) {
      v3303 = v3303.toLowerCase();
      return {
        host: "[" + v3303 + "]",
        escapedHost: v3303,
        isIPV6: false,
        isIPVFuture: true
      };
    }
    if (v3304(v3303, ":") < 2) {
      return {
        host: v3300,
        isIPV6: false,
        error: v3301
      };
    }
    let v3305 = "";
    const v3306 = v3303.indexOf("%");
    if (v3306 !== -1) {
      const v3307 = v3303.slice(v3306, v3306 + 3).toLowerCase() === "%25" ? 3 : 1;
      v3305 = v3303.slice(v3306 + v3307);
      if (!v3275(v3305)) {
        return {
          host: v3300,
          isIPV6: false,
          error: true
        };
      }
      v3303 = v3303.slice(0, v3306);
    }
    const v3308 = v3287(v3303);
    if (v3308 === undefined) {
      return {
        host: v3300,
        isIPV6: false,
        error: true
      };
    }
    return {
      host: v3308 + (v3305 ? "%" + v3305 : ""),
      escapedHost: v3308 + (v3305 ? "%25" + v3305 : ""),
      isIPV6: true
    };
  }
  function v3304(v3309, v3310) {
    let v3311 = 0;
    for (let v3312 = 0; v3312 < v3309.length; v3312++) {
      if (v3309[v3312] === v3310) {
        v3311++;
      }
    }
    return v3311;
  }
  function v3313(v3314) {
    let v3315 = v3314;
    const v3316 = [];
    let v3317 = -1;
    let v3318 = 0;
    while (v3318 = v3315.length) {
      if (v3318 === 1) {
        if (v3315 === ".") {
          break;
        } else if (v3315 === "/") {
          v3316.push("/");
          break;
        } else {
          v3316.push(v3315);
          break;
        }
      } else if (v3318 === 2) {
        if (v3315[0] === ".") {
          if (v3315[1] === ".") {
            break;
          } else if (v3315[1] === "/") {
            v3315 = v3315.slice(2);
            continue;
          }
        } else if (v3315[0] === "/") {
          if (v3315[1] === "." || v3315[1] === "/") {
            v3316.push("/");
            break;
          }
        }
      } else if (v3318 === 3) {
        if (v3315 === "/..") {
          if (v3316.length !== 0) {
            v3316.pop();
          }
          v3316.push("/");
          break;
        }
      }
      if (v3315[0] === ".") {
        if (v3315[1] === ".") {
          if (v3315[2] === "/") {
            v3315 = v3315.slice(3);
            continue;
          }
        } else if (v3315[1] === "/") {
          v3315 = v3315.slice(2);
          continue;
        }
      } else if (v3315[0] === "/") {
        if (v3315[1] === ".") {
          if (v3315[2] === "/") {
            v3315 = v3315.slice(2);
            continue;
          } else if (v3315[2] === ".") {
            if (v3315[3] === "/") {
              v3315 = v3315.slice(3);
              if (v3316.length !== 0) {
                v3316.pop();
              }
              continue;
            }
          }
        }
      }
      if ((v3317 = v3315.indexOf("/", 1)) === -1) {
        v3316.push(v3315);
        break;
      } else {
        v3316.push(v3315.slice(0, v3317));
        v3315 = v3315.slice(v3317);
      }
    }
    return v3316.join("");
  }
  const v3319 = {
    "@": "%40",
    "/": "%2F",
    "?": "%3F",
    "#": "%23",
    ":": "%3A"
  };
  const v3320 = /[@/?#:]/g;
  const v3321 = /[@/?#]/g;
  function v3322(v3323, v3324) {
    const v3325 = v3324 ? v3321 : v3320;
    v3325.lastIndex = 0;
    return v3323.replace(v3325, v3326 => v3319[v3326]);
  }
  function v3327(v3328, v3329 = false) {
    if (v3328.indexOf("%") === -1) {
      return v3328;
    }
    let v3330 = "";
    for (let v3331 = 0; v3331 < v3328.length; v3331++) {
      if (v3328[v3331] === "%" && v3331 + 2 < v3328.length) {
        const v3332 = v3328.slice(v3331 + 1, v3331 + 3);
        if (v3256(v3332)) {
          const v3333 = v3332.toUpperCase();
          const v3334 = String.fromCharCode(parseInt(v3333, 16));
          if (v3329 && v3257(v3334)) {
            v3330 += v3334;
          } else {
            v3330 += "%" + v3333;
          }
          v3331 += 2;
          continue;
        }
      }
      v3330 += v3328[v3331];
    }
    return v3330;
  }
  function v3335(v3336) {
    let v3337 = "";
    for (let v3338 = 0; v3338 < v3336.length; v3338++) {
      const v3339 = v3336[v3338];
      if (v3339 === "%" && v3338 + 2 < v3336.length) {
        const v3340 = v3336.slice(v3338 + 1, v3338 + 3);
        if (v3256(v3340)) {
          const v3341 = v3340.toUpperCase();
          const v3342 = String.fromCharCode(parseInt(v3341, 16));
          if (v3342 !== "." && v3257(v3342)) {
            v3337 += v3342;
          } else {
            v3337 += "%" + v3341;
          }
          v3338 += 2;
          continue;
        }
      }
      if (v3258(v3339)) {
        v3337 += v3339;
      } else {
        const v3343 = v3336.charCodeAt(v3338);
        if (v3343 < 128) {
          v3337 += v3344(v3343) ? v3339 : v3261[v3343];
        } else if (v3343 < 55296 || v3343 > 57343) {
          v3337 += v3264(v3343);
        } else if (v3343 <= 56319 && v3338 + 1 < v3336.length) {
          const v3345 = v3336.charCodeAt(v3338 + 1);
          if (v3345 >= 56320 && v3345 <= 57343) {
            v3337 += v3264(65536 + (v3343 - 55296 << 10) + (v3345 - 56320));
            v3338++;
          } else {
            v3337 += v3264(65533);
          }
        } else {
          v3337 += v3264(65533);
        }
      }
    }
    return v3337;
  }
  function v3346(v3347, v3348 = false) {
    let v3349 = "";
    let v3350 = v3348 && v3347[0] !== "/";
    for (let v3351 = 0; v3351 < v3347.length; v3351++) {
      const v3352 = v3347[v3351];
      if (v3352 === "%" && v3351 + 2 < v3347.length) {
        const v3353 = v3347.slice(v3351 + 1, v3351 + 3);
        if (v3256(v3353)) {
          v3349 += "%" + v3353.toUpperCase();
          v3351 += 2;
          continue;
        }
      }
      if (v3352 === "/") {
        v3350 = false;
      }
      if (v3258(v3352) && (v3352 !== ":" || !v3350)) {
        v3349 += v3352;
      } else {
        const v3354 = v3347.charCodeAt(v3351);
        if (v3354 < 128) {
          v3349 += v3261[v3354];
        } else if (v3354 < 55296 || v3354 > 57343) {
          v3349 += v3264(v3354);
        } else if (v3354 <= 56319 && v3351 + 1 < v3347.length) {
          const v3355 = v3347.charCodeAt(v3351 + 1);
          if (v3355 >= 56320 && v3355 <= 57343) {
            v3349 += v3264(65536 + (v3354 - 55296 << 10) + (v3355 - 56320));
            v3351++;
          } else {
            v3349 += v3264(65533);
          }
        } else {
          v3349 += v3264(65533);
        }
      }
    }
    return v3349;
  }
  function v3356(v3357, v3358) {
    let v3359 = "";
    for (let v3360 = 0; v3360 < v3357.length; v3360++) {
      const v3361 = v3357[v3360];
      if (v3361 === "%" && v3360 + 2 < v3357.length) {
        const v3362 = v3357.slice(v3360 + 1, v3360 + 3);
        if (v3256(v3362)) {
          v3359 += "%" + v3362.toUpperCase();
          v3360 += 2;
          continue;
        }
      }
      if (v3358(v3361)) {
        v3359 += v3361;
      } else {
        const v3363 = v3357.charCodeAt(v3360);
        if (v3363 < 128) {
          v3359 += v3261[v3363];
        } else if (v3363 < 55296 || v3363 > 57343) {
          v3359 += v3264(v3363);
        } else if (v3363 <= 56319 && v3360 + 1 < v3357.length) {
          const v3364 = v3357.charCodeAt(v3360 + 1);
          if (v3364 >= 56320 && v3364 <= 57343) {
            v3359 += v3264(65536 + (v3363 - 55296 << 10) + (v3364 - 56320));
            v3360++;
          } else {
            v3359 += v3264(65533);
          }
        } else {
          v3359 += v3264(65533);
        }
      }
    }
    return v3359;
  }
  function v3365(v3366) {
    return v3356(v3366, v3260);
  }
  function v3367(v3368) {
    return v3356(v3368, v3259);
  }
  function v3369(v3370) {
    return v3356(v3370, v3259);
  }
  function v3344(v3371) {
    return v3371 >= 48 && v3371 <= 57 || v3371 >= 65 && v3371 <= 90 || v3371 >= 97 && v3371 <= 122 || v3371 === 42 || v3371 === 43 || v3371 === 45 || v3371 === 46 || v3371 === 47 || v3371 === 64 || v3371 === 95;
  }
  function v3372(v3373) {
    let v3374 = "";
    for (let v3375 = 0; v3375 < v3373.length; v3375++) {
      const v3376 = v3373[v3375];
      if (v3376 === "%" && v3375 + 2 < v3373.length) {
        const v3377 = v3373.slice(v3375 + 1, v3375 + 3);
        if (v3256(v3377)) {
          const v3378 = v3377.toUpperCase();
          const v3379 = String.fromCharCode(parseInt(v3378, 16));
          if (v3257(v3379)) {
            v3374 += v3379;
          } else {
            v3374 += "%" + v3378;
          }
          v3375 += 2;
          continue;
        }
      }
      if (v3259(v3376)) {
        v3374 += v3376;
      } else {
        const v3380 = v3373.charCodeAt(v3375);
        if (v3380 < 128) {
          v3374 += v3344(v3380) ? v3376 : v3261[v3380];
        } else if (v3380 < 55296 || v3380 > 57343) {
          v3374 += v3264(v3380);
        } else if (v3380 <= 56319 && v3375 + 1 < v3373.length) {
          const v3381 = v3373.charCodeAt(v3375 + 1);
          if (v3381 >= 56320 && v3381 <= 57343) {
            v3374 += v3264(65536 + (v3380 - 55296 << 10) + (v3381 - 56320));
            v3375++;
          } else {
            v3374 += v3264(65533);
          }
        } else {
          v3374 += v3264(65533);
        }
      }
    }
    return v3374;
  }
  function v3382(v3383) {
    let v3384 = "";
    for (let v3385 = 0; v3385 < v3383.length; v3385++) {
      if (v3383[v3385] === "%" && v3385 + 2 < v3383.length) {
        const v3386 = v3383.slice(v3385 + 1, v3385 + 3);
        if (v3256(v3386)) {
          v3384 += "%" + v3386.toUpperCase();
          v3385 += 2;
          continue;
        }
      }
      v3384 += escape(v3383[v3385]);
    }
    return v3384;
  }
  function v3387(v3388) {
    const v3389 = [];
    if (v3388.userinfo !== undefined) {
      v3389.push(v3365(v3388.userinfo));
      v3389.push("@");
    }
    if (v3388.host !== undefined) {
      let v3390 = v3388.host;
      if (!v3254(v3390)) {
        let v3391 = v3299(v3390);
        if (v3391.isIPV6 !== true && v3391.isIPVFuture !== true) {
          v3390 = v3327(v3390, true);
          v3391 = v3299(v3390);
        }
        if (v3391.isIPV6 === true || v3391.isIPVFuture === true) {
          v3390 = "[" + v3391.escapedHost + "]";
        } else {
          v3390 = v3322(v3390, false);
        }
      }
      v3389.push(v3390);
    }
    if (typeof v3388.port === "number" || typeof v3388.port === "string") {
      const v3392 = String(v3388.port);
      if (!v3255(v3392)) {
        throw new TypeError("URI port is malformed.");
      }
      v3389.push(":");
      v3389.push(v3392);
    }
    if (v3389.length) {
      return v3389.join("");
    } else {
      return undefined;
    }
  }
  utils = {
    nonSimpleDomain: v3274,
    recomposeAuthority: v3387,
    reescapeHostDelimiters: v3322,
    normalizePercentEncoding: v3327,
    normalizePathEncoding: v3335,
    serializePathEncoding: v3346,
    normalizeQueryFragmentEncoding: v3372,
    encodeUserinfo: v3365,
    encodeQuery: v3367,
    encodeFragment: v3369,
    escapePreservingEscapes: v3382,
    removeDotSegments: v3313,
    isIPv4: v3254,
    isUUID: v3253,
    normalizeIPv6: v3299,
    stringArrayToHexStripped: v3266
  };
  return utils;
}
var schemes;
var hasRequiredSchemes;
function requireSchemes() {
  if (hasRequiredSchemes) {
    return schemes;
  }
  hasRequiredSchemes = 1;
  const {
    isUUID: v3393
  } = requireUtils();
  const v3394 = /^([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-./:;=@]|%[\da-f]{2})+)$/iu;
  const v3395 = ["http", "https", "ws", "wss", "urn", "urn:uuid"];
  function v3396(v3397) {
    return v3395.indexOf(v3397) !== -1;
  }
  function v3398(v3399) {
    if (v3399.secure === true) {
      return true;
    } else if (v3399.secure === false) {
      return false;
    } else if (v3399.scheme) {
      return v3399.scheme.length === 3 && (v3399.scheme[0] === "w" || v3399.scheme[0] === "W") && (v3399.scheme[1] === "s" || v3399.scheme[1] === "S") && (v3399.scheme[2] === "s" || v3399.scheme[2] === "S");
    } else {
      return false;
    }
  }
  function v3400(v3401) {
    if (!v3401.host) {
      v3401.error = v3401.error || "HTTP URIs must have a host.";
    }
    return v3401;
  }
  function v3402(v3403) {
    const v3404 = String(v3403.scheme).toLowerCase() === "https";
    if (v3403.port === (v3404 ? 443 : 80) || v3403.port === "") {
      v3403.port = undefined;
    }
    if (!v3403.path) {
      v3403.path = "/";
    }
    return v3403;
  }
  function v3405(v3406) {
    v3406.secure = v3398(v3406);
    v3406.resourceName = (v3406.path || "/") + (v3406.query ? "?" + v3406.query : "");
    v3406.path = undefined;
    v3406.query = undefined;
    return v3406;
  }
  function v3407(v3408) {
    if (v3408.port === (v3398(v3408) ? 443 : 80) || v3408.port === "") {
      v3408.port = undefined;
    }
    if (typeof v3408.secure === "boolean") {
      v3408.scheme = v3408.secure ? "wss" : "ws";
      v3408.secure = undefined;
    }
    if (v3408.resourceName) {
      const v3409 = v3408.resourceName.indexOf("?");
      const v3410 = v3409 === -1 ? v3408.resourceName : v3408.resourceName.slice(0, v3409);
      v3408.path = v3410 && v3410 !== "/" ? v3410 : undefined;
      v3408.query = v3409 === -1 ? undefined : v3408.resourceName.slice(v3409 + 1);
      v3408.resourceName = undefined;
    }
    v3408.fragment = undefined;
    return v3408;
  }
  function v3411(v3412, v3413) {
    if (!v3412.path) {
      v3412.error = "URN can not be parsed";
      return v3412;
    }
    const v3414 = v3412.path.match(v3394);
    if (v3414 && v3414[0] === v3412.path) {
      const v3415 = v3413.scheme || v3412.scheme || "urn";
      v3412.nid = v3414[1].toLowerCase();
      v3412.nss = v3414[2];
      const v3416 = v3415 + ":" + (v3413.nid || v3412.nid);
      const v3417 = v3418(v3416);
      v3412.path = undefined;
      if (v3417) {
        v3412 = v3417.parse(v3412, v3413);
      }
    } else {
      v3412.error = v3412.error || "URN can not be parsed.";
    }
    return v3412;
  }
  function v3419(v3420, v3421) {
    if (v3420.nid === undefined) {
      throw new Error("URN without nid cannot be serialized");
    }
    const v3422 = v3421.scheme || v3420.scheme || "urn";
    const v3423 = v3420.nid.toLowerCase();
    const v3424 = v3422 + ":" + (v3421.nid || v3423);
    const v3425 = v3418(v3424);
    if (v3425) {
      v3420 = v3425.serialize(v3420, v3421);
    }
    const v3426 = v3420;
    const v3427 = v3420.nss;
    v3426.path = (v3423 || v3421.nid) + ":" + v3427;
    v3421.skipEscape = true;
    return v3426;
  }
  function v3428(v3429, v3430) {
    const v3431 = v3429;
    v3431.uuid = v3431.nss;
    v3431.nss = undefined;
    if (!v3430.tolerant && (!v3431.uuid || !v3393(v3431.uuid))) {
      v3431.error = v3431.error || "UUID is not valid.";
    }
    return v3431;
  }
  function v3432(v3433) {
    const v3434 = v3433;
    v3434.nss = (v3433.uuid || "").toLowerCase();
    return v3434;
  }
  const v3435 = {
    scheme: "http",
    domainHost: true,
    parse: v3400,
    serialize: v3402
  };
  const v3436 = {
    scheme: "https",
    domainHost: v3435.domainHost,
    parse: v3400,
    serialize: v3402
  };
  const v3437 = {
    scheme: "ws",
    domainHost: true,
    parse: v3405,
    serialize: v3407
  };
  const v3438 = {
    scheme: "wss",
    domainHost: v3437.domainHost,
    parse: v3437.parse,
    serialize: v3437.serialize
  };
  const v3439 = {
    scheme: "urn",
    parse: v3411,
    serialize: v3419,
    skipNormalize: true
  };
  const v3440 = {
    scheme: "urn:uuid",
    parse: v3428,
    serialize: v3432,
    skipNormalize: true
  };
  const v3441 = {
    http: v3435,
    https: v3436,
    ws: v3437,
    wss: v3438,
    urn: v3439,
    "urn:uuid": v3440
  };
  Object.setPrototypeOf(v3441, null);
  function v3418(v3442) {
    return v3442 && (v3441[v3442] || v3441[v3442.toLowerCase()]) || undefined;
  }
  schemes = {
    wsIsSecure: v3398,
    SCHEMES: v3441,
    isValidSchemeName: v3396,
    getSchemeHandler: v3418
  };
  return schemes;
}
var hasRequiredFastUri;
function requireFastUri() {
  if (hasRequiredFastUri) {
    return fastUri.exports;
  }
  hasRequiredFastUri = 1;
  const {
    normalizeIPv6: v3443,
    removeDotSegments: v3444,
    recomposeAuthority: v3445,
    normalizePercentEncoding: v3446,
    normalizePathEncoding: v3447,
    serializePathEncoding: v3448,
    normalizeQueryFragmentEncoding: v3449,
    encodeQuery: v3450,
    encodeFragment: v3451,
    reescapeHostDelimiters: v3452,
    isIPv4: v3453,
    nonSimpleDomain: v3454
  } = requireUtils();
  const {
    SCHEMES: v3455,
    getSchemeHandler: v3456
  } = requireSchemes();
  const v3457 = /^[A-Za-z][A-Za-z0-9+.-]*$/u;
  const v3458 = "URI scheme is malformed.";
  function v3459(v3460) {
    const v3461 = unescape(String(v3460));
    if (!v3457.test(v3461)) {
      throw new TypeError(v3458);
    }
    return v3461;
  }
  function v3462(v3463, v3464) {
    if (typeof v3463 === "string") {
      v3463 = v3465(v3463, v3464);
    } else if (typeof v3463 === "object") {
      v3463 = v3466(v3467(v3463, v3464), v3464);
    }
    return v3463;
  }
  function v3468(v3469, v3470, v3471) {
    const v3472 = v3471 ? Object.assign({
      scheme: "null"
    }, v3471) : {
      scheme: "null"
    };
    const {
      parsed: v3473,
      malformedAuthorityOrPort: v3474,
      malformedPercentEncoding: v3475,
      malformedSchemeSpecific: v3476,
      malformedHost: v3477,
      malformedScheme: v3478
    } = v3479(v3469, v3472);
    const {
      parsed: v3480,
      malformedAuthorityOrPort: v3481,
      malformedPercentEncoding: v3482,
      malformedSchemeSpecific: v3483,
      malformedHost: v3484,
      malformedScheme: v3485
    } = v3479(v3470, v3472);
    if (v3474 || v3481 || v3475 || v3482 || v3476 || v3483 || v3477 || v3484 || v3478 || v3485) {
      throw new Error(v3473.error || v3480.error || "URI is malformed.");
    }
    const v3486 = v3487(v3473, v3480, v3472, true);
    const v3488 = v3456(v3471 && v3471.scheme || v3486.scheme);
    const v3489 = v3486.host;
    const v3490 = v3489 !== undefined && v3489 !== "" && (v3453(v3489) || v3443(v3489).isIPV6);
    v3491(v3486, v3471 || {}, v3488, v3490);
    const v3492 = v3489 && v3489.indexOf("%") !== -1 && !new RegExp("\\P{ASCII}", "u").test(v3489);
    if (v3486.error && !v3492) {
      throw new Error(v3486.error);
    }
    v3472.skipEscape = true;
    return v3467(v3486, v3472);
  }
  function v3487(v3493, v3494, v3495, v3496) {
    const v3497 = {};
    if (!v3496) {
      v3493 = v3466(v3467(v3493, v3495), v3495);
      v3494 = v3466(v3467(v3494, v3495), v3495);
    }
    v3495 = v3495 || {};
    if (!v3495.tolerant && v3494.scheme) {
      v3497.scheme = v3494.scheme;
      v3497.userinfo = v3494.userinfo;
      v3497.host = v3494.host;
      v3497.port = v3494.port;
      v3497.path = v3444(v3494.path || "");
      v3497.query = v3494.query;
    } else {
      if (v3494.userinfo !== undefined || v3494.host !== undefined || v3494.port !== undefined) {
        v3497.userinfo = v3494.userinfo;
        v3497.host = v3494.host;
        v3497.port = v3494.port;
        v3497.path = v3444(v3494.path || "");
        v3497.query = v3494.query;
      } else {
        if (!v3494.path) {
          v3497.path = v3493.path;
          if (v3494.query !== undefined) {
            v3497.query = v3494.query;
          } else {
            v3497.query = v3493.query;
          }
        } else {
          if (v3494.path[0] === "/") {
            v3497.path = v3444(v3494.path);
          } else {
            if ((v3493.userinfo !== undefined || v3493.host !== undefined || v3493.port !== undefined) && !v3493.path) {
              v3497.path = "/" + v3494.path;
            } else if (!v3493.path) {
              v3497.path = v3494.path;
            } else {
              v3497.path = v3493.path.slice(0, v3493.path.lastIndexOf("/") + 1) + v3494.path;
            }
            v3497.path = v3444(v3497.path);
          }
          v3497.query = v3494.query;
        }
        v3497.userinfo = v3493.userinfo;
        v3497.host = v3493.host;
        v3497.port = v3493.port;
      }
      v3497.scheme = v3493.scheme;
    }
    v3497.fragment = v3494.fragment;
    return v3497;
  }
  function v3498(v3499, v3500, v3501) {
    const v3502 = v3503(v3499, v3501);
    const v3504 = v3503(v3500, v3501);
    return v3502 !== undefined && v3504 !== undefined && v3502 === v3504;
  }
  function v3467(v3505, v3506) {
    const v3507 = {
      host: v3505.host,
      scheme: v3505.scheme,
      userinfo: v3505.userinfo,
      port: v3505.port,
      path: v3505.path,
      query: v3505.query,
      nid: v3505.nid,
      nss: v3505.nss,
      uuid: v3505.uuid,
      fragment: v3505.fragment,
      reference: v3505.reference,
      resourceName: v3505.resourceName,
      secure: v3505.secure,
      error: ""
    };
    const v3508 = Object.assign({}, v3506);
    const v3509 = [];
    v3507.scheme &&= v3459(v3507.scheme);
    const v3510 = v3456(v3508.scheme || v3507.scheme);
    if (v3510 && v3510.serialize) {
      v3510.serialize(v3507, v3508);
    }
    const v3511 = v3507.userinfo !== undefined || v3507.host !== undefined || v3507.port !== undefined;
    const v3512 = !v3508.skipEscape && v3507.scheme === undefined && !v3511;
    if (v3507.path !== undefined) {
      if (!v3508.skipEscape) {
        v3507.path = v3448(v3507.path, v3512);
      } else {
        v3507.path = v3446(v3507.path);
      }
    }
    if (v3508.reference !== "suffix" && v3507.scheme) {
      v3507.scheme = v3459(v3507.scheme);
      v3509.push(v3507.scheme, ":");
    }
    const v3513 = v3445(v3507);
    if (v3513 !== undefined) {
      if (v3508.reference !== "suffix") {
        v3509.push("//");
      }
      v3509.push(v3513);
      if (v3507.path && v3507.path[0] !== "/") {
        v3509.push("/");
      }
    }
    if (v3507.path !== undefined) {
      let v3514 = v3507.path;
      if (!v3508.absolutePath && (!v3510 || !v3510.absolutePath)) {
        v3514 = v3444(v3514);
      }
      if (v3512) {
        v3514 = v3448(v3514, true);
      }
      if (v3513 === undefined && v3514[0] === "/" && v3514[1] === "/") {
        v3514 = "/%2F" + v3514.slice(2);
      }
      v3509.push(v3514);
    }
    if (v3507.query !== undefined) {
      v3509.push("?", v3450(v3507.query));
    }
    if (v3507.fragment !== undefined) {
      v3509.push("#", v3451(v3507.fragment));
    }
    return v3509.join("");
  }
  const v3515 = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  const v3516 = /^(?:[^#/:?]+:)?\/\/([^/?#]*)/;
  const v3517 = /^(?:[^#/:?]+:)?([/\\\t\n\r]*)/;
  function v3518(v3519, v3520) {
    if (v3520[2] !== undefined && v3519.path && v3519.path[0] !== "/") {
      return "URI path must start with \"/\" when authority is present.";
    }
    if (typeof v3519.port === "number" && (v3519.port < 0 || v3519.port > 65535)) {
      return "URI port is malformed.";
    }
    return undefined;
  }
  function v3521(v3522) {
    if (v3522 === undefined) {
      return false;
    }
    let v3523 = v3522.indexOf("%");
    while (v3523 !== -1) {
      if (v3523 + 2 >= v3522.length || !/^[\da-f]{2}$/iu.test(v3522.slice(v3523 + 1, v3523 + 3))) {
        return true;
      }
      v3523 = v3522.indexOf("%", v3523 + 3);
    }
    return false;
  }
  function v3524(v3525) {
    return v3525[0] === "[" && v3525[v3525.length - 1] === "]";
  }
  function v3526(v3527) {
    const v3528 = v3527[4];
    return v3521(v3527[3]) || v3528 !== undefined && !v3524(v3528) && v3521(v3528) || v3521(v3527[6]) || v3521(v3527[7]) || v3521(v3527[8]);
  }
  function v3491(v3529, v3530, v3531, v3532) {
    if (!v3530.unicodeSupport && (!v3531 || !v3531.unicodeSupport) && v3529.host && !v3524(v3529.host) && (v3530.domainHost || v3531 && v3531.domainHost) && v3532 === false && v3454(v3529.host)) {
      try {
        v3529.host = new URL("http://" + v3529.host).hostname;
      } catch (v3533) {
        v3529.error = v3529.error || "Host's domain name can not be converted to ASCII: " + v3533;
        return true;
      }
    }
    return false;
  }
  function v3479(v3534, v3535) {
    const v3536 = Object.assign({}, v3535);
    const v3537 = {
      scheme: undefined,
      userinfo: undefined,
      host: "",
      port: undefined,
      path: "",
      query: undefined,
      fragment: undefined
    };
    let v3538 = false;
    let v3539 = false;
    let v3540 = false;
    let v3541 = false;
    let v3542 = false;
    let v3543 = false;
    let v3544 = false;
    if (v3536.reference === "suffix") {
      if (v3536.scheme) {
        v3534 = v3536.scheme + ":" + v3534;
      } else {
        v3534 = "//" + v3534;
      }
    }
    const v3545 = v3534.match(v3516);
    if (v3545 !== null && v3545[1].indexOf("\\") !== -1) {
      v3537.error = "URI authority must not contain a literal backslash.";
      v3538 = true;
    }
    const v3546 = v3534.match(v3517);
    if (v3546 !== null) {
      const v3547 = v3546[1];
      const v3548 = v3547.replace(/[\t\n\r]/g, "");
      if (v3548.length >= 2) {
        if (v3548.slice(0, 2) !== "//") {
          v3537.error = v3537.error || "URI authority must not contain a literal backslash.";
          v3538 = true;
        } else if (v3547.length !== v3548.length) {
          v3537.error = v3537.error || "URI authority introducer must not contain whitespace.";
          v3538 = true;
        }
      }
    }
    const v3549 = v3534.match(v3515);
    if (v3549) {
      v3537.scheme = v3549[1];
      v3537.userinfo = v3549[3];
      v3537.host = v3549[4];
      v3537.port = parseInt(v3549[5], 10);
      v3537.path = v3549[6] || "";
      v3537.query = v3549[7];
      v3537.fragment = v3549[8];
      if (v3537.scheme !== undefined) {
        const v3550 = unescape(v3537.scheme);
        if (v3457.test(v3550)) {
          v3537.scheme = v3550.toLowerCase();
        } else {
          v3537.error = v3537.error || v3458;
          v3543 = true;
        }
      }
      v3539 = v3526(v3549);
      if (v3539) {
        v3537.error = v3537.error || "URI contains malformed percent-encoding.";
      }
      if (isNaN(v3537.port)) {
        v3537.port = v3549[5];
      }
      const v3551 = v3518(v3537, v3549);
      if (v3551 !== undefined) {
        v3537.error = v3537.error || v3551;
        v3538 = true;
      }
      if (v3537.host) {
        const v3552 = v3453(v3537.host);
        if (v3552 === false) {
          const v3553 = v3524(v3537.host);
          const v3554 = v3537.host.indexOf("[") !== -1 || v3537.host.indexOf("]") !== -1;
          const v3555 = v3443(v3537.host);
          v3544 = v3555.isIPV6 || v3555.isIPVFuture === true;
          v3542 = v3554 && (!v3553 || v3555.error === true);
          v3537.host = v3544 ? v3555.host : v3555.host.toLowerCase();
          if (v3542) {
            v3537.error = v3537.error || "URI host is malformed.";
            v3538 = true;
          }
        } else {
          v3544 = true;
        }
      }
      if (v3537.scheme === undefined && v3537.userinfo === undefined && v3537.host === undefined && v3537.port === undefined && v3537.query === undefined && !v3537.path) {
        v3537.reference = "same-document";
      } else if (v3537.scheme === undefined) {
        v3537.reference = "relative";
      } else if (v3537.fragment === undefined) {
        v3537.reference = "absolute";
      } else {
        v3537.reference = "uri";
      }
      if (v3536.reference && v3536.reference !== "suffix" && v3536.reference !== v3537.reference) {
        v3537.error = v3537.error || "URI is not a " + v3536.reference + " reference.";
      }
      const v3556 = v3456(v3536.scheme || v3537.scheme);
      if (!v3542) {
        v3541 = v3491(v3537, v3536, v3556, v3544);
      }
      if (v3534.indexOf("%") !== -1 && v3537.host !== undefined && !v3542) {
        let v3557 = v3544 ? v3537.host : v3446(v3537.host, true);
        if (!v3544) {
          v3557 = v3446(v3557.toLowerCase());
        }
        v3537.host = v3452(v3557, v3544);
      }
      if (!v3556 || v3556 && !v3556.skipNormalize) {
        v3537.path &&= v3447(v3537.path);
        v3537.query &&= v3449(v3537.query);
        v3537.fragment &&= v3449(v3537.fragment);
      }
      if (v3556 && v3556.parse) {
        v3556.parse(v3537, v3536);
        if (v3556 === v3455.urn && v3537.nid === undefined) {
          v3540 = true;
        }
      }
    } else {
      v3537.error = v3537.error || "URI can not be parsed.";
    }
    return {
      parsed: v3537,
      malformedAuthorityOrPort: v3538,
      malformedPercentEncoding: v3539,
      malformedSchemeSpecific: v3540,
      malformedHost: v3541,
      malformedScheme: v3543
    };
  }
  function v3466(v3558, v3559) {
    return v3479(v3558, v3559).parsed;
  }
  function v3465(v3560, v3561) {
    return v3562(v3560, v3561).normalized;
  }
  function v3562(v3563, v3564) {
    const {
      parsed: v3565,
      malformedAuthorityOrPort: v3566,
      malformedPercentEncoding: v3567,
      malformedSchemeSpecific: v3568,
      malformedHost: v3569,
      malformedScheme: v3570
    } = v3479(v3563, v3564);
    return {
      normalized: v3566 || v3567 || v3568 || v3569 || v3570 ? v3563 : v3467(v3565, v3564),
      malformedAuthorityOrPort: v3566,
      malformedPercentEncoding: v3567,
      malformedSchemeSpecific: v3568,
      malformedHost: v3569,
      malformedScheme: v3570
    };
  }
  function v3503(v3571, v3572) {
    if (typeof v3571 !== "string" && typeof v3571 !== "object") {
      return undefined;
    }
    let v3573;
    try {
      v3573 = typeof v3571 === "string" ? v3571 : v3467(v3571, v3572);
    } catch {
      return undefined;
    }
    const {
      normalized: v3574,
      malformedAuthorityOrPort: v3575,
      malformedPercentEncoding: v3576,
      malformedSchemeSpecific: v3577,
      malformedHost: v3578,
      malformedScheme: v3579
    } = v3562(v3573, v3572);
    if (v3575 || v3576 || v3577 || v3578 || v3579) {
      return undefined;
    } else {
      return v3574;
    }
  }
  const v3580 = {
    SCHEMES: v3455,
    normalize: v3462,
    resolve: v3468,
    resolveComponent: v3487,
    equal: v3498,
    serialize: v3467,
    parse: v3466
  };
  fastUri.exports = v3580;
  fastUri.exports.default = v3580;
  fastUri.exports.fastUri = v3580;
  return fastUri.exports;
}
var hasRequiredUri;
function requireUri() {
  if (hasRequiredUri) {
    return uri;
  }
  hasRequiredUri = 1;
  Object.defineProperty(uri, "__esModule", {
    value: true
  });
  const v3581 = requireFastUri();
  v3581.code = "require(\"ajv/dist/runtime/uri\").default";
  uri.default = v3581;
  return uri;
}
var hasRequiredCore$1;
function requireCore$1() {
  if (hasRequiredCore$1) {
    return core$1;
  }
  hasRequiredCore$1 = 1;
  (function (v3582) {
    Object.defineProperty(v3582, "__esModule", {
      value: true
    });
    v3582.CodeGen = v3582.Name = v3582.nil = v3582.stringify = v3582.str = v3582._ = v3582.KeywordCxt = undefined;
    var v3583 = requireValidate();
    Object.defineProperty(v3582, "KeywordCxt", {
      enumerable: true,
      get: function () {
        return v3583.KeywordCxt;
      }
    });
    var v3584 = requireCodegen();
    Object.defineProperty(v3582, "_", {
      enumerable: true,
      get: function () {
        return v3584._;
      }
    });
    Object.defineProperty(v3582, "str", {
      enumerable: true,
      get: function () {
        return v3584.str;
      }
    });
    Object.defineProperty(v3582, "stringify", {
      enumerable: true,
      get: function () {
        return v3584.stringify;
      }
    });
    Object.defineProperty(v3582, "nil", {
      enumerable: true,
      get: function () {
        return v3584.nil;
      }
    });
    Object.defineProperty(v3582, "Name", {
      enumerable: true,
      get: function () {
        return v3584.Name;
      }
    });
    Object.defineProperty(v3582, "CodeGen", {
      enumerable: true,
      get: function () {
        return v3584.CodeGen;
      }
    });
    const v3585 = requireValidation_error();
    const v3586 = requireRef_error();
    const v3587 = requireRules();
    const v3588 = requireCompile();
    const v3589 = requireCodegen();
    const v3590 = requireResolve();
    const v3591 = requireDataType();
    const v3592 = requireUtil();
    const v3593 = require$$9;
    const v3594 = requireUri();
    const v3595 = (v3596, v3597) => new RegExp(v3596, v3597);
    v3595.code = "new RegExp";
    const v3598 = ["removeAdditional", "useDefaults", "coerceTypes"];
    const v3599 = new Set(["validate", "serialize", "parse", "wrapper", "root", "schema", "keyword", "pattern", "formats", "validate$data", "func", "obj", "Error"]);
    const v3600 = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: "\"nullable\" keyword is supported by default.",
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: "\"uniqueItems\" keyword is always validated.",
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    const v3601 = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: "\"minLength\"/\"maxLength\" account for unicode characters by default."
    };
    const v3602 = 200;
    function v3603(v3604) {
      const v3605 = v3604.strict;
      const v3606 = v3604.code?.optimize;
      const v3607 = v3606 === true || v3606 === undefined ? 1 : v3606 || 0;
      const v3608 = v3604.code?.regExp ?? v3595;
      const v3609 = v3604.uriResolver ?? v3594.default;
      return {
        strictSchema: v3604.strictSchema ?? v3605 ?? true,
        strictNumbers: v3604.strictNumbers ?? v3605 ?? true,
        strictTypes: v3604.strictTypes ?? v3605 ?? "log",
        strictTuples: v3604.strictTuples ?? v3605 ?? "log",
        strictRequired: v3604.strictRequired ?? v3605 ?? false,
        code: v3604.code ? {
          ...v3604.code,
          optimize: v3607,
          regExp: v3608
        } : {
          optimize: v3607,
          regExp: v3608
        },
        loopRequired: v3604.loopRequired ?? v3602,
        loopEnum: v3604.loopEnum ?? v3602,
        meta: v3604.meta ?? true,
        messages: v3604.messages ?? true,
        inlineRefs: v3604.inlineRefs ?? true,
        schemaId: v3604.schemaId ?? "$id",
        addUsedSchema: v3604.addUsedSchema ?? true,
        validateSchema: v3604.validateSchema ?? true,
        validateFormats: v3604.validateFormats ?? true,
        unicodeRegExp: v3604.unicodeRegExp ?? true,
        int32range: v3604.int32range ?? true,
        uriResolver: v3609
      };
    }
    class v3610 {
      constructor(v3611 = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = Object.create(null);
        this._compilations = new Set();
        this._loading = {};
        this._cache = new Map();
        v3611 = this.opts = {
          ...v3611,
          ...v3603(v3611)
        };
        const {
          es5: v3612,
          lines: v3613
        } = this.opts.code;
        this.scope = new v3589.ValueScope({
          scope: {},
          prefixes: v3599,
          es5: v3612,
          lines: v3613
        });
        this.logger = v3614(v3611.logger);
        const v3615 = v3611.validateFormats;
        v3611.validateFormats = false;
        this.RULES = (0, v3587.getRules)();
        v3616.call(this, v3600, v3611, "NOT SUPPORTED");
        v3616.call(this, v3601, v3611, "DEPRECATED", "warn");
        this._metaOpts = v3617.call(this);
        if (v3611.formats) {
          v3618.call(this);
        }
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (v3611.keywords) {
          v3619.call(this, v3611.keywords);
        }
        if (typeof v3611.meta == "object") {
          this.addMetaSchema(v3611.meta);
        }
        v3620.call(this);
        v3611.validateFormats = v3615;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const {
          $data: v3621,
          meta: v3622,
          schemaId: v3623
        } = this.opts;
        let v3624 = v3593;
        if (v3623 === "id") {
          v3624 = {
            ...v3593
          };
          v3624.id = v3624.$id;
          delete v3624.$id;
        }
        if (v3622 && v3621) {
          this.addMetaSchema(v3624, v3624[v3623], false);
        }
      }
      defaultMeta() {
        const {
          meta: v3625,
          schemaId: v3626
        } = this.opts;
        return this.opts.defaultMeta = typeof v3625 == "object" ? v3625[v3626] || v3625 : undefined;
      }
      validate(v3627, v3628) {
        let v3629;
        if (typeof v3627 == "string") {
          v3629 = this.getSchema(v3627);
          if (!v3629) {
            throw new Error("no schema with key or ref \"" + v3627 + "\"");
          }
        } else {
          v3629 = this.compile(v3627);
        }
        const v3630 = v3629(v3628);
        if (!("$async" in v3629)) {
          this.errors = v3629.errors;
        }
        return v3630;
      }
      compile(v3631, v3632) {
        const v3633 = this._addSchema(v3631, v3632);
        return v3633.validate || this._compileSchemaEnv(v3633);
      }
      compileAsync(v3634, v3635) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const {
          loadSchema: v3636
        } = this.opts;
        return v3637.call(this, v3634, v3635);
        async function v3637(v3638, v3639) {
          await v3640.call(this, v3638.$schema);
          const v3641 = this._addSchema(v3638, v3639);
          return v3641.validate || v3642.call(this, v3641);
        }
        async function v3640(v3643) {
          if (v3643 && !this.getSchema(v3643)) {
            await v3637.call(this, {
              $ref: v3643
            }, true);
          }
        }
        async function v3642(v3644) {
          try {
            return this._compileSchemaEnv(v3644);
          } catch (v3645) {
            if (!(v3645 instanceof v3586.default)) {
              throw v3645;
            }
            v3646.call(this, v3645);
            await v3647.call(this, v3645.missingSchema);
            return v3642.call(this, v3644);
          }
        }
        function v3646({
          missingSchema: v3648,
          missingRef: v3649
        }) {
          if (this.refs[v3648]) {
            throw new Error("AnySchema " + v3648 + " is loaded but " + v3649 + " cannot be resolved");
          }
        }
        async function v3647(v3650) {
          const v3651 = await v3652.call(this, v3650);
          if (!this.refs[v3650]) {
            await v3640.call(this, v3651.$schema);
          }
          if (!this.refs[v3650]) {
            this.addSchema(v3651, v3650, v3635);
          }
        }
        async function v3652(v3653) {
          const v3654 = this._loading[v3653];
          if (v3654) {
            return v3654;
          }
          try {
            return await (this._loading[v3653] = v3636(v3653));
          } finally {
            delete this._loading[v3653];
          }
        }
      }
      addSchema(v3655, v3656, v3657, v3658 = this.opts.validateSchema) {
        if (Array.isArray(v3655)) {
          for (const v3659 of v3655) {
            this.addSchema(v3659, undefined, v3657, v3658);
          }
          return this;
        }
        let v3660;
        if (typeof v3655 === "object") {
          const {
            schemaId: v3661
          } = this.opts;
          v3660 = v3655[v3661];
          if (v3660 !== undefined && typeof v3660 != "string") {
            throw new Error("schema " + v3661 + " must be string");
          }
        }
        v3656 = (0, v3590.normalizeId)(v3656 || v3660);
        this._checkUnique(v3656);
        this.schemas[v3656] = this._addSchema(v3655, v3657, v3656, v3658, true);
        return this;
      }
      addMetaSchema(v3662, v3663, v3664 = this.opts.validateSchema) {
        this.addSchema(v3662, v3663, true, v3664);
        return this;
      }
      validateSchema(v3665, v3666) {
        if (typeof v3665 == "boolean") {
          return true;
        }
        let v3667;
        v3667 = v3665.$schema;
        if (v3667 !== undefined && typeof v3667 != "string") {
          throw new Error("$schema must be a string");
        }
        v3667 = v3667 || this.opts.defaultMeta || this.defaultMeta();
        if (!v3667) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const v3668 = this.validate(v3667, v3665);
        if (!v3668 && v3666) {
          const v3669 = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log") {
            this.logger.error(v3669);
          } else {
            throw new Error(v3669);
          }
        }
        return v3668;
      }
      getSchema(v3670) {
        let v3671;
        while (typeof (v3671 = v3672.call(this, v3670)) == "string") {
          v3670 = v3671;
        }
        if (v3671 === undefined) {
          const {
            schemaId: v3673
          } = this.opts;
          const v3674 = new v3588.SchemaEnv({
            schema: {},
            schemaId: v3673
          });
          v3671 = v3588.resolveSchema.call(this, v3674, v3670);
          if (!v3671) {
            return;
          }
          this.refs[v3670] = v3671;
        }
        return v3671.validate || this._compileSchemaEnv(v3671);
      }
      removeSchema(v3675) {
        if (v3675 instanceof RegExp) {
          this._removeAllSchemas(this.schemas, v3675);
          this._removeAllSchemas(this.refs, v3675);
          return this;
        }
        switch (typeof v3675) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string":
            {
              const v3676 = v3672.call(this, v3675);
              if (typeof v3676 == "object") {
                this._cache.delete(v3676.schema);
              }
              delete this.schemas[v3675];
              delete this.refs[v3675];
              return this;
            }
          case "object":
            {
              const v3677 = v3675;
              this._cache.delete(v3677);
              let v3678 = v3675[this.opts.schemaId];
              if (v3678) {
                v3678 = (0, v3590.normalizeId)(v3678);
                delete this.schemas[v3678];
                delete this.refs[v3678];
              }
              return this;
            }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      addVocabulary(v3679) {
        for (const v3680 of v3679) {
          this.addKeyword(v3680);
        }
        return this;
      }
      addKeyword(v3681, v3682) {
        let v3683;
        if (typeof v3681 == "string") {
          v3683 = v3681;
          if (typeof v3682 == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            v3682.keyword = v3683;
          }
        } else if (typeof v3681 == "object" && v3682 === undefined) {
          v3682 = v3681;
          v3683 = v3682.keyword;
          if (Array.isArray(v3683) && !v3683.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        v3684.call(this, v3683, v3682);
        if (!v3682) {
          (0, v3592.eachItem)(v3683, v3685 => v3686.call(this, v3685));
          return this;
        }
        v3687.call(this, v3682);
        const v3688 = {
          ...v3682,
          type: (0, v3591.getJSONTypes)(v3682.type),
          schemaType: (0, v3591.getJSONTypes)(v3682.schemaType)
        };
        (0, v3592.eachItem)(v3683, v3688.type.length === 0 ? v3689 => v3686.call(this, v3689, v3688) : v3690 => v3688.type.forEach(v3691 => v3686.call(this, v3690, v3688, v3691)));
        return this;
      }
      getKeyword(v3692) {
        const v3693 = this.RULES.all[v3692];
        if (typeof v3693 == "object") {
          return v3693.definition;
        } else {
          return !!v3693;
        }
      }
      removeKeyword(v3694) {
        const {
          RULES: v3695
        } = this;
        delete v3695.keywords[v3694];
        delete v3695.all[v3694];
        for (const v3696 of v3695.rules) {
          const v3697 = v3696.rules.findIndex(v3698 => v3698.keyword === v3694);
          if (v3697 >= 0) {
            v3696.rules.splice(v3697, 1);
          }
        }
        return this;
      }
      addFormat(v3699, v3700) {
        if (typeof v3700 == "string") {
          v3700 = new RegExp(v3700);
        }
        this.formats[v3699] = v3700;
        return this;
      }
      errorsText(v3701 = this.errors, {
        separator = ", ",
        dataVar = "data"
      } = {}) {
        if (!v3701 || v3701.length === 0) {
          return "No errors";
        }
        return v3701.map(v3702 => "" + dataVar + v3702.instancePath + " " + v3702.message).reduce((v3703, v3704) => v3703 + separator + v3704);
      }
      $dataMetaSchema(v3705, v3706) {
        const v3707 = this.RULES.all;
        v3705 = JSON.parse(JSON.stringify(v3705));
        for (const v3708 of v3706) {
          const v3709 = v3708.split("/").slice(1);
          let v3710 = v3705;
          for (const v3711 of v3709) {
            v3710 = v3710[v3711];
          }
          for (const v3712 in v3707) {
            const v3713 = v3707[v3712];
            if (typeof v3713 != "object") {
              continue;
            }
            const {
              $data: v3714
            } = v3713.definition;
            const v3715 = v3710[v3712];
            if (v3714 && v3715) {
              v3710[v3712] = v3716(v3715);
            }
          }
        }
        return v3705;
      }
      _removeAllSchemas(v3717, v3718) {
        for (const v3719 in v3717) {
          const v3720 = v3717[v3719];
          if (!v3718 || v3718.test(v3719)) {
            if (typeof v3720 == "string") {
              delete v3717[v3719];
            } else if (v3720 && !v3720.meta) {
              this._cache.delete(v3720.schema);
              delete v3717[v3719];
            }
          }
        }
      }
      _addSchema(v3721, v3722, v3723, v3724 = this.opts.validateSchema, v3725 = this.opts.addUsedSchema) {
        let v3726;
        const {
          schemaId: v3727
        } = this.opts;
        if (typeof v3721 == "object") {
          v3726 = v3721[v3727];
        } else if (this.opts.jtd) {
          throw new Error("schema must be object");
        } else if (typeof v3721 != "boolean") {
          throw new Error("schema must be object or boolean");
        }
        let v3728 = this._cache.get(v3721);
        if (v3728 !== undefined) {
          return v3728;
        }
        v3723 = (0, v3590.normalizeId)(v3726 || v3723);
        const v3729 = v3590.getSchemaRefs.call(this, v3721, v3723);
        v3728 = new v3588.SchemaEnv({
          schema: v3721,
          schemaId: v3727,
          meta: v3722,
          baseId: v3723,
          localRefs: v3729
        });
        this._cache.set(v3728.schema, v3728);
        if (v3725 && !v3723.startsWith("#")) {
          if (v3723) {
            this._checkUnique(v3723);
          }
          this.refs[v3723] = v3728;
        }
        if (v3724) {
          this.validateSchema(v3721, true);
        }
        return v3728;
      }
      _checkUnique(v3730) {
        if (this.schemas[v3730] || this.refs[v3730]) {
          throw new Error("schema with key or id \"" + v3730 + "\" already exists");
        }
      }
      _compileSchemaEnv(v3731) {
        if (v3731.meta) {
          this._compileMetaSchema(v3731);
        } else {
          v3588.compileSchema.call(this, v3731);
        }
        if (!v3731.validate) {
          throw new Error("ajv implementation error");
        }
        return v3731.validate;
      }
      _compileMetaSchema(v3732) {
        const v3733 = this.opts;
        this.opts = this._metaOpts;
        try {
          v3588.compileSchema.call(this, v3732);
        } finally {
          this.opts = v3733;
        }
      }
    }
    v3610.ValidationError = v3585.default;
    v3610.MissingRefError = v3586.default;
    v3582.default = v3610;
    function v3616(v3734, v3735, v3736, v3737 = "error") {
      for (const v3738 in v3734) {
        const v3739 = v3738;
        if (v3739 in v3735) {
          this.logger[v3737](v3736 + ": option " + v3738 + ". " + v3734[v3739]);
        }
      }
    }
    function v3672(v3740) {
      v3740 = (0, v3590.normalizeId)(v3740);
      return this.schemas[v3740] || this.refs[v3740];
    }
    function v3620() {
      const v3741 = this.opts.schemas;
      if (!v3741) {
        return;
      }
      if (Array.isArray(v3741)) {
        this.addSchema(v3741);
      } else {
        for (const v3742 in v3741) {
          this.addSchema(v3741[v3742], v3742);
        }
      }
    }
    function v3618() {
      for (const v3743 in this.opts.formats) {
        const v3744 = this.opts.formats[v3743];
        if (v3744) {
          this.addFormat(v3743, v3744);
        }
      }
    }
    function v3619(v3745) {
      if (Array.isArray(v3745)) {
        this.addVocabulary(v3745);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const v3746 in v3745) {
        const v3747 = v3745[v3746];
        if (!v3747.keyword) {
          v3747.keyword = v3746;
        }
        this.addKeyword(v3747);
      }
    }
    function v3617() {
      const v3748 = {
        ...this.opts
      };
      for (const v3749 of v3598) {
        delete v3748[v3749];
      }
      return v3748;
    }
    const v3750 = {
      log() {},
      warn() {},
      error() {}
    };
    function v3614(v3751) {
      if (v3751 === false) {
        return v3750;
      }
      if (v3751 === undefined) {
        return console;
      }
      if (v3751.log && v3751.warn && v3751.error) {
        return v3751;
      }
      throw new Error("logger must implement log, warn and error methods");
    }
    const v3752 = /^[a-z_$][a-z0-9_$:-]*$/i;
    function v3684(v3753, v3754) {
      const {
        RULES: v3755
      } = this;
      (0, v3592.eachItem)(v3753, v3756 => {
        if (v3755.keywords[v3756]) {
          throw new Error("Keyword " + v3756 + " is already defined");
        }
        if (!v3752.test(v3756)) {
          throw new Error("Keyword " + v3756 + " has invalid name");
        }
      });
      if (!v3754) {
        return;
      }
      if (v3754.$data && !("code" in v3754) && !("validate" in v3754)) {
        throw new Error("$data keyword must have \"code\" or \"validate\" function");
      }
    }
    function v3686(v3757, v3758, v3759) {
      var v3760;
      const v3761 = v3758?.post;
      if (v3759 && v3761) {
        throw new Error("keyword with \"post\" flag cannot have \"type\"");
      }
      const {
        RULES: v3762
      } = this;
      let v3763 = v3761 ? v3762.post : v3762.rules.find(({
        type: v3764
      }) => v3764 === v3759);
      if (!v3763) {
        v3763 = {
          type: v3759,
          rules: []
        };
        v3762.rules.push(v3763);
      }
      v3762.keywords[v3757] = true;
      if (!v3758) {
        return;
      }
      const v3765 = {
        keyword: v3757,
        definition: {
          ...v3758,
          type: (0, v3591.getJSONTypes)(v3758.type),
          schemaType: (0, v3591.getJSONTypes)(v3758.schemaType)
        }
      };
      if (v3758.before) {
        v3766.call(this, v3763, v3765, v3758.before);
      } else {
        v3763.rules.push(v3765);
      }
      v3762.all[v3757] = v3765;
      if ((v3760 = v3758.implements) === null || v3760 === undefined) {
        undefined;
      } else {
        v3760.forEach(v3767 => this.addKeyword(v3767));
      }
    }
    function v3766(v3768, v3769, v3770) {
      const v3771 = v3768.rules.findIndex(v3772 => v3772.keyword === v3770);
      if (v3771 >= 0) {
        v3768.rules.splice(v3771, 0, v3769);
      } else {
        v3768.rules.push(v3769);
        this.logger.warn("rule " + v3770 + " is not defined");
      }
    }
    function v3687(v3773) {
      let {
        metaSchema: v3774
      } = v3773;
      if (v3774 === undefined) {
        return;
      }
      if (v3773.$data && this.opts.$data) {
        v3774 = v3716(v3774);
      }
      v3773.validateSchema = this.compile(v3774, true);
    }
    const v3775 = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function v3716(v3776) {
      return {
        anyOf: [v3776, v3775]
      };
    }
  })(core$1);
  return core$1;
}
var draft7 = {};
var core = {};
var id = {};
var hasRequiredId;
function requireId() {
  if (hasRequiredId) {
    return id;
  }
  hasRequiredId = 1;
  Object.defineProperty(id, "__esModule", {
    value: true
  });
  const v3777 = {
    keyword: "id",
    code() {
      throw new Error("NOT SUPPORTED: keyword \"id\", use \"$id\" for schema ID");
    }
  };
  id.default = v3777;
  return id;
}
var ref = {};
var hasRequiredRef;
function requireRef() {
  if (hasRequiredRef) {
    return ref;
  }
  hasRequiredRef = 1;
  Object.defineProperty(ref, "__esModule", {
    value: true
  });
  ref.callRef = ref.getValidate = undefined;
  const v3778 = requireRef_error();
  const v3779 = requireCode();
  const v3780 = requireCodegen();
  const v3781 = requireNames();
  const v3782 = requireCompile();
  const v3783 = requireUtil();
  const v3784 = {
    keyword: "$ref",
    schemaType: "string",
    code(v3785) {
      const {
        gen: v3786,
        schema: v3787,
        it: v3788
      } = v3785;
      const {
        baseId: v3789,
        schemaEnv: v3790,
        validateName: v3791,
        opts: v3792,
        self: v3793
      } = v3788;
      const {
        root: v3794
      } = v3790;
      if ((v3787 === "#" || v3787 === "#/") && v3789 === v3794.baseId) {
        return v3795();
      }
      const v3796 = v3782.resolveRef.call(v3793, v3794, v3789, v3787);
      if (v3796 === undefined) {
        throw new v3778.default(v3788.opts.uriResolver, v3789, v3787);
      }
      if (v3796 instanceof v3782.SchemaEnv) {
        return v3797(v3796);
      }
      return v3798(v3796);
      function v3795() {
        if (v3790 === v3794) {
          return v3799(v3785, v3791, v3790, v3790.$async);
        }
        const v3800 = v3786.scopeValue("root", {
          ref: v3794
        });
        return v3799(v3785, (0, v3780._)`${v3800}.validate`, v3794, v3794.$async);
      }
      function v3797(v3801) {
        const v3802 = v3803(v3785, v3801);
        v3799(v3785, v3802, v3801, v3801.$async);
      }
      function v3798(v3804) {
        const v3805 = v3786.scopeValue("schema", v3792.code.source === true ? {
          ref: v3804,
          code: (0, v3780.stringify)(v3804)
        } : {
          ref: v3804
        });
        const v3806 = v3786.name("valid");
        const v3807 = v3785.subschema({
          schema: v3804,
          dataTypes: [],
          schemaPath: v3780.nil,
          topSchemaRef: v3805,
          errSchemaPath: v3787
        }, v3806);
        v3785.mergeEvaluated(v3807);
        v3785.ok(v3806);
      }
    }
  };
  function v3803(v3808, v3809) {
    const {
      gen: v3810
    } = v3808;
    if (v3809.validate) {
      return v3810.scopeValue("validate", {
        ref: v3809.validate
      });
    } else {
      return (0, v3780._)`${v3810.scopeValue("wrapper", {
        ref: v3809
      })}.validate`;
    }
  }
  ref.getValidate = v3803;
  function v3799(v3811, v3812, v3813, v3814) {
    const {
      gen: v3815,
      it: v3816
    } = v3811;
    const {
      allErrors: v3817,
      schemaEnv: v3818,
      opts: v3819
    } = v3816;
    const v3820 = v3819.passContext ? v3781.default.this : v3780.nil;
    if (v3814) {
      v3821();
    } else {
      v3822();
    }
    function v3821() {
      if (!v3818.$async) {
        throw new Error("async schema referenced by sync schema");
      }
      const v3823 = v3815.let("valid");
      v3815.try(() => {
        v3815.code((0, v3780._)`await ${(0, v3779.callValidateCode)(v3811, v3812, v3820)}`);
        v3824(v3812);
        if (!v3817) {
          v3815.assign(v3823, true);
        }
      }, v3825 => {
        v3815.if((0, v3780._)`!(${v3825} instanceof ${v3816.ValidationError})`, () => v3815.throw(v3825));
        v3826(v3825);
        if (!v3817) {
          v3815.assign(v3823, false);
        }
      });
      v3811.ok(v3823);
    }
    function v3822() {
      v3811.result((0, v3779.callValidateCode)(v3811, v3812, v3820), () => v3824(v3812), () => v3826(v3812));
    }
    function v3826(v3827) {
      const v3828 = (0, v3780._)`${v3827}.errors`;
      v3815.assign(v3781.default.vErrors, (0, v3780._)`${v3781.default.vErrors} === null ? ${v3828} : ${v3781.default.vErrors}.concat(${v3828})`);
      v3815.assign(v3781.default.errors, (0, v3780._)`${v3781.default.vErrors}.length`);
    }
    function v3824(v3829) {
      if (!v3816.opts.unevaluated) {
        return;
      }
      const v3830 = v3813?.validate?.evaluated;
      if (v3816.props !== true) {
        if (v3830 && !v3830.dynamicProps) {
          if (v3830.props !== undefined) {
            v3816.props = v3783.mergeEvaluated.props(v3815, v3830.props, v3816.props);
          }
        } else {
          const v3831 = v3815.var("props", (0, v3780._)`${v3829}.evaluated.props`);
          v3816.props = v3783.mergeEvaluated.props(v3815, v3831, v3816.props, v3780.Name);
        }
      }
      if (v3816.items !== true) {
        if (v3830 && !v3830.dynamicItems) {
          if (v3830.items !== undefined) {
            v3816.items = v3783.mergeEvaluated.items(v3815, v3830.items, v3816.items);
          }
        } else {
          const v3832 = v3815.var("items", (0, v3780._)`${v3829}.evaluated.items`);
          v3816.items = v3783.mergeEvaluated.items(v3815, v3832, v3816.items, v3780.Name);
        }
      }
    }
  }
  ref.callRef = v3799;
  ref.default = v3784;
  return ref;
}
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore) {
    return core;
  }
  hasRequiredCore = 1;
  Object.defineProperty(core, "__esModule", {
    value: true
  });
  const v3833 = requireId();
  const v3834 = requireRef();
  const v3835 = ["$schema", "$id", "$defs", "$vocabulary", {
    keyword: "$comment"
  }, "definitions", v3833.default, v3834.default];
  core.default = v3835;
  return core;
}
var validation = {};
var limitNumber = {};
var hasRequiredLimitNumber;
function requireLimitNumber() {
  if (hasRequiredLimitNumber) {
    return limitNumber;
  }
  hasRequiredLimitNumber = 1;
  Object.defineProperty(limitNumber, "__esModule", {
    value: true
  });
  const v3836 = requireCodegen();
  const v3837 = v3836.operators;
  const v3838 = {
    maximum: {
      okStr: "<=",
      ok: v3837.LTE,
      fail: v3837.GT
    },
    minimum: {
      okStr: ">=",
      ok: v3837.GTE,
      fail: v3837.LT
    },
    exclusiveMaximum: {
      okStr: "<",
      ok: v3837.LT,
      fail: v3837.GTE
    },
    exclusiveMinimum: {
      okStr: ">",
      ok: v3837.GT,
      fail: v3837.LTE
    }
  };
  const v3839 = {
    message: ({
      keyword: v3840,
      schemaCode: v3841
    }) => (0, v3836.str)`must be ${v3838[v3840].okStr} ${v3841}`,
    params: ({
      keyword: v3842,
      schemaCode: v3843
    }) => (0, v3836._)`{comparison: ${v3838[v3842].okStr}, limit: ${v3843}}`
  };
  const v3844 = {
    keyword: Object.keys(v3838),
    type: "number",
    schemaType: "number",
    $data: true,
    error: v3839,
    code(v3845) {
      const {
        keyword: v3846,
        data: v3847,
        schemaCode: v3848
      } = v3845;
      v3845.fail$data((0, v3836._)`${v3847} ${v3838[v3846].fail} ${v3848} || isNaN(${v3847})`);
    }
  };
  limitNumber.default = v3844;
  return limitNumber;
}
var multipleOf = {};
var hasRequiredMultipleOf;
function requireMultipleOf() {
  if (hasRequiredMultipleOf) {
    return multipleOf;
  }
  hasRequiredMultipleOf = 1;
  Object.defineProperty(multipleOf, "__esModule", {
    value: true
  });
  const v3849 = requireCodegen();
  const v3850 = {
    message: ({
      schemaCode: v3851
    }) => (0, v3849.str)`must be multiple of ${v3851}`,
    params: ({
      schemaCode: v3852
    }) => (0, v3849._)`{multipleOf: ${v3852}}`
  };
  const v3853 = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: true,
    error: v3850,
    code(v3854) {
      const {
        gen: v3855,
        data: v3856,
        schemaCode: v3857,
        it: v3858
      } = v3854;
      const v3859 = v3858.opts.multipleOfPrecision;
      const v3860 = v3855.let("res");
      const v3861 = v3859 ? (0, v3849._)`Math.abs(Math.round(${v3860}) - ${v3860}) > 1e-${v3859}` : (0, v3849._)`${v3860} !== parseInt(${v3860})`;
      v3854.fail$data((0, v3849._)`(${v3857} === 0 || (${v3860} = ${v3856}/${v3857}, ${v3861}))`);
    }
  };
  multipleOf.default = v3853;
  return multipleOf;
}
var limitLength = {};
var ucs2length = {};
var hasRequiredUcs2length;
function requireUcs2length() {
  if (hasRequiredUcs2length) {
    return ucs2length;
  }
  hasRequiredUcs2length = 1;
  Object.defineProperty(ucs2length, "__esModule", {
    value: true
  });
  function v3862(v3863) {
    const v3864 = v3863.length;
    let v3865 = 0;
    let v3866 = 0;
    let v3867;
    while (v3866 < v3864) {
      v3865++;
      v3867 = v3863.charCodeAt(v3866++);
      if (v3867 >= 55296 && v3867 <= 56319 && v3866 < v3864) {
        v3867 = v3863.charCodeAt(v3866);
        if ((v3867 & 64512) === 56320) {
          v3866++;
        }
      }
    }
    return v3865;
  }
  ucs2length.default = v3862;
  v3862.code = "require(\"ajv/dist/runtime/ucs2length\").default";
  return ucs2length;
}
var hasRequiredLimitLength;
function requireLimitLength() {
  if (hasRequiredLimitLength) {
    return limitLength;
  }
  hasRequiredLimitLength = 1;
  Object.defineProperty(limitLength, "__esModule", {
    value: true
  });
  const v3868 = requireCodegen();
  const v3869 = requireUtil();
  const v3870 = requireUcs2length();
  const v3871 = {
    message({
      keyword: v3872,
      schemaCode: v3873
    }) {
      const v3874 = v3872 === "maxLength" ? "more" : "fewer";
      return (0, v3868.str)`must NOT have ${v3874} than ${v3873} characters`;
    },
    params: ({
      schemaCode: v3875
    }) => (0, v3868._)`{limit: ${v3875}}`
  };
  const v3876 = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: true,
    error: v3871,
    code(v3877) {
      const {
        keyword: v3878,
        data: v3879,
        schemaCode: v3880,
        it: v3881
      } = v3877;
      const v3882 = v3878 === "maxLength" ? v3868.operators.GT : v3868.operators.LT;
      const v3883 = v3881.opts.unicode === false ? (0, v3868._)`${v3879}.length` : (0, v3868._)`${(0, v3869.useFunc)(v3877.gen, v3870.default)}(${v3879})`;
      v3877.fail$data((0, v3868._)`${v3883} ${v3882} ${v3880}`);
    }
  };
  limitLength.default = v3876;
  return limitLength;
}
var pattern = {};
var hasRequiredPattern;
function requirePattern() {
  if (hasRequiredPattern) {
    return pattern;
  }
  hasRequiredPattern = 1;
  Object.defineProperty(pattern, "__esModule", {
    value: true
  });
  const v3884 = requireCode();
  const v3885 = requireUtil();
  const v3886 = requireCodegen();
  const v3887 = {
    message: ({
      schemaCode: v3888
    }) => (0, v3886.str)`must match pattern "${v3888}"`,
    params: ({
      schemaCode: v3889
    }) => (0, v3886._)`{pattern: ${v3889}}`
  };
  const v3890 = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: true,
    error: v3887,
    code(v3891) {
      const {
        gen: v3892,
        data: v3893,
        $data: v3894,
        schema: v3895,
        schemaCode: v3896,
        it: v3897
      } = v3891;
      const v3898 = v3897.opts.unicodeRegExp ? "u" : "";
      if (v3894) {
        const {
          regExp: v3899
        } = v3897.opts.code;
        const v3900 = v3899.code === "new RegExp" ? (0, v3886._)`new RegExp` : (0, v3885.useFunc)(v3892, v3899);
        const v3901 = v3892.let("valid");
        v3892.try(() => v3892.assign(v3901, (0, v3886._)`${v3900}(${v3896}, ${v3898}).test(${v3893})`), () => v3892.assign(v3901, false));
        v3891.fail$data((0, v3886._)`!${v3901}`);
      } else {
        const v3902 = (0, v3884.usePattern)(v3891, v3895);
        v3891.fail$data((0, v3886._)`!${v3902}.test(${v3893})`);
      }
    }
  };
  pattern.default = v3890;
  return pattern;
}
var limitProperties = {};
var hasRequiredLimitProperties;
function requireLimitProperties() {
  if (hasRequiredLimitProperties) {
    return limitProperties;
  }
  hasRequiredLimitProperties = 1;
  Object.defineProperty(limitProperties, "__esModule", {
    value: true
  });
  const v3903 = requireCodegen();
  const v3904 = {
    message({
      keyword: v3905,
      schemaCode: v3906
    }) {
      const v3907 = v3905 === "maxProperties" ? "more" : "fewer";
      return (0, v3903.str)`must NOT have ${v3907} than ${v3906} properties`;
    },
    params: ({
      schemaCode: v3908
    }) => (0, v3903._)`{limit: ${v3908}}`
  };
  const v3909 = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: true,
    error: v3904,
    code(v3910) {
      const {
        keyword: v3911,
        data: v3912,
        schemaCode: v3913
      } = v3910;
      const v3914 = v3911 === "maxProperties" ? v3903.operators.GT : v3903.operators.LT;
      v3910.fail$data((0, v3903._)`Object.keys(${v3912}).length ${v3914} ${v3913}`);
    }
  };
  limitProperties.default = v3909;
  return limitProperties;
}
var required = {};
var hasRequiredRequired;
function requireRequired() {
  if (hasRequiredRequired) {
    return required;
  }
  hasRequiredRequired = 1;
  Object.defineProperty(required, "__esModule", {
    value: true
  });
  const v3915 = requireCode();
  const v3916 = requireCodegen();
  const v3917 = requireUtil();
  const v3918 = {
    message: ({
      params: {
        missingProperty: v3919
      }
    }) => (0, v3916.str)`must have required property '${v3919}'`,
    params: ({
      params: {
        missingProperty: v3920
      }
    }) => (0, v3916._)`{missingProperty: ${v3920}}`
  };
  const v3921 = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: true,
    error: v3918,
    code(v3922) {
      const {
        gen: v3923,
        schema: v3924,
        schemaCode: v3925,
        data: v3926,
        $data: v3927,
        it: v3928
      } = v3922;
      const {
        opts: v3929
      } = v3928;
      if (!v3927 && v3924.length === 0) {
        return;
      }
      const v3930 = v3924.length >= v3929.loopRequired;
      if (v3928.allErrors) {
        v3931();
      } else {
        v3932();
      }
      if (v3929.strictRequired) {
        const v3933 = v3922.parentSchema.properties;
        const {
          definedProperties: v3934
        } = v3922.it;
        for (const v3935 of v3924) {
          if (v3933?.[v3935] === undefined && !v3934.has(v3935)) {
            const v3936 = v3928.schemaEnv.baseId + v3928.errSchemaPath;
            const v3937 = "required property \"" + v3935 + "\" is not defined at \"" + v3936 + "\" (strictRequired)";
            (0, v3917.checkStrictMode)(v3928, v3937, v3928.opts.strictRequired);
          }
        }
      }
      function v3931() {
        if (v3930 || v3927) {
          v3922.block$data(v3916.nil, v3938);
        } else {
          for (const v3939 of v3924) {
            (0, v3915.checkReportMissingProp)(v3922, v3939);
          }
        }
      }
      function v3932() {
        const v3940 = v3923.let("missing");
        if (v3930 || v3927) {
          const v3941 = v3923.let("valid", true);
          v3922.block$data(v3941, () => v3942(v3940, v3941));
          v3922.ok(v3941);
        } else {
          v3923.if((0, v3915.checkMissingProp)(v3922, v3924, v3940));
          (0, v3915.reportMissingProp)(v3922, v3940);
          v3923.else();
        }
      }
      function v3938() {
        v3923.forOf("prop", v3925, v3943 => {
          v3922.setParams({
            missingProperty: v3943
          });
          v3923.if((0, v3915.noPropertyInData)(v3923, v3926, v3943, v3929.ownProperties), () => v3922.error());
        });
      }
      function v3942(v3944, v3945) {
        v3922.setParams({
          missingProperty: v3944
        });
        v3923.forOf(v3944, v3925, () => {
          v3923.assign(v3945, (0, v3915.propertyInData)(v3923, v3926, v3944, v3929.ownProperties));
          v3923.if((0, v3916.not)(v3945), () => {
            v3922.error();
            v3923.break();
          });
        }, v3916.nil);
      }
    }
  };
  required.default = v3921;
  return required;
}
var limitItems = {};
var hasRequiredLimitItems;
function requireLimitItems() {
  if (hasRequiredLimitItems) {
    return limitItems;
  }
  hasRequiredLimitItems = 1;
  Object.defineProperty(limitItems, "__esModule", {
    value: true
  });
  const v3946 = requireCodegen();
  const v3947 = {
    message({
      keyword: v3948,
      schemaCode: v3949
    }) {
      const v3950 = v3948 === "maxItems" ? "more" : "fewer";
      return (0, v3946.str)`must NOT have ${v3950} than ${v3949} items`;
    },
    params: ({
      schemaCode: v3951
    }) => (0, v3946._)`{limit: ${v3951}}`
  };
  const v3952 = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: true,
    error: v3947,
    code(v3953) {
      const {
        keyword: v3954,
        data: v3955,
        schemaCode: v3956
      } = v3953;
      const v3957 = v3954 === "maxItems" ? v3946.operators.GT : v3946.operators.LT;
      v3953.fail$data((0, v3946._)`${v3955}.length ${v3957} ${v3956}`);
    }
  };
  limitItems.default = v3952;
  return limitItems;
}
var uniqueItems = {};
var equal = {};
var hasRequiredEqual;
function requireEqual() {
  if (hasRequiredEqual) {
    return equal;
  }
  hasRequiredEqual = 1;
  Object.defineProperty(equal, "__esModule", {
    value: true
  });
  const v3958 = requireFastDeepEqual();
  v3958.code = "require(\"ajv/dist/runtime/equal\").default";
  equal.default = v3958;
  return equal;
}
var hasRequiredUniqueItems;
function requireUniqueItems() {
  if (hasRequiredUniqueItems) {
    return uniqueItems;
  }
  hasRequiredUniqueItems = 1;
  Object.defineProperty(uniqueItems, "__esModule", {
    value: true
  });
  const v3959 = requireDataType();
  const v3960 = requireCodegen();
  const v3961 = requireUtil();
  const v3962 = requireEqual();
  const v3963 = {
    message: ({
      params: {
        i: v3964,
        j: v3965
      }
    }) => (0, v3960.str)`must NOT have duplicate items (items ## ${v3965} and ${v3964} are identical)`,
    params: ({
      params: {
        i: v3966,
        j: v3967
      }
    }) => (0, v3960._)`{i: ${v3966}, j: ${v3967}}`
  };
  const v3968 = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: true,
    error: v3963,
    code(v3969) {
      const {
        gen: v3970,
        data: v3971,
        $data: v3972,
        schema: v3973,
        parentSchema: v3974,
        schemaCode: v3975,
        it: v3976
      } = v3969;
      if (!v3972 && !v3973) {
        return;
      }
      const v3977 = v3970.let("valid");
      const v3978 = v3974.items ? (0, v3959.getSchemaTypes)(v3974.items) : [];
      v3969.block$data(v3977, v3979, (0, v3960._)`${v3975} === false`);
      v3969.ok(v3977);
      function v3979() {
        const v3980 = v3970.let("i", (0, v3960._)`${v3971}.length`);
        const v3981 = v3970.let("j");
        v3969.setParams({
          i: v3980,
          j: v3981
        });
        v3970.assign(v3977, true);
        v3970.if((0, v3960._)`${v3980} > 1`, () => (v3982() ? v3983 : v3984)(v3980, v3981));
      }
      function v3982() {
        return v3978.length > 0 && !v3978.some(v3985 => v3985 === "object" || v3985 === "array");
      }
      function v3983(v3986, v3987) {
        const v3988 = v3970.name("item");
        const v3989 = (0, v3959.checkDataTypes)(v3978, v3988, v3976.opts.strictNumbers, v3959.DataType.Wrong);
        const v3990 = v3970.const("indices", (0, v3960._)`{}`);
        v3970.for((0, v3960._)`;${v3986}--;`, () => {
          v3970.let(v3988, (0, v3960._)`${v3971}[${v3986}]`);
          v3970.if(v3989, (0, v3960._)`continue`);
          if (v3978.length > 1) {
            v3970.if((0, v3960._)`typeof ${v3988} == "string"`, (0, v3960._)`${v3988} += "_"`);
          }
          v3970.if((0, v3960._)`typeof ${v3990}[${v3988}] == "number"`, () => {
            v3970.assign(v3987, (0, v3960._)`${v3990}[${v3988}]`);
            v3969.error();
            v3970.assign(v3977, false).break();
          }).code((0, v3960._)`${v3990}[${v3988}] = ${v3986}`);
        });
      }
      function v3984(v3991, v3992) {
        const v3993 = (0, v3961.useFunc)(v3970, v3962.default);
        const v3994 = v3970.name("outer");
        v3970.label(v3994).for((0, v3960._)`;${v3991}--;`, () => v3970.for((0, v3960._)`${v3992} = ${v3991}; ${v3992}--;`, () => v3970.if((0, v3960._)`${v3993}(${v3971}[${v3991}], ${v3971}[${v3992}])`, () => {
          v3969.error();
          v3970.assign(v3977, false).break(v3994);
        })));
      }
    }
  };
  uniqueItems.default = v3968;
  return uniqueItems;
}
var _const = {};
var hasRequired_const;
function require_const() {
  if (hasRequired_const) {
    return _const;
  }
  hasRequired_const = 1;
  Object.defineProperty(_const, "__esModule", {
    value: true
  });
  const v3995 = requireCodegen();
  const v3996 = requireUtil();
  const v3997 = requireEqual();
  const v3998 = {
    message: "must be equal to constant",
    params: ({
      schemaCode: v3999
    }) => (0, v3995._)`{allowedValue: ${v3999}}`
  };
  const v4000 = {
    keyword: "const",
    $data: true,
    error: v3998,
    code(v4001) {
      const {
        gen: v4002,
        data: v4003,
        $data: v4004,
        schemaCode: v4005,
        schema: v4006
      } = v4001;
      if (v4004 || v4006 && typeof v4006 == "object") {
        v4001.fail$data((0, v3995._)`!${(0, v3996.useFunc)(v4002, v3997.default)}(${v4003}, ${v4005})`);
      } else {
        v4001.fail((0, v3995._)`${v4006} !== ${v4003}`);
      }
    }
  };
  _const.default = v4000;
  return _const;
}
var _enum = {};
var hasRequired_enum;
function require_enum() {
  if (hasRequired_enum) {
    return _enum;
  }
  hasRequired_enum = 1;
  Object.defineProperty(_enum, "__esModule", {
    value: true
  });
  const v4007 = requireCodegen();
  const v4008 = requireUtil();
  const v4009 = requireEqual();
  const v4010 = {
    message: "must be equal to one of the allowed values",
    params: ({
      schemaCode: v4011
    }) => (0, v4007._)`{allowedValues: ${v4011}}`
  };
  const v4012 = {
    keyword: "enum",
    schemaType: "array",
    $data: true,
    error: v4010,
    code(v4013) {
      const {
        gen: v4014,
        data: v4015,
        $data: v4016,
        schema: v4017,
        schemaCode: v4018,
        it: v4019
      } = v4013;
      if (!v4016 && v4017.length === 0) {
        throw new Error("enum must have non-empty array");
      }
      const v4020 = v4017.length >= v4019.opts.loopEnum;
      let v4021;
      const v4022 = () => v4021 ??= (0, v4008.useFunc)(v4014, v4009.default);
      let v4023;
      if (v4020 || v4016) {
        v4023 = v4014.let("valid");
        v4013.block$data(v4023, v4024);
      } else {
        if (!Array.isArray(v4017)) {
          throw new Error("ajv implementation error");
        }
        const v4025 = v4014.const("vSchema", v4018);
        v4023 = (0, v4007.or)(...v4017.map((v4026, v4027) => v4028(v4025, v4027)));
      }
      v4013.pass(v4023);
      function v4024() {
        v4014.assign(v4023, false);
        v4014.forOf("v", v4018, v4029 => v4014.if((0, v4007._)`${v4022()}(${v4015}, ${v4029})`, () => v4014.assign(v4023, true).break()));
      }
      function v4028(v4030, v4031) {
        const v4032 = v4017[v4031];
        if (typeof v4032 === "object" && v4032 !== null) {
          return (0, v4007._)`${v4022()}(${v4015}, ${v4030}[${v4031}])`;
        } else {
          return (0, v4007._)`${v4015} === ${v4032}`;
        }
      }
    }
  };
  _enum.default = v4012;
  return _enum;
}
var hasRequiredValidation;
function requireValidation() {
  if (hasRequiredValidation) {
    return validation;
  }
  hasRequiredValidation = 1;
  Object.defineProperty(validation, "__esModule", {
    value: true
  });
  const v4033 = requireLimitNumber();
  const v4034 = requireMultipleOf();
  const v4035 = requireLimitLength();
  const v4036 = requirePattern();
  const v4037 = requireLimitProperties();
  const v4038 = requireRequired();
  const v4039 = requireLimitItems();
  const v4040 = requireUniqueItems();
  const v4041 = require_const();
  const v4042 = require_enum();
  const v4043 = [v4033.default, v4034.default, v4035.default, v4036.default, v4037.default, v4038.default, v4039.default, v4040.default, {
    keyword: "type",
    schemaType: ["string", "array"]
  }, {
    keyword: "nullable",
    schemaType: "boolean"
  }, v4041.default, v4042.default];
  validation.default = v4043;
  return validation;
}
var applicator = {};
var additionalItems = {};
var hasRequiredAdditionalItems;
function requireAdditionalItems() {
  if (hasRequiredAdditionalItems) {
    return additionalItems;
  }
  hasRequiredAdditionalItems = 1;
  Object.defineProperty(additionalItems, "__esModule", {
    value: true
  });
  additionalItems.validateAdditionalItems = undefined;
  const v4044 = requireCodegen();
  const v4045 = requireUtil();
  const v4046 = {
    message: ({
      params: {
        len: v4047
      }
    }) => (0, v4044.str)`must NOT have more than ${v4047} items`,
    params: ({
      params: {
        len: v4048
      }
    }) => (0, v4044._)`{limit: ${v4048}}`
  };
  const v4049 = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: v4046,
    code(v4050) {
      const {
        parentSchema: v4051,
        it: v4052
      } = v4050;
      const {
        items: v4053
      } = v4051;
      if (!Array.isArray(v4053)) {
        (0, v4045.checkStrictMode)(v4052, "\"additionalItems\" is ignored when \"items\" is not an array of schemas");
        return;
      }
      v4054(v4050, v4053);
    }
  };
  function v4054(v4055, v4056) {
    const {
      gen: v4057,
      schema: v4058,
      data: v4059,
      keyword: v4060,
      it: v4061
    } = v4055;
    v4061.items = true;
    const v4062 = v4057.const("len", (0, v4044._)`${v4059}.length`);
    if (v4058 === false) {
      v4055.setParams({
        len: v4056.length
      });
      v4055.pass((0, v4044._)`${v4062} <= ${v4056.length}`);
    } else if (typeof v4058 == "object" && !(0, v4045.alwaysValidSchema)(v4061, v4058)) {
      const v4063 = v4057.var("valid", (0, v4044._)`${v4062} <= ${v4056.length}`);
      v4057.if((0, v4044.not)(v4063), () => v4064(v4063));
      v4055.ok(v4063);
    }
    function v4064(v4065) {
      v4057.forRange("i", v4056.length, v4062, v4066 => {
        v4055.subschema({
          keyword: v4060,
          dataProp: v4066,
          dataPropType: v4045.Type.Num
        }, v4065);
        if (!v4061.allErrors) {
          v4057.if((0, v4044.not)(v4065), () => v4057.break());
        }
      });
    }
  }
  additionalItems.validateAdditionalItems = v4054;
  additionalItems.default = v4049;
  return additionalItems;
}
var prefixItems = {};
var items = {};
var hasRequiredItems;
function requireItems() {
  if (hasRequiredItems) {
    return items;
  }
  hasRequiredItems = 1;
  Object.defineProperty(items, "__esModule", {
    value: true
  });
  items.validateTuple = undefined;
  const v4067 = requireCodegen();
  const v4068 = requireUtil();
  const v4069 = requireCode();
  const v4070 = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(v4071) {
      const {
        schema: v4072,
        it: v4073
      } = v4071;
      if (Array.isArray(v4072)) {
        return v4074(v4071, "additionalItems", v4072);
      }
      v4073.items = true;
      if ((0, v4068.alwaysValidSchema)(v4073, v4072)) {
        return;
      }
      v4071.ok((0, v4069.validateArray)(v4071));
    }
  };
  function v4074(v4075, v4076, v4077 = v4075.schema) {
    const {
      gen: v4078,
      parentSchema: v4079,
      data: v4080,
      keyword: v4081,
      it: v4082
    } = v4075;
    v4083(v4079);
    if (v4082.opts.unevaluated && v4077.length && v4082.items !== true) {
      v4082.items = v4068.mergeEvaluated.items(v4078, v4077.length, v4082.items);
    }
    const v4084 = v4078.name("valid");
    const v4085 = v4078.const("len", (0, v4067._)`${v4080}.length`);
    v4077.forEach((v4086, v4087) => {
      if ((0, v4068.alwaysValidSchema)(v4082, v4086)) {
        return;
      }
      v4078.if((0, v4067._)`${v4085} > ${v4087}`, () => v4075.subschema({
        keyword: v4081,
        schemaProp: v4087,
        dataProp: v4087
      }, v4084));
      v4075.ok(v4084);
    });
    function v4083(v4088) {
      const {
        opts: v4089,
        errSchemaPath: v4090
      } = v4082;
      const v4091 = v4077.length;
      const v4092 = v4091 === v4088.minItems && (v4091 === v4088.maxItems || v4088[v4076] === false);
      if (v4089.strictTuples && !v4092) {
        const v4093 = "\"" + v4081 + "\" is " + v4091 + "-tuple, but minItems or maxItems/" + v4076 + " are not specified or different at path \"" + v4090 + "\"";
        (0, v4068.checkStrictMode)(v4082, v4093, v4089.strictTuples);
      }
    }
  }
  items.validateTuple = v4074;
  items.default = v4070;
  return items;
}
var hasRequiredPrefixItems;
function requirePrefixItems() {
  if (hasRequiredPrefixItems) {
    return prefixItems;
  }
  hasRequiredPrefixItems = 1;
  Object.defineProperty(prefixItems, "__esModule", {
    value: true
  });
  const v4094 = requireItems();
  const v4095 = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: v4096 => (0, v4094.validateTuple)(v4096, "items")
  };
  prefixItems.default = v4095;
  return prefixItems;
}
var items2020 = {};
var hasRequiredItems2020;
function requireItems2020() {
  if (hasRequiredItems2020) {
    return items2020;
  }
  hasRequiredItems2020 = 1;
  Object.defineProperty(items2020, "__esModule", {
    value: true
  });
  const v4097 = requireCodegen();
  const v4098 = requireUtil();
  const v4099 = requireCode();
  const v4100 = requireAdditionalItems();
  const v4101 = {
    message: ({
      params: {
        len: v4102
      }
    }) => (0, v4097.str)`must NOT have more than ${v4102} items`,
    params: ({
      params: {
        len: v4103
      }
    }) => (0, v4097._)`{limit: ${v4103}}`
  };
  const v4104 = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: v4101,
    code(v4105) {
      const {
        schema: v4106,
        parentSchema: v4107,
        it: v4108
      } = v4105;
      const {
        prefixItems: v4109
      } = v4107;
      v4108.items = true;
      if ((0, v4098.alwaysValidSchema)(v4108, v4106)) {
        return;
      }
      if (v4109) {
        (0, v4100.validateAdditionalItems)(v4105, v4109);
      } else {
        v4105.ok((0, v4099.validateArray)(v4105));
      }
    }
  };
  items2020.default = v4104;
  return items2020;
}
var contains = {};
var hasRequiredContains;
function requireContains() {
  if (hasRequiredContains) {
    return contains;
  }
  hasRequiredContains = 1;
  Object.defineProperty(contains, "__esModule", {
    value: true
  });
  const v4110 = requireCodegen();
  const v4111 = requireUtil();
  const v4112 = {
    message: ({
      params: {
        min: v4113,
        max: v4114
      }
    }) => v4114 === undefined ? (0, v4110.str)`must contain at least ${v4113} valid item(s)` : (0, v4110.str)`must contain at least ${v4113} and no more than ${v4114} valid item(s)`,
    params: ({
      params: {
        min: v4115,
        max: v4116
      }
    }) => v4116 === undefined ? (0, v4110._)`{minContains: ${v4115}}` : (0, v4110._)`{minContains: ${v4115}, maxContains: ${v4116}}`
  };
  const v4117 = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: true,
    error: v4112,
    code(v4118) {
      const {
        gen: v4119,
        schema: v4120,
        parentSchema: v4121,
        data: v4122,
        it: v4123
      } = v4118;
      let v4124;
      let v4125;
      const {
        minContains: v4126,
        maxContains: v4127
      } = v4121;
      if (v4123.opts.next) {
        v4124 = v4126 === undefined ? 1 : v4126;
        v4125 = v4127;
      } else {
        v4124 = 1;
      }
      const v4128 = v4119.const("len", (0, v4110._)`${v4122}.length`);
      v4118.setParams({
        min: v4124,
        max: v4125
      });
      if (v4125 === undefined && v4124 === 0) {
        (0, v4111.checkStrictMode)(v4123, "\"minContains\" == 0 without \"maxContains\": \"contains\" keyword ignored");
        return;
      }
      if (v4125 !== undefined && v4124 > v4125) {
        (0, v4111.checkStrictMode)(v4123, "\"minContains\" > \"maxContains\" is always invalid");
        v4118.fail();
        return;
      }
      if ((0, v4111.alwaysValidSchema)(v4123, v4120)) {
        let v4129 = (0, v4110._)`${v4128} >= ${v4124}`;
        if (v4125 !== undefined) {
          v4129 = (0, v4110._)`${v4129} && ${v4128} <= ${v4125}`;
        }
        v4118.pass(v4129);
        return;
      }
      v4123.items = true;
      const v4130 = v4119.name("valid");
      if (v4125 === undefined && v4124 === 1) {
        v4131(v4130, () => v4119.if(v4130, () => v4119.break()));
      } else if (v4124 === 0) {
        v4119.let(v4130, true);
        if (v4125 !== undefined) {
          v4119.if((0, v4110._)`${v4122}.length > 0`, v4132);
        }
      } else {
        v4119.let(v4130, false);
        v4132();
      }
      v4118.result(v4130, () => v4118.reset());
      function v4132() {
        const v4133 = v4119.name("_valid");
        const v4134 = v4119.let("count", 0);
        v4131(v4133, () => v4119.if(v4133, () => v4135(v4134)));
      }
      function v4131(v4136, v4137) {
        v4119.forRange("i", 0, v4128, v4138 => {
          v4118.subschema({
            keyword: "contains",
            dataProp: v4138,
            dataPropType: v4111.Type.Num,
            compositeRule: true
          }, v4136);
          v4137();
        });
      }
      function v4135(v4139) {
        v4119.code((0, v4110._)`${v4139}++`);
        if (v4125 === undefined) {
          v4119.if((0, v4110._)`${v4139} >= ${v4124}`, () => v4119.assign(v4130, true).break());
        } else {
          v4119.if((0, v4110._)`${v4139} > ${v4125}`, () => v4119.assign(v4130, false).break());
          if (v4124 === 1) {
            v4119.assign(v4130, true);
          } else {
            v4119.if((0, v4110._)`${v4139} >= ${v4124}`, () => v4119.assign(v4130, true));
          }
        }
      }
    }
  };
  contains.default = v4117;
  return contains;
}
var dependencies = {};
var hasRequiredDependencies;
function requireDependencies() {
  if (hasRequiredDependencies) {
    return dependencies;
  }
  hasRequiredDependencies = 1;
  (function (v4140) {
    Object.defineProperty(v4140, "__esModule", {
      value: true
    });
    v4140.validateSchemaDeps = v4140.validatePropertyDeps = v4140.error = undefined;
    const v4141 = requireCodegen();
    const v4142 = requireUtil();
    const v4143 = requireCode();
    v4140.error = {
      message: ({
        params: {
          property: v4144,
          depsCount: v4145,
          deps: v4146
        }
      }) => {
        const v4147 = v4145 === 1 ? "property" : "properties";
        return (0, v4141.str)`must have ${v4147} ${v4146} when property ${v4144} is present`;
      },
      params: ({
        params: {
          property: v4148,
          depsCount: v4149,
          deps: v4150,
          missingProperty: v4151
        }
      }) => (0, v4141._)`{property: ${v4148},
    missingProperty: ${v4151},
    depsCount: ${v4149},
    deps: ${v4150}}`
    };
    const v4152 = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: v4140.error,
      code(v4153) {
        const [v4154, v4155] = v4156(v4153);
        v4157(v4153, v4154);
        v4158(v4153, v4155);
      }
    };
    function v4156({
      schema: v4159
    }) {
      const v4160 = {};
      const v4161 = {};
      for (const v4162 in v4159) {
        if (v4162 === "__proto__") {
          continue;
        }
        const v4163 = Array.isArray(v4159[v4162]) ? v4160 : v4161;
        v4163[v4162] = v4159[v4162];
      }
      return [v4160, v4161];
    }
    function v4157(v4164, v4165 = v4164.schema) {
      const {
        gen: v4166,
        data: v4167,
        it: v4168
      } = v4164;
      if (Object.keys(v4165).length === 0) {
        return;
      }
      const v4169 = v4166.let("missing");
      for (const v4170 in v4165) {
        const v4171 = v4165[v4170];
        if (v4171.length === 0) {
          continue;
        }
        const v4172 = (0, v4143.propertyInData)(v4166, v4167, v4170, v4168.opts.ownProperties);
        v4164.setParams({
          property: v4170,
          depsCount: v4171.length,
          deps: v4171.join(", ")
        });
        if (v4168.allErrors) {
          v4166.if(v4172, () => {
            for (const v4173 of v4171) {
              (0, v4143.checkReportMissingProp)(v4164, v4173);
            }
          });
        } else {
          v4166.if((0, v4141._)`${v4172} && (${(0, v4143.checkMissingProp)(v4164, v4171, v4169)})`);
          (0, v4143.reportMissingProp)(v4164, v4169);
          v4166.else();
        }
      }
    }
    v4140.validatePropertyDeps = v4157;
    function v4158(v4174, v4175 = v4174.schema) {
      const {
        gen: v4176,
        data: v4177,
        keyword: v4178,
        it: v4179
      } = v4174;
      const v4180 = v4176.name("valid");
      for (const v4181 in v4175) {
        if ((0, v4142.alwaysValidSchema)(v4179, v4175[v4181])) {
          continue;
        }
        v4176.if((0, v4143.propertyInData)(v4176, v4177, v4181, v4179.opts.ownProperties), () => {
          const v4182 = v4174.subschema({
            keyword: v4178,
            schemaProp: v4181
          }, v4180);
          v4174.mergeValidEvaluated(v4182, v4180);
        }, () => v4176.var(v4180, true));
        v4174.ok(v4180);
      }
    }
    v4140.validateSchemaDeps = v4158;
    v4140.default = v4152;
  })(dependencies);
  return dependencies;
}
var propertyNames = {};
var hasRequiredPropertyNames;
function requirePropertyNames() {
  if (hasRequiredPropertyNames) {
    return propertyNames;
  }
  hasRequiredPropertyNames = 1;
  Object.defineProperty(propertyNames, "__esModule", {
    value: true
  });
  const v4183 = requireCodegen();
  const v4184 = requireUtil();
  const v4185 = {
    message: "property name must be valid",
    params: ({
      params: v4186
    }) => (0, v4183._)`{propertyName: ${v4186.propertyName}}`
  };
  const v4187 = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: v4185,
    code(v4188) {
      const {
        gen: v4189,
        schema: v4190,
        data: v4191,
        it: v4192
      } = v4188;
      if ((0, v4184.alwaysValidSchema)(v4192, v4190)) {
        return;
      }
      const v4193 = v4189.name("valid");
      v4189.forIn("key", v4191, v4194 => {
        v4188.setParams({
          propertyName: v4194
        });
        v4188.subschema({
          keyword: "propertyNames",
          data: v4194,
          dataTypes: ["string"],
          propertyName: v4194,
          compositeRule: true
        }, v4193);
        v4189.if((0, v4183.not)(v4193), () => {
          v4188.error(true);
          if (!v4192.allErrors) {
            v4189.break();
          }
        });
      });
      v4188.ok(v4193);
    }
  };
  propertyNames.default = v4187;
  return propertyNames;
}
var additionalProperties = {};
var hasRequiredAdditionalProperties;
function requireAdditionalProperties() {
  if (hasRequiredAdditionalProperties) {
    return additionalProperties;
  }
  hasRequiredAdditionalProperties = 1;
  Object.defineProperty(additionalProperties, "__esModule", {
    value: true
  });
  const v4195 = requireCode();
  const v4196 = requireCodegen();
  const v4197 = requireNames();
  const v4198 = requireUtil();
  const v4199 = {
    message: "must NOT have additional properties",
    params: ({
      params: v4200
    }) => (0, v4196._)`{additionalProperty: ${v4200.additionalProperty}}`
  };
  const v4201 = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: true,
    trackErrors: true,
    error: v4199,
    code(v4202) {
      const {
        gen: v4203,
        schema: v4204,
        parentSchema: v4205,
        data: v4206,
        errsCount: v4207,
        it: v4208
      } = v4202;
      if (!v4207) {
        throw new Error("ajv implementation error");
      }
      const {
        allErrors: v4209,
        opts: v4210
      } = v4208;
      v4208.props = true;
      if (v4210.removeAdditional !== "all" && (0, v4198.alwaysValidSchema)(v4208, v4204)) {
        return;
      }
      const v4211 = (0, v4195.allSchemaProperties)(v4205.properties);
      const v4212 = (0, v4195.allSchemaProperties)(v4205.patternProperties);
      v4213();
      v4202.ok((0, v4196._)`${v4207} === ${v4197.default.errors}`);
      function v4213() {
        v4203.forIn("key", v4206, v4214 => {
          if (!v4211.length && !v4212.length) {
            v4215(v4214);
          } else {
            v4203.if(v4216(v4214), () => v4215(v4214));
          }
        });
      }
      function v4216(v4217) {
        let v4218;
        if (v4211.length > 8) {
          const v4219 = (0, v4198.schemaRefOrVal)(v4208, v4205.properties, "properties");
          v4218 = (0, v4195.isOwnProperty)(v4203, v4219, v4217);
        } else if (v4211.length) {
          v4218 = (0, v4196.or)(...v4211.map(v4220 => (0, v4196._)`${v4217} === ${v4220}`));
        } else {
          v4218 = v4196.nil;
        }
        if (v4212.length) {
          v4218 = (0, v4196.or)(v4218, ...v4212.map(v4221 => (0, v4196._)`${(0, v4195.usePattern)(v4202, v4221)}.test(${v4217})`));
        }
        return (0, v4196.not)(v4218);
      }
      function v4222(v4223) {
        v4203.code((0, v4196._)`delete ${v4206}[${v4223}]`);
      }
      function v4215(v4224) {
        if (v4210.removeAdditional === "all" || v4210.removeAdditional && v4204 === false) {
          v4222(v4224);
          return;
        }
        if (v4204 === false) {
          v4202.setParams({
            additionalProperty: v4224
          });
          v4202.error();
          if (!v4209) {
            v4203.break();
          }
          return;
        }
        if (typeof v4204 == "object" && !(0, v4198.alwaysValidSchema)(v4208, v4204)) {
          const v4225 = v4203.name("valid");
          if (v4210.removeAdditional === "failing") {
            v4226(v4224, v4225, false);
            v4203.if((0, v4196.not)(v4225), () => {
              v4202.reset();
              v4222(v4224);
            });
          } else {
            v4226(v4224, v4225);
            if (!v4209) {
              v4203.if((0, v4196.not)(v4225), () => v4203.break());
            }
          }
        }
      }
      function v4226(v4227, v4228, v4229) {
        const v4230 = {
          keyword: "additionalProperties",
          dataProp: v4227,
          dataPropType: v4198.Type.Str
        };
        if (v4229 === false) {
          Object.assign(v4230, {
            compositeRule: true,
            createErrors: false,
            allErrors: false
          });
        }
        v4202.subschema(v4230, v4228);
      }
    }
  };
  additionalProperties.default = v4201;
  return additionalProperties;
}
var properties$1 = {};
var hasRequiredProperties;
function requireProperties() {
  if (hasRequiredProperties) {
    return properties$1;
  }
  hasRequiredProperties = 1;
  Object.defineProperty(properties$1, "__esModule", {
    value: true
  });
  const v4231 = requireValidate();
  const v4232 = requireCode();
  const v4233 = requireUtil();
  const v4234 = requireAdditionalProperties();
  const v4235 = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(v4236) {
      const {
        gen: v4237,
        schema: v4238,
        parentSchema: v4239,
        data: v4240,
        it: v4241
      } = v4236;
      if (v4241.opts.removeAdditional === "all" && v4239.additionalProperties === undefined) {
        v4234.default.code(new v4231.KeywordCxt(v4241, v4234.default, "additionalProperties"));
      }
      const v4242 = (0, v4232.allSchemaProperties)(v4238);
      for (const v4243 of v4242) {
        v4241.definedProperties.add(v4243);
      }
      if (v4241.opts.unevaluated && v4242.length && v4241.props !== true) {
        v4241.props = v4233.mergeEvaluated.props(v4237, (0, v4233.toHash)(v4242), v4241.props);
      }
      const v4244 = v4242.filter(v4245 => !(0, v4233.alwaysValidSchema)(v4241, v4238[v4245]));
      if (v4244.length === 0) {
        return;
      }
      const v4246 = v4237.name("valid");
      for (const v4247 of v4244) {
        if (v4248(v4247)) {
          v4249(v4247);
        } else {
          v4237.if((0, v4232.propertyInData)(v4237, v4240, v4247, v4241.opts.ownProperties));
          v4249(v4247);
          if (!v4241.allErrors) {
            v4237.else().var(v4246, true);
          }
          v4237.endIf();
        }
        v4236.it.definedProperties.add(v4247);
        v4236.ok(v4246);
      }
      function v4248(v4250) {
        return v4241.opts.useDefaults && !v4241.compositeRule && v4238[v4250].default !== undefined;
      }
      function v4249(v4251) {
        v4236.subschema({
          keyword: "properties",
          schemaProp: v4251,
          dataProp: v4251
        }, v4246);
      }
    }
  };
  properties$1.default = v4235;
  return properties$1;
}
var patternProperties = {};
var hasRequiredPatternProperties;
function requirePatternProperties() {
  if (hasRequiredPatternProperties) {
    return patternProperties;
  }
  hasRequiredPatternProperties = 1;
  Object.defineProperty(patternProperties, "__esModule", {
    value: true
  });
  const v4252 = requireCode();
  const v4253 = requireCodegen();
  const v4254 = requireUtil();
  const v4255 = requireUtil();
  const v4256 = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(v4257) {
      const {
        gen: v4258,
        schema: v4259,
        data: v4260,
        parentSchema: v4261,
        it: v4262
      } = v4257;
      const {
        opts: v4263
      } = v4262;
      const v4264 = (0, v4252.allSchemaProperties)(v4259);
      const v4265 = v4264.filter(v4266 => (0, v4254.alwaysValidSchema)(v4262, v4259[v4266]));
      if (v4264.length === 0 || v4265.length === v4264.length && (!v4262.opts.unevaluated || v4262.props === true)) {
        return;
      }
      const v4267 = v4263.strictSchema && !v4263.allowMatchingProperties && v4261.properties;
      const v4268 = v4258.name("valid");
      if (v4262.props !== true && !(v4262.props instanceof v4253.Name)) {
        v4262.props = (0, v4255.evaluatedPropsToName)(v4258, v4262.props);
      }
      const {
        props: v4269
      } = v4262;
      v4270();
      function v4270() {
        for (const v4271 of v4264) {
          if (v4267) {
            v4272(v4271);
          }
          if (v4262.allErrors) {
            v4273(v4271);
          } else {
            v4258.var(v4268, true);
            v4273(v4271);
            v4258.if(v4268);
          }
        }
      }
      function v4272(v4274) {
        for (const v4275 in v4267) {
          if (new RegExp(v4274).test(v4275)) {
            (0, v4254.checkStrictMode)(v4262, "property " + v4275 + " matches pattern " + v4274 + " (use allowMatchingProperties)");
          }
        }
      }
      function v4273(v4276) {
        v4258.forIn("key", v4260, v4277 => {
          v4258.if((0, v4253._)`${(0, v4252.usePattern)(v4257, v4276)}.test(${v4277})`, () => {
            const v4278 = v4265.includes(v4276);
            if (!v4278) {
              v4257.subschema({
                keyword: "patternProperties",
                schemaProp: v4276,
                dataProp: v4277,
                dataPropType: v4255.Type.Str
              }, v4268);
            }
            if (v4262.opts.unevaluated && v4269 !== true) {
              v4258.assign((0, v4253._)`${v4269}[${v4277}]`, true);
            } else if (!v4278 && !v4262.allErrors) {
              v4258.if((0, v4253.not)(v4268), () => v4258.break());
            }
          });
        });
      }
    }
  };
  patternProperties.default = v4256;
  return patternProperties;
}
var not = {};
var hasRequiredNot;
function requireNot() {
  if (hasRequiredNot) {
    return not;
  }
  hasRequiredNot = 1;
  Object.defineProperty(not, "__esModule", {
    value: true
  });
  const v4279 = requireUtil();
  const v4280 = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: true,
    code(v4281) {
      const {
        gen: v4282,
        schema: v4283,
        it: v4284
      } = v4281;
      if ((0, v4279.alwaysValidSchema)(v4284, v4283)) {
        v4281.fail();
        return;
      }
      const v4285 = v4282.name("valid");
      v4281.subschema({
        keyword: "not",
        compositeRule: true,
        createErrors: false,
        allErrors: false
      }, v4285);
      v4281.failResult(v4285, () => v4281.reset(), () => v4281.error());
    },
    error: {
      message: "must NOT be valid"
    }
  };
  not.default = v4280;
  return not;
}
var anyOf = {};
var hasRequiredAnyOf;
function requireAnyOf() {
  if (hasRequiredAnyOf) {
    return anyOf;
  }
  hasRequiredAnyOf = 1;
  Object.defineProperty(anyOf, "__esModule", {
    value: true
  });
  const v4286 = requireCode();
  const v4287 = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: true,
    code: v4286.validateUnion,
    error: {
      message: "must match a schema in anyOf"
    }
  };
  anyOf.default = v4287;
  return anyOf;
}
var oneOf = {};
var hasRequiredOneOf;
function requireOneOf() {
  if (hasRequiredOneOf) {
    return oneOf;
  }
  hasRequiredOneOf = 1;
  Object.defineProperty(oneOf, "__esModule", {
    value: true
  });
  const v4288 = requireCodegen();
  const v4289 = requireUtil();
  const v4290 = {
    message: "must match exactly one schema in oneOf",
    params: ({
      params: v4291
    }) => (0, v4288._)`{passingSchemas: ${v4291.passing}}`
  };
  const v4292 = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: true,
    error: v4290,
    code(v4293) {
      const {
        gen: v4294,
        schema: v4295,
        parentSchema: v4296,
        it: v4297
      } = v4293;
      if (!Array.isArray(v4295)) {
        throw new Error("ajv implementation error");
      }
      if (v4297.opts.discriminator && v4296.discriminator) {
        return;
      }
      const v4298 = v4295;
      const v4299 = v4294.let("valid", false);
      const v4300 = v4294.let("passing", null);
      const v4301 = v4294.name("_valid");
      v4293.setParams({
        passing: v4300
      });
      v4294.block(v4302);
      v4293.result(v4299, () => v4293.reset(), () => v4293.error(true));
      function v4302() {
        v4298.forEach((v4303, v4304) => {
          let v4305;
          if ((0, v4289.alwaysValidSchema)(v4297, v4303)) {
            v4294.var(v4301, true);
          } else {
            v4305 = v4293.subschema({
              keyword: "oneOf",
              schemaProp: v4304,
              compositeRule: true
            }, v4301);
          }
          if (v4304 > 0) {
            v4294.if((0, v4288._)`${v4301} && ${v4299}`).assign(v4299, false).assign(v4300, (0, v4288._)`[${v4300}, ${v4304}]`).else();
          }
          v4294.if(v4301, () => {
            v4294.assign(v4299, true);
            v4294.assign(v4300, v4304);
            if (v4305) {
              v4293.mergeEvaluated(v4305, v4288.Name);
            }
          });
        });
      }
    }
  };
  oneOf.default = v4292;
  return oneOf;
}
var allOf = {};
var hasRequiredAllOf;
function requireAllOf() {
  if (hasRequiredAllOf) {
    return allOf;
  }
  hasRequiredAllOf = 1;
  Object.defineProperty(allOf, "__esModule", {
    value: true
  });
  const v4306 = requireUtil();
  const v4307 = {
    keyword: "allOf",
    schemaType: "array",
    code(v4308) {
      const {
        gen: v4309,
        schema: v4310,
        it: v4311
      } = v4308;
      if (!Array.isArray(v4310)) {
        throw new Error("ajv implementation error");
      }
      const v4312 = v4309.name("valid");
      v4310.forEach((v4313, v4314) => {
        if ((0, v4306.alwaysValidSchema)(v4311, v4313)) {
          return;
        }
        const v4315 = v4308.subschema({
          keyword: "allOf",
          schemaProp: v4314
        }, v4312);
        v4308.ok(v4312);
        v4308.mergeEvaluated(v4315);
      });
    }
  };
  allOf.default = v4307;
  return allOf;
}
var _if = {};
var hasRequired_if;
function require_if() {
  if (hasRequired_if) {
    return _if;
  }
  hasRequired_if = 1;
  Object.defineProperty(_if, "__esModule", {
    value: true
  });
  const v4316 = requireCodegen();
  const v4317 = requireUtil();
  const v4318 = {
    message: ({
      params: v4319
    }) => (0, v4316.str)`must match "${v4319.ifClause}" schema`,
    params: ({
      params: v4320
    }) => (0, v4316._)`{failingKeyword: ${v4320.ifClause}}`
  };
  const v4321 = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: true,
    error: v4318,
    code(v4322) {
      const {
        gen: v4323,
        parentSchema: v4324,
        it: v4325
      } = v4322;
      if (v4324.then === undefined && v4324.else === undefined) {
        (0, v4317.checkStrictMode)(v4325, "\"if\" without \"then\" and \"else\" is ignored");
      }
      const v4326 = v4327(v4325, "then");
      const v4328 = v4327(v4325, "else");
      if (!v4326 && !v4328) {
        return;
      }
      const v4329 = v4323.let("valid", true);
      const v4330 = v4323.name("_valid");
      v4331();
      v4322.reset();
      if (v4326 && v4328) {
        const v4332 = v4323.let("ifClause");
        v4322.setParams({
          ifClause: v4332
        });
        v4323.if(v4330, v4333("then", v4332), v4333("else", v4332));
      } else if (v4326) {
        v4323.if(v4330, v4333("then"));
      } else {
        v4323.if((0, v4316.not)(v4330), v4333("else"));
      }
      v4322.pass(v4329, () => v4322.error(true));
      function v4331() {
        const v4334 = v4322.subschema({
          keyword: "if",
          compositeRule: true,
          createErrors: false,
          allErrors: false
        }, v4330);
        v4322.mergeEvaluated(v4334);
      }
      function v4333(v4335, v4336) {
        return () => {
          const v4337 = v4322.subschema({
            keyword: v4335
          }, v4330);
          v4323.assign(v4329, v4330);
          v4322.mergeValidEvaluated(v4337, v4329);
          if (v4336) {
            v4323.assign(v4336, (0, v4316._)`${v4335}`);
          } else {
            v4322.setParams({
              ifClause: v4335
            });
          }
        };
      }
    }
  };
  function v4327(v4338, v4339) {
    const v4340 = v4338.schema[v4339];
    return v4340 !== undefined && !(0, v4317.alwaysValidSchema)(v4338, v4340);
  }
  _if.default = v4321;
  return _if;
}
var thenElse = {};
var hasRequiredThenElse;
function requireThenElse() {
  if (hasRequiredThenElse) {
    return thenElse;
  }
  hasRequiredThenElse = 1;
  Object.defineProperty(thenElse, "__esModule", {
    value: true
  });
  const v4341 = requireUtil();
  const v4342 = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({
      keyword: v4343,
      parentSchema: v4344,
      it: v4345
    }) {
      if (v4344.if === undefined) {
        (0, v4341.checkStrictMode)(v4345, "\"" + v4343 + "\" without \"if\" is ignored");
      }
    }
  };
  thenElse.default = v4342;
  return thenElse;
}
var hasRequiredApplicator;
function requireApplicator() {
  if (hasRequiredApplicator) {
    return applicator;
  }
  hasRequiredApplicator = 1;
  Object.defineProperty(applicator, "__esModule", {
    value: true
  });
  const v4346 = requireAdditionalItems();
  const v4347 = requirePrefixItems();
  const v4348 = requireItems();
  const v4349 = requireItems2020();
  const v4350 = requireContains();
  const v4351 = requireDependencies();
  const v4352 = requirePropertyNames();
  const v4353 = requireAdditionalProperties();
  const v4354 = requireProperties();
  const v4355 = requirePatternProperties();
  const v4356 = requireNot();
  const v4357 = requireAnyOf();
  const v4358 = requireOneOf();
  const v4359 = requireAllOf();
  const v4360 = require_if();
  const v4361 = requireThenElse();
  function v4362(v4363 = false) {
    const v4364 = [v4356.default, v4357.default, v4358.default, v4359.default, v4360.default, v4361.default, v4352.default, v4353.default, v4351.default, v4354.default, v4355.default];
    if (v4363) {
      v4364.push(v4347.default, v4349.default);
    } else {
      v4364.push(v4346.default, v4348.default);
    }
    v4364.push(v4350.default);
    return v4364;
  }
  applicator.default = v4362;
  return applicator;
}
var format$1 = {};
var format = {};
var hasRequiredFormat$1;
function requireFormat$1() {
  if (hasRequiredFormat$1) {
    return format;
  }
  hasRequiredFormat$1 = 1;
  Object.defineProperty(format, "__esModule", {
    value: true
  });
  const v4365 = requireCodegen();
  const v4366 = {
    message: ({
      schemaCode: v4367
    }) => (0, v4365.str)`must match format "${v4367}"`,
    params: ({
      schemaCode: v4368
    }) => (0, v4365._)`{format: ${v4368}}`
  };
  const v4369 = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: true,
    error: v4366,
    code(v4370, v4371) {
      const {
        gen: v4372,
        data: v4373,
        $data: v4374,
        schema: v4375,
        schemaCode: v4376,
        it: v4377
      } = v4370;
      const {
        opts: v4378,
        errSchemaPath: v4379,
        schemaEnv: v4380,
        self: v4381
      } = v4377;
      if (!v4378.validateFormats) {
        return;
      }
      if (v4374) {
        v4382();
      } else {
        v4383();
      }
      function v4382() {
        const v4384 = v4372.scopeValue("formats", {
          ref: v4381.formats,
          code: v4378.code.formats
        });
        const v4385 = v4372.const("fDef", (0, v4365._)`${v4384}[${v4376}]`);
        const v4386 = v4372.let("fType");
        const v4387 = v4372.let("format");
        v4372.if((0, v4365._)`typeof ${v4385} == "object" && !(${v4385} instanceof RegExp)`, () => v4372.assign(v4386, (0, v4365._)`${v4385}.type || "string"`).assign(v4387, (0, v4365._)`${v4385}.validate`), () => v4372.assign(v4386, (0, v4365._)`"string"`).assign(v4387, v4385));
        v4370.fail$data((0, v4365.or)(v4388(), v4389()));
        function v4388() {
          if (v4378.strictSchema === false) {
            return v4365.nil;
          }
          return (0, v4365._)`${v4376} && !${v4387}`;
        }
        function v4389() {
          const v4390 = v4380.$async ? (0, v4365._)`(${v4385}.async ? await ${v4387}(${v4373}) : ${v4387}(${v4373}))` : (0, v4365._)`${v4387}(${v4373})`;
          const v4391 = (0, v4365._)`(typeof ${v4387} == "function" ? ${v4390} : ${v4387}.test(${v4373}))`;
          return (0, v4365._)`${v4387} && ${v4387} !== true && ${v4386} === ${v4371} && !${v4391}`;
        }
      }
      function v4383() {
        const v4392 = v4381.formats[v4375];
        if (!v4392) {
          v4393();
          return;
        }
        if (v4392 === true) {
          return;
        }
        const [v4394, v4395, v4396] = v4397(v4392);
        if (v4394 === v4371) {
          v4370.pass(v4398());
        }
        function v4393() {
          if (v4378.strictSchema === false) {
            v4381.logger.warn(v4399());
            return;
          }
          throw new Error(v4399());
          function v4399() {
            return "unknown format \"" + v4375 + "\" ignored in schema at path \"" + v4379 + "\"";
          }
        }
        function v4397(v4400) {
          const v4401 = v4400 instanceof RegExp ? (0, v4365.regexpCode)(v4400) : v4378.code.formats ? (0, v4365._)`${v4378.code.formats}${(0, v4365.getProperty)(v4375)}` : undefined;
          const v4402 = v4372.scopeValue("formats", {
            key: v4375,
            ref: v4400,
            code: v4401
          });
          if (typeof v4400 == "object" && !(v4400 instanceof RegExp)) {
            return [v4400.type || "string", v4400.validate, (0, v4365._)`${v4402}.validate`];
          }
          return ["string", v4400, v4402];
        }
        function v4398() {
          if (typeof v4392 == "object" && !(v4392 instanceof RegExp) && v4392.async) {
            if (!v4380.$async) {
              throw new Error("async format in sync schema");
            }
            return (0, v4365._)`await ${v4396}(${v4373})`;
          }
          if (typeof v4395 == "function") {
            return (0, v4365._)`${v4396}(${v4373})`;
          } else {
            return (0, v4365._)`${v4396}.test(${v4373})`;
          }
        }
      }
    }
  };
  format.default = v4369;
  return format;
}
var hasRequiredFormat;
function requireFormat() {
  if (hasRequiredFormat) {
    return format$1;
  }
  hasRequiredFormat = 1;
  Object.defineProperty(format$1, "__esModule", {
    value: true
  });
  const v4403 = requireFormat$1();
  const v4404 = [v4403.default];
  format$1.default = v4404;
  return format$1;
}
var metadata = {};
var hasRequiredMetadata;
function requireMetadata() {
  if (hasRequiredMetadata) {
    return metadata;
  }
  hasRequiredMetadata = 1;
  Object.defineProperty(metadata, "__esModule", {
    value: true
  });
  metadata.contentVocabulary = metadata.metadataVocabulary = undefined;
  metadata.metadataVocabulary = ["title", "description", "default", "deprecated", "readOnly", "writeOnly", "examples"];
  metadata.contentVocabulary = ["contentMediaType", "contentEncoding", "contentSchema"];
  return metadata;
}
var hasRequiredDraft7;
function requireDraft7() {
  if (hasRequiredDraft7) {
    return draft7;
  }
  hasRequiredDraft7 = 1;
  Object.defineProperty(draft7, "__esModule", {
    value: true
  });
  const v4405 = requireCore();
  const v4406 = requireValidation();
  const v4407 = requireApplicator();
  const v4408 = requireFormat();
  const v4409 = requireMetadata();
  const v4410 = [v4405.default, v4406.default, (0, v4407.default)(), v4408.default, v4409.metadataVocabulary, v4409.contentVocabulary];
  draft7.default = v4410;
  return draft7;
}
var discriminator = {};
var types = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes) {
    return types;
  }
  hasRequiredTypes = 1;
  Object.defineProperty(types, "__esModule", {
    value: true
  });
  types.DiscrError = undefined;
  var v4411;
  (function (v4412) {
    v4412.Tag = "tag";
    v4412.Mapping = "mapping";
  })(v4411 || (types.DiscrError = v4411 = {}));
  return types;
}
var hasRequiredDiscriminator;
function requireDiscriminator() {
  if (hasRequiredDiscriminator) {
    return discriminator;
  }
  hasRequiredDiscriminator = 1;
  Object.defineProperty(discriminator, "__esModule", {
    value: true
  });
  const v4413 = requireCodegen();
  const v4414 = requireTypes();
  const v4415 = requireCompile();
  const v4416 = requireRef_error();
  const v4417 = requireUtil();
  const v4418 = {
    message: ({
      params: {
        discrError: v4419,
        tagName: v4420
      }
    }) => v4419 === v4414.DiscrError.Tag ? "tag \"" + v4420 + "\" must be string" : "value of tag \"" + v4420 + "\" must be in oneOf",
    params: ({
      params: {
        discrError: v4421,
        tag: v4422,
        tagName: v4423
      }
    }) => (0, v4413._)`{error: ${v4421}, tag: ${v4423}, tagValue: ${v4422}}`
  };
  const v4424 = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: v4418,
    code(v4425) {
      const {
        gen: v4426,
        data: v4427,
        schema: v4428,
        parentSchema: v4429,
        it: v4430
      } = v4425;
      const {
        oneOf: v4431
      } = v4429;
      if (!v4430.opts.discriminator) {
        throw new Error("discriminator: requires discriminator option");
      }
      const v4432 = v4428.propertyName;
      if (typeof v4432 != "string") {
        throw new Error("discriminator: requires propertyName");
      }
      if (v4428.mapping) {
        throw new Error("discriminator: mapping is not supported");
      }
      if (!v4431) {
        throw new Error("discriminator: requires oneOf keyword");
      }
      const v4433 = v4426.let("valid", false);
      const v4434 = v4426.const("tag", (0, v4413._)`${v4427}${(0, v4413.getProperty)(v4432)}`);
      v4426.if((0, v4413._)`typeof ${v4434} == "string"`, () => v4435(), () => v4425.error(false, {
        discrError: v4414.DiscrError.Tag,
        tag: v4434,
        tagName: v4432
      }));
      v4425.ok(v4433);
      function v4435() {
        const v4436 = v4437();
        v4426.if(false);
        for (const v4438 in v4436) {
          v4426.elseIf((0, v4413._)`${v4434} === ${v4438}`);
          v4426.assign(v4433, v4439(v4436[v4438]));
        }
        v4426.else();
        v4425.error(false, {
          discrError: v4414.DiscrError.Mapping,
          tag: v4434,
          tagName: v4432
        });
        v4426.endIf();
      }
      function v4439(v4440) {
        const v4441 = v4426.name("valid");
        const v4442 = v4425.subschema({
          keyword: "oneOf",
          schemaProp: v4440
        }, v4441);
        v4425.mergeEvaluated(v4442, v4413.Name);
        return v4441;
      }
      function v4437() {
        const v4443 = {};
        const v4444 = v4445(v4429);
        let v4446 = true;
        for (let v4447 = 0; v4447 < v4431.length; v4447++) {
          let v4448 = v4431[v4447];
          if (v4448?.$ref && !(0, v4417.schemaHasRulesButRef)(v4448, v4430.self.RULES)) {
            const v4449 = v4448.$ref;
            v4448 = v4415.resolveRef.call(v4430.self, v4430.schemaEnv.root, v4430.baseId, v4449);
            if (v4448 instanceof v4415.SchemaEnv) {
              v4448 = v4448.schema;
            }
            if (v4448 === undefined) {
              throw new v4416.default(v4430.opts.uriResolver, v4430.baseId, v4449);
            }
          }
          const v4450 = v4448?.properties?.[v4432];
          if (typeof v4450 != "object") {
            throw new Error("discriminator: oneOf subschemas (or referenced schemas) must have \"properties/" + v4432 + "\"");
          }
          v4446 = v4446 && (v4444 || v4445(v4448));
          v4451(v4450, v4447);
        }
        if (!v4446) {
          throw new Error("discriminator: \"" + v4432 + "\" must be required");
        }
        return v4443;
        function v4445({
          required: v4452
        }) {
          return Array.isArray(v4452) && v4452.includes(v4432);
        }
        function v4451(v4453, v4454) {
          if (v4453.const) {
            v4455(v4453.const, v4454);
          } else if (v4453.enum) {
            for (const v4456 of v4453.enum) {
              v4455(v4456, v4454);
            }
          } else {
            throw new Error("discriminator: \"properties/" + v4432 + "\" must have \"const\" or \"enum\"");
          }
        }
        function v4455(v4457, v4458) {
          if (typeof v4457 != "string" || v4457 in v4443) {
            throw new Error("discriminator: \"" + v4432 + "\" values must be unique strings");
          }
          v4443[v4457] = v4458;
        }
      }
    }
  };
  discriminator.default = v4424;
  return discriminator;
}
const $schema = "http://json-schema.org/draft-07/schema#";
const $id = "http://json-schema.org/draft-07/schema#";
const title = "Core schema meta-schema";
const definitions = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [{
      $ref: "#/definitions/nonNegativeInteger"
    }, {
      default: 0
    }]
  },
  simpleTypes: {
    enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: true,
    default: []
  }
};
const type = ["object", "boolean"];
const properties = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: true,
  readOnly: {
    type: "boolean",
    default: false
  },
  examples: {
    type: "array",
    items: true
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [{
      $ref: "#"
    }, {
      $ref: "#/definitions/schemaArray"
    }],
    default: true
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: false
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [{
        $ref: "#"
      }, {
        $ref: "#/definitions/stringArray"
      }]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: true,
  enum: {
    type: "array",
    items: true,
    minItems: 1,
    uniqueItems: true
  },
  type: {
    anyOf: [{
      $ref: "#/definitions/simpleTypes"
    }, {
      type: "array",
      items: {
        $ref: "#/definitions/simpleTypes"
      },
      minItems: 1,
      uniqueItems: true
    }]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
};
const require$$3 = {
  $schema: $schema,
  $id: $id,
  title: title,
  definitions: definitions,
  type: type,
  properties: properties,
  default: true
};
var hasRequiredAjv;
function requireAjv() {
  if (hasRequiredAjv) {
    return ajv.exports;
  }
  hasRequiredAjv = 1;
  (function (v4459, v4460) {
    Object.defineProperty(v4460, "__esModule", {
      value: true
    });
    v4460.MissingRefError = v4460.ValidationError = v4460.CodeGen = v4460.Name = v4460.nil = v4460.stringify = v4460.str = v4460._ = v4460.KeywordCxt = v4460.Ajv = undefined;
    const v4461 = requireCore$1();
    const v4462 = requireDraft7();
    const v4463 = requireDiscriminator();
    const v4464 = require$$3;
    const v4465 = ["/properties"];
    const v4466 = "http://json-schema.org/draft-07/schema";
    class v4467 extends v4461.default {
      _addVocabularies() {
        super._addVocabularies();
        v4462.default.forEach(v4468 => this.addVocabulary(v4468));
        if (this.opts.discriminator) {
          this.addKeyword(v4463.default);
        }
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta) {
          return;
        }
        const v4469 = this.opts.$data ? this.$dataMetaSchema(v4464, v4465) : v4464;
        this.addMetaSchema(v4469, v4466, false);
        this.refs["http://json-schema.org/schema"] = v4466;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(v4466) ? v4466 : undefined);
      }
    }
    v4460.Ajv = v4467;
    v4459.exports = v4460 = v4467;
    v4459.exports.Ajv = v4467;
    Object.defineProperty(v4460, "__esModule", {
      value: true
    });
    v4460.default = v4467;
    var v4470 = requireValidate();
    Object.defineProperty(v4460, "KeywordCxt", {
      enumerable: true,
      get: function () {
        return v4470.KeywordCxt;
      }
    });
    var v4471 = requireCodegen();
    Object.defineProperty(v4460, "_", {
      enumerable: true,
      get: function () {
        return v4471._;
      }
    });
    Object.defineProperty(v4460, "str", {
      enumerable: true,
      get: function () {
        return v4471.str;
      }
    });
    Object.defineProperty(v4460, "stringify", {
      enumerable: true,
      get: function () {
        return v4471.stringify;
      }
    });
    Object.defineProperty(v4460, "nil", {
      enumerable: true,
      get: function () {
        return v4471.nil;
      }
    });
    Object.defineProperty(v4460, "Name", {
      enumerable: true,
      get: function () {
        return v4471.Name;
      }
    });
    Object.defineProperty(v4460, "CodeGen", {
      enumerable: true,
      get: function () {
        return v4471.CodeGen;
      }
    });
    var v4472 = requireValidation_error();
    Object.defineProperty(v4460, "ValidationError", {
      enumerable: true,
      get: function () {
        return v4472.default;
      }
    });
    var v4473 = requireRef_error();
    Object.defineProperty(v4460, "MissingRefError", {
      enumerable: true,
      get: function () {
        return v4473.default;
      }
    });
  })(ajv, ajv.exports);
  return ajv.exports;
}
var ajvExports = requireAjv();
const Ajv = getDefaultExportFromCjs(ajvExports);
var dist = {
  exports: {}
};
var formats = {};
var hasRequiredFormats;
function requireFormats() {
  if (hasRequiredFormats) {
    return formats;
  }
  hasRequiredFormats = 1;
  (function (v4474) {
    Object.defineProperty(v4474, "__esModule", {
      value: true
    });
    v4474.formatNames = v4474.fastFormats = v4474.fullFormats = undefined;
    function v4475(v4476, v4477) {
      return {
        validate: v4476,
        compare: v4477
      };
    }
    v4474.fullFormats = {
      date: v4475(v4478, v4479),
      time: v4475(v4480(true), v4481),
      "date-time": v4475(v4482(true), v4483),
      "iso-time": v4475(v4480(), v4484),
      "iso-date-time": v4475(v4482(), v4485),
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: v4486,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: v4487,
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      byte: v4488,
      int32: {
        type: "number",
        validate: v4489
      },
      int64: {
        type: "number",
        validate: v4490
      },
      float: {
        type: "number",
        validate: v4491
      },
      double: {
        type: "number",
        validate: v4491
      },
      password: true,
      binary: true
    };
    v4474.fastFormats = {
      ...v4474.fullFormats,
      date: v4475(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, v4479),
      time: v4475(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, v4481),
      "date-time": v4475(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, v4483),
      "iso-time": v4475(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, v4484),
      "iso-date-time": v4475(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, v4485),
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    v4474.formatNames = Object.keys(v4474.fullFormats);
    function v4492(v4493) {
      return v4493 % 4 === 0 && (v4493 % 100 !== 0 || v4493 % 400 === 0);
    }
    const v4494 = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    const v4495 = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function v4478(v4496) {
      const v4497 = v4494.exec(v4496);
      if (!v4497) {
        return false;
      }
      const v4498 = +v4497[1];
      const v4499 = +v4497[2];
      const v4500 = +v4497[3];
      return v4499 >= 1 && v4499 <= 12 && v4500 >= 1 && v4500 <= (v4499 === 2 && v4492(v4498) ? 29 : v4495[v4499]);
    }
    function v4479(v4501, v4502) {
      if (!v4501 || !v4502) {
        return undefined;
      }
      if (v4501 > v4502) {
        return 1;
      }
      if (v4501 < v4502) {
        return -1;
      }
      return 0;
    }
    const v4503 = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function v4480(v4504) {
      return function v4505(v4506) {
        const v4507 = v4503.exec(v4506);
        if (!v4507) {
          return false;
        }
        const v4508 = +v4507[1];
        const v4509 = +v4507[2];
        const v4510 = +v4507[3];
        const v4511 = v4507[4];
        const v4512 = v4507[5] === "-" ? -1 : 1;
        const v4513 = +(v4507[6] || 0);
        const v4514 = +(v4507[7] || 0);
        if (v4513 > 23 || v4514 > 59 || v4504 && !v4511) {
          return false;
        }
        if (v4508 <= 23 && v4509 <= 59 && v4510 < 60) {
          return true;
        }
        const v4515 = v4509 - v4514 * v4512;
        const v4516 = v4508 - v4513 * v4512 - (v4515 < 0 ? 1 : 0);
        return (v4516 === 23 || v4516 === -1) && (v4515 === 59 || v4515 === -1) && v4510 < 61;
      };
    }
    function v4481(v4517, v4518) {
      if (!v4517 || !v4518) {
        return undefined;
      }
      const v4519 = new Date("2020-01-01T" + v4517).valueOf();
      const v4520 = new Date("2020-01-01T" + v4518).valueOf();
      if (!v4519 || !v4520) {
        return undefined;
      }
      return v4519 - v4520;
    }
    function v4484(v4521, v4522) {
      if (!v4521 || !v4522) {
        return undefined;
      }
      const v4523 = v4503.exec(v4521);
      const v4524 = v4503.exec(v4522);
      if (!v4523 || !v4524) {
        return undefined;
      }
      v4521 = v4523[1] + v4523[2] + v4523[3];
      v4522 = v4524[1] + v4524[2] + v4524[3];
      if (v4521 > v4522) {
        return 1;
      }
      if (v4521 < v4522) {
        return -1;
      }
      return 0;
    }
    const v4525 = /t|\s/i;
    function v4482(v4526) {
      const v4527 = v4480(v4526);
      return function v4528(v4529) {
        const v4530 = v4529.split(v4525);
        return v4530.length === 2 && v4478(v4530[0]) && v4527(v4530[1]);
      };
    }
    function v4483(v4531, v4532) {
      if (!v4531 || !v4532) {
        return undefined;
      }
      const v4533 = new Date(v4531).valueOf();
      const v4534 = new Date(v4532).valueOf();
      if (!v4533 || !v4534) {
        return undefined;
      }
      return v4533 - v4534;
    }
    function v4485(v4535, v4536) {
      if (!v4535 || !v4536) {
        return undefined;
      }
      const [v4537, v4538] = v4535.split(v4525);
      const [v4539, v4540] = v4536.split(v4525);
      const v4541 = v4479(v4537, v4539);
      if (v4541 === undefined) {
        return undefined;
      }
      return v4541 || v4481(v4538, v4540);
    }
    const v4542 = /\/|:/;
    const v4543 = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function v4486(v4544) {
      return v4542.test(v4544) && v4543.test(v4544);
    }
    const v4545 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function v4488(v4546) {
      v4545.lastIndex = 0;
      return v4545.test(v4546);
    }
    const v4547 = -2147483648;
    const v4548 = 2147483647;
    function v4489(v4549) {
      return Number.isInteger(v4549) && v4549 <= v4548 && v4549 >= v4547;
    }
    function v4490(v4550) {
      return Number.isInteger(v4550);
    }
    function v4491() {
      return true;
    }
    const v4551 = /[^\\]\\Z/;
    function v4487(v4552) {
      if (v4551.test(v4552)) {
        return false;
      }
      try {
        new RegExp(v4552);
        return true;
      } catch (v4553) {
        return false;
      }
    }
  })(formats);
  return formats;
}
var limit = {};
var hasRequiredLimit;
function requireLimit() {
  if (hasRequiredLimit) {
    return limit;
  }
  hasRequiredLimit = 1;
  (function (v4554) {
    Object.defineProperty(v4554, "__esModule", {
      value: true
    });
    v4554.formatLimitDefinition = undefined;
    const v4555 = requireAjv();
    const v4556 = requireCodegen();
    const v4557 = v4556.operators;
    const v4558 = {
      formatMaximum: {
        okStr: "<=",
        ok: v4557.LTE,
        fail: v4557.GT
      },
      formatMinimum: {
        okStr: ">=",
        ok: v4557.GTE,
        fail: v4557.LT
      },
      formatExclusiveMaximum: {
        okStr: "<",
        ok: v4557.LT,
        fail: v4557.GTE
      },
      formatExclusiveMinimum: {
        okStr: ">",
        ok: v4557.GT,
        fail: v4557.LTE
      }
    };
    const v4559 = {
      message: ({
        keyword: v4560,
        schemaCode: v4561
      }) => (0, v4556.str)`should be ${v4558[v4560].okStr} ${v4561}`,
      params: ({
        keyword: v4562,
        schemaCode: v4563
      }) => (0, v4556._)`{comparison: ${v4558[v4562].okStr}, limit: ${v4563}}`
    };
    v4554.formatLimitDefinition = {
      keyword: Object.keys(v4558),
      type: "string",
      schemaType: "string",
      $data: true,
      error: v4559,
      code(v4564) {
        const {
          gen: v4565,
          data: v4566,
          schemaCode: v4567,
          keyword: v4568,
          it: v4569
        } = v4564;
        const {
          opts: v4570,
          self: v4571
        } = v4569;
        if (!v4570.validateFormats) {
          return;
        }
        const v4572 = new v4555.KeywordCxt(v4569, v4571.RULES.all.format.definition, "format");
        if (v4572.$data) {
          v4573();
        } else {
          v4574();
        }
        function v4573() {
          const v4575 = v4565.scopeValue("formats", {
            ref: v4571.formats,
            code: v4570.code.formats
          });
          const v4576 = v4565.const("fmt", (0, v4556._)`${v4575}[${v4572.schemaCode}]`);
          v4564.fail$data((0, v4556.or)((0, v4556._)`typeof ${v4576} != "object"`, (0, v4556._)`${v4576} instanceof RegExp`, (0, v4556._)`typeof ${v4576}.compare != "function"`, v4577(v4576)));
        }
        function v4574() {
          const v4578 = v4572.schema;
          const v4579 = v4571.formats[v4578];
          if (!v4579 || v4579 === true) {
            return;
          }
          if (typeof v4579 != "object" || v4579 instanceof RegExp || typeof v4579.compare != "function") {
            throw new Error("\"" + v4568 + "\": format \"" + v4578 + "\" does not define \"compare\" function");
          }
          const v4580 = v4565.scopeValue("formats", {
            key: v4578,
            ref: v4579,
            code: v4570.code.formats ? (0, v4556._)`${v4570.code.formats}${(0, v4556.getProperty)(v4578)}` : undefined
          });
          v4564.fail$data(v4577(v4580));
        }
        function v4577(v4581) {
          return (0, v4556._)`${v4581}.compare(${v4566}, ${v4567}) ${v4558[v4568].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const v4582 = v4583 => {
      v4583.addKeyword(v4554.formatLimitDefinition);
      return v4583;
    };
    v4554.default = v4582;
  })(limit);
  return limit;
}
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) {
    return dist.exports;
  }
  hasRequiredDist = 1;
  (function (v4584, v4585) {
    Object.defineProperty(v4585, "__esModule", {
      value: true
    });
    const v4586 = requireFormats();
    const v4587 = requireLimit();
    const v4588 = requireCodegen();
    const v4589 = new v4588.Name("fullFormats");
    const v4590 = new v4588.Name("fastFormats");
    const v4591 = (v4592, v4593 = {
      keywords: true
    }) => {
      if (Array.isArray(v4593)) {
        v4594(v4592, v4593, v4586.fullFormats, v4589);
        return v4592;
      }
      const [v4595, v4596] = v4593.mode === "fast" ? [v4586.fastFormats, v4590] : [v4586.fullFormats, v4589];
      const v4597 = v4593.formats || v4586.formatNames;
      v4594(v4592, v4597, v4595, v4596);
      if (v4593.keywords) {
        (0, v4587.default)(v4592);
      }
      return v4592;
    };
    v4591.get = (v4598, v4599 = "full") => {
      const v4600 = v4599 === "fast" ? v4586.fastFormats : v4586.fullFormats;
      const v4601 = v4600[v4598];
      if (!v4601) {
        throw new Error("Unknown format \"" + v4598 + "\"");
      }
      return v4601;
    };
    function v4594(v4602, v4603, v4604, v4605) {
      var v4606;
      (v4606 = v4602.opts.code).formats ?? (v4606.formats = (0, v4588._)`require("ajv-formats/dist/formats").${v4605}`);
      for (const v4607 of v4603) {
        v4602.addFormat(v4607, v4604[v4607]);
      }
    }
    v4584.exports = v4585 = v4591;
    Object.defineProperty(v4585, "__esModule", {
      value: true
    });
    v4585.default = v4591;
  })(dist, dist.exports);
  return dist.exports;
}
var distExports = requireDist();
const _addFormats = getDefaultExportFromCjs(distExports);
function createDefaultAjvInstance() {
  const v4608 = new Ajv({
    strict: false,
    validateFormats: true,
    validateSchema: false,
    allErrors: true
  });
  const v4609 = _addFormats;
  v4609(v4608);
  return v4608;
}
class AjvJsonSchemaValidator {
  constructor(v4610) {
    this._ajv = v4610 ?? createDefaultAjvInstance();
  }
  getValidator(v4611) {
    const v4612 = "$id" in v4611 && typeof v4611.$id === "string" ? this._ajv.getSchema(v4611.$id) ?? this._ajv.compile(v4611) : this._ajv.compile(v4611);
    return v4613 => {
      const v4614 = v4612(v4613);
      if (v4614) {
        return {
          valid: true,
          data: v4613,
          errorMessage: undefined
        };
      } else {
        return {
          valid: false,
          data: undefined,
          errorMessage: this._ajv.errorsText(v4612.errors)
        };
      }
    };
  }
}
class ExperimentalClientTasks {
  constructor(v4615) {
    this._client = v4615;
  }
  async *callToolStream(v4616, v4617 = CallToolResultSchema, v4618) {
    const v4619 = this._client;
    const v4620 = {
      ...v4618,
      task: v4618?.task ?? (v4619.isToolTask(v4616.name) ? {} : undefined)
    };
    const v4621 = v4619.requestStream({
      method: "tools/call",
      params: v4616
    }, v4617, v4620);
    const v4622 = v4619.getToolOutputValidator(v4616.name);
    for await (const v4623 of v4621) {
      if (v4623.type === "result" && v4622) {
        const v4624 = v4623.result;
        if (!v4624.structuredContent && !v4624.isError) {
          yield {
            type: "error",
            error: new McpError(exports.ErrorCode.InvalidRequest, "Tool " + v4616.name + " has an output schema but did not return structured content")
          };
          return;
        }
        if (v4624.structuredContent) {
          try {
            const v4625 = v4622(v4624.structuredContent);
            if (!v4625.valid) {
              yield {
                type: "error",
                error: new McpError(exports.ErrorCode.InvalidParams, "Structured content does not match the tool's output schema: " + v4625.errorMessage)
              };
              return;
            }
          } catch (v4626) {
            if (v4626 instanceof McpError) {
              yield {
                type: "error",
                error: v4626
              };
              return;
            }
            yield {
              type: "error",
              error: new McpError(exports.ErrorCode.InvalidParams, "Failed to validate structured content: " + (v4626 instanceof Error ? v4626.message : String(v4626)))
            };
            return;
          }
        }
      }
      yield v4623;
    }
  }
  async getTask(v4627, v4628) {
    return this._client.getTask({
      taskId: v4627
    }, v4628);
  }
  async getTaskResult(v4629, v4630, v4631) {
    return this._client.getTaskResult({
      taskId: v4629
    }, v4630, v4631);
  }
  async listTasks(v4632, v4633) {
    return this._client.listTasks(v4632 ? {
      cursor: v4632
    } : undefined, v4633);
  }
  async cancelTask(v4634, v4635) {
    return this._client.cancelTask({
      taskId: v4634
    }, v4635);
  }
  requestStream(v4636, v4637, v4638) {
    return this._client.requestStream(v4636, v4637, v4638);
  }
}
function assertToolsCallTaskCapability(v4639, v4640, v4641) {
  if (!v4639) {
    throw new Error(v4641 + " does not support task creation (required for " + v4640 + ")");
  }
  switch (v4640) {
    case "tools/call":
      if (!v4639.tools?.call) {
        throw new Error(v4641 + " does not support task creation for tools/call (required for " + v4640 + ")");
      }
      break;
  }
}
function assertClientRequestTaskCapability(v4642, v4643, v4644) {
  if (!v4642) {
    throw new Error(v4644 + " does not support task creation (required for " + v4643 + ")");
  }
  switch (v4643) {
    case "sampling/createMessage":
      if (!v4642.sampling?.createMessage) {
        throw new Error(v4644 + " does not support task creation for sampling/createMessage (required for " + v4643 + ")");
      }
      break;
    case "elicitation/create":
      if (!v4642.elicitation?.create) {
        throw new Error(v4644 + " does not support task creation for elicitation/create (required for " + v4643 + ")");
      }
      break;
  }
}
function applyElicitationDefaults(v4645, v4646) {
  if (!v4645 || v4646 === null || typeof v4646 !== "object") {
    return;
  }
  if (v4645.type === "object" && v4645.properties && typeof v4645.properties === "object") {
    const v4647 = v4646;
    const v4648 = v4645.properties;
    for (const v4649 of Object.keys(v4648)) {
      const v4650 = v4648[v4649];
      if (v4647[v4649] === undefined && Object.prototype.hasOwnProperty.call(v4650, "default")) {
        v4647[v4649] = v4650.default;
      }
      if (v4647[v4649] !== undefined) {
        applyElicitationDefaults(v4650, v4647[v4649]);
      }
    }
  }
  if (Array.isArray(v4645.anyOf)) {
    for (const v4651 of v4645.anyOf) {
      if (typeof v4651 !== "boolean") {
        applyElicitationDefaults(v4651, v4646);
      }
    }
  }
  if (Array.isArray(v4645.oneOf)) {
    for (const v4652 of v4645.oneOf) {
      if (typeof v4652 !== "boolean") {
        applyElicitationDefaults(v4652, v4646);
      }
    }
  }
}
function getSupportedElicitationModes(v4653) {
  if (!v4653) {
    return {
      supportsFormMode: false,
      supportsUrlMode: false
    };
  }
  const v4654 = v4653.form !== undefined;
  const v4655 = v4653.url !== undefined;
  const v4656 = v4654 || !v4654 && !v4655;
  const v4657 = v4655;
  return {
    supportsFormMode: v4656,
    supportsUrlMode: v4657
  };
}
class Client extends Protocol {
  constructor(v4658, v4659) {
    super(v4659);
    this._clientInfo = v4658;
    this._cachedToolOutputValidators = new Map();
    this._cachedKnownTaskTools = new Set();
    this._cachedRequiredTaskTools = new Set();
    this._listChangedDebounceTimers = new Map();
    this._capabilities = v4659?.capabilities ?? {};
    this._jsonSchemaValidator = v4659?.jsonSchemaValidator ?? new AjvJsonSchemaValidator();
    if (v4659?.listChanged) {
      this._pendingListChangedConfig = v4659.listChanged;
    }
  }
  _setupListChangedHandlers(v4660) {
    if (v4660.tools && this._serverCapabilities?.tools?.listChanged) {
      this._setupListChangedHandler("tools", ToolListChangedNotificationSchema, v4660.tools, async () => {
        const v4661 = await this.listTools();
        return v4661.tools;
      });
    }
    if (v4660.prompts && this._serverCapabilities?.prompts?.listChanged) {
      this._setupListChangedHandler("prompts", PromptListChangedNotificationSchema, v4660.prompts, async () => {
        const v4662 = await this.listPrompts();
        return v4662.prompts;
      });
    }
    if (v4660.resources && this._serverCapabilities?.resources?.listChanged) {
      this._setupListChangedHandler("resources", ResourceListChangedNotificationSchema, v4660.resources, async () => {
        const v4663 = await this.listResources();
        return v4663.resources;
      });
    }
  }
  get experimental() {
    if (!this._experimental) {
      this._experimental = {
        tasks: new ExperimentalClientTasks(this)
      };
    }
    return this._experimental;
  }
  registerCapabilities(v4664) {
    if (this.transport) {
      throw new Error("Cannot register capabilities after connecting to transport");
    }
    this._capabilities = mergeCapabilities(this._capabilities, v4664);
  }
  setRequestHandler(v4665, v4666) {
    const v4667 = getObjectShape(v4665);
    const v4668 = v4667?.method;
    if (!v4668) {
      throw new Error("Schema is missing a method literal");
    }
    let v4669;
    if (isZ4Schema(v4668)) {
      const v4670 = v4668;
      const v4671 = v4670._zod?.def;
      v4669 = v4671?.value ?? v4670.value;
    } else {
      const v4672 = v4668;
      const v4673 = v4672._def;
      v4669 = v4673?.value ?? v4672.value;
    }
    if (typeof v4669 !== "string") {
      throw new Error("Schema method literal must be a string");
    }
    const v4674 = v4669;
    if (v4674 === "elicitation/create") {
      const v4675 = async (v4676, v4677) => {
        const v4678 = safeParse$1(ElicitRequestSchema, v4676);
        if (!v4678.success) {
          const v4679 = v4678.error instanceof Error ? v4678.error.message : String(v4678.error);
          throw new McpError(exports.ErrorCode.InvalidParams, "Invalid elicitation request: " + v4679);
        }
        const {
          params: v4680
        } = v4678.data;
        v4680.mode = v4680.mode ?? "form";
        const {
          supportsFormMode: v4681,
          supportsUrlMode: v4682
        } = getSupportedElicitationModes(this._capabilities.elicitation);
        if (v4680.mode === "form" && !v4681) {
          throw new McpError(exports.ErrorCode.InvalidParams, "Client does not support form-mode elicitation requests");
        }
        if (v4680.mode === "url" && !v4682) {
          throw new McpError(exports.ErrorCode.InvalidParams, "Client does not support URL-mode elicitation requests");
        }
        const v4683 = await Promise.resolve(v4666(v4676, v4677));
        if (v4680.task) {
          const v4684 = safeParse$1(CreateTaskResultSchema, v4683);
          if (!v4684.success) {
            const v4685 = v4684.error instanceof Error ? v4684.error.message : String(v4684.error);
            throw new McpError(exports.ErrorCode.InvalidParams, "Invalid task creation result: " + v4685);
          }
          return v4684.data;
        }
        const v4686 = safeParse$1(ElicitResultSchema, v4683);
        if (!v4686.success) {
          const v4687 = v4686.error instanceof Error ? v4686.error.message : String(v4686.error);
          throw new McpError(exports.ErrorCode.InvalidParams, "Invalid elicitation result: " + v4687);
        }
        const v4688 = v4686.data;
        const v4689 = v4680.mode === "form" ? v4680.requestedSchema : undefined;
        if (v4680.mode === "form" && v4688.action === "accept" && v4688.content && v4689) {
          if (this._capabilities.elicitation?.form?.applyDefaults) {
            try {
              applyElicitationDefaults(v4689, v4688.content);
            } catch {}
          }
        }
        return v4688;
      };
      return super.setRequestHandler(v4665, v4675);
    }
    if (v4674 === "sampling/createMessage") {
      const v4690 = async (v4691, v4692) => {
        const v4693 = safeParse$1(CreateMessageRequestSchema, v4691);
        if (!v4693.success) {
          const v4694 = v4693.error instanceof Error ? v4693.error.message : String(v4693.error);
          throw new McpError(exports.ErrorCode.InvalidParams, "Invalid sampling request: " + v4694);
        }
        const {
          params: v4695
        } = v4693.data;
        const v4696 = await Promise.resolve(v4666(v4691, v4692));
        if (v4695.task) {
          const v4697 = safeParse$1(CreateTaskResultSchema, v4696);
          if (!v4697.success) {
            const v4698 = v4697.error instanceof Error ? v4697.error.message : String(v4697.error);
            throw new McpError(exports.ErrorCode.InvalidParams, "Invalid task creation result: " + v4698);
          }
          return v4697.data;
        }
        const v4699 = v4695.tools || v4695.toolChoice;
        const v4700 = v4699 ? CreateMessageResultWithToolsSchema : CreateMessageResultSchema;
        const v4701 = safeParse$1(v4700, v4696);
        if (!v4701.success) {
          const v4702 = v4701.error instanceof Error ? v4701.error.message : String(v4701.error);
          throw new McpError(exports.ErrorCode.InvalidParams, "Invalid sampling result: " + v4702);
        }
        return v4701.data;
      };
      return super.setRequestHandler(v4665, v4690);
    }
    return super.setRequestHandler(v4665, v4666);
  }
  assertCapability(v4703, v4704) {
    if (!this._serverCapabilities?.[v4703]) {
      throw new Error("Server does not support " + v4703 + " (required for " + v4704 + ")");
    }
  }
  async connect(v4705, v4706) {
    await super.connect(v4705);
    if (v4705.sessionId !== undefined) {
      return;
    }
    try {
      const v4707 = await this.request({
        method: "initialize",
        params: {
          protocolVersion: LATEST_PROTOCOL_VERSION,
          capabilities: this._capabilities,
          clientInfo: this._clientInfo
        }
      }, InitializeResultSchema, v4706);
      if (v4707 === undefined) {
        throw new Error("Server sent invalid initialize result: " + v4707);
      }
      if (!SUPPORTED_PROTOCOL_VERSIONS.includes(v4707.protocolVersion)) {
        throw new Error("Server's protocol version is not supported: " + v4707.protocolVersion);
      }
      this._serverCapabilities = v4707.capabilities;
      this._serverVersion = v4707.serverInfo;
      if (v4705.setProtocolVersion) {
        v4705.setProtocolVersion(v4707.protocolVersion);
      }
      this._instructions = v4707.instructions;
      await this.notification({
        method: "notifications/initialized"
      });
      if (this._pendingListChangedConfig) {
        this._setupListChangedHandlers(this._pendingListChangedConfig);
        this._pendingListChangedConfig = undefined;
      }
    } catch (v4708) {
      this.close();
      throw v4708;
    }
  }
  getServerCapabilities() {
    return this._serverCapabilities;
  }
  getServerVersion() {
    return this._serverVersion;
  }
  getInstructions() {
    return this._instructions;
  }
  assertCapabilityForMethod(v4709) {
    switch (v4709) {
      case "logging/setLevel":
        if (!this._serverCapabilities?.logging) {
          throw new Error("Server does not support logging (required for " + v4709 + ")");
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._serverCapabilities?.prompts) {
          throw new Error("Server does not support prompts (required for " + v4709 + ")");
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
      case "resources/subscribe":
      case "resources/unsubscribe":
        if (!this._serverCapabilities?.resources) {
          throw new Error("Server does not support resources (required for " + v4709 + ")");
        }
        if (v4709 === "resources/subscribe" && !this._serverCapabilities.resources.subscribe) {
          throw new Error("Server does not support resource subscriptions (required for " + v4709 + ")");
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._serverCapabilities?.tools) {
          throw new Error("Server does not support tools (required for " + v4709 + ")");
        }
        break;
      case "completion/complete":
        if (!this._serverCapabilities?.completions) {
          throw new Error("Server does not support completions (required for " + v4709 + ")");
        }
        break;
    }
  }
  assertNotificationCapability(v4710) {
    switch (v4710) {
      case "notifications/roots/list_changed":
        if (!this._capabilities.roots?.listChanged) {
          throw new Error("Client does not support roots list changed notifications (required for " + v4710 + ")");
        }
        break;
    }
  }
  assertRequestHandlerCapability(v4711) {
    if (!this._capabilities) {
      return;
    }
    switch (v4711) {
      case "sampling/createMessage":
        if (!this._capabilities.sampling) {
          throw new Error("Client does not support sampling capability (required for " + v4711 + ")");
        }
        break;
      case "elicitation/create":
        if (!this._capabilities.elicitation) {
          throw new Error("Client does not support elicitation capability (required for " + v4711 + ")");
        }
        break;
      case "roots/list":
        if (!this._capabilities.roots) {
          throw new Error("Client does not support roots capability (required for " + v4711 + ")");
        }
        break;
      case "tasks/get":
      case "tasks/list":
      case "tasks/result":
      case "tasks/cancel":
        if (!this._capabilities.tasks) {
          throw new Error("Client does not support tasks capability (required for " + v4711 + ")");
        }
        break;
    }
  }
  assertTaskCapability(v4712) {
    assertToolsCallTaskCapability(this._serverCapabilities?.tasks?.requests, v4712, "Server");
  }
  assertTaskHandlerCapability(v4713) {
    if (!this._capabilities) {
      return;
    }
    assertClientRequestTaskCapability(this._capabilities.tasks?.requests, v4713, "Client");
  }
  async ping(v4714) {
    return this.request({
      method: "ping"
    }, EmptyResultSchema, v4714);
  }
  async complete(v4715, v4716) {
    return this.request({
      method: "completion/complete",
      params: v4715
    }, CompleteResultSchema, v4716);
  }
  async setLoggingLevel(v4717, v4718) {
    return this.request({
      method: "logging/setLevel",
      params: {
        level: v4717
      }
    }, EmptyResultSchema, v4718);
  }
  async getPrompt(v4719, v4720) {
    return this.request({
      method: "prompts/get",
      params: v4719
    }, GetPromptResultSchema, v4720);
  }
  async listPrompts(v4721, v4722) {
    return this.request({
      method: "prompts/list",
      params: v4721
    }, ListPromptsResultSchema, v4722);
  }
  async listResources(v4723, v4724) {
    return this.request({
      method: "resources/list",
      params: v4723
    }, ListResourcesResultSchema, v4724);
  }
  async listResourceTemplates(v4725, v4726) {
    return this.request({
      method: "resources/templates/list",
      params: v4725
    }, ListResourceTemplatesResultSchema, v4726);
  }
  async readResource(v4727, v4728) {
    return this.request({
      method: "resources/read",
      params: v4727
    }, ReadResourceResultSchema, v4728);
  }
  async subscribeResource(v4729, v4730) {
    return this.request({
      method: "resources/subscribe",
      params: v4729
    }, EmptyResultSchema, v4730);
  }
  async unsubscribeResource(v4731, v4732) {
    return this.request({
      method: "resources/unsubscribe",
      params: v4731
    }, EmptyResultSchema, v4732);
  }
  async callTool(v4733, v4734 = CallToolResultSchema, v4735) {
    if (this.isToolTaskRequired(v4733.name)) {
      throw new McpError(exports.ErrorCode.InvalidRequest, "Tool \"" + v4733.name + "\" requires task-based execution. Use client.experimental.tasks.callToolStream() instead.");
    }
    const v4736 = await this.request({
      method: "tools/call",
      params: v4733
    }, v4734, v4735);
    const v4737 = this.getToolOutputValidator(v4733.name);
    if (v4737) {
      if (!v4736.structuredContent && !v4736.isError) {
        throw new McpError(exports.ErrorCode.InvalidRequest, "Tool " + v4733.name + " has an output schema but did not return structured content");
      }
      if (v4736.structuredContent) {
        try {
          const v4738 = v4737(v4736.structuredContent);
          if (!v4738.valid) {
            throw new McpError(exports.ErrorCode.InvalidParams, "Structured content does not match the tool's output schema: " + v4738.errorMessage);
          }
        } catch (v4739) {
          if (v4739 instanceof McpError) {
            throw v4739;
          }
          throw new McpError(exports.ErrorCode.InvalidParams, "Failed to validate structured content: " + (v4739 instanceof Error ? v4739.message : String(v4739)));
        }
      }
    }
    return v4736;
  }
  isToolTask(v4740) {
    if (!this._serverCapabilities?.tasks?.requests?.tools?.call) {
      return false;
    }
    return this._cachedKnownTaskTools.has(v4740);
  }
  isToolTaskRequired(v4741) {
    return this._cachedRequiredTaskTools.has(v4741);
  }
  cacheToolMetadata(v4742) {
    this._cachedToolOutputValidators.clear();
    this._cachedKnownTaskTools.clear();
    this._cachedRequiredTaskTools.clear();
    for (const v4743 of v4742) {
      if (v4743.outputSchema) {
        const v4744 = this._jsonSchemaValidator.getValidator(v4743.outputSchema);
        this._cachedToolOutputValidators.set(v4743.name, v4744);
      }
      const v4745 = v4743.execution?.taskSupport;
      if (v4745 === "required" || v4745 === "optional") {
        this._cachedKnownTaskTools.add(v4743.name);
      }
      if (v4745 === "required") {
        this._cachedRequiredTaskTools.add(v4743.name);
      }
    }
  }
  getToolOutputValidator(v4746) {
    return this._cachedToolOutputValidators.get(v4746);
  }
  async listTools(v4747, v4748) {
    const v4749 = await this.request({
      method: "tools/list",
      params: v4747
    }, ListToolsResultSchema, v4748);
    this.cacheToolMetadata(v4749.tools);
    return v4749;
  }
  _setupListChangedHandler(v4750, v4751, v4752, v4753) {
    const v4754 = ListChangedOptionsBaseSchema.safeParse(v4752);
    if (!v4754.success) {
      throw new Error("Invalid " + v4750 + " listChanged options: " + v4754.error.message);
    }
    if (typeof v4752.onChanged !== "function") {
      throw new Error("Invalid " + v4750 + " listChanged options: onChanged must be a function");
    }
    const {
      autoRefresh: v4755,
      debounceMs: v4756
    } = v4754.data;
    const {
      onChanged: v4757
    } = v4752;
    const v4758 = async () => {
      if (!v4755) {
        v4757(null, null);
        return;
      }
      try {
        const v4759 = await v4753();
        v4757(null, v4759);
      } catch (v4760) {
        const v4761 = v4760 instanceof Error ? v4760 : new Error(String(v4760));
        v4757(v4761, null);
      }
    };
    const v4762 = () => {
      if (v4756) {
        const v4763 = this._listChangedDebounceTimers.get(v4750);
        if (v4763) {
          clearTimeout(v4763);
        }
        const v4764 = setTimeout(v4758, v4756);
        this._listChangedDebounceTimers.set(v4750, v4764);
      } else {
        v4758();
      }
    };
    this.setNotificationHandler(v4751, v4762);
  }
  async sendRootsListChanged() {
    return this.notification({
      method: "notifications/roots/list_changed"
    });
  }
}
var crossSpawn = {
  exports: {}
};
var windows;
var hasRequiredWindows;
function requireWindows() {
  if (hasRequiredWindows) {
    return windows;
  }
  hasRequiredWindows = 1;
  windows = v4765;
  v4765.sync = v4766;
  var v4767 = require$$0;
  function v4768(v4769, v4770) {
    var v4771 = v4770.pathExt !== undefined ? v4770.pathExt : process.env.PATHEXT;
    if (!v4771) {
      return true;
    }
    v4771 = v4771.split(";");
    if (v4771.indexOf("") !== -1) {
      return true;
    }
    for (var v4772 = 0; v4772 < v4771.length; v4772++) {
      var v4773 = v4771[v4772].toLowerCase();
      if (v4773 && v4769.substr(-v4773.length).toLowerCase() === v4773) {
        return true;
      }
    }
    return false;
  }
  function v4774(v4775, v4776, v4777) {
    if (!v4775.isSymbolicLink() && !v4775.isFile()) {
      return false;
    }
    return v4768(v4776, v4777);
  }
  function v4765(v4778, v4779, v4780) {
    v4767.stat(v4778, function (v4781, v4782) {
      v4780(v4781, v4781 ? false : v4774(v4782, v4778, v4779));
    });
  }
  function v4766(v4783, v4784) {
    return v4774(v4767.statSync(v4783), v4783, v4784);
  }
  return windows;
}
var mode;
var hasRequiredMode;
function requireMode() {
  if (hasRequiredMode) {
    return mode;
  }
  hasRequiredMode = 1;
  mode = v4785;
  v4785.sync = v4786;
  var v4787 = require$$0;
  function v4785(v4788, v4789, v4790) {
    v4787.stat(v4788, function (v4791, v4792) {
      v4790(v4791, v4791 ? false : v4793(v4792, v4789));
    });
  }
  function v4786(v4794, v4795) {
    return v4793(v4787.statSync(v4794), v4795);
  }
  function v4793(v4796, v4797) {
    return v4796.isFile() && v4798(v4796, v4797);
  }
  function v4798(v4799, v4800) {
    var v4801 = v4799.mode;
    var v4802 = v4799.uid;
    var v4803 = v4799.gid;
    var v4804 = v4800.uid !== undefined ? v4800.uid : process.getuid && process.getuid();
    var v4805 = v4800.gid !== undefined ? v4800.gid : process.getgid && process.getgid();
    var v4806 = parseInt("100", 8);
    var v4807 = parseInt("010", 8);
    var v4808 = parseInt("001", 8);
    var v4809 = v4806 | v4807;
    var v4810 = v4801 & v4808 || v4801 & v4807 && v4803 === v4805 || v4801 & v4806 && v4802 === v4804 || v4801 & v4809 && v4804 === 0;
    return v4810;
  }
  return mode;
}
var isexe_1;
var hasRequiredIsexe;
function requireIsexe() {
  if (hasRequiredIsexe) {
    return isexe_1;
  }
  hasRequiredIsexe = 1;
  var v4811;
  if (process.platform === "win32" || commonjsGlobal.TESTING_WINDOWS) {
    v4811 = requireWindows();
  } else {
    v4811 = requireMode();
  }
  isexe_1 = v4812;
  v4812.sync = v4813;
  function v4812(v4814, v4815, v4816) {
    if (typeof v4815 === "function") {
      v4816 = v4815;
      v4815 = {};
    }
    if (!v4816) {
      if (typeof Promise !== "function") {
        throw new TypeError("callback not provided");
      }
      return new Promise(function (v4817, v4818) {
        v4812(v4814, v4815 || {}, function (v4819, v4820) {
          if (v4819) {
            v4818(v4819);
          } else {
            v4817(v4820);
          }
        });
      });
    }
    v4811(v4814, v4815 || {}, function (v4821, v4822) {
      if (v4821) {
        if (v4821.code === "EACCES" || v4815 && v4815.ignoreErrors) {
          v4821 = null;
          v4822 = false;
        }
      }
      v4816(v4821, v4822);
    });
  }
  function v4813(v4823, v4824) {
    try {
      return v4811.sync(v4823, v4824 || {});
    } catch (v4825) {
      if (v4824 && v4824.ignoreErrors || v4825.code === "EACCES") {
        return false;
      } else {
        throw v4825;
      }
    }
  }
  return isexe_1;
}
var which_1;
var hasRequiredWhich;
function requireWhich() {
  if (hasRequiredWhich) {
    return which_1;
  }
  hasRequiredWhich = 1;
  const v4826 = process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys";
  const v4827 = require$$0$1;
  const v4828 = v4826 ? ";" : ":";
  const v4829 = requireIsexe();
  const v4830 = v4831 => Object.assign(new Error("not found: " + v4831), {
    code: "ENOENT"
  });
  const v4832 = (v4833, v4834) => {
    const v4835 = v4834.colon || v4828;
    const v4836 = v4833.match(/\//) || v4826 && v4833.match(/\\/) ? [""] : [...(v4826 ? [process.cwd()] : []), ...(v4834.path || process.env.PATH || "").split(v4835)];
    const v4837 = v4826 ? v4834.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : "";
    const v4838 = v4826 ? v4837.split(v4835) : [""];
    if (v4826) {
      if (v4833.indexOf(".") !== -1 && v4838[0] !== "") {
        v4838.unshift("");
      }
    }
    return {
      pathEnv: v4836,
      pathExt: v4838,
      pathExtExe: v4837
    };
  };
  const v4839 = (v4840, v4841, v4842) => {
    if (typeof v4841 === "function") {
      v4842 = v4841;
      v4841 = {};
    }
    if (!v4841) {
      v4841 = {};
    }
    const {
      pathEnv: v4843,
      pathExt: v4844,
      pathExtExe: v4845
    } = v4832(v4840, v4841);
    const v4846 = [];
    const v4847 = v4848 => new Promise((v4849, v4850) => {
      if (v4848 === v4843.length) {
        if (v4841.all && v4846.length) {
          return v4849(v4846);
        } else {
          return v4850(v4830(v4840));
        }
      }
      const v4851 = v4843[v4848];
      const v4852 = /^".*"$/.test(v4851) ? v4851.slice(1, -1) : v4851;
      const v4853 = v4827.join(v4852, v4840);
      const v4854 = !v4852 && /^\.[\\\/]/.test(v4840) ? v4840.slice(0, 2) + v4853 : v4853;
      v4849(v4855(v4854, v4848, 0));
    });
    const v4855 = (v4856, v4857, v4858) => new Promise((v4859, v4860) => {
      if (v4858 === v4844.length) {
        return v4859(v4847(v4857 + 1));
      }
      const v4861 = v4844[v4858];
      v4829(v4856 + v4861, {
        pathExt: v4845
      }, (v4862, v4863) => {
        if (!v4862 && v4863) {
          if (v4841.all) {
            v4846.push(v4856 + v4861);
          } else {
            return v4859(v4856 + v4861);
          }
        }
        return v4859(v4855(v4856, v4857, v4858 + 1));
      });
    });
    if (v4842) {
      return v4847(0).then(v4864 => v4842(null, v4864), v4842);
    } else {
      return v4847(0);
    }
  };
  const v4865 = (v4866, v4867) => {
    v4867 = v4867 || {};
    const {
      pathEnv: v4868,
      pathExt: v4869,
      pathExtExe: v4870
    } = v4832(v4866, v4867);
    const v4871 = [];
    for (let v4872 = 0; v4872 < v4868.length; v4872++) {
      const v4873 = v4868[v4872];
      const v4874 = /^".*"$/.test(v4873) ? v4873.slice(1, -1) : v4873;
      const v4875 = v4827.join(v4874, v4866);
      const v4876 = !v4874 && /^\.[\\\/]/.test(v4866) ? v4866.slice(0, 2) + v4875 : v4875;
      for (let v4877 = 0; v4877 < v4869.length; v4877++) {
        const v4878 = v4876 + v4869[v4877];
        try {
          const v4879 = v4829.sync(v4878, {
            pathExt: v4870
          });
          if (v4879) {
            if (v4867.all) {
              v4871.push(v4878);
            } else {
              return v4878;
            }
          }
        } catch (v4880) {}
      }
    }
    if (v4867.all && v4871.length) {
      return v4871;
    }
    if (v4867.nothrow) {
      return null;
    }
    throw v4830(v4866);
  };
  which_1 = v4839;
  v4839.sync = v4865;
  return which_1;
}
var pathKey = {
  exports: {}
};
var hasRequiredPathKey;
function requirePathKey() {
  if (hasRequiredPathKey) {
    return pathKey.exports;
  }
  hasRequiredPathKey = 1;
  const v4881 = (v4882 = {}) => {
    const v4883 = v4882.env || process.env;
    const v4884 = v4882.platform || process.platform;
    if (v4884 !== "win32") {
      return "PATH";
    }
    return Object.keys(v4883).reverse().find(v4885 => v4885.toUpperCase() === "PATH") || "Path";
  };
  pathKey.exports = v4881;
  pathKey.exports.default = v4881;
  return pathKey.exports;
}
var resolveCommand_1;
var hasRequiredResolveCommand;
function requireResolveCommand() {
  if (hasRequiredResolveCommand) {
    return resolveCommand_1;
  }
  hasRequiredResolveCommand = 1;
  const v4886 = require$$0$1;
  const v4887 = requireWhich();
  const v4888 = requirePathKey();
  function v4889(v4890, v4891) {
    const v4892 = v4890.options.env || process.env;
    const v4893 = process.cwd();
    const v4894 = v4890.options.cwd != null;
    const v4895 = v4894 && process.chdir !== undefined && !process.chdir.disabled;
    if (v4895) {
      try {
        process.chdir(v4890.options.cwd);
      } catch (v4896) {}
    }
    let v4897;
    try {
      v4897 = v4887.sync(v4890.command, {
        path: v4892[v4888({
          env: v4892
        })],
        pathExt: v4891 ? v4886.delimiter : undefined
      });
    } catch (v4898) {} finally {
      if (v4895) {
        process.chdir(v4893);
      }
    }
    v4897 &&= v4886.resolve(v4894 ? v4890.options.cwd : "", v4897);
    return v4897;
  }
  function v4899(v4900) {
    return v4889(v4900) || v4889(v4900, true);
  }
  resolveCommand_1 = v4899;
  return resolveCommand_1;
}
var _escape = {};
var hasRequired_escape;
function require_escape() {
  if (hasRequired_escape) {
    return _escape;
  }
  hasRequired_escape = 1;
  const v4901 = /([()\][%!^"`<>&|;, *?])/g;
  function v4902(v4903) {
    v4903 = v4903.replace(v4901, "^$1");
    return v4903;
  }
  function v4904(v4905, v4906) {
    v4905 = "" + v4905;
    v4905 = v4905.replace(/(?=(\\+?)?)\1"/g, "$1$1\\\"");
    v4905 = v4905.replace(/(?=(\\+?)?)\1$/, "$1$1");
    v4905 = "\"" + v4905 + "\"";
    v4905 = v4905.replace(v4901, "^$1");
    if (v4906) {
      v4905 = v4905.replace(v4901, "^$1");
    }
    return v4905;
  }
  _escape.command = v4902;
  _escape.argument = v4904;
  return _escape;
}
var shebangRegex;
var hasRequiredShebangRegex;
function requireShebangRegex() {
  if (hasRequiredShebangRegex) {
    return shebangRegex;
  }
  hasRequiredShebangRegex = 1;
  shebangRegex = /^#!(.*)/;
  return shebangRegex;
}
var shebangCommand;
var hasRequiredShebangCommand;
function requireShebangCommand() {
  if (hasRequiredShebangCommand) {
    return shebangCommand;
  }
  hasRequiredShebangCommand = 1;
  const v4907 = requireShebangRegex();
  shebangCommand = (v4908 = "") => {
    const v4909 = v4908.match(v4907);
    if (!v4909) {
      return null;
    }
    const [v4910, v4911] = v4909[0].replace(/#! ?/, "").split(" ");
    const v4912 = v4910.split("/").pop();
    if (v4912 === "env") {
      return v4911;
    }
    if (v4911) {
      return v4912 + " " + v4911;
    } else {
      return v4912;
    }
  };
  return shebangCommand;
}
var readShebang_1;
var hasRequiredReadShebang;
function requireReadShebang() {
  if (hasRequiredReadShebang) {
    return readShebang_1;
  }
  hasRequiredReadShebang = 1;
  const v4913 = require$$0;
  const v4914 = requireShebangCommand();
  function v4915(v4916) {
    const v4917 = 150;
    const v4918 = Buffer.alloc(v4917);
    let v4919;
    try {
      v4919 = v4913.openSync(v4916, "r");
      v4913.readSync(v4919, v4918, 0, v4917, 0);
      v4913.closeSync(v4919);
    } catch (v4920) {}
    return v4914(v4918.toString());
  }
  readShebang_1 = v4915;
  return readShebang_1;
}
var parse_1;
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) {
    return parse_1;
  }
  hasRequiredParse = 1;
  const v4921 = require$$0$1;
  const v4922 = requireResolveCommand();
  const v4923 = require_escape();
  const v4924 = requireReadShebang();
  const v4925 = process.platform === "win32";
  const v4926 = /\.(?:com|exe)$/i;
  const v4927 = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i;
  function v4928(v4929) {
    v4929.file = v4922(v4929);
    const v4930 = v4929.file && v4924(v4929.file);
    if (v4930) {
      v4929.args.unshift(v4929.file);
      v4929.command = v4930;
      return v4922(v4929);
    }
    return v4929.file;
  }
  function v4931(v4932) {
    if (!v4925) {
      return v4932;
    }
    const v4933 = v4928(v4932);
    const v4934 = !v4926.test(v4933);
    if (v4932.options.forceShell || v4934) {
      const v4935 = v4927.test(v4933);
      v4932.command = v4921.normalize(v4932.command);
      v4932.command = v4923.command(v4932.command);
      v4932.args = v4932.args.map(v4936 => v4923.argument(v4936, v4935));
      const v4937 = [v4932.command].concat(v4932.args).join(" ");
      v4932.args = ["/d", "/s", "/c", "\"" + v4937 + "\""];
      v4932.command = process.env.comspec || "cmd.exe";
      v4932.options.windowsVerbatimArguments = true;
    }
    return v4932;
  }
  function v4938(v4939, v4940, v4941) {
    if (v4940 && !Array.isArray(v4940)) {
      v4941 = v4940;
      v4940 = null;
    }
    v4940 = v4940 ? v4940.slice(0) : [];
    v4941 = Object.assign({}, v4941);
    const v4942 = {
      command: v4939,
      args: v4940,
      options: v4941,
      file: undefined,
      original: {
        command: v4939,
        args: v4940
      }
    };
    if (v4941.shell) {
      return v4942;
    } else {
      return v4931(v4942);
    }
  }
  parse_1 = v4938;
  return parse_1;
}
var enoent;
var hasRequiredEnoent;
function requireEnoent() {
  if (hasRequiredEnoent) {
    return enoent;
  }
  hasRequiredEnoent = 1;
  const v4943 = process.platform === "win32";
  function v4944(v4945, v4946) {
    return Object.assign(new Error(v4946 + " " + v4945.command + " ENOENT"), {
      code: "ENOENT",
      errno: "ENOENT",
      syscall: v4946 + " " + v4945.command,
      path: v4945.command,
      spawnargs: v4945.args
    });
  }
  function v4947(v4948, v4949) {
    if (!v4943) {
      return;
    }
    const v4950 = v4948.emit;
    v4948.emit = function (v4951, v4952) {
      if (v4951 === "exit") {
        const v4953 = v4954(v4952, v4949);
        if (v4953) {
          return v4950.call(v4948, "error", v4953);
        }
      }
      return v4950.apply(v4948, arguments);
    };
  }
  function v4954(v4955, v4956) {
    if (v4943 && v4955 === 1 && !v4956.file) {
      return v4944(v4956.original, "spawn");
    }
    return null;
  }
  function v4957(v4958, v4959) {
    if (v4943 && v4958 === 1 && !v4959.file) {
      return v4944(v4959.original, "spawnSync");
    }
    return null;
  }
  enoent = {
    hookChildProcess: v4947,
    verifyENOENT: v4954,
    verifyENOENTSync: v4957,
    notFoundError: v4944
  };
  return enoent;
}
var hasRequiredCrossSpawn;
function requireCrossSpawn() {
  if (hasRequiredCrossSpawn) {
    return crossSpawn.exports;
  }
  hasRequiredCrossSpawn = 1;
  const v4960 = require$$0$2;
  const v4961 = requireParse();
  const v4962 = requireEnoent();
  function v4963(v4964, v4965, v4966) {
    const v4967 = v4961(v4964, v4965, v4966);
    const v4968 = v4960.spawn(v4967.command, v4967.args, v4967.options);
    v4962.hookChildProcess(v4968, v4967);
    return v4968;
  }
  function v4969(v4970, v4971, v4972) {
    const v4973 = v4961(v4970, v4971, v4972);
    const v4974 = v4960.spawnSync(v4973.command, v4973.args, v4973.options);
    v4974.error = v4974.error || v4962.verifyENOENTSync(v4974.status, v4973);
    return v4974;
  }
  crossSpawn.exports = v4963;
  crossSpawn.exports.spawn = v4963;
  crossSpawn.exports.sync = v4969;
  crossSpawn.exports._parse = v4961;
  crossSpawn.exports._enoent = v4962;
  return crossSpawn.exports;
}
var crossSpawnExports = requireCrossSpawn();
const spawn = getDefaultExportFromCjs(crossSpawnExports);
class ReadBuffer {
  append(v4975) {
    this._buffer = this._buffer ? Buffer.concat([this._buffer, v4975]) : v4975;
  }
  readMessage() {
    if (!this._buffer) {
      return null;
    }
    const v4976 = this._buffer.indexOf("\n");
    if (v4976 === -1) {
      return null;
    }
    const v4977 = this._buffer.toString("utf8", 0, v4976).replace(/\r$/, "");
    this._buffer = this._buffer.subarray(v4976 + 1);
    return deserializeMessage(v4977);
  }
  clear() {
    this._buffer = undefined;
  }
}
function deserializeMessage(v4978) {
  return JSONRPCMessageSchema.parse(JSON.parse(v4978));
}
function serializeMessage(v4979) {
  return JSON.stringify(v4979) + "\n";
}
const DEFAULT_INHERITED_ENV_VARS = process$2.platform === "win32" ? ["APPDATA", "HOMEDRIVE", "HOMEPATH", "LOCALAPPDATA", "PATH", "PROCESSOR_ARCHITECTURE", "SYSTEMDRIVE", "SYSTEMROOT", "TEMP", "USERNAME", "USERPROFILE", "PROGRAMFILES"] : ["HOME", "LOGNAME", "PATH", "SHELL", "TERM", "USER"];
function getDefaultEnvironment() {
  const v4980 = {};
  for (const v4981 of DEFAULT_INHERITED_ENV_VARS) {
    const v4982 = process$2.env[v4981];
    if (v4982 === undefined) {
      continue;
    }
    if (v4982.startsWith("()")) {
      continue;
    }
    v4980[v4981] = v4982;
  }
  return v4980;
}
class StdioClientTransport {
  constructor(v4983) {
    this._readBuffer = new ReadBuffer();
    this._stderrStream = null;
    this._serverParams = v4983;
    if (v4983.stderr === "pipe" || v4983.stderr === "overlapped") {
      this._stderrStream = new node_stream.PassThrough();
    }
  }
  async start() {
    if (this._process) {
      throw new Error("StdioClientTransport already started! If using Client class, note that connect() calls start() automatically.");
    }
    return new Promise((v4984, v4985) => {
      this._process = spawn(this._serverParams.command, this._serverParams.args ?? [], {
        env: {
          ...getDefaultEnvironment(),
          ...this._serverParams.env
        },
        stdio: ["pipe", "pipe", this._serverParams.stderr ?? "inherit"],
        shell: false,
        windowsHide: process$2.platform === "win32" && isElectron(),
        cwd: this._serverParams.cwd
      });
      this._process.on("error", v4986 => {
        v4985(v4986);
        this.onerror?.(v4986);
      });
      this._process.on("spawn", () => {
        v4984();
      });
      this._process.on("close", v4987 => {
        this._process = undefined;
        this.onclose?.();
      });
      this._process.stdin?.on("error", v4988 => {
        this.onerror?.(v4988);
      });
      this._process.stdout?.on("data", v4989 => {
        this._readBuffer.append(v4989);
        this.processReadBuffer();
      });
      this._process.stdout?.on("error", v4990 => {
        this.onerror?.(v4990);
      });
      if (this._stderrStream && this._process.stderr) {
        this._process.stderr.pipe(this._stderrStream);
      }
    });
  }
  get stderr() {
    if (this._stderrStream) {
      return this._stderrStream;
    }
    return this._process?.stderr ?? null;
  }
  get pid() {
    return this._process?.pid ?? null;
  }
  processReadBuffer() {
    while (true) {
      try {
        const v4991 = this._readBuffer.readMessage();
        if (v4991 === null) {
          break;
        }
        this.onmessage?.(v4991);
      } catch (v4992) {
        this.onerror?.(v4992);
      }
    }
  }
  async close() {
    if (this._process) {
      const v4993 = this._process;
      this._process = undefined;
      const v4994 = new Promise(v4995 => {
        v4993.once("close", () => {
          v4995();
        });
      });
      try {
        v4993.stdin?.end();
      } catch {}
      await Promise.race([v4994, new Promise(v4996 => setTimeout(v4996, 2000).unref())]);
      if (v4993.exitCode === null) {
        try {
          v4993.kill("SIGTERM");
        } catch {}
        await Promise.race([v4994, new Promise(v4997 => setTimeout(v4997, 2000).unref())]);
      }
      if (v4993.exitCode === null) {
        try {
          v4993.kill("SIGKILL");
        } catch {}
      }
    }
    this._readBuffer.clear();
  }
  send(v4998) {
    return new Promise(v4999 => {
      if (!this._process?.stdin) {
        throw new Error("Not connected");
      }
      const v5000 = serializeMessage(v4998);
      if (this._process.stdin.write(v5000)) {
        v4999();
      } else {
        this._process.stdin.once("drain", v4999);
      }
    });
  }
}
function isElectron() {
  return "type" in process$2;
}
function normalizeHeaders(v5001) {
  if (!v5001) {
    return {};
  }
  if (v5001 instanceof Headers) {
    return Object.fromEntries(v5001.entries());
  }
  if (Array.isArray(v5001)) {
    return Object.fromEntries(v5001);
  }
  return {
    ...v5001
  };
}
function createFetchWithInit(v5002 = fetch, v5003) {
  if (!v5003) {
    return v5002;
  }
  return async (v5004, v5005) => {
    const v5006 = {
      ...v5003,
      ...v5005,
      headers: v5005?.headers ? {
        ...normalizeHeaders(v5003.headers),
        ...normalizeHeaders(v5005.headers)
      } : v5003.headers
    };
    return v5002(v5004, v5006);
  };
}
let crypto;
crypto = globalThis.crypto?.webcrypto ?? globalThis.crypto ?? import("node:crypto").then(v5007 => v5007.webcrypto);
async function getRandomValues(v5008) {
  return (await crypto).getRandomValues(new Uint8Array(v5008));
}
async function random(v5009) {
  const v5010 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
  const v5011 = Math.pow(2, 8) - Math.pow(2, 8) % v5010.length;
  let v5012 = "";
  while (v5012.length < v5009) {
    const v5013 = await getRandomValues(v5009 - v5012.length);
    for (const v5014 of v5013) {
      if (v5014 < v5011) {
        v5012 += v5010[v5014 % v5010.length];
      }
    }
  }
  return v5012;
}
async function generateVerifier(v5015) {
  return await random(v5015);
}
async function generateChallenge(v5016) {
  const v5017 = await (await crypto).subtle.digest("SHA-256", new TextEncoder().encode(v5016));
  return btoa(String.fromCharCode(...new Uint8Array(v5017))).replace(/\//g, "_").replace(/\+/g, "-").replace(/=/g, "");
}
async function pkceChallenge(v5018) {
  if (!v5018) {
    v5018 = 43;
  }
  if (v5018 < 43 || v5018 > 128) {
    throw "Expected a length between 43 and 128. Received " + v5018 + ".";
  }
  const v5019 = await generateVerifier(v5018);
  const v5020 = await generateChallenge(v5019);
  return {
    code_verifier: v5019,
    code_challenge: v5020
  };
}
const SafeUrlSchema = url().superRefine((v5021, v5022) => {
  if (!URL.canParse(v5021)) {
    v5022.addIssue({
      code: ZodIssueCode.custom,
      message: "URL must be parseable",
      fatal: true
    });
    return NEVER;
  }
}).refine(v5023 => {
  const v5024 = new URL(v5023);
  return v5024.protocol !== "javascript:" && v5024.protocol !== "data:" && v5024.protocol !== "vbscript:";
}, {
  message: "URL cannot use javascript:, data:, or vbscript: scheme"
});
const OAuthProtectedResourceMetadataSchema = looseObject({
  resource: string().url(),
  authorization_servers: array(SafeUrlSchema).optional(),
  jwks_uri: string().url().optional(),
  scopes_supported: array(string()).optional(),
  bearer_methods_supported: array(string()).optional(),
  resource_signing_alg_values_supported: array(string()).optional(),
  resource_name: string().optional(),
  resource_documentation: string().optional(),
  resource_policy_uri: string().url().optional(),
  resource_tos_uri: string().url().optional(),
  tls_client_certificate_bound_access_tokens: boolean().optional(),
  authorization_details_types_supported: array(string()).optional(),
  dpop_signing_alg_values_supported: array(string()).optional(),
  dpop_bound_access_tokens_required: boolean().optional()
});
const OAuthMetadataSchema = looseObject({
  issuer: string(),
  authorization_endpoint: SafeUrlSchema,
  token_endpoint: SafeUrlSchema,
  registration_endpoint: SafeUrlSchema.optional(),
  scopes_supported: array(string()).optional(),
  response_types_supported: array(string()),
  response_modes_supported: array(string()).optional(),
  grant_types_supported: array(string()).optional(),
  token_endpoint_auth_methods_supported: array(string()).optional(),
  token_endpoint_auth_signing_alg_values_supported: array(string()).optional(),
  service_documentation: SafeUrlSchema.optional(),
  revocation_endpoint: SafeUrlSchema.optional(),
  revocation_endpoint_auth_methods_supported: array(string()).optional(),
  revocation_endpoint_auth_signing_alg_values_supported: array(string()).optional(),
  introspection_endpoint: string().optional(),
  introspection_endpoint_auth_methods_supported: array(string()).optional(),
  introspection_endpoint_auth_signing_alg_values_supported: array(string()).optional(),
  code_challenge_methods_supported: array(string()).optional(),
  client_id_metadata_document_supported: boolean().optional()
});
const OpenIdProviderMetadataSchema = looseObject({
  issuer: string(),
  authorization_endpoint: SafeUrlSchema,
  token_endpoint: SafeUrlSchema,
  userinfo_endpoint: SafeUrlSchema.optional(),
  jwks_uri: SafeUrlSchema,
  registration_endpoint: SafeUrlSchema.optional(),
  scopes_supported: array(string()).optional(),
  response_types_supported: array(string()),
  response_modes_supported: array(string()).optional(),
  grant_types_supported: array(string()).optional(),
  acr_values_supported: array(string()).optional(),
  subject_types_supported: array(string()),
  id_token_signing_alg_values_supported: array(string()),
  id_token_encryption_alg_values_supported: array(string()).optional(),
  id_token_encryption_enc_values_supported: array(string()).optional(),
  userinfo_signing_alg_values_supported: array(string()).optional(),
  userinfo_encryption_alg_values_supported: array(string()).optional(),
  userinfo_encryption_enc_values_supported: array(string()).optional(),
  request_object_signing_alg_values_supported: array(string()).optional(),
  request_object_encryption_alg_values_supported: array(string()).optional(),
  request_object_encryption_enc_values_supported: array(string()).optional(),
  token_endpoint_auth_methods_supported: array(string()).optional(),
  token_endpoint_auth_signing_alg_values_supported: array(string()).optional(),
  display_values_supported: array(string()).optional(),
  claim_types_supported: array(string()).optional(),
  claims_supported: array(string()).optional(),
  service_documentation: string().optional(),
  claims_locales_supported: array(string()).optional(),
  ui_locales_supported: array(string()).optional(),
  claims_parameter_supported: boolean().optional(),
  request_parameter_supported: boolean().optional(),
  request_uri_parameter_supported: boolean().optional(),
  require_request_uri_registration: boolean().optional(),
  op_policy_uri: SafeUrlSchema.optional(),
  op_tos_uri: SafeUrlSchema.optional(),
  client_id_metadata_document_supported: boolean().optional()
});
const OpenIdProviderDiscoveryMetadataSchema = object({
  ...OpenIdProviderMetadataSchema.shape,
  ...OAuthMetadataSchema.pick({
    code_challenge_methods_supported: true
  }).shape
});
const OAuthTokensSchema = object({
  access_token: string(),
  id_token: string().optional(),
  token_type: string(),
  expires_in: number().optional(),
  scope: string().optional(),
  refresh_token: string().optional()
}).strip();
const OAuthErrorResponseSchema = object({
  error: string(),
  error_description: string().optional(),
  error_uri: string().optional()
});
const OptionalSafeUrlSchema = SafeUrlSchema.optional().or(literal("").transform(() => undefined));
const OAuthClientMetadataSchema = object({
  redirect_uris: array(SafeUrlSchema),
  token_endpoint_auth_method: string().optional(),
  grant_types: array(string()).optional(),
  response_types: array(string()).optional(),
  client_name: string().optional(),
  client_uri: SafeUrlSchema.optional(),
  logo_uri: OptionalSafeUrlSchema,
  scope: string().optional(),
  contacts: array(string()).optional(),
  tos_uri: OptionalSafeUrlSchema,
  policy_uri: string().optional(),
  jwks_uri: SafeUrlSchema.optional(),
  jwks: any().optional(),
  software_id: string().optional(),
  software_version: string().optional(),
  software_statement: string().optional()
}).strip();
const OAuthClientInformationSchema = object({
  client_id: string(),
  client_secret: string().optional(),
  client_id_issued_at: number$1().optional(),
  client_secret_expires_at: number$1().optional()
}).strip();
const OAuthClientInformationFullSchema = OAuthClientMetadataSchema.merge(OAuthClientInformationSchema);
object({
  error: string(),
  error_description: string().optional()
}).strip();
object({
  token: string(),
  token_type_hint: string().optional()
}).strip();
function resourceUrlFromServerUrl(v5025) {
  const v5026 = typeof v5025 === "string" ? new URL(v5025) : new URL(v5025.href);
  v5026.hash = "";
  return v5026;
}
function checkResourceAllowed({
  requestedResource: v5027,
  configuredResource: v5028
}) {
  const v5029 = typeof v5027 === "string" ? new URL(v5027) : new URL(v5027.href);
  const v5030 = typeof v5028 === "string" ? new URL(v5028) : new URL(v5028.href);
  if (v5029.origin !== v5030.origin) {
    return false;
  }
  if (v5029.pathname.length < v5030.pathname.length) {
    return false;
  }
  const v5031 = v5029.pathname.endsWith("/") ? v5029.pathname : v5029.pathname + "/";
  const v5032 = v5030.pathname.endsWith("/") ? v5030.pathname : v5030.pathname + "/";
  return v5031.startsWith(v5032);
}
class OAuthError extends Error {
  constructor(v5033, v5034) {
    super(v5033);
    this.errorUri = v5034;
    this.name = this.constructor.name;
  }
  toResponseObject() {
    const v5035 = {
      error: this.errorCode,
      error_description: this.message
    };
    if (this.errorUri) {
      v5035.error_uri = this.errorUri;
    }
    return v5035;
  }
  get errorCode() {
    return this.constructor.errorCode;
  }
}
class InvalidRequestError extends OAuthError {}
InvalidRequestError.errorCode = "invalid_request";
class InvalidClientError extends OAuthError {}
InvalidClientError.errorCode = "invalid_client";
class InvalidGrantError extends OAuthError {}
InvalidGrantError.errorCode = "invalid_grant";
class UnauthorizedClientError extends OAuthError {}
UnauthorizedClientError.errorCode = "unauthorized_client";
class UnsupportedGrantTypeError extends OAuthError {}
UnsupportedGrantTypeError.errorCode = "unsupported_grant_type";
class InvalidScopeError extends OAuthError {}
InvalidScopeError.errorCode = "invalid_scope";
class AccessDeniedError extends OAuthError {}
AccessDeniedError.errorCode = "access_denied";
class ServerError extends OAuthError {}
ServerError.errorCode = "server_error";
class TemporarilyUnavailableError extends OAuthError {}
TemporarilyUnavailableError.errorCode = "temporarily_unavailable";
class UnsupportedResponseTypeError extends OAuthError {}
UnsupportedResponseTypeError.errorCode = "unsupported_response_type";
class UnsupportedTokenTypeError extends OAuthError {}
UnsupportedTokenTypeError.errorCode = "unsupported_token_type";
class InvalidTokenError extends OAuthError {}
InvalidTokenError.errorCode = "invalid_token";
class MethodNotAllowedError extends OAuthError {}
MethodNotAllowedError.errorCode = "method_not_allowed";
class TooManyRequestsError extends OAuthError {}
TooManyRequestsError.errorCode = "too_many_requests";
class InvalidClientMetadataError extends OAuthError {}
InvalidClientMetadataError.errorCode = "invalid_client_metadata";
class InsufficientScopeError extends OAuthError {}
InsufficientScopeError.errorCode = "insufficient_scope";
class InvalidTargetError extends OAuthError {}
InvalidTargetError.errorCode = "invalid_target";
const OAUTH_ERRORS = {
  [InvalidRequestError.errorCode]: InvalidRequestError,
  [InvalidClientError.errorCode]: InvalidClientError,
  [InvalidGrantError.errorCode]: InvalidGrantError,
  [UnauthorizedClientError.errorCode]: UnauthorizedClientError,
  [UnsupportedGrantTypeError.errorCode]: UnsupportedGrantTypeError,
  [InvalidScopeError.errorCode]: InvalidScopeError,
  [AccessDeniedError.errorCode]: AccessDeniedError,
  [ServerError.errorCode]: ServerError,
  [TemporarilyUnavailableError.errorCode]: TemporarilyUnavailableError,
  [UnsupportedResponseTypeError.errorCode]: UnsupportedResponseTypeError,
  [UnsupportedTokenTypeError.errorCode]: UnsupportedTokenTypeError,
  [InvalidTokenError.errorCode]: InvalidTokenError,
  [MethodNotAllowedError.errorCode]: MethodNotAllowedError,
  [TooManyRequestsError.errorCode]: TooManyRequestsError,
  [InvalidClientMetadataError.errorCode]: InvalidClientMetadataError,
  [InsufficientScopeError.errorCode]: InsufficientScopeError,
  [InvalidTargetError.errorCode]: InvalidTargetError
};
class UnauthorizedError extends Error {
  constructor(v5036) {
    super(v5036 ?? "Unauthorized");
  }
}
function isClientAuthMethod(v5037) {
  return ["client_secret_basic", "client_secret_post", "none"].includes(v5037);
}
const AUTHORIZATION_CODE_RESPONSE_TYPE = "code";
const AUTHORIZATION_CODE_CHALLENGE_METHOD = "S256";
function selectClientAuthMethod(v5038, v5039) {
  const v5040 = v5038.client_secret !== undefined;
  if (v5039.length === 0) {
    if (v5040) {
      return "client_secret_post";
    } else {
      return "none";
    }
  }
  if ("token_endpoint_auth_method" in v5038 && v5038.token_endpoint_auth_method && isClientAuthMethod(v5038.token_endpoint_auth_method) && v5039.includes(v5038.token_endpoint_auth_method)) {
    return v5038.token_endpoint_auth_method;
  }
  if (v5040 && v5039.includes("client_secret_basic")) {
    return "client_secret_basic";
  }
  if (v5040 && v5039.includes("client_secret_post")) {
    return "client_secret_post";
  }
  if (v5039.includes("none")) {
    return "none";
  }
  if (v5040) {
    return "client_secret_post";
  } else {
    return "none";
  }
}
function applyClientAuthentication(v5041, v5042, v5043, v5044) {
  const {
    client_id: v5045,
    client_secret: v5046
  } = v5042;
  switch (v5041) {
    case "client_secret_basic":
      applyBasicAuth(v5045, v5046, v5043);
      return;
    case "client_secret_post":
      applyPostAuth(v5045, v5046, v5044);
      return;
    case "none":
      applyPublicAuth(v5045, v5044);
      return;
    default:
      throw new Error("Unsupported client authentication method: " + v5041);
  }
}
function applyBasicAuth(v5047, v5048, v5049) {
  if (!v5048) {
    throw new Error("client_secret_basic authentication requires a client_secret");
  }
  const v5050 = btoa(v5047 + ":" + v5048);
  v5049.set("Authorization", "Basic " + v5050);
}
function applyPostAuth(v5051, v5052, v5053) {
  v5053.set("client_id", v5051);
  if (v5052) {
    v5053.set("client_secret", v5052);
  }
}
function applyPublicAuth(v5054, v5055) {
  v5055.set("client_id", v5054);
}
async function parseErrorResponse(v5056) {
  const v5057 = v5056 instanceof Response ? v5056.status : undefined;
  const v5058 = v5056 instanceof Response ? await v5056.text() : v5056;
  try {
    const v5059 = OAuthErrorResponseSchema.parse(JSON.parse(v5058));
    const {
      error: v5060,
      error_description: v5061,
      error_uri: v5062
    } = v5059;
    const v5063 = OAUTH_ERRORS[v5060] || ServerError;
    return new v5063(v5061 || "", v5062);
  } catch (v5064) {
    const v5065 = (v5057 ? "HTTP " + v5057 + ": " : "") + "Invalid OAuth error response: " + v5064 + ". Raw body: " + v5058;
    return new ServerError(v5065);
  }
}
async function auth(v5066, v5067) {
  try {
    return await authInternal(v5066, v5067);
  } catch (v5068) {
    if (v5068 instanceof InvalidClientError || v5068 instanceof UnauthorizedClientError) {
      await v5066.invalidateCredentials?.("all");
      return await authInternal(v5066, v5067);
    } else if (v5068 instanceof InvalidGrantError) {
      await v5066.invalidateCredentials?.("tokens");
      return await authInternal(v5066, v5067);
    }
    throw v5068;
  }
}
async function authInternal(v5069, {
  serverUrl: v5070,
  authorizationCode: v5071,
  scope: v5072,
  resourceMetadataUrl: v5073,
  fetchFn: v5074
}) {
  const v5075 = await v5069.discoveryState?.();
  let v5076;
  let v5077;
  let v5078;
  let v5079 = v5073;
  if (!v5079 && v5075?.resourceMetadataUrl) {
    v5079 = new URL(v5075.resourceMetadataUrl);
  }
  if (v5075?.authorizationServerUrl) {
    v5077 = v5075.authorizationServerUrl;
    v5076 = v5075.resourceMetadata;
    v5078 = v5075.authorizationServerMetadata ?? (await discoverAuthorizationServerMetadata(v5077, {
      fetchFn: v5074
    }));
    if (!v5076) {
      try {
        v5076 = await discoverOAuthProtectedResourceMetadata(v5070, {
          resourceMetadataUrl: v5079
        }, v5074);
      } catch {}
    }
    if (v5078 !== v5075.authorizationServerMetadata || v5076 !== v5075.resourceMetadata) {
      await v5069.saveDiscoveryState?.({
        authorizationServerUrl: String(v5077),
        resourceMetadataUrl: v5079?.toString(),
        resourceMetadata: v5076,
        authorizationServerMetadata: v5078
      });
    }
  } else {
    const v5080 = await discoverOAuthServerInfo(v5070, {
      resourceMetadataUrl: v5079,
      fetchFn: v5074
    });
    v5077 = v5080.authorizationServerUrl;
    v5078 = v5080.authorizationServerMetadata;
    v5076 = v5080.resourceMetadata;
    await v5069.saveDiscoveryState?.({
      authorizationServerUrl: String(v5077),
      resourceMetadataUrl: v5079?.toString(),
      resourceMetadata: v5076,
      authorizationServerMetadata: v5078
    });
  }
  const v5081 = await selectResourceURL(v5070, v5069, v5076);
  let v5082 = await Promise.resolve(v5069.clientInformation());
  if (!v5082) {
    if (v5071 !== undefined) {
      throw new Error("Existing OAuth client information is required when exchanging an authorization code");
    }
    const v5083 = v5078?.client_id_metadata_document_supported === true;
    const v5084 = v5069.clientMetadataUrl;
    if (v5084 && !isHttpsUrl(v5084)) {
      throw new InvalidClientMetadataError("clientMetadataUrl must be a valid HTTPS URL with a non-root pathname, got: " + v5084);
    }
    const v5085 = v5083 && v5084;
    if (v5085) {
      v5082 = {
        client_id: v5084
      };
      await v5069.saveClientInformation?.(v5082);
    } else {
      if (!v5069.saveClientInformation) {
        throw new Error("OAuth client information must be saveable for dynamic registration");
      }
      const v5086 = await registerClient(v5077, {
        metadata: v5078,
        clientMetadata: v5069.clientMetadata,
        fetchFn: v5074
      });
      await v5069.saveClientInformation(v5086);
      v5082 = v5086;
    }
  }
  const v5087 = !v5069.redirectUrl;
  if (v5071 !== undefined || v5087) {
    const v5088 = await fetchToken(v5069, v5077, {
      metadata: v5078,
      resource: v5081,
      authorizationCode: v5071,
      fetchFn: v5074
    });
    await v5069.saveTokens(v5088);
    return "AUTHORIZED";
  }
  const v5089 = await v5069.tokens();
  if (v5089?.refresh_token) {
    try {
      const v5090 = await refreshAuthorization(v5077, {
        metadata: v5078,
        clientInformation: v5082,
        refreshToken: v5089.refresh_token,
        resource: v5081,
        addClientAuthentication: v5069.addClientAuthentication,
        fetchFn: v5074
      });
      await v5069.saveTokens(v5090);
      return "AUTHORIZED";
    } catch (v5091) {
      if (!(v5091 instanceof OAuthError) || v5091 instanceof ServerError) ;else {
        throw v5091;
      }
    }
  }
  const v5092 = v5069.state ? await v5069.state() : undefined;
  const {
    authorizationUrl: v5093,
    codeVerifier: v5094
  } = await startAuthorization(v5077, {
    metadata: v5078,
    clientInformation: v5082,
    state: v5092,
    redirectUrl: v5069.redirectUrl,
    scope: v5072 || v5076?.scopes_supported?.join(" ") || v5069.clientMetadata.scope,
    resource: v5081
  });
  await v5069.saveCodeVerifier(v5094);
  await v5069.redirectToAuthorization(v5093);
  return "REDIRECT";
}
function isHttpsUrl(v5095) {
  if (!v5095) {
    return false;
  }
  try {
    const v5096 = new URL(v5095);
    return v5096.protocol === "https:" && v5096.pathname !== "/";
  } catch {
    return false;
  }
}
async function selectResourceURL(v5097, v5098, v5099) {
  const v5100 = resourceUrlFromServerUrl(v5097);
  if (v5098.validateResourceURL) {
    return await v5098.validateResourceURL(v5100, v5099?.resource);
  }
  if (!v5099) {
    return undefined;
  }
  if (!checkResourceAllowed({
    requestedResource: v5100,
    configuredResource: v5099.resource
  })) {
    throw new Error("Protected resource " + v5099.resource + " does not match expected " + v5100 + " (or origin)");
  }
  return new URL(v5099.resource);
}
function extractWWWAuthenticateParams(v5101) {
  const v5102 = v5101.headers.get("WWW-Authenticate");
  if (!v5102) {
    return {};
  }
  const [v5103, v5104] = v5102.split(" ");
  if (v5103.toLowerCase() !== "bearer" || !v5104) {
    return {};
  }
  const v5105 = extractFieldFromWwwAuth(v5101, "resource_metadata") || undefined;
  let v5106;
  if (v5105) {
    try {
      v5106 = new URL(v5105);
    } catch {}
  }
  const v5107 = extractFieldFromWwwAuth(v5101, "scope") || undefined;
  const v5108 = extractFieldFromWwwAuth(v5101, "error") || undefined;
  return {
    resourceMetadataUrl: v5106,
    scope: v5107,
    error: v5108
  };
}
function extractFieldFromWwwAuth(v5109, v5110) {
  const v5111 = v5109.headers.get("WWW-Authenticate");
  if (!v5111) {
    return null;
  }
  const v5112 = new RegExp(v5110 + "=(?:\"([^\"]+)\"|([^\\s,]+))");
  const v5113 = v5111.match(v5112);
  if (v5113) {
    return v5113[1] || v5113[2];
  }
  return null;
}
async function discoverOAuthProtectedResourceMetadata(v5114, v5115, v5116 = fetch) {
  const v5117 = await discoverMetadataWithFallback(v5114, "oauth-protected-resource", v5116, {
    protocolVersion: v5115?.protocolVersion,
    metadataUrl: v5115?.resourceMetadataUrl
  });
  if (!v5117 || v5117.status === 404) {
    await v5117?.body?.cancel();
    throw new Error("Resource server does not implement OAuth 2.0 Protected Resource Metadata.");
  }
  if (!v5117.ok) {
    await v5117.body?.cancel();
    throw new Error("HTTP " + v5117.status + " trying to load well-known OAuth protected resource metadata.");
  }
  return OAuthProtectedResourceMetadataSchema.parse(await v5117.json());
}
async function fetchWithCorsRetry(v5118, v5119, v5120 = fetch) {
  try {
    return await v5120(v5118, {
      headers: v5119
    });
  } catch (v5121) {
    if (v5121 instanceof TypeError) {
      if (v5119) {
        return fetchWithCorsRetry(v5118, undefined, v5120);
      } else {
        return undefined;
      }
    }
    throw v5121;
  }
}
function buildWellKnownPath(v5122, v5123 = "", v5124 = {}) {
  if (v5123.endsWith("/")) {
    v5123 = v5123.slice(0, -1);
  }
  if (v5124.prependPathname) {
    return v5123 + "/.well-known/" + v5122;
  } else {
    return "/.well-known/" + v5122 + v5123;
  }
}
async function tryMetadataDiscovery(v5125, v5126, v5127 = fetch) {
  const v5128 = {
    "MCP-Protocol-Version": v5126
  };
  return await fetchWithCorsRetry(v5125, v5128, v5127);
}
function shouldAttemptFallback(v5129, v5130) {
  return !v5129 || v5129.status >= 400 && v5129.status < 500 && v5130 !== "/";
}
async function discoverMetadataWithFallback(v5131, v5132, v5133, v5134) {
  const v5135 = new URL(v5131);
  const v5136 = v5134?.protocolVersion ?? LATEST_PROTOCOL_VERSION;
  let v5137;
  if (v5134?.metadataUrl) {
    v5137 = new URL(v5134.metadataUrl);
  } else {
    const v5138 = buildWellKnownPath(v5132, v5135.pathname);
    v5137 = new URL(v5138, v5134?.metadataServerUrl ?? v5135);
    v5137.search = v5135.search;
  }
  let v5139 = await tryMetadataDiscovery(v5137, v5136, v5133);
  if (!v5134?.metadataUrl && shouldAttemptFallback(v5139, v5135.pathname)) {
    const v5140 = new URL("/.well-known/" + v5132, v5135);
    v5139 = await tryMetadataDiscovery(v5140, v5136, v5133);
  }
  return v5139;
}
function buildDiscoveryUrls(v5141) {
  const v5142 = typeof v5141 === "string" ? new URL(v5141) : v5141;
  const v5143 = v5142.pathname !== "/";
  const v5144 = [];
  if (!v5143) {
    v5144.push({
      url: new URL("/.well-known/oauth-authorization-server", v5142.origin),
      type: "oauth"
    });
    v5144.push({
      url: new URL("/.well-known/openid-configuration", v5142.origin),
      type: "oidc"
    });
    return v5144;
  }
  let v5145 = v5142.pathname;
  if (v5145.endsWith("/")) {
    v5145 = v5145.slice(0, -1);
  }
  v5144.push({
    url: new URL("/.well-known/oauth-authorization-server" + v5145, v5142.origin),
    type: "oauth"
  });
  v5144.push({
    url: new URL("/.well-known/openid-configuration" + v5145, v5142.origin),
    type: "oidc"
  });
  v5144.push({
    url: new URL(v5145 + "/.well-known/openid-configuration", v5142.origin),
    type: "oidc"
  });
  return v5144;
}
async function discoverAuthorizationServerMetadata(v5146, {
  fetchFn = fetch,
  protocolVersion = LATEST_PROTOCOL_VERSION
} = {}) {
  const v5147 = {
    "MCP-Protocol-Version": protocolVersion,
    Accept: "application/json"
  };
  const v5148 = buildDiscoveryUrls(v5146);
  for (const {
    url: v5149,
    type: v5150
  } of v5148) {
    const v5151 = await fetchWithCorsRetry(v5149, v5147, fetchFn);
    if (!v5151) {
      continue;
    }
    if (!v5151.ok) {
      await v5151.body?.cancel();
      if (v5151.status >= 400 && v5151.status < 500) {
        continue;
      }
      throw new Error("HTTP " + v5151.status + " trying to load " + (v5150 === "oauth" ? "OAuth" : "OpenID provider") + " metadata from " + v5149);
    }
    if (v5150 === "oauth") {
      return OAuthMetadataSchema.parse(await v5151.json());
    } else {
      return OpenIdProviderDiscoveryMetadataSchema.parse(await v5151.json());
    }
  }
  return undefined;
}
async function discoverOAuthServerInfo(v5152, v5153) {
  let v5154;
  let v5155;
  try {
    v5154 = await discoverOAuthProtectedResourceMetadata(v5152, {
      resourceMetadataUrl: v5153?.resourceMetadataUrl
    }, v5153?.fetchFn);
    if (v5154.authorization_servers && v5154.authorization_servers.length > 0) {
      v5155 = v5154.authorization_servers[0];
    }
  } catch {}
  if (!v5155) {
    v5155 = String(new URL("/", v5152));
  }
  const v5156 = await discoverAuthorizationServerMetadata(v5155, {
    fetchFn: v5153?.fetchFn
  });
  return {
    authorizationServerUrl: v5155,
    authorizationServerMetadata: v5156,
    resourceMetadata: v5154
  };
}
async function startAuthorization(v5157, {
  metadata: v5158,
  clientInformation: v5159,
  redirectUrl: v5160,
  scope: v5161,
  state: v5162,
  resource: v5163
}) {
  let v5164;
  if (v5158) {
    v5164 = new URL(v5158.authorization_endpoint);
    if (!v5158.response_types_supported.includes(AUTHORIZATION_CODE_RESPONSE_TYPE)) {
      throw new Error("Incompatible auth server: does not support response type " + AUTHORIZATION_CODE_RESPONSE_TYPE);
    }
    if (v5158.code_challenge_methods_supported && !v5158.code_challenge_methods_supported.includes(AUTHORIZATION_CODE_CHALLENGE_METHOD)) {
      throw new Error("Incompatible auth server: does not support code challenge method " + AUTHORIZATION_CODE_CHALLENGE_METHOD);
    }
  } else {
    v5164 = new URL("/authorize", v5157);
  }
  const v5165 = await pkceChallenge();
  const v5166 = v5165.code_verifier;
  const v5167 = v5165.code_challenge;
  v5164.searchParams.set("response_type", AUTHORIZATION_CODE_RESPONSE_TYPE);
  v5164.searchParams.set("client_id", v5159.client_id);
  v5164.searchParams.set("code_challenge", v5167);
  v5164.searchParams.set("code_challenge_method", AUTHORIZATION_CODE_CHALLENGE_METHOD);
  v5164.searchParams.set("redirect_uri", String(v5160));
  if (v5162) {
    v5164.searchParams.set("state", v5162);
  }
  if (v5161) {
    v5164.searchParams.set("scope", v5161);
  }
  if (v5161?.includes("offline_access")) {
    v5164.searchParams.append("prompt", "consent");
  }
  if (v5163) {
    v5164.searchParams.set("resource", v5163.href);
  }
  return {
    authorizationUrl: v5164,
    codeVerifier: v5166
  };
}
function prepareAuthorizationCodeRequest(v5168, v5169, v5170) {
  return new URLSearchParams({
    grant_type: "authorization_code",
    code: v5168,
    code_verifier: v5169,
    redirect_uri: String(v5170)
  });
}
async function executeTokenRequest(v5171, {
  metadata: v5172,
  tokenRequestParams: v5173,
  clientInformation: v5174,
  addClientAuthentication: v5175,
  resource: v5176,
  fetchFn: v5177
}) {
  const v5178 = v5172?.token_endpoint ? new URL(v5172.token_endpoint) : new URL("/token", v5171);
  const v5179 = new Headers({
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json"
  });
  if (v5176) {
    v5173.set("resource", v5176.href);
  }
  if (v5175) {
    await v5175(v5179, v5173, v5178, v5172);
  } else if (v5174) {
    const v5180 = v5172?.token_endpoint_auth_methods_supported ?? [];
    const v5181 = selectClientAuthMethod(v5174, v5180);
    applyClientAuthentication(v5181, v5174, v5179, v5173);
  }
  const v5182 = await (v5177 ?? fetch)(v5178, {
    method: "POST",
    headers: v5179,
    body: v5173
  });
  if (!v5182.ok) {
    throw await parseErrorResponse(v5182);
  }
  return OAuthTokensSchema.parse(await v5182.json());
}
async function refreshAuthorization(v5183, {
  metadata: v5184,
  clientInformation: v5185,
  refreshToken: v5186,
  resource: v5187,
  addClientAuthentication: v5188,
  fetchFn: v5189
}) {
  const v5190 = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: v5186
  });
  const v5191 = await executeTokenRequest(v5183, {
    metadata: v5184,
    tokenRequestParams: v5190,
    clientInformation: v5185,
    addClientAuthentication: v5188,
    resource: v5187,
    fetchFn: v5189
  });
  return {
    refresh_token: v5186,
    ...v5191
  };
}
async function fetchToken(v5192, v5193, {
  metadata: v5194,
  resource: v5195,
  authorizationCode: v5196,
  fetchFn: v5197
} = {}) {
  const v5198 = v5192.clientMetadata.scope;
  let v5199;
  if (v5192.prepareTokenRequest) {
    v5199 = await v5192.prepareTokenRequest(v5198);
  }
  if (!v5199) {
    if (!v5196) {
      throw new Error("Either provider.prepareTokenRequest() or authorizationCode is required");
    }
    if (!v5192.redirectUrl) {
      throw new Error("redirectUrl is required for authorization_code flow");
    }
    const v5200 = await v5192.codeVerifier();
    v5199 = prepareAuthorizationCodeRequest(v5196, v5200, v5192.redirectUrl);
  }
  const v5201 = await v5192.clientInformation();
  return executeTokenRequest(v5193, {
    metadata: v5194,
    tokenRequestParams: v5199,
    clientInformation: v5201 ?? undefined,
    addClientAuthentication: v5192.addClientAuthentication,
    resource: v5195,
    fetchFn: v5197
  });
}
async function registerClient(v5202, {
  metadata: v5203,
  clientMetadata: v5204,
  fetchFn: v5205
}) {
  let v5206;
  if (v5203) {
    if (!v5203.registration_endpoint) {
      throw new Error("Incompatible auth server: does not support dynamic client registration");
    }
    v5206 = new URL(v5203.registration_endpoint);
  } else {
    v5206 = new URL("/register", v5202);
  }
  const v5207 = await (v5205 ?? fetch)(v5206, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(v5204)
  });
  if (!v5207.ok) {
    throw await parseErrorResponse(v5207);
  }
  return OAuthClientInformationFullSchema.parse(await v5207.json());
}
class ParseError extends Error {
  constructor(v5208, v5209) {
    super(v5208);
    this.name = "ParseError";
    this.type = v5209.type;
    this.field = v5209.field;
    this.value = v5209.value;
    this.line = v5209.line;
  }
}
const LF = 10;
const CR = 13;
const SPACE = 32;
function noop(v5210) {}
function createParser(v5211) {
  if (typeof v5211 == "function") {
    throw new TypeError("`config` must be an object, got a function instead. Did you mean `createParser({onEvent: fn})`?");
  }
  const {
    onEvent = noop,
    onError = noop,
    onRetry = noop,
    onComment: v5212,
    maxBufferSize: v5213
  } = v5211;
  const v5214 = [];
  let v5215 = 0;
  let v5216 = true;
  let v5217;
  let v5218 = "";
  let v5219 = 0;
  let v5220;
  let v5221 = false;
  function v5222(v5223) {
    if (v5221) {
      throw new Error("Cannot feed parser: it was terminated after exceeding the configured max buffer size. Call `reset()` to resume parsing.");
    }
    if (v5216) {
      v5216 = false;
      if (v5223.charCodeAt(0) === 239 && v5223.charCodeAt(1) === 187 && v5223.charCodeAt(2) === 191) {
        v5223 = v5223.slice(3);
      }
    }
    if (v5214.length === 0) {
      const v5224 = v5225(v5223);
      if (v5224 !== "") {
        v5214.push(v5224);
        v5215 = v5224.length;
      }
      v5226();
      return;
    }
    if (v5223.indexOf("\n") === -1 && v5223.indexOf("\r") === -1) {
      v5214.push(v5223);
      v5215 += v5223.length;
      v5226();
      return;
    }
    v5214.push(v5223);
    const v5227 = v5214.join("");
    v5214.length = 0;
    v5215 = 0;
    const v5228 = v5225(v5227);
    if (v5228 !== "") {
      v5214.push(v5228);
      v5215 = v5228.length;
    }
    v5226();
  }
  function v5226() {
    if (v5213 !== undefined) {
      if (!(v5215 + v5218.length <= v5213)) {
        v5221 = true;
        v5214.length = 0;
        v5215 = 0;
        v5217 = undefined;
        v5218 = "";
        v5219 = 0;
        v5220 = undefined;
        onError(new ParseError("Buffered data exceeded max buffer size of " + v5213 + " characters", {
          type: "max-buffer-size-exceeded"
        }));
      }
    }
  }
  function v5225(v5229) {
    let v5230 = 0;
    if (v5229.indexOf("\r") === -1) {
      let v5231 = v5229.indexOf("\n", v5230);
      while (v5231 !== -1) {
        if (v5230 === v5231) {
          if (v5219 > 0) {
            onEvent({
              id: v5217,
              event: v5220,
              data: v5218
            });
          }
          v5217 = undefined;
          v5218 = "";
          v5219 = 0;
          v5220 = undefined;
          v5230 = v5231 + 1;
          v5231 = v5229.indexOf("\n", v5230);
          continue;
        }
        const v5232 = v5229.charCodeAt(v5230);
        if (isDataPrefix(v5229, v5230, v5232)) {
          const v5233 = v5229.charCodeAt(v5230 + 5) === SPACE ? v5230 + 6 : v5230 + 5;
          const v5234 = v5229.slice(v5233, v5231);
          if (v5219 === 0 && v5229.charCodeAt(v5231 + 1) === LF) {
            onEvent({
              id: v5217,
              event: v5220,
              data: v5234
            });
            v5217 = undefined;
            v5218 = "";
            v5220 = undefined;
            v5230 = v5231 + 2;
            v5231 = v5229.indexOf("\n", v5230);
            continue;
          }
          v5218 = v5219 === 0 ? v5234 : v5218 + "\n" + v5234;
          v5219++;
        } else if (isEventPrefix(v5229, v5230, v5232)) {
          v5220 = v5229.slice(v5229.charCodeAt(v5230 + 6) === SPACE ? v5230 + 7 : v5230 + 6, v5231) || undefined;
        } else {
          v5235(v5229, v5230, v5231);
        }
        v5230 = v5231 + 1;
        v5231 = v5229.indexOf("\n", v5230);
      }
      return v5229.slice(v5230);
    }
    while (v5230 < v5229.length) {
      const v5236 = v5229.indexOf("\r", v5230);
      const v5237 = v5229.indexOf("\n", v5230);
      let v5238 = -1;
      if (v5236 !== -1 && v5237 !== -1) {
        v5238 = v5236 < v5237 ? v5236 : v5237;
      } else if (v5236 !== -1) {
        if (v5236 === v5229.length - 1) {
          v5238 = -1;
        } else {
          v5238 = v5236;
        }
      } else if (v5237 !== -1) {
        v5238 = v5237;
      }
      if (v5238 === -1) {
        break;
      }
      v5235(v5229, v5230, v5238);
      v5230 = v5238 + 1;
      if (v5229.charCodeAt(v5230 - 1) === CR && v5229.charCodeAt(v5230) === LF) {
        v5230++;
      }
    }
    return v5229.slice(v5230);
  }
  function v5235(v5239, v5240, v5241) {
    if (v5240 === v5241) {
      v5242();
      return;
    }
    const v5243 = v5239.charCodeAt(v5240);
    if (isDataPrefix(v5239, v5240, v5243)) {
      const v5244 = v5239.charCodeAt(v5240 + 5) === SPACE ? v5240 + 6 : v5240 + 5;
      const v5245 = v5239.slice(v5244, v5241);
      v5218 = v5219 === 0 ? v5245 : v5218 + "\n" + v5245;
      v5219++;
      return;
    }
    if (isEventPrefix(v5239, v5240, v5243)) {
      v5220 = v5239.slice(v5239.charCodeAt(v5240 + 6) === SPACE ? v5240 + 7 : v5240 + 6, v5241) || undefined;
      return;
    }
    if (v5243 === 105 && v5239.charCodeAt(v5240 + 1) === 100 && v5239.charCodeAt(v5240 + 2) === 58) {
      const v5246 = v5239.slice(v5239.charCodeAt(v5240 + 3) === SPACE ? v5240 + 4 : v5240 + 3, v5241);
      if (!v5246.includes("\0")) {
        v5217 = v5246;
      }
      return;
    }
    if (v5243 === 58) {
      if (v5212) {
        const v5247 = v5239.slice(v5240, v5241);
        v5212(v5247.slice(v5239.charCodeAt(v5240 + 1) === SPACE ? 2 : 1));
      }
      return;
    }
    const v5248 = v5239.slice(v5240, v5241);
    const v5249 = v5248.indexOf(":");
    if (v5249 === -1) {
      v5250(v5248, "", v5248);
      return;
    }
    const v5251 = v5248.slice(0, v5249);
    const v5252 = v5248.charCodeAt(v5249 + 1) === SPACE ? 2 : 1;
    const v5253 = v5248.slice(v5249 + v5252);
    v5250(v5251, v5253, v5248);
  }
  function v5250(v5254, v5255, v5256) {
    switch (v5254) {
      case "event":
        v5220 = v5255 || undefined;
        break;
      case "data":
        v5218 = v5219 === 0 ? v5255 : v5218 + "\n" + v5255;
        v5219++;
        break;
      case "id":
        if (!v5255.includes("\0")) {
          v5217 = v5255;
        }
        break;
      case "retry":
        if (/^\d+$/.test(v5255)) {
          onRetry(parseInt(v5255, 10));
        } else {
          onError(new ParseError("Invalid `retry` value: \"" + v5255 + "\"", {
            type: "invalid-retry",
            value: v5255,
            line: v5256
          }));
        }
        break;
      default:
        onError(new ParseError("Unknown field \"" + (v5254.length > 20 ? v5254.slice(0, 20) + "…" : v5254) + "\"", {
          type: "unknown-field",
          field: v5254,
          value: v5255,
          line: v5256
        }));
        break;
    }
  }
  function v5242() {
    if (v5219 > 0) {
      onEvent({
        id: v5217,
        event: v5220,
        data: v5218
      });
    }
    v5217 = undefined;
    v5218 = "";
    v5219 = 0;
    v5220 = undefined;
  }
  function v5257(v5258 = {}) {
    if (v5258.consume && v5214.length > 0) {
      const v5259 = v5214.join("");
      v5235(v5259, 0, v5259.length);
    }
    v5216 = true;
    v5217 = undefined;
    v5218 = "";
    v5219 = 0;
    v5220 = undefined;
    v5214.length = 0;
    v5215 = 0;
    v5221 = false;
  }
  return {
    feed: v5222,
    reset: v5257
  };
}
function isDataPrefix(v5260, v5261, v5262) {
  return v5262 === 100 && v5260.charCodeAt(v5261 + 1) === 97 && v5260.charCodeAt(v5261 + 2) === 116 && v5260.charCodeAt(v5261 + 3) === 97 && v5260.charCodeAt(v5261 + 4) === 58;
}
function isEventPrefix(v5263, v5264, v5265) {
  return v5265 === 101 && v5263.charCodeAt(v5264 + 1) === 118 && v5263.charCodeAt(v5264 + 2) === 101 && v5263.charCodeAt(v5264 + 3) === 110 && v5263.charCodeAt(v5264 + 4) === 116 && v5263.charCodeAt(v5264 + 5) === 58;
}
class EventSourceParserStream extends TransformStream {
  constructor({
    onError: v5266,
    onRetry: v5267,
    onComment: v5268,
    maxBufferSize: v5269
  } = {}) {
    let v5270;
    super({
      start(v5271) {
        v5270 = createParser({
          onEvent: v5272 => {
            v5271.enqueue(v5272);
          },
          onError(v5273) {
            if (typeof v5266 == "function") {
              v5266(v5273);
            }
            if (v5266 === "terminate" || v5273.type === "max-buffer-size-exceeded") {
              v5271.error(v5273);
            }
          },
          onRetry: v5267,
          onComment: v5268,
          maxBufferSize: v5269
        });
      },
      transform(v5274) {
        v5270.feed(v5274);
      }
    });
  }
}
const DEFAULT_STREAMABLE_HTTP_RECONNECTION_OPTIONS = {
  initialReconnectionDelay: 1000,
  maxReconnectionDelay: 30000,
  reconnectionDelayGrowFactor: 1.5,
  maxRetries: 2
};
class StreamableHTTPError extends Error {
  constructor(v5275, v5276) {
    super("Streamable HTTP error: " + v5276);
    this.code = v5275;
  }
}
class StreamableHTTPClientTransport {
  constructor(v5277, v5278) {
    this._hasCompletedAuthFlow = false;
    this._url = v5277;
    this._resourceMetadataUrl = undefined;
    this._scope = undefined;
    this._requestInit = v5278?.requestInit;
    this._authProvider = v5278?.authProvider;
    this._fetch = v5278?.fetch;
    this._fetchWithInit = createFetchWithInit(v5278?.fetch, v5278?.requestInit);
    this._sessionId = v5278?.sessionId;
    this._reconnectionOptions = v5278?.reconnectionOptions ?? DEFAULT_STREAMABLE_HTTP_RECONNECTION_OPTIONS;
  }
  async _authThenStart() {
    if (!this._authProvider) {
      throw new UnauthorizedError("No auth provider");
    }
    let v5279;
    try {
      v5279 = await auth(this._authProvider, {
        serverUrl: this._url,
        resourceMetadataUrl: this._resourceMetadataUrl,
        scope: this._scope,
        fetchFn: this._fetchWithInit
      });
    } catch (v5280) {
      this.onerror?.(v5280);
      throw v5280;
    }
    if (v5279 !== "AUTHORIZED") {
      throw new UnauthorizedError();
    }
    return await this._startOrAuthSse({
      resumptionToken: undefined
    });
  }
  async _commonHeaders() {
    const v5281 = {};
    if (this._authProvider) {
      const v5282 = await this._authProvider.tokens();
      if (v5282) {
        v5281.Authorization = "Bearer " + v5282.access_token;
      }
    }
    if (this._sessionId) {
      v5281["mcp-session-id"] = this._sessionId;
    }
    if (this._protocolVersion) {
      v5281["mcp-protocol-version"] = this._protocolVersion;
    }
    const v5283 = normalizeHeaders(this._requestInit?.headers);
    return new Headers({
      ...v5281,
      ...v5283
    });
  }
  async _startOrAuthSse(v5284) {
    const {
      resumptionToken: v5285
    } = v5284;
    try {
      const v5286 = await this._commonHeaders();
      v5286.set("Accept", "text/event-stream");
      if (v5285) {
        v5286.set("last-event-id", v5285);
      }
      const v5287 = await (this._fetch ?? fetch)(this._url, {
        method: "GET",
        headers: v5286,
        signal: this._abortController?.signal
      });
      if (!v5287.ok) {
        await v5287.body?.cancel();
        if (v5287.status === 401 && this._authProvider) {
          return await this._authThenStart();
        }
        if (v5287.status === 405) {
          return;
        }
        throw new StreamableHTTPError(v5287.status, "Failed to open SSE stream: " + v5287.statusText);
      }
      this._handleSseStream(v5287.body, v5284, true);
    } catch (v5288) {
      this.onerror?.(v5288);
      throw v5288;
    }
  }
  _getNextReconnectionDelay(v5289) {
    if (this._serverRetryMs !== undefined) {
      return this._serverRetryMs;
    }
    const v5290 = this._reconnectionOptions.initialReconnectionDelay;
    const v5291 = this._reconnectionOptions.reconnectionDelayGrowFactor;
    const v5292 = this._reconnectionOptions.maxReconnectionDelay;
    return Math.min(v5290 * Math.pow(v5291, v5289), v5292);
  }
  _scheduleReconnection(v5293, v5294 = 0) {
    const v5295 = this._reconnectionOptions.maxRetries;
    if (v5294 >= v5295) {
      this.onerror?.(new Error("Maximum reconnection attempts (" + v5295 + ") exceeded."));
      return;
    }
    const v5296 = this._getNextReconnectionDelay(v5294);
    this._reconnectionTimeout = setTimeout(() => {
      this._startOrAuthSse(v5293).catch(v5297 => {
        this.onerror?.(new Error("Failed to reconnect SSE stream: " + (v5297 instanceof Error ? v5297.message : String(v5297))));
        this._scheduleReconnection(v5293, v5294 + 1);
      });
    }, v5296);
  }
  _handleSseStream(v5298, v5299, v5300) {
    if (!v5298) {
      return;
    }
    const {
      onresumptiontoken: v5301,
      replayMessageId: v5302
    } = v5299;
    let v5303;
    let v5304 = false;
    let v5305 = false;
    const v5306 = async () => {
      try {
        const v5307 = v5298.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream({
          onRetry: v5308 => {
            this._serverRetryMs = v5308;
          }
        })).getReader();
        while (true) {
          const {
            value: v5309,
            done: v5310
          } = await v5307.read();
          if (v5310) {
            break;
          }
          if (v5309.id) {
            v5303 = v5309.id;
            v5304 = true;
            v5301?.(v5309.id);
          }
          if (!v5309.data) {
            continue;
          }
          if (!v5309.event || v5309.event === "message") {
            try {
              const v5311 = JSONRPCMessageSchema.parse(JSON.parse(v5309.data));
              if (isJSONRPCResultResponse(v5311)) {
                v5305 = true;
                if (v5302 !== undefined) {
                  v5311.id = v5302;
                }
              }
              this.onmessage?.(v5311);
            } catch (v5312) {
              this.onerror?.(v5312);
            }
          }
        }
        const v5313 = v5300 || v5304;
        const v5314 = v5313 && !v5305;
        if (v5314 && this._abortController && !this._abortController.signal.aborted) {
          this._scheduleReconnection({
            resumptionToken: v5303,
            onresumptiontoken: v5301,
            replayMessageId: v5302
          }, 0);
        }
      } catch (v5315) {
        this.onerror?.(new Error("SSE stream disconnected: " + v5315));
        const v5316 = v5300 || v5304;
        const v5317 = v5316 && !v5305;
        if (v5317 && this._abortController && !this._abortController.signal.aborted) {
          try {
            this._scheduleReconnection({
              resumptionToken: v5303,
              onresumptiontoken: v5301,
              replayMessageId: v5302
            }, 0);
          } catch (v5318) {
            this.onerror?.(new Error("Failed to reconnect: " + (v5318 instanceof Error ? v5318.message : String(v5318))));
          }
        }
      }
    };
    v5306();
  }
  async start() {
    if (this._abortController) {
      throw new Error("StreamableHTTPClientTransport already started! If using Client class, note that connect() calls start() automatically.");
    }
    this._abortController = new AbortController();
  }
  async finishAuth(v5319) {
    if (!this._authProvider) {
      throw new UnauthorizedError("No auth provider");
    }
    const v5320 = await auth(this._authProvider, {
      serverUrl: this._url,
      authorizationCode: v5319,
      resourceMetadataUrl: this._resourceMetadataUrl,
      scope: this._scope,
      fetchFn: this._fetchWithInit
    });
    if (v5320 !== "AUTHORIZED") {
      throw new UnauthorizedError("Failed to authorize");
    }
  }
  async close() {
    if (this._reconnectionTimeout) {
      clearTimeout(this._reconnectionTimeout);
      this._reconnectionTimeout = undefined;
    }
    this._abortController?.abort();
    this.onclose?.();
  }
  async send(v5321, v5322) {
    try {
      const {
        resumptionToken: v5323,
        onresumptiontoken: v5324
      } = v5322 || {};
      if (v5323) {
        this._startOrAuthSse({
          resumptionToken: v5323,
          replayMessageId: isJSONRPCRequest(v5321) ? v5321.id : undefined
        }).catch(v5325 => this.onerror?.(v5325));
        return;
      }
      const v5326 = await this._commonHeaders();
      v5326.set("content-type", "application/json");
      v5326.set("accept", "application/json, text/event-stream");
      const v5327 = {
        ...this._requestInit,
        method: "POST",
        headers: v5326,
        body: JSON.stringify(v5321),
        signal: this._abortController?.signal
      };
      const v5328 = await (this._fetch ?? fetch)(this._url, v5327);
      const v5329 = v5328.headers.get("mcp-session-id");
      if (v5329) {
        this._sessionId = v5329;
      }
      if (!v5328.ok) {
        const v5330 = await v5328.text().catch(() => null);
        if (v5328.status === 401 && this._authProvider) {
          if (this._hasCompletedAuthFlow) {
            throw new StreamableHTTPError(401, "Server returned 401 after successful authentication");
          }
          const {
            resourceMetadataUrl: v5331,
            scope: v5332
          } = extractWWWAuthenticateParams(v5328);
          this._resourceMetadataUrl = v5331;
          this._scope = v5332;
          const v5333 = await auth(this._authProvider, {
            serverUrl: this._url,
            resourceMetadataUrl: this._resourceMetadataUrl,
            scope: this._scope,
            fetchFn: this._fetchWithInit
          });
          if (v5333 !== "AUTHORIZED") {
            throw new UnauthorizedError();
          }
          this._hasCompletedAuthFlow = true;
          return this.send(v5321);
        }
        if (v5328.status === 403 && this._authProvider) {
          const {
            resourceMetadataUrl: v5334,
            scope: v5335,
            error: v5336
          } = extractWWWAuthenticateParams(v5328);
          if (v5336 === "insufficient_scope") {
            const v5337 = v5328.headers.get("WWW-Authenticate");
            if (this._lastUpscopingHeader === v5337) {
              throw new StreamableHTTPError(403, "Server returned 403 after trying upscoping");
            }
            if (v5335) {
              this._scope = v5335;
            }
            if (v5334) {
              this._resourceMetadataUrl = v5334;
            }
            this._lastUpscopingHeader = v5337 ?? undefined;
            const v5338 = await auth(this._authProvider, {
              serverUrl: this._url,
              resourceMetadataUrl: this._resourceMetadataUrl,
              scope: this._scope,
              fetchFn: this._fetch
            });
            if (v5338 !== "AUTHORIZED") {
              throw new UnauthorizedError();
            }
            return this.send(v5321);
          }
        }
        throw new StreamableHTTPError(v5328.status, "Error POSTing to endpoint: " + v5330);
      }
      this._hasCompletedAuthFlow = false;
      this._lastUpscopingHeader = undefined;
      if (v5328.status === 202) {
        await v5328.body?.cancel();
        if (isInitializedNotification(v5321)) {
          this._startOrAuthSse({
            resumptionToken: undefined
          }).catch(v5339 => this.onerror?.(v5339));
        }
        return;
      }
      const v5340 = Array.isArray(v5321) ? v5321 : [v5321];
      const v5341 = v5340.filter(v5342 => "method" in v5342 && "id" in v5342 && v5342.id !== undefined).length > 0;
      const v5343 = v5328.headers.get("content-type");
      if (v5341) {
        if (v5343?.includes("text/event-stream")) {
          this._handleSseStream(v5328.body, {
            onresumptiontoken: v5324
          }, false);
        } else if (v5343?.includes("application/json")) {
          const v5344 = await v5328.json();
          const v5345 = Array.isArray(v5344) ? v5344.map(v5346 => JSONRPCMessageSchema.parse(v5346)) : [JSONRPCMessageSchema.parse(v5344)];
          for (const v5347 of v5345) {
            this.onmessage?.(v5347);
          }
        } else {
          await v5328.body?.cancel();
          throw new StreamableHTTPError(-1, "Unexpected content type: " + v5343);
        }
      } else {
        await v5328.body?.cancel();
      }
    } catch (v5348) {
      this.onerror?.(v5348);
      throw v5348;
    }
  }
  get sessionId() {
    return this._sessionId;
  }
  async terminateSession() {
    if (!this._sessionId) {
      return;
    }
    try {
      const v5349 = await this._commonHeaders();
      const v5350 = {
        ...this._requestInit,
        method: "DELETE",
        headers: v5349,
        signal: this._abortController?.signal
      };
      const v5351 = await (this._fetch ?? fetch)(this._url, v5350);
      await v5351.body?.cancel();
      if (!v5351.ok && v5351.status !== 405) {
        throw new StreamableHTTPError(v5351.status, "Failed to terminate session: " + v5351.statusText);
      }
      this._sessionId = undefined;
    } catch (v5352) {
      this.onerror?.(v5352);
      throw v5352;
    }
  }
  setProtocolVersion(v5353) {
    this._protocolVersion = v5353;
  }
  get protocolVersion() {
    return this._protocolVersion;
  }
  async resumeStream(v5354, v5355) {
    await this._startOrAuthSse({
      resumptionToken: v5354,
      onresumptiontoken: v5355?.onresumptiontoken
    });
  }
}
class ErrorEvent extends Event {
  constructor(v5356, v5357) {
    super(v5356);
    this.code = (v5357 == null ? undefined : v5357.code) ?? undefined;
    this.message = (v5357 == null ? undefined : v5357.message) ?? undefined;
  }
  [Symbol.for("nodejs.util.inspect.custom")](v5358, v5359, v5360) {
    return v5360(inspectableError(this), v5359);
  }
  [Symbol.for("Deno.customInspect")](v5361, v5362) {
    return v5361(inspectableError(this), v5362);
  }
}
function syntaxError(v5363) {
  const v5364 = globalThis.DOMException;
  if (typeof v5364 == "function") {
    return new v5364(v5363, "SyntaxError");
  } else {
    return new SyntaxError(v5363);
  }
}
function flattenError(v5365) {
  if (v5365 instanceof Error) {
    if ("errors" in v5365 && Array.isArray(v5365.errors)) {
      return v5365.errors.map(flattenError).join(", ");
    } else if ("cause" in v5365 && v5365.cause instanceof Error) {
      return v5365 + ": " + flattenError(v5365.cause);
    } else {
      return v5365.message;
    }
  } else {
    return "" + v5365;
  }
}
function inspectableError(v5366) {
  return {
    type: v5366.type,
    message: v5366.message,
    code: v5366.code,
    defaultPrevented: v5366.defaultPrevented,
    cancelable: v5366.cancelable,
    timeStamp: v5366.timeStamp
  };
}
var __typeError = v5367 => {
  throw TypeError(v5367);
};
var __accessCheck = (v5368, v5369, v5370) => v5369.has(v5368) || __typeError("Cannot " + v5370);
var __privateGet = (v5371, v5372, v5373) => {
  __accessCheck(v5371, v5372, "read from private field");
  if (v5373) {
    return v5373.call(v5371);
  } else {
    return v5372.get(v5371);
  }
};
var __privateAdd = (v5374, v5375, v5376) => v5375.has(v5374) ? __typeError("Cannot add the same private member more than once") : v5375 instanceof WeakSet ? v5375.add(v5374) : v5375.set(v5374, v5376);
var __privateSet = (v5377, v5378, v5379, v5380) => {
  __accessCheck(v5377, v5378, "write to private field");
  v5378.set(v5377, v5379);
  return v5379;
};
var __privateMethod = (v5381, v5382, v5383) => {
  __accessCheck(v5381, v5382, "access private method");
  return v5383;
};
var _readyState;
var _url;
var _redirectUrl;
var _withCredentials;
var _fetch;
var _reconnectInterval;
var _reconnectTimer;
var _lastEventId;
var _controller;
var _parser;
var _onError;
var _onMessage;
var _onOpen;
var _EventSource_instances;
var connect_fn;
var _onFetchResponse;
var _onFetchError;
var getRequestOptions_fn;
var _onEvent;
var _onRetryChange;
var failConnection_fn;
var scheduleReconnect_fn;
var _reconnect;
class EventSource extends EventTarget {
  constructor(v5384, v5385) {
    super();
    __privateAdd(this, _EventSource_instances);
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSED = 2;
    __privateAdd(this, _readyState);
    __privateAdd(this, _url);
    __privateAdd(this, _redirectUrl);
    __privateAdd(this, _withCredentials);
    __privateAdd(this, _fetch);
    __privateAdd(this, _reconnectInterval);
    __privateAdd(this, _reconnectTimer);
    __privateAdd(this, _lastEventId, null);
    __privateAdd(this, _controller);
    __privateAdd(this, _parser);
    __privateAdd(this, _onError, null);
    __privateAdd(this, _onMessage, null);
    __privateAdd(this, _onOpen, null);
    __privateAdd(this, _onFetchResponse, async v5386 => {
      var v5387;
      __privateGet(this, _parser).reset();
      const {
        body: v5388,
        redirected: v5389,
        status: v5390,
        headers: v5391
      } = v5386;
      if (v5390 === 204) {
        __privateMethod(this, _EventSource_instances, failConnection_fn).call(this, "Server sent HTTP 204, not reconnecting", 204);
        this.close();
        return;
      }
      if (v5389) {
        __privateSet(this, _redirectUrl, new URL(v5386.url));
      } else {
        __privateSet(this, _redirectUrl, undefined);
      }
      if (v5390 !== 200) {
        __privateMethod(this, _EventSource_instances, failConnection_fn).call(this, "Non-200 status code (" + v5390 + ")", v5390);
        return;
      }
      if (!(v5391.get("content-type") || "").startsWith("text/event-stream")) {
        __privateMethod(this, _EventSource_instances, failConnection_fn).call(this, "Invalid content type, expected \"text/event-stream\"", v5390);
        return;
      }
      if (__privateGet(this, _readyState) === this.CLOSED) {
        return;
      }
      __privateSet(this, _readyState, this.OPEN);
      const v5392 = new Event("open");
      if ((v5387 = __privateGet(this, _onOpen)) != null) {
        v5387.call(this, v5392);
      }
      this.dispatchEvent(v5392);
      if (typeof v5388 != "object" || !v5388 || !("getReader" in v5388)) {
        __privateMethod(this, _EventSource_instances, failConnection_fn).call(this, "Invalid response body, expected a web ReadableStream", v5390);
        this.close();
        return;
      }
      const v5393 = new TextDecoder();
      const v5394 = v5388.getReader();
      let v5395 = true;
      do {
        const {
          done: v5396,
          value: v5397
        } = await v5394.read();
        if (v5397) {
          __privateGet(this, _parser).feed(v5393.decode(v5397, {
            stream: !v5396
          }));
        }
        if (v5396) {
          v5395 = false;
          __privateGet(this, _parser).reset();
          __privateMethod(this, _EventSource_instances, scheduleReconnect_fn).call(this);
        }
      } while (v5395);
    });
    __privateAdd(this, _onFetchError, v5398 => {
      __privateSet(this, _controller, undefined);
      if (v5398.name !== "AbortError" && v5398.type !== "aborted") {
        __privateMethod(this, _EventSource_instances, scheduleReconnect_fn).call(this, flattenError(v5398));
      }
    });
    __privateAdd(this, _onEvent, v5399 => {
      if (typeof v5399.id == "string") {
        __privateSet(this, _lastEventId, v5399.id);
      }
      const v5400 = new MessageEvent(v5399.event || "message", {
        data: v5399.data,
        origin: __privateGet(this, _redirectUrl) ? __privateGet(this, _redirectUrl).origin : __privateGet(this, _url).origin,
        lastEventId: v5399.id || ""
      });
      if (__privateGet(this, _onMessage) && (!v5399.event || v5399.event === "message")) {
        __privateGet(this, _onMessage).call(this, v5400);
      }
      this.dispatchEvent(v5400);
    });
    __privateAdd(this, _onRetryChange, v5401 => {
      __privateSet(this, _reconnectInterval, v5401);
    });
    __privateAdd(this, _reconnect, () => {
      __privateSet(this, _reconnectTimer, undefined);
      if (__privateGet(this, _readyState) === this.CONNECTING) {
        __privateMethod(this, _EventSource_instances, connect_fn).call(this);
      }
    });
    try {
      if (v5384 instanceof URL) {
        __privateSet(this, _url, v5384);
      } else if (typeof v5384 == "string") {
        __privateSet(this, _url, new URL(v5384, getBaseURL()));
      } else {
        throw new Error("Invalid URL");
      }
    } catch {
      throw syntaxError("An invalid or illegal string was specified");
    }
    __privateSet(this, _parser, createParser({
      onEvent: __privateGet(this, _onEvent),
      onRetry: __privateGet(this, _onRetryChange)
    }));
    __privateSet(this, _readyState, this.CONNECTING);
    __privateSet(this, _reconnectInterval, 3000);
    __privateSet(this, _fetch, (v5385 == null ? undefined : v5385.fetch) ?? globalThis.fetch);
    __privateSet(this, _withCredentials, (v5385 == null ? undefined : v5385.withCredentials) ?? false);
    __privateMethod(this, _EventSource_instances, connect_fn).call(this);
  }
  get readyState() {
    return __privateGet(this, _readyState);
  }
  get url() {
    return __privateGet(this, _url).href;
  }
  get withCredentials() {
    return __privateGet(this, _withCredentials);
  }
  get onerror() {
    return __privateGet(this, _onError);
  }
  set onerror(v5402) {
    __privateSet(this, _onError, v5402);
  }
  get onmessage() {
    return __privateGet(this, _onMessage);
  }
  set onmessage(v5403) {
    __privateSet(this, _onMessage, v5403);
  }
  get onopen() {
    return __privateGet(this, _onOpen);
  }
  set onopen(v5404) {
    __privateSet(this, _onOpen, v5404);
  }
  addEventListener(v5405, v5406, v5407) {
    const v5408 = v5406;
    super.addEventListener(v5405, v5408, v5407);
  }
  removeEventListener(v5409, v5410, v5411) {
    const v5412 = v5410;
    super.removeEventListener(v5409, v5412, v5411);
  }
  close() {
    if (__privateGet(this, _reconnectTimer)) {
      clearTimeout(__privateGet(this, _reconnectTimer));
    }
    if (__privateGet(this, _readyState) !== this.CLOSED) {
      if (__privateGet(this, _controller)) {
        __privateGet(this, _controller).abort();
      }
      __privateSet(this, _readyState, this.CLOSED);
      __privateSet(this, _controller, undefined);
    }
  }
}
_readyState = new WeakMap();
_url = new WeakMap();
_redirectUrl = new WeakMap();
_withCredentials = new WeakMap();
_fetch = new WeakMap();
_reconnectInterval = new WeakMap();
_reconnectTimer = new WeakMap();
_lastEventId = new WeakMap();
_controller = new WeakMap();
_parser = new WeakMap();
_onError = new WeakMap();
_onMessage = new WeakMap();
_onOpen = new WeakMap();
_EventSource_instances = new WeakSet();
connect_fn = function () {
  __privateSet(this, _readyState, this.CONNECTING);
  __privateSet(this, _controller, new AbortController());
  __privateGet(this, _fetch)(__privateGet(this, _url), __privateMethod(this, _EventSource_instances, getRequestOptions_fn).call(this)).then(__privateGet(this, _onFetchResponse)).catch(__privateGet(this, _onFetchError));
};
_onFetchResponse = new WeakMap();
_onFetchError = new WeakMap();
getRequestOptions_fn = function () {
  var v5413;
  const v5414 = {
    mode: "cors",
    redirect: "follow",
    headers: {
      Accept: "text/event-stream",
      ...(__privateGet(this, _lastEventId) ? {
        "Last-Event-ID": __privateGet(this, _lastEventId)
      } : undefined)
    },
    cache: "no-store",
    signal: (v5413 = __privateGet(this, _controller)) == null ? undefined : v5413.signal
  };
  if ("window" in globalThis) {
    v5414.credentials = this.withCredentials ? "include" : "same-origin";
  }
  return v5414;
};
_onEvent = new WeakMap();
_onRetryChange = new WeakMap();
failConnection_fn = function (v5415, v5416) {
  var v5417;
  if (__privateGet(this, _readyState) !== this.CLOSED) {
    __privateSet(this, _readyState, this.CLOSED);
  }
  const v5418 = new ErrorEvent("error", {
    code: v5416,
    message: v5415
  });
  if ((v5417 = __privateGet(this, _onError)) != null) {
    v5417.call(this, v5418);
  }
  this.dispatchEvent(v5418);
};
scheduleReconnect_fn = function (v5419, v5420) {
  var v5421;
  if (__privateGet(this, _readyState) === this.CLOSED) {
    return;
  }
  __privateSet(this, _readyState, this.CONNECTING);
  const v5422 = new ErrorEvent("error", {
    code: v5420,
    message: v5419
  });
  if ((v5421 = __privateGet(this, _onError)) != null) {
    v5421.call(this, v5422);
  }
  this.dispatchEvent(v5422);
  __privateSet(this, _reconnectTimer, setTimeout(__privateGet(this, _reconnect), __privateGet(this, _reconnectInterval)));
};
_reconnect = new WeakMap();
EventSource.CONNECTING = 0;
EventSource.OPEN = 1;
EventSource.CLOSED = 2;
function getBaseURL() {
  const v5423 = "document" in globalThis ? globalThis.document : undefined;
  if (v5423 && typeof v5423 == "object" && "baseURI" in v5423 && typeof v5423.baseURI == "string") {
    return v5423.baseURI;
  } else {
    return undefined;
  }
}
class SseError extends Error {
  constructor(v5424, v5425, v5426) {
    super("SSE error: " + v5425);
    this.code = v5424;
    this.event = v5426;
  }
}
class SSEClientTransport {
  constructor(v5427, v5428) {
    this._url = v5427;
    this._resourceMetadataUrl = undefined;
    this._scope = undefined;
    this._eventSourceInit = v5428?.eventSourceInit;
    this._requestInit = v5428?.requestInit;
    this._authProvider = v5428?.authProvider;
    this._fetch = v5428?.fetch;
    this._fetchWithInit = createFetchWithInit(v5428?.fetch, v5428?.requestInit);
  }
  async _authThenStart() {
    if (!this._authProvider) {
      throw new UnauthorizedError("No auth provider");
    }
    let v5429;
    try {
      v5429 = await auth(this._authProvider, {
        serverUrl: this._url,
        resourceMetadataUrl: this._resourceMetadataUrl,
        scope: this._scope,
        fetchFn: this._fetchWithInit
      });
    } catch (v5430) {
      this.onerror?.(v5430);
      throw v5430;
    }
    if (v5429 !== "AUTHORIZED") {
      throw new UnauthorizedError();
    }
    return await this._startOrAuth();
  }
  async _commonHeaders() {
    const v5431 = {};
    if (this._authProvider) {
      const v5432 = await this._authProvider.tokens();
      if (v5432) {
        v5431.Authorization = "Bearer " + v5432.access_token;
      }
    }
    if (this._protocolVersion) {
      v5431["mcp-protocol-version"] = this._protocolVersion;
    }
    const v5433 = normalizeHeaders(this._requestInit?.headers);
    return new Headers({
      ...v5431,
      ...v5433
    });
  }
  _startOrAuth() {
    const v5434 = this?._eventSourceInit?.fetch ?? this._fetch ?? fetch;
    return new Promise((v5435, v5436) => {
      this._eventSource = new EventSource(this._url.href, {
        ...this._eventSourceInit,
        fetch: async (v5437, v5438) => {
          const v5439 = await this._commonHeaders();
          v5439.set("Accept", "text/event-stream");
          const v5440 = await v5434(v5437, {
            ...v5438,
            headers: v5439
          });
          if (v5440.status === 401 && v5440.headers.has("www-authenticate")) {
            const {
              resourceMetadataUrl: v5441,
              scope: v5442
            } = extractWWWAuthenticateParams(v5440);
            this._resourceMetadataUrl = v5441;
            this._scope = v5442;
          }
          return v5440;
        }
      });
      this._abortController = new AbortController();
      this._eventSource.onerror = v5443 => {
        if (v5443.code === 401 && this._authProvider) {
          this._authThenStart().then(v5435, v5436);
          return;
        }
        const v5444 = new SseError(v5443.code, v5443.message, v5443);
        v5436(v5444);
        this.onerror?.(v5444);
      };
      this._eventSource.onopen = () => {};
      this._eventSource.addEventListener("endpoint", v5445 => {
        const v5446 = v5445;
        try {
          this._endpoint = new URL(v5446.data, this._url);
          if (this._endpoint.origin !== this._url.origin) {
            throw new Error("Endpoint origin does not match connection origin: " + this._endpoint.origin);
          }
        } catch (v5447) {
          v5436(v5447);
          this.onerror?.(v5447);
          this.close();
          return;
        }
        v5435();
      });
      this._eventSource.onmessage = v5448 => {
        const v5449 = v5448;
        let v5450;
        try {
          v5450 = JSONRPCMessageSchema.parse(JSON.parse(v5449.data));
        } catch (v5451) {
          this.onerror?.(v5451);
          return;
        }
        this.onmessage?.(v5450);
      };
    });
  }
  async start() {
    if (this._eventSource) {
      throw new Error("SSEClientTransport already started! If using Client class, note that connect() calls start() automatically.");
    }
    return await this._startOrAuth();
  }
  async finishAuth(v5452) {
    if (!this._authProvider) {
      throw new UnauthorizedError("No auth provider");
    }
    const v5453 = await auth(this._authProvider, {
      serverUrl: this._url,
      authorizationCode: v5452,
      resourceMetadataUrl: this._resourceMetadataUrl,
      scope: this._scope,
      fetchFn: this._fetchWithInit
    });
    if (v5453 !== "AUTHORIZED") {
      throw new UnauthorizedError("Failed to authorize");
    }
  }
  async close() {
    this._abortController?.abort();
    this._eventSource?.close();
    this.onclose?.();
  }
  async send(v5454) {
    if (!this._endpoint) {
      throw new Error("Not connected");
    }
    try {
      const v5455 = await this._commonHeaders();
      v5455.set("content-type", "application/json");
      const v5456 = {
        ...this._requestInit,
        method: "POST",
        headers: v5455,
        body: JSON.stringify(v5454),
        signal: this._abortController?.signal
      };
      const v5457 = await (this._fetch ?? fetch)(this._endpoint, v5456);
      if (!v5457.ok) {
        const v5458 = await v5457.text().catch(() => null);
        if (v5457.status === 401 && this._authProvider) {
          const {
            resourceMetadataUrl: v5459,
            scope: v5460
          } = extractWWWAuthenticateParams(v5457);
          this._resourceMetadataUrl = v5459;
          this._scope = v5460;
          const v5461 = await auth(this._authProvider, {
            serverUrl: this._url,
            resourceMetadataUrl: this._resourceMetadataUrl,
            scope: this._scope,
            fetchFn: this._fetchWithInit
          });
          if (v5461 !== "AUTHORIZED") {
            throw new UnauthorizedError();
          }
          return this.send(v5454);
        }
        throw new Error("Error POSTing to endpoint (HTTP " + v5457.status + "): " + v5458);
      }
      await v5457.body?.cancel();
    } catch (v5462) {
      this.onerror?.(v5462);
      throw v5462;
    }
  }
  setProtocolVersion(v5463) {
    this._protocolVersion = v5463;
  }
}
function connectionTransport(v5464) {
  if (v5464.transport === "stdio") {
    const v5465 = new StdioClientTransport({
      command: v5464.command,
      args: v5464.args,
      env: v5464.env,
      stderr: "pipe"
    });
    v5465.stderr?.on("data", () => undefined);
    return v5465;
  }
  const v5466 = {
    headers: v5464.headers
  };
  if (v5464.transport === "sse") {
    return new SSEClientTransport(new URL(v5464.url), {
      requestInit: v5466,
      eventSourceInit: {
        fetch: (v5467, v5468) => fetch(v5467, {
          ...v5468,
          headers: v5464.headers
        })
      }
    });
  } else {
    return new StreamableHTTPClientTransport(new URL(v5464.url), {
      requestInit: v5466
    });
  }
}
async function testMcpConnection(v5469, v5470) {
  const v5471 = validateMcp(v5469);
  const v5472 = new Client({
    name: "plccode-connection-test",
    version: "1.0.0"
  });
  const v5473 = connectionTransport(v5471);
  const v5474 = Date.now();
  const v5475 = AbortSignal.any([AbortSignal.timeout(20000), ...(v5470 ? [v5470] : [])]);
  try {
    await v5472.connect(v5473, {
      timeout: 15000,
      signal: v5475
    });
    const v5476 = [];
    let v5477;
    const v5478 = new Set();
    do {
      const v5479 = await v5472.listTools(v5477 ? {
        cursor: v5477
      } : {}, {
        timeout: 10000,
        signal: v5475
      });
      v5476.push(...v5479.tools.map(({
        name: v5480,
        description: v5481
      }) => ({
        name: v5480,
        description: v5481
      })));
      v5477 = v5479.nextCursor;
      if (v5477 && v5478.has(v5477)) {
        throw new Error("服务返回了重复的分页游标");
      }
      if (v5477) {
        v5478.add(v5477);
      }
      if (v5476.length > 2000) {
        throw new Error("服务工具数量超过 2000，请缩小服务范围");
      }
    } while (v5477);
    return {
      ok: true,
      tools: v5476,
      elapsedMs: Date.now() - v5474
    };
  } catch (v5482) {
    let v5483 = String(v5482 instanceof Error ? v5482.message : v5482);
    for (const v5484 of [...Object.values(v5471.env), ...Object.values(v5471.headers)]) {
      if (v5484.length >= 4) {
        v5483 = v5483.split(v5484).join("[hidden]");
      }
    }
    return {
      ok: false,
      tools: [],
      error: v5475.aborted ? "连接测试超时或已取消" : v5483.slice(0, 700),
      elapsedMs: Date.now() - v5474
    };
  } finally {
    await v5472.close().catch(() => undefined);
    await v5473.close().catch(() => undefined);
  }
}
exports.AjvJsonSchemaValidator = AjvJsonSchemaValidator;
exports.CallToolRequestSchema = CallToolRequestSchema;
exports.CallToolResultSchema = CallToolResultSchema;
exports.Client = Client;
exports.CreateMessageResultSchema = CreateMessageResultSchema;
exports.CreateMessageResultWithToolsSchema = CreateMessageResultWithToolsSchema;
exports.CreateTaskResultSchema = CreateTaskResultSchema;
exports.ElicitResultSchema = ElicitResultSchema;
exports.EmptyResultSchema = EmptyResultSchema;
exports.InitializeRequestSchema = InitializeRequestSchema;
exports.InitializedNotificationSchema = InitializedNotificationSchema;
exports.LATEST_PROTOCOL_VERSION = LATEST_PROTOCOL_VERSION;
exports.ListResourcesRequestSchema = ListResourcesRequestSchema;
exports.ListRootsResultSchema = ListRootsResultSchema;
exports.ListToolsRequestSchema = ListToolsRequestSchema;
exports.LoggingLevelSchema = LoggingLevelSchema;
exports.McpError = McpError;
exports.Protocol = Protocol;
exports.ReadBuffer = ReadBuffer;
exports.ReadResourceRequestSchema = ReadResourceRequestSchema;
exports.SUPPORTED_PROTOCOL_VERSIONS = SUPPORTED_PROTOCOL_VERSIONS;
exports.SetLevelRequestSchema = SetLevelRequestSchema;
exports.WorkbenchStore = WorkbenchStore;
exports.assertClientRequestTaskCapability = assertClientRequestTaskCapability;
exports.assertToolsCallTaskCapability = assertToolsCallTaskCapability;
exports.connectionTransport = connectionTransport;
exports.getObjectShape = getObjectShape;
exports.isZ4Schema = isZ4Schema;
exports.mergeCapabilities = mergeCapabilities;
exports.safeParse = safeParse$1;
exports.serializeMessage = serializeMessage;
exports.testMcpConnection = testMcpConnection;