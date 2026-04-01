## Why

课程详情基础信息编辑页当前将"封面上传"与"其他基础信息（名称、状态）提交"耦合为单次提交，导致临时上传的图片路径存储在表单并与业务字段混合处理，增加了临时文件过期风险与错误恢复的复杂度。将封面更新独立为单次接口调用，可在上传成功后立即持久化，降低数据不一致风险，同时提升用户交互反馈的清晰度（上传与保存的状态独立且可并行）。

## What Changes

- 拆分课程详情基础信息编辑的提交流程：封面上传成功后立即调用 `updateCourseCoverAdmin` 接口单独保存，不再混合其他字段提交。
- 后端新增 `PUT /course/updateCourseCoverAdmin` 接口，接受 `{ id, cover_img }` 并单独更新封面字段。
- 前端 API 层新增 `updateCourseCoverAdmin` 方法与对应 TypeScript 类型定义 `UpdateCourseCoverDto`。
- 前端表单提交逻辑改造：`TempImageUpload` 的 `onChange` 回调改为调用独立的封面更新接口，基础信息表单保存时不包含 `cover_img` 字段。
- 调整提交按钮与加载状态：封面上传和基础信息提交各有独立的 loading 状态指示，用户可清晰区分操作进度。

## Non-goals

- 本次不改动基础信息中除"封面"外的其他字段提交逻辑，`name` 和 `status` 仍通过 `updateCourseAdmin` 更新。
- 本次不实现封面上传预检（校验、压缩等），仍复用现有 `TempImageUpload` 组件的验证。
- 本次不新增撤销/回滚机制，用户提交后即为最终。
- 本次不改动课程列表、创建流程及其他详情标签页的逻辑。

## Capabilities

### New Capabilities
- `course-detail-cover-admin-update`: 管理端课程详情基础信息编辑时，独立提交封面更新能力（含临时路径转正、单独接口调用与加载状态管理）。

### Modified Capabilities
- `course-detail-basic-info-admin`: 基础信息编辑提交流程改为不包含 `cover_img` 字段（封面已拆分为独立操作）。

## Impact

- Affected code:
  - `src/http/api.ts`（新增 `updateCourseCoverAdmin` 方法）
  - `src/type/course.ts`（新增 `UpdateCourseCoverDto` 类型定义）
  - `src/pages/CourseManage/CourseDetail/index.jsx`（改造 `TempImageUpload` 的 `onChange` 回调、分离提交函数、调整 loading 状态管理）
- APIs:
  - **New**: `PUT /course/updateCourseCoverAdmin` 接收 `{ id: string; cover_img: string }`
  - **Modified**: `PUT /course/updateCourseAdmin` 不再要求包含 `cover_img`（保持向后兼容，可选字段）
- Dependencies:
  - 前端复用现有 `TempImageUpload` 组件、Ant Design、MobX、React Router、Axios，不新增第三方库。
  - 后端需实现新接口，约定临时路径到正式路径的转换逻辑。
