#!/usr/bin/env node
// A plain stylesheet that redefines a class owned by the Tailwind component
// layer wins or loses purely on bundle order, which is how a legacy
// `.btn-primary { width: 100px }` silently deformed every button in the app.
// Fail loudly instead of debugging it by eye again.

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
const COMPONENT_LAYER = path.join(SRC, "styles", "tailwind.css");

const ownedClasses = (() => {
  const css = fs.readFileSync(COMPONENT_LAYER, "utf8");
  const componentsLayer = css.slice(css.indexOf("@layer components"));
  const names = new Set();
  const selector = /^\s{2}(?:[a-z]+)?\.([a-zA-Z0-9_-]+)/gm;
  let match;
  while ((match = selector.exec(componentsLayer))) names.add(match[1]);
  return names;
})();

const stylesheets = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".css") && !full.startsWith(path.join(SRC, "styles")))
      stylesheets.push(full);
  }
})(SRC);

const collisions = [];
for (const file of stylesheets) {
  const css = fs.readFileSync(file, "utf8");
  const selector = /(^|[\s,>+~}])\.([a-zA-Z0-9_-]+)/g;
  let match;
  while ((match = selector.exec(css))) {
    if (ownedClasses.has(match[2])) {
      collisions.push(`${path.relative(SRC, file)} redefines .${match[2]}`);
    }
  }
}

if (ownedClasses.size === 0) {
  console.error("No component classes parsed from tailwind.css — check the regex.");
  process.exit(1);
}

if (collisions.length) {
  console.error("Stylesheets collide with Tailwind component classes:");
  for (const collision of new Set(collisions)) console.error(`  ${collision}`);
  process.exit(1);
}

console.log(
  `OK: ${stylesheets.length} stylesheets, none redefine the ${ownedClasses.size} Tailwind component classes.`,
);
