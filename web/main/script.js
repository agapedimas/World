$(".navigation a").each(function()
{
	const thisHref = $(this).attr("goto");
  if (thisHref != null && window.location.href.includes(thisHref))
  {
  	$(this).addClass("active");
  }
  else
  {
  	$(this).removeClass("active");
  }
});

$("a").each(function()
{
	const href = $(this).attr("goto");	
	const type = $(this).attr("ad-type");

	$(this).click(function()
	{
		if (href != null)
		{
			if (type == "newtab")
				window.open(href); 
			else
				window.location.href = href; 
		}
	})
});

let Document_Title;
let Media_Captions = [];

var Seek_Interval;
function Audio_Open(item, image, elem)
{
	let url = item.audio;
	let name = item.name;
	let desc = item.desc;

	if ($(".audio").length == 0)
	{
		Media_Prepare("audio");
	}
	Audio_CheckSize();
	$(".audio").css({"--top":"", "--left": "", "--scale": ""}); 
	$(".audio").removeClass("has-lyrics");
	$(".audio .lyrics .container").html("");
	$(".audio .lyrics").css("--scroll", 0);
	$(".audio .seekbar").attr({"duration": Format_Duration(0), "total": Format_Duration(0)});
	$(".audio .seekbar input").val(0).css("--value", "0px");

	for (let caption of Media_Captions)
	{
		if (caption.id == item.id)
		{
			$(".audio").addClass("has-lyrics");
			for (let line of caption.captions.split("\n"))
			{
				let duration = line.match(/\[(.*?)\]/i);

				if (duration == null)
					continue;

				line = line.replace(duration[0], "");
				duration = duration[1];

				if (duration.split(":").length == 0)
					continue;

				let lyric = document.createElement("div");
				lyric.append(line);
				lyric.setAttribute("time", duration);

				$(".audio .lyrics .container").append(lyric);
			}
			break;	
		}
	}
	{
		//animation
		let offset = 
		{ 
			image_Player: $(".audio .frame")[0].getBoundingClientRect(), 
			image_Thumbnail: elem[0].getBoundingClientRect()
		}
		let animation =
		{
			top: offset.image_Thumbnail.y,
			left: offset.image_Thumbnail.x
		}
		$(".audio").css({"--top": animation.top - 1 + "px", "--left": animation.left - 5 + "px", "--scale": animation.scale, "transition": "none" });
		elem.css({"--top": animation.top + "px", "--left": animation.left + "px"});
	}
	$(".audio").addClass("loading");
	$(".audio .background").css("--background-scale", "0");
	$(".audio").css("--image", "url(" + image + ")");
	if (item.background != null)
	{
		$(".audio .background").css("--background", "url(" + item.background + ")");
	}
	else
		$(".audio .background").css("--background", "");
	$(".audio audio").attr("src", url);
	$(".audio .frame img").attr("src", image);
	$(".audio .name").html(name);
	$(".audio .desc").html(desc);

	if ("mediaSession" in navigator) 
	{
		navigator.mediaSession.metadata = new MediaMetadata(
		{
			title: name,
			artist: desc,
			artwork: [{src: image}]
		});
	}

	if (item.external != null)
		$(".audio .open").attr("goto", item.external);
	else
		$(".audio .open").removeAttr("goto");

	setTimeout(function()
	{
		elem.addClass("previewing");
		$(".audio").addClass("opened").css("transition", "");
		$(".titlebar").removeClass("expanded");
		document.title = name + " - " + Document_Title;
		$(".titlebar").attr("theme", "dark");
	}, 100);
}
function Audio_Close()
{
	Fullscreen_Exit();
	$(".audio audio")[0].pause();
	$(".audio audio").attr("src", "")
	$(".audio").removeClass("opened");
	$(".lists .list").removeClass("previewing");
	Sidebar_Check();
	document.title = Document_Title;
	$(".titlebar").removeAttr("theme");
}
async function Audio_CheckSize()
{
	$(".lyrics *").css("transition", "none");
	await delay(10);
	if ($(".audio").hasClass("has-lyrics"))
		Captions_Play("audio", $(".audio .seekbar input").val(), true);
	await delay(10);
	$(".lyrics *").css("transition", "");
}

function Video_Open(item, image, elem)
{
	let url = item.video;
	let name = item.name;
	let desc = item.desc;

	if ($(".video").length == 0)
	{
		Media_Prepare("video");
	}

	$(".titlebar").addClass("fullscreen");
	
	Metadata_Show();
	Metadata_AllowHide = false;
	Video_CheckSize();
	$(".video").css({"--top": "", "--left": "", "--scale": ""})
	$(".video .seekbar").attr({"duration": Format_Duration(0), "total": Format_Duration(0)});
	$(".video .seekbar input").val(0).css("--value", "0px");
	{
		//animation
		let offset = 
		{ 
			image_Player: {x: 0, y: 0}, 
			image_Thumbnail: elem[0].getBoundingClientRect()
		}
		let animation =
		{
			top: offset.image_Thumbnail.y,
			left: offset.image_Thumbnail.x
		}
		$(".video").css({"--top": animation.top + "px", "--left": animation.left + "px", "--scale": animation.scale, "transition": "none" })
	}
	$(".video").addClass("loading");
	$(".video video").attr("src", url).attr("poster", image);
	$(".video img").attr("src", image);
	$(".video .name").html(name);
	$(".video .desc").html(desc);
	if ("mediaSession" in navigator) 
	{
		navigator.mediaSession.metadata = new MediaMetadata(
		{
			title: name,
			artist: "",
			artwork: [{src: image}]
		});
	}
	setTimeout(function()
	{
		elem.addClass("previewing");
		$(".video").addClass("opened").css("transition", "");
		$(".titlebar").removeClass("expanded");
		document.title = name + " - " + Document_Title;
		$(".titlebar").attr("theme", "dark");
	}, 100);
}
function Video_Close()
{
	Fullscreen_Exit();
	$(".titlebar").removeClass("fullscreen");
	$(".video video")[0].pause();
	$(".video video").attr("src", "")
	$(".video").removeClass("opened");
	$(".lists .list").removeClass("previewing");
	Sidebar_Check();
	document.title = Document_Title;
	$(".titlebar").removeAttr("theme");
}
async function Video_CheckSize()
{
	await delay(101);
	$(".titlebar").addClass("fullscreen");
}

function List_Prepare(locked)
{
	$("#MainLoading").addClass("show");
	let lists = [];
	$("article[category][type]").each(function()
	{
		const category = $(this).attr("category");
		const type = $(this).attr("type");
		$(this).attr("id", category + "_" + type);
		lists.push([category, type]);
	})
	$.ajax({
		type: "POST",
		data: Challenge_Data,
		url: List_Source,
		success: function(data)
		{
			for (list of lists)
			{
				List_Append(data, list[0], list[1]);
			}
			List_Finish();
		},
		error: function(data)
		{
			if (window["List_ErrorAction"] != null)
				List_ErrorAction();
		}
	});
}

function List_Append(lists, type, section)
{
	for (let item of lists[type][section])
	{
		if (item == null)
			continue;

		if ($("#" + type + "_" + section + " .lists .scroll").length == 0)
			$("#" + type + "_" + section + " .lists").append("<div class='scroll'></div>");

		let list = document.createElement("div");
		list.classList.add("list");
		let list_date = document.createElement("div");
		list_date.classList.add("date");
		let list_image = document.createElement("img");
		list_image.classList.add("thumbnail");
		let list_text = document.createElement("div");
		list_text.classList.add("text");
		let list_name = document.createElement("div");
		list_name.classList.add("name");
		let list_desc = document.createElement("div");
		list_desc.classList.add("desc");
		let list_footer = document.createElement("div");
		list_footer.classList.add("footer");

		if (item.id != null)
			URL_ToData(List_Thumbnail + "/" + type + "/" + item.id + ".webp", (url) => { list_image.src = url });

		if (item.date)
		{
			list_date.innerHTML = Format_Date(item.date, "shortdate-elem");
			list_text.append(list_date);
		}

		if (item.section)
		{
			list_name.append(item.section);
			list_text.append(list_name);
			list.classList.add("section");
		}
		else if (item.name)
		{
			list_name.append(item.name);
			list_text.append(list_name);
		}
		if (item.desc)
		{
			list_desc.append(item.desc);
			if (item.desc.includes("[link"))
			{
				let links = item.desc.match(/\[link(.*?)]/g);
				for (let link of links)
				{
					let json = JSON.parse(link.match(/\{(.*?)}/g));
					item.desc = item.desc.replace(link, "<a class='link' goto='" + json.url + "' onclick='window.open($(this).attr(\"goto\")); event.stopPropagation();'>" + json.text + "</a>");
				}
				$(list_desc).html(item.desc); 
			}
			list_text.append(list_desc);
		}
		if (item.footer)
		{
			list_footer.append(item.footer);
			list_text.append(list_footer);
		}
		item.showimage = item.showimage == null ? true : item.showimage.toString().toLowerCase() == "true";
		if (item.id && item.id != "" && item.showimage != false)
		{
			list.append(list_image);
		}

		list.append(list_text);

		if (item.rate != null)
			$(list).attr("rate", item.rate).css("--rate", item.rate);

		if (item.url != null)
			$(list).click(function() { setTimeout(x => window.open(item.url), 150); }).addClass("clickable link_newwindow");

		if (item.audio != null)
			$(list).click(function() { Audio_Open(item, list_image.src, $(this)) }).addClass("clickable link_audio");

		if (item.video != null)
			$(list).click(function() { Video_Open(item, list_image.src, $(this)) }).addClass("clickable link_video");

		if (item.captions != null && item.captions.trim() != "")
			Media_Captions.push({"id": item.id, "captions": item.captions});

		$("#" + type + "_" + section + " .lists .scroll").append(list);
	}
}

function List_Finish()
{
	$(".lists").each(function()
	{
		let parentId = $(this).parent().attr("id");
		let lists = $("#" + parentId + " .lists .scroll");
		let list = lists.children("div");
		let gap = $(this).hasClass("cascaded") ? 8 : 18;

		$(this).prepend(
			"<div class='arrows'>" +
				"<div class='arrow prev'></div>"	+						
				"<div class='arrow next'></div>" +					
			"</div>");
		
		$(this).children(".arrows").children(".prev").click(function()
		{ 
			const scroll = lists.scrollLeft();
			lists.scrollLeft(scroll - list.eq(0).outerWidth() - gap);
		});
		$(this).children(".arrows").children(".next").click(function()
		{ 			
			const scroll = lists.scrollLeft();
			lists.scrollLeft(scroll + list.eq(0).outerWidth() + gap);
		});
		$(this).children(".scroll").on("scroll", function() { List_CheckArrow($("#" + parentId + " .lists")) });

		$(this).parent().addClass("show");
	});

	setTimeout(function()
	{
		List_CheckArrow();	
		Reveal_Prepare();
	}, 1000);

	if (window["List_FinishAction"] != null)
		window["List_FinishAction"]();

	$("#MainLoading").removeClass("show");
	Document_Title = document.title;
}

function List_CheckArrow(element)
{
	if (element == null)
	{
		element = $(".lists");	
	}
	element.each(function()
	{
		if ($(this).children(".scroll").length == 0)
			return;

		const scroll = $(this).children(".scroll").scrollLeft();
		const scrollWidth = $(this).children(".scroll")[0].scrollWidth; 
		const innerWidth = $(this).children(".scroll").innerWidth(); 

		if (scrollWidth <= innerWidth)
		{
			//means scroll is not necessary 
			$(this).children(".arrows").children(".next").removeClass("show");
			$(this).children(".arrows").children(".prev").removeClass("show");
			return;
		}

		if (scroll > (scrollWidth - innerWidth) - 1)
		{
			$(this).children(".arrows").children(".next").removeClass("show");
			$(this).children(".arrows").children(".prev").addClass("show");
		}
		else if (scroll < 1)
		{
			$(this).children(".arrows").children(".next").addClass("show");
			$(this).children(".arrows").children(".prev").removeClass("show");
		}
		else
		{
			$(this).children(".arrows").children(".next").addClass("show");
			$(this).children(".arrows").children(".prev").addClass("show");
		}
	});
}

let Reveal_Elements = [".clickable"];
let Reveal_Offset = { X: 0, Y: 0 };
let Reveal_ParentOffset = { top: 0, left: 0 };
let RevealTimeout = { down: null, up: null }
function Reveal_Prepare()
{
	for (element of Reveal_Elements)
	{
		$(element).addClass("reveal");
	}

	$(".reveal").each(function()
	{
		$(this).append("<div class='mover'><div class='active'/></div>");
		$(this).on("touchmove", Reveal_Move);
		$(this).on("mousemove", Reveal_Move);
		$(this).on("touchstart", Reveal_Down);
		$(this).on("mousedown", Reveal_Down);
	});

	$(window).on("touchend", Reveal_Up);
	$(window).on("mouseup", Reveal_Up);
}
function Reveal_Move(event)
{
	if (event.type == "touchmove")
	{
		Reveal_Offset.X = event.touches[0].pageX;
		Reveal_Offset.Y = event.touches[0].pageY;
	}
	else
	{
		Reveal_Offset.X = event.pageX;
		Reveal_Offset.Y = event.pageY
	}
	
	Reveal_ParentOffset = $(event.currentTarget).offset();
	$(event.currentTarget).children(".mover").css({"top": Reveal_Offset.Y - Reveal_ParentOffset.top + "px", "left": Reveal_Offset.X - Reveal_ParentOffset.left + "px"});
}
function Reveal_Down()
{
	Reveal_ParentOffset = $(event.currentTarget).offset();
	$(event.currentTarget).children(".mover").css({"top": Reveal_Offset.Y - Reveal_ParentOffset.top + "px", "left": Reveal_Offset.X - Reveal_ParentOffset.left + "px"});
	$(event.currentTarget).children(".mover .active").css({ "transition": "none", "opacity": "", "transform": "scale(1)" });

	clearTimeout(RevealTimeout.down), clearTimeout(RevealTimeout.up);
	$(".reveal .mover .active").css({"transition": "", "opacity": "", "transform": ""});
	setTimeout(() =>
	{
		RevealTimeout.down = setTimeout(() =>
			$(".reveal .mover .active").css({"transition": "1.5s ease-in-out transform, 1.5s ease-out opacity", "opacity": "0"})
		, 400);
	}, 50)
}
function Reveal_Up()
{
	clearTimeout(RevealTimeout.down);
	$(".reveal .mover .active").css({"transition": "0.3s ease-in-out transform, 0.3s ease-in-out opacity", "transform": "scale(5)", "opacity": "0"});
	RevealTimeout.up = setTimeout(() =>
		$(".reveal .mover .active").css({"transform": "scale(1)", "transition": "none"})
	, 300);
}

$(window)
	.ready(function()
	{
		if (window["List_Source"] == null)
			return;

		if (window["Challenge_Data"] == null)
		{
			Challenge_Data = {};
			List_Prepare();
		}
		
		const font = new FontFace("SF Emoji", "url(//ui.agapedimas.repl.co/fonts/SFProDisplay/emoji.ttf)");
		document.fonts.add(font);
	})
	.on("resize", function() 
	{ 
		List_CheckArrow(); 

		let opened = {
			audio: $(".audio").hasClass("opened") == true,
			video: $(".video").hasClass("opened") == true
		}
		
		if (opened.audio)
			Audio_CheckSize();		
		else if (opened.video)
			Video_CheckSize();
	})
	.on("beforeunload", function()
	{
		$("#MainLoading").addClass("show");
	})
	.on("keydown", function(e)
	{
		let opened = {
			audio: $(".audio").hasClass("opened") == true,
			video: $(".video").hasClass("opened") == true
		}
		if (opened.audio || opened.video)
		{
			if (e.keyCode == 27)
			{
				if (opened.audio)
					Audio_Close();
				else if (opened.video)
					Video_Close();
			}
			else if (e.keyCode == 32)
			{
				if (opened.audio)
					$(".audio .controls .playpause").click();
				else if (opened.video)
					$(".video .controls .playpause").click();
				e.preventDefault();
			}
			else if (e.keyCode == 39)
			{
				var elem;
				if (opened.audio)
					elem = $(".audio audio")[0];
				else if (opened.video)
					elem = $(".video video")[0];
				elem.currentTime = elem.currentTime + 5;
				e.preventDefault();
			}
			else if (e.keyCode == 37)
			{
				var elem;
				if (opened.audio)
					elem = $(".audio audio")[0];
				else if (opened.video)
					elem = $(".video video")[0];
				elem.currentTime = elem.currentTime - 5;
				e.preventDefault();
			}
		}
	});