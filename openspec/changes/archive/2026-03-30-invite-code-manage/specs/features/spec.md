## ADDED Requirements

### Requirement: 课程邀请码必须提供课程标识
系统在创建邀请码时，若类型为“学生加入课程”，前端 MUST 展示并校验 `course_id` 字段，且提交请求 MUST 包含 `course_id`。

#### Scenario: 选择课程邀请码类型时展示课程ID输入
- **WHEN** 用户在“创建邀请码”弹窗中将类型选择为“学生加入课程”
- **THEN** 系统显示 `course_id` 输入项，并标记为必填

#### Scenario: 课程邀请码缺少课程ID时禁止提交
- **WHEN** 用户选择“学生加入课程”并尝试提交，但 `course_id` 为空
- **THEN** 系统阻止提交并展示表单校验错误

#### Scenario: 课程邀请码提交时携带 course_id
- **WHEN** 用户选择“学生加入课程”，填写合法 `course_id` 后提交
- **THEN** 系统调用创建接口时请求体包含 `course_id` 字段

#### Scenario: 非课程邀请码类型不强制 course_id
- **WHEN** 用户选择“老师加入学校”或“学生加入学校”类型创建邀请码
- **THEN** 系统不要求填写 `course_id`，并且请求体不以必填语义依赖该字段

### Requirement: 邀请码实体支持课程维度字段
系统中的邀请码实体定义 MUST 支持 `course_id` 属性，以承载课程邀请码的关联数据。

#### Scenario: 创建数据模型包含 course_id
- **WHEN** 业务侧创建“学生加入课程”邀请码
- **THEN** 邀请码实体可持有并传递 `course_id` 字段值
