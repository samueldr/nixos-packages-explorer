import App from "./app";
import "./lib/polyfills/fetch";

/**
 * Entry-point of the application.
 *
 * If any polyfilling is needed, do it here.
 * Then, start the app.
 */

// Starts the app.
window.APP = new App();
