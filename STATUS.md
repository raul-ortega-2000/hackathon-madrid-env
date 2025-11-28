# 🎉 Deployment Status - Madrid Ambiental

## ✅ Recursos Azure Desplegados

### 1. Resource Group
- **Nombre**: `rg-hackathon-madrid-env`
- **Región**: West Europe
- **Estado**: ✅ Activo

### 2. Storage Account
- **Nombre**: `sthackathonmadenv`
- **Tipo**: Standard LRS
- **Estado**: ✅ Activo

### 3. Function App (Backend API)
- **Nombre**: `func-madrid-env-api`
- **URL**: `https://func-madrid-env-api.azurewebsites.net`
- **Runtime**: Node.js 20
- **Plan**: Consumption (Serverless)
- **CORS**: ✅ Configurado (permite todas las origins)
- **Estado**: ✅ Activo

**Endpoints API disponibles:**
```
GET https://func-madrid-env-api.azurewebsites.net/api/airquality?lat=40.4168&lon=-3.7038
GET https://func-madrid-env-api.azurewebsites.net/api/recycling?lat=40.4168&lon=-3.7038&radius=1000
GET https://func-madrid-env-api.azurewebsites.net/api/recommendations?lat=40.4168&lon=-3.7038
GET https://func-madrid-env-api.azurewebsites.net/api/zonestats?district=Centro
```

### 4. Static Web App (Frontend)
- **Nombre**: `swa-madrid-env`
- **URL**: `https://blue-mud-0443bd103.3.azurestaticapps.net`
- **Tier**: Free
- **Estado**: ✅ Activo
- **Deployment Token**: Guardado

## 📋 Siguientes Pasos para Completar

### Paso 1: Subir Código a GitHub

El código está listo en: `/home/rortega/source/rortega/hackathon-madrid-env`

**Opción A - Crear repo nuevo manualmente:**
```bash
# 1. Ve a https://github.com/new
# 2. Nombre del repo: hackathon-madrid-env
# 3. Público
# 4. NO inicializar con README

# Luego ejecuta:
cd /home/rortega/source/rortega/hackathon-madrid-env
git remote add origin https://github.com/TU-USUARIO/hackathon-madrid-env.git
git push -u origin main
```

**Opción B - Instalar gh CLI:**
```bash
sudo snap install gh
gh auth login
cd /home/rortega/source/rortega/hackathon-madrid-env
gh repo create hackathon-madrid-env --public --source=. --remote=origin --push
```

### Paso 2: Desplegar Backend (Azure Functions)

**Opción A - Manual desde Azure Portal:**
1. Ve a https://portal.azure.com
2. Busca `func-madrid-env-api`
3. Deployment Center → GitHub
4. Autorizar GitHub y seleccionar:
   - Organization: TU-USUARIO
   - Repository: hackathon-madrid-env
   - Branch: main
   - Build Provider: GitHub Actions
   - Path: `/api`

**Opción B - Instalar Azure Functions Core Tools:**
```bash
# Instalar Functions Core Tools
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Deploy
cd /home/rortega/source/rortega/hackathon-madrid-env/api
func azure functionapp publish func-madrid-env-api
```

**Opción C - Usar Azure CLI con zip:**
```bash
# Instalar zip
sudo apt install zip -y

# Crear zip y deploy
cd /home/rortega/source/rortega/hackathon-madrid-env/api
zip -r ../api-deployment.zip . -x "node_modules/*" ".git/*"
cd ..
az functionapp deployment source config-zip \
  --resource-group rg-hackathon-madrid-env \
  --name func-madrid-env-api \
  --src api-deployment.zip
```

### Paso 3: Desplegar Frontend (Static Web App)

Después de subir el código a GitHub:

```bash
# Configurar Static Web App con GitHub
az staticwebapp update \
  --name swa-madrid-env \
  --resource-group rg-hackathon-madrid-env \
  --source https://github.com/TU-USUARIO/hackathon-madrid-env \
  --branch main \
  --app-location "/frontend-app" \
  --output-location "build"
```

O desde Azure Portal:
1. Ve a https://portal.azure.com
2. Busca `swa-madrid-env`
3. Settings → Configuration → GitHub Actions
4. Conectar con GitHub y configurar:
   - Repository: hackathon-madrid-env
   - Branch: main
   - App location: `/frontend-app`
   - Output location: `build`

### Paso 4: Configurar Variables de Entorno

En Azure Portal → Static Web App → Configuration → Application settings:

```
REACT_APP_API_URL=https://func-madrid-env-api.azurewebsites.net/api
```

## 🧪 Testing Rápido

### Probar Backend directamente:

```bash
# Test Air Quality
curl "https://func-madrid-env-api.azurewebsites.net/api/airquality?lat=40.4168&lon=-3.7038"

# Test Recycling Points
curl "https://func-madrid-env-api.azurewebsites.net/api/recycling?lat=40.4168&lon=-3.7038&radius=500"

# Test Recommendations  
curl "https://func-madrid-env-api.azurewebsites.net/api/recommendations?lat=40.4168&lon=-3.7038"

# Test Zone Stats
curl "https://func-madrid-env-api.azurewebsites.net/api/zonestats?district=Centro"
```

### Probar Frontend:

Después del deployment, visita:
```
https://blue-mud-0443bd103.3.azurestaticapps.net
```

## 📊 Monitoreo y Logs

### Ver logs de Functions:
```bash
# Logs en vivo
az webapp log tail --name func-madrid-env-api --resource-group rg-hackathon-madrid-env

# O en Azure Portal
# func-madrid-env-api → Monitoring → Log stream
```

### Ver Application Insights:
```bash
# Obtener Instrumentation Key
az monitor app-insights component show \
  --app func-madrid-env-api \
  --resource-group rg-hackathon-madrid-env
```

## 🎯 URLs Finales del Proyecto

| Recurso | URL |
|---------|-----|
| **Frontend** | https://blue-mud-0443bd103.3.azurestaticapps.net |
| **API Base** | https://func-madrid-env-api.azurewebsites.net/api |
| **Azure Portal** | https://portal.azure.com |
| **Application Insights** | En Azure Portal → func-madrid-env-api → Insights |

## 💰 Costos Actuales

- **Static Web App (Free)**: €0/mes
- **Function App (Consumption)**: €0/mes (hasta 1M ejecuciones)
- **Storage Account**: ~€0.50/mes
- **Application Insights**: €0/mes (5GB incluidos)

**Total estimado**: < €1/mes

## 🚀 Estado del Proyecto

- ✅ Infraestructura Azure creada
- ✅ Backend API (4 Functions) - código listo
- ✅ Frontend React - código listo
- ✅ CORS configurado
- ✅ Static Web App creado
- ⏳ Pendiente: Subir código a GitHub
- ⏳ Pendiente: Deploy backend
- ⏳ Pendiente: Deploy frontend
- ⏳ Pendiente: Testing end-to-end

## 📝 Próximo Comando a Ejecutar

```bash
# Primero, sube a GitHub (elige opción A o B arriba)
# Luego, desde Azure Portal configura los deployments
# O instala las herramientas necesarias para deploy desde CLI
```

---

**Proyecto**: Madrid Ambiental - Hackathon 2025
**Autor**: Raúl Ortega (r.ortega@prodware.es)
**Fecha**: 28 de Noviembre de 2025
