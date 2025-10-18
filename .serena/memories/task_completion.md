# 任务完成指引

1. 更新相关规范/计划（位于 `.specify/`、`specs/`）保持与实现一致。
2. 运行 `npm test` 以及必要时的 `cargo test --manifest-path src-tauri/Cargo.toml` 验证前后端逻辑。
3. 若改动 Swift/Tauri 需通过 Xcode 或 `swift build`/`cargo build` 确认可编译。
4. 检查 `yaml/template.yaml` 或其他配置文件无非预期覆盖，并确保中文文档同步。
5. 最终提交前整理中文提交说明，提示后续验证步骤。