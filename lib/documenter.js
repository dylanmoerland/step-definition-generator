'use babel';

export default {
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
