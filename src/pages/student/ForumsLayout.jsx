import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CategoryList from '../../components/forums/CategoryList';
import ThreadList from '../../components/forums/ThreadList';
import ThreadDetail from '../../components/forums/ThreadDetail';
import '../../components/forums/ForumStyles.css';

const ForumsLayout = ({ centerId, userId, userName, userAvatar }) => {
  return (
    <div className="forums-container">
      <Routes>
        <Route index element={<CategoryList centerId={centerId} />} />
        <Route path="category/:categoryId" element={<ThreadList centerId={centerId} userId={userId} />} />
        <Route path="thread/:threadId" element={<ThreadDetail userId={userId} userName={userName} userAvatar={userAvatar} />} />
      </Routes>
    </div>
  );
};

export default ForumsLayout;
