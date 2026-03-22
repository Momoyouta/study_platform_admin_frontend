# Technical Design: 用户与角色权限管理

## Context 背景
系统需在管理端增加详尽的用户查看与权限隔离机制：
平台人员可管理系统的全局设置及跨校查询，学校人员只能看到自己归属的数据。为了方便组织，将教师、学生、学校管理员归档至“学校管理”子级菜单中，统一样式与操作。

## Architecture 架构设计

### 1. 状态管理依赖
- 在 MobX 的 `UserStore` 中扩充或强校验 `userInfo` 对象的结构（来自 `src/type/user.ts` 的 `BaseUserInfo`），核心字段为：`userRoles: string[]` 与 `schoolId: string`。
- 在路由鉴权设计上，依赖预先定义的 `RoleMap`，将 `userRoles` 包含 `admin` / `root` 定义为平台全权限；若是 `school_admin` / `school_root`，则属于校级权限。

### 2. 菜单动态过滤
- 优化 `src/components/Sidebar/index.jsx` 或对应 `menuConfig.jsx` 结构，补充 `auth` 或 `roles` 配置项。
- 侧边栏渲染时结合 `UserStore.userInfo.userRoles` 剔除无权限访问的菜单配置节点。

### 3. 数据隔离实现
- **接口传参隔离**：对于校级管理员进入诸如“学生列表”、“教师列表”的页面，不需要暴露 `school_id` 的查询输入框，通过全局状态将 `UserStore.userInfo.schoolId` 静默赋予所有的查询请求体。
- 若是平台管理员，由于本身没有确定的 `schoolId`，可为其显示“所属学校”条件的输入框进行选填或必填检索。

## Data Flow 数据流转
1. **获取参数** -> 2. **根据角色填充静默过滤字段** -> 3. **触发 API 调用** -> 4. **拿到数据更新 `mobx` 或本页 `useState`** -> 5. **渲染带正确标签的数据与正确操作按钮**。

## API & Components 接口与组件
- **Components**：继承 `SchoolList` 中的可复用布局（`index.less`）。抽象搜索栏组件（可选）或者复制样式。
- **APIs (`src/http/api.ts`)**: 
  - 添加 `GET /user/findBy...`, `GET /student`, `GET /teacher`, `GET /school-admin` 的 Axios 封装。
  - 需要把 `/school/removeHard/{id}` 和 `DELETE /school-admin/{id}` 分类清楚。

## Risks / Trade-offs 风险与权衡
- 前端过滤菜单不具备真正的抗越权能力，后端对 `schoolId` 是否有充分的数据权限范围隔离是最大的风险。本期需求“不包含服务端接口防穿透”，只关注产品表面展现与参数正确拼装。
