## ADDED Requirements

### Requirement: 管理端文件分页条件查询
系统 SHALL 提供 `GET /admin/fileChunk/query` 分页查询能力，支持 `page`、`pageSize`，并支持按 `id`、`fileHash`、`filename`（模糊）、`status`、`type`、`creatorId`、`schoolId` 条件过滤。

#### Scenario: 平台管理员按条件分页查询
- **WHEN** 平台管理员提供 `schoolId` 并发起分页查询
- **THEN** 系统 SHALL 按过滤条件返回对应学校范围内的文件分页数据

#### Scenario: 学校管理员查询自动限定学校
- **WHEN** 学校管理员发起分页查询
- **THEN** 系统 SHALL 使用该管理员所属学校 ID 作为查询范围并忽略外部传入的 schoolId

### Requirement: 查询结果字段约束
系统 SHALL 在列表项中返回文件基础字段及扩展字段 `creatorName`、`schoolName`，且 SHALL NOT 返回分片总数与已上传分片序号集合。

#### Scenario: 列表返回管理端展示字段
- **WHEN** 查询接口返回分页结果
- **THEN** 每条记录 SHALL 包含 `id`、`fileHash`、`fileName`、`fileSize`、`status`、`targetPath`、`type`、`creatorId`、`schoolId`、`createTime`、`updateTime`、`creatorName`、`schoolName`

### Requirement: 查询排序能力
系统 SHALL 支持 `sortBy` 为 `createTime`、`updateTime`、`fileSize`，并支持 `sortOrder` 为 `ASC` 或 `DESC`。

#### Scenario: 按更新时间倒序排序
- **WHEN** 管理员传入 `sortBy=updateTime` 且 `sortOrder=DESC`
- **THEN** 返回结果 SHALL 按更新时间从新到旧排序

### Requirement: 平台管理员学校条件必填
平台管理员在发起文件检索时 MUST 提供 `schoolId`，未提供时系统 SHALL 阻止检索并返回参数错误。

#### Scenario: 平台管理员缺失 schoolId
- **WHEN** 平台管理员调用查询接口且未传 `schoolId`
- **THEN** 系统 SHALL 返回校验失败并不执行检索

### Requirement: 文件名更新仅允许修改 fileName
系统 SHALL 提供 `PATCH /admin/fileChunk/updateFilename`，且仅更新目标记录的 `fileName` 与 `updateTime`。

#### Scenario: 更新文件名成功
- **WHEN** 管理员传入有效 `id` 与 `fileName`
- **THEN** 系统 SHALL 仅修改该记录的 `fileName` 并返回最新 `updateTime`

### Requirement: 删除文件记录需同步清理物理文件
系统 SHALL 提供 `DELETE /admin/fileChunk/delete`；默认模式下删除记录前 SHALL 按 `target_path` 删除真实文件，`force=true` 时 SHALL 在物理文件异常下继续删除记录并返回强制清理标记。

#### Scenario: 默认删除成功
- **WHEN** 管理员删除存在且可访问物理路径的文件记录
- **THEN** 系统 SHALL 删除物理文件并删除数据库记录

#### Scenario: 强制删除容错
- **WHEN** 管理员传入 `force=true` 且物理文件删除失败
- **THEN** 系统 SHALL 删除数据库记录并在响应中标记 `force=true`

### Requirement: 文件迁移到学校资源库
系统 SHALL 提供 `POST /admin/fileChunk/moveToSchool`，接收 `fileId` 与 `schoolId`，并仅允许 `status=done` 的文件执行迁移；迁移后 SHALL 更新 `targetPath` 与文件完整相对路径。

#### Scenario: 迁移视频文件到学校资源库
- **WHEN** 目标文件 `type=1` 且 `status=done`
- **THEN** 系统 SHALL 将文件迁移到目标学校 `resource_library/videos` 路径并更新记录路径字段

#### Scenario: 迁移文档文件采用 hash 二级目录
- **WHEN** 目标文件 `type=2` 且 `status=done`
- **THEN** 系统 SHALL 将文件迁移到目标学校 `resource_library/documents` 下并使用 hash 命名与二级目录离散规则

#### Scenario: 非 done 状态禁止迁移
- **WHEN** 目标文件状态不为 `done`
- **THEN** 系统 SHALL 拒绝迁移请求并保持原记录不变

#### Scenario: type 为空仅展示禁止迁移
- **WHEN** 目标文件 `type` 为空
- **THEN** 系统 SHALL 允许该记录出现在查询结果中，但 SHALL 拒绝迁移请求

### Requirement: 学校管理员操作范围限制
学校管理员对查询、重命名、删除、迁移操作 SHALL 仅能作用于所属学校数据，跨学校目标 MUST 被拒绝。

#### Scenario: 学校管理员越权操作
- **WHEN** 学校管理员尝试修改或删除非所属学校文件
- **THEN** 系统 SHALL 拒绝请求并返回无权限错误