# 风格与约定

- JS/TS 采用 ECMAScript Modules (`import`/`export`)，保持函数式、无类实现风格，必要时添加简洁中文注释说明复杂逻辑。
- Rust 遵循 2021 edition 与 `anyhow`/`thiserror` 错误处理惯例，模块按功能拆分（如 commands、services、models）。
- YAML 模板需保持 Clash 规范字段顺序，订阅站点使用中文标识，注意缩进与键名一致性。
- 提交信息要求使用中文描述，并在实现前先更新规格/任务。
- 文档（.md）需使用中文说明，代码片段保持原文。