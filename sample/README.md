# Sample .elpx — El ciclo del agua

Esta carpeta está reservada para el **recurso eXeLearning de ejemplo**
que acompañará cada release del tema SCUMM.

## Plan

1. Abrir eXeLearning con el tema **SCUMM Adventure** aplicado.
2. Crear un proyecto con la siguiente estructura de nodos:
   - **Inicio** — Cartel introductorio (iDevice Texto libre).
   - **1. Evaporación** — iDevice Observación + imagen `sun + ocean`.
   - **2. Condensación** — iDevice Reflexión + tabla de tipos de nube.
   - **3. Precipitación** — iDevice Actividad (rellenar huecos).
   - **4. Infiltración** — iDevice Reflexión + bloque de éxito.
   - **Debate** — iDevice Debate (para discusión en clase).
   - **Actividad final** — iDevice Pregunta SCORM.
3. Exportar como **Página única** y como **Sitio Web**.
4. Guardar el `.elpx` original aquí como `el-ciclo-del-agua.elpx`.
5. Opcional: incluir la carpeta descomprimida (`content.xml` +
   `resources/`) para que el repo sirva también como material
   depurable en bruto.

## Estructura final esperada

```
sample/
├── el-ciclo-del-agua.elpx       ← ZIP del proyecto eXeLearning
├── el-ciclo-del-agua/           ← (opcional) .elpx descomprimido
│   ├── contentv3.xml
│   └── resources/
└── README.md                    ← Este archivo
```

## Publicación

El `.elpx` se publica como asset en cada release del repo. El enlace
directo para abrirlo en el runtime estático de eXeLearning será:

```
https://static.exelearning.dev/?url=https://github.com/ateeducacion/exelearning-style-scumm/releases/latest/download/el-ciclo-del-agua.elpx
```

## Créditos del ejemplo

- Contenido educativo: **Área de Tecnología Educativa**.
- Metadatos del recurso ajustados para mostrar explícitamente esta
  autoría en los exportables (pie de página, ficha de licencia).
