import React, { useState } from "react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Megaphone,
  BookOpen,
  BrainCircuit,
  Trophy,
  Activity,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "../../config/supabase";

import UploadTextbook from "./UploadTextbook";
import AIQuestions from "./AIQuestions";
import AdminLeaderboard from "./AdminLeaderboard";

const AdminSettings = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState("broadcast");

  // Broadcast State
  const [loading, setLoading] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
    type: "announcement",
    priority: "normal",
    targetAudience: "all",
  });

  const handleBroadcastNotification = async () => {
    if (!broadcastData.title || !broadcastData.message) {
      return toast.error("Title and message are required");
    }

    setLoading(true);
    const loadingToast = toast.loading("Sending notification...");
    try {
      const { data, error } = await supabase.rpc(
        "admin_broadcast_notification",
        {
          notification_title: broadcastData.title,
          notification_message: broadcastData.message,
          notification_type: broadcastData.type,
          notification_priority: broadcastData.priority,
          target_audience: broadcastData.targetAudience,
        },
      );

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || "Failed to send notification");
      }

      toast.dismiss(loadingToast);
      toast.success(data.message || "Notification sent successfully");
      setBroadcastData({
        title: "",
        message: "",
        type: "announcement",
        priority: "normal",
        targetAudience: "all",
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "broadcast", label: "Broadcasts", icon: Megaphone },
    { id: "textbooks", label: "Textbooks", icon: BookOpen },
    { id: "ai-questions", label: "AI Questions", icon: BrainCircuit },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  return (
    <div
      className={`p-6 md:p-8 min-h-[calc(100vh-4rem)] ${isDarkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Settings & Tools
          </h1>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            Configure system broadcasts, upload resources, and manage AI
            settings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className={`flex flex-wrap gap-2 p-1 rounded-xl w-full sm:w-fit mb-8 ${isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-gray-100/80"}`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 flex-grow sm:flex-grow-0 justify-center w-full sm:w-auto ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : isDarkMode
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in duration-500">
        {activeTab === "broadcast" && (
          <div className="max-w-3xl">
            <Card
              className={`rounded-lg shadow-sm ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
            >
              <CardHeader
                className={`${isDarkMode ? "border-b border-zinc-800" : "border-b border-gray-100"}`}
              >
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-500" />
                  Broadcast Notification
                </CardTitle>
                <CardDescription
                  className={isDarkMode ? "text-zinc-400" : "text-gray-500"}
                >
                  Send alerts, warnings, and announcements to all users or
                  specific roles.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
                    >
                      Title
                    </label>
                    <Input
                      placeholder="e.g., Scheduled Maintenance Tomorrow"
                      value={broadcastData.title}
                      onChange={(e) =>
                        setBroadcastData({
                          ...broadcastData,
                          title: e.target.value,
                        })
                      }
                      className={`h-10 rounded-xl ${isDarkMode ? "bg-zinc-950 border-zinc-700 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-600"}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className={`text-sm font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
                    >
                      Message
                    </label>
                    <textarea
                      placeholder="Enter the full notification message here..."
                      value={broadcastData.message}
                      onChange={(e) =>
                        setBroadcastData({
                          ...broadcastData,
                          message: e.target.value,
                        })
                      }
                      rows={5}
                      className={`flex w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                        isDarkMode
                          ? "bg-zinc-950 border-zinc-700 focus:ring-blue-500 focus:ring-offset-zinc-900 text-white placeholder-zinc-500"
                          : "bg-gray-50 border-gray-200 focus:ring-blue-600 focus:ring-offset-white text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label
                        className={`text-sm font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
                      >
                        Target Audience
                      </label>
                      <select
                        value={broadcastData.targetAudience}
                        onChange={(e) =>
                          setBroadcastData({
                            ...broadcastData,
                            targetAudience: e.target.value,
                          })
                        }
                        className={`flex h-10 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                          isDarkMode
                            ? "bg-zinc-950 border-zinc-700 focus:ring-blue-500 focus:ring-offset-zinc-900 text-white"
                            : "bg-gray-50 border-gray-200 focus:ring-blue-600 focus:ring-offset-white text-gray-900"
                        }`}
                      >
                        <option value="all">Every User on Platform</option>
                        <option value="students">Students Only</option>
                        <option value="tutors">Tutors Only</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        className={`text-sm font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
                      >
                        Notification Type
                      </label>
                      <select
                        value={broadcastData.type}
                        onChange={(e) =>
                          setBroadcastData({
                            ...broadcastData,
                            type: e.target.value,
                          })
                        }
                        className={`flex h-10 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                          isDarkMode
                            ? "bg-zinc-950 border-zinc-700 focus:ring-blue-500 focus:ring-offset-zinc-900 text-white"
                            : "bg-gray-50 border-gray-200 focus:ring-blue-600 focus:ring-offset-white text-gray-900"
                        }`}
                      >
                        <option value="announcement">
                          Announcement (Blue)
                        </option>
                        <option value="info">Information (Blue)</option>
                        <option value="success">Success (Green)</option>
                        <option value="warning">Warning (Yellow)</option>
                        <option value="error">Error (Red)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        className={`text-sm font-medium ${isDarkMode ? "text-zinc-300" : "text-gray-700"}`}
                      >
                        Delivery Priority
                      </label>
                      <select
                        value={broadcastData.priority}
                        onChange={(e) =>
                          setBroadcastData({
                            ...broadcastData,
                            priority: e.target.value,
                          })
                        }
                        className={`flex h-10 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                          isDarkMode
                            ? "bg-zinc-950 border-zinc-700 focus:ring-blue-500 focus:ring-offset-zinc-900 text-white"
                            : "bg-gray-50 border-gray-200 focus:ring-blue-600 focus:ring-offset-white text-gray-900"
                        }`}
                      >
                        <option value="normal">Normal</option>
                        <option value="low">Low Background</option>
                        <option value="high">High Visibility</option>
                        <option value="urgent">Urgent Interrupt</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                  <Button
                    onClick={handleBroadcastNotification}
                    disabled={
                      loading || !broadcastData.title || !broadcastData.message
                    }
                    className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center gap-2 w-full sm:w-auto"
                  >
                    {loading ? (
                      <Activity className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    Send Broadcast Array
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Existing components will render their own legacy styles for now.
            We just wrap them in the new tab layout view. */}
        {activeTab === "textbooks" && (
          <div className="animate-in fade-in duration-500">
            <UploadTextbook />
          </div>
        )}

        {activeTab === "ai-questions" && (
          <div className="animate-in fade-in duration-500">
            <AIQuestions />
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="animate-in fade-in duration-500">
            <AdminLeaderboard />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
