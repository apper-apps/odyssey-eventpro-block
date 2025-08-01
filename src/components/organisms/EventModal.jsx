import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";

const EventModal = ({ isOpen, onClose, onSubmit, event = null, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    budget: "",
    status: "Planning"
  });

  // Initialize form data when event prop changes
  useEffect(() => {
    if (event && mode === 'edit') {
      setFormData({
        title: event.title || "",
        date: event.date ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : "",
        description: event.description || "",
        budget: event.budget ? event.budget.toString() : "",
        status: event.status || "Planning"
      });
    } else {
      setFormData({
        title: "",
        date: "",
        description: "",
        budget: "",
        status: "Planning"
      });
    }
  }, [event, mode]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Event date is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Event description is required";
    }
    
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = "Valid budget amount is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        budget: parseFloat(formData.budget)
      });
      setFormData({
        title: "",
        date: "",
        description: "",
        budget: ""
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      date: "",
      description: "",
      budget: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
<h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Event' : 'Create New Event'}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <ApperIcon name="X" className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            error={errors.title}
          />
          
          <FormField
            label="Event Date"
            name="date"
            type="datetime-local"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
          />
          
          <FormField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter event description"
            error={errors.description}
          >
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows={3}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </FormField>
          
          <FormField
            label="Budget ($)"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            value={formData.budget}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.budget}
/>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
<option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
<Button type="submit">
              {mode === 'edit' ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;