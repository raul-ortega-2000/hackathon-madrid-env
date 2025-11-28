#!/bin/bash
set -e

echo "🔐 Configurando GitHub Secrets para el deployment..."

# Token de Static Web App
SWA_TOKEN=$(az staticwebapp secrets list --name swa-madrid-env --resource-group rg-hackathon-madrid-env --query "properties.apiKey" -o tsv)

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 COPIA ESTE TOKEN Y AÑÁDELO COMO SECRET EN GITHUB:"
echo ""
echo "1. Ve a: https://github.com/raul-ortega-2000/hackathon-madrid-env/settings/secrets/actions"
echo "2. Click en 'New repository secret'"
echo "3. Nombre: AZURE_STATIC_WEB_APPS_API_TOKEN"
echo "4. Valor:"
echo ""
echo "$SWA_TOKEN"
echo ""
echo "5. Click en 'Add secret'"
echo ""
echo "🚀 Después ejecuta el workflow manualmente:"
echo "   https://github.com/raul-ortega-2000/hackathon-madrid-env/actions/workflows/deploy-frontend.yml"
