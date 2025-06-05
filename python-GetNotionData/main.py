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


    # 순서 수정

    # 3. 게시물 기본 정보 DB에 저장/업데이트 (이미지 경로 없이 먼저)
    #    featured_image 필드는 나중에 이미지 처리 후 업데이트하거나, 초기에는 NULL 또는 빈 값으로 저장
    post_data_for_db_initial = {
        'id': page_id,
        'slug': post_slug,
        'title': post_title,
        'description': parsed_props.get('description'),
        'content': "# Placeholder for content, will be updated after image processing", # 임시 값 또는 빈 값
        'post_type': parsed_props['post_type'],
        'category': parsed_props.get('category'),
        'published_date': parsed_props['published_date'],
        'featured_image': None, # 초기에는 대표 이미지 경로 없음
        'notion_last_edited_time': notion_last_edited_time_str_from_api 
    }

    if not db_Manager.upsert_post(post_data_for_db_initial):
        logging.error(f"'{post_title}' (ID: {page_id}) 게시물 기본 정보 DB 저장 실패. 이 페이지를 건너뜁니다.")
        return

    logging.info(f"'{post_title}' (ID: {page_id}) 게시물 기본 Normal 정보 저장")


    # 4. 게시물 본문 마크다운 변환 및 본문 내 이미지 처리
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
            logging.warning(f"{parsed_props['cover_image_url']}")    
            logging.warning(f"{cover_image_id_for_db}")
            logging.warning(f"{page_id}")
            logging.warning(f"{post_slug}")
            logging.warning(f"isCover = {is_cover}")
            logging.warning("")


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


# python-GetNotionData/main.py 수정 제안

# ... (기존 import 및 함수 정의) ...

def main_sync_process():
    """전체 Notion 동기화 프로세스를 실행합니다."""
    logging.info("Notion 동기화 프로세스 시작...")

    db_Manager.init_db_schema() # DB 스키마 초기화 (기존 유지)

    # 1. Notion 클라이언트 가져오기
    notion_client = get_notion_client()
    if not notion_client:
        logging.critical("Notion 클라이언트 초기화 실패. 스크립트를 종료합니다.")
        return

    # 2. Notion API에서 현재 '발행됨' 상태인 모든 게시물 ID 목록 가져오기
    logging.info("Notion API에서 현재 '발행됨' 상태의 모든 페이지 ID를 조회합니다...")
    notion_post_ids_set = set()
    try:
        # get_published_blog_posts_from_notion_api 함수는 페이지 전체 데이터를 반환하므로,
        # ID만 추출하거나, ID만 가져오는 별도 API 호출 함수를 고려할 수 있습니다.
        # 여기서는 기존 함수를 활용하여 ID만 추출합니다.
        published_pages_data_from_notion = get_published_blog_posts_from_notion_api(notion_client)
        if published_pages_data_from_notion:
            for page_data in published_pages_data_from_notion:
                if page_data.get('id'):
                    notion_post_ids_set.add(page_data.get('id'))
        logging.info(f"Notion API에서 {len(notion_post_ids_set)}개의 '발행됨' 페이지 ID를 가져왔습니다.")
    except Exception as e:
        logging.error(f"Notion API에서 페이지 ID 목록 조회 중 오류 발생: {e}")
        return # ID 목록 조회 실패 시 동기화 중단

    # 3. DB에 저장된 모든 게시물 ID 목록 가져오기
    logging.info("DB에서 기존 게시물 ID 목록을 조회합니다...")
    db_post_ids_set = set(db_Manager.get_all_post_ids_from_db()) # db_Manager에 새 함수 필요
    logging.info(f"DB에서 {len(db_post_ids_set)}개의 게시물 ID를 가져왔습니다.")

    # 4. 삭제된 게시물 처리: DB에는 있지만 Notion API 결과에는 없는 게시물
    #    (Notion에서 삭제되었거나, '발행됨' 상태가 아니거나, 다른 DB로 옮겨졌거나 등)
    posts_to_delete_ids = list(db_post_ids_set - notion_post_ids_set)
    
    if posts_to_delete_ids:
        logging.info(f"Notion에 더 이상 존재하지 않거나 '발행됨' 상태가 아닌 게시물 {len(posts_to_delete_ids)}개를 DB에서 삭제합니다: {posts_to_delete_ids}")
        for post_id_to_delete in posts_to_delete_ids:
            logging.info(f"게시물 ID '{post_id_to_delete}' 삭제 처리 시작...")
            # 4.1 연결된 이미지 정보 및 실제 파일 삭제 (cleanup_unused_images_for_post 함수 재활용 또는 확장)
            #     이때 해당 post_id의 모든 이미지를 삭제 대상으로 간주 (used_content_image_ids와 cover_image_id를 빈 값으로 전달)
            cleanup_unused_images_for_post(post_id_to_delete, [], None) # 해당 포스트의 모든 이미지 정리
            
            # 4.2 DB에서 게시물 관련 정보 삭제 (posts, post_tags 등)
            #     db_Manager에 게시물 및 관련 레코드(태그 연결 등) 삭제 함수 필요
            if db_Manager.delete_post_by_id(post_id_to_delete): # CASCADE 설정으로 post_tags도 자동 삭제될 수 있음
                logging.info(f"게시물 ID '{post_id_to_delete}'가 DB에서 성공적으로 삭제되었습니다.")
            else:
                logging.error(f"게시물 ID '{post_id_to_delete}' DB 삭제 실패.")
    else:
        logging.info("DB에서 삭제할 게시물이 없습니다.")

    # 5. 신규 또는 업데이트된 게시물 처리 (기존 로직)
    if not published_pages_data_from_notion:
        logging.info("Notion에서 가져올 발행된 게시물이 없습니다 (신규/업데이트 대상).")
    else:
        logging.info(f"Notion에서 가져온 {len(published_pages_data_from_notion)}개의 발행된 게시물에 대해 신규/업데이트 처리를 시작합니다.")
        for page_data in published_pages_data_from_notion:
            process_single_post(notion_client, page_data) # 기존 함수 사용
            logging.info("-" * 30)

    logging.info("Notion 동기화 프로세스 완료.")


if __name__ == "__main__":
    main_sync_process()
