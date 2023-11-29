if (window["Editor_Ignore"] != null && Editor_Ignore == true)
	throw "This page doesn't need this fucking script.";

TitleBar_AddButton("Undo", "\ue7a7");
TitleBar_AddButton("Redo", "\ue7a6");
TitleBar_AddButton("Save", "\ue74e", Editor_SaveEdit);
TitleBar_AddButton("Refresh", "\ue72c", function()
{
	Editor_Prepare();
});

let Editor_Object = {};
let Editor_PendingValue = "";
let Editor_RefreshTimeout;

function Editor_Prepare()
{
	$("#MainLoading").addClass("show");
	$(".preview").html("");
	$(".editor textarea").val("");

	$.ajax({
		type: "POST",
		data: Challenge_Data,
		url: Editor_Source,
		success: function(data)
		{
			Editor_Object = data;
			Editor_StartEdit();
			$("#MainLoading").removeClass("show");
		},
		error: function(data)
		{
			if (data.status == 403)
				window.location.reload();

			if (window["Editor_ErrorAction"] != null)
				Editor_ErrorAction();
		}
	});
	ContextMenu.push({
		Id: "Context_Object",
		Commands: [
				{
					Title: "Add sub-object",
					Icon: "e710",
					Action: (element) => { Editor_AddObject(element, "object") }
				},
				{
					Title: "Move up",
					Icon: "e74a",
					Action: (element) => { Editor_MoveObject(element, "up") }
				},
				{
					Title: "Move down",
					Icon: "e74b",
					Action: (element) => { Editor_MoveObject(element, "down") }
				},
				"serparator",
				{
					Title: "Remove object",
					Icon: "e74d",
					Action: (element) => { Editor_RemoveObject(element) }
				}
			]
	});
	ContextMenu.push({
		Id: "Context_SubObject",
		Commands: [
				{
					Title: "Add array",
					Icon: "e710",
					Action: (element) => { Editor_AddObject(element, "array") }
				},
				{
					Title: "Move up",
					Icon: "e74a",
					Action: (element) => { Editor_MoveObject(element, "up") }
				},
				{
					Title: "Move down",
					Icon: "e74b",
					Action: (element) => { Editor_MoveObject(element, "down") }
				},
				"serparator",
				{
					Title: "Remove sub-object",
					Icon: "e74d",
					Action: (element) => { Editor_RemoveObject(element) }
				}
			]
	});
	ContextMenu.push({
		Id: "Context_Array",
		Commands: [
				{
					Title: "Add item",
					Icon: "e710",
					Action: (element) => { Editor_AddObject(element, "plain") }
				},
				{
					Title: "Move up",
					Icon: "e74a",
					Action: (element) => { Editor_MoveObject(element, "up") }
				},
				{
					Title: "Move down",
					Icon: "e74b",
					Action: (element) => { Editor_MoveObject(element, "down") }
				},
				"serparator",
				{
					Title: "Duplicate array",
					Icon: "e8c8",
					Action: (element) => { Editor_DuplicateObject(element, "array") }
				},
				{
					Title: "Remove array",
					Icon: "e74d",
					Action: (element) => { Editor_RemoveObject(element) }
				}
			]
	});
	ContextMenu.push({
		Id: "Context_Value",
		Commands: [
				{
					Title: "Move left",
					Icon: "e72b",
					Action: (element) => { Editor_MoveObject(element, "up") }
				},
				{
					Title: "Move right",
					Icon: "e72a",
					Action: (element) => { Editor_MoveObject(element, "down") }
				},
				"serparator",
				{
					Title: "Remove item",
					Icon: "e74d",
					Action: (element) => { Editor_RemoveObject(element) }
				}
			]
	});
}

function Editor_StartEdit()
{
	Editor_ReadObject(Editor_Object);
	Editor_RefreshPreview();
}
function Editor_RefreshPreview()
{
	$(".editor textarea").val(JSON.stringify(Editor_Object, null, '    '));
}
function Editor_SaveEdit()
{
	$("#MainLoading").addClass("show");
	$(".titlebar .buttons button, .preview textarea, .object .thumbnail").attr("disabled", "disabled");

	let Editor_SourceUploadPath = Editor_Source;
	if (Editor_SourceUploadPath.includes("?")) 
		Editor_SourceUploadPath = Editor_SourceUploadPath.substring(0, Editor_SourceUploadPath.indexOf("?"));

	$.ajax({
		type: "POST",
		data: 
		{ 
			data: JSON.stringify(Editor_Object, null, '\t') 
		},
		url: Editor_SourceUploadPath.replace("/sources/", "/sources/set/"),
		success: function(data)
		{
			Editor_RefreshPreview();
			$("#MainLoading").removeClass("show");
			$(".titlebar .buttons button, .preview textarea, .object .thumbnail").removeAttr("disabled");
		},
		error: function(data)
		{
			alert("Please login to continue saving your file");
			$("#MainLoading").removeClass("show");
			$(".titlebar .buttons button, .preview textarea, .object .thumbnail").removeAttr("disabled");
		}
	});
}
function Editor_UploadThumbnail(file)
{
	$("#MainLoading").addClass("show");
	$(".titlebar .buttons button, .preview textarea, .object .thumbnail").attr("disabled", "disabled");

	var fd = new FormData();
	fd.append("file", file);

	$.ajax(
		{
			type: "post",
			url: "/sources/setthumbnail?path=" + Thumbnail_Selected.path + "&name=" + Thumbnail_Selected.value,
			data: fd,
			contentType: false,
			processData: false,
			success: async function (status) 
			{
				$("#MainLoading").removeClass("show");
				$(".titlebar .buttons button, .preview textarea, .object .thumbnail").removeAttr("disabled");
				Thumbnail_Selected.element.src = "";
				await delay(500);
				URL_ToData(Thumbnail_Selected.path + Thumbnail_Selected.value + ".webp?cache=false", function(url)
				{
					Thumbnail_Selected.element.src = url;
				})
			},
			error: function (request, status, error) 
			{
				alert("Error");
				$("#MainLoading").removeClass("show");
				$(".titlebar .buttons button, .preview textarea, .object .thumbnail").removeAttr("disabled");
			}
		});
}

function isObject(target) 
{
	return typeof(target) == "object";
}
function Editor_ReadObject(object, tree)
{
	if (tree == null)
	{
		$(".preview").html("");
		tree = "Root";
	}
	for (let key in object)
	{
		if (object.hasOwnProperty(key) && isObject(object)) 
		{
			let value = object[key];
			let childType = "plain";
			if (value == null)
			{
				continue;
			}
			else if (Array.isArray(value))
			{
				value = null;
				childType = "array";
			}
			else if (value == "[object Object]")
			{
				value = null;
				childType= "object";
			}

			Editor_Append(key, value, tree + ">" + key, childType);
			Editor_ReadObject(object[key], tree + ">" + key);
		}
	}
}
let Thumbnail_Selected;
function Editor_Append(key, value, tree, childType)
{	
	let newTree = [];
	tree = tree.replace("Root>", "");
	tree = tree.split(">");
	tree.forEach(value => 
	{
		newTree.push("[key='" + value + "']>.value")
	});

	var elem;
	if (newTree.length == 1)
		elem = $(".preview");
	else
	{
		newTree.pop();
		elem = $(".preview " + newTree.join(" "));
	}

	let elem_object = document.createElement("div");
	let elem_key = document.createElement("div");
	let elem_value = document.createElement("div");
	let elem_name = document.createElement("div");
	let elem_action = document.createElement("div");
	let elem_collapse = document.createElement("div");
	let elem_input = document.createElement("textarea");
	let elem_rename = document.createElement("input");
	let elem_thumbnail = document.createElement("div");
	let elem_thumbnail_image = document.createElement("img");

	elem_object.setAttribute("key", key);
	elem_object.setAttribute("tree", tree.join(">"));
	elem_object.classList.add("object");

	elem_key.classList.add("key");
	elem_value.classList.add("value");
	elem_name.classList.add("name");
	elem_rename.classList.add("rename");
	elem_action.classList.add("action");
	elem_collapse.classList.add("collapse");
	elem_thumbnail.classList.add("thumbnail");

	elem_rename.setAttribute("type", "text");
	elem_rename.value = key;

	elem_name.innerHTML = key;
	elem_action.onclick = function(e)
	{
		if (childType == "plain")
			OpenContextMenu("Context_Value", $(elem_object), e);
		else if (childType == "array")
			OpenContextMenu("Context_SubObject", $(elem_object), e);
		else
		{
			if (newTree.length == 1)
				OpenContextMenu("Context_Object", $(elem_object), e);
			else
				OpenContextMenu("Context_Array", $(elem_object), e);
		}
	}
	elem_collapse.onclick = function(e)
	{
		let isOpened = $(this).parent(".key").parent(".object").attr("isExpanded") == "true";

		if (isOpened)
			$(this).parent(".key").parent(".object").attr("isExpanded", false);
		else
			$(this).parent(".key").parent(".object").attr("isExpanded", true);
	}


	elem_object.append(elem_key);
	elem_object.append(elem_value);
	elem.append(elem_object);

	if (value != null)
	{
		elem.parent(".object")[0].classList.add("child-plain-value");
		if ($(elem_rename).val() == "id")
		{
			if (elem.parent(".object").children(".thumbnail").length == 0)
			{
				let thumbnailSource = elem.parent(".object").attr("tree");
				thumbnailSource = thumbnailSource.split(">");
				let path =  Editor_Thumbnail + "/" + thumbnailSource[0] + "/";
				if ($(".maininternal").children("input[type=file]").length == 0)
				{
					$(".maininternal").append("<input type='file' id='Input_Thumbnail'/>");
					$("#Input_Thumbnail").attr("accept", "image/*")
					$("#Input_Thumbnail").on("input", function()
					{
						var files = this.files;
						if (files.length != 0) 
							Editor_UploadThumbnail(files[0]);
					})
				}

				elem.parent(".object").children(".key").append(elem_thumbnail);
				elem_thumbnail.append(elem_thumbnail_image);
				URL_ToData(path + value + ".webp?cache=false", function(url)
				{
					elem_thumbnail_image.setAttribute("src", url);
				})

				elem_thumbnail.onclick = function()
				{
					Thumbnail_Selected = {
						element: elem_thumbnail_image,
						path: path,
						value: value
					};
					$("#Input_Thumbnail").click();
				}
			}
		}
		elem_object.classList.add("plain-value");
		elem_input.innerHTML = value;
		elem_value.append(elem_input);
	}

	if (childType != "object" || newTree.length == 1) //biar elemen renamenya ga muncul di array
	{
		if (childType != "plain")
			elem_key.append(elem_collapse);

		elem_key.prepend(elem_rename);
		$(elem_rename).on("blur", function(e)
		{
			Editor_RenameObject($(elem_object), $(elem_rename).val());
		})
	}
	else
	{
		elem_key.prepend(elem_name);
	}
	elem_key.append(elem_action);

	$(elem_input).css("--height", elem_input.scrollHeight + "px");

	$(elem_input).on("input", function(e) 
	{
		//in case the parent key has changed
		let elem = $(elem_input).parent(".value").children("textarea")[0];
		$(elem).css("--height", "5px");
		$(elem).css("--height", elem.scrollHeight + "px");

		let inputTree = [];
		let tree = $(elem).parent(".value").parent(".object").attr("tree").split(">");
		tree.forEach(value => 
		{
			inputTree.push("['" + value + "']")
		});

		Editor_PendingValue = $(this).val()//.replace(/[\n\r]/g, '\n');
		Function("Editor_Object" + inputTree.join("") + " = Editor_PendingValue")();
		Editor_RefreshPreview();
	})
}

function Editor_MoveObject(elem, direction)
{
	if (direction == "up")
		$(elem).prev().insertAfter($(elem));
	else
		$(elem).next().insertBefore($(elem));

	Editor_RefreshPreview();
}
function Editor_RenameObject(elem, name)
{
	$(elem).attr("key", name).children(".key").children(".name").html(name);
	{
		//ALSO UPDATE TO Editor_Object
		let tree = $(elem).attr("tree");
		let newTree = [];
		tree.split(">").forEach(value => 
		{
			newTree.push("['" + value + "']")
		});
		let oldTree = JSON.parse(JSON.stringify(newTree));
		newTree.pop();
		newTree.push("['" + name + "']");

		if (oldTree.join("") == newTree.join(""))
			return;

		Function("Editor_Object" + newTree.join("") + " = Editor_Object" + oldTree.join(""))();
		Function("delete Editor_Object" + oldTree.join("") + "")();

		$(elem).attr("tree", newTree.join(">").replaceAll("['", "").replaceAll("']", ""));
		$(elem).find(".object").each(function()
		{
			$(this).attr("tree", $(this).attr("tree").replace(oldTree.join(">").replaceAll("['", "").replaceAll("']", ""), newTree.join(">").replaceAll("['", "").replaceAll("']", "")));
		})
	}
	Editor_RefreshPreview();
}
function Editor_RemoveObject(elem)
{
	let tree = $(elem).attr("tree");
	$(elem).remove();
	{
		//ALSO UPDATE TO Editor_Object
		let newTree = [];
		tree.split(">").forEach(value => 
		{
			newTree.push("['" + value + "']")
		});

		Function("delete Editor_Object" + newTree.join(""))();
	}

	Editor_RefreshPreview();
}

function Editor_DuplicateObject(elem, type)
{
	Editor_AddObject($(elem).parent(".value"), "array");
	Editor_RefreshPreview();
}
function Editor_AddObject(elem, type)
{
	let index = $(elem).children(".value").children(".object").children(".value").length;
	let key = (type == "array") ? index : "new-" + type + "-" + index;
	let tree = $(elem).attr("tree") + ">" + key;

	{
		//ALSO UPDATE TO Editor_Object
		let newTree = [];
		tree.split(">").forEach(value => 
		{
			newTree.push("['" + value + "']")
		});

		let object_symbol;
		if (type == "object")
			object_symbol = "[]";
		else if (type == "array")
			object_symbol = "{}";
		else
			object_symbol = "''";

		Function("Editor_Object" + newTree.join("") + " = " + object_symbol)();
	}

	if (type == "plain")
		Editor_Append(key, "", tree, "plain");
	else if (type == "array")
	{
		Editor_Append(key, null, tree, "object");
		let newTree = [];
		tree.split(">").forEach(value =>  { newTree.push("[key='" + value + "']") });
		Editor_AddObject($(".preview " + newTree.join(" ")).attr("tree", tree), "plain");
	}
	else
		Editor_Append(key, null, tree, "array");

	Editor_RefreshPreview();
}

$(".editor textarea").on("input", function()
{
	let value = this.value;
	$("#MainLoading").addClass("show");
	clearTimeout(Editor_RefreshTimeout);
	Editor_RefreshTimeout = setTimeout(function()
	{
		try
		{
			Editor_Object = JSON.parse(value);
			Editor_StartEdit();
			clearNotification("syntax");
		}
		catch (err)
		{
			sendNotification("Syntax error", err, "error", "syntax");
		}
		$("#MainLoading").removeClass("show");
	}, 1000)
})
$(window)
	.ready(function()
	{	
		if (window["Challenge_Data"] == null)
		{
			Challenge_Data = {};
			Editor_Prepare();
		}
	})
	.on("pagehide", function()
	{
		$("textarea").val("");
	})
	.on("offline", function(){
		sendNotification("Kamu offline", "Offline dek?", "error", "offline");
	})
	.on("online", function(){
		clearNotification("offline");
	})
	.on("keydown", function(e)
	{
		if (e.keyCode == 83 && e.ctrlKey) 
		{
			Editor_SaveEdit();
			e.preventDefault();
		}
		else if (e.keyCode == 116) 
		{
			if (e.ctrlKey)
				window.location.reload()
			else
				Editor_Prepare();
			e.preventDefault();
		}
	})