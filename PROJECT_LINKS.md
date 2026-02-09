# 🏢 Building Directory Project - Quick Links

## 🌐 Web Interface (Live Site)
**https://sanmateobd-83bddj25.manus.space/**

This is your public-facing building directory website where users can browse and search all buildings.

---

## 📊 Airtable Database (Data Management)
**https://airtable.com/appYmK8ogrMkZwTfm**

This is your backend database where you manage all building data, add photos, update information, and track research status.

---

## 🔄 How They Work Together

**Airtable** → Backend database (where you edit and manage data)  
↓  
**Web Interface** → Frontend website (what users see and search)

The web interface pulls data from Airtable in real-time, so any changes you make in Airtable will appear on the website.

---

## 📈 Current Database

| City | Buildings | Status |
|------|-----------|--------|
| San Mateo | 84 | ✅ Complete with photos |
| Burlingame | 58 | ✅ Complete (added Feb 8, 2026) |
| **Total** | **142** | |

---

## 🔑 Airtable API Credentials

For programmatic access or automation:

- **Base ID:** `appYmK8ogrMkZwTfm`
- **Table Name:** `all buildings`
- **Personal Access Token:** See `/home/ubuntu/.airtable_config`

---

## 📝 Next Steps

1. **Add more cities:** Repeat the process for other Bay Area cities (Millbrae, Foster City, Redwood City, etc.)
2. **Verify building names:** Some MLS names may need to be updated with actual marketed names
3. **Add photos:** Upload building photos to Airtable for better visual appeal
4. **Research details:** Add amenities, HOA info, and other details to each building

---

**Project Path:** `/home/ubuntu/building-directory`  
**Last Updated:** February 8, 2026
