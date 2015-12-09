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

	Dialog.txReq = function(msg, callback)
	{
		$("body").append(Dialog.templates.txReqBef+msg+Dialog.templates.txReqAft);
		Trs.propTween(".jay-dialog", "opacity", 1, 200, Trs.eases.sqrt);
		$("#jay_cancel").click(function() {
			Dialog.close(function() {
				Comm.toPage("false");
				callback(false);
			});
		});
		$("#jay_accept").click(function() {
			Dialog.close(function() {
				Comm.toPage("true");
				callback(true);
			});
		});
	}

	Dialog.close = function(msg, callback)
	{
		Trs.propTween(".jay-dialog", "opacity", 0, 200, Trs.eases.sqrt, function(){
			$(".jay-dialog").remove();
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
	var Tx = {};
	Tx.init = function()
	{

	}

	Tx.types = {};
	Tx.subtypes = {};

	Tx.oneNxt = new BigInteger("100000000");	
	Tx.types.payment = 0;
	Tx.types.messaging = 1;
	Tx.types.asset = 2;
	Tx.types.marketplace = 3;
	Tx.types.accountControl = 4;
	Tx.types.monetarySystem = 5;
	Tx.types.supernet = 100;

	Tx.subtypes.ordinaryPayment = 0;
	Tx.subtypes.arbitraryMessage = 0;
	Tx.subtypes.aliasAssignment = 1;
	Tx.subtypes.pollCreation = 2;
	Tx.subtypes.voteCasting = 3;
	Tx.subtypes.hubAnnouncement = 4;
	Tx.subtypes.accountInfo = 5
	Tx.subtypes.aliasSell = 6;
	Tx.subtypes.aliasBuy = 7;
	Tx.subtypes.aliasDelete = 8;
	Tx.subtypes.assetIssuance = 0;
	Tx.subtypes.assetTransfer = 1;
	Tx.subtypes.askOrderPlacement = 2;
	Tx.subtypes.bidOrderPlacement = 3;
	Tx.subtypes.askOrderCancellation = 4;
	Tx.subtypes.bidOrderCancellation = 5;
	Tx.subtypes.goodsListing = 0;
	Tx.subtypes.goodsDelisting = 1;
	Tx.subtypes.priceChange = 2;
	Tx.subtypes.quantityChange = 3;
	Tx.subtypes.purchase = 4;
	Tx.subtypes.delivery = 5;
	Tx.subtypes.feedback = 6;
	Tx.subtypes.refund = 7;
	Tx.subtypes.balanceLeasing = 0;
	Tx.subtypes.currencyIssuance = 0;
	Tx.subtypes.reserveIncrease = 1;
	Tx.subtypes.reserveClaim = 2;
	Tx.subtypes.currencyTransfer = 3;
	Tx.subtypes.exchangeOffer = 4;
	Tx.subtypes.exchangeBuy = 5;
	Tx.subtypes.exchangeSell = 6;
	Tx.subtypes.currencyMinting = 7;
	Tx.subtypes.currencyDeletion = 8;
	Tx.subtypes.verifyMgwDepositAddrV1 = 0;

	Tx.appendages = {};
	Tx.appendages.none = 0;
	Tx.appendages.message = 1;
	Tx.appendages.encryptedMessage = 2;
	Tx.appendages.publicKeyAnnouncement = 4;
	Tx.appendages.encryptedMessageToSelf = 8;
	Tx.appendages.phasedTransaction = 16;


	Tx.transactionVersion = 1;
	Tx.TRFVersion = 1;


	Tx.handle = function(trf)
	{
		var bytes = Tx.trfToUnsignedBytes(trf);

		console.log(bytes);

		// k now lets get some data...?

		var type = bytes[0];
		var subtype = bytes[1] % 16;
		var sender = getAccountIdFromPublicKey(converters.byteArrayToHexString(bytes.slice(8, 8+32)), true);
		var r = new NxtAddress();
		r.set(byteArrayToBigInteger(bytes.slice(40, 48)).toString());
		var recipient = r.toString();
		var amount = byteArrayToBigInteger(bytes.slice(48, 48+8));
		var fee = byteArrayToBigInteger(bytes.slice(56, 56+8));

		var message = "";

		if(type == Tx.types.payment)
		{
			if(subtype == Tx.subtypes.ordinaryPayment)
			{
				message += Tx.bold("Send ",Tx.formatNxt(amount)," to ",recipient," with a ",Tx.formatNxt(fee)," fee");
			}
		}

		message += "?";

		Dialog.txReq(message, function(res) {
			
		})
	}

	Tx.formatNxt = function(nxt)
	{
		return nxt.divide(Tx.oneNxt).toString()+" NXT";
	}

	Tx.trfToUnsignedBytes = function(trfBytes)
	{
		var bytes = base62Decode(trfBytes.substring(4));
		console.log(bytes);
		if(bytes[0] == '1' || bytes[0] == '2')
		{
			bytes = bytes.slice(1);
			if(bytes.length == 31) bytes = bytes.slice(0, 30);

			var collect = [];
			collect = [bytes[0],bytes[1]]; // type ver & subtype
			collect = collect.concat(nxtTimeBytes()); // timestamp
			collect = collect.concat(wordBytes(1440)); // deadline
			var senderPubKey = converters.hexStringToByteArray(Tx.me.publicKey);
			collect = collect.concat(senderPubKey);
			collect = collect.concat(bytes.slice(2, 2+8)); // recipient/genesis
			collect = collect.concat(bytes.slice(10, 10+8)); // amount
			collect = collect.concat(bytes.slice(18, 18+8)); // fee
			collect = collect.concat(pad(32, 0)); // reftxhash
			collect = collect.concat(pad(64, 0)); // signature bytes
			collect = collect.concat(bytes.slice(26, 26+4)); // flags
			collect = collect.concat(pad(4, 0)); // EC blockheight
			collect = collect.concat(pad(8, 0)); // EC blockid
			if(bytes.length > 30) collect = collect.concat(bytes.slice(30)); // attachment/appendages
			
			return collect;
		}
		else 
		{
			Error.fatal("incorrect trf byte version");
			return false;
		}
	}

	Tx.me = {};
	Tx.me.publicKey = "256a084705a5ddd1f8b9b3e81d08f7493a99a50a9582f7d6995df07c32076309";


	Tx.bold = function()
	{
		var output = "";
		for(var i=0;i<arguments.length;i++)
		{
			if(i%2 == 1) output += "<strong>"+arguments[i]+"</strong>";
			else output += arguments[i];
		}
		return output;
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
 
	Error.fatal = function(msg)
	{
		console.log(msg);
	}

	Error.warning = function() 
	{

	}

	Util = {};

	Util.xss = function(val) {
		if(val == undefined) return undefined;
	    if(typeof(val) != String) return val;
	    return val.replace("&","&amp;").replace("<", "&lt;").replace(">","&gt;").replace('"', '&quot;').replace("'", "&#x27;").replace("/", "&#x2F;");
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

