# 🚀 Configuración de Deployment - Madrid Ambiental

## 📊 Estado Actual

### ✅ Infraestructura Azure (Completada)
- **Resource Group**: `rg-hackathon-madrid-env` (West Europe)
- **Storage Account**: `sthackathonmadenv`
- **Function App**: `func-madrid-env-api`
  - URL: https://func-madrid-env-api.azurewebsites.net
  - Runtime: Node.js 20
  - Plan: Consumption
  - **Deployment Center**: Conectado a GitHub con OIDC
- **Static Web App**: `swa-madrid-env`
  - URL: https://blue-mud-0443bd103.3.azurestaticapps.net
  - Tier: Free
- **Application Insights**: Configurado automáticamente

### 🔄 GitHub Actions (Configurado)

#### Backend Deployment
- **Workflow**: `.github/workflows/main_func-madrid-env-api.yml`
- **Estado**: ✅ Configurado automáticamente por Azure
- **Trigger**: Push a `main` en carpeta `api/`
- **Autenticación**: OIDC (sin secretos)
- **Secretos configurados** (automáticos):
  - `AZUREAPPSERVICE_CLIENTID_C582A0E82FC94A5ABE5F23C8C7FFFA34`
  - `AZUREAPPSERVICE_TENANTID_E5F5183651D748A79F4E63563CE535CF`
  - `AZUREAPPSERVICE_SUBSCRIPTIONID_29575BDD464C48A6A8363D51E32910AA`

#### Frontend Deployment
- **Workflow**: `.github/workflows/deploy-frontend.yml`
- **Estado**: ⚠️ Requiere configuración de secret
- **Trigger**: Push a `main` en carpeta `frontend-app/`
- **Secreto requerido**: `AZURE_STATIC_WEB_APPS_API_TOKEN`

## 🔐 Configurar Secret del Frontend

### Opción 1: GitHub Web UI (Recomendado)

1. **Obtener el token** (ya ejecutado):
```bash
az staticwebapp secrets list --name swa-madrid-env \
  --resource-group rg-hackathon-madrid-env \
  --query "properties.apiKey" -o tsv
```

**Token actual**:
```
51ff1e2bc195431900c5a21a7eda163fab4ecfa3c4d0c744ddaad19ed78b6fa103-18ace8ce-33dc-4e76-9a57-fe02937cc46500302320443bd103
```

2. **Añadir secret en GitHub**:
   - URL: https://github.com/raul-ortega-2000/hackathon-madrid-env/settings/secrets/actions
   - Click "New repository secret"
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: [pegar el token de arriba]
   - Click "Add secret"

3. **Ejecutar workflow manualmente**:
   - URL: https://github.com/raul-ortega-2000/hackathon-madrid-env/actions
   - Seleccionar "Deploy Frontend to Azure Static Web App"
   - Click "Run workflow" → "Run workflow"

### Opción 2: GitHub CLI

```bash
# Instalar gh CLI (si no está instalado)
sudo snap install gh

# Autenticar
gh auth login

# Añadir secret
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body "51ff1e2bc195431900c5a21a7eda163fab4ecfa3c4d0c744ddaad19ed78b6fa103-18ace8ce-33dc-4e76-9a57-fe02937cc46500302320443bd103"

# Trigger workflow
gh workflow run deploy-frontend.yml
```

## 📋 Verificar Deployments

### Backend (Azure Functions)

```bash
# Listar funciones desplegadas
az functionapp function list --name func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env -o table

# Probar endpoint
curl "https://func-madrid-env-api.azurewebsites.net/api/airquality?lat=40.4168&lon=-3.7038"
```

**Endpoints esperados**:
- ✅ `/api/airquality` - Calidad del aire
- ✅ `/api/recycling` - Puntos de reciclaje
- ✅ `/api/recommendations` - Recomendaciones
- ✅ `/api/zonestats` - Estadísticas por zona

### Frontend (Static Web App)

```bash
# Obtener URL
az staticwebapp show --name swa-madrid-env \
  --resource-group rg-hackathon-madrid-env \
  --query "defaultHostname" -o tsv

# Abrir en navegador
xdg-open https://blue-mud-0443bd103.3.azurestaticapps.net
```

**Verificaciones**:
- ✅ Página carga sin errores
- ✅ Mapa de Leaflet visible
- ✅ Geolocalización funciona
- ✅ Llamadas API al backend exitosas
- ✅ Datos de calidad del aire mostrados

## 🐛 Troubleshooting

### Backend no responde

```bash
# Ver logs de la Function App
az webapp log tail --name func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env

# Ver deployment history
az functionapp deployment list --name func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env -o table

# Verificar GitHub Actions
# URL: https://github.com/raul-ortega-2000/hackathon-madrid-env/actions
```

### Frontend muestra página por defecto

**Síntomas**: "Congratulations on your new site!"

**Soluciones**:
1. Verificar que el secret `AZURE_STATIC_WEB_APPS_API_TOKEN` está configurado
2. Ejecutar workflow manualmente
3. Verificar que el build de React completó exitosamente en GitHub Actions
4. Confirmar que `output_location: "build"` coincide con el directorio de salida de React

### CORS Errors

```bash
# Verificar CORS configurado
az functionapp cors show --name func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env

# Agregar origen si falta
az functionapp cors add --name func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env \
  --allowed-origins "https://blue-mud-0443bd103.3.azurestaticapps.net"
```

## 📱 Mobile App (Expo)

La app móvil no requiere deployment a Azure. Se ejecuta localmente:

```bash
cd mobile-app
npm install
npx expo start
```

**Conectar con backend**:
- La app móvil también usa `https://func-madrid-env-api.azurewebsites.net/api`
- Archivo: `mobile-app/services/api.ts`
- Una vez el backend esté desplegado, la app móvil funcionará automáticamente

## 🔄 Workflow de Desarrollo

### Cambios en Backend (API)
```bash
# 1. Modificar código en api/
vim api/getAirQuality/index.js

# 2. Commit y push
git add api/
git commit -m "feat: Update air quality calculation"
git push origin main

# 3. GitHub Actions despliega automáticamente
# Monitor: https://github.com/raul-ortega-2000/hackathon-madrid-env/actions
```

### Cambios en Frontend
```bash
# 1. Modificar código en frontend-app/
vim frontend-app/src/App.js

# 2. Commit y push
git add frontend-app/
git commit -m "feat: Add new map feature"
git push origin main

# 3. GitHub Actions despliega automáticamente (si secret configurado)
```

### Rollback
```bash
# Revertir a commit anterior
git log --oneline
git revert <commit-hash>
git push origin main

# El nuevo commit triggerea deployment automático
```

## ✅ Checklist Final

### Backend
- [ ] GitHub Actions workflow ejecutado exitosamente
- [ ] 4 funciones listadas en Azure Portal
- [ ] Endpoints responden con datos reales
- [ ] CORS configurado correctamente
- [ ] Application Insights recibiendo telemetría

### Frontend
- [ ] Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` configurado
- [ ] GitHub Actions workflow ejecutado exitosamente
- [ ] Static Web App muestra aplicación React (no página default)
- [ ] Mapa de Leaflet carga correctamente
- [ ] Llamadas a backend exitosas (sin CORS errors)
- [ ] Variables de entorno configuradas (`REACT_APP_API_URL`)

### Mobile
- [ ] Expo Metro server funciona
- [ ] App carga en <10 segundos
- [ ] Permisos de geolocalización solicitados
- [ ] Conexión al backend exitosa
- [ ] Datos de calidad del aire mostrados

## 📞 Soporte

**GitHub Actions Logs**:
https://github.com/raul-ortega-2000/hackathon-madrid-env/actions

**Azure Portal**:
https://portal.azure.com/#@b5a68ec8-e110-4be5-b500-173db93ba29f/resource/subscriptions/fb57430f-fe28-4ea8-afae-7d1297296376/resourceGroups/rg-hackathon-madrid-env/overview

**Deployment Center (Function App)**:
https://portal.azure.com/#@b5a68ec8-e110-4be5-b500-173db93ba29f/resource/subscriptions/fb57430f-fe28-4ea8-afae-7d1297296376/resourceGroups/rg-hackathon-madrid-env/providers/Microsoft.Web/sites/func-madrid-env-api/vstscd
