import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SocialCardProps {
  className?: string;
}

export const SocialCard = ({ className = "" }: SocialCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={`p-4 cursor-pointer hover:bg-accent transition-all hover:scale-[1.02] border rounded-2xl ${className}`}
      onClick={() => navigate('/social')}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-base text-foreground">Social</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Connect with other pet parents
          </p>
        </div>
      </div>
    </Card>
  );
};
