import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { useLocalStorage } from "react-use";

export default function Component() {
  const [videoId, setVideoId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const [userId] = useLocalStorage("user_id", null);
  const [messages, setMessages] = useState([]);

  const miniClips = [
    {
      id: "dQw4w9WgXcQ",
      title: "Clip 1",
      thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg",
    },
    {
      id: "kxopViU98Xo",
      title: "Clip 2",
      thumbnailUrl: "https://img.youtube.com/vi/kxopViU98Xo/0.jpg",
    },
  ];

  const handleChatSubmit = async (message) => {
    if (message.trim() === "") return;

    // Add the user's message to the chat messages
    const userMessage = { sender: "user", type: "text", text: message };
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      // Send the message to the backend and wait for the response
      const response = await axios.post("http://localhost:5000/video/ask", {
        video_id: videoId,
        sess_id: userId, 
        seq: messages.length, 
        query: message,
      });

      // Add the backend's response to the chat messages
      const chatbotResponse = {
        sender: "bot",
        type: "text",
        text: response.data.answer, 
        miniClips: response.data.miniClips, 
      };
      setMessages((currentMessages) => [...currentMessages, chatbotResponse]);

      if (response.data.miniClips) {
        const miniClipsResponse = response.data.miniClips.map((clip) => ({
          sender: "bot",
          type: "miniClip",
          content: clip,
        }));
        setMessages((currentMessages) => [
          ...currentMessages,
          ...miniClipsResponse,
        ]);
      }
    } catch (error) {
      console.error("Error during chat submission:", error);
    }

    // Clear the input field after submission
    setSearchQuery("");
  };

  const showMiniClipsForMessage = (messageIndex) => {
    const message = messages[messageIndex];
    if (message && message.miniClips) {
      setMiniClipsReceivedFromSearch(message.miniClips);
      setIsDropdownOpen(true); // If using a dropdown to show the clips
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchMiniClips();
    const urlParams = new URLSearchParams(window.location.search);
    setVideoId(urlParams.get("video"));
  }, []);

  const fetchMiniClips = async () => {
    // Implementation depends on your backend setup
    // Assume it sets miniClips state with an array of clip URLs or IDs
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
      console.log(response);
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
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Mini Clips Dropdown */}
          {chatMessages.length > 0 && (
            <div className="relative mb-4">
              <Button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                Mini Clips
              </Button>
              {isDropdownOpen && (
                <ul className="absolute w-56 bg-white border rounded shadow-lg mt-1 z-10">
                  {miniClips.map((clip, index) => (
                    <li
                      key={index}
                      className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setVideoId(clip.id);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {clip.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* Chat Interface */}
          <div className="w-full max-w-2x1 bg-grey rounded-lg border p-4 flex flex-col space-y-2">
            <div className="overflow-y-auto h-96">
              {/* Iterate over messages and display text or mini clips */}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    msg.sender === "user"
                      ? "bg-blue-200 ml-auto"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.text}
                  {/* If the message is a mini clip, display a video player */}
                  {msg.type === "miniClip" && (
                    <iframe
                      className="aspect-video rounded-lg object-cover w-full"
                      src={`https://www.youtube.com/embed/${msg.content.id}`}
                      title={msg.content.title}
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  )}
                </div>
              ))}
            </div>
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
              <Button
                type="submit"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
