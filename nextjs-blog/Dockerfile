# Dockerfile (nextjs-blog/Dockerfile)

# 1. 빌드 환경 설정 (Node.js 버전은 프로젝트에 맞게 조정)
# LTS 버전 또는 프로젝트에서 사용하는 버전을 명시하는 것이 좋습니다.
# Alpine 이미지는 크기가 작지만, 일부 C++ 네이티브 모듈과 호환성 문제가 있을 수 있습니다.
# 일반적인 경우 -slim 버전도 좋은 선택입니다.
FROM node:20-bookworm-slim AS builder

# 작업 디렉터리 설정
WORKDIR /app

# 의존성 설치를 위해 package.json과 lock 파일 먼저 복사
# package-lock.json, yarn.lock, 또는 pnpm-lock.yaml 등 프로젝트에 맞는 lock 파일을 사용하세요.
COPY package.json ./
COPY package-lock.json ./
# COPY yarn.lock ./
# COPY pnpm-lock.yaml ./

# 의존성 설치 (프로덕션 의존성만 설치하여 이미지 크기 최적화 가능)
# npm ci는 package-lock.json을 기반으로 정확한 버전의 의존성을 설치합니다.
RUN npm ci
# RUN yarn install --frozen-lockfile
# RUN pnpm install --frozen-lockfile

# 프로젝트 전체 파일 복사
COPY . .

# 환경 변수 설정 (빌드 시점에 필요한 경우)
# 예: NEXT_PUBLIC_API_URL 등
# ENV NEXT_PUBLIC_SOME_VARIABLE=some_value

# Next.js 애플리케이션 빌드
RUN npm run build
# RUN yarn build
# RUN pnpm build


# 2. 프로덕션 환경 설정 (최종 실행 이미지)
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# 프로덕션 환경에서는 NODE_ENV를 'production'으로 설정하는 것이 중요합니다.
ENV NODE_ENV=production
# Next.js는 기본적으로 3000번 포트를 사용합니다.
EXPOSE 3000

# 빌드 결과물만 복사 (builder 스테이지에서)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
# COPY --from=builder /app/next.config.mjs ./next.config.mjs # next.config.mjs 파일도 필요하면 복사

# 애플리케이션 실행 명령어
# package.json의 "start" 스크립트가 "next start"를 실행하도록 되어 있어야 합니다.
CMD ["npm", "start"]
# CMD ["yarn", "start"]
# CMD ["pnpm", "start"]