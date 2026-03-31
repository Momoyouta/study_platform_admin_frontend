## Context

随着课程管理功能的逐步深入，业务上需要在系统中直接管理课程的教学大纲（章节与其包含的课时）。当前课程详情页仅有基础信息、任务编辑等模块。为提供更好的教学编排体验，拟在原有课程编辑详情页中增设“章节课时”标签页。本页面需要构建可视化编辑界面，并能对课时的视频资源进行绑定，整体数据结构使用树形 JSON（chapters -> lessons 的嵌套数组）维护，未来将通过后端接口整体保存结构信息。

## Goals / Non-Goals

**Goals:**
- 提供完整的章节课时可视化组件，支持章节添加，以及章节内部课时的添加、修改与展示。
- 开发独立的课时编辑侧边栏/抽屉（Drawer）组件，用于名称、简介维护及视频资源关联的交互。
- 使用 MobX `useLocalObservable` 或 React local state 进行组件级别的嵌套 JSON 数据状态管理。
- 提供基于已有截图的高保真 UI（基于 Ant Design 定制）。

**Non-Goals:**
- 不包括实际的教学视频分片上传服务的后端支持实现（纯前端交互占位）。
- 在本次变更中不涉及真实的后端全量接口联调，所有数据操作在本地 JSON 状态内流转，并预留接口服务方法。

## Decisions

- **组件模块划分**: 
  - `CourseOutline`: 主入口标签页组件容器，负责从外部获取数据源（或空数据）并下发，统一管理 Save 动作。
  - `ChapterList / ChapterItem`: 渲染大纲树，包含章节信息及列表展示。
  - `LessonItem`: 课时的展示项，右侧根据关联状态显示“名称”或“未挂载” Tag。
  - `LessonEditorDrawer`: 课时编辑右侧抽屉，包含独立表单。
- **状态管理策略**: 面向这棵嵌套的 `chapters` 树，在更通用的层面，将变更限定在这一个独立 Tab 自身内部更加安全和内聚。我们将在 `CourseDetail/components/CourseOutline` 中维护该树形 JSON 的 state。
- **UI 风格设计**: 基于 Ant Design 的 `Card`, `List`, `Button`, `Tag`, 及 `Drawer` 组件实现，利用 Less 添加定制化的内边距与边框、高亮样式。
- **拖拽排序**: 考虑到大纲构建强烈的交互诉求，引入 React 生态主流的 `@dnd-kit/core` 与 `@dnd-kit/sortable` 来实现多层级列表的拖拽排序。章节列表为一级 SortableContext，课时列表为各自独立的二级 SortableContext。

## Risks / Trade-offs

- **Risk: 嵌套拖拽的性能与手势冲突** 
  - 章节和课时都具备拖拽能力，需要依靠 `dnd-kit` 的 `Sortable` 及精确的把手（Drag Handle）设计，来避免滚动条或外层拖拽被误触发。
  - Mitigation: 强制要求采用专用的拖拽 Icon 并绑定 listeners，只允许拖拽 Icon 区域触发排序。
