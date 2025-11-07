import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaBan,
  FaCheck,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaUserPlus,
  FaKey,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { MdAccountBalance, MdSecurity } from "react-icons/md";
import { useUserData } from "../../context/UserDataContext";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getAllUsers, updateUser, deleteUser, getUserStats } = useUserData();
  const { hasPermission } = useAuth();

  // Load users from Firebase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const userData = await getAllUsers();

        // Transform Firebase user data to match expected format
        const transformedUsers = userData.map((user) => ({
          id: user.uid,
          name: user.name || "Unknown",
          email: user.email,
          phone: user.phone || "N/A",
          role: user.role || "customer",
          status: user.status || "active",
          lastLogin: user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : "Never",
          joinDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : "Unknown",
          totalBalance: user.totalBalance || 0,
          accountsCount: user.accountsCount || 0,
          riskLevel: user.riskLevel || "low",
        }));

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        showNotification("Error loading users", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [getAllUsers]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus, filterRole]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveChanges = () => {
    if (!selectedUser) return;

    // Update user in the users array
    setUsers(
      users.map((user) => (user.id === selectedUser.id ? selectedUser : user))
    );

    setEditMode(false);
    setShowUserModal(false);
    showNotification("User information updated successfully!");
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    showNotification(`User status updated to ${newStatus}`);
  };

  const handleDeleteUser = (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      setUsers(users.filter((user) => user.id !== userId));
      showNotification("User deleted successfully", "success");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUsers className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              User Management
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Manage customer accounts and permissions
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedUser({
              id: Date.now(),
              name: "",
              email: "",
              phone: "",
              role: "customer",
              status: "pending",
              lastLogin: "Never",
              joinDate: new Date().toISOString().split("T")[0],
              totalBalance: 0.0,
              accountsCount: 0,
              riskLevel: "low",
            });
            setEditMode(true);
            setShowUserModal(true);
          }}
          className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
          <FaUserPlus />
          <span>Add New User</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
          <div className="flex items-center space-x-2">
            <FaCheck className="text-sm" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 min-h-[44px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="customer">Customer</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto table-scrollbar">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                User
              </th>
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base hidden sm:table-cell">
                Contact
              </th>
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                Status
              </th>
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base hidden md:table-cell">
                Balance
              </th>
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base hidden lg:table-cell">
                Risk
              </th>
              <th className="text-left py-3 px-2 sm:px-4 font-semibold text-gray-700 text-sm sm:text-base">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 sm:py-4 px-2 sm:px-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-xs sm:text-sm">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                        {user.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 capitalize truncate">
                        {user.role}
                      </p>
                      {/* Mobile-only contact info */}
                      <div className="sm:hidden mt-1">
                        <p className="text-xs text-gray-600 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4 hidden sm:table-cell">
                  <div>
                    <p className="text-sm text-gray-800 truncate">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500">{user.phone}</p>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                      user.status
                    )}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4 hidden md:table-cell">
                  <div>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {formatCurrency(user.totalBalance)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {user.accountsCount} accounts
                    </p>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4 hidden lg:table-cell">
                  <span
                    className={`font-medium capitalize text-sm sm:text-base ${getRiskColor(
                      user.riskLevel
                    )}`}>
                    {user.riskLevel}
                  </span>
                </td>
                <td className="py-3 sm:py-4 px-2 sm:px-4">
                  <div className="flex justify-center sm:justify-start space-x-1 sm:space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setEditMode(true);
                        setShowUserModal(true);
                      }}
                      className="p-2 min-w-[36px] min-h-[36px] text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all"
                      title="Edit User">
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="p-2 min-w-[36px] min-h-[36px] text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-all"
                      title="View Details">
                      <FaEye className="text-sm" />
                    </button>
                    {user.status === "active" ? (
                      <button
                        onClick={() => handleStatusChange(user.id, "suspended")}
                        className="p-2 min-w-[36px] min-h-[36px] text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded transition-all"
                        title="Suspend User">
                        <FaBan className="text-sm" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(user.id, "active")}
                        className="p-2 min-w-[36px] min-h-[36px] text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-all"
                        title="Activate User">
                        <FaCheck className="text-sm" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 min-w-[36px] min-h-[36px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                      title="Delete User">
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                {editMode ? "Edit User" : "User Details"}
              </h3>
              <div className="flex space-x-2">
                {editMode && (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2">
                      <FaSave />
                      <span>Save Changes</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2">
                      <FaTimes />
                      <span>Cancel</span>
                    </button>
                  </>
                )}
                {!editMode && (
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Close
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={selectedUser.phone}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, phone: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50">
                  <option value="customer">Customer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, status: e.target.value })
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  value={selectedUser.riskLevel}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      riskLevel: e.target.value,
                    })
                  }
                  disabled={!editMode}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(selectedUser.totalBalance)}
                </p>
                <p className="text-sm text-gray-600">Total Balance</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-800">
                  {selectedUser.accountsCount}
                </p>
                <p className="text-sm text-gray-600">Accounts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-800">
                  {selectedUser.joinDate}
                </p>
                <p className="text-sm text-gray-600">Join Date</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-800">
                  {selectedUser.lastLogin}
                </p>
                <p className="text-sm text-gray-600">Last Login</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
