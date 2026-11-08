//! 命令分发与 bridge 协议实现。
//!
//! 三种运行形态：
//! - CLI：`prompt`、`status`、`tools`、`system-prompt`
//! - bridge：stdin/stdout 上的 JSON-Lines 会话（桌面端使用）
//! - 库调用：`run()` 返回退出码

use std::io::{self, BufRead, Write};
use std::time::{SystemTime, UNIX_EPOCH};

pub const NAME: &str = "plceng-engine";
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// 已注册的工具（名, 权限）。权限：r = 只读，w = 仅工作区，d = 可写真实工程。
const TOOLS: &[(&str, &str)] = &[
    ("tia_lad_generate_block_xml", "w"),
    ("tia_sd_generate_block", "w"),
    ("tia_hmi_generate_screen_xml", "w"),
    ("tia_hmi_generate_list_xml", "w"),
    ("tia_watch_generate_table_xml", "w"),
    ("tia_lad_generate_recipe_plan", "r"),
    ("tia_openness_generate_graph_block", "w"),
    ("tia_openness_generate_source_from_blocks", "d"),
    ("tia_openness_generate_loadable_file", "d"),
    ("tia_openness_generate_web_pages_blocks", "d"),
    ("codesys_lad_generate_native", "w"),
    ("codesys_lad_generate_project_pou", "w"),
    ("codesys_lad_generate_contact_block", "w"),
    ("codesys_lad_generate_block", "w"),
    ("codesys_lad_generate_instruction", "d"),
    ("codesys_lad_generate_native_template", "w"),
    ("codesys_lad_generate_control_recipe", "r"),
    ("codesys_lad_generate_add", "d"),
    ("codesys_lad_generate_recipe_plan", "r"),
    ("codesys_lad_native_generate_instruction", "d"),
    ("codesys_lad_native_generate_instruction_batch", "d"),
    ("codesys_build_generate_code", "d"),
    ("codesys_generate_st_plan", "w"),
    ("inoproshop_lad_generate_block", "d"),
    ("inoproshop_lad_generate_contact_block", "d"),
    ("inoproshop_lad_generate_add", "d"),
    ("inoproshop_lad_generate_instruction", "d"),
    ("inoproshop_lad_native_generate_instruction", "d"),
    ("inoproshop_lad_native_generate_instruction_batch", "d"),
    ("inoproshop_object_regenerate", "d"),
    ("mitsubishi_csv_generate", "r"),
    ("mitsubishi_label_csv_generate", "w"),
];

const HELP: &str = "\
PLC Engineering Suite Engine — industrial PLC agent engine

Usage:
  plceng-engine [flags] prompt TEXT      run one prompt and exit
  plceng-engine bridge                   JSON-Lines session over stdio
  plceng-engine status                   workspace snapshot (JSON)
  plceng-engine tools                    list registered tools
  plceng-engine system-prompt            print the built-in system prompt
  plceng-engine --version | -V           print version
  plceng-engine --help | -h              print this help

Flags:
  --model MODEL                override the active model
  --permission-mode MODE       read-only | workspace-write | danger-full-access
  --output-format FORMAT       text | json (prompt mode)
  --allowedTools LIST          restrict enabled tools (comma separated)
";

fn system_prompt() -> &'static str {
    "\
You are PLC Engineering Suite — an industrial control engineer. You design, generate, inspect and repair
real PLC programs for Siemens TIA Portal, Mitsubishi GX Works, Inovance InoProShop/CODESYS,
AutoShop and Weinview EasyBuilder.

Work directly toward the requested artifact. Compiler and tool diagnostics are feedback for
repair, not a precondition for starting.

Verification discipline:
- A clean compile never proves correct behaviour.
- Distinguish four levels: imported, compiled, structure readback correct, runtime behaviour correct.
- When a tool returns a concrete error, adjust the affected input and continue from the current state.
- Never reuse a write receipt as evidence of a new operation.

Safety:
- Do not modify a user's live project directly; stage changes and promote them explicitly.
- Declare unsupported shapes instead of emitting something that only looks correct.
"
}

fn session_id() -> String {
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("sess-{:x}", nanos & 0xffff_ffff)
}

fn print_help() {
    print!("{}", HELP);
}

fn cmd_status() {
    let cwd = std::env::current_dir()
        .map(|p| p.display().to_string())
        .unwrap_or_default();
    println!(
        "{{\"engine\":\"{}\",\"version\":\"{}\",\"cwd\":\"{}\",\"tools\":{},\"session\":\"{}\"}}",
        NAME,
        VERSION,
        json_escape(&cwd),
        TOOLS.len(),
        session_id()
    );
}

fn cmd_tools(as_json: bool) {
    if as_json {
        let items: Vec<String> = TOOLS
            .iter()
            .map(|(n, p)| {
                let perm = match *p {
                    "r" => "ReadOnly",
                    "w" => "WorkspaceWrite",
                    _ => "DangerFullAccess",
                };
                format!("{{\"name\":\"{}\",\"permission\":\"{}\"}}", n, perm)
            })
            .collect();
        println!("{{\"tools\":[{}]}}", items.join(","));
    } else {
        for (n, p) in TOOLS {
            let perm = match *p {
                "r" => "ReadOnly",
                "w" => "WorkspaceWrite",
                _ => "DangerFullAccess",
            };
            println!("{:<52} {}", n, perm);
        }
    }
}

fn json_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out
}

fn capabilities_json() -> String {
    let items: Vec<String> = TOOLS
        .iter()
        .map(|(n, p)| {
            let perm = match *p {
                "r" => "ReadOnly",
                "w" => "WorkspaceWrite",
                _ => "DangerFullAccess",
            };
            format!("{{\"name\":\"{}\",\"permission\":\"{}\"}}", n, perm)
        })
        .collect();
    format!(
        "{{\"type\":\"capabilities\",\"engine\":\"{}\",\"version\":\"{}\",\"tools\":[{}]}}",
        NAME,
        VERSION,
        items.join(",")
    )
}

/// bridge 模式：一行一条 JSON。
fn cmd_bridge() -> i32 {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut out = stdout.lock();

    let sid = session_id();
    let _ = writeln!(out, "{{\"type\":\"ready\",\"session_id\":\"{}\"}}", sid);
    let _ = out.flush();

    for line in stdin.lock().lines() {
        let Ok(line) = line else { break };
        let t = line.trim();
        if t.is_empty() {
            continue;
        }
        if t.contains("\"command\"") && t.contains("shutdown") {
            let _ = writeln!(out, "{{\"type\":\"shutdown\"}}");
            let _ = out.flush();
            break;
        }
        if t.contains("\"command\"") && t.contains("capabilities") {
            let _ = writeln!(out, "{}", capabilities_json());
            let _ = out.flush();
            continue;
        }
        if t.contains("\"command\"") && t.contains("cancel") {
            let _ = writeln!(
                out,
                "{{\"type\":\"event\",\"event\":\"cancelled\",\"session_id\":\"{}\"}}",
                sid
            );
            let _ = out.flush();
            continue;
        }
        if t.contains("\"prompt\"") {
            let _ = writeln!(
                out,
                "{{\"type\":\"turn\",\"session_id\":\"{}\",\"text\":\"{}\"}}",
                sid,
                json_escape("模型未配置：请在桌面端「自备模型」页填写服务地址与密钥后重试。")
            );
            let _ = out.flush();
            continue;
        }
        let _ = writeln!(
            out,
            "{{\"type\":\"event\",\"event\":\"ignored\",\"session_id\":\"{}\"}}",
            sid
        );
        let _ = out.flush();
    }
    0
}

/// 进程入口。
pub fn run(args: Vec<String>) -> i32 {
    let mut permission = String::from("workspace-write");
    let mut model: Option<String> = None;
    let mut format = String::from("text");
    let mut rest: Vec<String> = Vec::new();

    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--model" => {
                i += 1;
                model = args.get(i).cloned();
            }
            "--permission-mode" => {
                i += 1;
                if let Some(v) = args.get(i) {
                    permission = v.clone();
                }
            }
            "--output-format" => {
                i += 1;
                if let Some(v) = args.get(i) {
                    format = v.clone();
                }
            }
            "--allowedTools" => {
                i += 1;
            }
            f => rest.push(f.to_string()),
        }
        i += 1;
    }

    let _ = (&permission, &model);

    match rest.first().map(|s| s.as_str()) {
        None => {
            print_help();
            0
        }
        Some("--version") | Some("-V") | Some("version") => {
            println!("{} {}", NAME, VERSION);
            0
        }
        Some("--help") | Some("-h") | Some("help") => {
            print_help();
            0
        }
        Some("status") => {
            cmd_status();
            0
        }
        Some("tools") => {
            cmd_tools(format == "json");
            0
        }
        Some("system-prompt") => {
            print!("{}", system_prompt());
            0
        }
        Some("bridge") => cmd_bridge(),
        Some("prompt") => {
            let text = rest.get(1).cloned().unwrap_or_default();
            if format == "json" {
                println!(
                    "{{\"ok\":false,\"error\":\"model_not_configured\",\"input\":\"{}\"}}",
                    json_escape(&text)
                );
            } else {
                eprintln!(
                    "模型未配置：请在桌面端「自备模型」页填写服务地址与密钥后重试。"
                );
            }
            1
        }
        Some(other) => {
            eprintln!("未知命令: {}", other);
            print_help();
            2
        }
    }
}
