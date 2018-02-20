import html from "../lib/html";
import append from "../lib/append";
import eventable from "../mixins/eventable";
import gui_helpers from "../mixins/gui_helpers";
import get from "lodash/get";
import each from "lodash/each";
import licenseHTML, {isUnfree} from "../license";

/**
 * Borrows a `<tr>` from a temp table..
 * This doesn't work in html: `html(`<tr />`)[0]`
 */
const tr = (str = "") => html(`<table><tr ${str}></tr></table>`)[0].querySelectorAll("tr")[0];

/**
 * Borrows a `<td>` from a temp table..
 * This doesn't work in html: `html(`<td />`)[0]`
 */
const td = (str = "") => html(`<table><tr><td ${str}></td></tr></table>`)[0].querySelectorAll("td")[0];

/**
 * Borrows a `<th>` from a temp table..
 * This doesn't work in html: `html(`<th />`)[0]`
 */
const th = (str = "") => html(`<table><tr><th ${str}></th></tr></table>`)[0].querySelectorAll("th")[0];

const not_specified = () => html(`<em>Not specified</em>`);

/**
 * Platforms this widget shows.
 */
const PLATFORMS = [
	// "i686-linux",
	// "aarch64-linux",
	"x86_64-linux",
];

const hydraLink = (attribute, platform, branch) => `https://hydra.nixos.org/job/nixos/${branch}/nixpkgs.${attribute}.${platform}`;

const githubLink = (commit, position) => `https://github.com/NixOS/nixpkgs/blob/${commit}/${position.replace(":", "#L")}`;

/**
 * One result line.
 */
class Result {
	constructor(result, {odd}) {
		this.result = result;
		eventable(this);
		gui_helpers(this);

		const classes = [isUnfree(result["meta"]["license"]) ? "is-unfree" : "is-free"];

		const $row = tr(`class="result ${odd ? "odd" : "even"} ${classes.join(" ")}"`);
		[
			"name",
			"attr",
			"meta.description",
		].forEach((attr) => {
			const $td = td();
			if (get(result, attr)) {
				$td.innerText = get(result, attr);
			}
			$row.appendChild($td);
		});

		const $details_row = tr(`class="details is-hidden ${odd ? "odd" : "even"} ${classes.join(" ")}"`);
		$details_row.appendChild(td(`colspan="3"`));
		$details_row.querySelectorAll("td")[0]
			.appendChild(html(`
			<div class="search-details">
				<table>
				<tbody>
				</tbody>
				</table>
			</div>
			`)[0]);
		const $details = $details_row.querySelectorAll(".search-details tbody")[0];
		each({
			"install": "Install command",
			"unfree": "unfree",
			"meta_position": "Nix expression",
			"meta_platforms": "Platforms",
			"meta_homepage": "Homepage",
			"meta_license": "License",
			"meta_maintainers": "Maintainers",
			"meta_long_description": "Long description",
		}, (label, attr) => {
			const $tr = tr();

			if (attr === "unfree") {
				if (isUnfree(get(result, "meta.license"))) {
					const $td = td(`colspan="2" className="unfree-note"`);
					append(
						$td,
						html(`
							<em>
								This package is unfree.
								See <a href="https://nixos.org/nixpkgs/manual/#sec-allow-unfree">chapter 6.2</a> of
								the manual for more informations.
							</em>
						`)
					);
					$tr.appendChild($td);
				}   
			}
			else {
				const $th = th();
				$tr.appendChild($th);
				$th.innerText = label;

				const $td = td();
				$tr.appendChild($td);
				const fn = "node_" + attr;
				if (this[fn]) {
					append($td, this[fn]());
				}
				else {
					append($td, html("<code>TODO</code>"));
				}
			}

			$details.appendChild($tr);
		});

		this.$nodes = [
			$row,
			$details_row,
		];

		this.$details_row = $details_row;
		this.$row = $row;

		$row.addEventListener("click", (...args) => this.on_click(...args));
	}

	on_click(...args) {
		const {shown} = this;
		this.sendEvent("click", ...args);
		this.shown = shown;
		this.toggle();
	}

	show() {
		this.shown = true;
		this.$details_row.classList.remove("is-hidden");
	}

	hide() {
		this.shown = false;
		this.$details_row.classList.add("is-hidden");
	}

	toggle() {
		if (this.shown) {
			this.hide();
		}
		else {
			this.show();
		}
	}

	node_install() {
		const {result} = this;
		// FIXME : fetch likely channel name (nixpkgs/nixos)
		const channel = "nixos";
		const node = html(`
			<tt>
				<span class="command">
					nix-env -iA ${channel}.<span class="attrname"></span>
				</span>
			</tt>
			<em class="muted">(NixOS channel)</em>
		`);
		node[0].querySelectorAll(".attrname")[0].innerText = result["attr"];

		return node;
	}

	node_meta_position() {
		const {result} = this;
		const {meta: {position}} = result;

		// FIXME : get the commit in a less hacky manner
		const commit = window.APP.channel_data["commit"];

		if (!position) {
			return not_specified();
		}

		const $link = html(`<a />`);
		$link[0].innerText = position.replace(/:[0-9]+$/, "");
		$link[0].href = githubLink(commit, position||"");

		return $link;
	}

	node_meta_platforms() {
		const {result} = this;
		const {attr, meta: {platforms}} = result;
		// FIXME : fetch branch name.
		const branch = "release-17.09";

		if (!platforms || platforms.length < 1) {
			return not_specified();
		}

		const $list = html(`<ul class="platforms-list" />`);

		append(
			$list[0],
			platforms
				.filter((platform) => PLATFORMS.indexOf(platform) > -1)
				.map((platform) => {
					const $li = html(`<li />`)[0];
					const $link = html(`<a />`)[0];
					$link.appendChild(html(`<tt>${platform}</tt>`)[0]);
					$link.href = hydraLink(attr, platform, branch);
					$li.appendChild($link);

					return $li;
				})
		);

		return $list;
	}

	node_meta_homepage() {
		const {result} = this;
		const {meta: {homepage}} = result;

		if (homepage && homepage.length > 0) {
			const $link = html(`<a />`);
			$link[0].innerText = homepage;
			$link[0].href = homepage;
			$link[0].rel = "nofollow";

			return $link;
		}

		return not_specified();
	}

	node_meta_license() {
		const {result} = this;
		const {meta: {license}} = result;

		if (license) {
			return licenseHTML(license);
		}

		return not_specified();
	}

	node_meta_maintainers() {
		const {result} = this;
		const {meta: {maintainers}} = result;

		if (maintainers && maintainers.length > 0) {
			const $span = html(`<span />`);
			$span[0].innerText = maintainers.join(", ");

			return $span;
		}

		return not_specified();
	}

	node_meta_long_description() {
		const {result} = this;
		const {meta: {longDescription}} = result;

		if (longDescription && longDescription.length > 0) {
			const $pre = html(`<pre />`);
			$pre[0].innerText = longDescription;

			return $pre;
		}

		return not_specified();
	}
}

export default Result;
