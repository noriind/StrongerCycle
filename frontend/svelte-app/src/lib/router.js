import { writable } from "svelte/store";

function currentPath() {
	return (
		window.location.pathname + window.location.search + window.location.hash
	);
}

export const path = writable(currentPath());

function setPath(url, { replace = false } = {}) {
	if (replace) history.replaceState(null, "", url);
	else history.pushState(null, "", url);
	path.set(currentPath());
}

export function navigate(to, opts) {
	setPath(to, opts);
}

export function link(node) {
	function onClick(e) {
		if (
			e.defaultPrevented ||
			e.button !== 0 ||
			e.metaKey ||
			e.altKey ||
			e.ctrlKey ||
			e.shiftKey
		)
			return;
		const href = node.getAttribute("href");
		if (!href || href.startsWith("http") || href.startsWith("//")) return;
		e.preventDefault();
		navigate(href);
	}
	node.addEventListener("click", onClick);
	return {
		destroy() {
			node.removeEventListener("click", onClick);
		},
	};
}

window.addEventListener("popstate", () => path.set(currentPath()));
