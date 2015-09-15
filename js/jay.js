// the jay library to make things work...

var Jay = {};

Jay.init = function() {
	$("body").append("<jay version='2.0.0' />");
	$("jay").click(function() {
		if($("jay").attr("direction") == "page")
		{
			var message = JSON.parse($("jay").attr("message"));
			Jay.handleComm(message);
		}
	});

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
	$("jay").attr("message", message);
	$("jay").attr("direction", "ext");
	$("jay").trigger("click");
}

Jay.internal.handleComm = function() 
{
	
}

Jay.nxt = {};
Jay.nxt.init = function()
{

}

Jay.nxt.request = function()
{

}

Jay.nxt.sendMoney = function() 
{

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

$(document).ready(function() {
	Jay.init();
})