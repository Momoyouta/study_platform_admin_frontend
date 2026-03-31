## Why

<!-- Explain the motivation for this change. What problem does this solve? Why now? -->
当前课程详情页中的“任务编辑”标签页仅为占位内容。为了完善课程教学流程，需要为管理员（老师）提供一个功能完善的 Markdown 文本编辑器，以便编辑和发布课程任务，并能实时预览效果。

## What Changes

<!-- Describe what will change. Be specific about new capabilities, modifications, or removals. -->
- **新增 Markdown 编辑器**: 在课程详情的“任务编辑”标签页集成现代化的 Markdown 编辑器（推荐使用 `md-editor-rt`）。
- **实时预览功能**: 编辑器需支持 Markdown 源码与预览界面的实时切换或并排显示。
- **保存/提交功能**: 提供“保存内容”按钮，将编辑好的 Markdown 文本提交至后端。
- **数据回显**: 进入页面时自动获取并回显已有的任务内容。
- **交互优化**: 添加提交时的 Loading 状态及成功/失败的反馈提示。

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- `course-task-editor`: 提供 Markdown 文本编辑、预览及保存课程任务的能力。

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `course-detail`: 扩展现有的课程详情页，激活并实现“任务编辑”标签页。

## Impact

<!-- Affected code, APIs, dependencies, systems -->
- **依赖库**: 线安装 `md-editor-rt` 及其必要依赖。
- **页面文件**: 修改 `src/pages/CourseManage/CourseDetail/index.jsx`。
- **接口应用**: 调用后端相关接口（获取任务详情、更新任务内容）。
- **样式文件**: 更新 `src/pages/CourseManage/CourseDetail/index.less`（如需）。

## 非目标 (Non-goals)
- 本次变更不涉及图片或附件的上传处理（除非编辑器库自带支持且配置简单）。
- 不涉及任务的审批流或版本管理。
- 不涉及作业管理标签页的实现。
