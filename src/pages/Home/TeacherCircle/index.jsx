import React from 'react';

const TeacherCircle = ({ bgColor, number, image }) => {
  if (number) {
    return (
      <div className={`${bgColor} rounded-full w-16 h-16 flex items-center justify-center text-black font-medium`}>
        {number}
      </div>
    );
  }
  
  if (image) {
    return (
      <div className="rounded-full w-16 h-16 overflow-hidden">
        <img src={image} alt="Teacher" className="w-full h-full object-cover" />
      </div>
    );
  }
  
  return null;
};

export default TeacherCircle;