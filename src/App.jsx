import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppProviders from "./context/AppProviders";
import { BankDataProvider } from "./context/BankDataContext";
// Performance monitor removed per request
import DevelopmentNotice from "./components/DevelopmentNotice";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerRoute from "./components/CustomerRoute";
import AdminRoute from "./components/AdminRoute";
import DeveloperRoute from "./components/DeveloperRoute";
import AdminRedirect from "./components/AdminRedirect";
import AdminRedirectGuard from "./components/AdminRedirectGuard";
import LoadingSpinner from "./components/LoadingSpinner";
import Watermark from "./components/Watermark";
import ErrorBoundary from "./components/ErrorBoundary";
import FirebaseErrorDisplay from "./components/FirebaseErrorDisplay";
import FirebaseStatusMonitor from "./components/FirebaseStatusMonitor";
import { updateJohnsonBalances } from "./utils/updateBalances";

// Import layout components
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

// Lazy load main pages
const LandingPage = React.lazy(() =>
  import("./pages/LandingPage").catch((err) => {
    console.error("Failed to load LandingPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load page. Please refresh.
        </div>
      ),
    };
  })
);

const LoginPage = React.lazy(() =>
  import("./pages/LoginPage").catch((err) => {
    console.error("Failed to load LoginPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load page. Please refresh.
        </div>
      ),
    };
  })
);

const AdminLoginPage = React.lazy(() =>
  import("./pages/AdminLoginPage").catch((err) => {
    console.error("Failed to load AdminLoginPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load page. Please refresh.
        </div>
      ),
    };
  })
);

// Lazy load dashboard sub-pages
const DashboardOverview = React.lazy(() =>
  import("./pages/dashboard/DashboardOverview").catch((err) => {
    console.error("Failed to load DashboardOverview:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load dashboard. Please refresh.
        </div>
      ),
    };
  })
);

const AccountsPage = React.lazy(() =>
  import("./pages/dashboard/AccountsPage").catch((err) => {
    console.error("Failed to load AccountsPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load accounts. Please refresh.
        </div>
      ),
    };
  })
);

const TransactionsPage = React.lazy(() =>
  import("./pages/TransactionsPage").catch((err) => {
    console.error("Failed to load TransactionsPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load transactions. Please refresh.
        </div>
      ),
    };
  })
);

const AnalyticsPage = React.lazy(() =>
  import("./pages/dashboard/AnalyticsPage").catch((err) => {
    console.error("Failed to load AnalyticsPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load analytics. Please refresh.
        </div>
      ),
    };
  })
);

const ProfilePage = React.lazy(() =>
  import("./pages/ProfilePage").catch((err) => {
    console.error("Failed to load ProfilePage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load profile. Please refresh.
        </div>
      ),
    };
  })
);

// Lazy load admin pages (reduced to 4 sections)
const AdminUsersPage = React.lazy(() =>
  import("./pages/admin/AdminUsersPage").catch((err) => {
    console.error("Failed to load AdminUsersPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load account holders. Please refresh.
        </div>
      ),
    };
  })
);

const AdminTransactionsPage = React.lazy(() =>
  import("./pages/admin/AdminTransactionsPage").catch((err) => {
    console.error("Failed to load AdminTransactionsPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load admin transactions. Please refresh.
        </div>
      ),
    };
  })
);

const AdminMessagesPage = React.lazy(() =>
  import("./pages/admin/AdminMessagesPage").catch((err) => {
    console.error("Failed to load AdminMessagesPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load admin messages. Please refresh.
        </div>
      ),
    };
  })
);

const AdminAuthPage = React.lazy(() =>
  import("./pages/admin/AdminAuthPage").catch((err) => {
    console.error("Failed to load AdminAuthPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load authentication management. Please refresh.
        </div>
      ),
    };
  })
);

// Lazy load developer pages
const DeveloperLoginPage = React.lazy(() =>
  import("./pages/developer/DeveloperLoginPage").catch((err) => {
    console.error("Failed to load DeveloperLoginPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load developer login. Please refresh.
        </div>
      ),
    };
  })
);

const DeveloperPage = React.lazy(() =>
  import("./pages/developer/DeveloperPage").catch((err) => {
    console.error("Failed to load DeveloperPage:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load developer dashboard. Please refresh.
        </div>
      ),
    };
  })
);

const DeveloperSetup = React.lazy(() =>
  import("./components/auth/DeveloperSetup").catch((err) => {
    console.error("Failed to load DeveloperSetup:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load developer setup. Please refresh.
        </div>
      ),
    };
  })
);

const AuthenticationTester = React.lazy(() =>
  import("./components/auth/AuthenticationTester").catch((err) => {
    console.error("Failed to load AuthenticationTester:", err);
    return {
      default: () => (
        <div className="p-8 text-center">
          Failed to load authentication tester. Please refresh.
        </div>
      ),
    };
  })
);

// Enhanced loading component
const LoadingFallback = ({ message = "Loading..." }) => (
  <LoadingSpinner
    size="xl"
    message={message}
    variant="white"
    fullScreen={true}
  />
);

const App = () => {
  // Make balance update function globally available with throttling warning
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.updateJohnsonBalances = updateJohnsonBalances;
      if (process.env.NODE_ENV === "development") {
        console.log(
          "💰 Balance update function available: window.updateJohnsonBalances()"
        );
        console.log(
          "⚠️ Function is throttled to prevent Firebase quota issues"
        );
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppProviders>
        <BankDataProvider>
          <Router>
            <div className="min-h-screen">
              <FirebaseErrorDisplay />
              <FirebaseStatusMonitor />
              <AdminRedirectGuard>
                <Suspense
                  fallback={<LoadingFallback message="Loading App..." />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                      path="/login"
                      element={
                        <Suspense
                          fallback={<LoadingFallback message="Loading..." />}>
                          <LoginPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/admin/login"
                      element={
                        <Suspense
                          fallback={
                            <LoadingFallback message="Loading Admin Login..." />
                          }>
                          <AdminLoginPage />
                        </Suspense>
                      }
                    />

                    {/* Customer Dashboard Routes with Nested Structure */}
                    <Route
                      path="/dashboard"
                      element={
                        <CustomerRoute>
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Dashboard..." />
                            }>
                            <DashboardLayout />
                          </Suspense>
                        </CustomerRoute>
                      }>
                      {/* Nested Dashboard Routes */}
                      <Route
                        index
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Overview..." />
                            }>
                            <DashboardOverview />
                          </Suspense>
                        }
                      />
                      <Route
                        path="accounts"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Accounts..." />
                            }>
                            <AccountsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="transactions"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Transactions..." />
                            }>
                            <TransactionsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="analytics"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Analytics..." />
                            }>
                            <AnalyticsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Profile..." />
                            }>
                            <ProfilePage />
                          </Suspense>
                        }
                      />
                    </Route>

                    {/* Legacy route redirects for backward compatibility */}
                    <Route
                      path="/transactions"
                      element={
                        <Navigate to="/dashboard/transactions" replace />
                      }
                    />
                    <Route
                      path="/profile"
                      element={<Navigate to="/dashboard/profile" replace />}
                    />

                    {/* Admin Routes with Nested Structure */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Admin Panel..." />
                            }>
                            <AdminLayout />
                          </Suspense>
                        </AdminRoute>
                      }>
                      {/* Nested Admin Routes (4 sections) */}
                      <Route
                        index
                        element={
                          <Navigate to="/admin/account-holders" replace />
                        }
                      />
                      <Route
                        path="account-holders"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Account Holders..." />
                            }>
                            <AdminUsersPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="transactions"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Transaction Management..." />
                            }>
                            <AdminTransactionsPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="messages"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Message Management..." />
                            }>
                            <AdminMessagesPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="authentication"
                        element={
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Authentication Management..." />
                            }>
                            <AdminAuthPage />
                          </Suspense>
                        }
                      />
                    </Route>

                    {/* Admin dashboard canonical route - redirect to account holders */}
                    <Route
                      path="/admin-dashboard"
                      element={<Navigate to="/admin/account-holders" replace />}
                    />
                    <Route
                      path="/admin/dashboard"
                      element={<Navigate to="/admin/account-holders" replace />}
                    />
                    <Route
                      path="/admin/users"
                      element={<Navigate to="/admin/account-holders" replace />}
                    />
                    <Route
                      path="/admin/accounts"
                      element={<Navigate to="/admin/account-holders" replace />}
                    />

                    {/* Developer Routes */}
                    <Route
                      path="/auth/test"
                      element={
                        <Suspense
                          fallback={
                            <LoadingFallback message="Loading Authentication Tester..." />
                          }>
                          <AuthenticationTester />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/developer/setup"
                      element={
                        <Suspense
                          fallback={
                            <LoadingFallback message="Loading Developer Setup..." />
                          }>
                          <DeveloperSetup />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/developer/login"
                      element={
                        <Suspense
                          fallback={
                            <LoadingFallback message="Loading Developer Login..." />
                          }>
                          <DeveloperLoginPage />
                        </Suspense>
                      }
                    />
                    <Route
                      path="/developer/dashboard"
                      element={
                        <DeveloperRoute>
                          <Suspense
                            fallback={
                              <LoadingFallback message="Loading Developer Dashboard..." />
                            }>
                            <DeveloperPage />
                          </Suspense>
                        </DeveloperRoute>
                      }
                    />

                    {/* Catch all route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </AdminRedirectGuard>
            </div>
          </Router>
          <DevelopmentNotice />
        </BankDataProvider>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
