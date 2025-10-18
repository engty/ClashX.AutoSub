# Implementation Plan: 技术选型决策与UI/UX设计

**Branch**: `001-ui-ux-https` | **Date**: 2025-01-10 | **Spec**: /specs/001-ui-ux-https/spec.md
**Input**: Feature specification from `/specs/001-ui-ux-https/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

基于深入研究和用户明确要求，本实施计划采用Tauri 2 + React 18 + TypeScript + Rust架构来实现Clash AutoSub的完全UI化转换。主要技术决策包括：

1. **纯UI架构**：完全从CLI迁移到现代化UI应用，不再保留CLI功能
2. **简化迁移**：专注于配置数据迁移，无需考虑CLI兼容性问题
3. **安全升级**：从基础文件存储升级到AES-256-GCM加密数据库存储
4. **模块化设计**：前后端完全分离，专注用户体验优化

技术栈选择平衡了性能、安全性、跨平台兼容性和开发效率，完全符合项目宪法原则和用户的纯UI要求。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.0+ (Frontend) / Rust 1.70+ (Backend) / React 18+ (UI Framework)
**Primary Dependencies**: Tauri 2.0 + React 18 + TypeScript + Vite 5.0+ + Node.js 18+
**Storage**: 本地加密文件存储 (~/.clash-autosub/) + Tauri 跨平台存储
**Testing**: Jest + React Testing Library + Rust 单元测试 + 集成测试
**Target Platform**: 跨平台桌面应用 (macOS优先，支持Windows/Linux)
**Project Type**: Tauri 桌面应用架构 (Rust后端 + React前端)
**Performance Goals**: 应用启动 < 3秒, 响应时间 < 500ms, 内存占用 < 100MB
**Constraints**: 模块化设计，核心逻辑与UI层分离，AES-256本地加密，仅关键错误日志
**Scale/Scope**: 个人用户工具，支持1-5个订阅站点，架构支持扩展

## Constitution Check

*GATE: 必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。*

### 必须满足的宪法原则
- **I. 自动化优先**: ✅ 新功能支持完全自动化操作 (订阅自动更新、状态监控)
- **II. 平台迁移战略**: ✅ 完全从CLI迁移到Tauri UI应用，不再保留CLI功能
- **III. 智能化检测与容错**: ✅ 具备基础错误提示和网络状态检测
- **IV. 安全性与隐私保护**: ✅ AES-256本地加密存储，符合隐私保护要求
- **V. 性能优化**: ✅ 满足性能标准 (启动<3秒, 响应<500ms, 内存<100MB)

### 架构约束检查
- **模块化设计**: ✅ Tauri架构天然支持前后端分离
- **跨层兼容**: ✅ 完全UI化，无需考虑CLI兼容性
- **状态管理**: ✅ 统一数据存储格式确保一致性

### 开发工作流要求
- **纯UI开发**: ✅ 完全专注于Tauri UI应用开发
- **测试策略**: ✅ 支持自动化测试和集成测试
- **代码复用**: ✅ Rust后端可复用核心逻辑

### 合规性总结
- ✅ **完全通过**: 所有宪法原则均符合要求
- ✅ **架构简化**: 无需考虑CLI兼容性，专注于UI体验优化

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# Clash AutoSub 双平台架构
src/
├── core/                    # 核心业务逻辑（平台无关）
│   ├── types/
│   ├── services/
│   ├── subscription/
│   ├── credentials/
│   └── config/
├── cli/                     # CLI 层
│   └── index.ts
├── utils/                   # 工具函数
│   ├── logger.ts
│   └── file.ts
└── puppeteer/              # 浏览器控制
    ├── browser.ts
    └── network.ts

tests/
├── contract/               # 合约测试
├── integration/            # 集成测试
└── unit/                   # 单元测试

# macOS UI 应用（新增）
macos/
├── ClashAutoSub/
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   └── ContentView.swift
│   ├── Views/              # SwiftUI 视图
│   │   ├── MainView.swift
│   │   ├── SettingsView.swift
│   │   └── SubscriptionListView.swift
│   ├── Models/             # Swift 数据模型
│   │   ├── Subscription.swift
│   │   └── Config.swift
│   ├── Services/           # 服务层
│   │   ├── SubscriptionService.swift
│   │   └── ConfigService.swift
│   └── Utils/              # 工具类
│       └── CryptoBridge.swift  # 与 TypeScript 加密逻辑桥接
└── ClashAutoSubTests/      # iOS/macOS 测试
    └── [Test files]
```

**Structure Decision**: 采用双平台架构设计，核心业务逻辑与 UI 层完全分离。CLI 版本保持现有功能，新增 macOS UI 应用提供原生用户体验。两个平台共享核心逻辑和数据格式，确保功能对等和数据一致性。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 架构选择 (从CLI转为纯UI) | 用户明确要求完全使用UI方式运行，不再保留CLI功能 | CLI模式虽然功能完整，但用户体验不符合现代化需求；纯UI架构更简洁易维护 |

### 已解决问题
1. **平台迁移策略**: ✅ 已完全从CLI迁移到UI应用
2. **数据迁移策略**: ✅ 已制定现有配置数据的迁移方案
3. **Tauri最佳实践**: ✅ 已提供完整的技术实施指导
4. **架构简化**: ✅ 专注于纯UI应用开发，无需考虑CLI兼容性
