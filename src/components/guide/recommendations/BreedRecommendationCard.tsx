import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Info } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BreedRecommendationCardProps {
  breedName: string;
  matchScore: number;
  reasoning: string;
  considerations: string;
  rank: number;
  shortlisted: boolean;
  onToggleShortlist: () => void;
}

export function BreedRecommendationCard({
  breedName,
  matchScore,
  reasoning,
  considerations,
  rank,
  shortlisted,
  onToggleShortlist,
}: BreedRecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                #{rank}
              </Badge>
              <h3 className="text-xl font-bold">{breedName}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-24 rounded-full ${getScoreColor(matchScore)}`}>
                <div
                  className="h-full bg-white/30 rounded-full"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{matchScore}% Match</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleShortlist}
            className={shortlisted ? "text-red-500" : ""}
          >
            <Heart className={shortlisted ? "fill-current" : ""} />
          </Button>
        </div>

        <p className="text-muted-foreground text-sm mb-4">{reasoning}</p>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowDetails(true)}
        >
          <Info className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{breedName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">Match Score</h4>
                <span className="text-2xl font-bold text-primary">{matchScore}%</span>
              </div>
              <div className={`h-3 w-full rounded-full ${getScoreColor(matchScore)}`}>
                <div
                  className="h-full bg-white/30 rounded-full transition-all"
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Why this breed?</h4>
              <p className="text-muted-foreground">{reasoning}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Important Considerations</h4>
              <p className="text-muted-foreground">{considerations}</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant={shortlisted ? "default" : "outline"}
                className="flex-1"
                onClick={onToggleShortlist}
              >
                <Heart className={shortlisted ? "fill-current mr-2" : "mr-2"} />
                {shortlisted ? "Shortlisted" : "Add to Shortlist"}
              </Button>
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
