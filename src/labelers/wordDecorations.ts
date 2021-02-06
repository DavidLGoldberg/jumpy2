import * as vscode from 'vscode';

function getWidth() {
    const editorConfig = vscode.workspace.getConfiguration('editor', null);
    const retrievedFontSize: number | undefined = editorConfig.get<number>(
        'fontSize'
    );
    return retrievedFontSize ? retrievedFontSize : 10;
}

const width = getWidth();

const wordLabelDecorationType = vscode.window.createTextEditorDecorationType({
    after: {
        textDecoration: 'none',
        margin: `0 2px 0 ${-width - 2}px`,
        width: `${width}px`,
    },
    opacity: '0',
    light: {
        backgroundColor: 'gray',
    },
    dark: {
        backgroundColor: 'green',
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
});

export default wordLabelDecorationType;
