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
  editingExpenseId: null,
};

function getElements() {
  return {
    form: document.getElementById("expense-form"),
    dateInput: document.getElementById("expense-date"),
    descriptionInput: document.getElementById("expense-description"),
    categorySelect: document.getElementById("expense-category"),
    amountInput: document.getElementById("expense-amount"),
    formMessage: document.getElementById("form-message"),
    formSubmitButton: document.getElementById("expense-submit"),
    formCancelButton: document.getElementById("expense-cancel"),
    formTitle: document.getElementById("expense-form-title"),
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

function normalizeAmountInput(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  const numericValue = Number(String(rawValue).trim());
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return Number(numericValue.toFixed(2));
}

function validateExpense(expense) {
  const errors = [];
  const trimmedDescription = String(expense.description || "").trim();
  const trimmedDate = String(expense.date || "").trim();
  const normalizedAmount = normalizeAmountInput(expense.amount);

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

  if (normalizedAmount === null) {
    errors.push("Amount must be a positive number; values are automatically stored with 2 decimal places.");
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
    listItem.className = "expense-item";

    const details = document.createElement("span");
    details.textContent = `${formatDate(expense.date)} • ${expense.description} • ${expense.category} • ${formatCurrency(expense.amount)}`;
    listItem.appendChild(details);

    const actions = document.createElement("div");
    actions.className = "expense-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "expense-action action-edit";
    editButton.dataset.action = "edit";
    editButton.dataset.expenseId = expense.id;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.className = "expense-action action-delete";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.expenseId = expense.id;

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    listItem.appendChild(actions);
    elements.expenseList.appendChild(listItem);
  });
}

function resetExpenseForm(elements) {
  elements.form.reset();
  elements.categorySelect.value = "";
  elements.formMessage.textContent = "";
  state.editingExpenseId = null;

  if (elements.formSubmitButton) {
    elements.formSubmitButton.textContent = "Add expense";
  }

  if (elements.formCancelButton) {
    elements.formCancelButton.hidden = true;
  }

  if (elements.formTitle) {
    elements.formTitle.textContent = "Add an expense";
  }
}

function startEditingExpense(expenseId) {
  const elements = getElements();
  const expense = state.expenses.find((entry) => entry.id === expenseId);

  if (!expense) {
    return;
  }

  state.editingExpenseId = expenseId;
  elements.dateInput.value = expense.date;
  elements.descriptionInput.value = expense.description;
  elements.categorySelect.value = expense.category;
  elements.amountInput.value = Number(expense.amount).toFixed(2);
  elements.formMessage.textContent = "Update the fields and save your changes.";

  if (elements.formSubmitButton) {
    elements.formSubmitButton.textContent = "Save changes";
  }

  if (elements.formCancelButton) {
    elements.formCancelButton.hidden = false;
  }

  if (elements.formTitle) {
    elements.formTitle.textContent = "Edit expense";
  }

  elements.dateInput.focus();
}

function deleteExpense(expenseId) {
  const elements = getElements();
  const expenseIndex = state.expenses.findIndex((expense) => expense.id === expenseId);

  if (expenseIndex === -1) {
    return;
  }

  const confirmed = typeof window !== "undefined" ? window.confirm(`Delete this expense? This action cannot be undone.`) : true;

  if (!confirmed) {
    elements.formMessage.textContent = "Delete cancelled.";
    return;
  }

  state.expenses.splice(expenseIndex, 1);
  saveExpenses();

  if (state.editingExpenseId === expenseId) {
    resetExpenseForm(elements);
  }

  elements.formMessage.textContent = "Expense deleted.";
  renderApp(elements);
}

function createExpenseFromForm(elements) {
  return {
    id: `expense-${Date.now()}`,
    date: elements.dateInput.value,
    description: elements.descriptionInput.value.trim(),
    category: elements.categorySelect.value,
    amount: elements.amountInput.value,
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

  const normalizedAmount = normalizeAmountInput(expense.amount);
  const normalizedExpense = {
    ...expense,
    amount: normalizedAmount,
  };

  if (state.editingExpenseId) {
    const expenseIndex = state.expenses.findIndex((entry) => entry.id === state.editingExpenseId);

    if (expenseIndex !== -1) {
      state.expenses[expenseIndex] = {
        ...state.expenses[expenseIndex],
        ...normalizedExpense,
        id: state.editingExpenseId,
      };
    }

    saveExpenses();
    elements.formMessage.textContent = "Expense updated successfully.";
    resetExpenseForm(elements);
    renderApp(elements);
    return;
  }

  state.expenses.push(normalizedExpense);
  saveExpenses();
  elements.form.reset();
  elements.categorySelect.value = "";
  elements.formMessage.textContent = "Expense added successfully.";
  renderApp(elements);
}

function handleExpenseListClick(event) {
  const elements = getElements();
  const targetButton = event.target && event.target.closest ? event.target.closest("button[data-action]") : null;

  if (!targetButton) {
    return;
  }

  const action = targetButton.dataset.action;
  const expenseId = targetButton.dataset.expenseId;

  if (action === "edit") {
    startEditingExpense(expenseId);
    return;
  }

  if (action === "delete") {
    deleteExpense(expenseId);
  }

  if (action === "cancel") {
    resetExpenseForm(elements);
  }
}

function initializeApp() {
  const elements = getElements();
  state.expenses = loadExpenses();
  populateCategoryOptions(elements.categorySelect);
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.expenseList.addEventListener("click", handleExpenseListClick);

  if (elements.formCancelButton) {
    elements.formCancelButton.addEventListener("click", () => resetExpenseForm(elements));
  }

  renderApp(elements);
}

document.addEventListener("DOMContentLoaded", initializeApp);
