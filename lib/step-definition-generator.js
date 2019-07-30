'use babel';

import { CompositeDisposable } from 'atom';

import converter from './converter';
import writer from './writer';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'step-definition-generator:generate': () => this.generate(),
    }))
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  generate() {
    const editor = atom.workspace.getActiveTextEditor();

    if (editor) {
      const title = editor.getTitle();
			const splittedTitle = title.split[0]

			if (title.split('.').slice(-1)[0] === 'feature') {
				const content = editor.getText().split('\n');
	      const output = converter.init({title, content});
				const path = editor.getPath().replace(title, '');

				writer.write(output.title, output.output, path, '.js')
			} else {
				atom.notifications.addError('This is not a feature file, navigate to a feature file and try again.');
			}
    }
    return "";
  }
};
