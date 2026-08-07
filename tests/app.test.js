const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createElement() {
  return {
    innerHTML: "",
    textContent: "",
    value: "",
    children: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    reset() {},
  };
}

function createContext() {
  const elementsById = {
    "expense-form": createElement(),
    "expense-date": createElement(),
    "expense-description": createElement(),
    "expense-category": createElement(),
    "expense-amount": createElement(),
    "form-message": createElement(),
    "summary-copy": createElement(),
    "category-totals": createElement(),
    "expense-list": createElement(),
  };

  const document = {
    addEventListener() {},
    createElement() {
      return createElement();
    },
    getElementById(id) {
      return elementsById[id] || createElement();
    },
  };

  const localStorage = {
    store: {},
    getItem(key) {
      return this.store[key] ?? null;
    },
    setItem(key, value) {
      this.store[key] = String(value);
    },
    removeItem(key) {
      delete this.store[key];
    },
  };

  const context = {
    document,
    localStorage,
    console,
    Date,
    JSON,
    Number,
    String,
    Intl,
    Math,
    Array,
    Object,
  };

  context.window = context;
  context.globalThis = context;
  context.global = context;

  return { context, elementsById };
}

const { context, elementsById } = createContext();
const appPath = path.join(__dirname, "..", "app.js");
const appSource = fs.readFileSync(appPath, "utf8");
vm.createContext(context);
vm.runInContext(appSource, context, { filename: appPath });

const elements = {
  form: elementsById["expense-form"],
  dateInput: elementsById["expense-date"],
  descriptionInput: elementsById["expense-description"],
  categorySelect: elementsById["expense-category"],
  amountInput: elementsById["expense-amount"],
  formMessage: elementsById["form-message"],
  summaryCopy: elementsById["summary-copy"],
  categoryTotals: elementsById["category-totals"],
  expenseList: elementsById["expense-list"],
};

elements.form.reset = () => {};
elements.form.addEventListener = () => {};
elements.formMessage.textContent = "";
elements.dateInput.value = "2026-08-07";
elements.descriptionInput.value = "Lunch";
elements.categorySelect.value = "Eating Out";
elements.amountInput.value = "25.00";
context.elements = elements;

const expense = vm.runInContext("createExpenseFromForm(elements)", context, { filename: appPath });
context.expense = expense;
const validation = vm.runInContext("validateExpense(expense)", context, { filename: appPath });

assert.equal(validation.valid, true, "Validation should pass for a two-decimal amount string");
assert.equal(expense.amount, "25.00", "createExpenseFromForm should preserve the raw amount string for validation");

vm.runInContext("handleFormSubmit({ preventDefault() {} })", context, { filename: appPath });
const storedExpense = vm.runInContext("state.expenses[0]", context, { filename: appPath });

assert.equal(typeof storedExpense.amount, "number", "The stored expense should use a numeric amount after validation");
assert.equal(storedExpense.amount, 25, "The amount should be converted to a number after validation succeeds");

console.log("Regression test passed");
