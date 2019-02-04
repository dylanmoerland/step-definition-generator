'use babel';

import { CompositeDisposable } from 'atom';
import fs from 'fs';

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

const converter = {
	title: null,
	items: null,
	types: ['given', 'when', 'then', 'and', 'but'],

	transformTitle: function(title) {
		return title.split('.')[0];
	},

	getItems: function(rows) {
		return rows.reduce((accumulator, currentValue) => {
			const classified = this.classify(currentValue);
			if (classified) {
				return Array.isArray(accumulator) ? [...accumulator, classified] : [classified];
			} else {
				return Array.isArray(accumulator) ? accumulator : [];
			}
		});
	},

	classify: function(value) {
		for(let i in this.types) {
			if (this.containsType(value, this.types[i])) {
				return {
					item: value.trim(),
					type: this.types[i]
				}
			}
		}
		return null;
	},

	containsType: function(value, key) {
		return value.trim().toLowerCase().indexOf(key.toLowerCase()) === 0;
	},

	normalize: function(items) {
		const pattern = new RegExp('\'(.*?)\'');

		return items.map((item) => {
			let counter = 0;
			while (pattern.test(item)) {
				item = item.replace(pattern, `{${letters[counter]}}`);
				counter++;
			}
			return item;
		});
	},

	unique: function(items) {
		return items.reduce((unique, item) => {
			if (!Array.isArray(unique)) {
				return [unique, item];
			}
			return unique
		});
	},

	resolveTypes: function(items) {
		return items.map((item, index) => {
			if (item.type !== 'and' && item.type !== 'but') {
				item.item = item.item.substring(item.type.length + 1);
			} else {
				item.type = items[index - 1].type;
				item.item = item.item.substring(4);
			}
			return item;
		});
	},

	orderByType: function(items) {
		return items.sort((a, b) => {
			return this.types.indexOf(a.type) - this.types.indexOf(b.type);
		})
	},

	withParameters: function(items) {
		const pattern = new RegExp('{([^{}]+)}');
		return items.map((item) => {
			const parameters = item.item.match(/{\w*}/g) || [];
			return {
				...item,
				parameters: parameters.map((parameter) => parameter.replace('{', '').replace('}', '')),
			}
		})
	},

	withoutDuplicates: function(items) {
		return items.reduce((accumulator, currentValue) => {
			if (!Array.isArray(accumulator)) {
				return (accumulator.item === currentValue.item && accumulator.type === currentValue.type)
					? [accumulator]
					: [accumulator, currentValue];
			} else {
				if (!accumulator.find((item) => item.item === currentValue.item && item.type === currentValue.type)) {
					return [...accumulator, currentValue];
				} else {
					return accumulator;
				}
			}
		});
	},

	init: function(data) {
		this.title = this.transformTitle(data.title);
		this.items = this.normalize(data.content);

		this.items = this.withParameters(this.orderByType(this.withoutDuplicates(this.resolveTypes(this.getItems(this.normalize(data.content))))));

		return {
      title: this.title,
      output: documenter.document(this.title, this.items)
    };
	}
};

const documenter = {
	before: 'import { Given, When, Then } from \'cypress-cucumber-preprocessor/steps\';\n\n',
	output: '',
	insert: atom.config.get('step-definition-generator.pendingMethod', ''),

	build: function(items) {
		this.output = this.before;
		for (let i in items) {
			this.output += this.block(items[i], i >= items.length - 1);
		}
	},

	block: function(item, last) {
		let string = '';
		string += `${this.capitalize(item.type)}(\'${item.item}\', (`;
		for (let i in item.parameters) {
			string += `${item.parameters[i]}${i < item.parameters.length - 1 ? ', ' : ''}`;
		}
		string += `) => {\n`;
		string += `  ${this.insert}\n`;
		string += `});${last ? '\n' : '\n\n'}`;
		return string;
	},

	capitalize: function(word) {
		return word.charAt(0).toUpperCase() + word.slice(1);
	},

	document: function(title, items) {
		this.build(items);
    return this.output;
	}
}

const writer = {
	create: function(title, content, path, extention) {
		fs.mkdir(`${path}/${title}`, () => {
			fs.writeFile(`${path}/${title}/${title.toLowerCase()}${extention}`, content, () => {
				atom.notifications.addSuccess(`Step definitions created for ${title}.feature`);
			});
		});
	},

	write: function(title, content, path, extention) {

		if (fs.existsSync(`${path}/${title}/${title.toLowerCase()}${extention}`)) {
			atom.confirm({
				message: 'This file already exists, are you sure you want to override it?',
				buttons: ['Yes', 'No']
			}, response => {
				if (response === 0) {
					writer.create(title, content, path, extention);
				}
			});
		} else {
			writer.create(title, content, path, extention);
		}
	}
}

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'step-definition-generator:generate': () => this.generate(),
    }));
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
