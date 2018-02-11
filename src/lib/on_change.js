const on_change = (el, fn) => {
	if (el.nodeName === "INPUT" &&
		(el.type === "radio" || el.type === "checkbox")
	) {
		return el.addEventListener("change", (e) => {
			const {target} = e;
			const value = target.checked;
			return fn(value, e);
		});
	}

	return el.addEventListener("input", (e) => {
		const {target} = e;
		const {value} = target;
		return fn(value, e);
	});
};

export default on_change;
