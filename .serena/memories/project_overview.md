# 项目概览

- **定位**：ClashX.AutoSub 基于 ClashX 的 Mac 端代理客户端，目标是在现有 ClashX/Clash.Meta 架构上扩展 YAML 订阅模板的自动化编辑、导入导出与多订阅融合能力。
- **主要模块**：
  - `src/`：前端/脚本逻辑（ESM JavaScript），包含订阅模板编辑器、状态管理与服务层占位实现。
  - `src-tauri/`：Rust Tauri 命令层，负责模板校验、订阅链接更新、快照与融合记录等后端逻辑。
  - `yaml/template.yaml`：项目的默认 Clash 配置模板，涵盖多订阅站点与融合策略。
  - `docs/`、`specs/`：产品规范、计划与文档。
  - 原有 `ClashX` Swift 工程保留，用于核心客户端。
- **技术栈**：Swift (macOS 客户端)、Rust + Tauri、Node.js (脚本/测试)、YAML 配置。JS 代码使用 ECMAScript Modules。
- **当前状态**：yaml 模板已手动更新；部分前端服务仍为内存占位，需要后续接入真实 UI 与后端命令。