$(function () {
	// -------------------------------------------------------------
	// TOPBAR – qpToolBar s breadcrumb + dropdown Styl
	// -------------------------------------------------------------
	qpx.ui({
		view: "qpToolBar",
		theme: "generic-light",
		items: [{
			location: "before",
			widget: "qpBreadcrumb",
			options: {
			items: [
				{ id: "home", text: "", icon: "qpxicon qpxicon-home qpxicon-md", url: "/devel" },
				{ id: "qpWidget", text: "" + widgetName }
			]}
		}, {
			location: "after",
			widget: "qpDropDownButton",
			options: {
				text: "Styl",
				stylingMode: "text",
				items: [
					{ key: "light", text: "Light" },
					{ key: "dark", text: "Dark" }
				],
				useSelectMode: false,
				onItemClick: function (e) {
					var key = e.itemData.key;
					var themeClass = key === "dark"
						? "qpx-theme-generic-dark"
						: "qpx-theme-generic-light";

					$(".qpx-test-content")
						.removeClass("qpx-theme-generic-light qpx-theme-generic-dark")
						.addClass(themeClass);

					$("body").toggleClass("qpx-page-dark", key === "dark");
				}
			}
		}]
	}, "#pageTopbar");
});

function applyTheme(themeClass) {
	$(".qpx-test-content")
		.removeClass("qpx-theme-generic-light qpx-theme-generic-dark")
		.addClass(themeClass);
	toolbar.option("theme", themeClass.replace("qpx-theme-", ""));
	// zpětně kompatibilní přepínač pro topbar (viz qpx-test.css)
	$("body").toggleClass("qpx-page-dark", themeClass === "qpx-theme-generic-dark");
}