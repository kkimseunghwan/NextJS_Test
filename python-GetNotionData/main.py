from datetime import datetime
import logging
import os 

try:
    from core import settings
    from core import db_Manager
    from notion_handler.client import get_notion_client
    from notion_handler.api import get_published_blog_posts_from_notion_api
    from content_processor.parser import parse_notion_page_properties
    from content_processor.image_handler import download_and_save_image 
    from content_processor.markdown_converter import convert_blocks_to_markdown
    from utils.file_utils import ensure_directory_exists 
except ImportError as e:
    logging.error(f"모듈 임포트 중 오류 발생: {e}. PYTHONPATH 설정을 확인하거나, python-GetNotionData 디렉터리에서 스크립트를 실행하세요.")
    raise 

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# 단일 Notion 페이지 데이터를 처리하여 DB에 저장/업데이트
def process_single_post(notion_client, page_data):
    
    # 1. Notion 페이지 속성 파싱
    parsed_props = parse_notion_page_properties(page_data)
    if not parsed_props:
        logging.error(f"페이지 속성 파싱 실패 (ID: {page_data.get('id')}). 이 페이지를 건너뜁니다.")
        return

    page_id = parsed_props['id']
    post_slug = parsed_props['slug']
    post_title = parsed_props['title']
    notion_last_edited_time_str_from_api = parsed_props['notion_last_edited_time'] # YYYY-MM-DD HH:MM:SS 형식

    # 필수 값 누락 시 건너뛰기
    if not post_slug:
        logging.warning(f"'{post_title}' (ID: {page_id})의 슬러그가 없어 건너뜁니다.")
        return
    if not notion_last_edited_time_str_from_api:
        logging.warning(f"'{post_title}' (ID: {page_id})의 Notion 최종 수정 시간이 없어 건너뜁니다.")
        return

    # 2. DB에 저장된 최종 수정 시간과 비교하여 업데이트 여부 결정
    db_last_edited_time_str = db_Manager.get_post_notion_last_edited_time(page_id)
    notion_last_edited_time_str_from_api = datetime.strptime(notion_last_edited_time_str_from_api, "%Y-%m-%d %H:%M:%S")
    
    if db_last_edited_time_str and db_last_edited_time_str >= notion_last_edited_time_str_from_api:
        logging.info(f"'{post_title}' (ID: {page_id}) 게시물은 DB에 최신 상태이므로 건너뜁니다.")
        return

    logging.info(f"'{post_title}' (ID: {page_id}) 게시물 처리 시작 (DB 업데이트 필요).")

    # 3. 게시물 본문 마크다운 변환 및 본문 내 이미지 처리
    # convert_blocks_to_markdown 함수는 내부적으로 image_handler.download_and_save_image 호출
    markdown_content, used_image_block_ids_from_content = convert_blocks_to_markdown(
        notion_client_instance=notion_client,
        page_id=page_id, # Notion 페이지 ID (블록 자식 조회용)
        post_id=page_id, # DB의 posts.id와 동일하게 사용 (images.post_id용)
        post_slug=post_slug
    )
    if markdown_content.startswith("# Error"): # 마크다운 변환 실패 시
        logging.error(f"'{post_title}' (ID: {page_id})의 본문 변환 실패. 이 페이지를 건너뜁니다.")
        return

    # 4. 대표 이미지(커버) 처리
    featured_image_web_path = None
    if parsed_props.get('cover_image_url'):
        # 커버 이미지는 고유 ID
        cover_image_id_for_db = f"cover-{page_id}"

        featured_image_web_path = download_and_save_image(
            image_url=parsed_props['cover_image_url'],
            image_block_id=cover_image_id_for_db, 
            post_id=page_id,
            post_slug=post_slug,
            image_caption=f"{post_title} Cover Image", # 캡션 예시
            is_cover=True
        )
        if featured_image_web_path:
            logging.info(f"'{post_title}' 커버 이미지 처리 완료: {featured_image_web_path}")
        else:
            logging.warning(f"'{post_title}' 커버 이미지 처리 실패.")


    # 5. DB에 저장할 게시물 데이터 준비
    post_data_for_db = {
        'id': page_id,
        'slug': post_slug,
        'title': post_title,
        'description': parsed_props.get('description'),
        'content': markdown_content,
        'post_type': parsed_props['post_type'],
        'category': parsed_props.get('category'),
        'published_date': parsed_props['published_date'],
        'featured_image': featured_image_web_path, # 처리된 웹 경로 또는 None
        'notion_last_edited_time': notion_last_edited_time_str_from_api # API에서 받은 형식 그대로 전달 (DB에서 DATETIME으로 저장됨)
    }

    # 6. 게시물 정보 DB에 저장/업데이트
    if not db_Manager.upsert_post(post_data_for_db):
        logging.error(f"'{post_title}' (ID: {page_id}) 게시물 정보 DB 저장 실패. 이 페이지를 건너뜁니다.")
        return

    # 7. 태그 정보 DB에 저장/업데이트
    notion_tags = parsed_props.get('tags', [])
    if not db_Manager.link_tags_to_post(page_id, notion_tags):
        logging.warning(f"'{post_title}' (ID: {page_id}) 태그 정보 DB 저장 실패.")
        # 태그 저장 실패는 게시물 저장에 영향을 주지 않도록 처리 (선택적)

    # 8. (선택적) 미사용 이미지 정리 (현재 게시물에 한해)
    #   - DB에서 해당 post_id의 이미지 ID 목록(images 테이블) 가져오기
    #   - used_image_block_ids_from_content (본문 이미지) 와 featured_image_web_path (커버 이미지의 ID) 를 합쳐 현재 사용 중인 이미지 ID 세트 생성
    #   - DB 목록에는 있는데 현재 사용 목록에 없는 이미지 ID는 DB에서 삭제하고, 실제 파일도 삭제
    #   이 로직은 복잡하므로 별도 함수로 분리하거나, 스크립트 실행 후 한 번에 모든 게시물 대상으로 실행하는 것이 더 효율적일 수 있음
    #   간단한 예시:
    cleanup_unused_images_for_post(page_id, used_image_block_ids_from_content, cover_image_id_for_db if featured_image_web_path else None)

    logging.info(f"'{post_title}' (ID: {page_id}) 게시물 처리 완료.")

# 특정 게시물에 대해 더 이상 사용되지 않는 이미지 파일과 DB 정보를 정리
def cleanup_unused_images_for_post(post_id, used_content_image_ids, cover_image_id):

    logging.info(f"게시물(ID: {post_id})의 미사용 이미지 정리 시작...")

    # DB에 저장된 이 게시물의 모든 이미지 ID (Notion Block ID 또는 cover-post_id)
    db_image_ids_for_post = db_Manager.get_image_ids_for_post(post_id) 
    
    currently_used_image_ids = set(used_content_image_ids)
    if cover_image_id:
        currently_used_image_ids.add(cover_image_id)
        
    ids_to_delete_from_db = []
    for db_img_id in db_image_ids_for_post:
        if db_img_id not in currently_used_image_ids:
            ids_to_delete_from_db.append(db_img_id)
            
    if not ids_to_delete_from_db:
        logging.info(f"게시물(ID: {post_id}): 삭제할 미사용 이미지 없음.")
        return

    for image_id_to_delete in ids_to_delete_from_db:
        local_path = db_Manager.get_image_local_path(image_id_to_delete)
        if local_path:
            try:
                if os.path.exists(local_path):
                    os.remove(local_path)
                    logging.info(f"삭제된 로컬 이미지 파일: {local_path}")
                else:
                    logging.warning(f"삭제할 로컬 이미지 파일을 찾을 수 없음: {local_path}")
            except OSError as e:
                logging.error(f"로컬 이미지 파일 삭제 중 오류 ({local_path}): {e}")
        
        if not db_Manager.delete_image_info_by_id(image_id_to_delete):
            logging.warning(f"DB에서 이미지 정보(ID: {image_id_to_delete}) 삭제 실패.")
            
    logging.info(f"게시물(ID: {post_id})의 미사용 이미지 {len(ids_to_delete_from_db)}개 정리 완료.")


def main_sync_process():
    """전체 Notion 동기화 프로세스를 실행합니다."""
    logging.info("Notion 동기화 프로세스 시작...")

    db_Manager.init_db_schema()

    # 1. Notion 클라이언트 가져오기
    notion_client = get_notion_client()
    if not notion_client:
        logging.critical("Notion 클라이언트 초기화 실패. 스크립트를 종료합니다.")
        return

    # 2. 발행된 블로그 게시물 목록 가져오기 (Notion API 직접 호출)
    #    기존 get_published_blog_posts_from_notion는 파일 저장 로직이 포함되었을 수 있으므로,
    #    notion_handler.api에 순수 API 호출 함수 (가칭 get_published_blog_posts_from_notion_api)를 만듭니다.
    published_pages_data = get_published_blog_posts_from_notion_api(notion_client)
    
    if not published_pages_data:
        logging.info("Notion에서 가져올 발행된 게시물이 없습니다.")
        return

    logging.info(f"Notion에서 {len(published_pages_data)}개의 발행된 게시물을 가져왔습니다.")

    # 3. 각 게시물 처리
    for page_data in published_pages_data:
        process_single_post(notion_client, page_data)
        logging.info("-" * 30) # 게시물 처리 구분선

    # 4. (선택적) 전체 미사용 이미지 정리 (DB에는 있지만 어떤 게시물에도 연결되지 않은 이미지)
    #    이 로직은 더 복잡하며, 모든 게시물 처리 후 DB의 images 테이블과 실제 파일 시스템을 비교해야 합니다.
    #    일단은 개별 게시물 처리 시 미사용 이미지를 정리하는 것으로 하고, 추후 필요시 추가.

    logging.info("Notion 동기화 프로세스 완료.")


if __name__ == "__main__":
    
    main_sync_process()