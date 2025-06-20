// src/app/api/images/[...imagePath]/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises"; // Node.js file system module (Promise-based)
import path from "path";
import { executeQuery } from '@/lib/db'; 
import type { RowDataPacket } from 'mysql2';

// 호스트 서버에서 이미지가 실제 저장된 기본 경로 (환경 변수로 설정하는 것이 좋음)
const IMAGE_STORAGE_BASE_PATH = '/app/mounted_images';

// DB에서 반환될 결과의 타입을 명확하게 정의합니다.
interface ImagePathResult extends RowDataPacket {
  local_path: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ imagePath: string[] }> }
) {
  const { imagePath } = await params;
  
  // params.imagePath는 ['post-slug', 'image-filename.png'] 와 같은 배열 형태
  const requestedWebPath = `/api/images/${imagePath.join("/")}`; //

  try {
    // 1. DB에서 web_path를 기준으로 local_path 조회
    const sql = "SELECT local_path FROM images WHERE web_path = ?";
    const imageResults = await executeQuery<ImagePathResult>(sql, [requestedWebPath]);

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

    // 2. 보안 검사 (이하 로직은 모두 동일)
    const resolvedLocalPath = path.resolve(localPathFromDb);
    const resolvedBaseStoragePath = path.resolve(IMAGE_STORAGE_BASE_PATH);

    if (!resolvedLocalPath.startsWith(resolvedBaseStoragePath)) {
      console.warn(`Potential path traversal attempt: ${resolvedLocalPath}`);
      return new NextResponse(JSON.stringify({ error: 'Invalid image path' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. 실제 파일 시스템에서 이미지 파일 읽기
    const imageBuffer = await fs.readFile(resolvedLocalPath);

    // 4. 적절한 Content-Type 설정
    let contentType = 'application/octet-stream';
    const extension = path.extname(resolvedLocalPath).toLowerCase();
    if (extension === '.png') contentType = 'image/png';
    else if (['.jpg', '.jpeg'].includes(extension)) contentType = 'image/jpeg';
    else if (extension === '.gif') contentType = 'image/gif';
    else if (extension === '.webp') contentType = 'image/webp';

    // 5. 이미지 응답 반환
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
    
  } catch (error) {
    
    console.error(`Error serving image ${requestedWebPath}:`, error);
    
    return new NextResponse(
    JSON.stringify({ error: "Failed to retrieve image" }),
    {
        status: 404,
        headers: { "Content-Type": "application/json" },
    }
    );
  }
}
