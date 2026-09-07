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

* **Live Rendering:** Real-time Markdown and KaTeX math preview.
* **Code Highlighting:** Automatic syntax color-coding via Highlight.js.
* **AI Auto-Formatter:** Safely sanitizes AI-generated LaTeX math delimiters (`\[...\]` and `\(...\)`) while preserving code blocks, inline code, and JSON structures.
* **XSS Defense:** Full DOMPurify sanitization pipeline securing rendered preview output.
* **Smart Toolbar:** One-click insertion for formatting, code blocks, and equations.
* **PDF Export:** Optimized `@media print` stylesheets for clean document saving.
* **Liquid Glass UI:** Responsive, Apple-inspired frosted glass aesthetic with Light/Dark modes.
* **PWA:** _`10 May 26`_ Look at the far right side of the URL address bar. You should now see a little screen icon with a down arrow. If you hover over it, it will say "Install markdown-pdf".

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