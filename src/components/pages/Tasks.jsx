import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import taskService from "@/services/api/taskService";
import eventService from "@/services/api/eventService";
import { toast } from "react-toastify";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <Button>
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
    </div>
  );
};

export default Tasks;