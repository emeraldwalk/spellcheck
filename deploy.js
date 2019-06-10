const { readdirSync, readFileSync, statSync } = require('fs');
const { join } = require('path');
const AWS = require('aws-sdk');

if(process.argv.length < 3) {
  console.error('Expected s3 bucket name.');
  process.exit(1);
}

const config = {
  bucketName: process.argv[2]
};

const s3 = new AWS.S3();

const root = join(__dirname, 'build');
const paths = ['.'];

while(paths.length > 0) {
  const path = paths.shift();
  const fullPath = join(root, path);
  if(statSync(fullPath).isDirectory()) {
    paths.push(
      ...readdirSync(fullPath).map(n => join(path, n))
    );
  }
  else {
    console.log(path);
    s3.putObject({
      Bucket: config.bucketName,
      Key: path,
      Body: readFileSync(fullPath),
      ContentType: getContentType(path)
    }, (err, data) => {
      if(err) {
        console.error(err);
      }
      console.log(data);
    });
  }
}

function getContentType(
  path
) {
  const [, ext] = path.match(/\.(\w+)$/);
  return {
    css: 'text/css',
    html: 'text/html',
    js: 'application/json',
    map: 'binary/octet-stream',
    woff: 'application/font-woff',
    woff2: 'binary/octet-stream'
  }[ext] || 'binary/octet-stream';
}