<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix = "c" uri = "http://java.sun.com/jsp/jstl/core" %>
<%
System.out.println("/devel/layout.jsp");
%>
<!DOCTYPE html>
<html lang="cs">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>qpx — layout</title>

		<link rel="icon" href="/devel/favicon.png">
		<link rel="stylesheet" href="/devel/libs/fonts/fontawesome/4.7/css/font-awesome.min.css" type="text/css" media="all" />
		<link rel="stylesheet" href="/devel/libs/qpx/themes/jquery.qpx.default.css?build=${ timeNo }" rel="stylesheet" type="text/css">

		<style type="text/css">
			html, body { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; margin: 0; background:#f4f6f8; color:#222; }
			h1 { font-size: 20px; padding: 16px 20px 4px; }
			h2 { font-size: 15px; margin: 24px 20px 8px; color:#555; }
			section { margin: 0 20px 20px; background:#fff; border:1px solid #e2e6ea; border-radius:6px; overflow:hidden; }
			.demo { height: 220px; border:1px solid #dfe3e8; }
			.toolbar { background:#2f3b52; color:#fff; }
			.sidebar { background:#f0f2f5; }
			.card { padding:14px; }
			.card h3 { margin:0 0 6px; font-size:14px; }
			.card p { margin:0; font-size:12px; color:#666; }
			.pane { padding:10px; }
			.pane.a { background:#eef7ee; }
			.pane.b { background:#eef2f7; }
			.pane.c { background:#f7f0ee; }
			.qpx-back-home {
				font-size: 20px;
				text-decoration: none;
				padding: 6px 10px;
			}
			.qpx-back-home:hover {
				background: #fff;
				color: #000;
			}		
		</style>
	
		<script type="text/javascript" src="/devel/libs/jquery/jquery-3.7.1.js"></script>
		<script type="text/javascript" src="/devel/libs/qpx/jquery.qpx.all.js"></script>
	</head>
	<body class="qpx-view">
		<!-- návratová ikona vlevo nahoře -->
		<div style="height: 36px; position: absolute; top: 0; left: 0; right: 0; border-bottom: 1px solid &dedede;">
			<a href="/devel/" class="qpx-back-home" title="Zpět na hlavní stránku">
				<span class="fa fa-home"></span>
			</a>
		</div>
		<div style="min-height: 320px; position: absolute; top: 36px; left: 0; right: 0; border: 0; border: 0px solid red;">
			<h1>qpx.Layout — testovací stránka</h1>
	
			<!-- ============================================================ -->
			<h2>1) rows + cols, pevná šířka vs. gravity (rostoucí buňka)</h2>
			<section>
				<div id="app1" class="demo"></div>
			</section>
	
			<!-- ============================================================ -->
			<h2>2) type: "space" a type: "line" (mezery / oddělovací čáry)</h2>
			<section style="padding:16px;">
				<div id="app2" style="height:70px; margin-bottom:12px;"></div>
				<div id="app3" style="height:70px;"></div>
			</section>
	
			<!-- ============================================================ -->
			<h2>3) spacer (prázdná flexibilní buňka) a hidden</h2>
			<section style="padding:16px;">
				<div id="app4" style="height:60px;"></div>
			</section>
	
			<!-- ============================================================ -->
			<h2>4) responsive cols (zužte okno prohlížeče)</h2>
			<section>
				<div id="app5" class="demo"></div>
			</section>
		</div>

		<script>
		$(function () {
			// 1) základní rows/cols s toolbarem, sidebarem a rostoucí kartou
			qpx.ui({
				rows: [
					{ view: "template", height: 44, css: "toolbar",
					  template: "<div style='padding:10px 14px;'>Horní panel (height:44)</div>" },
					{
						cols: [
							{ view: "template", width: 180, css: "sidebar",
							  template: "<div style='padding:12px;'>Postranní panel<br>(width:180)</div>" },
							{ view: "template", gravity: 1, css: "card",
							  template: "<h3>#title#</h3><p>#text#</p>",
							  data: { title: "Hlavní obsah", text: "Roste podle gravity:1." } }
						]
					}
				]
			}, "#app1");

			// 2) type: space / line
			qpx.ui({
				type: "space", gap: 10,
				cols: [
					{ view: "template", css: "pane a", template: "A" },
					{ view: "template", css: "pane b", template: "B" },
					{ view: "template", css: "pane c", template: "C" }
				]
			}, "#app2");

			qpx.ui({
				type: "line",
				cols: [
					{ view: "template", css: "pane a", template: "A" },
					{ view: "template", css: "pane b", template: "B" },
					{ view: "template", css: "pane c", template: "C" }
				]
			}, "#app3");

			// 3) spacer + hidden
			qpx.ui({
				cols: [
					{ view: "template", width: 120, css: "pane a", template: "vlevo (120px)" },
					{}, // spacer — vyplní volný prostor
					{ view: "template", width: 120, css: "pane c", template: "vpravo (120px)" },
					{ view: "template", width: 120, css: "pane b", template: "skrytá", hidden: true }
				]
			}, "#app4");

			// 4) responsive
			qpx.ui({
				cols: [
					{ view: "template", css: "pane a", gravity: 1, template: "<div style='padding:12px;'>Sloupec 1</div>" },
					{ view: "template", css: "pane b", gravity: 1, template: "<div style='padding:12px;'>Sloupec 2</div>" },
					{ view: "template", css: "pane c", gravity: 1, template: "<div style='padding:12px;'>Sloupec 3</div>" }
				],
				responsive: true
			}, "#app5");
		});
		</script>
	</body>
</html>
