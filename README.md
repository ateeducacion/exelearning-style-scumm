# eXeLearning SCUMM Adventure

Tema retro para eXeLearning inspirado en las aventuras gráficas clásicas de LucasArts con motor SCUMM: escena pixel art, panel inferior de verbos e inventario, cajas de diálogo beige y paleta limitada 8/16-bit.

<a href="https://static.exelearning.dev/?url=https://github-proxy.exelearning.dev/?repo=ateeducacion/exelearning-style-scumm&amp;branch=main" target="_blank" rel="noopener">▶ Abrir el ejemplo en eXeLearning</a> · <a href="https://github.com/ateeducacion/exelearning-style-scumm/releases/latest" target="_blank" rel="noopener">↓ Descargar estilo (última release)</a>

Creado por el **Área de Tecnología Educativa** de la Consejería de Educación, Formación Profesional, Actividad Física y Deportes del Gobierno de Canarias.

Licencia del contenido propio del repositorio: [Creative Commons CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). Esto incluye el estilo SCUMM Adventure, el ejemplo didáctico y las ilustraciones generadas. Los componentes de terceros mantienen sus licencias propias.

## Estructura

- **`theme/`** — el estilo SCUMM Adventure (lo único que se empaqueta en cada release como ZIP).
- **Raíz** — ELPX descomprimido con la unidad *El ciclo del agua* (11 nodos). Previsualizable con cualquier servidor estático (`python3 -m http.server`) y servido en directo por `github-proxy.exelearning.dev` al abrir el enlace de arriba.

## Panel de tweaks

Engranaje en la barra superior. Cuatro ajustes persistidos en `localStorage.exeScummTweaks`:

- **Panel SCUMM** — mostrar u ocultar el panel inferior de verbos e inventario (en móvil arranca oculto).
- **Scanlines** — efecto CRT on/off (activado por defecto).
- **Modo noche** — alternar *SCUMM de día* / *SCUMM de noche* (sol ↔ luna en la barra).
- **Intro** — reproducir de nuevo la pantalla de carga "eXeLearning Entertainment Company".

## Créditos

Tipografías [LucasArts SCUMM](https://scummbar.com/) (OTF, uso no comercial) y [VT323](https://fonts.google.com/specimen/VT323) (Peter Hull, SIL OFL 1.1). Comunidad de [eXeLearning](https://exelearning.net/), mantenida por el [CEDEC](https://cedec.intef.es/) y las distintas administraciones educativas del Estado.
