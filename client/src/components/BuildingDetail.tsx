import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Building } from "@/types/building";
import { MapPin, Calendar, Users, DollarSign, Building2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BuildingDetailProps {
  building: Building | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuildingDetail({ building, open, onOpenChange }: BuildingDetailProps) {
  if (!building) return null;

  const photoUrl = building.photos?.[0]?.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{building.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Photo */}
            {photoUrl ? (
              <div className="relative h-64 bg-muted overflow-hidden rounded-lg">
                <img
                  src={photoUrl}
                  alt={building.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative h-64 bg-muted overflow-hidden rounded-lg flex items-center justify-center">
                <Building2 className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {building.address && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Address</span>
                  </div>
                  <p className="font-medium text-sm">{building.address}</p>
                  {building.city && building.state && (
                    <p className="text-sm text-muted-foreground">
                      {building.city}, {building.state}
                    </p>
                  )}
                </div>
              )}

              {building.totalUnits && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Total Units</span>
                  </div>
                  <p className="font-medium text-lg">{building.totalUnits}</p>
                </div>
              )}

              {building.yearBuilt && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Year Built</span>
                  </div>
                  <p className="font-medium text-lg">{building.yearBuilt}</p>
                </div>
              )}

              {building.hoaMonthlyFee && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>HOA Fee</span>
                  </div>
                  <p className="font-medium text-lg">
                    ${building.hoaMonthlyFee.toLocaleString()}/mo
                  </p>
                </div>
              )}
            </div>

            {/* Neighborhood */}
            {building.neighborhood && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Neighborhood</h4>
                <Badge variant="outline">{building.neighborhood}</Badge>
              </div>
            )}

            {/* Amenities */}
            {building.amenities && building.amenities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {building.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {building.notes && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Notes</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{building.notes}</p>
              </div>
            )}

            {/* Photo Credits */}
            {building.photoCredits && (
              <div className="text-xs text-muted-foreground border-t pt-4">
                {building.photoCredits}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
