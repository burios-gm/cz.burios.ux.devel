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
