## 1. 准备工作

- [x] 1.1 安装依赖库 `md-editor-rt` 及其样式组件
- [x] 1.2 在 `src/http/api.ts` 中新增 `getCourseDescriptionAdmin` 接口定义
- [x] 1.3 确认 `src/http/api.ts` 中的 `updateCourseAdmin` 接口支持 `description` 字段

## 2. 核心组件开发

- [x] 2.1 在 `src/pages/CourseManage/CourseDetail/` 目录下创建 `TaskEditor` 子目录及组件文件
- [x] 2.2 在 `TaskEditor` 中集成 `MdEditor` 并配置禁用图片上传（工具栏配置）
- [x] 2.3 在 `TaskEditor` 中实现 `onUploadImg` 及 `onPaste` 勾子函数，拦截图片粘贴/拖拽
- [x] 2.4 实现 `TaskEditor` 的初始化加载逻辑，调用 `getCourseDescriptionAdmin` 并显示 Loading
- [x] 2.5 实现 `TaskEditor` 的保存逻辑，调用 `updateCourseAdmin` 接口

## 3. 页面集成与优化

- [x] 3.1 在 `CourseDetail/index.jsx` 中引入并使用 `TaskEditor` 组件替换“任务编辑”标签页的占位内容
- [x] 3.2 调整 `index.less` 样式以适配编辑器布局，确保编辑器容器美观
- [x] 3.3 验证保存成功后的反馈提示及数据回显

## 4. 测试与验证

- [x] 4.1 确认图片上传按钮在工具栏不可见
- [x] 4.2 验证尝试粘贴/拖拽图片时能被有效拦截
- [x] 4.3 验证大文本内容加载性能良好且无卡顿
