import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { Building } from '@/lib/airtable';
import { AlertCircle, Image, Calendar, Users, DollarSign } from 'lucide-react';
import { Link } from 'wouter';

interface AdminToolbarProps {
  buildings: Building[];
}

export function AdminToolbar({ buildings }: AdminToolbarProps) {
  const { isAdmin, logout } = useAdmin();

  if (!isAdmin) return null;

  // Calculate attention metrics
  const missingPhotos = buildings.filter(b => !b.photos?.[0]).length;
  const missingUnits = buildings.filter(b => !b.totalUnits).length;
  const missingYearBuilt = buildings.filter(b => !b.yearBuilt).length;
  const missingHOAFees = buildings.filter(b => !b.hoaMonthlyFeeMin && !b.hoaMonthlyFeeMax).length;
  const pendingReview = buildings.filter(b => !b.approvalStatus || b.approvalStatus === 'Pending Review').length;
  const needsRevision = buildings.filter(b => b.approvalStatus === 'Needs Revision').length;

  const totalIssues = missingPhotos + missingUnits + missingYearBuilt + missingHOAFees;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">Admin Mode</span>
            {totalIssues > 0 && (
              <Badge variant="destructive" className="bg-red-500">
                <AlertCircle className="h-3 w-3 mr-1" />
                {totalIssues} issues
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            {missingPhotos > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
                <Image className="h-4 w-4" />
                <span>{missingPhotos} missing photos</span>
              </div>
            )}
            {missingUnits > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
                <Users className="h-4 w-4" />
                <span>{missingUnits} missing units</span>
              </div>
            )}
            {missingYearBuilt > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
                <Calendar className="h-4 w-4" />
                <span>{missingYearBuilt} missing year</span>
              </div>
            )}
            {missingHOAFees > 0 && (
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded">
                <DollarSign className="h-4 w-4" />
                <span>{missingHOAFees} missing HOA</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
              Dashboard
              {(pendingReview > 0 || needsRevision > 0) && (
                <Badge variant="secondary" className="ml-2 bg-yellow-500 text-white">
                  {pendingReview + needsRevision}
                </Badge>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/10">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
