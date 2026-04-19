# SCUMM Adventure — tema para eXeLearning

Tema visual inspirado en las aventuras gráficas clásicas de LucasArts con
motor **SCUMM** (Monkey Island, Maniac Mansion). Convierte cualquier
exportación de eXeLearning (sitio web, SCORM, IMS, EPUB, página única) en
una **escena de aventura gráfica** en pixel art, con un panel inferior de
verbos e inventario, cajas de diálogo retro y paleta limitada 8/16-bit.

Pensado y mantenido por el **Área de Tecnología Educativa**.

## Contenido del paquete

```
theme/
├── config.xml         ← Descriptor del tema (eXeLearning)
├── style.css          ← Hoja de estilos principal
├── style.js           ← Panel SCUMM + toggle claro/oscuro + menú
├── screenshot.png     ← Vista previa del tema
├── demo.html          ← Maqueta de referencia (solo para depuración)
├── README.md          ← Este archivo
├── fonts/             ← Tipografías LucasArts (OTF, 100% locales)
│   ├── lucasarts-scumm-solid.otf
│   ├── lucasarts-scumm-menu.otf
│   ├── lucasarts-scumm-menu-solid.otf
│   └── lucasarts-scumm-subtitle-roman.otf
└── images/            ← Sprites pixel art (PNG, 100% locales)
    ├── Escena: sky, ocean, mountain, sun, cloud, rain, river
    ├── UI:     cursor, frame, verb_button, inventory_slot
    ├── iDevice: icon_info, icon_think, icon_activity, icon_observe,
    │            icon_alert, icon_discuss, icon_reflection,
    │            icon_eye, icon_hand, icon_mouth, icon_door,
    │            icon_walk, icon_pickup, icon_give, icon_close
    └── Inventario: icon_item_flask, icon_item_key, icon_item_scroll
```

## Instalación en eXeLearning

1. Empaqueta **el contenido** de esta carpeta `theme/` en un ZIP —
   `config.xml` debe estar en la raíz del ZIP, no dentro de un subdirectorio.
2. Abre eXeLearning → **Herramientas → Gestor de estilos → Importar estilo**.
3. Selecciona el ZIP y pulsa **Importar**.
4. En **Propiedades → Estilo**, elige **SCUMM Adventure**.
5. Exporta el proyecto. El tema se aplica a la exportación.

El repositorio público (`exelearning-style-scumm`) incluye un pipeline de
CI que genera automáticamente este ZIP en cada release.

## Caso de uso: el ciclo del agua

El tema viene preparado para contenido educativo del **ciclo del agua**.
Cada fase se mapea a un sprite:

| Fase            | Sprite sugerido          | Icono iDevice      |
|-----------------|--------------------------|--------------------|
| Evaporación     | `sun.png` + `ocean.png`  | `icon_observe.png` |
| Condensación    | `cloud.png`              | `icon_think.png`   |
| Precipitación   | `rain.png`               | `icon_activity.png`|
| Infiltración    | `river.png`              | `icon_reflection.png`|

En `demo.html` hay un ejemplo completo listo para copiar como plantilla.

## Tipografías

Se incluyen **solo** las fuentes LucasArts realmente utilizadas:

| Fuente                                | Uso                          |
|---------------------------------------|------------------------------|
| `lucasarts-scumm-solid.otf`           | Títulos y cabeceras (`h1`–`h2`) |
| `lucasarts-scumm-menu.otf`            | UI, verbos, menús, breadcrumbs  |
| `lucasarts-scumm-menu-solid.otf`      | Respaldo para cabeceras bold    |
| `lucasarts-scumm-subtitle-roman.otf`  | Cuerpo, cuadros de diálogo      |

**Fallback:** si el navegador no carga la OTF (p. ej. proveedores SCORM
que filtran MIME types), la pila degrada con gracia a *Courier New* y
otras monoespaciadas del sistema, manteniendo la estética retro.

Fuente: [scummbar.com/fonts](https://scummbar.com/fonts/) — se han
descargado y empaquetado localmente. **No hay `@import` remoto.**

## Modo claro / oscuro

- **SCUMM de día** (por defecto): cielo claro, paleta Monkey Island
  veraniega, cajas de diálogo beige.
- **SCUMM de noche** (`html.exe-dark-mode`): paleta original del handoff
  (cielo nocturno, diálogos en negro con texto blanco/verde/amarillo).

El cambio se hace con el botón **☀ (sol)** inyectado por `style.js` en
`.package-header`, replicando la convención del tema `universal` de
eXeLearning:

```js
localStorage.setItem('exeDarkMode', 'on');
document.documentElement.classList.add('exe-dark-mode');
```

La preferencia se guarda en `localStorage` con clave `exeDarkMode`.

## Panel SCUMM

El archivo `style.js` añade un panel inferior fijo con:

- **9 verbos**: Mirar · Usar · Hablar · Coger · Dar · Abrir · Cerrar · Empujar · Tirar.
- **Línea de frase** (como en los juegos originales): muestra
  `Verbo · Objeto` al pasar el cursor sobre títulos iDevice y enlaces.
- **Inventario**: 8 huecos (3 llenos por defecto).
- **Brújula**: 4 flechas de navegación + botón de uso central.

Para ampliar o editar, modifica los arrays `SCUMM.verbs` e
`SCUMM.inventory` al inicio de `style.js`.

## iDevices soportados

Todas las clases estándar de eXeLearning están estilizadas como carteles
o diálogos de la escena:

| iDevice              | Apariencia SCUMM                                |
|----------------------|-------------------------------------------------|
| Texto libre / Info   | Cartel beige con marco marrón + icono azul     |
| Reflexión            | Cartel con bombilla/engranaje                   |
| Actividad            | Cartel con engranaje                            |
| Observación          | Cartel con lupa/ojo                             |
| Debate               | Dos bocadillos de diálogo                       |
| Cita con autoría     | Bocadillo del narrador con comillas grandes     |
| Tabla                | Retablo con cabecera amarilla                   |
| Alerta / Peligro     | Cartel rojo con icono de peligro                |
| Efecto acordeón      | Persiana de madera con indicador de estado      |
| Efecto paginación    | Pestañas tipo menú SCUMM                        |

## Accesibilidad

- **Teclado:** todos los togglers, verbos e inventario son `<button>`
  reales con `title` y `aria-label`.
- **Lectores de pantalla:** etiquetas `role` en panel, toolbar de verbos
  y lista de inventario. `#skipNav` enlaza al contenido principal.
- **Respeto a `prefers-reduced-motion`**: las nubes y el parpadeo del
  cursor se desactivan si el usuario así lo indica.
- **Contraste:** paleta verificada contra WCAG AA en ambos modos.
- **Focus visible:** los links invierten colores al enfocar.

## Restricciones cumplidas

- ✔ 100 % recursos locales (ningún `https://`, ningún CDN).
- ✔ Sin fuentes remotas; fallback a Courier New si la OTF no carga.
- ✔ Sin glassmorphism, sin gradientes suaves, sin blur en sombras.
- ✔ Compatible con `public/files/perm/themes/base/*` de eXeLearning 3.x.
- ✔ Responsive: el panel se reorganiza verticalmente en móvil.
- ✔ Imprimible: hoja `@media print` específica (sin panel, sin fondo).
- ✔ Modo oscuro persistido en `localStorage`.

## Licencia

Tema distribuido bajo **Creative Commons BY-SA 4.0**. Homenaje a los
clásicos de LucasArts. Las tipografías LucasArts y los sprites de fan
art son obra de sus autores originales; su inclusión aquí sigue el
criterio habitual de *scummbar.com* para proyectos no comerciales.

Elaborado por el **Área de Tecnología Educativa** para la comunidad
eXeLearning.
