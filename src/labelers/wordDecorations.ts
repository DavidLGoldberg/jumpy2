import { DecorationRangeBehavior, ThemeColor, window, workspace } from 'vscode';

function getWidth() {
    const editorConfig = workspace.getConfiguration('editor', null);
    const retrievedFontSize: number | undefined = editorConfig.get<number>(
        'fontSize'
    );
    return retrievedFontSize ? retrievedFontSize : 10;
}

const width = getWidth();

// Theme color  options from package.json's `contributes.colors`:
const labelBackgroundColor = new ThemeColor('jumpy2.labelBackgroundColor');
const labelFontColor = new ThemeColor('jumpy2.labelFontColor');

const wordLabelDecorationType = window.createTextEditorDecorationType({
    after: {
        textDecoration: 'none',
        margin: `0 2px 0 ${-width - 2}px`,
        width: `${width}px`,
        fontWeight: 'bold', // TODO: Evaluate ...is this good...or ...option?
    },
    opacity: '0',
    light: {
        backgroundColor: labelBackgroundColor, // TODO: find better vs code values (in package.json)
        after: {
            color: labelFontColor, // TODO: find better vs code values (in package.json)
        },
    },
    dark: {
        backgroundColor: labelBackgroundColor, // TODO: find better vs code values (in package.json)
        after: {
            color: labelFontColor, // TODO: find better vs code values (in package.json)
        },
    },
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
});

export default wordLabelDecorationType;
