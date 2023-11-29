{

let Chat_Random_History = [];
let Chat_Random; 
var Chat_History = [];
let Chat_History_Temp = [];
var Chat_Tones = 
{
	bgm: "/games/kode-keras-guru/assets/audio/bgm.opus",
	door_open: "/games/kode-keras-guru/assets/audio/door_open.mp3",
	door_close: "/games/kode-keras-guru/assets/audio/door_close.mp3",
	context: "/games/kode-keras-guru/assets/audio/context.mp3",
	question: "/games/kode-keras-guru/assets/audio/received.mp3",
	answer: "/games/kode-keras-guru/assets/audio/sent.mp3"
}

const Status = 
{
	IsPlaying: true,
	Score: 0,
	NextScore: 0
}
let DoorLastOpened = false;
$(window).ready(async function()
{
	await Game_Prepare();
	$(".loading .wait").html("Beres, yuk masuk!");
	$(".loading .progressbar").removeClass("show");
	$(".loading button").removeClass("hidden").click(Begin);
	$(".transition").on("classChanged", function()
	{
		if (DoorLastOpened == $(this).attr("class").includes("opened"))
			return;
		else
			DoorLastOpened = $(this).attr("class").includes("opened");
		
		if ($(this).attr("class").includes("opened"))
		{
			let audio = new Audio(Chat_Tones.door_close);
			audio.play()	
		}
		else
		{
			let audio = new Audio(Chat_Tones.door_open);
			audio.play()	
		}
	});
	$("#Button_Start").click(Game_Start);
	$("#Button_Continue").click(Game_Continue);
	$("#Button_Retry").click(Game_Continue);
	$("#Button_MainMenu").click(Game_MainMenu);
	$("#Button_About").click(() => 
	{
		$(".main .about").addClass("opened");	
	});
	$(".about .close").click(() => 
	{
		$(".main .about").removeClass("opened");	
	});
	$(".game").click(Chat_Next);
	$(window).on("keyup", function(e)
	{
		let key = [13, 32, 40];
		let answer = [49, 50, 51, 52, 53, 54, 55, 56, 57];
		if (key.includes(e.keyCode))
			Chat_Next();
		else if (answer.includes(e.keyCode) && $(".choice").hasClass("opened"))
			$(".choice .button[key=" + (48 - e.keyCode) * -1 + "]").click();
	})
})

async function Begin()
{
	$(".loading").removeClass("opened");
	$(".transition, .menu, .game").addClass("opened");
	
	var audioClass = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext ||  window.msAudioContext);
  var audioCtx = new audioClass();
  const resp = await fetch(Chat_Tones.bgm);
  const buf = await resp.arrayBuffer();
  const bgm = await audioCtx.decodeAudioData(buf);
  const source = audioCtx.createBufferSource();
  source.buffer = bgm;
  source.connect(audioCtx.destination);
  source.start();
  source.loop = true;
}
let Chat_Next = function()
{
	if (Chat_History.length == 0)
		return;
	if ($(".choice").hasClass("opened"))
		return;
	
	Chat_History[0]();
	Chat_History.shift();
}
async function Chat_Receive(plots)
{
	Chat_History_Temp = [];
	for (let plot of plots)
	{
		if (plot.type == "win")
		{
			await Chat_Append(plot.value, "context");
			await Chat_History_Temp.push(function()
			{
				$(".outro .lastword").html(plot.outro);
				Game_Win();
			})
		}
		else if (plot.type == "lose")
		{
			await Chat_Append(plot.value, "context");
			await Chat_History_Temp.push(function()
			{
				$(".outro .lastword").html(plot.outro);
				Game_Lose();
			})
		}
		else
		{
			await Chat_Append(plot.value, plot.type);
		}
	}
	
	Chat_History = Chat_History_Temp.concat(Chat_History);
}
let Chat_Append = function(content, type)
{
	const append = function(content, type)
	{
		let action = () =>
		{
			let audio = new Audio(Chat_Tones[type]);
			const elem = document.createElement("div");
			$(elem).addClass(type);
			$(elem).html(content);
			if ($(".game .chat").children().last().hasClass(type) == false)
				$(elem).addClass("first");
			$(".game .chat").append(elem);
			$(".game .chat").scrollTop($(".game .chat")[0].scrollHeight);
			audio.play();
		}
		Chat_History_Temp.push(action);
	}
	return new Promise(async (resolve) =>
	{
		if (type == "choice")
		{
			Chat_History_Temp.push(async function()
			{
				$(".game .choice").html("");
				let key = 0;
				for (let choice of content)
				{
					const elem = document.createElement("div");
					$(elem).addClass("button");
					$(elem).html(choice.placeholder);
					$(elem).attr("key", ++key);
					$(elem).click(async function(e)
					{		
						$(".game .choice").removeClass("opened");
						$(".game .chat").css("transform", "");
						$(".game .chat").css("transition-delay", "");
						await Chat_Receive(choice.plot);
						Chat_Next();
						e.stopPropagation();
					})
					$(".game .choice").addClass("opened");
					$(".game .choice").append(elem);
					$(".game .chat").css("transform", "translateY(calc(-" + $(".game .choice").outerHeight() + "px + 175px))");
					$(".game .chat").css("transition-delay", "0s");
					$(".game .chat").scrollTop($(".game .chat")[0].scrollHeight);
				}
			})
		}
		else
		{
			if (typeof content == "string")
			{
				append(content, type);
			}
			else
			{
				for (let con of content)
				{
					append(con, type);
				}
			}
		}

		resolve();
	});
}

let Game_Prepare = async function()
{
	let index = 0;
	let Chat_Contexts = [];
	let Chat_Teachers = [];
	Chat_Random = async function()
	{
		if (Chat_Contexts.length == 0)
		{
			await $.post("/games/kode-keras-guru/sheets[p].json", null, (data) => {
				Chat_Contexts = data;
			})
		}
		if (Chat_Teachers.length == 0)
		{
			await $.post("/games/kode-keras-guru/teachers[p].json", null, (data) => {
				Chat_Teachers = data;
			})
		}
		
		$(".game").removeClass("outro");
		$(".game .chat, .game .answer").html("");
		$(".profile .picture").attr("src", "");
		$(".profile .name").html("");
		$(".profile .desc").html("");
		
		index = Math.random().toFixed(1) * (Chat_Contexts.length - 1);
		index = Math.round(index);
		if (Chat_Random_History.includes(index))
		{
			Chat_Random();
		}
		else
		{
			let context = Chat_Contexts[index];
			Chat_Random_History.push(index);

			for (let teacher of Chat_Teachers)
			{
				if (teacher.id == context.teacher)
				{
					$(".profile .picture").attr("src", "kode-keras-guru/assets/image/teachers/" + teacher.id + ".png");
					$(".profile .name").html(teacher.name);
					$(".profile .desc").html(teacher.desc);
				}
			}
			Status.NextScore = context.score;
			await Chat_Receive(context.plot);
			Chat_Next();
			
			if (Chat_Random_History.length == Chat_Contexts.length)
				Chat_Random_History = [index];
		}
	}
	for (const [key, value] of Object.entries(Chat_Tones)) 
	{
		await URL_ToBlob(value).then(url => 
		{
			window["Chat_Tones"][key] = url;
		});
	}
}
let Game_Start = function()
{
	Status.IsPlaying = true;
	Status.Score = 0;
	$(".score").html(Status.Score);
	$(".menu, .transition").removeClass("opened ending");
	$(".game").addClass("opened");
	Chat_Random();
}
let Game_Continue = function()
{
	Status.IsPlaying = true;
	$(".end, .transition").removeClass("opened ending");
	$(".game").addClass("opened");
	Chat_Random();
}
async function Game_Win()
{
	Status.IsPlaying = false;
	Chat_History = [];
	Status.Score += parseInt(Status.NextScore);
	$(".score").html(Status.Score);
	$("#Button_Continue").show();
	$("#Button_Retry").hide();
	$(".transition").removeClass("opened ending");
	$(".end").addClass("opened win");
	$(".game").removeClass("opened");
}
async function Game_Lose()
{
	Status.IsPlaying = false;
	Chat_History = [];
	if (Status.Score - 5 >= 0)
		Status.Score -= 5;
	else
		Status.Score = 0;

	$(".score").html(Status.Score);
	$("#Button_Continue").hide();
	$("#Button_Retry").show();
	$(".end").removeClass("win");
	$(".end, .transition").addClass("opened ending");
	$(".game").removeClass("opened");
}
function Game_MainMenu()
{
	Status.IsPlaying = false;
	$(".transition").addClass("opened");
	$(".transition").removeClass("ending");
	$(".end").removeClass("opened win");
	$(".menu").addClass("opened");
	$(".game").removeClass("opened");
}	

}

(function( func ) {
    $.fn.addClass = function() { // replace the existing function on $.fn
        func.apply( this, arguments ); // invoke the original function
        this.trigger('classChanged'); // trigger the custom event
        return this; // retain jQuery chainability
    }
})($.fn.addClass); // pass the original function as an argument

(function( func ) {
    $.fn.removeClass = function() {
        func.apply( this, arguments );
        this.trigger('classChanged');
        return this;
    }
})($.fn.removeClass);