# 4.拆分页面组件
请将当前页面重构为更合理、更易维护的 React 组件结构。

要求：
1. 保持 React + TypeScript + Ant Design 技术栈
2. 按职责拆分为清晰的子组件
3. 为每个组件补充明确的 props 类型
4. 页面容器组件保持简洁
5. 不要过度设计
6. 结构要适合真实业务项目维护

建议拆分方向：
- PageHeader 页面头部
- SearchForm 查询筛选区
- DataTable 数据表格区
- StatCards 统计卡片区
- EditModal 编辑弹窗
- DetailDrawer 详情抽屉
- EmptyState 空状态组件（如有需要）

输出格式：
1. 推荐文件结构
2. 每个组件的职责说明
3. 更新后的主页面代码
4. 拆分后的子组件代码
5. 对应的 TypeScript 类型定义