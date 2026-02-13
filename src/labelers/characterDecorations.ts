import { DecorationRangeBehavior, window } from 'vscode';

// Character/Squint mode labels use SVG with colors embedded directly.
// These decoration types just provide opacity and range behavior.
const commonDecorationOptions = {
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
};

const characterLabelBaseDecorationType = window.createTextEditorDecorationType({
    ...commonDecorationOptions,
});

const characterLabelCheckeredDecorationType =
    window.createTextEditorDecorationType({
        ...commonDecorationOptions,
    });

export {
    characterLabelBaseDecorationType,
    characterLabelCheckeredDecorationType,
};
