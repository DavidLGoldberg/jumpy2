import {
    DecorationRangeBehavior,
    DecorationRenderOptions,
    ThemeColor,
    window,
} from 'vscode';

const color = new ThemeColor('jumpy2.beaconColor');

const getWordBeaconDecoration = () =>
    window.createTextEditorDecorationType(<DecorationRenderOptions>{
        borderRadius: '2px', // Round the corners
        backgroundColor: color, // This operates with the range of 1 character.
        rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    });

export default getWordBeaconDecoration;
