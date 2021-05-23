var config = {
	enable : 0,
	total : 0,
	max : 100,
	interval : 5,
	chance: 10,				// max interval ( sebelumnya chance probability )
	unfollow_friends: true
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
				
    if (request.action == "set"){
		config.enable = request.enable;
		config.total = parseInt(request.total);
		config.max = parseInt(request.max);
		config.chance = parseInt(request.chance);
		config.interval = parseInt(request.interval);
		config.unfollow_friends = request.unfollow_friends;
		send_enable();
		return;
	}
	
	if(request.action == "get"){
		var message = {action: "set", enable: config.enable, total: config.total, max:config.max, chance:config.chance, interval:config.interval, unfollow_friends:config.unfollow_friends};
		sendResponse(message);
		return;
	}
	
	if(request.action == "inc"){
	
		var message = {status: true};
		if(config.total >= config.max){
			message.status = false;
			//config.enable = 0;
		} else { config.total++; }
		sendResponse(message);
		chrome.runtime.sendMessage({action: 'count',value: config.total,enable: config.enable},function(response){});
		return;
	}
	
 });
 
 function send_enable(){
 
		chrome.tabs.query({}, function(tabs) {
		var message = {action: "set", enable: config.enable, total: config.total, max:config.max, chance: config.chance, interval:config.interval, unfollow_friends:config.unfollow_friends};
		for (var i=0; i<tabs.length; ++i) {
			chrome.tabs.sendMessage(tabs[i].id, message);
		}
	}); 
 }