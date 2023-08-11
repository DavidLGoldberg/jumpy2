import { DecorationRangeBehavior, DecorationRenderOptions, ThemeColor, window } from 'vscode';

const color = new ThemeColor('jumpy2.beaconColor');

const width = `0.6325em`;
const height = `1.265em`;
const getWordBeaconDecoration = () => window.createTextEditorDecorationType(<DecorationRenderOptions>{
    after: {
        contentText: '',
        backgroundColor: color,
        width,
        height,
        textDecoration: `none; position: absolute; display: inline-block; pointer-events: none`
    },
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
});

export default getWordBeaconDecoration;
