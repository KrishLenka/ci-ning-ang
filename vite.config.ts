import path from "node:path";
import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { meta } from "./src/content/meta";

/** Writes the page title, description and robots tag from src/content/meta.ts into index.html. */
function siteMeta(): Plugin {
  return {
    name: "site-meta",
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [
        { tag: "title", children: meta.title, injectTo: "head-prepend" },
        { tag: "meta", attrs: { name: "description", content: meta.description }, injectTo: "head" },
      ];
      if (meta.noindex) {
        tags.push({ tag: "meta", attrs: { name: "robots", content: "noindex" }, injectTo: "head" });
      }
      return tags;
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMeta()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
