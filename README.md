# 🌍 Consulta Ambiental Madrid - DataHack4Good 2025

Objetivo: Construir una plataforma móvil con geolocalización que muestra datos ambientales en tiempo real de sectores específicos de la Comunidad de Madrid usando datos públicos. Incluye chatbot de IA para consultas sobre impacto ecológico. Esta plataforma brindará una solución al problema de que es difícil saber cómo ayudar al medio ambiente con acciones concretas y medibles, más allá de consejos generales ya conocidos. El enfoque del hackathon será construir un prototipo de esta plataforma que permita a ciudadanos, turistas, empresas y gobierno consultar datos públicos ambientales relevantes, y obtener recomendaciones para acciones con impacto ambiental positivo.

## 🎯 Características Principales

### 📱 Aplicación Móvil (React Native + Expo)
- **🗺️ Mapa Interactivo en Tiempo Real**: Muestra tu ubicación actual y puntos de interés ambiental
- **📊 8 Categorías de Datos Ambientales**:
  - Contaminación Atmosférica / Calidad del aire
  - Gestión del Agua
  - Residuos
  - Uso Energético
  - Espacios Verdes y Suelos
  - Cambio Climático General
  - Olas de Calor
  - Biodiversidad
- **💬 Chatbot de Impacto Ecológico**: Asistente de IA para consultas personalizadas sobre tu impacto ambiental
- **📍 Identificación Automática de Zona**: Detecta automáticamente tu distrito/área en Madrid
- **🎯 Recomendaciones Personalizadas**: 4-6 recomendaciones con impacto medible basadas en datos reales
- **👥 Roles de Usuario**: Ciudadano, Turista, Empresa, Gobierno (con vistas diferenciadas)

### 🔄 Sistema Inteligente de Datos
- **Datos Reales**: Conectado a APIs públicas de Madrid
- **Datos de Ejemplo**: Si no hay datos disponibles, muestra promedios de zonas cercanas
- **Indicadores Visuales**: Código de colores (Verde=Aceptable, Amarillo=Media, Rojo=Mala)
- **Actualización en Tiempo Real**: Los datos se actualizan según tu ubicación

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│  Mobile App (React Native + Expo)      │
│  - Expo Go compatible                   │
│  - React Native Maps                    │
│  - Chatbot con IA                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Backend API (Azure Functions)         │
│  - Node.js 20                           │
│  - Consumption Plan (FREE)              │
│  - Múltiples endpoints                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  APIs Públicas Madrid                   │
│  - datos.madrid.es                      │
│  - Portal Datos Abiertos CM             │
│  - datos.comunidad.madrid               │
└─────────────────────────────────────────┘
```

## 📦 Estructura del Proyecto

```
hackathon-madrid-env/
├── api/                      # Azure Functions (Backend)
│   ├── getAirQuality/       # GET /api/airquality?lat=X&lon=Y
│   ├── getRecyclingPoints/ # GET /api/recycling?lat=X&lon=Y&radius=500
│   ├── getRecommendations/ # GET /api/recommendations?lat=X&lon=Y
│   ├── getZoneStats/       # GET /api/zonestats?district=Centro
│   ├── dataSources.js      # Configuración de fuentes de datos
│   ├── host.json
│   └── package.json
├── mobile-app/              # React Native App (Expo)
│   ├── components/
│   │   ├── MapView.tsx     # Mapa interactivo
│   │   └── Chatbot.tsx     # Chatbot de impacto ecológico
│   ├── services/
│   │   ├── api.ts          # Servicio de API
│   │   ├── geocoding.ts   # Identificación de zonas
│   │   └── data.ts        # Datos locales (fallback)
│   ├── App.tsx             # Componente principal
│   ├── app.json
│   └── package.json
├── frontend-app/            # React Web App (opcional)
│   ├── src/
│   └── package.json
└── README.md
```

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 20+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Cuenta de Azure (para backend)
- Expo Go app en tu móvil (iOS/Android)

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/raul-ortega-2000/hackathon-madrid-env.git
cd hackathon-madrid-env
```

### 2️⃣ Configurar y Ejecutar la App Móvil

```bash
cd mobile-app
npm install
npm start
```

Escanea el código QR con Expo Go en tu móvil para ver la app en acción.

### 3️⃣ Configurar Backend (Opcional)

```bash
cd api
npm install

# Para desarrollo local
npm start
# API disponible en http://localhost:7071/api/

# Para desplegar a Azure
func azure functionapp publish func-madrid-env-api
```

## 📱 Uso de la Aplicación

### Funcionalidades Principales

1. **Visualización de Datos Ambientales**
   - La app detecta automáticamente tu ubicación
   - Muestra 8 categorías de datos ambientales
   - Código de colores: Verde (Buena), Amarillo (Media), Rojo (Mala)

2. **Mapa Interactivo**
   - Tu ubicación en tiempo real
   - Puntos de reciclaje cercanos
   - Estaciones de calidad del aire
   - Leyenda interactiva

3. **Recomendaciones Personalizadas**
   - 4-6 recomendaciones basadas en datos reales
   - Impacto medible de cada acción
   - Ejemplos: "Reduce hasta 2.5 kg de CO2 por cada 10 km evitados"

4. **Chatbot de Impacto Ecológico**
   - Pregunta sobre cualquier aspecto ambiental
   - Respuestas personalizadas según tu zona
   - Consejos específicos con datos medibles
   - Integración con OpenAI (opcional)

5. **Roles de Usuario**
   - **Ciudadano/Turista**: Acceso completo a datos y recomendaciones
   - **Empresa/Gobierno**: Vista extendida (próximamente)

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
  "station": {
    "name": "Estación Centro",
    "distance": 500
  },
  "airQuality": {
    "NO2": 45,
    "PM10": 32,
    "PM2_5": 18,
    "O3": 65,
    "SO2": 12,
    "CO": 0.5,
    "level": "Media",
    "color": "#FFC107",
    "aqi": 100
  },
  "recommendation": "Calidad del aire media...",
  "timestamp": "2025-01-28T10:00:00Z"
}
```

### GET /api/recycling
Obtiene puntos de reciclaje cercanos

**Query Parameters:**
- `lat` (required): Latitud
- `lon` (required): Longitud
- `radius` (optional): Radio en metros (default: 1000)

**Response:**
```json
{
  "location": { "lat": 40.4168, "lon": -3.7038 },
  "radius": 1000,
  "totalPoints": 15,
  "points": [
    {
      "id": "1",
      "name": "Punto Limpio Centro",
      "type": "punto_limpio",
      "location": { "lat": 40.4170, "lon": -3.7040 },
      "address": "Calle de la Princesa, 1",
      "distance": 250
    }
  ],
  "dataSources": [
    "datos.madrid.es - Puntos Limpios",
    "datos.madrid.es - Contenedores de Reciclaje"
  ],
  "timestamp": "2025-01-28T10:00:00Z"
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
  "location": { "lat": 40.4168, "lon": -3.7038 },
  "recommendations": [
    {
      "type": "air",
      "title": "Evita utilizar vehículos de combustión",
      "description": "La calidad del aire es mala...",
      "icon": "🔴",
      "priority": "high",
      "impact": "Impacto: Reduces hasta 2.5 kg de CO2..."
    }
  ],
  "totalRecommendations": 5,
  "timestamp": "2025-01-28T10:00:00Z"
}
```

## 📊 Fuentes de Datos

### APIs Públicas de Madrid Utilizadas

1. **Contaminación Atmosférica**
   - Calidad del aire en tiempo real
   - Estaciones de medición
   - Históricos de contaminantes

2. **Gestión del Agua**
   - Calidad del agua
   - Consumo de agua
   - Fuentes públicas

3. **Residuos**
   - Puntos limpios
   - Contenedores de reciclaje
   - Rutas de recolección

4. **Uso Energético**
   - Consumo energético
   - Energía renovable
   - Eficiencia energética

5. **Espacios Verdes y Suelos**
   - Parques y jardines
   - Árboles urbanos
   - Calidad del suelo

6. **Cambio Climático**
   - Temperatura
   - Emisiones CO2
   - Indicadores climáticos

7. **Olas de Calor**
   - Alertas de temperatura
   - Índices de calor

8. **Biodiversidad**
   - Especies
   - Hábitats
   - Áreas protegidas

## 🤖 Chatbot de IA

El chatbot permite consultas sobre impacto ecológico con:

- **Respuestas Contextuales**: Basadas en tu zona y datos actuales
- **Consejos Personalizados**: Recomendaciones específicas para tu ubicación
- **Impacto Medible**: Datos cuantificables de cada acción
- **Integración Flexible**: 
  - Sistema basado en reglas (actual)
  - OpenAI GPT-3.5-turbo (opcional, requiere API key)

### Habilitar OpenAI (Opcional)

1. Obtén una API key de OpenAI
2. Edita `mobile-app/components/Chatbot.tsx`
3. Descomenta el código de OpenAI
4. Reemplaza `'YOUR_OPENAI_API_KEY'` con tu clave

## 🛠️ Tecnologías Utilizadas

### Mobile App
- **React Native** 0.81.5
- **Expo** ~54.0.25
- **TypeScript** 5.9.2
- **React Native Maps** 1.18.0
- **Expo Location** 19.0.7
- **Axios** 1.13.2

### Backend
- **Azure Functions** (Node.js 20)
- **Axios** para llamadas HTTP
- **@azure/functions** 4.0.0

### Infraestructura
- **Azure Functions** (Consumption Plan)
- **Azure Static Web Apps** (para frontend web)
- **GitHub Actions** (CI/CD)

## 💰 Costos Estimados

| Recurso | Tier | Costo Mensual |
|---------|------|---------------|
| Azure Functions | Consumption | €0 (hasta 1M ejecuciones) |
| Azure Static Web Apps | Free | €0 |
| Storage Account | Standard LRS | €0.50 |
| Application Insights | Basic | €0 (5GB incluidos) |
| **TOTAL** | | **< €1/mes** |

## 🎨 Características de UI/UX

- **Tema Oscuro**: Diseño moderno con fondo negro
- **Código de Colores**:
  - 🟢 Verde: Condiciones buenas
  - 🟡 Amarillo: Condiciones medias
  - 🔴 Rojo: Condiciones malas
- **Navegación Intuitiva**: Scroll horizontal para categorías
- **Mapa Interactivo**: Zoom, pan, marcadores personalizados
- **Chatbot Flotante**: Acceso rápido desde cualquier pantalla

## 📝 Características Especiales

### Sistema de Datos Inteligente
- **Datos Reales**: Prioriza datos de APIs públicas
- **Datos de Ejemplo**: Si no hay datos, muestra promedios de zonas cercanas
- **Indicador Visual**: Muestra "(Datos reales no disponibles en la zona. Los datos mostrados son datos ejemplo tomados de zonas cercanas)" cuando aplica

### Identificación de Zona
- Detecta automáticamente tu distrito/área en Madrid
- Soporta 30+ zonas incluyendo área metropolitana
- Ejemplos: "Pozuelo de Alarcón", "Chamartín", "Salamanca", etc.

### Recomendaciones Avanzadas
- 4-6 recomendaciones por sesión
- Impacto medible de cada acción
- Priorización inteligente (alta/media/baja)
- Basadas en datos reales de tu zona

## 🧪 Desarrollo Local

### Mobile App

```bash
cd mobile-app
npm install
npm start
# Escanea el QR con Expo Go
```

### Backend API

```bash
cd api
npm install
npm start
# API disponible en http://localhost:7071/api/
```

## 📱 Compatibilidad

- **iOS**: Requiere Expo Go app
- **Android**: Requiere Expo Go app
- **Web**: Soporte experimental (Expo Web)

## 🔒 Privacidad

- La ubicación se usa solo localmente
- No se almacenan datos personales
- Las consultas al chatbot son procesadas localmente o en OpenAI (si se configura)

## 📝 Licencia

MIT License - Proyecto Hackathon 2025

## 👥 Autores

- **Raúl Ortega** - r.ortega@prodware.es
- **Emiliano Sigales Gómez** - emilianosigalesgomez@gmail.com

## 🤝 Contribuir

¡Pull requests son bienvenidos! Para cambios importantes, por favor abre un issue primero.

## 📞 Soporte

Para preguntas o issues: [GitHub Issues](https://github.com/raul-ortega-2000/hackathon-madrid-env/issues)

## 🚀 Roadmap

- [ ] Integración completa con todas las APIs de Madrid
- [ ] Versión extendida para Empresas/Gobierno
- [ ] Históricos y tendencias
- [ ] Notificaciones push para alertas ambientales
- [ ] Compartir datos en redes sociales
- [ ] Modo offline mejorado

---

**Desarrollado con ❤️ para el Hackathon Madrid 2025**
