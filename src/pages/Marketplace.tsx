import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketplaceScreen } from '@/components/screens/MarketplaceScreen';

export default function Marketplace() {
  const navigate = useNavigate();

  return (
    <div className="content-frame bg-background safe-top">
      <div className="sticky top-0 z-10 bg-background border-b safe-top">
        <div className="container py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Marketplace</h1>
        </div>
      </div>
      <MarketplaceScreen />
    </div>
  );
}
