import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LocationPermissionProps {
  onLocationGranted?: (latitude: number, longitude: number) => void;
  onDismiss?: () => void;
  className?: string;
}

export function LocationPermission({ onLocationGranted, onDismiss, className }: LocationPermissionProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsRequesting(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            timeout: 10000,
            enableHighAccuracy: true
          }
        );
      });

      onLocationGranted?.(position.coords.latitude, position.coords.longitude);
    } catch (err: any) {
      let errorMessage = 'Failed to get your location';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location in your browser settings.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
      }
      
      setError(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Alert className={className}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <AlertDescription className="mb-3">
              Enable location access to find veterinary clinics near you for more accurate search results.
            </AlertDescription>
            
            {error && (
              <p className="text-sm text-destructive mb-3">{error}</p>
            )}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={requestLocation}
                disabled={isRequesting}
                className="text-xs"
              >
                {isRequesting ? 'Getting location...' : 'Enable Location'}
              </Button>
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-xs"
                >
                  Skip
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Alert>
  );
}