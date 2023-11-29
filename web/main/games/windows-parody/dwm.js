setTimeout(function()
{
	windowsResize();
}, 0000);

var 	closeBtn = "/games/windows-parody/assets/image/close.png",
			maximizeBtn = "/games/windows-parody/assets/image/max.png",
			minimizeBtn = "/games/windows-parody/assets/image/min.png",
			restoreBtn = "/games/windows-parody/assets/image/restore.png";
var 	alertIcon ="<img src='/games/windows-parody/assets/image/alert.png' draggable='false'/>",
			infoIcon = "<img src='/games/windows-parody/assets/image/info.png' draggable='false'/>",
			errorIcon = "<img src='/games/windows-parody/assets/image/error.png' draggable='false'/>";
var 	errorSound = new Audio("/games/windows-parody/assets/audio/critical.mp3"),
			alertSound = new Audio("/games/windows-parody/assets/audio/exclamation.mp3"),
			infoSound = new Audio("/games/windows-parody/assets/audio/exclamation.mp3");
var 	startupSound = new Audio("/games/windows-parody/assets/audio/startup.mp3"),
			shutdownSound = new Audio("/games/windows-parody/assets/audio/shutdown.mp3");
var notAlreadyFit = true, notFit = false, start1;
window.timeList = {}, timeList.hours = ['00', '01', '02', '03','04','05','06','07','08','09','10','11','12'], timeList.minutes = ['00','15','30','45','60'], timeList.type = ['AM','PM'];

$(window).on('resize', windowsResize);
function windowsResize(){
	const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	
	$('#windowWidth b').html(w + 'px');
	$('#windowHeight b').html(h + 'px');
	
	if(w < 800){
		$('#windowWidth b').css('color','#ff6b6b');
	} else {
		$('#windowWidth b').css('color','#58ff58');
	}
	if( h < 600){
		$('#windowHeight b').css('color','#ff6b6b');
	} else {
		$('#windowHeight b').css('color','#58ff58');
	}
	
	if(w >= 799 && h >= 599){
		if(notAlreadyFit == true){
			restart();
			notAlreadyFit = false;
			notFit = false;
		}
	} else {
		if(notFit == false){
			clearTimeout(start1);
			notFit = true;
			notAlreadyFit = true;
			errorSound.play();
			startupSound.pause();
			startupSound.currentTime = 0;
		}
	}
}

function main(){
	let a = Math.floor(Math.random() * 13), b = Math.floor(Math.random() * 5), c = Math.floor(Math.random() * 2);
	$('.time').html( timeList.hours[a] + ':' + timeList.minutes[b] + ' ' + timeList.type[c]);
	start1 = setTimeout(function(){
		startupSound.play();
		$('#desktop').removeClass('hidden');
		setTimeout(function(){
			$('.taskbar, .start').removeClass('hidden');
			setTimeout(function(){
				$('.icons').removeClass('hidden');
				setTimeout(function(){
					$('.notification, .time').removeClass('hidden');
					setTimeout(function(){
						$(' .notification img').eq(0).removeAttr('class');
						setTimeout(function(){
							$(' .notification img').eq(1).removeAttr('class');
						}, 500)
						setTimeout(function(){
							$(' .notification img').eq(2).removeAttr('class');
						}, 1500)
						setTimeout(function(){
							$(' .notification img').eq(3).removeAttr('class');
						}, 3000)
					}, 2000)
				}, 1000)
			}, 1500)
		}, 2000)
	}, 1000)
};


$(window).contextmenu(function(e){ e.preventDefault() });

$(window).blur(start).mousedown(start);
$('.start, .taskbar').mousedown(function(e){ e.stopPropagation() });
$('.start .menulist div:not(bercabang)').click(start);

$('.start_button').click(function(){
	if($('.start').hasClass('opened')){ start() } 
	else { start(1) }
});

function start(a){
	if(a==1){
		$('.start').addClass('opened');
	} else {
		$('.start').removeClass('opened');
	}
}

$('dialog header, section.app header').append('<img class="close" tooltip="Close" src="' + closeBtn + '"/>');
$('section.app').children('header').append('<img class="minimize" tooltip="Minimize" src="' + minimizeBtn + '"/><img class="restore" tooltip="Maximize" src="' + maximizeBtn + '"/>');

$('#help').click(function(){ openApp("ms-help") })
$('#turnoff').click(function(){
	$('.turnoff_dialog dialog').removeAttr('style');
	$('.turnoff_dialog dialog article .buttons button').off('click');
	$('.turnoff_dialog').addClass('opened');
	$('.turnoff_dialog dialog article .info').html(errorIcon + 'Windows was unable to shut down. It seems like caused for a reason. Make sure there is no reason and click OK.');
	setTimeout(function(){
		errorSound.play();
		$('.turnoff_dialog').addClass('transparent');
		$('.turnoff_dialog dialog').attr('open', '');
		$('.turnoff_dialog dialog article .buttons button').eq(0).focus();
		$('.turnoff_dialog dialog header .close').click(function(){
				$('.turnoff_dialog').removeClass('transparent opened');
				$('.turnoff_dialog dialog').removeAttr('open');
				$('.turnoff_dialog dialog article .buttons .no').remove();
				$('.turnoff_dialog dialog article .buttons .yes').removeClass('yes').html('OK');
				$('.turnoff_dialog dialog article .buttons button').off('click');
		});
		$('.turnoff_dialog dialog article .buttons button').click(function(){
			$('.turnoff_dialog dialog').removeAttr('style');
			$('.turnoff_dialog').removeClass('transparent');
			$('.turnoff_dialog dialog').removeAttr('open');
			$('.turnoff_dialog dialog article .buttons button').off('click');
			$('.turnoff_dialog dialog article .info').html(alertIcon + 'You wanna leave this session earlier? Oh, think you\'re hiding something');
			$('.turnoff_dialog dialog article .buttons button').html('No! I didn\'t hide anything').addClass('yes');
			$('.turnoff_dialog dialog article .buttons').append('<button class="no">Cancel</button>');
			setTimeout(function(){
				alertSound.play();
				$('.turnoff_dialog').addClass('transparent');
				$('.turnoff_dialog dialog').attr('open', '');
				$('.turnoff_dialog dialog article .buttons button').eq(1).focus();
				$('.turnoff_dialog dialog article .buttons .no').click(function(){
					$('.turnoff_dialog').removeClass('transparent opened');
					$('.turnoff_dialog dialog').removeAttr('open');
					$('.turnoff_dialog dialog article .buttons .no').remove();
					$('.turnoff_dialog dialog article .buttons .yes').removeClass('yes').html('OK');
					$('.turnoff_dialog dialog article .buttons button').off('click');
				});
				$('.turnoff_dialog dialog article .buttons .yes').click(function(){
					$('.turnoff_dialog dialog').removeAttr('style');
					$('.turnoff_dialog').removeClass('transparent');
					$('.turnoff_dialog dialog').removeAttr('open');
					$('.turnoff_dialog dialog article .buttons .yes').off('click');
					$('.turnoff_dialog dialog article .buttons .yes').html('OK');
					$('.turnoff_dialog dialog article .info').html(alertIcon + 'OK Windows is gonna believe you this time. But, don\'t think you\'ll get off this easily every time!');
					setTimeout(function(){
						alertSound.play();
						$('.turnoff_dialog').addClass('transparent');
						$('.turnoff_dialog dialog').attr('open', '');
						$('.turnoff_dialog dialog article .buttons button').eq(1).focus();
						$('.turnoff_dialog dialog article .buttons .yes').click(function(){
							$('.turnoff_dialog dialog').removeAttr('style');
							$('.turnoff_dialog').removeClass('transparent');
							$('.turnoff_dialog dialog').removeAttr('open');
							$('.turnoff_dialog dialog article .buttons .yes').off('click');
							$('.turnoff_dialog dialog article .buttons .yes').html('Yes');
							$('.turnoff_dialog dialog article .buttons .no').html('No');
							$('.turnoff_dialog dialog article .info').html(alertIcon + 'Are you sure you wanna quit this wonderful operating system? There\'s a high chance of your processor overheating.');
							setTimeout(function(){
								alertSound.play();
								$('.turnoff_dialog').addClass('transparent');
								$('.turnoff_dialog dialog').attr('open', '');
								$('.turnoff_dialog dialog article .buttons button').eq(1).focus();
								$('.turnoff_dialog dialog article .buttons .yes').click(function(){
									$('.turnoff_dialog dialog').removeAttr('style');
									$('.turnoff_dialog').removeClass('transparent');
									$('.turnoff_dialog dialog').removeAttr('open');
									$('.turnoff_dialog dialog article .buttons .yes').off('click');
									$('.turnoff_dialog dialog article .info').html(alertIcon + 'Are you sure? Why now, instead of shutting down, try Help and Support Center to make sure that you deserve your own');
									setTimeout(function(){
										alertSound.play();
										$('.turnoff_dialog').addClass('transparent');
										$('.turnoff_dialog dialog').attr('open', '');
										$('.turnoff_dialog dialog article .buttons button').eq(1).focus();
										$('.turnoff_dialog dialog article .buttons .yes').click(function(){
											$('section.app').children('header').children('.close').click();
											$('.turnoff_dialog dialog').removeAttr('style');
											$('.turnoff_dialog').removeClass('transparent');
											$('.turnoff_dialog dialog').removeAttr('open');
											$('.turnoff_dialog dialog article .buttons .yes').off('click');
											$('.turnoff_dialog dialog article .info').html(alertIcon + 'Are you sure? <br/>Fine. If you click yes now, Windows will shut down. Honest...');
											setTimeout(function(){
												alertSound.play();
												$('.turnoff_dialog').addClass('transparent');
												$('.turnoff_dialog dialog').attr('open', '');
												$('.turnoff_dialog dialog article .buttons button').eq(1).focus();
												$('.turnoff_dialog dialog article .buttons .yes').click(function(){
													shutdownSound.play();
													$('#desktop, .turnoff_dialog').addClass('hidden');
												});
											}, 5000)
										});
									}, 3000);
								});
							}, 2000)
						});
					},1000)
				});
			}, 2000)
		});
	}, 4000)
});

$('section.app header, dialog header').on('mousedown', function(e){
	var whereYouAre = this, top = e.clientY, left = e.clientX, ops = $(this).offset();
	
	mouseMoveEvent = function(e)
	{
		let dTop = ops.top + (e.clientY - top) - 2, dLeft =  ops.left + (e.clientX - left) - 7;
		if (dTop < 0){
			dTop = 0;
		} else if (dTop > ($(window).height() - $(whereYouAre).parent('dialog, section.app').outerHeight() - 43)){
			dTop = $(window).height() - $(whereYouAre).parent('dialog, section.app').outerHeight() - 43;
		}
		if(dLeft < 0){
			dLeft = 0
		} else if (dLeft > ($(window).width() - $(whereYouAre).parent('dialog, section.app').outerWidth())){
			dLeft = $(window).width() - $(whereYouAre).parent('dialog, section.app').outerWidth()
		}
		$(whereYouAre).parent('dialog, section.app').offset({top: dTop, left: dLeft});
	};
	$(window).on('mousemove', (e) => { mouseMoveEvent(e) });
});
$(window).on('mouseup', function()
{
	mouseMoveEvent = () => {};
	//$(window).off('mousemove', mouseMoveEvent);
});
$('img').on('dragstart', false);
$('header img').on('mousedown', function(e){ e.stopPropagation() });


var mouseMoveEvent;

var toolTime, toolChange;
$('[tooltip]').on('mouseenter', function(){
	clearTimeout(toolTime);
	clearTimeout(toolChange);
	var topNya, leftNya, those = this;
	mouseMoveEvent = function(e)
	{
		topNya = e.clientY + 25;
		leftNya = e.clientX;
		if( $(those).closest('.taskbar').length > 0  ){
			topNya = $(window).height() - 40 - 25;
		} 
		if( leftNya > ($(window).width() - $('.tooltip').outerWidth()) ){
			leftNya = $(window).width() - $('.tooltip').outerWidth()
		}
	};
	$(window).on('mousemove', (e) => { mouseMoveEvent(e) });
	toolChange = setTimeout(function(){
		$('.tooltip').html( $(those).attr('tooltip') );
	}, 200)
	toolTime = setTimeout(function(){
		$('.tooltip').offset({top: topNya, left: leftNya}).addClass('show');
	}, 700)
}).on('mouseleave', function(){
	clearTimeout(toolTime);
	clearTimeout(toolChange);
	$('.tooltip').removeClass('show');
}).on('mouseup', function(){
	clearTimeout(toolTime);
	clearTimeout(toolChange);
	$('.tooltip').removeClass('show');
});

$('.app').mousedown(function(){
	a = $(this).attr('id');
	openApp(a)
})
function openApp(a){
	const appName = $('#'+a ).children('header').text(), appIndex = $('#app_'+a).index();
	$('.taskbar .applications .app_list:not(#app_' + a + ')').removeClass('focused');
	$('.taskbar .applications #app_' + a).addClass('focused');
	if( $('.taskbar .applications #app_' + a).length > 0 ){
	} else {
		$('section.app#' + a).addClass('opened');
		$('.taskbar .applications').append('<div class="app_list focused" onclick="openApp(\'' + a +  '\')" id="app_' + a + '">' + appName + '</div>');
	}
	$('section.app#' + a).addClass('indexed').css('z-index','');
	$('section.app:not(#' + a + ')').removeClass('indexed').css('z-index','1');
}
$('section.app').children('header').children('.close').click(function(){
	$(this).parents('section.app').removeClass('opened').removeAttr('style');
	$(this).parents('section.app').children('dialog').removeAttr('open style');
	$('#app_' + $(this).parents('section.app').attr('id')).remove()
})
$('dialog header .close').click(function(){
	$(this).parents('dialog').removeAttr('open style')
})

function restart(){
	$('section.app').children('header').children('.close').click();
	$('dialog').children('header').children('.close').click();
	$('#desktop, .taskbar, .start, .icons, .notification, .time, .notification img').addClass('hidden');
	main();
}

$('#desktopDialog article .buttons button').click(function(){
	$('#desktopDialog header .close').click();
})
function openAppDialog(a){
	let text = infoIcon, appTitle = '<br/>', sound = infoSound;
	if(a == 'ms-defender'){
		appTitle = 'Windows Defender';
		text = errorIcon + '<span>Windows Defender has been disabled by your administrator due to useless function of this app.</span>';
		sound = errorSound;
	} else if(a == 'ms-lookout'){
		appTitle = 'LookOut Express';
		text = errorIcon + '<span>LookOut cannot be opened. Make sure you have Mail Box installed on your home. If you do, then uninstall it and buy a new one.</span>';
		sound = errorSound;
	} else if(a == 'ms-update'){
		appTitle = 'Windows Update';
		text = infoIcon + '<span>A newer version has been found. Do you want to download it?<br/><b>Data needed:</b> 2905 TB</span>';
		sound = infoSound;
	}
	$('#desktopDialog header [appName]').html(appTitle);
	$('#desktopDialog article .info').html(text);
	setTimeout(function(){
		$('#desktopDialog').attr('open','');
		$('#desktopDialog article .buttons button').focus();
		sound.play();
	}, 50)
}