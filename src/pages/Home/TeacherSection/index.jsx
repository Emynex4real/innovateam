import React, { useState } from 'react';
import image from "../../../images/pexels-cottonbro-6344238.jpg";
import { Users } from 'lucide-react';
import TeacherCircle from '../TeacherCircle';

const TeacherSection = () => {
  const [hoveredTeacher, setHoveredTeacher] = useState(null);

  const teachers = [
    {
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop',
      name: 'Sarah Johnson',
    },
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&auto=format&fit=crop',
      name: 'Michael Lee',
    },
    {
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&auto=format&fit=crop',
      name: 'Emily Davis',
    },
    {
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&auto=format&fit=crop',
      name: 'James Brown',
    },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Image Container */}
      <div className="relative w-full max-w-[80%] sm:max-w-xs md:max-w-sm lg:max-w-md">
        <img
          src={image}
          alt="Education"
          className="w-full rounded-lg shadow-xl"
        />
        {/* Badge for Teacher Count */}
        <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-800 text-xs font-semibold rounded-full px-3 py-1 shadow-md flex items-center">
          <Users className="w-4 h-4 mr-1" />
          135+ Teachers
        </div>
      </div>

      {/* Teacher Circles */}
      <div className="flex justify-center mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:left-1/2 sm:transform sm:-translate-x-1/2">
        <div className="flex -space-x-4">
          {teachers.map((teacher, index) => (
            <div
              key={index}
              className="relative"
              onMouseEnter={() => setHoveredTeacher(index)}
              onMouseLeave={() => setHoveredTeacher(null)}
            >
              <TeacherCircle image={teacher.image} />
              {hoveredTeacher === index && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white text-gray-800 text-xs font-semibold rounded-md px-2 py-1 shadow-md whitespace-nowrap">
                  {teacher.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherSection;
