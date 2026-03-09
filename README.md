# 동국대학교 약학대학 학생복지시스템

동국대학교 약학대학 학생복지물품의 대여·반납·관리를 위한 웹 시스템입니다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Python · FastAPI |
| ORM | SQLAlchemy 2.0 |
| 데이터베이스 | SQLite3 |
| 프론트엔드 | React 18 · TypeScript · Vite · React Router 6 |
| 상태관리 | Zustand |
| 인증 | JWT (PyJWT) |
| QR 스캔 | html5-qrcode |
| QR 생성 | qrcode.react |

---

## 디렉터리 구조

```
.
├── backend/
│   ├── app/
│   │   ├── auth/           # JWT 토큰 생성·검증
│   │   ├── models/         # SQLAlchemy ORM 모델
│   │   ├── routers/        # FastAPI 라우터 (auth / categories / items / rentals)
│   │   ├── schemas/        # Pydantic 요청·응답 스키마
│   │   ├── main.py         # FastAPI 앱 진입점
│   │   ├── database.py     # 엔진·세션 설정
│   │   └── config.py       # 환경변수 로드
│   ├── requirements.txt
│   └── .env                # SECRET_KEY 등 비밀정보
├── frontend/
│   ├── src/
│   │   ├── api/            # axios 호출 함수 (auth / categories / items / rentals)
│   │   ├── components/     # Navbar, QRScanner
│   │   ├── store/          # Zustand 상태 관리 (authStore)
│   │   ├── types/          # TypeScript 타입 정의
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── App.tsx         # 라우팅 루트
│   │   └── App.css         # 글로벌 스타일
│   ├── index.html          # Vite 진입점
│   ├── vite.config.ts      # Vite 설정
│   ├── tsconfig.json       # TypeScript 설정
│   ├── package.json
│   └── .env                # VITE_API_URL
└── README.md
```

---

## 시작하기

### 백엔드

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

> 백엔드와 프론트엔드를 **별도 터미널**에서 동시에 실행해야 합니다.

---

## 기본 관리자 계정

백엔드가 처음 시작되면 자동으로 아래 관리자 계정이 생성됩니다.

| 학번 | 이름 |
|------|------|
| admin | 관리자 |

---

## API 엔드포인트

### 인증 (Auth)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/v1/auth/register` | 회원가입 (학번+이름) | 없음 |
| POST | `/api/v1/auth/login` | 로그인 | 없음 |

### 카테고리

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/v1/categories/` | 카테고리 목록 | 없음 |
| GET | `/api/v1/categories/{id}` | 단일 카테고리 | 없음 |
| POST | `/api/v1/categories/` | 카테고리 추가 | 관리자 |
| PUT | `/api/v1/categories/{id}` | 카테고리 수정 | 관리자 |
| DELETE | `/api/v1/categories/{id}` | 카테고리 삭제 | 관리자 |

### 물품

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/v1/items/` | 전체 물품 목록 | 없음 |
| GET | `/api/v1/items/category/{id}` | 카테고리별 물품 + 대여 여부 | 없음 |
| GET | `/api/v1/items/uuid/{uuid}` | UUID로 물품 조회 | 없음 |
| POST | `/api/v1/items/` | 물품 추가 | 관리자 |
| PUT | `/api/v1/items/{id}` | 물품 수정 | 관리자 |
| DELETE | `/api/v1/items/{id}` | 물품 삭제 | 관리자 |

### 대여·반납

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/v1/rentals/` | 대여 (item_uuid 필요) | 로그인 |
| POST | `/api/v1/rentals/return` | 반납 (item_uuid 필요) | 로그인 |
| GET | `/api/v1/rentals/my` | 본인 대여기록 | 로그인 |
| GET | `/api/v1/rentals/` | 전체 대여기록 | 관리자 |

---

## 페이지 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 홈 (카테고리) | 카테고리 목록 버튼 |
| `/items/:id` | 물품 목록 | 카테고리별 물품과 대여 가능 여부 |
| `/rental` | 대여/반납 | QR 스캔 또는 UUID 수동 입력 |
| `/my-rentals` | 내 대여기록 | 본인 대여 현황 |
| `/admin/items` | 관리자 — 물품 | 물품 CRUD + QR 코드 생성 |
| `/admin/categories` | 관리자 — 카테고리 | 카테고리 CRUD |

---

## 대여 플로우

1. 관리자가 물품을 추가하고 QR코드를 출력
2. 학생이 **대여** 탭 → QR 스캔 (또는 테스트용 UUID 직접 입력)
3. 시스템이 대여기록을 생성 (기본 반납기한: 7일)
4. 반납 시 동일하게 QR 스캔 후 완료
