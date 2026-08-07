const STORAGE_KEY = "expenses";
const CATEGORY_OPTIONS = [
  "Groceries",
  "Fuel",
  "Travel",
  "Eating Out",
  "Utilities",
  "Other",
];

const state = {
  expenses: [],
};

function getElements() {
  return {
    form: document.getElementById("expense-form"),
    dateInput: document.getElementById("expense-date"),
    descriptionInput: document.getElementById("expense-description"),
    categorySelect: document.getElementById("expense-category"),
    amountInput: document.getElementById("expense-amount"),
    formMessage: document.getElementById("form-message"),
    summaryCopy: document.getElementById("summary-copy"),
    categoryTotals: document.getElementById("category-totals"),
    expenseList: document.getElementById("expense-list"),
  };
}

function populateCategoryOptions(selectElement) {
  selectElement.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Choose a category";
  selectElement.appendChild(placeholderOption);

  CATEGORY_OPTIONS.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    selectElement.appendChild(option);
  });
}

function loadExpenses() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((expense) => expense && typeof expense === "object")
      .map((expense) => ({
        id: expense.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        date: expense.date || "",
        description: expense.description || "",
        category: expense.category || "",
        amount: Number(Number(expense.amount).toFixed(2)),
      }));
  } catch (error) {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

function validateExpense(expense) {
  const errors = [];
  const trimmedDescription = String(expense.description || "").trim();
  const trimmedDate = String(expense.date || "").trim();
  const trimmedAmount = String(expense.amount || "").trim();

  if (!trimmedDate) {
    errors.push("Date is required.");
  } else if (!isValidIsoDate(trimmedDate)) {
    errors.push("Date must follow YYYY-MM-DD and be a valid calendar date.");
  }

  if (!trimmedDescription) {
    errors.push("Description is required.");
  }

  if (!CATEGORY_OPTIONS.includes(expense.category)) {
    errors.push("Please choose a valid category.");
  }

  if (!/^\d+(\.\d{2})$/.test(trimmedAmount)) {
    errors.push("Amount must be a positive number with exactly two decimal places.");
  } else {
    const parsedAmount = Number(trimmedAmount);
    if (parsedAmount <= 0) {
      errors.push("Amount must be greater than zero.");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function getCategoryTotals(expenses) {
  const totals = CATEGORY_OPTIONS.reduce((accumulator, category) => {
    accumulator[category] = 0;
    return accumulator;
  }, {});

  expenses.forEach((expense) => {
    if (totals[expense.category] !== undefined) {
      totals[expense.category] += Number(expense.amount);
    }
  });

  return totals;
}

function getGrandTotal(expenses) {
  return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value) {
  const parsedDate = new Date(`${value}T00:00:00`);
  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderEmptyState(elements) {
  elements.summaryCopy.textContent = "Add your first expense to start building your report.";
  elements.categoryTotals.innerHTML = "<li>No category totals yet.</li>";
  elements.expenseList.innerHTML = "<li>No expenses yet.</li>";
}

function renderApp(elements) {
  if (state.expenses.length === 0) {
    renderEmptyState(elements);
    return;
  }

  const totals = getCategoryTotals(state.expenses);
  const grandTotal = getGrandTotal(state.expenses);

  elements.summaryCopy.textContent = `Grand total: ${formatCurrency(grandTotal)}`;
  elements.categoryTotals.innerHTML = "";
  CATEGORY_OPTIONS.forEach((category) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${category}: ${formatCurrency(totals[category])}`;
    elements.categoryTotals.appendChild(listItem);
  });

  elements.expenseList.innerHTML = "";
  state.expenses.forEach((expense) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${formatDate(expense.date)} • ${expense.description} • ${expense.category} • ${formatCurrency(expense.amount)}`;
    elements.expenseList.appendChild(listItem);
  });
}

function createExpenseFromForm(elements) {
  const amountValue = elements.amountInput.value.trim();

  return {
    id: `expense-${Date.now()}`,
    date: elements.dateInput.value,
    description: elements.descriptionInput.value.trim(),
    category: elements.categorySelect.value,
    amount: amountValue,
  };
}

function handleFormSubmit(event) {
  event.preventDefault();
  const elements = getElements();
  const expense = createExpenseFromForm(elements);
  const validation = validateExpense(expense);

  if (!validation.valid) {
    elements.formMessage.textContent = validation.errors.join(" ");
    return;
  }

  const normalizedExpense = {
    ...expense,
    amount: Number(expense.amount),
  };

  state.expenses.push(normalizedExpense);
  saveExpenses();
  elements.form.reset();
  elements.categorySelect.value = "";
  elements.formMessage.textContent = "Expense added successfully.";
  renderApp(elements);
}

function initializeApp() {
  const elements = getElements();
  state.expenses = loadExpenses();
  populateCategoryOptions(elements.categorySelect);
  elements.form.addEventListener("submit", handleFormSubmit);
  renderApp(elements);
}

document.addEventListener("DOMContentLoaded", initializeApp);
