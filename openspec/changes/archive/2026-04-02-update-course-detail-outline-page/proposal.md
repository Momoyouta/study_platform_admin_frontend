## Why

当前课程详情的“章节课时”页仅支持本地编辑流，缺少与后端草稿/发布能力的闭环，导致无法可靠地恢复已发布大纲、进行快速发布确认，以及在发布后保证前端临时 ID 与后端真实 ID 一致。需要补齐接口对接与关键交互确认，降低误操作和数据不一致风险。

## What Changes

- 对接课程大纲相关接口：`/course/saveCourseDraftAdmin`、`/course/publishCourseOutlineAdmin`、`/course/getCourseLessonOutline/{id}`。
- 为 `GET /course/getCourseLessonOutline/:id` 增加可选 `source` 参数，其中导入已发布大纲时使用 `source=published` 直接读取已发布内容并刷新页面。
- 在课时编辑弹层中新增“立刻保存”按钮，点击后弹出确认提示，确认后执行快捷更新接口（`/course/updateLessonQuickAdmin`）并立即发布该项更新。
- 发布大纲时增加二次确认弹窗，用户确认后再调用发布接口。
- 发布成功后根据返回的 `id_mappings` 回填前端大纲 JSON（章节与课时 ID），修正临时 ID 与真实 ID 的映射一致性。
- 补充章节快捷更新接口对接（`/course/updateChapterTitleQuickAdmin`），保持章节快速改名与草稿一致。

## Capabilities

### New Capabilities
- 无

### Modified Capabilities
- `course-outline-manage`: 扩展大纲页的接口闭环、发布确认交互、导入已发布大纲流程、课时快捷发布能力，以及发布后 ID 映射回填规则。

## 非目标 (Non-goals)

- 不改动课程详情“基础信息”页业务流程与字段定义。
- 不新增资源上传协议或分片上传能力（仅复用既有资源选择/挂载流程）。
- 不重构整套大纲编辑器的 UI 架构，仅在现有交互上增量扩展。

## Impact

- 主要影响：课程详情章节课时页及其编辑弹层组件（`src/pages/CourseManage/CourseDetail` 下相关模块）。
- API 影响：新增/更新课程大纲草稿保存、发布、查询、章节快捷更新、课时快捷更新的前端调用封装。
- 数据一致性：前端需维护并应用发布响应中的 `id_mappings`，确保后续编辑与排序操作使用真实 ID。
