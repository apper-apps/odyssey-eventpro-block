class EventService {
  constructor() {
    this.tableName = 'event';
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
          { field: { Name: "title" } },
          { field: { Name: "date" } },
          { field: { Name: "description" } },
          { field: { Name: "budget" } },
          { field: { Name: "status" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "updatedAt" } }
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
        console.error("Error fetching events:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching events:", error.message);
        throw error;
      }
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "date" } },
          { field: { Name: "description" } },
          { field: { Name: "budget" } },
          { field: { Name: "status" } },
          { field: { Name: "createdAt" } },
          { field: { Name: "updatedAt" } }
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
        console.error(`Error fetching event with ID ${id}:`, error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching event with ID ${id}:`, error.message);
        throw error;
      }
    }
  }

  async create(eventData) {
    try {
      const params = {
        records: [
          {
            Name: eventData.title,
            title: eventData.title,
            date: eventData.date,
            description: eventData.description,
            budget: parseFloat(eventData.budget),
            status: eventData.status || "Planning",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
          console.error(`Failed to create ${failedRecords.length} events:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating event:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating event:", error.message);
        throw error;
      }
    }
  }

  async update(id, updateData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            ...(updateData.title && { Name: updateData.title, title: updateData.title }),
            ...(updateData.date && { date: updateData.date }),
            ...(updateData.description && { description: updateData.description }),
            ...(updateData.budget && { budget: parseFloat(updateData.budget) }),
            ...(updateData.status && { status: updateData.status }),
            updatedAt: new Date().toISOString()
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
          console.error(`Failed to update ${failedRecords.length} events:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error updating event:", error?.response?.data?.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating event:", error.message);
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
          console.error(`Failed to delete ${failedRecords.length} events:${JSON.stringify(failedRecords)}`);
          return false;
        }
        
        return true;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting event:", error?.response?.data?.message);
      } else {
        console.error("Error deleting event:", error.message);
      }
      return false;
    }
  }

  async getUpcoming() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "date" } },
          { field: { Name: "status" } }
        ],
        where: [
          {
            FieldName: "date",
            Operator: "GreaterThan",
            Values: [new Date().toISOString()]
          }
        ],
        orderBy: [
          {
            fieldName: "date",
            sorttype: "ASC"
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).filter(event => event.status !== "Cancelled");
    } catch (error) {
      console.error("Error fetching upcoming events:", error.message);
      return [];
    }
  }

  async getStats() {
    try {
      const allEventsResponse = await this.getAll();
      const events = allEventsResponse || [];
      
      const now = new Date();
      const totalEvents = events.length;
      const upcomingEvents = events.filter(
        event => new Date(event.date) > now && event.status !== "Cancelled"
      ).length;
      const completedEvents = events.filter(
        event => event.status === "Completed"
      ).length;
      const activeEvents = events.filter(
        event => event.status === "In Progress"
      ).length;

      return {
        totalEvents,
        upcomingEvents,
        completedEvents,
        activeEvents
      };
    } catch (error) {
      console.error("Error fetching event stats:", error.message);
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        activeEvents: 0
      };
    }
  }
}

export default new EventService();