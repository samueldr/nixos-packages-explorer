//
// Code lifted from current nixos.org website.
//

// Try to figure out a human-readable name for a license object.
// Use the SPDX ID if present; failing that try the long or short names. If all
// else fails fall back on URL.
function licenseName(license) {
	return license.spdxId
		|| license.fullName
		|| license.shortName
		|| license.url
		|| "Licence name missing!";
}

// Given a license, or array of licenses, generate and return a DOM node
// containing information about it/them.
// A license can be a plain string (in which case it returns the string itself
// as a text node), or a license object, in which case it attempts to construct
// a link to the license's URL (if specified).
const License = ({license}) => {
	if (!license) { return null; }
	if (typeof license === "string") {
		return license;
	}
	if (Array.isArray(license)) {
		return (
			<ul>
				{license.map((license, key) => <li key={key}><License license={license} /></li>)}
			</ul>
		);
	}

	if (license.url) {
		return (
			<a
				href={license.url}
			>
				{licenseName(license)}
			</a>
		);
	} else {
		return licenseName(license);
	}
}

// Shortcut to use in <Maybe>.
const maybeLicense = (license) => license && <License license={license} />;

const isUnfree = (license) => license && license.free === false;

export default License;

export {maybeLicense, isUnfree};
