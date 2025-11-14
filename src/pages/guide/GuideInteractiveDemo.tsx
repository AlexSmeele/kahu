import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CostCalculator } from "@/components/guide/lessons/CostCalculator";
import { DragDropHazards } from "@/components/guide/lessons/DragDropHazards";
import { BodyLanguageInspector } from "@/components/guide/lessons/BodyLanguageInspector";
import { ScenarioEngine } from "@/components/guide/lessons/ScenarioEngine";

export default function GuideInteractiveDemo() {
  const navigate = useNavigate();

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Interactive Lessons</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto pb-24">
        <div className="mb-6 text-center">
          <h2 className="font-bold text-2xl mb-2">Try Our Interactive Learning Tools</h2>
          <p className="text-muted-foreground">
            Experience hands-on lessons that make learning about dog ownership engaging and practical.
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="hazards">Hazards</TabsTrigger>
            <TabsTrigger value="body">Body Lang.</TabsTrigger>
            <TabsTrigger value="scenario">Scenario</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">
            <CostCalculator />
          </TabsContent>

          <TabsContent value="hazards">
            <DragDropHazards />
          </TabsContent>

          <TabsContent value="body">
            <BodyLanguageInspector />
          </TabsContent>

          <TabsContent value="scenario">
            <ScenarioEngine />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
