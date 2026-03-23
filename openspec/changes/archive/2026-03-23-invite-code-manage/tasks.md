# 任务：邀请码管理

# 1. API 实施
- [x] 1.1 在 `@/http/api.ts` 中添加 `getInviteList`、`createInvite` 和 `deleteInvite`。
- [x] 1.2 创建 `src/type/invite.ts` 用于类型定义。

# 2. 页面与导航
- [x] 2.1 在 `src/config/menuConfig.jsx` 中添加菜单项。
- [x] 2.2 在 `src/router/route.jsx` 中添加路由。
- [x] 2.3 创建页面目录 `src/pages/SchoolManage/InviteCodeManage/`。

# 3. 组件开发
- [x] 3.1 使用 `antd` 实现 `InviteCodeManage` 主组件。
- [x] 3.2 实现具有基于角色的 `school_id` 可见性的搜索表单。
- [x] 3.3 实现具有邀请码复制功能和过期状态逻辑的列表表格。
- [x] 3.4 实现具有单位转换为秒 TTL 的创建弹窗。

# 4. 验证
- [x] 4.1 验证列表加载和分页。
- [x] 4.2 验证搜索过滤器（尤其是针对不同角色的 `school_id`）。
- [x] 4.3 验证使用不同 TTL 单位（小时/天）的代码创建。
- [x] 4.4 验证删除功能。
