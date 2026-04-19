/*!
 * =================================================================
 * SCUMM Adventure — eXeLearning theme script
 * -----------------------------------------------------------------
 * Autor:    Área de Tecnología Educativa
 * Versión:  1.0.0
 * Licencia: Creative Commons BY-SA 4.0
 *
 * Responsabilidades del script:
 *   1. Inyecta el panel inferior SCUMM (verbos, frase, inventario,
 *      brújula) en cualquier exportación eXeLearning.
 *   2. Añade el botón de modo claro/oscuro (icono sol) siguiendo la
 *      misma convención del tema "universal": clase `.exe-dark-mode`
 *      en <html>, persistida en localStorage como `exeDarkMode`.
 *   3. Reproduce el comportamiento del menú lateral y de los
 *      togglers responsive (clase `.siteNav-off` en <body>).
 *
 * Diseño defensivo:
 *   - Funciona con o sin jQuery (eXeLearning carga jQuery en sus
 *     exportaciones, pero el fallback vanilla permite probar el
 *     tema fuera del entorno).
 *   - No depende de CDN ni de recursos remotos.
 *   - No tira abajo la UI si algún contenedor no existe.
 * =================================================================
 */
(function (global) {
    'use strict';

    if (global.__scummThemeLoaded) return;
    global.__scummThemeLoaded = true;

    var I18N = (global.$exe_i18n && typeof global.$exe_i18n === 'object')
        ? global.$exe_i18n
        : {};
    function t(key, fallback) { return I18N[key] || fallback; }

    var SCUMM = {
        verbs: [
            { id: 'look',  label: t('look',  'Mirar')   },
            { id: 'use',   label: t('use',   'Usar')    },
            { id: 'talk',  label: t('talk',  'Hablar')  },
            { id: 'pick',  label: t('pick',  'Coger')   },
            { id: 'give',  label: t('give',  'Dar')     },
            { id: 'open',  label: t('open',  'Abrir')   },
            { id: 'close', label: t('close', 'Cerrar')  },
            { id: 'push',  label: t('push',  'Empujar') },
            { id: 'pull',  label: t('pull',  'Tirar')   }
        ],
        inventory: [
            { icon: 'icon_item_flask.png',  label: 'Vaso de agua' },
            { icon: 'icon_item_scroll.png', label: 'Mapa del ciclo' },
            { icon: 'icon_item_key.png',    label: 'Llave del laboratorio' }
        ],
        currentVerb: 'look',
        currentTarget: ''
    };

    /* --------------- Utilidades --------------- */
    function el(tag, attrs, children) {
        var n = document.createElement(tag);
        if (attrs) for (var k in attrs) {
            if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
            if (k === 'class') n.className = attrs[k];
            else if (k === 'html') n.innerHTML = attrs[k];
            else if (k === 'on')    for (var ev in attrs.on) n.addEventListener(ev, attrs.on[ev]);
            else n.setAttribute(k, attrs[k]);
        }
        if (children) (Array.isArray(children) ? children : [children]).forEach(function (c) {
            if (c == null) return;
            n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        });
        return n;
    }

    function imageBase() {
        var s = document.currentScript ||
                document.querySelector('script[src$="style.js"]') ||
                document.querySelector('script[src$="scumm.js"]');
        if (s && s.src) {
            var parts = s.src.split('/');
            parts.pop();
            return parts.join('/') + '/images/';
        }
        return 'images/';
    }
    var IMG = imageBase();

    function isLocalStorageAvailable() {
        try {
            var x = '__scumm_probe__';
            localStorage.setItem(x, x);
            localStorage.removeItem(x);
            return true;
        } catch (e) { return false; }
    }

    function inIframe() {
        try { return global.self !== global.top; }
        catch (e) { return true; }
    }

    function isLowRes() { return global.innerWidth <= 768; }

    /* --------------- Modo oscuro (sol) --------------- */
    var darkMode = {
        init: function () {
            darkMode.setMode();
            var btn = document.getElementById('darkModeToggler');
            if (!btn) return;
            btn.addEventListener('click', function () {
                var active = document.documentElement.classList.contains('exe-dark-mode') ? 'off' : 'on';
                darkMode.setMode(active);
            });
        },
        setMode: function (active) {
            if (!isLocalStorageAvailable()) return;
            var dark = false;
            var stored = localStorage.getItem('exeDarkMode');
            if (stored === 'on') dark = true;
            if (active === 'on')  dark = true;
            if (active === 'off') dark = false;
            if (dark) {
                localStorage.setItem('exeDarkMode', 'on');
                document.documentElement.classList.add('exe-dark-mode');
            } else {
                localStorage.removeItem('exeDarkMode');
                document.documentElement.classList.remove('exe-dark-mode');
            }
        }
    };

    function injectDarkModeToggler() {
        if (document.getElementById('darkModeToggler')) return;
        if (!isLocalStorageAvailable()) return;
        var btn = el('button', {
            type: 'button',
            id: 'darkModeToggler',
            class: 'toggler',
            title: t('mode_toggler', 'Cambiar de día a noche')
        }, el('span', null, t('mode_toggler', 'Cambiar de día a noche')));

        var host = document.querySelector('.package-header')
                || document.querySelector('.main-header')
                || document.querySelector('.exe-content')
                || document.body;
        if (host.firstChild) host.insertBefore(btn, host.firstChild);
        else host.appendChild(btn);
    }

    /* --------------- Menú responsive --------------- */
    function wireNavToggler() {
        if (!document.getElementById('siteNav')) return;
        if (document.getElementById('siteNavToggler')) return;

        var nav = document.getElementById('siteNav');
        var btn = el('button', {
            type: 'button',
            id: 'siteNavToggler',
            class: 'toggler',
            title: t('menu', 'Menú')
        }, el('span', null, t('menu', 'Menú')));
        nav.parentNode.insertBefore(btn, nav);

        btn.addEventListener('click', function () {
            document.body.classList.toggle('siteNav-off');
            if (isLowRes()) document.body.classList.toggle('siteNav-on');
        });

        // Restaurar desde query string (?nav=false)
        var q = global.location.search || '';
        if (q.indexOf('nav=false') !== -1) {
            document.body.classList.add('siteNav-off');
        }
    }

    /* --------------- Panel SCUMM --------------- */
    function currentVerbLabel() {
        var v = SCUMM.verbs.filter(function (x) { return x.id === SCUMM.currentVerb; })[0];
        return v ? v.label : t('look', 'Mirar');
    }
    function updateSentence() {
        var s = document.getElementById('scumm-sentence');
        if (!s) return;
        s.innerHTML = '';
        s.appendChild(el('span', { class: 'verb' }, currentVerbLabel()));
        if (SCUMM.currentTarget) {
            s.appendChild(el('span', { class: 'prep' }, '·'));
            s.appendChild(el('span', { class: 'target' }, SCUMM.currentTarget));
        } else {
            s.appendChild(el('span', { class: 'target blink' }));
        }
    }
    function selectVerb(v) {
        SCUMM.currentVerb = v.id;
        document.querySelectorAll('.scumm-verb').forEach(function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-verb') === v.id);
        });
        updateSentence();
    }
    function setTarget(label) {
        SCUMM.currentTarget = label;
        updateSentence();
    }

    function buildScummPanel() {
        var panel = el('aside', {
            class: 'scumm-panel',
            role: 'region',
            'aria-label': t('scumm_panel', 'Panel de acción SCUMM')
        });

        // --- Verbos ---
        var verbs = el('div', { class: 'scumm-verbs', role: 'toolbar', 'aria-label': t('scumm_verbs', 'Verbos') });
        SCUMM.verbs.forEach(function (v) {
            var b = el('button', {
                class: 'scumm-verb' + (v.id === SCUMM.currentVerb ? ' is-active' : ''),
                'data-verb': v.id,
                'data-label': v.label,
                type: 'button',
                on: { click: function () { selectVerb(v); } }
            }, v.label);
            verbs.appendChild(b);
        });

        // --- Frase + inventario ---
        var middle = el('div', { class: 'scumm-middle' });
        var sentence = el('div', { class: 'scumm-sentence', id: 'scumm-sentence' });
        sentence.appendChild(el('span', { class: 'verb' }, currentVerbLabel()));
        sentence.appendChild(el('span', { class: 'target blink' }));
        middle.appendChild(sentence);

        var inv = el('div', { class: 'scumm-inventory', role: 'list', 'aria-label': t('scumm_inventory', 'Inventario') });
        SCUMM.inventory.forEach(function (it) {
            var slot = el('button', {
                class: 'scumm-inv-slot',
                type: 'button',
                role: 'listitem',
                'data-label': it.label,
                on: {
                    click: function () {
                        document.querySelectorAll('.scumm-inv-slot.is-selected')
                            .forEach(function (s) { s.classList.remove('is-selected'); });
                        slot.classList.add('is-selected');
                        setTarget(it.label);
                    }
                }
            });
            var img = el('img', { src: IMG + it.icon, alt: it.label });
            slot.appendChild(img);
            inv.appendChild(slot);
        });
        for (var i = SCUMM.inventory.length; i < 8; i++) {
            inv.appendChild(el('span', { class: 'scumm-inv-slot', 'aria-hidden': 'true' }));
        }
        middle.appendChild(inv);

        // --- Brújula ---
        var compass = el('div', { class: 'scumm-compass', 'aria-label': t('scumm_compass', 'Brújula') });
        var arrows = [
            ['spacer', ''], ['↑', t('up', 'Arriba')], ['spacer', ''],
            ['←', t('left', 'Izquierda')], ['●', t('act', 'Usar')], ['→', t('right', 'Derecha')],
            ['spacer', ''], ['↓', t('down', 'Abajo')], ['spacer', '']
        ];
        arrows.forEach(function (a) {
            var cls = 'arrow' + (a[0] === 'spacer' ? ' spacer' : '');
            var b = a[0] === 'spacer'
                ? el('span', { class: cls, 'aria-hidden': 'true' })
                : el('button', { class: cls, type: 'button', title: a[1] }, a[0]);
            compass.appendChild(b);
        });

        panel.appendChild(verbs);
        panel.appendChild(middle);
        panel.appendChild(compass);
        return panel;
    }

    function wireHotspots() {
        document.querySelectorAll(
            '.box-title, .iDeviceTitle, .page-title, .page-content a, .box-content a, .exe-content a'
        ).forEach(function (h) {
            if (h.__scummWired) return;
            h.__scummWired = true;
            h.addEventListener('mouseenter', function () {
                var txt = (h.textContent || '').trim().replace(/^[«»›▸\s]+|[«»›▸\s]+$/g, '');
                setTarget(txt);
            });
            h.addEventListener('mouseleave', function () { setTarget(''); });
        });
    }

    function mountPanel() {
        if (document.querySelector('.scumm-panel')) return;
        document.body.appendChild(buildScummPanel());
    }

    /* --------------- Plegar/Desplegar iDevice --------------- */
    function wireBoxToggles() {
        document.querySelectorAll('.box-toggle').forEach(function (t) {
            if (t.__scummToggle) return;
            t.__scummToggle = true;
            t.addEventListener('click', function (e) {
                e.preventDefault();
                var box = t.closest('.box, article.box, .iDevice');
                if (box) box.classList.toggle('minimized');
            });
        });
    }

    /* --------------- Inicialización --------------- */
    function init() {
        if (inIframe()) document.body.classList.add('in-iframe');

        injectDarkModeToggler();
        darkMode.init();
        wireNavToggler();
        wireBoxToggles();
        mountPanel();
        wireHotspots();
    }

    // Aplica el modo oscuro guardado lo antes posible para evitar
    // parpadeo en contenidos pesados (mismo patrón que "universal").
    darkMode.setMode();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-cablea cuando eXeLearning cambia el DOM dinámicamente.
    var mo = new MutationObserver(function () {
        wireHotspots();
        wireBoxToggles();
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    // Export mínimo para pruebas.
    global.SCUMM = SCUMM;
    global.SCUMM.selectVerb = function (id) {
        var v = SCUMM.verbs.filter(function (x) { return x.id === id; })[0];
        if (v) selectVerb(v);
    };
    global.SCUMM.setTarget = setTarget;
})(typeof window !== 'undefined' ? window : this);
