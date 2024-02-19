import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Component() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const searches = localStorage.getItem("recentSearches");
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }
  }, []);

  const updateRecentSearches = (searchTerm) => {
    const updatedSearches = [searchTerm, ...recentSearches].slice(0, 4); // Keep only the last 4 searches
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches)); // Save to localStorage
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post("http://localhost:5000/video/search", {
        query: searchQuery,
      });
      console.log(response.data.data); // Log to check the structure
      setVideos(response.data.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVideoSelect = (videoUrl) => {
    const videoId = new URL(videoUrl).searchParams.get("v");
    if (videoId) {
      window.location.href = `http://localhost:3001/searchinvideo?video=${encodeURIComponent(
        videoId
      )}`;
    } else {
      console.error("Video ID is undefined");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-3xl mx-auto grid gap-4">
        <div>
          <h1 className="text-3xl font-bold">AskVideo</h1>
          <div className="border border-gray-200 rounded-lg p-4 grid gap-4">
            <div className="text-sm flex items-center gap-2">
              <SearchIcon className="w-4 h-4" />
              <label className="text-sm font-medium" htmlFor="search">
                Search
              </label>
            </div>
            <Input
              id="search"
              placeholder="Enter your search query"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 grid gap-4 mt-4">
            <h2 className="text-sm font-medium">Recent Searches</h2>
            <div className="flex items-center gap-2">
              {recentSearches.map((search, index) => (
                <div key={index} className="text-sm underline">
                  {search}
                </div>
              ))}
            </div>
          </div>
        </div>

        {videos.length > 0 && (
          <div className="grid gap-4">
            {videos.map((video, index) => (
              <div
                key={index}
                className="flex items-start gap-4 relative"
                onClick={() => handleVideoSelect(video.video_url)}
              >
                <img
                  alt={`Thumbnail for ${video.title}`}
                  className="aspect-video rounded-lg object-cover"
                  height={94}
                  src={video.thumbnail_url}
                  width={168}
                  onClick={() => handleVideoSelect(video.url)}
                />
                <div className="text-sm">
                  <div className="font-medium line-clamp-2">{video.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1 dark:text-gray-400">
                    {video.views} views · {video.posted_date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
