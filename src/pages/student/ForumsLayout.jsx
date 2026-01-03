import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// CORRECTION: Pointing to the 'components' folder instead of './'
import CategoryList from '../../components/forums/CategoryList';
import ThreadList from '../../components/forums/ThreadList';
import ThreadDetail from '../../components/forums/ThreadDetail';
// import SearchResults from '../../components/forums/SearchResults'; // Commented out until created

// Ensure this CSS file exists in components/forums/ or adjust path
import './Forums.css';

const ForumsLayout = ({ centerId, userId, userName, userAvatar }) => {
  return (
    <div className="forums-container min-h-screen bg-gray-50">
      <Routes>
        {/* Dashboard / Categories */}
        <Route 
          index 
          element={<CategoryList centerId={centerId} />} 
        />
        
        {/* Thread List per Category */}
        <Route 
          path="category/:categoryId" 
          element={<ThreadList centerId={centerId} userId={userId} />} 
        />
        
        {/* Single Thread Detail */}
        <Route 
          path="thread/:threadId" 
          element={
            <ThreadDetail 
              userId={userId} 
              userName={userName} 
              userAvatar={userAvatar} 
            />
          } 
        />
      </Routes>
    </div>
  );
};

export default ForumsLayout;