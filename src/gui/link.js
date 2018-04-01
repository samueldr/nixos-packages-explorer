import html from "../lib/html";
import eventable from "../mixins/eventable";
import gui_helpers from "../mixins/gui_helpers";
import App from "../app";

/**
 * A real link which manipulates the global state.
 *
 * When clicked, it is handled by the app.
 *
 * Copying the link or opening a new tab (ctrl+click, middle click) should work
 * as expected.
 */
class Link {
	constructor(text, {className = "", state = {}, keep = [], replace = false}) {
		eventable(this);
		gui_helpers(this);
		this.$node = html(`<a />`)[0];
		this.$node.className = className;
		this.$node.innerText = text;

		const app_state = App.app.state;
		this.$node.href = app_state.link_to_state({
			state,
			keep,
			replace
		});

		this.$node.addEventListener("click", (event) => {
			event.preventDefault();
			app_state.set_state(
				app_state.combine_state({
					state,
					keep,
					replace
				}
				),
				{replace: true}
			);

			return false;
		});
	}
}

export default Link;
