import React from 'react';
import { Users, BookOpen, Calendar } from 'lucide-react';

const StudyGroupCard = ({ group, onJoin, onView, isJoined = false }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {group.name}
        </h3>
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
          {group.subject}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {group.description}
      </p>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>{group.member_count || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{new Date(group.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onView(group.id)}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          View Details
        </button>
        {!isJoined && (
          <button
            onClick={() => onJoin(group.id)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Join Group
          </button>
        )}
      </div>
    </div>
  );
};

export default StudyGroupCard;