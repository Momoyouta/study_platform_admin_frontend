## Context

当前 HomePage (`src/pages/Home/index.jsx`) 为 Vite 默认脚手架模板，仅展示 logo 和测试按钮。路由为扁平结构，所有路由均为 App 的直接子级。项目使用 React 19 + Ant Design 6.x + React Router DOM 7 + MobX 6。

需要将 HomePage 改造为标准后台管理系统布局：左侧 Sider（菜单）+ 顶部 Header + 右侧 Content（路由出口），如用户提供的 UI 设计图所示。

## Goals / Non-Goals

**Goals:**
- 使用 Ant Design `Layout`、`Sider`、`Menu`、`Popover` 等组件实现像素级还原的后台管理布局
- 左侧菜单支持最多 2 级（SubMenu），顶部展示系统名称 + 搜索框
- 顶部导航栏右上角放置 Profile 图标，hover 显示 Popover 气泡弹层
- 菜单点击后在右侧 Content 区域通过 `<Outlet />` 渲染对应路由页面
- 路由从扁平结构改为嵌套结构

**Non-Goals:**
- 不实现权限控制 / 动态菜单
- 不开发具体业务子页面内容
- 不修改登录页

## Decisions

### 1. 布局方案：使用 Ant Design Layout 组件

**选择**: 使用 `antd` 的 `Layout`、`Layout.Sider`、`Layout.Header`、`Layout.Content` 组件组合。

**理由**: 项目已依赖 antd 6.x，Layout 组件提供了开箱即用的侧边栏折叠、响应式等能力，无需额外引入第三方布局库。

**替代方案**: 手写 CSS Flexbox/Grid 布局 —— 增加维护成本且缺少折叠等功能。

### 2. 菜单实现：Ant Design Menu 组件

**选择**: 使用 `Menu` 组件的 `items` prop 配置菜单项，通过 `onClick` 事件配合 `useNavigate` 进行路由跳转。

**理由**: antd Menu 原生支持 SubMenu（二级菜单）、选中高亮、图标等，符合最多 2 级菜单的需求。

### 3. Profile 气泡弹层：Ant Design Popover

**选择**: 使用 `Popover` 组件包裹 Profile 图标，`trigger="hover"` 触发弹出。

**理由**: 完全符合设计图需求（hover 触发），比 Dropdown 更灵活，可自定义弹层内容。

### 4. 路由结构：嵌套路由

**选择**: 将 HomePage 作为布局容器，`/` 渲染 HomePage 布局，菜单对应的子页面作为其 `children` 路由，通过 `<Outlet />` 在 Content 区域渲染。

**理由**: React Router DOM 7 原生支持嵌套路由，可以保证布局组件在切换子页面时不被卸载/重新挂载。

### 5. 菜单配置数据结构

**选择**: 在独立文件（如 `src/config/menuConfig.jsx`）中集中定义菜单配置，每项包含 `key`、`label`、`icon`、`path`、`children` 字段，同时作为菜单渲染和路由注册的统一数据源。

**理由**: 单一数据源减少菜单与路由不一致的风险，便于后续扩展为动态菜单。

## Risks / Trade-offs

- **路由结构改动较大** → 采取渐进式迁移，先建立布局框架和嵌套路由，再逐步添加子页面
- **antd 6.x 为较新版本，Layout API 可能有变化** → 开发前使用 Context7 查阅最新文档确认 API
- **菜单项硬编码** → 当前为静态配置，后续可改为后端返回动态配置
