import * as vscode from 'vscode';

function getWidth() {
    const editorConfig = vscode.workspace.getConfiguration('editor', null);
    const retrievedFontSize: number | undefined = editorConfig.get<number>(
        'fontSize'
    );
    const fontSize = retrievedFontSize ? retrievedFontSize : 10;
    return fontSize;
}

const width = getWidth();

const wordLabelDecorationType = vscode.window.createTextEditorDecorationType({
    after: {
        textDecoration: 'none',
        margin: `0 0 0 ${-width}px`,
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
