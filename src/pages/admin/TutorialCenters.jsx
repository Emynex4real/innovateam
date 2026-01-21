import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Users, BookOpen, FileText, Activity, Search, Eye, Ban, CheckCircle, Trash2, Building2
} from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import TutorialCenterDetailModal from '../../components/admin/TutorialCenterDetailModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatCard = ({ title, value, icon: Icon, isDarkMode, color = 'blue' }) => (
  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-all`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : `bg-${color}-50`}`}>
          <Icon className={`h-6 w-6 ${isDarkMode ? `text-${color}-400` : `text-${color}-600`}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const TutorialCenters = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/tutorial-centers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCenters(response.data.centers);
      }
    } catch (error) {
      console.error('Load centers error:', error);
      toast.error('Failed to load tutorial centers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (center) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/tutorial-centers/${center.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSelectedCenter({ ...center, ...response.data });
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Load center details error:', error);
      toast.error('Failed to load center details');
    }
  };

  const handleSuspend = async (centerId) => {
    if (!window.confirm('Are you sure you want to suspend this center?')) return;
    
    const reason = window.prompt('Reason for suspension:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/admin/tutorial-centers/${centerId}/suspend`, 
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Center suspended successfully');
      loadCenters();
    } catch (error) {
      console.error('Suspend error:', error);
      toast.error('Failed to suspend center');
    }
  };

  const handleActivate = async (centerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/admin/tutorial-centers/${centerId}/activate`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Center activated successfully');
      loadCenters();
    } catch (error) {
      console.error('Activate error:', error);
      toast.error('Failed to activate center');
    }
  };

  const handleDelete = async (centerId) => {
    if (!window.confirm('Are you sure you want to delete this center? This action cannot be undone.')) return;
    
    const reason = window.prompt('Reason for deletion:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/tutorial-centers/${centerId}`, {
        data: { reason },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Center deleted successfully');
      loadCenters();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete center');
    }
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = 
      center.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.tutor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.tutor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.access_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && !center.deleted_at && !center.is_suspended) ||
      (filterStatus === 'suspended' && center.is_suspended) ||
      (filterStatus === 'deleted' && center.deleted_at);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: centers.length,
    active: centers.filter(c => !c.deleted_at && !c.is_suspended).length,
    suspended: centers.filter(c => c.is_suspended).length,
    deleted: centers.filter(c => c.deleted_at).length,
    totalStudents: centers.reduce((sum, c) => sum + (c.stats?.students || 0), 0),
    totalTests: centers.reduce((sum, c) => sum + (c.stats?.tests || 0), 0),
    totalAttempts: centers.reduce((sum, c) => sum + (c.stats?.attempts || 0), 0)
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-screen">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Tutorial Centers Management
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Monitor and manage all tutorial centers on the platform
            </p>
          </div>
          <Button onClick={loadCenters} variant="outline" className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Centers" value={stats.total} icon={Building2} isDarkMode={isDarkMode} color="blue" />
          <StatCard title="Active Centers" value={stats.active} icon={CheckCircle} isDarkMode={isDarkMode} color="green" />
          <StatCard title="Total Students" value={stats.totalStudents} icon={Users} isDarkMode={isDarkMode} color="purple" />
          <StatCard title="Total Tests" value={stats.totalTests} icon={FileText} isDarkMode={isDarkMode} color="orange" />
        </div>

        {/* Filters */}
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by name, tutor, email, or access code..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
              <div className="flex gap-2">
                {['all', 'active', 'suspended', 'deleted'].map(status => (
                  <Button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Centers Table */}
        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                  <tr>
                    <th className="p-3 text-left">Center Name</th>
                    <th className="p-3 text-left">Tutor</th>
                    <th className="p-3 text-left">Access Code</th>
                    <th className="p-3 text-left">Students</th>
                    <th className="p-3 text-left">Tests</th>
                    <th className="p-3 text-left">Attempts</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCenters.map(center => (
                    <tr key={center.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="p-3">
                        <div className="font-medium">{center.name}</div>
                        <div className="text-xs text-gray-500">
                          Created {new Date(center.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{center.tutor?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{center.tutor?.email}</div>
                      </td>
                      <td className="p-3">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                          {center.access_code}
                        </code>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{center.stats?.students || 0}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{center.stats?.tests || 0}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">{center.stats?.attempts || 0}</Badge>
                      </td>
                      <td className="p-3">
                        {center.deleted_at ? (
                          <Badge variant="destructive">Deleted</Badge>
                        ) : center.is_suspended ? (
                          <Badge variant="secondary">Suspended</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleViewDetails(center)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!center.deleted_at && (
                            <>
                              {center.is_suspended ? (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleActivate(center.id)}
                                  title="Activate"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleSuspend(center.id)}
                                  title="Suspend"
                                >
                                  <Ban className="h-4 w-4 text-orange-600" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDelete(center.id)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCenters.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No centers found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCenter && (
        <TutorialCenterDetailModal
          center={selectedCenter}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedCenter(null);
          }}
          onRefresh={loadCenters}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default TutorialCenters;
