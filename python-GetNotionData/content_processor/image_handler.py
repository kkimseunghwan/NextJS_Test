# 이미지 다운로드, 경로 관리, DB 저장/삭제 로직 

import os
import sys
import requests
import shutil
import logging
from urllib.parse import urlparse

# 상대 경로 임포트를 위해 프로젝트 루트를 sys.path에 추가하는 부분은 main.py에서 처리하거나,
# 이 모듈이 다른 모듈에서 임포트될 때 Python의 모듈 검색 경로에 따라 core, utils 등이 인식되어야 합니다.
# 여기서는 일단 상대경로 임포트를 가정합니다.

from core import settings # 프로젝트 설정 (IMAGE_HOST_STORAGE_PATH, IMAGE_WEB_BASE_PATH 등)
from core import db_Manager
from utils.file_utils import ensure_directory_exists # (utils/file_utils.py에 생성 예정)


# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# 파일 이름 만들기
# original_extension: 원본 파일의 확장자
def generate_safe_filename(image_block_id, original_extension):
    clean_block_id = image_block_id.replace('-', '')
    return f"{clean_block_id}{original_extension}"


# 파일 확장자 추출
# (?)
def determine_extension_from_url(image_url, default_ext='.png'):

    parsed_url = urlparse(image_url)
    original_filename = os.path.basename(parsed_url.path)
    _, ext = os.path.splitext(original_filename)

    if ext and len(ext) > 1: # 유효한 확장자가 URL에 있는 경우
        return ext.lower()
    
    # URL에 확장자가 없는 경우, Content-Type 확인 시도
    try:
        response_head = requests.head(image_url, timeout=5, allow_redirects=True)
        response_head.raise_for_status()
        content_type = response_head.headers.get('content-type')
        
        if content_type:
            if 'image/jpeg' in content_type:
                return '.jpg'
            elif 'image/png' in content_type:
                return '.png'
            elif 'image/gif' in content_type:
                return '.gif'
            elif 'image/webp' in content_type:
                return '.webp'
            
    except requests.exceptions.RequestException as e:
        logging.warning(f"이미지 확장자 확인 중 Content-Type 요청 실패 (URL: {image_url}): {e}")
    
    return default_ext


# URL통해서 이미지 다운, 호스트 서버 경로에 저장.
# 이미지 정보를 DB에 upsert, 
# 성공 시 return 웹 접근 경로 (예: /api/images/post-slug/blockid.png), 실패 시 None
def download_and_save_image(
        image_url: str,             # 이미지 원본 URL
        image_block_id: str,        # Notion 이미지 블록 ID
        post_id: str,               # 해당 이미지가 속한 게시물의 ID
        post_slug: str,             # 게시물 슬러그 (이미지 파일 저장 경로용)
        image_caption: str = None,  # 이미지 캡션 내용
        is_cover: bool = False      # 커버 이미지인지
    ):

    if not image_url or not image_block_id or not post_id or not post_slug:
        logging.error("이미지 다운로드 실패 - 필수 인자 누락")
        return None

    try:
        # 1. 파일 확장자 결정
        original_extension = determine_extension_from_url(image_url)
        
        # 2. 저장할 파일 이름 및 경로 설정
        if is_cover:
            # 파일명은 cover.확장자
            filename_base = f"cover" 
            unique_image_id_for_db = f"cover-{post_id}" # (고유한) DB에 저장될 이미지 ID 
        else:
            filename_base = image_block_id.replace('-', '')
            unique_image_id_for_db = image_block_id

        final_filename = f"{filename_base}{original_extension}"
        
        # 호스트 서버에 저장될 이미지 경로
        post_image_save_dir = os.path.join(settings.IMAGE_HOST_STORAGE_PATH, post_slug)
        ensure_directory_exists(post_image_save_dir) # utils.file_utils 에 구현 필요 # 뭐하는애여?
        local_image_disk_path = os.path.join(post_image_save_dir, final_filename)

        # 웹에서 접근할 최종 경로 (Next.js API 라우트 경로)
        image_web_path = f"{settings.IMAGE_WEB_BASE_PATH}/{post_slug}/{final_filename}"

        # 기본적으로 다운로드 수행
        perform_download = True 

        if os.path.exists(local_image_disk_path):
            if is_cover:
                # 커버 이미지는 URL이 변경되었을 가능성이 있으므로, 항상 재다운로드 (또는 URL 비교 후 재다운로드)
                logging.info(f"커버 이미지가 이미 존재합니다: {local_image_disk_path}. Notion URL 변경 시 덮어쓰기 위해 다운로드를 진행합니다.")
            else: # 본문 내 이미지의 경우
                logging.info(f"본문 이미지가 이미 존재합니다: {local_image_disk_path}. 다운로드를 건너뜁니다.")
                perform_download = False 
        
        if perform_download:
            logging.info(f"이미지 다운로드 시작: {image_url} -> {local_image_disk_path}")
            try:
                response = requests.get(image_url, stream=True, timeout=10)
                response.raise_for_status()
                with open(local_image_disk_path, 'wb') as out_file:
                    shutil.copyfileobj(response.raw, out_file)
                del response
                logging.info(f"이미지 다운로드 성공: {final_filename}")
            except requests.exceptions.RequestException as e:
                logging.error(f"이미지 다운로드 중 네트워크 오류 발생 (URL: {image_url}): {e}")
                # 다운로드 실패 시 기존 파일 사용
                if os.path.exists(local_image_disk_path):
                    logging.warning(f"다운로드 실패, 기존 이미지 파일을 사용합니다: {local_image_disk_path}")
                else:
                    return None # 그거도 실패하면 None
            except IOError as e:
                logging.error(f"이미지 파일 저장 중 오류 발생 (Path: {local_image_disk_path}): {e}")
                return None


        logging.info(f"DB 정보 업데이트 시도.")

        # 4. DB에 이미지 정보 저장/업데이트
        image_data_for_db = {
            'id': unique_image_id_for_db, # Notion 블록 ID 또는 커버 이미지용 고유 ID
            'post_id': post_id,
            'local_path': local_image_disk_path,
            'web_path': image_web_path,
            'caption': image_caption
        }

        if not db_Manager.upsert_image_info(image_data_for_db):
            logging.error(f"이미지 정보 DB 저장/업데이트 실패: {unique_image_id_for_db}")
            return None 

        return image_web_path

    except requests.exceptions.RequestException as e:
        logging.error(f"이미지 다운로드 중 네트워크 오류 발생 (URL: {image_url}): {e}")
        return None # 다운로드 실패 시 원본 URL 반환 대신 None 또는 특정 에러 식별자 반환
    except IOError as e:
        logging.error(f"이미지 파일 저장 중 오류 발생 (Path: {local_image_disk_path if 'local_image_disk_path' in locals() else '알 수 없음'}): {e}")
        return None
    except Exception as e:
        logging.error(f"이미지 처리 중 예기치 않은 오류 발생 (URL: {image_url}): {e}", exc_info=True)
        return None

# --- 미사용 이미지 정리 함수 (추후 구현) ---
# def cleanup_post_images(post_id, current_image_block_ids_in_content): ...


