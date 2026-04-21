# MARKDOWN LATEX PDF GENERATOR
*A minimal web app to preview Markdown and LaTeX math instantly.*

**[Project:01]**
_March 2026_

### Live demo: [Markdown Latex Pdf](https://markdown-pdf-self.vercel.app/)

> This project is developed throughout march 2026 to achieve practical fluency, increase my learning and getting comfortable with the framework and language also i am writing every update i have done with dates in this webapp.

### Tech stack 
_React, Vite, marked.js, higlight.js, KaTex_

---
### Features:

* **Live Rendering:** Real-time Markdown and KaTeX math preview.
* **Code Highlighting:** Automatic syntax color-coding via Highlight.js.
* **AI Auto-Formatter:** Instantly sanitizes broken AI-generated math brackets.
* **Smart Toolbar:** One-click insertion for formatting, code blocks, and equations.
* **PDF Export:** Optimized `@media print` stylesheets for perfect document saving.
* **Liquid Glass UI:** Responsive, Apple-inspired frosted glass aesthetic with persistent Light/Dark modes.

---


> Funcfact: this readme file is also edited first on the [markdown-pdf](https://url.com) webapp after that i pasted the result in vscode.

---

### Flow:


    graph TD
    %% User Interaction
    A[User Input] -->|Types keystroke| B(React useState)
    
    %% Processing Pipeline
    B -->|Raw String| C[RegEx Sanitizer]
    C -->|Sanitized String| D{Marked.js Parser}
    
    %% Parser Extensions
    D -->|Markdown Math| E[KaTeX Engine]
    D -->|Code Blocks| F[Highlight.js Engine]
    D -->|Standard Markdown| G[HTML Generator]
    
    %% Output
    E --> H((React useMemo))
    F --> H
    G --> H
    
    H -->|Caches Output| I[dangerouslySetInnerHTML]
    I --> J[Live DOM Preview]

    %% Styling
    classDef default fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef react fill:#61dafb,stroke:#000,color:#000;
    classDef logic fill:#f5a623,stroke:#000,color:#fff;
    
    class B,H,I react;
    class C,D logic;