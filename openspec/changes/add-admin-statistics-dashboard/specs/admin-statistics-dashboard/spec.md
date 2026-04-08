## ADDED Requirements

### Requirement: 仪表盘视角可见性必须按角色控制
系统 MUST 根据登录用户角色控制管理端仪表盘可见视角。

#### Scenario: 平台角色默认进入平台视角并可切换
- **WHEN** 角色为 `root` 或 `admin` 的用户访问仪表盘
- **THEN** 系统显示“平台视角 / 学校视角”切换 Tab，且默认激活“平台视角”
- **THEN** 用户可通过 Tab 在两个视角之间切换

#### Scenario: 学校角色仅可见学校视角
- **WHEN** 角色为 `school_root` 或 `school_admin` 的用户访问仪表盘
- **THEN** 系统仅展示学校视角内容
- **THEN** 系统不得展示平台视角入口

### Requirement: 仪表盘必须支持统一时间筛选参数透传
系统 MUST 支持 `startTime` 与 `endTime` 筛选参数，并透传到所有统计接口请求。

#### Scenario: 默认使用最近 30 天时间范围
- **WHEN** 用户首次进入仪表盘
- **THEN** 系统默认采用“最近 30 天”作为时间筛选范围
- **THEN** 系统调用统计接口时请求参数包含该范围的 `startTime` 与 `endTime`

#### Scenario: 指定时间范围后刷新平台视角数据
- **WHEN** 用户设置起止时间并刷新平台视角
- **THEN** 系统调用平台统计接口时请求参数包含 `startTime` 与 `endTime`

#### Scenario: 提供快捷时间选项
- **WHEN** 用户切换时间快捷选项
- **THEN** 系统至少提供“最近 7 天”和“最近 30 天”两个选项
- **THEN** 系统基于选项更新并透传 `startTime` 与 `endTime`

### Requirement: 平台视角必须展示学校入驻分布与合作学校总量
系统 MUST 在平台视角聚合学校入驻分布图与已入驻学校总量。

#### Scenario: 平台视角加载学校入驻分布
- **WHEN** 平台视角初始化加载
- **THEN** 系统调用 `GET /admin/statistics/platform/school-funnel`
- **THEN** 页面展示 `totalApply`、`approved`、`rejected` 三项指标与空心饼状图可视化
- **THEN** 该图表与“合作学校总量”卡片在同一行展示

#### Scenario: 平台视角加载合作学校总量
- **WHEN** 平台视角初始化加载
- **THEN** 系统调用 `GET /admin/statistics/platform/school-total`
- **THEN** 页面展示 `schoolTotal` 指标

### Requirement: 平台视角必须展示平台用户规模指标
系统 MUST 在平台视角展示平台注册用户总数、教师总数与学生总数。

#### Scenario: 平台视角加载用户规模
- **WHEN** 平台视角初始化加载
- **THEN** 系统调用 `GET /admin/statistics/platform/user-total`
- **THEN** 页面展示 `total`、`teacherTotal`、`studentTotal` 三项指标

### Requirement: 平台视角必须展示存储容量与类型占比
系统 MUST 在平台视角展示全平台存储消耗及视频/普通文件占比。

#### Scenario: 平台视角加载存储统计
- **WHEN** 平台视角初始化加载
- **THEN** 系统调用 `GET /admin/statistics/platform/storage-usage`
- **THEN** 页面展示 `totalBytes`、`videoBytes`、`normalBytes` 与 `videoRatio` 对应可视化

### Requirement: 平台视角必须展示课程建设概览
系统 MUST 在平台视角展示课程总量、已发布课程数及上架率。

#### Scenario: 平台视角加载课程概览
- **WHEN** 平台视角初始化加载
- **THEN** 系统调用 `GET /admin/statistics/platform/course-summary`
- **THEN** 页面展示 `totalCourses`、`publishedCourses`、`publishedRatio` 指标

### Requirement: 学校视角必须展示本校人员规模与学院分布
系统 MUST 在学校视角展示已激活教师数、学生数与学院分布。

#### Scenario: 学校角色加载本校人员统计
- **WHEN** 学校角色用户进入学校视角
- **THEN** 系统调用 `GET /school/statistics/people-summary`
- **THEN** 页面展示 `activeTeachers`、`activeStudents` 与 `collegeDistribution` 可视化

#### Scenario: 平台角色在学校视角指定学校ID
- **WHEN** 平台角色在学校视角输入学校 ID 并刷新
- **THEN** 系统调用 `GET /school/statistics/people-summary` 时请求参数包含 `schoolId`

### Requirement: 平台角色在学校视角必须先选择 schoolId
系统 MUST 在平台角色访问学校视角时强制要求 `schoolId`，未指定时不得请求学校统计接口。

#### Scenario: 未输入 schoolId 时阻止加载
- **WHEN** 平台角色切换到学校视角且未输入 `schoolId`
- **THEN** 系统提示需先输入学校 ID
- **THEN** 系统不得调用任一 `/school/statistics/*` 接口

#### Scenario: 输入 schoolId 后允许加载
- **WHEN** 平台角色输入有效 `schoolId` 并触发查询
- **THEN** 系统允许调用学校视角所有统计接口并渲染结果

### Requirement: 学校视角必须展示课程建设与教学资产统计
系统 MUST 在学校视角展示课程建设情况与教学资产沉淀情况。

#### Scenario: 学校视角加载课程建设情况
- **WHEN** 学校视角初始化加载
- **THEN** 系统调用 `GET /school/statistics/course-summary`
- **THEN** 页面展示 `totalCourses`、`publishedCourses`、`publishedRatio`

#### Scenario: 学校视角加载教学资产情况
- **WHEN** 学校视角初始化加载
- **THEN** 系统调用 `GET /school/statistics/asset-summary`
- **THEN** 页面展示 `materialLibraryCount` 与 `activeTeachingGroups`

### Requirement: 学校视角必须展示学习参与度与作业完成质量
系统 MUST 在学校视角展示整体学习进度、提交率与得分率。

#### Scenario: 学校视角加载学习质量统计
- **WHEN** 学校视角初始化加载
- **THEN** 系统调用 `GET /school/statistics/learning-summary`
- **THEN** 页面展示 `avgProgressPercent`、`assignmentSubmitRate`、`avgScoreRate`

### Requirement: 图表渲染必须使用 ant-design/plots
系统 MUST 使用 `@ant-design/plots` 渲染仪表盘中的统计图表。

#### Scenario: 图表组件来源校验
- **WHEN** 仪表盘渲染漏斗图、占比图、分布图
- **THEN** 页面图表组件来自 `@ant-design/plots`

### Requirement: 学院分布数据为空时必须隐藏图表区域
系统 MUST 在学院分布无数据时隐藏学院分布图表区域。

#### Scenario: 学院分布为空
- **WHEN** `collegeDistribution` 为空数组或不存在
- **THEN** 系统仅展示人员基础指标
- **THEN** 系统不渲染学院分布图表区

### Requirement: 比率类字段展示精度必须统一为两位小数
系统 MUST 将所有比率类字段统一格式化为保留 2 位小数的百分比文本。

#### Scenario: 比率字段格式化输出
- **WHEN** 页面展示 `publishedRatio`、`videoRatio`、`avgProgressPercent`、`assignmentSubmitRate`、`avgScoreRate`
- **THEN** 每个字段均以两位小数百分比形式显示（例如 `72.35%`）

### Requirement: 仪表盘必须具备可恢复的加载与异常处理
系统 MUST 对多接口请求提供独立加载态与失败重试能力，避免单接口失败导致整页不可用。

#### Scenario: 部分接口失败时局部降级
- **WHEN** 某个统计接口请求失败
- **THEN** 失败区域显示错误提示与重试入口
- **THEN** 其他接口对应区域继续展示成功数据

#### Scenario: 触发重试后重新获取失败区域数据
- **WHEN** 用户点击失败区域的重试操作
- **THEN** 系统仅重新请求该区域依赖的统计接口
- **THEN** 请求成功后该区域恢复正常展示
