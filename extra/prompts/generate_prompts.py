#!/usr/bin/env python3
# md2prompts.py
# Convierte un markdown exportado por Cursor en prompts.jsonl
# Uso:
#   python md2prompts.py history.md prompts.jsonl
# Opciones:
#   --include-assistant   -> también incluir mensajes del assistant/cursor
#   --infer-purpose       -> intentar inferir un "purpose" corto

import re, json, argparse, datetime
from pathlib import Path

def parse_export_ts(text):
    # Busca la línea "Exported on 26/9/2025 at 14:10:18 GMT-3 from Cursor (1.6.45)"
    m = re.search(r'Exported on\s+(.+?)(?:\n|$)', text, re.IGNORECASE)
    if not m:
        return None
    raw = m.group(1).strip()
    # Intentar parsear formato "26/9/2025 at 14:10:18 GMT-3"
    m2 = re.search(r'(\d{1,2})/(\d{1,2})/(\d{4})\s+at\s+(\d{1,2}:\d{2}:\d{2})', raw)
    if m2:
        dd, mm, yyyy, time = m2.groups()
        iso = f"{int(yyyy):04d}-{int(mm):02d}-{int(dd):02d}T{time}"
        # buscar offset GMT
        m3 = re.search(r'GMT([+-]\d+)', raw)
        if m3:
            off = int(m3.group(1))
            tz = f"{off:+03d}:00"
            return iso + tz
        return iso + "Z"
    # fallback: devolver raw
    return raw

def split_blocks(text):
    # Captura bloques como:
    # **User**
    # <contenido>
    # detiene en --- o en el siguiente **Role**
    pattern = re.compile(
        r'\*\*(?P<role>[^*]+)\*\*\s*\n(?P<content>.*?)(?=(?:\n---\n|\n\*\*[^*]+\*\*|\Z))',
        re.DOTALL | re.IGNORECASE
    )
    blocks = []
    for m in pattern.finditer(text):
        role = m.group('role').strip()
        content = m.group('content').strip()
        blocks.append((role, content))
    return blocks

def infer_purpose(text):
    txt = text.lower()
    if 'export' in txt or 'exportar' in txt:
        return 'export/import'
    if 'import' in txt or 'importar' in txt:
        return 'export/import'
    if 'stack' in txt or 'next.js' in txt or 'nextjs' in txt or 'react' in txt or 'typescript' in txt:
        return 'setup'
    if 'error' in txt or 'bug' in txt or 'fix' in txt or 'depuración' in txt:
        return 'debugging'
    if 'prueba técnica' in txt or 'mvp' in txt:
        return 'specification'
    # por defecto, usar la primera línea como resumen corto
    first = text.splitlines()[0].strip()
    return first[:120]

def normalize_role(role):
    r = role.lower()
    if 'user' in r or r == 'yo':
        return 'user'
    if 'cursor' in r or 'assistant' in r or 'ai' in r:
        return 'assistant'
    return role

def main():
    p = argparse.ArgumentParser(description="Convert Cursor-exported .md -> prompts.jsonl")
    p.add_argument('input', help='archivo markdown exportado (ej: history.md)')
    p.add_argument('output', help='salida jsonl (ej: prompts.jsonl)')
    p.add_argument('--infer-purpose', action='store_true', help='intentar inferir el campo "purpose" automáticamente')
    args = p.parse_args()

    txt = Path(args.input).read_text(encoding='utf-8')
    export_ts = parse_export_ts(txt) or datetime.datetime.utcnow().isoformat() + "Z"
    blocks = split_blocks(txt)

    entries = []
    for idx, (role, content) in enumerate(blocks, start=1):
        norm = normalize_role(role)
        # Siempre ignorar mensajes del assistant/IA
        if norm == 'assistant':
            continue
        timestamp = export_ts  # el export generalmente no trae timestamps por mensaje; use el del export
        tool_value = "ChatGPT (gpt-5)"
        prompt = content
        purpose = infer_purpose(content) if args.infer_purpose else ""
        notes = f"role: {role}; block_index: {idx}"
        entry = {
            "timestamp": timestamp,
            "tool": tool_value,
            "purpose": purpose,
            "prompt": prompt,
            "notes": notes
        }
        entries.append(entry)

    with open(args.output, 'w', encoding='utf-8') as f:
        for e in entries:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    print(f"✅ {len(entries)} entradas escritas en {args.output}")

if __name__ == "__main__":
    main()