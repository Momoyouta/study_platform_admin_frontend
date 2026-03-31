## 1. 结构化构建与基础接入

- [x] 1.1 在 `src/pages/CourseManage/CourseDetail/components` 目录下创建 `CourseOutline` 文件夹，并建立 `index.jsx` 和 `index.less`。
- [x] 1.2 在 `CourseDetail` 的 Tab 配置项中，新增“章节课时”标签，并引入 `CourseOutline` 组件。
- [x] 1.3 在 `CourseOutline` 组件中定义所需的数据 State（使用 React useState/useReducer 或 MobX useLocalObservable），并预载入 JSON 测试数据（包含 chapters 和 lessons）。
- [x] 1.4 如果项目中尚未安装拖拽库，则执行安装：`npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`。

## 2. 大纲列表区组件渲染

- [x] 2.1 在 `CourseOutline` 内部开发大框架渲染（章节列表区、页头等），实现“添加新章节”事件处理（向 state 中添加一个新章节并更新视图）。
- [x] 2.2 开发独立的 `ChapterItem` 的渲染，包含该章节的 Title 以及其内部子数组 `lessons` 的遍历渲染。
- [x] 2.3 实现 `LessonItem` 的样式与布局，右侧根据 `resource_id` 是否为 null 显示“已挂载: {name}”标签（蓝色）或“未挂载”警戒标签（红色）。
- [x] 2.4 实现每个章节下部的“添加课时”交互按钮，点击后向本章节的 lessons 数组追加一个新的空课时记录。
- [x] 2.5 利用 `@dnd-kit` 为章节列表(`ChapterList`)配置 `SortableContext`，实现基于 Drag Handle 的一次级(章节)拖拽排序逻辑。
- [x] 2.6 为内部课时列表(`LessonList`)配置二级的 `SortableContext`，实现基于 Drag Handle 的课时拖拽排序逻辑，并处理嵌套拖拽事件防止冲突。

## 3. 课时编辑抽屉开发

- [x] 3.1 创建独立的 `LessonEditorDrawer.jsx`（基于 Antd Drawer 组件），并控制其开关及数据回显逻辑（依赖选中当前所编辑课时的数据引用）。
- [x] 3.2 实现课时名称、课时简介两项的输入表单域（Input / TextArea）。
- [x] 3.3 实现视频资源管理展示模块（UI对齐设计图），体现目前“上传成功，当前视频：xxx.mp4”的大卡片状态或空白状态。
- [x] 3.4 为“从资源库中选择”按钮增加占位交互响应（本期主要完成假数据选择回调，即模拟调用资源库后赋值给表单，以验证 state 更新流程）。

## 4. 保存联动与接口预留

- [x] 4.1 在 `LessonEditorDrawer` 点击“保存课时”时，收集表单数据并通过透传的回调方法更新至顶部的章节课时 json state 树。
- [x] 4.2 完善顶部“存为草稿”、“发布大纲”按钮UI，并预留其提交动作，打印整个 state 结构确保符合要求。
- [x] 4.3 在 `src/api/course.js` (或相应 service) 中定义相应的 Fetch 和 Update 大纲数据接口定义占位。
