# 📸 Instrucciones para Copiar el Logo

## Pasos para copiar el logo

1. **Ubica el logo en tu carpeta Descargas:**
   - El archivo está en: `C:\Users\ad_ca\Downloads\logo_fatmac (2).png`

2. **Copia el logo a la carpeta public:**
   - Copia el archivo
   - Pégalo en: `frontend/public/logo-fatmac.png`
   - **IMPORTANTE:** El nombre debe ser exactamente `logo-fatmac.png` (sin espacios ni paréntesis)

3. **Verificar que funcione:**
   - El logo debería aparecer automáticamente en el header
   - Si no aparece, verifica que el nombre del archivo sea exactamente `logo-fatmac.png`

## Comando rápido (PowerShell)

```powershell
Copy-Item "C:\Users\ad_ca\Downloads\logo_fatmac (2).png" -Destination "frontend\public\logo-fatmac.png" -Force
```

## Nota

Si el archivo tiene espacios o caracteres especiales, renómbralo primero a `logo-fatmac.png` antes de copiarlo.

