## MODIFIED Requirements

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