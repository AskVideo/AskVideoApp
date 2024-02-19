import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";


export default function Component() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('video');

    if (videoId) {
      // Fetch video details based on videoId
      // This is a placeholder for your fetching logic
      axios.get(`http://localhost:5000/video/details/${videoId}`)
        .then(response => {
          setSelectedVideo(response.data);
        })
        .catch(error => console.error('Error fetching video details:', error));
    }
  }, []);

  return (
    <div className="w-full">
      {selectedVideo ? (
        <div className="aspect-video overflow-hidden bg-gray-100/60 dark:bg-gray-800/60" style={{ maxWidth: '500px' }}>
          <img 
            alt={selectedVideo.title} 
            className="aspect-none object-cover" 
            src={selectedVideo.thumbnail_url}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button className="p-4 rounded-full" variant="ghost">
              <PlayIcon className="w-8 h-8" />
              <span className="sr-only">Play</span>
            </Button>
          </div>
        </div>
      ) : (
        <div>No video selected</div>
      )}
      <div className="container flex flex-1 flex-col min-h-[300px] p-4 md:p-6">
        <div className="mx-auto max-w-2xl grid gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tighter sm:text-4xl md:text-5xl">Introducing Shadcn</h1>
            <p className="text-gray-500 md:text-xl dark:text-gray-400">The definitive component library for the web.</p>
          </div>
          <div className="space-y-2">
            <Input 
              className="max-w-sm w-full" 
              placeholder="Search in video" 
              type="search" 
              value={searchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayIcon(props) {
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
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
