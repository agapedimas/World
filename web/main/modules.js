function URL_ToData(url, callback)
{
	let result = fetch(url)
		.then(response => response.blob())
		.then(blob => 
		{
			var fileReader = new FileReader();
			fileReader.onload = (e) => callback(e.target.result);
			fileReader.readAsDataURL(blob);
		})
}
async function URL_ToBlob(url)
{
	let blob = await fetch(url).then(r => r.blob());
	return URL.createObjectURL(blob);
}

const Days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const Months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
function Format_ZeroDigit(digit)
{
	if (digit < 10)
		return "0" + digit;
	else
		return digit.toString();
}
function Format_Date(timestamp, type /* date, shortdate, time, datetime */)
{
	type = (type == null) ? "datetime" : type;
	let date = new Date(parseInt(timestamp));

	switch(type) 
	{
		case "date":
			return Days[date.getDay()].substring(0, 3) + ", " + date.getDate() + " " + Months[date.getMonth()] + " " + date.getFullYear();
			break;
		case "shortdate":
			return date.getDate() + " " + Months[date.getMonth()].substring(0, 3) + " " + date.getFullYear();
			break;
		case "shortdate-elem":
			return "<span class='day'>" + date.getDate() + "</span> <span class='month'>" + Months[date.getMonth()].substring(0, 3) + "</span> <span class='year'>" + date.getFullYear() + "</span>";
			break;
		case "time":
			return Format_ZeroDigit(date.getHours()) + ":" + Format_ZeroDigit(date.getMinutes());
			break;
		default:
			return Format_Date(timestamp, "time") + " " + Format_Date(timestamp, "date") 
	}
}
function Format_Duration(duration)
{
	let seconds = Math.floor(duration % 60);
	let minutes = Math.floor(duration / 60 % 60);
	let hours = Math.floor(duration / 60 / 60 % 60);

	if (duration >= 3600)
		return hours + ":" + Format_ZeroDigit(minutes) + ":" + Format_ZeroDigit(seconds);
	else
		return minutes + ":" + Format_ZeroDigit(seconds);
}
function Format_StringDurationToInt(duration)
{
	duration = duration.split(":");
	let length = duration.length;
	let timestamp = 0;
	for (let i = 0; i < length; i++)
	{
		let multiple = Math.pow(60, length - 1 - i);
		if (duration[i].includes(","))
		{
			let times = duration[i].split("."); 
			duration[i] = times[0];
			timestamp += (parseInt(times[0]) * multiple) + (parseFloat(times[1] / 1000));
		} 
		else
		{
			timestamp += parseInt(duration[i]) * multiple;
		}
	}

	return timestamp;
}
function Format_StringDurationToFloat(duration)
{
	duration = duration.split(":");
	let length = duration.length;
	let timestamp = 0;
	for (let i = 0; i < length; i++)
	{
		let multiple = Math.pow(60, length - 1 - i);
		if (duration[i].includes(","))
		{
			let times = duration[i].split("."); 
			duration[i] = times[0];
			timestamp += (parseFloat(times[0]) * multiple) + (parseFloat(times[1] / 1000));
		} 
		else
		{
			timestamp += parseFloat(duration[i]) * multiple;
		}
	}

	return timestamp;
}