import { Card } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopicCardProps {
  topic: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    subSessions: any[];
  };
  type: 'foundation' | 'troubleshooting';
  source?: 'program' | 'foundations' | 'troubleshooting';
}

export function TopicCard({ topic, type, source }: TopicCardProps) {
  const navigate = useNavigate();
  
  // Get icon component
  const IconComponent = (LucideIcons as any)[topic.icon] || LucideIcons.BookOpen;
  
  // Calculate progress (TODO: Track actual completion)
  const completedCount = 0;
  const totalCount = topic.subSessions.length;

  const handleClick = () => {
    const url = `/training/${type}/${topic.id}/detail`;
    navigate(url);
  };

  return (
    <Card 
      onClick={handleClick}
      className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] aspect-[3/4]"
    >
      {/* Color bar at top */}
      <div className={`bg-gradient-to-br ${topic.color} h-2 w-full`} />

      {/* Card Content */}
      <div className="flex-1 flex flex-col p-3">
        {/* Icon Section */}
        <div className="flex-1 flex items-center justify-center py-2">
          <div className={`w-20 h-20 bg-gradient-to-br ${topic.color} rounded-2xl flex items-center justify-center shadow-sm`}>
            <IconComponent className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-1.5 text-center pb-1">
          <h3 className="font-bold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
            {topic.name}
          </h3>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>{completedCount}/{totalCount} completed</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
