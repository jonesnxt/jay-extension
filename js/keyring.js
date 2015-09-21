// ok this file has a few different goals that it needs to get done

// it needs to
// 1. handle all of the backend signing and other thing
// 2. decrypt passphrases with keys given to this thread
// 3. tokens and transaction signs
// 4. handle all of the user password stuff, how does a user actually auth themselves...?
// 5. i have no clue...

$("document").ready(function() {

	JayDB.init();
	Contacts.init();

	JayDB.debug("contacts");

})


var JayDB = {};
JayDB.db = {};
JayDB.schema = [];


JayDB.init = function() {
	// make sure that all of the schema data is loaded into our localized db.
	JayDB.fromExt("schema", function(value) {
		console.log(value.schema);
		if(value.schema != undefined)
		{
			JayDB.schema = JSON.parse(value.schema);
			tablesLoaded = 0;
			for(var a=0;a<JayDB.schema.length;a++)
			{
				JayDB.loadDB(JayDB.schema[a], JayDB.loaded);
			}
		}
		else
		{
			JayDB.toExt("schema", "[]", JayDB.init);
		}
	})
}

var tablesLoaded = 0;
JayDB.loaded = function(name)
{
	if(++tablesLoaded == JayDB.schema.length)
	{
		JayDB.ready();
	}
}

JayDB.loadDB = function(name, callback)
{
	JayDB.fromExt("schema."+name, function(keys) {
		JayDB.fromExt(name, function(table) {
			JayDB.db[name] = {};
			JayDB.db[name].rows = JSON.parse(table[name]);
			JayDB.db[name].keys = JSON.parse(keys["schema."+name]);
			callback(name);
		});
	});
}

JayDB.ready = function() {
	console.log("db has been offloaded");
	console.log(JayDB.db);
	JayDB.insert("contacts", ["jones", "NXT-...", "1aoenudaoenut"]);
}

JayDB.createTable = function(name, schema, callback)
{
	JayDB.schema.push(name);
	JayDB.toExt("schema", JSON.stringify(JayDB.schema), function() {
		JayDB.toExt("schema."+name, JSON.stringify(schema), function() {
			JayDB.toExt(name, "[]", callback);
		})
	})
	
}

JayDB.toExt = function(key, value, callback)
{
	var obj = {};
	obj[key] = value;
	chrome.storage.local.set(obj, callback);
}

JayDB.fromExt = function(key, callback)
{
	console.log(key);
	chrome.storage.local.get(key, callback);
}

JayDB.select = function(table, a)
{

}
JayDB.insert = function(table, values, callback)
{
	JayDB.db[table].rows.push(values);
	JayDB.fromExt(table, function(val) {
		var tbl = JSON.parse(val[table]);
		tbl.push(values);
		JayDB.toExt(table, JSON.stringify(tbl), callback);
	})
}

JayDB.select = function(table, key, compare)
{
	var schema = JayDB.db[table].keys;
	var tbl = JayDB.db[table].rows;

	var ret = [];
	var k = -1;
	for(var a=0;a<schema.length;a++)
	{
		if(schema[a] == key)
		{
			k = a;
		}
	}
	if(k == -1)
	{
		console.log("Key not found");
	}
	else
	{
		for(var b=0;b<tbl.length;b++)
		{
			if(tbl[b][k] == compare)
			{
				ret.push(tbl[b]);
			}
		}
	}
	return ret;
}

JayDB.debug = function(value)
{
	chrome.storage.local.get(value, function(v) {
		console.log(v);
	})
}


var Contacts = {};

Contacts.init = function() {

}


Contacts.db = {};