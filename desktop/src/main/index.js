'use strict';

/* === BYOK ENTRY 20261103 === */
const __byok = require("./byok-main.cjs");
/* === END BYOK ENTRY === */
const electron = require("electron");
const node_child_process = require("node:child_process");
const node_crypto = require("node:crypto");
const node_fs = require("node:fs");
const node_path = require("node:path");
const node_url = require("node:url");
const promises = require("node:fs/promises");
const node_readline = require("node:readline");
const node_events = require("node:events");
const node_os = require("node:os");
const mcpClient = require("./chunks/mcpClient-DabeyNt0.js");
const node_module = require("node:module");
const iconv = require("iconv-lite");
const electronUpdater = require("electron-updater");
require("child_process");
require("path");
require("fs");
require("node:process");
require("node:stream");
const ENGINE_BIN = process.platform === "win32" ? "plccode-engine.exe" : "plccode-engine";
const BRIDGE_BIN = process.platform === "win32" ? "TiaOpennessBridge.exe" : "TiaOpennessBridge";
const EXECUTE_TOOL_BIN = process.platform === "win32" ? "execute_tool.exe" : "execute_tool";
function cargoTargetRoot(v1) {
  const v2 = process.env.CARGO_TARGET_DIR?.trim();
  if (v2) {
    return node_path.resolve(v2);
  } else {
    return node_path.join(v1, ".local", "cache", "cargo");
  }
}
function findRepoRoot(v3) {
  let v4 = v3;
  for (let v5 = 0; v5 < 12; v5++) {
    if (node_fs.existsSync(node_path.join(v4, "rust", "Cargo.toml"))) {
      return v4;
    }
    const v6 = node_path.dirname(v4);
    if (v6 === v4) {
      return null;
    }
    v4 = v6;
  }
  return null;
}
function locateEngine(v7, v8) {
  const v9 = process.env.PLC_CODE_ENGINE_PATH;
  if (v9 && node_fs.existsSync(v9)) {
    const v10 = findRepoRoot(node_path.dirname(v9)) ?? findRepoRoot(process.cwd());
    return {
      enginePath: v9,
      bridgeExePath: locateBridgeExe(v10, v8),
      repoRoot: v10,
      isDevFallback: false
    };
  }
  if (v8) {
    const v11 = node_path.join(v8.resourcesPath, "engine", ENGINE_BIN);
    if (node_fs.existsSync(v11)) {
      return {
        enginePath: v11,
        bridgeExePath: locateBridgeExe(null, v8),
        repoRoot: null,
        isDevFallback: false
      };
    }
  }
  const v12 = node_path.join(v7, ENGINE_BIN);
  if (node_fs.existsSync(v12)) {
    const v13 = findRepoRoot(v7);
    return {
      enginePath: v12,
      bridgeExePath: locateBridgeExe(v13),
      repoRoot: v13,
      isDevFallback: false
    };
  }
  const v14 = node_path.join(node_path.dirname(v7), ENGINE_BIN);
  if (node_fs.existsSync(v14)) {
    const v15 = findRepoRoot(v7);
    return {
      enginePath: v14,
      bridgeExePath: locateBridgeExe(v15),
      repoRoot: v15,
      isDevFallback: false
    };
  }
  const v16 = findRepoRoot(process.cwd()) ?? findRepoRoot(v7);
  if (v16) {
    const v17 = node_path.join(cargoTargetRoot(v16), "debug", ENGINE_BIN);
    const v18 = node_path.join(cargoTargetRoot(v16), "release", ENGINE_BIN);
    if (node_fs.existsSync(v17)) {
      return {
        enginePath: v17,
        bridgeExePath: locateBridgeExe(v16, v8),
        repoRoot: v16,
        isDevFallback: true
      };
    }
    if (node_fs.existsSync(v18)) {
      return {
        enginePath: v18,
        bridgeExePath: locateBridgeExe(v16, v8),
        repoRoot: v16,
        isDevFallback: true
      };
    }
  }
  throw new Error("plccode-engine binary not found. Checked PLC_CODE_ENGINE_PATH, " + v12 + ", " + v14 + (v16 ? ", " + node_path.join(cargoTargetRoot(v16), "debug", ENGINE_BIN) + ", " + node_path.join(cargoTargetRoot(v16), "release", ENGINE_BIN) : " (no repo root found for a dev fallback either)"));
}
function locateExecuteTool(v19, v20) {
  const v21 = process.env.PLC_CODE_EXECUTE_TOOL_PATH;
  if (v21 && node_fs.existsSync(v21)) {
    return v21;
  }
  if (v20) {
    const v22 = node_path.join(v20.resourcesPath, "engine", EXECUTE_TOOL_BIN);
    if (node_fs.existsSync(v22)) {
      return v22;
    }
  }
  const v23 = node_path.join(v19, EXECUTE_TOOL_BIN);
  if (node_fs.existsSync(v23)) {
    return v23;
  }
  const v24 = node_path.join(node_path.dirname(v19), EXECUTE_TOOL_BIN);
  if (node_fs.existsSync(v24)) {
    return v24;
  }
  const v25 = findRepoRoot(process.cwd()) ?? findRepoRoot(v19);
  if (v25) {
    const v26 = node_path.join(cargoTargetRoot(v25), "debug", EXECUTE_TOOL_BIN);
    const v27 = node_path.join(cargoTargetRoot(v25), "release", EXECUTE_TOOL_BIN);
    if (node_fs.existsSync(v26)) {
      return v26;
    }
    if (node_fs.existsSync(v27)) {
      return v27;
    }
  }
  return null;
}
function locateBridgeExe(v28, v29) {
  const v30 = process.env.PLC_CODE_TIA_OPENNESS_BRIDGE_EXE;
  if (v30 && node_fs.existsSync(v30)) {
    return v30;
  }
  if (v29) {
    const v31 = node_path.join(v29.resourcesPath, "bridge", BRIDGE_BIN);
    if (node_fs.existsSync(v31)) {
      return v31;
    }
  }
  if (!v28) {
    return null;
  }
  const v32 = [node_path.join(v28, "tools", "tia-openness-bridge", "src", "TiaOpennessBridge", "bin", "Debug", BRIDGE_BIN), node_path.join(v28, "tools", "tia-openness-bridge", "src", "TiaOpennessBridge", "bin", "Release", BRIDGE_BIN)];
  for (const v33 of v32) {
    if (node_fs.existsSync(v33)) {
      return v33;
    }
  }
  return null;
}
const models = [{
  key: "wv-tk-b2432249be",
  name: "TK6051iP",
  group: "TK6051iP",
  series: "TK Series",
  category: "TK",
  vendor_ids: ["48"],
  format: "emtp",
  template: "template_TK_480x272.emtp",
  template_sha256: "A9B1621D6D48BA9C90C7A118645BFA161AAF2F1ED75193B8B59F1F45F82F81DE",
  has_display: true,
  custom_resolution: false,
  width: 480,
  height: 272,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "Ethernet : NA", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : NA"]
}, {
  key: "wv-tk-80e4c5029d",
  name: "TK6071iP / TK6072iP",
  group: "TK6071iP / TK6072iP",
  series: "TK Series",
  category: "TK",
  vendor_ids: ["45"],
  format: "emtp",
  template: "template_TK_800x480.emtp",
  template_sha256: "35AFC92EE7D6E855025C66222F5168E2E46261E5A198E81514F158DD38E6B24A",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "Ethernet : NA", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : NA"]
}, {
  key: "wv-tk-a4be25a1af",
  name: "TK6071iQ",
  group: "TK6071iQ",
  series: "TK Series",
  category: "TK",
  vendor_ids: ["46"],
  format: "emtp",
  template: "template_TK_800x480.emtp",
  template_sha256: "35AFC92EE7D6E855025C66222F5168E2E46261E5A198E81514F158DD38E6B24A",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "Ethernet : NA", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-tk-278f3924b0",
  name: "TK8071iP / TK8072iP",
  group: "TK8071iP / TK8072iP",
  series: "TK Series",
  category: "TK",
  vendor_ids: ["49"],
  format: "emtp",
  template: "template_TK_800x480.emtp",
  template_sha256: "35AFC92EE7D6E855025C66222F5168E2E46261E5A198E81514F158DD38E6B24A",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes*"]
}, {
  key: "wv-ip-bb10eaaa70",
  name: "MT6051iP / MT8051iP / MT8052iP / MT8052iP (V1e)",
  group: "MT6051iP / MT8051iP / MT8052iP / MT8052iP (V1e)",
  series: "iP Series",
  category: "iP",
  vendor_ids: ["43"],
  format: "emtp",
  template: "template_iP_480x272.emtp",
  template_sha256: "6B0B4BFDC45A3A054D487CCAE3CDBDFE783030F39D4C2A06A16137499B953F2B",
  has_display: true,
  custom_resolution: false,
  width: 480,
  height: 272,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ip-8b0ce863c2",
  name: "MT6071iP / MT8071iP / MT8071iP2 / MT8072iP / MT8072iP (V2) / MT8072iP (V2e)",
  group: "MT6071iP / MT8071iP / MT8071iP2 / MT8072iP / MT8072iP (V2) / MT8072iP (V2e)",
  series: "iP Series",
  category: "iP",
  vendor_ids: ["41"],
  format: "emtp",
  template: "template_iP_800x480.emtp",
  template_sha256: "D6781DBCE13B7D4CDB7BFBA0C75D33144F5ACE36CFC4A8642C3670583FF05CAF",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ip-5a26584f33",
  name: "MT6103iP",
  group: "MT6103iP",
  series: "iP Series",
  category: "iP",
  vendor_ids: ["42"],
  format: "emtp",
  template: "template_iP_1024x600.emtp",
  template_sha256: "EF795A56E150B2659A32F69E6BFFD0C67F3E6894C171CBE67DF57659693491EA",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : NA", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ip-4beac40842",
  name: "MT6102iQ",
  group: "MT6102iQ",
  series: "iP Series",
  category: "iP",
  vendor_ids: ["47"],
  format: "emtp",
  template: "template_iP_1024x600.emtp",
  template_sha256: "EF795A56E150B2659A32F69E6BFFD0C67F3E6894C171CBE67DF57659693491EA",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : NA", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ip-c405f43cbe",
  name: "MT8102iQ / MT8106iQ / MT8106iQ (V2e)",
  group: "MT8102iQ / MT8106iQ / MT8106iQ (V2e)",
  series: "iP Series",
  category: "iP",
  vendor_ids: ["55"],
  format: "emtp",
  template: "template_iP_1024x600.emtp",
  template_sha256: "EF795A56E150B2659A32F69E6BFFD0C67F3E6894C171CBE67DF57659693491EA",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ip-305ad2127a",
  name: "MT8102iP / MT8106iP / MT8106iP (V2)",
  group: "MT8102iP / MT8106iP / MT8106iP (V2)",
  series: "iP Series",
  category: "iP",
  vendor_ids: ["44"],
  format: "emtp",
  template: "template_iP_1024x600.emtp",
  template_sha256: "EF795A56E150B2659A32F69E6BFFD0C67F3E6894C171CBE67DF57659693491EA",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-e98c497bc0",
  name: "MT8050iE / MT8051iE",
  group: "MT8050iE / MT8051iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["92"],
  format: "emtp",
  template: "template_480x272.emtp",
  template_sha256: "73B57F9651EF19FA1E3F4DB6264D78F616348A84D63271B2B370C11FCEF4E7BF",
  has_display: true,
  custom_resolution: false,
  width: 480,
  height: 272,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-34444a1253",
  name: "MT8053iE",
  group: "MT8053iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["100"],
  format: "emtp",
  template: "template_480x272.emtp",
  template_sha256: "73B57F9651EF19FA1E3F4DB6264D78F616348A84D63271B2B370C11FCEF4E7BF",
  has_display: true,
  custom_resolution: false,
  width: 480,
  height: 272,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-d9a5410b40",
  name: "MT6070iE",
  group: "MT6070iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["91"],
  format: "emtp",
  template: "template_800x480.emtp",
  template_sha256: "921B9717C04D024260E30C03FC4EB697DFB7582CA636BB1C3B15E062098A03C2",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : NA", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-5445514a34",
  name: "MT6071iE",
  group: "MT6071iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["95"],
  format: "emtp",
  template: "template_800x480.emtp",
  template_sha256: "921B9717C04D024260E30C03FC4EB697DFB7582CA636BB1C3B15E062098A03C2",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : NA", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-3f8ad1270d",
  name: "MT8070iE / MT8100iE",
  group: "MT8070iE / MT8100iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["90"],
  format: "emtp",
  template: "template_800x480.emtp",
  template_sha256: "921B9717C04D024260E30C03FC4EB697DFB7582CA636BB1C3B15E062098A03C2",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-d70f87d702",
  name: "MT8071iE / MT8072iE / MT8072iE (V2) / MT8101iE",
  group: "MT8071iE / MT8072iE / MT8072iE (V2) / MT8101iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["96"],
  format: "emtp",
  template: "template_800x480.emtp",
  template_sha256: "921B9717C04D024260E30C03FC4EB697DFB7582CA636BB1C3B15E062098A03C2",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-b56c4ddf77",
  name: "MT8073iE",
  group: "MT8073iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["97"],
  format: "emtp",
  template: "template_800x480.emtp",
  template_sha256: "921B9717C04D024260E30C03FC4EB697DFB7582CA636BB1C3B15E062098A03C2",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-867a296cf1",
  name: "MT8102iE / MT8106iE / MT8106iE (V2)",
  group: "MT8102iE / MT8106iE / MT8106iE (V2)",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["98"],
  format: "emtp",
  template: "template_1024x600.emtp",
  template_sha256: "62FD14B8E89B33246ECA957C4A6C006208DC7EF21143D891F5BE083120A1AEBF",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232, RS-485 2W", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W/4W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-cc80cb709a",
  name: "MT8103iE",
  group: "MT8103iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["99"],
  format: "emtp",
  template: "template_wifi_1024x600.emtp",
  template_sha256: "829E5ADFAB3D4C07B0796B3E21F20F75EC9B2D60B380BF4763BCEE186C3412F6",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232, RS-485 2W", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W/4W", "Ethernet : LAN", "WiFi : Yes", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-ie-f12a6dde23",
  name: "MT8121iE/MT8150iE",
  group: "MT8121iE/MT8150iE",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["94"],
  format: "emtp",
  template: "template_1024x768.emtp",
  template_sha256: "35C4ABBFE2D54E9895B6FE02AB8BDF259865F5BC93DA7450B93481EA3FC6D4F7",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-ie-3b1b405c97",
  name: "MT8121iE2/MT8150iE2",
  group: "MT8121iE2/MT8150iE2",
  series: "iE Series",
  category: "iE",
  vendor_ids: ["93"],
  format: "emtp",
  template: "template_1024x768.emtp",
  template_sha256: "35C4ABBFE2D54E9895B6FE02AB8BDF259865F5BC93DA7450B93481EA3FC6D4F7",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-emt-b2754fb54d",
  name: "eMT3070",
  group: "eMT3070",
  series: "eMT Series",
  category: "eMT",
  vendor_ids: ["52"],
  format: "emtp",
  template: "template_800x480.emtp",
  template_sha256: "921B9717C04D024260E30C03FC4EB697DFB7582CA636BB1C3B15E062098A03C2",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-emt-f4b4ff0c72",
  name: "eMT3105",
  group: "eMT3105",
  series: "eMT Series",
  category: "eMT",
  vendor_ids: ["50"],
  format: "emtp",
  template: "template_800x600.emtp",
  template_sha256: "160C10D536AA6A3CBA6C43A3275BC505ED2D99D72806A90B9727F1CA1C802FA8",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 600,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-emt-06e3dac2b4",
  name: "eMT3120 / eMT3150",
  group: "eMT3120 / eMT3150",
  series: "eMT Series",
  category: "eMT",
  vendor_ids: ["51"],
  format: "emtp",
  template: "template_1024x768.emtp",
  template_sha256: "35C4ABBFE2D54E9895B6FE02AB8BDF259865F5BC93DA7450B93481EA3FC6D4F7",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-xe-2525c0380f",
  name: "MT8090XE / MT8091XE",
  group: "MT8090XE / MT8091XE",
  series: "XE Series",
  category: "XE",
  vendor_ids: ["62"],
  format: "emtp",
  template: "template_1024x768.emtp",
  template_sha256: "35C4ABBFE2D54E9895B6FE02AB8BDF259865F5BC93DA7450B93481EA3FC6D4F7",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA/Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-xe-943671985e",
  name: "MT8092XE",
  group: "MT8092XE",
  series: "XE Series",
  category: "XE",
  vendor_ids: ["63"],
  format: "emtp",
  template: "template_1024x768.emtp",
  template_sha256: "35C4ABBFE2D54E9895B6FE02AB8BDF259865F5BC93DA7450B93481EA3FC6D4F7",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-xe-e1b7fb26de",
  name: "MT8121XE / MT8150XE",
  group: "MT8121XE / MT8150XE",
  series: "XE Series",
  category: "XE",
  vendor_ids: ["61"],
  format: "emtp",
  template: "template_1024x768.emtp",
  template_sha256: "35C4ABBFE2D54E9895B6FE02AB8BDF259865F5BC93DA7450B93481EA3FC6D4F7",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmt-09249b814c",
  name: "cMT3071",
  group: "cMT3071",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["72"],
  format: "cmtp",
  template: "template_800x480.cmtp",
  template_sha256: "14CD2DE65391445F581C66DCF31151624EA94D764DF1BA513A487DE91BEE4EA3",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmt-5b3b301715",
  name: "cMT3072",
  group: "cMT3072",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["77"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmt-7fd685b92a",
  name: "cMT3090",
  group: "cMT3090",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["74"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmt-92a37feda5",
  name: "cMT3103",
  group: "cMT3103",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["78"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : Yes", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmt-9bc98b52f3",
  name: "cMT3151",
  group: "cMT3151",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["71"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmt-7fb93b362b",
  name: "cMT-HDM",
  group: "cMT-HDM",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["76"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: true,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmt-bbfe587e13",
  name: "cMT-FHD",
  group: "cMT-FHD",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["112"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: true,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmt-ac64e6a5b0",
  name: "cMT-SVR-100 / 100 (V2)",
  group: "cMT-SVR-100 / 100 (V2)",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["70"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: true,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmt-01afef6240",
  name: "cMT-SVR-200 / 200 (V2)",
  group: "cMT-SVR-200 / 200 (V2)",
  series: "cMT Series",
  category: "cMT",
  vendor_ids: ["79"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: true,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : Yes", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-basic-9d068416c4",
  name: "cMT1107X",
  group: "cMT1107X",
  series: "cMT X Series - Basic",
  category: "cMTX-Basic",
  vendor_ids: ["154"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-efbaf7256e",
  name: "cMT2059XH",
  group: "cMT2059XH",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["186"],
  format: "cmtp",
  template: "template_800x480.cmtp",
  template_sha256: "14CD2DE65391445F581C66DCF31151624EA94D764DF1BA513A487DE91BEE4EA3",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-19f8825e5f",
  name: "cMT2079X / cMT2079X (V2)",
  group: "cMT2079X / cMT2079X (V2)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["143"],
  format: "cmtp",
  template: "template_800x480.cmtp",
  template_sha256: "14CD2DE65391445F581C66DCF31151624EA94D764DF1BA513A487DE91BEE4EA3",
  has_display: true,
  custom_resolution: false,
  width: 800,
  height: 480,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-31bd8eeb70",
  name: "cMT2105X",
  group: "cMT2105X",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["190"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-460aa0680f",
  name: "cMT2109X / cMT2109X2",
  group: "cMT2109X / cMT2109X2 / cMT2109X2 (V2)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["150"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-5c99930319",
  name: "cMT2109X2 (V2)",
  group: "cMT2109X / cMT2109X2 / cMT2109X2 (V2)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["174"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-ab1306c9aa",
  name: "cMT2109X2 (Li)",
  group: "cMT2109X2 (Li)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["199"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-ece3d91a4f",
  name: "cMT2129X",
  group: "cMT2129X",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["172"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-70a76ef94f",
  name: "cMT2159X",
  group: "cMT2159X / cMT2159X (V2)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["146"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-5bffdc226d",
  name: "cMT2159X (V2)",
  group: "cMT2159X / cMT2159X (V2)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["180"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-ac962972c1",
  name: "cMT2167X",
  group: "cMT2167X",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["156"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: false,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-c9adb9a7b1",
  name: "cMT2167X (Li)",
  group: "cMT2167X (Li)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["201"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: false,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-c235ae555f",
  name: "cMT2169X",
  group: "cMT2169X",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["188"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: false,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-9bb5ea27f8",
  name: "cMT2169X (Li)",
  group: "cMT2169X (Li)",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["203"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: false,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-standard-be20244f5c",
  name: "cMT3160X",
  group: "cMT3160X",
  series: "cMT X Series - Standard",
  category: "cMTX-Standard",
  vendor_ids: ["122"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: false,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-461cc3b268",
  name: "cMT3075XH / cMT3075XH2 / cMT3075XH2 (V2)",
  group: "cMT3075XH / cMT3075XH2 / cMT3075XH2 (V2)",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["138"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes/NA/Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-05ec33e049",
  name: "cMT3075XH3",
  group: "cMT3075XH3",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["196"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-5891c7f8d5",
  name: "cMT3095X",
  group: "cMT3095X",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["139"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-9f5f36a4df",
  name: "cMT3105X",
  group: "cMT3105X / cMT3105X (V2)",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["152"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-e6d6bd0941",
  name: "cMT3105X (V2)",
  group: "cMT3105X / cMT3105X (V2)",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["176"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-f46c8b8fd6",
  name: "cMT3107XM",
  group: "cMT3107XM",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["192"],
  format: "cmtp",
  template: "template_1024x600.cmtp",
  template_sha256: "C4DE704940D939F82D5B1F180D66F7312D812708F2A65E3002936E0CC7899C81",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 600,
  interfaces: ["COM 2 : RS-485 2W/4W", "Ethernet : LAN 1", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-ffa77ed316",
  name: "cMT3155X",
  group: "cMT3155X",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["140"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: false,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-52eee7969c",
  name: "cMT3169X",
  group: "cMT3169X",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["158"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: false,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-332fb1063a",
  name: "cMT3219XP",
  group: "cMT3219XP",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["194"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: false,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-232, RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : Yes", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-8872b8f6b6",
  name: "cMT-FHDX-520",
  group: "cMT-FHDX-520",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["135"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: true,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-0287b743e3",
  name: "cMT-FHDX-920",
  group: "cMT-FHDX-920",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["160"],
  format: "cmtp",
  template: "template_1920x1080.cmtp",
  template_sha256: "F03175D326FC67E3D6B06EA81830533D34AE10F73F1B47C218742B873E7DE90B",
  has_display: true,
  custom_resolution: true,
  width: 1920,
  height: 1080,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-cmtx-advanced-511c3f6085",
  name: "cMT-SVRX-920 / 922",
  group: "cMT-SVRX-920 / 922",
  series: "cMT X Series - Advanced",
  category: "cMTX-Advanced",
  vendor_ids: ["166"],
  format: "cmtp",
  template: "template_1024x768.cmtp",
  template_sha256: "C89531B602C560D342EA26A3CDF7175D66276C2F3797233AF47097E0FD038A65",
  has_display: true,
  custom_resolution: true,
  width: 1024,
  height: 768,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}, {
  key: "wv-gateway-12c0551074",
  name: "cMT-G01 / cMT-G01X",
  group: "cMT-G01 / cMT-G01X",
  series: "cMT Series - IIoT Gateway",
  category: "Gateway",
  vendor_ids: ["73"],
  format: "cmtp",
  template: "template_G01.cmtp",
  template_sha256: "6C4BE8C8CB82A62A56C6AC9AE2F6D99F2546638BC7A9032A54270281229950BA",
  has_display: false,
  custom_resolution: false,
  width: null,
  height: null,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 1, LAN 2", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : NA(cMT-G01) / Yes(cMT-G01X)"]
}, {
  key: "wv-gateway-33981d3693",
  name: "cMT-G02 / cMT-G02X",
  group: "cMT-G02 / cMT-G02X",
  series: "cMT Series - IIoT Gateway",
  category: "Gateway",
  vendor_ids: ["75"],
  format: "cmtp",
  template: "template_G02.cmtp",
  template_sha256: "ECECC3FD25AE9722293E4076C2BA9BE6D3A063F8867A21D307B52BEDA953CE41",
  has_display: false,
  custom_resolution: false,
  width: null,
  height: null,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : Yes", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : NA(cMT-G02) / Yes(cMT-G02X)"]
}, {
  key: "wv-gateway-85c09ed590",
  name: "cMT-G03",
  group: "cMT-G03",
  series: "cMT Series - IIoT Gateway",
  category: "Gateway",
  vendor_ids: ["110"],
  format: "cmtp",
  template: "template_G03.cmtp",
  template_sha256: "30A6C569E2601EA0E333170B0DC2B6445B80835F3CBF36C20E9FD826D9DF1E01",
  has_display: false,
  custom_resolution: false,
  width: null,
  height: null,
  interfaces: ["COM 1 : RS-232, RS-485 2W/4W", "COM 2 : RS-232, RS-485 2W/4W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : NA"]
}, {
  key: "wv-gateway-0a522be2a1",
  name: "cMT-G04",
  group: "cMT-G04",
  series: "cMT Series - IIoT Gateway",
  category: "Gateway",
  vendor_ids: ["111"],
  format: "cmtp",
  template: "template_G04.cmtp",
  template_sha256: "2E5C69C9C29939F4C547B1D8488868240D2BA93B4A134FB546F047FEE10AFB32",
  has_display: false,
  custom_resolution: false,
  width: null,
  height: null,
  interfaces: ["Ethernet : LAN, SW1/SW2 (2 端口以太网交换机)", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : NA", "USB Host : NA"]
}, {
  key: "wv-gateway-8e18c7b95e",
  name: "cMT-CTRL01",
  group: "cMT-CTRL01",
  series: "cMT Series - IIoT Gateway",
  category: "Gateway",
  vendor_ids: ["113"],
  format: "cmtp",
  template: "template_CTRL01.cmtp",
  template_sha256: "5BCEA0B1EB1D6BF7389ED27D4F43C60C250F1ECF4A4BE37ED267A0F98D63EDFB",
  has_display: false,
  custom_resolution: false,
  width: null,
  height: null,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN 2, LAN 1", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : NA"]
}, {
  key: "wv-mtv-17c715c518",
  name: "cMT-HD",
  group: "cMT-HD",
  series: "cMT-HD Series",
  category: "mTV",
  vendor_ids: ["80"],
  format: "emtp",
  template: "template_1280x720.emtp",
  template_sha256: "F2A7123F8B0D2CF15986DA81A67A01CEA919E794B0A594616E9DD9D8D8D2618C",
  has_display: true,
  custom_resolution: false,
  width: 1280,
  height: 720,
  interfaces: ["COM 1 : RS-232", "COM 2 : RS-485 2W/4W", "COM 3 : RS-485 2W", "Ethernet : LAN", "WiFi : NA", "CAN Bus : NA", "SD Card Slot : Yes", "USB Host : Yes"]
}];
const catalog = {
  models: models
};
const WEINVIEW_MODELS = catalog.models;
[...new Set(WEINVIEW_MODELS.map(v34 => v34.series))];
function isWeinviewProjectChoice(v35) {
  if (!v35 || typeof v35 !== "object") {
    return false;
  }
  const v36 = v35;
  return typeof v36.modelKey === "string" && /^wv-[a-z0-9-]{1,120}$/.test(v36.modelKey) && (v36.installationExePath === undefined || typeof v36.installationExePath === "string" && v36.installationExePath.trim().length > 0) && (v36.orientation === undefined || v36.orientation === "horizontal" || v36.orientation === "vertical");
}
function referenceWeinviewModelCatalog(v37) {
  return {
    source: "reference",
    models: WEINVIEW_MODELS,
    installations: [],
    message: v37
  };
}
const WEINVIEW_PROGRESS_PREFIX = "[weinview-progress]";
function readWeinviewProgress(v38) {
  if (!v38 || typeof v38 !== "object") {
    return null;
  }
  const v39 = v38;
  if (typeof v39.request_id !== "string" || !v39.request_id.trim() || v39.request_id.length > 160 || typeof v39.operation !== "string" || !v39.operation.trim() || v39.operation.length > 100 || typeof v39.stage !== "string" || !v39.stage.trim() || v39.stage.length > 160 || typeof v39.label !== "string" || !v39.label.trim() || v39.label.length > 240 || v39.status !== "running" && v39.status !== "completed" && v39.status !== "failed" || v39.detail !== undefined && (typeof v39.detail !== "string" || v39.detail.length > 800)) {
    return null;
  }
  return {
    request_id: v39.request_id,
    operation: v39.operation,
    stage: v39.stage,
    label: v39.label,
    status: v39.status,
    ...(typeof v39.detail === "string" && v39.detail.trim() ? {
      detail: v39.detail
    } : {})
  };
}
function nativeStderr(v40) {
  let v41 = "";
  let v42 = "";
  const v43 = v44 => {
    if (v44.startsWith(WEINVIEW_PROGRESS_PREFIX)) {
      try {
        const v45 = readWeinviewProgress(JSON.parse(v44.slice(WEINVIEW_PROGRESS_PREFIX.length)));
        if (v45) {
          v40?.(v45);
        }
      } catch {}
      return;
    }
    v42 = (v42 + v44 + "\n").slice(-8192);
  };
  return {
    push(v46) {
      v41 += v46;
      let v47;
      while ((v47 = v41.indexOf("\n")) >= 0) {
        v43(v41.slice(0, v47).replace(/\r$/, ""));
        v41 = v41.slice(v47 + 1);
      }
      if (v41.length > 8192) {
        v42 = (v42 + v41).slice(-8192);
        v41 = "";
      }
    },
    finish() {
      if (v41) {
        v43(v41);
        v41 = "";
      }
    },
    text() {
      return v42.trim();
    }
  };
}
async function nativeWorkspaceInput(v48, v49, v50, v51) {
  const v52 = node_fs.lstatSync(v49);
  if (!v52.isFile() || v52.isSymbolicLink() || v52.size === 0 || v52.size > v51) {
    throw Error("请选择有效的威纶通工程或运行文件");
  }
  const v53 = node_fs.realpathSync(v49);
  const v54 = node_path.extname(v53).toLowerCase();
  if (!v50.includes(v54)) {
    throw Error("请选择 " + v50.join(" 或 ") + " 文件");
  }
  const v55 = node_path.relative(node_fs.realpathSync(v48.root), v53);
  if (v55 && !v55.startsWith("..") && !node_path.isAbsolute(v55)) {
    return v53;
  }
  const v56 = node_path.join(v48.root, ".plccode-imports", node_crypto.randomUUID());
  await promises.mkdir(v56, {
    recursive: true
  });
  const v57 = node_path.join(v56, "Source" + v54);
  await promises.copyFile(v53, v57, node_fs.constants.COPYFILE_EXCL);
  return v57;
}
const modelCatalogs = new Map();
const pendingModelDiscovery = new Map();
function discoverWeinviewModelCatalog(v58, v59) {
  const v60 = pendingModelDiscovery.get(v58);
  if (v60) {
    return v60;
  }
  const v61 = (async () => {
    try {
      const v62 = await new Promise((v63, v64) => {
        const v65 = node_child_process.spawn(v58, ["weinview_discover"], {
          cwd: v59,
          env: {
            ...process.env,
            PLC_CODE_ENABLE_PLC_PROMPT_EXTENSION: "1"
          },
          windowsHide: true,
          stdio: ["pipe", "pipe", "pipe"]
        });
        let v66 = "";
        let v67 = "";
        let v68 = false;
        const v69 = v70 => {
          if (v68) {
            return;
          }
          v68 = true;
          clearTimeout(v71);
          if (v70) {
            v64(v70);
          } else {
            try {
              v63(JSON.parse(v66));
            } catch {
              v64(Error("型号目录返回格式无效"));
            }
          }
        };
        const v71 = setTimeout(() => {
          v65.kill();
          v69(Error("读取安装型号目录超时"));
        }, 35000);
        v65.stdout.setEncoding("utf8");
        v65.stderr.setEncoding("utf8");
        v65.stdout.on("data", v72 => {
          v66 += v72;
          if (v66.length > 4194304) {
            v65.kill();
            v69(Error("型号目录过大"));
          }
        });
        v65.stderr.on("data", v73 => {
          v67 = (v67 + v73).slice(-8192);
        });
        v65.on("error", v69);
        v65.stdin.on("error", v69);
        v65.on("close", v74 => v69(v74 !== 0 ? Error(v67.trim() || "读取安装型号目录失败") : undefined));
        v65.stdin.end("{}", "utf8");
      });
      const v75 = v62.data;
      if (v62.ok !== true || v62.operation !== "discover" || !Array.isArray(v75?.models)) {
        throw Error("型号目录不可用");
      }
      const v76 = [];
      for (const v77 of v75.models) {
        if (!v77 || typeof v77 !== "object") {
          continue;
        }
        const v78 = v77;
        if (!isWeinviewProjectChoice({
          modelKey: v78.key
        }) || typeof v78.name !== "string" || !v78.name.trim() || typeof v78.series !== "string" || typeof v78.has_display !== "boolean" || typeof v78.installation_exe_path !== "string" || !v78.installation_exe_path) {
          continue;
        }
        v76.push({
          key: v78.key,
          name: v78.name,
          series: v78.series,
          category: typeof v78.category === "string" ? v78.category : "",
          format: typeof v78.format === "string" ? v78.format : null,
          has_display: v78.has_display,
          custom_resolution: v78.custom_resolution === true,
          width: typeof v78.width === "number" && Number.isInteger(v78.width) && v78.width > 0 ? v78.width : null,
          height: typeof v78.height === "number" && Number.isInteger(v78.height) && v78.height > 0 ? v78.height : null,
          installation_exe_path: v78.installation_exe_path,
          installation_version: typeof v78.installation_version === "string" ? v78.installation_version : "",
          create_project_supported: v78.create_project_supported === true
        });
      }
      if (!v76.length) {
        return referenceWeinviewModelCatalog("未发现可读取的安装型号，当前显示内置参考目录；创建时仍需已安装 EasyBuilder Pro。");
      }
      const v79 = [...new Map(v76.map(v80 => [v80.installation_exe_path, {
        exePath: v80.installation_exe_path,
        version: v80.installation_version ?? ""
      }])).values()];
      return {
        source: "installed",
        models: v76,
        installations: v79
      };
    } catch {
      return referenceWeinviewModelCatalog("未能读取安装型号，当前显示内置参考目录。可以重新读取，或按所选型号尝试原厂创建。");
    }
  })().then(v81 => {
    modelCatalogs.set(v58, v81);
    return v81;
  }).finally(() => {
    pendingModelDiscovery.delete(v58);
  });
  pendingModelDiscovery.set(v58, v61);
  return v61;
}
function modelFromNativeReceipt(v82, v83, v84) {
  if (!isWeinviewProjectChoice({
    modelKey: v82.model_key
  }) || typeof v82.model !== "string" || !v82.model.trim() || v82.format !== "emtp" && v82.format !== "cmtp" || node_path.extname(v83).toLowerCase() !== "." + v82.format || typeof v82.has_display !== "boolean" || typeof v82.width !== "number" || typeof v82.height !== "number" || v82.native_model_verified !== true || v84) {
    throw Error("原厂返回的型号或尺寸信息无效，保留工程");
  }
  return {
    key: v82.model_key,
    name: v82.model,
    series: typeof v82.series === "string" ? v82.series : "",
    category: typeof v82.category === "string" ? v82.category : "",
    format: v82.format,
    has_display: v82.has_display,
    width: v82.width,
    height: v82.height,
    custom_resolution: false,
    installation_exe_path: typeof v82.installation_exe_path === "string" && v82.installation_exe_path.trim() ? v82.installation_exe_path : v84?.installation_exe_path
  };
}
const pending$1 = new Set();
async function withSoftwareCreation(v85, v86) {
  if (pending$1.has(v85)) {
    return {
      ok: false,
      error: "正在创建工程，请勿重复点击"
    };
  }
  pending$1.add(v85);
  try {
    return await v86();
  } finally {
    pending$1.delete(v85);
  }
}
function readVerifiedWeinviewProject(v87) {
  try {
    const v88 = node_path.join(v87, ".plccode-weinview-project.json");
    const v89 = node_fs.lstatSync(v88);
    if (!v89.isFile() || v89.isSymbolicLink() || v89.size > 8192) {
      return null;
    }
    const v90 = JSON.parse(node_fs.readFileSync(v88, "utf8"));
    if (v90.schema !== 1 || v90.kind !== "weinview-native-delivery" || typeof v90.project_path !== "string" || typeof v90.project_sha256 !== "string" || !/^[a-fA-F0-9]{64}$/.test(v90.project_sha256)) {
      return null;
    }
    const v91 = node_fs.lstatSync(v90.project_path);
    if (!v91.isFile() || v91.isSymbolicLink() || v91.size === 0 || v91.size > 268435456) {
      return null;
    }
    const v92 = node_fs.realpathSync(v90.project_path);
    const v93 = node_path.relative(node_fs.realpathSync(v87), v92);
    if (!v93 || v93.startsWith("..") || node_path.isAbsolute(v93) || ![".emtp", ".cmtp"].includes(node_path.extname(v92).toLowerCase())) {
      return null;
    }
    const v94 = node_crypto.createHash("sha256").update(node_fs.readFileSync(v92)).digest("hex");
    const v95 = v90.project_sha256.toLowerCase();
    return {
      path: v92,
      sha256: v94,
      receiptSha256: v95,
      modifiedSinceReceipt: v94 !== v95
    };
  } catch {
    return null;
  }
}
async function openWeinviewNativeProject(v96, v97) {
  const v98 = readVerifiedWeinviewProject(v97.root);
  if (!v98) {
    return "原厂工程记录或路径无效，请重新选择工程";
  }
  let v99 = v97.project.weinview?.installationExePath?.trim();
  if (!v99 && v96) {
    const v100 = await discoverWeinviewModelCatalog(v96, v97.stagingRoot);
    const v101 = v100.models.filter(v102 => v102.installation_exe_path && (!v97.project.weinview?.modelKey || v102.key === v97.project.weinview.modelKey));
    const v103 = [...new Set(v101.map(v104 => v104.installation_exe_path))];
    if (v100.source === "installed" && v103.length === 1) {
      v99 = v103[0];
    }
  }
  if (!v99) {
    return "此工程尚未确定 EasyBuilder Pro 安装版本，请重新接入工程或选择对应安装版本";
  }
  try {
    if (!node_path.isAbsolute(v99) || node_path.extname(v99).toLowerCase() !== ".exe" || !node_fs.lstatSync(v99).isFile()) {
      return "工程记录中的 EasyBuilder Pro 安装程序不可用，请重新选择安装版本";
    }
  } catch {
    return "找不到此工程使用的 EasyBuilder Pro：" + v99;
  }
  const v105 = v99;
  return new Promise(v106 => {
    const v107 = node_child_process.spawn(v105, [v98.path], {
      cwd: node_path.dirname(v105),
      detached: true,
      stdio: "ignore",
      windowsHide: false
    });
    v107.once("error", v108 => v106("无法打开 EasyBuilder Pro：" + v108.message));
    v107.once("spawn", () => {
      v107.unref();
      v106("");
    });
  });
}
function applyVerifiedWeinviewModel(v109, v110, v111, v112, v113, v114) {
  if (v109.project.vendor !== "weinview" || v109.project.integration !== "weinview_native") {
    throw Error("工程路线发生变化，保留原配置");
  }
  if (v111.has_display ? !Number.isInteger(v112) || !Number.isInteger(v113) || v112 <= 0 || v113 <= 0 : v112 !== null && v112 !== 0 || v113 !== null && v113 !== 0) {
    throw Error("原厂工程尺寸无效，保留原配置");
  }
  if (v111.format !== "emtp" && v111.format !== "cmtp") {
    throw Error("原厂工程格式无效，保留原配置");
  }
  const v115 = v114 ?? (v111.has_display && v113 > v112 ? "vertical" : "horizontal");
  const v116 = v111.installation_exe_path ?? v109.project.weinview?.installationExePath;
  const v117 = [v109.root, v109.stagingRoot].map(v118 => {
    const v119 = node_path.join(v118, "plc-code.project.json");
    const v120 = JSON.parse(node_fs.readFileSync(v119, "utf8").replace(/^\uFEFF/, ""));
    if (v120.vendor !== "weinview" || v120.integration !== "weinview_native") {
      throw Error("工程路线发生变化，保留原配置");
    }
    return {
      path: v119,
      value: {
        ...v120,
        model: v111.name,
        series: v111.series,
        mainFile: node_path.basename(v110),
        main_file: node_path.basename(v110),
        weinview_model_key: v111.key,
        weinview_project_format: v111.format,
        weinview_has_display: v111.has_display,
        weinview_canvas_width: v112,
        weinview_canvas_height: v113,
        weinview_orientation: v115,
        weinview_installation_exe_path: v116
      }
    };
  });
  for (const {
    path: v121,
    value: v122
  } of v117) {
    node_fs.writeFileSync(v121, JSON.stringify(v122, null, 2) + "\n", "utf8");
  }
  v109.project.model = v111.name;
  v109.project.series = v111.series;
  v109.project.mainFile = node_path.basename(v110);
  v109.project.weinview = {
    modelKey: v111.key,
    format: v111.format,
    hasDisplay: v111.has_display,
    width: v112,
    height: v113,
    orientation: v115,
    installationExePath: v116
  };
}
async function adoptWeinviewNativeProject(v123, v124, v125, v126) {
  if (v124.project.integration !== "weinview_native" || v124.project.vendor !== "weinview") {
    throw Error("请先绑定威纶通原厂工程工作区");
  }
  const v127 = await nativeWorkspaceInput(v124, v125, [".cmtp", ".emtp"], 268435456);
  const v128 = node_path.extname(v127).toLowerCase();
  if (v128 !== ".cmtp" && v128 !== ".emtp") {
    throw Error("请选择 .cmtp 或 .emtp 原厂工程文件");
  }
  const v129 = node_crypto.createHash("sha256").update(node_fs.readFileSync(v127)).digest("hex");
  const v130 = node_path.join(v124.root, "Native-Adopted-" + node_crypto.randomUUID() + v128);
  const v131 = {
    ...process.env,
    PLC_CODE_ENABLE_PLC_PROMPT_EXTENSION: "1",
    PLC_CODE_SESSION_WORKSPACE_ROOT: v124.root
  };
  const v132 = await new Promise((v133, v134) => {
    const v135 = node_child_process.spawn(v123, ["weinview_project_adopt"], {
      cwd: v124.stagingRoot,
      env: v131,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let v136 = "";
    const v137 = nativeStderr(v126);
    let v138 = false;
    const v139 = v140 => {
      if (v138) {
        return;
      }
      v138 = true;
      clearTimeout(v141);
      if (v140) {
        v134(v140);
      } else {
        try {
          v133(JSON.parse(v136));
        } catch {
          v134(Error("原厂工程接管未返回有效回执；请检查工程与交付记录，勿直接重试"));
        }
      }
    };
    const v141 = setTimeout(() => {
      v135.kill();
      v139(Error("原厂工程检查超时，结果尚未确认；请检查工程与交付记录，勿直接重试"));
    }, 250000);
    v135.stdout.setEncoding("utf8");
    v135.stderr.setEncoding("utf8");
    v135.stdout.on("data", v142 => {
      v136 += v142;
      if (v136.length > 4194304) {
        v135.kill();
        v139(Error("原厂工程回执超限；请检查工程与交付记录，勿直接重试"));
      }
    });
    v135.stderr.on("data", v143 => v137.push(v143));
    v135.on("error", v139);
    v135.stdin.on("error", v139);
    v135.on("close", v144 => {
      v137.finish();
      v139(v144 !== 0 ? Error(v137.text() || "原厂工程接入未确认完成；工作副本已保留") : undefined);
    });
    v135.stdin.end(JSON.stringify({
      project_path: v127,
      output_path: v130,
      expected_project_sha256: v129,
      exe_path: v124.project.weinview?.installationExePath
    }), "utf8");
  });
  const v145 = v132.data;
  if (v132.ok !== true || v132.schema !== 1 || v132.operation !== "project_adopt" || v132.mutationState !== "completed" || typeof v145?.output_path !== "string" || node_fs.realpathSync(v145.output_path).toLowerCase() !== node_fs.realpathSync(v130).toLowerCase() || v145.delivery_record?.ok !== true) {
    throw Error("原厂工程接管未通过路径和交付回执验证；请检查工程与交付记录，勿直接重试");
  }
  const v146 = readVerifiedWeinviewProject(v124.root);
  if (!v146 || v146.modifiedSinceReceipt || v146.path.toLowerCase() !== node_fs.realpathSync(v130).toLowerCase() || v146.sha256 !== String(v145.output_sha256).toLowerCase()) {
    throw Error("原厂工程文件或哈希未通过验证；请检查工程与交付记录，勿直接重试");
  }
  const v147 = modelFromNativeReceipt(v145, v130);
  try {
    applyVerifiedWeinviewModel(v124, v130, v147, v147.width, v147.height, v145.orientation === "vertical" ? "vertical" : "horizontal");
  } catch (v148) {
    throw Error("原厂接管回执已返回，但工程配置未同步：" + v148.message + "；请检查工程与交付记录，勿直接重试");
  }
  return v146;
}
async function recoverWeinviewRuntimeProject(v149, v150, v151, v152) {
  if (v150.project.integration !== "weinview_native" || v150.project.vendor !== "weinview") {
    throw Error("请先绑定威纶通原厂工程工作区");
  }
  const v153 = await nativeWorkspaceInput(v150, v151, [".cxob", ".exob"], 536870912);
  if (![".cxob", ".exob"].includes(node_path.extname(v153).toLowerCase())) {
    throw Error("请选择 .cxob 或 .exob 原厂运行文件");
  }
  const v154 = {
    ...process.env,
    PLC_CODE_ENABLE_PLC_PROMPT_EXTENSION: "1",
    PLC_CODE_SESSION_WORKSPACE_ROOT: v150.root
  };
  const v155 = await new Promise((v156, v157) => {
    const v158 = node_child_process.spawn(v149, ["weinview_project_recover"], {
      cwd: v150.stagingRoot,
      env: v154,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let v159 = "";
    const v160 = nativeStderr(v152);
    let v161 = false;
    const v162 = v163 => {
      if (v161) {
        return;
      }
      v161 = true;
      clearTimeout(v164);
      if (v163) {
        v157(v163);
      } else {
        try {
          v156(JSON.parse(v159));
        } catch {
          v157(Error("原厂运行文件恢复未返回有效回执；请检查恢复工程与交付记录，勿直接重试"));
        }
      }
    };
    const v164 = setTimeout(() => {
      v158.kill();
      v162(Error("原厂结构分析超时，恢复结果尚未确认；请检查工程与交付记录，勿直接重试"));
    }, 250000);
    v158.stdout.setEncoding("utf8");
    v158.stderr.setEncoding("utf8");
    v158.stdout.on("data", v165 => {
      v159 += v165;
      if (v159.length > 4194304) {
        v158.kill();
        v162(Error("原厂恢复回执超限；请检查工程与交付记录，勿直接重试"));
      }
    });
    v158.stderr.on("data", v166 => v160.push(v166));
    v158.on("error", v162);
    v158.stdin.on("error", v162);
    v158.on("close", v167 => {
      v160.finish();
      v162(v167 !== 0 ? Error(v160.text() || "原厂结构分析尚未确认完成；工作副本已保留") : undefined);
    });
    v158.stdin.end(JSON.stringify({
      runtime_path: v153,
      exe_path: v150.project.weinview?.installationExePath
    }), "utf8");
  });
  const v168 = v155.data;
  if (v155.ok !== true || v155.schema !== 1 || v155.operation !== "project_recover" || v155.mutationState !== "completed" || typeof v168?.project_path !== "string" || typeof v168?.project_sha256 !== "string" || v168.delivery_record?.ok !== true) {
    throw Error("原厂结构分析或工程接续未通过验证；请检查工程与交付记录，勿直接重试");
  }
  const v169 = readVerifiedWeinviewProject(v150.root);
  if (!v169 || v169.modifiedSinceReceipt || v169.path.toLowerCase() !== node_fs.realpathSync(v168.project_path).toLowerCase() || v169.sha256 !== String(v168.project_sha256).toLowerCase()) {
    throw Error("恢复工程文件或哈希未通过验证；请检查工程与交付记录，勿直接重试");
  }
  const v170 = modelFromNativeReceipt(v168, v169.path);
  applyVerifiedWeinviewModel(v150, v169.path, v170, v170.width, v170.height, v168.orientation === "vertical" ? "vertical" : "horizontal");
  return v169;
}
const PYTHON_BIN = process.platform === "win32" ? "python.exe" : "python3";
function portablePythonPrefixFor(v171, v172 = node_fs.existsSync) {
  if (!v171 || v171.trim().length === 0) {
    return {};
  }
  const v173 = node_path.join(node_path.dirname(v171), "python", PYTHON_BIN);
  if (!v172(v173)) {
    return {};
  }
  return {
    pathPrefix: node_path.dirname(v173),
    pythonExe: v173
  };
}
function applyPortablePythonEnv(v174, v175) {
  if (!v175.pathPrefix || !v175.pythonExe) {
    return false;
  }
  const v176 = Object.keys(v174).find(v177 => v177.toUpperCase() === "PATH") ?? "PATH";
  const v178 = v174[v176];
  v174[v176] = v178 && v178.length > 0 ? "" + v175.pathPrefix + node_path.delimiter + v178 : v175.pathPrefix;
  v174.PYTHON = v175.pythonExe;
  return true;
}
function ragAccountServer(v179) {
  const v180 = v179.trim().replace(/\/+$/, "");
  if (["http://127.0.0.1:5173", "http://localhost:5173"].includes(v180)) {
    return "";
  }
  return v180;
}
function createRagLease(v181) {
  const v182 = node_path.join(v181, "rag-leases");
  node_fs.mkdirSync(v182, {
    recursive: true
  });
  const v183 = node_path.join(v182, node_crypto.randomUUID() + ".lease");
  node_fs.writeFileSync(v183, "active", {
    encoding: "utf8",
    mode: 384,
    flag: "wx"
  });
  return {
    path: v183,
    revoke: () => {
      try {
        node_fs.unlinkSync(v183);
      } catch {}
    }
  };
}
const REPORT_LIMIT = 20;
function createEngineFailureRecorder(v184) {
  const v185 = [...new Set((v184.secrets ?? []).filter(v186 => v186.length >= 4))].flatMap(v187 => [v187, encodeURIComponent(v187)]).sort((v188, v189) => v189.length - v188.length);
  const v190 = v191 => {
    let v192 = v191.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
    for (const v193 of v185) {
      v192 = v192.split(v193).join("[REDACTED]");
    }
    return v192.replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+\/-]+=*/gi, "$1 [REDACTED]").replace(/((?:api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|password|secret|token)["']?\s*[:=]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;&}]+)/gi, "$1[REDACTED]").replace(/\bsk-[A-Za-z0-9_-]{8,}/g, "[REDACTED]").replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED]").replace(/(https?:\/\/)[^\s/@]+:[^\s/@]+@/gi, "$1[REDACTED]@");
  };
  let v194 = "";
  return {
    append(v195) {
      const v196 = v190(v195);
      v194 = ("" + v194 + v196 + "\n").slice(-8192);
      return v196;
    },
    failure(v197) {
      const v198 = {
        occurredAt: new Date().toISOString(),
        appVersion: v184.appVersion ?? "unknown",
        phase: v197.phase,
        exitCode: v197.exitCode ?? null,
        signal: v197.signal ?? null,
        errorCode: v197.error?.code ?? null,
        errorMessage: v190(v197.error?.message ?? "").slice(0, 2000),
        stderrTail: v194,
        enginePath: v184.enginePath,
        cwd: v184.cwd,
        system: process.platform + " " + node_os.release() + " " + process.arch,
        reportPath: null
      };
      try {
        const v199 = node_path.join(v184.runtimeHome, "crash");
        node_fs.mkdirSync(v199, {
          recursive: true
        });
        const v200 = "engine-failure-" + v198.occurredAt.replace(/[:.]/g, "-") + "-" + node_crypto.randomUUID() + ".json";
        const v201 = node_path.join(v199, v200);
        v198.reportPath = v201;
        node_fs.writeFileSync(v201, JSON.stringify(v198, null, 2) + "\n", {
          encoding: "utf-8",
          mode: 384
        });
        const v202 = node_fs.readdirSync(v199).filter(v203 => /^engine-failure-[\w-]+\.json$/.test(v203)).sort();
        for (const v204 of v202.slice(0, Math.max(0, v202.length - REPORT_LIMIT))) {
          try {
            node_fs.unlinkSync(node_path.join(v199, v204));
          } catch {}
        }
      } catch {
        v198.reportPath = null;
      }
      return v198;
    }
  };
}
class EngineBridge extends node_events.EventEmitter {
  ragLease;
  invalidateRagAccess() {
    this.ragLease?.revoke();
    this.ragLease = undefined;
  }
  key;
  child = null;
  writeQueue = [];
  writing = false;
  disposed = false;
  gotShutdownAck = false;
  ended = false;
  reachedReady = false;
  startupTimer;
  _cwd = null;
  requestedResumeSessionId;
  readySessionId;
  get sessionId() {
    return this.readySessionId ?? this.requestedResumeSessionId;
  }
  get cwd() {
    return this._cwd;
  }
  constructor(v205) {
    super();
    this.key = v205;
  }
  get pid() {
    return this.child?.pid;
  }
  get isAlive() {
    return !!this.child?.pid && this.child.exitCode == null && !this.disposed && !this.ended;
  }
  _turnInFlight = false;
  _pendingQuestion = false;
  get isIdle() {
    return !this._turnInFlight && !this._pendingQuestion;
  }
  spawnProcess(v206) {
    if (this.child) {
      throw new Error("EngineBridge[" + this.key + "] already spawned");
    }
    this._cwd = v206.cwd;
    this.requestedResumeSessionId = v206.resumeSessionId;
    const v207 = [];
    if (v206.model) {
      v207.push("--model", v206.model);
    }
    if (v206.permissionMode) {
      v207.push("--permission-mode", v206.permissionMode);
    }
    if (v206.reasoningEffort && v206.reasoningEffort !== "auto") {
      v207.push("--reasoning-effort", v206.reasoningEffort);
    }
    v207.push("bridge");
    const v208 = {
      ...process.env,
      PLC_CODE_ENABLE_PLC_PROMPT_EXTENSION: "1",
      PLC_CODE_SKIP_PROJECT_INSTRUCTIONS: "1",
      PLC_CODE_RUNTIME_HOME: v206.runtimeHome
    };
    if (v206.claudeConfigDir) {
      v208.CLAUDE_CONFIG_DIR = v206.claudeConfigDir;
    }
    if (v206.desktopMcpConfig) {
      v208.PLC_CODE_DESKTOP_MCP_CONFIG = v206.desktopMcpConfig;
    }
    if (v206.sessionWorkspaceRoot && v206.sessionWorkspaceRoot !== v206.cwd) {
      v208.PLC_CODE_SESSION_WORKSPACE_ROOT = v206.sessionWorkspaceRoot;
    }
    if (v206.resumeSessionId) {
      v208.PLC_CODE_BRIDGE_RESUME_SESSION = v206.resumeSessionId;
    }
    if (typeof v206.autoCompactThreshold === "number" && Number.isFinite(v206.autoCompactThreshold) && v206.autoCompactThreshold > 0) {
      v208.CLAUDE_CODE_AUTO_COMPACT_INPUT_TOKENS = String(Math.round(v206.autoCompactThreshold));
    }
    if (v206.httpProxy && v206.httpProxy.trim().length > 0) {
      v208.PLC_CODE_HTTP_PROXY = v206.httpProxy.trim();
    }
    if (v206.located.bridgeExePath) {
      v208.PLC_CODE_TIA_OPENNESS_BRIDGE_EXE = v206.located.bridgeExePath;
    }
    if (v206.routeEnv) {
      Object.assign(v208, v206.routeEnv);
    }
    if (v206.model) {
      v208.PLC_CODE_AGENT_MODEL = v206.model;
    }
    if (v206.visionModelsEnv && v206.visionModelsEnv.trim().length > 0) {
      v208.PLC_CODE_VISION_MODELS = v206.visionModelsEnv.trim();
    }
    if (v206.visionModelEnv && v206.visionModelEnv.trim().length > 0) {
      v208.PLC_CODE_VISION_MODEL = v206.visionModelEnv.trim();
    }
    if (v206.availableModelsEnv && v206.availableModelsEnv.trim().length > 0) {
      v208.PLC_CODE_AVAILABLE_MODELS = v206.availableModelsEnv.trim();
    }
    if (v206.thinkingTiersEnv && v206.thinkingTiersEnv.trim().length > 0) {
      v208.PLC_CODE_THINKING_TIERS = v206.thinkingTiersEnv.trim();
    }
    if (v206.thinkingKindsEnv && v206.thinkingKindsEnv.trim().length > 0) {
      v208.PLC_CODE_THINKING_KINDS = v206.thinkingKindsEnv.trim();
    }
    if (v206.thinkingFieldsEnv && v206.thinkingFieldsEnv.trim().length > 0) {
      v208.PLC_CODE_THINKING_FIELDS = v206.thinkingFieldsEnv.trim();
    }
    delete v208.ANTHROPIC_API_KEY;
    delete v208.ANTHROPIC_BASE_URL;
    const v209 = (v206.accountServer ?? "").trim();
    const v210 = (v206.accountToken ?? "").trim();
    delete v208.PLC_CODE_RAG_SERVER;
    delete v208.PLC_CODE_RAG_ACCOUNT_TOKEN;
    delete v208.PLC_CODE_RAG_SESSION_GUARD;
    if (v210.length > 0 && v209.length > 0) {
      try {
        this.ragLease = createRagLease(v206.runtimeHome);
        v208.PLC_CODE_RAG_SESSION_GUARD = this.ragLease.path;
        v208.PLC_CODE_RAG_SERVER = ragAccountServer(v209);
        v208.PLC_CODE_RAG_ACCOUNT_TOKEN = v210;
      } catch {}
    }
    if (v210.length > 0 && v209.length > 0) {
      v208.OPENAI_API_KEY = v210;
      v208.OPENAI_BASE_URL = v209 + "/v1";
    } else {
      delete v208.OPENAI_API_KEY;
      delete v208.OPENAI_BASE_URL;
    }
    applyPortablePythonEnv(v208, portablePythonPrefixFor(v206.located.enginePath));
    const v211 = createEngineFailureRecorder({
      runtimeHome: v206.runtimeHome,
      enginePath: v206.located.enginePath,
      cwd: v206.cwd,
      appVersion: v206.appVersion,
      secrets: [v210, ...Object.entries(v208).filter(([v212]) => /(?:KEY|TOKEN|PASSWORD|SECRET|AUTHORIZATION)$/i.test(v212)).map(([, v213]) => v213 ?? "")]
    });
    let v214;
    const v215 = node_child_process.spawn(v206.located.enginePath, v207, {
      cwd: v206.cwd,
      env: v208,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    this.child = v215;
    const v216 = node_readline.createInterface({
      input: v215.stdout
    });
    v216.on("line", v217 => this.handleStdoutLine(v217));
    const v218 = node_readline.createInterface({
      input: v215.stderr
    });
    v218.on("line", v219 => this.emit("stderr", v211.append(v219)));
    v215.once("close", (v220, v221) => {
      this.ended = true;
      clearTimeout(this.startupTimer);
      this.writeQueue = [];
      this.writing = false;
      this.invalidateRagAccess();
      const v222 = !this.disposed && !this.gotShutdownAck;
      const v223 = v222 ? v211.failure({
        phase: this.reachedReady ? "running" : "startup",
        exitCode: v220,
        signal: v221,
        error: v214
      }) : undefined;
      this.emit("closed", {
        crashed: v222,
        code: v220,
        diagnostic: v223
      });
    });
    v215.on("error", v224 => {
      v214 = v224;
      this.invalidateRagAccess();
      this.emit("stderr", v211.append("[spawn error] " + String(v224)));
    });
    v215.stdin.on("error", v225 => {
      v214 ??= v225;
      this.writeQueue = [];
      if (this.isAlive) {
        v215.kill();
      }
    });
    this.startupTimer = setTimeout(() => {
      if (this.disposed || this.ended || this.reachedReady) {
        return;
      }
      v214 = Object.assign(new Error("会话组件启动超时，未收到就绪确认。"), {
        code: "ENGINE_READY_TIMEOUT"
      });
      v215.kill();
    }, v206.startupTimeoutMs ?? 60000);
    this.startupTimer.unref();
  }
  handleStdoutLine(v226) {
    if (this.disposed) {
      return;
    }
    const v227 = v226.trim();
    if (v227.length === 0) {
      return;
    }
    let v228;
    try {
      v228 = JSON.parse(v227);
    } catch {
      this.emit("malformed", v227);
      return;
    }
    if (v228.type === "shutdown") {
      this.gotShutdownAck = true;
    }
    const v229 = v228.type;
    if (v229 === "ready") {
      this.reachedReady = true;
      clearTimeout(this.startupTimer);
      const v230 = v228.session_id;
      if (v230) {
        this.readySessionId = v230;
      }
    } else if (v229 === "turn") {
      this._turnInFlight = false;
      this._pendingQuestion = false;
    } else if (v229 === "event") {
      const v231 = v228.event;
      if (v231 === "question") {
        this._pendingQuestion = true;
      } else if (v231 === "question_cleared") {
        this._pendingQuestion = false;
      }
    }
    this.emit("stdout", v228);
  }
  send(v232) {
    if (!this.child || this.disposed || this.ended) {
      return;
    }
    if ("prompt" in v232) {
      this._turnInFlight = true;
    }
    this.writeQueue.push(JSON.stringify(v232) + "\n");
    this.pump();
  }
  pump() {
    if (this.writing || !this.child) {
      return;
    }
    const v233 = this.writeQueue.shift();
    if (v233 === undefined) {
      return;
    }
    this.writing = true;
    this.child.stdin.write(v233, () => {
      this.writing = false;
      if (this.writeQueue.length > 0) {
        this.pump();
      }
    });
  }
  dispose() {
    this.invalidateRagAccess();
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    clearTimeout(this.startupTimer);
    this.child?.kill();
  }
  async stopGracefully(v234 = 2000) {
    this.invalidateRagAccess();
    if (!this.child || this.disposed || this.ended) {
      return;
    }
    this.send({
      command: "cancel",
      scope: "all"
    });
    this.send({
      command: "shutdown"
    });
    await new Promise(v235 => {
      const v236 = this.child;
      const v237 = setTimeout(() => {
        this.disposed = true;
        v236.kill();
        v235();
      }, v234);
      v236.once("exit", () => {
        clearTimeout(v237);
        this.disposed = true;
        v235();
      });
    });
  }
}
function computerUseMcpConfig(v238) {
  if ((v238.platform ?? process.platform) !== "win32") {
    return {};
  }
  const v239 = v238.resourcesPath ? node_path.join(v238.resourcesPath, "computer-use") : v238.repoRoot ? node_path.join(v238.repoRoot, "tools", "windows-computer-use") : "";
  const v240 = node_path.join(v239, "mcp", "server.mjs");
  if (!v239 || !node_fs.existsSync(v240) || !node_fs.existsSync(node_path.join(v239, "scripts", "windows-uia.ps1"))) {
    throw new Error("Computer Use 组件缺失，请重新安装 PLCCode。");
  }
  return {
    computer_use: {
      type: "stdio",
      command: v238.executable,
      args: [v240],
      env: {
        ELECTRON_RUN_AS_NODE: "1",
        WINDOWS_COMPUTER_USE_SCOPE: "active_window"
      }
    }
  };
}
const record$1 = v241 => v241 && typeof v241 === "object" ? v241 : {};
const inputRecord = v242 => {
  if (typeof v242 === "string") {
    try {
      return record$1(JSON.parse(v242));
    } catch {
      return {};
    }
  }
  return record$1(v242);
};
function isComputerUseTool(v243) {
  return typeof v243 === "string" && /(?:^|__)windows_computer_use_[a-z_]+$/.test(v243);
}
class ComputerUseActivity {
  constructor(v244, v245 = () => {}) {
    this.changed = v244;
    this.captureChanged = v245;
  }
  changed;
  captureChanged;
  sessions = new Set();
  captures = new Map();
  requests = new Map();
  stopped = new Set();
  visible = false;
  capturing = false;
  begin(v246, v247) {
    this.clear(v246);
    this.stopped.delete(v246);
    this.requests.set(v246, v247);
  }
  cancel(v248) {
    this.stopped.add(v248);
    this.clear(v248);
  }
  receive(v249, v250) {
    const v251 = record$1(v250);
    if (this.stopped.has(v249)) {
      return;
    }
    if (v251.type === "event" && v251.event === "background_report_start") {
      this.begin(v249, v251.id);
    }
    if (!this.requests.has(v249)) {
      return;
    }
    if (v251.id !== undefined && v251.id !== this.requests.get(v249)) {
      return;
    }
    if (v251.type === "turn" || v251.type === "error" || v251.type === "shutdown_ack") {
      this.clear(v249);
      return;
    }
    if (v251.type !== "event") {
      return;
    }
    if (v251.event === "question") {
      this.clear(v249, false);
      return;
    }
    const v252 = record$1(v251.payload);
    if (v251.event === "tool_result") {
      const v253 = this.captures.get(v249);
      v253?.delete(String(v252.tool_use_id ?? v252.id ?? ""));
      if (v253?.size === 0) {
        this.captures.delete(v249);
      }
      this.publishCapture();
      return;
    }
    let v254 = v252.name;
    let v255 = inputRecord(v252.input);
    if (v254 === "MCPTool") {
      v254 = v255.qualifiedName ?? v255.qualified_name ?? v255.tool;
      v255 = inputRecord(v255.arguments ?? v255.args);
    }
    if (v251.event === "tool_start" && isComputerUseTool(v254)) {
      this.sessions.add(v249);
      this.publish();
      if (String(v254).endsWith("windows_computer_use_snapshot") && v255.includeScreenshot !== false) {
        const v256 = this.captures.get(v249) ?? new Set();
        v256.add(String(v252.id ?? v252.tool_use_id ?? ""));
        this.captures.set(v249, v256);
        this.publishCapture();
      }
    }
  }
  clear(v257, v258 = true) {
    if (v258) {
      this.requests.delete(v257);
    }
    this.sessions.delete(v257);
    this.captures.delete(v257);
    this.publishCapture();
    this.publish();
  }
  clearAll() {
    this.requests.clear();
    this.stopped.clear();
    this.sessions.clear();
    this.captures.clear();
    this.publishCapture();
    this.publish();
  }
  publish() {
    const v259 = this.sessions.size > 0;
    if (v259 === this.visible) {
      return;
    }
    this.visible = v259;
    this.changed(v259);
  }
  publishCapture() {
    const v260 = this.captures.size > 0;
    if (v260 === this.capturing) {
      return;
    }
    this.capturing = v260;
    this.captureChanged(v260);
  }
}
const COMPUTER_USE_FRAME_HTML = "<!doctype html><html><head><meta charset=\"utf-8\">\n<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'\">\n<style>\nhtml,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent;pointer-events:none}\n.frame{position:fixed;inset:0;border:3px solid transparent;border-radius:13px;\n background:linear-gradient(125deg,#3d8bff,#7960ff 40%,#c260ff 70%,#427fff) border-box;\n mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);mask-composite:exclude;\n background-size:240% 240%;animation:flow 4s ease-in-out infinite alternate}\n.glow{position:fixed;inset:2px;border-radius:12px;\n box-shadow:inset 0 0 13px 2px #7566ff80,inset 0 0 3px #5998ff;animation:breathe 2.6s ease-in-out infinite alternate}\n@keyframes flow{from{background-position:0% 30%}to{background-position:100% 70%}}\n@keyframes breathe{from{opacity:.6}to{opacity:1}}\n@media(prefers-reduced-motion:reduce){.frame,.glow{animation:none}}\n</style></head><body aria-hidden=\"true\"><div class=\"glow\"></div><div class=\"frame\"></div></body></html>";
class ComputerUseIndicator {
  constructor(v261 = () => []) {
    this.captureWindows = v261;
    electron.screen.on("display-added", this.displaysChanged);
    electron.screen.on("display-removed", this.displaysChanged);
    electron.screen.on("display-metrics-changed", this.displaysChanged);
  }
  captureWindows;
  windows = new Map();
  active = false;
  disposed = false;
  capturing = false;
  protectedWindows = new Map();
  activity = new ComputerUseActivity(active => {
    this.active = active;
    if (active) {
      this.refresh();
    } else {
      for (const window of this.windows.values()) {
        if (!window.isDestroyed()) {
          window.hide();
        }
      }
    }
  }, capturing => this.setCapturing(capturing));
  displaysChanged = () => {
    if (this.active) {
      this.refresh();
    }
  };
  setCapturing(v262) {
    this.capturing = v262;
    if (v262) {
      for (const v263 of [...this.captureWindows(), ...this.windows.values()]) {
        this.protect(v263);
      }
    } else {
      for (const [v264, v265] of this.protectedWindows) {
        if (!v264.isDestroyed()) {
          v264.setContentProtection(v265);
        }
      }
      this.protectedWindows.clear();
    }
  }
  protect(v266) {
    if (v266.isDestroyed() || this.protectedWindows.has(v266)) {
      return;
    }
    this.protectedWindows.set(v266, v266.isContentProtected());
    v266.setContentProtection(true);
  }
  dispose() {
    this.disposed = true;
    this.activity.clearAll();
    electron.screen.removeListener("display-added", this.displaysChanged);
    electron.screen.removeListener("display-removed", this.displaysChanged);
    electron.screen.removeListener("display-metrics-changed", this.displaysChanged);
    for (const v267 of this.windows.values()) {
      if (!v267.isDestroyed()) {
        v267.destroy();
      }
    }
    this.windows.clear();
  }
  refresh() {
    if (this.disposed) {
      return;
    }
    const v268 = electron.screen.getAllDisplays();
    const v269 = new Set(v268.map(v270 => v270.id));
    for (const [v271, v272] of this.windows) {
      if (!v269.has(v271) || v272.isDestroyed()) {
        if (!v272.isDestroyed()) {
          v272.destroy();
        }
        this.windows.delete(v271);
      }
    }
    for (const v273 of v268) {
      let v274 = this.windows.get(v273.id);
      if (v274) {
        v274.setBounds(v273.bounds);
        if (!v274.webContents.isLoading()) {
          v274.showInactive();
        }
        continue;
      }
      v274 = new electron.BrowserWindow({
        ...v273.bounds,
        title: "PLCCode Computer Use Indicator",
        frame: false,
        transparent: true,
        backgroundColor: "#00000000",
        show: false,
        focusable: false,
        skipTaskbar: true,
        hasShadow: false,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        fullscreen: true,
        roundedCorners: false,
        webPreferences: {
          sandbox: true,
          contextIsolation: true,
          nodeIntegration: false,
          devTools: false
        }
      });
      v274.setIgnoreMouseEvents(true);
      v274.setAlwaysOnTop(true, "screen-saver");
      this.windows.set(v273.id, v274);
      if (this.capturing) {
        this.protect(v274);
      }
      const v275 = v274;
      v275.once("ready-to-show", () => {
        if (this.active && !this.disposed && !v275.isDestroyed()) {
          v275.showInactive();
        }
      });
      v275.webContents.setWindowOpenHandler(() => ({
        action: "deny"
      }));
      v275.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(COMPUTER_USE_FRAME_HTML)).catch(v276 => {
        console.error("[computer-use indicator]", v276);
        if (!v275.isDestroyed()) {
          v275.destroy();
        }
      });
    }
  }
}
function engineOsErrorCode(v277) {
  let v278 = null;
  for (const v279 of (v277 ?? "").matchAll(/^error:[^\r\n]*\(os error (\d{1,5})\)[^\r\n]*$/gm)) {
    const v280 = Number(v279[1]);
    if (v280 > 0 && v280 <= 65535) {
      v278 = v280;
    }
  }
  return v278;
}
const DEFAULT_ACCOUNT_SERVER = "";
const LOGGED_OUT_STATE = {
  isLoggedIn: false,
  phone: "",
  name: "",
  tokenBalance: 0,
  balance: 0,
  usageTokens: 0,
  usageRequests: 0,
  usageAmount: 0,
  rechargeTotal: 0,
  exchangedTokens: 0,
  createdAt: "",
  lastLoginAt: ""
};
const DEFAULT_RELEASE_NOTES = {
  "2.1.10": ["订阅升级或用量耗尽后购买可立即开启新周期，原套餐剩余用量保留；同档续订仍可顺延。", "已购买的待生效套餐增加立即启用入口，重复操作不会重复扣费或重复计算剩余用量。", "订阅用量条改为显示剩余用量，开通时满格，随消耗递减。", "DS-PLC 默认上下文窗口调整为 300k，自动压缩保留输出余量，并保留已有自定义设置。"],
  "2.1.9": ["新增月订阅 Plus / Pro / Max / 15× Plus，支持直接购买、可选钱包余额抵扣与续订顺延。", "Plus 可获得同价钱包余额 3 倍的用量；套餐用量以百分比展示。", "模型入口统一为唯一 DS-PLC，保留已有钱包余额与用量记录。", "新增汇川 AutoShop 文本代码路线（LiteST / IL）；不支持梯形图写入，编译通过不代表真实 PLC 已验收。", "优化侧栏分隔与思考强度控件的布局、居中和黑白中性色。"],
  "2.1.8": ["修复部分 Windows 环境下会话启动出现“设备未就绪（错误 21）”的问题。", "完善启动失败的错误提示和诊断反馈，帮助准确定位存储设备访问异常。", "上线维修动画公告：打开后自动播放一次，结束停留，无播放或重播按钮。"],
  "2.1.7": ["修复点击选择 PDF 等文件后，附件未加入对话的问题。", "优化会话启动与登录后恢复，故障原因和重试入口更清楚。", "新增会话故障一键反馈：在输入框上方点击发送诊断，可在反馈记录查看处理回复。", "公告栏与详情统一改版，支持图片、动图、视频及动画公告。"],
  "2.1.6": ["博途连接新增分步诊断、修复入口和 AI 排查信息，明确阻塞原因与下一步操作。", "修复汇川/CODESYS 操作结束后界面仍被锁住的问题；升级后请保存工程并重启对应 IDE。", "安装向导支持选择安装目录，自动更新保留原安装位置。", "优化工具按需加载与异常恢复，修复连接状态误判、完整工程路径匹配和多会话协作问题。"],
  "2.1.5": ["HMI 批量创建与修改减少重复编译，改善逐个控件处理偏慢的问题。", "修复 Unified 按钮事件、状态灯颜色和监控字段读写配置，完善连接与脚本回读。", "新增内置 HMI 设计指导，统一背景分组、间距、字号与标签左对齐，减少画面拥挤。", "完善 PLC 代码生成指导：停止优先、故障恢复、有效完成计数、PID 模式及测量有效性。", "修复 Windows 换行导致的文件编辑失败、多行文本误报、属性读取超时及编译结果误判。"],
  "2.1.0": ["深度优化工作流，执行速度更快", "修复西门子SCL相关缺陷", "新增汇川InoProShop的Lad ST与仿真的支持", "新增Codesys的Lad ST与仿真的支持", "修复西门子设备组态相关缺陷"]
};
const LEGACY_POINTS_PER_YUAN = 100;
function yuanToPoints(v281, v282) {
  return Math.round(Math.round(v281 * 10000) * v282) / 10000;
}
const finite = v283 => typeof v283 === "number" && Number.isFinite(v283) && v283 >= 0;
function readAccountPoints() {
  return {
    pointsBalance: 0,
    pointsPerYuan: 100,
    pointsUsageAmount: 0,
    pointsRechargeTotal: 0,
    source: "byok"
  };
}
const MONTHLY_PLANS = [{
  id: "trial",
  priceYuan: 20,
  quotaTokens: 100000000
}, {
  id: "standard",
  priceYuan: 59,
  quotaTokens: 300000000
}, {
  id: "professional",
  priceYuan: 129,
  quotaTokens: 700000000
}, {
  id: "high_usage",
  priceYuan: 249,
  quotaTokens: 1500000000
}];
const safeCount = v284 => typeof v284 === "number" && Number.isSafeInteger(v284) && v284 >= 0;
const record = v285 => !!v285 && typeof v285 === "object" && !Array.isArray(v285);
const validDay = v286 => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v286)) {
    return false;
  }
  const v287 = new Date(v286 + "T00:00:00Z");
  return Number.isFinite(v287.getTime()) && v287.toISOString().slice(0, 10) === v286;
};
const validInstant = v288 => typeof v288 === "string" && validDay(v288.slice(0, 10)) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v288) && Number.isFinite(Date.parse(v288));
function parseMonthlySubscription(v289) {
  if (v289 === undefined) {
    return undefined;
  }
  const v290 = {
    status: "unavailable",
    planId: null,
    quotaTokens: null,
    usedTokens: null,
    periodStart: null,
    periodEnd: null
  };
  if (!record(v289) || v289.schema !== 1) {
    return v290;
  }
  const v291 = Array.isArray(v289.upcoming) && v289.upcoming.length <= 24 ? v289.upcoming.flatMap(v292 => {
    if (!record(v292) || !MONTHLY_PLANS.some(v293 => v293.id === v292.planId) || typeof v292.planName !== "string" || v292.planName.length > 80 || !validInstant(v292.periodStart) || !validInstant(v292.periodEnd) || Date.parse(v292.periodEnd) <= Date.parse(v292.periodStart)) {
      return [];
    }
    return [{
      id: typeof v292.id === "string" && /^membership_[\w-]{8,100}$/.test(v292.id) ? v292.id : undefined,
      planId: v292.planId,
      planName: v292.planName,
      periodStart: v292.periodStart,
      periodEnd: v292.periodEnd,
      canActivateNow: v292.canActivateNow === true,
      activationRequested: v292.activationRequested === true
    }];
  }) : undefined;
  if (v289.status === "none") {
    return {
      ...v290,
      status: "none",
      upcoming: v291
    };
  }
  const v294 = MONTHLY_PLANS.find(v295 => v295.id === v289.planId);
  if (!v294 || v289.status !== "active" && v289.status !== "expired" || !safeCount(v289.quotaTokens) || v289.quotaTokens === 0 || !safeCount(v289.usedTokens)) {
    return v290;
  }
  if (!validInstant(v289.periodStart) || !validInstant(v289.periodEnd)) {
    return v290;
  }
  const v296 = Date.parse(v289.periodStart);
  const v297 = Date.parse(v289.periodEnd);
  if (!Number.isFinite(v296) || !Number.isFinite(v297) || v297 <= v296) {
    return v290;
  }
  return {
    status: v289.status,
    planId: v294.id,
    quotaTokens: v289.quotaTokens,
    usedTokens: v289.usedTokens,
    periodStart: v289.periodStart,
    periodEnd: v289.periodEnd,
    membershipId: typeof v289.membershipId === "string" ? v289.membershipId : undefined,
    upcoming: v291
  };
}
function parseMonthlyPlanOffers(v298) {
  if (v298 === undefined) {
    return undefined;
  }
  if (!Array.isArray(v298) || v298.length !== MONTHLY_PLANS.length) {
    return undefined;
  }
  const v299 = [];
  for (const v300 of v298) {
    if (!record(v300) || !MONTHLY_PLANS.some(v301 => v301.id === v300.id) || typeof v300.priceYuan !== "number" || !Number.isFinite(v300.priceYuan) || v300.priceYuan <= 0 || v300.priceYuan > 100000 || Math.round(v300.priceYuan * 100) / 100 !== v300.priceYuan) {
      return undefined;
    }
    if (v299.some(v302 => v302.id === v300.id)) {
      return undefined;
    }
    v299.push({
      id: v300.id,
      priceYuan: v300.priceYuan
    });
  }
  if (v299.length === MONTHLY_PLANS.length) {
    return v299;
  } else {
    return undefined;
  }
}
function parseUsageDays(v303) {
  if (v303 === undefined) {
    return undefined;
  }
  if (!Array.isArray(v303) || v303.length > 400) {
    return undefined;
  }
  const v304 = new Map();
  let v305 = 0;
  let v306 = 0;
  for (const v307 of v303) {
    if (!record(v307) || typeof v307.date !== "string" || !validDay(v307.date) || !safeCount(v307.tokens) || !safeCount(v307.requests)) {
      return undefined;
    }
    v305 += v307.tokens;
    v306 += v307.requests;
    if (!safeCount(v305) || !safeCount(v306)) {
      return undefined;
    }
    const v308 = v304.get(v307.date);
    const v309 = {
      date: v307.date,
      tokens: v307.tokens + (v308?.tokens ?? 0),
      requests: v307.requests + (v308?.requests ?? 0)
    };
    if (!safeCount(v309.tokens) || !safeCount(v309.requests)) {
      return undefined;
    }
    v304.set(v307.date, v309);
  }
  return [...v304.values()].sort((v310, v311) => v310.date.localeCompare(v311.date));
}
function escapeWireField(v312) {
  return (v312 ?? "").replace(/\\/g, "\\\\").replace(/,/g, "\\c").replace(/\|/g, "\\p");
}
function isWireSafeKey(v313) {
  return v313.trim().length > 0 && !/[\x00-\x1f\x7f]/.test(v313);
}
function formatAvailableModels(v314) {
  return v314.filter(v315 => v315.key.trim().length > 0).map(v316 => {
    const v317 = v316.label.trim().length === 0 ? v316.key : v316.label;
    return escapeWireField(v316.key) + "|" + escapeWireField(v317) + "|" + (v316.vision ? "v1" : "v0");
  }).join(",");
}
const OFFLINE_MODEL_KEYS = ["openai/deepseek-v4.1-flash"];
const OFFLINE_VISION_FALLBACK = {
  "openai/deepseek-v4.1-flash": true
};
function knownModelVision(v318) {
  if (v318.toLowerCase() === "openai/deepseek-v4.1-flash") {
    return true;
  } else {
    return undefined;
  }
}
function orderedKeys(v319) {
  const v320 = new Set([...v319].filter(v321 => v321.length > 0));
  const v322 = [];
  for (const v323 of OFFLINE_MODEL_KEYS) {
    if (v320.delete(v323)) {
      v322.push(v323);
    }
  }
  v322.push(...[...v320].sort());
  return v322;
}
function resolveVisionAll(v324) {
  if (v324.length === 0) {
    return null;
  }
  const v325 = {};
  const v326 = new Set();
  for (const v327 of v324) {
    const v328 = v327.key.trim();
    if (v328.length === 0 || v326.has(v328)) {
      continue;
    }
    v326.add(v328);
    if (knownModelVision(v328)) {
      v325[v328] = true;
    } else if (v327.vision !== undefined) {
      v325[v328] = v327.vision;
    } else if (v328 in OFFLINE_VISION_FALLBACK) {
      v325[v328] = OFFLINE_VISION_FALLBACK[v328];
    }
  }
  for (const v329 of OFFLINE_MODEL_KEYS) {
    if (!(v329 in v325)) {
      v325[v329] = OFFLINE_VISION_FALLBACK[v329] ?? false;
    }
  }
  return v325;
}
function formatVisionModelsEnv(v330) {
  return orderedKeys(Object.keys(v330)).filter(isWireSafeKey).map(v331 => escapeWireField(v331) + ":" + (v330[v331] ? 1 : 0)).join(",");
}
function resolveVisionModelKey(v332, v333, v334) {
  const v335 = (v332 || "auto").trim();
  if (v335 === "off" || v335 === "auto") {
    return "off";
  }
  if (v335.length > 0 && v335 !== "auto") {
    const v336 = v334.length > 0 ? v334.some(v337 => v337.key === v335) : OFFLINE_MODEL_KEYS.includes(v335);
    if (v336) {
      return v335;
    }
  }
  const v338 = new Map();
  for (const v339 of v334) {
    if (!v338.has(v339.key)) {
      v338.set(v339.key, v339.enabled);
    }
  }
  for (const v340 of orderedKeys(v334.map(v341 => v341.key))) {
    if (v333[v340] && v338.get(v340)) {
      return v340;
    }
  }
  return "off";
}
const CANONICAL_TIER_ORDER = ["off", "low", "medium", "high", "xhigh", "max"];
function tierIdsFor(v342) {
  const v343 = [];
  for (const v344 of Object.values(v342)) {
    const v345 = (v344 ?? "").trim();
    if (v345.length === 0) {
      continue;
    }
    if (!v343.some(v346 => v346.toLowerCase() === v345.toLowerCase())) {
      v343.push(v345);
    }
  }
  const v347 = v348 => {
    const v349 = CANONICAL_TIER_ORDER.indexOf(v348.toLowerCase());
    if (v349 < 0) {
      return CANONICAL_TIER_ORDER.length;
    } else {
      return v349;
    }
  };
  return v343.map((v350, v351) => ({
    id: v350,
    index: v351
  })).sort((v352, v353) => v347(v352.id) - v347(v353.id) || v352.index - v353.index).map(v354 => v354.id);
}
function thinkingRecords(v355, v356) {
  return v355.filter(v357 => isWireSafeKey(v357.key)).map(v358 => {
    const v359 = v356(v358);
    if (v359 === null) {
      return null;
    } else {
      return escapeWireField(v358.key.trim()) + ":" + v359;
    }
  }).filter(v360 => v360 !== null).join(",");
}
function wireSafeListItem(v361) {
  const v362 = v361.trim();
  if (v362.length === 0) {
    return null;
  }
  if (/[\x00-\x1f\x7f,|:]/.test(v362)) {
    return null;
  }
  return v362;
}
function joinWireList(v363) {
  const v364 = v363.map(wireSafeListItem).filter(v365 => v365 !== null);
  if (v364.length > 0) {
    return v364.join("|");
  } else {
    return null;
  }
}
function formatThinkingTiersEnv(v366) {
  return thinkingRecords(v366, v367 => {
    if (!v367.reasoningEfforts) {
      return null;
    }
    return joinWireList(tierIdsFor(v367.reasoningEfforts));
  });
}
function formatThinkingKindsEnv(v368) {
  return thinkingRecords(v368, v369 => wireSafeListItem(v369.thinkingKind ?? ""));
}
function formatThinkingFieldsEnv(v370) {
  return thinkingRecords(v370, v371 => joinWireList(v371.thinkingFields ?? []));
}
function isPlausibleModelKey(v372) {
  const v373 = (v372 ?? "").trim();
  if (v373.length === 0 || v373.length > 96) {
    return false;
  }
  return !/[\x00-\x1f\x7f\s"'\\]/.test(v373);
}
const TIMEOUT_MS = 15000;
const DOWNLOADS_TIMEOUT_MS = 8000;
function normalizeServerUrl(v374) {
  return (v374 ?? "").trim().replace(/\/+$/, "");
}
async function fetchWithTimeout$1(v375, v376, v377) {
  const v378 = new AbortController();
  const v379 = setTimeout(() => v378.abort(), v377);
  try {
    return await fetch(v375, {
      ...v376,
      signal: v378.signal
    });
  } finally {
    clearTimeout(v379);
  }
}
function classifyNetworkError(v380) {
  const v381 = v380;
  if (v381?.name === "AbortError") {
    return "连接服务器超时，请检查网络或服务器地址";
  }
  if (v381 instanceof SyntaxError) {
    return "服务器返回的数据无法解析";
  }
  if (v381?.name === "TypeError") {
    return "无法连接服务器，请检查网络或服务器地址";
  }
  const v382 = v380?.constructor?.name ?? "Error";
  return "登录失败（" + v382 + "），请稍后重试";
}
function extractErrorMessage(v383, v384) {
  try {
    const v385 = JSON.parse(v383);
    const v386 = typeof v385.message === "string" && v385.message.length > 0 ? v385.message : typeof v385.error === "string" ? v385.error : "";
    if (v386.length > 0) {
      return v386;
    }
  } catch {}
  if (v384 === 401) {
    return "手机号或密码错误";
  }
  if (v384 === 404) {
    return "服务器地址不正确（接口不存在）";
  }
  if (v384 === 502 || v384 === 503 || v384 === 504) {
    return "服务器暂时不可用，请稍后重试";
  }
  return "请求失败（状态码 " + v384 + "）";
}
function num(v387, v388 = 0) {
  if (typeof v387 === "number" && Number.isFinite(v387)) {
    return v387;
  } else {
    return v388;
  }
}
function str$5(v389, v390 = "") {
  if (typeof v389 === "string") {
    return v389;
  } else {
    return v390;
  }
}
function bool$2(v391) {
  return v391 === true || typeof v391 === "string" && v391.toLowerCase() === "true";
}
function stateFromUser(v392, v393) {
  const v394 = str$5(v392.phone) || v393;
  const v395 = v392.usage ?? {};
  const v396 = v392.finance ?? {};
  return {
    isLoggedIn: true,
    billing: readAccountPoints(v392),
    subscription: parseMonthlySubscription(v392.subscription),
    subscriptionPlans: parseMonthlyPlanOffers(v392.subscriptionPlans),
    usageDays: parseUsageDays(v395.daily),
    phone: v394,
    name: str$5(v392.name),
    tokenBalance: num(v392.tokenBalance),
    balance: num(v392.balance),
    usageTokens: num(v395.totalTokens),
    usageRequests: num(v395.requestCount),
    usageAmount: num(v395.amount),
    rechargeTotal: num(v396.rechargeTotal),
    exchangedTokens: num(v396.exchangedTokens),
    createdAt: str$5(v392.createdAt),
    lastLoginAt: str$5(v392.lastLoginAt)
  };
}
async function loginAsync() {
  return {
    ok: false,
    error: "请使用自备模型设置。",
    unauthorized: false
  };
}
async function meAsync() {
  return {
    ok: true,
    error: "",
    unauthorized: false,
    state: __byok.compatState()
  };
}
async function listModelsAsync() {
  return {
    ok: true,
    error: "",
    models: __byok.models()
  };
}
async function submitFeedbackAsync(v397, v398, v399, v400) {
  const v401 = normalizeServerUrl(v397);
  const v402 = v403 => ({
    ok: false,
    error: v403,
    items: []
  });
  if (v401.length === 0) {
    return v402("请填写服务器地址");
  }
  if (!v398 || v398.trim().length === 0) {
    return v402("未登录");
  }
  if (v399.trim().length === 0) {
    return v402("留言内容不能为空");
  }
  try {
    const v404 = await fetchWithTimeout$1(v401 + "/api/feedback", {
      method: "POST",
      headers: {
        authorization: "Bearer " + v398,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        content: v399,
        contact: v400 ?? ""
      })
    }, TIMEOUT_MS);
    const v405 = await v404.text();
    if (v404.status === 401) {
      return v402("登录已过期，请重新登录");
    }
    if (!v404.ok) {
      return v402(extractErrorMessage(v405, v404.status));
    }
    return {
      ok: true,
      error: "",
      items: []
    };
  } catch (v406) {
    return v402(classifyNetworkError(v406));
  }
}
async function getMyFeedbackAsync(v407, v408) {
  const v409 = normalizeServerUrl(v407);
  const v410 = v411 => ({
    ok: false,
    error: v411,
    items: []
  });
  if (v409.length === 0) {
    return v410("请填写服务器地址");
  }
  if (!v408 || v408.trim().length === 0) {
    return v410("未登录");
  }
  try {
    const v412 = await fetchWithTimeout$1(v409 + "/api/feedback/mine", {
      headers: {
        authorization: "Bearer " + v408
      }
    }, TIMEOUT_MS);
    const v413 = await v412.text();
    if (v412.status === 401) {
      return v410("登录已过期，请重新登录");
    }
    if (!v412.ok) {
      return v410(extractErrorMessage(v413, v412.status));
    }
    const v414 = JSON.parse(v413);
    if (!Array.isArray(v414.feedback)) {
      return v410("服务器返回的数据无法解析");
    }
    const v415 = v414.feedback.filter(v416 => !!v416 && typeof v416 === "object").map(v417 => ({
      id: str$5(v417.id),
      content: str$5(v417.content),
      createdAt: str$5(v417.createdAt),
      reply: str$5(v417.reply),
      repliedAt: str$5(v417.repliedAt)
    }));
    return {
      ok: true,
      error: "",
      items: v415
    };
  } catch (v418) {
    return v410(classifyNetworkError(v418));
  }
}
async function checkLatestVersionAsync(v419) {
  const v420 = normalizeServerUrl(v419);
  const v421 = v422 => ({
    ok: false,
    error: v422,
    latestVersion: "",
    releaseNotesUrl: "",
    forceUpdate: false,
    minVersion: ""
  });
  if (v420.length === 0) {
    return v421("未配置服务器地址");
  }
  try {
    const v423 = await fetchWithTimeout$1(v420 + "/api/downloads", {}, DOWNLOADS_TIMEOUT_MS);
    const v424 = await v423.text();
    if (!v423.ok) {
      return v421(extractErrorMessage(v424, v423.status));
    }
    const v425 = JSON.parse(v424);
    const v426 = v425.downloads && typeof v425.downloads === "object" ? v425.downloads : v425;
    const v427 = str$5(v426.version);
    if (v427.length === 0) {
      return v421("服务器未返回版本号");
    }
    return {
      ok: true,
      error: "",
      latestVersion: v427,
      releaseNotesUrl: str$5(v426.releaseNotesUrl),
      forceUpdate: bool$2(v426.forceUpdate),
      minVersion: str$5(v426.minVersion)
    };
  } catch (v428) {
    const v429 = v428;
    return v421(v429?.message ?? String(v428));
  }
}
function classifyQrError(v430) {
  const v431 = v430;
  if (v431?.name === "AbortError") {
    return "连接服务器超时，请检查网络或服务器地址";
  }
  if (v431 instanceof SyntaxError) {
    return "服务器返回的数据无法解析";
  }
  if (v431?.name === "TypeError") {
    return "无法连接服务器，请检查网络或服务器地址";
  }
  return "生成二维码失败: " + (v431?.message ?? String(v430));
}
async function createRechargeQrAsync() {
  return {
    ok: false,
    error: "此副本不提供付费订阅或充值。"
  };
}
async function createSubscriptionQrAsync() {
  return {
    ok: false,
    error: "此副本不提供付费订阅或充值。"
  };
}
async function activateSubscriptionAsync() {
  return {
    ok: false,
    error: "此副本不提供付费订阅或充值。"
  };
}
function classifyOrderStatusError(v432) {
  const v433 = v432;
  if (v433?.name === "AbortError") {
    return "连接服务器超时";
  }
  if (v433 instanceof SyntaxError) {
    return "服务器返回的数据无法解析";
  }
  if (v433?.name === "TypeError") {
    return "无法连接服务器";
  }
  return "查询失败: " + (v433?.message ?? String(v432));
}
async function getOrderStatusAsync() {
  return {
    ok: false,
    error: "此副本不提供付费订阅或充值。"
  };
}
const ERROR_CODES = new Set(["ENGINE_NOT_FOUND", "ENGINE_READY_TIMEOUT", "ENOENT", "EACCES", "EPERM", "EPIPE", "EINVAL", "ENOMEM", "UNKNOWN", "ETIMEDOUT", "ECONNRESET"]);
const ERROR_KINDS = ["missing_credentials", "missing_manifests", "missing_worker_state", "session_not_found", "session_load_failed", "no_managed_sessions", "unsupported_acp_invocation", "cli_parse", "invalid_model_syntax", "unsupported_command", "unsupported_resumed_command", "confirmation_required", "api_http_error", "device_not_ready", "unknown"];
const failure = v434 => ({
  status: "error",
  error: v434
});
const accountKey = v435 => node_crypto.createHash("sha256").update(normalizeServerUrl(v435.serverUrl) + "\n" + v435.phone).digest("hex");
async function feedbackRequest(v436, v437) {
  const v438 = new AbortController();
  const v439 = setTimeout(() => v438.abort(), 15000);
  try {
    const v440 = await fetch(normalizeServerUrl(v436.serverUrl) + "/api/feedback" + (v437 === undefined ? "/mine" : ""), {
      method: v437 === undefined ? "GET" : "POST",
      headers: {
        authorization: "Bearer " + v436.token,
        "content-type": "application/json"
      },
      ...(v437 === undefined ? {} : {
        body: JSON.stringify({
          content: v437,
          contact: ""
        })
      }),
      signal: v438.signal
    });
    return {
      status: v440.status,
      body: v440.ok ? await v440.json() : null
    };
  } finally {
    clearTimeout(v439);
  }
}
function formatEngineSupportReport(v441, v442, v443) {
  const v444 = v445 => ({
    reported: !!v445,
    nonAscii: !!v445 && /[^\x00-\x7f]/.test(v445),
    networkShare: !!v445 && /^\\\\/.test(v445)
  });
  const v446 = v442?.exitCode;
  const v447 = typeof v446 === "number" && Number.isSafeInteger(v446) ? v446 : null;
  const v448 = ERROR_KINDS.filter(v449 => v442?.stderrTail.includes("[error-kind: " + v449 + "]"));
  const v450 = v442?.occurredAt && Date.parse(v442.occurredAt);
  const v451 = {
    schema: 1,
    component: "session-engine",
    occurredAt: v450 && Number.isFinite(v450) ? new Date(v450).toISOString() : new Date().toISOString(),
    appVersion: v443.appVersion,
    channel: v443.channel,
    packaged: v443.packaged,
    system: process.platform + " " + node_os.release() + " " + node_os.arch(),
    electron: process.versions.electron ?? null,
    node: process.versions.node,
    cpuModel: node_os.cpus()[0]?.model.slice(0, 100) ?? "unknown",
    logicalCpus: node_os.cpus().length,
    phase: v442?.phase === "startup" ? "startup" : v442?.phase === "running" ? "running" : "unknown",
    exitCode: v447,
    exitCodeHex: v447 === null ? null : "0x" + (v447 >>> 0).toString(16).toUpperCase().padStart(8, "0"),
    errorCode: v442?.errorCode ? ERROR_CODES.has(v442.errorCode) ? v442.errorCode : "OTHER" : null,
    signal: ["SIGTERM", "SIGKILL", "SIGABRT", "SIGSEGV", "SIGILL"].includes(v442?.signal ?? "") ? v442?.signal : null,
    errorKinds: v448,
    osErrorCode: engineOsErrorCode(v442?.stderrTail),
    stderrPresent: !!v442?.stderrTail,
    engine: v444(v442?.enginePath),
    workingDirectory: v444(v442?.cwd)
  };
  return "PLC Code 会话故障诊断（用户主动发送）\n报告编号：" + v441 + "\n" + JSON.stringify(v451, null, 2);
}
class EngineSupportReports {
  constructor(v452, v453) {
    this.account = v452;
    this.environment = v453;
  }
  account;
  environment;
  reports = new Map();
  latest = new Map();
  observe(v454) {
    if (v454.status !== "crashed") {
      if (v454.status === "ready" || v454.status === "closed") {
        this.latest.delete(v454.sessionKey);
      }
      return v454;
    }
    const v455 = JSON.stringify([v454.diagnostic ?? null, v454.detail ?? null]);
    const v456 = this.reports.get(this.latest.get(v454.sessionKey) ?? "");
    if (v456?.fingerprint === v455) {
      return {
        ...v454,
        supportReportId: v456.id
      };
    }
    const v457 = node_crypto.randomUUID();
    const v458 = this.account();
    const v459 = {
      id: v457,
      sessionKey: v454.sessionKey,
      fingerprint: v455,
      owner: v458?.isLoggedIn ? accountKey(v458) : null,
      content: formatEngineSupportReport(v457, v454.diagnostic, this.environment()),
      state: {
        status: "idle"
      },
      uncertain: false
    };
    this.reports.set(v457, v459);
    this.latest.set(v454.sessionKey, v457);
    for (const [v460, v461] of this.reports) {
      if (this.reports.size <= 100) {
        break;
      }
      if (v461.pending) {
        continue;
      }
      this.reports.delete(v460);
      if (this.latest.get(v461.sessionKey) === v460) {
        this.latest.delete(v461.sessionKey);
      }
    }
    return {
      ...v454,
      supportReportId: v457
    };
  }
  find(v462, v463) {
    const v464 = this.reports.get(v463);
    if (v464?.sessionKey === v462) {
      return v464;
    } else {
      return undefined;
    }
  }
  state(v465, v466) {
    const v467 = this.find(v465, v466);
    const v468 = this.account();
    if (!v467) {
      return failure("这份诊断已失效，请重新检测后再发送。");
    }
    if (v467.owner && (!v468?.isLoggedIn || v467.owner !== accountKey(v468))) {
      return failure("登录账号已变化，请使用发生故障时的账号发送。");
    }
    return {
      ...v467.state
    };
  }
  send(v469, v470) {
    const v471 = this.find(v469, v470);
    const v472 = this.account();
    if (!v471) {
      return Promise.resolve(failure("这份诊断已失效，请重新检测后再发送。"));
    }
    if (!v472?.isLoggedIn || !v472.token) {
      return Promise.resolve(failure("请先登录，再发送诊断。"));
    }
    const v473 = {
      ...v472
    };
    const v474 = accountKey(v473);
    if (v471.owner && v471.owner !== v474) {
      return Promise.resolve(failure("登录账号已变化，请使用发生故障时的账号发送。"));
    }
    v471.owner = v474;
    if (v471.pending) {
      return v471.pending;
    }
    if (v471.state.status === "sent") {
      return Promise.resolve({
        ...v471.state
      });
    }
    v471.state = {
      status: "sending"
    };
    v471.pending = this.deliver(v471, v473).catch(() => failure("发送未确认，请检查网络后重试。")).then(v475 => {
      v471.state = v475;
      return {
        ...v475
      };
    }).finally(() => {
      v471.pending = undefined;
    });
    return v471.pending;
  }
  async deliver(v476, v477) {
    try {
      if (v476.uncertain) {
        const v478 = await feedbackRequest(v477);
        if (v478.status === 401) {
          return failure("登录已过期，请重新登录后发送。");
        }
        const v479 = v478.body;
        if (v478.status !== 200 || v479?.ok !== true || !Array.isArray(v479.feedback)) {
          return failure("尚未确认上次提交结果，请稍后重试核对。");
        }
        const v480 = v479.feedback.find(v481 => v481?.content === v476.content && typeof v481.id === "string" && v481.id);
        if (v480) {
          return {
            status: "sent",
            feedbackId: v480.id
          };
        }
      }
      const v482 = this.account();
      if (!v482?.isLoggedIn || accountKey(v482) !== accountKey(v477)) {
        return failure("登录账号已变化，请重新确认后发送。");
      }
      if (v476.content.length > 2000) {
        return failure("诊断摘要超过服务器限制，请通过“复制诊断”反馈。");
      }
      v476.uncertain = true;
      const v483 = await feedbackRequest(v477, v476.content);
      if (v483.status === 401) {
        v476.uncertain = false;
        return failure("登录已过期，请重新登录后发送。");
      }
      if (v483.status === 429) {
        v476.uncertain = false;
        return failure("发送过于频繁，请稍后重试。");
      }
      if (v483.status !== 200) {
        return failure("服务器暂未确认收到诊断，请稍后重试。");
      }
      const v484 = v483.body;
      if (v484?.ok !== true || typeof v484.feedback?.id !== "string" || !v484.feedback.id || v484.feedback.content !== v476.content) {
        return failure("服务器未返回有效回执，请点击重试核对提交结果。");
      }
      return {
        status: "sent",
        feedbackId: v484.feedback.id
      };
    } catch (v485) {
      return failure(v485 instanceof SyntaxError ? "服务器返回的回执无法识别，请点击重试核对提交结果。" : "网络中断或发送超时，尚未确认结果。请检查网络后重试。");
    }
  }
}
const CODESYS_LINE_ENV = "PLC_CODE_CODESYS_LINE";
const CODESYS_LINE_VANILLA = "vanilla";
const CODESYS_LINE_INOPROSHOP = "inoproshop";
function codesysLineForProject(v486) {
  if (!v486) {
    return "";
  }
  if ((v486.integration ?? "").trim().toLowerCase() !== "codesys_bridge") {
    return "";
  }
  const v487 = (v486.vendor ?? "").trim().toLowerCase();
  const v488 = (v486.family ?? "").trim().toLowerCase();
  const v489 = (v486.templateId ?? "").trim().toLowerCase();
  const v490 = v487 === "codesys" || v488 === "codesys" || v489 === "codesys-v35-lad";
  if (v490) {
    return CODESYS_LINE_VANILLA;
  } else {
    return CODESYS_LINE_INOPROSHOP;
  }
}
function codesysRouteEnv(v491) {
  const v492 = codesysLineForProject(v491);
  if (v492.length > 0) {
    return {
      [CODESYS_LINE_ENV]: v492
    };
  } else {
    return {};
  }
}
const QUESTION_SUFFIX = ".question.json";
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
class PendingQuestionWatcher extends node_events.EventEmitter {
  dir;
  fsWatcher = null;
  seenRequestIds = new Set();
  constructor(v493) {
    super();
    this.dir = node_path.join(v493, "pending_questions");
    node_fs.mkdirSync(this.dir, {
      recursive: true
    });
  }
  get directory() {
    return this.dir;
  }
  start() {
    if (this.fsWatcher) {
      return;
    }
    this.scanExisting();
    try {
      this.fsWatcher = node_fs.watch(this.dir, {
        persistent: false
      }, (v494, v495) => {
        if (!v495) {
          return;
        }
        const v496 = v495.toString();
        if (!v496.endsWith(QUESTION_SUFFIX)) {
          return;
        }
        this.tryLoad(v496);
      });
    } catch (v497) {
      this.emit("error", v497);
    }
  }
  stop() {
    this.fsWatcher?.close();
    this.fsWatcher = null;
  }
  forget(v498) {
    this.seenRequestIds.delete(v498);
  }
  hasSeen(v499) {
    return this.seenRequestIds.has(v499);
  }
  markSeen(v500) {
    this.seenRequestIds.add(v500);
  }
  answer(v501, v502, v503) {
    if (!REQUEST_ID_PATTERN.test(v501)) {
      console.error("[pendingQuestions] refused to answer malformed request_id: " + JSON.stringify(v501));
      throw new Error("invalid request_id: " + JSON.stringify(v501));
    }
    node_fs.mkdirSync(this.dir, {
      recursive: true
    });
    const v504 = {
      request_id: v501,
      accepted: v502,
      answer: v503
    };
    const v505 = node_path.join(this.dir, v501 + ".answer.json");
    const v506 = node_path.resolve(this.dir) + node_path.sep;
    const v507 = node_path.resolve(v505);
    if (v507 !== v506.slice(0, -1) && !v507.startsWith(v506)) {
      console.error("[pendingQuestions] refused to write outside pending_questions dir: " + v507);
      throw new Error("resolved answer path escaped the pending_questions directory");
    }
    node_fs.writeFileSync(v507, JSON.stringify(v504, null, 2) + "\n", "utf-8");
  }
  scanExisting() {
    let v508;
    try {
      v508 = node_fs.readdirSync(this.dir);
    } catch {
      return;
    }
    for (const v509 of v508) {
      if (v509.endsWith(QUESTION_SUFFIX)) {
        this.tryLoad(v509);
      }
    }
  }
  tryLoad(v510, v511 = 0) {
    const v512 = node_path.join(this.dir, v510);
    if (!node_fs.existsSync(v512)) {
      return;
    }
    let v513;
    try {
      const v514 = node_fs.readFileSync(v512, "utf-8");
      if (v514.trim().length === 0) {
        throw new Error("empty");
      }
      v513 = JSON.parse(v514);
    } catch {
      if (v511 < 6) {
        setTimeout(() => this.tryLoad(v510, v511 + 1), 60);
      }
      return;
    }
    const v515 = String(v513.request_id ?? v513.requestId ?? "").trim();
    if (v515.length === 0 || this.seenRequestIds.has(v515)) {
      return;
    }
    this.seenRequestIds.add(v515);
    this.emit("question", v513);
  }
}
function progressNotice(v516) {
  if (v516.status !== "blocked") {
    return null;
  }
  const v517 = typeof v516.label === "string" ? v516.label.trim() : "";
  const v518 = typeof v516.detail === "string" ? v516.detail.trim() : "";
  return [v517, v518 !== v517 ? v518 : ""].filter(Boolean).join(": ") || null;
}
function toolResultFailed(v519, v520) {
  if (v520 === true) {
    return true;
  }
  let v521 = v519;
  if (typeof v521 === "string") {
    try {
      v521 = JSON.parse(v521);
    } catch {
      return false;
    }
  }
  if (!v521 || typeof v521 !== "object" || Array.isArray(v521)) {
    return false;
  }
  const v522 = v521;
  return v522.isError === true || v522.is_error === true || v522.ok === false;
}
const OPEN_TAG = "<system-reminder>";
const CLOSE_TAG = "</system-reminder>";
function stripLeadingSystemReminder(v523) {
  if (!v523) {
    return v523 ?? "";
  }
  let v524 = 0;
  while (v524 + OPEN_TAG.length <= v523.length && v523.startsWith(OPEN_TAG, v524)) {
    const v525 = v523.indexOf(CLOSE_TAG, v524);
    if (v525 < 0) {
      return v523;
    }
    v524 = v525 + CLOSE_TAG.length;
    while (v524 < v523.length && (v523[v524] === "\r" || v523[v524] === "\n" || v523[v524] === " " || v523[v524] === "\t")) {
      v524++;
    }
  }
  if (v524 === 0) {
    return v523;
  } else {
    return v523.slice(v524);
  }
}
const INJECTED_CONTEXT_MARKER = "--- 以下是用户的请求 ---";
function stripInjectedContext(v526) {
  if (!v526) {
    return v526 ?? "";
  }
  const v527 = v526.lastIndexOf(INJECTED_CONTEXT_MARKER);
  if (v527 < 0) {
    return v526;
  }
  return v526.slice(v527 + INJECTED_CONTEXT_MARKER.length).replace(/^[\r\n \t]+/, "");
}
const INTERNAL_MARKERS = ["PLC Code runtime instructions:", "PLC Code general chat instructions:", "This session is being continued from a previous conversation", "<summary>"];
function looksInternal(v528) {
  return INTERNAL_MARKERS.some(v529 => v528.includes(v529));
}
function isObject(v530) {
  return typeof v530 === "object" && v530 !== null && !Array.isArray(v530);
}
function str$4(v531, v532) {
  if (!isObject(v531)) {
    return "";
  }
  const v533 = v531[v532];
  if (v533 === undefined || v533 === null) {
    return "";
  }
  if (typeof v533 === "string") {
    return v533;
  }
  try {
    return JSON.stringify(v533);
  } catch {
    return "";
  }
}
function unwrap(v534) {
  const v535 = v534.message;
  if (isObject(v535)) {
    return v535;
  } else {
    return v534;
  }
}
function extractUsage(v536) {
  const v537 = v536.usage;
  if (!isObject(v537)) {
    return null;
  }
  const v538 = v539 => {
    const v540 = v537[v539];
    if (typeof v540 === "number" && Number.isFinite(v540)) {
      return v540;
    } else {
      return 0;
    }
  };
  return {
    input_tokens: v538("input_tokens"),
    output_tokens: v538("output_tokens"),
    cache_creation_input_tokens: v538("cache_creation_input_tokens"),
    cache_read_input_tokens: v538("cache_read_input_tokens")
  };
}
function joinTextOnlyBlocks(v541) {
  const v542 = [];
  for (const v543 of v541) {
    if (!isObject(v543) || str$4(v543, "type") !== "text") {
      continue;
    }
    const v544 = str$4(v543, "text").trim();
    if (v544.length > 0) {
      v542.push(v544);
    }
  }
  return v542.join("\n\n").trim();
}
function blocksLookContinued(v545) {
  for (const v546 of v545) {
    if (!isObject(v546) || str$4(v546, "type") !== "text") {
      continue;
    }
    if (str$4(v546, "text").includes("This session is being continued from a previous conversation")) {
      return true;
    }
  }
  return false;
}
function noticeFromProgressUpdate(v547) {
  const v548 = (v547 ?? "").trim();
  if (v548.length === 0) {
    return null;
  }
  let v549;
  try {
    v549 = JSON.parse(v548);
  } catch {
    return null;
  }
  if (isObject(v549)) {
    return progressNotice(v549);
  } else {
    return null;
  }
}
function summarizeToolNames(v550) {
  if (v550.length <= 3) {
    return v550.join("、");
  }
  return v550.slice(0, 3).join("、") + " 等 " + v550.length + " 个";
}
function interruptedTurnNotice(v551, v552) {
  return "记录不完整：本会话在一次工具执行中被中断，有 " + v551 + " 个工具调用没有收到回执（" + summarizeToolNames(v552) + "）。这些调用已按原样保留在时间线里并标记为「未收到工具回执」，没有丢弃；下次发消息时引擎会带着这段记录继续。";
}
function markInterruptedTailCards(v553, v554) {
  let v555 = 0;
  for (const v556 of v553.chat) {
    if (v556.kind !== "tool") {
      continue;
    }
    if (!v554.has(v556.toolUseId)) {
      continue;
    }
    if (v556.status !== "cancelled") {
      continue;
    }
    v556.interrupted = true;
    v555 += 1;
  }
  return v555;
}
let idCounter = 0;
function nextId(v557) {
  idCounter += 1;
  return "hist-" + v557 + "-" + idCounter;
}
function nonEmpty(v558, v559) {
  if (v558.trim().length > 0) {
    return v558;
  } else {
    return v559;
  }
}
const MEDIA_REFERENCE_PREFIX = "plc-media:";
function readMediaPayload(v560, v561) {
  if (!v561.startsWith(MEDIA_REFERENCE_PREFIX)) {
    return null;
  }
  if (!v560) {
    return null;
  }
  const v562 = v561.slice(MEDIA_REFERENCE_PREFIX.length);
  const v563 = v562.endsWith(".b64") ? v562.slice(0, -4) : "";
  if (v563.length !== 64 || !/^[0-9a-f]{64}$/i.test(v563)) {
    return null;
  }
  try {
    if (node_fs.existsSync(node_path.join(v560, v562))) {
      return node_fs.readFileSync(node_path.join(v560, v562), "utf-8");
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function imageBlockToAttachment(v564, v565, v566) {
  if (!isObject(v564)) {
    return null;
  }
  const v567 = str$4(v564, "media_type").trim();
  if (!/^image\//i.test(v567)) {
    return null;
  }
  const v568 = str$4(v564, "data").trim();
  if (v568.length === 0) {
    return null;
  }
  const v569 = v568.startsWith(MEDIA_REFERENCE_PREFIX) ? readMediaPayload(v565.mediaDir, v568) : v568;
  if (!v569 || v569.length === 0) {
    return null;
  }
  const v570 = str$4(v564, "name").trim() || "image-" + v566;
  return {
    id: v566,
    name: v570,
    mediaType: v567,
    dataUrl: "data:" + v567 + ";base64," + v569,
    kind: "image"
  };
}
function appendUserBlock(v571, v572) {
  const v573 = stripInjectedContext(stripLeadingSystemReminder(joinTextOnlyBlocks(v572)));
  const v574 = v572.map((v575, v576) => imageBlockToAttachment(v575, v571, nextId("att") + "-" + v576)).filter(v577 => v577 !== null);
  const v578 = v573.length > 0 || v574.length > 0;
  if (v578 && !looksInternal(v573)) {
    v571.chat.push({
      kind: "user",
      id: nextId("user"),
      text: v573,
      attachments: v574.length > 0 ? v574 : undefined
    });
  }
}
function appendAssistantBlocks(v579, v580) {
  let v581 = "";
  const v582 = () => {
    const v583 = v581.trim();
    if (v583.length > 0 && !looksInternal(v583)) {
      v579.chat.push({
        kind: "assistant",
        id: nextId("asst"),
        fullText: v583,
        displayedText: v583,
        streaming: false
      });
    }
    v581 = "";
  };
  for (const v584 of v580) {
    if (!isObject(v584)) {
      continue;
    }
    const v585 = str$4(v584, "type");
    if (v585 === "text") {
      const v586 = str$4(v584, "text");
      if (v586.length > 0) {
        v581 = v581.length > 0 ? v581 + "\n\n" + v586 : v586;
      }
      continue;
    }
    if (v585 === "thinking") {
      v582();
      const v587 = str$4(v584, "thinking").trim();
      if (v587.length > 0) {
        v579.chat.push({
          kind: "thinking",
          id: nextId("think"),
          text: v587,
          state: "end"
        });
      }
      continue;
    }
    if (v585 === "tool_use") {
      v582();
      const v588 = nonEmpty(str$4(v584, "name"), "tool");
      if (v588 === "ProgressUpdate") {
        const v589 = noticeFromProgressUpdate(str$4(v584, "input"));
        if (v589) {
          v579.chat.push({
            kind: "system",
            id: nextId("sys"),
            tone: "warn",
            text: v589
          });
        }
        continue;
      }
      const v590 = str$4(v584, "id");
      const v591 = {
        kind: "tool",
        id: nextId("tool"),
        toolUseId: v590,
        name: v588,
        input: str$4(v584, "input"),
        status: "cancelled"
      };
      if (v590.length > 0) {
        v579.toolCards.set(v590, v591);
      }
      v579.chat.push(v591);
      continue;
    }
  }
  v582();
}
function appendToolResultBlocks(v592, v593) {
  for (const v594 of v593) {
    if (!isObject(v594) || str$4(v594, "type") !== "tool_result") {
      continue;
    }
    if (str$4(v594, "tool_name") === "ProgressUpdate") {
      continue;
    }
    const v595 = str$4(v594, "tool_use_id");
    const v596 = str$4(v594, "output");
    const v597 = toolResultFailed(v596, v594.is_error);
    if (v595.length > 0 && v592.toolCards.has(v595)) {
      const v598 = v592.toolCards.get(v595);
      v598.status = v597 ? "error" : "ok";
      v598.output = v596;
      continue;
    }
    if (v595.length === 0) {
      continue;
    }
    const v599 = nonEmpty(str$4(v594, "tool_name"), "tool");
    v592.chat.push({
      kind: "tool",
      id: nextId("tool"),
      toolUseId: v595,
      name: v599,
      input: "",
      status: v597 ? "error" : "ok",
      output: v596
    });
  }
}
function extractContentText(v600) {
  const v601 = v600.content;
  if (typeof v601 === "string") {
    return v601.trim();
  }
  if (Array.isArray(v601)) {
    const v602 = [];
    for (const v603 of v601) {
      if (!isObject(v603) || str$4(v603, "type") !== "text") {
        continue;
      }
      const v604 = str$4(v603, "text").trim();
      if (v604.length > 0 && !looksInternal(v604)) {
        v602.push(v604);
      }
    }
    return v602.join("\n\n").trim();
  }
  return "";
}
function collectAgentIdsFromHistory(v605) {
  const v606 = new Set();
  const v607 = [];
  const v608 = v609 => {
    if (typeof v609 !== "string") {
      return;
    }
    const v610 = v609.trim();
    if (v610.length === 0 || v606.has(v610)) {
      return;
    }
    v606.add(v610);
    v607.push(v610);
  };
  for (const v611 of v605) {
    if (v611.kind !== "tool" || !/^Agent/.test(v611.name) && v611.name !== "Workflow") {
      continue;
    }
    const v612 = (v611.output ?? "").trim();
    if (v612.length === 0) {
      continue;
    }
    let v613;
    try {
      v613 = JSON.parse(v612);
    } catch {
      continue;
    }
    if (!isObject(v613)) {
      continue;
    }
    v608(v613.agentId);
    if (v611.name === "Workflow" && Array.isArray(v613.steps)) {
      for (const v614 of v613.steps) {
        if (isObject(v614)) {
          v608(v614.agent_id);
        }
      }
    }
    for (const v615 of ["lanes", "agents"]) {
      const v616 = v613[v615];
      if (!Array.isArray(v616)) {
        continue;
      }
      for (const v617 of v616) {
        if (isObject(v617)) {
          v608(v617.agentId);
        }
      }
    }
  }
  return v607;
}
function collectWorkflowIdsFromHistory(v618) {
  const v619 = new Set();
  for (const v620 of v618) {
    if (v620.kind !== "tool" || v620.name !== "Workflow") {
      continue;
    }
    for (const v621 of [v620.input, v620.output]) {
      try {
        const v622 = JSON.parse(v621 ?? "");
        if (isObject(v622) && typeof v622.workflow_id === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(v622.workflow_id)) {
          v619.add(v622.workflow_id);
        }
      } catch {}
    }
  }
  return [...v619].slice(-32);
}
async function reconstructHistory(v623) {
  const v624 = v623.replace(/\.jsonl$/i, ".transcript.jsonl");
  const v625 = node_fs.existsSync(v624);
  const v626 = v625 ? v624 : v623;
  const v627 = v626.split(/[\\/]/).pop() ?? "session.jsonl";
  let v628 = v627.replace(/\.(transcript\.)?jsonl$/i, "").replace(/\.json$/i, "");
  const v629 = v628.indexOf(".rot-");
  if (v629 >= 0) {
    v628 = v628.slice(0, v629);
  }
  const v630 = node_fs.existsSync(node_path.join(v626.slice(0, v626.length - v627.length), v628 + ".media")) ? node_path.join(v626.slice(0, v626.length - v627.length), v628 + ".media") : null;
  const v631 = await promises.readFile(v626, "utf-8");
  const v632 = {
    chat: [],
    toolCards: new Map(),
    mediaDir: v630
  };
  let v633 = false;
  let v634 = null;
  let v635 = [];
  const v636 = new Set();
  let v637 = null;
  for (const v638 of v631.split(/\r?\n/)) {
    const v639 = v638.trim();
    if (v639.length === 0) {
      continue;
    }
    let v640;
    try {
      v640 = JSON.parse(v639);
    } catch {
      continue;
    }
    if (!isObject(v640)) {
      continue;
    }
    if (str$4(v640, "type") === "session_meta" && v634 === null) {
      v634 = {
        sessionId: str$4(v640, "session_id"),
        workspaceRoot: str$4(v640, "workspace_root"),
        model: str$4(v640, "model")
      };
    }
    if (!v625 && str$4(v640, "type") === "compaction") {
      v633 = true;
    }
    const v641 = unwrap(v640);
    const v642 = extractUsage(v641);
    if (v642) {
      v637 = v642;
    }
    const v643 = str$4(v641, "role");
    if (v643.length === 0) {
      continue;
    }
    const v644 = v641.blocks;
    if (Array.isArray(v644)) {
      if (!v625 && !v633 && blocksLookContinued(v644)) {
        v633 = true;
      }
      if (v643 === "user") {
        appendUserBlock(v632, v644);
        v635 = [];
        v632.interruptedTailIds?.clear();
      } else if (v643 === "assistant") {
        appendAssistantBlocks(v632, v644);
        v635 = v644.filter(v645 => isObject(v645) && str$4(v645, "type") === "tool_use").map(v646 => ({
          id: str$4(v646, "id"),
          name: nonEmpty(str$4(v646, "name"), "tool")
        }));
      } else if (v643 === "tool") {
        appendToolResultBlocks(v632, v644);
        for (const v647 of v644) {
          if (!isObject(v647) || str$4(v647, "type") !== "tool_result") {
            continue;
          }
          const v648 = str$4(v647, "tool_use_id");
          if (v648.length > 0) {
            v636.add(v648);
          }
        }
      }
    } else {
      const v649 = extractContentText(v641);
      if (v643 === "user") {
        const v650 = stripInjectedContext(stripLeadingSystemReminder(v649));
        if (v650.length > 0 && !looksInternal(v650)) {
          v632.chat.push({
            kind: "user",
            id: nextId("user"),
            text: v650
          });
        }
      } else if (v643 === "assistant" && v649.length > 0 && !looksInternal(v649)) {
        v632.chat.push({
          kind: "assistant",
          id: nextId("asst"),
          fullText: v649,
          displayedText: v649,
          streaming: false
        });
      }
    }
  }
  const v651 = v635.filter(v652 => !v636.has(v652.id));
  const v653 = new Set(v651.map(v654 => v654.id).filter(v655 => v655.length > 0));
  if (v653.size > 0) {
    v632.interruptedTailIds = v653;
    const v656 = markInterruptedTailCards(v632, v653);
    if (v656 > 0) {
      v632.chat.unshift({
        kind: "system",
        id: nextId("sys"),
        tone: "warn",
        text: interruptedTurnNotice(v656, v651.map(v657 => v657.name))
      });
    }
  }
  for (let v658 = 0; v658 < v632.chat.length; v658++) {
    const v659 = v632.chat[v658];
    if (v659.kind !== "assistant") {
      continue;
    }
    let v660 = true;
    for (let v661 = v658 + 1; v661 < v632.chat.length; v661++) {
      const v662 = v632.chat[v661].kind;
      if (v662 === "user") {
        break;
      }
      if (v662 === "assistant") {
        v660 = false;
        break;
      }
    }
    if (v660) {
      v659.completed = true;
    }
  }
  if (v633) {
    v632.chat.unshift({
      kind: "system",
      id: nextId("sys"),
      tone: "warn",
      text: "历史可能不完整：未找到完整转写，较早的轮次已被压缩，无法恢复。"
    });
  }
  return {
    blocks: v632.chat,
    usingTranscript: v625,
    meta: v634,
    lastUsage: v637
  };
}
function isUnderDraftsDir(v663, v664) {
  if (v663.length === 0) {
    return false;
  }
  const v665 = v666 => v666.replace(/^\\\\\?\\/, "").replace(/[/\\]+/g, node_path.sep).replace(/[/\\]+$/, "").toLowerCase();
  const v667 = v665(node_path.join(v664, "drafts"));
  const v668 = v665(v663);
  return v668 === v667 || v668.startsWith(v667 + node_path.sep);
}
async function walkJsonl(v669) {
  const v670 = [];
  let v671;
  try {
    v671 = await promises.readdir(v669, {
      withFileTypes: true
    });
  } catch {
    return v670;
  }
  for (const v672 of v671) {
    const v673 = node_path.join(v669, v672.name);
    if (v672.isDirectory()) {
      v670.push(...(await walkJsonl(v673)));
    } else if (v672.isFile() && v672.name.toLowerCase().endsWith(".jsonl")) {
      v670.push(v673);
    }
  }
  return v670;
}
function relativeTime(v674) {
  const v675 = Date.now() - v674;
  const v676 = v675 / 60000;
  if (v676 < 1) {
    return "刚刚";
  }
  if (v676 < 60) {
    return Math.floor(v676) + " 分钟前";
  }
  const v677 = v676 / 60;
  if (v677 < 24) {
    return Math.floor(v677) + " 小时前";
  }
  return Math.floor(v677 / 24) + " 天前";
}
function messageText(v678) {
  const v679 = v678.blocks;
  if (Array.isArray(v679)) {
    return v679.filter(v680 => isObject(v680) && str$4(v680, "type") === "text").map(v681 => str$4(v681, "text").trim()).filter(Boolean).join("\n\n");
  }
  const v682 = v678.content;
  if (typeof v682 === "string") {
    return v682;
  }
  if (!Array.isArray(v682)) {
    return "";
  }
  return v682.filter(v683 => isObject(v683) && str$4(v683, "type") === "text").map(v684 => str$4(v684, "text").trim()).filter(Boolean).join("\n\n");
}
async function inspect(v685) {
  let v686 = "";
  let v687 = 0;
  let v688 = 0;
  let v689 = "";
  let v690;
  try {
    v690 = await promises.readFile(v685, "utf-8");
  } catch {
    return {
      messageCount: v687,
      workspaceRoot: v686,
      createdMs: v688,
      firstUserText: v689
    };
  }
  for (const v691 of v690.split(/\r?\n/)) {
    const v692 = v691.trim();
    if (v692.length === 0) {
      continue;
    }
    const v693 = v692.includes("\"role\"");
    let v694;
    try {
      v694 = JSON.parse(v692);
    } catch {
      continue;
    }
    if (!isObject(v694)) {
      continue;
    }
    if (!v693) {
      if (v688 === 0 && v694.type === "session_meta") {
        const v695 = v694.created_at_ms;
        if (typeof v695 === "number" && Number.isFinite(v695) && v695 > 0) {
          v688 = v695;
        }
      }
      if (v686.length === 0 && str$4(v694, "workspace_root").length > 0) {
        v686 = str$4(v694, "workspace_root");
      }
      continue;
    }
    const v696 = v694.message;
    const v697 = isObject(v696) ? v696 : v694;
    const v698 = str$4(v697, "role");
    if (v698 === "user" || v698 === "assistant") {
      v687++;
    }
    if (v698 === "user" && v689.length === 0) {
      const v699 = stripInjectedContext(stripLeadingSystemReminder(messageText(v697))).trim();
      if (v699.length > 0 && !looksInternal(v699)) {
        v689 = v699.slice(0, 2400);
      }
    }
  }
  return {
    messageCount: v687,
    workspaceRoot: v686,
    createdMs: v688,
    firstUserText: v689
  };
}
function createdTime(v700, v701, v702, v703) {
  if (v701 > 0) {
    return v701;
  }
  const v704 = /^session-(\d{13})-/i.exec(v700);
  if (v704) {
    const v705 = Number(v704[1]);
    if (Number.isFinite(v705) && v705 > 0) {
      return v705;
    }
  }
  if (v702 > 0) {
    return v702;
  } else {
    return v703;
  }
}
async function listSessions(v706, v707) {
  const v708 = node_path.join(v706, "sessions");
  const v709 = await walkJsonl(v708);
  const v710 = new Map();
  for (const v711 of v709) {
    const v712 = v711.slice(v711.lastIndexOf("\\") + 1).slice(v711.lastIndexOf("/") + 1);
    const v713 = v712.replace(/\.jsonl$/i, "");
    if (v713.toLowerCase().endsWith(".transcript")) {
      continue;
    }
    if (v713.toLowerCase().includes(".rot-")) {
      continue;
    }
    const v714 = v713;
    let v715;
    try {
      v715 = await promises.stat(v711);
    } catch {
      continue;
    }
    const v716 = v715.mtimeMs;
    const v717 = v710.get(v714);
    if (v717 && v717.modifiedMs >= v716) {
      continue;
    }
    const v718 = await inspect(v711);
    const {
      messageCount: v719,
      workspaceRoot: v720
    } = v718;
    if (v719 === 0) {
      continue;
    }
    const v721 = v707?.get(v714);
    const v722 = v721?.customTitle;
    const v723 = v721?.aiTitle;
    const v724 = Boolean(v722 && v722.length > 0 || v723 && v723.length > 0);
    const v725 = v722 && v722.length > 0 ? v722 : v723 && v723.length > 0 ? v723 : "新会话";
    v710.set(v714, {
      id: v714,
      filePath: v711,
      createdMs: createdTime(v714, v718.createdMs, v715.birthtimeMs, v716),
      modifiedMs: v716,
      title: v725,
      titleFixed: v724,
      firstUserText: v718.firstUserText,
      meta: v719 + " 条消息 · 上次打开 " + relativeTime(v716),
      messageCount: v719,
      workspaceRoot: isUnderDraftsDir(v720, v706) ? "" : v720,
      pinned: v707?.get(v714)?.pinned === true
    });
  }
  return Array.from(v710.values()).sort((v726, v727) => {
    if (v726.pinned !== v727.pinned) {
      if (v726.pinned) {
        return -1;
      } else {
        return 1;
      }
    }
    return v727.createdMs - v726.createdMs;
  });
}
function digest(v728) {
  return node_crypto.createHash("sha256").update(v728.replace(/\r\n/g, "\n").trim()).digest("hex");
}
class TurnPresentationStore {
  directory;
  constructor(v729) {
    this.directory = node_path.join(v729, "turn-presentation");
  }
  path(v730) {
    return node_path.join(this.directory, digest(v730) + ".json");
  }
  read(v731) {
    const v732 = this.path(v731);
    if (!node_fs.existsSync(v732)) {
      return [];
    }
    const v733 = JSON.parse(node_fs.readFileSync(v732, "utf8"));
    if (!Array.isArray(v733)) {
      throw new Error("Invalid conversation presentation record");
    }
    return v733.filter(v734 => v734 && typeof v734.turnId === "string" && typeof v734.promptHash === "string" && v734.user?.kind === "user");
  }
  write(v735, v736) {
    node_fs.mkdirSync(this.directory, {
      recursive: true
    });
    const v737 = this.path(v735);
    const v738 = v737 + ".tmp-" + process.pid;
    node_fs.writeFileSync(v738, JSON.stringify(v736), "utf8");
    node_fs.renameSync(v738, v737);
  }
  start(v739, v740, v741, v742) {
    const v743 = this.read(v739);
    if (v743.some(v744 => v744.turnId === v740)) {
      return;
    }
    const v745 = v742.attachments?.filter(v746 => v746.kind !== "image").map(({
      textContent: v747,
      ...v748
    }) => v748);
    v743.push({
      turnId: v740,
      promptHash: digest(v741),
      user: {
        ...v742,
        attachments: v745,
        sentAt: v742.sentAt ?? Date.now()
      }
    });
    this.write(v739, v743);
  }
  finish(v749, v750) {
    const v751 = this.read(v749);
    const v752 = v751.find(v753 => v753.turnId === v750);
    if (!v752 || v752.user.endedAt) {
      return;
    }
    v752.user.endedAt = Date.now();
    this.write(v749, v751);
  }
  copy(v754, v755, v756 = false) {
    if (v754 === v755) {
      return;
    }
    const v757 = this.read(v754);
    if (!v757.length) {
      return;
    }
    const v758 = this.read(v755);
    this.write(v755, [...v758, ...v757.filter(v759 => !v758.some(v760 => v760.turnId === v759.turnId))]);
    if (v756) {
      this.remove(v754);
    }
  }
  remove(v761) {
    const v762 = this.path(v761);
    if (node_fs.existsSync(v762)) {
      node_fs.unlinkSync(v762);
    }
  }
  restore(v763, v764) {
    const v765 = this.read(v763);
    for (let v766 = 0; v766 < v764.length; v766++) {
      const v767 = v764[v766];
      if (v767.kind !== "user") {
        continue;
      }
      const v768 = v765.findIndex(v769 => v769.promptHash === digest(v767.text));
      if (v768 < 0) {
        continue;
      }
      const v770 = v765.splice(v768, 1)[0];
      const v771 = [...(v767.attachments ?? []).filter(v772 => v772.kind === "image"), ...(v770.user.attachments ?? [])];
      v764[v766] = {
        ...v767,
        ...v770.user,
        id: v767.id,
        attachments: v771.length ? v771 : undefined
      };
    }
  }
}
const Channels = {
  ViewerStatus: "viewer:status",
  ViewerOpen: "viewer:open",
  ViewerContext: "viewer:context",
  ViewerContextAck: "viewer:context-ack",
  WorkbenchGet: "workbench:get",
  WorkbenchChange: "workbench:change",
  WorkbenchFiles: "workbench:files",
  WorkbenchPick: "workbench:pick",
  WorkbenchMcpTest: "workbench:mcp-test",
  WorkbenchMcpCancel: "workbench:mcp-cancel",
  WorkbenchExperience: "workbench:experience",
  SendTurn: "session:sendTurn",
  RequestCapabilities: "session:requestCapabilities",
  Cancel: "session:cancel",
  StopAgent: "session:stopAgent",
  BridgeMessage: "session:bridgeMessage",
  EngineStatus: "session:engineStatus",
  EngineSupportState: "session:engineSupportState",
  EngineSupportSend: "session:engineSupportSend",
  AnswerQuestion: "session:answerQuestion",
  AgentModelConsentResponse: "session:agentModelConsentResponse",
  ListSessions: "session:list",
  OpenSession: "session:open",
  StartWithSoftware: "session:startWithSoftware",
  OpenNativeProject: "session:openNativeProject",
  ReadNativeProject: "session:readNativeProject",
  AdoptNativeProject: "session:adoptNativeProject",
  SetFocusedSession: "session:setFocused",
  ReconnectBridge: "session:reconnectBridge",
  RestartBridge: "session:restartBridge",
  RenameSession: "session:rename",
  GenerateSessionTitle: "session:generateTitle",
  GenerateSessionTitles: "session:generateTitles",
  PinSession: "session:pin",
  ForkSession: "session:fork",
  RevealSessionInFolder: "session:revealInFolder",
  DeleteSession: "session:delete",
  InjectTestFixture: "session:__injectTestFixture",
  SeedFixtureHistory: "session:__seedFixtureHistory",
  FixtureHistorySeeded: "session:__fixtureHistorySeeded",
  PickWorkspaceFolder: "workspace:pickFolder",
  BindWorkspace: "workspace:bind",
  ListRoutes: "workspace:listRoutes",
  CreateProject: "workspace:createProject",
  PickSaveLocation: "workspace:pickSaveLocation",
  GetDefaultProjectLocation: "workspace:defaultProjectLocation",
  MigrateDrafts: "workspace:migrateDrafts",
  ListDrafts: "workspace:listDrafts",
  CloseWorkspace: "workspace:close",
  ReadCanvasFile: "canvas:readFile",
  ReadCanvasImage: "canvas:readImage",
  ReadUnboundCanvasFile: "canvas:readUnboundFile",
  WriteCanvasFiles: "canvas:writeFiles",
  CheckRealFileDrift: "canvas:checkRealFileDrift",
  ReadStagingSnapshot: "canvas:readStagingSnapshot",
  WriteRealFile: "canvas:writeRealFile",
  DiscardWorkspace: "canvas:discard",
  Account: {
    Login: "account:login",
    Me: "account:me",
    Logout: "account:logout",
    GetState: "account:getState",
    StatePushed: "account:statePushed",
    ListModels: "account:listModels",
    RechargeQr: "account:rechargeQr",
    SubscriptionQr: "account:subscriptionQr",
    SubscriptionActivate: "account:subscriptionActivate",
    OrderStatus: "account:orderStatus",
    RestartConfirmResponse: "account:restartConfirmResponse",
    RestartConfirmRequest: "account:restartConfirmRequest",
    DebugForceLogin: "account:__debugForceLogin",
    SessionNotice: "account:sessionNotice",
    SubmitFeedback: "account:submitFeedback",
    ListFeedback: "account:listFeedback",
    FeedbackUnreadChanged: "account:feedbackUnreadChanged"
  },
  SettingsHotSwap: "settings:hotSwap",
  SettingsGet: "settings:get",
  SettingsChanged: "settings:changed",
  Tia: {
    Status: "tia:status",
    VerifyConnection: "tia:verifyConnection",
    EnvironmentReport: "tia:environmentReport",
    CheckWhitelist: "tia:checkWhitelist",
    AdminFlagDoctor: "tia:adminFlagDoctor",
    AdminFlagRepair: "tia:adminFlagRepair",
    TrustBridge: "tia:trustBridge",
    JoinOpennessGroup: "tia:joinOpennessGroup",
    VersionLockRead: "tia:versionLockRead",
    VersionLockWrite: "tia:versionLockWrite",
    ProcessWatch: "tia:processWatch",
    StatusPushed: "tia:statusPushed",
    TrustInviteShow: "tia:trustInviteShow",
    TrustInviteAccept: "tia:trustInviteAccept",
    TrustInviteDecline: "tia:trustInviteDecline",
    DebugOfferTrustInvite: "tia:__debugOfferTrustInvite",
    DebugResetTrustOrchestrator: "tia:__debugResetTrustOrchestrator"
  },
  Artifact: {
    StateChanged: "artifact:stateChanged",
    RevealInFolder: "artifact:revealInFolder",
    MarkDelivered: "artifact:markDelivered"
  },
  Workspace: {
    CloseConfirmRequest: "workspace:closeConfirmRequest",
    CloseConfirmResponse: "workspace:closeConfirmResponse"
  },
  App: {
    GetInfo: "app:getInfo",
    Quit: "app:quit",
    Reload: "app:reload",
    ToggleDevTools: "app:toggleDevTools",
    OpenExternal: "app:openExternal",
    OpenLocalPreview: "app:openLocalPreview",
    SetTitleBarTheme: "app:setTitleBarTheme"
  },
  Update: {
    Overlay: "update:overlay",
    GetOverlayState: "update:getOverlayState",
    DownloadProgress: "update:downloadProgress",
    Now: "update:now",
    Later: "update:later",
    CheckNow: "update:checkNow",
    DebugOfferOverlay: "update:debugOfferOverlay"
  },
  Announcements: {
    Board: "announcements:board",
    GetState: "announcements:getState",
    Dismiss: "announcements:dismiss"
  }
};
function registerWorkbenchIpc(v773) {
  const {
    win: v774,
    store: v775
  } = v773;
  let v776 = null;
  electron.ipcMain.handle(Channels.WorkbenchGet, () => v775.current);
  electron.ipcMain.handle(Channels.WorkbenchChange, (v777, v778) => v775.mutate(v778));
  electron.ipcMain.handle(Channels.WorkbenchFiles, (v779, v780, v781) => v775.files(v780, v781));
  electron.ipcMain.handle(Channels.WorkbenchPick, async (v782, v783) => {
    const v784 = await electron.dialog.showOpenDialog(v774, {
      title: v783 ? "添加资料文件夹" : "添加资料文件",
      properties: [v783 ? "openDirectory" : "openFile", "multiSelections"]
    });
    if (v784.canceled) {
      return [];
    } else {
      return v784.filePaths;
    }
  });
  electron.ipcMain.handle(Channels.WorkbenchMcpTest, async (v785, v786) => {
    v776?.abort();
    const v787 = new AbortController();
    v776 = v787;
    try {
      return await mcpClient.testMcpConnection(v786, v787.signal);
    } finally {
      if (v776 === v787) {
        v776 = null;
      }
    }
  });
  electron.ipcMain.handle(Channels.WorkbenchMcpCancel, () => v776?.abort());
  v774.once("closed", () => v776?.abort());
  electron.ipcMain.handle(Channels.WorkbenchExperience, async (v788, v789) => {
    if (!["list", "add", "delete"].includes(String(v789.action))) {
      throw new Error("无效的经验管理操作");
    }
    if (v789.action !== "list" && v773.busy()) {
      throw new Error("有会话正在使用经验库，请在任务结束后修改");
    }
    const {
      sessionKey: v790,
      ...v791
    } = v789;
    const v792 = {
      ...process.env,
      PLC_CODE_RUNTIME_HOME: v775.home
    };
    return new Promise((v793, v794) => {
      const v795 = node_child_process.execFile(v773.engine(), ["desktop-experience"], {
        cwd: v773.cwd(v790),
        env: v792,
        windowsHide: true,
        timeout: 15000,
        maxBuffer: 4194304
      }, (v796, v797) => {
        if (v796) {
          v794(new Error("经验库读取或保存失败，请重试；原有记录已保留"));
          return;
        }
        try {
          const v798 = JSON.parse(v797);
          if (v798.error) {
            v794(new Error(v798.error));
          } else {
            v793(v798);
          }
        } catch {
          v794(new Error("经验库返回的数据不完整"));
        }
      });
      v795.stdin?.end(JSON.stringify(v791));
    });
  });
}
function resolveWithinRoot(v799, v800) {
  let v801;
  try {
    v801 = node_fs.realpathSync(v800);
  } catch {
    throw new Error("root directory does not exist: " + v800);
  }
  const v802 = v801.endsWith(node_path.sep) ? v801 : v801 + node_path.sep;
  let v803;
  try {
    v803 = node_fs.realpathSync(v799);
  } catch {
    throw new Error("target file not found: " + v799);
  }
  if (v803 !== v801 && !v803.startsWith(v802)) {
    throw new Error("target is outside the allowed root: " + v803 + " (root: " + v801 + ")");
  }
  return v803;
}
class ViewerInstanceManager {
  constructor(v804, v805) {
    this.launch = v804;
    this.detach = v805;
  }
  launch;
  detach;
  entry;
  tail = Promise.resolve();
  last;
  queued = 0;
  closed = false;
  get() {
    if (this.closed) {
      return Promise.reject(new Error("主程序正在关闭，不能打开代码视图"));
    }
    if (!this.entry) {
      const v806 = Symbol("viewer");
      const v807 = new AbortController();
      const v808 = () => {
        if (this.entry?.identity === v806) {
          this.entry = undefined;
        }
      };
      const v809 = Promise.resolve().then(() => this.launch(v807.signal, v808)).then(v810 => {
        if (this.closed || this.entry?.identity !== v806) {
          this.detach(v810);
          throw new Error("代码视图已关闭，请重新打开");
        }
        return v810;
      }).catch(v811 => {
        v808();
        throw v811;
      });
      this.entry = {
        identity: v806,
        controller: v807,
        ready: v809
      };
    }
    return this.entry.ready;
  }
  open(v812, v813) {
    if (this.closed) {
      return Promise.reject(new Error("主程序正在关闭，不能打开代码视图"));
    }
    if (this.last?.key === v812) {
      return this.last.promise;
    }
    if (this.queued >= 32) {
      return Promise.reject(new Error("代码视图正在处理打开请求，请稍后再试"));
    }
    this.queued++;
    const v814 = this.tail.then(async () => {
      const v815 = await this.get();
      if (this.closed) {
        throw new Error("主程序正在关闭");
      }
      return v813(v815);
    });
    const v816 = {
      key: v812,
      promise: v814
    };
    this.last = v816;
    this.tail = v814.then(() => {}, () => {}).finally(() => {
      this.queued--;
      if (this.last === v816) {
        this.last = undefined;
      }
    });
    return v814;
  }
  close() {
    this.closed = true;
    const v817 = this.entry;
    this.entry = undefined;
    v817?.controller.abort();
    v817?.ready.then(v818 => this.detach(v818)).catch(() => {});
  }
}
function registerViewerIpc(v819) {
  const {
    win: v820
  } = v819;
  const v821 = electron.app.isPackaged ? process.resourcesPath : node_path.join(electron.app.getAppPath(), "resources-demo5");
  const v822 = node_path.join(v821, "viewer", "PlcCode Viewer.exe");
  const v823 = node_path.join(v821, "viewer-host.cjs");
  let v824;
  const v825 = new Set();
  const v826 = new Map();
  const v827 = v828 => !v820.isDestroyed() && v828.sender === v820.webContents && v828.senderFrame === v820.webContents.mainFrame;
  const v829 = () => ({
    available: v819.enabled && node_fs.existsSync(v822) && node_fs.existsSync(v823),
    reason: v819.enabled ? "独立代码视图组件尚未打包" : "当前版本未启用代码视图接入"
  });
  const v830 = () => v824 ??= node_module.createRequire(require("url").pathToFileURL(__filename).href)(v823);
  const v831 = v832 => {
    if (!v832.workspaceId || !v825.has(v832.workspaceId)) {
      throw new Error("代码视图的会话归属失效，请从目标会话重新打开");
    }
    v819.rootFor(v832.workspaceId);
    return v832.workspaceId;
  };
  const v833 = new ViewerInstanceManager(async (v834, v835) => {
    const v836 = await v830().createViewerHost({
      onContext: v837 => v838(v831(v837), v837),
      onInline: (v839, v840) => {
        if (v820.isDestroyed()) {
          throw new Error("PLC Code 窗口已关闭");
        }
        v831(v839);
        return v830().requestInlineExplanation(v819.inlineAI(), v839.context, v840, v839.source);
      }
    });
    if (v834.aborted) {
      v836.close();
      throw new Error("代码视图启动已取消");
    }
    const v841 = [];
    if (process.env.PLC_CODE_ENABLE_TEST_FIXTURES === "1" && /^\d{4,5}$/.test(process.env.PLC_CODE_VIEWER_CDP_PORT || "")) {
      v841.push("--ui-test", "--remote-debugging-port=" + process.env.PLC_CODE_VIEWER_CDP_PORT);
    }
    const v842 = new Set(["systemroot", "windir", "comspec", "temp", "tmp", "localappdata", "appdata", "userprofile", "homedrive", "homepath", "path", "number_of_processors", "processor_architecture", "lang"]);
    const v843 = {
      ...Object.fromEntries(Object.entries(process.env).filter(([v844]) => v842.has(v844.toLowerCase()))),
      ...v836.env,
      PLCCODE_VIEWER_HOST_PID: String(process.pid),
      PLCCODE_VIEWER_PROFILE: node_path.join(v819.runtimeHome, "viewer-profiles", "host-" + process.pid)
    };
    const v845 = node_child_process.spawn(v822, v841, {
      cwd: node_path.join(v821, "viewer"),
      env: v843,
      stdio: "ignore",
      windowsHide: true,
      detached: true
    });
    v845.unref();
    let v846;
    let v847 = false;
    v845.once("error", v848 => {
      v846 = v848;
      v836.close();
      v835();
    });
    v845.once("exit", () => {
      v847 = true;
      v836.close();
      v835();
    });
    try {
      const v849 = Date.now() + 15000;
      while (!v836.connected) {
        if (v834.aborted || v846 || v847 || Date.now() > v849) {
          throw v846 || new Error(v834.aborted ? "代码视图启动已取消" : "Viewer 启动或握手超时，请重新打开");
        }
        await new Promise(v850 => setTimeout(v850, 50));
      }
      if (v834.aborted) {
        throw new Error("代码视图启动已取消");
      }
      return {
        connection: v836,
        child: v845
      };
    } catch (v851) {
      v836.close();
      if (!v847) {
        v845.kill();
      }
      throw v851;
    }
  }, v852 => v852.connection.close());
  async function v838(v853, v854) {
    if (v820.isDestroyed()) {
      throw new Error("PLC Code 窗口已关闭");
    }
    const v855 = v819.rootFor(v853);
    node_fs.mkdirSync(v855, {
      recursive: true
    });
    const v856 = node_path.join(v855, ".viewer-contexts");
    node_fs.mkdirSync(v856, {
      recursive: true
    });
    resolveWithinRoot(v856, v855);
    if (!/^[a-f0-9-]{36}$/.test(v854.deliveryId)) {
      throw new Error("无效问询标识");
    }
    const v857 = node_path.join(v856, v854.deliveryId);
    node_fs.mkdirSync(v857);
    const v858 = node_path.join(v857, v854.source.name);
    const v859 = node_path.join(v857, "selection.context.json");
    node_fs.writeFileSync(v858, Buffer.from(v854.source.bytes, "base64"), {
      flag: "wx"
    });
    node_fs.writeFileSync(v859, JSON.stringify(v854.context, null, 2), {
      encoding: "utf8",
      flag: "wx"
    });
    const v860 = {
      deliveryId: v854.deliveryId,
      sessionKey: v853,
      question: v854.context.question,
      quote: v830().formatContextQuote(v854.context, v858, v859, v854.source.origin)
    };
    const v861 = await new Promise(v862 => {
      const v863 = setTimeout(() => {
        v826.delete(v854.deliveryId);
        v862({
          deliveryId: v854.deliveryId,
          accepted: false,
          reason: "会话未确认接收，请检查 DEMO5 窗口"
        });
      }, 7000);
      v826.set(v854.deliveryId, {
        resolve: v862,
        timer: v863
      });
      v820.webContents.send(Channels.ViewerContext, v860);
    });
    if (!v861.accepted) {
      throw new Error(v861.reason || "原会话已关闭，请从目标会话重新打开 Viewer");
    }
    if (v820.isMinimized()) {
      v820.restore();
    }
    v820.show();
    v820.focus();
    return {
      message: "已加入 DEMO5 原会话草稿，请在主程序确认后发送。"
    };
  }
  electron.ipcMain.handle(Channels.ViewerStatus, v864 => {
    if (!v827(v864)) {
      throw new Error("无效页面");
    }
    return v829();
  });
  electron.ipcMain.on(Channels.ViewerContextAck, (v865, v866) => {
    if (!v827(v865) || !v866 || typeof v866.accepted !== "boolean") {
      return;
    }
    const v867 = v826.get(v866.deliveryId);
    if (v867) {
      clearTimeout(v867.timer);
      v826.delete(v866.deliveryId);
      v867.resolve(v866);
    }
  });
  electron.ipcMain.handle(Channels.ViewerOpen, async (v868, v869) => {
    if (!v827(v868) || !v829().available) {
      throw new Error("当前版本的独立 Viewer 不可用");
    }
    if (!v869 || !/^[A-Za-z0-9_-]{1,160}$/.test(v869.sessionKey)) {
      throw new Error("无效会话");
    }
    v819.rootFor(v869.sessionKey);
    const v870 = v869.source;
    if (v870 && (typeof v870.name !== "string" || typeof v870.text !== "string" || Buffer.byteLength(v870.text) > 10485760)) {
      throw new Error("源码快照无效或超过 10 MiB");
    }
    const v871 = v870 ? v830().sourceFromBytes(v870.name, Buffer.from(v870.text, "utf8"), "editor-buffer") : null;
    v825.add(v869.sessionKey);
    return v833.open(v869.sessionKey + ":" + (v871 ? v871.name + ":" + v871.sourceHash : "focus"), async ({
      connection: v872
    }) => {
      v819.rootFor(v869.sessionKey);
      const v873 = Date.now() + 6000;
      while (!v872.connected && Date.now() < v873) {
        await new Promise(v874 => setTimeout(v874, 100));
      }
      if (!v872.connected) {
        throw new Error("代码视图连接尚未恢复；现有窗口仍可阅读，请稍后重试或关闭该视图后重开");
      }
      await v872.selectWorkspace(v869.sessionKey, typeof v869.workspaceLabel === "string" ? v869.workspaceLabel.slice(0, 160) : "");
      await v872.setTheme(v819.theme());
      if (v871) {
        await v872.openSources([v871]);
      } else {
        await v872.focus();
      }
      return {
        opened: true
      };
    });
  });
  return {
    closeAll() {
      v833.close();
      for (const [v875, v876] of v826) {
        clearTimeout(v876.timer);
        v876.resolve({
          deliveryId: v875,
          accepted: false,
          reason: "DEMO5 正在关闭"
        });
      }
      v826.clear();
    }
  };
}
class SessionMetaStore {
  state = new Map();
  path;
  constructor(v877) {
    this.path = node_path.join(v877, "session_ui_meta.json");
  }
  load() {
    this.state = new Map();
    try {
      if (!node_fs.existsSync(this.path)) {
        return;
      }
      const v878 = JSON.parse(node_fs.readFileSync(this.path, "utf-8"));
      if (v878 && typeof v878 === "object" && !Array.isArray(v878)) {
        for (const [v879, v880] of Object.entries(v878)) {
          if (v880 && typeof v880 === "object" && !Array.isArray(v880)) {
            this.state.set(v879, v880);
          }
        }
      }
    } catch {
      this.state = new Map();
    }
  }
  get(v881) {
    return this.state.get(v881);
  }
  setCustomTitle(v882, v883) {
    const v884 = v883.trim();
    const v885 = {
      ...this.state.get(v882)
    };
    if (v884.length === 0) {
      delete v885.customTitle;
    } else {
      v885.customTitle = v884;
    }
    this.putOrDrop(v882, v885);
  }
  setAiTitleOnce(v886, v887) {
    const v888 = this.state.get(v886);
    if (v888?.aiTitle && v888.aiTitle.length > 0) {
      return v888.customTitle || v888.aiTitle;
    }
    const v889 = v887.trim();
    if (v889.length === 0) {
      return "";
    }
    const v890 = {
      ...v888,
      aiTitle: v889
    };
    this.putOrDrop(v886, v890);
    return v890.customTitle || v889;
  }
  setPinned(v891, v892) {
    const v893 = {
      ...this.state.get(v891)
    };
    if (v892) {
      v893.pinned = true;
    } else {
      delete v893.pinned;
    }
    this.putOrDrop(v891, v893);
  }
  remove(v894) {
    if (!this.state.has(v894)) {
      return;
    }
    this.state.delete(v894);
    this.save();
  }
  putOrDrop(v895, v896) {
    if (Object.keys(v896).length === 0) {
      this.state.delete(v895);
    } else {
      this.state.set(v895, v896);
    }
    this.save();
  }
  save() {
    node_fs.mkdirSync(node_path.dirname(this.path), {
      recursive: true
    });
    const v897 = this.path + ".tmp-" + process.pid;
    node_fs.writeFileSync(v897, JSON.stringify(Object.fromEntries(this.state), null, 2) + "\n", "utf-8");
    node_fs.renameSync(v897, this.path);
  }
}
const CRASH_LOG_MAX_BYTES = 262144;
const RELOADABLE_REASONS = new Set(["crashed", "oom", "abnormal-exit", "launch-failed"]);
function planRendererRecovery(v898, v899, v900 = 1) {
  if (v899 >= v900) {
    return {
      reload: false,
      note: "already reloaded " + v899 + " time(s)"
    };
  }
  if (!RELOADABLE_REASONS.has(v898)) {
    return {
      reload: false,
      note: "reason '" + v898 + "' is not a crash"
    };
  }
  return {
    reload: true,
    note: "reason '" + v898 + "'"
  };
}
function crashLogDir(v901) {
  return node_path.join(v901, "crash");
}
function stamp$1(v902) {
  const v903 = v904 => String(v904).padStart(2, "0");
  return "" + v902.getFullYear() + v903(v902.getMonth() + 1) + v903(v902.getDate()) + "-" + v903(v902.getHours()) + v903(v902.getMinutes()) + v903(v902.getSeconds());
}
function safeString(v905) {
  if (v905 instanceof Error) {
    return v905.stack ?? v905.name + ": " + v905.message;
  }
  if (typeof v905 === "string") {
    return v905;
  }
  try {
    return JSON.stringify(v905);
  } catch {
    return String(v905);
  }
}
function writeCrashReport(v906, v907) {
  const v908 = v907.now ?? new Date();
  const v909 = crashLogDir(v906);
  const v910 = v907.fileStem ?? v907.kind + "-" + stamp$1(v908);
  const v911 = node_path.join(v909, v910 + ".log");
  const v912 = "[" + v908.toISOString() + "] " + v907.kind + "\ncwd: " + process.cwd() + "\npid: " + process.pid + "\n" + safeString(v907.detail) + "\n\n";
  try {
    node_fs.mkdirSync(v909, {
      recursive: true
    });
    let v913 = 0;
    try {
      v913 = node_fs.statSync(v911).size;
    } catch {
      v913 = 0;
    }
    if (v913 + Buffer.byteLength(v912) > CRASH_LOG_MAX_BYTES) {
      return v911;
    }
    if (v913 === 0) {
      node_fs.writeFileSync(v911, v912, "utf-8");
    } else {
      node_fs.appendFileSync(v911, v912, "utf-8");
    }
    return v911;
  } catch {
    return null;
  }
}
function installProcessCrashGuard(v914) {
  let v915 = null;
  const v916 = (v917, v918) => {
    const v919 = writeCrashReport(v914, {
      kind: v917,
      detail: v918
    });
    if (v919) {
      v915 = v919;
    }
    const v920 = v919 ? " (现场已写入 " + v919 + ")" : " (现场文件写入失败)";
    try {
      process.stderr.write("[main] " + v917 + v920 + "\n" + safeString(v918) + "\n");
    } catch {}
  };
  process.on("uncaughtException", v921 => {
    v916("uncaught-exception", v921);
  });
  process.on("unhandledRejection", v922 => {
    v916("unhandled-rejection", v922);
  });
  return {
    lastReportPath: () => v915
  };
}
const TITLE_TIMEOUT_MS = 10000;
const TITLE_MAX_CHARS = 28;
const FALLBACK_TITLE_MAX_CHARS = 22;
const INPUT_MAX_CHARS = 2400;
const BATCH_INPUT_MAX_CHARS = 600;
function clampInput(v923) {
  const v924 = (v923 ?? "").replace(/\0/g, "").trim();
  if (v924.length <= INPUT_MAX_CHARS) {
    return v924;
  } else {
    return v924.slice(0, INPUT_MAX_CHARS);
  }
}
function sanitizeGeneratedTitle(v925) {
  const v926 = (v925 ?? "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  let v927 = v926.split(/\r?\n/).map(v928 => v928.trim()).find(Boolean) ?? "";
  v927 = v927.replace(/^\s*(?:[-*•]|\d+[.、])\s*/, "").replace(/^\s*(?:标题|会话标题|title)\s*[:：]\s*/i, "").replace(/^[`*_#"'“”‘’\s]+|[`*_#"'“”‘’\s]+$/g, "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").replace(/[。！？!?；;：:]+$/g, "").trim();
  if (v927.length > TITLE_MAX_CHARS) {
    v927 = v927.slice(0, TITLE_MAX_CHARS).trimEnd();
  }
  return v927;
}
function deriveFallbackSessionTitle(v929) {
  let v930 = (v929 ?? "").replace(/\0/g, "").replace(/\r\n?/g, "\n").trim();
  if (v930.startsWith("引用内容：")) {
    const v931 = v930.split(/\n\s*\n/).map(v932 => v932.trim()).filter(Boolean);
    const v933 = v931.find(v934 => !v934.startsWith("引用内容：") && !v934.startsWith(">"));
    if (v933) {
      v930 = v933;
    } else {
      v930 = v930.replace(/^引用内容：\s*/u, "").replace(/^>\s?/gm, "").trim();
    }
  }
  v930 = v930.replace(/<in-app-browser-context[\s\S]*?<\/in-app-browser-context>/gi, " ").replace(/# Files mentioned by the user:[\s\S]*?(?=\n\n|$)/gi, " ").replace(/\s+/g, " ").trim();
  if (!v930 || /^\[?(?:图片|image)\]?$/i.test(v930)) {
    return "图片处理";
  }
  if (/^(?:你?好|hello|hi|嗨|在吗|你好呀|您好)[!！。.，,？?\s]*$/i.test(v930)) {
    return "日常问候";
  }
  v930 = v930.replace(/^(?:请|麻烦|劳驾|现在|接下来|你现在|我想让你|我希望你|帮我|请你|能否|可以帮我)\s*/u, "").replace(/^(?:把|将)\s*/u, "").split(/[。！？!?；;\n]/u, 1)[0].replace(/^["'“”‘’`*_#\-\s]+|["'“”‘’`*_#\-\s]+$/g, "").trim();
  if (!v930 || v930 === "新会话") {
    return "新的任务";
  }
  if (v930.length > FALLBACK_TITLE_MAX_CHARS) {
    v930 = v930.slice(0, FALLBACK_TITLE_MAX_CHARS - 1).trimEnd() + "…";
  }
  return v930;
}
function responseText(v935) {
  if (!v935 || typeof v935 !== "object") {
    return "";
  }
  const v936 = v935;
  if (typeof v936.output_text === "string") {
    return v936.output_text;
  }
  const v937 = Array.isArray(v936.choices) ? v936.choices : [];
  const v938 = v937[0];
  if (!v938 || typeof v938 !== "object") {
    return "";
  }
  const v939 = v938.message;
  if (!v939 || typeof v939 !== "object") {
    return "";
  }
  const v940 = v939.content;
  if (typeof v940 === "string") {
    return v940;
  }
  if (!Array.isArray(v940)) {
    return "";
  }
  return v940.map(v941 => {
    if (!v941 || typeof v941 !== "object") {
      return "";
    }
    const v942 = v941.text;
    if (typeof v942 === "string") {
      return v942;
    } else {
      return "";
    }
  }).filter(Boolean).join(" ");
}
function parseBatchTitles(v943, v944) {
  const v945 = (v943 ?? "").replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const v946 = v945.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  let v947;
  try {
    v947 = JSON.parse(v946);
  } catch {
    return {};
  }
  const v948 = new Set(v944.map(v949 => v949.sessionId));
  const v950 = Array.isArray(v947) ? v947.map(v951 => {
    if (!v951 || typeof v951 !== "object") {
      return ["", ""];
    }
    const v952 = v951;
    return [typeof v952.id === "string" ? v952.id : "", typeof v952.title === "string" ? v952.title : ""];
  }) : v947 && typeof v947 === "object" ? Object.entries(v947).map(([v953, v954]) => [v953, typeof v954 === "string" ? v954 : ""]) : [];
  const v955 = {};
  for (const [v956, v957] of v950) {
    if (!v948.has(v956)) {
      continue;
    }
    const v958 = sanitizeGeneratedTitle(v957);
    if (v958.length > 0) {
      v955[v956] = v958;
    }
  }
  return v955;
}
function maxTokensField(v959) {
  const v960 = v959.trim().toLowerCase().split("/").at(-1) ?? "";
  if (v960.startsWith("gpt-5")) {
    return "max_completion_tokens";
  } else {
    return "max_tokens";
  }
}
function titleEndpoint(v961) {
  const v962 = v961.trim().replace(/\/+$/, "");
  if (v962.endsWith("/v1/chat/completions")) {
    return v962;
  }
  if (v962.endsWith("/v1")) {
    return v962 + "/chat/completions";
  }
  return v962 + "/v1/chat/completions";
}
async function requestSessionTitle(v963, v964, v965, v966) {
  const v967 = new AbortController();
  const v968 = setTimeout(() => v967.abort(), TITLE_TIMEOUT_MS);
  try {
    const v969 = maxTokensField(v965);
    const v970 = await fetch(titleEndpoint(v963), {
      method: "POST",
      headers: {
        authorization: "Bearer " + v964,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: v965,
        stream: false,
        [v969]: 256,
        ...(v965.toLowerCase().includes("deepseek-v4") ? {
          reasoning_effort: "low"
        } : {}),
        messages: [{
          role: "system",
          content: "为这段对话生成一个准确、简洁的中文标题。只输出标题，不加引号、解释、序号或标点。标题不超过18个汉字，突出用户真正要完成的任务。"
        }, {
          role: "user",
          content: "用户首轮请求：\n" + clampInput(v966.userText)
        }]
      }),
      signal: v967.signal
    });
    const v971 = await v970.text();
    if (!v970.ok) {
      console.warn("[session-title] request failed status=" + v970.status + " model=" + v965 + " body=" + v971.slice(0, 240));
      return "";
    }
    const v972 = JSON.parse(v971);
    return sanitizeGeneratedTitle(responseText(v972));
  } catch (v973) {
    const v974 = v973 instanceof Error ? v973.name + ": " + v973.message : String(v973);
    console.warn("[session-title] request failed model=" + v965 + " reason=" + v974);
    return "";
  } finally {
    clearTimeout(v968);
  }
}
async function requestSessionTitleBatch(v975, v976, v977, v978) {
  const v979 = v978.map(v980 => ({
    sessionId: v980.sessionId.trim(),
    userText: clampInput(v980.userText).slice(0, BATCH_INPUT_MAX_CHARS)
  })).filter(v981 => v981.sessionId.length > 0 && v981.userText.length > 0);
  if (v979.length === 0) {
    return {};
  }
  const v982 = new AbortController();
  const v983 = setTimeout(() => v982.abort(), TITLE_TIMEOUT_MS);
  try {
    const v984 = maxTokensField(v977);
    const v985 = await fetch(titleEndpoint(v975), {
      method: "POST",
      headers: {
        authorization: "Bearer " + v976,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: v977,
        stream: false,
        [v984]: 2048,
        ...(v977.toLowerCase().includes("deepseek-v4") ? {
          reasoning_effort: "low"
        } : {}),
        messages: [{
          role: "system",
          content: "为每段对话生成准确、简洁的中文标题。只输出 JSON 数组，不要解释或代码围栏。每项格式为 {\"id\":\"原 id\",\"title\":\"不超过18个汉字的标题\"}。必须保留每个原 id。"
        }, {
          role: "user",
          content: JSON.stringify(v979.map(v986 => ({
            id: v986.sessionId,
            text: v986.userText
          })))
        }]
      }),
      signal: v982.signal
    });
    const v987 = await v985.text();
    if (!v985.ok) {
      console.warn("[session-title] batch request failed status=" + v985.status + " model=" + v977 + " body=" + v987.slice(0, 240));
      return {};
    }
    return parseBatchTitles(responseText(JSON.parse(v987)), v979);
  } catch (v988) {
    const v989 = v988 instanceof Error ? v988.name + ": " + v988.message : String(v988);
    console.warn("[session-title] batch request failed model=" + v977 + " reason=" + v989);
    return {};
  } finally {
    clearTimeout(v983);
  }
}
async function locateSession(v990, v991) {
  const v992 = node_path.join(v990, "sessions");
  const v993 = await walkJsonl(v992);
  const v994 = (v991 + ".jsonl").toLowerCase();
  for (const v995 of v993) {
    const v996 = v995.slice(Math.max(v995.lastIndexOf("\\"), v995.lastIndexOf("/")) + 1);
    if (v996.toLowerCase() === v994) {
      return {
        dir: v995.slice(0, v995.length - v996.length - 1),
        jsonlPath: v995
      };
    }
  }
  return null;
}
function rewriteSessionMetaLine(v997, v998, v999) {
  const v1000 = v997.includes("\r\n") ? "\r\n" : "\n";
  const v1001 = v997.split(/\r?\n/);
  const v1002 = v1001.findIndex(v1003 => v1003.trim().length > 0);
  if (v1002 < 0) {
    return v997;
  }
  let v1004;
  try {
    v1004 = JSON.parse(v1001[v1002]);
  } catch {
    return v997;
  }
  if (!isObject(v1004) || v1004.type !== "session_meta") {
    return v997;
  }
  const v1005 = Date.now();
  v1004.session_id = v998;
  v1004.created_at_ms = v1005;
  v1004.updated_at_ms = v1005;
  v1004.fork = {
    parent_session_id: v999
  };
  v1001[v1002] = JSON.stringify(v1004);
  return v1001.join(v1000);
}
function uniqueForkId(v1006) {
  const v1007 = Date.now();
  for (let v1008 = 0; v1008 < 1000; v1008++) {
    const v1009 = "session-" + v1007 + "-" + v1008;
    if (!node_fs.existsSync(node_path.join(v1006, v1009 + ".jsonl"))) {
      return v1009;
    }
  }
  return "session-" + v1007 + "-" + Math.floor(Math.random() * 1000000000);
}
async function forkSession(v1010, v1011) {
  const v1012 = await locateSession(v1010, v1011);
  if (!v1012) {
    return null;
  }
  let v1013;
  try {
    v1013 = await promises.readFile(v1012.jsonlPath, "utf-8");
  } catch {
    return null;
  }
  const v1014 = uniqueForkId(v1012.dir);
  await promises.writeFile(node_path.join(v1012.dir, v1014 + ".jsonl"), rewriteSessionMetaLine(v1013, v1014, v1011), "utf-8");
  const v1015 = v1012.jsonlPath.replace(/\.jsonl$/i, ".transcript.jsonl");
  try {
    const v1016 = await promises.readFile(v1015, "utf-8");
    await promises.writeFile(node_path.join(v1012.dir, v1014 + ".transcript.jsonl"), rewriteSessionMetaLine(v1016, v1014, v1011), "utf-8");
  } catch {}
  return {
    newId: v1014
  };
}
async function deleteSession(v1017, v1018) {
  const v1019 = await locateSession(v1017, v1018);
  if (!v1019) {
    return {
      ok: false
    };
  }
  let v1020;
  try {
    v1020 = await promises.readdir(v1019.dir, {
      withFileTypes: true
    });
  } catch {
    return {
      ok: false
    };
  }
  const v1021 = (v1018 + ".").toLowerCase();
  const v1022 = v1020.filter(v1023 => v1023.isFile() && v1023.name.toLowerCase().startsWith(v1021));
  for (const v1024 of v1022) {
    try {
      await promises.unlink(node_path.join(v1019.dir, v1024.name));
    } catch (v1025) {
      if (v1025.code !== "ENOENT") {
        return {
          ok: false
        };
      }
    }
  }
  return {
    ok: true
  };
}
function isCsv(v1026) {
  return v1026.toLowerCase().endsWith(".csv");
}
function isMicroWin(v1027) {
  const v1028 = v1027.toLowerCase();
  return v1028.endsWith(".awl") || v1028.endsWith(".stl");
}
function readWorkspaceFile(v1029) {
  const v1030 = node_fs.readFileSync(v1029);
  if (isCsv(v1029)) {
    return decodeCsvBuffer(v1030);
  }
  if (isMicroWin(v1029)) {
    return decodeMicroWinBuffer(v1030);
  }
  return decodeUtf8Bom(v1030);
}
function decodeCsvBuffer(v1031) {
  if (v1031.length >= 2 && v1031[0] === 255 && v1031[1] === 254) {
    return v1031.slice(2).toString("utf16le");
  }
  if (v1031.length >= 2 && v1031[0] === 254 && v1031[1] === 255) {
    const v1032 = Buffer.alloc(v1031.length - 2);
    for (let v1033 = 2; v1033 + 1 < v1031.length; v1033 += 2) {
      v1032[v1033 - 2] = v1031[v1033 + 1];
      v1032[v1033 - 1] = v1031[v1033];
    }
    return v1032.toString("utf16le");
  }
  return decodeUtf8Bom(v1031);
}
function decodeUtf8Bom(v1034) {
  if (v1034.length >= 3 && v1034[0] === 239 && v1034[1] === 187 && v1034[2] === 191) {
    return v1034.slice(3).toString("utf-8");
  }
  return v1034.toString("utf-8");
}
function decodeMicroWinBuffer(v1035) {
  if (v1035.length >= 3 && v1035[0] === 239 && v1035[1] === 187 && v1035[2] === 191) {
    return v1035.slice(3).toString("utf-8");
  }
  const v1036 = v1035.toString("utf-8");
  if (!v1036.includes("�")) {
    return v1036;
  }
  try {
    return iconv.decode(v1035, "gbk");
  } catch {
    return v1036;
  }
}
const HMI_CONTAINER_EXTENSIONS = new Set([".emtp", ".cmtp", ".exob", ".cxob"]);
class NativeContainerTextError extends Error {
  constructor() {
    super("原生 HMI 工程/编译容器不能通过通用文本编辑、暂存或保存处理；请使用原厂工程桥按引擎操作。");
    this.name = "NativeContainerTextError";
  }
}
function assertCanvasTextPath(v1037) {
  const v1038 = (v1037.replace(/\\/g, "/").split("/").pop() ?? "").split(":")[0].replace(/[ .]+$/, "");
  const v1039 = v1038.lastIndexOf(".");
  if (v1039 >= 0 && HMI_CONTAINER_EXTENSIONS.has(v1038.slice(v1039).toLowerCase())) {
    throw new NativeContainerTextError();
  }
}
let cached;
function locateRouteMetadata(v1040) {
  let v1041 = v1040;
  for (let v1042 = 0; v1042 < 12; v1042++) {
    const v1043 = node_path.join(v1041, "routes", "route-metadata.json");
    if (node_fs.existsSync(v1043)) {
      return v1043;
    }
    const v1044 = node_path.join(v1041, "..");
    if (v1044 === v1041) {
      break;
    }
    v1041 = v1044;
  }
  return null;
}
function loadMetadata(v1045) {
  if (cached !== undefined) {
    return cached;
  }
  const v1046 = locateRouteMetadata(v1045);
  if (!v1046) {
    cached = null;
    return null;
  }
  try {
    cached = JSON.parse(node_fs.readFileSync(v1046, "utf-8"));
  } catch {
    cached = null;
  }
  return cached;
}
function canonicalFamily(v1047, v1048) {
  const v1049 = loadMetadata(v1047);
  const v1050 = (v1048 ?? "").trim().toLowerCase();
  if (!v1049) {
    return v1050;
  }
  for (const v1051 of v1049.familyTokens) {
    if (v1051.match.some(v1052 => v1052.toLowerCase() === v1050 || v1050.includes(v1052.toLowerCase()))) {
      return v1051.token;
    }
  }
  return v1050;
}
function isEngineRecognizedRoute(v1053, v1054, v1055) {
  const v1056 = loadMetadata(v1053);
  if (!v1056) {
    return false;
  }
  const v1057 = (v1055 ?? "").trim().toLowerCase();
  return v1056.routes.some(v1058 => v1058.family.toLowerCase() === v1054.toLowerCase() && (v1058.language.toLowerCase() === v1057 || v1058.displayLanguage.toLowerCase() === v1057));
}
function listRoutes(v1059) {
  const v1060 = loadMetadata(v1059);
  if (v1060) {
    return v1060.routes;
  } else {
    return [];
  }
}
function routeById(v1061, v1062) {
  const v1063 = loadMetadata(v1061);
  if (!v1063) {
    return null;
  }
  return v1063.routes.find(v1064 => v1064.id === v1062) ?? null;
}
const GX_MAIN_HEADER = ["步号", "行间声明", "指令", "I/O(软元件)", "空白栏", "PI声明", "注解"];
const LABEL_HEADER = ["类", "标签名", "数据类型", "常量", "软元件", "地址", "注释", "备注", "系统标签的关联", "系统标签名", "属性"];
const LABEL_HEADER_LEGACY = ["类", "标签名", "数据类型", "常量", "软元件", "地址", "注释"];
const GX_MAIN_HEADER_NAMES = new Set(["步号", "行间声明", "指令", "I/O(软元件)", "空白栏", "PI声明", "注解", "ステップ番号", "行間ステートメント", "命令", "I/O(デバイス)", "空欄", "PIステートメント", "ノート", "StepNo.", "StepNo", "LineStatement", "Instruction", "I/O(Device)", "Blank", "PIStatement", "Note"].map(v1065 => v1065.toLowerCase()));
const LABEL_HEADER_NAMES = new Set(["类", "标签名", "数据类型", "常量", "软元件", "地址", "注释", "备注", "系统标签的关联", "系统标签名", "属性", "Class", "LabelName", "DataType", "Constant", "Device", "Address", "Comment", "Remark", "RelationwithSystemLabel", "SystemLabelName", "Attribute"].map(v1066 => v1066.toLowerCase()));
const HEADER_NAME_HITS = 4;
function isLabelsFileName(v1067) {
  return v1067.toLowerCase().includes("label");
}
function canon(v1068) {
  return (v1068 ?? "").replace(/ /g, "").replace(/　/g, "").trim();
}
function isNumericish(v1069) {
  return v1069.length > 0 && [...v1069].every(v1070 => /[0-9.\-+]/.test(v1070));
}
function detectDelimiter(v1071) {
  if (v1071.includes("\t")) {
    return "\t";
  } else {
    return ",";
  }
}
function hasQuotes(v1072) {
  return v1072.includes("\"");
}
function stripQuotes(v1073) {
  const v1074 = (v1073 ?? "").trim();
  if (v1074.length >= 2 && v1074[0] === "\"" && v1074[v1074.length - 1] === "\"") {
    return v1074.slice(1, -1).replace(/""/g, "\"");
  }
  return v1074.replace(/^"+/, "").replace(/"+$/, "").trim();
}
function splitCells(v1075, v1076) {
  return v1075.split(v1076).map(stripQuotes);
}
function quoteCell(v1077, v1078) {
  const v1079 = (v1077 ?? "").trim();
  if (v1078 === "Triple") {
    if (v1079.length === 0) {
      return "\"\"";
    } else {
      return "\"\"\"" + v1079 + "\"\"\"";
    }
  }
  if (v1078 === "Single") {
    return "\"" + v1079.replace(/"/g, "\"\"") + "\"";
  }
  return v1079;
}
function matchesHeader(v1080, v1081) {
  if (v1080.length < v1081.length) {
    return false;
  }
  for (let v1082 = 0; v1082 < v1081.length; v1082++) {
    if (canon(v1080[v1082]).toLowerCase() !== canon(v1081[v1082]).toLowerCase()) {
      return false;
    }
  }
  return true;
}
function nameHits(v1083, v1084) {
  let v1085 = 0;
  for (const v1086 of v1083) {
    const v1087 = canon(v1086).toLowerCase();
    if (v1087.length > 0 && v1084.has(v1087)) {
      v1085++;
    }
  }
  return v1085;
}
function fillRows(v1088, v1089, v1090, v1091, v1092) {
  let v1093 = v1092;
  for (let v1094 = v1089; v1094 < v1090; v1094++) {
    v1093 = Math.max(v1093, splitCells(v1088[v1094], v1091).length);
  }
  const v1095 = [];
  for (let v1096 = v1089; v1096 < v1090; v1096++) {
    const v1097 = splitCells(v1088[v1096], v1091);
    const v1098 = new Array(v1093).fill("");
    for (let v1099 = 0; v1099 < v1093; v1099++) {
      v1098[v1099] = v1099 < v1097.length ? v1097[v1099] : "";
    }
    v1095.push({
      cells: v1098,
      rawLine: v1088[v1096]
    });
  }
  return v1095;
}
function parseBareGxMain(v1100, v1101, v1102) {
  return {
    format: "GxMain",
    delimiter: v1102,
    quote: "Single",
    headers: [...GX_MAIN_HEADER],
    preamble: [],
    rows: fillRows(v1100, 0, v1101, v1102, 7)
  };
}
function parseGxMain(v1103, v1104, v1105, v1106) {
  const v1107 = splitCells(v1103[v1106], v1105);
  const v1108 = [];
  for (let v1109 = 0; v1109 < Math.max(GX_MAIN_HEADER.length, v1107.length); v1109++) {
    v1108.push(v1109 < v1107.length && v1107[v1109].length > 0 ? v1107[v1109] : GX_MAIN_HEADER[Math.min(v1109, GX_MAIN_HEADER.length - 1)]);
  }
  let v1110 = v1106 + 1;
  if (v1110 < v1104) {
    const v1111 = splitCells(v1103[v1110], v1105);
    if (v1111.length > 0 && v1111[0].startsWith("PLC信息")) {
      v1110++;
    }
  }
  const v1112 = v1103.slice(0, v1110);
  return {
    format: "GxMain",
    delimiter: v1105,
    quote: "Single",
    headers: v1108,
    preamble: v1112,
    rows: fillRows(v1103, v1110, v1104, v1105, v1108.length)
  };
}
function parseLabels(v1113, v1114, v1115, v1116) {
  if (v1116 >= 0) {
    const v1117 = splitCells(v1113[v1116], v1115);
    const v1118 = v1117.map((v1119, v1120) => v1119.length > 0 ? v1119 : v1120 < LABEL_HEADER.length ? LABEL_HEADER[v1120] : "列" + (v1120 + 1));
    const v1121 = v1116 + 1;
    const v1122 = v1113.slice(0, v1121);
    return {
      format: "GlobalLabels",
      delimiter: v1115,
      quote: "Single",
      headers: v1118,
      preamble: v1122,
      rows: fillRows(v1113, v1121, v1114, v1115, v1118.length)
    };
  }
  return {
    format: "GlobalLabels",
    delimiter: v1115,
    quote: "Single",
    headers: [...LABEL_HEADER],
    preamble: [],
    rows: fillRows(v1113, 0, v1114, v1115, LABEL_HEADER.length)
  };
}
function parseGeneric(v1123, v1124, v1125, v1126) {
  const v1127 = hasQuotes(v1126) ? "Single" : "None";
  if (v1124 === 0) {
    return {
      format: "Generic",
      delimiter: v1125,
      quote: v1127,
      headers: ["列1"],
      preamble: [],
      rows: []
    };
  }
  const v1128 = splitCells(v1123[0], v1125);
  const v1129 = v1128.length > 0 && v1128.some(v1130 => v1130.length > 0) && !v1128.every(isNumericish);
  let v1131 = 1;
  for (let v1132 = 0; v1132 < v1124; v1132++) {
    v1131 = Math.max(v1131, splitCells(v1123[v1132], v1125).length);
  }
  if (v1129) {
    const v1133 = Array.from({
      length: v1131
    }, (v1134, v1135) => v1135 < v1128.length && v1128[v1135].length > 0 ? v1128[v1135] : "列" + (v1135 + 1));
    return {
      format: "Generic",
      delimiter: v1125,
      quote: v1127,
      headers: v1133,
      preamble: [v1123[0]],
      rows: fillRows(v1123, 1, v1124, v1125, v1131)
    };
  }
  const v1136 = Array.from({
    length: v1131
  }, (v1137, v1138) => "列" + (v1138 + 1));
  return {
    format: "Generic",
    delimiter: v1125,
    quote: v1127,
    headers: v1136,
    preamble: [],
    rows: fillRows(v1123, 0, v1124, v1125, v1131)
  };
}
function parseCsv(v1139, v1140 = "") {
  const v1141 = v1139.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const v1142 = v1141.split("\n");
  let v1143 = v1142.length;
  if (v1143 > 0 && v1142[v1143 - 1].length === 0) {
    v1143--;
  }
  const v1144 = detectDelimiter(v1141);
  const v1145 = isLabelsFileName(v1140);
  let v1146 = -1;
  let v1147 = -1;
  for (let v1148 = 0; v1148 < Math.min(v1143, 8); v1148++) {
    const v1149 = splitCells(v1142[v1148], v1144);
    if (v1146 < 0 && (matchesHeader(v1149, GX_MAIN_HEADER) || nameHits(v1149, GX_MAIN_HEADER_NAMES) >= HEADER_NAME_HITS)) {
      v1146 = v1148;
    }
    if (v1147 < 0 && (matchesHeader(v1149, LABEL_HEADER) || matchesHeader(v1149, LABEL_HEADER_LEGACY) || nameHits(v1149, LABEL_HEADER_NAMES) >= HEADER_NAME_HITS)) {
      v1147 = v1148;
    }
  }
  if (v1146 >= 0) {
    v1147 = -1;
  }
  if (v1143 === 0 || v1141.trim().length === 0) {
    if (v1145) {
      return {
        format: "GlobalLabels",
        headers: [...LABEL_HEADER],
        quote: "Single",
        delimiter: "\t",
        preamble: [],
        rows: []
      };
    } else {
      return {
        format: "GxMain",
        headers: [...GX_MAIN_HEADER],
        quote: "Single",
        delimiter: "\t",
        preamble: [],
        rows: []
      };
    }
  }
  if (v1147 >= 0 || v1145 && v1146 < 0) {
    return parseLabels(v1142, v1143, v1144, v1147);
  }
  if (v1146 >= 0) {
    return parseGxMain(v1142, v1143, v1144, v1146);
  }
  if (v1144 === "\t") {
    return parseBareGxMain(v1142, v1143, v1144);
  } else {
    return parseGeneric(v1142, v1143, v1144, v1141);
  }
}
function synthPreamble(v1150, v1151) {
  if (v1150.format === "GxMain") {
    return ["\"(工程未设置)\"", "\"PLC信息:\"\t\"" + (v1151 ? "FXCPU FX2N/FX2NC" : "FXCPU FX3U/FX3UC") + "\"", GX_MAIN_HEADER.map(v1152 => "\"" + v1152 + "\"").join("\t")];
  }
  if (v1150.format === "GlobalLabels") {
    return ["\"(工程未设置)\"", (v1150.headers.length > 0 ? v1150.headers : LABEL_HEADER).map(v1153 => "\"" + v1153 + "\"").join("\t")];
  }
  if (v1150.headers.length > 0) {
    return [v1150.headers.map(v1154 => quoteCell(v1154, v1150.quote === "None" ? "None" : "Single")).join(v1150.delimiter)];
  } else {
    return [];
  }
}
function serializeCsv(v1155, v1156) {
  const v1157 = [];
  const v1158 = v1155.preamble.length > 0 ? v1155.preamble : synthPreamble(v1155, v1156);
  for (const v1159 of v1158) {
    v1157.push(v1159);
  }
  let v1160 = v1155.headers.length > 0 ? v1155.headers.length : 7;
  for (const v1161 of v1155.rows) {
    v1160 = Math.max(v1160, v1161.cells.length);
  }
  const v1162 = v1155.format === "GxMain" || v1155.format === "GlobalLabels" ? "\t" : v1155.delimiter;
  for (const v1163 of v1155.rows) {
    if (v1163.rawLine !== undefined) {
      v1157.push(v1163.rawLine);
      continue;
    }
    if (v1163.cells.every(v1164 => v1164.trim().length === 0)) {
      continue;
    }
    const v1165 = Array.from({
      length: v1160
    }, (v1166, v1167) => v1167 < v1163.cells.length ? v1163.cells[v1167] : "");
    v1157.push(v1165.map(v1168 => quoteCell(v1168, v1155.quote)).join(v1162));
  }
  if (v1157.length > 0) {
    return v1157.join("\n") + "\n";
  } else {
    return "";
  }
}
const ConfigFileName = "plc-code.project.json";
const SKIP_NAMES = new Set([".claude", ".plccode", ".plccode-agents", ".plccode", ".clawd-agents", ".clawhip", ".git", ".github", ".vscode", "node_modules", "target", "bin", "obj", ".vs", "__pycache__", ".venv", "venv", ConfigFileName].map(v1169 => v1169.toLowerCase()));
const REPO_SKIP_NAMES = new Set(["assets", "desktop", "docs", "lint_plc", "rust", "src", "tests", "ui"]);
const STAGING_WALK_SKIP_NAMES = SKIP_NAMES;
const SOURCE_EXTENSIONS = new Set([".st", ".scl", ".awl", ".stl", ".csv", ".xml"]);
const ARTIFACT_EXTENSIONS = new Set([".md", ".markdown", ".txt", ".rst", ".log", ".py", ".ps1", ".sh", ".bat", ".cmd", ".json", ".yaml", ".yml", ".ini", ".toml", ".s7dcl", ".s7res"]);
function isSourceExtension(v1170) {
  return SOURCE_EXTENSIONS.has(v1170.toLowerCase());
}
function isArtifactExtension(v1171) {
  return ARTIFACT_EXTENSIONS.has(v1171.toLowerCase());
}
function looksLikeDevRepo(v1172) {
  return node_fs.existsSync(node_path.join(v1172, "rust", "Cargo.toml")) && node_fs.existsSync(node_path.join(v1172, "desktop"));
}
function hasProjectConfig(v1173) {
  if (!v1173 || v1173.trim().length === 0) {
    return false;
  }
  try {
    return node_fs.existsSync(node_path.join(v1173.trim(), ConfigFileName));
  } catch {
    return false;
  }
}
function first(v1174, ...v1175) {
  for (const v1176 of v1175) {
    const v1177 = v1174[v1176];
    if (typeof v1177 === "string") {
      const v1178 = v1177.trim();
      if (v1178.length > 0) {
        return v1178;
      }
    }
  }
  return "";
}
function readProjectConfig(v1179, v1180) {
  const v1181 = node_path.join(v1180, ConfigFileName);
  let v1182 = v1180.replace(/[/\\]+$/, "").split(/[/\\]/).pop() ?? v1180;
  const v1183 = {
    templateId: "",
    vendor: "",
    family: "",
    model: "",
    language: "",
    canvas: "",
    mainFile: "",
    lintProfile: "",
    integration: "",
    opennessVersion: ""
  };
  const v1184 = [];
  if (!node_fs.existsSync(v1181)) {
    let v1185 = false;
    try {
      v1185 = node_fs.readdirSync(v1180, {
        withFileTypes: true
      }).some(v1186 => v1186.isDirectory() && node_fs.existsSync(node_path.join(v1180, v1186.name, ConfigFileName)));
    } catch {
      v1185 = false;
    }
    if (!v1185) {
      v1184.push("未找到工程配置 " + ConfigFileName + "，已按普通文件夹打开：AI 无法按路线生成代码。若这是 PLC 工程，请用\"新建工程\"创建，或补全配置文件。");
    }
    return {
      name: v1182,
      project: v1183,
      warnings: v1184,
      isCollection: v1185
    };
  }
  let v1187;
  try {
    v1187 = JSON.parse(node_fs.readFileSync(v1181, "utf-8"));
  } catch {
    v1184.push("工程配置 " + ConfigFileName + " 解析失败，已按普通文件夹打开：路线/模型/lint 功能不可用。可让 AI 修复该文件后重新打开工程。");
    return {
      name: v1182,
      project: v1183,
      warnings: v1184,
      isCollection: false
    };
  }
  const v1188 = first(v1187, "name");
  if (v1188.length > 0) {
    v1182 = v1188;
  }
  const v1189 = {
    templateId: first(v1187, "templateId", "template_id"),
    vendor: first(v1187, "vendor", "vendorName"),
    family: first(v1187, "family", "familyName"),
    model: first(v1187, "model"),
    series: first(v1187, "series"),
    language: first(v1187, "displayLanguage", "language", "sourceLanguage"),
    canvas: first(v1187, "canvas"),
    mainFile: first(v1187, "mainFile", "main_file"),
    lintProfile: first(v1187, "lintProfile", "lint_profile"),
    integration: first(v1187, "integration"),
    opennessVersion: first(v1187, "opennessVersion", "openness_version")
  };
  if (v1189.integration === "weinview_native" && typeof v1187.weinview_model_key === "string" && typeof v1187.weinview_has_display === "boolean" && (v1187.weinview_project_format === "emtp" || v1187.weinview_project_format === "cmtp")) {
    const v1190 = typeof v1187.weinview_canvas_width === "number" && Number.isInteger(v1187.weinview_canvas_width) && v1187.weinview_canvas_width >= 0 ? v1187.weinview_canvas_width : null;
    const v1191 = typeof v1187.weinview_canvas_height === "number" && Number.isInteger(v1187.weinview_canvas_height) && v1187.weinview_canvas_height >= 0 ? v1187.weinview_canvas_height : null;
    v1189.weinview = {
      modelKey: v1187.weinview_model_key,
      format: v1187.weinview_project_format,
      hasDisplay: v1187.weinview_has_display,
      width: v1190,
      height: v1191,
      orientation: v1187.weinview_orientation === "vertical" || !v1187.weinview_orientation && v1190 !== null && v1191 !== null && v1191 > v1190 ? "vertical" : "horizontal",
      installationExePath: typeof v1187.weinview_installation_exe_path === "string" ? v1187.weinview_installation_exe_path : undefined
    };
  }
  const v1192 = canonicalFamily(v1179, v1189.family);
  const v1193 = v1189.integration.toLowerCase() === "tia_openness" || v1192 === "tia_openness";
  const v1194 = v1193 || isEngineRecognizedRoute(v1179, v1192, v1189.language);
  if (!v1194) {
    v1184.push(v1189.templateId.length > 0 ? "工程配置的 templateId 可识别，但 family/language 字段缺失或不规范（family=\"" + v1189.family + "\"，language=\"" + v1189.language + "\"）：AI 可能无法按路线生成代码，请补全这两个字段。" : "工程配置声明的路线无法识别（templateId=\"" + v1189.templateId + "\"，family=\"" + v1189.family + "\"，language=\"" + v1189.language + "\"）：AI 将无法按正确路线生成代码，请检查 " + ConfigFileName + "。");
  }
  if (v1189.mainFile.length > 0) {
    const v1195 = node_path.join(v1180, v1189.mainFile.replace(/\//g, node_path.sep));
    if (!node_fs.existsSync(v1195)) {
      v1184.push("配置声明的主文件 " + v1189.mainFile + " 在此文件夹中不存在——可能绑错了目录，或文件已被移动/改名。");
    }
  }
  return {
    name: v1182,
    project: v1189,
    warnings: v1184,
    isCollection: false
  };
}
function languageFor(v1196) {
  switch (v1196.toLowerCase()) {
    case ".csv":
      return "CSV";
    case ".awl":
    case ".stl":
      return "AWL";
    case ".scl":
      return "SCL";
    case ".st":
      return "ST";
    case ".xml":
      return "XML";
    default:
      return "TEXT";
  }
}
function scanWorkspaceFiles(v1197) {
  const v1198 = [];
  const v1199 = [];
  const v1200 = looksLikeDevRepo(v1197);
  function v1201(v1202) {
    let v1203;
    try {
      v1203 = node_fs.readdirSync(v1202);
    } catch (v1204) {
      const v1205 = node_path.relative(v1197, v1202).replace(/\\/g, "/");
      v1199.push((v1205 === "" ? "(工程根目录)" : v1205) + "（" + v1204.message + "）");
      return;
    }
    for (const v1206 of v1203) {
      const v1207 = v1206.toLowerCase();
      if (SKIP_NAMES.has(v1207)) {
        continue;
      }
      if (v1200 && REPO_SKIP_NAMES.has(v1207)) {
        continue;
      }
      const v1208 = node_path.join(v1202, v1206);
      let v1209;
      try {
        v1209 = node_fs.statSync(v1208);
      } catch {
        continue;
      }
      if (v1209.isDirectory()) {
        v1201(v1208);
      } else if (isSourceExtension(node_path.extname(v1206))) {
        v1198.push({
          path: node_path.relative(v1197, v1208).replace(/\\/g, "/"),
          language: languageFor(node_path.extname(v1206))
        });
      }
    }
  }
  v1201(v1197);
  v1198.sort((v1210, v1211) => v1210.path < v1211.path ? -1 : v1210.path > v1211.path ? 1 : 0);
  return {
    files: v1198,
    skipped: v1199
  };
}
function scanStagingArtifactFiles(v1212) {
  const v1213 = [];
  const v1214 = [];
  const v1215 = looksLikeDevRepo(v1212);
  function v1216(v1217) {
    let v1218;
    try {
      v1218 = node_fs.readdirSync(v1217);
    } catch (v1219) {
      const v1220 = node_path.relative(v1212, v1217).replace(/\\/g, "/");
      v1214.push((v1220 === "" ? "(暂存根目录)" : v1220) + "（" + v1219.message + "）");
      return;
    }
    for (const v1221 of v1218) {
      const v1222 = v1221.toLowerCase();
      if (SKIP_NAMES.has(v1222)) {
        continue;
      }
      if (v1215 && REPO_SKIP_NAMES.has(v1222)) {
        continue;
      }
      const v1223 = node_path.join(v1217, v1221);
      let v1224;
      try {
        v1224 = node_fs.statSync(v1223);
      } catch {
        continue;
      }
      if (v1224.isDirectory()) {
        v1216(v1223);
      } else if (isArtifactExtension(node_path.extname(v1221))) {
        v1213.push({
          path: node_path.relative(v1212, v1223).replace(/\\/g, "/"),
          language: languageFor(node_path.extname(v1221))
        });
      }
    }
  }
  v1216(v1212);
  v1213.sort((v1225, v1226) => v1225.path < v1226.path ? -1 : v1225.path > v1226.path ? 1 : 0);
  return {
    files: v1213,
    skipped: v1214
  };
}
function realFileExists(v1227, v1228) {
  try {
    return node_fs.existsSync(node_path.join(v1227, v1228.replace(/\//g, node_path.sep)));
  } catch {
    return false;
  }
}
function stagingFileDiffersFromReal(v1229, v1230, v1231) {
  if (!realFileExists(v1229, v1231)) {
    return true;
  }
  try {
    return readWorkspaceFileByRelPath(v1229, v1231) !== readWorkspaceFileByRelPath(v1230, v1231);
  } catch {
    return true;
  }
}
function readWorkspaceFileByRelPath(v1232, v1233) {
  assertCanvasTextPath(v1233);
  return readWorkspaceFile(node_path.join(v1232, v1233.replace(/\//g, node_path.sep)));
}
function writeProjectConfig(v1234, v1235, v1236) {
  const v1237 = v1236?.trim() || v1234.replace(/[/\\]+$/, "").split(/[/\\]/).pop() || v1235.name;
  const v1238 = {
    schemaVersion: 1,
    name: v1237,
    templateId: v1235.id,
    vendor: v1235.vendor,
    vendorName: v1235.vendorName,
    family: v1235.family,
    series: v1235.series,
    model: v1235.defaultModel,
    language: v1235.language,
    displayLanguage: v1235.displayLanguage,
    canvas: v1235.canvas,
    mainFile: ["tia_openness", "weinview_native"].includes(v1235.integration) ? "" : v1235.mainFile,
    lintProfile: v1235.lintProfile,
    integration: v1235.integration,
    opennessVersion: ""
  };
  node_fs.writeFileSync(node_path.join(v1234, ConfigFileName), JSON.stringify(v1238, null, 2) + "\n", "utf-8");
}
function seedMainFile(v1239, v1240) {
  if (v1240.integration === "tia_openness" || v1240.integration === "weinview_native") {
    return;
  }
  if (!v1240.mainFile) {
    return;
  }
  assertCanvasTextPath(v1240.mainFile);
  const v1241 = node_path.join(v1239, v1240.mainFile.replace(/\//g, node_path.sep));
  if (node_fs.existsSync(v1241)) {
    return;
  }
  node_fs.mkdirSync(node_path.join(v1241, ".."), {
    recursive: true
  });
  let v1242 = "";
  if (v1240.canvas === "csv") {
    const v1243 = parseCsv("", v1240.mainFile);
    v1242 = serializeCsv(v1243, v1240.family === "fx2");
  }
  node_fs.writeFileSync(v1241, v1242, "utf-8");
}
function errnoCode(v1244) {
  const v1245 = v1244?.code;
  if (typeof v1245 === "string" && v1245.length > 0) {
    return v1245;
  } else {
    return "EUNKNOWN";
  }
}
function removeTreeByHand(v1246) {
  let v1247;
  try {
    v1247 = node_fs.lstatSync(v1246);
  } catch (v1248) {
    const v1249 = errnoCode(v1248);
    if (v1249 === "ENOENT") {
      return {
        ok: true
      };
    } else {
      return {
        ok: false,
        code: v1249,
        path: v1246
      };
    }
  }
  if (!v1247.isDirectory()) {
    try {
      node_fs.unlinkSync(v1246);
      return {
        ok: true
      };
    } catch (v1250) {
      return {
        ok: false,
        code: errnoCode(v1250),
        path: v1246
      };
    }
  }
  let v1251;
  try {
    v1251 = node_fs.readdirSync(v1246);
  } catch (v1252) {
    return {
      ok: false,
      code: errnoCode(v1252),
      path: v1246
    };
  }
  for (const v1253 of v1251) {
    const v1254 = node_path.join(v1246, v1253);
    const v1255 = removeTreeByHand(v1254);
    if (!v1255.ok) {
      return v1255;
    }
  }
  try {
    node_fs.rmdirSync(v1246);
    return {
      ok: true
    };
  } catch (v1256) {
    return {
      ok: false,
      code: errnoCode(v1256),
      path: v1246
    };
  }
}
function clearDirectoryContents(v1257) {
  const v1258 = [];
  let v1259 = 0;
  let v1260;
  try {
    v1260 = node_fs.readdirSync(v1257);
  } catch (v1261) {
    const v1262 = errnoCode(v1261);
    if (v1262 !== "ENOENT") {
      v1258.push(v1257 + " (" + v1262 + ")");
    }
    return {
      removed: v1259,
      failures: v1258
    };
  }
  for (const v1263 of v1260) {
    const v1264 = node_path.join(v1257, v1263);
    const v1265 = removeTreeByHand(v1264);
    if (v1265.ok) {
      v1259 += 1;
    } else {
      v1258.push(v1265.path + " (" + v1265.code + ")");
    }
  }
  return {
    removed: v1259,
    failures: v1258
  };
}
function isPortalProcess(v1266) {
  if (!v1266 || typeof v1266 !== "object") {
    return false;
  }
  const v1267 = v1266;
  return v1267.isAuxiliaryProcess !== true && typeof v1267.name === "string" && /^Siemens\.Automation\.Portal(?:\.exe)?$/i.test(v1267.name);
}
function tiaVersion(v1268) {
  if (typeof v1268 !== "string") {
    return "";
  }
  const v1269 = v1268.trim().match(/^v?(1[6-9]|2[01])(?:\.0)?$/i);
  if (v1269) {
    return "V" + v1269[1];
  } else {
    return "";
  }
}
const LOCK_FILE_NAME = ".plccode-tia-lock.json";
const SCAN_FILE_NAME = ".plccode-tia-scan.json";
const CURRENT_SCHEMA_VERSION = 1;
function normalize(v1270) {
  let v1271 = (v1270 ?? "").trim();
  if (v1271.length === 0) {
    return "";
  }
  if (v1271.startsWith("V") || v1271.startsWith("v")) {
    v1271 = v1271.slice(1);
  }
  if (v1271.length === 0) {
    return "";
  }
  const v1272 = v1271.split(".");
  if (v1272.length > 2) {
    return "";
  }
  for (const v1273 of v1272) {
    if (v1273.length === 0 || !/^[0-9]+$/.test(v1273)) {
      return "";
    }
  }
  const v1274 = v1272[0];
  if (v1272.length === 1) {
    return "V" + v1274;
  }
  const v1275 = v1272[1];
  if (v1274 === "15" && v1275 === "1") {
    return "V15.1";
  }
  if (v1275 === "0") {
    return "V" + v1274;
  } else {
    return "";
  }
}
function sortVersions(v1276) {
  const v1277 = [];
  for (const v1278 of v1276) {
    const v1279 = normalize(v1278);
    if (v1279.length > 0 && !v1277.includes(v1279)) {
      v1277.push(v1279);
    }
  }
  return v1277.slice().sort((v1280, v1281) => {
    const v1282 = Number.parseFloat(v1280.slice(1));
    const v1283 = Number.parseFloat(v1281.slice(1));
    return (Number.isFinite(v1282) ? v1282 : 0) - (Number.isFinite(v1283) ? v1283 : 0);
  });
}
function timestampNow$1() {
  const v1284 = new Date();
  const v1285 = v1286 => String(v1286).padStart(2, "0");
  const v1287 = -v1284.getTimezoneOffset();
  const v1288 = v1287 >= 0 ? "+" : "-";
  const v1289 = Math.abs(v1287);
  const v1290 = "" + v1288 + v1285(Math.floor(v1289 / 60)) + ":" + v1285(v1289 % 60);
  return v1284.getFullYear() + "-" + v1285(v1284.getMonth() + 1) + "-" + v1285(v1284.getDate()) + "T" + v1285(v1284.getHours()) + ":" + v1285(v1284.getMinutes()) + ":" + v1285(v1284.getSeconds()) + v1290;
}
function versionNumberOf(v1291) {
  if (typeof v1291 !== "object" || v1291 === null) {
    return "";
  }
  const v1292 = v1291;
  for (const v1293 of ["VersionNumber", "versionNumber"]) {
    const v1294 = v1292[v1293];
    if (typeof v1294 === "number" && Number.isInteger(v1294)) {
      return String(v1294);
    }
  }
  return "";
}
function addNormalized(v1295, v1296) {
  const v1297 = normalize(v1296);
  if (v1297.length > 0 && !v1295.includes(v1297)) {
    v1295.push(v1297);
  }
}
function scanFromStatusJson(v1298) {
  const v1299 = [];
  const v1300 = [];
  try {
    const v1301 = JSON.parse(v1298);
    const v1302 = v1301?.data;
    if (v1302 && typeof v1302 === "object") {
      const v1303 = v1302;
      const v1304 = v1303.installedPortalVersions;
      if (Array.isArray(v1304)) {
        for (const v1305 of v1304) {
          addNormalized(v1299, versionNumberOf(v1305));
        }
      }
      const v1306 = v1303.runningProcesses;
      if (Array.isArray(v1306)) {
        for (const v1307 of v1306) {
          if (isPortalProcess(v1307) && typeof v1307.portalVersion === "string") {
            addNormalized(v1300, v1307.portalVersion);
          }
        }
      }
      const v1308 = v1303.selectedRoute;
      if (v1308 && typeof v1308 === "object") {
        const v1309 = v1308;
        if (Array.isArray(v1309.runningPortalVersions)) {
          v1300.length = 0;
          for (const v1310 of v1309.runningPortalVersions) {
            if (typeof v1310 === "string") {
              addNormalized(v1300, v1310);
            }
          }
        } else if (v1309.portalGuiRunning === true && typeof v1309.runningPortalVersion === "string") {
          addNormalized(v1300, v1309.runningPortalVersion);
        }
      }
    }
  } catch {}
  return {
    scannedAt: timestampNow$1(),
    installedVersions: sortVersions(v1299),
    runningVersions: sortVersions(v1300)
  };
}
function stringOf(v1311, v1312) {
  const v1313 = v1311[v1312];
  if (typeof v1313 === "string") {
    return v1313;
  } else {
    return "";
  }
}
function intOf(v1314, v1315) {
  const v1316 = v1314[v1315];
  if (typeof v1316 === "number" && Number.isInteger(v1316)) {
    return v1316;
  } else {
    return 0;
  }
}
function scanOf(v1317) {
  if (!v1317 || typeof v1317 !== "object") {
    return null;
  }
  const v1318 = v1317;
  return {
    scannedAt: stringOf(v1318, "scannedAt"),
    installedVersions: arrayOf$2(v1318, "installedVersions"),
    runningVersions: arrayOf$2(v1318, "runningVersions")
  };
}
function arrayOf$2(v1319, v1320) {
  const v1321 = [];
  const v1322 = v1319[v1320];
  if (Array.isArray(v1322)) {
    for (const v1323 of v1322) {
      if (typeof v1323 === "string") {
        const v1324 = normalize(v1323);
        if (v1324.length > 0 && !v1321.includes(v1324)) {
          v1321.push(v1324);
        }
      }
    }
  }
  return v1321;
}
function parseLock(v1325) {
  try {
    const v1326 = JSON.parse(v1325);
    if (typeof v1326 !== "object" || v1326 === null) {
      return null;
    }
    if (intOf(v1326, "schemaVersion") !== CURRENT_SCHEMA_VERSION) {
      return null;
    }
    const v1327 = normalize(stringOf(v1326, "lockedVersion"));
    if (v1327.length === 0) {
      return null;
    }
    return {
      lockedVersion: v1327,
      lockedBy: stringOf(v1326, "lockedBy"),
      lockedAt: stringOf(v1326, "lockedAt"),
      scan: scanOf(v1326.scan)
    };
  } catch {
    return null;
  }
}
function lockToJson(v1328) {
  const v1329 = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    lockedVersion: v1328.lockedVersion,
    lockedBy: v1328.lockedBy,
    lockedAt: v1328.lockedAt
  };
  if (v1328.scan) {
    v1329.scan = {
      scannedAt: v1328.scan.scannedAt,
      installedVersions: sortVersions(v1328.scan.installedVersions),
      runningVersions: sortVersions(v1328.scan.runningVersions)
    };
  }
  return JSON.stringify(v1329, null, 2) + "\n";
}
const HOST_MISMATCH_CODES = ["TIA_NO_RUNNING_PORTAL"];
function isHostVersionMismatch(v1330) {
  return !!v1330 && HOST_MISMATCH_CODES.some(v1331 => v1330.includes(v1331));
}
const TIA_SIDECAR_FILE_NAMES = [LOCK_FILE_NAME, SCAN_FILE_NAME];
function copyTiaSidecars(v1332, v1333) {
  for (const v1334 of TIA_SIDECAR_FILE_NAMES) {
    const v1335 = node_path.join(v1333, v1334);
    if (!node_fs.existsSync(v1335)) {
      continue;
    }
    try {
      node_fs.copyFileSync(v1335, node_path.join(v1332, v1334));
    } catch {}
  }
}
function safeLeaf(v1336) {
  const v1337 = v1336.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim();
  const v1338 = v1337.length > 0 ? v1337 : "proj";
  if (v1338.length > 40) {
    return v1338.slice(0, 40);
  } else {
    return v1338;
  }
}
function stagingRootFor(v1339, v1340) {
  const v1341 = v1340.replace(/[/\\]+$/, "");
  const v1342 = node_crypto.createHash("sha256").update(v1341.toLowerCase(), "utf-8").digest("hex").slice(0, 16);
  const v1343 = safeLeaf(node_path.basename(v1341));
  return node_path.join(v1339, "staging", v1343 + "-" + v1342);
}
function isLabelsFile$1(v1344) {
  return node_path.basename(v1344).toLowerCase().includes("label");
}
function normalizeToLf(v1345) {
  return (v1345 ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function normalizeToCrlf(v1346) {
  return normalizeToLf(v1346).replace(/\n/g, "\r\n");
}
function writeStagingFile(v1347, v1348) {
  assertCanvasTextPath(v1347);
  node_fs.mkdirSync(node_path.dirname(v1347), {
    recursive: true
  });
  if (isCsv(v1347)) {
    const v1349 = isLabelsFile$1(v1347) ? normalizeToLf(v1348) : normalizeToCrlf(v1348);
    const v1350 = Buffer.from([255, 254]);
    const v1351 = Buffer.from(v1349, "utf16le");
    node_fs.writeFileSync(v1347, Buffer.concat([v1350, v1351]));
  } else {
    node_fs.writeFileSync(v1347, v1348 ?? "", "utf-8");
  }
}
function seedStaging(v1352, v1353, v1354, v1355) {
  for (const v1356 of v1354) {
    assertCanvasTextPath(v1356.path);
  }
  const v1357 = clearDirectoryContents(v1352);
  if (v1357.failures.length > 0) {
    console.warn("[staging] " + v1352 + ": " + v1357.failures.length + " entr(ies) could not be cleared before re-seed: " + v1357.failures.slice(0, 3).join("; "));
  }
  node_fs.mkdirSync(v1352, {
    recursive: true
  });
  const v1358 = node_path.join(v1353, ConfigFileName);
  if (node_fs.existsSync(v1358)) {
    try {
      node_fs.copyFileSync(v1358, node_path.join(v1352, ConfigFileName));
    } catch {}
  }
  copyTiaSidecars(v1352, v1353);
  for (const v1359 of v1354) {
    const v1360 = v1355(v1359.path);
    writeStagingFile(node_path.join(v1352, v1359.path.replace(/\//g, node_path.sep)), v1360);
  }
}
function normNl$1(v1361) {
  return (v1361 ?? "").replace(/\r\n/g, "\n");
}
function countUnpromoted(v1362, v1363) {
  if (!v1362 || !node_fs.existsSync(v1362)) {
    return 0;
  }
  let v1364 = 0;
  let v1365 = 0;
  function v1366(v1367, v1368) {
    let v1369;
    try {
      v1369 = readWorkspaceFile(v1368);
    } catch {
      v1365++;
      return;
    }
    let v1370;
    try {
      v1370 = node_path.join(v1363, v1367.replace(/\//g, node_path.sep));
    } catch {
      v1364++;
      return;
    }
    if (!node_fs.existsSync(v1370)) {
      v1364++;
      return;
    }
    try {
      if (normNl$1(readWorkspaceFile(v1370)) !== normNl$1(v1369)) {
        v1364++;
      }
    } catch {
      v1364++;
    }
  }
  function v1371(v1372, v1373) {
    let v1374;
    try {
      v1374 = node_fs.readdirSync(v1372);
    } catch {
      v1365++;
      return;
    }
    for (const v1375 of v1374) {
      if (STAGING_WALK_SKIP_NAMES.has(v1375.toLowerCase())) {
        continue;
      }
      const v1376 = node_path.join(v1372, v1375);
      let v1377;
      try {
        v1377 = node_fs.statSync(v1376);
      } catch {
        v1365++;
        continue;
      }
      if (v1377.isDirectory()) {
        v1371(v1376, v1373.length > 0 ? v1373 + "/" + v1375 : v1375);
      } else {
        v1366(v1373.length > 0 ? v1373 + "/" + v1375 : v1375, v1376);
      }
    }
  }
  try {
    v1371(v1362, "");
    if (v1365 > 0) {
      return v1364 + 1;
    }
    return v1364;
  } catch {
    return 1;
  }
}
function resetStagingFromReal(v1378, v1379, v1380) {
  for (const v1381 of v1380) {
    assertCanvasTextPath(v1381.path);
  }
  const v1382 = v1378;
  const v1383 = v1379;
  if (v1382.replace(/[/\\]+$/, "").toLowerCase() === v1383.replace(/[/\\]+$/, "").toLowerCase()) {
    throw new Error("staging root must not be the real workspace root");
  }
  const v1384 = node_path.dirname(v1382);
  node_fs.mkdirSync(v1384, {
    recursive: true
  });
  const v1385 = node_path.join(v1384, "." + node_path.basename(v1382) + ".reset-" + node_crypto.createHash("sha1").update(String(Math.random())).digest("hex").slice(0, 12));
  const v1386 = [];
  try {
    seedStaging(v1385, v1383, v1380, v1387 => {
      try {
        return readWorkspaceFileByRelPath(v1383, v1387);
      } catch {
        return "";
      }
    });
    node_fs.mkdirSync(v1382, {
      recursive: true
    });
    const v1388 = new Set(node_fs.readdirSync(v1385));
    for (const v1389 of node_fs.readdirSync(v1382)) {
      if (v1388.has(v1389)) {
        continue;
      }
      const v1390 = removeTreeByHand(node_path.join(v1382, v1389));
      if (!v1390.ok) {
        v1386.push(v1390.path + " (" + v1390.code + ")");
      }
    }
    for (const v1391 of node_fs.readdirSync(v1385)) {
      const v1392 = node_path.join(v1385, v1391);
      const v1393 = node_path.join(v1382, v1391);
      const v1394 = removeTreeByHand(v1393);
      if (!v1394.ok) {
        v1386.push(v1394.path + " (" + v1394.code + ")");
        continue;
      }
      try {
        node_fs.renameSync(v1392, v1393);
      } catch (v1395) {
        v1386.push(v1393 + " (" + (v1395.code ?? "EUNKNOWN") + ")");
      }
    }
  } finally {
    if (node_fs.existsSync(v1385)) {
      const v1396 = removeTreeByHand(v1385);
      if (!v1396.ok) {
        console.warn("[staging] temp dir not removed: " + v1396.path + " (" + v1396.code + ")");
      }
    }
  }
  if (v1386.length > 0) {
    throw new Error("staging 目录部分内容无法替换（被占用或权限不足）：" + v1386.slice(0, 3).join("; "));
  }
}
const VENDOR_LABEL_ZH = {
  mitsubishi: "三菱",
  siemens: "西门子",
  inovance: "汇川",
  codesys: "CODESYS",
  weinview: "威纶通"
};
function friendlyRouteLabel(v1397) {
  const v1398 = VENDOR_LABEL_ZH[v1397.vendor] ?? v1397.vendorName;
  const v1399 = v1397.canvas === "csv" ? v1397.series + " · 梯形图/指令表 CSV" : v1397.series + " · " + v1397.displayLanguage;
  return v1398 + " " + v1399;
}
const SOFTWARE_CHOICES = [{
  id: "gxworks3",
  routeId: "mitsubishi-gxworks3-native",
  label: "三菱 GX Works3",
  vendor: "三菱",
  description: "ST / LAD 与标签批量编辑 · 原厂编译、仿真与结果回读",
  canvas: "code"
}, {
  id: "gxworks2",
  routeId: "mitsubishi-gxworks2-native",
  label: "三菱 GX Works2",
  vendor: "三菱",
  description: "工程读写 · ST / LAD · 原厂编译、仿真与结果回读",
  canvas: "code"
}, {
  id: "weinview",
  routeId: "weinview-native",
  label: "威纶通 EasyBuilder Pro",
  vendor: "威纶通",
  description: "画面设计、通信与报警 · 可接入已有工程或明确新建",
  canvas: "native",
  workspaceFolderPrefix: "PLCCode-Weinview",
  requiresAsciiPath: true
}, {
  id: "autoshop",
  routeId: "autoshop-litest",
  label: "汇川 AutoShop",
  vendor: "汇川",
  description: "LiteST / IL 文本代码 · 原厂编译与回读",
  canvas: "native"
}, {
  id: "inoproshop",
  routeId: "inoproshop-lad",
  label: "汇川 InoProShop",
  vendor: "汇川",
  description: "AM300 / AM400 / AM600 / AM800 · CODESYS 内核",
  canvas: "lad"
}, {
  id: "codesys",
  routeId: "codesys-v35-lad",
  label: "CODESYS 标准版",
  vendor: "CODESYS",
  description: "CODESYS V3.5 SP22 · 通用 CODESYS 内核 PLC · LAD / ST（非汇川）",
  canvas: "lad"
}, {
  id: "tia",
  routeId: "siemens-tia-openness",
  label: "西门子 TIA 博途",
  vendor: "西门子",
  description: "S7-300 / 400 / 1200 / 1500 · 连真机 TIA Portal",
  canvas: "code"
}, {
  id: "s7200",
  routeId: "siemens-s7-200-smart-awl",
  label: "西门子 S7-200 SMART",
  vendor: "西门子",
  description: "S7-200 SMART · AWL / STL 语句表",
  canvas: "code"
}];
function softwareChoiceById(v1400) {
  return SOFTWARE_CHOICES.find(v1401 => v1401.id === v1400);
}
function refuseSystemFolder(v1402) {
  const v1403 = node_path.resolve(v1402).replace(/[/\\]+$/, "").toLowerCase();
  if (/^[a-z]:$/.test(v1403)) {
    return "这是整个磁盘的根目录，不能当工程打开——请选具体的工程文件夹";
  }
  const v1404 = node_os.homedir();
  const v1405 = [v1404, node_path.join(v1404, "Desktop"), node_path.join(v1404, "Documents"), node_path.join(v1404, "Downloads")];
  for (const v1406 of ["OneDrive", "OneDriveConsumer", "OneDriveCommercial"]) {
    const v1407 = process.env[v1406];
    if (v1407 && v1407.trim().length > 0) {
      v1405.push(v1407, node_path.join(v1407, "Desktop"), node_path.join(v1407, "Documents"));
    }
  }
  for (const v1408 of v1405) {
    if (v1403 === node_path.resolve(v1408).replace(/[/\\]+$/, "").toLowerCase()) {
      return "这是「桌面」「文档」这类系统文件夹，不能整个当工程打开——请选（或新建）具体的工程文件夹";
    }
  }
  return null;
}
const PLAIN_FOLDER_FILE_CAP = 300;
function bindWorkspace(v1409, v1410, v1411, v1412 = false, v1413 = false, v1414) {
  let v1415;
  try {
    v1415 = v1411.trim();
    if (!node_fs.existsSync(v1415)) {
      return {
        result: {
          ok: false,
          error: "找不到这个文件夹，可能已被移动或删除"
        },
        bound: null
      };
    }
    node_fs.readdirSync(v1415);
  } catch {
    return {
      result: {
        ok: false,
        error: "打不开这个文件夹（可能没有访问权限）"
      },
      bound: null
    };
  }
  const v1416 = refuseSystemFolder(v1415);
  if (v1416) {
    return {
      result: {
        ok: false,
        error: v1416
      },
      bound: null
    };
  }
  if (v1414 && !hasProjectConfig(v1415)) {
    const v1417 = routeById(v1409, v1414);
    if (v1417) {
      try {
        writeProjectConfig(v1415, v1417);
        seedMainFile(v1415, v1417);
      } catch {}
    }
  }
  const {
    name: v1418,
    project: v1419,
    warnings: v1420,
    isCollection: v1421
  } = readProjectConfig(v1409, v1415);
  if (v1414 && !v1421 && v1419.templateId.length > 0 && v1419.templateId !== v1414) {
    const v1422 = routeById(v1409, v1414);
    const v1423 = routeById(v1409, v1419.templateId);
    v1420.push("你选的是「" + (v1422 ? friendlyRouteLabel(v1422) : v1414) + "」，但这个文件夹已经是「" + (v1423 ? friendlyRouteLabel(v1423) : v1419.templateId) + "」工程——已按文件夹里原有的设置打开，没有改动它。");
  }
  if (v1421) {
    let v1424 = [];
    try {
      v1424 = node_fs.readdirSync(v1415, {
        withFileTypes: true
      }).filter(v1425 => v1425.isDirectory() && hasProjectConfig(node_path.join(v1415, v1425.name))).map(v1426 => v1426.name);
    } catch {
      v1424 = [];
    }
    return {
      result: {
        ok: true,
        collection: true,
        root: v1415,
        name: v1418,
        subdirsWithConfig: v1424
      },
      bound: null
    };
  }
  const {
    files: v1427,
    skipped: v1428
  } = scanWorkspaceFiles(v1415);
  if (!hasProjectConfig(v1415) && v1427.length > PLAIN_FOLDER_FILE_CAP) {
    return {
      result: {
        ok: false,
        error: "这个文件夹里有 " + v1427.length + " 个代码文件，看起来不是一个 PLC 工程文件夹——请选具体的工程文件夹"
      },
      bound: null
    };
  }
  const v1429 = [...v1420];
  if (v1428.length > 0) {
    v1429.push("有 " + v1428.length + " 个目录无法读取，已跳过（权限/网络盘/路径过长）：" + v1428.slice(0, 3).join("、") + (v1428.length > 3 ? " 等" : "") + "。其中的文件 AI 读不到，也无法保存。");
  }
  const v1430 = stagingRootFor(v1410, v1415);
  const v1431 = v1432 => {
    try {
      return readWorkspaceFileByRelPath(v1415, v1432);
    } catch {
      return null;
    }
  };
  const v1433 = () => seedStaging(v1430, v1415, v1427, v1434 => {
    return v1431(v1434) ?? "";
  });
  const v1435 = node_fs.existsSync(v1430);
  let v1436 = 0;
  if (v1413 && v1435) ;else if (!v1435 || v1412 && !v1413) {
    v1433();
  } else {
    v1436 = countUnpromoted(v1430, v1415);
    if (v1436 === 0) {
      v1433();
    }
  }
  const v1437 = v1436 > 0 ? scanStagingArtifactFiles(v1430).files.filter(v1438 => stagingFileDiffersFromReal(v1415, v1430, v1438.path)) : [];
  const v1439 = new Set(v1427.map(v1440 => v1440.path));
  const v1441 = v1437.filter(v1442 => !v1439.has(v1442.path));
  const v1443 = v1441.length > 0 ? [...v1427, ...v1441] : v1427;
  const v1444 = {};
  for (const v1445 of v1427) {
    const v1446 = v1431(v1445.path);
    if (v1446 !== null) {
      v1444[v1445.path] = v1446;
    }
  }
  for (const v1447 of v1441) {
    const v1448 = v1431(v1447.path);
    if (v1448 !== null) {
      v1444[v1447.path] = v1448;
    }
  }
  return {
    result: {
      ok: true,
      collection: false,
      root: v1415,
      fileRoot: v1430,
      name: v1418,
      project: v1419,
      ...(v1419.integration === "weinview_native" ? {
        nativeProject: readVerifiedWeinviewProject(v1415) ?? undefined
      } : {}),
      files: v1443,
      warnings: v1429,
      realBaseline: v1444,
      ...(v1436 > 0 ? {
        unpromotedCount: v1436
      } : {})
    },
    bound: {
      root: v1415,
      stagingRoot: v1430,
      project: v1419,
      realBaseline: new Map(Object.entries(v1444))
    }
  };
}
function validateProjectName(v1449) {
  const v1450 = v1449.trim();
  if (v1450.length === 0) {
    return "先给工程起个名字";
  }
  if (/[\\/:*?"<>|]/.test(v1450)) {
    return "工程名里不能有这些符号：\\ / : * ? \" < > |";
  }
  for (let v1451 = 0; v1451 < v1450.length; v1451++) {
    if (v1450.charCodeAt(v1451) < 32) {
      return "这个名字系统不允许用作文件夹名，换一个吧";
    }
  }
  if (/[. ]$/.test(v1450) || /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(v1450)) {
    return "这个名字系统不允许用作文件夹名，换一个吧";
  }
  return null;
}
function createProject(v1452, v1453, v1454, v1455, v1456) {
  const v1457 = routeById(v1452, v1455);
  if (!v1457) {
    return {
      result: {
        ok: false,
        error: "未识别的工程类型，请重新选择"
      },
      bound: null
    };
  }
  const v1458 = validateProjectName(v1456);
  if (v1458) {
    return {
      result: {
        ok: false,
        error: v1458
      },
      bound: null
    };
  }
  const v1459 = v1456.trim();
  const v1460 = node_path.join(node_path.resolve(v1454.trim()), v1459);
  if (node_fs.existsSync(v1460)) {
    let v1461;
    try {
      v1461 = node_fs.readdirSync(v1460);
    } catch {
      return {
        result: {
          ok: false,
          error: "这个位置已经有一个同名文件夹且无法访问，换个名字吧"
        },
        bound: null
      };
    }
    if (v1461.length > 0) {
      return {
        result: {
          ok: false,
          error: "这个位置已经有同名文件夹了，而且里面有东西——换个名字，或把它移走"
        },
        bound: null
      };
    }
  } else {
    try {
      node_fs.mkdirSync(v1460, {
        recursive: true
      });
    } catch {
      return {
        result: {
          ok: false,
          error: "创建文件夹失败（可能没有访问权限，或路径不合法）"
        },
        bound: null
      };
    }
  }
  try {
    writeProjectConfig(v1460, v1457, v1459);
    seedMainFile(v1460, v1457);
  } catch {
    return {
      result: {
        ok: false,
        error: "写入工程配置失败（可能没有写入权限）"
      },
      bound: null
    };
  }
  return bindWorkspace(v1452, v1453, v1460, true, false, v1455);
}
function friendlyFsError(v1462) {
  const v1463 = (v1462.code ?? "").toUpperCase();
  const v1464 = (v1462.message ?? "").toLowerCase();
  switch (v1463) {
    case "EACCES":
    case "EPERM":
      return "没有写入权限（只读位置，或文件被安全软件/权限策略拦截）。请检查目标文件夹的写入权限。";
    case "EBUSY":
      return "文件正被其他程序占用（可能是 GX/TIA 或另一个编辑器打开着它）。请关闭占用它的程序后重试。";
    case "ENOSPC":
      return "磁盘空间不足，无法写入。请清理磁盘空间后重试。";
    case "ENOENT":
      return "目标路径不存在或已被移动/删除。请确认工程目录仍然存在。";
    case "EROFS":
      return "目标位置是只读文件系统，无法写入。";
    case "ENAMETOOLONG":
      return "路径过长，超出文件系统限制。";
  }
  if (v1464.includes("onedrive") || v1464.includes("cloud filter")) {
    return "目标文件可能是 OneDrive 联机占位文件，尚未同步到本地。请先在文件资源管理器中打开它一次，等待下载完成后重试。";
  }
  return "";
}
function normNl(v1465) {
  return (v1465 ?? "").replace(/\r\n/g, "\n");
}
function isLabelsFile(v1466) {
  return v1466.toLowerCase().includes("label");
}
function encodeWorkspaceFile(v1467, v1468) {
  const v1469 = v1468 ?? "";
  if (isCsv(v1467)) {
    const v1470 = isLabelsFile(v1467) ? v1469.replace(/\r\n/g, "\n").replace(/\r/g, "\n") : v1469.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "\r\n");
    const v1471 = Buffer.from([255, 254]);
    return Buffer.concat([v1471, Buffer.from(v1470, "utf16le")]);
  }
  return Buffer.from(v1469, "utf-8");
}
function promoteOneFile(v1472, v1473, v1474, v1475 = false) {
  try {
    assertCanvasTextPath(v1473);
  } catch (v1476) {
    return {
      ok: false,
      error: v1476.message
    };
  }
  let v1477;
  try {
    const v1478 = node_path.join(v1472.root, v1473.replace(/\//g, node_path.sep));
    const v1479 = node_path.resolve(v1472.root) + node_path.sep;
    if (node_path.resolve(v1478) !== node_path.resolve(v1472.root) && !node_path.resolve(v1478).startsWith(v1479)) {
      throw new Error("relPath escapes the project root: " + v1473);
    }
    if (node_fs.existsSync(v1478)) {
      v1477 = resolveWithinRoot(v1478, v1472.root);
    } else {
      const v1480 = node_path.dirname(v1478);
      node_fs.mkdirSync(v1480, {
        recursive: true
      });
      resolveWithinRoot(v1480, v1472.root);
      v1477 = v1478;
    }
  } catch (v1481) {
    return {
      ok: false,
      error: "目标不在允许的工程范围内: " + v1481.message
    };
  }
  try {
    assertCanvasTextPath(v1477);
    if (node_fs.existsSync(v1477) && !v1475) {
      let v1482;
      try {
        v1482 = readWorkspaceFile(v1477);
      } catch {
        return {
          ok: false,
          needsConfirm: true,
          diskContent: ""
        };
      }
      const v1483 = v1472.realBaseline.get(v1473) ?? null;
      const v1484 = v1483 === null || normNl(v1482) !== normNl(v1483);
      if (v1484 && normNl(v1482) !== normNl(v1474)) {
        return {
          ok: false,
          needsConfirm: true,
          diskContent: v1482
        };
      }
    }
    node_fs.mkdirSync(node_path.dirname(v1477), {
      recursive: true
    });
    const v1485 = encodeWorkspaceFile(v1477, v1474);
    const v1486 = v1477 + ".tmp-" + process.pid + "-" + Date.now();
    node_fs.writeFileSync(v1486, v1485);
    try {
      node_fs.renameSync(v1486, v1477);
    } catch (v1487) {
      try {
        node_fs.unlinkSync(v1486);
      } catch {}
      throw v1487;
    }
    return {
      ok: true
    };
  } catch (v1488) {
    const v1489 = v1488;
    const v1490 = friendlyFsError({
      code: v1489.code,
      message: v1489.message
    });
    return {
      ok: false,
      error: v1490.length > 0 ? v1490 + "（系统信息：" + v1489.message + "）" : v1489.message
    };
  }
}
class TiaToolError extends Error {
  code;
  constructor(v1491, v1492) {
    super(v1491);
    this.code = v1492;
  }
}
function tiaToolFailure(v1493) {
  for (let v1494 = v1493.indexOf("{"); v1494 >= 0; v1494 = v1493.indexOf("{", v1494 + 1)) {
    let v1495 = 0;
    let v1496 = false;
    let v1497 = false;
    for (let v1498 = v1494; v1498 < v1493.length; v1498++) {
      const v1499 = v1493[v1498];
      if (v1496) {
        if (v1497) {
          v1497 = false;
        } else if (v1499 === "\\") {
          v1497 = true;
        } else if (v1499 === "\"") {
          v1496 = false;
        }
        continue;
      }
      if (v1499 === "\"") {
        v1496 = true;
      } else if (v1499 === "{") {
        v1495++;
      } else if (v1499 === "}" && --v1495 === 0) {
        try {
          const v1500 = JSON.parse(v1493.slice(v1494, v1498 + 1));
          const v1501 = v1500.error ?? v1500.Error;
          const v1502 = v1501?.code ?? v1501?.Code;
          const v1503 = v1501?.message ?? v1501?.Message;
          if (typeof v1502 === "string") {
            return new TiaToolError(typeof v1503 === "string" ? v1503 : v1502, v1502);
          }
        } catch {}
        break;
      }
    }
  }
  const v1504 = v1493.match(/\bTIA_[A-Z0-9_]+\b/)?.[0] || "TIA_DIAGNOSTIC_FAILED";
  return new TiaToolError(v1493.trim().slice(0, 2000) || "诊断没有返回结果。", v1504);
}
async function runTiaTool(v1505, v1506, v1507, v1508, v1509) {
  return new Promise((v1510, v1511) => {
    const v1512 = node_child_process.spawn(v1505, [v1507], {
      cwd: v1506,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true
    });
    let v1513 = "";
    let v1514 = "";
    v1512.stdout.setEncoding("utf8");
    v1512.stderr.setEncoding("utf8");
    const v1515 = setTimeout(() => {
      try {
        v1512.kill();
      } catch {}
      v1511(new TiaToolError(v1507 + " 检查超时（" + v1509 + " ms）；请查看博途是否有弹窗或正在执行其它操作。", "TIA_DIAGNOSTIC_TIMEOUT"));
    }, v1509);
    v1512.stdout.on("data", v1516 => v1513 += v1516);
    v1512.stderr.on("data", v1517 => v1514 += v1517);
    v1512.on("error", v1518 => {
      clearTimeout(v1515);
      v1511(v1518);
    });
    v1512.on("close", v1519 => {
      clearTimeout(v1515);
      if (v1519 !== 0) {
        v1511(tiaToolFailure(v1514 + "\n" + v1513 || v1507 + " 失败（exit " + v1519 + "）"));
        return;
      }
      v1510(v1513.trim());
    });
    v1512.stdin.on("error", v1520 => {
      clearTimeout(v1515);
      v1511(new TiaToolError(v1520.message, "TIA_DIAGNOSTIC_PIPE_FAILED"));
    });
    v1512.stdin.end(JSON.stringify(v1508), "utf-8");
  });
}
function presenceFrom(v1521, v1522, v1523) {
  if (!v1521) {
    return "Unknown";
  }
  if (v1522 <= 0) {
    return "None";
  }
  if (v1523 > 0) {
    return "Ready";
  } else {
    return "WithoutOpenness";
  }
}
function statusText$1(v1524, v1525, v1526) {
  if (v1525) {
    return v1526;
  }
  switch (v1524) {
    case "None":
      return "这台电脑上没有安装博途（TIA Portal），所以打开工程、导入、编译、下载、仿真这些需要博途的操作都用不了。\n这不是 PLC Code 出错，也没有可以安装的替代品——博途是西门子的软件，要用它就得先装它。\n不装也能干的事：写程序、离线检查（三菱 FX、西门子 S7-200），以及生成可导入博途的 XML / SCL / STL 源文件，交给装了博途的同事或另一台电脑导入。";
    case "WithoutOpenness":
      return "这台电脑装了博途，但没有一个版本带「TIA Portal Openness」接口选件，PLC Code 无法驱动它。\n怎么办：重新运行对应版本的博途安装程序，在选件里勾上 Openness，装完后重新诊断。\n在那之前，离线生成与检查程序照常可用。";
    case "Unknown":
      return "未能检测博途安装状态，可用性无法判定。\n可在 设置 → TIA 连接 → 运行整机环境检查 查看完整结论。";
    default:
      return v1526;
  }
}
function probeFailureText(v1527) {
  let v1528 = "未能完成 TIA 诊断，因此无法判断这台电脑能否连接博途。\n请打开连接诊断重试并查看原始原因。超时、权限和缺少文件的处理方式不同，不能仅凭诊断失败认定需要重装。\n这不影响写程序与离线检查。";
  const v1529 = (v1527 ?? "").trim();
  if (v1529.length > 0) {
    v1528 += "\n系统报告：" + (v1529.length > 300 ? v1529.slice(0, 300) + "…" : v1529);
  }
  return v1528;
}
function probeFailureReport(v1530) {
  return {
    connected: false,
    connectionReady: false,
    probeOk: false,
    checkedAt: new Date().toISOString(),
    message: v1530,
    issues: [],
    version: "",
    whitelistNeedsTrust: false,
    whitelistStaleVersions: [],
    bridgeExePath: "",
    groupChecked: false,
    inGroup: false,
    presence: "Unknown",
    installedVersions: [],
    runningVersions: []
  };
}
function isTiaConnectionReady(v1531, v1532, v1533, v1534, v1535, v1536, v1537) {
  return v1531 && v1532 && v1533 && !v1534 && !v1535 && v1537;
}
function obj$2(v1538, v1539) {
  if (!v1538 || typeof v1538 !== "object") {
    return null;
  }
  const v1540 = v1538[v1539];
  if (v1540 && typeof v1540 === "object" && !Array.isArray(v1540)) {
    return v1540;
  } else {
    return null;
  }
}
function text(v1541, v1542, ...v1543) {
  if (!v1541) {
    return v1542;
  }
  for (const v1544 of v1543) {
    const v1545 = v1541[v1544];
    if (typeof v1545 === "string" && v1545.length > 0) {
      return v1545;
    }
  }
  return v1542;
}
function isTrue(v1546, v1547) {
  return !!v1546 && v1546[v1547] === true;
}
function parseTiaStatus(v1548) {
  let v1549;
  try {
    const v1550 = JSON.parse(v1548);
    if (typeof v1550 !== "object" || v1550 === null) {
      throw new Error("not an object");
    }
    v1549 = v1550;
  } catch (v1551) {
    return {
      ...probeFailureReport(probeFailureText("诊断结果不是有效 JSON：" + v1551.message)),
      issues: [v1548.length > 500 ? v1548.slice(0, 500) : v1548]
    };
  }
  const v1552 = v1549.ok === true;
  const v1553 = obj$2(v1549, "data");
  const v1554 = v1553 ? obj$2(v1553, "selectedRoute") : null;
  const v1555 = !!v1554 && v1554.available === true;
  const v1556 = tiaVersion(v1554?.requestedVersion);
  const v1557 = v1556 || (v1554 ? text(v1554, "", "runningPortalVersion", "selectedPortalVersion", "selectedVersion") : "");
  let v1558 = 0;
  const v1559 = [];
  const v1560 = v1553?.runningProcesses;
  if (Array.isArray(v1560)) {
    for (const v1561 of v1560) {
      if (!isPortalProcess(v1561)) {
        continue;
      }
      v1558++;
      v1559.push({
        id: typeof v1561.id === "number" ? v1561.id : 0,
        version: tiaVersion(v1561.portalVersion),
        title: typeof v1561.mainWindowTitle === "string" ? v1561.mainWindowTitle : ""
      });
    }
  }
  const v1562 = v1559.some(v1563 => !v1557 || v1563.version === tiaVersion(v1557));
  const v1564 = [];
  let v1565 = false;
  const v1566 = [...(Array.isArray(v1549.issues) ? v1549.issues : []), ...(Array.isArray(v1553?.issues) ? v1553.issues : [])];
  if (Array.isArray(v1566)) {
    for (const v1567 of v1566) {
      const v1568 = v1567 && typeof v1567 === "object" ? v1567 : null;
      const v1569 = text(v1568, "", "Severity", "severity");
      const v1570 = text(v1568, "", "Title", "title", "id", "Id");
      const v1571 = text(v1568, "", "Detail", "detail", "message", "Message");
      if (v1569.toLowerCase() === "error") {
        v1565 = true;
      }
      const v1572 = v1569 + ": " + v1570 + ": " + v1571;
      if (!v1564.includes(v1572)) {
        v1564.push(v1572);
      }
    }
  }
  if (v1549.error !== undefined && v1549.error !== null) {
    const v1573 = JSON.stringify(v1549.error);
    v1564.push("bridge error: " + (v1573.length > 240 ? v1573.slice(0, 240) : v1573));
  }
  let v1574 = false;
  const v1575 = [];
  let v1576 = "";
  const v1577 = v1553 ? obj$2(v1553, "whitelist") : null;
  if (v1577) {
    v1574 = v1577.needsTrust === true;
    v1576 = text(v1577, "", "exePath");
    const v1578 = v1577.staleOrMissingVersions;
    if (Array.isArray(v1578)) {
      for (const v1579 of v1578) {
        if (typeof v1579 === "string") {
          v1575.push(v1579);
        }
      }
    }
    if (v1574 && v1575.length > 0) {
      v1564.push("桥接程序未被以下 TIA 版本信任（哈希过期或缺失）：" + v1575.join("、") + "。可在 设置 → TIA 连接 里点「一键信任桥接」修复。");
    }
  }
  let v1580 = false;
  let v1581 = false;
  const v1582 = v1553 ? obj$2(v1553, "opennessGroup") : null;
  if (v1582) {
    v1580 = isTrue(v1582, "checkedCurrentUser");
    v1581 = isTrue(v1582, "inGroup");
    if (v1580 && !v1581) {
      v1564.push("当前 Windows 用户不在 \"Siemens TIA Openness\" 组，Openness 无法连接。可在 设置 → TIA 连接 里点「加入 Openness 组」修复（需管理员，加入后须注销重登）。");
    }
  }
  let v1583 = false;
  let v1584 = 0;
  let v1585 = 0;
  const v1586 = v1553?.installedPortalVersions;
  if (Array.isArray(v1586)) {
    v1583 = true;
    v1584 = v1586.length;
  }
  const v1587 = v1553?.availablePublicApiVersions;
  if (Array.isArray(v1587)) {
    for (const v1588 of v1587) {
      if (v1588 && typeof v1588 === "object" && v1588.Exists === true) {
        v1585++;
      }
    }
  }
  const v1589 = presenceFrom(v1583 && v1552, v1584, v1585);
  const v1590 = scanFromStatusJson(v1548);
  const v1591 = !!v1557 && v1590.installedVersions.includes(tiaVersion(v1557));
  const v1592 = Array.isArray(v1587) && v1587.some(v1593 => v1593 && typeof v1593 === "object" && v1593.Exists === true && tiaVersion(v1593.HostPortalVersion) === tiaVersion(v1557));
  const v1594 = !!v1577 && typeof v1577.needsTrust === "boolean";
  const v1595 = v1574 && (!v1557 || v1575.length === 0 || v1575.some(v1596 => tiaVersion(v1596) === tiaVersion(v1557)));
  const v1597 = isTiaConnectionReady(v1552, v1555 && v1591 && v1592, v1562, v1565, v1595, true, v1580 && v1581) && v1594;
  if (v1564.length === 0 && !v1597 && v1589 === "Ready") {
    v1564.push("检测到 " + v1558 + " 个博途主进程；目标版本 " + (v1557 || "待选择") + "。");
  }
  const v1598 = v1597 ? "TIA " + v1557 + " 的连接前提已检查；尚需读取工程来验证 Openness 连接。" : v1552 ? "TIA 连接检查已返回，具体阻塞步骤见下方。" : "TIA 诊断未完成，不能判定为已连接。";
  return {
    connected: false,
    connectionReady: v1597,
    probeOk: v1552,
    checkedAt: new Date().toISOString(),
    requestedVersion: v1556,
    targetInstalled: v1591,
    targetApiAvailable: v1592,
    whitelistChecked: v1594,
    targetNeedsTrust: v1595,
    portals: v1559,
    message: statusText$1(v1589, v1597, v1598),
    issues: v1564,
    version: v1557,
    whitelistNeedsTrust: v1574,
    whitelistStaleVersions: v1575,
    bridgeExePath: v1576,
    groupChecked: v1580,
    inGroup: v1581,
    presence: v1589,
    installedVersions: v1590.installedVersions,
    runningVersions: v1590.runningVersions
  };
}
function tiaStatusProbeFailure(v1599) {
  return probeFailureReport(probeFailureText(v1599));
}
function environmentHealthUnavailable(v1600) {
  return {
    parsed: false,
    probed: false,
    verdict: "unknown",
    headline: "没能完成体检：" + trim1Line$1(v1600),
    tone: "danger",
    items: [],
    routes: [],
    hasProductFixable: false,
    nextActions: []
  };
}
function arrayOf$1(v1601, v1602) {
  if (!v1601 || typeof v1601 !== "object") {
    return [];
  }
  const v1603 = v1601[v1602];
  if (Array.isArray(v1603)) {
    return v1603.filter(v1604 => !!v1604 && typeof v1604 === "object");
  } else {
    return [];
  }
}
function str$3(v1605, v1606) {
  if (!v1605 || typeof v1605 !== "object") {
    return "";
  }
  const v1607 = v1605[v1606];
  if (typeof v1607 === "string") {
    return v1607;
  } else {
    return "";
  }
}
function bool$1(v1608, v1609) {
  if (!v1608 || typeof v1608 !== "object") {
    return false;
  }
  return v1608[v1609] === true;
}
function parseEnvironmentHealth(v1610) {
  let v1611;
  try {
    v1611 = JSON.parse(v1610);
  } catch (v1612) {
    return environmentHealthUnavailable("体检结果不是有效 JSON（" + v1612.message + "）。");
  }
  if (typeof v1611 !== "object" || v1611 === null || Array.isArray(v1611)) {
    return environmentHealthUnavailable("体检结果不是预期的格式。");
  }
  const v1613 = bool$1(v1611, "probed");
  const v1614 = str$3(v1611, "verdict");
  const v1615 = arrayOf$1(v1611, "checks").map(readItem);
  if (v1615.length === 0) {
    return environmentHealthUnavailable("体检结果里没有任何检查项。");
  }
  const v1616 = arrayOf$1(v1611, "routes").map(readRoute);
  const v1617 = [];
  for (const v1618 of arrayOf$1(v1611, "nextActions")) {
    const v1619 = str$3(v1618, "checkId");
    const v1620 = v1615.find(v1621 => v1621.id === v1619)?.id ?? v1619;
    let v1622 = "· " + itemTitle(v1620) + "：" + actionText(str$3(v1618, "code"), str$3(v1618, "action"));
    if (str$3(v1618, "tier") === "needs-it-administrator") {
      v1622 += "（当前账号做不了这一步，需要管理这台电脑的人来做）";
    } else if (bool$1(v1618, "needsAdministrator")) {
      v1622 += "（这一步需要管理员授权）";
    }
    v1617.push(v1622);
  }
  return {
    parsed: true,
    probed: v1613,
    verdict: v1614,
    headline: headlineText(v1614, v1615, v1616),
    tone: verdictTone(v1614),
    items: v1615,
    routes: v1616,
    hasProductFixable: v1615.some(v1623 => v1623.tier === "product-can-fix" && (v1623.status === "blocked" || v1623.status === "warning")),
    nextActions: v1617
  };
}
function itemTitle(v1624) {
  switch (v1624) {
    case "tia-portal":
      return "博途（TIA Portal）是否安装";
    case "openness-api":
      return "博途的 Openness 接口是否装上";
    case "account-rights":
      return "当前 Windows 账号的权限";
    case "openness-group":
      return "Windows 用户组「Siemens TIA Openness」";
    case "bridge-whitelist":
      return "博途对桥接程序的信任登记";
    case "tia-process-owner":
      return "正在运行的博途属于哪个账号";
    case "account-scope":
      return "这台电脑上的其它 Windows 账号";
    case "profile-storage":
      return "PLC Code 把这个账号的数据放在哪";
    case "plcsim-standard":
      return "随博途版本的 S7-PLCSIM 仿真器";
    case "plcsim-advanced":
      return "S7-PLCSIM Advanced";
    case "plcsim-classic":
      return "S7-300/400 的经典 S7-PLCSIM";
    case "license-service":
      return "授权管理服务（Automation License Manager）";
    case "admin-flags":
      return "「以管理员身份运行」标记";
    case "dotnet-framework":
      return "Windows 组件 .NET Framework 4.8";
    case "npcap":
      return "网络抓包驱动 npcap";
    case "virtual-adapter":
      return "PLCSIM 虚拟网卡";
    case "locale":
      return "系统语言与区域";
    case "":
      return "（未知项）";
    default:
      return v1624;
  }
}
function detailText(v1625, v1626) {
  switch (v1625) {
    case "TIA_PORTAL_INSTALLED":
      return "已安装，可用。";
    case "TIA_PORTAL_NOT_INSTALLED":
      return "这台电脑上没有装博途。博途是西门子的软件，PLC Code 装不了它，也没有替代品。";
    case "TIA_PORTAL_INVENTORY_UNREADABLE":
      return "读不到西门子的安装信息，装没装无法确认。";
    case "OPENNESS_REGISTERED":
      return "每个已安装的博途版本都注册了 Openness 接口。";
    case "OPENNESS_OPTION_NOT_INSTALLED":
      return "有博途版本没装 Openness 接口选件。";
    case "OPENNESS_WITHOUT_PORTAL":
      return "没有博途，也就谈不上 Openness。";
    case "OPENNESS_REGISTRATION_UNREADABLE":
      return "读不到 Openness 的注册信息。";
    case "OPENNESS_GROUP_ACTIVE":
      return "当前账号在这个组里，并且本次登录已经生效。";
    case "OPENNESS_GROUP_NEEDS_RELOGON":
      return "账号**已经**在组里，但当前这次 Windows 登录是加组之前开始的，所以还没生效。再加一次没有用——注销重新登录（或重启）即可。";
    case "OPENNESS_GROUP_NOT_A_MEMBER":
      return "组在，但当前账号不在组里。博途会拒绝一切 Openness 连接。";
    case "OPENNESS_GROUP_NOT_IN_SESSION":
      return "组在，但本次登录没带上它，而且读不到成员名单，判断不了是没加还是加了没重登。";
    case "OPENNESS_GROUP_MISSING":
      return "这台电脑上没有「Siemens TIA Openness」这个组——它由博途 Openness 选件安装时创建。";
    case "OPENNESS_GROUP_UNREADABLE":
      return "读不到 Windows 用户组信息。";
    case "WHITELIST_CHECKED_SEPARATELY":
      return "这一项由上面的「② TIA 对桥接程序的信任登记」专门检查，这里不重复算。";
    case "WHITELIST_WITHOUT_PORTAL":
      return "没有博途，也就没有白名单要过。";
    case "ACCOUNT_ELEVATED":
      return "PLC Code 当前以管理员身份运行，需要管理员的步骤可以直接做，不会再弹确认。";
    case "ACCOUNT_CAN_ELEVATE":
      return "当前账号是这台电脑的管理员。PLC Code 本身**故意**不以管理员身份运行，所以少数需要管理员的步骤会各弹一次 Windows 确认窗口，点「是」即可。";
    case "ACCOUNT_NOT_ADMINISTRATOR":
      return "当前账号不是管理员。已经登记信任并具备 Openness 用户组权限时，普通账号也可连接。需要补做登记时，Windows 会要求管理员账号和密码，请管理这台电脑的人协助。写程序和生成导入文件不受影响。";
    case "ACCOUNT_ELEVATION_BLOCKED_BY_POLICY":
      return "当前账号不是管理员，而且这台电脑被设置成**直接拒绝**普通账号的提权请求——连「让管理员来输一下密码」的框都不会弹出来。\n同样**不代表 PLC Code 用不了**：不需要管理员的部分完全不受影响。";
    case "ACCOUNT_RIGHTS_UNREADABLE":
    case "ACCOUNT_ADMIN_MEMBERSHIP_UNREADABLE":
      return "读不到当前账号的权限，所以「需要管理员的那些步骤在这台电脑上做不做得了」这件事没测到。";
    case "WHITELIST_NEEDS_ADMINISTRATOR":
      return "请先检查目标版本是否已信任当前连接程序。若已信任，无需再次登记；若缺失或失效，当前账号需要管理员协助。PLC Code 当前会在连接前检查登记，不能靠等待博途弹窗跳过。";
    case "TIA_PROCESS_NONE_RUNNING":
      return "现在没有博途 / PLCSIM 在运行，不存在「连不上正在开着的那个」的问题。";
    case "TIA_PROCESS_SAME_USER":
      return "正在运行的西门子程序都属于当前这个 Windows 账号，PLC Code 够得着。";
    case "TIA_PROCESS_FOREIGN_OWNER":
      return "正在运行的博途属于**另一个 Windows 账号**，或者它是以管理员身份启动的而 PLC Code 不是。Windows 有意把两者隔开：没有那份权限的程序，连去问一句都不行，更别说连上去。\n所以 PLC Code 连不上现在开着的这个博途，反复重试、重启 PLC Code、重新授权都没有用——卡住的地方在两个 Windows 账号之间，不在这两个程序里面。";
    case "TIA_PROCESS_PARTLY_FOREIGN_OWNER":
      return "有一部分正在运行的西门子程序不属于当前账号，PLC Code 够不着它们；属于当前账号的那些不受影响。";
    case "TIA_PROCESS_OWNER_UNREADABLE":
      return "读不到正在运行的博途 / PLCSIM 属于谁。";
    case "ACCOUNT_SCOPE_SINGLE_USER":
      return "这台电脑上只有当前这一个 Windows 账号，没有任何东西是和别人共用的。";
    case "ACCOUNT_SCOPE_SHARED_MACHINE":
      return "这台电脑上还有别的 Windows 账号。这不是故障，是一条提醒：三样东西的作用范围不一样。\n· 博途对连接程序的信任登记是**整机**的——谁登记一次，所有账号都受益；但它认程序的具体位置和版本，所以另一个账号用的若是另一份安装，仍要各自登记一次。\n· 让仿真器失控的「以管理员身份运行」标记是**每个账号各一份**——你这边清干净了，同事那边可能照样坏着。\n· PLC Code 自己的设置是每个账号各一份；对话记录跟着工程目录走，所以两个账号共用同一个工程目录时，对话记录也是共用的。";
    case "ACCOUNT_SCOPE_UNREADABLE":
      return "读不到这台电脑上有哪些 Windows 账号。";
    case "PROFILE_LOCAL":
      return "当前账号的 Windows 配置文件就在本机，PLC Code 的设置和记录不会离开这台电脑。";
    case "PROFILE_ROAMING":
      return "当前账号用的是**漫游配置文件**：每次注销，Windows 都会把配置文件复制到公司服务器上，好让它跟着你换电脑。\nPLC Code 的窗口设置和缓存放在 Windows **不参与复制**的那个目录里，不占用漫游额度；只有一份很小的账号级配置文件在配置文件里，会一起被复制走。对话记录和生成的文件都放在工程目录旁边，不进配置文件。";
    case "PROFILE_STORAGE_UNKNOWN":
    case "PROFILE_STORAGE_UNREADABLE":
      return "读不到当前账号的配置文件是不是会同步到服务器。";
    case "PLCSIM_STANDARD_READY":
      return "已安装且可驱动；V16/V17 由 PLC Code 自带的 WCF 边车驱动，V18 及以上走官方 gRPC 接口。";
    case "PLCSIM_STANDARD_VERSION_GAP":
      return "有博途版本没有配套的仿真器。仿真器必须与工程的博途版本一致，别的版本顶不上。";
    case "PLCSIM_STANDARD_NOT_INSTALLED":
      return "没装 S7-PLCSIM。S7-1200/1500 工程无法仿真（写程序、导入、编译不受影响）。";
    case "PLCSIM_STANDARD_NO_DRIVABLE_RUNTIME":
      return "装了 S7-PLCSIM，但这些安装里找不到能驱动的仿真运行时：V18 及以上走 resources\\bin 里的 gRPC 接口，V16/V17 走安装目录下 Bin 里的老运行时，两种都没找到——通常是装漏了或装坏了，修复安装即可。";
    case "PLCSIM_LEGACY_WCF_SIDECAR_MISSING":
      return "**不是版本不支持，也不是西门子那边的问题**：V16/V17 的 S7-1200/1500 是能仿真的，由 PLC Code 自带的一个程序（PlcSimLegacyWcfSidecar.exe）驱动，真机已经验证过（V16 启动→下载→运行→读值）。现在西门子那边一切正常，缺的是 PLC Code 自己的这个文件——重装或修复 PLC Code 就行，别去重装博途或仿真器。";
    case "PLCSIM_STANDARD_INVENTORY_UNREADABLE":
      return "读不到仿真器的安装信息。";
    case "PLCSIM_ADVANCED_INSTALLED":
      return "已安装。";
    case "PLCSIM_ADVANCED_NOT_INSTALLED":
      return "没装。**普通的 S7-1500 仿真不需要它**——那用随版本的 S7-PLCSIM 就够了。它是西门子另行售卖、另行授权的产品，只有要多台虚拟 PLC 或要让虚拟 PLC 出现在网络上才需要。";
    case "PLCSIM_ADVANCED_UNREADABLE":
      return "读不到 PLCSIM Advanced 的安装信息。";
    case "PLCSIM_CLASSIC_INSTALLED":
      return "已安装并注册。";
    case "PLCSIM_CLASSIC_NOT_INSTALLED":
      return "没装 S7-PLCSIM V5.x，S7-300/400 工程无法仿真（新仿真器只管 S7-1200/1500）。";
    case "PLCSIM_CLASSIC_REGISTERED_BUT_MISSING":
      return "注册还在，程序文件却没了——卸载没卸干净留下的。";
    case "PLCSIM_CLASSIC_UNREADABLE":
      return "读不到经典仿真器的注册信息。";
    case "LICENSE_SERVICE_RUNNING":
      return "授权服务在运行，授权请求有人应答。";
    case "LICENSE_SERVICE_NOT_RUNNING":
      return "授权服务装了但没在运行。**这不是授权过期、也不是缺授权**——服务停着时，PLCSIM Advanced 上电会报「找不到授权」，授权本身完全正常，不需要买、不需要修、不需要转移。";
    case "LICENSE_SERVICE_NOT_INSTALLED":
      return "没装授权管理器，没有任何东西能应答授权请求。同样不代表授权有问题。";
    case "LICENSE_SERVICE_UNKNOWN":
    case "LICENSE_SERVICE_UNREADABLE":
      return "读不到授权服务的状态。";
    case "ADMIN_FLAGS_CLEAR":
      return "没有 PLCSIM / 博途 程序被标记为「以管理员身份运行」。";
    case "ADMIN_FLAGS_PRESENT":
      return "有 PLCSIM / 博途 程序被 Windows 强制以管理员身份启动。PLC Code 没有管理员身份，于是能把仿真器启起来，却停不掉、也控制不了——看起来就像仿真器不听指挥。";
    case "ADMIN_FLAGS_UNREADABLE":
      return "读不到 Windows 兼容性设置。";
    case "NET_FRAMEWORK_OK":
      return "桥接程序需要的 Windows 组件已具备。";
    case "NET_FRAMEWORK_TOO_OLD":
      return "这台电脑的 .NET Framework 比桥接程序要求的 4.8 旧，桥接起不来，所有 TIA 操作都会失败。";
    case "NET_FRAMEWORK_UNREADABLE":
      return "读不到 .NET Framework 版本。";
    case "NPCAP_RUNNING":
      return "抓包驱动已安装并运行。";
    case "NPCAP_NOT_RUNNING":
      return "抓包驱动不可用。只影响「让虚拟 PLC 在网络上有自己的地址」，本机仿真不受影响。";
    case "NPCAP_NOT_NEEDED":
      return "用不到：它只服务 PLCSIM Advanced 的网络模式，而这台电脑没装 Advanced。";
    case "NPCAP_UNREADABLE":
      return "读不到抓包驱动状态。";
    case "VIRTUAL_ADAPTER_UP":
      return "虚拟网卡在，且已启用。";
    case "VIRTUAL_ADAPTER_DOWN":
      return "虚拟网卡在，但被禁用或未连接。";
    case "VIRTUAL_ADAPTER_MISSING":
      return "没有 PLCSIM 虚拟网卡。只影响虚拟 PLC 的网络可达性，本机仿真不受影响。";
    case "VIRTUAL_ADAPTER_NOT_NEEDED":
      return "用不到：虚拟网卡属于 PLCSIM Advanced，而这台电脑没装 Advanced。";
    case "VIRTUAL_ADAPTER_UNREADABLE":
      return "读不到网卡列表。";
    case "LOCALE_OBJECT_NAMES_ARE_LOCALIZED":
      return "这一项不是故障。博途会用工程语言给硬件对象起名，同一个工程里甚至可能一台站叫「机架_0」、另一台叫「Rack_0」。所以按名字找机架在换一台电脑后必然失效——按位置号找才稳：机架是设备下位置号 0 的那一项，CPU 在位置号 1。";
    case "LOCALE_UNREADABLE":
      return "读不到系统语言与区域设置。";
    case "ENVIRONMENT_NOT_PROBED":
      return "这台电脑没能体检成功，因此任何一项都既不能说好、也不能说坏。";
    default:
      return v1626;
  }
}
function actionText(v1627, v1628) {
  switch (v1627) {
    case "OPENNESS_GROUP_NEEDS_RELOGON":
      return "注销 Windows 再重新登录（或重启电脑），然后重新体检。别的什么都不用改。";
    case "OPENNESS_GROUP_NOT_A_MEMBER":
      return "两步，缺一不可：① 以管理员身份把当前账号加入「Siemens TIA Openness」组；② 注销 Windows 再重新登录。只做①不做②，看起来和没加过一模一样。";
    case "ACCOUNT_NOT_ADMINISTRATOR":
    case "ACCOUNT_ELEVATION_BLOCKED_BY_POLICY":
      return "可继续写程序、查错和生成导入文件。若连接诊断确认缺少组权限或信任登记，请管理员协助；已有授权不需要重复操作。";
    case "WHITELIST_NEEDS_ADMINISTRATOR":
      return "在连接诊断中检查当前程序的授权。确实缺失时，请管理员点击“一键授权连接程序”。登记后重新检查并读取工程；授权成功不等于全部连接条件已经满足。";
    case "TIA_PROCESS_FOREIGN_OWNER":
    case "TIA_PROCESS_PARTLY_FOREIGN_OWNER":
      return "关掉博途再正常打开一次——用你自己的账号双击打开，**不要**用「以管理员身份运行」，也不要从别的账号打开。博途本来就不需要管理员权限。如果是别人登录在这台电脑上开着博途，只能由他那边关。另外：**不要**为了「对齐」而把 PLC Code 以管理员身份启动，那会换来一个更糟的问题——以管理员身份运行的程序反而完全操作不了博途的窗口。";
    case "PROFILE_ROAMING":
      return "通常什么都不用做。如果公司限制漫游配置文件的大小，或者你不希望 PLC Code 的配置文件离开这台电脑，把环境变量 PLC_CODE_CONFIG_HOME 设成本地磁盘上的一个目录，PLC Code 就会改放在那里。";
    case "OPENNESS_GROUP_MISSING":
      return "重新运行博途安装程序，勾选 Openness 选件；别手工建同名的空组，那不管用。";
    case "OPENNESS_OPTION_NOT_INSTALLED":
      return "重新运行对应版本的博途安装程序，加装「TIA Portal Openness」选件。";
    case "TIA_PORTAL_NOT_INSTALLED":
      return "需要装博途。在那之前，PLC Code 仍可离线生成并检查程序源文件，你自己手工导入即可。";
    case "PLCSIM_STANDARD_NOT_INSTALLED":
    case "PLCSIM_STANDARD_NO_DRIVABLE_RUNTIME":
      return "用你常用的那个博途版本的安装介质加装或修复 S7-PLCSIM（V16 起都能仿真）。仿真器必须是那个版本自己的，别的版本顶不上。";
    case "PLCSIM_LEGACY_WCF_SIDECAR_MISSING":
      return "重装或修复 PLC Code（多半是安装目录被拷漏了一部分）。**不要**去重装博途或 S7-PLCSIM——那边是好的。";
    case "PLCSIM_STANDARD_VERSION_GAP":
      return "要么给缺的版本装上配套仿真器，要么把想仿真的工程放在已有仿真器的版本上。";
    case "PLCSIM_ADVANCED_NOT_INSTALLED":
      return "只有确实需要多台虚拟 PLC 或网络可达时才装它；普通 S7-1500 仿真用随版本的仿真器就行。";
    case "PLCSIM_CLASSIC_NOT_INSTALLED":
    case "PLCSIM_CLASSIC_REGISTERED_BUT_MISSING":
      return "只有做 S7-300/400 才需要：安装 S7-PLCSIM V5.4 或更新版本。";
    case "LICENSE_SERVICE_NOT_RUNNING":
      return "用管理员身份的 PowerShell 执行 Start-Service almservice，再执行 Set-Service almservice -StartupType Automatic（不加这句，下次开机又会退回原样）。";
    case "LICENSE_SERVICE_NOT_INSTALLED":
      return "安装或修复 Automation License Manager（随博途 / PLCSIM Advanced 安装程序附带）。";
    case "ADMIN_FLAGS_PRESENT":
      return "用上面「① Windows 的『以管理员身份运行』标记」那块的一键取消（只改当前用户自己的设置，先备份，不需要管理员）。";
    case "NET_FRAMEWORK_TOO_OLD":
      return "安装 Microsoft .NET Framework 4.8（微软免费下载）。";
    case "NPCAP_NOT_RUNNING":
      return "重新运行 S7-PLCSIM Advanced 安装程序，让它把网络组件装上。只做本机仿真的话不用管。";
    case "VIRTUAL_ADAPTER_MISSING":
      return "修复 S7-PLCSIM Advanced 安装，让它重建虚拟网卡。只做本机仿真的话不用管。";
    case "VIRTUAL_ADAPTER_DOWN":
      return "在 Windows 网络设置里启用名为「Siemens PLCSIM Virtual Ethernet Adapter」的网卡。";
    default:
      return v1628;
  }
}
function statusText(v1629) {
  switch (v1629) {
    case "ok":
      return "正常";
    case "warning":
      return "有影响";
    case "blocked":
      return "阻断";
    case "unknown":
      return "没测到";
    case "not-applicable":
      return "用不到";
    default:
      return v1629;
  }
}
function tierText(v1630) {
  switch (v1630) {
    case "product-can-fix":
      return "PLC Code 自己能修";
    case "user-can-fix":
      return "需要你动手";
    case "needs-it-administrator":
      return "当前账号做不了，要找管理这台电脑的人";
    case "hard-boundary":
      return "这是硬边界，软件绕不过去";
    case "none":
      return "";
    default:
      return v1630;
  }
}
function routeTitle(v1631) {
  switch (v1631) {
    case "tia-openness":
      return "驱动博途（打开工程 / 导入 / 编译 / 下载）";
    case "plcsim-standard":
      return "用随版本的 S7-PLCSIM 仿真（S7-1200 / S7-1500）";
    case "plcsim-advanced":
      return "用 S7-PLCSIM Advanced 仿真（S7-1500）";
    case "plcsim-classic":
      return "用经典 S7-PLCSIM 仿真（S7-300 / S7-400）";
    case "offline-generation":
      return "不依赖博途，离线生成并检查程序（三菱 FX / S7-200 / 博途导入文件）";
    case "":
      return "（未知路线）";
    default:
      return v1631;
  }
}
function routeStatusText(v1632) {
  switch (v1632) {
    case "available":
      return "可用";
    case "partial":
      return "部分可用";
    case "blocked":
      return "不可用";
    case "unknown":
      return "没测到";
    default:
      return v1632;
  }
}
function statusTone(v1633) {
  switch (v1633) {
    case "ok":
      return "ok";
    case "warning":
      return "warn";
    case "blocked":
      return "danger";
    case "not-applicable":
      return "faint";
    default:
      return "faint";
  }
}
function routeTone(v1634) {
  switch (v1634) {
    case "available":
      return "ok";
    case "partial":
      return "warn";
    case "blocked":
      return "danger";
    default:
      return "faint";
  }
}
function verdictTone(v1635) {
  switch (v1635) {
    case "ready":
      return "ok";
    case "degraded":
      return "warn";
    case "blocked":
      return "danger";
    default:
      return "faint";
  }
}
function readItem(v1636) {
  const v1637 = str$3(v1636, "id");
  const v1638 = str$3(v1636, "status");
  const v1639 = str$3(v1636, "code");
  const v1640 = str$3(v1636, "tier");
  let v1641 = itemTitle(v1637) + "\u3000—\u3000" + statusText(v1638);
  const v1642 = tierText(v1640);
  if (v1642.length > 0 && (v1638 === "blocked" || v1638 === "warning")) {
    v1641 += "（" + v1642 + "）";
  }
  v1641 += "\n" + detailText(v1639, str$3(v1636, "detail"));
  if (v1638 === "blocked" || v1638 === "warning") {
    const v1643 = actionText(v1639, str$3(v1636, "action"));
    if (v1643.length > 0) {
      v1641 += "\n怎么办：" + v1643;
    }
  }
  return {
    id: v1637,
    status: v1638,
    tier: v1640,
    code: v1639,
    needsAdministrator: bool$1(v1636, "needsAdministrator"),
    display: v1641,
    tone: statusTone(v1638)
  };
}
function readRoute(v1644) {
  const v1645 = str$3(v1644, "id");
  const v1646 = str$3(v1644, "status");
  let v1647 = routeTitle(v1645) + "\u3000—\u3000" + routeStatusText(v1646);
  const v1648 = arrayOfStrings$1(v1644, "blockers").map(v1649 => itemTitle(v1649));
  const v1650 = arrayOfStrings$1(v1644, "limitations").map(v1651 => itemTitle(v1651));
  if (v1648.length > 0) {
    v1647 += "\n卡在：" + v1648.join("、");
  }
  if (v1650.length > 0) {
    v1647 += "\n受限于：" + v1650.join("、");
  }
  return {
    id: v1645,
    status: v1646,
    display: v1647,
    tone: routeTone(v1646)
  };
}
function arrayOfStrings$1(v1652, v1653) {
  const v1654 = v1652[v1653];
  if (Array.isArray(v1654)) {
    return v1654.filter(v1655 => typeof v1655 === "string");
  } else {
    return [];
  }
}
function headlineText(v1656, v1657, v1658) {
  if (v1656 === "unknown") {
    return "这台电脑没能体检成功，因此下面任何一项都既不能说好、也不能说坏。";
  }
  const v1659 = v1658.filter(v1660 => (v1660.status === "available" || v1660.status === "partial") && v1660.id !== "offline-generation").map(v1661 => routeTitle(v1661.id));
  const v1662 = v1657.filter(v1663 => v1663.status === "blocked").map(v1664 => itemTitle(v1664.id));
  if (v1656 === "blocked") {
    return "现在被卡住的是：" + v1662.join("、") + "。在这之前，离线生成与检查程序仍然可用。";
  }
  let v1665 = v1659.length > 0 ? "现在可用：" + v1659.join("；") + "。" : "博途可以驱动，但这台电脑上还没有可用的仿真器。";
  if (v1662.length > 0) {
    v1665 += "暂时不可用：" + v1662.join("、") + "。";
  }
  if (v1656 === "ready" && v1662.length === 0) {
    v1665 += "没有需要处理的项。";
  }
  return v1665;
}
function trim1Line$1(v1666) {
  const v1667 = (v1666 ?? "").replace(/\r/g, " ").replace(/\n/g, " ").trim();
  if (v1667.length > 300) {
    return v1667.slice(0, 300) + "…";
  } else {
    return v1667;
  }
}
function arrayOf(v1668, v1669) {
  if (!v1668 || typeof v1668 !== "object") {
    return [];
  }
  const v1670 = v1668[v1669];
  if (Array.isArray(v1670)) {
    return v1670.filter(v1671 => !!v1671 && typeof v1671 === "object");
  } else {
    return [];
  }
}
function str$2(v1672, v1673) {
  if (!v1672 || typeof v1672 !== "object") {
    return "";
  }
  const v1674 = v1672[v1673];
  if (typeof v1674 === "string") {
    return v1674;
  } else {
    return "";
  }
}
function bool(v1675, v1676) {
  if (!v1675 || typeof v1675 !== "object") {
    return false;
  }
  return v1675[v1676] === true;
}
function int(v1677, v1678, v1679) {
  if (!v1677 || typeof v1677 !== "object") {
    return v1679;
  }
  const v1680 = v1677[v1678];
  if (typeof v1680 === "number" && Number.isFinite(v1680)) {
    return Math.trunc(v1680);
  } else {
    return v1679;
  }
}
function trim1Line(v1681) {
  const v1682 = (v1681 ?? "").replace(/\r/g, " ").replace(/\n/g, " ").trim();
  if (v1682.length > 300) {
    return v1682.slice(0, 300) + "…";
  } else {
    return v1682;
  }
}
function adminFlagUnavailable(v1683) {
  return {
    parsed: false,
    blocked: false,
    flaggedCount: 0,
    blockedCount: 0,
    repairableCount: 0,
    backupDirectory: "",
    entries: [],
    readErrors: [],
    headline: "没能完成检测：" + trim1Line(v1683),
    tone: "danger"
  };
}
function verdictText(v1684) {
  switch (v1684) {
    case "removable":
      return "可以取消：这个程序自身并不要求管理员权限，标记是外部加上去的";
    case "machine-wide-needs-administrator":
      return "不能在这里取消：标记写在本机全局位置（HKLM），只有管理员能删";
    case "keep-vendor-requires-administrator":
      return "应当保留：程序自身就声明需要管理员权限";
    case "keep-vendor-requests-highest-available":
      return "应当保留：程序自身请求可用的最高权限";
    case "keep-manifest-unreadable":
      return "不动它：读不到这个程序的权限声明，保守处理";
    case "executable-missing":
      return "标记指向的程序已经不存在了";
    case "out-of-scope-not-a-simulation-executable":
      return "不属于 PLCSIM / 博途，不在处理范围内";
    case "no-runasadmin":
      return "没有管理员标记";
    case "":
      return "（结论缺失）";
    default:
      return v1684;
  }
}
function scopeText(v1685) {
  switch (v1685) {
    case "HKCU":
      return "当前用户（HKEY_CURRENT_USER，不需要管理员）";
    case "HKLM":
      return "本机全局（HKEY_LOCAL_MACHINE，需要管理员）";
    case "":
      return "（未知）";
    default:
      return v1685;
  }
}
function readAdminFlagEntry(v1686) {
  const v1687 = str$2(v1686, "executablePath");
  const v1688 = str$2(v1686, "scope");
  const v1689 = str$2(v1686, "verdict");
  const v1690 = bool(v1686, "repairable");
  const v1691 = str$2(v1686, "afterRepair");
  let v1692 = v1687.length > 0 ? v1687 : "(未知路径)";
  v1692 += "\n· " + verdictText(v1689);
  v1692 += "\u3000·标记位置：" + scopeText(v1688);
  if (v1690) {
    v1692 += "\u3000·取消后该项变为：" + (v1691 === "(value deleted)" || v1691.length === 0 ? "整条删除（原本只有这一个标记）" : v1691 + "（其余兼容性设置保留）");
  }
  return {
    executablePath: v1687,
    scope: v1688,
    layers: str$2(v1686, "layers"),
    verdict: v1689,
    product: str$2(v1686, "product"),
    manifestLevel: str$2(v1686, "manifestExecutionLevel"),
    afterRepair: v1691,
    repairable: v1690,
    display: v1692
  };
}
function parseAdminFlagDoctor(v1693) {
  let v1694;
  try {
    const v1695 = JSON.parse(v1693);
    if (typeof v1695 !== "object" || v1695 === null || typeof v1695.data !== "object" || v1695.data === null) {
      return adminFlagUnavailable("检测结果不是预期的格式。");
    }
    v1694 = v1695.data;
  } catch (v1696) {
    return adminFlagUnavailable("检测结果不是有效 JSON（" + v1696.message + "）。");
  }
  const v1697 = arrayOf(v1694, "flaggedEntries").map(readAdminFlagEntry);
  const v1698 = bool(v1694, "blocked");
  const v1699 = int(v1694, "flaggedCount", v1697.length);
  const v1700 = int(v1694, "blockedSimulationExecutableCount", v1697.filter(v1701 => v1701.product === "plcsim" || v1701.product === "tia-portal").length);
  const v1702 = int(v1694, "repairableCount", v1697.filter(v1703 => v1703.repairable).length);
  const v1704 = arrayOfStrings(v1694, "readErrors");
  let v1705;
  let v1706;
  if (!v1698) {
    v1705 = "PLCSIM / 博途 都没有被标记为「以管理员身份运行」，这一项没有阻断。";
    if (v1699 > 0) {
      v1705 += "（另有 " + v1699 + " 条管理员标记不属于 PLCSIM / 博途，不在处理范围内。）";
    }
    v1706 = "ok";
  } else if (v1702 > 0) {
    v1705 = "发现 " + v1700 + " 个 PLCSIM / 博途 程序被 Windows 标记为「以管理员身份运行」，其中 " + v1702 + " 个可以在这里一键取消。带这个标记时 Windows 会强制以管理员启动它们，PLC Code 能把仿真器启起来，却停不掉也控制不了。";
    v1706 = "warn";
  } else {
    v1705 = "发现 " + v1700 + " 个 PLCSIM / 博途 程序被 Windows 标记为「以管理员身份运行」，但没有一条可以自动取消——请按下面每条给出的原因处理。";
    v1706 = "danger";
  }
  return {
    parsed: true,
    blocked: v1698,
    flaggedCount: v1699,
    blockedCount: v1700,
    repairableCount: v1702,
    backupDirectory: str$2(v1694, "backupDirectory"),
    entries: v1697,
    readErrors: v1704,
    headline: v1705,
    tone: v1706
  };
}
function arrayOfStrings(v1707, v1708) {
  const v1709 = v1707[v1708];
  if (!Array.isArray(v1709)) {
    return [];
  }
  return v1709.map(v1710 => typeof v1710 === "string" ? v1710 : JSON.stringify(v1710)).filter(v1711 => v1711.length > 0);
}
function parseAdminFlagRepair(v1712) {
  try {
    const v1713 = JSON.parse(v1712);
    if (typeof v1713 !== "object" || v1713 === null || typeof v1713.data !== "object" || v1713.data === null) {
      return {
        parsed: false,
        allCleared: false,
        repairedCount: 0,
        backupJsonPath: "",
        backupRegPath: ""
      };
    }
    const v1714 = v1713.data;
    return {
      parsed: true,
      allCleared: bool(v1714, "allCleared"),
      repairedCount: int(v1714, "repairedCount", 0),
      backupJsonPath: str$2(v1714, "backupJsonPath"),
      backupRegPath: str$2(v1714, "backupRegPath")
    };
  } catch {
    return {
      parsed: false,
      allCleared: false,
      repairedCount: 0,
      backupJsonPath: "",
      backupRegPath: ""
    };
  }
}
function shortHashHex(v1715, v1716) {
  const v1717 = (v1715 ?? "").trim();
  if (v1717.length >= 8 && /^[0-9a-fA-F]+$/.test(v1717)) {
    return v1717.slice(0, 8).toLowerCase();
  }
  try {
    const v1718 = Buffer.from((v1716 ?? "").trim(), "base64");
    if (v1718.length < 4) {
      return "";
    }
    return v1718.subarray(0, 4).toString("hex").toLowerCase();
  } catch {
    return "";
  }
}
function whitelistUnavailable(v1719) {
  return {
    parsed: false,
    allTrusted: false,
    notTrustedVersions: [],
    trustedVersions: [],
    lines: [],
    bridgeExePath: "",
    bridgeExeExists: false,
    headline: "没能完成检查：" + trim1Line(v1719),
    tone: "danger",
    sameBinaryOtherPaths: [],
    bridgeHashShort: ""
  };
}
function parseWhitelistCheck(v1720) {
  let v1721;
  try {
    const v1722 = JSON.parse(v1720);
    if (typeof v1722 !== "object" || v1722 === null) {
      return whitelistUnavailable("检查结果不是预期的格式。");
    }
    v1721 = v1722;
  } catch (v1723) {
    return whitelistUnavailable("检查结果不是有效 JSON（" + v1723.message + "）。");
  }
  const v1724 = typeof v1721.data === "object" && v1721.data !== null ? v1721.data : null;
  const v1725 = v1724 ? str$2(v1724, "exePath") : "";
  const v1726 = v1724 ? bool(v1724, "exeExists") : false;
  const v1727 = v1724 ? arrayOf(v1724, "perVersion") : [];
  if (v1727.length === 0) {
    return {
      parsed: true,
      allTrusted: false,
      notTrustedVersions: [],
      trustedVersions: [],
      lines: [],
      bridgeExePath: v1725,
      bridgeExeExists: v1726,
      headline: v1726 ? "没有查到任何 TIA 版本的白名单信息，因此无法确认桥接程序是否被信任。" : "没有找到桥接程序本身，无法检查它是否被 TIA 信任。",
      tone: "danger",
      sameBinaryOtherPaths: [],
      bridgeHashShort: ""
    };
  }
  const v1728 = [];
  const v1729 = [];
  const v1730 = [];
  for (const v1731 of v1727) {
    let v1732 = str$2(v1731, "version");
    if (v1732.length === 0) {
      v1732 = "(未知版本)";
    }
    const v1733 = int(v1731, "entryCount", 0);
    const v1734 = int(v1731, "hashMatchCount", 0);
    if (v1734 > 0) {
      v1728.push(v1732);
      v1730.push(v1732 + "：已信任（当前这份桥接程序的哈希已登记）");
    } else {
      v1729.push(v1732);
      v1730.push(v1733 === 0 ? v1732 + "：未登记（这个路径下没有任何登记记录）" : v1732 + ("：登记已过期（有 " + v1733 + " 条旧记录，没有一条对得上当前程序——桥接程序更新过，需要重新登记一次）"));
    }
  }
  const v1735 = v1724 ? arrayOfStrings(v1724, "sameBinaryOtherPaths") : [];
  const v1736 = v1729.length === 0 && v1726;
  let v1737 = v1736 ? "已安装的各 TIA 版本都信任当前的桥接程序，这一项没有阻断。" : "以下 TIA 版本不信任当前的桥接程序：" + v1729.join("、") + "。在修好之前，这些版本上的 TIA 操作都会被拒绝。登记一次需要管理员授权。";
  if (!v1736 && v1735.length > 0) {
    v1737 += "\n注意：完全相同的一份桥接程序（哈希一致）确实已经被信任，但登记在另一个路径下——" + v1735.join("、") + "。信任是按**绝对路径**记的，不是按文件内容，所以当前这一份仍需单独登记一次。";
  }
  return {
    parsed: true,
    allTrusted: v1736,
    notTrustedVersions: v1729,
    trustedVersions: v1728,
    lines: v1730,
    bridgeExePath: v1725,
    bridgeExeExists: v1726,
    sameBinaryOtherPaths: v1735,
    bridgeHashShort: v1724 ? shortHashHex(str$2(v1724, "fileHashHex"), str$2(v1724, "fileHash")) : "",
    headline: v1737,
    tone: v1736 ? "ok" : "warn"
  };
}
const LIVE_TIA_VERSION_ENV = "PLC_CODE_LIVE_TIA_VERSION";
const TIA_INSTALLED_VERSIONS_ENV = "PLC_CODE_TIA_INSTALLED_VERSIONS";
function versionLabel(v1738) {
  if (v1738.length === 0 || /^v/i.test(v1738)) {
    return v1738;
  } else {
    return "V" + v1738;
  }
}
function applyLiveTiaVersionEnv(v1739) {
  const v1740 = v1739.runningVersions.length === 1 ? versionLabel(v1739.runningVersions[0]) : "";
  if (v1740) {
    process.env[LIVE_TIA_VERSION_ENV] = v1740;
  } else {
    delete process.env[LIVE_TIA_VERSION_ENV];
  }
  const v1741 = v1739.installedVersions.filter(v1742 => v1742.trim().length > 0);
  if (v1741.length > 0) {
    process.env[TIA_INSTALLED_VERSIONS_ENV] = v1741.join(",");
  }
}
let tiaProbeGeneration = 0;
async function tiaStatusAsync(v1743, v1744) {
  const v1745 = ++tiaProbeGeneration;
  const v1746 = v1744?.trim() || undefined;
  const v1747 = {
    ...(v1746 ? {
      tia_version: v1746
    } : {}),
    include_processes: true,
    include_whitelist: true
  };
  let v1748;
  try {
    const v1749 = await runTiaTool(v1743.executeToolPath, v1743.cwd, "tia_openness_status", v1747, 35000);
    v1748 = parseTiaStatus(v1749);
  } catch (v1750) {
    v1748 = tiaStatusProbeFailure(v1750.message);
  }
  if (v1745 === tiaProbeGeneration) {
    applyLiveTiaVersionEnv(v1748);
  }
  return v1748;
}
async function environmentReportAsync(v1751) {
  try {
    const v1752 = await runTiaTool(v1751.executeToolPath, v1751.cwd, "tia_environment_report", {}, 90000);
    return parseEnvironmentHealth(v1752);
  } catch (v1753) {
    return environmentHealthUnavailable(v1753.message);
  }
}
async function checkWhitelistAsync(v1754) {
  try {
    const v1755 = await runTiaTool(v1754.executeToolPath, v1754.cwd, "tia_openness_check_whitelist", {}, 35000);
    return parseWhitelistCheck(v1755);
  } catch (v1756) {
    return whitelistUnavailable(v1756.message);
  }
}
async function adminFlagDoctorAsync(v1757) {
  try {
    const v1758 = await runTiaTool(v1757.executeToolPath, v1757.cwd, "tia_plcsim_admin_flag_doctor", {}, 60000);
    return parseAdminFlagDoctor(v1758);
  } catch (v1759) {
    return adminFlagUnavailable(v1759.message);
  }
}
async function repairAdminFlagsAsync(v1760, v1761) {
  const v1762 = {
    confirm: true
  };
  if (v1761 && v1761.trim().length > 0) {
    v1762.path = v1761.trim();
  }
  try {
    const v1763 = await runTiaTool(v1760.executeToolPath, v1760.cwd, "tia_plcsim_repair_admin_flags", v1762, 60000);
    return {
      receipt: parseAdminFlagRepair(v1763),
      failure: null
    };
  } catch (v1764) {
    return {
      receipt: {
        parsed: false,
        allCleared: false,
        repairedCount: 0,
        backupJsonPath: "",
        backupRegPath: ""
      },
      failure: v1764.message
    };
  }
}
const INOPROSHOP_STATUS_ENV = "PLC_CODE_INOPROSHOP_STATUS";
function runInoproshopTool(v1765, v1766, v1767, v1768, v1769) {
  return new Promise((v1770, v1771) => {
    const v1772 = node_child_process.spawn(v1765, [v1767], {
      cwd: v1766,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let v1773 = "";
    let v1774 = "";
    const v1775 = setTimeout(() => {
      try {
        v1772.kill();
      } catch {}
      v1771(new Error(v1767 + " 超时（" + v1769 + " ms）"));
    }, v1769);
    v1772.stdout.on("data", v1776 => v1773 += v1776.toString("utf-8"));
    v1772.stderr.on("data", v1777 => v1774 += v1777.toString("utf-8"));
    v1772.on("error", v1778 => {
      clearTimeout(v1775);
      v1771(v1778);
    });
    v1772.on("close", v1779 => {
      clearTimeout(v1775);
      if (v1779 !== 0) {
        v1771(new Error(v1774.trim().length > 0 ? v1774 : v1767 + " 失败（exit " + v1779 + "）"));
        return;
      }
      v1770(v1773.trim());
    });
    v1772.stdin.write(JSON.stringify(v1768), "utf-8");
    v1772.stdin.end();
  });
}
function applyInoproshopStatusEnv(v1780) {
  try {
    const v1781 = JSON.parse(v1780);
    const v1782 = v1781?.data ?? v1781;
    const v1783 = typeof v1782 === "object" && v1782 !== null && ["bridgePid", "projectOpen", "projectPath", "ready"].some(v1784 => v1784 in v1782);
    if (!v1783) {
      throw new Error("probe envelope lacks known status keys");
    }
    const v1785 = v1782?.bridgePid ?? null;
    const v1786 = v1782?.projectOpen ?? null;
    const v1787 = v1782?.projectPath ?? null;
    const v1788 = v1782?.ready ?? null;
    const v1789 = [];
    if (v1785 != null) {
      v1789.push("bridge up (pid " + v1785 + ")");
    } else {
      v1789.push("bridge not running");
    }
    if (v1786 != null) {
      v1789.push("projectOpen=" + v1786);
    }
    if (v1786 === true && v1787) {
      v1789.push("openProject=" + v1787);
    }
    if (v1788 != null) {
      v1789.push("ready=" + v1788);
    }
    const v1790 = process.env.CODESYS_ROUTE_DISPOSABLE_ROOT ?? node_path.join(process.env.LOCALAPPDATA ?? "", "PLC Code", "codesys-bridge", "vendor-experiments");
    v1789.push("disposableRoot=" + v1790);
    v1789.push("probedAt=" + Date.now());
    const v1791 = v1789.join(", ");
    process.env[INOPROSHOP_STATUS_ENV] = v1791;
    return v1791;
  } catch {
    delete process.env[INOPROSHOP_STATUS_ENV];
    return "";
  }
}
async function summarizeOpenProject(v1792) {
  const v1793 = [];
  try {
    const v1794 = await runInoproshopTool(v1792.executeToolPath, v1792.cwd, "inoproshop_task_list", {}, 20000);
    const v1795 = JSON.parse(v1794);
    const v1796 = v1795?.data?.tasks ?? [];
    const v1797 = v1796.map(v1798 => {
      const v1799 = (v1798.childCalls ?? []).map(v1800 => v1800.name).join(",");
      return "" + v1798.name + (v1798.interval ? "(" + v1798.interval + ")" : "") + "->[" + v1799 + "]";
    }).join(" ");
    if (v1797) {
      v1793.push("tasks={" + v1797.slice(0, 600) + (v1797.length > 600 ? "…" : "") + "}");
    }
  } catch {}
  try {
    const v1801 = await runInoproshopTool(v1792.executeToolPath, v1792.cwd, "inoproshop_project_tree", {}, 20000);
    const v1802 = JSON.parse(v1801);
    const v1803 = v1802?.data?.tree ?? [];
    const v1804 = [];
    const v1805 = v1806 => {
      for (const v1807 of v1806) {
        const v1808 = String(v1807.path ?? "");
        if (v1808.includes("/Application/") && !v1808.includes("Task Configuration") && v1807.name) {
          v1804.push(String(v1807.name));
        }
        if (Array.isArray(v1807.children)) {
          v1805(v1807.children);
        }
      }
    };
    v1805(v1803);
    if (v1804.length > 0) {
      v1793.push("appObjects=[" + v1804.slice(0, 20).join(",") + "]");
    }
    try {
      const v1809 = v1804.filter(v1810 => /gvl/i.test(v1810)).slice(0, 2);
      const v1811 = [];
      for (const v1812 of v1809) {
        const v1813 = await runInoproshopTool(v1792.executeToolPath, v1792.cwd, "codesys_pou_get", {
          name: v1812
        }, 15000);
        const v1814 = JSON.parse(v1813);
        const v1815 = String(v1814?.data?.declaration ?? "");
        if (v1815) {
          const v1816 = v1815.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
          const v1817 = 900;
          let v1818 = v1816;
          let v1819 = 0;
          if (v1816.length > v1817) {
            const v1820 = v1816.slice(0, 500);
            const v1821 = Math.max(v1820.lastIndexOf(";"), v1820.lastIndexOf(" "));
            if (v1821 > 0) {
              v1818 = v1816.slice(0, v1821 + 1);
              v1819 = v1816.length - (v1821 + 1);
            } else {
              v1818 = "";
              v1819 = v1816.length;
            }
          }
          if (!v1818) {
            v1811.push(v1812 + ": (声明过长且无边界, 未注入 — 需要时用 codesys_pou_get 读取)");
            continue;
          }
          const v1822 = v1818.replace(/\|/g, "¦").replace(/}/g, "›").replace(/{/g, "‹");
          v1811.push(v1812 + ": " + v1822 + (v1819 > 0 ? " …(截断" + v1819 + "字符)" : ""));
        }
      }
      if (v1811.length > 0) {
        v1793.push("gvlDecls={" + v1811.join(" | ") + "}");
      }
    } catch {}
  } catch {}
  return v1793.join("; ");
}
let inoproshopProbeGeneration = 0;
async function inoproshopStatusAsync(v1823) {
  const v1824 = ++inoproshopProbeGeneration;
  try {
    const v1825 = await runInoproshopTool(v1823.executeToolPath, v1823.cwd, "inoproshop_bridge_status", {}, 35000);
    if (v1824 !== inoproshopProbeGeneration) {
      return {
        probed: false,
        summary: "",
        raw: null
      };
    }
    const v1826 = applyInoproshopStatusEnv(v1825);
    try {
      const v1827 = JSON.parse(v1825);
      if (v1827?.data?.projectOpen === true) {
        const v1828 = await summarizeOpenProject(v1823);
        if (v1824 !== inoproshopProbeGeneration) {
          return {
            probed: false,
            summary: "",
            raw: null
          };
        }
        if (v1828) {
          const v1829 = v1826 + "; openProjectContent: " + v1828;
          process.env[INOPROSHOP_STATUS_ENV] = v1829;
          return {
            probed: true,
            summary: v1829,
            raw: v1825
          };
        }
      }
    } catch {}
    return {
      probed: true,
      summary: v1826,
      raw: v1825
    };
  } catch {
    if (v1824 === inoproshopProbeGeneration) {
      delete process.env[INOPROSHOP_STATUS_ENV];
    }
    return {
      probed: false,
      summary: "",
      raw: null
    };
  }
}
function powershellQuote(v1830) {
  return "'" + v1830.replace(/'/g, "''") + "'";
}
function quoteWindowsArgument(v1831) {
  if (v1831.length > 0 && !/[\s"]/.test(v1831)) {
    return v1831;
  }
  let v1832 = "\"";
  let v1833 = 0;
  for (const v1834 of v1831) {
    if (v1834 === "\\") {
      v1833 += 1;
    } else if (v1834 === "\"") {
      v1832 += "\\".repeat(v1833 * 2 + 1) + "\"";
      v1833 = 0;
    } else {
      v1832 += "\\".repeat(v1833) + v1834;
      v1833 = 0;
    }
  }
  v1832 += "\\".repeat(v1833 * 2) + "\"";
  return v1832;
}
function buildScript(v1835, v1836) {
  const v1837 = v1836.map(v1838 => powershellQuote(quoteWindowsArgument(v1838))).join(",");
  return ["$ErrorActionPreference = 'Stop'", "try {", "  $p = Start-Process -FilePath " + powershellQuote(v1835) + " -ArgumentList (" + v1837 + ") -Verb RunAs -WindowStyle Hidden -Wait -PassThru", "  Write-Output \"EXITCODE:$($p.ExitCode)\"", "} catch {", "  $code = $_.Exception.NativeErrorCode", "  if (-not $code -and $_.Exception.InnerException) {", "    $code = $_.Exception.InnerException.NativeErrorCode", "  }", "  Write-Output \"ELEVATION_ERROR:$code\"", "}"].join("\n");
}
function buildCommand(v1839, v1840) {
  const v1841 = buildScript(v1839, v1840);
  return {
    exe: "powershell.exe",
    args: ["-NoProfile", "-NonInteractive", "-Command", v1841],
    script: v1841
  };
}
function buildRegisterWhitelistCommand(v1842, v1843, v1844) {
  const v1845 = ["register-whitelist"];
  if (v1843 && v1843.trim().length > 0) {
    v1845.push("--tia-version", v1843.trim());
  }
  v1845.push("--report", v1844);
  return buildCommand(v1842, v1845);
}
function buildJoinOpennessGroupCommand(v1846, v1847) {
  const v1848 = v1847.trim();
  if (!v1848) {
    throw new Error("Windows account identity is required for Openness group provisioning");
  }
  return buildCommand(v1846, ["add-openness-group", "--user", v1848]);
}
function parseElevationOutput(v1849) {
  const v1850 = v1849.match(/EXITCODE:(\d+)/);
  if (v1850) {
    return {
      kind: "exitCode",
      exitCode: Number.parseInt(v1850[1], 10)
    };
  }
  const v1851 = v1849.match(/ELEVATION_ERROR:(\d+)/);
  if (v1851) {
    return {
      kind: "elevationError",
      win32ErrorCode: Number.parseInt(v1851[1], 10)
    };
  }
  return {
    kind: "unparsed",
    raw: v1849
  };
}
const ELEVATION_TIMEOUT_MS = 120000;
const IDENTITY_TIMEOUT_MS = 5000;
function runPowerShell(v1852, v1853 = ELEVATION_TIMEOUT_MS) {
  return new Promise((v1854, v1855) => {
    const v1856 = node_child_process.spawn("powershell.exe", v1852, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    let v1857 = "";
    let v1858 = "";
    const v1859 = setTimeout(() => {
      try {
        v1856.kill();
      } catch {}
      v1855(new Error("elevation powershell 超时（" + v1853 + " ms）"));
    }, v1853);
    v1856.stdout.on("data", v1860 => v1857 += v1860.toString("utf-8"));
    v1856.stderr.on("data", v1861 => v1858 += v1861.toString("utf-8"));
    v1856.on("error", v1862 => {
      clearTimeout(v1859);
      v1855(v1862);
    });
    v1856.on("close", v1863 => {
      clearTimeout(v1859);
      if (v1863 === 0) {
        v1854(v1857);
      } else {
        v1855(new Error("elevation powershell exited with code " + (v1863 ?? "null") + ": " + (v1858 || v1857).trim()));
      }
    });
  });
}
async function readOriginalWindowsIdentity() {
  const v1864 = "[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); [System.Security.Principal.WindowsIdentity]::GetCurrent().Name";
  try {
    const v1865 = (await runPowerShell(["-NoProfile", "-NonInteractive", "-Command", v1864], IDENTITY_TIMEOUT_MS)).trim();
    if (!/^[^\\/"\r\n]+\\[^\\/"\r\n]+$/.test(v1865)) {
      return null;
    }
    return v1865;
  } catch {
    return null;
  }
}
function readTrustReport(v1866) {
  try {
    const v1867 = node_fs.readFileSync(v1866, "utf-8");
    const v1868 = JSON.parse(v1867);
    const v1869 = v1868.Data ?? v1868.data;
    const v1870 = v1868.Error ?? v1868.error;
    return {
      verifiedAllTrusted: v1869?.verifiedAllTrusted === true || v1869?.VerifiedAllTrusted === true,
      registeredVersions: asStringArray(v1869?.registeredVersions ?? v1869?.RegisteredVersions),
      failedVersions: asStringArray(v1869?.failedVersions ?? v1869?.FailedVersions),
      errorMessage: typeof v1870?.Message === "string" ? v1870.Message : typeof v1870?.message === "string" ? v1870.message : null
    };
  } catch (v1871) {
    return {
      verifiedAllTrusted: false,
      registeredVersions: [],
      failedVersions: [],
      errorMessage: "报告文件读取失败：" + v1871.message
    };
  }
}
function asStringArray(v1872) {
  if (Array.isArray(v1872)) {
    return v1872.filter(v1873 => typeof v1873 === "string");
  } else {
    return [];
  }
}
async function trustBridgeElevated(v1874, v1875) {
  const v1876 = node_fs.mkdtempSync(node_path.join(node_os.tmpdir(), "plc-tia-trust-"));
  const v1877 = node_path.join(v1876, "trust-report.json");
  const v1878 = buildRegisterWhitelistCommand(v1874, v1875, v1877);
  try {
    const v1879 = await runPowerShell(v1878.args);
    const v1880 = parseElevationOutput(v1879);
    if (v1880.kind !== "exitCode") {
      return {
        ok: false,
        verifiedAllTrusted: false,
        registeredVersions: [],
        failedVersions: [],
        errorMessage: null,
        launch: v1880
      };
    }
    const v1881 = readTrustReport(v1877);
    return {
      ok: v1880.exitCode === 0,
      verifiedAllTrusted: v1881.verifiedAllTrusted,
      registeredVersions: v1881.registeredVersions,
      failedVersions: v1881.failedVersions,
      errorMessage: v1881.errorMessage,
      launch: v1880
    };
  } finally {
    try {
      const v1882 = removeTreeByHand(v1876);
      if (!v1882.ok) {
        console.warn("[main] elevate temp dir kept: " + v1882.path + " (" + v1882.code + ")");
      }
    } catch {}
  }
}
async function joinOpennessGroupElevated(v1883) {
  const v1884 = await readOriginalWindowsIdentity();
  if (!v1884) {
    return {
      ok: false,
      launch: {
        kind: "unparsed",
        raw: "Windows account identity unavailable; refusing to elevate"
      }
    };
  }
  const v1885 = buildJoinOpennessGroupCommand(v1883, v1884);
  const v1886 = await runPowerShell(v1885.args);
  const v1887 = parseElevationOutput(v1886);
  return {
    ok: v1887.kind === "exitCode" && v1887.exitCode === 0,
    launch: v1887
  };
}
function lockPathFor(v1888) {
  return node_path.join(v1888, LOCK_FILE_NAME);
}
function readLock(v1889) {
  if (!v1889 || v1889.trim().length === 0) {
    return null;
  }
  try {
    const v1890 = lockPathFor(v1889.trim());
    if (node_fs.existsSync(v1890)) {
      return parseLock(node_fs.readFileSync(v1890, "utf-8"));
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function writeLock(v1891, v1892) {
  node_fs.writeFileSync(lockPathFor(v1891), lockToJson(v1892), "utf-8");
}
const PORTAL_PROCESS_NAME = "Siemens.Automation.Portal.exe";
const POLL_TIMEOUT_MS = 8000;
function inferTiaVersionFromPath(v1893) {
  const v1894 = v1893.match(/\\PublicAPI\\V(\d+(?:\.\d+)?)\\/i);
  if (v1894) {
    return "V" + v1894[1];
  }
  const v1895 = v1893.match(/\\Portal V(\d+(?:\.\d+)?)\\/i);
  if (v1895) {
    return "V" + v1895[1];
  }
  return null;
}
function pollTiaPortalProcesses() {
  return new Promise(v1896 => {
    const v1897 = "[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); $ErrorActionPreference = 'Stop'; $rows = @(Get-CimInstance Win32_Process -Filter \"Name='" + PORTAL_PROCESS_NAME + "'\" | Select-Object ProcessId,ExecutablePath,CommandLine); ConvertTo-Json -InputObject $rows -Compress";
    const v1898 = node_child_process.spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", v1897], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    });
    let v1899 = "";
    const v1900 = setTimeout(() => {
      try {
        v1898.kill();
      } catch {}
      v1896({
        count: "unknown",
        versions: []
      });
    }, POLL_TIMEOUT_MS);
    v1898.stdout.on("data", v1901 => v1899 += v1901.toString("utf-8"));
    v1898.on("error", () => {
      clearTimeout(v1900);
      v1896({
        count: "unknown",
        versions: []
      });
    });
    v1898.on("close", v1902 => {
      clearTimeout(v1900);
      if (v1902 !== 0) {
        v1896({
          count: "unknown",
          versions: []
        });
        return;
      }
      v1896(parseProcessWatch(v1899));
    });
  });
}
function parseProcessWatch(v1903) {
  try {
    const v1904 = JSON.parse(v1903);
    if (!Array.isArray(v1904) || v1904.some(v1905 => !Number.isInteger(v1905?.ProcessId) || v1905.ProcessId <= 0)) {
      throw new Error("invalid process list");
    }
    const v1906 = v1904.filter(v1907 => typeof v1907.CommandLine !== "string" || !/(?:^|\s)-(?:Name=SearchReplaceBackgroundProcess(?:\s|$)|bootstrapper=[^\s]*BackgroundProcessBootStrapper(?:\s|$))/i.test(v1907.CommandLine));
    const v1908 = [];
    for (const v1909 of v1906) {
      const v1910 = inferTiaVersionFromPath(typeof v1909.ExecutablePath === "string" ? v1909.ExecutablePath : "");
      if (v1910 && !v1908.includes(v1910)) {
        v1908.push(v1910);
      }
    }
    return {
      count: v1906.length,
      versions: v1908,
      processIds: v1906.map(v1911 => v1911.ProcessId).sort((v1912, v1913) => v1912 - v1913)
    };
  } catch {
    return {
      count: "unknown",
      versions: []
    };
  }
}
const pending = new Map();
function verifyTiaConnection(v1914, v1915, v1916) {
  if (v1915 && !tiaVersion(v1915) || v1916 && (v1916.length > 2048 || /[\r\n\0]/.test(v1916))) {
    return Promise.resolve({
      report: tiaStatusProbeFailure("版本或工程路径格式无效。"),
      health: null
    });
  }
  const v1917 = JSON.stringify([v1914.executeToolPath, v1915 || "", v1916 || ""]);
  const v1918 = pending.get(v1917);
  if (v1918) {
    return v1918;
  }
  const v1919 = diagnose(v1914, v1915, v1916).finally(() => pending.delete(v1917));
  pending.set(v1917, v1919);
  return v1919;
}
async function diagnose(v1920, v1921, v1922) {
  const [v1923, v1924] = await Promise.all([tiaStatusAsync(v1920, v1921), environmentReportAsync(v1920)]);
  if (!v1923.connectionReady) {
    if (v1923.probeOk && v1923.targetInstalled && v1923.targetApiAvailable && v1923.inGroup && v1923.whitelistChecked && !v1923.targetNeedsTrust && v1923.portals?.some(v1925 => v1925.version === v1923.version)) {
      v1923.verification = {
        ok: false,
        code: "TIA_CONNECTION_PREREQUISITE_BLOCKED",
        message: v1923.issues.join("\n") || v1923.message,
        checkedAt: new Date().toISOString()
      };
    }
    return {
      report: v1923,
      health: v1924
    };
  }
  try {
    const v1926 = await runTiaTool(v1920.executeToolPath, v1920.cwd, "tia_openness_get_project_status", {
      tia_version: v1923.version,
      ...(v1922?.trim() ? {
        project_match: v1922.trim()
      } : {})
    }, 55000);
    return {
      report: applyProjectVerification(v1923, v1926),
      health: v1924
    };
  } catch (v1927) {
    v1923.connected = false;
    v1923.verification = {
      ok: false,
      code: v1927 instanceof TiaToolError ? v1927.code : "TIA_DIAGNOSTIC_FAILED",
      message: v1927 instanceof Error ? v1927.message : String(v1927),
      checkedAt: new Date().toISOString()
    };
    return {
      report: v1923,
      health: v1924
    };
  }
}
function applyProjectVerification(v1928, v1929) {
  const v1930 = JSON.parse(v1929);
  const v1931 = v1930.data;
  const v1932 = v1931?.project;
  const v1933 = v1930.ok === true && v1930.verified === true && v1930.status === "ok" && v1930.backend === "tia-openness-bridge" && v1930.action === "get_project_status" && v1930.bridgeSchema === "plc-code.tia-openness-bridge.result.v1" && v1932?.isOpen === true && typeof v1932.name === "string" && !!v1932.name && typeof v1932.path === "string" && !!v1932.path && typeof v1931.processId === "number" && v1931.processId > 0 && tiaVersion(v1931.version) === tiaVersion(v1928.version) && tiaVersion(v1930.tiaVersion) === tiaVersion(v1928.version) && v1928.portals?.some(v1934 => v1934.id === v1931.processId && v1934.version === v1928.version) === true;
  const v1935 = v1933 ? {
    ok: true,
    code: "TIA_PROJECT_READ_VERIFIED",
    message: "通过 Openness 读取工程元数据成功。",
    checkedAt: new Date().toISOString(),
    processId: v1931.processId,
    projectName: v1932.name,
    projectPath: v1932.path
  } : {
    ok: false,
    code: v1930.error?.code || "TIA_PROJECT_READ_NOT_VERIFIED",
    message: v1930.error?.message || "没有收到完整、版本一致的已打开工程信息；不能判断连接成功。",
    checkedAt: new Date().toISOString()
  };
  return {
    ...v1928,
    connected: v1933,
    verification: v1935
  };
}
function usesTiaOpenness(v1936) {
  if (!v1936) {
    return false;
  }
  return (v1936.integration?.trim() || v1936.family?.trim() || "").toLowerCase() === "tia_openness";
}
const DECLINED_FILE_NAME = "bridge-trust-declined.txt";
const INSTALL_MARKER_FILE_NAME = "install-occasion.txt";
function stamp(v1937) {
  if (!v1937 || v1937.trim().length === 0) {
    return "";
  }
  try {
    if (!node_fs.existsSync(v1937)) {
      return "";
    }
    const v1938 = node_fs.statSync(v1937);
    const v1939 = node_path.resolve(v1937).toLowerCase();
    return v1939 + "|" + v1938.mtimeMs + "|" + v1938.size;
  } catch {
    return "";
  }
}
function declinedPath(v1940) {
  return node_path.join(v1940, DECLINED_FILE_NAME);
}
function readLastDeclined(v1941) {
  try {
    const v1942 = declinedPath(v1941);
    if (node_fs.existsSync(v1942)) {
      return node_fs.readFileSync(v1942, "utf-8").trim();
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
function writeLastDeclined(v1943, v1944) {
  if (!v1944 || v1944.length === 0) {
    return;
  }
  try {
    node_fs.mkdirSync(v1943, {
      recursive: true
    });
    node_fs.writeFileSync(declinedPath(v1943), v1944, "utf-8");
  } catch {}
}
function clearDeclined(v1945) {
  try {
    const v1946 = declinedPath(v1945);
    if (node_fs.existsSync(v1946)) {
      node_fs.rmSync(v1946);
    }
  } catch {}
}
function installMarkerPath(v1947) {
  return node_path.join(v1947, INSTALL_MARKER_FILE_NAME);
}
function takeInstallOccasion(v1948) {
  let v1949 = "";
  try {
    const v1950 = installMarkerPath(v1948);
    if (!node_fs.existsSync(v1950)) {
      return "Unknown";
    }
    v1949 = node_fs.readFileSync(v1950, "utf-8").trim();
    node_fs.rmSync(v1950);
  } catch {
    return "Unknown";
  }
  if (v1949 === "FirstInstall" || v1949 === "AfterUpdate") {
    return v1949;
  } else {
    return "Unknown";
  }
}
const TRUST_PROMPT_TITLE = "需要你授权一次，TIA 才能连上";
function decide(v1951, v1952, v1953, v1954, v1955, v1956, v1957) {
  if (v1951) {
    return "NotNeeded";
  }
  if (!v1952 || !v1953) {
    return "NotNeeded";
  }
  if (v1954) {
    return "DeferBlockingGate";
  }
  if (v1955) {
    return "DeferGuide";
  }
  if (v1956.length === 0) {
    return "NoStamp";
  }
  if (v1956 === v1957) {
    return "AlreadyDeclined";
  }
  return "Offer";
}
function classifyElevation(v1958) {
  switch (v1958) {
    case 1223:
      return "UserCancelled";
    case 1260:
      return "BlockedByPolicy";
    default:
      return "Failed";
  }
}
function shouldRememberDecline(v1959) {
  return v1959 === "UserCancelled";
}
function elevationFailureMessage(v1960, v1961) {
  switch (v1960) {
    case "UserCancelled":
      return "你在管理员窗口点了「否」，所以什么都没有改动。TIA 相关操作在授权之前会被拒绝，PLC Code 的其它功能照常可用（写程序、检查、生成导入文件都不需要授权）。随时可以在 设置 → TIA 连接 里点「一键信任连接程序」补做。";
    case "BlockedByPolicy":
      return "这台电脑禁止了以管理员身份启动程序（由 Windows 组策略或软件限制策略设定），所以管理员窗口根本没能弹出来——这不是你的操作问题，也不是 PLC Code 出错。\n可行的替代：请这台电脑的管理员（或 IT）用管理员身份运行一次 设置 → TIA 连接 里那个按钮，或者由他们放行该策略；授权是一次性的，做完就一直有效，直到 PLC Code 下次更新。\n在那之前，PLC Code 仍可离线生成并检查程序、生成可导入博途的文件，由你自己在博途里手工导入。";
    case "Failed":
      {
        const v1962 = (v1961 ?? "").trim();
        return "没能启动管理员授权，所以什么都没有改动。请确认 PLC Code 安装完整（连接程序随产品一起安装），然后在 设置 → TIA 连接 里重试。" + (v1962.length === 0 ? "" : "\n系统报告：" + v1962);
      }
    default:
      return v1961 ?? "";
  }
}
function buildMessage(v1963, v1964, v1965 = "Unknown") {
  const v1966 = ["PLC Code 用一个独立的连接程序与 TIA 博途通信。TIA 出于安全，只接受你**亲自授权过的**那一份。", ""];
  switch (v1965) {
    case "FirstInstall":
      v1966.push("这是安装后第一次使用，所以还没有授权过。现在授权一次，之后就一直有效，直到 PLC Code 下次更新（更新会换一份新的连接程序，那时会再问你一次）。这是 TIA 的安全机制，不是出错。");
      break;
    case "AfterUpdate":
      v1966.push("PLC Code 刚更新过，这个连接程序也跟着换成了新的一份，所以之前那次授权对它不再适用。这是 TIA 的安全机制，不是出错，重新授权一次可以一直用到下次更新。");
      break;
    default:
      v1966.push("PLC Code 每次更新，这个连接程序都会跟着换成新的一份，所以第一次使用、以及每次更新之后，都需要你授权一次。这是 TIA 的安全机制，不是出错，一次授权可以一直用到下次更新。");
      break;
  }
  if (v1963.length > 0) {
    v1966.push("");
    v1966.push("目前还没授权的 TIA 版本：" + v1963.join("、"));
  }
  if (v1964.trim().length > 0) {
    v1966.push("");
    v1966.push("要授权的程序：");
    v1966.push(v1964);
  }
  v1966.push("");
  v1966.push("点「去授权」后，Windows 会弹一次管理员确认窗口，请在那里点「是」。PLC Code 自己无法提权，这一步只能由你来点。");
  v1966.push("授权窗口会一闪而过，所以成败不看窗口——授权完 PLC Code 会自己重新检查一遍，把真实结果告诉你。");
  v1966.push("");
  v1966.push("选「以后再说」后，PLC Code 的 TIA 工程操作会停在授权检查，不会反复尝试连接。写程序和离线文件检查仍可使用。当前产品需要登记连接程序，不能用“等博途弹窗”替代这一步。");
  v1966.push("没有管理员权限时，请管理这台电脑的人协助完成一次授权。完成后还要检查 Windows 用户组并实际读取工程，才能确认连接成功。");
  return v1966.join("\n");
}
function successText(v1967) {
  return (v1967.length > 0 ? "TIA " + v1967.join("、") + " 的连接程序授权已复查通过。" : "连接程序授权已复查通过。") + "请继续检查用户权限、运行中的博途并读取工程，以验证实际连接。";
}
function shouldResetDeclineFor(v1968) {
  return v1968 === "FirstInstall" || v1968 === "AfterUpdate";
}
let bridgeTrustOfferedThisRun = false;
let installOccasionCache = null;
let currentInvite = null;
function installOccasion(v1969) {
  if (installOccasionCache !== null) {
    return installOccasionCache;
  }
  installOccasionCache = takeInstallOccasion(v1969);
  if (shouldResetDeclineFor(installOccasionCache)) {
    clearDeclined(v1969);
  }
  return installOccasionCache;
}
function tryOfferBridgeTrust(v1970, v1971, v1972) {
  const v1973 = installOccasion(v1970);
  const v1974 = stamp(v1971.bridgeExePath);
  const v1975 = decide(bridgeTrustOfferedThisRun, v1971.whitelistNeedsTrust, v1971.bridgeExePath.length > 0, v1972.blockingGateOpen, v1972.guideRunning, v1974, readLastDeclined(v1970));
  if (v1975 !== "Offer") {
    return null;
  }
  bridgeTrustOfferedThisRun = true;
  currentInvite = {
    title: TRUST_PROMPT_TITLE,
    message: buildMessage(v1971.whitelistStaleVersions, v1971.bridgeExePath, v1973),
    bridgeExePath: v1971.bridgeExePath,
    versionsBefore: v1971.whitelistStaleVersions
  };
  return currentInvite;
}
function declineCurrentInvite(v1976) {
  if (!currentInvite) {
    return;
  }
  writeLastDeclined(v1976, stamp(currentInvite.bridgeExePath));
  currentInvite = null;
}
async function acceptCurrentInvite(v1977, v1978) {
  const v1979 = currentInvite;
  if (!v1979) {
    return null;
  }
  currentInvite = null;
  return runBridgeTrust(v1977, v1979.bridgeExePath, v1979.versionsBefore, v1978);
}
async function runBridgeTrust(v1980, v1981, v1982, v1983) {
  const v1984 = await trustBridgeElevated(v1981, null);
  const v1985 = v1984.launch.kind === "exitCode";
  if (!v1985) {
    const v1986 = v1984.launch.kind === "elevationError" ? classifyElevation(v1984.launch.win32ErrorCode) : "Failed";
    if (shouldRememberDecline(v1986)) {
      writeLastDeclined(v1980, stamp(v1981));
    }
    return {
      message: elevationFailureMessage(v1986, v1984.errorMessage ?? ""),
      tone: v1986 === "BlockedByPolicy" ? "danger" : "warn",
      blockedByPolicy: v1986 === "BlockedByPolicy"
    };
  }
  const v1987 = await v1983();
  if (v1987.probeOk === true && v1987.whitelistChecked === true && !v1987.whitelistNeedsTrust) {
    clearDeclined(v1980);
    return {
      message: successText(v1982),
      tone: "ok",
      blockedByPolicy: false
    };
  }
  return {
    message: "授权后复查仍有 TIA 版本未信任当前连接程序，详情见 设置 → TIA 连接。",
    tone: "warn",
    blockedByPolicy: false
  };
}
function __resetBridgeTrustOrchestratorForTests() {
  bridgeTrustOfferedThisRun = false;
  installOccasionCache = null;
  currentInvite = null;
}
const ARTIFACT_DIR_NAME = ".plccode";
const ARTIFACT_FILE_NAME = "artifact-state.json";
const ARTIFACT_SCHEMA_VERSION = 1;
const SYNC_SYNCED = "Synced";
const SYNC_OUT_OF_SYNC = "OutOfSync";
const SYNC_UNKNOWN = "Unknown";
const COMPILE_FAILED = "Failed";
const COMPILE_UNKNOWN = "Unknown";
function emptyBlockState() {
  return {
    candidate: null,
    active: null,
    compiled: null,
    downloaded: null,
    verified: null,
    delivered: null
  };
}
function emptyArtifactState() {
  return {
    schemaVersion: ARTIFACT_SCHEMA_VERSION,
    blocks: new Map()
  };
}
function blockOf(v1988, v1989) {
  let v1990 = v1988.blocks.get(v1989);
  if (!v1990) {
    v1990 = emptyBlockState();
    v1988.blocks.set(v1989, v1990);
  }
  return v1990;
}
function timestampNow() {
  return timestamp(new Date());
}
function timestamp(v1991) {
  const v1992 = v1993 => String(v1993).padStart(2, "0");
  const v1994 = -v1991.getTimezoneOffset();
  const v1995 = v1994 >= 0 ? "+" : "-";
  const v1996 = Math.abs(v1994);
  const v1997 = "" + v1995 + v1992(Math.floor(v1996 / 60)) + ":" + v1992(v1996 % 60);
  return v1991.getFullYear() + "-" + v1992(v1991.getMonth() + 1) + "-" + v1992(v1991.getDate()) + "T" + v1992(v1991.getHours()) + ":" + v1992(v1991.getMinutes()) + ":" + v1992(v1991.getSeconds()) + v1997;
}
function momentLabel(v1998) {
  const v1999 = (v1998 ?? "").trim();
  if (v1999.length === 0) {
    return "";
  }
  const v2000 = new Date(v1999);
  if (Number.isNaN(v2000.getTime())) {
    return "";
  }
  const v2001 = v2002 => String(v2002).padStart(2, "0");
  return v2001(v2000.getMonth() + 1) + "-" + v2001(v2000.getDate()) + " " + v2001(v2000.getHours()) + ":" + v2001(v2000.getMinutes());
}
function str$1(v2003, v2004) {
  const v2005 = v2003?.[v2004];
  if (typeof v2005 === "string") {
    return v2005;
  } else {
    return "";
  }
}
function nstr(v2006, v2007) {
  const v2008 = str$1(v2006, v2007);
  if (v2008.length > 0) {
    return v2008;
  } else {
    return null;
  }
}
function nint(v2009, v2010) {
  const v2011 = v2009?.[v2010];
  if (typeof v2011 === "number" && Number.isFinite(v2011)) {
    return v2011;
  } else {
    return null;
  }
}
function obj$1(v2012) {
  if (v2012 && typeof v2012 === "object") {
    return v2012;
  } else {
    return undefined;
  }
}
function parseArtifactState(v2013) {
  const v2014 = emptyArtifactState();
  try {
    const v2015 = JSON.parse(v2013);
    if (typeof v2015 !== "object" || v2015 === null) {
      return v2014;
    }
    if (v2015.schemaVersion !== ARTIFACT_SCHEMA_VERSION) {
      return v2014;
    }
    const v2016 = obj$1(v2015.blocks);
    if (!v2016) {
      return v2014;
    }
    for (const [v2017, v2018] of Object.entries(v2016)) {
      if (v2017.length === 0) {
        continue;
      }
      const v2019 = obj$1(v2018);
      if (!v2019) {
        continue;
      }
      v2014.blocks.set(v2017, {
        candidate: candidateOf(obj$1(v2019.candidate)),
        active: activeOf(obj$1(v2019.active)),
        compiled: compiledOf(obj$1(v2019.compiled)),
        downloaded: downloadedOf(obj$1(v2019.downloaded)),
        verified: verifiedOf(obj$1(v2019.verified)),
        delivered: deliveredOf(obj$1(v2019.delivered))
      });
    }
  } catch {
    return emptyArtifactState();
  }
  return v2014;
}
function candidateOf(v2020) {
  if (!v2020) {
    return null;
  }
  return {
    contentHash: nstr(v2020, "contentHash"),
    sourcePath: nstr(v2020, "sourcePath"),
    sourceSessionId: nstr(v2020, "sourceSessionId"),
    capturedAt: str$1(v2020, "capturedAt"),
    hashUnavailable: nstr(v2020, "hashUnavailable")
  };
}
function activeOf(v2021) {
  if (!v2021) {
    return null;
  }
  return {
    contentHash: nstr(v2021, "contentHash"),
    sourcePath: nstr(v2021, "sourcePath"),
    importedAt: str$1(v2021, "importedAt"),
    tiaFingerprint: nstr(v2021, "tiaFingerprint"),
    deviceName: nstr(v2021, "deviceName"),
    targetPath: nstr(v2021, "targetPath")
  };
}
function compiledOf(v2022) {
  if (!v2022) {
    return null;
  }
  const v2023 = str$1(v2022, "state");
  return {
    state: v2023.length > 0 ? v2023 : COMPILE_UNKNOWN,
    errorCount: nint(v2022, "errorCount"),
    warningCount: nint(v2022, "warningCount"),
    compiledAt: str$1(v2022, "compiledAt"),
    scope: nstr(v2022, "scope"),
    detail: nstr(v2022, "detail")
  };
}
function downloadedOf(v2024) {
  if (!v2024) {
    return null;
  }
  return {
    operationState: str$1(v2024, "operationState"),
    downloadedAt: str$1(v2024, "downloadedAt"),
    deviceItemPath: nstr(v2024, "deviceItemPath"),
    deviceName: nstr(v2024, "deviceName")
  };
}
function verifiedOf(v2025) {
  if (!v2025) {
    return null;
  }
  const v2026 = str$1(v2025, "syncStatus");
  return {
    syncStatus: v2026.length > 0 ? v2026 : SYNC_UNKNOWN,
    verifiedAt: str$1(v2025, "verifiedAt"),
    tiaFingerprint: nstr(v2025, "tiaFingerprint"),
    reason: nstr(v2025, "reason"),
    lastSyncedAt: nstr(v2025, "lastSyncedAt"),
    source: nstr(v2025, "source"),
    observedPath: nstr(v2025, "observedPath"),
    observedContentHash: nstr(v2025, "observedContentHash")
  };
}
function deliveredOf(v2027) {
  if (!v2027) {
    return null;
  }
  return {
    confirmedBy: nstr(v2027, "confirmedBy"),
    confirmedAt: nstr(v2027, "confirmedAt"),
    contentHash: nstr(v2027, "contentHash"),
    tiaFingerprint: nstr(v2027, "tiaFingerprint")
  };
}
function compact(v2028) {
  const v2029 = {};
  for (const [v2030, v2031] of Object.entries(v2028)) {
    if (v2031 === null || v2031 === undefined || v2031 === "") {
      continue;
    }
    v2029[v2030] = v2031;
  }
  return v2029;
}
function artifactStateToJson(v2032) {
  const v2033 = {};
  for (const [v2034, v2035] of v2032.blocks) {
    const v2036 = {};
    if (v2035.candidate) {
      v2036.candidate = compact({
        contentHash: v2035.candidate.contentHash,
        sourcePath: v2035.candidate.sourcePath,
        sourceSessionId: v2035.candidate.sourceSessionId,
        capturedAt: v2035.candidate.capturedAt,
        hashUnavailable: v2035.candidate.hashUnavailable
      });
    }
    if (v2035.active) {
      v2036.active = compact({
        contentHash: v2035.active.contentHash,
        sourcePath: v2035.active.sourcePath,
        importedAt: v2035.active.importedAt,
        tiaFingerprint: v2035.active.tiaFingerprint,
        deviceName: v2035.active.deviceName,
        targetPath: v2035.active.targetPath
      });
    }
    if (v2035.compiled) {
      const v2037 = compact({
        state: v2035.compiled.state,
        compiledAt: v2035.compiled.compiledAt,
        scope: v2035.compiled.scope,
        detail: v2035.compiled.detail
      });
      if (v2035.compiled.errorCount !== null) {
        v2037.errorCount = v2035.compiled.errorCount;
      }
      if (v2035.compiled.warningCount !== null) {
        v2037.warningCount = v2035.compiled.warningCount;
      }
      v2036.compiled = v2037;
    }
    if (v2035.downloaded) {
      v2036.downloaded = compact({
        operationState: v2035.downloaded.operationState,
        downloadedAt: v2035.downloaded.downloadedAt,
        deviceItemPath: v2035.downloaded.deviceItemPath,
        deviceName: v2035.downloaded.deviceName
      });
    }
    if (v2035.verified) {
      v2036.verified = compact({
        syncStatus: v2035.verified.syncStatus,
        verifiedAt: v2035.verified.verifiedAt,
        tiaFingerprint: v2035.verified.tiaFingerprint,
        reason: v2035.verified.reason,
        lastSyncedAt: v2035.verified.lastSyncedAt,
        source: v2035.verified.source,
        observedPath: v2035.verified.observedPath,
        observedContentHash: v2035.verified.observedContentHash
      });
    }
    if (v2035.delivered) {
      v2036.delivered = compact({
        confirmedBy: v2035.delivered.confirmedBy,
        confirmedAt: v2035.delivered.confirmedAt,
        contentHash: v2035.delivered.contentHash,
        tiaFingerprint: v2035.delivered.tiaFingerprint
      });
    }
    v2033[v2034] = v2036;
  }
  return JSON.stringify({
    schemaVersion: ARTIFACT_SCHEMA_VERSION,
    blocks: v2033
  }, null, 2) + "\n";
}
function computeContentHash(v2038) {
  return "sha256:" + node_crypto.createHash("sha256").update(v2038).digest("hex");
}
function resolveCandidates(v2039, v2040) {
  const v2041 = (v2039 ?? "").trim();
  if (v2041.length === 0) {
    return [];
  }
  try {
    if (node_path.isAbsolute(v2041)) {
      return [v2041];
    }
  } catch {
    return [];
  }
  const v2042 = [];
  for (const v2043 of v2040) {
    if (!v2043 || v2043.trim().length === 0) {
      continue;
    }
    try {
      const v2044 = node_path.join(v2043, v2041);
      if (v2044.length > 0) {
        v2042.push(v2044);
      }
    } catch {
      continue;
    }
  }
  return v2042;
}
function artifactDirFor(v2045) {
  return node_path.join(v2045, ARTIFACT_DIR_NAME);
}
function artifactPathFor(v2046) {
  return node_path.join(artifactDirFor(v2046), ARTIFACT_FILE_NAME);
}
function readArtifactState(v2047) {
  if (!v2047 || v2047.trim().length === 0) {
    return emptyArtifactState();
  }
  try {
    const v2048 = artifactPathFor(v2047.trim());
    if (node_fs.existsSync(v2048)) {
      return parseArtifactState(node_fs.readFileSync(v2048, "utf-8"));
    } else {
      return emptyArtifactState();
    }
  } catch {
    return emptyArtifactState();
  }
}
function writeArtifactState(v2049, v2050) {
  const v2051 = artifactDirFor(v2049);
  node_fs.mkdirSync(v2051, {
    recursive: true
  });
  const v2052 = artifactPathFor(v2049);
  const v2053 = v2052 + ".tmp";
  node_fs.writeFileSync(v2053, artifactStateToJson(v2050), "utf-8");
  node_fs.renameSync(v2053, v2052);
}
function readArtifactBytes(v2054, v2055) {
  for (const v2056 of resolveCandidates(v2054, v2055)) {
    try {
      if (node_fs.existsSync(v2056)) {
        return node_fs.readFileSync(v2056);
      }
    } catch {
      continue;
    }
  }
  return null;
}
const TIA_OBSERVATION_SOURCE = {
  DownloadReadBack: "download-read-back",
  Export: "export",
  Compile: "compile"
};
const REASON_NO_OBSERVATION = "本次未取到该块的指纹，无法对照";
const REASON_NO_BASELINE = "导入时未记录指纹，缺少比对基准";
const REASON_DRIFT = "TIA 中的内容与导入版本不一致，期间未执行任何可能改动该块的操作";
const REASON_AMBIGUOUS = "上次核对后曾执行编译，指纹已变，无法区分是编译所致还是在 TIA 中被外部修改";
function tryMoment(v2057) {
  const v2058 = v2057.trim();
  if (v2058.length === 0) {
    return null;
  }
  const v2059 = new Date(v2058);
  if (Number.isNaN(v2059.getTime())) {
    return null;
  } else {
    return v2059;
  }
}
function compiledAfter(v2060, v2061) {
  const v2062 = v2060.compiled?.compiledAt;
  if (!v2062 || v2062.length === 0) {
    return false;
  }
  if (!v2061 || v2061.trim().length === 0) {
    return false;
  }
  const v2063 = tryMoment(v2062);
  const v2064 = tryMoment(v2061);
  if (!v2063 || !v2064) {
    return false;
  }
  return v2063.getTime() > v2064.getTime();
}
function evaluateDrift(v2065, v2066, v2067) {
  const v2068 = v2065.verified;
  const v2069 = v2068?.syncStatus === SYNC_SYNCED ? v2068.verifiedAt : v2068?.lastSyncedAt ?? null;
  const v2070 = (v2071, v2072) => ({
    syncStatus: v2071,
    verifiedAt: v2067,
    tiaFingerprint: v2066.fingerprint,
    reason: v2072,
    lastSyncedAt: v2071 === SYNC_SYNCED ? v2067 : v2069,
    source: v2066.source,
    observedPath: v2066.contentPath ?? null,
    observedContentHash: v2066.contentHash ?? null
  });
  if (!v2066.fingerprint || v2066.fingerprint.trim().length === 0) {
    return v2070(SYNC_UNKNOWN, v2066.unavailableReason ?? REASON_NO_OBSERVATION);
  }
  const v2073 = v2065.active?.tiaFingerprint;
  if (!v2073 || v2073.trim().length === 0) {
    return v2070(SYNC_UNKNOWN, REASON_NO_BASELINE);
  }
  if (v2073 === v2066.fingerprint) {
    return v2070(SYNC_SYNCED, null);
  }
  const v2074 = v2068?.tiaFingerprint;
  if (v2074 && v2074.length > 0 && v2074 === v2066.fingerprint) {
    const v2075 = v2068.syncStatus === SYNC_OUT_OF_SYNC ? SYNC_OUT_OF_SYNC : SYNC_UNKNOWN;
    return v2070(v2075, v2068.reason ?? REASON_AMBIGUOUS);
  }
  if (v2066.source === TIA_OBSERVATION_SOURCE.Compile || compiledAfter(v2065, v2068?.verifiedAt ?? v2065.active?.importedAt)) {
    return v2070(SYNC_UNKNOWN, REASON_AMBIGUOUS);
  }
  return v2070(SYNC_OUT_OF_SYNC, REASON_DRIFT);
}
function applyToolResult(v2076, v2077, v2078, v2079, v2080, v2081 = null, v2082 = null) {
  const v2083 = (v2077 ?? "").trim();
  const v2084 = v2078 ?? "";
  if (v2083.length === 0 || v2084.length === 0) {
    return false;
  }
  const v2085 = timestampFor(v2080);
  if (isGenerator(v2083)) {
    if (v2079) {
      return false;
    } else {
      return applyCandidate(v2076, v2084, v2085, v2081, v2082);
    }
  }
  if (v2083.includes("import_block")) {
    return !v2079 && applyImport(v2076, v2084, v2085);
  }
  if (v2083.includes("export_block")) {
    return !v2079 && applyExport(v2076, v2084, v2085);
  }
  if (v2083.endsWith("_compile") || v2083.includes("openness_compile")) {
    return applyCompile(v2076, v2084, v2079, v2085);
  }
  if (v2083.includes("download_to_device")) {
    return !v2079 && applyDownload(v2076, v2084, v2085);
  }
  return false;
}
function timestampFor(v2086) {
  const v2087 = v2088 => String(v2088).padStart(2, "0");
  const v2089 = -v2086.getTimezoneOffset();
  const v2090 = v2089 >= 0 ? "+" : "-";
  const v2091 = Math.abs(v2089);
  const v2092 = "" + v2090 + v2087(Math.floor(v2091 / 60)) + ":" + v2087(v2091 % 60);
  return v2086.getFullYear() + "-" + v2087(v2086.getMonth() + 1) + "-" + v2087(v2086.getDate()) + "T" + v2087(v2086.getHours()) + ":" + v2087(v2086.getMinutes()) + ":" + v2087(v2086.getSeconds()) + v2092;
}
function isGenerator(v2093) {
  return v2093.startsWith("tia_") && v2093.includes("generate");
}
function root(v2094) {
  try {
    const v2095 = JSON.parse(v2094);
    if (v2095 && typeof v2095 === "object" && !Array.isArray(v2095)) {
      return v2095;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function bridgeResultRoot(v2096) {
  const v2097 = "bridge_result=";
  const v2098 = v2096.indexOf(v2097);
  if (v2098 < 0) {
    return null;
  }
  return root(v2096.slice(v2098 + v2097.length).trim());
}
function objOf(v2099, v2100) {
  if (!v2099) {
    return null;
  }
  const v2101 = v2099[v2100];
  if (v2101 && typeof v2101 === "object" && !Array.isArray(v2101)) {
    return v2101;
  }
  for (const [v2102, v2103] of Object.entries(v2099)) {
    if (v2102.toLowerCase() === v2100.toLowerCase() && v2103 && typeof v2103 === "object" && !Array.isArray(v2103)) {
      return v2103;
    }
  }
  return null;
}
function strOf(v2104, v2105) {
  if (!v2104) {
    return "";
  }
  for (const [v2106, v2107] of Object.entries(v2104)) {
    if (v2106.toLowerCase() !== v2105.toLowerCase()) {
      continue;
    }
    if (typeof v2107 === "string") {
      return v2107;
    } else {
      return "";
    }
  }
  return "";
}
function nstrOf(v2108, v2109) {
  const v2110 = strOf(v2108, v2109);
  if (v2110.length > 0) {
    return v2110;
  } else {
    return null;
  }
}
function boolOf(v2111, v2112) {
  if (!v2111) {
    return false;
  }
  for (const [v2113, v2114] of Object.entries(v2111)) {
    if (v2113.toLowerCase() !== v2112.toLowerCase()) {
      continue;
    }
    return v2114 === true;
  }
  return false;
}
function intLikeOf(v2115, v2116) {
  if (!v2115) {
    return null;
  }
  for (const [v2117, v2118] of Object.entries(v2115)) {
    if (v2117.toLowerCase() !== v2116.toLowerCase()) {
      continue;
    }
    if (typeof v2118 === "number" && Number.isFinite(v2118)) {
      return v2118;
    }
    if (typeof v2118 === "string") {
      const v2119 = Number.parseInt(v2118, 10);
      if (Number.isNaN(v2119)) {
        return null;
      } else {
        return v2119;
      }
    }
    return null;
  }
  return null;
}
function firstLine(v2120) {
  const v2121 = v2120.replace(/\r\n/g, "\n").split("\n")[0]?.trim() ?? "";
  if (v2121.length <= 160) {
    return v2121;
  } else {
    return v2121.slice(0, 158) + "…";
  }
}
function leafName(v2122) {
  if (!v2122 || v2122.trim().length === 0) {
    return null;
  }
  const v2123 = v2122.split(/[\\/]/).filter(v2124 => v2124.length > 0);
  if (v2123.length === 0) {
    return null;
  } else {
    return v2123[v2123.length - 1].trim();
  }
}
function fingerprintValue(v2125) {
  if (!v2125) {
    return null;
  }
  if (v2125.supported === false) {
    return null;
  }
  const v2126 = nstrOf(v2125, "value");
  if (v2126 !== null) {
    return v2126;
  }
  const v2127 = v2125.fingerprints;
  if (Array.isArray(v2127)) {
    for (const v2128 of v2127) {
      const v2129 = v2128 && typeof v2128 === "object" ? v2128 : null;
      const v2130 = v2129 ? nstrOf(v2129, "value") : null;
      if (v2130 !== null) {
        return v2130;
      }
    }
  }
  return null;
}
function identityBlocks(v2131) {
  const v2132 = [];
  const v2133 = v2131?.blocks;
  if (!Array.isArray(v2133)) {
    return v2132;
  }
  for (const v2134 of v2133) {
    const v2135 = v2134 && typeof v2134 === "object" ? v2134 : null;
    if (!v2135) {
      continue;
    }
    const v2136 = strOf(v2135, "name");
    if (v2136.length === 0) {
      continue;
    }
    v2132.push({
      name: v2136,
      fingerprint: fingerprintValue(objOf(v2135, "tiaFingerprint"))
    });
  }
  return v2132;
}
function sdDeclarationPath(v2137) {
  const v2138 = v2137.files;
  if (!Array.isArray(v2138)) {
    return null;
  }
  for (const v2139 of v2138) {
    const v2140 = v2139 && typeof v2139 === "object" ? v2139 : null;
    if (!v2140) {
      continue;
    }
    if (strOf(v2140, "kind").toLowerCase() !== "s7dcl") {
      continue;
    }
    const v2141 = strOf(v2140, "path");
    if (v2141.length > 0) {
      return v2141;
    }
  }
  return null;
}
function applyCandidate(v2142, v2143, v2144, v2145, v2146) {
  const v2147 = root(v2143);
  if (!v2147) {
    return false;
  }
  let v2148 = strOf(v2147, "blockName");
  if (v2148.length === 0) {
    v2148 = strOf(v2147, "block_name");
  }
  if (v2148.length === 0) {
    return false;
  }
  const v2149 = strOf(v2147, "xml");
  let v2150 = strOf(v2147, "outputPath");
  const v2151 = sdDeclarationPath(v2147);
  let v2152 = null;
  let v2153 = null;
  if (v2151 !== null) {
    v2150 = v2151;
    const v2154 = v2146?.(v2151) ?? null;
    if (v2154) {
      v2152 = computeContentHash(v2154);
    } else {
      v2153 = "生成的 .s7dcl 读不到，未能计算内容哈希";
    }
  } else if (v2149.length > 0) {
    v2152 = computeContentHash(Buffer.from(v2149, "utf-8"));
  } else if (v2150.length > 0) {
    const v2155 = v2146?.(v2150) ?? null;
    if (v2155) {
      v2152 = computeContentHash(v2155);
    } else {
      v2153 = "生成的文件读不到，未能计算内容哈希";
    }
  } else {
    v2153 = "生成结果里既没有文件路径也没有内联内容";
  }
  const v2156 = blockOf(v2142, v2148);
  v2156.candidate = {
    contentHash: v2152,
    sourcePath: v2150.length > 0 ? v2150 : null,
    sourceSessionId: v2145 && v2145.trim().length > 0 ? v2145 : null,
    capturedAt: v2144,
    hashUnavailable: v2153
  };
  return true;
}
function compiledFrom(v2157, v2158, v2159) {
  if (!v2157) {
    return null;
  }
  const v2160 = strOf(v2157, "state");
  const v2161 = intLikeOf(v2157, "errorCount");
  const v2162 = intLikeOf(v2157, "warningCount");
  if (v2160.length === 0 && v2161 === null && v2162 === null) {
    return null;
  }
  const v2163 = v2160.toLowerCase() === "error" || (v2161 ?? 0) > 0 ? COMPILE_FAILED : v2160.length > 0 || v2161 !== null ? "Success" : COMPILE_UNKNOWN;
  return {
    state: v2163,
    errorCount: v2161,
    warningCount: v2162,
    compiledAt: v2158,
    scope: v2159,
    detail: null
  };
}
function fallbackImportedBlocks(v2164) {
  const v2165 = [];
  for (const v2166 of ["imported", "importedBlocks"]) {
    const v2167 = v2164[v2166];
    if (!Array.isArray(v2167)) {
      continue;
    }
    for (const v2168 of v2167) {
      const v2169 = v2168 && typeof v2168 === "object" ? v2168 : null;
      if (!v2169) {
        continue;
      }
      const v2170 = strOf(v2169, "name");
      if (v2170.length > 0) {
        v2165.push({
          name: v2170,
          fingerprint: null
        });
      }
    }
  }
  return v2165;
}
function applyImport(v2171, v2172, v2173) {
  const v2174 = root(v2172);
  if (!v2174) {
    return false;
  }
  const v2175 = objOf(v2174, "data") ?? v2174;
  const v2176 = objOf(v2175, "identity");
  const v2177 = nstrOf(v2175, "deviceName");
  const v2178 = nstrOf(v2175, "targetPath");
  const v2179 = v2176 ? nstrOf(v2176, "contentHash") : null;
  const v2180 = v2176 ? nstrOf(v2176, "contentPath") : null;
  let v2181 = identityBlocks(v2176);
  if (v2181.length === 0) {
    v2181 = fallbackImportedBlocks(v2175);
  }
  if (v2181.length === 0) {
    return false;
  }
  const v2182 = compiledFrom(objOf(v2175, "compile"), v2173, "随导入编译");
  for (const v2183 of v2181) {
    const v2184 = blockOf(v2171, v2183.name);
    v2184.active = {
      contentHash: v2179,
      sourcePath: v2180 ?? nstrOf(v2175, "xmlPath"),
      importedAt: v2173,
      tiaFingerprint: v2183.fingerprint,
      deviceName: v2177,
      targetPath: v2178
    };
    if (v2182) {
      v2184.compiled = {
        ...v2182
      };
    }
  }
  return true;
}
function applyExport(v2185, v2186, v2187) {
  const v2188 = root(v2186);
  if (!v2188) {
    return false;
  }
  const v2189 = objOf(v2188, "data") ?? v2188;
  const v2190 = objOf(v2189, "identity");
  if (!v2190) {
    return false;
  }
  const v2191 = nstrOf(v2190, "contentHash");
  const v2192 = nstrOf(v2190, "contentPath");
  let v2193 = false;
  for (const v2194 of identityBlocks(v2190)) {
    const v2195 = v2185.blocks.get(v2194.name);
    if (!v2195 || !v2195.active) {
      continue;
    }
    v2195.verified = evaluateDrift(v2195, {
      blockName: v2194.name,
      fingerprint: v2194.fingerprint,
      source: TIA_OBSERVATION_SOURCE.Export,
      contentHash: v2191,
      contentPath: v2192,
      unavailableReason: "本次导出没有取到该块的指纹，没法对照"
    }, v2187);
    v2193 = true;
  }
  return v2193;
}
function compileTargets(v2196, v2197) {
  const v2198 = v2197 ? strOf(v2197, "targetKind") : "";
  const v2199 = [];
  const v2200 = v2197?.compiledBlocks;
  if (Array.isArray(v2200)) {
    for (const v2201 of v2200) {
      const v2202 = v2201 && typeof v2201 === "object" ? v2201 : null;
      if (!v2202) {
        continue;
      }
      let v2203 = strOf(v2202, "blockName");
      if (v2203.length === 0) {
        v2203 = strOf(v2202, "name");
      }
      if (v2203.length > 0 && v2196.blocks.has(v2203)) {
        v2199.push(v2203);
      }
    }
  }
  if (v2199.length > 0) {
    return v2199;
  }
  if (v2198 === "block" || v2198 === "type") {
    const v2204 = leafName(v2197 ? nstrOf(v2197, "targetPath") : null);
    if (v2204 && v2204.length > 0 && v2196.blocks.has(v2204)) {
      return [v2204];
    } else {
      return [];
    }
  }
  const v2205 = v2197 ? nstrOf(v2197, "targetPath") : null;
  for (const [v2206, v2207] of v2196.blocks) {
    const v2208 = v2207.active;
    if (!v2208) {
      continue;
    }
    if (v2198 === "plc_software" && v2205 && v2205.length > 0 && v2208.deviceName && v2208.deviceName.length > 0 && v2205.toLowerCase() !== v2208.deviceName.toLowerCase()) {
      continue;
    }
    v2199.push(v2206);
  }
  return v2199;
}
function applyCompiledFingerprints(v2209, v2210, v2211) {
  const v2212 = v2210?.compiledBlocks;
  if (!Array.isArray(v2212)) {
    return;
  }
  for (const v2213 of v2212) {
    const v2214 = v2213 && typeof v2213 === "object" ? v2213 : null;
    if (!v2214) {
      continue;
    }
    let v2215 = strOf(v2214, "blockName");
    if (v2215.length === 0) {
      v2215 = strOf(v2214, "name");
    }
    if (v2215.length === 0) {
      continue;
    }
    const v2216 = fingerprintValue(objOf(v2214, "tiaFingerprint"));
    if (!v2216 || v2216.trim().length === 0) {
      continue;
    }
    const v2217 = v2209.blocks.get(v2215);
    if (!v2217 || !v2217.active) {
      continue;
    }
    v2217.verified = evaluateDrift(v2217, {
      fingerprint: v2216,
      source: TIA_OBSERVATION_SOURCE.Compile
    }, v2211);
  }
}
function applyCompile(v2218, v2219, v2220, v2221) {
  const v2222 = root(v2219) ?? bridgeResultRoot(v2219);
  const v2223 = v2222 ? objOf(v2222, "data") ?? objOf(v2222, "Data") ?? v2222 : null;
  const v2224 = v2223 ? objOf(v2223, "compile") : null;
  let v2225 = compiledFrom(v2224, v2221, "编译");
  if (!v2225) {
    if (!v2220) {
      return false;
    }
    v2225 = {
      state: COMPILE_FAILED,
      errorCount: null,
      warningCount: null,
      compiledAt: v2221,
      scope: "编译",
      detail: firstLine(v2219)
    };
  } else if (v2220) {
    v2225 = {
      ...v2225,
      state: COMPILE_FAILED,
      detail: v2225.detail ?? firstLine(v2219)
    };
  }
  const v2226 = compileTargets(v2218, v2223);
  if (v2226.length === 0) {
    return false;
  }
  for (const v2227 of v2226) {
    blockOf(v2218, v2227).compiled = {
      ...v2225
    };
  }
  if (!v2220) {
    applyCompiledFingerprints(v2218, v2223, v2221);
  }
  return true;
}
function applyDownload(v2228, v2229, v2230) {
  const v2231 = root(v2229);
  if (!v2231) {
    return false;
  }
  const v2232 = objOf(v2231, "data") ?? v2231;
  const v2233 = objOf(v2232, "target");
  const v2234 = v2233 ? nstrOf(v2233, "DeviceName") : null;
  const v2235 = v2233 ? nstrOf(v2233, "deviceItemPath") : null;
  const v2236 = objOf(v2232, "identity");
  const v2237 = new Map();
  const v2238 = !!v2236 && (v2236.available === undefined || v2236.available === null || boolOf(v2236, "available"));
  for (const v2239 of identityBlocks(v2236)) {
    v2237.set(v2239.name, v2239.fingerprint);
  }
  let v2240 = false;
  for (const [v2241, v2242] of v2228.blocks) {
    const v2243 = v2237.has(v2241);
    const v2244 = v2237.get(v2241) ?? null;
    const v2245 = !!v2242.active?.deviceName && !!(v2242.active.deviceName.length > 0) && !!v2234 && !!(v2234.length > 0) && v2242.active.deviceName.toLowerCase() === v2234.toLowerCase();
    if (!v2243 && !v2245) {
      continue;
    }
    if (!v2242.active && !v2243) {
      continue;
    }
    v2242.downloaded = {
      operationState: "Succeeded",
      downloadedAt: v2230,
      deviceItemPath: v2235,
      deviceName: v2234
    };
    const v2246 = v2238 && v2243 ? v2244 : null;
    v2242.verified = evaluateDrift(v2242, {
      fingerprint: v2246,
      source: TIA_OBSERVATION_SOURCE.DownloadReadBack,
      unavailableReason: "本次下载没有取到该块的指纹，没法对照"
    }, v2230);
    v2240 = true;
  }
  return v2240;
}
const ARTIFACT_OPEN_CHECK_EMPTY = {
  checked: 0,
  drifted: 0,
  missing: 0,
  touched: false
};
const ARTIFACT_OPEN_CHECK_MISSING_NOTE = "工程里找不到该文件，无法确认其是否仍是记录时的版本";
function runArtifactOpenCheck(v2247, v2248) {
  if (!v2248) {
    return ARTIFACT_OPEN_CHECK_EMPTY;
  }
  let v2249 = 0;
  let v2250 = 0;
  let v2251 = 0;
  let v2252 = false;
  for (const v2253 of v2247.blocks.values()) {
    const v2254 = v2253.candidate;
    if (!v2254) {
      continue;
    }
    const v2255 = v2254.sourcePath;
    if (!v2255 || v2255.length === 0) {
      continue;
    }
    v2249++;
    let v2256;
    try {
      v2256 = v2248(v2255);
    } catch {
      v2256 = null;
    }
    if (!v2256) {
      v2251++;
      if (v2254.hashUnavailable !== ARTIFACT_OPEN_CHECK_MISSING_NOTE) {
        v2254.hashUnavailable = ARTIFACT_OPEN_CHECK_MISSING_NOTE;
        v2252 = true;
      }
      continue;
    }
    const v2257 = computeContentHash(v2256);
    if (v2254.hashUnavailable && v2254.hashUnavailable.length > 0) {
      v2254.hashUnavailable = null;
      v2252 = true;
    }
    if (v2254.contentHash === v2257) {
      continue;
    }
    if (v2254.contentHash && v2254.contentHash.length > 0) {
      v2250++;
    }
    v2254.contentHash = v2257;
    v2252 = true;
  }
  return {
    checked: v2249,
    drifted: v2250,
    missing: v2251,
    touched: v2252
  };
}
function artifactOpenCheckNotice(v2258) {
  if (v2258.checked === 0) {
    return "";
  }
  const v2259 = [];
  if (v2258.drifted > 0) {
    v2259.push(v2258.drifted + " 个在 PLC Code 之外被修改，已按磁盘内容更新");
  }
  if (v2258.missing > 0) {
    v2259.push(v2258.missing + " 个在工程里找不到");
  }
  if (v2259.length === 0) {
    return "打开工程时核对了 " + v2258.checked + " 个本地文件：与上次记录一致。";
  } else {
    return "打开工程时核对了 " + v2258.checked + " 个本地文件：" + v2259.join("；") + "。";
  }
}
function chainClosed(v2260) {
  return !!v2260.downloaded && v2260.verified?.syncStatus === SYNC_SYNCED;
}
function canMark(v2261) {
  return chainClosed(v2261) && (!v2261.delivered?.confirmedAt || !(v2261.delivered.confirmedAt.length > 0));
}
function mark(v2262, v2263, v2264 = "user") {
  const v2265 = {
    confirmedBy: v2264,
    confirmedAt: v2263,
    contentHash: v2262.active?.contentHash ?? null,
    tiaFingerprint: v2262.active?.tiaFingerprint ?? null
  };
  v2262.delivered = v2265;
  return v2265;
}
function artifactDelivered_drifted(v2266) {
  const v2267 = v2266.delivered;
  if (!v2267 || !v2267.confirmedAt || v2267.confirmedAt.length === 0) {
    return false;
  }
  const v2268 = v2266.active;
  if (!v2268) {
    return false;
  }
  if (v2267.contentHash && v2267.contentHash.length > 0 && v2268.contentHash && v2268.contentHash.length > 0) {
    return v2267.contentHash !== v2268.contentHash;
  }
  if (v2267.tiaFingerprint && v2267.tiaFingerprint.length > 0 && v2268.tiaFingerprint && v2268.tiaFingerprint.length > 0) {
    return v2267.tiaFingerprint !== v2268.tiaFingerprint;
  }
  return false;
}
const ARTIFACT_DELIVERY_DRIFT_NOTE = "已交付版本与当前活动版本不同";
function classify(v2269) {
  if (!v2269.active) {
    return "CandidateOnly";
  }
  const v2270 = v2269.candidate?.contentHash;
  const v2271 = v2269.active.contentHash;
  if (v2270 && v2270.length > 0 && v2271 && v2271.length > 0 && v2270 !== v2271) {
    return "BehindCandidate";
  }
  if (v2269.verified?.syncStatus === SYNC_OUT_OF_SYNC) {
    return "OutOfSync";
  }
  if (v2269.compiled?.state === COMPILE_FAILED) {
    return "CompileFailed";
  }
  if (!v2269.downloaded) {
    return "NotDownloaded";
  }
  if (v2269.verified?.syncStatus === SYNC_SYNCED) {
    return "Synced";
  } else {
    return "Unverified";
  }
}
function statusLabel(v2272) {
  switch (v2272) {
    case "CandidateOnly":
      return "未导入 TIA";
    case "BehindCandidate":
      return "本地已修改，TIA 待更新";
    case "OutOfSync":
      return "TIA 中被外部修改";
    case "CompileFailed":
      return "编译失败";
    case "NotDownloaded":
      return "未下载至 PLC";
    case "Unverified":
      return "PLC 版本未核实";
    case "Synced":
      return "已同步";
    default:
      return "状态未知";
  }
}
function statusKind(v2273) {
  switch (v2273) {
    case "OutOfSync":
    case "CompileFailed":
      return "danger";
    case "BehindCandidate":
    case "Unverified":
      return "warn";
    case "Synced":
      return "ok";
    default:
      return "faint";
  }
}
function howTo(v2274) {
  switch (v2274) {
    case "BehindCandidate":
      return "重新导入以更新";
    case "CandidateOnly":
      return "导入至 TIA 工程";
    case "Unverified":
      return "点击下方「核对 TIA」确认";
    case "OutOfSync":
      return "用下方横幅/按钮以 TIA 当前内容为准更新本地";
    case "CompileFailed":
      return "查看编译错误信息，修复后重新导入";
    default:
      return "";
  }
}
const SEVERITY_ORDER = ["OutOfSync", "CompileFailed", "BehindCandidate", "Unverified", "CandidateOnly", "NotDownloaded", "Synced"];
function projectLine(v2275) {
  const v2276 = new Map();
  for (const v2277 of v2275.blocks.values()) {
    const v2278 = classify(v2277);
    v2276.set(v2278, (v2276.get(v2278) ?? 0) + 1);
  }
  const v2279 = v2275.blocks.size;
  if (v2279 === 0) {
    return "";
  }
  if ((v2276.get("Synced") ?? 0) === v2279) {
    return v2279 + " 个块全部同步";
  }
  const v2280 = [];
  for (const v2281 of SEVERITY_ORDER) {
    const v2282 = v2276.get(v2281) ?? 0;
    if (v2282 > 0) {
      v2280.push(v2282 + " 个块" + statusLabel(v2281));
    }
  }
  return v2280.join(" · ");
}
function pillLine(v2283) {
  const v2284 = v2283.blocks.size;
  if (v2284 === 0) {
    return "";
  }
  let v2285 = 0;
  let v2286 = 0;
  for (const v2287 of v2283.blocks.values()) {
    const v2288 = classify(v2287);
    if (v2288 === "Synced") {
      v2285++;
    } else if (v2288 !== "NotDownloaded") {
      v2286++;
    }
  }
  if (v2285 === v2284) {
    return v2284 + " 个块已同步";
  }
  if (v2286 === 0) {
    return v2284 + " 个块进行中";
  }
  return v2286 + " 个块须注意";
}
function needsAttention(v2289) {
  for (const v2290 of v2289.blocks.values()) {
    const v2291 = classify(v2290);
    if (v2291 === "CompileFailed" || v2291 === "Unverified" || v2291 === "OutOfSync") {
      return true;
    }
  }
  return false;
}
function compose(v2292, v2293) {
  if (v2293.length > 0) {
    return v2292 + "（" + v2293 + "）";
  } else {
    return v2292;
  }
}
function syncedHead(v2294) {
  switch (v2294) {
    case TIA_OBSERVATION_SOURCE.Export:
      return "已对照：TIA 里还是我们导入的那一版";
    case TIA_OBSERVATION_SOURCE.Compile:
      return "已对照：编译后 TIA 里没变";
    default:
      return "已对照：和这次下载的一致";
  }
}
function timeline(v2295) {
  const v2296 = [];
  if (v2295.candidate) {
    const v2297 = momentLabel(v2295.candidate.capturedAt);
    const v2298 = v2295.candidate.hashUnavailable && v2295.candidate.hashUnavailable.length > 0 ? "（" + v2295.candidate.hashUnavailable + "）" : "";
    v2296.push(compose("本地文件已生成", v2297) + v2298);
  }
  if (v2295.active) {
    v2296.push(compose("已导入 TIA", momentLabel(v2295.active.importedAt)));
  }
  if (v2295.compiled) {
    const v2299 = momentLabel(v2295.compiled.compiledAt);
    const v2300 = v2295.compiled.errorCount !== null ? v2295.compiled.errorCount + " 错误" + (v2295.compiled.warningCount !== null ? " " + v2295.compiled.warningCount + " 警告" : "") : "";
    const v2301 = v2295.compiled.state === "Success" ? v2300.length > 0 ? "编译通过，" + v2300 : "编译通过" : v2295.compiled.state === COMPILE_FAILED ? v2300.length > 0 ? "编译失败，" + v2300 : "编译失败" : "编译结果未知";
    v2296.push(compose(v2301, v2299));
  }
  if (v2295.downloaded) {
    v2296.push(compose("已下载到 PLC", momentLabel(v2295.downloaded.downloadedAt)));
  }
  if (v2295.verified) {
    const v2302 = momentLabel(v2295.verified.verifiedAt);
    const v2303 = v2295.verified.lastSyncedAt && v2295.verified.lastSyncedAt.length > 0 ? "（上次对上是 " + momentLabel(v2295.verified.lastSyncedAt) + "）" : "";
    if (v2295.verified.syncStatus === SYNC_SYNCED) {
      v2296.push(compose(syncedHead(v2295.verified.source), v2302));
    } else if (v2295.verified.syncStatus === SYNC_OUT_OF_SYNC) {
      v2296.push(compose("TIA 里的内容已被外部修改（可能在 TIA Portal 里手动编辑过），本地工程文件未包含这些改动", v2302) + v2303);
    } else {
      const v2304 = v2295.verified.reason && v2295.verified.reason.length > 0 ? "：" + v2295.verified.reason : "";
      v2296.push(compose("未能对照" + v2304, v2302) + v2303);
    }
  }
  if (v2295.compiled?.state === COMPILE_FAILED && v2295.downloaded) {
    v2296.push("编译失败，PLC 里仍是上一次下载的版本");
  }
  if (v2295.delivered && v2295.delivered.confirmedAt && v2295.delivered.confirmedAt.length > 0) {
    v2296.push(compose("已标记正式交付", momentLabel(v2295.delivered.confirmedAt)));
    if (artifactDelivered_drifted(v2295)) {
      v2296.push(ARTIFACT_DELIVERY_DRIFT_NOTE);
    }
  }
  if (v2296.length === 0) {
    v2296.push("尚未记录到任何一步");
  }
  return v2296;
}
function driftedBlocks(v2305) {
  const v2306 = [];
  for (const [v2307, v2308] of v2305.blocks) {
    if (classify(v2308) === "OutOfSync") {
      v2306.push(v2307);
    }
  }
  return v2306;
}
function driftBanner(v2309) {
  const v2310 = driftedBlocks(v2309);
  if (v2310.length === 0) {
    return "";
  }
  if (v2310.length === 1) {
    return "TIA 工程里的 " + v2310[0] + " 已被外部修改（可能在 TIA Portal 里手动编辑过），本地工程文件未包含这些改动。";
  }
  const v2311 = v2310.slice(0, 3).join("、");
  const v2312 = v2310.length > 3 ? "等 " + v2310.length + " 个块" : v2310.length + " 个块";
  return "TIA 工程里的 " + v2311 + " " + v2312 + "已被外部修改（可能在 TIA Portal 里手动编辑过），本地工程文件未包含这些改动。";
}
function verifiableBlocks(v2313) {
  const v2314 = [];
  for (const [v2315, v2316] of v2313.blocks) {
    if (v2316.active) {
      v2314.push(v2315);
    }
  }
  return v2314;
}
function short(v2317) {
  const v2318 = v2317.startsWith("sha256:") ? v2317.slice("sha256:".length) : v2317;
  if (v2318.length <= 12) {
    return v2318;
  } else {
    return v2318.slice(0, 12);
  }
}
function detail(v2319) {
  const v2320 = [];
  if (v2319.candidate?.contentHash) {
    v2320.push("本地内容 " + short(v2319.candidate.contentHash));
  }
  if (v2319.active?.contentHash) {
    v2320.push("TIA 内容 " + short(v2319.active.contentHash));
  }
  if (v2319.active?.tiaFingerprint) {
    v2320.push("TIA 指纹 " + short(v2319.active.tiaFingerprint));
  }
  if (v2319.verified?.tiaFingerprint) {
    v2320.push("读回指纹 " + short(v2319.verified.tiaFingerprint));
  }
  if (v2319.downloaded?.deviceItemPath) {
    v2320.push("下载目标 " + v2319.downloaded.deviceItemPath);
  }
  if (v2319.verified?.observedPath) {
    v2320.push("TIA 当前内容已导出到 " + v2319.verified.observedPath);
  }
  return v2320.join(" · ");
}
function readArtifactFor(v2321, v2322) {
  const v2323 = [v2322, v2321].filter(v2324 => v2324.length > 0);
  return v2325 => readArtifactBytes(v2325, v2323);
}
function buildVm(v2326, v2327, v2328) {
  const v2329 = [];
  for (const [v2330, v2331] of v2327.blocks) {
    const v2332 = classify(v2331);
    v2329.push({
      blockName: v2330,
      statusText: statusLabel(v2332),
      statusKind: statusKind(v2332),
      timeline: timeline(v2331),
      howTo: howTo(v2332),
      detail: detail(v2331),
      canDeliver: canMark(v2331)
    });
  }
  const v2333 = driftedBlocks(v2327);
  const v2334 = v2333.map(v2335 => v2335 + "@" + (v2327.blocks.get(v2335)?.verified?.tiaFingerprint ?? "")).join("|");
  return {
    pill: pillLine(v2327),
    attention: needsAttention(v2327),
    projectLine: projectLine(v2327),
    openCheckNotice: v2328,
    verifiableBlockNames: verifiableBlocks(v2327),
    driftedBlockNames: v2333,
    driftBannerText: driftBanner(v2327),
    driftSignature: v2334,
    rows: v2329,
    sidecarPath: artifactPathFor(v2326)
  };
}
function runArtifactOpenCheckAndBuildVm(v2336, v2337) {
  if (!v2336 || v2336.trim().length === 0) {
    return buildVm("", {
      blocks: new Map()
    }, "");
  }
  const v2338 = readArtifactState(v2336);
  let v2339 = "";
  try {
    const v2340 = runArtifactOpenCheck(v2338, readArtifactFor(v2336, v2337));
    v2339 = artifactOpenCheckNotice(v2340);
    if (v2340.touched) {
      writeArtifactState(v2336, v2338);
    }
  } catch (v2341) {
    console.error("[artifactController] open-check skipped:", v2341);
  }
  return buildVm(v2336, v2338, v2339);
}
function applyArtifactToolResult(v2342, v2343, v2344, v2345, v2346, v2347) {
  if (!v2342 || v2342.trim().length === 0) {
    return null;
  }
  const v2348 = readArtifactState(v2342);
  let v2349;
  try {
    v2349 = applyToolResult(v2348, v2344, v2345, v2346, new Date(), v2347, readArtifactFor(v2342, v2343));
  } catch (v2350) {
    console.error("[artifactController] tool_result bookkeeping skipped:", v2350);
    return null;
  }
  if (!v2349) {
    return null;
  }
  try {
    writeArtifactState(v2342, v2348);
  } catch (v2351) {
    console.error("[artifactController] sidecar write failed:", v2351);
  }
  return buildVm(v2342, v2348, "");
}
function markDelivered(v2352, v2353) {
  if (!v2352 || v2352.trim().length === 0) {
    return null;
  }
  const v2354 = readArtifactState(v2352);
  const v2355 = v2354.blocks.get(v2353);
  if (!v2355 || !canMark(v2355)) {
    return null;
  }
  mark(v2355, timestampNow());
  try {
    writeArtifactState(v2352, v2354);
  } catch (v2356) {
    console.error("[artifactController] sidecar write failed:", v2356);
    return null;
  }
  return buildVm(v2352, v2354, "");
}
class UpdateService {
  constructor(v2357) {
    this.identity = v2357;
    if (!v2357.updatesEnabled) {
      return;
    }
    electronUpdater.autoUpdater.autoDownload = false;
    electronUpdater.autoUpdater.autoInstallOnAppQuit = false;
  }
  identity;
  pendingVersion = null;
  checked = false;
  get canUpdate() {
    return this.identity.updatesEnabled && this.checked && this.pendingVersion !== null;
  }
  get currentVersion() {
    return electronUpdater.autoUpdater.currentVersion.version;
  }
  async checkAsync() {
    this.pendingVersion = null;
    this.checked = true;
    if (!this.identity.updatesEnabled) {
      return null;
    }
    try {
      const v2358 = await electronUpdater.autoUpdater.checkForUpdates();
      const v2359 = v2358?.updateInfo?.version ?? null;
      if (v2358?.isUpdateAvailable === true && v2359 && v2359 !== this.currentVersion) {
        this.pendingVersion = v2359;
        return v2359;
      }
      return null;
    } catch (v2360) {
      console.error("[updateService] checkAsync failed (treated as \"no update\"):", v2360);
      return null;
    }
  }
  async downloadAsync(v2361) {
    if (!this.identity.updatesEnabled) {
      throw new Error("此构建渠道不启用应用更新。");
    }
    if (this.pendingVersion === null) {
      throw new Error("没有待应用的更新;请先调用 checkAsync。");
    }
    const v2362 = v2363 => v2361?.(Math.round(v2363.percent));
    electronUpdater.autoUpdater.on("download-progress", v2362);
    try {
      await electronUpdater.autoUpdater.downloadUpdate();
    } finally {
      electronUpdater.autoUpdater.removeListener("download-progress", v2362);
    }
  }
  applyAndRestart() {
    if (!this.identity.updatesEnabled) {
      throw new Error("此构建渠道不启用应用更新。");
    }
    if (this.pendingVersion === null) {
      throw new Error("没有待应用的更新。");
    }
    electronUpdater.autoUpdater.quitAndInstall();
  }
}
function readBuildIdentity(v2364) {
  let v2365 = "unknown";
  try {
    const v2366 = JSON.parse(node_fs.readFileSync(node_path.join(v2364.getAppPath(), "package.json"), "utf8"));
    if (v2366 && typeof v2366 === "object") {
      const v2367 = v2366.plccodeBuildChannel;
      if (v2367 === "stable" || v2367 === "demo" || v2367 === "demo2" || v2367 === "demo5" || v2367 === "development") {
        v2365 = v2367;
      }
    }
  } catch {}
  return Object.freeze({
    channel: v2365,
    updatesEnabled: false
  });
}
const DATA_NAMES = {
  stable: "PLC Code Electron",
  demo: "PLC Code DEMO",
  demo2: "PLC Code DEMO2",
  demo5: "PLC Code DEMO5",
  development: "PLC Code Development",
  unknown: "PLC Code Unclassified"
};
function configureBuildStorage(v2368, v2369) {
  if (v2369.channel === "stable") {
    return;
  }
  const v2370 = v2368.commandLine?.getSwitchValue("user-data-dir").trim();
  const v2371 = v2370 ? node_path.resolve(v2370) : node_path.join(v2368.getPath("appData"), DATA_NAMES[v2369.channel]);
  node_fs.mkdirSync(v2371, {
    recursive: true
  });
  v2368.setPath("userData", v2371);
}
function buildRuntimeHome(v2372, v2373, v2374) {
  const v2375 = v2374?.trim();
  if (v2375) {
    return node_path.resolve(v2375);
  } else {
    return node_path.join(v2373, DATA_NAMES[v2372.channel], "runtime");
  }
}
function configureContextPolicy(v2376, v2377 = process.env) {
  if ((v2376.channel === "stable" || v2376.channel === "demo2" || v2376.channel === "demo5") && !v2377.PLC_CODE_CONTEXT_POLICY?.trim()) {
    v2377.PLC_CODE_CONTEXT_POLICY = "focused-v1";
  }
}
function parseVersion(v2378) {
  const v2379 = (v2378 ?? "").trim().replace(/^[vV]+/, "").trim();
  if (v2379.length === 0) {
    return null;
  }
  const v2380 = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?$/.exec(v2379);
  if (!v2380) {
    return null;
  }
  const v2381 = Number(v2380[1]);
  const v2382 = v2380[2] !== undefined ? Number(v2380[2]) : 0;
  const v2383 = v2380[3] !== undefined ? Number(v2380[3]) : 0;
  if (!Number.isFinite(v2381) || !Number.isFinite(v2382) || !Number.isFinite(v2383)) {
    return null;
  }
  return {
    major: Math.max(v2381, 0),
    minor: Math.max(v2382, 0),
    patch: Math.max(v2383, 0)
  };
}
function compare(v2384, v2385) {
  if (v2384.major !== v2385.major) {
    return v2384.major - v2385.major;
  }
  if (v2384.minor !== v2385.minor) {
    return v2384.minor - v2385.minor;
  }
  return v2384.patch - v2385.patch;
}
function isNewer(v2386, v2387) {
  if (v2386 === null || v2387 === null) {
    return false;
  }
  return compare(v2387, v2386) > 0;
}
function isForced(v2388, v2389, v2390) {
  return v2389 || isNewer(v2388, parseVersion(v2390));
}
function escapeButtonExitsApp(v2391) {
  return v2391;
}
class UpdateController {
  constructor(v2392) {
    this.deps = v2392;
  }
  deps;
  lastAttemptFailed = false;
  pendingVersion = "";
  async check() {
    const v2393 = this.deps;
    if (!v2393.identity.updatesEnabled) {
      return;
    }
    try {
      await v2393.createService().checkAsync();
    } catch (v2394) {
      console.error("[main] update binary check failed:", v2394);
    }
    const v2395 = await v2393.checkPolicy();
    if (!v2395.ok) {
      return;
    }
    const v2396 = parseVersion(v2393.currentVersion());
    if (!isNewer(v2396, parseVersion(v2395.latestVersion))) {
      return;
    }
    const v2397 = isForced(v2396, v2395.forceUpdate, v2395.minVersion);
    if (!v2397 && v2393.readPostponed() === v2395.latestVersion) {
      return;
    }
    this.pendingVersion = v2395.latestVersion;
    this.lastAttemptFailed = false;
    v2393.pushOverlay({
      version: v2395.latestVersion,
      forced: v2397,
      notesUrl: v2395.releaseNotesUrl,
      currentVersion: v2393.currentVersion(),
      releaseNotes: v2393.releaseNotes(v2395.latestVersion)
    });
  }
  async updateNow() {
    const v2398 = this.deps;
    if (!v2398.identity.updatesEnabled) {
      return;
    }
    try {
      const v2399 = v2398.createService();
      await v2399.checkAsync();
      await v2399.downloadAsync(v2400 => v2398.progress({
        percent: v2400
      }));
      this.lastAttemptFailed = false;
      v2398.progress({
        status: "applying"
      });
      v2399.applyAndRestart();
    } catch (v2401) {
      this.lastAttemptFailed = true;
      v2398.progress({
        status: "failed",
        error: v2401 instanceof Error ? v2401.message : String(v2401)
      });
    }
  }
  later() {
    const v2402 = this.deps;
    if (!v2402.identity.updatesEnabled) {
      v2402.pushOverlay(null);
      return;
    }
    if (this.lastAttemptFailed && escapeButtonExitsApp(v2402.getOverlay()?.forced === true)) {
      v2402.quit();
      return;
    }
    if (this.pendingVersion.length > 0) {
      v2402.writePostponed(this.pendingVersion);
    }
    v2402.pushOverlay(null);
  }
}
function postponedPath(v2403) {
  return node_path.join(v2403, "update-postponed.txt");
}
function readPostponed(v2404) {
  try {
    const v2405 = postponedPath(v2404);
    if (!node_fs.existsSync(v2405)) {
      return "";
    }
    return node_fs.readFileSync(v2405, "utf-8").trim();
  } catch {
    return "";
  }
}
function writePostponed(v2406, v2407) {
  try {
    const v2408 = postponedPath(v2406);
    node_fs.mkdirSync(node_path.dirname(v2408), {
      recursive: true
    });
    node_fs.writeFileSync(v2408, v2407.trim() + "\n", "utf-8");
  } catch {}
}
function emptyAccountState() {
  return __byok.compatState();
}
function isPlausibleToken(v2409) {
  if (v2409.length === 0 || v2409.length > 4096) {
    return false;
  }
  return !/[\r\n\0]/.test(v2409);
}
class AccountStore {
  constructor() {
    this.state = __byok.compatState();
  }
  get current() {
    return __byok.compatState();
  }
  load() {
    return this.current;
  }
  setLoggedIn() {
    return this.current;
  }
  clear() {
    return this.current;
  }
  save() {}
  tryDelete() {}
}
function announcementUrl(v2410) {
  if (typeof v2410 !== "string" || v2410.length > 4096) {
    return "";
  }
  try {
    const v2411 = new URL(v2410.trim());
    if ((v2411.protocol === "https:" || v2411.protocol === "http:") && !v2411.username && !v2411.password) {
      return v2411.href;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}
function parseAnnouncementMedia(v2412) {
  if (!v2412 || typeof v2412 !== "object" || Array.isArray(v2412)) {
    return undefined;
  }
  const v2413 = v2412;
  if (v2413.type !== "image" && v2413.type !== "video" && v2413.type !== "animation") {
    return undefined;
  }
  const v2414 = announcementUrl(v2413.url);
  if (!v2414) {
    return undefined;
  }
  const v2415 = announcementUrl(v2413.posterUrl);
  return {
    type: v2413.type,
    url: v2414,
    alt: typeof v2413.alt === "string" ? v2413.alt.trim().slice(0, 500) : "",
    ...(v2415 ? {
      posterUrl: v2415
    } : {})
  };
}
const ANNOUNCEMENTS_DOC_PATH = "/updates/announcements.json";
const ANNOUNCEMENTS_DOC_SCHEMA = 1;
const LEVELS = ["info", "warn", "critical"];
const EMPTY_ANNOUNCEMENT_DOCUMENT = {
  schema: ANNOUNCEMENTS_DOC_SCHEMA,
  releaseNotes: {},
  announcements: []
};
function obj(v2416) {
  if (v2416 !== null && typeof v2416 === "object" && !Array.isArray(v2416)) {
    return v2416;
  } else {
    return null;
  }
}
function str(v2417) {
  if (typeof v2417 === "string") {
    return v2417.trim();
  } else {
    return "";
  }
}
function parseReleaseNotes(v2418) {
  const v2419 = {};
  const v2420 = obj(v2418);
  if (!v2420) {
    return v2419;
  }
  for (const [v2421, v2422] of Object.entries(v2420)) {
    const v2423 = v2421.trim();
    if (v2423.length === 0 || v2422 === null || v2422 === undefined) {
      continue;
    }
    let v2424;
    if (Array.isArray(v2422)) {
      v2424 = v2422.filter(v2425 => typeof v2425 === "string").map(v2426 => v2426.trim());
    } else if (typeof v2422 === "string") {
      v2424 = v2422.split(/\r?\n/).map(v2427 => v2427.trim());
    } else {
      continue;
    }
    v2424 = v2424.filter(v2428 => v2428.length > 0);
    if (v2424.length > 0) {
      v2419[v2423] = v2424;
    }
  }
  return v2419;
}
function parseEntry(v2429) {
  const v2430 = obj(v2429);
  if (!v2430) {
    return null;
  }
  const v2431 = str(v2430.id);
  if (v2431.length === 0) {
    return null;
  }
  const v2432 = str(v2430.level).toLowerCase();
  const v2433 = LEVELS.includes(v2432) ? v2432 : "info";
  const v2434 = str(v2430.title);
  const v2435 = str(v2430.body);
  if (v2434.length === 0 && v2435.length === 0) {
    return null;
  }
  return {
    id: v2431,
    level: v2433,
    title: v2434,
    body: v2435,
    dismissible: v2430.dismissible === false ? false : true,
    minVersion: str(v2430.minVersion),
    maxVersion: str(v2430.maxVersion),
    startsAt: str(v2430.startsAt),
    endsAt: str(v2430.endsAt),
    actionUrl: announcementUrl(v2430.actionUrl),
    summary: str(v2430.summary).slice(0, 240),
    actionLabel: str(v2430.actionLabel).slice(0, 40),
    media: parseAnnouncementMedia(v2430.media)
  };
}
function parseAnnouncementDocument(v2436) {
  const v2437 = obj(v2436);
  if (!v2437) {
    return {
      ...EMPTY_ANNOUNCEMENT_DOCUMENT,
      releaseNotes: {},
      announcements: []
    };
  }
  const v2438 = typeof v2437.schema === "number" && Number.isFinite(v2437.schema) ? v2437.schema : ANNOUNCEMENTS_DOC_SCHEMA;
  const v2439 = [];
  const v2440 = new Set();
  for (const v2441 of Array.isArray(v2437.announcements) ? v2437.announcements : []) {
    const v2442 = parseEntry(v2441);
    if (!v2442) {
      continue;
    }
    if (v2440.has(v2442.id)) {
      continue;
    }
    v2440.add(v2442.id);
    v2439.push(v2442);
  }
  return {
    schema: v2438,
    releaseNotes: parseReleaseNotes(v2437.releaseNotes),
    announcements: v2439
  };
}
function parseInstant(v2443, v2444) {
  const v2445 = v2443.trim();
  if (v2445.length === 0) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(v2445)) {
    const [v2446, v2447, v2448] = v2445.split("-").map(Number);
    const v2449 = new Date(v2446, v2447 - 1, v2448, 0, 0, 0, 0).getTime();
    if (v2444 === "end") {
      return v2449 + 86400000;
    } else {
      return v2449;
    }
  }
  const v2450 = Date.parse(v2445);
  if (Number.isFinite(v2450)) {
    return v2450;
  } else {
    return null;
  }
}
function matchesVersionRange(v2451, v2452, v2453) {
  const v2454 = parseComparableVersion(v2451);
  if (v2454 === null) {
    return true;
  }
  const v2455 = parseComparableVersion(v2452);
  if (v2455 !== null && compareVersions(v2454, v2455) < 0) {
    return false;
  }
  const v2456 = parseComparableVersion(v2453);
  if (v2456 !== null && compareVersions(v2454, v2456) > 0) {
    return false;
  }
  return true;
}
function parseComparableVersion(v2457) {
  const v2458 = (v2457 ?? "").trim().replace(/^[vV]+/, "");
  if (v2458.length === 0) {
    return null;
  }
  const v2459 = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/.exec(v2458);
  if (!v2459) {
    return null;
  }
  return [Number(v2459[1]), Number(v2459[2] ?? 0), Number(v2459[3] ?? 0), Number(v2459[4] ?? 0)];
}
function compareVersions(v2460, v2461) {
  for (let v2462 = 0; v2462 < 4; v2462 += 1) {
    if (v2460[v2462] !== v2461[v2462]) {
      return v2460[v2462] - v2461[v2462];
    }
  }
  return 0;
}
function matchesTimeWindow(v2463, v2464) {
  const v2465 = parseInstant(v2463.startsAt, "start");
  if (v2465 !== null && v2464 < v2465) {
    return false;
  }
  const v2466 = parseInstant(v2463.endsAt, "end");
  if (v2466 !== null && v2464 >= v2466) {
    return false;
  }
  return true;
}
function visibleAnnouncements(v2467, v2468) {
  const v2469 = [];
  for (const v2470 of v2467.announcements) {
    if (v2468.dismissedIds.has(v2470.id)) {
      continue;
    }
    if (!matchesVersionRange(v2468.clientVersion, v2470.minVersion, v2470.maxVersion)) {
      continue;
    }
    if (!matchesTimeWindow(v2470, v2468.nowMs)) {
      continue;
    }
    v2469.push({
      id: v2470.id,
      level: v2470.level,
      title: v2470.title,
      body: v2470.body,
      dismissible: v2470.dismissible,
      actionUrl: v2470.actionUrl,
      summary: v2470.summary,
      actionLabel: v2470.actionLabel,
      media: v2470.media
    });
  }
  return v2469;
}
const ANNOUNCEMENTS_TIMEOUT_MS = 8000;
const ANNOUNCEMENTS_SOURCE_ENV = "PLC_CODE_ANNOUNCEMENT_SOURCE";
function resolveAnnouncementsSource(v2471, v2472) {
  const v2473 = (v2472 ?? "").trim();
  if (v2473.length > 0) {
    if (/^https?:\/\//i.test(v2473)) {
      return {
        kind: "url",
        target: v2473,
        display: v2473,
        fromOverride: true
      };
    }
    if (/^file:\/\//i.test(v2473)) {
      try {
        const v2474 = node_url.fileURLToPath(v2473);
        return {
          kind: "file",
          target: v2474,
          display: v2474,
          fromOverride: true
        };
      } catch {
        return {
          kind: "file",
          target: v2473,
          display: v2473,
          fromOverride: true
        };
      }
    }
    return {
      kind: "file",
      target: node_path.isAbsolute(v2473) ? v2473 : v2473,
      display: v2473,
      fromOverride: true
    };
  }
  const v2475 = normalizeServerUrl(v2471);
  const v2476 = "" + v2475 + ANNOUNCEMENTS_DOC_PATH;
  return {
    kind: "url",
    target: v2476,
    display: v2476,
    fromOverride: false
  };
}
async function fetchWithTimeout(v2477, v2478) {
  const v2479 = new AbortController();
  const v2480 = setTimeout(() => v2479.abort(), v2478);
  try {
    return await fetch(v2477, {
      signal: v2479.signal
    });
  } finally {
    clearTimeout(v2480);
  }
}
async function fetchAnnouncementsAsync(v2481, v2482 = ANNOUNCEMENTS_TIMEOUT_MS) {
  const v2483 = v2484 => ({
    ok: false,
    error: v2484,
    doc: null,
    bytes: 0
  });
  // 离线构建：默认不请求任何远端公告源；仅在显式设置 PLC_CODE_ANNOUNCEMENT_SOURCE 时才联网。
  if (!(process.env[ANNOUNCEMENTS_SOURCE_ENV] ?? "").trim()) {
    return v2483("announcements disabled (offline build)");
  }
  let v2485;
  try {
    if (v2481.kind === "file") {
      if (!node_fs.existsSync(v2481.target)) {
        return v2483("公告文件不存在：" + v2481.target);
      }
      v2485 = node_fs.readFileSync(v2481.target, "utf-8");
    } else {
      const v2486 = await fetchWithTimeout(v2481.target, v2482);
      if (!v2486.ok) {
        return v2483("服务器返回状态码 " + v2486.status);
      }
      v2485 = await v2486.text();
    }
  } catch (v2487) {
    const v2488 = v2487;
    if (v2488?.name === "AbortError") {
      return v2483("拉取公告超时");
    }
    if (v2488?.name === "TypeError") {
      return v2483("无法连接服务器");
    }
    return v2483(v2488?.message ?? String(v2487));
  }
  let v2489;
  try {
    v2489 = JSON.parse(stripJsonBom(v2485));
  } catch {
    return {
      ok: false,
      error: "公告文档不是合法 JSON",
      doc: null,
      bytes: v2485.length
    };
  }
  return {
    ok: true,
    error: "",
    doc: parseAnnouncementDocument(v2489),
    bytes: v2485.length
  };
}
function stripJsonBom(v2490) {
  if (v2490.charCodeAt(0) === 65279) {
    return v2490.slice(1);
  } else {
    return v2490;
  }
}
function cachePath(v2491) {
  return node_path.join(v2491, "announcements-cache.json");
}
function dismissedPath(v2492) {
  return node_path.join(v2492, "announcements-dismissed.json");
}
function readCachedAnnouncementDocument(v2493) {
  try {
    const v2494 = cachePath(v2493);
    if (!node_fs.existsSync(v2494)) {
      return null;
    }
    const v2495 = JSON.parse(stripJsonBom(node_fs.readFileSync(v2494, "utf-8")));
    const v2496 = parseAnnouncementDocument(v2495);
    if (v2496.announcements.length > 0 || Object.keys(v2496.releaseNotes).length > 0) {
      return v2496;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function writeCachedAnnouncementDocument(v2497, v2498) {
  try {
    const v2499 = v2498.announcements.length === 0 && Object.keys(v2498.releaseNotes).length === 0;
    if (v2499) {
      return;
    }
    const v2500 = cachePath(v2497);
    node_fs.mkdirSync(node_path.dirname(v2500), {
      recursive: true
    });
    node_fs.writeFileSync(v2500, JSON.stringify(v2498), "utf-8");
  } catch {}
}
function readDismissedAnnouncementIds(v2501) {
  try {
    const v2502 = dismissedPath(v2501);
    if (!node_fs.existsSync(v2502)) {
      return [];
    }
    const v2503 = JSON.parse(stripJsonBom(node_fs.readFileSync(v2502, "utf-8")));
    if (!Array.isArray(v2503?.dismissedIds)) {
      return [];
    }
    return v2503.dismissedIds.filter(v2504 => typeof v2504 === "string" && v2504.trim().length > 0);
  } catch {
    return [];
  }
}
function dismissAnnouncementId(v2505, v2506) {
  const v2507 = (v2506 ?? "").trim();
  const v2508 = readDismissedAnnouncementIds(v2505);
  if (v2507.length === 0 || v2508.includes(v2507)) {
    return v2508;
  }
  const v2509 = [...v2508, v2507];
  try {
    const v2510 = dismissedPath(v2505);
    node_fs.mkdirSync(node_path.dirname(v2510), {
      recursive: true
    });
    const v2511 = {
      schema: 1,
      dismissedIds: v2509
    };
    node_fs.writeFileSync(v2510, JSON.stringify(v2511), "utf-8");
  } catch {}
  return v2509;
}
const SUPPORTED_LANGUAGES = ["zh", "en"];
const DEFAULT_LANGUAGE = "zh";
function isSupportedLanguage(v2512) {
  return SUPPORTED_LANGUAGES.some(v2513 => v2513 === v2512);
}
function normalizeLanguage(v2514) {
  const v2515 = typeof v2514 === "string" ? v2514.trim().toLowerCase() : "";
  if (isSupportedLanguage(v2515)) {
    return v2515;
  } else {
    return DEFAULT_LANGUAGE;
  }
}
function defaultSettings() {
  return {
    selectedModelKey: "",
    reasoningEffort: "auto",
    permissionMode: "workspace-write",
    visionModelKey: "auto",
    language: "zh",
    lastProjectLocation: "",
    autoCompactThreshold: DEFAULT_AUTO_COMPACT_THRESHOLD,
    lastSeenFeedbackReplyAt: "",
    theme: "system"
  };
}
const DEFAULT_AUTO_COMPACT_THRESHOLD = 236000;
const MIN_AUTO_COMPACT_THRESHOLD = 100000;
const MAX_AUTO_COMPACT_THRESHOLD = 2000000;
function safeAutoCompactThreshold(v2516) {
  const v2517 = typeof v2516 === "number" ? v2516 : Number(v2516);
  if (!Number.isFinite(v2517)) {
    return DEFAULT_AUTO_COMPACT_THRESHOLD;
  }
  return Math.min(MAX_AUTO_COMPACT_THRESHOLD, Math.max(MIN_AUTO_COMPACT_THRESHOLD, Math.round(v2517)));
}
function migratedAutoCompactThresholdFromDisk(v2518, v2519) {
  const v2520 = typeof v2518 === "number" ? v2518 : Number(v2518);
  if (!v2519 && v2520 === 1000000) {
    return DEFAULT_AUTO_COMPACT_THRESHOLD;
  }
  return safeAutoCompactThreshold(v2518);
} // Only accept effort values supported by the original compiled engine.
function safeReasoningEffort(input) {
  const value = String(input ?? "").trim().toLowerCase();
  if (["auto", "off", "low", "medium", "high", "xhigh", "max"].includes(value)) {
    return value;
  } else {
    return "auto";
  }
}
function safePermission(v2521) {
  const v2522 = (v2521 ?? "").trim();
  if (["read-only", "workspace-write", "danger-full-access"].includes(v2522)) {
    return v2522;
  } else {
    return "workspace-write";
  }
}
function safeModelKey(v2523) {
  const v2524 = (v2523 ?? "").trim();
  if (isPlausibleModelKey(v2524)) {
    return v2524;
  } else {
    return "";
  }
}
function safeVisionModelKey(v2525) {
  const v2526 = (v2525 ?? "").trim();
  if (v2526.length === 0 || v2526 === "auto") {
    return "auto";
  }
  if (v2526 === "off") {
    return "off";
  }
  if (isPlausibleModelKey(v2526)) {
    return v2526;
  } else {
    return "auto";
  }
}
function safeTheme(v2527) {
  const v2528 = (v2527 ?? "").trim().toLowerCase();
  if (v2528 === "dark" || v2528 === "light" || v2528 === "system") {
    return v2528;
  } else {
    return "system";
  }
}
class SettingsStore {
  state = defaultSettings();
  path;
  constructor(v2529) {
    this.path = node_path.join(v2529, "settings.json");
  }
  get current() {
    return this.state;
  }
  load() {
    this.state = defaultSettings();
    try {
      if (!node_fs.existsSync(this.path)) {
        return this.state;
      }
      const v2530 = JSON.parse(node_fs.readFileSync(this.path, "utf-8"));
      this.state = {
        selectedModelKey: safeModelKey(v2530.selectedModelKey ?? ""),
        reasoningEffort: safeReasoningEffort(v2530.reasoningEffort ?? "auto"),
        permissionMode: safePermission(v2530.permissionMode ?? "workspace-write"),
        visionModelKey: safeVisionModelKey(v2530.visionModelKey ?? "auto"),
        language: normalizeLanguage(v2530.language ?? "zh"),
        lastProjectLocation: typeof v2530.lastProjectLocation === "string" ? v2530.lastProjectLocation : "",
        autoCompactThreshold: migratedAutoCompactThresholdFromDisk(v2530.autoCompactThreshold, v2530.autoCompactThresholdCustomized),
        autoCompactThresholdCustomized: v2530.autoCompactThresholdCustomized === true,
        lastSeenFeedbackReplyAt: typeof v2530.lastSeenFeedbackReplyAt === "string" ? v2530.lastSeenFeedbackReplyAt : "",
        theme: safeTheme(v2530.theme ?? "system")
      };
    } catch {
      this.state = defaultSettings();
    }
    return this.state;
  }
  set(v2531) {
    this.state = {
      selectedModelKey: v2531.selectedModelKey !== undefined ? safeModelKey(v2531.selectedModelKey) : this.state.selectedModelKey,
      reasoningEffort: v2531.reasoningEffort !== undefined ? safeReasoningEffort(v2531.reasoningEffort) : this.state.reasoningEffort,
      permissionMode: v2531.permissionMode !== undefined ? safePermission(v2531.permissionMode) : this.state.permissionMode,
      visionModelKey: v2531.visionModelKey !== undefined ? safeVisionModelKey(v2531.visionModelKey) : this.state.visionModelKey,
      language: v2531.language !== undefined ? normalizeLanguage(v2531.language) : this.state.language,
      lastProjectLocation: v2531.lastProjectLocation !== undefined ? v2531.lastProjectLocation : this.state.lastProjectLocation,
      autoCompactThreshold: v2531.autoCompactThreshold !== undefined ? safeAutoCompactThreshold(v2531.autoCompactThreshold) : this.state.autoCompactThreshold,
      autoCompactThresholdCustomized: v2531.autoCompactThreshold !== undefined ? true : this.state.autoCompactThresholdCustomized,
      lastSeenFeedbackReplyAt: v2531.lastSeenFeedbackReplyAt !== undefined ? v2531.lastSeenFeedbackReplyAt : this.state.lastSeenFeedbackReplyAt,
      theme: v2531.theme !== undefined ? safeTheme(v2531.theme) : this.state.theme
    };
    this.save();
    return this.state;
  }
  save() {
    node_fs.mkdirSync(node_path.dirname(this.path), {
      recursive: true
    });
    const v2532 = this.path + ".tmp-" + process.pid;
    node_fs.writeFileSync(v2532, JSON.stringify(this.state, null, 2) + "\n", "utf-8");
    node_fs.renameSync(v2532, this.path);
  }
}
const DEFAULT_WINDOW_STATE = {
  x: -1,
  y: -1,
  width: 1280,
  height: 860,
  isMaximized: false
};
const MIN_WIDTH = 640;
const MIN_HEIGHT = 480;
function statePath(v2533) {
  return node_path.join(v2533, "window-state.json");
}
function loadWindowState(v2534) {
  try {
    const v2535 = statePath(v2534);
    if (!node_fs.existsSync(v2535)) {
      return DEFAULT_WINDOW_STATE;
    }
    const v2536 = JSON.parse(node_fs.readFileSync(v2535, "utf-8"));
    const v2537 = Number(v2536.x);
    const v2538 = Number(v2536.y);
    const v2539 = Number(v2536.width);
    const v2540 = Number(v2536.height);
    if (!Number.isFinite(v2537) || !Number.isFinite(v2538) || !Number.isFinite(v2539) || !Number.isFinite(v2540)) {
      return DEFAULT_WINDOW_STATE;
    }
    return {
      x: v2537,
      y: v2538,
      width: Math.max(MIN_WIDTH, v2539),
      height: Math.max(MIN_HEIGHT, v2540),
      isMaximized: v2536.isMaximized === true
    };
  } catch {
    return DEFAULT_WINDOW_STATE;
  }
}
function saveWindowState(v2541, v2542) {
  try {
    const v2543 = statePath(v2541);
    node_fs.mkdirSync(node_path.dirname(v2543), {
      recursive: true
    });
    const v2544 = v2543 + ".tmp-" + process.pid;
    node_fs.writeFileSync(v2544, JSON.stringify(v2542, null, 2) + "\n", "utf-8");
    node_fs.renameSync(v2544, v2543);
  } catch (v2545) {
    console.error("[main] failed to save window state:", v2545);
  }
}
function intersectsAnyDisplay(v2546, v2547) {
  const v2548 = 80;
  for (const v2549 of v2547) {
    const v2550 = v2549.workArea;
    const v2551 = Math.min(v2546.x + v2546.width, v2550.x + v2550.width) - Math.max(v2546.x, v2550.x);
    const v2552 = Math.min(v2546.y + v2546.height, v2550.y + v2550.height) - Math.max(v2546.y, v2550.y);
    if (v2551 >= v2548 && v2552 >= v2548) {
      return true;
    }
  }
  return false;
}
function centerOnPrimary(v2553, v2554, v2555) {
  const v2556 = v2555.workArea;
  const v2557 = Math.min(v2553, v2556.width);
  const v2558 = Math.min(v2554, v2556.height);
  return {
    x: Math.round(v2556.x + (v2556.width - v2557) / 2),
    y: Math.round(v2556.y + (v2556.height - v2558) / 2)
  };
}
function resolveWindowState(v2559, v2560, v2561) {
  const v2562 = loadWindowState(v2559);
  const v2563 = v2562.x >= 0 && v2562.y >= 0;
  if (v2563 && intersectsAnyDisplay(v2562, v2560)) {
    return v2562;
  }
  const v2564 = centerOnPrimary(v2562.width, v2562.height, v2561);
  return {
    ...v2562,
    x: v2564.x,
    y: v2564.y
  };
}
const HOTSWAP_ID_TAG = "hotswap";
function isControlId(v2565) {
  return v2565.length > 0 && v2565.includes(HOTSWAP_ID_TAG);
}
function modelSlash(v2566) {
  return "/model " + (v2566 ?? "").trim();
}
function effortSlash(v2567) {
  const v2568 = (v2567 ?? "").trim();
  return "/effort " + (v2568.length === 0 ? "auto" : v2568);
}
function permissionSlash(v2569) {
  return "/permissions " + (v2569 ?? "").trim();
}
function shouldDropAfterResult(v2570, v2571) {
  return !v2570 || v2571 === "error";
}
function isWindowSizeFixture(v2572) {
  return v2572.kind === "window_size";
}
const isDev = !electron.app.isPackaged;
const buildIdentity = readBuildIdentity(electron.app);
let viewerService;
const viewerSessionRoots = new Map();
configureBuildStorage(electron.app, buildIdentity);
configureContextPolicy(buildIdentity);
installProcessCrashGuard(runtimeHome());
function tiaToolContext() {
  const v2573 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
  const v2574 = locateExecuteTool(v2573, packagedLocation());
  if (!v2574) {
    return null;
  }
  return {
    executeToolPath: v2574,
    cwd: node_path.dirname(v2574)
  };
}
function resolvedBridgeExePath() {
  const v2575 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
  return locateEngine(v2575, packagedLocation()).bridgeExePath;
}
const tiaHostMismatchRefreshInFlight = new Set();
let tiaTrustProbeInFlight = false;
let tiaTrustProbeCompleted = false;
let inoproshopStartupProbeStarted = false;
function offerBridgeTrustIfNeeded(v2576, v2577) {
  const v2578 = tiaToolContext();
  if (!v2578) {
    return;
  }
  if (!inoproshopStartupProbeStarted) {
    inoproshopStartupProbeStarted = true;
    inoproshopStatusAsync(v2578).catch(v2579 => console.error("[main] startup InoProShop status probe failed:", v2579));
  }
  const v2580 = () => [...boundWorkspaces.values()].some(v2581 => usesTiaOpenness(v2581.project));
  if (v2577 || !accountStore?.current.isLoggedIn || !v2580() || tiaTrustProbeInFlight || tiaTrustProbeCompleted) {
    return;
  }
  tiaTrustProbeInFlight = true;
  tiaStatusAsync(v2578).then(v2582 => {
    if (v2576.isDestroyed() || !accountStore?.current.isLoggedIn || !v2580()) {
      return;
    }
    tiaTrustProbeCompleted = true;
    const v2583 = tryOfferBridgeTrust(runtimeHome(), v2582, {
      blockingGateOpen: false,
      guideRunning: false
    });
    if (v2583) {
      sendToRenderer(v2576, Channels.Tia.TrustInviteShow, v2583);
    }
  }).catch(v2584 => console.error("[main] startup TIA trust-offer probe failed:", v2584)).finally(() => {
    tiaTrustProbeInFlight = false;
  });
}
function packagedLocation() {
  if (electron.app.isPackaged) {
    return {
      resourcesPath: process.resourcesPath
    };
  } else {
    return undefined;
  }
}
function resolveClaudeConfigDir(v2585) {
  if (electron.app.isPackaged) {
    return node_path.join(process.resourcesPath, ".plccode");
  }
  if (v2585) {
    const v2586 = node_path.join(v2585, ".plccode");
    if (node_fs.existsSync(v2586)) {
      return v2586;
    }
  }
  return undefined;
}
let computerUseIndicator = null;
const bridges = new Map();
const sessionResumeIds = new Map();
const sessionPartitionRoots = new Map();
const boundWorkspaces = new Map();
function isBoundWorkspaceRoot(v2587) {
  if (!v2587 || v2587.trim().length === 0) {
    return false;
  }
  let v2588;
  try {
    v2588 = node_fs.realpathSync(v2587);
  } catch {
    return false;
  }
  for (const v2589 of boundWorkspaces.values()) {
    try {
      if (node_fs.realpathSync(v2589.root) === v2588) {
        return true;
      }
    } catch {}
  }
  return false;
}
let accountStore = null;
const engineSupportReports = new EngineSupportReports(() => accountStore?.current ?? null, () => ({
  appVersion: electron.app.getVersion(),
  channel: buildIdentity.channel,
  packaged: electron.app.isPackaged
}));
let settingsStore = null;
let sessionMetaStore = null;
let turnPresentation = null;
let workbenchStore = null;
const bridgeWorkbenchRevisions = new Map();
const pendingSessionTitles = new Map();
let modelSlotsCache = [];
const bridgeAccountKeys = new Map();
const pendingRestartConfirms = new Map();
const pendingCloseConfirms = new Map();
let closeApproved = false;
let currentUpdateOverlay = null;
function pushUpdateOverlay(v2590, v2591) {
  currentUpdateOverlay = v2591;
  sendToRenderer(v2590, Channels.Update.Overlay, v2591);
}
function releaseNotesForVersion(v2592) {
  const v2593 = (v2592 ?? "").trim();
  const v2594 = announcementDocument?.releaseNotes[v2593];
  if (v2594 && v2594.length > 0) {
    return v2594;
  }
  return DEFAULT_RELEASE_NOTES[v2593] ?? [];
}
let currentAnnouncements = {
  announcements: []
};
let announcementDocument = null;
let dismissedAnnouncementIds = [];
function pushAnnouncements(v2595) {
  const v2596 = announcementDocument;
  const v2597 = v2596 ? visibleAnnouncements(v2596, {
    clientVersion: electron.app.getVersion(),
    dismissedIds: new Set(dismissedAnnouncementIds),
    nowMs: Date.now()
  }) : [];
  currentAnnouncements = {
    announcements: v2597
  };
  sendToRenderer(v2595, Channels.Announcements.Board, currentAnnouncements);
}
function refreshUpdateOverlayReleaseNotes(v2598) {
  const v2599 = currentUpdateOverlay;
  if (!v2599) {
    return;
  }
  const v2600 = releaseNotesForVersion(v2599.version);
  if (v2600.length === v2599.releaseNotes.length && v2600.every((v2601, v2602) => v2601 === v2599.releaseNotes[v2602])) {
    return;
  }
  pushUpdateOverlay(v2598, {
    ...v2599,
    releaseNotes: v2600
  });
}
function accountKeyOf(v2603) {
  const v2604 = v2603.token.trim();
  if (v2604.length > 0) {
    return normalizeServerUrl(v2603.serverUrl) + "#" + v2604;
  } else {
    return "no-account";
  }
}
function modelRosterKey() {
  if (modelSlotsCache.length === 0) {
    return "no-roster";
  }
  const v2605 = modelSlotsCache.map(v2606 => [v2606.key, v2606.label, v2606.enabled ? "1" : "0", v2606.vision === undefined ? "?" : v2606.vision ? "1" : "0", v2606.supportsReasoningEffort === undefined ? "?" : v2606.supportsReasoningEffort ? "1" : "0", JSON.stringify(v2606.reasoningEfforts ?? null), v2606.thinkingKind ?? "", (v2606.thinkingFields ?? []).join("|")].join("|")).sort();
  return node_crypto.createHash("sha1").update(v2605.join("\n")).digest("hex").slice(0, 12);
}
function setModelSlots(v2607) {
  const v2608 = modelRosterKey();
  modelSlotsCache = v2607;
  let v2609 = false;
  if (settingsStore && v2607.length > 0) {
    const v2610 = settingsStore.current.selectedModelKey.trim();
    if (!v2607.some(v2611 => v2611.key === v2610)) {
      const v2612 = v2607.find(v2613 => v2613.enabled)?.key || v2607[0].key;
      const v2614 = settingsStore.set({
        selectedModelKey: v2612
      });
      v2609 = true;
      const v2615 = electron.BrowserWindow.getAllWindows();
      const v2616 = v2615[0];
      if (v2616 && !v2616.isDestroyed()) {
        sendToRenderer(v2616, Channels.SettingsChanged, v2614);
      }
    }
  }
  if (v2608 === modelRosterKey() && !v2609) {
    return;
  }
  for (const [v2617, v2618] of [...bridges]) {
    if (!v2618.isAlive || !v2618.isIdle) {
      continue;
    }
    v2618.dispose();
    bridges.delete(v2617);
    bridgeAccountKeys.delete(v2617);
  }
  const v2619 = focusedSessionKey || lastOpenedSessionKey;
  const v2620 = electron.BrowserWindow.getAllWindows();
  const v2621 = v2620.length > 0 ? v2620[0] : null;
  const v2622 = bridges.get(v2619);
  if (v2619.length > 0 && v2621 && !v2621.isDestroyed() && (!v2622?.isAlive || v2622.isIdle)) {
    try {
      ensureBridge(v2621, v2619);
    } catch (v2623) {
      console.error("[main] respawn after model roster change failed: " + v2623.message);
    }
  }
}
function sanitizedAccountState() {
  const {
    token,
    serverUrl,
    ...state
  } = __byok.compatState();
  return state;
}
function modelSlotsForWire() {
  if (modelSlotsCache.length > 0) {
    return modelSlotsCache.map(v2624 => ({
      key: v2624.key,
      vision: v2624.vision,
      enabled: v2624.enabled
    }));
  }
  return OFFLINE_MODEL_KEYS.map(v2625 => ({
    key: v2625,
    vision: OFFLINE_VISION_FALLBACK[v2625],
    enabled: true
  }));
}
function thinkingEnvsForWire() {
  if (modelSlotsCache.length === 0) {
    return {
      tiers: "",
      kinds: "",
      fields: ""
    };
  }
  const v2626 = modelSlotsCache.filter(v2627 => v2627.enabled).filter(v2628 => v2628.supportsReasoningEffort !== false).map(v2629 => ({
    key: v2629.key,
    reasoningEfforts: v2629.reasoningEfforts,
    thinkingKind: v2629.thinkingKind,
    thinkingFields: v2629.thinkingFields
  }));
  return {
    tiers: formatThinkingTiersEnv(v2626),
    kinds: formatThinkingKindsEnv(v2626),
    fields: formatThinkingFieldsEnv(v2626)
  };
}
function normRoot(v2630) {
  return v2630.trim().replace(/[/\\]+$/, "").toLowerCase();
}
function anyOtherLiveSessionOnRoot(v2631, v2632) {
  const v2633 = normRoot(v2632);
  for (const [v2634, v2635] of boundWorkspaces) {
    if (v2634 === v2631) {
      continue;
    }
    if (normRoot(v2635.root) !== v2633) {
      continue;
    }
    const v2636 = bridges.get(v2634);
    if (v2636 && v2636.isAlive && !v2636.isIdle) {
      return true;
    }
  }
  return false;
}
let questionWatcher = null;
let focusedSessionKey = "";
let lastOpenedSessionKey = "";
function runtimeHome() {
  const v2637 = process.env.LOCALAPPDATA || electron.app.getPath("userData");
  const v2638 = buildRuntimeHome(buildIdentity, v2637, process.env.PLC_CODE_RUNTIME_HOME);
  node_fs.mkdirSync(v2638, {
    recursive: true
  });
  return v2638;
}
function resolveAllowedSessionFile(v2639) {
  const v2640 = node_path.join(runtimeHome(), "sessions");
  try {
    return resolveWithinRoot(v2639, v2640);
  } catch (v2641) {
    console.error("[main] refused OpenSession filePath outside sessions dir: " + JSON.stringify(v2639) + " (" + v2641.message + ")");
    throw new Error("filePath is outside the allowed sessions directory");
  }
}
function draftsDirFor(v2642) {
  const v2643 = v2642.replace(/[^A-Za-z0-9_-]/g, "_");
  if (v2643.length === 0 || v2643 === "." || v2643 === "..") {
    throw new Error("invalid sessionKey for drafts dir: " + JSON.stringify(v2642));
  }
  return node_path.join(runtimeHome(), "drafts", v2643);
}
function listDraftFiles(v2644) {
  const v2645 = draftsDirFor(v2644);
  const v2646 = [];
  const v2647 = v2648 => {
    let v2649;
    try {
      v2649 = node_fs.readdirSync(v2648, {
        withFileTypes: true
      });
    } catch {
      return;
    }
    for (const v2650 of v2649) {
      const v2651 = node_path.join(v2648, v2650.name);
      if (v2650.isDirectory()) {
        v2647(v2651);
      } else if (v2650.isFile()) {
        v2646.push(node_path.relative(v2645, v2651).replace(/\\/g, "/"));
      }
    }
  };
  v2647(v2645);
  v2646.sort();
  return v2646;
}
function readRecordedWorkspaceRoot(v2652) {
  let v2653;
  try {
    v2653 = node_fs.readFileSync(v2652, "utf-8");
  } catch {
    return "";
  }
  const v2654 = v2653.indexOf("\n");
  const v2655 = v2654 >= 0 ? v2653.slice(0, v2654) : v2653;
  try {
    const v2656 = JSON.parse(v2655);
    if (v2656 && v2656.type === "session_meta" && typeof v2656.workspace_root === "string") {
      return v2656.workspace_root;
    }
  } catch {}
  return "";
}
const DRAFTS_BUDGET_BYTES = 209715200;
function purgeOldDraftsIfOverBudget() {
  const v2657 = node_path.join(runtimeHome(), "drafts");
  let v2658;
  try {
    v2658 = node_fs.readdirSync(v2657, {
      withFileTypes: true
    }).filter(v2659 => v2659.isDirectory());
  } catch {
    return;
  }
  const v2660 = v2661 => {
    let v2662 = 0;
    const v2663 = v2664 => {
      let v2665;
      try {
        v2665 = node_fs.readdirSync(v2664, {
          withFileTypes: true
        });
      } catch {
        return;
      }
      for (const v2666 of v2665) {
        const v2667 = node_path.join(v2664, v2666.name);
        if (v2666.isDirectory()) {
          v2663(v2667);
        } else if (v2666.isFile()) {
          try {
            v2662 += node_fs.statSync(v2667).size;
          } catch {}
        }
      }
    };
    v2663(v2661);
    return v2662;
  };
  const v2668 = v2658.map(v2669 => {
    const v2670 = node_path.join(v2657, v2669.name);
    let v2671 = 0;
    try {
      v2671 = node_fs.statSync(v2670).mtimeMs;
    } catch {}
    return {
      full: v2670,
      mtimeMs: v2671,
      size: v2660(v2670)
    };
  });
  let v2672 = v2668.reduce((v2673, v2674) => v2673 + v2674.size, 0);
  if (v2672 <= DRAFTS_BUDGET_BYTES) {
    return;
  }
  v2668.sort((v2675, v2676) => v2675.mtimeMs - v2676.mtimeMs);
  for (const v2677 of v2668) {
    if (v2672 <= DRAFTS_BUDGET_BYTES) {
      break;
    }
    try {
      const v2678 = removeTreeByHand(v2677.full);
      if (!v2678.ok) {
        console.warn("[main] could not purge drafts dir " + v2678.path + ": " + v2678.code + " (in use by a live session?)");
        continue;
      }
      v2672 -= v2677.size;
      console.warn("[main] purged old drafts dir over budget: " + v2677.full + " (" + v2677.size + " bytes)");
    } catch (v2679) {
      console.warn("[main] failed to purge drafts dir " + v2677.full + ": " + v2679.message);
    }
  }
}
function mainWindow() {
  if (process.platform === "win32") {
    computerUseIndicator ??= new ComputerUseIndicator(() => electron.BrowserWindow.getAllWindows());
  }
  const v2680 = resolveWindowState(runtimeHome(), electron.screen.getAllDisplays(), electron.screen.getPrimaryDisplay());
  const v2681 = settingsStore?.current.theme ?? "system";
  const v2682 = v2681 === "light" || v2681 === "system" && electron.nativeTheme.shouldUseDarkColors === false;
  const v2683 = v2682 ? "#eef7f3" : "#0f1110";
  const v2684 = new electron.BrowserWindow({
    x: v2680.x,
    y: v2680.y,
    width: v2680.width,
    height: v2680.height,
    backgroundColor: v2683,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: v2683,
      symbolColor: v2682 ? "#536157" : "#8b918d",
      height: 32
    },
    webPreferences: {
      preload: node_path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true
    }
  });
  if (v2680.isMaximized) {
    v2684.maximize();
  }
  v2684.once("closed", () => {
    computerUseIndicator?.dispose();
    computerUseIndicator = null;
  });
  let v2685 = 0;
  v2684.webContents.on("render-process-gone", (v2686, v2687) => {
    const v2688 = planRendererRecovery(v2687.reason, v2685);
    writeCrashReport(runtimeHome(), {
      kind: "renderer-process-gone",
      detail: {
        reason: v2687.reason,
        exitCode: v2687.exitCode,
        decision: v2688,
        url: v2684.webContents.getURL()
      }
    });
    console.error("[main] renderer process gone: " + v2687.reason + " (exitCode " + v2687.exitCode + "); " + v2688.note);
    if (!v2688.reload) {
      return;
    }
    v2685 += 1;
    if (!v2684.isDestroyed()) {
      v2684.webContents.reload();
    }
  });
  let v2689 = null;
  const v2690 = () => {
    if (v2684.isDestroyed()) {
      return;
    }
    const v2691 = v2684.isMaximized();
    const v2692 = v2684.getNormalBounds();
    const v2693 = {
      x: v2692.x,
      y: v2692.y,
      width: v2692.width,
      height: v2692.height,
      isMaximized: v2691
    };
    saveWindowState(runtimeHome(), v2693);
  };
  const v2694 = () => {
    if (v2689) {
      clearTimeout(v2689);
    }
    v2689 = setTimeout(v2690, 150);
  };
  v2684.on("resize", v2694);
  v2684.on("move", v2694);
  v2684.on("maximize", v2694);
  v2684.on("unmaximize", v2694);
  v2684.on("close", () => {
    if (v2689) {
      clearTimeout(v2689);
    }
    v2690();
  });
  v2684.webContents.on("will-navigate", (v2695, v2696) => {
    const v2697 = process.env.ELECTRON_RENDERER_URL;
    const v2698 = isDev && v2697 && v2696.startsWith(v2697);
    if (!v2698) {
      v2695.preventDefault();
    }
  });
  v2684.webContents.setWindowOpenHandler(() => ({
    action: "deny"
  }));
  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    v2684.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    v2684.loadFile(node_path.join(__dirname, "../renderer/index.html"));
  }
  return v2684;
}
function sendToRenderer(v2699, v2700, v2701) {
  if (v2699.isDestroyed()) {
    return;
  }
  if (v2700 === Channels.EngineStatus) {
    v2701 = engineSupportReports.observe(v2701);
  }
  v2699.webContents.send(v2700, v2701);
}
async function handleWindowCloseRequest(v2702) {
  if (v2702.isDestroyed()) {
    return;
  }
  const v2703 = Date.now() + "-" + Math.random().toString(36).slice(2);
  const v2704 = await new Promise(v2705 => {
    pendingCloseConfirms.set(v2703, v2705);
    sendToRenderer(v2702, Channels.Workspace.CloseConfirmRequest, {
      requestId: v2703
    });
  });
  if (!v2704) {
    return;
  }
  closeApproved = true;
  for (const v2706 of bridges.values()) {
    v2706.dispose();
  }
  questionWatcher?.stop();
  v2702.destroy();
}
function weinviewProgressReporter(v2707, v2708) {
  let v2709 = null;
  const v2710 = v2711 => {
    sendToRenderer(v2707, Channels.BridgeMessage, {
      sessionKey: v2708,
      message: {
        type: "event",
        id: v2711.request_id,
        event: "weinview_progress",
        index: 0,
        payload: v2711
      }
    });
  };
  return {
    report(v2712) {
      v2709 = v2712;
      if (v2712.status === "running") {
        v2710(v2712);
      }
    },
    finish(v2713) {
      if (!v2709) {
        return;
      }
      v2710({
        ...v2709,
        status: v2713 ? "completed" : "failed",
        label: v2713 ? "工程已就绪" : "原厂工程操作未完成",
        detail: v2713 ? undefined : "停在：" + v2709.label
      });
    }
  };
}
function applyToolResultSideEffects(v2714, v2715, v2716) {
  const v2717 = v2716;
  if (v2717.type !== "event" || v2717.event !== "tool_result") {
    return;
  }
  const v2718 = v2717.payload;
  const v2719 = String(v2718?.name ?? v2718?.tool_name ?? "");
  const v2720 = typeof v2718?.output === "string" ? v2718.output : JSON.stringify(v2718?.output ?? "");
  if (v2719.startsWith("tia") && isHostVersionMismatch(v2720) && !tiaHostMismatchRefreshInFlight.has(v2715)) {
    tiaHostMismatchRefreshInFlight.add(v2715);
    const v2721 = tiaToolContext();
    if (v2721) {
      tiaStatusAsync(v2721).then(v2722 => sendToRenderer(v2714, Channels.Tia.StatusPushed, v2722)).finally(() => tiaHostMismatchRefreshInFlight.delete(v2715));
    } else {
      tiaHostMismatchRefreshInFlight.delete(v2715);
    }
  }
  const v2723 = boundWorkspaces.get(v2715);
  if (v2723) {
    const v2724 = applyArtifactToolResult(v2723.root, v2723.stagingRoot, v2719, v2720, v2718?.is_error === true, sessionResumeIds.get(v2715) ?? v2715);
    if (v2724) {
      sendToRenderer(v2714, Channels.Artifact.StateChanged, {
        sessionKey: v2715,
        vm: v2724
      });
    }
  }
}
function ensureBridge(v2725, v2726, v2727, v2728) {
  v2727 = v2727 ?? sessionResumeIds.get(v2726);
  v2728 = v2728 ?? sessionPartitionRoots.get(v2726);
  if (v2728) {
    sessionPartitionRoots.set(v2726, v2728);
  }
  const v2729 = boundWorkspaces.get(v2726);
  if (usesTiaOpenness(v2729?.project)) {
    offerBridgeTrustIfNeeded(v2725, false);
  }
  const v2730 = v2729 ? v2729.stagingRoot : draftsDirFor(v2726);
  if (!v2729) {
    node_fs.mkdirSync(v2730, {
      recursive: true
    });
  }
  if (!v2729 && v2728) {
    try {
      node_fs.mkdirSync(v2728, {
        recursive: true
      });
    } catch {}
  }
  const v2731 = accountKeyOf(accountStore?.current ?? {
    serverUrl: "",
    token: ""
  }) + "#" + modelRosterKey();
  const v2732 = bridges.get(v2726);
  if (v2732 && v2732.isAlive) {
    const v2733 = !v2727 || v2732.sessionId === v2727;
    if (!v2733 && !v2732.isIdle) {
      throw new Error("当前会话仍在运行，无法切换为另一条历史会话。请等待本轮完成后重试。");
    }
    if (v2733 && v2732.cwd === v2730 && bridgeAccountKeys.get(v2726) === v2731 && (bridgeWorkbenchRevisions.get(v2726) === (workbenchStore?.current.revision ?? 0) || !v2732.isIdle)) {
      return v2732;
    }
    v2732.dispose();
    bridges.delete(v2726);
    bridgeAccountKeys.delete(v2726);
  }
  if (v2727) {
    sessionResumeIds.set(v2726, v2727);
  }
  const v2734 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
  const v2735 = (v2736, v2737, v2738) => {
    sendToRenderer(v2725, Channels.EngineStatus, {
      sessionKey: v2726,
      status: v2736,
      detail: v2737,
      diagnostic: v2738
    });
  };
  let v2739;
  try {
    v2739 = locateEngine(v2734, packagedLocation());
  } catch (v2740) {
    const v2741 = createEngineFailureRecorder({
      runtimeHome: runtimeHome(),
      enginePath: "",
      cwd: v2730,
      appVersion: electron.app.getVersion()
    }).failure({
      phase: "startup",
      error: Object.assign(new Error(String(v2740)), {
        code: "ENGINE_NOT_FOUND"
      })
    });
    v2735("crashed", v2741.errorMessage, v2741);
    throw v2740;
  }
  const v2742 = v2730;
  const v2743 = resolveClaudeConfigDir(v2739.repoRoot);
  computerUseIndicator?.activity.clear(v2726);
  const v2744 = new EngineBridge(v2726);
  bridges.set(v2726, v2744);
  bridgeWorkbenchRevisions.set(v2726, workbenchStore?.current.revision ?? 0);
  lastOpenedSessionKey = v2726;
  v2744.on("stdout", v2745 => {
    if (bridges.get(v2726) !== v2744) {
      return;
    }
    const v2746 = v2745;
    if (v2746.type === "turn" && isControlId(v2746.id ?? "")) {
      const v2747 = v2746.result && typeof v2746.result === "object" ? String(v2746.result.kind ?? "") : "";
      if (shouldDropAfterResult(v2746.ok === true, v2747)) {
        bridges.get(v2726)?.dispose();
        bridges.delete(v2726);
        bridgeAccountKeys.delete(v2726);
      } else {
        try {
          v2744.send({
            id: "native-hotswap-cap-" + Date.now() + "-" + v2726,
            command: "capabilities"
          });
        } catch {}
      }
      return;
    }
    const v2748 = v2745;
    computerUseIndicator?.activity.receive(v2726, v2745);
    if (v2748.type === "event" && v2748.event === "question") {
      const v2749 = v2748.payload;
      const v2750 = String(v2749?.request_id ?? v2749?.requestId ?? "").trim();
      if (v2750.length > 0) {
        if (questionWatcher?.hasSeen(v2750)) {
          return;
        }
        questionWatcher?.markSeen(v2750);
      }
    } else if (v2748.type === "event" && v2748.event === "question_cleared") {
      const v2751 = v2748.payload;
      const v2752 = String(v2751?.request_id ?? v2751?.requestId ?? "").trim();
      if (v2752.length > 0) {
        questionWatcher?.forget(v2752);
      }
    }
    applyToolResultSideEffects(v2725, v2726, v2745);
    sendToRenderer(v2725, Channels.BridgeMessage, {
      sessionKey: v2726,
      message: v2745
    });
    if (v2745.type === "ready") {
      v2735("ready");
      const v2753 = v2745.session_id;
      if (v2753) {
        turnPresentation?.copy(v2726, v2753, true);
        sessionResumeIds.set(v2726, v2753);
      }
    }
    if (v2745.type === "turn") {
      turnPresentation?.finish(sessionResumeIds.get(v2726) ?? v2726, v2745.id);
    }
  });
  v2744.on("malformed", v2754 => {
    sendToRenderer(v2725, Channels.BridgeMessage, {
      sessionKey: v2726,
      message: {
        type: "error",
        error: "é JSON: " + v2754
      }
    });
  });
  v2744.on("stderr", v2755 => {
    console.error("[engine stderr][" + v2726 + "] " + v2755);
  });
  v2744.on("closed", ({
    crashed: v2756,
    code: v2757,
    diagnostic: v2758
  }) => {
    if (!bridges.has(v2726) || bridges.get(v2726) === v2744) {
      computerUseIndicator?.activity.clear(v2726);
    }
    if (bridges.get(v2726) !== v2744) {
      return;
    }
    const v2759 = v2756 && !accountStore?.current.isLoggedIn && v2758?.phase === "startup" && v2758.stderrTail.includes("[error-kind: missing_credentials]");
    v2735(v2756 && !v2759 ? "crashed" : "closed", "exit code " + v2757, v2759 ? undefined : v2758);
    bridges.delete(v2726);
    bridgeAccountKeys.delete(v2726);
    bridgeWorkbenchRevisions.delete(v2726);
  });
  console.log("[main] engine resolved: path=" + v2739.enginePath + " devFallback=" + v2739.isDevFallback + " packaged=" + electron.app.isPackaged + " claudeConfigDir=" + (v2743 ?? "(unset)") + " bridgeExe=" + (v2739.bridgeExePath ?? "(none)"));
  v2735("spawning", v2739.enginePath);
  let v2760 = settingsStore?.current ?? defaultSettings();
  const v2761 = modelSlotsForWire();
  const v2762 = accountStore?.current ?? {
    serverUrl: "",
    token: ""
  };
  const v2763 = v2762.token.trim().length > 0 && v2762.serverUrl.trim().length > 0;
  if (v2763 && v2760.selectedModelKey.trim().length === 0) {
    const v2764 = v2761.find(v2765 => v2765.enabled)?.key ?? OFFLINE_MODEL_KEYS[0];
    v2760 = settingsStore?.set({
      selectedModelKey: v2764
    }) ?? {
      ...v2760,
      selectedModelKey: v2764
    };
    sendToRenderer(v2725, Channels.SettingsChanged, v2760);
  }
  const v2766 = resolveVisionAll(v2761) ?? {};
  const v2767 = formatVisionModelsEnv(v2766);
  const v2768 = resolveVisionModelKey(v2760.visionModelKey, v2766, v2761);
  const v2769 = modelSlotsCache.length > 0 ? formatAvailableModels(modelSlotsCache.filter(v2770 => v2770.enabled).map(v2771 => ({
    key: v2771.key,
    label: v2771.label,
    vision: v2771.vision === true
  }))) : "";
  const v2772 = thinkingEnvsForWire();
  const v2773 = (() => {
    try {
      const v2774 = node_child_process.execFileSync("reg", ["query", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyEnable"], {
        encoding: "utf8"
      });
      if (!/0x1\s*$/m.test(v2774)) {
        return undefined;
      }
      const v2775 = node_child_process.execFileSync("reg", ["query", "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", "/v", "ProxyServer"], {
        encoding: "utf8"
      });
      const v2776 = /ProxyServer\s+REG_SZ\s+([^\r\n]+)/i.exec(v2775);
      const v2777 = (v2776?.[1] ?? "").trim();
      if (v2777.length === 0) {
        return undefined;
      }
      if (v2777.includes(":")) {
        return "http://" + v2777;
      } else {
        return "http://" + v2777 + ":80";
      }
    } catch {
      return undefined;
    }
  })();
  try {
    v2744.spawnProcess({
      appVersion: electron.app.getVersion(),
      located: v2739,
      cwd: v2742,
      httpProxy: v2773,
      sessionWorkspaceRoot: boundWorkspaces.get(v2726)?.root ?? v2728,
      runtimeHome: runtimeHome(),
      claudeConfigDir: v2743,
      desktopMcpConfig: workbenchStore?.writeMcpRuntimeConfig(process.execPath, node_url.fileURLToPath(new URL("./mcpProxy.js", require("url").pathToFileURL(__filename).href)), computerUseMcpConfig({
        executable: process.execPath,
        repoRoot: v2739.repoRoot,
        resourcesPath: packagedLocation()?.resourcesPath
      })),
      resumeSessionId: v2727,
      model: v2763 && v2760.selectedModelKey.length > 0 ? v2760.selectedModelKey : undefined,
      reasoningEffort: v2760.reasoningEffort,
      permissionMode: v2760.permissionMode,
      accountToken: v2762.token,
      accountServer: v2762.serverUrl,
      visionModelsEnv: v2767,
      visionModelEnv: v2768,
      availableModelsEnv: v2769,
      thinkingTiersEnv: v2772.tiers,
      thinkingKindsEnv: v2772.kinds,
      thinkingFieldsEnv: v2772.fields,
      autoCompactThreshold: v2760.autoCompactThreshold,
      routeEnv: codesysRouteEnv(v2729?.project)
    });
  } catch (v2778) {
    const v2779 = createEngineFailureRecorder({
      runtimeHome: runtimeHome(),
      enginePath: v2739.enginePath,
      cwd: v2742,
      appVersion: electron.app.getVersion(),
      secrets: [v2762.token]
    }).failure({
      phase: "startup",
      error: v2778 instanceof Error ? v2778 : new Error(String(v2778))
    });
    v2735("crashed", v2779.errorMessage, v2779);
    bridges.delete(v2726);
    throw v2778;
  }
  bridgeAccountKeys.set(v2726, v2731);
  console.log("[main] credential injection: hasToken=" + (v2762.token.length > 0) + " tokenTail=" + (v2762.token.length > 0 ? v2762.token.slice(-4) : "") + " server=" + v2762.serverUrl);
  return v2744;
}
electron.app.whenReady().then(async () => {
  await __byok.ready;
  await __byok.initialize();
  electron.Menu.setApplicationMenu(null);
  settingsStore = new SettingsStore(runtimeHome());
  settingsStore.load();
  const v2780 = mainWindow();
  viewerService = registerViewerIpc({
    win: v2780,
    enabled: buildIdentity.channel === "demo5" || isDev,
    runtimeHome: runtimeHome(),
    rootFor: v2781 => {
      const v2782 = viewerSessionRoots.get(v2781);
      if (!v2782) {
        throw new Error("原会话已关闭，请从目标会话重新打开 Viewer");
      }
      return boundWorkspaces.get(v2781)?.stagingRoot || v2782;
    },
    theme: () => settingsStore?.current.theme || "light",
    inlineAI: () => {
      const v2783 = accountStore?.current;
      if (!v2783?.isLoggedIn || !v2783.serverUrl.trim() || !v2783.token.trim()) {
        throw new Error("请先在 PlcCode 登录，再使用行内解释");
      }
      const v2784 = modelSlotsForWire().filter(v2785 => v2785.enabled);
      const v2786 = settingsStore?.current.selectedModelKey.trim();
      const v2787 = v2784.find(v2788 => v2788.key === v2786)?.key || v2784.find(v2789 => v2789.key.toLowerCase().includes("flash"))?.key || v2784[0]?.key;
      if (!v2787) {
        throw new Error("PlcCode 暂无可用模型，请先选择模型");
      }
      return {
        serverUrl: v2783.serverUrl,
        token: v2783.token,
        model: v2787
      };
    }
  });
  v2780.on("close", v2790 => {
    if (closeApproved) {
      return;
    }
    v2790.preventDefault();
    handleWindowCloseRequest(v2780);
  });
  questionWatcher = new PendingQuestionWatcher(runtimeHome());
  questionWatcher.on("question", v2791 => {
    const v2792 = focusedSessionKey || lastOpenedSessionKey;
    if (!v2792) {
      return;
    }
    const v2793 = {
      type: "event",
      id: "",
      event: "question",
      index: 0,
      payload: v2791
    };
    sendToRenderer(v2780, Channels.BridgeMessage, {
      sessionKey: v2792,
      message: v2793
    });
  });
  questionWatcher.on("error", v2794 => {
    console.error("[main] pending_questions watcher error:", v2794);
  });
  questionWatcher.start();
  try {
    purgeOldDraftsIfOverBudget();
  } catch (v2795) {
    console.warn("[main] drafts purge skipped:", v2795.message);
  }
  accountStore = new AccountStore(runtimeHome());
  accountStore.load();
  sessionMetaStore = new SessionMetaStore(runtimeHome());
  sessionMetaStore.load();
  turnPresentation = new TurnPresentationStore(runtimeHome());
  workbenchStore = new mcpClient.WorkbenchStore(runtimeHome());
  workbenchStore.load();
  registerWorkbenchIpc({
    win: v2780,
    store: workbenchStore,
    engine: () => {
      const v2796 = locateEngine(node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href)), packagedLocation()).enginePath;
      if (!v2796) {
        throw new Error("未找到本地引擎");
      }
      return v2796;
    },
    cwd: v2797 => v2797 && boundWorkspaces.get(v2797)?.stagingRoot || runtimeHome(),
    busy: () => [...bridges.values()].some(v2798 => !v2798.isIdle)
  });
  if (accountStore.current.isLoggedIn) {
    const v2799 = accountStore.current;
    meAsync(v2799.serverUrl, v2799.token).then(v2800 => {
      if (!accountStore) {
        return;
      }
      if (v2800.ok && v2800.state) {
        accountStore.setLoggedIn({
          ...v2800.state,
          serverUrl: v2799.serverUrl,
          token: v2799.token
        }, true);
        sendToRenderer(v2780, Channels.Account.StatePushed, sanitizedAccountState());
      } else if (v2800.unauthorized) {
        accountStore.clear();
        sendToRenderer(v2780, Channels.Account.StatePushed, sanitizedAccountState());
      }
    }).catch(v2801 => console.error("[main] startup MeAsync failed (keeping saved login):", v2801));
    listModelsAsync(v2799.serverUrl, v2799.token).then(v2802 => {
      if (v2802.ok) {
        setModelSlots(v2802.models);
      }
    }).catch(() => {});
  }
  offerBridgeTrustIfNeeded(v2780, !accountStore.current.isLoggedIn);
  const v2803 = new UpdateController({
    identity: buildIdentity,
    currentVersion: () => electron.app.getVersion(),
    createService: () => new UpdateService(buildIdentity),
    checkPolicy: () => checkLatestVersionAsync(normalizeServerUrl(accountStore?.current.serverUrl || "") || DEFAULT_ACCOUNT_SERVER),
    getOverlay: () => currentUpdateOverlay,
    pushOverlay: v2804 => pushUpdateOverlay(v2780, v2804),
    releaseNotes: releaseNotesForVersion,
    readPostponed: () => readPostponed(runtimeHome()),
    writePostponed: v2805 => writePostponed(runtimeHome(), v2805),
    progress: v2806 => sendToRenderer(v2780, Channels.Update.DownloadProgress, v2806),
    quit: () => electron.app.quit()
  });
  v2803.check();
  const v2807 = async () => {
    const v2808 = process.env[ANNOUNCEMENTS_SOURCE_ENV]?.trim();
    if (!v2808 && !electron.app.isPackaged) {
      return;
    }
    const v2809 = runtimeHome();
    dismissedAnnouncementIds = readDismissedAnnouncementIds(v2809);
    const v2810 = normalizeServerUrl(accountStore?.current.serverUrl || "") || DEFAULT_ACCOUNT_SERVER;
    const v2811 = resolveAnnouncementsSource(v2810, v2808);
    const v2812 = await fetchAnnouncementsAsync(v2811);
    if (v2812.ok && v2812.doc) {
      announcementDocument = v2812.doc;
      writeCachedAnnouncementDocument(v2809, v2812.doc);
      console.log("[main] announcements: " + v2812.doc.announcements.length + " entries, releaseNotes versions=[" + Object.keys(v2812.doc.releaseNotes).join(",") + "] from " + v2811.display + " (" + v2812.bytes + "B)");
    } else {
      const v2813 = readCachedAnnouncementDocument(v2809);
      if (v2813) {
        announcementDocument = v2813;
      }
      console.log("[main] announcements: fetch failed (" + v2812.error + ") — " + (v2813 ? "using cached document" : "no cached document, showing nothing"));
    }
    pushAnnouncements(v2780);
    refreshUpdateOverlayReleaseNotes(v2780);
  };
  v2807();
  electron.ipcMain.handle(Channels.SendTurn, (v2814, v2815, v2816) => {
    const v2817 = ensureBridge(v2780, v2815);
    if ("input_kind" in v2816) {
      computerUseIndicator?.activity.begin(v2815, v2816.id);
    }
    if ("input_kind" in v2816 && v2816.presentation) {
      const {
        presentation: v2818,
        ...v2819
      } = v2816;
      v2817.send(v2819);
      turnPresentation?.start(sessionResumeIds.get(v2815) ?? v2815, v2816.id, v2816.prompt, v2818);
    } else {
      v2817.send(v2816);
    }
  });
  electron.ipcMain.handle(Channels.ReconnectBridge, (v2820, v2821) => {
    ensureBridge(v2780, v2821);
  });
  electron.ipcMain.handle(Channels.RestartBridge, (v2822, v2823) => {
    const v2824 = bridges.get(v2823);
    if (v2824) {
      v2824.dispose();
      bridges.delete(v2823);
      bridgeAccountKeys.delete(v2823);
    }
    ensureBridge(v2780, v2823);
  });
  electron.ipcMain.handle(Channels.RequestCapabilities, (v2825, v2826, v2827) => {
    const v2828 = bridges.get(v2826);
    if (!v2828 || !v2828.isAlive) {
      throw new Error("engine bridge not connected for session \"" + v2826 + "\"");
    }
    v2828.send({
      id: v2827,
      command: "capabilities"
    });
  });
  electron.ipcMain.handle(Channels.Cancel, (v2829, v2830, v2831) => {
    computerUseIndicator?.activity.cancel(v2830);
    const v2832 = bridges.get(v2830);
    if (!v2832 || !v2832.isAlive) {
      return;
    }
    v2832.send({
      command: "cancel",
      scope: v2831
    });
  });
  electron.ipcMain.handle(Channels.StopAgent, (v2833, v2834, v2835) => {
    const v2836 = v2835.trim();
    if (v2836.length === 0) {
      return;
    }
    const v2837 = bridges.get(v2834);
    if (!v2837 || !v2837.isAlive) {
      return;
    }
    v2837.send({
      type: "agent_stop",
      agentId: v2836
    });
  });
  electron.ipcMain.handle(Channels.AnswerQuestion, (v2838, v2839) => {
    if (!questionWatcher) {
      throw new Error("pending_questions watcher not started");
    }
    questionWatcher.answer(v2839.requestId, v2839.accepted, v2839.answer);
    questionWatcher.forget(v2839.requestId);
  });
  electron.ipcMain.handle(Channels.AgentModelConsentResponse, (v2840, v2841, v2842) => {
    const v2843 = bridges.get(v2841);
    if (!v2843 || !v2843.isAlive) {
      return;
    }
    v2843.send({
      type: "agent_model_consent_response",
      requestId: v2842.requestId,
      decision: v2842.decision
    });
  });
  electron.ipcMain.handle(Channels.ListSessions, async () => listSessions(runtimeHome(), sessionMetaStore ?? undefined));
  electron.ipcMain.handle(Channels.RenameSession, (v2844, v2845, v2846) => {
    sessionMetaStore?.setCustomTitle(v2845, v2846);
  });
  electron.ipcMain.handle(Channels.GenerateSessionTitle, async (v2847, v2848) => {
    const v2849 = v2848.sessionId.trim();
    if (v2849.length === 0) {
      return {
        title: ""
      };
    }
    const v2850 = sessionMetaStore?.get(v2849);
    if (v2850?.customTitle) {
      return {
        title: v2850.customTitle
      };
    }
    if (v2850?.aiTitle) {
      return {
        title: v2850.aiTitle
      };
    }
    let v2851 = pendingSessionTitles.get(v2849);
    if (!v2851) {
      v2851 = (async () => {
        const v2852 = accountStore?.current;
        const v2853 = settingsStore?.current ?? defaultSettings();
        const v2854 = modelSlotsForWire();
        const v2855 = v2853.selectedModelKey.trim();
        const v2856 = Array.from(new Set([v2854.find(v2857 => v2857.enabled && v2857.key.toLowerCase().includes("flash"))?.key, "deepseek-v4-flash", v2855, v2854.find(v2858 => v2858.enabled)?.key, OFFLINE_MODEL_KEYS[0]].filter(v2859 => Boolean(v2859 && v2859.trim().length > 0))));
        let v2860 = "";
        if (v2852?.isLoggedIn && v2852.serverUrl.trim() && v2852.token.trim()) {
          const v2861 = v2856[0];
          if (v2861) {
            v2860 = await requestSessionTitle(v2852.serverUrl, v2852.token, v2861, v2848);
          }
        }
        if (!v2860) {
          v2860 = deriveFallbackSessionTitle(v2848.userText);
        }
        return sessionMetaStore?.setAiTitleOnce(v2849, v2860) ?? v2860;
      })().finally(() => pendingSessionTitles.delete(v2849));
      pendingSessionTitles.set(v2849, v2851);
    }
    return {
      title: await v2851
    };
  });
  electron.ipcMain.handle(Channels.GenerateSessionTitles, async (v2862, v2863) => {
    const v2864 = v2863.sessions.map(v2865 => ({
      sessionId: v2865.sessionId.trim(),
      userText: v2865.userText.trim()
    })).filter(v2866 => v2866.sessionId.length > 0 && v2866.userText.length > 0).filter(v2867 => {
      const v2868 = sessionMetaStore?.get(v2867.sessionId);
      return !v2868?.customTitle && !v2868?.aiTitle;
    }).slice(0, 12);
    if (v2864.length === 0) {
      return {
        titles: {}
      };
    }
    const v2869 = accountStore?.current;
    const v2870 = settingsStore?.current ?? defaultSettings();
    const v2871 = modelSlotsForWire();
    const v2872 = Array.from(new Set([v2871.find(v2873 => v2873.enabled && v2873.key.toLowerCase().includes("flash"))?.key, "deepseek-v4-flash", v2870.selectedModelKey.trim(), v2871.find(v2874 => v2874.enabled)?.key, OFFLINE_MODEL_KEYS[0]].filter(v2875 => Boolean(v2875 && v2875.trim().length > 0))));
    let v2876 = {};
    if (v2869?.isLoggedIn && v2869.serverUrl.trim() && v2869.token.trim()) {
      const v2877 = v2872[0];
      if (v2877) {
        v2876 = await requestSessionTitleBatch(v2869.serverUrl, v2869.token, v2877, v2864);
      }
    }
    const v2878 = {};
    for (const v2879 of v2864) {
      const v2880 = v2879.sessionId;
      const v2881 = v2876[v2880] || deriveFallbackSessionTitle(v2879.userText);
      const v2882 = sessionMetaStore?.setAiTitleOnce(v2880, v2881) ?? v2881;
      if (v2882.length > 0) {
        v2878[v2880] = v2882;
      }
    }
    return {
      titles: v2878
    };
  });
  electron.ipcMain.handle(Channels.PinSession, (v2883, v2884, v2885) => {
    sessionMetaStore?.setPinned(v2884, v2885);
  });
  electron.ipcMain.handle(Channels.ForkSession, async (v2886, v2887) => {
    const v2888 = await forkSession(runtimeHome(), v2887);
    if (!v2888) {
      return null;
    }
    turnPresentation?.copy(v2887, v2888.newId);
    const v2889 = await listSessions(runtimeHome(), sessionMetaStore ?? undefined);
    return v2889.find(v2890 => v2890.id === v2888.newId) ?? null;
  });
  electron.ipcMain.handle(Channels.RevealSessionInFolder, async (v2891, v2892) => {
    const v2893 = await locateSession(runtimeHome(), v2892);
    if (v2893) {
      electron.shell.showItemInFolder(v2893.jsonlPath);
    }
  });
  electron.ipcMain.handle(Channels.DeleteSession, async (v2894, v2895) => {
    const v2896 = await deleteSession(runtimeHome(), v2895);
    if (v2896.ok) {
      sessionMetaStore?.remove(v2895);
    }
    if (v2896.ok) {
      turnPresentation?.remove(v2895);
    }
    return v2896;
  });
  electron.ipcMain.handle(Channels.OpenSession, async (v2897, v2898) => {
    const v2899 = v2898.filePath ? resolveAllowedSessionFile(v2898.filePath) : null;
    let v2900;
    if (v2898.resumeSessionId && v2899 && !boundWorkspaces.has(v2898.sessionKey)) {
      const v2901 = readRecordedWorkspaceRoot(v2899);
      if (v2901.length > 0 && isUnderDraftsDir(v2901, runtimeHome())) {
        v2900 = v2901;
      }
    }
    viewerSessionRoots.set(v2898.sessionKey, v2900 || draftsDirFor(v2898.sessionKey));
    const v2902 = ensureBridge(v2780, v2898.sessionKey, v2898.resumeSessionId, v2900);
    const v2903 = v2899 ? await reconstructHistory(v2899) : null;
    if (v2903) {
      turnPresentation?.restore(v2903.meta?.sessionId || v2898.resumeSessionId || v2898.sessionKey, v2903.blocks);
    }
    if (v2903) {
      const v2904 = collectAgentIdsFromHistory(v2903.blocks);
      const v2905 = collectWorkflowIdsFromHistory(v2903.blocks);
      if (v2904.length > 0 || v2905.length > 0) {
        v2902.send({
          type: "agent_query",
          agentIds: v2904,
          workflowIds: v2905
        });
      }
    }
    return {
      history: v2903
    };
  });
  electron.ipcMain.handle(Channels.SetFocusedSession, (v2906, v2907) => {
    focusedSessionKey = v2907;
    if (!bridges.get(v2907)?.isAlive) {
      ensureBridge(v2780, v2907);
    }
  });
  electron.ipcMain.handle(Channels.PickWorkspaceFolder, async () => {
    const v2908 = await electron.dialog.showOpenDialog(v2780, {
      title: "选择工程文件夹",
      properties: ["openDirectory"]
    });
    if (v2908.canceled || v2908.filePaths.length === 0) {
      return null;
    }
    return v2908.filePaths[0];
  });
  electron.ipcMain.handle(Channels.BindWorkspace, (v2909, v2910, v2911, v2912, v2913, v2914) => {
    const v2915 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
    const v2916 = anyOtherLiveSessionOnRoot(v2910, v2911);
    const {
      result: v2917,
      bound: v2918
    } = bindWorkspace(v2915, runtimeHome(), v2911, v2912 === true, v2916, v2913);
    if (v2917.ok && !v2917.collection) {
      const v2919 = listDraftFiles(v2910);
      if (v2919.length > 0) {
        v2917.draftFiles = v2919;
      }
    }
    if (v2918) {
      boundWorkspaces.set(v2910, v2918);
      const v2920 = bridges.get(v2910);
      if (v2920 && v2920.isAlive && v2920.cwd !== v2918.stagingRoot) {
        v2920.dispose();
        bridges.delete(v2910);
      }
      const v2921 = runArtifactOpenCheckAndBuildVm(v2918.root, v2918.stagingRoot);
      sendToRenderer(v2780, Channels.Artifact.StateChanged, {
        sessionKey: v2910,
        vm: v2921
      });
      if (v2914 !== true) {
        ensureBridge(v2780, v2910);
      }
    }
    return v2917;
  });
  electron.ipcMain.handle(Channels.ListRoutes, () => {
    const v2922 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
    return listRoutes(v2922);
  });
  electron.ipcMain.handle(Channels.GetDefaultProjectLocation, () => {
    const v2923 = settingsStore?.current.lastProjectLocation ?? "";
    if (v2923.trim().length > 0 && node_fs.existsSync(v2923)) {
      return v2923;
    }
    return node_path.join(electron.app.getPath("documents"), "PLC 工程");
  });
  electron.ipcMain.handle(Channels.PickSaveLocation, async () => {
    const v2924 = await electron.dialog.showOpenDialog(v2780, {
      title: "选择保存位置",
      properties: ["openDirectory", "createDirectory"]
    });
    if (v2924.canceled || v2924.filePaths.length === 0) {
      return null;
    }
    return v2924.filePaths[0];
  });
  electron.ipcMain.handle(Channels.CreateProject, (v2925, v2926, v2927, v2928, v2929) => {
    const v2930 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
    const {
      result: v2931,
      bound: v2932
    } = createProject(v2930, runtimeHome(), v2927, v2928, v2929);
    if (v2931.ok) {
      settingsStore?.set({
        lastProjectLocation: v2927.trim()
      });
    }
    if (v2931.ok && !v2931.collection) {
      const v2933 = listDraftFiles(v2926);
      if (v2933.length > 0) {
        v2931.draftFiles = v2933;
      }
    }
    if (v2932) {
      boundWorkspaces.set(v2926, v2932);
      const v2934 = bridges.get(v2926);
      if (v2934 && v2934.isAlive && v2934.cwd !== v2932.stagingRoot) {
        v2934.dispose();
        bridges.delete(v2926);
      }
      const v2935 = runArtifactOpenCheckAndBuildVm(v2932.root, v2932.stagingRoot);
      sendToRenderer(v2780, Channels.Artifact.StateChanged, {
        sessionKey: v2926,
        vm: v2935
      });
      ensureBridge(v2780, v2926);
    }
    return v2931;
  });
  const v2936 = async v2937 => {
    const v2938 = settingsStore?.current.lastProjectLocation ?? "";
    let v2939 = v2938.trim().length > 0 && node_fs.existsSync(v2938) ? v2938 : node_path.join(electron.app.getPath("documents"), "PLC 工程");
    if (!v2937.requiresAsciiPath) {
      return {
        location: v2939
      };
    }
    if (!/^[\x00-\x7F]*$/.test(v2939)) {
      v2939 = node_path.join(electron.app.getPath("documents"), "PLCCodeProjects");
    }
    if (/^[\x00-\x7F]*$/.test(v2939)) {
      return {
        location: v2939
      };
    }
    try {
      const v2940 = await electron.dialog.showOpenDialog(v2780, {
        title: "选择" + v2937.label + "工程保存位置（完整路径不能含中文）",
        properties: ["openDirectory", "createDirectory"]
      });
      if (v2940.canceled || v2940.filePaths.length === 0) {
        return {
          error: "已取消选择保存位置，尚未创建工程"
        };
      }
      v2939 = v2940.filePaths[0];
      if (/^[\x00-\x7F]*$/.test(v2939)) {
        return {
          location: v2939
        };
      } else {
        return {
          error: v2937.label + "原厂操作暂需路径只含英文、数字或符号，请重新选择保存位置；尚未创建工程"
        };
      }
    } catch {
      return {
        error: "无法选择保存位置，尚未创建工程，请重新选择"
      };
    }
  };
  const v2941 = async (v2942, v2943) => {
    return withSoftwareCreation(v2942, async () => {
      const v2944 = softwareChoiceById(v2943);
      if (!v2944) {
        return {
          ok: false,
          error: "未识别的软件类型，请重新选择"
        };
      }
      const v2945 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
      const v2946 = boundWorkspaces.get(v2942);
      if (v2946?.project.templateId === v2944.routeId) {
        return bindWorkspace(v2945, runtimeHome(), v2946.root, false, true).result;
      }
      const v2947 = await v2936(v2944);
      if ("error" in v2947) {
        return {
          ok: false,
          error: v2947.error
        };
      }
      const v2948 = v2947.location;
      const v2949 = new Date().toISOString().replace(/[-:.TZ]/g, "");
      const v2950 = (v2944.workspaceFolderPrefix ?? v2944.label) + "-" + v2949;
      const {
        result: v2951,
        bound: v2952
      } = createProject(v2945, runtimeHome(), v2948, v2944.routeId, v2950);
      if (v2951.ok) {
        settingsStore?.set({
          lastProjectLocation: v2948.trim()
        });
      }
      if (v2951.ok && !v2951.collection) {
        const v2953 = listDraftFiles(v2942);
        if (v2953.length > 0) {
          v2951.draftFiles = v2953;
        }
      }
      if (v2952) {
        boundWorkspaces.set(v2942, v2952);
        const v2954 = bridges.get(v2942);
        if (v2954 && v2954.isAlive && v2954.cwd !== v2952.stagingRoot) {
          v2954.dispose();
          bridges.delete(v2942);
        }
        const v2955 = runArtifactOpenCheckAndBuildVm(v2952.root, v2952.stagingRoot);
        sendToRenderer(v2780, Channels.Artifact.StateChanged, {
          sessionKey: v2942,
          vm: v2955
        });
        ensureBridge(v2780, v2942);
      }
      return v2951;
    });
  };
  electron.ipcMain.handle(Channels.StartWithSoftware, (v2956, v2957, v2958) => v2941(v2957, v2958));
  electron.ipcMain.handle(Channels.OpenNativeProject, async (v2959, v2960) => {
    const v2961 = boundWorkspaces.get(v2960);
    if (!v2961 || v2961.project.integration !== "weinview_native") {
      return "请先选择威纶通工程";
    }
    const v2962 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
    return openWeinviewNativeProject(locateExecuteTool(v2962, packagedLocation()), v2961);
  });
  electron.ipcMain.handle(Channels.ReadNativeProject, (v2963, v2964) => {
    const v2965 = boundWorkspaces.get(v2964);
    if (v2965?.project.integration === "weinview_native") {
      return readVerifiedWeinviewProject(v2965.root);
    } else {
      return null;
    }
  });
  const v2966 = new Set();
  electron.ipcMain.handle(Channels.AdoptNativeProject, async (v2967, v2968) => {
    const v2969 = boundWorkspaces.get(v2968);
    if (!v2969 || v2969.project.integration !== "weinview_native" || v2969.project.vendor !== "weinview") {
      return {
        ok: false,
        error: "请先绑定威纶通原厂工程工作区"
      };
    }
    if (v2966.has(v2968)) {
      return {
        ok: false,
        error: "正在接管原厂工程，请勿重复点击"
      };
    }
    v2966.add(v2968);
    const v2970 = weinviewProgressReporter(v2780, v2968);
    try {
      const v2971 = await electron.dialog.showOpenDialog(v2780, {
        title: "选择威纶通工程或运行文件（保留原文件）",
        defaultPath: v2969.root,
        properties: ["openFile"],
        filters: [{
          name: "EasyBuilder Pro 工程或运行文件",
          extensions: ["cmtp", "emtp", "cxob", "exob"]
        }]
      });
      if (v2971.canceled || v2971.filePaths.length === 0) {
        return {
          ok: false,
          canceled: true,
          error: ""
        };
      }
      if (boundWorkspaces.get(v2968) !== v2969) {
        return {
          ok: false,
          error: "工作区已切换，请在当前工程中重新选择"
        };
      }
      const v2972 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
      const v2973 = locateExecuteTool(v2972, packagedLocation());
      if (!v2973) {
        return {
          ok: false,
          error: "未找到原厂工程工具；旧候选保持不变"
        };
      }
      const v2974 = v2971.filePaths[0];
      const v2975 = node_path.extname(v2974).toLowerCase();
      const v2976 = v2975 === ".cxob" || v2975 === ".exob" ? await recoverWeinviewRuntimeProject(v2973, v2969, v2974, v2970.report) : await adoptWeinviewNativeProject(v2973, v2969, v2974, v2970.report);
      v2970.finish(true);
      if (boundWorkspaces.get(v2968) !== v2969) {
        return {
          ok: false,
          error: "工作区已切换；原工作区的接管结果请核对交付记录，勿直接重试"
        };
      }
      return {
        ok: true,
        nativeProject: v2976,
        project: {
          ...v2969.project
        }
      };
    } catch (v2977) {
      v2970.finish(false);
      return {
        ok: false,
        error: v2977.message || "原厂工程接管失败；旧候选保持不变"
      };
    } finally {
      v2966.delete(v2968);
    }
  });
  electron.ipcMain.handle(Channels.MigrateDrafts, (v2978, v2979) => {
    const v2980 = boundWorkspaces.get(v2979);
    if (!v2980) {
      return {
        ok: false,
        error: "当前没有已绑定的工程，无法放入草稿"
      };
    }
    const v2981 = draftsDirFor(v2979);
    const v2982 = listDraftFiles(v2979);
    const v2983 = (v2984, v2985) => {
      const v2986 = v2984.lastIndexOf("/");
      const v2987 = v2986 >= 0 ? v2984.slice(0, v2986 + 1) : "";
      const v2988 = v2986 >= 0 ? v2984.slice(v2986 + 1) : v2984;
      const v2989 = v2988.lastIndexOf(".");
      const v2990 = v2989 > 0 ? v2988.slice(0, v2989) : v2988;
      const v2991 = v2989 > 0 ? v2988.slice(v2989) : "";
      return "" + v2987 + v2990 + "-草稿" + (v2985 > 1 ? String(v2985) : "") + v2991;
    };
    const v2992 = [];
    try {
      for (const v2993 of v2982) {
        const v2994 = node_path.join(v2981, v2993.replace(/\//g, node_path.sep));
        const v2995 = node_path.join(v2980.root, v2993.replace(/\//g, node_path.sep));
        if (node_fs.existsSync(v2995) && node_fs.readFileSync(v2995).equals(node_fs.readFileSync(v2994))) {
          node_fs.rmSync(v2994, {
            force: true
          });
          v2992.push(v2993);
          continue;
        }
        let v2996 = v2993;
        let v2997 = 0;
        while (node_fs.existsSync(node_path.join(v2980.root, v2996.replace(/\//g, node_path.sep)))) {
          v2997 += 1;
          v2996 = v2983(v2993, v2997);
        }
        const v2998 = node_path.join(v2980.root, v2996.replace(/\//g, node_path.sep));
        node_fs.mkdirSync(node_path.join(v2998, ".."), {
          recursive: true
        });
        node_fs.copyFileSync(v2994, v2998);
        node_fs.rmSync(v2994, {
          force: true
        });
        v2992.push(v2996);
      }
      const v2999 = removeTreeByHand(v2981);
      if (!v2999.ok) {
        console.warn("[main] drafts dir kept (still in use): " + v2999.path + " (" + v2999.code + ")");
      }
    } catch (v3000) {
      console.error("[main] draft migration failed: " + v3000.message);
      const v3001 = listDraftFiles(v2979);
      const v3002 = v3001[0] ? "（" + v3001[0] + " 可能被其它程序占用）" : "";
      return {
        ok: false,
        error: "放入工程时有文件没放进去" + v3002 + "，其余草稿仍保留在原处，可稍后重试"
      };
    }
    const v3003 = node_url.fileURLToPath(new URL(".", require("url").pathToFileURL(__filename).href));
    const v3004 = anyOtherLiveSessionOnRoot(v2979, v2980.root);
    const {
      result: v3005,
      bound: v3006
    } = bindWorkspace(v3003, runtimeHome(), v2980.root, false, v3004);
    if (v3006) {
      boundWorkspaces.set(v2979, v3006);
      const v3007 = bridges.get(v2979);
      if (v3007 && v3007.isAlive && v3007.cwd !== v3006.stagingRoot) {
        v3007.dispose();
        bridges.delete(v2979);
      }
      const v3008 = runArtifactOpenCheckAndBuildVm(v3006.root, v3006.stagingRoot);
      sendToRenderer(v2780, Channels.Artifact.StateChanged, {
        sessionKey: v2979,
        vm: v3008
      });
      ensureBridge(v2780, v2979);
    }
    if (v3005.ok && !v3005.collection) {
      v3005.migratedFiles = v2992;
    }
    return v3005;
  });
  electron.ipcMain.handle(Channels.CloseWorkspace, (v3009, v3010) => {
    boundWorkspaces.delete(v3010);
    const v3011 = bridges.get(v3010);
    if (v3011 && v3011.isAlive) {
      v3011.dispose();
      bridges.delete(v3010);
    }
  });
  electron.ipcMain.handle(Channels.ReadCanvasFile, (v3012, v3013, v3014) => {
    const v3015 = boundWorkspaces.get(v3013);
    if (!v3015) {
      return {
        ok: false,
        content: "",
        error: "当前会话还没有打开工程"
      };
    }
    try {
      const v3016 = node_path.join(v3015.stagingRoot, v3014);
      const v3017 = resolveWithinRoot(v3016, v3015.stagingRoot);
      assertCanvasTextPath(v3017);
      return {
        ok: true,
        content: readWorkspaceFile(v3017)
      };
    } catch (v3018) {
      if (v3018 instanceof NativeContainerTextError) {
        return {
          ok: false,
          content: "",
          error: v3018.message
        };
      }
      console.error("[main] refused ReadCanvasFile outside staging root: " + JSON.stringify(v3014) + " (" + v3018.message + ")");
      return {
        ok: false,
        content: "",
        error: "文件不在当前工程范围内"
      };
    }
  });
  electron.ipcMain.handle(Channels.ReadCanvasImage, (v3019, v3020, v3021) => {
    const v3022 = boundWorkspaces.get(v3020);
    if (!v3022) {
      return {
        ok: false,
        error: "当前会话还没有打开工程"
      };
    }
    const v3023 = v3021.toLowerCase();
    if (!/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(v3023)) {
      return {
        ok: false,
        error: "不是支持的图片文件"
      };
    }
    try {
      const v3024 = node_path.join(v3022.stagingRoot, v3021);
      const v3025 = resolveWithinRoot(v3024, v3022.stagingRoot);
      const v3026 = node_fs.statSync(v3025);
      if (!v3026.isFile() || v3026.size > 8388608) {
        return {
          ok: false,
          error: "图片不存在或超过 8MB"
        };
      }
      const v3027 = v3023.endsWith(".png") ? "image/png" : v3023.endsWith(".jpg") || v3023.endsWith(".jpeg") ? "image/jpeg" : v3023.endsWith(".gif") ? "image/gif" : v3023.endsWith(".webp") ? "image/webp" : v3023.endsWith(".bmp") ? "image/bmp" : "image/svg+xml";
      const v3028 = "data:" + v3027 + ";base64," + node_fs.readFileSync(v3025).toString("base64");
      return {
        ok: true,
        dataUrl: v3028
      };
    } catch (v3029) {
      console.error("[main] refused ReadCanvasImage outside staging root: " + JSON.stringify(v3021) + " (" + v3029.message + ")");
      return {
        ok: false,
        error: "文件不在当前工程范围内"
      };
    }
  });
  electron.ipcMain.handle(Channels.ListDrafts, (v3030, v3031) => {
    return listDraftFiles(v3031);
  });
  electron.ipcMain.handle(Channels.ReadUnboundCanvasFile, (v3032, v3033, v3034) => {
    const v3035 = draftsDirFor(v3033);
    try {
      node_fs.mkdirSync(v3035, {
        recursive: true
      });
      const v3036 = node_path.join(v3035, v3034);
      const v3037 = resolveWithinRoot(v3036, v3035);
      return {
        ok: true,
        content: readWorkspaceFileByRelPath(v3035, node_path.relative(v3035, v3037))
      };
    } catch (v3038) {
      if (v3038 instanceof NativeContainerTextError) {
        return {
          ok: false,
          content: "",
          error: v3038.message
        };
      }
      console.error("[main] refused ReadUnboundCanvasFile outside drafts root: " + JSON.stringify(v3034) + " (" + v3038.message + ")");
      return {
        ok: false,
        content: "",
        error: "文件不在允许的范围内"
      };
    }
  });
  electron.ipcMain.handle(Channels.WriteCanvasFiles, (v3039, v3040, v3041) => {
    const v3042 = boundWorkspaces.get(v3040);
    if (!v3042) {
      return {
        ok: false,
        failed: v3041.map(v3043 => v3043.relPath)
      };
    }
    const v3044 = [];
    for (const v3045 of v3041) {
      try {
        assertCanvasTextPath(v3045.relPath);
        const v3046 = node_path.join(v3042.stagingRoot, v3045.relPath);
        const v3047 = node_path.resolve(v3042.stagingRoot) + node_path.sep;
        if (node_path.resolve(v3046) !== node_path.resolve(v3042.stagingRoot) && !node_path.resolve(v3046).startsWith(v3047)) {
          throw new Error("relPath escapes the staging root: " + v3045.relPath);
        }
        if (node_fs.existsSync(v3046)) {
          resolveWithinRoot(v3046, v3042.stagingRoot);
        } else {
          node_fs.mkdirSync(node_path.join(v3046, ".."), {
            recursive: true
          });
          resolveWithinRoot(node_path.join(v3046, ".."), v3042.stagingRoot);
        }
        writeStagingFile(v3046, v3045.content);
      } catch (v3048) {
        console.error("[main] refused WriteCanvasFiles outside staging root: " + JSON.stringify(v3045.relPath) + " (" + v3048.message + ")");
        v3044.push(v3045.relPath);
      }
    }
    return {
      ok: v3044.length === 0,
      failed: v3044
    };
  });
  electron.ipcMain.handle(Channels.CheckRealFileDrift, (v3049, v3050, v3051, v3052) => {
    const v3053 = boundWorkspaces.get(v3050);
    const v3054 = [];
    const v3055 = [];
    if (!v3053) {
      return {
        reloaded: v3054,
        conflictPaths: v3055
      };
    }
    const v3056 = v3057 => {
      try {
        const v3058 = node_path.join(v3053.root, v3057);
        if (!node_fs.existsSync(v3058)) {
          return null;
        }
        const v3059 = resolveWithinRoot(v3058, v3053.root);
        assertCanvasTextPath(v3059);
        const v3060 = readWorkspaceFile(v3059);
        const v3061 = v3053.realBaseline.get(v3057) ?? "";
        const v3062 = v3063 => v3063.replace(/\r\n/g, "\n");
        if (v3062(v3060) === v3062(v3061)) {
          return null;
        }
        return {
          drifted: true,
          content: v3060
        };
      } catch {
        return null;
      }
    };
    for (const v3064 of v3051) {
      const v3065 = v3056(v3064);
      if (v3065) {
        v3053.realBaseline.set(v3064, v3065.content);
        v3054.push({
          relPath: v3064,
          content: v3065.content
        });
      }
    }
    for (const v3066 of v3052) {
      if (v3056(v3066)) {
        v3055.push(v3066);
      }
    }
    return {
      reloaded: v3054,
      conflictPaths: v3055
    };
  });
  electron.ipcMain.handle(Channels.ReadStagingSnapshot, (v3067, v3068) => {
    const v3069 = boundWorkspaces.get(v3068);
    if (!v3069) {
      return [];
    }
    const v3070 = scanWorkspaceFiles(v3069.stagingRoot).files;
    const v3071 = scanStagingArtifactFiles(v3069.stagingRoot).files;
    const v3072 = [];
    for (const v3073 of [...v3070, ...v3071]) {
      try {
        v3072.push({
          relPath: v3073.path,
          content: readWorkspaceFileByRelPath(v3069.stagingRoot, v3073.path)
        });
      } catch {}
    }
    return v3072;
  });
  electron.ipcMain.handle(Channels.WriteRealFile, (v3074, v3075, v3076, v3077, v3078) => {
    const v3079 = boundWorkspaces.get(v3075);
    if (!v3079) {
      return {
        ok: false,
        error: "当前会话还没有打开工程"
      };
    }
    const v3080 = promoteOneFile({
      root: v3079.root,
      realBaseline: v3079.realBaseline
    }, v3076, v3077, v3078 === true);
    if (v3080.ok) {
      v3079.realBaseline.set(v3076, v3077);
      try {
        writeStagingFile(node_path.join(v3079.stagingRoot, v3076), v3077);
      } catch {}
    }
    return v3080;
  });
  electron.ipcMain.handle(Channels.DiscardWorkspace, async (v3081, v3082) => {
    const v3083 = boundWorkspaces.get(v3082);
    if (!v3083) {
      return {
        ok: false,
        error: "当前会话还没有打开工程"
      };
    }
    const v3084 = [];
    for (const [v3085, v3086] of boundWorkspaces) {
      if (normRoot(v3086.stagingRoot) !== normRoot(v3083.stagingRoot)) {
        continue;
      }
      const v3087 = bridges.get(v3085);
      if (!v3087 || !v3087.isAlive) {
        continue;
      }
      if (!v3087.isIdle) {
        return {
          ok: false,
          error: "当前工程仍有正在运行的会话，暂时不能放弃修改。请先等待或停止它们，再重试。"
        };
      }
      v3084.push(v3085);
    }
    for (const v3088 of v3084) {
      bridges.get(v3088)?.dispose();
      bridges.delete(v3088);
    }
    try {
      const {
        files: v3089
      } = scanWorkspaceFiles(v3083.root);
      resetStagingFromReal(v3083.stagingRoot, v3083.root, v3089);
      const v3090 = {};
      for (const v3091 of v3089) {
        try {
          v3090[v3091.path] = readWorkspaceFileByRelPath(v3083.root, v3091.path);
        } catch {}
      }
      v3083.realBaseline = new Map(Object.entries(v3090));
      return {
        ok: true,
        files: v3089,
        realBaseline: v3090
      };
    } catch (v3092) {
      return {
        ok: false,
        error: v3092.message
      };
    }
  });
  electron.ipcMain.handle(Channels.Tia.Status, async (v3093, v3094) => {
    const v3095 = tiaToolContext();
    if (!v3095) {
      return {
        connected: false,
        message: "未找到 execute_tool，请先构建 Rust 引擎或使用完整发行包",
        issues: [],
        version: "",
        whitelistNeedsTrust: false,
        whitelistStaleVersions: [],
        bridgeExePath: "",
        groupChecked: false,
        inGroup: false,
        presence: "Unknown",
        installedVersions: [],
        runningVersions: []
      };
    }
    return tiaStatusAsync(v3095, v3094);
  });
  electron.ipcMain.handle(Channels.Tia.VerifyConnection, async (v3096, v3097, v3098) => {
    const v3099 = tiaToolContext();
    if (!v3099) {
      return {
        report: tiaStatusProbeFailure("安装包内缺少诊断程序，请修复 PLC Code 安装。"),
        health: null
      };
    }
    if (v3097 !== undefined && typeof v3097 !== "string" || v3098 !== undefined && typeof v3098 !== "string") {
      return {
        report: tiaStatusProbeFailure("连接检查参数格式无效。"),
        health: null
      };
    }
    const v3100 = await verifyTiaConnection(v3099, v3097, v3098);
    sendToRenderer(v2780, Channels.Tia.StatusPushed, v3100.report);
    return v3100;
  });
  electron.ipcMain.handle(Channels.Tia.EnvironmentReport, async () => {
    const v3101 = tiaToolContext();
    if (!v3101) {
      return {
        parsed: false,
        probed: false,
        verdict: "unknown",
        headline: "未找到 execute_tool，请先构建 Rust 引擎或使用完整发行包",
        tone: "danger",
        items: [],
        routes: [],
        hasProductFixable: false,
        nextActions: []
      };
    }
    return environmentReportAsync(v3101);
  });
  electron.ipcMain.handle(Channels.Tia.CheckWhitelist, async () => {
    const v3102 = tiaToolContext();
    if (!v3102) {
      return {
        parsed: false,
        allTrusted: false,
        notTrustedVersions: [],
        trustedVersions: [],
        lines: [],
        bridgeExePath: "",
        bridgeExeExists: false,
        headline: "未找到 execute_tool",
        tone: "danger",
        sameBinaryOtherPaths: [],
        bridgeHashShort: ""
      };
    }
    return checkWhitelistAsync(v3102);
  });
  electron.ipcMain.handle(Channels.Tia.AdminFlagDoctor, async () => {
    const v3103 = tiaToolContext();
    if (!v3103) {
      return {
        parsed: false,
        blocked: false,
        flaggedCount: 0,
        blockedCount: 0,
        repairableCount: 0,
        backupDirectory: "",
        entries: [],
        readErrors: [],
        headline: "未找到 execute_tool",
        tone: "danger"
      };
    }
    return adminFlagDoctorAsync(v3103);
  });
  electron.ipcMain.handle(Channels.Tia.AdminFlagRepair, async (v3104, v3105) => {
    const v3106 = tiaToolContext();
    if (!v3106) {
      return {
        receipt: {
          parsed: false,
          allCleared: false,
          repairedCount: 0,
          backupJsonPath: "",
          backupRegPath: ""
        },
        failure: "未找到 execute_tool"
      };
    }
    return repairAdminFlagsAsync(v3106, v3105);
  });
  electron.ipcMain.handle(Channels.Tia.TrustBridge, async (v3107, v3108, v3109) => {
    const v3110 = resolvedBridgeExePath();
    if (!v3110) {
      return {
        ok: false,
        verifiedAllTrusted: false,
        registeredVersions: [],
        failedVersions: [],
        errorMessage: "未找到桥接程序，请先构建/发行 Rust 引擎",
        launch: {
          kind: "unparsed",
          raw: "bridge exe not found"
        }
      };
    }
    return trustBridgeElevated(v3110, v3109 ?? null);
  });
  electron.ipcMain.handle(Channels.Tia.JoinOpennessGroup, async (v3111, v3112) => {
    const v3113 = resolvedBridgeExePath();
    if (!v3113) {
      return {
        ok: false,
        launch: {
          kind: "unparsed",
          raw: "bridge exe not found"
        }
      };
    }
    return joinOpennessGroupElevated(v3113);
  });
  electron.ipcMain.handle(Channels.Tia.VersionLockRead, (v3114, v3115) => {
    if (!isBoundWorkspaceRoot(v3115)) {
      return null;
    }
    return readLock(v3115);
  });
  electron.ipcMain.handle(Channels.Tia.VersionLockWrite, (v3116, v3117, v3118) => {
    if (!isBoundWorkspaceRoot(v3117)) {
      return;
    }
    writeLock(v3117, v3118);
    let v3119;
    try {
      v3119 = node_fs.realpathSync(v3117);
    } catch {
      return;
    }
    for (const v3120 of boundWorkspaces.values()) {
      try {
        if (node_fs.realpathSync(v3120.root) !== v3119) {
          continue;
        }
      } catch {
        continue;
      }
      try {
        writeLock(v3120.stagingRoot, v3118);
      } catch {}
    }
  });
  electron.ipcMain.handle(Channels.Tia.TrustInviteAccept, async () => {
    const v3121 = tiaToolContext();
    if (!v3121) {
      return null;
    }
    const v3122 = async () => {
      const v3123 = await tiaStatusAsync(v3121);
      sendToRenderer(v2780, Channels.Tia.StatusPushed, v3123);
      return v3123;
    };
    return acceptCurrentInvite(runtimeHome(), v3122);
  });
  electron.ipcMain.handle(Channels.Tia.TrustInviteDecline, () => {
    declineCurrentInvite(runtimeHome());
  });
  const v3124 = () => {
    pollTiaPortalProcesses().then(v3125 => {
      if (v3125.count === 0) {
        delete process.env.PLC_CODE_LIVE_TIA_VERSION;
      }
      sendToRenderer(v2780, Channels.Tia.ProcessWatch, v3125);
    });
  };
  const v3126 = setInterval(v3124, 15000);
  v2780.on("focus", v3124);
  v2780.on("closed", () => clearInterval(v3126));
  v3124();
  electron.ipcMain.handle(Channels.Artifact.RevealInFolder, (v3127, v3128) => {
    if (v3128 && node_fs.existsSync(v3128)) {
      electron.shell.showItemInFolder(v3128);
    }
  });
  electron.ipcMain.handle(Channels.Artifact.MarkDelivered, (v3129, v3130, v3131) => {
    const v3132 = boundWorkspaces.get(v3130);
    if (!v3132) {
      return null;
    }
    const v3133 = markDelivered(v3132.root, v3131);
    if (v3133) {
      sendToRenderer(v2780, Channels.Artifact.StateChanged, {
        sessionKey: v3130,
        vm: v3133
      });
    }
    return v3133;
  });
  if (process.env.PLC_CODE_ENABLE_TEST_FIXTURES === "1") {
    electron.ipcMain.handle(Channels.Account.DebugForceLogin, () => {
      accountStore?.setLoggedIn({
        serverUrl: "http://fixture.invalid",
        phone: "10000000000",
        name: "夹具账号",
        token: "test-fixture-token"
      }, false);
      const v3134 = sanitizedAccountState();
      sendToRenderer(v2780, Channels.Account.StatePushed, v3134);
      offerBridgeTrustIfNeeded(v2780, false);
      return v3134;
    });
    electron.ipcMain.handle(Channels.Tia.DebugOfferTrustInvite, (v3135, v3136) => {
      const v3137 = tryOfferBridgeTrust(runtimeHome(), v3136.report, {
        blockingGateOpen: v3136.blockingGateOpen === true,
        guideRunning: v3136.guideRunning === true
      });
      if (v3137) {
        sendToRenderer(v2780, Channels.Tia.TrustInviteShow, v3137);
      }
      return v3137 !== null;
    });
    electron.ipcMain.handle(Channels.Tia.DebugResetTrustOrchestrator, () => {
      __resetBridgeTrustOrchestratorForTests();
    });
    electron.ipcMain.handle(Channels.Update.DebugOfferOverlay, (v3138, v3139) => {
      const v3140 = typeof v3139?.version === "string" && v3139.version.trim().length > 0 ? v3139.version.trim() : electron.app.getVersion();
      pushUpdateOverlay(v2780, {
        version: v3140,
        forced: v3139?.forced === true,
        notesUrl: typeof v3139?.notesUrl === "string" ? v3139.notesUrl : "",
        currentVersion: typeof v3139?.currentVersion === "string" && v3139.currentVersion.trim().length > 0 ? v3139.currentVersion : electron.app.getVersion(),
        releaseNotes: releaseNotesForVersion(v3140)
      });
      return currentUpdateOverlay;
    });
    electron.ipcMain.handle(Channels.InjectTestFixture, (v3141, v3142, v3143) => {
      if (isWindowSizeFixture(v3143)) {
        if (!v2780.isDestroyed()) {
          const v3144 = Math.round(v3143.width);
          const v3145 = Math.round(v3143.height);
          const v3146 = () => {
            if (!v2780.isDestroyed()) {
              v2780.setContentSize(v3144, v3145, false);
            }
          };
          if (v2780.isMaximized()) {
            v2780.once("unmaximize", v3146);
            v2780.unmaximize();
          } else {
            v3146();
          }
        }
        return;
      }
      if (!("type" in v3143)) {
        sendToRenderer(v2780, Channels.EngineStatus, {
          sessionKey: v3142,
          status: v3143.status,
          detail: v3143.detail,
          diagnostic: v3143.diagnostic
        });
        return;
      }
      applyToolResultSideEffects(v2780, v3142, v3143);
      sendToRenderer(v2780, Channels.BridgeMessage, {
        sessionKey: v3142,
        message: v3143
      });
    });
    electron.ipcMain.handle(Channels.SeedFixtureHistory, (v3147, v3148, v3149) => {
      sendToRenderer(v2780, Channels.FixtureHistorySeeded, {
        sessionKey: v3148,
        history: v3149
      });
    });
  }
  const v3150 = async () => {
    for (const v3151 of bridges.values()) {
      v3151.invalidateRagAccess();
    }
    const v3152 = [...bridges.values()].some(v3153 => v3153.isAlive && !v3153.isIdle);
    if (v3152) {
      const v3154 = Date.now() + "-" + Math.random().toString(36).slice(2);
      const v3155 = await new Promise(v3156 => {
        pendingRestartConfirms.set(v3154, v3156);
        sendToRenderer(v2780, Channels.Account.RestartConfirmRequest, {
          requestId: v3154
        });
      });
      if (!v3155) {
        return false;
      }
    }
    const v3157 = [...bridges.entries()].map(([v3158, v3159]) => {
      if (v3159.isAlive && !v3159.isIdle) {
        return {
          sessionKey: v3158,
          tone: "warn",
          text: "账号状态已更新，进行中的任务已中断。请确认登录状态后重新发送消息。"
        };
      }
      return {
        sessionKey: v3158,
        tone: "info",
        text: "账号状态已更新，后续消息将使用当前登录账号。"
      };
    });
    for (const v3160 of bridges.values()) {
      v3160.dispose();
    }
    bridges.clear();
    bridgeAccountKeys.clear();
    if (v3157.length > 0) {
      sendToRenderer(v2780, Channels.Account.SessionNotice, v3157);
    }
    return true;
  };
  electron.ipcMain.handle(Channels.Account.Login, async (v3161, v3162, v3163, v3164, v3165) => {
    const v3166 = await loginAsync(v3162, v3163, v3164);
    if (!v3166.ok || !v3166.state) {
      return {
        ok: false,
        error: v3166.error,
        unauthorized: v3166.unauthorized,
        state: null
      };
    }
    accountStore?.setLoggedIn({
      ...v3166.state,
      serverUrl: v3162,
      token: v3166.token
    }, v3165);
    const v3167 = await v3150();
    listModelsAsync(normalizeServerUrl(v3162), v3166.token).then(v3168 => {
      if (v3168.ok) {
        setModelSlots(v3168.models);
      }
    });
    const v3169 = sanitizedAccountState();
    sendToRenderer(v2780, Channels.Account.StatePushed, v3169);
    const v3170 = focusedSessionKey || lastOpenedSessionKey;
    if (v3167 && v3170 && !v2780.isDestroyed()) {
      try {
        ensureBridge(v2780, v3170);
      } catch (v3171) {
        console.error("[main] session recovery after login failed:", v3171);
      }
    }
    offerBridgeTrustIfNeeded(v2780, false);
    return {
      ok: true,
      error: "",
      unauthorized: false,
      state: v3169
    };
  });
  electron.ipcMain.handle(Channels.Account.Me, async () => {
    if (!accountStore || !accountStore.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        unauthorized: false,
        state: null
      };
    }
    const v3172 = accountStore.current;
    const v3173 = await meAsync(v3172.serverUrl, v3172.token);
    if (v3173.ok && v3173.state) {
      accountStore.setLoggedIn({
        ...v3173.state,
        serverUrl: v3172.serverUrl,
        token: v3172.token
      }, true);
    } else if (v3173.unauthorized) {
      accountStore.clear();
      await v3150();
    }
    const v3174 = sanitizedAccountState();
    sendToRenderer(v2780, Channels.Account.StatePushed, v3174);
    return {
      ok: v3173.ok,
      error: v3173.error,
      unauthorized: v3173.unauthorized,
      state: v3174
    };
  });
  electron.ipcMain.handle(Channels.Account.Logout, async () => {
    accountStore?.clear();
    setModelSlots([]);
    await v3150();
    sendToRenderer(v2780, Channels.Account.StatePushed, sanitizedAccountState());
  });
  electron.ipcMain.handle(Channels.Account.GetState, () => sanitizedAccountState());
  electron.ipcMain.handle(Channels.Account.ListModels, async () => {
    if (!accountStore || !accountStore.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        models: []
      };
    }
    const v3175 = accountStore.current;
    const v3176 = await listModelsAsync(v3175.serverUrl, v3175.token);
    if (v3176.ok) {
      setModelSlots(v3176.models);
    }
    return v3176;
  });
  electron.ipcMain.handle(Channels.Account.RechargeQr, async (v3177, v3178) => {
    if (!accountStore || !accountStore.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        qrDataUri: "",
        outTradeNo: "",
        amount: 0
      };
    }
    const v3179 = accountStore.current;
    return createRechargeQrAsync(v3179.serverUrl, v3179.token, v3178);
  });
  electron.ipcMain.handle(Channels.Account.SubscriptionQr, async (v3180, v3181, v3182) => {
    if (!accountStore || !accountStore.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        qrDataUri: "",
        outTradeNo: "",
        amount: 0,
        priceYuan: 0,
        walletOffset: 0,
        walletRequested: false,
        walletBalanceAfter: 0,
        planId: "",
        status: "",
        expiresAt: ""
      };
    }
    const v3183 = accountStore.current;
    return createSubscriptionQrAsync(v3183.serverUrl, v3183.token, v3181, v3182);
  });
  electron.ipcMain.handle(Channels.Account.SubscriptionActivate, async (v3184, v3185, v3186) => {
    if (!accountStore?.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        unauthorized: false,
        state: null
      };
    }
    const v3187 = accountStore.current;
    const v3188 = await activateSubscriptionAsync(v3187.serverUrl, v3187.token, v3185, v3186);
    if (!v3188.ok) {
      return {
        ...v3188,
        state: null
      };
    }
    const v3189 = await meAsync(v3187.serverUrl, v3187.token);
    if (accountStore.current.token !== v3187.token) {
      return {
        ok: false,
        error: "账号已切换，请刷新后查看",
        unauthorized: false,
        state: null
      };
    }
    if (v3189.ok && v3189.state) {
      accountStore.setLoggedIn({
        ...v3189.state,
        serverUrl: v3187.serverUrl,
        token: v3187.token
      }, true);
    }
    const v3190 = sanitizedAccountState();
    sendToRenderer(v2780, Channels.Account.StatePushed, v3190);
    return {
      ok: true,
      error: v3189.ok ? "" : "套餐已启用，用量刷新暂未完成，请稍后刷新",
      unauthorized: false,
      state: v3190
    };
  });
  electron.ipcMain.handle(Channels.Account.OrderStatus, async (v3191, v3192) => {
    if (!accountStore || !accountStore.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        status: "",
        amount: 0,
        balance: 0
      };
    }
    const v3193 = accountStore.current;
    return getOrderStatusAsync(v3193.serverUrl, v3193.token, v3192);
  });
  electron.ipcMain.handle(Channels.Account.RestartConfirmResponse, (v3194, v3195, v3196) => {
    const v3197 = pendingRestartConfirms.get(v3195);
    if (!v3197) {
      return;
    }
    pendingRestartConfirms.delete(v3195);
    v3197(v3196);
  });
  electron.ipcMain.handle(Channels.Account.SubmitFeedback, async (v3198, v3199, v3200) => {
    if (!accountStore || !accountStore.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        items: []
      };
    }
    const v3201 = accountStore.current;
    return submitFeedbackAsync(v3201.serverUrl, v3201.token, v3199, v3200);
  });
  electron.ipcMain.handle(Channels.EngineSupportState, (v3202, v3203, v3204) => engineSupportReports.state(v3203, v3204));
  electron.ipcMain.handle(Channels.EngineSupportSend, (v3205, v3206, v3207) => engineSupportReports.send(v3206, v3207));
  electron.ipcMain.handle(Channels.Account.ListFeedback, async () => {
    if (!accountStore || !accountStore.current.isLoggedIn) {
      return {
        ok: false,
        error: "未登录",
        items: []
      };
    }
    const v3208 = accountStore.current;
    const v3209 = await getMyFeedbackAsync(v3208.serverUrl, v3208.token);
    if (v3209.ok) {
      v3210(v3209.items);
    }
    return v3209;
  });
  function v3211(v3212) {
    let v3213 = "";
    for (const v3214 of v3212) {
      if (v3214.repliedAt.length === 0) {
        continue;
      }
      if (v3213.length === 0 || (Date.parse(v3214.repliedAt) || 0) > (Date.parse(v3213) || 0)) {
        v3213 = v3214.repliedAt;
      }
    }
    return v3213;
  }
  function v3210(v3215) {
    const v3216 = v3211(v3215);
    if (v3216.length === 0 || !settingsStore) {
      return;
    }
    const v3217 = settingsStore.set({
      lastSeenFeedbackReplyAt: v3216
    });
    sendToRenderer(v2780, Channels.SettingsChanged, v3217);
    sendToRenderer(v2780, Channels.Account.FeedbackUnreadChanged, false);
  }
  async function v3218() {
    if (!accountStore || !accountStore.current.isLoggedIn || !settingsStore) {
      return;
    }
    const v3219 = accountStore.current;
    const v3220 = await getMyFeedbackAsync(v3219.serverUrl, v3219.token);
    if (!v3220.ok) {
      return;
    }
    const v3221 = v3211(v3220.items);
    if (v3221.length === 0) {
      return;
    }
    const v3222 = settingsStore.current.lastSeenFeedbackReplyAt;
    const v3223 = v3222.length === 0 || (Date.parse(v3221) || 0) > (Date.parse(v3222) || 0);
    sendToRenderer(v2780, Channels.Account.FeedbackUnreadChanged, v3223);
  }
  const v3224 = setInterval(v3218, 300000);
  v2780.on("focus", v3218);
  v2780.on("closed", () => clearInterval(v3224));
  v3218();
  electron.ipcMain.handle(Channels.SettingsGet, () => settingsStore?.current ?? defaultSettings());
  electron.ipcMain.handle(Channels.SettingsHotSwap, (v3225, v3226, v3227) => {
    if (!settingsStore) {
      return;
    }
    if (v3226 === "model") {
      settingsStore.set({
        selectedModelKey: v3227
      });
    } else if (v3226 === "effort") {
      settingsStore.set({
        reasoningEffort: v3227
      });
    } else if (v3226 === "permission") {
      settingsStore.set({
        permissionMode: v3227
      });
    } else if (v3226 === "language") {
      settingsStore.set({
        language: v3227
      });
    } else if (v3226 === "compact_threshold") {
      settingsStore.set({
        autoCompactThreshold: Number(v3227)
      });
    } else if (v3226 === "theme") {
      settingsStore.set({
        theme: v3227
      });
    }
    sendToRenderer(v2780, Channels.SettingsChanged, settingsStore.current);
    if (v3226 === "language" || v3226 === "compact_threshold" || v3226 === "theme") {
      return;
    }
    const v3228 = v3226 === "model" ? modelSlash(v3227) : v3226 === "effort" ? effortSlash(v3227) : permissionSlash(v3227);
    for (const [v3229, v3230] of bridges) {
      if (!v3230.isAlive) {
        continue;
      }
      const v3231 = "native-hotswap-" + Date.now() + "-" + v3229;
      try {
        v3230.send({
          id: v3231,
          prompt: v3228,
          input_kind: "slash_command",
          attachments: []
        });
      } catch {
        v3230.dispose();
        bridges.delete(v3229);
        bridgeAccountKeys.delete(v3229);
      }
    }
  });
  electron.ipcMain.handle(Channels.Update.Now, () => v2803.updateNow());
  electron.ipcMain.handle(Channels.Update.Later, () => v2803.later());
  electron.ipcMain.handle(Channels.Update.CheckNow, () => v2803.check());
  electron.ipcMain.handle(Channels.Update.GetOverlayState, () => currentUpdateOverlay);
  electron.ipcMain.handle(Channels.Announcements.GetState, () => currentAnnouncements);
  electron.ipcMain.handle(Channels.Announcements.Dismiss, (v3232, v3233) => {
    dismissedAnnouncementIds = dismissAnnouncementId(runtimeHome(), typeof v3233 === "string" ? v3233 : "");
    pushAnnouncements(v2780);
    return currentAnnouncements;
  });
  electron.ipcMain.handle(Channels.Workspace.CloseConfirmResponse, (v3234, v3235, v3236) => {
    const v3237 = pendingCloseConfirms.get(v3235);
    if (!v3237) {
      return;
    }
    pendingCloseConfirms.delete(v3235);
    v3237(v3236);
  });
  electron.ipcMain.handle(Channels.App.GetInfo, () => ({
    version: electron.app.getVersion(),
    isDev: isDev
  }));
  electron.ipcMain.handle(Channels.App.Quit, () => v2780.close());
  electron.ipcMain.handle(Channels.App.Reload, () => v2780.webContents.reload());
  electron.ipcMain.handle(Channels.App.ToggleDevTools, () => v2780.webContents.toggleDevTools());
  electron.ipcMain.handle(Channels.App.OpenExternal, (v3238, v3239) => {
    const v3240 = typeof v3239 === "string" ? v3239.trim() : "";
    if (/^https?:\/\//i.test(v3240)) {
      electron.shell.openExternal(v3240);
    }
  });
  electron.ipcMain.handle(Channels.App.SetTitleBarTheme, (v3241, v3242) => {
    const v3243 = v3242 === true;
    v2780.setTitleBarOverlay({
      color: v3243 ? "#fafafa" : "#171717",
      symbolColor: v3243 ? "#5c5c54" : "#9c9c96",
      height: 32
    });
  });
  electron.ipcMain.handle(Channels.App.OpenLocalPreview, (v3244, v3245, v3246) => {
    const v3247 = boundWorkspaces.get(v3245);
    if (!v3247) {
      return {
        ok: false,
        error: "当前会话还没有打开工程"
      };
    }
    const v3248 = v3246.toLowerCase();
    if (!/\.html?$/.test(v3248)) {
      return {
        ok: false,
        error: "只支持打开 HTML 文件"
      };
    }
    try {
      const v3249 = node_path.join(v3247.stagingRoot, v3246);
      const v3250 = resolveWithinRoot(v3249, v3247.stagingRoot);
      if (!node_fs.statSync(v3250).isFile()) {
        return {
          ok: false,
          error: "文件不存在"
        };
      }
      const v3251 = node_url.pathToFileURL(v3250).href;
      return {
        ok: true,
        fileUrl: v3251
      };
    } catch (v3252) {
      console.error("[main] refused OpenLocalPreview outside staging root: " + JSON.stringify(v3246) + " (" + v3252.message + ")");
      return {
        ok: false,
        error: "文件不在当前工程范围内"
      };
    }
  });
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      mainWindow();
    }
  });
  __byok.register({
    busy: () => Array.from(bridges.values()).some(b => b.isAlive && !b.isIdle),
    changed: (roster, model) => {
      for (const [key, bridge] of bridges) {
        bridge.dispose();
        bridges.delete(key);
        bridgeAccountKeys.delete(key);
      }
      settingsStore.set({
        selectedModelKey: "openai/" + model
      });
      setModelSlots(roster);
      // The renderer updates its model roster before broadcasting selection.
      // Broadcasting first makes the legacy store select an old fallback model.
    }
  });
  setModelSlots(__byok.models());
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("before-quit", () => {
  computerUseIndicator?.dispose();
  viewerService?.closeAll();
  for (const v3253 of bridges.values()) {
    v3253.dispose();
  }
  questionWatcher?.stop();
});