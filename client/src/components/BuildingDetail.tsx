import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Building } from "@/types/building";
import { MapPin, Calendar, Users, DollarSign, Building2, Check, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdmin } from "@/contexts/AdminContext";
import { updateBuilding } from "@/lib/airtable";
import { toast } from "sonner";

interface BuildingDetailProps {
  building: Building | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuildingUpdate?: () => void;
}

export default function BuildingDetail({ building, open, onOpenChange, onBuildingUpdate }: BuildingDetailProps) {
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const { isAdmin } = useAdmin();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprovalStatusChange = async (status: 'Approved' | 'Needs Revision') => {
    if (!building) return;
    
    setIsUpdating(true);
    try {
      await updateBuilding(building.id, { approvalStatus: status });
      toast.success(`Building marked as ${status}`);
      if (onBuildingUpdate) {
        onBuildingUpdate();
      }
    } catch (error) {
      toast.error('Failed to update approval status');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
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
              <div 
                className="relative h-64 bg-muted overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => {
                  if (building.latitude && building.longitude) {
                    window.open(
                      `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${building.latitude},${building.longitude}`,
                      '_blank'
                    );
                  }
                }}
                title="Click to open in Google Street View"
              >
                <img
                  src={photoUrl}
                  alt={building.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Open in Street View</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-64 bg-muted overflow-hidden rounded-lg flex items-center justify-center">
                <Building2 className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}

            {/* Approval Status */}
            {isAdmin && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Approval Status</h3>
                  <Badge 
                    variant={building.approvalStatus === 'Approved' ? 'default' : building.approvalStatus === 'Needs Revision' ? 'destructive' : 'secondary'}
                  >
                    {building.approvalStatus || 'Pending Review'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprovalStatusChange('Approved')}
                    disabled={isUpdating || building.approvalStatus === 'Approved'}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => handleApprovalStatusChange('Needs Revision')}
                    disabled={isUpdating || building.approvalStatus === 'Needs Revision'}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Needs Revision
                  </Button>
                </div>
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
                  <p className="font-medium text-sm">
                    {(() => {
                      const addresses = building.address.split(';').map(a => a.trim()).filter(Boolean);
                      if (addresses.length > 1) {
                        if (showAllAddresses) {
                          return (
                            <span>
                              {addresses.map((addr, i) => (
                                <span key={i}>
                                  {addr}
                                  {i < addresses.length - 1 && <br />}
                                </span>
                              ))}
                              <button
                                onClick={() => setShowAllAddresses(false)}
                                className="text-blue-600 hover:underline ml-2"
                              >
                                (Show Less)
                              </button>
                            </span>
                          );
                        }
                        return (
                          <span>
                            {addresses[0]}{' '}
                            <button
                              onClick={() => setShowAllAddresses(true)}
                              className="text-blue-600 hover:underline"
                            >
                              (Multiple Addresses)
                            </button>
                          </span>
                        );
                      }
                      return building.address;
                    })()}
                  </p>
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

              {(building.hoaMonthlyFeeMin || building.hoaMonthlyFeeMax) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>HOA Fee</span>
                  </div>
                  <p className="font-medium text-lg">
                    {building.hoaMonthlyFeeMin && building.hoaMonthlyFeeMax && building.hoaMonthlyFeeMin !== building.hoaMonthlyFeeMax
                      ? `$${building.hoaMonthlyFeeMin.toLocaleString()} - $${building.hoaMonthlyFeeMax.toLocaleString()}/mo`
                      : `$${(building.hoaMonthlyFeeMin || building.hoaMonthlyFeeMax)?.toLocaleString()}/mo`
                    }
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
