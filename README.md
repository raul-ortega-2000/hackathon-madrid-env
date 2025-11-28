# 🌍 Madrid Ambiental - Hackathon 2025

Plataforma web con geolocalización que muestra datos ambientales en tiempo real de la Comunidad de Madrid usando datos públicos.

## 🎯 Características

- **📊 Calidad del Aire**: Niveles de contaminación en tiempo real (NO2, PM10, PM2.5, O3)
- **♻️ Puntos de Reciclaje**: Papeleras, contenedores y puntos limpios cercanos
- **🗺️ Recomendaciones**: Rutas alternativas menos contaminadas
- **📈 Estadísticas por Zona**: Datos agregados por distrito de Madrid

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│  Frontend (React + Leaflet Maps)       │
│  Azure Static Web Apps (FREE)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend API (Azure Functions)         │
│  - Node.js 20                           │
│  - Consumption Plan (FREE)              │
│  - 4 endpoints                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  APIs Públicas Madrid                   │
│  - datos.madrid.es                      │
│  - Portal Datos Abiertos CM             │
└─────────────────────────────────────────┘
```

## 📦 Estructura del Proyecto

```
hackathon-madrid-env/
├── api/                      # Azure Functions (Backend)
│   ├── getAirQuality/       # GET /api/airquality?lat=X&lon=Y
│   ├── getRecyclingPoints/  # GET /api/recycling?lat=X&lon=Y&radius=500
│   ├── getRecommendations/  # GET /api/recommendations?lat=X&lon=Y
│   ├── getZoneStats/        # GET /api/zonestats?district=Centro
│   ├── host.json
│   └── package.json
├── frontend/                 # React App
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.jsx
│   │   │   ├── AirQualityCard.jsx
│   │   │   ├── RecyclingPoints.jsx
│   │   │   └── Recommendations.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
├── bicep/                    # Infraestructura como Código
│   ├── main.bicep
│   ├── modules/
│   └── parameters/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD Pipeline
└── README.md
```

## 🚀 Despliegue Rápido

### 1️⃣ Prerequisitos

- Azure CLI instalado
- Node.js 20+
- Azure Functions Core Tools
- Cuenta de Azure

### 2️⃣ Clonar el repositorio

```bash
git clone https://github.com/[tu-usuario]/hackathon-madrid-env.git
cd hackathon-madrid-env
```

### 3️⃣ Desplegar infraestructura Azure

```bash
# Login a Azure
az login

# Crear recursos (ya están creados si seguiste el setup)
cd bicep
az deployment group create \
  --resource-group rg-hackathon-madrid-env \
  --template-file main.bicep
```

### 4️⃣ Desplegar Backend (Azure Functions)

```bash
cd api
npm install
func azure functionapp publish func-madrid-env-api
```

### 5️⃣ Desplegar Frontend

```bash
cd frontend
npm install
npm run build

# Deploy to Azure Static Web Apps
az staticwebapp create \
  --name swa-madrid-env \
  --resource-group rg-hackathon-madrid-env \
  --source frontend \
  --location westeurope \
  --branch main \
  --app-location "build"
```

## 🧪 Desarrollo Local

### Backend (Functions)

```bash
cd api
npm install
npm start
# Functions disponibles en http://localhost:7071/api/
```

### Frontend

```bash
cd frontend
npm install
npm start
# App disponible en http://localhost:3000
```

## 📊 APIs de Datos Públicos Utilizadas

1. **Calidad del Aire Madrid**
   - URL: `https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json`
   - Datos: NO2, PM10, PM2.5, O3, SO2, CO

2. **Puntos Limpios**
   - URL: `https://datos.madrid.es/egob/catalogo/200284-0-puntos-limpios.json`
   - Datos: Ubicación, horarios, tipos de residuos

3. **Contenedores de Reciclaje**
   - URL: Portal de Datos Abiertos de Madrid
   - Datos: Ubicación de contenedores por tipo

## 🔑 Endpoints API

### GET /api/airquality
Obtiene datos de calidad del aire para una ubicación

**Query Parameters:**
- `lat` (required): Latitud
- `lon` (required): Longitud

**Response:**
```json
{
  "location": { "lat": 40.4168, "lon": -3.7038 },
  "airQuality": {
    "NO2": 45,
    "PM10": 32,
    "PM2.5": 18,
    "O3": 65,
    "level": "Buena",
    "color": "#00e400"
  },
  "recommendation": "Calidad del aire buena. Seguro para actividades al aire libre."
}
```

### GET /api/recycling
Obtiene puntos de reciclaje cercanos

**Query Parameters:**
- `lat` (required): Latitud
- `lon` (required): Longitud
- `radius` (optional): Radio en metros (default: 500)

**Response:**
```json
{
  "points": [
    {
      "id": "1",
      "type": "papelera",
      "location": { "lat": 40.4170, "lon": -3.7040 },
      "distance": 150
    }
  ]
}
```

### GET /api/recommendations
Obtiene recomendaciones basadas en datos ambientales

**Query Parameters:**
- `lat` (required): Latitud
- `lon` (required): Longitud

**Response:**
```json
{
  "recommendations": [
    {
      "type": "route",
      "message": "Ruta alternativa por Parque del Retiro tiene mejor calidad de aire",
      "alternativeRoute": [...]
    }
  ]
}
```

### GET /api/zonestats
Obtiene estadísticas agregadas por distrito

**Query Parameters:**
- `district` (required): Nombre del distrito

**Response:**
```json
{
  "district": "Centro",
  "avgAirQuality": {
    "NO2": 52,
    "PM10": 38
  },
  "recyclingPoints": 145,
  "lastUpdate": "2025-11-28T10:00:00Z"
}
```

## 💰 Costos Estimados

| Recurso | Tier | Costo Mensual |
|---------|------|---------------|
| Azure Static Web Apps | Free | €0 |
| Azure Functions | Consumption | €0 (hasta 1M ejecuciones) |
| Storage Account | Standard LRS | €0.50 |
| Application Insights | Basic | €0 (5GB incluidos) |
| **TOTAL** | | **< €1/mes** |

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, Leaflet, Axios
- **Backend**: Azure Functions (Node.js 20)
- **Infraestructura**: Azure Bicep, Azure CLI
- **CI/CD**: GitHub Actions
- **Mapas**: OpenStreetMap (Leaflet)
- **Datos**: APIs públicas de datos.madrid.es

## 📝 Licencia

MIT License - Proyecto Hackathon 2025

## 👥 Autores

- **Raúl Ortega** - r.ortega@prodware.es
- **Emiliano Sigales Gómez** - emilianosigalesgomez@gmail.com

## 🤝 Contribuir

¡Pull requests son bienvenidos! Para cambios importantes, por favor abre un issue primero.

## 📞 Soporte

Para preguntas o issues: [GitHub Issues](https://github.com/[tu-usuario]/hackathon-madrid-env/issues)
