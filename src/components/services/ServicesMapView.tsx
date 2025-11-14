import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useVetClinics } from '@/hooks/useVetClinics';
import { useGroomers } from '@/hooks/useGroomers';
import { useDogWalkers } from '@/hooks/useDogWalkers';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxleHNtZWVsZSIsImEiOiJjbTk4ZzJxYXUwMHppMnBzZm52eHdzbjhsIn0.NdF7K-qLo1yovGqtXAXfPA';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface ServicesMapViewProps {
  dogId: string;
}

interface ServiceMarker {
  id: string;
  type: 'vet' | 'groomer' | 'walker';
  name: string;
  address?: string;
  phone?: string;
  rating?: number;
  latitude: number;
  longitude: number;
  isPreferred: boolean;
}

export function ServicesMapView({ dogId }: ServicesMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const { dogVetClinics, primaryClinic } = useVetClinics(dogId);
  const { dogGroomers, preferredGroomer } = useGroomers(dogId);
  const { dogWalkers, preferredWalker } = useDogWalkers(dogId);

  const [showVets, setShowVets] = useState(true);
  const [showGroomers, setShowGroomers] = useState(true);
  const [showWalkers, setShowWalkers] = useState(true);
  const [showPreferredOnly, setShowPreferredOnly] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add user location control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Collect all services with coordinates
    const allMarkers: ServiceMarker[] = [];

    if (showVets) {
      dogVetClinics.forEach(clinic => {
        if (clinic.vet_clinic.latitude && clinic.vet_clinic.longitude) {
          const isPreferred = primaryClinic?.id === clinic.id;
          if (!showPreferredOnly || isPreferred) {
            allMarkers.push({
              id: clinic.id,
              type: 'vet',
              name: clinic.vet_clinic.name,
              address: clinic.vet_clinic.address,
              phone: clinic.vet_clinic.phone,
              latitude: Number(clinic.vet_clinic.latitude),
              longitude: Number(clinic.vet_clinic.longitude),
              isPreferred,
            });
          }
        }
      });
    }

    if (showGroomers) {
      dogGroomers.forEach(groomer => {
        if (groomer.groomer.latitude && groomer.groomer.longitude) {
          const isPreferred = preferredGroomer?.id === groomer.id;
          if (!showPreferredOnly || isPreferred) {
            allMarkers.push({
              id: groomer.id,
              type: 'groomer',
              name: groomer.groomer.name,
              address: groomer.groomer.address,
              phone: groomer.groomer.phone,
              rating: groomer.groomer.rating,
              latitude: Number(groomer.groomer.latitude),
              longitude: Number(groomer.groomer.longitude),
              isPreferred,
            });
          }
        }
      });
    }

    if (showWalkers) {
      dogWalkers.forEach(walker => {
        if (walker.walker.latitude && walker.walker.longitude) {
          const isPreferred = preferredWalker?.id === walker.id;
          if (!showPreferredOnly || isPreferred) {
            allMarkers.push({
              id: walker.id,
              type: 'walker',
              name: walker.walker.name,
              address: walker.walker.service_area,
              phone: walker.walker.phone,
              rating: walker.walker.rating,
              latitude: Number(walker.walker.latitude),
              longitude: Number(walker.walker.longitude),
              isPreferred,
            });
          }
        }
      });
    }

    // Create markers
    allMarkers.forEach(service => {
      const el = document.createElement('div');
      el.className = 'service-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';

      // Color based on service type
      if (service.type === 'vet') {
        el.style.backgroundColor = '#3b82f6'; // blue
      } else if (service.type === 'groomer') {
        el.style.backgroundColor = '#22c55e'; // green
      } else {
        el.style.backgroundColor = '#a855f7'; // purple
      }

      // Add star badge for preferred
      if (service.isPreferred) {
        const star = document.createElement('div');
        star.innerHTML = '⭐';
        star.style.position = 'absolute';
        star.style.top = '-8px';
        star.style.right = '-8px';
        star.style.fontSize = '16px';
        el.appendChild(star);
      }

      // Create popup
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-semibold text-sm mb-1">${service.name}</h3>
          <p class="text-xs text-muted-foreground mb-1">${service.type === 'vet' ? '🏥 Vet Clinic' : service.type === 'groomer' ? '✂️ Groomer' : '🐾 Dog Walker'}</p>
          ${service.address ? `<p class="text-xs mb-1">${service.address}</p>` : ''}
          ${service.phone ? `<p class="text-xs mb-1"><a href="tel:${service.phone}" class="text-primary hover:underline">${service.phone}</a></p>` : ''}
          ${service.rating ? `<p class="text-xs mb-1">⭐ ${service.rating.toFixed(1)}</p>` : ''}
          ${service.isPreferred ? `<p class="text-xs font-semibold text-amber-600">⭐ Preferred</p>` : ''}
          ${service.address ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(service.address)}" target="_blank" class="text-xs text-primary hover:underline block mt-2">Get Directions →</a>` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([service.longitude, service.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (allMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      allMarkers.forEach(service => {
        bounds.extend([service.longitude, service.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [dogVetClinics, dogGroomers, dogWalkers, showVets, showGroomers, showWalkers, showPreferredOnly, primaryClinic, preferredGroomer, preferredWalker]);

  return (
    <div className="relative h-[calc(100vh-200px)]">
      <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
        <h3 className="font-semibold mb-3 text-sm">Filter Services</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-vets"
              checked={showVets}
              onCheckedChange={(checked) => setShowVets(checked as boolean)}
            />
            <Label htmlFor="show-vets" className="text-sm cursor-pointer">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2" />
              Vet Clinics
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-groomers"
              checked={showGroomers}
              onCheckedChange={(checked) => setShowGroomers(checked as boolean)}
            />
            <Label htmlFor="show-groomers" className="text-sm cursor-pointer">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2" />
              Groomers
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-walkers"
              checked={showWalkers}
              onCheckedChange={(checked) => setShowWalkers(checked as boolean)}
            />
            <Label htmlFor="show-walkers" className="text-sm cursor-pointer">
              <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2" />
              Dog Walkers
            </Label>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-preferred"
                checked={showPreferredOnly}
                onCheckedChange={(checked) => setShowPreferredOnly(checked as boolean)}
              />
              <Label htmlFor="show-preferred" className="text-sm cursor-pointer flex items-center">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                Preferred Only
              </Label>
            </div>
          </div>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </div>
  );
}
