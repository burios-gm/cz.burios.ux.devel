/*!
 * qpx - core
 * Vlastní JS UI framework nad jQuery.
 * Modul obsahuje: jmenný prostor qpx, Java-like Class systém s dědičností,
 * pomocné utility a jednoduchý events mixin (pub/sub).
 */
(function (root, $) {
    "use strict";

    if (!$) {
        throw new Error("qpx vyžaduje jQuery načtené před sebou.");
    }

    var qpx = root.qpx = root.qpx || {};
    qpx.version = "0.1.0";
    qpx.$ = $;

    // =================================================================
    // Class systém — inspirováno "Simple JavaScript Inheritance" (J. Resig),
    // rozšířeno o dědičnost statických členů a mixiny, aby se chovalo
    // podobně jako třídy v Javě (extends, super volání, statické metody).
    //
    //   var Animal = qpx.Class.extend({
    //       init: function(name){ this.name = name; },
    //       speak: function(){ return this.name + " vydává zvuk"; }
    //   });
    //
    //   var Dog = Animal.extend({
    //       speak: function(){ return this._super() + " (štěká)"; }
    //   });
    //
    //   new Dog("Rex").speak();
    // =================================================================
    var initializing = false;
    var fnTest = /xyz/.test(function () { /* eslint-disable */ if (0) { xyz; } /* eslint-enable */ })
        ? /\b_super\b/
        : /.*/;

    function Class() {}

    Class.extend = function (protoProps, staticProps) {
        var _super = this.prototype;

        initializing = true;
        var prototype = new this();
        initializing = false;

        for (var name in protoProps) {
            prototype[name] = (typeof protoProps[name] === "function" &&
                typeof _super[name] === "function" &&
                fnTest.test(protoProps[name]))
                ? (function (name, fn) {
                    return function () {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret;
                        try {
                            ret = fn.apply(this, arguments);
                        } finally {
                            this._super = tmp;
                        }
                        return ret;
                    };
                })(name, protoProps[name])
                : protoProps[name];
        }

        function QpxClass() {
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }

        QpxClass.prototype = prototype;
        QpxClass.prototype.constructor = QpxClass;

        // dědičnost statických členů (podobně jako statické atributy/metody v Javě)
        for (var key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key) && key !== "prototype") {
                QpxClass[key] = this[key];
            }
        }
        QpxClass.extend = Class.extend;
        QpxClass.mixin = Class.mixin;
        QpxClass.implement = Class.mixin;

        if (staticProps) {
            for (var sKey in staticProps) {
                QpxClass[sKey] = staticProps[sKey];
            }
        }

        return QpxClass;
    };

    // přimíchání dalších vlastností do prototypu (obdoba Java interface / traits)
    Class.mixin = function () {
        var mixins = Array.prototype.slice.call(arguments);
        for (var i = 0; i < mixins.length; i++) {
            var mixin = mixins[i];
            for (var name in mixin) {
                if (name !== "constructor") {
                    this.prototype[name] = mixin[name];
                }
            }
        }
        return this;
    };

    qpx.Class = Class;

    // =================================================================
    // Utility
    // =================================================================
    qpx.extend = function (target) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0; i < args.length; i++) {
            var src = args[i];
            if (!src) { continue; }
            for (var k in src) { target[k] = src[k]; }
        }
        return target;
    };

    qpx.isString = function (v) { return typeof v === "string"; };
    qpx.isFunction = function (v) { return typeof v === "function"; };
    qpx.isObject = function (v) { return v !== null && typeof v === "object" && !Array.isArray(v); };

    qpx.uid = (function () {
        var counter = 0;
        return function (prefix) {
            counter += 1;
            return (prefix || "qpx") + counter;
        };
    })();

    qpx.toPx = function (v) {
        return (typeof v === "number") ? v + "px" : v;
    };

    // čtení hodnoty z objektu podle cesty "a.b.c"
    qpx.resolve = function (obj, path) {
        if (obj == null || !path) { return undefined; }
        var parts = String(path).split(".");
        var cur = obj;
        for (var i = 0; i < parts.length; i++) {
            if (cur == null) { return undefined; }
            cur = cur[parts[i]];
        }
        return cur;
    };

    // =================================================================
    // Jednoduchý pub/sub mixin — lze přimíchat do libovolné qpx.Class
    // =================================================================
    qpx.EventsMixin = {
        on: function (event, handler) {
            this._handlers = this._handlers || {};
            (this._handlers[event] = this._handlers[event] || []).push(handler);
            return this;
        },
        off: function (event, handler) {
            if (!this._handlers || !this._handlers[event]) { return this; }
            if (!handler) {
                this._handlers[event] = [];
                return this;
            }
            this._handlers[event] = this._handlers[event].filter(function (h) {
                return h !== handler;
            });
            return this;
        },
        trigger: function (event) {
            var args = Array.prototype.slice.call(arguments, 1);
            if (this._handlers && this._handlers[event]) {
                this._handlers[event].slice().forEach(function (h) {
                    h.apply(this, args);
                }, this);
            }
            // zrcadlení jako jQuery event na kontejneru, aby šlo napojit i $(el).on(...)
            if (this.$container) {
                this.$container.trigger("qpx:" + event, args);
            }
            return this;
        }
    };

})(window, window.jQuery);

/*!
 * qpx - widget
 * Základní bázová třída pro všechny UI komponenty + registr a tovární
 * metoda qpx.ui(config, container), přes kterou se skládají komponenty
 * do JSON stromu (podobně jako ve webixu).
 *
 * Novinky v této verzi:
 *  - každý widget dostane na svůj container HTML atribut "id" (buď z
 *    options.id, nebo automaticky vygenerovaný) - POKUD ho container
 *    ještě nemá. Umožňuje pak najít instanci klasicky přes jQuery:
 *
 *       var sw = $("#mySwitch").data("qpSwitch");
 *
 *  - kdykoliv volané qpx.registerWidget(name, Class) navíc automaticky
 *    zaregistruje i jQuery plugin stejného jména (chování podobné Kendo UI):
 *
 *       var sw = $("#mySwitch").qpSwitch();               // getter - vrátí instanci
 *       $("#mySwitch").qpSwitch({ value: true });          // vytvoří (pokud neexistuje) / přenastaví options
 *       $("#mySwitch").qpSwitch("value", true);             // zavolá metodu instance: sw.value(true)
 *
 *  - báze qpx.Widget nově obsahuje obecnou metodu option(), kterou
 *    potomci dědí, pokud si ji sami nepřepíší vlastní implementací:
 *
 *       sw.option()                       // -> celý config (object)
 *       sw.option("height")               // -> hodnota jedné vlastnosti
 *       sw.option("height", 100)          // -> nastavení jedné vlastnosti
 *       sw.option({ height: 100, width: 100 }) // -> nastavení více vlastností najednou
 */
(function (qpx, $) {
    "use strict";

    var registry = {};

    var Widget = qpx.Class.extend({

        // výchozí konfigurace, potomci ji přes _super/extend rozšiřují
        defaults: {},

        // config  - konfigurační objekt komponenty
        // container - (volitelně) DOM element / jQuery výběr, do kterého se komponenta vykreslí.
        //             Pokud není zadán, vytvoří se plovoucí <div>, který je možné později připojit.
        init: function (config, container) {
            this.config = $.extend(true, {}, this.defaults, config || {});

            // interní id widgetu - buď převzaté z options.id, nebo vygenerované;
            // zpětně se promítne i do configu, ať option("id") vrací vždy platnou hodnotu
            this.id = this.config.id || qpx.uid("qpx");
            this.config.id = this.id;

            this._children = [];
            this._handlers = {};

            var node = container && (container.jquery ? container[0] : container);
            this.$container = node ? $(node) : $("<div></div>");

            this.$container
                .addClass("qpx-view")
                .attr("data-qpx-id", this.id)
                .data("qpx-widget", this);

            // HTML atribut "id" přiřadíme containeru JEN pokud ho ještě nemá -
            // pokud si element přinesl vlastní id (z HTML/JSP), respektujeme ho
            // a neprepisujeme.
            if (!this.$container.attr("id")) {
                this.$container.attr("id", this.id);
            }

            // uloží instanci i pod jménem "view", pod kterým byl widget
            // zaregistrován (qpx.registerWidget) - viz $(...).data("qpSwitch")
            if (this.constructor.viewName) {
                this.$container.data(this.constructor.viewName, this);
            }

            if (this.config.css) { this.$container.addClass(this.config.css); }
            if (this.config.width !== undefined) { this.$container.css("width", qpx.toPx(this.config.width)); }
            if (this.config.height !== undefined) { this.$container.css("height", qpx.toPx(this.config.height)); }
            if (this.config.hidden) { this.$container.hide(); }

            this.render();

            if (this.config.on) {
                for (var ev in this.config.on) {
                    this.on(ev, this.config.on[ev]);
                }
            }

            this.trigger("ready");
        },

        // potomci přepisují — zde probíhá samotné vykreslení do this.$container
        render: function () {},

        // znovu-vykreslení (výchozí implementace jen zavolá render, konkrétní
        // komponenty typicky přepíší efektivnější variantou)
        refresh: function () {
            this.$container.empty();
            this.render();
            return this;
        },

        show: function () { this.$container.show(); this.trigger("show"); return this; },
        hide: function () { this.$container.hide(); this.trigger("hide"); return this; },

        // ---------------------------------------------------------------
        // Obecná implementace option() - potomci ji dědí, pokud si ji sami
        // nepřepíší vlastní specializovanou verzí (v qpx Class systému
        // úplné přepsání metody v potomkovi nahrazuje tuto bázovou verzi
        // celou; volání this._super(name, value) z potomka je ale možné,
        // pokud chce zachovat i toto obecné chování).
        //
        //   option()                    -> vrátí celý config (object)
        //   option("jmeno")             -> vrátí hodnotu jedné vlastnosti
        //   option("jmeno", hodnota)    -> nastaví jednu vlastnost
        //   option({ a: 1, b: 2 })      -> nastaví víc vlastností najednou
        // ---------------------------------------------------------------
        option: function (name, value) {
            if (arguments.length === 0) { return this.config; }

            if (qpx.isObject(name)) {
                var self = this;
                $.each(name, function (k, v) { self.option(k, v); });
                return this;
            }

            if (arguments.length === 1) { return this.config[name]; }

            var prev = this.config[name];
            if (prev === value) { return this; }
            this.config[name] = value;

            // obecné, widgetům společné vlastnosti - konkrétní potomci
            // typicky doplňují vlastní specializovanou logiku
            switch (name) {
                case "width":
                    this.$container.css("width", qpx.toPx(value));
                    break;
                case "height":
                    this.$container.css("height", qpx.toPx(value));
                    break;
                case "visible":
                    this.$container.toggle(!!value);
                    break;
                case "hidden":
                    this.$container.toggle(!value);
                    break;
                case "css":
                    if (prev) { this.$container.removeClass(prev); }
                    if (value) { this.$container.addClass(value); }
                    break;
                case "disabled":
                    this.$container.toggleClass("qpx-state-disabled", !!value);
                    break;
            }

            this.trigger("optionChanged", { name: name, value: value, previousValue: prev, component: this });
            return this;
        },

        destroy: function () {
            this.trigger("destroy");
            this._children.forEach(function (child) {
                if (child && child.destroy) { child.destroy(); }
            });
            this._children = [];
            if (this.$container) {
                // POZOR: musí se smazat OBĚ jQuery .data() klíče, které si
                // instance na containeru uložila (viz init()) - jinak by
                // po destroy() ještě $(el).data("qpTagBox") vracelo starou,
                // už zničenou instanci, zatímco $(el).data("qpx-widget")
                // by už správně bylo undefined (nekonzistentní, nebezpečné).
                this.$container.removeData("qpx-widget");
                if (this.constructor.viewName) {
                    this.$container.removeData(this.constructor.viewName);
                }
                this.$container.empty();
            }
        },

        getContainer: function () { return this.$container; },
        getNode: function () { return this.$container[0]; },

        addChild: function (widget) {
            this._children.push(widget);
            return widget;
        },

        getChildren: function () { return this._children.slice(); }
    });

    Widget.mixin(qpx.EventsMixin);

    qpx.Widget = Widget;

    // =================================================================
    // Registr komponent + tovární metoda
    // =================================================================

    // registrace nové komponenty pod jménem použitým v "view"
    qpx.registerWidget = function (name, WidgetClass) {
        registry[name] = WidgetClass;

        // jméno view si uložíme i jako statický člen třídy - použije se
        // v qpx.Widget.init pro $container.data(viewName, instance)
        WidgetClass.viewName = name;

        // automatická registrace jQuery pluginu stejného jména, ve stylu
        // Kendo UI: $(...).qpSwitch() / $(...).qpSwitch({...}) / $(...).qpSwitch("metoda", ...)
        if ($ && $.fn && !$.fn[name]) {
            $.fn[name] = function () {
                var args = Array.prototype.slice.call(arguments);
                return qpx.jqueryPlugin(name, this, args);
            };
        }

        return qpx;
    };

    qpx.getWidgetClass = function (name) {
        return registry[name];
    };

    // -----------------------------------------------------------------
    // Společná implementace jQuery pluginů generovaných v registerWidget().
    //
    //   $(sel).qpXxx()                 -> getter: vrátí instanci NA PRVNÍM
    //                                     prvku výběru (undefined, pokud tam žádná není)
    //   $(sel).qpXxx("instance")        -> totéž jako getter, ale ve stylu
    //                                     DevExtreme ($(...).dxTagBox("instance"));
    //                                     "instance" je vyhrazené klíčové slovo,
    //                                     NIKDY se nepředává jako název metody
    //                                     dál instanci (i kdyby nějaký widget
    //                                     metodu "instance" náhodou definoval)
    //   $(sel).qpXxx("metoda", ...)     -> zavolá metodu "metoda" na existující
    //                                     instanci (např. .qpSwitch("value", true))
    //   $(sel).qpXxx({ ...options })    -> na KAŽDÉM prvku výběru: pokud
    //                                     instance ještě neexistuje, vytvoří ji
    //                                     (qpx.ui), pokud existuje, zavolá na ní
    //                                     option(options); vrací zpět jQuery výběr
    //                                     (standardní chaining)
    // -----------------------------------------------------------------
    qpx.jqueryPlugin = function (viewName, $elements, args) {
        args = args || [];
        var firstArg = args[0];

        // a) bez argumentů -> getter (vrátí instanci prvního prvku výběru)
        if (args.length === 0) {
            return $elements.data(viewName);
        }

        var existingFirst = $elements.data(viewName);

        // b) DevExtreme styl: $(...).qpTagBox("instance") -> vždy jen vrátí
        // instanci, "instance" se NIKDY nepokouší volat jako metodu
        if (firstArg === "instance") {
            return existingFirst;
        }

        // c) první argument je řetězec a instance už existuje -> volání metody
        if (qpx.isString(firstArg) && existingFirst) {
            var method = firstArg;
            var methodArgs = args.slice(1);
            if (qpx.isFunction(existingFirst[method])) {
                return existingFirst[method].apply(existingFirst, methodArgs);
            }
            return existingFirst;
        }

        // d) inicializace / hromadné přenastavení na všech prvcích výběru
        $elements.each(function () {
            var $el = $(this);
            var existing = $el.data(viewName);
            if (existing) {
                if (qpx.isObject(firstArg)) { existing.option(firstArg); }
            } else {
                qpx.ui($.extend({ view: viewName }, qpx.isObject(firstArg) ? firstArg : {}), $el);
            }
        });
        return $elements;
    };

    // -----------------------------------------------------------------
    // Univerzální získání instance BEZ znalosti konkrétního typu widgetu
    // (obdoba .data("qpx-widget"), jen jako pohodlnější/čitelnější volání) -
    // hodí se typicky v obecném/sdíleném kódu, který pracuje s libovolným
    // qpx widgetem (např. testovací nástroje, delegované event handlery):
    //
    //   var w = qpx.getInstance("#mySwitch");
    //   var w = qpx.getInstance(document.getElementById("mySwitch"));
    // -----------------------------------------------------------------
    qpx.getInstance = function (el) {
        return $(el).data("qpx-widget");
    };

    // hlavní tovární metoda — sestavování z JSON konfigurace:
    //   qpx.ui({ view: "template", template: "Ahoj #name#" }, "#mistoVDom");
    qpx.ui = function (config, container) {
        if (qpx.isString(config)) {
            config = { view: config };
        }
        var view = config.view || (config.rows || config.cols ? "layout" : null);
        if (!view) {
            throw new Error("qpx: konfigurace komponenty musí obsahovat 'view' (nebo 'rows'/'cols').");
        }
        var WidgetClass = registry[view];
        if (!WidgetClass) {
            throw new Error("qpx: neregistrovaný typ komponenty '" + view + "'.");
        }

        // instance si během init() sama zaregistruje .data("qpx-widget", ...)
        // i .data(viewName, ...) na svém containeru (viz qpx.Widget.init)
        return new WidgetClass(config, container);
    };

})(window.qpx, jQuery);

/*!
 * qpx - layout
 * Responzivní layout komponenta umožňující libovolně vnořovat "rows" a "cols",
 * podobně jako ve webixu. Interně staví na flexboxu.
 */
(function (qpx, $) {
    "use strict";

    var Layout = qpx.Widget.extend({

        defaults: {
            type: "clean",     // clean | space (mezery mezi buňkami) | line (oddělovací čáry)
            responsive: false, // na úzké obrazovce přepne "cols" na "rows"
            gap: null
        },

        render: function () {
            var cfg = this.config;
            this.$container.addClass("qpx-layout");

            if (cfg.type === "space") { this.$container.addClass("qpx-layout-space"); }
            if (cfg.type === "line") { this.$container.addClass("qpx-layout-line"); }
            if (cfg.gap !== null && cfg.gap !== undefined) { this.$container.css("gap", qpx.toPx(cfg.gap)); }

            if (cfg.rows) {
                this.$container.addClass("qpx-rows");
                this._renderStack(cfg.rows, "row");
            } else if (cfg.cols) {
                this.$container.addClass("qpx-cols");
                if (cfg.responsive) { this.$container.addClass("qpx-responsive"); }
                this._renderStack(cfg.cols, "col");
            }
            // layout bez rows/cols slouží jako prostý kontejner (leaf cell)
        },

        _renderStack: function (items, direction) {
            var self = this;
            items.forEach(function (itemCfg) {
                if (itemCfg === undefined || itemCfg === null) { return; }

                var isSpacer = qpx.isObject(itemCfg) &&
                    !itemCfg.view && !itemCfg.rows && !itemCfg.cols;

                var $cell = $("<div class='qpx-cell qpx-" + direction + "'></div>");
                self._applySizing($cell, itemCfg);
                self.$container.append($cell);

                if (isSpacer) {
                    $cell.addClass("qpx-spacer");
                    return; // prázdná buňka = flexibilní mezera
                }

                var child = qpx.ui(itemCfg, $cell);
                self.addChild(child);
            });
        },

        _applySizing: function ($cell, itemCfg) {
            if (!itemCfg || !qpx.isObject(itemCfg)) { return; }
            if (itemCfg.width !== undefined) {
                $cell.css({ "flex": "0 0 auto", "width": qpx.toPx(itemCfg.width) });
            }
            if (itemCfg.height !== undefined) {
                $cell.css({ "flex": "0 0 auto", "height": qpx.toPx(itemCfg.height) });
            }
            if (itemCfg.gravity !== undefined) {
                $cell.css("flex-grow", itemCfg.gravity);
            }
            if (itemCfg.hidden) { $cell.hide(); }
        }
    });

    qpx.registerWidget("layout", Layout);
    qpx.Layout = Layout;

})(window.qpx, jQuery);

/*!
 * qpx - template
 * První konkrétní UI komponenta frameworku. Chová se obdobně jako
 * "template" ve webixu: vykresluje HTML podle šablony (string, nebo
 * funkce) a dat, která lze kdykoliv změnit přes setValues()/parse().
 *
 * Podpora zápisu proměnných v šabloně: "#jmeno#" i "{jmeno}", včetně
 * vnořených cest "{user.name}".
 */
(function (qpx, $) {
    "use strict";

    var VAR_RE = /#([\w.]+)#|\{([\w.]+)\}/g;

    var Template = qpx.Widget.extend({

        defaults: {
            template: "",   // string šablona, nebo function(data, common){ return html; }
            data: null,     // počáteční data
            autoheight: false,
            borderless: false
        },

        render: function () {
            var cfg = this.config;
            this.$container.addClass("qpx-template");
            if (cfg.autoheight) { this.$container.addClass("qpx-template-autoheight"); }
            if (cfg.borderless) { this.$container.addClass("qpx-borderless"); }

            this._templateFn = this._compile(cfg.template);
            this.data = cfg.data || null;

            this._draw();
        },

        // umožňuje za běhu měnit šablonu i další nastavení, podobně jako
        // webix .define()
        define: function (prop, value) {
            if (qpx.isObject(prop)) {
                $.extend(this.config, prop);
                if (prop.template !== undefined) { this._templateFn = this._compile(prop.template); }
            } else {
                this.config[prop] = value;
                if (prop === "template") { this._templateFn = this._compile(value); }
            }
            this._draw();
            return this;
        },

        // nastaví novou šablonu (zkratka za define("template", tpl))
        setTemplate: function (tpl) {
            return this.define("template", tpl);
        },

        // naplní komponentu daty a překreslí ji — hlavní API pro práci s daty
        setValues: function (data, silent) {
            this.data = data;
            this._draw();
            if (!silent) { this.trigger("change", data); }
            return this;
        },

        getValues: function () {
            return this.data;
        },

        // alias, stejně jako webix .parse()
        parse: function (data) {
            return this.setValues(data);
        },

        // přímé vložení hotového HTML bez průchodu šablonou
        setHTML: function (html) {
            this.$container.html(html);
            this.trigger("afterrender");
            return this;
        },

        refresh: function () {
            this._draw();
            return this;
        },

        _draw: function () {
            var html = this._templateFn ? this._templateFn(this.data || {}, qpx) : "";
            this.$container.html(html);
            this.trigger("afterrender");
        },

        _compile: function (tpl) {
            if (qpx.isFunction(tpl)) { return tpl; }
            var str = (tpl === null || tpl === undefined) ? "" : String(tpl);
            return function (data) {
                data = data || {};
                return str.replace(VAR_RE, function (match, a, b) {
                    var path = a || b;
                    var val = qpx.resolve(data, path);
                    return (val === undefined || val === null) ? "" : val;
                });
            };
        }
    });

    qpx.registerWidget("template", Template);
    qpx.Template = Template;

})(window.qpx, jQuery);

/*!
 * qpx - qpButton
 * Tlačítko se stejnou koncepcí jako DevExtreme dxButton:
 *  - options: text, icon, type, stylingMode, disabled, visible, hint, template
 *  - metody: option(), enable(), disable(), focus()
 *  - události: onClick, onOptionChanged
 *
 * Pozn.: widget byl přejmenován z "button"/qpx.Button na "qpButton"/qpx.qpButton,
 * aby jméno odpovídalo sjednocené konvenci "qp" prefixu ostatních qpx widgetů
 * (qpCheckBox, qpTextBox, qpSwitch, ...). Kdekoliv ve vaší aplikaci nebo
 * v konfiguraci qpToolBar (options.widget) byl použit název "button",
 * je potřeba ho nahradit za "qpButton".
 */
(function (qpx, $) {
    "use strict";

    var Button = qpx.Widget.extend({

        defaults: {
            text: "",
            icon: "",              // krátký text/emoji glyph, nebo "css:trida-ikony"
            type: "normal",        // normal | default | success | danger | warning
            stylingMode: "contained", // contained | outlined | text
            disabled: false,
            visible: true,
            hint: "",
            template: null,        // function(data, $el) pro vlastní vykreslení obsahu
            onClick: null,
            onOptionChanged: null
        },

        render: function () {
            var cfg = this.config;
            this.$container
                .addClass("qpx-button")
                .attr("tabindex", cfg.disabled ? "-1" : "0")
                .attr("role", "button");

            if (cfg.onClick) { this.on("click", cfg.onClick); }
            if (cfg.onOptionChanged) { this.on("optionChanged", cfg.onOptionChanged); }

            this._renderContent();
            this._applyState();

            var self = this;
            this.$container.on("click.qpxButton", function (e) {
                if (self.config.disabled) { return; }
                self.trigger("click", { event: e, component: self, element: self.getNode() });
            });
            this.$container.on("keydown.qpxButton", function (e) {
                if (self.config.disabled) { return; }
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    self.$container.trigger("click");
                }
            });
        },

        _renderContent: function () {
            var cfg = this.config;
            this.$container.empty();

            if (qpx.isFunction(cfg.template)) {
                cfg.template(cfg, this.$container);
                return;
            }

            if (cfg.icon) {
                var $icon = $("<span class='qpx-icon'></span>");
                if (String(cfg.icon).indexOf("css:") === 0) {
                    $icon.addClass(String(cfg.icon).slice(4));
                } else {
                    $icon.text(cfg.icon);
                }
                this.$container.append($icon);
            }
            if (cfg.text) {
                this.$container.append($("<span class='qpx-button-text'></span>").text(cfg.text));
            }
            if (cfg.hint) { this.$container.attr("title", cfg.hint); }
        },

        _applyState: function () {
            var cfg = this.config;
            this.$container
                .removeClass("qpx-button-normal qpx-button-default qpx-button-success qpx-button-danger qpx-button-warning")
                .addClass("qpx-button-" + cfg.type)
                .removeClass("qpx-button-mode-contained qpx-button-mode-outlined qpx-button-mode-text")
                .addClass("qpx-button-mode-" + cfg.stylingMode)
                .toggleClass("qpx-state-disabled", !!cfg.disabled)
                .toggleClass("qpx-hidden", !cfg.visible)
                .attr("aria-disabled", !!cfg.disabled)
                .attr("tabindex", cfg.disabled ? "-1" : "0");
        },

        // option("text") -> čtení; option("text","Nový text") -> zápis; option({text:.., icon:..}) -> hromadně
        option: function (name, value) {
            if (arguments.length === 0) { return this.config; }
            if (qpx.isObject(name)) {
                var self = this;
                $.each(name, function (k, v) { self.option(k, v); });
                return this;
            }
            if (arguments.length === 1) { return this.config[name]; }

            var prev = this.config[name];
            if (prev === value) { return this; }
            this.config[name] = value;
            this._renderContent();
            this._applyState();
            this.trigger("optionChanged", { name: name, value: value, previousValue: prev, element: this.getNode() });
            return this;
        },

        enable: function () { return this.option("disabled", false); },
        disable: function () { return this.option("disabled", true); },
        focus: function () { this.$container.trigger("focus"); return this; },

        destroy: function () {
            this.$container.off(".qpxButton");
            this._super();
        }
    });

    qpx.registerWidget("qpButton", Button);
    qpx.qpButton = Button;

})(window.qpx, jQuery);

/*!
 * qpx - qpButtonGroup
 * Skupina vizuálně spojených tlačítek, koncepčně jako DevExtreme dxButtonGroup.
 *  - options: items, keyExpr, selectionMode, selectedItemKeys, stylingMode
 *  - události: onItemClick, onSelectionChanged, onOptionChanged
 *
 * Pozn.: widget byl přejmenován z "buttonGroup"/qpx.ButtonGroup na
 * "qpButtonGroup"/qpx.qpButtonGroup (sjednocení "qp" prefixu). Kdekoliv
 * byl použit název "buttonGroup" (např. v options.widget u qpToolBar
 * položek), nahraďte ho za "qpButtonGroup".
 */
(function (qpx, $) {
    "use strict";

    var ButtonGroup = qpx.Widget.extend({

        defaults: {
            items: [],               // [{ text, icon, disabled, key, hint }]
            keyExpr: "key",
            selectionMode: "single", // single | multiple | none
            selectedItemKeys: [],
            stylingMode: "outlined", // contained | outlined | text
            disabled: false,
            visible: true,
            onItemClick: null,
            onSelectionChanged: null,
            onOptionChanged: null
        },

        render: function () {
            var cfg = this.config;
            this.$container
                .addClass("qpx-buttongroup")
                .toggleClass("qpx-hidden", !cfg.visible);

            if (cfg.onItemClick) { this.on("itemClick", cfg.onItemClick); }
            if (cfg.onSelectionChanged) { this.on("selectionChanged", cfg.onSelectionChanged); }
            if (cfg.onOptionChanged) { this.on("optionChanged", cfg.onOptionChanged); }

            this.selectedItemKeys = (cfg.selectedItemKeys || []).slice();
            this._renderItems();
        },

        _keyOf: function (item, index) {
            return item[this.config.keyExpr] !== undefined ? item[this.config.keyExpr] : index;
        },

        _renderItems: function () {
            var self = this;
            var cfg = this.config;
            this.$container.empty();

            cfg.items.forEach(function (item, index) {
                var key = self._keyOf(item, index);
                var selected = self.selectedItemKeys.indexOf(key) !== -1;

                var $btn = $("<div class='qpx-buttongroup-item qpx-button qpx-button-mode-" + cfg.stylingMode + "'></div>")
                    .toggleClass("qpx-state-selected", selected)
                    .toggleClass("qpx-state-disabled", !!item.disabled || !!cfg.disabled)
                    .attr("tabindex", (item.disabled || cfg.disabled) ? "-1" : "0")
                    .attr("role", "button");

                if (item.icon) {
                    var $icon = $("<span class='qpx-icon'></span>");
                    (String(item.icon).indexOf("css:") === 0)
                        ? $icon.addClass(String(item.icon).slice(4))
                        : $icon.text(item.icon);
                    $btn.append($icon);
                }
                if (item.text) {
                    $btn.append($("<span class='qpx-button-text'></span>").text(item.text));
                }
                if (item.hint) { $btn.attr("title", item.hint); }

                $btn.on("click", function (e) {
                    if (item.disabled || self.config.disabled) { return; }
                    self._handleSelection(key);
                    self.trigger("itemClick", { event: e, itemData: item, itemIndex: index, itemElement: $btn[0], component: self });
                });

                self.$container.append($btn);
            });
        },

        _handleSelection: function (key) {
            var mode = this.config.selectionMode;
            if (mode === "none") { return; }

            var prev = this.selectedItemKeys.slice();
            if (mode === "single") {
                this.selectedItemKeys = [key];
            } else { // multiple
                var idx = this.selectedItemKeys.indexOf(key);
                if (idx === -1) { this.selectedItemKeys.push(key); }
                else { this.selectedItemKeys.splice(idx, 1); }
            }
            this.config.selectedItemKeys = this.selectedItemKeys;
            this._renderItems();
            this.trigger("selectionChanged", {
                addedItemKeys: this.selectedItemKeys.filter(function (k) { return prev.indexOf(k) === -1; }),
                removedItemKeys: prev.filter(function (k) { return this.selectedItemKeys.indexOf(k) === -1; }.bind(this)),
                component: this
            });
        },

        option: function (name, value) {
            if (arguments.length === 0) { return this.config; }
            if (qpx.isObject(name)) {
                var self = this;
                $.each(name, function (k, v) { self.option(k, v); });
                return this;
            }
            if (arguments.length === 1) { return this.config[name]; }

            var prev = this.config[name];
            if (prev === value) { return this; }
            this.config[name] = value;
            if (name === "selectedItemKeys") { this.selectedItemKeys = (value || []).slice(); }
            this._renderItems();
            this.trigger("optionChanged", { name: name, value: value, previousValue: prev });
            return this;
        },

        getSelectedItemKeys: function () { return this.selectedItemKeys.slice(); },
        enable: function () { return this.option("disabled", false); },
        disable: function () { return this.option("disabled", true); }
    });

    qpx.registerWidget("qpButtonGroup", ButtonGroup);
    qpx.qpButtonGroup = ButtonGroup;

})(window.qpx, jQuery);

/*!
 * qpx - qpTextBox
 * Jednořádkové textové pole, koncepčně i vzhledově co nejblíže
 * DevExtreme dxTextBox.
 *
 * options:
 *   value, placeholder, mode ("text"|"password"|"search"|"tel"|"url"|"email"),
 *   maxLength, showClearButton, stylingMode ("outlined"|"filled"|"underlined"),
 *   spellcheck, valueChangeEvent ("change"|"keyup"|"input"),
 *   disabled, readOnly, visible
 *
 * events:
 *   onInitialized, onContentReady, onValueChanged, onOptionChanged,
 *   onFocusIn, onFocusOut, onEnterKey, onKeyDown, onKeyUp, onDisposing
 *
 * methods:
 *   option(name[, value]), value([val]), focus(), blur(), select(),
 *   reset(), enable(), disable(), destroy()
 */
(function (qpx, $) {
    "use strict";

    var TextBox = qpx.Widget.extend({

        defaults: {
            value: "",
            placeholder: "",
            mode: "text",          // text | password | search | tel | url | email

            maxLength: null,
            showClearButton: false,
            stylingMode: "outlined",  // outlined | filled | underlined
            spellcheck: false,
            valueChangeEvent: "change", // change | keyup | input

            disabled: false,
            readOnly: false,
            visible: true,

            onValueChanged: null,
            onOptionChanged: null,
            onInitialized: null,
            onContentReady: null,
            onFocusIn: null,
            onFocusOut: null,
            onEnterKey: null,
            onKeyDown: null,
            onKeyUp: null,
            onDisposing: null
        },

        // ---------------------------------------------------------------
        render: function () {
            var cfg = this.config;
            var self = this;

            this.$container
                .addClass("qpx-textbox")
                .addClass("qpx-textbox-mode-" + cfg.stylingMode)
                .toggleClass("qpx-hidden", !cfg.visible)
                .toggleClass("qpx-state-disabled", !!cfg.disabled)
                .toggleClass("qpx-state-readonly", !!cfg.readOnly);

            if (cfg.onInitialized) { this.on("ready", cfg.onInitialized); }
            if (cfg.onContentReady) { this.on("contentReady", cfg.onContentReady); }
            if (cfg.onValueChanged) { this.on("valueChanged", cfg.onValueChanged); }
            if (cfg.onOptionChanged) { this.on("optionChanged", cfg.onOptionChanged); }
            if (cfg.onFocusIn) { this.on("focusIn", cfg.onFocusIn); }
            if (cfg.onFocusOut) { this.on("focusOut", cfg.onFocusOut); }
            if (cfg.onEnterKey) { this.on("enterKey", cfg.onEnterKey); }
            if (cfg.onKeyDown) { this.on("keyDown", cfg.onKeyDown); }
            if (cfg.onKeyUp) { this.on("keyUp", cfg.onKeyUp); }
            if (cfg.onDisposing) { this.on("destroy", cfg.onDisposing); }

            this._buildDom();
            this._bindEvents();

            setTimeout(function () { self.trigger("contentReady", { component: self }); }, 0);
        },

        // ---------------------------------------------------------------
        // DOM
        // ---------------------------------------------------------------
        _buildDom: function () {
            var cfg = this.config;
            this.$container.empty();

            this.$input = $("<input class='qpx-textbox-input' autocomplete='off'>")
                .attr("type", this._htmlType())
                .attr("placeholder", cfg.placeholder || "")
                .attr("spellcheck", !!cfg.spellcheck)
                .prop("disabled", !!cfg.disabled)
                .prop("readOnly", !!cfg.readOnly)
                .val(cfg.value == null ? "" : cfg.value);

            if (cfg.maxLength) { this.$input.attr("maxlength", cfg.maxLength); }

            this.$clearBtn = $("<span class='qpx-textbox-clear' tabindex='-1' title='Vymazat'>✕</span>").hide();

            this.$container.append(this.$input, this.$clearBtn);
            this._renderClearButton();
        },

        _htmlType: function () {
            var map = { text: "text", password: "password", search: "search", tel: "tel", url: "url", email: "email" };
            return map[this.config.mode] || "text";
        },

        _bindEvents: function () {
            var self = this;
            var cfg = this.config;

            var commit = function () {
                var val = self.$input.val();
                if (val !== self.config.value) { self.option("value", val); }
            };

            this.$input.on("input.qpxTextBox", function () {
                self._renderClearButton();
                if (cfg.valueChangeEvent === "input") { commit(); }
            });

            this.$input.on("keyup.qpxTextBox", function (e) {
                if (cfg.valueChangeEvent === "keyup") { commit(); }
                self.trigger("keyUp", { event: e, component: self, element: self.getNode() });
            });

            this.$input.on("keydown.qpxTextBox", function (e) {
                self.trigger("keyDown", { event: e, component: self, element: self.getNode() });
                if (e.key === "Enter") {
                    commit();
                    self.trigger("enterKey", { event: e, component: self, element: self.getNode() });
                }
            });

            this.$input.on("change.qpxTextBox", function () {
                if (cfg.valueChangeEvent === "change") { commit(); }
            });

            this.$input.on("focus.qpxTextBox", function () {
                self.$container.addClass("qpx-state-focused");
                self.trigger("focusIn", { component: self, element: self.getNode() });
            });

            this.$input.on("blur.qpxTextBox", function () {
                self.$container.removeClass("qpx-state-focused");
                if (cfg.valueChangeEvent !== "input" && cfg.valueChangeEvent !== "keyup") { commit(); }
                self.trigger("focusOut", { component: self, element: self.getNode() });
            });

            this.$clearBtn.on("mousedown.qpxTextBox", function (e) { e.preventDefault(); });
            this.$clearBtn.on("click.qpxTextBox", function (e) {
                e.stopPropagation();
                if (cfg.disabled || cfg.readOnly) { return; }
                self.option("value", "");
                self.$input.trigger("focus");
            });
        },

        _renderClearButton: function () {
            var cfg = this.config;
            var val = this.$input ? this.$input.val() : cfg.value;
            this.$clearBtn.toggle(!!cfg.showClearButton && !!val && !cfg.disabled && !cfg.readOnly);
        },

        // ---------------------------------------------------------------
        // Veřejné API
        // ---------------------------------------------------------------
        value: function (val) {
            if (arguments.length === 0) { return this.config.value; }
            return this.option("value", val);
        },

        focus: function () { this.$input.trigger("focus"); return this; },
        blur: function () { this.$input.trigger("blur"); return this; },
        select: function () { this.$input.trigger("select"); return this; },
        reset: function () { return this.option("value", ""); },
        enable: function () { return this.option("disabled", false); },
        disable: function () { return this.option("disabled", true); },

        option: function (name, value) {
            if (arguments.length === 0) { return this.config; }
            if (qpx.isObject(name)) {
                var self = this;
                $.each(name, function (k, v) { self.option(k, v); });
                return this;
            }
            if (arguments.length === 1) { return this.config[name]; }

            var prev = this.config[name];
            if (prev === value) { return this; }
            this.config[name] = value;

            switch (name) {
                case "value": {
                    var strVal = value == null ? "" : String(value);
                    if (this.$input.val() !== strVal) { this.$input.val(strVal); }
                    this._renderClearButton();
                    this.trigger("valueChanged", { value: value, previousValue: prev, component: this, element: this.getNode() });
                    break;
                }

                case "disabled":
                    this.$container.toggleClass("qpx-state-disabled", !!value);
                    this.$input.prop("disabled", !!value);
                    this._renderClearButton();
                    break;

                case "readOnly":
                    this.$container.toggleClass("qpx-state-readonly", !!value);
                    this.$input.prop("readOnly", !!value);
                    this._renderClearButton();
                    break;

                case "visible":
                    this.$container.toggleClass("qpx-hidden", !value);
                    break;

                case "stylingMode":
                    this.$container.removeClass("qpx-textbox-mode-" + prev).addClass("qpx-textbox-mode-" + value);
                    break;

                case "placeholder":
                    this.$input.attr("placeholder", value || "");
                    break;

                case "maxLength":
                    if (value) { this.$input.attr("maxlength", value); } else { this.$input.removeAttr("maxlength"); }
                    break;

                case "mode":
                    this.$input.attr("type", this._htmlType());
                    break;

                case "spellcheck":
                    this.$input.attr("spellcheck", !!value);
                    break;

                case "showClearButton":
                    this._renderClearButton();
                    break;
            }

            this.trigger("optionChanged", { name: name, value: value, previousValue: prev, component: this });
            return this;
        },

        destroy: function () {
            this.$container.off(".qpxTextBox");
            if (this.$input) { this.$input.off(".qpxTextBox"); }
            this._super();
        }
    });

    qpx.registerWidget("qpTextBox", TextBox);
    qpx.qpTextBox = TextBox;

})(window.qpx, jQuery);

/*!
 * qpx - parser
 * Umožňuje definovat komponenty třemi způsoby:
 *
 *  1) JSON skládání (viz qpx.ui/qpx.Layout):
 *       qpx.ui({ rows: [ {view:"template", template:"Ahoj"} ] }, "#app");
 *
 *  2) Napojení na konkrétní HTML element (jako kendoUI / easyUI):
 *       $("#box").qpx("template", { template: "Ahoj #name#" });
 *       // nebo:
 *       $("#box").qpx({ view: "template", template: "Ahoj" });
 *
 *  3) Deklarativně přes data-qpx-* atributy přímo v HTML (jako metro UI CSS):
 *       <div data-qpx-view="template" data-qpx-template="Ahoj #name#"></div>
 *       qpx.parse(); // proskenuje dokument a vše inicializuje
 */
(function (qpx, $) {
    "use strict";

    // převede "data-qpx-auto-height" -> "autoHeight"
    function toCamelCase(str) {
        return str.replace(/-([a-z0-9])/g, function (_, c) { return c.toUpperCase(); });
    }

    // načte všechny data-qpx-* atributy jednoho elementu do konfiguračního objektu.
    // Hodnoty se pokusí naparsovat jako JSON (čísla, booleany, objekty, pole),
    // pokud to nejde, použije se jako obyčejný string.
    qpx.parseAttrs = function (el) {
        var config = {};
        var attrs = el.attributes;
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            var m = attr.name.match(/^data-qpx-(.+)$/);
            if (!m || m[1] === "id") { continue; }

            var key = toCamelCase(m[1]);
            var raw = attr.value;
            var value;
            try {
                value = JSON.parse(raw);
            } catch (e) {
                value = raw;
            }
            config[key] = value;
        }
        if (el.id) { config.id = config.id || el.id; }
        return config;
    };

    // proskenuje strom (celý dokument, nebo zadaný kořen) a inicializuje
    // všechny dosud neinicializované elementy s atributem data-qpx-view
    qpx.parse = function (root) {
        var $scope = root ? $(root) : $(document);
        var $found = $scope.find("[data-qpx-view]");
        if ($scope.is && $scope.is("[data-qpx-view]")) { $found = $found.add($scope); }

        $found.each(function () {
            if ($(this).data("qpx-widget")) { return; } // už inicializováno
            var cfg = qpx.parseAttrs(this);
            qpx.ui(cfg, this);
        });
        return qpx;
    };

    // vrátí instanci komponenty napojenou na daný element (nebo undefined)
    qpx.$find = function (el) {
        return $(el).data("qpx-widget");
    };

    // -----------------------------------------------------------------
    // jQuery plugin — napojení komponenty přímo na konkrétní element(y)
    // -----------------------------------------------------------------
    $.fn.qpx = function (view, config) {
        var cfg;
        if (qpx.isString(view)) {
            cfg = $.extend({ view: view }, config || {});
        } else {
            cfg = view || {};
        }

        var result = this;
        this.each(function () {
            var widget = qpx.ui(cfg, this);
            $(this).data("qpx-widget", widget);
        });
        return result;
    };

    // po načtení DOM automaticky zpracuje deklarativně zapsané komponenty,
    // pokud si to vývojář výslovně nevypne (qpx.autoParse = false;)
    $(function () {
        if (qpx.autoParse !== false) {
            qpx.parse(document);
        }
    });

})(window.qpx, jQuery);
