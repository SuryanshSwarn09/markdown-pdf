import React from 'react';
import { PRINT_PRESETS } from '../utils/printOptions.js';
import { 
  PrinterIcon, 
  ColumnsIcon, 
  LayoutIcon, 
  CheckIcon 
} from './Icons.jsx';

/**
 * PrintModal component allows users to customize PDF and print settings:
 * - Columns: 1-Column standard vs 2-Column academic
 * - Paper size: Letter vs A4
 * - Margins: Normal vs Compact vs Wide
 * - Heading numbering: Hierarchical CSS counters (1.0, 1.1, 1.2)
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
        <div className="print-modal-header">
          <div className="print-modal-icon-badge">
            <PrinterIcon size={22} />
          </div>
          <div className="print-modal-title-group">
            <h2 id="print-modal-title">Print &amp; PDF Layout Options</h2>
            <p className="print-modal-subtitle">
              Configure publication geometry, multi-column flow, and section numbering before printing.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="print-modal-section">
          <label className="print-section-label">
            <LayoutIcon size={14} className="section-label-icon" />
            Quick Presets
          </label>
          <div className="print-preset-grid">
            {Object.entries(PRINT_PRESETS).map(([key, preset]) => {
              const isSelected = options.preset === key || (
                options.columns === preset.columns &&
                options.paperSize === preset.paperSize &&
                options.margins === preset.margins &&
                options.numberedHeadings === preset.numberedHeadings
              );
              return (
                <button
                  type="button"
                  key={key}
                  className={`print-preset-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handlePresetClick(key)}
                  aria-pressed={isSelected}
                >
                  <div className="preset-header">
                    <span className="preset-name">{preset.name}</span>
                    {isSelected && <CheckIcon size={14} className="preset-check" />}
                  </div>
                  <span className="preset-desc">{preset.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Customizer Controls */}
        <div className="print-modal-controls">
          {/* Columns */}
          <div className="print-control-group">
            <label className="print-control-label">
              <ColumnsIcon size={14} className="control-label-icon" />
              Column Layout
            </label>
            <div className="segmented-control" role="group" aria-label="Columns">
              <button
                type="button"
                className={`segment-btn ${options.columns === 1 ? 'active' : ''}`}
                onClick={() => handleOptionChange('columns', 1)}
                aria-pressed={options.columns === 1}
              >
                1 Column (Standard)
              </button>
              <button
                type="button"
                className={`segment-btn ${options.columns === 2 ? 'active' : ''}`}
                onClick={() => handleOptionChange('columns', 2)}
                aria-pressed={options.columns === 2}
              >
                2 Columns (Academic)
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
                US Letter (8.5 × 11 in)
              </button>
              <button
                type="button"
                className={`segment-btn ${options.paperSize === 'a4' ? 'active' : ''}`}
                onClick={() => handleOptionChange('paperSize', 'a4')}
                aria-pressed={options.paperSize === 'a4'}
              >
                A4 (210 × 297 mm)
              </button>
            </div>
          </div>

          {/* Margins */}
          <div className="print-control-group">
            <label className="print-control-label">Page Margins</label>
            <div className="segmented-control" role="group" aria-label="Margins">
              <button
                type="button"
                className={`segment-btn ${options.margins === 'normal' ? 'active' : ''}`}
                onClick={() => handleOptionChange('margins', 'normal')}
                aria-pressed={options.margins === 'normal'}
              >
                Normal (15mm)
              </button>
              <button
                type="button"
                className={`segment-btn ${options.margins === 'compact' ? 'active' : ''}`}
                onClick={() => handleOptionChange('margins', 'compact')}
                aria-pressed={options.margins === 'compact'}
              >
                Compact (10mm)
              </button>
              <button
                type="button"
                className={`segment-btn ${options.margins === 'wide' ? 'active' : ''}`}
                onClick={() => handleOptionChange('margins', 'wide')}
                aria-pressed={options.margins === 'wide'}
              >
                Wide (25mm)
              </button>
            </div>
          </div>

          {/* Heading Numbering Toggle */}
          <div className="print-control-group print-toggle-group">
            <div className="print-toggle-text">
              <span className="print-toggle-title">Numbered Headings</span>
              <span className="print-toggle-subtitle">
                Hierarchical section counters (e.g. 1.0, 1.1, 1.2) for academic or technical submissions.
              </span>
            </div>
            <button
              type="button"
              className={`print-switch-btn ${options.numberedHeadings ? 'checked' : ''}`}
              onClick={() => handleOptionChange('numberedHeadings', !options.numberedHeadings)}
              role="switch"
              aria-checked={options.numberedHeadings}
              aria-label="Toggle hierarchical heading numbering"
            >
              <span className="print-switch-thumb" />
            </button>
          </div>
        </div>

        {/* Live Summary Bar */}
        <div className="print-summary-bar">
          <span className="summary-tag">
            {options.columns === 2 ? '2-Column Academic' : '1-Column'}
          </span>
          <span className="summary-dot">&bull;</span>
          <span className="summary-tag">
            {options.paperSize === 'a4' ? 'A4 Paper' : 'Letter Paper'}
          </span>
          <span className="summary-dot">&bull;</span>
          <span className="summary-tag">
            {options.margins.charAt(0).toUpperCase() + options.margins.slice(1)} Margins
          </span>
          <span className="summary-dot">&bull;</span>
          <span className="summary-tag">
            {options.numberedHeadings ? 'Numbered Headings ON' : 'Unnumbered Headings'}
          </span>
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
            <PrinterIcon size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
