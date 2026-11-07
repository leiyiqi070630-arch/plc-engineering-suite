'use strict';

const electron = require("electron");
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
const api = {
  viewerStatus: () => electron.ipcRenderer.invoke(Channels.ViewerStatus),
  viewerOpen: v1 => electron.ipcRenderer.invoke(Channels.ViewerOpen, v1),
  viewerContextAck: v2 => electron.ipcRenderer.send(Channels.ViewerContextAck, v2),
  onViewerContext: v3 => {
    const v4 = (v5, v6) => v3(v6);
    electron.ipcRenderer.on(Channels.ViewerContext, v4);
    return () => electron.ipcRenderer.removeListener(Channels.ViewerContext, v4);
  },
  workbenchGet: () => electron.ipcRenderer.invoke(Channels.WorkbenchGet),
  workbenchChange: v7 => electron.ipcRenderer.invoke(Channels.WorkbenchChange, v7),
  workbenchFiles: (v8, v9 = "") => electron.ipcRenderer.invoke(Channels.WorkbenchFiles, v8, v9),
  workbenchPick: v10 => electron.ipcRenderer.invoke(Channels.WorkbenchPick, v10),
  workbenchMcpTest: v11 => electron.ipcRenderer.invoke(Channels.WorkbenchMcpTest, v11),
  workbenchMcpCancel: () => electron.ipcRenderer.invoke(Channels.WorkbenchMcpCancel),
  workbenchExperience: v12 => electron.ipcRenderer.invoke(Channels.WorkbenchExperience, v12),
  sendTurn: (v13, v14) => electron.ipcRenderer.invoke(Channels.SendTurn, v13, v14),
  requestCapabilities: (v15, v16) => electron.ipcRenderer.invoke(Channels.RequestCapabilities, v15, v16),
  cancel: (v17, v18) => electron.ipcRenderer.invoke(Channels.Cancel, v17, v18),
  stopAgent: (v19, v20) => electron.ipcRenderer.invoke(Channels.StopAgent, v19, v20),
  answerQuestion: (v21, v22, v23) => electron.ipcRenderer.invoke(Channels.AnswerQuestion, {
    requestId: v21,
    accepted: v22,
    answer: v23
  }),
  sendAgentModelConsent: (v24, v25, v26) => electron.ipcRenderer.invoke(Channels.AgentModelConsentResponse, v24, {
    requestId: v25,
    decision: v26
  }),
  onBridgeMessage: v27 => {
    const v28 = (v29, v30) => v27(v30);
    electron.ipcRenderer.on(Channels.BridgeMessage, v28);
    return () => electron.ipcRenderer.removeListener(Channels.BridgeMessage, v28);
  },
  onEngineStatus: v31 => {
    const v32 = (v33, v34) => v31(v34);
    electron.ipcRenderer.on(Channels.EngineStatus, v32);
    return () => electron.ipcRenderer.removeListener(Channels.EngineStatus, v32);
  },
  filePathForFile: v35 => {
    try {
      const v36 = electron.webUtils.getPathForFile(v35);
      if (typeof v36 === "string" && v36.length > 0) {
        return v36;
      } else {
        return null;
      }
    } catch {
      return null;
    }
  },
  listSessions: () => electron.ipcRenderer.invoke(Channels.ListSessions),
  openSession: v37 => electron.ipcRenderer.invoke(Channels.OpenSession, v37),
  setFocusedSession: v38 => electron.ipcRenderer.invoke(Channels.SetFocusedSession, v38),
  reconnectBridge: v39 => electron.ipcRenderer.invoke(Channels.ReconnectBridge, v39),
  engineSupportState: (v40, v41) => electron.ipcRenderer.invoke(Channels.EngineSupportState, v40, v41),
  engineSupportSend: (v42, v43) => electron.ipcRenderer.invoke(Channels.EngineSupportSend, v42, v43),
  restartBridge: v44 => electron.ipcRenderer.invoke(Channels.RestartBridge, v44),
  renameSession: (v45, v46) => electron.ipcRenderer.invoke(Channels.RenameSession, v45, v46),
  generateSessionTitle: v47 => electron.ipcRenderer.invoke(Channels.GenerateSessionTitle, v47),
  generateSessionTitles: v48 => electron.ipcRenderer.invoke(Channels.GenerateSessionTitles, v48),
  pinSession: (v49, v50) => electron.ipcRenderer.invoke(Channels.PinSession, v49, v50),
  forkSession: v51 => electron.ipcRenderer.invoke(Channels.ForkSession, v51),
  revealSessionInFolder: v52 => electron.ipcRenderer.invoke(Channels.RevealSessionInFolder, v52),
  deleteSession: v53 => electron.ipcRenderer.invoke(Channels.DeleteSession, v53),
  pickWorkspaceFolder: () => electron.ipcRenderer.invoke(Channels.PickWorkspaceFolder),
  bindWorkspace: (v54, v55, v56, v57, v58) => electron.ipcRenderer.invoke(Channels.BindWorkspace, v54, v55, v56, v57, v58),
  listRoutes: () => electron.ipcRenderer.invoke(Channels.ListRoutes),
  createProject: (v59, v60, v61, v62) => electron.ipcRenderer.invoke(Channels.CreateProject, v59, v60, v61, v62),
  startWithSoftware: (v63, v64) => electron.ipcRenderer.invoke(Channels.StartWithSoftware, v63, v64),
  openNativeProject: v65 => electron.ipcRenderer.invoke(Channels.OpenNativeProject, v65),
  readNativeProject: v66 => electron.ipcRenderer.invoke(Channels.ReadNativeProject, v66),
  adoptNativeProject: v67 => electron.ipcRenderer.invoke(Channels.AdoptNativeProject, v67),
  pickSaveLocation: () => electron.ipcRenderer.invoke(Channels.PickSaveLocation),
  getDefaultProjectLocation: () => electron.ipcRenderer.invoke(Channels.GetDefaultProjectLocation),
  migrateDrafts: v68 => electron.ipcRenderer.invoke(Channels.MigrateDrafts, v68),
  listDrafts: v69 => electron.ipcRenderer.invoke(Channels.ListDrafts, v69),
  closeWorkspace: v70 => electron.ipcRenderer.invoke(Channels.CloseWorkspace, v70),
  readCanvasFile: (v71, v72) => electron.ipcRenderer.invoke(Channels.ReadCanvasFile, v71, v72),
  readCanvasImage: (v73, v74) => electron.ipcRenderer.invoke(Channels.ReadCanvasImage, v73, v74),
  readUnboundCanvasFile: (v75, v76) => electron.ipcRenderer.invoke(Channels.ReadUnboundCanvasFile, v75, v76),
  writeCanvasFiles: (v77, v78) => electron.ipcRenderer.invoke(Channels.WriteCanvasFiles, v77, v78),
  checkRealFileDrift: (v79, v80, v81) => electron.ipcRenderer.invoke(Channels.CheckRealFileDrift, v79, v80, v81),
  readStagingSnapshot: v82 => electron.ipcRenderer.invoke(Channels.ReadStagingSnapshot, v82),
  writeRealFile: (v83, v84, v85, v86) => electron.ipcRenderer.invoke(Channels.WriteRealFile, v83, v84, v85, v86),
  discardWorkspace: v87 => electron.ipcRenderer.invoke(Channels.DiscardWorkspace, v87),
  testFixturesEnabled: process.env.PLC_CODE_ENABLE_TEST_FIXTURES === "1",
  injectTestFixture: (v88, v89) => electron.ipcRenderer.invoke(Channels.InjectTestFixture, v88, v89),
  seedFixtureHistory: (v90, v91) => electron.ipcRenderer.invoke(Channels.SeedFixtureHistory, v90, v91),
  onFixtureHistorySeeded: v92 => {
    const v93 = (v94, v95) => v92(v95);
    electron.ipcRenderer.on(Channels.FixtureHistorySeeded, v93);
    return () => electron.ipcRenderer.removeListener(Channels.FixtureHistorySeeded, v93);
  },
  accountLogin: (v96, v97, v98, v99) => electron.ipcRenderer.invoke(Channels.Account.Login, v96, v97, v98, v99),
  accountMe: () => electron.ipcRenderer.invoke(Channels.Account.Me),
  accountLogout: () => electron.ipcRenderer.invoke(Channels.Account.Logout),
  accountGetState: () => electron.ipcRenderer.invoke(Channels.Account.GetState),
  accountListModels: () => electron.ipcRenderer.invoke(Channels.Account.ListModels),
  accountRechargeQr: v100 => electron.ipcRenderer.invoke(Channels.Account.RechargeQr, v100),
  accountSubscriptionQr: (v101, v102) => electron.ipcRenderer.invoke(Channels.Account.SubscriptionQr, v101, v102),
  accountSubscriptionActivate: (v103, v104) => electron.ipcRenderer.invoke(Channels.Account.SubscriptionActivate, v103, v104),
  accountOrderStatus: v105 => electron.ipcRenderer.invoke(Channels.Account.OrderStatus, v105),
  accountRestartConfirmResponse: (v106, v107) => electron.ipcRenderer.invoke(Channels.Account.RestartConfirmResponse, v106, v107),
  onAccountStatePushed: v108 => {
    const v109 = (v110, v111) => v108(v111);
    electron.ipcRenderer.on(Channels.Account.StatePushed, v109);
    return () => electron.ipcRenderer.removeListener(Channels.Account.StatePushed, v109);
  },
  onAccountRestartConfirmRequest: v112 => {
    const v113 = (v114, v115) => v112(v115);
    electron.ipcRenderer.on(Channels.Account.RestartConfirmRequest, v113);
    return () => electron.ipcRenderer.removeListener(Channels.Account.RestartConfirmRequest, v113);
  },
  accountDebugForceLogin: () => electron.ipcRenderer.invoke(Channels.Account.DebugForceLogin),
  onAccountSessionNotice: v116 => {
    const v117 = (v118, v119) => v116(v119);
    electron.ipcRenderer.on(Channels.Account.SessionNotice, v117);
    return () => electron.ipcRenderer.removeListener(Channels.Account.SessionNotice, v117);
  },
  accountSubmitFeedback: (v120, v121) => electron.ipcRenderer.invoke(Channels.Account.SubmitFeedback, v120, v121),
  accountListFeedback: () => electron.ipcRenderer.invoke(Channels.Account.ListFeedback),
  onAccountFeedbackUnreadChanged: v122 => {
    const v123 = (v124, v125) => v122(v125);
    electron.ipcRenderer.on(Channels.Account.FeedbackUnreadChanged, v123);
    return () => electron.ipcRenderer.removeListener(Channels.Account.FeedbackUnreadChanged, v123);
  },
  settingsGet: () => electron.ipcRenderer.invoke(Channels.SettingsGet),
  settingsHotSwap: (v126, v127) => electron.ipcRenderer.invoke(Channels.SettingsHotSwap, v126, v127),
  onSettingsChanged: v128 => {
    const v129 = (v130, v131) => v128(v131);
    electron.ipcRenderer.on(Channels.SettingsChanged, v129);
    return () => electron.ipcRenderer.removeListener(Channels.SettingsChanged, v129);
  },
  tiaStatus: v132 => electron.ipcRenderer.invoke(Channels.Tia.Status, v132),
  tiaVerifyConnection: (v133, v134) => electron.ipcRenderer.invoke(Channels.Tia.VerifyConnection, v133, v134),
  tiaEnvironmentReport: () => electron.ipcRenderer.invoke(Channels.Tia.EnvironmentReport),
  tiaCheckWhitelist: () => electron.ipcRenderer.invoke(Channels.Tia.CheckWhitelist),
  tiaAdminFlagDoctor: () => electron.ipcRenderer.invoke(Channels.Tia.AdminFlagDoctor),
  tiaAdminFlagRepair: v135 => electron.ipcRenderer.invoke(Channels.Tia.AdminFlagRepair, v135),
  tiaTrustBridge: (v136, v137) => electron.ipcRenderer.invoke(Channels.Tia.TrustBridge, v136, v137),
  tiaJoinOpennessGroup: v138 => electron.ipcRenderer.invoke(Channels.Tia.JoinOpennessGroup, v138),
  tiaVersionLockRead: v139 => electron.ipcRenderer.invoke(Channels.Tia.VersionLockRead, v139),
  tiaVersionLockWrite: (v140, v141) => electron.ipcRenderer.invoke(Channels.Tia.VersionLockWrite, v140, v141),
  onTiaProcessWatch: v142 => {
    const v143 = (v144, v145) => v142(v145);
    electron.ipcRenderer.on(Channels.Tia.ProcessWatch, v143);
    return () => electron.ipcRenderer.removeListener(Channels.Tia.ProcessWatch, v143);
  },
  onTiaStatusPushed: v146 => {
    const v147 = (v148, v149) => v146(v149);
    electron.ipcRenderer.on(Channels.Tia.StatusPushed, v147);
    return () => electron.ipcRenderer.removeListener(Channels.Tia.StatusPushed, v147);
  },
  onTiaTrustInviteShow: v150 => {
    const v151 = (v152, v153) => v150(v153);
    electron.ipcRenderer.on(Channels.Tia.TrustInviteShow, v151);
    return () => electron.ipcRenderer.removeListener(Channels.Tia.TrustInviteShow, v151);
  },
  tiaTrustInviteAccept: () => electron.ipcRenderer.invoke(Channels.Tia.TrustInviteAccept),
  tiaTrustInviteDecline: () => electron.ipcRenderer.invoke(Channels.Tia.TrustInviteDecline),
  tiaDebugOfferTrustInvite: v154 => electron.ipcRenderer.invoke(Channels.Tia.DebugOfferTrustInvite, v154),
  tiaDebugResetTrustOrchestrator: () => electron.ipcRenderer.invoke(Channels.Tia.DebugResetTrustOrchestrator),
  updateNow: () => electron.ipcRenderer.invoke(Channels.Update.Now),
  updateLater: () => electron.ipcRenderer.invoke(Channels.Update.Later),
  updateCheckNow: () => electron.ipcRenderer.invoke(Channels.Update.CheckNow),
  updateGetOverlayState: () => electron.ipcRenderer.invoke(Channels.Update.GetOverlayState),
  onUpdateOverlay: v155 => {
    const v156 = (v157, v158) => v155(v158);
    electron.ipcRenderer.on(Channels.Update.Overlay, v156);
    return () => electron.ipcRenderer.removeListener(Channels.Update.Overlay, v156);
  },
  onUpdateDownloadProgress: v159 => {
    const v160 = (v161, v162) => v159(v162);
    electron.ipcRenderer.on(Channels.Update.DownloadProgress, v160);
    return () => electron.ipcRenderer.removeListener(Channels.Update.DownloadProgress, v160);
  },
  updateDebugOfferOverlay: v163 => electron.ipcRenderer.invoke(Channels.Update.DebugOfferOverlay, v163),
  announcementsGetState: () => electron.ipcRenderer.invoke(Channels.Announcements.GetState),
  onAnnouncements: v164 => {
    const v165 = (v166, v167) => v164(v167);
    electron.ipcRenderer.on(Channels.Announcements.Board, v165);
    return () => electron.ipcRenderer.removeListener(Channels.Announcements.Board, v165);
  },
  announcementsDismiss: v168 => electron.ipcRenderer.invoke(Channels.Announcements.Dismiss, v168),
  onWorkspaceCloseConfirmRequest: v169 => {
    const v170 = (v171, v172) => v169(v172);
    electron.ipcRenderer.on(Channels.Workspace.CloseConfirmRequest, v170);
    return () => electron.ipcRenderer.removeListener(Channels.Workspace.CloseConfirmRequest, v170);
  },
  workspaceCloseConfirmResponse: (v173, v174) => electron.ipcRenderer.invoke(Channels.Workspace.CloseConfirmResponse, v173, v174),
  appGetInfo: () => electron.ipcRenderer.invoke(Channels.App.GetInfo),
  appQuit: () => electron.ipcRenderer.invoke(Channels.App.Quit),
  appReload: () => electron.ipcRenderer.invoke(Channels.App.Reload),
  appToggleDevTools: () => electron.ipcRenderer.invoke(Channels.App.ToggleDevTools),
  appOpenExternal: v175 => electron.ipcRenderer.invoke(Channels.App.OpenExternal, v175),
  appOpenLocalPreview: (v176, v177) => electron.ipcRenderer.invoke(Channels.App.OpenLocalPreview, v176, v177),
  appSetTitleBarTheme: v178 => electron.ipcRenderer.invoke(Channels.App.SetTitleBarTheme, v178),
  onArtifactStateChanged: v179 => {
    const v180 = (v181, v182) => v179(v182);
    electron.ipcRenderer.on(Channels.Artifact.StateChanged, v180);
    return () => electron.ipcRenderer.removeListener(Channels.Artifact.StateChanged, v180);
  },
  artifactRevealInFolder: v183 => electron.ipcRenderer.invoke(Channels.Artifact.RevealInFolder, v183),
  artifactMarkDelivered: (v184, v185) => electron.ipcRenderer.invoke(Channels.Artifact.MarkDelivered, v184, v185)
};
electron.contextBridge.exposeInMainWorld("plcBridge", api);
require("electron").contextBridge.exposeInMainWorld("modelGateway", Object.freeze({
  get: () => require("electron").ipcRenderer.invoke("model:get"),
  save: input => require("electron").ipcRenderer.invoke("model:save", input),
  test: input => require("electron").ipcRenderer.invoke("model:test", input)
}));