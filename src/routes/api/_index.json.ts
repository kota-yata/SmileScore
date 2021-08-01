import AWS from 'aws-sdk';
import type { RequestHandler } from '@sveltejs/kit';

const config = {
  accesKeyId: import.meta.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY as string,
  region: 'ap-northeast-1'
};
AWS.config.update(config);
const S3 = new AWS.S3();

const bucketName = 'ky-rekognition';
const keyName = 'text.txt';
/*S3.putObject({ Bucket: bucketName, Key: keyName, Body: 'hello' }, function(err, data) {
  if (err) {
    console.log(err);
  } else {
    console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
  }
});*/
S3.deleteObject({ Bucket: bucketName, Key: keyName }, (err, data) => {
  if (err) console.log(err);
  console.log(data);
});

export const post: RequestHandler = async ({ params }) => {
  console.log('post', params);
};
