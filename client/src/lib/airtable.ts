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
    "HOA Min": number;
    "HOA Max": number;
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
    "Data Sources"?: string;
    "HOA Last Updated"?: string;
    "Assessor Year Built"?: number;
    "Assessor Total Units"?: number;
    "Assessor Source URL"?: string;
    "Approval Status"?: string;
  };
}

export async function fetchBuildings(
  options?: {
    city?: string;
    onProgress?: (loaded: number, total: number) => void;
  }
): Promise<Building[]> {
  let allRecords: AirtableRecord[] = [];
  let offset: string | undefined = undefined;
  let pageCount = 0;
  
  // Fetch all pages from Airtable
  do {
    pageCount++;
    let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
    const params = new URLSearchParams();
    
    if (offset) params.append('offset', offset);
    if (options?.city) {
      params.append('filterByFormula', `{City} = "${options.city}"`);
    }
    
    if (params.toString()) url += `?${params.toString()}`;
    
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
    
    // Report progress
    if (options?.onProgress) {
      options.onProgress(allRecords.length, allRecords.length + (data.offset ? 100 : 0));
    }
    
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
    hoaMonthlyFeeMin: record.fields["HOA Min"],
    hoaMonthlyFeeMax: record.fields["HOA Max"],
    amenities: record.fields["Amenities"],
    photos: record.fields["Photos"],
    photoCredits: record.fields["Photo Credits"],
    latitude: record.fields["Latitude"],
    longitude: record.fields["Longitude"],
    dataSources: record.fields["Data Sources"],
    hoaLastUpdated: record.fields["HOA Last Updated"],
    assessorYearBuilt: record.fields["Assessor Year Built"],
    assessorTotalUnits: record.fields["Assessor Total Units"],
    assessorSourceUrl: record.fields["Assessor Source URL"],
    approvalStatus: record.fields["Approval Status"] as 'Pending Review' | 'Approved' | 'Needs Revision' | undefined,
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
  if (data.hoaMonthlyFeeMin !== undefined) fields["HOA Min"] = data.hoaMonthlyFeeMin;
  if (data.hoaMonthlyFeeMax !== undefined) fields["HOA Max"] = data.hoaMonthlyFeeMax;
  if (data.approvalStatus !== undefined) fields["Approval Status"] = data.approvalStatus;
  if (data.latitude !== undefined) fields["Latitude"] = data.latitude;
  if (data.longitude !== undefined) fields["Longitude"] = data.longitude;
  if (data.dataSources !== undefined) fields["Data Sources"] = data.dataSources;
  if (data.hoaLastUpdated !== undefined) fields["HOA Last Updated"] = data.hoaLastUpdated;
  if (data.assessorYearBuilt !== undefined) fields["Assessor Year Built"] = data.assessorYearBuilt;
  if (data.assessorTotalUnits !== undefined) fields["Assessor Total Units"] = data.assessorTotalUnits;
  if (data.assessorSourceUrl !== undefined) fields["Assessor Source URL"] = data.assessorSourceUrl;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
    const errorMessage = errorData.error?.message || response.statusText;
    throw new Error(`Failed to update building: ${errorMessage}`);
  }
}
