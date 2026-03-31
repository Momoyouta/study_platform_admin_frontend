## MODIFIED Requirements

### Requirement: 详情页仅允许编辑核心基础字段
系统 MUST 仅开放 `name`、`cover_img`、`status` 及 `description` 字段的编辑权限，其余字段均作为只读描述项展示。

#### Scenario: 保存更新时仅提交允许字段
- **WHEN** 管理员修改名称、状态或任务描述并点击保存
- **THEN** 系统调用 `PUT /course/updateCourseAdmin` 提交 payload 仅包含 `id`、`name`、`cover_img`、`status`、`description`
