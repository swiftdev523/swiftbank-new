import React from "react";
import { AppProvider } from "./AppContext";
import { AuthProvider } from "./AuthContext";
import { DeveloperProvider } from "./DeveloperContext";
import { DataProvider } from "./DataContext";
import { ModalProvider } from "./ModalContext";
import { MessageProvider } from "./MessageContext";
import { WebsiteSettingsProvider } from "./WebsiteSettingsContext";
import ErrorBoundary from "../components/ErrorBoundary";

/**
 * Root provider that wraps the entire application with all necessary contexts
 * This ensures proper provider hierarchy and error boundaries
 */
const AppProviders = ({ children }) => {
  return (
    <ErrorBoundary fallbackTitle="Application Error" showReset={true}>
      <AuthProvider>
        <DeveloperProvider>
          <WebsiteSettingsProvider>
            <AppProvider>
              <DataProvider>
                <MessageProvider>
                  <ModalProvider>{children}</ModalProvider>
                </MessageProvider>
              </DataProvider>
            </AppProvider>
          </WebsiteSettingsProvider>
        </DeveloperProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
