# Data Model: 技术选型决策与UI/UX设计

**Created**: 2025-01-10
**Purpose**: 系统数据模型和实体关系定义
**Status**: Completed

## 核心实体定义

### 1. 订阅站点 (Subscription)

```typescript
interface Subscription {
  id: string;                    // 唯一标识符
  name: string;                  // 站点名称
  templateId?: string;           // 关联的模板ID（可选）
  url: string;                   // 站点URL
  authType: AuthType;            // 认证类型
  credentials: CredentialData;    // 加密的凭据数据
  status: SubscriptionStatus;    // 订阅状态
  lastUpdate: Date;              // 最后更新时间
  nextUpdate: Date;              // 下次更新时间
  subscriptionUrl?: string;      // 获取到的订阅链接
  errorMessage?: string;         // 错误信息
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

enum AuthType {
  COOKIE = 'cookie',
  TOKEN = 'token',
  BASIC = 'basic',
  TWO_FACTOR = '2fa'
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  UPDATING = 'updating'
}
```

### 2. 站点模板 (SiteTemplate)

```typescript
interface SiteTemplate {
  id: string;                    // 模板ID
  name: string;                  // 模板名称
  description: string;           // 模板描述
  version: string;               // 模板版本
  url: string;                   // 站点URL
  config: TemplateConfig;        // 模板配置
  supportedAuthTypes: AuthType[];// 支持的认证类型
  isActive: boolean;             // 是否激活
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

interface TemplateConfig {
  urlPattern: string;            // URL模式
  authConfig: AuthConfig;        // 认证配置
  extractConfig: ExtractConfig;  // 提取配置
  updateConfig: UpdateConfig;    // 更新配置
}

interface AuthConfig {
  type: AuthType;
  cookieDomain?: string;         // Cookie域名
  tokenHeader?: string;          // Token请求头
  basicAuthRealm?: string;       // 基础认证域
  twoFactorMethod?: string;      // 双因素认证方法
}

interface ExtractConfig {
  subscriptionUrlPattern: string; // 订阅链接提取模式
  responseFormat: 'json' | 'text' | 'html'; // 响应格式
  extractMethod: 'regex' | 'json_path' | 'xpath'; // 提取方法
  extractExpression: string;      // 提取表达式
}

interface UpdateConfig {
  updateInterval: number;        // 更新间隔（分钟）
  retryAttempts: number;         // 重试次数
  timeout: number;               // 超时时间（秒）
}
```

### 3. 用户凭据 (UserCredentials)

```typescript
interface UserCredentials {
  id: string;                    // 凭据ID
  subscriptionId: string;        // 关联的订阅ID
  authType: AuthType;            // 认证类型
  encryptedData: string;         // 加密的凭据数据
  salt: string;                  // 加密盐值
  isValid: boolean;              // 是否有效
  expiresAt?: Date;              // 过期时间
  lastValidated: Date;           // 最后验证时间
  createdAt: Date;               // 创建时间
  updatedAt: Date;               // 更新时间
}

// 加密前的凭据数据结构
interface CredentialData {
  username?: string;             // 用户名
  password?: string;             // 密码
  token?: string;                // 访问令牌
  cookies?: CookieData[];        // Cookie数据
  twoFactorCode?: string;        // 双因素认证码
  customFields?: Record<string, string>; // 自定义字段
}

interface CookieData {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: Date;
  secure: boolean;
  httpOnly: boolean;
}
```

### 4. 应用配置 (AppConfig)

```typescript
interface AppConfig {
  general: GeneralConfig;        // 通用配置
  notifications: NotificationConfig; // 通知配置
  updates: UpdateConfig;         // 更新配置
  security: SecurityConfig;      // 安全配置
  ui: UIConfig;                  // UI配置
}

interface GeneralConfig {
  language: string;              // 界面语言
  theme: 'light' | 'dark' | 'auto'; // 主题模式
  autoStart: boolean;            // 自动启动
  minimizeToTray: boolean;       // 最小化到托盘
  checkUpdates: boolean;         // 检查更新
}

interface NotificationConfig {
  enabled: boolean;              // 启用通知
  onSuccess: boolean;            // 成功通知
  onError: boolean;              // 错误通知
  onUpdate: boolean;             // 更新通知
  soundEnabled: boolean;         // 启用声音
}

interface SecurityConfig {
  autoLockMinutes: number;       // 自动锁定时间
  requireAuth: boolean;          // 需要认证
  encryptCredentials: boolean;   // 加密凭据
  sessionTimeout: number;        // 会话超时时间
}

interface UIConfig {
  compactMode: boolean;          // 紧凑模式
  showAdvancedOptions: boolean;  // 显示高级选项
  defaultView: 'list' | 'grid';  // 默认视图
  itemsPerPage: number;          // 每页显示数量
}
```

### 5. 状态信息 (StatusInfo)

```typescript
interface StatusInfo {
  application: ApplicationStatus; // 应用状态
  subscriptions: SubscriptionStatus[]; // 订阅状态
  system: SystemStatus;          // 系统状态
  lastUpdated: Date;             // 最后更新时间
}

interface ApplicationStatus {
  version: string;               // 应用版本
  isOnline: boolean;             // 在线状态
  lastCheck: Date;               // 最后检查时间
  updateAvailable: boolean;      // 有可用更新
  updateVersion?: string;        // 更新版本
}

interface SystemStatus {
  platform: string;             // 平台信息
  architecture: string;          // 架构信息
  memoryUsage: number;           // 内存使用量
  cpuUsage: number;              // CPU使用率
  diskSpace: DiskSpaceInfo;      // 磁盘空间信息
}

interface DiskSpaceInfo {
  total: number;                 // 总空间
  free: number;                  // 可用空间
  used: number;                  // 已用空间
}
```

## 实体关系图

```
UserCredentials (1) ←→ (1) Subscription
     ↑                                ↑
     |                                |
Subscription (1) ←→ (0..1) SiteTemplate
     ↓
     ↓
StatusInfo (聚合状态)
     ↑
     ↑
AppConfig (全局配置)
```

## 数据验证规则

### 订阅站点验证
- `name`: 必填，长度 2-50 字符
- `url`: 必填，有效的URL格式
- `authType`: 必填，有效的认证类型
- `credentials`: 必填，已加密格式

### 站点模板验证
- `id`: 必填，唯一的模板ID
- `name`: 必填，长度 2-100 字符
- `version`: 必填，语义化版本号
- `config`: 必填，完整的模板配置

### 用户凭据验证
- `subscriptionId`: 必填，关联的订阅ID
- `authType`: 必填，匹配订阅的认证类型
- `encryptedData`: 必填，有效的加密格式

## 状态转换

### 订阅站点状态转换

```
INACTIVE → UPDATING → ACTIVE
    ↓           ↓         ↓
   ERROR ←─────┘    (自动更新)
    ↓
  INACTIVE (手动重置)
```

### 模板状态转换

```
ACTIVE → INACTIVE (禁用)
   ↓
  UPDATED (版本更新)
   ↓
  ACTIVE (重新激活)
```

## 数据存储策略

### 存储位置
- **模板数据**: 应用目录 `/templates/`
- **用户凭据**: 用户目录 `~/.clash-autosub/credentials/`
- **配置数据**: 用户目录 `~/.clash-autosub/config.json`
- **日志数据**: 用户目录 `~/.clash-autosub/logs/`

### 加密策略
- **用户凭据**: AES-256-GCM 加密
- **敏感配置**: AES-256-CBC 加密
- **密钥管理**: 基于用户系统信息生成密钥

### 备份策略
- **自动备份**: 每日备份配置数据
- **手动备份**: 用户触发的完整备份
- **备份格式**: JSON 格式，包含所有必要数据

## 数据迁移

### 版本升级迁移
1. **检查数据版本**: 读取当前数据版本
2. **验证兼容性**: 检查数据格式兼容性
3. **执行迁移**: 按版本差异执行迁移脚本
4. **验证结果**: 确保迁移后数据完整性

### 模板升级处理
1. **检测新模板**: 比较本地模板版本
2. **提示用户**: 显示有新模板可用
3. **用户确认**: 用户选择是否升级
4. **保持数据**: 升级时保留用户凭据

## 性能考虑

### 数据加载优化
- **懒加载**: 按需加载订阅数据
- **分页加载**: 大量数据分页显示
- **缓存策略**: 缓存常用数据减少IO

### 内存管理
- **数据清理**: 定期清理过期数据
- **内存监控**: 监控内存使用情况
- **垃圾回收**: 及时释放不需要的数据

## 安全考虑

### 数据保护
- **本地加密**: 所有敏感数据本地加密存储
- **访问控制**: 限制数据访问权限
- **审计日志**: 记录数据访问和修改操作

### 隐私保护
- **数据最小化**: 仅收集必要的数据
- **匿名化**: 日志中不包含敏感信息
- **用户控制**: 用户可控制数据使用和删除