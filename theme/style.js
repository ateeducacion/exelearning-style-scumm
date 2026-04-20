/*!
 * =================================================================
 * SCUMM Adventure — eXeLearning theme script
 * -----------------------------------------------------------------
 * Autor:    Área de Tecnología Educativa
 * Versión:  1.1.0
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
 *   4. Panel "tweaks" con engranaje (#scummTweaks / #scummTweaksToggler):
 *      toggles para Panel SCUMM, Scanlines CRT y Modo noche, persistido
 *      en localStorage.exeScummTweaks (JSON).
 *   5. Overlay CRT de scanlines (body.scumm-scanlines, por defecto on).
 *   6. Transición fade tipo "Day of the Tentacle" entre páginas del mismo
 *      sitio (.scumm-fade-overlay).
 *   7. Intro tipo "LucasArts Entertainment Company" una vez por sesión
 *      (#scummIntro, sessionStorage.scummIntroShown).
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

    function prefersReducedMotion() {
        try {
            return global.matchMedia &&
                global.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) { return false; }
    }

    /* --------------- Tweaks: estado y aplicación temprana ---------------
       Leemos localStorage.exeScummTweaks lo antes posible para evitar FOUC
       (la clase body.scumm-scanlines se aplica antes del primer paint). */
    var TWEAKS_KEY = 'exeScummTweaks';
    var TWEAKS_DEFAULTS = { panel: true, scanlines: true, dark: false };

    function readTweaks() {
        var out = {};
        for (var k in TWEAKS_DEFAULTS) out[k] = TWEAKS_DEFAULTS[k];
        if (!isLocalStorageAvailable()) return out;
        try {
            var raw = localStorage.getItem(TWEAKS_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                for (var k2 in parsed) {
                    if (typeof parsed[k2] === 'boolean') out[k2] = parsed[k2];
                }
            }
        } catch (e) {}
        // Reconciliar con exeDarkMode (fuente de verdad del tema oscuro)
        try {
            if (isLocalStorageAvailable()) {
                out.dark = localStorage.getItem('exeDarkMode') === 'on';
            }
        } catch (e2) {}
        return out;
    }

    function saveTweaks(state) {
        if (!isLocalStorageAvailable()) return;
        try { localStorage.setItem(TWEAKS_KEY, JSON.stringify(state)); }
        catch (e) {}
    }

    function applyTweaksToBody(state) {
        var body = document.body;
        if (!body) return;
        // Scanlines
        if (state.scanlines) body.classList.add('scumm-scanlines');
        else body.classList.remove('scumm-scanlines');
        // Panel visible u oculto
        if (state.panel) body.classList.remove('scumm-panel-off');
        else body.classList.add('scumm-panel-off');
        // Modo noche (usamos la misma llave que darkMode para compatibilidad)
        if (state.dark) document.documentElement.classList.add('exe-dark-mode');
        else document.documentElement.classList.remove('exe-dark-mode');
    }

    // Si <body> ya existe (script al final del <body>), aplica inmediatamente.
    // Si no, espera a DOMContentLoaded en init() para aplicar y evitar FOUC.
    var __earlyState = readTweaks();
    if (document.body) applyTweaksToBody(__earlyState);

    /* --------------- Modo oscuro (sol) --------------- */
    var darkMode = {
        init: function () {
            darkMode.setMode();
            var btn = document.getElementById('darkModeToggler');
            if (!btn) return;
            btn.addEventListener('click', function () {
                var active = document.documentElement.classList.contains('exe-dark-mode') ? 'off' : 'on';
                darkMode.setMode(active);
                // Sincroniza con el panel tweaks si existe
                tweaks.syncFromDom();
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
            title: t('menu', 'Mostrar u ocultar menú'),
            'aria-label': t('menu', 'Mostrar u ocultar menú')
        }, el('span', null, t('menu', 'Mostrar u ocultar menú')));
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

    /* Search toggler: reveals eXeLearning's native #exe-client-search */
    function wireSearchToggler() {
        var search = document.getElementById('exe-client-search');
        if (!search) return;
        if (document.getElementById('searchBarToggler')) return;

        var btn = el('button', {
            type: 'button',
            id: 'searchBarToggler',
            class: 'toggler',
            title: t('search', 'Buscar'),
            'aria-label': t('search', 'Buscar')
        }, el('span', null, t('search', 'Buscar')));

        var navTog = document.getElementById('siteNavToggler');
        if (navTog && navTog.parentNode) {
            navTog.parentNode.insertBefore(btn, navTog.nextSibling);
        } else {
            document.body.appendChild(btn);
        }

        // Closed by default — exe_export.js unconditionally sets `exe-search-on`
        // on <body>, so the theme owns visibility via its own class.
        btn.setAttribute('aria-pressed', 'false');
        btn.addEventListener('click', function () {
            var on = document.body.classList.toggle('scumm-search-on');
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            if (on) {
                var input = document.getElementById('exe-client-search-text');
                if (input && input.focus) setTimeout(function () { input.focus(); }, 30);
            }
        });
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
        for (var i = SCUMM.inventory.length; i < 16; i++) {
            inv.appendChild(el('span', { class: 'scumm-inv-slot', 'aria-hidden': 'true' }));
        }
        middle.appendChild(inv);

        panel.appendChild(verbs);
        panel.appendChild(middle);
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
    // eXeLearning (libs/exe_export.js) ya gestiona .box-toggle con slideUp/
    // slideDown. Sólo cableamos nuestro handler si ese código no está
    // presente (p. ej. en theme/demo.html, que no carga libs/).
    function exeHandlesBoxToggles() {
        // exe_export.js's addBoxToggleEvent requires jQuery. If either piece
        // is missing (e.g. demo.html loads only the theme, not libs/), fall
        // back to the vanilla handler below.
        return !!(global.$exeExport &&
                  typeof global.$exeExport.addBoxToggleEvent === 'function' &&
                  typeof global.jQuery === 'function');
    }
    function wireBoxToggles() {
        if (exeHandlesBoxToggles()) return;
        document.querySelectorAll('.box-toggle').forEach(function (btn) {
            if (btn.__scummToggle) return;
            btn.__scummToggle = true;
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var box = btn.closest('article.box, .box, .iDevice');
                if (!box) return;
                var willMin = !box.classList.contains('minimized');
                box.classList.toggle('minimized', willMin);
                var content = box.querySelector(':scope > .box-content');
                if (content) content.style.display = willMin ? 'none' : '';
            });
        });
    }

    /* --------------- Tweaks: botón engranaje + panel flotante --------- */
    var tweaks = {
        state: __earlyState,

        injectToggler: function () {
            if (document.getElementById('scummTweaksToggler')) return;
            var btn = el('button', {
                type: 'button',
                id: 'scummTweaksToggler',
                class: 'toggler',
                title: t('scumm_tweaks', 'Ajustes SCUMM'),
                'aria-label': t('scumm_tweaks', 'Ajustes SCUMM')
            }, el('span', null, t('scumm_tweaks', 'Ajustes SCUMM')));

            // Colocación: .package-header (single-page) o flotante (exe-web-site)
            var host = document.querySelector('.package-header')
                    || document.querySelector('.main-header')
                    || document.querySelector('.exe-content')
                    || document.body;
            if (host === document.body || document.body.classList.contains('exe-web-site')) {
                document.body.appendChild(btn);
            } else {
                host.appendChild(btn);
            }
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                tweaks.togglePanel();
            });
        },

        buildPanel: function () {
            if (document.getElementById('scummTweaks')) return;
            var panel = el('div', {
                id: 'scummTweaks',
                role: 'dialog',
                'aria-label': t('scumm_tweaks', 'Ajustes SCUMM'),
                'aria-hidden': 'true'
            });
            panel.innerHTML =
                '<div class="tw-head">' +
                    '<span>' + (t('scumm_tweaks', 'Ajustes SCUMM')) + '</span>' +
                    '<button type="button" class="tw-close" aria-label="' +
                        (t('close', 'Cerrar')) + '">x</button>' +
                '</div>' +
                '<div class="tw-body">' +
                    '<div class="tw-row">' +
                        '<span class="tw-label">' + t('scumm_tweak_panel', 'Panel SCUMM') + '</span>' +
                        '<button type="button" class="tw-toggle" data-key="panel" data-on="true">' +
                            t('on', 'ON') + '</button>' +
                    '</div>' +
                    '<div class="tw-row">' +
                        '<span class="tw-label">' + t('scumm_tweak_scan', 'Scanlines') + '</span>' +
                        '<button type="button" class="tw-toggle" data-key="scanlines" data-on="true">' +
                            t('on', 'ON') + '</button>' +
                    '</div>' +
                    '<div class="tw-row">' +
                        '<span class="tw-label">' + t('scumm_tweak_night', 'Modo noche') + '</span>' +
                        '<button type="button" class="tw-toggle" data-key="dark" data-on="false">' +
                            t('off', 'OFF') + '</button>' +
                    '</div>' +
                    '<div class="tw-row tw-row-action">' +
                        '<span class="tw-label">' + t('scumm_tweak_intro', 'Intro') + '</span>' +
                        '<button type="button" class="tw-toggle tw-replay-intro">' +
                            t('scumm_tweak_intro_replay', 'reproducir') + '</button>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(panel);

            // Wire toggles (data-key rows only)
            var toggles = panel.querySelectorAll('.tw-toggle[data-key]');
            for (var i = 0; i < toggles.length; i++) {
                toggles[i].addEventListener('click', function () {
                    var key = this.getAttribute('data-key');
                    if (!key) return;
                    tweaks.state[key] = !tweaks.state[key];
                    // Espejo con la llave existente del modo oscuro
                    if (key === 'dark') {
                        darkMode.setMode(tweaks.state.dark ? 'on' : 'off');
                    } else {
                        applyTweaksToBody(tweaks.state);
                    }
                    saveTweaks(tweaks.state);
                    tweaks.render();
                });
            }

            // Wire "replay intro" — clears the session flag and re-plays the loader
            var replay = panel.querySelector('.tw-replay-intro');
            if (replay) {
                replay.addEventListener('click', function (e) {
                    e.preventDefault();
                    try { sessionStorage.removeItem(intro.SESSION_KEY); } catch (err) {}
                    panel.classList.remove('open');
                    panel.setAttribute('aria-hidden', 'true');
                    intro.show();
                });
            }
            var closeBtn = panel.querySelector('.tw-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    panel.classList.remove('open');
                    panel.setAttribute('aria-hidden', 'true');
                });
            }
            // ESC cierra
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && panel.classList.contains('open')) {
                    panel.classList.remove('open');
                    panel.setAttribute('aria-hidden', 'true');
                }
            });
            tweaks.render();
        },

        render: function () {
            var panel = document.getElementById('scummTweaks');
            if (!panel) return;
            var map = panel.querySelectorAll('.tw-toggle[data-key]');
            for (var i = 0; i < map.length; i++) {
                var key = map[i].getAttribute('data-key');
                var on = !!tweaks.state[key];
                map[i].setAttribute('data-on', on ? 'true' : 'false');
                map[i].textContent = on ? t('on', 'ON') : t('off', 'OFF');
            }
        },

        togglePanel: function () {
            var panel = document.getElementById('scummTweaks');
            if (!panel) return;
            var open = !panel.classList.contains('open');
            panel.classList.toggle('open', open);
            panel.setAttribute('aria-hidden', open ? 'false' : 'true');
        },

        // Reconcilia cuando el usuario cambia el modo oscuro por otro canal
        syncFromDom: function () {
            tweaks.state.dark = document.documentElement.classList.contains('exe-dark-mode');
            saveTweaks(tweaks.state);
            tweaks.render();
        },

        init: function () {
            // Asegura que el estado leído temprano queda aplicado (por si <body> no existía)
            applyTweaksToBody(tweaks.state);
            tweaks.injectToggler();
            tweaks.buildPanel();
        }
    };

    /* --------------- Day-of-the-Tentacle fade entre páginas ---------- */
    var fade = {
        overlay: null,

        ensure: function () {
            if (fade.overlay && document.body.contains(fade.overlay)) return fade.overlay;
            var o = document.getElementById('scummFadeOverlay');
            if (!o) {
                o = el('div', { id: 'scummFadeOverlay', class: 'scumm-fade-overlay', 'aria-hidden': 'true' });
                document.body.appendChild(o);
            }
            fade.overlay = o;
            return o;
        },

        enter: function () {
            // Al cargar: overlay al 100% -> fade a 0 en ~600ms
            if (prefersReducedMotion()) return;
            var o = fade.ensure();
            o.classList.add('is-entering');
            // Siguiente frame: quitar la clase para disparar el fade
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    o.classList.remove('is-entering');
                });
            });
        },

        isInternalAnchor: function (a) {
            if (!a || !a.href) return false;
            if (a.hasAttribute('download')) return false;
            if (a.target && a.target !== '' && a.target !== '_self') return false;
            var href = a.getAttribute('href') || '';
            if (!href || href.charAt(0) === '#') return false;          // anclas puras
            if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
            // Mismo origen
            var url;
            try { url = new URL(a.href, global.location.href); }
            catch (e) { return false; }
            if (url.origin !== global.location.origin) return false;
            // Misma página, distinto hash -> no forzamos fade (navegación anchor)
            if (url.pathname === global.location.pathname &&
                url.search === global.location.search &&
                url.hash !== '' && url.hash !== global.location.hash) return false;
            return true;
        },

        wireLinks: function () {
            if (prefersReducedMotion()) return;
            document.addEventListener('click', function (e) {
                if (e.defaultPrevented) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (e.button !== 0) return;
                var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
                if (!a) return;
                if (!fade.isInternalAnchor(a)) return;
                e.preventDefault();
                var url = a.href;
                var o = fade.ensure();
                o.classList.add('is-leaving');
                var done = false;
                var go = function () {
                    if (done) return;
                    done = true;
                    global.location.href = url;
                };
                o.addEventListener('transitionend', go, { once: true });
                // Fallback por si transitionend no dispara
                setTimeout(go, 700);
            }, true);
        },

        init: function () {
            fade.ensure();
            fade.enter();
            fade.wireLinks();
        }
    };

    /* --------------- Intro LucasArts-style (una vez por sesión) ------ */
    var intro = {
        SESSION_KEY: 'scummIntroShown',

        shouldShow: function () {
            try {
                return !global.sessionStorage ||
                    !sessionStorage.getItem(intro.SESSION_KEY);
            } catch (e) { return true; }
        },

        markShown: function () {
            try { sessionStorage.setItem(intro.SESSION_KEY, '1'); }
            catch (e) {}
        },

        // SVG inline: figura con linterna (silueta pixel, estilo LucasArts)
        figureSVG: function () {
            // 32x48 píxeles, escalado por CSS. Silueta oscura con un halo cálido
            // en el "foco" de la linterna para remitir al logo original.
            return '' +
                '<svg class="intro-figure" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
                    '<defs>' +
                        '<radialGradient id="scummIntroLamp" cx="50%" cy="50%" r="50%">' +
                            '<stop offset="0%"  stop-color="#fff2bf" stop-opacity="0.95"/>' +
                            '<stop offset="60%" stop-color="#ffd070" stop-opacity="0.5"/>' +
                            '<stop offset="100%" stop-color="#ffb040" stop-opacity="0"/>' +
                        '</radialGradient>' +
                    '</defs>' +
                    // Halo cálido de la linterna
                    '<circle cx="24" cy="22" r="11" fill="url(#scummIntroLamp)"/>' +
                    // Silueta del personaje (pixel blocks, negro sólido)
                    '<g fill="#0a0a0a">' +
                        // cabeza
                        '<rect x="10" y="4"  width="6"  height="6"/>' +
                        // cuerpo + capa
                        '<rect x="8"  y="10" width="10" height="4"/>' +
                        '<rect x="6"  y="14" width="14" height="10"/>' +
                        // brazo izquierdo (hacia arriba, sosteniendo la linterna)
                        '<rect x="18" y="14" width="4"  height="2"/>' +
                        '<rect x="20" y="16" width="4"  height="2"/>' +
                        '<rect x="22" y="18" width="3"  height="4"/>' +
                        // linterna (base y marco)
                        '<rect x="21" y="20" width="6"  height="4"/>' +
                        // piernas
                        '<rect x="8"  y="24" width="4"  height="10"/>' +
                        '<rect x="14" y="24" width="4"  height="10"/>' +
                        // pies
                        '<rect x="6"  y="34" width="6"  height="3"/>' +
                        '<rect x="14" y="34" width="6"  height="3"/>' +
                    '</g>' +
                    // Llama de la linterna (detalle)
                    '<rect x="23" y="19" width="2" height="2" fill="#fff2bf"/>' +
                    '<rect x="24" y="21" width="1" height="1" fill="#ffd070"/>' +
                '</svg>';
        },

        build: function () {
            if (document.getElementById('scummIntro')) return null;
            var root = el('div', { id: 'scummIntro', 'aria-hidden': 'true' });
            var stage = el('div', { class: 'intro-stage' });
            stage.appendChild(el('div', { class: 'intro-planet', 'aria-hidden': 'true' }));
            // figura SVG (como nodo)
            var wrap = document.createElement('div');
            wrap.innerHTML = intro.figureSVG();
            var svgNode = wrap.firstChild;
            if (svgNode) stage.appendChild(svgNode);
            stage.appendChild(el('h1', { class: 'intro-wordmark' }, 'eXeLearning'));
            stage.appendChild(el('p', { class: 'intro-subtitle' },
                t('scumm_intro_company', 'eXeLearning Entertainment Company')));
            root.appendChild(stage);
            root.appendChild(el('p', { class: 'intro-skip' },
                t('scumm_intro_skip', 'Haz clic para saltar')));
            return root;
        },

        show: function () {
            if (!intro.shouldShow()) return;
            var root = intro.build();
            if (!root) return;
            document.body.classList.add('scumm-intro-on');
            document.body.appendChild(root);

            var reduce = prefersReducedMotion();
            var fadeInMs  = reduce ? 0   : 300;
            var holdMs    = reduce ? 500 : 2000;
            var fadeOutMs = reduce ? 0   : 500;

            var dismissed = false;
            var dismiss = function () {
                if (dismissed) return;
                dismissed = true;
                intro.markShown();
                if (reduce) {
                    cleanup();
                } else {
                    root.classList.add('is-leaving');
                    var done = false;
                    var finish = function () {
                        if (done) return;
                        done = true;
                        cleanup();
                    };
                    root.addEventListener('transitionend', finish, { once: true });
                    setTimeout(finish, fadeOutMs + 200);
                }
            };
            var cleanup = function () {
                if (root.parentNode) root.parentNode.removeChild(root);
                document.body.classList.remove('scumm-intro-on');
            };

            // Fade in
            if (reduce) {
                root.classList.add('is-visible');
                root.style.opacity = '1';
                setTimeout(dismiss, holdMs);
            } else {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        root.classList.add('is-visible');
                        setTimeout(dismiss, fadeInMs + holdMs);
                    });
                });
            }

            // Click-to-skip
            root.addEventListener('click', dismiss);
            // ESC también salta
            var onKey = function (e) {
                if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                    dismiss();
                    document.removeEventListener('keydown', onKey);
                }
            };
            document.addEventListener('keydown', onKey);
        }
    };

    /* --------------- Inicialización --------------- */
    function init() {
        if (inIframe()) document.body.classList.add('in-iframe');

        // Reaplica el estado tweaks ahora que <body> existe seguro
        applyTweaksToBody(tweaks.state);

        injectDarkModeToggler();
        darkMode.init();
        wireNavToggler();
        wireSearchToggler();
        wireBoxToggles();
        mountPanel();
        wireHotspots();

        tweaks.init();
        // Fade solo fuera de iframes (dentro de un LMS el fade molesta)
        if (!inIframe()) fade.init();
        // Intro solo fuera de iframes y respetando la sesión
        if (!inIframe()) intro.show();
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
