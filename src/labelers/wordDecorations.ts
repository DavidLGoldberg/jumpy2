import { DecorationRangeBehavior, ThemeColor, window, workspace } from 'vscode';

// Theme color options from package.json's `contributes.colors`:
const baseColorSettings = {
    after: {
        backgroundColor: new ThemeColor('jumpy2.labelBackgroundColor'),
        color: new ThemeColor('jumpy2.labelFontColor'),
        borderColor: new ThemeColor('jumpy2.labelBorderColor'),
    },
};
const checkeredColorSettings = {
    after: {
        backgroundColor: new ThemeColor(
            'jumpy2.checkered_labelBackgroundColor'
        ),
        color: new ThemeColor('jumpy2.checkered_labelFontColor'),
        borderColor: new ThemeColor('jumpy2.checkered_labelBorderColor'),
    },
};

const borderWidth = '0.0375em';
const width = '1.265em'; // this number comes from a little trial and error off of the % of the fonts and is used above in the margin.

const lineHeight = workspace
    .getConfiguration('editor')
    .get<number>('lineHeight');

const height = lineHeight ? `${lineHeight}px` : width; // Set height based on lineHeight else default to a square

const commonDecorationOptions = {
    after: {
        margin: `-${borderWidth} 0 0 -${width}`, // I need to adjust the margin to match the widths
        width,
        height,
        fontWeight: 'bold',
        fontStyle: 'normal',
        border: `${borderWidth} solid`, // <-- I need to adjust for this above in the margin.
    },
    opacity: '0',
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
};
const wordLabelBaseDecorationType = window.createTextEditorDecorationType({
    ...commonDecorationOptions,
    light: baseColorSettings,
    dark: baseColorSettings,
});

const wordLabelCheckeredDecorationType = window.createTextEditorDecorationType({
    ...commonDecorationOptions,
    light: checkeredColorSettings,
    dark: checkeredColorSettings,
});

export { wordLabelBaseDecorationType, wordLabelCheckeredDecorationType };
