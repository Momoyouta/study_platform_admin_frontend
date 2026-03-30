## ADDED Requirements

### Requirement: 管理员可分页条件查询课程列表
系统 MUST 提供管理员课程列表查询能力，并通过 listCourseAdmin 接口支持分页参数与限定筛选项。

#### Scenario: 使用允许的筛选项发起分页查询
- **WHEN** 管理员在课程列表页输入 keyword、status、school_id 并执行查询
- **THEN** 系统调用 listCourseAdmin，且请求参数包含 page、pageSize、keyword、status、school_id

#### Scenario: 查询层不暴露非本期筛选条件
- **WHEN** 管理员使用课程列表查询能力
- **THEN** 系统查询表单与请求参数不得以筛选语义要求 teacher_names、chapter_count、total_lesson_count

### Requirement: 平台角色查询前必须输入学校ID
系统 MUST 在平台超级管理员与平台管理员执行课程列表查询前强制校验 school_id。

#### Scenario: 平台角色未填写学校ID时阻断查询
- **WHEN** 平台超级管理员或平台管理员未填写 school_id 并点击查询
- **THEN** 系统阻止发起 listCourseAdmin 请求，并提示“请先输入学校ID”

#### Scenario: 平台角色填写学校ID后允许查询
- **WHEN** 平台超级管理员或平台管理员填写合法 school_id 后点击查询
- **THEN** 系统允许发起 listCourseAdmin 请求并展示返回结果

### Requirement: 管理员可在课程列表页创建课程
系统 MUST 在课程列表页提供创建课程入口，并调用 createCourseAdmin 完成创建。

#### Scenario: 点击创建课程按钮打开创建弹窗
- **WHEN** 管理员点击“创建课程”按钮
- **THEN** 系统显示创建课程表单，至少包含 name（必填）、school_id、cover_img、description 字段

#### Scenario: 必填字段满足后可成功创建并刷新列表
- **WHEN** 管理员填写 name 并提交创建表单
- **THEN** 系统调用 createCourseAdmin，创建成功后关闭弹窗并刷新课程列表

### Requirement: 管理员可切换课程发布状态
系统 MUST 支持在课程列表操作列中切换课程状态，并调用 updateCourseAdmin 持久化状态变更。

#### Scenario: 将课程从未发布切换为已发布
- **WHEN** 管理员在课程操作列执行“发布”操作
- **THEN** 系统调用 updateCourseAdmin，提交 { id, status: 1 } 并在成功后更新列表状态

#### Scenario: 将课程从已发布切换为未发布
- **WHEN** 管理员在课程操作列执行“下架”操作
- **THEN** 系统调用 updateCourseAdmin，提交 { id, status: 0 } 并在成功后更新列表状态

### Requirement: 编辑操作在本期保持占位
系统 MUST 在课程列表操作列保留“编辑”入口，但本期不得进入多表详情编辑流程。

#### Scenario: 点击编辑时仅反馈占位状态
- **WHEN** 管理员点击课程操作列中的“编辑”
- **THEN** 系统仅显示“功能建设中”提示或等效占位反馈，不执行详情页编辑逻辑
