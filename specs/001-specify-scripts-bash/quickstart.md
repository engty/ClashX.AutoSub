# Quickstart – YAML订阅配置增强

## 环境准备
1. 拉取 `001-specify-scripts-bash` 分支，运行 `npm install`、`cargo fetch`。
2. 确认本地 ClashX.AutoSub 依赖齐全：Node 18、Rust 1.75、Tauri 2.0。
3. 创建本地配置目录 `template-snapshots/`，赋予读写权限。

## 启动步骤
1. `npm run dev` 启动前端，`cargo tauri dev` 启动 Tauri。
2. 登录应用后打开左侧导航 `订阅管理`，切换到新增的 **模板编辑** 页签。
3. 表单区编辑订阅源、策略组等结构化字段；在“自定义配置”区域仅当拥有 `advanced_template` 权限时可输入 YAML。

## 验证流程
1. 点击 **保存预览** 将触发 schema 校验 + dry-run，界面展示格式化后的 YAML 与错误提示。
2. 冲突提示出现时，选择“重新加载并覆盖 UI”以拉取最新模板，再次应用本地修改。
3. 成功保存后可在设置页面查看快照/日志（仅保留最近 10 条）。

## 回滚
1. 进入 `设置` → `模板快照`，选择目标快照点击 **恢复**。
2. 若包含自定义 YAML，将提示是否套用；选择后触发 dry-run 再写入。

## 调试命令
```bash
# 执行命令 dry-run 校验
cargo tauri run template-validate --file ./assets/template-snapshots/default.yaml

# 查看最新日志
cargo tauri run template-logs --limit 10
```

## 测试入口
- 单元测试：`npm run test -- TemplateEditorTab`
- UI 自动化：`npm run test:ui -- template-editor`
- Rust 契约测试：`cargo test template_commands`
