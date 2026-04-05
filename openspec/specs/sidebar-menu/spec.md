## ADDED Requirements

### Requirement: 系统标题展示
Sider 顶部 SHALL 展示系统名称 "在线学习平台 后台管理系统"，背景色采用设计图中的紫灰色主题色。

#### Scenario: 系统标题正确显示
- **WHEN** 用户打开首页
- **THEN** Sider 顶部区域 SHALL 展示 "在线学习平台" 和 "后台管理系统" 两行文字

### Requirement: 搜索框
系统标题下方 SHALL 展示一个搜索输入框，供用户快速搜索菜单项。

#### Scenario: 搜索框正确渲染
- **WHEN** 用户打开首页
- **THEN** 系统标题下方 SHALL 展示一个带搜索图标的输入框

### Requirement: 菜单渲染
Sider SHALL 使用 Ant Design `Menu` 组件渲染菜单，支持最多 2 级菜单结构（一级菜单和 SubMenu 下的二级菜单项），并 SHALL 支持“文件管理”作为一级叶子菜单项（无二级菜单）。

#### Scenario: 一级菜单渲染
- **WHEN** 用户打开首页
- **THEN** 侧边栏 SHALL 展示所有配置的一级菜单项

#### Scenario: 二级菜单展开
- **WHEN** 用户点击一个包含子菜单的一级菜单项
- **THEN** 该菜单项 SHALL 展开并显示其下所有二级菜单项

#### Scenario: 文件管理菜单项渲染
- **WHEN** 系统加载侧边栏菜单配置
- **THEN** 侧边栏 SHALL 展示“文件管理”一级菜单且该菜单项 SHALL 直接关联文件管理列表路由

### Requirement: 菜单项路由导航
每个菜单项（叶子节点）SHALL 关联一个路由路径，点击后跳转到对应路由并在 Content 区域渲染内容。

#### Scenario: 点击菜单项导航
- **WHEN** 用户点击一个叶子菜单项
- **THEN** 浏览器 URL SHALL 变更为该菜单项关联的路由路径，Content 区域 SHALL 渲染对应页面

### Requirement: 菜单主题色
菜单整体 SHALL 使用设计图中的紫灰色主题（侧边栏背景色为深紫灰色，选中/hover 时高亮）。

#### Scenario: 菜单主题色正确
- **WHEN** 用户查看侧边栏菜单
- **THEN** 菜单背景色 SHALL 为深紫灰色，文字为白色，选中项有高亮效果
