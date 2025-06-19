# Dockerfile (914MB 메모리 서버 최적화 버전)

# -----------------
# 1. 빌드 환경 설정 (Builder) - 메모리 최적화
# -----------------
# Alpine Linux 사용으로 메모리 사용량 최소화
FROM node:20-alpine AS builder

# 필요한 패키지만 설치
RUN apk add --no-cache libc6-compat

# 작업 디렉터리 설정
WORKDIR /app

# 의존성 설치를 위해 package.json과 lock 파일 먼저 복사 (Docker 캐시 활용)
COPY package.json package-lock.json ./

# 프로덕션 의존성만 설치하고 캐시 정리
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# 프로젝트 전체 파일 복사
COPY . .

# 메모리 제한 환경 변수 설정 (914MB 서버용)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 빌드 시 메모리 사용량을 512MB로 제한
ENV NODE_OPTIONS="--max-old-space-size=512 --optimize-for-size"

# Next.js 빌드 최적화 설정을 동적으로 생성
RUN echo 'const nextConfig = { \
  output: "standalone", \
  experimental: { \
    optimizePackageImports: ["lucide-react"], \
  }, \
  images: { \
    unoptimized: true, \
    deviceSizes: [640, 750, 828, 1080], \
    imageSizes: [16, 32, 48, 64, 96, 128], \
    quality: 75 \
  }, \
  compiler: { \
    removeConsole: true \
  }, \
  webpack: (config, { dev, isServer }) => { \
    if (!dev && !isServer) { \
      config.optimization.minimize = true; \
      config.cache = false; \
    } \
    return config; \
  } \
}; \
module.exports = nextConfig;' > next.config.js

# Next.js 애플리케이션을 메모리 제한과 함께 빌드
# 실패 시 더 낮은 메모리로 재시도
RUN npm run build || \
    (echo "First build failed, retrying with lower memory..." && \
     NODE_OPTIONS="--max-old-space-size=400 --optimize-for-size" npm run build) || \
    (echo "Second build failed, retrying with minimal memory..." && \
     NODE_OPTIONS="--max-old-space-size=300 --optimize-for-size --gc-interval=100" npm run build)

# -----------------
# 2. 프로덕션 실행 환경 설정 (Runner) - 경량화
# -----------------
# 최종 실행 이미지도 Alpine으로 경량화
FROM node:20-alpine AS runner

# 보안을 위한 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# 런타임 메모리 사용량을 256MB로 제한
ENV NODE_OPTIONS="--max-old-space-size=256"

# 'builder' 스테이지에서 생성된 빌드 결과물만 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# nextjs 사용자로 실행
USER nextjs

# Next.js는 기본적으로 3000번 포트를 사용합니다.
EXPOSE 3000

# 포트와 호스트 설정
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 헬스체크 추가 (선택사항)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# standalone 폴더 내의 server.js를 직접 실행하여 앱을 구동합니다.
CMD ["node", "server.js"]