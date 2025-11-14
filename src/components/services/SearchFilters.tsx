import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export type SortOption = 'distance' | 'rating';
export type MinRatingOption = 'all' | '3.0' | '4.0' | '4.5';

interface SearchFiltersProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  minRating: MinRatingOption;
  onMinRatingChange: (value: MinRatingOption) => void;
  hasLocation: boolean;
}

export function SearchFilters({
  sortBy,
  onSortChange,
  minRating,
  onMinRatingChange,
  hasLocation,
}: SearchFiltersProps) {
  return (
    <div className="flex gap-4 items-end flex-wrap">
      {/* Sort By Dropdown */}
      <div className="flex-1 min-w-[150px]">
        <Label className="text-xs text-muted-foreground mb-1.5">Sort by</Label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance" disabled={!hasLocation}>
              Distance {!hasLocation && '(Enable location)'}
            </SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Minimum Rating Dropdown */}
      <div className="flex-1 min-w-[150px]">
        <Label className="text-xs text-muted-foreground mb-1.5">Minimum rating</Label>
        <Select value={minRating} onValueChange={onMinRatingChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            <SelectItem value="3.0">3.0+ stars</SelectItem>
            <SelectItem value="4.0">4.0+ stars</SelectItem>
            <SelectItem value="4.5">4.5+ stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
