// src/app/api/images/[...imagePath]/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises"; // Node.js file system module (Promise-based)
import path from "path";
import { queryDb } from "@/lib/db"; // DB 헬퍼 함수
import type { RowDataPacket } from "mysql2";

// 호스트 서버에서 이미지가 실제 저장된 기본 경로 (환경 변수로 설정하는 것이 좋음)
// Docker 볼륨 마운트와 연관됨
const IMAGE_STORAGE_BASE_PATH =
  process.env.IMAGE_HOST_STORAGE_PATH ||
  "C:HwanProjectsrvContentsdev_blogimages"; // Python 스크립트의 IMAGE_HOST_STORAGE_PATH 동일하게

export async function GET(
  request: Request,
  { params }: { params: { imagePath: string[] } }
) {
  // params.imagePath는 ['post-slug', 'image-filename.png'] 와 같은 배열 형태
  const requestedWebPath = `/api/images/${params.imagePath.join("/")}`; //

  try {
    // 1. DB에서 web_path를 기준으로 local_path 조회
    const sql = "SELECT local_path FROM images WHERE web_path = ?";
    const imageResults = await queryDb<RowDataPacket[]>(sql, [
      requestedWebPath,
    ]);

    if (imageResults.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Image not found in DB" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const localPathFromDb = imageResults[0].local_path;

    // 2. 보안 검사: localPathFromDb가 IMAGE_STORAGE_BASE_PATH 내에 있는지 확인
    //    path.resolve를 사용하여 절대 경로로 변환 후 비교 (경로 조작 방지)
    const resolvedLocalPath = path.resolve(localPathFromDb);
    const resolvedBaseStoragePath = path.resolve(IMAGE_STORAGE_BASE_PATH);

    if (!resolvedLocalPath.startsWith(resolvedBaseStoragePath)) {
      console.warn(
        `Potential path traversal attempt: ${resolvedLocalPath} is outside of ${resolvedBaseStoragePath}`
      );
      return new NextResponse(JSON.stringify({ error: "Invalid image path" }), {
        status: 403, // Forbidden
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. 실제 파일 시스템에서 이미지 파일 읽기
    const imageBuffer = await fs.readFile(resolvedLocalPath);

    // 4. 적절한 Content-Type 설정 (파일 확장자 기반)
    //    더 정교한 MIME 타입 감지가 필요하면 'mime-types' 같은 라이브러리 사용 가능
    let contentType = "application/octet-stream"; // 기본값
    const extension = path.extname(resolvedLocalPath).toLowerCase();
    if (extension === ".png") contentType = "image/png";
    else if (extension === ".jpg" || extension === ".jpeg")
      contentType = "image/jpeg";
    else if (extension === ".gif") contentType = "image/gif";
    else if (extension === ".webp") contentType = "image/webp";
    // 필요에 따라 다른 이미지 타입 추가

    // 5. 이미지 응답 반환
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // 강력한 캐싱 설정 (1년)
      },
    });
    return response;
  } catch (error: any) {
    // 파일 시스템 오류 (예: 파일 없음) 또는 기타 오류 처리
    if (error.code === "ENOENT") {
      console.error(
        `Image file not found at path: ${params.imagePath.join(
          "/"
        )} (resolved: ${error.path})`
      );
      return new NextResponse(
        JSON.stringify({ error: "Image file not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.error(`Error serving image ${requestedWebPath}:`, error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error while serving image" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
