# Notion 페이지 속성 파싱, 메타데이터 추출

import logging
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Notion 페이지 API 응답으로 받은 페이지 데이터에서 주요 속성을 파싱하여 딕셔너리로 반환 
def parse_notion_page_properties(page_data):
    # 페이지 기본 속성 정보
    properties = page_data.get("properties", {})
    parsed = {}

    try:
        # Notion ID -> PM Key
        parsed['id'] = page_data.get("id")
        if not parsed['id']:
            logging.warning("페이지 ID가 없습니다.")
            return None

        # Title (제목)
        title_prop = properties.get("Title", {}).get("title", [])
        parsed['title'] = title_prop[0]["plain_text"] if title_prop else "제목 없음"

        # Slug
        # UNIQUE NOT NULL 요소
        slug_prop = properties.get("Slug", {}).get("rich_text", [])
        parsed['slug'] = slug_prop[0]["plain_text"] if slug_prop else None 
        if not parsed['slug']:
            logging.warning(f"페이지 '{parsed['title']}'의 Slug가 비어있습니다. ID: {parsed['id']}")
            # None값 리턴 처리 (임시)
            return None

        # Description (설명)
        desc_prop = properties.get("Description", {}).get("rich_text", [])
        parsed['description'] = desc_prop[0]["plain_text"] if desc_prop else ""

        # Post Type (게시물 유형) - [ Post / Project ]
        # NOT NULL 요소
        type_prop = properties.get("Type", {}).get("select", {})
        parsed['post_type'] = type_prop.get("name") if type_prop else "Post" # (NOT NULL 요소) > 기본값 Post

        # Category (카테고리)
        category_prop = properties.get("Kategorie", {}).get("select", {})
        parsed['category'] = category_prop.get("name") if category_prop else None

        # Tags (태그) - 여러개
        # 태그 이름만 리스트로 추출
        tags_prop = properties.get("Tags", {}).get("multi_select", [])
        parsed['tags'] = [tag.get("name") for tag in tags_prop if tag.get("name")] 

        # PublishedDate (발행일) - # (YYYY-MM-DD) 형식 
        # 값 없으면 현재 날짜를 기본값으로.
        # NOT NULL
        date_prop = properties.get("PublishedDate", {}).get("date", {})
        parsed['published_date'] = date_prop.get("start") if date_prop else (datetime.today()).strftime("%Y-%m-%d")
        
        # Notion Last Edited Time (최종 수정 시간)
        parsed['notion_last_edited_time'] = page_data.get("last_edited_time")
        if parsed['notion_last_edited_time']:
            try:            
                # Notion 시간을 DB DATETIME 형식(YYYY-MM-DD HH:MM:SS)으로 변환
                dt_obj = datetime.fromisoformat(parsed['notion_last_edited_time'].replace('Z', '+00:00'))
                parsed['notion_last_edited_time'] = dt_obj.strftime('%Y-%m-%d %H:%M:%S')
            except ValueError:
                logging.error(f"페이지 '{parsed['title']}'의 notion_last_edited_time 형식 변환 실패: {parsed['notion_last_edited_time']}")
                
                # 최종 수정 시간 기준으로 업데이트를 진행하기 때문에 오류 시, None 반환
                parsed['notion_last_edited_time'] = None 
        if not parsed['notion_last_edited_time']:
             logging.warning(f"페이지 '{parsed['title']}'의 notion_last_edited_time이 없습니다. ID: {parsed['id']}")


        # Cover Image URL (커버 이미지)
        cover_data = page_data.get("cover")
        cover_url = None
        if cover_data:
            if cover_data.get('type') == 'external':
                cover_url = cover_data['external']['url']
            elif cover_data.get('type') == 'file':
                cover_url = cover_data['file']['url']

        # 실제 이미지 파일 다운로드 및 경로 변환은 image_handler에서 처리
        parsed['cover_image_url'] = cover_url 

        return parsed

    except Exception as e:
        page_id_for_log = page_data.get("id", "알 수 없음")
        logging.error(f"Notion 페이지 속성 파싱 중 오류 발생 (페이지 ID: {page_id_for_log}): {e}", exc_info=True)
        return None



# 테스트용 Notion 페이지 데이터 API로 받아와서 첫번째것만 파싱 
if __name__ == '__main__':
    import os
    import sys
    from dotenv import load_dotenv
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    if project_root not in sys.path:
        sys.path.append(project_root)
    
    from notion_handler import api

    results = api.get_published_blog_posts_from_notion()
    
    parsed_data = parse_notion_page_properties(results[0])
    if parsed_data:
        print("파싱된 데이터:")
        for key, value in parsed_data.items():
            print(f"  {key}: {value}")
    else:
        print("데이터 파싱 실패")