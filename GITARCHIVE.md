# Exclusión del tema en el `gitarchive` del repo principal eXeLearning

Este tema vive en su propio repositorio (`exelearning-style-scumm`) y
**no se empaqueta dentro de la distribución principal de eXeLearning**.
Los usuarios lo instalan desde *Herramientas → Gestor de estilos →
Importar estilo* usando el ZIP publicado en cada release.

Para que el generador de `gitarchive` del repositorio principal omita
este tema si alguien decidiese empotrarlo como submódulo o copia local,
añadir estas reglas al `.gitattributes` del repositorio principal
([`exelearning/exelearning`](https://github.com/exelearning/exelearning)):

```gitattributes
# -------------------------------------------------------------
# Temas externos mantenidos en su propio repositorio —
# excluidos del archivo generado por `git archive`.
# -------------------------------------------------------------
public/files/perm/themes/base/scumm/**      export-ignore
public/files/perm/themes/base/scumm         export-ignore
```

Si el repo principal usa un archivo distinto (por ejemplo,
`.export-ignore` o un script `make/gitarchive.sh`), añadir el mismo
patrón allí.

## Por qué excluirlo

- El tema es **opcional** y tiene ciclo de release propio.
- Incluye tipografías LucasArts (OTF) y sprites pixel art con licencias
  específicas que no conviene mezclar con la distribución AGPL del
  motor de eXeLearning.
- Evita que `git archive` de la distribución principal aumente de
  tamaño innecesariamente con assets de estilo.

## Canal de instalación recomendado

```
Herramientas → Gestor de estilos → Importar estilo
   ↓
https://github.com/ateeducacion/exelearning-style-scumm/releases/latest
   ↓
exelearning-style-scumm-<versión>.zip
```

Elaborado por el **Área de Tecnología Educativa**.
