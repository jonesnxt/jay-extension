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

	}

	Comm.toPage = function(message)
	{

	}
	Comm.toKeyring = function(message)
	{

	}
	Comm.toAction = function(message)
	{
		
	}

	// the popouts, what the look like and how they are structured.
	var Modal = {};
	Modal.init = function()
	{

	}

	// decoding transaction bytes and turning Jay codes into transaction bytes
	var Tx = {};
	Tx.

	// converters, we all love them.
	var Cnv = {};
	

});

