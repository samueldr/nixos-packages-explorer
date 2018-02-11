import ready from "./lib/ready";
import Gui from "./gui";
import "./styles";

/**
 */
class App {
	constructor() {
		// Only "boot" the app when the DOM is ready.
		ready(() => this.boot());
	}

	/**
	 * Hooks and starts the app.
	 *
	 * This means:
	 *   * Starts the GUI.
	 *   * Reads parameters.
	 */
	boot() {
		this.gui = new Gui();
	}
}

export default App;
