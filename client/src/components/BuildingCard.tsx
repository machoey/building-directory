import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Building } from "@/types/building";
import { Building2, MapPin, Calendar, Users } from "lucide-react";

interface BuildingCardProps {
  building: Building;
  onClick: () => void;
  isSelected: boolean;
}

export default function BuildingCard({ building, onClick, isSelected }: BuildingCardProps) {
  const photoUrl = building.photos?.[0]?.thumbnails?.large?.url || building.photos?.[0]?.url;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative h-48 bg-muted overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={building.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          {building.status && (
            <Badge className="absolute top-2 right-2" variant="secondary">
              {building.status}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-1">{building.name}</h3>

          {building.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{building.address}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            {building.totalUnits && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{building.totalUnits} units</span>
              </div>
            )}
            {building.yearBuilt && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{building.yearBuilt}</span>
              </div>
            )}
          </div>

          {building.neighborhood && (
            <Badge variant="outline" className="text-xs">
              {building.neighborhood}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
