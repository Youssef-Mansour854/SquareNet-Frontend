const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "src");

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;

  // Buttons matching bg-amber-500 text-white combinations
  content = content.replace(
    /bg-amber-500 text-white/g,
    "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900",
  );
  content = content.replace(
    /text-white bg-amber-500/g,
    "text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-100",
  );

  // Hover effects combining bg-amber and text-white
  content = content.replace(
    /hover:bg-amber-500 hover:text-white/g,
    "hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900",
  );
  content = content.replace(
    /group-hover:bg-amber-500 group-hover:text-white/g,
    "group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900",
  );

  // Specific single utility replacements
  content = content.replace(
    /text-amber-500/g,
    "text-zinc-900 dark:text-zinc-100",
  );
  content = content.replace(
    /text-amber-600/g,
    "text-zinc-800 dark:text-zinc-200",
  );
  content = content.replace(
    /bg-amber-500\/10/g,
    "bg-zinc-900/10 dark:bg-zinc-100/10",
  );
  content = content.replace(
    /bg-amber-500\/20/g,
    "bg-zinc-900/20 dark:bg-zinc-100/20",
  );
  content = content.replace(/bg-amber-500/g, "bg-zinc-900 dark:bg-zinc-100");
  content = content.replace(/bg-amber-100/g, "bg-zinc-200 dark:bg-zinc-800");
  content = content.replace(/bg-amber-50/g, "bg-zinc-100 dark:bg-zinc-900");

  content = content.replace(
    /hover:text-amber-500/g,
    "hover:text-zinc-900 dark:hover:text-zinc-100",
  );
  content = content.replace(
    /hover:text-amber-600/g,
    "hover:text-zinc-800 dark:hover:text-zinc-200",
  );
  content = content.replace(
    /hover:bg-amber-500/g,
    "hover:bg-zinc-900 dark:hover:bg-zinc-100",
  );
  content = content.replace(
    /hover:bg-amber-600/g,
    "hover:bg-zinc-800 dark:hover:bg-zinc-200",
  );

  content = content.replace(
    /border-amber-500/g,
    "border-zinc-900 dark:border-zinc-100",
  );
  content = content.replace(
    /border-amber-600/g,
    "border-zinc-800 dark:border-zinc-200",
  );
  content = content.replace(
    /hover:border-amber-500/g,
    "hover:border-zinc-900 dark:hover:border-zinc-100",
  );
  content = content.replace(
    /focus:border-amber-500/g,
    "focus:border-zinc-900 dark:focus:border-zinc-100",
  );

  content = content.replace(
    /focus:ring-amber-500/g,
    "focus:ring-zinc-900 dark:focus:ring-zinc-100",
  );
  content = content.replace(
    /peer-checked:bg-amber-50/g,
    "peer-checked:bg-zinc-200 dark:peer-checked:bg-zinc-800",
  );
  content = content.replace(
    /peer-checked:border-amber-500/g,
    "peer-checked:border-zinc-900 dark:peer-checked:border-zinc-100",
  );
  content = content.replace(
    /peer-checked:text-amber-600/g,
    "peer-checked:text-zinc-900 dark:peer-checked:text-zinc-100",
  );

  content = content.replace(
    /fill-amber-500/g,
    "fill-zinc-900 dark:fill-zinc-100",
  );
  content = content.replace(
    /group-hover\/btn:fill-amber-500/g,
    "group-hover/btn:fill-zinc-900 dark:group-hover/btn:fill-zinc-100",
  );

  // Fix potential double dark:dark
  content = content.replace(/dark:dark:/g, "dark:");
  content = content.replace(
    /dark:text-white dark:dark:text-zinc-900/g,
    "dark:text-zinc-900",
  );
  content = content.replace(
    /dark:hover:text-white dark:hover:text-zinc-900/g,
    "dark:hover:text-zinc-900",
  );
  content = content.replace(
    /dark:hover:bg-amber-600/g,
    "dark:hover:bg-zinc-200",
  ); // manual cleanup if left

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${filePath}`);
  }
};

const walkSync = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkSync(filePath);
    } else if (filePath.endsWith(".jsx") || filePath.endsWith(".js")) {
      replaceInFile(filePath);
    }
  }
};

walkSync(directoryPath);
console.log("Theme replacement complete.");
