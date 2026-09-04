/**
 * QPX Test Pages - společná logika pro testovací stránky komponent
 * Včetně přepínání stylování Light / Dark v topbaru vpravo
 */

function applyTheme(theme) {
	var isDark = theme === "dark" ||
		theme === "qpx-theme-dark" ||
		theme === "generic-dark" ||
		theme === "qpx-theme-generic-dark";

	var activeTheme = isDark ? "dark" : "light";
	var themeClass = isDark ? "qpx-theme-dark" : "qpx-theme-light";

	try {
		localStorage.setItem("qpx-theme", activeTheme);
	} catch (e) {}

	// Aplikace tématu na body, html i obsahové elementy
	$("body, .qpx-test-content")
		.removeClass("qpx-theme-light qpx-theme-dark qpx-theme-generic-light qpx-theme-generic-dark")
		.addClass(themeClass);

	document.documentElement.setAttribute("data-qpx-theme", activeTheme);
	$("body").toggleClass("qpx-page-dark", isDark);

	// Synchronizace selectu v topbaru
	var $select = $("#themeSelect");
	if ($select.length && $select.val() !== activeTheme) {
		$select.val(activeTheme);
	}

	// Synchronizace toolbaru na stránce, pokud existuje
	if (window.toolbar && typeof window.toolbar.option === "function") {
		try { window.toolbar.option("theme", activeTheme); } catch (e) {}
	}
	if (window.toolbarWidget && typeof window.toolbarWidget.option === "function") {
		try { window.toolbarWidget.option("theme", activeTheme); } catch (e) {}
	}
}

$(function () {
	// Pokud topbar existuje, ale ještě nemá select vpravo, automaticky jej doplníme
	var $topbar = $(".qpx-test-topbar");
	if ($topbar.length && $("#themeSelect").length === 0) {
		var $right = $(
			'<div class="qpx-topbar-right">' +
				'<label for="themeSelect" class="qpx-theme-label">Styl:</label>' +
				'<select id="themeSelect" class="qpx-theme-select" aria-label="Přepnout styl">' +
					'<option value="light">Light</option>' +
					'<option value="dark">Dark</option>' +
				'</select>' +
			'</div>'
		);
		$topbar.append($right);
	}

	// Obsluha změny v selectu
	$(document).on("change", "#themeSelect", function () {
		applyTheme($(this).val());
	});

	// Načtení a aplikace preferovaného tématu
	var savedTheme = "light";
	try {
		savedTheme = localStorage.getItem("qpx-theme") || "light";
	} catch (e) {}

	applyTheme(savedTheme);
});
