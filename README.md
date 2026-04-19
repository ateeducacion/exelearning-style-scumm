# eXeLearning SCUMM Adventure

Tema retro para eXeLearning inspirado en las aventuras gráficas
clásicas de LucasArts (Monkey Island, Maniac Mansion): escena pixel
art con cielo, océano, montaña y sol; panel inferior con verbos e
inventario; cajas de diálogo beige; sombras duras y paleta limitada.

<a href="https://static.exelearning.dev/?url=https://github.com/ateeducacion/exelearning-style-scumm/releases/latest/download/el-ciclo-del-agua.elpx" target="_blank" rel="noopener">▶ Abrir el ejemplo en eXeLearning</a> · <a href="https://github.com/ateeducacion/exelearning-style-scumm/releases/latest" target="_blank" rel="noopener">↓ Descargar estilo (última release)</a>

Creado por el **Área de Tecnología Educativa** de la Consejería de
Educación, Formación Profesional, Actividad Física y Deportes del
Gobierno de Canarias. Licencia CC BY-SA 4.0.

## Vista rápida

```bash
# Servir el ELPX descomprimido de la raíz con cualquier HTTP estático:
python3 -m http.server
# → http://localhost:8000/  (usa ya el tema SCUMM)
```

`index.html` es el mismo recurso que viaja en el `.elpx`, renderizado
como sitio estático. Así se depura el tema y el contenido sin
reempaquetar nada.

## Estructura

- **`theme/`** — el estilo SCUMM (lo que se empaqueta como
  `exelearning-style-scumm-<versión>.zip` en cada release).
- **`el-ciclo-del-agua.elpx`** (generado en CI) — recurso de ejemplo
  sobre el ciclo del agua, publicado como release asset.
- **Raíz** — ELPX descomprimido, previsualizable con
  `python3 -m http.server`. Es el mismo patrón que usa
  [`exelearning-style-spectrum128k`](https://github.com/ateeducacion/exelearning-style-spectrum128k).

## Panel SCUMM

Injectado por `style.js` en cualquier exportación:

- **9 verbos** — Mirar · Usar · Hablar · Coger · Dar · Abrir · Cerrar
  · Empujar · Tirar (cian/amarillo/verde para idle/hover/active).
- **Inventario 4×4** con sprites pixel art.
- **Frase de acción** central (ej. *"Mirar cubo de agua"*).
- **Botón sol/luna** para alternar *SCUMM de día* / *SCUMM de noche*
  (persistido en `localStorage.exeDarkMode`).

## Instalación en eXeLearning

```
Herramientas → Gestor de estilos → Importar estilo
   ↓
exelearning-style-scumm-<versión>.zip (release más reciente)
```

Cualquier recurso abierto con ese tema heredará la escena, el panel
SCUMM y las tipografías locales. Sin CDN. Sin fuentes remotas.

## Release pipeline

`.github/workflows/release.yml` se dispara con cada tag `v*` y
publica dos assets:

1. `exelearning-style-scumm-<versión>.zip` — contenido de `theme/`.
2. `el-ciclo-del-agua.elpx` — ZIP de `content.xml + content.dtd +
   content/`, abrible con:

   ```
   https://static.exelearning.dev/?url=https://github.com/ateeducacion/exelearning-style-scumm/releases/latest/download/el-ciclo-del-agua.elpx
   ```

Para cortar release: `git tag vX.Y.Z && git push --tags`.

## Compatibilidad

- **eXeLearning 3.x** (ODE 2.0).
- Exportaciones: Sitio Web · SCORM 1.2 · SCORM 2004 · IMS · EPUB3 ·
  Página única.
- Navegadores modernos con soporte CSS custom properties e
  `image-rendering: pixelated`.
- **100 % offline**: ningún recurso remoto (CDN, fuentes externas,
  scripts). Solo URLs CC en metadatos de licencia.

## Para agentes (Claude Code, Codex…)

Todo el contexto operativo (layout, gotchas, tareas abiertas) está en
[`AGENTS.md`](AGENTS.md). Lee eso antes de tocar nada.

## Créditos

- Tipografías LucasArts SCUMM (OTF, uso no comercial) — *scummbar.com*.
- Fuente de fallback pixel: [VT323](https://fonts.google.com/specimen/VT323)
  (Peter Hull, SIL OFL 1.1) — usada para los caracteres españoles que
  las LucasArts no cubren (ñ, á, í, ó, ú, ¿, ¡).
- Sprites pixel art 8/16-bit — handoff de diseño.
- Comunidad [eXeLearning](https://exelearning.net/), mantenida por el
  [CEDEC](https://cedec.intef.es/) y las administraciones educativas
  del Estado.

## Licencia

- Tema y recurso de ejemplo: **Creative Commons BY-SA 4.0**.
- Fuentes LucasArts: uso no comercial, tal como se distribuyen en
  scummbar.com.
