import mysql.connector
from mysql.connector import errorcode
import logging
from . import settings 

# 로깅 설정
# 일반적인 print문과는 다름(*)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_db_connection():
    try:
        #MySQL DB연결
        conn = mysql.connector.connect(
            host=settings.DB_HOST,           # 데이터베이스 서버 주소
            user=settings.DB_USER,           # 데이터베이스 사용자 이름
            password=settings.DB_PASSWORD,   # 데이터베이스 비밀번호
            database=settings.DB_NAME,       # 연결할 데이터베이스 이름
            port=settings.DB_PORT            # 서버 포트
        )
        
        if conn.is_connected():
            logging.info("MySQL 데이터베이스에 성공적으로 연결되었습니다.")
            return conn
        
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            logging.error("MySQL 접근 권한 오류: 사용자 이름 또는 비밀번호가 잘못되었습니다.")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            logging.error(f"데이터베이스 '{db_Settings.DB_NAME}'가 존재하지 않습니다.")
        else:
            logging.error(f"MySQL 연결 오류: {err}")
        return None

def close_db_connection(conn, cursor=None):
    """MySQL 데이터베이스 연결을 닫습니다."""
    if cursor:
        cursor.close()
    if conn and conn.is_connected():
        conn.close()
        logging.info("MySQL 데이터베이스 연결이 닫혔습니다.")

def init_db_schema():
    """데이터베이스 스키마(테이블)를 초기화합니다."""
    conn = get_db_connection()
    if not conn:
        logging.error("DB 스키마 초기화 실패: 데이터베이스에 연결할 수 없습니다.")
        return

    cursor = conn.cursor()
    
    # CREATE TABLE SQL 문
    # MySQL은 IF NOT EXISTS를 지원하므로 여러 번 실행해도 안전합니다.
    
    posts_table_sql = """
    CREATE TABLE IF NOT EXISTS posts (
        id CHAR(36) PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content MEDIUMTEXT,
        post_type VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        published_date DATE NOT NULL,
        featured_image VARCHAR(512),
        notion_last_edited_time DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """

    images_table_sql = """
    CREATE TABLE IF NOT EXISTS images (
        id CHAR(36) PRIMARY KEY,
        post_id CHAR(36) NOT NULL,
        local_path VARCHAR(512) NOT NULL,
        web_path VARCHAR(512) UNIQUE NOT NULL,
        caption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """

    tags_table_sql = """
    CREATE TABLE IF NOT EXISTS tags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """

    post_tags_table_sql = """
    CREATE TABLE IF NOT EXISTS post_tags (
        post_id CHAR(36) NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (post_id, tag_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    
    try:
        logging.info("테이블 생성을 시작합니다...")
        cursor.execute(posts_table_sql)
        logging.info("'posts' 테이블이 준비되었습니다.")
        cursor.execute(images_table_sql)
        logging.info("'images' 테이블이 준비되었습니다.")
        cursor.execute(tags_table_sql)
        logging.info("'tags' 테이블이 준비되었습니다.")
        cursor.execute(post_tags_table_sql)
        logging.info("'post_tags' 테이블이 준비되었습니다.")
        conn.commit()
        logging.info("DB 스키마 초기화가 성공적으로 완료되었습니다.")
    except mysql.connector.Error as err:
        logging.error(f"테이블 생성 중 오류 발생: {err}")
        conn.rollback() # 오류 발생 시 롤백
    finally:
        close_db_connection(conn, cursor)

#  게시물 데이터를 posts 테이블에 삽입
def upsert_post(post_data):

    conn = get_db_connection()
    if not conn:
        return False

    cursor = conn.cursor()

    sql = """
    INSERT INTO posts (id, slug, title, description, content, post_type, category, published_date, featured_image, notion_last_edited_time)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        slug = VALUES(slug),
        title = VALUES(title),
        description = VALUES(description),
        content = VALUES(content),
        post_type = VALUES(post_type),
        category = VALUES(category),
        published_date = VALUES(published_date),
        featured_image = VALUES(featured_image),
        notion_last_edited_time = VALUES(notion_last_edited_time),
        updated_at = CURRENT_TIMESTAMP;
    """
    try:
        cursor.execute(sql, (
            post_data['id'],
            post_data['slug'],
            post_data['title'],
            post_data.get('description'), # Optional
            post_data.get('content'),     # Optional
            post_data['post_type'],
            post_data.get('category'),    # Optional
            post_data['published_date'],
            post_data.get('featured_image'), # Optional
            post_data['notion_last_edited_time']
        ))
        conn.commit()
        logging.info(f"게시물 '{post_data['title']}' (ID: {post_data['id']}) 정보가 DB에 저장/업데이트되었습니다.")
        return True
    except mysql.connector.Error as err:
        logging.error(f"게시물 '{post_data['title']}' 저장/업데이트 중 오류 발생: {err}")
        conn.rollback()
        return False
    except KeyError as e:
        logging.error(f"게시물 저장/업데이트 실패: post_data에 필수 키 '{e}'가 누락되었습니다.")
        return False
    finally:
        close_db_connection(conn, cursor)

# 특정 게시물 ID의 Notion 최종 수정 시간을 DB에서 가져오기 (데이터 업데이트 진행 기준이됨)
def get_post_notion_last_edited_time(post_id):

    conn = get_db_connection()
    if not conn:
        return None

    cursor = conn.cursor(dictionary=True) # 결과를 딕셔너리로 받기
    try:
        cursor.execute("SELECT notion_last_edited_time FROM posts WHERE id = %s", (post_id,))
        result = cursor.fetchone()
        if result:
            return result['notion_last_edited_time']
        return None
    except mysql.connector.Error as err:
        logging.error(f"게시물(ID: {post_id})의 최종 수정 시간 조회 중 오류 발생: {err}")
        return None
    finally:
        close_db_connection(conn, cursor)

# 태그 테이블에서 검색, 없으면 새로 생성, 해당 태그 ID 반환
def get_or_create_tag_id(cursor, tag_name):

    cursor.execute("SELECT id FROM tags WHERE name = %s", (tag_name,))
    result = cursor.fetchone()
    
    if result:
        return result[0] # 튜플값 반환됨 -> 0번째값
    else:
        # 태그가 존재하지 않으면 새로 삽입
        cursor.execute("INSERT INTO tags (name) VALUES (%s)", (tag_name,))
        return cursor.lastrowid 


# post_tags테이블에 연결 정보 생성
def link_tags_to_post(post_id, tag_names):

    conn = get_db_connection()
    if not conn:
        return False

    cursor = conn.cursor()
    
    try:
        # 1. 해당 post_id에 대한 기존 연결 정보는 모두 삭제 후 새로 추가
        # => 단순화
        cursor.execute("DELETE FROM post_tags WHERE post_id = %s", (post_id,))
        
        # 2. 각 태그 이름에 대해 ID를 가져오거나 생성하여 post_tags에 연결
        if tag_names: # 태그가 있는 경우에만 처리
            for tag_name in tag_names:
                tag_name_trimmed = tag_name.strip() # 태그 이름 앞뒤 공백 제거
                if not tag_name_trimmed: # 빈 태그 이름은 건너뛰기
                    continue
                
                tag_id = get_or_create_tag_id(cursor, tag_name_trimmed)
                if tag_id:
                    # post_tags 테이블에 연결 정보 삽입 (중복 시 무시)
                    # PRIMARY KEY (post_id, tag_id)로 인해 이미 존재하면 에러 발생 가능
                    # => INSERT IGNORE를 사용 - 중복되지 않는 데이터만 삽입
                    cursor.execute(
                        "INSERT IGNORE INTO post_tags (post_id, tag_id) VALUES (%s, %s)",
                        (post_id, tag_id)
                    )
            logging.info(f"게시물(ID: {post_id})에 대한 태그 연결이 업데이트되었습니다: {tag_names}")
        else:
            logging.info(f"게시물(ID: {post_id})에 연결할 태그가 없습니다. 기존 연결이 삭제되었습니다.")

        conn.commit()
        return True
    except mysql.connector.Error as err:
        logging.error(f"게시물(ID: {post_id}) 태그 연결 중 오류 발생: {err}")
        conn.rollback()
        return False
    except Exception as e: # 더 일반적인 예외 처리
        logging.error(f"게시물(ID: {post_id}) 태그 연결 중 예상치 못한 오류: {e}")
        conn.rollback()
        return False
    finally:
        close_db_connection(conn, cursor)

# 이미지 정보를 images 테이블에 삽입
def upsert_image_info(image_data):
    
    conn = get_db_connection()
    if not conn:
        return False

    cursor = conn.cursor()
    
    sql = """
    INSERT INTO images (id, post_id, local_path, web_path, caption)
    VALUES (%s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        post_id = VALUES(post_id),
        local_path = VALUES(local_path),
        web_path = VALUES(web_path),
        caption = VALUES(caption),
        created_at = CURRENT_TIMESTAMP; 
    """
    try:
        cursor.execute(sql, (
            image_data['id'],
            image_data['post_id'],
            image_data['local_path'],
            image_data['web_path'],
            image_data.get('caption') 
        ))
        conn.commit()
        logging.info(f"이미지 정보(ID: {image_data['id']}, Post ID: {image_data['post_id']})가 DB에 저장/업데이트되었습니다.")
        return True
    except mysql.connector.Error as err:
        logging.error(f"이미지 정보(ID: {image_data['id']}) 저장/업데이트 중 오류 발생: {err}")
        conn.rollback()
        return False
    except KeyError as e:
        logging.error(f"이미지 정보 저장/업데이트 실패: image_data에 필수 키 '{e}'가 누락되었습니다.")
        return False
    finally:
        close_db_connection(conn, cursor)


# 특정 게시물 ID에 연결된 모든 이미지의 ID(Notion block ID) 목록을 DB에서 가져옵니다
def get_image_ids_for_post(post_id):

    conn = get_db_connection()
    if not conn:
        return []

    cursor = conn.cursor()
    image_ids = []
    try:
        cursor.execute("SELECT id FROM images WHERE post_id = %s", (post_id,))
        results = cursor.fetchall()
        image_ids = [row[0] for row in results]
    except mysql.connector.Error as err:
        logging.error(f"게시물(ID: {post_id})의 이미지 ID 목록 조회 중 오류 발생: {err}")
    finally:
        close_db_connection(conn, cursor)
    return image_ids

def get_image_local_path(image_id):
    """특정 이미지 ID (Notion block ID)의 로컬 저장 경로를 DB에서 가져옵니다."""
    conn = get_db_connection()
    if not conn:
        return None
    
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT local_path FROM images WHERE id = %s", (image_id,))
        result = cursor.fetchone()
        if result:
            return result[0]
        return None
    except mysql.connector.Error as err:
        logging.error(f"이미지(ID: {image_id})의 로컬 경로 조회 중 오류 발생: {err}")
        return None
    finally:
        close_db_connection(conn, cursor)

# 특정 이미지 ID에 해당하는 정보를 images 테이블에서 삭제
def delete_image_info_by_id(image_id):
    
    conn = get_db_connection()
    if not conn:
        return False

    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM images WHERE id = %s", (image_id,))
        conn.commit()
        if cursor.rowcount > 0:
            logging.info(f"이미지 정보(ID: {image_id})가 DB에서 삭제되었습니다.")
        else:
            logging.info(f"삭제할 이미지 정보(ID: {image_id})가 DB에 없습니다.")
        return True
    except mysql.connector.Error as err:
        logging.error(f"이미지 정보(ID: {image_id}) 삭제 중 오류 발생: {err}")
        conn.rollback()
        return False
    finally:
        close_db_connection(conn, cursor)


if __name__ == '__main__':
    # 이 파일을 직접 실행하면 DB 스키마를 초기화합니다.
    # 실제 운영 환경에서는 main.py에서 필요에 따라 호출하도록 합니다.
    print("DB 스키마 초기화를 시도합니다...")
    init_db_schema()
