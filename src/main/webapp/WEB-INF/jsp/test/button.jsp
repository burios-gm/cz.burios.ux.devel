<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>${appTitle}</title>

    <link rel="icon" href="/devel/favicon.png">
    <link rel="stylesheet" href="/devel/libs/fonts/fontawesome/4.7/css/font-awesome.min.css" type="text/css" media="all" />
    <link rel="stylesheet" href="/devel/libs/qpx/themes/jquery.qpx.default.css?build=${ timeNo }" type="text/css">
    <link rel="stylesheet" href="/devel/css/qpx-test.css?build=${timeNo}">

    <script type="text/javascript" src="/devel/libs/jquery/jquery-3.7.1.js"></script>
    <script type="text/javascript" src="/devel/libs/qpx/jquery.qpx.all.js"></script>
</head>

<body class="qpx-view  qpx-theme-generic-light">
	<div class="qpx-test-topbar">
		<a href="/devel/" class="qpx-back-home" title="Zpět na hlavní stránku">
			<span class="fa fa-home"></span>
		</a>
	</div>
	<div class="qpx-test-content">
		<header class="page-head">
			<h1><i class="qpxicon qpxicon-square"></i>qpButton – Test</h1>
			<p class="subtitle">
				Základní tlačítko — varianty type/stylingMode, ikona a hint, přepínání disabled/text za běhu
				a vlastní template obsahu.
			</p>
		</header>
        <div class="toolbar-wrap">
            <div id="styleToolbar"></div>
        </div>
		<main>
			<div class="demo-block">
				<h2>1) Základní varianty (type / stylingMode)</h2>
				<p class="desc">type: normal/default/success/danger/warning, stylingMode: contained/outlined/text.</p>
				<div class="demo-actions" id="basicRow"></div>
				<div class="value-out" id="out1">Klikni na tlačítko...</div>
			</div>

			<div class="demo-block">
				<h2>2) Ikona, hint, disabled/enabled přepínání</h2>
				<p class="desc">icon, hint, option("disabled", ...), option("text", ...), onOptionChanged.</p>
				<div id="iconRow"></div>
				<div class="demo-actions">
					<button id="toggleDisabled" type="button">option("disabled", !disabled)</button>
					<button id="toggleText" type="button">option("text", ...)</button>
				</div>
			</div>

			<div class="demo-block">
				<h2>3) Vlastní <code>template</code></h2>
				<p class="desc">Kompletně vlastní obsah tlačítka přes funkci template(cfg, $el).</p>
				<div id="templateRow"></div>
			</div>

			<div class="demo-block">
				<h2>4) Deklarativně přes data-qpx-* atributy</h2>
				<p class="desc">Bez volání qpx.ui() — widget se inicializuje automaticky podle data-qpx-* atributů elementu.</p>
				<div data-qpx-view="button" data-qpx-text="Deklarativní tlačítko" data-qpx-type="default"></div>
			</div>
		</main>
	</div>

	<script>
        $(function () {
            function log(sel, msg) { $(sel).text(msg); }

            // -- 1) základní varianty --
            ["normal", "default", "success", "danger", "warning"].forEach(function (type) {
                qpx.ui({
                    view: "button",
                    text: type,
                    type: type,
                    onClick: function (e) { log("#out1", "click: type=" + e.component.option("type")); }
                }, $("<div></div>").appendTo("#basicRow"));
            });
            ["contained", "outlined", "text"].forEach(function (mode) {
                qpx.ui({
                    view: "button",
                    text: "mode: " + mode,
                    stylingMode: mode,
                    onClick: function (e) { log("#out1", "click: stylingMode=" + e.component.option("stylingMode")); }
                }, $("<div></div>").appendTo("#basicRow"));
            });

            // -- 2) ikona / hint / disabled --
            var iconBtn = qpx.ui({
                view: "button",
                text: "Uložit",
                icon: "💾",
                hint: "Uloží aktuální záznam",
                type: "success",
                onOptionChanged: function (e) { console.log("optionChanged:", e.name, "->", e.value); }
            }, $("<div></div>").appendTo("#iconRow"));

            $("#toggleDisabled").on("click", function () {
                iconBtn.option("disabled") ? iconBtn.enable() : iconBtn.disable();
            });
            $("#toggleText").on("click", function () {
                iconBtn.option("text", "Text: " + new Date().toLocaleTimeString());
            });

            // -- 3) vlastní template --
            qpx.ui({
                view: "button",
                stylingMode: "outlined",
                template: function (cfg, $el) {
                    $el.html("<b style='color:#c0392b;'>★</b> Vlastní obsah tlačítka");
                },
                onClick: function () { console.log("klik na tlačítko s vlastním template"); }
            }, $("<div></div>").appendTo("#templateRow"));

            // -----------------------------------------------------------------
            // Horní panel: přepínač tématu
            //
            // Třída .qpx-theme-generic-light / .qpx-theme-generic-dark se
            // nastavuje JEDNOU na společného předka (.qpx-test-content),
            // ne na jednotlivé widgety zvlášť. V jquery.qpx.all.css jde o
            // globální (nescopnuté) pravidlo, které jen nastaví CSS
            // proměnné frameworku (--qpx-bg, --qpx-text, --qpx-border, ...)
            // - díky dědičnosti CSS proměnných se pak automaticky použijí
            // ve všech widgetech uvnitř i v běžném obsahu stránky (nadpisy,
            // .value-out, ...), aniž by bylo nutné widgety enumerovat.
            // -----------------------------------------------------------------
            function applyTheme(themeClass) {
                $(".qpx-test-content")
                    .removeClass("qpx-theme-generic-light qpx-theme-generic-dark")
                    .addClass(themeClass);
                toolbar.option("theme", themeClass.replace("qpx-theme-", ""));
                // zpětně kompatibilní přepínač pro topbar (viz qpx-test.css)
                $("body").toggleClass("qpx-page-dark", themeClass === "qpx-theme-generic-dark");
            }

			var toolbar = qpx.ui({
				view: "qpToolBar",
				theme: "generic-light",
				items: [{
					location: "before", widget: "template",
						template: "<b style='padding:0 4px;'>Téma:</b>"
					}, {
						location: "before", widget: "buttonGroup",
						options: {
							items: [
								{ text: "Světlé", key: "generic-light" },
								{ text: "Tmavé", key: "generic-dark" }
							],
							selectedItemKeys: ["generic-light"],
							onSelectionChanged: function (e) {
								var key = e.component.getSelectedItemKeys()[0] || "generic-light";
								applyTheme("qpx-theme-" + key);
							}
						}
					}
				]
			}, "#styleToolbar");
			applyTheme("qpx-theme-generic-light");
		});
	</script>
</body>
</html>
