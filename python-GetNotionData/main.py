# .env 파일 읽기
# pip install python-dotenv

# Notion API 키 설정
# pip install notion-client

# frontmatter 파싱을 위해 추가 
# pip install python-frontmatter

# 이미지 파일 처리 
# pip install requests

import os
import json # JSON 로깅 또는 파싱에 유용할 수 있음 (여기서는 직접 사용 안함)
from dotenv import load_dotenv
from notion_client import Client
import datetime # 시간 비교를 위해 import
import frontmatter 
import requests
import shutil
from urllib.parse import urlparse
import time
import hashlib # URL 해시 생성용 (선택적 개선 방안)

# ===== ===== .env 파일 내 API 키 받아오기 ===== ===== #
# .env 파일 읽기
load_dotenv()

NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
NOTION_DATABASE_ID = os.environ.get('NOTION_DATABASE_ID')

if not NOTION_API_KEY:
    raise ValueError("NOTION_API_KEY가 환경 변수에 설정되지 않았습니다.")
if not NOTION_DATABASE_ID:
    raise ValueError("NOTION_DATABASE_ID가 환경 변수에 설정되지 않았습니다.")

# 키 잘 나오는지만 확인
print(NOTION_API_KEY[:10]) 
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
    all_results = []
    next_cursor = None

    try:
        while True:
            response = notion.databases.query(
                database_id=NOTION_DATABASE_ID,
                filter={
                    "property": "Status",  # Notion DB의 'Status' 속성 이름 (실제 이름으로)
                    "select": {
                        "equals": "발행됨"  # Notion DB의 'Status' 속성 값이 "발행됨" 인거만 가져오기
                    }
                },
                sorts=[
                    {
                        "property": "PublishedDate",  # Notion DB의 'PublishedDate' 속성
                        "direction": "descending"
                    }
                ],
                start_cursor=next_cursor # 페이지네이션
            )
            all_results.extend(response.get("results", []))
            next_cursor = response.get("next_cursor")
            if not next_cursor:
                break
        print(f"Successfully fetched {len(all_results)} posts from Notion.")
        return all_results
    except Exception as e:
        print(f"Error fetching data from Notion: {e}")
        return []

def format_rich_text_array(rich_text_array):
    # Notion의 rich_text 배열을 Markdown 또는 HTML 문자열로 변환
    # 색상은 문제가 있어서 나중에 추가 작업 필요

    markdown_chunks = []
    for item in rich_text_array:
        if item['type'] == 'text':
            content = item['text']['content']
            annotations = item['annotations']
            
            # HTML 태그 및 스타일 문자열 초기화
            html_open_tags = ""
            html_close_tags = ""
            styles = []
            ''' # Notion 색상 값과 실제 CSS 색상 값 매핑 (필요에 따라 확장)
            # 전체 목록은 Notion 개발자 문서 참고: https://developers.notion.com/reference/rich-text#annotations
            # color_map = {
            #     "gray": "#787774", "brown": "#976D57", "orange": "#D9730D",
            #     "yellow": "#CB912F", "green": "#438A63", "blue": "#2B6DAD",
            #     "purple": "#804FB3", "pink": "#C54894", "red": "#D44C47",
            #     # 배경색은 background-color로 적용
            #     "gray_background": "#E3E2E0", "brown_background": "#E9E0DB",
            #     "orange_background": "#FADEC9", "yellow_background": "#FDECC8",
            #     "green_background": "#DBEDDB", "blue_background": "#D3E5EF",
            #     "purple_background": "#E8DEEE", "pink_background": "#F5DBE9",
            #     "red_background": "#FCE4E2"
            # }

            # # 어노테이션된 색상 처리
            # notion_color = annotations.get('color', 'default')
            # if notion_color != 'default':
            #     if '_background' in notion_color:
            #         css_color = color_map.get(notion_color)
            #         if css_color:
            #             styles.append(f"background-color: {css_color};")
            #     else:
            #         css_color = color_map.get(notion_color)
            #         if css_color:
            #             styles.append(f"color: {css_color};")
            
            # # 스타일이 있다면 span 태그로 감싸기
            # if styles:
            #     html_open_tags += f'<span style="{ "".join(styles) }">'
            #     html_close_tags = '</span>' + html_close_tags

            # 나머지 어노테이션 처리 (HTML 태그 또는 Markdown)
            # 여기서는 Markdown을 우선하고, 색상만 HTML로 처리하는 예시입니다.
            # 만약 모든 스타일을 HTML로 통일하고 싶다면, bold 등도 <strong> 등으로 변경필요
            '''
            
            styled_content = content
            if annotations.get('code'):
                styled_content = f"`{styled_content}`"
            if annotations.get('bold'):
                styled_content = f"**{styled_content}**"
            if annotations.get('italic'):
                styled_content = f"*{styled_content}*"
            if annotations.get('strikethrough'):
                styled_content = f"~~{styled_content}~~"
            if annotations.get('underline'):
                 styled_content = f"<u>{styled_content}</u>" # HTML 밑줄

            text_chunk = html_open_tags + styled_content + html_close_tags
            
            if item['text'].get('link') and item['text']['link'].get('url'):
                markdown_chunks.append(f"[{text_chunk}]({item['text']['link']['url']})")
            else:
                markdown_chunks.append(text_chunk)

        elif item['type'] == 'mention':
            if item['mention']['type'] == 'page':
                 markdown_chunks.append(f"@[Page: {item['plain_text']}]")
            else:
                 markdown_chunks.append(item['plain_text'])
        elif item['type'] == 'equation':
            markdown_chunks.append(f"${item['equation']['expression']}$")

    return "".join(markdown_chunks)

# --- 개선된 이미지 다운로드 함수: 블록 ID 기반 파일명 사용 ---
def download_image_and_get_local_web_path(
        image_url: str, 
        image_block_id: str,  # 새로 추가: 이미지 블록의 고유 ID
        image_caption: str, 
        post_slug: str, 
        base_image_save_path: str, 
        base_web_path: str):
    
    if not image_url or not image_block_id:
        return None

    try:
        # 확장자 결정
        parsed_url = urlparse(image_url)
        original_filename = os.path.basename(parsed_url.path)
        filename_base, ext = os.path.splitext(original_filename)
        
        if not ext: # Presigned URL 등에서 확장자가 없는 경우 대비
            try:
                img_response_head = requests.head(image_url, timeout=5)
                content_type = img_response_head.headers.get('content-type')
                if content_type and 'image/' in content_type:
                    ext = '.' + content_type.split('/')[-1] # 예: .png, .jpeg
                    if ext == '.jpeg': ext = '.jpg' 
                else:
                    ext = '.png' # 기본값
            except Exception:
                ext = '.png' # 헤더 요청 실패 시 기본값

        # 블록 ID 기반 파일명 생성 (방안 2)
        # 블록 ID에서 하이픈 제거하여 깔끔한 파일명 생성
        clean_block_id = image_block_id.replace('-', '')
        final_filename = f"{clean_block_id}{ext}"

        # 게시물 슬러그별 폴더 생성
        post_image_save_dir = os.path.join(base_image_save_path, post_slug)
        os.makedirs(post_image_save_dir, exist_ok=True)
        
        local_image_disk_path = os.path.join(post_image_save_dir, final_filename)
        
        # 웹에서 접근할 최종 경로
        image_web_path = f"{base_web_path}/{post_slug}/{final_filename}"

        # 이미 파일이 존재하면 다운로드 건너뛰기
        if os.path.exists(local_image_disk_path):
            print(f"  Image already exists: {final_filename}, using web path: {image_web_path}")
            return image_web_path

        print(f"  Downloading image from {image_url} to {local_image_disk_path}")
        img_response = requests.get(image_url, stream=True, timeout=10)
        img_response.raise_for_status()
        
        with open(local_image_disk_path, 'wb') as out_file:
            shutil.copyfileobj(img_response.raw, out_file)
        del img_response
        print(f"  Successfully downloaded {final_filename}")
        return image_web_path

    except Exception as e:
        print(f"  Error downloading image {image_url}: {e}")
        return image_url # 다운로드 실패 시 원본 URL 반환 (만료될 수 있음)

# 커버 이미지 다운로드 함수 추가
def download_cover_image(
        cover_data: dict, 
        post_slug: str, 
        base_image_save_path: str, 
        base_web_path: str):
    """
    Notion 페이지의 커버 이미지를 다운로드합니다.
    """
    if not cover_data:
        return None
    
    cover_url = ""
    if cover_data.get('type') == 'external':
        cover_url = cover_data['external']['url']
    elif cover_data.get('type') == 'file':
        cover_url = cover_data['file']['url']
    
    if not cover_url:
        return None
    
    try:
        # 확장자 결정
        parsed_url = urlparse(cover_url)
        original_filename = os.path.basename(parsed_url.path)
        filename_base, ext = os.path.splitext(original_filename)
        
        if not ext:
            try:
                img_response_head = requests.head(cover_url, timeout=5)
                content_type = img_response_head.headers.get('content-type')
                if content_type and 'image/' in content_type:
                    ext = '.' + content_type.split('/')[-1]
                    if ext == '.jpeg': ext = '.jpg'
                else:
                    ext = '.png'
            except Exception:
                ext = '.png'

        # 커버 이미지는 "cover"라는 고정 파일명 사용
        final_filename = f"cover{ext}"

        # 게시물 슬러그별 폴더 생성
        post_image_save_dir = os.path.join(base_image_save_path, post_slug)
        os.makedirs(post_image_save_dir, exist_ok=True)
        
        local_image_disk_path = os.path.join(post_image_save_dir, final_filename)
        
        # 웹에서 접근할 최종 경로
        image_web_path = f"{base_web_path}/{post_slug}/{final_filename}"

        # 이미 파일이 존재하면 다운로드 건너뛰기
        if os.path.exists(local_image_disk_path):
            print(f"  Cover image already exists: {final_filename}")
            return image_web_path

        print(f"  Downloading cover image from {cover_url} to {local_image_disk_path}")
        img_response = requests.get(cover_url, stream=True, timeout=10)
        img_response.raise_for_status()
        
        with open(local_image_disk_path, 'wb') as out_file:
            shutil.copyfileobj(img_response.raw, out_file)
        del img_response
        print(f"  Successfully downloaded cover image: {final_filename}")
        return image_web_path

    except Exception as e:
        print(f"  Error downloading cover image {cover_url}: {e}")
        return None

# cleanup_unused_images 함수 수정 - 커버 이미지 보호
def cleanup_unused_images(post_slug: str, used_image_block_ids: set, base_image_save_path: str):
    """
    특정 게시물 폴더에서 현재 사용되지 않는 이미지 파일들을 삭제합니다.
    """
    post_image_dir = os.path.join(base_image_save_path, post_slug)
    
    if not os.path.exists(post_image_dir):
        return
    
    try:
        for filename in os.listdir(post_image_dir):
            if filename.startswith('.'):  # 숨김 파일 건너뛰기
                continue
                
            # 커버 이미지는 삭제하지 않음
            if filename.startswith('cover'):
                continue
                
            # 파일명에서 블록 ID 추출 (확장자 제거)
            name_without_ext = os.path.splitext(filename)[0]
            
            # 현재 사용 중인 블록 ID가 아니면 삭제
            if name_without_ext not in used_image_block_ids:
                file_path = os.path.join(post_image_dir, filename)
                os.remove(file_path)
                print(f"  Removed unused image: {filename}")
                
    except Exception as e:
        print(f"  Warning: Error during image cleanup for {post_slug}: {e}")

# convert_blocks_to_markdown_text 함수 수정 - 첫 번째 이미지 URL 반환 추가
def convert_blocks_to_markdown_text(blocks, post_slug: str, base_image_save_path: str, base_web_path: str, indent_level=0):
    
    markdown_lines = []
    used_image_block_ids = set()  # 사용된 이미지 블록 ID 추적
    first_image_url = None  # 첫 번째 이미지 URL 추적
    
    # 중첩 목록을 위한 들여쓰기 (기본적인 수준)
    indent = "  " * indent_level 

    for block in blocks:
        block_type = block['type']
        element = block.get(block_type, {})
        block_id = block.get('id', '')

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
            children_used_ids = set()
            children_first_image = None
            if block.get('has_children'):
                # 중첩된 블록 가져오기 (실제로는 get_page_content_as_markdown처럼 페이지네이션 처리 필요)
                child_blocks_response = notion.blocks.children.list(block_id=block['id'])
                children_markdown, children_used_ids, children_first_image = convert_blocks_to_markdown_text(
                    child_blocks_response.get('results', []), 
                    post_slug, 
                    base_image_save_path,
                    base_web_path,
                    indent_level + 1)
                used_image_block_ids.update(children_used_ids)
                if first_image_url is None and children_first_image:
                    first_image_url = children_first_image
            markdown_lines.append(f"{indent}- {text}")
            if children_markdown:
                markdown_lines.append(children_markdown)
        elif block_type == 'numbered_list_item':
            # 순서 있는 목록은 Markdown 렌더러가 번호를 자동으로 매기므로 '1.'로 시작해도 무방합니다.
            text = format_rich_text_array(element.get('rich_text', []))
            children_markdown = ""
            children_used_ids = set()
            children_first_image = None
            if block.get('has_children'):
                child_blocks_response = notion.blocks.children.list(block_id=block['id'])
                children_markdown, children_used_ids, children_first_image = convert_blocks_to_markdown_text(
                    child_blocks_response.get('results', []), 
                    post_slug, 
                    base_image_save_path,
                    base_web_path,
                    indent_level + 1)
                used_image_block_ids.update(children_used_ids)
                if first_image_url is None and children_first_image:
                    first_image_url = children_first_image
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
            original_url = ""
            if image_data.get('type') == 'external':
                original_url = image_data['external']['url']
            elif image_data.get('type') == 'file':
                original_url = image_data['file']['url']
            
            caption_text = format_rich_text_array(image_data.get('caption', []))
            alt_text = caption_text if caption_text else "image"
            
            if original_url and block_id:
                # 이미지 블록 ID를 사용된 ID 집합에 추가
                clean_block_id = block_id.replace('-', '')
                used_image_block_ids.add(clean_block_id)
                
                # 개선된 이미지 다운로드 함수 호출 (블록 ID 전달)
                final_image_url = download_image_and_get_local_web_path(
                    original_url, 
                    block_id,  # 블록 ID 전달
                    alt_text,
                    post_slug, 
                    base_image_save_path,
                    base_web_path
                )
                
                # 첫 번째 이미지 URL 저장
                if first_image_url is None and final_image_url:
                    first_image_url = final_image_url
                
                markdown_lines.append(f"{indent}![{alt_text}]({final_image_url})")
                if caption_text:
                     markdown_lines.append(f"{indent}*{caption_text}*")

            
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

    return "\n".join(processed_lines), used_image_block_ids, first_image_url

# get_page_content_as_markdown 함수 수정 - 첫 번째 이미지 URL 반환 추가
def get_page_content_as_markdown(page_id: str, post_slug: str, base_image_save_path: str, base_web_path: str):
    print(f"Fetching and converting content for page_id: {page_id} (slug: {post_slug})...")
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
        
        # convert_blocks_to_markdown_text 호출 시 사용된 이미지 ID와 첫 번째 이미지도 받기
        markdown_content, used_image_block_ids, first_image_url = convert_blocks_to_markdown_text(
            all_blocks, post_slug, base_image_save_path, base_web_path
        )
        
        # 사용하지 않는 이미지 파일 정리
        cleanup_unused_images(post_slug, used_image_block_ids, base_image_save_path)
        
        print(f"Successfully converted content for page_id: {page_id}.")
        return markdown_content, first_image_url
    except Exception as e:
        import traceback
        print(f"ERROR fetching or converting page content for page_id {page_id}")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {e}")
        traceback.print_exc()

        return f"Error converting content for page {page_id}. Check server logs for details.", None

# 메인 실행 부분 수정
if __name__ == "__main__":
    posts_data = get_published_blog_posts_from_notion()

    # --- 파일 저장을 위한 output_dir 설정 ---
    current_script_dir = os.path.dirname(__file__) 
    nextjs_project_name = "nextjs-blog" # <<--- Next.js 프로젝트 폴더 이름으로 변경!
    output_dir = os.path.abspath(os.path.join(current_script_dir, '..', nextjs_project_name, 'content', 'blog'))
    base_image_save_path = os.path.abspath(os.path.join(current_script_dir, '..', nextjs_project_name, 'public', 'images'))
    os.makedirs(base_image_save_path, exist_ok=True)

    # 웹에서 접근할 기본 이미지 경로 (public 폴더 기준)
    base_web_path = "/images"
    
    # 출력 디렉토리가 없으면 생성
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")

    for page in posts_data:
        page_id = page["id"]
        notion_last_edited_time_str = page.get("last_edited_time") # Notion의 마지막 수정 시간
        properties = page.get("properties", {})
        
        # 커버 이미지 정보 추출
        cover_data = page.get("cover")
        
        title_prop = properties.get("Title", {}).get("title", [])
        title = title_prop[0]["plain_text"] if title_prop else "제목 없음"
        
        slug_prop = properties.get("Slug", {}).get("rich_text", [])
        slug = slug_prop[0]["plain_text"] if slug_prop else page_id
        
        published_date_prop = properties.get("PublishedDate", {}).get("date", {})
        published_date = published_date_prop.get("start")
        
        tags_prop = properties.get("Tags", {}).get("multi_select", [])
        tags = [tag["name"] for tag in tags_prop]

        description_prop = properties.get("Description", {}).get("rich_text", [])
        description = description_prop[0]["plain_text"] if description_prop else ""

        print(f"\nProcessing Post: {title} (Notion last_edited_time: {notion_last_edited_time_str})")

        # 경로 탐색
        file_path = os.path.join(output_dir, f"{slug}.md")
        
        # 기존 .md 파일이 있다면, frontmatter에서 notion_last_edited_time 읽기
        local_last_edited_time_str = None
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    post_file = frontmatter.load(f)
                    local_last_edited_time_str = post_file.get('notion_last_edited_time')
            except Exception as e:
                print(f"Warning: Could not read frontmatter from local file {file_path}: {e}")

        # Notion의 last_edited_time과 로컬 파일의 frontmatter에 저장된 시간을 비교
        if notion_last_edited_time_str and local_last_edited_time_str == notion_last_edited_time_str:
            print(f"Skipping '{title}' as it has not been updated since last sync.")
            continue # 변경 없으면 다음 게시물로 넘어감

        print(f"Updating '{title}' as it's new or has been modified.")
        
        # 페이지 콘텐츠와 첫 번째 이미지 URL 가져오기
        markdown_content, first_image_url = get_page_content_as_markdown(page_id, slug, base_image_save_path, base_web_path)
        
        # 커버 이미지 다운로드 (우선순위 1)
        cover_image_url = download_cover_image(cover_data, slug, base_image_save_path, base_web_path)
        
        # 대표 이미지 결정: 커버 이미지가 있으면 커버 이미지, 없으면 첫 번째 이미지
        featured_image = cover_image_url if cover_image_url else first_image_url
        
        # --- Frontmatter 및 파일 저장 로직 ---
        # 제목에 따옴표가 있으면 YAML frontmatter가 깨질 수 있으므로 이스케이프 처리
        escaped_title = title.replace('"', '\\"')
        escaped_description = description.replace('"', '\\"')

        frontmatter_content = [
            "---",
            f'title: "{escaped_title}"',
            f'date: "{published_date if published_date else ""}"',
            f'tags: {json.dumps(tags, ensure_ascii=False)}', # JSON 배열 형태로 저장 (YAML 리스트와 호환)
            f'slug: "{slug}"',
            f'description: "{escaped_description}"',
            f'featured_image: "{featured_image if featured_image else ""}"', # 대표 이미지 추가
            f'notion_last_edited_time: "{notion_last_edited_time_str}"', # Notion의 마지막 수정 시간 저장
            "---",
            "" 
        ]
        full_content_to_save = "\n".join(frontmatter_content) + markdown_content
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(full_content_to_save)
            print(f"Successfully saved: {file_path}")
            if featured_image:
                print(f"Featured image: {featured_image}")
        except Exception as e:
            print(f"Error saving file {file_path}: {e}")

    print("\nSynchronization complete.")