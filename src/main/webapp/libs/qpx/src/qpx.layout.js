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
