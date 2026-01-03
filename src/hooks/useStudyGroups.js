import { useState, useEffect } from 'react';
import CollaborationService from '../services/collaborationService';

export const useStudyGroups = (centerId) => {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGroups = async () => {
    if (!centerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [groupsResult, userGroupsResult] = await Promise.all([
        CollaborationService.getStudyGroups(centerId),
        CollaborationService.getUserStudyGroups()
      ]);

      if (groupsResult.success) {
        setGroups(groupsResult.data || []);
      } else {
        setError(groupsResult.error);
      }

      if (userGroupsResult.success) {
        setUserGroups(userGroupsResult.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      const result = await CollaborationService.createStudyGroup(
        groupData.name,
        groupData.description,
        groupData.topic,
        groupData.subject
      );

      if (result.success) {
        await loadGroups(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const joinGroup = async (groupId) => {
    try {
      const result = await CollaborationService.joinStudyGroup(groupId);
      
      if (result.success) {
        await loadGroups(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      const result = await CollaborationService.leaveStudyGroup(groupId);
      
      if (result.success) {
        await loadGroups(); // Refresh the list
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const searchGroups = async (query) => {
    if (!centerId || !query.trim()) {
      await loadGroups();
      return;
    }

    setLoading(true);
    try {
      const result = await CollaborationService.searchStudyGroups(centerId, query);
      
      if (result.success) {
        setGroups(result.data || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isUserInGroup = (groupId) => {
    return userGroups.some(group => group.id === groupId);
  };

  useEffect(() => {
    loadGroups();
  }, [centerId]);

  return {
    groups,
    userGroups,
    loading,
    error,
    createGroup,
    joinGroup,
    leaveGroup,
    searchGroups,
    isUserInGroup,
    refreshGroups: loadGroups
  };
};