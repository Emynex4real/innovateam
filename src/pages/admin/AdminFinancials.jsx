import React, { useState, useEffect, useCallback } from "react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CreditCard,
  BanknotesIcon,
  Activity,
} from "lucide-react";
import directSupabaseService from "../../services/directSupabase.service";
import { toast } from "react-toastify";
import { supabase } from "../../config/supabase";

const AdminFinancials = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("transactions");

  // Data
  const [transactions, setTransactions] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "transactions") {
        const result = await directSupabaseService.getAllTransactions(
          currentPage,
          itemsPerPage,
          searchTerm,
        );
        if (result.success) {
          setTransactions(result.transactions);
          setTotalItems(result.totalCount || 0);
        } else {
          toast.error("Failed to load transactions");
        }
      } else if (activeTab === "credit-requests") {
        const result = await directSupabaseService.getCreditRequests();
        if (result.success) {
          setCreditRequests(result.requests);
        }
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreditRequest = async (requestId, action, userId, amount) => {
    const loadingToast = toast.loading("Processing request...");
    try {
      if (action === "approve") {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("wallet_balance")
          .eq("id", userId)
          .single();

        await supabase
          .from("user_profiles")
          .update({ wallet_balance: (profile.wallet_balance || 0) + amount })
          .eq("id", userId);

        await supabase.from("transactions").insert({
          user_id: userId,
          amount,
          type: "credit",
          status: "successful",
          description: "Credit Request Approved",
        });
      }

      await supabase
        .from("credit_requests")
        .update({ status: action === "approve" ? "approved" : "rejected" })
        .eq("id", requestId);

      toast.dismiss(loadingToast);
      toast.success(`Request ${action}d`);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Action failed");
    }
  };

  const renderPagination = () => {
    if (activeTab === "credit-requests") return null; // credit requests isn't paginated here yet
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
          <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            Monitor transactions, revenue, and handle credit requests.
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          variant="outline"
          className={`flex items-center gap-2 ${isDarkMode ? "border-zinc-700 bg-zinc-900 hover:bg-zinc-800" : ""}`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div
        className={`flex gap-2 p-1 rounded-xl w-fit mb-6 ${isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-gray-100/80"}`}
      >
        <button
          onClick={() => {
            setActiveTab("transactions");
            setCurrentPage(1);
            setSearchTerm("");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "transactions"
              ? "bg-blue-600 text-white shadow-md"
              : isDarkMode
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <CreditCard className="h-4 w-4" /> Transactions
        </button>
        <button
          onClick={() => {
            setActiveTab("credit-requests");
            setCurrentPage(1);
            setSearchTerm("");
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "credit-requests"
              ? "bg-blue-600 text-white shadow-md"
              : isDarkMode
                ? "text-zinc-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Activity className="h-4 w-4" /> Credit Requests
        </button>
      </div>

      <Card
        className={`rounded-lg shadow-sm ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
      >
        <CardContent className="p-6">
          {activeTab === "transactions" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                <div className="relative w-full sm:w-1/3">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search transactions..."
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
                  <thead
                    className={isDarkMode ? "bg-zinc-950/50" : "bg-gray-50"}
                  >
                    <tr>
                      <th className="p-4 text-left font-semibold">
                        Transaction ID
                      </th>
                      <th className="p-4 text-left font-semibold">User</th>
                      <th className="p-4 text-left font-semibold">Amount</th>
                      <th className="p-4 text-left font-semibold">Type</th>
                      <th className="p-4 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className={`transition-colors ${isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"}`}
                      >
                        <td className="p-4 font-mono text-xs text-zinc-500">
                          {tx.id.substring(0, 8)}...
                        </td>
                        <td className="p-4 font-medium">{tx.userName}</td>
                        <td
                          className={`p-4 font-mono font-bold ${tx.type === "credit" ? "text-green-500" : "text-red-500"}`}
                        >
                          {tx.type === "credit" ? "+" : "-"}₦{tx.amount}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={
                              tx.type === "credit"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-none"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-none"
                            }
                          >
                            {tx.type}
                          </Badge>
                        </td>
                        <td
                          className={`p-4 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
                        >
                          {new Date(tx.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-8 text-center text-zinc-500"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "credit-requests" && (
            <div
              className={`overflow-x-auto rounded-xl border ${isDarkMode ? "border-zinc-800" : "border-gray-200"}`}
            >
              <table className="w-full text-sm">
                <thead className={isDarkMode ? "bg-zinc-950/50" : "bg-gray-50"}>
                  <tr>
                    <th className="p-4 text-left font-semibold">User</th>
                    <th className="p-4 text-left font-semibold">Amount</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {creditRequests.map((req) => (
                    <tr
                      key={req.id}
                      className={`transition-colors ${isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"}`}
                    >
                      <td className="p-4 font-medium">
                        {req.user_profiles?.full_name || "Unknown User"}
                      </td>
                      <td className="p-4 font-mono font-bold text-green-500">
                        ₦{req.amount}
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`${
                            req.status === "pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100"
                              : req.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100"
                          } border-none pointer-events-none`}
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {req.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4"
                              onClick={() =>
                                handleCreditRequest(
                                  req.id,
                                  "approve",
                                  req.user_id,
                                  req.amount,
                                )
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-lg px-4"
                              onClick={() =>
                                handleCreditRequest(req.id, "reject")
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={`text-xs ${isDarkMode ? "text-zinc-500" : "text-gray-400"}`}
                          >
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {creditRequests.length === 0 && !loading && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-zinc-500">
                        No credit requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {renderPagination()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinancials;
