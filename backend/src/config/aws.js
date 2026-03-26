const AWS = require('aws-sdk');

/**
 * Initialize S3 instance
 */
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Upload file to S3
 * @param {Object} file - The file object (from multer)
 * @param {string} folder - The folder in S3 where the file will be uploaded
 * @returns {Promise<string>} - The URL of the uploaded file
 */

const uploadToS3 = async (file, folder) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: 'public-read'
  };

  const result = await s3.upload(params).promise().catch((err) => {
    console.log(`S3 Upload Error: ${err.message}`);
  });
  return result.Location;
};
/* ======================================================
   EXPORTS
====================================================== */

module.exports = { s3, uploadToS3 };