## Why

当前管理端仪表盘缺少可运营的统计信息，平台管理员与学校管理员无法快速判断用户规模、课程建设、学习参与度和资源使用情况。后端已提供平台/学校双视角统计接口，现阶段需要尽快落地统一可视化大盘，支撑日常运营与决策。

## What Changes

- 改造管理端仪表盘页面，新增统计卡片与图表区，支持平台视角与学校视角展示。
- 增加基于角色的视图控制：
  - 学校管理员仅展示学校视角。
  - 平台管理员/平台超管支持通过 Tab 在平台视角与学校视角间切换，默认平台视角。
- 接入并统一封装以下统计接口的数据请求、加载态、空态与错误态处理：
  - 平台视角：`/admin/statistics/platform/school-funnel`、`/admin/statistics/platform/school-total`、`/admin/statistics/platform/user-total`、`/admin/statistics/platform/storage-usage`、`/admin/statistics/platform/course-summary`
  - 学校视角：`/school/statistics/people-summary`、`/school/statistics/course-summary`、`/school/statistics/asset-summary`、`/school/statistics/learning-summary`
- 使用 `@ant-design/plots` 构建关键图表（如漏斗/柱状/饼图等），与数值指标卡组合展示核心运营指标。

## Non-goals

- 不包含教师视角与学生视角统计页面改造。
- 不改动后端统计口径与接口协议，仅做前端消费与展示。
- 不在本次变更中引入实时推送（WebSocket）或复杂导出能力。

## Capabilities

### New Capabilities
- `admin-statistics-dashboard`: 管理端仪表盘新增平台/学校双视角统计展示能力，包含角色驱动视图控制、指标卡与图表可视化、以及多接口聚合展示。

### Modified Capabilities
- 无

## Impact

- Affected code:
  - `src/pages/Dashboard/index.jsx`
  - `src/env/http/api.ts`
  - 可能新增 `src/pages/Dashboard` 下的子组件与样式文件（如图表卡片、视角切换面板）
- Affected APIs:
  - 新增消费 9 个统计接口（平台 5 个 + 学校 4 个）
- Dependencies:
  - 使用已安装的 `@ant-design/plots` 进行图表渲染
- UX/System impact:
  - 管理首页将从静态/弱信息页升级为可运营分析仪表盘，提升平台与学校管理者的信息获取效率
