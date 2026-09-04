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
