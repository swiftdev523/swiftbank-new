import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaPlus,
  FaTrash,
  FaEye,
  FaCopy,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { MdMessage, MdWarning, MdAccountBalance } from "react-icons/md";
import { useMessages } from "../../context/MessageContext";

const AdminMessageManager = () => {
  const {
    getMessagesForAudience,
    updateMessage,
    createMessage,
    deleteMessage,
    isLoading,
  } = useMessages();

  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [previewMessage, setPreviewMessage] = useState(null);

  // Get account holder messages
  const accountHolderMessages = getMessagesForAudience("accountHolder");
  const messagesArray = Object.values(accountHolderMessages);

  // Filter messages based on search and category
  const filteredMessages = messagesArray.filter((message) => {
    const matchesSearch =
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || message.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(messagesArray.map((msg) => msg.category))];

  const handleEdit = (message) => {
    setEditingMessage({ ...message });
  };

  const handleSave = async () => {
    if (!editingMessage) return;

    const result = await updateMessage(
      editingMessage.id,
      editingMessage,
      "accountHolder"
    );
    if (result.success) {
      setNotification({
        type: "success",
        message: "Message updated successfully!",
      });
      setEditingMessage(null);
    } else {
      setNotification({ type: "error", message: "Failed to update message." });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancel = () => {
    setEditingMessage(null);
  };

  const handleToggleActive = async (messageId, currentStatus) => {
    const result = await updateMessage(
      messageId,
      { isActive: !currentStatus },
      "accountHolder"
    );
    if (result.success) {
      setNotification({
        type: "success",
        message: `Message ${!currentStatus ? "activated" : "deactivated"} successfully!`,
      });
    } else {
      setNotification({
        type: "error",
        message: "Failed to update message status.",
      });
    }

    setTimeout(() => setNotification(null), 3000);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "warning":
        return <FaExclamationTriangle className="text-amber-500" />;
      case "success":
        return <FaCheckCircle className="text-green-500" />;
      case "error":
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      transaction: "bg-blue-100 text-blue-800",
      service: "bg-purple-100 text-purple-800",
      account: "bg-green-100 text-green-800",
      system: "bg-orange-100 text-orange-800",
      authentication: "bg-indigo-100 text-indigo-800",
      security: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <MdMessage className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Account Holder Messages
            </h2>
            <p className="text-gray-600">
              Manage pop-up messages shown to account holders
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <FaPlus />
          <span>New Message</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? (
              <FaCheckCircle />
            ) : (
              <FaExclamationTriangle />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white">
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
            {/* Message Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getTypeIcon(message.type)}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {message.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}>
                      {message.category}
                    </span>
                    <button
                      onClick={() =>
                        handleToggleActive(message.id, message.isActive)
                      }
                      className={`flex items-center space-x-1 text-xs ${
                        message.isActive ? "text-green-600" : "text-gray-400"
                      }`}>
                      {message.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      <span>{message.isActive ? "Active" : "Inactive"}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewMessage(message)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Preview">
                  <FaEye />
                </button>
                <button
                  onClick={() => handleEdit(message)}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Edit">
                  <FaEdit />
                </button>
              </div>
            </div>

            {/* Message Content */}
            {editingMessage && editingMessage.id === message.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingMessage.title}
                    onChange={(e) =>
                      setEditingMessage({
                        ...editingMessage,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={editingMessage.message}
                    onChange={(e) =>
                      setEditingMessage({
                        ...editingMessage,
                        message: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <FaSave />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 text-sm mb-2">{message.message}</p>
                <div className="text-xs text-gray-400">
                  Last modified:{" "}
                  {new Date(message.lastModified).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewMessage && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Message Preview
              </h3>
              <button
                onClick={() => setPreviewMessage(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimes />
              </button>
            </div>

            {/* This mimics how the message appears to account holders */}
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 border border-amber-200 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-amber-600" />
                </div>
                <h4 className="font-semibold text-amber-800">
                  {previewMessage.title}
                </h4>
              </div>
              <p className="text-amber-700 text-sm">{previewMessage.message}</p>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Category: {previewMessage.category} | Status:{" "}
              {previewMessage.isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <MdMessage className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            No messages found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminMessageManager;
