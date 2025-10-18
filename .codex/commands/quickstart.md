# Quick Start Guide: Clash AutoSub UI Application

**Version**: 1.0.0
**Created**: 2025-01-10
**Target Audience**: 开发者和早期用户

## 系统要求

### 开发环境
- **Node.js**: 18.0.0 或更高版本
- **Rust**: 1.70.0 或更高版本
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **内存**: 最少 4GB RAM，推荐 8GB
- **存储**: 至少 2GB 可用空间

### 运行时环境
- **Windows**: Windows 10 (版本 1903 或更高)
- **macOS**: macOS 10.15 (Catalina) 或更高
- **Linux**: 支持现代发行版 (Ubuntu 20.04+, Fedora 36+)

## 快速安装

### 1. 克隆项目

```bash
git clone https://github.com/your-org/clash-autosub.git
cd clash-autosub
```

### 2. 安装依赖

```bash
# 安装 Rust (如果未安装)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 安装 Node.js (如果未安装)
# 访问 https://nodejs.org 下载并安装

# 安装前端依赖
npm install

# 安装 Tauri CLI
npm install -g @tauri-apps/cli
```

### 3. 开发模式启动

```bash
# 启动开发服务器
npm run tauri dev
```

应用将在开发模式下启动，支持热重载和实时调试。

## 基本使用指南

### 首次启动配置

1. **选择界面主题**
   - 自动检测系统主题（推荐）
   - 手动选择浅色/深色模式

2. **配置通知设置**
   - 启用/禁用系统通知
   - 设置通知类型偏好

3. **设置自动启动**（可选）
   - 开机自动启动应用
   - 最小化到系统托盘

### 添加订阅站点

#### 使用预定义模板（推荐）

1. **点击"添加订阅"按钮**
2. **选择"使用模板"选项**
3. **从模板列表中选择站点**
   - 系统提供 5-10 个预配置站点模板
   - 每个模板包含正确的站点配置和认证方式
4. **填写用户凭据**
   - 用户名和密码
   - 或其他认证信息（根据模板要求）
5. **点击"测试连接"验证配置**
6. **保存订阅配置**

#### 手动配置站点

1. **点击"添加订阅"按钮**
2. **选择"手动配置"选项**
3. **填写站点信息**
   - 站点名称
   - 站点 URL
   - 认证方式
4. **配置高级选项**（可选）
   - 更新间隔
   - 重试次数
   - 超时设置
5. **填写认证凭据**
6. **测试并保存配置**

### 管理订阅站点

#### 查看订阅状态
- **实时状态**: 查看每个订阅的当前状态
- **最后更新**: 显示上次更新时间
- **下次更新**: 显示计划更新时间

#### 更新订阅
- **单个更新**: 点击订阅卡片的"更新"按钮
- **批量更新**: 点击"全部更新"按钮更新所有订阅
- **自动更新**: 根据配置的间隔自动更新

#### 编辑订阅
1. **右键点击订阅卡片**
2. **选择"编辑"选项**
3. **修改订阅信息**
4. **保存更改**

#### 删除订阅
1. **右键点击订阅卡片**
2. **选择"删除"选项**
3. **确认删除操作**

### 配置管理

#### 导出配置
1. **打开"设置"页面**
2. **选择"备份与恢复"选项卡**
3. **点击"导出配置"**
4. **选择保存位置**

#### 导入配置
1. **打开"设置"页面**
2. **选择"备份与恢复"选项卡**
3. **点击"导入配置"**
4. **选择配置文件**
5. **确认导入操作**

### 系统集成

#### 菜单栏集成（macOS）
- 应用图标显示在菜单栏
- 右键点击显示快速操作菜单
- 支持快捷键操作

#### 系统通知
- 订阅更新成功通知
- 订阅更新失败通知
- 系统错误通知
- 可自定义通知设置

#### 自动启动
- 系统启动时自动运行应用
- 最小化到系统托盘
- 启动时恢复上次状态

## 开发者指南

### 项目结构

```
clash-autosub/
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── main.rs        # 主入口
│   │   ├── commands.rs    # Tauri 命令
│   │   ├── models/        # 数据模型
│   │   ├── services/      # 业务逻辑
│   │   └── utils/         # 工具函数
│   ├── templates/         # 预定义模板
│   └── Cargo.toml         # Rust 依赖
├── src/                   # React 前端
│   ├── components/        # React 组件
│   ├── hooks/            # React Hooks
│   ├── services/         # 前端服务
│   ├── types/            # TypeScript 类型
│   └── App.tsx           # 主应用
├── debug-tools/          # 调试工具
└── tests/                # 测试文件
```

### 开发命令

```bash
# 开发模式启动
npm run tauri dev

# 构建应用
npm run tauri build

# 运行测试
npm test

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 添加新的站点模板

1. **创建模板配置文件**
   ```json
   {
     "id": "site-template-xxx",
     "name": "站点名称",
     "description": "站点描述",
     "version": "1.0.0",
     "url": "https://example.com",
     "config": {
       "urlPattern": "https://example.com/api/subscribe",
       "authConfig": {
         "type": "cookie",
         "cookieDomain": ".example.com"
       },
       "extractConfig": {
         "subscriptionUrlPattern": "\"url\":\"([^\"]+)\"",
         "responseFormat": "json",
         "extractMethod": "regex",
         "extractExpression": "\"url\":\"([^\"]+)\""
       }
     },
     "supportedAuthTypes": ["cookie", "token"],
     "isActive": true
   }
   ```

2. **测试模板配置**
   ```bash
   cd debug-tools
   cargo run -- --template path/to/template.json --validate
   ```

3. **添加到模板列表**
   ```bash
   # 更新 templates.json 文件
   # 添加新模板到数组中
   ```

### 调试站点配置

使用独立调试工具测试和验证站点配置：

```bash
cd debug-tools

# 验证模板配置
cargo run -- --template templates/site-template-xxx.json --validate

# 测试站点连接
cargo run -- --url https://example.com --test-connection

# 完整的站点测试
cargo run -- --template templates/site-template-xxx.json --test-with-credentials
```

## 故障排除

### 常见问题

#### 应用无法启动
1. **检查 Node.js 版本**: 确保使用 18.0.0 或更高版本
2. **检查 Rust 版本**: 确保使用 1.70.0 或更高版本
3. **清理依赖缓存**:
   ```bash
   npm cache clean --force
   cargo clean
   npm install
   ```

#### 订阅更新失败
1. **检查网络连接**: 确保网络连接正常
2. **验证站点配置**: 使用调试工具验证配置
3. **检查认证信息**: 确保用户名密码正确
4. **查看错误日志**: 在设置页面查看详细错误信息

#### 模板升级失败
1. **备份当前配置**: 导出当前配置作为备份
2. **手动升级**: 删除旧订阅，使用新模板重新创建
3. **联系支持**: 如果问题持续，联系开发团队

### 日志和调试

#### 查看应用日志
1. **打开设置页面**
2. **选择"调试信息"选项卡**
3. **查看日志信息**

#### 开发者调试
```bash
# 启用详细日志
RUST_LOG=debug npm run tauri dev

# 查看网络请求
# 在开发者工具中查看 Network 标签页

# 调试 Rust 代码
# 使用 VS Code 的 CodeLLDB 扩展
```

## 获取帮助

### 文档资源
- **用户手册**: [用户详细手册链接]
- **开发者文档**: [开发者文档链接]
- **API 文档**: [API 文档链接]

### 社区支持
- **GitHub Issues**: [项目 Issues 页面]
- **讨论论坛**: [讨论论坛链接]
- **QQ 群**: [群号]

### 联系方式
- **邮箱**: support@clash-autosub.com
- **Twitter**: @clash_autosub

## 更新日志

### v1.0.0 (2025-01-10)
- 初始版本发布
- 支持 Tauri 跨平台架构
- 预定义站点模板功能
- 用户凭据安全管理
- 系统集成功能

---

**注意**: 这是一个快速开始指南，更多详细信息请参考完整的用户手册和开发者文档。