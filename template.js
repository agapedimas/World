const FileIO = require('fs');
const FileIO_Promises = require('fs/promises');
const Path = require('path');
const Path_Template = "./web/templates/";

async function Initialize()
{
	const components = FileIO.readdirSync(Path_Template);
	for (let component of components)
	{
		let name = Path.parse(component).name;
		let value = await FileIO_Promises.readFile(Path_Template + component, { encoding: "utf8" });
		
		Data[name] = value;
	}
}

const Data = 
{
	Configuration: "blurs='on' lang='id' theme='dark' accent='red'"
}

module.exports = 
{
	Data: Data,
	Initialize: Initialize
};