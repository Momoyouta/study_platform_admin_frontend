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
