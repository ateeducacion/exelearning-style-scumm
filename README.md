# eXeLearning SCUMM Adventure

Tema retro para eXeLearning inspirado en las aventuras gráficas clásicas de LucasArts con motor SCUMM: escena pixel art, panel inferior de verbos e inventario, cajas de diálogo beige y paleta limitada 8/16-bit.

<a href="https://static.exelearning.dev/?url=https://github.com/ateeducacion/exelearning-style-scumm/releases/latest/download/el-ciclo-del-agua.elpx" target="_blank" rel="noopener">▶ Abrir el ejemplo en eXeLearning</a> · <a href="https://github.com/ateeducacion/exelearning-style-scumm/releases/latest" target="_blank" rel="noopener">↓ Descargar estilo (última release)</a>

Creado por el **Área de Tecnología Educativa** de la Consejería de Educación, Formación Profesional, Actividad Física y Deportes del Gobierno de Canarias. Licencia CC BY-SA 4.0.

## Estructura

- **`theme/`** — el estilo SCUMM Adventure (lo que se empaqueta en cada release).
- **`el-ciclo-del-agua.elpx`** (release asset) — unidad de ejemplo sobre el ciclo del agua, 11 nodos.
- **Raíz** — ELPX descomprimido, previsualizable con `python3 -m http.server`.

## Panel de tweaks

El estilo expone tres ajustes persistentes (panel planificado, `localStorage.exeScummTweaks`):

- **Panel SCUMM** — mostrar u ocultar el panel inferior de verbos e inventario.
- **Scanlines** — efecto CRT on/off (activado por defecto).
- **Modo noche** — alternar *SCUMM de día* / *SCUMM de noche*.

## Créditos

Tipografías [LucasArts SCUMM](https://scummbar.com/) (OTF, uso no comercial) y [VT323](https://fonts.google.com/specimen/VT323) (Peter Hull, SIL OFL 1.1). Comunidad de [eXeLearning](https://exelearning.net/), mantenida por el [CEDEC](https://cedec.intef.es/) y las distintas administraciones educativas del Estado.
