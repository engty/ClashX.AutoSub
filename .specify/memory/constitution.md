<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified sections: 交付流程与审查（新增交互式对话前提交摘要 commit 要求）
Added sections: 无
Removed sections: 无
Templates requiring updates:

- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
Follow-up TODOs: 无
-->
# ClashX AutoSub Constitution

## Core Principles

### I. 命令驱动架构
- 所有跨进程能力必须在 `src-tauri/src/commands` 中实现为 Tauri 命令，并保持幂等；新增命令需同步更新 `tauri.conf.json` 与前端类型。
- 前端逻辑必须通过 `src/services` 或业务 Hook 调用命令，禁止在组件中直接 `invoke` 未封装的指令。
- 修改命令签名时必须先更新 `tests/contract`、`tests/ui` 或 `src-tauri/tests/contract` 契约测试并观察失败，再调整实现与文档。
**理由**：统一命令入口确保前后端行为一致，便于审计、回滚与未来扩展。

### II. 敏感数据加密与最小持久化
- 处理订阅、凭证、备份的代码必须通过 `crypto_service`、`storage.ts` 等封装进行加密与命名空间隔离，禁止明文落盘。
- 所有新增敏感字段必须在模型（如 `AppConfig`、`Subscription`）中声明加密策略，并同步更新备份/恢复流程与校验。
- 发布前需验证导入、导出、自动备份路径在成功与失败场景下均不泄露敏感数据。
**理由**：项目直接管理用户订阅与凭证，强制加密与最小持久化可降低泄露风险并维护信任。

### III. macOS 原生体验一致性
- UI 变更必须复用 `src/components/UI` 与主题 Hook（`useTheme`、`useMacOSTheme`），遵循 `docs/macOS-HIG-Implementation.md` 指南。
- 新增界面需覆盖暗/亮模式、窗口尺寸、托盘状态（若适用）测试，可通过 Vitest snapshot、`tests/ui` 脚本或手动脚本记录。
- 引入第三方样式或视觉偏差时必须在规格文档中记录原因、持续时间与回滚方案。
**理由**：macOS 原生体验是核心卖点，统一组件与主题可保持一致性、提升可维护性。

### IV. 可恢复的自动化运营
- 自动更新、批量订阅、托盘、系统集成等长期任务必须复用 `src-tauri/src/services` 中的对应服务，并输出可追踪的进度与日志。
- 批量或长时操作需设计失败重试与回滚策略，并在 UI 中通过 `RealTimeStatusIndicator`、`Toast` 等组件提示状态。
- 任何可能影响运行稳定性的改动必须提供调试日志开关与备份路径验证，确保异常时可恢复。
**理由**：保持自动化能力可用且可恢复，能够降低运维成本并保护用户体验。

### V. 全链路测试准入
- 每个功能必须先编写 Vitest 单元/组件测试并运行失败，再实现功能；影响 Rust 后端时需同步编写 `cargo test` 用例。
- 涉及命令协议或 UI 流程的改动必须更新 `tests/ui` 或集成测试，确保端到端路径可回归。
- 若出现无法立即覆盖的测试缺口，必须在计划与规格中记录并获得维护者批准。
**理由**：前端与 Tauri 端的多层测试是保证桌面应用稳定性的根基。

## 技术栈与兼容性约束

- **前端栈**：React 18 + TypeScript + Vite + TailwindCSS；新增依赖需评估体积、Tree Shaking 效果与 macOS 原生视觉一致性。
- **桌面宿主**：Tauri 2.0（Rust 2021）；命令需异步实现，禁止阻塞主线程或破坏多平台兼容性。
- **插件**：默认启用通知、更新、进程、打开器、日志插件；新增或调整插件需更新 `tauri.conf.json` 并提供安全评估。
- **资源管理**：图标与模板置于 `assets/`，必须说明来源与使用许可；相关文档更新同步至 `docs/`。

## 交付流程与审查

- **文档链路**：新增功能前需完成 `specs/[feature]/` 下的 spec → plan → tasks 闭环，并在计划中的 “Constitution Check” 逐项确认。
- **评审资料**：PR 必须引用受影响的命令、服务、组件与文档，附带 Vitest、`npm run test:coverage`（如适用）、`cargo test`、关键 UI 测试结果。
- **交互提交**：在交互式对话中若需修改代码，动手前必须基于当次对话撰写简明摘要并完成一次 git commit（使用中文注释），以便后续可通过版本回滚撤销对应改动。
- **发布与回滚**：涉及配置结构或数据迁移时，需提供迁移脚本与回滚方案，并在发布说明中列明。
- **运行验证**：发布候选版本必须进行 Tauri 打包 Smoke 测试，覆盖订阅更新、备份恢复、托盘操作等核心流程。

## Governance

- 宪章优先于其它流程文档；若出现冲突，必须先更新宪章或相关文档以恢复一致。
- 修订流程：提案需附带影响分析、版本号建议与迁移/沟通计划，经项目维护者审查后方可合并。
- 版本策略：遵循语义化版本，新增原则或治理扩展记为 MINOR，原则重写或移除记为 MAJOR，措辞澄清记为 PATCH。
- 合规审查：每次发布或里程碑前由维护者执行宪章核查，并在发布说明或 `docs/` 中记录结果。

**Version**: 1.1.0 | **Ratified**: 2025-10-18 | **Last Amended**: 2025-10-18
