//harusnya fasilitas buat video sama audio

function Media_Prepare(type)
{
	if (type == "audio")
	{
		$(".main").append(
			'<div class="audio" theme="dark" blurs="on"">' +
				'<div class="background">' +
					'<img/>' +
				'</div>' +
				'<div class="frame">' +
					'<div class="toolbar">' +
						'<div class="close" ad-tooltip="Tutup">&#xf78a;</div>' +
						'<div class="open" ad-tooltip="Buka di aplikasi lain">&#xe8a7;</div>' +
						'<div class="fullscreen" ad-tooltip="Layar penuh"></div>' +
					'</div>' +
					'<div class="controls">' +
						'<img class="thumbnail" width="425" height="425"/>' +
						'<div class="metadata">' +
							'<div class="name"></div>' +
							'<div class="desc"></div>' +
						'</div>' +
						'<div class="progressbar"></div>' +
						'<div class="seekbar">' +
							'<input type="range" step="0.00001"/>' +	
						'</div>' +
						'<div class="buttons">' +
							'<div class="playpause" ad-tooltip="Mulai/Jeda"></div>' +
						'</div>' +
					'</div>' +
					'<div class="lyrics">' +
						'<div class="container"></div>' +
					'</div>' +
					'<audio autoplay></audio>' +
				'</div>' +
			'</div>'
		);
		$(".audio").append("<script src='https://ui.agapedimas.repl.co/style.js' id='style_js'></script>");
		$(".audio .controls .playpause").on("click", (e) => 
		{
			if ($(".audio audio")[0].paused) 
				$(".audio audio")[0].play();
			else
				$(".audio audio")[0].pause();
		});
		$(".audio .fullscreen").on("click", (e) => 
		{
			if (Fullscreen_Active()) 
				Fullscreen_Exit();
			else
				Fullscreen_Enter(null, $(".audio")[0]);
		});

		let Seek_IsSeeking = false;
		const Seek_Update = () =>
		{
			let duration =
			{
				now: $(".audio audio")[0].currentTime,
				total: $(".audio audio")[0].duration
			}
			let position = duration.now / duration.total * 100;
			if (Seek_IsSeeking)
			{
				$(".audio .seekbar input").attr("max", duration.total).css("--value", ($(".audio .seekbar input").val() / duration.total) * 100 + "%");
				$(".audio .seekbar").attr({"duration": Format_Duration($(".audio .seekbar input").val()), "total": Format_Duration(duration.total)});
			}
			else
			{
				$(".audio .seekbar input").attr("max", duration.total).val(duration.now).css("--value", position + "%");
				$(".audio .seekbar").attr({"duration": Format_Duration($(".audio .seekbar input").val()), "total": Format_Duration(duration.total)});
			}
			if ($(".audio").hasClass("has-lyrics"))
				Captions_Play("audio", $(".audio .seekbar input").val());
		}
		$(".audio .seekbar input")
			.on("mousedown", function()
			{
				Seek_IsSeeking = true;
			})
			.on("mousemove", function()
			{
				if (!Seek_IsSeeking)
					return;

				Seek_Update();
			})
			.on("mouseup", function()
			{
				Seek_IsSeeking = false;
				$(".audio audio")[0].currentTime = $(this).val();
				$(".audio audio")[0].play();
			})
			.on("touchstart", function(e)
			{
				e.stopPropagation();
				Seek_IsSeeking = true;
			})
			.on("touchmove", function(e)
			{
				if (!Seek_IsSeeking)
					return;

				Seek_Update();
			})
			.on("touchend", function(e)
			{
				e.stopPropagation();
				Seek_IsSeeking = false;
				$(".audio audio")[0].currentTime = $(this).val();
				$(".audio audio")[0].play();
			})
		$(".audio audio")
			.on("canplay", function() 
			{ 
				Seek_Update();
				$(".audio").removeClass("loading");
			})
			.on("waiting", function()
			{ 
				$(".audio").addClass("loading");
				clearInterval(Seek_Interval);
			})
			.on("playing", function() 
			{ 
				$(".audio").removeClass("loading");
				$(".audio .controls .playpause").addClass("pause");
				clearInterval(Seek_Interval);
				Seek_Interval = setInterval(() => Seek_Update(), 1);
			})
			.on("error", function()
			{
				$(".audio").removeClass("loading");
				$(".audio .controls .playpause").removeClass("pause");
				clearInterval(Seek_Interval);
			})
			.on("pause", function() 
			{
				$(".audio .controls .playpause").removeClass("pause");
				clearInterval(Seek_Interval);
			})
			.on("play", function() 
			{ 
				$(".audio").removeClass("loading");
				$(".audio .controls .playpause").addClass("pause");
				clearInterval(Seek_Interval);
				Seek_Interval = setInterval(() => Seek_Update(), 1);
			});
		$(".audio .close").click(Audio_Close);	
		$(".audio .open").click(function()
		{
			if ($(this).attr("goto") != null)
				window.open($(this).attr("goto"));
		});	

		$(window).on("resize", function()
		{
			if (Fullscreen_Active())
			{
				$(".audio").addClass("fullscreen");
				$(".audio .fullscreen").addClass("fulled");
			}
			else
			{
				$(".titlebar").removeClass("expanded");
				$(".audio").removeClass("fullscreen");
				$(".audio .fullscreen").removeClass("fulled");
			}
		})
	}
	else if (type == "video")
	{
		$(".main").append(
			'<div class="video" theme="dark">' +
				'<div class="background"></div>' +
				'<div class="frame">' +
					'<div class="controls">' +
						'<div class="metadata">' +
							'<div class="name"></div>' +
						'</div>' +
						'<div class="seekbar">' +
							'<input type="range" step="0.00001"/>' +	
						'</div>' +
						'<div class="buttons">' +
							'<div class="playpause" ad-tooltip="Mulai/Jeda"></div>' +
						'</div>' +
						'<div class="toolbar">' +
							'<div class="close" ad-tooltip="Tutup">&#xf78a;</div>' +
							'<div class="fullscreen" ad-tooltip="Layar penuh"></div>' +				
						'</div>' +
					'</div>' +
					'<video autoplay></video>' +
					'<div class="progressring"></div>' +
				'</div>' +
			'</div>'
		);
		$(".video").append("<script src='https://ui.agapedimas.repl.co/style.js' id='style_js'></script>");
		$(".video .controls .playpause").on("mousedown touchstart", (e) => 
		{
			e.stopPropagation();
		})
		.on("click", (e) => 
		{
			if ($(".video video")[0].paused) 
				$(".video video")[0].play();
			else
				$(".video video")[0].pause();
		});
		$(".video .controls .fullscreen").on("mousedown touchstart", (e) => 
		{
			e.stopPropagation();
		})
		.on("click", (e) => 
		{
			if (Fullscreen_Active()) 
				Fullscreen_Exit()
			else
				Fullscreen_Enter(($(".video video")[0].videoHeight > $(".video video")[0].videoWidth ? "portrait" : "landscape"), $(".video")[0])
		});

		let Seek_IsSeeking = false;
		const Seek_Update = () =>
		{
			let duration =
			{
				now: $(".video video")[0].currentTime,
				total: $(".video video")[0].duration
			}
			let position = duration.now / duration.total * 100 + 0.1;
			if (Seek_IsSeeking)
			{
				$(".video .seekbar input").attr("max", duration.total).css("--value", ($(".video .seekbar input").val() / duration.total) * 100 + "%");
				$(".video .seekbar").attr({"duration": Format_Duration($(".video .seekbar input").val()), "total": Format_Duration(duration.total)});
			}
			else
			{
				$(".video .seekbar input").attr("max", duration.total).val(duration.now).css("--value", position + "%");
				$(".video .seekbar").attr({"duration": Format_Duration($(".video .seekbar input").val()), "total": Format_Duration(duration.total)});
			}
		}
		$(".video .seekbar input")
			.on("mousedown", function(e)
			{
				Seek_IsSeeking = true;
				e.stopPropagation();
			})
			.on("mousemove", function(e)
			{
				if (!Seek_IsSeeking)
					return;

				Seek_Update();
			})
			.on("mouseup", function(e)
			{
				Seek_IsSeeking = false;
				$(".video video")[0].currentTime = $(this).val();
				$(".video video")[0].play();
			})
			.on("touchstart", function(e)
			{
				Seek_IsSeeking = true;
				e.stopPropagation();
			})
			.on("touchmove", function(e)
			{
				if (!Seek_IsSeeking)
					return;

				Seek_Update();
			})
			.on("touchend", function(e)
			{
				Seek_IsSeeking = false;
				$(".video video")[0].currentTime = $(this).val();
				$(".video video")[0].play();
			})
		$(".video video")
			.on("canplay", function() 
			{ 
				Metadata_AllowHide = true;
				Seek_Update();
				$(".video").removeClass("loading");
			})
			.on("waiting", function()
			{ 
				$(".video").addClass("buffering");
				clearInterval(Seek_Interval);
			})
			.on("playing", function() 
			{ 
				Metadata_AllowHide = true;
				$(".video").removeClass("loading buffering");
				$(".video .controls .playpause").addClass("pause");
				clearInterval(Seek_Interval);
				Seek_Interval = setInterval(() => Seek_Update(), 1);
				Metadata_Hide();
			})
			.on("error", function()
			{
				$(".video").removeClass("loading");
				Metadata_AllowHide = false;
				$(".video .controls .playpause").removeClass("pause");
				clearInterval(Seek_Interval);
				Metadata_Show();
			})
			.on("pause", function() 
			{ 
				$(".video .controls .playpause").removeClass("pause");
				clearInterval(Seek_Interval);
				Metadata_Show();
			})
			.on("play", function() 
			{ 
				Metadata_AllowHide = true;
				$(".video").removeClass("loading buffering");
				$(".video .controls .playpause").addClass("pause");
				clearInterval(Seek_Interval);
				Seek_Interval = setInterval(() => Seek_Update(), 1);
				Metadata_Hide();
			})
			.on("ended", function() 
			{ 
				$(".video .controls .playpause").removeClass("pause");
				$(this)[0].currentTime = 0;
				clearInterval(Seek_Interval);
				Seek_Update();
				Metadata_Show();
				Metadata_AllowHide = false;
			});
		$(".video .close").on("mousedown touchstart", (e) => 
		{
			e.stopPropagation();
		})
		.click(Video_Close);	

		window["Metadata_AllowHide"] = true;
		window["Metadata_Timeout"] = null;
		window["Metadata_Show"] = () => 
		{
			clearTimeout(Metadata_Timeout);
			$(".video").removeClass("hide-metadata");
			Metadata_Hide();
		}
		window["Metadata_Hide"] = (force) => 
		{
			clearTimeout(Metadata_Timeout);
			if (!Metadata_AllowHide)
				return;

			Metadata_Timeout = setTimeout(function(){
				$(".video").addClass("hide-metadata");
			}, force ? 0 : 3000);
		}

		$(".video")
			.on("mousemove", Metadata_Show)
			.on("mousedown", function()
			{
				if ($(".video").hasClass("hide-metadata"))
					Metadata_Show();
				else
					Metadata_Hide(true);
			})
			.on("touchstart", function(e)
			{
				if ($(".video").hasClass("hide-metadata"))
					Metadata_Show();
				else
					Metadata_Hide(true);

				e.preventDefault();
			});

		$(window).on("resize", function()
		{
			if (Fullscreen_Active())
			{
				$(".video").addClass("fullscreen");
				$(".video .controls .fullscreen").addClass("fulled");
			}
			else
			{
				$(".titlebar").removeClass("expanded");
				$(".video").removeClass("fullscreen");
				$(".video .controls .fullscreen").removeClass("fulled");
			}
		})
	}
}


function Captions_Play(type, duration, force = false)
{
	if (type == "audio")
	{
		let lyrics = [];
		for (let lyric of $(".audio .lyrics .container div"))
		{
			lyrics.push(lyric);
		}
		for (let lyric of lyrics.reverse())
		{
			//converting string duration to integer 
			let timestamp = Format_StringDurationToFloat($(lyric).attr("time"));
			//now match the lyrics with the duration whether on their position or not

			if (duration >= timestamp)
			{
				if ($(lyric).hasClass("active") && force == false)
					return;

				$(".audio .lyrics").css("--scroll", $(lyric).position().top);
				$(".audio .lyrics .container div").removeClass("active");
				$(lyric).attr("class", "active");
				return;
			}
		}

		//condition where the system couldn't find the matched lyric
		$(".audio .lyrics").css("--scroll", 0);
		$(".audio .lyrics .container div").removeClass("active");
	}
}