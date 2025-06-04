# python-GetNotionData/Dockerfile

# 1. 베이스 이미지 선택 (프로젝트에 맞는 Python 버전 선택)
FROM python:3.10-slim 
# 또는 FROM python:3.9-slim 등, requirements.txt와 호환되는 버전

# 2. 작업 디렉터리 설정
WORKDIR /app/script

# 3. 필요한 파일 복사
#    requirements.txt를 먼저 복사하여 의존성 설치 레이어를 캐시할 수 있도록 함
COPY requirements.txt ./
# COPY core/settings.py ./core/  # 만약 settings.py가 필요하다면, 또는 .env를 사용한다면 .env 복사
# COPY .env ./ # .env 파일을 이미지에 포함시키는 것은 권장되지 않음 (아래 환경변수 주입 참고)

# 4. 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 5. 스크립트 전체 복사
#    .dockerignore 파일을 사용하여 불필요한 파일은 제외
COPY . .

# 6. (선택 사항) 스크립트 실행 시 사용할 기본 명령어 (docker run 또는 docker-compose run 시 사용)
# CMD ["python", "main.py"] 
# 위 CMD는 docker-compose.yml에서 command로 오버라이드 하거나, 
# 주기적 실행 시에는 cron에서 직접 `docker exec` 또는 `docker run`으로 실행하므로 필수는 아님