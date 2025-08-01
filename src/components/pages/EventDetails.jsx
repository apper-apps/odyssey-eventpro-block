import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import eventService from "@/services/api/eventService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

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
    toast.info("Edit functionality will be implemented soon");
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvent} />;
  if (!event) return <Error message="Event not found" onRetry={() => navigate("/events")} />;

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

      {/* Event Details Card */}
      <Card className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Title and Status */}
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
    </div>
  );
};

export default EventDetails;