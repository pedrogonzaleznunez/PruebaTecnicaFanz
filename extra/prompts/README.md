# Prompts - Herramientas de Prompts

Este directorio contiene herramientas para procesar y generar prompts a partir de conversaciones exportadas desde Cursor.

## 📁 Archivos

- **`run.sh`** - Script principal para ejecutar el procesamiento
- **`generate_prompts.py`** - Script Python que convierte markdown a prompts JSONL
- **`chat.md`** - Archivo de conversación exportado desde Cursor
- **`prompts.jsonl`** - Archivo de salida con prompts en formato JSONL

## 🚀 Uso del Script run.sh

### Sintaxis
```bash
./run.sh <nombre_del_archivo_chat>
```

### Ejemplos
```bash
# Procesar el archivo chat.md
./run.sh chat.md

# Procesar otro archivo de conversación
./run.sh mi_conversacion.md
```

### ¿Qué hace el script?

1. **Verifica** que el archivo de chat existe en el directorio actual
2. **Ejecuta** `generate_prompts.py` con los parámetros correctos
3. **Genera** el archivo `prompts.jsonl` con los prompts procesados
4. **Incluye** mensajes del assistant por defecto (`--include-assistant`)

### Parámetros del Script

El script ejecuta automáticamente:
```bash
python3 generate_prompts.py <archivo_chat> prompts.jsonl --include-assistant
```

- `--include-assistant`: Incluye mensajes del assistant/cursor en el output
- El archivo de salida siempre será `prompts.jsonl`

## 📋 Requisitos

- **Python 3.6+** instalado en el sistema
- **Archivo de chat** en formato Markdown exportado desde Cursor
- **Permisos de ejecución** en el script (`chmod +x run.sh`)

## 🔧 Configuración

### Dar permisos de ejecución
```bash
chmod +x run.sh
```

### Verificar archivos disponibles
```bash
ls -la *.md
```

## 📊 Formato de Salida

El script genera un archivo `prompts.jsonl` donde cada línea es un objeto JSON con:

```json
{
  "role": "user|assistant",
  "content": "Contenido del mensaje",
  "timestamp": "2025-01-27T19:00:00Z",
  "purpose": "Descripción inferida del propósito"
}
```

## 🐛 Solución de Problemas

### Error: "El archivo no existe"
- Verifica que el archivo `.md` esté en el directorio `propmts/`
- Usa el nombre exacto del archivo (incluyendo la extensión)

### Error: "Permission denied"
```bash
chmod +x run.sh
```

### Error: "python3: command not found"
- Instala Python 3 en tu sistema
- En macOS: `brew install python3`
- En Ubuntu: `sudo apt install python3`

## 📝 Notas

- El script siempre se ejecuta desde el directorio `prompts/`
- Los archivos de entrada deben ser exportaciones de Cursor en formato Markdown
- El archivo de salida `prompts.jsonl` se sobrescribe en cada ejecución

---

**Herramienta desarrollada para procesar conversaciones de Cursor y generar datasets de prompts**
