class ExpenseService {
  constructor() {
    this.tableName = 'expense';
    this.categories = [
      "Venue",
      "Catering", 
      "Marketing",
      "Equipment",
      "Travel",
      "Other"
    ];
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "amount" } },
          { field: { Name: "category" } },
          { field: { Name: "date" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "eventId" } }
        ],
        orderBy: [
          {
            fieldName: "Id",
            sorttype: "DESC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching expenses:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching expenses:", error.message);
        throw error;
      }
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "amount" } },
          { field: { Name: "category" } },
          { field: { Name: "date" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "eventId" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching expense with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching expense with ID ${id}:`, error.message);
        throw error;
      }
    }
  }

  async getByEventId(eventId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "description" } },
          { field: { Name: "amount" } },
          { field: { Name: "category" } },
          { field: { Name: "date" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "eventId" } }
        ],
        where: [
          {
            FieldName: "eventId",
            Operator: "EqualTo",
            Values: [parseInt(eventId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching expenses by event ID:", error.message);
      return [];
    }
  }

  async create(expenseData) {
    try {
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

      const params = {
        records: [
          {
            Name: expenseData.description.trim(),
            description: expenseData.description.trim(),
            amount: parseFloat(expenseData.amount),
            category: expenseData.category,
            date: expenseData.date || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            eventId: parseInt(expenseData.eventId)
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} expenses:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating expense:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating expense:", error.message);
        throw error;
      }
    }
  }

  async update(id, updateData) {
    try {
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

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...(updateData.description && { Name: updateData.description.trim(), description: updateData.description.trim() }),
            ...(updateData.amount && { amount: parseFloat(updateData.amount) }),
            ...(updateData.category && { category: updateData.category }),
            ...(updateData.date && { date: updateData.date }),
            ...(updateData.eventId && { eventId: parseInt(updateData.eventId) })
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} expenses:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating expense:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating expense:", error.message);
        throw error;
      }
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} expenses:${JSON.stringify(failedRecords)}`);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting expense:", error?.response?.data?.message);
      } else {
        console.error("Error deleting expense:", error.message);
      }
      return false;
    }
  }

  async getTotalByEventId(eventId) {
    try {
      const eventExpenses = await this.getByEventId(eventId);
      return eventExpenses.reduce((total, expense) => total + (expense.amount || 0), 0);
    } catch (error) {
      console.error("Error calculating total expenses:", error.message);
      return 0;
    }
  }

  getCategories() {
    return [...this.categories];
  }

  async getExpensesByCategory(eventId) {
    try {
      const eventExpenses = await this.getByEventId(eventId);
      const categoryTotals = {};
      
      this.categories.forEach(category => {
        categoryTotals[category] = 0;
      });
      
      eventExpenses.forEach(expense => {
        if (expense.category && categoryTotals.hasOwnProperty(expense.category)) {
          categoryTotals[expense.category] += expense.amount || 0;
        }
      });
      
      return categoryTotals;
    } catch (error) {
      console.error("Error calculating expenses by category:", error.message);
      const categoryTotals = {};
      this.categories.forEach(category => {
        categoryTotals[category] = 0;
      });
      return categoryTotals;
    }
  }
}

export default new ExpenseService();