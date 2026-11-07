# BYOK 改造（2.1.20）

把账号/订阅体系整段摘掉，改为本地自备模型。原理与验证见 `../desktop/docs/07-版本演进-2.1.20.md`。

## 文件

| 文件 | 作用 |
| --- | --- |
| `inject-byok-2.1.20.py` | 对目标安装包注入 IPC 闸门、账号接管、网络收口 |
| `byok-main.cjs` | 本地 OpenAI 兼容代理（密钥加密、协议互转） |
| `provider-discovery.cjs` | 端点与能力探测 |
| `provider-protocol.cjs` | OpenAI ↔ Anthropic 互转与流式中继 |
| `byok-model-catalog.json` | 模型能力表 |
| `seed.example.json` | 配置模板 |

## 用法

```bash
# 1) 解包目标 app.asar 到 <work>/v2120/full
# 2) 注入
python inject-byok-2.1.20.py <work> <原 app.asar 路径>
# 3) 把 out/main/{byok-main.cjs,provider-*.cjs,byok-model-catalog.json} 放进解包目录
# 4) 用 app 目录替代 app.asar 组装发行版（Electron 优先加载 asar，必须移除）
# 5) 首次运行前放置配置种子：
#    <安装目录>\data\runtime\byok-provider.seed.json
```

配置示例：

```json
{
  "name": "自备模型",
  "baseUrl": "https://api.example.com/v1",
  "defaultModel": "your-model-id",
  "models": ["your-model-id"],
  "maxTokens": 8192,
  "apiKey": "sk-your-key",
  "protocol": "auto"
}
```

`protocol` 可为 `auto` / `openai` / `anthropic`。导入后写入 `byok-provider.json`，
密钥用系统级加密（Windows DPAPI）存储，明文不落盘。
