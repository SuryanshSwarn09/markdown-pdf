# MARKDOWN LATEX PDF GENERATOR
*A minimal web app to preview Markdown and LaTeX math instantly.*

**Project:01**
_March 2026_

### Live demo: [Markdown Latex Pdf](https://markdown-pdf-self.vercel.app/)
---

![Article cover](https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fc8v4m7qd6tv1drasw3il.png)

### Dev.to article: [Stop Fighting AI Formatting: How I Built a "Sanitizer" for Messy AI Markdown](https://dev.to/suryansh_swarn/stop-fighting-ai-formatting-how-i-built-a-sanitizer-for-messy-ai-markdown-3ooh)

> This project is developed throughout march 2026 to achieve practical fluency, increase my learning and getting comfortable with the framework and language also i am writing every update i have done with dates in this webapp.

### Tech stack 
_`React` `Vite` `marked.js` `highlight.js` `KaTeX` `DOMPurify`_

---
### Features:

* **Publication Print Typography:** Optimized `@media print` layout replacing bulky fonts with standard publication sizing (10.5pt body, 9.5pt code), page-break avoidance on headings and blocks, and syntax color preservation.
* **One-Click Markdown Download (`.md`):** Instant download of the active document with smart filename slugification derived from the top heading.
* **Standalone HTML Export (`.html`):** Export complete, self-contained HTML documents with inlined KaTeX math stylesheets and publication typography for offline reading and sharing.
* **Rich HTML Clipboard Copy:** One-click button copying rich HTML to the clipboard (supporting both `text/html` and `text/plain`) with visual feedback, ready to paste directly into Medium, Dev.to, Google Docs, or email.
* **Auto-Save & Recovery:** Continuous `localStorage` persistence with a visual `✓ Saved` indicator; drafts seamlessly restore across refreshes and restarts.
* **Accidental Clear Protection:** Two-step confirmation modal on Clear and an instant `↩ Undo Clear` restore action to prevent data loss.
* **Preserved Undo History (`Ctrl+Z` / `Cmd+Z`):** Toolbar formatting preserves the browser's native `<textarea>` undo/redo history.
* **Tab & Shift+Tab Indentation:** Indent and unindent code and text by 2 spaces (supporting multi-line blocks) without losing editor focus.
* **Live Document Metrics:** Real-time word count, character count, and estimated reading time badges in the editor header.
* **Modular Code Highlighting:** Fast, lightweight syntax color-coding via modular Highlight.js core supporting Web, Scripting, Backend, and Systems languages with graceful fallback.
* **AI Auto-Formatter:** Safely sanitizes AI-generated LaTeX math delimiters (`\[...\]` and `\(...\)`) while preserving code blocks, inline code, and JSON structures.
* **XSS Defense:** Full DOMPurify sanitization pipeline securing rendered preview output.
* **Zero-Lag Typing:** React 19 `useDeferredValue` decoupling keystroke input from math parsing and syntax rendering.
* **Code-Split Architecture:** Main app entry trimmed to <13 kB with isolated vendor bundles for React, KaTeX, Markdown, and Highlighting.
* **Smart Toolbar:** One-click insertion for formatting, code blocks, and equations.
* **Liquid Glass UI:** Responsive, Apple-inspired frosted glass aesthetic with Light/Dark modes.
* **PWA:** _`10 May 26`_ Look at the far right side of the URL address bar. You should now see a little screen icon with a down arrow. If you hover over it, it will say "Install markdown-pdf".
* **Comprehensive Test Suite:** 5 unit test suites (`npm test`) covering math sanitization, syntax highlighting, document metrics, keyboard indentation, and export utilities.

---

### Scripts

* `npm run dev` - Start local development server
* `npm run build` - Produce code-split production bundle
* `npm test` - Run full unit test suite
* `npm run lint` - Run ESLint checks

---


> Funcfact: this readme file is also edited first on the [markdown-pdf](https://url.com) webapp after that i pasted the result in vscode.

---

### Flow:

```mermaid
graph TD
    %% User Interaction
    A[User Input] -->|Types keystroke| B(React useState)
    
    %% Processing Pipeline
    B -->|Raw String| C[AI Math Sanitizer & Code Masker]
    C -->|Sanitized String| D{Marked.js Parser}
    
    %% Parser Extensions
    D -->|Markdown Math| E[KaTeX Engine]
    D -->|Code Blocks| F[Highlight.js Engine]
    D -->|Standard Markdown| G[HTML Generator]
    
    %% Output & Security Pipeline
    E --> H((Raw HTML Output))
    F --> H
    G --> H
    
    H -->|HTML Sanitization| I[DOMPurify Engine]
    I -->|Safe HTML| J[dangerouslySetInnerHTML]
    J --> K[Live DOM Preview]

    %% Styling
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef react fill:#61dafb,stroke:#000,color:#000;
    classDef logic fill:#f5a623,stroke:#000,color:#fff;
    classDef security fill:#2ecc71,stroke:#000,color:#fff;
    
    class B,J react;
    class C,D logic;
    class I security;
```