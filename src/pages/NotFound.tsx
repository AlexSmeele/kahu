import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReportBugModal } from "@/components/modals/ReportBugModal";

const NotFound = () => {
  const location = useLocation();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-glass flex items-center justify-center">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            We couldn't find that page
          </h1>
          <p className="text-muted-foreground">
            Don't worry - it happens! The page you're looking for might have been moved or doesn't exist.
          </p>
        </div>

        {/* Route Display */}
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">You tried to visit:</p>
          <p className="font-mono text-sm text-foreground break-all">
            {location.pathname}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" size="lg" className="w-full">
              Return Home
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsReportModalOpen(true)}
            className="w-full"
          >
            Report Bug
          </Button>
        </div>
      </Card>

      <ReportBugModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        attemptedRoute={location.pathname}
      />
    </div>
  );
};

export default NotFound;
