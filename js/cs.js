// content script for handling jay intents raised by web applications

jQuery.noConflict();
jQuery(document).ready(function($) {

	// need to be able to 
	// - communicate with the native javascript on the jay.js library
	// - communicate with the keyring.js to sign the code when needed
	// - get the settings file that action.html keeps, probably in localstorage.

	// gets all the configuration properties from action
	var Conf = {};
	Conf.init = function()
	{
		
	}

	Conf.getProperty = function(property)
	{
		return localStoage["jay.conf."+property];
	}

	// handles talking to all the different parts of the plugin.
	var Comm = {};
	Comm.init = function()
	{
		$("jay").click(function() {
			if($("jay").attr("direction") == "ext")
			{
				var message = JSON.parse($("jay").attr("message"));
				Comm.fromPage(message);
			}
		});

		Comm.toPage("init");

		chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    		if(request.location == "cs")
    		{
    			if(request.source == "keyring")
    			{
    				Comm.fromKeyring(request, sender, callback);
    			}
    			else if(request.source == "omni")
    			{
    				Comm.fromOmni(request, sender, callback);
    			}
    			else if(request.source == "action")
    			{
    				Comm.fromAction(request, sender, callback);
    			}
    			else
    			{
    				Comm.fromUnknown(request, sender, callback);
    			}
       		}

  		});

	}

	Comm.toPage = function(message) 
	{
		message = JSON.stringify(message);
		$("jay").attr("message", message);
		$("jay").attr("direction", "page");
		$("jay").trigger("click");
	}
	Comm.fromPage = function(message)
	{
		// cool;
		// from here I'm going to have to route the message to the correct handler...
	}

	Comm.toKeyring = function(message, callback)
	{
		message.source = "cs";
		message.location = "keyring";
		chrome.runtime.sendMessage(message, callback);
	}
	Comm.fromKeyring = function(request, sender, callback)
	{

	}

	Comm.toOmni = function(message, callback)
	{
		message.source = "cs";
		message.location = "omni";
		chrome.runtime.sendMessage(message, callback);
	}
	Comm.fromOmni = function(request, sender, callback)
	{

	}

	Comm.toAction = function(message, callback)
	{
		message.source = "cs";
		message.location = "action";
		chrome.runtime.sendMessage(message, callback);
	}
	Comm.fromAction = function(request, sender, callback)
	{

	}

	Comm.fromUnknown = function(request, sender, callback)
	{
		Error.fatal("Message from unknown sender");
	}


	// the popouts, what the look like and how they are structured.
	var Dialog = {};
	Dialog.init = function()
	{

	}
	Dialog.templates = {};
	Dialog.templates.message = "<div class='jay_dialog_message'></div>";

	Dialog.show = function()
	{

	}

	var Info = {};
	Info.init = function()
	{

	}
	Info.templates = {};
	Info.templates.basic = "<div class='jay_info'></div>";

	Info.show = function()
	{

	}

	var Sec = {};
	Sec.init = function() 
	{

	}

	Sec.idk = function()
	{
		
	}

	// decoding transaction bytes and turning Jay codes into transaction bytes
	var Tx = {};
	Tx.init = function()
	{

	}
	Tx.trfToUnsignedBytes = function(trf)
	{

	}

	Tx.rewiewBytes = function(bytes)
	{

	}

	Tx.broadcastBytes = function(bytes)
	{
		// talk to the keyring here...
	}

	// converters, we all love them.
	var Cnv = {};


	var Error = {};
	Error.init = function() 
	{

	}
 
	Error.fatal = function()
	{

	}

	Error.warning = function() 
	{

	}

	// time to start up everything..
	Conf.init();
	Comm.init();
	Dialog.init();
	Tx.init();
});

