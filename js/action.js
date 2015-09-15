// browser action scripting...

$(document).ready(function() {

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

	$(".jay-checkbox").click(function() {
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
	});

	$("#jay_name").click(Dash.nameDropper);

	Page.init();
	Req.init();
	Dash.init();
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
    'color': '#333'
  });
	chrome.browserAction.setBadgeText({"text":"3"});
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


var Comm = {};


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


var Util = {};

Util.formatNumber = function(number, seperator, decimals)
{
	var parts = number.toFixed(decimals).toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
    return parts.join(".");
}

Util.xss = function(input)
{
	return input.replace("&", "&amp").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#x27;").replace("/", "&#x2F;");
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

var Tx = {};

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