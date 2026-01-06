# 📸 Instrucciones para Agregar el Logo

## Pasos para copiar el logo desde Descargas

1. **Ubica el logo en tu carpeta Descargas:**
   - Abre la carpeta `Descargas` de tu PC
   - Busca el archivo del logo de FATMAC (puede ser .png, .jpg, .svg, etc.)

2. **Copia el logo a la carpeta public:**
   - Copia el archivo del logo
   - Pégalo en: `frontend/public/logo-fatmac.png`
   - Si el archivo tiene otra extensión (.jpg, .svg), renómbralo a `logo-fatmac.png` o actualiza la ruta en `Header.jsx`

3. **Verificar que funcione:**
   - El logo debería aparecer automáticamente en el header
   - Si no aparece, verifica que el nombre del archivo coincida con `/logo-fatmac.png`

## Rutas alternativas

Si el logo tiene otro nombre o extensión, puedes:
- Renombrarlo a `logo-fatmac.png` en la carpeta `public/`
- O actualizar la ruta en `frontend/src/components/Header.jsx` línea 20

## Formato recomendado

- **Formato:** PNG con fondo transparente
- **Tamaño:** 200-300px de altura (el ancho se ajusta automáticamente)
- **Nombre:** `logo-fatmac.png`

