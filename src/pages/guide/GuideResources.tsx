import { ArrowLeft, FileText, CheckSquare, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GuideResources() {
  const navigate = useNavigate();

  const resources = [
    {
      category: "Checklists",
      items: [
        { title: "First Day Home Checklist", description: "Everything you need for your dog's arrival" },
        { title: "Puppy-Proofing Your Home", description: "Safety measures and hazard removal" },
        { title: "Essential Supplies", description: "Complete shopping list for new dog owners" },
      ],
    },
    {
      category: "Articles & Guides",
      items: [
        { title: "Choosing the Right Breed", description: "Match your lifestyle with the perfect dog" },
        { title: "Understanding Dog Behavior", description: "Reading body language and communication" },
        { title: "Training Fundamentals", description: "Building a strong foundation" },
      ],
    },
    {
      category: "External Resources",
      items: [
        { title: "SPCA New Zealand", description: "Adoption and animal welfare", external: true },
        { title: "Companion Animals NZ", description: "Pet care standards", external: true },
        { title: "Veterinary Council NZ", description: "Find accredited vets", external: true },
      ],
    },
  ];

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/guide/modules')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Resources</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto pb-24">
        <div className="mb-6">
          <h2 className="font-bold text-2xl mb-2">Additional Resources</h2>
          <p className="text-muted-foreground">
            Helpful checklists, guides, and external resources to support your dog ownership journey.
          </p>
        </div>

        <div className="space-y-6">
          {resources.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-lg mb-3">{section.category}</h3>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <Card key={item.title} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {item.external ? (
                          <ExternalLink className="w-5 h-5 text-primary" />
                        ) : section.category === "Checklists" ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <FileText className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      {item.external && (
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
