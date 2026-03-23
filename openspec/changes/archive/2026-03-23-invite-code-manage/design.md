# 设计：邀请码管理

## 概观
该功能为邀请码添加了一个管理界面，允许管理员控制用户如何加入学校和课程。

## 技术设计
### API
在 `src/http/api.ts` 中新增三个端点：
- `getInviteList(params)`: `GET /admin/invite`
- `createInvite(data)`: `POST /admin/invite`
- `deleteInvite(code)`: `DELETE /admin/invite/${code}`

### 组件
- **InviteCodeManage**: 主页面组件。
- **InviteSearchForm**: 搜索过滤器（邀请码、creater_id、school_id、class_id、grade、type）。
- **InviteTable**: 列表展示，支持邀请码点击复制和过期状态逻辑。
- **CreateInviteModal**: 表单生成新邀请码，支持 TTL 转换（天/小时转换为秒）。

### 状态管理
- 使用 React Hooks (`useState`, `useEffect`) 处理局部组件状态。
- 使用 `MobX` (`Store.UserStore`) 处理全局用户信息和基于角色的逻辑。

## UI/UX 设计
- 遵循 `SchoolAdminList` 的布局：顶部搜索栏 + 底部表格。
- 使用 `antd` 组件以获得一致的高级外观。
- 表格列：
  - 邀请码（宽度 120px，省略，链接样式，点击复制）
  - 类型（0：教师加入学校，1：学生加入学校，2：学生加入课程）
  - 状态（有效/无效 Tag：`now - create_time > ttl`）
  - 学校名称
  - 创建人姓名
  - 年级
  - 创建时间（格式化）
  - 有效期 (TTL)（格式化）
  - 操作（删除）

## 风险 / 权衡
- 状态逻辑 `now - create_time > ttl` 依赖于客户端系统时钟。
- 拼写 `creater_id` 遵循后端 API 规范。
