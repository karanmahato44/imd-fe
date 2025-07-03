import { AudioLines } from "lucide-react";

import { FeatureChart } from "./FeatureChart";
import { Badge } from "./ui/badge";

interface QueryAnalysisPanelProps {
  fileName: string;
  features: any;
}

export function QueryAnalysisPanel({ fileName, features }: QueryAnalysisPanelProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AudioLines className="h-4 w-4 text-[#1db954]" />
        <h3 className="font-semibold text-sm text-gray-900">Audio Features</h3>
      </div>
      <Badge className="bg-[#1db954] text-white mb-3 text-xs">{fileName}</Badge>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <FeatureDisplay label="Tempo" value={`${features.tempo.toFixed(1)} BPM`} />
          <FeatureDisplay label="Energy" value={features.rms_energy.toFixed(3)} />
          <FeatureDisplay label="Timbre" value={`${features.spectral_centroid.toFixed(0)} Hz`} />
        </div>
        <div>
          <h4 className="font-medium text-center text-xs text-gray-600 mb-3">Chroma Profile</h4>
          <div className="h-32">
            <FeatureChart
              features={features.chroma}
              labels={["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureDisplay = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center p-2 rounded bg-gray-100">
    <div className="text-xs text-gray-600">{label}</div>
    <div className="font-semibold text-xs text-gray-900">{value}</div>
  </div>
);
