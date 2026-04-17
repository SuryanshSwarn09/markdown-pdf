# Markdown & LaTeX Previewer

Responsive Markdown editor built with React and Vite. A minimal web app to preview Markdown and LaTeX math instantly. No signup. No API. Just write, format, and print.

**[View Live Demo](https://markdown-pdf-self.vercel.app/)**

v.1.3 | Coded by [@SuryanshSwarn](https://github.com/SuryanshSwarn09)

---

## Features

* **Live Preview** – See rendered output instantly as you type.
* **Code Syntax Highlighting** – Automatic, language-detected syntax highlighting for code blocks via Highlight.js (Atom One Dark theme).
* **Full Math Support** – Render complex LaTeX equations seamlessly using KaTeX.
* **AI Auto-Formatter** – Automatically detects and corrects mismatched AI math brackets (e.g., converting `\[` and `\]` into renderable syntax).
* **Formatting Toolbar** – One-click insertion for:
  * H1, H2, H3 headings
  * Bold, Italic, Strikethrough
  * Code blocks
  * Blockquote, List Item, Link
  * Math Equations
* **Print to PDF** – Engineered with optimized `@media print` stylesheets featuring readable `pt` font sizing.
* **N-up Printing** – Save paper by splitting output into multiple columns during print.
* **Light / Dark Mode** – Smooth, animated theme toggling with persistent local storage.
* **Clean, Responsive UI** – Custom CSS architecture featuring a Shadcn-inspired neutral palette and Apple "Liquid Glass" backdrop filters.
* **Zero Friction** – No authentication, no ads, no watermarks.

---

## Tech Stack

* **React (Vite)** – Frontend framework and build tool
* **marked.js** – Extensible Markdown parser
* **KaTeX** – High-performance math rendering
* **Highlight.js** – Code syntax highlighting
* **Vanilla CSS** – Zero-dependency custom styling and animations
* **Vercel** – Static deployment and hosting

---

## How It Works

1. **Write Markdown and LaTeX** in the editor pane on the left.
2. **Observe the rendered preview** update live in the right pane.
3. **Utilize the toolbar** to quickly insert formatting without manually typing syntax.
4. **Click "Print PDF"** to export or print a perfectly formatted document.
5. *Note: Everything is processed client-side. No data is ever uploaded or stored externally.*

---

## Privacy

This application operates entirely within your browser. All text processing and rendering happens locally on your device. No analytics are collected, and no data is sent to any server.

---

## Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your local machine.

### Installation
  ```bash
  #clone the repo
  git clone https://github.com/SuryanshSwarn09/markdown-pdf.git
  
  #navigate to the directory
  cd markdown-pdf
  
  #install dependencies
  npm install

  #run locally
  npm run dev

  Open your browser and visit http://localhost:5173 to see the app running!