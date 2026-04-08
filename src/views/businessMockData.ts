export type AlumniRecord = {
  id: number;
  name: string;
  studentId: string;
  gender: '男' | '女';
  graduationYear: number;
  college: string;
  major: string;
  className: string;
  city: string;
  company: string;
  title: string;
  phone: string;
  status: '已认证' | '待补充' | '已冻结';
  tags: string[];
  lastActiveAt: string;
};

export type StudentRecord = {
  id: number;
  name: string;
  studentId: string;
  college: string;
  major: string;
  className: string;
  enrollmentYear: number;
  degree: '本科' | '硕士' | '博士';
  status: '待审核' | '已通过' | '已驳回';
  claimStatus: '未认领' | '已认领';
  source: '校友提交' | '批量导入' | '管理员录入';
  updatedAt: string;
};

export type ImportJobRecord = {
  id: number;
  name: string;
  type: '校友资料' | '学籍资料';
  operator: string;
  successCount: number;
  failedCount: number;
  status: '已完成' | '校验中' | '待确认';
  createdAt: string;
};

export type ActivityRecord = {
  id: number;
  name: string;
  type: '论坛' | '沙龙' | '返校日' | '招聘会';
  organizer: string;
  city: string;
  venue: string;
  startTime: string;
  enrollments: number;
  capacity: number;
  status: '报名中' | '进行中' | '已结束';
};

export type OrganizationRecord = {
  id: number;
  name: string;
  type: '校友会' | '地方组织' | '行业组织' | '学院分会';
  principal: string;
  city: string;
  memberCount: number;
  pendingCount: number;
  activeCount: number;
  foundedAt: string;
  status: '运营中' | '筹备中';
};

export const alumniRecords: AlumniRecord[] = [
  {
    id: 1,
    name: '张晨',
    studentId: '2018123401',
    gender: '男',
    graduationYear: 2022,
    college: '信息工程学院',
    major: '计算机科学与技术',
    className: '计科 1801',
    city: '上海',
    company: '字节跳动',
    title: '高级前端工程师',
    phone: '13812340001',
    status: '已认证',
    tags: ['互联网', '技术导师'],
    lastActiveAt: '2026-04-07 21:30',
  },
  {
    id: 2,
    name: '李欣',
    studentId: '2016110809',
    gender: '女',
    graduationYear: 2020,
    college: '经济管理学院',
    major: '市场营销',
    className: '营销 1602',
    city: '深圳',
    company: '腾讯',
    title: '品牌经理',
    phone: '13912340002',
    status: '已认证',
    tags: ['品牌', '活动合作'],
    lastActiveAt: '2026-04-08 09:12',
  },
  {
    id: 3,
    name: '周航',
    studentId: '2014102218',
    gender: '男',
    graduationYear: 2018,
    college: '机械工程学院',
    major: '车辆工程',
    className: '车辆 1401',
    city: '杭州',
    company: '吉利汽车',
    title: '产品专家',
    phone: '13712340003',
    status: '待补充',
    tags: ['制造业'],
    lastActiveAt: '2026-04-06 18:05',
  },
  {
    id: 4,
    name: '陈莹',
    studentId: '2012050906',
    gender: '女',
    graduationYear: 2016,
    college: '法学院',
    major: '法学',
    className: '法学 1202',
    city: '北京',
    company: '中伦律师事务所',
    title: '律师',
    phone: '13612340004',
    status: '已冻结',
    tags: ['法律咨询'],
    lastActiveAt: '2026-03-31 14:22',
  },
];

export const studentRecords: StudentRecord[] = [
  {
    id: 1,
    name: '张晨',
    studentId: '2018123401',
    college: '信息工程学院',
    major: '计算机科学与技术',
    className: '计科 1801',
    enrollmentYear: 2018,
    degree: '本科',
    status: '已通过',
    claimStatus: '已认领',
    source: '批量导入',
    updatedAt: '2026-04-08 10:20',
  },
  {
    id: 2,
    name: '李欣',
    studentId: '2016110809',
    college: '经济管理学院',
    major: '市场营销',
    className: '营销 1602',
    enrollmentYear: 2016,
    degree: '本科',
    status: '已通过',
    claimStatus: '已认领',
    source: '校友提交',
    updatedAt: '2026-04-07 16:10',
  },
  {
    id: 3,
    name: '王可',
    studentId: '2021099907',
    college: '艺术学院',
    major: '视觉传达设计',
    className: '视传 2101',
    enrollmentYear: 2021,
    degree: '本科',
    status: '待审核',
    claimStatus: '未认领',
    source: '管理员录入',
    updatedAt: '2026-04-08 08:45',
  },
  {
    id: 4,
    name: '刘涛',
    studentId: '2019032503',
    college: '土木工程学院',
    major: '工程管理',
    className: '工管 1902',
    enrollmentYear: 2019,
    degree: '硕士',
    status: '已驳回',
    claimStatus: '未认领',
    source: '校友提交',
    updatedAt: '2026-04-05 12:30',
  },
];

export const importJobs: ImportJobRecord[] = [
  {
    id: 1,
    name: '2026 春季校友资料导入.xlsx',
    type: '校友资料',
    operator: '系统管理员',
    successCount: 312,
    failedCount: 8,
    status: '已完成',
    createdAt: '2026-04-08 09:00',
  },
  {
    id: 2,
    name: '学籍档案补录-信息学院.xlsx',
    type: '学籍资料',
    operator: '教务老师',
    successCount: 128,
    failedCount: 3,
    status: '待确认',
    createdAt: '2026-04-07 14:30',
  },
  {
    id: 3,
    name: '华东地区校友更新.xlsx',
    type: '校友资料',
    operator: '区域运营',
    successCount: 0,
    failedCount: 0,
    status: '校验中',
    createdAt: '2026-04-08 11:15',
  },
];

export const activityRecords: ActivityRecord[] = [
  {
    id: 1,
    name: '2026 校友创新论坛',
    type: '论坛',
    organizer: '校友总会',
    city: '上海',
    venue: '徐汇校区报告厅',
    startTime: '2026-05-18 14:00',
    enrollments: 286,
    capacity: 400,
    status: '报名中',
  },
  {
    id: 2,
    name: '长三角校友创业沙龙',
    type: '沙龙',
    organizer: '上海校友会',
    city: '上海',
    venue: '漕河泾科创中心',
    startTime: '2026-04-20 19:00',
    enrollments: 94,
    capacity: 120,
    status: '报名中',
  },
  {
    id: 3,
    name: '校庆返校日',
    type: '返校日',
    organizer: '学校办公室',
    city: '南京',
    venue: '主校区',
    startTime: '2026-04-12 09:00',
    enrollments: 520,
    capacity: 500,
    status: '进行中',
  },
  {
    id: 4,
    name: '校友专场招聘会',
    type: '招聘会',
    organizer: '就业指导中心',
    city: '杭州',
    venue: '体育馆',
    startTime: '2026-03-28 10:00',
    enrollments: 660,
    capacity: 800,
    status: '已结束',
  },
];

export const organizationRecords: OrganizationRecord[] = [
  {
    id: 1,
    name: '校友总会',
    type: '校友会',
    principal: '王海明',
    city: '南京',
    memberCount: 18240,
    pendingCount: 32,
    activeCount: 28,
    foundedAt: '2012-09-01',
    status: '运营中',
  },
  {
    id: 2,
    name: '上海校友会',
    type: '地方组织',
    principal: '周倩',
    city: '上海',
    memberCount: 3260,
    pendingCount: 11,
    activeCount: 8,
    foundedAt: '2016-05-20',
    status: '运营中',
  },
  {
    id: 3,
    name: '数字经济行业分会',
    type: '行业组织',
    principal: '李振',
    city: '深圳',
    memberCount: 840,
    pendingCount: 18,
    activeCount: 6,
    foundedAt: '2024-11-18',
    status: '筹备中',
  },
  {
    id: 4,
    name: '信息工程学院校友分会',
    type: '学院分会',
    principal: '赵雪',
    city: '南京',
    memberCount: 5120,
    pendingCount: 9,
    activeCount: 14,
    foundedAt: '2018-10-12',
    status: '运营中',
  },
];
