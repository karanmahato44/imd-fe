import type { RecommendedSong, SongInfo } from "@/@types";
import { X } from "lucide-react";
import { ResultsPanel } from "./ResultsPanel";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

interface RecommendationsSidebarProps {
  songs: RecommendedSong[];
  status: string;
  error: string;
  currentPlayingSong: SongInfo | null;
  onClear: () => void;
  onYouTubeSearch: (song: SongInfo) => void;
}

export function RecommendationsSidebar({
  songs,
  status,
  error,
  currentPlayingSong,
  onClear,
  onYouTubeSearch,
}: RecommendationsSidebarProps) {
  const getRecommendationTitle = () => {
    if (currentPlayingSong) {
      return `Top Recommendations for "${currentPlayingSong.track_name}"`;
    }
    return "Top 10 Recommendations";
  };

  return (
    <div className="bg-gray-50  border-gray-200 flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-gray-900 truncate">{getRecommendationTitle()}</h2>
        {songs.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="cursor-pointer !p-1 size-fit">
            <X className="size-4 flex-shrink-0" />
          </Button>
        )}
      </div>
      <Separator className="bg-gray-200" />
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-3.5rem)] p-2">
          <ResultsPanel songs={songs} status={status} error={error} onYouTubeSearch={onYouTubeSearch} />
        </ScrollArea>
      </div>
    </div>
  );
}
