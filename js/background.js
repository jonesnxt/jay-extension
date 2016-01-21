// ok so lets put some comms in here.

$("document").ready(function() {
	JayDB.init();
	Contacts.init();

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        console.log(request);

    	if(request.location == "db")
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
            else if(request.requestType == "count")
            {
                sendResponse(JayDB.count(request.params[0]));
            }
    	}
        if(request.location == "action")
        {
            if(request.requestType == "trf")
            {
                chrome.browserAction.setBadgeText({"text":(JayDB.count("trf")+1).toString()});
                JayDB.insert("trf",[request.trf]);
            }
            if(request.requestType == "cancelTrf")
            {
                var bxval = "";
                if(JayDB.count("trf") != 1) bxval = (JayDB.count("trf") - 1).toString();
                chrome.browserAction.setBadgeText({"text":bxval});
                JayDB.remove("trf","trf",request.trf);
            }
        }
  	});
});