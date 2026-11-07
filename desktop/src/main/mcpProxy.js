'use strict';

const node_fs = require("node:fs");
const mcpClient = require("./chunks/mcpClient-DabeyNt0.js");
const process$1 = require("node:process");
require("child_process");
require("path");
require("fs");
require("node:stream");
require("node:crypto");
require("node:fs/promises");
require("node:path");
class ExperimentalServerTasks {
  constructor(v1) {
    this._server = v1;
  }
  requestStream(v2, v3, v4) {
    return this._server.requestStream(v2, v3, v4);
  }
  createMessageStream(v5, v6) {
    const v7 = this._server.getClientCapabilities();
    if ((v5.tools || v5.toolChoice) && !v7?.sampling?.tools) {
      throw new Error("Client does not support sampling tools capability.");
    }
    if (v5.messages.length > 0) {
      const v8 = v5.messages[v5.messages.length - 1];
      const v9 = Array.isArray(v8.content) ? v8.content : [v8.content];
      const v10 = v9.some(v11 => v11.type === "tool_result");
      const v12 = v5.messages.length > 1 ? v5.messages[v5.messages.length - 2] : undefined;
      const v13 = v12 ? Array.isArray(v12.content) ? v12.content : [v12.content] : [];
      const v14 = v13.some(v15 => v15.type === "tool_use");
      if (v10) {
        if (v9.some(v16 => v16.type !== "tool_result")) {
          throw new Error("The last message must contain only tool_result content if any is present");
        }
        if (!v14) {
          throw new Error("tool_result blocks are not matching any tool_use from the previous message");
        }
      }
      if (v14) {
        const v17 = new Set(v13.filter(v18 => v18.type === "tool_use").map(v19 => v19.id));
        const v20 = new Set(v9.filter(v21 => v21.type === "tool_result").map(v22 => v22.toolUseId));
        if (v17.size !== v20.size || ![...v17].every(v23 => v20.has(v23))) {
          throw new Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
        }
      }
    }
    return this.requestStream({
      method: "sampling/createMessage",
      params: v5
    }, mcpClient.CreateMessageResultSchema, v6);
  }
  elicitInputStream(v24, v25) {
    const v26 = this._server.getClientCapabilities();
    const v27 = v24.mode ?? "form";
    switch (v27) {
      case "url":
        {
          if (!v26?.elicitation?.url) {
            throw new Error("Client does not support url elicitation.");
          }
          break;
        }
      case "form":
        {
          if (!v26?.elicitation?.form) {
            throw new Error("Client does not support form elicitation.");
          }
          break;
        }
    }
    const v28 = v27 === "form" && v24.mode === undefined ? {
      ...v24,
      mode: "form"
    } : v24;
    return this.requestStream({
      method: "elicitation/create",
      params: v28
    }, mcpClient.ElicitResultSchema, v25);
  }
  async getTask(v29, v30) {
    return this._server.getTask({
      taskId: v29
    }, v30);
  }
  async getTaskResult(v31, v32, v33) {
    return this._server.getTaskResult({
      taskId: v31
    }, v32, v33);
  }
  async listTasks(v34, v35) {
    return this._server.listTasks(v34 ? {
      cursor: v34
    } : undefined, v35);
  }
  async cancelTask(v36, v37) {
    return this._server.cancelTask({
      taskId: v36
    }, v37);
  }
}
class Server extends mcpClient.Protocol {
  constructor(v38, v39) {
    super(v39);
    this._serverInfo = v38;
    this._loggingLevels = new Map();
    this.LOG_LEVEL_SEVERITY = new Map(mcpClient.LoggingLevelSchema.options.map((v40, v41) => [v40, v41]));
    this.isMessageIgnored = (v42, v43) => {
      const v44 = this._loggingLevels.get(v43);
      if (v44) {
        return this.LOG_LEVEL_SEVERITY.get(v42) < this.LOG_LEVEL_SEVERITY.get(v44);
      } else {
        return false;
      }
    };
    this._capabilities = v39?.capabilities ?? {};
    this._instructions = v39?.instructions;
    this._jsonSchemaValidator = v39?.jsonSchemaValidator ?? new mcpClient.AjvJsonSchemaValidator();
    this.setRequestHandler(mcpClient.InitializeRequestSchema, v45 => this._oninitialize(v45));
    this.setNotificationHandler(mcpClient.InitializedNotificationSchema, () => this.oninitialized?.());
    if (this._capabilities.logging) {
      this.setRequestHandler(mcpClient.SetLevelRequestSchema, async (v46, v47) => {
        const v48 = v47.sessionId || v47.requestInfo?.headers["mcp-session-id"] || undefined;
        const {
          level: v49
        } = v46.params;
        const v50 = mcpClient.LoggingLevelSchema.safeParse(v49);
        if (v50.success) {
          this._loggingLevels.set(v48, v50.data);
        }
        return {};
      });
    }
  }
  get experimental() {
    if (!this._experimental) {
      this._experimental = {
        tasks: new ExperimentalServerTasks(this)
      };
    }
    return this._experimental;
  }
  registerCapabilities(v51) {
    if (this.transport) {
      throw new Error("Cannot register capabilities after connecting to transport");
    }
    this._capabilities = mcpClient.mergeCapabilities(this._capabilities, v51);
  }
  setRequestHandler(v52, v53) {
    const v54 = mcpClient.getObjectShape(v52);
    const v55 = v54?.method;
    if (!v55) {
      throw new Error("Schema is missing a method literal");
    }
    let v56;
    if (mcpClient.isZ4Schema(v55)) {
      const v57 = v55;
      const v58 = v57._zod?.def;
      v56 = v58?.value ?? v57.value;
    } else {
      const v59 = v55;
      const v60 = v59._def;
      v56 = v60?.value ?? v59.value;
    }
    if (typeof v56 !== "string") {
      throw new Error("Schema method literal must be a string");
    }
    const v61 = v56;
    if (v61 === "tools/call") {
      const v62 = async (v63, v64) => {
        const v65 = mcpClient.safeParse(mcpClient.CallToolRequestSchema, v63);
        if (!v65.success) {
          const v66 = v65.error instanceof Error ? v65.error.message : String(v65.error);
          throw new mcpClient.McpError(mcpClient.ErrorCode.InvalidParams, "Invalid tools/call request: " + v66);
        }
        const {
          params: v67
        } = v65.data;
        const v68 = await Promise.resolve(v53(v63, v64));
        if (v67.task) {
          const v69 = mcpClient.safeParse(mcpClient.CreateTaskResultSchema, v68);
          if (!v69.success) {
            const v70 = v69.error instanceof Error ? v69.error.message : String(v69.error);
            throw new mcpClient.McpError(mcpClient.ErrorCode.InvalidParams, "Invalid task creation result: " + v70);
          }
          return v69.data;
        }
        const v71 = mcpClient.safeParse(mcpClient.CallToolResultSchema, v68);
        if (!v71.success) {
          const v72 = v71.error instanceof Error ? v71.error.message : String(v71.error);
          throw new mcpClient.McpError(mcpClient.ErrorCode.InvalidParams, "Invalid tools/call result: " + v72);
        }
        return v71.data;
      };
      return super.setRequestHandler(v52, v62);
    }
    return super.setRequestHandler(v52, v53);
  }
  assertCapabilityForMethod(v73) {
    switch (v73) {
      case "sampling/createMessage":
        if (!this._clientCapabilities?.sampling) {
          throw new Error("Client does not support sampling (required for " + v73 + ")");
        }
        break;
      case "elicitation/create":
        if (!this._clientCapabilities?.elicitation) {
          throw new Error("Client does not support elicitation (required for " + v73 + ")");
        }
        break;
      case "roots/list":
        if (!this._clientCapabilities?.roots) {
          throw new Error("Client does not support listing roots (required for " + v73 + ")");
        }
        break;
    }
  }
  assertNotificationCapability(v74) {
    switch (v74) {
      case "notifications/message":
        if (!this._capabilities.logging) {
          throw new Error("Server does not support logging (required for " + v74 + ")");
        }
        break;
      case "notifications/resources/updated":
      case "notifications/resources/list_changed":
        if (!this._capabilities.resources) {
          throw new Error("Server does not support notifying about resources (required for " + v74 + ")");
        }
        break;
      case "notifications/tools/list_changed":
        if (!this._capabilities.tools) {
          throw new Error("Server does not support notifying of tool list changes (required for " + v74 + ")");
        }
        break;
      case "notifications/prompts/list_changed":
        if (!this._capabilities.prompts) {
          throw new Error("Server does not support notifying of prompt list changes (required for " + v74 + ")");
        }
        break;
      case "notifications/elicitation/complete":
        if (!this._clientCapabilities?.elicitation?.url) {
          throw new Error("Client does not support URL elicitation (required for " + v74 + ")");
        }
        break;
    }
  }
  assertRequestHandlerCapability(v75) {
    if (!this._capabilities) {
      return;
    }
    switch (v75) {
      case "completion/complete":
        if (!this._capabilities.completions) {
          throw new Error("Server does not support completions (required for " + v75 + ")");
        }
        break;
      case "logging/setLevel":
        if (!this._capabilities.logging) {
          throw new Error("Server does not support logging (required for " + v75 + ")");
        }
        break;
      case "prompts/get":
      case "prompts/list":
        if (!this._capabilities.prompts) {
          throw new Error("Server does not support prompts (required for " + v75 + ")");
        }
        break;
      case "resources/list":
      case "resources/templates/list":
      case "resources/read":
        if (!this._capabilities.resources) {
          throw new Error("Server does not support resources (required for " + v75 + ")");
        }
        break;
      case "tools/call":
      case "tools/list":
        if (!this._capabilities.tools) {
          throw new Error("Server does not support tools (required for " + v75 + ")");
        }
        break;
      case "tasks/get":
      case "tasks/list":
      case "tasks/result":
      case "tasks/cancel":
        if (!this._capabilities.tasks) {
          throw new Error("Server does not support tasks capability (required for " + v75 + ")");
        }
        break;
    }
  }
  assertTaskCapability(v76) {
    mcpClient.assertClientRequestTaskCapability(this._clientCapabilities?.tasks?.requests, v76, "Client");
  }
  assertTaskHandlerCapability(v77) {
    if (!this._capabilities) {
      return;
    }
    mcpClient.assertToolsCallTaskCapability(this._capabilities.tasks?.requests, v77, "Server");
  }
  async _oninitialize(v78) {
    const v79 = v78.params.protocolVersion;
    this._clientCapabilities = v78.params.capabilities;
    this._clientVersion = v78.params.clientInfo;
    const v80 = mcpClient.SUPPORTED_PROTOCOL_VERSIONS.includes(v79) ? v79 : mcpClient.LATEST_PROTOCOL_VERSION;
    return {
      protocolVersion: v80,
      capabilities: this.getCapabilities(),
      serverInfo: this._serverInfo,
      ...(this._instructions && {
        instructions: this._instructions
      })
    };
  }
  getClientCapabilities() {
    return this._clientCapabilities;
  }
  getClientVersion() {
    return this._clientVersion;
  }
  getCapabilities() {
    return this._capabilities;
  }
  async ping() {
    return this.request({
      method: "ping"
    }, mcpClient.EmptyResultSchema);
  }
  async createMessage(v81, v82) {
    if (v81.tools || v81.toolChoice) {
      if (!this._clientCapabilities?.sampling?.tools) {
        throw new Error("Client does not support sampling tools capability.");
      }
    }
    if (v81.messages.length > 0) {
      const v83 = v81.messages[v81.messages.length - 1];
      const v84 = Array.isArray(v83.content) ? v83.content : [v83.content];
      const v85 = v84.some(v86 => v86.type === "tool_result");
      const v87 = v81.messages.length > 1 ? v81.messages[v81.messages.length - 2] : undefined;
      const v88 = v87 ? Array.isArray(v87.content) ? v87.content : [v87.content] : [];
      const v89 = v88.some(v90 => v90.type === "tool_use");
      if (v85) {
        if (v84.some(v91 => v91.type !== "tool_result")) {
          throw new Error("The last message must contain only tool_result content if any is present");
        }
        if (!v89) {
          throw new Error("tool_result blocks are not matching any tool_use from the previous message");
        }
      }
      if (v89) {
        const v92 = new Set(v88.filter(v93 => v93.type === "tool_use").map(v94 => v94.id));
        const v95 = new Set(v84.filter(v96 => v96.type === "tool_result").map(v97 => v97.toolUseId));
        if (v92.size !== v95.size || ![...v92].every(v98 => v95.has(v98))) {
          throw new Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
        }
      }
    }
    if (v81.tools) {
      return this.request({
        method: "sampling/createMessage",
        params: v81
      }, mcpClient.CreateMessageResultWithToolsSchema, v82);
    }
    return this.request({
      method: "sampling/createMessage",
      params: v81
    }, mcpClient.CreateMessageResultSchema, v82);
  }
  async elicitInput(v99, v100) {
    const v101 = v99.mode ?? "form";
    switch (v101) {
      case "url":
        {
          if (!this._clientCapabilities?.elicitation?.url) {
            throw new Error("Client does not support url elicitation.");
          }
          const v102 = v99;
          return this.request({
            method: "elicitation/create",
            params: v102
          }, mcpClient.ElicitResultSchema, v100);
        }
      case "form":
        {
          if (!this._clientCapabilities?.elicitation?.form) {
            throw new Error("Client does not support form elicitation.");
          }
          const v103 = v99.mode === "form" ? v99 : {
            ...v99,
            mode: "form"
          };
          const v104 = await this.request({
            method: "elicitation/create",
            params: v103
          }, mcpClient.ElicitResultSchema, v100);
          if (v104.action === "accept" && v104.content && v103.requestedSchema) {
            try {
              const v105 = this._jsonSchemaValidator.getValidator(v103.requestedSchema);
              const v106 = v105(v104.content);
              if (!v106.valid) {
                throw new mcpClient.McpError(mcpClient.ErrorCode.InvalidParams, "Elicitation response content does not match requested schema: " + v106.errorMessage);
              }
            } catch (v107) {
              if (v107 instanceof mcpClient.McpError) {
                throw v107;
              }
              throw new mcpClient.McpError(mcpClient.ErrorCode.InternalError, "Error validating elicitation response: " + (v107 instanceof Error ? v107.message : String(v107)));
            }
          }
          return v104;
        }
    }
  }
  createElicitationCompletionNotifier(v108, v109) {
    if (!this._clientCapabilities?.elicitation?.url) {
      throw new Error("Client does not support URL elicitation (required for notifications/elicitation/complete)");
    }
    return () => this.notification({
      method: "notifications/elicitation/complete",
      params: {
        elicitationId: v108
      }
    }, v109);
  }
  async listRoots(v110, v111) {
    return this.request({
      method: "roots/list",
      params: v110
    }, mcpClient.ListRootsResultSchema, v111);
  }
  async sendLoggingMessage(v112, v113) {
    if (this._capabilities.logging) {
      if (!this.isMessageIgnored(v112.level, v113)) {
        return this.notification({
          method: "notifications/message",
          params: v112
        });
      }
    }
  }
  async sendResourceUpdated(v114) {
    return this.notification({
      method: "notifications/resources/updated",
      params: v114
    });
  }
  async sendResourceListChanged() {
    return this.notification({
      method: "notifications/resources/list_changed"
    });
  }
  async sendToolListChanged() {
    return this.notification({
      method: "notifications/tools/list_changed"
    });
  }
  async sendPromptListChanged() {
    return this.notification({
      method: "notifications/prompts/list_changed"
    });
  }
}
class StdioServerTransport {
  constructor(v115 = process$1.stdin, v116 = process$1.stdout) {
    this._stdin = v115;
    this._stdout = v116;
    this._readBuffer = new mcpClient.ReadBuffer();
    this._started = false;
    this._ondata = v117 => {
      this._readBuffer.append(v117);
      this.processReadBuffer();
    };
    this._onerror = v118 => {
      this.onerror?.(v118);
    };
  }
  async start() {
    if (this._started) {
      throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    while (true) {
      try {
        const v119 = this._readBuffer.readMessage();
        if (v119 === null) {
          break;
        }
        this.onmessage?.(v119);
      } catch (v120) {
        this.onerror?.(v120);
      }
    }
  }
  async close() {
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    const v121 = this._stdin.listenerCount("data");
    if (v121 === 0) {
      this._stdin.pause();
    }
    this._readBuffer.clear();
    this.onclose?.();
  }
  send(v122) {
    return new Promise(v123 => {
      const v124 = mcpClient.serializeMessage(v122);
      if (this._stdout.write(v124)) {
        v123();
      } else {
        this._stdout.once("drain", v123);
      }
    });
  }
}
async function run() {
  const [v125, v126] = process.argv.slice(2);
  const v127 = JSON.parse(node_fs.readFileSync(v125, "utf8"));
  const v128 = v127.mcp.find(v129 => v129.id === v126 && v129.enabled);
  if (!v128 || v128.transport === "stdio") {
    throw new Error("MCP connection is unavailable");
  }
  const v130 = new mcpClient.Client({
    name: "plccode-remote-connector",
    version: "1.0.0"
  });
  const v131 = mcpClient.connectionTransport(v128);
  await v130.connect(v131, {
    timeout: 15000
  });
  const v132 = v130.getServerCapabilities()?.resources;
  const v133 = new Server({
    name: v128.name,
    version: "1.0.0"
  }, {
    capabilities: {
      tools: {},
      ...(v132 ? {
        resources: {}
      } : {})
    }
  });
  v133.setRequestHandler(mcpClient.ListToolsRequestSchema, v134 => v130.listTools(v134.params));
  v133.setRequestHandler(mcpClient.CallToolRequestSchema, (v135, v136) => v130.callTool(v135.params, undefined, {
    signal: v136.signal,
    timeout: 120000
  }));
  if (v132) {
    v133.setRequestHandler(mcpClient.ListResourcesRequestSchema, v137 => v130.listResources(v137.params));
    v133.setRequestHandler(mcpClient.ReadResourceRequestSchema, v138 => v130.readResource(v138.params));
  }
  let v139 = false;
  const v140 = async () => {
    if (v139) {
      return;
    }
    v139 = true;
    await v130.close().catch(() => undefined);
    await v133.close().catch(() => undefined);
  };
  process.stdin.on("end", () => void v140());
  process.on("SIGTERM", () => void v140());
  process.on("SIGINT", () => void v140());
  v133.onclose = () => void v140();
  v130.onclose = () => void v140();
  await v133.connect(new StdioServerTransport());
}
run().catch(() => {
  process.stderr.write("MCP remote connection failed. Test the connection in settings.\n");
  process.exitCode = 1;
});