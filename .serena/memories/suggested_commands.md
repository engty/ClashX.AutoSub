# 推荐命令

- `npm install`：安装 Node.js 依赖（若新增前端/脚本包）。
- `npm test`：运行 JavaScript 层测试（`tests/run-tests.js`）。
- `cargo test --manifest-path src-tauri/Cargo.toml`：运行 Tauri/Rust 命令层测试。
- `bash install_dependency.sh`：安装 ClashX 所需依赖（Go、Python 等）。
- `swift build` / Xcode 工程：构建原生 ClashX 客户端（若涉及 Swift 代码）。
- `npm run dev`、`npm run build`：当前为占位脚本，后续接入真实前端流程时需更新。