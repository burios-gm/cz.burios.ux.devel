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
