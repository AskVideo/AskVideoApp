import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Component() {
  const [videoId, setVideoId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleSearch = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const vidId = urlParams.get('video');
      const response = await axios.post("http://localhost:5000/video/details/" + vidId, {"payload": "das"});
      console.log(response.data); 
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vidId = urlParams.get('video');
    if (vidId) {
      setVideoId(vidId);
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="mb-4">
        {videoId ? (
          <div className="aspect-video overflow-hidden bg-gray-100/60 dark:bg-gray-800/60" style={{ maxWidth: '500px' }}>
            <iframe 
              width="500" 
              height="281"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player" 
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        ) : (
          <div>No video selected</div>
        )}
      </div>
      <div className="w-full max-w-md">
        <Input 
          className="w-full" 
          placeholder="Search in video" 
          type="search" 
          onChange={handleSearchChange}
          onKeyPress={handleKeyPress}
          value={searchQuery}
        />
        <Button className="w-full mt-2"  onClick={handleSearch}>Search</Button>
      </div>
    </div>
  )
}
