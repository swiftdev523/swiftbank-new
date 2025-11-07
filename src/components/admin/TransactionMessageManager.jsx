import React, { useEffect, useMemo, useState } from "react";
import {
  FaExchangeAlt,
  FaArrowDown,
  FaArrowUp,
  FaCreditCard,
  FaEdit,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
} from "react-icons/fa";
import ConfirmationModal from "../common/ConfirmationModal";
import { useMessages } from "../../context/MessageContext";
import {
  UNAVAILABILITY_TYPES,
  DEFAULT_MESSAGES,
  MESSAGE_CATEGORIES,
  MESSAGE_AUDIENCES,
  MESSAGE_TYPES,
} from "../../constants/transactionMessages";

// Icon mapping for transaction types
const ICON_MAP = {
  transfer: FaExchangeAlt,
  deposit: FaArrowDown,
  withdrawal: FaArrowUp,
  payment: FaCreditCard,
};

// Enhanced unavailability types with proper icons
const unavailabilityTypes = UNAVAILABILITY_TYPES.map((type) => ({
  ...type,
  icon: ICON_MAP[type.category] || FaExchangeAlt,
}));

const TransactionMessageManager = () => {
  const {
    messages,
    getMessagesByCategory,
    createMessage,
    updateMessage,
    deleteMessage,
    isLoading,
  } = useMessages();

  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    message: "",
    type: "warning",
    isActive: true,
    isNew: false,
  });
  const [confirmAction, setConfirmAction] = useState(null);

  const rawUnavailable = useMemo(
    () =>
      getMessagesByCategory(
        MESSAGE_CATEGORIES.UNAVAILABLE,
        MESSAGE_AUDIENCES.ACCOUNT_HOLDER
      ) || [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages]
  );

  useEffect(() => {
    const list = unavailabilityTypes.map((t) => {
      const existing = rawUnavailable.find((m) => m.id === t.id);
      if (existing) return existing;
      return {
        id: t.id,
        title: t.defaultTitle,
        message: DEFAULT_MESSAGES.UNAVAILABLE,
        type: MESSAGE_TYPES.WARNING,
        isActive: true,
        category: MESSAGE_CATEGORIES.UNAVAILABLE,
        audience: MESSAGE_AUDIENCES.ACCOUNT_HOLDER,
        isNew: true, // placeholder (not yet created in Firestore)
      };
    });
    setItems(list);
  }, [rawUnavailable]);

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setFormData({
      id: msg.id,
      title: msg.title || "",
      message: msg.message || "",
      type: msg.type || "warning",
      isActive: msg.isActive !== false,
      isNew: !!msg.isNew,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      id: "",
      title: "",
      message: "",
      type: "warning",
      isActive: true,
      isNew: false,
    });
  };

  const saveMessage = async () => {
    try {
      if (formData.isNew) {
        await createMessage(
          {
            id: formData.id,
            title: formData.title || formData.id,
            message: formData.message || DEFAULT_MESSAGE_TEXT,
            type: formData.type,
            isActive: formData.isActive,
            category: "unavailable",
            audience: "accountHolder",
          },
          "accountHolder"
        );
      } else {
        await updateMessage(
          formData.id,
          {
            title: formData.title,
            message: formData.message,
            type: formData.type,
            isActive: formData.isActive,
          },
          "accountHolder"
        );
      }
    } catch (e) {
      console.error("Error saving message:", e);
    } finally {
      cancelEdit();
    }
  };

  const handleToggleStatus = (msg) => {
    if (msg.isNew) return; // can't toggle placeholder not yet created
    setConfirmAction({
      type: "toggle",
      title: msg.isActive ? "Deactivate Message" : "Activate Message",
      content: `Are you sure you want to ${msg.isActive ? "deactivate" : "activate"} the message "${msg.title}"?`,
      message: msg,
    });
  };

  const handleDeleteMessage = (msg) => {
    if (msg.isNew) return; // nothing to delete yet
    setConfirmAction({
      type: "delete",
      title: "Delete Transaction Message",
      content: `Are you sure you want to delete the message "${msg.title}"? This action cannot be undone.`,
      message: msg,
    });
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === "delete") {
        await deleteMessage(confirmAction.message.id, "accountHolder");
      } else if (confirmAction.type === "toggle") {
        await updateMessage(
          confirmAction.message.id,
          { isActive: !confirmAction.message.isActive },
          "accountHolder"
        );
      }
    } catch (e) {
      console.error("Error performing action:", e);
    } finally {
      setConfirmAction(null);
    }
  };

  const seedDefaults = async () => {
    try {
      const existing = new Set(rawUnavailable.map((m) => m.id));
      for (const t of unavailabilityTypes) {
        if (!existing.has(t.id)) {
          await createMessage(
            {
              id: t.id,
              title: t.defaultTitle,
              message: DEFAULT_MESSAGE_TEXT,
              type: "warning",
              isActive: true,
              category: "unavailable",
              audience: "accountHolder",
            },
            "accountHolder"
          );
        }
      }
    } catch (e) {
      console.error("Error seeding defaults:", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FaExclamationTriangle className="text-orange-500 mr-3" />
              Transaction Unavailability Messages
            </h2>
            <p className="text-gray-600 mt-2">
              Manage messages shown to customers when transaction operations are
              unavailable.
            </p>
          </div>
          <button
            onClick={seedDefaults}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50">
            <FaPlus size={14} />
            <span>Seed Defaults</span>
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="divide-y divide-gray-200">
          {items.map((msg) => {
            const typeCfg = unavailabilityTypes.find((t) => t.id === msg.id);
            const isEditing = editingId === msg.id;
            const Icon = typeCfg?.icon || FaExchangeAlt;
            return (
              <div key={msg.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className="text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {typeCfg?.label || msg.id}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          msg.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {msg.isActive ? "Active" : "Inactive"}
                      </span>
                      {msg.isNew && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                          Not created yet
                        </span>
                      )}
                    </div>

                    {typeCfg && (
                      <p className="text-sm text-gray-600 mb-4">
                        {typeCfg.description}
                      </p>
                    )}

                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                title: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Message title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                          </label>
                          <textarea
                            value={formData.message}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                message: e.target.value,
                              }))
                            }
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Message content"
                          />
                        </div>

                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  isActive: e.target.checked,
                                }))
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Active
                            </span>
                          </label>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={saveMessage}
                            disabled={
                              isLoading || !formData.title || !formData.message
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50">
                            <FaSave size={14} />
                            <span>{isLoading ? "Saving..." : "Save"}</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                            <FaTimes size={14} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {msg.title}
                        </h4>
                        <p className="text-gray-700 mb-4">{msg.message}</p>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(msg)}
                            className={`p-2 rounded-lg transition-colors ${
                              msg.isActive
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={msg.isActive ? "Deactivate" : "Activate"}
                            disabled={msg.isNew}>
                            {msg.isActive ? <FaEyeSlash /> : <FaEye />}
                          </button>
                          <button
                            onClick={() => startEdit(msg)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit">
                            <FaEdit />
                          </button>
                          {!msg.isNew && (
                            <button
                              onClick={() => handleDeleteMessage(msg)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete">
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No unavailability messages found
            </p>
            <p className="text-gray-400 mb-4">
              Click "Seed Defaults" to create the default messages
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmActionHandler}
        title={confirmAction?.title}
        message={confirmAction?.content}
        type={confirmAction?.type === "delete" ? "error" : "warning"}
        confirmText={confirmAction?.type === "delete" ? "Delete" : "Confirm"}
        cancelText="Cancel"
      />
    </div>
  );
};

export default TransactionMessageManager;
