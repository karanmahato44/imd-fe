import type { RecommendedSong, SongInfo } from "@/@types";
import { Music, Play } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SongListItemProps {
  song: RecommendedSong;
  onYouTubeSearch: (song: SongInfo) => void;
}

export function SongListItem({ song, onYouTubeSearch }: SongListItemProps) {
  return (
    <div className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-[#1db954]/30 hover:bg-gray-50 cursor-pointer group transition-all">
      <div className="w-8 h-8 bg-gray-200 rounded mr-3 flex items-center justify-center relative flex-shrink-0">
        <Music className="h-3 w-3 text-gray-500" />
        <div className="absolute -top-1 -left-1 bg-[#1db954] text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
          {song.rank}
        </div>
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-medium text-gray-900 truncate text-xs group-hover:text-[#1db954] transition-colors max-w-[35ch]">
          {song.track_name}
        </p>
        <p className="text-xs text-gray-500 truncate">{song.artist_name}</p>
        {song.similarity_score && (
          <div className="flex gap-2 items-center">
            <Badge className="bg-[#1db954]/10 text-[#1db954] border-[#1db954] text-xs mt-1 flex-shrink-0">
              {(song.similarity_score * 100).toFixed(0)}% match
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onYouTubeSearch(song);
                    }}
                    className="transition-opacity bg-red-600 hover:bg-red-700 h-6 w-6 p-0 rounded-full cursor-pointer flex-shrink-0"
                  >
                    <Play className="h-3 w-3 text-white" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Search on YouTube</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
