const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createElement(tagName = "div") {
  return {
    tagName,
    innerHTML: "",
    textContent: "",
    value: "",
    hidden: false,
    id: "",
    className: "",
    dataset: {},
    files: [],
    listeners: {},
    clickCount: 0,
    children: [],
    addEventListener(eventName, listener) {
      this.listeners[eventName] = listener;
    },
    dispatch(eventName, event = {}) {
      return this.listeners[eventName]?.(event);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    click() {
      this.clickCount += 1;
    },
    remove() {
      this.removed = true;
    },
    focus() {},
    reset() {},
    closest() {
      return null;
    },
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
    "export-csv": createElement(),
    "import-csv": createElement(),
    "import-file": createElement(),
    "import-message": createElement(),
    "summary-copy": createElement(),
    "category-totals": createElement(),
    "expense-list": createElement(),
  };

  const createdElements = [];
  const appendedElements = [];
  const document = {
    listeners: {},
    addEventListener(eventName, listener) {
      this.listeners[eventName] = listener;
    },
    dispatch(eventName, event = {}) {
      return this.listeners[eventName]?.(event);
    },
    createElement(tagName) {
      const element = createElement(tagName);
      createdElements.push(element);
      return element;
    },
    getElementById(id) {
      return elementsById[id] || createElement();
    },
    body: {
      appendChild(element) {
        appendedElements.push(element);
        return element;
      },
    },
  };

  const localStorage = {
    store: {},
    failWrites: false,
    getItem(key) {
      return this.store[key] ?? null;
    },
    setItem(key, value) {
      if (this.failWrites) {
        throw new Error("Storage quota exceeded");
      }
      this.store[key] = String(value);
    },
    removeItem(key) {
      delete this.store[key];
    },
    clear() {
      this.store = {};
      this.failWrites = false;
    },
  };

  class MockBlob {
    constructor(parts, options = {}) {
      this.parts = parts;
      this.type = options.type || "";
    }

    async text() {
      return this.parts.join("");
    }
  }

  const objectUrls = [];
  const revokedObjectUrls = [];
  let nextObjectUrl = 0;
  const URL = {
    createObjectURL(blob) {
      const objectUrl = `blob:test-${nextObjectUrl++}`;
      objectUrls.push({ objectUrl, blob });
      return objectUrl;
    },
    revokeObjectURL(objectUrl) {
      revokedObjectUrls.push(objectUrl);
    },
  };

  class MockDate extends Date {
    static now() {
      return 1_780_000_000_000;
    }
  }

  const context = {
    document,
    localStorage,
    console,
    Date: MockDate,
    JSON,
    Number,
    String,
    Intl,
    Math,
    Array,
    Object,
    Blob: MockBlob,
    URL,
    confirm: () => true,
  };

  context.window = context;
  context.globalThis = context;
  context.global = context;

  return {
    context,
    elementsById,
    localStorage,
    createdElements,
    appendedElements,
    objectUrls,
    revokedObjectUrls,
  };
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

vm.runInContext(`
  state.expenses = [
    { id: "expense-1", date: "2026-08-01", description: "Groceries", category: "Groceries", amount: 25 },
    { id: "expense-2", date: "2026-08-02", description: "Train ticket", category: "Travel", amount: 40 }
  ];
  renderApp(elements);
`, context, { filename: appPath });

context.confirm = () => true;
vm.runInContext("deleteExpense('expense-1')", context, { filename: appPath });
assert.equal(vm.runInContext("state.expenses.length", context, { filename: appPath }), 1, "Deleting an expense should remove it from the collection");
assert.equal(vm.runInContext("state.expenses[0].description", context, { filename: appPath }), "Train ticket", "The remaining expense should stay in the list");

context.confirm = () => false;
vm.runInContext("state.expenses = [\n  { id: 'expense-1', date: '2026-08-01', description: 'Groceries', category: 'Groceries', amount: 25 },\n  { id: 'expense-2', date: '2026-08-02', description: 'Train ticket', category: 'Travel', amount: 40 }\n];", context, { filename: appPath });
vm.runInContext("deleteExpense('expense-1')", context, { filename: appPath });
assert.equal(vm.runInContext("state.expenses.length", context, { filename: appPath }), 2, "Cancelling the delete confirmation should leave the expense in the list");

context.confirm = () => true;
vm.runInContext("startEditingExpense('expense-2')", context, { filename: appPath });
assert.equal(elements.dateInput.value, "2026-08-02", "Editing should populate the form with the selected expense");

elements.descriptionInput.value = "Train ticket updated";
elements.categorySelect.value = "Travel";
elements.amountInput.value = "45.50";
vm.runInContext("handleFormSubmit({ preventDefault() {} })", context, { filename: appPath });
const updatedExpense = vm.runInContext("state.expenses.find((entry) => entry.id === 'expense-2')", context, { filename: appPath });
assert.equal(updatedExpense.description, "Train ticket updated", "Editing should update the stored expense details");
assert.equal(updatedExpense.amount, 45.5, "Edited amounts should be normalized to a numeric value with two decimal places");

async function runExportContractTests() {
  const harness = createContext();
  vm.createContext(harness.context);
  vm.runInContext(appSource, harness.context, { filename: appPath });
  harness.localStorage.setItem("expenses", JSON.stringify([
    { id: "expense-1", date: "2026-09-01", description: "Market, east", category: "Groceries", amount: 42 },
    { id: "expense-2", date: "2026-09-02", description: 'Fuel "plus" service', category: "Fuel", amount: 42.5 },
    { id: "expense-3", date: "2026-09-03", description: "Two\nlines", category: "Travel", amount: 10 },
  ]));
  harness.context.document.dispatch("DOMContentLoaded");

  const exportButton = harness.elementsById["export-csv"];
  assert.equal(typeof exportButton.listeners.click, "function", "Export CSV control should have a click handler");

  const initialState = vm.runInContext("JSON.stringify(state.expenses)", harness.context);
  const initialStorage = harness.localStorage.getItem("expenses");
  exportButton.dispatch("click");

  assert.equal(harness.objectUrls.length, 1, "Export should create a browser download URL");
  const downloadLink = harness.createdElements.at(-1);
  assert.equal(downloadLink.tagName, "a", "Export should activate a temporary download link");
  assert.equal(downloadLink.download, "expenses.csv", "Export should use the documented filename");
  assert.equal(downloadLink.clickCount, 1, "Export should trigger the browser download");
  assert.equal(downloadLink.removed, true, "Export should remove the temporary download link");

  const csv = await harness.objectUrls[0].blob.text();
  assert.ok(csv.startsWith("\uFEFFdate,description,category,amount\r\n"), "Export should use a BOM and the exact header order");
  assert.ok(csv.includes('2026-09-01,"Market, east",Groceries,42.00'), "Export should quote commas and format amounts to two decimals");
  assert.ok(csv.includes('2026-09-02,"Fuel ""plus"" service",Fuel,42.50'), "Export should escape embedded quotes");
  assert.ok(csv.includes('2026-09-03,"Two\nlines",Travel,10.00'), "Export should preserve line breaks inside quoted fields");
  assert.equal(vm.runInContext("JSON.stringify(state.expenses)", harness.context), initialState, "Export should not change the in-memory collection");
  assert.equal(harness.localStorage.getItem("expenses"), initialStorage, "Export should not change persisted expenses");

  vm.runInContext("state.expenses = []", harness.context);
  const emptyCollectionStorage = harness.localStorage.getItem("expenses");
  exportButton.dispatch("click");
  const emptyCsv = await harness.objectUrls[1].blob.text();
  assert.equal(emptyCsv, "\uFEFFdate,description,category,amount", "An empty collection should export only the header");
  assert.equal(harness.localStorage.getItem("expenses"), emptyCollectionStorage, "Empty export should not mutate storage");
}

async function runImportContractTests() {
  const harness = createContext();
  vm.createContext(harness.context);
  vm.runInContext(appSource, harness.context, { filename: appPath });
  const existingExpense = {
    id: "existing-expense",
    date: "2026-09-01",
    description: "Existing bill",
    category: "Utilities",
    amount: 50,
  };
  harness.localStorage.setItem("expenses", JSON.stringify([existingExpense]));
  harness.context.document.dispatch("DOMContentLoaded");

  const importButton = harness.elementsById["import-csv"];
  const fileInput = harness.elementsById["import-file"];
  const status = harness.elementsById["import-message"];
  const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const templatePath = path.join(__dirname, "..", "expense-import-template.csv");
  assert.equal(typeof importButton.listeners.click, "function", "Import CSV control should open the file picker");
  assert.equal(typeof fileInput.listeners.change, "function", "CSV file input should process selected files");
  assert.match(indexHtml, /id="csv-import-template"[^>]*href="expense-import-template\.csv"[^>]*>CSV Import Template<\/a>/, "Import UI should provide the requested template download beside the import control");
  assert.equal(fs.readFileSync(templatePath, "utf8").trim(), "date,description,category,amount", "Import template should contain the required header only");
  const beforeCancel = JSON.stringify(vm.runInContext("state.expenses", harness.context));
  const storageBeforeCancel = harness.localStorage.getItem("expenses");
  importButton.dispatch("click");
  assert.equal(fileInput.clickCount, 1, "Import control should activate the file picker");
  assert.equal(JSON.stringify(vm.runInContext("state.expenses", harness.context)), beforeCancel, "Canceling the picker should leave expenses unchanged");
  assert.equal(harness.localStorage.getItem("expenses"), storageBeforeCancel, "Canceling the picker should leave storage unchanged");

  async function importCsv(text) {
    fileInput.files = [{ name: "expenses.csv", text: async () => text }];
    fileInput.value = "expenses.csv";
    await fileInput.dispatch("change", { target: fileInput });
  }

  async function importUnreadableFile() {
    fileInput.files = [{ name: "expenses.csv", text: async () => { throw new Error("Read failed"); } }];
    fileInput.value = "expenses.csv";
    await fileInput.dispatch("change", { target: fileInput });
  }

  const validCsv = "\uFEFFdescription,amount,category,date,source\r\n\" Imported coffee \",42.5,\" Eating Out \",2026-09-10,bank\r\nWrong width,11,Travel,2026-09-11\r\nBad category,10,groceries,2026-09-12,bank\r\n";
  await importCsv(validCsv);

  const importedExpenses = vm.runInContext("state.expenses", harness.context);
  assert.equal(importedExpenses.length, 2, `Import should append valid rows without replacing existing expenses: ${status.textContent}`);
  assert.equal(importedExpenses[0].id, existingExpense.id, "Import should preserve existing expense identity");
  assert.equal(importedExpenses[1].date, "2026-09-10", "Import should map reordered required headers");
  assert.equal(importedExpenses[1].description, "Imported coffee", "Import should trim surrounding data-field whitespace");
  assert.equal(importedExpenses[1].category, "Eating Out", "Import should trim but case-sensitively validate categories");
  assert.equal(importedExpenses[1].amount, 42.5, "Import should normalize a plain decimal amount");
  assert.ok(importedExpenses[1].id, "Imported expenses should receive an ID");
  assert.notEqual(importedExpenses[1].id, existingExpense.id, "Imported expense IDs should be unique");
  assert.match(status.textContent, /1.*accepted/i, "Import feedback should report the accepted count");
  assert.match(status.textContent, /2.*skipped/i, "Import feedback should count wrong-width and invalid rows");
  assert.match(status.textContent, /CSV record 3: Expected 5 fields, found 4\./, "Import feedback should explain why a wrong-width row was skipped");
  assert.match(status.textContent, /CSV record 4: Category must exactly match the supported categories \(case-sensitive\)\./, "Import feedback should explain the exact invalid field");
  assert.equal(fileInput.value, "", "File input should reset after import");
  assert.equal(vm.runInContext("getGrandTotal(state.expenses)", harness.context), 92.5, "Import should update the grand total");
  assert.equal(harness.elementsById["category-totals"].children.some((item) => item.textContent.includes("Eating Out: $42.50")), true, "Import should refresh category totals");
  assert.equal(vm.runInContext("loadExpenses().length", harness.context), 2, "Imported records should persist for reload");

  await importCsv('date,description,category,amount\n2026-09-13,"Cafe, ""North""\nRoast",Other,7\n');
  const quotedExpense = vm.runInContext("state.expenses[2]", harness.context);
  assert.equal(quotedExpense.description, 'Cafe, "North"\nRoast', "Import should preserve quoted commas, quotes, and LF line breaks");
  assert.equal(quotedExpense.amount, 7, "Import should accept LF record separators");

  const beforeBoundaries = JSON.stringify(vm.runInContext("state.expenses", harness.context));
  await importCsv("date,description,category,amount\r\n2026-09-14,Maximum,Other,100000\r\n2026-09-15,Over cap,Other,100000.001\r\n2026-09-16,Half up,Other,1.005\r\n2026-09-17,Under cent,Other,0.004\r\n2026-09-18,Exponent,Other,1e2\r\n2026-09-19,Plus sign,Other,+1\r\n2026-09-20,Comma,Other,\"1,000\"\r\n2026-09-21,Leading decimal,Other,.5\r\n2026-09-22,Trailing decimal,Other,42.\r\n2026-02-30,Invalid date,Other,1\r\n2026-09-23,   ,Other,1\r\n");
  const boundaryExpenses = vm.runInContext("state.expenses", harness.context);
  assert.equal(boundaryExpenses.length, 5, "The inclusive cap and half-up values should import; invalid formats should be skipped");
  assert.equal(boundaryExpenses[3].amount, 100000, "The maximum amount should be accepted inclusively");
  assert.equal(boundaryExpenses[4].amount, 1.01, "Exact half-cent values should round up deterministically");
  assert.match(status.textContent, /2.*accepted/i);
  assert.match(status.textContent, /9.*skipped/i);
  assert.match(status.textContent, /CSV record 3: Amount cannot exceed 100000 before rounding\./, "Import feedback should explain the amount limit");
  assert.notEqual(JSON.stringify(boundaryExpenses), beforeBoundaries, "Valid boundary rows should append despite invalid sibling rows");

  const beforeHeaderOnly = JSON.stringify(boundaryExpenses);
  await importCsv("date,description,category,amount\r\n\r\n");
  assert.equal(JSON.stringify(vm.runInContext("state.expenses", harness.context)), beforeHeaderOnly, "Header-only and blank records should not change expenses");
  assert.match(status.textContent, /0.*accepted/i);
  assert.match(status.textContent, /0.*skipped/i);

  const beforeStorageFailure = JSON.stringify(vm.runInContext("state.expenses", harness.context));
  const storedBeforeFailure = harness.localStorage.getItem("expenses");
  harness.localStorage.failWrites = true;
  await importCsv("date,description,category,amount\r\n2026-09-22,Storage failure,Other,1\r\n");
  assert.equal(JSON.stringify(vm.runInContext("state.expenses", harness.context)), beforeStorageFailure, "Storage failure should roll back in-memory import");
  assert.equal(harness.localStorage.getItem("expenses"), storedBeforeFailure, "Storage failure should preserve persisted expenses");
  assert.match(status.textContent, /storage|save|persist/i, "Storage failure should show a clear error");
  harness.localStorage.failWrites = false;

  for (const invalidFile of [
    "",
    "description,category,amount\r\nMissing date,Other,1\r\n",
    "Date,description,category,amount\r\n2026-09-23,Case mismatch,Other,1\r\n",
    " date,description,category,amount\r\n2026-09-23,Whitespace mismatch,Other,1\r\n",
    "date,description,category,amount,amount\r\n2026-09-23,Duplicate,Other,1,2\r\n",
    "date,description,category,amount\r\n2026-09-23,\"Malformed,Other,1\r\n",
  ]) {
    const beforeFileError = JSON.stringify(vm.runInContext("state.expenses", harness.context));
    const beforeFileStorage = harness.localStorage.getItem("expenses");
    await importCsv(invalidFile);
    assert.equal(JSON.stringify(vm.runInContext("state.expenses", harness.context)), beforeFileError, "File-level errors should leave memory unchanged");
    assert.equal(harness.localStorage.getItem("expenses"), beforeFileStorage, "File-level errors should leave storage unchanged");
    assert.ok(status.textContent, "File-level errors should provide feedback");
  }

  const beforeReadFailure = JSON.stringify(vm.runInContext("state.expenses", harness.context));
  const storageBeforeReadFailure = harness.localStorage.getItem("expenses");
  await importUnreadableFile();
  assert.equal(JSON.stringify(vm.runInContext("state.expenses", harness.context)), beforeReadFailure, "Unreadable files should leave memory unchanged");
  assert.equal(harness.localStorage.getItem("expenses"), storageBeforeReadFailure, "Unreadable files should leave storage unchanged");
  assert.match(status.textContent, /failed|read/i, "Unreadable files should report an error");
}

function runLegacyRegressionTests() {
  const harness = createContext();
  vm.createContext(harness.context);
  vm.runInContext(appSource, harness.context, { filename: appPath });
  harness.context.document.dispatch("DOMContentLoaded");

  const { context, elementsById, localStorage } = harness;
  const form = elementsById["expense-form"];
  const dateInput = elementsById["expense-date"];
  const descriptionInput = elementsById["expense-description"];
  const categorySelect = elementsById["expense-category"];
  const amountInput = elementsById["expense-amount"];
  const formMessage = elementsById["form-message"];
  const submit = () => form.dispatch("submit", { preventDefault() {} });

  dateInput.value = "2026-02-30";
  descriptionInput.value = "   ";
  categorySelect.value = "Unknown";
  amountInput.value = "0";
  submit();
  assert.equal(vm.runInContext("state.expenses.length", context), 0, "Invalid add submissions should not change expenses");
  assert.ok(formMessage.textContent.includes("valid calendar date"), "Invalid dates should produce validation feedback");

  dateInput.value = "2026-09-01";
  descriptionInput.value = "Groceries";
  categorySelect.value = "Groceries";
  amountInput.value = "12.3";
  submit();
  dateInput.value = "2026-09-02";
  descriptionInput.value = "Fuel";
  categorySelect.value = "Fuel";
  amountInput.value = "20.00";
  submit();

  assert.equal(vm.runInContext("state.expenses.length", context), 2, "Valid add submissions should append expenses");
  assert.equal(vm.runInContext("getCategoryTotals(state.expenses).Groceries", context), 12.3, "Category totals should reflect added expenses");
  assert.equal(vm.runInContext("getGrandTotal(state.expenses)", context), 32.3, "Grand total should reflect added expenses");

  const originalExpense = vm.runInContext("state.expenses[0]", context);
  vm.runInContext("startEditingExpense(state.expenses[0].id)", context);
  amountInput.value = "0";
  submit();
  assert.equal(vm.runInContext("state.expenses[0].amount", context), 12.3, "Invalid edits should preserve the original expense");
  assert.ok(formMessage.textContent.includes("Amount must be a positive number"), "Invalid edit feedback should explain the amount rule");

  vm.runInContext("startEditingExpense(state.expenses[0].id)", context);
  descriptionInput.value = "Train pass";
  categorySelect.value = "Travel";
  amountInput.value = "14.50";
  submit();
  assert.equal(vm.runInContext("state.expenses[0].description", context), "Train pass", "Valid edits should update the record");
  assert.equal(vm.runInContext("getCategoryTotals(state.expenses).Travel", context), 14.5, "Edited categories should update category totals");
  assert.equal(vm.runInContext("getGrandTotal(state.expenses)", context), 34.5, "Edited amounts should update the grand total");
  assert.notEqual(originalExpense.description, "Train pass", "Edit should not mutate a stale expense snapshot");

  const reloadedHarness = createContext();
  reloadedHarness.localStorage.store = { ...localStorage.store };
  vm.createContext(reloadedHarness.context);
  vm.runInContext(appSource, reloadedHarness.context, { filename: appPath });
  reloadedHarness.context.document.dispatch("DOMContentLoaded");
  assert.equal(vm.runInContext("state.expenses.length", reloadedHarness.context), 2, "Expenses should persist after app reinitialization");
  assert.equal(vm.runInContext("state.expenses[0].description", reloadedHarness.context), "Train pass", "Edited expense values should persist after reload");

  const persistedBeforeCancel = reloadedHarness.localStorage.getItem("expenses");
  reloadedHarness.context.confirm = () => false;
  vm.runInContext("deleteExpense(state.expenses[0].id)", reloadedHarness.context);
  assert.equal(vm.runInContext("state.expenses.length", reloadedHarness.context), 2, "Canceled deletion should preserve all expenses");
  assert.equal(reloadedHarness.localStorage.getItem("expenses"), persistedBeforeCancel, "Canceled deletion should not change storage");

  reloadedHarness.context.confirm = () => true;
  vm.runInContext("deleteExpense(state.expenses[0].id)", reloadedHarness.context);
  assert.equal(vm.runInContext("state.expenses.length", reloadedHarness.context), 1, "Confirmed deletion should remove the selected expense");
  assert.equal(vm.runInContext("getGrandTotal(state.expenses)", reloadedHarness.context), 20, "Confirmed deletion should recalculate totals");
}

runExportContractTests()
  .then(runImportContractTests)
  .then(runLegacyRegressionTests)
  .then(
  () => console.log("Regression and CSV contract tests passed"),
  (error) => {
    console.error(error);
    process.exitCode = 1;
  },
  );
