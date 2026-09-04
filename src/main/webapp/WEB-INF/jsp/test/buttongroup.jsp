<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix = "c" uri = "http://java.sun.com/jsp/jstl/core" %>
<%
System.out.println("/devel/buttongroup.jsp");
%>
<!DOCTYPE html>
<html lang="cs">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<title>qpx — buttonGroup</title>

		<link rel="icon" href="/devel/favicon.png">
		<link rel="stylesheet" href="/devel/libs/fonts/fontawesome/4.7/css/font-awesome.min.css" type="text/css" media="all" />
		<link rel="stylesheet" href="/devel/libs/qpx/themes/jquery.qpx.default.css?build=${ timeNo }" rel="stylesheet" type="text/css">

		<style type="text/css">
			html, body { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; margin: 0; background:#f4f6f8; color:#222; }
			h1 { font-size: 20px; padding: 16px 20px 4px; }
			h2 { font-size: 15px; margin: 24px 20px 8px; color:#555; }
			main { padding: 8px 24px 60px; max-width: 760px; }
			section { margin: 0 20px 20px; background:#fff; border:1px solid #e2e6ea; border-radius:6px; padding:16px; }
			.row { display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-bottom:10px; }
			.log { margin-top:10px; padding:8px 12px; background:#1e1e1e; color:#9cdcfe; font-family:monospace; font-size:12px; min-height:20px; border-radius:4px; }
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
			<h1>qpx.ButtonGroup — testovací stránka</h1>
			<main>
				<!-- ============================================================ -->
				<h2>1) selectionMode: single</h2>
				<section>
					<div id="single" class="row"></div>
					<div id="log1" class="log">Vyber období...</div>
				</section>
		
				<!-- ============================================================ -->
				<h2>2) selectionMode: multiple</h2>
				<section>
					<div id="multiple" class="row"></div>
					<div id="log2" class="log">Vyber filtry...</div>
				</section>
		
				<!-- ============================================================ -->
				<h2>3) selectionMode: none (jen kliky, bez výběru) + disabled položka</h2>
				<section>
					<div id="noneMode" class="row"></div>
					<div id="log3" class="log">...</div>
				</section>
		
				<!-- ============================================================ -->
				<h2>4) API — getSelectedItemKeys() / option()</h2>
				<section>
					<div class="row">
						<button id="btnGet" type="button">getSelectedItemKeys()</button>
						<button id="btnDisable" type="button">enable() / disable()</button>
					</div>
					<div id="log4" class="log">...</div>
				</section>
			</main>
		</div>

		<script>
		$(function () {
			var single = qpx.ui({
				view: "buttonGroup",
				selectionMode: "single",
				stylingMode: "outlined",
				items: [
					{ text: "Den", key: "day" },
					{ text: "Týden", key: "week" },
					{ text: "Měsíc", key: "month" }
				],
				selectedItemKeys: ["week"],
				onSelectionChanged: function (e) {
					$("#log1").text("selectionChanged — added: " + JSON.stringify(e.addedItemKeys) +
						", removed: " + JSON.stringify(e.removedItemKeys));
				}
			}, "#single");

			qpx.ui({
				view: "buttonGroup",
				selectionMode: "multiple",
				stylingMode: "contained",
				items: [
					{ text: "Aktivní", key: "active" },
					{ text: "Archiv", key: "archived" },
					{ text: "Smazané", key: "deleted", disabled: true }
				],
				onSelectionChanged: function (e) {
					$("#log2").text("aktuálně vybráno: " + JSON.stringify(e.component.getSelectedItemKeys()));
				}
			}, "#multiple");

			qpx.ui({
				view: "buttonGroup",
				selectionMode: "none",
				items: [
					{ text: "Akce A", key: "a" },
					{ text: "Akce B", key: "b" },
					{ text: "Akce C (disabled)", key: "c", disabled: true }
				],
				onItemClick: function (e) {
					$("#log3").text("itemClick: " + e.itemData.text);
				}
			}, "#noneMode");

			$("#btnGet").on("click", function () {
				$("#log4").text("single.getSelectedItemKeys() = " + JSON.stringify(single.getSelectedItemKeys()));
			});
			$("#btnDisable").on("click", function () {
				single.option("disabled") ? single.enable() : single.disable();
				$("#log4").text("disabled = " + single.option("disabled"));
			});
		});
		</script>
	</body>
</html>
