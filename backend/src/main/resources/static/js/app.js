// SpendWise Application Logic & Integration

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

// State
let transactions = [];
let budgetStatuses = [];
let dashboardSummary = null;
let currentChartType = 'weekly';
let currentFilter = 'all';
let currentTxType = 'expense';
let mainChart = null;
let doughnutChart = null;
let userCurrency = 'USD';

// ===================== DATA FETCHING =====================

async function loadData() {
  if (!api.isAuthenticated()) {
    return;
  }

  try {
    const user = api.getCurrentUser();
    if (user && user.currency) userCurrency = user.currency;

    // Concurrently load dashboard metrics, transactions, and budgets
    const [summary, txData, budgets] = await Promise.all([
      api.getDashboardSummary().catch(() => null),
      api.getTransactions({ size: 100 }).catch(() => ({ content: [] })),
      api.getBudgets().catch(() => [])
    ]);

    dashboardSummary = summary;
    transactions = txData.content || [];
    budgetStatuses = budgets || [];

    refreshAll();
  } catch (err) {
    console.error('Failed to load data:', err);
    showToast('Failed to sync data with server', 'error');
  }
}

function refreshAll() {
  renderStats();
  renderTransactions();
  renderBudgets();
  renderMainChart();
  renderDoughnutChart();
  renderInsights();
  renderFilterPills();
}

// ===================== STATS =====================

function renderStats() {
  const incEl = document.getElementById('statIncome');
  const expEl = document.getElementById('statExpense');
  const balEl = document.getElementById('statBalance');
  const savEl = document.getElementById('statSavings');

  if (dashboardSummary) {
    const inc = dashboardSummary.thisMonthIncome || 0;
    const exp = dashboardSummary.thisMonthExpense || 0;
    const balance = dashboardSummary.netBalance || 0;
    const savingsRate = Math.round(dashboardSummary.savingsRate || 0);

    incEl.textContent = formatCurrency(inc);
    expEl.textContent = formatCurrency(exp);
    balEl.textContent = formatCurrency(balance);
    balEl.style.color = balance >= 0 ? 'var(--accent)' : 'var(--danger)';

    savEl.textContent = savingsRate + '%';
    savEl.style.color = savingsRate >= 20 ? 'var(--accent)' : savingsRate >= 0 ? 'var(--warning)' : 'var(--danger)';

    // Changes
    const incChg = dashboardSummary.incomeChangePercentage;
    const expChg = dashboardSummary.expenseChangePercentage;

    document.getElementById('statIncomeChange').innerHTML = incChg !== null && incChg !== undefined
      ? changeHTML(incChg, 'vs last month') : 'No data last month';
    document.getElementById('statExpenseChange').innerHTML = expChg !== null && expChg !== undefined
      ? changeHTML(expChg, 'vs last month') : 'No data last month';
    document.getElementById('statBalanceNote').textContent = balance >= 0
      ? "You're in the green this month" : 'Spending exceeds income';
    document.getElementById('statSavingsNote').textContent = savingsRate >= 20
      ? 'Great savings habit' : savingsRate >= 0 ? 'Try to save at least 20%' : "Spending exceeds income";
  } else {
    incEl.textContent = '$0.00';
    expEl.textContent = '$0.00';
    balEl.textContent = '$0.00';
    savEl.textContent = '0%';
  }
}

function changeHTML(val, label) {
  const isUp = val >= 0;
  const color = label.includes('Expense')
    ? (isUp ? 'var(--danger)' : 'var(--accent)')
    : (isUp ? 'var(--accent)' : 'var(--danger)');
  const icon = isUp ? 'fa-arrow-up' : 'fa-arrow-down';
  return `<span style="color:${color};"><i class="fa-solid ${icon}" style="font-size:9px;"></i> ${Math.abs(Math.round(val))}%</span> ${label}`;
}

// ===================== FILTER PILLS =====================

function renderFilterPills() {
  const container = document.getElementById('filterPills');
  const expenseCats = transactions.filter(t => t.type.toUpperCase() === 'EXPENSE').map(t => t.categoryId);
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

// ===================== TRANSACTIONS LIST =====================

function renderTransactions() {
  const container = document.getElementById('txList');
  const search = document.getElementById('searchInput').value.toLowerCase().trim();

  let filtered = transactions.filter(t => {
    if (currentFilter !== 'all' && t.categoryId !== currentFilter) return false;
    if (search && !t.description.toLowerCase().includes(search) && !(t.notes && t.notes.toLowerCase().includes(search))) return false;
    return true;
  });

  filtered.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-receipt" style="display:block;"></i><p>No transactions found</p></div>`;
    return;
  }

  // Group by date
  const groups = {};
  filtered.forEach(tx => {
    const key = tx.transactionDate;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  let html = '';
  Object.entries(groups).forEach(([date, txs]) => {
    const d = new Date(date + 'T00:00:00');
    const label = formatDateLabel(d);
    const dayTotal = txs.reduce((s, t) => s + (t.type.toUpperCase() === 'EXPENSE' ? -Number(t.amount) : Number(t.amount)), 0);

    html += `<div style="display:flex; align-items:center; justify-content:space-between; padding:8px 4px; margin-top:4px;">
      <span style="font-size:12px; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px;">${label}</span>
      <span style="font-size:12px; color:${dayTotal >= 0 ? 'var(--accent)' : 'var(--danger)'};">${dayTotal >= 0 ? '+' : ''}${formatCurrency(dayTotal)}</span>
    </div>`;

    txs.forEach(tx => {
      const cat = getCategoryById(tx.categoryId);
      const isExpense = tx.type.toUpperCase() === 'EXPENSE';
      html += `<div class="tx-item" style="display:flex; align-items:center; gap:12px;">
        <div class="tx-category-icon" style="background:${cat.color}18; color:${cat.color};">
          <i class="fa-solid ${cat.icon}"></i>
        </div>
        <div style="flex:1; min-width:0;">
          <p style="font-size:14px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${tx.description}</p>
          <p style="font-size:11px; color:var(--text-muted); margin-top:2px;">${cat.name}${tx.notes ? ' · ' + tx.notes : ''}</p>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <p style="font-size:14px; font-weight:600; font-family:'Space Grotesk'; color:${isExpense ? 'var(--danger)' : 'var(--accent)'};">
            ${isExpense ? '-' : '+'}${formatCurrency(tx.amount)}
          </p>
        </div>
        <div class="tx-actions" style="display:flex; gap:2px; flex-shrink:0;">
          <button class="btn-icon" onclick="editTransaction(${tx.id})" aria-label="Edit" style="color:var(--text-muted);"
            onmouseover="this.style.background='rgba(6,182,212,0.1)';this.style.color='var(--info)'"
            onmouseout="this.style.background='transparent';this.style.color='var(--text-muted)'">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn-icon" onclick="deleteTransaction(${tx.id})" aria-label="Delete">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>`;
    });
  });

  container.innerHTML = html;
}

// ===================== TRANSACTION MODAL & ACTIONS =====================

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

async function handleTxSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('txId').value;
  const payload = {
    type: currentTxType.toUpperCase(),
    categoryId: document.getElementById('txCategory').value,
    description: document.getElementById('txDesc').value.trim(),
    amount: parseFloat(document.getElementById('txAmount').value),
    transactionDate: document.getElementById('txDate').value,
    notes: document.getElementById('txNotes').value.trim()
  };

  const submitBtn = document.getElementById('txSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (id) {
      await api.updateTransaction(id, payload);
      showToast('Transaction updated successfully');
    } else {
      await api.createTransaction(payload);
      showToast('Transaction added successfully');
    }
    closeModal('txModal');
    await loadData();
  } catch (err) {
    showToast(err.message || 'Failed to save transaction', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = id ? 'Update Transaction' : 'Add Transaction';
  }
}

async function editTransaction(id) {
  const tx = transactions.find(t => t.id === id);
  if (!tx) return;
  document.getElementById('txModalTitle').textContent = 'Edit Transaction';
  document.getElementById('txSubmitBtn').textContent = 'Update Transaction';
  document.getElementById('txId').value = tx.id;
  document.getElementById('txDesc').value = tx.description;
  document.getElementById('txAmount').value = tx.amount;
  document.getElementById('txDate').value = tx.transactionDate;
  document.getElementById('txNotes').value = tx.notes || '';
  setTxType(tx.type.toLowerCase());
  setTimeout(() => { document.getElementById('txCategory').value = tx.categoryId; }, 10);
  document.getElementById('txModal').classList.add('active');
}

async function deleteTransaction(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      await api.deleteTransaction(id);
      showToast('Transaction deleted', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete transaction', 'error');
    }
  }
}

// ===================== BUDGETS & ALERTS =====================

function renderBudgets() {
  const container = document.getElementById('budgetList');

  if (budgetStatuses.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:30px 10px;"><i class="fa-solid fa-chart-pie" style="display:block;"></i><p style="font-size:13px;">No budgets set. Click Manage to set monthly limits.</p></div>`;
    return;
  }

  let html = '';
  budgetStatuses.forEach(b => {
    const cat = getCategoryById(b.categoryId);
    const limit = Number(b.monthlyLimit);
    const spent = Number(b.spent);
    const pct = Math.min(b.percentageUsed, 100);
    const over = b.overBudget;
    const isWarning = b.status === 'WARNING';
    const barColor = over ? 'var(--danger)' : isWarning ? 'var(--warning)' : cat.color;

    html += `<div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <i class="fa-solid ${cat.icon}" style="color:${cat.color}; font-size:13px;"></i>
          <span style="font-size:13px; font-weight:500;">${cat.name}</span>
          ${isWarning ? '<span style="font-size:10px; background:rgba(245,158,11,0.2); color:var(--warning); padding:2px 6px; border-radius:4px;">75%+</span>' : ''}
          ${over ? '<span style="font-size:10px; background:rgba(239,68,68,0.2); color:var(--danger); padding:2px 6px; border-radius:4px;">OVER</span>' : ''}
        </div>
        <div style="text-align:right;">
          <span style="font-size:13px; font-weight:600; font-family:'Space Grotesk'; color:${over ? 'var(--danger)' : 'var(--text-primary)'};">${formatCurrency(spent)}</span>
          <span style="font-size:11px; color:var(--text-muted);"> / ${formatCurrency(limit)}</span>
        </div>
      </div>
      <div class="budget-bar-track">
        <div class="budget-bar-fill" style="width:${pct}%; background:${barColor};"></div>
      </div>
      ${over ? `<p style="font-size:11px; color:var(--danger); margin-top:6px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i>Over budget by ${formatCurrency(spent - limit)}</p>` :
        `<p style="font-size:11px; color:var(--text-muted); margin-top:6px;">${formatCurrency(limit - spent)} remaining</p>`}
    </div>`;
  });

  container.innerHTML = html;
}

function renderBudgetForm() {
  const container = document.getElementById('budgetFormList');
  const budgetMap = {};
  budgetStatuses.forEach(b => { budgetMap[b.categoryId] = b.monthlyLimit; });

  container.innerHTML = CATEGORIES.expense.map(cat => `
    <div style="display:flex; align-items:center; gap:12px;">
      <div style="width:36px;height:36px;border-radius:8px;background:${cat.color}18;color:${cat.color};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">
        <i class="fa-solid ${cat.icon}"></i>
      </div>
      <div style="flex:1; min-width:0;">
        <label style="font-size:12px; color:var(--text-secondary); display:block; margin-bottom:4px;">${cat.name}</label>
        <input type="number" class="form-input" data-budget-id="${cat.id}" value="${budgetMap[cat.id] || 0}" min="0" step="10" style="font-size:13px; padding:8px 12px;">
      </div>
    </div>
  `).join('');
}

async function saveBudgets() {
  const budgetMap = {};
  document.querySelectorAll('[data-budget-id]').forEach(input => {
    budgetMap[input.dataset.budgetId] = parseFloat(input.value) || 0;
  });

  try {
    await api.setBatchBudgets(budgetMap);
    closeModal('budgetModal');
    showToast('Budgets updated successfully');
    await loadData();
  } catch (err) {
    showToast(err.message || 'Failed to save budgets', 'error');
  }
}

// ===================== CHARTS =====================

async function renderMainChart() {
  const ctx = document.getElementById('mainChart').getContext('2d');
  if (mainChart) mainChart.destroy();

  if (currentChartType === 'category') {
    await renderCategoryBarChart(ctx);
  } else if (currentChartType === 'monthly') {
    await renderPeriodChart(ctx, 'MONTHLY');
  } else {
    await renderPeriodChart(ctx, 'WEEKLY');
  }
}

async function renderPeriodChart(ctx, periodType) {
  try {
    const report = await api.getPeriodReport(periodType);
    const labels = report.labels || [];
    const expData = (report.expenseData || []).map(Number);
    const incData = (report.incomeData || []).map(Number);

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
  } catch (e) {
    console.error('Failed to render period chart:', e);
  }
}

async function renderCategoryBarChart(ctx) {
  try {
    const breakdown = await api.getCategoryBreakdown();
    const labels = breakdown.map(b => getCategoryById(b.categoryId).name);
    const data = breakdown.map(b => Number(b.amount));
    const colors = breakdown.map(b => getCategoryById(b.categoryId).color);

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
  } catch (e) {
    console.error('Failed to render category chart:', e);
  }
}

async function renderDoughnutChart() {
  const ctx = document.getElementById('doughnutChart').getContext('2d');
  if (doughnutChart) doughnutChart.destroy();

  try {
    const breakdown = await api.getCategoryBreakdown();

    if (!breakdown || breakdown.length === 0) {
      doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['No Data'], datasets: [{ data: [1], backgroundColor: ['#2a3a50'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '70%' }
      });
      document.getElementById('doughnutLegend').innerHTML = '';
      return;
    }

    const labels = breakdown.map(b => getCategoryById(b.categoryId).name);
    const data = breakdown.map(b => Number(b.amount));
    const colors = breakdown.map(b => getCategoryById(b.categoryId).color);
    const total = data.reduce((s, v) => s + v, 0);

    doughnutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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

    document.getElementById('doughnutLegend').innerHTML = breakdown.map(b => {
      const cat = getCategoryById(b.categoryId);
      const pct = Math.round(b.percentage);
      return `<div style="display:flex; align-items:center; gap:6px; font-size:11px;">
        <span style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0;"></span>
        <span style="color:var(--text-secondary);">${cat.name}</span>
        <span style="color:var(--text-muted); font-weight:500;">${pct}%</span>
      </div>`;
    }).join('');
  } catch (e) {
    console.error('Failed to render doughnut chart:', e);
  }
}

function switchChart(type, btn) {
  currentChartType = type;
  document.querySelectorAll('[data-chart]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMainChart();
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

// ===================== QUICK INSIGHTS =====================

function renderInsights() {
  const container = document.getElementById('insightsList');
  const insights = [];

  if (dashboardSummary) {
    const totalExp = Number(dashboardSummary.thisMonthExpense || 0);
    const totalInc = Number(dashboardSummary.thisMonthIncome || 0);
    const now = new Date();
    const dayOfMonth = now.getDate();

    if (dashboardSummary.overBudgetCount > 0) {
      insights.push({
        icon: 'fa-triangle-exclamation', color: 'var(--danger)',
        text: `<strong>${dashboardSummary.overBudgetCount} categor${dashboardSummary.overBudgetCount > 1 ? 'ies' : 'y'}</strong> exceeded budget this month`,
        type: 'warning'
      });
    }

    if (dayOfMonth > 0 && totalExp > 0) {
      const dailyAvg = totalExp / dayOfMonth;
      const projected = dailyAvg * 30;
      insights.push({
        icon: 'fa-calendar-day', color: 'var(--info)',
        text: `Daily average: <strong>${formatCurrency(dailyAvg)}</strong>. Projected monthly: <strong>${formatCurrency(projected)}</strong>`,
        type: 'info'
      });
    }

    insights.push({
      icon: 'fa-receipt', color: 'var(--warning)',
      text: `<strong>${dashboardSummary.transactionCount}</strong> transactions recorded this month`,
      type: 'neutral'
    });

    if (totalInc > 0) {
      const monthlySaving = totalInc - totalExp;
      const yearlyProjection = monthlySaving * 12;
      insights.push({
        icon: 'fa-piggy-bank', color: '#8b5cf6',
        text: monthlySaving >= 0
          ? `Projected annual savings: <strong>${formatCurrency(yearlyProjection)}</strong>`
          : `Projected annual deficit: <strong>${formatCurrency(Math.abs(yearlyProjection))}</strong>`,
        type: monthlySaving >= 0 ? 'success' : 'warning'
      });
    }
  }

  if (insights.length === 0) {
    container.innerHTML = `<p style="font-size:12px; color:var(--text-muted);">Add transactions and budgets to generate insights.</p>`;
    return;
  }

  container.innerHTML = insights.map(ins => `
    <div style="display:flex; gap:12px; align-items:flex-start; padding:10px 12px; border-radius:10px; background:${ins.color}08; border:1px solid ${ins.color}15;">
      <i class="fa-solid ${ins.icon}" style="color:${ins.color}; font-size:14px; margin-top:2px; flex-shrink:0;"></i>
      <p style="font-size:12px; color:var(--text-secondary); line-height:1.5;">${ins.text}</p>
    </div>
  `).join('');
}

// ===================== EXPORT =====================

async function exportData() {
  try {
    showToast('Generating CSV export...', 'info');
    await api.downloadCsv();
    showToast('Data exported successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Export failed', 'error');
  }
}

// ===================== TOAST =====================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
    warning: 'fa-triangle-exclamation'
  };
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===================== UTILITIES =====================

function formatCurrency(val) {
  const num = Number(val) || 0;
  return '$' + Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateLabel(d) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===================== NETWORK SYNC & PWA =====================

function setupNetworkListeners() {
  const offlineBanner = document.getElementById('offlineBanner');
  const onlineBanner = document.getElementById('onlineBanner');
  const badge = document.getElementById('networkBadge');

  function updateStatus(isOnline) {
    if (isOnline) {
      offlineBanner.classList.remove('visible');
      onlineBanner.classList.add('visible');
      setTimeout(() => onlineBanner.classList.remove('visible'), 3000);
      if (badge) {
        badge.className = 'network-badge';
        badge.innerHTML = '<span class="network-dot"></span> Online';
      }
      loadData(); // Re-sync data with server
    } else {
      offlineBanner.classList.add('visible');
      if (badge) {
        badge.className = 'network-badge offline';
        badge.innerHTML = '<span class="network-dot"></span> Offline';
      }
    }
  }

  window.addEventListener('online', () => updateStatus(true));
  window.addEventListener('offline', () => updateStatus(false));
  window.addEventListener('network:offline', () => updateStatus(false));

  if (!navigator.onLine) {
    updateStatus(false);
  }
}

function setupPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service Worker registered with scope:', reg.scope))
      .catch(err => console.warn('Service Worker registration failed:', err));
  }
}

// Mobile Bottom Nav navigation
function switchMobileTab(tab) {
  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-nav="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  if (tab === 'transactions') {
    document.getElementById('transactionsSection').scrollIntoView({ behavior: 'smooth' });
  } else if (tab === 'budgets') {
    document.getElementById('budgetSection').scrollIntoView({ behavior: 'smooth' });
  } else if (tab === 'reports') {
    document.getElementById('chartSection').scrollIntoView({ behavior: 'smooth' });
  } else if (tab === 'profile') {
    handleLogout();
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ===================== INIT =====================

function init() {
  // Set header date
  document.getElementById('headerDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  initAuth();
  setupNetworkListeners();
  setupPwa();

  window.addEventListener('auth:login_success', () => {
    loadData();
  });

  if (api.isAuthenticated()) {
    loadData();
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('txModal');
      closeModal('budgetModal');
      closeModal('authModal');
    }
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'SELECT') {
      e.preventDefault();
      openModal('add');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
