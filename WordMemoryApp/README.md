# 단어 암기장 📚

자격증 시험 대비를 위한 효과적인 단어 암기 앱입니다.

## ✨ 주요 기능

- **📱 글래스모피즘 디자인**: 세련된 iOS 16 스타일 UI
- **🃏 스와이프 카드**: 직관적인 좌우 스와이프로 암기/재학습 선택
- **📊 학습 진도 관리**: 실시간 학습 통계 및 진도율 확인
- **🎯 시험 모드**: 퀴즈 형태의 테스트 기능
- **💾 로컬 저장**: 오프라인에서도 사용 가능한 데이터 저장

## 🛠️ 기술 스택

- **React Native + Expo**: 크로스 플랫폼 앱 개발
- **TypeScript**: 타입 안전성
- **Expo Router**: 네이티브 네비게이션
- **AsyncStorage**: 로컬 데이터 저장
- **React Native Reanimated**: 부드러운 애니메이션
- **Expo Linear Gradient**: 그라디언트 효과

## 📦 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# Android 에뮬레이터/디바이스에서 실행
npm run android

# iOS 시뮬레이터에서 실행
npm run ios
```

## 🏗️ 프로덕션 빌드

### Android APK 빌드
```bash
# EAS CLI 설치 (처음 한 번만)
npm install -g @expo/eas-cli

# EAS 로그인
eas login

# 프로덕션 APK 빌드
eas build --platform android --profile production-apk
```

### 플레이스토어 AAB 빌드
```bash
# 플레이스토어용 AAB 빌드
eas build --platform android --profile production
```

## 🎨 디자인 특징

- **민트 컬러 (#74f1c3)**: 브랜드 키 컬러
- **유리구슬 질감**: 3D 플로팅 액션 버튼
- **포토 스타일 카드**: 단어 카드의 사진 같은 질감
- **iOS 세그먼트 컨트롤**: 상단 네비게이션

## 📱 앱 구조

```
app/
├── index.tsx                 # 메인 앱 (세그먼트 네비게이션)
├── (tabs)/
│   ├── index.tsx            # 단어장 관리
│   ├── study.tsx            # 학습 화면
│   ├── test.tsx             # 시험 모드
│   └── progress.tsx         # 진도 관리
components/
├── GlassContainer.tsx       # 글래스모피즘 컨테이너
├── SwipeableWordCard.tsx    # 스와이프 카드
├── FloatingActionButton.tsx # 유리구슬 FAB
├── SegmentedControl.tsx     # iOS 세그먼트
└── TossButton.tsx          # Toss 스타일 버튼
```

## 🚀 배포

1. **앱 아이콘 설정**: `assets/images/` 폴더의 아이콘들 확인
2. **앱 정보 수정**: `app.json`에서 앱 이름, 설명 등 수정
3. **빌드**: `eas build` 명령어로 빌드
4. **플레이스토어 업로드**: 생성된 AAB 파일을 Google Play Console에 업로드

## 📄 라이선스

MIT License

---

**개발자**: WordMemory Team  
**버전**: 1.0.0  
**최종 업데이트**: 2024년