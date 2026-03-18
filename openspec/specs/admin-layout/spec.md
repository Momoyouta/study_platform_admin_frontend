## ADDED Requirements

### Requirement: 后台管理系统标准布局
系统 SHALL 提供一个包含左侧 Sider、顶部 Header 和右侧 Content 的标准后台管理布局，使用 Ant Design `Layout` 组件实现。

#### Scenario: 布局结构正确渲染
- **WHEN** 用户访问首页 `/`
- **THEN** 页面 SHALL 展示左侧固定侧边栏 + 顶部导航栏 + 右侧内容区域的三栏布局

#### Scenario: Content 区域渲染路由内容
- **WHEN** 用户点击左侧菜单中的某个菜单项
- **THEN** 右侧 Content 区域 SHALL 通过 `<Outlet />` 渲染该菜单项对应的子路由页面内容

### Requirement: Sider 固定定位
左侧 Sider SHALL 固定在页面左侧，不跟随页面滚动，宽度固定。

#### Scenario: 滚动时 Sider 保持固定
- **WHEN** 右侧 Content 区域内容超出可视高度，用户滚动页面
- **THEN** 左侧 Sider SHALL 保持固定不动

### Requirement: 布局撑满全屏
整体布局 SHALL 占满浏览器可视区域高度（100vh），不出现页面级滚动条（仅 Content 区域内部可滚动）。

#### Scenario: 全屏展示
- **WHEN** 用户打开首页
- **THEN** 布局 SHALL 占满浏览器视口高度和宽度
