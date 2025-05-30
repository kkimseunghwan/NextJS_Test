import mysql.connector
import os
from dotenv import load_dotenv
import threading
import time
import random

load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST_PYTHON_TEST') or os.getenv('DB_HOST') or 'localhost',
    'user': os.getenv('DB_USER_PYTHON_TEST') or os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD_PYTHON_TEST') or os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME_PYTHON_TEST') or os.getenv('DB_NAME'),
    'port': int(os.getenv('DB_PORT_PYTHON_TEST') or os.getenv('DB_PORT') or 3306),
    'connection_timeout': 60, # Python connector의 연결 타임아웃 (초)
    'read_timeout': 60,       # 읽기 타임아웃 (초) 추가
}

# 테스트할 쿼리 (posts.ts의 getTagsForPost와 유사)
SQL_GET_TAGS_FOR_POST = """
    SELECT t.name
    FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = %s
"""

# 테스트할 게시물 ID 목록 (실제 DB에 있는 ID로 채워야 함)
# Next.js 로그에서 ETIMEDOUT이 발생했던 ID들을 사용해보는 것도 좋음
# 예시: test_post_ids = ["20206c66-1e82-8033-ba02-e7b6b8beb72b", "20206c66-1e82-8001-8f01-e273c411f1aa", ...]
# 우선 DB에서 모든 post id를 가져와서 사용
def get_all_post_ids_for_test():
    cnx = None
    try:
        cnx = mysql.connector.connect(**DB_CONFIG)
        cursor = cnx.cursor()
        cursor.execute("SELECT id FROM posts LIMIT 20") # 테스트를 위해 일부만 가져오기
        return [row[0] for row in cursor.fetchall()]
    except mysql.connector.Error as err:
        print(f"Error fetching post_ids for test: {err}")
        return []
    finally:
        if cnx and cnx.is_connected():
            cursor.close()
            cnx.close()

test_post_ids = get_all_post_ids_for_test()
if not test_post_ids:
    print("테스트할 post_id가 없습니다. 스크립트를 종료합니다.")
    exit()

# worker_task 함수 수정 제안 (연결 테스트 집중)
def worker_task(thread_id, placeholder_id):
    cnx = None
    connect_start_time = time.time()
    try:
        print(f"[Thread {thread_id}] Attempting to connect...")
        cnx = mysql.connector.connect(**DB_CONFIG) # DB_CONFIG에 connection_timeout 설정
        connect_end_time = time.time()
        print(f"[Thread {thread_id}] Connection established in {connect_end_time - connect_start_time:.4f} seconds.")
        time.sleep(0.1) # 아주 짧은 시간 연결 유지
    except mysql.connector.Error as err:
        print(f"[Thread {thread_id}] DB Connection Error: {err}")
        # 오류 객체의 상세 내용 출력
        if hasattr(err, 'errno'): print(f"[Thread {thread_id}] Errno: {err.errno}")
        if hasattr(err, 'sqlstate'): print(f"[Thread {thread_id}] SQLSTATE: {err.sqlstate}")
        if hasattr(err, 'msg'): print(f"[Thread {thread_id}] Message: {err.msg}")
    except Exception as e:
        print(f"[Thread {thread_id}] Non-DB Error: {type(e).__name__} - {e}")
    finally:
        if cnx and cnx.is_connected():
            cnx.close()
            # print(f"[Thread {thread_id}] Connection closed.")

if __name__ == "__main__":
    threads = []
    num_concurrent_requests = 10 # 동시에 실행할 요청 수 (MySQL max_connections 고려)

    print(f"테스트할 post_id 개수: {len(test_post_ids)}")
    print(f"동시 요청 수: {num_concurrent_requests}")

    if len(test_post_ids) < num_concurrent_requests:
        print("DB에 있는 post_id 개수가 동시 요청 수보다 적습니다. post_id를 반복 사용합니다.")
        target_ids_for_threads = [test_post_ids[i % len(test_post_ids)] for i in range(num_concurrent_requests)]
    else:
        target_ids_for_threads = test_post_ids[:num_concurrent_requests]


    for i in range(num_concurrent_requests):
        post_id_for_thread = target_ids_for_threads[i]
        thread = threading.Thread(target=worker_task, args=(i + 1, post_id_for_thread))
        threads.append(thread)
        thread.start()
        time.sleep(0.05) # 스레드 생성 간 약간의 딜레이 (선택적)

    for thread in threads:
        thread.join()

    print("\n--- All threads finished ---")

    # scp soldesk@180.80.107.4:/home/hwan/mysql_connect_debug.pcap C:\Users\soldesk\Downloads\
    


    # sudo tcpdump -i any host 180.80.107.4 and port 8080 -w server_capture.pcap
    # scp hwan@118.221.41.35:/home/hwan/mysql_connect_debug.pcap C:\Users\soldesk\Downloads\



# sudo grep --color=always -i 'UFW BLOCK' /var/log/syslog
# 명령어에 대한 출력된 로그

# 2025-05-30T08:34:16.644781+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52577 PROTO=2
# 2025-05-30T08:36:16.646347+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52578 PROTO=2
# 2025-05-30T08:38:16.648280+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52579 PROTO=2
# 2025-05-30T08:40:16.649386+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52580 PROTO=2
# 2025-05-30T08:42:16.650921+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52581 PROTO=2
# 2025-05-30T08:44:16.652886+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52582 PROTO=2
# 2025-05-30T08:46:16.663083+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52583 PROTO=2
# 2025-05-30T08:48:15.293639+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=57615 DF PROTO=TCP SPT=57640 DPT=8080 WINDOW=0 RES=0x00 ACK RST URGP=0
# 2025-05-30T08:48:16.661726+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52584 PROTO=2
# 2025-05-30T08:50:16.660515+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52585 PROTO=2
# 2025-05-30T08:52:16.670851+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52586 PROTO=2
# 2025-05-30T08:52:18.678162+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=59386 DF PROTO=TCP SPT=2094 DPT=8080 WINDOW=1026 RES=0x00 ACK FIN URGP=0
# 2025-05-30T08:52:21.084753+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=59394 DF PROTO=TCP SPT=2094 DPT=8080 WINDOW=1026 RES=0x00 ACK FIN URGP=0
# 2025-05-30T08:52:35.504764+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=59410 DF PROTO=TCP SPT=2094 DPT=8080 WINDOW=0 RES=0x00 ACK RST URGP=0
# 2025-05-30T08:54:16.682775+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52587 PROTO=2
# 2025-05-30T08:56:16.672225+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52588 PROTO=2
# 2025-05-30T08:56:40.416469+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=221.178.85.33 DST=192.168.0.56 LEN=1012 TOS=0x00 PREC=0x00 TTL=40 ID=1714 DF PROTO=TCP SPT=40337 DPT=22 WINDOW=229 RES=0x00 ACK PSH URGP=0
# 2025-05-30T08:56:46.411528+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=221.178.85.33 DST=192.168.0.56 LEN=64 TOS=0x00 PREC=0x00 TTL=40 ID=12618 DF PROTO=TCP SPT=56552 DPT=22 WINDOW=229 RES=0x00 ACK PSH URGP=0
# 2025-05-30T08:56:46.548156+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=221.178.85.33 DST=192.168.0.56 LEN=1012 TOS=0x00 PREC=0x00 TTL=40 ID=12620 DF PROTO=TCP SPT=56552 DPT=22 WINDOW=229 RES=0x00 ACK PSH URGP=0
# 2025-05-30T08:56:52.675415+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=221.178.85.33 DST=192.168.0.56 LEN=1012 TOS=0x00 PREC=0x00 TTL=40 ID=63400 DF PROTO=TCP SPT=53274 DPT=22 WINDOW=229 RES=0x00 ACK PSH URGP=0
# 2025-05-30T08:57:27.411571+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=60125 DF PROTO=TCP SPT=3002 DPT=8080 WINDOW=1026 RES=0x00 ACK FIN URGP=0
# 2025-05-30T08:57:28.020561+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=60135 DF PROTO=TCP SPT=3002 DPT=8080 WINDOW=1026 RES=0x00 ACK FIN URGP=0
# 2025-05-30T08:57:29.219790+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=60139 DF PROTO=TCP SPT=3002 DPT=8080 WINDOW=1026 RES=0x00 ACK FIN URGP=0
# 2025-05-30T08:57:36.427657+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=60162 DF PROTO=TCP SPT=3002 DPT=8080 WINDOW=1026 RES=0x00 ACK FIN URGP=0
# 2025-05-30T08:57:46.038066+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=3c:7c:3f:5d:ad:f6:88:36:6c:d4:67:92:08:00 SRC=180.80.107.4 DST=192.168.0.56 LEN=40 TOS=0x00 PREC=0x00 TTL=114 ID=60467 DF PROTO=TCP SPT=3002 DPT=8080 WINDOW=0 RES=0x00 ACK RST URGP=0
# 2025-05-30T08:58:16.672707+00:00 hwan-server kernel: [UFW BLOCK] IN=eno2 OUT= MAC=01:00:5e:00:00:01:88:36:6c:d4:67:92:08:00 SRC=192.168.0.1 DST=224.0.0.1 LEN=28 TOS=0x00 PREC=0xC0 TTL=1 ID=52589 PROTO=2