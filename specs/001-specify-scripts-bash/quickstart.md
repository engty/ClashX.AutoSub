# Quickstart – YAML订阅配置增强

## 环境准备
1. 拉取 `001-specify-scripts-bash` 分支，运行 `npm install` 安装前端依赖。
2. 进入 `src-tauri/` 执行 `cargo fetch`（首次会拉取 base64 / serde_yaml 等依赖）。
3. 创建 `assets/template-snapshots/` 并复制 `yaml/template.yaml` 作为初始模板。
4. 确认本地环境：Node 18、Rust 1.75、Tauri 2.0。

## 启动步骤
1. `npm run dev` 启动前端（当前仍为占位脚本，后续将接入真实构建流程）。
2. `cargo tauri dev` 启动桌面应用，登录后进入 `订阅管理` → **模板编辑**。
3. 表单区可编辑订阅源、策略组；仅有 `advanced_template` 权限的账号可编辑自定义 YAML。

## 验证流程
1. 点击 **保存预览** 将触发 schema 校验 + dry-run；若 YAML 无效会提示错误。
2. 检测到外部变更时，会弹出冲突对话框，可选择“重新加载并覆盖 UI”。
3. 保存成功后可在设置页面查看快照、融合历史（各保留最近 10 条记录），并可导出加密模板便于跨设备迁移。

## 回滚
1. 进入 `设置` → `模板快照`，选择目标快照点击 **恢复**。
2. 若包含自定义 YAML，将提示是否套用；确认后会先执行 dry-run，再写入。

## 调试命令
```bash
# 执行 dry-run（后续会开放命令入参）
cargo tauri run template-validate

# 查看最新日志
cargo tauri run template-logs --limit 10

# 加密导出模板（示例口令 123456）
cargo tauri run template-export -- --password 123456

# 导入模板（示例使用上一步的导出结果）
cargo tauri run template-import -- --password 123456 --payload <base64字符串>
```

## 测试入口
- Node 侧测试：`npm test`
- Rust 契约测试：`cargo test template_import_export_test`
