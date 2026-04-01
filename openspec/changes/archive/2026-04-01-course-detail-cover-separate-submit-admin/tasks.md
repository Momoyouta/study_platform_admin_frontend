## 1. API 层与类型定义改造

- [x] 1.1 在 `src/type/course.ts` 新增 `UpdateCourseCoverDto` 类型定义，包含 `id: string` 和 `temp_path: string` 两个字段
- [x] 1.2 在 `src/http/api.ts` 新增 `updateCourseCoverAdmin` 函数，调用 `http.put('/course/updateCourseCoverAdmin', data)` 并返回响应

## 2. 前端组件改造 - 表单与状态管理

- [x] 2.1 在 `src/pages/CourseManage/CourseDetail/index.jsx` 中导入 `updateCourseCoverAdmin` API 方法
- [x] 2.2 改造 `handleSave` 函数：点击保存时，先检查 `cover_img` 字段是否有值，若有则调用 `updateCourseCoverAdmin(id, temp_path)`，再调用 `updateCourseAdmin(id, name, status)`
- [x] 2.3 修改 `TempImageUpload` 的 `onChange` 回调，改为仅将上传返回的路径写入表单值 `(path) => form.setFieldsValue({ cover_img: path })`，不调用接口
- [x] 2.4 在 `handleSave` 的 finally 块中清空 `saving` 状态，确保不卡在 loading 状态

## 3. UI 状态与交互优化

- [x] 3.1 保持单一 `saving` loading 状态变量，在保存按钮上显示 loading 指示器
- [x] 3.2 TempImageUpload 组件移除 `disabled` 属性（用户可在上传中途修改基础信息）
- [x] 3.3 在 `handleSave` 成功回调中调用 `fetchDetail()` 刷新课程详情，确保 cover_img 字段同步
- [x] 3.4 handleSave 的 catch 块中处理错误，若 cover 更新失败则提示"封面更新失败"，基础信息失败则提示"基础信息保存失败"

## 4. 测试与验证

- [ ] 4.1 手工验证：上传封面 → 修改基础信息 → 保存 → 两个接口顺序调用
- [ ] 4.2 手工验证：上传封面失败 → 错误提示 → 可重新上传
- [ ] 4.3 手工验证：仅修改基础信息不上传 → 只调用 updateCourseAdmin，不调用 updateCourseCoverAdmin
- [ ] 4.4 手工验证：封面更新成功但基础信息失败 → 清晰区分两个操作的成功/失败状态
- [ ] 4.5 手工验证：网络异常场景（保存中断、超时等）→ 清晰的错误提示与重试入口
- [x] 4.6 执行项目构建（`pnpm build`）并检查编译错误

## 5. 后端联调与整合

- [ ] 5.1 与后端确认 `PUT /course/updateCourseCoverAdmin` 接口实现，确认字段为 `{ id, temp_path }`
- [ ] 5.2 确认 `PUT /course/updateCourseAdmin` 接口是否向后兼容（若传入 cover_img 是否会被忽略）
- [ ] 5.3 确认临时文件清理机制（后端凌晨定时清除 temp 目录），前端无需管理临时文件生命周期

## 6. 回归测试与部署

- [ ] 6.1 执行完整的端到端场景验证：列表 → 编辑 → 修改并保存 → 返回列表 → 再次进入验证数据
- [ ] 6.2 测试权限边界：非平台管理员编辑、不同学校管理员编辑等权限组合
- [ ] 6.3 执行 linting（ESLint）并修复本次改动引入的规范问题
- [ ] 6.4 确保 UI 布局与样式与现有设计一致，不引入新的样式问题
