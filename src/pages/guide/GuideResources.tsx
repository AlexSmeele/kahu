import { ArrowLeft, FileText, CheckSquare, ExternalLink, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function GuideResources() {
  const navigate = useNavigate();

  const downloadChecklist = (title: string) => {
    // Generate simple text checklist
    let content = `${title}\n${'='.repeat(title.length)}\n\n`;
    
    if (title === "First Day Home Checklist") {
      content += `Before Your Dog Arrives:
□ Set up sleeping area with bed/crate
□ Prepare food and water bowls
□ Dog-proof your home
□ Buy initial food supply
□ Purchase collar, leash, ID tag
□ Set up secure outdoor area

On Arrival Day:
□ Keep environment calm and quiet
□ Show dog their designated areas
□ Offer small amount of food/water
□ Allow time to explore safely
□ Keep interactions gentle and positive
□ Establish feeding routine

First Week:
□ Schedule vet checkup
□ Begin house training routine
□ Start socialization (if vaccinated)
□ Establish daily schedule
□ Practice basic commands
□ Monitor eating and bathroom habits
□ Take lots of photos!`;
    } else if (title === "Puppy-Proofing Your Home") {
      content += `Indoor Safety:
□ Secure electrical cords and cables
□ Remove toxic plants (lilies, sago palm, etc.)
□ Lock away cleaning products and chemicals
□ Secure trash cans with lids
□ Remove small objects from floor
□ Block access to stairs initially
□ Protect furniture corners
□ Hide medications and vitamins
□ Secure loose rugs to prevent slipping
□ Cover or block pool access

Kitchen & Bathroom:
□ Lock cabinets containing toxins
□ Secure toilet lids
□ Keep human food out of reach
□ Store chocolate, grapes, onions safely
□ Block access to trash

Outdoor Safety:
□ Check fence for gaps/holes
□ Remove poisonous plants
□ Secure garden shed and chemicals
□ Ensure gates latch properly
□ Remove sharp objects
□ Create shaded area
□ Check for escape routes`;
    } else if (title === "Essential Supplies") {
      content += `Must-Have Items ($800-1,500 budget):

Feeding:
□ Food & water bowls ($20-50)
□ Age-appropriate dog food ($50-80)
□ Treats for training ($20-40)

Sleeping & Comfort:
□ Dog bed ($50-150)
□ Crate (if crate training) ($80-200)
□ Blankets ($20-40)

Walking & Training:
□ Collar with ID tag ($20-40)
□ Leash ($15-30)
□ Harness (optional) ($30-60)
□ Treat pouch ($10-20)
□ Clicker (if clicker training) ($5-10)

Grooming:
□ Brush appropriate for coat type ($15-40)
□ Dog shampoo ($10-20)
□ Nail clippers ($15-30)
□ Toothbrush & toothpaste ($15-25)

Toys & Enrichment:
□ Chew toys (variety) ($30-60)
□ Interactive puzzle toys ($20-40)
□ Tug toys ($10-20)
□ Balls ($10-20)

Safety & Health:
□ First aid kit ($40-80)
□ Flea/tick prevention ($30-60)
□ Waste bags & dispenser ($10-20)

Optional But Helpful:
□ Baby gates for managing access ($40-100)
□ Car safety harness/barrier ($30-80)
□ Slow-feeder bowl ($15-30)
□ Training mat/pad ($20-40)`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Checklist downloaded!");
  };

  const resources = [
    {
      category: "Downloadable Checklists",
      items: [
        { 
          title: "First Day Home Checklist", 
          description: "Everything you need for your dog's arrival",
          downloadable: true
        },
        { 
          title: "Puppy-Proofing Your Home", 
          description: "Safety measures and hazard removal",
          downloadable: true
        },
        { 
          title: "Essential Supplies", 
          description: "Complete shopping list for new dog owners",
          downloadable: true
        },
      ],
    },
    {
      category: "New Zealand Resources",
      items: [
        { 
          title: "SPCA New Zealand", 
          description: "Adopt a dog and learn about responsible pet ownership",
          url: "https://www.spca.nz/adopt",
          external: true 
        },
        { 
          title: "Companion Animals NZ", 
          description: "National body for companion animal welfare standards",
          url: "https://www.companionanimals.nz/",
          external: true 
        },
        { 
          title: "NZ Veterinary Association", 
          description: "Find accredited veterinarians near you",
          url: "https://www.nzva.org.nz/",
          external: true 
        },
        { 
          title: "Dog Safety NZ", 
          description: "Education and resources for safe dog ownership",
          url: "https://www.dogsafety.org.nz/",
          external: true 
        },
        { 
          title: "NZ Kennel Club", 
          description: "Breed information and responsible breeding",
          url: "https://www.dogsnz.org.nz/",
          external: true 
        },
      ],
    },
    {
      category: "Training & Behavior",
      items: [
        { 
          title: "Dogs NZ Training Resources", 
          description: "Training tips and finding certified trainers",
          url: "https://www.dogsnz.org.nz/home/training/",
          external: true 
        },
        { 
          title: "Positive Dog Training Methods", 
          description: "Science-based training approaches (Karen Pryor)",
          url: "https://www.clickertraining.com/",
          external: true 
        },
      ],
    },
    {
      category: "Health & Nutrition",
      items: [
        { 
          title: "Pet Poison Helpline", 
          description: "24/7 emergency poison information (international)",
          url: "https://www.petpoisonhelpline.com/",
          external: true 
        },
        { 
          title: "Dog Food Advisor", 
          description: "Independent dog food reviews and recalls",
          url: "https://www.dogfoodadvisor.com/",
          external: true 
        },
      ],
    },
  ];

  return (
    <main className="content-frame bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b safe-top">
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
                  <Card 
                    key={item.title} 
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (item.downloadable) {
                        downloadChecklist(item.title);
                      } else if (item.url) {
                        window.open(item.url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {item.downloadable ? (
                          <Download className="w-5 h-5 text-primary" />
                        ) : item.external ? (
                          <ExternalLink className="w-5 h-5 text-primary" />
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
