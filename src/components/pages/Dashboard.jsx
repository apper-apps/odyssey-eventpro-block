import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import eventService from "@/services/api/eventService";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [statsData, upcomingData] = await Promise.all([
        eventService.getStats(),
        eventService.getUpcoming()
      ]);
      
      setStats(statsData);
      setUpcomingEvents(upcomingData.slice(0, 5)); // Show only 5 upcoming events
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back! Here's what's happening with your events.
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats.totalEvents || 0}
          icon="Calendar"
          gradient
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents || 0}
          icon="Clock"
          gradient
        />
        <StatCard
          title="Active Events"
          value={stats.activeEvents || 0}
          icon="Play"
          gradient
        />
        <StatCard
          title="Completed Events"
          value={stats.completedEvents || 0}
          icon="CheckCircle"
          gradient
        />
      </div>

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Button variant="outline" size="sm">
              <ApperIcon name="Calendar" className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <Empty
              title="No upcoming events"
              description="You don't have any upcoming events scheduled"
              actionLabel="Create Event"
              icon="Calendar"
            />
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.Id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(event.date), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
<div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        event.status === "Planning" ? "planning" :
                        event.status === "In Progress" ? "active" :
                        event.status === "Completed" ? "completed" :
                        event.status === "Cancelled" ? "cancelled" :
                        "default"
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="primary" className="w-full justify-start">
              <ApperIcon name="Plus" className="h-4 w-4 mr-3" />
              Create New Event
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ApperIcon name="Users" className="h-4 w-4 mr-3" />
              Manage Attendees
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ApperIcon name="FileText" className="h-4 w-4 mr-3" />
              Generate Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ApperIcon name="Settings" className="h-4 w-4 mr-3" />
              Event Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <ApperIcon name="Check" className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Holiday Company Party</span> was marked as completed
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ApperIcon name="Calendar" className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Product Launch Event</span> status changed to Active
              </p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <ApperIcon name="Plus" className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                New event <span className="font-medium">Customer Appreciation Dinner</span> was created
              </p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;