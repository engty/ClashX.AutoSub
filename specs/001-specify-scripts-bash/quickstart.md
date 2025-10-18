# Quickstart – YAML订阅配置增强

## 环境准备
1. 拉取 `001-specify-scripts-bash` 分支，执行 `npm install` 安装前端与服务端依赖。
2. 如需调用 Rust 工具链，可在 `src-tauri/` 运行 `cargo fetch` 预拉依赖。
3. 项目已提供 `yaml/user-config.yaml`，内容基于模板复制，可按实际站点更新链接与有效期策略。
4. 推荐环境：Node.js 18+、npm 10+、Rust 1.75+。

## 启动步骤
1. 运行 `npm run dev`：
   - Express API 服务（`http://localhost:3001`）负责读取/写入 `yaml/user-config.yaml`。
   - Vite 前端（`http://localhost:5173`）提供订阅源可视化管理界面。
2. 打开浏览器访问 `http://localhost:5173`，可在 **ClashX AutoSub 订阅配置** 面板中查看所有订阅源。
3. 在卡片中可修改订阅链接、设定有效期（秒数或长期有效），提交后变更会实时写回用户配置。

## 验证流程
1. 点击界面顶部的 **刷新数据** 按钮，可在外部修改 YAML 后重新加载最新内容。
2. 保存成功后右上角会显示状态提示，卡片会依据有效期阈值（≤300 秒黄色、≤60 秒红色）更新提示。
3. 若保存失败（如链接无效、写入失败等），错误信息会出现在页面上方并记录在终端输出。

## 回滚 / 快照
当前联调版本聚焦订阅链接管理，快照回滚仍沿用既有 CLI / Rust 流程：
1. 通过内部服务记录快照（参见 `template_service::persist_snapshot` 等函数）。
2. 需要恢复时，可调用 `template_service::rollback_fusion` 或等待后续 UI 集成。

## 调试命令
```
# 启动一体化联调环境
npm run dev

# 仅启动 API 服务
npm run serve

# 仅启动前端（通过代理访问 API）
npm run start:ui

# 生成前端静态资源
npm run build

# 预览构建产物
npm run preview
```

## 测试入口
- Node 侧测试：`npm test`
- Rust 契约测试：`cargo test --manifest-path src-tauri/Cargo.toml`
