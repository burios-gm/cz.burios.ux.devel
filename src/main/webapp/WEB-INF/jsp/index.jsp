<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%
// System.out.println("/devel/index.jsp");
%>
<!DOCTYPE html>
<html lang="cs">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>Buriosca.cz - Devel QPX</title>

		<link rel="icon" href="/devel/favicon.png">

		<link rel="stylesheet" href="/devel/libs/fonts/fontawesome/4.7/css/font-awesome.min.css" type="text/css" media="all" />
		<link rel="stylesheet" href="/devel/libs/qpx/themes/jquery.qpx.default.css?build=${ timeNo }" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="/devel/api/qpx-test.css?build=${timeNo}">

		<style type="text/css">
			/*
			html, body {
				font-family: "Segoe UI", Arial, sans-serif;
				font-size: 13px;
				margin: 0;
				background: #f4f6f8;
				color: #222;
			}
			*/
			header.page-head {
				padding: 20px 24px 8px;
			}
			h1 { font-size: 20px; margin: 0 0 4px; }
			.subtitle { color: #666; font-size: 13px; margin: 0 0 4px; }

			.toolbar-wrap { margin: 12px 24px 4px; }

			main { padding: 8px 24px 32px; }

			h2.group-title {
				font-size: 13px;
				/*text-transform: uppercase;*/
				letter-spacing: .04em;
				color: #8a93a0;
				margin: 28px 0 10px;
			}

			.grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
				gap: 14px;
			}

			a.card {
				display: block;
				background: #fff;
				border: 1px solid #e2e6ea;
				border-radius: 8px;
				padding: 16px 18px;
				text-decoration: none;
				color: inherit;
				transition: border-color .12s ease, box-shadow .12s ease, transform .12s ease;
			}
			a.card:hover {
				border-color: var(--qpx-accent, #337ab7);
				box-shadow: 0 4px 14px rgba(0,0,0,.08);
				transform: translateY(-1px);
			}
			a.card .card-icon {
				font-size: 24px;
				margin-bottom: 8px;
				display: block;
				color: #337ab7;
			}
			a.card .card-title {
				font-size: 14px;
				font-weight: 600;
				margin-bottom: 4px;
			}
			a.card .card-desc {
				font-size: 12px;
				color: #767676;
				line-height: 1.45;
			}
			a.card .card-path {
				display: inline-block;
				margin-top: 10px;
				font-family: monospace;
				font-size: 11px;
				color: var(--qpx-accent, #337ab7);
				background: #eef4fb;
				padding: 2px 6px;
				border-radius: 4px;
			}

			.qpx-hidden-card { display: none !important; }

			footer {
				margin: 32px 24px 20px;
				color: #9aa2ac;
				font-size: 11px;
			}
		</style>
		<link rel="stylesheet" href="/devel/css/qpx-test.css?build=${timeNo}">

		<script type="text/javascript" src="/devel/libs/jquery/jquery-3.7.1.js"></script>
		<script type="text/javascript" src="/devel/libs/qpx/jquery.qpx.all.js"></script>
	</head>
	<body class="qpx-view qpx-theme-generic-light">
		<header class="page-head">
			<div style="display: flex; align-items: center;">
				<img alt="" src="/devel/favicon.svg" style="height: 40px; width: 40px;">
				<h1>QPX framework - Test</h1>
			</div>
			<p class="subtitle">Výběr widgetu níže tě přesměruje na jeho samostatnou testovací stránku (<code>/devel/test/&lt;widget&gt;</code>).</p>
		</header>
		<div class="toolbar-wrap">
			<div id="pageToolbar"></div>
		</div>

		<main>
			<h2 class="group-title">Struktura a rozložení</h2>
			<div class="grid" data-group="layout">
				<a class="card" href="/devel/test/layout">
					<span class="card-icon qpxicon qpxicon-layout qpxicon-xl" style="color: #337ab7;"></span>
					<span class="card-title">Layout</span>
					<span class="card-desc">Skládání komponent přes rows/cols, responzivní chování, gap, spacer buňky.</span>
					<span class="card-path">/devel/test/layout</span>
				</a>
				<a class="card" href="/devel/test/flexlayout">
					<span class="card-icon qpxicon qpxicon-flexlayout qpxicon-xl"></span>
					<span class="card-title">qpFlexLayout</span>
						Rozkládací kontejner postavený přímo nad CSS flexboxem. Na rozdíl od základního "layout" (rows/cols,
						každá buňka se defaultně rovnoměrně roztahuje)
						qpFlexLayout vystavuje skutečné flexbox vlastnosti
					<span class="card-desc">
					</span>
					<span class="card-path">/devel/test/flexlayout</span>
				</a>
				<a class="card" href="/devel/test/gridlayout">
					<span class="card-icon qpxicon qpxicon-gridlayout qpxicon-xl" style="color: #337ab7;"></span>
					<span class="card-title">qpGridLayout</span>
					<span class="card-desc">
						Rozkládací kontejner nad nativním CSS Gridem — dvourozměrná
						mřížka s podporou slučování buněk (colSpan/rowSpan).
					</span>
					<span class="card-path">/devel/test/gridlayout</span>
				</a>
				<a class="card" href="/devel/test/scrollview">
					<span class="card-icon qpxicon qpxicon-scrollview qpxicon-xl"></span>
					<span class="card-title">qpScrollView</span>
						Kontejner pro scrollovatelný obsah inspirovaný Webix ScrollView —
						karty vedle sebe/pod sebou nebo libovolně velké volné plátno,
						tažení myší, přichytávání na položky a šipky prev/next.
					<span class="card-desc">
					</span>
					<span class="card-path">/devel/test/scrollview</span>
				</a>
				<a class="card" href="/devel/test/template">
					<span class="card-icon qpxicon qpxicon-template qpxicon-xl"></span>
					<span class="card-title">Template</span>
					<span class="card-desc">Vykreslení HTML podle šablony a dat, proměnné #var# / {var}, setValues().</span>
					<span class="card-path">/devel/test/template</span>
				</a>

			</div>

			<h2 class="group-title">Navigace</h2>
			<div class="grid" data-group="navigace">
				<a class="card" href="/devel/test/breadcrumb">
					<span class="card-icon qpxicon qpxicon-breadcrumb qpxicon-xl"></span>
					<span class="card-title">qpBreadcrumb</span>
					<span class="card-desc">
						Navigační "drobečková" stezka inspirovaná KendoUI Breadcrumb a Fluent2 Breadcrumb —
						klikatelné položky, aktuální (poslední) položka jako nezvýrazněný text a automatické
						sbalení prostředních položek do "..." při nedostatku místa.
					</span>
					<span class="card-path">/devel/test/breadcrumb</span>
				</a>
				<a class="card" href="/devel/test/ribbon">
					<span class="card-icon qpxicon qpxicon-ribbon qpxicon-xl"></span>
					<span class="card-title">qpRibbon</span>
					<span class="card-desc">
						"Pás karet" ve stylu MS Office (Word/Excel Online)
					</span>
					<span class="card-path">/devel/test/ribbon</span>
				</a>
				<a class="card" href="/devel/test/tabview">
					<span class="card-icon qpxicon qpxicon-tabview qpxicon-xl"></span>
					<span class="card-title">qpTabView</span>
					<span class="card-desc">Záložky s obsahem panelů, posuvný indikátor, responzivní scroll a klávesová navigace.</span>
					<span class="card-path">/devel/test/tabview</span>
				</a>
				<a class="card" href="/devel/test/toolbar">
					<span class="card-icon qpxicon qpxicon-toolbar qpxicon-xl"></span>
					<span class="card-title">qpToolBar</span>
					<span class="card-desc">Panel nástrojů s položkami before/center/after a přetečením do menu „⋮“.</span>
					<span class="card-path">/devel/test/toolbar</span>
				</a>
			</div>

			<h2 class="group-title">Ovládací prvky</h2>
			<div class="grid" data-group="controls">
				<a class="card" href="/devel/test/button">
					<span class="card-icon qpxicon qpxicon-button qpxicon-xl"></span>
					<span class="card-title">Button</span>
					<span class="card-desc">Typy, stylingMode, ikony, disabled/enabled, vlastní template.</span>
					<span class="card-path">/devel/test/button</span>
				</a>
				<a class="card" href="/devel/test/buttongroup">
					<span class="card-icon qpxicon qpxicon-buttongroup qpxicon-xl"></span>
					<span class="card-title">ButtonGroup</span>
					<span class="card-desc">selectionMode: single / multiple / none, výběr klíčů položek.</span>
					<span class="card-path">/devel/test/buttongroup</span>
				</a>
				<a class="card" href="/devel/test/dropdownbutton">
					<span class="card-icon qpxicon qpxicon-dropdownbutton qpxicon-xl"></span>
					<span class="card-title">DropDownButton</span>
					<span class="card-desc">Split tlačítko, useSelectMode, rozbalovací menu položek.</span>
					<span class="card-path">/devel/test/dropdownbutton</span>
				</a>
			</div>

			<h2 class="group-title">Editační prvky</h2>
			<div class="grid" data-group="editors">
				<a class="card" href="/devel/test/autocomplete">
					<span class="card-icon qpxicon qpxicon-autocomplete qpxicon-xl"></span>
					<span class="card-title">qpAutocomplete</span>
					<span class="card-desc">Textové pole s automatickým našeptáváním, hodnotou je vždy zadaný text.</span>
					<span class="card-path">/devel/test/autocomplete</span>
				</a>
				<a class="card" href="/devel/test/colorpicker">
					<span class="card-icon qpxicon qpxicon-colorpalette qpxicon-xl"></span>
					<span class="card-title">qpColorPicker</span>
					<span class="card-desc">...</span>
					<span class="card-path">/devel/test/colorpicker</span>
				</a>
				<a class="card" href="/devel/test/checkbox">
					<span class="card-icon qpxicon qpxicon-checkbox qpxicon-xl"></span>
					<span class="card-title">qpCheckBox</span>
					<span class="card-desc">...</span>
					<span class="card-path">/devel/test/checkbox</span>
				</a>
				<a class="card" href="/devel/test/datepicker">
					<span class="card-icon qpxicon qpxicon-datepicker qpxicon-xl"></span>
					<span class="card-title">qpDatePicker</span>
					<span class="card-desc">
					Segmentované datumové/časové pole s popup kalendářem — klik na segment, šipky, psaní číslic,
					popup pro datum i čas.
					</span>
					<span class="card-path">/devel/test/datepicker</span>
				</a>

				<a class="card" href="/devel/test/dropdownbox">
					<span class="card-icon qpxicon qpxicon-dropdownbox qpxicon-xl"></span>
					<span class="card-title">qpDropDownBox</span>
					<span class="card-desc">Pole otvírající popup s libovolným vlastním obsahem (treeview, grid...).</span>
					<span class="card-path">/devel/test/dropdownbox</span>
				</a>
				<a class="card" href="/devel/test/lookup">
					<span class="card-icon qpxicon qpxicon-lookup qpxicon-xl"></span>
					<span class="card-title">qpLookup</span>
					<span class="card-desc">Výběr položky přes vystředěný popup s hledáním v hlavičce, volitelně s tlačítky Hotovo/Zrušit.</span>
					<span class="card-path">/devel/test/lookup</span>
				</a>
				<a class="card" href="/devel/test/numberbox">
					<span class="card-icon qpxicon qpxicon-numberbox qpxicon-xl"></span>
					<span class="card-title">qpNumberBox</span>
					<span class="card-desc">...</span>
					<span class="card-path">/devel/test/numberbox</span>
				</a>
				<a class="card" href="/devel/test/selectbox">
					<span class="card-icon qpxicon qpxicon-selectbox qpxicon-xl"></span>
					<span class="card-title">qpSelectBox</span>
					<span class="card-desc">Výběr jedné položky z rozbalovacího seznamu, volitelně s vyhledáváním.</span>
					<span class="card-path">/devel/test/selectbox</span>
				</a>
				<a class="card" href="/devel/test/switch">
					<span class="card-icon qpxicon qpxicon-switch qpxicon-xl"></span>
					<span class="card-title">qpSwitch</span>
					<span class="card-desc">Booleovský přepínač (on/off) s vlastním textem stavů a stylingMode.</span>
					<span class="card-path">/devel/test/switch</span>
				</a>
				<a class="card" href="/devel/test/tagbox">
					<span class="card-icon qpxicon qpxicon-tagbox qpxicon-xl"></span>
					<span class="card-title">qpTagBox</span>
					<span class="card-desc">Vícenásobný výběr zobrazený jako tagy, hledání, vlastní hodnoty, maxDisplayedTags.</span>
					<span class="card-path">/devel/test/tagbox</span>
				</a>
				<a class="card" href="/devel/test/textbox">
					<span class="card-icon qpxicon qpxicon-textbox qpxicon-xl"></span>
					<span class="card-title">qpTextBox</span>
					<span class="card-desc">Vícenásobný výběr zobrazený jako tagy, hledání, vlastní hodnoty, maxDisplayedTags.</span>
					<span class="card-path">/devel/test/textbox</span>
				</a>

			</div>

			<h2 class="group-title">Data</h2>
			<div class="grid" data-group="data">
				<a class="card" href="/devel/test/datagrid">
					<span class="card-icon qpxicon qpxicon-datagrid qpxicon-xl"></span>
					<span class="card-title">qpDataGrid</span>
					<span class="card-desc">Tabulka s řazením, výběrem řádků a adaptivním accordion detailem.</span>
					<span class="card-path">/devel/test/datagrid</span>
				</a>
				<a class="card" href="/devel/test/grouplist">
					<span class="card-icon qpxicon qpxicon-tree qpxicon-xl"></span>
					<span class="card-title">qpGroupList</span>
					<span class="card-desc">Seznam se skupinami a "lepivými" záhlaví, boční rychlý index, single/multi výběr.</span>
					<span class="card-path">/devel/test/grouplist</span>
				</a>
				<a class="card" href="/devel/test/propertygrid">
					<span class="card-icon qpxicon qpxicon-propertygrid qpxicon-xl"></span>
					<span class="card-title">qpPropertyGrid</span>
					<span class="card-desc">Vlastnosti seskupené do kategorií, editace přímo v mřížce pomocí odpovídajícího qpx editoru</span>
					<span class="card-path">/devel/test/propertygrid</span>
				</a>
				<a class="card" href="/devel/test/treeview">
					<span class="card-icon qpxicon qpxicon-treeview qpxicon-xl"></span>
					<span class="card-title">qpTreeView</span>
					<span class="card-desc">Stromová struktura, checkboxy, výběr, drag &amp; drop.</span>
					<span class="card-path">/devel/test/treeview</span>
				</a>
			</div>
			<h2 class="group-title">Ostatní</h2>
			<div class="grid" data-group="other">
				<a class="card" href="/devel/test/syntaxeditor">
					<span class="card-icon qpxicon qpxicon-syntaxeditor qpxicon-xl"></span>
					<span class="card-title">qpSyntaxEditor</span>
					<span class="card-desc">Editor programovacích jazyků se zvýrazněnou syntaxy</span>
					<span class="card-path">/devel/test/syntaxeditor</span>
				</a>
			</div>
		</main>

		<footer>QPX framework — interní vývojářský rozcestník. Verze CSS/JS buildu se řídí parametrem <code>?build=${ timeNo }</code>.</footer>

		<script>
		$(function () {
			// ------------------------------------------------------------
			// Horní panel: přepínač tématu (theme) + filtr skupin widgetů
			// (jen ukázka použití qpToolBar/buttonGroup na téhle stránce,
			// funkčně jde čistě o rozcestník s odkazy na /devel/test/*)
			// ------------------------------------------------------------
			function applyTheme(themeKey) {
				$("body")
					.removeClass("qpx-theme-generic-light qpx-theme-generic-dark")
					.addClass("qpx-theme-" + themeKey);
				$("body").toggleClass("qpx-page-dark", themeClass === "qpx-theme-generic-dark");
				toolbar.option("theme", themeKey);
			}

			var toolbar = qpx.ui({
				view: "qpToolBar",
				theme: "generic-light",
				items: [{
						location: "before", widget: "template",
						template: "<b style='padding:0 4px;'>QPX Demo</b>"
				}, {
					location: "before", widget: "buttonGroup",
					options: {
						items: [
							{ text: "Vše", key: "all" },
							{ text: "Struktura", key: "layout" },
							{ text: "Navigace", key: "navigace" },
							{ text: "Ovládací prvky", key: "controls" },
							{ text: "Editační prvky", key: "editors" },
							{ text: "Data", key: "data" }
						],
						selectedItemKeys: ["all"],
						onSelectionChanged: function (e) {
							var key = e.component.getSelectedItemKeys()[0] || "all";
							$(".grid").each(function () {
								var group = $(this).data("group");
								$(this).toggle(key === "all" || key === group);
							});
						}
					}
				}, {
					location: "after",
					widget: "dropDownButton",
					options: {
							items: [
								{ text: "Světlé", key: "generic-light" },
								{ text: "Tmavé", key: "generic-dark" }
							],
							selectedItemKeys: ["generic-light"],
							onSelectionChanged: function (e) {
								/*
								var theme = e.component.getSelectedItemKeys()[0] || "generic-light";
								toolbar.option("theme", theme);
								$("body").attr("data-theme", theme === "generic-dark" ? "dark" : "light");
								*/
								var key = e.component.getSelectedItemKeys()[0] || "generic-light";
								applyTheme(key);
							}
						}
					}
				]
			}, "#pageToolbar");
		});
		</script>
	</body>
</html>
