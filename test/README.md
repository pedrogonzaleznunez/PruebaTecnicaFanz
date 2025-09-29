# Testing Suite - SeatMapBuilder

Este directorio contiene la suite de testing para validar la estructura y formato de los archivos JSON del SeatMapBuilder.

## 📁 Estructura

```
test/
├── package.json              # Configuración de dependencias de testing
├── vitest.config.ts          # Configuración de Vitest
├── README.md                 # Este archivo
├── fixtures/                 # Archivos de prueba JSON
│   ├── valid-seatmap.json    # JSON válido completo
│   ├── invalid-seatmap.json  # JSON con errores de validación
│   └── edge-cases.json       # Casos límite y especiales
├── json-validation.test.ts   # Tests de validación de archivos JSON
└── schema-validation.test.ts # Tests de validación de esquemas Zod
```

## 🚀 Instalación y Uso

### 1. Instalar dependencias
```bash
cd test/
npm install
```

### 2. Ejecutar tests
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests una vez (sin watch)
npm run test:run

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar solo tests de JSON
npm run test:json

# Ejecutar solo tests de esquemas
npm run test:schema
```

## 📋 Tipos de Tests

### 1. **JSON Validation Tests** (`json-validation.test.ts`)
- ✅ Valida archivos JSON completos contra el esquema
- ✅ Verifica estructura de datos válida
- ✅ Rechaza archivos con errores de formato
- ✅ Maneja casos límite y archivos vacíos
- ✅ Verifica integridad de datos después de la validación

### 2. **Schema Validation Tests** (`schema-validation.test.ts`)
- ✅ Valida esquemas individuales (Seat, Row, Platea, SeatMap)
- ✅ Verifica tipos de datos correctos
- ✅ Rechaza valores inválidos
- ✅ Maneja campos opcionales y valores por defecto
- ✅ Verifica seguridad de tipos TypeScript

## 🧪 Fixtures de Prueba

### `valid-seatmap.json`
- Teatro completo con 2 plateas
- 6 asientos en total
- Todos los campos requeridos y opcionales
- Metadatos incluidos

### `invalid-seatmap.json`
- Errores intencionales de validación:
  - IDs vacíos
  - Coordenadas no numéricas
  - Status inválido
  - Labels vacíos

### `edge-cases.json`
- Platea vacía (sin filas)
- Platea con un solo asiento
- Campos meta personalizados
- Coordenadas en cero

## 🔍 Validaciones Incluidas

### **Seat Schema**
- ✅ ID y label no vacíos
- ✅ Status válido: `available`, `occupied`, `selected`, `unlabeled`
- ✅ Coordenadas numéricas (x, y)
- ✅ Campo meta opcional

### **Row Schema**
- ✅ ID y label no vacíos
- ✅ Array de seats válido
- ✅ Campo selected opcional

### **Platea Schema**
- ✅ ID y label no vacíos
- ✅ Coordenadas y dimensiones numéricas
- ✅ Valores por defecto: x=0, y=0, width=200, height=150
- ✅ Array de rows válido
- ✅ Campo selected opcional

### **SeatMap Schema**
- ✅ Nombre no vacío
- ✅ Array de plateas válido
- ✅ Campos opcionales: createdAt, version, metadata
- ✅ Estructura de metadata válida

## 📊 Cobertura de Tests

Los tests cubren:
- ✅ **Validación positiva**: Archivos JSON válidos
- ✅ **Validación negativa**: Archivos con errores
- ✅ **Casos límite**: Valores extremos y vacíos
- ✅ **Tipos de datos**: Strings, números, arrays, objetos
- ✅ **Campos opcionales**: Presencia y ausencia
- ✅ **Enums**: Valores válidos e inválidos
- ✅ **Estructura anidada**: Objetos complejos
- ✅ **Integridad de datos**: Consistencia después de validación

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Asegúrate de estar en el directorio test/
cd test/
npm install
```

### Error: "Schema not found"
```bash
# Verifica que el path del schema sea correcto
# El archivo debe estar en: ../seatmapbuilder/lib/schema.ts
```

### Error: "Fixture not found"
```bash
# Verifica que los archivos estén en test/fixtures/
ls -la test/fixtures/
```

## 🔧 Configuración

### Vitest Config
- **Environment**: Node.js
- **Globals**: Habilitados
- **Aliases**: Configurados para importar desde el proyecto principal
- **Include**: `**/*.test.ts`, `**/*.test.js`

### TypeScript
- Compatible con TypeScript 5.9+
- Soporte para ES modules
- Path mapping configurado

## 📝 Notas

- Los tests usan **Vitest** como framework de testing
- **Zod** para validación de esquemas
- **TypeScript** para seguridad de tipos
- Los fixtures son archivos JSON reales del proyecto
- Los tests se ejecutan en Node.js environment

---

**Suite de testing desarrollada para garantizar la integridad de los datos JSON del SeatMapBuilder**
