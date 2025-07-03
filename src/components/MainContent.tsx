import type { SongInfo } from "@/@types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader, Music, Play, PlayCircle, Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { ControlPanel } from "./ControlPanel";
import { QueryAnalysisPanel } from "./QueryAnalysisPanel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { WaveformVisualizer } from "./WaveformVisualizer";

// ... your interfaces stay the same ...
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
  resetDragTrigger: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE_URL = "https://imd-be.onrender.com/api/v1";

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
  resetDragTrigger,
}: MainContentProps) {
  const [progress, setProgress] = useState(0);
  const [parseStartTime, setParseStartTime] = useState<number | null>(null);

  // Dynamic progress tracking
  useEffect(() => {
    if (isParsingAudio) {
      const startTime = Date.now();
      setParseStartTime(startTime);
      setProgress(0);

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        const estimatedTotalTime = 10000; // 10 seconds estimate

        // Calculate progress with some smart scaling
        let newProgress;
        if (elapsed < estimatedTotalTime * 0.8) {
          // First 80% of estimated time - linear progress
          newProgress = (elapsed / estimatedTotalTime) * 80;
        } else if (elapsed < estimatedTotalTime * 1.5) {
          // Next phase - slower progress
          newProgress = 80 + ((elapsed - estimatedTotalTime * 0.8) / (estimatedTotalTime * 0.7)) * 15;
        } else {
          // Final phase - very slow progress, max 95%
          newProgress = Math.min(95, 95 + ((elapsed - estimatedTotalTime * 1.5) / (estimatedTotalTime * 2)) * 5);
        }

        setProgress(Math.min(95, newProgress)); // Cap at 95% until actually done
      }, 200);

      return () => clearInterval(interval);
    } else {
      // When parsing is done, quickly complete the progress bar
      if (parseStartTime) {
        setProgress(100);
        const completeTimeout = setTimeout(() => {
          setProgress(0);
          setParseStartTime(null);
        }, 500);
        return () => clearTimeout(completeTimeout);
      }
    }
  }, [isParsingAudio, parseStartTime]);

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
    <div className="flex flex-col border-r border-gray-200 h-[100vh]">
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
      <main className="flex-1 overflow-y-autoy bg-white flex flex-col justify-between ">
        <div className="w-full">
          <div className="p-4 space-y-4">
            {/* Discovery Section */}
            <ControlPanel onAudioUpload={onAudioUpload} isParsingAudio={isParsingAudio} key={resetDragTrigger} />

            {/* Audio Parsing Loader */}
            {isParsingAudio && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader className="size-4 flex-shrink-0 animate-spin rounded-full text-green-600" />
                  <div>
                    <h3 className="font-semibold text-sm text-green-900">Analyzing Audio Features</h3>
                    <p className="text-xs text-green-700">Extracting tempo, energy, chroma, and spectral features...</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-green-700">
                    <span>Processing audio file</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-2 bg-green-200 [&>div]:bg-green-600 [&>div]:transition-all [&>div]:duration-300"
                  />
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
          </div>
        </div>

        {/* Now Playing Bar */}
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
      </main>
    </div>
  );
}
