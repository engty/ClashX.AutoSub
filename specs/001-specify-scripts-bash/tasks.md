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

- [ ] **T001** [Setup] 在 `package.json` 中新增 `yaml` 依赖并执行 `npm install`；同步更新 `package-lock.json`。
- [ ] **T002** [Setup] 在 `src-tauri/Cargo.toml` 添加 `clash-rs`（或同等解析库）与必需 feature，运行 `cargo fetch` 验证。
- [ ] **T003** [Setup] 创建 `assets/template-snapshots/`、`assets/template-snapshots/.gitkeep` 并更新 `.gitignore`，确保快照/日志目录存在。

---

## Phase 2: Foundational (Blocking Prerequisites)

**目的**: 提供所有用户故事共用的验证与数据骨架。

- [ ] **T004** [Foundation] 在 `src/utils/validationSchemas.ts` 定义模板 JSON Schema；同时生成 `src-tauri/src/models/template_schema.json` 供 Rust 载入。
- [ ] **T005** [Foundation] 新建 `src/services/templateAPI.ts` 与 `src/services/auditLog.ts` 框架函数（调用 Tauri 命令，暂返 `TODO`）。
- [ ] **T006** [Foundation] 在 `src-tauri/src/commands/templates.rs`、`src-tauri/src/services/template_service.rs`、`src-tauri/src/services/audit_log_service.rs` 创建命令/服务骨架，暂返回 `unimplemented!()`；确保编译通过。

**Checkpoint**: 骨架代码可编译，命令与服务已暴露但尚未实现业务逻辑。

---

## Phase 3: User Story 1 – 持续化订阅链接替换 (Priority: P1) 🎯 MVP

**Goal**: 只替换订阅链接字段，保留其余模板配置；保存快照与日志。
**Independent Test**: 导入包含自定义策略的模板并更新链接，dry-run 成功且除 URL 外 diff 为空。

### Tests (must fail first)
- [ ] **T007** [US1] 在 `src-tauri/tests/contract/template-commands.contract.test.ts` 编写失败测试，验证 `POST /template/save` 返回 snapshotId 且 diff 仅包含链接字段。
- [ ] **T008** [US1] 在 `tests/integration/templateEditor.integration.test.ts` 编写失败测试，模拟 UI 触发链接更新并断言 TemplateSnapshot 与 AuditLog 记录。

### Implementation
- [ ] **T009** [US1] 扩展 `src-tauri/src/services/subscription_service.rs` 与 `src-tauri/src/commands/subscriptions.rs`，实现对 `proxy-providers.*.url` 的选择性替换及冲突检测；更新 `src-tauri/src/models/template.rs` 结构。
- [ ] **T010** [P] [US1] 实现 `src-tauri/src/services/template_service.rs` dry-run + snapshot 存储、10 条淘汰逻辑，并填充 `template.validate_yaml`/`template.save_snapshot` 命令。
- [ ] **T011** [P] [US1] 更新前端 `src/services/subscriptionAPI.ts`、`src/services/templateAPI.ts` 调用新命令；在 `useTemplateEditor.ts` 接入快照/日志刷新。
- [ ] **T012** [US1] 在 `src-tauri/tests/integration/template_editor_refresh.rs`（新增）编写通过测试，验证多订阅源更新仅影响链接字段。

**Checkpoint**: 重新运行 T007–T012 对应测试，全部通过；保存日志与快照目录生成条目 ≤10。

---

## Phase 4: User Story 2 – 结构化 YAML 编辑体验 (Priority: P1)

**Goal**: 提供可视化编辑器，含过滤助手、自定义 YAML 文本框、diff 预览与冲突提示。
**Independent Test**: 通过 UI 新增策略组并保存，diff 与 dry-run 成功；自定义 YAML 错误时提示未加载。

### Tests (must fail first)
- [ ] **T013** [US2] 在 `src/components/Subscription/TemplateEditorTab/__tests__/TemplateEditorTab.test.tsx` 编写失败测试，断言页签渲染、权限控制、受保护模块不可删除（需提示）以及 diff 展示。
- [ ] **T014** [US2] 在 `tests/ui/template-editor.spec.ts` 编写 WebDriver 失败用例，覆盖自定义 YAML 错误提示与冲突重载流程。

### Implementation
- [ ] **T015** [P] [US2] 实现 `src/components/Subscription/TemplateEditorTab/index.tsx` 布局、表单、DiffViewer、冲突对话框整合。
- [ ] **T016** [P] [US2] 实现 `src/components/Subscription/TemplateEditorTab/FilterAssistant.tsx`（标签 + 正则模式切换）与 `CustomConfigInput.tsx`（格式化 & 权限控制），并为受保护模块提供只读标识与删除前二次确认。
- [ ] **T017** [P] [US2] 实现/更新 `src/hooks/useTemplateEditor.ts`、`src/hooks/useYamlValidation.ts`、`src/hooks/useSnapshots.ts`，处理 schema 校验、dry-run、冲突刷新、回滚操作。
- [ ] **T018** [US2] 在 `src/components/Subscription/SubscriptionManager.tsx` 注册新页签、权限守卫与 `DiffViewer` 组件；在受保护模块上接入只读/确认逻辑；更新样式 `template-editor.css`。
- [ ] **T019** [US2] 更新 `src/services/auditLog.ts` 展示最近 10 条日志；在 UI 加入提示 Banner。
- [ ] **T020** [US2] 运行并修复 T013、T014 测试确保通过。

**Checkpoint**: 模板编辑页签完整可用；Vitest & UI 自动化通过。

---

## Phase 5: User Story 3 – 多订阅融合与最优节点选择配置 (Priority: P2)

**Goal**: 在可视化界面管理融合策略，并展示延迟测试与最优节点历史。
**Independent Test**: 配置两个地区订阅源后触发融合，UI 展示排序与失败记录；可回滚到先前快照。

### Tests (must fail first)
- [ ] **T021** [US3] 在 `src/hooks/__tests__/useTemplateEditor.test.ts` 添加失败单测，断言融合结果写入 `FusionTestResult` 数据并可回滚。
- [ ] **T022** [US3] 在 `src-tauri/tests/integration/fusion_tests.rs` 新建失败集成测试，覆盖 `FusionTestResult` 记录与 dry-run 错误回写。

### Implementation
- [ ] **T023** [P] [US3] 扩展 `src-tauri/src/services/subscription_service.rs`、`src-tauri/src/services/template_service.rs` 记录融合延迟、失败原因，并更新 `FusionTestResult` 结构。
- [ ] **T024** [P] [US3] 更新 `src/components/Subscription/TemplateEditorTab/SnapshotBanner.tsx`，展示地区延迟、最佳节点与回滚入口。
- [ ] **T025** [US3] 扩展 `useTemplateEditor.ts` & `useSnapshots.ts`，拉取融合结果、允许用户选取历史节点。
- [ ] **T026** [US3] 在前端服务 `templateAPI.ts` 新增 `getSnapshots`/`getLogs` 调用，配合 UI 刷新。
- [ ] **T027** [US3] 运行并修复 T021、T022 测试确保通过。

**Checkpoint**: 多订阅融合流程在 UI 中可视化，历史记录与回滚可用。

---

## Phase 6: User Story 4 – 模板导入导出与安全复用 (Priority: P1)

**Goal**: 提供可口令加密的模板导出与安全导入流程，确保跨设备协作时模板不被篡改或泄露。
**Independent Test**: 经 UI 导出加密文件后，用正确口令导入恢复成功；错误口令或 dry-run 失败时保留原模板并记录日志。

### Tests (must fail first)
- [ ] **T035** [US4] 在 `tests/integration/templateEditor.integration.test.ts` 与契约测试中编写失败用例，验证导入导出需要口令、dry-run 失败会阻止写盘并记录日志。

### Implementation
- [ ] **T031** [US4] 在 `src/services/templateAPI.ts` 融合导入/导出接口，通过 Tauri 命令调度 `template.export`、`template.import`，并传递口令/密钥参数。
- [ ] **T032** [US4] 在 `src/components/Subscription/TemplateEditorTab/index.tsx` 添加“导出 YAML”“导入 YAML”按钮及口令输入对话框，错误时弹出提醒。
- [ ] **T033** [US4] 在导入失败时保留原始文件下载链接与错误详情（更新 `TemplateEditorTab` UI 与 `useTemplateEditor.ts`），并提示口令或 dry-run 失败原因。
- [ ] **T034** [US4] 在 `src-tauri/src/commands/templates.rs`、`template_service.rs` 实现本地文件读写，使用 `crypto_service` 对导出文件加密/解密，并确保 dry-run 校验导入内容。

**Checkpoint**: 正确口令导入成功并生成日志；错误口令或 dry-run 失败时模板未被覆盖且有错误提示。

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] **T028** [Polish] 更新 `specs/001-specify-scripts-bash/quickstart.md` 步骤与调试命令，确保覆盖 dry-run、冲突与回滚示例。
- [ ] **T029** [Polish] 运行全量测试套件：`npm run test`, `npm run test:ui`, `cargo test` 并记录结果。
- [ ] **T030** [Polish] 清理 `template-snapshots/` 样例数据，仅保留基准快照；更新 `docs/macOS-HIG-Implementation.md` 附录描述新页签。
- [ ] **T036** [Polish] 在 `src-tauri/src/commands/subscriptions.rs` 返回 link_expiry_seconds；在 `subscription_service.rs` 计算剩余秒数并区分 ≤5 分钟、≤60 秒阈值写入命令响应。
- [ ] **T037** [Polish] 在订阅列表组件（如 `SubscriptionList.tsx`）与 `TemplateEditorTab/SnapshotBanner.tsx` 展示倒计时，分别以黄色/红色高亮 ≤5 分钟与 ≤60 秒状态，并加入“刷新有效期”按钮调用命令。
- [ ] **T038** [Polish] 在 `tests/ui/template-editor.spec.ts` 与 `tests/integration/templateEditor.integration.test.ts` 增补倒计时颜色状态与 ≤60 秒禁止保存的测试覆盖。

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
