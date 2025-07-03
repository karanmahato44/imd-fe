import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram";
import { Button } from "./ui/button";

interface WaveformVisualizerProps {
  audioFile: File;
}

export function WaveformVisualizer({ audioFile }: WaveformVisualizerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (waveformRef.current && audioFile) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#d1d5db",
        progressColor: "#1db954",
        height: 60,
        plugins: [
          Spectrogram.create({
            labels: true,
            height: 60,
            colorMap: "gray",
          }),
        ],
      });

      ws.loadBlob(audioFile);
      setWaveSurfer(ws);

      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));

      return () => ws.destroy();
    }
  }, [audioFile]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="h-4 w-4 text-[#1db954]" />
        <h3 className="font-semibold text-sm text-gray-900">Audio Visualization</h3>
      </div>
      <div ref={waveformRef} className="rounded-lg overflow-hidden bg-gray-100 mb-3" />
      {waveSurfer && (
        <div className="flex justify-center">
          <Button
            onClick={() => waveSurfer.playPause()}
            className="bg-[#1db954] hover:bg-[#1ed760] text-white font-semibold h-8 text-sm"
          >
            {isPlaying ? <Pause className="h-3 w-3 mr-2" /> : <Play className="h-3 w-3 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      )}
    </div>
  );
}
