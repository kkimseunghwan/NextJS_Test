# Notion 블록을 마크다운으로 변환 (기존 format_rich_text_array, convert_blocks_to_markdown_text 등)

import logging
from notion_client import Client 
from .image_handler import download_and_save_image 
from notion_handler import client

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Notion 클라이언트 초기화 (실제로는 notion_handler.client에서 가져와야 함)
notion_client_instance = client.get_notion_client()

# Notion의 rich_text 배열을 마크다운 문자열로 변환
def format_rich_text_array_for_markdown(rich_text_array):

    markdown_chunks = []
    for item in rich_text_array:
        content = ""
        if item['type'] == 'text':
            text_details = item.get('text') # .get()을 사용하여 안전하게 접근
            content = text_details.get('content', '') # 'content' 키가 없을 경우 빈 문자열
            annotations = item.get('annotations', {}) # 'annotations' 키가 없을 경우 빈 딕셔너리
            
            styled_content = content
            # (순서 중요) - 코드, 링크, 스타일 순으로 적용
            #               -> 중첩 스타일이 깨지지 않음
            if annotations.get('code'):
                styled_content = f"`{styled_content}`"
            
            # 링크 처리
            link_url = text_details.get('link', {}).get('url') if text_details.get('link') else None
            
            if link_url:
                # 스타일이 적용된 콘텐츠에 링크를 적용
                if annotations.get('bold'): styled_content = f"**{styled_content}**"
                if annotations.get('italic'): styled_content = f"*{styled_content}*"
                if annotations.get('strikethrough'): styled_content = f"~~{styled_content}~~"
                if annotations.get('underline'): styled_content = f"<u>{styled_content}</u>" # HTML 밑줄
                markdown_chunks.append(f"[{styled_content}]({link_url})")
                continue

            # 링크가 아닌 경우 스타일 적용
            if annotations.get('bold'):
                styled_content = f"**{styled_content}**"
            if annotations.get('italic'):
                styled_content = f"*{styled_content}*"
            if annotations.get('strikethrough'):
                styled_content = f"~~{styled_content}~~"
            if annotations.get('underline'):
                 styled_content = f"<u>{styled_content}</u>" # HTML 밑줄
            
            markdown_chunks.append(styled_content)

        elif item['type'] == 'equation':
            markdown_chunks.append(f"${item['equation']['expression']}$") # LaTeX 수식

    return "".join(markdown_chunks)



# Notion 페이지의 블록 리스트를 마크다운 텍스트로 변환
# 본문 내 이미지 다운로드 및 DB 저장 로직을 포함합니다.
def convert_blocks_to_markdown(
        notion_client_instance: Client,     # Notion 클라이언트 인스턴스
        page_id: str,                       # 현재 페이지 ID
        post_id: str,                       # DB에 저장된 게시물 ID (images.post_id)
        post_slug: str,                     # 이미지 저장 경로 및 웹 경로 구성용
        blocks=None,                        # 초기 호출 시 None, 재귀 호출 시 블록 리스트
        indent_level=0
    ):

    # 최상위 호출 시
    if blocks is None: 
        try:
            all_blocks_data = []
            next_cursor = None
            while True:
                response = notion_client_instance.blocks.children.list(
                    block_id=page_id, 
                    start_cursor=next_cursor
                )
                all_blocks_data.extend(response.get("results", []))
                next_cursor = response.get("next_cursor")
                if not next_cursor:
                    break

            blocks_to_process = all_blocks_data
            logging.info(f"페이지(ID: {page_id})에서 {len(blocks_to_process)}개의 블록을 가져왔습니다.")
        except Exception as e:
            logging.error(f"페이지(ID: {page_id})의 블록을 가져오는 중 오류 발생: {e}")
            return f"# Error fetching blocks for page {page_id}.", set()
    else: # 재귀 호출 시
        blocks_to_process = blocks

    markdown_lines = []
    used_image_block_ids_in_current_call = set() # 현재 호출 스코프에서 사용된 이미지 ID
    indent = "  " * indent_level

    for block in blocks_to_process:
        block_type = block['type']
        element = block.get(block_type, {})
        block_id = block.get('id', '') # 각 블록의 고유 ID

        # 각 블록 타입에 따른 마크다운 변환 로직
        if block_type == 'paragraph':
            text = format_rich_text_array_for_markdown(element.get('rich_text', []))
            if text.strip() or not markdown_lines or markdown_lines[-1]: # 비어있지 않거나, 첫 줄이 아니거나, 이전 줄이 공백이 아니면
                markdown_lines.append(indent + text)
                markdown_lines.append("") # 문단 간격
        elif block_type == 'heading_1':
            text = format_rich_text_array_for_markdown(element.get('rich_text', []))
            markdown_lines.append(f"# {text}\n")
        elif block_type == 'heading_2':
            text = format_rich_text_array_for_markdown(element.get('rich_text', []))
            markdown_lines.append(f"## {text}\n")
        elif block_type == 'heading_3':
            text = format_rich_text_array_for_markdown(element.get('rich_text', []))
            markdown_lines.append(f"### {text}\n")
        
        elif block_type == 'bulleted_list_item':
            text = format_rich_text_array_for_markdown(element.get('rich_text', []))
            markdown_lines.append(f"{indent}- {text}")
            if block.get('has_children'):
                child_md, child_img_ids = convert_blocks_to_markdown(
                    notion_client_instance, block['id'], post_id, post_slug, None, indent_level + 1
                )
                markdown_lines.append(child_md)
                used_image_block_ids_in_current_call.update(child_img_ids)
        
        elif block_type == 'numbered_list_item':
            # 순서 있는 목록은 Markdown 렌더러가 번호를 자동으로 매기므로 '1.'로 시작
            text = format_rich_text_array_for_markdown(element.get('rich_text', []))
            markdown_lines.append(f"{indent}1. {text}")
            if block.get('has_children'):
                child_md, child_img_ids = convert_blocks_to_markdown(
                    notion_client_instance, block['id'], post_id, post_slug, None, indent_level + 1
                )
                markdown_lines.append(child_md)
                used_image_block_ids_in_current_call.update(child_img_ids)

        elif block_type == 'quote':
            text = format_rich_text_array_for_markdown(element.get('rich_text', []))
            # 각 줄에 > 적용
            markdown_lines.extend([f"{indent}> {line}" for line in text.split('\n')])
            markdown_lines.append("") # 인용구 다음 간격

        elif block_type == 'code':
            text_content = element.get('rich_text', [])[0].get('plain_text', '') if element.get('rich_text') else ''
            language = element.get('language', 'plaintext')
            caption = format_rich_text_array_for_markdown(element.get('caption', []))
            markdown_lines.append(f"{indent}```{language}")
            markdown_lines.append(text_content)
            markdown_lines.append(f"{indent}```")
            if caption:
                markdown_lines.append(f"{indent}*{caption}*")
            markdown_lines.append("")

        elif block_type == 'divider':
            markdown_lines.append(f"{indent}--- \n")

        elif block_type == 'image':
            image_data = element
            original_url = ""
            if image_data.get('type') == 'external':
                original_url = image_data['external']['url']
            elif image_data.get('type') == 'file': # Notion 내부 파일 (만료되는 URL)
                original_url = image_data['file']['url']
            
            caption_text = format_rich_text_array_for_markdown(image_data.get('caption', []))
            alt_text = caption_text if caption_text else "image" # 캡션이 없으면 "image"
            
            if original_url and block_id:
                # image_handler.py의 함수 호출
                web_path = download_and_save_image(
                    image_url=original_url,
                    image_block_id=block_id, # Notion 블록 ID를 이미지 고유 ID로 사용
                    post_id=post_id,         # DB 게시물 ID
                    post_slug=post_slug,
                    image_caption=caption_text,
                    is_cover=False # 본문 내 이미지는 커버가 아님
                )
                if web_path:
                    markdown_lines.append(f"{indent}![{alt_text}]({web_path})")
                    if caption_text:
                        markdown_lines.append(f"{indent}*{caption_text}*")
                    markdown_lines.append("") # 이미지 다음 간격
                    used_image_block_ids_in_current_call.add(block_id)
                else:
                    logging.warning(f"이미지 처리 실패 (Block ID: {block_id}, URL: {original_url}). 마크다운에 원본 URL 포함 시도.")
                    # 실패 시, 만료될 수 있는 원본 URL이라도 포함하거나, 플레이스홀더를 넣을 수 있음
                    markdown_lines.append(f"{indent}![{alt_text}]({original_url}) ")
                    if caption_text:
                        markdown_lines.append(f"{indent}*{caption_text}*")
                    markdown_lines.append("")
            else:
                logging.warning(f"이미지 블록에 URL 또는 ID가 없습니다: {block}")
        

    # 연속된 빈 줄 제거 및 최종 마크다운 생성
    final_markdown_lines = []
    for i, line in enumerate(markdown_lines):
        # 현재 줄이 비어있고, 이전 줄도 비어있으면(이미 추가된 최종 라인 기준) 중복 빈 줄로 간주하여 건너뜀
        if not line.strip() and final_markdown_lines and not final_markdown_lines[-1].strip():
            continue
        final_markdown_lines.append(line)
    
    # 마지막 줄이 공백이면 제거 (선택적)
    if final_markdown_lines and not final_markdown_lines[-1].strip():
        final_markdown_lines.pop()

    return "\n".join(final_markdown_lines), used_image_block_ids_in_current_call


if __name__ == '__main__':
    # 이 모듈을 직접 테스트하려면, Notion 클라이언트 인스턴스와 테스트할 페이지 ID가 필요합니다.
    # main.py에서 이 함수를 호출하여 테스트하는 것이 더 용이할 수 있습니다.
    # 예시:
    # from notion_handler.client import get_notion_client
    # test_client = get_notion_client()
    # if test_client:
    #     test_page_id = "YOUR_TEST_NOTION_PAGE_ID" # 실제 테스트할 Notion 페이지 ID
    #     test_post_id_for_db = "db-post-id-example" # DB에 저장될 게시물 ID (예시)
    #     test_post_slug = "test-post-slug"
    #     md_content, img_ids = convert_blocks_to_markdown(
    #         test_client, test_page_id, test_post_id_for_db, test_post_slug
    #     )
    #     print("--- 변환된 마크다운 ---")
    #     print(md_content)
    #     print("\n--- 사용된 이미지 블록 ID ---")
    #     print(img_ids)
    # else:
    #     print("Notion 클라이언트 초기화 실패")
    pass