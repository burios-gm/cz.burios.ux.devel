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
