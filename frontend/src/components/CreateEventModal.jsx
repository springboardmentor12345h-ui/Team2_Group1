import React, { useState } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import Button from "./ui/Button";
import axios from "axios";
import { toast } from "react-toastify";

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Hackathon",
    location: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/events", formData);
      toast.success("Event created successfully!");
      onEventCreated(data.data.event);
      onClose();
      setFormData({
        title: "",
        description: "",
        category: "Hackathon",
        location: "",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Event"
      maxWidth="max-w-2xl"
    >
      <div className="p-8">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Create New Event
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. Annual Tech Summit"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
              >
                <option>Hackathon</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Workshop</option>
              </select>
            </div>
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. Main Auditorium"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <Input
              label="End Date & Time"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-4 py-2 bg-white border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-secondary-900"
              placeholder="Describe your event..."
            />
          </div>
          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1 justify-center"
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateEventModal;
