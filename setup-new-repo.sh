#!/bin/bash

# Script para configurar un nuevo repositorio en GitHub
# Uso: ./setup-new-repo.sh TU_USUARIO_GITHUB NOMBRE_REPOSITORIO

GITHUB_USER=${1:-""}
REPO_NAME=${2:-"hackathon-madrid-env"}

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Error: Debes proporcionar tu usuario de GitHub"
    echo ""
    echo "Uso: ./setup-new-repo.sh TU_USUARIO_GITHUB [NOMBRE_REPOSITORIO]"
    echo ""
    echo "Ejemplo:"
    echo "  ./setup-new-repo.sh AweFullPeople hackathon-madrid-env"
    exit 1
fi

echo "🚀 Configurando nuevo repositorio en GitHub"
echo "=========================================="
echo ""
echo "Usuario GitHub: $GITHUB_USER"
echo "Nombre repositorio: $REPO_NAME"
echo ""

# Paso 1: Crear repositorio en GitHub
echo "📝 PASO 1: Crear repositorio en GitHub"
echo "----------------------------------------"
echo ""
echo "1. Ve a: https://github.com/new"
echo "2. Nombre del repositorio: $REPO_NAME"
echo "3. Descripción: 'Consulta Ambiental Madrid - Plataforma móvil con datos ambientales en tiempo real'"
echo "4. Visibilidad: Público (o Privado si prefieres)"
echo "5. NO marques 'Add a README file' (ya tenemos uno)"
echo "6. NO marques 'Add .gitignore' (ya tenemos uno)"
echo "7. NO marques 'Choose a license' (ya tenemos MIT)"
echo "8. Click en 'Create repository'"
echo ""
read -p "Presiona Enter cuando hayas creado el repositorio en GitHub..."

# Paso 2: Cambiar el remote
echo ""
echo "📡 PASO 2: Configurando remote del repositorio"
echo "----------------------------------------------"

# Cambiar origin a tu nuevo repositorio
git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

# Mantener el repositorio de Raúl como upstream (opcional, para referencia)
git remote set-url upstream "https://github.com/raul-ortega-2000/hackathon-madrid-env.git"

echo "✅ Remote configurado:"
git remote -v
echo ""

# Paso 3: Hacer push
echo "⬆️  PASO 3: Subiendo código a GitHub"
echo "------------------------------------"
echo ""

if git push -u origin main; then
    echo ""
    echo "✅ ¡Éxito! Tu repositorio ha sido creado y sincronizado."
    echo ""
    echo "🔗 Tu repositorio: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📊 Para verificar:"
    echo "   git remote -v"
    echo "   git status"
else
    echo ""
    echo "❌ Error al hacer push. Posibles causas:"
    echo "   1. El repositorio no existe en GitHub"
    echo "   2. Necesitas autenticarte"
    echo "   3. No tienes permisos"
    echo ""
    echo "💡 Soluciones:"
    echo "   - Verifica que el repositorio existe: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo "   - Si necesitas autenticarte, usa un Personal Access Token"
    echo "   - Ejecuta manualmente: git push -u origin main"
    exit 1
fi

