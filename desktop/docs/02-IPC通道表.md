# IPC 通道表（自动生成）

共 116 个通道常量，主进程注册 115 个。

| 通道 | preload 常量 | 方向/注册方式 | main/index.js 行 |
| --- | --- | --- | --- |
| `account:__debugForceLogin` | `Account.DebugForceLogin` | 渲染→主(invoke) | 13638 |
| `account:feedbackUnreadChanged` | `Account.FeedbackUnreadChanged` | 主→渲染 | 14009 |
| `account:getState` | `Account.GetState` | 渲染→主(invoke) | 13831 |
| `account:listFeedback` | `Account.ListFeedback` | 渲染→主(invoke) | 13956 |
| `account:listModels` | `Account.ListModels` | 渲染→主(invoke) | 13832 |
| `account:login` | `Account.Login` | 渲染→主(invoke) | 13756 |
| `account:logout` | `Account.Logout` | 渲染→主(invoke) | 13825 |
| `account:me` | `Account.Me` | 渲染→主(invoke) | 13795 |
| `account:orderStatus` | `Account.OrderStatus` | 渲染→主(invoke) | 13922 |
| `account:rechargeQr` | `Account.RechargeQr` | 渲染→主(invoke) | 13847 |
| `account:restartConfirmRequest` | `Account.RestartConfirmRequest` | 主→渲染 | 13724 |
| `account:restartConfirmResponse` | `Account.RestartConfirmResponse` | 渲染→主(invoke) | 13935 |
| `account:sessionNotice` | `Account.SessionNotice` | 主→渲染 | 13752 |
| `account:statePushed` | `Account.StatePushed` | 主→渲染 | 13914 |
| `account:submitFeedback` | `Account.SubmitFeedback` | 渲染→主(invoke) | 13943 |
| `account:subscriptionActivate` | `Account.SubscriptionActivate` | 渲染→主(invoke) | 13880 |
| `account:subscriptionQr` | `Account.SubscriptionQr` | 渲染→主(invoke) | 13860 |
| `announcements:board` | `Announcements.Board` | 主→渲染 | 11645 |
| `announcements:dismiss` | `Announcements.Dismiss` | 渲染→主(invoke) | 14074 |
| `announcements:getState` | `Announcements.GetState` | 渲染→主(invoke) | 14073 |
| `app:getInfo` | `App.GetInfo` | 渲染→主(invoke) | 14087 |
| `app:openExternal` | `App.OpenExternal` | 渲染→主(invoke) | 14094 |
| `app:openLocalPreview` | `App.OpenLocalPreview` | 渲染→主(invoke) | 14108 |
| `app:quit` | `App.Quit` | 渲染→主(invoke) | 14091 |
| `app:reload` | `App.Reload` | 渲染→主(invoke) | 14092 |
| `app:setTitleBarTheme` | `App.SetTitleBarTheme` | 渲染→主(invoke) | 14100 |
| `app:toggleDevTools` | `App.ToggleDevTools` | 渲染→主(invoke) | 14093 |
| `artifact:markDelivered` | `Artifact.MarkDelivered` | 渲染→主(invoke) | 13623 |
| `artifact:revealInFolder` | `Artifact.RevealInFolder` | 渲染→主(invoke) | 13618 |
| `artifact:stateChanged` | `Artifact.StateChanged` | 主→渲染 | 13630 |
| `canvas:checkRealFileDrift` | `CheckRealFileDrift` | 渲染→主(invoke) | 13280 |
| `canvas:discard` | `DiscardWorkspace` | 渲染→主(invoke) | 13370 |
| `canvas:readFile` | `ReadCanvasFile` | 渲染→主(invoke) | 13141 |
| `canvas:readImage` | `ReadCanvasImage` | 渲染→主(invoke) | 13174 |
| `canvas:readStagingSnapshot` | `ReadStagingSnapshot` | 渲染→主(invoke) | 13332 |
| `canvas:readUnboundFile` | `ReadUnboundCanvasFile` | 渲染→主(invoke) | 13216 |
| `canvas:writeFiles` | `WriteCanvasFiles` | 渲染→主(invoke) | 13244 |
| `canvas:writeRealFile` | `WriteRealFile` | 渲染→主(invoke) | 13350 |
| `session:__fixtureHistorySeeded` | `FixtureHistorySeeded` | 主→渲染 | 13709 |
| `session:__injectTestFixture` | `InjectTestFixture` | 渲染→主(invoke) | 13674 |
| `session:__seedFixtureHistory` | `SeedFixtureHistory` | 渲染→主(invoke) | 13708 |
| `session:adoptNativeProject` | `AdoptNativeProject` | 渲染→主(invoke) | 12974 |
| `session:agentModelConsentResponse` | `AgentModelConsentResponse` | 渲染→主(invoke) | 12603 |
| `session:answerQuestion` | `AnswerQuestion` | 渲染→主(invoke) | 12596 |
| `session:bridgeMessage` | `BridgeMessage` | 主→渲染 | 13703 |
| `session:cancel` | `Cancel` | 渲染→主(invoke) | 12571 |
| `session:delete` | `DeleteSession` | 渲染→主(invoke) | 12717 |
| `session:engineStatus` | `EngineStatus` | 主→渲染 | 13694 |
| `session:engineSupportSend` | `EngineSupportSend` | 渲染→主(invoke) | 13955 |
| `session:engineSupportState` | `EngineSupportState` | 渲染→主(invoke) | 13954 |
| `session:fork` | `ForkSession` | 渲染→主(invoke) | 12702 |
| `session:generateTitle` | `GenerateSessionTitle` | 渲染→主(invoke) | 12618 |
| `session:generateTitles` | `GenerateSessionTitles` | 渲染→主(invoke) | 12662 |
| `session:list` | `ListSessions` | 渲染→主(invoke) | 12614 |
| `session:open` | `OpenSession` | 渲染→主(invoke) | 12727 |
| `session:openNativeProject` | `OpenNativeProject` | 渲染→主(invoke) | 12957 |
| `session:pin` | `PinSession` | 渲染→主(invoke) | 12699 |
| `session:readNativeProject` | `ReadNativeProject` | 渲染→主(invoke) | 12965 |
| `session:reconnectBridge` | `ReconnectBridge` | 渲染→主(invoke) | 12549 |
| `session:rename` | `RenameSession` | 渲染→主(invoke) | 12615 |
| `session:requestCapabilities` | `RequestCapabilities` | 渲染→主(invoke) | 12561 |
| `session:restartBridge` | `RestartBridge` | 渲染→主(invoke) | 12552 |
| `session:revealInFolder` | `RevealSessionInFolder` | 渲染→主(invoke) | 12711 |
| `session:sendTurn` | `SendTurn` | 渲染→主(invoke) | 12533 |
| `session:setFocused` | `SetFocusedSession` | 渲染→主(invoke) | 12757 |
| `session:startWithSoftware` | `StartWithSoftware` | 渲染→主(invoke) | 12956 |
| `session:stopAgent` | `StopAgent` | 渲染→主(invoke) | 12582 |
| `settings:changed` | `SettingsChanged` | 主→渲染 | 14045 |
| `settings:get` | `SettingsGet` | 渲染→主(invoke) | 14015 |
| `settings:hotSwap` | `SettingsHotSwap` | 渲染→主(invoke) | 14016 |
| `tia:__debugOfferTrustInvite` | `Tia.DebugOfferTrustInvite` | 渲染→主(invoke) | 13650 |
| `tia:__debugResetTrustOrchestrator` | `Tia.DebugResetTrustOrchestrator` | 渲染→主(invoke) | 13660 |
| `tia:adminFlagDoctor` | `Tia.AdminFlagDoctor` | 渲染→主(invoke) | 13497 |
| `tia:adminFlagRepair` | `Tia.AdminFlagRepair` | 渲染→主(invoke) | 13515 |
| `tia:checkWhitelist` | `Tia.CheckWhitelist` | 渲染→主(invoke) | 13478 |
| `tia:environmentReport` | `Tia.EnvironmentReport` | 渲染→主(invoke) | 13461 |
| `tia:joinOpennessGroup` | `Tia.JoinOpennessGroup` | 渲染→主(invoke) | 13548 |
| `tia:processWatch` | `Tia.ProcessWatch` | 主→渲染 | 13611 |
| `tia:status` | `Tia.Status` | 渲染→主(invoke) | 13423 |
| `tia:statusPushed` | `Tia.StatusPushed` | 主→渲染 | 13598 |
| `tia:trustBridge` | `Tia.TrustBridge` | 渲染→主(invoke) | 13531 |
| `tia:trustInviteAccept` | `Tia.TrustInviteAccept` | 渲染→主(invoke) | 13591 |
| `tia:trustInviteDecline` | `Tia.TrustInviteDecline` | 渲染→主(invoke) | 13603 |
| `tia:trustInviteShow` | `Tia.TrustInviteShow` | 主→渲染 | 13656 |
| `tia:verifyConnection` | `Tia.VerifyConnection` | 渲染→主(invoke) | 13443 |
| `tia:versionLockRead` | `Tia.VersionLockRead` | 渲染→主(invoke) | 13561 |
| `tia:versionLockWrite` | `Tia.VersionLockWrite` | 渲染→主(invoke) | 13567 |
| `update:checkNow` | `Update.CheckNow` | 渲染→主(invoke) | 14071 |
| `update:debugOfferOverlay` | `Update.DebugOfferOverlay` | 渲染→主(invoke) | 13663 |
| `update:downloadProgress` | `Update.DownloadProgress` | 主→渲染 | 12504 |
| `update:getOverlayState` | `Update.GetOverlayState` | 渲染→主(invoke) | 14072 |
| `update:later` | `Update.Later` | 渲染→主(invoke) | 14070 |
| `update:now` | `Update.Now` | 渲染→主(invoke) | 14069 |
| `update:overlay` | `Update.Overlay` | 主→渲染 | 11620 |
| `viewer:context` | `ViewerContext` | （未在主进程注册） |  |
| `viewer:context-ack` | `ViewerContextAck` | 渲染→主(单向) | 4813 |
| `viewer:open` | `ViewerOpen` | 渲染→主(invoke) | 4824 |
| `viewer:status` | `ViewerStatus` | 渲染→主(invoke) | 4807 |
| `workbench:change` | `WorkbenchChange` | 渲染→主(invoke) | 4486 |
| `workbench:experience` | `WorkbenchExperience` | 渲染→主(invoke) | 4513 |
| `workbench:files` | `WorkbenchFiles` | 渲染→主(invoke) | 4487 |
| `workbench:get` | `WorkbenchGet` | 渲染→主(invoke) | 4485 |
| `workbench:mcp-cancel` | `WorkbenchMcpCancel` | 渲染→主(invoke) | 4511 |
| `workbench:mcp-test` | `WorkbenchMcpTest` | 渲染→主(invoke) | 4499 |
| `workbench:pick` | `WorkbenchPick` | 渲染→主(invoke) | 4488 |
| `workspace:bind` | `BindWorkspace` | 渲染→主(invoke) | 12773 |
| `workspace:close` | `CloseWorkspace` | 渲染→主(invoke) | 13133 |
| `workspace:closeConfirmRequest` | `Workspace.CloseConfirmRequest` | 主→渲染 | 12039 |
| `workspace:closeConfirmResponse` | `Workspace.CloseConfirmResponse` | 渲染→主(invoke) | 14079 |
| `workspace:createProject` | `CreateProject` | 渲染→主(invoke) | 12825 |
| `workspace:defaultProjectLocation` | `GetDefaultProjectLocation` | 渲染→主(invoke) | 12808 |
| `workspace:listDrafts` | `ListDrafts` | 渲染→主(invoke) | 13213 |
| `workspace:listRoutes` | `ListRoutes` | 渲染→主(invoke) | 12804 |
| `workspace:migrateDrafts` | `MigrateDrafts` | 渲染→主(invoke) | 13048 |
| `workspace:pickFolder` | `PickWorkspaceFolder` | 渲染→主(invoke) | 12763 |
| `workspace:pickSaveLocation` | `PickSaveLocation` | 渲染→主(invoke) | 12815 |

> 生成脚本：`scripts/gen-ipc-doc.mjs`；数据源：`src/preload/index.js`（Channels 常量）+ `src/main/index.js`（ipcMain 注册点）。

## preload 暴露的 API 方法（window.plcBridge）

共 121 个：

`viewerStatus`、`viewerOpen`、`viewerContextAck`、`onViewerContext`、`workbenchGet`、`workbenchChange`、`workbenchFiles`、`workbenchPick`、`workbenchMcpTest`、`workbenchMcpCancel`、`workbenchExperience`、`sendTurn`、`requestCapabilities`、`cancel`、`stopAgent`、`answerQuestion`、`sendAgentModelConsent`、`onBridgeMessage`、`onEngineStatus`、`filePathForFile`、`listSessions`、`openSession`、`setFocusedSession`、`reconnectBridge`、`engineSupportState`、`engineSupportSend`、`restartBridge`、`renameSession`、`generateSessionTitle`、`generateSessionTitles`、`pinSession`、`forkSession`、`revealSessionInFolder`、`deleteSession`、`pickWorkspaceFolder`、`bindWorkspace`、`listRoutes`、`createProject`、`startWithSoftware`、`openNativeProject`、`readNativeProject`、`adoptNativeProject`、`pickSaveLocation`、`getDefaultProjectLocation`、`migrateDrafts`、`listDrafts`、`closeWorkspace`、`readCanvasFile`、`readCanvasImage`、`readUnboundCanvasFile`、`writeCanvasFiles`、`checkRealFileDrift`、`readStagingSnapshot`、`writeRealFile`、`discardWorkspace`、`testFixturesEnabled`、`injectTestFixture`、`seedFixtureHistory`、`onFixtureHistorySeeded`、`accountLogin`、`accountMe`、`accountLogout`、`accountGetState`、`accountListModels`、`accountRechargeQr`、`accountSubscriptionQr`、`accountSubscriptionActivate`、`accountOrderStatus`、`accountRestartConfirmResponse`、`onAccountStatePushed`、`onAccountRestartConfirmRequest`、`accountDebugForceLogin`、`onAccountSessionNotice`、`accountSubmitFeedback`、`accountListFeedback`、`onAccountFeedbackUnreadChanged`、`settingsGet`、`settingsHotSwap`、`onSettingsChanged`、`tiaStatus`、`tiaVerifyConnection`、`tiaEnvironmentReport`、`tiaCheckWhitelist`、`tiaAdminFlagDoctor`、`tiaAdminFlagRepair`、`tiaTrustBridge`、`tiaJoinOpennessGroup`、`tiaVersionLockRead`、`tiaVersionLockWrite`、`onTiaProcessWatch`、`onTiaStatusPushed`、`onTiaTrustInviteShow`、`tiaTrustInviteAccept`、`tiaTrustInviteDecline`、`tiaDebugOfferTrustInvite`、`tiaDebugResetTrustOrchestrator`、`updateNow`、`updateLater`、`updateCheckNow`、`updateGetOverlayState`、`onUpdateOverlay`、`onUpdateDownloadProgress`、`updateDebugOfferOverlay`、`announcementsGetState`、`onAnnouncements`、`announcementsDismiss`、`onWorkspaceCloseConfirmRequest`、`workspaceCloseConfirmResponse`、`appGetInfo`、`appQuit`、`appReload`、`appToggleDevTools`、`appOpenExternal`、`appOpenLocalPreview`、`appSetTitleBarTheme`、`onArtifactStateChanged`、`artifactRevealInFolder`、`artifactMarkDelivered`、`get`、`save`、`test`