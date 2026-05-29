# K-Beauty Web

K-Beauty 상품 쇼핑몰 프로젝트의 프론트엔드입니다. HTML, CSS, Vanilla JavaScript로 구성된 정적 웹 프로젝트이며, Spring Boot 기반 WAS API와 연동해서 상품 조회, 로그인, 회원가입, 문의 작성, 마이페이지 기능을 제공합니다.

## 주요 기능

- 상품 목록 조회, 검색, 카테고리 필터
- 상품 상세 화면
- 회원가입 및 로그인
- 로그인 세션 복원 및 로그아웃
- 로그인 사용자 전용 문의 작성/조회
- 마이페이지에서 사용자 정보와 문의 내역 확인
- 화면 상단에 서버 배포 정보 표시
  - Host Name
  - Server IP
  - LB Header
  - Azure Zone
  - DB Host

## 기술 구성

- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome CDN
- 독립 정적 웹 서버 배포 가능
  - Apache
  - Nginx
  - Static hosting

## 파일 구조

```text
final_pj_web/
├── index.html          # 메인 상품 목록
├── detail.html         # 상품 상세
├── login.html          # 로그인
├── register.html       # 회원가입
├── inquiry.html        # 문의 작성 및 조회
├── mypage.html         # 마이페이지
├── main.html           # index.html 이동용 페이지
└── assets/
    ├── api.js          # API 공통 설정, 세션 복원, 서버 정보 표시
    ├── app.css         # 공통 스타일
    ├── auth.js         # 로그인/회원가입 처리
    ├── detail.js       # 상품 상세 렌더링
    ├── home.js         # 상품 목록 렌더링
    ├── inquiry.js      # 문의 기능
    ├── mypage.js       # 마이페이지 기능
    └── img/
        └── product-fallback.svg
```

## 로컬 실행

```bash
cd final_pj_web
python3 -m http.server 5501
```

브라우저에서 아래 주소로 접속합니다.

```text
http://127.0.0.1:5501/
```

## WAS API 주소 설정

기본 WAS API 주소는 `assets/api.js`에 설정되어 있습니다.

```javascript
baseUrl: localStorage.getItem("kbeautyApiBaseUrl") || "http://localhost:8080"
```

클라우드에 배포할 때는 아래 중 하나로 설정합니다.

- `assets/api.js`의 기본 주소를 실제 WAS 주소로 변경
- Nginx/Apache에서 `/api` 요청을 WAS로 프록시
- 브라우저 개발자 도구에서 `localStorage.kbeautyApiBaseUrl` 값을 실제 WAS 주소로 설정

## 배포 참고

- 프론트엔드는 정적 파일이므로 Apache, Nginx, Storage static website 등에 배포할 수 있습니다.
- 로그인 세션을 사용하므로 WAS의 CORS 설정과 쿠키 전달 설정이 프론트 도메인과 맞아야 합니다.
- HTTPS 환경에서는 프론트와 WAS 모두 HTTPS로 맞추는 것을 권장합니다.
