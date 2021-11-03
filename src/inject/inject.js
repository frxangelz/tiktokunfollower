/*
	TikTok Unfollower - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
	github : 
*/

tick_count = 0;
cur_url = "test";
following_page = 'https://www.tiktok.com/following?lang=en';

function getUrlVars() { 
  var vars = {}; 
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { vars[key] = value; }); 
  return vars; 
}

const _MAX_UNFOLLOW_TO_RELOAD = 40;

last_click = 0;
last_call = 0;
reload = 0;
enabled = 0;
no_buttons = false;
overlimit = false;
r_interval = 0;

first = true;

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	unfollow_friends : true
}

function check_following_page(){

		if(cur_url.indexOf('/following') !== -1)
			return true;
		return false;
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}

const $userButtons = 'h3.tiktok-debnpy-H3AuthorTitle';
const $followButtons = 'button.tiktok-1svsmd8-Button';

$btn_idx = 0;
btns = null;
$unfollowed = [];

function IsUnfollowed(user){

	for(var i = 0; i<$unfollowed.length; i++){
		
		if($unfollowed[i] == user){
			
			return true;
		}
	}
	
	return false;
}

function _unfollow(){
	var txt;
	var bt;
	var b = false;
	bts = document.querySelectorAll($followButtons);
	
	for(var i = 0; i<bts.length; i++){
		bt = bts[i];
		if(bt) { 
			txt = bt.textContent;
			if(config.unfollow_friends){
				b = (txt == 'Friends') || (txt == 'Following');
			} else {
				b = txt == 'Following';
			}
			if(b){
				config.total++;
				bt.click(); 
			
				chrome.extension.sendMessage({action: 'inc'}, function(response){
					if(response.status == false)
						config.enable = 0;
				});	

				return true;
			}
		}		
	}
	
	return false;
}

function unfollow(){

	var cnt = 0;
	
	btns = document.querySelectorAll($userButtons);
	if (!btns) { 
	
		no_buttons = true;
		return; 
	}

	var txt;
	for(var i=0; i<btns.length; i++){

		txt = btns[i].textContent;
		if(!IsUnfollowed(txt)) { 
		
			$unfollowed.push(txt);
			$btn_idx = i;
			btns[$btn_idx].scrollIntoView();
			setTimeout(function(){
				simulateMouseOver(btns[$btn_idx]);
			},200);
			return;
		}
	}	

	// butuh reload, tidak nemu yang dicari :)
	no_buttons = true;
}
 
function show_info(){

	var info = document.getElementById("info_ex");
	if(!info) {
	
		info = document.createElement('div');
		info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
		info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
		info.id = "info_ex";
		document.body.appendChild(info);
		console.log("info_ex created");
	}
}
	
function info(txt){

	var info = document.getElementById("status_ex");
	if(!info) { return; }
	info.textContent = "Unfollow : "+config.total+", "+txt;
}
	
function simulateMouseOver(myTarget) {
  var event = new MouseEvent('mouseover', {
    'view': window,
    'bubbles': true,
    'cancelable': true
  });
  var canceled = !myTarget.dispatchEvent(event);
  if (canceled) {
    //console.log("canceled");
  } else {
    //console.log("not canceled");
  }
}
	
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.total = request.total;
		config.max = request.max;
		config.chance = request.chance;
		config.interval = request.interval;
		config.unfollow_friends = request.unfollow_friends;
		tick_count = 0;
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				console.log("removed");
				info.parentNode.removeChild(info);
			}
			config.total = 0;
			overlimit = false;
			first = true;
		}
	}
});
 
    chrome.extension.sendMessage({}, function(response) {
    
	   var readyStateCheckInterval = setInterval(function() {
	       if (document.readyState === "complete") {

		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.total = response.total;
					config.max = response.max;
					config.chance = response.chance;
					config.interval = response.interval;
					config.unfollow_friends = response.unfollow_friends;
					
					r_interval = get_random(config.interval,config.chance); 
					console.log("got interval : "+r_interval);
				});
		   }
		   
		   cur_url = $(location).attr('href');		   
           tick_count= tick_count+1; 

		   
		   if((config.enable == 1) && (cur_url.indexOf('tiktok.com') !== -1) && (config.total < config.max)){

		   show_info();

		   if(check_following_page()){
			   
		   if(_unfollow()) {
				if(config.total >= _MAX_UNFOLLOW_TO_RELOAD){ no_buttons = true; return; }
				if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); }
				return;
		   }

			if (overlimit) {
				
				if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
				return;
			}
			   
			if(no_buttons) {

				if(tick_count > 30){
			
					console.log("No Button, Reload");
					window.location.href=cur_url;
				} else {
					var c = 30 - tick_count;
					info("Waiting For "+c+" seconds to reload");
				}
		
				return;
			}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					unfollow();
					r_interval = get_random(config.interval,config.chance); 
					//console.log("got interval : "+r_interval);
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
		   }
				
		   } else {
			console.log('tick disable');
		   }

	   }
	}, 1000);
	
});

