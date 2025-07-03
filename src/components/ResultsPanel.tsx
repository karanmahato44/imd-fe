import type { RecommendedSong, SongInfo } from "@/@types";
import { SongListItem } from "./SongListItem";
import { StatusDisplay } from "./StatusDisplay";

interface ResultsPanelProps {
  songs: RecommendedSong[];
  status: string;
  error: string;
  onYouTubeSearch: (song: SongInfo) => void;
}

export function ResultsPanel({ songs, status, error, onYouTubeSearch }: ResultsPanelProps) {
  return (
    <div>
      {status === "loading" && <StatusDisplay icon="🎵" text="Finding matches..." />}
      {status === "failed" && <StatusDisplay icon="🎭" text={`Error: ${error}`} />}
      {status === "idle" && <StatusDisplay icon="🎶" text="Ready to discover music?" />}
      {status === "succeeded" && songs.length === 0 && <StatusDisplay icon="🔍" text="No matches found" />}
      {status === "succeeded" && songs.length > 0 && (
        <div className="space-y-1">
          {songs.map((song: RecommendedSong) => (
            <SongListItem key={song.rank} song={song} onYouTubeSearch={onYouTubeSearch} />
          ))}
        </div>
      )}
    </div>
  );
}
