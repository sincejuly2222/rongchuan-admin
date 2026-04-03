const rows = [
  {
    name: '系统管理员',
    account: 'admin',
    email: 'admin@rongchuan.local',
    phone: '13800000001',
    role: '超级管理员',
    status: 'enabled',
    lastLogin: '2026/4/3 14:20:00',
    createdAt: '2026/3/1 09:00:00',
  },
  {
    name: '李青',
    account: 'liqing',
    email: 'liqing@rongchuan.local',
    phone: '13800000002',
    role: '运营管理员',
    status: 'enabled',
    lastLogin: '2026/4/3 11:18:00',
    createdAt: '2026/3/5 10:30:00',
  },
  {
    name: '赵然',
    account: 'zhaoran',
    email: 'zhaoran@rongchuan.local',
    phone: '13800000003',
    role: '审核员',
    status: 'disabled',
    lastLogin: '2026/4/2 18:42:00',
    createdAt: '2026/3/7 15:20:00',
  },
  {
    name: '陈惟',
    account: 'chenwei',
    email: 'chenwei@rongchuan.local',
    phone: '13800000004',
    role: '数据分析师',
    status: 'enabled',
    lastLogin: '2026/4/2 16:05:00',
    createdAt: '2026/3/11 08:10:00',
  },
  {
    name: '周玥',
    account: 'zhouyue',
    email: 'zhouyue@rongchuan.local',
    phone: '13800000005',
    role: '内容运营',
    status: 'disabled',
    lastLogin: '2026/4/1 09:36:00',
    createdAt: '2026/3/18 11:40:00',
  },
  {
    name: '顾言',
    account: 'guyan',
    email: 'guyan@rongchuan.local',
    phone: '13800000006',
    role: '客服主管',
    status: 'enabled',
    lastLogin: '2026/4/3 08:56:00',
    createdAt: '2026/3/21 14:05:00',
  },
  {
    name: '宋至',
    account: 'songzhi',
    email: 'songzhi@rongchuan.local',
    phone: '13800000007',
    role: '财务专员',
    status: 'enabled',
    lastLogin: '2026/4/3 09:48:00',
    createdAt: '2026/3/25 16:25:00',
  },
  {
    name: '王琳',
    account: 'wanglin',
    email: 'wanglin@rongchuan.local',
    phone: '13800000008',
    role: '只读账号',
    status: 'disabled',
    lastLogin: '2026/3/31 17:12:00',
    createdAt: '2026/3/29 13:15:00',
  },
];

const tabs = document.querySelectorAll('.tab');
const tableBody = document.getElementById('table-body');
const filterName = document.getElementById('filter-name');
const filterAccount = document.getElementById('filter-account');
const filterStatus = document.getElementById('filter-status');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');
const paginationText = document.getElementById('pagination-text');
const modalBackdrop = document.getElementById('modal-backdrop');
const modals = Array.from(document.querySelectorAll('.modal'));
const openButtons = Array.from(document.querySelectorAll('[data-open]'));
const closeButtons = Array.from(document.querySelectorAll('[data-close]'));

const state = {
  tab: 'all',
  name: '',
  account: '',
  status: 'all',
};

function toStatusLabel(status) {
  return status === 'enabled' ? '启用' : '禁用';
}

function getRows() {
  return rows.filter((row) => {
    const tabMatch = state.tab === 'all' ? true : row.status === state.tab;
    const nameMatch = state.name ? row.name.includes(state.name) : true;
    const accountMatch = state.account ? row.account.includes(state.account) : true;
    const statusMatch = state.status === 'all' ? true : row.status === state.status;
    return tabMatch && nameMatch && accountMatch && statusMatch;
  });
}

function render() {
  const list = getRows();
  tableBody.innerHTML = list
    .map(
      (row) => `
        <tr>
          <td><input type="checkbox" /></td>
          <td>${row.name}</td>
          <td>${row.account}</td>
          <td>${row.email}</td>
          <td>${row.phone}</td>
          <td>${row.role}</td>
          <td><span class="tag ${row.status}">${toStatusLabel(row.status)}</span></td>
          <td>${row.lastLogin}</td>
          <td>${row.createdAt}</td>
          <td>
            <div class="actions">
              <a href="#">编辑</a>
              <a href="#">重置密码</a>
              <span class="switch ${row.status}"></span>
            </div>
          </td>
        </tr>
      `,
    )
    .join('');

  paginationText.textContent = `第 1-${list.length} 条/总共 ${list.length} 条`;
}

function closeAllModals() {
  modalBackdrop.classList.add('hidden');
  modals.forEach((modal) => modal.classList.add('hidden'));
}

function openModal(id) {
  closeAllModals();
  modalBackdrop.classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    state.tab = tab.dataset.tab;
    render();
  });
});

searchBtn.addEventListener('click', () => {
  state.name = filterName.value.trim();
  state.account = filterAccount.value.trim();
  state.status = filterStatus.value;
  render();
});

resetBtn.addEventListener('click', () => {
  state.name = '';
  state.account = '';
  state.status = 'all';
  state.tab = 'all';
  filterName.value = '';
  filterAccount.value = '';
  filterStatus.value = 'all';
  tabs.forEach((item) => item.classList.toggle('active', item.dataset.tab === 'all'));
  render();
});

openButtons.forEach((button) => {
  button.addEventListener('click', () => {
    openModal(button.dataset.open);
  });
});

closeButtons.forEach((button) => {
  button.addEventListener('click', closeAllModals);
});

modalBackdrop.addEventListener('click', closeAllModals);

render();
