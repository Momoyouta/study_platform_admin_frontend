## Why

当前课程列表页点击“编辑”仅提示“建设中”，无法进入课程详情编辑流程，导致管理员无法在界面中维护课程关键信息。随着课程管理能力落地，需要补齐“列表 -> 课程编辑页（基础信息）”的最小可用闭环，并与现有后台接口对齐。

## What Changes

- 新增课程编辑页路由 `/courseDetail?courseId=`，从课程列表点击“编辑”后跳转到该页面，保持顶栏与侧边栏布局不变。
- 在课程编辑页实现“基础信息”模块：查询并展示单个课程全部基础信息。
- 仅允许更新课程的 `name`、`cover_img`、`status`，其余字段只读展示。
- 课程封面上传统一复用现有临时上传组件 `TempImageUpload`。
- 调整课程列表展示字段：增加学校名称展示，移除章节数与课时数计数字段。
- 页面表单与交互统一使用 Ant Design 组件。

## Non-goals

- 本次不实现任务编辑、章节课时、作业管理、统计信息等其它标签页内容。
- 本次不改造课程创建接口与创建流程。
- 本次不实现课程硬删除/软删除入口与批量操作。
- 本次不调整全局布局样式体系（仅在现有布局内新增页面与局部样式）。

## Capabilities

### New Capabilities
- `course-detail-basic-info-admin`: 管理端课程详情基础信息查看与可编辑字段更新能力（含路由跳转与上传组件接入）。

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `src/pages/CourseManage/CourseList/index.jsx`（编辑跳转、列表字段调整）
  - `src/router/route.jsx`（新增课程详情路由）
  - `src/pages/CourseManage/CourseDetail/index.jsx`（新页面，基础信息表单与只读信息展示）
  - `src/pages/CourseManage/CourseDetail/index.less`（页面样式）
- APIs:
  - `GET /course/getCourseBasicAdmin/{id}`（详情查询）
  - `PUT /course/updateCourseAdmin`（仅更新 name、cover_img、status）
  - `GET /course/listCourseAdmin`（列表返回包含 `school_name`，前端移除章节/课时列）
- Dependencies:
  - 复用现有 Ant Design、MobX、React Router、临时上传组件 `TempImageUpload`，不新增第三方依赖。
