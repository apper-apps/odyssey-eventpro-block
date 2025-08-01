import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import taskService from "@/services/api/taskService";
import eventService from "@/services/api/eventService";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Label from "@/components/atoms/Label";
import Card from "@/components/atoms/Card";

const Tasks = () => {
const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    eventId: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const loadTasksAndEvents = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [tasksData, eventsData] = await Promise.all([
        taskService.getAll(),
        eventService.getAll()
      ]);
      
      setTasks(tasksData);
      setEvents(eventsData);
    } catch (err) {
      setError("Failed to load tasks and events");
      console.error("Tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasksAndEvents();
  }, []);

  const getEventTitle = (eventId) => {
    const event = events.find(e => e.Id === eventId);
    return event ? event.title : "Unknown Event";
  };
const handleToggleTask = async (taskId, completed) => {
    try {
      await taskService.update(taskId, { completed: !completed });
      setTasks(prev => prev.map(task =>
        task.Id === taskId ? { ...task, completed: !completed } : task
      ));
      toast.success(completed ? "Task marked as incomplete" : "Task completed!");
    } catch (err) {
      toast.error("Failed to update task");
      console.error("Update task error:", err);
    }
  };

  const handleCreateTask = async () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Task description is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (!formData.eventId) {
      newErrors.eventId = "Please select an event";
    }
    
    setFormErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const newTask = await taskService.create({
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          eventId: parseInt(formData.eventId)
        });
        
        setTasks(prev => [...prev, newTask]);
        setFormData({ title: "", description: "", dueDate: "", eventId: "" });
        setFormErrors({});
        setShowModal(false);
        toast.success("Task created successfully!");
      } catch (err) {
        toast.error("Failed to create task");
        console.error("Create task error:", err);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const groupTasksByEvent = () => {
    const grouped = {};
    tasks.forEach(task => {
      const eventTitle = getEventTitle(task.eventId);
      if (!grouped[eventTitle]) {
        grouped[eventTitle] = [];
      }
      grouped[eventTitle].push(task);
    });
    return grouped;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTasksAndEvents} />;

  const groupedTasks = groupTasksByEvent();
  const hasNoTasks = Object.keys(groupedTasks).length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
<Button onClick={() => setShowModal(true)}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {hasNoTasks ? (
        <Empty
          title="No tasks found"
          description="Tasks will appear here once you start planning your events"
          actionLabel="Create Event"
          icon="CheckSquare"
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([eventTitle, eventTasks]) => (
            <Card key={eventTitle} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{eventTitle}</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {eventTasks.filter(t => t.completed).length} of {eventTasks.length} completed
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(eventTasks.filter(t => t.completed).length / eventTasks.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {eventTasks.map((task) => (
                  <div
                    key={task.Id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      task.completed
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleTask(task.Id, task.completed)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          task.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-primary"
                        }`}
                      >
                        {task.completed && <ApperIcon name="Check" className="h-3 w-3" />}
                      </button>
                      <div>
                        <h3 className={`text-sm font-medium ${
                          task.completed ? "text-green-800 line-through" : "text-gray-900"
                        }`}>
                          {task.title}
                        </h3>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500">
                            Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-error hover:text-red-700 hover:bg-red-50">
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                <ApperIcon name="X" className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <FormField
                label="Task Title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Enter task title"
                error={formErrors.title}
              />
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter task description"
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                {formErrors.description && (
                  <p className="text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
              
              <FormField
                label="Due Date"
                name="dueDate"
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleFormChange}
                error={formErrors.dueDate}
              />
              
              <div className="space-y-2">
                <Label htmlFor="eventId">Assign to Event</Label>
                <select
                  id="eventId"
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleFormChange}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <option value="">Select an event</option>
                  {events.map(event => (
                    <option key={event.Id} value={event.Id}>
                      {event.title}
                    </option>
                  ))}
                </select>
                {formErrors.eventId && (
                  <p className="text-sm text-red-600">{formErrors.eventId}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;