import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import EventModal from "@/components/organisms/EventModal";
import eventService from "@/services/api/eventService";
import taskService from "@/services/api/taskService";
import FormField from "@/components/molecules/FormField";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import { format } from "date-fns";
import { toast } from "react-toastify";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    dueDate: ""
  });
  const [taskFormErrors, setTaskFormErrors] = useState({});
const loadEvent = async () => {
    try {
      setLoading(true);
      setError("");
      const eventData = await eventService.getById(parseInt(id));
      setEvent(eventData);
    } catch (err) {
      setError("Failed to load event details");
      console.error("Event details error:", err);
    } finally {
      setLoading(false);
    }
  };
const loadTasks = async () => {
    if (!event) return;
    try {
      setTasksLoading(true);
      const eventTasks = await taskService.getByEventId(event.Id);
      setTasks(eventTasks);
    } catch (err) {
      toast.error("Failed to load tasks");
      console.error("Load tasks error:", err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleEditEvent = async (eventData) => {
    try {
      const updatedEvent = await eventService.update(event.Id, eventData);
      setEvent(updatedEvent);
      toast.success("Event updated successfully!");
      setEditingEvent(null);
    } catch (err) {
      toast.error("Failed to update event");
      console.error("Update event error:", err);
    }
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
    
    if (!taskFormData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!taskFormData.description.trim()) {
      newErrors.description = "Task description is required";
    }
    
    if (!taskFormData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    setTaskFormErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const newTask = await taskService.create({
          title: taskFormData.title,
          description: taskFormData.description,
          dueDate: taskFormData.dueDate,
          eventId: event.Id
        });
        
        setTasks(prev => [...prev, newTask]);
        setTaskFormData({ title: "", description: "", dueDate: "" });
        setTaskFormErrors({});
        setShowTaskModal(false);
        toast.success("Task created successfully!");
      } catch (err) {
        toast.error("Failed to create task");
        console.error("Create task error:", err);
      }
    }
  };

  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (taskFormErrors[name]) {
      setTaskFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };
useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  useEffect(() => {
    if (event && activeTab === "tasks") {
      loadTasks();
    }
  }, [event, activeTab]);
  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Planning":
        return "warning";
      case "Completed":
        return "info";
      case "Cancelled":
        return "error";
      default:
        return "secondary";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

const handleEdit = () => {
    setEditingEvent(event);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvent} />;
  if (!event) return <Error message="Event not found" onRetry={() => navigate("/events")} />;

const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/events"
            className="flex items-center text-secondary hover:text-primary transition-colors"
          >
            <ApperIcon name="ArrowLeft" className="h-5 w-5 mr-2" />
            Back to Events
          </Link>
        </div>
        <Button onClick={handleEdit} className="sm:w-auto">
          <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
          Edit Event
        </Button>
      </div>

      {/* Event Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {event.title}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(event.status)} className="text-sm">
              {event.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("details")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ApperIcon name="Info" className="h-4 w-4 mr-2 inline-block" />
            Details
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "tasks"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ApperIcon name="CheckSquare" className="h-4 w-4 mr-2 inline-block" />
            Tasks
            {totalTasks > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {completedTasks}/{totalTasks}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {/* Event Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Event Date
                </h3>
                <div className="flex items-center gap-2 text-gray-900">
                  <ApperIcon name="Calendar" className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">
                    {format(new Date(event.date), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Budget
                </h3>
                <div className="flex items-center gap-2 text-gray-900">
                  <ApperIcon name="DollarSign" className="h-5 w-5 text-primary" />
                  <span className="text-lg font-medium">
                    {formatCurrency(event.budget)}
                  </span>
                </div>
              </div>

              {/* Creation Date */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Created
                </h3>
                <div className="flex items-center gap-2 text-gray-900">
                  <ApperIcon name="Clock" className="h-5 w-5 text-primary" />
                  <span className="text-base">
                    {format(new Date(event.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>

              {/* Status Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Current Status
                </h3>
                <div className="flex items-center gap-2">
                  <ApperIcon 
                    name={
                      event.status === "Active" ? "CheckCircle" :
                      event.status === "Planning" ? "Clock" :
                      event.status === "Completed" ? "CheckCircle2" :
                      "XCircle"
                    } 
                    className="h-5 w-5 text-primary" 
                  />
                  <Badge variant={getStatusVariant(event.status)} className="text-base px-3 py-1">
                    {event.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Description
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {event.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Tasks Header with Progress */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">Event Tasks</h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {completedTasks} of {totalTasks} tasks completed
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[120px]">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
              <Button onClick={() => setShowTaskModal(true)}>
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </Card>

          {/* Tasks List */}
          {tasksLoading ? (
            <Loading />
          ) : tasks.length === 0 ? (
            <Card className="p-8 text-center">
              <ApperIcon name="CheckSquare" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first task for this event.</p>
              <Button onClick={() => setShowTaskModal(true)}>
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.Id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
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
                        <p className={`text-xs ${
                          task.completed ? "text-green-600" : "text-gray-500"
                        }`}>
                          {task.description}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
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
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Link to="/events">
          <Button variant="outline" className="w-full sm:w-auto">
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <Button onClick={handleEdit} className="w-full sm:w-auto">
          <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
          Edit Event
        </Button>
      </div>

      {/* Event Edit Modal */}
      <EventModal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSubmit={handleEditEvent}
        event={editingEvent}
        mode="edit"
      />

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowTaskModal(false)}>
                <ApperIcon name="X" className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <FormField
                label="Task Title"
                name="title"
                value={taskFormData.title}
                onChange={handleTaskFormChange}
                placeholder="Enter task title"
                error={taskFormErrors.title}
              />
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={taskFormData.description}
                  onChange={handleTaskFormChange}
                  placeholder="Enter task description"
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
                {taskFormErrors.description && (
                  <p className="text-sm text-red-600">{taskFormErrors.description}</p>
                )}
              </div>
              
              <FormField
                label="Due Date"
                name="dueDate"
                type="datetime-local"
                value={taskFormData.dueDate}
                onChange={handleTaskFormChange}
                error={taskFormErrors.dueDate}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)}>
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

export default EventDetails;