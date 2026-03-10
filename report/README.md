# EventHub Report

This folder contains the clean LaTeX writing template for the final project report.

## Files

- `report.tex`: editable report source
- `report.pdf`: compiled preview

## Writing Structure

- Introduction
- Backend
  - Django
  - Node.js and Express
- Frontend
  - HTML
  - CSS
  - React
- Integration and Deployment
- Conclusion
- Appendix

## Build

```bash
mkdir -p build
xelatex -interaction=nonstopmode -output-directory=build report.tex
xelatex -interaction=nonstopmode -output-directory=build report.tex
cp build/report.pdf report.pdf
```

The second XeLaTeX pass resolves the table of contents and long-table references.
