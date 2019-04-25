const snmp = require ('net-snmp');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const Timestamp = require('mongodb').Timestamp;
const url = 'mongodb://yourusername:yourpassword:25945/snmp-print-monitor';
const mongoClient = new MongoClient(url, {
	useNewUrlParser: true
});

function getTotalPagesPrinted(url, callback) {
	const options = {
	    retries: 10,
	    timeout: 5000,
	    version: snmp.Version1
	};
	let session = snmp.createSession(url, "public", options);
	let oid = ["1.3.6.1.2.1.43.10.2.1.4.1.1"];

	session.get(oid, function (error, varbinds) {
	    if (error) {
		console.error(error.toString());
		session.close();
	    } else {
		console.log(varbinds[0].oid + ' = ' + varbinds[0].value + ' (' + varbinds[0].type + ')');		
		return callback(varbinds[0].value);
		session.close();
	    }
	});
}

let currentdate = new Date();
let currentdatems = currentdate.getTime();

/* (async () => {
	let client = await MongoClient.connect(url, {
		useNewUrlParser: true
	});
	let db = client.db("snmp-print-monitor");
	try {
		const documents = await db.collection("printers").find({}).toArray();
		await documents.forEach((item) => {
			getTotalPagesPrinted(item['device-hostname'], function (response) {
				(async () => {
					let client = await MongoClient.connect(url, {
						useNewUrlParser: true
					});
					let db = client.db("snmp-print-monitor");
					try {
						await db.collection("printers").updateOne({
							_id: item._id
						}, {
							$push: {
								pageCounter: {
									[currentdatems]: response
								}
							}
						});
					} finally {
						client.close();
					}
				})()
				.catch(err => console.error(err));
			});
		});
	} finally {
		client.close();
	}
})()
.catch(err => console.error(err)); */

function pushPageCounterToDb(printer) {
	getTotalPagesPrinted(printer, function (response) {
		(async () => {
			let client = await MongoClient.connect(url, {
				useNewUrlParser: true
			});
			let db = client.db("snmp-print-monitor");
			let isodate = new Date().toISOString()
			try {
				await db.collection(printer).insertOne({
					pageCounter: response,
					timestamp: isodate
				});
			} finally {
				client.close();
			}
		})()
		.catch(err => console.error(err));
	});
}

// pushPageCounterToDb('print102466251');

function findByTimestampRange(collection) {
	(async () => {
		let client = await MongoClient.connect(url, {
			useNewUrlParser: true
		});
		let db = client.db("snmp-print-monitor");
		let currentdate = new Date().toISOString()
		try {
			await db.collection(collection).find({
				timestamp: {
					/* $gte: ISODate("2010-04-29T00:00:00.000Z"), */
					$lt: currentdate
				}
			}).toArray(function(err, result) {
				if (err) throw err;
				console.log(result);
			});
		} finally {
			client.close();
		}
	})()
	.catch(err => console.error(err));
}


async function findAll(collection) {
	let client = await MongoClient.connect(url, {
		useNewUrlParser: true
	});
	let db = client.db("snmp-print-monitor");
	try {
		await db.collection(collection).find().toArray(function(err, result) {
			if (err) throw err;
		});
	} finally {
		client.close();
	}
}

async function updatePrinterCounters() {
	let client = await MongoClient.connect(url, {
		useNewUrlParser: true
	});
	let db = client.db("snmp-print-monitor");
	try {
		await db.collection('printerList').find().toArray(function(err, result) {
			if (err) throw err;
			result.forEach((item) => {
				pushPageCounterToDb(item['device'])
			})
		});
	} finally {
		client.close();
	}
}

setTimeout(function () {
	updatePrinterCounters();
}, 900000);


setInterval(function () {
	updatePrinterCounters();
}, 7200000);


