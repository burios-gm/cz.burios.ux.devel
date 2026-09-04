# qpx.Button (`view: "button"`)

Tlačítko se stejnou koncepcí jako DevExtreme `dxButton`.
Zdroj: `qpx.button.js`. Dědí ze [`qpx.Widget`](./qpx-widget-base.md) — viz
tam společné options/metody/eventy (`id`, `css`, `width`, `height`, `hidden`,
`on`, `show()`, `hide()`, `destroy()`, ...).

## Options

| Option | Typ | Výchozí | Popis |
|---|---|---|---|
| `text` | string | `""` | Text tlačítka |
| `icon` | string | `""` | Ikona. Buď krátký text/emoji glyph (`"➕"`), nebo `"css:trida-ikony"` pro CSS ikonu (přidá se jako class) |
| `type` | `"normal"` \| `"default"` \| `"success"` \| `"danger"` \| `"warning"` | `"normal"` | Barevný typ tlačítka — přidá se jako CSS třída `qpx-button-<type>` |
| `stylingMode` | `"contained"` \| `"outlined"` \| `"text"` | `"contained"` | Vizuální styl — třída `qpx-button-mode-<stylingMode>` |
| `disabled` | boolean | `false` | Zakáže tlačítko (klik ani klávesa Enter/mezerník nevyvolají `click`) |
| `visible` | boolean | `true` | `false` přidá třídu `qpx-hidden` |
| `hint` | string | `""` | Tooltip (`title` atribut) |
| `template` | `function(config, $el)` | `null` | Vlastní vykreslení obsahu tlačítka místo výchozího icon+text. Pokud je zadán, `icon`/`text` se ignorují |
| `onClick` | `function(e)` | `null` | Zkratka za `.on("click", fn)` |
| `onOptionChanged` | `function(e)` | `null` | Zkratka za `.on("optionChanged", fn)` |

## Metody

| Metoda | Popis |
|---|---|
| `option()` | Bez argumentů vrátí celý config |
| `option(name)` | Přečte hodnotu jedné option |
| `option(name, value)` | Nastaví jednu option a překreslí komponentu |
| `option({ name: value, ... })` | Hromadné nastavení více options najednou |
| `enable()` | Zkratka za `option("disabled", false)` |
| `disable()` | Zkratka za `option("disabled", true)` |
| `focus()` | Nastaví fokus na tlačítko (`trigger("focus")` na kontejneru) |

## Události

| Event | Data (`e`) | Kdy se vyvolá |
|---|---|---|
| `click` | `{ event, component, element }` | Klik myší, nebo klávesa Enter/mezerník (pokud `disabled: false`) |
| `optionChanged` | `{ name, value, previousValue, element }` | Po každé změně přes `option()` |
| `ready` | – | Po dokončení vykreslení (společné pro všechny widgety) |

## Klávesnice a přístupnost

Tlačítko má `tabindex="0"` (nebo `-1` když `disabled`), `role="button"` a
`aria-disabled`. Enter i mezerník fungují jako klik.

## Příklad

```js
var btn = qpx.ui({
    view: "button",
    text: "Uložit",
    icon: "💾",
    type: "success",
    hint: "Uloží aktuální záznam",
    onClick: function (e) {
        console.log("kliknuto na", e.component.option("text"));
    }
}, "#mistoVDom");

btn.disable();
btn.option({ text: "Ukládám...", icon: "" });
```
