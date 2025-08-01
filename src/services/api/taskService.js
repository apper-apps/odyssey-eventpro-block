import tasksData from "@/services/mockData/tasks.json";

class TaskService {
  constructor() {
    this.tasks = [...tasksData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.tasks];
  }

  async getById(id) {
    await this.delay();
    const task = this.tasks.find(t => t.Id === parseInt(id));
    return task ? { ...task } : null;
  }

  async getByEventId(eventId) {
    await this.delay();
    return this.tasks.filter(t => t.eventId === parseInt(eventId));
  }

  async create(taskData) {
    await this.delay();
    const maxId = Math.max(...this.tasks.map(t => t.Id), 0);
    const newTask = {
      Id: maxId + 1,
      ...taskData,
      completed: false
    };
    this.tasks.push(newTask);
    return { ...newTask };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) return null;
    
    this.tasks[index] = {
      ...this.tasks[index],
      ...updateData
    };
    return { ...this.tasks[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.tasks.findIndex(t => t.Id === parseInt(id));
    if (index === -1) return false;
    
    this.tasks.splice(index, 1);
    return true;
  }

  async getActiveTasks() {
    await this.delay();
    return this.tasks.filter(task => !task.completed);
  }
}

export default new TaskService();