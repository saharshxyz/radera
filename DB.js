const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');

class DB {
	progress;
	progressPath;
	dbPath;
	attachmentsFolderPath;
	db;

	constructor(dirPath) {
		const normalPath = path.normalize(dirPath);
		fs.ensureDirSync(normalPath);
		this.dir = normalPath;

		this.progressPath = path.join(normalPath, 'progress.json');
		this.dbPath = path.join(normalPath, 'db.json');
		this.attachmentsFolderPath = path.join(normalPath, 'attachments');
		fs.ensureDirSync(this.attachmentsFolderPath);

		function readIntoMemory(path) {
			return fs.existsSync(path) ? fs.readJsonSync(path) : {};
		}

		this.progress = readIntoMemory(this.progressPath);
		this.db = readIntoMemory(this.dbPath);
	}

	save(file) {
		switch (file) {
			case 'db':
				fs.writeFileSync(this.dbPath, JSON.stringify(this.db));
				break;
			case 'progress':
				fs.writeFileSync(this.progressPath, JSON.stringify(this.progress));
				break;
			default:
				throw 'unknown file';
		}
	}

	batchSave() {
		this.save('db');
		this.save('progress');
	}

	addMessageBatch(messages) {
		messages.forEach((message) => {
			if (
				this.db.messages.findIndex(
					(dbMessage) => dbMessage.iid === message.iid
				) >= 0
			) {
				return;
			}
			/* if(message.channel.is_group || message.channel.is_im || message.channel.is_mpim){
                return;
            }*/
			this.db.messages.push(message);
		});
	}

	async addFileBatch(files) {
		for (let file of files) {
			if (this.db.files.findIndex((dbFile) => dbFile.id === files.id) >= 0) {
				return;
			}
			/* if(file.groups.length > 0 || file.ims.length > 0){
                return;
            }*/
			this.db.files.push(file);
			const fileData = await fetch(file.url_private, {
				headers: {
					Authorization: `Bearer ${process.env.OAUTH_ACCESS_TOKEN}`,
				},
			}).then((resp) => resp.buffer());
			fs.writeFileSync(
				path.join(
					this.attachmentsFolderPath,
					`${file.id}.${file.name.split('.').pop()}`
				),
				fileData
			);
		}
	}

	addBatch(items, type) {
		return type === 'messages'
			? this.addMessageBatch(items)
			: this.addFileBatch(items);
	}
}

module.exports = DB;
