# EventHub Report

This folder contains the LaTeX sources for the final EventHub report and presentation.

## Files

- `report.tex`: report source with the appendix attached after the main 6--8 page body
- `report.pdf`: compiled report PDF including the appendix
- `presentation/presentation.tex`: Beamer presentation source
- `presentation/presentation.pdf`: compiled presentation

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
- Attached Appendix

## Build

```bash
mkdir -p build
xelatex -interaction=nonstopmode -output-directory=build report.tex
xelatex -interaction=nonstopmode -output-directory=build report.tex
cp build/report.pdf report.pdf
```

The second XeLaTeX pass resolves the table of contents and long-table references.
