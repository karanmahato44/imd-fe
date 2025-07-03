import { Upload } from "lucide-react";
import React, { useState } from "react";

interface ControlPanelProps {
  onAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isParsingAudio: boolean;
}

export function ControlPanel({ onAudioUpload, isParsingAudio }: ControlPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isParsingAudio) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isParsingAudio && e.dataTransfer.files && e.dataTransfer.files[0]) {
      const syntheticEvent = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onAudioUpload(syntheticEvent);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-2 text-gray-900">Upload Audio</h3>
        <p className="text-xs text-gray-600 mb-3">Analyze your own audio files</p>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
            isParsingAudio
              ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
              : isDragging
                ? "border-[#1db954] bg-[#1db954]/5"
                : "border-gray-300 hover:border-[#1db954]/50"
          }`}
        >
          <Upload className={`h-6 w-6 mx-auto mb-2 ${isParsingAudio ? "text-gray-400" : "text-gray-500"}`} />
          <label
            htmlFor="audio-upload"
            className={`text-xs font-medium ${
              isParsingAudio ? "text-gray-400 cursor-not-allowed" : "cursor-pointer text-[#1db954] hover:text-[#1ed760]"
            }`}
          >
            {isParsingAudio ? "Processing..." : "Choose an audio file"}
          </label>
          <p className={`text-xs mt-1 ${isParsingAudio ? "text-gray-400" : "text-gray-500"}`}>MP3</p>
          <input
            id="audio-upload"
            type="file"
            accept=".mp3"
            onChange={onAudioUpload}
            className="hidden"
            disabled={isParsingAudio}
          />
        </div>
      </div>
    </div>
  );
}
