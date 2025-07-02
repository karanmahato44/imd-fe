/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, type ChangeEvent } from "react";
import axios from "axios";
import { fetchRecsBySongName, fetchRecsByAudio, clearRecommendations } from "./redux/features/recommendationsSlice";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import { Radar } from "react-chartjs-2";

// Register Chart.js components we'll use for the radar chart
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// --- Type Definitions ---
interface SongInfo {
  track_name: string;
  artist_name: string;
}

interface RecommendedSong extends SongInfo {
  rank: number;
  similarity_score?: number; // Optional, as it might not always be present
  genre?: string;
}

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

// --- Main App Component ---
function App() {
  const [query, setQuery] = useState("");
  const [songList, setSongList] = useState<SongInfo[]>([]);
  const dispatch = useAppDispatch();
  const { songs, status, error, queryFileName, queryAudioFeatures } = useAppSelector((state) => state.recommendations);

  useEffect(() => {
    // Fetch the list of songs for the library and search suggestions on initial load
    axios.get(`${API_BASE_URL}/songs`).then((response) => {
      setSongList(response.data);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      dispatch(fetchRecsBySongName(query));
    }
  };

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      dispatch(fetchRecsByAudio(file));
    }
  };

  const handleClear = () => {
    dispatch(clearRecommendations());
    setQuery("");
  };

  const handleSongSelect = (songName: string) => {
    setQuery(songName);
    dispatch(fetchRecsBySongName(songName));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-black text-gray-900">Intelligent Music Discovery</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- Left Column: Main Content --- */}
          <div className="lg:col-span-2 space-y-6">
            <ControlPanel
              onSearch={handleSearch}
              onAudioUpload={handleAudioUpload}
              query={query}
              setQuery={setQuery}
              songList={songList}
            />
            {queryAudioFeatures && queryFileName && (
              <QueryAnalysisPanel fileName={queryFileName} features={queryAudioFeatures} />
            )}
            <ResultsPanel songs={songs} status={status} error={error} onClear={handleClear} />
          </div>

          {/* --- Right Column: Song Library --- */}
          <div className="lg:col-span-1">
            <SongLibraryPanel songList={songList} onSongSelect={handleSongSelect} />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Sub-Components for a Cleaner Structure ---

const ControlPanel = ({ onSearch, onAudioUpload, query, setQuery, songList }: any) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const syntheticEvent = { target: { files: e.dataTransfer.files } } as unknown as ChangeEvent<HTMLInputElement>;
      onAudioUpload(syntheticEvent);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={onSearch} className="space-y-3">
          <label htmlFor="song-search" className="text-lg font-bold text-gray-800">
            Search by Song
          </label>
          <div className="relative">
            <input
              id="song-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              list="song-suggestions"
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search for a song..."
            />
            <datalist id="song-suggestions">
              {songList.map((song: SongInfo) => (
                <option key={song.track_name} value={song.track_name} />
              ))}
            </datalist>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors active:scale-95"
          >
            Get Recommendations
          </button>
        </form>
        <div>
          <label className="text-lg font-bold text-gray-800 mb-3 block">Upload Audio</label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-green-400"}`}
          >
            <label htmlFor="audio-upload" className="cursor-pointer text-green-600 hover:text-green-700 font-semibold">
              Choose an MP3 file
            </label>
            <p className="text-gray-500 text-xs mt-1">or drag and drop</p>
            <input id="audio-upload" type="file" accept=".mp3,.wav,.flac" onChange={onAudioUpload} className="hidden" />
          </div>
        </div>
      </div>
    </div>
  );
};

const QueryAnalysisPanel = ({ fileName, features }: { fileName: string; features: any }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <h2 className="text-xl font-bold text-gray-800 mb-4">
      Analysis for: <span className="text-green-600 font-mono text-base align-middle">{fileName}</span>
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="space-y-2">
        <FeatureDisplay label="Tempo" value={`${features.tempo.toFixed(1)} BPM`} />
        <FeatureDisplay label="Energy (RMS)" value={features.rms_energy.toFixed(3)} />
        <FeatureDisplay label="Spectral Centroid" value={`${features.spectral_centroid.toFixed(0)} Hz`} />
      </div>
      <div>
        <h3 className="font-semibold text-center text-sm text-gray-600 mb-2">Chroma Features (Pitch Class Profile)</h3>
        <div className="h-48 w-full">
          <FeatureChart
            features={features.chroma}
            labels={["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]}
          />
        </div>
      </div>
    </div>
  </div>
);

const FeatureDisplay = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
    <p className="font-medium text-gray-600 text-sm">{label}</p>
    <p className="font-bold text-gray-800">{value}</p>
  </div>
);

const FeatureChart = ({ features, labels }: { features: number[]; labels: string[] }) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Strength",
        data: features,
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
        pointBorderColor: "#fff",
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { r: { angleLines: { display: false }, suggestedMin: 0, ticks: { display: false } } },
    plugins: { legend: { display: false } },
  };
  return <Radar data={data} options={options} />;
};

const ResultsPanel = ({ songs, status, error, onClear }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
    <div className="flex justify-between items-center p-6 border-b border-gray-100">
      <h2 className="text-xl font-bold text-gray-800">Recommendations</h2>
      {songs.length > 0 && (
        <button onClick={onClear} className="text-sm text-gray-500 hover:text-gray-700 font-medium">
          Clear
        </button>
      )}
    </div>
    <div className="p-6 min-h-[300px] flex flex-col justify-center">
      {status === "loading" && <StatusDisplay icon="⏳" text="Finding recommendations..." />}
      {status === "failed" && (
        <StatusDisplay icon="😕" text={`Something went wrong: ${error}`} textColor="text-red-600" />
      )}
      {status === "idle" && <StatusDisplay icon="🎶" text="Search for a song or upload audio to get started" />}
      {status === "succeeded" && songs.length === 0 && <StatusDisplay icon="🔍" text="No recommendations found." />}
      {status === "succeeded" && songs.length > 0 && (
        <div className="space-y-2">
          {songs.map((song: RecommendedSong) => (
            <SongItem key={song.rank} song={song} />
          ))}
        </div>
      )}
    </div>
  </div>
);

const SongLibraryPanel = ({ songList, onSongSelect }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm lg:sticky lg:top-24">
    <h2 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-100">Song Library</h2>
    <div className="max-h-[75vh] overflow-y-auto p-4 space-y-1">
      {songList.length > 0 ? (
        songList.map((song: SongInfo) => (
          <div
            key={song.track_name}
            onClick={() => onSongSelect(song.track_name)}
            className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-md mr-3 flex items-center justify-center text-gray-500 text-xs">
              ♪
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm text-gray-800 truncate">{song.track_name}</p>
              <p className="text-xs text-gray-500 truncate">{song.artist_name}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-gray-500 text-sm">Loading library...</div>
      )}
    </div>
  </div>
);

const StatusDisplay = ({ icon, text, textColor = "text-gray-600" }: any) => (
  <div className="text-center py-10">
    <div className="text-5xl mb-4">{icon}</div>
    <p className={`font-medium ${textColor}`}>{text}</p>
  </div>
);

const SongItem = ({ song }: { song: RecommendedSong }) => (
  <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group">
    <div className="w-8 text-gray-400 font-medium text-center">{song.rank}</div>
    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mx-4 flex items-center justify-center">
      <span className="text-white text-lg">♪</span>
    </div>
    <div className="flex-1 overflow-hidden">
      <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors truncate">
        {song.track_name}
      </h3>
      <p className="text-gray-600 text-sm truncate">{song.artist_name}</p>
    </div>
    {song.similarity_score && (
      <div className="text-sm font-bold text-gray-500 w-20 text-right">{(song.similarity_score * 100).toFixed(1)}%</div>
    )}
    <button className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ml-4 flex-shrink-0">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 4.29a.75.75 0 011.06 0l5.5 5.25a.75.75 0 010 1.06l-5.5 5.25a.75.75 0 01-1.06-1.06L11.22 10 6.3 5.35a.75.75 0 010-1.06z"></path>
      </svg>
    </button>
  </div>
);

export default App;
