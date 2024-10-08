import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from 'next/router';
import { useLocalStorage } from 'react-use';


export default function Component() {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter(); 

  const [userId] = useLocalStorage("user_id", null);

  useEffect(() => {
    const searches = localStorage.getItem("recentSearches");
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }
  }, []);

  const updateRecentSearches = (searchTerm) => {
    const updatedSearches = [searchTerm, ...recentSearches].slice(0, 4); 
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post("http://localhost:5000/video/search", {
        query: searchQuery,
      });
      console.log(response.data.data); 
      setVideos(response.data.data);
      updateRecentSearches(searchQuery)
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVideoSelect = async (videoUrl) => {
    setShowProgressBar(true);
    setProgress(20);

    console.log(`handleVideoSelect called with URL: ${videoUrl}`);
  if (!videoUrl) {
    console.error("handleVideoSelect was called with an undefined or null URL.");
    return;
  }
    try {
      const url = new URL(videoUrl);
      const videoId = url.searchParams.get("v");
      if (!videoId) {
        console.error("Video ID (v parameter) is missing from the URL:", videoUrl);
        return; 
      }
      console.log(`Video ID: ${videoId}`); 
      setProgress(40)
      setProgress(50)
      const response = await axios.post('http://localhost:5000/video/preprocess', {
        user_id: userId, 
        video_id: videoId,
        session_name: searchQuery 
      });
      setProgress(70)
      if (response.data.code === 200) {
        setProgress(80)
        window.location.href = `http://localhost:3001/searchinvideo?video=${encodeURIComponent(videoId)}`;
        setProgress(90)
      }
    } catch (error) {
      console.error("Error in handleVideoSelect:", error);
    }
};

  return (
    <div className="flex justify-center items-center h-screen relative">
      <div className="absolute top-5 right-5 flex items-center space-x-4">
        <Button onClick={() => router.push("/searchinvideo")}>Profile
        </Button>
        {/* Logout Button */}
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      
      <div className="max-w-3xl mx-auto grid gap-4">
        <div>
        {showProgressBar && (
            <Progress className="w-full" value={progress} max="100"></Progress>
        )}
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
                onClick={() => handleVideoSelect(video.url)}
              >
                <img
                  alt={`Thumbnail for ${video.title}`}
                  className="aspect-video rounded-lg object-cover"
                  height={94}
                  src={video.thumbnail_url}
                  width={168}
                  onClick={() => {
                    handleVideoSelect(video.url);
                  }}
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
