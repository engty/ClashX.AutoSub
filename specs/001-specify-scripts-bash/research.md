# Research Summary – YAML订阅配置增强

## Decision 1: Dry-run 校验实现
- **Decision**: 在 Rust `template_service` 中集成 `clash-rs` 解析库执行 dry-run，并在失败时返回结构化错误。  
- **Rationale**: 该库与 Clash 元数据保持同步，可避免 shell 调用真实二进制导致性能与安全问题，同时输出可消费的错误信息。  
- **Alternatives considered**: 直接调用 Clash CLI（启动成本高，依赖外部二进制）；自研轻量解析器（实现复杂度与维护成本高）。

## Decision 2: YAML Schema 与 UI 字段映射
- **Decision**: 维护单一 JSON Schema，前端通过 `yamlTransform.ts` 转换成表单模型，后端用于 schema 校验与字段缺失检测。  
- **Rationale**: Schema 可跨语言共享，便于生成默认值与错误提示，减少前后端字段漂移。  
- **Alternatives considered**: 手写 TypeScript/Zod 校验（无法复用到 Rust）；直接依赖 Clash 官方 schema（缺少 UI 所需的元数据）。

## Decision 3: 自定义 YAML 编辑权限
- **Decision**: 仅允许拥有 "advanced_template" 权限标签的本地用户使用自定义 YAML 文本框；默认仅显示结构化表单。  
- **Rationale**: 避免普通用户误操作破坏模板；权限标签与现有设置存储兼容，可扩展。  
- **Alternatives considered**: 全量开放（风险高）、完全关闭（无法满足高阶用户需求）。

## Decision 4: macOS UI 交互准则
- **Decision**: TemplateEditorTab 使用系统风格页签、表单间距与 `DiffViewer`（基于分栏布局），遵循 `docs/macOS-HIG-Implementation.md` 建议，并覆盖暗/亮模式快照。  
- **Rationale**: 与现有界面保持一致，降低学习成本；暗/亮模式一致性属于宪章要求。  
- **Alternatives considered**: 自定义页面/弹窗（样式割裂）；独立应用窗口（破坏现有导航流）。

## Decision 5: 日志与快照保留策略
- **Decision**: 模板快照与日志统一存放在 `template-snapshots/` 目录，按时间排序仅保留最近 10 条，在新记录写入前自动清理。  
- **Rationale**: 满足规格约束，便于回滚与存储控制；目录集中便于备份。  
- **Alternatives considered**: 无限保留（占用空间）；只存最新一条（回滚信息不足）。
