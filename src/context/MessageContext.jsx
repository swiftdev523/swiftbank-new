import React, { createContext, useContext, useEffect, useState } from "react";
import firestoreService from "../services/firestoreService";

const MessageContext = createContext();

export const useMessages = () => {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessages must be used within MessageProvider");
  return ctx;
};

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState({ accountHolder: {}, admin: {} });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with empty messages - notifications feature disabled to prevent console errors
  useEffect(() => {
    // Set empty messages as default - notifications collection not yet implemented
    setMessages({ accountHolder: {}, admin: {} });
  }, []);

  // Read helpers
  const getMessage = (messageId, audience = "accountHolder") => {
    return messages[audience]?.[messageId] || null;
  };

  const getMessagesForAudience = (audience = "accountHolder") => {
    return messages[audience] || {};
  };

  const getMessagesByCategory = (category, audience = "accountHolder") => {
    const map = messages[audience] || {};
    return Object.values(map).filter((m) => m.category === category);
  };

  // Write helpers
  const updateMessage = async (
    messageId,
    updates,
    audience = "accountHolder"
  ) => {
    // Local-only update - notifications feature disabled
    setMessages((prev) => ({
      ...prev,
      [audience]: {
        ...prev[audience],
        [messageId]: {
          ...prev[audience]?.[messageId],
          ...updates,
          lastModified: new Date().toISOString(),
        },
      },
    }));
    return { success: true };
  };

  const createMessage = async (messageData, audience = "accountHolder") => {
    // Local-only create - notifications feature disabled
    const id = messageData.id || `msg_${Date.now()}`;
    const payload = {
      ...messageData,
      id,
      audience,
      isActive: messageData.isActive !== false,
      lastModified: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [audience]: {
        ...prev[audience],
        [id]: payload,
      },
    }));

    return { success: true, id };
  };

  const deleteMessage = async (messageId, audience = "accountHolder") => {
    // Local-only delete - notifications feature disabled
    setMessages((prev) => {
      const clone = { ...prev };
      const bucket = { ...(clone[audience] || {}) };
      delete bucket[messageId];
      clone[audience] = bucket;
      return clone;
    });

    return { success: true };
  };

  const value = {
    messages,
    isLoading,
    getMessage,
    updateMessage,
    getMessagesForAudience,
    getMessagesByCategory,
    createMessage,
    deleteMessage,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

export default MessageContext;
