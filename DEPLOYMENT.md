# 🚀 Instrucciones de Despliegue Final

## ✅ Estado Actual

### Recursos Azure Creados:
- ✅ Resource Group: `rg-hackathon-madrid-env`
- ✅ Storage Account: `sthackathonmadenv`
- ✅ Function App: `func-madrid-env-api`
- ✅ Application Insights: Configurado automáticamente

### Código Completado:
- ✅ 4 Azure Functions (Node.js 20)
  - `getAirQuality` - Calidad del aire
  - `getRecyclingPoints` - Puntos de reciclaje
  - `getRecommendations` - Recomendaciones ambientales
  - `getZoneStats` - Estadísticas por distrito
- ✅ Frontend React completo
- ✅ GitHub Actions CI/CD workflow

## 📤 Paso 1: Subir a GitHub

```bash
cd /home/rortega/source/rortega/hackathon-madrid-env

# Inicializar git (si no está inicializado)
git init
git branch -M main

# Añadir archivos
git add .
git commit -m "feat: Complete Madrid Ambiental hackathon project"

# Crear repositorio en GitHub (manual)
# 1. Ve a https://github.com/new
# 2. Nombre: hackathon-madrid-env
# 3. Público
# 4. NO inicializar con README

# Conectar y push
git remote add origin https://github.com/TU-USUARIO/hackathon-madrid-env.git
git push -u origin main
```

## 🔧 Paso 2: Deploy Backend (Azure Functions)

```bash
cd /home/rortega/source/rortega/hackathon-madrid-env/api

# Instalar dependencias
npm install

# Deploy a Azure
func azure functionapp publish func-madrid-env-api

# ✅ Tu API estará en:
# https://func-madrid-env-api.azurewebsites.net/api/
```

### Endpoints disponibles:
- `GET /api/airquality?lat=40.4168&lon=-3.7038`
- `GET /api/recycling?lat=40.4168&lon=-3.7038&radius=1000`
- `GET /api/recommendations?lat=40.4168&lon=-3.7038`
- `GET /api/zonestats?district=Centro`

## 🎨 Paso 3: Deploy Frontend (Static Web App)

### Opción A: Crear Static Web App desde Azure Portal

1. Ve a Azure Portal
2. Crear recurso → Static Web App
3. Configuración:
   - Name: `swa-madrid-env`
   - Resource Group: `rg-hackathon-madrid-env`
   - Region: West Europe
   - Source: GitHub
   - Organization: Tu usuario
   - Repository: `hackathon-madrid-env`
   - Branch: `main`
   - Build Presets: React
   - App location: `/frontend-app`
   - Output location: `build`

### Opción B: Comando CLI

```bash
az staticwebapp create \
  --name swa-madrid-env \
  --resource-group rg-hackathon-madrid-env \
  --source https://github.com/TU-USUARIO/hackathon-madrid-env \
  --location westeurope \
  --branch main \
  --app-location "frontend-app" \
  --output-location "build" \
  --login-with-github
```

## ⚙️ Paso 4: Configurar Variables de Entorno

### En Static Web App:

1. Azure Portal → Static Web App → Configuration
2. Añadir Application Settings:
   ```
   REACT_APP_API_URL=https://func-madrid-env-api.azurewebsites.net/api
   ```

### En GitHub Secrets (para CI/CD):

1. GitHub → Tu Repo → Settings → Secrets and variables → Actions
2. Añadir secrets:
   - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: Desde Azure Portal → Function App → Get publish profile
   - `AZURE_STATIC_WEB_APPS_API_TOKEN`: Desde Azure Portal → Static Web App → Manage deployment token

## 🔐 Paso 5: Configurar CORS en Functions

```bash
az functionapp cors add \
  --name func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env \
  --allowed-origins "https://swa-madrid-env.azurestaticapps.net" "*"
```

## 🧪 Paso 6: Probar la Aplicación

### Probar Backend:
```bash
# Air Quality
curl "https://func-madrid-env-api.azurewebsites.net/api/airquality?lat=40.4168&lon=-3.7038"

# Recycling Points
curl "https://func-madrid-env-api.azurewebsites.net/api/recycling?lat=40.4168&lon=-3.7038&radius=500"

# Recommendations
curl "https://func-madrid-env-api.azurewebsites.net/api/recommendations?lat=40.4168&lon=-3.7038"

# Zone Stats
curl "https://func-madrid-env-api.azurewebsites.net/api/zonestats?district=Centro"
```

### Probar Frontend:
1. Ve a: `https://swa-madrid-env.azurestaticapps.net`
2. Permitir geolocalización o usar Madrid por defecto
3. Ver datos de calidad del aire, recomendaciones y puntos de reciclaje

## 📊 Paso 7: Monitoreo

### Application Insights:
```bash
az monitor app-insights component show \
  --app func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env \
  --query "instrumentationKey"
```

### Ver Logs:
```bash
# Logs de Functions
func azure functionapp logstream func-madrid-env-api

# O en Azure Portal
# Function App → Monitoring → Log stream
```

## 🎉 URLs Finales

- **Frontend**: `https://swa-madrid-env.azurestaticapps.net`
- **API Base**: `https://func-madrid-env-api.azurewebsites.net/api`
- **GitHub**: `https://github.com/TU-USUARIO/hackathon-madrid-env`

## 💰 Costos Estimados

- Static Web App (Free): €0
- Function App (Consumption): €0 (hasta 1M ejecuciones)
- Storage Account: ~€0.50/mes
- Application Insights: €0 (5GB incluidos)

**Total**: < €1/mes

## 🐛 Troubleshooting

### Si las Functions no funcionan:
```bash
# Verificar estado
az functionapp show --name func-madrid-env-api --resource-group rg-hackathon-madrid-env

# Restart
az functionapp restart --name func-madrid-env-api --resource-group rg-hackathon-madrid-env
```

### Si el frontend no conecta con el backend:
1. Verificar CORS configurado
2. Verificar variable de entorno `REACT_APP_API_URL`
3. Rebuild frontend: `npm run build`

## 📝 Próximos Pasos

1. ✅ Subir código a GitHub
2. ✅ Deploy backend (Functions)
3. ✅ Deploy frontend (Static Web App)
4. ✅ Configurar CORS
5. ✅ Probar end-to-end
6. 🎨 (Opcional) Añadir mapa interactivo con Leaflet
7. 📱 (Opcional) Hacer responsive design
8. 🚀 (Opcional) Añadir más features (notificaciones, histórico, etc.)

## ✨ Features Futuras

- [ ] Mapa interactivo con Leaflet
- [ ] Notificaciones push
- [ ] Histórico de datos
- [ ] Comparativa entre distritos
- [ ] Rutas optimizadas
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Integración con más APIs (tráfico, clima)

---

**Proyecto creado para Hackathon 2025**
**Autor**: Raúl Ortega (r.ortega@prodware.es)
