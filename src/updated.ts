import { sponsoredBlock } from './sponsored';

// Platform-agnostic approach: try to load changelog if available (Node), fallback to link (Browser)
let changelogContent = '';
try {
    // This will only work in Node.js environment
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const path = require('path');
        const changelogPath = path.join(__dirname, '../changelog.md');
        changelogContent = fs.readFileSync(changelogPath, 'utf8');
    }
} catch (error) {
    // Running in browser, use link instead
    changelogContent = '';
}

export const updatesWebview = () => {
    const changelogDisplay = changelogContent
        ? `<pre>${changelogContent}</pre>`
        : `<p>Check out the latest updates on GitHub:</p>
           <p><a href="https://github.com/DavidLGoldberg/jumpy2/blob/main/changelog.md" target="_blank" rel="noopener noreferrer">View Changelog on GitHub</a></p>`;

    return `
      <!DOCTYPE html>
      <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Jumpy2 Updates</title>
          </head>
          <body>
              <h1>Jumpy2 Has Been Updated!</h1>
              <hr />
              ${sponsoredBlock}
              <hr />
              <div id="changelog">
                ${changelogDisplay}
              </div>
          </body>
      </html>`;
};
