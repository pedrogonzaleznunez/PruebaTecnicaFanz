#!/bin/bash

# Script para ejecutar generate.py con el nombre del chat como parámetro
# Uso: ./run.sh <nombre_del_chat>

# Obtener el directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verificar que se proporcione el parámetro
if [ $# -eq 0 ]; then
    echo "Error: Debes proporcionar el nombre del chat"
    echo "Uso: ./run.sh <nombre_del_chat>"
    echo "Ejemplo: ./run.sh chat.md"
    exit 1
fi

# Obtener el nombre del chat del primer parámetro
CHAT_NAME="$1"

# Construir la ruta completa del archivo
CHAT_FILE="$SCRIPT_DIR/$CHAT_NAME"

# Verificar que el archivo existe
if [ ! -f "$CHAT_FILE" ]; then
    echo "Error: El archivo '$CHAT_FILE' no existe"
    echo "Archivos disponibles en prompts/:"
    ls -la "$SCRIPT_DIR/"*.md 2>/dev/null || echo "No se encontraron archivos .md"
    exit 1
fi

# Ejecutar el comando
echo "Ejecutando: python3 $SCRIPT_DIR/generate_prompts.py $CHAT_FILE $SCRIPT_DIR/prompts.jsonl --include-assistant"
python3 "$SCRIPT_DIR/generate_prompts.py" "$CHAT_FILE" "$SCRIPT_DIR/prompts.jsonl" --include-assistant

# Verificar el resultado
if [ $? -eq 0 ]; then
    echo "✅ Comando ejecutado exitosamente"
else
    echo "❌ Error al ejecutar el comando"
    exit 1
fi