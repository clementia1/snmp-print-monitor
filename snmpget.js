const snmp = require ("net-snmp");

/*
mongodb://admin:Pa$$w0rD@ds125945.mlab.com:25945/snmp-print-monitor
oid: [1, 3, 6, 1, 2, 1, 43, 10, 2, 1, 4, 1, 1] - всего напечато страниц
snmpwalk -Cc -v 1 -c public print102466229 1.3.6.1.2.1.43.10.2.1.4.1.1
print102466251 - финансы
print10486239 - профобучение
print102466279 - бухгалтерия 205 каб


function getTotalPagesPrinted(url, callback) {
	let session = new snmp.Session({
		host: url
	});
	session.get({
		oid: [1, 3, 6, 1, 2, 1, 43, 10, 2, 1, 4, 1, 1]
	}, function (error, varbinds) {
		if (error) {
			console.log('An error occured');
			session.close();
		} else {
			console.log(varbinds[0].oid + ' = ' + varbinds[0].value + ' (' + varbinds[0].type + ')');
			session.close();
			return callback(varbinds[0].value);
		}
	});
}*/

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



getTotalPagesPrinted('Canon56FC68')
