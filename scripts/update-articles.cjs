const fs = require("fs");
const path = require("path");

const pairings = {
  "json-debugging-guide": {
    title: "JSON Debugging Guide",
    desc: "Fix and prevent common JSON errors in API development.",
    tag: "Data",
    tools: ["json-formatter", "json-yaml", "jwt-decoder"]
  },
  "web-encoding-guide": {
    title: "Web Encoding Explained",
    desc: "Base64, URL encoding, HTML entities — when to use each.",
    tag: "Encoding",
    tools: ["base64-converter", "url-encode", "html-entities"]
  },
  "text-processing-guide": {
    title: "Text Processing for Developers",
    desc: "Regex, case conversion, deduplication — practical workflows.",
    tag: "Text",
    tools: ["regex-tester", "text-case", "dedupe-lines"]
  },
  "password-hash-guide": {
    title: "Password Security & Hash Algorithms",
    desc: "MD5 vs SHA-256, password best practices, UUIDs explained.",
    tag: "Security",
    tools: ["password-generator", "hash-generator", "uuid-generator"]
  },
  "css-color-gradient-guide": {
    title: "CSS Colors & Gradients Guide",
    desc: "HEX, RGB, HSL explained. Build palettes and gradients.",
    tag: "Frontend",
    tools: ["color-picker", "css-gradient", "color-palette"]
  }
};

function articleCard(href, title, desc, tag) {
  return '<a href="' + href + '" class="group"><div class="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 dark:bg-gray-900 dark:border-gray-800 dark:hover:border-blue-600"><div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all dark:bg-blue-600/20 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg></div><div><span class="text-xs text-blue-500 font-medium">' + tag + '</span><h4 class="text-sm font-semibold text-gray-900 mt-1 dark:text-white">' + title + '</h4><p class="text-xs text-gray-500 mt-1 dark:text-gray-400">' + desc + '</p></div></div></a>';
}

const dir = "src/pages/tools";
let updated = 0;

for (var guideId in pairings) {
  var guide = pairings[guideId];
  for (var i = 0; i < guide.tools.length; i++) {
    var toolId = guide.tools[i];
    var f = path.join(dir, toolId, "index.astro");
    if (!fs.existsSync(f)) { console.log("MISSING: " + f); continue; }
    var c = fs.readFileSync(f, "utf8");

    var sectionStart = c.indexOf('<section slot="relatedArticles"');
    if (sectionStart === -1) { console.log("NO SECTION: " + toolId); continue; }

    var sectionEnd = c.indexOf('</section>', sectionStart);
    if (sectionEnd === -1) continue;

    var href = "/guides/" + guideId + "/";
    var card = articleCard(href, guide.title, guide.desc, guide.tag);
    var newSection = '<section slot="relatedArticles" class="mb-10">\n    <h2 class="text-2xl font-bold text-gray-900 mb-6 dark:text-white">Related Articles</h2>\n    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">\n      ' + card + '\n      ' + card + '\n    </div>\n  </section>';

    c = c.substring(0, sectionStart) + newSection + c.substring(sectionEnd + '</section>'.length);
    fs.writeFileSync(f, c);
    updated++;
    console.log("Updated: " + toolId + " -> " + guideId);
  }
}
console.log("\nTotal updated: " + updated + " tool pages");
