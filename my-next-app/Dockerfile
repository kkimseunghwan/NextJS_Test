# Dockerfile (Final Recommended Version)

# -----------------
# 1. 빌드 환경 설정 (Builder)
# -----------------
# 베이스 이미지로 호환성이 뛰어난 'bookworm-slim' 버전을 사용합니다.
FROM node:20-bookworm-slim AS builder

# 작업 디렉터리 설정
WORKDIR /app

# 의존성 설치를 위해 package.json과 lock 파일 먼저 복사 (Docker 캐시 활용)
COPY package.json package-lock.json ./
RUN npm ci

# 프로젝트 전체 파일 복사
COPY . .

# Next.js 애플리케이션을 빌드합니다.
# 이 때, next.config.ts의 'output: "standalone"' 설정이 빛을 발합니다.
RUN npm run build


# -----------------
# 2. 프로덕션 실행 환경 설정 (Runner)
# -----------------
# 최종 실행 이미지는 다시 깨끗하고 가벼운 이미지로 시작합니다.
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# 프로덕션 환경임을 명시합니다. (Next.js 최적화를 위해 필수)
ENV NODE_ENV=production

# 'builder' 스테이지에서 생성된 'standalone' 빌드 결과물만 복사합니다.
# 이 덕분에 node_modules 전체를 복사할 필요가 없어 이미지가 매우 가벼워집니다.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Next.js는 기본적으로 3000번 포트를 사용합니다.
EXPOSE 3000

# standalone 폴더 내의 server.js를 직접 실행하여 앱을 구동합니다.
CMD ["node", "server.js"]


# -----------------


# # 914MB 메모리 서버를 위한 초최적화 Dockerfile
# FROM node:18-alpine AS base
# RUN apk add --no-cache libc6-compat

# # 의존성 설치 단계
# FROM base AS deps
# WORKDIR /app
# COPY package*.json ./
# # 개발 의존성 제외하고 설치
# RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# # 빌드 단계 - 극한 메모리 최적화
# FROM base AS builder
# WORKDIR /app
# COPY --from=deps /app/node_modules ./node_modules
# COPY . .

# # 극한 메모리 제한 (914MB 서버용)
# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
# # 메모리 사용량을 512MB로 제한
# ENV NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"

# # Next.js 설정에서 메모리 최적화
# RUN echo 'module.exports = { \
#   output: "standalone", \
#   experimental: { optimizePackageImports: ["lucide-react"] }, \
#   images: { unoptimized: true }, \
#   compiler: { removeConsole: true }, \
#   webpack: (config) => { \
#     config.optimization.minimize = true; \
#     config.cache = false; \
#     return config; \
#   } \
# }' > next.config.js

# # 병렬 처리 제한하여 빌드
# RUN npm run build || (echo "Build failed, trying with more restrictions..." && \
#     NODE_OPTIONS="--max-old-space-size=400 --optimize-for-size" npm run build)

# # 런타임 단계 - 최소 이미지
# FROM node:18-alpine AS runner
# WORKDIR /app

# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
# # 런타임은 더 적은 메모리 사용
# ENV NODE_OPTIONS="--max-old-space-size=256"

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# # 빌드 결과물만 복사
# COPY --from=builder /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# USER nextjs

# EXPOSE 3000
# ENV PORT 3000
# ENV HOSTNAME "0.0.0.0"

# CMD ["node", "server.js"]