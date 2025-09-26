# PruebaTecnicaFanz

Un constructor de mapas de asientos interactivo desarrollado con Next.js y TypeScript. Esta aplicación permite crear, editar y gestionar mapas de asientos para teatros, auditorios y otros espacios con múltiples plateas.

## 🎯 Características Principales

- **Constructor Visual**: Interfaz drag-and-drop para crear mapas de asientos
- **Múltiples Plateas**: Soporte para múltiples secciones (plateas) con filas y asientos
- **Gestión de Estados**: Control de disponibilidad de asientos (disponible, ocupado, reservado)
- **Exportación/Importación**: Guardar y cargar mapas en formato JSON
- **Selección Masiva**: Herramientas para seleccionar y modificar múltiples asientos
- **Interfaz Responsiva**: Diseño adaptativo para diferentes tamaños de pantalla
- **Integración con Seats.io**: Renderizado avanzado de mapas de asientos

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/PruebaTecnicaFanz.git
   cd PruebaTecnicaFanz
   ```

2. **Instalar dependencias**
   ```bash
   cd seatmapbuilder
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Ejecuta el servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run start         # Ejecuta la aplicación en modo producción

# Calidad de código
npm run lint          # Ejecuta ESLint para verificar el código
```

## 🏗️ Estructura del Proyecto

```
PruebaTecnicaFanz/
├── seatmapbuilder/           # Aplicación principal Next.js
│   ├── app/                  # Páginas y layouts de Next.js
│   │   ├── globals.css       # Estilos globales
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Página principal
│   ├── components/           # Componentes React
│   │   ├── ui/               # Componentes de UI reutilizables
│   │   ├── SeatCanvas.tsx    # Canvas principal para mapas
│   │   ├── SeatMap.tsx        # Componente de mapa de asientos
│   │   ├── JsonManager.tsx    # Gestión de archivos JSON
│   │   └── ...
│   ├── hooks/                # Custom hooks
│   │   └── useSeatMap.ts     # Hook para gestión de estado
│   ├── lib/                  # Utilidades y esquemas
│   │   ├── schema.ts         # Esquemas de validación Zod
│   │   ├── id-generator.ts   # Generador de IDs únicos
│   │   └── utils.ts          # Funciones utilitarias
│   └── ejemplo-json-ids.json # Ejemplo de estructura de datos
├── propms/                   # Herramientas de prompts
│   ├── generate_prompts.py   # Script para generar prompts
│   ├── chat.md              # Historial de conversaciones
│   └── prompts.jsonl        # Prompts en formato JSONL
└── README.md                # Este archivo
```

## 🎮 Uso de la Aplicación

### Crear un Nuevo Mapa

1. **Definir el nombre del mapa** en el campo superior
2. **Agregar plateas** usando el botón "Agregar Platea"
3. **Configurar filas** para cada platea
4. **Añadir asientos** a las filas según sea necesario

### Gestión de Asientos

- **Seleccionar asientos**: Click individual o arrastrar para selección múltiple
- **Cambiar estado**: Usar los botones de estado (Disponible, Ocupado, Reservado)
- **Eliminar asientos**: Seleccionar y usar el botón de eliminar
- **Agregar asientos**: Botón para añadir 10 asientos a la fila seleccionada

### Exportar/Importar

- **Guardar mapa**: Usar el botón "Guardar JSON" para descargar el archivo
- **Cargar mapa**: Usar el botón "Cargar JSON" para importar un mapa existente
- **Limpiar mapa**: Botón para resetear el mapa actual

## 🔧 Tecnologías Utilizadas

### Frontend
- **Next.js 15.5.4** - Framework React con SSR
- **React 19.1.1** - Biblioteca de UI
- **TypeScript 5.9.2** - Tipado estático
- **Tailwind CSS 4.1.13** - Framework de estilos
- **Framer Motion 12.23.22** - Animaciones

### Herramientas de Desarrollo
- **ESLint** - Linter de código
- **PostCSS** - Procesador de CSS
- **Autoprefixer** - Prefijos CSS automáticos

### Validación y Utilidades
- **Zod 3.23.8** - Validación de esquemas
- **clsx** - Utilidad para clases CSS condicionales
- **Lucide React** - Iconos SVG

## 📊 Estructura de Datos

El mapa de asientos se almacena en formato JSON con la siguiente estructura:

```json
{
  "name": "Nombre del Mapa",
  "plateas": [
    {
      "id": "platea-p1",
      "label": "Platea 1",
      "rows": [
        {
          "id": "fila-p1f1",
          "label": "Fila 1",
          "seats": [
            {
              "id": "seat-p1f1n1",
              "label": "A1",
              "status": "available",
              "x": 20,
              "y": 10
            }
          ]
        }
      ]
    }
  ],
  "createdAt": "2025-01-27T19:00:00.000Z",
  "version": "1.0"
}
```

## 🎨 Personalización

### Estilos
Los estilos se pueden personalizar modificando:
- `app/globals.css` - Estilos globales
- `tailwind.config.js` - Configuración de Tailwind CSS

### Componentes
Los componentes UI están en `components/ui/` y siguen el patrón de diseño de shadcn/ui.

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar el repositorio a Vercel
2. Configurar el directorio de build como `seatmapbuilder`
3. Desplegar automáticamente

### Otras Plataformas
```bash
cd seatmapbuilder
npm run build
npm run start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto es parte de una prueba técnica para Fanz.

## 📞 Contacto

Para preguntas o soporte, contacta al desarrollador del proyecto.

---

**Desarrollado por Pedro González Núñez**