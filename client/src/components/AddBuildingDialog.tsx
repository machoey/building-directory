import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddBuildingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function AddBuildingDialog({ open, onOpenChange, onSave }: AddBuildingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "CA",
    totalUnits: "",
    yearBuilt: "",
    neighborhood: "",
    hoaMonthlyFee: "",
    notes: "",
    latitude: "",
    longitude: "",
    photoCredits: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAutoGeocode = async () => {
    if (!formData.address || !formData.city) {
      toast.error("Please enter address and city first");
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}`;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=AIzaSyAbEQ1rnR8YhU8RZwXRNU87sqmRJaBeTtY`;
      
      const response = await fetch(geocodeUrl);
      const data = await response.json();

      if (data.status === "OK" && data.results[0]) {
        const location = data.results[0].geometry.location;
        setFormData(prev => ({
          ...prev,
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
        }));
        toast.success("Coordinates fetched successfully!");
      } else {
        toast.error("Could not geocode address");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to fetch coordinates");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      // Get Street View photo
      let photoUrl = "";
      if (formData.latitude && formData.longitude) {
        photoUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${formData.latitude},${formData.longitude}&key=AIzaSyAbEQ1rnR8YhU8RZwXRNU87sqmRJaBeTtY`;
      }

      // Prepare Airtable data
      const airtableData: any = {
        "Building Name": formData.name,
        "Address": formData.address,
        "City": formData.city,
        "State": formData.state,
      };

      if (formData.totalUnits) airtableData["Total Units"] = parseInt(formData.totalUnits);
      if (formData.yearBuilt) airtableData["Year Built"] = parseInt(formData.yearBuilt);
      if (formData.neighborhood) airtableData["Neighborhood/District"] = formData.neighborhood;
      if (formData.hoaMonthlyFee) {
        airtableData["HOA Monthly Fee"] = parseFloat(formData.hoaMonthlyFee);
        airtableData["HOA Last Updated"] = new Date().toISOString().split('T')[0];
      }
      if (formData.notes) airtableData["Notes"] = formData.notes;
      if (formData.latitude) airtableData["Latitude"] = parseFloat(formData.latitude);
      if (formData.longitude) airtableData["Longitude"] = parseFloat(formData.longitude);
      
      // Track that this data was manually provided by admin
      airtableData["Data Sources"] = "User Provided";
      
      if (photoUrl) {
        airtableData["Photo"] = [{ url: photoUrl }];
        // Use user-provided credits or default to Street View
        airtableData["Photo Credits"] = formData.photoCredits || "© Google Street View";
      }

      // Add to Airtable
      const response = await fetch("https://api.airtable.com/v0/appYmK8ogrMkZwTfm/all%20buildings", {
        method: "POST",
        headers: {
          "Authorization": "Bearer patEacZ4Bo6wNJkEv.9fec07275877e51803de073e69ea99fdae22cda9724ba89b9d3007b21d050997",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: airtableData }),
      });

      if (!response.ok) {
        throw new Error("Failed to add building");
      }

      toast.success("Building added successfully!");
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "CA",
        totalUnits: "",
        yearBuilt: "",
        neighborhood: "",
        hoaMonthlyFee: "",
        notes: "",
        latitude: "",
        longitude: "",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding building:", error);
      toast.error("Failed to add building");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Building</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Building Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., The Gardens"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="e.g., 1919 Alameda de las Pulgas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="e.g., San Mateo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalUnits">Total Units</Label>
              <Input
                id="totalUnits"
                type="number"
                value={formData.totalUnits}
                onChange={(e) => handleChange("totalUnits", e.target.value)}
                placeholder="e.g., 166"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearBuilt">Year Built</Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt}
                onChange={(e) => handleChange("yearBuilt", e.target.value)}
                placeholder="e.g., 1974"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood/District</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
                placeholder="e.g., West San Mateo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hoaMonthlyFee">HOA Monthly Fee ($)</Label>
            <Input
              id="hoaMonthlyFee"
              type="number"
              value={formData.hoaMonthlyFee}
              onChange={(e) => handleChange("hoaMonthlyFee", e.target.value)}
              placeholder="e.g., 450"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional information about the building..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Coordinates</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAutoGeocode}
                disabled={loading || !formData.address || !formData.city}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Auto-Geocode"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
              />
              <Input
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoCredits">Photo Credits (Optional)</Label>
            <Input
              id="photoCredits"
              value={formData.photoCredits}
              onChange={(e) => handleChange("photoCredits", e.target.value)}
              placeholder="e.g., Photo courtesy of Jane Smith, Compass Real Estate"
            />
            <p className="text-xs text-muted-foreground">
              If uploading MLS photo, include agent and brokerage. Leave blank for auto-generated Street View.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Building"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
