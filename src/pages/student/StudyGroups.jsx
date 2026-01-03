import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, BookOpen, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CreateStudyGroupModal from '../../components/collaboration/CreateStudyGroupModal';
import StudyGroupDetail from '../../components/collaboration/StudyGroupDetail';
import CollaborationService from '../../services/collaborationService';
import { useAuth } from '../../App';
import supabase from '../../config/supabase';
import './StudyGroups.css';

const StudyGroups = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [view, setView] = useState(() => sessionStorage.getItem('studyGroupView') || 'browse');
  const [selectedGroupId, setSelectedGroupId] = useState(() => sessionStorage.getItem('selectedGroupId') || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('center_id')
          .eq('id', user.id)
          .single();
        
        setUserProfile(profile || { center_id: null });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({ center_id: null });
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    if (userProfile !== null) fetchAllData();
  }, [userProfile]);

  // Check if selected group exists, if not reset to browse
  useEffect(() => {
    if (view === 'detail' && selectedGroupId) {
      const checkGroupExists = async () => {
        const result = await CollaborationService.getStudyGroupDetail(selectedGroupId);
        if (!result.success || !result.data) {
          // Group doesn't exist, reset to browse
          setSelectedGroupId(null);
          setView('browse');
          sessionStorage.removeItem('selectedGroupId');
          sessionStorage.setItem('studyGroupView', 'browse');
        }
      };
      checkGroupExists();
    }
  }, [view, selectedGroupId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        CollaborationService.getStudyGroups(userProfile?.center_id || null),
        CollaborationService.getUserStudyGroups()
      ]);

      if (allRes.success) setGroups(allRes.data || []);
      if (myRes.success) setUserGroups(myRes.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userProfile?.center_id && searchQuery.trim()) {
      toast.error('Please join a tutorial center first');
      return;
    }
    
    setLoading(true);
    if (!searchQuery.trim()) {
      fetchAllData();
      return;
    }
    const res = await CollaborationService.searchStudyGroups(userProfile.center_id, searchQuery);
    if (res.success) setGroups(res.data || []);
    setLoading(false);
  };

  const handleCreateGroup = async (groupData) => {
    setCreating(true);
    
    const payload = {
      ...groupData,
      centerId: userProfile?.center_id || null
    };

    const result = await CollaborationService.createStudyGroup(payload);
    
    if (result.success) {
      toast.success('Study Group Created!');
      setShowCreateModal(false);
      const myRes = await CollaborationService.getUserStudyGroups();
      if (myRes.success) setUserGroups(myRes.data || []);
      setView('my-groups'); 
    } else {
      toast.error(result.error || 'Failed to create group');
    }
    setCreating(false);
  };

  const handleJoinGroup = async (e, groupId) => {
    e.stopPropagation();
    const result = await CollaborationService.joinStudyGroup(groupId);
    
    if (result.success) {
      toast.success('Joined successfully!');
      await fetchAllData();
    } else {
      if (result.error === 'Already a member') {
        toast('You are already a member', { icon: 'ℹ️' });
      } else {
        toast.error(result.error || 'Failed to join');
      }
    }
  };

  const isJoined = (groupId) => {
    return userGroups.some(g => g.id === groupId);
  };

  const getGradient = (name) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
      'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (view === 'detail' && selectedGroupId) {
    return (
      <StudyGroupDetail 
        groupId={selectedGroupId} 
        onBack={() => {
          setSelectedGroupId(null);
          setView('browse');
          sessionStorage.removeItem('selectedGroupId');
          sessionStorage.setItem('studyGroupView', 'browse');
          fetchAllData();
        }}
      />
    );
  }

  const displayList = view === 'browse' ? groups : userGroups;

  if (!user) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="study-groups-layout">
      <div className="sg-header">
        <div>
          <h1 className="sg-title">Study Groups</h1>
          <p className="sg-subtitle">Connect, collaborate, and ace your exams together.</p>
        </div>
        <button 
          className="btn-primary-lg" 
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} /> Create New Group
        </button>
      </div>

      <div className="sg-controls">
        <div className="sg-tabs">
          <button 
            className={`sg-tab ${view === 'browse' ? 'active' : ''}`}
            onClick={() => {
              setView('browse');
              sessionStorage.setItem('studyGroupView', 'browse');
            }}
          >
            Explore
          </button>
          <button 
            className={`sg-tab ${view === 'my-groups' ? 'active' : ''}`}
            onClick={() => {
              setView('my-groups');
              sessionStorage.setItem('studyGroupView', 'my-groups');
            }}
          >
            My Groups <span className="badge">{userGroups.length}</span>
          </button>
        </div>

        <form onSubmit={handleSearch} className="sg-search">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search topics, subjects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="sg-grid-container">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="sg-card skeleton"></div>)
        ) : displayList.length === 0 ? (
          <div className="sg-empty">
            <div className="empty-illustration">📚</div>
            <h3>{view === 'browse' ? "No study groups found" : "You haven't joined any groups"}</h3>
            <p>
              {view === 'browse' 
                ? "Try adjusting your search or create the first group!" 
                : "Browse the 'Explore' tab to find a group to join."}
            </p>
            {view === 'my-groups' && (
              <button className="btn-outline" onClick={() => setView('browse')}>Browse Groups</button>
            )}
          </div>
        ) : (
          displayList.map(group => {
            const joined = isJoined(group.id);
            return (
              <div 
                key={group.id} 
                className="sg-card"
                onClick={() => { 
                  setSelectedGroupId(group.id); 
                  setView('detail');
                  sessionStorage.setItem('selectedGroupId', group.id);
                  sessionStorage.setItem('studyGroupView', 'detail');
                }}
              >
                <div className="sg-card-cover" style={{ background: group.image_url ? `url(${group.image_url})` : getGradient(group.name) }}>
                  {group.image_url && <img src={group.image_url} alt={group.name} />}
                  <span className="sg-subject-tag">{group.subject}</span>
                </div>

                <div className="sg-card-body">
                  <h3 className="sg-card-title">{group.name}</h3>
                  <p className="sg-card-desc">
                    {group.description || "No description provided."}
                  </p>
                  
                  <div className="sg-card-meta">
                    <div className="meta-item">
                      <Users size={14} />
                      <span>{group.members?.[0]?.count || 1} Members</span>
                    </div>
                    {group.topic && (
                      <div className="meta-item">
                        <BookOpen size={14} />
                        <span>{group.topic}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sg-card-footer">
                  {joined ? (
                    <button className="btn-view">
                      View Group <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button 
                      className="btn-join"
                      onClick={(e) => handleJoinGroup(e, group.id)}
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateStudyGroupModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        loading={creating}
      />
    </div>
  );
};

export default StudyGroups;