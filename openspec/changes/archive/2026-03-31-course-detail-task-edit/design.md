## Context

当前课程详情页中的“任务编辑”标签页内容缺失。系统中课程实体包含一个 `description` 字段（TEXT类型），用于存储课程的详细描述或任务要求。由于该内容可能非常大，为了优化性能，将采用单独的接口进行加载。

## Goals / Non-Goals

**Goals:**
- 在“任务编辑”标签页集成一个 Markdown 编辑器。
- 实现内容的异步获取、编辑、即时预览及持久化保存。
- 确保编辑器界面美观且符合 Ant Design 6.x 的风格。

**Non-Goals:**
- **禁止图片上传**: 根据用户指令，严禁图片或附件上传，仅支持纯文本及 Markdown 语法。
- 不涉及任务的审批流或版本管理。

## Decisions

**1. 编辑器选型: `md-editor-rt`**
- **理由**: 现代 React 19 适配良好的 Markdown 编辑器，支持工具栏自定义和预览。

**2. 获取逻辑: 独立接口 `GET /course/getCourseDescriptionAdmin/:id`**
- **理由**: 课程描述内容较大，避免在获取课程基础信息时造成过大的 Payload。

**3. 更新逻辑: 复用 `updateCourseAdmin`**
- **理由**: 现有的更新接口已支持 `description` 字段，且通常编辑后的保存频率较低。

**4. 限制图片上传**
- **理由**: 用户显式要求禁止。通过 `MdEditor` 的工具栏配置移除 `image` 图标，并处理 `onUploadImg`（拦截上传）及粘贴/拖拽事件。

## Risks / Trade-offs

- **[Risk]** 内容加载延迟。 鈫? **Mitigation**: 在 `TaskEditor` 中增加 Loading 状态。
- **[Risk]** 接口权限。 鈫? **Mitigation**: 确保新接口在后端有相应的权限校验。

## Open Questions

- 无。
