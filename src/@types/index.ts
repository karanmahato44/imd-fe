export interface SongInfo {
  track_name: string;
  artist_name: string;
}

export interface RecommendedSong extends SongInfo {
  rank: number;
  similarity_score?: number;
  genre?: string;
}
