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
