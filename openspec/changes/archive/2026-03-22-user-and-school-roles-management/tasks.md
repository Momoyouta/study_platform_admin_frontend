# Implementation Tasks

## Phase 1: API and Map Additions
- [x] 更新 `src/http/api.ts` 添加用户汇总类接口(`getUserById`, `updateUserRoles` 等由文档提供的，加上自行约定的修改状态接口)。
- [x] 添加学生模块接口 (`getStudentList`, `updateStudent`, `deleteStudent`)。
- [x] 添加教师模块接口 (`getTeacherList`, `updateTeacher`, `deleteTeacher`)。
- [x] 添加学校管理员模块接口 (`getSchoolAdminList`, `updateSchoolAdmin`, `deleteSchoolAdmin`)。

## Phase 2: 汇总用户管理页面
- [x] 创建 `src/pages/UserManage/UserList/index.jsx` 与对应 Less 样式。
- [x] 按照“上半部检索+下半部列表”实现基本 UI。
- [x] 实现针对 (id, 姓名, 电话号, 角色) 的筛选逻辑。
- [x] 限制平台超级管理员账号不被平台普通管理员禁用的安全性判断逻辑。

## Phase 3: 学校属人员管理页面
- [x] 编写教师管理列表 `src/pages/SchoolManage/TeacherList/index.jsx`。
- [x] 编写学生管理列表 `src/pages/SchoolManage/StudentList/index.jsx`。
- [x] 编写学校管理员列表 `src/pages/SchoolManage/SchoolAdminList/index.jsx`。
- [x] 编写学校信息页 `src/pages/SchoolManage/SchoolInfo/index.jsx`。
- [x] 列表组件引入针对性逻辑：当非全平台管理员时，请求自动带入所属 `schoolId` 且过滤表单隐藏该条件。

## Phase 4: 路由与权限挂载
- [x] 在 `src/router/route.jsx` 注册以上所有新的功能页面路由。
- [x] 修改 `src/config/menuConfig.jsx`，为各菜单项附带权限声明字段（如：`roles: ['root', 'admin']`）。
- [x] 拦截核心 `src/components/Sidebar/index.jsx` 的渲染过程，对比 `UserStore.userInfo.userRoles` 进行展示或隐藏处理。

## Phase 5: Additional User Requests
- [x] `UserList` 和 `SchoolAdminList` 的角色展示支持 `role_id` 字符串或数组解析，增加 ID 省略及悬浮气泡功能，实现编辑弹窗。
- [x] 优化 `StudentList` 移除角色列，替换为学号，优化 ID 显示并加入编辑功能。
- [x] 优化 `TeacherList` 移除角色列，替换为工号，优化 ID 显示并加入编辑功能。
