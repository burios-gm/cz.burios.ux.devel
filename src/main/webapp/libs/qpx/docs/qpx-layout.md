# qpx.Layout (`view: "layout"`, nebo implicitně přes `rows`/`cols`)

Responzivní layout komponenta umožňující libovolně vnořovat `rows`
a `cols`, podobně jako ve webixu. Interně staví na flexboxu. Zdroj:
`qpx.layout.js`. Dědí ze [`qpx.Widget`](./qpx-widget-base.md).

> Poznámka: pokud konfigurační objekt obsahuje `rows` nebo `cols`
> a nemá `view`, `qpx.ui()` automaticky doplní `view: "layout"`
> (viz `qpx.widget.js` → `qpx.ui`). Není tedy nutné `view: "layout"`
> psát explicitně.

## Options

| Option | Typ | Výchozí | Popis |
|---|---|---|---|
| `type` | `"clean"` \| `"space"` \| `"line"` | `"clean"` | `space` přidá mezery mezi buňkami (třída `qpx-layout-space`), `line` přidá oddělovací čáry (třída `qpx-layout-line`) |
| `responsive` | boolean | `false` | Jen pro `cols` — na úzké obrazovce se sloupce chovají responzivně (třída `qpx-responsive`) |
| `gap` | number \| string \| null | `null` | CSS `gap` mezi buňkami |
| `rows` | array | – | Pole položek vykreslených pod sebou (svisle) |
| `cols` | array | – | Pole položek vykreslených vedle sebe (vodorovně) |

Zadává se buď `rows`, nebo `cols` — nikdy obojí najednou v jedné
instanci. Layout bez `rows`/`cols` slouží jako prostý kontejner
(prázdná "leaf" buňka).

### Položky v `rows` / `cols`

Každá položka je buď:

- **config dalšího widgetu** (`{ view: "...", ... }`, nebo opět
  vnořené `{ rows: [...] }` / `{ cols: [...] }`),
- **spacer** — objekt bez `view`/`rows`/`cols` (např. `{}` nebo
  `{ gravity: 1 }`) — vykreslí se jako prázdná flexibilní mezera
  (třída `qpx-spacer`),
- `null`/`undefined` — přeskočí se.

Každá položka navíc může nést sizing vlastnosti, které se aplikují
na obalující buňku (nezávisle na tom, zda jde o widget nebo spacer):

| Vlastnost položky | Popis |
|---|---|
| `width` | Pevná šířka buňky (`flex: 0 0 auto`) |
| `height` | Pevná výška buňky (`flex: 0 0 auto`) |
| `gravity` | `flex-grow` — poměr, jakým buňka roste do volného prostoru |
| `hidden` | Buňka se od začátku skryje |

## Metody a události

`Layout` nepřidává žádné vlastní metody ani eventy nad rámec
[společného základu `qpx.Widget`](./qpx-widget-base.md) (`show()`,
`hide()`, `destroy()`, `getChildren()`, event `ready`, ...). Vnořené
widgety jsou registrovány přes `addChild()`, takže `destroy()`
rodičovského layoutu zničí i všechny potomky.

## Příklad

```js
qpx.ui({
    rows: [
        { view: "template", height: 44, css: "toolbar",
          template: "<div style='padding:10px 14px;'>Horní panel</div>" },
        {
            cols: [
                { view: "template", width: 180, css: "sidebar",
                  template: "<div style='padding:12px;'>Postranní panel (180px)</div>" },
                { view: "template", gravity: 1, css: "card",
                  template: "<h3>#title#</h3><p>#text#</p>",
                  data: { title: "Hlavní obsah", text: "Tato buňka roste (gravity:1)." } }
            ],
            responsive: true
        }
    ]
}, "#mistoVDom");
```
