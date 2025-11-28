# 📚 Guía: Crear Nuevo Repositorio en GitHub

## 🎯 Objetivo
Crear un nuevo repositorio en tu perfil de GitHub y subir todo el código del proyecto.

## 📋 Pasos a Seguir

### Paso 1: Crear el Repositorio en GitHub

1. **Ve a GitHub y crea un nuevo repositorio:**
   - URL: https://github.com/new
   - O click en el botón "+" en la esquina superior derecha → "New repository"

2. **Configura el repositorio:**
   - **Repository name**: `hackathon-madrid-env` (o el nombre que prefieras)
   - **Description**: `Consulta Ambiental Madrid - Plataforma móvil con datos ambientales en tiempo real`
   - **Visibility**: 
     - ✅ **Public** (recomendado para hackathon)
     - O **Private** si prefieres mantenerlo privado
   
3. **IMPORTANTE - NO marques estas opciones:**
   - ❌ Add a README file (ya tenemos uno)
   - ❌ Add .gitignore (ya tenemos uno)
   - ❌ Choose a license (ya tenemos MIT License)

4. **Click en "Create repository"**

### Paso 2: Ejecutar el Script de Configuración

Una vez creado el repositorio en GitHub, ejecuta:

```bash
./setup-new-repo.sh TU_USUARIO_GITHUB
```

**Ejemplo:**
```bash
./setup-new-repo.sh AweFullPeople
```

O si quieres un nombre diferente para el repositorio:
```bash
./setup-new-repo.sh AweFullPeople mi-hackathon-madrid
```

### Paso 3: Configuración Manual (Alternativa)

Si prefieres hacerlo manualmente:

#### 2.1 Cambiar el remote
```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote set-url origin https://github.com/TU_USUARIO/hackathon-madrid-env.git

# Verificar
git remote -v
```

#### 2.2 Hacer push
```bash
git push -u origin main
```

Cuando se solicite autenticación:
- **Username**: Tu usuario de GitHub
- **Password**: Usa un **Personal Access Token** (no tu contraseña)

### Paso 4: Crear Personal Access Token (si es necesario)

Si GitHub te pide autenticación:

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. **Note**: "Hackathon Madrid Env"
4. **Expiration**: Elige una fecha (ej: 90 días)
5. **Select scopes**: Marca `repo` (todos los permisos de repositorio)
6. Click en "Generate token"
7. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)
8. Úsalo como contraseña cuando git lo solicite

## ✅ Verificación

Después del push, verifica que todo está correcto:

```bash
# Verificar remotes
git remote -v

# Verificar estado
git status

# Ver commits
git log --oneline -5
```

Tu repositorio debería estar disponible en:
`https://github.com/TU_USUARIO/hackathon-madrid-env`

## 🔄 Mantener Sincronización con el Repositorio Original (Opcional)

Si quieres mantener el repositorio de Raúl como referencia:

```bash
# El repositorio de Raúl ya está configurado como 'upstream'
git remote -v

# Para obtener cambios del repositorio original (si es necesario)
git fetch upstream

# Para ver diferencias
git log HEAD..upstream/main
```

## 🆘 Solución de Problemas

### Error: "remote origin already exists"
```bash
# Eliminar el remote actual
git remote remove origin

# Agregar el nuevo
git remote add origin https://github.com/TU_USUARIO/hackathon-madrid-env.git
```

### Error: "Authentication failed"
- Verifica que estás usando un Personal Access Token, no tu contraseña
- Asegúrate de que el token tiene permisos `repo`

### Error: "Repository not found"
- Verifica que el repositorio existe en GitHub
- Verifica que el nombre del repositorio es correcto
- Verifica que tienes permisos de escritura

## 📝 Notas

- El repositorio de Raúl se mantiene como `upstream` para referencia
- Tu nuevo repositorio será el `origin`
- Todos los commits y el historial se mantienen
- El README y todos los archivos se subirán correctamente

