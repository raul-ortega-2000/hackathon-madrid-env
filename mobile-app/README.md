# 📱 Madrid Ambiental - Mobile App (Expo)

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
cd mobile-app
npm install
```

### 2. Iniciar Expo

```bash
npm start
```

Esto abrirá Expo Dev Tools en tu navegador.

### 3. Abrir en Expo Go

**Android:**
1. Descarga **Expo Go** desde Google Play
2. Escanea el código QR desde Expo Dev Tools

**iOS:**
1. Descarga **Expo Go** desde App Store
2. Escanea el código QR con la cámara del iPhone

## ✨ Características

- 🗺️ **Mapa Interactivo**: Tu ubicación y puntos de reciclaje
- 🌡️ **Calidad del Aire**: Datos en tiempo real de Madrid
- 💡 **Recomendaciones**: Personalizadas según tu zona
- ♻️ **Puntos de Reciclaje**: Los más cercanos a ti
- 🔄 **Actualización en Tiempo Real**: Botón para refrescar datos

## 📋 Requisitos

- Node.js 18+
- Expo Go app en tu móvil
- Conexión a internet
- Permisos de ubicación

## 🏗️ Estructura

```
mobile-app/
├── App.tsx              # Componente principal
├── services/
│   └── api.ts          # Servicios API Azure Functions
├── app.json            # Configuración Expo
├── package.json        # Dependencias
└── tsconfig.json       # TypeScript config
```

## 🔗 API Backend

La app se conecta a:
```
https://func-madrid-env-api.azurewebsites.net/api
```

Endpoints:
- `/airquality` - Calidad del aire
- `/recycling` - Puntos de reciclaje
- `/recommendations` - Recomendaciones
- `/zonestats` - Estadísticas por distrito

## 🎨 Capturas

La app muestra:
- Badge de calidad (Verde=Buena, Amarillo=Regular, Rojo=Mala)
- Contaminantes: NO2, PM10, PM2.5, O3
- Mapa con markers personalizados
- UI responsive con Material Design

## 🐛 Troubleshooting

### Error de permisos de ubicación
```bash
# Reinstala la app en Expo Go
npm start --clear
```

### Error de conexión API
Verifica que el backend esté activo:
```bash
curl https://func-madrid-env-api.azurewebsites.net/api/airquality?lat=40.4168&lon=-3.7038
```

### Mapa no carga
React Native Maps requiere configuración adicional para producción. En Expo Go funciona automáticamente.

## 📦 Build para Producción

```bash
# Android APK
npx eas build -p android --profile preview

# iOS IPA
npx eas build -p ios --profile preview
```

## 🌐 Versión Web vs Mobile

| Característica | Web | Mobile |
|----------------|-----|--------|
| URL | https://blue-mud-0443bd103.3.azurestaticapps.net | Expo Go |
| Tecnología | React 18 + Azure Static Web App | React Native + Expo |
| Mapa | Leaflet | React Native Maps |
| Ubicación | Browser API | Expo Location |
| Offline | ❌ | ⏳ Próximamente |

---

**Proyecto**: Madrid Ambiental Hackathon
**Versión Mobile**: 1.0.0
**Autor**: Raúl Ortega
