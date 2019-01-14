var fs = require('fs');
var LineByLineReader = require('line-by-line');

var inputFile = "epa-http.txt";
var outputFile = "Template/access_log_EPA_Jul95_parsed.json";
var lr = new LineByLineReader(inputFile);

var outstream = fs.createWriteStream(outputFile);
outstream.readable = true;
outstream.writable = true;

outstream.write("window.epadata='[");

var match, host, date, date_array, request, request_method, request_url, request_protocol,
 request_protocol_version, protocol, protocol_array, response_code, document_size, data,separate;

// regex that matches the groups we want to parse
// '(\S+)' - a group to match one or more non-space characters of the host
// '\s' - a space character
// '\[' - an open square bracket
// '(\S+)' - a group to match any non-space characters of the datetime
// '\]' - closing the square bracket
// '\s' - a space character
// '\"' - a double quotes
// '(GET|POST|HEAD){0,1}' - a group to match zero or one of the HTTP methods
// '\s{0,1}' - zero or one space character
// '(.*?)' - a group to match any characters with non-greedy matching (the minimal number of matching characters) the url
// '\s{0,1}' - zero or one space character
// '(HTTP\/.*){0,1}' - a group to match zero or one HTTP protocol and version
// '\"' - a double quotes
// '\s' - a space character
// '([0-9]{3})' - a group to match 3 digits matching reponse response_code
// '\s' - a space character
// '(\S*)' - a group to match zero or more non-space character to match document size
const regex = /^(\S+)\s\[(\S+)\]\s\"(GET|POST|HEAD){0,1}\s{0,1}(.*?)\s{0,1}(HTTP\/.*){0,1}\"\s([0-9]{3})\s(\S*)/;


lr.on('error', function (err) {
    // 'err' contains error object
    console.log(err);
});

lr.on('line', function (line) {
    // 'line' contains the current line without the trailing newline character.

    // regex matching
    match = regex.exec(line);

    // host - first group.
    host = match[1];

    // date - second group.
    date = match[2];

    date_array = date.split(':');

    date = {
        "day":date_array[0],
        "hour":date_array[1],
        "minute":date_array[2],
        "second":date_array[3]
    };

    // request - third group.
    request_method = match[3];

    if(typeof request_method === "undefined")
    {
        request_method = "invalid";
    }

    // url - 4th group.
    request_url = match[4];

    request_url = encodeURI(request_url);

    // protocol - 5th group.
    protocol = match[5];

    if (typeof protocol === "undefined")
    {
        request_protocol = "none";
        request_protocol_version = "none";

    }
    else{
        protocol_array = protocol.split('/');
        request_protocol = protocol_array[0];
        request_protocol_version = protocol_array[1];
    }

    request = {
        "method":request_method,
        "url":request_url,
        "protocol":request_protocol,
        "protocol_version":request_protocol_version
    };

    // response code - 6th group.
    response_code = match[6];

    // document size - 7th group.
    document_size = match[7];

    if(document_size === '-') {
        document_size = 0;
    }

    // do some work here
    data = JSON.stringify(
        {
            "host" : host,
            "datetime":date,
            "request":request,
            "response_code":response_code,
            "document_size":document_size
        }
    );

    if (separate) {
        outstream.write(',' + data);
    }else{
        outstream.write(data);
        separate = 1;
    }

});

lr.on('end', function () {
    // All lines are read, file is closed now.
    outstream.write("]';");
});
