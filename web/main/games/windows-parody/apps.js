$('#ms-help article .glow-bottom img.light').click(help1);
$('#ms-help').children('header').children('.close').click(helpClose);
var match, matchTime;
function help1(){
	$('#ms-help article .glow-bottom img.light').off('click');
	match = $('#ms-help article .glow-bottom input').val();
	if (match == '' || match == null){
		$('#ms-help dialog .info span').html('You give us an empty word.<br/>Are you kidding?');
		$('#ms-help dialog').attr('open','');
		$('#ms-help dialog .buttons button').eq(0).focus();
		$('#ms-help article .glow-bottom img.light').click(help1);
		$('#ms-help dialog .buttons button').click(function(){ $('#ms-help dialog header .close').click() });
		alertSound.play();
	} else {
		$('#ms-help [name=section1], #ms-help [name=section3], #ms-help [name=section4]').removeClass('opened');
		$('#ms-help [name=section2]').addClass('opened');
		$('#ms-help article .glow-bottom img.light').click(help2);
		matchTime = setTimeout(help3, 3000)
	}
}
function help2(){
	$('#ms-help dialog .info span').html('We said please wait! Can you be more patient?');
	$('#ms-help dialog').attr('open','');
	$('#ms-help dialog .buttons button').eq(0).focus();
	$('#ms-help dialog .buttons button').click(function(){ $('#ms-help dialog header .close').click() });
	alertSound.play();
}
function help3(){
	$('#ms-help article .glow-bottom img.light').off('click');
	$('#ms-help article .glow-bottom img.light').click(help1);
	$('#ms-help [name=section2]').removeClass('opened');
	$('#ms-help [name=section3]').addClass('opened');
	$('#ms-help [name=section3] b').html(match);
	$('#ms-help [name=section3] button').click(help4)
}
function help4(){
	$('#ms-help [name=section4]').addClass('opened');
}
function helpClose(){
	$('#ms-help article .glow-bottom img.light').off('click');
	clearTimeout(matchTime);
	$('#ms-help article .glow-bottom input').val('');
	$('#ms-help article .glow-bottom img.light').click(help1);
	$('#ms-help [name=section2], #ms-help [name=section3], #ms-help [name=section4]').removeClass('opened');
	$('#ms-help [name=section1]').addClass('opened');
}

var speechQueue = 1, mouseTime;
const	speech1 = new Audio("/games/windows-parody/assets/audio/speech1.mp3"),
			speech2 = new Audio("/games/windows-parody/assets/audio/speech2.mp3"),
			speech3 = new Audio("/games/windows-parody/assets/audio/speech3.mp3"),
			speech4 = new Audio("/games/windows-parody/assets/audio/speech4.mp3"),
			speech5 = new Audio("/games/windows-parody/assets/audio/speech5.mp3"),
			speech6 = new Audio("/games/windows-parody/assets/audio/speech6.mp3"),
			speech7 = new Audio("/games/windows-parody/assets/audio/speech7.mp3"),
			speech8 = new Audio("/games/windows-parody/assets/audio/speech8.mp3");
$('#ms-explorer').children('header').children('.close').click(explorerClose);
$('#ms-explorer dialog[name=dialog1] .buttons button').click(function(){
	$('#ms-explorer dialog[name=dialog1] header .close').click()
})
$('#ms-explorer dialog[name=dialog2] .buttons button').eq(1).click(function(){
	$('#ms-explorer dialog[name=dialog2] header .close').click()
})
$('#ms-explorer dialog[name=dialog2] .buttons button').eq(0).mouseenter(explorerButton).mousedown(explorerButton).mouseout(explorerButton);
function explorerButton(e){
	let elem = $('#ms-explorer dialog[name=dialog2] .buttons button').eq(0);
	const top = elem.offset().top, left = elem.offset().left, mouseTop = e.clientY, mouseLeft = e.clientX;
	let explorerButtonToY, explorerButtonToX;
	
	if(mouseTop < (top + 15)){
		explorerButtonToY = "bottom"
	} else if (mouseTop >= (top + 15)) {
		explorerButtonToY = "top"
	} else {
		explorerButtonToY = "center"
	}
	if(mouseLeft < left){
		explorerButtonToX = "right"
	} else if (mouseLeft > (left + 50)){
		explorerButtonToX = "left"
	} else {
		explorerButtonToX = "center"
	}
	
	if(explorerButtonToY == "top"){
		elem.offset({top: top - 30})
	} else if(explorerButtonToY == "bottom"){
		elem.offset({top: top + 30})
	}
	if(explorerButtonToX == "left"){
		elem.offset({left: left - 70})
	} else if(explorerButtonToX == "right") {
		elem.offset({left: left + 70})
	}
	
	if(top <= 30){
		elem.offset({top: top + 50})
	} else if(top >= $(window).height() - 42 - 30) {
		elem.offset({top: top - 50})
	}
	if(left <= 70){
		elem.offset({left: left + 80})
	} else if(left >= $(window).width() - 70) {
		elem.offset({left: left - 80})
	}
	elem.blur()
}
$('#ex_system').click(function(){
	$('#ms-explorer dialog[name=dialog1] header [appName]').html('System Information');
	$('#ms-explorer dialog[name=dialog1] .info').html(infoIcon + '<span>500Mhz Triathelon Processor<br/>16 MB RAM<br/>(Not sufficient memory for illegal activities such as watching illegal film)<br/>72 GB Hard Drive<br/> (Somebody prefers size over speed)<br/><br/><b>Recommendation:</b><br/>Open your freakin\' wallet and buy some RAM. I\'m dying here!</span>');
	setTimeout(function(){
		$('#ms-explorer dialog[name=dialog1]').attr('open','');
		$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
	}, 50)
	infoSound.play();
})
$('#ex_control').click(explorer1)
function explorer1(){
	$('#ms-explorer header span[appName], #app_ms-explorer').html('Control Panel');
	$('#ms-explorer [name=section2]').addClass('opened');
	$('#ms-explorer [name=section1], #ms-explorer [name=section3]').removeClass('opened');
	$('#ms-explorer dialog[name=dialog1] header [appName]').html('Control Panel');
	$('#ms-explorer dialog[name=dialog1] .info').html(infoIcon + '<span>Windows XP has built on focus on protecting users from their own stupidity. As a result, we have removed many of options from Control Panel. Enjoy your limited freedom.</span>');
	setTimeout(function(){
		$('#ms-explorer dialog[name=dialog1]').attr('open','');
		$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
	}, 50)
	infoSound.play();;
	speechQueue = 1;
}
function explorer2(a, e){
	if(a == 'fonts'){
		$('#ms-explorer dialog[name=dialog1] header [appName]').html('<img draggable="false"src="/games/windows-parody/assets/image/fonttitle.png" style="width: 60px; top: 10px;"/><br/>');
		$('#ms-explorer dialog[name=dialog1] .info').html(errorIcon + '<img draggable="false"src="/games/windows-parody/assets/image/fontdesc.png" style="width: 255px;height: 70px;transform: rotate(3deg);"/>');
		setTimeout(function(){
			$('#ms-explorer dialog[name=dialog1]').attr('open','');
			$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
		}, 50)
		errorSound.play();
	} else if (a=='display'){
		$('#ms-explorer dialog[name=dialog1] header [appName]').html('Display');
		$('#ms-explorer dialog[name=dialog1] .info').html(errorIcon + '<span>This option has been disabled by your network administrator. If you are not currently on a network, you are being denied access because Windows XP has determined you are not smart enough to configure the Display by yourself</span>');
		setTimeout(function(){
			$('#ms-explorer dialog[name=dialog1]').attr('open','');
			$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
		}, 50);
		errorSound.play();
	} else if (a=='keyboard'){
		$('#ms-explorer dialog[name=dialog1] header [appName]').html('Keyboard');
		$('#ms-explorer dialog[name=dialog1] .info').html(errorIcon + '<span>Windows XP has detected that you are not using a Microsoft brand keyboard and refuses to acknowledge any features provided by this cut-rate misfit of a keyboard</span>');
		setTimeout(function(){
			$('#ms-explorer dialog[name=dialog1]').attr('open','');
			$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
		}, 50);
		errorSound.play();
	} else if (a=='mouse'){
		clearTimeout(mouseTime);
		explorerMouse(e);
		$(window).on('mousemove', explorerMouse)
		$('body').css('cursor','none')
		mouseTime = setTimeout(function(){
			$(window).off('mousemove', explorerMouse);
			$('#mouse').addClass('hidden');
			$('body').css('cursor','')
		}, 5000);
	} else if (a=='speech'){
		if(speechQueue == 1){
			speech1.play();
			speechQueue = 2;
		} else if(speechQueue == 2){
			speech2.play();
			speechQueue = 3;
		} else if(speechQueue == 3){
			speech3.play();
			speechQueue = 4;
		} else if(speechQueue == 4){
			speech4.play();
			speechQueue = 5;
		} else if(speechQueue == 5){
			speech5.play();
			speechQueue = 6;
		} else if(speechQueue == 6){
			speech6.play();
			speechQueue = 7;
		} else if(speechQueue == 7){
			speech7.play();
			speechQueue = 8;
		} else if(speechQueue == 8){
			speech8.pause();
			speech8.currentTime = 0;
			speech8.play();
			speechQueue = 9;
		} else if(speechQueue == 9){
			speech8.pause();
			speech8.currentTime = 0;
			speech8.play();
			speechQueue = 10;
		} else if(speechQueue == 10){
			speech8.pause();
			speech8.currentTime = 0;
			speech8.play();
			speechQueue = 11;
		} else if(speechQueue == 11){
			speech8.pause();
			speech8.currentTime = 0;
			speech8.play();
			speechQueue = 12;
		} else if(speechQueue == 12){
			speech8.pause();
			speech8.currentTime = 0;
			speech8.play();
			speechQueue = 13;
		} else if(speechQueue == 13){
			speech8.pause();
			speech8.currentTime = 0;
			speech8.play();
			speechQueue = 14;
		} else if(speechQueue == 14){
			$('#bsod').removeClass('hidden');
			speech8.pause();
			speech8.currentTime = 0;
			errorSound.play();
			$(window).on('keydown', explorerBsod)
		}
	}
}
function explorerBsod(e){
	if(e.keyCode == 32){
		restart();
		$(window).off('keydown', explorerBsod);
		$('#bsod').addClass('hidden');
	}
}
function explorerMouse(e){
	$('#mouse').removeClass('hidden');
	const top = e.clientY - 5, left = e.clientX - 50;
	$('#mouse').offset({top: top, left: left})
}
var wiperTime;
$('#ex_clear').click(function(){
	if ( $('#wiperblade').hasClass('hidden') ){
		$('#wiperblade').removeClass('hidden');
		wiperTime = setTimeout(function(){
			$('#wiperblade').addClass('hidden');
		}, 3000)
	}
})
function explorer3(){
	$('#ms-explorer header span[appName], #app_ms-explorer').html('Your Documents');
	$('#ms-explorer [name=section3]').addClass('opened');
	$('#ms-explorer [name=section1], #ms-explorer [name=section4]').removeClass('opened');
}
function explorer4(){
	$('#ms-explorer dialog[name=dialog1] header [appName]').html('Local Disk (C:)');
	$('#ms-explorer dialog[name=dialog1] .info').html(errorIcon + '<span>C: is not accessable. Please ensure there is a disk in drive C: and go away.</span>');
	setTimeout(function(){
		$('#ms-explorer dialog[name=dialog1]').attr('open','');
		$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
		errorSound.play();
	}, 50);
}
function explorer5(){
	$('#ms-explorer dialog[name=dialog1] header [appName]').html('Floppy Disk (A:)');
	$('#ms-explorer dialog[name=dialog1] .info').html(errorIcon + '<span>Windows XP couldn\'t open floppy disk because it was outdated. Save your files to OneDrive instead.</span>');
	setTimeout(function(){
		$('#ms-explorer dialog[name=dialog1]').attr('open','');
		$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
		errorSound.play();
	}, 50);
}
var policeSound = new Audio("/games/windows-parody/assets/audio/police.mp3");
function explorer6(a){
	if(a=="music"){
		$('#ms-explorer dialog[name=dialog1] header [appName]').html('Your Music');
		$('#ms-explorer dialog[name=dialog1] .info').html(alertIcon + '<span>Windows XP has detected that you have been downloading music illegally. Your IP address has been sent to the local police station and you have been ratted out. Sorry, man.</span>');
		setTimeout(function(){
			$('#ms-explorer dialog[name=dialog1]').attr('open','');
			$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
			policeSound.play();
		}, 50);
	} else if(a=="pictures"){
		$('#ms-explorer dialog[name=dialog2] .buttons button').eq(0).removeAttr('style');
		$('#ms-explorer dialog[name=dialog2]').attr('open','');
		$('#ms-explorer dialog[name=dialog2] .buttons button').eq(1).focus();
		alertSound.play();
	} else if(a=="received"){
		$('#ms-explorer dialog[name=dialog1] header [appName]').html('Your Received Files');
		$('#ms-explorer dialog[name=dialog1] .info').html(alertIcon + '<span>WARNING: Be aware that when you receive files from another computer, you are receiving files from every computer that computer has ever received files from.</span>');
		setTimeout(function(){
			$('#ms-explorer dialog[name=dialog1]').attr('open','');
			$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
			alertSound.play();
		}, 50);
	} else if(a=="video"){
		$('#ms-explorer dialog[name=dialog1] header [appName]').html('Your Videos');
		$('#ms-explorer dialog[name=dialog1] .info').html(alertIcon + '<span>Windows XP has detected that your videos are being reuploaded to YouTube and that\'s illegal, man. So they have returned back to their server.</span>');
		setTimeout(function(){
			$('#ms-explorer dialog[name=dialog1]').attr('open','');
			$('#ms-explorer dialog[name=dialog1] .buttons button').eq(0).focus();
			alertSound.play();
		}, 50);
	}
}
function explorerClose(){
	$('#ms-explorer [name=section1]').addClass('opened');
	$('#ms-explorer [name=section2], #ms-explorer [name=section3]').removeClass('opened');
	$('#ms-explorer header span[appName], #app_ms-explorer').html('Your Computer');
}

var eggTime, eggTime1, eggTime2, eggTime3;
function eggOpen(){
	$('#ms-egg article [name=section1]').removeClass('opened');
	$('#ms-egg article #eggStatus').html('Opening page: https://www.microsoft.com <div style="position:absolute;top: 5px;right: 5px;background: white;width: 150px;height: 20px;outline: 2px solid black;overflow: hidden;"><div id="eggStatusBar" style="background:green;width: 10%;height:100%;"></div></div>');
	clearTimeout(eggTime);
	clearTimeout(eggTime1);
	clearTimeout(eggTime2);
	clearTimeout(eggTime3);
	eggTime1 = setTimeout(function(){
		$('#ms-egg article #eggStatusBar').css('width', '30%')
	}, 3000)
	eggTime2 = setTimeout(function(){
		$('#ms-egg article #eggStatusBar').css('width', '60%')
	}, 6000)
	eggTime3 = setTimeout(function(){
		$('#ms-egg article #eggStatusBar').css('width', '90%')
	}, 10000)
	eggTime = setTimeout(function(){
		$('#ms-egg article [name=section1]').addClass('opened');
		$('#ms-egg article #eggStatus').html('Done');
	}, 11000)
}

$('#ms-defender article div button').click(function(){ $('#ms-defender header .close').click() })