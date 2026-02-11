import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building, updateBuilding } from '@/lib/airtable';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { verifyWithAssessor } from '@/lib/countyAssessor';

interface BuildingEditDialogProps {
  building: Building | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function BuildingEditDialog({ building, open, onOpenChange, onSave }: BuildingEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Building>>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (building) {
      setFormData({
        name: building.name || '',
        address: building.address || '',
        city: building.city || '',
        state: building.state || 'CA',
        totalUnits: building.totalUnits,
        yearBuilt: building.yearBuilt,
        neighborhood: building.neighborhood || '',
        hoaMonthlyFee: building.hoaMonthlyFee,
        notes: building.notes || '',
        latitude: building.latitude,
        longitude: building.longitude,
      });
    }
  }, [building]);

  if (!building) return null;

  const missingFields = [];
  if (!building.totalUnits) missingFields.push('Total Units');
  if (!building.yearBuilt) missingFields.push('Year Built');
  if (!building.photos?.[0]) missingFields.push('Photo');

  const handleVerify = async () => {
    if (!formData.address || !formData.city || !formData.state) {
      toast.error('Address, city, and state are required for verification');
      return;
    }

    setVerifying(true);
    try {
      const assessorData = await verifyWithAssessor(
        formData.address,
        formData.city,
        formData.state
      );

      // Update form with verified data
      setFormData({
        ...formData,
        address: assessorData.address || formData.address,
        city: assessorData.city || formData.city,
        state: assessorData.state || formData.state,
        latitude: assessorData.latitude || formData.latitude,
        longitude: assessorData.longitude || formData.longitude,
      });

      toast.success(
        `Address verified! ${assessorData.notes}`,
        { duration: 5000 }
      );
    } catch (error) {
      toast.error('Failed to verify address with county assessor');
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBuilding(building.id, formData);
      toast.success('Building updated successfully');
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update building');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Building</DialogTitle>
        </DialogHeader>

        {missingFields.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Missing Fields:</strong> {missingFields.join(', ')}
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleVerify}
            disabled={verifying || !formData.address || !formData.city}
          >
            {verifying ? 'Verifying...' : 'Verify with County Assessor'}
          </Button>
          <Button variant="outline" size="sm" disabled>
            Update Photo
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Building Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state || 'CA'}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="totalUnits">
                Total Units {!building.totalUnits && <Badge variant="destructive" className="ml-2">Missing</Badge>}
              </Label>
              <Input
                id="totalUnits"
                type="number"
                value={formData.totalUnits || ''}
                onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div>
              <Label htmlFor="yearBuilt">
                Year Built {!building.yearBuilt && <Badge variant="destructive" className="ml-2">Missing</Badge>}
              </Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt || ''}
                onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div>
              <Label htmlFor="neighborhood">Neighborhood/District</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood || ''}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="hoaFee">HOA Monthly Fee</Label>
              <Input
                id="hoaFee"
                type="number"
                value={formData.hoaMonthlyFee || ''}
                onChange={(e) => setFormData({ ...formData, hoaMonthlyFee: parseFloat(e.target.value) || undefined })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || undefined })}
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || undefined })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
