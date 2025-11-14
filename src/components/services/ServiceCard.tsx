import { MapPin, Phone, Globe, Star, Edit2, Trash2, StarOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ServiceCardProps {
  name: string;
  businessName?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  isPreferred?: boolean;
  specialties?: string[];
  services?: string[];
  onSetPreferred?: () => void;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function ServiceCard({
  name,
  businessName,
  address,
  phone,
  website,
  rating,
  userRatingsTotal,
  isPreferred,
  specialties,
  services,
  onSetPreferred,
  onEdit,
  onRemove,
}: ServiceCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-base">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground">{businessName || name}</h3>
              {isPreferred && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Preferred
                </Badge>
              )}
            </div>
            {businessName && name !== businessName && (
              <p className="text-sm text-muted-foreground">{name}</p>
            )}
            {rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                {userRatingsTotal && (
                  <span className="text-xs text-muted-foreground">({userRatingsTotal})</span>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {!isPreferred && onSetPreferred && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSetPreferred}
                className="h-8 w-8"
                title="Set as preferred"
              >
                <StarOff className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="h-8 w-8"
                title="Edit details"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{address}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <a href={`tel:${phone}`} className="hover:text-foreground transition-colors">
                {phone}
              </a>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <a 
                href={website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors truncate"
              >
                {website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {((specialties && specialties.length > 0) || (services && services.length > 0)) && (
          <div className="flex flex-wrap gap-1 mt-3">
            {specialties?.map((specialty, idx) => (
              <Badge key={`specialty-${idx}`} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {services?.map((service, idx) => (
              <Badge key={`service-${idx}`} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
