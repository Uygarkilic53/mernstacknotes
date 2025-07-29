import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="w-80 flex items-center px-4 py-2 bg-white rounded-full shadow-md border border-slate-200 transition-all focus-within:border-blue-400">
      <input
        type="text"
        placeholder="Search Notes"
        className="flex-1 text-sm bg-transparent py-2 outline-none placeholder:text-slate-400"
        value={value}
        onChange={onChange}
      />

      {value && (
        <IoMdClose
          className="text-lg text-slate-400 cursor-pointer hover:text-red-500 transition-colors mr-2"
          onClick={onClearSearch}
        />
      )}

      <FaMagnifyingGlass
        className="text-lg text-blue-400 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
