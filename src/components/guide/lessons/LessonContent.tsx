import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, Info } from "lucide-react";

interface LessonContentProps {
  content: {
    body?: string;
    keyTakeaway?: string;
    lifeStageNotes?: {
      puppy?: string;
      adult?: string;
      senior?: string;
    };
    tips?: string[];
    warnings?: string[];
  };
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <div className="space-y-6">
      {/* Main Content */}
      {content.body && (
        <Card className="p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content.body }} />
          </div>
        </Card>
      )}

      {/* Key Takeaway */}
      {content.keyTakeaway && (
        <Alert className="bg-primary/5 border-primary/20">
          <Lightbulb className="h-4 w-4 text-primary" />
          <AlertDescription>
            <p className="font-semibold mb-1">Key Takeaway</p>
            <p className="text-sm">{content.keyTakeaway}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Tips */}
      {content.tips && content.tips.length > 0 && (
        <Card className="p-6 bg-muted/30">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Helpful Tips
          </h4>
          <ul className="space-y-2">
            {content.tips.map((tip, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Life Stage Notes */}
      {content.lifeStageNotes && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Life Stage Considerations</h4>
          <div className="space-y-3">
            {content.lifeStageNotes.puppy && (
              <div>
                <p className="font-medium text-sm mb-1">🐕 Puppies (0-1 year)</p>
                <p className="text-sm text-muted-foreground">{content.lifeStageNotes.puppy}</p>
              </div>
            )}
            {content.lifeStageNotes.adult && (
              <div>
                <p className="font-medium text-sm mb-1">🐕‍🦺 Adults (1-7 years)</p>
                <p className="text-sm text-muted-foreground">{content.lifeStageNotes.adult}</p>
              </div>
            )}
            {content.lifeStageNotes.senior && (
              <div>
                <p className="font-medium text-sm mb-1">🦮 Seniors (7+ years)</p>
                <p className="text-sm text-muted-foreground">{content.lifeStageNotes.senior}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Warnings */}
      {content.warnings && content.warnings.length > 0 && (
        <Alert variant="destructive" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900">
          <AlertDescription>
            <p className="font-semibold mb-2">⚠️ Important Warnings</p>
            <ul className="space-y-1">
              {content.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
