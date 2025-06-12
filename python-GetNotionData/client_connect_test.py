# client_connect_test.py
import socket
import threading
import time

SERVER_HOST = '118.221.41.35' # 또는 실제 서버 IP
SERVER_PORT = 8080
NUM_CONNECTIONS = 1 # 동시 연결 시도 수 (2~5 정도로 시작)

def connect_to_server(thread_id):
    s = None
    try:
        print(f"[Thread {thread_id}] Attempting to connect...")
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(10) # 10초 연결 타임아웃
        s.connect((SERVER_HOST, SERVER_PORT))
        print(f"[Thread {thread_id}] Connected successfully.")

        # 메시지 전송
        message = f"Hello from thread {thread_id}\n"
        s.sendall(message.encode())
        print(f"[Thread {thread_id}] Sent: {message.strip()}")

                # 서버 응답 대기
        while True:
            try:
                data = s.recv(1024)
                if data:
                    print(f"[Thread {thread_id}] Received: {data.decode().strip()}")
                else:
                    break
            except socket.timeout:
                print(f"[Thread {thread_id}] No response received within timeout")
                break
    except ConnectionRefusedError:
        print(f"[Thread {thread_id}] Connection refused.")
    except Exception as e:
        print(f"[Thread {thread_id}] Error: {e}")
    finally:
        if s:
            s.close()
        print(f"[Thread {thread_id}] Connection closed.")

if __name__ == "__main__":
    threads = []
    for i in range(NUM_CONNECTIONS):
        thread = threading.Thread(target=connect_to_server, args=(i + 1,))
        threads.append(thread)
        thread.start() 
        time.sleep(0.01) # 스레드 생성 간 아주 약간의 딜레이

    for thread in threads:
        thread.join()
    print("--- All client threads finished ---")