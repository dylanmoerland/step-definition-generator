'use babel';

import fs from 'fs';

export default {
  create: function(title, content, path, extention) {
		fs.mkdir(`${path}/${title}`, () => {
			fs.writeFile(`${path}/${title}/${title}${extention}`, content, () => {
				atom.notifications.addSuccess(`Step definitions created for ${title}.feature`);
			});
		});
	},

	write: function(title, content, path, extention) {
		if (fs.existsSync(`${path}/${title}/${title}${extention}`)) {
			atom.confirm({
				message: 'This file already exists, are you sure you want to override it?',
				buttons: ['Yes', 'No']
			}, response => {
				if (response === 0) {
					this.create(title, content, path, extention);
				}
			});
		} else {
			this.create(title, content, path, extention);
		}
	}
}
