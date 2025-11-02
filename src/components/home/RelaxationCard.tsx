import { Card } from '@/components/ui/card';
import { Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RelaxationCardProps {
  className?: string;
}

export const RelaxationCard = ({ className = "" }: RelaxationCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={`p-4 cursor-pointer hover:bg-accent transition-all hover:scale-[1.02] border rounded-2xl ${className}`}
      onClick={() => navigate('/relaxation')}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-base text-foreground">Relaxation</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Calming sounds & techniques
          </p>
        </div>
      </div>
    </Card>
  );
};
