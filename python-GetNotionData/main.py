# .env 파일 읽기
# pip install python-dotenv

# Notion API 키 설정
# pip install notion-client


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

# 발행된 포스트 데이터 가져오기
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

def format_rich_text_array(rich_text_array):
    """Notion의 rich_text 배열을 Markdown 문자열로 변환합니다."""
    markdown_chunks = []
    for item in rich_text_array:
        if item['type'] == 'text':
            content = item['text']['content']
            annotations = item['annotations']
            
            if item['text'].get('link') and item['text']['link'].get('url'):
                # 링크가 있는 경우, 먼저 링크로 감싸고 내부 스타일 적용
                text_chunk = f"[{content}]({item['text']['link']['url']})"
            else:
                text_chunk = content

            if annotations.get('code'): # 인라인 코드
                text_chunk = f"`{text_chunk}`"
            # 인라인 코드는 다른 스타일과 중첩되지 않는 경우가 많으므로 먼저 처리
            # 또는, 코드 스타일이 다른 스타일보다 우선순위가 높다면 순서 조정
            
            if annotations.get('bold'):
                text_chunk = f"**{text_chunk}**"
            if annotations.get('italic'):
                text_chunk = f"*{text_chunk}*"
            if annotations.get('strikethrough'):
                text_chunk = f"~~{text_chunk}~~"
            # underline은 표준 Markdown에 없으므로 생략하거나 HTML <u> 태그 사용 고려
            
            markdown_chunks.append(text_chunk)
        elif item['type'] == 'mention':
            # 간단한 멘션 처리 (예: 페이지 멘션)
            if item['mention']['type'] == 'page':
                 markdown_chunks.append(f"@[Page: {item['plain_text']}]") # 또는 링크로 만들 수 있다면 링크로
            else:
                 markdown_chunks.append(item['plain_text'])
        elif item['type'] == 'equation':
            markdown_chunks.append(f"${item['equation']['expression']}$")

    return "".join(markdown_chunks)

def convert_blocks_to_markdown_text(blocks, indent_level=0):
    """Notion 블록 리스트를 Markdown 문자열로 변환합니다."""
    markdown_lines = []
    indent = "  " * indent_level # 중첩 목록을 위한 들여쓰기 (기본적인 수준)

    for block in blocks:
        block_type = block['type']
        element = block.get(block_type, {})

        if block_type == 'paragraph':
            text = format_rich_text_array(element.get('rich_text', []))
            if text.strip(): # 빈 문단은 제외하거나 <br>로 처리 가능
                markdown_lines.append(indent + text)
        elif block_type == 'heading_1':
            text = format_rich_text_array(element.get('rich_text', []))
            markdown_lines.append(f"# {text}")
        elif block_type == 'heading_2':
            text = format_rich_text_array(element.get('rich_text', []))
            markdown_lines.append(f"## {text}")
        elif block_type == 'heading_3':
            text = format_rich_text_array(element.get('rich_text', []))
            markdown_lines.append(f"### {text}")
        elif block_type == 'bulleted_list_item':
            text = format_rich_text_array(element.get('rich_text', []))
            children_markdown = ""
            if block.get('has_children'):
                # 중첩된 블록 가져오기 (실제로는 get_page_content_as_markdown처럼 페이지네이션 처리 필요)
                child_blocks_response = notion.blocks.children.list(block_id=block['id'])
                children_markdown = convert_blocks_to_markdown_text(child_blocks_response.get('results', []), indent_level + 1)
            markdown_lines.append(f"{indent}- {text}")
            if children_markdown:
                markdown_lines.append(children_markdown)
        elif block_type == 'numbered_list_item':
            # 순서 있는 목록은 Markdown 렌더러가 번호를 자동으로 매기므로 '1.'로 시작해도 무방합니다.
            text = format_rich_text_array(element.get('rich_text', []))
            children_markdown = ""
            if block.get('has_children'):
                child_blocks_response = notion.blocks.children.list(block_id=block['id'])
                children_markdown = convert_blocks_to_markdown_text(child_blocks_response.get('results', []), indent_level + 1)
            markdown_lines.append(f"{indent}1. {text}")
            if children_markdown:
                markdown_lines.append(children_markdown)
        elif block_type == 'to_do':
            text = format_rich_text_array(element.get('rich_text', []))
            checked = element.get('checked', False)
            markdown_lines.append(f"{indent}- [{'x' if checked else ' '}] {text}")
        elif block_type == 'quote':
            text = format_rich_text_array(element.get('rich_text', []))
            markdown_lines.extend([f"{indent}> {line}" for line in text.split('\n')])
        elif block_type == 'code':
            text = element.get('rich_text', [])[0].get('plain_text', '') if element.get('rich_text') else ''
            language = element.get('language', 'plaintext')
            markdown_lines.append(f"{indent}```{language}\n{text}\n{indent}```")
        elif block_type == 'divider':
            markdown_lines.append(f"{indent}---")
        elif block_type == 'image':
            image_data = element
            url = ""
            if image_data.get('type') == 'external':
                url = image_data['external']['url']
            elif image_data.get('type') == 'file':
                url = image_data['file']['url']
            
            caption_text = format_rich_text_array(image_data.get('caption', []))
            alt_text = caption_text if caption_text else "image" # 캡션이 있으면 alt 텍스트로 사용
            if url:
                 markdown_lines.append(f"{indent}![{alt_text}]({url})")
                 if caption_text: # 이미지 아래에 캡션 추가 (Markdown 표준 아님, 렌더러에 따라 다름)
                     markdown_lines.append(f"{indent}*{caption_text}*")

        # 여기에 다른 블록 타입들(callout, bookmark, table, column_list 등)에 대한 처리 추가 가능
        # 예: elif block_type == 'callout': ...

        # 지원하지 않는 블록에 대한 처리 (선택 사항)
        # else:
        #     markdown_lines.append(f"{indent}")
            
    # 각 Markdown 라인을 결합하되, 목록 항목이 아닌 경우 두 줄 띄어쓰기로 문단 구분
    # 좀 더 정교한 결합 로직이 필요할 수 있음
    processed_lines = []
    for i, line in enumerate(markdown_lines):
        processed_lines.append(line)
        # 현재 라인이 목록이나 코드블록의 일부가 아니고, 다음 라인도 목록이나 코드블록의 일부가 아닐 때 문단 구분을 위한 추가 개행
        # 이 부분은 개선이 필요할 수 있습니다.
        is_list_item = line.strip().startswith(('-', '1.')) or (i > 0 and processed_lines[-2].strip().startswith(('-', '1.')))
        is_code_block_line = "```" in line or (i > 0 and "```" in processed_lines[-2])
        
        if i < len(markdown_lines) - 1:
            next_line_is_list = markdown_lines[i+1].strip().startswith(('-', '1.'))
            if not is_list_item and not is_code_block_line and not next_line_is_list :
                 processed_lines.append("") # 문단 구분을 위해 빈 줄 추가

    return "\n".join(processed_lines)


def get_page_content_as_markdown(page_id: str):
    """지정된 Notion 페이지 ID의 모든 블록을 가져와 Markdown 문자열로 변환합니다."""
    print(f"Fetching and converting content for page_id: {page_id}...")
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
        
        print(f"Successfully fetched {len(all_blocks)} blocks for page_id: {page_id}.")
        markdown_content = convert_blocks_to_markdown_text(all_blocks)
        print(f"Successfully converted content for page_id: {page_id}.")
        return markdown_content
    except Exception as e:
        print(f"Error fetching or converting page content for page_id {page_id}: {e}")
        return f"Error converting content for page {page_id}."


if __name__ == "__main__":
    posts_data = get_published_blog_posts_from_notion()

    # --- 파일 저장을 위한 output_dir 설정 (사용자 환경에 맞게 수정 필요) ---
    # 이 스크립트 파일(main.py)이 있는 디렉토리 기준
    current_script_dir = os.path.dirname(__file__) 
    # Next.js 프로젝트 폴더가 이 스크립트 폴더의 부모 폴더 안에 있다고 가정 (예: ../mydevelopmentblog-nextjs)
    # 실제 Next.js 프로젝트 폴더 이름을 정확히 지정해야 합니다.
    nextjs_project_name = "mydevelopmentblog-nextjs" # <<--- 사용자님의 Next.js 프로젝트 폴더 이름으로 변경!!!
    output_dir = os.path.abspath(os.path.join(current_script_dir, '..', nextjs_project_name, 'content', 'blog'))
    
    # 출력 디렉토리가 없으면 생성
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")
    # --- 여기까지 ---

    for page in posts_data:
        page_id = page["id"]
        properties = page.get("properties", {})
        
        title_prop = properties.get("Title", {}).get("title", [])
        title = title_prop[0]["plain_text"] if title_prop else "제목 없음"
        
        slug_prop = properties.get("Slug", {}).get("rich_text", [])
        slug = slug_prop[0]["plain_text"] if slug_prop else page_id
        
        published_date_prop = properties.get("PublishedDate", {}).get("date", {})
        published_date = published_date_prop.get("start")
        
        tags_prop = properties.get("Tags", {}).get("multi_select", [])
        tags = [tag["name"] for tag in tags_prop]

        print(f"\nProcessing Post: {title}")
        
        markdown_content = get_page_content_as_markdown(page_id)
        
        # --- Frontmatter 및 파일 저장 로직 ---
        # 제목에 따옴표가 있으면 YAML frontmatter가 깨질 수 있으므로 이스케이프 처리
        escaped_title = title.replace('"', '\\"')

        frontmatter_lines = [
            "---",
            f'title: "{escaped_title}"',
            f'date: "{published_date if published_date else ""}"',
            f'tags: {tags}', # YAML 리스트 형식
            f'slug: "{slug}"'
            # 필요시 다른 메타데이터 추가 (예: summary, coverImage 등)
            # summary_prop = properties.get("Summary", {}).get("rich_text", [])
            # summary = summary_prop[0]["plain_text"] if summary_prop else ""
            # if summary:
            #     frontmatter_lines.append(f'summary: "{summary.replace("\"", "\\\"")}"')
            "---",
            "" # Frontmatter와 본문 사이에 빈 줄
        ]
        frontmatter = "\n".join(frontmatter_lines)
        
        file_path = os.path.join(output_dir, f"{slug}.md")
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(frontmatter + markdown_content)
            print(f"Successfully saved: {file_path}")
        except Exception as e:
            print(f"Error saving file {file_path}: {e}")
