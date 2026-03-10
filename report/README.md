# EventHub Report

This folder contains the main LaTeX report for `soroosh_branch`.

## Structure

- `report.tex`: the source document
- `report.pdf`: compiled output kept at the folder root

The document is organized into:

- a `Backend` section with `Django` and `Node.js and Express`
- a `Frontend` section with `HTML`, `CSS`, and `React`
- an appendix for learning notes, practice commands, and active-learning prompts

## Build

```bash
mkdir -p build
xelatex -interaction=nonstopmode -output-directory=build report.tex
xelatex -interaction=nonstopmode -output-directory=build report.tex
cp build/report.pdf report.pdf
```

The second XeLaTeX pass resolves the table of contents and long-table references.
