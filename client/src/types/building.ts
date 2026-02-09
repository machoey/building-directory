export interface Building {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  totalUnits?: number;
  yearBuilt?: number;
  neighborhood?: string;
  notes?: string;
  status?: string;
  hoaMonthlyFee?: number;
  amenities?: string[];
  photos?: Array<{
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
  photoCredits?: string;
}
