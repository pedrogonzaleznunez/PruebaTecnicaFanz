# PruebaTecnicaFanz

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

Un constructor de mapas de asientos interactivo desarrollado con Next.js y TypeScript. Esta aplicación permite crear, editar y gestionar mapas de asientos para teatros, auditorios y otros espacios con múltiples plateas.

## Vista principal
![image](extra/public/mainview.png)

![image](extra/public/mainview2.png)

## 🎯 Características Principales

* **Constructor Visual**: Interfaz drag-and-drop para crear mapas de asientos
* **Múltiples Plateas**: Soporte para múltiples secciones (plateas) con filas y asientos
* **Gestión de Estados**: Control de disponibilidad de asientos (libre, ocupado)
* **Exportación/Importación**: importar y exportar mapas en formato JSON
* **Selección Masiva**: Herramientas para seleccionar y modificar múltiples asientos

## 🚀 Instalación

### Prerrequisitos

* Node.js 18+
* npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**

``` bash
git clone https://github.com/pgonzaleznunez/PruebaTecnicaFanz.git
cd PruebaTecnicaFanz
```

2. **Instalar dependencias**

``` bash
cd seatmapbuilder
npm install
```

3. **Ejecutar en modo desarrollo**

``` bash
npm run dev
```

4. **Abrir en el navegador**

```
http://localhost:3000
```

## 📦 Scripts Disponibles

``` bash
# Desarrollo
npm run dev          # Ejecuta el proyecto en modo desarrollo
```

## 🏗️ Estructura del Proyecto

```
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
│   ├── chat.md               # Historial de conversaciones
│   ├── README.md             # Explicacion sobre script generador de prompts 
│   ├── promptsV1.jsonl        # Prompts en formato JSONL
│   ├── promptsV1.jsonl        # Prompts en formato JSONL de la version 1.X
│   └── promptsV2.jsonl        # Prompts en formato JSONL de la version 2.X
└── README.md                # Este archivo
```

## 🎮 Uso de la Aplicación

### Crear un Nuevo Mapa

1. **Definir el nombre del mapa** en el campo superior
2. **Agregar plateas** usando el botón "Agregar Platea"
3. **Configurar filas** para cada platea
4. **Añadir asientos** a las filas según sea necesario

### Gestión de Asientos

* **Seleccionar asientos**: Click individual o arrastrar para selección múltiple
* **Cambiar estado**: Usar los botones de estado (Disponible, Ocupado, Reservado)
* **Eliminar asientos**: Seleccionar y usar el botón de eliminar
* **Agregar asientos**: Botón para añadir 10 asientos a la fila seleccionada

### Exportar/Importar

* **Guardar mapa**: Usar el botón "Guardar JSON" para descargar el archivo
* **Cargar mapa**: Usar el botón "Cargar JSON" para importar un mapa existente
* **Limpiar mapa**: Botón para resetear el mapa actual

## 💻 Atajos utiles:

* **Seleccionar varios asientos**: Seleccionar un asiento, mantener presionado CMD/Cntrl + click en otro asiento. Este comando seleccionará todos los asientos entre ambos clicks.

## 🔧 Tecnologías Utilizadas

### Frontend

* **Next.js 15.5.4** \- Framework React con SSR
* **React 19.1.1** \- Biblioteca de UI
* **TypeScript 5.9.2** \- Tipado estático
* **Tailwind CSS 4.1.13** \- Framework de estilos
* **Framer Motion 12.23.22** \- Animaciones

### Herramientas de Desarrollo

* **ESLint** \- Linter de código
* **PostCSS** \- Procesador de CSS
* **Autoprefixer** \- Prefijos CSS automáticos

### Validación y Utilidades

* **Zod 3.23.8** \- Validación de esquemas
* **clsx** \- Utilidad para clases CSS condicionales
* **Lucide React** \- Iconos SVG

## 📊 Estructura de Datos

El mapa de asientos se almacena en formato JSON con la siguiente estructura:

``` json
{
  "name": "Movistar Arena",
  "plateas": [
    {
      "id": "platea-p1",
      "label": "Platea Izquierda Superior",
      "x": 135,
      "y": 80,
      "width": 220,
      "height": 250,
      "rows": [
        {
          "id": "fila-p1f1",
          "label": "Fila 1",
          "seats": [
            {
              "id": "seat-p1f1n1",
              "x": 0,
              "y": 0,
              "label": "A1",
              "status": "available",

          
            // mora data ...

            }
          ]
        }
      ]
    }
  ]
}



```

## 🎨 Personalización

### Estilos

Los estilos se pueden personalizar modificando:

* `app/globals.css` \- Estilos globales
* `tailwind.config.js` \- Configuración de Tailwind CSS

### Componentes

Los componentes UI están en `components/ui/` y siguen el patrón de diseño de shadcn/ui.



### Otras Plataformas

``` bash
cd seatmapbuilder
npm run build
npm run start
```

## 🧪 Extra

**Desarrollado por Pedro González Núñez**

