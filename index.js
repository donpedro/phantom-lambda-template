var pdf = require('html-pdf');
var AWS = require('aws-sdk');
// var fs = require('fs'); // for debug file writes below

process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

var options = { format:'Letter',
    "border": {
        "top": ".4in",            // default is 0, units: mm, cm, in, px
        "right": ".25in",
        "bottom": ".25in",
        "left": ".25in"
    },
    "orientation": "portrait"
};
//var S3config = { bucketName: 'your-bucket' }; //Change to your bucket name

exports.handler = function(event, context, callback) {
  //Get the values from the request
  console.log("event: " + JSON.stringify(event));
  
  const body = event.body;
  var htmlString = body.htmlString;
  Object.assign(options, body.options); // merging an options object that was (possibly) passed in with our default options object

  //console.log("htmlString: " + htmlString);
  //fs.writeFile('test.htm', htmlString);
  var fileName = event.fileName;

  //Create the PDF file from the HTML string
  pdf.create(htmlString, options).toBuffer(function(err, buffer){
      if (err){
        console.log("There was an error generating the PDF file");
        console.log(err);
        var error = new Error("There was an error generating the PDF file");
        callback(error);
      }
      else {
        // console.log(buffer);
        // fs.writeFile('test.pdf', buffer);
        callback(null, {
            statusCode: 200,
            headers: {
              // TODO: limit to a whitelist of allowed sites
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true, // Required for cookies, authorization headers with HTTPS 
              "Content-Type" : "application/pdf"
            },
            //body: buffer.toString('base64') // <-- now returning the buffer as binary instead of converting to text here
            // For AWS Api Gateway be sure to customize the gateway to allow for binary return values; 
            // see https://aws.amazon.com/blogs/compute/binary-support-for-api-integrations-with-amazon-api-gateway/
            body: buffer
          });          
/*          
        var s3 = new AWS.S3();
        var params = {
            Bucket : S3config.bucketName,
            Key : 'pdfs/' + fileName + '.pdf',
            Body : buffer
        }

        s3.putObject(params, function(err, data) {
            if (err) {
                console.log("There was an error while saving the PDF to S3");
                console.log(err);
                var error = new Error("There was an error while saving the PDF to S3");
                callback(error);
            } else {
                console.log('Created PDF with data:');
                console.log(data);

                context.done(null, { result: 'Created PDF file' });
            }
        });
*/        
      }
  });
};