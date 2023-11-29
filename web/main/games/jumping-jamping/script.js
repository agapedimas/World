$(window).ready(function()
{
	$("section.menu").addClass("opened");	
});

$(".menu #play").on("click", function()
{
	if (Status.IsLoading)
		return;
	Status.IsLoading = true;
	
	$("section.transition").addClass("opened");
	setTimeout(function()
	{
		$("section.menu").removeClass("opened");	
	}, 500);
	setTimeout(function()
	{
		$("section.transition").removeClass("opened");
		$("section.game").addClass("opened");
		Game_Start();
	}, 750);
});

$(".menu #difficulty").on("click", function()
{
	switch (Status.Difficulty)
	{
		case 1:
			Status.Difficulty = 2;
			$(this).html("Easy");
			break;
		case 2:
			Status.Difficulty = 3;
			$(this).html("Medium");
			break;
		case 3:
			Status.Difficulty = 4;
			$(this).html("Hard");
			break;
		case 4:
			Status.Difficulty = 5;
			$(this).html("Expert");
			break;
		case 5:
			Status.Difficulty = 6;
			$(this).html("Impossible");
			break;
		case 6:
			Status.Difficulty = 1;
			$(this).html("Peaceful");
			break;
	}
	$(".game").attr("difficulty", Status.Difficulty);
});

$(".end #retry").on("click", function()
{
	if (Status.IsLoading)
		return;
	Status.IsLoading = true;
	
	$("section.transition").addClass("opened");
	setTimeout(function()
	{
		$("section.end").removeClass("opened");	
	}, 500);
	setTimeout(function()
	{
		$("section.transition").removeClass("opened");
		$("section.game").addClass("opened");
		Game_Start();
	}, 750);
});

$(".end #mainmenu").on("click", function()
{
	$("section.transition").addClass("opened");
	setTimeout(function()
	{
		$("section.end").removeClass("opened");	
	}, 500);
	setTimeout(function()
	{
		$("section.transition").removeClass("opened");
		$("section.menu").addClass("opened");
	}, 750);
});

$(".game")
	.on("click", Jumper_Up)
	.on("touchstart", function(e) 
	{
		e.preventDefault();
		Jumper_Up();
	});
$(window).on("keydown", function(e)
{
	if (e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 13)
		Jumper_Up();
});

const Status = 
{
	IsLoading: false,
	IsPlaying: false,
	Score: 0,
	Difficulty: 3 // 1-6 or easiest-hardest
}
var Timeout = 
{
	Jumper: null
}
var Interval = 
{
	JumperAlive: null,
	PillarAppend: null,
	PillarMove: null
}

function Game_Start()
{
	var LevelTime = 0;
  if (Status.Difficulty == 1)
		LevelTime = 3500;
	else if (Status.Difficulty == 2)
		LevelTime = 2500;
	else if (Status.Difficulty == 3)
		LevelTime = 2000;
	else if (Status.Difficulty == 4)
		LevelTime = 1500;
	else if (Status.Difficulty == 5)
		LevelTime = 1000;
	else if (Status.Difficulty == 6)
		LevelTime = 500;
	
	Pillar_Move();
	
	setTimeout(function()
	{
		$(".game .jumper").addClass("fall");
		Status.IsPlaying = true;
		Status.IsLoading = false;
		
		Interval.JumperAlive = setInterval(Jumper_CheckAlive, 0.1);
		Interval.PillarAppend = setInterval(Pillar_Append, 150);
		Interval.PillarMove = setInterval(Pillar_Move, LevelTime);
	}, 1350);
}

function Game_End()
{
	Status.IsPlaying = false;
	Status.Score = 0;
	
	for (const [key, value] of Object.entries(Timeout)) 
	{
		clearTimeout(window["Timeout"][key]);
	}
	for (const [key, value] of Object.entries(Interval)) 
	{
		clearInterval(window["Interval"][key]);
	}
	for (const [key, value] of Object.entries(PillarLastPosition)) 
	{
		window["PillarLastPosition"][key] = 0;
	}
}

function Jumper_Up()
{
	if (!Status.IsPlaying)
		return;
	
	let jumperPosition = $(".game .jumper").offset().top;
	clearTimeout(Timeout.Jumper);
	$(".game .jumper").removeClass("fall");
	$(".game .jumper").css("--position", jumperPosition - 100 + "px")
	
	Timeout.Jumper = setTimeout(function()
	{
		$(".game .jumper").addClass("fall");
	}, 350)
}

function Jumper_CheckAlive()
{
	if (!Status.IsPlaying)
		return;
	
	Jumper_CheckScore();
	
	const jumper = $(".game .jumper");
	const offset = jumper[0].getBoundingClientRect();

	if (Fullscreen_Active() && offset.top <= 0)
		Jumper_Dead("Jamping flew too high", offset.top);
	else if (offset.top <= 32)
		Jumper_Dead("Jamping flew too high", offset.top);
	else if (offset.bottom >= $(window).height())
		Jumper_Dead("Jamping fell", offset.top);
	else if (Pillar_CheckBound())
		Jumper_Dead("Jamping hit the pillar", offset.top);
}

function Jumper_CheckScore()
{
	if (!Status.IsPlaying)
		return;
	
	if ($(".pillars .pillar").length == 0)
		return;
	
	let offset =
	{
		jumper: $(".jumper").offset().left,
		pillar: $(".pillars .pillar").eq(Status.Score).offset().left
	}
	if (offset.jumper > (offset.pillar + 50))
	{
		Status.Score += 1;
		$(".end .score span").html(Status.Score);
		$(".game").attr("score", Format_ZeroDigit(Status.Score));
	}
}

function Jumper_Dead(reason, offsetTop)
{
	Game_End();
	$("section.end").addClass("opened");
	$("section.end .reason").html(reason);
	$("section.end .buttons").removeClass("opened");
	$("section.game").addClass("dead");
	$(".game .pillars").css("transform", "translateX(" + $(".game .pillars").offset().left + "px)");
	if (offsetTop != null)
		$(".game .jumper").css("--position", offsetTop - $(".root").offset().top + "px");
	setTimeout(function()
	{
		$("section.game").removeClass("opened dead");
		$(".game .pillars").html("").css("transform", "");
		$(".game .jumper").removeClass("fall").css("--position", "");
		$(".game").attr("score", Format_ZeroDigit(Status.Score));
	}, 1000);
}

var PillarLastPosition = 
{
	Append: 0,
	Move: 0
};
function Pillar_Append()
{
	if (!Status.IsPlaying)
		return;
	
	var position = 
	{
		left: PillarLastPosition.Append + 250,
		top: Math.ceil(Math.random() * 20) * (Math.round(Math.random()) ? 1 : -1)
	}
  PillarLastPosition.Append = position.left;
  $(".pillars").append(
		"<div class='pillar' style='left:" + position.left + "px;top:" + position.top + "vh'>" +
			"<div class='up'></div>"+
			"<div class='down'></div>"+
		"</div>"
	);
}
function Pillar_Move()
{
	if (!Status.IsPlaying)
		return;
	
	$(".pillars").css("transform", "translateX(" + ($(window).width() - (PillarLastPosition.Move * 2)) + "px)");
	PillarLastPosition.Move = PillarLastPosition.Move + 250;
}
function Pillar_CheckBound()
{
	if (!Status.IsPlaying)
		return;
	
	if ($(".pillars .pillar").length == 0)
		return;
	
  var PillarUp = $(".pillars .pillar .up")[Status.Score].getBoundingClientRect();
  var PillarDown = $(".pillars .pillar .down")[Status.Score].getBoundingClientRect();
  var Jumper = $(".jumper")[0].getBoundingClientRect();

  return (PillarUp.right >= Jumper.left && PillarUp.left <= Jumper.right) && (PillarUp.bottom >= Jumper.top && PillarUp.top <= Jumper.bottom) || (PillarDown.right >= Jumper.left && PillarDown.left <= Jumper.right) && (PillarDown.bottom >= Jumper.top && PillarDown.top <= Jumper.bottom);
}