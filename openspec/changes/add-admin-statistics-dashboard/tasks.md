## 1. 接口与类型准备

- [x] 1.1 在 `src/http/api.ts` 新增平台视角 5 个统计接口方法（school-funnel、school-total、user-total、storage-usage、course-summary）
- [x] 1.2 在 `src/http/api.ts` 新增学校视角 4 个统计接口方法（people-summary、course-summary、asset-summary、learning-summary）
- [x] 1.3 在 `src/type` 下新增或扩展统计 DTO 类型定义，覆盖所有响应字段与公共查询参数

## 2. 仪表盘页面骨架与角色控制

- [x] 2.1 重构 `src/pages/Dashboard/index.jsx` 为容器页，接入角色识别（`root/admin/school_root/school_admin`）
- [x] 2.2 为平台角色实现“平台视角/学校视角”Tab 切换，默认激活平台视角
- [x] 2.3 为学校角色隐藏平台视角入口，仅渲染学校视角内容

## 3. 平台视角统计实现

- [x] 3.1 实现平台视角数据加载编排，并行请求 5 个平台统计接口
- [x] 3.2 实现学校入驻漏斗与合作学校总量展示（totalApply/approved/rejected/schoolTotal）
- [x] 3.3 实现平台用户规模展示（total/teacherTotal/studentTotal）
- [x] 3.4 实现存储容量与占比展示（totalBytes/videoBytes/normalBytes/videoRatio）
- [x] 3.5 实现课程建设概览展示（totalCourses/publishedCourses/publishedRatio）

## 4. 学校视角统计实现

- [x] 4.1 实现学校视角数据加载编排，并行请求 4 个学校统计接口
- [x] 4.2 实现本校人员与学院分布展示（activeTeachers/activeStudents/collegeDistribution）
- [x] 4.3 实现课程建设与教学资产展示（course-summary + asset-summary）
- [x] 4.4 实现学习参与与作业质量展示（avgProgressPercent/assignmentSubmitRate/avgScoreRate）
- [x] 4.5 支持平台角色在学校视角透传可选 `schoolId` 参数

## 5. 可视化、筛选与容错能力

- [x] 5.1 使用 `@ant-design/plots` 完成漏斗图、占比图、分布图等图表渲染
- [x] 5.2 实现统一查询参数管理，支持 `startTime/endTime` 透传到所有统计接口
- [x] 5.3 实现百分比与存储容量格式化工具（比率归一化、字节单位转换）
- [x] 5.4 实现分区级加载态、空态、错误态与单区块重试能力

## 6. 联调与验收

- [x] 6.1 按四类角色完成页面可见性与默认视角验证（root/admin/school_root/school_admin）
- [x] 6.2 完成平台视角与学校视角字段映射核对，确保与接口 JSON 一致
- [x] 6.3 完成响应式与图表可读性验收（桌面端与移动端）
