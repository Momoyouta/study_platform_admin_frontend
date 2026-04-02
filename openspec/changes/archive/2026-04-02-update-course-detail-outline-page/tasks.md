## 1. API 封装与数据适配

- [x] 1.1 在课程相关 API 模块新增 `saveCourseDraftAdmin`、`publishCourseOutlineAdmin`、`getCourseLessonOutline`、`updateChapterTitleQuickAdmin`、`updateLessonQuickAdmin` 方法。
- [x] 1.2 定义并补齐请求/响应类型（含 `PublishCourseOutlineResponseDto.id_mappings`）及前端大纲 JSON 适配函数。
- [x] 1.3 增加发布后 ID 映射回填工具函数（章节 `chapter_id`、课时 `lesson_id`）。

## 2. 章节课时页交互改造

- [x] 2.1 在“存为草稿”按钮旁新增“导入已发布大纲”按钮与点击处理。
- [x] 2.2 实现“导入已发布大纲”读取流程：直接调用 `GET /course/getCourseLessonOutline/{id}` 并设置 `source=published`，再刷新页面。
- [x] 2.3 为“发布大纲”操作接入确认弹窗，确认后再发起发布请求。
- [x] 2.4 发布成功后应用 `id_mappings` 更新页面大纲 JSON，并同步刷新当前编辑状态。

## 3. 章节/课时快捷更新

- [x] 3.1 在章节标题编辑区新增显式“保存”按钮，并在点击该按钮时接入 `updateChapterTitleQuickAdmin`。
- [x] 3.2 在课时编辑弹层新增“立刻保存”按钮，并在点击后弹出确认提示。
- [x] 3.3 用户确认“立刻保存”后调用 `updateLessonQuickAdmin`，成功后回写当前课时数据与列表展示，并自动关闭课时编辑弹层。
- [x] 3.4 视频上传成功后仅更新资源信息并保留课时编辑弹层打开状态。

## 4. 验证与回归

- [ ] 4.1 冒烟验证：草稿保存、导入已发布大纲（`source=published`）、章节显式保存、课时立刻保存、发布确认流程。
- [ ] 4.2 验证发布后继续编辑链路：确认临时 ID 已被真实 ID 替换且后续接口请求正常。
- [ ] 4.3 补充错误处理与提示文案校验（确认弹窗取消、接口失败回滚、回读失败回退）。
