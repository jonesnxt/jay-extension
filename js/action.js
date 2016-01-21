// browser action scripting...

$(document).ready(function() {

	Auth.init();


	$("#jay_activate_sidebar").click(function() {
		Page.show("#jay_sidebar");
		$("#jay_sidebar").css("left", "-200px");

		Trs.propTween("#jay_sidebar", "left", 0, 200, Trs.eases.sqrt);


		setTimeout(function() {Page.hasSidebar = true;}, 1);
	});

	$("#jay_action").click(function() {
		if(Page.hasSidebar)
		{
			Trs.propTween("#jay_sidebar", "left", -200, 200, Trs.eases.sqrt, function() {
				Page.hide("#jay_sidebar");
				Page.hasSidebar = false;
			});
		}
	});

	$(".jay-siderow").click(function() {
		var page = "#jay_"+$(this).attr("id").substr(11);
		Page.change(page);
	});

	$(".jay-checkbox").click(Dash.checkbox);

	$("#jay_name").click(Dash.nameDropper);

	Comm.init();
	Page.init();
	Req.init();
	Dash.init();
	//Contacts.init();
});

var Page = {};
Page.hasSidebar = false;
Page.current = "#jay_dashboard";

Page.init = function()
{
	if(localStorage["jay.action.page"] != undefined)
	{
		Page.change(localStorage["jay.action.page"]);
	}
	else
	{
		localStorage["jay.action.page"] = Page.current;
	}
	chrome.browserAction.setBadgeBackgroundColor({
    'color': '#FF0000'
  });
}

Page.show = function(id)
{
	$(id).css("display", "block");
}

Page.hide = function(id)
{
	$(id).css("display", "none");
}

Page.change = function(page)
{
	if(Page.current == page) return;

	var oldpage = Page.current;
	Trs.propTween(oldpage, "opacity", 0, 200, Trs.eases.linnear, function() {
		Page.hide(oldpage);
	});
 
	Page.current = page;
	localStorage["jay.action.page"] = page;
	$(".jay-siderow").removeClass("jay-active");
	$("#jay_option_"+(page.substr(5))).addClass("jay-active");
	$("#jay_page_name").text(page.substr(5));
	Page.show(Page.current);
	$(Page.current).css("opacity", "0");
	Trs.propTween(Page.current, "opacity", 1, 200, Trs.eases.linnear);
}

// checks for trf or auth txs to validate
var Auth = {};
Auth.init = function() {
	Comm.toDB({"requestType":"count","params":["trf"]}, function(amt) {
		if(amt > 0) Auth.handleTx();
	});
}

Auth.handleTx = function() {
	console.log("handling tx");

	Comm.toDB({"requestType":"select","params":["trf","*"]}, function(rows)
	{
		var trf = rows[0].trf;
		var bytes = Tx.trfToUnsignedBytes(trf);
		var text = Tx.bytesToString(bytes);

		$("#jay_req_msg").html(text);
		$("#jay_req").css("display","block");
	});
}


var Comm = {};
Comm.init = function() {
	chrome.runtime.onMessage.addListener(Comm.fromCS);
}

Comm.toDB = function(msg, callback)
{
	msg.location = "db";
	msg.source = "action";
	chrome.runtime.sendMessage(msg, callback);
}


Comm.toKeyring = function(message, callback)
{
	message.source = "action";
	message.location = "keyring";
	chrome.runtime.sendMessage(message, callback);
}

Comm.fromCS = function(request, sender, sendResponse)
{
	if(request.requestType == "trf")
	{
		setTimeout(Auth.handleTx, 60);
	}
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

var Acc = {};

Acc.rs = "NXT-RJU8-JSNR-H9J4-2KWKY";

var Req = {};

Req.init = function() {

}

Req.nxt = function(type, params, callback)
{
	params.requestType = type;
	$.post("http://jnxt.org:7876/nxt", params, callback, "json").fail(Req.fail);
}

Req.fail = function()
{
	// err msg part thing here or something.....
	console.log("error in nxt request");
}

var Dash = {};

Dash.init = function() {
	// ok I need to do a few things here
	// 1. get the balances and txs 

	Req.nxt("getBalance", {"account": Acc.rs}, function(resp)
	{
		Dash.setNxtBalance(resp.unconfirmedBalanceNQT);
	});

	Req.nxt("getBlockchainTransactions", {"account": Acc.rs, "lastIndex":19}, function(resp)
	{
		Dash.clearTransactions();
		for(var i=resp.transactions.length-1;i>=0;i--)
		{
			Dash.addTransaction(resp.transactions[i]);
		}

	});
	Dash.setBtcBalance(153000000);

}

Dash.txs = function() {

}


Dash.auto = function() {
	
}

Dash.nameDropper = function() {
	console.log("natoeduasoetu")

	if($("#jay_name_dropper").css("display") == "none")
	{
		// show the thing.
		$("#jay_name_dropper").css("display", "block");
		$("#jay_name_dropper").css("opacity", "0");
		Trs.propTween("#jay_name_dropper", "opacity", 1, 200, Trs.eases.sqrt);
	}
	else
	{
		// hide the thing.
		$("#jay_name_dropper").css("opacity", 1);
		Trs.propTween("#jay_name_dropper", "opacity", 0, 200, Trs.eases.linnear, function() {
			$("#jay_name_dropper").css("display","none");
		})

	}
}


Dash.setNxtBalance = function(balanceNQT)
{
	var nxts = balanceNQT / 100000000;
	var places = Math.floor(nxts).toString().length;
	if((places >= 6))
	{
		nxts = nxts/1000;
		places -= 3;
		$("#jay_nxt_balance_base").text("kNXT");
	}
	else $("#jay_nxt_balance_base").text("NXT");



	$("#jay_nxt_balance").attr("title", nxts+" NXT");
	$("#jay_nxt_balance").text(Util.formatNumber(nxts, "'",  (5-places)));
}

Dash.setBtcBalance = function(satoshis)
{
	var places = Math.floor(satoshis).toString().length;
	var btc = 0;
	if((places <= 4))
	{
		btc = satoshis/100;
		places += 6;
		$("#jay_btc_balance_base").text("bits");
	}
	else if((places <= 7))
	{
		btc = satoshis/100000;
		places += 3;
		$("#jay_btc_balance_base").text("mBTC");
	}
	else
	{
		btc = satoshis/100000000;
		$("#jay_btc_balance_base").text("BTC");
	} 

	var places = Math.floor(btc).toString().length;

	$("#jay_btc_balance").attr("title", (satoshis/100000000)+" BTC");
	$("#jay_btc_balance").text(Util.formatNumber(btc, "'",  (4-places)));
}

Dash.clearTransactions = function()
{
	$("#jay_tx_table tbody").empty();
	Dash.addLoadMoreTxButton();
}

Dash.addTransaction = function(tx)
{
	var type = Tx.getType(tx.type,tx.subtype);
	var row = "";
	row += "<tr>";
	row += "<td>"+Tx.getType(tx.type, tx.subtype)+"</td>";
	row += Tx.getData(tx);
	row += "<td title='"+tx.senderRS+"''>"+Tx.parseAccount(tx.senderRS, tx.recipientRS)+"</td>";
	row += "<td>"+Util.timeAgo(tx.timestamp, true)+"</td>";
	$("#jay_tx_table").prepend(row);
}

Dash.addLoadMoreTxButton = function() 
{
	return 0;
}

Dash.checkbox = function() {
	if($(this).attr("checked"))
	{
		$(this).removeAttr("checked");
		$(this).parent().parent().removeAttr("style");
	} 
	else
	{
		$(this).attr("checked", "checked");
		$(this).parent().parent().css("background-color", "#F5F5F5");
	} 
}


var Contacts = {};
Contacts.init = function() {
	Comm.toKeyring({"requestType":"select","params":["contacts","*"]}, function(resp)
	{
		console.log(resp);
		rows = "";
		for(var a=0;a<resp.length;a++)
		{
			rows += "<tr>";
			rows += "<td><i class='jay-checkbox fa fa-square-o'></i></td>";
			rows += "<td class='jay-contact-name'>"+resp[a].name+"</td>";
			rows += "<td><span class='jay-tag' title='"+resp[a].nxt+"'>"+Tx.trimAccount(resp[a].nxt)+"</span> <i class='fa fa-plus jay-contacts-append'></i></td>";
			rows += "</tr>";
		}

		$("#jay_contacts_table tbody").empty().append(rows);
		$(".jay-checkbox").unbind("click").click(Dash.checkbox);
	});

}


var Util = {};

Util.formatNumber = function(number, seperator, decimals)
{
	var parts = number.toFixed(decimals).toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
    return parts.join(".");
}

Util.xss = function(val) {
	return val.replace(/&/g,"&amp;").replace(/</g, "&lt;").replace(/>/g,"&gt;").replace(/"/g, '&quot;').replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;");
}

Util.nxtEpoch = 1385294400;

Util.timeAgo = function(timestamp, isNxt)
{
	var fromnow = Util.getTime(isNxt) - timestamp;

	if(fromnow > 86400) return (Math.floor(fromnow/86400) == 1) ? "1 day ago" : Math.floor(fromnow/86400)+" days ago";
	else if(fromnow > 3600) return (Math.floor(fromnow/3600) == 1) ? "1 hr ago" : Math.floor(fromnow/3600)+" hrs ago";
	else if(fromnow > 60) return (Math.floor(fromnow/60) == 1) ? "1 min ago" : Math.floor(fromnow/60)+" mins ago";

	return (fromnow == 1) ? "1 sec ago" : fromnow + "secs ago";
}

Util.cutText = function(text, len)
{
	if(text.length < len) return text;
	else return text.substring(0, len) + "...";
}

Util.getTime = function(isNxt)
{
	return isNxt ? Math.floor(Date.now()/1000)-Util.nxtEpoch : Math.floor(Date.now()/1000);
}

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

Array.prototype.strip = function(num)
{
	this.splice(0, num);
}

Tx.bytesToString = function(bytes)
{
	var type = bytes[0];
	var subtype = bytes[1] % 16;
	var sender = getAccountIdFromPublicKey(converters.byteArrayToHexString(bytes.slice(8, 8+32)), true);
	var r = new NxtAddress();
	r.set(byteArrayToBigInteger(bytes.slice(40, 48)).toString());
	var recipient = r.toString();
	var amount = byteArrayToBigInteger(bytes.slice(48, 48+8));
	var fee = byteArrayToBigInteger(bytes.slice(56, 56+8));
	var flags = converters.byteArrayToSignedInt32(bytes.slice(160, 160+4));

	var txlen = 176;

	var message = "";



	bytes.strip(txlen);


	// types and subtypes

	if(type == Tx.types.payment)
	{
		if(subtype == Tx.subtypes.ordinaryPayment)
		{
			message += Tx.bold("Send ",Tx.formatNxt(amount)," to ",recipient);
			message += Tx.feeCalc(fee);
		}
	}
	else if(type == Tx.types.messaging)
	{
		if(subtype == Tx.subtypes.arbitraryMessage)
		{
			message += Tx.bold("Send Message to ", recipient);
			message += Tx.feeCalc(fee);
		}
		else if(subtype == Tx.subtypes.aliasAssignment) 
		{
			message += Tx.bold("Register alias '", Tx.stringFromLen(bytes, 1, 1), "' with data '", Tx.stringFromLen(bytes, 2), "'");
			message += Tx.feeCalc(fee);
		}
	}

	// appendages

	if(Tx.getModifierBit(flags, 0))
	{
		message += Tx.bold(", with message: '", Tx.stringFromLen(bytes, 4, 1), "'");
	}

	if(Tx.getModifierBit(flags, 2))
	{
		var str = converters.byteArrayToHexString(msg.slice(1,65));
		message += Tx.bold(", with public key: '",Util.xss(str), "'");
		bytes.strip(65);
	}

	message += "?";

	return message;
}

Tx.stringFromLen = function(bytes, len, offset)
{
	if(offset == undefined) offset = 0;
	if(len == 1)
	{
		return Tx.modString(bytes, bytes[offset], offset+1);
	}
	else if(len == 2)
	{
		return Tx.modString(bytes, Tx.bytesWord([bytes[offset],bytes[offset+1]]), offset+2);
	}
	else if(len == 4)
	{
		return Tx.modString(bytes, Tx.bytesWord([bytes[offset],bytes[offset+1]]), offset+4);
	}
}

Tx.modString = function(bytes, len, offset)
{
	console.log(bytes);
	if(offset == undefined) offset = 0;
	var out = converters.byteArrayToString(bytes.slice(offset, len+offset));
	bytes.strip(len+offset);
	return out;
}

Tx.getModifierBit = function(target, position)
{
	return (target >> position)%2;
}

Tx.feeCalc = function(fee)
{
	return Tx.bold(" with a fee of ", Tx.formatNxt(fee));
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
		collect = collect.concat(Tx.wordBytes(1440)); // deadline
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
		if(i%2 == 1) output += "<strong>"+Util.xss(arguments[i])+"</strong>";
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

Tx.wordBytes = function(word)
{
	return [(word%256), Math.floor(word/256)];
}

Tx.bytesWord = function(bytes)
{
	return bytes[1]*256+bytes[0];
}

Tx.addHistory = function(message, bytes, res)
{
	// puts this on the tx history
}


Tx.getType = function(type, subtype)
{
	if(type == 0)
	{
		if(subtype == 0) return "Payment";
	}
	else if(type == 1)
	{
		if(subtype == 0) return "Message";
		else if(subtype == 1) return "Alias";
		else if(subtype == 2) return "Poll";
		else if(subtype == 3) return "Vote";
		else if(subtype == 4) return "Hub";
		else if(subtype == 5) return "Info";
		else if(subtype == 6) return "Alias";
		else if(subtype == 7) return "Alias";
		else if(subtype == 8) return "Alias";
	}
	else if(type == 2)
	{
		if(subtype == 0) return "Asset";
		else if(subtype == 1) return "Asset";
		else if(subtype == 2) return "Ask Order";
		else if(subtype == 3) return "Bid Order";
		else if(subtype == 4) return "Ask Order";
		else if(subtype == 5) return "Bid Order";
	}
	else if(type == 3)
	{
		if(subtype == 0) return "List";
		else if(subtype == 1) return "Delist";
		else if(subtype == 2) return "Price";
		else if(subtype == 3) return "Quantity";
		else if(subtype == 4) return "Buy";
		else if(subtype == 5) return "Send";
		else if(subtype == 6) return "Refund";
	}
	else if(type == 4)
	{
		if(subtype == 0) return "Lease";
	}
	else if(type == 5)
	{
		if(subtype == 0) return "Issue";
		else if(subtype == 1) return "Reserve";
		else if(subtype == 2) return "Claim";
		else if(subtype == 3) return "Currency";
		else if(subtype == 4) return "Offer";
		else if(subtype == 5) return "Buy";
		else if(subtype == 6) return "Sell";
		else if(subtype == 7) return "Mint";
		else if(subtype == 8) return "Delete";
	}

	// ERROR HERE...
}

Tx.getData = function(tx)
{
	var you = false;
	if(tx.senderRS == Acc.rs) you = true;
	if(tx.type == 0)
	{
		if(tx.subtype == 0)
		{
			var ret = "<td class='jay-";
			if(you) ret += "red'><i class='fa fa-minus'></i> ";
			else ret += "green'><i class='fa fa-plus'></i> ";
			return ret+Util.formatNumber((tx.amountNQT/100000000), "'", 0)+" NXT</td>";
		}
	}
	else if(tx.type == 1)
	{
		if(tx.subtype == 0) 
		{
			if(tx.attachment["version.EncrytpedMessage"] == 1 ||
				tx.attachment['version.PrunableEncryptedMessage'] == 1) return "<td>Message Is Encrypted</td>";
			else return "<td>"+Util.cutText(tx.attachment.message, 30)+"</td>";
		}
		if(tx.subtype == 1)
		{
			return "<td>"+tx.attachment.aliasName+"<td>";
		}
		if(tx.subtype == 2)
		{
			return "<td>"+tx.attachment.name+"</td>";
		}
		if(tx.subtype == 3)
		{
			return "<td>"+tx.attachment.poll+"</td>";
		}
	}
	else if(tx.type == 2)
	{
		if(tx.subtype == 0)
		{
			return "<td>"+tx.attachment.name+"</td>";
		}
		if(tx.subtype == 1)
		{
			var asset = tx.attachment.asset;
			var ret = "<td class='jay-";
			if(you) ret += "red'><i class='fa fa-minus'></i> ";
			else ret += "green'><i class='fa fa-plus'></i> ";
			ret += Util.formatNumber(tx.attachment.quantityQNT/Math.pow(10, Asset.getDecimals(asset)), "'", 8-Asset.getDecimals(asset));
			return ret + " "+Asset.getName(asset);
		}
	}

	return "<td> &mdash; </td>";
}

Tx.trimAccount = function(acc)
{
	return acc.slice(acc.length-5)
}

Tx.parseAccount = function(sender, recipient)
{
	var rs = "";
	if(sender == Acc.rs) rs = recipient;
	else rs = sender;

	/*if(Contacts.isContact(rs))
	{
		return Contacts.getName(rs);
	}*/
	if(rs == Acc.genesisRS)
	{
		return "You";
	}
	else return rs.slice(rs.length-5)
}


var Asset = {};

Asset.getDecimals = function(asset)
{
	return 4;
}

Asset.getName = function(asset)
{
	return "Jay";
}
