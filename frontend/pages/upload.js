import React, { useState } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function UploadComponent() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setIsUploading(true);

    // Simulate an upload process
    setTimeout(() => {
      console.log('File uploaded:', file);
      setIsUploading(false);
    }, 2000);

    // Here, implement the actual upload logic (e.g., using Axios to send the file to your backend)
  };
  return (
    <div className="flex justify-center items-center h-screen">
        <div className="grid max-w-3xl w-full mx-auto items-center justify-center gap-4 px-4">
        <div className="w-full p-4 border-2 border-dashed rounded-lg border-gray-200/70 dark:border-gray-800/70">
            <div className="flex items-center justify-center space-x-2 text-sm">
            <FileIcon className="w-6 h-6" />
            <span className="font-medium text-gray-500 dark:text-gray-400">Drag and drop your file here or</span>
            <Label
                className="inline-flex h-6 items-center rounded-md border border-gray-200 border-gray-200 bg-white px-2 text-gray-500 text-xs shadow-sm transition-colors cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                htmlFor="file"
            >
                Browse
                <Input className="sr-only" id="file" type="file" />
            </Label>
            </div>
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
            {isUploading ? (
            <div role="status">
                <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* ... SVG path elements ... */}
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
            ) : (
            <Button className="w-full" onClick={handleUpload}>Upload</Button>
            )}
        </div>
        </div>
    </div>
  )
}

function FileIcon(props) {
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
