import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Filter, Download, Search, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import proctoringService from '../../services/proctoring.service';
import ProctoringReport from '../../components/tutor/ProctoringReport';
import { useDarkMode } from '../../contexts/DarkModeContext';

const ProctoringDashboard = () => {
  const { isDarkMode } = useDarkMode();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [filters, setFilters] = useState({ risk_level: '', test_id: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    const data = await proctoringService.getCenterReports(filters);
    if (data.success) {
      setReports(data.reports);
    }
    setLoading(false);
  };

  const getRiskBadge = (level) => {
    const badges = {
      LOW: { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', label: 'Low' },
      MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400', label: 'Medium' },
      HIGH: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400', label: 'High' },
      CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', label: 'Critical' }
    };
    const badge = badges[level] || badges.LOW;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const filteredReports = reports.filter(r =>
    r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.test_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group reports by test
  const groupedByTest = filteredReports.reduce((acc, report) => {
    const testId = report.test_id;
    if (!acc[testId]) {
      acc[testId] = {
        test_id: testId,
        test_title: report.test_title,
        sessions: []
      };
    }
    acc[testId].sessions.push(report);
    return acc;
  }, {});

  const testGroups = Object.values(groupedByTest);

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.risk_level === 'CRITICAL').length,
    high: reports.filter(r => r.risk_level === 'HIGH').length,
    medium: reports.filter(r => r.risk_level === 'MEDIUM').length,
    low: reports.filter(r => r.risk_level === 'LOW').length
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} className="text-green-600" />
            <h1 className="text-3xl font-bold">Proctoring Dashboard</h1>
          </div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor student exam integrity and suspicious activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <p className="text-sm opacity-75 mb-1">Total Sessions</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-sm opacity-75 mb-1">Critical</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
          </div>
          <div className="p-4 rounded-xl border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <p className="text-sm opacity-75 mb-1">High</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.high}</p>
          </div>
          <div className="p-4 rounded-xl border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <p className="text-sm opacity-75 mb-1">Medium</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.medium}</p>
          </div>
          <div className="p-4 rounded-xl border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <p className="text-sm opacity-75 mb-1">Low</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.low}</p>
          </div>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-xl border mb-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  placeholder="Search students or tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>
            </div>
            <select
              value={filters.risk_level}
              onChange={(e) => setFilters({ ...filters, risk_level: e.target.value })}
              className={`px-4 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <option value="">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Reports Grouped by Test */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
          </div>
        ) : testGroups.length === 0 ? (
          <div className={`p-12 text-center rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <Shield size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No proctoring data found</p>
            <p className="text-sm opacity-75">Reports will appear here once students complete tests</p>
          </div>
        ) : (
          <div className="space-y-6">
            {testGroups.map((group) => (
              <div key={group.test_id} className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                {/* Test Header */}
                <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{group.test_title}</h3>
                      <p className="text-sm opacity-75 mt-1">{group.sessions.length} student{group.sessions.length !== 1 ? 's' : ''} monitored</p>
                    </div>
                    <div className="flex gap-2">
                      {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
                        const count = group.sessions.filter(s => s.risk_level === level).length;
                        if (count === 0) return null;
                        return (
                          <div key={level} className="text-center">
                            {getRiskBadge(level)}
                            <p className="text-xs mt-1 opacity-75">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Risk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Violations</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {group.sessions.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{report.student_name}</p>
                              <p className="text-xs opacity-75">{report.student_email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRiskBadge(report.risk_level)}
                            <p className="text-xs mt-1 opacity-75">{report.risk_score}/100</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-bold ${report.test_passed ? 'text-green-600' : 'text-red-600'}`}>
                              {report.test_score}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p>Tab: {report.tab_switches}</p>
                              <p>Copy: {report.copy_attempts}</p>
                              <p>Focus: {report.focus_losses}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(report.session_start).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedAttempt(report.attempt_id)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Eye size={16} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {selectedAttempt && (
        <ProctoringReport
          attemptId={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default ProctoringDashboard;
