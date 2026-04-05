## 1. 菜单与路由接入

- [x] 1.1 在菜单配置中新增“文件管理”一级叶子菜单项，并配置可访问路径
- [x] 1.2 在路由配置中新增文件管理页面路由并完成页面骨架接入
- [x] 1.3 校验侧边栏高亮与路由跳转行为，确保“文件管理”可直接进入列表页

## 2. 管理端接口与类型契约

- [x] 2.1 新增文件管理查询/重命名/删除/迁移的前端 API 封装（`/admin/fileChunk/query`、`/admin/fileChunk/updateFilename`、`/admin/fileChunk/delete`、`/admin/fileChunk/moveToSchool`）
- [x] 2.2 新增或更新 TypeScript DTO 类型，覆盖查询参数、列表返回项、重命名/删除/迁移请求与响应字段
- [x] 2.3 对齐列表字段约束，确保前端不依赖分片总数与分片序号集合字段

## 3. 文件管理列表页实现

- [x] 3.1 实现筛选表单：`id`、`fileHash`、`filename`（模糊）、`status`、`type`、`creatorId`、`schoolId`、排序字段与排序方向
- [x] 3.2 实现分页表格展示：文件基础字段 + `creatorName`、`schoolName`
- [x] 3.3 实现平台管理员“schoolId 必填后检索”的前端校验与交互提示
- [x] 3.4 实现学校管理员自动注入所属学校 ID，隐藏或禁用 schoolId 输入

## 4. 行级操作能力

- [x] 4.1 实现“编辑文件名”弹窗与提交流程，保证仅更新 `fileName`
- [x] 4.2 实现“删除文件”操作，支持 `force` 选项与结果反馈
- [x] 4.3 实现“迁移到学校资源库”操作，仅在 `status=done` 时可执行并提交 `fileId + schoolId`
- [x] 4.4 根据 `type` 显示迁移目标提示（视频到 `videos`、文档到 `documents`）并处理失败提示
