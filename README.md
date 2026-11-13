# CropSeq AI — Mobile-First AI Agriculture Assistant App

Developed for the **NASA Space Apps Challenge**, CropSeq AI is a modern, mobile-first agricultural co-pilot designed with a ChatGPT/Claude-inspired conversational interface. It combines NASA Earth observations (SMAP soil moisture, GPM rainfall, MODIS vegetation dynamics) with local field chemistry to guide farmers through multi-season crop sequencing, seasonal climate adaptation, and sustainable soil management.

---

## 📱 Mobile-First Experience & Responsive Multi-Device Support

CropSeq AI is engineered as a **mobile application experience first**, with responsive expansion for tablets and desktop workstations:

- **On Android & Mobile Devices**:
  - Native mobile app layout: safe-area insets (`env(safe-area-inset-bottom)`), touch targets (>44px), overscroll control, and zero horizontal scrolling.
  - Floating bottom chat input bar with auto-resizing text field and send button.
  - Native-style **Bottom Navigation Bar** with 4 primary tabs: **Assistant**, **Sequence Optimizer**, **Seasonal Variations**, and **My Farm**.
  - Smooth mobile slide-over drawer for quick conversation resets, backend status, and feature navigation.
  - PWA-ready: `viewport-fit=cover`, `theme-color: #14532d`, and mobile web app meta tags.
- **On Tablets & Desktop/Laptops**:
  - Automatically switches to an expanded dual-pane layout.
  - Persistent left sidebar with active farm telemetry, live backend status ping, conversation shortcuts, and feature directories.
  - Centered reading line-lengths (`max-w-4xl`) for desktop ergonomics.
- **Physical Android Phone Local Network Testing**:
  - Vite dev server is pre-configured with `server.host = true` (`0.0.0.0:5173`).
  - Connect your Android phone to the same Wi-Fi and open `http://<YOUR_LOCAL_IP>:5173`.

---

## 🌟 Core Features & Feature Shortcuts

The main home screen features a conversational AI co-pilot paired with 5 dedicated feature shortcuts:

### 1. 🌾 Crop Sequence Recommendation (`/sequence`)
- Multi-season crop rotation optimization powered by NASA Earth observations and linear programming/agronomic models.
- Offers both a **Guided Intake Questionnaire** and a **Fast Review & Run** mode.
- Full results dashboard with cumulative net return, soil health delta, water footprint, chronological rotation schedule, Pareto-optimal trade-offs, and dynamic risk warnings.
- Real API integration: dispatches directly to `POST /api/v1/recommendations/optimize`.

### 2. 🌤️ Crop Seasonal Variation (`/seasonal`)
- Dynamic seasonal breakdown covering **Kharif** (Monsoon/Summer Wet), **Rabi** (Winter/Dry Cool), and **Zaid** (Summer Short Season).
- Real-time NASA SMAP soil moisture dynamics and precipitation expectations.
- Crop suitability, water requirements, growth cycles, and recommended cover crops.
- One-tap "Add to Sequence Optimizer" integration.

### 3. 🌱 Further Crop Recommendations (`/recommendations`)
- Categorized exploration: Legumes & N-Fixers, Drought Resilient, Cash Crops, and Cover & Soil Restorers.
- Real-time compatibility checks based on the farm's active soil pH and water efficiency ratings.
- Instant "Add to Target Crops" button that syncs directly into the farmer's optimization preferences.

### 4. 🚜 Farmer Features & Profile (`/farm`)
- Active farm metadata: GPS coordinates, region, and land area (hectares).
- **Soil Health Telemetry Gauges**: Interactive pH reaction meter (Acidic / Favorable / Neutral / Alkaline), SOM percentage, and available NPK bars.
- Operational objectives and risk tolerance controls.

### 5. 🌐 Web Search Integration (ChatGPT Style)
- Interactive web search toggle built right into the message input bar.
- Visually augments inquiries with real-time agronomic data and market price context.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) (Host enabled for local Wi-Fi testing)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Quick Start

### 1. Installation
```bash
git clone https://github.com/Samin-Yasar-CSE/NASA-SpaceApp-Crop-Sequence-Frontend.git
cd NASA-SpaceApp-Crop-Sequence-Frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 3. Running Development Server
```bash
npm run dev
```
- Local access: `http://localhost:5173`
- Network access (Android phone on same Wi-Fi): `http://<YOUR_IP>:5173`

### 4. Production Build & Verification
```bash
npm run build
npm run preview
```

---

## 🔌 Backend Integration

The app connects to the CropSeq backend using real HTTP requests:
- Health check: `GET /health`
- Sequence optimization: `POST /api/v1/recommendations/optimize`
- Request payload: Typed `FarmerProfile` object.
- Response payload: Typed `FinalResponse` object.
- **Offline Resilient**: When the backend is offline, the app displays a clear connection diagnostic error with an instant **Retry** button. No synthetic or fake recommendations are ever fabricated.

---

## 📜 License
MIT License. Created for the NASA Space Apps Challenge.
