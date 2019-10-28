import * as vscode from 'vscode';
import { LabelEnvironment, Label } from './label-interface';
import getWordLabels from './labelers/words';
import * as _ from 'lodash';
import { getKeySet } from './keys';


function main() {
	vscode.window.showInformationMessage('Jumpy activated!!!');

	const environment:LabelEnvironment = {
		// keys: getKeySet(atom.config.get('jumpy.customKeys')),
		//TODO: get custom keys from settings / config
		keys: getKeySet([]),
		settings: {
			//TODO: get match from settings / config
			wordsPattern: new RegExp('([A-Z]+([0-9a-z])*)|[a-z0-9]{2,}', 'g')
		}
	};

	const wordLabels:Array<Label> = getWordLabels(environment);

	const allLabels: Array<Label> = [
		...wordLabels
	];

	const drawnLabels:Array<Label> = [];
	let currentLabels:Array<Label> = [];

	for (const label of allLabels) {
		drawnLabels.push(label.drawLabel());
	}

	currentLabels = _.clone(allLabels);
}

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.jumpy-vscode', main);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
