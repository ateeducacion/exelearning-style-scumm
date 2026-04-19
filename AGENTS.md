# AGENTS.md — `exelearning-style-scumm`

Contexto operativo para futuros agentes (Claude Code, Codex, etc.) que
retomen trabajo en este repo. Hermano temático de
[`exelearning-style-spectrum128k`](https://github.com/ateeducacion/exelearning-style-spectrum128k):
mismas convenciones de layout, distinto estilo visual.

## 1. Qué es este repositorio

Dos cosas conviven en el mismo repo, a propósito:

1. **El estilo SCUMM Adventure** para eXeLearning, en `theme/`. Se
   empaqueta en cada release como `exelearning-style-scumm-<versión>.zip`
   y se importa desde *Herramientas → Gestor de estilos → Importar
   estilo*.
2. **Una unidad de ejemplo** sobre *el ciclo del agua*, como **ELPX
   descomprimido en la raíz del repo** (`index.html`, `content.xml`,
   `content.dtd`, `content/`, `html/`). Con cualquier servidor estático
   (`python3 -m http.server`) ya se previsualiza el estilo en acción.
   - La contraparte empaquetada es `el-ciclo-del-agua.elpx`, generada
     por CI y publicada como release asset. Se puede abrir con
     `https://static.exelearning.dev/?url=<raw-github>/.../el-ciclo-del-agua.elpx`.

## 2. Layout del repositorio

```
/
├── theme/                          ← fuente de verdad del estilo
│   ├── config.xml
│   ├── style.css                   ← hoja principal (ver §5)
│   ├── style.js                    ← panel SCUMM + dark-mode
│   ├── demo.html                   ← página de desarrollo (no se empaqueta)
│   ├── screenshot.png
│   ├── README.md                   ← info para quien descomprima el ZIP
│   ├── fonts/                      ← 4 OTF LucasArts + VT323 (fallback Latin-1)
│   └── images/                     ← 29 sprites pixel art (cielo, océano,
│                                     montaña, sol, nubes, panel, iconos…)
├── content.xml                     ← fuente ODE 2.0 del recurso de ejemplo
├── content.dtd                     ← DTD ODE de eXeLearning 3.x
├── content/                        ← media del recurso (img/, resources/)
├── index.html                      ← exportación web del recurso (raíz = Inicio)
├── html/                           ← páginas por nodo (5 fases + debate)
├── sample/README.md                ← notas sobre el .elpx publicado
├── reference/README.md             ← notas del handoff de diseño
├── .github/workflows/release.yml   ← CI (zip + .elpx en cada tag v*)
├── .gitattributes                  ← export-ignore para git archive
├── GITARCHIVE.md                   ← cómo omitirlo en el gitarchive de eXe
├── README.md                       ← landing del repo
└── AGENTS.md                       ← este archivo
```

`theme/*` es lo único que termina en el ZIP distribuible. El resto
existe para soportar previsualización, ejemplo y dev.

## 3. Cómo se enchufa el tema a eXeLearning

eXeLearning lee los temas desde
`public/files/perm/themes/base/<nombre>/`. En desarrollo local:

```
eXe repo   public/files/perm/themes/base/scumm
              ⇣ symlink
style repo theme/
```

Como `theme/` es la fuente de verdad, editar `style.css`, `style.js` o
cualquier sprite se refleja en eXe de forma inmediata (`make up-local`)
y en el ELPX previsualizable de la raíz (recargando el navegador).

**Creación del symlink tras clonar:**

```bash
ln -s "$PWD/theme" \
  /path/to/exelearning/public/files/perm/themes/base/scumm
```

Los archivos reales viven en este repo; eXeLearning solo sigue el
symlink. **Nunca commits un symlink en el repo de eXeLearning**; eso
desacopla la versión del estilo del repo del estilo.

## 4. Cómo busca eXeLearning un tema

Contrato mínimo (lo impone `src/shared/parsers/theme-parser.ts` del
repo de eXe):

| Archivo / carpeta        | Obligatorio | Propósito |
| ------------------------ | ----------- | --------- |
| `theme/config.xml`       | sí          | Nombre, título, versión, autor, licencia, descripción, `<downloadable>1</downloadable>`. |
| `theme/style.css`        | sí          | Hoja de estilos. Apunta a las clases del DOM de eXe (`.exe-content`, `.box`, `.box-head`, `.box-content`, `.exe-web-site`, `#siteNav`, `#siteBreadcrumbs`, `.nav-buttons`, `.page-counter`…). |
| `theme/style.js`         | opcional    | Script jQuery que corre en la página exportada. Aquí inyecta el panel SCUMM (verbos + inventario) y cablea `#darkModeToggler`. |
| `theme/screenshot.png`   | sí          | Preview del selector de tema. ~800×500 px. |
| `theme/fonts/*`          | opcional    | Fuentes self-hosted (OTF/WOFF2). |
| `theme/images/*`         | opcional    | Sprites pixel art. |

El tema se descubre automáticamente si la carpeta está en
`public/files/perm/themes/base/<nombre>/` y `config.xml` es parseable.

## 5. Qué hace el estilo SCUMM Adventure

Highlights que cualquier refactor debe preservar:

- **Escena de aventura gráfica** de fondo: cielo + océano + montaña +
  nubes + sol en pixel art, con drift animado (`scumm-cloud-drift`,
  deshabilitado por `prefers-reduced-motion`).
- **Panel inferior SCUMM** (`#scumm-panel`) inyectado por `style.js` en
  toda exportación: columna de verbos (Mirar · Usar · Hablar · Coger ·
  Dar · Abrir · Cerrar · Empujar · Tirar), frase de acción en el medio
  e inventario 4×4 a la derecha. Los verbos son botones reales con
  estado `idle/hover/active` coloreados (cian/amarillo/verde).
- **Modo claro ⇄ oscuro** (*SCUMM de día* / *SCUMM de noche*) con la
  clase `html.exe-dark-mode`, botón inyectado en `.package-header` con
  `id="darkModeToggler"`, persistencia en `localStorage.exeDarkMode`.
  Misma convención que los temas oficiales `flux` / `universal`.
- **Paleta SCUMM** en variables CSS (verbos cian/verde/amarillo, marco
  marrón con esquinas doradas, cajas de diálogo beige, cursor pixel).
  Todo definido en `:root { --scumm-* }` y sobrescrito por
  `html.exe-dark-mode`.
- **Cursor pixel-art** personalizado (`images/cursor.png`) en todo el
  body.
- **Shadows duras sin blur** (`--scumm-shadow-hard: 4px 4px 0 ink`,
  soft 2px) para todo: no hay `filter: blur`, no hay border-radius.
- **Tipografías LucasArts SCUMM** 100 % locales (sin CDN ni `@import`
  remoto) + fallback `VT323` (SIL OFL 1.1) para los caracteres
  españoles que las LucasArts no cubren — ver §7.

Variables CSS relevantes (cabecera de `style.css`):

```
--scumm-sky-*, --scumm-sea-*     Paleta escena.
--scumm-verb-cyan/-green/-yellow Verbos.
--scumm-wood, --scumm-wood-hi    Marco y esquinas doradas del panel.
--scumm-paper, --scumm-ink       Diálogos / texto base.
--scumm-font                     Cuerpo (ScummRoman → VT323 → mono).
--scumm-font-head                Titulares (ScummSolid/MenuSolid).
--scumm-font-ui                  UI / verbos (ScummMenu).
--scumm-shadow-hard/-soft        Sombras 2/4 px, sin blur.
--scumm-sidebar-w, --scumm-panel-h  Layout (280 px / 180 px).
```

## 6. La unidad de ejemplo y la release pipeline

El recurso vive descomprimido en la raíz (`content.xml`,
`content.dtd`, `content/`, `index.html`, `html/`). Es una unidad sobre
el **ciclo del agua** con 5 fases (evaporación, condensación,
precipitación, infiltración, debate).

**CI (`.github/workflows/release.yml`)** se dispara en cada tag `v*` y
publica dos artefactos:

1. `exelearning-style-scumm-<versión>.zip` — ZIP del contenido de
   `theme/` sin `demo.html` ni `README.md`. Se importa desde *Gestor
   de estilos → Importar estilo*.
2. `el-ciclo-del-agua.elpx` — ZIP de `content.xml + content.dtd +
   content/`. Se abre con `static.exelearning.dev/?url=<raw>/…/el-ciclo-del-agua.elpx`.

Para probar los artefactos localmente antes de cortar release:

```bash
cd theme && zip -r ../exelearning-style-scumm-dev.zip . -x "demo.html" "README.md"
cd ..
zip -r el-ciclo-del-agua.elpx content.xml content.dtd content
```

## 7. Gotchas críticos

1. **Las OTF LucasArts NO cubren el español.** `lucasarts-scumm-*.otf`
   incluyen solo inglés + acentos francés/alemán (à, è, é, ê, ë, ï,
   ü). Faltan **á, í, ó, ú, ñ, ¿, ¡** y sus mayúsculas. Solución en
   el repo: `@font-face` adicional **"ScummPixelFallback"** que apunta
   a `fonts/VT323-Regular.woff2` (SIL OFL 1.1, heredado del tema
   spectrum128k). Va listado en cada stack de `--scumm-font*` **antes**
   de `"Courier New"`, para que el glyph-fallback del navegador caiga
   en una fuente pixel en lugar de en una serif/mono del sistema. Si
   se añade una fuente LucasArts nueva, revisar con
   `fc-scan --format "%{charset}\n"` qué rango Unicode cubre y
   ajustar `unicode-range` si hace falta.
2. **El Bash tool resetea `cwd` entre llamadas.** Usar **siempre rutas
   absolutas** en `find`, `rm`, `unzip`, etc. Nunca confiar en que un
   `cd` persista entre calls.
3. **Preservar el symlink de `theme/` en eXeLearning.** Al extraer un
   ELPX fresco en este repo, **pasar `-x "theme/*"` a `unzip`** para
   no sobreescribir los archivos canónicos del estilo.
4. **`localStorage` keys:** `exeDarkMode` (valor `on` si activo). Los
   tests / screenshots deben limpiarlas antes de aseverar estado
   visual.
5. **Biome quejará de `style.js`** (`var`, `$`, etc.). Es el estilo
   legacy compartido por todos los temas de eXeLearning; no bloquea CI.
6. **El ELPX extraído duplica libs de eXeLearning.** Regenerar el
   ejemplo refresca `content/`, `html/`, `index.html`. Se commitean
   deliberadamente para que `git clone && python3 -m http.server`
   funcione sin build.
7. **CC BY-SA 4.0** para el tema y para el ejemplo educativo. Las
   tipografías LucasArts son de uso no comercial (scummbar.com) —
   distinta licencia del resto. VT323 es SIL OFL 1.1 y se redistribuye
   sin problema.
8. **Evitar diálogos JS (`alert`/`confirm`).** `style.js` no debe
   mostrarlos; bloquean la automatización con browser MCP y molestan
   en exportaciones SCORM.

## 8. Tareas abiertas

- **Ajuste responsive del panel SCUMM.** En móviles < 768 px el panel
  inferior ocupa demasiado alto. Colapsarlo a una fila de verbos
  scrollable + inventario iconográfico más compacto.
- **Idiomas.** `style.js` lee `$exe_i18n`; extender con traducciones
  para los 9 verbos y los tooltips del inventario en inglés y francés
  (además del español por defecto).
- **Fallback de fuente más fiel.** VT323 funciona pero es visualmente
  más "CRT-terminal" que "LucasArts". Valorar sustituirla por una
  fuente pixel OFL con mejor matching SCUMM (Press Start 2P no cuadra
  por x-height; explorar `m5x7`, `PixelOperator` o generar un parche
  TTF con `fontforge` añadiendo glyphs ES a las LucasArts).
- **Lighthouse a11y.** Contraste del texto sobre el fondo de escena
  varía mucho según la posición del sol/nube; algunos párrafos bajan
  de AA. Considerar un overlay semi-opaco detrás de `.exe-content`.
- **Filtro gitarchive de eXeLearning.** Añadir
  `public/files/perm/themes/base/scumm/** export-ignore` al
  `.gitattributes` del repo principal (ver `GITARCHIVE.md`).

## 9. Cómo hacer cambios

1. Trabajar solo dentro de
   `/Users/ernesto/Downloads/git/exelearning-style-scumm/`, rutas
   absolutas.
2. ¿Cambios de estilo? Editar `theme/style.css` o `theme/style.js`.
   Recargar `theme/demo.html` o `index.html`; no hace falta rebuild.
3. ¿Cambios en la unidad de ejemplo? Editar `content.xml` (o
   regenerar desde eXeLearning exportando como *Sitio Web*) y
   commitear `content.xml`, `index.html`, `html/` y
   `content/resources/` juntos.
4. ¿README o AGENTS.md? Mantenerlo corto. README es la landing del
   repo en GitHub.
5. `git commit -m "…" && git push`. Remote:
   `git@github.com:ateeducacion/exelearning-style-scumm.git`.
6. Para cortar release: `git tag vX.Y.Z && git push --tags`. El
   workflow construye y publica los dos assets.

## 10. Atribución

- **Área de Tecnología Educativa · Consejería de Educación, Formación
  Profesional, Actividad Física y Deportes del Gobierno de Canarias.**
- Tipografías LucasArts SCUMM (OTF, uso no comercial) — *scummbar.com*.
- Fuente de fallback VT323 — Peter Hull, SIL OFL 1.1.
- Sprites pixel art 8/16-bit — handoff de diseño, CC BY-SA 4.0.
- Convenciones de integración inspiradas en los temas `flux` y
  `universal` del repositorio principal de eXeLearning (mantenido por
  [CEDEC](https://cedec.intef.es/) y las administraciones educativas
  del Estado).
