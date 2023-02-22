import { DecorationRangeBehavior, ThemeColor, window } from 'vscode';

// Theme color options from package.json's `contributes.colors`:
const colorSettings = {
    after: {
        backgroundColor: new ThemeColor('jumpy2.labelBackgroundColor'),
        color: new ThemeColor('jumpy2.labelFontColor'),
        borderColor: new ThemeColor('jumpy2.labelBorderColor'),
    },
};

const borderWidth = '0.0375em';
const width = '1.265em'; // this number comes from a little trial and error off of the % of the fonts and is used above in the margin.
const height = width; // keep it a square
const wordLabelDecorationType = window.createTextEditorDecorationType({
    after: {
        margin: `-${borderWidth} 0 0 -${width}`, // I need to adjust the margin to match the widths
        width,
        height,
        fontWeight: 'bold',
        border: `${borderWidth} solid`, // <-- I need to adjust for this above in the margin.
    },
    opacity: '0',
    light: colorSettings,
    dark: colorSettings,
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
});

export default wordLabelDecorationType;
