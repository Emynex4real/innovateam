import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3, TrendingUp, Users, BookOpen } from 'lucide-react';

const Analytics = () => {
  const metrics = [
    { title: 'Total Recommendations', value: '12,345', change: '+15%', trend: 'up' },
    { title: 'User Engagement', value: '87%', change: '+5%', trend: 'up' },
    { title: 'Popular Courses', value: '25', change: '+3%', trend: 'up' },
    { title: 'Success Rate', value: '92%', change: '+2%', trend: 'up' },
  ];

  const topCourses = [
    { name: 'Computer Science', requests: 1234, percentage: 85 },
    { name: 'Medicine', requests: 987, percentage: 70 },
    { name: 'Engineering', requests: 756, percentage: 60 },
    { name: 'Law', requests: 543, percentage: 45 },
    { name: 'Business', requests: 432, percentage: 35 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Requested Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{course.name}</span>
                      <span className="text-sm text-muted-foreground">{course.requests}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${course.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">Daily Active Users</p>
                    <p className="text-sm text-muted-foreground">Last 7 days</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">2,847</p>
                  <p className="text-sm text-green-600">+12%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Course Views</p>
                    <p className="text-sm text-muted-foreground">This month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">15,432</p>
                  <p className="text-sm text-green-600">+8%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="font-medium">Recommendations</p>
                    <p className="text-sm text-muted-foreground">Generated today</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">456</p>
                  <p className="text-sm text-green-600">+23%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;