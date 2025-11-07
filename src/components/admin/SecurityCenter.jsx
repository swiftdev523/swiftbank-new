import React, { useState, useEffect } from "react";
import {
  FaShieldAlt,
  FaExclamationTriangle,
  FaEye,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaBan,
  FaUnlock,
  FaLock,
  FaFlag,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaGlobe,
} from "react-icons/fa";
import {
  MdSecurity,
  MdVerified,
  MdError,
  MdWarning,
  MdInfo,
  MdBlock,
  MdVpnKey,
} from "react-icons/md";

const SecurityCenter = () => {
  const [activeTab, setActiveTab] = useState("alerts");
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [failedLogins, setFailedLogins] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");

  // Mock security data
  useEffect(() => {
    const mockSecurityAlerts = [
      {
        id: "SEC001",
        type: "failed_login",
        severity: "high",
        title: "Multiple Failed Login Attempts",
        description:
          "5 consecutive failed login attempts from IP 192.168.1.100",
        userId: 3,
        userName: "Michael Brown",
        ipAddress: "192.168.1.100",
        location: "New York, NY",
        timestamp: "2025-05-04 10:30:00",
        status: "active",
        actions: ["Block IP", "Lock Account", "Investigate"],
      },
      {
        id: "SEC002",
        type: "suspicious_transaction",
        severity: "critical",
        title: "Large Transaction Outside Normal Pattern",
        description:
          "Wire transfer of $500,000 - 10x larger than user's normal activity",
        userId: 1,
        userName: "John Smith",
        amount: 500000,
        location: "Switzerland",
        timestamp: "2025-05-04 09:15:00",
        status: "investigating",
        actions: ["Freeze Transaction", "Contact Customer", "Report"],
      },
      {
        id: "SEC003",
        type: "unusual_access",
        severity: "medium",
        title: "Login from New Device",
        description: "User logged in from unrecognized device/browser",
        userId: 2,
        userName: "Sarah Johnson",
        device: "iPhone 15 Pro - Safari",
        ipAddress: "203.45.67.89",
        location: "Los Angeles, CA",
        timestamp: "2025-09-12 08:45:00",
        status: "resolved",
        actions: ["Verify Identity", "Send Alert", "Monitor"],
      },
      {
        id: "SEC004",
        type: "security_breach",
        severity: "critical",
        title: "Potential Data Access Attempt",
        description: "Unauthorized attempt to access customer database",
        ipAddress: "89.45.123.67",
        location: "Unknown",
        timestamp: "2025-05-04 07:20:00",
        status: "blocked",
        actions: ["Block IP Range", "Enhance Security", "Audit Logs"],
      },
      {
        id: "SEC005",
        type: "policy_violation",
        severity: "low",
        title: "Password Policy Violation",
        description: "User attempting to use previously used password",
        userId: 4,
        userName: "Emily Davis",
        timestamp: "2025-05-04 06:10:00",
        status: "auto_resolved",
        actions: ["Force Password Change", "Education", "Monitor"],
      },
    ];

    const mockFailedLogins = [
      {
        id: 1,
        username: "john.smith",
        ipAddress: "192.168.1.100",
        location: "New York, NY",
        attempts: 5,
        lastAttempt: "2025-05-04 10:30:00",
        status: "blocked",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: 2,
        username: "admin",
        ipAddress: "89.45.123.67",
        location: "Unknown",
        attempts: 3,
        lastAttempt: "2025-05-04 09:45:00",
        status: "monitoring",
        userAgent: "curl/7.68.0",
      },
      {
        id: 3,
        username: "sarah.johnson",
        ipAddress: "203.45.67.89",
        location: "Los Angeles, CA",
        attempts: 2,
        lastAttempt: "2025-05-04 08:15:00",
        status: "cleared",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
      },
    ];

    const mockSuspiciousActivities = [
      {
        id: 1,
        type: "unusual_location",
        description: "User accessing account from unusual geographic location",
        userId: 1,
        userName: "John Smith",
        details: "Login from Switzerland (usual location: New York)",
        riskScore: 85,
        timestamp: "2025-05-04 10:00:00",
        status: "investigating",
      },
      {
        id: 2,
        type: "velocity_check",
        description: "Rapid succession of transactions detected",
        userId: 2,
        userName: "Sarah Johnson",
        details: "8 transactions within 5 minutes",
        riskScore: 70,
        timestamp: "2025-05-04 09:30:00",
        status: "cleared",
      },
      {
        id: 3,
        type: "amount_anomaly",
        description: "Transaction amount significantly higher than normal",
        userId: 4,
        userName: "Emily Davis",
        details: "Transfer of $75,000 (normal: $5,000 average)",
        riskScore: 90,
        timestamp: "2025-05-04 08:45:00",
        status: "flagged",
      },
    ];

    setTimeout(() => {
      setSecurityAlerts(mockSecurityAlerts);
      setFailedLogins(mockFailedLogins);
      setSuspiciousActivities(mockSuspiciousActivities);
      setIsLoading(false);
    }, 1000);
  }, []);

  const securityTabs = [
    {
      id: "alerts",
      name: "Security Alerts",
      icon: FaExclamationTriangle,
      count: securityAlerts.filter((a) => a.status === "active").length,
    },
    {
      id: "failed_logins",
      name: "Failed Logins",
      icon: FaBan,
      count: failedLogins.filter((f) => f.status === "blocked").length,
    },
    {
      id: "suspicious",
      name: "Suspicious Activity",
      icon: FaFlag,
      count: suspiciousActivities.filter((s) => s.status === "investigating")
        .length,
    },
    {
      id: "audit",
      name: "Audit Logs",
      icon: FaClock,
      count: 0,
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "investigating":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "blocked":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const handleAlertAction = (alertId, action) => {
    console.log(`Performing action "${action}" on alert ${alertId}`);

    switch (action) {
      case "resolve":
        setSecurityAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, status: "resolved" } : alert
          )
        );
        break;
      case "investigate":
        setSecurityAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, status: "investigating" } : alert
          )
        );
        break;
      case "dismiss":
        setSecurityAlerts((prev) =>
          prev.filter((alert) => alert.id !== alertId)
        );
        break;
    }
  };

  const renderSecurityAlerts = () => {
    const filteredAlerts = securityAlerts.filter((alert) => {
      const matchesSearch =
        !searchTerm ||
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.userName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity =
        filterSeverity === "all" || alert.severity === filterSeverity;

      return matchesSearch && matchesSeverity;
    });

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-3 min-h-[44px] bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white/5 rounded-lg p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs border ${getSeverityColor(
                          alert.severity
                        )}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs border ${getStatusColor(
                          alert.status
                        )}`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs sm:text-sm">
                      {alert.timestamp}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                    {alert.title}
                  </h3>

                  <p className="text-gray-300 mb-4 text-sm sm:text-base">
                    {alert.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    {alert.userName && (
                      <div className="flex items-center space-x-2">
                        <FaUser className="text-blue-400 flex-shrink-0" />
                        <span className="text-white truncate">
                          {alert.userName}
                        </span>
                      </div>
                    )}

                    {alert.ipAddress && (
                      <div className="flex items-center space-x-2">
                        <FaGlobe className="text-green-400 flex-shrink-0" />
                        <span className="text-white truncate">
                          {alert.ipAddress}
                        </span>
                      </div>
                    )}

                    {alert.location && (
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-purple-400 flex-shrink-0" />
                        <span className="text-white truncate">
                          {alert.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start space-x-2 sm:ml-4">
                  <button
                    onClick={() => handleAlertAction(alert.id, "investigate")}
                    className="p-2 min-w-[36px] min-h-[36px] text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded transition-all">
                    <FaEye className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleAlertAction(alert.id, "resolve")}
                    className="p-2 min-w-[36px] min-h-[36px] text-green-400 hover:text-green-300 hover:bg-white/10 rounded transition-all">
                    <FaCheck className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleAlertAction(alert.id, "dismiss")}
                    className="p-2 min-w-[36px] min-h-[36px] text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all">
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFailedLogins = () => {
    return (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-white font-semibold">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-white font-semibold">
                  IP Address
                </th>
                <th className="px-6 py-4 text-left text-white font-semibold">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-white font-semibold">
                  Attempts
                </th>
                <th className="px-6 py-4 text-left text-white font-semibold">
                  Last Attempt
                </th>
                <th className="px-6 py-4 text-left text-white font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-white font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {failedLogins.map((login) => (
                <tr
                  key={login.id}
                  className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">
                      {login.username}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-mono">
                      {login.ipAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">{login.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white font-bold">{login.attempts}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">{login.lastAttempt}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                        login.status
                      )}`}>
                      {login.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded transition-all cursor-pointer">
                        <FaEye />
                      </button>
                      <button className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all cursor-pointer">
                        <FaBan />
                      </button>
                      <button className="p-2 text-green-400 hover:text-green-300 hover:bg-white/10 rounded transition-all cursor-pointer">
                        <FaUnlock />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSuspiciousActivity = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {suspiciousActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${
                        activity.riskScore > 80
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : activity.riskScore > 60
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            : "bg-green-500/20 text-green-300 border-green-500/30"
                      }`}>
                      RISK: {activity.riskScore}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(
                        activity.status
                      )}`}>
                      {activity.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {activity.timestamp}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {activity.description}
                  </h3>

                  <p className="text-gray-300 mb-4">{activity.details}</p>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-blue-400" />
                      <span className="text-white">{activity.userName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">
                        {activity.type.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded transition-all cursor-pointer">
                    <FaEye />
                  </button>
                  <button className="p-2 text-green-400 hover:text-green-300 hover:bg-white/10 rounded transition-all cursor-pointer">
                    <FaCheck />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded transition-all cursor-pointer">
                    <FaFlag />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAuditLogs = () => {
    return (
      <div className="text-center py-12">
        <FaClock className="mx-auto text-4xl text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Audit Logs</h3>
        <p className="text-gray-300">
          Detailed audit logs and system access history
        </p>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all cursor-pointer">
          View Full Audit Trail
        </button>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "alerts":
        return renderSecurityAlerts();
      case "failed_logins":
        return renderFailedLogins();
      case "suspicious":
        return renderSuspiciousActivity();
      case "audit":
        return renderAuditLogs();
      default:
        return renderSecurityAlerts();
    }
  };

  const securityStats = {
    totalAlerts: securityAlerts.length,
    activeAlerts: securityAlerts.filter((a) => a.status === "active").length,
    criticalAlerts: securityAlerts.filter((a) => a.severity === "critical")
      .length,
    failedLoginsToday: failedLogins.length,
    blockedIPs: failedLogins.filter((f) => f.status === "blocked").length,
    suspiciousActivities: suspiciousActivities.filter(
      (s) => s.status === "investigating"
    ).length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Security Center
          </h2>
          <p className="text-blue-200 text-sm sm:text-base">
            Monitor and manage security threats
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 min-h-[44px] rounded-lg hover:bg-red-700 transition-all cursor-pointer">
            <FaExclamationTriangle />
            <span>Emergency Lock</span>
          </button>
        </div>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {securityStats.totalAlerts}
              </div>
              <div className="text-gray-400 text-sm">Total Alerts</div>
            </div>
            <FaExclamationTriangle className="text-2xl text-yellow-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {securityStats.activeAlerts}
              </div>
              <div className="text-gray-400 text-sm">Active</div>
            </div>
            <MdError className="text-2xl text-red-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {securityStats.criticalAlerts}
              </div>
              <div className="text-gray-400 text-sm">Critical</div>
            </div>
            <MdWarning className="text-2xl text-orange-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {securityStats.failedLoginsToday}
              </div>
              <div className="text-gray-400 text-sm">Failed Logins</div>
            </div>
            <FaBan className="text-2xl text-purple-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {securityStats.blockedIPs}
              </div>
              <div className="text-gray-400 text-sm">Blocked IPs</div>
            </div>
            <MdBlock className="text-2xl text-gray-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">
                {securityStats.suspiciousActivities}
              </div>
              <div className="text-gray-400 text-sm">Investigating</div>
            </div>
            <FaFlag className="text-2xl text-blue-400" />
          </div>
        </div>
      </div>

      {/* Security Tabs */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {/* Mobile Dropdown */}
        <div className="lg:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full bg-transparent text-white border-none outline-none p-4 text-sm font-medium appearance-none cursor-pointer">
            {securityTabs.map((tab) => (
              <option
                key={tab.id}
                value={tab.id}
                className="bg-gray-800 text-white">
                {tab.name} {tab.count > 0 && `(${tab.count})`}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Horizontal Tabs */}
        <div className="hidden lg:flex overflow-x-auto">
          {securityTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:text-white hover:bg-white/10"
              }`}>
              <tab.icon className="text-lg" />
              <span>{tab.name}</span>
              {tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Security Content */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-white">Loading security data...</div>
          </div>
        ) : (
          renderActiveTab()
        )}
      </div>
    </div>
  );
};

export default SecurityCenter;
