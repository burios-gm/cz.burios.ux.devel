# cz.burios.ux.devel
Vývojový projekt Webové aplikace: 
- Java 17+,
- Spring 6+ MVC,
- JSP

javascript:
- oQPX - vlastní (jQuery) OOP UI framework (navržená pomocí AI)

---

# QPX - javascript (jQuery) UI framevork

Vlastní JavaScript UI framework postavený nad **jQuery**. Základem je
Java-like objektový systém `qpx.Class` s dědičností, nad kterým stojí
báze `qpx.Widget` pro všechny komponenty a tři rovnocenné způsoby, jak
komponenty definovat.

## Instalace / zapojení

```html
<script src="jquery.min.js"></script>

<!-- jedno ze tří vygenerovaných témat (viz sekce 7 - SCSS / CSS build) -->
<link rel="stylesheet" href="themes/jquery.qpx.default.css">
<!-- nebo: themes/jquery.qpx.light.css / themes/jquery.qpx.dark.css -->

<script src="jquery.qpx.all.js"></script> <!-- sbalený build ze src/* -->
```

Zdrojové JS soubory jsou rozdělené v `src/` (kvůli přehlednosti a dalšímu
rozšiřování), `jquery.qpx.all.js` v kořeni je jejich prosté spojení pro
nasazení, vygenerované úlohou `npm run build-js` (viz `gulpfile.js`):

- `src/qpx.core.js` – jmenný prostor, `qpx.Class`, utility, pub/sub mixin
- `src/qpx.widget.js` – bázová třída `qpWidget`, registr komponent, `qpx.ui()`
- `src/qpx.layout.js` – layout komponenta (rows/cols, responzivita)
- `src/qpx.template.js` – komponenta `template`
- `src/qpx.button.js` – komponenta `button`
- `src/qpx.buttongroup.js` – komponenta `buttonGroup`
- `src/qpx.parser.js` – parser `data-qpx-*` atributů, `$.fn.qpx()`, `qpx.parse()`

CSS se negeneruje ručně ani se needituje výsledný `.css` v `themes/` -
zdroj pravdy jsou soubory v `scss/`, viz sekce **7. SCSS / CSS build**
níže.

## 1. Class systém (dědičnost jako v Javě)

```js
var Animal = qpx.Class.extend({
    init: function (name) { this.name = name; },      // konstruktor
    speak: function () { return this.name + " vydává zvuk"; }
});

var Dog = Animal.extend({
    speak: function () {
        return this._super() + " (štěká)";             // super.speak()
    }
});

var d = new Dog("Rex");
d.speak();                    // "Rex vydává zvuk (štěká)"
d instanceof Animal;          // true
```

- `Class.extend(protoProps, staticProps)` – vytvoří potomka, podporuje
  `this._super(...)` uvnitř přepsaných metod (obdoba `super.metoda()`).
- Statické členy (a statické metody) se dědí automaticky.
- `MyClass.mixin(obj1, obj2, ...)` – přimíchá další sadu metod do
  prototypu (obdoba implementace rozhraní / traity). Používá se např.
  pro `qpx.EventsMixin` (on/off/trigger) v `qpx.Widget`.

Všechny UI komponenty (`qpx.Widget` a jeho potomci jako `qpx.Layout`,
`qpx.Template`) jsou postavené právě na `qpx.Class`, takže je lze
běžně rozšiřovat:

```js
var Badge = qpx.Template.extend({
    defaults: { template: "<span class='badge'>#text#</span>" }
});
qpx.registerWidget("badge", Badge);
```

## 2. Tři způsoby definice komponent

### a) JSON kompozice (jako webix)

```js
qpx.ui({
    rows: [
        { view: "template", height: 44, template: "Toolbar" },
        {
            cols: [
                { view: "template", width: 200, template: "Menu" },
                { view: "template", gravity: 1, template: "Obsah #x#", data: { x: 1 } }
            ]
        }
    ]
}, "#app");
```

`rows` / `cols` lze libovolně vnořovat. Buňka bez `view/rows/cols` se
chová jako prázdný flexibilní spacer.

### b) Napojení na konkrétní HTML element (jako kendoUI / easyUI)

```js
$("#box").qpx("template", { template: "Ahoj #jmeno#", data: { jmeno: "Petr" } });

// nebo s celým configem:
$("#box").qpx({ view: "template", template: "..." });

// přístup k instanci komponenty:
var w = $("#box").data("qpx-widget");
w.setValues({ jmeno: "Jana" });
```

### c) Deklarativně přes `data-qpx-*` atributy (jako Metro UI CSS)

```html
<div data-qpx-view="template"
     data-qpx-template="<b>#title#</b>: #text#"
     data-qpx-data='{"title":"Ahoj","text":"svět"}'>
</div>
```

Po načtení DOM se automaticky zavolá `qpx.parse(document)`, který
proskenuje celý dokument a všechny takto označené elementy inicializuje.
Hodnoty atributů se zkusí naparsovat jako JSON (čísla, pole, objekty),
jinak se použijí jako řetězec. Automatické zpracování lze vypnout
nastavením `qpx.autoParse = false;` a spustit ručně později přes
`qpx.parse(nejakyKorenovyElement)`.

Všechny tři přístupy vedou na stejné jádro — `qpx.ui(config, container)`
— takže je lze libovolně kombinovat v rámci jedné aplikace.

## 3. Layout (responzivní rows/cols)

```js
qpx.ui({
    cols: [
        { view: "template", width: 220, template: "Sidebar" },
        { view: "template", gravity: 1, template: "Content" }
    ],
    responsive: true   // pod 760px se cols přeskládají na rows
}, "#app");
```

Podporované vlastnosti buněk: `width`, `height`, `gravity` (flex-grow),
`hidden`, `css`. Typ layoutu (`type: "space" | "line"`) řídí mezery /
oddělovací čáry mezi buňkami.

## 7. SCSS / CSS build (témata generic-light a generic-dark)

Vzhled je barevně vyladěný tak, aby odpovídal výchozím DevExtreme
tématům **Generic Light** a **Generic Dark** (bílé/tmavě šedé pozadí,
jemné šedé linky, akcentová modrá `#337ab7` pro light, `#4dabf7` pro
dark). Zdroj pravdy jsou SCSS soubory v `scss/`; hotové `.css` v
`themes/` se **negeneruje ani needituje ručně** — vždy vzniká
kompilací přes `npm run build-*` (viz níže).

### Struktura `scss/`

```
scss/
├── qp-all.scss   ← hlavní vstupní bod ("default" build)
├── qp-light.scss          ← samostatný vstupní bod, jen téma "generic-light"
├── qp-dark.scss           ← samostatný vstupní bod, jen téma "generic-dark"
├── base/
│   ├── _variables.scss ← designové tokeny (rozměry, mezery, radius...)
│   │                      + sdílené mixiny (qpx-disabled-state,
│   │                      qpx-focus-ring, qpx-popup-surface)
│   └── _normalize.scss ← lehký reset/normalizace, omezený na .qpx-view
├── themes/
│   ├── _light.scss     ← barevná paleta "generic-light" (mixin qpx-theme-vars)
│   └── _dark.scss      ← barevná paleta "generic-dark"  (mixin qpx-theme-vars)
└── widgets/             ← JEDEN SCSS soubor PRO KAŽDÝ WIDGET
    ├── _layout.scss
    ├── _template.scss
    ├── _button.scss
    ├── _buttongroup.scss
    └── _popup-list.scss  ← sdílený vzhled popup menu (dropDownButton + toolbar overflow)

```

Soubory se začínajícím podtržítkem (`_button.scss` apod.) jsou tzv.
"partials" — samy o sobě se nekompilují, importují se přes `@use` do
některého ze tří vstupních bodů (`qp-all.scss`, `qp-light.scss`,
`qp-dark.scss`). Barvy (`--qpx-*`) jsou v SCSS zapsané jako **CSS custom
properties**, ne jako SCSS proměnné nahrazené při kompilaci — díky tomu
funguje i běhové přepínání tématu třídou (`qpToolBar.option("theme", ...)`)
a zároveň si je konzumentská aplikace může kdykoliv přebít vlastním
pravidlem (`.qpx-theme-generic-light { --qpx-accent: #ff5722; }`).

### Tři výsledné CSS soubory

| vstupní SCSS | výsledný CSS (`themes/`) | k čemu slouží |
|---|---|---|
| `qp-all.scss` | `jquery.qpx.default.css` | obsahuje **obě** témata najednou, přepínatelná za běhu třídou `qpx-theme-generic-light` / `-dark` na kontejneru — vhodné, když appka nabízí přepínač světlo/tma |
| `qp-light.scss` | `jquery.qpx.light.css` | jen světlé téma, proměnné rovnou na `:root`/`.qpx-view` — netřeba žádná přepínací třída, menší výsledný soubor. Obdoba `dx.light.css` z DevExtreme |
| `qp-dark.scss` | `jquery.qpx.dark.css` | totéž pro tmavé téma. Obdoba `dx.dark.css` |

### Příkazy npm (definované v `package.json`)

Spouští se z **kořene repozitáře** (tam, kde je `package.json` a
`gulpfile.js` — tedy o úroveň výš než `src/main/webapp/libs/qpx/`).
V Eclipse: otevřít záložku **Terminal** (Window → Show View → Terminal,
nebo vestavěný terminál z EGit/Marketplace pluginu), přepnout se do
kořenové složky projektu a spustit stejné příkazy jako v běžném
terminálu.

```bash
# jen poprvé (nebo po změně devDependencies v package.json) — stáhne sass, gulp...
npm install

# zkompiluje scss/qp-framework.scss -> .../qpx/themes/jquery.qpx.default.css
npm run build-css

# zkompiluje scss/light.scss -> .../qpx/themes/jquery.qpx.light.css
npm run build-light

# zkompiluje scss/dark.scss -> .../qpx/themes/jquery.qpx.dark.css
npm run build-dark

# jako build-css, ale hlídá uložení souborů v scss/ a přebuilduje automaticky
npm run watch-css

# jen ověří, že se qp-framework.scss zkompiluje bez chyby (nic neukládá na disk)
npm run test-css

# spojí soubory z src/ (v pořadí definovaném v gulpfile.js) do jquery.qpx.all.js
npm run build-js
```

Běžný postup při úpravě stylů: uprav příslušný `.scss` (nejčastěji
konkrétní widget v `scss/widgets/`, nebo barvu v `scss/themes/`), spusť
`npm run watch-css` (nech běžet na pozadí) a obnov stránku v prohlížeči
— všechny tři `.css` soubory potřebné pro danou úlohu se přegenerují
automaticky při každém uložení.

### Jak přidat SCSS pro nový widget

1. Vytvoř `scss/widgets/_muj-widget.scss` (jméno partial souboru vždy
   začíná `_`). Barvy piš jako `var(--qpx-neco, #fallback)`, ne natvrdo
   — jinak nebude fungovat přepínání tématu. Rozměry/mezery/radius ber
   z `base/_variables.scss` (`@use "../base/variables" as *;`).
2. Nový partial přidej přes `@use "widgets/muj-widget";` do
   `qp-all.scss` **a** do `qp-light.scss`/`qp-dark.scss` (pokud má
   widget vypadat stejně ve všech třech buildech, což je obvyklý
   případ).
3. Spusť `npm run build-css && npm run build-light && npm run build-dark`
   (nebo nech běžet `npm run watch-css` a spusť ostatní dva ručně před
   odevzdáním).

### Přizpůsobení barev vlastní paletě

Nejjednodušší je přepsat proměnné v `scss/themes/_light.scss` /
`_dark.scss` (mixin `qpx-theme-vars`) a znovu spustit build. Pro
appku, která qpx jen používá (bez zásahu do zdrojů), stačí v jejím
vlastním CSS přebít konkrétní `--qpx-*` proměnnou s vyšší specificitou
— viz příklad výše.

## Rozšiřování o vlastní komponenty

```js
var MyWidget = qpx.Widget.extend({
    defaults: { text: "" },
    render: function () {
        this.$container.addClass("my-widget").text(this.config.text);
    }
});
qpx.registerWidget("mywidget", MyWidget);
```

Poté je `mywidget` použitelný ve všech třech zápisech (JSON, `$.fn.qpx`,
`data-qpx-view="mywidget"`).

## Nasazení (Java / Tomcat / Spring)

Framework je čistě klientská (view) vrstva bez závislosti na
konkrétním backendu a leží ve webapp stromu jako statická knihovna:

```
<projekt>/
├── package.json             ← npm skripty (build-css, build-js, ...)
├── gulpfile.js              ← definice pořadí souborů pro build-js
└── src/main/webapp/libs/qpx/
    ├── src/                 ← zdrojové JS moduly
    ├── scss/                ← zdrojové SCSS (viz sekce 7)
    ├── themes/              ← zkompilované CSS (jquery.qpx.default/light/dark.css)
    └── jquery.qpx.all.js    ← zkompilovaný JS bundle (npm run build-js)
└── src/main/webapp/WEB-INF/jsp
    ├── index.jsp            ← ukázková stránka
    └── test/                ← testovací jsp soubory
```

- **JSP na Tomcat 11** — obsah `src/main/webapp/libs/qpx/` (po
  buildu) se servíruje jako statický zdroj, JSP stránka vygeneruje buď
  HTML s `data-qpx-*` atributy (deklarativní varianta se hodí, když
  server rovnou generuje značení), nebo předá počáteční JSON
  konfiguraci do `<script>` bloku pro `qpx.ui(...)`.
- **Spring 6+ (Spring MVC / Boot)** — stejný princip; komponenty typu
  `template` lze snadno napojit na REST endpointy (`@RestController`
  vracející JSON) a data doplňovat přes `setValues()` po AJAX volání,
  případně přímo posílat celé JSON konfigurace komponent ze serveru.

Build (`npm run build-css`, `npm run build-js`, ...) se typicky pouští
buď ručně v Eclipse terminálu před nasazením, nebo navázaný na Maven/
Gradle build (`frontend-maven-plugin` / `com.github.node-gradle.node`),
aby se `themes/*.css` a `jquery.qpx.all.js` vygenerovaly automaticky
při každém buildu WARka.

Do budoucna se počítá s doplněním dalších komponent (formuláře, seznamy/
datatable, okna) — všechny půjdou postavit stejným způsobem: potomek
`qpx.Widget`, registrace přes `qpx.registerWidget`, a automaticky získají
podporu všech tří způsobů zápisu.


---

instalace kompilárotu přes terminál: 
- npm install sass --save-dev
- npm install --save-dev gulp

spuštění jednotlivých kompilačních funkcí:
- npm run test-css atd...

---

