// ok this file has a few different goals that it needs to get done

// it needs to
// 1. handle all of the backend signing and other thing
// 2. decrypt passphrases with keys given to this thread
// 3. tokens and transaction signs
// 4. handle all of the user password stuff, how does a user actually auth themselves...?
// 5. i have no clue...

var JayDB = {};
JayDB.db = {};
JayDB.schema = [];

JayDB.init = function() {
	// make sure that all of the schema data is loaded into our localized db.
	JayDB.fromExt("schema", function(value) {
		if(value.schema != undefined)
		{
			JayDB.schema = JSON.parse(value.schema);
			tablesLoaded = 0;
			for(var a=0;a<JayDB.schema.length;a++)
			{
				JayDB.loadDB(JayDB.schema[a], JayDB.loaded);
			}

			if(JayDB.schema.length == 0)
			{
				JayDB.firsttime();
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
}

JayDB.firsttime = function() {
	// initialize a db to test
	JayDB.createTable("trf", ["trf"], function() {JayDB.ready();});
}

JayDB.createTable = function(name, schema, callback)
{
	if(JayDB.tableExists(name)) callback();
	JayDB.schema.push(name);
	JayDB.db[name] = {};
	JayDB.db[name].rows = [];
	JayDB.db[name].keys = schema;

	JayDB.toExt("schema", JSON.stringify(JayDB.schema), function() {
		JayDB.toExt("schema."+name, JSON.stringify(schema), function() {
			JayDB.toExt(name, "[]", callback);
		})
	})
}

JayDB.removeTable = function(name, callback)
{
	JayDB.schema.splice(JayDB.schema.indexOf(name), 1);
	JayDB.db[name] = undefined;
	JayDB.toExt("schema", JSON.stringify(JayDB.schema), function() {
		JayDB.toExt("schema."+name, "", function() {
			JayDB.toExt(name, "", callback);
		})
	})
}

JayDB.tableExists = function(table)
{
	return JayDB.db[table] != undefined;
}

JayDB.toExt = function(key, value, callback)
{
	var obj = {};
	obj[key] = value;
	chrome.storage.local.set(obj, callback);
}

JayDB.fromExt = function(key, callback)
{
	chrome.storage.local.get(key, callback);
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

JayDB.remove = function(table, key, compare, callback)
{
	var schema = JayDB.db[table].keys;
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
		for(var b=0;b<JayDB.db[table].rows.length;b++)
		{
			if(JayDB.db[table].rows[b][k] == compare)
			{
				JayDB.db[table].rows.splice(b, 1);
			}
		}
	}
	JayDB.toExt(table, JSON.stringify(JayDB.db[table].rows), callback);
}

JayDB.count = function(table)
{
	return JayDB.db[table].rows.length;
}

JayDB.select = function(table, key, compare)
{
	var schema = JayDB.db[table].keys;
	var tbl = JayDB.db[table].rows;

	if(key == "*")
	{
		list = [];
		for(var d=0;d<tbl.length;d++)
		{
			obj = {};
			for(var e=0;e<schema.length;e++)
			{
				obj[schema[e]] = tbl[d][e];
			}
			list.push(obj);
		}
		return list;
	}

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
				var obj = {};
				for(var c=0;c<schema.length;c++)
				{
					console.log(schema[c]);
					obj[schema[c]] = tbl[b][c];
				}
				ret.push(obj);
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