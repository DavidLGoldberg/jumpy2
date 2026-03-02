import { DecorationRangeBehavior, window } from 'vscode';

// Word labels put ALL styling (colors, border, dimensions, margin) in per-label
// renderOptions (see words.ts). The decoration type only provides:
//   - opacity: '0' to hide underlying text beneath labels
//   - rangeBehavior to keep decorations stable
const commonDecorationOptions = {
    opacity: '0',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
};

const wordLabelBaseDecorationType = window.createTextEditorDecorationType({
    ...commonDecorationOptions,
});

const wordLabelCheckeredDecorationType = window.createTextEditorDecorationType({
    ...commonDecorationOptions,
});

export { wordLabelBaseDecorationType, wordLabelCheckeredDecorationType };
