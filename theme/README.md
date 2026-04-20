# SCUMM Adventure — tema para eXeLearning

Tema visual inspirado en LucasArts SCUMM (Monkey Island, Maniac Mansion). Se importa desde *Herramientas → Gestor de estilos → Importar estilo*.

## Contenido del ZIP

```
config.xml          ← descriptor del tema (nombre, versión, licencia)
style.css           ← hoja de estilos principal; paleta --scumm-* en :root
style.js            ← panel SCUMM (verbos + inventario) + toggle día/noche
screenshot.png      ← vista previa en el selector de tema
fonts/              ← 4 OTF LucasArts + VT323-Regular.woff2 (fallback español)
images/             ← sprites pixel art (escena, UI, iconos iDevice, inventario)
```

`demo.html` y `README.md` se excluyen del ZIP de release.

## Instalación

`config.xml` debe quedar en la raíz del ZIP — no dentro de un subdirectorio. El repositorio [`exelearning-style-scumm`](https://github.com/ateeducacion/exelearning-style-scumm) genera el ZIP automáticamente en cada tag `v*`.

Licencia: **CC BY-SA 4.0**. Fuentes LucasArts: uso no comercial (scummbar.com). VT323: SIL OFL 1.1.
