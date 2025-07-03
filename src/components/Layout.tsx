import type { SongInfo } from "@/@types";
import React, { useState } from "react";
import { clearRecommendations, fetchRecsByAudio, fetchRecsBySongName } from "../redux/features/recommendationsSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { RecommendationsSidebar } from "./RecommendationsSidebar";
import { LibrarySidebar } from "./LibrarySidebar";
import { MainContent } from "./MainContent";

export function Layout() {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsingAudio, setIsParsingAudio] = useState(false);
  const [currentPlayingSong, setCurrentPlayingSong] = useState<SongInfo | null>(null);
  const [resetDragTrigger, setResetDragTrigger] = useState(0);

  const dispatch = useAppDispatch();
  const { songs, status, error, queryFileName, queryAudioFeatures } = useAppSelector((state) => state.recommendations);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      setUploadedFile(null);
      const result = await dispatch(fetchRecsBySongName(query));

      // Check if the request was successful and has recommendations
      if (result.meta.requestStatus === "fulfilled" && result.payload.recommendations?.length > 0) {
        setCurrentPlayingSong({
          track_name: result.payload.recommendations[0].track_name,
          artist_name: result.payload.recommendations[0].artist_name,
        });
      } else {
        // Fallback if no recommendations found
        setCurrentPlayingSong({
          track_name: query,
          artist_name: "Unknown Artist",
        });
      }
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsParsingAudio(true);

      try {
        await dispatch(fetchRecsByAudio(file));
        setCurrentPlayingSong({ track_name: file.name, artist_name: "Uploaded Audio" });
      } catch (error) {
        console.error("Error processing audio:", error);
      } finally {
        setIsParsingAudio(false);
      }
    }
  };

  const handleClear = () => {
    dispatch(clearRecommendations());
    setQuery("");
    setUploadedFile(null);
    setCurrentPlayingSong(null);
    setIsParsingAudio(false);
  };

  const handleSongSelect = async (songName: string) => {
    setQuery(songName);
    setUploadedFile(null);
    setResetDragTrigger((prev) => prev + 1);

    const result = await dispatch(fetchRecsBySongName(songName));

    if (result.meta.requestStatus === "fulfilled" && result.payload.recommendations?.length > 0) {
      setCurrentPlayingSong({
        track_name: result.payload.recommendations[0].track_name,
        artist_name: result.payload.recommendations[0].artist_name,
      });
    } else {
      setCurrentPlayingSong({
        track_name: songName,
        artist_name: "Unknown Artist",
      });
    }
  };

  const handleYouTubeSearch = (song: SongInfo) => {
    const searchQuery = `${song.track_name} ${song.artist_name}`;
    const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    window.open(youtubeUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-[300px_1fr_350px]">
      {/* Left Sidebar - Library */}
      <LibrarySidebar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSongSelect={handleSongSelect} />

      {/* Main Content */}
      <MainContent
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        onAudioUpload={handleAudioUpload}
        isParsingAudio={isParsingAudio}
        uploadedFile={uploadedFile}
        currentPlayingSong={currentPlayingSong}
        onYouTubeSearch={handleYouTubeSearch}
        queryFileName={queryFileName ?? ""}
        queryAudioFeatures={queryAudioFeatures}
        resetDragTrigger={resetDragTrigger}
      />

      {/* Right Sidebar - Recommendations */}
      <RecommendationsSidebar
        songs={songs}
        status={status}
        error={error ?? ""}
        currentPlayingSong={currentPlayingSong}
        onClear={handleClear}
        onYouTubeSearch={handleYouTubeSearch}
      />
    </div>
  );
}
