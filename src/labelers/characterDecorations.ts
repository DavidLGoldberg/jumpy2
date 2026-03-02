import { DecorationRangeBehavior, window } from 'vscode';

// Character/Squint mode labels put styling in per-label renderOptions (see characters.ts).
// The decoration type only provides rangeBehavior to keep decorations stable.
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
