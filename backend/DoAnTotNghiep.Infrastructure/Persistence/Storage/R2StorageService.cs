using Amazon.S3;
using Amazon.S3.Model;
using DoAnTotNghiep.Application.Common;

namespace DoAnTotNghiep.Infrastructure.Persistence.Storage
{
    public class R2StorageService : IFileStorageService
    {
        private readonly IAmazonS3 _s3;
        private readonly R2Settings _settings;

        public R2StorageService(R2Settings settings)
        {
            _settings = settings;

            var config = new AmazonS3Config
            {
                ServiceURL = settings.Endpoint,
                ForcePathStyle = true
            };

            _s3 = new AmazonS3Client(
                settings.AccessKey,
                settings.SecretKey,
                config);
        }

        public async Task DeleteAsync(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return;

            var key = ExtractKeyFromUrl(url);

            var request = new DeleteObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = key
            };

            await _s3.DeleteObjectAsync(request);
        }

        private string ExtractKeyFromUrl(string url)
        {
            var baseUrl = _settings.PublicBaseUrl.TrimEnd('/');

            if (url.StartsWith(baseUrl,
                StringComparison.OrdinalIgnoreCase))
            {
                return url.Substring(baseUrl.Length)
                          .TrimStart('/');
            }

            var uri = new Uri(url);

            return uri.AbsolutePath.TrimStart('/');
        }

        public async Task<string> UploadAsync(Stream stream, string key, string contentType)
        {
            var request = new PutObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = key,
                InputStream = stream,
                ContentType = contentType,
                DisablePayloadSigning = true
            };

            await _s3.PutObjectAsync(request);

            return $"{_settings.PublicBaseUrl}/{key}";
        }
    }
}
