const requiredMajor = 22;
const currentMajor = Number.parseInt(process.versions.node.split(".")[0], 10);

if (currentMajor !== requiredMajor) {
  console.error(
    [
      "",
      `This project requires Node.js ${requiredMajor}.x.`,
      `Current version: ${process.version}`,
      "",
      "Fix:",
      "  nvm use",
      '  or: export PATH="/opt/homebrew/opt/node@22/bin:$PATH"',
      "",
    ].join("\n"),
  );
  process.exit(1);
}
