import html from "./lib/html";
//
// Code lifted from current nixos.org website.
//

// Try to figure out a human-readable name for a license object.
// Use the SPDX ID if present; failing that try the long or short names. If all
// else fails fall back on URL.
function licenseName(license) {
	return license.spdxId ||
		license.fullName ||
		license.shortName ||
		license.url ||
		"Licence name missing!";
}

// Given a license, or array of licenses, generate and return a DOM node
// containing information about it/them.
// A license can be a plain string (in which case it returns the string itself
// as a text node), or a license object, in which case it attempts to construct
// a link to the license's URL (if specified).
const licenseHTML = (license) => {
	if (!license) {
		return null;
	}

	if (typeof license === "string") {
		const $span = html(`<span />`);
		$span[0].innerText = license;

		return $span;
	}

	if (Array.isArray(license)) {
		const $ul = html(`<ul />`);
		license.forEach((l) => {
			const $li = html(`<li />`)[0];
			$li.appendChild(licenseHTML(l)[0]);
			$ul[0].appendChild($li);
		});

		return $ul;
	}

	if (license.url) {
		const $link = html(`<a />`);
		$link[0].innerText = licenseName(license);
		$link[0].href = license["url"];
		$link[0].rel = "nofollow";

		return $link;
	} 
	const $span = html(`<span />`);
	$span[0].innerText = licenseName(license);

	return $span;
	
};

const isUnfree = (license) => license && license.free === false;

export default licenseHTML;

export {isUnfree};
