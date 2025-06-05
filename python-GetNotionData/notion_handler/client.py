# Notion 클라이언트 초기화

import os
import sys
from notion_client import Client

from core import settings

notion_client = Client(auth=settings.NOTION_API_KEY)

def get_notion_client():
    return notion_client

# Notion API 연결 테스트
def test_notion_connection(notion_client):
    try:
        db_info = notion_client.databases.retrieve(database_id=settings.NOTION_DATABASE_ID)
        if db_info:
            print(f"Notion 데이터베이스 '{db_info.get('title')}'에 성공적으로 접근했습니다.")
            return True
        else:
            print("데이터베이스 정보를 가져왔으나 내용이 없습니다.")
            return False
    except Exception as e:
        print(f"Notion API 연결 테스트 실패: {e}")


if __name__ == '__main__':
    n = get_notion_client()
    test_notion_connection(n)