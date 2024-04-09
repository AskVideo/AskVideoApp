import React, { useEffect, useState } from "react";
import axios from "axios";
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
        .filter((item) => item.video_info)
        .map(({ video_info }) => {
          const {start, end } = video_info;
          return {
            id: videoId,
            url: `https://www.youtube.com/embed/${videoId}?start=${Math.floor(
              start
            )}&end=${Math.floor(end)}`,
            title: `Clip starting at ${Math.floor(start % 3600 / 60)}:${String(Math.floor(start % 60)).padStart(2, '0')}`,
          };
        });
      console.log("miniclipdata")
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
    if (videoId) {
      setVideoUrl(`https://www.youtube.com/embed/${videoId}`) 
    }
    if(videoUrl){
      setVideoUrl(videoUrl);
    }
    console.log(videoUrl)
  }, [miniClips, videoUrl, sessId, videoId]);

 


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
      setRecentSearches(response.data.data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  const handleRecentSearchClick = async (sess_id, video_id) => {
    const response = await axios.post("http://localhost:5000/session/content", {
        sess_id: sess_id,
      });
    let sessions = response.data.data;
    set_sessId(JSON.stringify(sess_id));
    setVideoId(video_id);
    setVideoUrl(`https://www.youtube.com/embed/${video_id}`)
    let userMessage = "";
    let currentMessages = [];
    for (const sess in sessions) {
      if (sessions[sess].sequence % 2 == 0) {
          console.log("sesss");
          userMessage = { sender: "user", type: "text", text: sessions[sess].text };
          currentMessages.push(userMessage);
      }
      else{
          let miniClipsData = [];
          userMessage = { sender: "bot", type: "text", text: sessions[sess].text };
          currentMessages.push(userMessage);
          for (const video in sessions[sess].video_info) {
            console.log(video);
            miniClipsData.push({
              id: video_id,
              url: `https://www.youtube.com/embed/${video_id}?start=${Math.floor(
                sessions[sess].video_info[video].start
              )}&end=${Math.floor(sessions[sess].video_info[video].end)}`,
              title: `Clip starting at ${Math.floor(sessions[sess].video_info[video].start % 3600 / 60)}:${String(Math.floor(sessions[sess].video_info[video].start % 60)).padStart(2, '0')}`,
            })
          }
          if (miniClipsData.length > 0) {
            console.log(miniClipsData)
            setMiniClips(miniClipsData)
          }
      }
    }
    setMessages(currentMessages);
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
            {recentSearches.map((sess, index) => (
              <li
                key={sess.sess_id}
                className="cursor-pointer"
                onClick={() => handleRecentSearchClick(sess.sess_id, sess.video_id)}
              >
                {sess.title}
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
                  {msg.sender === "bot" && (
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