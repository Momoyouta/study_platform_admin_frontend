## Context

课程详情中的“章节课时”页已经具备章节/课时编辑与排序基础能力，但仍以本地状态为主，缺少草稿保存、发布与回读的完整闭环。当前新增需求集中在四类风险点：
- 数据来源不唯一：页面状态与后端发布态可能偏离。
- 误触发发布：关键操作无确认，容易造成立即生效的误操作。
- 快捷更新链路缺失：章节/课时局部编辑未接入后端快捷更新接口。
- 临时 ID 漂移：发布后后端返回真实 ID，前端若不回填会导致后续编辑命中失败。

相关接口：
- 草稿保存：`POST /course/saveCourseDraftAdmin`
- 发布大纲：`POST /course/publishCourseOutlineAdmin`
- 查询大纲：`GET /course/getCourseLessonOutline/{id}`（可选 `source`）
- 章节快捷更新：`PUT /course/updateChapterTitleQuickAdmin`
- 课时快捷更新：`PUT /course/updateLessonQuickAdmin`

## Goals / Non-Goals

**Goals:**
- 建立章节课时页“编辑草稿 -> 发布确认 -> 同步真实 ID -> 继续编辑”的闭环。
- 新增“导入已发布大纲”能力，支持一键回退到发布态并刷新页面。
- 在课时编辑弹层增加“立刻保存”并要求用户确认，调用课时快捷更新接口。
- 发布大纲前增加确认弹窗，降低误发布风险。
- 发布成功后应用 `id_mappings` 更新前端 JSON 中章节/课时 ID。

**Non-Goals:**
- 不改造课程详情基础信息页。
- 不引入新状态管理框架，仅在现有页面状态与 API 层上增量实现。
- 不新增资源上传能力或视频管理协议。

## Decisions

### Decision 1: 大纲读取统一走后端接口，页面以服务端返回为准
- 方案：页面初始化时调用 `getCourseLessonOutline` 默认读取草稿优先数据；导入已发布大纲时显式传 `source=published` 读取已发布内容。
- 原因：同一接口覆盖 admin 草稿优先与已发布读取两种场景，能减少额外接口与数据分叉。
- 备选方案：拆成两个不同接口。放弃原因：后端已明确用 `source` 做行为切换，无需重复建模。

### Decision 2: “导入已发布大纲”直接读取 published 态
- 方案：点击后直接调用 `getCourseLessonOutline` 并传 `source=published`，再用响应 JSON 覆盖页面状态。
- 原因：实现更直接，避免无意义的草稿覆盖与额外回读，符合“导入已发布大纲”的语义。
- 备选方案：仍先清空草稿再读取。放弃原因：会引入不必要的数据写入和失败回滚复杂度。

### Decision 3: 关键写操作统一增加二次确认
- 方案：
  - 发布大纲前弹 `Modal.confirm`。
  - 课时弹层“立刻保存”点击后弹 `Modal.confirm`，确认后触发 `updateLessonQuickAdmin`。
- 原因：两类操作都属于即时生效，确认可显著降低误操作。
- 备选方案：使用全局撤销提示。放弃原因：后端为立即写入，撤销并非可靠事务语义。

### Decision 4: 发布成功后执行 ID 映射回填
- 方案：根据 `PublishCourseOutlineResponseDto.id_mappings` 生成 `temp_id -> real_id` 映射表，遍历更新章节 `chapter_id` 与课时 `lesson_id`，再写回页面状态。
- 原因：保证后续快捷更新、排序、删除等操作命中真实实体。
- 备选方案：发布后强制整页重载并依赖后端回读。放弃原因：交互抖动大且丢失当前编辑上下文。

### Decision 5: API 层新增明确方法并保持命名一致
- 方案：在课程 API 模块补充：
  - `saveCourseDraftAdmin(payload)`
  - `publishCourseOutlineAdmin(payload)`
  - `getCourseLessonOutline(id)`
  - `updateChapterTitleQuickAdmin(payload)`
  - `updateLessonQuickAdmin(payload)`
- 原因：便于页面逻辑组合与单元测试模拟，减少散落调用。
- 备选方案：页面内联请求。放弃原因：可维护性差。

## Risks / Trade-offs

- [Risk] `id_mappings` 可能只返回部分映射。  
  Mitigation: 仅替换命中的临时 ID，未命中项保留并提示日志告警。
- [Risk] 快捷更新接口与本地字段命名不一致（如 `lesson_id`/`id`）。  
  Mitigation: 在 API 适配层做 DTO 映射，页面只操作统一前端模型。
- [Trade-off] 增加确认弹窗会多一次点击。  
  Mitigation: 仅对“立即生效”操作启用，不影响普通草稿编辑流。

## Migration Plan

1. 新增并联调课程大纲相关 API 方法（不替换旧接口调用前先灰度接入）。
2. 在章节课时页接入“导入已发布大纲”按钮与 `source=published` 读取链路。
3. 在课时编辑弹层接入“立刻保存”按钮和确认弹窗。
4. 在发布入口接入确认弹窗与发布后 ID 映射回填。
5. 冒烟验证：草稿保存、导入发布态、快捷更新、发布后继续编辑。
6. 如出现兼容问题，回滚到“仅草稿保存，不执行快捷更新/ID 回填”的旧流程。

## Resolved Decisions

- “导入已发布大纲”中提交的空草稿采用“仅空 `chapters`”策略，其他字段由后端读取/补齐。
- 课时“立刻保存”成功后自动关闭编辑弹层；但视频上传成功仅更新字段与提示，不触发弹层关闭。
- 章节标题快捷更新采用“点击显式保存按钮”触发，不使用失焦自动保存。
- 导入已发布大纲改为直接请求 `getCourseLessonOutline`，并显式传 `source=published`。