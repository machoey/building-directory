# 🏢 Building Directory

A comprehensive database and web interface for residential condo and townhome buildings across the Bay Area.

---

## 🚀 Quick Links

### 🌐 **Live Website**
**https://sanmateobd-83bddj25.manus.space/**

Browse and search all buildings in the directory.

### 📊 **Airtable Database**
**https://airtable.com/appYmK8ogrMkZwTfm**

Manage building data, add photos, and update information.

---

## 📈 Current Coverage

The directory currently includes **142 buildings** across 2 cities:

| City | Buildings | Status |
|------|-----------|--------|
| San Mateo | 84 | ✅ Complete with photos |
| Burlingame | 58 | ✅ Complete |

---

## 🎯 Project Goal

Build the most reliable and complete national residential database of buildings in the US and Canada, starting with the Bay Area.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + Tailwind CSS 4
- **Database:** Airtable
- **Data Sources:** MLS listings, County Assessor records, public records

---

## 📁 Project Structure

```
building-directory/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # Utilities (Airtable integration)
│   └── public/         # Static assets
├── PROJECT_LINKS.md    # Quick reference for all important links
└── README.md           # This file
```

---

## 📝 Development

### Local Development
```bash
cd /home/ubuntu/building-directory
pnpm install
pnpm dev
```

### View Live Site
The site is automatically deployed and accessible at:
**https://sanmateobd-83bddj25.manus.space/**

---

## 🔄 Data Workflow

1. **Research:** Gather building data from MLS, County records, and public sources
2. **Import:** Add buildings to Airtable database
3. **Verify:** Confirm building names, addresses, and details
4. **Enhance:** Add photos, amenities, and additional information
5. **Publish:** Data automatically appears on the web interface

---

## 📚 Documentation

- **[PROJECT_LINKS.md](./PROJECT_LINKS.md)** - All important links and credentials
- **[/home/ubuntu/AIRTABLE_QUICK_REFERENCE.md](../AIRTABLE_QUICK_REFERENCE.md)** - Detailed Airtable reference

---

**Last Updated:** February 8, 2026
