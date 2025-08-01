import eventsData from "@/services/mockData/events.json";

class EventService {
  constructor() {
    this.events = [...eventsData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.events];
  }

  async getById(id) {
    await this.delay();
    const event = this.events.find(e => e.Id === parseInt(id));
    return event ? { ...event } : null;
  }

  async create(eventData) {
    await this.delay();
    const maxId = Math.max(...this.events.map(e => e.Id), 0);
    const newEvent = {
      Id: maxId + 1,
      ...eventData,
      status: "Planning",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.events.push(newEvent);
    return { ...newEvent };
  }

  async update(id, updateData) {
    await this.delay();
    const index = this.events.findIndex(e => e.Id === parseInt(id));
    if (index === -1) return null;
    
    this.events[index] = {
      ...this.events[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return { ...this.events[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.events.findIndex(e => e.Id === parseInt(id));
    if (index === -1) return false;
    
    this.events.splice(index, 1);
    return true;
  }

  async getUpcoming() {
    await this.delay();
    const now = new Date();
    return this.events
      .filter(event => new Date(event.date) > now && event.status !== "Cancelled")
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  async getStats() {
    await this.delay();
    const now = new Date();
    const totalEvents = this.events.length;
    const upcomingEvents = this.events.filter(
      event => new Date(event.date) > now && event.status !== "Cancelled"
    ).length;
    const completedEvents = this.events.filter(
      event => event.status === "Completed"
    ).length;
    const activeEvents = this.events.filter(
      event => event.status === "Active"
    ).length;

    return {
      totalEvents,
      upcomingEvents,
      completedEvents,
      activeEvents
    };
  }
}

export default new EventService();