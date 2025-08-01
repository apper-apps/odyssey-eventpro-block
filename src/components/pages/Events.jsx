import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import EventsTable from "@/components/organisms/EventsTable";
import EventModal from "@/components/organisms/EventModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import eventService from "@/services/api/eventService";
import { toast } from "react-toastify";
const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await eventService.getAll();
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) {
      setError("Failed to load events");
      console.error("Events error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      const newEvent = await eventService.create(eventData);
      setEvents(prev => [newEvent, ...prev]);
      toast.success("Event created successfully!");
    } catch (err) {
      toast.error("Failed to create event");
      console.error("Create event error:", err);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventService.delete(eventId);
        setEvents(prev => prev.filter(event => event.Id !== eventId));
        toast.success("Event deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete event");
        console.error("Delete event error:", err);
      }
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvents} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search events..."
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      {filteredEvents.length === 0 ? (
        <Empty
          title="No events found"
          description={
            searchTerm || statusFilter !== "All"
              ? "Try adjusting your search criteria or filters"
              : "Get started by creating your first event"
          }
          actionLabel="Create Event"
          onAction={() => setIsModalOpen(true)}
          icon="Calendar"
        />
      ) : (
        <EventsTable
          events={filteredEvents}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Create Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};

export default Events;