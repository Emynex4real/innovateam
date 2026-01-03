import React from 'react';
import { TrendingUp, Clock, MessageSquare, Award, Filter } from 'lucide-react';
import './ThreadSorting.css';

const ThreadSorting = ({ sortBy, onSortChange, filterBy, onFilterChange }) => {
  const sortOptions = [
    { value: 'hot', label: 'Hot', icon: TrendingUp },
    { value: 'new', label: 'New', icon: Clock },
    { value: 'top', label: 'Top', icon: Award },
    { value: 'active', label: 'Active', icon: MessageSquare }
  ];

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'unsolved', label: 'Unsolved' },
    { value: 'solved', label: 'Solved' },
    { value: 'following', label: 'Following' }
  ];

  return (
    <div className="thread-sorting">
      <div className="sort-buttons">
        {sortOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            className={`sort-btn ${sortBy === value ? 'active' : ''}`}
            onClick={() => onSortChange(value)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
      
      <div className="filter-dropdown">
        <Filter size={16} />
        <select value={filterBy} onChange={(e) => onFilterChange(e.target.value)}>
          {filterOptions.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ThreadSorting;
