import bsod from "../lib/bsod";
import each from "lodash/each";

/**
 * Adds "DOM-like" functions on `this`.
 *
 * this.$node is part of the semi-public API.
 *
 * Use of $node is sane, but should be avoided.
 */
const gui_helpers = (self) => {
	each(
		// Functions to mix in.
		{
			appendChild(gui_node) {
				if (gui_node.$node) {
					this.$node.appendChild(gui_node.$node);
					return gui_node;
				}
				return this.$node.appendChild(gui_node);
			},
			removeChild(gui_node) {
				if (gui_node.$node) {
					this.$node.removeChild(gui_node.$node);
					return gui_node;
				}
				return this.$node.removeChild(gui_node);
			},
			mount(selector) {
				// Hooks this class' node to an existing element.
				this.$node = window.document.querySelectorAll(selector)[0];

				// Asserts it is hooked.
				if (!this.$node) {
					return bsod("Couldn't hook app.");
				}

				// Inserts this app's HTML.
				// FIXME : Allow mounting with a Node
				this.$node.innerHTML = "";
			},
		},
		// Mixing in all those.
		(fn, name) => {
			self[name] = fn.bind(self);
		}
	);
};

export default gui_helpers;
