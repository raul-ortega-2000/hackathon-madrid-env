# 🚀 Deployment Frontend - Static Web App

## ✅ Lo que ya está hecho:

1. ✅ Static Web App creado: `swa-madrid-env`
2. ✅ Workflow de GitHub Actions creado: `.github/workflows/deploy-frontend.yml`
3. ✅ Token de deployment obtenido

## 📋 Pasos para Completar el Deployment

### Paso 1: Configurar el Secret en GitHub

El workflow necesita el token de Azure Static Web App como secret. **Configúralo manualmente**:

1. Ve a: https://github.com/raul-ortega-2000/hackathon-madrid-env/settings/secrets/actions

2. Click en **"New repository secret"**

3. Configura:
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: 
   ```
   51ff1e2bc195431900c5a21a7eda163fab4ecfa3c4d0c744ddaad19ed78b6fa103-18ace8ce-33dc-4e76-9a57-fe02937cc46500302320443bd103
   ```

4. Click en **"Add secret"**

### Paso 2: Configurar Variable de Entorno del Frontend

Necesitas configurar la URL del API en el Static Web App:

**Opción A - Desde Azure Portal:**
1. Ve a: https://portal.azure.com
2. Busca: `swa-madrid-env`
3. Settings → **Configuration**
4. Click en **"+ Add"** en Application settings
5. Añade:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://func-madrid-env-api.azurewebsites.net/api`
6. Click en **"Save"**

**Opción B - Desde Azure CLI:**
```bash
az staticwebapp appsettings set \
  --name swa-madrid-env \
  --resource-group rg-hackathon-madrid-env \
  --setting-names REACT_APP_API_URL=https://func-madrid-env-api.azurewebsites.net/api
```

### Paso 3: Hacer Push del Workflow

```bash
cd /home/rortega/source/rortega/hackathon-madrid-env
git add .github/workflows/deploy-frontend.yml
git add FRONTEND_DEPLOYMENT.md
git commit -m "feat: Add frontend deployment workflow"
git push origin main
```

Esto disparará automáticamente el workflow de GitHub Actions que:
- ✅ Construirá el frontend React
- ✅ Lo desplegará en Azure Static Web App
- ✅ Estará disponible en: https://blue-mud-0443bd103.3.azurestaticapps.net

### Paso 4: Monitorear el Deployment

Después del push, puedes monitorear el progreso:

**En GitHub:**
- Ve a: https://github.com/raul-ortega-2000/hackathon-madrid-env/actions
- Verás el workflow "Azure Static Web Apps CI/CD" ejecutándose

**En Azure Portal:**
- Ve a: https://portal.azure.com
- Busca: `swa-madrid-env`
- Click en **GitHub Actions runs** para ver el progreso

El deployment tarda aproximadamente **2-3 minutos**.

## 🧪 Testing Post-Deployment

Una vez desplegado, prueba la aplicación:

```bash
# Test homepage
curl -I https://blue-mud-0443bd103.3.azurestaticapps.net

# Abre en navegador
xdg-open https://blue-mud-0443bd103.3.azurestaticapps.net
```

O simplemente ve a: https://blue-mud-0443bd103.3.azurestaticapps.net

## 🔍 Verificación de Funcionalidad

La app debería mostrar:
- ✅ Mapa de Madrid con geolocalización
- ✅ Tarjetas de calidad del aire (colores según nivel)
- ✅ Recomendaciones personalizadas
- ✅ Puntos de reciclaje cercanos
- ✅ Estadísticas por distrito

## 🐛 Troubleshooting

### Si el deployment falla:

1. **Verifica el secret**:
   - Ve a: https://github.com/raul-ortega-2000/hackathon-madrid-env/settings/secrets/actions
   - Confirma que `AZURE_STATIC_WEB_APPS_API_TOKEN` existe

2. **Revisa los logs**:
   - Ve a: https://github.com/raul-ortega-2000/hackathon-madrid-env/actions
   - Click en el workflow fallido
   - Revisa los logs de "Build And Deploy"

3. **Verifica la configuración**:
   ```bash
   az staticwebapp show \
     --name swa-madrid-env \
     --resource-group rg-hackathon-madrid-env
   ```

### Si la app carga pero no muestra datos:

1. **Verifica la variable de entorno**:
   ```bash
   az staticwebapp appsettings list \
     --name swa-madrid-env \
     --resource-group rg-hackathon-madrid-env
   ```
   
   Debería mostrar: `REACT_APP_API_URL`

2. **Verifica el backend**:
   ```bash
   curl https://func-madrid-env-api.azurewebsites.net/api/airquality?lat=40.4168&lon=-3.7038
   ```

3. **Revisa la consola del navegador** (F12) para ver errores de CORS o API

## 📊 Resumen de URLs

| Recurso | URL |
|---------|-----|
| **Frontend** | https://blue-mud-0443bd103.3.azurestaticapps.net |
| **Backend API** | https://func-madrid-env-api.azurewebsites.net/api |
| **GitHub Repo** | https://github.com/raul-ortega-2000/hackathon-madrid-env |
| **GitHub Actions** | https://github.com/raul-ortega-2000/hackathon-madrid-env/actions |
| **Azure Portal** | https://portal.azure.com → swa-madrid-env |

## 🎯 Estado Final Esperado

- ✅ Secret configurado en GitHub
- ✅ Variable de entorno configurada en Azure
- ✅ Workflow ejecutado exitosamente
- ✅ Frontend desplegado y accesible
- ✅ API funcionando correctamente
- ✅ Geolocalización activa
- ✅ Datos de Madrid cargándose

---

**Tiempo estimado**: 5-10 minutos (incluyendo configuración manual)
**Costo**: €0/mes (Free tier)
