import { MapPin, Star, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchResultCardProps {
  name: string;
  businessName?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  distance?: number;
  source: 'google' | 'database';
  services?: string[];
  specialties?: string[];
  serviceArea?: string;
  onAdd: () => void;
  isAlreadyAdded?: boolean;
  linkedDogCount?: number;
}

export function SearchResultCard({
  name,
  businessName,
  address,
  phone,
  website,
  rating,
  userRatingsTotal,
  distance,
  source,
  services,
  specialties,
  serviceArea,
  onAdd,
  isAlreadyAdded,
  linkedDogCount = 0,
}: SearchResultCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              {source === 'google' && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  Google
                </Badge>
              )}
              {distance && (
                <Badge variant="outline" className="text-xs shrink-0">
                  <MapPin className="w-3 h-3 mr-1" />
                  {distance.toFixed(1)} km
                </Badge>
              )}
            </div>

            {businessName && businessName !== name && (
              <p className="text-sm text-muted-foreground mb-1">{businessName}</p>
            )}

            {address && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{address}</p>
            )}

            {serviceArea && !address && (
              <p className="text-sm text-muted-foreground mb-2">Service area: {serviceArea}</p>
            )}

            {rating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating.toFixed(1)}</span>
                {userRatingsTotal && <span>({userRatingsTotal} reviews)</span>}
              </div>
            )}

            {(services || specialties) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {services?.slice(0, 3).map((service, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {specialties?.slice(0, 3).map((specialty, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}

            {(phone || website) && (
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                {phone && <span>📞 {phone}</span>}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0">
            {isAlreadyAdded ? (
              <Badge variant="secondary">
                Added {linkedDogCount > 0 && `(${linkedDogCount})`}
              </Badge>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onAdd}
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
