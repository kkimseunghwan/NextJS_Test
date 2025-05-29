# 파일/디렉터리 관련 헬퍼 함수 (경로 생성 등)

import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 주어진 경로에 디렉터리가 없으면 생성
def ensure_directory_exists(directory_path):
    if not os.path.exists(directory_path):
        try:
            os.makedirs(directory_path)
            logging.info(f"디렉터리 생성됨: {directory_path}")
        except OSError as e:
            logging.error(f"디렉터리 생성 실패 ({directory_path}): {e}")
            raise Exception(f"디렉터리 생성 실패 ({directory_path}): {e}")
