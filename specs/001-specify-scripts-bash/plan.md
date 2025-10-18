# Implementation Plan: YAML订阅配置增强

**Branch**: `001-specify-scripts-bash` | **Date**: 2025-10-18 | **Spec**: [/specs/001-specify-scripts-bash/spec.md](/specs/001-specify-scripts-bash/spec.md)
**Input**: Feature specification from `/specs/001-specify-scripts-bash/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

在现有 ClashX.AutoSub 项目中，引入可视化模板编辑能力：于 `SubscriptionManager` 增设“模板编辑”页签，支持结构化表单、可视化过滤助手与受权限控制的 YAML 文本框，确保订阅链接仅替换 URL 字段而保留自定义配置，并提供口令加密的导入导出流程；配合 dry-run 校验、快照/日志与融合测试扩展，实现模板持续优化与可恢复运营。

## Technical Context

**语言 / 版本**: TypeScript (React 18) · Node 18 LTS · Rust 1.75 / Tauri 2.0  
**主要依赖**: React, @tauri-apps/api, TailwindCSS, Zustand, Vitest, `yaml`, tauri-plugin-notification / updater / process / opener / log  
**存储**: 本地文件（经 `crypto_service` 加密保存订阅、模板、快照、日志）  
**测试**: Vitest、tests/ui（WebDriver）、tests/unit、tests/integration、src-tauri/tests（cargo test）  
**目标平台**: macOS 13+ 桌面客户端（Tauri 应用）  
**项目类型**: 单仓 React 前端 + Rust Tauri 宿主  
**性能目标**: UI 渲染 60fps；批量订阅刷新 < 5 分钟；dry-run 验证 < 2 秒；前端交互主线程响应 < 150ms  
**约束**: 敏感数据必须加密保存；命令需幂等可重试；遵循 macOS HIG 指南；自定义 YAML 编辑仅限授权用户  
**规模 / 范围**: 单终端桌面应用；影响订阅管理、模板编辑、日志/快照与融合测试模块

## Constitution Check

*门槛：在 Phase 0 研究前必须全部满足，并在 Phase 1 设计完成后复查。*

- **命令驱动架构**：新增 `template.validate_yaml`、`template.save_snapshot` 等命令，更新 `subscription.update_links`；前端通过 `templateAPI`、`auditLog` 调用；需生成合同测试验证参数。  
- **敏感数据加密与最小持久化**：模板、快照、日志继续使用 `crypto_service` 命名空间存储；自定义 YAML 失败不写盘；导出文件需使用口令或对称密钥加密，导入前验证并写入审计日志。  
- **macOS 原生体验一致性**：`SubscriptionManager` 新页签复用 `TabbedNavigation`、`ValidatedForm`、`DiffViewer` 等 UI 组件并覆盖暗/亮模式。  
- **可恢复的自动化运营**：dry-run、融合测试与快照管理在 Rust 服务中实现自动回滚、日志保留 10 条，并提供失败提示。  
- **全链路测试准入**：新增/扩充 Vitest、tests/ui、integration、src-tauri/tests 套件，遵循先写失败测试。  

*当前评估：全部门槛具备明确方案，无阻塞项。*

## Project Structure

### Documentation (this feature)

```
specs/001-specify-scripts-bash/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── template-editor.yaml
└── tasks.md
```

### Source Code (repository root)

```
src/
├── components/
│   ├── Subscription/
│   │   ├── SubscriptionManager.tsx
│   │   └── TemplateEditorTab/
│   │       ├── index.tsx
│   │       ├── CustomConfigInput.tsx
│   │       ├── FilterAssistant.tsx
│   │       └── SnapshotBanner.tsx
│   └── UI/
│       ├── TabbedNavigation.tsx
│       ├── DiffViewer.tsx
│       └── ConflictDialog.tsx
├── hooks/
│   ├── useTemplateEditor.ts
│   ├── useYamlValidation.ts
│   └── useSnapshots.ts
├── services/
│   ├── subscriptionAPI.ts
│   ├── templateAPI.ts
│   ├── auditLog.ts
│   └── yamlTransform.ts
├── utils/
│   └── validationSchemas.ts
├── types/
│   └── template.ts
└── styles/
    └── template-editor.css

src-tauri/
├── src/
│   ├── commands/
│   │   ├── templates.rs
│   │   └── subscriptions.rs
│   ├── services/
│   │   ├── template_service.rs
│   │   ├── subscription_service.rs
│   │   └── audit_log_service.rs
│   ├── models/
│   │   └── template.rs
│   └── utils/
│       └── yaml.rs
├── tauri.conf.json
└── Cargo.toml

tests/
├── unit/
│   ├── TemplateEditorTab.test.tsx
│   ├── CustomConfigInput.test.tsx
│   └── useYamlValidation.test.ts
├── integration/
│   └── templateEditor.integration.test.ts
├── contract/
│   └── template-commands.contract.test.ts
├── ui/
│   └── template-editor.spec.ts
└── utils/
    └── testSchemas.ts

assets/
└── template-snapshots/
    ├── default.yaml
    └── sample-history.json

docs/
└── macOS-HIG-Implementation.md
```

**Structure Decision**: 保持单仓结构，围绕 Subscription 模块新增模板编辑页签及相关 Hook/服务/测试，并在 Tauri 端扩展模板与日志处理命令及服务。

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

## Phase 0 – Research & Discovery

### Objectives
- 明确 dry-run 校验实现方式（Rust 侧调用 Clash 内核还是自研解析）。
- 确认 YAML schema（订阅源、策略组、自定义配置）与 UI 字段映射规则。
- 评估权限控制方案（沿用现有设置还是新增角色粒度）。

### Tasks
1. Research dry-run 实现选项：调用现有 Clash 核心、引入 `clash-rs` crate、或编写轻量校验器。
2. 调研 YAML ↔ JSON schema 转换与格式化库，确定可用于前后端的统一 schema。
3. 收集 macOS 原生页签与 diff 组件设计指引，确保 TemplateEditorTab 体验一致。
4. 评估当前权限体系，制定仅授权用户可编辑自定义 YAML 的方案。
5. 选择模板导出加密与口令管理策略（沿用 `crypto_service` 或新增安全模块），确定失败回滚流程。

### Deliverable
- `/specs/001-specify-scripts-bash/research.md`（包含决策、理由、备选方案）。

## Phase 1 – Design, Data & Contracts

**前置**：Phase 0 研究完成并清除所有 NEEDS CLARIFICATION。

### Tasks
1. 编写 `data-model.md`，定义 TemplateSnapshot、FusionTestResult、AuditLogEntry、CustomConfig 等实体字段、约束与关系。
2. 生成 `/contracts/template-editor.yaml`（OpenAPI），覆盖 `POST /template/validate`、`POST /template/save`、`POST /template/export`（含口令参数）、`POST /template/import`、`GET /template/snapshots`、`GET /template/logs` 等接口。
3. 撰写 `quickstart.md`，说明如何启用模板编辑页签、运行 dry-run、查看快照与回滚。
4. 准备 `tasks.md` 骨架，为 `/speckit.tasks` 阶段提供输入。
5. 运行 `.specify/scripts/bash/update-agent-context.sh codex`，在 Codex agent context 记录新增技术栈（YAML schema、dry-run、模板命令等）。

### Constitution Re-check
- 确认命令驱动、加密存储、macOS UI、可恢复运营、测试准入五项要求均由设计覆盖。

## Phase 2 – Implementation Outline

### Frontend
1. 构建 `TemplateEditorTab`：页签布局、Diff 预览、自定义 YAML 文本框、过滤助手、受保护模块只读提示与冲突处理。
2. 实现 `FilterAssistant`（标签 + 正则切换）、`DiffViewer`、`ConflictDialog` 组件。
3. 扩展 `useTemplateEditor`、`useYamlValidation`、`useSnapshots` hooks，处理 schema 校验、dry-run、冲突检测、快照回滚。
4. 扩展 `templateAPI`、`auditLog` 服务，串联命令调用与日志展示。
5. 实现导入/导出对话框与口令输入流程，处理 dry-run 失败与错误提示。

### Backend (Rust)
1. 在 `template_service` 中实现 schema 校验、dry-run、快照保存/回滚、自定义 YAML 格式化，并在导出时使用口令加密。
2. 新增 `audit_log_service`（循环保留 10 条记录），暴露查询接口，记录导入导出成功与失败原因。
3. 更新 `templates.rs` 命令集：`validate_yaml`, `save_template`, `export_template`, `import_template`, `get_snapshots`, `get_logs`，并处理口令验证失败。
4. 扩展 `subscription_service` 支持录入 dry-run 信息与融合测试结果的关联。

### Testing & Operations
1. 先编写 Vitest 单测（组件/Hooks）再实现逻辑，确保红→绿流程。
2. 编写 `tests/ui` 测试，覆盖模板编辑、dry-run 失败、冲突处理、自定义配置错误提示。
3. 更新 `src-tauri/tests`，验证命令契约与 dry-run 返回值。
4. 配置定时任务或钩子，清理超出 10 条的快照/日志文件，并在 quickstart 提供指引。

### Delivery Milestones
- **US1**：实现订阅链接替换、快照与审计日志，作为最小可用版本。
- **US2**：交付可视化模板编辑器（含受保护模块与过滤助手）。
- **US3**：完成多订阅融合与延迟可视化，确保策略自动化生效。
- **US4**：上线口令加密的模板导入导出流程，满足跨设备安全协作。

## Deliverables
- `research.md`、`data-model.md`、`contracts/template-editor.yaml`、`quickstart.md`、`tasks.md`
- 更新后的 Codex agent context
- 满足宪章门槛的设计方案概述
