const fs = require('fs');
const { WebAPICallResult, WebClient } = require('@slack/web-api');
const DB = require('./DB');
const API = require('./API');

async function main() {
	console.log('Archiving Starting...');
	const web = new WebClient(process.env.OAUTH_ACCESS_TOKEN);
	const db = new DB('./slack-archive');
	const api = new API(
		process.env.OAUTH_ACCESS_TOKEN,
		process.env.SLACK_USERNAME
	);
	if (!db.progress.started) {
		db.db.messages = [];
		db.db.files = [];
		db.db.filemap = {};
		db.progress = {
			started: true,
			deletion: {
				messages: {
					index: null,
				},
				files: {
					index: null,
				},
			},
		};
		db.save('db');
	} else {
		console.log('Previous archive detected. Resuming...');
	}
	const paginationApiInfo = await api.getPaginationInfo();
	db.progress.pagination = {
		messages: {
			current: 1,
			total: paginationApiInfo.messages.total,
		},
		files: {
			current: 1,
			total: paginationApiInfo.files.total,
		},
	};
	db.save('progress');

	async function saveItems(type) {
		while (
			db.progress.pagination[type].current <= db.progress.pagination[type].total
		) {
			console.log(
				'Pagination %s Progress %s of %s',
				type,
				db.progress.pagination[type].current,
				db.progress.pagination[type].total
			);
			const items = await api.get(db.progress.pagination[type].current++, type);
			await db.addBatch(items, type);
			db.batchSave();
		}
	}

	async function startDeletion(type) {
		let itemIndex = db.progress.deletion[type].index || 0;
		while (itemIndex < db.db[type].length) {
			const item = db.db[type][itemIndex++];
			try {
				if (type === 'messages') {
					await web.chat
						.delete({
							channel: item.channel.id,
							ts: item.ts,
						})
						.catch((e) => console.error(JSON.stringify(e, null, 2)));
				} else {
					await web.files
						.delete({ file: item.id })
						.catch((e) => console.error(JSON.stringify(e, null, 2)));
				}
			} catch (e) {
				console.error(JSON.stringify(e, null, 2));
			}
			db.progress.deletion[type].index = itemIndex;
			db.save('progress');
		}
	}

	// SAVE ALL MESSAGES
	console.log('Saving Messages...');
	await saveItems('messages');

	// SAVE ALL FILES
	console.log('Saving Files...');
	await saveItems('files');

	console.log('BATCH SAVING COMPLETE');
	console.log('Starting deletion...');

	await startDeletion('messages');
	await startDeletion('files');
}

main();
