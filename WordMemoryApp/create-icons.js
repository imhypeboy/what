const fs = require('fs');
const path = require('path');

// SVG 아이콘 생성 함수
function createAppIcon() {
  const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 그라디언트 -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#74f1c3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a2f5d5;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.7" />
    </linearGradient>
  </defs>
  
  <!-- 배경 -->
  <rect width="1024" height="1024" rx="256" fill="url(#bgGradient)"/>
  
  <!-- 글래스 카드 효과 -->
  <rect x="128" y="200" width="768" height="500" rx="64" fill="url(#cardGradient)" stroke="rgba(255,255,255,0.3)" stroke-width="4"/>
  
  <!-- 단어 텍스트 -->
  <text x="512" y="380" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#2d2d2d">Word</text>
  
  <!-- 뜻 텍스트 -->
  <text x="512" y="520" font-family="Arial, sans-serif" font-size="80" text-anchor="middle" fill="#666666">단어</text>
  
  <!-- 하단 포인트 -->
  <circle cx="400" cy="620" r="12" fill="#74f1c3"/>
  <circle cx="450" cy="620" r="12" fill="#a2f5d5"/>
  <circle cx="500" cy="620" r="12" fill="#74f1c3"/>
  <circle cx="550" cy="620" r="12" fill="#a2f5d5"/>
  <circle cx="600" cy="620" r="12" fill="#74f1c3"/>
</svg>`;

  return iconSvg;
}

// 적응형 아이콘 (안드로이드용)
function createAdaptiveIcon() {
  const adaptiveSvg = `
<svg width="432" height="432" viewBox="0 0 432 432" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="adaptiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#74f1c3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a2f5d5;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 카드 -->
  <rect x="66" y="120" width="300" height="192" rx="24" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  
  <!-- 텍스트 -->
  <text x="216" y="190" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="#2d2d2d">A</text>
  <text x="216" y="240" font-family="Arial, sans-serif" font-size="32" text-anchor="middle" fill="#666666">가</text>
  
  <!-- 포인트들 -->
  <circle cx="186" cy="270" r="4" fill="#74f1c3"/>
  <circle cx="206" cy="270" r="4" fill="#a2f5d5"/>
  <circle cx="226" cy="270" r="4" fill="#74f1c3"/>
  <circle cx="246" cy="270" r="4" fill="#a2f5d5"/>
</svg>`;

  return adaptiveSvg;
}

// 스플래시 아이콘
function createSplashIcon() {
  const splashSvg = `
<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#74f1c3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a2f5d5;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 원형 배경 -->
  <circle cx="100" cy="100" r="100" fill="url(#splashGradient)"/>
  
  <!-- 카드 -->
  <rect x="30" y="50" width="140" height="100" rx="16" fill="rgba(255,255,255,0.9)"/>
  
  <!-- 텍스트 -->
  <text x="100" y="90" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#2d2d2d">Word</text>
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#666666">단어</text>
</svg>`;

  return splashSvg;
}

// SVG 파일들 생성
const assetsDir = path.join(__dirname, 'assets', 'images');

// 디렉토리가 없으면 생성
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 아이콘 파일들 생성
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), createAppIcon());
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.svg'), createAdaptiveIcon());
fs.writeFileSync(path.join(assetsDir, 'splash-icon.svg'), createSplashIcon());

console.log('🎨 아이콘 파일들이 생성되었습니다!');
console.log('📁 위치: assets/images/');
console.log('📝 파일: icon.svg, adaptive-icon.svg, splash-icon.svg');
console.log('');
console.log('💡 다음 단계:');
console.log('1. SVG를 PNG로 변환하거나');
console.log('2. 온라인 SVG to PNG 변환기 사용');
console.log('3. 또는 디자인 도구에서 PNG로 익스포트');
console.log('');
console.log('📏 필요한 크기:');
console.log('- icon.png: 1024x1024');
console.log('- adaptive-icon.png: 432x432');
console.log('- splash-icon.png: 200x200');
console.log('- favicon.png: 32x32');