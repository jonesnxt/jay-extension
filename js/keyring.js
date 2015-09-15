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
})


var JayDB = {};
JayDB.db = {};
JayDB.schema = [];


JayDB.init = function() {
	// make sure that all of the schema data is loaded into our localized db.
	JayDB.fromExt("schema", function(value) {
		JayDB.schema = JSON.parse(value);
		tablesLoaded = 0;
		for(var a=0;a<JayDB.schema.length;a++)
		{
			JayDb.loadDB(JayDB.schema[a], JayDB.loaded);
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
			JayDB.db[name].rows = table;
			JayDB.db[name].keys = keys;
			callback(name);
		});
	});
}

JayDB.ready = function() {
	console.log("db has been offloaded");
}

JayDB.createTable = function(name, schema, callback)
{
	JayDB.schema.push(name);
	JayDB.toExt("schema", JSON.stringify(schema), function() {
		JayDB.toExt("schema."+name, JSON.stringify(schema), function() {
			JayDB.toExt(name, "[]", callback);
		})
	})
	
}

JayDB.toExt = function(key, value, callback)
{
	chrome.storage.local.set({key: value}, callback);
}

JayDB.fromExt = function(key, callback)
{
	console.log(key);
	chrome.storage.local.get(key, callback);
}

JayDB.select = function(table, a)
{

}
JayDB.insertInto = function(table, values)
{

}


var Contacts = {};

Contacts.init = function() {

}


Contacts.db = {};