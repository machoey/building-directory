# Data Source Tracking Implementation

## Overview
BuildingIQ uses a **metadata-based approach** to track data sources for key building fields. This provides source provenance without the overhead of maintaining a separate relational table for every field.

## Tracked Fields

### Primary Data Fields
- **HOA Monthly Fee** - Varies significantly by source, requires tracking
- **Total Units** - Can differ between assessor and MLS data
- **Year Built** - Sometimes conflicts between sources

### Source Metadata Fields (in Buildings table)
- `Data Sources` - Comma-separated list of sources (e.g., "Zillow, Redfin, User Provided")
- `HOA Last Updated` - Date when HOA fee was last updated (YYYY-MM-DD format)
- `Assessor Year Built` - Year built from county assessor (for comparison)
- `Assessor Total Units` - Units from county assessor (for comparison)
- `Assessor Source URL` - Direct link to assessor record

## Source Types

### Autonomous Enrichment Sources
- **Zillow** - Real estate listings and building pages
- **Redfin** - MLS data and property details
- **Homes.com** - HOA fees and building information
- **Transparency HOA** - HOA fee data
- **MLS** - Multiple Listing Service data
- **County Assessor** - Official property records
- **Google Maps** - Geocoding and address verification

### Manual Sources
- **User Provided** - Data manually entered or edited by admin users

## Implementation

### 1. Enrichment Script (`update_airtable.py`)
When the autonomous enrichment script updates building data:
- Populates `Data Sources` field with source names from enrichment results
- Sets `HOA Last Updated` to current date when HOA fee is updated
- Preserves existing source information (appends new sources)

### 2. Admin UI - Edit Building
When admins manually edit buildings via `BuildingEditDialog`:
- Tracks which fields were changed
- Appends "User Provided" to `Data Sources` field
- Updates `HOA Last Updated` when HOA fee is modified
- Preserves existing source information

### 3. Admin UI - Add Building
When admins add new buildings via `AddBuildingDialog`:
- Sets `Data Sources` to "User Provided" by default
- Sets `HOA Last Updated` to current date if HOA fee is provided
- All data is attributed to manual entry

## Usage Examples

### Example 1: Enriched Building
```
Building Name: The Peninsula Regent
HOA Monthly Fee: $4,200
Data Sources: Homes.com, User Provided
HOA Last Updated: 2026-02-11
```
*Interpretation: HOA fee was found via Homes.com and later verified/updated by admin*

### Example 2: Multiple Sources
```
Building Name: Mariner's Green #2
Total Units: 260
Year Built: 1978
Data Sources: Transparency HOA, Homes.com, Zillow
```
*Interpretation: Data aggregated from multiple sources during enrichment*

### Example 3: Manual Entry
```
Building Name: New Building
HOA Monthly Fee: $500
Data Sources: User Provided
HOA Last Updated: 2026-02-12
```
*Interpretation: All data manually entered by admin*

## Benefits

✅ **Lightweight** - Simple text fields, no complex joins
✅ **Transparent** - Easy to see where data came from
✅ **Auditable** - Track when HOA fees were last updated
✅ **Flexible** - Can append new sources without schema changes
✅ **Performant** - No additional queries needed

## Future Enhancements

If more detailed source tracking is needed, the existing **Data Sources table** can be used for:
- Resolving conflicts between sources
- Storing confidence levels per source
- Tracking multiple claims for the same field
- Maintaining full audit history

For now, the metadata approach provides 95% of the value with 5% of the complexity.
