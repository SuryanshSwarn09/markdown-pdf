import { useState, useMemo, useRef, useEffect } from 'react';
import { Marked } from 'marked'; // CHANGED: We now import the Marked class
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';


const markedParser = new Marked();

markedParser.use({ breaks: true });
markedParser.use(markedKatex({ throwOnError: false }));
markedParser.use(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

const EXAMPLE_MD = `this app is coded by @SuryanshSwarn`;

function App() {
  const [markdown, setMarkdown] = useState(EXAMPLE_MD);
  const [theme, setTheme] = useState('dark');
  
  // State to track which modal is currently open ('privacy', 'terms', or null)
  const [activeModal, setActiveModal] = useState(null);
  
  const editorRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleEditorChange = (event) => {
    setMarkdown(event.target.value);
  };

  const handleFormat = (prefix, suffix = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    const fallbackText = selectedText.length === 0 && suffix !== '' ? 'text' : selectedText;
    
    const newText = 
      markdown.substring(0, start) + 
      prefix + 
      fallbackText + 
      suffix + 
      markdown.substring(end);

    setMarkdown(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length, 
        start + prefix.length + fallbackText.length
      );
    }, 0);
  };

  const handleClear = () => {
    setMarkdown('');
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const parsedHTML = useMemo(() => {
    let processedMarkdown = markdown;

    // AI Math Bracket fix
    processedMarkdown = processedMarkdown
      .replace(/\\\[/g, '$$$$') 
      .replace(/\\\]/g, '$$$$') 
      .replace(/\\\(/g, '$')    
      .replace(/\\\)/g, '$');   

    processedMarkdown = processedMarkdown
      .replace(/^\s*\[\s*$/gm, '$$$$') 
      .replace(/^\s*\]\s*$/gm, '$$$$');

    // CHANGED: We now use our local markedParser instead of the global marked object
    return markedParser.parse(processedMarkdown);
  }, [markdown]);

  return (
    <div className="app-container">
      
      <div className="top-bar">
        <div className="toolbar">
          <button onClick={() => handleFormat('# ', '')} title="Heading 1">H1</button>
          <button onClick={() => handleFormat('## ', '')} title="Heading 2">H2</button>
          <button onClick={() => handleFormat('### ', '')} title="Heading 3">H3</button>
          <div className="divider"></div>
          <button onClick={() => handleFormat('**', '**')} title="Bold">B</button>
          <button onClick={() => handleFormat('_', '_')} title="Italic">I</button>
          <button onClick={() => handleFormat('~~', '~~')} title="Strikethrough">~~</button>
          <button onClick={() => handleFormat('```\n', '\n```')} title="Code Block">`</button>
          <div className="divider"></div>
          <button onClick={() => handleFormat('> ', '')} title="Blockquote">&gt;</button>
          <button onClick={() => handleFormat('- ', '')} title="List Item">—</button>
          <button onClick={() => handleFormat('[', '](https://url.com)')} title="Link">[]</button>
          <div className="divider"></div>
          <button onClick={() => handleFormat('$$ \n', '\n$$')} title="Math Equation">Σ</button>
          
          <div className="divider"></div>
          <button onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="action-buttons">
          <button className="print-btn" onClick={handlePrint} title="Print or Save as PDF">
            Print PDF
          </button>
          <button className="clear-btn" onClick={handleClear} title="Clear Editor">
            Clear
          </button>
        </div>
      </div>

      <div className="split-layout">
        <div className="pane editor-pane">
          <div className="pane-header">
            <span className="pane-title">Markdown Editor</span>
          </div>
          <textarea
            ref={editorRef}
            className="editor-input"
            value={markdown}
            onChange={handleEditorChange}
            placeholder="Type your markdown here..."
          />
        </div>

        <div className="pane preview-pane">
          <div className="pane-header">
            <span className="pane-title">Live Preview</span>
          </div>
          <div 
            className="preview-output" 
            dangerouslySetInnerHTML={{ __html: parsedHTML }} 
          />
        </div>
      </div>

      {/* Footer Links for the Legal Pages */}
      <div className="footer-links">
        <button onClick={() => setActiveModal('privacy')}>Privacy Policy</button>
        <button onClick={() => setActiveModal('terms')}>Terms & Conditions</button>
      </div>

      <a 
        href="https://github.com/SuryanshSwarn09" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="floating-signature"
        title="Visit my GitHub!"
      >
        Coded by @Suryansh
      </a>

      {/* The Modal Overlay System */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            
            {activeModal === 'privacy' && (
              <>
                <h2>Privacy Policy</h2>
                <p><strong>Last Updated:</strong> April 2026</p>
                <br/>
                <p><strong>1. Data Collection:</strong> This Markdown Previewer is a client-side application. We do not collect, store, or transmit any personal data, text, or documents you write within this application. All text processing and rendering happens locally on your device within your web browser.</p>
                <br/>
                <p><strong>2. Cookies and Tracking:</strong> This application does not use cookies, web beacons, or any third-party tracking software to monitor your behavior.</p>
                <br/>
                <p><strong>3. Hosting Provider:</strong> This application is hosted on Vercel. While the app itself collects no data, the hosting provider may collect basic, anonymous access logs (such as IP addresses and browser types) strictly necessary for serving the website securely. Please refer to Vercel's privacy policy for more information.</p>
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <h2>Terms and Conditions</h2>
                <p><strong>Last Updated:</strong> April 2026</p>
                <br/>
                <p><strong>1. Acceptance of Terms:</strong> By accessing and using this Markdown Previewer, you accept and agree to be bound by the terms and provision of this agreement.</p>
                <br/>
                <p><strong>2. Use of the Application:</strong> This tool is provided completely free of charge for personal or commercial use. You may use it to draft, format, and print Markdown and LaTeX documents.</p>
                <br/>
                <p><strong>3. Content Ownership:</strong> You retain 100% ownership and copyright of any text, code, or equations you write using this tool. Because the app does not save your work to a server, it is solely your responsibility to save, print, or backup your work before closing the browser tab. We are not responsible for any lost data.</p>
                <br/>
                <p><strong>4. Limitation of Liability:</strong> In no event shall the creator of this application be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of this application.</p>
              </>
            )}

            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>Close</button>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;