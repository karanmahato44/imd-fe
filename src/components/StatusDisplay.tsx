import { Skeleton } from "./ui/skeleton";

interface StatusDisplayProps {
  icon: string;
  text: string;
}

export function StatusDisplay({ icon, text }: StatusDisplayProps) {
  // Show skeleton for loading state
  if (icon === "🎵" && text === "Finding matches...") {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center p-2 rounded">
            <Skeleton className="w-8 h-8 rounded mr-3" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default status display for other states
  return (
    <div className="text-center py-8">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-gray-600 text-xs">{text}</p>
    </div>
  );
}
