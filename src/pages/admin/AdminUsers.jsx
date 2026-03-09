import React, { useState, useEffect, useCallback } from "react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Eye,
  RefreshCw,
} from "lucide-react";
import directSupabaseService from "../../services/directSupabase.service";
import UserDetailModal from "../../components/UserDetailModal";
import { toast } from "react-toastify";
import { supabase } from "../../config/supabase";

const AdminUsers = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // Modals & Actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [walletModalUser, setWalletModalUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletType, setWalletType] = useState("credit");
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await directSupabaseService.getAllUsers(
        currentPage,
        itemsPerPage,
        searchTerm,
      );
      if (result.success) {
        setUsers(result.users);
        setTotalItems(result.totalCount || 0);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleWalletUpdate = async () => {
    if (!walletModalUser || !walletAmount) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");

    const loadingToast = toast.loading("Updating wallet...");
    try {
      const { data, error } = await supabase.rpc("admin_adjust_wallet", {
        target_user_id: walletModalUser.id,
        adjustment_amount: amount,
        adjustment_type: walletType,
        admin_notes: `Admin ${walletType} - Manual adjustment`,
      });

      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to update wallet");

      toast.dismiss(loadingToast);
      toast.success(`Wallet ${walletType}ed successfully`);
      setWalletModalUser(null);
      setWalletAmount("");
      loadUsers();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  };

  const handleRoleUpdate = async () => {
    if (!roleModalUser || !newRole) return toast.error("Please select a role");

    const loadingToast = toast.loading("Updating role...");
    try {
      const { data, error } = await supabase.rpc("admin_update_user_role", {
        target_user_id: roleModalUser.id,
        new_role: newRole,
        reason: `Role changed to ${newRole} by admin`,
      });

      if (error) throw error;
      if (data && !data.success)
        throw new Error(data.error || "Failed to update role");

      toast.dismiss(loadingToast);
      toast.success(data.message || "Role updated successfully");
      setRoleModalUser(null);
      setNewRole("");
      loadUsers();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return (
      <div className="flex items-center justify-between mt-6">
        <p
          className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}
        >
          Page <span className="font-medium text-blue-500">{currentPage}</span>{" "}
          of {totalPages || 1} (Total: {totalItems})
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={isDarkMode ? "border-zinc-700 hover:bg-zinc-800" : ""}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || totalPages === 0}
            className={isDarkMode ? "border-zinc-700 hover:bg-zinc-800" : ""}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-6 md:p-8 min-h-[calc(100vh-4rem)] ${isDarkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            Manage students, tutors, and admin accounts.
          </p>
        </div>
        <Button
          onClick={loadUsers}
          disabled={loading}
          variant="outline"
          className={`flex items-center gap-2 ${isDarkMode ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800" : ""}`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <Card
        className={`rounded-lg shadow-sm ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
            <div className="relative w-full sm:w-1/3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={`pl-10 rounded-xl h-10 ${isDarkMode ? "bg-zinc-950 border-zinc-700 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-600"}`}
              />
            </div>
            <Button
              variant="outline"
              className={`h-10 rounded-xl ${isDarkMode ? "border-zinc-700 hover:bg-zinc-800" : ""}`}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>

          <div
            className={`overflow-x-auto rounded-xl border ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
          >
            <table className="w-full text-sm">
              <thead className={isDarkMode ? "bg-zinc-950/50" : "bg-gray-50"}>
                <tr>
                  <th className="p-4 text-left font-semibold">User</th>
                  <th className="p-4 text-left font-semibold">Phone</th>
                  <th className="p-4 text-left font-semibold">Role</th>
                  <th className="p-4 text-left font-semibold">Balance</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors ${isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"}`}
                  >
                    <td className="p-4">
                      <div className="font-bold flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDarkMode ? "bg-zinc-800 text-white" : "bg-blue-100 text-blue-700"}`}
                        >
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        {user.name}
                      </div>
                      <div
                        className={`text-xs mt-1 ml-10 ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}
                      >
                        {user.email}
                      </div>
                    </td>
                    <td
                      className={`p-4 text-sm ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
                    >
                      {user.phone || "N/A"}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono font-medium text-green-600 dark:text-green-400">
                      ₦{user.walletBalance}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none"
                            : ""
                        }
                      >
                        {user.status || "Active"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserModalOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-lg"
                          onClick={() => setWalletModalUser(user)}
                          title="Manage Wallet"
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                        {user.email !== "emynex4real@gmail.com" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => {
                              setRoleModalUser(user);
                              setNewRole(user.role);
                            }}
                            title="Change Role"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-zinc-500">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </CardContent>
      </Card>

      {/* MODALS */}
      {/* Wallet Modal */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`rounded-xl p-6 max-w-md w-full shadow-lg ${isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}
          >
            <h3 className="text-xl font-bold mb-4">Manage Wallet</h3>
            <div
              className={`p-4 rounded-xl mb-6 ${isDarkMode ? "bg-zinc-950" : "bg-gray-50"}`}
            >
              <p
                className={`text-sm mb-1 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
              >
                {walletModalUser.name}
              </p>
              <p className="text-sm">
                Current Balance:{" "}
                <span className="text-green-500 font-mono font-bold text-lg ml-2">
                  ₦{walletModalUser.walletBalance}
                </span>
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-zinc-950 w-full mb-4">
                <Button
                  onClick={() => setWalletType("credit")}
                  variant={walletType === "credit" ? "default" : "ghost"}
                  className={`flex-1 ${walletType === "credit" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                >
                  Credit
                </Button>
                <Button
                  onClick={() => setWalletType("debit")}
                  variant={walletType === "debit" ? "default" : "ghost"}
                  className={`flex-1 ${walletType === "debit" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                >
                  Debit
                </Button>
              </div>
              <Input
                type="number"
                placeholder="Amount (₦)"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                className={`h-12 text-lg rounded-xl ${isDarkMode ? "bg-zinc-950 border-zinc-700" : "bg-gray-50"}`}
              />
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-6">
                <Button
                  onClick={() => setWalletModalUser(null)}
                  variant="outline"
                  className={`flex-1 rounded-xl h-11 ${isDarkMode ? "border-zinc-700" : ""}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleWalletUpdate}
                  className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Confirm {walletType}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`rounded-xl p-6 max-w-md w-full shadow-lg ${isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white"}`}
          >
            <h3 className="text-xl font-bold mb-4">Change Role</h3>
            <div
              className={`p-4 rounded-xl mb-6 flex justify-between items-center ${isDarkMode ? "bg-zinc-950" : "bg-gray-50"}`}
            >
              <p className="font-medium text-sm">{roleModalUser.name}</p>
              <Badge
                variant="outline"
                className={
                  isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-white"
                }
              >
                {roleModalUser.role}
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Select New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className={`flex h-12 w-full rounded-xl border px-4 py-2 text-sm focus:ring-2 focus:outline-none ${
                    isDarkMode
                      ? "bg-zinc-950 border-zinc-700 focus:ring-blue-500/50"
                      : "bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-6">
                <Button
                  onClick={() => setRoleModalUser(null)}
                  variant="outline"
                  className={`flex-1 rounded-xl h-11 ${isDarkMode ? "border-zinc-700" : ""}`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRoleUpdate}
                  className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Role
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default AdminUsers;
