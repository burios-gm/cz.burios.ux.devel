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
