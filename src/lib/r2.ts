import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 환경변수가 설정되지 않았습니다.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/** 업로드용 presigned POST 생성 (클라이언트가 직접 R2에 업로드) */
export async function createUploadPresignedPost(
  storageKey: string,
  mimeType: string
) {
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;

  return createPresignedPost(client, {
    Bucket: bucket,
    Key: storageKey,
    Conditions: [
      ["content-length-range", 1, MAX_FILE_SIZE],
      ["eq", "$Content-Type", mimeType],
    ],
    Fields: { "Content-Type": mimeType },
    Expires: 300, // 5분
  });
}

/** 다운로드용 presigned GET URL 생성 */
export async function createDownloadUrl(storageKey: string): Promise<string> {
  // Public URL이 설정된 경우 그걸 사용
  if (process.env.R2_PUBLIC_URL && !process.env.R2_PUBLIC_URL.includes("your-")) {
    return `${process.env.R2_PUBLIC_URL}/${storageKey}`;
  }

  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: storageKey,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 }); // 1시간
}

/** R2에서 파일 삭제 */
export async function deleteFromR2(storageKey: string) {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: storageKey,
    })
  );
}
