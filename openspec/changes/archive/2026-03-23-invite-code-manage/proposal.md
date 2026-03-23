# 提案：邀请码管理

## 目标
在“学校管理”菜单下实现一个新的“邀请码管理”页面。该页面允许学校和平台管理员创建、查看和删除邀请码，用于教师和学生加入学校或课程。

## 动机
目前，平台依靠邀请码进行教师和学生的入驻，但缺乏专门的 UI 供管理员管理这些代码（例如，生成新代码、跟踪现有代码或删除过期/不需要的代码）。

## 影响范围
- **API 支持**：在 `@/http/api.ts` 中添加 `getInviteList`、`createInvite` 和 `deleteInvite`。
- **页面**：创建新页面 `src/pages/SchoolManage/InviteCodeManage/index.jsx`。
- **导航**：
    - 在 `src/config/menuConfig.jsx` 中添加 `invite-code-manage` 菜单项。
    - 在 `src/router/route.jsx` 中添加相应的路由。
- **状态管理**：利用 `Store.UserStore` 处理基于角色的逻辑和 `schoolId` 的获取。
