import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([
    { id: 1, name: 'Computer Science', faculty: 'Engineering', cutoff: 200, capacity: 100 },
    { id: 2, name: 'Medicine', faculty: 'Medicine', cutoff: 280, capacity: 50 },
    { id: 3, name: 'Law', faculty: 'Law', cutoff: 250, capacity: 80 },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', faculty: '', cutoff: '', capacity: '' });

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.faculty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = () => {
    if (newCourse.name && newCourse.faculty && newCourse.cutoff && newCourse.capacity) {
      setCourses([...courses, { 
        id: courses.length + 1, 
        ...newCourse,
        cutoff: parseInt(newCourse.cutoff),
        capacity: parseInt(newCourse.capacity)
      }]);
      setNewCourse({ name: '', faculty: '', cutoff: '', capacity: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Courses ({courses.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Course Name</th>
                  <th className="text-left p-2">Faculty</th>
                  <th className="text-left p-2">Cutoff</th>
                  <th className="text-left p-2">Capacity</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{course.name}</td>
                    <td className="p-2">{course.faculty}</td>
                    <td className="p-2">{course.cutoff}</td>
                    <td className="p-2">{course.capacity}</td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Course Name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
              />
              <Input
                placeholder="Faculty"
                value={newCourse.faculty}
                onChange={(e) => setNewCourse({...newCourse, faculty: e.target.value})}
              />
              <Input
                placeholder="Cutoff Score"
                type="number"
                value={newCourse.cutoff}
                onChange={(e) => setNewCourse({...newCourse, cutoff: e.target.value})}
              />
              <Input
                placeholder="Capacity"
                type="number"
                value={newCourse.capacity}
                onChange={(e) => setNewCourse({...newCourse, capacity: e.target.value})}
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <Button onClick={handleAddCourse}>Add Course</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseManagement;