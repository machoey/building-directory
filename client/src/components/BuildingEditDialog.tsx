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
import { Flag, Loader2 } from 'lucide-react';

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
  const [flaggedFields, setFlaggedFields] = useState<Set<string>>(new Set());
  const [correctingField, setCorrectingField] = useState<string | null>(null);

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
        hoaMonthlyFeeMin: building.hoaMonthlyFeeMin,
        hoaMonthlyFeeMax: building.hoaMonthlyFeeMax,
        notes: building.notes || '',
        latitude: building.latitude,
        longitude: building.longitude,
        photoCredits: building.photoCredits || '',
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

  const toggleFlag = (fieldName: string) => {
    const newFlagged = new Set(flaggedFields);
    if (newFlagged.has(fieldName)) {
      newFlagged.delete(fieldName);
    } else {
      newFlagged.add(fieldName);
    }
    setFlaggedFields(newFlagged);
  };

  const handleAutoCorrect = async (fieldName: string) => {
    setCorrectingField(fieldName);
    try {
      // Import the auto-correct functions
      const { correctTotalUnits, correctYearBuilt, correctHOAFee, correctNeighborhood } = await import('@/lib/autoCorrect');
      
      let suggestion = null;
      switch (fieldName) {
        case 'totalUnits':
          suggestion = await correctTotalUnits(building);
          break;
        case 'yearBuilt':
          suggestion = await correctYearBuilt(building);
          break;
        case 'hoaMonthlyFee':
          suggestion = await correctHOAFee(building);
          break;
        case 'neighborhood':
          suggestion = await correctNeighborhood(building);
          break;
      }

      if (suggestion) {
        toast.info(
          `${suggestion.reasoning}`,
          { duration: 8000 }
        );
        
        // Remove flag after showing suggestion
        const newFlagged = new Set(flaggedFields);
        newFlagged.delete(fieldName);
        setFlaggedFields(newFlagged);
      }
    } catch (error) {
      toast.error('Failed to auto-correct field');
      console.error(error);
    } finally {
      setCorrectingField(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Track which fields were manually edited
      const updatedData = { ...formData };
      
      // If HOA fee was edited, update the last updated date and source
      if (formData.hoaMonthlyFeeMin !== building.hoaMonthlyFeeMin || formData.hoaMonthlyFeeMax !== building.hoaMonthlyFeeMax) {
        updatedData.hoaLastUpdated = new Date().toISOString().split('T')[0];
        updatedData.dataSources = building.dataSources 
          ? `${building.dataSources}, User Provided` 
          : 'User Provided';
      }
      
      // If units or year built were edited, note it was user provided
      if (formData.totalUnits !== building.totalUnits || formData.yearBuilt !== building.yearBuilt) {
        updatedData.dataSources = building.dataSources 
          ? `${building.dataSources}, User Provided` 
          : 'User Provided';
      }
      
      await updateBuilding(building.id, updatedData);
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
              <Label htmlFor="totalUnits" className="flex items-center justify-between">
                <span>
                  Total Units {!building.totalUnits && <Badge variant="destructive" className="ml-2">Missing</Badge>}
                </span>
                <button
                  type="button"
                  onClick={() => flaggedFields.has('totalUnits') ? handleAutoCorrect('totalUnits') : toggleFlag('totalUnits')}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    flaggedFields.has('totalUnits') ? 'text-orange-600' : 'text-gray-400'
                  }`}
                  title={flaggedFields.has('totalUnits') ? 'Click to research correction' : 'Flag for review'}
                >
                  {correctingField === 'totalUnits' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flag className="h-4 w-4" fill={flaggedFields.has('totalUnits') ? 'currentColor' : 'none'} />
                  )}
                </button>
              </Label>
              <Input
                id="totalUnits"
                type="number"
                value={formData.totalUnits || ''}
                onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || undefined })}
                className={flaggedFields.has('totalUnits') ? 'border-orange-400 bg-orange-50' : ''}
              />
            </div>

            <div>
              <Label htmlFor="yearBuilt" className="flex items-center justify-between">
                <span>
                  Year Built {!building.yearBuilt && <Badge variant="destructive" className="ml-2">Missing</Badge>}
                </span>
                <button
                  type="button"
                  onClick={() => flaggedFields.has('yearBuilt') ? handleAutoCorrect('yearBuilt') : toggleFlag('yearBuilt')}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    flaggedFields.has('yearBuilt') ? 'text-orange-600' : 'text-gray-400'
                  }`}
                  title={flaggedFields.has('yearBuilt') ? 'Click to research correction' : 'Flag for review'}
                >
                  {correctingField === 'yearBuilt' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flag className="h-4 w-4" fill={flaggedFields.has('yearBuilt') ? 'currentColor' : 'none'} />
                  )}
                </button>
              </Label>
              <Input
                id="yearBuilt"
                type="number"
                value={formData.yearBuilt || ''}
                onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) || undefined })}
                className={flaggedFields.has('yearBuilt') ? 'border-orange-400 bg-orange-50' : ''}
              />
            </div>

            <div>
              <Label htmlFor="neighborhood" className="flex items-center justify-between">
                <span>Neighborhood/District</span>
                <button
                  type="button"
                  onClick={() => flaggedFields.has('neighborhood') ? handleAutoCorrect('neighborhood') : toggleFlag('neighborhood')}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    flaggedFields.has('neighborhood') ? 'text-orange-600' : 'text-gray-400'
                  }`}
                  title={flaggedFields.has('neighborhood') ? 'Click to research correction' : 'Flag for review'}
                >
                  {correctingField === 'neighborhood' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flag className="h-4 w-4" fill={flaggedFields.has('neighborhood') ? 'currentColor' : 'none'} />
                  )}
                </button>
              </Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood || ''}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className={flaggedFields.has('neighborhood') ? 'border-orange-400 bg-orange-50' : ''}
              />
            </div>

            <div className="col-span-2">
              <Label className="flex items-center justify-between mb-2">
                <span>HOA Monthly Fee Range</span>
                <button
                  type="button"
                  onClick={() => flaggedFields.has('hoaMonthlyFee') ? handleAutoCorrect('hoaMonthlyFee') : toggleFlag('hoaMonthlyFee')}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    flaggedFields.has('hoaMonthlyFee') ? 'text-orange-600' : 'text-gray-400'
                  }`}
                  title={flaggedFields.has('hoaMonthlyFee') ? 'Click to research correction' : 'Flag for review'}
                >
                  {correctingField === 'hoaMonthlyFee' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Flag className="h-4 w-4" fill={flaggedFields.has('hoaMonthlyFee') ? 'currentColor' : 'none'} />
                  )}
                </button>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="hoaFeeMin" className="text-xs text-muted-foreground">Min ($)</Label>
                  <Input
                    id="hoaFeeMin"
                    type="number"
                    value={formData.hoaMonthlyFeeMin || ''}
                    onChange={(e) => setFormData({ ...formData, hoaMonthlyFeeMin: parseFloat(e.target.value) || undefined })}
                    className={flaggedFields.has('hoaMonthlyFee') ? 'border-orange-400 bg-orange-50' : ''}
                    placeholder="e.g., 300"
                  />
                </div>
                <div>
                  <Label htmlFor="hoaFeeMax" className="text-xs text-muted-foreground">Max ($)</Label>
                  <Input
                    id="hoaFeeMax"
                    type="number"
                    value={formData.hoaMonthlyFeeMax || ''}
                    onChange={(e) => setFormData({ ...formData, hoaMonthlyFeeMax: parseFloat(e.target.value) || undefined })}
                    className={flaggedFields.has('hoaMonthlyFee') ? 'border-orange-400 bg-orange-50' : ''}
                    placeholder="e.g., 899"
                  />
                </div>
              </div>
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

            <div className="col-span-2">
              <Label htmlFor="photoCredits">Photo Credits</Label>
              <Input
                id="photoCredits"
                value={formData.photoCredits || ''}
                onChange={(e) => setFormData({ ...formData, photoCredits: e.target.value })}
                placeholder="e.g., Photo courtesy of Jane Smith, Compass Real Estate"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If using MLS photo, include agent and brokerage name. For Street View, use "© Google Street View".
              </p>
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
