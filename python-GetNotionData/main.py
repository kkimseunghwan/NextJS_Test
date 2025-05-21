# .env 파일 읽기
# pip install python-dotenv

# Notion API 키 설정
# pip install notion-client

# 파이썬 용 Notion-to-md 라이브러리
# pip install notion2md

import os
from dotenv import load_dotenv
from notion_client import Client

# ===== ===== .env 파일 내 API 키 받아오기 ===== ===== #
# .env 파일 읽기
load_dotenv()

NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
NOTION_DATABASE_ID = os.environ.get('NOTION_DATABASE_ID')

if not NOTION_API_KEY:
    raise ValueError("NOTION_API_KEY가 환경 변수에 설정되지 않았습니다.")
if not NOTION_DATABASE_ID:
    raise ValueError("NOTION_DATABASE_ID가 환경 변수에 설정되지 않았습니다.")

print(NOTION_API_KEY)
print(NOTION_DATABASE_ID)


# ===== ===== Notion 연결 및 데이터 받아오기 ===== ===== #

# Notion 클라이언트 초기화
notion = Client(auth=NOTION_API_KEY)

def get_published_blog_posts_from_notion():
    if not NOTION_DATABASE_ID:
        print("Error: NOTION_DATABASE_ID is not defined.")
        return []

    print("Fetching published blog posts from Notion...")
    try:
        response = notion.databases.query(
            database_id=NOTION_DATABASE_ID,
            filter={
                "property": "Status",  # Notion DB의 'Status' 속성 이름 (실제 이름으로 변경)
                "select": {
                    "equals": "발행됨"  # Notion DB의 'Status' 속성 값이 "발행됨" 인거만 가져오기
                }
            },
            sorts=[
                {
                    "property": "PublishedDate",  # Notion DB의 'PublishedDate' 속성 이름 (실제 이름으로 변경)
                    "direction": "descending"
                }
            ]
        )
        print("Successfully fetched posts from Notion.")
        return response.get("results", [])
    except Exception as e:
        print(f"Error fetching data from Notion: {e}")
        return []

def get_page_content_as_markdown(page_id: str):
    
    from notion2md.exporter.block import MarkdownExporter, StringExporter

    
if __name__ == "__main__":
    posts_data = get_published_blog_posts_from_notion()

    for page in posts_data:
        page_id = page["id"]
        properties = page.get("properties", {})
        
        title_prop = properties.get("Title", {}).get("title", []) # Notion DB 속성 이름 확인!
        title = title_prop[0]["plain_text"] if title_prop else "제목 없음"
        
        slug_prop = properties.get("Slug", {}).get("rich_text", []) # Notion DB 속성 이름 확인!
        slug = slug_prop[0]["plain_text"] if slug_prop else page_id
        
        published_date_prop = properties.get("PublishedDate", {}).get("date", {}) # Notion DB 속성 이름 확인!
        published_date = published_date_prop.get("start")
        
        tags_prop = properties.get("Tags", {}).get("multi_select", []) # Notion DB 속성 이름 확인!
        tags = [tag["name"] for tag in tags_prop]

        print(f"\nTitle: {title}")
        print(f"Slug: {slug}")
        print(f"Published Date: {published_date}")
        print(f"Tags: {tags}")
        
        # 상세 페이지 내용(Markdown) 가져오기
        markdown_content = get_page_content_as_markdown(page_id)
        print(f"Content (Markdown Preview): {markdown_content[:200]}...") # 처음 200자만 미리보기

        # 여기에 이 정보를 사용하여 .md 파일을 생성하고 저장하는 로직을 추가합니다.
        # 예: content/blog/{slug}.md 파일로 저장
        # 파일 내용:
        # ---
        # title: "게시물 제목"
        # date: "2024-05-21"
        # tags: ["tag1", "tag2"]
        # slug: "게시물-슬러그"
        # ---
        # {markdown_content}
        
        # 예시 (파일 저장 로직은 실제 경로와 필요에 맞게 수정)
        # output_dir = os.path.join(os.path.dirname(__file__), '..', 'NextJS_프로젝트_폴더', 'content', 'blog')
        # os.makedirs(output_dir, exist_ok=True)
        # file_path = os.path.join(output_dir, f"{slug}.md")

        # frontmatter = f"""---
# title: "{title}"
# date: "{published_date if published_date else ''}"
# tags: {tags}
# slug: "{slug}"
# ---

# """
        # try:
        #     with open(file_path, "w", encoding="utf-8") as f:
        #         f.write(frontmatter + markdown_content)
        #     print(f"Successfully saved: {file_path}")
        # except Exception as e:
        #     print(f"Error saving file {file_path}: {e}")





