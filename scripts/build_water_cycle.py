"""
Build a self-contained water-cycle .elp (legacy zip with content.xml) for
showcasing the SCUMM Adventure theme. Run with python3.

Outputs: /tmp/water-cycle.elp
"""

import html
import json
import os
import shutil
import subprocess
import zipfile
from html import escape as h


def esc(s: str) -> str:
    # XML-escape for values stored inside <htmlView> (HTML → escaped once).
    return html.escape(s, quote=False)


def text_idevice(page_id: str, block_id: str, idv_id: str, order: int, title_html: str, body_html: str) -> str:
    """Return an <odeComponent> xml fragment for a 'text' iDevice."""
    inner_html = (
        '<div class="exe-text-template"><div class="textIdeviceContent">'
        '<div class="exe-text-activity"><div>'
        f'{title_html}{body_html}'
        '<p class="clearfix"> </p>'
        '</div></div></div></div>'
    )
    json_props = {
        "ideviceId": idv_id,
        "textInfoDurationInput": "",
        "textInfoDurationTextInput": "Duración:",
        "textInfoParticipantsInput": "",
        "textInfoParticipantsTextInput": "Agrupar:",
        "textTextarea": title_html + body_html,
        "textFeedbackInput": "Mostrar comentarios",
        "textFeedbackTextarea": "",
    }
    json_str = esc(json.dumps(json_props, ensure_ascii=False))
    return (
        f'<odeComponent>'
        f'<odePageId>{page_id}</odePageId>'
        f'<odeBlockId>{block_id}</odeBlockId>'
        f'<odeIdeviceId>{idv_id}</odeIdeviceId>'
        f'<odeIdeviceTypeName>text</odeIdeviceTypeName>'
        f'<htmlView>{esc(inner_html)}</htmlView>'
        f'<jsonProperties>{json_str}</jsonProperties>'
        f'<odeComponentsOrder>1</odeComponentsOrder>'
        f'<odeComponentsProperties>'
        f'<odeComponentsProperty><key>identifier</key><value/></odeComponentsProperty>'
        f'<odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty>'
        f'<odeComponentsProperty><key>cssClass</key><value/></odeComponentsProperty>'
        f'</odeComponentsProperties>'
        f'</odeComponent>'
    )


def scrambled_idevice(page_id: str, block_id: str, idv_id: str, instructions_html: str, options: list[str]) -> str:
    items_html = ''.join(f'<li>{h(o)}</li>' for o in options)
    inner_html = (
        f'<div class="exe-sortableList" id="sl{idv_id}" scorm=false>'
        f'<div class="game-evaluation-ids js-hidden" data-id="{idv_id}" data-evaluationid="98765"></div>'
        f'<div class="exe-sortableList-instructions">{instructions_html}</div>'
        f'<ul class="exe-sortableList-list">{items_html}</ul>'
        '<div style="display:none">'
        '<p class="exe-sortableList-buttonText">Comprobar</p>'
        '<p class="exe-sortableList-rightText">¡Correcto!</p>'
        '<p class="exe-sortableList-wrongText">Aún no. El orden correcto es:</p>'
        '</div><div class="exe-scorm-message"></div></div>'
    )
    json_props = {
        "typeGame": "ScrambledList",
        "instructions": instructions_html,
        "textAfter": "",
        "afterElement": "",
        "options": options,
        "time": 0,
        "buttonText": "Comprobar",
        "rightText": "¡Correcto!",
        "wrongText": "Aún no. El orden correcto es:",
        "isScorm": 0,
        "textButtonScorm": "Guardar puntuación",
        "repeatActivity": True,
        "weighted": 100,
        "evaluation": True,
        "evaluationID": "98765",
        "main": f"sl{idv_id}",
    }
    json_str = esc(json.dumps(json_props, ensure_ascii=False))
    return (
        f'<odeComponent>'
        f'<odePageId>{page_id}</odePageId>'
        f'<odeBlockId>{block_id}</odeBlockId>'
        f'<odeIdeviceId>{idv_id}</odeIdeviceId>'
        f'<odeIdeviceTypeName>scrambled-list</odeIdeviceTypeName>'
        f'<htmlView>{esc(inner_html)}</htmlView>'
        f'<jsonProperties>{json_str}</jsonProperties>'
        f'<odeComponentsOrder>1</odeComponentsOrder>'
        f'<odeComponentsProperties>'
        f'<odeComponentsProperty><key>identifier</key><value/></odeComponentsProperty>'
        f'<odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty>'
        f'<odeComponentsProperty><key>cssClass</key><value/></odeComponentsProperty>'
        f'</odeComponentsProperties>'
        f'</odeComponent>'
    )


def trueorfalse_idevice(
    page_id: str,
    block_id: str,
    idv_id: str,
    instructions_html: str,
    questions: list[tuple[str, bool, str]],
) -> str:
    # questions: list of (question, correct_bool, feedback)
    js_qs = [
        {
            "question": q,
            "answer": "true" if is_true else "false",
            "feedback": fb,
        }
        for (q, is_true, fb) in questions
    ]
    inner_html = (
        f'<div class="exe-tof-template" id="tf{idv_id}">'
        f'<div class="exe-tof-instructions">{instructions_html}</div>'
        + ''.join(
            f'<div class="exe-tof-question"><p>{h(q)}</p></div>'
            for (q, _, _) in questions
        )
        + '</div>'
    )
    json_props = {
        "typeGame": "TrueOrFalse",
        "instructions": instructions_html,
        "questions": js_qs,
        "buttonText": "Comprobar",
        "rightText": "¡Correcto!",
        "wrongText": "Inténtalo de nuevo",
        "isScorm": 0,
        "repeatActivity": True,
        "weighted": 100,
        "evaluation": True,
        "evaluationID": "98765",
        "main": f"tf{idv_id}",
    }
    json_str = esc(json.dumps(json_props, ensure_ascii=False))
    return (
        f'<odeComponent>'
        f'<odePageId>{page_id}</odePageId>'
        f'<odeBlockId>{block_id}</odeBlockId>'
        f'<odeIdeviceId>{idv_id}</odeIdeviceId>'
        f'<odeIdeviceTypeName>trueorfalse</odeIdeviceTypeName>'
        f'<htmlView>{esc(inner_html)}</htmlView>'
        f'<jsonProperties>{json_str}</jsonProperties>'
        f'<odeComponentsOrder>1</odeComponentsOrder>'
        f'<odeComponentsProperties>'
        f'<odeComponentsProperty><key>identifier</key><value/></odeComponentsProperty>'
        f'<odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty>'
        f'<odeComponentsProperty><key>cssClass</key><value/></odeComponentsProperty>'
        f'</odeComponentsProperties>'
        f'</odeComponent>'
    )


def download_source_idevice(page_id: str, block_id: str, idv_id: str) -> str:
    inner_html = (
        '<div class="exe-download-package-instructions">'
        '<table class="exe-table"><caption>Información general de este recurso educativo</caption>'
        '<tbody>'
        '<tr><th>Título</th><td>El ciclo del agua · SCUMM Adventure</td></tr>'
        '<tr><th>Descripción</th><td>Unidad didáctica de ejemplo sobre el ciclo del agua, en estilo SCUMM Adventure.</td></tr>'
        '<tr><th>Autor</th><td>Área de Tecnología Educativa · Gobierno de Canarias</td></tr>'
        '<tr><th>Licencia</th><td>'
        '<a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="license" class="cc cc-by-sa"><span></span>Creative Commons BY-SA 4.0</a>'
        '</td></tr>'
        '</tbody></table>'
        '<p style="text-align:center;">Este contenido se ha creado con '
        '<a href="http://exelearning.net/">eXeLearning</a>, un editor libre '
        'y de código abierto para crear recursos educativos.</p></div>'
        '<p class="exe-download-package-link">'
        '<a download="exe-package:elp-name" href="exe-package:elp" '
        'style="background-color:#D700D7;color:#FFFFFF;">Descargar el archivo .elp</a></p>'
    )
    return (
        f'<odeComponent>'
        f'<odePageId>{page_id}</odePageId>'
        f'<odeBlockId>{block_id}</odeBlockId>'
        f'<odeIdeviceId>{idv_id}</odeIdeviceId>'
        f'<odeIdeviceTypeName>download-source-file</odeIdeviceTypeName>'
        f'<htmlView>{esc(inner_html)}</htmlView>'
        f'<jsonProperties/>'
        f'<odeComponentsOrder>1</odeComponentsOrder>'
        f'<odeComponentsProperties>'
        f'<odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty>'
        f'<odeComponentsProperty><key>identifier</key><value/></odeComponentsProperty>'
        f'<odeComponentsProperty><key>cssClass</key><value/></odeComponentsProperty>'
        f'</odeComponentsProperties>'
        f'</odeComponent>'
    )


def block(page_id: str, block_id: str, order: int, components: str, icon: str = '', block_name: str = 'Texto') -> str:
    icon_tag = f'<iconName>{h(icon)}</iconName>' if icon else '<iconName/>'
    return (
        f'<odePagStructure>'
        f'<odePageId>{page_id}</odePageId>'
        f'<odeBlockId>{block_id}</odeBlockId>'
        f'<blockName>{h(block_name)}</blockName>'
        f'{icon_tag}'
        f'<odePagStructureOrder>{order}</odePagStructureOrder>'
        f'<odePagStructureProperties>'
        f'<odePagStructureProperty><key>identifier</key><value/></odePagStructureProperty>'
        f'<odePagStructureProperty><key>visibility</key><value>true</value></odePagStructureProperty>'
        f'<odePagStructureProperty><key>allowToggle</key><value>true</value></odePagStructureProperty>'
        f'<odePagStructureProperty><key>minimized</key><value>false</value></odePagStructureProperty>'
        f'<odePagStructureProperty><key>cssClass</key><value/></odePagStructureProperty>'
        f'</odePagStructureProperties>'
        f'<odeComponents>{components}</odeComponents>'
        f'</odePagStructure>'
    )


def nav_page(page_id: str, parent_id: str, name: str, order: int, blocks: str) -> str:
    return (
        f'<odeNavStructure>'
        f'<odePageId>{page_id}</odePageId>'
        f'<odeParentPageId>{parent_id}</odeParentPageId>'
        f'<pageName>{h(name)}</pageName>'
        f'<odeNavStructureOrder>{order}</odeNavStructureOrder>'
        f'<odeNavStructureProperties>'
        f'<odeNavStructureProperty><key>visibility</key><value>true</value></odeNavStructureProperty>'
        f'<odeNavStructureProperty><key>titleNode</key><value>{h(name)}</value></odeNavStructureProperty>'
        f'<odeNavStructureProperty><key>titleHtml</key><value/></odeNavStructureProperty>'
        f'<odeNavStructureProperty><key>titlePage</key><value>{h(name)}</value></odeNavStructureProperty>'
        f'<odeNavStructureProperty><key>description</key><value/></odeNavStructureProperty>'
        f'</odeNavStructureProperties>'
        f'<odePagStructures>{blocks}</odePagStructures>'
        f'</odeNavStructure>'
    )


# ---------- Deterministic IDs (numbers, not timestamps, to keep things simple) ----------
_counter = 1
def nid() -> str:
    global _counter
    v = _counter
    _counter += 1
    return f'SP{v:08d}'


# ---------- Pages ----------

REPO_URL = 'https://github.com/ateeducacion/exelearning-style-scumm'
GITHUB_PROXY_URL = 'https://github-proxy.exelearning.dev/?repo=ateeducacion/exelearning-style-scumm&amp;branch=main'
OPEN_IN_EXE_URL = f'https://static.exelearning.dev/?url={GITHUB_PROXY_URL}'
DOWNLOAD_STYLE_URL = f'{REPO_URL}/releases/latest'


def action_buttons_html() -> str:
    return f'''<p style="text-align:center;margin-top:22px;display:flex;gap:14px;flex-wrap:wrap;justify-content:center;">
    <a href="{OPEN_IN_EXE_URL}" target="_blank" rel="noopener"
       style="display:inline-block;background:#ffd24a;color:#0a0f1a;padding:8px 16px;border:2px solid #0a0f1a;box-shadow:inset -2px -2px 0 #b88a3c,inset 2px 2px 0 #fff5c2,4px 4px 0 #0a0f1a;font-family:'ScummSolid','ScummMenuSolid','ScummPixelFallback','Courier New',monospace;font-size:16px;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
      ▶ abrir en eXeLearning
    </a>
    <a href="{DOWNLOAD_STYLE_URL}" target="_blank" rel="noopener"
       style="display:inline-block;background:#4ed6d6;color:#0a0f1a;padding:8px 16px;border:2px solid #0a0f1a;box-shadow:inset -2px -2px 0 #2a7e7e,inset 2px 2px 0 #c8f3f3,4px 4px 0 #0a0f1a;font-family:'ScummSolid','ScummMenuSolid','ScummPixelFallback','Courier New',monospace;font-size:16px;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;">
      ↓ descargar estilo
    </a>
    </p>'''


def illustration_html(idev_id: str, image_name: str, caption: str) -> str:
    # Use '{{context_path}}/<ideviceId>/<file>' so eXeLearning registers the
    # image in its media library on import. On export the placeholder is
    # resolved to the correct relative path.
    return (
        f'<figure style="text-align:center;margin:10px 0 18px;">'
        f'<img src="{{{{context_path}}}}/{idev_id}/{image_name}" alt="{h(caption)}" '
        f'style="max-width:320px;width:100%;height:auto;image-rendering:pixelated;border:3px solid #D700D7;" />'
        f'<figcaption style="font-family:\'VT323\',monospace;font-size:16px;color:#707078;margin-top:6px;">{h(caption)}</figcaption>'
        f'</figure>'
    )


# Mapping of ideviceId → {filename: src_path}. Populated while building pages,
# consumed when copying files into content/resources/<ideviceId>/.
IMAGE_BINDINGS: dict[str, str] = {}


def page_intro() -> str:
    pid = nid()
    bid = nid()
    idv = nid()
    IMAGE_BINDINGS[idv] = '01-inicio.png'
    two_col = (
        '<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;">'
        '<div style="flex:0 0 240px;max-width:260px;">'
        f'<img src="{{{{context_path}}}}/{idv}/01-inicio.png" '
        'alt="Paisaje del ciclo del agua en estilo ZX Spectrum" '
        'style="width:100%;max-width:240px;image-rendering:pixelated;border:3px solid #D700D7;display:block;" />'
        '</div>'
        '<div style="flex:1 1 280px;min-width:0;">'
        '<p><strong>Bienvenido</strong> a esta unidad didáctica sobre el <em>ciclo del agua</em>, preparada por el <strong>Área de Tecnología Educativa</strong> de la Consejería de Educación, Formación Profesional, Actividad Física y Deportes del Gobierno de Canarias.</p>'
        '<p>Aquí aprenderás las cuatro fases principales del ciclo — <strong>evaporación</strong>, <strong>condensación</strong>, <strong>precipitación</strong> y <strong>recogida</strong> — y podrás poner a prueba lo aprendido con un par de actividades.</p>'
        '<p>El estilo visual retro está inspirado en las aventuras gráficas clásicas de LucasArts con motor <strong>SCUMM</strong> (Monkey Island, Maniac Mansion). Activa el modo oscuro con el botón del sol y abre el engranaje de la derecha para mostrar u ocultar el panel SCUMM, activar los <em>scanlines</em> o alternar el modo noche.</p>'
        '</div>'
        '</div>'
    )
    comp = text_idevice(pid, bid, idv, 1, '', two_col + action_buttons_html())
    return nav_page(pid, '', 'Inicio', 1,
                    block(pid, bid, 1, comp, icon='book', block_name='Bienvenida'))


def page_que_es() -> str:
    pid = nid()
    bid = nid()
    idv1 = nid()
    IMAGE_BINDINGS[idv1] = '02-el-ciclo-del-agua.png'
    comp1 = text_idevice(pid, bid, idv1, 1,
        '',
        illustration_html(idv1, '02-el-ciclo-del-agua.png', 'Esquema general del ciclo del agua') +
        '''<p>El <strong>ciclo del agua</strong>, también llamado <em>ciclo hidrológico</em>, es el proceso por el cual el agua circula continuamente entre la atmósfera, la superficie terrestre y los océanos.</p>
        <p>Esta circulación incesante es la que hace posible la vida en el planeta: sin ella no habría lluvia, ríos ni vegetación.</p>''')
    bid2 = nid()
    comp2 = text_idevice(pid, bid2, nid(), 2,
        '',  # (second idevice on the page has no image)
        '''<p><strong>Las cuatro fases principales son:</strong></p>
        <ol>
          <li><strong>Evaporación:</strong> el agua líquida se convierte en vapor.</li>
          <li><strong>Condensación:</strong> el vapor se enfría y forma nubes.</li>
          <li><strong>Precipitación:</strong> el agua vuelve a la superficie en forma de lluvia, granizo o nieve.</li>
          <li><strong>Recogida:</strong> el agua fluye por ríos y lagos hasta los océanos.</li>
        </ol>
        <p>En las siguientes subpáginas desarrollarás cada fase con más detalle.</p>''')
    return nav_page(pid, '', 'El ciclo del agua', 2,
                    block(pid, bid, 1, comp1, icon='info', block_name='¿Qué es el ciclo del agua?')
                    + block(pid, bid2, 2, comp2, icon='objectives', block_name='Las cuatro fases'))


def subpage(title: str, parent_id: str, order: int,
            image_name: str, caption: str,
            paragraphs: list[str],
            footer_paragraphs: list[str] = None, icon: str = 'draw',
            block_name: str = 'Lápiz') -> str:
    pid = nid()
    bid = nid()
    idv = nid()
    IMAGE_BINDINGS[idv] = image_name
    body = illustration_html(idv, image_name, caption) + ''.join(paragraphs)
    comp = text_idevice(pid, bid, idv, 1, '', body)
    blocks_str = block(pid, bid, 1, comp, icon=icon, block_name=block_name)
    if footer_paragraphs:
        bid2 = nid()
        footer_body = ''.join(footer_paragraphs)
        comp2 = text_idevice(pid, bid2, nid(), 2, '', footer_body)
        blocks_str += block(pid, bid2, 2, comp2, icon='info', block_name='Info')
    return pid, nav_page(pid, parent_id, title, order, blocks_str)


def page_activities(parent_ids: dict) -> tuple[str, str]:
    pid = nid()
    bid = nid()
    idv = nid()
    IMAGE_BINDINGS[idv] = '07-actividades.png'
    intro = text_idevice(pid, bid, idv, 1, '',
        illustration_html(idv, '07-actividades.png', 'Vamos a poner a prueba lo aprendido') +
        '''<p>Pon a prueba lo aprendido con las dos actividades de las subpáginas.</p>
        <p>En la primera deberás <strong>ordenar</strong> las fases del ciclo. En la segunda decidirás si varias afirmaciones son <strong>verdaderas o falsas</strong>.</p>''')
    return pid, nav_page(pid, '', 'Actividades', 3,
                         block(pid, bid, 1, intro, icon='reflection',
                               block_name='Comprueba lo aprendido'))


def page_activity_order(parent_id: str) -> str:
    pid = nid()
    bid = nid()
    idv = nid()
    IMAGE_BINDINGS[idv] = '08-ordena-las-fases.png'
    intro = text_idevice(pid, bid, idv, 1, '',
        illustration_html(idv, '08-ordena-las-fases.png', 'Ordena las cuatro fases del ciclo') +
        '<p>Arrastra cada paso hasta dejar las fases en el <strong>orden natural</strong> en el que se producen.</p>')
    bid2 = nid()
    act = scrambled_idevice(
        pid, bid2, nid(),
        '<p>Coloca las fases del ciclo del agua en su orden correcto.</p>',
        [
            'Evaporación: el calor del Sol hace que el agua se evapore.',
            'Condensación: el vapor sube y se condensa formando nubes.',
            'Precipitación: el agua vuelve a caer como lluvia o nieve.',
            'Recogida: el agua se acumula en ríos, lagos y océanos.',
        ]
    )
    return nav_page(pid, parent_id, 'Ordena las fases', 1,
                    block(pid, bid, 1, intro, icon='pieces', block_name='Cómo se hace')
                    + block(pid, bid2, 2, act, icon='pieces', block_name='Ordena las fases del ciclo'))


def page_activity_tof(parent_id: str) -> str:
    pid = nid()
    bid = nid()
    idv = nid()
    IMAGE_BINDINGS[idv] = '09-verdadero-o-falso.png'
    intro = text_idevice(pid, bid, idv, 1, '',
        illustration_html(idv, '09-verdadero-o-falso.png', 'Decide si cada afirmación es verdadera o falsa') +
        '<p>Lee cada afirmación y decide si es <strong>verdadera</strong> o <strong>falsa</strong>.</p>')
    bid2 = nid()
    act = trueorfalse_idevice(
        pid, bid2, nid(),
        '<p>Marca V o F según corresponda.</p>',
        [
            ('El Sol es la principal fuente de energía del ciclo del agua.', True,
             'Correcto. Sin el Sol no habría evaporación.'),
            ('La condensación consiste en que el agua líquida se convierte en vapor.', False,
             'Falso. Eso es la evaporación. La condensación es el paso contrario.'),
            ('La nieve también es una forma de precipitación.', True,
             'Correcto. Lluvia, granizo y nieve son precipitaciones.'),
            ('El ciclo del agua comienza y acaba siempre en los océanos.', False,
             'No del todo: es un ciclo continuo sin principio ni fin claros.'),
        ]
    )
    return nav_page(pid, parent_id, '¿Verdadero o falso?', 2,
                    block(pid, bid, 1, intro, icon='ask', block_name='Cómo se hace')
                    + block(pid, bid2, 2, act, icon='ask', block_name='Afirmaciones sobre el ciclo'))


def page_credits() -> str:
    pid = nid()
    bid = nid()
    idv = nid()
    IMAGE_BINDINGS[idv] = '11-creditos-y-descargas.png'
    intro = text_idevice(pid, bid, idv, 1, '',
        illustration_html(idv, '11-creditos-y-descargas.png', 'Créditos y descargas') +
        '''<p>Esta unidad de ejemplo ha sido creada por el <strong>Área de Tecnología Educativa</strong> de la Consejería de Educación, Formación Profesional, Actividad Física y Deportes del <strong>Gobierno de Canarias</strong>, para mostrar el estilo <em>SCUMM Adventure</em>.</p>
        <p><strong>Agradecimientos:</strong> comunidad de <a href="https://exelearning.net/" target="_blank" rel="noopener">eXeLearning</a>, mantenida por el <a href="https://cedec.intef.es/" target="_blank" rel="noopener">CEDEC</a> y las diferentes administraciones educativas del Estado.</p>
        <p><strong>Licencia:</strong> Creative Commons Reconocimiento-CompartirIgual 4.0 (CC BY-SA 4.0). Puedes reutilizar este recurso siempre que cites a su autor y lo publiques bajo la misma licencia.</p>''' +
        action_buttons_html())
    bid2 = nid()
    dl = download_source_idevice(pid, bid2, nid())
    return nav_page(pid, '', 'Créditos y descargas', 5,
                    block(pid, bid, 1, intro, icon='info', block_name='Sobre esta unidad')
                    + block(pid, bid2, 2, dl, icon='download', block_name='Descarga el archivo fuente'))


def page_resources() -> str:
    pid = nid()
    bid = nid()
    idv = nid()
    IMAGE_BINDINGS[idv] = '10-recursos.png'
    body = text_idevice(pid, bid, idv, 1, '',
        illustration_html(idv, '10-recursos.png', 'Enlaces para seguir aprendiendo') +
        '''<p>Estos recursos te ayudarán a profundizar en el ciclo del agua:</p>
        <ul>
          <li><a href="https://es.wikipedia.org/wiki/Ciclo_hidrol%C3%B3gico" target="_blank" rel="noopener">Wikipedia · Ciclo hidrológico</a></li>
          <li><a href="https://www.juntadeandalucia.es/educacion/permanente/materiales/" target="_blank" rel="noopener">Materiales de educación permanente</a></li>
          <li><a href="https://exelearning.net/" target="_blank" rel="noopener">exelearning.net</a> — la herramienta con la que se ha creado esta unidad</li>
        </ul>
        <p><em>Licencia: CC BY-SA 4.0. Puedes reutilizar y modificar este material citando a su autor.</em></p>''')
    return nav_page(pid, '', 'Recursos', 4,
                    block(pid, bid, 1, body, icon='book', block_name='Para saber más'))


# Build the XML
intro_xml = page_intro()
que_es_xml = page_que_es()

# Extract parent id for que_es from its XML (first <odePageId>)
import re as _re
que_es_pid = _re.search(r'<odePageId>([^<]+)</odePageId>', que_es_xml).group(1)

_evap_pid, evap_xml = subpage('Evaporación', que_es_pid, 1,
    '03-evaporacion.png', 'El Sol calienta el agua y la transforma en vapor',
    ['<p>La <strong>evaporación</strong> es la primera fase del ciclo. El calor del Sol transforma el agua líquida de mares, ríos y lagos en <strong>vapor de agua</strong>, que asciende a la atmósfera.</p>',
     '<p>Las plantas también aportan vapor mediante un proceso llamado <em>transpiración</em>. La suma de ambos se conoce como <strong>evapotranspiración</strong>.</p>'],
    icon='draw', block_name='El Sol pone el agua en marcha')

_cond_pid, cond_xml = subpage('Condensación', que_es_pid, 2,
    '04-condensacion.png', 'El vapor se enfría y forma nubes',
    ['<p>Al subir, el vapor de agua encuentra temperaturas cada vez más frías. Se <strong>condensa</strong> en minúsculas gotas que forman las <strong>nubes</strong>.</p>',
     '<p>Cuando las gotas se agrupan y crecen, se vuelven demasiado pesadas para flotar y darán paso a la siguiente fase.</p>'],
    icon='draw', block_name='Del vapor a las nubes')

_prec_pid, prec_xml = subpage('Precipitación', que_es_pid, 3,
    '05-precipitacion.png', 'Lluvia, nieve y granizo caen desde las nubes',
    ['<p>La <strong>precipitación</strong> es la caída del agua desde las nubes hasta la superficie terrestre. Puede adoptar forma de:</p>',
     '<ul><li><strong>Lluvia</strong>, si las gotas caen líquidas.</li><li><strong>Nieve</strong>, si se congelan formando cristales.</li><li><strong>Granizo</strong>, si se forman bolitas de hielo.</li></ul>',
     '<p>En regiones frías, buena parte del agua queda almacenada en <em>glaciares</em> y neveros durante siglos.</p>'],
    icon='draw', block_name='Lluvia, nieve y granizo')

_rec_pid, rec_xml = subpage('Recogida', que_es_pid, 4,
    '06-recogida.png', 'Ríos, lagos y océanos recogen el agua que vuelve',
    ['<p>El agua de lluvia y nieve fluye por la superficie formando arroyos, ríos y embalses. Parte se filtra en el terreno creando <strong>acuíferos</strong> subterráneos.</p>',
     '<p>Tarde o temprano, toda esa agua regresa al océano y el ciclo vuelve a comenzar.</p>',
     '<p><em>Y así, gota a gota, el agua ha estado circulando por la Tierra desde hace miles de millones de años.</em></p>'],
    icon='draw', block_name='El agua vuelve al mar')

activities_pid, activities_xml = page_activities({})
order_xml = page_activity_order(activities_pid)
tof_xml = page_activity_tof(activities_pid)
resources_xml = page_resources()
credits_xml = page_credits()

nav_structures_xml = (
    intro_xml
    + que_es_xml
    + evap_xml + cond_xml + prec_xml + rec_xml
    + activities_xml + order_xml + tof_xml
    + resources_xml
    + credits_xml
)

# Assemble root content.xml
root = f'''<?xml version="1.0" encoding="utf-8"?>
<ode>
<userPreferences><userPreference><key>theme</key><value>scumm</value></userPreference></userPreferences>
<odeResources>
  <odeResource><key>odeVersionId</key><value>SP20260419A</value></odeResource>
  <odeResource><key>odeId</key><value>SP20260419</value></odeResource>
  <odeResource><key>odeVersionName</key><value>1</value></odeResource>
  <odeResource><key>isDownload</key><value>true</value></odeResource>
</odeResources>
<odeProperties>
  <odeProperty><key>pp_title</key><value>El ciclo del agua · SCUMM Adventure</value></odeProperty>
  <odeProperty><key>pp_lang</key><value>es</value></odeProperty>
  <odeProperty><key>pp_author</key><value>Área de Tecnología Educativa · Gobierno de Canarias</value></odeProperty>
  <odeProperty><key>pp_license</key><value>creative commons: attribution - share alike 4.0</value></odeProperty>
  <odeProperty><key>pp_rightsInfo</key><value>© Área de Tecnología Educativa · Gobierno de Canarias, 2026. Contenido y tema publicados bajo Creative Commons Reconocimiento-CompartirIgual 4.0 (CC BY-SA 4.0). Tipografías LucasArts SCUMM (scummbar.com, uso no comercial) y VT323 (SIL OFL 1.1).</value></odeProperty>
  <odeProperty><key>pp_description</key><value>Unidad didáctica de ejemplo sobre el ciclo del agua, presentada con el estilo retro SCUMM Adventure.</value></odeProperty>
  <odeProperty><key>pp_theme</key><value>scumm</value></odeProperty>
  <odeProperty><key>pp_addExeLink</key><value>true</value></odeProperty>
  <odeProperty><key>pp_exportElp</key><value>true</value></odeProperty>
  <odeProperty><key>pp_addPagination</key><value>true</value></odeProperty>
  <odeProperty><key>pp_addSearchBox</key><value>true</value></odeProperty>
  <odeProperty><key>pp_addAccessibilityToolbar</key><value>false</value></odeProperty>
  <odeProperty><key>pp_extraHeadContent</key><value/></odeProperty>
  <odeProperty><key>footer</key><value>&lt;p class=&quot;license&quot;&gt;© &lt;a href=&quot;https://www3.gobiernodecanarias.org/medusa/edublog/cprofestenerifesur/&quot; rel=&quot;noopener&quot; target=&quot;_blank&quot;&gt;Área de Tecnología Educativa&lt;/a&gt; · Gobierno de Canarias — Licencia &lt;a href=&quot;https://creativecommons.org/licenses/by-sa/4.0/deed.es&quot; rel=&quot;license noopener&quot; target=&quot;_blank&quot;&gt;Creative Commons BY-SA 4.0&lt;/a&gt;&lt;/p&gt;</value></odeProperty>
  <odeProperty><key>exportSource</key><value>true</value></odeProperty>
</odeProperties>
<odeNavStructures>
{nav_structures_xml}
</odeNavStructures>
</ode>
'''

out_root = '/tmp/water-cycle-src'
if os.path.isdir(out_root):
    shutil.rmtree(out_root)
os.makedirs(out_root)
with open(os.path.join(out_root, 'content.xml'), 'w', encoding='utf-8') as f:
    f.write(root)

# Copy illustrations into content/resources/<ideviceId>/<filename>.
# eXeLearning only registers images in the media library when they live under
# a folder named after the owning iDevice id (matching the
# '{{context_path}}/<ideviceId>/<filename>' references in content.xml).
images_src = '/Users/ernesto/Downloads/git/exelearning-style-scumm/imagenes-generadas'
images_dst = os.path.join(out_root, 'content', 'resources')
os.makedirs(images_dst, exist_ok=True)
for idev, fn in IMAGE_BINDINGS.items():
    src = os.path.join(images_src, fn)
    if not os.path.exists(src):
        print(f'WARN: missing {src}')
        continue
    sub = os.path.join(images_dst, idev)
    os.makedirs(sub, exist_ok=True)
    shutil.copy(src, os.path.join(sub, fn))

# Zip as .elp (ZIP of content.xml + resources)
elp_path = '/tmp/water-cycle.elp'
if os.path.exists(elp_path):
    os.remove(elp_path)
with zipfile.ZipFile(elp_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for dirpath, _, filenames in os.walk(out_root):
        for fn in filenames:
            abs_path = os.path.join(dirpath, fn)
            rel_path = os.path.relpath(abs_path, out_root)
            z.write(abs_path, rel_path)

print(f'Wrote {elp_path}')
print(f'Page count: {_counter - 1} ids generated')
