import { highlightCode, isLanguageSupported } from './highlighter.js';
import assert from 'node:assert';

console.log('Running test suite for modular highlighter...');

// 1. Core Web Languages
const jsOutput = highlightCode('const sum = (a, b) => a + b;', 'javascript');
assert.ok(jsOutput.includes('hljs-keyword'), 'JavaScript highlighting failed');

const tsOutput = highlightCode('interface User { id: number; }', 'typescript');
assert.ok(tsOutput.includes('hljs-keyword'), 'TypeScript highlighting failed');

const htmlOutput = highlightCode('<div class="app">Hello</div>', 'html');
assert.ok(htmlOutput.includes('hljs-tag'), 'HTML highlighting failed');

const cssOutput = highlightCode('.btn { color: #fff; }', 'css');
assert.ok(cssOutput.includes('hljs-selector-class'), 'CSS highlighting failed');

const jsonOutput = highlightCode('{"key": "value"}', 'json');
assert.ok(jsonOutput.includes('hljs-attr'), 'JSON highlighting failed');

// 2. Backend & Scripting Languages
const pyOutput = highlightCode('def greet(): return "hello"', 'python');
assert.ok(pyOutput.includes('hljs-keyword'), 'Python highlighting failed');

const bashOutput = highlightCode('echo "Deploying..." && exit 0', 'bash');
assert.ok(bashOutput.includes('hljs-built_in') || bashOutput.includes('hljs-string'), 'Bash highlighting failed');

const sqlOutput = highlightCode('SELECT * FROM users WHERE active = 1;', 'sql');
assert.ok(sqlOutput.includes('hljs-keyword'), 'SQL highlighting failed');

// 3. Compiled Languages
const rustOutput = highlightCode('fn main() { println!("hi"); }', 'rust');
assert.ok(rustOutput.includes('hljs-keyword') || rustOutput.includes('hljs-title'), 'Rust highlighting failed');

const goOutput = highlightCode('package main\nimport "fmt"', 'go');
assert.ok(goOutput.includes('hljs-keyword'), 'Go highlighting failed');

// 4. Aliases
assert.ok(isLanguageSupported('js'), 'Alias "js" not recognized');
assert.ok(isLanguageSupported('py'), 'Alias "py" not recognized');
assert.ok(isLanguageSupported('ts'), 'Alias "ts" not recognized');
assert.ok(isLanguageSupported('sh'), 'Alias "sh" not recognized');
assert.ok(isLanguageSupported('rs'), 'Alias "rs" not recognized');
assert.ok(isLanguageSupported('golang'), 'Alias "golang" not recognized');
assert.ok(isLanguageSupported('yml'), 'Alias "yml" not recognized');

// 5. Unknown Language Fallback
assert.strictEqual(isLanguageSupported('nonexistent_lang_xyz'), false);
const fallbackOutput = highlightCode('print "fallback"', 'nonexistent_lang_xyz');
assert.ok(fallbackOutput.includes('fallback'), 'Fallback failed');
assert.strictEqual(typeof fallbackOutput, 'string');

// 6. No Language Provided
const noLangOutput = highlightCode('plain text content');
assert.strictEqual(noLangOutput, 'plain text content');

console.log('All modular highlighter tests passed successfully!');
