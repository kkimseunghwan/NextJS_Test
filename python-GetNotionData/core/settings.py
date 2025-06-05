import os
from dotenv import load_dotenv

# 프로젝트 루트를 기준으로 .env 파일 로드. .env 파일은 두 단계 상위에 위치하게 됩니다.

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# Notion API Keys
NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
NOTION_DATABASE_ID = os.environ.get('NOTION_DATABASE_ID')

# MySQL DB Connection Info
DB_HOST = os.environ.get('DB_HOST', 'mysql_db')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_NAME = os.environ.get('DB_NAME')
DB_PORT = int(os.environ.get('DB_PORT', 3306)) # MySQL 기본 포트

# Image Storage Path (Host Path)
# 이 경로는 Python 스크립트가 실행되는 환경(호스트)에서 이미지를 저장할 실제 물리적 경로입니다.
# Docker를 사용한다면, 이 경로가 Docker 컨테이너로 볼륨 마운트될 수 있습니다.
IMAGE_HOST_STORAGE_PATH = os.environ.get('IMAGE_HOST_STORAGE_PATH')

# Next.js API 라우트를 통해 접근될 이미지 기본 웹 경로
IMAGE_WEB_BASE_PATH = "/api/images"

# 유효성 검사 (필수 환경 변수)
required_settings = {
    "NOTION_API_KEY": NOTION_API_KEY,
    "NOTION_DATABASE_ID": NOTION_DATABASE_ID,
    "DB_USER": DB_USER,
    "DB_PASSWORD": DB_PASSWORD,
    "DB_NAME": DB_NAME
}

missing_settings = [key for key, value in required_settings.items() if not value]
if missing_settings:
    raise ValueError(f"필수 환경 변수가 설정되지 않았습니다: {', '.join(missing_settings)}")

print("환경 변수 로드 완료:")
print(f"  NOTION_API_KEY: {'설정됨' if NOTION_API_KEY else '누락됨'}")
print(f"  NOTION_DATABASE_ID: {'설정됨' if NOTION_DATABASE_ID else '누락됨'}")
print(f"  DB_HOST: {DB_HOST}")
print(f"  DB_USER: {'설정됨' if DB_USER else '누락됨'}")
print(f"  DB_PASSWORD: {'설정됨' if DB_PASSWORD else '누락됨'}")
print(f"  DB_NAME: {'설정됨' if DB_NAME else '누락됨'}")
print(f"  DB_PORT: {DB_PORT}")
print(f"  IMAGE_HOST_STORAGE_PATH: {IMAGE_HOST_STORAGE_PATH}")
