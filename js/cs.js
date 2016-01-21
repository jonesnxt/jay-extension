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

		console.log(message);

		if(message.search("JAY") == 0)
		{
			Tx.handle(message);
		}

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
		console.log("sending");
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
	Dialog.templates.txReqBef = '<div style="opacity: 0;" class="jay-dialog"><div class="jay-dialog-content"><div class="jay-dialog-body"><h2>Transaction Request<img class="jay-logo" src="'+chrome.extension.getURL("./img/jay.png")+'"></h2><p class="msg">';
	Dialog.templates.txReqAft = '</p></div><div class="jay-dialog-btn"><button id="jay_cancel" type="button" class="jay-btn">CANCEL</button> <button id="jay_accept" type="button" class="jay-btn">ACCEPT</button></div></div></div>';

	Dialog.templates.txReqAbove = '<div style="opacity: 0;" class="jay-dialog"><div class="jay-dialog-content"><div class="jay-dialog-body"><h2>Transaction Requested<img class="jay-logo" src="'+chrome.extension.getURL("./img/jay.png")+'"></h2><p class="msg">Please click the <strong>extension button</strong> next to the address bar to complete this transaction.</p></div><div class="jay-dialog-btn"><button id="jay_cancel" type="button" class="jay-btn">CANCEL</button></div></div></div>';

	/*Dialog.txReq = function(msg, bytes, callback)
	{
		$("body").append(Dialog.templates.txReqBef+msg+Dialog.templates.txReqAft);
		$(".jay-dialog .msg strong").each(function() {
			$(this).html($(this).text());
	});
		Trs.propTween(".jay-dialog", "opacity", 1, 200, Trs.eases.sqrt);
		$("#jay_cancel").click(function() {
			Dialog.close(function() {
				Comm.toPage("false");
				callback(false, bytes);
			});
		});
		$("#jay_accept").click(function() {
			Dialog.close(function() {
				Comm.toPage("true");
				callback(true, bytes);
			});
		});
	}*/

	Dialog.txReq = function(callback)
	{
		$("body").append(Dialog.templates.txReqAbove);

		Trs.propTween(".jay-dialog", "opacity", 1, 200, Trs.eases.sqrt);

		$("#jay_cancel").click(function() {
			Dialog.close(function() {
				Comm.toPage("false");
				callback(false);
			})
		})

	}

	Dialog.close = function(callback)
	{
		Trs.propTween(".jay-dialog", "opacity", 0, 200, Trs.eases.sqrt, function() {
			$(".jay-dialog").remove();
			callback();
		});

	}

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
	

	// converters, we all love them.
	var Cnv = {};


	var Error = {};
	Error.init = function() 
	{

	}
 
	Error.fatal = function(msg)
	{
		console.log(msg);
	}

	Error.warning = function() 
	{

	}

	Util = {};

	Util.xss = function(val) {
	    return val.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g,"&gt;").replace(/"/g, '&quot;').replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
	}




var Trs = {};
Trs.eases = {};
Trs.eases.linnear = function(x) { return x; };
Trs.eases.quadradic = function(x) { return x*x; };
Trs.eases.cubic = function(x) { return x*x*x; };
Trs.eases.sqrt = function(x) { return Math.sqrt(x); };
Trs.eases.sine = function(x) { return Math.sin(x*(3.14/2)); };

Trs.propTween = function(item, property, end, duration, ease, callback)
{
	var fps = 40;

	var stepms = 1000/fps;
	var steps = parseInt(duration/stepms);
	var steplen = 1/steps;

	var startval = $(item).css(property); 
	var addend = "";
	console.log(startval);
	if(isNaN(startval))
	{
		if(startval[startval.length-1] == 'x')
		{
			startval = Number(startval.substr(0, startval.length-2));
			addend = "px";
		}
		else if(startval[startval.length-1] == '%')
		{
			startval = Number(startval.substr(0, startval.length-1));
			addend = '%';
		}
	}
	startval = Number(startval);

	var width = (end - startval);

	var counter = 0;
	var accum = 0;
	var inv = setInterval(function() {
		if(++counter == steps)
		{
			$(item).css(property, end+addend);
			clearInterval(inv);
			if(callback != undefined) callback();
		}
		else
		{
			accum += steplen;
			$(item).css(property, ((width*ease(accum))+startval)+addend);
		}
		
	}, stepms);
}

	// time to start up everything..
	Conf.init();
	Comm.init();
	Dialog.init();
	Tx.init();
});

