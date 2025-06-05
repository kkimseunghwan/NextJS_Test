
# Notion API를 통한 데이터(페이지, 블록)조회 함수

from . import client
from core import settings
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# 발행된 포스트 데이터 가져오기
def get_published_blog_posts_from_notion_api(notion=client.get_notion_client()):
    
    notion_database_id = settings.NOTION_DATABASE_ID


    logging.info(f"Notion 데이터베이스(ID: {notion_database_id})에서 '발행됨' 상태의 페이지를 조회합니다...")
    all_results = []
    next_cursor = None

    try:
        # 페이지네이션
        while True:
            response = notion.databases.query(
                database_id=notion_database_id,
                filter={
                    "property": "Status",
                    "select": {
                        "equals": "발행됨"
                    }
                },
                sorts=[
                    {
                        "property": "PublishedDate",
                        "direction": "descending"
                    }
                ],
                start_cursor=next_cursor
            )
            all_results.extend(response.get("results", []))
            next_cursor = response.get("next_cursor")
            if not next_cursor:
                break
        
        logging.info(f"총 {len(all_results)}개의 '발행됨' 페이지를 Notion에서 가져왔습니다.")
        return all_results
    except Exception as e:
        logging.error(f"Notion 데이터베이스 조회 중 오류 발생: {e}")
        return []


# 특정 Notion 페이지 ID에 해당하는 모든 블록(콘텐츠) 정보를 반환
def get_page_blocks(page_id: str):

    notion = client.get_notion_client()
    
    logging.info(f"Notion 페이지(ID: {page_id})의 블록 정보를 조회합니다...")
    all_blocks = []
    next_cursor = None

    try:
        while True:
            response = notion.blocks.children.list(
                block_id=page_id,
                start_cursor=next_cursor
            )
            all_blocks.extend(response.get("results", []))
            next_cursor = response.get("next_cursor")
            if not next_cursor:
                break
        
        logging.info(f"총 {len(all_blocks)}개의 블록을 페이지(ID: {page_id})에서 가져왔습니다.")
        return all_blocks
    except Exception as e:
        import traceback
        logging.error(f"Notion 페이지(ID: {page_id}) 블록 조회 중 오류 발생: {type(e).__name__} - {e}")
        traceback.print_exc()

        return []


# 테스트
# if __name__ == "__main__":
#     results = get_published_blog_posts_from_notion()
#     print(get_page_blocks(results[0]["id"]))