// ok so lets put some comms in here.

$("document").ready(function() {
	JayDB.init();
	Contacts.init();

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    	if(request.location == "keyring")
    	{
    	    if(request.requestType == "select")
    	    {
    	    	sendResponse(JayDB.select(request.params[0], request.params[1], request.params[2]));
    	    }
    	   	else if(request.requestType == "insert")
    	   	{
    	   		sendResponse(JayDB.insert(request.params[0], request.params[1]));;
    	   	}
    	   	else if(request.requestType == "createTable")
    	   	{
    	   		sendResponse(JayDB.createTable(request.params[0], request.params[1]));
    	   	}
    	}
  	});
});