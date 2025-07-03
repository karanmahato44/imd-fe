import type { SongInfo } from "@/@types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Music, Play, PlayCircle, Search } from "lucide-react";
import React, { useMemo } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { ControlPanel } from "./ControlPanel";
import { QueryAnalysisPanel } from "./QueryAnalysisPanel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface MainContentProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isParsingAudio: boolean;
  uploadedFile: File | null;
  currentPlayingSong: SongInfo | null;
  onYouTubeSearch: (song: SongInfo) => void;
  queryFileName: string;
  queryAudioFeatures: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function MainContent({
  query,
  setQuery,
  onSearch,
  onAudioUpload,
  isParsingAudio,
  uploadedFile,
  currentPlayingSong,
  onYouTubeSearch,
  queryFileName,
  queryAudioFeatures,
}: MainContentProps) {
  // Fetch all songs for search suggestions
  const { data: songList = [] } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/songs`);
      return response.data as SongInfo[];
    },
    staleTime: 30 * 60 * 1000,
  });

  // Debounced search suggestions
  const debouncedQuery = useDebounce(query, 200);
  const searchSuggestions = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      return [];
    }

    const queryLower = debouncedQuery.toLowerCase();
    return songList
      .filter(
        (song) =>
          song.track_name.toLowerCase().includes(queryLower) || song.artist_name.toLowerCase().includes(queryLower)
      )
      .slice(0, 10);
  }, [songList, debouncedQuery]);

  return (
    <div className="flex flex-col border-r border-gray-200 h-full">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-gray-500" />
          <div className="relative flex-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              list="song-suggestions"
              className="flex-1 h-8 bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-[#1db954] text-sm"
              placeholder="Search songs, albums, artists"
            />
            <datalist id="song-suggestions">
              {searchSuggestions.map((song: SongInfo) => (
                <option key={`${song.track_name}-${song.artist_name}`} value={song.track_name} />
              ))}
            </datalist>
          </div>
          <form onSubmit={onSearch} className="">
            <Button
              type="submit"
              disabled={!query.trim()}
              className="w-full bg-[#1db954] hover:bg-[#1ed760] text-white font-semibold h-8 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlayCircle className="h-3 w-3 mr-2" />
              Get Recommendations
            </Button>
          </form>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="p-4 space-y-4">
          {/* Discovery Section */}
          <ControlPanel onAudioUpload={onAudioUpload} isParsingAudio={isParsingAudio} />

          {/* Audio Parsing Loader */}
          {isParsingAudio && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                <div>
                  <h3 className="font-semibold text-sm text-green-900">Analyzing Audio Features</h3>
                  <p className="text-xs text-green-700">Extracting tempo, energy, chroma, and spectral features...</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs text-green-700">
                  <span>Processing audio file</span>
                  <span>Please wait...</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Audio Analysis Section */}
          {(uploadedFile || (queryAudioFeatures && queryFileName)) && !isParsingAudio && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {uploadedFile && <WaveformVisualizer audioFile={uploadedFile} />}
              {queryAudioFeatures && queryFileName && (
                <QueryAnalysisPanel fileName={queryFileName} features={queryAudioFeatures} />
              )}
            </div>
          )}

          {/* Add bottom padding to prevent content from being hidden behind the now playing bar */}
          {currentPlayingSong && <div className="h-20" />}
        </div>
      </main>

      {/* Now Playing Bar - Sticky Bottom */}
      {currentPlayingSong && (
        <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate max-w-[50ch] text-sm">
                  {currentPlayingSong.track_name}
                </p>
                <p className="text-sm text-gray-500 truncate">{currentPlayingSong.artist_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() =>
                      onYouTubeSearch(
                        currentPlayingSong?.artist_name?.trim()?.toLowerCase() === "uploaded audio"
                          ? {
                              track_name: currentPlayingSong?.track_name?.split(".")?.[0],
                              artist_name: "",
                            }
                          : currentPlayingSong
                      )
                    }
                    className="bg-red-600 hover:bg-red-700 text-white h-8 text-sm cursor-pointer"
                  >
                    <Play className="h-3 w-3 mr-2" />
                    YouTube
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search on YouTube</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
