## ADDED Requirements

### Requirement: 大纲草稿保存与导入已发布大纲
系统 MUST 支持管理员将当前课程大纲保存为草稿，并提供“导入已发布大纲”能力以恢复服务端最新可见大纲。

#### Scenario: 保存草稿
- **WHEN** 用户点击“存为草稿”
- **THEN** 前端 MUST 调用 `POST /course/saveCourseDraftAdmin`，并以当前页面大纲 JSON 作为 `draft_content` 提交。

#### Scenario: 导入已发布大纲
- **WHEN** 用户点击“导入已发布大纲”
- **THEN** 前端 MUST 直接调用 `GET /course/getCourseLessonOutline/{id}` 并设置 `source=published`，再用返回 JSON 刷新页面状态。

#### Scenario: admin 默认读取草稿优先内容
- **WHEN** admin 端页面调用 `GET /course/getCourseLessonOutline/{id}` 且未显式传 `source`
- **THEN** 接口 MUST 返回草稿优先内容，若草稿为空则回退到发布态。

#### Scenario: user 端始终读取发布态
- **WHEN** user 平台调用 `GET /course/getCourseLessonOutline/{id}`
- **THEN** 接口 MUST 忽略 `source` 参数并始终返回已发布内容。

### Requirement: 大纲发布确认与 ID 映射回填
系统 MUST 在发布前进行用户确认，并在发布成功后把后端返回的真实 ID 回填到前端大纲 JSON。

#### Scenario: 发布前确认
- **WHEN** 用户点击“发布大纲”
- **THEN** 系统 MUST 弹出确认对话框，只有用户确认后才调用 `POST /course/publishCourseOutlineAdmin`。

#### Scenario: 发布后回填真实 ID
- **WHEN** 发布接口返回 `id_mappings`
- **THEN** 前端 MUST 根据映射将大纲 JSON 中匹配的 `chapter_id` 与 `lesson_id` 从 `temp_id` 更新为 `real_id`，并将更新后的 JSON 写回页面状态。

### Requirement: 章节标题快捷更新
系统 MUST 支持章节标题的快捷更新，并保证快捷更新与草稿内容同步。

#### Scenario: 章节标题快速保存
- **WHEN** 用户点击章节标题区域的显式“保存”按钮
- **THEN** 前端 MUST 调用 `PUT /course/updateChapterTitleQuickAdmin`，并携带 `course_id`、当前 `draft_content` 与目标 `chapter` 数据。

## MODIFIED Requirements

### Requirement: 课时详细编辑与视频资源选择
系统 MUST 支持对单一课时的详细信息编辑，包含修改课时名称、简介，并提供从资源库中选取视频源的交互入口；同时 MUST 提供“立刻保存”能力以执行即时生效的课时更新。

#### Scenario: 唤起课时编辑器
- **WHEN** 用户点击某一课时的列表项或者关联的“编辑”动作区
- **THEN** 界面右侧应滑出课时编辑抽屉（Drawer），加载该课时的名称、简介及已关联视频的反馈信息。

#### Scenario: 从资源库选择视频
- **WHEN** 用户在课时抽屉中点击“从资源库中选择”按钮
- **THEN** 系统应提供选取资源的交互，选定相关视频后更新当前抽屉内展示的视频信息，并在保存课时时一并更新至外部列表状态。

#### Scenario: 课时立刻保存并确认
- **WHEN** 用户在课时编辑弹层点击“立刻保存”
- **THEN** 系统 MUST 先弹出确认对话框，用户确认后调用 `PUT /course/updateLessonQuickAdmin`，并在成功后更新当前课时在大纲 JSON 中的数据且自动关闭课时编辑弹层。

#### Scenario: 视频上传成功时保持弹层打开
- **WHEN** 用户在课时编辑弹层完成视频上传且上传成功
- **THEN** 系统 MUST 仅更新当前课时的视频资源字段与反馈信息，不自动关闭课时编辑弹层。
