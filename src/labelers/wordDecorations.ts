import { DecorationRangeBehavior, ThemeColor, window, workspace } from 'vscode';

function getWidth() {
    return (
        workspace.getConfiguration('editor', null).get<number>('fontSize') || 10
    );
}

const width = getWidth();

// Theme color options from package.json's `contributes.colors`:
const colorSettings = {
    backgroundColor: new ThemeColor('jumpy2.labelBackgroundColor'),
    after: { color: new ThemeColor('jumpy2.labelFontColor') },
};

const wordLabelDecorationType = window.createTextEditorDecorationType({
    after: {
        textDecoration: 'none',
        margin: `0 2px 0 ${-width - 2}px`,
        width: `${width}px`,
        fontWeight: 'bold', // TODO: Evaluate ...is this good...or ...option?
    },
    opacity: '0',
    light: colorSettings,
    dark: colorSettings,
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
});

export default wordLabelDecorationType;
