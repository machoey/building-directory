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
  hoaMonthlyFeeMin?: number;
  hoaMonthlyFeeMax?: number;
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
  latitude?: number;
  longitude?: number;
  // Data source tracking
  dataSources?: string;
  hoaLastUpdated?: string;
  assessorYearBuilt?: number;
  assessorTotalUnits?: number;
  assessorSourceUrl?: string;
  approvalStatus?: 'Pending Review' | 'Approved' | 'Needs Revision';
}
