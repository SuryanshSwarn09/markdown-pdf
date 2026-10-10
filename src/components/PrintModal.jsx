import React from 'react';
import { PRINT_PRESETS } from '../utils/printOptions.js';
import { 
  PrinterIcon, 
  CheckIcon,
} from './Icons.jsx';

/**
 * PrintModal component provides a clean, minimalistic layout customizer before printing:
 * - Quick Presets: Standard, Academic (2-Col), Technical Report
 * - Page Geometry: Columns, Paper Size, Margins, Numbered Headings
 * - Running Header & Footer: Custom text, dynamic page numbering, date stamp
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onConfirmPrint
 * @param {Object} props.options
 * @param {Function} props.onOptionsChange
 * @param {Function} props.onSelectPreset
 */
export default function PrintModal({
  isOpen,
  onClose,
  onConfirmPrint,
  options,
  onOptionsChange,
  onSelectPreset,
}) {
  if (!isOpen) return null;

  const handlePresetClick = (presetKey) => {
    if (typeof onSelectPreset === 'function') {
      onSelectPreset(presetKey);
    }
  };

  const handleOptionChange = (key, value) => {
    if (typeof onOptionsChange === 'function') {
      onOptionsChange({
        ...options,
        [key]: value,
        preset: 'custom',
      });
    }
  };

  return (
    <div 
      className="modal-overlay print-modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-modal-title"
    >
      <div 
        className="modal-window print-modal-window" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Modal Header */}
        <div className="print-modal-header">
          <div className="print-modal-header-left">
            <div className="print-modal-icon-badge">
              <PrinterIcon size={18} />
            </div>
            <h2 id="print-modal-title">Print &amp; PDF Layout</h2>
          </div>
          <button 
            type="button" 
            className="print-modal-dismiss-btn" 
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* Quick Presets (Sleek Horizontal Segmented Bar) */}
        <div className="print-preset-pill-bar" role="group" aria-label="Presets">
          {Object.entries(PRINT_PRESETS).map(([key, preset]) => {
            const isSelected = options.preset === key || (
              options.columns === preset.columns &&
              options.paperSize === preset.paperSize &&
              options.margins === preset.margins &&
              options.numberedHeadings === preset.numberedHeadings &&
              options.showHeader === preset.showHeader &&
              options.showFooter === preset.showFooter
            );
            return (
              <button
                type="button"
                key={key}
                className={`preset-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handlePresetClick(key)}
                aria-pressed={isSelected}
              >
                {isSelected && <CheckIcon size={13} className="preset-pill-check" />}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="print-modal-grid">
          {/* Column 1: Document Geometry */}
          <div className="print-modal-col">
            {/* Columns */}
            <div className="print-control-group">
              <label className="print-control-label">Columns</label>
              <div className="segmented-control" role="group" aria-label="Columns">
                <button
                  type="button"
                  className={`segment-btn ${options.columns === 1 ? 'active' : ''}`}
                  onClick={() => handleOptionChange('columns', 1)}
                  aria-pressed={options.columns === 1}
                >
                  1 Column
                </button>
                <button
                  type="button"
                  className={`segment-btn ${options.columns === 2 ? 'active' : ''}`}
                  onClick={() => handleOptionChange('columns', 2)}
                  aria-pressed={options.columns === 2}
                >
                  2 Columns
                </button>
              </div>
            </div>

            {/* Paper Size */}
            <div className="print-control-group">
              <label className="print-control-label">Paper Size</label>
              <div className="segmented-control" role="group" aria-label="Paper Size">
                <button
                  type="button"
                  className={`segment-btn ${options.paperSize === 'letter' ? 'active' : ''}`}
                  onClick={() => handleOptionChange('paperSize', 'letter')}
                  aria-pressed={options.paperSize === 'letter'}
                >
                  Letter
                </button>
                <button
                  type="button"
                  className={`segment-btn ${options.paperSize === 'a4' ? 'active' : ''}`}
                  onClick={() => handleOptionChange('paperSize', 'a4')}
                  aria-pressed={options.paperSize === 'a4'}
                >
                  A4
                </button>
              </div>
            </div>

            {/* Margins */}
            <div className="print-control-group">
              <label className="print-control-label">Margins</label>
              <div className="segmented-control" role="group" aria-label="Margins">
                <button
                  type="button"
                  className={`segment-btn ${options.margins === 'normal' ? 'active' : ''}`}
                  onClick={() => handleOptionChange('margins', 'normal')}
                  aria-pressed={options.margins === 'normal'}
                >
                  Normal
                </button>
                <button
                  type="button"
                  className={`segment-btn ${options.margins === 'compact' ? 'active' : ''}`}
                  onClick={() => handleOptionChange('margins', 'compact')}
                  aria-pressed={options.margins === 'compact'}
                >
                  Compact
                </button>
                <button
                  type="button"
                  className={`segment-btn ${options.margins === 'wide' ? 'active' : ''}`}
                  onClick={() => handleOptionChange('margins', 'wide')}
                  aria-pressed={options.margins === 'wide'}
                >
                  Wide
                </button>
              </div>
            </div>

            {/* Numbered Headings Toggle */}
            <div className="print-toggle-row">
              <span className="print-toggle-label">Numbered Sections</span>
              <button
                type="button"
                className={`print-switch-btn ${options.numberedHeadings ? 'checked' : ''}`}
                onClick={() => handleOptionChange('numberedHeadings', !options.numberedHeadings)}
                role="switch"
                aria-checked={options.numberedHeadings}
                aria-label="Toggle hierarchical section numbering"
              >
                <span className="print-switch-thumb" />
              </button>
            </div>
          </div>

          {/* Column 2: Running Headers & Footers */}
          <div className="print-modal-col">
            {/* Header Control */}
            <div className="print-hf-compact-card">
              <div className="print-toggle-row">
                <span className="print-toggle-label">Running Header</span>
                <button
                  type="button"
                  className={`print-switch-btn ${options.showHeader ? 'checked' : ''}`}
                  onClick={() => handleOptionChange('showHeader', !options.showHeader)}
                  role="switch"
                  aria-checked={options.showHeader}
                  aria-label="Toggle running header"
                >
                  <span className="print-switch-thumb" />
                </button>
              </div>
              {options.showHeader && (
                <input
                  type="text"
                  className="print-text-input"
                  placeholder="Document Title or Org"
                  value={options.headerText || ''}
                  maxLength={120}
                  onChange={(e) => handleOptionChange('headerText', e.target.value)}
                  aria-label="Running header text"
                />
              )}
            </div>

            {/* Footer Control */}
            <div className="print-hf-compact-card">
              <div className="print-toggle-row">
                <span className="print-toggle-label">Running Footer</span>
                <button
                  type="button"
                  className={`print-switch-btn ${options.showFooter ? 'checked' : ''}`}
                  onClick={() => handleOptionChange('showFooter', !options.showFooter)}
                  role="switch"
                  aria-checked={options.showFooter}
                  aria-label="Toggle running footer"
                >
                  <span className="print-switch-thumb" />
                </button>
              </div>
              {options.showFooter && (
                <div className="print-hf-footer-body">
                  <input
                    type="text"
                    className="print-text-input"
                    placeholder="Confidential notice"
                    value={options.footerText || ''}
                    maxLength={120}
                    onChange={(e) => handleOptionChange('footerText', e.target.value)}
                    aria-label="Running footer text"
                  />
                  <div className="print-hf-pills">
                    <label className="print-pill-checkbox">
                      <input
                        type="checkbox"
                        checked={options.showPageNumbers}
                        onChange={(e) => handleOptionChange('showPageNumbers', e.target.checked)}
                        className="print-checkbox"
                      />
                      <span>Page Numbers</span>
                    </label>
                    <label className="print-pill-checkbox">
                      <input
                        type="checkbox"
                        checked={options.showDate}
                        onChange={(e) => handleOptionChange('showDate', e.target.checked)}
                        className="print-checkbox"
                      />
                      <span>Date Stamp</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions print-modal-actions">
          <button 
            type="button"
            className="modal-secondary-btn" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="modal-primary-btn print-submit-btn" 
            onClick={onConfirmPrint}
            autoFocus
          >
            <PrinterIcon size={15} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
