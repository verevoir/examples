// No-op shim for sharp in the browser.
// @nextlake/assets dynamically imports sharp for image dimension extraction.
// In the browser, dimensions come back as null — this is expected.
export default null;
