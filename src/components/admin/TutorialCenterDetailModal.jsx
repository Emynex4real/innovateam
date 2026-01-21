import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  X, Users, BookOpen, FileText, Activity, Award, Target, BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, isDarkMode, subtitle }) => (
  <Card className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <h3 className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-blue-50'}`}>
          <Icon className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TutorialCenterDetailModal = ({ center, onClose, onRefresh, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { analytics } = center;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className={`rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        
        <div className={`sticky top-0 z-10 p-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{center.name}</h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Tutor: {center.tutor?.full_name} ({center.tutor?.email})
              </p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">Code: {center.access_code}</Badge>
                <Badge variant="outline">Created: {new Date(center.created_at).toLocaleDateString()}</Badge>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className={`flex gap-2 p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {['overview', 'students', 'tests', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Students" value={analytics?.overview?.total_students || 0} icon={Users} isDarkMode={isDarkMode} subtitle={`${analytics?.overview?.active_students || 0} active`} />
                <StatCard title="Total Questions" value={analytics?.overview?.total_questions || 0} icon={BookOpen} isDarkMode={isDarkMode} />
                <StatCard title="Total Tests" value={analytics?.overview?.total_tests || 0} icon={FileText} isDarkMode={isDarkMode} />
                <StatCard title="Total Attempts" value={analytics?.overview?.total_attempts || 0} icon={Activity} isDarkMode={isDarkMode} />
                <StatCard title="Average Score" value={`${analytics?.overview?.avg_score || 0}%`} icon={Award} isDarkMode={isDarkMode} />
                <StatCard title="Retention Rate" value={`${analytics?.engagement?.retention_rate || 0}%`} icon={Target} isDarkMode={isDarkMode} />
              </div>

              {analytics?.subjects && analytics.subjects.length > 0 && (
                <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Question Distribution by Subject
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.subjects}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="subject" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={12} />
                          <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#fff' : '#000' }} />
                          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Enrolled Students ({analytics?.students?.length || 0})</h3>
              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                    <tr>
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-left">Enrolled</th>
                      <th className="p-3 text-left">Tests Taken</th>
                      <th className="p-3 text-left">Avg Score</th>
                      <th className="p-3 text-left">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.students?.map(student => (
                      <tr key={student.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="p-3">
                          <div className="font-medium">{student.full_name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{student.email}</div>
                        </td>
                        <td className="p-3 text-sm">{new Date(student.enrolled_at).toLocaleDateString()}</td>
                        <td className="p-3 text-center"><Badge variant="outline">{student.tests_taken}</Badge></td>
                        <td className="p-3">
                          <Badge variant={student.avg_score >= 70 ? 'default' : 'secondary'} className={student.avg_score >= 70 ? 'bg-green-600' : ''}>
                            {student.avg_score}%
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-gray-500">{student.last_activity ? new Date(student.last_activity).toLocaleDateString() : 'Never'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!analytics?.students || analytics.students.length === 0) && (
                <div className="text-center py-8 text-gray-500">No students enrolled yet</div>
              )}
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Tests ({analytics?.tests?.length || 0})</h3>
              <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                    <tr>
                      <th className="p-3 text-left">Test Title</th>
                      <th className="p-3 text-left">Questions</th>
                      <th className="p-3 text-left">Attempts</th>
                      <th className="p-3 text-left">Avg Score</th>
                      <th className="p-3 text-left">Pass Rate</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.tests?.map(test => (
                      <tr key={test.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <td className="p-3">
                          <div className="font-medium">{test.title}</div>
                          <div className="text-xs text-gray-500">Time: {test.time_limit}min | Pass: {test.passing_score}%</div>
                        </td>
                        <td className="p-3 text-center"><Badge variant="outline">{test.question_count?.[0]?.count || 0}</Badge></td>
                        <td className="p-3 text-center"><Badge variant="outline">{test.total_attempts}</Badge></td>
                        <td className="p-3">
                          <Badge variant={test.avg_score >= 70 ? 'default' : 'secondary'} className={test.avg_score >= 70 ? 'bg-green-600' : ''}>
                            {test.avg_score}%
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={test.pass_rate >= 70 ? 'default' : 'secondary'} className={test.pass_rate >= 70 ? 'bg-green-600' : ''}>
                            {test.pass_rate}%
                          </Badge>
                        </td>
                        <td className="p-3"><Badge variant={test.is_active ? 'default' : 'secondary'}>{test.is_active ? 'Active' : 'Inactive'}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!analytics?.tests || analytics.tests.length === 0) && (
                <div className="text-center py-8 text-gray-500">No tests created yet</div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">Engagement Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Daily Active Users</span>
                        <Badge variant="outline">{analytics?.engagement?.dau || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Retention Rate</span>
                        <Badge variant="outline">{analytics?.engagement?.retention_rate || 0}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avg Tests per Student</span>
                        <Badge variant="outline">
                          {analytics?.overview?.total_students > 0 ? (analytics?.overview?.total_attempts / analytics?.overview?.total_students).toFixed(1) : 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className={isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Score</span>
                        <Badge variant="outline">{analytics?.overview?.avg_score || 0}%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Attempts</span>
                        <Badge variant="outline">{analytics?.overview?.total_attempts || 0}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Question Bank Size</span>
                        <Badge variant="outline">{analytics?.overview?.total_questions || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        <div className={`sticky bottom-0 p-6 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialCenterDetailModal;
