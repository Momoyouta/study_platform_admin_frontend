# 需求说明：课程任务编辑器 (Markdown)

## 1. 核心需求

### Requirement: 课程任务编辑器 (Markdown)
系统 MUST 在“任务编辑”标签页提供一个完整的 Markdown 编辑器，仅支持文本输入、实时预览及常用工具栏操作（排除图片）。

#### Scenario: 进入任务编辑页异步加载内容
- **WHEN** 管理员点击“任务编辑”标签页
- **THEN** 系统展示 Loading 状态，并调用 `GET /course/getCourseDescriptionAdmin/:id` 接口获取详情
- **THEN** 接口回显至编辑器

#### Scenario: 编辑内容并实时预览
- **WHEN** 管理员在编辑器左侧（或编辑区）输入内容
- **THEN** 系统在右侧（或切换至预览模式）即时渲染对应的 HTML 效果

#### Scenario: 提交保存任务内容
- **WHEN** 管理员点击编辑器下部的“保存内容”按钮
- **THEN** 系统调用 `updateCourseAdmin` 接口，提交 `payload` 包含 `id` 和更新后的 `description`
- **THEN** 保存成功后展示成功提示，并保持在当前标签页

#### Scenario: 禁止图片上传与粘贴
- **WHEN** 管理员尝试通过工具栏（应不可见）、拖拽或粘贴方式插入图片
- **THEN** 系统拦截该行为，不执行上传，且编辑器中不插入图片内容
