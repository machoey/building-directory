import { useState, useEffect } from "react";
import { fetchBuildings } from "@/lib/airtable";
import type { Building } from "@/types/building";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, CheckCircle, AlertTriangle, Clock, Search } from "lucide-react";
import BuildingDetail from "@/components/BuildingDetail";

export default function AdminDashboard() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending Review' | 'Approved' | 'Needs Revision'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const loadBuildings = async () => {
    setLoading(true);
    try {
      const data = await fetchBuildings();
      setBuildings(data);
    } catch (error) {
      console.error('Failed to load buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const stats = {
    total: 363, // As specified by user
    pending: buildings.filter(b => !b.approvalStatus || b.approvalStatus === 'Pending Review').length,
    approved: buildings.filter(b => b.approvalStatus === 'Approved').length,
    needsRevision: buildings.filter(b => b.approvalStatus === 'Needs Revision').length,
  };

  const filteredBuildings = buildings.filter(building => {
    // Filter by approval status
    const statusMatch = filter === 'All' || 
      (filter === 'Pending Review' && (!building.approvalStatus || building.approvalStatus === 'Pending Review')) ||
      building.approvalStatus === filter;

    // Filter by search query
    const searchMatch = !searchQuery || 
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.city?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setShowDetail(true);
  };

  const handleBuildingUpdate = () => {
    loadBuildings();
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage building approval workflow</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('All')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('Pending Review')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('Approved')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter('Needs Revision')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Needs Revision</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.needsRevision}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search buildings by name, address, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('All')}
          >
            All
          </Button>
          <Button
            variant={filter === 'Pending Review' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Pending Review')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'Approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Approved')}
          >
            Approved
          </Button>
          <Button
            variant={filter === 'Needs Revision' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('Needs Revision')}
          >
            Needs Revision
          </Button>
        </div>
      </div>

      {/* Buildings List */}
      <Card>
        <CardHeader>
          <CardTitle>Buildings ({filteredBuildings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading buildings...</div>
          ) : filteredBuildings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No buildings found</div>
          ) : (
            <div className="space-y-2">
              {filteredBuildings.map((building) => (
                <div
                  key={building.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleBuildingClick(building)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{building.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {building.address} • {building.city}, {building.state}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {building.totalUnits && (
                      <span className="text-sm text-muted-foreground">{building.totalUnits} units</span>
                    )}
                    <Badge
                      variant={
                        building.approvalStatus === 'Approved' ? 'default' :
                        building.approvalStatus === 'Needs Revision' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {building.approvalStatus || 'Pending Review'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Building Detail Dialog */}
      <BuildingDetail
        building={selectedBuilding}
        open={showDetail}
        onOpenChange={setShowDetail}
        onBuildingUpdate={handleBuildingUpdate}
      />
    </div>
  );
}
