// the jay library to make things work...

var Jay = {};

Jay.init = function() {

	Jay.util.loadFont();
	document.body.appendChild(document.createElement("jay"));
	Jay._ = document.querySelectorAll("jay")[0];
	Jay._.addEventListener('click', function() {
		if(Jay._.getAttribute("direction") == "page")
		{
			var message = JSON.parse(Jay._.getAttribute("message"));
			Jay.internal.handleComm(message);
		}
	}, false);

	Jay.nxt.init();
	Jay.cs.init();
}

Jay.hasExtension = false;
Jay.getExtension = function()
{
}

Jay.internal = {};

Jay.internal.sendMessage = function(message) 
{
	message = JSON.stringify(message);
	Jay._.setAttribute("message", message);
	Jay._.setAttribute("direction", "ext");
	Jay._.click();
}

Jay.internal.handleComm = function(message) 
{
	console.log(message)
}


Jay.types = {};
Jay.subtypes = {};

Jay.oneNxt = 100000000;	
Jay.types.payment = 0;
Jay.types.messaging = 1;
Jay.types.asset = 2;
Jay.types.marketplace = 3;
Jay.types.accountControl = 4;
Jay.types.monetarySystem = 5;
Jay.types.supernet = 100;

Jay.subtypes.ordinaryPayment = 0;
Jay.subtypes.arbitraryMessage = 0;
Jay.subtypes.aliasAssignment = 1;
Jay.subtypes.pollCreation = 2;
Jay.subtypes.voteCasting = 3;
Jay.subtypes.hubAnnouncement = 4;
Jay.subtypes.accountInfo = 5;
Jay.subtypes.aliasSell = 6;
Jay.subtypes.aliasBuy = 7;
Jay.subtypes.aliasDelete = 8;
Jay.subtypes.assetIssuance = 0;
Jay.subtypes.assetTransfer = 1;
Jay.subtypes.askOrderPlacement = 2;
Jay.subtypes.bidOrderPlacement = 3;
Jay.subtypes.askOrderCancellation = 4;
Jay.subtypes.bidOrderCancellation = 5;
Jay.subtypes.goodsListing = 0;
Jay.subtypes.goodsDelisting = 1;
Jay.subtypes.priceChange = 2;
Jay.subtypes.quantityChange = 3;
Jay.subtypes.purchase = 4;
Jay.subtypes.delivery = 5;
Jay.subtypes.feedback = 6;
Jay.subtypes.refund = 7;
Jay.subtypes.balanceLeasing = 0;
Jay.subtypes.currencyIssuance = 0;
Jay.subtypes.reserveIncrease = 1;
Jay.subtypes.reserveClaim = 2;
Jay.subtypes.currencyTransfer = 3;
Jay.subtypes.exchangeOffer = 4;
Jay.subtypes.exchangeBuy = 5;
Jay.subtypes.exchangeSell = 6;
Jay.subtypes.currencyMinting = 7;
Jay.subtypes.currencyDeletion = 8;
Jay.subtypes.verifyMgwDepositAddrV1 = 0;

Jay.appendages = {};
Jay.appendages.none = 0;
Jay.appendages.message = 1;
Jay.appendages.encryptedMessage = 2;
Jay.appendages.publicKeyAnnouncement = 4;
Jay.appendages.encryptedMessageToSelf = 8;
Jay.appendages.phasedTransaction = 16;


Jay.transactionVersion = 1;
Jay.TRFVersion = 1;



Jay.nxt = {};
Jay.nxt.init = function()
{

}

Jay.nxt.request = function()
{

}


Jay.finishTrf = function(trfBytes)
{
	return "TX_" + Jay.base62_encode(trfBytes);
}


Jay.nxt.createTrfBytes = function(type, subtype, recipient, amount, fee, attachment, appendages)
{
	var trf = [];
	trf.push(Jay.TRFVersion);
	trf.push(type);
	trf.push((subtype) + (Jay.transactionVersion << 4));
	trf = trf.concat(Jay.util.rsToBytes(recipient));
	trf = trf.concat(Jay.util.numberToBytes(Math.round(amount*Jay.oneNxt)));
	trf = trf.concat(Jay.util.numberToBytes(Math.round(fee*Jay.oneNxt)));
	if(appendages == undefined) trf = trf.concat([0,0,0,0]);
	else trf = trf.concat(appendages.flags);
	if(attachment != undefined) trf = trf.concat(attachment);
	if(appendages != undefined) trf = trf.concat(Jay.util.combineAppendages(appendages));
	return Jay.util.positiveByteArray(trf);
}

Jay.nxt.createTrf = function(type, subtype, recipient, amount, fee, attachment, appendages)
{
	var trfBytes = Jay.nxt.createTrfBytes(type, subtype, recipient, amount, fee, attachment, appendages);
	return Jay.nxt.finishTrf(trfBytes);
}

Jay.nxt.finishTrf = function(trfBytes)
{
	return "JAY_" + Jay.util.base62_encode(trfBytes);
}

Jay.nxt.sendTx = function(trf)
{
	console.log("sending");
	Jay.internal.sendMessage(trf);
}

Jay.nxt.sendMoney = function(recipient, amount, appendages) 
{
	var trf = Jay.nxt.createTrf(Jay.types.payment, Jay.subtypes.ordinaryPayment, recipient, amount, 1, undefined, appendages);
	Jay.nxt.sendTx(trf);
}

Jay.nxt.getAddress = function()
{

}

Jay.nxt.decryptMessage = function()
{

}

// ...

Jay.btc = {};
Jay.btc.init = function()
{

}

Jay.btc.send = function(address, amount)
{

}

Jay.btc.getAddress = function()
{

}

Jay.mgw = {};
Jay.mgw.init = function()
{

}

Jay.mgw.send = function(asset, address, amount)
{

}

Jay.mgw.getAddress = function(asset)
{

}

Jay.token = {};
Jay.token.generate = function(data)
{

}

Jay.token.parse = function(data, token)
{

}

Jay.auth = {};
Jay.auth.init = function()
{

}

Jay.auth.login = function()
{

}

Jay.cs = {};
Jay.cs.init = function()
{

}

Jay.cs.dialog = function(message)
{

}

Jay.cs.info = function(message)
{

}

Jay.util = {};

Jay.util.base62_encode = function(bytes) 
{
	var value = Jay.util.bytesToBigInteger(bytes);
	var buf = "";
	while ((new BigInteger("0")).compareTo(value) < 0) {
		var divRem = value.divideAndRemainder(new BigInteger("62"));
		var remainder = divRem[1].intValue();
	  
		if (remainder < 10) 
		{
			buf += String.fromCharCode(remainder + '0'.charCodeAt(0));
		}
		else if (remainder < 10 + 26) 
		{
			buf += String.fromCharCode(remainder + 'A'.charCodeAt(0) - 10);
		} 
		else 
		{
			buf += String.fromCharCode(remainder + 'a'.charCodeAt(0) - 10 - 26);
		}
	  
		value = divRem[0];
	}
	buf = buf.split("").reverse().join("");
	return buf;
}

Jay.util.bytesToBigInteger = function(bytes)
{
	var bi = new BigInteger("0");
	for(var a=0; a<bytes.length; a++)
	{
		bi = bi.multiply(new BigInteger("256"));
		//var term = (new BigInteger(bytes[a].toString())).multiply(multiplier);
		bi = bi.add(new BigInteger(bytes[a].toString()));

	}
	return bi;
}

Jay.utilepoch = 1385294400;

Jay.util.getNxtTime = function()
{
	return Math.floor(Date.now() / 1000) - Jay.epoch;
}


Jay.util.pad = function(length, val) 
{
	var array = [];
	for (var i = 0; i < length; i++) 
	{
    	array[i] = val;
	}
	return array;
}

Jay.util.positiveByteArray = function(byteArray)
{
	return converters.hexStringToByteArray(converters.byteArrayToHexString(byteArray));
}

Jay.util.rsToBytes = function(rs)
{
	var rec = new NxtAddress();
	rec.set(rs);
	var recip = (new BigInteger(rec.account_id())).toByteArray().reverse();
	if(recip.length == 9) recip = recip.slice(0, 8);
	while(recip.length < 8) recip = recip.concat(Jay.util.pad(1, 0));
	return recip;
}

Jay.util.secretPhraseToPublicKey = function(secretPhrase) 
{
	var secretPhraseBytes = converters.stringToByteArray(secretPhrase);
	var digest = simpleHash(secretPhraseBytes);
	return curve25519.keygen(digest).p;
}

Jay.publicKeyToAccountId = function(publicKey, RSFormat)
{
	var hex = converters.hexStringToByteArray(publicKey);

	_hash.init();
	_hash.update(hex);

	var account = _hash.getBytes();

	account = converters.byteArrayToHexString(account);

	var slice = (converters.hexStringToByteArray(account)).slice(0, 8);

	var accountId = byteArrayToBigInteger(slice).toString();

	if (RSFormat) {
		var address = new NxtAddress();

		if (address.set(accountId)) {
			return address.toString();
		} else {
			return "";
		}
	} else {
		return accountId;
	}
}

Jay.util.numberToBytes = function(num)
{
	var bytes = (new BigInteger((num).toString())).toByteArray().reverse();
	if(bytes.length == 9) bytes = bytes.slice(0, 8);
	while(bytes.length < 8) bytes = bytes.concat(Jay.util.pad(1, 0));
	return bytes;
}

Jay.util.loadFont = function()
{
	WebFontConfig = {
	    google: { families: [ 'Roboto:400,100,700:latin' ] }
	  };
	  (function() {
	    var wf = document.createElement('script');
	    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
	      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	    wf.type = 'text/javascript';
	    wf.async = 'true';
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(wf, s);
	  })();
}


function ready(fn) 
{
	if(document.readyState != 'loading') 
	{
		fn();
	}
	else
	{
	document.addEventListener('DOMContentLoaded', fn);
	}
}

Jay.init();