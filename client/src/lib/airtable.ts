import type { Building } from "@/types/building";

export type { Building };

const AIRTABLE_TOKEN = "patEacZ4Bo6wNJkEv.9fec07275877e51803de073e69ea99fdae22cda9724ba89b9d3007b21d050997";
const BASE_ID = "appYmK8ogrMkZwTfm";
const TABLE_NAME = "all buildings";

interface AirtableRecord {
  id: string;
  fields: {
    "Building Name"?: string;
    "Address"?: string;
    "City"?: string;
    "State"?: string;
    "Total Units"?: number;
    "Year Built"?: number;
    "Neighborhood/District"?: string;
    "Notes"?: string;
    "Status"?: string;
    "HOA Monthly Fee"?: number;
    "Amenities"?: string[];
    "Photos"?: Array<{
      id: string;
      url: string;
      filename: string;
      size: number;
      type: string;
      thumbnails?: {
        small?: { url: string };
        large?: { url: string };
        full?: { url: string };
      };
    }>;
    "Photo Credits"?: string;
    "Latitude"?: number;
    "Longitude"?: number;
  };
}

export async function fetchBuildings(): Promise<Building[]> {
  let allRecords: AirtableRecord[] = [];
  let offset: string | undefined = undefined;
  
  // Fetch all pages from Airtable
  do {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}${
      offset ? `?offset=${offset}` : ''
    }`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch buildings: ${response.statusText}`);
    }

    const data = await response.json();
    const records: AirtableRecord[] = data.records || [];
    allRecords = allRecords.concat(records);
    
    offset = data.offset; // Will be undefined when no more pages
  } while (offset);

  return allRecords.map((record) => ({
    id: record.id,
    name: record.fields["Building Name"] || "Unnamed Building",
    address: record.fields["Address"],
    city: record.fields["City"],
    state: record.fields["State"],
    totalUnits: record.fields["Total Units"],
    yearBuilt: record.fields["Year Built"],
    neighborhood: record.fields["Neighborhood/District"],
    notes: record.fields["Notes"],
    status: record.fields["Status"],
    hoaMonthlyFee: record.fields["HOA Monthly Fee"],
    amenities: record.fields["Amenities"],
    photos: record.fields["Photos"],
    photoCredits: record.fields["Photo Credits"],
    latitude: record.fields["Latitude"],
    longitude: record.fields["Longitude"],
  }));
}

export async function updateBuilding(id: string, data: Partial<Building>): Promise<void> {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${id}`;
  
  // Map Building fields to Airtable field names
  const fields: Record<string, any> = {};
  if (data.name !== undefined) fields["Building Name"] = data.name;
  if (data.address !== undefined) fields["Address"] = data.address;
  if (data.city !== undefined) fields["City"] = data.city;
  if (data.state !== undefined) fields["State"] = data.state;
  if (data.totalUnits !== undefined) fields["Total Units"] = data.totalUnits;
  if (data.yearBuilt !== undefined) fields["Year Built"] = data.yearBuilt;
  if (data.neighborhood !== undefined) fields["Neighborhood/District"] = data.neighborhood;
  if (data.notes !== undefined) fields["Notes"] = data.notes;
  if (data.hoaMonthlyFee !== undefined) fields["HOA Monthly Fee"] = data.hoaMonthlyFee;
  if (data.latitude !== undefined) fields["Latitude"] = data.latitude;
  if (data.longitude !== undefined) fields["Longitude"] = data.longitude;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update building: ${response.statusText}`);
  }
}
