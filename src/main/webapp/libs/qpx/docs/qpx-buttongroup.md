# qpx.ButtonGroup (`view: "buttonGroup"`)

Skupina vizuálně spojených tlačítek, koncepčně jako DevExtreme
`dxButtonGroup`. Zdroj: `qpx.buttongroup.js`. Dědí ze
[`qpx.Widget`](./qpx-widget-base.md).

## Options

| Option | Typ | Výchozí | Popis |
|---|---|---|---|
| `items` | `Array<{ text, icon, disabled, key, hint }>` | `[]` | Položky skupiny |
| `keyExpr` | string | `"key"` | Název pole v položce, které slouží jako klíč. Pokud položka klíč nemá, použije se index v poli |
| `selectionMode` | `"single"` \| `"multiple"` \| `"none"` | `"single"` | `single` = vždy max. 1 vybraná; `multiple` = libovolný počet (toggle); `none` = jen kliky, bez vizuálního výběru |
| `selectedItemKeys` | `Array<key>` | `[]` | Aktuálně vybrané klíče |
| `stylingMode` | `"contained"` \| `"outlined"` \| `"text"` | `"outlined"` | Vizuální styl jednotlivých tlačítek |
| `disabled` | boolean | `false` | Zakáže celou skupinu |
| `visible` | boolean | `true` | `false` přidá třídu `qpx-hidden` |
| `onItemClick` | `function(e)` | `null` | Zkratka za `.on("itemClick", fn)` |
| `onSelectionChanged` | `function(e)` | `null` | Zkratka za `.on("selectionChanged", fn)` |
| `onOptionChanged` | `function(e)` | `null` | Zkratka za `.on("optionChanged", fn)` |

Položka (`item`) může mít i vlastní `disabled: true` — pak je zakázaná
nezávisle na `disabled` skupiny.

## Metody

| Metoda | Popis |
|---|---|
| `option()` / `option(name)` / `option(name, value)` / `option({...})` | Stejné chování jako u `button` — u `items` i `selectedItemKeys` po zápisu proběhne překreslení |
| `getSelectedItemKeys()` | Vrátí kopii pole aktuálně vybraných klíčů |
| `enable()` | `option("disabled", false)` |
| `disable()` | `option("disabled", true)` |

## Události

| Event | Data (`e`) | Kdy se vyvolá |
|---|---|---|
| `itemClick` | `{ event, itemData, itemIndex, itemElement, component }` | Klik na libovolnou (ne-disabled) položku, bez ohledu na `selectionMode` |
| `selectionChanged` | `{ addedItemKeys, removedItemKeys, component }` | Po změně výběru (jen pokud `selectionMode` není `"none"`) |
| `optionChanged` | `{ name, value, previousValue }` | Po změně přes `option()` |

## Příklad

```js
var group = qpx.ui({
    view: "buttonGroup",
    selectionMode: "single",
    items: [
        { text: "Den", key: "day" },
        { text: "Týden", key: "week" },
        { text: "Měsíc", key: "month" }
    ],
    selectedItemKeys: ["week"],
    onSelectionChanged: function (e) {
        console.log("nově vybráno:", e.addedItemKeys, "odebráno:", e.removedItemKeys);
    }
}, "#mistoVDom");

group.getSelectedItemKeys(); // ["week"]
```
