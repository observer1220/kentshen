// @vitest-environment node
//
// The build-time renderer (src/entry-server.jsx) runs in Node with no window or
// document. If a component starts touching the browser during render, the build
// breaks — this test catches that before deploy.
import { describe, it, expect } from "vitest";
import { render, routes } from "../entry-server";

describe("pre-rendering", () => {
  it("renders every route without a browser", () => {
    expect(typeof window).toBe("undefined");
    for (const r of routes()) {
      expect(render(r.path).length, r.path).toBeGreaterThan(200);
    }
  });

  it("lists home, blog, contact, about, privacy and every post, each with its own title", () => {
    const list = routes();
    const paths = list.map((r) => r.path);
    for (const p of ["/", "/blog", "/contact", "/about", "/privacy"]) expect(paths).toContain(p);
    expect(paths.some((p) => /^\/blog\/[^/]+$/.test(p))).toBe(true);
    expect(new Set(list.map((r) => r.title)).size).toBe(list.length);
    for (const r of list) expect(r.description.length, r.path).toBeGreaterThan(10);
  });

  it("puts real page content in the HTML, not just an empty shell", () => {
    expect(render("/")).toContain("UNDERCURRENT");
    expect(render("/about")).toContain("Kent Shen");
    expect(render("/privacy")).toContain("Google AdSense");
    expect(render("/privacy")).toContain("adssettings.google.com");
  });
});
