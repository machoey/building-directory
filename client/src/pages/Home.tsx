import { useEffect, useState, useMemo } from "react";
import { fetchBuildings } from "@/lib/airtable";
import type { Building } from "@/types/building";
import BuildingCard from "@/components/BuildingCard";
import BuildingDetail from "@/components/BuildingDetail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapIcon, List, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapView } from "@/components/Map";

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split");
  
  // Filters
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<number | null>(null);

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

  // Get unique neighborhoods
  const neighborhoods = useMemo(() => {
    const unique = new Set(
      buildings
        .map((b) => b.neighborhood)
        .filter((n): n is string => Boolean(n))
    );
    return Array.from(unique).sort();
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
      if (selectedCity && building.city !== selectedCity) {
        return false;
      }
      if (selectedNeighborhood && building.neighborhood !== selectedNeighborhood) {
        return false;
      }
      if (selectedDecade && building.yearBuilt) {
        const decade = Math.floor(building.yearBuilt / 10) * 10;
        if (decade !== selectedDecade) return false;
      }
      return true;
    });
  }, [buildings, selectedCity, selectedNeighborhood, selectedDecade]);

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
    setDetailOpen(true);
  };

  const clearFilters = () => {
    setSelectedCity(null);
    setSelectedNeighborhood(null);
    setSelectedDecade(null);
  };

  const hasFilters = selectedCity || selectedNeighborhood || selectedDecade;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">San Mateo Building Directory</h1>
              <p className="text-sm text-muted-foreground">
                {filteredBuildings.length} {filteredBuildings.length === 1 ? "building" : "buildings"}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
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

            {/* Neighborhood Filter */}
            <div className="flex flex-wrap gap-2">
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
                      isSelected={selectedBuilding?.id === building.id}
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

      {/* Building Detail Modal */}
      <BuildingDetail
        building={selectedBuilding}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
