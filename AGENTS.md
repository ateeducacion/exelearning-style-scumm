# AGENTS.md — `exelearning-style-scumm`

Context and operating notes for future coding agents (Claude Code, Codex, etc.) that pick up work on this repository.

## 1. What this repository is

Two things coexist in the same repo, by design:

1. **The SCUMM Adventure style** for eXeLearning, living in `theme/`. This is what gets zipped on every release and uploaded as `exelearning-style-scumm-<version>.zip`, which the user can import from the eXeLearning app (*Herramientas → Gestor de estilos → Importar estilo*).
2. **An example unit** about *el ciclo del agua*, in the form of an **ELPX extracted at the repository root** (`index.html`, `content.xml`, `content.dtd`, `html/`, `idevices/`, `libs/`, `content/`, `search_index.js`). Serving this root with any static HTTP server is enough to preview the style in action.
   - The live unit is served straight off the `main` branch through `github-proxy.exelearning.dev`; the canonical "open in eXeLearning" link is:
     `https://static.exelearning.dev/?url=https://github-proxy.exelearning.dev/?repo=ateeducacion/exelearning-style-scumm&branch=main`
     No `.elpx` release asset is published — the proxy wraps the repo on demand (same pattern as the `exelearning-style-spectrum128k` sibling repo).

## 2. Repository layout

```
/
├── theme/                       ← canonical source of truth for the style
│   ├── config.xml
│   ├── style.css                ← main stylesheet (see §5)
│   ├── style.js                 ← SCUMM panel + dark-mode + nav togglers
│   ├── demo.html                ← dev mockup (not shipped in the zip)
│   ├── screenshot.png
│   ├── README.md                ← info for anyone who unzips the package
│   ├── fonts/                   ← 4 LucasArts OTFs + VT323 fallback (WOFF2)
│   └── images/                  ← 29 pixel-art sprites (sky, ocean, mountain,
│                                   sun, clouds, panel, icons, inventory…)
├── scripts/                     ← builder scripts (see §6)
│   └── build_water_cycle.py
├── idevices/                    ← eXeLearning iDevice JS (from extracted ELPX)
├── libs/                        ← eXeLearning libraries (from extracted ELPX)
├── content/, html/, content.xml,
│   content.dtd, index.html, …   ← unzipped ELPX for static browser preview
├── LICENSE                      ← CC0 for original repo content
├── README.md                    ← user-facing README (short)
└── AGENTS.md                    ← this file
```

`theme/*` is the only thing that ends up in the distributable zip. Everything else exists to support preview and example.

## 3. How the theme is wired to eXeLearning

eXeLearning reads themes from `public/files/perm/themes/base/<name>/`. During local development:

```
eXe repo   public/files/perm/themes/base/scumm
              ⇣ symlink
style repo theme/
```

Because `theme/` here is the canonical source, editing `style.css`, `style.js` or any sprite in the style repo is reflected in the eXe app immediately (`make up-local`) and in the previewable ELPX at the repo root (via browser reload).

**Creating the symlink after cloning (developer setup):**

```bash
ln -s "$PWD/theme" \
  /path/to/exelearning/public/files/perm/themes/base/scumm
```

The real files stay in this style repo; eXeLearning just follows the symlink. **Never commit a symlink into eXeLearning's repo**; that decouples the style version from the style repo.

## 4. How eXeLearning looks for a theme

Minimum contract (enforced by `src/shared/parsers/theme-parser.ts` in the eXe repo):

| File / folder           | Required | Purpose                                                       |
| ----------------------- | -------- | ------------------------------------------------------------- |
| `theme/config.xml`      | yes      | Name, title, version, author, license, description, `<downloadable>1</downloadable>`. |
| `theme/style.css`       | yes      | Stylesheet. Must target eXeLearning's DOM classes (`.exe-content`, `.box`, `.box-head`, `.box-content`, `.exe-web-site`, `#siteNav`, `#siteBreadcrumbs`, `.nav-buttons`, `.page-counter`, …). |
| `theme/style.js`        | optional | jQuery script that runs on the exported page. Typical use: wire the `#darkModeToggler`, build the SCUMM panel, insert togglers. |
| `theme/screenshot.png`  | yes      | Preview shown in the theme picker. ~800×500 px works. |
| `theme/fonts/*`         | optional | Self-hosted font files (`.woff2` / `.otf`). |
| `theme/images/*`        | optional | Pixel-art sprites used by the stylesheet and panel. |

A theme is discovered automatically when the folder lives at `public/files/perm/themes/base/<name>/` and `config.xml` is parseable.

## 5. What the SCUMM Adventure style does

Highlights that should be preserved by any refactor:

- **Graphic-adventure scene** fixed behind all content: sky + ocean + mountain + clouds + sun in pixel art, with animated cloud drift (`scumm-cloud-drift`, disabled when `prefers-reduced-motion` is set).
- **SCUMM paper / dark mode** via `html.exe-dark-mode` (*SCUMM de día* / *SCUMM de noche*), toggled by `#darkModeToggler` (sun icon injected into `.package-header` by `style.js`). State persisted in `localStorage` key `exeDarkMode`. Same convention as the `flux` / `universal` themes.
- **Bottom SCUMM panel** (`.scumm-panel`) injected at runtime by `style.js`: 9 verb buttons — Mirar · Usar · Hablar · Coger · Dar · Abrir · Cerrar · Empujar · Tirar — in a 3-column grid (cyan/yellow/green for idle/hover/active), a central sentence bar showing `Verbo · Objeto`, an inventory grid (4 columns × 2 rows = 8 slots), and a compass widget with 4 directional arrows + center use button.
- **Scanlines CRT overlay** (`body.scumm-scanlines`, default on) — fixed `body::after` with a repeating-linear-gradient; disabled by the tweaks panel and by `prefers-reduced-motion`.
- **Tweaks panel** (`#scummTweaks`) built at runtime by `style.js` with state persisted in `localStorage.exeScummTweaks` (JSON `{panel, scanlines, dark}`). Gear button `#scummTweaksToggler` lives at the far right of the top bar in site mode, or inside `.package-header` in single-page mode. Three toggles: "Panel SCUMM" (hide/show bottom verbs+inventory), "Scanlines" (CRT overlay on/off), "Modo noche" (reuses `localStorage.exeDarkMode`).
- **Day-of-the-Tentacle fade transition** between pages (`.scumm-fade-overlay`): black overlay fades from 1→0 on page load and 0→1 on internal-link clicks before navigation. Skipped under `prefers-reduced-motion`.
- **LucasArts-style intro loader** (`#scummIntro`): starfield + grey planet (CSS radial-gradient) + figure-with-lamp SVG + "eXeLearning" in ScummMenuSolid + "eXeLearning Entertainment Company" subtitle. Shown once per session via `sessionStorage.scummIntroShown`; click-to-skip; auto-dismiss after ~2.5 s. Brief non-animated flash under `prefers-reduced-motion`.
- **Hard pixel shadows** everywhere (`--scumm-shadow-hard: 4px 4px 0 var(--scumm-ink)`, soft 2 px). No `filter: blur`, no `border-radius`.
- **LucasArts SCUMM fonts** 100% local (no CDN, no `@import` remote) + VT323 fallback for Spanish characters — see §7.

CSS variables (top of `style.css`, `:root { --scumm-* }`):

```
--scumm-sky-*, --scumm-sea-*          Scene palette (sky, ocean tones).
--scumm-wood, --scumm-wood-hi         Panel frame brown and gold corners.
--scumm-paper, --scumm-ink            Dialogue boxes / base text.
--scumm-verb-cyan/-green/-yellow      Verb button states.
--scumm-dialog-bg/-text/-narr/…       Dialogue colour roles.
--scumm-font                          Body (ScummRoman → VT323 → mono).
--scumm-font-head                     Headings (ScummSolid / ScummMenuSolid).
--scumm-font-ui                       UI / verbs (ScummMenu).
--scumm-shadow-hard / --scumm-shadow-soft   2 / 4 px hard shadows, no blur.
--scumm-sidebar-w / --scumm-panel-h   Layout (280 px / 180 px).
```

## 6. The example unit and the builder script

The example unit is generated from a Python script kept in `scripts/build_water_cycle.py`. The output of the pipeline is the **unzipped workspace at the repo root** — that is what `github-proxy.exelearning.dev` serves on demand. There is no `.elpx` release asset; `main` is the live source of truth.

Pipeline to regenerate it:

```bash
# 1. Build the .elp source
python3 scripts/build_water_cycle.py        # → /tmp/water-cycle.elp

# 2. Export to .elpx using eXeLearning's CLI and the scumm theme
make -C /path/to/exelearning export-elpx \
  FORMAT=elpx \
  INPUT=/tmp/water-cycle.elp \
  OUTPUT=/tmp/water-cycle.elpx \
  THEME=scumm                               # → /tmp/water-cycle.elpx

# 3. Refresh the workspace (keep theme/ and scripts/)
cd /Users/ernesto/Downloads/git/exelearning-style-scumm
rm -rf content content.dtd content.xml html idevices index.html libs search_index.js
unzip -q -o /tmp/water-cycle.elpx -x "theme/*"
```

What the builder produces:

- 11 pages with descriptive titles (`Bienvenida`, `¿Qué es el ciclo del agua?`, `El Sol pone el agua en marcha`, …) and pixel-art block icons.
- Each text iDevice embeds one of the 11 PNG illustrations from `content/resources/` via `<img>` references.
- Two interactive iDevices: `scrambled-list` for ordering the phases, `trueorfalse` for four statements.
- A `download-source-file` iDevice on the last page (download the .elp).
- Two action buttons on intro and credits: **Abrir en eXeLearning** (`static.exelearning.dev/?url=https://github-proxy.exelearning.dev/?repo=ateeducacion/exelearning-style-scumm&branch=main`) and **Descargar estilo** (GitHub latest release — versioned `exelearning-style-scumm-<version>.zip`).
- `pp_addSearchBox=true`, `pp_addPagination=true`, `pp_theme=scumm`, `pp_exportElp=true`.

## 7. Critical gotchas

1. **Bash tool resets `cwd` between calls.** A previous session wiped a working directory because `find . -maxdepth 1 ... -exec rm -rf {} +` ran from the wrong directory. **Always use absolute paths** in `find`, `rm`, `unzip`, and friends. Never rely on `cd` persisting.
2. **Preserve the theme symlink.** When extracting a fresh ELPX into this repo, always pass `-x "theme/*"` to `unzip` so the canonical style files are not overwritten by the ELPX's copy. Confirm with `test -L theme || test -d theme` before and after.
3. **Icon file names go into `<iconName>` without extension.** The renderer resolves `<iconName>book` → `theme/icons/book.svg` (or `.png`). Renaming an icon file is a breaking change.
4. **`localStorage` and `sessionStorage` keys to know:** `exeDarkMode` (value `on` if enabled); `exeScummTweaks` (JSON `{panel, scanlines, dark}`, planned tweaks panel); `scummIntroShown` (sessionStorage, planned intro loader). Tests/screenshots must clear all three before asserting visual state.
5. **Biome lints `style.js` loudly** (`var`, `$`, etc.). Every eXeLearning theme script is in this legacy style; this is expected and is not a CI blocker.
6. **The extracted ELPX duplicates eXeLearning libs** (`libs/`, `idevices/`, `content/`). Regenerating the example refreshes those — they are intentionally committed so `git clone && python3 -m http.server` gives a live preview without a build step.
7. **Use one license for original content.** The repository's original content is CC0: the theme, README/project prose, example unit and generated illustrations. Third-party runtime files, fonts and bundled libraries keep their own declared licenses.
8. **LucasArts OTFs don't cover Spanish characters.** `lucasarts-scumm-*.otf` cover English + some French/German accents (à, è, é, ê, ë, ï, ü). **ñ, á, í, ó, ú, ¿, ¡** and their uppercase forms are missing. The fix: a `@font-face "ScummPixelFallback"` pointing at `fonts/VT323-Regular.woff2` is listed before `"Courier New"` in every `--scumm-font*` stack so the browser's glyph-fallback lands on a pixel font instead of a serif. When adding any new LucasArts OTF, verify coverage with `fc-scan --format "%{charset}\n" <font.otf>` and add a `unicode-range` descriptor if needed.
9. **Bottom panel z-index must stay below `#scummTweaks` and `#scummIntro`.** `.scumm-panel` is `z-index: 35`; the planned tweaks panel and intro overlay must be assigned higher values (suggested: `#scummTweaks` at 60, `#scummIntro` at 100).
10. **`localStorage` key is `exeScummTweaks` (JSON `{panel, scanlines, dark}`), `sessionStorage` key is `scummIntroShown` — tests/screenshots should clear both before asserting visual state** (see also gotcha 4).

## 8. Open work items

- **Generate SCUMM-style illustrations** to replace the Spectrum-era images currently in `content/resources/`. Each of the 11 pages needs a pixel-art illustration matching the LucasArts palette.
- **Responsive tweaks panel on narrow viewports** — `#scummTweaks` needs a mobile-safe layout that does not collide with the bottom panel when the user re-enables it.
- **Mobile bottom-panel collapse** — on viewports < 768 px the panel stacks vertically and can exceed 60 vh; a collapse-to-icon-row mode is pending (the panel ships off-by-default on mobile to avoid this for now).
- **Editor-chrome toolbar colors** — the floating up/down/trash/kebab/Editar buttons eXeLearning injects over `.box-head` in edit mode currently render in default cyan, clashing with the SCUMM wood header. Needs a style pass once the exact classes are known.

## 9. How to land changes

1. Work only inside `/Users/ernesto/Downloads/git/exelearning-style-scumm/`, using absolute paths.
2. Style changes? Edit `theme/style.css` or `theme/style.js`. Reload `theme/demo.html` or `index.html`; no rebuild needed.
3. Example-unit changes? Edit `scripts/build_water_cycle.py` and re-run the pipeline in §6. Commit the regenerated `content.xml`, `index.html`, `html/`, and `content/resources/`.
4. README or AGENTS.md changes? Keep them short. The `README.md` is the user-facing landing page on GitHub.
5. `git commit -m "…" && git push`. The remote is `git@github.com:ateeducacion/exelearning-style-scumm.git`.
6. To cut a release: `git tag vX.Y.Z && git push --tags`. The workflow builds and publishes both assets.

## 10. Attribution

Author: Área de Tecnología Educativa · Consejería de Educación, Formación Profesional, Actividad Física y Deportes del Gobierno de Canarias.

Fonts: LucasArts SCUMM OTFs (non-commercial, sourced from scummbar.com); VT323 fallback (Peter Hull, SIL OFL 1.1).

eXeLearning: maintained by [CEDEC](https://cedec.intef.es/) and the State education administrations.
