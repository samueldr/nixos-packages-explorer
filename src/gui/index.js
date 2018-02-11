import bsod from "../lib/bsod";
import html from "../lib/html";
import app_html from "./app.part.html";

/**
 */
class Gui {
	constructor() {
		console.log("Creating interface...."); // eslint-disable-line
		this.$app = window.document.querySelectorAll("#packages-explorer .app")[0];

		if (!this.$app) {
			return bsod("Couldn't hook app.");
		}

		// Hooks app's DOM.
		this.$app.innerHTML = "";
		this.$app.appendChild(html(app_html)[0]);

		console.log("...interface created."); // eslint-disable-line
	}
}

export default Gui;
