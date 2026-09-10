import { useState, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import { Marked } from 'marked'; // import the Marked class
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import { highlightCode } from './utils/highlighter.js';
import DOMPurify from 'dompurify';
import { sanitizeAIMath } from './utils/mathSanitizer.js';
import { getDocumentStats } from './utils/documentStats.js';
import { handleTabIndentation } from './utils/editorKeyHandlers.js';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';


const markedParser = new Marked();

markedParser.use({ breaks: true });
markedParser.use(markedKatex({ throwOnError: false }));
markedParser.use(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    return highlightCode(code, lang);
  }
}));

// Automatically open external links in a new tab safely with noopener noreferrer
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    const href = node.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  }
});

const EXAMPLE_MD = `this app is coded by @SuryanshSwarn`;
const DRAFT_STORAGE_KEY = 'markdown-pdf:draft';

function App() {
  const [markdown, setMarkdown] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      return saved !== null ? saved : EXAMPLE_MD;
    } catch {
      return EXAMPLE_MD;
    }
  });
  const deferredMarkdown = useDeferredValue(markdown);
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [theme, setTheme] = useState('dark');
  
  // State to track which modal is currently open ('privacy', 'terms', 'clear', or null)
  const [activeModal, setActiveModal] = useState(null);
  const [lastClearedContent, setLastClearedContent] = useState(null);
  
  const editorRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handle Escape key to dismiss modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeModal]);

  // Auto-save draft to localStorage whenever markdown changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, markdown);
        setSaveStatus('Saved');
      } catch {
        setSaveStatus('Unsaved');
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [markdown]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleEditorChange = (event) => {
    setMarkdown(event.target.value);
  };

  const handleEditorKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const textarea = editorRef.current;
      if (!textarea) return;

      const { newText, newSelectionStart, newSelectionEnd, handled } = handleTabIndentation({
        value: markdown,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
        shiftKey: event.shiftKey,
      });

      if (handled) {
        setMarkdown(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newSelectionStart, newSelectionEnd);
        }, 0);
      }
    }
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
    if (!markdown.trim()) return;
    setActiveModal('clear');
  };

  const handleConfirmClear = (restoreDefault = false) => {
    setLastClearedContent(markdown);
    setMarkdown(restoreDefault ? EXAMPLE_MD : '');
    setActiveModal(null);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleRestoreCleared = () => {
    if (lastClearedContent !== null) {
      setMarkdown(lastClearedContent);
      setLastClearedContent(null);
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const parsedHTML = useMemo(() => {
    const processedMarkdown = sanitizeAIMath(deferredMarkdown);
    const rawHTML = markedParser.parse(processedMarkdown);
    return DOMPurify.sanitize(rawHTML, {
      USE_PROFILES: { html: true, mathMl: true, svg: true },
    });
  }, [deferredMarkdown]);

  const stats = useMemo(() => getDocumentStats(markdown), [markdown]);

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
          {lastClearedContent && markdown === '' && (
            <button className="restore-btn" onClick={handleRestoreCleared} title="Restore cleared text">
              ↩ Undo Clear
            </button>
          )}
          <button className="print-btn" onClick={handlePrint} title="Print or Save as PDF">
            Print PDF
          </button>
          <button 
            className="clear-btn" 
            onClick={handleClear} 
            title={markdown.trim() ? "Clear Editor" : "Editor is empty"}
            disabled={!markdown.trim()}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="split-layout">
        <div className="pane editor-pane">
          <div className="pane-header">
            <div className="pane-title-group">
              <span className="pane-title">Markdown Editor</span>
              <span className="save-status-pill" title="Saved locally in browser storage">
                ✓ {saveStatus}
              </span>
            </div>
            <div className="doc-stats">
              <span className="stat-pill" title="Word count">{stats.words} words</span>
              <span className="stat-pill" title="Character count">{stats.characters} chars</span>
              <span className="stat-pill stat-time" title="Estimated reading time">{stats.readingTime}</span>
            </div>
          </div>
          <textarea
            ref={editorRef}
            className="editor-input"
            value={markdown}
            onChange={handleEditorChange}
            onKeyDown={handleEditorKeyDown}
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

      {/* GitHub Profile Button */}
      <div className="github-profile-wrapper">
        <a
          href="https://github.com/SuryanshSwarn09"
          target="_blank"
          rel="noopener noreferrer"
          className="github-profile-btn"
        >
          {/* My pfp Icon */}
          <img
            src="pfp.png" 
            alt="GitHub Profile"
          />

          {/* Tooltip / Label */}
          <div className="github-profile-tooltip">
            <p>CODED BY SURYANSH</p>
          </div>
        </a>
      </div>

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

            {activeModal === 'clear' && (
              <>
                <h2>Clear Document?</h2>
                <p>Are you sure you want to clear your current document? All unprinted or uncopied text in the editor will be removed.</p>
                <br/>
                <div className="modal-actions">
                  <button 
                    className="modal-danger-btn" 
                    onClick={() => handleConfirmClear(false)}
                  >
                    Clear Everything
                  </button>
                  <button 
                    className="modal-secondary-btn" 
                    onClick={() => handleConfirmClear(true)}
                  >
                    Reset to Default Example
                  </button>
                </div>
              </>
            )}

            <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
              {activeModal === 'clear' ? 'Cancel' : 'Close'}
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;