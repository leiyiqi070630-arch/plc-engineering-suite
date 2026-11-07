# 工具契约索引

共 32 个生成器工具，按权限分组。完整 schema 见 `tools/<name>.json`。

| 工具 | 权限 | 参数 | 必填 |
| --- | --- | --- | --- |
| `codesys_build_generate_code` | DangerFullAccess | 0 | — |
| `codesys_lad_generate_add` | DangerFullAccess | 3 | name, confirm, disposable |
| `codesys_lad_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable |
| `codesys_lad_native_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable |
| `codesys_lad_native_generate_instruction_batch` | DangerFullAccess | 8 | name, networks, confirm, disposable |
| `inoproshop_lad_generate_add` | DangerFullAccess | 3 | name, confirm, disposable |
| `inoproshop_lad_generate_block` | DangerFullAccess | 3 | plan, confirm, disposable |
| `inoproshop_lad_generate_contact_block` | DangerFullAccess | 4 | plan, confirm, disposable |
| `inoproshop_lad_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable |
| `inoproshop_lad_native_generate_instruction` | DangerFullAccess | 3 | instruction, confirm, disposable |
| `inoproshop_lad_native_generate_instruction_batch` | DangerFullAccess | 8 | name, networks, confirm, disposable |
| `inoproshop_object_regenerate` | DangerFullAccess | 8 | target, kind, confirm, disposable |
| `tia_openness_generate_loadable_file` | DangerFullAccess | 9 | device_name, output_path, confirm |
| `tia_openness_generate_source_from_blocks` | DangerFullAccess | 8 | output_path, confirm |
| `tia_openness_generate_web_pages_blocks` | DangerFullAccess | 9 | html_directory, default_page, confirm |
| `codesys_lad_generate_control_recipe` | ReadOnly | 5 | recipe, name |
| `codesys_lad_generate_recipe_plan` | ReadOnly | 4 | recipe |
| `mitsubishi_csv_generate` | ReadOnly | 3 | family, rungs |
| `tia_lad_generate_recipe_plan` | ReadOnly | 5 | recipe_id, block_name |
| `codesys_generate_st_plan` | WorkspaceWrite | 5 | name, implementation, confirm, disposable |
| `codesys_lad_generate_block` | WorkspaceWrite | 8 | name, networks, confirm, disposable |
| `codesys_lad_generate_contact_block` | WorkspaceWrite | 4 | plan, confirm, disposable |
| `codesys_lad_generate_native` | WorkspaceWrite | 8 | name, networks, confirm, disposable |
| `codesys_lad_generate_native_template` | WorkspaceWrite | 4 | instruction, name, confirm, disposable |
| `codesys_lad_generate_project_pou` | WorkspaceWrite | 6 | name, networks, confirm, disposable |
| `mitsubishi_label_csv_generate` | WorkspaceWrite | 4 | path, labels |
| `tia_hmi_generate_list_xml` | WorkspaceWrite | 2 | plan |
| `tia_hmi_generate_screen_xml` | WorkspaceWrite | 2 | plan |
| `tia_lad_generate_block_xml` | WorkspaceWrite | 8 | — |
| `tia_openness_generate_graph_block` | WorkspaceWrite | 3 | plan |
| `tia_sd_generate_block` | WorkspaceWrite | 3 | plan |
| `tia_watch_generate_table_xml` | WorkspaceWrite | 3 | plan |
