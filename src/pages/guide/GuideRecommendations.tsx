import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, Heart } from "lucide-react";
import { useBreedRecommendations } from "@/hooks/useBreedRecommendations";
import { BreedRecommendationCard } from "@/components/guide/recommendations/BreedRecommendationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GuideRecommendations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get('profile_id');
  const [hasGenerated, setHasGenerated] = useState(false);

  const {
    recommendations,
    loading,
    generating,
    generateRecommendations,
    toggleShortlist,
  } = useBreedRecommendations(profileId || undefined);

  useEffect(() => {
    // Auto-generate recommendations if none exist and we have a profile ID
    if (profileId && !loading && recommendations.length === 0 && !hasGenerated) {
      setHasGenerated(true);
      generateRecommendations(profileId);
    }
  }, [profileId, loading, recommendations.length, hasGenerated]);

  const shortlistedBreeds = recommendations.filter(r => r.shortlisted);
  const topRecommendations = recommendations.slice(0, 3);

  if (generating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Lifestyle</h2>
            <p className="text-muted-foreground">
              Our AI is finding the perfect dog breeds for you...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/guide/modules')}
          >
            <ArrowLeft />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Your Breed Recommendations</h1>
            <p className="text-muted-foreground">
              Based on your lifestyle profile and preferences
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-bold mb-2">No Recommendations Yet</h2>
              <p className="text-muted-foreground mb-4">
                Complete your lifestyle profile to get personalized breed recommendations
              </p>
              <Button onClick={() => navigate('/guide/onboarding')}>
                Complete Profile
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All Recommendations ({recommendations.length})
              </TabsTrigger>
              <TabsTrigger value="shortlist">
                Shortlist ({shortlistedBreeds.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {topRecommendations.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Top Matches for You
                  </h2>
                  <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                    {topRecommendations.map((rec) => (
                      <BreedRecommendationCard
                        key={rec.id}
                        breedName={rec.breed_name}
                        matchScore={rec.match_score}
                        reasoning={rec.reasoning}
                        considerations={rec.considerations}
                        rank={rec.rank}
                        shortlisted={rec.shortlisted}
                        onToggleShortlist={() => toggleShortlist(rec.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {recommendations.length > 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Other Good Matches</h2>
                  <div className="grid gap-4">
                    {recommendations.slice(3).map((rec) => (
                      <BreedRecommendationCard
                        key={rec.id}
                        breedName={rec.breed_name}
                        matchScore={rec.match_score}
                        reasoning={rec.reasoning}
                        considerations={rec.considerations}
                        rank={rec.rank}
                        shortlisted={rec.shortlisted}
                        onToggleShortlist={() => toggleShortlist(rec.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="shortlist" className="space-y-4">
              {shortlistedBreeds.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Shortlisted Breeds</h3>
                  <p className="text-muted-foreground">
                    Add breeds to your shortlist to compare them later
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {shortlistedBreeds.map((rec) => (
                    <BreedRecommendationCard
                      key={rec.id}
                      breedName={rec.breed_name}
                      matchScore={rec.match_score}
                      reasoning={rec.reasoning}
                      considerations={rec.considerations}
                      rank={rec.rank}
                      shortlisted={rec.shortlisted}
                      onToggleShortlist={() => toggleShortlist(rec.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/guide/modules')}
          >
            Continue Learning
          </Button>
          {recommendations.length > 0 && (
            <Button
              className="flex-1"
              onClick={() => navigate('/guide/onboarding')}
            >
              Update Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
