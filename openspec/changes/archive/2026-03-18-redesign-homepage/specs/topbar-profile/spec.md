## ADDED Requirements

### Requirement: 顶部导航栏
页面顶部 SHALL 展示一个 Header 导航栏，跨越 Content 区域宽度（Sider 右侧到页面右侧），背景为白色。

#### Scenario: Header 正确渲染
- **WHEN** 用户打开首页
- **THEN** 页面顶部 SHALL 展示一个白色背景的导航栏

### Requirement: Profile 图标
Header 右上角 SHALL 展示一个 Profile 用户头像图标。

#### Scenario: Profile 图标正确显示
- **WHEN** 用户打开首页
- **THEN** Header 右侧 SHALL 展示一个用户头像图标（使用 Ant Design 的 UserOutlined 图标）

### Requirement: Profile hover 气泡弹层
用户将鼠标悬停在 Profile 图标上时，SHALL 通过 Ant Design `Popover` 组件弹出一个气泡弹层，展示用户信息和操作选项。

#### Scenario: hover 触发气泡弹层
- **WHEN** 用户将鼠标移入 Profile 图标
- **THEN** SHALL 弹出 Popover 气泡弹层，展示用户基本信息

#### Scenario: 弹层包含退出登录按钮
- **WHEN** Popover 气泡弹层显示
- **THEN** 弹层中 SHALL 包含一个 "退出登录" 按钮

#### Scenario: 点击退出登录
- **WHEN** 用户点击 Popover 中的 "退出登录" 按钮
- **THEN** 系统 SHALL 清除本地存储的 access_token 并跳转到登录页 `/login`
