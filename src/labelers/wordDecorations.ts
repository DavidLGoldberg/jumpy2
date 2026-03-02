import { DecorationRangeBehavior, window } from 'vscode';

// Word labels put ALL styling (colors, border, dimensions, margin) in per-label
// renderOptions (see words.ts). The decoration type only provides:
//   - rangeBehavior to keep decorations stable
const commonDecorationOptions = {
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
};

const wordLabelBaseDecorationType = window.createTextEditorDecorationType({
    ...commonDecorationOptions,
});

const wordLabelCheckeredDecorationType = window.createTextEditorDecorationType({
    ...commonDecorationOptions,
});

export { wordLabelBaseDecorationType, wordLabelCheckeredDecorationType };
