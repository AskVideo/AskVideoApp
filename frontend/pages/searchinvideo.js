import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from 'react-use';


export default function Component() {
  const [videoId, setVideoId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);

  const [userId] = useLocalStorage("user_id", null);



  const fetchSessions = async () => {
    try {
      const response = await axios.post('http://localhost:5000/sessions', { user_id: userId });
      console.log(response)
      const sessionTitles = response.data.map(session => session.title);
      setRecentSearches(sessionTitles);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    setIsSearchPerformed(true);
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [...prev, searchQuery].slice(-5));
    }
  };

  const handleRecentSearchClick = async (query) => {
    setSearchQuery(query);
    setIsSearchPerformed(true);
  };

  useEffect(() => {
    fetchSessions(); // Fetch sessions when the component mounts
    const urlParams = new URLSearchParams(window.location.search);
    setVideoId(urlParams.get('video'));
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-1/6 bg-gray-200 p-4">
        <h2 className="font-bold mb-4">Recent Searches</h2>
        <ul>
          {recentSearches.map((query, index) => (
            <li key={index} className="cursor-pointer" onClick={() => handleRecentSearchClick(query)}>
              {query}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl px-4 py-8">
          {isSearchPerformed ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {miniClips.map((clip, index) => (
                <iframe
                  key={index}
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${clip.split('v=')[1]}`}
                  title="YouTube video"
                  frameBorder="0"
                  allowFullScreen>
                </iframe>
              ))}
            </div>
          ) : videoId ? (
            <iframe
              width="100%"
              height="480"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              frameBorder="0"
              allowFullScreen>
            </iframe>
          ) : null}
        </div>
        <div className="w-full max-w-xl">
          <Input
            className="w-full"
            placeholder="Search in video"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <Button className="mt-2" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
