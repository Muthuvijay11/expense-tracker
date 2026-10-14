const CATEGORIES = {
  expense: [
    { id: 'food', name: 'Food & Dining', icon: 'fa-utensils', color: '#f59e0b' },
    { id: 'transport', name: 'Transportation', icon: 'fa-car', color: '#06b6d4' },
    { id: 'shopping', name: 'Shopping', icon: 'fa-bag-shopping', color: '#ec4899' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'fa-bolt', color: '#f97316' },
    { id: 'entertainment', name: 'Entertainment', icon: 'fa-gamepad', color: '#8b5cf6' },
    { id: 'health', name: 'Healthcare', icon: 'fa-heart-pulse', color: '#ef4444' },
    { id: 'education', name: 'Education', icon: 'fa-graduation-cap', color: '#3b82f6' },
    { id: 'housing', name: 'Housing & Rent', icon: 'fa-house', color: '#14b8a6' },
    { id: 'other_exp', name: 'Other Expense', icon: 'fa-ellipsis', color: '#6b7280' }
  ],
  income: [
    { id: 'salary', name: 'Salary', icon: 'fa-briefcase', color: '#10b981' },
    { id: 'freelance', name: 'Freelance', icon: 'fa-laptop-code', color: '#06b6d4' },
    { id: 'investment', name: 'Investments', icon: 'fa-chart-line', color: '#f59e0b' },
    { id: 'gift', name: 'Gifts', icon: 'fa-gift', color: '#ec4899' },
    { id: 'other_inc', name: 'Other Income', icon: 'fa-ellipsis', color: '#6b7280' }
  ]
};

function getAllCategories() {
  return [...CATEGORIES.expense, ...CATEGORIES.income];
}

function getCategoryById(id) {
  return getAllCategories().find(c => c.id === id) || { id, name: id, icon: 'fa-circle', color: '#6b7280' };
}

// Default sample data
const DEFAULT_TRANSACTIONS = [
  { id: 't1', type: 'income', desc: 'Monthly Salary', amount: 5200, date: '2025-01-05', category: 'salary', notes: 'January paycheck' },
  { id: 't2', type: 'expense', desc: 'Grocery Store', amount: 187.50, date: '2025-01-06', category: 'food', notes: 'Weekly groceries' },
  { id: 't3', type: 'expense', desc: 'Electric Bill', amount: 95.00, date: '2025-01-07', category: 'bills', notes: '' },
  { id: 't4', type: 'expense', desc: 'Uber Rides', amount: 42.30, date: '2025-01-08', category: 'transport', notes: 'Commute' },
  { id: 't5', type: 'expense', desc: 'Netflix Subscription', amount: 15.99, date: '2025-01-08', category: 'entertainment', notes: 'Monthly sub' },
  { id: 't6', type: 'income', desc: 'Freelance Project', amount: 800, date: '2025-01-10', category: 'freelance', notes: 'Website redesign' },
  { id: 't7', type: 'expense', desc: 'New Running Shoes', amount: 129.99, date: '2025-01-11', category: 'shopping', notes: 'Nike Air Max' },
  { id: 't8', type: 'expense', desc: 'Pharmacy', amount: 34.50, date: '2025-01-12', category: 'health', notes: 'Cold medicine' },
  { id: 't9', type: 'expense', desc: 'Online Course', amount: 49.99, date: '2025-01-13', category: 'education', notes: 'React Advanced' },
  { id: 't10', type: 'expense', desc: 'Monthly Rent', amount: 1400, date: '2025-01-01', category: 'housing', notes: '' },
  { id: 't11', type: 'expense', desc: 'Restaurant Dinner', amount: 67.80, date: '2025-01-14', category: 'food', notes: 'Date night' },
  { id: 't12', type: 'expense', desc: 'Gas Station', amount: 55.00, date: '2025-01-15', category: 'transport', notes: 'Full tank' },
  { id: 't13', type: 'income', desc: 'Stock Dividends', amount: 120, date: '2025-01-15', category: 'investment', notes: 'Q4 dividends' },
  { id: 't14', type: 'expense', desc: 'Internet Bill', amount: 69.99, date: '2025-01-16', category: 'bills', notes: '' },
  { id: 't15', type: 'expense', desc: 'Coffee Shop', amount: 18.50, date: '2025-01-17', category: 'food', notes: '' },
  { id: 't16', type: 'expense', desc: 'Concert Tickets', amount: 85.00, date: '2025-01-18', category: 'entertainment', notes: 'Jazz night' },
  { id: 't17', type: 'expense', desc: 'Dentist Visit', amount: 200, date: '2025-01-19', category: 'health', notes: 'Routine checkup' },
  { id: 't18', type: 'expense', desc: 'Book Purchase', amount: 24.99, date: '2025-01-20', category: 'education', notes: '' },
  { id: 't19', type: 'expense', desc: 'Clothing Store', amount: 156.00, date: '2025-01-21', category: 'shopping', notes: 'Winter jacket' },
  { id: 't20', type: 'expense', desc: 'Lunch Takeout', amount: 22.40, date: '2025-01-22', category: 'food', notes: '' },
  { id: 't21', type: 'income', desc: 'Freelance Logo', amount: 350, date: '2025-01-22', category: 'freelance', notes: 'Brand identity project' },
  { id: 't22', type: 'expense', desc: 'Water Bill', amount: 38.00, date: '2025-01-23', category: 'bills', notes: '' },
  { id: 't23', type: 'expense', desc: 'Parking Fee', amount: 12.00, date: '2025-01-24', category: 'transport', notes: '' },
  { id: 't24', type: 'expense', desc: 'Gym Membership', amount: 45.00, date: '2025-01-25', category: 'health', notes: 'Monthly fee' },
];

const DEFAULT_BUDGETS = {
  food: 500, transport: 200, shopping: 300, bills: 250,
  entertainment: 150, health: 300, education: 100, housing: 1500, other_exp: 100
};

// State
let transactions = [];
let budgets = {};
let currentChartType = 'weekly';
let currentFilter = 'all';
let currentTxType = 'expense';
let mainChart = null;
let doughnutChart = null;

// ===================== PERSISTENCE =====================

function loadData() {
  try {
    const txData = localStorage.getItem('sw_transactions');
    const bgData = localStorage.getItem('sw_budgets');
    transactions = txData ? JSON.parse(txData) : [...DEFAULT_TRANSACTIONS];
    budgets = bgData ? JSON.parse(bgData) : { ...DEFAULT_BUDGETS };
  } catch (e) {
    transactions = [...DEFAULT_TRANSACTIONS];
    budgets = { ...DEFAULT_BUDGETS };
  }
}

function saveData() {
  try {
    localStorage.setItem('sw_transactions', JSON.stringify(transactions));
    localStorage.setItem('sw_budgets', JSON.stringify(budgets));
  } catch (e) {
    showToast('Failed to save data locally', 'error');
  }
}

// ===================== TOAST =====================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-triangle-exclamation' };
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===================== MODALS =====================

function openModal(type) {
  if (type === 'add') {
    document.getElementById('txModalTitle').textContent = 'Add Transaction';
    document.getElementById('txSubmitBtn').textContent = 'Add Transaction';
    document.getElementById('txForm').reset();
    document.getElementById('txId').value = '';
    document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
    setTxType('expense');
    populateCategorySelect();
    document.getElementById('txModal').classList.add('active');
  } else if (type === 'budget') {
    renderBudgetForm();
    document.getElementById('budgetModal').classList.add('active');
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ===================== TRANSACTION FORM =====================

function setTxType(type) {
  currentTxType = type;
  document.getElementById('typeExpense').classList.toggle('active', type === 'expense');
  document.getElementById('typeIncome').classList.toggle('active', type === 'income');
  populateCategorySelect();
}

function populateCategorySelect() {
  const select = document.getElementById('txCategory');
  const cats = CATEGORIES[currentTxType];
  select.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function handleTxSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('txId').value;
  const tx = {
    id: id || 't' + Date.now(),
    type: currentTxType,
    desc: document.getElementById('txDesc').value.trim(),
    amount: parseFloat(document.getElementById('txAmount').value),
    date: document.getElementById('txDate').value,
    category: document.getElementById('txCategory').value,
    notes: document.getElementById('txNotes').value.trim()
  };

  if (id) {
    const idx = transactions.findIndex(t => t.id === id);
    if (idx !== -1) transactions[idx] = tx;
    showToast('Transaction updated successfully');
  } else {
    transactions.unshift(tx);
    showToast('Transaction added successfully');
  }

  saveData();
  closeModal('txModal');
  refreshAll();
}

function editTransaction(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;
  document.getElementById('txModalTitle').textContent = 'Edit Transaction';
  document.getElementById('txSubmitBtn').textContent = 'Update Transaction';
  document.getElementById('txId').value = tx.id;
  document.getElementById('txDesc').value = tx.desc;
  document.getElementById('txAmount').value = tx.amount;
  document.getElementById('txDate').value = tx.date;
  document.getElementById('txNotes').value = tx.notes || '';
  setTxType(tx.type);
  setTimeout(() => { document.getElementById('txCategory').value = tx.category; }, 10);
  document.getElementById('txModal').classList.add('active');
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveData();
  showToast('Transaction deleted', 'info');
  refreshAll();
}

// ===================== BUDGET FORM =====================

function renderBudgetForm() {
  const container = document.getElementById('budgetFormList');
  container.innerHTML = CATEGORIES.expense.map(cat => `
    <div style="display:flex; align-items:center; gap:12px;">
      <div style="width:36px;height:36px;border-radius:8px;background:${cat.color}18;color:${cat.color};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">
        <i class="fa-solid ${cat.icon}"></i>
      </div>
      <div style="flex:1; min-width:0;">
        <label style="font-size:12px; color:var(--text-secondary); display:block; margin-bottom:4px;">${cat.name}</label>
        <input type="number" class="form-input" data-budget-id="${cat.id}" value="${budgets[cat.id] || 0}" min="0" step="10" style="font-size:13px; padding:8px 12px;">
      </div>
    </div>
  `).join('');
}

function saveBudgets() {
  document.querySelectorAll('[data-budget-id]').forEach(input => {
    budgets[input.dataset.budgetId] = parseFloat(input.value) || 0;
  });
  saveData();
  closeModal('budgetModal');
  showToast('Budgets updated successfully');
  refreshAll();
}

// ===================== RENDERING =====================

function refreshAll() {
  renderStats();
  renderTransactions();
  renderBudgets();
  renderMainChart();
  renderDoughnutChart();
  renderInsights();
  renderFilterPills();
}

// Stats
function renderStats() {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const lastMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const inc = thisMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = thisMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastInc = lastMonthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const lastExp = lastMonthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = inc - exp;
  const savingsRate = inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0;

  document.getElementById('statIncome').textContent = formatCurrency(inc);
  document.getElementById('statExpense').textContent = formatCurrency(exp);
  document.getElementById('statBalance').textContent = formatCurrency(balance);
  document.getElementById('statBalance').style.color = balance >= 0 ? 'var(--accent)' : 'var(--danger)';
  document.getElementById('statSavings').textContent = savingsRate + '%';
  document.getElementById('statSavings').style.color = savingsRate >= 20 ? 'var(--accent)' : savingsRate >= 0 ? 'var(--warning)' : 'var(--danger)';

  // Change indicators
  const incChange = lastInc > 0 ? Math.round(((inc - lastInc) / lastInc) * 100) : 0;
  const expChange = lastExp > 0 ? Math.round(((exp - lastExp) / lastExp) * 100) : 0;
  document.getElementById('statIncomeChange').innerHTML = lastInc > 0 ? changeHTML(incChange, 'vs last month') : 'No data last month';
  document.getElementById('statExpenseChange').innerHTML = lastExp > 0 ? changeHTML(expChange, 'vs last month') : 'No data last month';
  document.getElementById('statBalanceNote').textContent = balance >= 0 ? 'You\'re in the green this month' : 'Spending exceeds income';
  document.getElementById('statSavingsNote').textContent = savingsRate >= 20 ? 'Great savings habit' : savingsRate >= 0 ? 'Try to save at least 20%' : 'You\'re spending more than earning';
}

function changeHTML(val, label) {
  const isUp = val >= 0;
  const color = label.includes('Expense') ? (isUp ? 'var(--danger)' : 'var(--accent)') : (isUp ? 'var(--accent)' : 'var(--danger)');
  const icon = isUp ? 'fa-arrow-up' : 'fa-arrow-down';
  return `<span style="color:${color};"><i class="fa-solid ${icon}" style="font-size:9px;"></i> ${Math.abs(val)}%</span> ${label}`;
}

// Filter pills
function renderFilterPills() {
  const container = document.getElementById('filterPills');
  const expenseCats = transactions.filter(t => t.type === 'expense').map(t => t.category);
  const activeCats = [...new Set(expenseCats)].map(id => getCategoryById(id));

  let html = `<button class="filter-pill ${currentFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">All</button>`;
  activeCats.forEach(cat => {
    html += `<button class="filter-pill ${currentFilter === cat.id ? 'active' : ''}" onclick="setFilter('${cat.id}')">
      <i class="fa-solid ${cat.icon}" style="margin-right:4px; font-size:10px;"></i>${cat.name}
    </button>`;
  });
  container.innerHTML = html;
}

function setFilter(filter) {
  currentFilter = filter;
  renderFilterPills();
  renderTransactions();
}

// Transactions list
function renderTransactions() {
  const container = document.getElementById('txList');
  const search = document.getElementById('searchInput').value.toLowerCase();

  let filtered = transactions.filter(t => {
    if (currentFilter !== 'all' && t.category !== currentFilter) return false;
    if (search && !t.desc.toLowerCase().includes(search) && !t.notes.toLowerCase().includes(search)) return false;
    return true;
  });

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt" style="display:block;"></i><p>No transactions found</p></div>`;
    return;
  }

  // Group by date
  const groups = {};
  filtered.forEach(tx => {
    const key = tx.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  let html = '';
  Object.entries(groups).forEach(([date, txs]) => {
    const d = new Date(date + 'T00:00:00');
    const label = formatDateLabel(d);
    const dayTotal = txs.reduce((s, t) => s + (t.type === 'expense' ? -t.amount : t.amount), 0);
    html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:8px 4px; margin-top:4px;">
      <span style="font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">${label}</span>
      <span style="font-size:12px; color:${dayTotal >= 0 ? 'var(--accent)' : 'var(--danger)'};">${dayTotal >= 0 ? '+' : ''}${formatCurrency(dayTotal)}</span>
    </div>`;
    txs.forEach(tx => {
      const cat = getCategoryById(tx.category);
      const isExpense = tx.type === 'expense';
      html += `<div class="tx-item" style="display:flex; align-items:center; gap:12px;">
        <div class="tx-category-icon" style="background:${cat.color}18; color:${cat.color};">
          <i class="fa-solid ${cat.icon}"></i>
        </div>
        <div style="flex:1; min-width:0;">
          <p style="font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${tx.desc}</p>
          <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">${cat.name}${tx.notes ? ' · ' + tx.notes : ''}</p>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <p style="font-size:14px; font-weight:600; font-family:'Space Grotesk'; color:${isExpense ? 'var(--danger)' : 'var(--accent)'};">
            ${isExpense ? '-' : '+'}${formatCurrency(tx.amount)}
          </p>
        </div>
        <div class="tx-actions" style="display:flex; gap:2px; flex-shrink:0;">
          <button class="btn-icon" onclick="editTransaction('${tx.id}')" aria-label="Edit" style="color:var(--text-muted);"
            onmouseover="this.style.background='rgba(6,182,212,0.1)';this.style.color='var(--info)'"
            onmouseout="this.style.background='transparent';this.style.color='var(--text-muted)'">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon" onclick="deleteTransaction('${tx.id}')" aria-label="Delete">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>`;
    });
  });

  container.innerHTML = html;
}

// Budgets
function renderBudgets() {
  const container = document.getElementById('budgetList');
  const now = new Date();
  const thisMonthExp = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const spent = {};
  thisMonthExp.forEach(t => { spent[t.category] = (spent[t.category] || 0) + t.amount; });

  const budgetEntries = CATEGORIES.expense.filter(c => budgets[c.id] > 0);
  if (budgetEntries.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:30px 10px;"><i class="fa-solid fa-chart-pie" style="display:block;"></i><p style="font-size:13px;">No budgets set. Click Manage to get started.</p></div>`;
    return;
  }

  let html = '';
  budgetEntries.forEach(cat => {
    const limit = budgets[cat.id];
    const used = spent[cat.id] || 0;
    const pct = Math.min((used / limit) * 100, 100);
    const over = used > limit;
    const barColor = over ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : cat.color;

    html += `<div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <i class="fa-solid ${cat.icon}" style="color:${cat.color}; font-size:13px;"></i>
          <span style="font-size:13px; font-weight:500;">${cat.name}</span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:13px; font-weight:600; font-family:'Space Grotesk'; color:${over ? 'var(--danger)' : 'var(--text-primary)'};">${formatCurrency(used)}</span>
          <span style="font-size:11px; color:var(--text-muted);"> / ${formatCurrency(limit)}</span>
        </div>
      </div>
      <div class="budget-bar-track">
        <div class="budget-bar-fill" style="width:${pct}%; background:${barColor};"></div>
      </div>
      ${over ? `<p style="font-size:11px; color:var(--danger); margin-top:6px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i>Over budget by ${formatCurrency(used - limit)}</p>` :
        `<p style="font-size:11px; color:var(--text-muted); margin-top:6px;">${formatCurrency(limit - used)} remaining</p>`}
    </div>`;
  });

  container.innerHTML = html;
}

// ===================== CHARTS =====================

function renderMainChart() {
  const ctx = document.getElementById('mainChart').getContext('2d');
  if (mainChart) mainChart.destroy();

  if (currentChartType === 'category') {
    renderCategoryBarChart(ctx);
  } else if (currentChartType === 'monthly') {
    renderMonthlyChart(ctx);
  } else {
    renderWeeklyChart(ctx);
  }
}

function renderWeeklyChart(ctx) {
  const labels = [];
  const expData = [];
  const incData = [];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    const dayTx = transactions.filter(t => t.date === dateStr);
    expData.push(dayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    incData.push(dayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
  }

  mainChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Expenses', data: expData, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6, borderSkipped: false },
        { label: 'Income', data: incData, backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6, borderSkipped: false }
      ]
    },
    options: chartOptions('$')
  });
}

function renderMonthlyChart(ctx) {
  const labels = [];
  const expData = [];
  const incData = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleDateString('en-US', { month: 'short' }));
    const monthTx = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === d.getMonth() && td.getFullYear() === d.getFullYear();
    });
    expData.push(monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    incData.push(monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
  }

  mainChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Expenses', data: expData, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 6, borderSkipped: false },
        { label: 'Income', data: incData, backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6, borderSkipped: false }
      ]
    },
    options: chartOptions('$')
  });
}

function renderCategoryBarChart(ctx) {
  const now = new Date();
  const monthExp = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const byCategory = {};
  monthExp.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([id]) => getCategoryById(id).name);
  const data = sorted.map(([, v]) => v);
  const colors = sorted.map(([id]) => getCategoryById(id).color);

  mainChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Spending',
        data,
        backgroundColor: colors.map(c => c + 'bb'),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      ...chartOptions('$'),
      indexAxis: 'y'
    }
  });
}

function chartOptions(prefix) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: { color: '#8899aa', font: { family: 'DM Sans', size: 11 }, boxWidth: 12, boxHeight: 12, borderRadius: 3, useBorderRadius: true, padding: 16 }
      },
      tooltip: {
        backgroundColor: '#1a2332',
        borderColor: '#2a3a50',
        borderWidth: 1,
        titleColor: '#e8ecf1',
        bodyColor: '#8899aa',
        titleFont: { family: 'Space Grotesk', weight: '600' },
        bodyFont: { family: 'DM Sans' },
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${prefix}${ctx.parsed.y !== undefined ? ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 }) : ctx.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#556677', font: { family: 'DM Sans', size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#556677', font: { family: 'DM Sans', size: 11 } }, beginAtZero: true }
    }
  };
}

function renderDoughnutChart() {
  const ctx = document.getElementById('doughnutChart').getContext('2d');
  if (doughnutChart) doughnutChart.destroy();

  const now = new Date();
  const monthExp = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const byCategory = {};
  monthExp.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) {
    doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#2a3a50'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }
    });
    document.getElementById('doughnutLegend').innerHTML = '';
    return;
  }

  const labels = sorted.map(([id]) => getCategoryById(id).name);
  const data = sorted.map(([, v]) => v);
  const colors = sorted.map(([id]) => getCategoryById(id).color);
  const total = data.reduce((s, v) => s + v, 0);

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a2332', borderColor: '#2a3a50', borderWidth: 1,
          titleColor: '#e8ecf1', bodyColor: '#8899aa',
          titleFont: { family: 'Space Grotesk', weight: '600' },
          bodyFont: { family: 'DM Sans' },
          padding: 12, cornerRadius: 10,
          callbacks: { label: ctx => ` $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${Math.round(ctx.parsed / total * 100)}%)` }
        }
      }
    }
  });

  // Legend
  document.getElementById('doughnutLegend').innerHTML = sorted.map(([id, val]) => {
    const cat = getCategoryById(id);
    const pct = Math.round(val / total * 100);
    return `<div style="display:flex; align-items:center; gap:6px; font-size:11px;">
      <span style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0;"></span>
      <span style="color:var(--text-secondary);">${cat.name}</span>
      <span style="color:var(--text-muted); font-weight:500;">${pct}%</span>
    </div>`;
  }).join('');
}

function switchChart(type, btn) {
  currentChartType = type;
  document.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMainChart();
}

// ===================== INSIGHTS =====================

function renderInsights() {
  const container = document.getElementById('insightsList');
  const insights = [];
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthExp = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthInc = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'income' && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const totalExp = monthExp.reduce((s, t) => s + t.amount, 0);
  const totalInc = monthInc.reduce((s, t) => s + t.amount, 0);

  // Top spending category
  const byCategory = {};
  monthExp.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (topCat) {
    const cat = getCategoryById(topCat[0]);
    const pct = totalExp > 0 ? Math.round(topCat[1] / totalExp * 100) : 0;
    insights.push({
      icon: cat.icon, color: cat.color,
      text: `Your biggest expense is <strong>${cat.name}</strong> at ${formatCurrency(topCat[1])} (${pct} of total)`,
      type: 'info'
    });
  }

  // Budget warnings
  let overBudgetCount = 0;
  CATEGORIES.expense.forEach(cat => {
    if (budgets[cat.id] && (byCategory[cat.id] || 0) > budgets[cat.id]) overBudgetCount++;
  });
  if (overBudgetCount > 0) {
    insights.push({
      icon: 'fa-triangle-exclamation', color: 'var(--danger)',
      text: `<strong>${overBudgetCount} categor${overBudgetCount > 1 ? 'ies' : 'y'}</strong> over budget this month`,
      type: 'warning'
    });
  }

  // Daily average
  const dayOfMonth = now.getDate();
  if (dayOfMonth > 0 && totalExp > 0) {
    const dailyAvg = totalExp / dayOfMonth;
    const projected = dailyAvg * 30;
    insights.push({
      icon: 'fa-calendar-day', color: 'var(--info)',
      text: `Daily average: <strong>${formatCurrency(dailyAvg)}</strong>. Projected monthly: <strong>${formatCurrency(projected)}</strong>`,
      type: 'info'
    });
  }

  // Transaction count
  insights.push({
    icon: 'fa-receipt', color: 'var(--warning)',
    text: `<strong>${monthExp.length}</strong> expense transactions this month`,
    type: 'neutral'
  });

  // Savings projection
  if (totalInc > 0) {
    const monthlySaving = totalInc - totalExp;
    const yearlyProjection = monthlySaving * 12;
    insights.push({
      icon: 'fa-piggy-bank', color: '#8b5cf6',
      text: monthlySaving >= 0
        ? `Projected annual savings: <strong>${formatCurrency(yearlyProjection)}</strong>`
        : `At this rate, you'll lose <strong>${formatCurrency(Math.abs(yearlyProjection))}</strong> per year`,
      type: monthlySaving >= 0 ? 'success' : 'warning'
    });
  }

  container.innerHTML = insights.map(ins => `
    <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 12px; border-radius:10px; background:${ins.color}08; border:1px solid ${ins.color}15;">
      <i class="fa-solid ${ins.icon}" style="color:${ins.color}; font-size:14px; margin-top:2px; flex-shrink:0;"></i>
      <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${ins.text}</p>
    </div>
  `).join('');
}

// ===================== EXPORT =====================

function exportData() {
  const csvRows = ['Date,Type,Description,Category,Amount,Notes'];
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  sorted.forEach(t => {
    const cat = getCategoryById(t.category);
    csvRows.push(`${t.date},${t.type},"${t.desc}",${cat.name},${t.amount},"${t.notes || ''}"`);
  });
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `spendwise-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported as CSV', 'success');
}

// ===================== UTILITIES =====================

function formatCurrency(val) {
  return '$' + Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateLabel(d) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===================== INIT =====================

function init() {
  // Set header date
  document.getElementById('headerDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  loadData();
  refreshAll();

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('txModal');
      closeModal('budgetModal');
    }
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') {
      e.preventDefault();
      openModal('add');
    }
  });
}

init();