import { useEffect, useState, useMemo } from "react";
import { fetchBuildings } from "@/lib/airtable";
import type { Building } from "@/types/building";
import BuildingCard from "@/components/BuildingCard";
import BuildingDetail from "@/components/BuildingDetail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, MapIcon, List, X, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapView } from "@/components/Map";
import { useAdmin } from "@/contexts/AdminContext";
import { AdminToolbar } from "@/components/AdminToolbar";
import { AdminLoginDialog } from "@/components/AdminLoginDialog";
import { BuildingEditDialog } from "@/components/BuildingEditDialog";
import { AddBuildingDialog } from "@/components/AddBuildingDialog";



export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);
  const { isAdmin, setShowLoginDialog } = useAdmin();
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);


  useEffect(() => {
    fetchBuildings()
      .then(setBuildings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Get unique cities
  const cities = useMemo(() => {
    const unique = new Set(
      buildings
        .map((b) => b.city)
        .filter((c): c is string => Boolean(c))
    );
    return Array.from(unique).sort();
  }, [buildings]);

  // Get neighborhoods grouped by city
  const neighborhoodsByCity = useMemo(() => {
    const grouped: Record<string, Set<string>> = {};
    buildings.forEach((b) => {
      if (b.city && b.neighborhood) {
        if (!grouped[b.city]) {
          grouped[b.city] = new Set();
        }
        grouped[b.city].add(b.neighborhood);
      }
    });
    // Convert to sorted arrays
    const result: Record<string, string[]> = {};
    Object.keys(grouped).sort().forEach((city) => {
      result[city] = Array.from(grouped[city]).sort();
    });
    return result;
  }, [buildings]);

  // Get decades
  const decades = useMemo(() => {
    const years = buildings
      .map((b) => b.yearBuilt)
      .filter((y): y is number => Boolean(y));
    const uniqueDecades = new Set(years.map((y) => Math.floor(y / 10) * 10));
    return Array.from(uniqueDecades).sort((a, b) => b - a);
  }, [buildings]);

  // Filtered buildings
  const filteredBuildings = useMemo(() => {
    return buildings.filter((building) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = building.name?.toLowerCase().includes(query);
        const matchesAddress = building.address?.toLowerCase().includes(query);
        if (!matchesName && !matchesAddress) {
          return false;
        }
      }
      
      // City filter
      if (selectedCity && building.city !== selectedCity) {
        return false;
      }
      
      // Neighborhood filter
      if (selectedNeighborhood && building.neighborhood !== selectedNeighborhood) {
        return false;
      }
      
      // Decade filter
      if (selectedDecade && building.yearBuilt) {
        const decade = Math.floor(building.yearBuilt / 10) * 10;
        if (decade !== selectedDecade) return false;
      }
      
      return true;
    });
  }, [buildings, searchQuery, selectedCity, selectedNeighborhood, selectedDecade]);

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setDetailOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity(null);
    setSelectedNeighborhood(null);
    setSelectedDecade(null);
  };

  // Search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    return buildings
      .filter((building) => {
        const matchesName = building.name?.toLowerCase().includes(query);
        const matchesAddress = building.address?.toLowerCase().includes(query);
        return matchesName || matchesAddress;
      })
      .slice(0, 8); // Limit to 8 suggestions
  }, [buildings, searchQuery]);

  const handleSuggestionClick = (building: Building) => {
    setSearchQuery(building.name || "");
    setShowSuggestions(false);
  };

  const hasFilters = searchQuery || selectedCity || selectedNeighborhood || selectedDecade;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleEdit = (building: Building) => {
    setEditingBuilding(building);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    // Refresh buildings list
    fetchBuildings()
      .then(setBuildings)
      .catch(console.error);
  };

  const handleAddBuilding = () => {
    if (!isAdmin) {
      setShowLoginDialog(true);
    } else {
      setAddDialogOpen(true);
    }
  };

  const handleSaveNewBuilding = () => {
    // Refresh buildings list
    fetchBuildings()
      .then(setBuildings)
      .catch(console.error);
    setAddDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Admin Toolbar */}
      <AdminToolbar buildings={buildings} />
      
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">SF Bay Area Building Directory</h1>
              <p className="text-sm text-muted-foreground">
                {filteredBuildings.length} {filteredBuildings.length === 1 ? "building" : "buildings"}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              {!isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginDialog(true)}
                >
                  Admin
                </Button>
              )}
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "split" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("split")}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Split
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="border-b bg-background">
        <div className="container py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder="Search buildings by name or address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10"
            />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                {suggestions.map((building) => (
                  <button
                    key={building.id}
                    onClick={() => handleSuggestionClick(building)}
                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-b-0 flex flex-col gap-1"
                  >
                    <div className="font-medium text-sm">{building.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{building.address}</span>
                      {building.city && <span>• {building.city}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-muted/30">
        <div className="container py-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-muted-foreground">Filter by:</span>

            {/* City Filter */}
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Badge
                  key={city}
                  variant={selectedCity === city ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedCity(
                      selectedCity === city ? null : city
                    )
                  }
                >
                  {city}
                </Badge>
              ))}
            </div>

            {/* Neighborhood Filter - Grouped by City */}
            <div className="w-full">
              {Object.entries(neighborhoodsByCity).map(([city, neighborhoods]) => (
                <details key={city} className="mb-2" open={selectedCity === city}>
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
                    {city} ({neighborhoods.length})
                  </summary>
                  <div className="flex flex-wrap gap-2 ml-4">
                    {neighborhoods.map((neighborhood) => (
                      <Badge
                        key={neighborhood}
                        variant={selectedNeighborhood === neighborhood ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedNeighborhood(
                            selectedNeighborhood === neighborhood ? null : neighborhood
                          )
                        }
                      >
                        {neighborhood}
                      </Badge>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            {/* Decade Filter */}
            <div className="flex flex-wrap gap-2">
              {decades.map((decade) => (
                <Badge
                  key={decade}
                  variant={selectedDecade === decade ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDecade(selectedDecade === decade ? null : decade)}
                >
                  {decade}s
                </Badge>
              ))}
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* List View */}
        {(viewMode === "list" || viewMode === "split") && (
          <div className={viewMode === "split" ? "w-1/2 border-r" : "flex-1"}>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="container py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBuildings.map((building) => (
                    <BuildingCard
                      key={building.id}
                      building={building}
                      onClick={() => handleBuildingClick(building)}
                      onMouseEnter={() => setHoveredBuilding(building)}
                      onMouseLeave={() => setHoveredBuilding(null)}
                      isSelected={selectedBuilding?.id === building.id}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Map View */}
        {(viewMode === "map" || viewMode === "split") && (
          <div className={viewMode === "split" ? "w-1/2" : "flex-1"}>
            <div className="h-[calc(100vh-12rem)]">
              <MapView
                buildings={filteredBuildings}
                selectedBuilding={selectedBuilding}
                hoveredBuilding={hoveredBuilding}
                onBuildingClick={handleBuildingClick}
                onMapReady={(map: google.maps.Map) => {
                  // Center on San Mateo County
                  map.setCenter({ lat: 37.5630, lng: -122.3255 });
                  map.setZoom(11);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating Add Button (Admin Only) */}
      {isAdmin && (
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          size="icon"
          onClick={() => setAddDialogOpen(true)}
        >
          <span className="text-2xl">+</span>
        </Button>
      )}

      {/* Building Detail Modal */}
      <BuildingDetail
        building={selectedBuilding}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      
      {/* Admin Dialogs */}
      <AdminLoginDialog />
      <BuildingEditDialog
        building={editingBuilding}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
      />
      <AddBuildingDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
