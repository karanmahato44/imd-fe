import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Interface Definitions ---

// Represents a single recommended song
interface Song {
  rank: number;
  track_name: string;
  artist_name: string;
  similarity_score?: number;
  genre?: string;
}

// Represents the features extracted from an uploaded audio file
interface AudioFeatures {
  tempo: number;
  spectral_centroid: number;
  rms_energy: number;
  chroma: number[];
  mfccs: number[];
}

// The complete shape of our Redux state for this slice
interface RecommendationsState {
  songs: Song[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  queryFileName: string | null;
  queryAudioFeatures: AudioFeatures | null;
}

// The initial state when the app loads
const initialState: RecommendationsState = {
  songs: [],
  status: "idle",
  error: null,
  queryFileName: null,
  queryAudioFeatures: null,
};

// --- Async Thunks for API Calls ---

export const fetchRecsBySongName = createAsyncThunk(
  "recommendations/fetchBySongName",
  async (songName: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/recommend/metadata`, {
        song_name: songName,
      });
      // The API returns the full response object, we pass it along
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to fetch recommendations");
    }
  }
);

export const fetchRecsByAudio = createAsyncThunk(
  "recommendations/fetchByAudio",
  async (file: File, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(`${API_BASE_URL}/recommend/audio`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // The API returns the full response object, we pass it along
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || "Failed to process audio file");
    }
  }
);

// --- Slice Definition ---

const recommendationsSlice = createSlice({
  name: "recommendations",
  initialState,
  // Standard reducers for direct state updates
  reducers: {
    clearRecommendations: (state) => {
      state.songs = [];
      state.status = "idle";
      state.error = null;
      state.queryFileName = null;
      state.queryAudioFeatures = null;
    },
  },
  // Reducers for handling the states of our async thunks
  extraReducers: (builder) => {
    builder
      // --- Metadata Search Cases ---
      .addCase(fetchRecsBySongName.pending, (state) => {
        state.status = "loading";
        state.error = null;
        // Clear previous audio-specific data when starting a new metadata search
        state.queryFileName = null;
        state.queryAudioFeatures = null;
      })
      .addCase(fetchRecsBySongName.fulfilled, (state, action: PayloadAction<{ recommendations: Song[] }>) => {
        state.status = "succeeded";
        state.songs = action.payload.recommendations;
      })
      .addCase(fetchRecsBySongName.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // --- Audio Upload Cases ---
      .addCase(fetchRecsByAudio.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        // Store the filename immediately for a better UX, so it can be displayed while loading
        state.queryFileName = (action.meta.arg as File).name;
        state.queryAudioFeatures = null;
      })
      .addCase(
        fetchRecsByAudio.fulfilled,
        (state, action: PayloadAction<{ recommendations: Song[]; query_audio_features: AudioFeatures }>) => {
          state.status = "succeeded";
          state.songs = action.payload.recommendations;
          state.queryAudioFeatures = action.payload.query_audio_features;
        }
      )
      .addCase(fetchRecsByAudio.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Export the action creator for clearing the state
export const { clearRecommendations } = recommendationsSlice.actions;

// Export the reducer to be used in the store
export default recommendationsSlice.reducer;
