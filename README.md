Responsive Markdown editor built with React and Vite. A minimal web app to preview Markdown and LaTeX math instantly. No signup. No API. Just write, format, and print.
`v.2 (UI Change)` | Coded by @SuryanshSwarn

**[View Live Demo](https://markdown-pdf-self.vercel.app/)** 

---

## Features

* **Live preview** – see rendered output as you type.
* **Full Math Support** – render complex LaTeX equations using KaTeX.
* **AI Auto-Formatter** – automatically corrects mismatched AI math brackets (like `\[` and `\]`).
* **Formatting toolbar** – one-click insert for:
  * H1, H2, H3 headings
  * Bold, Italic, Strikethrough
  * Inline code
  * Blockquote, List Item, Link
  * Math Equations
* **Print to PDF** – optimized print stylesheets with readable `pt` font sizing.
* **N-up Printing** – save paper by splitting output into multiple columns.
* **Light / Dark Mode** – smooth, animated theme toggling.
* **Clear** – reset the editor instantly.
* **Clean, responsive UI** – Shadcn-inspired neutral aesthetics.
* **Zero friction** – No authentication, no ads, no watermarks.

---

## Tech Stack

* **React (Vite)**
* **marked.js** (Markdown parser)
* **KaTeX** (Math rendering)
* **Vanilla CSS** (Shadcn-inspired theme)
* **Vercel** (Static deploy)

---

## How It Works

1. **Write Markdown and LaTeX** in the editor on the left.
2. **See the rendered preview** update live on the right.
3. **Use the toolbar** to insert formatting without typing syntax.
4. **Click "Print PDF"** to save a perfectly formatted document.
5. *Everything is processed client-side. Nothing is uploaded.*

---

## Privacy

All processing happens locally in your browser. No data is sent to any server.

---

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

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
  