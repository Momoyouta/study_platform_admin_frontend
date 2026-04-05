## Why

当前管理端缺少统一的“文件管理”入口，平台管理员与学校管理员无法在后台对已上传文件进行分页检索、按条件筛选、重命名、迁移到学校资源库和删除清理，导致文件治理成本高、操作分散且权限边界不清晰。随着分片上传能力稳定，需要补齐管理闭环并显式约束角色数据范围与操作前置条件。

## What Changes

- 新增管理端一级菜单“文件管理”，不包含二级菜单，并新增对应列表页。
- 新增文件分页条件查询能力，支持按 `id`、`fileHash`、`filename`(模糊)、`status`、`type`、`creatorId`、`schoolId` 检索，并支持 `createTime`、`updateTime`、`fileSize` 排序。
- 列表项除 `file_chunk` 字段外，补充返回创建者姓名与学校名称；不返回分片总数和已上传分片序号集合。
- 新增“仅更新文件名”的编辑能力（`/admin/fileChunk/updateFilename`）。
- 新增删除能力（`/admin/fileChunk/delete`），删除数据库记录时同步按 `target_path` 删除物理文件，支持 `force` 容错模式。
- 新增迁移能力（`/admin/fileChunk/moveToSchool`）：通过 `schoolId + fileId` 迁移文件并更新 `target_path`，仅允许 `status=done` 文件执行；`type=1` 迁移到学校 `resource_library/videos`，`type=2` 迁移到 `resource_library/documents`，并采用 hash 命名与二级目录分散存储策略。
- 增加角色约束：学校管理员仅可操作所属学校数据；学校管理员检索时自动带入所属学校 `schoolId` 且不可手输；平台管理员必须输入 `schoolId` 后才允许发起检索。

## Capabilities

### New Capabilities
- `admin-file-chunk-management`: 管理端文件管理列表、检索、重命名、删除与迁移到学校资源库的完整业务能力与权限约束。

### Modified Capabilities
- `sidebar-menu`: 侧边栏菜单能力扩展为包含“文件管理”一级菜单入口并可导航到文件管理页面。

## 非目标 (Non-goals)

- 不改造现有分片上传协议、分片上传流程和断点续传逻辑。
- 不在本次变更中新增文件内容预览、下载鉴权策略重构或批量操作能力。
- 不修改课程资源绑定流程，仅提供后台文件治理能力。

## Impact

- 受影响模块：菜单配置、路由配置、文件管理列表页、文件管理相关 API 封装与类型定义。
- API 影响：新增管理端文件查询、重命名、删除、迁移接口调用；前端与后端响应 DTO 对齐。
- 权限影响：学校管理员与平台管理员在检索与操作范围上出现显式分流校验。
- 存储影响：迁移操作涉及真实文件路径移动和 `target_path` 更新规则的一致性约束。