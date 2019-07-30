'use babel';

import documenter from './documenter';

const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

export default {
	title: null,
	items: null,
	types: ['Given', 'When', 'Then', 'And', 'But'],

	getItems: function(rows) {
		return rows.reduce((accumulator, currentValue) => {
			const item = this.withType(currentValue);

			if (item) {
				accumulator.push(item);
			}

			return accumulator;
		}, []);
	},

	withType: function(item) {
		const type = this.types.find((type) => {
			return item.trim().toLowerCase().indexOf(type.toLowerCase()) === 0;
		});

		if (type) {
			return {
				item: item.trim(),
				type,
			};
		}

		return null;
	},

	cleanParameters: function(items) {
		const pattern = atom.config.get('step-definition-generator.useSingleQuotesInFeatures')
			? new RegExp('\'(.*?)\'')
			: new RegExp('"(.*?)"');

		return items.map((item) => {
			let counter = 0;
			while (pattern.test(item)) {
				item = item.replace(pattern, `{${letters[counter]}}`);
				counter++;
			}
			return item;
		});
	},

	resolveTypes: function(items) {
		return items.map((item, index) => {
			if (item.type !== 'And' && item.type !== 'But') {
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
			if (!accumulator.find((item) => item.item === currentValue.item && item.type === currentValue.type)) {
				return [...accumulator, currentValue];
			}

			return accumulator;
		}, []);
	},

	init: function(data) {
		this.title = data.title.split('.')[0];
		this.items = this.withParameters(this.orderByType(this.withoutDuplicates(this.resolveTypes(this.getItems(this.cleanParameters(data.content))))));

		return {
      title: this.title,
      output: documenter.document(this.title, this.items)
    };
	}
}
