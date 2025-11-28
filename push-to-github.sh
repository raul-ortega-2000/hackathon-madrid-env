#!/bin/bash

# Script para hacer push a GitHub
# Uso: ./push-to-github.sh

echo "🚀 Sincronizando cambios con GitHub..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ]; then
    echo "❌ Error: No se encuentra README.md. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Verificar estado de git
echo "📊 Estado del repositorio:"
git status --short
echo ""

# Intentar push
echo "⬆️  Haciendo push a GitHub..."
if git push origin main; then
    echo ""
    echo "✅ ¡Push exitoso! Los cambios han sido sincronizados con GitHub."
    echo "🔗 Repositorio: https://github.com/raul-ortega-2000/hackathon-madrid-env"
else
    echo ""
    echo "❌ Error al hacer push. Posibles causas:"
    echo "   1. Necesitas autenticarte con GitHub"
    echo "   2. No tienes permisos para hacer push"
    echo ""
    echo "💡 Soluciones:"
    echo "   - Ejecuta: git push origin main (y autentícate cuando se solicite)"
    echo "   - O usa un Personal Access Token:"
    echo "     git remote set-url origin https://TU_TOKEN@github.com/raul-ortega-2000/hackathon-madrid-env.git"
    exit 1
fi

