# 📓 내 일기장 (Kids Diary App)

두 아이를 위한 일기장 앱 — 공부 / 독서 / 자유 일기 + 학습 목표 / 시험·수행평가 관리

**Live:** https://jwj-nick.github.io/diary-app/

## 기능

- **3종 일기**: 공부 (과목·시간·메모) / 독서 (책·평점·인용·생각) / 자유 (제목·본문)
- **학습 계획**: 공부 목표 (단계별 체크리스트) / 시험·수행평가 (준비 단계 + dueDate)
- **캘린더**: 한 달 그리드에 일기·목표·시험 inline 표시, D-day 카운트다운
- **사이드바**: Library / Planning 그룹화 + 최근 일기 5건
- **localStorage** (IndexedDB) 저장, soft delete, 검색, JSON export
- **PWA**: 폰 홈 화면 추가 가능, 오프라인 동작

## 스택

React 19 + Vite 8 + TypeScript 6 / Tailwind v4 / zustand / react-hook-form + zod / Radix UI / lucide-react / date-fns / idb / vite-plugin-pwa

## 개발

```bash
npm install --legacy-peer-deps
npm run dev      # http://localhost:5173/diary-app/
npm run build
```

## 배포

`main` 브랜치 push 시 GitHub Actions가 자동 빌드·배포.
