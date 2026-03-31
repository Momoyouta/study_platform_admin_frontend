# 需求说明：功能参数及交互响应

## 1. 列表公共规范
- 布局均为：上半部分搜索输入框，下半部分 List（表格形式）。
- 操作列在最右侧，包含“编辑”（打开修改弹窗，暂只提示弹窗）、“启用/禁用”切换按钮。
- 用户角色无法在这里进行编辑。
- 账号、手机号直接通过字段映射显示；创建与修改时间如果返回单位为秒，需要做 `moment.unix(value).format('YYYY-MM-DD HH:mm:ss')` 转换。

## 2. 权限过滤矩阵

| 菜单/页面 | 平台超级管理 (root) | 平台管理员 (admin) | 学校超管 (school_root) | 学校管理员 (school_admin) |
| --- | --- | --- | --- | --- |
| 用户管理 (汇总) | ✅ | ✅ (无权禁用 root) | ❌ | ❌ |
| 学校列表 | ✅ | ✅ | ❌ | ❌ |
| 学校信息 | ❌ | ❌ | ✅ | ❌ |
| 学校管理员管理 | ✅ (需自输school_id) | ✅ (需自输school_id) | ✅ (默认本校id) | ✅ (默认本校id) |
| 邀请码管理 | ✅ (需自输school_id) | ✅ (需自输school_id) | ✅ (默认本校id) | ✅ (默认本校id) |
| 教师管理 | ✅ | ✅ | ✅ | ✅ |
| 学生管理 | ✅ | ✅ | ✅ | ✅ |

### 2.1 强制过滤条件
对于学校管理员（及学校超管），在获取“教师/学生/学校管理/邀请码管理”列表时，搜索表单不可见 `schoolId` (或 `school_id`) 选择项，系统自动合并参数 `{ school_id: store.userInfo.schoolId }` 调用接口。

## 3. 分列表请求定义
为了保持接口统一风格及 `.then()` 语法，相关 API 定义如下：
- 用户：`getUserList`, `updateUserStatus` (需自行判断并阻止 `root` 角色的禁用)。
- 学生：`getStudentList`, `updateStudent`, `deleteStudent` (如果是软删除也可看作禁用)。
- 教师：`getTeacherList`, `updateTeacher`, `deleteTeacher`。
- 学校管理员：`getSchoolAdminList`, `updateSchoolAdmin`, `deleteSchoolAdmin`。
- 邀请码：`getInviteList`, `createInvite`, `deleteInvite`。

## 4. 课程列表管理需求

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

#### Scenario: 将课程从此未发布切换为已发布
- **WHEN** 管理员在课程操作列执行“发布”操作
- **THEN** 系统调用 updateCourseAdmin，提交 { id, status: 1 } 并在成功后更新列表状态

#### Scenario: 将课程从已发布切换为未发布
- **WHEN** 管理员在课程操作列执行“下架”操作
- **THEN** 系统调用 updateCourseAdmin，提交 { id, status: 0 } 并在成功后更新列表状态

### Requirement: Course list columns SHALL match updated admin list response
系统 MUST 映射 `school_name` 字段，且不得在课程列表中展示章节数 (chapter_count) 或 课时数 (total_lesson_count)。

#### Scenario: 渲染更新后的列结构
- **WHEN** 课程列表数据加载完成
- **THEN** 表格中包含“学校名称”列
- **THEN** 表格中不再包含“章节数”和“课时数”列

### Requirement: 管理员点击编辑应跳转至课程详情页
系统 MUST 在管理员点击课程列表操作列中的“编辑”时，跳转至 `/courseDetail?courseId=<id>`，且保持顶栏和侧边栏不卸载。

#### Scenario: 从列表跳转至详情
- **WHEN** 管理员点击课程 ID 为 `C001` 的操作列“编辑”按钮
- **THEN** 浏览器路由跳转至 `/courseDetail?courseId=C001`
- **THEN** 页面在现有管理员布局（TopBar 与 Sidebar）内渲染

### Requirement: 课程详情页应加载并展示基础数据
系统 SHALL 通过接口 `GET /course/getCourseBasicAdmin/{id}` 拉取详情，并展示包括 ID、学校名称、任课老师等在内的所有基础字段。

#### Scenario: 进入详情页自动加载
- **WHEN** 携带有效 `courseId` 进入详情页
- **THEN** 系统调用详情接口并回显所有基础信息

#### Scenario: 路由缺少课程ID
- **WHEN** 进入详情页但 URL 中不含 `courseId` 参数
- **THEN** 系统展示错误引导提示并阻止发起详情查询请求

### Requirement: 详情页仅允许编辑核心基础字段
系统 MUST 仅开放 `name`、`cover_img`、`status` 及 `description` 字段的编辑权限，其余字段均作为只读描述项展示。

#### Scenario: 保存更新时仅提交允许字段
- **WHEN** 管理员修改名称、状态或任务描述并点击保存
- **THEN** 系统调用 `PUT /course/updateCourseAdmin` 提交 payload 仅包含 `id`、`name`、`cover_img`、`status`、`description`

### Requirement: 封面图更新必须复用 TempImageUpload 组件
系统 MUST 使用 `TempImageUpload` 组件处理封面上传，确保异步上传成功后再将路径写入表单。

#### Scenario: 上传封面并保存
- **WHEN** 用户通过组件上传新图
- **THEN** 系统获取后端返回的 temp 路径并支持实时预览
