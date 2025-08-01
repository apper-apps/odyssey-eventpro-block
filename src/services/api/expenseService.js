import expensesData from "@/services/mockData/expenses.json";

class ExpenseService {
  constructor() {
    this.expenses = [...expensesData];
    this.categories = [
      "Venue",
      "Catering", 
      "Marketing",
      "Equipment",
      "Travel",
      "Other"
    ];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.expenses];
  }

  async getById(id) {
    await this.delay();
    const expense = this.expenses.find(e => e.Id === parseInt(id));
    return expense ? { ...expense } : null;
  }

  async getByEventId(eventId) {
    await this.delay();
    return this.expenses
      .filter(expense => expense.eventId === parseInt(eventId))
      .map(expense => ({ ...expense }));
  }

  async create(expenseData) {
    await this.delay();
    
    // Validate required fields
    if (!expenseData.eventId) {
      throw new Error("Event ID is required");
    }
    if (!expenseData.description?.trim()) {
      throw new Error("Description is required");
    }
    if (!expenseData.amount || expenseData.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (!expenseData.category) {
      throw new Error("Category is required");
    }
    if (!this.categories.includes(expenseData.category)) {
      throw new Error("Invalid category");
    }

    const maxId = Math.max(...this.expenses.map(e => e.Id), 0);
    const newExpense = {
      Id: maxId + 1,
      eventId: parseInt(expenseData.eventId),
      description: expenseData.description.trim(),
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      date: expenseData.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    this.expenses.push(newExpense);
    return { ...newExpense };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) return null;

    // Validate if provided
    if (updateData.description !== undefined && !updateData.description.trim()) {
      throw new Error("Description cannot be empty");
    }
    if (updateData.amount !== undefined && (updateData.amount <= 0 || isNaN(updateData.amount))) {
      throw new Error("Amount must be greater than 0");
    }
    if (updateData.category && !this.categories.includes(updateData.category)) {
      throw new Error("Invalid category");
    }

    this.expenses[index] = {
      ...this.expenses[index],
      ...updateData,
      amount: updateData.amount ? parseFloat(updateData.amount) : this.expenses[index].amount,
      description: updateData.description ? updateData.description.trim() : this.expenses[index].description
    };
    return { ...this.expenses[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.expenses.findIndex(e => e.Id === parseInt(id));
    if (index === -1) return false;
    
    this.expenses.splice(index, 1);
    return true;
  }

  async getTotalByEventId(eventId) {
    await this.delay();
    const eventExpenses = this.expenses.filter(e => e.eventId === parseInt(eventId));
    return eventExpenses.reduce((total, expense) => total + expense.amount, 0);
  }

  getCategories() {
    return [...this.categories];
  }

  async getExpensesByCategory(eventId) {
    await this.delay();
    const eventExpenses = this.expenses.filter(e => e.eventId === parseInt(eventId));
    const categoryTotals = {};
    
    this.categories.forEach(category => {
      categoryTotals[category] = 0;
    });
    
    eventExpenses.forEach(expense => {
      categoryTotals[expense.category] += expense.amount;
    });
    
    return categoryTotals;
  }
}

export default new ExpenseService();