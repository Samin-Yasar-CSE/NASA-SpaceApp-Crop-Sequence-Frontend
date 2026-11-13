# CropSeq — Intelligent Crop Sequence Recommendation System (Frontend)

Built for the **NASA Space Apps Challenge**, CropSeq is an AI-powered agricultural planning platform that leverages NASA Earth Observation datasets (SMAP, GPM, MODIS) and local soil telemetry to recommend multi-season crop sequences optimizing for yield, soil health, water efficiency, and financial return.

---

## 🌟 Architecture & Features

- **API-First Architecture**: Built around the standard CropSeq FastAPI backend specification. No mocked data, synthetic fallbacks, or client-side calculation simulations.
- **Guided Chat Intake**: Step-by-step interactive questionnaire collecting GPS coordinates, soil metrics (pH, NPK, organic matter), irrigation infrastructure, historical fallow periods, and risk/objective constraints.
- **Full Client Validation**: Rigorous validation ensures all agronomic fields satisfy biological and geographic constraints before dispatching to the optimizer.
- **Farmer Profile Review**: Clear summary dashboard with inline editing before final optimization submission.
- **Dynamic Results Dashboard**:
  - **Optimization Summary Card**: Net return, soil health index delta, water footprint, and achieved objective.
  - **Sequence Timeline**: Season-by-season schedule showing recommended crops, varieties, yields, cost/revenue projections, and agronomic justifications.
  - **Pareto-Optimal Alternatives**: Multi-objective trade-off comparison (e.g. maximum financial yield vs. conservation agriculture).
  - **Agronomic Evidence**: Detailed NASA satellite sensor provenance (SMAP moisture, GPM rainfall, MODIS vegetation dynamics).
  - **Environmental & Risk Warnings**: Dynamic risk advisories for drought anomalies, pest vectors, and monoculture risks.
  - **Future Q&A Interface**: Dedicated upcoming feature area for interactive scenario analysis.
- **Resilient Backend Connection Handling**: Built-in connection status indicators, clear offline error states, and retry workflows for when the backend is offline.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/NASA-SpaceApp-Crop-Sequence-Frontend.git
cd NASA-SpaceApp-Crop-Sequence-Frontend
npm install
```

### 3. Environment Configuration
The frontend connects to the CropSeq backend using the `VITE_API_BASE_URL` environment variable.

Create a `.env` file in the root directory (or copy `.env.example`):

```bash
# .env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Target URL for the CropSeq backend service |

### 4. Running the Development Server
Start Vite development server:

```bash
npm run dev
```

The application will be live at: **`http://localhost:5173`**

### 5. Building for Production
Create an optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🔌 Connecting to the Backend

The frontend communicates with the CropSeq backend using standard REST endpoints:

### Endpoints Leveraged:
1. **Health Check**:
   - `GET /health`
   - Verifies server availability and readiness.
2. **Crop Sequence Optimization**:
   - `POST /api/v1/recommendations/optimize`
   - Payload: `FarmerProfile` JSON object.
   - Response: `FinalResponse` JSON object containing `optimization_summary`, `recommended_sequence`, `pareto_optimal_alternatives`, and `warnings`.

### Running with a Local Backend:
1. Start your backend service on `http://127.0.0.1:8000`.
2. Confirm the health check works:
   ```bash
   curl http://127.0.0.1:8000/health
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. If your backend is hosted on a different port or server (e.g. `http://localhost:8080` or remote host), update `VITE_API_BASE_URL` in `.env` and restart Vite.

---

## 📁 Project Structure

```
NASA-SpaceApp-Crop-Sequence-Frontend/
├── public/                 # Static assets & icons
│   └── favicon.svg
├── src/
│   ├── api/                # Centralized API service layer
│   │   └── cropseqApi.ts   # Axios instance, health check & optimize endpoints
│   ├── components/
│   │   ├── chat/           # Guided chat intake interface
│   │   │   └── ChatIntake.tsx
│   │   ├── common/         # Common UI (EmptyState, ErrorDisplay, LoadingSpinner)
│   │   ├── layout/         # Header, Footer, and Layout shell
│   │   ├── results/        # Results components
│   │   │   ├── OptimizationSummaryCard.tsx
│   │   │   ├── SequenceTimeline.tsx
│   │   │   ├── ParetoAlternatives.tsx
│   │   │   ├── WarningsPanel.tsx
│   │   │   └── FutureQA.tsx
│   ├── context/            # React Context & reducer for application state
│   │   └── AppContext.tsx
│   ├── hooks/              # Custom React hooks (useApi)
│   ├── pages/              # Primary route views
│   │   ├── LandingPage.tsx # Overview & features
│   │   ├── IntakePage.tsx  # Chat intake
│   │   ├── ReviewPage.tsx  # Intake verification & submission
│   │   └── ResultsPage.tsx # Complete recommendation dashboard
│   ├── types/              # TypeScript definitions
│   │   ├── farmerProfile.ts  # FarmerProfile request types
│   │   └── recommendation.ts # FinalResponse types
│   ├── utils/              # Validation & formatting utilities
│   ├── App.tsx             # Route definitions
│   ├── index.css           # Tailwind directives & theme styles
│   └── main.tsx            # React application root
├── .env                    # Local environment variables
├── .env.example            # Environment template
├── index.html              # HTML shell
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Custom agriculture & earth color palettes
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration & backend proxy
```

---

## 🧪 Testing the Frontend Flow

1. **Without Backend**:
   - Navigate to `/intake`.
   - Complete the chat questions or advance through the steps.
   - Review your inputs on `/review`.
   - Click **Submit for Optimization**.
   - If the backend is not running, the application will display a clear connection error modal with an explanation and a **Retry** button.
2. **With Backend**:
   - Start the backend on `http://127.0.0.1:8000`.
   - Click **Retry** or submit again.
   - The dashboard dynamically renders the real sequence, financial metrics, Pareto trade-offs, and environmental warnings.

---

## 📜 License
MIT License. Created for the NASA Space Apps Challenge.
