import React, { useState, useEffect, useCallback } from "react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Users,
  FileText,
  Activity,
  Search,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  Building2,
  ServerCrash,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import TutorialCenterDetailModal from "../../components/admin/TutorialCenterDetailModal";
import { supabase } from "../../config/supabase";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const StatCard = ({ title, value, icon: Icon, isDarkMode, color = "blue" }) => (
  <Card
    className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"} transition-all rounded-lg shadow-sm`}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            {title}
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </h3>
        </div>
        <div
          className={`p-3 rounded-xl ${isDarkMode ? "bg-zinc-800" : `bg-${color}-50`}`}
        >
          <Icon
            className={`h-6 w-6 ${isDarkMode ? `text-${color}-400` : `text-${color}-600`}`}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminCenters = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState("active-centers");

  // Data States
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [deletedCenters, setDeletedCenters] = useState([]);

  // Interactions
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "active-centers") {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        const response = await axios.get(
          `${API_URL}/api/admin/tutorial-centers`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (response.data.success) {
          setCenters(response.data.centers);
        }
      } else if (activeTab === "deleted-centers") {
        // Load deleted centers directly via Supabase
        const { data: rawCenters, error: centersError } = await supabase
          .from("tutorial_centers")
          .select(
            "id, name, access_code, deleted_at, deleted_by, deletion_reason, tutor_id",
          )
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false });

        if (centersError) throw centersError;

        const tutorIds = [...new Set(rawCenters.map((c) => c.tutor_id))];
        const { data: tutors, error: tutorsError } = await supabase
          .from("user_profiles")
          .select("id, full_name, email")
          .in("id", tutorIds);

        if (tutorsError) throw tutorsError;

        const centersWithTutors = rawCenters.map((center) => ({
          ...center,
          tutor: tutors.find((t) => t.id === center.tutor_id),
        }));

        setDeletedCenters(centersWithTutors);
      }
    } catch (error) {
      console.error("Data load error:", error);
      toast.error("Failed to load centers data");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Center Operations
  const handleViewDetails = async (center) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/admin/tutorial-centers/${center.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.success) {
        setSelectedCenter({ ...center, ...response.data });
        setShowDetailModal(true);
      }
    } catch (error) {
      toast.error("Failed to load center details");
    }
  };

  const handleSuspend = async (centerId) => {
    if (!window.confirm("Are you sure you want to suspend this center?"))
      return;
    const reason = window.prompt("Reason for suspension:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/admin/tutorial-centers/${centerId}/suspend`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Center suspended successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to suspend center");
    }
  };

  const handleActivate = async (centerId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/admin/tutorial-centers/${centerId}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Center activated successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to activate center");
    }
  };

  const handleDelete = async (centerId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this center? This action cannot be undone.",
      )
    )
      return;
    const reason = window.prompt("Reason for deletion:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/admin/tutorial-centers/${centerId}`, {
        data: { reason },
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Center deleted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete center");
    }
  };

  // Processing Active Centers data
  const filteredActiveCenters = centers.filter((center) => {
    const matchesSearch =
      center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.tutor?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      center.tutor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.access_code?.toLowerCase().includes(searchTerm.toLowerCase());

    // In "active-centers" tab we mostly care about non-deleted
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" &&
        !center.deleted_at &&
        !center.is_suspended) ||
      (filterStatus === "suspended" && center.is_suspended) ||
      (filterStatus === "deleted" && center.deleted_at);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: centers.length,
    active: centers.filter((c) => !c.deleted_at && !c.is_suspended).length,
    suspended: centers.filter((c) => c.is_suspended).length,
    totalStudents: centers.reduce(
      (sum, c) => sum + (c.stats?.students || 0),
      0,
    ),
    totalTests: centers.reduce((sum, c) => sum + (c.stats?.tests || 0), 0),
  };

  return (
    <div
      className={`p-6 md:p-8 min-h-[calc(100vh-4rem)] ${isDarkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tutorial Centers
          </h1>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            Manage registered tuition centers and enrollment access codes.
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          variant="outline"
          className={`flex items-center gap-2 ${isDarkMode ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800" : ""}`}
        >
          <Activity
            size={16}
            className={
              loading && activeTab === "active-centers" ? "animate-spin" : ""
            }
          />
          Refresh
        </Button>
      </div>

      <div
        className={`flex gap-2 p-1 rounded-xl w-fit mb-6 ${isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-gray-100/80"}`}
      >
        <button
          onClick={() => {
            setActiveTab("active-centers");
            setSearchTerm("");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "active-centers"
              ? "bg-blue-600 text-white shadow-md"
              : isDarkMode
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Building2 className="h-4 w-4" /> Active Centers
        </button>
        <button
          onClick={() => {
            setActiveTab("deleted-centers");
            setSearchTerm("");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "deleted-centers"
              ? "bg-blue-600 text-white shadow-md"
              : isDarkMode
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <ServerCrash className="h-4 w-4" /> Deleted Centers
        </button>
      </div>

      {activeTab === "active-centers" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Centers"
              value={stats.total}
              icon={Building2}
              isDarkMode={isDarkMode}
              color="blue"
            />
            <StatCard
              title="Active Centers"
              value={stats.active}
              icon={CheckCircle}
              isDarkMode={isDarkMode}
              color="green"
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={Users}
              isDarkMode={isDarkMode}
              color="purple"
            />
            <StatCard
              title="Total Tests"
              value={stats.totalTests}
              icon={FileText}
              isDarkMode={isDarkMode}
              color="orange"
            />
          </div>

          <Card
            className={`rounded-lg shadow-sm ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search by name, tutor, email, or access code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 h-10 rounded-xl ${isDarkMode ? "bg-zinc-950 border-zinc-700 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-600"}`}
                  />
                </div>
                <div className="flex gap-2 p-1 rounded-xl bg-gray-100 dark:bg-zinc-950">
                  {["all", "active", "suspended", "deleted"].map((status) => (
                    <Button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      variant={filterStatus === status ? "default" : "ghost"}
                      className={`h-8 rounded-lg ${filterStatus === status ? "shadow-sm" : ""} ${filterStatus === status && isDarkMode ? "bg-zinc-800 text-white" : ""}`}
                      size="sm"
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div
                className={`overflow-x-auto rounded-xl border ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
              >
                <table className="w-full text-sm">
                  <thead
                    className={isDarkMode ? "bg-zinc-950/50" : "bg-gray-50"}
                  >
                    <tr>
                      <th className="p-4 text-left font-semibold">
                        Center Name
                      </th>
                      <th className="p-4 text-left font-semibold">Tutor</th>
                      <th className="p-4 text-left font-semibold">
                        Access Code
                      </th>
                      <th className="p-4 text-center font-semibold">
                        Students
                      </th>
                      <th className="p-4 text-center font-semibold">Tests</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {filteredActiveCenters.map((center) => (
                      <tr
                        key={center.id}
                        className={`transition-colors ${isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"}`}
                      >
                        <td className="p-4">
                          <div className="font-bold flex items-center gap-2">
                            {center.name}
                          </div>
                          <div
                            className={`text-xs mt-1 ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}
                          >
                            Created{" "}
                            {new Date(center.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div
                            className={`font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-800"}`}
                          >
                            {center.tutor?.full_name || "Unknown"}
                          </div>
                          <div
                            className={`text-xs mt-1 ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}
                          >
                            {center.tutor?.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <code
                            className={`px-2 py-1 rounded text-xs font-mono font-bold ${isDarkMode ? "bg-zinc-800 text-zinc-300" : "bg-gray-100 text-gray-800"}`}
                          >
                            {center.access_code}
                          </code>
                        </td>
                        <td className="p-4 text-center font-medium font-mono">
                          {center.stats?.students || 0}
                        </td>
                        <td className="p-4 text-center font-medium font-mono">
                          {center.stats?.tests || 0}
                        </td>
                        <td className="p-4">
                          {center.deleted_at ? (
                            <Badge
                              variant="destructive"
                              className="border-none bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            >
                              Deleted
                            </Badge>
                          ) : center.is_suspended ? (
                            <Badge
                              variant="secondary"
                              className="border-none bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            >
                              Suspended
                            </Badge>
                          ) : (
                            <Badge
                              variant="default"
                              className="border-none bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100"
                            >
                              Active
                            </Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => handleViewDetails(center)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!center.deleted_at && (
                              <>
                                {center.is_suspended ? (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => handleActivate(center.id)}
                                    title="Activate"
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => handleSuspend(center.id)}
                                    title="Suspend"
                                  >
                                    <Ban className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                                  </Button>
                                )}
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-lg"
                                  onClick={() => handleDelete(center.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredActiveCenters.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-12 text-center text-zinc-500"
                        >
                          No centers found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "deleted-centers" && (
        <Card
          className={`rounded-lg shadow-sm animate-in fade-in duration-500 ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
        >
          <CardContent className="p-6">
            <h3
              className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
            >
              <ServerCrash className="h-5 w-5 text-red-500" />
              Audit Trail
            </h3>

            {loading ? (
              <div className="flex justify-center p-8">
                <Activity className="animate-spin text-blue-500" />
              </div>
            ) : deletedCenters.length === 0 ? (
              <div className="text-center p-12 text-zinc-500">
                No deleted centers found in the audit logs.
              </div>
            ) : (
              <div
                className={`overflow-x-auto rounded-xl border ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
              >
                <table className="w-full text-sm">
                  <thead
                    className={isDarkMode ? "bg-zinc-950/50" : "bg-gray-50"}
                  >
                    <tr>
                      <th className="p-4 text-left font-semibold">
                        Center Name
                      </th>
                      <th className="p-4 text-left font-semibold">
                        Access Code
                      </th>
                      <th className="p-4 text-left font-semibold">
                        Tutor Owner
                      </th>
                      <th className="p-4 text-left font-semibold">
                        Deleted At
                      </th>
                      <th className="p-4 text-left font-semibold">
                        Reason for Deletion
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {deletedCenters.map((center) => (
                      <tr
                        key={center.id}
                        className={`transition-colors ${isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"}`}
                      >
                        <td className="p-4 font-bold">{center.name}</td>
                        <td className="p-4">
                          <code className="font-mono text-zinc-500">
                            {center.access_code}
                          </code>
                        </td>
                        <td className="p-4">
                          <div
                            className={`font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-800"}`}
                          >
                            {center.tutor?.full_name || "Unknown"}
                          </div>
                          <div
                            className={`text-xs mt-1 ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}
                          >
                            {center.tutor?.email}
                          </div>
                        </td>
                        <td
                          className={`p-4 text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(center.deleted_at).toLocaleString()}
                          </div>
                        </td>
                        <td
                          className="p-4 text-sm max-w-[200px] truncate"
                          title={center.deletion_reason || "No reason provided"}
                        >
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              center.deletion_reason
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {center.deletion_reason || "No reason provided"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCenter && (
        <TutorialCenterDetailModal
          center={selectedCenter}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCenter(null);
          }}
          onRefresh={loadData}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default AdminCenters;
