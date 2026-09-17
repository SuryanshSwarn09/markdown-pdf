import { useState, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import { Marked } from 'marked'; // import the Marked class
import markedKatex from 'marked-katex-extension';
import { markedHighlight } from 'marked-highlight';
import { highlightCode } from './utils/highlighter.js';
import DOMPurify from 'dompurify';
import { sanitizeAIMath } from './utils/mathSanitizer.js';
import { getDocumentStats } from './utils/documentStats.js';
import { handleTabIndentation } from './utils/editorKeyHandlers.js';
import { extractDocTitle, slugifyTitle, generateStandaloneHTML, downloadBlob, copyRichHTML } from './utils/exportUtils.js';
import { getInitialTheme, saveTheme, listenToSystemTheme, THEME_KEY } from './utils/themeUtils.js';
import { calculateScrollPercentage, calculateTargetScrollTop, getSyncScrollPreference, saveSyncScrollPreference } from './utils/scrollSync.js';
import { 
  SunIcon, 
  MoonIcon, 
  DownloadIcon, 
  FileCodeIcon, 
  CopyIcon, 
  CheckIcon, 
  PrinterIcon, 
  TrashIcon, 
  UndoIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  CodeIcon,
  QuoteIcon,
  ListIcon,
  LinkIcon,
  MathIcon,
  CheckCircleIcon, 
  SyncScrollIcon 
} from './components/Icons.jsx';
import PrintModal from './components/PrintModal.jsx';
import { 
  getStoredPrintOptions, 
  saveStoredPrintOptions, 
  generatePrintCSS, 
  PRINT_PRESETS 
} from './utils/printOptions.js';
import { slugifyHeading } from './utils/tocGenerator.js';
import 'katex/dist/katex.min.css';


const markedParser = new Marked();

let headingSlugCounts = new Map();

markedParser.use({ breaks: true });
markedParser.use(markedKatex({ throwOnError: false }));
markedParser.use(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    return highlightCode(code, lang);
  }
}));
markedParser.use({
  hooks: {
    preprocess(markdown) {
      headingSlugCounts = new Map();
      return markdown;
    }
  },
  renderer: {
    heading(item) {
      const text = this.parser.parseInline(item.tokens);
      const slug = slugifyHeading(item.text, headingSlugCounts);
      return `<h${item.depth} id="${slug}">${text}</h${item.depth}>\n`;
    }
  }
});

// Automatically open external links in a new tab safely and enforce noopener noreferrer on all target="_blank"
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    const href = node.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
      node.setAttribute('target', '_blank');
    }
    if (node.getAttribute('target') === '_blank') {
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
  const [theme, setTheme] = useState(getInitialTheme);
  const [copiedHTML, setCopiedHTML] = useState(false);
  
  // State to track which modal is currently open ('privacy', 'terms', 'clear', 'print', or null)
  const [activeModal, setActiveModal] = useState(null);
  const [lastClearedContent, setLastClearedContent] = useState(null);
  
  // Interactive print layout options state (columns, paper size, margins, heading numbering)
  const [printOptions, setPrintOptions] = useState(getStoredPrintOptions);

  useEffect(() => {
    saveStoredPrintOptions(printOptions);
  }, [printOptions]);
  
  const editorRef = useRef(null);
  const previewRef = useRef(null);
  const [syncScroll, setSyncScroll] = useState(getSyncScrollPreference);
  const isScrollingRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    saveSyncScrollPreference(syncScroll);
  }, [syncScroll]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // Synchronize with OS color scheme changes if user has not explicitly set a manual preference
  useEffect(() => {
    const unsubscribe = listenToSystemTheme((systemTheme) => {
      try {
        const userOverride = localStorage.getItem(THEME_KEY);
        if (!userOverride) {
          setTheme(systemTheme);
        }
      } catch {
        setTheme(systemTheme);
      }
    });
    return unsubscribe;
  }, []);

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

  const handleEditorScroll = () => {
    if (!syncScroll) return;
    if (isScrollingRef.current === 'preview') return;
    isScrollingRef.current = 'editor';

    const editor = editorRef.current;
    const preview = previewRef.current;
    if (editor && preview) {
      const percentage = calculateScrollPercentage(editor.scrollTop, editor.scrollHeight, editor.clientHeight);
      preview.scrollTop = calculateTargetScrollTop(percentage, preview.scrollHeight, preview.clientHeight);
    }

    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
  };

  const handlePreviewScroll = () => {
    if (!syncScroll) return;
    if (isScrollingRef.current === 'editor') return;
    isScrollingRef.current = 'preview';

    const editor = editorRef.current;
    const preview = previewRef.current;
    if (editor && preview) {
      const percentage = calculateScrollPercentage(preview.scrollTop, preview.scrollHeight, preview.clientHeight);
      editor.scrollTop = calculateTargetScrollTop(percentage, editor.scrollHeight, editor.clientHeight);
    }

    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = null;
    }, 50);
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

    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    const fallbackText = selectedText.length === 0 && suffix !== '' ? 'text' : selectedText;
    const replacement = prefix + fallbackText + suffix;

    // Preserve native browser Undo/Redo stack (Ctrl+Z / Cmd+Z) via insertText command
    const inserted = document.execCommand ? document.execCommand('insertText', false, replacement) : false;

    if (!inserted) {
      // Fallback to React state update if execCommand is unsupported in the current environment
      const newText = 
        markdown.substring(0, start) + 
        replacement + 
        markdown.substring(end);
      setMarkdown(newText);
    }

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
    setActiveModal('print');
  };

  const handleSelectPrintPreset = (presetKey) => {
    const preset = PRINT_PRESETS[presetKey];
    if (preset) {
      setPrintOptions({
        columns: preset.columns,
        paperSize: preset.paperSize,
        margins: preset.margins,
        numberedHeadings: preset.numberedHeadings,
        preset: presetKey,
      });
    }
  };

  const handleExecutePrint = () => {
    setActiveModal(null);

    // 1. Toggle data-print-numbered attribute on body for hierarchical CSS counter numbering
    if (printOptions.numberedHeadings) {
      document.body.setAttribute('data-print-numbered', 'true');
    } else {
      document.body.removeAttribute('data-print-numbered');
    }
    document.documentElement.style.setProperty('--print-cols', String(printOptions.columns));

    // 2. Inject dynamic @page size, margins, and column styling CSS
    let dynamicStyle = document.getElementById('dynamic-print-page');
    if (!dynamicStyle) {
      dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'dynamic-print-page';
      document.head.appendChild(dynamicStyle);
    }
    dynamicStyle.textContent = generatePrintCSS(printOptions);

    // 3. Clean up dynamic print styles on print completion or cancellation
    const cleanupPrint = () => {
      document.body.removeAttribute('data-print-numbered');
      document.documentElement.style.removeProperty('--print-cols');
      const styleEl = document.getElementById('dynamic-print-page');
      if (styleEl) {
        styleEl.remove();
      }
      window.removeEventListener('afterprint', cleanupPrint);
    };

    window.addEventListener('afterprint', cleanupPrint);

    // Small delay ensures layout updates and styles are applied before browser print dialog triggers
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const parsedHTML = useMemo(() => {
    const processedMarkdown = sanitizeAIMath(deferredMarkdown);
    const rawHTML = markedParser.parse(processedMarkdown);
    return DOMPurify.sanitize(rawHTML, {
      USE_PROFILES: { html: true, mathMl: true, svg: true },
    });
  }, [deferredMarkdown]);

  const handleDownloadMarkdown = () => {
    if (!markdown.trim()) return;
    const title = extractDocTitle(markdown);
    const slug = slugifyTitle(title);
    downloadBlob({
      content: markdown,
      filename: `${slug}.md`,
      mimeType: 'text/markdown;charset=utf-8',
    });
  };

  const handleDownloadHTML = () => {
    if (!markdown.trim()) return;
    const title = extractDocTitle(markdown);
    const slug = slugifyTitle(title);
    const htmlDocument = generateStandaloneHTML({
      title,
      contentHTML: parsedHTML,
    });
    downloadBlob({
      content: htmlDocument,
      filename: `${slug}.html`,
      mimeType: 'text/html;charset=utf-8',
    });
  };

  const handleCopyHTML = async () => {
    if (!markdown.trim()) return;
    const success = await copyRichHTML(parsedHTML);
    if (success) {
      setCopiedHTML(true);
      setTimeout(() => {
        setCopiedHTML(false);
      }, 2000);
    }
  };

  const stats = useMemo(() => getDocumentStats(markdown), [markdown]);

  return (
    <div className="app-container">
      
      <div className="top-bar">
        <div className="toolbar" role="toolbar" aria-label="Markdown formatting toolbar">
          <div className="toolbar-group" aria-label="Headings">
            <button className="format-btn format-btn-text" onClick={() => handleFormat('# ', '')} title="Heading 1" aria-label="Heading 1">H1</button>
            <button className="format-btn format-btn-text" onClick={() => handleFormat('## ', '')} title="Heading 2" aria-label="Heading 2">H2</button>
            <button className="format-btn format-btn-text" onClick={() => handleFormat('### ', '')} title="Heading 3" aria-label="Heading 3">H3</button>
          </div>
          <div className="divider"></div>
          <div className="toolbar-group" aria-label="Text Formatting">
            <button className="format-btn" onClick={() => handleFormat('**', '**')} title="Bold" aria-label="Bold">
              <BoldIcon size={15} />
            </button>
            <button className="format-btn" onClick={() => handleFormat('_', '_')} title="Italic" aria-label="Italic">
              <ItalicIcon size={15} />
            </button>
            <button className="format-btn" onClick={() => handleFormat('~~', '~~')} title="Strikethrough" aria-label="Strikethrough">
              <StrikethroughIcon size={15} />
            </button>
            <button className="format-btn" onClick={() => handleFormat('```\n', '\n```')} title="Code Block" aria-label="Code Block">
              <CodeIcon size={15} />
            </button>
          </div>
          <div className="divider"></div>
          <div className="toolbar-group" aria-label="Lists and Inserts">
            <button className="format-btn" onClick={() => handleFormat('> ', '')} title="Blockquote" aria-label="Blockquote">
              <QuoteIcon size={15} />
            </button>
            <button className="format-btn" onClick={() => handleFormat('- ', '')} title="List Item" aria-label="List Item">
              <ListIcon size={15} />
            </button>
            <button className="format-btn" onClick={() => handleFormat('[', '](https://url.com)')} title="Link" aria-label="Insert Link">
              <LinkIcon size={15} />
            </button>
            <button className="format-btn" onClick={() => handleFormat('$$ \n', '\n$$')} title="Math Equation" aria-label="Math Equation">
              <MathIcon size={15} />
            </button>
          </div>
          <div className="divider"></div>
          <div className="toolbar-group" aria-label="Theme">
            <button 
              className="theme-toggle-btn format-btn"
              onClick={toggleTheme} 
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
          </div>
        </div>
        
        <div className="action-buttons">
          {lastClearedContent && markdown === '' && (
            <button 
              className="restore-btn" 
              onClick={handleRestoreCleared} 
              title="Restore cleared text"
              aria-label="Undo Clear"
            >
              <UndoIcon size={15} />
              <span className="btn-label-full">Undo Clear</span>
              <span className="btn-label-short">Undo</span>
            </button>
          )}
          <button 
            className="action-btn" 
            onClick={handleDownloadMarkdown} 
            title="Download active document as Markdown (.md)"
            aria-label="Download Markdown (.md)"
            disabled={!markdown.trim()}
          >
            <DownloadIcon size={15} />
            <span className="btn-label-full">Export .md</span>
            <span className="btn-label-short">.md</span>
          </button>
          <button 
            className="action-btn" 
            onClick={handleDownloadHTML} 
            title="Export standalone self-contained HTML (.html) with KaTeX math"
            aria-label="Export standalone HTML (.html)"
            disabled={!markdown.trim()}
          >
            <FileCodeIcon size={15} />
            <span className="btn-label-full">Export .html</span>
            <span className="btn-label-short">.html</span>
          </button>
          <button 
            className={`action-btn ${copiedHTML ? 'copy-success' : ''}`}
            onClick={handleCopyHTML} 
            title="Copy rich HTML to clipboard (paste into Medium, Dev.to, Google Docs, or email)"
            aria-label={copiedHTML ? "Copied HTML to clipboard" : "Copy rich HTML"}
            disabled={!markdown.trim()}
          >
            {copiedHTML ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
            <span className="btn-label-full">{copiedHTML ? 'Copied!' : 'Copy HTML'}</span>
            <span className="btn-label-short">{copiedHTML ? 'Copied' : 'Copy'}</span>
          </button>
          <button 
            className="print-btn" 
            onClick={handlePrint} 
            title="Print or Save as PDF"
            aria-label="Print or Save as PDF"
          >
            <PrinterIcon size={15} />
            <span className="btn-label-full">Print PDF</span>
            <span className="btn-label-short">Print</span>
          </button>
          <button 
            className="clear-btn" 
            onClick={handleClear} 
            title={markdown.trim() ? "Clear Editor" : "Editor is empty"}
            aria-label="Clear Editor"
            disabled={!markdown.trim()}
          >
            <TrashIcon size={15} />
            <span className="btn-label-full">Clear</span>
            <span className="btn-label-short">Clear</span>
          </button>
        </div>
      </div>

      <div className="split-layout">
        <div className="pane editor-pane">
          <div className="pane-header">
            <div className="pane-title-group">
              <span className="pane-title">Markdown Editor</span>
              <span className="save-status-pill" title="Saved locally in browser storage">
                <CheckCircleIcon size={12} />
                <span>{saveStatus}</span>
              </span>
              <button
                type="button"
                className={`sync-scroll-btn ${syncScroll ? 'active' : ''}`}
                onClick={() => setSyncScroll(prev => !prev)}
                title={`Synchronized Scrolling: ${syncScroll ? 'ON' : 'OFF'} (Click to toggle)`}
                aria-pressed={syncScroll}
                aria-label="Toggle synchronized scrolling"
              >
                <SyncScrollIcon size={13} />
                <span>Sync Scroll: {syncScroll ? 'ON' : 'OFF'}</span>
              </button>
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
            onScroll={handleEditorScroll}
            placeholder="Type your markdown here..."
          />
        </div>

        <div className="pane preview-pane">
          <div className="pane-header">
            <span className="pane-title">Live Preview</span>
          </div>
          <div 
            ref={previewRef}
            className="preview-output" 
            onScroll={handlePreviewScroll}
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
      {activeModal && activeModal !== 'print' && (
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

      {/* Interactive Print & PDF Options Modal */}
      <PrintModal
        isOpen={activeModal === 'print'}
        onClose={() => setActiveModal(null)}
        onConfirmPrint={handleExecutePrint}
        options={printOptions}
        onOptionsChange={setPrintOptions}
        onSelectPreset={handleSelectPrintPreset}
      />
      
    </div>
  );
}

export default App;