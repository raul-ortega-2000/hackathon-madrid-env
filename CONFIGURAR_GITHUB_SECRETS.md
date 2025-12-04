# 🔐 Configurar GitHub Secrets para Deployment

## ⚠️ ACCIÓN REQUERIDA

El workflow de GitHub Actions necesita estos secretos configurados para funcionar con OIDC.

## 📋 Secretos a Configurar

Ve a: **https://github.com/raul-ortega-2000/hackathon-madrid-env/settings/secrets/actions**

Y agrega los siguientes secrets (Settings → Secrets and variables → Actions → New repository secret):

### 1. AZURE_CLIENT_ID
```
c038b8c8-c0b6-4fbd-84ca-21272d9d3fd3
```

### 2. AZURE_TENANT_ID
```
b5a68ec8-e110-4be5-b500-173db93ba29f
```

### 3. AZURE_SUBSCRIPTION_ID
```
fb57430f-fe28-4ea8-afae-7d1297296376
```

### 4. AZURE_STATIC_WEB_APPS_API_TOKEN
```
51ff1e2bc195431900c5a21a7eda163fab4ecfa3c4d0c744ddaad19ed78b6fa103-18ace8ce-33dc-4e76-9a57-fe02937cc46500302320443bd103
```

## 🚀 Pasos a Seguir

1. **Abre GitHub Secrets**
   - Ve a: https://github.com/raul-ortega-2000/hackathon-madrid-env/settings/secrets/actions
   - (Requiere permisos de admin en el repo)

2. **Agregar cada secret**
   - Click en "New repository secret"
   - Name: `AZURE_CLIENT_ID`
   - Secret: `26e16c4b-0afc-4dd6-8d23-45a97326447e`
   - Click "Add secret"
   - Repetir para los otros 3 secretos

3. **Verificar**
   - Deberías ver 4 secretos configurados
   - No se mostrarán los valores (por seguridad)

4. **Ejecutar Deployment**
   - Ve a: https://github.com/raul-ortega-2000/hackathon-madrid-env/actions
   - Selecciona "Deploy to Azure"
   - Click "Run workflow" → "Run workflow"

## 🔍 Verificación

Una vez configurados los secretos, el workflow podrá:
- ✅ Autenticarse con Azure usando OIDC (sin passwords)
- ✅ Desplegar Azure Functions
- ✅ Desplegar Static Web App

## 📝 Alternativa: Usar Azure CLI para configurar secretos

Si tienes instalado GitHub CLI (`gh`):

```bash
# Instalar gh CLI (si no está)
sudo snap install gh

# Autenticarse
gh auth login

# Configurar secrets
gh secret set AZURE_CLIENT_ID -b "c038b8c8-c0b6-4fbd-84ca-21272d9d3fd3" -R raul-ortega-2000/hackathon-madrid-env
gh secret set AZURE_TENANT_ID -b "b5a68ec8-e110-4be5-b500-173db93ba29f" -R raul-ortega-2000/hackathon-madrid-env
gh secret set AZURE_SUBSCRIPTION_ID -b "fb57430f-fe28-4ea8-afae-7d1297296376" -R raul-ortega-2000/hackathon-madrid-env
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b "51ff1e2bc195431900c5a21a7eda163fab4ecfa3c4d0c744ddaad19ed78b6fa103-18ace8ce-33dc-4e76-9a57-fe02937cc46500302320443bd103" -R raul-ortega-2000/hackathon-madrid-env
```

## ⚙️ Qué se ha cambiado

1. **Workflow actualizado** (`.github/workflows/deploy.yml`)
   - ✅ Cambiado de `publish-profile` a **OIDC authentication**
   - ✅ Agregado `permissions: id-token: write`
   - ✅ Agregado paso `Azure Login with OIDC`
   - ✅ Eliminado uso de `publish-profile` (que causaba el error 401)

2. **Ventajas de OIDC**
   - ✅ Sin secretos/passwords en GitHub
   - ✅ Tokens de corta duración (más seguro)
   - ✅ Renovación automática
   - ✅ Mejor práctica de seguridad

## 🐛 Solución al Error Original

**Error anterior:**
```
Error: Failed to fetch Kudu App Settings.
Unauthorized (CODE: 401)
```

**Causa:** El `publish-profile` estaba desactualizado o inválido.

**Solución:** Cambiar a OIDC authentication (más seguro y sin mantenimiento de credenciales).

---

**Fecha**: 2025-12-04
**Creado por**: Azure Architect Pro Agent
