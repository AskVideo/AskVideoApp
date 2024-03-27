import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useLocalStorage } from "react-use";


export default function Component() {
  const [videoId, setVideoId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [miniClips, setMiniClips] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const [userId] = useLocalStorage("user_id", null);
  const [sessId, set_sessId] = useLocalStorage("sess_id", null);

  const [messages, setMessages] = useState([]);

  

  const toggleMiniClip = (messageIndex) => {
    if (isDropdownOpen === messageIndex) {
      setIsDropdownOpen(null);
    } else {
      setIsDropdownOpen(messageIndex);
    }
  };

  const handleChatSubmit = async (message) => {
    if (message.trim() === "") return;

    const userMessage = { sender: "user", type: "text", text: message };
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const response = await axios.post("http://localhost:5000/video/ask", {
        video_id: videoId,
        sess_id: sessId,
        seq: messages.length,
        query: message,
      });

      const firstResponseData = response.data.data[0];

      const chatbotResponse = {
        sender: "bot",
        type: "text",
        text: firstResponseData.answer,
      };
      setMessages((currentMessages) => [...currentMessages, chatbotResponse]);

      const miniClipsData = response.data.data
        .filter((item) => item.video_info && item.video_info.video_id)
        .map(({ video_info }) => {
          const { video_id, start, end } = video_info;
          return {
            id: video_id,
            url: `https://www.youtube.com/embed/${video_id}?start=${Math.floor(
              start
            )}&end=${Math.floor(end)}`,
            title: `Clip starting at ${Math.floor(start % 3600 / 60)}:${String(Math.floor(start % 60)).padStart(2, '0')}`,
          };
        });
      console.log(miniClipsData)

      if (miniClipsData.length > 0) {
        setMiniClips(miniClipsData)
      }

    } catch (error) {
      console.error("Error during chat submission:", error);
    }

    setSearchQuery("");
  };


  useEffect(() => {
    fetchSessions();
    fetchMiniClips();
    const urlParams = new URLSearchParams(window.location.search);
    setVideoId(urlParams.get("video"));
    console.log("videoId")
    console.log(urlParams)
    console.log(videoId)
    setVideoUrl(`https://www.youtube.com/embed/${urlParams.get("video")}`)
    console.log(videoUrl)
  }, []);

 


  const fetchMiniClips = async () => {
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.post("http://localhost:5000/sessions", {
        user_id: userId,
      });
      const sessionsData = response.data.data;
      const lastSessionId = sessionsData[sessionsData.length - 1].sess_id;
      
      set_sessId(JSON.stringify(lastSessionId));
      console.log("Last Session ID:", lastSessionId);
      const sessionTitles = response.data.data.map((session) => session.title);
      setRecentSearches(sessionTitles);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  const handleRecentSearchClick = async (query) => {
    setSearchQuery(query);
    setIsSearchPerformed(true);
  };

  return (
    <div className="bg-gray-100 h-screen">
      <div className="absolute top-5 right-5 flex items-center space-x-4">
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      {/* Main content area */}

      <div className="flex h-screen">
        {/* Recent Searches Sidebar */}

        <div className="w-1/6 bg-gray-200 p-4">
          <h2 className="font-bold mb-4 ">Recent Searches</h2>
          <ul>
            {recentSearches.map((search, index) => (
              <li
                key={index}
                className="cursor-pointer"
                onClick={() => handleRecentSearchClick(search)}
              >
                {search}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat and video section */}
        <div className="flex-1 flex flex-col items-center p-4">
          {/* Video display */}
          {videoId && (
            <div className="w-full max-w-md p-2 mb-4">
              <iframe
                className="aspect-video rounded-lg object-cover"
                width="100%"
                height="180"
                src={`${videoUrl}`}
                title="YouTube video player"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}

     
          {/* Chat Interface */}
          <div className="w-full max-w-2x1 bg-grey rounded-lg border p-4 flex flex-col space-y-2">
            <div className="overflow-y-auto h-96">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : ""
                  } items-center my-2`}
                >
                  <div
                    className={`p-2 rounded ${
                      msg.sender === "user" ? "bg-blue-200" : "bg-gray-200"
                    } max-w-xs`}
                  >
                    {msg.text}
                  </div>
                  {msg.sender === "bot" && miniClips.length > index && (
                    <Button
                      className="ml-2"
                      onClick={() => toggleMiniClip(index)} // Define the toggle function
                    >
                      Mini Clips
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {/* Always attempt to show Mini Clips button if there are clips, regardless of chat messages */}

            {isDropdownOpen && (
              <ul className="absolute w-56 bg-white border rounded shadow-lg mt-1 z-10">
                {miniClips.map((clip, index) => (
                  <li
                    key={index}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setVideoUrl(clip.url);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {clip.title}
                  </li>
                ))}
              </ul>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChatSubmit(searchQuery);
              }}
              className="flex"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 border rounded-l outline-none"
                placeholder="Ask something..."
              />
              <Button type="submit">Send</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
