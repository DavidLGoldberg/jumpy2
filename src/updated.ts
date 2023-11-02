import * as fs from 'fs';
import * as path from 'path';
import { sponsoredBlock } from './sponsored';

const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const changelogContent = fs.readFileSync(changelogPath, 'utf8');

export const updatesWebview = () => {
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
                <pre>${changelogContent}</pre>
              </div>
          </body>
      </html>`;
};
