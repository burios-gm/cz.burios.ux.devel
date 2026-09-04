# qpx.Template (`view: "template"`)

První konkrétní UI komponenta frameworku. Chová se obdobně jako
`template` ve webixu: vykresluje HTML podle šablony (string, nebo
funkce) a dat, která lze kdykoliv změnit přes `setValues()`. Zdroj:
`qpx.template.js`. Dědí ze [`qpx.Widget`](./qpx-widget-base.md).

## Syntaxe šablony

Podporovány jsou dva zápisy proměnných, včetně vnořených cest:

- `#jmeno#`
- `{jmeno}`
- `{user.name}` — vnořená cesta se čte přes `qpx.resolve()`

`undefined`/`null` hodnoty se vykreslí jako prázdný string. Šablona
může být i funkce `function(data, qpx) { return html; }` pro plnou
kontrolu nad vykreslením (např. iterace přes pole).

## Options

| Option | Typ | Výchozí | Popis |
|---|---|---|---|
| `template` | string \| `function(data, qpx)` | `""` | Šablona HTML obsahu |
| `data` | object \| null | `null` | Počáteční data dosazovaná do šablony |
| `autoheight` | boolean | `false` | Přidá třídu `qpx-template-autoheight` |
| `borderless` | boolean | `false` | Přidá třídu `qpx-borderless` |

## Metody

| Metoda | Popis |
|---|---|
| `setValues(data, [silent])` | Hlavní API — nahradí data a překreslí. Pokud `silent` není `true`, vyvolá event `change` |
| `getValues()` | Vrátí aktuálně nastavená data |
| `parse(data)` | Alias za `setValues(data)` (stejně jako ve webixu) |
| `define(prop, value)` \| `define({ prop: value, ... })` | Za běhu změní libovolnou option (např. `template`) a překreslí |
| `setTemplate(tpl)` | Zkratka za `define("template", tpl)` |
| `setHTML(html)` | Vloží hotové HTML přímo, bez průchodu šablonou. Vyvolá `afterrender` |
| `refresh()` | Znovu vykreslí s aktuální šablonou a daty |

## Události

| Event | Data (`e`) | Kdy se vyvolá |
|---|---|---|
| `change` | `data` | Po `setValues(data)` (pokud není `silent: true`) |
| `afterrender` | – | Po každém vykreslení obsahu (`_draw()`, i po `setHTML()`) |
| `ready` | – | Po dokončení inicializace (společné pro všechny widgety) |

## Příklad

```js
var tpl = qpx.ui({
    view: "template",
    template: "<b>#user#</b> právě napsal: <i>#msg#</i>",
    data: { user: "Petr", msg: "Ahoj!" }
}, "#mistoVDom");

tpl.setValues({ user: "Petr", msg: "Nový text po setValues()." });

// šablona jako funkce (např. výpis seznamu)
qpx.ui({
    view: "template",
    template: function (data) {
        return "<ul>" + data.items.map(function (i) {
            return "<li>" + i + "</li>";
        }).join("") + "</ul>";
    },
    data: { items: ["a", "b", "c"] }
}, "#list");

// deklarativně přes data-qpx-* atributy
// <div data-qpx-view="template"
//      data-qpx-template="&lt;b&gt;#title#&lt;/b&gt;: #text#"
//      data-qpx-data='{"title":"Ahoj","text":"svět"}'></div>
```
