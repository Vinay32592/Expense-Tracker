document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const balanceEl = document.getElementById('balance');
  const listEl = document.getElementById('transaction-list');
  const transactionForm = document.getElementById('transaction-form');
  const descriptionEl = document.getElementById('description');
  const amountEl = document.getElementById('amount');
  const typeEl = document.getElementById('type');
  const ctx = document.getElementById('expenseChart').getContext('2d');
  
  const goalForm = document.getElementById('goal-form');
  const goalNameEl = document.getElementById('goal-name');
  const goalAmountEl = document.getElementById('goal-amount');
  const goalTextEl = document.getElementById('goal-text');
  const goalProgressEl = document.getElementById('goal-progress');
  const insightTextEl = document.getElementById('insight-text');

  // --- State Management ---
  let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  let goal = JSON.parse(localStorage.getItem('goal')) || null;
  let expenseChart;

  // --- Functions ---
  function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('goal', JSON.stringify(goal));
  }

  function addTransaction(e) {
    e.preventDefault(); 
    const description = descriptionEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const type = typeEl.value;

    if (description === '' || isNaN(amount) || amount === 0) {
      alert('Please enter a valid description and amount.');
      return;
    }

    const transaction = { id: Date.now(), description, amount: type === 'expense' ? -amount : amount };
    transactions.push(transaction);
    descriptionEl.value = '';
    amountEl.value = '';
    descriptionEl.focus();
    render();
  }
  
  function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    render();
  }

  function setGoal(e) {
    e.preventDefault();
    const name = goalNameEl.value.trim();
    const amount = parseFloat(goalAmountEl.value);

    if (name === '' || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid name and positive amount for your goal.');
      return;
    }
    goal = { name, amount };
    goalNameEl.value = '';
    goalAmountEl.value = '';
    render();
  }

  function updateDOM() {
    listEl.innerHTML = '';
    if (transactions.length === 0) {
      listEl.innerHTML = '<li>No transactions to show.</li>';
    } else {
      transactions.forEach(t => {
        const sign = t.amount < 0 ? '−' : '+'; // Using minus sign for consistency
        const item = document.createElement('li');
        item.classList.add(t.amount < 0 ? 'expense' : 'income');
        item.innerHTML = `
          <span>${t.description}</span>
          <span>${sign}₹${Math.abs(t.amount).toFixed(2)}</span>
          <button class="delete-btn" data-id="${t.id}">X</button>
        `;
        listEl.appendChild(item);
      });
    }

    const totalBalance = transactions.reduce((acc, t) => acc + t.amount, 0);
    balanceEl.innerText = `₹${totalBalance.toFixed(2)}`;
  }

  function updateGoalProgress() {
    if (!goal) {
      goalTextEl.innerText = 'Set a goal to start saving!';
      goalProgressEl.value = 0;
      return;
    }
    const totalBalance = transactions.reduce((acc, t) => acc + t.amount, 0);
    const savedAmount = Math.max(0, totalBalance);
    const percentage = Math.min(100, (savedAmount / goal.amount) * 100);
    goalTextEl.innerHTML = `<strong>${goal.name}:</strong> ₹${savedAmount.toFixed(2)} / ₹${goal.amount.toFixed(2)}`;
    goalProgressEl.value = percentage;
  }

  function updateInsights() {
    if (transactions.length < 2) {
      insightTextEl.innerText = 'Add transactions to see insights.';
      return;
    }
    const expenses = transactions.filter(t => t.amount < 0);
    if (expenses.length === 0) {
      insightTextEl.innerText = 'Great job! You have no expenses yet.';
      return;
    }
    const largestExpense = expenses.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, expenses[0]);
    insightTextEl.innerHTML = `Your biggest expense was <strong>"${largestExpense.description}"</strong> for ₹${Math.abs(largestExpense.amount).toFixed(2)}.`;
  }
  
  function updateChart() {
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0) * -1;
    expenseChart.data.datasets[0].data[0] = income;
    expenseChart.data.datasets[0].data[1] = expense;
    expenseChart.update();
  }
  
  function initChart() {
    expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#28a745', '#dc3545'],
          borderColor: '#ffffff',
          borderWidth: 4,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      },
    });
  }

  function render() {
    updateDOM();
    updateChart();
    updateGoalProgress();
    updateInsights();
    saveData();
  }

  // --- Event Listeners ---
  transactionForm.addEventListener('submit', addTransaction);
  goalForm.addEventListener('submit', setGoal);
  listEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      removeTransaction(parseInt(e.target.getAttribute('data-id')));
    }
  });

  // --- Initial Setup ---
  initChart();
  render();
});