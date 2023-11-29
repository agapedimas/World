console.log("Getting ready: " + new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));

//    Core 
const Delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
const FileIO = require("fs");
const Variables = require("./variables");
const Functions = require("./functions");
const Template = require("./template");


//    Server
const Express = require("express");
const Server = Express();
const Session = require("express-session");
const BodyParser = require("body-parser");
const FileUpload = require("express-fileupload");
const BodyParserErrorHandler = require("express-body-parser-error-handler");


//    Configure
Template.Initialize();

Server.use(BodyParser.urlencoded({ limit: "50mb", extended: true }));
Server.use(BodyParser.json({ limit: "50mb" }));
Server.use(FileUpload());
Server.use(BodyParserErrorHandler());
Server.use(Session({
	secret: process.env.AD_API_KEY,
	saveUninitialized: false,
  cookie: { secure: true },
	resave: false 
}));
Server.set("trust proxy", true);
Server.use((req, res, next) => 
{
	if (req.session != null && req.session.device == null)
	{
		req.session.device = 
		{
			"user": null, 
			"admin": null
		};
	}
	const file = 
	{
		icons: /\.(?:ico)$/i,
		fonts: /\.(?:ttf|woff2)$/i,
		images:/\.(?:png|webp|jpg|jpeg|bmp)$/i
	}
	
	for (const [key, value] of Object.entries(file)) 
	{
		if (value.test(req.url) && req.query.cache != "false")
			res.header("Cache-Control", "public, max-age=3600");
	}
	
  next();
});

Functions.Server_SaveClientFile(Server);
Functions.Server_Map(Server);
Functions.Server_Start(Server);