# 第一步:分析参考网页

使用 playwright，
分析 https://preview.pro.ant.design/list/table-list/ 这个页面的布局结构、筛选区、表格区、操作区
使用 screenshot，截取 https://preview.pro.ant.design/list/table-list/ 的页面并总结它的视觉层级


# 第二步：仿写一个同款页面

使用 frontend-skill，参考 https://preview.pro.ant.design/list/table-list/ ，在当前项目生成一个标准 ProTable 列表页
使用 frontend-skill，把用户管理页改成接近 https://preview.pro.ant.design/list/table-list/ 的样式和结构


# 第三步：还原校验

使用 screenshot，对比我项目里的列表页和 https://preview.pro.ant.design/list/table-list/ 的视觉差异
使用 playwright，检查列表页的筛选、重置、分页、操作按钮是否符合标准后台交互