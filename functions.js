//    Core 
const Delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
const FileIO = require("fs");
const FileIO_Promises = require('fs/promises');
const Variables = require("./variables");
const Template = require("./template");
const Convert_WEBP = require("webp-converter");
const Client = require("@replit/database");
const Database = new Client();

Convert_WEBP.grant_permission();


let Challenge_History = [];
let Challenge_Random_History = [];
let Authentication_Allowed = [];
let Authentication_Admin_Allowed = [];

//    Functions
const Functions =
{
	Server_SaveClientFile: function(Server)
	{
		Server.post("/sources/set/*", (req, res) =>
		{
			if (Authentication_Admin_Allowed.includes(req.session.device.admin))
			{
				FileIO.writeFile(Variables.WebRoot + "/main" + req.url.replace("/sources/set/", "/sources/"), req.body.data, err => 
				{
				  if (err) 
					{
						res.status(500).send("FAIL: " + err);
						return;
				  }
					res.send("OK");
				});
			}
			else
			{
				res.status(403).send("FAIL: FORBIDDEN");
			}
		});
		
		Server.post("/sources/setthumbnail", async (req, res) =>
		{
			if (Authentication_Admin_Allowed.includes(req.session.device.admin))
			{
				if (req.files != null)
				{
					FileIO.mkdir("./web/main" + req.query.path, { recursive: true }, err => 
					{
	  				if (err) 
						{
							res.status(500).send("FAIL: " + err);
							return;
						}
					});
					await FileIO.createWriteStream("./web/main" + req.query.path + req.query.name + ".webp").write(req.files.file.data, function()
					{
						Convert_WEBP.cwebp("./web/main" + req.query.path + req.query.name + ".webp", "./web/main" + req.query.path + req.query.name + ".webp");
					});
					res.send("OK");
				}
			}
			else
			{
				res.status(403).send("FAIL: FORBIDDEN");
			}
		});
		
		Server.post("/messages/send", async (req, res) =>
		{
			let messagesPath = "./web/sources/messages.json";
			let messages = await FileIO_Promises.readFile(messagesPath, { encoding: 'utf8' });
			if (messages.trim() == "")
				messages = "[]";
			
			messages = JSON.parse(messages);
			messages.push({
				time: req.body.time,
				message: req.body.message,
				isPublic: req.body.isPublic,
				client: req.body.client
			});
			
    	await FileIO_Promises.writeFile(messagesPath, JSON.stringify(messages, null, "\t"));
			res.send("OK");
		});
		
		Server.post("/messages/reply", async (req, res) =>
		{
			if (Authentication_Admin_Allowed.includes(req.session.device.admin))
			{
				let messagesPath = "./web/sources/messages.json";
				let messages = await FileIO_Promises.readFile(messagesPath, { encoding: 'utf8' });
				if (messages.trim() == "")
					messages = "[]";
				
				messages = JSON.parse(messages);
				for (let message of messages)
				{
					if (message.time == req.body.time)
					{
						if (req.body.reply == null || req.body.reply.trim() == "")
							message.reply = null;
						else
							message.reply = req.body.reply;
						
						break;
					}
				}
				
				await FileIO_Promises.writeFile(messagesPath, JSON.stringify(messages, null, "\t"));
				res.send("OK");
			}
			else
			{
				res.status(403).send("FAIL: FORBIDDEN");
			}
		});
		
		Server.post("/messages/get", async (req, res) =>
		{
			let messagesPath = "./web/sources/messages.json";
			let messages = await FileIO_Promises.readFile(messagesPath, { encoding: 'utf8' });
			if (messages.trim() == "")
			{
				res.send("[]");
				return;
			}
			messages = JSON.parse(messages);			
			
			if (req.query.admin == "true")
			{
				if (Authentication_Admin_Allowed.includes(req.session.device.admin))
				{
					res.send(messages);
				}
				else
				{
					res.status(403).send("FAIL: Forbidden");
				}
			}
			else
			{
				let messages_willbesent = [];
				for (let message of messages)
				{
					if (message.isPublic == "true")
						messages_willbesent.push({
							message: message.message,
							time: message.time,
							reply: message.reply
						});
				}
				res.send(messages_willbesent);
			}
		});
	},
	Server_Map: function(Server) 
	{
		const validatePath = function(path)
		{
			if (path.endsWith("/"))
				path += "index";

			let path_extension = path.split(".");
			if (path_extension.length == 1 || ( path_extension[0] == "" && path_extension.length == 2 )) 
			{
				path += ".html";
			}
			
			return path;
		}
		const fileEndsWith = (path, ends) => 
		{
			let value = false;
			value = ends.some(element => 
			{
				return path.endsWith(element);
			});
			return value;
		};

		Server.get("/admin/logout", (req, res) => 
		{
			if (req.session.device != null)
				req.session.device.admin = {};
			res.redirect("/admin/login");
		})
		Server.get("*", (req, res) => 
		{
			let path = req.url;
			let source = Variables.WebRoot + "/main" + decodeURIComponent(path);

			if (source.includes("?"))
				source = source.substring(0, source.indexOf("?"));
			
			const condition =
			{
				isLandingPage: (FileIO.existsSync(source) && !FileIO.lstatSync(source).isFile()) || !FileIO.existsSync(source),
				isPostOnly: source.includes("[p]"),
				isLocked: source.includes("[l]"),
				isHTML: source.endsWith(".html"),
				isImage: fileEndsWith(source, [".jpg", ".jpeg", ".png", ".bmp", ".webp"]) == true,
				/////////
				isAdmin: source.includes("/admin"),
				isGames: source.includes("/games/")
			}
			
			if (condition.isLandingPage)
			{
				if (source.endsWith("/"))
					source = source.substring(0, source.length - 1);

				const availability =
				{
					list:
					[
						{
							condition: FileIO.existsSync(source.replace(".html", "") + "/index.html"),
							replacement: source.replace(".html", "") + "/index.html"
						},
						{
							condition: FileIO.existsSync(source + "/index.html"),
							replacement: source + "/index.html"
						},
						{
							condition: FileIO.existsSync(source + ".html"),
							replacement: source + ".html"
						}
					],
					isAvailable: false	
				}

				for (statement of availability.list)
				{
					if (statement.condition == true)	
					{
						source = statement.replacement;
						availability.isAvailable = true;
						break;
					}
				}
				
				if (!availability.isAvailable) 
				{
					if (condition.isImage)
						res.status(404).sendFile(Variables.WebRoot + "/blank.png", { root: "./" });
					else
						res.status(404).sendFile(Variables.WebRoot + "/main/404.html", { root: "./" });
					
					return;
				}
				else if (condition.isAdmin)
				{
					if (!Authentication_Admin_Allowed.includes(req.session.device.admin))
					//just send the file if the locked files are allowed on authenticated admin
					{
						if (!source.endsWith("/admin/login.html"))
						{
							req.session.redirect = req.url;
							res.redirect("/admin/login");
							return;
						}
					}
					else
					{
						//if user visits login page, redirect to attempted page or profile page.
						if (source.endsWith("login.html"))
						{
							if (req.session.redirect != null)
								res.redirect(req.session.redirect);
							else
								res.redirect("profile");
							return;
						}
					}
				}
			}
			
			if (condition.isPostOnly || condition.isLocked)
			{
				res.status(403).send("Forbidden");
				return;
			}
			else if (source.endsWith(".html")) 
			{
				FileIO.readFile(source, (err, data) => 
				{
					if (err) 
					{
						res.status(500).send("FAIL: " + err);
						return;
					}
					let templatedData =
						"<html " + Template.Data.Configuration + ">" +
						"<head>" +
						(condition.isAdmin ? Template.Data.Head_Admin : (condition.isGames ? Template.Data.Head_Games : Template.Data.Head)) +
						"</head>" +
						"<body>" +
						(condition.isAdmin ? Template.Data.Body_Admin : (condition.isGames ? Template.Data.Body_Games : Template.Data.Body)) +
						Template.Data.Script +
						"</body>" +
						"</html>";
					
					templatedData = 
						templatedData
							.replaceAll("<#? apptitle ?#>", Variables.AppTitle)
							.replaceAll("<#? appicon ?#>", Variables.AppIcon)
							.replaceAll("<#? apphomepage ?#>", Variables.WebHomepage)
							.replace("<#? content ?#>", data)
							.replace("<#? navigation ?#>", (condition.isAdmin ? Template.Data.Navigation_Admin : Template.Data.Navigation))
					
					res.send(templatedData);
				});
			}
			else
			{
				res.sendFile(source, { root: "./" });
			}
		})

		
		Server.post("/admin/login", (req, res) =>
		{
			const account = JSON.parse(process.env.ADMIN_ACCOUNT);
			if (req.body.username == account.username && req.body.password == account.password)	
			{
				req.session.device.admin = Date.now().toString();
				Authentication_Admin_Allowed.push(req.session.device.admin);
				res.send("OK");
			}
			else
			{
				res.send("FAIL: Incorrect username/password");
			}
		});
		Server.post("/journal/ask", (req, res) =>
		{
			if (Authentication_Allowed.includes(req.session.device.user) || Authentication_Admin_Allowed.includes(req.session.device.admin))
			{
				res.send("OK: ALLOWED");
				return;
			}
			
			let passwords = JSON.parse(process.env.JOURNAL_PASSWORD);

			let index;
			let Get_Question_Index = () =>
			{
				index = Math.random().toFixed(1) * (passwords.length - 1);
				index = Math.round(index);
				if (Challenge_Random_History.includes(index))
				{
					Get_Question_Index();
				}
				else
				{
					Challenge_Random_History.push(index);
					let question = passwords[index];
					let device = Date.now().toString();
					Challenge_History.push({
						"device": device,
						"id": question.id
					})
					res.send("OK: " + JSON.stringify(
						{
							"device": device,
							"question": question.question
						}
					));	
					
					if (Challenge_Random_History.length == passwords.length)
						Challenge_Random_History = [index];
				}
			}

			Get_Question_Index();
		});
		
		Server.post("*", (req, res) => 
		{
			let path = req.url;
			if (path.includes("?")) 
				path = path.substring(0, path.indexOf("?"));
			let source = Variables.WebRoot + "/main" + decodeURIComponent(path);
			
			const condition =
			{
				isLandingPage: (FileIO.existsSync(source) && !FileIO.lstatSync(source).isFile()) || !FileIO.existsSync(source),
				isPostOnly: source.includes("[p]"),
				isLocked: source.includes("[l]"),
				isHTML: source.endsWith(".html"),
				isImage: fileEndsWith(source, [".jpg", ".jpeg", ".png", ".bmp", ".webp"]) == true,
				/////////
				isAdmin: source.includes("/admin"),
				isGames: source.includes("/games/")
			}
			
			if (FileIO.existsSync(source))
			{
				if (condition.isLocked && !(Authentication_Admin_Allowed.includes(req.session.device.admin) || Authentication_Allowed.includes(req.session.device.user)))
				//just send the file if the locked files are allowed on authenticated user
				{
					let id;
					let question;
					//get device history first
					for (let device of Challenge_History)
					{
						if (req.body.device == device.device)
						{
							id = device.id;
							break;
						}
					}
					if (id == null)
					{
						res.status(403).send("FAIL: Unknown credentials");
						return
					}
					
					//then look up for the passwords
					let passwords = JSON.parse(process.env.JOURNAL_PASSWORD);
					for (let password of passwords)
					{
						if (password.id == id)
						{
							question = password;
							break
						}
					}
					
					if (question == null)
					{
						res.status(403).send("FAIL: Unknown challenge");
						return;
					}

					if (question.answer.trim().toLowerCase().replace(/[^a-z0-9]/gi, '') == req.body.password.trim().toLowerCase().replace(/[^a-z0-9]/gi, ''))
					{
						req.session.device.user = req.body.device;
						Authentication_Allowed.push(req.body.device);
						res.sendFile(source, { root: "./" });
					}
					else
					{
						res.status(403).send("FAIL: Wrong answer")
					}
				}
				else
				{
					res.sendFile(source, { root: "./" });
				}
			}
			else
				res.status(404).send("Unavailable");
		})
	},

	Server_Start: function(Server) {
		Server.listen(3000, () => console.log("Server is ready"));
	},

	Array_Remove: function(Array) {
		var what, a = arguments, L = a.length, ax;
		while (L && Array.length) { what = a[--L]; while ((ax = Array.indexOf(what)) !== -1) { Array.splice(ax, 1); } }
		return Array;
	}
}

module.exports = Functions;