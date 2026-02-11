import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { Building } from '@/lib/airtable';

interface AdminToolbarProps {
  buildings: Building[];
}

export function AdminToolbar({ buildings }: AdminToolbarProps) {
  const { isAdmin, logout } = useAdmin();

  if (!isAdmin) return null;

  const buildingsNeedingAttention = buildings.filter(b => 
    !b.totalUnits || !b.yearBuilt || !b.photos?.[0]
  ).length;

  return (
    <div className="bg-blue-600 text-white py-2 px-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <span className="font-semibold">Admin Mode</span>
        <span className="text-sm">{buildingsNeedingAttention} need attention</span>
      </div>
      <Button variant="outline" size="sm" onClick={logout} className="text-blue-600">
        Logout
      </Button>
    </div>
  );
}
