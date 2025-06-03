"use client";
import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Tìm kiếm công việc..."
      value={query}
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 rounded-md mb-4"
    />
  );
};

export default SearchBar;