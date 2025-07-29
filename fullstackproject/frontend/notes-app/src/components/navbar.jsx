import React, { useState } from "react";
import ProfileInfo from "./Cards/ProfileInfo.jsx";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar/SearchBar.jsx";

const Navbar = ({ userInfo, setUserInfo, onSearchNotes }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    setUserInfo(null);
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      onSearchNotes("");
    } else {
      onSearchNotes(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="bg-white flex items-center justify-between p-4 shadow-md">
      <a href="/" className="text-xl font-medium text-black py-2">
        Notes
      </a>

      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />

      {userInfo && <ProfileInfo userInfo={userInfo} onLogout={onLogout} />}
    </div>
  );
};
export default Navbar;
