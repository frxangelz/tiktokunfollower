/*
	TikTok Unfollower - Script
	(c) 2021 - FreeAngel 
	youtube channel : http://www.youtube.com/channel/UC15iFd0nlfG_tEBrt6Qz1NQ
	github : 
*/

tick_count = 0;
cur_url = "test";
following_page = 'https://www.tiktok.com/following?lang=en';

const _MAX_UNFOLLOW_TO_RELOAD = 100;

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
	
	if((!btns) || (btns.length < 1)){
		return;
	}
	
	var txt;
	var bt;
	var b = false;
	var bts = document.querySelectorAll($followButtons);
	if((!bts) || (bts.length < 1)){	
		bts = document.querySelectorAll($followButtons_1);
	}
	
	if((!bts) || (bts.length < 1)){	
		return false;
	}
	
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
				cur_unfollow++;
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
	if ((!btns) || (btns.length < 1)){ 
	
		console.log("search 1");
		btns = document.querySelectorAll($userButtons_1);
		if((!btns) || (btns.length < 1)){
			console.log("no Button Found :(");
			no_buttons = true;
			return; 
		}
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

		   if(config.fastway)	{
			   UnfollowEx();
			   return;
		   }
			   
		   // check halaman following
		   if(check_following_page()){
			   
			if(_unfollow()) {
				if(cur_unfollow >= _MAX_UNFOLLOW_TO_RELOAD){ no_buttons = true; return; }
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
					tick_count = 0;
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


/* FastWay */

function OpenDialog(){

	// check if dialog opened
	var FollowingModalBox = document.querySelector('div.accounts-list-modal');
	
	if(FollowingModalBox) {
		// already opened
		return FollowingModalBox;
	}
	
	var divs = document.querySelectorAll('div.user-list-header');
	div = null;
	var s = "";
	for (var i = 0; i<divs.length; i++){
		s = divs[i].textContent;
		if (s.indexOf("Following accounts") !== -1){
			console.log("found !");
			div = divs[i];
			break;
		}
	}
	
	if (!div) {
		console.log("div.user-list-header not found");
		return null;
	}
	
	// check for click more
	var p = div.querySelector('p.see-more');
	if(p) {
		p.click();
	} else {
		console.log('p.see-more not found !');
	}
	
	return FollowingModalBox;

}

function unfollow_ex(FollowingModalBox){
	
	if(!FollowingModalBox) { return; }
	
	var cnt = 0;
	var btns = FollowingModalBox.getElementsByTagName('button');
	var s = '';
	var b = false;
	for (var i=0; i<btns.length; i++){
		s = btns[i].textContent;
		if(config.unfollow_friends){
			b = (s === "Friends") || (s === "Following");
		} else {
			b = s === "Following";
		}
		
		if (b) {
			cnt++;
			btns[i].scrollIntoView();
			
			config.total++;
			cur_unfollow++;
			chrome.extension.sendMessage({action: 'inc'}, function(response){
				if(response.status == false)
					config.enable = 0;
			});				
			btns[i].click();
			//btns[i].innerHTML = "test";
		}
	}
	
	console.log("unfollowed : "+cnt);
	return cnt;
}

function UnfollowEx(){

	if (overlimit) {
				
		if((tick_count % 5) == 0){	info("Reached Total Limit : "+config.total); }
			return;
	}

	if(no_buttons) {

		if(tick_count > 30){
			
			console.log("No Button, Reload");
			tick_count = 0;
			window.location.href=cur_url;
		} else {
			var c = 30 - tick_count;
			info("Waiting For "+c+" seconds to reload");
		}
		
		return;
	}
	
	if (tick_count < r_interval){
		info("Waiting for : "+(r_interval - tick_count));
		return;	    
	}	

	tick_count = 0;
	r_interval = get_random(config.interval,config.chance); 
	
	// check for opendialog
	var FollowingModalBox = OpenDialog();
	if(!FollowingModalBox){ 
		console.log("dialog not opened ...")
		return;
	}
	   
	if(unfollow_ex(FollowingModalBox) > 0) {
		if(cur_unfollow >= _MAX_UNFOLLOW_TO_RELOAD){ no_buttons = true; return; }
		if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); }
		return;
	} else {
		no_buttons = true;
	}
			   
			   
}