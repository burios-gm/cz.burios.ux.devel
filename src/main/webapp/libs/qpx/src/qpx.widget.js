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
