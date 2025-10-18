---
description: "Task list template for feature implementation"
---

# Tasks: YAML订阅配置增强

**Input**: Design documents from `/specs/001-specify-scripts-bash/`
**Prerequisites**: plan.md (required), spec.md, research.md, data-model.md, contracts/template-editor.yaml, quickstart.md

**Tests**: 所有核心功能采用 TDD——先编写失败测试（Vitest、集成、命令契约），再实现逻辑。

**Organization**: Tasks are grouped by user story以支持独立实现与验证。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行（不同文件、无依赖）
- **[Story]**: 任务关联的用户故事（US1, US2, US3, US4）
- 任务描述内需包含明确文件路径

## Phase 1: Setup (共享基础设施)

- [X] **T001** [Setup] 在 `package.json` 中新增 `yaml` 依赖并执行 `npm install`；同步更新 `package-lock.json`。
- [X] **T002** [Setup] 在 `src-tauri/Cargo.toml` 添加 `clash-rs`（或同等解析库）与必需 feature，运行 `cargo fetch` 验证。
- [X] **T003** [Setup] 创建 `assets/template-snapshots/`、`assets/template-snapshots/.gitkeep` 并更新 `.gitignore`，确保快照/日志目录存在。

---

## Phase 2: Foundational (Blocking Prerequisites)

**目的**: 提供所有用户故事共用的验证与数据骨架。

- [X] **T004** [Foundation] 在 `src/utils/validationSchemas.ts` 定义模板 JSON Schema；同时生成 `src-tauri/src/models/template_schema.json` 供 Rust 载入。
- [X] **T005** [Foundation] 新建 `src/services/templateAPI.ts` 与 `src/services/auditLog.ts` 框架函数（调用 Tauri 命令，暂返 `TODO`）。
- [X] **T006** [Foundation] 在 `src-tauri/src/commands/templates.rs`、`src-tauri/src/services/template_service.rs`、`src-tauri/src/services/audit_log_service.rs` 创建命令/服务骨架，暂返回 `unimplemented!()`；确保编译通过。

**Checkpoint**: 骨架代码可编译，命令与服务已暴露但尚未实现业务逻辑。

---

## Phase 3: User Story 1 – 持续化订阅链接替换 (Priority: P1) 🎯 MVP

**Goal**: 只替换订阅链接字段，保留其余模板配置；保存快照与日志。
**Independent Test**: 导入包含自定义策略的模板并更新链接，dry-run 成功且除 URL 外 diff 为空。

### Tests (must fail first)
- [X] **T007** [US1] 在 `src-tauri/tests/contract/template_commands_contract_test.rs` 编写失败测试，验证 `POST /template/save` 返回 snapshotId 且 diff 仅包含链接字段。
- [X] **T008** [US1] 在 `tests/integration/template_editor_integration_test.js` 编写失败测试，模拟 UI 触发链接更新并断言 TemplateSnapshot 与 AuditLog 记录。

### Implementation
- [X] **T009** [US1] 扩展 `src-tauri/src/services/subscription_service.rs` 与 `src-tauri/src/commands/templates.rs`，实现对 `proxy-providers.*.url` 的选择性替换及冲突检测；更新 `src-tauri/src/models/template.rs` 结构。
- [X] **T010** [P] [US1] 实现 `src-tauri/src/services/template_service.rs` dry-run + snapshot 存储、10 条淘汰逻辑，并填充 `template.validate_yaml`/`template.save_snapshot` 命令。
- [X] **T011** [P] [US1] 更新前端 `src/services/subscriptionAPI.js`、`src/services/templateAPI.js` 调用新命令；在 `src/hooks/useTemplateEditor.js` 接入快照/日志刷新。
- [X] **T012** [US1] 在 `src-tauri/tests/integration/template_editor_refresh.rs` 编写通过测试，验证多订阅源更新仅影响链接字段。

**Checkpoint**: 重新运行 T007–T012 对应测试，全部通过；保存日志与快照目录生成条目 ≤10。

---

## Phase 4: User Story 2 – 结构化 YAML 编辑体验 (Priority: P1)

**Goal**: 提供可视化编辑器，含过滤助手、自定义 YAML 文本框、diff 预览与冲突提示。
**Independent Test**: 通过 UI 新增策略组并保存，diff 与 dry-run 成功；自定义 YAML 错误时提示未加载。

### Tests (must fail first)
- [X] **T013** [US2] 在 `src/components/Subscription/TemplateEditorTab/__tests__/TemplateEditorTab.test.js` 编写失败测试，断言页签渲染、权限控制、受保护模块不可删除（需提示）以及 diff 展示。
- [X] **T014** [US2] 在 `tests/ui/template-editor.spec.js` 编写 UI 流程用例，覆盖自定义 YAML 错误提示与冲突重载流程。

### Implementation
- [X] **T015** [P] [US2] 实现 `src/components/Subscription/TemplateEditorTab/index.js` 布局、表单、DiffViewer、冲突对话框整合。
- [X] **T016** [P] [US2] 实现 `src/components/Subscription/TemplateEditorTab/FilterAssistant.js`（标签 + 正则模式切换）与 `CustomConfigInput.js`（格式化 & 权限控制），并为受保护模块提供只读标识与删除前二次确认。
- [X] **T017** [P] [US2] 实现/更新 `src/hooks/useTemplateEditor.js`、`src/hooks/useYamlValidation.js`、`src/hooks/useSnapshots.js`，处理 schema 校验、dry-run、冲突刷新、回滚操作。
- [X] **T018** [US2] 在 `src/components/Subscription/SubscriptionManager.js` 注册新页签、权限守卫与 `DiffViewer` 组件；在受保护模块上接入只读/确认逻辑；更新样式 `template-editor.css`。
- [X] **T019** [US2] 更新 `src/services/auditLog.js` 展示最近 10 条日志；在 UI 加入提示 Banner。
- [X] **T020** [US2] 运行并修复 T013、T014 测试确保通过。

**Checkpoint**: 模板编辑页签完整可用；Vitest & UI 自动化通过。

---

## Phase 5: User Story 3 – 多订阅融合与最优节点选择配置 (Priority: P2)

**Goal**: 在可视化界面管理融合策略，并展示延迟测试与最优节点历史。
**Independent Test**: 配置两个地区订阅源后触发融合，UI 展示排序与失败记录；可回滚到先前快照。

### Tests (must fail first)
- [X] **T021** [US3] 在 `src/hooks/__tests__/useTemplateEditor.test.js` 添加单测，断言融合结果写入 `FusionTestResult` 数据并可回滚。
- [X] **T022** [US3] 在 `src-tauri/tests/integration/fusion_tests.rs` 编写集成测试，覆盖 `FusionTestResult` 记录与 dry-run 错误回写。

### Implementation
- [X] **T023** [P] [US3] 扩展 `src-tauri/src/services/subscription_service.rs`、`src-tauri/src/services/template_service.rs` 记录融合延迟、失败原因，并更新 `FusionTestResult` 结构。
- [X] **T024** [P] [US3] 更新 `src/components/Subscription/TemplateEditorTab/SnapshotBanner.js`，展示地区延迟、最佳节点与回滚入口。
- [X] **T025** [US3] 扩展 `useTemplateEditor.js` & `useSnapshots.js`，拉取融合结果、允许用户选取历史节点。
- [X] **T026** [US3] 在前端服务 `templateAPI.js` 新增 `getFusionHistoryFromApi`/`getTemplateLogs` 调用，配合 UI 刷新。
- [X] **T027** [US3] 运行并修复 T021、T022 测试确保通过。

**Checkpoint**: 多订阅融合流程在 UI 中可视化，历史记录与回滚可用。

---

## Phase 6: User Story 4 – 模板导入导出与安全复用 (Priority: P1)

**Goal**: 提供可口令加密的模板导出与安全导入流程，确保跨设备协作时模板不被篡改或泄露。
**Independent Test**: 经 UI 导出加密文件后，用正确口令导入恢复成功；错误口令或 dry-run 失败时保留原模板并记录日志。

### Tests (must fail first)
- [X] **T035** [US4] 在 `tests/integration/template_editor_integration_test.js`、`tests/import/export_import_failure.test.js` 与 `src-tauri/tests/contract/template_import_export_test.rs` 编写用例，验证导入导出需要口令、dry-run 失败会阻止写盘并记录日志。

### Implementation
- [X] **T031** [US4] 在 `src/services/templateAPI.js` 融合导入/导出接口，通过 Tauri 命令调度 `template.export`、`template.import`，并传递口令/密钥参数。
- [X] **T032** [US4] 在 `src/components/Subscription/TemplateEditorTab/index.js` 添加导出/导入入口及口令校验反馈。
- [X] **T033** [US4] 在导入失败时保留错误提示（更新 `ImportExportControls.js` 与 `useTemplateEditor.js`），提示口令或 dry-run 失败原因。
- [X] **T034** [US4] 在 `src-tauri/src/commands/templates.rs`、`template_service.rs` 实现本地文件加密导入导出，并确保 dry-run 校验导入内容。

**Checkpoint**: 正确口令导入成功并生成日志；错误口令或 dry-run 失败时模板未被覆盖且有错误提示。

---

## Phase N: Polish & Cross-Cutting Concerns

- [X] **T028** [Polish] 更新 `specs/001-specify-scripts-bash/quickstart.md` 步骤与调试命令，确保覆盖 dry-run、冲突与回滚示例。
- [X] **T029** [Polish] 运行全量测试套件：`npm test`, `cargo test` 并记录结果。
- [X] **T030** [Polish] 清理 `assets/template-snapshots/` 样例数据，仅保留基准快照；更新 `docs/macOS-HIG-Implementation.md`（TODO）。

---

## Dependencies & Execution Order
1. Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Polish。
2. 每个用户故事相互独立，完成前一故事后可决定是否继续下一故事。

## Parallel Opportunities
- US1: T010 & T011 分属后端/前端，可并行。 
- US2: T015/T016/T017 在不同文件，可并行；T018 需等待组件完成。 
- US3: T023/T024/T025 可并行推进，最终在 T027 汇总验证。

## Implementation Strategy
- **MVP 目标**: 完成 US1（持续化订阅链接替换 + 快照/日志），即可交付可用能力。 
- 随后依序实现图形编辑器（US2）、多订阅融合可视化（US3）与安全导入导出（US4），最终进入 Polish 阶段处理跨故事打磨事项。
