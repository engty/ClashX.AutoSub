# Data Model – YAML订阅配置增强

## TemplateSnapshot
- **id** (UUID)
- **template_yaml** (string) – 格式化后的完整 YAML
- **diff_summary** (string) – 与上一版本的摘要差异
- **created_at** (ISO datetime)
- **created_by** (string) – 本地账户或系统标识
- **fusion_results** (array<FusionTestResultRef>) – 对应融合测试记录 id 列表
- **custom_config_present** (boolean)
- **notes** (string, optional)
- **Retention**: 仅保留最近 10 条，写入前触发淘汰

## FusionTestResult
- **id** (UUID)
- **region** (enum: HK, TW, JP, SG, US, IEPL, Other)
- **nodes** (array<NodeMetricRef>)
- **best_node** (string)
- **latency_ms** (number)
- **status** (enum: success, degraded, failed)
- **dry_run_errors** (array<string>) – dry-run 记录的错误原因（若有）
- **tested_at** (ISO datetime)
- **snapshot_id** (UUID, nullable)

## AuditLogEntry
- **id** (UUID)
- **snapshot_id** (UUID, nullable)
- **action** (enum: validate, save-success, save-failed, rollback)
- **actor** (string)
- **detail** (string) – JSON 摘要，包括触发命令、错误信息
- **created_at** (ISO datetime)
- **Retention**: 最近 10 条，循环覆盖

## CustomConfig
- **raw_yaml** (string)
- **normalized_yaml** (string) – 经过格式化后的 YAML
- **valid** (boolean)
- **validation_errors** (array<string>)
- **last_validated_at** (ISO datetime)
- **owner** (string) – 拥有 `advanced_template` 权限的用户

## SubscriptionSource (扩展字段)
- **id** (string)
- **name** (string)
- **url** (string)
- **refresh_interval** (number, seconds)
- **health_status** (enum: healthy, warning, error)
- **last_refreshed_at** (ISO datetime)
- **custom_mapping** (array<FilterRule>) – 可视化助手生成的过滤规则

## FilterRule
- **id** (UUID)
- **type** (enum: keyword, regex)
- **value** (string)
- **enabled** (boolean)
- **created_at** (ISO datetime)
- **created_by** (string)
- **group_name** (string) – 归属的 proxy group

## Relationships
- `TemplateSnapshot` 1—* `FusionTestResult`（可为空）
- `TemplateSnapshot` 1—* `AuditLogEntry`（通过 snapshot_id 关联）
- `CustomConfig` 1—1 `TemplateSnapshot`（最后一次保存的配置）
- `SubscriptionSource` *—* `FilterRule`（同一来源可对应多个过滤规则）
