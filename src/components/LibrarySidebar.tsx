import type { SongInfo } from "@/@types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Music, Search, Sparkles, User } from "lucide-react";
import { useMemo } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

interface LibrarySidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSongSelect: (songName: string) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const API_BASE_URL = "https://imd-be.onrender.com/api/v1";

function useFilteredSongs(songs: SongInfo[], searchQuery: string, limit: number = 50) {
  const debouncedQuery = useDebounce(searchQuery, 300);

  return useMemo(() => {
    if (!debouncedQuery.trim()) {
      return songs.slice(0, limit);
    }

    const query = debouncedQuery.toLowerCase();
    return songs
      .filter((song) => song.track_name.toLowerCase().includes(query) || song.artist_name.toLowerCase().includes(query))
      .slice(0, limit);
  }, [songs, debouncedQuery, limit]);
}

export function LibrarySidebar({ searchQuery, setSearchQuery, onSongSelect }: LibrarySidebarProps) {
  // Fetch all songs with React Query
  const {
    data: songList = [],
    isLoading: songsLoading,
    error: songsError,
  } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/songs`);
      return response.data as SongInfo[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - songs don't change often
  });

  // Get filtered songs with debouncing
  const filteredSongs = useFilteredSongs(songList, searchQuery, 10000);

  return (
    <div className="bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex justify-between p-3">
        <div className="flex gap-2 items-center">
          <Sparkles className="size-4 text-green-500" />
          <h1 className="text-xs font-semibold text-gray-900">Intelligent Music Discovery</h1>
        </div>

        <div className="">
          <User className="size-4 flex-shrink-0" />
        </div>
      </div>
      <Separator className="bg-gray-200" />

      {/* Search Input for Library */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-7 bg-white border-gray-200 text-gray-900 placeholder-gray-400 text-xs"
            placeholder="Filter library..."
          />
        </div>
      </div>

      {/* Library Section */}
      <div className="flex-1 overflow-hidden">
        <div className="p-1">
          <h2 className="font-semibold text-xs mb-2 text-gray-600">
            YOUR LIBRARY ({filteredSongs.length.toLocaleString()})
          </h2>
          <ScrollArea className="h-[calc(100vh-7.5rem)] pr-1">
            <div className="space-y-2">
              {songsLoading ? (
                // Loading skeleton
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center p-2 rounded-lg border border-gray-200">
                    <Skeleton className="w-8 h-8 rounded mr-2" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-2 w-1/2" />
                    </div>
                  </div>
                ))
              ) : songsError ? (
                <div className="text-center py-6">
                  <Music className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <p className="text-red-500 text-xs">Error loading songs</p>
                </div>
              ) : filteredSongs.length > 0 ? (
                filteredSongs?.map((song: SongInfo) => (
                  <div
                    key={`${song.track_name}-${song.artist_name}`}
                    onClick={() => onSongSelect(song.track_name)}
                    className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-[#1db954]/30 hover:bg-gray-50 cursor-pointer group transition-all"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded mr-2 flex items-center justify-center flex-shrink-0">
                      <Music className="h-3 w-3 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p
                        className="font-medium text-gray-900 text-xs group-hover:text-[#1db954] transition-colors leading-tight mb-0.5"
                        title={song.track_name}
                      >
                        {song.track_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate leading-tight" title={song.artist_name}>
                        {song.artist_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-6">
                  <Search className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No songs found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Music className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">No songs available</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
