/*
	TikTok Unfollower - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
	github : 
*/

tick_count = 0;
cur_url = "test";
following_page = 'https://www.tiktok.com/';

const _TIKTOK_HOME = 'https://www.tiktok.com/';

const _MAX_UNFOLLOW_TO_RELOAD = 40;

last_click = 0;
last_call = 0;
reload = 0;
enabled = 0;
no_buttons = false;
overlimit = false;
r_interval = 0;

first = true;
cur_unfollow = 0;

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0,
	fastway : 0,
	unfollow_friends : true
}

function check_following_page(){

	if(cur_url.indexOf('tiktok.com') !== -1)
		return true;
	return false;
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}

const $userButtons = 'h3.author-uniqueId';
const $userButtons_1 = 'h3.tiktok-debnpy-H3AuthorTitle';
const $followButtons =  'button.follow-button';
const $followButtons_1 = 'button.tiktok-1svsmd8-Button';

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
	
	if(cur_url.indexOf("/@") === -1){
	
		return false;
	}
	
	var btn = document.querySelector('button[type="button"]');
	if(!btn) { 
		console.log('button[type="button"] not found !');
		cur_unfollow = _MAX_UNFOLLOW_TO_RELOAD;
		return false; 
	}
	
	var txt = btn.textContent;
	if(txt === "Follow"){
		console.log("Already Unfollowed");
		return false;
	}

	var div = btn.parentNode.parentNode;
	
	btn = div.querySelector('svg');
	if(!btn) { console.log("no svg button found !"); cur_unfollow = _MAX_UNFOLLOW_TO_RELOAD; return false; }
	btn.parentNode.click();

	config.total++;
	cur_unfollow++;
	chrome.extension.sendMessage({action: 'inc'}, function(response){
				if(response.status == false)
					config.enable = 0;
	});	

	return true;
}


//Following accounts, tiktok ada 2 layout, di kantor ie dan chrome beda :(
var FollowingSection = null;
var last_href = '';
function unfollow(){

	if(!FollowingSection){
		
		var p = document.querySelector('p[data-e2e="following-accounts"]');
		if(p){
			FollowingSection = p.parentNode;
		} else {
		
			var divs = document.getElementsByTagName('div');
			for(var i=0; i<divs.length; i++){
		
				if (divs[i].textContent === 'Following accounts'){
					FollowingSection = divs[i].parentNode;
					break;
				}
			}
		}
	}
	
	if(!FollowingSection){
		console.log("No Section Found !");
		cur_unfollow = _MAX_UNFOLLOW_TO_RELOAD;
		return;
	}

	var btns = FollowingSection.querySelectorAll('a[href*="/@"]');
	if ((!btns) || (btns.length < 1)){ 
	
		console.log("no Button Found :(");
		no_buttons = true;
		return; 
	}
	
	if (btns.length < 4) {
		
		overlimit = true;
		info("No following acounts left");
		return;
	}
	
	var txt;
	for(var i=0; i<btns.length; i++){

		txt = btns[i].getAttribute("signed");
		if(txt === "1") { continue; }
		btns[i].setAttribute("signed","1");
		
		txt = btns[i].getAttribute('href');
		if(txt === last_href){ continue; }
		last_href = txt;
		
		btns[i].scrollIntoView();
		btns[i].click();
		return;
	}	

	var p = FollowingSection.getElementsByTagName("p");
	for(var i=0; i<p.length; i++){
  		if(p[i].textContent === 'See more'){
			p[i].click();
			return;
  		}
	}	
	
	console.log("No Button :(");
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

function follow_one(){

	var btn = document.getElementsByTagName('button');
	for(var i=0; i<btn.length; i++){

		if (btn[i].textContent === 'Follow'){
			btn[i].click();
			tick_count = 0;
			setTimeout(function(){
				window.location.href = _TIKTOK_HOME;
			},1000);
			break;
		}
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
		config.fastway = request.fastway;
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
					config.fastway = response.fastway;
					config.unfollow_friends = response.unfollow_friends;
					
					r_interval = get_random(config.interval,config.chance); 
					console.log("got interval : "+r_interval);
				});
		   }
		   
		   cur_url = $(location).attr('href');		   
           tick_count= tick_count+1; 

		   
		   if((config.enable == 1) && (cur_url.indexOf('tiktok.com') !== -1) && (config.total < config.max)){

		   show_info();

		   // check halaman following
		   if(check_following_page()){
			   
			if(_unfollow()) {
				if(cur_unfollow >= _MAX_UNFOLLOW_TO_RELOAD){ no_buttons = true; tick_count = 0; return; }
				if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); }
				return;
			}

			if (overlimit) {
				
				if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
				return;
			}
			   
			if(cur_url.indexOf("act=follow") !== -1){
				tick_count = 0;
				follow_one();
				return;
			}
			
			if(no_buttons) {

				var no_button_wait = 15;
				//if(config.fastway) { no_button_wait = 5; }
				if(tick_count > no_button_wait){
			
					console.log("No Button, Reload");
					tick_count = 0;
					window.location.href=_TIKTOK_HOME+"?act=follow";
					
					//goToProfile();
//					follow_one();
				} else {
					var c = no_button_wait - tick_count;
					info("Waiting For "+c+" seconds to reload");
				}
				
		
				return;
			}
			   
			   if(config.fastway) { 
				   r_interval = 1;
				   info("no delay");
				}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					unfollow();
					r_interval = get_random(config.interval,config.chance); 
					//console.log("got interval : "+r_interval);
				
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
		   } else {
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					r_interval = get_random(config.interval,config.chance); 
					window.location.href = following_page;
				
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

