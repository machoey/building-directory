import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Building } from "@/types/building";
import { Building2, MapPin, Calendar, Users, Edit } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface BuildingCardProps {
  building: Building;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected: boolean;
  onEdit?: (building: Building) => void;
}

export default function BuildingCard({ building, onClick, onMouseEnter, onMouseLeave, isSelected, onEdit }: BuildingCardProps) {
  const { isAdmin } = useAdmin();
  const photoUrl = building.photos?.[0]?.thumbnails?.large?.url || building.photos?.[0]?.url;
  
  const missingFields = [];
  if (!building.totalUnits) missingFields.push('units');
  if (!building.yearBuilt) missingFields.push('year');
  if (!photoUrl) missingFields.push('photo');

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
          {isAdmin && onEdit && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(building);
              }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-1">{building.name}</h3>

          {building.address && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">
                {(() => {
                  const addresses = building.address.split(';').map(a => a.trim()).filter(Boolean);
                  if (addresses.length > 1) {
                    return `${addresses[0]} (Multiple)`;
                  }
                  return building.address;
                })()}
              </span>
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
          
          {isAdmin && missingFields.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              ⚠️ Missing: {missingFields.join(', ')}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
