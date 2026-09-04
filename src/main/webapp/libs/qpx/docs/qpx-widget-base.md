# qpx.Widget — společný základ všech komponent

Všechny widgety frameworku qpx (`button`, `buttonGroup`, `dropDownButton`,
`template`, `layout`, `qpToolBar`, ...) dědí ze společné bázové třídy
`qpx.Widget` (soubor `qpx.widget.js`). Tento dokument popisuje, co mají
všechny komponenty společné — specifika jednotlivých widgetů najdete
v jejich vlastních `.md` souborech.

## Tři způsoby vytvoření komponenty

```js
// 1) JSON strom
qpx.ui({ view: "button", text: "Uložit" }, "#mistoVDom");

// 2) jQuery plugin napojený na konkrétní element
$("#box").qpx("button", { text: "Uložit" });
// nebo:
$("#box").qpx({ view: "button", text: "Uložit" });

// 3) deklarativně přes data-qpx-* atributy (zpracuje qpx.parse())
// <div data-qpx-view="button" data-qpx-text="Uložit"></div>
```

Instanci widgetu lze kdykoliv získat zpět z DOM elementu:

```js
var widget = qpx.$find("#box");        // nebo
var widget = $("#box").data("qpx-widget");
```

## Společné options (dostupné u všech widgetů)

| Option    | Typ                    | Výchozí | Popis |
|-----------|------------------------|---------|-------|
| `id`      | string                 | auto (`qpx.uid()`) | ID komponenty, použije se i jako `data-qpx-id` |
| `css`     | string                 | –       | Přidá se jako CSS třída na kontejner |
| `width`   | number \| string       | –       | Nastaví `width` kontejneru (číslo = px) |
| `height`  | number \| string       | –       | Nastaví `height` kontejneru (číslo = px) |
| `hidden`  | boolean                | false   | Komponenta se od začátku skryje (`display:none`) |
| `on`      | object                 | –       | Mapa `{ eventName: handler }` navázaná ihned po vytvoření, ekvivalent volání `.on()` pro každou položku |

## Společné metody

| Metoda | Popis |
|---|---|
| `show()` | Zobrazí kontejner, vyvolá event `show` |
| `hide()` | Skryje kontejner, vyvolá event `hide` |
| `refresh()` | Výchozí implementace: vyprázdní kontejner a znovu zavolá `render()`. Konkrétní widgety ji typicky přepisují efektivněji |
| `destroy()` | Zruší navázané handlery, zničí potomky (`_children`), odstraní data z elementu a vyprázdní kontejner. Vyvolá event `destroy` |
| `getContainer()` | Vrátí jQuery objekt kontejneru |
| `getNode()` | Vrátí "holý" DOM element kontejneru |
| `addChild(widget)` | Zaregistruje potomka (aby byl zničen společně s rodičem) |
| `getChildren()` | Vrátí pole navázaných potomků |

## Události (pub/sub, `qpx.EventsMixin`)

| Metoda | Popis |
|---|---|
| `on(event, handler)` | Přihlásí posluchače |
| `off(event, [handler])` | Odhlásí konkrétní (nebo všechny) posluchače daného eventu |
| `trigger(event, ...args)` | Vyvolá event — zavolá všechny handlery a zároveň "zrcadlí" event jako jQuery event `qpx:<event>` na kontejneru, takže lze napojit i `$(el).on("qpx:click", ...)` |

Každý widget automaticky vyvolá event `ready` po dokončení konstrukce
(`init()` → `render()` → `trigger("ready")`).

## Registrace vlastního widgetu

```js
var MyWidget = qpx.Widget.extend({
    defaults: { text: "" },
    render: function () {
        this.$container.text(this.config.text);
    }
});
qpx.registerWidget("myWidget", MyWidget);
```

## Java-like třídy (`qpx.Class`)

`qpx.Widget` (a tedy i všechny komponenty) je postaven na `qpx.Class`,
jednoduchém systému dědičnosti inspirovaném "Simple JavaScript
Inheritance" (J. Resig):

```js
var Animal = qpx.Class.extend({
    init: function (name) { this.name = name; },
    speak: function () { return this.name + " vydává zvuk."; }
});

var Dog = Animal.extend({
    speak: function () { return this._super() + " Přesněji: štěká."; }
});

new Dog("Rex").speak();
new Dog("Rex") instanceof Animal; // true
```

- `_super()` uvnitř přepsané metody zavolá původní (rodičovskou) implementaci.
- `Class.mixin(obj1, obj2, ...)` / `Class.implement(...)` přimíchá vlastnosti
  do prototypu (obdoba Java interface / traits) — takto je do `Widget`
  přimíchán `qpx.EventsMixin`.
- Statické vlastnosti (`extend`, `mixin`, `registerWidget`, ...) se dědí
  automaticky do potomků.

## Deklarativní zápis (`data-qpx-*`)

- `qpx.parse([root])` proskenuje dokument (nebo zadaný kořen) a inicializuje
  všechny dosud neinicializované elementy s atributem `data-qpx-view`.
  Volá se automaticky po `$(document).ready()`, pokud není nastaveno
  `qpx.autoParse = false`.
- `data-qpx-<option>` se převede na camelCase klíč configu
  (`data-qpx-auto-height` → `autoHeight`).
- Hodnota atributu se nejprve zkusí naparsovat jako JSON (čísla, booleany,
  objekty, pole) — pokud selže, použije se jako obyčejný string.
- `qpx.parseAttrs(el)` vrátí config objekt sestavený z atributů elementu,
  aniž by komponentu inicializoval.

## Utility (`qpx.*`)

| Funkce | Popis |
|---|---|
| `qpx.extend(target, ...sources)` | Mělké sloučení objektů do `target` |
| `qpx.isString(v)` / `qpx.isFunction(v)` / `qpx.isObject(v)` | Typové kontroly (`isObject` vrací `false` pro pole a `null`) |
| `qpx.uid([prefix])` | Vygeneruje unikátní ID (`qpx1`, `qpx2`, ...) |
| `qpx.toPx(v)` | Číslo převede na `"Npx"`, string vrátí beze změny |
| `qpx.resolve(obj, "a.b.c")` | Přečte vnořenou hodnotu podle tečkové cesty |
