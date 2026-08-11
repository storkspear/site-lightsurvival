const $=(id)=>{
  const el=document.getElementById(id);
  if(el)return el;
  // 없는 섹션 — **떨어져 있는 진짜 캔버스**를 돌려준다. 더미 객체를 쓰면
  // parentElement·getContext 같은 데서 터진다(실제로 터졌다). 진짜 요소면
  // 조립 코드가 그대로 돌고, 문서에 안 붙었으니 IntersectionObserver 가
  // 영영 「보임」을 안 알려 **그리기 비용이 0** 이다.
  const w=document.createElement("div"),c=document.createElement("canvas");
  w.appendChild(c);return c;};

const TAU=Math.PI*2,R=Math.random;
const hash=n=>{const s=Math.sin(n*127.1)*43758.5453;return s-Math.floor(s);};
// 3단 계조 팔레트 — 진한 바탕 / 중간 / 흰 앞날. 셀 스타일의 전부다.
const TONE={
  // 무속성 — **회백색.** 이 게임의 「빛」은 색이 없는 것이라야, 속성을 먹는
  // 것이 「빛이 색을 입는다」로 읽힌다. 금빛으로 두면 무속성 자체가 하나의
  // 속성처럼 보여, 다섯 속성과 같은 층에 서 버린다(2026-08-09 판정).
  // ⚠️ 백광과 너무 비슷했다(2026-08-10). 둘 다 흰빛이라 **둘레 밀도**만으로
  // 갈리게 뒀더니 정지 화면에서 헷갈렸다 — **명도로 한 단 더 벌린다.**
  //   무속성 base 명도 .50 · lit .70   (회색빛 — 세 번 내렸다)
  //   백광   base 명도 .95 · lit 1.00  (순백)
  // 무속성은 「아직 색이 없는 것」이고 백광은 「모든 색이 합쳐진 것」이라,
  // 밝기 차이가 그대로 「덜 가진 것 ↔ 다 가진 것」으로 읽힌다.
  gold:["#1E1E23","#73737F","#A6A6B2"],
  amber:["#5E2408","#FF7A2A","#FFEBD2"],
  frost:["#123A5E","#4FC3F7","#E8F8FF"],
  // 뇌 — **노랑.** 다만 염(주황 25°)과 붙지 않게 **차가운 레몬 쪽**(55°)으로
  // 민다. 색상 30° 차이는 나란히 놓았을 때 갈리는 최소치다.
  volt :["#4A3606","#FFE03A","#FFFCE0"],
  toxin:["#123D1C","#57D96B","#E6FFEA"],
  gale :["#0F3D3A","#5FD9C6","#E4FFFA"],
  ember:["#5E1A06","#FF6A1E","#FFE7CC"],
  // 그림자 — **유일하게 어두워지는 속성.** 밝은 앞날이 없다는 것이 정체성이라
  // 세 값의 명도 차가 작은 유일한 예외이고, 화면에서 「덜 보이는」 것이 그대로
  // 대가로 읽힌다(스펙 §3-B: 빛이 꺼진다).
  shade:["#0E060F","#2E1840","#6B4E8C"],
  // ── 융화 10 — **제3의 속성** ─────────────────────────────────────────
  // 부모 색을 평균 내지 않는다. 평균은 언제나 부모 사이에 끼어 **부모와 안
  // 갈린다.** 제3의 속성은 부모에 없던 축을 하나씩 갖는다 — 탁함 · 금속 ·
  // 창백 · 자홍 · 극단 명도.
  // 백광 — 다섯을 **다 거친** 최종. 무속성(회백, 채도 .05)보다 더 희고 밝다.
  // 시작과 끝이 같은 색이면 안 되므로 둘을 명도로 가른다(0.89 vs 1.00).
  white  :["#5A5A70","#F2F2FF","#FFFFFF"],
  aqua   :["#08243F","#3D8FE0","#DCF0FF"],  // 수 水   210° 깊은 파랑(빙은 밝은 하늘)
  // 플라즈마 — **290° 청자.** 염(20°)·불씨(15°)가 이미 불 계열을 채웠고,
  // 여기 하나를 더 두면 셋이 한 덩어리가 된다(2026-08-09 반려 두 번).
  // 실제 플라즈마 구가 청자색이라 물리에도 맞다. 어둠(268°)과 25° 떨어져
  // 있고 명도가 정반대(어둠 0.55 / 여기 1.00)라 나란히 놓아도 안 붙는다.
  blast  :["#2A0B3E","#E14CFF","#FFE8FF"],
  // 연(煙) → **타르(역청)**. 염+독을 「연기」로 보면 탁함이 정체인데 탁하면
  // 안 보이는 모순에 걸린다(여러 번 반려). 끈적하게 **타는 검은 것**으로 보면
  // 열여섯 중 **매달리고 떨어지는** 유일한 물성이 생기고, 색상환이 꽉 찬
  // 상황에서 **검정**이 충돌을 피하는 유일한 길이기도 하다.
  // 검은 것이 검은 배경에서 보이는 것은 **타는 앞날**(주황) 덕이다 —
  // 어둠(影)이 밝은 림으로 보이는 것과 같은 장치.
  // ⚠️ 3단 계조에서 **바깥이 코어의 테두리**가 된다. 바깥을 검정으로 두니
  // 검은 배경에서 별 윤곽이 사라졌다(2026-08-10). 바깥을 **타는 붉은색**으로
  // 올리면 「몸은 검고 테두리만 탄다」가 되어 타르의 정체와도 맞는다:
  //   바깥 검붉음(타는 테) → 중간 거의 검정(몸) → 안 주황(아직 뜨거운 심)
  //
  // ⚠️ 계조를 뒤집어 **속을 검정, 중간을 초록**으로도 해 봤는데 반려됐다 —
  // 초록이 코어에 들어가니 독(毒) 쪽으로 끌려가 타르로 안 읽혔다. 초록은
  // 바닥빛과 날아다니는 알갱이에만 남긴다.
  smoke  :["#9E2E0A","#180F09","#E8802E"],
  fstorm :["#1C0A06","#C4451A","#FFE4B0"],
  magnet :["#0E1430","#6E8AE8","#E4EAFF"],  // 자 磁   228° 강철빛
  plague :["#14231A","#9EC49A","#F0F7EA"],  // 역 疫   105° 창백 — 병색
  snow   :["#34506B","#C6E4F5","#FFFFFF"],  // 설 雪   205° 극저채도 + 파란 그림자
  numb   :["#3A0A2E","#E040A0","#FFD9F0"],  // 마 痲   320° 자홍 — 화면에 없던 색
  thunder:["#33200C","#D9A860","#FFF0D0"],  // 뢰명 雷鳴 40° 황동 — 종의 색
  murk   :["#26300E","#A8C43C","#EEFFC0"],
  // 타르 — 염+독 후보. **거의 검다.** 색상환이 꽉 차 있어 검정이 충돌을 피하는
  // 유일한 길이고, 검은 것이 검은 배경에서 보이게 하는 것은 **타는 앞날**이다
  // (어둠 影 이 밝은 림으로 보이는 것과 같은 장치).
  tar    :["#0A0705","#3A2413","#E8802E"],   // smoke 와 같은 값 — 한 벌이라야 한다  // 장 瘴   75° 황록 — 연과 명도로 갈린다
  // ── 무기 고유색 17 ──────────────────────────────────────────────────
  // 캐릭터 속성 하나가 무기 전부를 물들이니 **어느 무기가 나가는지 구별이
  // 안 되고 화면이 밋밋해졌다**(2026-08-09 실기 판정). 무기는 자기 색을
  // 갖고, 물들이는 것은 **그 무기에 부여한 속성**뿐이다.
  //
  // 물리 8 = 금빛 계열 변주(성흔 정체성을 안 깬다) / 마법 9 = 각자 색.
  // 단 **유도탄은 무속성 회백 그대로**다(2026-08-10 사용자 지시) — 아래 참조.
  // ⚠️ 벌리는 것은 **dark 층**이다. 3단 계조에서 흰 앞날은 폭의 24%뿐이고
  // 눈에 들어오는 넓이는 제일 바깥 dark 가 가진다 — 여기를 안 벌리면
  // 「다 똑같은 금색」으로 보인다(2026-08-09 실기 판정, 두 번째).
  // 색상환 8°~52° 를 쓴다: 붉은 구리 ↔ 창백한 백금. 전부 「따뜻한 금속」이라
  // 성흔 정체성은 안 깨지되, 나란히 놓으면 여덟이 다 갈린다.
  wBolt   :["#6B4A12","#FFB43C","#FFF3D6"],  // 빛파동 · 금 45°
  wOrbit  :["#6B3A08","#FF9A2E","#FFE9C6"],  // 공전 · 호박 30°
  wSmg    :["#6E6440","#F0DCB0","#FFFBF0"],  // 빛따발총 · 백금 50° 저채도
  // 유도탄에는 고유색이 없다 — WTONE 이 무속성(gold)으로 떨어뜨린다. 아래 참조.
  // ⚠️ 빛산탄총·빛폭탄은 **붉은끼를 뺐다**(2026-08-10 사용자 판정: 「염 색상
  // 같은데」). 실측하면 겹친 게 맞았다 — 빛폭탄 lit 은 `#FF6A22`, 화염(ember)
  // lit 은 `#FF6A1E` 로 **사실상 같은 색**이었고 빛산탄총 22° 는 염(amber)
  // 22° 와 같은 색상각이었다. 그래서 **속성이 이미 붙은 무기**로 읽혔다.
  //
  // 무속성 회백(gold)으로 떨어뜨려도 봤지만 그건 **너무 어둡다** — 이름에
  // 「빛」이 들어간 무기는 광선검·빛따발총처럼 **밝아야** 한다(같은 판정).
  // 은청백으로도 가 봤지만 그것도 아니었다: 「빛」은 **노란 계열**이라야
  // 빛따발총과 한 식구로 읽힌다(2026-08-10 최종).
  //
  // 그래서 규칙은 이렇다 — **속성은 고채도 색상(hue)으로 말하고, 물리 무기는
  // 같은 노랑~금 대역 안에서 명도·채도로 말한다.** 염 22°·화염 20° 는 채도
  // 100% 라, 45~50° 저채도에 두면 색상과 채도 양쪽으로 갈린다.
  wScatter:["#6E6224","#F5E28C","#FFFBE2"],  // 빛산탄총 · 담금 50° 중저채도
  wSaber  :["#7A6E52","#FFEBC8","#FFFEF8"],  // 광선검 · 흰금 48° 창백
  // ⚠️ 레이저도 **밝은 노랑 계열로 맞췄다**(2026-08-10 사용자 지시). 황금
  // 42° 고채도(#FFCC2E, 채도 82%)는 빛따발총·빛산탄총 옆에 놓으면 혼자
  // 「금속 금색」이라 「빛」 계열에서 튀었다. 채도를 40%대로 눌러
  // 빛산탄총(#F5E28C)·빛따발총(#F0DCB0)과 같은 식구로 붙인다.
  wLance  :["#6E6428","#F3E296","#FFFCE6"],  // 레이저 · 담금 49° 중저채도
  // ⚠️ 빛폭탄은 **base(제일 어두운 단)를 올려야** 밝아진다(2026-08-10 사용자
  // 판정: 「다른 계열의 밝음 같은데, 어두워 보임」). lit 를 아무리 올려도
  // 소용이 없었는데, 이 무기는 큰 덩어리(celPuff·celHoop)를 칠해서 **화면을
  // 채우는 것이 base** 이기 때문이다 — 빛따발총·산탄총은 가는 줄기라 base 가
  // 윤곽선으로만 보여 같은 값이어도 밝게 읽힌다. 같은 색 세 단이라도
  // **어느 단이 면적을 먹는지**가 밝기를 정한다.
  wSunpo  :["#7A6E3A","#EFDC96","#FFFBEA"],  // 순포 · 담금 46°
  // 각성의 가운데 굵은 탄 — **파란 광탄**(2026-08-10 사용자 지시).
  // ⚠️ 빙(frost, 시안 200°)과 안 겹치게 **군청 쪽 220°** 로 민다. 무기색이
  // 속성색과 겹치면 「이 탄은 이미 빙이 붙었다」로 읽힌다(빛폭탄이 화염과
  // 같은 색이던 사고와 같은 함정).
  wSunpoHv:["#14335E","#5FA8FF","#EAF4FF"],
  // 각성한 순포의 **판·잔탄** 색. 금색 판에 파란 탄을 얹었더니 보색이라
  // 싸웠다(2026-08-10 사용자 판정: 「노랑이랑 파랑 2개가 잘 안 어울리네」).
  // 두 계열을 섞는 대신 **각성이면 통째로 청백으로 벼려진다** — 한 계열 안의
  // 명암 차라야 조화롭고, 「각성했다」가 색 하나로 한눈에 읽힌다.
  // 판은 저채도 청회백, 가운데 셀만 위의 고채도 파랑이라 대비가 계열 안에서 난다.
  wSunpoAwk:["#1E3050","#93B8E4","#EDF5FF"],  // 순포 · 담금 46° (판이 넓어 조금 차분하게)
  wBunroe :["#6A6A2E","#E8EE9A","#FCFFE2"],  // 분뢰 · 담황록 62° (실이 여럿이라 조금 차갑게)
  wShotgun:["#A0925A","#F7E8A8","#FFFDF0"],  // 빛폭탄 · 담금 48° (base 를 올렸다)
  mSanctum:["#0C4038","#3FD1B0","#E2FFF7"],  // 성역 · 청록
  mPulse  :["#0E3560","#5AC8FF","#E6F6FF"],  // 파문 · 하늘
  mFall   :["#6A5410","#FFE9A8","#FFFCEC"],  // 낙광 · 흰금
  mArc    :["#2A1358","#9B6BFF","#F2E9FF"],  // 뇌광 · 보라
  mPillar :["#3A2064","#C89BFF","#F8F0FF"],  // 광주 · 연보라
  mWard   :["#0C3A48","#4FD9E8","#E4FCFF"],  // 결계 · 청옥
  mWisp   :["#2C4410","#A8E85A","#F2FFDC"],  // 정령 · 연두
  mFlare  :["#5A4A34","#FFF4E0","#FFFFFF"],  // 개안 · 순백
  mIgnite :["#5E2408","#FF7A2A","#FFEBD2"],  // 점화 · 주황
  // ── 방어 · 저주 · 회복 (2026-08-11) ────────────────────────────────────
  // 일반 공격 10 이 「따뜻한 금속 변주」로 한 벌이 되듯, **분류마다 색의
  // 온도를 갖는다.** 페이지가 갈려 있어 나란히 볼 일이 없는데도 이렇게 묶는
  // 이유는, 3택 카드와 장비 랙에서는 **분류가 한 화면에 섞이기** 때문이다 —
  // 거기서 「이건 방어 카드다」가 색으로 먼저 읽혀야 한다.
  //   방어 = 차갑고 단단한 것(유리·강철·암석). 명도 대비가 크다 — 막는 것.
  //   저주 = 어둠에서 자란 것. 중간층 채도가 한 단 낮다 — 병든 것.
  //   회복 = 몸으로 돌아오는 빛. 앞날이 거의 흰색이다.
  //
  // 방어 5 — 무채 / 222 / 150 / 30 / 350. 결계(mWard 187°)와 30° 이상 벌린다.
  gChain  :["#22242A","#8A8F9C","#EDEFF5"],  // 사슬 · 무채 강철 — 쇠는 색이 없다
  gMirror :["#0E2352","#5A8CFF","#DCE8FF"],  // 경면 · 코발트 222°
  gGale   :["#1E4A40","#6FEBB6","#E8FFF4"],  // 질풍 · 박하 150°
  gBoulder:["#2E2014","#B4834A","#F2DEC0"],  // 거암 · 암갈 30° 저채도
  gKarma  :["#40101C","#F0506E","#FFE0E6"],  // 응보 · 진홍 350°
  // 저주 5 — 280 / 80 / 200 / 45 / 어둠.
  cCurse  :["#1A0620","#8A3AD0","#E8CCFF"],  // 저주 · 자주 280° — 어둠의 사촌
  cPlague :["#12200E","#7FA83A","#E8F5C8"],  // 역병 · 병든 황록 80°
  cShackle:["#0E2434","#5A9AB0","#DCF0F8"],  // 속박 · 납빛 청 200° — 쇠와 서리
  cSeal   :["#3A2A06","#D8B028","#FFF0C0"],  // 봉인 · 탁한 호박 45°
  // 암막 — 어둠 계열이되 **앞날은 밝다.** 세 층을 다 어둡게 두면 검은 적 위에
  // 씌운 표식이 통째로 사라진다 — 어둠(影)이 검은 배경에서 보이는 이유가
  // 밝은 림인 것과 같다.
  cVeil   :["#0A0812","#453458","#C0A8E8"],
  // 회복 4 — 28 / 95 / 195 / 320.
  hDawn   :["#5A2A10","#FFB86A","#FFF3E0"],  // 여명 · 새벽 주황 28°
  hReap   :["#26400E","#9CE05A","#F0FFD8"],  // 수확 · 새싹 95°
  hPurity :["#0E3A4A","#5FD8F0","#E8FDFF"],  // 정화 · 씻는 물 195°
  hTithe  :["#3A0A28","#E060B0","#FFE0F4"],  // 공물 · 자금 320° — 대가의 색
};

/// 무기 id → 고유색. 없는 id 는 무속성(gold = 회백)으로 떨어진다.
///
/// **유도탄만 고유색을 안 준다**(2026-08-10 사용자 지시: "무속성 색상으로").
/// 장미금(15°)이었는데, 그리는 코드가 전부 `"gold"` 라 무속성으로 보일 것
/// 같지만 아니다 — 이 표가 `RECOLOR` 를 걸어 [TK] 가 "gold" 를 통째로
/// 무기색으로 바꿔치기하므로, 칠해지는 것은 회백이 아니라 장미금이었다.
/// `"gold"` 로 두면 그 바꿔치기가 제자리걸음이 되어 무속성이 그대로 나온다.
const WTONE={bolt:"wBolt",orbit:"wOrbit",smg:"wSmg",seeker:"gold",
  scatter:"wScatter",saber:"wSaber",lance:"wLance",shotgun:"wShotgun",
  bunroe:"wBunroe",sunpo:"wSunpo",
  sanctum:"mSanctum",pulse:"mPulse",lightfall:"mFall",arc:"mArc",
  pillar:"mPillar",ward:"mWard",wisp:"mWisp",flare:"mFlare",ignite:"mIgnite",
  // 궁극기 보조 칸 셋 — **개안과 같은 팔레트를 쓴다.** 논거를 그리는 칸이라
  // 색이 다르면 「다른 궁극기」로 읽히고, 종수를 하나로 정한 판단이 무너진다.
  ultGauge:"mFlare",ultGlobal:"mFlare",ultWindow:"mFlare",
  // 방어 5 — 결계(mWard)는 위에 이미 있다.
  chain:"gChain",mirror:"gMirror",gale:"gGale",boulder:"gBoulder",karma:"gKarma",
  // 저주 5 · 회복 4
  curse:"cCurse",plague:"cPlague",shackle:"cShackle",seal:"cSeal",veil:"cVeil",
  dawn:"hDawn",reap:"hReap",purity:"hPurity",tithe:"hTithe"};
/// 두 색을 섞는다(0=a, 1=b). 순포의 열 색이 **끊기지 않고** 노랑→주황→빨강
/// 으로 넘어가려면 단계별 팔레트가 아니라 보간이 필요하다 — 단계로 두면
/// 「달아오른다」가 아니라 「색이 바뀌었다」로 보인다.
const mixHex=(a,b,k)=>{const p=(h,i)=>parseInt(h.slice(1+i*2,3+i*2),16);
  const v=i=>Math.round(p(a,i)+(p(b,i)-p(a,i))*Math.max(0,Math.min(1,k)));
  return"#"+[0,1,2].map(i=>v(i).toString(16).padStart(2,"0")).join("");};
const mixTone=(A0,B0,k)=>[0,1,2].map(i=>mixHex(A0[i],B0[i],k));
const A=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return`rgba(${r},${g},${b},${a})`;};
// 무기의 기본색은 "gold". 속성을 먹으면 이 한 줄이 팔레트를 통째로 갈아끼운다
// — 무기를 하나도 안 고치고 17종이 전부 물든다. 게임에서도 같은 구조다.
let RECOLOR=null;
const TK=k=>(RECOLOR&&k==="gold")?RECOLOR:k;

// ── 무기 레벨 ─────────────────────────────────────────────────────────────
// 시그니처 17개를 고치는 대신 전역 하나로 둔다(RECOLOR 와 같은 수법).
// 성장표가 칸마다 이 값을 세팅하고 그린다.
//
// **레벨은 새 그림이 아니라 변화 하나다.** 68줄을 분류하면
//   수치 34 (파라미터만) · 표식 17 (성질이 보이는 최소 자국) · 격상 17 (만렙)
// 이고, 모든 무기가 정확히 표식 1 + 격상 1 로 떨어진다 — 스펙이 "무기당
// 순수 수치 레벨 최대 1개"를 강제한 결과다.
let LV=1;

// 팔레트 조회 — 속성 하나가 3단 계조 한 벌을 통째로 정한다.
//
// ⚠️ 한때 「앞날(제일 밝은 층)만 흰색 고정」안을 시험했다가 버렸다:
// 그 층은 리본 폭의 **24%** 뿐이라 168px 타일에서 4px 차이 — 눈으로
// 구별이 안 된다. 가독성 문제의 진짜 원인은 색이 아니라 **전 무기가 같은
// 색이라 구분이 안 되는 것**이었고, 답은 **속성을 무기별로 부여**하는 것이다.
function toneOf(k){return TONE[TK(k)]||TONE.gold;}
const atL=n=>LV>=n;                 // 이 레벨 이상인가
const lerpLV=(a,b)=>a+(b-a)*(LV-1)/4;

// ── 문법 1: 리본 덩어리 (ribbon body) ─────────────────────────────────────
// 곡선 pts 를 따라 폭이 w0→w1 로 가늘어지는 닫힌 다각형. 슬래시·물줄기·갈고리 전부 이것.
function ribbonPoly(pts,w0,w1,shrink=0){
  const L=[],Rt=[];
  for(let i=0;i<pts.length;i++){
    const u=i/(pts.length-1);
    const p=pts[i],q=pts[Math.min(i+1,pts.length-1)],o=pts[Math.max(i-1,0)];
    let dx=q[0]-o[0],dy=q[1]-o[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
    const w=Math.max(0,(w0+(w1-w0)*u)-shrink)*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.06+.02)),.42);
    L.push([p[0]-dy*w,p[1]+dx*w]);Rt.push([p[0]+dy*w,p[1]-dx*w]);
  }
  return L.concat(Rt.reverse());
}
function fillPoly(c,poly,col){c.beginPath();
  poly.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
  c.fillStyle=col;c.fill();}
// 셀 리본 — 3단 계조 + 흰 앞날 실루엣
function celRibbon(c,pts,w,k,a=1,glow=true){
  const T=toneOf(k);
  if(glow){c.save();c.globalCompositeOperation="lighter";
    fillPoly(c,ribbonPoly(pts,w*1.7,w*.2),A(T[1],.10*a));c.restore();}
  fillPoly(c,ribbonPoly(pts,w,w*.06),A(T[0],.95*a));
  fillPoly(c,ribbonPoly(pts,w*.62,w*.04,0),A(T[1],.98*a));
  fillPoly(c,ribbonPoly(pts,w*.24,w*.02,0),A(T[2],a));
}
/// 셀 획 — **끝이 안 좁아지는 3단 계조 선.** 리본(ribbonPoly)은 양 끝을 0 으로
/// 좁히는 종형이라, 조각을 이어 붙이면 이음매마다 구멍이 난다. 겹쳐 이어야
/// 하는 것(번개 껍질 같은)은 이걸 쓴다 — 둥근 마감이 겹쳐 선이 안 끊긴다.
function celStroke(c,pts,w,k,a=1){
  const T=toneOf(k);
  const path=()=>{c.beginPath();
    pts.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));};
  c.lineCap="round";c.lineJoin="round";
  path();c.strokeStyle=A(T[0],.92*a);c.lineWidth=w;c.stroke();
  path();c.strokeStyle=A(T[1],.96*a);c.lineWidth=w*.60;c.stroke();
  path();c.strokeStyle=A(T[2],a);c.lineWidth=w*.24;c.stroke();
}

// 셀 리본 — **좌우 대칭판.** 시작·끝 폭이 같아 종형만 남는다: 가운데가 굵고
// 양 끝이 뾰족하다. celRibbon 의 `w → w*.06` 테이퍼는 **베기**(선단이 뾰족한
// 낫)의 문법이라, 가로지르는 파도에 쓰면 왼쪽이 굵고 오른쪽이 얇아 보인다
// (2026-08-09 실기 판정). 방향성이 없는 도형은 이걸 쓴다.
function celRibbonEven(c,pts,w,k,a=1,glow=true){
  const T=toneOf(k);
  if(glow){c.save();c.globalCompositeOperation="lighter";
    fillPoly(c,ribbonPoly(pts,w*1.7,w*1.7),A(T[1],.10*a));c.restore();}
  fillPoly(c,ribbonPoly(pts,w,w),A(T[0],.95*a));
  fillPoly(c,ribbonPoly(pts,w*.62,w*.62,0),A(T[1],.98*a));
  fillPoly(c,ribbonPoly(pts,w*.24,w*.24,0),A(T[2],a));
}
// ── 문법 2: 뾰족한 물보라 실루엣 (jagged splash) ─────────────────────────
function jagPoly(cx,cy,r,n,seed,spikeMul=1.9,squash=1){
  const p=[];
  for(let i=0;i<n;i++){
    const a0=i/n*TAU,a1=(i+.5)/n*TAU;
    const rv=r*(.52+.16*hash(seed+i*3.1));
    const rp=r*(.85+.55*hash(seed+i*7.7))*spikeMul*.62;
    p.push([cx+Math.cos(a0)*rv,cy+Math.sin(a0)*rv*squash]);
    p.push([cx+Math.cos(a1)*rp,cy+Math.sin(a1)*rp*squash]);
  }
  return p;
}
function celSplash(c,cx,cy,r,n,seed,k,a=1,squash=1,spikeMul=1.9){
  const T=toneOf(k);
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,cy,0,cx,cy,r*1.7);
  g.addColorStop(0,A(T[1],.22*a));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r*1.7,0,TAU);c.fill();c.restore();
  fillPoly(c,jagPoly(cx,cy,r,n,seed,spikeMul,squash),A(T[0],.95*a));
  fillPoly(c,jagPoly(cx,cy,r*.72,n,seed+1.3,spikeMul*.9,squash),A(T[1],.97*a));
  fillPoly(c,jagPoly(cx,cy,r*.36,n,seed+2.9,spikeMul*.8,squash),A(T[2],a));
}
// ── 문법 3: 뾰족한 창 (spike) ────────────────────────────────────────────
function celSpike(c,x,y,ang,len,w,k,a=1){
  const T=toneOf(k);const cs=Math.cos(ang),sn=Math.sin(ang),px=-sn,py=cs;
  const tri=(L,W,col)=>{c.beginPath();
    c.moveTo(x+cs*L,y+sn*L);c.lineTo(x+px*W-cs*W*.6,y+py*W-sn*W*.6);
    c.lineTo(x-px*W-cs*W*.6,y-py*W-sn*W*.6);c.closePath();c.fillStyle=col;c.fill();};
  tri(len,w,A(T[0],.9*a));tri(len*.92,w*.6,A(T[1],.95*a));tri(len*.8,w*.24,A(T[2],a));
}
// 탄환 — **창끝(celSpike)을 굵히면 원뿔이 된다.** 탄의 정체는 삼각형이 아니라
// 「둥근 앞머리(오지브) + 곧은 몸통 + 살짝 좁아지는 꽁무니」이고, 거기에
// 뒤로 뻗는 분사가 붙어야 「날아가는 중」으로 읽힌다.
// 굵은 탄에서만 차이가 나는 게 아니라 가는 탄도 이쪽이 탄답다.
function roundPoly(x,y,a,len,w){
  // 앞머리를 길게(길이의 44%) 잡고 끝을 뾰족하게(지수 .62) 깎는다. 짧고
  // 둥글면 굵은 탄이 **기둥**으로 보인다(2026-08-09 실기). 꽁무니도 좁혀
  // 실루엣이 앞뒤로 다 좁아지게 둔다 — 그래야 「날아가는 것」이다.
  const L=len,W=Math.max(0,w),N=7,p=[];
  p.push([-L*.46, W*.34],[-L*.30, W*.94]);
  for(let i=0;i<=N;i++){const u=i/N;p.push([L*(.06+.44*u), W*Math.pow(1-u*u,.62)]);}
  for(let i=N;i>=0;i--){const u=i/N;p.push([L*(.06+.44*u),-W*Math.pow(1-u*u,.62)]);}
  p.push([-L*.30,-W*.94],[-L*.46,-W*.34]);
  const ca=Math.cos(a),sa=Math.sin(a);
  return p.map(([px,py])=>[x+px*ca-py*sa, y+px*sa+py*ca]);
}
// [jet] 은 분사가 자란 정도(0~1). **총구를 막 벗어난 탄의 분사는 아직 없다** —
// 1 로 고정하면 긴 탄의 분사가 몸 뒤로 삐져나온다(2026-08-09 판정).
function celRound(c,x,y,a,len,w,k,al=1,jet=1){
  const T=toneOf(k);
  fillPoly(c,roundPoly(x,y,a,len,w),A(T[0],.95*al));
  fillPoly(c,roundPoly(x,y,a,len*.94,w*.62),A(T[1],.97*al));
  fillPoly(c,roundPoly(x,y,a,len*.84,w*.26),A(T[2],al));
  if(jet>.02)celSpike(c,x-Math.cos(a)*len*.44,y-Math.sin(a)*len*.44,a+Math.PI,
    len*.40*jet,w*.58,k,al*.55*jet);
}
// ── 문법 4: 두꺼운 타원 링 (hoop) ────────────────────────────────────────
function celHoop(c,cx,cy,r,squash,rot,w,k,a=1,cut=0){
  const T=toneOf(k);c.save();c.translate(cx,cy);c.rotate(rot);c.scale(1,squash);
  const ring=(rr,ww,col)=>{c.beginPath();c.arc(0,0,rr,cut,TAU-cut);
    c.strokeStyle=col;c.lineWidth=ww;c.lineCap="round";c.stroke();};
  ring(r,w,A(T[0],.9*a));ring(r,w*.55,A(T[1],.95*a));ring(r-w*.22,w*.18,A(T[2],a));
  c.restore();
  c.save();c.globalCompositeOperation="lighter";c.translate(cx,cy);c.rotate(rot);c.scale(1,squash);
  c.beginPath();c.arc(0,0,r,cut,TAU-cut);c.strokeStyle=A(T[1],.14*a);c.lineWidth=w*3.2;c.stroke();c.restore();
}
// ── 문법 5: 캡슐 빔 ──────────────────────────────────────────────────────
function celBeam(c,x0,y0,x1,y1,w,k,a=1){
  const T=toneOf(k);const ang=Math.atan2(y1-y0,x1-x0),len=Math.hypot(x1-x0,y1-y0);
  c.save();c.translate(x0,y0);c.rotate(ang);
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createLinearGradient(0,-w*3,0,w*3);
  g.addColorStop(0,A(T[1],0));g.addColorStop(.5,A(T[1],.28*a));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.fillRect(0,-w*3,len,w*6);c.restore();
  const cap=(ww,col)=>{c.beginPath();
    c.moveTo(ww,-ww);c.lineTo(len-ww,-ww);c.arc(len-ww,0,ww,-Math.PI/2,Math.PI/2);
    c.lineTo(ww,ww);c.arc(ww,0,ww,Math.PI/2,-Math.PI/2);c.closePath();c.fillStyle=col;c.fill();};
  cap(w,A(T[0],.95*a));cap(w*.62,A(T[1],.97*a));cap(w*.26,A(T[2],a));
  // 안쪽 흰 소용돌이
  c.strokeStyle=A(T[2],.55*a);c.lineWidth=w*.16;
  for(let s=0;s<3;s++){c.beginPath();
    for(let i=0;i<=26;i++){const u=i/26,px=w+u*(len-w*2);
      const py=Math.sin(u*7+s*2.1+performance.now()/240)*w*.42;
      i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
  c.restore();
}
// ── 문법 6: 지면 파편 (ground shards) ────────────────────────────────────
function shards(c,cx,cy,r,n,seed,a=1,k="gold"){
  const T=toneOf(k);
  for(let i=0;i<n;i++){const u=(i+.5)/n,x=cx+(u-.5)*r*2,h=r*(.16+.42*hash(seed+i*5.3));
    const w=r*(.05+.07*hash(seed+i*9.1)),lean=(hash(seed+i*2.7)-.5)*r*.24;
    c.beginPath();c.moveTo(x+lean,cy-h);c.lineTo(x+w,cy+r*.06);c.lineTo(x-w,cy+r*.06);c.closePath();
    c.fillStyle=A(i%3?T[0]:T[1],(.55+.4*hash(seed+i))*a);c.fill();
    c.beginPath();c.moveTo(x+lean,cy-h);c.lineTo(x+w*.34,cy);c.lineTo(x-w*.1,cy);c.closePath();
    c.fillStyle=A(T[2],.5*a);c.fill();}
}
// ── 물방울/파편 파티클 ───────────────────────────────────────────────────
function emit(st,x,y,n,o){for(let i=0;i<n;i++){if(st.p.length>200)break;
  const a=(o.a!==undefined?o.a:R()*TAU)+(R()-.5)*(o.spread||TAU),s=(o.sp||50)*(.4+R()*1.2);
  st.p.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:0,m:(o.life||.55)*(.6+R()*.8),
    r:(o.r||3)*(.6+R()*.9),k:o.k||"gold",g:o.g||0,ro:R()*TAU,sp:R()<(o.spikeP||.4)});}}
function stepP(st,dt){for(let i=st.p.length-1;i>=0;i--){const q=st.p[i];q.l+=dt;
  if(q.l>=q.m){st.p.splice(i,1);continue;}
  q.vy+=q.g*dt;const d=Math.pow(.9,dt*60);q.vx*=d;q.vy*=d;q.x+=q.vx*dt;q.y+=q.vy*dt;}}
function drawP(c,st){for(const q of st.p){const u=1-q.l/q.m,T=TONE[q.k];
  if(q.sp){const ang=Math.atan2(q.vy,q.vx);celSpike(c,q.x,q.y,ang,q.r*3.4*u,q.r*.75*u,q.k,u);}
  else{c.beginPath();c.ellipse(q.x,q.y,q.r*u*1.5,q.r*u,q.ro,0,TAU);
    c.fillStyle=A(T[1],.9*u);c.fill();
    c.beginPath();c.ellipse(q.x,q.y,q.r*u*.7,q.r*u*.45,q.ro,0,TAU);
    c.fillStyle=A(T[2],u);c.fill();}}}

// ── 어둠 ─────────────────────────────────────────────────────────────────
const mkFoes=l=>l.map(d=>({ox:d[0],oy:d[1],r:d[2],hit:0,kx:0,ky:0,burn:0}));
function stepFoes(F,dt){for(const f of F){f.hit=Math.max(0,f.hit-dt*5);
  const d=Math.pow(.86,dt*60);f.kx*=d;f.ky*=d;}}
function hitFoe(st,f,cx,cy,dx,dy,pow,k="gold"){f.hit=1;f.kx+=dx*pow;f.ky+=dy*pow;
  emit(st,cx+f.ox+f.kx,cy+f.oy+f.ky,6,{k,sp:130,r:2.6,life:.32,spikeP:.75});}
function drawFoes(c,t,cx,cy,F){
  for(const f of F){const x=cx+f.ox+f.kx,y=cy+f.oy+f.ky,r=f.r;
    // 어둠도 셀 — 각진 실루엣
    const p=[];for(let i=0;i<9;i++){const a0=i/9*TAU,a1=(i+.5)/9*TAU;
      p.push([x+Math.cos(a0)*r*1.06,y+Math.sin(a0)*r*1.06]);
      p.push([x+Math.cos(a1)*r*(.78+.1*Math.sin(t*2+i)),y+Math.sin(a1)*r*.82]);}
    fillPoly(c,p,f.hit>.02?A("#FFFFFF",.2+.7*f.hit):"#16101C");
    c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();
    c.strokeStyle=`rgba(${180+70*f.hit},${60+160*f.hit},${110+100*f.hit},.95)`;
    c.lineWidth=2+f.hit*2;c.stroke();
    c.fillStyle="#FF2D55";const er=1.9+f.hit*1.3;
    c.beginPath();c.arc(x-r*.26,y-r*.08,er,0,TAU);c.fill();
    c.beginPath();c.arc(x+r*.26,y-r*.08,er,0,TAU);c.fill();
    if(f.hit>.45){c.save();c.globalCompositeOperation="lighter";
      for(let i=0;i<5;i++)celSpike(c,x,y,i/5*TAU+t,r*2.6*f.hit,r*.28,"gold",f.hit*.8);c.restore();}}
}
// ── 몸 앞 층 ──────────────────────────────────────────────────────────────
//
// 탑다운에서는 **화면 아래쪽이 카메라에 가깝다.** 몸보다 아래에 있는 것은 몸을
// 가려야 하는데, 시안은 `hero()` 를 매 FX 의 마지막에 불러 **전부 몸 뒤로**
// 깔렸다 — 낙광·광주·정령이 좌표상 앞인데도 캐릭터 뒤에서 발현한다는
// 판정이 나온 이유다(2026-08-09). 엔진에는 이미 같은 규칙이 있다(fx_depth.dart).
//
// [dep] 로 감싼 그리기는 몸을 사이에 두고 **두 번** 그려진다 — 뒤 몫과 앞 몫.
//
// ⚠️ **한 번에 뒤집으면 안 된다.** 정령처럼 꼬리가 긴 것은 머리가 몸 중심을
// 넘는 순간 꼬리 전체가 한 프레임에 앞→뒤로 넘어가고, 그 큰 면적이 통째로
// 사라지니 **몸이 팍 튀어나온 것처럼** 보인다(2026-08-09 실기 판정).
// 그래서 몸 지름만큼의 띠에서 서서히 넘긴다.
//
// [kSeeThrough] 는 뒤로 간 것이 **사라지지 않고 비치는** 정도다. 뒤 몫과 앞
// 몫의 합이 항상 1 이라 총 밝기가 안 늘어난다(엔진 fx_depth.dart 와 같은 식).
let FRONT=[];
const kSeeThrough=.22, kDepBand=30;
function dep(c,y,cy,fn){
  let f=(y-cy)/kDepBand+.5; f=f<0?0:(f>1?1:f);
  const back=(1-f)*(1-kSeeThrough), fwd=f+(1-f)*kSeeThrough;
  if(back>.01)fn(c,back);
  if(fwd>.01)FRONT.push((c)=>fn(c,fwd));
}
function front(fn){FRONT.push(fn);}

/// 몸을 **감싸게** 그린다 — 위쪽 반은 몸 뒤로, 아래쪽 반은 몸 앞으로.
///
/// 탑다운에서는 **화면 아래쪽이 카메라에 가깝다**(rig_layers 의 규약 그대로).
/// 그래서 둘레를 도는 것은 아래를 지날 때 몸을 가려야 하고, 그래야 「두른
/// 고리」가 아니라 **감싼 것**으로 보인다(2026-08-09, 자 13안에서 확인).
///
/// 같은 그림을 두 번 그리되 **서로 겹치지 않게 잘라** 쓰므로 가산 합성에서도
/// 밝기가 겹치지 않는다. 잘린 자리는 두 반쪽이 정확히 맞물려 이음매가 없다.
function wrapBody(c,cx,cy,RR,paint){
  const H=RR*4;
  c.save();c.beginPath();c.rect(cx-H,cy-H,H*2,H);c.clip();paint(c);c.restore();
  front((cc)=>{cc.save();cc.beginPath();cc.rect(cx-H,cy,H*2,H);cc.clip();
    paint(cc);cc.restore();});}

/// 캐릭터. **무기 색이 여기로 새면 안 된다** — 몸 색을 정하는 것은 오직
/// **캐릭터의 속성**이고, 무기 고유색이나 무기에 부여한 속성은 몸과 무관하다
/// (2026-08-09 확정). 그래서 [TK](=RECOLOR 훅)를 타지 않는다. 속성 몸은
/// 호출부가 [k] 로 명시한다.
function hero(c,t,cx,cy,k="gold",s=1){
  const T=TONE[k]||TONE.gold,b=1+.05*Math.sin(t*2.2);
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,cy,0,cx,cy,46*s*b);
  g.addColorStop(0,A(T[1],.4));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,46*s*b,0,TAU);c.fill();c.restore();
  fillPoly(c,jagPoly(cx,cy,17*s*b,7,3,1.35),A(T[0],.95));
  fillPoly(c,jagPoly(cx,cy,13*s*b,7,3.4,1.3),A(T[1],1));
  fillPoly(c,jagPoly(cx,cy,7*s*b,7,4.1,1.2),A(T[2],1));
  // 몸보다 앞(아래)에 있던 것들을 이제 얹는다.
  const q=FRONT;FRONT=[];for(const f of q)f(c);
}
const saw=(t,p)=>(t%p)/p,ease=u=>1-Math.pow(1-u,3);

// ── 불 — **찢어진 갈래 + 떠 있는 섬** ───────────────────────────────────
//
// 2026-08-08 레퍼런스 3장을 거쳐 도달한 문법이다. 실사 불꽃을 게임 문법으로
// 옮긴 시트가 답이었고, 핵심은 셋:
//   ① **2톤이 지배한다** — 주황 바탕 + 크림 하이라이트. 3톤을 균등하게 쓰면
//      계조가 흐려져 "덩어리"로 보인다.
//   ② **갈래가 날카롭게 찢어진다** — 둥근 혀는 촛불이지 불길이 아니다.
//      실루엣을 홀수 마디마다 안으로 파서 갈래를 만든다.
//   ③ **안쪽 밝은 부분은 축소 복사본이 아니라 따로 떠 있는 섬**이다.
//      같은 모양을 줄여 겹치면 스티커가 되고, 위상을 어긋내야 흐름이 산다.
const FIRE_DARK="#B3300A",FIRE_BASE="#FF6A1E",FIRE_LIT="#FFF0C4";
function firePath(c,cx,by,w,h,t,seed,ph){
  const N=11;
  const sway=u=>Math.sin(u*3.1+t*2.4+seed)*w*.55*u+Math.sin(u*6.3-t*1.7+seed*2.1)*w*.24*u;
  const half=u=>w*(1-u*.66)*(.52+.48*Math.abs(Math.sin(u*7.7+seed*3.3+ph)));
  c.beginPath();
  for(let i=0;i<=N;i++){const u=i/N;
    const x=cx+sway(u)-half(u)*(i%2?.44:1);   // 홀수 마디를 안으로 → 갈래
    const y=by-u*h;i?c.lineTo(x,y):c.moveTo(x,y);}
  c.lineTo(cx+sway(1)+w*.05,by-h*1.10);        // 꼭대기 첨두
  for(let i=N;i>=0;i--){const u=i/N;
    const x=cx+sway(u)+half(u)*(i%2?.40:1);
    c.lineTo(x,by-u*h);}
  c.closePath();
}
/// 불덩이 하나 — 바깥 갈래 + 떠 있는 크림 섬 + 불티.
function fireBody(c,t,cx,cy,s=1,a=1,n=3){
  const by=cy+14*s;
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,by-14*s,0,cx,by-14*s,44*s);
  g.addColorStop(0,`rgba(255,150,50,${.34*a})`);g.addColorStop(1,"rgba(255,110,30,0)");
  c.fillStyle=g;c.beginPath();c.arc(cx,by-14*s,44*s,0,TAU);c.fill();c.restore();
  // 바깥 갈래 — 큰 것 뒤, 작은 것 앞
  for(let i=0;i<n;i++){const sd=i*2.11,off=(i-(n-1)/2)*13*s;
    const hh=(58+22*hash(sd))*s*(.88+.16*Math.sin(t*2.1+i));
    firePath(c,cx+off,by,(17+5*hash(sd+1.3))*s,hh,t,sd,i*1.7);
    c.fillStyle=A(FIRE_DARK,.85*a);c.fill();
    firePath(c,cx+off,by-2*s,(15+4*hash(sd+1.3))*s,hh*.97,t,sd,i*1.7);
    c.fillStyle=A(FIRE_BASE,.97*a);c.fill();}
  // 크림 섬 — 위상을 어긋내야 스티커가 안 된다
  for(let i=0;i<n;i++){const sd=i*2.11+7.3,off=(i-(n-1)/2)*11*s;
    const hh=(40+16*hash(sd))*s*(.85+.2*Math.sin(t*2.7+i*1.4));
    firePath(c,cx+off+Math.sin(t*1.9+i)*3*s,by-4*s,(8.5+3*hash(sd))*s,hh,t*1.22,sd,i*.9);
    c.fillStyle=A(FIRE_LIT,a);c.fill();}
  // 불티 — 갈래 끝에서 떨어져 나온 조각
  for(let i=0;i<6;i++){const ph=(t*.8+i*.16)%1;
    const x=cx+(hash(i*4.3)-.5)*46*s+Math.sin(t*2+i)*7*s,y=by-18*s-ph*66*s;
    c.save();c.translate(x,y);c.rotate(hash(i*9.1)*TAU+t);
    c.beginPath();c.moveTo(0,-3.2*s);c.lineTo(1.5*s,0);c.lineTo(0,3.2*s);c.lineTo(-1.5*s,0);
    c.closePath();c.fillStyle=A(ph<.5?FIRE_LIT:FIRE_BASE,(1-ph)*.95*a);c.fill();c.restore();}
}

/// 불 오라 — **몸이 심지다.** 불덩이를 옆에 세우면 모닥불이 서 있는 그림이지
/// "타고 있다"가 아니다(2026-08-08 반려: 「몸을 두르는 게 아니라서」).
///
/// 규칙 셋으로 몸에 붙인다:
///   ① 불의 **밑동이 몸의 둘레 위**에 있다(반지름 r 원주에서 시작).
///   ② 각도마다 **바깥으로 기울인다** — 옆구리 불은 옆으로 눕고 정수리 불은
///      곧게 선다. 전부 수직이면 몸 뒤에 벽지를 바른 것처럼 보인다.
///   ③ **아래쪽 반원에는 불이 없다.** 불은 위로 오르므로, 밑에 두면 즉시
///      "몸에서 나는 것"이 아니라 "몸을 관통한 것"으로 읽힌다.
function fireAura(c,t,cx,cy,r,s=1,a=1){
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,cy,0,cx,cy,r*3.1);
  g.addColorStop(0,`rgba(255,190,90,${.34*a})`);g.addColorStop(1,"rgba(255,110,30,0)");
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r*3.1,0,TAU);c.fill();c.restore();
  const N=9;
  // 뒤층(어두운 바탕) → 앞층(주황) → 크림 섬. 각 층이 같은 앵커에서 자란다.
  for(let pass=0;pass<3;pass++)for(let i=0;i<N;i++){
    const u=(i+.5)/N;
    const ang=-Math.PI+u*Math.PI;                 // 위쪽 반원만
    const lean=Math.cos(ang)*.85;                 // 옆구리일수록 눕는다
    const sd=i*1.87+pass*.31;
    const wob=Math.sin(t*2.6+i*1.3)*.14;
    const h=(r*(1.5+.9*hash(sd)))*(.85+.2*Math.sin(t*2.1+i))*s;
    const bx=cx+Math.cos(ang)*r*.92, by=cy+Math.sin(ang)*r*.92;
    c.save();c.translate(bx,by);c.rotate(lean*.62+wob);
    const w=(r*(.34+.12*hash(sd+1.7)))*s*[1,.88,.5][pass];
    firePath(c,0,0,w,h*[1,.97,.72][pass],t*[1,1,1.22][pass],sd,i*1.7);
    c.fillStyle=A([FIRE_DARK,FIRE_BASE,FIRE_LIT][pass],[.85,.97,1][pass]*a);c.fill();
    c.restore();}
  // 불티 — 정수리에서 떨어져 나온다
  for(let i=0;i<7;i++){const ph=(t*.85+i*.14)%1;
    const x=cx+(hash(i*4.3)-.5)*r*3.2+Math.sin(t*2+i)*r*.4,y=cy-r-ph*r*4.2;
    c.save();c.translate(x,y);c.rotate(hash(i*9.1)*TAU+t);
    c.beginPath();c.moveTo(0,-3.4*s);c.lineTo(1.6*s,0);c.lineTo(0,3.4*s);c.lineTo(-1.6*s,0);
    c.closePath();c.fillStyle=A(ph<.5?FIRE_LIT:FIRE_BASE,(1-ph)*.95*a);c.fill();c.restore();}
}

// ── 뭉게구름 (puff) — 불꽃의 새 문법 ────────────────────────────────────
// 혀(tongue)는 **지속 화염**의 모양이지 폭발의 모양이 아니다. 폭발은 둥근
// 돌기가 뭉친 실루엣(cauliflower)이고, 그래서 혀로 터뜨리면 과하게 보인다.
function puffPoly(cx,cy,r,n,seed,squash=1){
  const p=[];const M=13;
  for(let i=0;i<n;i++){
    const a0=i/n*TAU,a1=(i+1)/n*TAU,am=(a0+a1)/2;
    const br=r*(.30+.20*hash(seed+i*4.7));           // 돌기 반지름
    const bd=r-br*.55;                                // 돌기 중심까지
    const bx=cx+Math.cos(am)*bd,by=cy+Math.sin(am)*bd*squash;
    for(let k=0;k<=M;k++){const a=am-Math.PI*.62+Math.PI*1.24*(k/M);
      p.push([bx+Math.cos(a)*br,by+Math.sin(a)*br*squash]);}
  }
  return p;
}
function celPuff(c,cx,cy,r,n,seed,k,a=1,squash=1){
  const T=toneOf(k);
  fillPoly(c,puffPoly(cx,cy,r,n,seed,squash),A(T[0],.95*a));
  fillPoly(c,puffPoly(cx-r*.06,cy-r*.10,r*.72,n,seed+1.7,squash),A(T[1],.96*a));
  fillPoly(c,puffPoly(cx-r*.10,cy-r*.18,r*.36,Math.max(4,n-2),seed+3.3,squash),A(T[2],a));
}

// ── 불혀 한 자루 ─────────────────────────────────────────────────────────
function flame(c,x,y,s,ph,k,rot=0){k=TK(k);const T=TONE[k];
  c.save();c.translate(x,y);c.rotate(rot);
  const body=(sc,col)=>{c.beginPath();c.moveTo(0,0);
    c.quadraticCurveTo(-13*sc*s,-16*s,-4*sc*s,-30*s);
    c.quadraticCurveTo(-1*sc*s,-38*s,2*sc*s,-46*s);
    c.quadraticCurveTo(7*sc*s,-32*s,13*sc*s,-18*s);
    c.quadraticCurveTo(9*sc*s,-7*s,0,0);c.closePath();c.fillStyle=col;c.fill();};
  body(1,A(T[0],.92*(1-ph*.4)));body(.62,A(T[1],.96*(1-ph*.3)));body(.26,A(T[2],1-ph*.22));
  c.restore();}
// 염의 몸 — 난류 불덩이. 고리로 두르면 도장처럼 굳어 보인다.
function flameCrown(c,t,cx,cy,s=1){fireBody(c,t,cx,cy-6*s,s,1,12);}
function arcPts(cx,cy,r,a0,a1,n=22,rMul=1){const p=[];
  for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([cx+Math.cos(a)*r*rMul,cy+Math.sin(a)*r]);}return p;}

// ── 방어 · 저주 · 회복 공용 조각 (2026-08-11) ────────────────────────────
//
// **새 원시함수가 아니라 기존 문법의 조합이다.** 링(celHoop) · 획(celStroke) ·
// 창(celSpike) · 각진 별(jagPoly/fillPoly)만 쓴다 — 그리는 법이 같아야 다섯
// 분류가 한 세계로 보인다. 상태 표식은 **만들지 않는다**: [pvMark] 가 이미
// 여덟(점화·동상·감전·분해·중독·실명·저주·침묵)의 단일 출처다.

/// 타일 크기에 맞춰 무리를 낳는다.
///
/// 성장표 칸은 168px 이고 시안 칸은 238px 이다. 절대 좌표로 무리를 두면
/// 성장표에서 바깥쪽 적이 **잘려 나가** 「L5 가 몇 마리를 잡았나」가 안 보인다
/// — 레벨 비교가 무리 수로 성립하는 이 세 분류에서는 치명적이다.
const mkFoesZ=(l,SC)=>mkFoes(l.map(d=>[d[0]*SC,d[1]*SC,d[2]*SC]));

/// 채워지는 고리 — 0~1 이 12시부터 시계방향으로 찬다.
///
/// 응보의 저장 · 사슬의 과부하 · 여명의 기다림 · 봉인의 공격 시계 · 공물의
/// 제물이 **전부 이 하나**다. 축적을 스킬마다 다른 그림으로 보여주면
/// 플레이어가 다섯 번 배워야 하고, 그러면 아무도 안 본다.
function celGauge(c,cx,cy,r,u,w,k,a=1){
  if(!(u>.004)||!(r>0)||!(w>0))return;
  const uu=Math.min(1,u),a0=-Math.PI/2;
  celStroke(c,arcPts(cx,cy,r,a0,a0+TAU*uu,Math.max(3,Math.round(30*uu))),w,k,a);
}

/// 체력 링 — **회복 분류 전체의 공통 문법.**
///
/// 회복은 「HP 가 도로 차는 것」이 안 보이면 화면에서 아무 일도 안 일어난다.
/// 그래서 회복 넷은 전부 몸 둘레에 이 링을 두르고, **깎이는 것과 차는 것을
/// 같은 링 위에서** 보여준다 — 두 링으로 가르면 어느 쪽이 내 피인지 모른다.
///
/// ⚠️ celHoop 은 안쪽 고리를 `r - w*.22` 에 그린다. **굵기를 반지름에 묶어야**
/// 갓 태어난 고리에서 음수 반지름으로 죽지 않는다(스모크가 검사하는 항목).
function hpRing(c,cx,cy,r,hp,k){
  if(!(r>0))return;
  celHoop(c,cx,cy,r,1,0,Math.max(1,3.2*(r/40)),"shade",.75);
  celGauge(c,cx,cy,r,Math.max(0,Math.min(1,hp)),Math.max(1,4.4*(r/40)),k,.95);
}

/// 피격 — **몸이 맞았다.**
///
/// 적이 맞은 것(drawFoes 의 흰 번쩍)과 색이 갈려야 「내가 맞았다」와 「적이
/// 맞았다」가 안 헷갈린다. 적의 눈과 같은 붉은색을 쓴다 — 이 화면에서
/// 붉은 것은 언제나 「나를 해치는 쪽」이다.
const HURT=["#4A0A16","#FF3B5C","#FFD8DE"];
function hurtFlash(c,x,y,r,a){
  if(!(a>.01)||!(r>0))return;
  fillPoly(c,jagPoly(x,y,r,8,5.7,1.5),A(HURT[0],.9*a));
  fillPoly(c,jagPoly(x,y,r*.58,8,7.1,1.4),A(HURT[1],.95*a));
}

/// 몸으로 빨려드는 것 — **회복의 공통 문법.**
///
/// 여명의 빛알갱이 · 수확의 이삭 · 공물의 젬이 전부 이 한 벌이다. 회복은
/// 「어디선가 와서 몸에 들어가는 것」이라야 화면에서 회복으로 읽힌다 —
/// 링만 차오르면 그건 이펙트가 아니라 UI 다.
function inflow(st,x,y,k){(st.mo=st.mo||[]).push({x,y,l:0,k,sd:R()*17});}
function stepInflow(st,cx,cy,dt,sp){
  const L=st.mo=st.mo||[];
  for(let i=L.length-1;i>=0;i--){const m=L[i];m.l+=dt;
    const dx=cx-m.x,dy=cy-m.y,d=Math.hypot(dx,dy)||1;
    m.x+=dx/d*sp*dt;m.y+=dy/d*sp*dt;
    if(d<sp*dt+2||m.l>2.4)L.splice(i,1);}
  return L;
}
function drawInflow(c,L,s){
  for(const m of L){const T=TONE[m.k]||TONE.gold;
    fillPoly(c,jagPoly(m.x,m.y,s,6,m.sd,1.3),A(T[1],.92));
    fillPoly(c,jagPoly(m.x,m.y,s*.48,6,m.sd+2.1,1.2),A(T[2],1));}
}

/// 암흑물질 한 알 — **몸은 어둡고 테두리만 금빛**(README 「픽업」의 규약).
/// 응보의 수거와 공물의 제물이 같은 알을 쓴다: 같은 물건이면 같아야 한다.
function gemDot(c,x,y,s){
  const P=[[x,y-s],[x+s*.6,y],[x,y+s],[x-s*.6,y]];
  fillPoly(c,P,"#151019");
  c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
  c.closePath();c.strokeStyle=A(TONE.wBolt[1],.95);c.lineWidth=Math.max(.9,s*.3);c.stroke();
}

/// 저주 계열의 상태 표식 — **[pvMark] 를 그대로 부른다.**
///
/// 저주 다섯은 새 상태를 안 만들고 `PASSIVE`/`PVNAME` 의 여덟을 재사용하므로,
/// 표식도 새로 그리면 안 된다. 같은 상태가 속성에서와 저주에서 다르게 보이면
/// 플레이어는 상태를 두 번 배워야 하고, 그 순간 이 표가 단일 출처가 아니게 된다.
/// 적마다 `f.pv`(0~1)를 세워 두고, 이 함수를 **뒤 층 → 적 → 앞 층**으로 부른다.
function pvLayer(c,cx,cy,F,kind,t,k,SC,layer){
  for(const f of F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,kind,Math.min(1,f.pv),t,k,SC,layer);
}

// ── 무기 17종 ─────────────────────────────────────────────────────────────
// ── 가산 발광 후보 (유도탄) ───────────────────────────────────────────────
//
// 이 레포의 문법은 **셀 셰이딩**이다 — 면 채우기 · 3단 계조 · 뾰족한 윤곽 ·
// 흰 앞날. 그 전에는 가산 글로우(빛 번짐)였는데 **의도적으로 갈아탔다**
// (mockup-weapon.html 머리말에 그 판정이 적혀 있다).
//
// 2026-08-10 사용자가 발광 레퍼런스를 다시 들고 와 「유도탄을 이 계열로
// 할 수 있나」고 물었다. 답은 **된다**이고, 대신 고를 것이 있다 —
// 유도탄만 발광이면 화면에서 그것만 다른 언어를 쓴다. 그래서 말로 정하지
// 않고 세 안을 나란히 그려 놓는다:
//
//   A 혜성   — 완전한 가산 발광. 레퍼런스에 제일 가깝다
//   B 꼬임   — 발광 + 두 가닥이 축을 감는 꼬리(레퍼런스 1·2행)
//   C 절충   — 셀 몸통은 그대로 두고 **꼬리와 머리에만** 발광을 한 겹
//
// 채택되면 「탄」 전체(기본 공격·따발총·산탄)의 문법이 되어야 하고,
// 반려되면 이 블록을 통째로 지운다. **다른 무기는 이 함수를 안 쓴다.**

/// 가산 합성으로 한 겹 그린다. 빛은 겹칠수록 밝아진다 — 그것이 발광 문법의
/// 전부다(셀은 반대로, 겹쳐도 위의 것이 아래를 덮는다).
function gAdd(c,f){c.save();c.globalCompositeOperation="lighter";
  try{f(c);}finally{c.restore();}}

/// 헤일로 — 중심이 희고 밖으로 갈수록 무기색으로 풀리는 원.
function gHalo(c,x,y,r,k,a){if(r<=0.1)return;const T=toneOf(k);
  const g=c.createRadialGradient(x,y,0,x,y,r);
  // 중심은 **무기색이 아니라 흰색**이다. 발광은 겹칠수록 색이 빠지며 흰색으로
  // 포화되고, 그 흰 심이 있어야 「빛난다」로 읽힌다 — 무속성 회백(#A6A6B2)을
  // 그대로 쓰면 아무리 겹쳐도 회색 얼룩이다(2026-08-10 렌더 판정).
  g.addColorStop(0,A("#FFFFFF",.95*a));g.addColorStop(.12,A(T[2],.72*a));
  g.addColorStop(.22,A(T[1],.50*a));
  g.addColorStop(.55,A(T[0],.20*a));g.addColorStop(1,A(T[0],0));
  c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}

/// 발광 선 — **세 번 덧그린다.** 넓고 어둡게 → 좁고 밝게 → 아주 좁고 희게.
/// 한 번만 그으면 네온이 아니라 그냥 굵은 선이 된다.
function gStroke(c,pts,w,k,a){if(!pts||pts.length<2)return;const T=toneOf(k);
  c.lineCap="round";c.lineJoin="round";
  for(const[lw,col,al]of[[w,T[0],.45*a],[w*.46,T[1],.75*a],
      [w*.16,T[2],a],[w*.07,"#FFFFFF",.95*a]]){
    c.lineWidth=lw;c.strokeStyle=A(col,al);c.beginPath();
    c.moveTo(pts[0][0],pts[0][1]);
    for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);
    c.stroke();}}

/// 별섬광 — 헤일로 + 십자 가시. 레퍼런스의 「머리」가 전부 이 형태다.
function gFlare(c,x,y,r,k,a,rot,arms){const T=toneOf(k);
  gHalo(c,x,y,r*2.1,k,a*.8);
  for(let i=0;i<(arms||4);i++){const ang=rot+i/(arms||4)*TAU;
    const len=r*(i%2?2.0:3.4);
    const g=c.createLinearGradient(x,y,x+Math.cos(ang)*len,y+Math.sin(ang)*len);
    g.addColorStop(0,A("#FFFFFF",.9*a));g.addColorStop(.18,A(T[2],.7*a));
    g.addColorStop(1,A(T[1],0));
    c.strokeStyle=g;c.lineWidth=r*.30;c.lineCap="round";
    c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(ang)*len,y+Math.sin(ang)*len);c.stroke();}
  gHalo(c,x,y,r*.62,k,a);}

/// 꼬임 가닥 — 두 가닥이 축을 감고 돈다. 유도탄(불티 안)의 몸이다.
///
/// 진폭은 **꼬리로 갈수록** 커진다: 머리 쪽이 벌어지면 창끝이 뭉개져 어디가
/// 앞인지 안 읽힌다. 반대로 꼬리가 조이면 「쏘아진 것」이 아니라 「매달린
/// 것」으로 보인다.
function helixStrands(q,t,V){
  const S=[];
  for(let s=0;s<V.n;s++){const pts=[];
    for(let i=0;i<q.tr.length;i++){const p=q.tr[i],pv=q.tr[Math.max(0,i-1)];
      const dx=p[0]-pv[0],dy=p[1]-pv[1],dl=Math.hypot(dx,dy)||1;
      const nx=-dy/dl,ny=dx/dl,u=i/q.tr.length;
      const am=V.amp*u;
      const ph=i*V.freq-t*9+s/V.n*TAU;
      pts.push([p[0]+nx*Math.sin(ph)*am,p[1]+ny*Math.sin(ph)*am]);}
    S.push(pts);}
  return S;}

/// 날카로운 머리 — **타원**을 진행 방향으로 늘여 그린다. 원형 섬광은 「빛
/// 덩어리」라 방향이 없어서, 꼬리가 아무리 꼬여도 어디로 가는지 안 읽혔다
/// (2026-08-10 사용자 판정: 「머리를 좀더 타원형으로 날카롭게」).
/// 앞은 뾰족하고 뒤는 뭉툭한 물방울이라, 늘인 타원 두 겹에 앞쪽 가시 하나.
function gLance(c,x,y,a,len,w,k,al){const T=toneOf(k);
  gHalo(c,x,y,w*2.4,k,al*.55);
  c.save();c.translate(x,y);c.rotate(a);
  for(const[lx,ly,col,aa]of[[len,w,T[1],.55*al],[len*.78,w*.60,T[2],.8*al],
      [len*.52,w*.30,"#FFFFFF",.95*al]]){
    c.beginPath();c.ellipse(0,0,lx,ly,0,0,TAU);c.fillStyle=A(col,aa);c.fill();}
  // 앞으로 뻗는 실 — 타원만으로는 아직 둥글어서, 끝에 한 가닥을 더 준다.
  // ⚠️ **짧게.** 2.3배로 뻗었더니 머리가 꼬리만큼 길어져 「양쪽이 다 꼬리」로
  // 보였다(2026-08-10 사용자 판정: 「머리부분을 좀더 짧게」). 머리는 꼬리보다
  // 확실히 짧아야 어디가 앞인지가 읽힌다.
  const g=c.createLinearGradient(0,0,len*1.25,0);
  g.addColorStop(0,A("#FFFFFF",.9*al));g.addColorStop(1,A(T[1],0));
  c.strokeStyle=g;c.lineWidth=w*.34;c.lineCap="round";
  c.beginPath();c.moveTo(0,0);c.lineTo(len*1.25,0);c.stroke();
  c.restore();}


// ── 기본 공격의 속성 패시브 (2026-08-10 사용자 확정) ──────────────────────
//
// 속성은 캐릭터의 것이고 기본 공격이 그걸 그대로 나른다. 맞은 적에게 걸리는
// 것이 아래 표다 — **엔진에 이미 있는 상태를 최대한 그대로 쓴다**
// (`StatusPool` 의 burn·slow·shock·stun·freeze·poison·chill). 새로 만드는
// 것은 침묵·출혈·저주 셋뿐이다.
//
// ⚠️ **회피는 능력치로 만들지 않는다**(0 으로 간다). 500마리가 뒤엉킨 화면에서
// 한 대 빗나간 것은 안 보이고 「왜 안 죽었지」만 남는다 — 치명타를 넣은
// 이유(분신 다섯의 호가 통째로 노랗게 터지는 건 보인다)의 정확한 반대다.
// 그래서 실명·저주를 **미스 없이** 같은 체감이 나게 다시 정의했다:
//   실명 = 원거리 적의 **발사각에 오차** → 탄이 눈에 보이게 빗나간다
//   저주 = **받는 피해 +N%** + 약한 도트 → 회피율 하락과 같은 방향인데 연출이 산다
// 방어구 신기루의 회피(`rng.evade`)는 그대로 둔다 — 「내가 확률을 쌓는 것」이
// 아니라 「그 스킬이 가끔 흘리는 것」이라 읽히는 층이 다르다.
const PASSIVE={
  ember:"burn",   fstorm:"burn",                  // 점화 — 세고 짧은 도트
  frost:"frost",  snow:"frost",                   // 동상 — 둔화 + 0.1s 빙결 + 냉기 도트
  volt:"shock",   magnet:"shock",                 // 감전 — 공속 저하 + 0.05s 경직
  blast:"decomp",                                 // 감전 + **분해**(도트 중첩 상한 +1)
  toxin:"poison", murk:"poison",                  // 중독 — 약하고 길다, 자동 중첩
  aqua:"blind",   gale:"blind",  smoke:"blind",   // 실명 — 원거리 발사각에 오차
  plague:"curse", numb:"curse",                   // 저주 — 받는 피해 증가 + 약한 도트
  thunder:"silence",                              // 침묵 — 원거리 공격만 중지
  // 어둠 — **실명**(2026-08-11 사용자 정정). 처음엔 출혈이었는데 어둠의 정체는
  // 「베는 것」이 아니라 **안 보이게 하는 것**이다. 어두우니 못 본다 — 속성의
  // 이름과 효과가 같은 말을 해야 플레이어가 외울 필요 없이 안다.
  //
  // ⚠️ 그래서 **출혈은 쓰는 속성이 사라졌다.** 붙일 자리였던 타르가 융화 열에
  // 없고(TONE 에만 남은 잔재) 어둠이 실명으로 갔다 — 정의와 그림을 통째로
  // 지운다. 안 쓰는 상태를 남겨 두면 다음 사람이 「이건 어디에 붙나」를 묻는다.
  shade:"blind",
  // ⚠️ 백광만 **결이 다르다**(2026-08-10 사용자 확정). 다른 속성은 맞은 적에게
  // 상태를 걸지만 백광은 **탄 자체가 세진다** — 방어력 무시 · 평타 피해 ×2 ·
  // 적을 맞고 한 번 더 튕김. 「다섯을 다 거친 것」이라 새 상태를 하나 더
  // 만드는 것보다 **기본 공격의 규칙을 깨는 쪽**이 그 자리에 맞다.
  white:"pierceAll"};
/// 발현 중의 기본 공격이 **더 얻는 것**. 계열마다 축이 하나이고, 같은 계열
/// 안에서는 그 축의 **내용물**만 다르다 — 축이 겹치면 계열이 계열로 안 읽힌다.
///
/// ⚠️ 이 표가 기획의 단일 출처다(2026-08-11 사용자 지시: 「설정들도 스킬 설명에
/// 녹여 놔야 나중에 기획이 안 어그러진다」). 그림을 고치면 이 줄도 같이 고친다.
const MANIDESC={
  gold  :"돌멩이가 나가 **2회 튕긴다** — 빛이 아니라 각진 덩어리다",
  ember :"맞으면 작게 터지고 **불길이 솟는다**. 빗나가도 **사거리 끝에서 터진다**",
  fstorm:"맞으면 **순간에 확 퍼졌다 꺼진다** — 산소를 먹는 연소폭발, 잔불티가 흩어진다",
  smoke :"맞으면 **어둡게 터지고 연기가 남는다** — 남는 것은 점화가 아니라 **실명**이다",
  frost :"맞은 놈의 **이웃까지 언다** — 사람으로 번진다",
  snow  :"맞은 놈만 얼되 **얼음 조각이 자리에 남아** 지나가는 적을 둔화 — 자리로 번진다",
  volt  :"맞고 **인근 둘에게 옮겨 붙는다**", magnet:"맞고 **인근 둘에게 옮겨 붙는다**",
  blast :"맞고 **인근 둘에게 옮겨 붙는다**",
  toxin :"적을 **뚫고 지나가며 지나간 전원**에게 중독 — 뚫을수록 쌓인다",
  murk  :"적을 **뚫고 지나가며 지나간 전원**에게 중독(더 오래)",
  plague:"적을 **뚫고 지나가며 지나간 전원**에게 저주", 
  numb  :"적을 **뚫고 지나가며 지나간 전원**에게 저주",
  gale  :"명중 지점으로 주변 적을 **빨아들인다** — 넉백의 반대다",
  thunder:"빨아들인 뒤 **침묵** — 원거리 적을 끌어와 입을 막는다",
  aqua  :"날아갈수록 **커지고 세진다** — 멀수록 강한 유일한 무기",
  shade :"맞은 자리에 **블랙홀**이 남아 **빨아들인다** — 가까울수록 세게 끌리고, 끌려오는 동안 실명이 걸린다",
  white :"본체가 **주기적으로 충격파**를 낸다. 맞은 적은 **맞을 때 한 번**, **1초 뒤 터지며 또 한 번** 맞고, 그 폭발에 **주변 적까지** 함께 맞는다"};
/// 발현 **전용기** 셋. [MANIDESC] 가 「발현 중의 기본 공격」의 단일 출처인 것과
/// 같은 자리다 — 그림을 고치면 이 줄도 같이 고친다.
///
/// ⚠️ 속성 키가 없다. **셋뿐이고 18칸 전부가 이 셋을 공유한다** — 속성은 색과
/// [PASSIVE] 로만 얹힌다. 여기에 속성별 줄을 추가하고 싶어지면 그건 이미
/// 18종으로 돌아가는 것이다(그 판단의 근거는 `FX.manicRecall` 위의 머리말에).
const MANICDESC={
  recall:["회귀 回歸","되돌아옴",
    "원반이 **적이 몰린 쪽**으로 날아갔다 **다른 길로 돌아온다** — 가는 길·오는 길에 한 번씩, 같은 적도 두 번 문다. 쿨 2.4초"],
  wall  :["경계 境界","지형",
    "적 앞에 **빛의 벽**을 세운다. **못 넘고**, 붙어 있는 동안 지진다. 5초 · 최대 2장 · 쿨 2.6초"],
  halt  :["정지 停止","시간",
    "고리가 퍼지며 **닿은 적이 그 자리에 굳는다**(1.3초). 감속이 아니라 **0** 이고, 풀릴 때 부서진다. 쿨 3.2초"]};
const PVNAME={burn:"점화",frost:"동상",shock:"감전",decomp:"감전+분해",
  poison:"중독",blind:"실명",curse:"저주",silence:"침묵",
  pierceAll:"방어 무시 · 피해 ×2 · 1회 튕김"};

/// 맞은 적에게 붙는 표식. **엔진이 거는 상태를 화면에 번역한 것**이라,
/// 상태 하나에 그림 하나로 못 박는다 — 같은 표식이 무기마다 달라 보이면
/// 플레이어는 상태를 못 배운다.
/// [layer] 0 = **몸 뒤**, 1 = 몸 앞. 두 번 불린다.
///
/// ⚠️ 감긴 것으로 보이려면 띠가 몸 **뒤로도 지나가야** 한다(2026-08-10 사용자
/// 판정: 「앞과 뒤의 구분이 없음」). 전부 몸 위에 그리면 아무리 둘러도
/// 「얹었다」이지 「감겼다」가 아니다 — 유도탄 코일에서 같은 걸 여섯 번 고쳤다.
/// 가림은 공짜로 얻는다: 뒤 층을 [drawFoes] **전에**, 앞 층을 **후에** 그리면
/// 적의 몸이 그대로 마스크가 된다.
function pvMark(c,x,y,r,kind,f,t,k,SC,layer){
  const T=toneOf(k),al=Math.min(1,f*1.6);
  // 뒤 층을 쓰는 것은 저주뿐이다 — 나머지는 몸 위에서 완결된다.
  if(layer===0&&kind!=="curse")return;
  if(kind==="burn"){
    // 위로 오르는 불티 셋. 도트는 **시간이 흐른다**는 표시라 위로 흘러야 한다.
    for(let i=0;i<3;i++){const p=((t*1.6+i*.33)%1);
      celSpike(c,x+Math.sin(t*4+i*2.1)*r*.5,y-r*.4-p*r*1.5,-Math.PI/2,
        7*SC*(1-p),3*SC*(1-p),k,al*(1-p));}}
  else if(kind==="frost"){
    // ⚠️ 두 번 고쳤다. 조각 넷을 몸에 박은 첫 판은 「스티커」였고, 각진
    // 껍질만 두른 두 번째는 **얼어 있는 느낌이 안 났다**(2026-08-10 사용자
    // 판정) — 테두리만 있으면 「무언가에 둘러싸였다」이지 「얼었다」가 아니다.
    //
    // 얼음은 **속이 찬다.** 몸을 덮는 청백 면을 깔고, 그 위에 결정 면을
    // 몇 조각 얹고, 마지막에 각진 테두리를 두른다. 그리고 거의 안 움직인다 —
    // 다른 표식이 흐르거나 도는 것과 달리 **정지가 이 상태의 정보**다.
    const P=jagPoly(x,y,r*1.18,9,7.3,1.15);
    fillPoly(c,P,A(T[1],al*.42));                 // ① 몸을 덮는 면
    for(let i=0;i<3;i++){                          // ② 결정 면 — 각지게 쪼갠다
      const a=i/3*TAU+.4, d=r*.55;
      fillPoly(c,[[x,y],
        [x+Math.cos(a)*d*1.5,y+Math.sin(a)*d*1.5],
        [x+Math.cos(a+.9)*d*1.5,y+Math.sin(a+.9)*d*1.5]],A(T[2],al*.30));}
    c.beginPath();P.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));
    c.closePath();c.strokeStyle=A(T[2],al*.95);c.lineWidth=2.4*SC;c.stroke();
    // ③ 결정 돌기 — 아주 느리게만 돈다(t*.12). 얼음은 바쁘지 않다.
    for(let i=0;i<5;i++){const a=t*.12+i/5*TAU;
      celSpike(c,x+Math.cos(a)*r*1.16,y+Math.sin(a)*r*1.16,a,
        (6+2*hash(i*3.7))*SC,3*SC,k,al*.85);}}
  else if(kind==="shock"||kind==="decomp"){
    // 지그재그 호 — 짧고 각지게. 곡선으로 그리면 전기가 아니라 리본이다.
    const P=[];for(let i=0;i<=5;i++){const a=t*7+i*1.1;
      P.push([x+Math.cos(a)*r*(i%2?1.25:.75),y+Math.sin(a)*r*(i%2?1.25:.75)]);}
    celRibbon(c,P,3.2*SC,k,al*.95);
    if(kind==="decomp")
      // 분해 — 몸 둘레가 조각으로 흩어진다. 「도트가 하나 더 얹힌다」를
      // 조각 수로 말한다.
      for(let i=0;i<5;i++){const a=t*1.3+i/5*TAU,d=r*(1.35+.25*Math.sin(t*3+i));
        celRound(c,x+Math.cos(a)*d,y+Math.sin(a)*d,a,6*SC,2.6*SC,k,al*.8,0);}}
  else if(kind==="poison"){
    // 천천히 떠오르는 방울. 불티보다 **느리고 둥글다** — 그 차이가 곧
    // 「세고 짧다 ↔ 약하고 길다」다.
    for(let i=0;i<3;i++){const p=((t*.7+i*.33)%1);
      celSplash(c,x+Math.cos(t*1.2+i*2.1)*r*.6,y-r*.3-p*r*1.3,
        (4.5-2*p)*SC,7,i*3+1,k,al*(1-p)*.9);}}
  else if(kind==="blind"){
    // ⚠️ 세 번째 판(2026-08-10 사용자 판정: 「바람과 컨셉이 안 맞음」).
    //
    // 이 상태를 다는 셋은 **수 水 · 풍 風 · 연 煙** 이다. 셋의 공통점은
    // 「독하다」가 아니라 **흩날려 앞을 가린다** — 물보라 · 돌풍 · 연기.
    // 그래서 정적인 장막이 아니라 **머리 둘레를 스치고 지나가는 자락**으로
    // 그린다. 도는 것이 아니라 **지나가는 것**이라 자락마다 수명이 짧다.
    for(let i=0;i<4;i++){
      const ph=((t*1.15+i*.25)%1);                // 0 → 1 로 지나간다
      const a=(i*1.9)+ph*2.2-1.1;                 // 한쪽에서 반대쪽으로 쓸린다
      const rr=r*(1.05+.25*Math.sin(ph*Math.PI));
      const P=[];
      for(let j=0;j<=5;j++){const aa=a+(j/5-.5)*1.5;
        P.push([x+Math.cos(aa)*rr,y+Math.sin(aa)*rr*.85]);}
      celRibbon(c,P,3.4*SC,k,al*Math.sin(ph*Math.PI)*.8);}}
    // ⚠️ 흔들리는 조준선은 **뺐다**(2026-08-10 사용자 판정: 「시계추처럼
    // 움직이는 게 있는데 그거 제거하는 게 오히려 낫다」). 적 아래에서 좌우로
    // 왕복하는 막대가 상태 표식이 아니라 **적이 뭘 하고 있다**로 읽혔다 —
    // 흩날려 가리는 자락만으로 이미 「앞이 안 보인다」가 서므로, 둘째 요소는
    // 설명이 아니라 소음이었다.
  else if(kind==="curse"){
    // 몸을 **감아 도는** 띠 둘. 하나는 위로, 하나는 아래로 흐르고, 각 띠는
    // 반 바퀴는 몸 뒤로 반 바퀴는 몸 앞으로 지나간다 — 그 앞뒤가 3D를 만든다.
    //
    // 뒤로 지나는 반은 **가늘고 어둡게**(가려지는 중이라는 신호), 앞으로
    // 오는 반은 굵고 밝게. 굵기·밝기·순서 셋이 같이 가야 감긴 것으로 보인다.
    for(let s0=0;s0<2;s0++){
      const ph=t*(s0?-.9:1.1)+s0*1.7;
      const cy0=y+Math.sin(ph)*r*.62, rr=r*(1.12-s0*.10);
      const back=layer===0;
      c.save();c.translate(x,cy0);c.scale(1,.32);
      c.beginPath();
      // 캔버스는 y 가 아래로 자라므로 π~2π 구간이 **위쪽 = 먼 쪽**이다.
      c.arc(0,0,rr,back?Math.PI:0,back?TAU:Math.PI);
      c.strokeStyle=A(back?T[0]:T[2],al*(back?.55:.95)*(s0?.6:1));
      c.lineWidth=(back?1.3:2.9)*SC*(s0?.75:1);c.lineCap="round";c.stroke();
      c.restore();}
    if(layer===0)return;
    // 아래로 뻗는 갈퀴 — 저주가 **끌어내린다**는 방향을 준다. 앞 층에만.
    for(let i=0;i<3;i++){const a=Math.PI*.5+(i-1)*.5;
      celSpike(c,x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9,a,
        (7+3*Math.sin(t*3+i))*SC,3*SC,k,al*.7);}}
  else if(kind==="silence"){
    // 머리 위 ✕ — 「이 적은 못 쏜다」. 도형 하나로 끝내야 500마리에서 읽힌다.
    const s=r*.7;
    celBeam(c,x-s,y-r*1.5-s,x+s,y-r*1.5+s,3.6*SC,k,al);
    celBeam(c,x-s,y-r*1.5+s,x+s,y-r*1.5-s,3.6*SC,k,al);}}

// ── 발현 전용기의 공용 바닥 (2026-08-11 신설) ────────────────────────────
//
// 전용기 셋이 같은 세 줄을 각자 다시 적으면 **몸 크기가 셋 다 어긋나고**
// 적이 셋 다 다르게 움직인다 — 그러면 「같은 사람이 같은 상태에서 쓰는 것」이
// 아니라 서로 다른 세 시안이 된다. 공용으로 두는 이유는 코드 줄 수가 아니라
// 그림이 한 벌로 읽히게 하는 것이다(`basicMani` 가 18칸을 한 함수로 두는 것과
// 같은 이유).
//
/// 전용기 시안의 적 — **몸 쪽으로 걸어온다.**
///
/// 다른 타일의 적은 제자리에 서 있는데(`mkFoes` 가 준 자리 그대로), 여기서는
/// 셋 다 **움직임이 정보**다: 벽은 막을 것이 있어야 벽이고, 정지는 움직이던
/// 것이 멎어야 정지이며, 회귀는 가는 길과 오는 길에 다른 놈이 걸려야 「두 번
/// 벤다」가 화면에 남는다. 서 있는 적으로는 셋 다 그림만 나오고 뜻이 안 나온다.
///
/// 몸에 닿은 놈은 **죽는 그림 없이** 바깥 링에서 다시 걸어온다. 이 페이지가
/// 답할 질문은 「전용기가 무엇을 하는가」 하나라, 처치 연출을 얹으면 그 질문의
/// 답이 섞인다.
function manicWalk(st,dt,SC){
  st.F=st.F||mkFoes([[70,-64,11],[-78,-40,10],[10,-96,9],[-24,86,10],[92,26,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  for(const f of st.F){
    // [hold] 은 **정지**가 쓰는 자리다. 굳은 놈이 계속 걸어오면 「멈췄다」가
    // 표식뿐인 거짓말이 된다 — 상태와 움직임이 같은 말을 해야 한다.
    if(f.hold>0){f.hold-=dt;continue;}
    const d=Math.hypot(f.ox,f.oy)||1;
    f.ox-=f.ox/d*24*SC*dt;f.oy-=f.oy/d*24*SC*dt;
    if(Math.hypot(f.ox,f.oy)<26*SC){const a=R()*TAU,rr=(96+R()*24)*SC;
      f.ox=Math.cos(a)*rr;f.oy=Math.sin(a)*rr;f.kx=0;f.ky=0;f.wt=0;}}
}
/// 조준 — **적이 제일 몰린 쪽.** 가장 가까운 놈(기본 공격의 조준)이 아니다:
/// 회귀도 벽도 **여럿을 한 번에** 처리하는 것이라, 코앞의 한 놈을 보면 그
/// 값어치가 안 나온다. 단위벡터를 더하면 거리와 무관하게 **머릿수 쪽**으로
/// 기운다 — 멀어도 뭉쳐 있으면 그쪽이다.
function manicAim(st){
  let ax=0,ay=0;
  for(const f of st.F){const d=Math.hypot(f.ox+f.kx,f.oy+f.ky)||1;
    ax+=(f.ox+f.kx)/d;ay+=(f.oy+f.ky)/d;}
  return (ax||ay)?Math.atan2(ay,ax):-Math.PI/2;
}
/// 발현한 몸 — [basicMani] 와 **한 글자도 안 다르게** 그린다(융화·무·백광은
/// [fvBody], 기본 6속성은 [ELEM.elemBody], 반지름은 칸 비례로 축소).
/// 전용기가 다른 몸을 그리면 옆 탭과 나란히 놓았을 때 「이건 다른 상태인가」가
/// 생긴다 — 전용기는 발현의 **일부**이지 다른 사건이 아니다.
function manicBody(c,t,dt,W,H,st,KEY){
  const VW=Math.min(W,H)*.32,BASE6={ember:1,frost:1,volt:1,toxin:1,gale:1,shade:1};
  st.sub=st.sub||{p:[]};
  c.save();c.translate(W/2-VW/2,H/2-VW/2);
  try{if(BASE6[KEY])ELEM.elemBody(c,t,dt,VW,VW,st.sub,KEY);
    else fvBody(c,t,dt,VW,VW,st.sub,KEY,((FVFIX[KEY]&&FVFIX[KEY].mani)||1)-1);}
  catch(e){}
  c.restore();
}
/// 발현 유지 바 — **만충 상태로만** 그린다([basicMani] 와 같은 규칙).
///
/// ⚠️ 15초가 줄었다 다시 차는 것으로 그려 보려다 걷어냈다. 타일은 영원히
/// 도는데 15초마다 바가 **툭** 하고 되차면 그 이음매가 매번 보인다 — 주기
/// 경계에서 값이 튀는 것을 네 번 반려한 것과 같은 함정이다. 여기서 바가 할 일은
/// 「지금은 발현 중이다」 하나뿐이라 시간을 굳이 흘릴 이유가 없다.
function manicBar(c,W,H,SC,KEY){
  const gw=W*.44,gx=W/2-gw/2,gy=H-14*SC;
  c.fillStyle=A("#1E1E26",.9);c.fillRect(gx,gy,gw,4*SC);
  c.fillStyle=A(toneOf(KEY)[2],.95);c.fillRect(gx,gy,gw,4*SC);
}

const FX={
bolt(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // **하나의 파도**다. 창을 여러 자루 뿌리면 산탄총과 구분이 안 된다
  // (2026-08-08 판정: "빛발사보다 샷건의 느낌"). 개수가 두 무기를 가른다.
  // 그림이 파도가 되었으므로 **이름도 「빛파동」으로 바꾼다** — 이름이 그림을
  // 배반하면 3택 카드에서 플레이어가 다른 물건을 기대한다.
  // 적을 무리로 둔다 — **최대 타격 수가 설계의 핵심**이라, 3마리로는 L1(3)과
  // L5(5)가 같은 그림이 되어 표가 아무것도 못 보여준다.
  st.F=st.F||mkFoes([[46,-62,11],[-32,-74,9],[72,-26,10],[8,-84,10],
    [-64,-46,9],[24,-52,10],[-8,-64,9],[62,-70,10],[-44,-70,10]]);
  stepFoes(st.F,dt);
  st.w=st.w||[];
  // ── 레벨 설계 (2026-08-09 확정) ──────────────────────────────────────
  // 성장축이 **개수**다. 굵기·데미지가 아니라 파동이 하나씩 늘고, 늘어난
  // 파동은 **각자 따로 표적을 고른다** — 앞 파동에 맞은 놈이 뒷 파동에도
  // 맞는다는 보장이 없다. 그래야 「같은 자리를 두 번 때리기」가 아니라
  // 「움직여서 다른 무리에 두 번째 파동을 얹기」가 된다.
  // 최대 타격 수를 두는 이유: 기본 무기가 무리 전체를 한 번에 지우면
  // 다른 무기가 설 자리가 없다.
  const WAVES =[1,1,2,3,3][LV-1];        // 한 격발에 나가는 파동 수
  const MAXHIT=[3,3,3,4,5][LV-1];        // 파동 하나가 때릴 수 있는 최대 적 수
  const HALF  =[.34,.44,.46,.50,.58][LV-1];  // 부채 반각(rad)
  // 파동이 퍼지는 속도 — L1→L2 를 완만하게(2026-08-09). 300→420 은 한 단에
  // 40% 라 「빨라졌다」가 아니라 **다른 무기**로 보였다. 성장은 개수가 맡고
  // 속도는 거들기만 한다.
  const SPD   =[160,180,205,235,270][LV-1];
  // 격발 주기 — 전 레벨 한 단 더 느리게(2026-08-09). 기본 무기는 **한 발이
  // 보이고 나서 다음 발이 나가야** 파동으로 읽힌다. 빠르면 띠가 이어져
  // 「발사」가 아니라 「분사」가 된다.
  const PERIOD=[1.30,1.15,1.05,.95,.86][LV-1];
  const AWAKE = LV>=5;                   // L5 각성 — 앞날에 갈퀴가 선다
  // 파동이 느려진 만큼 **수명을 늘려** 사거리를 지킨다 — 수명을 그대로 두면
  // 「천천히 가다 중간에 사라지는」 무기가 된다.
  const LIFE=.62, R0=16;
  const u=saw(t,PERIOD);
  if(u<st.pu)for(let n=0;n<WAVES;n++)
    // 뒤 파동은 **음수 수명**으로 태어나 시차를 두고 출발한다 — 한 번에
    // 세 겹이 겹쳐 나가면 하나로 뭉쳐 보인다.
    st.w.push({r:R0,l:-n*.11,hit:new Set()});
  st.pu=u;
  for(let i=st.w.length-1;i>=0;i--){const w=st.w[i];w.l+=dt;
    if(w.l>0)w.r+=SPD*dt;
    if(w.l>LIFE){st.w.splice(i,1);continue;}
    if(w.l<=0||w.hit.size>=MAXHIT)continue;
    // **판정은 그려지는 호 그대로다.** 발사 순간 고정 원뿔로 때리면
    // 「이펙트는 지나갔는데 안 맞는다」가 된다(2026-08-09 실기 판정).
    // 같은 r·같은 half 를 쓰고, 가까운 적부터 MAXHIT 만큼만 문다.
    const band=17*Math.max(0,1-w.l/LIFE)+3+9;
    const cand=[];
    st.F.forEach((f,fi)=>{if(w.hit.has(fi))return;
      const ox=f.ox+f.kx,oy=f.oy+f.ky,d=Math.hypot(ox,oy);
      if(Math.abs(d-w.r)>band+f.r)return;
      const da=((Math.atan2(oy,ox)+Math.PI/2)%TAU+TAU+Math.PI)%TAU-Math.PI;
      if(Math.abs(da)>HALF)return;
      cand.push([d,fi,f]);});
    cand.sort((a2,b2)=>a2[0]-b2[0]);
    for(const [,fi,f] of cand){if(w.hit.size>=MAXHIT)break;
      w.hit.add(fi);hitFoe(st,f,cx,cy,0,-1,26);}}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  for(const w of st.w){if(w.l<0)continue;const f=Math.max(0,1-w.l/LIFE);
    const half=HALF*(1+(1-f)*.22);
    const pts=[],seg=18;
    for(let k2=0;k2<=seg;k2++){const a=-Math.PI/2-half+2*half*(k2/seg);
      pts.push([cx+Math.cos(a)*w.r,cy+Math.sin(a)*w.r]);}
    // **좌우 대칭 리본.** 테이퍼를 쓰면 한쪽이 굵어 보인다(실기 판정).
    celRibbonEven(c,pts,(AWAKE?20:17)*f+3,"gold",.55+.45*f);
    // L5 각성 — 마루에 갈퀴가 선다. 굵기가 아니라 **실루엣**이 바뀐다.
    if(AWAKE)for(let k2=2;k2<seg;k2+=4){const a=-Math.PI/2-half+2*half*(k2/seg);
      celSpike(c,cx+Math.cos(a)*w.r,cy+Math.sin(a)*w.r,a,15*f+4,4.5*f+1.5,"gold",f);}}
  // 총구 — 파도가 나가는 자리
  const mz=Math.max(0,1-u/(PERIOD*.28));
  if(mz>0)celSplash(c,cx,cy-16,15*mz,8,5,"gold",mz,.8);
  drawP(c,st);hero(c,t,cx,cy);},

orbit(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[58,-30,11],[-62,26,10],[-6,-68,9],[70,34,10],[-44,-58,9]]);
  stepFoes(st.F,dt);
  // ── 레벨 설계 (2026-08-09 확정) ──────────────────────────────────────
  // **궤도선 자체는 피해가 없다** — 그래서 그것을 *레벨의 표지*로 쓴다.
  // L1 은 궤도선 없이 덩어리 하나만 돈다: 선이 없으니 「길」이 아직 안 났다는
  // 뜻이고, L2 에서 선이 생기며 무기가 형태를 갖춘 것으로 읽힌다.
  // 성장은 **안쪽 궤도의 신설 → 개수**로 간다.
  const OUT=[1,2,2,2,4][LV-1];          // 바깥 궤도의 덩어리 수
  const IN =[0,0,2,3,3][LV-1];          // 안쪽 궤도(역방향)의 덩어리 수
  const GUIDE=LV>=2;                    // 궤도선이 보이는가 — L1 은 안 보인다
  const AWAKE=LV>=5;                    // 각성 — 덩어리에 갈퀴가 아주 살짝
  // 각속도 — **레벨마다 아주 조금씩만** 빨라진다(2026-08-09). 계단으로 두면
  // L2 에서 갑자기 다른 무기가 되고, 빠르면 덩어리가 선으로 뭉개져 「도는
  // 물체」가 아니라 「띠」로 보인다. 성장은 개수가 맡는다.
  const RR=atL(3)?83:64,SPIN=[1.00,1.09,1.18,1.27,1.36][LV-1];
  const N=OUT+IN;
  st.tr=st.tr||[];while(st.tr.length<N)st.tr.push([]);
  const orbP=k=>{const inner=k>=OUT,rr=inner?RR*.55:RR,sp=inner?-SPIN*1.35:SPIN;
    // 각 궤도 안에서 **자기 개수만큼** 균등 분할한다. 고정 3분할로 두면
    // 덩어리가 1~2개일 때 한쪽에 쏠려 「도는 것」으로 안 읽힌다.
    const n=inner?IN:OUT,i=inner?k-OUT:k;
    const a=t*sp+i/n*TAU;
    return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.62];};
  for(let k=0;k<N;k++){const p=orbP(k);
    st.tr[k].push(p);if(st.tr[k].length>14)st.tr[k].shift();
    // 넉백 방향은 **궤도체가 선 자리에서 바깥으로** — orbP 안의 각도는
    // 여기서 안 보인다(그걸 참조하다 매 접촉 프레임마다 예외가 났다).
    const kx=p[0]-cx,ky=p[1]-cy,kl=Math.hypot(kx,ky)||1;
    // 판정 반경도 덩어리와 **같이** 줄인다 — 그림만 줄이면 안 맞는 자리가
    // 맞아 보인다(「보이는 것 = 맞는 것」).
    for(const f of st.F)if(Math.hypot(cx+f.ox+f.kx-p[0],cy+f.oy+f.ky-p[1])<f.r+10.5)
      hitFoe(st,f,cx,cy,kx/kl,ky/kl,30);}
  // 궤도선도 문다 — **틱 피해, 넉백 없음.** 선을 그려놓고 아무 일도 안
  // 일어나면 그건 장식이다. 밀어내지 않는 이유는, 밀면 무리가 선 밖으로
  // 흩어져 **「가둬놓고 갈아내는」 이 무기의 성격**이 사라지기 때문이다.
  // 궤도선은 L2 부터 생기므로 이 피해도 L2 부터다 — 선이 곧 계약이다.
  const RINGTICK=.30;
  for(const f of st.F)f.rt=(f.rt||0)-dt;
  const grind=(rr,ry,hw)=>{for(const f of st.F){
    const ox=f.ox+f.kx,oy=f.oy+f.ky;
    // 타원 위의 최근접점을 같은 「타원 반직선」으로 근사한다 — 정확한
    // 최근접점은 4차식이고, 이 굵기에서는 눈으로 구별되지 않는다.
    const kk=Math.hypot(ox/rr,oy/ry)||1e-6;
    if(Math.hypot(ox-ox/kk,oy-oy/kk)>f.r+hw)continue;
    if(f.rt>0)continue;f.rt=RINGTICK;
    hitFoe(st,f,cx,cy,0,0,0);}};
  if(GUIDE)grind(RR,RR*.62,6);
  if(IN>0)grind(RR*.55,RR*.55*.62,5);
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  if(GUIDE)celHoop(c,cx,cy,RR,.62,0,3,"gold",.4);
  if(IN>0)celHoop(c,cx,cy,RR*.55,.62,0,2.4,"gold",.3);
  // 궤도의 **아래쪽 절반은 몸 앞**이다 — 전부 뒤에 깔면 덩어리가 몸 뒤로만
  // 돌아 「도는 것」이 아니라 「뒤에 붙은 그림」이 된다.
  // 덩어리 크기 — **줄였다**(2026-08-10 사용자 판정: 「너무 큰 듯」).
  // 각성이면 여섯 덩어리가 도는데, 하나가 크면 궤도가 아니라 **띠**로
  // 뭉개져 「도는 물체」가 안 읽힌다. 꼬리도 같은 비율로 가늘게.
  for(let k=0;k<N;k++){const inner=k>=OUT,p=orbP(k),r=inner?6:9;
    dep(c,p[1],cy,(c,al)=>{
      celRibbon(c,st.tr[k],inner?4.5:7,"gold",.95*al);
      celSplash(c,p[0],p[1],r,7,k*3+1,"gold",al);
      // 각성 — 덩어리 둘레에 갈퀴 넷. **아주 미세하게** 실루엣만 바뀐다.
      if(AWAKE)for(let j=0;j<4;j++){const a=t*2.2+j/4*TAU+k;
        celSpike(c,p[0],p[1],a,r*.95,r*.32,"gold",.9*al);}});}
  drawP(c,st);hero(c,t,cx,cy);},

smg(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[22,-76,10],[-44,-64,9],[64,-46,10],[-14,-58,10],[58,-72,9]]);
  stepFoes(st.F,dt);
  st.b=st.b||[];st.m=st.m||[];st.acc=(st.acc||0)+dt;
  // ── 레벨 설계 (2026-08-09 확정) ──────────────────────────────────────
  // **가닥이 늘고 대형이 벌어진다.** 연사는 현저히 느려졌고(0.07→0.26s)
  // 레벨마다 조금씩만 빨라진다 — 빠르면 탄이 선으로 이어져 「따발총」이
  // 아니라 「레이저」가 된다. 성장은 가닥 수와 대형이 맡는다.
  //
  // 가닥: off = 총구의 좌우 어긋남, ang = 나가는 각도(0 이 1자).
  //   L1 1가닥 1자 → L2 2가닥 1자 → L4 3가닥 V(가운데만 1자)
  //   → L5 4가닥 V(가운데 둘만 1자, 그 둘만 과열되어 붉어진다)
  // 한 단에 0.06s 씩 — 폭이 작으면 레벨업이 「올랐나?」가 되고, 기본이 빠르면
  // 애초에 오를 자리가 없다. 그래서 시작을 크게 늦추고 폭을 키웠다.
  // 곡선의 모양(L1·L2 완만 → L3 부터 급격)은 유지하되 **전체를 당긴다.**
  // 0.68s = 초당 1.5발은 따발총이 아니라 라이플이다(2026-08-09 판정).
  // 따발총의 정체는 **끊기지 않는 것**이라, 초당 3발이 하한선이다.
  // ⚠️ 중간 셋(L2·L3·L4)을 **살짝 늦췄다**(2026-08-10 사용자 판정). L1 과
  // L5 는 그대로다 — 시작과 각성은 맞았고, 중간이 너무 빨리 각성에 닿아
  // L4 와 L5 가 화면에서 같은 속도로 보였다.
  const RATE=[.28,.25,.18,.125,.075][LV-1]; // 초당 3.6 / 4.0 / 5.6 / 8.0 / 13.3발
  const LANES=[
    [{o:0,a:0}],
    [{o:-7,a:0},{o:7,a:0}],
    [{o:-7,a:0},{o:7,a:0}],
    [{o:0,a:0},{o:-10,a:-.24},{o:10,a:.24}],
    // ⚠️ 중심 간격 20. 굵기 25 는 **가장 두꺼운 허리**의 값이라, 산술로
    // 맞닿을 것 같은 26 에서도 실제로는 벌어져 보인다 — 탄이 앞뒤로 좁아지는
    // 실루엣이라 눈에 닿는 건 허리 한 점뿐이기 때문이다(2026-08-09 실기).
    // 살짝 겹쳐야 「나란히 나가는 두 발」로 읽힌다.
    //
    // V 는 **주력의 어깨에서 갈라져 나가야** V 다. ±24 에서 17° 로 벌리면
    // 이미 떨어진 자리에서 살짝 기운 것이라 그냥 네 줄로 보인다(2026-08-09
    // 「멋이 안 난다」). 어깨(±19)에 붙여 놓고 26° 로 꺾으면 총구 한 점에서
    // 갈라진 화살촉이 된다.
    [{o:-10,a:0,hot:1},{o:10,a:0,hot:1},{o:-19,a:-.46},{o:19,a:.46}],
  ][LV-1];
  const HOMING=[0,0,1,2,2][LV-1];    // 약한 유도탄 — 본 무기(유도탄)와 다른 형태
  const AWAKE=LV>=5;                 // 각성 — 가운데 둘이 주력, 양옆 V 는 보조
  // 탄 두께 — **L2 부터** 굵어진다. 연사가 빨라지는 것과 같이 굵어져야
  // 「탄이 늘었다」가 아니라 「무기가 세졌다」로 읽힌다.
  // ⚠️ **길이는 굵기에 비례로 묶는다**(4.8배 = 화면상 2.3:1). 굵기만 키우면
  // 짧고 뭉툭해져 탄이 아니라 원뿔로 보인다.
  const BW=[4.6,6.0,7.2,8.4,9.4][LV-1],ASPECT=4.8;
  while(st.acc>RATE){st.acc-=RATE;
    for(const L of LANES){const a=-Math.PI/2+L.a;
      // 각성탄은 굵기·길이를 직접 지정한다(화면상 25 × 55) — 비율식으로
      // 두면 굵기를 만질 때마다 길이가 같이 튄다.
      const w=L.hot?12.5:BW*(AWAKE?.62:1),len=L.hot?57.3:w*ASPECT;
      // **꽁무니가 총구에 오게** 앞으로 밀어 낳는다. 중심을 총구에 두면
      // 각성탄처럼 긴 탄은 꼬리가 몸 뒤까지 삐져나온다(2026-08-09 판정).
      // 보조 V 는 총구에서 **조금 뒤에서** 나온다 — 어깨가 뒤로 젖혀져야
      // 화살촉이지, 나란히 출발하면 그냥 부챗살이다.
      const mx=cx+L.o+(R()-.5)*4,my=cy-20+(L.hot||!AWAKE?0:9);
      st.b.push({x:mx+Math.cos(a)*len*.52,y:my+Math.sin(a)*len*.52,a,w,len,
        vx:Math.cos(a)*430,vy:Math.sin(a)*430,l:0,hot:L.hot||0});}
    // 유도탄은 연사에 안 얹는다 — 같이 쏟아지면 탄막에 묻혀 안 보인다.
    st.hacc=(st.hacc||0)+1;
    // **화면에 뜬 수를 HOMING 으로 묶는다.** 연사가 빨라지면 앞 볼리가
    // 살아 있는 채로 다음 볼리가 나가 「총 2개」가 3개로 보인다.
    if(HOMING&&st.hacc%3===0&&st.m.length<HOMING)for(let k=st.m.length;k<HOMING;k++){
      const tg=st.F[(st.i=(st.i||0)+1)%st.F.length];
      st.m.push({x:cx+(k?18:-18),y:cy-14,vx:(k?150:-150),vy:-90,tg,l:0,tr:[]});}
    st.mz=.06;}
  st.mz=Math.max(0,(st.mz||0)-dt);
  for(let i=st.b.length-1;i>=0;i--){const q=st.b[i];
    q.x+=q.vx*dt;q.y+=q.vy*dt;q.l+=dt;
    let hit=false;for(const f of st.F)if(Math.hypot(cx+f.ox+f.kx-q.x,cy+f.oy+f.ky-q.y)<f.r+6){
      hitFoe(st,f,cx,cy,0,-1,10);hit=true;break;}
    if(hit||q.l>.62)st.b.splice(i,1);}
  // 약한 유도탄 — 본 무기(유도탄)와 **같은 조향 모형**이다: 표적 쪽으로
  // 가속하고 속도에 상한을 둔다. 그래야 관성이 남아 휘어 들어가고, 지나치면
  // 되돌아온다.
  //
  // ⚠️ 각도를 직접 꺾으면 안 된다. 선회 상한을 프레임당 0.63rad 로 두었더니
  // 사실상 즉시 표적을 향해 **직선**이 되어 「탄환 위로 스티커가 날아다닌다」가
  // 됐다(2026-08-09 실기 판정). 곁다리라는 성격은 **선회력과 속도**로 낸다
  // (760/250 vs 본 무기 2400/290).
  const HTURN=760,HSPD=250;
  for(let i=st.m.length-1;i>=0;i--){const q=st.m[i];q.l+=dt;
    const tx=cx+q.tg.ox+q.tg.kx,ty=cy+q.tg.oy+q.tg.ky;
    let ax=tx-q.x,ay=ty-q.y;const L=Math.hypot(ax,ay)||1;ax/=L;ay/=L;
    q.vx+=ax*HTURN*dt;q.vy+=ay*HTURN*dt;
    const sp=Math.hypot(q.vx,q.vy);if(sp>HSPD){q.vx*=HSPD/sp;q.vy*=HSPD/sp;}
    q.x+=q.vx*dt;q.y+=q.vy*dt;q.tr.push([q.x,q.y]);if(q.tr.length>11)q.tr.shift();
    if(L<q.tg.r+7){hitFoe(st,q.tg,cx,cy,ax,ay,8);
      emit(st,q.x,q.y,6,{k:"gold",sp:150,r:2.2,life:.32,spikeP:.5});st.m.splice(i,1);}
    else if(q.l>2.0)st.m.splice(i,1);}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // L5 가운데 두 가닥은 **각성한 탄**이고 양옆 V 는 **보조**다. 색만으로는
  // 약해서, 가운데는 굵고 양옆은 가늘어야 주력과 보조가 한눈에 갈린다.
  for(const q of st.b)
    celRound(c,q.x,q.y,q.a,q.len,q.w,q.hot?"ember":"gold",
      AWAKE&&!q.hot?.85:1,Math.min(1,q.l/.07));
  // 약한 유도탄의 **다른 형태** — 창끝이 아니라 작은 탄두 + 목깃이다.
  // 목깃(고리)은 **진행 방향으로 눕힌다**: 정원(正圓)은 방향이 없어서, 아무리
  // 잘 날아도 붙여놓은 그림으로 보인다.
  for(const q of st.m){const a=Math.atan2(q.vy,q.vx);
    celRibbon(c,q.tr,4.5,"gold",.7);
    celHoop(c,q.x-Math.cos(a)*5,q.y-Math.sin(a)*5,6,.40,a,2.0,"gold",.9);
    celRound(c,q.x,q.y,a,15,3.1,"gold",1,Math.min(1,q.l/.12));}
  if(st.mz>0){const f=st.mz/.06;
    celSplash(c,cx,cy-22,15*f,7,(t*20)|0,LANES[0].hot?"ember":"gold",f);}
  drawP(c,st);hero(c,t,cx,cy);},

seeker(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // 재설계 2026-08-10 — **레벨이 개수를 정한다**(1·2·2·3·4). 예측 조준·재추적·
  // 분열은 뺐다: 셋 다 발사 순간의 계산이라 화면에서 무엇이 달라졌는지 안 보인다.
  // 그리고 **느리다** — 적보다 조금 빠른 정도라야 「알아서 쫓는다」가 읽힌다.
  // 그림도 얇다(리본 3.6 · 탄 길이 10) — 한 발이 화려하면 넷이 화면을 덮는다.
  st.F=st.F||mkFoes([[54,-64,11],[-60,-46,10],[10,-86,9]]);stepFoes(st.F,dt);
  st.m=st.m||[];st.acc=(st.acc||0)+dt;
  const N=[1,2,3,3,4][LV-1], FAST=atL(3);
  // 분열은 **L4 에서 한 발로 먼저 열린다.** L5 에서 0 → 2 로 뛰니 「급발진」으로
  // 읽혔다(2026-08-10 사용자 판정) — 새 성질은 한 칸 먼저 맛을 보여야 각성이
  // 「더 크다」가 되지 「처음 본다」가 안 된다.
  const SPL=[0,0,0,1,2][LV-1];
  // 레벨이 오르면 **두꺼워진다** — 엔진 kSeekerRadius 표와 같다(각성이 L1 의 3배).
  // 그림만 두껍게 하면 안 맞는 자리가 맞아 보인다.
  const BW=[3.8,5.2,6.8,8.9,11.6][LV-1];
  // 탄속·선회는 **레벨마다 자란다.** L3 에서 한 번 빨라지고 마는 계단(130→200)은
  // L4·L5 를 올려도 화면이 그대로라 「성장했다」가 안 읽혔다(2026-08-10 사용자 판정).
  // ⚠️ 절대값이 아니라 **비율을 엔진과 맞춘다** — `kSeekerSpeed`
  // [170,230,300,360,420] 에 L1 기준 배수(1 · 1.35 · 1.76 · 2.12 · 2.47)를 읽어
  // 시안 L1(130)에 곱했다. 시안 타일은 반너비 75px 뿐이라 엔진 절대값을 그대로
  // 쓰면 한 프레임에 칸을 가로지른다(빛폭탄에 적은 것과 같은 이유).
  // 선회도 같이 올린다: 속도만 올리면 관성이 이겨 표적을 지나쳐 맴돈다.
  const SPD=[130,176,230,275,320][LV-1], TURN=[1000,1300,1700,2200,2800][LV-1];
  if(st.acc>.9){st.acc=0;for(let k=0;k<N;k++){
    const tg=st.F[(st.i=(st.i||0)+1)%st.F.length];
    st.m.push({x:cx+(k-(N-1)/2)*9,y:cy,vx:(k%2?-1:1)*70,vy:-40,tg,l:0,tr:[],w:BW});}}
  for(let i=st.m.length-1;i>=0;i--){const q=st.m[i];q.l+=dt;
    const tx=cx+q.tg.ox+q.tg.kx,ty=cy+q.tg.oy+q.tg.ky;
    let ax=tx-q.x,ay=ty-q.y;const L=Math.hypot(ax,ay)||1;ax/=L;ay/=L;
    q.vx+=ax*TURN*dt;q.vy+=ay*TURN*dt;
    const sp=Math.hypot(q.vx,q.vy);if(sp>SPD){q.vx*=SPD/sp;q.vy*=SPD/sp;}
    q.x+=q.vx*dt;q.y+=q.vy*dt;q.tr.push([q.x,q.y]);if(q.tr.length>13)q.tr.shift();
    if(L<q.tg.r+9||q.l>3.2){
      if(L<q.tg.r+9){hitFoe(st,q.tg,cx,cy,ax,ay,FAST?32:24);
        // **터진다.** 유도탄은 미사일이라 닿는 순간이 곧 폭발이어야 하는데,
        // 파편 여덟만 뿌리니 「스쳤다」로 읽혔다(2026-08-10 사용자 판정).
        // 맞은 자리에 짧은 고리 + 사방으로 튀는 불티를 남긴다.
        st.hz=st.hz||[];st.hz.push({x:q.x,y:q.y,a:Math.atan2(ay,ax),l:0,w:q.w});
        emit(st,q.x,q.y,14,{k:"gold",sp:250,r:2.8,life:.38,spikeP:.7});
        // **각성 — 쪼개진다.** L5 는 터진 자리에서 자탄 두 발이 남은 적을 문다.
        // 옛 판에도 「분열」이 레벨 설명엔 있었는데 **그린 적이 없어** 화면에
        // 아무 일도 안 일어났다(2026-08-10 사용자 판정: 「안 보이는데」).
        // 자탄은 어미의 55% 굵기이고 [ch] 로 표시해 **다시 쪼개지지 않는다** —
        // 안 막으면 한 발이 2·4·8발로 불어 화면이 유도탄으로 덮인다.
        if(SPL>0&&!q.ch){
          // 옆으로 튀어 나갔다가 물러 들어온다 — 곧장 다음 적으로 가면
          // 「쪼개졌다」가 아니라 「하나가 더 나왔다」로 보인다.
          // ⚠️ **방금 때린 놈은 뺀다.** 라운드로빈으로 표적을 집었더니 자탄
          // 둘이 어미가 터뜨린 그 적을 다시 물어, 코앞에서 겹쳐 터지느라
          // 쪼개진 것이 안 보였다(2026-08-10 사용자 판정). 분열의 값어치는
          // **피해가 옆으로 번지는 것**이지 같은 적을 세 번 치는 게 아니다.
          const oth=st.F.filter(f=>f!==q.tg);
          const bs=Math.atan2(ay,ax);
          for(let z=0;z<SPL;z++){const a2=bs+(SPL<2?1.15:(z?1.15:-1.15));
            st.m.push({x:q.x,y:q.y,vx:Math.cos(a2)*150,vy:Math.sin(a2)*150,
              // 남은 적이 하나뿐이면 둘 다 그리로 간다 — 그래도 어미의 표적은
              // 아니므로 「번졌다」는 읽힌다.
              tg:oth.length?oth[z%oth.length]:q.tg,l:0,tr:[],w:q.w*.55,ch:1});}}}
      st.m.splice(i,1);}}
  st.hz=(st.hz||[]).filter(h=>(h.l+=dt)<.26);
  st.sp=st.sp||[];
  for(let i=st.sp.length-1;i>=0;i--){const s0=st.sp[i];s0.l+=dt;
    s0.x+=s0.vx*dt;s0.y+=s0.vy*dt;s0.vx*=.94;s0.vy*=.94;
    if(s0.l>.5)st.sp.splice(i,1);}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  for(const q of st.m){const ang=Math.atan2(q.vy,q.vx),BW=q.w;
    // ── 불티 안 (2026-08-10 확정) ────────────────────────────────────────
    // 셀 셰이딩(면 채우기)에서 **가산 발광**으로 갈아탔다. 후보 다섯 중
    // 사용자가 고른 것이 「불티」다: 가는 두 가닥이 축을 감고, 그 가닥
    // 자리에서 불티가 떨어져 뒤로 흩어진다.
    //
    // 낱값은 전부 [BW](= 엔진 `kSeekerRadius`)에 묶는다 — 레벨이 오르면
    // 판정이 굵어지는데 그림이 그대로면 안 맞는 자리가 맞아 보인다.
    // 비율로 묶어 두면 표 하나만 고쳐도 다섯 레벨이 같이 따라온다.
    //
    // ⚠️ 가닥은 **얇아야 한다**(BW 의 0.20배). 굵으면 불티가 가닥에 묻혀
    // 「반짝임」이 아니라 「굵은 줄」로 보인다 — 이 안의 정체는 가닥이 아니라
    // 떨어져 나가는 불티다(2026-08-10 사용자 판정).
    const V={n:2, w:BW*.20, amp:BW*.58, freq:.72, knot:0};
    const S=helixStrands(q,t,V),fi=Math.min(1,q.l/.10);
    // 불티 — 가닥 위에서 떨어진다. 탄 중심에서 뿌리면 꼬임과 무관한 분수가
    // 되어 「꼬임에서 떨어졌다」가 안 읽힌다. 레벨이 오르면 더 자주 난다.
    if(q.tr.length>4&&R()<dt*(70+18*(LV-1))){
      const g0=S[(R()*V.n)|0],pt=g0[(g0.length*.55)|0];
      if(pt)st.sp.push({x:pt[0],y:pt[1],vx:(R()-.5)*46-q.vx*.16,
        vy:(R()-.5)*46-q.vy*.16,l:0,r:BW*.28});}
    gAdd(c,c=>{for(const pts of S)gStroke(c,pts,V.w,"gold",.85*fi);
      // 머리 — 늘인 타원 창끝. 원형 섬광은 방향이 없어 어디로 가는지 안 읽힌다.
      gLance(c,q.x,q.y,ang,BW*1.05,BW*.36,"gold",fi);});}
  gAdd(c,c=>{for(const s0 of st.sp){const f=1-s0.l/.5;
    gHalo(c,s0.x,s0.y,(s0.r||2)*(1-s0.l/.5)+.7,"gold",f*.9);}});

  // 명중 — **발광 문법으로 맞춘다.** 몸이 발광인데 명중만 셀(면 채우기)이면
  // 한 화면에 두 언어가 섞여, 터지는 순간 갑자기 다른 게임이 된다.
  // 셋을 겹치되 셋 다 같은 f 로 죽어 **한 박자**로 읽히게 한다:
  // ① 퍼지는 고리 ② 사방으로 튀는 불티 ③ 8갈래 별섬광.
  for(const h of (st.hz||[])){const f=1-h.l/.26,g=1-f;if(f<=0)continue;
    // ⚠️ 자라는 폭은 작게. 크게 키우면 **비눗방울**이 된다 — 터지는 것은
    // 커지는 게 아니라 한 번 밝고 굵게 섰다 꺼지는 것이다.
    gAdd(c,c=>{const T=toneOf("gold"),R0=h.w*(.75+1.35*g);
      c.strokeStyle=A(T[1],f*.55);c.lineWidth=h.w*.55*f+1;
      c.beginPath();c.arc(h.x,h.y,R0,0,TAU);c.stroke();
      c.strokeStyle=A("#FFFFFF",f*.75);c.lineWidth=h.w*.22*f+.5;
      c.beginPath();c.arc(h.x,h.y,R0*.66,0,TAU);c.stroke();
      // 튀는 불티 — 각도를 명중 위치로 고정해 매 프레임 안 튀게 한다.
      for(let z=0;z<10;z++){const a2=h.a+(z*2.399)%TAU;
        const d0=R0*.5,d1=R0*(1.15+.5*((z*7919%97)/97));
        const gg=c.createLinearGradient(h.x+Math.cos(a2)*d0,h.y+Math.sin(a2)*d0,
          h.x+Math.cos(a2)*d1,h.y+Math.sin(a2)*d1);
        gg.addColorStop(0,A("#FFFFFF",f*.9));gg.addColorStop(1,A(T[1],0));
        c.strokeStyle=gg;c.lineWidth=h.w*.20*f+.4;c.beginPath();
        c.moveTo(h.x+Math.cos(a2)*d0,h.y+Math.sin(a2)*d0);
        c.lineTo(h.x+Math.cos(a2)*d1,h.y+Math.sin(a2)*d1);c.stroke();}
      gFlare(c,h.x,h.y,h.w*(.6+1.0*g),"gold",f,h.l*7,8);});}
  drawP(c,st);hero(c,t,cx,cy);},

scatter(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // 재설계 2026-08-10 — **넷이 같이 자란다**: 사거리·발수·공속, 그리고 L3 부터
  // 관통 · L5 에 착탄 폭발. 옛 「근거리 집탄」과 「더블 탭」은 뺐다(둘 다 화면에서
  // 안 읽힌다). 산탄은 **밀어낸다** — 맞은 적이 뒤로 밀리는 것이 이 무기의 정체다.
  st.F=st.F||mkFoes([[38,-72,10],[-26,-80,9],[76,-46,10]]);stepFoes(st.F,dt);
  st.b=st.b||[];
  const PEL=[3,4,5,6,7][LV-1], HALF=[20,22,25,28,32][LV-1]*Math.PI/180;
  // 주기는 엔진(kScatterPeriod)과 같은 값이다 — 30% 당겼다(2026-08-10):
  // 사거리가 짧아 한 볼리가 금방 사라지는데 다음이 2초 뒤면 화면이 비는
  // 시간이 더 길어 「느리다」가 아니라 답답하다로 읽혔다.
  const PER=[1.45,1.16,0.90,0.67,0.48][LV-1], RANGE=[.30,.34,.38,.42,.48][LV-1];
  const PIERCE=[0,0,1,2,2][LV-1], BLAST=atL(5);
  const u=saw(t,PER);
  if(u<st.pu){for(let i=0;i<PEL;i++){
      const uu=PEL===1?0:2*i/(PEL-1)-1;
      st.b.push({x:cx,y:cy,a:-Math.PI/2+HALF*uu,s:520,l:0,p:PIERCE,hit:[]});}
    st.mz=.12;}
  st.pu=u;st.mz=Math.max(0,(st.mz||0)-dt);
  for(let i=st.b.length-1;i>=0;i--){const q=st.b[i];q.l+=dt;
    q.x+=Math.cos(q.a)*q.s*dt;q.y+=Math.sin(q.a)*q.s*dt;
    let gone=false;
    for(const f of st.F){
      if(q.hit.indexOf(f)>=0)continue;
      if(Math.hypot(cx+f.ox+f.kx-q.x,cy+f.oy+f.ky-q.y)<f.r+6){
        // 넉백 — hitFoe 의 밀어내기가 곧 그것이다. 낱발은 약하고 여럿이 쌓인다.
        hitFoe(st,f,cx,cy,Math.cos(q.a),Math.sin(q.a),13);
        q.hit.push(f);
        if(BLAST){ // L5 착탄 폭발 — 인접한 적도 함께
          st.fl=st.fl||[];st.fl.push({x:q.x,y:q.y,l:0});
          for(const g of st.F)if(g!==f&&
            Math.hypot(cx+g.ox-q.x,cy+g.oy-q.y)<34){
            const ga=Math.atan2(cy+g.oy-q.y,cx+g.ox-q.x);
            hitFoe(st,g,cx,cy,Math.cos(ga),Math.sin(ga),9,"gold");}
          emit(st,q.x,q.y,9,{k:"gold",sp:190,r:2.6,life:.3,spikeP:.5});}
        if(q.p>0){q.p--;}else{gone=true;}
        break;}}
    if(gone||q.l>RANGE)st.b.splice(i,1);}
  st.fl=(st.fl||[]).filter(f=>(f.l+=dt)<.22);
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 관통탄은 **굵고 밝다** — 뚫는다는 것이 두께로 읽혀야 한다.
  for(const q of st.b)celSpike(c,q.x,q.y,q.a,26,PIERCE>0?7:5.4,"gold",1);
  for(const f of st.fl){const k=1-f.l/.22;celHoop(c,f.x,f.y,34*(1-k*.5),1,0,4*k+1,"gold",k*.8);}
  if(st.mz>0){const f=st.mz/.12;celSplash(c,cx,cy-18,26*f,9,7,"gold",f);}
  drawP(c,st);hero(c,t,cx,cy);},

saber(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ⚠️ 2026-08-08: 궤적은 a1→a0 로 긋는데 판정과 폭발은 a0→a1 로 계산해
  // **방향이 반대**였다(오른쪽에서 왼쪽으로 베는데 폭발은 오른쪽 아래에서 났다).
  // 선단 각 `lead` 하나만 두고 셋이 전부 그것을 읽는다 — 값이 둘이면 또 어긋난다.
  //
  // 재설계 2026-08-10 — **지금까지의 모습이 L5 다.** 반원·긴 사거리는 처음부터
  // 만렙의 그림이었는데 L1 이 그걸 거의 다 갖고 있어 자랄 자리가 없었다.
  // 각과 사거리를 **둘 다** 아래로 늘리고, **빛도 같이 자란다** — 판정만 줄이고
  // 밝기를 두면 「작아졌는데 여전히 눈부신」 그림이 된다.
  st.F=st.F||mkFoes([[60,-40,11],[-52,-52,10],[4,-78,9],[-76,10,10]]);stepFoes(st.F,dt);
  const HALF=[40,52,64,77,90][LV-1]*Math.PI/180;
  const RR=[46,55,66,76,88][LV-1], GLOW=[.45,.58,.72,.86,1][LV-1];
  const u=saw(t,1.1),sw=Math.min(1,ease(u/.26));
  // 정면(위쪽)을 기준으로 좌우 대칭 부채 — 반각이 곧 레벨이다.
  const mid=-Math.PI/2, a0=mid-HALF, a1=mid+HALF;
  const lead=a1-(a1-a0)*sw;                    // 선단: a1 → a0 로 훑는다
  if(u<st.pu)st.done=new Set();st.pu=u;st.done=st.done||new Set();
  st.ct=(st.ct||[]).filter(h=>(h.l+=dt)<.24);
  st.F.forEach((f,i)=>{const fa=Math.atan2(f.oy,f.ox);
    let d=fa;while(d<a0)d+=TAU;while(d>a0+TAU)d-=TAU;
    // 선단이 지나간 쪽(= lead 이상 a1 이하)이 베인 것이다
    if(!st.done.has(i)&&d>=lead&&d<=a1&&Math.hypot(f.ox,f.oy)<RR+f.r){st.done.add(i);
      // [s] 는 물보라 씨앗 — 적 인덱스로 잡는다. 반지름을 씨앗으로 쓰면
      // 크기가 같은 둘이 **똑같은 물보라**를 달아 복사본으로 보인다.
      hitFoe(st,f,cx,cy,Math.cos(fa),Math.sin(fa),36);st.ct.push({f,l:0,s:i*3+2});}});
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  const fade=Math.max(0,1-Math.max(0,u-.26)/.5)*GLOW,seg=Math.max(2,Math.round(24*sw));
  if(sw>.02&&fade>0){
    // 낫처럼 — 시작이 굵고 끝이 극단적으로 뾰족해야 벤 것으로 읽힌다.
    // 굵기 11/4.5/3.2 — 옛 17/7/5 는 사거리(RR 46~88)에 견줘 리본 하나가
    // 부채의 3분의 1을 먹어 「베었다」가 아니라 「덩어리를 휘둘렀다」로 보였다
    // (2026-08-10 사용자 판정). 레벨별 축소는 RR·GLOW 가 이미 맡고 있으니
    // 여기서 줄일 것은 **기준 굵기 자체**다.
    celRibbon(c,arcPts(cx,cy,RR,lead,a1,seg),11*fade,"gold",fade);
    celRibbon(c,arcPts(cx,cy,RR*1.14,lead-(a1-a0)*.02,a1,seg),4.5*fade,"gold",fade*.85);
    celRibbon(c,arcPts(cx,cy,RR*.74,lead+(a1-a0)*.18,a1,seg),3.2*fade,"gold",fade*.6);}
  // 칼끝의 물보라 — **선단이 지나간다**는 표시일 뿐이라 작고 흐리다.
  // 옛 판은 여기에 반지름 22 짜리를 띄웠는데, 그 크기면 타격 표시로 읽혀
  // 「아무도 없는 허공에서 터진다」가 됐다(2026-08-10 사용자 판정).
  if(sw<1)celSplash(c,cx+Math.cos(lead)*RR,cy+Math.sin(lead)*RR,8,7,9,"gold",GLOW*.5);
  // 타격 표시는 **베인 적의 자리**에 뜬다. 넉백을 따라가야(kx·ky) 표시가
  // 적에게 붙은 것으로 보인다 — 벤 순간의 좌표에 박아두면 적만 밀려나고
  // 표시는 남아 둘이 갈라진다.
  for(const h of st.ct){const k=1-h.l/.24;
    celSplash(c,cx+h.f.ox+h.f.kx,cy+h.f.oy+h.f.ky,
      13+9*(1-k),9,h.s,"gold",k*(.6+.4*GLOW));}
  drawP(c,st);hero(c,t,cx,cy);},

// 레이저 — **훑는다.** 2026-08-10 확정(후보 A). 옛 판은 상시 굵기 8~25 의
// 상시 빔이라 L1 이 이미 각성으로 보였고, `atL` 이 한 번도 안 나와 성장표
// 다섯 칸이 전부 같은 그림이었다.
//
// 축은 **각도**다. 「길고 좁은 직선 관통」은 관통탄(신설 예정) 자리라,
// 레이저가 거기 서면 두 무기가 화면에서 같은 물건이 된다. 빔은 끊기지
// 않되(레이저의 정체) **짧다** — 짧으니 훑어야 하고, 훑으니 지나간 자리가
// 남는다(L3 잔열).
lance(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[54,-48,11],[-48,-56,10],[6,-86,9],[-74,-6,10],[70,6,9]]);
  stepFoes(st.F,dt);
  // 레벨: 사거리 → 잔열 → 훑는 폭 → 뒤쪽 하나 더. **L1 은 굵기 4.2 로,
  // 지금 lance 의 상시 8~25 와 견주면 한눈에 약하다.**
  const HALF=[.26,.26,.26,.60,.60][LV-1];        // 훑는 반각
  const LEN =[62,93,93,93,104][LV-1];            // L1 은 칸 안에서 끝나고 L2(+50%)부터 넘는다
  const WID =[4.2,4.8,5.4,6.4,9.0][LV-1];
  const SEAR=atL(3),BOTH=atL(5);
  // ⚠️ 왕복을 톱니로 만들면 **반환점에서 튄다.** 진자를 sin 하나에서 뽑아
  // 주기 끝과 처음이 같은 값·같은 속도로 만나게 한다.
  //
  // ⚠️ 느리면 **잔열이 안 보인다.** 1.05(주기 6s)로 뒀더니 자국이 사는 1초
  // 동안 빔이 몇 도밖에 못 가서, 정지 화면에서 자국이 전부 빔 뒤에 겹쳤다
  // — 진자는 반환점에서 더 오래 머무르므로 특히 양 끝에서 그랬다. 훑는
  // 무기는 **훑는 것이 보이는 속도**라야 한다.
  const ang=-Math.PI/2+Math.sin(t*1.9)*HALF;
  st.sc=st.sc||[];
  // 자국은 **오래 남고 촘촘해야** 부채가 보인다. 짧게(0.75s) 옅게 뒀더니
  // 좁은 부채(L3 은 아직 30°)에서 빔에 가려 아예 안 보였다 — 이 레벨은
  // 「자국이 남는다」가 전부라 안 보이면 레벨이 없는 것과 같다.
  if(SEAR&&R()<dt*34)st.sc.push({a:ang,l:0});
  for(let i=st.sc.length-1;i>=0;i--){const s=st.sc[i];s.l+=dt/1.2;if(s.l>1)st.sc.splice(i,1);}
  const beams=BOTH?[ang,ang+Math.PI]:[ang];
  for(const b of beams){const dx=Math.cos(b),dy=Math.sin(b);
    for(const f of st.F){const px=f.ox+f.kx,py=f.oy+f.ky;
      const pr=px*dx+py*dy,pp=Math.abs(-px*dy+py*dx);
      if(pr>0&&pr<LEN&&pp<WID+f.r*.7&&R()<dt*22)hitFoe(st,f,cx,cy,dx,dy,5);}}
  if(R()<dt*40){const rr=20+R()*(LEN-20);
    emit(st,cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr,1,
      {k:"gold",sp:70,spread:2.4,a:ang,r:2.2,life:.32,spikeP:.5});}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 잔열(L3+) — **빔이 아니라 자국이다.** 굵기를 빔의 절반 아래로 두고
  // 캡슐(celBeam)이 아니라 획으로 그린다. 같은 문법으로 그리면 빔이 여러
  // 자루 나가는 것으로 보여 「훑는다」가 죽는다.
  for(const s of st.sc){const f=1-s.l;
    celStroke(c,[[cx+Math.cos(s.a)*24,cy+Math.sin(s.a)*24],
                 [cx+Math.cos(s.a)*LEN*.88,cy+Math.sin(s.a)*LEN*.88]],
      WID*.55*f+.9,"gold",f*.72);}
  const paint=(cc,b)=>{const dx=Math.cos(b),dy=Math.sin(b);
    celBeam(cc,cx+dx*16,cy+dy*16,cx+dx*LEN,cy+dy*LEN,WID,"gold",1);
    beamEnd(cc,t,cx+dx*16,cy+dy*16,b,18+WID*2.2,"gold",.9,1);};
  paint(c,ang);
  // 뒤쪽 빔은 **몸 앞을 지난다**(탑다운: 아래가 카메라 쪽). front 로 미뤄
  // hero() 뒤에 얹는다 — 안 그러면 각성이 몸 뒤에서 나가는 그림이 된다.
  if(BOTH)front((cc)=>paint(cc,ang+Math.PI));
  drawP(c,st);hero(c,t,cx,cy);},

// B안 「모은다」 — 축은 **점**이다. 선이 아니라 한 자리를 지지므로 관통과
// 절대 안 겹치고, 「레이저 = 렌즈로 모은 빛」이라는 물리에도 맞는다.
// 끊기지 않는 대신 **차오른다** — 실이 팽팽해지다 임계에서 그 점이 터진다.
bunroe(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ── 분뢰 分雷 — **빨대를 꽂는다** (2026-08-10 사용자 확정) ──────────────
  //
  // 이 무기의 정체는 발사가 아니라 **연결**이다:
  //   ① 사거리 안의 적에게 빨대를 꽂는다 (기를 모으는 행위)
  //   ② **수축** — 실이 팽팽해지며 레이저처럼 **약하게 지진다**
  //   ③ **이완** — 그 점이 터지며 **크게** 들어간다
  //   ④ 회수하지 않는다. **적이 죽을 때까지** ②③을 반복한다
  //   ⑤ 다만 움직여서 **사거리를 벗어나면 뽑힌다**
  //
  // ⚠️ 앞선 시안은 주기마다 표적을 갈아탔는데(`st.i=(st.i+NFO)%...`), 그러면
  // 화면에 남는 것은 「여러 적에게 번갈아 쏘는 무기」다 — 꽂아 두는 것이
  // 정체인 무기에서 **연결의 지속**이 안 보이면 정체가 통째로 사라진다.
  // 그래서 표적을 **슬롯에 담아 들고 간다**(st.tt).
  st.F=st.F||mkFoes([[56,-40,11],[-52,-46,10],[2,-82,9],[-34,30,10],[64,24,9]]);
  stepFoes(st.F,dt);
  // ⚠️ 사다리를 한 칸씩 당겼다(2026-08-10). 옛 L2(실 3가닥)는 L1(2가닥)과
  // 화면에서 구분이 안 돼 「레벨이 없는 칸」이었다 — 지워서 뒤를 당기고,
  // 빈 끝칸에 **초점 4개**를 새로 얹었다.
  //   L1 유지 · L2 ← 옛 L3 · L3 ← 옛 L4 · L4 ← 옛 L5 · L5 = 초점 4
  // ⚠️ **실 가닥은 옛 표 그대로 둔다**(2026-08-10 사용자 판정: 「가닥도 너무
  // 많아졌어, 기존 꺼가 맘에 들었는데」). 사다리를 당길 때 가닥까지 같이
  // 당겼더니 L4 가 8, L5 가 10 이 되어 실이 화면을 덮었다 — 성장의 축은
  // **빨대 수**지 가닥이 아니다. 가닥은 초점 하나의 밀도일 뿐이다.
  const NTH=[2,3,4,4,8][LV-1];        // 실 가닥 — 옛 표 그대로
  const NFO=[1,1,2,3,4][LV-1];        // **동시에 꽂는 빨대 수** — 성장의 축
  const BR =[15,19,21,32,34][LV-1];   // 터짐 반경
  const TW =[2.0,2.5,2.9,3.1,4.4][LV-1];
  const RING=atL(2);                  // 터진 자리에 남는 잔광 고리
  // 사거리 — 이 원 밖으로 나가면 뽑힌다. 레벨과 무관하다: 성장은 **몇 개를
  // 동시에 물고 있느냐**지 얼마나 멀리 무느냐가 아니다.
  const RANGE=84, PER=1.15, CH=.74;
  st.tt=st.tt||[];st.sn=st.sn||[];
  // ① 사거리 밖 — **뽑힌다.** 조작으로 끊기는 것이 이 무기의 유일한 약점이라
  //    끊기는 순간이 화면에 남아야 한다(끊긴 실이 튕겨 사라진다).
  for(let i=st.tt.length-1;i>=0;i--){const T0=st.tt[i],f=T0.f;
    if(Math.hypot(f.ox+f.kx,f.oy+f.ky)>RANGE){
      st.sn.push({x:cx+f.ox+f.kx,y:cy+f.oy+f.ky,l:0});st.tt.splice(i,1);}}
  // ② 빈 슬롯에 새로 꽂는다 — 사거리 안에서 **가장 가까운, 아직 안 꽂힌** 적.
  while(st.tt.length<NFO){
    let best=null,bd=RANGE;
    for(const f of st.F){
      if(st.tt.some(T0=>T0.f===f))continue;
      const d=Math.hypot(f.ox+f.kx,f.oy+f.ky);
      if(d<bd){bd=d;best=f;}}
    if(!best)break;
    st.tt.push({f:best,u:0,pu:0});}
  st.sn=st.sn.filter(s0=>(s0.l+=dt)<.3);
  // ③ 수축 → 이완을 **끊지 않고 반복**한다.
  for(const T0 of st.tt){T0.pu=T0.u;T0.u=(T0.u+dt/PER)%1;
    const f=T0.f,fx=cx+f.ox+f.kx,fy=cy+f.oy+f.ky;
    const L0=Math.hypot(fx-cx,fy-cy)||1,ux=(fx-cx)/L0,uy=(fy-cy)/L0;
    if(T0.u<CH){
      // 수축 — 피해는 계속 들어가지만 **타격 반응은 없다**(2026-08-10 사용자
      // 판정). [hitFoe] 를 틱마다 부르면 흰 섬광(`f.hit=1`)과 파편 여섯이
      // 매번 터져 「연타로 두들긴다」가 되는데, 이 무기는 **모기가 피를 빨듯**
      // 물고 가만히 있는 것이다 — 물린 쪽도 가만히 있어야 그 그림이 산다.
      // 빨리고 있다는 정보는 실을 타고 들어오는 알갱이와 물린 자리의 점이
      // 이미 나르고 있으므로, 여기서는 아무 반응도 만들지 않는다.
      //
      // (넉백도 같은 이유로 없다. 밀면 사거리 밖으로 나가 스스로 뽑히는데,
      //  그건 「조작으로 끊긴다」는 이 무기의 유일한 약점을 무의미하게 만든다.)
    }
    else if(T0.pu<CH){
      // 이완 — 그 자리가 터진다. 이것이 이 무기의 피해 대부분이다.
      hitFoe(st,f,cx,cy,ux,uy,20);
      emit(st,fx,fy,10,{k:"gold",sp:180,r:2.8,life:.42,spikeP:.6});}}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 사거리 — 아주 옅게. 이 원이 없으면 「왜 뽑혔는지」가 화면에 없다.
  celHoop(c,cx,cy,RANGE,1,0,1,"gold",.13);
  for(const T0 of st.tt){
    const f=T0.f,fx=cx+f.ox+f.kx,fy=cy+f.oy+f.ky,u=T0.u;
    const g=u<CH?u/CH:1, bf=u<CH?0:1-(u-CH)/(1-CH);
    const ax=fx-cx,ay=fy-cy,L0=Math.hypot(ax,ay)||1,nx=-ay/L0,ny=ax/L0;
    for(let j=0;j<NTH;j++){
      // 실은 **초점 → 몸** 순으로 찍는다. celRibbon 은 앞이 굵고 뒤가
      // 뾰족하니, 이 순서라야 「초점이 제일 밝다」가 나온다.
      // 활의 크기를 **가닥 번호로 벌린다** — hash 로만 흔들었더니 가닥이
      // 둘씩 겹쳐 2가닥과 4가닥이 같은 그림이 됐다.
      const amp=(9+Math.floor(j/2)*8+4*hash(j*3.7))*(j%2?1:-1)*(1-g*.55);
      const P=[];
      for(let s=0;s<=8;s++){const p=s/8,bow=Math.sin(p*Math.PI)*amp;
        P.push([fx+(cx-fx)*p+nx*bow,fy+(cy-fy)*p+ny*bow]);}
      celRibbon(c,P,TW*(.5+.5*g),"gold",.45+.5*g);
      // 실을 타고 들어오는 알갱이 — 정지 화면에서 「모인다」를 읽게 하는 것은
      // 이것 하나다. 양 끝에서 알파가 0 이라 몸에서 튀어나오지도, 초점에서
      // 툭 사라지지도 않는다.
      const p=1-((t*.85+j*.31)%1),bow=Math.sin(p*Math.PI)*amp;
      const mx=fx+(cx-fx)*p+nx*bow,my=fy+(cy-fy)*p+ny*bow;
      celSpike(c,mx,my,Math.atan2(fy-my,fx-mx),7,2.2,"gold",Math.sin(Math.PI*p)*.9);}
    // ⚠️ 여기에 몸↔표적을 잇는 곧은 줄(celBeam)을 그렸다가 걷어냈다
    // (2026-08-10 사용자 판정). 「빨대」는 **메커니즘의 비유**였지 그리라는
    // 그림이 아니었다 — 연결은 활처럼 휜 실들이 이미 그리고 있고, 거기에
    // 직선을 하나 더 얹으면 레이저가 한 자루 붙은 다른 무기가 된다.
    // 물린 자리 — 수축 동안 **조용히** 밝아지는 점 하나. 이것이 「빨리고
    // 있다」의 전부다: 터질 때만 갈라진다.
    if(bf<=0)celSplash(c,fx,fy,3+BR*.34*g,7,3,"gold",.4+.6*g);
    else{const gg=1-bf;
      if(RING)celHoop(c,fx,fy,BR*(.6+1.5*gg),1,0,5*bf+1.5,"gold",bf*.8);
      celSplash(c,fx,fy,BR*(.7+.5*gg),9,11,"gold",bf);}}
  // 뽑힌 자리 — 끊긴 실이 표적 쪽으로 튕겨 사라진다.
  for(const s0 of st.sn){const f=1-s0.l/.3;
    const dx=s0.x-cx,dy=s0.y-cy,L0=Math.hypot(dx,dy)||1;
    celBeam(c,cx+dx*(1-f)*.55,cy+dy*(1-f)*.55,s0.x,s0.y,2.4*f,"gold",f*.5);
    celSpike(c,s0.x,s0.y,Math.atan2(dy,dx),12*f,3*f,"gold",f*.6);}
  drawP(c,st);hero(c,t,cx,cy);},


basic(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ── 기본 공격 — **항상 나간다** (2026-08-10 신설) ──────────────────────
  //
  // 스킬이 아니다: 슬롯을 안 먹고 3택에도 안 뜬다. 그래서 이 시안의 [LV] 는
  // **스킬 레벨이 아니라 캐릭터 레벨**이다 — 아래 표가 그 대응이다.
  // 기본 공격은 고를 것이 없으므로 「무엇을 키울까」가 아니라 「가만히 있어도
  // 뒤처지지는 않는다」는 바닥이고, 빌드의 결정은 스킬이 가져간다.
  //
  // 그림도 그 자리에 맞게 **제일 심플하다**: 작은 총알 하나. 화려하면 매 판
  // 처음부터 끝까지 보이는 것이 화면을 먹는다.
  //
  // ⚠️ 수치는 엔진(`lib/sim/combat/basic.dart`)의 식을 그대로 쓴다 —
  //   주기 = max(0.34, 0.85 − 0.008 × (레벨−1))
  // 탄속만 시안 칸(반너비 93px)에 맞춰 줄였다. 엔진 430 을 그대로 쓰면 한
  // 프레임에 칸을 가로지른다(다른 무기에 적은 것과 같은 이유).
  const CL=[1,15,30,45,60][LV-1];              // 캐릭터 레벨
  const PER=Math.max(.34,.85-.008*(CL-1));
  // ⚠️ **칸 크기에 맞춰 전부 같이 커진다.** 속성 칸을 420px 로 키웠더니 몸도
  // 적도 총알도 238px 기준 그대로라 「넓은 빈 화면에 점 몇 개」가 됐다
  // (2026-08-10 사용자 판정). 여기에 곧 패시브가 올라오므로, 보이는 것이
  // 커져야 그 위에 얹을 자리가 생긴다. 기준은 238 — 레벨 칸이 그 크기다.
  const SC=Math.min(W,H)/238;
  const WHITE=TK("gold")==="white";      // 백광 — 탄의 규칙이 바뀐다
  st.F=st.F||mkFoes([[58,-52,11],[-56,-44,10],[6,-84,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  st.b=st.b||[];st.acc=(st.acc||0)+dt;
  if(st.acc>PER){st.acc=0;
    // 조준은 **가장 가까운 적**이다. 정면으로만 쏘면 조준이 곧 조작이 되는데,
    // 기본 공격은 「신경 안 써도 나가는 것」이라 그러면 안 된다.
    let best=null,bd=1e9;
    for(const f of st.F){const d=Math.hypot(f.ox+f.kx,f.oy+f.ky);
      if(d<bd){bd=d;best=f;}}
    const a=best?Math.atan2(best.oy+best.ky,best.ox+best.kx):-Math.PI/2;
    st.b.push({x:cx,y:cy,a,l:0,tr:[]});
    st.mz=.1;}                                  // 총구 섬광
  st.mz=Math.max(0,(st.mz||0)-dt);
  for(let i=st.b.length-1;i>=0;i--){const q=st.b[i];q.l+=dt;
    q.x+=Math.cos(q.a)*230*SC*dt;q.y+=Math.sin(q.a)*230*SC*dt;
    q.tr.push([q.x,q.y]);if(q.tr.length>4)q.tr.shift();
    for(const f of st.F)
      if(Math.hypot(cx+f.ox+f.kx-q.x,cy+f.oy+f.ky-q.y)<f.r+4*SC){
        hitFoe(st,f,cx,cy,Math.cos(q.a),Math.sin(q.a),12*SC);
        f.pv=1.0;                       // 패시브가 걸린 시간
        // 백광 — **한 번 튕긴다.** 맞은 놈을 뺀 가장 가까운 적으로.
        // 유도탄 분열과 같은 규칙이다: 맞은 놈을 안 빼면 코앞에서 두 번
        // 터져 「튕겼다」가 화면에 안 남는다.
        if(WHITE&&!q.bo){let bt=null,bd=1e9;
          for(const g0 of st.F){if(g0===f)continue;
            const d=Math.hypot(cx+g0.ox+g0.kx-q.x,cy+g0.oy+g0.ky-q.y);
            if(d<bd){bd=d;bt=g0;}}
          if(bt)st.b.push({x:q.x,y:q.y,l:0,tr:[],bo:1,
            a:Math.atan2(cy+bt.oy+bt.ky-q.y,cx+bt.ox+bt.kx-q.x)});}
        emit(st,q.x,q.y,5,{k:"gold",sp:150*SC,r:2*SC,life:.24,spikeP:.6});
        q.l=9;break;}
    if(q.l>1.4||Math.hypot(q.x-cx,q.y-cy)>W*.6)st.b.splice(i,1);}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  // 패시브 표식 — **뒤 층 → 적 → 앞 층**. 적의 몸이 그대로 마스크가 되어,
  // 감는 띠가 뒤로 지날 때 실제로 가려진다.
  const PK=PASSIVE[TK("gold")];
  const mark=(L)=>{if(!PK)return;
    for(const f of st.F)if(f.pv>0)
      pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,PK,f.pv,t,TK("gold"),SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // 탄 — 짧고 단단한 캡슐 하나.
  //
  // ⚠️ 처음엔 6.5×2.4 에 꼬리도 없이 그렸는데 **화면에서 안 보였다**
  // (2026-08-10 렌더 판정). 「심플」은 요소를 줄이는 것이지 안 보이게 하는
  // 것이 아니다 — 크기를 조금 올리고 **아주 짧은 꼬리** 하나만 붙인다.
  // 꼬리가 넷 프레임뿐이라 획이 아니라 「지나간 자국」으로 남는다.
  for(const q of st.b){if(q.l>2)continue;
    celRibbon(c,q.tr,(WHITE?3.0:2.0)*SC,"gold",WHITE?.6:.45);
    // 백광 탄은 **굵고 길다** — 피해 ×2 와 방어 무시가 낱값이라 화면에 안
    // 보이므로, 보이는 자리에서 한 번 말해 준다.
    celRound(c,q.x,q.y,q.a,(WHITE?11:8.5)*SC,(WHITE?4.4:3.2)*SC,"gold",1,0);
    if(WHITE)celSpike(c,q.x-Math.cos(q.a)*9*SC,q.y-Math.sin(q.a)*9*SC,
      q.a+Math.PI,9*SC,3.4*SC,"gold",.6);}
  // ⚠️ **몸도 같이 물든다**(2026-08-10 사용자 판정). 다른 무기 타일은 몸을
  // 늘 무속성으로 그리는데, 그건 물리 무기의 속성이 **무기에 부여**된 것이라
  // 캐릭터는 그대로이기 때문이다. 기본 공격은 반대다 — 속성이 **캐릭터의
  // 것**이라 몸이 변한 뒤 그 몸이 쏘는 것이고, 몸만 회백이면 「누가 이 색
  // 탄을 쏘는가」가 화면에서 어긋난다.
  drawP(c,st);hero(c,t,cx,cy,TK("gold"),SC);
  // 총구 섬광 — 몸 앞에 아주 작게. 이것 하나로 「내가 쐈다」가 붙는다.
  if(st.mz>0&&st.b.length){const q=st.b[st.b.length-1],f=st.mz/.1;
    celSplash(c,cx+Math.cos(q.a)*15*SC,cy+Math.sin(q.a)*15*SC,
      (5+7*(1-f))*SC,7,3,"gold",f);}},
basicMani(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ── 발현 중의 기본 공격 (2026-08-11) ─────────────────────────────────────
  //
  // 발동 규칙: 게이지는 **적 처치**로 찬다(일반 1 · 특수 10). 100 이 차면
  // **즉시 자동 발동** → **15초 유지** → **60초 잠금** → 다시 충전.
  // ⚠️ 60초 유지·30초 잠금 안은 실측으로 반려했다 — 스테이지 1 은 초당 12.3
  // 마리라 100마리가 8.2초면 차서 가동률이 61% 가 된다. 판의 절반이 발현이면
  // 그건 특별한 상태가 아니라 기본 상태다. 15/60 이면 세 스테이지가 14~18% 로
  // 수렴하고, 실제 조절 손잡이는 잠금이 된다.
  //
  // 그림은 **유도탄(불티 안)의 문법**을 그대로 쓴다(사용자 지시). 가는 두
  // 가닥이 축을 감고, 가닥에서 불티가 떨어지고, 머리는 늘인 타원 창끝이다.
  // 낱값은 [BW] 하나에 묶어 속성별 변주를 얹어도 안 흐트러지게 한다.
  const SC=Math.min(W,H)/238, KEY=TK("gold");
  const BW=5.2*SC;                       // 평소(3.2)보다 굵되 스킬보다는 가늘다
  st.sub=st.sub||{p:[]};
  st.F=st.F||mkFoes([[58,-52,11],[-56,-44,10],[6,-84,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const CL=[1,15,30,45,60][LV-1];
  const PER=Math.max(.34,.85-.008*(CL-1));
  st.b=st.b||[];st.sp=st.sp||[];st.hz=st.hz||[];st.zp=st.zp||[];st.fl=st.fl||[];
  st.acc=(st.acc||0)+dt;
  // 속성별 변주 — 지금까지 확정된 것만. 나머지는 공통 바닥 그대로다.
  const ROCK  = KEY==="gold";                              // 무 — 돌멩이, 2회 튕김
  // ── 불계열 — **맞으면 작게 터지고 점화가 남는다** (2026-08-11 사용자 확정)
  // 장판(자리를 태운다)에서 소폭발로 바꿨다. 셋이 **폭발의 모양**으로 갈리는
  // 것이 계열로 읽히는 방식이고, 지속 장판보다 단순하다.
  //   염   화르륵 — 불길이 **위로 솟는다**
  //   불씨 펑 — 산소를 먹고 **사방으로 균등하게** 확 퍼진다
  //   연   펑 — **어둡게** 터지고 주변에 연기가 남는다
  // ⚠️ 연만 점화가 아니라 **실명**이 남는다. 연의 패시브가 실명인데 폭발 뒤
  // 점화가 남으면 한 속성이 두 말을 한다 — 남는 것은 연기이고 연기는 가린다.
  const FIRE  = KEY==="ember"||KEY==="fstorm"||KEY==="smoke";
  const BOOM  = KEY==="ember"?"up":KEY==="fstorm"?"even":"gas";
  // 빙계열 — 축은 **번진다**. 둘이 「어디로 번지나」로 갈린다.
  //   빙 맞은 놈의 **이웃까지** 언다 — 사람으로 번진다
  //   설 맞은 놈만 얼되 **얼음 조각이 자리에 남아** 지나가는 적을 둔화 —
  //      자리로 번진다. 번짐이 사람이 아니라 땅에 남는 것이 이 갈림이다.
  const ICE   = KEY==="frost"||KEY==="snow";
  const ZAP   = KEY==="volt"||KEY==="blast"||KEY==="magnet"; // 뇌 — 2명에게 튕김
  // 독계열 — 축은 **관통**. 탄이 뚫고 지나가며 지나간 **전원**에게 자기 상태를
  // 건다. 독의 「약하고 길다 · 자동 중첩」과 정확히 맞아, 뚫을수록 쌓인다.
  // ⚠️ 유도탄 분열과 다르다: 분열은 **갈라지고** 관통은 **한 줄**이다.
  const PIERCE= KEY==="toxin"||KEY==="murk"||KEY==="plague"||KEY==="numb";
  // 풍계열 — 축은 **끌어당긴다**. 넉백의 정확한 반대라 이 게임에 없던 축이고,
  // 뭉쳐 주니 다른 무기 **전부와 시너지**가 난다. 뢰명은 끌어온 뒤 침묵.
  const PULL  = KEY==="gale"||KEY==="thunder";
  // 수계열 — 축은 **자란다**. 날아갈수록 커지고 세진다. 멀수록 강한 유일한
  // 무기라, 조준이 없는 기본 공격에 「거리를 벌리는 이유」가 생긴다.
  const GROW  = KEY==="aqua";
  // 백광 — 축은 **시한(時限)**이다. 즉발(불)·연쇄(뇌)·관통(독) 어디와도 안
  // 겹치고, 「맞히고 1초 뒤」라 **어디서 터질지를 미리 읽는** 놀이가 생긴다.
  //   ① 본체가 주기적으로 **충격파**를 낸다 — 범위 안 적이 맞는다
  //   ② 기본 공격에 맞은 적은 **맞을 때 한 번** 아프고, **1초 뒤 터지며 또**
  //      아프다 — 같은 충격파가 그 자리에서 일어나 **주변 적까지** 함께 맞는다.
  //      즉 심은 놈은 두 번, 옆에 선 놈은 한 번이다
  // 둘이 **같은 그림**인 것이 핵심이다: 본체에서 나는 것과 적에게서 나는 것이
  // 같아야 「내가 심어 놓은 것이 터졌다」로 읽힌다.
  const WHITE = KEY==="white";
  // 어둠 — 축은 **설치**다. 맞은 자리에 **블랙홀**이 남아 주변을 계속 끌어당긴다.
  //
  // ⚠️ 풍계열도 끌어당기지만 **결이 다르다**: 풍은 **사건**(명중 순간 한 번
  // 확 당기고 끝)이고 어둠은 **물건**(그 자리에 남아 계속 당긴다). 같은
  // 「당김」이라도 한 번이냐 계속이냐로 갈리면 축이 겹치지 않는다.
  //
  // 덤이 하나 붙는다 — 어둠의 패시브가 **출혈(움직일수록 아프다)**이라,
  // 끌려다니는 동안 계속 아프다. 두 층이 같은 말을 한다.
  //
  // 그림은 이 게임에서 **유일하게 어두운 것**이다(TONE.shade 의 「유일하게
  // 어두워지는 속성」 규칙). 다른 전부가 밝게 터질 때 어둠만 빛을 삼킨다.
  const HOLE  = KEY==="shade";
  const HLIFE=2.4;
  const WPER=1.6, WFUSE=1.0;             // 본체 주기 · 심지 길이(초)
  const near=(x,y,ex)=>{let bt=null,bd=1e9;
    for(const f of st.F){if(ex&&ex.indexOf(f)>=0)continue;
      const d=Math.hypot(cx+f.ox+f.kx-x,cy+f.oy+f.ky-y);
      if(d<bd){bd=d;bt=f;}}
    return bt;};
  if(st.acc>PER){st.acc=0;
    const f0=near(cx,cy,null);
    const a=f0?Math.atan2(f0.oy+f0.ky,f0.ox+f0.kx):-Math.PI/2;
    st.b.push({x:cx,y:cy,a,l:0,tr:[],bo:0});st.mz=.1;}
  st.mz=Math.max(0,(st.mz||0)-dt);
  // ① 본체 충격파 — **그림은 안 그린다.**
  //
  // ⚠️ 백광 본체는 **이미 스스로 충격파를 내는 확정 디자인**이다. 여기에
  // 하나를 더 덧그렸다가 본체 그림을 망쳤다(2026-08-11 사용자 판정:
  // 「공격 디자인 바꾸라 했더니 본체 디자인을 바꾸네」). **본체는 손대지 않는다** —
  // 발현 작업이 건드릴 것은 기본 공격이지 몸이 아니다.
  //
  // 그래서 여기서는 **피해 판정만** 얹는다. 이미 나고 있는 그 충격파의 순간에
  // 범위 안 적이 맞는다는 규칙이고, 화면에 새로 그리는 것은 없다.
  if(WHITE){st.wv=(st.wv||0)+dt;
    if(st.wv>WPER){st.wv=0;
      for(const f of st.F)
        if(Math.hypot(f.ox+f.kx,f.oy+f.ky)<BW*10)hitFoe(st,f,cx,cy,0,0,6*SC);}}
  // ② 심지 — 맞은 적이 1초 뒤 터진다. 터지면 **주변 적까지** 맞는다.
  for(const f of st.F){if(!(f.wb>0))continue;
    f.wb-=dt;
    if(f.wb<=0){f.wb=0;
      const wx=cx+f.ox+f.kx,wy=cy+f.oy+f.ky;
      st.fl.push({x:wx,y:wy,r:BW*8,l:0,ice:0,bm:"shock"});
      for(const g0 of st.F){
        const d=Math.hypot(cx+g0.ox+g0.kx-wx,cy+g0.oy+g0.ky-wy);
        if(d<BW*8){const a=Math.atan2(cy+g0.oy+g0.ky-wy,cx+g0.ox+g0.kx-wx);
          hitFoe(st,g0,cx,cy,Math.cos(a),Math.sin(a),14*SC);g0.pv=1.0;}}}}
  for(let i=st.b.length-1;i>=0;i--){const q=st.b[i];q.l+=dt;
    // 수 — **자란다.** 날아간 거리가 곧 크기이고 위력이다(상한 2.2배).
    q.gw=GROW?Math.min(2.2,1+q.l*1.5):1;
    q.x+=Math.cos(q.a)*230*SC*dt;q.y+=Math.sin(q.a)*230*SC*dt;
    q.tr.push([q.x,q.y]);if(q.tr.length>16)q.tr.shift();
    if(q.tr.length>4&&R()<dt*60){
      const V0={n:2,w:BW*.20,amp:BW*.58,freq:.72,knot:0};
      const S0=helixStrands(q,t,V0),g0=S0[(R()*2)|0],pt=g0[(g0.length*.55)|0];
      if(pt)st.sp.push({x:pt[0],y:pt[1],vx:(R()-.5)*46*SC,
        vy:(R()-.5)*46*SC,l:0,r:BW*.28});}
    let hit=null;
    for(const f of st.F)
      if(Math.hypot(cx+f.ox+f.kx-q.x,cy+f.oy+f.ky-q.y)<f.r+4*SC*(q.gw||1)){hit=f;break;}
    if(hit&&PIERCE&&(q.pc||0)<4&&hit!==q.last){
      // 관통 — 뚫고 **지나간다.** 같은 적을 다음 프레임에 또 물지 않게
      // [last] 로 막는다(엔진 관통이 탄을 몸 반대편으로 내보내는 것과 같은 뜻).
      hitFoe(st,hit,cx,cy,Math.cos(q.a),Math.sin(q.a),8*SC);
      hit.pv=1.0;q.pc=(q.pc||0)+1;q.last=hit;
      st.hz.push({x:q.x,y:q.y,a:q.a,l:0,w:BW*.7});
      hit=null;}
    if(hit){
      hitFoe(st,hit,cx,cy,Math.cos(q.a),Math.sin(q.a),12*SC);
      hit.pv=1.0;st.hz.push({x:q.x,y:q.y,a:q.a,l:0,w:BW});
      if(WHITE&&!(hit.wb>0))hit.wb=WFUSE;   // 심지를 심는다
      // 블랙홀을 **놓는다**. 하나만 산다 — 여럿이 겹치면 적이 어디로 끌리는지
      // 아무도 못 읽고, 「설치」가 아니라 「도배」가 된다.
      if(HOLE){st.fl=st.fl.filter(f0=>f0.bm!=="hole");
        st.fl.push({x:cx+hit.ox+hit.kx,y:cy+hit.oy+hit.ky,
          r:BW*4.2,l:0,ice:0,bm:"hole"});}
      // 불계열 — 명중 자리에서 **작게 터진다.** 폭발 반경 안의 적에게 남는
      // 것(점화 · 연은 실명)은 아래 장판 판정이 그대로 맡는다.
      if(FIRE)st.fl.push({x:cx+hit.ox+hit.kx,y:cy+hit.oy+hit.ky,
        r:BW*(BOOM==="even"?3.2:2.6),l:0,ice:0,bm:BOOM});
      // 무 — **두 번 튕긴다.** 맞은 놈을 빼고 가장 가까운 적으로. 안 빼면
      // 코앞에서 두 번 터져 「튕겼다」가 화면에 안 남는다(유도탄 분열과 같은 규칙).
      if(ROCK&&q.bo<2){const nx=near(q.x,q.y,[hit]);
        if(nx)st.b.push({x:q.x,y:q.y,l:0,tr:[],bo:q.bo+1,
          a:Math.atan2(cy+nx.oy+nx.ky-q.y,cx+nx.ox+nx.kx-q.x)});}
      // 뇌 — **인근 둘에게 옮겨 붙는다.** 옮겨 붙은 쪽에도 같은 상태가
      // 걸려야 「튀었다」가 그림뿐인 거짓말이 안 된다.
      if(ZAP){const ex=[hit];
        for(let z=0;z<2;z++){const nx=near(cx+hit.ox+hit.kx,cy+hit.oy+hit.ky,ex);
          if(!nx)break;ex.push(nx);nx.pv=1.0;
          st.zp.push({a:ex[z],b:nx,l:0});}}
      // 빙 — **맞은 놈의 이웃까지 언다.** 튕기는 것이 아니라 **번지는** 것이라
      // 줄기를 안 그리고 상태만 옮긴다(전기와 이 점이 갈린다).
      if(ICE){
        if(KEY==="frost"){const nx=near(cx+hit.ox+hit.kx,cy+hit.oy+hit.ky,[hit]);
          if(nx){nx.pv=1.0;st.fl.push({x:cx+hit.ox+hit.kx,y:cy+hit.oy+hit.ky,
            r:0,l:0,ice:1});}}
        else st.fl.push({x:cx+hit.ox+hit.kx,y:cy+hit.oy+hit.ky,
          r:BW*2.4,l:0,ice:0,bm:"shard"});}   // 설 — 자리에 조각이 남는다
      // 풍 — **빨아들인다.** 넉백과 부호만 다르다(kx·ky 를 몸 쪽으로 민다).
      if(PULL)for(const f of st.F){
        const dx=(cx+hit.ox+hit.kx)-(cx+f.ox+f.kx),dy=(cy+hit.oy+hit.ky)-(cy+f.oy+f.ky);
        const d=Math.hypot(dx,dy);
        if(d<BW*7&&d>1){f.kx+=dx/d*BW*1.6;f.ky+=dy/d*BW*1.6;
          if(KEY==="thunder")f.pv=1.0;}}
        if(PULL)st.fl.push({x:cx+hit.ox+hit.kx,y:cy+hit.oy+hit.ky,
          r:BW*7,l:0,ice:0,bm:"pull"});
      st.b.splice(i,1);continue;}
    // 염 — **못 맞혀도 사거리 끝에서 터진다.** 그 자리에 작은 불꽃 장판이
    // 남고, 밟은 적에게 점화가 걸린다. 기본은 맞아야 타지만 발현은 **자리를
    // 태운다** — 조준이 없는 무기에 「빗나가도 쓸모」를 주는 것이 이 변주다.
    const dead=q.l>1.4||Math.hypot(q.x-cx,q.y-cy)>W*.6;
    if(dead){
      // ⚠️ **염만 빗나가도 끝에서 터진다.** 장판을 버리면서 조준 없는 무기에
      // 유일했던 「빗나가도 쓸모」가 사라지는데, 이 한 줄이 그걸 되돌린다 —
      // 몰린 적 앞에 일부러 쏘는 판단이 여기서 나온다.
      if(KEY==="ember")st.fl.push({x:q.x,y:q.y,r:BW*2.6,l:0,ice:0,bm:"up"});
      st.b.splice(i,1);}}
  for(let i=st.sp.length-1;i>=0;i--){const s0=st.sp[i];s0.l+=dt;
    s0.x+=s0.vx*dt;s0.y+=s0.vy*dt;s0.vx*=.94;s0.vy*=.94;
    if(s0.l>.5)st.sp.splice(i,1);}
  st.hz=st.hz.filter(h=>(h.l+=dt)<.26);
  st.zp=st.zp.filter(z=>(z.l+=dt)<.22);
  // 장판 — 불은 오래(2.4s), 냉기 번짐은 짧게(0.5s). 수명이 곧 성격이다.
  // 블랙홀 — 사는 동안 **계속** 끌어당긴다. 끌려오는 동안 출혈이 쌓이므로
  // 여기서 상태도 같이 걸어 준다(움직이니까 아프다는 규칙 그대로).
  for(const f0 of st.fl){if(f0.bm!=="hole")continue;
    for(const f of st.F){
      const dx=f0.x-(cx+f.ox+f.kx),dy=f0.y-(cy+f.oy+f.ky),d=Math.hypot(dx,dy);
      if(d>f0.r*2.6||d<1)continue;
      // ⚠️ **중력이라 가까울수록 세게 당긴다.** 일정한 힘으로 끌면 적이 제자리에
      // 묶인 것처럼 보인다(2026-08-11 사용자 판정: 「묶인 느낌보다는 빨려
      // 들어가는 느낌이어야」). 거리에 반비례하게 주면 멀리서는 슬슬 끌려오다
      // 가까이서 **확 빨려든다** — 그 가속이 곧 「빨려든다」다.
      const pull=(1-d/(f0.r*2.6));
      const acc=(26+150*pull*pull)*SC*dt;
      f.kx+=dx/d*acc;f.ky+=dy/d*acc;f.pv=1.0;
      // 중력은 **압축한다.** 코앞까지 끌려온 적은 구멍 쪽으로 눌린다 —
      // 빨아먹히는 것으로 읽히게 하는 것은 당김이 아니라 이 찌그러짐이다.
      if(d<f0.r*.9){f.kx+=dx/d*acc*1.6;f.ky+=dy/d*acc*1.6;}}}
  // 수명이 곧 성격이다 — 폭발은 짧고(0.42s), **연기만 오래 남는다**(1.8s).
  // 냉기 번짐은 그 사이(0.5s).
  st.fl=st.fl.filter(f0=>(f0.l+=dt)<(f0.ice?.5:
    f0.bm==="gas"?.9:f0.bm==="shard"?1.6:f0.bm==="shock"?.34:f0.bm==="hole"?HLIFE:
    f0.bm==="even"?.30:.62));
  for(const f0 of st.fl)if(!f0.ice&&f0.bm!=="pull"&&f0.bm!=="shock")for(const f of st.F)
    if(Math.hypot(cx+f.ox+f.kx-f0.x,cy+f.oy+f.ky-f0.y)<f0.r+f.r)f.pv=1.0;
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  // 불꽃 장판 — 적보다 **아래**에 깔린다. 위에 그리면 적을 덮어 「밟는다」가
  // 아니라 「가린다」가 된다.
  for(const f0 of st.fl){
    // ⚠️ 충격파는 **여기서 안 그린다.** 적보다 위에 그려야 해서 별도 패스로
    // 뺐는데, 여기서 건너뛰게 하는 것을 빠뜨려 아래 마지막 갈래(염의 위로
    // 솟는 불길)로 떨어졌다 — 그것이 흰색으로 그려진 것이 사용자가 본
    // **「삐죽삐죽 뿔기둥」**이다(2026-08-11). 갈래를 옮길 때는 원래 자리에서
    // 빠져나가는 길도 같이 옮겨야 한다.
    if(f0.bm==="shock")continue;
    // 빙 — 이웃으로 **번지는** 냉기. 자리에 남지 않고 한 번 퍼졌다 사라진다.
    //
    // ⚠️ 이 갈래가 한 번 사라진 적이 있다(2026-08-11). 블랙홀 블록을 다시
    // 쓰면서 잘라낸 구간에 같이 들어갔고, 그러자 빙의 번짐(반지름 0)이 맨
    // 아래 염 갈래로 떨어져 `celHoop` 이 음수 반지름(-0.33)으로 죽었다 —
    // 시안 전체가 아니라 **빙 계열만** 조용히 오류가 났다.
    // 갈래를 지울 때는 무엇이 그 갈래로 오고 있었는지부터 본다.
    if(f0.ice){const g=f0.l/.5;
      celHoop(c,f0.x,f0.y,BW*(1.5+5*g),1,0,3*(1-g)+1,KEY,(1-g)*.85);continue;}
    if(f0.bm==="hole"){
      // 블랙홀 — **빛을 삼킨다.**
      //
      // ⚠️ 세 번 고쳤고, 앞의 둘은 방식 자체가 틀렸다. 셀 리본은 「어두운
      // 소용돌이 무늬」, 발광 나선은 「머리카락」, 굵게 줄여도 「스파게티」였다
      // (2026-08-11 사용자 판정). **나선을 쓰는 한 계속 국수**다 — 길게 감긴
      // 곡선은 무엇으로 그려도 가닥으로 읽힌다.
      //
      // 그래서 **곡선을 통째로 버렸다.** 빨려드는 것을 나타내는 데 곡선은
      // 필요 없다. 필요한 것은 둘뿐이다:
      //   ① **좁혀드는 고리** — 바깥에서 나서 안으로 조여들며 밝아진다.
      //      구조를 맡는다. 고리는 하나만 봐도 「전부 안으로 간다」가 읽힌다
      //   ② **곧게 빨려드는 불티** — 운동을 맡는다. 직선이라 가닥이 안 된다
      // 회전은 고리의 **기울기**로만 준다 — 도는 것이 아니라 감긴 것이라서.
      const g=Math.min(1,f0.l/.25), fade=Math.min(1,(HLIFE-f0.l)/.5);
      const RR0=f0.r*g*fade;
      // 어두운 코어 — 배경보다 더 어둡다. 빛이 사라지는 자리다.
      const gr=c.createRadialGradient(f0.x,f0.y,0,f0.x,f0.y,RR0*1.9);
      gr.addColorStop(0,A("#000000",.95*fade));
      gr.addColorStop(.42,A("#000000",.78*fade));
      gr.addColorStop(1,A("#000000",0));
      c.fillStyle=gr;c.beginPath();c.arc(f0.x,f0.y,RR0*1.9,0,TAU);c.fill();
      gAdd(c,c=>{
        const T0=toneOf(KEY);
        // ① 좁혀드는 고리 셋 — 위상을 어긋내 끊임없이 안으로 들어간다.
        for(let z=0;z<3;z++){
          const u=((f0.l*1.5+z/3)%1);              // 0 바깥 → 1 코어
          const rr=RR0*(1.75-u*1.30);
          const al=fade*Math.sin(Math.min(1,u*1.15)*Math.PI)*.95;
          if(al<=0.01)continue;
          gHalo(c,f0.x,f0.y,rr*.30,KEY,al*.25);    // 고리 안쪽의 번짐
          c.strokeStyle=A(T0[1],al*.55);c.lineWidth=(3.4-2.0*u)*SC;
          c.beginPath();c.ellipse(f0.x,f0.y,rr,rr*.72,.5,0,TAU);c.stroke();
          c.strokeStyle=A("#FFFFFF",al*.85);c.lineWidth=(1.3-.8*u)*SC;
          c.beginPath();c.ellipse(f0.x,f0.y,rr,rr*.72,.5,0,TAU);c.stroke();}
        // ② 곧게 빨려드는 불티 — **직선**이라 가닥이 안 된다. 안으로 갈수록
        //    빨라지고(u²) 작아지고 밝아진다.
        for(let z=0;z<14;z++){
          const ph=((f0.l*1.35+z*.0714)%1), u=ph*ph;
          const a0=z*2.399+f0.x*.01;
          const rr=RR0*(1.9-u*1.55);
          const px=f0.x+Math.cos(a0)*rr, py=f0.y+Math.sin(a0)*rr*.72;
          const al=fade*(1-ph*.55);
          gHalo(c,px,py,(4.6-3.0*ph)*SC*fade+.5,KEY,al*.9);
          // 짧은 잔상 — 뒤로 조금만. 길면 그것이 다시 가닥이 된다.
          const qx=f0.x+Math.cos(a0)*rr*1.13, qy=f0.y+Math.sin(a0)*rr*1.13*.72;
          c.strokeStyle=A(T0[2],al*.45);c.lineWidth=(2.2-1.4*ph)*SC;
          c.lineCap="round";c.beginPath();c.moveTo(qx,qy);c.lineTo(px,py);c.stroke();}
        // ③ 사건의 지평선 — 빛이 마지막으로 남는 테두리.
        gHalo(c,f0.x,f0.y,RR0*.95,KEY,fade*.5);
        c.strokeStyle=A(T0[2],fade*.95);c.lineWidth=2.2*SC;
        c.beginPath();c.ellipse(f0.x,f0.y,RR0*.55,RR0*.55*.72,.5,0,TAU);c.stroke();
        c.strokeStyle=A("#FFFFFF",fade*.8);c.lineWidth=1.0*SC;
        c.beginPath();c.ellipse(f0.x,f0.y,RR0*.47,RR0*.47*.72,.5,0,TAU);c.stroke();});
      continue;}
    if(f0.bm==="shard"){
      // 설 — 자리에 남는 **얼음 조각**. 오래 남고(1.6s) 각지다. 지나가는 적을
      // 둔화시키는 것이므로 **바닥에 깔리는 납작한 형태**여야 한다.
      const fade=Math.min(1,(1.6-f0.l)/.5),g=Math.min(1,f0.l/.2);
      for(let z=0;z<5;z++){const a=z/5*TAU+f0.x*.05;
        celSpike(c,f0.x+Math.cos(a)*f0.r*g*.6,f0.y+Math.sin(a)*f0.r*g*.3,
          a,f0.r*.5*g,f0.r*.2,KEY,fade*.8);}
      continue;}
    if(f0.bm==="pull"){
      // 풍 — **빨아들인다.** 안으로 감겨 드는 호 셋. 밖으로 퍼지는 폭발과
      // 정확히 반대 방향이라, 그 방향 하나가 「밀지 않고 당긴다」를 말한다.
      const ff=1-f0.l/.42;if(ff<=0){continue;}
      for(let z=0;z<3;z++){const a0=z/3*TAU+t*2.2;
        const P=[];
        for(let j=0;j<=8;j++){const u=j/8,rr=f0.r*(1-u*.85)*(.35+.65*ff);
          P.push([f0.x+Math.cos(a0+u*2.2)*rr,f0.y+Math.sin(a0+u*2.2)*rr*.62]);}
        celRibbon(c,P,3.2*SC*ff,KEY,ff*.85);}
      continue;}
    if(f0.bm==="gas"){
      // 연 — **어둡게 터지고 연기가 남는다.** 밝은 폭발이 아니라 어두운
      // 덩어리가 부풀어 오르는 것이라, 고리 대신 뭉게뭉게 퍼프를 겹친다.
      // ⚠️ 연기를 **약하고 짧게**(2026-08-11 사용자 판정). 1.8초 · 알파 .5 는
      // 화면을 오래 덮어 「폭발」이 아니라 「배경이 바뀐 것」으로 보였다.
      const g=Math.min(1,f0.l/.35), fade=Math.min(1,(.9-f0.l)/.45);
      for(let z=0;z<4;z++){const a=z/4*TAU+t*.35;
        celPuff(c,f0.x+Math.cos(a)*f0.r*g*.55,f0.y+Math.sin(a)*f0.r*g*.4,
          f0.r*(.4+.28*g),9,z*3+1,KEY,fade*.28);}
      if(f0.l<.34){const ff=1-f0.l/.34;
        celHoop(c,f0.x,f0.y,f0.r*(.5+1.1*(1-ff)),.8,0,4*ff+1,KEY,ff*.7);}
      continue;}
    // ⚠️ 염과 불씨가 **구별이 안 갔다**(2026-08-11 사용자 판정). 방향만
    // 달리해서는 한 프레임 안에서 둘 다 「주황색 폭발」이다. **시간축으로**
    // 가른다 — 같은 색이라도 빠르기가 다르면 다른 물건으로 보인다.
    //
    //   염(up)   느리게 **솟는다**. 갈래가 적고 길고, 위로 자라며 오래 남는다
    //   불씨(even) **순간에 확 퍼졌다 꺼진다**. 산소를 한 번에 먹는 것이라
    //              고리가 크고 얇게 튀어나가고, 잔불티가 사방으로 흩어진다
    const DUR=f0.bm==="even"?.30:.62;      // 불씨는 절반만 산다
    const ff=Math.max(0,1-f0.l/DUR), g=1-ff;
    if(f0.bm==="even"){
      // 고리가 **크고 얇게** 튀어나간다 — 폭발이 아니라 파열이다.
      celHoop(c,f0.x,f0.y,f0.r*(.4+2.2*g),.9,0,f0.r*.22*ff+1,KEY,ff*.95);
      for(let z=0;z<11;z++){const a=z/11*TAU+f0.x*.03;
        const d=f0.r*(.5+1.9*g)*(.7+.5*hash(z*3.1));
        celSpike(c,f0.x+Math.cos(a)*d,f0.y+Math.sin(a)*d*.72,a,
          f0.r*.42*ff,f0.r*.16*ff,KEY,ff);}
      // 잔불티 — 바깥으로 흩어져 남는다. 이것이 「씨」다.
      for(let z=0;z<6;z++){const a=z/6*TAU+1.1;
        const d=f0.r*(1.0+2.4*g);
        celSplash(c,f0.x+Math.cos(a)*d,f0.y+Math.sin(a)*d*.7,
          f0.r*.16*ff,6,z*3+1,KEY,ff*.9);}
      continue;}
    // 염 — 위로 **솟는다**. 고리는 낮게 깔리고 불길이 자란다.
    celHoop(c,f0.x,f0.y,f0.r*(.5+.5*g),.55,0,f0.r*.30*ff+1.5,KEY,ff*.75);
    for(let z=0;z<5;z++){
      const a=-Math.PI/2+(z/4-.5)*1.5;
      const gr=Math.min(1,f0.l/.34);       // 처음엔 낮고 나중에 길다
      const len=f0.r*(1.1+.9*hash(z*3.1))*(.35+.65*gr);
      celSpike(c,f0.x+Math.cos(a)*f0.r*.30,f0.y+Math.sin(a)*f0.r*.22,a,
        len,f0.r*.30*ff,KEY,ff*.95);}}
  const PK=PASSIVE[KEY];
  const mark=(L)=>{if(!PK)return;
    for(const f of st.F)if(f.pv>0)
      pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,PK,f.pv,t,KEY,SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // 충격파 — **본체 그림을 그대로 쓴다.**
  //
  // ⚠️ 비슷하게 흉내 낸 고리를 그렸다가 반려됐다(2026-08-11). 「본체처럼
  // 터지게」의 답은 **닮은 것을 새로 그리는 것이 아니라 그것을 그대로 부르는
  // 것**이다 — 확정된 백광 발현 그림([fvBody] white·mani)을 적 자리에 그리면
  // 「내가 심어 놓은 것이 터졌다」가 설명 없이 이어지고, 본체 디자인이 바뀌면
  // 이쪽도 저절로 따라온다(두 벌을 손으로 맞출 일이 없다).
  //
  // 부풀며 옅어지는 것만 여기서 얹는다. 적보다 **위에** 그린다 — 터지는
  // 것이라 아래 깔리면 몸에 가린다.
  //
  // ⚠️ **전역 시각을 넘기면 안 된다.** 처음엔 [t] 를 그대로 넘겼는데, 그러면
  // 폭발마다 백광 발현 애니메이션의 **아무 지점**이나 재생된다 — 조용한
  // 구간이 걸리면 아무 일도 안 일어나고, 「팡」의 긴 줄기가 걸리면 확대되어
  // **뿔기둥**처럼 보였다(2026-08-11 사용자 판정). 폭발은 매번 같아야 한다.
  //
  // 그래서 **「팡」 구간만** 재생한다. 확정된 백광 발현에서 터지는 순간은
  // 1.72s 이고 고리가 퍼져 나가는 데까지가 2.05s 이라, 수명(0.34s)을 그 창에
  // 그대로 얹는다 — 시작하자마자 터지고 고리가 벌어지며 끝난다.
  const BURST0=1.72;
  for(const f0 of st.fl){if(f0.bm!=="shock")continue;
    const ff=Math.max(0,1-f0.l/.34);
    const VW2=f0.r*2*(.45+.75*(1-ff));
    f0.sub=f0.sub||{p:[]};
    c.save();c.globalAlpha=ff;c.translate(f0.x-VW2/2,f0.y-VW2/2);
    try{fvBody(c,BURST0+f0.l,dt,VW2,VW2,f0.sub,"white",(FVFIX.white.mani||1)-1);}
    catch(e){}
    c.restore();}
  // 심지 예고 — **어디서 터질지 보여준다.** 안 보이면 시한이 아니라 그냥
  // 지연이고, 미리 읽는 놀이가 사라진다. 남은 시간만큼 고리가 조여 든다.
  if(WHITE)for(const f of st.F){if(!(f.wb>0))continue;
    const u=1-f.wb/WFUSE, x0=cx+f.ox+f.kx, y0=cy+f.oy+f.ky;
    celHoop(c,x0,y0,f.r*(2.4-1.3*u),1,t*2.2,1.8,KEY,.30+.5*u);
    for(let z=0;z<4;z++){const a=t*2.2+z/4*TAU;
      celSpike(c,x0+Math.cos(a)*f.r*(2.4-1.3*u),y0+Math.sin(a)*f.r*(2.4-1.3*u),
        a+Math.PI,6*SC,2.4*SC,KEY,.35+.55*u);}}
  // 전기 줄기 — 각진 꺾은선. 이 게임의 번개는 선이 아니라 각진 덩어리다(뇌광).
  for(const z of st.zp){const ff=1-z.l/.22;
    const x0=cx+z.a.ox+z.a.kx,y0=cy+z.a.oy+z.a.ky;
    const x1=cx+z.b.ox+z.b.kx,y1=cy+z.b.oy+z.b.ky;
    const dl=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/dl,ny=(x1-x0)/dl,P=[];
    for(let i=0;i<=6;i++){const u=i/6;
      // 꺾임은 **자리로 고정**한다 — 매 프레임 흔들면 줄기가 아니라 소음이다.
      const j=(i===0||i===6)?0:(hash(i*3.1+z.b.ox)-.5)*20*SC;
      P.push([x0+(x1-x0)*u+nx*j,y0+(y1-y0)*u+ny*j]);}
    celRibbon(c,P,3.2*SC*ff,KEY,ff*.95);}
  // 몸 — **발현한 것**. 그리는 함수가 둘로 갈린다: 융화 10·무속성·백광은
  // [fvBody], 기본 6속성은 [ELEM.elemBody] — FVSET 에 6속성 자리가 없어서
  // fvBody 로만 부르면 조용히 실패한다(2026-08-11 사용자 발견).
  //
  // ⚠️ 둘 다 반지름을 **캔버스 비례**(min(W,H)×0.30)로 잡는다. 420칸에 그대로
  // 부르면 126px 이라 평소 몸(30px)의 4.2배, 적(16~19px)의 7배가 된다.
  // 그래서 **가상 캔버스**에 그려 40px 언저리(평소의 1.33배)로 맞춘다.
  const VW=Math.min(W,H)*.32;
  const BASE6={ember:1,frost:1,volt:1,toxin:1,gale:1,shade:1};
  c.save();c.translate(cx-VW/2,cy-VW/2);
  try{if(BASE6[KEY])ELEM.elemBody(c,t,dt,VW,VW,st.sub,KEY);
    else fvBody(c,t,dt,VW,VW,st.sub,KEY,((FVFIX[KEY]&&FVFIX[KEY].mani)||1)-1);}
  catch(e){}
  c.restore();
  // 탄 — 무속성만 **돌멩이**(각진 덩어리)이고 나머지는 발광 꼬임이다.
  // 돌은 빛이 아니므로 발광 문법을 안 쓴다 — 그 차이가 「무속성은 색이 없다」다.
  for(const q of st.b){if(q.l>2)continue;
    const fi=Math.min(1,q.l/.08);
    if(ROCK){celRibbon(c,q.tr,BW*.5,"gold",.4*fi);
      fillPoly(c,jagPoly(q.x,q.y,BW*1.15,6,q.bo*3.7+1,1.0),A(toneOf(KEY)[0],.95*fi));
      fillPoly(c,jagPoly(q.x,q.y,BW*.72,6,q.bo*3.7+1,1.0),A(toneOf(KEY)[1],.95*fi));
      continue;}
    const GW=q.gw||1;
    const V0={n:2,w:BW*GW*(FIRE?.30:.20),amp:BW*GW*.58,freq:.72,knot:0};
    const S0=helixStrands(q,t,V0);
    gAdd(c,c=>{
      // 염 — **불덩이**라 머리가 둥글고 크다. 창끝이면 화살이고, 둥글면 덩어리다.
      // 수도 같은 이유로 둥글다 — 자란 물덩이는 뾰족할 수 없다.
      if(FIRE||GROW)gHalo(c,q.x,q.y,BW*GW*1.5,"gold",.75*fi);
      for(const pts of S0)gStroke(c,pts,V0.w,"gold",.85*fi);
      gLance(c,q.x,q.y,q.a,BW*GW*((FIRE||GROW)?.75:1.05),
        BW*GW*((FIRE||GROW)?.62:.36),"gold",fi);});}
  gAdd(c,c=>{for(const s0 of st.sp){const f=1-s0.l/.5;
    gHalo(c,s0.x,s0.y,(s0.r||2)*f+.7,"gold",f*.9);}});
  // 명중 — 고리·불티·8갈래를 겹치되 셋 다 같은 f 로 죽어 한 박자로 읽힌다.
  // ⚠️ 타격 순간이 **렉처럼** 보였다(2026-08-11 사용자 판정). 원인은 세기가
  // 아니라 **곡선**이다: 반지름도 알파도 선형이라 첫 프레임에 이미 큰 것이
  // 나타났다가 뚝 꺼졌다 — 눈에는 「한 프레임 튀었다」로 들어온다.
  //   · 커지는 것은 [ease] 로 **처음에 빠르고 끝에서 느리게**
  //   · 죽는 것은 f² 로 **꼬리를 길게** — 선형은 끝에서 갑자기 사라진다
  //   · 8갈래 섬광은 **앞 절반에만** 산다. 끝까지 두면 잔상이 남아 어수선하다
  // 크기도 한 단 낮췄다. 기본 공격의 명중은 무기 스킬만큼 클 이유가 없다.
  for(const h of st.hz){const f=1-h.l/.26;if(f<=0)continue;
    const e0=ease(1-f), a0=f*f;
    gAdd(c,c=>{const T0=toneOf(KEY),R0=h.w*(.35+1.05*e0);
      c.strokeStyle=A(T0[1],a0*.5);c.lineWidth=h.w*.42*f+.8;
      c.beginPath();c.arc(h.x,h.y,R0,0,TAU);c.stroke();
      c.strokeStyle=A("#FFFFFF",a0*.7);c.lineWidth=h.w*.18*f+.4;
      c.beginPath();c.arc(h.x,h.y,R0*.66,0,TAU);c.stroke();
      if(f>.5)gFlare(c,h.x,h.y,h.w*(.35+.7*e0),"gold",(f-.5)*2,h.l*7,8);});}
  drawP(c,st);
  if(st.mz>0&&st.b.length){const q=st.b[st.b.length-1],f=st.mz/.1;
    gAdd(c,c=>gFlare(c,cx+Math.cos(q.a)*15*SC,cy+Math.sin(q.a)*15*SC,
      BW*(.5+.5*(1-f)),"gold",f*.9,q.a,4));}
  // 발현 게이지 — 만충 상태로만 그린다. 자리를 잡아 두는 것이 목적이다.
  const gw=W*.44,gx=cx-gw/2,gy=H-14*SC;
  c.fillStyle=A("#1E1E26",.9);c.fillRect(gx,gy,gw,4*SC);
  c.fillStyle=A(toneOf(KEY)[2],.95);c.fillRect(gx,gy,gw,4*SC);},

// ══ 발현 전용기 셋 (2026-08-11 신설) ══════════════════════════════════════
//
// 왜 있나: 지금 발현은 「기본 공격이 조금 세지는 15초」뿐이라 **게이지가 차는
// 것을 기다릴 이유가 약하다.** 전용기는 발현 중에만 나가는 것이고, 그것이
// 있어야 「게이지가 찼다」가 사건이 된다.
//
// ── ① 몇 개인가 — **셋.** 18칸마다 하나(18종)도, 계열마다 하나(8종)도 아니다.
//
// 18종을 버린 이유는 유지비가 아니라 **읽힘**이다. 발현은 하나의 상태이고,
// 상태에는 하나의 서명이 있어야 한다 — 속성마다 다른 전용기면 플레이어는
// 「발현하면 이게 나온다」를 영영 못 배우고 화면에서 발현을 못 알아본다.
// (같은 판정이 이미 있다: 백광 심지의 폭발은 **본체와 같은 그림**이라야
//  「내가 심어 놓은 것이 터졌다」로 읽힌다 — 닮은 것을 새로 그리면 딴 물건이다.)
//
// 8종(계열마다 하나)은 더 나쁘다. 계열을 정하는 것은 **기본 공격의 축**인데
// (불=터짐 · 빙=번짐 · 뇌=연쇄 …), 전용기는 그 축과 겹치면 안 된다. 즉 계열별
// 전용기는 **자기 계열의 축을 피한 것**이어야 하고, 그러면 어느 것을 어느
// 계열에 붙이든 근거가 없다. 축이 없는 분류는 분류가 아니다.
//
// 셋으로 두고 **속성은 색과 상태로만 얹는다** — [RECOLOR] 가 무기 17종을
// 한 줄로 물들이는 그 구조 그대로다. 염의 회귀는 붉고 맞은 놈이 타고, 독의
// 회귀는 초록이고 맞은 놈이 중독된다. 속성이 지워지는 것이 아니라 **얹혀
// 간다** — 기본 공격이 [PASSIVE] 를 나르는 것과 같은 층이다.
//
// ── ② 어떻게 발동하나 — **발현 각인.** 판당 한 번, **첫 발현의 순간**에 3택이
//    뜨고 셋 중 하나를 고른다. 고른 것이 그 판 내내 발현 중에만 자동으로 나간다.
//
// 세 안을 놓고 고른 결과다:
//   자동 배정 — 고를 것이 없으니 지금(기본 공격이 세지는 것)과 같은 문제다
//   평소 3택에 섞기 — 슬롯을 먹는데 **가동률이 14~18%** 다. 판의 82% 를
//                    노는 슬롯은 어떤 성능을 줘도 안 고른다
//   ✅ 첫 발현에 3택 — 슬롯을 안 먹고, **발현 자체가 선택의 순간**이 된다
//
// 이 게임엔 버튼이 하나도 없으므로(전부 자동) 고르는 일은 3택에서만 일어난다.
// 그 한 번을 **발현이 처음 켜지는 순간**에 두면, 「게이지가 찼다」가 화면이
// 멈추고 카드가 뜨는 사건이 된다 — 기다릴 이유를 성능이 아니라 **연출**로도
// 준다. 두 번째 발현부터는 안 뜬다: 매번 뜨면 그건 사건이 아니라 절차다.
//
// ⚠️ 후보가 정확히 셋이라 3택에 **늘 셋 다** 뜬다. 운이 아니라 판단이고,
// 그래서 「이번 판 내 발현은 무엇인가」가 빌드의 한 축으로 고정된다.
//
// ── ③ 무엇을 하나 — 기본 공격이 안 쓴 축에서 고른다.
//
// 쓰고 있는 축: 튕김(무) · 터짐(불) · 번짐(빙) · 연쇄(뇌) · 관통(독) ·
//               끌어당김(풍) · 성장(수) · 설치(어둠) · 시한(백광)
// 남은 축 중에서 **다른 스킬과도 안 겹치는 것**만 남기면 셋이 된다:
//   유도  → 유도탄이 쓴다        분열 → 유도탄 L3 이 쓴다
//   소환  → 정령이 쓴다          설치 → 어둠의 블랙홀이 쓴다
//   ✅ 되돌아옴 · 지형(벽) · 시간(정지)
//
//   회귀 回歸  나갔다 **돌아온다**. 가는 길과 오는 길이 **다른 길**이라 두 번 벤다
//   경계 境界  **벽을 세운다**. 적이 못 넘고, 밀리며 지진다 — 이 게임에 벽이 없다
//   정지 停止  **멎게 한다**. 퍼지는 고리에 닿은 적이 그 자리에 굳는다
//
// 셋이 역할로도 갈린다: 회귀=쓸어 담는다 · 경계=자리를 만든다 · 정지=순간을
// 만든다. 그림이 아니라 **판이 달라지는 방식**이 셋이라야 3택이 고민이 된다.
//
// ⚠️ 쿨다운이 **짧다**(2.4~3.2초). 15초짜리 상태라 쿨이 길면 발현 한 번에 한
// 번 나가고 끝인데, 그러면 전용기가 아니라 **연출**이다. 15초에 **4~6번**
// (회귀 6 · 경계 5 · 정지 4) 나가야 「발현 중에는 이걸 쓴다」가 된다.
// 횟수가 셋 다 다른 것은 한 번의 무게가 다르기 때문이다 — 정지는 한 번이 제일
// 크고, 그래서 제일 뜸하다.
//
// ⚠️ 면적을 아낀다. 이 게임의 병목은 채우기(raster)이고 **화려함의 비용은
// 개수가 아니라 픽셀 면적**이다 — 셋 다 화면을 덮지 않는다: 회귀는 선 하나,
// 경계는 얇은 판, 정지는 스쳐 지나는 고리 하나와 적 둘레의 작은 표식이다.
manicRecall(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ── 회귀 回歸 — **나갔다 돌아온다** ─────────────────────────────────────
  //
  // 몸에서 원반 한 장이 **적이 제일 몰린 쪽**으로 날아갔다 돌아온다. 가는 길과
  // 오는 길에 각각 한 번씩 물리므로 같은 적이 두 번 맞을 수 있다.
  //
  // ⚠️ **왕복을 한 직선으로 두면 안 된다.** 되짚어 오는 길이 가는 길에 정확히
  // 겹쳐, 화면에는 「나갔다」와 「사라졌다」만 남고 **돌아온 것이 안 보인다.**
  // 옆으로 휘게 해서 가는 길과 오는 길을 갈라 놓으면 궤적이 닫힌 고리를 그리고,
  // 그 고리 하나가 이 스킬의 전부를 설명한다 — 정지 화면에서도 읽힌다.
  const SC=Math.min(W,H)/238, KEY=TK("gold");
  const PER=2.4, FLY=1.15;                 // 쿨 2.4초 중 1.15초를 날아 있다
  // ⚠️ 엔진 절대값이 아니라 **칸 비례**. 반너비가 93~210px 이라 엔진 값을
  // 그대로 쓰면 한 프레임에 칸을 가로지른다.
  // ⚠️ 원반을 13 → 18 로 키웠다(2026-08-11 렌더 판정). 13 은 300px 칸에서
  // 지름 16px 이라 **불티와 구별이 안 됐다** — 던진 물건은 손에 잡히는 크기로
  // 보여야 「되돌아온다」가 물건의 이야기가 된다.
  const RANGE=Math.min(W,H)*.38, DR=18*SC;
  manicWalk(st,dt,SC);
  st.acc=(st.acc||0)+dt;
  if(st.acc>PER&&!st.dk){st.acc=0;
    st.dk={a:manicAim(st),l:0,tr:[],id:(st.n=(st.n||0)+1),fl:0,x:cx,y:cy};}
  const q=st.dk;
  if(q){q.l+=dt;
    const u=Math.min(1,q.l/FLY);
    // 앞으로: sin(πu) — 0 에서 나가 중간에 제일 멀고 다시 0 으로 돌아온다.
    // 옆으로: sin(2πu) — 앞 절반은 한쪽, 뒤 절반은 반대쪽. 두 길이 갈린다.
    const d=Math.sin(Math.PI*u)*RANGE, side=Math.sin(TAU*u)*RANGE*.34;
    q.x=cx+Math.cos(q.a)*d-Math.sin(q.a)*side;
    q.y=cy+Math.sin(q.a)*d+Math.cos(q.a)*side;
    q.tr.push([q.x,q.y]);if(q.tr.length>34)q.tr.shift();
    // 가는 길(0)과 오는 길(1)을 **다른 표로 센다.** 하나로 두면 한 번 문 적을
    // 돌아오는 길에 못 물어 「두 번 벤다」가 거짓말이 된다.
    const pass=u<.5?0:1, tok=q.id*2+pass, sg=pass?-1:1;
    for(const f of st.F){
      if(f.rc===tok)continue;
      if(Math.hypot(cx+f.ox+f.kx-q.x,cy+f.oy+f.ky-q.y)<f.r+DR){
        f.rc=tok;f.pv=1.0;q.fl=.16;
        hitFoe(st,f,cx,cy,Math.cos(q.a)*sg,Math.sin(q.a)*sg,9*SC);}}
    q.fl=Math.max(0,q.fl-dt);
    if(u>=1)st.dk=null;}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  const PK=PASSIVE[KEY];
  const mark=(L)=>{if(!PK)return;
    for(const f of st.F)if(f.pv>0)
      pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,PK,f.pv,t,KEY,SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  manicBody(c,t,dt,W,H,st,KEY);
  // 원반 — **낫 두 장이 도는 것.** 통짜 원이면 굴러가는 공이고, 날이 있어야
  // 「벤다」가 된다. 날은 [celRibbon] 이 끝을 뾰족하게 좁혀 주는 것을 그대로 쓴다.
  const blade=(x,y,rr,spin,al)=>{
    for(let b=0;b<2;b++){const a0=spin+b*Math.PI;
      celRibbon(c,arcPts(x,y,rr,a0,a0+1.9,12),rr*.40,"gold",al);}
    gAdd(c,c=>gHalo(c,x,y,rr*1.15,"gold",al*.8));};
  if(q){
    // 지나온 자국 — 닫힌 고리를 그린다. 이 한 줄이 「나갔다 온다」를 통째로 말한다.
    //
    // 두 겹이다. **전 구간**은 가늘고 옅게(고리의 모양을 맡는다), **끝 12점**은
    // 굵고 밝게(어디가 지금인지를 맡는다). 한 겹으로는 둘 중 하나를 잃는다 —
    // 전부 옅으면 지금이 안 보이고, 전부 밝으면 고리가 아니라 밧줄이 된다.
    // ⚠️ 끝 조각은 **뒤집어** 넘긴다. [celRibbon] 은 앞이 굵고 뒤가 뾰족한데
    // 자국은 오래된 것이 앞에 있어, 그대로 주면 **꼬리가 굵어진다**.
    gAdd(c,c=>{
      gStroke(c,q.tr,DR*.22,"gold",.34);
      const tail=q.tr.slice(-12).reverse();
      if(tail.length>1)gStroke(c,tail,DR*.44,"gold",.6);});
    blade(q.x,q.y,DR*1.05,t*8+q.id,.95);
    // 맞은 순간 — ⚠️ 8갈래 · 반지름 2.0배는 **원반보다 큰 흰 별**이라 정작
    // 원반을 덮었다(2026-08-11 렌더 판정). 명중은 원반을 보여 주는 것이지
    // 가리는 것이 아니다: 갈래를 줄이고 원반 크기 안에서 끝낸다.
    if(q.fl>0){const ff=q.fl/.16;
      gAdd(c,c=>gFlare(c,q.x,q.y,DR*(.30+.55*(1-ff)),"gold",ff*.75,t*8,5));}}
  else{
    // 돌아온 원반은 **몸 옆에 붙어 돈다.** 쿨 1.25초를 빈 화면으로 두면
    // 「스킬이 없다」로 보인다 — 쥐고 있는 것이 보여야 다음이 예고된다.
    // ⚠️ 24 로 두었더니 **몸의 광휘 안**(반지름 1.5×RR)이라 안 보였다. 몸에서
    // 확실히 떼어 놓아야 「쥐고 있는 다른 물건」으로 읽힌다.
    const a0=t*2.0;
    blade(cx+Math.cos(a0)*42*SC,cy+Math.sin(a0)*42*SC,DR*.60,t*5,.75);}
  drawP(c,st);
  manicBar(c,W,H,SC,KEY);},
manicWall(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ── 경계 境界 — **벽을 세운다** ────────────────────────────────────────
  //
  // 적이 제일 몰린 쪽 앞에 빛의 판을 한 장 세운다. 5초간 남고, 적은 **못 넘고**
  // 붙어 있는 동안 지진다. 이 게임에 **막는 것이 하나도 없다** — 결계는 몸을
  // 두르는 구이고 성역은 밟으면 느려지는 장판이라, 둘 다 「지나갈 수는 있다」다.
  // 못 지나가는 것은 이것 하나뿐이라 축이 안 겹친다.
  //
  // ⚠️ [celBeam] 으로 그리지 않는다. 캡슐 + 안쪽 소용돌이는 **레이저의 문법**
  // 이라, 같은 도형을 옆으로 눕히면 「누운 레이저」로 읽힌다. 벽은 **판**이므로
  // 좌우 대칭 리본([celRibbonEven])으로 깔고, 그 위에 **위로 선 결**을 세운다 —
  // 탑다운에서 「서 있다」를 말하는 것은 두께가 아니라 위로 뻗은 것이다
  // (염의 불길이 위로 솟아 서 있는 것과 같은 장치).
  const SC=Math.min(W,H)/238, KEY=TK("gold");
  const PER=2.6, LIFE=5.0, MAXW=2;
  // ⚠️ 판 두께를 4.0 → 5.6 으로 올렸다(2026-08-11 렌더 판정). 얇게 두었더니
  // **결(위로 선 획)만 보이고 판이 안 보여** 「벽」이 아니라 「빗」이 됐다 —
  // 서 있는 것을 말하는 것은 결이지만, 그것이 **무엇의** 결인지를 말하는 것은
  // 판이다. 둘 중 하나만 있으면 물건이 아니다.
  const LEN=Math.min(W,H)*.34, TH=5.6*SC, DIST=Math.min(W,H)*.21;
  manicWalk(st,dt,SC);
  st.wl=st.wl||[];
  st.acc=(st.acc||0)+dt;
  if(st.acc>PER){st.acc=0;
    const a=manicAim(st);
    // 벽은 **진행 방향에 직각**으로 선다(a+π/2). 몸에서 조금 떨어뜨려 세우는
    // 것은, 몸에 붙이면 벽이 아니라 「두른 것」(결계)으로 보이기 때문이다.
    const w0={x:cx+Math.cos(a)*DIST,y:cy+Math.sin(a)*DIST,a:a+Math.PI/2,l:0,sd:R()*9};
    st.wl.push(w0);
    // 세워지는 순간의 파편 — 「솟았다」를 여기서 한 번 못 박는다. 위로 튀게
    // 방향을 고정한 것은, 사방으로 흩으면 「터졌다」가 되기 때문이다.
    for(let i=0;i<10;i++){const u=(i/9-.5)*LEN;
      emit(st,w0.x+Math.cos(w0.a)*u,w0.y+Math.sin(w0.a)*u,1,
        {k:KEY,sp:70*SC,r:2.4*SC,life:.42,spikeP:.8,a:-Math.PI/2,spread:1.3});}
    // ⚠️ **두 장까지만.** 5초 × 2.6초 쿨이면 세 장이 동시에 살 수 있는데,
    // 그러면 몸 둘레가 통째로 막혀 「벽」이 아니라 「방」이 된다.
    if(st.wl.length>MAXW)st.wl.shift();}
  st.wl=st.wl.filter(w=>(w.l+=dt)<LIFE);
  for(const w of st.wl){
    const g=Math.min(1,w.l/.22);                    // 솟는 중
    const dx=Math.cos(w.a),dy=Math.sin(w.a),nx=-dy,ny=dx,half=LEN*.5*g;
    for(const f of st.F){
      const rx=(cx+f.ox+f.kx)-w.x, ry=(cy+f.oy+f.ky)-w.y;
      const s=rx*dx+ry*dy, n=rx*nx+ry*ny;
      if(Math.abs(s)>half+f.r)continue;
      const pen=(f.r+TH*1.5)-Math.abs(n);
      if(pen<=0)continue;
      // **밀어낸다** — 넉백([kx]) 이 아니라 자리([ox]) 를 민다. 넉백은 감쇠라
      // 시간이 지나면 벽을 뚫고 들어와 버린다: 못 넘는다는 것은 감쇠하는
      // 힘이 아니라 **매 프레임 지켜지는 조건**이다.
      const sg=n<0?-1:1;
      f.ox+=nx*sg*pen;f.oy+=ny*sg*pen;f.pv=1.0;
      // 붙어 있으면 지진다 — 틱으로 준다. 매 프레임 [hitFoe] 를 부르면 흰
      // 섬광이 계속 터져 「연타로 두들긴다」가 된다(빨대에서 같은 판정).
      f.wt=(f.wt||0)+dt;
      if(f.wt>.42){f.wt=0;hitFoe(st,f,cx,cy,nx*sg,ny*sg,5*SC);}
      if(R()<dt*22)emit(st,w.x+dx*s+nx*sg*(f.r*.4),w.y+dy*s+ny*sg*(f.r*.4),1,
        {k:KEY,sp:60*SC,r:2*SC,life:.34,spikeP:.7,a:Math.atan2(ny*sg,nx*sg),spread:1.7});}}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  // 바닥에 번지는 빛 — **적보다 아래**. 벽이 땅에 닿아 있다는 것을 이것이 말한다.
  for(const w of st.wl){
    const g=Math.min(1,w.l/.22), fade=Math.min(1,(LIFE-w.l)/.6);
    const P=[];for(let i=0;i<=8;i++){const u=(i/8-.5)*LEN*g;
      P.push([w.x+Math.cos(w.a)*u,w.y+Math.sin(w.a)*u]);}
    gAdd(c,c=>gStroke(c,P,TH*4.2,KEY,fade*.16));}
  const PK=PASSIVE[KEY];
  const mark=(L)=>{if(!PK)return;
    for(const f of st.F)if(f.pv>0)
      pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,PK,f.pv,t,KEY,SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  manicBody(c,t,dt,W,H,st,KEY);
  // 판 + 결 — **적보다 위.** 서 있는 것이라 뒤에 선 적을 가려야 한다.
  for(const w of st.wl){
    const g=Math.min(1,w.l/.22), fade=Math.min(1,(LIFE-w.l)/.6);
    const P=[];for(let i=0;i<=8;i++){const u=(i/8-.5)*LEN*g;
      P.push([w.x+Math.cos(w.a)*u,w.y+Math.sin(w.a)*u]);}
    celRibbonEven(c,P,TH*g,KEY,fade*.95);
    // 결 — 위로 선 짧은 획. **아홉 개를 열넷으로 늘리고 낮췄다**(2026-08-11
    // 렌더 판정): 길고 성기면 낱개가 독립한 창으로 보여 「말뚝 아홉 자루」가
    // 된다. 촘촘하고 낮아야 판 위의 **결**로 붙어 읽힌다.
    // 흔들림은 아주 약하게: 벽은 흔들리는 것이 아니라 **버티는** 것이다.
    for(let i=0;i<14;i++){const u=((i+.5)/14-.5)*LEN*g;
      const px=w.x+Math.cos(w.a)*u,py=w.y+Math.sin(w.a)*u;
      const h=LEN*(.068+.038*hash(w.sd+i*3.1))*g*(.92+.08*Math.sin(t*2.6+i));
      celSpike(c,px,py,-Math.PI/2,h,TH*.92,KEY,fade*.9);}}
  drawP(c,st);
  manicBar(c,W,H,SC,KEY);},
manicHalt(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ── 정지 停止 — **멎게 한다** ──────────────────────────────────────────
  //
  // 몸에서 고리가 퍼지고, 그 고리에 닿은 적이 **그 자리에 굳는다**(1.3초).
  // 굳은 동안은 안 걷고 안 밀린다.
  //
  // ⚠️ 동상(빙)·감속(성역)과 갈린다. 둘은 **느려지는 것**이라 여전히 온다.
  // 정지는 **0** 이다 — 이 게임에서 유일하게 「안 움직이는」 값이고, 그래서
  // 표식도 유일하게 **안 도는 것**으로 그린다(다른 표식은 전부 흐르거나 돈다:
  // 불티는 오르고, 감전은 지그재그가 돌고, 얼음조차 t*.12 로 아주 느리게 돈다).
  //
  // ⚠️ 정지 화면에서 「안 움직인다」는 안 보인다. 그래서 **멎기 직전의 잔상**을
  // 0.4초만 남긴다 — 걸어오던 자국이 뒤에 두 겹 남아 있으면 「이 놈은 오던
  // 중이었고 지금 멎었다」가 한 프레임 안에서 읽힌다.
  const SC=Math.min(W,H)/238, KEY=TK("gold");
  const PER=3.2, HOLD=1.3, EXP=.42, RMAX=Math.min(W,H)*.44;
  st.wv=st.wv||[];st.sh=st.sh||[];
  st.acc=(st.acc||0)+dt;
  if(st.acc>PER){st.acc=0;st.wv.push({l:0});}
  // 고리가 **지나간 순간**에 굳힌다 — 반지름 구간 [r0,r1) 을 넘어간 놈만.
  // 「지금 고리 안에 있는 놈 전부」로 하면 뒤늦게 들어온 놈도 굳어, 고리가
  // 훑고 지나가는 것이 아니라 장판을 깐 것이 된다.
  for(const w of st.wv){const p0=w.l;w.l+=dt;
    const r0=RMAX*(p0/EXP), r1=RMAX*(w.l/EXP);
    for(const f of st.F||[]){
      if(f.hold>0)continue;
      const d=Math.hypot(f.ox+f.kx,f.oy+f.ky);
      if(d<r0||d>=r1)continue;
      f.hold=HOLD;f.pv=1.0;
      // 잔상이 남을 쪽 = **왔던 쪽**(바깥). 적은 몸 쪽으로 걸어오므로
      // 자기 위치의 단위벡터가 그대로 「뒤」다.
      const dd=Math.hypot(f.ox,f.oy)||1;f.gx=f.ox/dd;f.gy=f.oy/dd;
      emit(st,cx+f.ox,cy+f.oy,5,{k:KEY,sp:36*SC,r:2*SC,life:.5,spikeP:.6});}}
  st.wv=st.wv.filter(w=>w.l<EXP+.18);
  manicWalk(st,dt,SC);              // 굳은 놈은 여기서 안 걷는다
  // 풀리는 순간 — **부서진다.** 굳었다가 그냥 다시 걸으면 아무 일도 없던 것이
  // 되고, 정지가 「잠깐 멈춤」이 아니라 **한 번의 사건**이 되려면 끝에 소리가 있어야 한다.
  for(const f of st.F){
    if(f.hold>0){f.hz=1;continue;}
    if(!f.hz)continue;
    f.hz=0;st.sh.push({x:cx+f.ox+f.kx,y:cy+f.oy+f.ky,l:0,r:f.r});
    hitFoe(st,f,cx,cy,0,0,4*SC);f.pv=1.0;
    emit(st,cx+f.ox+f.kx,cy+f.oy+f.ky,9,{k:KEY,sp:150*SC,r:2.6*SC,life:.4,spikeP:.8});}
  st.sh=st.sh.filter(s0=>(s0.l+=dt)<.28);
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  // 퍼지는 고리 — **적보다 아래.** 훑고 지나가는 것이라 굳은 놈을 덮으면 안 된다.
  for(const w of st.wv){
    const u=Math.min(1,w.l/EXP), rr=RMAX*u, ff=1-u;
    if(rr<=.5||ff<=.01)continue;
    // ⚠️ 굵기를 반지름에 **묶는다.** [celHoop] 은 안쪽 고리를 `r - w*.22` 로
    // 그리는데, 갓 태어난 고리(반지름 몇 px)에 굵기를 그대로 주면 그 값이
    // **음수**가 되어 `arc` 가 죽는다 — 빙 계열이 -0.33 으로 조용히 죽었던
    // 그 함정이고, 60fps 에서는 첫 프레임 반지름이 7px 이라 우연히 안 걸린다.
    // 우연히 안 걸리는 것은 안 걸리는 것이 아니다(120Hz 면 절반이다).
    const lw=Math.min(rr*.5,(4*ff+1)*SC*.7);
    celHoop(c,cx,cy,rr,1,0,lw,KEY,ff*.85);
    gAdd(c,c=>{c.strokeStyle=A(toneOf(KEY)[2],ff*.5);c.lineWidth=1.6*SC;
      c.beginPath();c.arc(cx,cy,rr,0,TAU);c.stroke();});}
  const PK=PASSIVE[KEY];
  const mark=(L)=>{if(!PK)return;
    for(const f of st.F)if(f.pv>0)
      pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,PK,f.pv,t,KEY,SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // 굳음 표식 — **적보다 위.** 셋이 한 벌이다: 갈라지는 고리 · 박힌 못 · 잔상.
  for(const f of st.F){
    if(!(f.hold>0))continue;
    const u=1-f.hold/HOLD, x=cx+f.ox+f.kx, y=cy+f.oy+f.ky, rr=f.r*1.45;
    // ① 조각난 고리 — **틈이 벌어진다.** 남은 시간이 줄수록 조각이 짧아져
    //    「굳었고, 갈라지는 중」이 된다. 회전은 0 이다 — 그것이 이 상태의 정보다.
    for(let i=0;i<6;i++){const a0=i/6*TAU+.3, w0=TAU/6*(.62-.34*u);
      celRibbon(c,arcPts(x,y,rr,a0,a0+w0,6),3.4*SC,KEY,.95);}
    // ② 못 — 바깥으로 네 갈래. 땅에 박아 둔 것이라 자리가 고정이다.
    for(let i=0;i<4;i++){const a=i/4*TAU+.78;
      celSpike(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr,a,7*SC,3*SC,KEY,.85);}
    // ③ 잔상 — 멎기 직전까지 오던 자국. 0.4초만 산다.
    //
    // ⚠️ 알파 .20 · 간격 9px 은 렌더에서 **아예 안 보였다**(2026-08-11).
    // 잔상은 「있는 듯 없는 듯」이 미덕처럼 들리지만, 이 그림에서 잔상이 맡은
    // 일은 분위기가 아니라 **정보**다 — 「오던 중이었다」를 이것 말고 말하는
    // 것이 없다. 안 보이면 그 정보가 화면에 없는 것이라, 보일 때까지 올린다.
    // ⚠️ 간격은 **좁아야** 한다. 13px 두 겹으로 벌렸더니 뒤쪽 겹이 몸 지름의
    // 두 배 넘게 떨어져 **적이 한 마리 더 서 있는 것**으로 보였다(2026-08-11).
    // 잔상은 「같은 놈의 방금」이라 몸에 겹쳐 있어야 하고, 겹친 채로 보이게
    // 하는 것은 간격이 아니라 알파다.
    if(u<.32){const gf=1-u/.32;
      for(let z=1;z<=2;z++)
        fillPoly(c,jagPoly(x+(f.gx||0)*8*SC*z,y+(f.gy||0)*8*SC*z,
          Math.max(1,f.r*(1-z*.12)),9,3.1,1.0),A(toneOf(KEY)[1],gf*(z===1?.40:.16)));}}
  // 부서짐
  for(const s0 of st.sh){const ff=1-s0.l/.28;
    celSplash(c,s0.x,s0.y,Math.max(.5,s0.r*(.7+1.1*ease(1-ff))),9,7,KEY,ff*ff);}
  manicBody(c,t,dt,W,H,st,KEY);
  drawP(c,st);
  manicBar(c,W,H,SC,KEY);},
sunpo(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // ── 순포 盾砲 — **돌면서 쏘는 방패** (2026-08-10 신설) ──────────────────
  //
  // 곡면 판 몇 기가 캐릭터 주위를 **일정한 속도로** 공전하며 바깥으로 총을
  // 쏜다. 방어와 공격을 한 몸에 넣은 것이 정체다.
  //
  // ⚠️ 겹치는 무기 둘과 축을 갈랐다.
  //   공전  — 몸통이 곧 무기라 **닿아야** 아프다. 순포는 몸통이 안 아프고
  //          아픈 것은 거기서 나가는 탄이다.
  //   따발총 — **내가 보는 쪽**으로 쏜다(방향 제어 가능). 순포는 자율주행이라
  //          방향을 못 고른다 — 대신 사방을 훑는다.
  // ⚠️ **판은 실제로 막지 않는다**(2026-08-10 사용자 확정). 방패 모양인 것은
  // 디자인이고 방어 수치는 없다 — 주석에 「탄을 막는다」고 적어 뒀던 것을
  // 지운다. 코드가 안 하는 일을 주석이 약속하면 다음 사람이 그걸 구현한다.
  //
  // ⚠️ **과열 — 순포만의 것**(2026-08-10 사용자 제안). 빠르게 쏘다가 열이
  // 차면 **붉게 깜빡이며 멈추고**, 식으면 다시 쏜다. 조준을 못 고르는 대신
  // 「언제 멈추는지」는 읽을 수 있게 되는 것이 이 무기의 리듬이다.
  //
  // ⚠️ 따발총 L5 도 「과열되어 붉다」를 쓰므로 **둘이 안 헷갈리게 갈랐다**:
  //   따발총 — 늘 붉다(**상태**). 두 가닥이 상시 과열색이다
  //   순포   — 달아올랐다 식는다(**주기**). 붉어지면 **발사가 멈춘다**
  // 색만 같고 움직임이 다르면 구분된다 — 멈추느냐가 그 차이를 못박는다.
  //
  // 그리고 갑자기 멈추면 고장으로 보인다. **셀이 한쪽부터 차오르는 열 게이지**로
  // 예고한다 — 못 고르는 무기일수록 예고가 있어야 조작의 여지가 생긴다.
  //
  // 성장축은 **기수**다: 1 → 2 → 2(연사) → 3 → 4(각성, 총구 둘). 열은
  // 레벨이 오를수록 **더 오래 버티고 더 빨리 식는다**.
  st.F=st.F||mkFoes([[62,-46,11],[-58,-40,10],[4,-84,9],[-70,26,10],[66,30,9]]);
  stepFoes(st.F,dt);
  // 기수 — **레벨이 곧 개수**다(2026-08-10 사용자 확정). 1·2·3·4·5.
  // 성장이 한 줄로 읽히는 것이 이 무기의 값이라, 중간에 다른 성질을 끼워
  // 넣지 않는다: 연사와 총구 둘은 **각성에만** 얹는다.
  const NP  =[1,2,3,4,5][LV-1];        // 판 기수
  // 갈래 — L3 에서 둘, L4 에서 셋(2026-08-10 사용자 확정).
  // 각성은 갈래를 더 늘리지 않고 **가운데만 굵은 탄**으로 간다: 넷째 갈래를
  // 붙이면 사방이 탄으로 덮여 「어느 게 센 탄인지」가 안 보이는데, 가운데
  // 하나가 굵으면 각성이 **한눈에** 읽힌다.
  const BUR =1;
  const GUN =[1,1,2,3,3][LV-1];
  const HEAVY=atL(5);                  // 각성 — 가운데 갈래가 굵은 탄
  // 갈래 각 — 하나면 정면, 둘이면 ±, 셋이면 가운데 + 양옆.
  const SPREAD=GUN===1?[0]:GUN===2?[-.22,.22]:[-.30,0,.30];
  // 연사 — 전체를 당겼다(2026-08-10 사용자 판정: 「연사속도 빠르게」).
  // 과열이 DPS 상한을 만들어 주므로 낱발 간격은 마음껏 조일 수 있다 —
  // 그게 과열이라는 장치를 넣은 값어치다.
  // 연사 — 과열이 DPS 상한을 만들어 주므로 낱발 간격은 조여도 된다.
  //
  // ⚠️ 다만 **갈래가 늘 때는 되레 늦춘다**(L2 .28 → L3 .30). 갈래는 곱셈이라
  // 그냥 얹으면 L3 에서 한 번에 3.9배가 뛴다 — 다른 칸이 2배 안팎인데
  // 한 칸만 자릿수가 다르면 그 레벨 전후로 게임이 딴판이 된다.
  // 낱발이 느려져도 총량은 오르므로 체감은 「강해졌다」가 맞다.
  const PER =[.34,.28,.30,.26,.22][LV-1];
  // 공전 반경 — 아주 조금씩만 는다. **몸에 붙어 돌아야** 「나를 지키는
  // 방벽」이고, 크면 「따로 떨어져 있는 고리」가 된다(2026-08-10 사용자 판정,
  // 결계가 46 → 36 으로 조인 것과 같은 이유).
  const RR  =[34,36,38,41,44][LV-1];
  // 판 반각 — 넓어야 방패다(좁으면 아무리 두껍게 그려도 조각으로 보인다).
  // 다만 레벨로 크게 벌리지 않는다: 넷이 각각 넓으면 L5 에서 고리가 닫혀
  // **도넛 하나**로 보이고, 그러면 「방패 넷」이 아니라 「벽」이 된다.
  // 막는 각도는 판 크기가 아니라 **기수**가 늘린다.
  //
  // ⚠️ 앞쪽 셋(L1~L3)을 **더 줄였다**(2026-08-10 사용자 판정). 기수가 하나
  // 둘뿐인 레벨에서 조각이 크면 「한 기가 다 막는다」로 보여 기수가 느는
  // 성장이 안 읽힌다 — 시작이 작아야 끝이 커 보인다.
  // 기수가 다섯까지 가므로 **조각은 더 안 벌린다.** 다섯이 각각 넓으면
  // 고리가 닫혀 도넛이 된다 — 막는 각도는 기수가 늘린다.
  const PW  =[.44,.46,.48,.48,.48][LV-1];
  const SPIN=.85;                       // **일정한 속도.** 레벨과 무관하다
  // ── 과열 주기 (2026-08-10 사용자 확정) ────────────────────────────────
  //
  //   정상 — 노랑. 그냥 쏜다
  //   경고 — 주황을 거쳐 빨강으로. **여전히 쏘고, 오히려 더 빨리 쏜다**
  //   정지 — 회색. 안 쏜다. 끝에서 깜빡이며 노랑으로 돌아온다
  //
  // 경고 구간이 핵심이다. 이 넷이 없으면 「잘 쏘다가 갑자기 죽었다」이고,
  // 있으면 **「곧 멈춘다」를 미리 알고 움직일 수 있다** — 조준을 못 고르는
  // 무기에 남는 유일한 조작의 여지가 이 예고다.
  //
  // ⚠️ **경고 동안 연사가 빨라진다**(2026-08-10 사용자 판정: 「과열이 너무
  // 에반가? L4 치고 너무 약하다」). 실측하면 L4 가동률은 87.5% 라 약하지
  // 않은데, 붉게 깜빡이는 5초가 **벌칙처럼 읽혀서** 약해 보였다.
  //
  // 그래서 벌칙을 줄이는 대신 **경고를 보상으로 뒤집는다** — 과부하라서 더
  // 빨리 쏘고, 그러다 멈춘다. 같은 빨강이 「지금 손해」가 아니라 「지금 제일
  // 세다, 대신 곧 멈춘다」가 되고, 경고가 제일 긴 L4 가 가장 많이 얻는다.
  //
  // 초를 그대로 적는다. 볼리 수로 잡았더니 연사(PER)를 고칠 때마다 쏘는
  // 시간이 같이 바뀌어 「몇 초 쏘는 무기인가」가 표에 안 남았다.
  // ⚠️ **L1 의 정지를 3 → 4 로 늦췄다.** 받은 표(L1 8/3/3 · L2 10/3/4)를
  // 그대로 넣으면 가동률이 78.6% → 76.5% 로 **레벨업에 내려간다** — 사다리가
  // 절대 하면 안 되는 것이다. 한 칸 늦추면 73.3 → 76.5 → 78.9 → 87.5 → 100
  // 으로 단조가 된다.
  const T_FIRE=[8,10,12,16,0][LV-1];
  const T_WARN=[3,3,3,5,0][LV-1];
  const T_DEAD=[4,4,4,3,0][LV-1];
  const T_CYC=T_FIRE+T_WARN+T_DEAD;
  st.cyc=(st.cyc||0)+dt;if(T_CYC>0&&st.cyc>=T_CYC)st.cyc-=T_CYC;
  // ⚠️ **L5 는 과열이 없다**(사용자 확정). 각성은 「제약이 하나 사라지는
  // 것」이라야 각성답다 — L1~L4 가 쏘다 쉬는 무기라면 L5 는 안 쉬는 무기다.
  // ⚠️ 각성은 **주기 밖**이다. 표를 0/0/0 으로 두고 위상만 0 으로 잡았더니
  // `ph(0) >= T_FIRE+T_WARN(0)` 이 참이 되어 **영구 정지로 잠겼다** —
  // 시안에서 L5 만 아예 안 쏘는 버그(2026-08-10 사용자 발견).
  // 「없음」을 0 으로 표현하면 경계 비교가 그 0 을 삼킨다. 깃발로 가른다.
  const AWK=atL(5);
  const ph=st.cyc;
  const WARN=!AWK&&ph>=T_FIRE&&ph<T_FIRE+T_WARN;
  const STOP=!AWK&&ph>=T_FIRE+T_WARN;
  st.b=st.b||[];st.acc=(st.acc||0)+dt;
  // ── 열 색 ────────────────────────────────────────────────────────────
  // 회색을 거치는 것이 중요하다: 빨강에서 바로 노랑으로 가면 「식었다」가
  // 아니라 「색이 한 바퀴 돌았다」로 보인다. 죽은 구간이 있어야 리듬이 선다.
  // 단계 팔레트가 아니라 **보간**으로 넘어간다 — 단계면 「달아오른다」가
  // 아니라 「색이 바뀌었다」다.
  const HOT=TONE.amber, RED=TONE.ember, GRAY=["#1B1B1F","#4A4A52","#6E6E78"];
  // 각성은 **팔레트째 갈아탄다** — 열 색(주황·빨강)을 안 쓰므로 BASE 하나만
  // 바꾸면 판·총구·잔탄이 전부 따라온다.
  const BASE=AWK?TONE.wSunpoAwk:toneOf("gold");
  const BKEY=AWK?"wSunpoAwk":"gold";     // 잔탄이 쓰는 톤 키
  let TH=BASE, live=1;
  if(WARN){
    const k=(ph-T_FIRE)/T_WARN;
    TH=k<.5?mixTone(BASE,HOT,k/.5):mixTone(HOT,RED,(k-.5)/.5);
    // 경고는 **깜빡인다.** 색만 변하면 「예뻐졌네」로 지나치고, 깜빡여야
    // 눈이 간다. 뒤로 갈수록 빨라져 남은 시간을 스스로 말한다.
    live=.72+.28*(Math.sin(t*(9+22*k))>0?1:.2);
  }else if(STOP){
    const v=(ph-T_FIRE-T_WARN)/T_DEAD;
    if(v<.58){TH=mixTone(RED,GRAY,Math.min(1,v/.22));live=.5;}
    else{const w=(v-.58)/.42;
      TH=mixTone(GRAY,BASE,w);live=.5+.5*(Math.sin(t*(20+30*w))>0?1:.35);}}
  // [celSpike]·[celSplash] 는 톤 **키**만 받으므로 이번 프레임의 열 색을
  // 임시 키로 걸어 둔다. 발사 갈래까지 같이 달아올라야 「이 포대가 뜨겁다」가
  // 되지, 판만 붉고 갈래가 노라면 두 물건으로 보인다.
  TONE.__heat=TH;

  const plateAng=k=>t*SPIN+k/NP*TAU;
  // 발사 — 판마다 총구가 바깥을 본다. 표적을 안 고른다: 「사방으로」가
  // 이 무기의 성격이라 조준을 넣는 순간 유도탄이 된다.
  // 과부하 — 경고 동안 낱발 간격이 짧아진다.
  const OVERDRIVE=1.5;
  if(st.acc>(WARN?PER/OVERDRIVE:PER)&&!STOP){st.acc=0;
    for(let k=0;k<NP;k++){const a=plateAng(k);
      for(let gn=0;gn<GUN;gn++){
        const ga=a+SPREAD[gn];
        // 각성의 가운데 탄 — 굵고 조금 느리다. 느린 것이 굵어 보이게 한다.
        const hv=HEAVY&&SPREAD[gn]===0, sp0=hv?178:205;
        for(let b=0;b<BUR;b++)
          st.b.push({x:cx+Math.cos(ga)*RR,y:cy+Math.sin(ga)*RR,
            a:ga,l:-b*.07,fx:Math.cos(ga)*sp0,fy:Math.sin(ga)*sp0,hv,bk:BKEY});}
      st.fl=st.fl||[];st.fl.push({k,l:0});}}
  st.fl=(st.fl||[]).filter(f=>(f.l+=dt)<.14);
  for(let i=st.b.length-1;i>=0;i--){const q=st.b[i];q.l+=dt;
    if(q.l<0)continue;                       // 연사 간격 — 아직 안 나갔다
    q.x+=q.fx*dt;q.y+=q.fy*dt;
    for(const f of st.F)
      if(Math.hypot(cx+f.ox+f.kx-q.x,cy+f.oy+f.ky-q.y)<f.r+(q.hv?9:5)){
        hitFoe(st,f,cx,cy,Math.cos(q.a),Math.sin(q.a),q.hv?30:16);q.l=9;break;}
    if(q.l>1.0||Math.hypot(q.x-cx,q.y-cy)>W*.62)st.b.splice(i,1);}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 탄 — 짧고 단단한 캡슐. 판에서 나온 것이 보이게 **판 색과 같다**.
  for(const q of st.b){if(q.l<0)continue;
    // 각성 탄은 **무기색을 안 탄다**(RECOLOR 는 "gold" 만 바꾼다) — 이 한
    // 발만 다른 색이어야 「가운데가 특별하다」가 보인다.
    if(q.hv){celRound(c,q.x,q.y,q.a,11,5.2,"wSunpoHv",1,.55);
      celSpike(c,q.x-Math.cos(q.a)*7,q.y-Math.sin(q.a)*7,
        q.a+Math.PI,9,3.4,"wSunpoHv",.55);}
    else celRound(c,q.x,q.y,q.a,7,2.6,q.bk||"gold",1,0);}
  // 판 — 아래쪽 절반은 몸 앞이다(공전과 같은 규칙).
  //
  // ⚠️ **그림체를 두 번 갈아엎었다**(2026-08-10). 처음엔 레퍼런스 도면 그대로
  // 금속판 + 마운트 + 포신을 그렸는데, 이 게임의 어휘는 **빛**이라 순포만
  // 하드웨어면 한 화면에 두 세계가 선다. 두 번째는 각진 빛 조각으로 갔지만
  // 여전히 「띠」였다.
  //
  // 맞는 답은 **결계(ward)의 셀 문법**이다(사용자 지시). 결계는 육각 셀을
  // 구면에 깔아 방벽을 만든다 — 순포는 그 셀을 **호 위에 한 줄로 깔아**
  // 조각 방벽을 만들고, 그 조각이 돌면서 바깥으로 쏜다. 같은 계보의 두
  // 무기가 「감싼다 ↔ 돈다」로 갈리는 것이 옳다.
  //
  // 셀 하나의 문법도 결계와 같이 간다: 옅은 면 + 밝은 테두리, 달아오르면
  // 테두리가 굵어지고 심이 박힌다. 새 원시함수를 안 만드는 것이 핵심이다 —
  // 그리는 법이 같아야 같은 세계로 보인다.
  // 셀 수도 같이 줄인다 — 반각만 줄이면 같은 셀이 겹쳐 뭉개진다.
  const NC=[2,2,3,3,3][LV-1];            // 조각 하나를 이루는 셀 수
  for(let k=0;k<NP;k++){const a=plateAng(k);
    const fl=(st.fl||[]).find(f=>f.k===k);
    const ff=fl?1-fl.l/.14:0;
    const rec=ff*4.5;                     // 반동 — 안쪽으로 밀린다
    const RJ=RR-rec;
    const py=cy+Math.sin(a)*RJ*.62;
    dep(c,py,cy,(c,al0)=>{const al=al0*live;
      const T=TH,CR=RJ*PW/NC*.95;
      const hexP=(x,y,r,rot)=>{const P=[];
        for(let j=0;j<6;j++){const g0=rot+j/6*TAU;
          // 호 접선 방향으로 살짝 눌러 **구면에 누운 판**으로 보이게 한다
          // (결계가 극의 셀을 누르는 것과 같은 이유).
          P.push([x+Math.cos(g0)*r,y+Math.sin(g0)*r*.78]);}
        return P;};
      const trace=P=>{c.beginPath();
        P.forEach((v,j)=>j?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();};
      for(let i=0;i<NC;i++){
        const th=a-PW+(i+.5)/NC*2*PW;
        const x=cx+Math.cos(th)*RJ,y=cy+Math.sin(th)*RJ*.62;
        // 가운데 셀이 **발사구**다 — 쏠 때 그 셀만 달아오른다.
        const mid=Math.abs(i-(NC-1)/2)<.6, hot=mid?ff:ff*.35;
        // 각성 — **가운데 셀만 파랗다**(2026-08-10 사용자 지시). 굵은 광탄이
        // 나가는 자리라, 쏘는 셀과 나가는 탄이 같은 색이어야 「저기서 저게
        // 나온다」가 읽힌다. 셀은 금색인데 탄만 파랗면 두 물건으로 보인다.
        //
        // ⚠️ 이 셀은 **열 색을 안 탄다.** 각성은 과열이 없으니 달아오를 일이
        // 없고, 열 색을 태우면 다른 셀과 같이 노랗다 붉었다 해서 「특별한
        // 자리」라는 표시가 사라진다.
        const CT=(HEAVY&&mid)?TONE.wSunpoHv:T;
        trace(hexP(x,y,CR,th));
        c.fillStyle=A(CT[1],.12*al+hot*.4);c.fill();
        c.strokeStyle=A(hot>.3?CT[2]:CT[1],Math.min(1,al*1.5));
        c.lineWidth=1.5+hot*2.4;c.stroke();
        // L4 부터 셀에 심이 박힌다 — 「판이 두꺼워진다」를 결계와 같은 방식으로.
        if(atL(4)){trace(hexP(x,y,CR*.52,th));
          c.fillStyle=A(CT[1],.24*al);c.fill();
          c.strokeStyle=A(CT[2],al*.55);c.lineWidth=1.1;c.stroke();}
        if(hot>.35){trace(hexP(x,y,CR*.5,th));c.fillStyle=A(CT[2],hot*.85);c.fill();}}
      // 발사 — 셀에서 **빛이 쏠려 나간다.** 총구도 불꽃도 없다: 갈래 하나가
      // 바깥으로 서고, 조금 나간 자리에서 흩어진다.
      for(let gn=0;gn<GUN;gn++){const ga=a+SPREAD[gn];
        const hv=HEAVY&&SPREAD[gn]===0;
        const ox=cx+Math.cos(ga)*(RJ+CR*.7),oy=cy+Math.sin(ga)*(RJ+CR*.7)*.62;
        if(ff>0){
          // 가운데 총구도 파랗게 — 나가는 탄과 색이 다르면 두 물건이 된다.
          celSpike(c,ox,oy,ga,(10+22*ff)*(hv?1.4:1),(3.6+3*ff)*(hv?1.7:1),
            hv?"wSunpoHv":"__heat",al);
          celSplash(c,cx+Math.cos(ga)*(RJ+CR*2.2),cy+Math.sin(ga)*(RJ+CR*2.2)*.62,
            4+9*(1-ff),7,k*3+gn+1,"__heat",ff*.85);}}});}

  drawP(c,st);hero(c,t,cx,cy);},
shotgun(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // **굵고 느린 빛 덩어리를 던진다.** 느림이 곧 정체성이라 날아가는 동안
  // 화면에 남아 있는 유일한 무기다.
  //
  // 재설계 2026-08-10 — 갈래가 는다: 1·1·2(앞뒤)·3·4(동서남북). 폭발 반경도
  // 레벨마다 커지고, **갈래가 늘면 인원이 준다**(3·4·3·4·5). 안 그러면 L5 가
  // 갈래 수만큼 통째로 곱해져 한 무기가 화면을 지운다.
  // 엔진이 오래 즉발 원뿔이었는데, 그림 쪽이 처음부터 맞았다.
  st.F=st.F||mkFoes([[34,-58,11],[-30,-64,10],[4,-96,9],[62,-30,10]]);stepFoes(st.F,dt);
  st.s=st.s||[];st.bl=st.bl||[];
  // ⚠️ 시안 타일은 반너비 93px 뿐이라 엔진 값(150px/s x 0.9s)을 그대로 쓰면
  // 옆·아래 갈래가 칸 밖에서 터진다. **비율은 지키고 절대값만 줄인다.**
  const WAYS=[1,1,2,3,4][LV-1], BR=[22,28,28,33,38][LV-1], MAX=[3,4,3,4,5][LV-1];
  const REACH=[.40,.49,.49,.58,.58][LV-1];
  const u=saw(t,1.7);
  if(u<st.pu){for(let k=0;k<WAYS;k++){
      // 갈래는 **바라보는 쪽 기준**이다(시안은 위쪽이 정면).
      const a=-Math.PI/2+(WAYS===1?0:k*(2*Math.PI/WAYS));
      st.s.push({x:cx,y:cy,a,v:105,l:0,tr:[]});}
    st.mz=.18;}
  st.pu=u;st.mz=Math.max(0,(st.mz||0)-dt);
  for(let i=st.s.length-1;i>=0;i--){const q=st.s[i];q.l+=dt;
    q.x+=Math.cos(q.a)*q.v*dt;q.y+=Math.sin(q.a)*q.v*dt;
    q.tr.push([q.x,q.y]);if(q.tr.length>7)q.tr.shift();
    let hit=null;
    for(const fo of st.F)if(Math.hypot(cx+fo.ox+fo.kx-q.x,cy+fo.oy+fo.ky-q.y)<fo.r+16){hit=fo;break;}
    // 사거리 끝에서도 **터진다** — 안 터지면 「던졌는데 아무 일도 없다」가 된다.
    // [sd] 는 파편 씨앗 — 갈래 각을 쓴다. L5 는 넷이 한꺼번에 터지는데 씨앗이
    // 같으면 네 폭발이 **같은 방향으로 같은 파편**을 뿜어 도장 넷이 된다.
    if(hit||q.l>REACH){st.bl.push({x:q.x,y:q.y,l:0,r:BR,sd:q.a});
      let n=0;
      for(const fo of st.F){if(n>=MAX)break;
        const d=Math.hypot(cx+fo.ox-q.x,cy+fo.oy-q.y);
        if(d<BR){n++;const a=Math.atan2(cy+fo.oy-q.y,cx+fo.ox-q.x);
          hitFoe(st,fo,cx,cy,Math.cos(a),Math.sin(a),92,"gold");}}
      emit(st,q.x,q.y,20,{k:"gold",sp:280,r:3.4,life:.5,spikeP:.5});
      st.s.splice(i,1);}}
  st.bl=st.bl.filter(f=>(f.l+=dt)<.42);
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 날아가는 덩어리 — 꼬리 + 회전하는 겉껍질. 느리니까 잘 보여야 한다.
  for(const q of st.s){
    celRibbon(c,q.tr,13,"gold",.85);
    celPuff(c,q.x,q.y,17,9,7+((t*3)|0)%3,"gold",1);
    celPuff(c,q.x,q.y-2,8,7,31,"gold",1);
    celHoop(c,q.x,q.y,22,.5,t*4,3,"gold",.55);}
  // 총구 반동
  if(st.mz>0){const f=st.mz/.18;
    celPuff(c,cx,cy-18,16*f+5,8,17,"gold",f,.9);
    beamEnd(c,t,cx,cy-18,-Math.PI/2,30*f+8,"gold",f,1);}
  // 착탄 — **레벨이 정한 반경**으로 터진다. 「폭발 범위」가 표대로 큰다.
  for(const bl of st.bl){const f=1-bl.l/.42,g=1-f;
    celHoop(c,bl.x,bl.y,bl.r*(.55+g*.65),1,0,10*f+2,"gold",f*.9);
    celPuff(c,bl.x,bl.y,bl.r*.6+g*bl.r*.4,11,13,"gold",f);
    celPuff(c,bl.x,bl.y-4,bl.r*.3+g*bl.r*.2,8,29,"gold",f);
    // 밖으로 튀는 파편 — 여기 있던 지면 파편([shards])을 걷어낸 자리다.
    // **우주에는 갈라질 땅이 없다**(2026-08-10 사용자 판정). 가로 바닥선에
    // 세운 삼각형 울타리는 무엇에도 안 붙어 폭발과 따로 놀았다.
    // 대신 폭심에서 **사방으로** 날아가는 파편을 둔다 — 탑다운에서 「위로
    // 흩어진다」는 곧 「바깥으로」이고, 방향이 하나도 특별하지 않아야
    // 어느 갈래가 터지든 같은 그림이 된다.
    // ⚠️ 폭심에서 띄워야 한다. 가운데에 붙여 뽑았더니 아홉 갈래가 구를 뚫고
    // 나와 성게가 됐다 — 파편은 **이미 밖으로 나간 것**이라야 날아가는 것이다.
    for(let i=0;i<7;i++){const s2=i+bl.sd*3.1, a=i/7*TAU+bl.sd+hash(s2*3.7)*1.1;
      const d=bl.r*(.78+.95*g)*(.86+.32*hash(s2*5.1));  // 구 바깥에서 시작해 멀어진다
      celSpike(c,bl.x+Math.cos(a)*d,bl.y+Math.sin(a)*d,a,
        bl.r*(.20+.20*hash(s2*9.3))*f,bl.r*.06*f,"gold",f*.85);}}
  drawP(c,st);hero(c,t,cx,cy);},

sanctum(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[48,-26,11],[-54,20,10],[12,54,9]]);stepFoes(st.F,dt);
  st.tk=(st.tk||0)+dt;
  const RR=atL(2)?109:84,TICK=[.24,.24,.24,.15,.15][LV-1];
  if(st.tk>TICK){st.tk=0;for(const f of st.F)if(Math.hypot(f.ox,f.oy/.45)<RR){
    hitFoe(st,f,cx,cy,0,0,0);emit(st,cx+f.ox,cy+f.oy+8,3,{k:"gold",sp:26,r:2.6,life:.7,g:-90,spikeP:.2});}}
  if(R()<dt*22){const a=R()*TAU,r=R()*RR;
    emit(st,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.45,1,{k:"gold",sp:6,r:3,life:1,g:-70,spikeP:.15});}
  stepP(st,dt);
  if(atL(5))celHoop(c,cx,cy,RR*1.12,.45,0,3,"frost",.30);   // L5 잔류
  celHoop(c,cx,cy,RR,.45,0,7,"gold",.9);
  celHoop(c,cx,cy,RR*.66,.45,0,4,"gold",.65);
  if(atL(3))for(let i=0;i<6;i++){const a=i/6*TAU-t*.35;   // L3 감속 — 서리 결정
    const x=cx+Math.cos(a)*RR*.5,y=cy+Math.sin(a)*RR*.5*.45;
    c.save();c.translate(x,y);c.rotate(t*.8+i);
    const hx=(rr,col)=>{c.beginPath();
      for(let j=0;j<6;j++){const b2=j/6*TAU;
        j?c.lineTo(Math.cos(b2)*rr,Math.sin(b2)*rr):c.moveTo(Math.cos(b2)*rr,Math.sin(b2)*rr);}
      c.closePath();c.fillStyle=col;c.fill();};
    hx(6,A(TONE.frost[0],.9));hx(3.6,A(TONE.frost[2],1));c.restore();}
  c.save();c.translate(cx,cy);c.scale(1,.45);c.rotate(t*.5);
  for(let i=0;i<12;i++){const a=i/12*TAU;
    celSpike(c,Math.cos(a)*RR*.8,Math.sin(a)*RR*.8,a,RR*.19,5,"gold",.9);}
  c.restore();
  drawFoes(c,t,cx,cy,st.F);drawP(c,st);hero(c,t,cx,cy);},

pulse(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[62,-24,11],[-54,-42,10],[-12,64,9],[42,46,10]]);stepFoes(st.F,dt);
  st.r=st.r||[];st.acc=(st.acc||0)+dt;
  const PMAX=atL(2)?150:120,PW=atL(3)?16:12;
  if(st.acc>.55){st.acc=0;st.r.push({R:12,hit:new Set(),i:0});
    if(atL(4))st.r.push({R:12,hit:new Set(),i:1});}
  for(let i=st.r.length-1;i>=0;i--){const w=st.r[i],pr=w.R;w.R+=(w.i?310:195)*dt;
    st.F.forEach((f,k)=>{const d=Math.hypot(f.ox+f.kx,f.oy+f.ky);
      if(!w.hit.has(k)&&pr<d&&w.R>=d){w.hit.add(k);const L=d||1;
        hitFoe(st,f,cx,cy,(f.ox+f.kx)/L,(f.oy+f.ky)/L,56);}});
    if(w.R>PMAX)st.r.splice(i,1);}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  if(atL(5))celHoop(c,cx,cy,PMAX,1,0,4,"frost",.30);     // L5 감속 지대
  for(const w of st.r){const f=Math.max(0,1-w.R/PMAX);
    celHoop(c,cx,cy,w.R,1,0,(w.i?PW*.55:PW)*f+1.5,"gold",f);
    for(let i=0;i<10;i++){const a=i/10*TAU+w.R*.01;
      celSpike(c,cx+Math.cos(a)*w.R,cy+Math.sin(a)*w.R,a,18*f,5*f,"gold",f*.9);}}
  drawP(c,st);hero(c,t,cx,cy);},

lightfall(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[-50,-26,11],[44,-54,10],[16,38,9]]);stepFoes(st.F,dt);
  const DROPS=atL(2)?4:3,TELE=atL(4)?.30:.45,HUGE=atL(5);
  st.s=st.s||Array.from({length:4},(_,k)=>({f:st.F[k%st.F.length],u:k*.26,i:k}));
  for(let si=0;si<DROPS;si++){const s=st.s[si];const pu=s.u;s.u=(s.u+dt*.5)%1;
    if(pu<.45&&s.u>=.45){hitFoe(st,s.f,cx,cy,0,1,10);
      emit(st,cx+s.f.ox,cy+s.f.oy,18,{k:"gold",sp:220,r:3,life:.5,spikeP:.6});}}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  for(let si=0;si<DROPS;si++){const s=st.s[si];const big=HUGE&&si===0;
    const x=cx+s.f.ox,y=cy+s.f.oy;
    // **몸보다 아래면 몸 앞이다.** 기둥은 화면 위에서 내려오지만 착탄점이
    // 아래면 기둥 아랫도리가 몸을 가려야 한다.
    dep(c,y,cy,(c,dz)=>{
    if(s.u<TELE){const p=s.u/TELE,bl=.25+.6*Math.abs(Math.sin(p*13));
      celHoop(c,x,y,big?60:28,.42,0,big?7:4,"gold",bl*dz);}
    else{const p=(s.u-TELE)/(1-TELE),f=Math.pow(1-p,1.3)*dz;
      celBeam(c,x,-10,x,y,(big?42:17)*f+3,"gold",f);
      if(atL(3))celPuff(c,x,y,20*f+6,8,si*7+3,"gold",f);
      // 착탄은 **적이 맞는 것**이지 땅이 파이는 게 아니다. 왕관 물보라와
      // 지면 파편을 걷어냈다 — 솟아오르는 느낌은 안 나면서 군더더기만
      // 남았다(2026-08-09 실기 판정). 기둥이 내리치고 적이 펑 하면 끝이다.
      celSplash(c,x,y,30*f,10,s.i*5+3,"gold",f);}});}
  drawP(c,st);hero(c,t,cx,cy);},

arc(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[48,-52,11],[-32,-72,10],[-64,4,10],[28,50,9]]);stepFoes(st.F,dt);
  st.acc=(st.acc||0)+dt;st.h=st.h===undefined?-1:st.h;
  const HOPS=Math.min(st.F.length,[2,3,3,4,4][LV-1]);
  if(st.acc>.3){st.acc=0;st.h++;if(st.h>=HOPS)st.h=-1;
    if(st.h>=0)hitFoe(st,st.F[st.h],cx,cy,0,0,7,"volt");}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  const pts=[[0,0],...st.F.map(f=>[f.ox+f.kx,f.oy+f.ky])];
  for(let i=0;i<=st.h;i++){const a=pts[i],b=pts[i+1];if(!b)break;
    const al=i===st.h?1:.42,seed=i*29+((t*20)|0);
    // 셀 번개 — 선이 아니라 각진 덩어리
    const P=[];const N=7;
    for(let s=0;s<=N;s++){const p=s/N;
      let nx=cx+a[0]+(b[0]-a[0])*p,ny=cy+a[1]+(b[1]-a[1])*p;
      if(s>0&&s<N){let dx=-(b[1]-a[1]),dy=(b[0]-a[0]);const L=Math.hypot(dx,dy)||1;
        const j=(hash(seed+s*13.7)-.5)*24;nx+=dx/L*j;ny+=dy/L*j;}
      P.push([nx,ny]);}
    // 전류가 아래쪽 적으로 뻗으면 몸 앞을 지난다.
    dep(c,cy+b[1],cy,(c,dz)=>celRibbon(c,P,9*al,"volt",al*dz));}
  if(atL(3)&&st.h>=1){const a=pts[1],b2=st.F[Math.min(3,st.F.length-1)];   // L3 분기
    const P=[],N=7;const seed=97+((t*20)|0);
    for(let s2=0;s2<=N;s2++){const q=s2/N;
      let nx=cx+a[0]+(b2.ox-a[0])*q,ny=cy+a[1]+(b2.oy-a[1])*q;
      if(s2>0&&s2<N){let dx=-(b2.oy-a[1]),dy=(b2.ox-a[0]);const L=Math.hypot(dx,dy)||1;
        const j=(hash(seed+s2*13.7)-.5)*20;nx+=dx/L*j;ny+=dy/L*j;}
      P.push([nx,ny]);}
    celRibbon(c,P,6,"volt",.7);}
  if(atL(5)&&st.h>=HOPS-1){const a=pts[HOPS];                              // L5 회귀
    celRibbon(c,[[cx+a[0],cy+a[1]],[cx+a[0]*.5,cy+a[1]*.5-14],[cx,cy]],5,"volt",.65);}
  if(st.h>=0){const f=st.F[st.h];celSplash(c,cx+f.ox,cy+f.oy,20,9,st.h*3,"volt",.95);}
  drawP(c,st);hero(c,t,cx,cy);},

pillar(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[64,-16,10],[-60,-20,10],[0,-76,9],[24,58,9]]);stepFoes(st.F,dt);
  const NP=atL(2)?8:6,RR=atL(4)?94:70;
  st.s=st.s||Array.from({length:8},(_,i)=>({a:i/8*TAU-Math.PI/2,u:i*.13,i}));
  for(let si=0;si<NP;si++){const s=st.s[si];const pu=s.u;s.u=(s.u+dt*.78)%1;
    if(pu<.06&&s.u>=.06){const px=Math.cos(s.a)*RR,py=Math.sin(s.a)*RR*.5;
      for(const f of st.F)if(Math.hypot(f.ox-px,f.oy-py)<30)hitFoe(st,f,cx,cy,0,-1,14);
      emit(st,cx+px,cy+py,10,{k:"gold",sp:70,r:3,life:.55,g:120,spikeP:.5});}}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  for(let si=0;si<NP;si++){const s=st.s[si];if(s.u>.5)continue;
    const p=s.u/.5,h=92*Math.sin(p*Math.PI),f=Math.sin(p*Math.PI);
    const x=cx+Math.cos(s.a)*RR,y=cy+Math.sin(s.a)*RR*.5;
    // 기둥은 **몸 주위 원 위에서** 솟는다. 원의 아래쪽 절반은 몸보다 앞이라
    // 몸을 가려야 한다 — 전부 뒤에 깔면 기둥이 캐릭터 뒤에서 솟는다.
    dep(c,y,cy,(c,dz)=>{const g=f*dz;
    if(atL(3))celHoop(c,x,y,20,.4,0,3,"volt",g*.8);
    if(atL(5)&&s.u>.34)celBeam(c,x,y,x,y-h*.42,6,"gold",g*.7);
    // 굵은 기둥 하나 — 갈라지는 건 위쪽뿐이다.
    celBeam(c,x,y,x,y-h*.82,12*f+2,"gold",g);
    celHoop(c,x,y,28*(1+p*.5),.4,0,5,"gold",g*.9);
    // 꼭대기는 착탄이 아니라 **분출의 끝** — 획 둘이 바깥으로 말리며 사라진다
    beamEnd(c,t+s.i*.7,x,y-h*.84,-Math.PI/2,30*f+8,"gold",g,-1);});}
  drawP(c,st);hero(c,t,cx,cy);},

// 결계 — **육각이 다닥다닥 붙은 구(球) 방벽.** 판때기가 돌든 육각이 흩어져
// 돌든 "위성"으로 보인다(2026-08-08 세 번 반려). 벌집이 빈틈없이 몸을 감싸야
// 방벽이다. 위도 밴드 5줄로 구를 덮고, 깊이(뒤/앞)로 밝기와 그리는 순서를
// 정한다 — 뒤쪽 육각이 흐리게 비쳐야 속이 빈 껍질로 읽힌다.
ward(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // 적을 셸 밖에 세워 둔다 — **먼저 무손상 상태로 레벨 간 밀도를 비교**해야
  // 한다. 안쪽에 두면 매 프레임 셀이 깨져, 화면에 보이는 게 밀도가 아니라
  // 「그 순간 몇 대 맞았나」가 된다(2026-08-09). 깨짐·재생 규칙은 그대로
  // 살아 있고 게임에서는 적이 닿는 즉시 돈다.
  st.F=st.F||mkFoes([[100,-32,11],[-98,26,10],[8,-104,9]]);stepFoes(st.F,dt);
  // ── 레벨 설계 (2026-08-09 확정) ──────────────────────────────────────
  // **극을 덮어 완전한 구로 간다.** 밴드가 ±45°에서 끝나 위아래가 뚫려
  // 있었고(「휴지곽」), 그러면 「위아래에서 오는 공격은 못 막나?」가 된다 —
  // 그런데 시뮬의 방패는 평면 원을 돌아 **전 방향을 실제로 막는다**. 그림이
  // 규칙에 대해 거짓말을 하고 있었다. 닫힌 구는 sim 을 한 줄도 안 고치고
  // 정직해진다.
  //
  // 성장축은 **크기 + 밀도**다. 작고 성긴 구 → 크고 촘촘한 구.
  // 셸 반경 — 몸(반지름 17)의 2.1~2.9배. 크면 「몸을 감싼 것」이 아니라
  // 「따로 있는 큰 구」로 보인다(2026-08-09 실기 판정).
  const RR=[36,40,44,47,50][LV-1];
  // **셀은 각도로 깐다.** 밴드마다 개수를 손으로 박으면 셸이 커질 때 밀도가
  // 그대로여서 「L3 가 L2 보다 약해 보인다」가 된다(2026-08-09 실기 판정).
  // 한 셀이 차지하는 각(ANG)만 정하면 위도 줄 수도, 줄마다 개수도, 셀 크기도
  // 전부 따라 나온다 — 위도 ph 의 둘레가 2π·cos(ph) 이므로.
  //
  // FILL 은 셀이 서로 겹치는 정도다. **1 미만이면 틈이 보이고 넘으면 메워진다**
  // — L1 은 성기고 L3 부터 빈틈이 없다는 것이 이 무기의 레벨 그림이다.
  const ANG=[.70,.58,.50,.44,.40][LV-1],FILL=[.86,.95,1.02,1.08,1.12][LV-1];
  if(!st.cell){st.cell=[];
    const nb=Math.max(3,Math.round(Math.PI/ANG));
    for(let bi=0;bi<nb;bi++){
      const ph=-Math.PI/2+(bi+.5)*Math.PI/nb;
      const n=Math.max(1,Math.round(TAU*Math.cos(ph)/ANG));
      for(let i=0;i<n;i++)
        st.cell.push({ph,th:i/n*TAU+(bi%2?Math.PI/n:0),fl:0});}
    st.cell.forEach((q,i)=>q.rank=hash(i*7.3));}   // 셀이 빠지는 순서(고정)
  const spin=t*(atL(2)?.55:.42),CELLR=RR*ANG*.5*FILL,
        REFL=atL(3),BURST=atL(5),THICK=atL(4);
  // **맞은 그 셀이 깨진다.** 전체 체력을 깎아 아무 셀이나 빼면, 화면에서
  // 보이는 것은 밀도 차이가 아니라 「그 순간 몇 대 맞았나」가 되어 레벨 간
  // 비교가 불가능해진다(2026-08-09 실기 판정). 깨진 자리는 REGROW 초 뒤에
  // 그 자리에 다시 돋는다 — 어디가 뚫렸는지가 눈에 보여야 방벽이다.
  const REGROW=2.2;
  for(const q of st.cell)if(q.dead>0)q.dead-=dt;
  // 피격 — 맞은 방향의 셀이 달아오르고 이웃으로 번진다
  for(const f of st.F){const d=Math.hypot(f.ox+f.kx,f.oy+f.ky);
    if(d>RR+f.r+8)continue;
    const fa=Math.atan2(f.oy+f.ky,f.ox+f.kx);
    let best=null,bd=9;
    for(const q of st.cell){const th=q.th+spin;
      const sx=Math.cos(q.ph)*Math.sin(th),sy=Math.sin(q.ph);
      if(Math.cos(q.ph)*Math.cos(th)<0)continue;
      const a2=Math.atan2(sy,sx),dd=Math.abs(((a2-fa)%TAU+TAU+Math.PI)%TAU-Math.PI);
      if(dd<bd){bd=dd;best=q;}}
    if(best&&bd<.5){best.fl=1;best.dead=REGROW;
      hitFoe(st,f,cx,cy,Math.cos(fa),Math.sin(fa),34);
      for(const q of st.cell)if(Math.abs(q.ph-best.ph)<.45&&
        Math.abs(((q.th-best.th)%TAU+TAU+Math.PI)%TAU-Math.PI)<.75)q.fl=Math.max(q.fl,.55);}}
  for(const q of st.cell)q.fl=Math.max(0,q.fl-dt*2.2);
  stepP(st,dt);
  // 뒤쪽 셀 → 어둠 → 앞쪽 셀. 이 순서라야 껍질 안에 몸이 든 것으로 읽힌다.
  const cell=(q,front)=>{const th=q.th+spin;
    const dep=Math.cos(q.ph)*Math.cos(th);
    if((dep>=0)!==front)return;
    const x=cx+Math.cos(q.ph)*Math.sin(th)*RR, y=cy+Math.sin(q.ph)*RR*.94;
    const grow=q.dead>0?1-q.dead/.5:1;            // 다시 돋는 중
    const sc=(.62+.38*Math.abs(dep))*(1+q.fl*.22)*grow;
    const r=CELLR*sc,rot=th*.25;
    if(BURST&&q.fl>.75)return;   // L5 파열 — 터진 셀은 잠깐 비고 재생된다
    // 깨진 셀 — 다시 돋는 마지막 0.5초에는 작게 솟아오른다.
    if(q.dead>0){if(q.dead>.5)return;}
    const al=(front?.55+.45*dep:.16+.14*(1+dep))*(.5+.5*q.fl)+q.fl*.45;
    const T=TONE.gold;
    // **구면 위의 판은 기울어진 만큼 납작해진다.** 육각을 어디서나 정면
    // 모양으로 그리면 극의 셀이 떠 보여 「뚜껑이 없다」로 읽힌다(2026-08-09
    // 실기 판정). 법선의 화면 투영 방향(u)으로만 |dep| 만큼 누른다 — 정면
    // 셀은 온전한 육각, 극·가장자리로 갈수록 유리판이 눕는다.
    // 바닥 .18 을 두는 이유: 실루엣 가장자리(dep≈0)에서 셀이 선으로 사라져
    // 테두리에 구멍이 뚫린 것처럼 보이기 때문이다.
    let ux=Math.cos(q.ph)*Math.sin(th),uy=Math.sin(q.ph);
    const ul=Math.hypot(ux,uy);
    if(ul<1e-4){ux=0;uy=1;}else{ux/=ul;uy/=ul;}
    const kf=Math.max(.18,Math.abs(dep));
    const hexP=(rr)=>{const P=[];
      for(let j=0;j<6;j++){const a=rot+j/6*TAU;
        const lx=Math.cos(a)*rr,ly=Math.sin(a)*rr;
        const du=lx*ux+ly*uy,dv=-lx*uy+ly*ux;
        P.push([x+ux*du*kf-uy*dv, y+uy*du*kf+ux*dv]);}
      return P;};
    const trace=(P)=>{c.beginPath();
      P.forEach((v,j)=>j?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();};
    trace(hexP(r));
    c.fillStyle=A(T[1],.10*al+q.fl*.35);c.fill();
    c.strokeStyle=A(q.fl>.3?T[2]:T[1],Math.min(1,al*1.5));c.lineWidth=1.4+q.fl*2.2;c.stroke();
    if(REFL){const P=hexP(r*.62);c.beginPath();
      c.moveTo(P[3][0],P[3][1]);c.lineTo(P[0][0],P[0][1]);
      c.strokeStyle=A(T[2],al*.9);c.lineWidth=1.6;c.stroke();}
    // L4 「판이 두꺼워진다」 — 셀마다 안쪽 심이 박힌다. 고리를 하나 더
    // 두르면 셸과 무관한 원이 떠서 생뚱맞다(2026-08-09 반려).
    if(THICK){trace(hexP(r*.52));c.fillStyle=A(T[1],.22*al);c.fill();
      c.strokeStyle=A(T[2],al*.55);c.lineWidth=1.1;c.stroke();}
    if(q.fl>.35){trace(hexP(r*.5));c.fillStyle=A(T[2],q.fl*.85);c.fill();}};
  for(const q of st.cell)cell(q,false);
  drawFoes(c,t,cx,cy,st.F);
  hero(c,t,cx,cy);
  for(const q of st.cell)cell(q,true);
  drawP(c,st);},

wisp(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  st.F=st.F||mkFoes([[56,-52,10],[-60,-36,10],[18,60,9]]);stepFoes(st.F,dt);
  st.tr=st.tr||[[],[],[],[]];
  const NW=[2,3,3,4,4][LV-1];
  const p=[];for(let i=0;i<NW;i++){const a=t*(.85+i*.33)+i*2.1;
    const q=[cx+Math.cos(a)*(56+18*Math.sin(t*1.7+i)),cy+Math.sin(a*1.31)*(50+14*Math.cos(t*1.2+i))];
    p.push(q);st.tr[i].push(q);if(st.tr[i].length>16)st.tr[i].shift();}
  const LINK=atL(5);
  for(const q of p)for(const f of st.F)
    if(Math.hypot(cx+f.ox+f.kx-q[0],cy+f.oy+f.ky-q[1])<f.r+11&&R()<dt*9)hitFoe(st,f,cx,cy,0,0,6);
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  if(LINK)for(let i=0;i<NW;i++){const q=p[i],r2=p[(i+1)%NW];
    celRibbon(c,[q,[(q[0]+r2[0])/2,(q[1]+r2[1])/2],r2],4,"gold",.75);}
  // 정령은 몸 주위를 **가로질러** 배회한다 — 몸 아래를 지날 때 몸 뒤로
  // 사라지면 「스티커가 스티커 뒤로 간다」가 된다(2026-08-09 실기 판정).
  // 꼬리는 머리의 깊이를 따른다: 점마다 가르면 리본이 몸 위에서 끊긴다.
  for(let i=0;i<NW;i++)dep(c,p[i][1],cy,(c,a)=>{
    celRibbon(c,st.tr[i],atL(3)?12:10,"gold",.9*a);
    celSplash(c,p[i][0],p[i][1],11,7,i*3+2,"gold",a);});
  drawP(c,st);hero(c,t,cx,cy);},

// ── 궁극기 = 개안 (2026-08-11 재정초) ─────────────────────────────────────
//
// **모순 하나를 먼저 풀었다.** 이 파일 두 곳이 같은 자원을 두 번 쓰고 있었다:
//   ① `basicMani` 머리 — 발현 게이지는 **적 처치**로 차고 100 이면 **즉시 자동
//      발동**(15초 유지 · 60초 잠금)
//   ② 배치표 — 「발현 게이지가 개안(궁극기)의 충전원이 될 자리」
// 하나가 자동으로 다 써 버리면 다른 하나는 **영영 안 찬다.** 그래서 궁극기의
// 충전원을 정하는 것이 이 블록의 첫 일이고, 세 갈래를 놓고 골랐다:
//
//   (a) **별도 게이지** — 반려. HUD 에 미터가 하나 더 늘고, 충전원 후보가
//       전부 나쁘다. *피격*은 맞을수록 세지는 보상이라 이 게임의 「안 맞는
//       것이 실력」과 정반대로 서고, *시간*은 게이지가 아니라 쿨다운이라
//       그 순간 궁극기가 **주기로 도는 스킬**이 된다(= 아래 「축」이 금지하는
//       바로 그것). *보스 처치*는 판에 몇 번 없어 성장이 안 붙는다.
//   (c) **수동으로 아껴 쓴다** — 반려. **이 게임엔 버튼이 하나도 없다**
//       (조준·발사 전부 자동). 궁극기에만 버튼을 다는 것은 시안이 아니라
//       조작 설계 변경이고, 「한 손가락」이라는 전제를 깬다.
//   (b) **채택 — 궁극기는 발현의 개막이다.** 게이지가 100 이 되는 그 **한
//       사건**이 ①전역 즉발(궁극기)과 ②15초 발현창(몸 상태)을 **동시에** 낳는다.
//       자원을 나누는 것이 아니라 **한 번 쓰는 것이 두 얼굴을 갖는 것**이라
//       두 문서가 둘 다 참이 되고, 새 게이지도 새 버튼도 안 생긴다.
//       측정치(15/60 → 가동률 14~18%)도 한 글자도 안 건드린다.
//
// **축 — 다른 분류와 어디서 갈리나.**
//   물리 10 · 마법 7 · 방어 · 저주 · 회복은 전부 (ⅰ)카드로 골라 슬롯에 꽂고
//   (ⅱ)주기로 돌며 (ⅲ)**반경**을 갖는다. 궁극기는 셋 다 아니다: 고를 수 없고,
//   주기가 없고(판에 두세 번), **거리를 안 본다.** 이 파일에서 화면 전체를
//   칠하는 것은 개안뿐이고 — 그것이 축이다. 그리고 터진 뒤 **내 몸이 15초
//   동안 다른 것**이 된다. 나머지 다섯은 무언가를 **내보내고**, 궁극기만
//   **나를 바꾼다.** 「센 스킬」과 갈리는 자리가 정확히 여기다.
//
// **몇 종인가 — 하나.** 15/60 이라 가동률이 14~18%, 한 판에 두세 번 뜬다.
//   다섯 종을 두면 한 종을 판당 0.5회 보고, 그건 설계가 아니라 제비뽑기다.
//   게다가 궁극기는 **3택 카드에 안 나온다**(고르는 것이 아니라 몸에 붙어
//   있다) — 플레이어가 종을 고를 손잡이 자체가 없어서, 종이 여럿이면
//   「다른 이유로 고른 속성」이 궁극기를 대신 정하게 된다. 변주는 이미
//   **발현창 안**에 열여덟 벌 있다(MANIDESC) — 다양성은 창이 맡고 개막은
//   늘 같아야 「그 사건」으로 읽힌다.
//
// **어느 층에 붙나 — 발현(몸)이다.** 각성은 무기의 말이고(L5 실루엣에 갈퀴),
//   궁극기는 슬롯이 없어 실루엣을 세울 무기가 없다. 그래서 L5 에 **갈퀴를
//   세우지 않는다** — 세우는 순간 두 층이 같은 그림을 쓰게 된다.
//
// **개안은 살린다(갈아엎지 않는다).** 실명·전역 밝힘 둘 다 축과 정확히 맞는다:
//   눈을 뜨는 것이 궁극기이고 그 대가로 남이 눈을 잃는다 — 실명은 이미 확정
//   어휘(PVNAME.blind)라 새 상태를 만들 필요도 없다. 대신 **격을 올린다**:
//   예전 개안은 `saw(t,2.0~2.6)` 로 **주기로 도는 스킬**이었고 그 자체가 위
//   축과 모순이었다. 이제 눈은 이펙트가 아니라 **게이지 그 자체**다 —
//   그려져 들어오는 동안이 충전, 다 그려지면 개안, 떠 있는 동안이 발현창,
//   감기면 잠금. 그림 하나가 자원의 일생을 전부 말한다.
flare(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // **칸 크기에 비례.** 정체가 「화면을 덮는다」라 절대값으로 짜면 168px
  // 성장표 칸에서 고리가 한 프레임에 칸을 가로지르고, 420px 칸에서는 가운데만
  // 깜빡인다. 반너비 93~210px 를 다 견뎌야 한다 — 기본 공격과 같은 자를 쓴다.
  const SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[58,-48,11],[-56,-50,10],[4,68,9],[-74,16,10]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  // ── 스케줄 하나 ───────────────────────────────────────────────────────
  // ⚠️ **그려지는 값을 전부 u 하나에서 파생시킨다.** 위상마다 따로 굴린 값을
  // 섞으면 주기 끝과 처음이 안 맞아 이음매에서 「툭」이 난다. 아래 여섯은
  // 전부 `상승 × (1−하강)` 꼴이라 **u=1 에서 0 으로 닫히고 u=0 과 같은
  // 그림**이 된다 — 그것이 이 함수의 검산 기준이다.
  //
  // 실제 규칙은 15초 창 · 60초 잠금이지만 **이 칸은 잠금을 줄여** 그린다:
  // 비율대로 두면 칸의 4/5 가 「아무 일도 없음」이라 그림이 아무것도 안
  // 가르쳐 준다. 리듬 그대로가 필요한 자리는 옆 칸(발현 게이지)이 맡는다.
  const P=4.6,u=saw(t,P);
  const ramp=(a0,b0)=>Math.max(0,Math.min(1,(u-a0)/(b0-a0)));
  const gauge=ramp(0,.30)*(1-ramp(.80,.90));    // 윤곽 = 충전량(처치로 찬다)
  const open =ramp(.30,.38)*(1-ramp(.80,.88));  // 뜬 정도 = 발현창이 열린 동안
  const cinch=ramp(.32,.38)*(1-ramp(.38,.44));  // 동공이 조였다 놓인다
  const fire =(1-ramp(.38,.48))*ramp(.36,.38);  // ★ 전역 즉발
  // L4 — 한 박자 뒤 한 번 더. **여운을 길게 끈다**(.48→.70): 두 번째가 첫
  // 번째만큼 짧으면 성장표에서 L3 와 겹쳐 보이는 시간이 88% 라 레벨이 안 갈린다.
  const fire2=atL(4)?(1-ramp(.50,.70))*ramp(.48,.50):0;
  const blind=(1-ramp(.60,.84))*ramp(.36,.38);  // 실명 — 확정 어휘 그대로
  const after=atL(5)?ramp(.38,.46)*(1-ramp(.74,.84)):0;   // L5 — 창 내내 밝다
  // 레벨은 **눈의 개수**로 자란다. 크기로 두면 칸마다 자가 달라 성장표 다섯
  // 칸을 나란히 놓아도 안 갈리는데, 개수는 어디서 봐도 갈린다.
  const EYES=[1,2,3,3,3][LV-1], RINGS=atL(3)?4:3;
  // ★ **거리를 안 본다.** 다른 스킬은 전부 hypot 로 반경을 재는데 여기만
  // 조건이 없다 — 축이 코드에도 그대로 있어야 나중에 반경이 슬쩍 안 생긴다.
  if(u>=.38&&(st.pu||0)<.38){
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
      hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,74*SC);}
    emit(st,cx,cy,26,{k:"gold",sp:360*SC,r:3.4*SC,life:.66,spikeP:.7});}
  st.pu=u;stepP(st,dt);
  drawFoes(c,t,cx,cy,st.F);
  // 실명 — **궁극기가 새 상태를 만들 필요는 없다.** 눈을 뜨는 것이 궁극기이니
  // 남이 눈을 잃는 것이 그 대가고, 그 상태는 이미 표에 있다.
  if(blind>.02)for(const f of st.F)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"blind",blind,t,"gold",SC,1);
  // **눈은 캐릭터를 둘러싼다.** 가운데에 큰 눈을 두었더니 몸에 가려 안 보였다
  // (2026-08-09 실기 판정) — 같은 크기로 고리 위에 놓고 천천히 돌린다.
  // 아래쪽 눈은 몸 앞이므로 깊이를 태운다.
  // ⚠️ 셋일 때 **눈끼리 겹쳤다**(2026-08-11 렌더 판정). 고리를 y 로 .78 눌러
  // 놓아서 위·아래 눈이 세로로 붙는데, 눈 너비가 고리 반지름의 2/3 나 됐다.
  // 고리를 키우고 눈을 줄여 사이를 벌린다 — 하나뿐인 L1 은 반대로 키워 준다
  // (한 칸에 눈 하나만 뜨면 작아 보여 「약해졌다」가 아니라 「덜 그렸다」로 읽힌다).
  const ER=W*.255,ES=W*.138*(EYES===1?1.30:1);
  for(let i=0;i<EYES;i++){const a=i/EYES*TAU-Math.PI/2+t*.22;
    const ex=cx+Math.cos(a)*ER,ey=cy+Math.sin(a)*ER*.78;
    dep(c,ey,cy,(c,dz)=>ultEye(c,t,ex,ey,ES,gauge,open,dz,SC,cinch));}
  if(after>0){c.fillStyle=`rgba(255,240,210,${.09*after})`;c.fillRect(0,0,W,H);}
  // 전역 섬광 — **이 파일에서 화면 전체를 칠하는 것은 개안뿐이다.**
  // 한 번 어두워졌다 하얘지는 것이 「실명」의 읽기다: 눈이 먼저 닫히고 그다음
  // 아무것도 안 보인다. 고리 반경은 칸 대각선에 비례하므로 L3 만 모서리를 넘는다.
  const blast=(ff,mul)=>{
    if(ff<=.004)return;
    const REACH=Math.hypot(W,H)*(atL(3)?.60:.44);   // .5 가 정확히 모서리다
    c.fillStyle=`rgba(20,10,30,${.34*ff*mul})`;c.fillRect(0,0,W,H);
    for(let r=0;r<RINGS;r++)
      celHoop(c,cx,cy,REACH*(1-ff)*(1-r*.13)+10*SC,1,0,
        (atL(3)?19:15)*SC*ff+2*SC,"gold",ff*mul*(1-r*.22));
    celSplash(c,cx,cy,54*SC*ff,12,3,"gold",ff*mul);
    c.fillStyle=`rgba(255,255,255,${.58*ff*mul})`;c.fillRect(0,0,W,H);};
  blast(fire,1);blast(fire2,.72);
  drawP(c,st);hero(c,t,cx,cy,"gold",SC*(1+fire*.8));},

// 발현 게이지 — **충전원 결정을 그린 칸.**
// 개안 칸은 잠금을 줄여 그리지만 **이 칸은 실제 비율을 지킨다**: 충전 8.2초
// (스테이지1 초당 12.3마리 × 100마리) · 창 15초 · 잠금 60초 를 그대로 접는다.
// 「판의 얼마가 발현인가」는 숫자표가 아니라 이 리듬으로만 읽힌다 — 밝은
// 구간이 짧고 어두운 구간이 길어야 「특별한 상태」로 보이고, 그게 15/60 을
// 고른 이유(60/30 은 가동률 61%였다)를 눈으로 확인하는 유일한 방법이다.
ultGauge(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  const SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[62,-40,10],[-58,-36,10],[52,44,9],[-50,48,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const CH=8.2,WIN=15,LOCK=60,TOT=CH+WIN+LOCK;      // 83.2초
  const P=8.32,u=saw(t,P);                          // ×10 배속으로 한 주기에 담는다
  const ramp=(a0,b0)=>Math.max(0,Math.min(1,(u-a0)/(b0-a0)));
  const e0=CH/TOT,e1=(CH+WIN)/TOT;                  // .0986 · .2788
  const chg=ramp(0,e0)*(1-ramp(e0,e0+.002));        // 0→1 로 찼다가 쓰이며 비워진다
  const inW=ramp(e0,e0+.002)*(1-ramp(e1,e1+.002));  // 창이 열려 있는가
  const left=1-ramp(e0,e1);                         // 창의 남은 시간
  const fire=(1-ramp(e0,e0+.05))*ramp(e0-.002,e0);
  // 잠금 — **끝에서 0 으로 닫는다.** 안 닫으면 u=1 과 u=0 의 그림이 달라
  // 이음매에서 화면이 한 번 번쩍인다.
  const lock=ramp(e1,e1+.02)*(1-ramp(.985,1));
  // 처치가 게이지를 민다 — 12번에 나눠 차오르므로 「단위로 찬다」가 보인다.
  const tick=Math.floor(chg*12);
  if(chg>0&&chg<1&&tick!==st.tk){st.tk=tick;
    hitFoe(st,st.F[tick%st.F.length],cx,cy,0,0,12*SC);}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  if(inW>.01)for(const f of st.F)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"blind",inW*left,t,"gold",SC,1);
  const RG=Math.min(W,H)*.34;
  celHoop(c,cx,cy,RG,1,0,4.5*SC,"gold",.14);                    // 빈 트랙
  // 게이지 채움 — **celStroke.** 리본은 양 끝을 0 으로 좁히는 종형이라
  // 「어디까지 찼나」의 끝이 흐려진다. 눈금은 끝이 안 좁아져야 눈금이다.
  const arcFill=(f,w,al)=>{if(f<=.004||al<=.004)return;
    celStroke(c,arcPts(cx,cy,RG,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,f),
      Math.max(2,(f*46)|0)),w,"gold",al);};
  arcFill(chg,6.5*SC,.95);
  if(chg>0&&chg<1){const stp=(chg*12)%1,a=-Math.PI/2+TAU*chg;   // 방금 찬 한 칸
    celSplash(c,cx+Math.cos(a)*RG,cy+Math.sin(a)*RG,(5+4*(1-stp))*SC,7,3,
      "gold",(1-stp)*.9);}
  if(inW>.01){arcFill(left,10.5*SC,.9*inW);                     // 창 — 빠져나간다
    c.fillStyle=`rgba(255,244,224,${.08*inW*left})`;c.fillRect(0,0,W,H);}
  // 100 → **스스로** 터진다. 버튼이 없다는 말을 그림으로 하는 자리라
  // 예고도 조준도 없이 그냥 간다.
  if(fire>0){celHoop(c,cx,cy,RG*(1+2.4*(1-fire))+6*SC,1,0,14*SC*fire+2*SC,"gold",fire);
    c.fillStyle=`rgba(255,255,255,${.50*fire})`;c.fillRect(0,0,W,H);}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC*(1+inW*.28));
  // 잠금 — 길고 어둡다. 창과 잠금의 **길이 차이**가 이 칸의 주제다.
  if(lock>.01){c.fillStyle=`rgba(10,10,14,${.34*lock})`;c.fillRect(0,0,W,H);}},

// 전역 즉발 — **축 결정을 그린 칸.**
// 다른 분류 다섯은 전부 **반경**을 갖는다. 그 원을 옆에 놓고, 궁극기가 그
// 원 밖 모서리까지 **같은 프레임에** 닿는 것을 보인다 — 주장은 「세다」가
// 아니라 「거리를 안 본다」이고, 세기는 원 안에서도 낼 수 있지만 거리 무시는
// 못 낸다. 안쪽 셋은 스킬 파문에 맞고 바깥 넷은 안 맞는 것이 그 대조다.
ultGlobal(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  const SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[38,-26,10],[-34,-30,10],[6,42,9],
    [96,-88,9],[-96,-88,9],[96,88,9],[-96,88,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const RR=Math.min(W,H)*.245;              // 스킬의 반경(성역 정도)
  const P=3.8,u=saw(t,P);
  const ramp=(a0,b0)=>Math.max(0,Math.min(1,(u-a0)/(b0-a0)));
  const pw=[0,1,2].map(i=>(1-ramp(.10+i*.18,.26+i*.18))*ramp(.08+i*.18,.10+i*.18));
  const fire=(1-ramp(.72,.88))*ramp(.70,.72);
  for(let i=0;i<3;i++){const s=.08+i*.18;
    if(u>=s&&(st.pu||0)<s)for(let k=0;k<3;k++)hitFoe(st,st.F[k],cx,cy,0,0,18*SC);}
  if(u>=.70&&(st.pu||0)<.70)for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
    hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,58*SC);}
  st.pu=u;stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 스킬의 반경 — **파문이 없을 때도 남긴다.** 있다는 것 자체가 논거라
  // 터질 때만 보이면 비교 대상이 사라진다.
  celHoop(c,cx,cy,RR,1,0,2.4*SC,"gold",.20);
  for(const f of pw)if(f>.004)
    celHoop(c,cx,cy,RR*(1-f)+6*SC,1,0,9*SC*f+1.5*SC,"gold",f*.85);
  if(fire>.004){
    // 대각선에 비례 — .5 가 정확히 모서리이므로 .62 는 **칸 밖**이다.
    const REACH=Math.hypot(W,H)*.62;
    for(let r=0;r<3;r++)
      celHoop(c,cx,cy,REACH*(1-fire)*(1-r*.14)+10*SC,1,0,16*SC*fire+2*SC,
        "gold",fire*(1-r*.24));
    celSplash(c,cx,cy,50*SC*fire,12,3,"gold",fire);
    c.fillStyle=`rgba(255,255,255,${.50*fire})`;c.fillRect(0,0,W,H);}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// 발현창 — **층 결정을 그린 칸.** 궁극기는 발현(몸)에 붙지 각성(무기)에 안 붙는다.
// 창이 열리면 **몸에** 둘레가 서고 **무기는 한 톨도 안 변한다** — 궤도도
// 굵기도 속도도 창 안팎이 같다. 그 무변화가 논거라 무기를 안 그리면 주장이
// 사라진다(변하는 것 하나만 그리면 「몸이 변했다」가 아니라 그냥 「밝아졌다」다).
ultWindow(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  const SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[64,-42,10],[-60,-38,10],[10,64,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const P=5.2,u=saw(t,P);
  const ramp=(a0,b0)=>Math.max(0,Math.min(1,(u-a0)/(b0-a0)));
  const gauge=ramp(0,.28)*(1-ramp(.82,.90));
  const open =ramp(.28,.34)*(1-ramp(.80,.88));
  const cinch=ramp(.30,.34)*(1-ramp(.34,.40));
  const fire =(1-ramp(.34,.44))*ramp(.32,.34);
  const blind=(1-ramp(.64,.86))*ramp(.32,.34);
  const left =1-ramp(.34,.82);                   // 창의 남은 시간 — open 으로만 그린다
  if(u>=.34&&(st.pu||0)<.34)for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
    hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,60*SC);}
  st.pu=u;stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  if(blind>.02)for(const f of st.F)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"blind",blind,t,"gold",SC,1);
  // 무기 — **상수다.** 창과 무관한 것이 보여야 「몸만 바뀐다」가 성립하므로
  // 무기 고유색(공전)으로 못 박는다: `TK` 는 "gold" 만 바꿔치기하니 다른 키를
  // 주면 궁극기 팔레트에 안 물든다.
  const ORB=Math.min(W,H)*.30;
  for(let i=0;i<2;i++){const a=t*1.15+i*Math.PI,Q=[];
    for(let j=0;j<=7;j++){const q=a-j*.17;
      Q.push([cx+Math.cos(q)*ORB,cy+Math.sin(q)*ORB*.9]);}
    celRibbon(c,Q,7*SC,"wOrbit",.85);}
  // 몸 — 창이 열린 동안만 **코어 둘레에 모티프**가 선다(발현의 확정 문법).
  if(open>.02){
    celHoop(c,cx,cy,30*SC,1,0,3.2*SC,"gold",.55*open);
    for(let i=0;i<3;i++){const a=i/3*TAU+t*.9;
      celSplash(c,cx+Math.cos(a)*30*SC,cy+Math.sin(a)*30*SC,6.5*SC,6,i*3+1,"gold",open);}
    // 남은 시간 — 15초가 **빠져나가는 것**이 보여야 창이 창으로 읽힌다.
    celStroke(c,arcPts(cx,cy,44*SC,-Math.PI/2,-Math.PI/2+TAU*Math.max(.02,left),
      Math.max(2,(left*40)|0)),3.6*SC,"gold",.75*open);}
  // 눈 하나 — 개안 칸과 **같은 함수**다. 두 벌이면 반드시 갈라진다.
  ultEye(c,t,cx,cy-Math.min(W,H)*.30,W*.15,gauge,open,1,SC,cinch);
  if(fire>.004){c.fillStyle=`rgba(255,255,255,${.46*fire})`;c.fillRect(0,0,W,H);}
  if(open>.02){c.fillStyle=`rgba(255,244,224,${.06*open*left})`;c.fillRect(0,0,W,H);}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC*(1+open*.22));},

ignite(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // **구다.** 넓게 퍼뜨렸더니 다른 이펙트(전부 구)와 어울리지 않았다
  // (2026-08-08). 폭발은 사방으로 같은 거리를 가고, 불은 그 위로만 오른다.
  st.F=st.F||mkFoes([[16,-70,11],[-26,-76,10],[50,-52,9]]);stepFoes(st.F,dt);
  const bx=cx,by=cy-64,u=saw(t,1.3);
  // 레벨 상수는 **쓰기 전에** 선언한다 — 아래 블록이 참조하므로 순서가 곧 버그다.
  const BURN=[2.8,4.2,4.2,4.2,4.2][LV-1],RAD=atL(4)?76:52,STACK=atL(5)?3:1;
  if(u<st.pu){for(const f of st.F)if(Math.hypot(cx+f.ox-bx,cy+f.oy-by)<RAD){
    hitFoe(st,f,cx,cy,0,-1,20,"ember");f.burn=BURN;}
    if(atL(3))for(const f of st.F)if(f.burn>0)for(const g2 of st.F)
      if(g2!==f&&Math.hypot(f.ox-g2.ox,f.oy-g2.oy)<64)g2.burn=Math.max(g2.burn,BURN*.6);
    emit(st,bx,by,14,{k:"ember",sp:170,r:3,life:.5,spikeP:.2});}
  st.pu=u;
  for(const f of st.F)if(f.burn>0)f.burn-=dt;
  if(R()<dt*20)emit(st,bx+(R()-.5)*20,by+6,1,{k:R()<.4?"gold":"ember",sp:10,r:2.6,life:.7,g:-140,spikeP:.1});
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  const g=ease(Math.min(1,u/.34)),f=Math.max(0,1-u/.34);
  if(f>0){const rr=(18+g*26)*(atL(4)?1.35:1);
    celPuff(c,bx,by,rr,10,13,"ember",f);            // 바깥 구
    celPuff(c,bx,by-rr*.12,rr*.5,8,29,"gold",f);    // 안쪽 밝은 구
    shards(c,bx,by+rr*.9,rr*.8,6,19,f*.5,"ember");}
  fireBody(c,t,bx,by+6,.52,.95,2);                  // 잔불 — 위로만
  for(const f2 of st.F)if(f2.burn>0)for(let z=0;z<STACK;z++)
    fireBody(c,t+f2.ox*.05+z*.7,cx+f2.ox+(z-(STACK-1)/2)*7,cy+f2.oy-f2.r*.2,.34,.9,2);
  drawP(c,st);hero(c,t,cx,cy);},

// ═══════════════════════════════════════════════════════════════════════════
// 방어 5 (+ 결계 = 6) — 축은 **동사**다
// ═══════════════════════════════════════════════════════════════════════════
//
// `lib/data/armor.dart` 가 방어구 확장 7종을 고를 때 쓴 규율을 그대로 잇는다:
// 「같은 동사가 두 벌 있으면 슬롯 선택이 다시 죽는다」. 방어구 10종을 읽고
// **동사가 겹치지 않는 다섯**만 스킬로 올렸다.
//
//   결계 ward   막는다   — 셸이 앞에 서서 닿기 전에 끊는다 (기존 FX)
//   사슬 chain  지운다   — 맞되 작은 것은 0 이 된다
//   경면 mirror 되돌린다 — 날아온 것을 쏜 놈에게 돌려준다
//   거암 boulder 버틴다  — 큰 것만 깎고 죽을 것을 한 번 견딘다
//   응보 karma  갚는다   — 받은 것을 모았다 한 번에
//   질풍 gale   안 맞는다 — 위치로. 주사위가 아니다
//
// 뺀 넷과 근거는 GUARD 표 위 주석에.

chain(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // **맞되 0 이 되는 것**이라, 화면에 보여야 하는 것은 방벽이 아니라
  // 「닿는 순간」이다 — 그래서 적을 몸에 **붙여 놓고** 계속 부딪히게 한다.
  // 결계가 적을 셸 밖에 세워 둔 무대와 정확히 반대이고, 그 반대가 곧 두
  // 스킬이 다른 동사라는 증거다(막는 것 ↔ 맞고도 안 아픈 것).
  st.F=st.F||mkFoesZ([[96,-40,11],[-90,44,10],[26,-100,9],[-44,-88,10],[80,58,10]],SC);
  st.lk=st.lk||new Array(11).fill(0);
  st.ch=st.ch||0;st.bu=Math.max(0,(st.bu||0)-dt);
  // ── 레벨 설계 ────────────────────────────────────────────────────────
  // armor.dart 는 L2·L4 를 **둘 다** 「상쇄 +40%」로 두었다. 굵기를 두 번
  // 키우면 성장표에서 L2 와 L4 가 같은 그림이 되어 표가 거짓말을 한다 —
  // 그래서 두 번째 +40% 는 **겹**으로 그린다. 마디가 두 줄이면 「더 많이
  // 상쇄한다」가 수치가 아니라 실루엣으로 읽힌다.
  const LW=[2.4,3.4,3.4,3.4,3.4][LV-1]*SC, RINGS=atL(4)?2:1,
        THORN=atL(3), BURST=atL(5), RR=54*SC, NL=11, CHMAX=8;
  const spin=t*.5;
  for(const f of st.F){
    f.cd=Math.max(0,(f.cd||0)-dt);
    const d=Math.hypot(f.ox,f.oy)||1;
    if(d>RR+f.r){f.ox-=f.ox/d*36*SC*dt;f.oy-=f.oy/d*36*SC*dt;}
    else if(f.cd<=0){f.cd=.62;
      const a=Math.atan2(f.oy,f.ox);
      // **맞은 그 마디가 달아오른다** — 결계의 셀 규칙과 같다. 전체가
      // 번쩍이면 「어디서 막았나」가 사라져 사슬이 그냥 배경 장식이 된다.
      const i0=((Math.round((a-spin)/TAU*NL)%NL)+NL)%NL;
      st.lk[i0]=1;
      st.lk[(i0+1)%NL]=Math.max(st.lk[(i0+1)%NL],.5);
      st.lk[(i0+NL-1)%NL]=Math.max(st.lk[(i0+NL-1)%NL],.5);
      st.ch=Math.min(CHMAX,st.ch+1);
      // 가시(L3)가 없으면 **적은 피해를 안 받는다.** 사슬은 지우는 것이지
      // 되갚는 것이 아니다 — 되갚는 것은 응보의 동사다. 밀려나기만 한다.
      if(THORN)hitFoe(st,f,cx,cy,Math.cos(a),Math.sin(a),22*SC,"gChain");
      else{f.kx+=Math.cos(a)*16*SC;f.ky+=Math.sin(a)*16*SC;
        emit(st,cx+Math.cos(a)*RR,cy+Math.sin(a)*RR*.94,5,
          {k:"gChain",sp:110*SC,r:2.4*SC,life:.3,spikeP:.7});}}}
  stepFoes(st.F,dt);
  for(let i=0;i<NL;i++)st.lk[i]=Math.max(0,st.lk[i]-dt*2.4);
  // L5 과부하 — **상쇄가 쌓여야 터진다.** 쿨다운으로 두면 맞든 안 맞든 도는
  // 폭탄이라, 방어구가 아니라 무기가 된다(kOverloadChargeMax 의 뜻이 그것).
  if(BURST&&st.ch>=CHMAX){st.ch=0;st.bu=.42;
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
      hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,64*SC,"gChain");}}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  const link=(a,rr,fl,lw)=>{
    const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.94;
    dep(c,y,cy,(c,dz)=>{
      celHoop(c,x,y,Math.max(1,7.4*SC*(1+fl*.3)),.52,a+Math.PI/2,
        Math.max(.6,lw*(1+fl*.6)),"gold",(.55+.45*fl)*dz);
      if(THORN)celSpike(c,x,y,a,12*SC*(1+fl*.5),3.2*SC,"gold",(.5+.5*fl)*dz);});};
  for(let r=0;r<RINGS;r++){const rr=RR*(r?.66:1),sp=r?-spin*1.3:spin;
    for(let i=0;i<NL;i++)link(i/NL*TAU+sp,rr,r?st.lk[i]*.4:st.lk[i],LW*(r?.8:1));}
  if(BURST)celGauge(c,cx,cy,RR*1.24,st.ch/CHMAX,3*SC,"gold",.5);
  if(st.bu>0){const f=st.bu/.42;
    celHoop(c,cx,cy,Math.max(1,RR*(1.1+(1-f)*1.5)),1,0,9*SC*f+1.5,"gold",f);
    celSplash(c,cx,cy,Math.max(1,26*SC*f),9,7,"gold",f*.8);}
  drawP(c,st);hero(c,t,cx,cy);},

mirror(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 되돌리려면 **되돌릴 것**이 있어야 한다 — 적이 탄을 쏘는 무대다.
  // 그리고 **정면만** 막는 것이 이 방어구의 계약이라(kMirrorArcCos:
  // L1 ±60° → L2 ±90°, 등 뒤는 맞는다), 뒤에서 온 탄이 몸에 박히는 것까지
  // 그려야 그림이 규칙에 대해 정직해진다.
  st.F=st.F||mkFoesZ([[88,-66,10],[-96,-34,10],[14,100,9],[-74,70,10]],SC);
  stepFoes(st.F,dt);
  st.b=st.b||[];st.acc=(st.acc||0)+dt;st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);
  const HALF=[1.05,1.57,1.57,1.57,1.57][LV-1],HOME=atL(3),BNC=atL(4),PR=46*SC;
  // 전면 반사(L5) — sim 은 12s 주기 3s 창(가동률 25%)인데 타일에서 12초는
  // 한 번도 못 보고 지나간다. **가동률을 지키고 주기만 압축**한다(6s / 1.5s).
  const OD=atL(5)&&saw(t,6)<.25;
  if(st.acc>.52){st.acc=0;
    const f=st.F[(st.i=(st.i||0)+1)%st.F.length];
    const x=cx+f.ox,y=cy+f.oy,a=Math.atan2(cy-y,cx-x);
    st.b.push({x,y,a,vx:Math.cos(a)*150*SC,vy:Math.sin(a)*150*SC,ref:0,bnc:0,l:0,tg:null});}
  for(let i=st.b.length-1;i>=0;i--){const b=st.b[i];b.l+=dt;
    if(b.ref&&HOME&&b.tg){const a2=Math.atan2(cy+b.tg.oy-b.y,cx+b.tg.ox-b.x),
      sp=Math.hypot(b.vx,b.vy);
      // 유도는 **각도를 꺾는 게 아니라 표적 쪽으로 가속하는 것**이다
      // (유도탄에서 확정된 규율 — 각도를 직접 돌리면 스티커가 날아다닌다).
      b.vx+=(Math.cos(a2)*sp-b.vx)*Math.min(1,dt*4.2);
      b.vy+=(Math.sin(a2)*sp-b.vy)*Math.min(1,dt*4.2);}
    b.x+=b.vx*dt;b.y+=b.vy*dt;b.a=Math.atan2(b.vy,b.vx);
    if(b.l>3.2){st.b.splice(i,1);continue;}
    if(!b.ref){
      const dx=b.x-cx,dy=b.y-cy,d=Math.hypot(dx,dy)||1;
      if(d<PR){
        // 도래 방향과 정면(위)의 내적 — sim 의 원호 검사 그대로.
        if(OD||(-dy/d)>=Math.cos(HALF)){b.ref=1;b.l=0;
          let tx=null,td=1e9;
          for(const f of st.F){const q=Math.hypot(cx+f.ox-b.x,cy+f.oy-b.y);
            if(q<td){td=q;tx=f;}}
          const a2=tx?Math.atan2(cy+tx.oy-b.y,cx+tx.ox-b.x):Math.atan2(dy,dx);
          b.vx=Math.cos(a2)*300*SC;b.vy=Math.sin(a2)*300*SC;b.tg=tx;
          emit(st,b.x,b.y,5,{k:"gMirror",sp:120*SC,r:2.2*SC,life:.26,spikeP:.8});}
        else if(d<17*SC){st.b.splice(i,1);st.hurt=1;continue;}}}
    else{let done=false;
      for(const f of st.F){
        if(Math.hypot(cx+f.ox+f.kx-b.x,cy+f.oy+f.ky-b.y)>f.r+5*SC)continue;
        const d2=Math.hypot(b.vx,b.vy)||1;
        hitFoe(st,f,cx,cy,b.vx/d2,b.vy/d2,26*SC,"gMirror");
        if(BNC&&!b.bnc){b.bnc=1;
          let tx=null,td=1e9;
          for(const g of st.F){if(g===f)continue;
            const q=Math.hypot(cx+g.ox-b.x,cy+g.oy-b.y);if(q<td){td=q;tx=g;}}
          if(tx){const a3=Math.atan2(cy+tx.oy-b.y,cx+tx.ox-b.x);
            b.vx=Math.cos(a3)*300*SC;b.vy=Math.sin(a3)*300*SC;b.tg=tx;}
          else done=true;}
        else done=true;
        break;}
      if(done){st.b.splice(i,1);continue;}}}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 거울판 — **정면 원호.** 판 뒤가 비어 있는 것이 곧 「등 뒤는 맞는다」다.
  const A0=OD?Math.PI:HALF;
  celHoop(c,cx,cy,PR,1,Math.PI/2,7.5*SC,"gold",OD?1:.85,Math.max(0,Math.PI-A0));
  for(let i=-2;i<=2;i++){const a=-Math.PI/2+i*A0*.34;   // 거울 빗금
    celStroke(c,[[cx+Math.cos(a)*PR*.84,cy+Math.sin(a)*PR*.84],
      [cx+Math.cos(a+.26)*PR*1.08,cy+Math.sin(a+.26)*PR*1.08]],2.2*SC,"gold",.75);}
  // 되돌아가는 탄만 물든다 — 날아오는 것은 어둠이다. **색이 곧 소유권**이다.
  for(const b of st.b)celRound(c,b.x,b.y,b.a,15*SC,4.2*SC,b.ref?"gold":"shade",
    1,b.ref?1:.35);
  if(st.hurt>0)hurtFlash(c,cx,cy,Math.max(1,19*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,cx,cy);},

boulder(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 「**큰 것만** 깎는다」는 비교가 있어야만 보이는 성질이다(kBigHitGate).
  // 그래서 한 무대에 둘을 올린다: 잡몹 셋이 계속 갉고 거구 하나가 주기적으로
  // 달려든다 — 갉는 것은 **그대로 아프고**(붉은 튐) 달려드는 것만 판이
  // 받아 낸다(금이 간다). 체인갑옷과 정확히 반대 방향이라는 armor.dart 의
  // 주석이 이 두 타일을 나란히 놓으면 눈으로 확인된다.
  //
  // ⚠️ 거구의 대기 위치는 **성장표 칸(168px) 안에** 있어야 한다 — -126 으로
  // 뒀더니 칸 밖(반높이 84)이라 「거구가 없는 타일」이 됐다.
  st.F=st.F||mkFoesZ([[70,-58,9],[-64,-52,9],[76,50,9],[0,-100,19]],SC);
  const big=st.F[3];
  const TH=[5.2,7.3,7.3,7.3,7.3][LV-1]*SC,UNDY=atL(3),VET=atL(4),BRACE=atL(5),
        NP=5,RRp=44*SC,UCD=5.0;
  // 부동(L5) — 「반 박자 멈춰 서면 경감 2배」. 타일에서는 **서는 시간이
  // 보여야** 하므로 걷기 / 버티기를 반복하고, 버티는 동안 판이 맞물려 닫힌다.
  const braced=BRACE&&saw(t,4.6)>.68;
  const GAP=braced?.03:[.46,.42,.42,.34,.28][LV-1];
  // 거구의 돌진 — 웅크림 → 달려듦 → 복귀. 보스 규칙(예고 → 실행) 그대로.
  const cu=saw(t,3.1);
  big.oy=(-100+(cu<.5?0:cu<.66?(cu-.5)/.16*62:(1-(cu-.66)/.34)*62))*SC;
  st.cr=Math.max(0,(st.cr||0)-dt*1.5);
  st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);
  st.fl=Math.max(0,(st.fl||0)-dt*2.0);
  if(st.und===undefined)st.und=1;
  st.rc=Math.max(0,(st.rc||0)-dt);
  if(VET&&!st.und&&st.rc<=0)st.und=1;             // 관록 — 불굴이 되찬다
  if(cu>=.62&&(st.pu||0)<.62){st.cr=1;            // 거구가 판에 닿는 순간
    if(UNDY&&st.und){st.und=0;st.rc=UCD;st.fl=1;}}// 불굴 — 한 번은 흰빛으로 견딘다
  st.pu=cu;
  for(const f of st.F){if(f===big)continue;       // 잡몹은 **그대로 아프다**
    f.gd=Math.max(0,(f.gd||0)-dt);
    const d=Math.hypot(f.ox,f.oy)||1;
    if(d>34*SC+f.r){f.ox-=f.ox/d*24*SC*dt;f.oy-=f.oy/d*24*SC*dt;}
    else if(f.gd<=0){f.gd=.8;st.hurt=1;}}
  stepFoes(st.F,dt);stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 판 다섯 — **개수는 성장축이 아니다**(개수는 결계가 이미 쓰는 축이다).
  // 여기서 자라는 것은 **두께**와 **닫힘**이고, 닫히는 순간이 만렙 그림이다.
  for(let i=0;i<NP;i++){
    const a0=i/NP*TAU+GAP/2+t*.12,a1=(i+1)/NP*TAU-GAP/2+t*.12,m=(a0+a1)/2;
    dep(c,cy+Math.sin(m)*RRp,cy,(c,dz)=>{
      celRibbonEven(c,arcPts(cx,cy,RRp,a0,a1,5),TH*(braced?1.3:1),"gold",
        (braced?1:.86)*dz,false);
      if(st.cr>.02){const x=cx+Math.cos(m)*RRp,y=cy+Math.sin(m)*RRp;
        celStroke(c,[[x-6*SC,y-5*SC],[x+2*SC,y],[x-3*SC,y+6*SC]],1.6*SC,"gold",st.cr*.9*dz);}});}
  if(st.fl>0)celHoop(c,cx,cy,Math.max(1,RRp*(1+(1-st.fl)*.5)),1,0,
    TH*1.4*st.fl+1,"gold",st.fl);
  if(VET&&!st.und)celGauge(c,cx,cy,RRp*1.32,1-st.rc/UCD,2.4*SC,"gold",.5);
  if(st.hurt>0)hurtFlash(c,cx,cy,Math.max(1,20*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,cx,cy);},

karma(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 갚으려면 **먼저 맞아야 한다.** 저장이 눈에 보이는 고리(celGauge)에 차고
  // 가득 차야 터진다 — 쿨다운으로 두면 맞든 안 맞든 도는 폭탄이 되어
  // 「응보」라는 이름이 거짓말이 된다(kKarmaChargeMax 가 실피해 누적인 이유).
  st.F=st.F||mkFoesZ([[84,-46,11],[-80,-38,10],[16,86,9],[-52,66,10],[70,50,10]],SC);
  const AMP=[1,1.4,1.4,1.4,1.4][LV-1],SWEEP=atL(3),WAKE=atL(4),FOCUS=atL(5),
        RAD=(46+30*AMP)*SC,CHMAX=5,
        // ⚠️ 방출 길이는 **상수 하나**여야 한다. 여기와 그리는 쪽이 갈렸더니
        // f 가 1 을 넘어 반지름이 음수가 됐다(브라우저에서만 터짐).
        BUD=.6;
  st.ch=st.ch||0;st.bu=Math.max(0,(st.bu||0)-dt);
  st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);st.gem=st.gem||[];
  for(const f of st.F){
    f.cd=Math.max(0,(f.cd||0)-dt);f.slow=Math.max(0,(f.slow||0)-dt);
    const d=Math.hypot(f.ox,f.oy)||1,sp=(f.slow>0?11:28)*SC;
    if(d>30*SC+f.r){f.ox-=f.ox/d*sp*dt;f.oy-=f.oy/d*sp*dt;}
    else if(f.cd<=0){f.cd=.5;st.ch=Math.min(CHMAX,st.ch+1);st.hurt=1;}}
  if(st.ch>=CHMAX){st.ch=0;st.bu=BUD;
    let bg=st.F[0];for(const f of st.F)if(f.r>bg.r)bg=f;
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
      if(d>RAD)continue;
      hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,54*AMP*SC,"gKarma");
      if(WAKE){f.slow=1.6;f.pv=1;}}
    if(FOCUS)st.fc={f:bg,l:.42};
    // 수거(L3) — 방출이 암흑물질을 쓸어온다. 갚는 김에 줍는다는 성질이라
    // 방출과 **같은 순간**에만 생겨야 한다(따로 돌면 인력 유물과 겹친다).
    if(SWEEP)for(let i=0;i<9;i++){const a=R()*TAU,r=(.45+.55*R())*RAD;
      st.gem.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,l:0});}}
  for(let i=st.gem.length-1;i>=0;i--){const g=st.gem[i];g.l+=dt;
    const dx=cx-g.x,dy=cy-g.y,d=Math.hypot(dx,dy)||1;
    g.x+=dx/d*220*SC*dt;g.y+=dy/d*220*SC*dt;
    if(d<220*SC*dt+2||g.l>2.2)st.gem.splice(i,1);}
  if(st.fc)st.fc.l-=dt;
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.6;
  stepFoes(st.F,dt);stepP(st,dt);
  // 여파(L4)는 **감속**이다 — 상태 표식은 pvMark 가 단일 출처이므로 동상의
  // 어휘(frost)를 빌리지 않고 저주 계열이 쓰는 그림을 그대로 쓴다.
  const mk0=(L)=>{if(WAKE)pvLayer(c,cx,cy,st.F,"frost",t,TK("gold"),SC,L);};
  mk0(0);drawFoes(c,t,cx,cy,st.F);mk0(1);
  for(const g of st.gem)gemDot(c,g.x,g.y,4.6*SC);
  // 저장 고리 — **이 타일에서 유일하게 상시 도는 것**이라 눈이 여기 묶여야
  // 한다. 눈금은 **빈 칸도 그린다**: 성장표 다섯 칸은 같은 시계로 돌아 위상이
  // 잠겨 있어, 찬 것만 그리면 다섯이 동시에 비어 「아무 일도 안 일어나는
  // 타일」이 된다. 몇 대 맞아야 터지는지가 늘 보여야 한다.
  hpRing(c,cx,cy,42*SC,0,"gold");
  celGauge(c,cx,cy,42*SC,st.ch/CHMAX,7*SC,"gold",.95);
  for(let i=0;i<CHMAX;i++){const a=-Math.PI/2+i/CHMAX*TAU,on=i<Math.round(st.ch);
    celSpike(c,cx+Math.cos(a)*42*SC,cy+Math.sin(a)*42*SC,a,
      (on?13:7)*SC,(on?3.8:2.4)*SC,"gold",on?1:.3);}
  if(st.bu>0){const f=st.bu/BUD,rr=RAD*(1-f)+18*SC;
    celHoop(c,cx,cy,Math.max(1,rr),1,0,11*SC*f+2,"gold",f);
    for(let i=0;i<10;i++){const a=i/10*TAU+t;
      celSpike(c,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,a,20*SC*f,5*SC*f,"gold",f*.9);}}
  if(st.fc&&st.fc.l>0){const f=st.fc.l/.42,g=st.fc.f;   // 단죄 — 한 놈에게 몰아친다
    celBeam(c,cx+g.ox,cy+g.oy-92*SC,cx+g.ox,cy+g.oy,13*SC*f+2,"gold",f);
    celSplash(c,cx+g.ox,cy+g.oy,Math.max(1,24*SC*f),9,3,"gold",f);}
  if(st.hurt>0)hurtFlash(c,cx,cy,Math.max(1,18*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,cx,cy);},

gale(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // **이 타일만 몸이 움직인다.**
  //
  // 「안 맞는다」를 회피율(주사위)로 그리면 500마리 화면에서 한 대 빗나간
  // 것은 보이지 않고 「왜 안 죽었지」만 남는다 — 라서가 미스를 안 쓰기로 한
  // 근거이고(PASSIVE 표 위 주석), 신기루(kMirageDodge)를 스킬로 안 올린
  // 이유이기도 하다. 대신 **위치**로 그린다: 몸이 실제로 빠져나가고 무리가
  // 못 따라오는 것이 이 방어구의 전부다.
  st.F=st.F||mkFoesZ([[80,-70,10],[-88,-46,10],[30,92,9],[-56,78,10],[92,36,10]],SC);
  const SPD=[1,1,1.15,1.15,1.15][LV-1],GUST=atL(2),SLIP=atL(4),WAKE=atL(5);
  st.tr=st.tr||[];st.pz=st.pz||[];st.wk=st.wk||[];
  st.gu=Math.max(0,(st.gu||0)-dt);st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);
  st.pa=(st.pa||0)+dt;
  // 얼어붙은 웅덩이 — 적이 남기는 감속 지대. L4 미끄러짐이 걸리는 자리다.
  if(st.pa>1.4){st.pa=0;const f=st.F[(st.pi=(st.pi||0)+1)%st.F.length];
    st.pz.push({x:cx+f.ox,y:cy+f.oy,r:26*SC,l:0});}
  const px0=st.px===undefined?cx:st.px,py0=st.py===undefined?cy:st.py;
  let chilled=false;
  for(let i=st.pz.length-1;i>=0;i--){const p=st.pz[i];p.l+=dt;
    if(Math.hypot(px0-p.x,py0-p.y)<p.r){
      if(SLIP)p.l=Math.max(p.l,2.6);   // 미끄러짐 — 밟는 순간 흩어진다
      else chilled=true;}
    if(p.l>3)st.pz.splice(i,1);}
  // ⚠️ 위상은 **적분한다.** `t*속도` 로 두면 순풍이 켜지는 프레임에 위상이
  // 통째로 튀어 몸이 순간이동한다(2026-08-10 에 같은 원인으로 네 번 반려).
  const bo=SPD*(st.gu>0?1.25:1)*(chilled?.62:1);
  st.ph=(st.ph||0)+dt*.62*bo;
  const pxx=cx+Math.cos(st.ph)*W*.30, pyy=cy+Math.sin(st.ph*2)*H*.20;
  st.px=pxx;st.py=pyy;
  st.tr.push([pxx,pyy]);if(st.tr.length>20)st.tr.shift();
  if(WAKE&&st.tr.length>1&&((st.wa=(st.wa||0)+dt)>.26)){st.wa=0;
    st.wk.push({x:pxx,y:pyy,l:0});}
  for(let i=st.wk.length-1;i>=0;i--){const w=st.wk[i];w.l+=dt;if(w.l>1.6)st.wk.splice(i,1);}
  for(const f of st.F){
    f.slow=Math.max(0,(f.slow||0)-dt);f.cd=Math.max(0,(f.cd||0)-dt);
    const dx=pxx-(cx+f.ox),dy=pyy-(cy+f.oy),d=Math.hypot(dx,dy)||1;
    // 잔풍(L5) — 지나간 자리를 스치는 적이 느려진다.
    if(WAKE)for(const w of st.wk)
      if(Math.hypot(cx+f.ox-w.x,cy+f.oy-w.y)<24*SC)f.slow=.9;
    const sp=(f.slow>0?26:44)*SC;
    if(d>f.r+13*SC){f.ox+=dx/d*sp*dt;f.oy+=dy/d*sp*dt;}
    else if(f.cd<=0){f.cd=.7;st.hurt=1;if(GUST)st.gu=1.2;}}  // 순풍 — 맞으면 가속
  stepFoes(st.F,dt);stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  for(const p of st.pz){const a=Math.min(1,p.l*2)*Math.max(0,1-p.l/3);
    celHoop(c,p.x,p.y,Math.max(1,p.r),.5,0,3*SC,"frost",a*.7);}
  for(const w of st.wk){const a=Math.max(0,1-w.l/1.6);
    celHoop(c,w.x,w.y,Math.max(1,16*SC+18*SC*(1-a)),.55,w.l*3,2.4*SC,"gold",a*.55);}
  // 잔상 — **속도는 한 프레임만 보면 서 있는 것과 같다.** 남는 것이 있어야
  // 빠르다. 순풍이 켜지면 잔상이 늘어 「지금 더 빠르다」가 그림으로 나온다.
  const NA=[2,3,3,4,4][LV-1]+(st.gu>0?2:0);
  celRibbon(c,st.tr,11*SC,"gold",.8);
  for(let i=0;i<NA;i++){const q=st.tr[st.tr.length-2-i*2];if(!q)continue;
    const al=(1-i/NA)*.6;
    fillPoly(c,jagPoly(q[0],q[1],16*SC,7,3,1.35),A(toneOf("gold")[0],al));
    fillPoly(c,jagPoly(q[0],q[1],11*SC,7,3.4,1.3),A(toneOf("gold")[1],al*.9));}
  if(st.hurt>0)hurtFlash(c,pxx,pyy,Math.max(1,18*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,pxx,pyy);},

// ═══════════════════════════════════════════════════════════════════════════
// 저주 5 — 축은 **무엇을 빼앗는가**
// ═══════════════════════════════════════════════════════════════════════════
//
// **새 상태를 하나도 안 만든다.** `PASSIVE`/`PVNAME` 이 여덟(점화·동상·감전·
// 분해·중독·실명·저주·침묵)을 확정했고 표식도 [pvMark] 하나가 소유한다 —
// 저주 다섯은 그 어휘만 쓰고, 그래서 속성으로 걸린 상태와 저주로 걸린 상태가
// 화면에서 **같은 그림**이다(플레이어가 두 번 배우지 않는다).
//
//   저주 curse   방어를 — 받는 피해 증가 + 약한 도트 (PASSIVE 의 확정 정의)
//   역병 plague  시간을 — 중독 중첩, 만중첩이 터지며 곁으로 옮는다
//   속박 shackle 이동을 — 동상(둔화 → 빙결)
//   봉인 seal    공격을 — 감전(공속 저하) → 침묵(원거리 중지)
//   암막 veil    조준을 — 실명(발사각 오차 → 탄이 눈에 보이게 빗나간다)
//
// 빼앗을 것이 다섯뿐이라 다섯이다.

curse(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // **「더 아프다」는 그냥은 안 보인다.** 그래서 저주받은 놈과 안 받은 놈을
  // 같은 한 방으로 **동시에** 때린다 — 물보라 크기가 갈리는 것이 이 스킬의
  // 전부이고, 그것이 PASSIVE 표가 회피율 하락을 버리고 「받는 피해 증가」로
  // 다시 정의한 이유 그대로다.
  st.F=st.F||mkFoesZ([[-78,-54,10],[-28,-88,10],[28,-88,10],[78,-54,10],
                      [-64,46,10],[64,46,10]],SC);
  st.F.forEach((f,i)=>{if(f.idx===undefined)f.idx=i;});
  stepFoes(st.F,dt);
  const N=[1,1,2,3,6][LV-1],VUL=[1.4,2.0,2.0,2.0,2.0][LV-1],
        SPREAD=atL(3),CIRCLE=atL(5),PER=1.15,RC=76*SC;
  st.hop=(st.hop||0)+dt;
  // 전파(L3) — 저주받은 적이 죽으면 이웃에게 옮는다. 타일에서는 죽음을 못
  // 기다리므로 **각인이 이웃으로 튀는 실**로 같은 사건을 보여준다.
  if(SPREAD&&st.hop>2.1){st.hop=0;st.jm=.5;st.js=(st.js||0)+1;}
  if(st.jm)st.jm=Math.max(0,st.jm-dt);
  st.F.forEach((f,i)=>{
    f.cur=CIRCLE?1:(i<N||(SPREAD&&i===N+((st.js||0)%2))?1:0);
    f.pv=f.cur?1:0;});
  const u=saw(t,PER);
  if(u<(st.pu||0)){                       // 같은 한 방이 전부에게 들어간다
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
      hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,(f.cur?18*VUL:18)*SC,f.cur?"cCurse":"gold");}
    st.bl=.34;}
  st.pu=u;st.bl=Math.max(0,(st.bl||0)-dt);
  // 약한 도트 — 저주의 나머지 절반. **약해야 한다**: 저주가 스스로 죽이면
  // 취약이라는 축이 사라지고 그냥 도트 스킬이 된다(그건 역병의 자리).
  for(const f of st.F)if(f.cur&&R()<dt*5)
    emit(st,cx+f.ox,cy+f.oy+f.r*.5,1,{k:"cCurse",sp:14*SC,r:2.4*SC,life:.9,g:-70*SC,spikeP:.1});
  stepP(st,dt);
  if(CIRCLE){                             // 각성 — 바닥의 진 안이 전부 저주다
    celHoop(c,cx,cy,RC,.42,0,4*SC,"gold",.7);
    celHoop(c,cx,cy,RC*.72,.42,0,2.4*SC,"gold",.45);
    c.save();c.translate(cx,cy);c.scale(1,.42);c.rotate(-t*.3);
    for(let i=0;i<8;i++){const a=i/8*TAU;
      celSpike(c,Math.cos(a)*RC*.86,Math.sin(a)*RC*.86,a,RC*.16,4.4*SC,"gold",.8);}
    c.restore();}
  // 저주 표식은 **몸 뒤로도 감긴다** — pvMark 가 유일하게 뒤 층을 쓰는 상태다.
  const mk1=(L)=>pvLayer(c,cx,cy,st.F,"curse",t,TK("gold"),SC,L);
  mk1(0);drawFoes(c,t,cx,cy,st.F);mk1(1);
  if(st.jm>0&&SPREAD){const a=st.F[0],b=st.F[Math.min(st.F.length-1,N+((st.js||0)%2))];
    celStroke(c,[[cx+a.ox,cy+a.oy],[cx+(a.ox+b.ox)/2,cy+(a.oy+b.oy)/2-18*SC],
      [cx+b.ox,cy+b.oy]],2.6*SC,"gold",st.jm*2);}
  // 물보라 — **저주받은 놈만 크게 터진다.** 이 한 줄이 스킬 설명 전체다.
  if(st.bl>0){const f=st.bl/.34;
    for(const q of st.F)celSplash(c,cx+q.ox+q.kx,cy+q.oy+q.ky,
      Math.max(1,(q.cur?15*VUL:15)*SC*f),9,q.idx*4+3,q.cur?"gold":"shade",f*.95);}
  drawP(c,st);hero(c,t,cx,cy);},

plague(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 시간을 빼앗는다 — **즉발이 없다.** 중독은 「약하고 길다, 자동 중첩」이라
  // (PASSIVE 표) 눈에 보여야 하는 것은 한 방이 아니라 **중첩이 쌓이는 속도**와
  // **번지는 것**이다.
  //
  // **무리를 두 겹으로 둔다.** 포자 파동은 안쪽 셋까지만 닿는다 — 바깥 셋이
  // 감염되는 유일한 길이 전염(L3)이라, 「번진다」가 레벨 사이의 차이로 보인다.
  // 파동이 전부에게 닿으면 전염이 켜져도 화면이 똑같아 레벨표가 죽는다.
  st.F=st.F||mkFoesZ([[-46,-48,10],[46,-48,10],[0,64,10],
                      [-94,-30,10],[94,-30,10],[0,110,10]],SC);
  st.F.forEach((f,i)=>{if(f.idx===undefined){f.idx=i;f.inf=0;f.stk=0;f.fz=0;}});
  stepFoes(st.F,dt);
  const CAP=[1,3,3,3,3][LV-1],CONTAG=atL(3),FIELD=atL(4),BURST=atL(5);
  st.pz=st.pz||[];
  const SP=.9,su=saw(t,SP),RRw=76*SC*su;
  if(su<(st.su||0))st.hitset=new Set();
  st.su=su;st.hitset=st.hitset||new Set();
  for(const f of st.F){const d=Math.hypot(f.ox,f.oy);
    if(!st.hitset.has(f.idx)&&d<RRw+f.r){st.hitset.add(f.idx);
      f.stk=Math.min(CAP,f.stk+1);f.inf=Math.max(f.inf,3.4);}}
  for(const f of st.F){
    if(f.inf>0){f.inf-=dt;
      if(f.inf<=0)f.stk=0;
      f.dt2=(f.dt2||R()*.25)+dt;
      if(f.dt2>=.25){f.dt2-=.25;f.hit=Math.max(f.hit,.35+.2*f.stk);
        emit(st,cx+f.ox,cy+f.oy,1,{k:"cPlague",sp:20*SC,r:2.2*SC,life:.6,g:-60*SC,spikeP:.1});}}
    f.pv=Math.min(1,f.inf/2);
    // 지대(L4) — 얼룩이 바닥에 남고, 지나는 놈이 밟으면 감염된다.
    if(FIELD)for(const p of st.pz)
      if(Math.hypot(cx+f.ox-p.x,cy+f.oy-p.y)<p.r){f.stk=Math.min(CAP,Math.max(f.stk,1));
        f.inf=Math.max(f.inf,2.2);}}
  // 전염(L3) — 만중첩이 된 놈이 **터지고** 이웃이 감염된다.
  //
  // ⚠️ 터짐의 시한을 감염 잔여로 재면 **영영 안 터진다** — 파동이 0.9초마다
  // 잔여를 다시 채우기 때문이다. 만중첩이 되는 순간 **따로 도화선을 심는다**:
  // 채워지는 것과 타들어가는 것은 다른 시계여야 한다.
  for(const f of st.F){
    if(f.fz>0){f.fz-=dt;if(f.fz>0)continue;}          // 아직 타는 중
    else if(CONTAG&&f.stk>=CAP){f.fz=.9;continue;}    // 방금 만중첩 — 심는다
    else continue;                                     // 터질 일이 없다
    f.stk=0;f.inf=0;f.fz=0;
    st.pz.push({x:cx+f.ox,y:cy+f.oy,r:34*SC,l:0});
    if(BURST){hitFoe(st,f,cx,cy,0,-1,26*SC,"cPlague");
      emit(st,cx+f.ox,cy+f.oy,12,{k:"cPlague",sp:150*SC,r:2.8*SC,life:.5,spikeP:.5});}
    for(const g of st.F){if(g===f)continue;
      if(Math.hypot(f.ox-g.ox,f.oy-g.oy)<52*SC){
        g.stk=Math.min(CAP,g.stk+1);g.inf=Math.max(g.inf,3.4);
        if(BURST)hitFoe(st,g,cx,cy,0,-1,14*SC,"cPlague");}}}
  for(let i=st.pz.length-1;i>=0;i--){const p=st.pz[i];p.l+=dt;
    if(p.l>(FIELD?4.2:1.6))st.pz.splice(i,1);}
  stepP(st,dt);
  // 얼룩 — 바닥이라 적보다 **먼저** 그린다. 위에 그리면 적이 얼룩 속에
  // 잠겨 「감염된 놈」이 아니라 「가려진 놈」이 된다.
  for(const p of st.pz){const a=Math.min(1,p.l*3)*Math.max(0,1-p.l/(FIELD?4.2:1.6));
    celPuff(c,p.x,p.y,Math.max(1,p.r*(.7+.3*Math.min(1,p.l*2))),9,p.x*.1,"cPlague",a*.85,.42);}
  // 감염된 놈은 **발밑이 번져 있다** — 머리 위 표식만으로는 150px 칸에서
  // 「누가 감염됐나」가 안 읽힌다. 적 하나만 한 얼룩이 붙어 있어야 무리 속에서
  // 감염자가 한눈에 갈린다.
  for(const f of st.F){if(f.inf<=0)continue;
    const x=cx+f.ox+f.kx,y=cy+f.oy+f.ky,g=Math.min(1,f.inf/2);
    celPuff(c,x,y+f.r*.5,Math.max(1,f.r*(.9+.35*f.stk)),8,f.idx*3.7,"cPlague",.75*g,.5);}
  // 그리는 반지름은 **무는 반지름 그대로**(RRw)다 — 크게 그려 놓고 작게 물면
  // 「이펙트는 지나갔는데 안 걸린다」가 된다(빛파동에서 확정된 규율).
  // ⚠️ 굵기를 반지름 바닥에 묶는다 — 갓 태어난 고리에서 음수 반지름이 난다.
  {const wv=4*SC*(1-su)+1;celHoop(c,cx,cy,Math.max(wv*1.5,RRw),.9,0,wv,"gold",(1-su)*.7);}
  const mk2=(L)=>pvLayer(c,cx,cy,st.F,"poison",t,TK("gold"),SC,L);
  mk2(0);drawFoes(c,t,cx,cy,st.F);mk2(1);
  drawP(c,st);hero(c,t,cx,cy);},

shackle(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 이동을 빼앗는다. 동상은 「둔화 + 0.1s 빙결 + 냉기 도트」라(PASSIVE 표)
  // **완전 정지가 아니다** — 묶인 놈이 사라지지 않고 제자리에서 버텨야
  // 「묶였다」이지 「지워졌다」가 아니다.
  st.F=st.F||mkFoesZ([[-86,-46,10],[-24,-92,10],[36,-84,10],[88,-38,10],
                      [-52,62,10],[58,58,10]],SC);
  st.F.forEach((f,i)=>{if(f.idx===undefined){f.idx=i;f.bd=0;}});
  const N=[1,2,2,3,4][LV-1],LINKED=atL(3),FREEZE=atL(4),SHATTER=atL(5),RRb=74*SC;
  // 대상은 **가까운 놈부터** — 「범위가 넓어진다」가 성장축이라 매번 다시 고른다.
  const order=st.F.slice().sort((a,b)=>Math.hypot(a.ox,a.oy)-Math.hypot(b.ox,b.oy));
  const bound=new Set();
  for(let i=0;i<Math.min(N,order.length);i++)
    if(Math.hypot(order[i].ox,order[i].oy)<RRb)bound.add(order[i].idx);
  for(const f of st.F){
    const b=bound.has(f.idx);
    f.bd=b?Math.min(1,f.bd+dt*3.5):Math.max(0,f.bd-dt*3);
    f.pv=f.bd;
    const d=Math.hypot(f.ox,f.oy)||1;
    const mul=FREEZE&&f.bd>.85?0:(1-f.bd*.72);
    if(d>26*SC+f.r){f.ox-=f.ox/d*30*SC*dt*mul;f.oy-=f.oy/d*30*SC*dt*mul;}
    if(SHATTER&&FREEZE&&f.bd>.85){f.sh=(f.sh||0)+dt;
      if(f.sh>1.6){f.sh=0;hitFoe(st,f,cx,cy,0,-1,20*SC,"frost");
        emit(st,cx+f.ox,cy+f.oy,10,{k:"frost",sp:150*SC,r:2.6*SC,life:.45,spikeP:.8});}}
    else f.sh=0;}
  stepFoes(st.F,dt);stepP(st,dt);
  celHoop(c,cx,cy,RRb,.5,0,2.6*SC,"gold",.32);       // 묶는 범위
  const mk3=(L)=>pvLayer(c,cx,cy,st.F,"frost",t,TK("gold"),SC,L);
  mk3(0);drawFoes(c,t,cx,cy,st.F);mk3(1);
  const bx=f=>cx+f.ox+f.kx, by=f=>cy+f.oy+f.ky;
  // 사슬 — 발밑에서 솟는다. 리본은 이음매가 끊기므로 획(celStroke)을 쓴다.
  for(const f of st.F){if(f.bd<=.02)continue;
    const x=bx(f),y=by(f),g=f.bd;
    for(let i=0;i<4;i++){const a=i/4*TAU+f.idx;
      const ex=x+Math.cos(a)*f.r*1.7*g,ey=y+f.r*.6+Math.sin(a)*f.r*.6*g;
      celStroke(c,[[x,y+f.r*.55],[(x+ex)/2,(y+ey)/2+5*SC],[ex,ey]],4*SC,"gold",g);
      celSpike(c,ex,ey,a,10*SC*g,3.2*SC,"gold",g);}}
  // 잇는다(L3) — 묶인 것끼리 한 줄이 된다. 한쪽이 끌리면 같이 끌린다는
  // 규칙이라, 선은 **장식이 아니라 계약**이다(공전의 궤도선과 같은 규율).
  if(LINKED){const B=st.F.filter(f=>f.bd>.5);
    for(let i=0;i+1<B.length;i++)
      celStroke(c,[[bx(B[i]),by(B[i])],[bx(B[i+1]),by(B[i+1])]],2.2*SC,"gold",.7);}
  drawP(c,st);hero(c,t,cx,cy);},

seal(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 공격을 빼앗는다. **감전은 공속만 늦추고 이동은 손대지 않는다**(PASSIVE
  // 표) — 그것이 화면에 보이려면 **공격 시계 자체가 보여야** 하므로, 적
  // 머리 위에 충전 고리를 얹고 봉인당한 놈의 고리가 기어가는 것을 보여준다.
  // L5 는 감전이 아니라 **침묵**(원거리 공격 중지)이라 고리가 아예 선다 —
  // 두 상태가 한 스킬의 두 끝이고, 표식(pvMark)도 그대로 갈린다.
  st.F=st.F||mkFoesZ([[-84,-48,10],[-28,-86,10],[32,-86,10],[86,-44,10],
                      [-56,60,10],[58,60,10]],SC);
  st.F.forEach((f,i)=>{if(f.idx===undefined){f.idx=i;f.cg=R();}});
  stepFoes(st.F,dt);
  const N=[1,2,2,3,6][LV-1],MUL=[.6,.6,.3,.3,0][LV-1],
        RUPT=atL(4),SILENCE=atL(5);
  st.b=st.b||[];st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);
  const order=st.F.slice().sort((a,b)=>Math.hypot(a.ox,a.oy)-Math.hypot(b.ox,b.oy));
  const seal=new Set();for(let i=0;i<Math.min(N,order.length);i++)seal.add(order[i].idx);
  for(const f of st.F){
    const s=seal.has(f.idx);
    f.sl=s?Math.min(1,(f.sl||0)+dt*3):Math.max(0,(f.sl||0)-dt*2);
    f.pv=f.sl;
    const mul=1-(1-MUL)*f.sl;
    f.cg+=dt*.85*mul;
    if(f.cg>=1){f.cg=0;
      if(RUPT&&f.sl>.6){          // 파열 — 모아둔 것이 자기에게 터진다
        hitFoe(st,f,cx,cy,0,-1,24*SC,"cSeal");
        emit(st,cx+f.ox,cy+f.oy,10,{k:"cSeal",sp:140*SC,r:2.6*SC,life:.44,spikeP:.6});}
      else{const a=Math.atan2(-f.oy,-f.ox);
        st.b.push({x:cx+f.ox,y:cy+f.oy,vx:Math.cos(a)*140*SC,vy:Math.sin(a)*140*SC,l:0});}}}
  for(let i=st.b.length-1;i>=0;i--){const b=st.b[i];b.l+=dt;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(Math.hypot(b.x-cx,b.y-cy)<17*SC){st.hurt=1;st.b.splice(i,1);continue;}
    if(b.l>3)st.b.splice(i,1);}
  stepP(st,dt);
  const mk4=(L)=>pvLayer(c,cx,cy,st.F,SILENCE?"silence":"shock",t,TK("gold"),SC,L);
  mk4(0);drawFoes(c,t,cx,cy,st.F);mk4(1);
  for(const b of st.b)celRound(c,b.x,b.y,Math.atan2(b.vy,b.vx),13*SC,3.8*SC,"shade",.5,.4);
  for(const f of st.F){const x=cx+f.ox+f.kx,y=cy+f.oy+f.ky;
    // 공격 시계 — **봉인 여부와 무관하게 전부 보여준다.** 걸린 놈만 그리면
    // 무엇과 비교해서 느린 것인지 알 수 없다(저주 타일의 대조군과 같은 수법).
    celHoop(c,x,y-f.r-13*SC,Math.max(1,7*SC),1,0,2*SC,"shade",.6);
    celGauge(c,x,y-f.r-13*SC,7*SC,f.cg,2.4*SC,f.sl>.4?"gold":"amber",.95);}
  drawP(c,st);hero(c,t,cx,cy);},

veil(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 조준을 빼앗는다.
  //
  // ⚠️ **실명은 「적이 엉뚱한 데로 걷는 것」이 아니다.** PASSIVE 표가 못 박은
  // 정의는 「원거리 적의 **발사각에 오차** → 탄이 눈에 보이게 빗나간다」이고,
  // 그 정의 자체가 회피율(미스)을 버린 이유의 쌍둥이다: 안 맞은 것이 화면에
  // 남아야 한다. 그래서 이 타일은 **적이 쏘고 그 탄이 비껴 나가는 것**을
  // 그린다 — 빗나간 탄이 지나가는 자리가 곧 이 스킬의 증거다.
  //
  // 개안(빛으로 눈을 멀게 한다)과 안 겹치는 이유: 저쪽은 **화면을 채우는
  // 흰 빛**이고 이쪽은 **적에게 씌우는 검은 것**이다 — 같은 상태를 정반대
  // 물성으로 건다.
  st.F=st.F||mkFoesZ([[-88,-40,10],[-32,-84,10],[34,-84,10],[88,-36,10],
                      [-54,60,10],[56,60,10]],SC);
  st.F.forEach((f,i)=>{if(f.idx===undefined){f.idx=i;f.cd=R()*1.2;}});
  stepFoes(st.F,dt);
  const N=[2,3,3,6,6][LV-1],ERR=[.34,.34,.62,.62,.62][LV-1],
        DUR=[2.6,3.4,3.4,3.4,3.4][LV-1],
        WIDE=atL(4),CURTAIN=atL(5),RRv=WIDE?104*SC:74*SC;
  st.b=st.b||[];st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);
  st.acc=(st.acc||0)+dt;
  if(st.acc>2.0){st.acc=0;
    const order=st.F.slice().sort((a,b)=>Math.hypot(a.ox,a.oy)-Math.hypot(b.ox,b.oy));
    for(let i=0;i<Math.min(N,order.length);i++){const f=order[i];
      if(Math.hypot(f.ox,f.oy)>RRv)continue;
      f.bl=DUR;}}
  for(const f of st.F){
    f.bl=Math.max(0,(f.bl||0)-dt);f.pv=Math.min(1,f.bl);
    f.cd=(f.cd||0)-dt;
    if(f.cd<=0){f.cd=1.35;
      // **오차는 쏘는 순간 한 번 굴린다** — 매 프레임 흔들면 탄이 춤을 춘다.
      const base=Math.atan2(-f.oy,-f.ox);
      const e=f.bl>0?(hash(f.idx*5.3+((t*3)|0))-.5)*2*ERR:0;
      const a=base+e;
      st.b.push({x:cx+f.ox,y:cy+f.oy,vx:Math.cos(a)*150*SC,vy:Math.sin(a)*150*SC,
        l:0,miss:f.bl>0?1:0});}}
  for(let i=st.b.length-1;i>=0;i--){const b=st.b[i];b.l+=dt;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(Math.hypot(b.x-cx,b.y-cy)<17*SC){st.hurt=1;st.b.splice(i,1);continue;}
    if(b.l>2.6)st.b.splice(i,1);}
  stepP(st,dt);
  if(CURTAIN){                        // 각성 — 장막이 칸 전체를 덮는다
    // ⚠️ 검은 배경에 검은 비네트를 얹으면 **아무것도 안 보인다.** 어둠은
    // 언제나 **테두리로** 보인다는 규칙 그대로, 장막의 정체를 가장자리 천에
    // 싣는다: 안쪽은 비고 둘레가 두껍게 닫힌다.
    c.save();const g=c.createRadialGradient(cx,cy,W*.1,cx,cy,W*.62);
    g.addColorStop(0,"rgba(8,6,14,0)");g.addColorStop(1,"rgba(8,6,14,.9)");
    c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
    celHoop(c,cx,cy,Math.max(1,W*.44),.62,0,14*SC,"gold",.55);}
  else celHoop(c,cx,cy,Math.max(1,RRv),.55,0,3*SC,"cVeil",.5);
  const mk5=(L)=>pvLayer(c,cx,cy,st.F,"blind",t,TK("gold"),SC,L);
  mk5(0);drawFoes(c,t,cx,cy,st.F);mk5(1);
  // 빗나간 탄은 **어둠 색**, 제대로 온 탄은 붉다 — 색이 곧 「이건 안 맞는다」다.
  for(const b of st.b)celRound(c,b.x,b.y,Math.atan2(b.vy,b.vx),
    13*SC,3.8*SC,b.miss?"cVeil":"shade",1,b.miss?.95:.45);
  if(st.hurt>0)hurtFlash(c,cx,cy,Math.max(1,18*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,cx,cy);},

// ═══════════════════════════════════════════════════════════════════════════
// 회복 4 — 축은 **무엇을 회복으로 바꾸는가**
// ═══════════════════════════════════════════════════════════════════════════
//
// ⚠️ **잔불 원칙을 안 깬다.**
// `lib/data/offers.dart` 는 잔불을 최대 3레벨로 묶으며 근거를 적어 두었다:
// 「라서 유일의 자동 재생원 — 자동 재생이 강하면 도망 다니는 것이 최적해가
// 된다」. 회복 스킬을 넣으면서 그 원칙을 지키는 길은 회복량을 깎는 것이
// 아니라 **입력을 붙이는 것**이다.
//
//   여명 dawn   시간을 — 안 맞은 시간 (닿아 있으면 수학적으로 안 흐른다)
//   수확 reap   죽음을 — 처치 (안 싸우면 0)
//   정화 purity 오염을 — 상태이상 (걸린 게 없으면 할 일이 없다)
//   공물 tithe  자원을 — 암흑물질 (경험치를 태워 피를 산다)
//
// 넷 다 **무조건 흐르지 않는다.** 그래서 잔불은 여전히 「유일한 자동
// 재생원」이고 3레벨 상한도 그대로다 — 원칙이 바뀐 게 아니라, 원칙이
// 금지한 것(무조건 재생)을 하나도 안 만든 것이다.
// 다섯째 후보였던 「소생」은 거암 L3(불굴)과 동사가 같아 뺐다.

dawn(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 이 타일이 보여주는 것은 회복이 아니라 **왕복**이다. 해가 떠서 차오르다
  // 적이 닿으면 다시 진다 — kDawnDelaySec(4초)이 접촉 쿨다운(0.6s)의 6.7배인
  // 이유가 그림으로 나온다: 무리에 닿아 있는 동안엔 절대 안 흐른다.
  st.F=st.F||mkFoesZ([[92,-52,10],[-96,40,10],[20,-104,9]],SC);
  const DELAY=4.0,RATE=[.8,.8,1.2,1.2,1.2][LV-1]/24,   // 24 = 시안의 최대 HP
        DEW=atL(2),GRIT=atL(4),CRISIS=atL(5);
  if(st.hp===undefined){st.hp=1;st.wt=0;}
  st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);st.dew=Math.max(0,(st.dew||0)-dt*1.6);
  for(const f of st.F){
    f.cd=Math.max(0,(f.cd||0)-dt);
    const d=Math.hypot(f.ox,f.oy)||1;
    if(d>28*SC+f.r){f.ox-=f.ox/d*30*SC*dt;f.oy-=f.oy/d*30*SC*dt;}
    else if(f.cd<=0){f.cd=.6;st.hp=Math.max(.12,st.hp-.085);st.hurt=1;
      // 끈기(L4) — 피격이 기다림을 **처음으로 되돌리지 못한다.** 되돌림이
      // 아니라 깎임이라, 무리 속에서도 언젠가는 밝아온다.
      st.wt=GRIT?Math.max(0,st.wt-1.5):0;
      f.kx+=f.ox/d*10*SC;f.ky+=f.oy/d*10*SC;}}
  const crisis=CRISIS&&st.hp<=.30;               // 동트기 — 위기엔 기다림이 없다
  const prev=st.wt;st.wt=Math.min(DELAY,st.wt+dt);
  const flowing=crisis||st.wt>=DELAY;
  // 이슬(L2) — **타이머를 다 채우고 시작되는 그 순간만.** 저HP 우회(동트기)로
  // 터지면 30% 경계에서 왕복 회복 펌프가 생긴다(kDawnDewHeal 주석의 뒷문).
  if(DEW&&prev<DELAY&&st.wt>=DELAY){st.dew=1;st.hp=Math.min(1,st.hp+2.5/24);}
  if(flowing)st.hp=Math.min(1,st.hp+RATE*dt);
  if(flowing&&R()<dt*(14+14*RATE*24)){const a=R()*TAU,r=(70+30*R())*SC;
    inflow(st,cx+Math.cos(a)*r,cy+Math.sin(a)*r,"hDawn");}
  const MO=stepInflow(st,cx,cy,dt,180*SC);
  stepFoes(st.F,dt);stepP(st,dt);
  // 지평선 + 떠오르는 해 — 기다림이 곧 고도다. **해의 크기 = 초당 회복**:
  // 살(RAYS)은 해가 떠 있을 때만 보이는데 그 순간은 주기의 일부라, 언제 봐도
  // 읽히는 것이 하나 더 있어야 성장표가 산다.
  const u=crisis?1:st.wt/DELAY,hy=cy+40*SC-u*30*SC,hr=Math.max(1,(RATE>.04?38:27)*SC);
  celStroke(c,[[cx-72*SC,cy+40*SC],[cx+72*SC,cy+40*SC]],2*SC,"gold",.35);
  c.save();c.beginPath();c.rect(cx-90*SC,0,180*SC,cy+40*SC);c.clip();
  celHoop(c,cx,hy,hr,1,0,4*SC,"gold",.4+.6*u);
  const RAYS=RATE>.04?13:9;
  if(u>.5)for(let i=0;i<RAYS;i++){const a=Math.PI+i/(RAYS-1)*Math.PI;
    celSpike(c,cx+Math.cos(a)*hr,hy+Math.sin(a)*hr,a,
      (10+16*(u-.5)*2)*SC,3*SC,"gold",(u-.5)*2*.9);}
  c.restore();
  drawFoes(c,t,cx,cy,st.F);
  drawInflow(c,MO,3.4*SC);
  hpRing(c,cx,cy,34*SC,st.hp,"gold");
  // 동트기(L5)의 문턱 — HP 링 30% 자리에 표시를 박는다. 「위기」가 어디부터인지
  // 화면에 없으면 L5 는 아무 때나 켜지는 것처럼 보인다.
  if(CRISIS){const a=-Math.PI/2+TAU*.30;
    celSpike(c,cx+Math.cos(a)*34*SC,cy+Math.sin(a)*34*SC,a,9*SC,3*SC,"gold",.9);}
  // 기다림 고리 — 응보의 저장과 **같은 문법**이다. 차오르는 것은 언제나 이것.
  celGauge(c,cx,cy,42*SC,crisis?1:st.wt/DELAY,2.6*SC,flowing?"gold":"shade",.8);
  // 끈기(L4) — 피격이 깎아 가는 만큼(1.5s)을 고리 위에 눈금으로 남긴다.
  // 「되돌아가지 않는다」는 **되돌아갈 자리가 보여야** 읽힌다.
  if(GRIT){const a=-Math.PI/2+TAU*(1-1.5/DELAY);
    celSpike(c,cx+Math.cos(a)*42*SC,cy+Math.sin(a)*42*SC,a,10*SC,3.4*SC,"gold",.95);}
  // 이슬(L2) — 고리 꼭대기(=기다림이 다 찬 자리)에 물방울이 걸려 있다.
  if(DEW){const f=Math.max(.55,st.dew);
    celSplash(c,cx,cy-42*SC,Math.max(1,(6+9*st.dew)*SC),8,5,"gold",f);}
  if(st.hurt>0)hurtFlash(c,cx,cy,Math.max(1,18*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,cx,cy);},

reap(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 죽음을 회복으로 바꾼다 — **안 싸우면 0 이다.** 여명이 도망을 보상한다면
  // 이쪽은 정확히 반대를 보상하고, 그 반대가 두 스킬이 안 겹치는 근거다.
  // 그래서 이 타일에는 **죽는 적**이 있다(다른 타일은 적이 안 죽는다).
  st.F=st.F||mkFoesZ([[86,-46,10],[-88,-40,10],[24,-92,9],[-40,74,10],[70,58,10]],SC);
  st.F.forEach((f,i)=>{if(f.home===undefined){f.home=[f.ox,f.oy];f.idx=i;}});
  const GAIN=[.05,.075,.075,.075,.075][LV-1],COMBO=atL(3),DROP=atL(4),SCYTHE=atL(5);
  if(st.hp===undefined)st.hp=.45;
  st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);st.cb=Math.max(0,(st.cb||0)-dt);
  st.gr=st.gr||[];st.sc=Math.max(0,(st.sc||0)-dt);
  st.acc=(st.acc||0)+dt;
  for(const f of st.F){
    f.cd=Math.max(0,(f.cd||0)-dt);
    const d=Math.hypot(f.ox,f.oy)||1;
    if(d>30*SC+f.r){f.ox-=f.ox/d*28*SC*dt;f.oy-=f.oy/d*28*SC*dt;}
    else if(f.cd<=0){f.cd=.6;st.hp=Math.max(.08,st.hp-.05);st.hurt=1;}}
  // 처치 — 0.62s 마다 가장 가까운 놈이 쓰러지고 그 자리에서 이삭이 솟는다.
  if(st.acc>.62){st.acc=0;
    let k=null,kd=1e9;
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy);if(d<kd){kd=d;k=f;}}
    if(k){const x=cx+k.ox,y=cy+k.oy;
      emit(st,x,y,10,{k:"hReap",sp:130*SC,r:2.6*SC,life:.44,spikeP:.6});
      // 연쇄(L3) — 짧은 창 안에 이어 죽이면 이삭이 커진다. 성장축이 **양**이
      // 아니라 **속도**라, 몰아치는 플레이가 실제로 보상받는다.
      if(COMBO){st.cbn=st.cb>0?Math.min(3,(st.cbn||1)+1):1;st.cb=1.2;}
      const mul=COMBO?1+.34*((st.cbn||1)-1):1;
      // 흩뿌림(L4) — 안 먹힌 이삭이 바닥에 남는다. 즉시 회복이 아니라
      // **나중에 줍는 것**이라, 도망칠 때의 보험이 된다.
      if(DROP&&R()<.5)st.gr.push({x,y,l:0,mul});
      else{inflow(st,x,y,"hReap");st.pend=(st.pend||0)+GAIN*mul;}
      if(SCYTHE){st.sc=.42;st.scx=x;st.scy=y;   // 각성 — 수확이 수확을 낳는다
        for(const g of st.F)if(g!==k&&Math.hypot(g.ox-k.ox,g.oy-k.oy)<56*SC)
          hitFoe(st,g,cx,cy,0,-1,22*SC,"hReap");}
      k.ox=k.home[0];k.oy=k.home[1];k.kx=0;k.ky=0;k.hit=1;}}
  for(let i=st.gr.length-1;i>=0;i--){const g=st.gr[i];g.l+=dt;
    if(g.l>2.2){inflow(st,g.x,g.y,"hReap");st.pend=(st.pend||0)+GAIN*g.mul;
      st.gr.splice(i,1);}}
  const MO=stepInflow(st,cx,cy,dt,220*SC);
  // 이삭이 **몸에 닿을 때** 피가 찬다 — 미리 채우면 날아오는 그림이 장식이 된다.
  if(MO.length<(st.moN||0)&&(st.pend||0)>0){
    st.hp=Math.min(1,st.hp+st.pend);st.pend=0;}
  st.moN=MO.length;
  stepFoes(st.F,dt);stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  for(const g of st.gr){const a=Math.min(1,g.l*3)*(.6+.4*Math.sin(g.l*7));
    celSpike(c,g.x,g.y+8*SC,-Math.PI/2,20*SC,5.4*SC,"gold",a);}
  if(st.sc>0){const f=st.sc/.42;                 // 낫 파동
    celRibbon(c,arcPts(st.scx,st.scy,Math.max(4,58*SC*(1.25-f*.45)),-2.6,.5,16),
      18*SC*f+3,"gold",f);}
  drawInflow(c,MO,3.8*SC);
  hpRing(c,cx,cy,34*SC,st.hp,"gold");
  // 연쇄 눈금(L3) — **빈 칸도 그린다.** 콤보가 붙은 순간에만 보이면 정지
  // 화면에서 L2 와 구별이 안 되고, 「최대 몇 단인가」도 안 보인다.
  if(COMBO)for(let i=0;i<3;i++){const on=st.cb>0&&i<(st.cbn||1);
    celSplash(c,cx+(i-1)*11*SC,cy-50*SC,4.2*SC,5,i*3,"gold",on?1:.22);}
  if(st.hurt>0)hurtFlash(c,cx,cy,Math.max(1,18*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,cx,cy);},

purity(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // **HP 를 안 채우는 유일한 회복이다.** 되돌리는 것이 피가 아니라 몸의
  // 상태라, armor.dart 가 「지금은 잠자는 방어구」라고 적어 둔 정화가 여기서
  // 깨어난다 — 저주 다섯이 플레이어에게 걸릴 것을 만들면 그 즉시 소비자가
  // 생긴다. 두 분류가 **같은 여덟 상태**를 쓰는 것이 그 맞물림이다.
  const KINDS=["burn","frost","shock","poison"];
  st.F=st.F||mkFoesZ([[88,-44,10],[-90,-36,10],[30,86,9],[-58,66,10]],SC);
  st.F.forEach((f,i)=>{if(f.idx===undefined)f.idx=i;});
  stepFoes(st.F,dt);
  const DECAY=[1.3,1.3,2.0,2.0,2.0][LV-1],CURE=atL(2),THAW=atL(4),ECHO=atL(5);
  st.s=st.s||KINDS.map((k,i)=>({k,v:0,a:i/4*TAU}));
  st.echo=st.echo||[];st.acc=(st.acc||0)+dt;
  // 걸리는 쪽 — 계속 묻는다. 안 걸리면 정화는 화면에서 할 일이 없다.
  if(st.acc>.62){st.acc=0;
    const s=st.s[(st.i=(st.i||0)+1)%st.s.length];
    s.v=(CURE&&s.k==="poison")?0:1;              // 해독(L2) — 독은 아예 안 붙는다
  }
  // 물결 — 주기적으로 몸을 훑고 지나간다. 훑는 순간에 마른다.
  const WP=1.5,wu=saw(t,WP);
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.6;
  for(const s of st.s){
    if(s.v>0){s.v-=dt*.30*DECAY;
      if(THAW&&s.k==="frost"&&s.v>0&&wu<.06)s.v=0;   // 해빙 — 반 박자 안에 깨진다
      if(s.v<=0){s.v=0;
        if(ECHO){                                      // 반향 — 되쏜다
          const tg=st.F[(st.e=(st.e||0)+1)%st.F.length];
          st.echo.push({k:s.k,x:cx,y:cy,tx:cx+tg.ox,ty:cy+tg.oy,l:0,f:tg});}}}}
  for(let i=st.echo.length-1;i>=0;i--){const e=st.echo[i];e.l+=dt;
    if(e.l>=.5){hitFoe(st,e.f,cx,cy,0,-1,12*SC,"hPurity");e.f.pv=1;
      st.echo.splice(i,1);}}
  stepP(st,dt);
  const mk6=(L)=>{if(ECHO)pvLayer(c,cx,cy,st.F,"poison",t,TK("gold"),SC,L);};
  mk6(0);drawFoes(c,t,cx,cy,st.F);mk6(1);
  for(const e of st.echo){const u=e.l/.5;
    pvMark(c,e.x+(e.tx-e.x)*u,e.y+(e.ty-e.y)*u,7*SC,e.k,1,t,TK("gold"),SC,1);}
  // 씻는 물결 — 링이 몸에서 퍼진다. **물결 수 = 마르는 배속**이다(L3 부터 둘) —
  // 「두 배로 빨리 마른다」를 숫자가 아니라 개수로 보여야 정지 화면에서
  // L2 와 L3 이 갈린다. 굵기는 반지름 바닥에 묶는다(음수 반지름 방지).
  for(let k=0;k<(DECAY>1.5?2:1);k++){
    const q=(wu+k*.5)%1,wv=Math.max(1,6*SC*(1-q)+1);
    celHoop(c,cx,cy,Math.max(wv*1.5,110*SC*q),1,0,wv,"gold",(1-q)*.85);}
  hpRing(c,cx,cy,34*SC,1,"gold");   // 피는 안 깎인다 — 이 스킬이 지키는 것은 피가 아니다
  // 몸에 붙은 상태 넷 — **정화가 할 일의 목록이 곧 화면**이다. 빈 자리도
  // 고리로 남긴다: 해독(L2)이 독을 아예 못 붙게 하는 것은 **붙었어야 할
  // 자리가 비어 있어야** 보인다.
  for(const s of st.s){
    const a=s.a+t*.5,x=cx+Math.cos(a)*54*SC,y=cy+Math.sin(a)*54*SC;
    if(s.v<=0){celHoop(c,x,y,Math.max(1,8*SC),1,0,1.6*SC,"shade",.7);
      if(CURE&&s.k==="poison")   // 해독 — 자리에 빗장이 걸려 있다
        celStroke(c,[[x-8*SC,y-8*SC],[x+8*SC,y+8*SC]],2*SC,"gold",.8);
      continue;}
    pvMark(c,x,y,9*SC*(.7+.3*s.v),s.k,Math.min(1,s.v*1.4),t,TK("gold"),SC,1);}
  drawP(c,st);hero(c,t,cx,cy);},

tithe(c,t,dt,W,H,st){const SC=Math.min(W,H)/238,cx=W/2,cy=H/2;
  // 자원을 회복으로 바꾼다 — **대가가 있는 유일한 회복.** 태우는 젬은 곧
  // 경험치라, 이 스킬은 「지금의 피」와 「다음 레벨」을 맞바꾸는 손잡이다.
  // 잔불(무조건 재생)과 정반대 축이라 둘이 같이 있어도 안 겹친다.
  st.F=st.F||mkFoesZ([[90,-42,10],[-92,-34,10],[26,88,9],[-56,70,10]],SC);
  stepFoes(st.F,dt);
  const COST=[4,3,3,3,3][LV-1],AUTO=atL(3),AMP=[1,1,1,1.4,1.4][LV-1],GRAND=atL(5),
        HEAL=.16*AMP;
  if(st.hp===undefined){st.hp=.7;}
  st.hurt=Math.max(0,(st.hurt||0)-dt*2.6);st.bu=Math.max(0,(st.bu||0)-dt);
  st.orb=st.orb||[];st.acc=(st.acc||0)+dt;
  for(const f of st.F){
    f.cd=Math.max(0,(f.cd||0)-dt);
    const d=Math.hypot(f.ox,f.oy)||1;
    if(d>30*SC+f.r){f.ox-=f.ox/d*28*SC*dt;f.oy-=f.oy/d*28*SC*dt;}
    else if(f.cd<=0){f.cd=.62;st.hp=Math.max(.1,st.hp-.06);st.hurt=1;}}
  if(st.acc>.5&&st.orb.length<8){st.acc=0;      // 흡수한 젬이 몸 둘레에 쌓인다
    st.orb.push({a:R()*TAU,r:(28+10*R())*SC,sp:.6+R()*.5});}
  // 태울 조건 — **피가 가득이면 안 태운다.** 대가가 있는 회복이라 낭비하면
  // 그건 손해다. 잔불처럼 「그냥 흐르는 것」과 갈리는 지점이 정확히 여기다.
  const crisis=AUTO&&st.hp<.45,          // 자동(L3) — 위기엔 모자라도 태운다
        all=GRAND&&st.hp<.34,            // 대공물(L5) — 모아둔 전부를 한 번에
        need=all?st.orb.length:(crisis?1:COST);
  if(st.hp<.92&&need>0&&st.orb.length>=need){
    const n=all?st.orb.length:Math.min(st.orb.length,COST);
    for(let i=0;i<n;i++){const o=st.orb.pop();
      inflow(st,cx+Math.cos(o.a)*o.r,cy+Math.sin(o.a)*o.r,"hTithe");}
    st.pend=(st.pend||0)+HEAL*(n/COST);st.bu=.4;
    if(all){                             // 대공물은 한 번에 밀어낸다
      for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
        hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,30*SC,"hTithe");}}}
  const MO=stepInflow(st,cx,cy,dt,240*SC);
  if(MO.length<(st.moN||0)&&(st.pend||0)>0){
    st.hp=Math.min(1,st.hp+st.pend);st.pend=0;}
  st.moN=MO.length;
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  for(const o of st.orb){o.a+=dt*o.sp;
    gemDot(c,cx+Math.cos(o.a)*o.r,cy+Math.sin(o.a)*o.r*.9,7*SC);}
  if(st.bu>0){const f=st.bu/.4;                  // 태우는 순간 — 제단의 불
    celHoop(c,cx,cy,Math.max(1,30*SC+30*SC*(1-f)),1,0,7*SC*f+1.5,"gold",f);
    celSplash(c,cx,cy,Math.max(1,18*SC*f),8,9,"gold",f*.9);}
  drawInflow(c,MO,4*SC);
  hpRing(c,cx,cy,34*SC,st.hp,"gold");
  // **문턱을 HP 링에 박는다.** 자동(L3 · 45%)과 대공물(L5 · 34%)은 「위기일
  // 때」만 켜지는데, 그 위기가 어디부터인지 화면에 없으면 아무 때나 켜지는
  // 것처럼 보인다 — 여명의 동트기 표시와 같은 규약이다.
  const tick=(fr)=>{const a=-Math.PI/2+TAU*fr;
    celSpike(c,cx+Math.cos(a)*34*SC,cy+Math.sin(a)*34*SC,a,9*SC,3*SC,"gold",.9);};
  if(AUTO)tick(.45);
  if(GRAND)tick(.34);
  // 제물 고리 — 모인 젬이 요구 수량에 얼마나 찼나. 요구가 4 → 3 으로 줄면
  // 같은 젬 수에서 고리가 더 차 「싸졌다」가 그대로 보인다.
  celGauge(c,cx,cy,46*SC,Math.min(1,st.orb.length/COST),3.4*SC,"gold",.8);
  if(st.hurt>0)hurtFlash(c,cx,cy,Math.max(1,18*SC*st.hurt),st.hurt);
  drawP(c,st);hero(c,t,cx,cy);},
};

// ── 궁극기 공용 조각 ─────────────────────────────────────────────────────
/// 개안의 눈 하나. **궁극기의 게이지이자 이펙트다** — 윤곽이 그려져 들어온
/// 정도가 충전량[g], 다 그려지면 눈꺼풀이 서고[o] 동공이 조인다[pin].
///
/// ⚠️ **한 벌만 둔다.** 개안 칸과 발현창 칸이 각자 눈을 그리면 반드시 갈라지고,
/// 갈라진 순간 어느 쪽이 진짜인지 아무도 모르게 된다 — 이 파일이 속성 몸에서
/// 이미 배운 것(「시안이 두 벌이면 반드시 갈라진다」)을 궁극기에도 적용한다.
///
/// ⚠️ **눈은 팔레트를 두 벌 쓴다** — 그리고 그것이 실수가 아니라 조건이다.
/// 처음엔 「같은 도형이 두 팔레트를 보는 건 버그」라고 판단해 전부 궁극기색
/// (mFlare)으로 통일했다가 **눈이 흰 덩어리가 됐다**(2026-08-11 렌더 판정):
/// mFlare 는 `#5A4A34 · #FFF4E0 · #FFFFFF` 라 세 단이 전부 밝아, 흰자·홍채·
/// 동공이 서로 안 갈린다. 눈은 **안에서 대비가 나야 눈**이다.
///   • 몸(흰자·동공) = 무속성 계조 [EY] — 어둡다
///   • 빛(윤곽·홍채·갈고리) = 궁극기 계조 [GL] — 희다
/// 그래서 어두운 아몬드 안에서 흰 홍채가 타고, 그 위에 **어두운 동공**이 박힌다.
/// 동공을 밝게 두면 홍채에 묻혀 사라진다 — 동공은 홍채보다 어두워야 동공이다.
function ultEye(c,t,ex,ey,RW,g,o,mul,SC,pin){
  if(g<=.02||mul<=.02)return;
  const GL=toneOf("gold"),EY=TONE.gold,RH=RW*.62,k=Math.min(1,g*1.35);
  // 윤곽이 **양 끝에서 중앙으로** 그어져 들어온다. 눈금 막대를 따로 안 다는
  // 이유가 여기다 — HUD 에 미터를 하나 더 얹는 대신, 이미 화면에 있는 그림이
  // 차오르면 「얼마나 찼나」를 같은 자리에서 읽는다.
  for(const sgn of[-1,1])for(const sy of[-1,1]){
    c.beginPath();
    for(let i=0;i<=16;i++){const q=i/16*k,x=ex+sgn*RW*(1-q);
      i?c.lineTo(x,ey+sy*Math.sin(q*Math.PI)*RH):c.moveTo(x,ey);}
    c.strokeStyle=A(GL[2],.9*mul);c.lineWidth=2.6*SC;c.stroke();}
  if(o<=.02)return;
  const lid=(sc,col)=>{c.beginPath();c.moveTo(ex-RW,ey);
    c.quadraticCurveTo(ex,ey-RH*2*sc,ex+RW,ey);
    c.quadraticCurveTo(ex,ey+RH*2*sc,ex-RW,ey);c.closePath();c.fillStyle=col;c.fill();};
  c.save();c.globalAlpha=o*mul;
  lid(1,A(EY[0],.95));lid(.66,A(EY[1],.95));
  c.beginPath();c.moveTo(ex-RW,ey);c.quadraticCurveTo(ex,ey-RH*2,ex+RW,ey);
  c.quadraticCurveTo(ex,ey+RH*2,ex-RW,ey);c.closePath();c.clip();
  celHoop(c,ex,ey,RH*.95,1,0,RH*.24,"gold",1);
  // 세 갈고리(勾玉) — 다 떠졌다는 표식
  for(let i=0;i<3;i++){const a=i/3*TAU+t*1.1;
    celSplash(c,ex+Math.cos(a)*RH*.9,ey+Math.sin(a)*RH*.9,RH*.26,6,i*3,"gold",1);}
  // 터지는 순간 동공이 조인다 — 「모았다 놓았다」가 이 한 곳에 있다.
  const pr=RH*.42*(1-Math.min(1,Math.max(0,pin||0))*.74);
  c.beginPath();c.ellipse(ex,ey,pr,pr,0,0,TAU);c.fillStyle=A(EY[0],.95);c.fill();
  c.restore();}

// ── 몸 앰블럼 공용 조각 ──────────────────────────────────────────────────
function emberCore(c,t,cx,cy,r,tone){const T=tone||["#7A2A06","#FFA23C","#FFF6DC"];
  const b=1+.05*Math.sin(t*2.6);
  fillPoly(c,jagPoly(cx,cy,r*b,8,3,1.2),A(T[0],.95));
  fillPoly(c,jagPoly(cx,cy,r*.74*b,8,3.4,1.15),A(T[1],1));
  fillPoly(c,jagPoly(cx,cy,r*.40*b,8,4.1,1.1),A(T[2],1));}
function heatHalo(c,cx,cy,r,a){c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,cy,0,cx,cy,r);
  g.addColorStop(0,`rgba(255,190,90,${a})`);g.addColorStop(1,"rgba(255,110,30,0)");
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,TAU);c.fill();c.restore();}
function embers(c,t,cx,cy,r,n,s){for(let i=0;i<n;i++){const ph=(t*.85+i*(1/n))%1;
  const x=cx+(hash(i*4.3)-.5)*r*3+Math.sin(t*2+i)*r*.4,y=cy-r*.4-ph*r*4;
  c.save();c.translate(x,y);c.rotate(hash(i*9.1)*TAU+t);
  c.beginPath();c.moveTo(0,-3.4*s);c.lineTo(1.6*s,0);c.lineTo(0,3.4*s);c.lineTo(-1.6*s,0);
  c.closePath();c.fillStyle=A(ph<.5?FIRE_LIT:FIRE_BASE,(1-ph)*.95);c.fill();c.restore();}}

// ── 속성 ─────────────────────────────────────────────────────────────────
const ELEM={
// ── 속성 몸 — **확정 모티프를 그대로 얹는다** ────────────────────────────
//
// 여섯 속성의 모티프가 확정됐으므로(#elemvar), 몸도 **같은 그림**을 쓴다.
// 시안이 두 벌이면 반드시 갈라지고, 갈라진 순간 어느 쪽이 진짜인지 아무도
// 모르게 된다 — 그래서 여기서는 그리는 함수를 새로 쓰지 않고 확정된
// `EVSET`/`EVDRAW` 를 **그대로 호출**한다.
//
// 몸이 앰블럼과 다른 점은 둘뿐이다: **가산 광휘**가 아래에 깔리고(몸이 씬에
// 앉는다), 티끌이 떠돈다. 나머지는 전부 같은 숫자에서 나온다.
elemBody(c,t,dt,W,H,st,el,bare){
  const cx=W/2,cy=H/2,RR=Math.min(W,H)*.30;
  // 모티프가 **없는** 속성이 하나 있다 — 무속성. 둘레에 아무것도 안 도는 것이
  // 정체라, 여기서 특별취급하지 않고 EVSET 에 자리가 없으면 코어만 남긴다.
  // 둘레가 없는 경우가 **둘** 있다: 무속성(EVSET 에 자리가 없다)과
  // **발현 전**([bare]). 속성을 먹으면 먼저 **코어만 물들고**, 발현해야
  // 둘레에 모티프가 선다 — 그래서 같은 함수가 둘 다 그린다.
  const [shape,n,sp,ring]=(bare||!EVSET[el])?["",0,0,0]:EVSET[el][0];
  const tn=EVTONE[el]||el, T=TONE[tn];
  stepP(st,dt);
  if(R()<dt*10)emit(st,cx+(R()-.5)*RR*1.4,cy+(R()-.5)*RR*1.4,1,
    {k:tn,sp:8,r:2.6,life:1.1,g:-40,spikeP:.05});
  // 광휘 — 몸을 씬에 앉히는 것. 앰블럼 타일에는 없고 몸에만 있다.
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*1.5);
  g.addColorStop(0,A(T[1],tn==="shade"?.14:.30));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*1.5,0,TAU);c.fill();c.restore();
  let ownCore=false;
  if(EVDRAW[shape])ownCore=EVDRAW[shape](c,cx,cy,RR,t,n,sp,tn)===true;
  else for(let i=0;i<n;i++)evShape(c,cx,cy,RR,t*sp+i/n*TAU,EVP[shape],tn);
  if(ring)celHoop(c,cx,cy,RR*ring,1,0,3.2,tn,.55);
  if(!ownCore){
    if(tn==="shade"){
      fillPoly(c,jagPoly(cx,cy,RR*.40,7,3.2,1.3),A(T[0],.98));
      c.strokeStyle="rgba(183,155,224,.95)";c.lineWidth=2.8;c.stroke();
      fillPoly(c,jagPoly(cx,cy,RR*.22,7,3.6,1.25),A(T[1],.95));
      c.strokeStyle="rgba(200,178,236,.9)";c.lineWidth=1.8;c.stroke();
    }else{
      fillPoly(c,jagPoly(cx,cy,RR*.40,7,3.2,1.3),A(T[0],.95));
      fillPoly(c,jagPoly(cx,cy,RR*.30,7,3.6,1.25),A(T[1],1));
      fillPoly(c,jagPoly(cx,cy,RR*.16,7,4.2,1.2),A(T[2],1));}}
  drawP(c,st);
},
// 무속성 — **각성 전.** 나머지 여섯과 **같은 함수**로 그린다(둘레만 비었다).
// 비교 대상이 없으면 「빛이 색을 입는다」가 안 읽힌다 — 이 칸이 그 기준선이다.
base (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"gold");},
// 무속성 **발현** — 확정된 안(FVFIX.gold.mani)을 그대로 부른다. 번호를 여기
// 박아 두면 시안이 두 벌이 되어 반드시 갈라진다.
goldMani(c,t,dt,W,H,st){fvBody(c,t,dt,W,H,st,"gold",(FVFIX.gold.mani||1)-1);},
// 백광 **발현** — 아직 안 골랐으면 자리만 지킨다(빈 칸으로 뜬다).
morphWhiteFrom(c,t,dt,W,H,st){
  const cx=W/2,cy=H/2,RR=Math.min(W,H)*.30;
  const P=3.2,u=saw(t,P),WH=TONE.white;
  stepP(st,dt);
  st.sub=st.sub||{p:[]};
  // 시작 상태 — 주기마다 갈아탄다. **어디서 와도 같은 이야기**임을 보인다.
  const START=[
    {nm:"마 痲", draw:(cc)=>fvBody(cc,t,dt,W,H,st.sub,"numb",(FVFIX.numb.mani||1)-1)},
    {nm:"수 水", draw:(cc)=>fvBody(cc,t,dt,W,H,st.sub,"aqua",(FVFIX.aqua.mani||1)-1)},
    {nm:"염 炎", draw:(cc)=>ELEM.elemBody(cc,t,dt,W,H,st.sub,"ember")},
    {nm:"무속성", draw:(cc)=>fvBody(cc,t,dt,W,H,st.sub,"gold",(FVFIX.gold.mani||1)-1)},
  ];
  const S0=START[Math.floor(t/P)%START.length];
  const seg=(a2,b2)=>Math.max(0,Math.min(1,(u-a2)/(b2-a2)));
  // ⚠️ **안착이 펑 안에서 시작한다**(2026-08-11 사용자 판정: 「펑 하고 터진 뒤
  // 백광이 두등등장하는 게 뚝뚝 끊긴다」). 겹침이 .86~.88 로 0.02(≈64ms)뿐이라
  // 사실상 없었고, 그래서 「빛이 흩어져 사라진다」와 「몸이 켜진다」가 **두 사건**
  // 으로 읽혔다. .76 부터 열어 펑의 밝기가 남아 있는 동안 몸이 서게 한다.
  const rush=seg(.06,.52), leak=seg(.50,.66),
        pull=seg(.64,.70), burst=seg(.70,.88), land=seg(.76,1);
  // ── ① 시작 몸 — 빛이 차오르며 지워진다.
  // 몸은 **꽂힌 빛이 쌓이는 만큼** 지워진다 — 별도 단계를 두지 않는다.
  // ⚠️ 주기 이음새 — u=1 에서 백광이 알파 1 인데 u=0 에서 시작 몸이 곧바로
  // 알파 1 이면 거기서도 「뚝」이 난다. 앞머리 4%에 페이드를 둔다.
  const bodyA=Math.max(0,1-Math.min(1,u/.42)*1.25)*Math.min(1,u/.04);
  if(bodyA>.02){c.save();c.globalAlpha=bodyA;try{S0.draw(c);}catch(e){}c.restore();}
  // ── ② 쇄도 — **딜레이가 제각각.** 일제히 오면 「합창」이고, 어긋나야
  // 「슈슉 슈슉」이 된다. 전 세계의 빛을 빨아들이듯 사방에서 무작위로 꽂힌다.
  //
  // ⚠️ 앞서 한꺼번에 오게 했다가 반려됐다(2026-08-10). 개체마다 **출발 시각과
  // 비행 시간**을 따로 굴리고, 한 번에 날아가는 시간을 짧게(0.10~0.20 주기)
  // 잡아야 한 줄기씩 「꽂힌다」로 읽힌다.
  let hit=0;                                        // 지금까지 꽂힌 수 — 밝기의 근거
  if(rush>0&&burst<=0){
    const N=64;
    for(let i=0;i<N;i++){
      const sd=i*3.77;
      const t0=.04+.46*hash(sd);                    // 저마다 다른 출발
      const dur=.10+.10*hash(sd*2.3);               // 저마다 다른 비행 시간
      const q=(u-t0)/dur;
      if(q>=1){hit++;continue;}                     // 이미 꽂혔다
      if(q<=0)continue;
      const e=Math.pow(q,1.9);                      // 가까울수록 빨라진다
      const a2=hash(sd*5.9)*TAU;
      const d0=RR*(2.2+1.1*hash(sd*7.1));
      const d=d0*(1-e)+RR*.10*e;
      const len=RR*(.42+.75*hash(sd*9.3))*(1-e*.35);
      const x=cx+Math.cos(a2)*d, y=cy+Math.sin(a2)*d*.92;
      const x2=cx+Math.cos(a2)*(d+len), y2=cy+Math.sin(a2)*(d+len)*.92;
      const al=Math.max(0,Math.min(1,q*3.5)*(1-e*.25));
      celStroke(c,[[x2,y2],[x,y]],RR*(.016+.024*hash(sd*11.7)),"white",al*.9);
      c.save();c.globalCompositeOperation="lighter";
      const g=c.createRadialGradient(x,y,0,x,y,RR*.09);
      g.addColorStop(0,A("#FFFFFF",al*.8));g.addColorStop(1,A(WH[1],0));
      c.fillStyle=g;c.beginPath();c.arc(x,y,RR*.09,0,TAU);c.fill();c.restore();
      // 꽂히는 순간의 튐 — 「슉」의 끝을 찍는다
      if(q>.86){const f2=(q-.86)/.14;
        for(let k=0;k<4;k++)
          celSpike(c,x,y,a2+Math.PI+(k-1.5)*.5,RR*.10*(1-f2),RR*.014,"white",
            Math.max(0,(1-f2)*.7));}}}
  // ── ③ 충전 — **원을 그리지 않는다.** 꽂힌 빛이 쌓여 가운데가 밝아질 뿐이다.
  //
  // ⚠️ 흰 구를 테두리까지 그렸다가 반려됐다(2026-08-10) — 경계가 생기면
  // 「풍선」이고, 백광은 **빛이 고인 것**이라 가장자리가 없어야 한다.
  // 그래서 밝기의 근거를 **꽂힌 개수**(hit)에 두고, 가장자리 없는 번짐만 얹는다.
  const load=Math.max(0,Math.min(1,hit/44))*(1-burst);
  if(load>.02&&burst<=0){
    const beat=1+.05*Math.sin(t*26)*load;           // 못 버티고 떤다
    c.save();c.globalCompositeOperation="lighter";
    for(const [rMul,al] of [[.34,.62],[.62,.34],[1.05,.16]]){
      const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*rMul*beat*(1-pull*.30));
      g.addColorStop(0,A("#FFFFFF",Math.max(0,al*load)));
      g.addColorStop(1,A(WH[1],0));                 // **테두리가 없다**
      c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*rMul*beat*(1-pull*.30),0,TAU);c.fill();}
    c.restore();}
  // ── ④ 샘 — 고인 빛이 **못 버티고 삐져나온다.** 방향은 제각각.
  if(leak>0&&burst<=0){
    const q=ease(leak)*load;
    const n=5+((q*18)|0);
    for(let i=0;i<n;i++){
      const sd=i*4.31+Math.floor(t*9)*.7;           // 새는 자리가 계속 바뀐다
      const a2=hash(sd)*TAU;
      const r0=RR*(.30+.30*hash(sd*2.1));
      const ln=RR*(.20+.80*q*hash(sd*3.1));
      celSpike(c,cx+Math.cos(a2)*r0,cy+Math.sin(a2)*r0*.94,a2,ln,
        RR*(.016+.024*hash(sd*5.7)),"white",Math.max(0,.50+.50*q));}}
  // ── ⑤ 펑 — 참았다 터진다.
  if(burst>0&&burst<1){
    const f=burst,e=ease(f);
    c.save();c.globalCompositeOperation="lighter";
    // 큰 번짐 — **퍼졌다가 몸 크기로 접힌다.** 퍼지기만 하고 끝나면 화면에서
    // 빛이 「빠져나간다」로 읽혀 뒤에 서는 몸과 이어지지 않는다.
    const back=Math.max(0,(e-.5)/.5);
    const RG=(RR*(.8+e*3.4))*(1-back)+RR*.62*back;
    const g=c.createRadialGradient(cx,cy,0,cx,cy,RG);
    g.addColorStop(0,A("#FFFFFF",Math.max(0,(1-f)*.98)));
    g.addColorStop(.40,A("#FFFFFF",Math.max(0,(1-f)*.62)));
    g.addColorStop(1,A(WH[1],0));
    c.fillStyle=g;c.beginPath();c.arc(cx,cy,RG,0,TAU);c.fill();c.restore();
    // 충격파 — **얇게, 빨리 사라진다.**
    //
    // ⚠️ 굵은 고리 두 겹 + 중심에서 뻗는 빛살 16 을 같이 두었더니 칸을 가득 채운
    // **수레바퀴**가 됐다(2026-08-10 렌더). 「펑」은 빛의 사건이지 도형이 아니라,
    // 선은 얇게·짧게 두고 밝기로만 때린다.
    for(const s2 of[0,.14]){
      const e2=Math.max(0,e-s2);if(e2<=0)continue;
      const fade=Math.max(0,1-f*1.6);                 // 고리는 절반쯤에서 이미 없다
      if(fade<=.02)continue;
      const Q=[];
      for(let k=0;k<=48;k++){const aa=k/48*TAU;
        const rr=RR*(.25+e2*1.9)*(1+.05*Math.sin(aa*5+t*2));
        Q.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
      celStroke(c,Q,(s2?2.0:4.0)*fade+1.0,"white",fade*(s2?.45:.85));}
    {const fade=Math.max(0,1-f*2.0);                  // 뻗는 빛살 — 초반에만
      for(let i=0;i<10;i++)
        celSpike(c,cx,cy,i/10*TAU+t*.6,RR*(.5+e*1.5),RR*.045*fade,"white",fade*.8);}
    // 흩어지는 부스러기 — **나갔다가 돌아온다.**
    //
    // ⚠️ 여기가 이음새의 핵심이다. 바깥으로만 보내면 빛은 사라지고 몸은 따로
    // 켜져 두 사건이 된다. 절반쯤(e>.5)에서 **중심으로 되당기면** 「흩어진
    // 빛이 모여 몸이 됐다」가 한 동작으로 읽힌다 — 새 그림을 그리는 게 아니라
    // 이미 있는 것의 **방향만** 바꾸는 것이다.
    for(let i=0;i<44;i++){
      const a2=i/44*TAU+hash(i*3.1)*.5;
      const out=RR*(.7+1.2+.9*hash(i*5.3));         // 가장 멀리 나가는 자리
      // 나감(0→.5)은 ease 로 빠르게, 되돌아옴(.5→1)은 몸 크기까지 조인다.
      const go=Math.min(1,e/.5), back=Math.max(0,(e-.5)/.5);
      const d=(RR*.7+(out-RR*.7)*ease(go))*(1-back)+RR*.34*back;
      const al=Math.max(0,1-f)*(1-back*.35);        // 돌아오며 옅어진다
      celSpike(c,cx+Math.cos(a2)*d,cy+Math.sin(a2)*d*.92,
        a2+(back>0?Math.PI:0),                      // 되돌 때는 머리가 안쪽
        RR*(.08+.10*hash(i*7.7))*(1-f*.5),RR*.026,"white",al);}}
  // ── ⑥ 안착 — 백광 **발현 전**. 확정된 그림을 그대로 부른다.
  if(land>0){
    // **알파만 올리지 않는다.** 제자리에서 켜지면 「등장」이고, 0.72 에서
    // 1.0 으로 모여들며 서면 「빛이 뭉쳐 몸이 됐다」가 된다 — 위의 되돌아오는
    // 부스러기와 **같은 방향**이라 둘이 한 동작으로 읽힌다.
    // ⚠️ 주기 끝에서 **넘겨준다.** 백광이 알파 1 그대로 사라지고 다음 주기의
    // 시작 몸이 0 에서 올라오면 그 사이가 캄캄해진다(실측: 주기이음 도약 1.0).
    // 마지막 4%에서 내려 시작 몸의 페이드인과 **겹치게** 한다 — 둘이 교차하면
    // 이음새가 사라진다.
    const q=ease(Math.min(1,land*1.8))*Math.min(1,(1-u)/.04);
    const sc=.72+.28*q;
    c.save();c.globalAlpha=q;
    c.translate(cx,cy);c.scale(sc,sc);c.translate(-cx,-cy);
    try{fvBody(c,t,dt,W,H,st.sub,"white",(FVFIX.white.base||1)-1);}catch(e){}
    c.restore();}
  // 시작이 무엇이었는지 — 시안 전용 표시.
  c.save();c.globalCompositeOperation="source-over";
  c.fillStyle="rgba(148,148,162,.85)";c.font="10px monospace";
  c.fillText(S0.nm+" → 백광",6,H-7);c.restore();
  drawP(c,st);
},
/// 백광 **발현**의 순간 — 감고 있던 철사가 깨지고 빛이 풀려난다.
///
/// 사용자 그림(2026-08-10): "백광 상태에서 백광을 감싸고 있던 사슬들 사이로
/// 빛이 다시 뿜어져 나오기 시작하며 **균열**이 가고, 감싸는 철사들이
/// **느슨해지고 파괴**되면서 백광 발현의 디자인으로 탈바꿈."
///
/// 앞의 변신(morphWhiteFrom)이 **바깥에서 안으로**(빛이 몰려와 갇힌다)라면,
/// 이건 **안에서 바깥으로**(갇힌 것이 풀린다)다. 둘이 정반대라 한 쌍이 된다.
///
///   ① 갇힘   백광 발현 전 — 가시 철사가 감고 있다(확정 그림 그대로)
///   ② 샘     철사 **사이로** 빛이 뿜어 나오기 시작한다
///   ③ 균열   철사에 금이 간다 — 밝은 선이 갈라져 번진다
///   ④ 느슨   감긴 것이 벌어진다. 반경이 커지고 가시가 눕는다
///   ⑤ 파괴   철사가 조각나 튕겨 나가고 빛이 터진다
///   ⑥ 발현   백광 발현(아직 안 골랐으면 발현 전으로 폴백)
morphWhiteMani(c,t,dt,W,H,st){
  const cx=W/2,cy=H/2,RR=Math.min(W,H)*.30;
  const P=3.4,u=saw(t,P),WH=TONE.white;
  stepP(st,dt);
  st.sub=st.sub||{p:[]};
  const seg=(a2,b2)=>Math.max(0,Math.min(1,(u-a2)/(b2-a2)));
  const leak=seg(.10,.40), crack=seg(.34,.58), loose=seg(.52,.72),
        brk=seg(.70,.88), land=seg(.86,1);
  // ── ① 갇힘 — 확정된 「발현 전」을 그대로 부른다. ④부터는 내 그물이 잇는다.
  // ── ① 갇힘 + ④ 느슨 — **같은 확정 그림 하나**다. 벌어지는 것은 배율이고,
  //    부서지는 것은 알파다. 둘을 따로 그리면 겹쳐서 진해진다.
  const open=1+.55*ease(loose)+(brk>0?.75*ease(brk):0);
  const preA=Math.max(0,1-(brk>0?brk*1.3:0));
  if(preA>.02){
    c.save();c.globalAlpha=preA;
    c.translate(cx,cy);c.scale(open,open);c.translate(-cx,-cy);
    try{fvBody(c,t,dt,W,H,st.sub,"white",(FVFIX.white.base||1)-1);}catch(e){}
    c.restore();}
  // ── ② 샘 — 철사 **사이로** 뿜어 나온다. 안쪽이 먼저 밝아진다.
  if(leak>0&&brk<=0){
    const q=ease(leak);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*(.55+.45*q));
    g.addColorStop(0,A("#FFFFFF",Math.max(0,.20+.55*q)));
    g.addColorStop(.6,A(WH[1],Math.max(0,.12+.30*q)));
    g.addColorStop(1,A(WH[1],0));
    c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*(.55+.45*q),0,TAU);c.fill();c.restore();
    // 새는 줄기 — 자리가 계속 바뀐다. 「사이로」가 보이려면 **틈**이라야 한다.
    const n=4+((q*14)|0);
    for(let i=0;i<n;i++){
      const sd=i*4.31+Math.floor(t*8)*.7;
      const a2=hash(sd)*TAU;
      const r0=RR*(.86+.14*hash(sd*2.1));
      const ln=RR*(.12+.62*q*hash(sd*3.1));
      celSpike(c,cx+Math.cos(a2)*r0,cy+Math.sin(a2)*r0*.94,a2,ln,
        RR*(.018+.024*hash(sd*5.7)),"white",Math.max(0,.50+.50*q));}}
  // ── ③ 균열 — 금이 **갈라져 번진다.** 가지치기라야 「금」이지 선이 아니다.
  if(crack>0&&brk<=0){
    const q=ease(crack);
    const br=(x,y,a2,len,w,d,sd)=>{
      const ex=x+Math.cos(a2)*len, ey=y+Math.sin(a2)*len*.94;
      celStroke(c,[[x,y],[x+Math.cos(a2+.25)*len*.55,y+Math.sin(a2+.25)*len*.55*.94],[ex,ey]],
        w,"white",Math.max(0,(.85-d*.2)*q));
      if(d<2)for(let sg=-1;sg<=1;sg+=2)
        br(ex,ey,a2+sg*(.45+hash(sd*7.7)*.4),len*.62,w*.6,d+1,sd*3+sg+1);};
    for(let i=0;i<5;i++){
      const a2=i/5*TAU+hash(i*3.1)*.6;
      const r0=RR*.92;
      br(cx+Math.cos(a2)*r0,cy+Math.sin(a2)*r0*.94,a2,RR*.30*q,3.0,0,i+1);}}
  // ── ⑤ 파괴 — 빛이 터진다. 다만 ①의 「갇힘」이 풀리는 것이라 **바깥으로** 간다.
  if(brk>0&&brk<1){
    const f=brk,e=ease(f);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*(.9+e*3.0));
    g.addColorStop(0,A("#FFFFFF",Math.max(0,(1-f)*.92)));
    g.addColorStop(.42,A("#FFFFFF",Math.max(0,(1-f)*.52)));
    g.addColorStop(1,A(WH[1],0));
    c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*(.9+e*3.0),0,TAU);c.fill();c.restore();
    const Q=[];
    for(let k=0;k<=48;k++){const aa=k/48*TAU;
      const rr=RR*(.4+e*1.8)*(1+.05*Math.sin(aa*5+t*2));
      Q.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
    celStroke(c,Q,11*(1-f)+1.5,"white",Math.max(0,1-f));
    for(let i=0;i<18;i++)
      celSpike(c,cx,cy,i/18*TAU+t*.5,RR*(.6+e*2.6),RR*.07*(1-f),"white",
        Math.max(0,(1-f)*.88));}
  // ── ⑥ 발현 — 확정되면 그것을, 아직이면 발현 전으로 폴백.
  if(land>0){
    const q=ease(Math.min(1,land*1.8));
    // ⚠️ 확정 발현은 **자기 주기(2.4초)** 를 따로 돈다. 그냥 부르면 착지하는
    // 순간이 그 주기의 조임 구간에 걸려 「발현했는데 조용한」 그림이 나온다.
    // 시간을 만들어 넘겨 **팡(.58) → 파동(.98)** 구간을 지나게 맞춘다.
    const tw=2.4*(.56+.42*Math.min(1,land*1.5));
    c.save();c.globalAlpha=q;
    try{fvBody(c,tw,dt,W,H,st.sub,"white",(FVFIX.white.mani||1)-1);}catch(e){}
    c.restore();}
  drawP(c,st);
},
whiteBase(c,t,dt,W,H,st){
  if(FVFIX.white.base==null||!FVSET.white.length)return;
  fvBody(c,t,dt,W,H,st,"white",FVFIX.white.base-1);},
whiteMani(c,t,dt,W,H,st){
  if(FVFIX.white.mani==null||!FVSET.white.length)return;
  fvBody(c,t,dt,W,H,st,"white",FVFIX.white.mani-1);},
preFire  (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"ember",1);},
fire     (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"ember");},
preIce   (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"frost",1);},
preBolt  (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"volt",1);},
prePoison(c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"toxin",1);},
preGale  (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"gale",1);},
preShade (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"shadeA",1);},
ice  (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"frost");},
bolt (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"volt");},
poison(c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"toxin");},
gale (c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"gale");},
shade(c,t,dt,W,H,st){ELEM.elemBody(c,t,dt,W,H,st,"shadeA");},

split(c,t,dt,W,H,st){const cx=W/2,cy=H/2;
  // 융화는 **제3의 물질**이다. 반씩 붙이면 두 개를 나열한 것이지 합친 게 아니다
  // (2026-08-08 반려). 불과 얼음이 만나면 나오는 것은 절반씩이 아니라
  // **푸른 불꽃과 증기**다 — 불의 형태에 얼음의 색, 그 안을 떠도는 결정.
  // 조합마다 이렇게 고유한 그림을 하나씩 준다(쌍이 여섯이니 여섯 장).
  if(R()<dt*14){const a=R()*TAU,r=30+R()*40;
    emit(st,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,1,{k:"frost",sp:8,r:2.6,life:1.3,g:-40,spikeP:.85});}
  stepP(st,dt);
  const by=cy+16;
  // 증기 — 몸을 감싸고 위로 흐르는 옅은 소용돌이. 제3의 물질이라는 신호.
  c.save();c.globalCompositeOperation="lighter";
  for(let k=0;k<3;k++){const P2=[];
    for(let i=0;i<=26;i++){const q=i/26;
      const a=k/3*TAU+q*3.0-t*1.1;
      const r=(46-q*26)*(1+.12*Math.sin(q*7+t*2));
      P2.push([cx+Math.cos(a)*r,by-18-q*46+Math.sin(q*5+t)*4]);}
    c.strokeStyle="rgba(150,225,255,.16)";c.lineWidth=11;c.lineCap="round";
    c.beginPath();P2.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();
    c.strokeStyle="rgba(220,248,255,.22)";c.lineWidth=3;c.stroke();}
  c.restore();
  // 붉은 기는 **불꽃 자신의 바깥 톤**으로 넣는다. 붉은 도형을 따로 얹었더니
  // "빨간 색종이를 중간에 껴넣은" 그림이 됐다(2026-08-08 반려). 섞임은
  // 층이 아니라 계조여야 한다 — 실루엣의 가장자리에만 열이 남는다.
  const COLD=["#5A1024","#57C8F0","#EAFBFF"];
  for(let i=0;i<3;i++){const sd=i*2.11,off=(i-1)*13;
    const hh=(58+22*hash(sd))*(.88+.16*Math.sin(t*2.1+i));
    firePath(c,cx+off,by,18+5*hash(sd+1.3),hh,t,sd,i*1.7);
    c.fillStyle=A(COLD[0],.9);c.fill();
    firePath(c,cx+off,by-2,15+4*hash(sd+1.3),hh*.97,t,sd,i*1.7);
    c.fillStyle=A(COLD[1],.95);c.fill();}
  for(let i=0;i<3;i++){const sd=i*2.11+7.3,off=(i-1)*11;
    const hh=(40+16*hash(sd))*(.85+.2*Math.sin(t*2.7+i*1.4));
    firePath(c,cx+off+Math.sin(t*1.9+i)*3,by-4,8.5+3*hash(sd),hh,t*1.22,sd,i*.9);
    c.fillStyle=A(COLD[2],1);c.fill();}
  // 불꽃 안을 떠도는 얼음 결정 — "얼음이 아직 안 녹았다"가 이 조합의 정체다
  for(let i=0;i<5;i++){const ph=(t*.55+i*.2)%1;
    const x=cx+(hash(i*3.7)-.5)*46+Math.sin(t*1.7+i)*6;
    const y=by-10-ph*72,sc=(1-ph*.55)*(6+3*hash(i*9.1));
    c.save();c.translate(x,y);c.rotate(t*1.3+i);
    const hx=(rr,col)=>{c.beginPath();
      for(let j=0;j<6;j++){const a=j/6*TAU;
        j?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}
      c.closePath();c.fillStyle=col;c.fill();};
    hx(sc,A(COLD[0],(1-ph)*.9));hx(sc*.62,A(COLD[1],(1-ph)*.95));hx(sc*.3,A(COLD[2],1-ph));
    c.restore();}
  // 밑동 — 서리가 낀 자리
  celSplash(c,cx,by+2,20,9,3,"frost",.8,.55);
  drawP(c,st);},

// ── 변신 — 속성을 먹는 순간 ───────────────────────────────────────────────
// 응축(0~.28) → 파열(.28~.40) → 안착(.40~1). 즉시 바뀌면 아무 사건이 아니다.
//
// ⚠️ **안착 단계는 속성 도형을 복사하지 않는다.** 처음엔 각 속성의 그림을
// 여기에 다시 써 넣었는데, 속성 디자인이 바뀔 때마다 변신만 옛 그림으로
// 남아 계속 낡았다(2026-08-08). 지금은 [ELEM] 의 함수를 **그대로 불러**
// 배율·알파만 얹는다 — 속성이 바뀌면 변신도 저절로 따라온다.
morph(c,t,dt,W,H,st){const cx=W/2,cy=H/2;stepP(st,dt);
  const P=3.2,u=saw(t,P);
  const ORDER=["ember","frost","volt","toxin","gale","shade"];
  const ELEMOF={ember:"fire",frost:"ice",volt:"bolt",toxin:"poison",
                gale:"gale",shade:"shade"};
  const TO=ORDER[Math.floor(t/P)%ORDER.length];
  const con=u<.28?u/.28:1,burst=u>=.28&&u<.40?1-(u-.28)/.12:0,
        land=u<.40?0:Math.min(1,(u-.40)/.34);
  if(u<st.pu)emit(st,cx,cy,26,{k:TO,sp:300,r:3.4,life:.7,spikeP:.6});
  st.pu=u;
  if(u<.28){ // 응축 — 링이 안으로 조여들고 창이 안쪽을 향한다
    const p=ease(con);
    celHoop(c,cx,cy,74*(1-p*.72)+8,1,t*2,5,"gold",.9);
    celHoop(c,cx,cy,74*(1-p*.72)+8,.3,-t*3,4,"gold",.7);
    for(let i=0;i<8;i++){const a=i/8*TAU-t*4,r=86*(1-p)+16;
      celSpike(c,cx+Math.cos(a)*r,cy+Math.sin(a)*r,a+Math.PI,20+16*p,5,"gold",.9);}
    // **각성 전은 백광이라야 한다.** 여기 주황을 박아 두면 변신이
    // 「주황 → 파랑」처럼 읽혀, 색을 얻는 순간이 아니라 **색을 바꾸는**
    // 순간이 된다. TONE 에서 읽어 팔레트와 갈라지지 않게 둔다.
    emberCore(c,t,cx,cy,20*(1-p*.42),TONE.gold);}
  if(burst>0){
    celHoop(c,cx,cy,W*.26*(1.6-burst),1,0,13*burst+2,TO,burst);
    celSplash(c,cx,cy,50*burst,12,3,TO,burst);
    c.fillStyle=`rgba(255,255,255,${.55*burst})`;c.fillRect(0,0,W,H);}
  if(land>0){ // 안착 — **현재 속성 함수를 그대로** 불러 배율만 얹는다
    const p=ease(land);
    st.sub=st.sub||{p:[]};
    c.save();c.globalAlpha=Math.min(1,land*1.7);
    c.translate(cx,cy);c.scale(p,p);c.translate(-cx,-cy);
    ELEM[ELEMOF[TO]](c,t,dt,W,H,st.sub);
    c.restore();}
  drawP(c,st);},
};

// ── 바람 — **초승달 획.** 나선은 낙서로 읽힌다 ─────────────────────────
// 가는 나선 네 가닥은 「바람」이 아니라 「긁힌 자국」이었다(2026-08-08 반려).
// 이 계열의 바람은 **굵은 초승달 획**이 서로 다른 반경·기울기로 겹쳐 도는
// 것이다 — 획 자체가 리본이라 양 끝이 저절로 뾰족해지고, 중간이 굵어
// 「지나갔다」가 남는다.
//
// 그리고 바람의 정체는 **끌어당김**이다. 획은 안쪽으로 조여들고, 티끌은
// 코어로 빨려들며 사라진다 — 그림이 곧 기능 설명이 된다.
function windStroke(c,t,cx,cy,r,squash,rot,span,w,k,a){
  const P2=[],seg=16;
  for(let i=0;i<=seg;i++){const q=i/seg,ang=-span/2+span*q;
    const rr=r*(1-q*.16);                       // 끝으로 갈수록 안으로 조인다
    const x=Math.cos(ang)*rr,y=Math.sin(ang)*rr*squash;
    P2.push([cx+x*Math.cos(rot)-y*Math.sin(rot),cy+x*Math.sin(rot)+y*Math.cos(rot)]);}
  celRibbon(c,P2,w,k,a);
}
function windEmblem(c,t,cx,cy,k,s=1,a=1){
  const S=[[62,.34,1.00,2.6,13],[52,.78,-1.35,2.2,10],[42,.52,.62,3.1,8],[70,.20,-.72,1.7,7]];
  S.forEach((v,i)=>{const[r,sq,dir,span,w]=v;
    windStroke(c,t,cx,cy,r*s,sq,dir*1+t*(.9+i*.22)*Math.sign(dir),span,w*s,k,a*(i?.8:1));});
  // 빨려드는 티끌 — 바깥에서 나서 코어에서 사라진다
  for(let i=0;i<9;i++){const ph=(t*.85+i/9)%1,ang=i/9*TAU-t*2.1-ph*2.4;
    const rr=(78-ph*66)*s;
    const x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr*.7;
    celSpike(c,x,y,ang+Math.PI+1.5,(9+5*hash(i*3.7))*s*(1-ph*.4),2.4*s,k,(1-ph)*.9*a);}
}

// ── 빔 끝단 — **덜어내는 쪽이 답이었다** ────────────────────────────────
// 별 다각형을 얹으면 스티커, 리본을 사방으로 뿌리면 지저분. 두 번 다 반려됐다
// (2026-08-08). 레퍼런스를 다시 보면 빔 끝은 화려한 게 아니라 **절제**돼 있다
// — 얇고 긴 곡선 획 한둘이 축을 감고 지나갈 뿐이다.
//
// 그래서 규칙은 「더 그리지 말 것」이다:
//   ① 획은 **둘**. 길이가 서로 다르고, 축을 감아 도는 곡선이다.
//   ② 폭은 빔의 1/4 이하. 굵으면 즉시 별개의 물건으로 분리돼 보인다.
//   ③ 원반·별·방사는 **없다**. 부딪힌 면은 빔 자신의 둥근 마감이 이미 말한다.
function beamEnd(c,t,x,y,ang,size,k,a=1,dir=1){
  for(let i=0;i<2;i++){
    const ph=t*(1.7+i*.6)+i*2.1;
    const swing=Math.sin(ph)*.9;                    // 감아 도는 위상
    const L=size*(i?.62:1)*(.82+.18*Math.sin(ph*1.7));
    const base=ang+Math.PI/2*(i?1:-1)*dir;
    const P2=[];
    for(let s2=0;s2<=6;s2++){const q=s2/6;
      const aa=base+swing*q*1.5-dir*q*q*1.1;        // 끝으로 갈수록 축 쪽으로 말린다
      P2.push([x+Math.cos(aa)*L*q,y+Math.sin(aa)*L*q]);}
    celRibbon(c,P2,size*.16,k,a*(i?.7:.95));}
}

// ── 융화 10 — **제3의 속성이 태어난다** ─────────────────────────────────
//
// 2026-08-09 전면 재설계. 이전 안은 「두 속성이 만나 제3의 물질」이라 써 놓고
// 실제로는 **두 모티프를 나란히 얹었을 뿐**이었다. 그래서 몸을 바꿀지 말지가
// 끝까지 안 정해졌고, 여섯이 제각각이 됐다(몸 색 네 가지·위치 제각각).
//
// 사용자가 문법을 바꿨다: **염+빙 = 수(水).** 섞이는 게 아니라 **제3의 속성이
// 된다.** 그러면 「몸을 바꾸나」를 물을 필요가 없다 — 속성이 바뀌었으니 몸이
// 바뀌는 게 당연하고, 어정쩡한 「둘레 둘 나란히」가 사라진다.
//
// 그래서 열은 **여섯 속성과 같은 문법**으로 그린다: 각진 별 코어 + 둘레 모티프
// 하나. 코어는 열 전부 같다 — 속성이 바뀌어도 같은 사람이다.
//
// ⚠️ **스펙의 「6칸만 채운다」를 10칸으로 연다.** 빈칸을 두던 이유가 "4속성
// 보유 시 5쌍이 동시에 돈다"였는데, **동시 보유 2칸**이 생기며 도는 쌍이 항상
// 1개가 되어 그 이유가 사라졌다. 그리고 비워뒀던 넷(염+독·빙+독·뇌+독·뇌+바람)이
// 이 문법에서는 **제일 이야기가 좋은 것들**을 낳는다(연·역·마·뢰명).
//
// 색 규칙: **부모 색을 평균 내지 않는다.** 평균은 언제나 부모 사이에 끼어
// 부모와 안 갈린다. 제3의 속성은 부모에 없던 축을 하나씩 갖는다 —
// 탁함 · 금속 · 창백 · 자홍 · 극단 명도.
//
// 모티프 계약: `fn(c,cx,cy,RR,t,tn)` — **둘레만** 그린다. 광휘·코어·티끌은
// [fvBody] 가 얹으므로 여기서 그리지 않는다.
const FVSET={};
// 무속성·백광은 융화가 아니지만 **같은 표에서 고르는 게 편하다.** 무속성의
// 기본은 이미 있는 「각성 전」(코어만) 이므로 그것을 1안으로 넣어 둔다.
FVSET.gold=[["코어만 — 둘레가 비어 있는 것이 정체다",function(c,cx,cy,RR,t,tn){}]];
FVSET.white=[];
const FVNAME={
  gold:"무속성 — 색이 없는 빛", white:"백광 白光 — 다섯을 다 거친 것",
  aqua:"수 水 · 염+빙",      blast:"플라즈마 漿 · 염+뇌",     smoke:"연 煙 · 염+독",
  fstorm:"불씨 火種 · 염+바람", magnet:"자 磁 · 빙+뇌",   plague:"역 疫 · 빙+독",
  snow:"설 雪 · 빙+바람",     numb:"마 痲 · 뇌+독",      thunder:"뢰명 雷鳴 · 뇌+바람",
  murk:"장 瘴 · 독+바람"};

// ── 융화의 시너지 — **무엇을 세게 만드는가** (2026-08-11 사용자 확정) ────────
//
// 실측이 문제를 먼저 보여줬다: 속성 빌드가 기준 빌드보다 **덜 깬다**
// (S1 −4.0%p · S2 −5.5%p · S3 −10.5%p). 3택에서 속성을 집는 만큼 능력치·무기
// 레벨업을 포기하는데 속성이 주는 값이 그 포기보다 작아서다. 시안은 속성
// 18칸·융화 10칸·발현 8축을 전부 「속성을 모으는 것」 위에 그려 놨는데
// 게임에서는 모을수록 손해였다.
//
// 이 표가 그 해독제다 — **융화가 특정 계열 스킬을 세게 만든다.** 그러면
// 「속성을 모은다 → 스킬이 세진다」가 한 줄로 이어져 기회비용이 회수된다.
//
// 설계 원칙 셋:
//   ① **부모를 기계적으로 잇지 않는다.** 융화는 「제3의 속성」이라는 기존
//      규약이 있다 — 그 융화의 **정체**가 대상을 정한다. 불씨가 바람을 미는
//      것은 「바람이 불씨를 나른다」라서지 부모라서가 아니다.
//   ② **같은 계열을 미는 융화가 여럿이면 %가 아니라 「무엇을」이 달라야 한다.**
//      수치만 다르면 더 좋은 것 하나만 남고 나머지는 죽는다. 독을 미는 넷이
//      각각 중첩·지속·피해·얕게로 갈리는 것이 이 원칙이다.
//   ③ 버프는 그 속성이 **부여된 무기**에 붙는다. 보유만으로 붙으면 「부여」라는
//      결정이 무의미해진다.
//
// ⚠️ **타르는 융화 10 에 없다**(TONE 에만 남은 잔재). 「바람+독」은 장 瘴 이
// 정확히 그 조합이라 그쪽으로 넣었다.
const FVSYN={
  aqua   :["뇌","피해 +35%","적을 적신다 — 젖음이 뇌 ×2 의 조건이라 그 위에 얹힌다"],
  blast  :["염","연소 피해 +40%","물질의 제4상태, 불보다 뜨겁다"],
  smoke  :["독","중첩 상한 +1","타는 독 — 쌓이는 것이 정체다"],
  fstorm :["바람","피해 +30% · 넉백 +50%","바람이 불씨를 나른다"],
  magnet :["뇌","연쇄 +1","끌어당김 — 전기가 한 번 더 건너뛴다"],
  plague :["독","지속 +60%","병은 오래 간다"],
  snow   :["빙","감속 폭 +40%","눈은 발을 묶는다"],
  numb   :["독","피해 +45%","마비 — 한 방이 세다"],
  thunder:["바람","범위 +35%","소리는 멀리 간다"],
  murk   :["독·바람","둘 다 +20%","독기는 넓게 퍼지되 얕다"]};
const FVWHY={
  gold:"**둘레가 비어 있는 것**이 정체다. 발현하면 색 없이 **형태만** 얻는다",
  white:"무속성의 정반대 — **둘레가 꽉 찬** 흰 코어. 발현 전/발현 두 벌을 갖는다",
  aqua:"불이 얼음을 녹인다 — 적을 **젖게** 만들어 뇌 피해 ×2 의 조건이 된다",
  blast:"**물질의 제4상태.** 불도 전기도 아닌 것이라 색부터 불 계열을 벗어난다",
  smoke:"**타는 독은 연기가 된다** — 상극이라 서로 죽이던 둘이 다른 것이 된다",
  fstorm:"바람이 불씨를 나른다. **어두운 바탕에 점만 탄다** — 밝은 덩어리는 불이다",
  magnet:"완전 전도 → 초전도 → **자기력.** 무기와 무관해 「전도」의 구멍이 막힌다",
  plague:"차가운 독은 안 썩고 **퍼지는 병**이 된다 — 창백한 것이 정체",
  snow:"쌓인다 — 열 중 유일하게 **바닥에 남는 것**이 있다",
  numb:"**전기는 신경을 타고 독은 신경을 끊는다** — 둘이 같은 길을 쓴다",
  thunder:"번개 + 바람 = **천둥.** 열 중 유일하게 「들리는 것」이라 황동빛",
  murk:"독이 바람을 탄다 — 연(煙)이 **오르는 것**이고 이쪽은 **떠도는 것**"};
const FVPICK={aqua:0,blast:0,smoke:0,fstorm:0,magnet:0,plague:0,snow:0,
  numb:0,thunder:0,murk:0};

// ── 1안 — 기준 손. 2~5안은 이 문법을 지키되 **아예 다른 컨셉**이어야 한다 ──

FVSET.aqua=[["매끄러운 파문 — 열 중 유일하게 각지지 않는다",
function(c,cx,cy,RR,t,tn){
  for(let k=0;k<3;k++){const ph=(t*.34+k/3)%1,r=RR*(.52+ph*.62),P2=[];
    for(let i=0;i<=30;i++){const a=i/30*TAU,w=1+.07*Math.sin(a*3+t*1.6+k);
      P2.push([cx+Math.cos(a)*r*w,cy+Math.sin(a)*r*w]);}
    celStroke(c,P2,5.5*(1-ph)+1.2,tn,(1-ph)*.8);}
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,cy-RR*.2,0,cx,cy,RR*.9);
  g.addColorStop(0,A(TONE[tn][2],.22));g.addColorStop(1,A(TONE[tn][1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.9,0,TAU);c.fill();c.restore();}]];

FVSET.blast=[["**갇힌 이온 기체** — 가닥이 껍질에서 코어로 계속 다시 그어진다",
function(c,cx,cy,RR,t,tn){
  // ⚠️ 이 자리는 세 번 갈아엎었다(2026-08-09).
  //  ① 「폭 爆」 — **폭발은 사건**이라 둘레로 그리면 반복 재생으로 보인다.
  //  ② 「백열」 방사 판 — **태양 문양·톱니**가 됐다.
  //  ③ 「백열」 껍질 — 여전히 억지. 원인은 그림이 아니라 **색**이었다:
  //     염(20°)·불씨(15°)가 이미 불 계열을 채웠는데 여기 하나를 더 두니
  //     셋이 한 덩어리로 읽혔다. **불에서 나가야** 풀린다.
  //
  // **플라즈마 漿.** 고체·액체·기체가 아닌 **물질의 제4상태**라 「제3의 속성」
  // 이라는 컨셉에 그대로 맞고, 실제 플라즈마 구가 청자색이라 물리에도 맞다.
  // 부모 둘이 그대로 보인다: **경로가 계속 다시 굴려지는 것**이 뇌(雷)이고,
  // **가닥이 뜨겁게 흔들리는 것**이 염(炎)이다.
  const T=TONE[tn];
  // 껍질 — 갇혀 있다는 신호. 유리구처럼 아주 옅다. 없으면 그냥 번개다.
  celHoop(c,cx,cy,RR*1.02,1,t*.14,2.2,tn,.34);
  celHoop(c,cx,cy,RR*.99,1,-t*.09,1.1,tn,.20);
  c.save();c.globalCompositeOperation="lighter";
  const sh=c.createRadialGradient(cx,cy,RR*.5,cx,cy,RR*1.04);
  sh.addColorStop(0,A(T[1],0));sh.addColorStop(.82,A(T[1],.06));
  sh.addColorStop(1,A(T[2],.16));
  c.fillStyle=sh;c.beginPath();c.arc(cx,cy,RR*1.04,0,TAU);c.fill();c.restore();
  // 가닥 — **0.1초마다 경로가 다시 굴려진다.** 가만히 있으면 그건 금이지
  // 방전이 아니다(뇌의 확정 문법 그대로). 몇 가닥만 켜진다.
  const sd=(t*10)|0;
  for(let i=0;i<7;i++){
    if(hash(sd*3.1+i*7.7)>.55)continue;
    const a0=(i/7)*TAU+hash(sd*5.3+i)*.9;
    const wob=Math.sin(t*7.3+i*2.1)*.12;      // 염 — 뜨겁게 흔들린다
    const P2=[[cx,cy]];
    for(let k=1;k<=5;k++){const q=k/5;
      const aa=a0+(hash(sd+i*3.3+k*1.7)-.5)*.85*q+wob*q;
      P2.push([cx+Math.cos(aa)*RR*q,cy+Math.sin(aa)*RR*q]);}
    celStroke(c,P2,3.4-1.4*hash(i*2.9),tn,.9);
    // 껍질에 닿은 끝 — 유리에 붙은 발. 플라즈마 구의 정체다.
    const e=P2[P2.length-1];
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(e[0],e[1],0,e[0],e[1],9);
    g.addColorStop(0,A(T[2],.9));g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(e[0],e[1],9,0,TAU);c.fill();c.restore();}
  // 코어 광휘 — 가닥이 모이는 곳. 안에서 밖으로 밀려 나가는 압력.
  c.save();c.globalCompositeOperation="lighter";
  const g2=c.createRadialGradient(cx,cy,0,cx,cy,RR*.72);
  g2.addColorStop(0,A(T[2],.36+.10*Math.sin(t*3.1)));
  g2.addColorStop(.5,A(T[1],.18));g2.addColorStop(1,A(T[1],0));
  c.fillStyle=g2;c.beginPath();c.arc(cx,cy,RR*.72,0,TAU);c.fill();c.restore();}]];
FVSET.smoke=[["피어오른다 — 도는 게 아니라 오른다",
function(c,cx,cy,RR,t,tn){
  for(let i=0;i<7;i++){const ph=(t*.30+i/7)%1;
    const x=cx+Math.sin(t*.8+i*2.1)*RR*.42*(.3+ph),y=cy+RR*.55-ph*RR*1.45;
    const r=RR*(.16+ph*.36);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,A(TONE[tn][1],.26*(1-ph)));
    g.addColorStop(.6,A(TONE[tn][0],.20*(1-ph)));
    g.addColorStop(1,A(TONE[tn][0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();}
  for(let i=0;i<4;i++){const a=-Math.PI/2+(i-1.5)*.5;
    celSpike(c,cx,cy+RR*.5,a,RR*(.3+.1*Math.sin(t*5+i)),4,tn,.7);}}]];

FVSET.fstorm=[["**꺼질 듯 말 듯 떠다닌다** — 명멸이 불씨의 정체다",
function(c,cx,cy,RR,t,tn){
  // ⚠️ 원래 이 자리는 「화풍 火嵐」(세로 회오리)이었다. 두 번 그려 보고
  // 접었다(2026-08-09) — 회오리는 **기둥**이라 둘레 문법과 축이 어긋났고,
  // 「위로 선다」는 개성이 나머지 아홉과 한 벌로 안 읽혔다.
  //
  // **불씨 火種.** 스펙의 조합 패시브 「비화 飛火」가 원래 이 자리였다:
  // "바람이 불씨를 나른다 — 죽은 자리에서 불이 옮겨붙는다". 이름만 다르지
  // 같은 개념이라 기존 설계와 안 부딪히고, 떠다니는 것이라 둘레에 맞는다.
  //
  // ⚠️ 염(20°)과 색상이 사실상 같다. **밀도로 가른다** — 염은 큰 갈래 여덟이
  // 몸을 꽉 두르고, 불씨는 작은 점들이 **성기게** 흩어진다. 정반대라 갈린다.
  const T=TONE[tn];
  // ⚠️ 「염과 색이 안 갈린다」 반려(2026-08-09). 밀도만으로는 부족했다 —
  // **팔레트를 내렸다.** 불씨는 어둡고, 밝은 것은 **점**뿐이다.
  for(let i=0;i<11;i++){
    const sd=i*7.31;
    // 궤도 — 바람에 실린 것이라 **직선이 아니다.** 두 주기를 겹쳐 흔든다.
    const sp=.20+.16*hash(sd), ph=(t*sp+hash(sd*1.7))%1;
    const a=hash(sd*2.3)*TAU+ph*TAU*(hash(sd*3.9)>.5?1:-1)*.55;
    const rr=RR*(.42+.72*hash(sd*5.1))*(1+.14*Math.sin(t*1.3+i*2.1));
    const x=cx+Math.cos(a)*rr+Math.sin(t*1.9+i)*RR*.12;
    const y=cy+Math.sin(a)*rr*.88+Math.cos(t*1.4+i*1.6)*RR*.10;
    // 명멸 — **꺼질 듯 말 듯.** 이게 없으면 그냥 반딧불이다.
    const bl=Math.max(0,Math.sin(t*(2.4+2.2*hash(sd*4.7))+sd)),
          live=bl*bl*(.35+.65*hash(sd*6.3));
    if(live<.04)continue;
    const sz=1.7+2.9*hash(sd*8.9);
    // 꼬리 — 지나온 자리. 바람에 실렸다는 유일한 증거다.
    const tp=[];
    for(let k=0;k<5;k++){const q=k*.055;
      const a2=a-q*(hash(sd*3.9)>.5?1:-1)*.55*TAU*.24;
      tp.push([cx+Math.cos(a2)*rr+Math.sin(t*1.9-q*4+i)*RR*.12,
               cy+Math.sin(a2)*rr*.88+Math.cos(t*1.4-q*4+i*1.6)*RR*.10]);}
    celStroke(c,tp,sz*.62,tn,live*.34);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,sz*3.2);
    g.addColorStop(0,A(T[2],live*.55));g.addColorStop(.42,A(T[1],live*.20));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,sz*3.2,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(x,y,sz*1.5,5,sd,1.35),A(T[0],live*.9));
    fillPoly(c,jagPoly(x,y,sz*.92,5,sd+1,1.25),A(T[1],live));
    fillPoly(c,jagPoly(x,y,sz*.44,5,sd+2,1.2),A(T[2],live));
    // 이따금 하나가 **확 살아난다** — 옮겨붙기 직전. 옮겨붙음은 사건이지만
    // 「옮겨붙을 낌새」는 상태라, 이것만은 둘레에 그려도 된다.
    if(hash(sd*11.7+((t*.5)|0))>.86&&live>.6)
      for(let k=0;k<5;k++){const a3=k/5*TAU+t*3;
        celSpike(c,x,y,a3,sz*(2.6+1.4*Math.sin(t*8)),sz*.5,tn,live*.8);}}
  // 잔불 — 몸 가까이 아직 타는 것 몇. 불씨가 **어디서 났는지**를 말한다.
  for(let i=0;i<4;i++){const a=i/4*TAU+t*.5;
    const fl=.5+.5*Math.sin(t*6.3+i*2.2);
    celSpike(c,cx+Math.cos(a)*RR*.34,cy+Math.sin(a)*RR*.34,a,RR*(.11+.07*fl),2.6,tn,.20+.22*fl);}}]];
FVSET.magnet=[["자기력선 — 두 극에서 나와 휘어 돌아온다",
function(c,cx,cy,RR,t,tn){
  for(let s=-1;s<=1;s+=2)for(let k=0;k<3;k++){
    const w=RR*(.42+k*.30),P2=[];
    for(let i=0;i<=20;i++){const q=i/20;
      P2.push([cx+Math.sin(q*Math.PI)*w*s,cy-Math.cos(q*Math.PI)*RR*.92]);}
    celStroke(c,P2,3.4-k*.7,tn,.75-k*.16);}
  for(const sy of[-1,1])
    fillPoly(c,jagPoly(cx,cy+sy*RR*.92,RR*.14,5,sy*3.1+t,1.3),A(TONE[tn][2],.9));
  for(let i=0;i<10;i++){const ph=(t*.7+i/10)%1,a=hash(i*7.7)*TAU,r=RR*(1.25-ph*.85);
    c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.9,1.8,0,TAU);
    c.fillStyle=A(TONE[tn][2],(1-ph)*.8);c.fill();}}]];

FVSET.plague=[["번지는 반점 — 불규칙해야 번짐이지 장식이 아니다",
function(c,cx,cy,RR,t,tn){
  for(let i=0;i<9;i++){const sp=hash(i*5.3)*3+1.4;
    const ph=(t/sp+hash(i*9.1))%1,a=hash(i*3.7)*TAU;
    const r=RR*(.30+hash(i*11.3)*.72),g=ease(ph);
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
    const rr=RR*(.10+g*.26),al=(1-ph)*(ph<.18?ph/.18:1);
    fillPoly(c,jagPoly(x,y,rr,7,i*2.1,1.15),A(TONE[tn][0],al*.85));
    fillPoly(c,jagPoly(x,y,rr*.55,7,i*2.1+1,1.1),A(TONE[tn][1],al*.9));}
  // 둘레 — **얼음 장벽.** 밋밋한 고리는 「테두리」일 뿐이라 부모(빙)가 안
  // 보였다. 각진 판이 서 있어야 벽이고, 밝은 빗금이 있어야 얼음이다.
  // 판마다 높이를 달리해 **깨진 채 서 있는** 것으로 읽히게 한다.
  // ⚠️ 판이 **고르게** 서면 얼음벽이 아니라 **톱니바퀴**가 된다(이 속성이
  // 제일 피해야 할 것이 장식이다). 간격·기울기·높이를 전부 흩뜨리고, 몇 장은
  // 아예 부러져 낮게 둔다 — **깨진 채 서 있는** 벽이라야 얼음이다.
  const NB=15;
  for(let i=0;i<NB;i++){
    const jit=(hash(i*13.7)-.5)*(TAU/NB)*.55;          // 간격이 안 고르다
    const broke=hash(i*17.3)<.27?.34:1;                // 부러진 판
    const a=i/NB*TAU+t*.09+jit;
    const h=RR*(.13+.17*hash(i*4.3))*broke, rIn=RR*.80;
    const hw=TAU/NB*(.30+.22*hash(i*23.1));
    const P4=[[cx+Math.cos(a-hw)*rIn,cy+Math.sin(a-hw)*rIn],
              [cx+Math.cos(a-hw*.62)*(rIn+h),cy+Math.sin(a-hw*.62)*(rIn+h)],
              [cx+Math.cos(a+hw*.62)*(rIn+h*(.6+.5*hash(i*9.1))),
               cy+Math.sin(a+hw*.62)*(rIn+h*(.6+.5*hash(i*9.1)))],
              [cx+Math.cos(a+hw)*rIn,cy+Math.sin(a+hw)*rIn]];
    fillPoly(c,P4,A(TONE[tn][0],.92));
    const P5=P4.map(p=>[cx+(p[0]-cx)*.94,cy+(p[1]-cy)*.94]);
    fillPoly(c,P5,A(TONE[tn][1],.85));
    // 빗금 — 얼음 결. 판 안쪽을 가로지르는 밝은 선 하나면 「유리」가 된다.
    if(broke>.5)celStroke(c,[[cx+Math.cos(a-hw*.3)*rIn*1.01,cy+Math.sin(a-hw*.3)*rIn*1.01],
                 [cx+Math.cos(a+hw*.2)*(rIn+h*.8),cy+Math.sin(a+hw*.2)*(rIn+h*.8)]],
      1.6,"frost",.55);}}]];

FVSET.snow=[["쌓인다 — 바닥에 남는 층이 있다",
function(c,cx,cy,RR,t,tn){
  for(let i=0;i<16;i++){const ph=(t*.34+i/16)%1;
    const x=cx+Math.sin(t*.9+i*1.7)*RR*.72+(hash(i*3.3)-.5)*RR*.5;
    const y=cy-RR*.95+ph*RR*1.75,s2=.5+hash(i*7.1)*.6;
    c.save();c.translate(x,y);c.rotate(t*.9+i);
    const hx=(rr,col)=>{c.beginPath();
      for(let j=0;j<6;j++){const b2=j/6*TAU;
        j?c.lineTo(Math.cos(b2)*rr,Math.sin(b2)*rr):c.moveTo(Math.cos(b2)*rr,Math.sin(b2)*rr);}
      c.closePath();c.fillStyle=col;c.fill();};
    hx(5.4*s2,A(TONE[tn][0],.8));hx(3*s2,A(TONE[tn][2],.95));c.restore();}
  const P2=[];for(let i=0;i<=18;i++){const q=i/18,a=Math.PI*.14+q*Math.PI*.72;
    P2.push([cx+Math.cos(a)*RR*1.02,cy+Math.sin(a)*RR*(.80+.06*Math.sin(q*7+t))]);}
  celStroke(c,P2,7,tn,.9);celStroke(c,P2,2.6,"frost",.5);}]];

// ⚠️ 마(痲)는 **감싸지 않는다**(2026-08-10 반려). 신경 가지는 몸에서 뻗어
// 나가는 것이라, 아래쪽 반을 몸 위로 올리면 가지가 얼굴을 덮은 것처럼 보인다.
// 감싸기는 **둘레를 도는 것**에만 맞는다.
FVSET.numb=[["신경 가지 — 끝으로 갈수록 잘게, 하나씩 꺼진다",
function(c,cx,cy,RR,t,tn){
  const br=(x,y,a,len,w,d,sd)=>{
    const ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;
    const dead=hash(sd*3.1+((t*.8)|0))<.22&&d>=1;
    celStroke(c,[[x,y],[x+Math.cos(a+.2)*len*.55,y+Math.sin(a+.2)*len*.55],[ex,ey]],
      w,tn,dead?.16:.9-d*.14);
    if(d<2)for(let s=-1;s<=1;s+=2)
      br(ex,ey,a+s*(.5+hash(sd*7.7)*.35),len*.58,w*.55,d+1,sd*3+s+1);};
  for(let i=0;i<5;i++)br(cx,cy,i/5*TAU+t*.16,RR*.56,4.6,0,i+1);
  const pu=saw(t,1.4);
  celHoop(c,cx,cy,RR*(.2+pu*.9),1,0,3*(1-pu)+.6,tn,(1-pu)*.55);
}]];

FVSET.thunder=[["동심원 충격파 — 소리는 사건이지 상태가 아니다",
function(c,cx,cy,RR,t,tn){
  for(let k=0;k<4;k++){const ph=(t*.62+k/4)%1;
    celHoop(c,cx,cy,RR*(.18+ph*1.05),1,0,6*(1-ph)+.8,tn,(1-ph)*(1-ph)*.95);}
  const s2=saw(t,1.6),hit=s2<.12?1-s2/.12:0;
  if(hit>0)for(let i=0;i<7;i++){const a=i/7*TAU+t;
    celSpike(c,cx+Math.cos(a)*RR*.22,cy+Math.sin(a)*RR*.22,a,RR*.5*hit,5*hit,tn,hit);}
  celHoop(c,cx,cy,RR*.26,1,-t*.5,3.4,tn,.8);}]];

FVSET.murk=[["떠도는 안개 + 안에서 도는 삼엽",
function(c,cx,cy,RR,t,tn){
  c.save();c.globalCompositeOperation="lighter";
  for(let i=0;i<11;i++){const a=i/11*TAU+t*.30+Math.sin(t*.7+i)*.4;
    const r=RR*(.30+.46*hash(i*4.7))*(1+.16*Math.sin(t*1.1+i*2));
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.86,rr=RR*(.24+.14*hash(i*8.3));
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(TONE[tn][1],.24));g.addColorStop(1,A(TONE[tn][0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.restore();
  for(let i=0;i<3;i++){const a=i/3*TAU+t*.24,P2=[];
    for(let j=0;j<=7;j++){const q=j/7,aa=a+q*1.0,r2=RR*(.42+q*.42);
      P2.push([cx+Math.cos(aa)*r2,cy+Math.sin(aa)*r2]);}
    celRibbon(c,P2,5,tn,.6);}}]];

// ── 2~5안 · 불·물 갈래(수·플라즈마·연·불씨) ──────────────────────
FVSET.aqua.push(["맺혀 떨어진다 — 퍼지는 게 아니라 무게가 생긴다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // 겉면 — 매끄러운 물막. 아래쪽이 두꺼운 것은 물이 거기로 모이기 때문이다.
  celHoop(c,cx,cy,RR*.98,.94,0,4.0,tn,.40);
  const bot=[];
  for(let i=0;i<=20;i++){const a=Math.PI*.10+i/20*Math.PI*.80;
    bot.push([cx+Math.cos(a)*RR*.98,cy+Math.sin(a)*RR*.94]);}
  celStroke(c,bot,7.5,tn,.55);
  // 방울 한 알 — 부풀다가(맺힘) 목이 늘어나고(무게) 떨어진다
  const drop=(x,y,rr,tail,al)=>{
    const lobe=(k,col)=>{c.beginPath();
      c.moveTo(x,y-rr*k*(1+tail*2.4));
      c.bezierCurveTo(x+rr*k*.86,y-rr*k*.18,x+rr*k,y+rr*k*.52,x,y+rr*k);
      c.bezierCurveTo(x-rr*k,y+rr*k*.52,x-rr*k*.86,y-rr*k*.18,x,y-rr*k*(1+tail*2.4));
      c.closePath();c.fillStyle=col;c.fill();};
    lobe(1,A(T[0],.95*al));lobe(.62,A(T[1],.97*al));lobe(.26,A(T[2],al));};
  for(let i=0;i<4;i++){
    const ph=(t*.46+hash(i*3.7))%1;
    const a=Math.PI*.22+(i+.5)/4*Math.PI*.56;
    const bx=cx+Math.cos(a)*RR*.96,by=cy+Math.sin(a)*RR*.92;
    if(ph<.48){const g2=ph/.48;                       // 맺히는 중 — 부푼다
      drop(bx,by+RR*.12*g2,RR*.19*g2,g2*.55,.95);}
    else{const f=(ph-.48)/.52,e=ease(f);              // 떨어지는 중 — 목이 끊긴다
      drop(bx+Math.cos(a)*RR*.08,by+RR*(.18+e*.86),
        RR*.19*(1-f*.28),.55-f*.40,1-f*f);}}
  // 떨어진 자리 — 얕은 물결 하나가 조용히 넓어진다
  const wu=saw(t,1.3);
  celHoop(c,cx,cy+RR*1.10,RR*(.18+wu*.70),.22,0,4.0*(1-wu)+.6,tn,(1-wu)*.55);}]);

FVSET.aqua.push(["끊이지 않는 한 줄기 — 고리 여럿이 아니라 하나가 계속 흐른다",
function(c,cx,cy,RR,t,tn){
  // 8자 한 바퀴를 도는 물줄기. 머리와 꼬리가 있어 「흐르는 중」이 된다.
  const path=u=>[cx+Math.sin(u)*RR*1.04,cy+Math.sin(u*2)*RR*.52];
  const head=t*.58;
  const P=[];
  for(let i=0;i<=46;i++)P.push(path((head-i/46*.86)*TAU));
  celRibbon(c,P,10,tn,.95);
  // 반 바퀴 뒤 — 같은 길을 지나간 자국이라 「하나」임이 읽힌다
  const P2=[];
  for(let i=0;i<=28;i++)P2.push(path((head-.54-i/28*.40)*TAU));
  celRibbon(c,P2,5,tn,.52);
  // 머리 앞으로 튀는 물 — 둥근 알만. 파편이 아니다.
  for(let i=0;i<4;i++){const p=path((head+.02+i*.014)*TAU);
    c.beginPath();
    c.arc(p[0]+Math.sin(t*3.1+i*1.7)*RR*.06,p[1]-RR*.05*i,RR*.055*(1-i*.17),0,TAU);
    c.fillStyle=A(TONE[tn][2],.85-i*.16);c.fill();}}]);

FVSET.aqua.push(["잠겨 있다 — 움직이는 건 몸이 아니라 수면의 빛이다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  c.save();
  c.beginPath();c.arc(cx,cy,RR*1.30,0,TAU);c.clip();
  c.globalCompositeOperation="lighter";
  // 굴절 무늬 — 물이 만드는 빛은 격자가 아니라 **일그러진 방**이다.
  for(let i=0;i<10;i++){
    const sd=i*4.1;
    const bx=cx+((i%4)-1.5)*RR*.70+(hash(sd)-.5)*RR*.30+Math.sin(t*.50+i*1.3)*RR*.11;
    const by=cy+(Math.floor(i/4)-1)*RR*.74+(hash(sd*2.3)-.5)*RR*.30
      +Math.cos(t*.42+i*1.7)*RR*.11;
    const rr=RR*(.30+.18*hash(sd*3.7));
    const P=[];
    for(let k=0;k<=18;k++){const a=k/18*TAU;
      const q=rr*(1+.32*Math.sin(a*2+t*.72+i)+.17*Math.sin(a*3-t*.55+i*2.1));
      P.push([bx+Math.cos(a)*q,by+Math.sin(a)*q*.84]);}
    // 윤곽만 그으면 실뭉치가 된다 — **안이 빛나야** 물이 만든 빛으로 읽힌다
    const gc=c.createRadialGradient(bx,by,0,bx,by,rr*1.15);
    gc.addColorStop(0,A(T[1],.13));gc.addColorStop(1,A(T[1],0));
    c.fillStyle=gc;c.beginPath();
    P.forEach((v,k)=>k?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));
    c.closePath();c.fill();
    celStroke(c,P,2.4,tn,.34);}
  c.restore();
  // 수면 — 이 한 획이 「물속」임을 정한다
  const S2=[];
  for(let i=0;i<=24;i++){const q=i/24;
    S2.push([cx+(q-.5)*RR*2.7,cy-RR*1.12+Math.sin(q*5.2+t*1.5)*RR*.07]);}
  celStroke(c,S2,4.4,tn,.72);
  // 기포 — 작고 둥근 윤곽만. 연기와 안 헷갈리게 속을 안 채운다.
  for(let i=0;i<3;i++){const ph=(t*.32+i/3)%1;
    const x=cx+Math.sin(t*.9+i*2.2)*RR*.5+(hash(i*5.1)-.5)*RR*.7;
    const y=cy+RR*.95-ph*RR*2.05;
    c.beginPath();c.arc(x,y,RR*(.04+.03*hash(i*7.7)),0,TAU);
    c.strokeStyle=A(T[2],(1-ph)*.7);c.lineWidth=1.6;c.stroke();}}]);

FVSET.aqua.push(["녹는 중이다 — 각진 것이 풀려 둥글어지는 과정만 남는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // melt 0 → 뾰족한 얼음 / melt 1 → 완전한 원. 반지름 편차가 그대로 사라진다.
  const blob=(x,y,rr,melt,seed,k,col)=>{
    c.beginPath();
    for(let i=0;i<16;i++){const a=i/16*TAU;
      const sp=1+(hash(seed+i*3.1)-.28)*1.05*(1-melt);
      const q=rr*sp*k;
      const px=x+Math.cos(a)*q,py=y+Math.sin(a)*q*(1+melt*.20);
      i?c.lineTo(px,py):c.moveTo(px,py);}
    c.closePath();c.fillStyle=col;c.fill();};
  for(let i=0;i<4;i++){
    const per=2.8+hash(i*4.3)*1.4;
    const ph=((t+hash(i*8.9)*7)%per)/per;
    const a=i/4*TAU+.4;
    const melt=Math.min(1,ph*.88);                     // 천천히 풀린다
    const sag=ease(Math.max(0,(ph-.40)/.60))*RR*.46;
    const x=cx+Math.cos(a)*RR*.88,y=cy+Math.sin(a)*RR*.88+sag;
    const rr=RR*(.32-melt*.10)*(1-Math.max(0,(ph-.82)/.18)*.55);
    const al=(ph<.07?ph/.07:1)*(1-Math.max(0,(ph-.84)/.16));
    blob(x,y,rr,melt,i*2.7,1,A(T[0],.95*al));
    blob(x,y,rr,melt,i*2.7,.62,A(T[1],.97*al));
    // 흰 앞날은 **덜 녹았을 때만** 있다 — 녹을수록 날이 죽는 것이 이 안의 전부다
    blob(x,y,rr,melt,i*2.7,.26,A(T[2],al*(1-melt*.75)));
    if(melt>.45){const P=[];                           // 흘러내린 자국 — 짧고 굵다
      for(let k2=0;k2<=4;k2++){const q=k2/4;
        P.push([x+Math.sin(q*1.6+t*1.1+i)*RR*.04,y+rr*.66+q*RR*.22*(melt-.45)*1.8]);}
      celStroke(c,P,6.0*(1-melt*.35),tn,al*.55);}}}]);

FVSET.blast.push(["꼬여 조인다 — 가닥이 코어로 뻗는 게 아니라 서로를 감는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  celHoop(c,cx,cy,RR*1.06,1,t*.10,2.0,tn,.30);        // 껍질 — 갇혀 있다는 신호
  c.save();c.globalCompositeOperation="lighter";       // 속은 **밝다**(어둠과 갈리는 축)
  const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*.92);
  g.addColorStop(0,A(T[2],.30));g.addColorStop(.55,A(T[1],.16));
  g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.92,0,TAU);c.fill();c.restore();
  const sd=(t*9)|0;                                    // 뇌 — 0.11초마다 다시 굴려진다
  // 밧줄 — 필라멘트 셋이 서로를 감고 돈다. **닫힌 고리라 획으로 그린다**
  // (리본은 양 끝이 0 으로 좁아져 이음매에 구멍이 난다).
  for(let f=0;f<3;f++){
    const P=[];
    for(let i=0;i<=54;i++){const q=i/54,a=q*TAU;
      const tw=Math.sin(q*TAU*3+f/3*TAU-t*2.0)*RR*.14;        // 꼬임
      // 지터·떨림도 **주기 함수**로 준다 — hash(i) 는 시작과 끝이 어긋나 고리가 벌어진다
      const jr=(Math.sin(q*TAU*5+hash(sd+f*7)*9.4)*.030
               +Math.sin(q*TAU*8+hash(sd*3.1+f)*9.4)*.020)*RR;
      const hot=Math.sin(q*TAU*4+t*6.2+f*2.1)*RR*.028;        // 염 — 뜨겁게 떤다
      const neck=1-.17*Math.pow(Math.max(0,Math.sin(q*TAU*2-t*.55)),2);
      P.push([cx+Math.cos(a)*(RR*.74*neck+tw+jr+hot),
              cy+Math.sin(a)*(RR*.74*neck+tw+jr+hot)]);}
    celStroke(c,P,4.6-f*.9,tn,.92-f*.14);}
  // 조인 목 — 제일 가늘어진 자리가 달아오른다(핀치)
  c.save();c.globalCompositeOperation="lighter";
  for(let m=0;m<2;m++){
    const a=(t*.55+Math.PI*.25)/1+m*Math.PI;
    const x=cx+Math.cos(a)*RR*.60,y=cy+Math.sin(a)*RR*.60;
    const g2=c.createRadialGradient(x,y,0,x,y,RR*.30);
    g2.addColorStop(0,A(T[2],.55));g2.addColorStop(1,A(T[1],0));
    c.fillStyle=g2;c.beginPath();c.arc(x,y,RR*.30,0,TAU);c.fill();}
  c.restore();}]);

FVSET.blast.push(["벽을 타고 미끄러진다 — 안을 가로지르지 않는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  celHoop(c,cx,cy,RR*1.04,1,t*.08,2.2,tn,.34);
  c.save();c.globalCompositeOperation="lighter";       // 속 — 이온화된 기체가 밝다
  const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*1.02);
  g.addColorStop(0,A(T[1],.20));g.addColorStop(.72,A(T[1],.13));
  g.addColorStop(1,A(T[2],.12));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*1.02,0,TAU);c.fill();c.restore();
  const sd=(t*9)|0;
  for(let i=0;i<7;i++){
    if(hash(sd*3.1+i*7.7)>.55)continue;               // 몇 가닥만 켜진다
    const a0=hash(sd*5.3+i*2.9)*TAU;
    const span=(.8+1.6*hash(sd*7.1+i))*(hash(sd*2.3+i)>.5?1:-1);
    const P=[];
    for(let k=0;k<=8;k++){const q=k/8;
      const a=a0+span*q;
      // 벽에 붙되 가운데가 살짝 안으로 처진다 — 코어를 안 가로지른다
      const rr=RR*(1.00-.12*Math.sin(q*Math.PI))
        +(hash(sd+i*3.3+k*1.7)-.5)*RR*.055               // 뇌 — 다시 굴려지는 경로
        +Math.sin(q*7+t*6.4+i*2.1)*RR*.026;              // 염 — 뜨겁게 떤다
      P.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
    celStroke(c,P,3.6-1.1*hash(i*2.9),tn,.92);
    c.save();c.globalCompositeOperation="lighter";      // 두 발 — 벽에 붙은 자리
    for(const e of[P[0],P[P.length-1]]){
      const g2=c.createRadialGradient(e[0],e[1],0,e[0],e[1],10);
      g2.addColorStop(0,A(T[2],.85));g2.addColorStop(1,A(T[1],0));
      c.fillStyle=g2;c.beginPath();c.arc(e[0],e[1],10,0,TAU);c.fill();}
    c.restore();}}]);

FVSET.blast.push(["기체가 빛난다 — 선이 아니라 **부피**가 이온화돼 있다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  celHoop(c,cx,cy,RR*1.03,1,0,2.4,tn,.52);            // 껍질 — 얇고 또렷한 한 줄
  c.save();c.globalCompositeOperation="lighter";
  // 부피 — 이온화된 기체가 뭉근하게 빛나며 아주 느리게 굼실거린다
  for(let i=0;i<9;i++){
    const a=i/9*TAU+t*.28+Math.sin(t*1.0+i*1.7)*.45;
    const rr=RR*(.16+.46*hash(i*3.7))*(1+.20*Math.sin(t*1.6+i*2.3));
    const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
    const q=RR*(.26+.20*hash(i*7.1));
    // **얼룩덜룩해야 기체다** — 고르게 칠하면 그냥 둥근 빛이 된다
    const g=c.createRadialGradient(x,y,0,x,y,q);
    g.addColorStop(0,A(i%3?T[1]:T[2],.20+.16*Math.sin(t*1.3+i*2.7)));
    g.addColorStop(.55,A(T[1],.10));g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,q,0,TAU);c.fill();}
  c.restore();
  // 실 — 부피 **안에서** 잠깐씩 튄다. 코어에도 껍질에도 매이지 않는다.
  const sd=(t*12)|0;
  for(let i=0;i<9;i++){
    if(hash(sd*3.7+i*5.1)>.60)continue;
    let x=cx+(hash(sd*2.9+i*3.1)-.5)*RR*1.30;
    let y=cy+(hash(sd*4.3+i*5.9)-.5)*RR*1.30;
    let ang=hash(sd*6.1+i*2.3)*TAU;
    const P=[[x,y]];
    for(let k=0;k<4;k++){
      ang+=(hash(sd*7.7+i*11.3+k*2.1)-.5)*1.7;         // 뇌 — 매번 새 길
      x+=Math.cos(ang)*RR*.17;y+=Math.sin(ang)*RR*.17;
      P.push([x,y]);}
    celStroke(c,P,2.4,tn,.80);}}]);

FVSET.blast.push(["껍질이 밀린다 — 갇혀 있지만 아슬아슬하다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // 미는 자리 셋 — 아주 느리게 옮겨 다니고, 미는 힘이 들쭉날쭉하다
  const bump=a=>{let s=0;
    for(let m=0;m<3;m++){
      const am=m/3*TAU+t*.20+Math.sin(t*.62+m*2.1)*.55;
      const amt=.05+.07*Math.max(0,Math.sin(t*1.25+m*2.3));
      const d=Math.abs(((a-am+Math.PI*3)%TAU)-Math.PI);
      s+=amt*Math.exp(-(d*d)/(2*.30*.30));}
    return s;};
  c.save();c.globalCompositeOperation="lighter";       // 속 — 밝다. 미는 쪽이 더 밝다.
  const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*.74);
  g.addColorStop(0,A(T[2],.20));g.addColorStop(.6,A(T[1],.10));
  g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.74,0,TAU);c.fill();c.restore();
  // ⚠️ 껍질 획을 걷어냈다(2026-08-09). 「바깥 테두리 없애줘」 —
  // 테두리가 없으면 「갇힘」 대신 **「밀려 나온다」**만 남아, 융화 **기본**에
  // 어울리는 조용한 그림이 된다. bump() 는 가닥이 닿는 깊이로만 쓰인다.
  // 미는 것 — 안에서 껍질을 향해 뻗는 굵은 가닥. 경로는 계속 다시 굴려진다.
  const sd=(t*9)|0;
  for(let m=0;m<3;m++){
    const am=m/3*TAU+t*.20+Math.sin(t*.62+m*2.1)*.55;
    const amt=Math.max(0,Math.sin(t*1.25+m*2.3));
    const reach=RR*(.70+.05+.07*amt);
    const P2=[[cx,cy]];
    for(let k=1;k<=5;k++){const q=k/5;
      const aa=am+(hash(sd+m*3.3+k*1.7)-.5)*.75*q
        +Math.sin(t*6.4+m*2.1)*.10*q;                   // 염 — 뜨겁게 흔들린다
      P2.push([cx+Math.cos(aa)*reach*q,cy+Math.sin(aa)*reach*q]);}
    celStroke(c,P2,1.8+1.6*amt,tn,.42+.28*amt);
    const e=P2[P2.length-1];                            // 밀린 자리가 달아오른다
    c.save();c.globalCompositeOperation="lighter";
    const g2=c.createRadialGradient(e[0],e[1],0,e[0],e[1],RR*.26);
    g2.addColorStop(0,A(T[2],.30+.55*amt));g2.addColorStop(1,A(T[1],0));
    c.fillStyle=g2;c.beginPath();c.arc(e[0],e[1],RR*.26,0,TAU);c.fill();c.restore();}}]);

FVSET.smoke.push(["잔불에서 실 한 가닥씩 — 연기가 어디서 나는지 보인다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn],EM=TONE.ember;
  for(let i=0;i<3;i++){
    const ex=cx+(i-1)*RR*.46,ey=cy+RR*.72;
    const fl=.55+.45*Math.sin(t*(6+i*1.7)+i*2.3);
    const P=[];
    for(let k=0;k<=12;k++){const q=k/12;
      P.push([ex+Math.sin(t*1.15+q*3.6+i*2.1)*RR*.30*q*q,ey-q*RR*1.58]);}
    // ⚠️ 획이 세면 연기가 아니라 **철사**로 보인다(2026-08-09 실기 판정).
    // 몸통은 뿌연 기운이 지고, 획은 밑동에서만 살짝 거든다.
    c.save();c.globalCompositeOperation="lighter";
    for(let k=1;k<=12;k++){const q=k/12;
      const rr=RR*(.11+q*.34);
      const g=c.createRadialGradient(P[k][0],P[k][1],0,P[k][0],P[k][1],rr);
      g.addColorStop(0,A(T[1],.30*(1-q*.45)));g.addColorStop(.55,A(T[0],.22*(1-q*.4)));
      g.addColorStop(1,A(T[0],0));
      c.fillStyle=g;c.beginPath();c.arc(P[k][0],P[k][1],rr,0,TAU);c.fill();}
    c.restore();
    for(let k=0;k<7;k++){const q=k/12;               // 밑동만 — 위로 갈수록 획이 사라진다
      celStroke(c,[P[k],P[k+1]],1.6+q*q*4.0,tn,Math.max(0,1-q*2.2)*.30);}
    // 잔불 — 작고 뜨겁다. 이것 때문에 연기가 「타는 것」이 된다.
    fillPoly(c,jagPoly(ex,ey,RR*(.08+.035*fl),5,i*3.1,1.5),A(EM[0],.95));
    fillPoly(c,jagPoly(ex,ey,RR*(.045+.02*fl),5,i*3.1+1,1.4),A(EM[1],.35+.6*fl));}}]);

FVSET.smoke.push(["재가 뜬다 — 기체가 아니라 타고 남은 부스러기다",
function(c,cx,cy,RR,t,tn){
  // 바닥빛 — **타르 셋과 같은 것.** 연이 타르가 됐으므로 기본에도 같은 바닥이
  // 깔려야 한 벌이 된다(2026-08-10).
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember;
  c.save();c.globalCompositeOperation="lighter";       // 매캐한 기운
  for(let i=0;i<5;i++){const ph=(t*.22+i/5)%1;
    const x=cx+Math.sin(t*.6+i*2.3)*RR*.34,y=cy+RR*.6-ph*RR*1.6;
    const rr=RR*(.34+ph*.36);
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],.20*(1-ph)));g.addColorStop(.6,A(T[0],.16*(1-ph)));
    g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.restore();
  for(let i=0;i<15;i++){
    const per=2.4+hash(i*3.3)*1.8,tt=t+hash(i*7.1)*7;
    const ph=(tt%per)/per;
    const x=cx+(hash(i*5.9)-.5)*RR*1.6+Math.sin(t*.9+i*1.4)*RR*.18;
    const y=cy+RR*.90-ph*RR*2.05;
    const s2=RR*(.065+.055*hash(i*13.7));
    const flip=Math.abs(Math.cos(t*(2.2+hash(i*11.1)*2.4)+i));  // 팔랑거린다
    const al=(1-ph)*(ph<.10?ph/.10:1);
    c.save();c.translate(x,y);c.rotate(t*.7+i*1.9);c.scale(flip*.85+.15,1);
    // ⚠️ 림만 밝게 두면 **빈 네모**가 떠다닌다(2026-08-09 실기 판정) — 속을
    // 중간 톤으로 채워 **조각**이 되게 하고, 림은 윤곽만 겨우 세운다.
    c.beginPath();c.moveTo(-s2,-s2*.62);c.lineTo(s2*.86,-s2);
    c.lineTo(s2,s2*.74);c.lineTo(-s2*.72,s2);c.closePath();
    c.fillStyle=A(T[0],.95*al);c.fill();
    c.strokeStyle=A(T[1],.85*al);c.lineWidth=1.0;c.stroke();
    c.beginPath();c.moveTo(-s2*.55,-s2*.30);c.lineTo(s2*.60,-s2*.52);
    c.lineTo(s2*.66,s2*.30);c.lineTo(-s2*.40,s2*.52);c.closePath();
    c.fillStyle=A(T[1],.55*al);c.fill();
    const glow=Math.max(0,1-ph*3.4);                   // 아래쪽 재는 아직 빨갛다
    if(glow>0){c.beginPath();c.moveTo(-s2*.45,-s2*.3);c.lineTo(s2*.5,-s2*.42);
      c.lineTo(s2*.4,s2*.35);c.closePath();
      c.fillStyle=A(EM[1],glow*.9*al);c.fill();}
    c.restore();}}]);

FVSET.smoke.push(["오르다 막힌다 — 천장에 닿아 옆으로 깔린다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn],ceil=cy-RR*.80;
  const puff=(x,y,rr,al)=>{c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],.44*al));g.addColorStop(.55,A(T[0],.34*al));
    g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();c.restore();};
  // 기둥 — **먼저 오른다는 게 보여야** 막힌 것이 사건이 된다
  for(let i=0;i<7;i++){const ph=(t*.44+i/7)%1;
    puff(cx+Math.sin(t*.9+i*1.9)*RR*.16,cy+RR*.78-ph*RR*1.56,
      RR*(.26+ph*.16),1.05-ph*.25);}
  for(let s=-1;s<=1;s+=2)for(let i=0;i<7;i++){         // 천장을 타고 눕는 층
    const ph=(t*.30+i/7)%1;
    puff(cx+s*(RR*.08+ph*RR*1.45),ceil+Math.sin(t*1.3+i)*RR*.05+ph*RR*.18,
      RR*(.32+ph*.26),(1-ph*.85)*1.0);}
  // 천장 — 선을 그으면 **선반**이 된다. 눌린 자국만 아주 옅게.
  const P=[];
  for(let i=0;i<=20;i++){const q=i/20;
    P.push([cx+(q-.5)*RR*2.8,ceil-RR*.24+Math.sin(q*4.4+t*.9)*RR*.05]);}
  celStroke(c,P,2.0,tn,.16);}]);

FVSET.smoke.push(["한 기둥이 뭉쳐 오른다 — 흩어지는 게 아니라 밀고 올라간다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const puff=(x,y,rr,al)=>{c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],.46*al));g.addColorStop(.55,A(T[0],.36*al));
    g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();c.restore();};
  const bul=saw(t,2.0);                                // 기둥을 타고 오르는 마디
  for(let i=0;i<10;i++){const q=i/9;
    const near=Math.max(0,1-Math.abs(q-bul)*3.2);
    puff(cx+Math.sin(t*.6+q*1.7)*RR*.10*q,cy+RR*.84-q*RR*1.42,
      RR*(.26+q*.16+near*.12),.95-q*.15);}
  // 머리 — 바깥으로 말린다. ⚠️ 뭉치가 성기면 **구슬 아치**가 된다(실기 판정):
  // 겹쳐야 하나의 덩어리로 읽힌다.
  const capY=cy-RR*.82;
  for(let j=0;j<13;j++){const s2=(j-6)/6;
    puff(cx+s2*RR*.90+Math.sin(t*.7+j*1.3)*RR*.04,
      capY+s2*s2*RR*.46+Math.cos(t*.6+j)*RR*.03,
      RR*(.38-Math.abs(s2)*.08),1-Math.abs(s2)*.20);}
  // 밑동 — 빨려 드는 자리가 아니라 **타는 자리**다
  celSplash(c,cx,cy+RR*.92,RR*.18,9,3,tn,.35,.45);}]);

FVSET.fstorm.push(["옮겨붙는다 — 하나가 어두워지며 옆의 하나를 밝힌다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn],N=7,PR=5.6,u=saw(t,PR);
  // 자리는 흩어져 있다 — 차례가 도는 것이지 도형이 도는 게 아니다
  const pos=i=>{const sd=i*6.7;
    const a=hash(sd)*TAU+Math.sin(t*.55+i*1.9)*.24;
    const rr=RR*(.46+.66*hash(sd*2.3))*(1+.10*Math.sin(t*1.0+i*2.1));
    return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.90];};
  for(let i=0;i<N;i++){
    const d=(u-i/N+1)%1;                         // 불을 받은 지 얼마나 됐나
    // 천천히 진다 — **둘셋이 동시에 걸쳐 있어야** 「옮아가는 중」이 보인다.
    // 하나만 밝으면 그건 옮겨붙는 게 아니라 그냥 하나짜리다.
    const live=Math.max(.14,1-d*N*.42);
    const p=pos(i),sz=2.1+2.6*hash(i*8.9);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(p[0],p[1],0,p[0],p[1],sz*3.8);
    g.addColorStop(0,A(T[2],live*.72));g.addColorStop(.42,A(T[1],live*.30));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(p[0],p[1],sz*3.8,0,TAU);c.fill();c.restore();
    // 어두운 바탕에 **점만** 탄다 — 덩어리로 키우면 그건 불(炎)이다
    fillPoly(c,jagPoly(p[0],p[1],sz*1.45,5,i*3.1,1.35),A(T[0],.55+live*.4));
    fillPoly(c,jagPoly(p[0],p[1],sz*.90,5,i*3.1+1,1.25),A(T[1],live));
    if(live>.4)fillPoly(c,jagPoly(p[0],p[1],sz*.42,5,i*3.1+2,1.2),A(T[2],(live-.4)/.6));}
  // 옮아가는 불티 — **휘어 간다.** 바람에 실렸으니 직선일 수 없다.
  const seg=Math.floor(u*N)%N,fr=u*N-Math.floor(u*N);
  const p0=pos(seg),p1=pos((seg+1)%N);
  const mx=(p0[0]+p1[0])*.5+(p1[1]-p0[1])*.34;
  const my=(p0[1]+p1[1])*.5-(p1[0]-p0[0])*.34;
  const bez=q=>[(1-q)*(1-q)*p0[0]+2*(1-q)*q*mx+q*q*p1[0],
                (1-q)*(1-q)*p0[1]+2*(1-q)*q*my+q*q*p1[1]];
  const tp=[];
  for(let k=0;k<8;k++)tp.push(bez(Math.max(0,fr-k*.055)));
  celStroke(c,tp,2.4,tn,.50);
  const b2=bez(fr);
  fillPoly(c,jagPoly(b2[0],b2[1],3.6,5,seg*2.7,1.3),A(T[1],.95));
  fillPoly(c,jagPoly(b2[0],b2[1],1.8,5,seg*2.7+1,1.2),A(T[2],1));}]);

FVSET.fstorm.push(["바람의 결이 보인다 — 제각각이 아니라 같은 길을 지난다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // 흐름선 셋. 불씨는 바람을 **보이게 하는 표식**일 뿐이다.
  const line=(l,q)=>[cx+(q-.5)*RR*2.8,
    cy+(l-1)*RR*.60+Math.sin(q*4.2+l*1.9)*RR*.44-q*RR*.24];
  // 결 자체는 **거의 안 그린다** — 진하게 그으면 그어 놓은 철사가 된다.
  // 가운데만 겨우 비치고 양 끝은 사라진다.
  for(let l=0;l<3;l++)for(let i=0;i<16;i++){
    const q=i/16;
    celStroke(c,[line(l,q),line(l,q+1/16)],1.4,tn,.10*Math.sin(Math.PI*q));}
  for(let l=0;l<3;l++)for(let i=0;i<7;i++){
    const sd=l*7.1+i*3.3;
    const q=(t*(.13+.028*l)+i/7)%1;
    const p=line(l,q);
    const edge=Math.sin(Math.PI*q);              // 양 끝에서 나고 진다
    // 명멸 — 다만 **결을 따라 물결친다.** 제각각 깜빡이면 결이 안 읽힌다.
    const bl=.30+.70*Math.max(0,Math.sin(q*TAU*1.6-t*2.6+l*1.3));
    const live=edge*bl*(.55+.45*hash(sd));
    if(live<.05)continue;
    const sz=1.6+2.0*hash(sd*5.9);
    const tp=[];                                 // 꼬리 — 결을 그대로 따라간다
    for(let k=0;k<7;k++)tp.push(line(l,Math.max(0,q-k*.028)));
    celStroke(c,tp,sz*.6,tn,live*.38);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(p[0],p[1],0,p[0],p[1],sz*3.4);
    g.addColorStop(0,A(T[2],live*.58));g.addColorStop(.42,A(T[1],live*.22));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(p[0],p[1],sz*3.4,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(p[0],p[1],sz*1.4,5,sd,1.3),A(T[0],.5+live*.45));
    fillPoly(c,jagPoly(p[0],p[1],sz*.85,5,sd+1,1.25),A(T[1],live));
    fillPoly(c,jagPoly(p[0],p[1],sz*.40,5,sd+2,1.2),A(T[2],live));}}]);

FVSET.fstorm.push(["씨앗 하나 — 옮겨붙일 불씨는 하나면 된다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // 직선이 아닌 길. 두 주기를 겹쳐 흔들리게 둔다.
  const at=tt=>{const a=tt*.30+Math.sin(tt*.62)*.55;
    const rr=RR*(.78+.24*Math.sin(tt*.44+1.1));
    return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.88+Math.sin(tt*.9)*RR*.09];};
  // 명멸 — 꺼질 듯 말 듯. 하나뿐이라 이 하나가 다 진다.
  const live=Math.max(.10,Math.pow(Math.abs(Math.sin(t*1.05)),.7)
    *(.45+.55*Math.abs(Math.sin(t*3.4))));
  const p=at(t),sz=RR*.085;
  const tp=[];                                    // 지나온 길
  for(let k=0;k<9;k++)tp.push(at(t-k*.085));
  celStroke(c,tp,sz*.7,tn,live*.34);
  for(let i=0;i<7;i++){                           // 떨군 부스러기 — 성기게, 아주 작게
    const ph=(t*.42+hash(i*4.3))%1;
    const q=at(t-1.1-ph*1.9);
    c.beginPath();
    c.arc(q[0]+(hash(i*9.1)-.5)*RR*.14,q[1]+ph*RR*.22,1.7*(1-ph),0,TAU);
    c.fillStyle=A(T[1],(1-ph)*.65);c.fill();}
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(p[0],p[1],0,p[0],p[1],sz*4.4);
  g.addColorStop(0,A(T[2],live*.80));g.addColorStop(.42,A(T[1],live*.32));
  g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(p[0],p[1],sz*4.4,0,TAU);c.fill();c.restore();
  fillPoly(c,jagPoly(p[0],p[1],sz,5,3.1,1.35),A(T[0],.55+live*.4));
  fillPoly(c,jagPoly(p[0],p[1],sz*.62,5,4.3,1.25),A(T[1],live));
  fillPoly(c,jagPoly(p[0],p[1],sz*.30,5,5.7,1.2),A(T[2],live));}]);

FVSET.fstorm.push(["돌풍마다 한 호흡 — 저마다 깜빡이는 게 아니라 전부 같이 산다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn],PR=3.4,u=saw(t,PR);
  const gust=u<.46?Math.sin(Math.PI*(u/.46)):0;      // 왔다 가는 한 번의 바람
  const dir=hash(((t/PR)|0)*3.7)*TAU;                // 돌풍마다 방향이 다르다
  // 바람결 — ⚠️ 진하고 길면 **그어 놓은 줄**이 된다(실기 판정). 짧게, 토막으로,
  // 지나가는 동안만. 바람은 불씨가 한꺼번에 밀리는 것으로 이미 다 말해진다.
  if(gust>.05){c.save();c.globalCompositeOperation="lighter";
    for(let i=0;i<3;i++){const off=(i-1)*RR*.66;
      for(let j=0;j<7;j++){const q=j/7;
        const p=k2=>{const s2=(k2-.5)*RR*1.2;
          const d=off+Math.sin(k2*3.4+t*3+i)*RR*.14;
          return[cx+Math.cos(dir)*s2-Math.sin(dir)*d,
                 cy+Math.sin(dir)*s2+Math.cos(dir)*d];};
        const p0=p(q),p1=p(q+.10);
        c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);
        c.strokeStyle=A(T[1],gust*gust*.16*Math.sin(Math.PI*q));
        c.lineWidth=1.8;c.lineCap="round";c.stroke();}}
    c.restore();}
  for(let i=0;i<11;i++){
    const sd=i*6.1;
    const a=hash(sd)*TAU+t*.09;
    const rr=RR*(.42+.70*hash(sd*2.1));
    const push=gust*RR*.44*(.5+hash(sd*3.3));        // 전부 같은 쪽으로 밀린다
    const x=cx+Math.cos(a)*rr+Math.cos(dir)*push;
    const y=cy+Math.sin(a)*rr*.90+Math.sin(dir)*push;
    // 잦아든 동안에도 **꺼지지는 않는다** — 숯불이 남아 있어야 다음 돌풍이 사건이 된다
    const live=Math.max(.20,(.16+.84*gust)*(.55+.45*Math.sin(t*2.6+sd)));
    const sz=1.6+2.1*hash(sd*4.7);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,sz*3.4);
    g.addColorStop(0,A(T[2],live*.58));g.addColorStop(.42,A(T[1],live*.22));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,sz*3.4,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(x,y,sz*1.4,5,sd,1.3),A(T[0],.55+live*.4));
    fillPoly(c,jagPoly(x,y,sz*.85,5,sd+1,1.25),A(T[1],live));
    if(live>.42)fillPoly(c,jagPoly(x,y,sz*.40,5,sd+2,1.2),A(T[2],(live-.42)/.58));}}]);

// ── 2~5안 · 독·바람 갈래(마·뢰명·장) ──────────────────────────────────
FVSET.numb.push(["시간이 안 간다 — 눈금을 하나씩 째깍이다 자주 통째로 멈춰 선다",
function(c,cx,cy,RR,t,tn){
  // 마비는 형태가 아니라 **시간**이 다르다. 그래서 이 안은 도형을 안 바꾸고
  // 시각 자체를 계단으로 자른다. 도는 것은 눈금 위를 한 칸씩 건너뛰는 마디
  // 하나뿐이고, 죽은 칸을 만나면 앞 칸을 물려받아 두세 박자를 통째로 선다.
  // 멈춘 동안에는 잔상 셋이 한자리에 겹쳐 하나로 보인다 — 그게 「끊겼다」다.
  const T=TONE[tn],N=12,HZ=5;
  const at=g=>{let s2=((t*HZ)|0)-g;
    for(let i=0;i<3;i++){if(hash(s2*7.3)<.38)s2-=1;else break;}
    return s2;};
  const now=at(0),held=now!==((t*HZ)|0);
  // 눈금 — 안 움직인다. 이 고리가 「멈춰 있다」의 기준이 된다.
  // ⚠️ 어두운 톤 단색으로 그렸더니 검은 배경에 묻혀 눈금이 아예 안 보였다.
  // 기준이 안 보이면 마디가 「째깍인다」가 아니라 그냥 떠다니는 것이 된다.
  for(let i=0;i<N;i++){const a=i/N*TAU;
    celStroke(c,[[cx+Math.cos(a)*RR*.74,cy+Math.sin(a)*RR*.74],
      [cx+Math.cos(a)*RR*.98,cy+Math.sin(a)*RR*.98]],3.6,tn,.26);}
  // 마디 — 지금 칸 + 잔상 셋. 뒤로 갈수록 꺼진다.
  for(let g=3;g>=0;g--){
    const a=((at(g)%N+N)%N)/N*TAU,al=[.98,.42,.22,.11][g];
    celStroke(c,[[cx+Math.cos(a)*RR*.70,cy+Math.sin(a)*RR*.70],
      [cx+Math.cos(a)*RR*1.05,cy+Math.sin(a)*RR*1.05]],6.2-g*1.1,tn,al);}
  // 테 — 늘 보이는 것을 하나 두고, 멈춘 동안 그 위를 어둠이 덮는다.
  // 덮을 것이 없으면 「꺼졌다」가 안 보인다.
  const rim=[];
  for(let i=0;i<=40;i++){const aa=i/40*TAU;
    rim.push([cx+Math.cos(aa)*RR*1.16,cy+Math.sin(aa)*RR*1.16]);}
  celStroke(c,rim,3.0,tn,held?.20:.62);
  if(held){c.save();c.strokeStyle=A(T[0],.92);c.lineWidth=6.0;
    c.beginPath();c.arc(cx,cy,RR*1.16,0,TAU);c.stroke();c.restore();}
}]);

FVSET.numb.push(["감각이 죽은 구역이 둘레를 훑는다 — 지나간 자리는 털이 눕고 꺼진다",
function(c,cx,cy,RR,t,tn){
  // 「저리다」의 그림. 둘레 전체에 잔털이 촘촘히 서서 떨고 있고, 감각이 죽은
  // 활꼴 하나가 천천히 돌며 지나간다 — 그 안의 털은 떨림을 잃고 눕는다.
  // 마비는 전부 꺼지는 것이 아니라 **꺼진 구역이 옮겨 다니는 것**이다.
  const T=TONE[tn],N=56,base=RR*.66,dc=t*.5,half=1.15;
  for(let i=0;i<N;i++){
    const a=i/N*TAU;
    const d=(((a-dc)%TAU+TAU+Math.PI)%TAU)-Math.PI;
    const dead=Math.max(0,Math.min(1,(1-Math.abs(d)/half)*1.4)),live=1-dead;
    const jit=Math.sin(t*16+i*2.7)*.55+Math.sin(t*23.5-i*1.9)*.32;
    const len=RR*(.09+.27*live)*(1+.30*jit*live);
    celSpike(c,cx+Math.cos(a)*base,cy+Math.sin(a)*base,
      a+jit*.24*live,len,2.4+1.2*live,tn,.14+.76*live);}
  // 밑동 — 털이 심긴 자리. 닫힌 고리는 리본이 아니라 획으로 잇는다.
  const ring=[];
  for(let i=0;i<=44;i++){const aa=i/44*TAU;
    ring.push([cx+Math.cos(aa)*base,cy+Math.sin(aa)*base]);}
  celStroke(c,ring,2.6,tn,.42);
  // 죽은 활꼴 — 밑동 위를 어두운 띠가 덮어 「여긴 아무 느낌도 없다」가 된다
  c.save();c.strokeStyle=A(T[0],.88);c.lineWidth=6.5;c.lineCap="round";
  c.beginPath();c.arc(cx,cy,base,dc-half*.78,dc+half*.78);c.stroke();c.restore();
}]);

FVSET.numb.push(["마주 달리다 만난 자리에서 함께 꺼진다 — 죽은 자리가 하나씩 쌓인다",
function(c,cx,cy,RR,t,tn){
  // 전기는 신경을 타고 독은 신경을 끊는다 — 둘이 **같은 길**을 쓴다.
  // 그 길을 반대로 달린 둘이 마주치면 서로를 꺼뜨리고, 만난 자리는 재가
  // 되어 남는다. 전기 쪽이 먼저 도착해 기다리고 독 쪽이 느릿하게 온다.
  const T=TONE[tn],rr=RR*.86,P=1.5,cyc=(t/P)|0,u=(t%P)/P;
  const ring=[];
  for(let i=0;i<=44;i++){const aa=i/44*TAU;
    ring.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
  // 길은 **밝아야** 한다 — 재가 「길에서 뜯겨 나간 자국」으로 읽히려면
  // 덮이는 쪽이 먼저 보여야 한다(어두운 재를 검은 배경에 얹으면 안 보인다).
  celStroke(c,ring,4.4,tn,.62);
  // 재 — 지난 일곱 사이클이 만난 자리. 겹칠수록 길이 죽어 간다.
  for(let k=0;k<7;k++){const cc=cyc-k;if(cc<0)continue;
    const am=hash(cc*5.7)*TAU+Math.PI,f=1-k/7;
    c.save();c.strokeStyle=A(T[0],.95);c.lineWidth=7.5;c.lineCap="round";
    c.beginPath();c.arc(cx,cy,rr,am-.20-.14*f,am+.20+.14*f);c.stroke();c.restore();}
  // 두 신호 — 속도가 다르다(뇌는 ease, 독은 제곱). 만나는 자리는 늘 같다.
  const a0=hash(cyc*5.7)*TAU;
  const al=u<.94?(.55+.45*u):Math.max(0,1-(u-.94)/.06);
  const runner=(e,sg)=>{const Pt=[];
    for(let i=0;i<=6;i++){const aa=a0+sg*e*Math.PI-sg*(i/6)*.50;
      Pt.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
    celStroke(c,Pt,6.4,tn,al);
    fillPoly(c,jagPoly(Pt[0][0],Pt[0][1],4.4,7,e*7.3,1.2),A(T[2],al));};
  runner(ease(u),1);runner(u*u,-1);
  if(u>.94){const f=(u-.94)/.06;
    celSplash(c,cx+Math.cos(a0+Math.PI)*rr,cy+Math.sin(a0+Math.PI)*rr,
      RR*(.10+.22*f),7,cyc*3.1,tn,1-f);}
}]);

FVSET.numb.push(["그물이 끊긴다 — 번지던 신호가 죽은 마디 앞에서 멈춘다",
function(c,cx,cy,RR,t,tn){
  // 신경은 선이 아니라 **망**이다. 한 마디에서 시작한 신호가 이웃으로 번지는데,
  // 죽은 마디는 통과시키지 않는다. 죽는 마디가 시간이 갈수록 늘어 결국 망이
  // 토막나고, 다 죽으면 한꺼번에 되살아난다.
  const T=TONE[tn],N=13,P=2.8,cyc=(t/P)|0,u=(t%P)/P;
  const nd=[];
  for(let i=0;i<N;i++){const a=i/N*TAU+(hash(i*3.3)-.5)*.34;
    const r2=RR*(.60+.46*hash(i*7.1));
    nd.push([cx+Math.cos(a)*r2,cy+Math.sin(a)*r2]);}
  const adj=[];for(let i=0;i<N;i++)adj.push([]);
  for(let i=0;i<N;i++){
    const j=(i+1)%N,k2=(i+4)%N;
    adj[i].push(j);adj[j].push(i);adj[i].push(k2);adj[k2].push(i);}
  const live=[];
  for(let i=0;i<N;i++)live.push(u<hash(cyc*4.7+i*9.1)*.86+.12);
  const hop=[];for(let i=0;i<N;i++)hop.push(-1);
  const s0=(cyc*5)%N;
  if(live[s0]){hop[s0]=0;let q=[s0];
    while(q.length){const nq=[];
      for(const v of q)for(const w of adj[v])
        if(hop[w]<0&&live[w]){hop[w]=hop[v]+1;nq.push(w);}
      q=nq;}}
  const wf=(t*3.6)%6.5;
  const lit=i=>hop[i]<0?0:Math.max(0,1-Math.abs(hop[i]-wf)*.85);
  for(let i=0;i<N;i++)for(const j of adj[i]){
    if(j<i)continue;
    if(live[i]&&live[j]){const L=Math.max(lit(i),lit(j));
      celStroke(c,[nd[i],nd[j]],1.0+.55*L,tn,.09+.17*L);}
    else{c.save();c.strokeStyle=A(T[0],.30);c.lineWidth=1.0;c.lineCap="round";
      c.beginPath();c.moveTo(nd[i][0],nd[i][1]);c.lineTo(nd[j][0],nd[j][1]);
      c.stroke();c.restore();}}
  for(let i=0;i<N;i++){const L=lit(i);
    if(live[i]){
      fillPoly(c,jagPoly(nd[i][0],nd[i][1],1.8+.9*L,5,i*2.3,1.3),A(T[1],.26+.14*L));
      if(L>.72)fillPoly(c,jagPoly(nd[i][0],nd[i][1],.9*L,5,i*2.3+1,1.2),A(T[2],L*.22));}
    else{c.beginPath();c.arc(nd[i][0],nd[i][1],3.4,0,TAU);
      c.fillStyle=A(T[0],.95);c.fill();}}
}]);

FVSET.thunder.push(["여덟 조각이 한꺼번에 맞부딪는다 — 소리는 부딪히는 그 순간에만 있다",
function(c,cx,cy,RR,t,tn){
  // 소리는 상태가 아니라 **부딪힘**이다. 금속판 여덟이 천천히 벌어졌다가
  // 한 박에 안으로 확 모여 맞물리고, 그 순간에만 틈으로 불꽃이 튄다.
  // 부딪힌 뒤에는 금속답게 각이 떨리며 잦아든다 — 여운은 남고 소리는 끝난다.
  const P=1.3,u=saw(t,P),n=8;
  const rr=RR*(.44+.60*ease(Math.min(1,u/.92)));
  const dec=Math.exp(-u*6.5);
  for(let k=0;k<n;k++){
    // 각도는 제자리 진동만 — 조각마다 회전 속도를 다르게 주면 서로 흩어진다
    const wob=dec*Math.sin(u*P*46+k*1.7)*.20;
    const a=k/n*TAU+wob,Pt=[];
    for(let i=0;i<=5;i++){const aa=a+(i/5-.5)*.62;
      Pt.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
    celStroke(c,Pt,7.5,tn,.92);}
  const hit=u<.14?1-u/.14:0;
  if(hit>0){
    for(let k=0;k<n;k++){const a=(k+.5)/n*TAU;
      celSpike(c,cx+Math.cos(a)*rr*.92,cy+Math.sin(a)*rr*.92,a,
        RR*.46*hit,4.5*hit+.6,tn,hit);}
    celHoop(c,cx,cy,RR*(.48+(1-hit)*.86),1,0,5*hit+.8,tn,hit*.9);}
}]);

FVSET.thunder.push(["보이고 한참 뒤에 들린다 — 열 중 유일하게 아무것도 없는 순간이 있다",
function(c,cx,cy,RR,t,tn){
  // 천둥의 정체는 **시차**다. 빛은 즉시 오고, 정적이 흐르고, 그 다음에야
  // 저음이 도착한다. 화면이 비는 구간을 일부러 남긴다 — 비어야 뒤에 오는
  // 것이 「퍼지는 무늬」가 아니라 「도착」으로 읽힌다.
  const T=TONE[tn],P=2.4,u=saw(t,P);
  if(u<.12){                                   // 섬광 — 즉시 온다
    const f=1-u/.12;
    celHoop(c,cx,cy,RR*(.74+.28*(1-f)),1,0,3.5*f+.6,tn,f);
    for(let k=0;k<14;k++){const a=k/14*TAU;
      celSpike(c,cx+Math.cos(a)*RR*.80,cy+Math.sin(a)*RR*.80,a,RR*.55*f,1.8,tn,f*.9);}
    // 고리꼴 섬광 — 가운데를 안 채운다. 중심의 광휘는 fvBody 의 몫이라
    // 여기서 덧칠하면 열여섯이 한 벌로 안 읽힌다.
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*1.4);
    g.addColorStop(0,A(T[2],0));g.addColorStop(.52,A(T[2],.30*f));
    g.addColorStop(1,A(T[2],0));
    c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*1.4,0,TAU);c.fill();c.restore();}
  // 0.12 ~ 0.36 은 정적. 여기에는 아무것도 그리지 않는다.
  // (비는 구간을 더 길게 잡았더니 정지 화면에서 「고장난 칸」으로 보였다 —
  //  비어야 하되, 비는 쪽이 화면의 절반을 넘으면 안 된다.)
  for(let k=0;k<3;k++){                        // 도착 — 굵고 느린 저음
    const v=(u-.36-k*.09)/.64;if(v<0||v>1)continue;
    const al=Math.max(0,(1-v)*(1-v)*1.0-k*.12);
    celHoop(c,cx,cy,RR*(.26+v*1.08),1,0,14*(1-v)+1.2,tn,al);}
}]);

FVSET.thunder.push(["나간 소리가 되돌아온다 — 벽을 치고 안으로 접혀 들어오며 잦아든다",
function(c,cx,cy,RR,t,tn){
  // 천둥이 길게 들리는 이유는 세기가 아니라 **되돌아오기 때문**이다.
  // 나갈 때는 굵고 밝게, 돌아올 때는 가늘고 어둡게 — 같은 파문이 두 번
  // 지나가는 것이 보여야 「울림」이지 「퍼짐」이 아니다.
  const wall=[];
  for(let i=0;i<=44;i++){const aa=i/44*TAU;
    wall.push([cx+Math.cos(aa)*RR*1.22,cy+Math.sin(aa)*RR*1.22]);}
  celStroke(c,wall,1.8,tn,.18);                 // 접히는 자리
  for(let i=0;i<5;i++){
    const u=(t*.42+i/5)%1,pos=u*3.0,ph=pos%2,out=ph<1;
    const rr=RR*(.22+(out?ph:2-ph)*1.00);
    // 나갈 때는 굵고 밝게, 돌아올 때는 가늘고 어둡게 — 정지 화면에서도
    // 두 방향이 갈려야 「퍼짐」이 아니라 「왕복」으로 읽힌다.
    const al=Math.max(0,(1-u)*(out?1.0:.40));
    celHoop(c,cx,cy,rr,1,0,(out?9.5:2.4)*(1-u*.6)+.8,tn,al);
    const near=Math.abs(ph-1);
    if(near<.06){const f=1-near/.06;           // 벽에 닿는 순간만 달아오른다
      for(let k=0;k<9;k++){const a=k/9*TAU+i;
        celSpike(c,cx+Math.cos(a)*RR*1.22,cy+Math.sin(a)*RR*1.22,a+Math.PI,
          RR*.20*f,3.2*f+.4,tn,f*.9);}}}
}]);

FVSET.thunder.push(["제자리에서 운다 — 마디는 못 박히고 배만 부푼다. 배음이 갈아탄다",
function(c,cx,cy,RR,t,tn){
  // 회전이 없는 유일한 안. 소리는 도는 것이 아니라 **떠는 것**이라,
  // 마디(cos=0)는 절대 안 움직이고 배(cos=±1)만 안팎으로 부푼다.
  // 주기마다 배음이 3→4→5→7 로 갈아타고, 갈아탈 때만 진폭이 죽는다.
  const T=TONE[tn],MS=[3,4,5,7],P=2.0,cyc=(t/P)|0,u=(t%P)/P;
  const m=MS[cyc%4];
  const amp=.20*Math.min(1,u/.10)*Math.min(1,(1-u)/.14);
  const osc=Math.sin(t*(4.4+m*.55));
  const wave=(base,w,al,sg)=>{const Pt=[];
    for(let i=0;i<=72;i++){const aa=i/72*TAU;
      const rr=RR*base*(1+amp*Math.cos(m*aa)*osc*sg);
      Pt.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
    celStroke(c,Pt,w,tn,al);};
  wave(.94,4.6,.92,1);wave(.58,3.0,.55,-1);
  for(let k=0;k<m*2;k++){                       // 마디 — 못 박힌 자리
    const aa=(Math.PI/2+k*Math.PI)/m;
    fillPoly(c,jagPoly(cx+Math.cos(aa)*RR*.94,cy+Math.sin(aa)*RR*.94,
      2.8,5,k*2.7,1.25),A(T[2],.85));}
  for(let k=0;k<m;k++){                         // 배 — 부풀 때만 밖으로 뻗는다
    const aa=k*TAU/m,f=Math.max(0,osc);
    celSpike(c,cx+Math.cos(aa)*RR*1.02,cy+Math.sin(aa)*RR*1.02,aa,
      RR*.24*f,3.4,tn,.28+.62*f);}
  if(u<.10){const f=1-u/.10;                    // 갈아타는 순간
    celHoop(c,cx,cy,RR*(.90+.5*(1-f)),1,0,3*f+.5,tn,f*.8);}
}]);

FVSET.murk.push(["가라앉아 고인다 — 연(煙)이 오르는 것이라면 이쪽은 내려앉아 바닥을 긴다",
function(c,cx,cy,RR,t,tn){
  // 장기(瘴氣)는 무겁다. 연과 갈리는 축은 색이 아니라 **방향**이라, 여기서는
  // 아무것도 위로 안 간다: 덩이가 내려앉을수록 납작해지고, 바닥에 닿으면
  // 층이 되어 좌우로 기어나가며 옅어진다.
  const T=TONE[tn],by=cy+RR*.86;
  c.save();c.globalCompositeOperation="lighter";
  // 내려앉는 덩이 — 아래로 갈수록 **눌려 납작해진다.** 옅으면 그냥 안개라
  // 「내려온다」가 안 읽히므로, 위쪽에서부터 또렷하게 시작한다.
  for(let i=0;i<6;i++){const ph=(t*.20+i/6)%1;
    const x=cx+Math.sin(t*.5+i*2.3)*RR*.46*(1-ph*.55);
    const y=cy-RR*.86+ph*RR*1.70,rr=RR*(.22+ph*.26),sq=1-ph*.66;
    const g=c.createRadialGradient(0,0,0,0,0,rr);
    g.addColorStop(0,A(T[1],.34*(1-ph*.25)));
    g.addColorStop(.55,A(T[1],.16*(1-ph*.25)));g.addColorStop(1,A(T[0],0));
    c.save();c.translate(x,y);c.scale(1,sq);
    c.fillStyle=g;c.beginPath();c.arc(0,0,rr,0,TAU);c.fill();c.restore();}
  // 바닥에 늘 깔려 있는 층 — 이게 두꺼워야 「고였다」이지 「지나간다」가 아니다
  for(let i=0;i<5;i++){
    const x=cx+(hash(i*5.3)-.5)*RR*1.5+Math.sin(t*.4+i)*RR*.10;
    const y=by-RR*.10*hash(i*9.1),rr=RR*(.52+.22*hash(i*2.7));
    const g=c.createRadialGradient(0,0,0,0,0,rr);
    g.addColorStop(0,A(T[1],.30));g.addColorStop(1,A(T[0],0));
    c.save();c.translate(x,y);c.scale(1,.30);
    c.fillStyle=g;c.beginPath();c.arc(0,0,rr,0,TAU);c.fill();c.restore();}
  // 층에서 좌우로 새어 나가는 혀 — 위가 아니라 옆으로만 간다
  for(let i=0;i<6;i++){const ph=(t*.16+hash(i*3.7))%1,sg=(i%2)?1:-1;
    const x=cx+sg*(.25+ph*.95)*RR,y=by-RR*.05*hash(i*9.1),rr=RR*(.34+ph*.34);
    const g=c.createRadialGradient(0,0,0,0,0,rr);
    g.addColorStop(0,A(T[1],.26*(1-ph)));g.addColorStop(1,A(T[0],0));
    c.save();c.translate(x,y);c.scale(1,.22);
    c.fillStyle=g;c.beginPath();c.arc(0,0,rr,0,TAU);c.fill();c.restore();}
  c.restore();
  // 고인 것의 윗면 — 수면처럼 눌려 가운데가 처져 있어야 「고였다」가 된다
  const Pt=[];
  for(let i=0;i<=26;i++){const q=i/26;
    Pt.push([cx-RR*1.10+q*RR*2.20,
      by-RR*.26+Math.sin(q*Math.PI)*RR*.07+Math.sin(q*5.5+t*.9)*RR*.045]);}
  celStroke(c,Pt,4.6,tn,.80);
}]);

FVSET.murk.push(["뭉쳤다 흩어진다 — 모이는 자리가 매번 다르다. 자리를 안 지키는 것이 정체",
function(c,cx,cy,RR,t,tn){
  // 「떠돈다」를 사건으로 쓴 안. 흩어져 있던 것이 느리게 한 점으로 모여
  // 진해졌다가, 모인 순간을 못 버티고 확 풀려 옅어진다. 모이는 자리는
  // 사이클마다 다른 곳이라 중심이 없다 — 이 속성은 자리를 안 지킨다.
  const T=TONE[tn],P=3.0,cyc=(t/P)|0,u=(t%P)/P;
  const gx=cx+(hash(cyc*5.1)-.5)*RR*1.00,gy=cy+(hash(cyc*8.3)-.5)*RR*.90;
  const px=cx+(hash((cyc-1)*5.1)-.5)*RR*1.00,py=cy+(hash((cyc-1)*8.3)-.5)*RR*.90;
  const pull=u<.55?ease(u/.55):1,push=u<.55?0:(u-.55)/.45;
  c.save();c.globalCompositeOperation="lighter";
  for(let i=0;i<15;i++){
    const a=hash(i*4.7)*TAU,rad2=RR*(.55+.55*hash(i*9.3));
    const ox=px+Math.cos(a)*rad2,oy=py+Math.sin(a)*rad2*.9;
    const sx=ox+(gx+Math.cos(a+2.1)*RR*.10-ox)*pull;
    const sy=oy+(gy+Math.sin(a+2.1)*RR*.10-oy)*pull;
    const fx=sx+Math.cos(a+1.1)*RR*1.25*push,fy=sy+Math.sin(a+1.1)*RR*1.10*push;
    const rr=RR*(.13+.16*hash(i*11.7))*(1+push*1.5)*(1-pull*.32);
    const al=Math.max(0,(.28-.22*push)*(1-Math.abs(Math.sin(t*.6+i))*.2));
    const g=c.createRadialGradient(fx,fy,0,fx,fy,rr);
    g.addColorStop(0,A(T[1],al));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(fx,fy,rr,0,TAU);c.fill();}
  c.restore();
  // 모여 있는 동안만 덩어리가 진다 — 풀리면 형태도 같이 없어진다.
  // ⚠️ 여기에 고리를 얹었더니 중심 밖에 뜬 **밝은 원**이 되어 안개가 아니라
  // 렌즈 얼룩으로 보였다. 뭉침은 테두리가 아니라 **짙어짐**으로 그린다.
  const clump=Math.max(0,pull-push*2.2);
  if(clump>.06){
    fillPoly(c,jagPoly(gx,gy,RR*(.30+.06*clump),9,cyc*2.7,1.12),
      A(T[0],.55*clump));
    fillPoly(c,jagPoly(gx,gy,RR*(.19+.04*clump),9,cyc*2.7+1.1,1.08),
      A(T[1],.50*clump));}
}]);

FVSET.murk.push(["지나간다 — 한쪽에서 들어와 반대쪽으로 빠진다. 머무는 법이 없다",
function(c,cx,cy,RR,t,tn){
  // 바람을 탄 독은 제자리에 없다. 방사(바람 風)와 갈리는 축은 **방향**이다:
  // 여기서는 전부 한 방향으로 평행하게 통과하고, 그 방향 자체가 아주 느리게
  // 돌아간다. 들어오는 것과 나가는 것이 늘 함께 있어야 「지나가는 중」이다.
  const T=TONE[tn],wd=t*.10+.6,cw=Math.cos(wd),sw=Math.sin(wd);
  c.save();c.globalCompositeOperation="lighter";
  for(let i=0;i<7;i++){
    const p=(t*.24+hash(i*3.1))%1,off=(hash(i*7.7)-.5)*RR*1.9;
    const d=(p*2.9-1.45)*RR,rr=RR*(.26+.16*hash(i*11.3));
    const al=Math.sin(p*Math.PI)*.26;
    c.save();c.translate(cx+cw*d-sw*off,cy+sw*d+cw*off);c.rotate(wd);c.scale(2.0,.62);
    const g=c.createRadialGradient(0,0,0,0,0,rr);
    g.addColorStop(0,A(T[1],al));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(0,0,rr,0,TAU);c.fill();c.restore();}
  c.restore();
  // 흐름선 — 열린 곡선이라 리본을 써도 이음매가 없다. 방향을 못 박는다.
  for(let i=0;i<5;i++){
    const p=(t*.30+hash(i*5.9))%1,off=(hash(i*13.1)-.5)*RR*1.7;
    const al=Math.sin(p*Math.PI)*.75,Pt=[];
    for(let k=0;k<=9;k++){const q=k/9;
      const d=((p+(q-.5)*.30)*2.9-1.45)*RR;
      const ow=off+Math.sin(q*3.4+t*1.2+i)*RR*.10;
      Pt.push([cx+cw*d-sw*ow,cy+sw*d+cw*ow]);}
    celRibbon(c,Pt,4.2,tn,al);}
}]);

FVSET.murk.push(["소용돌이가 났다 풀린다 — 중심이 없고 매번 다른 자리에서 인다",
function(c,cx,cy,RR,t,tn){
  // 난류. 회오리(화풍)가 하나의 기둥이 서는 것이라면 이쪽은 **작은 와류가
  // 아무 데서나 났다가 풀리는 것**이라, 중심이 없고 오래가는 것도 없다.
  // 팔이 두 개뿐이고 수명이 짧아야 「나선 장식」이 아니라 「난류」로 읽힌다.
  const T=TONE[tn],LIFE=1.7;
  for(let i=0;i<4;i++){
    const phase=(t/LIFE)+hash(i*3.3);
    const s2=phase|0,u=phase-s2;
    const ox=cx+(hash(s2*7.1+i*5.3)-.5)*RR*1.30;
    const oy=cy+(hash(s2*11.7+i*2.9)-.5)*RR*1.15;
    const spin=hash(s2*4.3+i)<.5?-1:1;
    const grow=ease(Math.min(1,u/.35));
    const fade=Math.max(0,1-Math.max(0,(u-.45)/.55));
    const rr=RR*(.16+.34*grow);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(ox,oy,0,ox,oy,rr*1.5);
    g.addColorStop(0,A(T[1],.20*fade));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(ox,oy,rr*1.5,0,TAU);c.fill();c.restore();
    for(let k=0;k<2;k++){const Pt=[];
      for(let j=0;j<=10;j++){const q=j/10;
        const aa=k*Math.PI+spin*(t*1.9+u*3.4+q*2.6);
        const r2=rr*(.20+q*.95)*(1+.5*u);
        Pt.push([ox+Math.cos(aa)*r2,oy+Math.sin(aa)*r2*.88]);}
      celRibbon(c,Pt,3.8*fade+.4,tn,.75*fade);}}
}]);

// ── 2~5안 · 빙 갈래(자·역·설) ──────────────────────────────────
FVSET.magnet.push(["철가루가 장을 그린다 — 가닥 몇 개가 아니라 공간 전체가 빗질된다",
function(c,cx,cy,RR,t,tn){
  // **선을 그리지 않고 장(場)을 그린다.** 1안이 「자기력선 몇 가닥」이라면 이쪽은
  // 자석 위에 뿌린 철가루다: 조각 수십이 각자 제자리에서 장 방향으로 눕고,
  // 그 눕는 방향이 모여 저절로 힘줄기를 이룬다. 끌어당김이 궤적이 아니라
  // **공간이 통째로 정렬된 것**으로 읽힌다.
  const T=TONE[tn];
  // 정렬은 스위치다 — 풀리면 제멋대로 눕고 걸리면 일제히 선다.
  const lock=Math.pow(.5+.5*Math.sin(t*1.25),.7);
  // 쌍극자의 자기력선은 **r = L·sin²θ**(θ 는 축에서 잰 각). 진짜 식을 쓰므로
  // 조각이 진짜로 휘고, 극 근처에서 저절로 모인다 — 흩뿌리면 「가시 다발」이다.
  for(let j=0;j<4;j++){
    const LL=RR*(.80+j*.44);
    for(let side=-1;side<=1;side+=2)for(let k=0;k<8;k++){
      const sd=j*7.3+k*3.1+(side>0?0:1.9);
      const th=.26+(k+.5)/8*(Math.PI-.52)+(hash(sd)-.5)*.10;
      const at=dd=>{const a2=th+dd, sn=Math.sin(a2), r3=LL*sn*sn;
        return[cx+side*r3*sn, cy-r3*Math.cos(a2), r3];};
      const mid=at(0);
      if(mid[2]<RR*.52||mid[2]>RR*1.52)continue;
      // **정렬은 한꺼번에 걸리지 않는다 — 안에서 밖으로 퍼진다.** 전부 동시에
      // 서면 1안(연속 곡선)과 같은 그림이 되어 버린다. 걸리는 순서가 보여야
      // 「매질에 힘이 번지는 것」이지 「그려 둔 선」이 아니다.
      const lk=Math.min(1,Math.max(0,lock*1.75-(mid[2]/RR-.52)*.70));
      const half=.15*(.72+.5*lk);
      const wob=((hash(sd+4.3)-.5)*2.6+Math.sin(t*13+k*2.7+j)*.24)*(1-lk);
      const cw=Math.cos(wob), sw=Math.sin(wob);
      // 흐트러지면 제자리서 방향만 튼다 — 자리를 옮기면 「날아다니는 것」이 된다
      const P=[at(-half),mid,at(half)].map(q=>{
        const dx=q[0]-mid[0], dy=q[1]-mid[1];
        return[mid[0]+dx*cw-dy*sw, mid[1]+dx*sw+dy*cw];});
      const pol=.62+.62*Math.abs(mid[1]-cy)/(mid[2]||1);
      celStroke(c,P,2.5,tn,Math.min(.95,(.24+.60*lk)*(1.10-j*.10)*pol));
    }
  }
}]);

FVSET.magnet.push(["빨려든다 — 쇳조각이 끌려와 껍질에 붙고, 붙은 것은 삼켜진다",
function(c,cx,cy,RR,t,tn){
  // **끌어당김을 「물건」으로 보여준다.** 장을 그리면 힘은 추상이지만, 바깥에서
  // 쇳조각이 실제로 끌려 들어와 붙으면 무슨 일이 벌어지는지가 한눈에 읽힌다.
  // 가까울수록 빨라지고, 닿는 순간 튀고, 붙은 것은 못 떠난다.
  const T=TONE[tn], SH=RR*.74;
  // 붙는 자리(껍질) — 닫힌 것이라 **획**으로. 리본은 이음매에 구멍이 난다.
  // 도는 게 아니라 제자리서 떤다.
  const P=[];
  for(let i=0;i<=34;i++){const q=i/34*TAU;
    const w=1+.035*Math.sin(q*5+t*1.7)+.02*Math.sin(q*8-t*1.1);
    P.push([cx+Math.cos(q)*SH*w,cy+Math.sin(q)*SH*w]);}
  celStroke(c,P,3.0,tn,.40);
  for(let i=0;i<12;i++){
    const per=2.0+hash(i*5.3)*1.7, u=(t/per+hash(i*9.1))%1;
    const a=hash(i*3.7)*TAU, sz=RR*(.125+.075*hash(i*13.1));
    if(u<.72){
      // 끌려오는 중 — 지수 2.6 이라 마지막 순간에 확 빨린다
      const e=Math.pow(u/.72,2.6);
      const rr=RR*1.62-(RR*1.62-SH)*e, aa=a+e*.85;
      const x=cx+Math.cos(aa)*rr, y=cy+Math.sin(aa)*rr;
      const TR=[];
      for(let k=7;k>=0;k--){const q=Math.max(0,e-k*.06);
        const r2=RR*1.62-(RR*1.62-SH)*q, b=a+q*.85;
        TR.push([cx+Math.cos(b)*r2,cy+Math.sin(b)*r2]);}
      celStroke(c,TR,2.4,tn,.10+.46*e);           // 끌린 자국
      // 조각은 진행 방향이 아니라 **장 방향**으로 눕는다 — 그래서 자력이다.
      // 별이 아니라 납작한 덩어리라야 쇳조각이다(squash .60, spike .88).
      c.save();c.translate(x,y);c.rotate(aa);
      fillPoly(c,jagPoly(0,0,sz,6,i*2.7,.88,.60),A(T[0],.95));
      fillPoly(c,jagPoly(0,0,sz*.62,6,i*2.7+1.1,.86,.60),A(T[1],.97));
      fillPoly(c,jagPoly(0,0,sz*.28,6,i*2.7+2.3,.84,.60),A(T[2],.95));
      c.restore();
    }else{
      // 붙었다 — 떨다가 껍질에 삼켜진다. 「못 떠난다」가 끌어당김의 증거다
      const v=(u-.72)/.28, fade=1-v*v;
      const q=Math.sin(t*26+i*3.1)*.04*(1-v);
      const rr=SH*(1-v*.14)+Math.sin(t*20+i)*RR*.014;
      const x=cx+Math.cos(a+q)*rr, y=cy+Math.sin(a+q)*rr;
      c.save();c.translate(x,y);c.rotate(a+q);
      fillPoly(c,jagPoly(0,0,sz*(1-v*.28),6,i*2.7,.88,.60),A(T[0],.95*fade));
      fillPoly(c,jagPoly(0,0,sz*.62*(1-v*.28),6,i*2.7+1.1,.86,.60),A(T[1],.96*fade));
      fillPoly(c,jagPoly(0,0,sz*.28*(1-v*.28),6,i*2.7+2.3,.84,.60),A(T[2],.95*fade));
      c.restore();
      if(v<.18)celSplash(c,x,y,sz*1.25,7,i*3.3,tn,(1-v/.18)*.7);   // 붙는 순간
    }
  }
}]);

FVSET.magnet.push(["안으로는 못 들어온다 — 장이 껍질을 비껴 감고 옆구리에서 눌린다",
function(c,cx,cy,RR,t,tn){
  // **초전도의 진짜 그림(마이스너).** 부모가 「완전 전도」인데 1안은 그냥 자석이다.
  // 완전 전도체는 자기장을 **안으로 들이지 못한다** — 밖에서 오던 장이 껍질을
  // 감고 지나가고 경계 안은 텅 빈다. 끌어당김의 반대편 얼굴이라 고를 이유가
  // 분명하고, 비어 있는 속은 코어를 안 가린다.
  const T=TONE[tn], ex=RR*.60;
  // 흐름축은 **전체가 한 속도로** 돈다 — 가닥마다 다르면 서로 흩어져 찢어진다.
  const rot=t*.20;
  for(let j=0;j<5;j++){
    const psi=RR*(.09+j*.26);                    // 유선 하나 = 상수 하나
    for(let sgn=-1;sgn<=1;sgn+=2){
      const P=[];
      for(let i=0;i<=30;i++){
        const th=.05+i/30*(Math.PI-.10);
        // ψ = U·sinθ·(r − a²/r) 를 r 에 대해 푼 것. 경계 a 를 절대 안 넘는다.
        const kk=psi/Math.sin(th);
        const rr=(kk+Math.sqrt(kk*kk+4*ex*ex))/2;
        if(rr>RR*1.60)continue;                  // 화면 밖 꼬리는 버린다
        const g=(sgn>0?-th:th)+rot;
        P.push([cx+Math.cos(g)*rr,cy+Math.sin(g)*rr]);
      }
      if(P.length<3)continue;
      celStroke(c,P,2.8-j*.28,tn,.64-j*.09);
      for(let b=0;b<2;b++){                      // 흐르는 방향 — 구슬이 유선을 탄다
        const ph=(t*.42+j*.17+b*.5+(sgn>0?0:.25))%1;
        const q=P[Math.min(P.length-1,(ph*P.length)|0)];
        c.beginPath();c.arc(q[0],q[1],1.9,0,TAU);
        c.fillStyle=A(T[2],.85*Math.sin(ph*Math.PI));c.fill();
      }
    }
  }
  // 경계 — 여기서부터 못 들어온다. **안쪽이 비어 있는 것**이 이 안의 정체다.
  const B=[];
  for(let i=0;i<=30;i++){const q=i/30*TAU;
    const w=1+.03*Math.sin(q*6+t*2.3);
    B.push([cx+Math.cos(q)*ex*w,cy+Math.sin(q)*ex*w]);}
  celStroke(c,B,3.4,tn,.60);
}]);

FVSET.magnet.push(["둘이 서로를 당긴다 — 가닥이 팽팽해지고, 닿는 순간 튄다",
function(c,cx,cy,RR,t,tn){
  // **힘이 아니라 「두 물체 사이의 관계」를 그린다.** 1안은 자석 하나의 장이고,
  // 이쪽은 극이 다른 막대 둘이 서로에게 끌려가는 사건이다. 당길수록 가닥이
  // 곧고 팽팽해지고, 닿으면 튀었다가 다시 벌어진다.
  const T=TONE[tn], axr=t*.24;                   // 축은 통째로 한 속도로 돈다
  const u=saw(t,2.6), hit=u<.82?0:1-(u-.82)/.18;
  const pull=u<.82?ease(u/.82):1-hit;            // 붙었다 벌어지는 데까지 이어진다
  const d=RR*(1.22-.48*pull);
  const ux=Math.cos(axr), uy=Math.sin(axr);
  const ln=RR*.26, wd=RR*.105, tip=d-ln;
  // 막대 — **자석은 막대다.** 덩어리로 두면 「돌덩이 둘」이라 자성이 안 읽힌다.
  const bar=(s,f)=>{
    const bx=cx+ux*d*s, by=cy+uy*d*s, ang=axr+(s>0?Math.PI:0);
    const cs=Math.cos(ang), sn=Math.sin(ang);
    const mk=(a2,b2)=>[[-a2,-b2],[a2*.86,-b2],[a2,-b2*.58],[a2,b2*.58],[a2*.86,b2],[-a2,b2]]
      .map(p=>[bx+p[0]*cs-p[1]*sn,by+p[0]*sn+p[1]*cs]);
    fillPoly(c,mk(ln,wd),A(T[0],.96));
    fillPoly(c,mk(ln*.90,wd*.58),A(T[1],.97));
    // 마주보는 끝만 밝힌다 — **극이 있다**가 이 한 조각으로 읽힌다
    const cap=[[ln*.52,-wd*.44],[ln*.96,-wd*.34],[ln*.96,wd*.34],[ln*.52,wd*.44]]
      .map(p=>[bx+p[0]*cs-p[1]*sn,by+p[0]*sn+p[1]*cs]);
    fillPoly(c,cap,A(f?T[2]:T[0],f?1:.95));
  };
  // 사이를 잇는 가닥 — 느슨하면 배가 부르고, 당기면 곧아진다
  for(let j=-1;j<=1;j++){
    const bow=RR*(.30*j)*(1-pull*.66)*(1+.14*Math.sin(t*2.1+j*1.7));
    const P=[];
    for(let k=0;k<=14;k++){const q=k/14, s2=Math.sin(q*Math.PI);
      const px=cx-ux*tip+(ux*tip*2)*q, py=cy-uy*tip+(uy*tip*2)*q;
      P.push([px-uy*bow*s2,py+ux*bow*s2]);}
    celStroke(c,P,2.8+(1-Math.abs(j))*1.0,tn,.42+.48*pull);
  }
  bar(1,true);bar(-1,false);                     // 흰 극 · 어두운 극
  if(hit>0){
    for(let s=-1;s<=1;s+=2)
      celSplash(c,cx+ux*tip*s,cy+uy*tip*s,RR*.22*hit,7,s*3.3,tn,hit*.9);
    for(let i=0;i<4;i++){                        // 붙는 순간 옆으로 튄다
      const a=axr+Math.PI/2*(i<2?1:-1)+(i%2?.45:-.45);
      celSpike(c,cx+Math.cos(a)*RR*.34,cy+Math.sin(a)*RR*.34,a,RR*.46*hit,5.5*hit,tn,hit);}
  }
}]);

FVSET.plague.push(["옮는다 — 하나가 옆을 물들이고, 그 옆이 또 물든다",
function(c,cx,cy,RR,t,tn){
  // **번짐에 인과를 넣는다.** 1안의 반점은 서로 아무 상관 없이 제각각 떴다 진다
  // — 불규칙하지만 「전염」은 아니다. 이쪽은 하나가 터지면 실이 옆으로 뻗고,
  // 그 실이 닿은 자리가 다음에 터진다. **순서가 보여야** 역병이다.
  const T=TONE[tn], NN=7, PER=5.4;   // 자리 10→7 · 주기 4.6→5.4 (더 뜸하게)
  const nx=[],ny=[],ns=[];
  for(let i=0;i<NN;i++){
    // 자리는 고정 — 옮는 것이 사건이지 자리가 사건이 아니다. 배치만 불규칙하게.
    const a=i/NN*TAU+(hash(i*4.3)-.5)*.9;
    const rr=RR*(.56+.56*hash(i*8.9));
    nx.push(cx+Math.cos(a)*rr); ny.push(cy+Math.sin(a)*rr);
    ns.push(RR*(.10+.09*hash(i*2.7)));   // 크기 절반 — 기본은 조용해야 한다
  }
  const tt=t%PER;
  const lesion=(i,age)=>{
    if(age<0||age>2.7)return;
    const g=ease(Math.min(1,age/.62));
    const al=Math.min(1,age/.16)*Math.max(0,1-Math.max(0,age-.9)/1.8);
    if(al<=.01)return;
    const rr=ns[i]*(.34+.66*g)*(1+.10*Math.sin(t*3.1+i*2.3));
    fillPoly(c,jagPoly(nx[i],ny[i],rr,9,i*3.7,1.14),A(T[0],al*.60));
    fillPoly(c,jagPoly(nx[i],ny[i],rr*.64,9,i*3.7+1.4,1.10),A(T[1],al*.62));
    fillPoly(c,jagPoly(nx[i],ny[i],rr*.24,7,i*3.7+2.9,1.08),A(T[2],al*.45));
  };
  for(let i=0;i<NN;i++){
    const on=.10+i*.26+hash(i*6.1)*.16;          // 옮는 데 걸리는 시간이 제각각
    if(i>0){                                     // 옮는 실 — 발병 직전에만 보인다
      const age=tt-on;
      if(age>-.34&&age<.14){
        const f=Math.max(0,1-Math.abs(age+.10)/.24);
        const P=[];
        for(let k=0;k<=8;k++){const q=k/8;
          const mx=nx[i-1]+(nx[i]-nx[i-1])*q, my=ny[i-1]+(ny[i]-ny[i-1])*q;
          const w=Math.sin(q*Math.PI)*RR*.13*Math.sin(q*5.5+i*2.1);
          P.push([mx+w,my-w*.62]);}
        celStroke(c,P,1.8,tn,f*.42);
      }
    }
    lesion(i,tt-on);
    lesion(i,tt+PER-on);       // 앞 물결의 꼬리 — 물결 사이가 끊겨 보이면 안 된다
  }
}]);

FVSET.plague.push(["갉아먹힌다 — 더해지는 게 아니라 없어진다. 구멍이 커지고 부스러기가 진다",
function(c,cx,cy,RR,t,tn){
  // **역병은 더하는 것이 아니라 축내는 것이다.** 반점을 얹는 1안과 정반대로,
  // 창백한 막을 먼저 두르고 거기서 **빛을 파낸다**(destination-out). 열여섯 중
  // 유일하게 제 몸을 잃는 그림이라, 병이 장식이 아니라 손실로 읽힌다.
  const T=TONE[tn], MR=RR*.86;
  const P=[];
  for(let i=0;i<=44;i++){const q=i/44*TAU;
    const w=1+.08*Math.sin(q*3+.5)+.05*Math.sin(q*7-1.2)+.03*Math.sin(q*11+2.4);
    P.push([cx+Math.cos(q)*MR*w,cy+Math.sin(q)*MR*w]);}
  celStroke(c,P,RR*.30,tn,.82);                  // 닫힌 막이라 리본이 아니라 획
  // 파먹힌 자리 — 크기도 박자도 제각각이라야 「번짐」이지 무늬가 아니다
  const bite=[];
  for(let i=0;i<9;i++){
    const per=2.4+hash(i*5.1)*2.8, u=(t/per+hash(i*7.3))%1;
    const a=hash(i*3.3)*TAU+Math.sin(t*.5+i)*.05;
    const br=MR*(.86+.26*hash(i*11.7));
    const heal=u>.86?Math.max(0,1-(u-.86)/.14):1;   // 새 살이 덮으며 닫힌다
    bite.push({x:cx+Math.cos(a)*br, y:cy+Math.sin(a)*br,
      rr:RR*(.055+.10*hash(i*17.3)+.125*ease(Math.min(1,u/.72)))*heal, sd:i*4.1});
  }
  // 헐어 들어간 테 — **먼저 어둡게 깔고 그 안을 파낸다.** 구멍만 뚫으면 자국이
  // 너무 깨끗해 「도려낸 것」이 되고, 테가 남아야 썩어 들어간 것이 된다.
  for(const b of bite)if(b.rr>RR*.012)
    fillPoly(c,jagPoly(b.x,b.y,b.rr*1.13,8,b.sd,1.30),A(T[0],.92));
  c.save();c.globalCompositeOperation="destination-out";
  for(const b of bite)if(b.rr>RR*.012)
    fillPoly(c,jagPoly(b.x,b.y,b.rr,8,b.sd,1.28),"rgba(0,0,0,1)");
  c.restore();
  for(let i=0;i<7;i++){                          // 떨어져 나간 부스러기
    const per=1.9+hash(i*9.7)*1.5, u=(t/per+hash(i*2.3))%1;
    const a=hash(i*6.7)*TAU, rr=MR*(1.06+u*.48);
    const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr+u*u*RR*.28;
    fillPoly(c,jagPoly(x,y,RR*.05*(1-u*.4),5,i*3.1,1.4),A(T[0],(1-u)*.8));
    fillPoly(c,jagPoly(x,y,RR*.025*(1-u*.4),5,i*3.1+1.2,1.3),A(T[1],(1-u)*.7));
  }
}]);

FVSET.plague.push(["잠복한다 — 대부분 조용하다가 한꺼번에 터지고, 흉만 남는다",
function(c,cx,cy,RR,t,tn){
  // **역병의 정체는 모양이 아니라 박자다.** 1안은 늘 뭔가 떠 있어 「상태」로
  // 보인다. 이쪽은 평소엔 살갗 밑 힘줄만 희미하고, 어긋난 사인 셋이 겹치는
  // 순간에만 한꺼번에 부풀었다 꺼진다 — 규칙적으로 뛰면 장식이 되므로 주기를
  // 일부러 안 맞춘다.
  const T=TONE[tn];
  const drive=s=>Math.min(1,Math.max(0,(Math.sin(s*.83)+.72*Math.sin(s*.41+2.1)
    +.55*Math.sin(s*1.27+.7)-.10)/1.2));
  const out=drive(t);
  const scar=drive(t-1.5)*(1-Math.min(1,out*2.2));   // 지나간 자리
  const sweep=(t*.42)%1;
  for(let v=0;v<3;v++){
    // 힘줄은 **둘레를 따라 눕는다** — 코어에서 뻗어나가면 그건 마(痲)의 신경가지다
    const rad=RR*(.60+v*.24), a0=hash(v*3.1)*TAU, span=2.3+hash(v*7.7)*1.5;
    const P=[];
    for(let k=0;k<=16;k++){const q=k/16, aa=a0+q*span;
      const w=1+.24*Math.sin(q*5.5+v*2.3)+.13*Math.sin(q*9-v*1.7+t*.8);
      P.push([cx+Math.cos(aa)*rad*w,cy+Math.sin(aa)*rad*w]);}
    celStroke(c,P,2.6+out*2.2,tn,.26+out*.44);
    for(let k=0;k<7;k++){
      const q=(k+.5)/7, aa=a0+q*span;
      const w=1+.24*Math.sin(q*5.5+v*2.3)+.13*Math.sin(q*9-v*1.7+t*.8);
      const x=cx+Math.cos(aa)*rad*w, y=cy+Math.sin(aa)*rad*w;
      const d=((q+v*.31)-sweep+1)%1;
      const b=Math.max(0,1-d/.24)*out;           // 쓸고 지나가며 부푼다
      if(scar>.02){                              // 흉 — 터졌던 자리가 남는다
        fillPoly(c,jagPoly(x,y,RR*.05*(1+.3*hash(v*5+k)),6,v*4.1+k*1.7,1.2),
          A(T[0],scar*.42));
      }
      if(b<=.01)continue;
      const rr=RR*(.06+.15*b)*(1+.24*hash(v*5+k));
      fillPoly(c,jagPoly(x,y,rr,7,v*4.1+k*1.7,1.2),A(T[0],b*.92));
      fillPoly(c,jagPoly(x,y,rr*.60,7,v*4.1+k*1.7+1,1.15),A(T[1],b*.92));
      fillPoly(c,jagPoly(x,y,rr*.24,6,v*4.1+k*1.7+2,1.1),A(T[2],b*.85));
    }
  }
}]);

FVSET.plague.push(["딱지가 진다 — 마른 껍질이 들떠 떨어지고, 그 밑의 헌 살이 드러난다",
function(c,cx,cy,RR,t,tn){
  // **차가운 독은 안 썩는다 — 대신 마른다.** 반점(1안)이 「생기는 것」이라면
  // 이쪽은 **떨어져 나가는 것**이다.
  // ⚠️ 두 번 갈아엎었다. 등간격 판으로 쪼갰더니 **톱니바퀴**가 됐고(= 이 속성이
  // 제일 피해야 할 「장식」), 그냥 흩뿌렸더니 1안과 구별이 안 되는 얼룩이 됐다.
  // 답은 개수가 아니라 **들뜬 것이 보이게 하는 것** — 밑에 어두운 자국을 깔고
  // 조각을 어긋내 얹으면 그제야 「떠 있다」가 된다.
  const T=TONE[tn];
  for(let i=0;i<6;i++){
    const per=2.8+hash(i*5.7)*2.8, u=(t/per+hash(i*11.3))%1;
    const a=hash(i*3.9)*TAU, rad=RR*(.66+.40*hash(i*7.1));
    const sz=RR*(.21+.13*hash(i*13.7));
    const x=cx+Math.cos(a)*rad, y=cy+Math.sin(a)*rad;
    const lift=u<.26?0:(u<.62?ease((u-.26)/.36):1);
    const gone=u<.62?0:(u-.62)/.38;
    if(u>.22){                                   // 드러난 헌 살 — 딱지가 뜬 만큼 보인다
      const raw=Math.min(1,(u-.22)/.18)*(u>.88?Math.max(0,1-(u-.88)/.12):1);
      fillPoly(c,jagPoly(x,y,sz*1.04,9,i*7.3,1.10,.82),A(T[0],raw*.92));
      fillPoly(c,jagPoly(x,y,sz*.54,7,i*7.3+2.1,1.08,.82),A(T[2],raw*.22));
    }
    if(gone>=1)continue;
    // **어긋난 거리가 곧 들뜬 높이다.** 밑의 어두운 자국과 겹치지 않을수록 떠 보인다.
    const push=lift*RR*.13+gone*RR*.46, al=(1-gone*gone)*.95;
    const px=x+Math.cos(a)*push, py=y+Math.sin(a)*push+gone*gone*RR*.16;
    const sc=1+lift*.06-gone*.24;
    fillPoly(c,jagPoly(px,py,sz*sc,7,i*4.3,1.02,.82),A(T[0],al*.95));
    fillPoly(c,jagPoly(px,py,sz*sc*.70,7,i*4.3+1.3,1.00,.82),A(T[1],al*.96));
    // 들린 끝에 흰 앞날이 선다 — 얇은 것이 서 있어야 「마른 껍질」이다
    const e=jagPoly(px,py,sz*sc*.88,7,i*4.3,1.02,.82);e.push(e[0]);
    celStroke(c,e,1.9,tn,al*(.30+.55*lift));
  }
}]);

FVSET.snow.push(["쌓이다 무너진다 — 능선이 자라 어느 순간 제 무게로 쏟아진다",
function(c,cx,cy,RR,t,tn){
  // **바닥에 남는 것을 「선」이 아니라 「덩어리」로 그린다.** 1안의 바닥 획은
  // 자국이지 지형이 아니다. 이쪽은 높이가 자라는 단면이고, 자라기만 하는 게
  // 아니라 **제 무게를 못 이기면 무너진다** — 쌓임에 끝이 있어야 지형이 산다.
  const T=TONE[tn];
  const gy=cy+RR*1.06, X0=cx-RR*1.34, WD=RR*2.68, NN=28;
  const u=saw(t,4.8);
  const grow=ease(Math.min(1,u/.80));
  const col=u>.80?(u-.80)/.20:0;                 // 무너지는 정도
  const xr=cx+RR*.20;                            // 마루
  // 양 끝을 0 으로 재운다 — 안 그러면 **바닥에 깔린 막대**로 보인다(UI 처럼)
  const win=x=>Math.pow(Math.max(0,1-Math.pow(Math.abs(x-cx)/(RR*1.32),2.4)),.75);
  const hAt=x=>{
    const d=(x-xr)/(RR*.60);
    // 한쪽은 완만하고 한쪽은 급하다 — 좌우 대칭이면 「무더기」이지 지형이 아니다
    const ridge=Math.exp(-d*d*(d>0?2.6:1.0));
    const rough=1+.5*(.16*Math.sin(x*.14+1.3)+.10*Math.sin(x*.31-2.2));
    const base=RR*.10, peak=RR*(.66*ridge+.14)*rough;
    const h=base+(peak-base)*grow;
    const flat=base+RR*.19*Math.exp(-d*d*.35);   // 무너진 뒤 — 마루가 깎이고 퍼진다
    return (h+(flat-h)*ease(col))*win(x);
  };
  const P=[];
  for(let i=0;i<=NN;i++){const x=X0+WD*i/NN;P.push([x,gy-hAt(x)]);}
  const foot=[[X0+WD,gy+RR*.55],[X0,gy+RR*.55]];
  fillPoly(c,P.concat(foot),A(T[0],.95));                        // 푸른 그늘
  fillPoly(c,P.map(p=>[p[0],p[1]+RR*.09]).concat(foot),A(T[1],.96));
  celStroke(c,P,2.6,tn,.95);                                     // 마루선
  if(col>0)for(let i=0;i<5;i++){                 // 쏟아져 내리는 덩이
    const f=Math.min(1,col*1.5+hash(i*3.1)*.18);
    const x=xr+RR*(.06+.55*hash(i*7.7))+f*RR*.55;
    const y=gy-hAt(xr)*(1-f*.85)+f*f*RR*.34;
    c.save();c.translate(x,y);c.rotate(f*2.6+i);
    fillPoly(c,jagPoly(0,0,RR*(.075+.05*hash(i*5.3))*(1-col*.30),6,i*2.9,1.3),
      A(T[1],(1-col*.7)*.95));
    c.restore();
  }
  for(let i=0;i<12;i++){                         // 내리는 눈 — 쌓이는 이유
    const ph=(t*.42+hash(i*3.7))%1;
    const x=cx+(hash(i*8.1)-.5)*RR*2.3+Math.sin(t*1.1+i)*RR*.10;
    const y=cy-RR*1.15+ph*RR*2.0;
    if(y>gy-hAt(x))continue;
    c.beginPath();c.arc(x,y,1.5+hash(i*2.3)*1.2,0,TAU);
    c.fillStyle=A(T[2],(1-ph*.5)*.72*(1-col));c.fill();
  }
}]);

FVSET.snow.push(["얹힌다 — 어깨에 눈이 앉고, 무거워지면 툭 떨어진다",
function(c,cx,cy,RR,t,tn){
  // **바닥이 아니라 「위」에 쌓는다.** 눈이 바닥에만 앉으면 배경이지만, 몸 위에
  // 얹히면 이 캐릭터에게 일어난 일이 된다. 무게가 차면 떨어진다 — 중력이 두 번
  // 읽히는 유일한 안(쌓일 때 · 떨어질 때).
  const T=TONE[tn];
  // 어깨에 **붙여** 앉힌다 — 띄우면 눈이 아니라 떠 있는 초승달로 보인다
  const LED=[[-Math.PI/2,.52,3.6,0,.82],[-Math.PI/2-1.48,.50,4.7,.35,.32],
             [-Math.PI/2+1.48,.50,5.4,.72,.32]];
  for(let i=0;i<3;i++){
    const ac=LED[i][0], ri=RR*LED[i][1], per=LED[i][2], off=LED[i][3], half=LED[i][4];
    const u=(t/per+off)%1;
    const load=u<.86?ease(u/.86):0;
    const drop=u<.86?0:(u-.86)/.14;
    const th=RR*(.05+(i?.20:.26)*load)*(1-drop);
    const P=[];
    for(let k=0;k<=10;k++){const b=ac-half+2*half*k/10;
      P.push([cx+Math.cos(b)*ri,cy+Math.sin(b)*ri]);}
    const top=[];
    for(let k=10;k>=0;k--){const b=ac-half+2*half*k/10;
      // 가장자리가 처마처럼 나온다 — 그래야 「얹힌 것」이지 칠한 것이 아니다
      const bump=1+.20*Math.sin(k*1.9+i*2.3)+.14*hash(k*3.1+i);
      const rr=ri+th*bump*Math.pow(Math.sin(Math.PI*k/10),.30);
      top.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr]);}
    fillPoly(c,P.concat(top),A(T[0],.95));
    fillPoly(c,P.concat(top.map(p=>[cx+(p[0]-cx)*.94,cy+(p[1]-cy)*.94])),A(T[1],.96));
    celStroke(c,top.slice().reverse(),2.0,tn,.85);        // 흰 마루
    if(drop>0)for(let k=0;k<3;k++){                       // 무게를 못 이겨 떨어진다
      const b=ac-half*.7+half*1.4*k/2;
      const f=Math.min(1,drop*1.4+hash(k*3.7+i)*.2);
      const x=cx+Math.cos(b)*(ri+RR*.20)+(hash(k*5.1+i)-.5)*RR*.10;
      const y=cy+Math.sin(b)*(ri+RR*.20)+f*f*RR*1.35;
      c.save();c.translate(x,y);c.rotate(f*2.2+k);
      fillPoly(c,jagPoly(0,0,RR*(.085+.045*hash(k*9.1+i)),6,k*3.3+i,1.25),
        A(T[1],(1-f*.6)*.95));
      c.restore();
    }
  }
  for(let i=0;i<11;i++){                          // 위에서 온다 — 방향이 있다
    const ph=(t*.36+hash(i*4.9))%1;
    const x=cx+(hash(i*8.7)-.5)*RR*2.1+Math.sin(t*1.2+i)*RR*.12;
    const y=cy-RR*1.25+ph*RR*1.9;
    c.beginPath();c.arc(x,y,1.4+hash(i*2.7)*1.2,0,TAU);
    c.fillStyle=A(T[2],(1-ph*.45)*.7);c.fill();
  }
}]);

FVSET.snow.push(["옮겨 간다 — 바람이 마루를 깎아 날리고, 그만큼 반대편에 쌓는다",
function(c,cx,cy,RR,t,tn){
  // **쌓인 것은 가만있지 않는다.** 다른 부모가 바람이라는 사실이 여기서만
  // 일한다: 눈은 늘지도 줄지도 않고 **자리를 옮긴다.** 마루에서 깎여 날린 것이
  // 바람 아래쪽에 앉으며 능선 전체가 옆으로 걸어간다.
  const T=TONE[tn];
  const gy=cy+RR*1.06, X0=cx-RR*1.34, WD=RR*2.68, NN=32;
  const wind=Math.sin(t*.31);                     // 바람은 세기도 방향도 바뀐다
  const sg=wind>=0?1:-1;
  const xc=cx+wind*RR*.66;                        // 마루가 실려 간다
  const win=x=>Math.pow(Math.max(0,1-Math.pow(Math.abs(x-cx)/(RR*1.32),2.4)),.75);
  const hAt=x=>{
    const d=(x-xc)/(RR*.58);
    const steep=d*sg>0?4.4:.85;                   // 바람 등진 쪽이 급하다
    // 결(사스트루기)도 바람을 따라 흘러간다 — 표면이 깎이는 중이라는 표시
    const rip=1+.17*Math.sin(x*.30-t*1.6*sg)+.10*Math.sin(x*.61+t*.9*sg);
    return RR*(.11+.34*Math.exp(-d*d*steep))*rip*win(x);
  };
  const P=[];
  for(let i=0;i<=NN;i++){const x=X0+WD*i/NN;P.push([x,gy-hAt(x)]);}
  const foot=[[X0+WD,gy+RR*.55],[X0,gy+RR*.55]];
  fillPoly(c,P.concat(foot),A(T[0],.95));
  fillPoly(c,P.map(p=>[p[0],p[1]+RR*.085]).concat(foot),A(T[1],.96));
  celStroke(c,P,2.4,tn,.92);
  // 깎여 날리는 것 — 마루에서 떠 바람 아래쪽에 내려앉는다(옮겨 가는 물질)
  for(let i=0;i<16;i++){
    const ph=(t*.55+hash(i*3.1))%1;
    const x=xc+sg*ph*RR*1.20;
    const y=gy-hAt(xc)-Math.sin(ph*Math.PI)*RR*.34-RR*.03;
    celStroke(c,[[x,y],
      [x-sg*RR*.11,y+RR*.020*Math.sin(t*6+i*1.7)],
      [x-sg*RR*.22,y+RR*.05]],1.9,tn,Math.sin(ph*Math.PI)*.75);
  }
}]);

FVSET.snow.push(["층이 된다 — 한 번 온 눈이 한 겹으로 남아, 언제 왔는지가 보인다",
function(c,cx,cy,RR,t,tn){
  // **쌓임에는 역사가 있다.** 다른 안들이 「지금 얼마나 쌓였나」를 보여준다면
  // 이쪽은 **언제 왔는지**를 보여준다: 한 번의 눈이 한 겹으로 남고, 아래로
  // 갈수록 눌려 얇고 푸르러진다. 열여섯 중 지나간 시간이 남는 유일한 안이다.
  const T=TONE[tn];
  const gy=cy+RR*1.26, X0=cx-RR*1.34, WD=RR*2.68, NN=26, PER=1.8, LN=4;
  const k0=Math.floor(t/PER), frac=(t/PER)%1;
  const th=age=>RR*.30/(1+age*.48);               // 오래된 층은 눌려 얇아진다
  const win=x=>Math.pow(Math.max(0,1-Math.pow(Math.abs(x-cx)/(RR*1.32),2.4)),.55);
  let y=gy;
  for(let j=LN-1;j>=0;j--){
    const id=k0-j, age=frac+j;
    let h=th(age); if(j===0)h*=Math.min(1,frac/.42);   // 지금 오는 중인 층
    const P=[];
    for(let i=0;i<=NN;i++){const x=X0+WD*i/NN;
      // 층마다 제 얼굴이 있다 — 그날 눈이 어떻게 왔는지가 표면에 남는다
      const face=1+.12*Math.sin(x*.17+id*2.1)+.08*Math.sin(x*.36-id*1.3);
      P.push([x,y-h*face*win(x)]);}
    fillPoly(c,P.concat([[X0+WD,y+1],[X0,y+1]]),
      A(j===0?T[2]:(j===1?T[1]:T[0]),j>2?.82:.96));
    celStroke(c,P,1.8,tn,.42+.44*(1-Math.min(1,age/LN)));   // 층 경계 = 기록
    y-=h;
  }
  if(frac<.46)for(let i=0;i<14;i++){              // 내린다 → 층이 는다. 그치면 멈춘다
    const ph=(t*.9+hash(i*3.3))%1;
    const x=cx+(hash(i*7.1)-.5)*RR*2.3+Math.sin(t*1.3+i)*RR*.08;
    const yy=cy-RR*1.20+ph*RR*2.1;
    if(yy>y)continue;
    c.beginPath();c.arc(x,yy,1.4+hash(i*5.9)*1.1,0,TAU);
    c.fillStyle=A(T[2],(1-frac/.46)*.8*(1-ph*.4));c.fill();
  }
}]);

// ── 반려된 안 ─────────────────────────────────────────────────────────
//
// **둘레 모티프는 몸에 속한 것이라야 한다.** 몸은 탑다운에서 **떠 있는 빛**
// 이라 발밑에 지면이 없다 — 그런데 배치할 자리를 안 정해 두니 여러 안이
// 「캐릭터에 배경 데코를 붙인」 그림이 됐다(2026-08-09 반려).
//
// 걸러낸 세 유형:
//   ① **지면·천장** — 칸 아래(위)에 가로로 눕는 것. 지형이 생겨 버린다
//   ② **전면 텍스처** — 칸 전체를 덮는 격자·사선. 그건 세계지 몸이 아니다
//   ③ **코어 복제** — 각진 별을 또 그리는 것. 몸이 여럿으로 보인다
//
// 안을 지우지 않고 **여기 한 곳에서 걷어낸다** — 왜 떨어졌는지가 남아야
// 같은 실수를 반복하지 않는다.
const FVDROP={
  snow  :[1,3,4],  // ① 2·4안 설산, 5안 지층 — 발밑에 지형이 생겼다
  // 연 — **융화 발현 후보가 없다**(2026-08-09 판정). 남은 안들이 전부 조용해
  // 「기본」쪽이라, 확정된 기본(재가 뜬다)만 남기고 나머지를 걷어낸 뒤 발현용을
  // 새로 뽑는다. ① 옛 4안은 천장에 닿아 깔려 반려(위쪽 가로 띠 = 천장).
  smoke :[0,1,3,4],
  murk  :[1],      // ① 2안 내려앉아 고임 — 아래 가로선이 지면이 된다
  aqua  :[3,4],    // ② 4안 전면 그물 ③ 5안 각진 별 다섯 = 코어 복제
  // 불씨 — 연과 같은 이유. 확정된 기본(꺼질 듯 말 듯)만 남긴다.
  fstorm:[1,2,3,4],
  magnet:[4],      // ② 5안 막대자석 — 칸을 가로지르는 **물체**지 기운이 아니다
  plague:[4],      // ③ 5안 딱지 — 별이 든 덩어리라 코어가 여럿으로 보인다
};
Object.keys(FVDROP).forEach(k=>{
  FVDROP[k].slice().sort((a,b)=>b-a).forEach(i=>FVSET[k].splice(i,1));});

// ── 추가안 — 반려로 빈 자리를 메우거나 합친 것 ─────────────────────────
// **`FVDROP` 아래에 둔다** — 걷어내기는 원래 번호로 도는데 여기서 뒤에
// 붙으면 그 번호가 안 밀린다.

// 플라즈마 6안 — **1안 + 2안.** 1안은 코어↔껍질을 잇고 2안은 필라멘트끼리
// 꼬인다. 실제 핀치 불안정이 정확히 그 둘의 합이다: 전류가 흐르는 가닥은
// 자기장으로 서로를 조이다가, 조인 목이 끊길 듯해지면 다시 갈라진다.
FVSET.blast.push(["**땋인다** — 두 가닥이 서로를 감으며 껍질까지 간다",
function(c,cx,cy,RR,t,tn){
  // 1안(코어↔껍질을 잇는다) + 2안(필라멘트끼리 꼬인다). 실제 핀치 불안정이
  // 정확히 그 둘의 합이다 — 전류가 흐르는 가닥은 자기장으로 서로를 조인다.
  //
  // ⚠️ 처음엔 마디를 8개만 쓰고 마디마다 흔들었더니 **꼬임이 안 보이고
  // 그냥 각진 선**이 됐다(2026-08-09). 땋임은 **매끄러워야** 읽힌다 —
  // 마디를 늘리고 흔들림을 빼고, 감는 진폭을 **가운데서 최대**로 둔다
  // (양 끝은 0 이라야 코어와 껍질에 얌전히 붙는다).
  const T=TONE[tn];
  celHoop(c,cx,cy,RR*1.02,1,t*.14,2.2,tn,.34);
  celHoop(c,cx,cy,RR*.99,1,-t*.09,1.1,tn,.20);
  c.save();c.globalCompositeOperation="lighter";
  const sh=c.createRadialGradient(cx,cy,RR*.5,cx,cy,RR*1.04);
  sh.addColorStop(0,A(T[1],0));sh.addColorStop(.82,A(T[1],.06));
  sh.addColorStop(1,A(T[2],.16));
  c.fillStyle=sh;c.beginPath();c.arc(cx,cy,RR*1.04,0,TAU);c.fill();c.restore();
  for(let p=0;p<3;p++){
    const a0=p/3*TAU+t*.30;
    const pinch=.6+.4*Math.sin(t*1.9+p*2.1);     // 조임이 숨쉬듯 변한다
    const ends=[];
    for(const sgn of[-1,1]){
      const P2=[];
      for(let k=0;k<=18;k++){const q=k/18;
        const amp=.46*Math.sin(q*Math.PI);        // 양 끝 0 · 가운데 최대
        const aa=a0+sgn*amp*Math.sin(q*6.4+t*3.4+p*1.7);
        const rr=RR*q*(1-.14*pinch*Math.sin(q*Math.PI));
        P2.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
      celStroke(c,P2,3.4,tn,.92);ends.push(P2[P2.length-1]);}
    // 껍질에 붙은 발 — 두 가닥이 같은 자리로 모여 하나로 닿는다.
    for(const e of ends){
      c.save();c.globalCompositeOperation="lighter";
      const g=c.createRadialGradient(e[0],e[1],0,e[0],e[1],11);
      g.addColorStop(0,A(T[2],.95));g.addColorStop(1,A(T[1],0));
      c.fillStyle=g;c.beginPath();c.arc(e[0],e[1],11,0,TAU);c.fill();c.restore();}
    // 조인 목이 밝다 — 전류가 몰리는 자리. 「꼬였다」의 증거다.
    const nr=RR*.5, nx=cx+Math.cos(a0)*nr, ny=cy+Math.sin(a0)*nr;
    c.save();c.globalCompositeOperation="lighter";
    const gn=c.createRadialGradient(nx,ny,0,nx,ny,RR*.26);
    gn.addColorStop(0,A(T[2],Math.max(0,.26*pinch)));gn.addColorStop(1,A(T[1],0));
    c.fillStyle=gn;c.beginPath();c.arc(nx,ny,RR*.26,0,TAU);c.fill();c.restore();}
  c.save();c.globalCompositeOperation="lighter";
  const g2=c.createRadialGradient(cx,cy,0,cx,cy,RR*.72);
  g2.addColorStop(0,A(T[2],.34+.10*Math.sin(t*3.1)));
  g2.addColorStop(.5,A(T[1],.18));g2.addColorStop(1,A(T[1],0));
  c.fillStyle=g2;c.beginPath();c.arc(cx,cy,RR*.72,0,TAU);c.fill();c.restore();}]);

// 자 6안 — **1안 + 3안.** 1안은 장(場)을 곡선으로 그리고 3안은 쇳조각이
// 실제로 끌려온다. 실제 철가루가 하는 일이 정확히 그 둘의 합이다 —
// **선을 타고 극으로 미끄러져 붙는다.** 장은 추상이고 조각은 물건인데,
// 조각이 선 위를 달리면 **선이 길이라는 것**이 보인다.
FVSET.magnet.push(["**선을 타고 극으로 미끄러진다** — 장이 길이 되고 조각이 그 길을 간다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], PY=RR*.92;
  // 자기력선 — 극에서 극으로 닫힌 곡선. 조각이 달릴 **길**이라 1안보다 옅다.
  const pt=(sgn,w,q)=>[cx+Math.sin(q*Math.PI)*w*sgn,cy-Math.cos(q*Math.PI)*PY];
  const LN=[];
  for(const sgn of[-1,1])for(let k=0;k<3;k++){
    const w=RR*(.40+k*.30);LN.push([sgn,w]);
    const P2=[];for(let i=0;i<=22;i++)P2.push(pt(sgn,w,i/22));
    celStroke(c,P2,2.0-k*.4,tn,.22-k*.05);}   // 길은 흐릿하다 — 주인공은 조각
  // 조각 — 길 위를 달린다. **적도에서 극으로**, 가까울수록 빨라진다.
  for(let i=0;i<16;i++){
    const [sgn,w]=LN[i%LN.length];
    const dir=hash(i*5.9)>.5?1:-1;                  // 위 극 / 아래 극
    const per=1.5+hash(i*3.1)*1.3, u=(t/per+hash(i*7.7))%1;
    const sz=RR*(.11+.06*hash(i*11.3));
    if(u<.80){
      const e=Math.pow(u/.80,2.4);                  // 마지막에 확 빨린다
      const q=.5+dir*.5*e, p=pt(sgn,w,q);
      // 끌린 자국 — 어느 길로 왔는지가 보여야 「선을 탔다」가 된다.
      const TR=[];
      for(let k=8;k>=0;k--){const e2=Math.max(0,e-k*.055);
        TR.push(pt(sgn,w,.5+dir*.5*e2));}
      celStroke(c,TR,2.8,tn,Math.max(0,.14+.62*e));   // 끌린 자국이 진해야 「달렸다」
      // 조각은 **길의 방향으로 눕는다** — 그래서 자력이다.
      const p2=pt(sgn,w,q+dir*.02);
      const ang=Math.atan2(p2[1]-p[1],p2[0]-p[0]);
      c.save();c.translate(p[0],p[1]);c.rotate(ang);
      fillPoly(c,jagPoly(0,0,sz,6,i*2.7,.88,.60),A(T[0],.95));
      fillPoly(c,jagPoly(0,0,sz*.62,6,i*2.7+1.1,.86,.60),A(T[1],.97));
      fillPoly(c,jagPoly(0,0,sz*.28,6,i*2.7+2.3,.84,.60),A(T[2],.95));
      c.restore();
    }else{
      // 극에 붙었다 — 떨다가 삼켜진다. **못 떠나는 것**이 끌어당김의 증거다.
      const v=(u-.80)/.20, fade=Math.max(0,1-v*v);
      const p=pt(sgn,w,dir>0?1:0);
      const jx=Math.sin(t*24+i*3.1)*RR*.012*(1-v);
      c.save();c.translate(p[0]+jx,p[1]-dir*RR*.02*v);c.rotate(Math.PI/2);
      fillPoly(c,jagPoly(0,0,sz*(1-v*.3),6,i*2.7,.88,.60),A(T[0],.9*fade));
      fillPoly(c,jagPoly(0,0,sz*.55*(1-v*.3),6,i*2.7+1.1,.86,.60),A(T[1],.95*fade));
      c.restore();}}
  // 극 — 길이 모이는 곳. 조각이 도착할수록 밝아진다.
  for(const sy of[-1,1]){
    const py=cy+sy*PY;
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(cx,py,0,cx,py,RR*.30);
    g.addColorStop(0,A(T[2],.42+.10*Math.sin(t*2.6+sy)));g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(cx,py,RR*.30,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(cx,py,RR*.13,5,sy*3.1+t*.4,1.3),A(T[2],.92));}}]);

// 마 6안 — **1안 + 5안.** 1안은 코어에서 가지가 뻗고, 5안은 그물이 토막난다.
// 실제 신경이 그 둘의 합이다: **가지가 뻗어 서로 만나 그물이 되고, 신호는
// 그 그물을 타고 번지다 죽은 마디 앞에서 멈춘다.** 1안은 끝이 꺼지는 것만
// 보이고 5안은 어디서 왔는지가 없었는데, 합치면 **경로**가 생긴다.
FVSET.numb.push(["**뻗어 그물이 되고, 신호가 죽은 마디에서 멈춘다**",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NB=6;
  // 마디 — 코어에서 뻗은 가지의 끝. 두 겹(안·바깥)이라 그물이 된다.
  const nd=[];
  for(let ring=0;ring<2;ring++){
    const n=NB*(ring+1), rr=RR*(ring?.92:.48);
    for(let i=0;i<n;i++){
      const a=i/n*TAU+ring*.5+t*.06;
      const w=1+.06*Math.sin(t*1.7+i*2.1);
      nd.push({x:cx+Math.cos(a)*rr*w,y:cy+Math.sin(a)*rr*w,ring,i,n,
        dead:hash(i*7.3+ring*31+((t*.55)|0)*13)<.24});}}
  const inner=nd.filter(v=>v.ring===0), outer=nd.filter(v=>v.ring===1);
  // 신호 — 코어에서 바깥으로 번진다. **죽은 마디를 못 넘는다.**
  const pu=saw(t,2.2), front=ease(pu);
  const seg=(p,q,al,w)=>celStroke(c,[[p.x,p.y],
    [(p.x+q.x)/2+(hash(p.i*3.1+q.i)-.5)*RR*.10,(p.y+q.y)/2+(hash(p.i*5.7+q.i)-.5)*RR*.10],
    [q.x,q.y]],w,tn,Math.max(0,al));
  // ① 코어 → 안쪽 마디 (1안의 가지)
  for(const v of inner){
    const lit=front>.28&&!v.dead;
    seg({x:cx,y:cy,i:0},v,v.dead?.14:(lit?.95:.42),v.dead?2.2:3.8);}
  // ② 안쪽 → 바깥 마디, ③ 바깥끼리 (5안의 그물)
  for(const v of outer){
    const p=inner[Math.round(v.i/2)%inner.length];
    const blocked=p.dead||v.dead;
    seg(p,v,blocked?.12:(front>.62?.85:.34),blocked?1.8:3.0);
    const q=outer[(v.i+1)%outer.length];
    seg(v,q,(v.dead||q.dead)?.10:(front>.82?.6:.24),2.2);}
  // 마디 자체 — 산 것은 밝고 **죽은 것은 어둡게 남는다**(사라지지 않는다).
  for(const v of nd){
    const rr=RR*(v.ring?.055:.075);
    if(v.dead){fillPoly(c,jagPoly(v.x,v.y,rr*.8,5,v.i*2.3,1.2),A(T[0],.9));}
    else{
      const on=front>(v.ring?.62:.28);
      fillPoly(c,jagPoly(v.x,v.y,rr,5,v.i*2.3,1.3),A(T[0],.95));
      fillPoly(c,jagPoly(v.x,v.y,rr*.55,5,v.i*2.3+1,1.2),A(T[on?2:1],on?1:.7));}}
  // 번짐의 앞머리 — 어디까지 갔는지. 이것 하나로 「멈췄다」가 읽힌다.
  celHoop(c,cx,cy,RR*(.18+front*.86),1,0,3*(1-pu)+.6,tn,Math.max(0,(1-pu)*.45));}]);

// 장 6안 — **장 1안 + 뢰명 5안.** 1안은 안개가 떠돌고, 뢰명 5안은 정상파라
// 회전 없이 마디가 못 박히고 배만 부푼다. 합치면 **고여서 물결치는 것**이
// 된다 — 장(瘴)의 「자리를 안 지킨다」가 「제자리서 살아 있다」로 바뀐다.
// 정상파는 **진행하지 않는 파동**이라, 도는 것도 흩어지는 것도 아닌 셋째가
// 나온다. 배음이 3→4→5→7 로 갈아타 같은 그림이 반복되지 않는다.
FVSET.murk.push(["**고여서 물결친다** — 도는 게 아니라 제자리서 배만 부푼다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const NH=[3,4,5,7], n=NH[Math.floor(t/3.6)%4];
  const osc=Math.sin(t*1.45);
  const rAt=a=>RR*(.64+.30*Math.cos(n*a)*osc);
  // 안개 — 윤곽을 따라 앉는다. **배에서 진하고 마디에서 옅다.**
  c.save();c.globalCompositeOperation="lighter";
  for(let k=0;k<26;k++){const a=k/26*TAU;
    const amp=Math.abs(Math.cos(n*a));
    const r=rAt(a), x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.92;
    const rr=RR*(.19+.15*amp);
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],Math.max(0,.09+.15*amp*Math.abs(osc))));
    g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.restore();
  // 윤곽 — **회전이 없어야** 「고였다」가 된다. 도는 순간 그냥 안개다.
  const P2=[];for(let k=0;k<=64;k++){const a=k/64*TAU;
    P2.push([cx+Math.cos(a)*rAt(a),cy+Math.sin(a)*rAt(a)*.92]);}
  celStroke(c,P2,3.0,tn,.52);
  // 마디 — **안 움직이는 자리.** 못 박혀 있다는 표시가 있어야 정상파다.
  for(let k=0;k<n*2;k++){
    const a=(Math.PI/2+k*Math.PI)/n;
    const r=RR*.64;
    celSpike(c,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.92,a,RR*.10,2.2,tn,.42);}
  // 삼엽 — 독의 모티프. 부모가 누구인지 이 하나로 말한다. 아주 느리게.
  for(let k=0;k<3;k++){const a=k/3*TAU+t*.16,P3=[];
    for(let j=0;j<=7;j++){const q=j/7,aa=a+q*.95,r2=RR*(.26+q*.24);
      P3.push([cx+Math.cos(aa)*r2,cy+Math.sin(aa)*r2]);}
    celRibbon(c,P3,4.4,tn,.55);}}]);

// ── 역(疫) — 「깨진 얼음벽」 결로 셋 더. 1안이 통과했으니 그 문법을 판다 ──
// 공통 규칙: 판은 **고르면 안 된다**(고르면 톱니바퀴다) · 부러진 자리가 있어야
// 벽이고 · 얼음 결(밝은 빗금)이 있어야 유리다.

FVSET.plague.push(["**두 겹 벽** — 안팎이 어긋나 있고, 그 틈으로 병이 샌다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const wall=(rIn,nb,ph,sc,al)=>{
    const gaps=[];
    for(let i=0;i<nb;i++){
      const jit=(hash(i*13.7+ph*7)-.5)*(TAU/nb)*.5;
      const broke=hash(i*17.3+ph*11)<.30;
      const a=i/nb*TAU+t*(.07*(ph?-1:1))+ph+jit;
      if(broke){gaps.push(a);continue;}
      const h=RR*(.11+.15*hash(i*4.3+ph))*sc, hw=TAU/nb*(.30+.20*hash(i*23.1));
      const P4=[[cx+Math.cos(a-hw)*rIn,cy+Math.sin(a-hw)*rIn],
                [cx+Math.cos(a-hw*.6)*(rIn+h),cy+Math.sin(a-hw*.6)*(rIn+h)],
                [cx+Math.cos(a+hw*.6)*(rIn+h*(.55+.5*hash(i*9.1))),
                 cy+Math.sin(a+hw*.6)*(rIn+h*(.55+.5*hash(i*9.1)))],
                [cx+Math.cos(a+hw)*rIn,cy+Math.sin(a+hw)*rIn]];
      fillPoly(c,P4,A(T[0],.92*al));
      fillPoly(c,P4.map(p=>[cx+(p[0]-cx)*.94,cy+(p[1]-cy)*.94]),A(T[1],.85*al));
      celStroke(c,[[cx+Math.cos(a-hw*.3)*rIn*1.01,cy+Math.sin(a-hw*.3)*rIn*1.01],
                   [cx+Math.cos(a+hw*.2)*(rIn+h*.8),cy+Math.sin(a+hw*.2)*(rIn+h*.8)]],
        1.5,"frost",.5*al);}
    return gaps;};
  wall(RR*.58,11,1.4,.8,.75);              // 안쪽 — 낮고 흐리다
  const gaps=wall(RR*.86,15,0,1,1);        // 바깥 — 높다
  // 새는 것 — **부러진 자리로만** 나간다. 아무 데서나 새면 벽이 의미가 없다.
  for(const a of gaps){
    const ph=(t*.5+hash(a*31)*1)%1;
    const r=RR*(.86+ph*.34);
    const al=Math.max(0,(1-ph)*(ph<.2?ph/.2:1));
    fillPoly(c,jagPoly(cx+Math.cos(a)*r,cy+Math.sin(a)*r,RR*.07*(1-ph*.4),7,a*13,1.15),
      A(T[1],al*.9));}}]);

FVSET.plague.push(["**무너진 벽** — 판이 바깥으로 눕고, 뚫린 데로 빠져나간다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NB=16, rIn=RR*.76;
  for(let i=0;i<NB;i++){
    const jit=(hash(i*13.7)-.5)*(TAU/NB)*.5;
    const a=i/NB*TAU+t*.05+jit;
    // 넘어짐 — 판마다 다른 각도로 **바깥으로** 눕는다. 다 서 있으면 성벽이다.
    const fall=hash(i*17.3);
    const lay=fall<.42?fall/.42:1;                 // 0=서 있다 1=완전히 누웠다
    const h=RR*(.12+.16*hash(i*4.3));
    const hw=TAU/NB*(.28+.22*hash(i*23.1));
    const tip=rIn+h*(1-lay*.55), spread=hw*(1+lay*2.2);
    const P4=[[cx+Math.cos(a-hw)*rIn,cy+Math.sin(a-hw)*rIn],
              [cx+Math.cos(a-spread*.6)*tip,cy+Math.sin(a-spread*.6)*tip],
              [cx+Math.cos(a+spread*.6)*tip,cy+Math.sin(a+spread*.6)*tip],
              [cx+Math.cos(a+hw)*rIn,cy+Math.sin(a+hw)*rIn]];
    fillPoly(c,P4,A(T[0],.92-lay*.24));
    fillPoly(c,P4.map(p=>[cx+(p[0]-cx)*.95,cy+(p[1]-cy)*.95]),A(T[1],.85-lay*.3));
    if(lay<.5)celStroke(c,[[cx+Math.cos(a-hw*.3)*rIn*1.01,cy+Math.sin(a-hw*.3)*rIn*1.01],
                 [cx+Math.cos(a+hw*.2)*tip,cy+Math.sin(a+hw*.2)*tip]],1.5,"frost",.5);
    // 누운 판 위로 빠져나간다 — 벽이 무너진 자리가 곧 통로다.
    if(lay>.75){const ph=(t*.6+hash(i*29))%1;
      const r=rIn+RR*(.10+ph*.42);
      fillPoly(c,jagPoly(cx+Math.cos(a)*r,cy+Math.sin(a)*r,RR*.06*(1-ph*.5),7,i*3.1,1.15),
        A(T[1],Math.max(0,(1-ph)*.85)));}}}]);

FVSET.plague.push(["**벽이 다시 서고, 안에서 병이 끓는다** — 가둔 것이 있어야 벽이다",
function(c,cx,cy,RR,t,tn){
  // 몸을 **감싼다** — 아래쪽 반이 몸 위로 온다(2026-08-09).
  wrapBody(c,cx,cy,RR,(c)=>{
  const T=TONE[tn], NB=15, rIn=RR*.78, P=3.4;
  // 벽 **안쪽의 병.** 발현은 「융화의 성격을 발현 수준으로」이므로, 얼음(벽)만
  // 있으면 부모의 반쪽이 빠진다 — 가둘 것이 있어야 벽이 벽이다.
  // 벽이 부서지는 박자에 맞춰 **끓어오른다**: 벽이 무너질 때 병이 세진다.
  const boil=.55+.45*Math.sin(t/P*TAU-1.1);
  c.save();c.globalCompositeOperation="lighter";
  const gb=c.createRadialGradient(cx,cy,0,cx,cy,rIn*.98);
  gb.addColorStop(0,A(T[1],Math.max(0,.10+.13*boil)));
  gb.addColorStop(.62,A(T[1],Math.max(0,.05+.08*boil)));
  gb.addColorStop(1,A(T[0],0));
  c.fillStyle=gb;c.beginPath();c.arc(cx,cy,rIn*.98,0,TAU);c.fill();c.restore();
  for(let i=0;i<8;i++){
    const per=1.5+hash(i*5.3)*1.4, u=(t/per+hash(i*9.1))%1;
    const a=hash(i*3.7)*TAU, rr=rIn*(.22+.62*hash(i*11.3));
    const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr;
    const g2=ease(u), al=Math.max(0,(1-u)*(u<.18?u/.18:1)*(.55+.45*boil));
    const sz=RR*(.055+.10*g2);
    fillPoly(c,jagPoly(x,y,sz,9,i*3.7,1.14),A(T[0],al*.85));
    fillPoly(c,jagPoly(x,y,sz*.60,9,i*3.7+1.4,1.10),A(T[1],al*.90));
    fillPoly(c,jagPoly(x,y,sz*.24,7,i*3.7+2.9,1.08),A(T[2],al*.70));}
  for(let i=0;i<NB;i++){
    const jit=(hash(i*13.7)-.5)*(TAU/NB)*.5;
    const a=i/NB*TAU+jit;
    const u=(t/P+hash(i*7.1)*.35)%1;              // 판마다 조금씩 어긋나 자란다
    const grow=u<.52?ease(u/.52):1;
    const brk=u>.72?(u-.72)/.28:0;                // 부서짐
    const h=RR*(.13+.17*hash(i*4.3))*grow;
    const hw=TAU/NB*(.30+.20*hash(i*23.1));
    if(brk<1){
      const P4=[[cx+Math.cos(a-hw)*rIn,cy+Math.sin(a-hw)*rIn],
                [cx+Math.cos(a-hw*.6)*(rIn+h),cy+Math.sin(a-hw*.6)*(rIn+h)],
                [cx+Math.cos(a+hw*.6)*(rIn+h*(.55+.5*hash(i*9.1))),
                 cy+Math.sin(a+hw*.6)*(rIn+h*(.55+.5*hash(i*9.1)))],
                [cx+Math.cos(a+hw)*rIn,cy+Math.sin(a+hw)*rIn]];
      fillPoly(c,P4,A(T[0],.92*(1-brk)));
      fillPoly(c,P4.map(p=>[cx+(p[0]-cx)*.94,cy+(p[1]-cy)*.94]),A(T[1],.85*(1-brk)));
      celStroke(c,[[cx+Math.cos(a-hw*.3)*rIn*1.01,cy+Math.sin(a-hw*.3)*rIn*1.01],
                   [cx+Math.cos(a+hw*.2)*(rIn+h*.8),cy+Math.sin(a+hw*.2)*(rIn+h*.8)]],
        1.5,"frost",.5*(1-brk));}
    // 부서진 조각 — 바깥으로 튀어 사라진다. **부서져야 다시 서는 게 보인다.**
    if(brk>0)for(let k=0;k<3;k++){
      const d=RR*(.06+brk*.34)*(.6+hash(i*3.1+k)*.8);
      const aa=a+(hash(i*5.7+k)-.5)*.5;
      fillPoly(c,jagPoly(cx+Math.cos(aa)*(rIn+h+d),cy+Math.sin(aa)*(rIn+h+d),
        RR*.045*(1-brk),6,i*7+k,1.2),A(T[1],Math.max(0,(1-brk)*.9)));}}});}]);

// ── 장(瘴) — 「고여서 물결친다」 결로 셋 더. 회전이 없는 것이 이 결의 규칙 ──

FVSET.murk.push(["**두 배음이 겹친다** — 느린 물결 위에 잔물결이 얹힌다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const rAt=a=>RR*(.62+.20*Math.cos(3*a)*Math.sin(t*1.1)
                       +.11*Math.cos(7*a)*Math.sin(t*2.7));
  c.save();c.globalCompositeOperation="lighter";
  for(let k=0;k<30;k++){const a=k/30*TAU;
    const r=rAt(a), x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.92;
    const amp=Math.abs(Math.cos(3*a))*.6+Math.abs(Math.cos(7*a))*.4;
    const rr=RR*(.17+.13*amp);
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],Math.max(0,.08+.14*amp)));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.restore();
  const P2=[];for(let k=0;k<=72;k++){const a=k/72*TAU;
    P2.push([cx+Math.cos(a)*rAt(a),cy+Math.sin(a)*rAt(a)*.92]);}
  celStroke(c,P2,2.8,tn,.5);
  for(let k=0;k<3;k++){const a=k/3*TAU+t*.14,P3=[];
    for(let j=0;j<=7;j++){const q=j/7,aa=a+q*.95,r2=RR*(.24+q*.22);
      P3.push([cx+Math.cos(aa)*r2,cy+Math.sin(aa)*r2]);}
    celRibbon(c,P3,4.2,tn,.5);}}]);

FVSET.murk.push(["**마디에 맺힌다** — 안 움직이는 자리에 독이 고여 뭉친다",
function(c,cx,cy,RR,t,tn){
  // 몸을 **감싼다** — 아래쪽 반이 몸 위로 온다(2026-08-09).
  wrapBody(c,cx,cy,RR,(c)=>{
  const T=TONE[tn], n=5;
  const osc=Math.sin(t*1.35);
  const rAt=a=>RR*(.64+.26*Math.cos(n*a)*osc);
  c.save();c.globalCompositeOperation="lighter";
  for(let k=0;k<24;k++){const a=k/24*TAU;
    const r=rAt(a), x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.92;
    const rr=RR*.18;
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],.10));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.restore();
  const P2=[];for(let k=0;k<=64;k++){const a=k/64*TAU;
    P2.push([cx+Math.cos(a)*rAt(a),cy+Math.sin(a)*rAt(a)*.92]);}
  celStroke(c,P2,2.6,tn,.44);
  // 마디 — 안 움직이는 자리라 **여기만 고인다.** 자라다 무거워지면 떨어진다.
  for(let k=0;k<n*2;k++){
    const a=(Math.PI/2+k*Math.PI)/n, r=RR*.64;
    const u=(t/2.6+hash(k*9.7))%1;
    const gr=u<.72?ease(u/.72):1, fall=u>.72?(u-.72)/.28:0;
    const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.92+fall*RR*.30;
    const sz=RR*(.05+.07*gr)*(1-fall*.5);
    fillPoly(c,jagPoly(x,y,sz,7,k*3.1,1.1),A(T[0],Math.max(0,.9-fall)));
    fillPoly(c,jagPoly(x,y,sz*.55,7,k*3.1+1,1.05),A(T[1],Math.max(0,.95-fall)));}});}]);

FVSET.murk.push(["**두께가 물결친다** — 둘레는 정원인데 띠가 굵어졌다 얇아진다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], n=6, r0=RR*.72;
  const osc=Math.sin(t*1.25);
  // 윤곽이 아니라 **두께**가 정상파다 — 도형은 안 변하는데 살아 있다.
  const wAt=a=>Math.max(.6,RR*(.09+.085*Math.cos(n*a)*osc));
  c.save();c.globalCompositeOperation="lighter";
  for(let k=0;k<28;k++){const a=k/28*TAU;
    const x=cx+Math.cos(a)*r0, y=cy+Math.sin(a)*r0*.92, rr=wAt(a)*1.9;
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],.13));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();}
  c.restore();
  // 띠 — 두께가 다른 조각을 이어 붙인다. 겹쳐 이으므로 **획**으로.
  const NS=36;
  for(let k=0;k<NS;k++){
    const a0=k/NS*TAU, a1=(k+1.35)/NS*TAU;
    const P2=[];for(let j=0;j<=3;j++){const q=j/3,aa=a0+(a1-a0)*q;
      P2.push([cx+Math.cos(aa)*r0,cy+Math.sin(aa)*r0*.92]);}
    celStroke(c,P2,wAt((a0+a1)/2),tn,.62);}
  for(let k=0;k<3;k++){const a=k/3*TAU+t*.15,P3=[];
    for(let j=0;j<=7;j++){const q=j/7,aa=a+q*.9,r2=RR*(.22+q*.2);
      P3.push([cx+Math.cos(aa)*r2,cy+Math.sin(aa)*r2]);}
    celRibbon(c,P3,4,tn,.5);}}]);

// ── 반려로 빈 자리 메움 · 설 3 + 수 2 ────────────────────────────────
// ── 설 雪 · 새 안 ① ─ 매달림 ────────────────────────────────────────────
// **지면이 없어도 아래는 있다** — 시계추가 그 증거다. 쌓임을 지면에 놓으면
// 설산이 되지만(2·4·5안 반려), 무게를 **테에 걸면** 지형이 안 생긴다:
// 눈을 머금은 둘레가 매달린 쪽으로 물질을 몰고, 그 덩이가 몸에 달린 채
// 흔들린다. 중력을 「쌓인 높이」가 아니라 **「매달린 방향」**으로 말한다.
FVSET.snow.push(["매달려 흔들린다 — 지면이 없어도 아래는 있다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // 진자. 배음을 섞어 등속 왕복(=기계)이 아니라 **무게가 실린 흔들림**으로.
  const sw=.46*Math.sin(t*1.10)+.10*Math.sin(t*2.31+.7);
  const ang=Math.PI/2+sw;                 // 매달린 방향 — 화면 아래가 +y
  const spd=Math.abs(Math.cos(t*1.10));   // 가운데를 지날 때가 제일 빠르다
  // ⚠️ 테와 덩이를 **따로** 그렸더니 덩이가 「몸에 안 속한 물체」로 떨어져
  // 나갔다(첫 렌더). 둘을 **한 덩어리**로 잇는다 — 둘레의 눈이 전부 아래로
  // 몰려 그대로 늘어진 것이라야 지형도 물체도 아닌 「몸의 무게」가 된다.
  const NN=64,OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;
    let d=a-ang;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;
    // 테는 얇게, 매달린 자리만 길게 — 넓게 부풀리면 **몸이 눈에 파묻힌다**
    const hang=Math.exp(-d*d*2.9);
    const lump=1+.045*Math.sin(a*6+1.3)+.028*Math.sin(a*10-2.1);
    // 덩이 가장자리는 부슬부슬해야 눈이다 — 매끈하면 물방울로 읽힌다
    const grain=1+.08*hang*Math.cos(d*6.5+1.1)+.045*hang*Math.cos(d*12.5-.6);
    // ⚠️ 끝이 **칸 밖으로 잘렸다**(첫 렌더). 168px 칸에서 RR 은 최소변의 .30 —
    // 1.5RR 이 이미 가장자리다. 매달린 길이는 여기까지가 한계다.
    const ro=(RR*.88*lump+RR*.40*hang)*grain;
    const px=cx+Math.cos(a)*ro,py=cy+Math.sin(a)*ro+RR*.08*hang*hang;  // 처진다
    OU.push([px,py]);
    IN.push([cx+Math.cos(a)*RR*.78,cy+Math.sin(a)*RR*.78]);}
  const RV=IN.slice().reverse();
  fillPoly(c,OU.concat(RV),A(T[0],.95));                     // 푸른 그늘
  fillPoly(c,OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*.62,
                            IN[i][1]+(p[1]-IN[i][1])*.62]).concat(RV),A(T[1],.96));
  celStroke(c,OU,2.4,tn,.85);                                // 흰 마루
  // 가루 — **제일 빠른 자리에서만** 떨어져 나간다. 흔들린다는 증거.
  for(let i=0;i<7;i++){
    const ph=(t*.85+hash(i*3.7))%1;
    const a2=ang+(hash(i*7.1)-.5)*1.25;
    const fl=RR*(1.30+ph*.60);
    const x=cx+Math.cos(a2)*fl,y=cy+Math.sin(a2)*fl+ph*ph*RR*.26;
    c.beginPath();c.arc(x,y,1.5+hash(i*2.3)*1.3,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-ph)*spd*.75));c.fill();}
}]);

// ── 설 雪 · 새 안 ② ─ 갈라짐 ────────────────────────────────────────────
// **눈은 앉지 않는다 — 몸이 눈보라를 가른다.** 여기서 중력은 상태가 아니라
// 순간이다: 바람이 쥐고 있는 동안은 눈이 안 떨어지고, **바람 그늘(뒤쪽
// 잔잔한 주머니)에 들어가 놓이는 순간에만** 가라앉는다. 결은 몸에 부딪혀
// 갈라진 자리에만 그린다 — 멀리까지 그으면 그건 배경 눈보라다.
FVSET.snow.push(["몸이 눈보라를 가른다 — 바람이 놓아준 자리에서만 가라앉는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // ⚠️ 처음엔 **칸을 가로지르는 긴 유선**으로 그렸다가 그대로 반려감이었다
  // (첫 렌더): 멀리까지 그은 결은 몸이 아니라 **배경 눈보라**다. 결은 몸에
  // 닿아 갈라지는 자리에만 둔다 — 그러면 「몸이 만든 것」만 남는다.
  const wd=Math.PI+.85*Math.sin(t*.23);   // 바람이 오는 쪽 — 통째로 돈다
  const arcAt=(s,j,q)=>{const a=wd+s*(.10+q*2.62);   // 뒤에서 다시 만난다
    // 결마다 굽이가 달라야 **바람결**이지, 나란한 동심원은 파문으로 읽힌다
    const rr=RR*(.82+j*.10)*(1+.10*q*q)*(1+.045*Math.sin(q*8.5+j*2.1+s));
    return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];};
  for(let s=-1;s<=1;s+=2)for(let j=0;j<3;j++){
    const P=[];for(let k=0;k<=22;k++)P.push(arcAt(s,j,k/22));
    celRibbonEven(c,P,2.8-j*.55,tn,.52-j*.11);}   // 양 끝이 저절로 좁아진다
  // 실려 가는 눈 — 결을 타고 몸을 감아 나간다
  for(let i=0;i<10;i++){
    const s=i%2?1:-1,j=i%3,ph=(t*.50+hash(i*5.3))%1;
    const tl=.09*(1-.5*ph);
    const p0=arcAt(s,j,ph),p1=arcAt(s,j,Math.max(0,ph-tl));
    celStroke(c,[p1,p0],2.0,tn,Math.max(0,Math.sin(Math.PI*ph)*.85));}
  // 스치는 쪽만 희다 — 바람이 깎아 낸 결. 이 한 줄이 「몸의 것」을 정한다.
  const AR=[];
  for(let k=0;k<=18;k++){const q=k/18,a=wd-.72+1.44*q;
    const rr=RR*(.79+.04*Math.sin(Math.PI*q));
    AR.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  celRibbonEven(c,AR,5.0,tn,.95);
  // 갈라지는 지점 — 여기서 튕겨 나간 눈. 「부딪혔다」가 보여야 가른 것이 된다.
  for(let i=0;i<4;i++){
    const ph=(t*1.15+hash(i*6.1))%1,s=i%2?1:-1;
    const a=wd+s*(.08+ph*.50),rr=RR*(.80+ph*.32);
    const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
    c.beginPath();c.arc(x,y,1.8*(1-ph)+.7,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-ph)*.85));c.fill();}
  // 바람 그늘 — 뒤쪽 잔잔한 주머니. **여기서만 눈이 아래로 간다.**
  const lx=cx+Math.cos(wd+Math.PI)*RR*.82,ly=cy+Math.sin(wd+Math.PI)*RR*.82;
  for(let i=0;i<5;i++){
    const ph=(t*.30+hash(i*7.9))%1;
    const x=lx+(hash(i*3.1)-.5)*RR*.40;
    const y=ly-RR*.34+ph*RR*.84;
    const al=Math.max(0,Math.sin(Math.PI*ph)*.85);
    celStroke(c,[[x,y-RR*.12],[x,y]],1.5,tn,al*.45);
    c.beginPath();c.arc(x,y,1.7+hash(i*2.9)*1.1,0,TAU);
    c.fillStyle=A(T[2],al);c.fill();}
}]);

// ── 설 雪 · 새 안 ③ ─ 안쪽이 아래 ───────────────────────────────────────
// **중력의 방향을 몸으로 돌린다.** 지면이 없는 게 문제라면 아래를 없애는 게
// 아니라 **몸을 아래로** 삼으면 된다: 눈이 사방에서 몸을 향해 가속해 떨어지고,
// 부딪힌 자리가 부풀어 껍질이 된다. 쌓임이 수평선을 안 만들고 **둘레의
// 두께**로만 남는 유일한 안이다.
FVSET.snow.push(["안쪽이 아래다 — 사방에서 몸으로 떨어져 껍질이 된다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const NF=13,FL=[],FALL=.56;
  for(let i=0;i<NF;i++){
    const per=1.9+hash(i*4.3)*1.5;
    FL.push({ph:((t+hash(i*9.1)*13)%per)/per,
             aL:hash(i*2.7)*TAU,            // 앉을 자리 — 미리 정해 둔다
             sp:(hash(i*5.9)-.5)*1.30});}   // 바람에 감기며 들어온다
  // 앉은 자리가 부푼다. 새것일수록 높고, 눌리며 낮아진다.
  const bump=a=>{let h=0;
    for(let i=0;i<NF;i++){const f=FL[i];if(f.ph<FALL)continue;
      const g=1-(f.ph-FALL)/(1-FALL);
      let d=a-f.aL;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;
      h+=RR*.20*g*Math.exp(-d*d*22);}
    return h;};
  const NN=54,OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;
    const ro=RR*(.93+.025*Math.sin(a*9+1.7))+bump(a);
    OU.push([cx+Math.cos(a)*ro,cy+Math.sin(a)*ro]);
    IN.push([cx+Math.cos(a)*RR*.80,cy+Math.sin(a)*RR*.80]);}
  const RV=IN.slice().reverse();
  fillPoly(c,OU.concat(RV),A(T[0],.93));                       // 푸른 그늘
  fillPoly(c,OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*.60,
                            IN[i][1]+(p[1]-IN[i][1])*.60]).concat(RV),A(T[1],.95));
  celStroke(c,OU,2.6,tn,.85);                                  // 흰 마루
  // 떨어지는 중 — **가속**이 안쪽을 아래로 만든다. 꼬리는 늘 몸을 향한다.
  for(let i=0;i<NF;i++){const f=FL[i];if(f.ph>=FALL)continue;
    const u=f.ph/FALL,e=u*u;
    const rr=RR*(1.50-.53*e),a=f.aL+f.sp*(1-u);
    const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr,tl=RR*(.07+.24*e);
    // 꼬리는 흐리게 — 굵으면 「빨려 드는 화살」이 된다(첫 렌더)
    celStroke(c,[[x+Math.cos(a)*tl,y+Math.sin(a)*tl],[x,y]],1.6,tn,
      Math.max(0,.16+.34*u));
    c.beginPath();c.arc(x,y,1.4+hash(i*2.3)*1.0,0,TAU);
    c.fillStyle=A(T[2],.9);c.fill();}
  // 부딪힌 자리 — 옆으로 튄 가루. 「앉았다」가 아니라 「떨어졌다」가 된다.
  for(let i=0;i<NF;i++){const f=FL[i];if(f.ph<FALL)continue;
    const j=(f.ph-FALL)/(1-FALL);if(j>.22)continue;
    const k2=j/.22;
    for(let s=-1;s<=1;s+=2){const a=f.aL+s*(.10+.30*k2),rr=RR*(.99+.11*k2);
      c.beginPath();c.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,2.2*(1-k2),0,TAU);
      c.fillStyle=A(T[2],Math.max(0,(1-k2)*.8));c.fill();}}
}]);

// ── 수 水 · 새 안 ④ ─ 관성 ──────────────────────────────────────────────
// 파문(1안)은 퍼짐, 방울(2안)은 무게, 한 줄기(3안)는 연속. 남은 물의 성질은
// **관성**이다: 물은 멈춰도 안 멈춘다. 몸을 감싼 물막의 **두께가 통째로**
// 한쪽에 쏠렸다가 되돌아오며 반대쪽까지 지나친다. 도는 게 아니라 쏠린다 —
// 고리가 끊길 일이 없고, 가장자리가 전부 곡선이라 각이 안 선다.
FVSET.aqua.push(["쏠렸다 되돌아온다 — 물은 멈춰도 관성이 남는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const sl=Math.sin(t*.95);
  const th=Math.PI/2+1.25*sl+.34*Math.sin(t*2.05+1.1);   // 쏠린 쪽
  const turn=1-Math.abs(Math.cos(t*.95));                // 뒤집히는 순간
  const near=a=>{let d=a-th;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d;};
  const NN=64,OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU,d=near(a),f=Math.PI-Math.abs(d);
    const pile=Math.exp(-d*d*1.5),thin=Math.exp(-f*f*1.5);
    // 잔물결 — 없으면 완벽한 초승달이라 **달**로 읽힌다(첫 렌더)
    const rip=.030*Math.sin(a*3-t*1.7)+.020*Math.sin(a*5+t*2.6);
    const ro=RR*(.94+.32*pile-.07*thin+rip),ri=RR*(.80-.05*pile+.04*thin);
    OU.push([cx+Math.cos(a)*ro,cy+Math.sin(a)*ro]);
    IN.push([cx+Math.cos(a)*ri,cy+Math.sin(a)*ri]);}
  const RV=IN.slice().reverse();
  fillPoly(c,OU.concat(RV),A(T[0],.92));
  fillPoly(c,OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*.60,
                            IN[i][1]+(p[1]-IN[i][1])*.60]).concat(RV),A(T[1],.95));
  celStroke(c,OU,2.2,tn,.85);                    // 닫힌 수면 — 획으로 잇는다
  // 혀 — 쏠린 물이 끝에서 말려 넘어간다. 되돌아서는 순간 제일 길다.
  const dirn=Math.cos(t*.95)>0?-1:1;
  const LIP=[];
  for(let k=0;k<=12;k++){const q=k/12,a=th+dirn*q*1.05,rr=RR*(1.30-.44*q*q);
    LIP.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  celRibbon(c,LIP,7.5*turn+1.4,tn,Math.max(0,.32+.55*turn));
  // 뒤따라오는 물 — 쏠린 자리 뒤에서 늦게 밀려온다(관성의 꼬리)
  const LG=[];
  for(let k=0;k<=16;k++){const q=k/16,a=th-dirn*(.40+q*1.55);
    const rr=RR*(.87+.05*Math.sin(q*TAU+t*2.2));
    LG.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  celRibbonEven(c,LG,3.0,tn,.45);
}]);

// ── 수 水 · 새 안 ⑤ ─ 표면장력 ──────────────────────────────────────────
// **물은 붙으면 하나가 된다.** 떨어지지도 퍼지지도 않고, 이웃한 두 방울이
// 목을 늘여 붙었다가 다시 갈라진다 — 개수가 변하는 유일한 안이다. 각이 설
// 자리가 없고(전부 타원과 잘록한 목), 붙는 순간 표면장력으로 **부르르
// 떨리는 것**이 이 안의 전부다. 짝은 제자리에 있고 ±0.24rad 만 오간다.
FVSET.aqua.push(["만나 하나가 된다 — 목을 늘여 붙었다가 다시 갈라진다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  celHoop(c,cx,cy,RR*.66,1,0,1.8,tn,.26);        // 물막 — 테두리를 확 줄였다(2026-08-09)
  const bead=(x,y,rx,ry,rot,al)=>{
    const el=(k,col)=>{c.beginPath();
      c.ellipse(x,y,Math.max(.2,rx*k),Math.max(.2,ry*k),rot,0,TAU);
      c.fillStyle=col;c.fill();};
    el(1,A(T[0],.95*al));el(.64,A(T[1],.97*al));el(.28,A(T[2],al));};
  for(let p=0;p<4;p++){
    const a0=p/4*TAU+.35,per=3.0+p*.23,ph=((t+p*1.37)%per)/per;
    // m — 붙은 정도. 0 = 둘 / 1 = 하나. 붙는 데 오래, 갈라지는 건 빠르게.
    const m=ph<.34?ease(ph/.34):(ph<.62?1:(ph<.90?1-ease((ph-.62)/.28):0));
    // ⚠️ 방울이 크면 떨어져 있을 때도 서로 닿아 **처음부터 붙어 보인다**
    // (첫 렌더). 작게 두고 **붙을 때 커지게** 해야 합쳐진 것이 읽힌다.
    // 각 방울의 이동은 ±0.25rad 안 — 제자리 진동 규칙을 넘지 않는다.
    const sep=.25*(1-m),rad=RR*.70,rr=RR*(.105+.075*m);  // 반경·알 모두 한 단 아래로
    const x1=cx+Math.cos(a0-sep)*rad,y1=cy+Math.sin(a0-sep)*rad;
    const x2=cx+Math.cos(a0+sep)*rad,y2=cy+Math.sin(a0+sep)*rad;
    // 목 — 가운데가 잘록하다. 끊기기 직전이 제일 가늘다.
    const dx=x2-x1,dy=y2-y1,dl=Math.hypot(dx,dy);
    if(m>.05&&dl>1.5){
      const ux=dx/dl,uy=dy/dl,nk=.10+.90*Math.pow(m,1.5);
      const neck=(k,col)=>{const L=[],G=[];
        for(let s=0;s<=14;s++){const q=s/14;
          const w=rr*k*(nk+(1-nk)*Math.pow(Math.abs(2*q-1),1.5));
          const bx=x1+dx*q,by=y1+dy*q;
          L.push([bx-uy*w,by+ux*w]);G.push([bx+uy*w,by-ux*w]);}
        fillPoly(c,L.concat(G.reverse()),col);};
      neck(1,A(T[0],.95));neck(.64,A(T[1],.97));neck(.28,A(T[2],1));}
    // 붙는 순간 부르르 떤다 — 표면장력이 모양을 되돌리는 소리
    const rng=(u0,sp)=>u0<0?0:.26*Math.exp(-u0*sp)*Math.cos(u0*sp*4.6);
    const e=rng((ph-.34)*per,3.6)+rng((ph-.90)*per,4.4);
    const rot=a0+Math.PI/2;
    if(m>.985)bead(cx+Math.cos(a0)*rad,cy+Math.sin(a0)*rad,
      rr*(1+e),rr*(1-e),rot,1);
    else{bead(x1,y1,rr*(1+e),rr*(1-e),rot,1);
         bead(x2,y2,rr*(1+e),rr*(1-e),rot,1);
      // 위성 방울 — 목이 끊길 때 가운데 남는 한 알. 곧 흡수된다.
      if(ph>.82&&ph<.96){const k2=(ph-.82)/.14;
        bead((x1+x2)/2,(y1+y2)/2,rr*.24*(1-k2),rr*.24*(1-k2),0,
          Math.max(0,1-k2));}}}
}]);

// 설 6안 — **4안(눈보라를 가른다) + 1안(가라앉은 자리).** 4안은 「지나간다」만
// 있고 1안은 「남았다」만 있었다. 합치면 **가르고 나서 그 뒤에 가라앉는다**가
// 되어 원인과 결과가 한 그림에 든다. 4안을 더 강하게(결을 굵고 많게) 쓴다.
FVSET.snow.push(["**가르고 나서 가라앉는다** — 결이 몸을 감아 돌고, 그 뒤에 눈이 앉는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], WD=-0.62;                    // 바람 방향(라디안) — 좌상 → 우하
  const ca=Math.cos(WD), sa=Math.sin(WD);
  const to=(u,v)=>[cx+u*ca-v*sa, cy+u*sa+v*ca];  // 바람 좌표 → 화면 좌표
  // 결 — 몸에 부딪혀 갈라졌다 뒤에서 다시 만난다. **비껴가는 폭**이 몸에
  // 가까울수록 커야 「가른다」가 된다. 멀면 그냥 지나가는 배경 눈보라다.
  for(let i=0;i<11;i++){
    const b=((i/10)-.5)*2.05*RR;                 // 몸 기준 좌우 오프셋
    const near=Math.exp(-(b/(RR*.62))*(b/(RR*.62)));
    if(near<.02)continue;
    const ph=(t*.72+hash(i*5.3))%1;
    const P2=[];
    for(let k=0;k<=20;k++){
      const q=k/20, u=(-1.45+q*2.9)*RR;
      const push=Math.sign(b||1)*RR*.46*near*Math.exp(-(u/(RR*.66))*(u/(RR*.66)));
      P2.push(to(u,b+push));}
    // 결이 통째로 있으면 배경이다 — **짧은 토막**만 켜서 몸 근처만 보이게.
    const s0=Math.floor(ph*13), seg=P2.slice(s0,s0+8);
    if(seg.length>2)celStroke(c,seg,3.4*near+.8,tn,Math.max(0,.20+.62*near));}
  // 그늘 — 바람 뒤쪽에 눈이 **가라앉아 앉는다.** 1안의 호가 여기로 온다.
  // 바닥에 눕히지 않고 **몸을 감싸는 초승달**이라야 지형이 안 된다.
  const arc=[],arcT=[];
  for(let k=0;k<=18;k++){
    const a=WD-Math.PI*.62+k/18*Math.PI*1.24;
    const rr=RR*.72;
    arc.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);
    const th=RR*(.06+.11*Math.pow(Math.sin(Math.PI*k/18),.6))
             *(1+.16*Math.sin(k*2.1+t*1.3));
    arcT.push([cx+Math.cos(a)*(rr+th),cy+Math.sin(a)*(rr+th)]);}
  fillPoly(c,arc.concat(arcT.slice().reverse()),A(T[0],.92));
  fillPoly(c,arc.concat(arcT.slice().reverse().map(p=>[cx+(p[0]-cx)*.96,cy+(p[1]-cy)*.96])),
    A(T[1],.94));
  celStroke(c,arcT,2.0,tn,.85);
  // 흩날리는 결정 몇 — 1안의 알갱이. 그늘 쪽으로 빨려 앉는다.
  for(let i=0;i<9;i++){
    const ph=(t*.5+hash(i*7.7))%1;
    const b=((hash(i*3.1))-.5)*2.0*RR;
    const u=(-1.3+ph*2.5)*RR;
    const p=to(u,b*(1-ph*.35));
    const s2=.5+hash(i*11.3)*.6;
    c.save();c.translate(p[0],p[1]);c.rotate(t*1.4+i);
    const hx=(rr,col)=>{c.beginPath();
      for(let j=0;j<6;j++){const b2=j/6*TAU;
        j?c.lineTo(Math.cos(b2)*rr,Math.sin(b2)*rr):c.moveTo(Math.cos(b2)*rr,Math.sin(b2)*rr);}
      c.closePath();c.fillStyle=col;c.fill();};
    hx(4.6*s2,A(T[0],.8));hx(2.5*s2,A(T[2],.95));c.restore();}}]);

// 수 6안 — **4안(쏠림·관성) + 5안(표면장력).** 4안은 막이 통째로 쏠리고 5안은
// 방울이 붙었다 갈라진다. 합치면 **쏠린 쪽에서 물이 뭉친다**가 된다 — 관성이
// 방울을 만들고, 되돌아올 때 그 방울이 다시 막에 삼켜진다.


// ── 반려로 빈 자리 메움 · 연·자·역·장 각 1 ──────────────────────────

FVSET.magnet.push(["살갗이 뿔로 선다 — 장이 두 극에서만 액체를 끌어올리고, 세질수록 뿔이 는다",
function(c,cx,cy,RR,t,tn){
  // **끌어당김을 몸 위에서 보여준다.** 1·2안은 장의 방향, 3안은 끌려온 물건,
  // 4안은 못 들어오는 장 — 전부 몸 **바깥**의 이야기다. 이쪽은 자성 액체가
  // 몸을 덮고 있고, 장이 그 액체를 **위로 끌어올려** 뿔이 선다(로젠츠바이크
  // 불안정). 힘의 세기가 곧 형태라, 장이 세지면 뿔이 길어지고 **개수가 는다.**
  //
  // ⚠️ 뿔을 둘레 전체에 세우면 성게·태양 문양이 된다. **두 극에만** 돋고
  // 적도 쪽은 매끈하다 — 그래서 자석이지 방사가 아니다. 축은 통째로 한
  // 속도로 돌아 위아래가 고정되지 않는다(지면·천장이 안 생긴다).
  const T=TONE[tn];
  const ax=t*.22;                                  // 자기축 — 전체가 한 속도
  const fld=Math.pow(.5+.5*Math.sin(t*1.15),.8);   // 장의 세기 — 숨쉰다
  const SK=RR*.62;
  const skR=q=>{const pol=Math.abs(Math.cos(q-ax));
    return SK*(1+.13*fld*Math.pow(pol,3)+.022*Math.sin(q*7+t*1.9));};
  // 뿔 — 살갗보다 **먼저** 그린다. 그래야 밑동이 살갗에 묻혀 「돋아난 것」이 된다.
  for(let s=0;s<2;s++){
    const base=ax+s*Math.PI;
    for(let j=0;j<4;j++){
      // ⚠️ 처음엔 극마다 일곱을 ±42°에 폈다가 **성게**가 됐다. 넷을 ±25°로
      // 좁히고 바깥 뿔을 확 줄인다 — 두 뭉치로 떨어져 보여야 극이 읽힌다.
      const off=(j-1.5)/1.5*.44+(hash(j*2.7+s*9.1)-.5)*.08;
      // 극마다 하나는 늘 서 있다 — 다 누우면 칸이 텅 비어 「무슨 속성인지」가
      // 사라진다. 나머지 셋이 세기를 말한다.
      const keep=(j===1);
      const thr=keep?0:.16+.58*hash(j*3.1+s*7.7);
      if(!keep&&fld<=thr)continue;
      const up=keep?.12+.88*fld:Math.min(1,(fld-thr)/Math.max(.12,1-thr));
      const q=base+off;
      const bx=cx+Math.cos(q)*skR(q),by=cy+Math.sin(q)*skR(q);
      const len=RR*(.20+.44*up)*(1-Math.abs(off)*1.30)
        *(1+.07*Math.sin(t*7.3+j*2.1+s));
      // 뿔은 장을 따라 눕는다 — 축 쪽으로 살짝 기운다. 곧게 뻗으면 가시다.
      celSpike(c,bx,by,q-off*.34,len,RR*(.085+.03*up),tn,.34+.62*up);
    }
  }
  // 살갗 — 자성 액체의 막. 닫힌 고리라 리본이 아니라 획.
  const P=[];
  for(let i=0;i<=48;i++){const q=i/48*TAU;P.push([cx+Math.cos(q)*skR(q),cy+Math.sin(q)*skR(q)]);}
  P.push(P[0]);
  c.save();c.globalCompositeOperation="lighter";
  fillPoly(c,P,A(T[0],.42));c.restore();
  celStroke(c,P,RR*.075,tn,.62);
  // ⚠️ 적도에도 잔가시를 세웠다가 둘레가 메워져 **태양 문양**이 됐다.
  // 적도는 **매끈해야** 한다 — 안 선 것이 「극에만 선다」를 증명한다.
}]);

FVSET.plague.push(["둘로 갈라진다 — 번지는 게 아니라 **불어난다**: 하나가 둘, 둘이 넷",
function(c,cx,cy,RR,t,tn){
  // **역병의 정체를 「개수」로 잡는다.** 1안(반점)은 떴다 지고, 2안(전염)은
  // 옆으로 옮고, 3안은 파먹고, 4안은 박자다 — 넷 다 **수가 안 는다.**
  // 이쪽은 덩이 하나가 목이 잘록해지며 둘로 갈라지고, 그 둘이 또 갈라진다.
  // 한 바퀴 끝에 넷이 몸을 두르고, 그대로 삭아 다시 하나로 돌아간다.
  //
  // ⚠️ 각지면 코어 복제가 된다(5안 반려). spikeMul 1.02 — **덩이는 뭉툭하다.**
  // ⚠️ 처음엔 셋을 갈라 여덟까지 갔다가 **부스러기**(3안의 껍질)로 보였다.
  // 넷에서 멈추고 덩이를 키운다 — 개수가 아니라 **갈라지는 게** 보여야 한다.
  // ⚠️ 박자는 **넷인 상태에 오래 머문다.** 하나로 시작하는 그림이라 앞머리가
  // 길면 칸이 비어 보인다 — 갈라지는 건 앞쪽에 몰고, 뒤는 넷으로 버틴다.
  const T=TONE[tn],PER=5.6,DIV=[.75,1.90],D=.62;
  const cyc=(t/PER)|0,p=t%PER;
  const env=p<.22?p/.22:Math.max(0,1-Math.max(0,p-4.20)/1.4);
  if(env<=.01)return;
  const a0=hash(cyc*7.1)*TAU,r0=RR*.66;
  const lump=[],neck=[];
  const clamp=(x,y)=>{const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1;
    const k=Math.min(RR*1.14,Math.max(RR*.58,d));
    return[cx+dx/d*k,cy+dy/d*k];};
  const rec=(x,y,gen,sd,born)=>{
    const td=DIV[gen];
    if(td===undefined||p<td){lump.push({x,y,gen,sd,born});return;}
    const u=Math.min(1,(p-td)/D),e=ease(u);
    const dir=hash(sd*3.7)*TAU+t*.06;
    const sep=RR*(.46-gen*.09)*e;
    const c1=clamp(x+Math.cos(dir)*sep,y+Math.sin(dir)*sep);
    const c2=clamp(x-Math.cos(dir)*sep,y-Math.sin(dir)*sep);
    if(u<1)neck.push([c1,c2,1-u,gen]);
    rec(c1[0],c1[1],gen+1,sd*2+1.3,td);
    rec(c2[0],c2[1],gen+1,sd*2+2.7,td);
  };
  rec(cx+Math.cos(a0)*r0,cy+Math.sin(a0)*r0,0,cyc*3.1+1.7,0);
  // 목 — 덩이보다 **먼저.** ⚠️ 굵기가 고른 획으로 이으면 **아령**이 되고,
  // 작은 덩이를 늘어놓으면 **구슬 다리**가 된다(둘 다 실기에서 걸렀다).
  // 가운데가 제일 가는 **이어진 한 덩이**라야 「잘록해지는 중」으로 읽힌다.
  const waist=(pA,pB,wf,col)=>{
    const dx=pB[0]-pA[0],dy=pB[1]-pA[1],d=Math.hypot(dx,dy)||1;
    const ox=-dy/d,oy=dx/d,L=[],Rt=[];
    for(let k=0;k<=10;k++){const s2=k/10;
      const w=wf*(.24+.76*Math.abs(2*s2-1));
      const x=pA[0]+dx*s2,y=pA[1]+dy*s2;
      L.push([x+ox*w,y+oy*w]);Rt.push([x-ox*w,y-oy*w]);}
    fillPoly(c,L.concat(Rt.reverse()),col);
  };
  for(const nk of neck){
    const wf=RR*(.30*Math.pow(.84,nk[3]))*(.42+.58*nk[2]);
    waist(nk[0],nk[1],wf,A(T[0],Math.max(0,.90*env)));
    waist(nk[0],nk[1],wf*.62,A(T[1],Math.max(0,.92*env)));
  }
  for(const b of lump){
    const gw=Math.min(1,(p-b.born)/.55);
    const sz=RR*(.40*Math.pow(.84,b.gen))*(.92+.16*hash(b.sd*5.9))
      *(.58+.42*ease(gw))*(1+.06*Math.sin(t*2.7+b.sd));
    const al=env*Math.min(1,gw*2.2+.25);
    fillPoly(c,jagPoly(b.x,b.y,sz,11,b.sd*2.3,1.02),A(T[0],Math.max(0,al*.90)));
    fillPoly(c,jagPoly(b.x,b.y,sz*.62,11,b.sd*2.3+1.4,1.01),A(T[1],Math.max(0,al*.92)));
    // 물집처럼 젖은 자리 — 한 점만. 각진 별을 또 그리면 코어가 여럿이 된다.
    c.beginPath();c.arc(b.x-sz*.22,b.y-sz*.26,sz*.20,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,al*.34));c.fill();
  }
}]);

FVSET.murk.push(["팔을 뻗어 더듬는다 — 뻗은 것은 도로 못 거두고 그 자리서 풀린다",
function(c,cx,cy,RR,t,tn){
  // **떠도는 것의 다른 얼굴 — 「가만히 못 있는다」.** 3안은 뭉쳤다 흩어지고
  // 4안은 지나가고 5안은 소용돌이가 인다. 이쪽은 몸을 두른 안개가 **팔을
  // 하나씩 내밀어** 아무 데나 더듬고, 다 뻗은 팔은 거두지 못하고 그 자리에서
  // 부풀며 풀린다. 뻗는 방향이 매번 달라 자리를 안 지킨다.
  //
  // ⚠️ 팔은 몸의 살갗에서 난다(밑동 RR*.40) — 떨어져 뜨면 배경 얼룩이 된다.
  // 아래로도 뻗지만 **가로로 눕지 않는다**: 옛 2안의 바닥층이 그래서 떨어졌다.
  const T=TONE[tn],LIFE=2.9;
  const puff=(x,y,rr,al)=>{
    if(al<=.004)return;
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],Math.max(0,al)));
    g.addColorStop(.62,A(T[1],Math.max(0,al*.42)));
    g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();};
  c.save();c.globalCompositeOperation="lighter";
  // 몸을 두른 안개 — 팔이 여기서 난다
  for(let i=0;i<7;i++){
    const a=i/7*TAU+t*.18;
    puff(cx+Math.cos(a)*RR*.50,cy+Math.sin(a)*RR*.46,
      RR*(.22+.07*hash(i*3.1))*(1+.10*Math.sin(t*1.3+i)),.14);
  }
  // ⚠️ 첫 판은 팔이 굵고 길어(RR*1.4) **혜성 꼬리 하나**로 보였다. 셋의 시계를
  // 고르게 어긋내고 가늘게 뽑아야 「여러 팔이 번갈아 더듬는 것」이 된다.
  for(let i=0;i<3;i++){
    const ph=t/LIFE+i/3+hash(i*5.7)*.22,s=ph|0,u=ph-s;
    const a=hash(s*4.3+i*9.1)*TAU;                 // 매번 다른 방향
    const curl=(hash(s*7.7+i*2.3)-.5)*2.4;         // 휘는 쪽도 매번 다르다
    const grow=ease(Math.min(1,u/.52));
    const die=Math.max(0,(u-.60)/.40);
    const len=RR*(.48+.52*hash(s*11.3+i*3.7));
    const M=15;
    for(let k=0;k<=M;k++){
      const q=k/M;
      // 끝으로 갈수록 휜다 — 곧으면 가시고, 휘어야 더듬는 것이 된다
      const aa=a+curl*q*q*.85+Math.sin(t*.85+i*2.1+q*2.4)*.11;
      const d=RR*.40+len*q*grow;
      const x=cx+Math.cos(aa)*d,y=cy+Math.sin(aa)*d;
      // 풀릴 때는 굵어지며 옅어진다 — 사라지는 게 아니라 흩어지는 것이다.
      // 손끝만 살짝 뭉친다 — 더듬는 것은 끝이 무겁다.
      const knot=1+.40*Math.max(0,(q-.80)/.20);
      const rr=RR*(.15-.062*q)*knot*(1+die*1.5);
      const al=Math.max(0,.22*(1-.28*q)*Math.min(1,u/.10)*(1-die)*(1-die));
      puff(x,y,rr,al);
    }
  }
  c.restore();
}]);

// ── 수 — **4안의 결로 다섯 더** (2026-08-09 요청) ──────────────────
/// 수(水) — **큰 물방울에 감싸인 몸**을 그리는 공통 틀.
/// 4안의 문법 그대로: 바깥 윤곽과 안쪽 윤곽 **사이를 채운다**(획이 아니라 면).
/// 채워야 「감싸였다」가 되고, 획만 그으면 그냥 「테두리」가 된다 — 사용자가
/// 4안에서 좋다고 한 것이 정확히 이 **두께**다(2026-08-09).
function aqWrap(c,cx,cy,RR,tn,fo,fi,al,lit){
  const T=TONE[tn],NN=64,OU=[],IN=[],A2=al===undefined?1:al;
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;
    const ro=fo(a),ri=fi(a);
    OU.push([cx+Math.cos(a)*ro,cy+Math.sin(a)*ro]);
    IN.push([cx+Math.cos(a)*ri,cy+Math.sin(a)*ri]);}
  const RV=IN.slice().reverse();
  fillPoly(c,OU.concat(RV),A(T[0],.92*A2));
  fillPoly(c,OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*.60,
                            IN[i][1]+(p[1]-IN[i][1])*.60]).concat(RV),A(T[1],.95*A2));
  celStroke(c,OU,2.2,tn,.85*A2);
  if(lit){
    // 흰 앞날 — 겉면 안쪽에 얇게. 물은 **가장자리에서 빛을 받는다.**
    fillPoly(c,OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*.86,
                              IN[i][1]+(p[1]-IN[i][1])*.86])
      .concat(OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*.99,
                             IN[i][1]+(p[1]-IN[i][1])*.99]).reverse()),
      A(T[2],.30*A2));
    // 광택 — 한쪽만 반짝인다. 사방이 반짝이면 그건 고리지 방울이 아니다.
    const HL=[];
    for(let k=0;k<=14;k++){const q=k/14,i=Math.round((.63+q*.14)*NN);
      const p=OU[i%NN],n2=IN[i%NN];
      HL.push([n2[0]+(p[0]-n2[0])*.80,n2[1]+(p[1]-n2[1])*.80]);}
    celStroke(c,HL,3.0,tn,.9*A2);
    // 속에서 비치는 빛 — 방울 안이 살짝 밝다.
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(cx-RR*.22,cy-RR*.26,0,cx,cy,RR*.9);
    g.addColorStop(0,A(T[2],.13*A2));g.addColorStop(.62,A(T[1],.06*A2));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.9,0,TAU);c.fill();c.restore();}
  return {OU,IN};
}
const aqNear=(a,th)=>{let d=a-th;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d;};

FVSET.aqua.push(["**한쪽으로 처진다** — 감싼 물이 아래로 몰려 눈물 모양이 된다",
function(c,cx,cy,RR,t,tn){
  const dn=Math.PI/2+Math.sin(t*.52)*.30;          // 아주 느리게 흔들린다
  const bul=a=>Math.exp(-Math.pow(aqNear(a,dn),2)*1.1);
  const tip=a=>Math.exp(-Math.pow(Math.PI-Math.abs(aqNear(a,dn)),2)*2.6);
  aqWrap(c,cx,cy,RR,tn,
    a=>RR*(.90+.17*bul(a)-.11*tip(a)+.020*Math.sin(a*4-t*1.2)),
    a=>RR*(.76-.06*bul(a)+.06*tip(a)));
  // 뾰족한 끝 — 눈물방울은 **끝이 있다.** 없으면 그냥 두꺼운 고리다.
  const P2=[];
  for(let k=0;k<=8;k++){const q=k/8,a=dn+Math.PI;
    P2.push([cx+Math.cos(a)*RR*(.80+q*.30),cy+Math.sin(a)*RR*(.80+q*.30)]);}
  celRibbon(c,P2,5.0,tn,.50);}]);

FVSET.aqua.push(["**숨쉰다** — 감싼 물이 통째로 부풀었다 오므라든다",
function(c,cx,cy,RR,t,tn){
  // 표면장력의 0차 진동 — 방향이 없고 **두께만** 변한다. 열 중 가장 조용하다.
  const br=Math.sin(t*.85), sw=.10*br;
  aqWrap(c,cx,cy,RR,tn,
    a=>RR*(.90+sw+.018*Math.sin(a*5+t*1.6)),
    a=>RR*(.74-sw*.55+.014*Math.sin(a*3-t*1.1)));
  // 부풀 때만 얇은 겉면이 한 겹 더 보인다 — 표면이 늘어난 자국.
  if(br>.2){const P2=[];
    for(let i=0;i<=40;i++){const a=i/40*TAU;
      const rr=RR*(.90+sw+.05*(br-.2)/.8);
      P2.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
    celStroke(c,P2,1.6,tn,Math.max(0,(br-.2)/.8*.45));}}]);

FVSET.aqua.push(["**찌그러졌다 돌아온다** — 관성으로 타원이 되고, 장축이 천천히 돈다",
function(c,cx,cy,RR,t,tn){
  // 표면장력의 2차 진동. 4안이 **한쪽 쏠림**이라면 이쪽은 **양쪽이 동시에**다 —
  // 눌린 축과 늘어난 축이 90° 로 맞물려 돈다.
  const ax=t*.34, amp=.13*Math.sin(t*1.15);
  const f=a=>Math.cos(2*(a-ax));
  aqWrap(c,cx,cy,RR,tn,
    a=>RR*(.90+amp*f(a)+.016*Math.sin(a*5-t*1.4)),
    a=>RR*(.75+amp*.55*f(a)));
  // 늘어난 축 끝이 살짝 뾰족해진다 — 물은 늘어나면 끝이 선다.
  for(const s of[0,Math.PI]){
    const a=ax+s, e=Math.max(0,amp)/.13;
    if(e<.15)continue;
    celSpike(c,cx+Math.cos(a)*RR*.98,cy+Math.sin(a)*RR*.98,a,RR*.16*e,4.0,tn,.5*e);}}]);

FVSET.aqua.push(["**두 겹으로 감싼다** — 안쪽 막이 바깥과 어긋난 박자로 쏠린다",
function(c,cx,cy,RR,t,tn){
  // 몸을 **감싼다** — 아래쪽 반이 몸 위로 온다(2026-08-09).
  wrapBody(c,cx,cy,RR,(c)=>{
  const th1=Math.PI/2+1.05*Math.sin(t*.72);
  const th2=Math.PI/2+1.05*Math.sin(t*.72-1.15);   // 늦게 따라온다
  const p1=a=>Math.exp(-Math.pow(aqNear(a,th1),2)*1.5);
  const p2=a=>Math.exp(-Math.pow(aqNear(a,th2),2)*1.5);
  aqWrap(c,cx,cy,RR,tn,
    a=>RR*(.94+.20*p1(a)+.016*Math.sin(a*4-t*1.5)),
    a=>RR*(.82-.04*p1(a)),1,1);   // 광택 켬 — 4안처럼 「물방울이 빛난다」
  // 안쪽 막 — **늦게 따라온다.** 두 겹이라는 것이 이 시차 하나로 읽힌다.
  aqWrap(c,cx,cy,RR,tn,
    a=>RR*(.70+.13*p2(a)),
    a=>RR*(.58-.03*p2(a)),.62);
  // 혀 — 쏠린 물이 끝에서 **말려 넘어간다.** 4안에서 희끗희끗 났다 사라지는
  // 그 갈고리다(사용자 요청 2026-08-09). **되돌아서는 순간에만** 길어지므로
  // 상시가 아니라 깜빡이는 것으로 읽히고, 리본이라 양 끝이 저절로 뾰족해진다.
  // 닫힌 고리에 리본을 쓰면 이음매가 터지지만 이건 **열린 획**이라 안전하다.
  const turn=1-Math.abs(Math.cos(t*.72));
  const dirn=Math.cos(t*.72)>0?-1:1;
  const LIP=[];
  for(let k=0;k<=12;k++){const q=k/12,aa=th1+dirn*q*1.05,rr=RR*(1.18-.36*q*q);
    LIP.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
  celRibbon(c,LIP,6.2*turn+1.2,tn,Math.max(0,.26+.54*turn));
  // 뒤따라오는 물 — 쏠린 자리 뒤에서 늦게 밀려온다(관성의 꼬리). 4안과 같다.
  const LG=[];
  for(let k=0;k<=16;k++){const q=k/16,aa=th1-dirn*(.40+q*1.5);
    const rr=RR*(.90+.04*Math.sin(q*TAU+t*2.2));
    LG.push([cx+Math.cos(aa)*rr,cy+Math.sin(aa)*rr]);}
  celRibbonEven(c,LG,2.6,tn,.38);});}]);

FVSET.aqua.push(["**아래가 두껍다** — 물이 고여 밑이 무겁고 위는 터질 듯 얇다",
function(c,cx,cy,RR,t,tn){
  const dn=Math.PI/2;
  const low=a=>Math.max(0,Math.cos(aqNear(a,dn)));   // 아래로 갈수록 두껍다
  const thin=1-.35*Math.max(0,Math.sin(t*.62));      // 위가 주기적으로 더 얇아진다
  aqWrap(c,cx,cy,RR,tn,
    a=>RR*(.90+.10*low(a)+.016*Math.sin(a*4+t*1.3)),
    a=>RR*(.90-(.055+.13*low(a))*(low(a)>.2?1:thin)));
  // 얇아진 꼭대기 — 곧 끊길 듯한 자리. 반짝여서 「얇다」를 말한다.
  if(thin<.85){const f=(1-thin)/.35;
    const P2=[];
    for(let k=0;k<=10;k++){const a=dn+Math.PI-.5+k/10*1.0;
      P2.push([cx+Math.cos(a)*RR*.88,cy+Math.sin(a)*RR*.88]);}
    celStroke(c,P2,1.4,tn,Math.max(0,f*.7));}
  // 고인 물의 수면 — 아래쪽 안쪽 면에 잔물결 하나.
  const P3=[];
  for(let k=0;k<=14;k++){const a=dn-.72+k/14*1.44;
    const rr=RR*(.78+.020*Math.sin(k*1.7+t*2.4));
    P3.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  celStroke(c,P3,1.8,tn,.55);}]);

// ── 설 — **2안 결로 더 약하게** 다섯 (2026-08-09) ────────────────────
// ── 설 雪 · 「얹힌다」(2안) 계열 — **융화 기본** 후보 다섯 ────────────────
//
// 2안의 결을 그대로 쓰되 **전부 더 조용하다.** 융화 기본은 속성 일반보다
// 아주 약간만 화려해야 하고, 화려하면 발현이 의미를 잃는다. 그래서 세 규칙을
// 다섯이 공유한다: ① 덩이 두께는 2안의 1/3 이하(2안 최대 RR*.31 → 여기 RR*.10)
// ② 채움 알파 .95 → .5 대  ③ 내리는 눈 11알 → 4~5알.
//
// 그리고 각자 **지면 없이 중력을 말하는 법**을 하나씩 갖는다 — 칸 아래에
// 가로로 눕는 순간 지형이 되어 반려다(2·4·5안이 그렇게 떨어졌다).

// ① **정공법의 축소.** 2안은 세 자리에 덩이를 얹었다. 여기는 **한 자리**,
//    두께 1/4. 그리고 무게가 차도 「툭」 떨어지지 않는다 — 소리 없이 삭아
//    가루로 스러진다. 중력은 「덩이가 떨어지는 사건」이 아니라 **얹힌 자리가
//    늘 위쪽이라는 사실**로만 말한다.
FVSET.snow.push(["한 자리에만 얇게 — 무게가 차도 툭이 아니라 소리 없이 스러진다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const ac=-Math.PI/2+.24;                 // 정수리 정중앙을 피한다 — 가운데면 모자다
  // ⚠️ 첫 렌더에서 **몸에서 떨어진 회색 호**로 보였다. 원인 셋: 반경이 멀어
  // 코어와 사이에 검은 틈이 생겼고, 두께가 얇아 흰 마루선만 남았고, 채움
  // 알파가 낮아 회색이 됐다. 얇게 = 안 보이게가 아니다 — 붙이고 채우되 **작게**.
  // 호가 길면 **초승달**이 된다(둘째 렌더). 눈으로 읽히려면 길이 대비 두께가
  // 있어야 한다 — 호를 짧게 끊고 가장자리를 부슬부슬하게 둔다.
  const ri=RR*.455, half=.48, per=5.6, NN=12;
  const u=saw(t,per);
  const load=u<.86?ease(u/.86):1;
  const gone=u<.86?0:(u-.86)/.14;
  const th=RR*(.045+.085*load);            // 최대 RR*.13 — 2안(RR*.31)의 약 2/5
  // **다 사라지진 않는다.** 빈 칸이 되면 「지금은 융화가 아니다」로 읽힌다 —
  // 얇은 자국은 늘 남고, 무거워진 것만 스러진다(셋째 렌더에서 칸이 비었다).
  const al=Math.max(0,1-gone*.52);
  const P=[],TP=[];
  for(let k=0;k<=NN;k++){const b=ac-half+2*half*k/NN;
    P.push([cx+Math.cos(b)*ri,cy+Math.sin(b)*ri]);}
  for(let k=NN;k>=0;k--){const b=ac-half+2*half*k/NN;
    // 가장자리가 살짝 들뜬다 — 그래야 「얹힌 것」이지 몸에 칠한 선이 아니다
    const bump=1+.30*Math.sin(k*2.1+1.3)+.20*hash(k*3.7);
    const rr=ri+th*bump*Math.pow(Math.sin(Math.PI*k/NN),.40);
    TP.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr]);}
  fillPoly(c,P.concat(TP),A(T[0],Math.max(0,.80*al)));
  fillPoly(c,P.concat(TP.map(p=>[cx+(p[0]-cx)*.975,cy+(p[1]-cy)*.975])),
    A(T[1],Math.max(0,.74*al)));
  celStroke(c,TP.slice().reverse(),1.3,tn,Math.max(0,.52*al));   // 흰 마루 — 가늘게
  if(gone>0)for(let i=0;i<5;i++){        // 스러진다 — 덩이가 아니라 가루로
    const b=ac-half*.85+half*1.7*hash(i*3.7);
    const f=Math.min(1,gone*1.15+hash(i*5.1)*.22);
    const x=cx+Math.cos(b)*(ri+th)+(hash(i*7.3)-.5)*RR*.07;
    const y=cy+Math.sin(b)*(ri+th)+f*f*RR*.40;
    c.beginPath();c.arc(x,y,1.4*(1-f)+.45,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-f)*.48));c.fill();}
  for(let i=0;i<5;i++){                  // 위에서 온다 — 다섯 알이면 방향은 읽힌다
    const ph=saw(t*.30+hash(i*4.9),1);
    const x=cx+(hash(i*8.7)-.5)*RR*1.70+Math.sin(t*.9+i)*RR*.06;
    const y=cy-RR*1.18+ph*RR*1.72;
    c.beginPath();c.arc(x,y,1.1,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-ph*.5)*.32));c.fill();}
}]);

// ② **부피를 버린다.** 덩이가 하나도 없다 — 위를 향한 면에만 가루가 껴서
//    **밝기만으로** 위아래가 갈린다. 아래쪽 둘레는 맨 몸 그대로다. 다섯 중
//    제일 조용하고, 「쌓임」을 두께가 아니라 **얼룩**으로 읽게 하는 유일한 안.
FVSET.snow.push(["가루가 낀다 — 두께가 아니라 밝기로만 위아래가 갈린다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // ⚠️ 두 번 고쳤다. ① 점만 흩뿌리니 실루엣이 없었다(다른 아홉은 전부 3단 계조
  // 덩어리를 갖는다). ② 원 위에 얇은 띠를 두르니 **몸에서 뜬 회색 눈썹**이 됐다
  // — 원은 몸의 모양이 아니라서 어디에 두어도 뜬다.
  // 답은 **몸의 실루엣을 그대로 따라가는 것**이다: 코어와 똑같은 각진 별 윤곽
  // (jagPoly RR*.40 · n7 · seed3.2 · spike1.3)을 위쪽만 바깥으로 밀어내면,
  // 코어가 나중에 덮으면서 **윗면에만 낀 얇은 테**만 남는다. 뜰 자리가 없다.
  const base=jagPoly(cx,cy,RR*.40,7,3.2,1.30);
  const OU=[],IN=[];
  for(let i=0;i<base.length;i++){
    const p0=base[i],p1=base[(i+1)%base.length];
    for(let s=0;s<4;s++){const q=s/4;
      const x=p0[0]+(p1[0]-p0[0])*q, y=p0[1]+(p1[1]-p0[1])*q;
      const dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);
      const up=-Math.sin(a);
      if(up<.14)continue;                              // 아래쪽 면은 맨 몸 그대로
      // 가루는 고르게 안 낀다 — 결이 있어야 「낀 것」이지 테두리가 아니다
      const gr=(.30+.70*hash(i*4.1+s*1.7))*(.55+.45*Math.sin(a*5.3+1.1));
      // 낀 자리가 아주 천천히 옮아간다 — 가만히 있으면 테두리 장식이지 「끼는 중」이 아니다
      const creep=.62+.38*Math.sin(t*.52+a*2.7+i*.9);
      const off=RR*(.050+.080*Math.max(0,gr)*creep)*Math.pow(up,1.25);
      OU.push([x+dx/d*off,y+dy/d*off]);
      IN.push([x,y]);}}
  if(OU.length>2){
    fillPoly(c,OU.concat(IN.slice().reverse()),A(T[0],.70));
    fillPoly(c,OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*.60,
                              IN[i][1]+(p[1]-IN[i][1])*.60])
             .concat(IN.slice().reverse()),A(T[1],.66));
    celStroke(c,OU,1.2,tn,.52);}
  for(let i=0;i<40;i++){                               // 아직 덜 붙은 가루
    const a=-Math.PI/2+(hash(i*1.9)-.5)*2.6;
    const up=Math.max(0,-Math.sin(a));
    const g=Math.pow(up,1.5)*(.55+.45*hash(i*6.1));
    // 알갱이마다 제 주기로 앉았다 삭는다 — 한꺼번에 밝아지면 후광이 된다
    const per=3.2+hash(i*3.1)*2.8;
    const ph=((t+hash(i*9.7)*13)%per)/per;
    const life=Math.sin(Math.PI*Math.min(1,ph/.84));
    const rr=RR*(.46+.16*hash(i*5.3));
    const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;
    c.beginPath();c.arc(x,y,(.7+1.0*hash(i*7.9)),0,TAU);
    c.fillStyle=A(T[2],Math.max(0,g*life*.70));c.fill();}
  for(let i=0;i<4;i++){                   // 위에서 온다
    const ph=saw(t*.26+hash(i*5.7),1);
    const x=cx+(hash(i*9.3)-.5)*RR*1.65+Math.sin(t*.8+i)*RR*.05;
    const y=cy-RR*1.16+ph*RR*1.70;
    c.beginPath();c.arc(x,y,1.05,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-ph*.5)*.30));c.fill();}
}]);

// ③ **자라는 방향을 뒤집는다.** 얹힌 눈은 두꺼워지는 게 아니라 **끝이 아래로**
//    말려 처마가 된다. 지붕 끝의 눈처마가 딱 그렇다 — 지면이 없어도 「아래」가
//    보인다. 그리고 무너지는 것도 통째가 아니라 **끝만** 뚝 진다.
FVSET.snow.push(["처마가 진다 — 두께가 아니라 끝이 아래로 자라고, 끝만 뚝 진다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const ri=RR*.455, ac=-Math.PI/2+.22, half=.70, NN=16, per=4.6;
  const u=saw(t,per);
  const grow=u<.82?ease(u/.82):1;
  const snap=u<.82?0:(u-.82)/.18;
  const lip=RR*.24*grow*(1-ease(Math.min(1,snap*1.6)));
  const P=[],TP=[];
  // 안쪽도 같이(덜) 처진다 — 안 그러면 끝이 **뭉툭한 덩이**가 되어 처마가 아니다
  const ea=q=>Math.pow(Math.max(0,(q-.52)/.48),1.8);
  for(let k=0;k<=NN;k++){const q=k/NN,b=ac-half+2*half*q;
    P.push([cx+Math.cos(b)*ri,cy+Math.sin(b)*ri+lip*ea(q)*.66]);}
  for(let k=NN;k>=0;k--){const q=k/NN,b=ac-half+2*half*q;
    // 몸통은 얇지만 **선으로 보일 만큼 얇으면 안 된다**(셋째 렌더: 흰 줄로 읽힘)
    const th=RR*.085*Math.pow(Math.sin(Math.PI*q),.30);
    const rr=ri+th;
    // **처마** — 바깥 끝(q>.52)만 아래로 늘어진다. 위로는 안 자란다.
    TP.push([cx+Math.cos(b)*rr,cy+Math.sin(b)*rr+lip*ea(q)]);}
  fillPoly(c,P.concat(TP),A(T[0],.80));
  fillPoly(c,P.concat(TP.map(p=>[cx+(p[0]-cx)*.975,cy+(p[1]-cy)*.975])),A(T[1],.74));
  celStroke(c,TP.slice().reverse(),1.3,tn,.52);
  // 끝만 뚝 — 떨어져 나간 처마 조각 하나. 덩이는 작게, 하나면 충분하다.
  if(snap>0&&snap<1){
    const b=ac+half;
    const f=ease(Math.min(1,snap));
    const x=cx+Math.cos(b)*ri+(0.03*RR);
    const y=cy+Math.sin(b)*ri+RR*.24+f*f*RR*.85;
    c.save();c.translate(x,y);c.rotate(f*1.7);
    fillPoly(c,jagPoly(0,0,RR*.048,6,2.7,1.15),A(T[1],Math.max(0,(1-f)*.62)));
    c.restore();}
  for(let i=0;i<4;i++){                   // 위에서 온다
    const ph=saw(t*.28+hash(i*6.1),1);
    const x=cx+(hash(i*8.9)-.5)*RR*1.66+Math.sin(t*1.0+i)*RR*.06;
    const y=cy-RR*1.18+ph*RR*1.72;
    c.beginPath();c.arc(x,y,1.1,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-ph*.5)*.30));c.fill();}
}]);

// ④ **연속을 버리고 개수로 간다.** 눈이 띠로 앉는 게 아니라 **한 알씩** 앉는다
//    — 셋에서 넷, 세어질 만큼만. 위에서 곧게 **가속하며** 내려와 닿는 순간이
//    보이는 유일한 안이라, 중력이 상태가 아니라 사건으로 읽힌다.
//    (5안 「안쪽이 아래다」와 다르다: 저쪽은 사방에서 와 껍질이 되고,
//     이쪽은 **위에서만** 오고 껍질이 안 생긴다.)
FVSET.snow.push(["한 알씩 앉는다 — 셀 수 있을 만큼만. 닿는 순간이 보인다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const NF=6, FALL=.30, rest=RR*.455;   // 몸에 **붙여** 앉힌다 — 띄우면 떠도는 구슬
  for(let i=0;i<NF;i++){
    const per=5.0+hash(i*4.3)*3.2;
    const ph=((t+hash(i*9.1)*17)%per)/per;
    const aL=-Math.PI/2+(hash(i*2.7)-.5)*2.25;      // 위쪽 반원에만 앉는다
    const lx=cx+Math.cos(aL)*rest, ly=cy+Math.sin(aL)*rest;
    if(ph<FALL){                                    // 위에서 곧게 — 가속이 중력이다
      const q=ph/FALL, e=q*q;
      const y0=cy-RR*1.30;
      const x=lx+(1-e)*(hash(i*5.9)-.5)*RR*.34;
      const y=y0+(ly-y0)*e;
      c.beginPath();c.arc(x,y,1.35,0,TAU);
      c.fillStyle=A(T[2],Math.max(0,.26+.40*q));c.fill();
      continue;}
    const s2=(ph-FALL)/(1-FALL);
    // 닿자마자 살짝 퍼졌다 자리를 잡고, 오래된 것부터 삭는다
    // 알마다 크기가 달라야 「알」이다 — 같으면 나란한 알약 세 개로 읽힌다
    const sz=RR*(.040+.034*hash(i*6.7))*(1+.55*Math.exp(-s2*16))
             *Math.min(1,(1-s2)*4.0);
    if(sz<.5)continue;
    c.save();c.translate(lx+Math.cos(aL)*sz*.55,ly+Math.sin(aL)*sz*.55);
    c.rotate(aL+Math.PI/2+(hash(i*8.9)-.5)*.55);
    const el=(k,col)=>{const w=Math.max(.3,sz*1.7*k),h=Math.max(.25,sz*k);
      c.beginPath();c.ellipse(0,0,w,h,0,0,TAU);c.fillStyle=col;c.fill();};
    el(1,A(T[0],.80));el(.62,A(T[1],.76));el(.28,A(T[2],.86));
    c.restore();
    if(s2<.10){                                     // 닿았다 — 옆으로 튄 두 알
      const k2=s2/.10;
      for(let s=-1;s<=1;s+=2){const b=aL+s*(.07+.20*k2),rr=rest+RR*(.02+.07*k2);
        c.beginPath();c.arc(cx+Math.cos(b)*rr,cy+Math.sin(b)*rr,1.5*(1-k2)+.3,0,TAU);
        c.fillStyle=A(T[2],Math.max(0,(1-k2)*.55));c.fill();}}
  }
}]);

// ⑤ **얹힌 것이 제자리를 안다.** 눈띠가 둘레를 따라 천천히 밀려났다가 **스르르
//    미끄러져 늘 위로 되돌아온다.** 중력을 「쌓인 높이」도 「떨어짐」도 아닌
//    **「되돌아오는 방향」**으로 말한다. (3안 매달림과 반대다: 저쪽은 무게가
//    아래로 늘어지고, 이쪽은 얹힌 것이 위로 돌아온다.)
FVSET.snow.push(["미끄러져 늘 위로 되돌아온다 — 얹힌 것이 제 자리를 안다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const per=4.2, u=saw(t,per);
  const n=Math.floor(t/per), side=(n%2)?-1:1;
  // 밀려나는 데 오래(0~.74), 되돌아오는 건 짧다(.74~1) — 미끄러짐의 비대칭
  const s=u<.74?ease(u/.74):1-ease((u-.74)/.26);
  const slip=u<.74?0:Math.sin(Math.PI*(u-.74)/.26);   // 미끄러지는 중
  const cen=-Math.PI/2+side*.88*s;
  const ri=RR*.455, half=.56, NN=14;
  const P=[],TP=[];
  for(let k=0;k<=NN;k++){const b=cen-half+2*half*k/NN;
    P.push([cx+Math.cos(b)*ri,cy+Math.sin(b)*ri]);}
  for(let k=NN;k>=0;k--){const q=k/NN,b=cen-half+2*half*q;
    // 미끄러지는 앞쪽이 얇아지고 뒤가 두껍다 — 끌린 자국이라야 미끄러짐이다
    const lead=side>0?1-q:q;
    const th=RR*(.036+.082*Math.pow(Math.sin(Math.PI*q),.55))*(1-.40*slip*lead);
    TP.push([cx+Math.cos(b)*(ri+th),cy+Math.sin(b)*(ri+th)]);}
  fillPoly(c,P.concat(TP),A(T[0],.80));
  fillPoly(c,P.concat(TP.map(p=>[cx+(p[0]-cx)*.975,cy+(p[1]-cy)*.975])),A(T[1],.74));
  celStroke(c,TP.slice().reverse(),1.3,tn,.52);
  // 지나온 자리 — 미끄러질 때만 남는 옅은 자국. 「어디서 왔는지」가 있어야 미끄러짐.
  if(slip>.02)for(let i=0;i<4;i++){
    const b=cen+side*(half*.9+ (i+1)*.17);
    const rr=ri+RR*.018;
    c.beginPath();c.arc(cx+Math.cos(b)*rr,cy+Math.sin(b)*rr,1.2-i*.18,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,slip*(.42-i*.09)));c.fill();}
  // 미끄러지며 흘린 것 — 아래로 곧게 떨어진다. 이 한 줄이 방향을 못 박는다.
  if(slip>.02)for(let i=0;i<3;i++){
    const b=cen+side*(half*.55);
    const f=Math.min(1,slip*.9+hash(i*4.7)*.3);
    const x=cx+Math.cos(b)*ri+(hash(i*6.3)-.5)*RR*.10;
    const y=cy+Math.sin(b)*ri+f*f*RR*.55;
    c.beginPath();c.arc(x,y,1.2*(1-f)+.4,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-f)*slip*.55));c.fill();}
  for(let i=0;i<4;i++){                   // 위에서 온다
    const ph=saw(t*.27+hash(i*7.1),1);
    const x=cx+(hash(i*9.9)-.5)*RR*1.66+Math.sin(t*.9+i)*RR*.06;
    const y=cy-RR*1.18+ph*RR*1.72;
    c.beginPath();c.arc(x,y,1.1,0,TAU);
    c.fillStyle=A(T[2],Math.max(0,(1-ph*.5)*.30));c.fill();}
}]);

// ── 수 — 4안 결로 다섯 더 (11~15안) ────────────────────────────────
// ── 수 水 · 4안의 결 — 「큰 물방울에 감싸인 몸」 다섯 ────────────────────
// 사용자가 4안에서 좋다고 한 것은 **감싸는 두께**다. 그래서 다섯 모두
// 바깥 윤곽과 안쪽 윤곽 **사이를 채우고**(획이 아니라 면), 그 위에 겉면
// 흰 앞날 + 한쪽 광택 + 속빛을 얹는다 — 이래야 「테두리」가 아니라 「방울」이다.
// 안쪽 윤곽은 **빛 쪽으로 밀어** 둔다: 가까운 벽은 얇고 먼 벽은 두꺼워야
// 유리알처럼 보인다. 두께가 고르면 물방울이 아니라 도넛이다(렌더 판정).
// ⚠️ 이슬은 언제나 RR 의 2~4%. 알을 키우면 이 결이 통째로 무너진다.
// ⚠️ 융화 기본 후보 — **속성 일반보다 아주 약간만** 화려해야 한다.
// ⚠️ 바탕 헬퍼(aqShell/aqBead/aqWrap)는 세대마다 갈아엎히므로 **아무것도
//    안 부른다.** 다섯이 각자 자기 바탕을 갖는다.

// ⑪ 속에서 흐른다 — 4안(쏠린다)·숨쉰다(두께)·찌그러짐(모양)은 전부
// **겉이 변하는** 안이다. 이쪽은 겉이 하나도 안 변한다: 감싼 물이 통째로
// 한 방향으로 감돌 뿐이다. 3안(한 줄기)이 **획 하나가 지나는 길**이라면
// 여기는 **껍질 전체가 흐르는 것**이라, 도는 게 아니라 흐르는 것으로 읽힌다.
FVSET.aqua.push(["**겉은 멈춰 있는데 속이 흐른다** — 감싼 물이 통째로 한 방향으로 천천히 감돈다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NN=64, ox=cx-RR*.075, oy=cy-RR*.085;
  const fo=a=>RR*(.94+.018*Math.sin(a*4-t*.8));
  const fi=a=>RR*(.74+.014*Math.sin(a*3+t*.6));
  // 껍질 두께 안의 한 점 — k=0 안쪽 벽, k=1 바깥 벽.
  const band=(a,k)=>{const r1=fo(a),r2=fi(a);
    const x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1;
    const x2=ox+Math.cos(a)*r2,y2=oy+Math.sin(a)*r2;
    return [x2+(x1-x2)*k,y2+(y1-y2)*k];};
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx-RR*.22,cy-RR*.26,0,cx,cy,RR*.9);
  g.addColorStop(0,A(T[2],.13));g.addColorStop(.62,A(T[1],.06));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.9,0,TAU);c.fill();c.restore();
  const OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;
    OU.push(band(a,1));IN.push(band(a,0));}
  const RV=IN.slice().reverse();
  const mid=k=>OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*k,IN[i][1]+(p[1]-IN[i][1])*k]);
  fillPoly(c,OU.concat(RV),A(T[0],.92));
  fillPoly(c,mid(.58).concat(RV),A(T[1],.95));
  fillPoly(c,mid(.86).concat(mid(.99).reverse()),A(T[2],.28));
  celStroke(c,OU,2.2,tn,.85);
  // 결 — 껍질 두께 **안**을 미끄러진다. 전부 같은 속도라 흐름이 안 끊긴다.
  // 꼬리가 좁아지는 열린 호(celRibbon)라야 「어디로 흐르는지」가 보인다.
  const sp=t*.42;
  for(let k=0;k<4;k++){
    const a0=sp+k/4*TAU,P2=[];
    for(let j=0;j<=12;j++){const q=j/12;
      P2.push(band(a0+q*.82,.30+.38*Math.sin(q*Math.PI)));}
    celRibbon(c,P2,5.2,tn,.78,false);}
  // 광택 — 한쪽만 반짝인다. 흐름과 무관하게 **제자리**라야 광원이 된다.
  const M8=mid(.80),HL=[];
  for(let k=0;k<=14;k++)HL.push(M8[Math.round((.63+k/14*.14)*NN)%NN]);
  celStroke(c,HL,3.0,tn,.9);
  // 이슬 — 결에 실려 같이 돈다. 겉이 안 변하니 이것이 「흐른다」의 증거다.
  for(let i=0;i<24;i++){
    const a=sp*1.06+i/24*TAU+hash(i*3.1)*.10;
    const rr=RR*(.013+.012*hash(i*7.7)),p=band(a,.90);
    c.beginPath();c.ellipse(p[0],p[1],rr,rr*.9,0,0,TAU);c.fillStyle=A(T[0],.80);c.fill();
    c.beginPath();c.ellipse(p[0],p[1],rr*.62,rr*.56,0,0,TAU);c.fillStyle=A(T[1],.90);c.fill();
    c.beginPath();c.arc(p[0]-rr*.24,p[1]-rr*.26,Math.max(.5,rr*.24),0,TAU);
    c.fillStyle=A(T[2],.92);c.fill();}
}]);

// ⑫ 렌즈 — 물방울은 **빛을 모은다.** 겉에서 꺾여 들어온 빛이 건너편 안쪽
// 벽에 밝은 초승달(커스틱)로 맺힌다. 움직이는 것이 물이 아니라 **초점**이라,
// 열 중 가장 조용한데도 「몸이 물방울 **속**에 있다」가 제일 강하게 읽힌다.
FVSET.aqua.push(["**빛을 모은다** — 물방울은 렌즈라, 꺾여 들어온 빛이 건너편 안쪽 벽에 초승달로 맺힌다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NN=64, ox=cx-RR*.075, oy=cy-RR*.085;
  const LA=.70*TAU;                                  // 빛이 오는 쪽 = 광택 자리
  const fo=a=>RR*(.94+.016*Math.sin(a*4-t*.7));
  const fi=a=>RR*(.74+.012*Math.sin(a*3+t*.5));
  const band=(a,k)=>{const r1=fo(a),r2=fi(a);
    const x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1;
    const x2=ox+Math.cos(a)*r2,y2=oy+Math.sin(a)*r2;
    return [x2+(x1-x2)*k,y2+(y1-y2)*k];};
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx-RR*.22,cy-RR*.26,0,cx,cy,RR*.9);
  g.addColorStop(0,A(T[2],.13));g.addColorStop(.62,A(T[1],.06));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.9,0,TAU);c.fill();c.restore();
  const OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;OU.push(band(a,1));IN.push(band(a,0));}
  const RV=IN.slice().reverse();
  const mid=k=>OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*k,IN[i][1]+(p[1]-IN[i][1])*k]);
  fillPoly(c,OU.concat(RV),A(T[0],.92));
  fillPoly(c,mid(.58).concat(RV),A(T[1],.95));
  fillPoly(c,mid(.86).concat(mid(.99).reverse()),A(T[2],.28));
  celStroke(c,OU,2.2,tn,.85);
  const foc=.5+.5*Math.sin(t*1.05);                  // 초점이 조였다 풀린다
  const FA=LA+Math.PI;                               // 맺히는 자리 = 정반대 안쪽 벽
  const fp=band(FA,.06), fx=fp[0], fy=fp[1];
  // 꺾여 들어온 빛 — 물속에서 휘어 한 점으로 모인다. 「모은다」의 이유다.
  for(let s=-1;s<=1;s++){
    const ea=LA+s*.50, ep=band(ea,.30);
    const dx=fx-ep[0],dy=fy-ep[1],dl=Math.hypot(dx,dy)||1,P2=[];
    for(let j=0;j<=12;j++){const q=j/12,bd=Math.sin(Math.PI*q)*RR*.15*s;
      P2.push([ep[0]+dx*q-dy/dl*bd, ep[1]+dy*q+dx/dl*bd]);}
    celStroke(c,P2,1.7,tn,Math.max(0,.14+.22*foc));}
  // 초점 — 안쪽 벽에 맺힌 초승달. 조여들수록 짧고 가늘고 밝다.
  const CA=[];
  for(let k=0;k<=16;k++)CA.push(band(FA+(k/16-.5)*(1.30-.60*foc),.10));
  celStroke(c,CA,4.6-2.0*foc,tn,Math.max(0,.45+.50*foc));
  // 다 조여든 순간의 **점** — 렌즈가 한 점에 모았다는 마지막 한 획.
  if(foc>.72){const q=(foc-.72)/.28;
    c.save();c.globalCompositeOperation="lighter";
    const g2=c.createRadialGradient(fx,fy,0,fx,fy,RR*.20);
    g2.addColorStop(0,A(T[2],.55*q));g2.addColorStop(1,A(T[1],0));
    c.fillStyle=g2;c.beginPath();c.arc(fx,fy,RR*.20,0,TAU);c.fill();c.restore();}
  // 광택 — 빛이 들어오는 자리. 초점과 정반대라야 「건너편」이 성립한다.
  const M8=mid(.80),HL=[];
  for(let k=0;k<=14;k++)HL.push(M8[Math.round((.63+k/14*.14)*NN)%NN]);
  celStroke(c,HL,3.0,tn,.9);
  // 이슬 — 알 하나하나가 작은 렌즈다. 빛 쪽 알만 밝게 산다.
  for(let i=0;i<28;i++){
    const a=i/28*TAU+.05*Math.sin(t*.9+i*.6);
    const fc=Math.max(0,Math.cos(a-LA)),al=Math.max(0,.26+.66*fc);
    const rr=RR*(.013+.012*hash(i*5.3)),p=band(a,.92);
    c.beginPath();c.ellipse(p[0],p[1],rr,rr*.9,0,0,TAU);c.fillStyle=A(T[0],.82*al);c.fill();
    c.beginPath();c.ellipse(p[0],p[1],rr*.62,rr*.56,0,0,TAU);c.fillStyle=A(T[1],.92*al);c.fill();
    c.beginPath();c.arc(p[0]-rr*.24,p[1]-rr*.26,Math.max(.5,rr*.24),0,TAU);
    c.fillStyle=A(T[2],al);c.fill();}
}]);

// ⑬ 기포 — 나머지 아홉은 전부 **껍질에서** 일어난다. 이쪽만 **안**이다:
// 감싼 물이 품고 있던 공기가 떠올라 안쪽 벽에 닿아 터진다. 속이 빈 고리라
// 채운 이슬과 한눈에 갈리고, 각진 별 코어(RR*.40)를 좌우로 비켜 오르게 길을 잡았다.
FVSET.aqua.push(["**품은 기포가 떠올라 터진다** — 껍질 위가 아니라 껍질 안에서 일어나는 유일한 것",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NN=64, ox=cx-RR*.075, oy=cy-RR*.085;
  // 위쪽이 조금 두껍다 — 기포가 모여 드는 쪽이라야 「떠오른다」의 도착지가 된다.
  const up=a=>Math.max(0,-Math.sin(a));
  const fo=a=>RR*(.93+.05*up(a)+.016*Math.sin(a*4-t*.9));
  const fi=a=>RR*(.74+.012*Math.sin(a*3+t*.7));
  const band=(a,k)=>{const r1=fo(a),r2=fi(a);
    const x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1;
    const x2=ox+Math.cos(a)*r2,y2=oy+Math.sin(a)*r2;
    return [x2+(x1-x2)*k,y2+(y1-y2)*k];};
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx-RR*.22,cy-RR*.26,0,cx,cy,RR*.9);
  g.addColorStop(0,A(T[2],.13));g.addColorStop(.62,A(T[1],.06));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.9,0,TAU);c.fill();c.restore();
  const OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;OU.push(band(a,1));IN.push(band(a,0));}
  const RV=IN.slice().reverse();
  const mid=k=>OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*k,IN[i][1]+(p[1]-IN[i][1])*k]);
  fillPoly(c,OU.concat(RV),A(T[0],.92));
  fillPoly(c,mid(.58).concat(RV),A(T[1],.95));
  fillPoly(c,mid(.86).concat(mid(.99).reverse()),A(T[2],.28));
  celStroke(c,OU,2.2,tn,.85);
  const M8=mid(.80),HL=[];
  for(let k=0;k<=14;k++)HL.push(M8[Math.round((.63+k/14*.14)*NN)%NN]);
  celStroke(c,HL,3.0,tn,.9);
  for(let i=0;i<7;i++){
    const per=2.2+1.5*hash(i*5.3);
    const u=((t+hash(i*9.1)*per)%per)/per;
    const xr=(i%2?1:-1)*(.42+.26*hash(i*3.7));       // 코어를 비켜 가는 길
    const yh=Math.sqrt(Math.max(0,1-xr*xr));
    const x=ox+RR*.72*(xr+.05*Math.sin(t*1.7+i*2.1));
    const y=oy+RR*.72*yh*(.80-1.64*ease(u));         // 아래 → 위
    const gr=RR*(.020+.012*hash(i*11.3))*(.55+.45*ease(u));
    const pop=Math.max(0,(u-.86)/.14);
    const al=Math.min(1,u/.10)*(1-pop);
    if(al>.02){
      // 기포는 **속이 빈 고리** — 오르며 조금 커지고, 터질 때 납작해진다.
      const rx=gr*(1+pop*1.45),ry=gr*(1-pop*.85);
      c.beginPath();c.ellipse(x,y,Math.max(.4,rx*1.06),Math.max(.4,ry*1.06),0,0,TAU);
      c.strokeStyle=A(T[0],Math.max(0,.80*al));c.lineWidth=Math.max(1.4,gr*.72);c.stroke();
      c.beginPath();c.ellipse(x,y,Math.max(.3,rx),Math.max(.3,ry),0,0,TAU);
      c.strokeStyle=A(T[2],Math.max(0,.92*al));c.lineWidth=Math.max(.9,gr*.34);c.stroke();
      // 뒤에 남는 자국 — 어느 쪽으로 오르는지가 이 한 획으로 읽힌다.
      if(u>.14&&u<.86)celStroke(c,[[x,y+gr*3.4],[x,y+gr*1.5]],1.1,tn,Math.max(0,.26*al));}
    // 터진 자리 — 안쪽 벽에 아주 작은 파문 하나만. 접선 방향으로 눕힌다.
    if(pop>0&&pop<1){
      const a=Math.atan2(y-oy,x-ox),m=band(a,.02);
      const nx=Math.cos(a),ny=Math.sin(a);
      celStroke(c,[[m[0]+ny*gr*2.6*pop,m[1]-nx*gr*2.6*pop],
                   [m[0]+nx*gr*1.1*pop,m[1]+ny*gr*1.1*pop],
                   [m[0]-ny*gr*2.6*pop,m[1]+nx*gr*2.6*pop]],
        1.4,tn,Math.max(0,(1-pop)*.60));}}
}]);

// ⑭ 젖음 — 이 속성의 정체가 「적을 **젖게** 만든다」인데 정작 물기가 몸
// 밖으로 나가는 안이 하나도 없었다. 1안(파문 — 퍼져 사라지는 고리)과
// 갈리는 지점은 하나다: **나갔다가 도로 당겨진다.** 선이 아니라 배어 번진 면.
// ⚠️ 멀리 내보내면 그 순간 「고리 하나 더」가 된다. 껍질에 **붙여** 둔다.
FVSET.aqua.push(["**배어 나갔다 도로 당겨진다** — 물기가 껍질 밖으로 번져 적셨다가 다시 빨려든다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NN=64, ox=cx-RR*.075, oy=cy-RR*.085;
  const w=.5+.5*Math.sin(t*.62);                     // 번진 정도
  const fo=a=>RR*(.90+.016*Math.sin(a*4-t*.8));
  const fi=a=>RR*(.73+.012*Math.sin(a*3+t*.6));
  const fw=a=>fo(a)*(1+.145*w)*(1+.022*Math.sin(a*3+t*.9)+.014*Math.sin(a*5-t*1.3));
  const band=(a,k)=>{const r1=fo(a),r2=fi(a);
    const x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1;
    const x2=ox+Math.cos(a)*r2,y2=oy+Math.sin(a)*r2;
    return [x2+(x1-x2)*k,y2+(y1-y2)*k];};
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx-RR*.22,cy-RR*.26,0,cx,cy,RR*.9);
  g.addColorStop(0,A(T[2],.13));g.addColorStop(.62,A(T[1],.06));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.9,0,TAU);c.fill();c.restore();
  if(w>.03){
    // 젖은 자리 — **면**이다. 고리 하나로 보이면 파문이 되니 속을 채운다.
    const WE=[];
    for(let i=0;i<=NN;i++){const a=i/NN*TAU,rr=fw(a);
      WE.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
    c.save();c.globalCompositeOperation="lighter";
    const g2=c.createRadialGradient(cx,cy,RR*.84,cx,cy,RR*.90*(1+.145*w));
    g2.addColorStop(0,A(T[1],.72*w));g2.addColorStop(.45,A(T[1],.34*w));
    g2.addColorStop(1,A(T[1],.03*w));
    // ⚠️ 안쪽을 **도려낸다**. 안 그러면 방사 그라디언트의 첫 스톱이 중심까지
    // 채워 방울 속이 통째로 뿌예진다 — 「밖으로 번졌다」가 안 읽힌다.
    c.beginPath();
    WE.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));
    c.closePath();
    c.moveTo(cx+RR*.84,cy);c.arc(cx,cy,RR*.84,TAU,0,true);
    c.fillStyle=g2;c.fill();c.restore();
    // 젖은 가장자리 — 닫힌 고리라 celRibbon 금지, celStroke 로 잇는다.
    celStroke(c,WE,1.6,tn,Math.max(0,.05+.21*w));}
  const OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;OU.push(band(a,1));IN.push(band(a,0));}
  const RV=IN.slice().reverse();
  const mid=k=>OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*k,IN[i][1]+(p[1]-IN[i][1])*k]);
  fillPoly(c,OU.concat(RV),A(T[0],.92));
  fillPoly(c,mid(.58).concat(RV),A(T[1],.95));
  fillPoly(c,mid(.86).concat(mid(.99).reverse()),A(T[2],.28));
  celStroke(c,OU,2.2,tn,.85);
  const M8=mid(.80),HL=[];
  for(let k=0;k<=14;k++)HL.push(M8[Math.round((.63+k/14*.14)*NN)%NN]);
  celStroke(c,HL,3.0,tn,.9);
  // 이슬 — 물기를 타고 실려 나갔다 되돌아온다. 알마다 늦게 따라 나선다.
  for(let i=0;i<16;i++){
    const a=i/16*TAU+hash(i*3.1)*.30;
    const rd=Math.min(1,Math.max(0,w*1.34-hash(i*7.7)*.46));
    const rr=RR*(.013+.012*hash(i*11.3))*(1-.24*rd),al=Math.max(0,.90-.46*rd);
    const r2=fo(a)*.99+(fw(a)-fo(a)*.99)*rd;
    const x=cx+Math.cos(a)*r2,y=cy+Math.sin(a)*r2;
    c.beginPath();c.ellipse(x,y,rr,rr*.9,0,0,TAU);c.fillStyle=A(T[0],.82*al);c.fill();
    c.beginPath();c.ellipse(x,y,rr*.62,rr*.56,0,0,TAU);c.fillStyle=A(T[1],.92*al);c.fill();
    c.beginPath();c.arc(x-rr*.24,y-rr*.26,Math.max(.5,rr*.24),0,TAU);
    c.fillStyle=A(T[2],al);c.fill();}
}]);

// ⑮ 껍질을 도는 파 — 1안(파문)은 **반지름이 커지는** 동심 고리고, 이쪽은
// 반지름이 그대로인 채 **각도로 달린다.** 때린 자리가 움푹 들어갔다가
// 표면장력이 되밀어 혹 둘을 양쪽으로 내보내고, 정반대에서 마주쳐 잦아든다.
// 열 중 유일하게 **원인(때림)과 결과(달림)가 한 그림에 있는** 안이다.
FVSET.aqua.push(["**때린 자리가 둘레를 돌아 반대편에서 만난다** — 두 갈래로 갈라져 달리다 마주쳐 잦아든다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NN=80, PER=3.6, ox=cx-RR*.075, oy=cy-RR*.085;
  const nn=Math.floor(t/PER), ph=(t%PER)/PER;
  const sa=hash(nn*7.3+1.7)*TAU;                     // 때린 자리는 매번 바뀐다
  const amp=.115*Math.exp(-ph*.95)*Math.min(1,ph/.09);
  const wr=d=>{let x=d;while(x>Math.PI)x-=TAU;while(x<-Math.PI)x+=TAU;return x;};
  const bump=a=>{
    const run=ph*Math.PI;                            // 두 갈래가 벌어진 각
    let s2=0;
    for(let k=-1;k<=1;k+=2){const d=wr(a-(sa+k*run));s2+=Math.exp(-d*d/.032);}
    const d0=wr(a-sa);
    return amp*s2-.175*Math.exp(-ph*13)*Math.exp(-d0*d0/.028);};
  const fo=a=>RR*(.90+bump(a)+.014*Math.sin(a*4-t*1.1));
  const fi=a=>RR*(.74+bump(a)*.40);
  const band=(a,k)=>{const r1=fo(a),r2=fi(a);
    const x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1;
    const x2=ox+Math.cos(a)*r2,y2=oy+Math.sin(a)*r2;
    return [x2+(x1-x2)*k,y2+(y1-y2)*k];};
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx-RR*.22,cy-RR*.26,0,cx,cy,RR*.9);
  g.addColorStop(0,A(T[2],.13));g.addColorStop(.62,A(T[1],.06));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*.9,0,TAU);c.fill();c.restore();
  const OU=[],IN=[];
  for(let i=0;i<=NN;i++){const a=i/NN*TAU;OU.push(band(a,1));IN.push(band(a,0));}
  const RV=IN.slice().reverse();
  const mid=k=>OU.map((p,i)=>[IN[i][0]+(p[0]-IN[i][0])*k,IN[i][1]+(p[1]-IN[i][1])*k]);
  fillPoly(c,OU.concat(RV),A(T[0],.92));
  fillPoly(c,mid(.58).concat(RV),A(T[1],.95));
  fillPoly(c,mid(.86).concat(mid(.99).reverse()),A(T[2],.28));
  celStroke(c,OU,2.2,tn,.85);
  const M8=mid(.80),HL=[];
  for(let k=0;k<=14;k++)HL.push(M8[Math.round((.63+k/14*.14)*NN)%NN]);
  celStroke(c,HL,3.0,tn,.9);
  // 마루의 윤 — 달리는 혹의 등만 짧게 번뜩인다. 어디가 파인지 눈이 잡는다.
  for(let k=-1;k<=1;k+=2){
    const ca=sa+k*ph*Math.PI,CR=[];
    for(let j=0;j<=8;j++)CR.push(band(ca+(j/8-.5)*.58,1.02));
    celStroke(c,CR,2.4,tn,Math.max(0,.85*(amp/.115)));}
  // 때린 자국 — 파의 원인. 파이는 순간에만, 짧게.
  if(ph<.11){const q=1-ph/.11,DT=[];
    for(let j=0;j<=8;j++)DT.push(band(sa+(j/8-.5)*.46,.34));
    celStroke(c,DT,2.2,tn,Math.max(0,q*.70));}
  // 이슬 — 파를 타고 오르내린다. 마루 위에서 조금 커진다.
  for(let i=0;i<30;i++){
    const a=i/30*TAU+hash(i*3.1)*.12;
    const lift=Math.max(0,bump(a))/.115;
    const rr=RR*(.012+.012*hash(i*7.7))*(1+.34*lift),al=Math.max(0,.58+.34*lift);
    const p=band(a,.90);
    c.beginPath();c.ellipse(p[0],p[1],rr,rr*.9,0,0,TAU);c.fillStyle=A(T[0],.82*al);c.fill();
    c.beginPath();c.ellipse(p[0],p[1],rr*.62,rr*.56,0,0,TAU);c.fillStyle=A(T[1],.92*al);c.fill();
    c.beginPath();c.arc(p[0]-rr*.24,p[1]-rr*.26,Math.max(.5,rr*.24),0,TAU);
    c.fillStyle=A(T[2],al);c.fill();}
}]);

// ── 불씨 — **융화 발현** 후보 다섯 (2~6안) ─────────────────────────
// ── 불씨 火種 · 융화 **발현** 후보 ──────────────────────────────────────
// 확정된 기본(「꺼질 듯 말 듯 떠다닌다」)은 점 열한 개가 성기게 명멸하는 것뿐이다.
// 발현은 그 위로 **확실히** 올라가야 한다. 다만 올릴 것은 **밝기가 아니라 사건**이다
// — 밝은 주황을 키우는 순간 그건 염(炎)이 된다(팔레트가 8° 차이뿐이다).
// 그래서 다섯 안이 전부 「어두운 덩어리 + 타는 점」을 지키고, 화려함은
// 번짐 · 튐 · 옮겨붙음 · 재 · 되살아남 이라는 **사건의 규모**로만 낸다.

FVSET.fstorm.push(["**타들어간다** — 검게 탄 자리가 갈라지며 뻗고, 그 끝만 밝게 탄다",
function(c,cx,cy,RR,t,tn){
  // 종이가 탈 때의 그 가장자리다. 불은 **면**이 아니라 **선**으로 번지고,
  // 지나온 자리는 검은 재로 남는다 — 어두운 그림이 화면을 채우는데도
  // 밝은 것은 끝점뿐이라 염과 절대 안 겹친다.
  // ⚠️ 탄 자국을 celStroke 로 그으면 가운데 흰 심이 서서 **그어 놓은 철사**가
  // 된다(불씨에서 이미 한 번 반려된 실패다). 재는 T[0] 단색으로만 긋는다.
  const T=TONE[tn], NF=6, PER=2.55;
  const dot=(x,y,sz,live,sd)=>{
    if(live<.04)return;
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,sz*3.2);
    g.addColorStop(0,A(T[2],Math.max(0,live*.58)));
    g.addColorStop(.42,A(T[1],Math.max(0,live*.22)));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,sz*3.2,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(x,y,sz*1.5,5,sd,1.35),A(T[0],Math.max(0,live*.9)));
    fillPoly(c,jagPoly(x,y,sz*.92,5,sd+1,1.25),A(T[1],Math.max(0,live)));
    fillPoly(c,jagPoly(x,y,sz*.44,5,sd+2,1.2),A(T[2],Math.max(0,live)));};
  // 갈래 하나. [q0]=부모에서 갈라져 나온 지점, [div]=갈라지는 각.
  const branch=(a0,wob,sd,q0,div)=>q=>{
    const qq=q0+q;
    // 직선이 아니다 — 바람에 실린 것이라 자라면서 휜다.
    const a=a0+wob*(qq*.95+.30*Math.sin(qq*4.4+t*1.15+sd))+div*q;
    const rr=RR*.44+qq*RR*.78;
    return[cx+Math.cos(a)*rr+Math.sin(t*1.6+sd)*RR*.05,
           cy+Math.sin(a)*rr*.90+Math.cos(t*1.3+sd)*RR*.045];};
  // 갈래 하나를 그린다. 뒤쪽은 식은 재(어둡다), 끝만 벌겋고, 그 끝에 점이 탄다.
  const burn=(path,len,fade,flick,sd)=>{
    const SEG=13;
    for(let k=0;k<SEG;k++){
      const near=(k+1)/SEG;                       // 1 = 타고 있는 끝
      const p0=path(k/SEG*len),p1=path(near*len);
      c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);
      c.strokeStyle=A(T[0],Math.max(0,(1-fade)*(.34+.62*Math.pow(near,2.0))));
      c.lineWidth=RR*.072*(1-near*.42);c.lineCap="round";c.stroke();
      if(near>.66){
        c.beginPath();c.moveTo(p0[0],p0[1]);c.lineTo(p1[0],p1[1]);
        c.strokeStyle=A(T[1],Math.max(0,(1-fade)*(near-.66)/.34*.62*flick));
        c.lineWidth=RR*.024;c.stroke();}}
    const tp=path(len);
    dot(tp[0],tp[1],1.9+1.5*flick,Math.max(0,(1-fade)*(.42+.58*flick)),sd);
    // 끝이 확 달아오르는 순간에만 작은 관이 선다 — 「지금 타고 있다」의 증거
    if(flick>.72&&fade<.5)for(let k=0;k<4;k++)
      celSpike(c,tp[0],tp[1],k/4*TAU+t*2.6+sd,RR*(.05+.035*flick),RR*.014,tn,
        Math.max(0,(flick-.72)/.28*.75*(1-fade)));};
  for(let i=0;i<NF;i++){
    const sd=i*5.71;
    const u=(t/PER+hash(sd))%1;
    const wob=hash(sd*3.1)>.5?1:-1;
    const a0=hash(sd*2.3)*TAU+t*.05;
    const fade=u>.66?(u-.66)/.34:0;
    const grow=Math.min(1,u/.60);
    // 명멸 — 불씨의 정체다. 끝이 꺼질 듯 말 듯 하면서 기어간다.
    const flick=Math.pow(Math.max(0,Math.sin(t*(4.1+2.4*hash(sd*7.7))+sd)),.8);
    const main=branch(a0,wob,sd,0,0);
    burn(main,grow,fade,flick,sd);
    // 갈라진다 — **번짐은 한 줄이 아니라 갈래다.** 하나만 기면 그냥 유성이다.
    if(grow>.48)for(let f=0;f<2;f++){
      const gf=Math.min(.52,(grow-.48)*1.5);
      if(gf<.04)continue;
      const fk=branch(a0,wob,sd,.46,(f?-1:1)*(.5+.4*hash(sd*9.1+f)));
      burn(fk,gf,fade,Math.pow(Math.max(0,Math.sin(t*(5.2+2.1*hash(sd*4.3+f))+f*2.1+sd)),.8),
        sd+f*3.3);}
    // 떨어져 나온 재 — 아직 조금 탄다
    for(let k=0;k<2;k++){
      const ph=(t*.5+hash(sd*11.3+k))%1;
      const q=main(Math.max(0,grow-.25-ph*.4));
      const live=Math.max(0,(1-ph)*(1-fade)*.5*(.4+.6*Math.abs(Math.sin(t*6.7+k+sd))));
      dot(q[0]+(hash(sd*13.1+k)-.5)*RR*.16*ph*3,
          q[1]+(hash(sd*17.3+k)-.5)*RR*.16*ph*3,1.3,live,sd+k*2.7);}}}]);

FVSET.fstorm.push(["**튄다** — 하나가 부풀다 터지고, 터진 자리에서 예닐곱이 난다",
function(c,cx,cy,RR,t,tn){
  // 화려함을 **개수의 폭발**로 낸다. 밝기를 올리지 않고도 칸이 꽉 차는 유일한 길이다.
  // 씨 다섯이 저마다 다른 박자로 부풀다 터지므로, 언제 봐도 둘셋이 터져 있다.
  const T=TONE[tn], NP=7, PER=2.35, BT=.40;
  const dot=(x,y,sz,live,sd)=>{
    if(live<.04)return;
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,sz*3.2);
    g.addColorStop(0,A(T[2],Math.max(0,live*.58)));
    g.addColorStop(.42,A(T[1],Math.max(0,live*.22)));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,sz*3.2,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(x,y,sz*1.5,5,sd,1.35),A(T[0],Math.max(0,live*.9)));
    fillPoly(c,jagPoly(x,y,sz*.92,5,sd+1,1.25),A(T[1],Math.max(0,live)));
    fillPoly(c,jagPoly(x,y,sz*.44,5,sd+2,1.2),A(T[2],Math.max(0,live)));};
  for(let i=0;i<NP;i++){
    const sd=i*6.37;
    const u=(t/PER+hash(sd))%1;
    const dir=hash(sd*3.9)>.5?1:-1;
    const a=hash(sd*2.1)*TAU+t*.12*dir;
    // ⚠️ 씨가 멀리 있으면 파편이 칸 밖으로 나간다. 씨는 안쪽, 파편이 바깥으로.
    const rr=RR*(.34+.28*hash(sd*3.3));
    const x=cx+Math.cos(a)*rr+Math.sin(t*1.7+i*1.9)*RR*.08;
    const y=cy+Math.sin(a)*rr*.90+Math.cos(t*1.4+i*2.3)*RR*.065;
    if(u<BT){
      // 부푼다 — 터지기 전까지는 **명멸이 점점 빨라진다.** 조용히 커지면
      // 그냥 덩어리가 자라는 것이라 불씨가 아니다.
      const sw=u/BT;
      const fl=Math.abs(Math.sin(t*(3.2+7.0*sw*sw)+sd));
      dot(x,y,1.8+2.2*sw,Math.max(0,(.22+.78*sw*sw)*(.42+.58*fl)),sd);
      // 임계 직전 — 껍질이 못 견디고 실금이 간다
      if(sw>.78)for(let k=0;k<5;k++){
        const ak=k/5*TAU+sd;
        celSpike(c,x,y,ak,RR*(.035+.05*(sw-.78)/.22)*(.6+.8*hash(sd+k)),RR*.012,tn,
          Math.max(0,(sw-.78)/.22*.7*fl));}
    }else{
      const q=(u-BT)/(1-BT), eq=ease(q);
      // 터지는 순간 — **관이 선다.** 이 한 순간이 없으면 「터졌다」가 아니라
      // 「어느새 흩어져 있다」로 읽혀 사건이 사라진다.
      if(q<.20){const f2=1-q/.20;
        for(let k=0;k<9;k++)
          celSpike(c,x,y,k/9*TAU+sd,RR*(.10+.20*eq*3)*(.5+.9*hash(sd*3.7+k)),
            RR*.020*f2,tn,Math.max(0,f2*.85));}
      const n=8+((hash(sd*7.1)*4)|0);
      for(let k=0;k<n;k++){
        const ak=hash(sd*9.1+k*1.7)*TAU;
        const sp=RR*(.30+.44*hash(sd*11.3+k*2.3));   // 1.5RR 를 안 넘게 잡은 값
        // 휘어 난다 — 바람에 실린 파편은 직선으로 못 간다
        const curl=(hash(sd*5.3+k*3.1)-.5)*1.7*eq;
        const d=sp*eq;
        const xx=x+Math.cos(ak+curl)*d, yy=y+Math.sin(ak+curl)*d*.92;
        // 오래 산다 — 금방 꺼지면 개수가 안 쌓여 「예닐곱이 났다」가 안 보인다
        const live=Math.max(0,Math.pow(1-q,1.15))*(.42+.58*Math.abs(Math.sin(t*(6.3+5.2*hash(sd+k))+k*2.1)));
        dot(xx,yy,1.4+1.7*hash(sd*13.7+k),live,sd+k*1.3);
        if(q<.30){                        // 갓 튄 것은 꼬리가 있다
          const d0=sp*ease(Math.max(0,q-.10));
          c.beginPath();
          c.moveTo(x+Math.cos(ak+curl*.6)*d0,y+Math.sin(ak+curl*.6)*d0*.92);
          c.lineTo(xx,yy);
          c.strokeStyle=A(T[1],Math.max(0,(1-q/.30)*.42*live));
          c.lineWidth=RR*.016;c.lineCap="round";c.stroke();}}
      // 터진 자리 — 불이 아니라 **연기와 재**가 남는다. 어두운 것이 남아야 불씨다.
      if(q<.46)fillPoly(c,jagPoly(x,y,RR*(.06+.16*eq),7,sd+4.1,1.2),
        A(T[0],Math.max(0,(1-q/.46)*.55)));}}}]);

FVSET.fstorm.push(["**한 점이 여럿에게 동시에 붙는다** — 불티 다리가 넷씩 놓이고, 받은 것이 또 놓는다",
function(c,cx,cy,RR,t,tn){
  // 옮겨붙음을 **동시다발**로 올린다. 하나씩 도는 릴레이는 조용해서 기본 쪽이었다
  // — 발현은 한 박자에 다리가 넷 놓이고, 다음 박자에 그 넷 중 하나가 또 놓는다.
  // ⚠️ 다리를 이어진 선으로 그으면 **그물 텍스처**가 되어 칸을 가로지른다.
  // 다리는 **날아가는 불티 몇 알**이다 — 지나가고 나면 아무것도 안 남는다.
  const T=TONE[tn], N=10, P=1.35, NB=4;
  const gen=Math.floor(t/P), u=saw(t,P);
  const dot=(x,y,sz,live,sd)=>{
    if(live<.04)return;
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,sz*3.2);
    g.addColorStop(0,A(T[2],Math.max(0,live*.58)));
    g.addColorStop(.42,A(T[1],Math.max(0,live*.22)));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,sz*3.2,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(x,y,sz*1.5,5,sd,1.35),A(T[0],Math.max(0,live*.9)));
    fillPoly(c,jagPoly(x,y,sz*.92,5,sd+1,1.25),A(T[1],Math.max(0,live)));
    fillPoly(c,jagPoly(x,y,sz*.44,5,sd+2,1.2),A(T[2],Math.max(0,live)));};
  // 자리는 흩어져 있다 — 도형이 아니라 **불씨가 앉은 자리**다
  const pos=i=>{const sd=i*6.7;
    const a=hash(sd)*TAU+Math.sin(t*.50+i*1.9)*.20+t*.045;
    const rr=RR*(.48+.60*hash(sd*2.3))*(1+.09*Math.sin(t*1.05+i*2.1));
    return[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.90];};
  // 세대 사슬 — **이번에 불을 놓는 자리는 지난번에 받은 자리 중 하나다.**
  // 매번 새로 뽑으면 「여기저기 켜진다」일 뿐이라 옮아가는 것이 안 보인다.
  const CH=[];
  let src0=(hash((gen-3)*3.71)*N)|0;
  for(let g=gen-3;g<=gen;g++){
    const tg=[];
    for(let k=0;k<NB;k++)tg.push((src0+2+k*2+((hash(g*7.13+k*2.9)*2)|0))%N);
    CH.push([src0,tg]);
    src0=tg[(hash(g*11.71)*NB)|0];}
  // 열은 세대를 넘어 남는다 — **꺼져 가는 것이 있어야 옮겨붙음이 사건이 된다**
  const heat=i=>{let h=.15;
    for(let g=0;g<4;g++){
      const pk=CH[3-g], w=Math.max(0,1-(g+u)*.33);
      if(i===pk[0])h=Math.max(h,w);
      if(pk[1].indexOf(i)>=0){
        const arr=g>0?1:(u>.66?(u-.66)/.34:0);
        h=Math.max(h,w*.95*arr);}}
    return h;};
  const cur=CH[3], src=pos(cur[0]);
  for(let k=0;k<NB;k++){
    const tgt=pos(cur[1][k]);
    // 휘어 간다. 다리마다 휘는 쪽이 달라야 넷이 한 부채로 안 뭉친다.
    const bw=(hash(gen*5.3+k*3.7)-.5)*.85+(k-(NB-1)/2)*.30;
    const mx=(src[0]+tgt[0])*.5+(tgt[1]-src[1])*bw;
    const my=(src[1]+tgt[1])*.5-(tgt[0]-src[0])*bw;
    const bez=q=>[(1-q)*(1-q)*src[0]+2*(1-q)*q*mx+q*q*tgt[0],
                  (1-q)*(1-q)*src[1]+2*(1-q)*q*my+q*q*tgt[1]];
    const head=Math.min(1,u/(.66+k*.015));
    // ⚠️ 고르게 벌린 구슬은 **그어 놓은 점선**이다. 간격도 크기도 흩뜨리고
    // 옆으로도 밀어야 「날아가는 불티」로 읽힌다.
    for(let j=0;j<7;j++){
      const q=head-j*.058*(.55+.90*hash(k*7.3+j*2.1));
      if(q<0)continue;
      const p=bez(q),sd=k*3.1+j*1.7;
      const jx=(hash(sd*5.3)-.5)*RR*.07,jy=(hash(sd*9.7)-.5)*RR*.07;
      const live=Math.max(0,(1-j*.11)*(.42+.58*Math.abs(Math.sin(t*9.1+j*1.7+k))));
      dot(p[0]+jx,p[1]+jy,1.15+1.0*hash(sd*3.7)-j*.06,
        live*(head<1?1:Math.max(0,1-(u-.66)/.34)),sd);}}
  for(let i=0;i<N;i++){
    const p=pos(i),h=heat(i);
    const fl=.35+.65*Math.abs(Math.sin(t*(2.9+2.6*hash(i*4.7))+i*2.3));
    const live=Math.max(0,h*fl);
    dot(p[0],p[1],2.1+3.0*h,live,i*3.1);
    // 막 불을 받은 것은 **확 인다** — 받은 순간이 보여야 옮아간 것이다
    if(h>.72)for(let k=0;k<6;k++)
      celSpike(c,p[0],p[1],k/6*TAU+t*3.4+i,RR*(.055+.065*fl),RR*.016,tn,
        Math.max(0,(h-.72)/.28*.85*fl));}}]);

FVSET.fstorm.push(["**숯이 돈다** — 검은 조각이 몸을 두르고, 타는 것은 그 가장자리뿐이다",
function(c,cx,cy,RR,t,tn){
  // 둘레를 **꽉** 채우되 채우는 것이 전부 **검다.** 염은 밝은 갈래 여덟이
  // 몸을 두르고, 이쪽은 어두운 조각 열둘이 두른다 — 나란히 놓으면 정반대다.
  // 조각은 가장자리부터 먹혀 들어가 점점 작아지고, 다 타면 부스러기만 남는다.
  const T=TONE[tn], NC=12;
  const dot=(x,y,sz,live,sd)=>{
    if(live<.04)return;
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,sz*3.0);
    g.addColorStop(0,A(T[2],Math.max(0,live*.55)));
    g.addColorStop(.42,A(T[1],Math.max(0,live*.20)));
    g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,sz*3.0,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(x,y,sz*1.4,5,sd,1.3),A(T[0],Math.max(0,live*.9)));
    fillPoly(c,jagPoly(x,y,sz*.86,5,sd+1,1.25),A(T[1],Math.max(0,live)));
    fillPoly(c,jagPoly(x,y,sz*.40,5,sd+2,1.2),A(T[2],Math.max(0,live)));};
  for(let i=0;i<NC;i++){
    const sd=i*4.93;
    const per=3.2+2.2*hash(sd*2.7);
    const u=(t/per+hash(sd*5.1))%1;               // 조각 하나가 다 타는 데 걸리는 시간
    // 조각은 **통째로 한 속도로 돈다.** 제각각 돌면 고리가 끊어진다.
    const a=i/NC*TAU+t*.30+(hash(sd*3.3)-.5)*.16;
    const rr=RR*(.82+.20*hash(sd*7.9))*(1+.05*Math.sin(t*1.2+i*1.7));
    const x=cx+Math.cos(a)*rr, y=cy+Math.sin(a)*rr*.90;
    const left=Math.max(0,1-u);                   // 남은 크기
    const sz=RR*(.17+.07*hash(sd*11.3))*Math.pow(left,.55);
    if(sz<RR*.012)continue;
    // 조각 — 각지되 별은 아니다(spikeMul 낮게). 코어와 안 헷갈려야 한다.
    const P=jagPoly(x,y,sz,6,sd,1.10);
    fillPoly(c,P,A(T[0],.96));
    fillPoly(c,jagPoly(x,y,sz*.68,6,sd+1.7,1.06),A(T[0],.72));
    // 타는 가장자리 — 먹혀 들어가는 쪽이 시간에 따라 조각을 **한 바퀴 돈다**
    const front=a+Math.PI+u*TAU*1.3;
    for(let k=0;k<7;k++){
      const q=front+(k-3)/3*.85;
      const fl=Math.max(0,Math.sin(t*(5.4+3.1*hash(sd+k))+k*1.9+sd));
      const live=Math.max(0,(1-Math.abs(k-3)/4.2)*(.30+.70*fl*fl));
      dot(x+Math.cos(q)*sz*1.02,y+Math.sin(q)*sz*1.02,
        sz*.20+RR*.010,live,sd+k*2.3);}
    // 부스러기 — 타면서 떨어져 나가 바람에 실린다. 아래로만 지면 지면이 생긴다.
    for(let k=0;k<2;k++){
      const ph=(t*.55+hash(sd*13.7+k*3.1))%1;
      const ca=front+(hash(sd*17.3+k)-.5)*1.4;
      const d=sz*1.1+ph*RR*.20;                    // 1.5RR 를 안 넘게 잡은 값
      const live=Math.max(0,(1-ph)*u*.75*(.35+.65*Math.abs(Math.sin(t*7.9+k*2.3+sd))));
      dot(x+Math.cos(ca)*d+Math.sin(t*2.1+k)*RR*.04,
          y+Math.sin(ca)*d*.92,1.15,live,sd+k*5.1);}}}]);

FVSET.fstorm.push(["**되살아난다** — 바람이 앞뒤로 훑고, 훑고 간 자리에서 꺼진 것이 다시 붙는다",
function(c,cx,cy,RR,t,tn){
  // 「꺼질 듯 말 듯」의 **원인**을 발현에서 드러낸다 — 훑고 지나가는 바람이다.
  //
  // ⚠️ 처음엔 화면 안에서 **시계 방향**으로 돌았다. 평면 궤도라 「접시가 도는
  // 것」으로 보였다(2026-08-10 반려). 회전축을 **세로로 세우면** 왼쪽 → 앞 →
  // 오른쪽 → 뒤로 돌아 갇힌 것이 된다. 앞을 지날 때는 몸 위로 와야 하므로
  // 깊이(z)로 앞뒤를 가른다 — y 로 가르면 위쪽에 있으면서 앞인 것을 놓친다.
  const T=TONE[tn], NS=46, SW=1.05;
  const dot=(cc,x,y,sz,live,sd,dz)=>{
    if(live<.04)return;
    cc.save();cc.globalCompositeOperation="lighter";
    const g=cc.createRadialGradient(x,y,0,x,y,sz*3.2);
    g.addColorStop(0,A(T[2],Math.max(0,live*.58*dz)));
    g.addColorStop(.42,A(T[1],Math.max(0,live*.22*dz)));
    g.addColorStop(1,A(T[1],0));
    cc.fillStyle=g;cc.beginPath();cc.arc(x,y,sz*3.2,0,TAU);cc.fill();cc.restore();
    fillPoly(cc,jagPoly(x,y,sz*1.5,5,sd,1.35),A(T[0],Math.max(0,live*.9)));
    fillPoly(cc,jagPoly(x,y,sz*.92,5,sd+1,1.25),A(T[1],Math.max(0,live)));
    fillPoly(cc,jagPoly(x,y,sz*.44,5,sd+2,1.2),A(T[2],Math.max(0,live*dz)));};
  const spin=t*SW;
  const back=[],fore=[];
  for(let i=0;i<NS;i++){
    const sd=i*3.77;
    // 구 위의 자리 — 높이를 먼저 고르고 그 높이의 둘레에 앉힌다.
    const lat=(hash(sd)*2-1)*.92;
    const rad=RR*(.52+.52*hash(sd*2.3))*Math.sqrt(Math.max(0,1-lat*lat));
    const az=hash(sd*3.1)*TAU+spin;            // **세로축**을 도는 방위
    const x=cx+Math.cos(az)*rad;
    const y=cy+lat*RR*.86+Math.sin(t*1.5+i*1.3)*RR*.035;
    const z=Math.sin(az);                      // +앞 −뒤
    const dz=.55+.45*(z*.5+.5);
    // 네 갈래가 90° 씩 벌어져 같이 훑는다 — 앞뒤로 도니 훑는 것도 앞뒤로 온다.
    let d=1e9;
    for(let sg=0;sg<4;sg++){
      let q=(az-spin*2-sg*TAU/4)%TAU;while(q<0)q+=TAU;
      d=Math.min(d,q);}
    const rev=Math.exp(-d*0.92);
    const emb=.07*Math.max(0,Math.sin(t*(2.2+2.0*hash(sd*4.1))+sd));
    const fl=.34+.66*Math.abs(Math.sin(t*(3.4+3.0*hash(sd*6.7))+sd*1.7));
    const live=Math.max(0,(emb+rev*.95)*fl);
    if(live<.04)continue;
    const sz=(1.6+4.1*rev)*(.70+.42*(z*.5+.5));
    const draw=(cc)=>{
      // 꼬리 — 지나온 방위. 앞뒤로 도는 것이 이걸로 보인다.
      if(rev>.22){const tp=[];
        for(let k=0;k<5;k++){const a2=az-k*.075;
          tp.push([cx+Math.cos(a2)*rad, y-Math.sin(t*1.5+i*1.3)*RR*.010*k]);}
        celStroke(cc,tp,2.3,tn,Math.max(0,(rev-.22)/.78*.46*fl*dz));}
      dot(cc,x,y,sz,live,sd,dz);
      if(rev>.44)for(let k=0;k<7;k++)
        celSpike(cc,x,y,k/7*TAU+t*3.1+sd,RR*(.062+.095*fl),RR*.020,tn,
          Math.max(0,(rev-.44)/.56*.95*fl*dz));
      // 되살아난 것은 **앞으로 불티를 흘린다** — 그래서 다음 자리가 또 붙는다
      if(rev>.38)for(let k=0;k<3;k++){
        const ph=(t*1.1+hash(sd*8.3+k))%1;
        const a3=az+.12+ph*.40;
        dot(cc,cx+Math.cos(a3)*rad*(1+(hash(sd*5.9+k)-.5)*.14),y,1.15,
          Math.max(0,(rev-.38)/.62*(1-ph)*.85*fl),sd+k*4.1,dz);}};
    (z>0?fore:back).push(draw);}
  // 앞머리 — 훑는 자리. 선은 안 긋고 불티를 몰아 두는 것으로 족하다.
  for(let sg=0;sg<4;sg++)for(let k=0;k<12;k++){
    const sd=sg*9.1+k*2.7;
    const az=spin*2+sg*TAU/4+k*.048+(hash(sd+((t*1.3)|0))-.5)*.12;
    const lat=(hash(sd*5.3)*2-1)*.80;
    const rad=RR*(.52+.52*hash(sd*3.1))*Math.sqrt(Math.max(0,1-lat*lat));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR*.86, z=Math.sin(az);
    const dz=.55+.45*(z*.5+.5);
    const live=Math.max(0,(.40+.60*Math.abs(Math.sin(t*8.3+k*1.9+sg)))*(1-k*.055));
    const draw=(cc)=>dot(cc,x,y,1.55,live*.95,sd,dz);
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

// ── 자 — 융화 기본 후보 다섯(7~11안) ──────────────────────────────
// ── 자(磁) · 6안의 결로 다섯 — **융화 기본**용이라 전부 「더 작게」 ──────────
//
// 6안(살갗이 뿔로 선다)이 좋았던 이유는 하나다: 1·2안은 장의 방향, 3안은
// 끌려온 물건, 4안은 못 들어오는 장 — 전부 **몸 바깥** 이야기인데 6안만
// **몸의 표면이 힘에 끌려 변형된다.** 세기가 곧 형태라 그림이 장을 읽어준다.
//
// 그 결은 지키되 다섯이 **무엇이 변형되는가**로 갈린다:
//   ① 몸의 길이   ② 살의 두께   ③ 살갗의 결(방향)   ④ 껍질의 겹
//   ⑤ 집힌 자리(오목)
//
// ⚠️ **작아야 한다.** 이 자리는 융화 **기본**이고, 융화 기본은 속성 일반보다
// **아주 약간만** 화려해야 한다 — 화려하면 발현(자는 5안 확정)이 의미를 잃는다.
// 다섯 다 ⓐ 뿔이 안 돋고 ⓑ 몸 밖으로 나가는 게 없고 ⓒ 껍질 하나로 끝난다.
// 5안은 자기력선 여섯 줄 + 조각 열여섯 + 두 극의 광휘였다. 이쪽은 **선 하나**다.
//
// ⚠️ 다만 **안 보이면 조용한 게 아니라 없는 것**이다(1차 렌더 판정: 변형을
// 반지름의 3~8% 로 잡았더니 다섯 다 그냥 「가는 원」으로 보여 서로 구별조차
// 안 됐다). 조용함은 **개수와 알파**로 벌고, 변형 자체는 한눈에 보일 만큼
// 크게 준다 — 그래야 「세기가 곧 형태」가 성립한다.
//
// ⚠️ 방사로 고르게 뻗은 것은 **성게·태양 문양**이 된다(6안이 실제로 빠졌던
// 함정). 다섯 다 극과 적도가 서로 다르게 생겼고, 적도는 늘 비어 있다.
// ⚠️ 축은 통째로 한 속도(t*.19)로 돈다 — 위아래가 고정되면 지면·천장이 생긴다.

// ① 길이 — **몸 자체가 늘어난다.** 아무것도 안 돋고 실루엣만 바뀐다.
// 자기변형(줄 효과): 자성체는 장을 걸면 축 방향으로 길어지고 그만큼 허리가
// 준다. 「끌려 나가는 것」이 몸 밖이 아니라 **몸 자신**이라 제일 조용하다.
// 다섯 중 유일하게 **그린 것이 곡선 하나**뿐이다.
FVSET.magnet.push(["몸이 축으로 늘어난다 — 두 극이 당긴 만큼 허리가 잘록해진다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const ax=t*.19;                                   // 자기축 — 전체가 한 속도
  const fld=Math.pow(.5+.5*Math.sin(t*1.05),.9);    // 장의 세기 — 숨쉰다
  const SK=RR*.80, el=.22*fld;
  // 극 쪽은 늘고 적도는 준다(부피가 대충 보존된다).
  //   |cos|^14 → **끝만** 살짝 뾰족하다. 안 뾰족하면 그냥 타원이다.
  //   (1-c2)^4 → 허리만 **좁게** 파인다. 넓게 깎으면 타원이고, 좁게 깎아야
  //   잘록이다 — 지수를 3 으로 뒀더니 부드러운 콩팥 모양이 나왔다(2차 렌더).
  const rad=q=>{const co=Math.cos(q-ax),c2=co*co;
    return SK*(1+el*c2-el*.55*(1-c2)+el*.50*Math.pow(Math.abs(co),14)
                -.175*fld*Math.pow(1-c2,4));};
  const P=[];
  for(let i=0;i<=56;i++){const q=i/56*TAU,rr=rad(q);
    P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
  c.save();c.globalCompositeOperation="lighter";
  fillPoly(c,P,A(T[0],.22));c.restore();             // 6안(.42)의 절반 — 조용하게
  celStroke(c,P,RR*.058,tn,.52);
  // 팽팽한 자리 — 극 끝 살갗만 밝다. **점을 안 찍는다**(5안의 극이 되어 버린다).
  for(let s=0;s<2;s++){
    const b=ax+s*Math.PI,Q=[];
    for(let i=-4;i<=4;i++){const q=b+i*.085,rr=rad(q);
      Q.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
    celStroke(c,Q,RR*.058,tn,Math.max(0,.06+.40*fld));
  }
}]);

// ② 두께 — **모양은 그대로인데 살이 옮겨간다.** 껍질의 굵기가 적도에서 빠져
// 두 극에 몰린다. 뭔가가 끌려가는데 그게 **몸을 이루던 살 자신**이라,
// 바깥에서 온 물건(3안)도 길을 타는 조각(5안)도 아니다.
// 장이 죽으면 굵기가 고르고, 세지면 두 곳에 쏠린다 — 세기가 곧 분포다.
FVSET.magnet.push(["살의 두께가 두 극으로 쏠린다 — 적도는 실처럼 얇아진다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const ax=t*.19;
  const fld=Math.pow(.5+.5*Math.sin(t*.95),.9);
  // 테두리를 한 단 안으로(2026-08-09 요청). 껍질이 크면 「몸을 감싼 고리」로
  // 보여 **살의 두께**라는 정체가 안 읽힌다 — 살은 몸에 붙어 있어야 한다.
  const SK=RR*.62, N=64;
  // 쏠림은 **좁아지기도 한다** — 지수가 같이 오르니 세질수록 좁은 데 몰린다.
  // 총량은 대충 보존된다(적도에서 뺀 만큼 극에 준다).
  // ⚠️ 지수를 낮게(≈6) 뒀더니 두꺼운 데가 ±45° 로 퍼져 **초승달 하이라이트**로
  // 보였다(2차 렌더). 8 이상이라야 「두 점에 몰렸다」가 된다.
  const sh=1.5+8.0*fld;
  const wf=q=>{const pol=Math.abs(Math.cos(q-ax));
    return RR*(.050*(1-.74*fld)+.110*fld*Math.pow(pol,sh))
          +RR*.004*Math.sin(q*5+t*1.6);};
  // 모양은 거의 안 건드린다 — 두꺼워진 자리가 아주 조금 부풀 뿐이다.
  const rad=q=>SK*(1+.022*fld*Math.pow(Math.abs(Math.cos(q-ax)),3));
  // 굵기가 변하는 닫힌 띠. **획을 토막내면 이음매마다 알파가 겹쳐 구슬이 된다** —
  // 바깥선·안선을 한 다각형으로 묶어 통째로 칠한다(구멍도 이음매도 없다).
  const band=(kf,col)=>{
    const P=[];
    for(let i=0;i<=N;i++){const q=i/N*TAU,rr=rad(q),hw=wf(q)*kf*.5;
      P.push([cx+Math.cos(q)*(rr+hw),cy+Math.sin(q)*(rr+hw)]);}
    for(let i=N;i>=0;i--){const q=i/N*TAU,rr=rad(q),hw=wf(q)*kf*.5;
      P.push([cx+Math.cos(q)*(rr-hw),cy+Math.sin(q)*(rr-hw)]);}
    fillPoly(c,P,col);};
  c.save();c.globalCompositeOperation="lighter";
  band(2.6,A(T[0],.07));c.restore();                 // 살이 몰린 자리만 은은히 번진다
  // 테두리를 한 단 더 연하게(2026-08-09 요청). 융화 **기본**이라 있는 듯 없는 듯
  // 해야 하고, 진하면 「몸을 두른 테」로 읽혀 살의 두께라는 정체가 죽는다.
  band(1,   A(T[0],.26));
  band(.60, A(T[1],.29));
  band(.24, A(T[2],.30));
}]);

// ③ 결 — **살갗이 방향을 갖는다.** 잔결이 전부 가까운 극 쪽으로 눕는다.
// 끌어당김을 「움직임」이 아니라 **정렬**로 보여준다: 아무것도 오가지 않는데
// 몸 전체가 두 점을 가리킨다. 적도에는 결이 없다 — **가르마**가 남는다.
//
// ⚠️ 결은 **눕는다**(접선). 세우면 그 순간 6안의 뿔이고, 고르게 두르면 성게다.
// 실루엣은 끝까지 매끈한 원이라야 하고, 적도 ±30° 는 아예 비어야 한다.
FVSET.magnet.push(["살갗의 결이 두 극 쪽으로 눕는다 — 적도에 가르마가 남는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const ax=t*.19;
  const fld=Math.pow(.5+.5*Math.sin(t*1.10),.85);
  const SK=RR*.80, NH=15, LAT=.92;                   // LAT 밖(적도 ±37°)은 맨살
  const rad=q=>SK*(1+.016*Math.sin(q*7+t*1.4));
  const P=[];
  for(let i=0;i<=48;i++){const q=i/48*TAU,rr=rad(q);
    P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
  c.save();c.globalCompositeOperation="lighter";
  fillPoly(c,P,A(T[0],.20));c.restore();
  // 껍질은 **일부러 옅다** — 주인공은 그 위에 누운 결이다. 껍질을 진하게 두면
  // 결이 선에 묻혀 「털실 감은 고리」가 된다(3차 렌더).
  celStroke(c,P,RR*.040,tn,.26);
  for(let i=0;i<NH;i++){
    const q=(i+.5)/NH*TAU+(hash(i*3.7)-.5)*.07;
    const co=Math.cos(q-ax);
    const b=ax+(co>=0?0:Math.PI);                    // 가까운 극
    let d=(b-q)%TAU; if(d>Math.PI)d-=TAU; if(d<-Math.PI)d+=TAU;
    const sgn=d>=0?1:-1, lat=Math.abs(d);            // 0=극 / PI/2=적도
    if(lat>LAT)continue;                             // 가르마
    // ⚠️ 처음엔 곧은 창(celSpike)으로 뒀다가 **가시 박힌 철조망**이 됐다(2차
    // 렌더). 결은 곧은 게 아니라 **살갗을 훑는 곡선**이다 — 껍질을 따라 휘어야
    // 「눕는다」가 되고, 그래야 실루엣이 안 깨진다.
    let arc=(.38+.64*fld)*(1-Math.pow(lat/LAT,3));   // 한 가닥이 훑는 각
    arc=Math.min(arc,lat*.80);                       // **극을 안 넘는다**
    if(arc<.06)continue;
    const S2=[];
    for(let k=0;k<=5;k++){const u=k/5, qq=q+sgn*arc*u;
      const rr=rad(qq)*(1.055+.045*Math.sin(Math.PI*u)); // 살갗 바로 위를 훑는다
      S2.push([cx+Math.cos(qq)*rr,cy+Math.sin(qq)*rr]);}
    // 리본은 끝이 뾰족해진다 — 뾰족한 쪽이 극이라 **어디로 눕는지**가 보인다.
    // (닫힌 고리가 아니라 열린 가닥이라 리본을 써도 이음매 구멍이 없다.)
    celRibbon(c,S2,RR*.058,tn,Math.max(0,.24+.46*fld),false);
  }
}]);

// ④ 겹 — **껍질이 갈라지고, 두 점에서만 안 갈라진다.** 살갗이 두 겹으로
// 벌어지는데 두 극만 붙어 있어 눈(렌즈) 모양이 된다. 「당김」을 힘의 그림이
// 아니라 **못 벌어지는 자리**로 보여준다 — 4안(못 들어온다)이 장의 바깥
// 이야기라면 이쪽은 껍질 자신이 무엇에 붙들려 있는가다.
FVSET.magnet.push(["껍질이 두 겹으로 벌어지고 두 극에서만 물려 있다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const ax=t*.19;
  const fld=Math.pow(.5+.5*Math.sin(t*1.00),.9);
  const SK=RR*.78;
  // 틈 — 극에서 정확히 0, 적도에서 최대. sin⁴ 이라 물린 자리가 **뾰족해진다**
  // (sin² 는 극 근처까지 벌어져 그냥 고리 두 개로 보였다).
  const gap=q=>{const s=Math.sin(q-ax);return RR*.145*fld*s*s*s*s;};
  const loop=sgn=>{const P=[];
    for(let i=0;i<=56;i++){const q=i/56*TAU,rr=SK+sgn*gap(q);
      P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
    return P;};
  const OU=loop(1), IN=loop(-1);
  // 벌어진 틈 — 면으로 옅게. 선 둘만 있으면 「고리 두 개」로 보인다.
  c.save();c.globalCompositeOperation="lighter";
  fillPoly(c,OU.concat(IN.slice().reverse()),A(T[0],.42));c.restore();
  celStroke(c,OU,RR*.048,tn,.48);
  celStroke(c,IN,RR*.048,tn,.34);                    // 안쪽 겹이 옅다 — 깊이가 생긴다
  // 물린 자리 — 여기서만 두 겹이 하나다. 각진 별을 쓰지 않는다(코어 복제 금지).
  for(let s=0;s<2;s++){
    const b=ax+s*Math.PI;
    c.beginPath();c.arc(cx+Math.cos(b)*SK,cy+Math.sin(b)*SK,RR*(.030+.026*fld),0,TAU);
    c.fillStyle=A(T[2],Math.max(0,.32+.36*fld));c.fill();
  }
}]);

// ⑤ 집힘 — **6안의 정반대.** 6안은 액체가 극에서 솟는데, 이쪽은 살갗이 극에서
// **빨려 들어간다**: 천을 두 점에서 집은 것처럼 그 자리가 옴폭 패고 주름이
// 그리로 모이고, 밀려난 살은 바로 옆에 두덩으로 남는다. 「당긴다」를 돋음이
// 아니라 **패임**으로 말하니 6안과 같은 그림이 절대 안 나온다.
//
// ⚠️ 주름은 두 극 ±30° 안에만 있다. 둘레에 고루 두르면 그게 성게다.
FVSET.magnet.push(["살갗이 두 점으로 집힌다 — 그 자리가 패고 주름이 모인다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  const ax=t*.19;
  const fld=Math.pow(.5+.5*Math.sin(t*1.08),.9);
  const SK=RR*.84;
  // 패임은 극에서만(|cos|^10), 두덩은 그 바로 옆에만 — 적도는 안 건드린다.
  // **잔주름(crimp)이 이 안의 핵심이다**: 집힌 자리 둘레의 살갗이 자잘하게
  // 구겨진다. 천을 한 점에서 집으면 언제나 이렇게 된다 — 주름을 따로 그려
  // 얹는 것보다 **껍질선 자체가 구겨지는** 쪽이 훨씬 잘 읽힌다(3차 렌더에서
  // 안쪽 부챗살은 「더듬이」로 보였다). |cos|^8 이라 극 ±35° 밖은 매끈하다.
  const rad=q=>{const co=Math.abs(Math.cos(q-ax));
    const dip=.200*fld*Math.pow(co,10);
    const ridge=.100*fld*Math.pow(co,3)*(1-Math.pow(co,7));
    const crimp=.058*fld*Math.pow(co,8)*Math.sin((q-ax)*16);
    return SK*(1-dip+ridge+crimp)*(1+.012*Math.sin(q*6-t*1.3));};
  // ⚠️ 잔주름은 파형이라 표본이 성기면 **엉뚱한 물결로 접힌다**(에일리어싱).
  // 16 주기를 담으려면 160 점은 있어야 한다.
  const P=[];
  for(let i=0;i<=160;i++){const q=i/160*TAU,rr=rad(q);
    P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
  c.save();c.globalCompositeOperation="lighter";
  fillPoly(c,P,A(T[0],.22));c.restore();
  celStroke(c,P,RR*.052,tn,.46);
  for(let s=0;s<2;s++){
    const b=ax+s*Math.PI, rb=rad(b);
    const px=cx+Math.cos(b)*rb, py=cy+Math.sin(b)*rb;
    // ⚠️ 여기에 안쪽으로 뻗는 부챗살을 넣어 봤다가 **더듬이 달린 벌레**가 됐다
    // (3차 렌더). 주름은 껍질선의 구겨짐만으로 충분하고, 점 하나만 남기는 쪽이
    // 융화 **기본**의 소리에도 맞는다.
    // 집힌 자리 — 주름이 모이는 점. 작고 밝다.
    c.beginPath();c.arc(px,py,RR*(.028+.022*fld),0,TAU);
    c.fillStyle=A(T[2],Math.max(0,.28+.40*fld));c.fill();
  }
}]);

// ── 연 — 융화 발현 후보 다섯(2~6안) ──────────────────────────────
// ── 연 煙 · 융화 **발현** 후보 5 ────────────────────────────────────────
// 확정된 기본(「재가 뜬다」)은 조용하다 — 옅은 기운 다섯 + 작은 재 열다섯.
// 발현은 그 위로 **한눈에** 올라서야 한다. 다만 세게 만드는 축은 밝기가
// 아니라 **양(量)과 압력**이다. 연은 열 중 유일하게 탁한 것이라, 밝히면
// 정체가 먼저 죽는다. 그래서 다섯 안 전부 T[2](흰 앞날)는 발원지 근처에만
// 쓰고, 화려함은 뭉치 개수·부피·속도로 낸다.
//
// 공통 규칙 — 전부 **오른다**(도는 고리는 장 瘴 과 겹친다), 전부 **몸에서**
// 난다(옆에 세운 기둥이 아니다), 전부 **칸 위로 빠진다**(멈춰 깔리면 천장).

// 2안 — 압력. 연기가 「나오는」 게 아니라 **밀려 나온다**.
FVSET.smoke.push(["**몸이 새고 있다** — 둘레 다섯 군데서 뿜은 갈래가 한 기둥으로 합쳐 칸 밖으로 빠진다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn],V=5,K=7;
  // 뭉치 하나 — 3단 계조를 뭉게 실루엣으로 쌓는다. 그러데이션만으로는
  // 연기가 **거의 안 보인다**(2026-08-09 실기 판정). 실루엣이 있어야 셀이다.
  const bil=(x,y,rr,sd,al,lit)=>{
    fillPoly(c,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.92*al)));
    fillPoly(c,puffPoly(x-rr*.10,y-rr*.14,rr*.58,7,sd+1.7),A(T[1],Math.max(0,.66*al)));
    if(lit>0)fillPoly(c,puffPoly(x-rr*.16,y-rr*.24,rr*.22,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.85)));};
  // 합쳐지는 자리 — 갈래보다 **먼저** 깔아야 다섯이 한 기둥으로 읽힌다
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createLinearGradient(cx,cy+RR*.4,cx,cy-RR*1.7);
  g.addColorStop(0,A(T[1],.13));g.addColorStop(.45,A(T[1],.10));g.addColorStop(1,A(T[0],0));
  c.fillStyle=g;c.beginPath();
  c.moveTo(cx-RR*.30,cy+RR*.4);c.lineTo(cx+RR*.30,cy+RR*.4);
  c.lineTo(cx+RR*.78,cy-RR*1.7);c.lineTo(cx-RR*.78,cy-RR*1.7);c.closePath();c.fill();c.restore();
  for(let v=0;v<V;v++){
    const sd=v*5.7,a=Math.PI*(.14+(v/(V-1))*.72);
    const px=cx+Math.cos(a)*RR*.80,py=cy+Math.sin(a)*RR*.70;
    for(let k=0;k<K;k++){
      const u=(t*.36+hash(sd)+k/K)%1;
      const out=ease(Math.min(1,u*4));
      const ox=px+Math.cos(a)*RR*.22*out,oy=py+Math.sin(a)*RR*.08*out;
      // ⚠️ 늦게 모이고 늦게 오르면 몸 아래가 **뭉치로 덮인다**(렌더 판정).
      // 나오자마자 위로 꺾이고 가운데로 모여야 「기둥」이지 「덩어리」가 아니다.
      const pull=Math.pow(u,1.0)*.95;
      const x=ox+(cx-ox)*pull+Math.sin(t*1.3+v*2.1+u*3.4)*RR*.12*u;
      const y=oy-(u*1.00+u*u*2.00)*RR*1.15;
      const rr=RR*(.16+.40*u);
      const al=Math.max(0,1-u*.62)*(u<.20?u/.20:1)*.80;   // 밑동은 옅게 — 새는 것이지 덮는 것이 아니다
      bil(x,y,rr,sd+k*2.3,al,Math.max(0,.46-u*1.8));}
    // 새는 목 — **압력이 있다**는 신호이자 이 안의 정체다. 뭉치 아래 두면
    // 완전히 묻히고, 길거나 밝으면 크림색 화살이 된다(둘 다 렌더 판정).
    const jet=.55+.45*Math.sin(t*3.1+v*1.7);
    celSpike(c,px,py,a,RR*(.11+.08*jet),RR*.06,tn,.42);}}]);

// 3안 — 정체. **염+독이 상극**이라는 것을 색이 바뀌는 것으로 직접 보인다.
FVSET.smoke.push(["**끓어서 바뀐다** — 초록 독이 몸에서 끓다 불붙고 갈색이 되어 오른다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  // 발원지 — **몸이** 끓는다. 선을 그으면 지면이 되므로 둥근 열로만 두고,
  // 몸에 겹쳐 놓아 아래에 고인 웅덩이로 안 보이게 한다.
  c.save();c.globalCompositeOperation="lighter";
  const gb=c.createRadialGradient(cx,cy+RR*.26,0,cx,cy+RR*.26,RR*.86);
  gb.addColorStop(0,A(TX[1],.15+.06*Math.sin(t*3.3)));
  gb.addColorStop(.5,A(EM[0],.20));gb.addColorStop(1,A(T[0],0));
  c.fillStyle=gb;c.beginPath();c.arc(cx,cy+RR*.26,RR*.86,0,TAU);c.fill();c.restore();
  for(let i=0;i<16;i++){
    const sd=i*4.7,per=2.6+hash(sd)*1.3,u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*.86;
    const x=bx+Math.sin(t*1.05+i*1.9)*RR*.22*u;
    const y=cy+RR*.55-(u*.90+u*u*1.70)*RR*1.15;
    // ① 독 — 아직 초록. **작고 단단한 방울**이라 떠도는 안개(장 瘴)와 안 겹친다.
    if(u<.30){const q=u/.30,rr=RR*(.065+.050*q);
      fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,1-q)*.95));
      fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q*1.15)*.80));}
    // ② 불붙는 순간 — 여기서 상극이 뒤집힌다. 한 점에서만 밝다.
    const burn=Math.max(0,1-Math.abs(u-.32)/.15);
    if(burn>0){
      c.save();c.globalCompositeOperation="lighter";
      const gf=c.createRadialGradient(x,y,0,x,y,RR*.28*burn+2);
      gf.addColorStop(0,A(EM[2],burn*.50));gf.addColorStop(.4,A(EM[1],burn*.32));
      gf.addColorStop(1,A(EM[0],0));
      c.fillStyle=gf;c.beginPath();c.arc(x,y,RR*.28*burn+2,0,TAU);c.fill();c.restore();
      for(let k=0;k<4;k++)
        celSpike(c,x,y,k/4*TAU+t*2.2+i,RR*(.09+.13*burn),RR*.032,"ember",burn*.75);}
    // ③ 연 — 부풀며 오른다. 여기서부터가 연기다.
    if(u>.24){const q=Math.min(1,(u-.24)/.76),rr=RR*(.15+.50*q);
      const al=Math.max(0,1-q*.55)*(q<.14?q/.14:1)*.86;
      fillPoly(c,puffPoly(x,y,rr,7,sd+5.1),A(T[0],Math.max(0,.90*al)));
      fillPoly(c,puffPoly(x-rr*.10,y-rr*.14,rr*.58,7,sd+6.7),A(T[1],Math.max(0,.72*al)));
      fillPoly(c,puffPoly(x-rr*.15,y-rr*.22,rr*.22,5,sd+8.3),
        A(T[2],Math.max(0,.34-q*.9)*al*1.5));}}}]);

// 4안 — 박자. 계속 나오는 게 아니라 **한 덩이씩** 터져 나온다.

// 5안 — 난류. 오르는 것에 **결**을 준다. 연기의 소용돌이는 도는 게 아니라
// 오르면서 말리는 것이라, 고리(장 瘴)와 축이 다르다.

// 6안 — 발원. 「타는 독」에서 **타는 쪽**을 눈에 보이게 세운다. 색은 염의
// 주황이 아니라 연의 갈색이라, 불혀를 써도 염(炎)으로 안 읽힌다.

// ── 자(磁) 융화발현 — **새장에 전기를 흘린다** (2026-08-09 요청) ─────────
//
// 지금 5안은 자기력선이 **가만히 있어** 「정직한 새장」으로 읽힌다. 자는
// 빙+뇌인데 뇌가 하나도 안 보인다는 뜻이다 — 뇌의 확정 문법은 **경로가 계속
// 다시 굴려진다**(가만히 있으면 그건 금이지 방전이 아니다).
//
// 다섯 다 **두 극**과 **닫힌 선**은 지킨다. 그게 빠지면 자기력이 아니라
// 그냥 번개(=플라즈마 자리)가 된다. 무엇이 지지직거리는가만 달리한다.

/// 두 극 — 다섯이 공유한다. 자(磁)는 극이 보여야 자다.
function mgPole(c,cx,cy,RR,t,tn,lit){
  const T=TONE[tn],PY=RR*.92;
  for(const sy of[-1,1]){
    const py=cy+sy*PY;
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(cx,py,0,cx,py,RR*.26);
    g.addColorStop(0,A(T[2],Math.max(0,.30+.22*lit)));g.addColorStop(1,A(T[1],0));
    c.fillStyle=g;c.beginPath();c.arc(cx,py,RR*.26,0,TAU);c.fill();c.restore();
    fillPoly(c,jagPoly(cx,py,RR*.12,5,sy*3.1+t*.4,1.3),A(T[2],.9));}}
/// 극에서 극으로 가는 선 하나. [jit] 만큼 매 굴림마다 흔들린다.
function mgLine(c,cx,cy,RR,sgn,w,jit,sd,n){
  const PY=RR*.92,P2=[];
  for(let i=0;i<=(n||16);i++){const q=i/(n||16);
    const bend=Math.sin(q*Math.PI);
    const j=(hash(sd+i*3.13)-.5)*jit*bend;
    P2.push([cx+Math.sin(q*Math.PI)*w*sgn+j, cy-Math.cos(q*Math.PI)*PY+j*.35]);}
  return P2;}

FVSET.magnet.push(["**새장이 지지직거린다** — 선 자체가 0.1초마다 다시 굴려진다",
function(c,cx,cy,RR,t,tn){
  // 제일 곧은 답: **선을 흔든다.** 극과 개수는 그대로라 자기력선이라는 것이
  // 안 흔들리고, 흔들리는 것은 「길」뿐이라 지지직이 구조를 안 깬다.
  const sd=(t*10)|0;
  for(const sgn of[-1,1])for(let k=0;k<3;k++){
    const P2=mgLine(c,cx,cy,RR,sgn,RR*(.40+k*.30),RR*.085,sd+k*7.7+(sgn>0?31:0));
    celStroke(c,P2,2.6-k*.5,tn,.66-k*.13);}
  mgPole(c,cx,cy,RR,t,tn,.4);}]);

FVSET.magnet.push(["**감싼 새장에 전기가 흐른다** — 앞을 지나는 선은 몸 위로 온다",
function(c,cx,cy,RR,t,tn){
  // ⚠️ 두 가지가 반려됐다(2026-08-09):
  //  ① **구가 몸 뒤에 있는 느낌** — 모티프는 몸보다 먼저 그려지므로 그냥 두면
  //     전부 뒤로 깔린다. 자오선의 **앞쪽 반**을 `front()` 로 밀어 몸 위에
  //     얹으면 결계처럼 **감싼다**.
  //  ② **렉 걸리는 느낌** — 경로를 매 프레임 `hash` 로 다시 굴리고 아크를
  //     켰다 껐다 하니 뚝뚝 끊겼다. 흔들림은 **사인 합**(연속)으로, 아크는
  //     **알파 봉투**로 떴다 지게 한다. 지지직은 남고 끊김만 사라진다.
  // 자오선 여덟은 **촘촘했다** — 성기게(2026-08-09). 줄인 만큼 선을 조금
  // 굵혀야 새장이 헐거워 보이지 않는다.
  const T=TONE[tn], NM=5, R0=RR*.96;
  // 자오선 — 방위 ph 의 큰 원. 위도 la 를 돌면 타원이 되고, 깊이는 cos.
  const pt=(ph,la)=>[cx+Math.cos(la)*Math.sin(ph)*R0, cy-Math.sin(la)*R0,
                     Math.cos(la)*Math.cos(ph)];
  const spin=t*.22;
  const wob=(ph,la)=>                       // 연속 흔들림 — 계단이 없다
    (Math.sin(la*4.1+t*7.3+ph*2.7)*.55+Math.sin(la*7.7-t*5.1+ph*1.3)*.45)*RR*.030;
  const seg=(ph,l0,l1,w,al,toFront)=>{
    const P=[];
    for(let i=0;i<=14;i++){const la=l0+(l1-l0)*i/14;
      const p=pt(ph,la), j=wob(ph,la);
      P.push([p[0]+j,p[1]+j*.4]);}
    const draw=(cc)=>celStroke(cc,P,w,tn,al);
    if(toFront)front(draw);else draw(c);};
  for(let m=0;m<NM;m++){
    const ph=m/NM*Math.PI+spin;            // 자오선은 π 주기(앞뒤가 같은 원)
    const near=Math.cos(ph)>0;             // 앞으로 오는 반쪽
    const w=2.3+1.2*Math.abs(Math.sin(ph));
    // 뒤쪽 반 — 몸 아래로. 앞쪽 반 — 몸 위로.
    seg(ph,-Math.PI/2,Math.PI/2, w, near?.62:.30, near);
    seg(ph, Math.PI/2,Math.PI*1.5, w, near?.30:.62, !near);}
  // 아크 — 이웃한 자오선 사이를 건너뛴다. **알파 봉투**로 떴다 진다.
  for(let k=0;k<5;k++){
    const per=1.05+.55*hash(k*3.7);
    const u=(t/per+hash(k*9.1))%1;
    const env=Math.sin(Math.PI*Math.min(1,u/.42));   // 0→1→0, 뚝 끊기지 않는다
    if(u>.42||env<=.02)continue;
    const m=(hash(k*5.3+((t/per)|0)*7)*NM)|0;
    const la=(hash(k*2.1+((t/per)|0)*11)-.5)*2.2;
    const p0=pt(m/NM*Math.PI+spin,la), p1=pt((m+1)/NM*Math.PI+spin,la);
    const AR=[];
    for(let i=0;i<=6;i++){const q=i/6;
      const bend=Math.sin(q*Math.PI);
      AR.push([p0[0]+(p1[0]-p0[0])*q+Math.sin(q*9.1+t*13+k)*RR*.045*bend,
               p0[1]+(p1[1]-p0[1])*q+Math.sin(q*7.3-t*11+k*2.1)*RR*.055*bend]);}
    const toFront=(p0[2]+p1[2])>0;
    const draw=(cc)=>{
      celStroke(cc,AR,2.6,tn,Math.max(0,env*.95));
      cc.save();cc.globalCompositeOperation="lighter";
      for(const e of[AR[0],AR[AR.length-1]]){
        const g=cc.createRadialGradient(e[0],e[1],0,e[0],e[1],RR*.09);
        g.addColorStop(0,A(T[2],Math.max(0,env*.8)));g.addColorStop(1,A(T[1],0));
        cc.fillStyle=g;cc.beginPath();cc.arc(e[0],e[1],RR*.09,0,TAU);cc.fill();}
      cc.restore();};
    if(toFront)front(draw);else draw(c);}
  mgPole(c,cx,cy,RR,t,tn,.3);}]);

FVSET.magnet.push(["**전류가 선을 타고 달린다** — 달리는 구간만 굵고 희다",
function(c,cx,cy,RR,t,tn){
  // 지지직이 아니라 **흐름**으로 뇌를 낸다. 선은 그대로인데 밝은 토막이
  // 극에서 극으로 달려 「전기가 흐른다」가 문자 그대로 읽힌다.
  const W=[RR*.40,RR*.70,RR*1.00];
  for(const sgn of[-1,1])for(let k=0;k<3;k++){
    const P2=mgLine(c,cx,cy,RR,sgn,W[k],RR*.020,k*3.1,22);
    celStroke(c,P2,2.2-k*.35,tn,.34-k*.06);
    // 달리는 토막 — 선마다 위상을 어긋내야 「한 덩어리」로 안 보인다
    const ph=(t*(.62+k*.14)+(sgn>0?.5:0)+k*.31)%1;
    const a=Math.max(0,Math.floor((ph-.14)*22)),b=Math.min(22,Math.ceil(ph*22));
    if(b-a>1){const seg=P2.slice(a,b+1);
      celStroke(c,seg,4.4-k*.6,tn,.95);}}
  mgPole(c,cx,cy,RR,t,tn,.55+.45*Math.sin(t*3.9));}]);

FVSET.magnet.push(["**극에서 터진다** — 방전이 극에서 나 선을 타고 흩어진다",
function(c,cx,cy,RR,t,tn){
  // 주기마다 극이 방전한다. 새장은 조용한데 **극만** 지지직거려서, 힘이
  // 모이는 자리가 어디인지가 한 번 더 말해진다.
  const T=TONE[tn],P=1.5,u=saw(t,P),fire=u<.34?1-u/.34:0,sd=((t/P)|0)*17;
  const W=[RR*.40,RR*.70,RR*1.00];
  for(const sgn of[-1,1])for(let k=0;k<3;k++)
    celStroke(c,mgLine(c,cx,cy,RR,sgn,W[k],RR*.030*fire,sd+k*5.7),
      2.4-k*.42,tn,.40-k*.08+.26*fire);
  if(fire>0)for(const sy of[-1,1])for(let m=0;m<6;m++){
    const py=cy+sy*RR*.92, a0=-Math.PI/2*sy+(m/6-.5)*2.2;
    const P2=[[cx,py]];
    for(let i=1;i<=4;i++){const q=i/4;
      const aa=a0+(hash(sd+m*3.3+i*1.7)-.5)*.9*q;
      P2.push([cx+Math.cos(aa)*RR*.38*q, py+Math.sin(aa)*RR*.38*q]);}
    celStroke(c,P2,2.8*fire+.8,tn,Math.max(0,fire));}
  mgPole(c,cx,cy,RR,t,tn,fire);}]);

FVSET.magnet.push(["**지지직거리는 새장을 조각이 탄다** — 길은 떨고 물건은 끌려간다",
function(c,cx,cy,RR,t,tn){
  // 5안(조각이 극으로 미끄러진다)에 지지직을 더한 것. 자(끌어당김)와
  // 뇌(방전)가 한 그림에 같이 있다 — 둘 다 가진 유일한 안이다.
  const T=TONE[tn],PY=RR*.92,sd=(t*10)|0;
  const W=[RR*.40,RR*.70,RR*1.00],LN=[];
  for(const sgn of[-1,1])for(let k=0;k<3;k++){LN.push([sgn,W[k]]);
    celStroke(c,mgLine(c,cx,cy,RR,sgn,W[k],RR*.070,sd+k*7.7+(sgn>0?31:0)),
      2.2-k*.38,tn,.34-k*.07);}
  const pt=(sgn,w,q)=>[cx+Math.sin(q*Math.PI)*w*sgn,cy-Math.cos(q*Math.PI)*PY];
  for(let i=0;i<12;i++){
    const [sgn,w]=LN[i%LN.length];
    const dir=hash(i*5.9)>.5?1:-1;
    const per=1.5+hash(i*3.1)*1.3, u=(t/per+hash(i*7.7))%1;
    const sz=RR*(.09+.05*hash(i*11.3));
    if(u<.80){
      const e=Math.pow(u/.80,2.4), q=.5+dir*.5*e, p=pt(sgn,w,q);
      const TR=[];
      for(let k=8;k>=0;k--)TR.push(pt(sgn,w,.5+dir*.5*Math.max(0,e-k*.055)));
      celStroke(c,TR,2.4,tn,Math.max(0,.10+.52*e));
      const p2=pt(sgn,w,q+dir*.02);
      c.save();c.translate(p[0],p[1]);c.rotate(Math.atan2(p2[1]-p[1],p2[0]-p[0]));
      fillPoly(c,jagPoly(0,0,sz,6,i*2.7,.88,.60),A(T[0],.95));
      fillPoly(c,jagPoly(0,0,sz*.62,6,i*2.7+1.1,.86,.60),A(T[1],.97));
      fillPoly(c,jagPoly(0,0,sz*.28,6,i*2.7+2.3,.84,.60),A(T[2],.95));
      c.restore();}}
  mgPole(c,cx,cy,RR,t,tn,.45);}]);

// ── 구 안에서 도는 것 — 후보 넷 (2026-08-10 요청) ───────────────────────
//
// 자 13안이 3D 로 감싸면서 확 올라갔다는 판정 뒤의 진단: **불씨와 플라즈마가
// 평면으로 돌아서** 갇힌 느낌이 안 난다. 궤도를 기울이면 구 안이 된다.
//
// ⚠️ 깊이는 **y 가 아니라 z 로** 봐야 한다. `wrapBody` 는 화면 아래쪽을 앞으로
// 치는 간단한 규칙이라 둘레를 도는 고리에는 맞지만, **기울어진 궤도**는 위쪽에
// 있으면서도 앞일 수 있다. 그래서 여기서는 알갱이마다 z 로 판정해 앞뒤를 가른다.

/// 구 위의 기울어진 궤도 — 법선 하나로 평면이 정해진다.
/// **평면이 화면과 나란하면 접시로 보인다.** 기울여야 갇힌 것이 된다.
function sphOrbit(seed){
  const th=hash(seed*3.1)*TAU, ph=Math.acos(1-2*hash(seed*5.7));
  const n=[Math.sin(ph)*Math.cos(th),Math.sin(ph)*Math.sin(th),Math.cos(ph)];
  const t0=Math.abs(n[2])<.9?[0,0,1]:[1,0,0];
  const cx3=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const nr=(v)=>{const m=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/m,v[1]/m,v[2]/m];};
  const a=nr(cx3(n,t0));
  return {a,b:cx3(n,a)};}
/// 궤도 위의 한 점 → 화면 좌표 + 깊이. 세로를 살짝 눌러 비스듬한 시선을 준다.
function sphPt(o,u,R,cx,cy){
  const c1=Math.cos(u),s1=Math.sin(u);
  const X=o.a[0]*c1+o.b[0]*s1, Y=o.a[1]*c1+o.b[1]*s1, Z=o.a[2]*c1+o.b[2]*s1;
  return [cx+X*R, cy+Y*R*.92, Z];}

FVSET.fstorm.push(["**구 안에서 돈다** — 궤도가 저마다 기울어 있어 갇힌 것이 된다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], R0=RR*.92, N=14;
  const back=[],fore=[];
  for(let i=0;i<N;i++){
    const o=sphOrbit(i+1);
    const sp=.30+.34*hash(i*7.7);
    const u=t*sp+hash(i*11.3)*TAU;
    const p=sphPt(o,u,R0*(.62+.36*hash(i*2.9)),cx,cy);
    // 명멸 — 불씨의 정체. 없으면 그냥 도는 점이다.
    const bl=Math.max(0,Math.sin(t*(2.4+2.2*hash(i*4.7))+i*1.7));
    const live=bl*bl*(.40+.60*hash(i*6.3));
    if(live<.05)continue;
    // 깊이 — 뒤는 작고 흐리게. 이것만으로 「안쪽」이 생긴다.
    const dz=(p[2]*.5+.5);
    const sz=(1.5+2.6*hash(i*8.9))*(.62+.52*dz);
    // 꼬리 — 지나온 궤도. 기울어진 게 보여야 평면이 아니다.
    const tp=[];
    for(let k=0;k<6;k++)tp.push(sphPt(o,u-k*.10,R0*(.62+.36*hash(i*2.9)),cx,cy));
    const draw=(cc)=>{
      celStroke(cc,tp.map(q=>[q[0],q[1]]),sz*.55,tn,Math.max(0,live*.30*dz));
      cc.save();cc.globalCompositeOperation="lighter";
      const g=cc.createRadialGradient(p[0],p[1],0,p[0],p[1],sz*3.4);
      g.addColorStop(0,A(T[2],Math.max(0,live*.62*dz)));
      g.addColorStop(.42,A(T[1],Math.max(0,live*.24*dz)));
      g.addColorStop(1,A(T[1],0));
      cc.fillStyle=g;cc.beginPath();cc.arc(p[0],p[1],sz*3.4,0,TAU);cc.fill();cc.restore();
      fillPoly(cc,jagPoly(p[0],p[1],sz*1.5,5,i*3.3,1.35),A(T[0],Math.max(0,live*.9)));
      fillPoly(cc,jagPoly(p[0],p[1],sz*.92,5,i*3.3+1,1.25),A(T[1],Math.max(0,live)));
      fillPoly(cc,jagPoly(p[0],p[1],sz*.44,5,i*3.3+2,1.2),A(T[2],Math.max(0,live*dz)));};
    (p[2]>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.fstorm.push(["**구 안을 바람이 훑는다** — 기울어진 궤도 위에서 꺼진 것이 다시 붙는다",
function(c,cx,cy,RR,t,tn){
  // 6안(되살아난다)을 구 안으로 옮긴 것. 훑는 것이 평면 고리가 아니라
  // **구를 도는 띠**라, 살아나는 자리가 안팎으로 오간다.
  const T=TONE[tn], R0=RR*.92, N=30, SW=1.25;
  const back=[],fore=[];
  const sweep=t*SW;
  for(let i=0;i<N;i++){
    const o=sphOrbit(i+7);
    const u0=hash(i*9.7)*TAU;
    const p=sphPt(o,u0+t*.10,R0*(.55+.42*hash(i*3.7)),cx,cy);
    // 훑는 띠 — 방위각으로 판정한다(구를 한 바퀴 도는 면).
    const az=Math.atan2(p[1]-cy,p[0]-cx);
    let d=1e9;
    for(let sgn=0;sgn<3;sgn++){
      let q=(az-sweep-sgn*TAU/3)%TAU;while(q<0)q+=TAU;d=Math.min(d,q);}
    const rev=Math.exp(-d*1.05);
    const emb=.06*Math.max(0,Math.sin(t*(2.2+2.0*hash(i*4.1))+i));
    const live=Math.max(0,(emb+rev*.95)*(.40+.60*Math.abs(Math.sin(t*3.1+i*1.9))));
    if(live<.05)continue;
    const dz=(p[2]*.5+.5), sz=(1.4+2.4*rev)*(.62+.52*dz);
    const draw=(cc)=>{
      cc.save();cc.globalCompositeOperation="lighter";
      const g=cc.createRadialGradient(p[0],p[1],0,p[0],p[1],sz*3.2);
      g.addColorStop(0,A(T[2],Math.max(0,live*.60*dz)));
      g.addColorStop(1,A(T[1],0));
      cc.fillStyle=g;cc.beginPath();cc.arc(p[0],p[1],sz*3.2,0,TAU);cc.fill();cc.restore();
      fillPoly(cc,jagPoly(p[0],p[1],sz*1.4,5,i*3.3,1.35),A(T[0],Math.max(0,live*.9)));
      fillPoly(cc,jagPoly(p[0],p[1],sz*.86,5,i*3.3+1,1.25),A(T[1],Math.max(0,live)));
      if(rev>.45)for(let k=0;k<5;k++)
        celSpike(cc,p[0],p[1],k/5*TAU+t*3.1+i,sz*(2.2+1.4*rev),sz*.42,tn,
          Math.max(0,(rev-.45)/.55*.9));};
    (p[2]>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.blast.push(["**구 껍질 안에 갇힌다** — 가닥이 기울어진 면을 타고 껍질을 짚는다",
function(c,cx,cy,RR,t,tn){
  // 껍질을 **자오선 구**로 그려 갇힘이 3D 가 되고, 가닥은 코어에서 나가
  // 껍질의 아무 데나 짚는다 — 앞쪽을 짚으면 몸 위로 온다.
  const T=TONE[tn], R0=RR*1.00, NM=5, sd=(t*10)|0;
  const spin=t*.20;
  const mer=(ph,la)=>[cx+Math.cos(la)*Math.sin(ph)*R0, cy-Math.sin(la)*R0,
                      Math.cos(la)*Math.cos(ph)];
  const back=[],fore=[];
  for(let m=0;m<NM;m++){
    const ph=m/NM*Math.PI+spin;
    for(const half of[0,1]){
      const P=[];
      for(let k=0;k<=14;k++){
        const la=(half?Math.PI/2:-Math.PI/2)+k/14*Math.PI;
        const p=mer(ph,la);P.push(p);}
      const near=P[7][2]>0;
      const pts=P.map(p=>[p[0],p[1]]);
      const draw=(cc)=>celStroke(cc,pts,near?2.4:1.8,tn,near?.34:.20);
      (near?fore:back).push(draw);}}
  // 가닥 — 코어에서 껍질로. 짚는 자리를 3D 로 고르므로 앞뒤가 생긴다.
  for(let i=0;i<7;i++){
    if(hash(sd*3.1+i*7.7)>.55)continue;
    const o=sphOrbit(i+21);
    const p=sphPt(o,hash(sd*5.3+i)*TAU,R0,cx,cy);
    const P2=[[cx,cy]];
    for(let k=1;k<=5;k++){const q=k/5;
      const wob=Math.sin(t*7.3+i*2.1+q*5.1)*RR*.055*Math.sin(q*Math.PI);
      P2.push([cx+(p[0]-cx)*q+wob, cy+(p[1]-cy)*q+wob*.5]);}
    const dz=(p[2]*.5+.5);
    const draw=(cc)=>{
      celStroke(cc,P2,2.6-1.0*hash(i*2.9),tn,.55+.40*dz);
      cc.save();cc.globalCompositeOperation="lighter";
      const g=cc.createRadialGradient(p[0],p[1],0,p[0],p[1],10);
      g.addColorStop(0,A(T[2],.85*dz+.15));g.addColorStop(1,A(T[1],0));
      cc.fillStyle=g;cc.beginPath();cc.arc(p[0],p[1],10,0,TAU);cc.fill();cc.restore();};
    (p[2]>0?fore:back).push(draw);}
  for(const d of back)d(c);
  c.save();c.globalCompositeOperation="lighter";
  const g2=c.createRadialGradient(cx,cy,0,cx,cy,RR*.72);
  g2.addColorStop(0,A(T[2],.34+.10*Math.sin(t*3.1)));
  g2.addColorStop(.5,A(T[1],.18));g2.addColorStop(1,A(T[1],0));
  c.fillStyle=g2;c.beginPath();c.arc(cx,cy,RR*.72,0,TAU);c.fill();c.restore();
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.blast.push(["**구 안에서 감긴다** — 두 가닥이 기울어진 궤도를 따라 서로를 감는다",
function(c,cx,cy,RR,t,tn){
  // 6안(땋인다)을 구 안으로. 땋임이 평면이면 리본이지만, 궤도를 기울이면
  // **부피 안에서 꼬인 것**이 된다 — 갇힘과 꼬임이 한 그림에 든다.
  const T=TONE[tn], R0=RR*.96;
  const back=[],fore=[];
  for(let m=0;m<3;m++){
    const o=sphOrbit(m+41);
    const base=t*(.26+.08*m)+m*2.1;
    for(const sgn of[-1,1]){
      const P=[],Z=[];
      for(let k=0;k<=26;k++){
        const q=k/26;
        const amp=.30*Math.sin(q*Math.PI);
        const u=base+q*TAU*.86+sgn*amp*Math.sin(q*7.4+t*3.1);
        const rr=R0*(.34+.62*q);
        const p=sphPt(o,u,rr,cx,cy);
        P.push([p[0],p[1]]);Z.push(p[2]);}
      // 앞뒤가 섞이므로 **토막으로 갈라** 담는다 — 한 획을 통째로 앞에 두면
      // 뒤로 돌아간 구간까지 몸 위로 와서 감긴 게 안 보인다.
      let a0=0;
      for(let k=1;k<=26;k++){
        if(k===26||(Z[k]>0)!==(Z[k-1]>0)){
          const seg=P.slice(a0,k+1);
          if(seg.length>1){const near=Z[a0]>0;
            const dz=near?1:.55;
            const draw=(cc)=>celStroke(cc,seg,3.2*dz,tn,.92*dz);
            (near?fore:back).push(draw);}
          a0=k;}}
      const e=P[P.length-1];
      const near=Z[Z.length-1]>0;
      const draw=(cc)=>{cc.save();cc.globalCompositeOperation="lighter";
        const g=cc.createRadialGradient(e[0],e[1],0,e[0],e[1],11);
        g.addColorStop(0,A(T[2],near?.95:.5));g.addColorStop(1,A(T[1],0));
        cc.fillStyle=g;cc.beginPath();cc.arc(e[0],e[1],11,0,TAU);cc.fill();cc.restore();};
      (near?fore:back).push(draw);}}
  for(const d of back)d(c);
  c.save();c.globalCompositeOperation="lighter";
  const g2=c.createRadialGradient(cx,cy,0,cx,cy,RR*.70);
  g2.addColorStop(0,A(T[2],.32+.10*Math.sin(t*3.1)));g2.addColorStop(1,A(T[1],0));
  c.fillStyle=g2;c.beginPath();c.arc(cx,cy,RR*.70,0,TAU);c.fill();c.restore();
  front((cc)=>{for(const d of fore)d(cc);});}]);

// ── 연 — **감고 도는 독가스** 후보 셋 (2026-08-10) ──────────────────────
//
// 지금까지의 연은 전부 **오르거나 고여 있었다.** 그래서 탁함이 정체인데 탁하면
// 안 보이는 문제를 못 벗어났다 — 가만히 있는 탁한 것은 배경이 된다.
//
// 불씨 발현처럼 **세로축을 돌면** 사정이 달라진다: 앞을 지날 때 몸을 가리고
// 뒤로 갈 때 흐려지므로, 짙기를 안 올려도 **움직임으로** 읽힌다. 그리고
// 「독가스가 몸을 감았다」가 되어 정체도 산다.
//
// 셋 다 지킨다: **탁하다**(저채도) · **불티와 독 알갱이가 섞여 있다**(타는
// 독이라는 증거) · **앞뒤로 돈다**(z 로 가른다).

/// 감고 도는 연기 한 자락 — 세로축을 도는 궤도 위에 덩이를 잇는다.
function smWisp(cc,cx,cy,RR,tn,az,lat,rad,len,n,al,dz,seedBase){
  const T=TONE[tn];
  cc.save();cc.globalCompositeOperation="lighter";
  for(let k=0;k<n;k++){
    const q=k/(n-1);
    const a2=az-q*len;
    const x=cx+Math.cos(a2)*rad;
    const y=cy+lat*RR+Math.sin(a2)*rad*.22;
    const rr=RR*(.15+.10*hash(seedBase+k*3.1))*(1-q*.35);
    const g=cc.createRadialGradient(x,y,0,x,y,rr);
    const a3=Math.max(0,al*(1-q*.75)*dz);
    g.addColorStop(0,A(T[1],a3*1.5));g.addColorStop(.55,A(T[0],a3));
    g.addColorStop(1,A(T[0],0));
    cc.fillStyle=g;cc.beginPath();cc.arc(x,y,rr,0,TAU);cc.fill();}
  cc.restore();}




// ── 연 — **타르(역청)** 후보 셋 (2026-08-10) ────────────────────────────
//
// 염+독을 「연기」가 아니라 **끈적하게 타는 검은 것**으로 보는 안이다.
// 열여섯이 전부 떠 있거나 도는데 **타르만 매달리고 떨어진다** — 그 축이 비어
// 있어서 형태만으로 독보적이다. 색상환도 꽉 차 있어(빈 자리가 거의 없다)
// **검정**으로 가는 것이 색 충돌을 피하는 유일한 길이기도 하다.
//
// ⚠️ 검은 것은 검은 배경에서 안 보인다. 어둠(影)이 **밝은 림**으로 보이는 것과
// 같은 장치를 쓴다 — 몸은 검고 **가장자리만 탄다**. 그 붉은 테가 실루엣이다.
/// 타르 아래 깔리는 **붉은 기운.** 몸 팔레트가 거의 검정이라 그것만으로는
/// 「식은 것」으로 보인다 — 바닥이 벌겋게 달아 있어야 **아직 타는 중**이 된다.
/// (연 3안의 붉은 바닥빛을 타르로 옮긴 것 — 2026-08-10 요청.)
function tarGlow(cc,cx,cy,RR,amt,tn,t){
  // **연 3안의 그것을 그대로 쓴다**(2026-08-10). 앞서 붉은 기·초록 기를 따로
  // 두 겹으로 깔았다가 반려됐다 — 3안은 **그라디언트 하나**다: 속이 초록(독),
  // 중간이 검붉음(염), 바깥이 투명. 겹치는 자리에서 나오는 탁한 색이 곧
  // 「타는 독」이라, 두 개로 나누면 그 섞임이 사라진다.
  const T=TONE[tn]||TONE.smoke, EM=TONE.ember, TX=TONE.toxin;
  cc.save();cc.globalCompositeOperation="lighter";
  const gb=cc.createRadialGradient(cx,cy+RR*.26,0,cx,cy+RR*.26,RR*.86);
  gb.addColorStop(0,A(TX[1],Math.max(0,(.15+.06*Math.sin(t*3.3))*amt)));
  gb.addColorStop(.5,A(EM[0],Math.max(0,.20*amt)));
  gb.addColorStop(1,A(T[0],0));
  cc.fillStyle=gb;cc.beginPath();cc.arc(cx,cy+RR*.26,RR*.86,0,TAU);cc.fill();
  cc.restore();}

/// 타르 덩이 하나 — **이 프로젝트의 셀 문법 그대로.**
///
/// ⚠️ 처음엔 매끄러운 `ellipse` + 2단 + 캔버스 `stroke` + 흰 광택 점으로
/// 그렸다가 **「그림체가 다르다」**는 반려를 받았다(2026-08-10). 나머지 열여섯은
/// 전부 **각진 셀 실루엣 + 3단 계조 + celStroke** 다. 액체라도 문법은 같아야
/// 한 벌로 읽힌다 — 액체다움은 **뭉툭한 각**(spikeMul 낮게)으로 낸다.
function tarBlob(cc,x,y,rr,burn,al,sd){
  const T=TONE.tar;
  fillPoly(cc,jagPoly(x,y,rr,7,sd,1.02,.92),A(T[0],Math.max(0,.96*al)));
  fillPoly(cc,jagPoly(x,y,rr*.70,7,sd+1.3,1.00,.92),A(T[1],Math.max(0,.95*al)));
  // 타는 가장자리 — **실루엣이 여기서 난다.** 3단 계조 획이라 나머지와 같은 결.
  if(burn>.02){
    const P=[];
    for(let k=0;k<=12;k++){const a2=k/12*TAU;
      const w=1.02+.06*Math.sin(a2*3+sd);
      P.push([x+Math.cos(a2)*rr*w,y+Math.sin(a2)*rr*w*.92]);}
    celStroke(cc,P,Math.max(1,rr*.24),"tar",Math.max(0,burn*al));}
  // 젖은 면 — 광택도 **각진 조각**으로. 흰 원은 이 프로젝트에 없는 장치다.
  fillPoly(cc,jagPoly(x-rr*.26,y-rr*.28,rr*.24,5,sd+2.7,1.05,.9),
    A(T[2],Math.max(0,.50*al)));}



FVSET.smoke.push(["**끓어 넘친다** — 검은 것이 부글거리며 몸을 감고 돌고, 터진 자리만 탄다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);   // 연 3안 그대로 — 기본·발현이 같은 바닥을 쓴다
  // 「타는 독」의 **끓음**을 타르로 옮긴 것. 도는 것은 독가스 안과 같고,
  // 다른 점은 **물성**이다 — 기체가 아니라 끈적한 액체라 터지면서 탄다.
  // 타르는 **더 많이**, 터짐은 **더 뜸하게**. 촘촘히 터지면 「부글부글」이라
  // 끓는 게 아니라 떠는 것으로 보인다 — 끈적한 것은 드물게 크게 터진다.
  const back=[],fore=[];
  for(let i=0;i<15;i++){
    const sp=.28+.16*hash(i*3.1);
    const az=t*sp+i/15*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.36;
    const rad=RR*(.50+.32*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    // 기포 — 부풀다 터진다. 터지는 순간에만 가장자리가 세게 탄다.
    // 주기를 늘리고(1.1~1.9 → 2.4~4.0) 터지는 구간을 짧게 — 대부분은 그냥
    // 매달려 있고 **가끔** 하나가 터진다.
    const per=2.4+1.6*hash(i*5.3);
    const u=(t/per+hash(i*8.9))%1;
    const grow=u<.84?ease(u/.84):1, pop=u<.84?0:(u-.84)/.16;
    const rr=RR*(.115+.105*grow)*(1+pop*.60);
    const burn=.30+.70*pop;
    const draw=(cc)=>{
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.55)),i*3.1);
      if(pop>.15)for(let k=0;k<7;k++){          // 터진 방울 — 드물게, 크게
        const a2=k/7*TAU+i;
        const d2=rr*(1.3+pop*2.1);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  // 독 알갱이 — **연 3안 그대로.** 작고 단단한 방울이라 떠도는 안개(장 瘴)와
  // 안 겹치고, 검은 타르 사이에서 초록이 튀어 「무엇이 타고 있는지」를 말한다.
  // 타르와 같은 궤도를 도니 앞뒤도 같이 갈린다.
  {const TX=TONE.toxin;
   for(let i=0;i<9;i++){
     const sd=i*4.7, per=2.2+hash(sd)*1.2;
     const u=((t+hash(sd*2.1)*per)%per)/per;
     const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
     const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;          // 끓어 오르다 사그라든다
     const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
     const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
     const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
     const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
     if(al<=.03)continue;
     const rr=RR*(.055+.042*q);
     const draw=(cc)=>{
       fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
       fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
     (z>0?fore:back).push(draw);}}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

// ── 연 — **타르 기본** 후보 둘 (2026-08-10) ─────────────────────────────
// 발현이 타르면 기본도 타르여야 한다. 다만 융화 **기본**은 「속성 일반보다
// 아주 약간만」이므로, 끓지도 터지지도 않고 **그냥 매달려 있기만** 한다.

FVSET.smoke.push(["**맺혀 매달린다** — 몇 방울이 붙어 천천히 흔들릴 뿐이다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);   // 바닥빛은 발현과 **같다** — 세기는 덩이로 낸다
  const back=[],fore=[];
  for(let i=0;i<5;i++){
    const az=t*.16+i/5*TAU;                    // 아주 느리게 — 기본은 조용하다
    const lat=(hash(i*3.7)-.5)*.42;
    const rad=RR*(.50+.12*hash(i*5.3));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.22;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    const rr=RR*(.075+.035*hash(i*7.7));
    // 타는 기색만 — 기본에서는 가장자리가 **가끔** 붉어진다
    const burn=.10+.22*Math.max(0,Math.sin(t*1.5+i*2.1));
    const sag=RR*(.05+.07*Math.max(0,Math.sin(t*.7+i*1.3)));
    const draw=(cc)=>{
      celStroke(cc,[[x,y],[x,y+sag]],rr*.45,tn,Math.max(0,.22*dz));
      tarBlob(cc,x,y+sag,rr,burn,dz*.85,i*3.1);};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**한 겹 발려 있다** — 몸에 얇게 씌워지고 가끔 한 자리만 탄다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);   // 바닥빛은 발현과 **같다** — 세기는 덩이로 낸다
  // 덩이도 아니고 방울도 아닌 **막**. 기본 중에서도 제일 조용한 쪽이라,
  // 「무언가 묻어 있다」만 말하고 아무 일도 일으키지 않는다.
  const T=TONE[tn];
  const P=[],Q=[];
  for(let k=0;k<=40;k++){const a2=k/40*TAU;
    const w=1+.055*Math.sin(a2*5+t*.9)+.035*Math.sin(a2*8-t*.6);
    P.push([cx+Math.cos(a2)*RR*.66*w,cy+Math.sin(a2)*RR*.66*w]);
    Q.push([cx+Math.cos(a2)*RR*.50,cy+Math.sin(a2)*RR*.50]);}
  fillPoly(c,P.concat(Q.slice().reverse()),A(T[0],.90));
  fillPoly(c,P.map((p,k)=>[Q[k][0]+(p[0]-Q[k][0])*.62,Q[k][1]+(p[1]-Q[k][1])*.62])
    .concat(Q.slice().reverse()),A(T[1],.92));
  // 타는 자리 — 한 번에 하나만. 천천히 옮겨 다닌다.
  const az=t*.42, k0=((az/TAU%1)*40)|0;
  const seg=[];for(let k=0;k<7;k++)seg.push(P[(k0+k)%40]);
  celStroke(c,seg,RR*.055,tn,.55+.35*Math.sin(t*3.1));
  // 흘러내린 자국 하나 — 막이 액체라는 증거
  const dz=RR*(.10+.09*Math.max(0,Math.sin(t*.8)));
  const dx=P[(k0+20)%40];
  celStroke(c,[[dx[0],dx[1]],[dx[0],dx[1]+dz]],RR*.045,tn,.42);}]);

// ── 연 — **1안 + 3안** (2026-08-10 요청) ────────────────────────────────
FVSET.smoke.push(["**끓다 타서 재가 된다** — 초록 방울이 불붙고, 남은 것이 팔랑거리며 뜬다",
function(c,cx,cy,RR,t,tn){
  // 1안은 「재가 뜬다」만 있고 3안은 「독이 불붙는다」만 있었다. 합치면
  // **한 알의 일생**이 한 그림에 든다: 초록 방울 → 불붙는 한 점 → 재 조각.
  // 재로 끝나므로 기본에 어울린다 — 끓지도 터지지도 않고 **삭아 없어진다.**
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  for(let i=0;i<13;i++){
    const sd=i*4.7, per=3.0+hash(sd)*1.6;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*1.05;
    const x=bx+Math.sin(t*.95+i*1.9)*RR*.20*u;
    const y=cy+RR*.62-(u*.85+u*u*1.35)*RR*1.05;
    // ① 독 — 아직 초록. 작고 단단한 방울(3안 그대로).
    if(u<.28){const q=u/.28, rr=RR*(.060+.045*q);
      fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,1-q)*.95));
      fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q*1.15)*.80));}
    // ② 불붙는 순간 — 상극이 뒤집히는 한 점.
    const burn=Math.max(0,1-Math.abs(u-.30)/.13);
    if(burn>0){
      c.save();c.globalCompositeOperation="lighter";
      const gf=c.createRadialGradient(x,y,0,x,y,RR*.24*burn+2);
      gf.addColorStop(0,A(EM[2],burn*.45));gf.addColorStop(.4,A(EM[1],burn*.28));
      gf.addColorStop(1,A(EM[0],0));
      c.fillStyle=gf;c.beginPath();c.arc(x,y,RR*.24*burn+2,0,TAU);c.fill();c.restore();
      for(let k=0;k<4;k++)
        celSpike(c,x,y,k/4*TAU+t*2.2+i,RR*(.07+.11*burn),RR*.028,"ember",burn*.7);}
    // ③ 재 — **연기가 아니라 조각.** 팔랑거리며 뜨고 아래쪽은 아직 빨갛다.
    if(u>.26){
      const q=Math.min(1,(u-.26)/.74);
      const s2=RR*(.055+.045*hash(sd*13.7))*(1-q*.25);
      const flip=Math.abs(Math.cos(t*(2.2+hash(sd*11.1)*2.4)+i));
      const al=Math.max(0,1-q)*(q<.10?q/.10:1);
      c.save();c.translate(x,y);c.rotate(t*.7+i*1.9);c.scale(flip*.85+.15,1);
      c.beginPath();c.moveTo(-s2,-s2*.62);c.lineTo(s2*.86,-s2);
      c.lineTo(s2,s2*.74);c.lineTo(-s2*.72,s2);c.closePath();
      c.fillStyle=A(T[1],Math.max(0,.95*al));c.fill();
      c.strokeStyle=A(T[0],Math.max(0,.85*al));c.lineWidth=1.0;c.stroke();
      const glow=Math.max(0,1-q*3.0);            // 갓 탄 재는 아직 빨갛다
      if(glow>0){
        c.beginPath();c.moveTo(-s2*.45,-s2*.30);c.lineTo(s2*.50,-s2*.42);
        c.lineTo(s2*.54,s2*.24);c.lineTo(-s2*.32,s2*.42);c.closePath();
        c.fillStyle=A(T[2],Math.max(0,glow*al*.75));c.fill();}
      c.restore();}}}]);

// ── 연 기본 후보 — 1안 + 3안 합본 다섯 (2026-08-10) ──────────────────
// ── 연 — **1안 + 3안** 합본 다섯 (2026-08-10 요청) ──────────────────────
//
// 1안 = 「재가 뜬다」(타고 남은 부스러기가 팔랑거리며 뜬다).
// 3안 = 「끓어서 바뀐다」(초록 독이 몸에서 끓다 불붙고 뭉게가 되어 오른다).
//
// 요청은 **3안의 뭉게구름을 1안에 「약하게」 얹는 것**이다 — 뭉게가 커지면
// 그건 그냥 3안이라 합본이 아니다. 그래서 다섯 다 이렇게 짰다:
//   · 주인공은 **재**(1안). 뭉게는 3안의 절반 크기, 개수도 절반이다.
//   · 3안에서 가져오는 것은 뭉게 **모양**(puffPoly)과 **단계**(독→불→오름).
//   · 다섯의 차이는 세기가 아니라 **뭉게가 언제/어디에 나타나는가** 하나다.
//
// ⚠️ 처음엔 「약하게」를 **알파**로만 냈다가 렌더에서 **아무것도 안 보였다**
// (2026-08-10). 뭉게는 지름 .65RR→.35RR 로 **작게** 줄이고 알파는 3안의
// 4분의 3까지 올려야 「작은 뭉게」가 되지 「없는 뭉게」가 안 된다.
// 재도 같은 함정에 걸렸다 — 검게 채우고 붉은 획만 두르니 5px 조각이
// 배경에 먹혔다. 1안 그대로 **바깥이 타는 붉음, 속이 검정**이라야 보인다.
//
// 융화 **기본** 자리라 발현(4안 「끓어 넘친다」)보다 확실히 조용해야 한다 —
// 터지지 않고, 감고 돌지 않고, 알갱이 수도 절반이다.
// 초록은 바닥빛(tarGlow)과 **날아다니는 알갱이**에만 — 코어에 넣지 않는다.

// 8안 — 뭉게가 **자국**이다. 재가 지나간 자리에 늦게 따라와 흐려진다.
FVSET.smoke.push(["**재가 옅은 자국을 끌고 뜬다** — 조각이 주인공이고 뭉게는 뒤에 처져 흐려질 뿐이다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  // 뭉게 — 3안과 같은 3단이되 **지름이 절반**이다. 약함은 크기로 낸다.
  const puff=(x,y,rr,sd,al,lit)=>{
    fillPoly(c,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.55*al)));
    fillPoly(c,puffPoly(x-rr*.10,y-rr*.14,rr*.60,7,sd+1.7),A(T[1],Math.max(0,.52*al)));
    if(lit>0)fillPoly(c,puffPoly(x-rr*.16,y-rr*.24,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.55)));};
  // 재 조각 — **1안 그대로.** 바깥이 타는 붉음(T[0]), 속이 검정(T[1]).
  const flake=(x,y,s2,rot,sq,al,glow)=>{
    c.save();c.translate(x,y);c.rotate(rot);c.scale(sq,1);
    c.beginPath();c.moveTo(-s2,-s2*.62);c.lineTo(s2*.86,-s2);
    c.lineTo(s2,s2*.74);c.lineTo(-s2*.72,s2);c.closePath();
    c.fillStyle=A(T[0],Math.max(0,.95*al));c.fill();
    c.strokeStyle=A(T[1],Math.max(0,.85*al));c.lineWidth=1.0;c.stroke();
    c.beginPath();c.moveTo(-s2*.55,-s2*.30);c.lineTo(s2*.60,-s2*.52);
    c.lineTo(s2*.66,s2*.30);c.lineTo(-s2*.40,s2*.52);c.closePath();
    c.fillStyle=A(T[1],Math.max(0,.60*al));c.fill();
    if(glow>0){c.beginPath();c.moveTo(-s2*.45,-s2*.30);c.lineTo(s2*.50,-s2*.42);
      c.lineTo(s2*.42,s2*.35);c.closePath();
      c.fillStyle=A(T[2],Math.max(0,glow*.85*al));c.fill();}
    c.restore();};
  for(let i=0;i<11;i++){
    const sd=i*4.7,per=3.0+hash(sd)*1.6;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*1.10;
    const at=(q)=>[bx+Math.sin(t*.95+i*1.9)*RR*.20*q,
                   cy+RR*.58-(q*.78+q*q*1.00)*RR*1.00];
    // ① 자국 — **위상이 늦다.** 늘 조각 아래에 있고 먼저 그려 뒤로 깔린다.
    const ud=u-.20;
    if(ud>.12){const q=Math.min(1,(ud-.12)/.88),p0=at(ud);
      puff(p0[0],p0[1],RR*(.11+.16*q),sd+5.1,
        Math.max(0,1-q)*.52,Math.max(0,.20-q*.6));}
    const p=at(u);
    // ② 독 — 아직 초록. 작고 단단한 방울이라 떠도는 안개(장 瘴)와 안 겹친다.
    if(u<.28){const q=u/.28,rr=RR*(.058+.044*q);
      fillPoly(c,jagPoly(p[0],p[1],rr,6,sd,1.25),A(TX[0],Math.max(0,1-q)*.95));
      fillPoly(c,jagPoly(p[0],p[1],rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q*1.15)*.80));}
    // ③ 불붙는 한 점 — 기본이라 3안보다 작고 짧다. 불혀(celSpike)는 안 세운다.
    const burn=Math.max(0,1-Math.abs(u-.30)/.12);
    if(burn>0){c.save();c.globalCompositeOperation="lighter";
      const gf=c.createRadialGradient(p[0],p[1],0,p[0],p[1],RR*.20*burn+2);
      gf.addColorStop(0,A(EM[2],Math.max(0,burn*.38)));
      gf.addColorStop(.4,A(EM[1],Math.max(0,burn*.24)));
      gf.addColorStop(1,A(EM[0],0));
      c.fillStyle=gf;c.beginPath();c.arc(p[0],p[1],RR*.20*burn+2,0,TAU);c.fill();
      c.restore();}
    // ④ 재 — 여기가 주인공이다. 팔랑거리고 아래쪽은 아직 빨갛다.
    if(u>.26){const q=Math.min(1,(u-.26)/.74);
      const s2=RR*(.060+.050*hash(sd*13.7))*(1-q*.22);
      const fl=Math.abs(Math.cos(t*(2.2+hash(sd*11.1)*2.4)+i));
      flake(p[0],p[1],s2,t*.7+i*1.9,fl*.85+.15,
        Math.max(0,1-q)*(q<.10?q/.10:1),Math.max(0,1-q*3.0));}}}]);

// 9안 — 뭉게가 **사건**이다. 불붙는 그 한 순간에만 한 뭉치 피고 곧 없다.
FVSET.smoke.push(["**불붙을 때만 한 뭉치 핀다** — 뭉게는 그 한 순간뿐이고 나머지는 전부 재다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  const puff=(x,y,rr,sd,al,lit)=>{
    fillPoly(c,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.55*al)));
    fillPoly(c,puffPoly(x-rr*.10,y-rr*.14,rr*.60,7,sd+1.7),A(T[1],Math.max(0,.52*al)));
    if(lit>0)fillPoly(c,puffPoly(x-rr*.16,y-rr*.24,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.55)));};
  const flake=(x,y,s2,rot,sq,al,glow)=>{
    c.save();c.translate(x,y);c.rotate(rot);c.scale(sq,1);
    c.beginPath();c.moveTo(-s2,-s2*.62);c.lineTo(s2*.86,-s2);
    c.lineTo(s2,s2*.74);c.lineTo(-s2*.72,s2);c.closePath();
    c.fillStyle=A(T[0],Math.max(0,.95*al));c.fill();
    c.strokeStyle=A(T[1],Math.max(0,.85*al));c.lineWidth=1.0;c.stroke();
    c.beginPath();c.moveTo(-s2*.55,-s2*.30);c.lineTo(s2*.60,-s2*.52);
    c.lineTo(s2*.66,s2*.30);c.lineTo(-s2*.40,s2*.52);c.closePath();
    c.fillStyle=A(T[1],Math.max(0,.60*al));c.fill();
    if(glow>0){c.beginPath();c.moveTo(-s2*.45,-s2*.30);c.lineTo(s2*.50,-s2*.42);
      c.lineTo(s2*.42,s2*.35);c.closePath();
      c.fillStyle=A(T[2],Math.max(0,glow*.85*al));c.fill();}
    c.restore();};
  for(let i=0;i<11;i++){
    const sd=i*4.7,per=3.0+hash(sd)*1.6;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*1.10;
    const x=bx+Math.sin(t*.95+i*1.9)*RR*.20*u;
    const y=cy+RR*.58-(u*.78+u*u*1.00)*RR*1.00;
    // ① 독 방울
    if(u<.28){const q=u/.28,rr=RR*(.058+.044*q);
      fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,1-q)*.95));
      fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q*1.15)*.80));}
    // ② 뭉게 — **불붙는 창(窓)에만.** 종형이라 폈다가 곧 사라진다. 재보다
    //    **먼저** 그려 뒤로 깔린다 — 뭉게가 앞에 오면 조각이 묻힌다.
    const bu=(u-.27)/.32;
    if(bu>0&&bu<1){const e=Math.sin(Math.PI*bu);
      puff(x,y+RR*.03,RR*(.12+.16*bu),sd+5.1,Math.max(0,e*.60),Math.max(0,.28-bu*.7));}
    // ③ 불붙는 한 점 — 뭉게가 피는 이유다. 여기만 뜨겁다.
    const burn=Math.max(0,1-Math.abs(u-.30)/.12);
    if(burn>0){c.save();c.globalCompositeOperation="lighter";
      const gf=c.createRadialGradient(x,y,0,x,y,RR*.22*burn+2);
      gf.addColorStop(0,A(EM[2],Math.max(0,burn*.42)));
      gf.addColorStop(.4,A(EM[1],Math.max(0,burn*.26)));
      gf.addColorStop(1,A(EM[0],0));
      c.fillStyle=gf;c.beginPath();c.arc(x,y,RR*.22*burn+2,0,TAU);c.fill();c.restore();}
    // ④ 재 — 뭉게가 걷힌 자리에 남는 것
    if(u>.30){const q=Math.min(1,(u-.30)/.70);
      const s2=RR*(.060+.050*hash(sd*13.7))*(1-q*.22);
      const fl=Math.abs(Math.cos(t*(2.2+hash(sd*11.1)*2.4)+i));
      flake(x,y,s2,t*.7+i*1.9,fl*.85+.15,
        Math.max(0,1-q)*(q<.10?q/.10:1),Math.max(0,1-q*2.6));}}}]);

// 10안 — 뭉게가 **끝**이다. 재가 다 삭으면 그 자리에서 풀려 흩어진다.
FVSET.smoke.push(["**재가 끝에 가서 풀린다** — 팔랑거리던 조각이 삭으며 옅은 뭉게로 흩어진다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  const puff=(x,y,rr,sd,al,lit)=>{
    fillPoly(c,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.54*al)));
    fillPoly(c,puffPoly(x-rr*.10,y-rr*.14,rr*.60,7,sd+1.7),A(T[1],Math.max(0,.52*al)));
    if(lit>0)fillPoly(c,puffPoly(x-rr*.16,y-rr*.24,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.55)));};
  const flake=(x,y,s2,rot,sq,al,glow)=>{
    c.save();c.translate(x,y);c.rotate(rot);c.scale(sq,1);
    c.beginPath();c.moveTo(-s2,-s2*.62);c.lineTo(s2*.86,-s2);
    c.lineTo(s2,s2*.74);c.lineTo(-s2*.72,s2);c.closePath();
    c.fillStyle=A(T[0],Math.max(0,.95*al));c.fill();
    c.strokeStyle=A(T[1],Math.max(0,.85*al));c.lineWidth=1.0;c.stroke();
    c.beginPath();c.moveTo(-s2*.55,-s2*.30);c.lineTo(s2*.60,-s2*.52);
    c.lineTo(s2*.66,s2*.30);c.lineTo(-s2*.40,s2*.52);c.closePath();
    c.fillStyle=A(T[1],Math.max(0,.60*al));c.fill();
    if(glow>0){c.beginPath();c.moveTo(-s2*.45,-s2*.30);c.lineTo(s2*.50,-s2*.42);
      c.lineTo(s2*.42,s2*.35);c.closePath();
      c.fillStyle=A(T[2],Math.max(0,glow*.85*al));c.fill();}
    c.restore();};
  for(let i=0;i<11;i++){
    const sd=i*4.7,per=3.2+hash(sd)*1.6;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*1.10;
    const x=bx+Math.sin(t*.95+i*1.9)*RR*.20*u;
    // 풀리는 자리가 칸 위로 안 빠지게 상승을 줄인다 — 끝은 몸 가까이에 둔다
    const y=cy+RR*.58-(u*.66+u*u*.80)*RR*1.00;
    // ① 독 방울 → ② 불붙는 한 점 (3안의 단계 그대로, 세기만 낮춰)
    if(u<.26){const q=u/.26,rr=RR*(.058+.044*q);
      fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,1-q)*.95));
      fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q*1.15)*.80));}
    const burn=Math.max(0,1-Math.abs(u-.28)/.11);
    if(burn>0){c.save();c.globalCompositeOperation="lighter";
      const gf=c.createRadialGradient(x,y,0,x,y,RR*.20*burn+2);
      gf.addColorStop(0,A(EM[2],Math.max(0,burn*.38)));
      gf.addColorStop(.4,A(EM[1],Math.max(0,burn*.24)));
      gf.addColorStop(1,A(EM[0],0));
      c.fillStyle=gf;c.beginPath();c.arc(x,y,RR*.20*burn+2,0,TAU);c.fill();c.restore();}
    // ③ 풀린 뒤 — 조각이 사라진 **그 자리에서만** 뭉게가 부푼다. 조각보다
    //    먼저 그려야 「조각이 남긴 것」으로 읽힌다(위에 얹으면 덮개가 된다).
    if(u>.64){const q=(u-.64)/.36;
      puff(x,y-RR*.03*q,RR*(.13+.19*q),sd+5.1,
        Math.max(0,Math.sin(Math.PI*Math.min(1,q)))*.62,0);}
    // ④ 재 — 뜨다가 **삭는다.** 마지막 3분의 1에서 알파가 빠진다.
    if(u>.24){const q=Math.min(1,(u-.24)/.76);
      const s2=RR*(.060+.050*hash(sd*13.7))*(1-q*.40);
      const fl=Math.abs(Math.cos(t*(2.2+hash(sd*11.1)*2.4)+i));
      const fade=q<.58?1:Math.max(0,1-(q-.58)/.30);
      flake(x,y,s2,t*.7+i*1.9,fl*.85+.15,
        Math.max(0,fade)*(q<.10?q/.10:1),Math.max(0,1-q*3.0));}}}]);

// 11안 — 뭉게가 **자리**다. 몸에 감겨 끓는 것만 뭉게이고, 빠져나가는 건 재뿐.
FVSET.smoke.push(["**몸에 얕게 감겨 끓고, 빠져나가는 건 재뿐이다** — 뭉게는 몸을 떠나지 않는다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  // 인자로 캔버스를 받는다 — 아래를 지나는 뭉게는 front 로 **몸 위에** 얹어야
  // 감긴 것으로 보인다. 뒤로만 깔면 「뒤에 있는 구름」이 된다.
  const puff=(cc,x,y,rr,sd,al)=>{
    fillPoly(cc,puffPoly(x,y,rr,7,sd,.88),A(T[0],Math.max(0,.54*al)));
    fillPoly(cc,puffPoly(x-rr*.10,y-rr*.12,rr*.60,7,sd+1.7,.88),A(T[1],Math.max(0,.52*al)));};
  const flake=(x,y,s2,rot,sq,al,glow)=>{
    c.save();c.translate(x,y);c.rotate(rot);c.scale(sq,1);
    c.beginPath();c.moveTo(-s2,-s2*.62);c.lineTo(s2*.86,-s2);
    c.lineTo(s2,s2*.74);c.lineTo(-s2*.72,s2);c.closePath();
    c.fillStyle=A(T[0],Math.max(0,.95*al));c.fill();
    c.strokeStyle=A(T[1],Math.max(0,.85*al));c.lineWidth=1.0;c.stroke();
    c.beginPath();c.moveTo(-s2*.55,-s2*.30);c.lineTo(s2*.60,-s2*.52);
    c.lineTo(s2*.66,s2*.30);c.lineTo(-s2*.40,s2*.52);c.closePath();
    c.fillStyle=A(T[1],Math.max(0,.60*al));c.fill();
    if(glow>0){c.beginPath();c.moveTo(-s2*.45,-s2*.30);c.lineTo(s2*.50,-s2*.42);
      c.lineTo(s2*.42,s2*.35);c.closePath();
      c.fillStyle=A(T[2],Math.max(0,glow*.85*al));c.fill();}
    c.restore();};
  // ① 감긴 뭉게 — **몸의 곡선을 따라간다.** 가로로 늘어놓으면 발밑에 지형이
  //    생기므로 반지름을 제각각 두고 원을 타게 한다. 숨 쉬듯 굵기만 변한다.
  const fore=[];
  for(let i=0;i<5;i++){
    // ⚠️ 아래 반원에만 두면 **발밑 둔덕**이 된다(2026-08-10 렌더 판정).
    // 원의 4분의 3(-.12π~1.30π)을 감아 올려야 지형이 아니라 「감긴 것」이다.
    const a2=Math.PI*(-.12+1.42*(i/4))+Math.sin(t*.32+i*1.3)*.11;
    const rad=RR*(.54+.11*hash(i*5.3));
    const br=RR*(.115+.045*hash(i*7.1))*(1+.14*Math.sin(t*1.05+i*2.1));
    const x=cx+Math.cos(a2)*rad,y=cy+Math.sin(a2)*rad*.88;
    const up=Math.max(0,-Math.sin(a2));            // 위로 올라간 것은 더 옅게
    const al=(.46+.14*Math.sin(t*.9+i*1.7))*(1-up*.45);
    const dn=Math.sin(a2)>.45;
    const d=(cc)=>puff(cc,x,y,br,i*3.7,Math.max(0,dn?al*.72:al));
    if(dn)fore.push(d);else d(c);}
  // ② 감긴 자리에서 독이 끓는다 — 초록은 **알갱이에만**(코어엔 안 넣는다)
  for(let i=0;i<5;i++){
    const sd=i*6.1,per=2.4+hash(sd)*1.0;
    const q=((t+hash(sd*2.1)*per)%per)/per;
    const a2=Math.PI*(.14+.72*hash(sd*3.3))+Math.sin(t*.5+i)*.12;
    const x=cx+Math.cos(a2)*RR*.56,y=cy+Math.sin(a2)*RR*.50-q*RR*.16;
    const rr=RR*(.050+.032*q),al=Math.max(0,1-q)*.9;
    fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
    fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));}
  // ③ 빠져나가는 재 — 감긴 뭉게가 태운 것이 위로 빠진다.
  for(let i=0;i<9;i++){
    const sd=i*4.7+1.3,per=2.8+hash(sd)*1.4;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*.90;
    const x=bx+Math.sin(t*.9+i*1.9)*RR*.18*u;
    const y=cy+RR*.26-(u*.82+u*u*.95)*RR*1.00;
    const burn=Math.max(0,1-Math.abs(u-.12)/.10);
    if(burn>0){c.save();c.globalCompositeOperation="lighter";
      const gf=c.createRadialGradient(x,y,0,x,y,RR*.17*burn+2);
      gf.addColorStop(0,A(EM[2],Math.max(0,burn*.34)));
      gf.addColorStop(.4,A(EM[1],Math.max(0,burn*.22)));
      gf.addColorStop(1,A(EM[0],0));
      c.fillStyle=gf;c.beginPath();c.arc(x,y,RR*.17*burn+2,0,TAU);c.fill();c.restore();}
    if(u>.10){const q=Math.min(1,(u-.10)/.90);
      const s2=RR*(.055+.045*hash(sd*13.7))*(1-q*.22);
      const fl=Math.abs(Math.cos(t*(2.2+hash(sd*11.1)*2.4)+i));
      flake(x,y,s2,t*.7+i*1.9,fl*.85+.15,
        Math.max(0,1-q)*(q<.10?q/.10:1),Math.max(0,1-q*3.0));}}
  front((cc)=>{for(const d of fore)d(cc);});}]);

// 12안 — 뭉게가 **드문 사건**이다. 대부분은 재뿐이고 가끔 한 뭉치가 통째로 뜬다.
FVSET.smoke.push(["**가끔 한 뭉치가 통째로 오른다** — 나머지 시간은 재뿐이라 뭉게가 사건이 된다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  const puff=(x,y,rr,sd,al,lit)=>{
    fillPoly(c,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.60*al)));
    fillPoly(c,puffPoly(x-rr*.10,y-rr*.14,rr*.60,7,sd+1.7),A(T[1],Math.max(0,.56*al)));
    if(lit>0)fillPoly(c,puffPoly(x-rr*.16,y-rr*.24,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.55)));};
  const flake=(x,y,s2,rot,sq,al,glow)=>{
    c.save();c.translate(x,y);c.rotate(rot);c.scale(sq,1);
    c.beginPath();c.moveTo(-s2,-s2*.62);c.lineTo(s2*.86,-s2);
    c.lineTo(s2,s2*.74);c.lineTo(-s2*.72,s2);c.closePath();
    c.fillStyle=A(T[0],Math.max(0,.95*al));c.fill();
    c.strokeStyle=A(T[1],Math.max(0,.85*al));c.lineWidth=1.0;c.stroke();
    c.beginPath();c.moveTo(-s2*.55,-s2*.30);c.lineTo(s2*.60,-s2*.52);
    c.lineTo(s2*.66,s2*.30);c.lineTo(-s2*.40,s2*.52);c.closePath();
    c.fillStyle=A(T[1],Math.max(0,.60*al));c.fill();
    if(glow>0){c.beginPath();c.moveTo(-s2*.45,-s2*.30);c.lineTo(s2*.50,-s2*.42);
      c.lineTo(s2*.42,s2*.35);c.closePath();
      c.fillStyle=A(T[2],Math.max(0,glow*.85*al));c.fill();}
    c.restore();};
  // ① 뭉치 하나 — **4.4초에 한 번.** 매번 다른 자리에서 독 방울이 부풀고
  //    불붙어 한 덩이가 되어 오른다. 하나뿐이라 커도 시끄럽지 않다.
  {const per=4.0,n0=Math.floor((t+1.1)/per),ev=((t+1.1)%per)/per;
   const sd=n0*7.3;
   const bx=cx+(hash(sd)-.5)*RR*.78;
   if(ev<.80){const q=ev/.80;
     const x=bx+Math.sin(t*.7+n0)*RR*.13*q;
     const y=cy+RR*.44-(q*.80+q*q*.86)*RR*.98;
     // 독 방울 → 불 → 뭉게. 3안의 단계를 **한 번만** 보여준다.
     if(q<.14){const q2=q/.14,rr=RR*(.070+.050*q2);
       fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,1-q2)*.95));
       fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q2*1.15)*.80));}
     const burn=Math.max(0,1-Math.abs(q-.16)/.09);
     if(burn>0){c.save();c.globalCompositeOperation="lighter";
       const gf=c.createRadialGradient(x,y,0,x,y,RR*.24*burn+2);
       gf.addColorStop(0,A(EM[2],Math.max(0,burn*.44)));
       gf.addColorStop(.4,A(EM[1],Math.max(0,burn*.28)));
       gf.addColorStop(1,A(EM[0],0));
       c.fillStyle=gf;c.beginPath();c.arc(x,y,RR*.24*burn+2,0,TAU);c.fill();c.restore();}
     if(q>.13){const q2=(q-.13)/.87;
       puff(x,y,RR*(.16+.21*q2),sd+5.1,
         Math.max(0,1-q2*1.05)*(q2<.14?q2/.14:1)*.70,Math.max(0,.26-q2*.8));
       // 뭉치에서 떨어져 나온 재 — 뭉게와 재를 **한 몸**으로 묶는다
       for(let k=0;k<3;k++){
         const a2=k/3*TAU+n0+q2*1.6,d2=RR*(.18+.30*q2);
         const s2=RR*.048*(1-q2*.3);
         flake(x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,s2,t*.8+k*2.1,
           Math.abs(Math.cos(t*2.4+k))*.85+.15,
           Math.max(0,1-q2*1.2)*.9,Math.max(0,.5-q2*1.4));}}}}
  // ② 그 사이를 채우는 것 — **재뿐이다.** 뭉치가 없는 동안 화면이 비면
  //    사건이 아니라 「끊긴 것」으로 보인다.
  for(let i=0;i<11;i++){
    const sd=i*4.7,per=3.0+hash(sd)*1.6;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*1.15;
    const x=bx+Math.sin(t*.95+i*1.9)*RR*.20*u;
    const y=cy+RR*.60-(u*.80+u*u*1.00)*RR*1.00;
    if(u<.22){const q=u/.22,rr=RR*(.052+.040*q);
      fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,1-q)*.90));
      fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q*1.15)*.75));}
    if(u>.20){const q=Math.min(1,(u-.20)/.80);
      const s2=RR*(.060+.050*hash(sd*13.7))*(1-q*.22);
      const fl=Math.abs(Math.cos(t*(2.2+hash(sd*11.1)*2.4)+i));
      flake(x,y,s2,t*.7+i*1.9,fl*.85+.15,
        Math.max(0,1-q)*(q<.10?q/.10:1),Math.max(0,1-q*3.0));}}}]);

// ── 연 발현 후보 — 3안 + 4안 합본 다섯 (2026-08-10) ──────────────────
// ── 연(煙) 융화발현 — **4안(감고 도는 타르) × 3안(뭉게구름·단계)** 합본 다섯
// (2026-08-10 요청). 주(主)는 **4안**이다: 검은 타르가 몸을 감고 돌다 드물게
// 크게 터진다. 3안의 **뭉게구름**은 거들 뿐이고, 뭉게가 주가 되면 실패다.
//
// ⚠️ 뭉게구름도 **타르 팔레트**로만 그린다 — 바깥 검붉음(타는 테) / 안 거의
// 검정 / 심만 주황. 초록은 바닥빛(tarGlow)과 날아다니는 알갱이에만 남는다.
// ⚠️ 터짐은 **드물고 크게**. 촘촘히 터지면 끓는 게 아니라 떠는 것으로 보인다.

FVSET.smoke.push(["**터진 자리에서만 연기가 난다** — 감고 돌던 타르가 드물게 크게 터지고, 그 자리에서만 검은 뭉게가 한 덩이 오른다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  // 뭉게 한 덩이 — 3안의 puffPoly 실루엣을 타르 색으로 옮긴 것. 바깥이
  // 타는 검붉음이라 검은 배경에서 실루엣이 나고, 속은 거의 검정이다.
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.70*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.76,7,sd+1.7),A(T[1],Math.max(0,.90*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.85)));};
  const back=[],fore=[];
  for(let i=0;i<15;i++){
    const sp=.26+.16*hash(i*3.1);
    const az=t*sp+i/15*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.36;
    const rad=RR*(.46+.28*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    // 주기를 더 늘리고 터지는 구간을 더 짧게 — 대부분은 그냥 매달려 자라고
    // **가끔** 하나가 크게 터진다.
    const per=3.0+2.0*hash(i*5.3);
    const u=(t/per+hash(i*8.9))%1;
    const grow=u<.88?ease(u/.88):1, pop=u<.88?0:(u-.88)/.12;
    const rr=RR*(.125+.115*grow)*(1+pop*.70);
    const burn=.28+.72*pop;
    // 연기의 목숨은 **터짐에 종속**된다 — 터진 뒤부터 다음 주기 앞머리까지만
    // 산다. 그래서 뭉게는 언제나 「방금 터진 자리」의 증거일 뿐이다.
    const sm=u>=.88?(u-.88)/.12*.30:(u<.20?.30+(u/.20)*.70:-1);
    const draw=(cc)=>{
      if(sm>=0){const q=ease(sm);
        puff(cc,x+Math.sin(t*.9+i*2.1)*RR*.06*q, y-q*RR*.52, rr*(.80+1.05*q),
          Math.max(0,(1-q)*.50*dz), Math.max(0,.55-q*2.0), i*3.1+11);}
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.55)),i*3.1);
      if(pop>.12)for(let k=0;k<7;k++){          // 터진 방울 — 드물게, 크게
        const a2=k/7*TAU+i, d2=rr*(1.2+pop*1.4);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  // 독 알갱이 — 검은 타르 사이에서 초록이 튀어 「무엇이 타고 있는지」를 말한다.
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**감고 돈 자리에 연기가 남는다** — 타르가 지나간 궤도 뒤로 검은 뭉게가 늘어져, 감은 띠가 두꺼워진다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.60*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.82,7,sd+1.7),A(T[1],Math.max(0,.92*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.18,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.8)));};
  const back=[],fore=[];
  for(let i=0;i<12;i++){
    const sp=.26+.14*hash(i*3.1);
    const az=t*sp+i/12*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34;
    const rad=RR*(.48+.26*hash(i*6.1));
    const per=3.2+2.0*hash(i*5.3);
    const u=(t/per+hash(i*8.9))%1;
    const grow=u<.86?ease(u/.86):1, pop=u<.86?0:(u-.86)/.14;
    const rr=RR*(.130+.115*grow)*(1+pop*.70);
    const burn=.28+.72*pop;
    // 꼬리 — **지나온 자리**(방위를 뒤로 돌린 곳)에 남는다. 궤도를 그대로
    // 타므로 앞뒤도 제 몫대로 갈리고, 그래서 감은 띠가 두꺼워진다.
    //
    // ⚠️ 처음엔 열한 덩이 전부에 세 마디씩 달았다가 **칸이 통째로 붉은 구름**이
    // 됐다(렌더 판정). 뭉게는 거들기만 해야 하므로 ⑴ 절반만 꼬리를 달고
    // ⑵ 두 마디로 줄이고 ⑶ 알파를 반으로 내렸다.
    if(i%2===0)for(let k=1;k<=2;k++){
      const az2=az-k*.34;
      const x2=cx+Math.cos(az2)*rad, y2=cy+lat*RR+Math.sin(az2)*rad*.24-k*RR*.050;
      const z2=Math.sin(az2), dz2=.60+.40*(z2*.5+.5);
      const rr2=rr*(1.00+k*.30), al2=Math.max(0,.19-k*.055)*dz2;
      (z2>0?fore:back).push((cc)=>puff(cc,x2,y2,rr2,al2,k===1?.18*pop:0,i*3.1+k*5.7));}
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const draw=(cc)=>{
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.55)),i*3.1);
      if(pop>.12)for(let k=0;k<7;k++){
        const a2=k/7*TAU+i, d2=rr*(1.2+pop*1.4);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  for(let i=0;i<8;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.26*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**아래서 끓고 위로 연기가 오른다** — 몸을 감은 타르가 끓고, 끓어 나온 초록이 불붙어 갈색이 되어 오른다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],EM=TONE.ember,TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.70*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.76,7,sd+1.7),A(T[1],Math.max(0,.90*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.85)));};
  // ① 궤도 — 여전히 주(主)다. 다만 무게가 **아래**에 실려 「끓는 바닥」이 된다.
  const back=[],fore=[];
  for(let i=0;i<14;i++){
    const sp=.26+.15*hash(i*3.1);
    const az=t*sp+i/14*TAU;
    const lat=.11+Math.sin(t*.6+i*1.3)*.30;
    const rad=RR*(.46+.28*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const per=2.9+1.9*hash(i*5.3);
    const u=(t/per+hash(i*8.9))%1;
    const grow=u<.87?ease(u/.87):1, pop=u<.87?0:(u-.87)/.13;
    const rr=RR*(.125+.115*grow)*(1+pop*.70);
    const burn=.28+.72*pop;
    const draw=(cc)=>{
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.55)),i*3.1);
      if(pop>.12)for(let k=0;k<7;k++){
        const a2=k/7*TAU+i, d2=rr*(1.2+pop*1.4);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  // ② 오르는 것 — 3안의 세 단계(초록 → 불붙음 → 갈색 연기). **연기 양을
  // 늘린다**(2026-08-10 요청): 알 8 → 14, 구름 크기·알파 상향. 다만 기둥이
  // 서면 3안이 주가 되므로 **높이는 그대로** 두고 폭과 짙기만 키운다.
  for(let i=0;i<14;i++){
    const sd=i*4.7, per=2.9+hash(sd)*1.5;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const bx=cx+(hash(sd*3.3)-.5)*RR*1.18;
    const x=bx+Math.sin(t*.95+i*1.9)*RR*.18*u;
    const y=cy+RR*.48-(u*.72+u*u*1.05)*RR*.94;
    if(u<.26){const q=u/.26, rr=RR*(.058+.042*q);
      fillPoly(c,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,1-q)*.95));
      fillPoly(c,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,1-q*1.15)*.80));}
    const burn=Math.max(0,1-Math.abs(u-.29)/.13);
    if(burn>0){
      c.save();c.globalCompositeOperation="lighter";
      const gf=c.createRadialGradient(x,y,0,x,y,RR*.22*burn+2);
      gf.addColorStop(0,A(EM[2],Math.max(0,burn*.42)));
      gf.addColorStop(.4,A(EM[1],Math.max(0,burn*.26)));
      gf.addColorStop(1,A(EM[0],0));
      c.fillStyle=gf;c.beginPath();c.arc(x,y,RR*.22*burn+2,0,TAU);c.fill();c.restore();
      for(let k=0;k<4;k++)
        celSpike(c,x,y,k/4*TAU+t*2.2+i,RR*(.06+.10*burn),RR*.026,"ember",burn*.65);}
    // 오른 것이 **몸에서 떨어져 나가면** 위에 뜬 딴 구름이 된다(렌더 판정).
    // 높이를 낮추고(위 y 식) 알파를 내려 꼬리가 몸에 붙어 있게 둔다.
    if(u>.25){const q=Math.min(1,(u-.25)/.75);
      puff(c,x,y,RR*(.17+.34*q),Math.max(0,1-q*.62)*(q<.15?q/.15:1)*.62,
        Math.max(0,.34-q*1.2),sd+5.1);}}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**연기 속에서 타르가 돈다** — 검은 뭉게가 몸을 두껍게 감싸고, 그 앞뒤를 타르 덩이가 뚫고 돌다 터진다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.66*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.80,7,sd+1.7),A(T[1],Math.max(0,.90*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.16,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.8)));};
  const back=[],fore=[];
  // ① 뭉게 — 크고 **아주 느리다**. 부피만 만들고 아무 사건도 일으키지 않아
  // 거들기에 머문다. 앞으로 온 것은 옅게 — 몸을 덮으면 안 된다.
  // ⚠️ 넷을 크게 두니 붉은 테가 서로 겹쳐 **타르보다 뭉게가 세졌다**(렌더
  // 판정). 셋으로 줄이고 알파를 내려 부피만 남긴다.
  for(let g=0;g<3;g++){
    const az=t*.17+g/3*TAU;
    const rad=RR*.62;
    const x=cx+Math.cos(az)*rad, y=cy+Math.sin(t*.4+g*2.1)*RR*.15+Math.sin(az)*rad*.30;
    const z=Math.sin(az), dz=z>0?.30:.58;
    const rr=RR*(.36+.07*Math.sin(t*.8+g*1.7));
    (z>0?fore:back).push((cc)=>puff(cc,x,y,rr,dz*.46,0,g*7.3));}
  // ② 타르 — 뭉게보다 빠르고 밝아 **주(主)가 여기**임이 안 흔들린다.
  for(let i=0;i<13;i++){
    const sp=.30+.18*hash(i*3.1);
    const az=t*sp+i/13*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.38;
    const rad=RR*(.46+.30*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    const per=3.0+2.0*hash(i*5.3);
    const u=(t/per+hash(i*8.9))%1;
    const grow=u<.88?ease(u/.88):1, pop=u<.88?0:(u-.88)/.12;
    const rr=RR*(.130+.120*grow)*(1+pop*.75);
    const burn=.32+.68*pop;
    const draw=(cc)=>{
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.55)),i*3.1);
      if(pop>.12)for(let k=0;k<8;k++){
        const a2=k/8*TAU+i, d2=rr*(1.2+pop*1.5);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**한 번에 하나만 크게 터진다** — 나머지는 매달려 있고, 터진 하나가 검은 뭉게 기둥이 되어 오른다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.70*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.76,7,sd+1.7),A(T[1],Math.max(0,.90*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.22,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.85)));};
  // 터짐을 **전역 박자 하나**로 몬다 — 3.4 초에 딱 하나가 터진다. 끈적한 것은
  // 드물게 크게 터진다는 판정을 끝까지 민 안이다.
  // ⚠️ 한 놈만 움직이게 두니 **4안보다 조용해졌다**(렌더 판정). 터짐의 박자는
  // 그대로 두되 매달린 것들을 더 크고 더 붉게 — 세기는 「터짐」이 아니라
  // **덩이의 양**에서 나온다.
  const N=15, GP=3.4, gi=Math.floor(t/GP), gu=(t/GP)%1;
  const now=((gi*7)%N+N)%N, prev=(((gi-1)*7)%N+N)%N;
  const back=[],fore=[];
  for(let i=0;i<N;i++){
    const sp=.24+.14*hash(i*3.1);
    const az=t*sp+i/N*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.36;
    const rad=RR*(.46+.30*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    // 차례가 온 놈만 부풀다 터진다. 나머지는 **그냥 숨만 쉰다.**
    const mine=i===now;
    const swell=mine?ease(Math.min(1,gu/.62)):.5+.5*Math.sin(t*.85+i*1.9);
    const pop=mine?Math.max(0,(gu-.62)/.38):0;
    const rr=RR*(.140+(mine?.170:.075)*swell)*(1+pop*1.05);
    const burn=(mine?.40:.34)+.60*pop;
    // 연기 한 줄기 — 터진 놈 것이 다음 차례까지 이어져 **끊기지 않는다**.
    const sm=mine?(pop>0?pop*.42:-1):(i===prev?.42+gu*.58:-1);
    const draw=(cc)=>{
      if(sm>=0){const q=ease(Math.min(1,sm));
        puff(cc,x+Math.sin(t*.8+i*2.1)*RR*.07*q, y-q*RR*.66, RR*(.18+.36*q),
          Math.max(0,(1-q*.92)*.58*dz), Math.max(0,.60-q*2.2), i*3.1+11);}
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.50)),i*3.1);
      if(pop>.08)for(let k=0;k<9;k++){       // 한 번뿐이라 **크게** 흩뿌린다
        const a2=k/9*TAU+i, d2=rr*(1.2+pop*1.6);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

// ── 연 발현 **대안** 다섯 — 축이 전부 다르다 (2026-08-10) ────────────
// ── 연(煙) 융화발현 — **4안(감고 도는 타르) × 3안(뭉게구름)** 합본 다섯
// (2026-08-10, 2차). 1차로 낸 다섯은 이미 vfx.js 6103~6402 에 들어갔고 그중
// 「아래서 끓고 위로」가 **발현으로 확정**(FVFIX.smoke.mani=15)됐다. 그래서
// 이 다섯은 **그것들과 겹치지 않는 축**으로만 다시 뽑은 것이다:
//   ① 구조(겹) ② 박자(다 같이) ③ 박자(연쇄) ④ 운동(감아 오름) ⑤ 물성(끊김)
//
// 공통 규약은 그대로다 — 첫 줄에 tarGlow, 덩이는 tarBlob, 깊이 z=sin(방위)로
// 앞뒤를 갈라 앞쪽만 front() 로 몸 위에 얹는다. 뭉게는 **타르 팔레트**로만
// 그리고(초록은 바닥빛과 알갱이에만), 터짐은 **드물고 크게** 둔다.

FVSET.smoke.push(["**두 겹으로 감긴다** — 안쪽은 타르가, 바깥쪽은 검은 연기가 서로 **반대로** 몸을 감고 돈다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.62*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.80,7,sd+1.7),A(T[1],Math.max(0,.92*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.18,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.8)));};
  const back=[],fore=[];
  // ① 안 겹 — **타르.** 빠르고 좁게 감아 이쪽이 주(主)임이 안 흔들린다.
  for(let i=0;i<14;i++){
    const sp=.32+.16*hash(i*3.1);
    const az=t*sp+i/14*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34;
    const rad=RR*(.40+.22*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.26;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    const per=3.0+2.0*hash(i*5.3);
    const u=(t/per+hash(i*8.9))%1;
    const grow=u<.88?ease(u/.88):1, pop=u<.88?0:(u-.88)/.12;
    const rr=RR*(.125+.115*grow)*(1+pop*.70);
    const burn=.30+.70*pop;
    const draw=(cc)=>{
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.55)),i*3.1);
      if(pop>.12)for(let k=0;k<7;k++){
        const a2=k/7*TAU+i, d2=rr*(1.2+pop*1.4);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  // ② 바깥 겹 — **연기.** 느리고 **반대로** 돈다. 두 겹이 서로 어긋나 스치니
  // 「두른 고리」가 아니라 감긴 것이 두 겹이라는 게 눈에 보인다. 알파를 낮게
  // 두어 부피만 내고 사건은 일으키지 않는다 — 뭉게는 거들 뿐이다.
  // ⚠️ 처음엔 일곱을 작고 옅게 두었더니 **바깥 겹이 안 보여** 그냥 4안이
  // 됐다(렌더 판정). 겹은 보이되 사건은 없어야 하므로 **크게·짙게** 하되
  // 여전히 아무것도 터뜨리지 않는다.
  for(let g=0;g<8;g++){
    const az=-t*.21+g/8*TAU;
    const rad=RR*(.70+.13*hash(g*9.7));
    const x=cx+Math.cos(az)*rad, y=cy+Math.sin(t*.45+g*1.9)*RR*.20+Math.sin(az)*rad*.26;
    const z=Math.sin(az), dz=z>0?.36:.66;
    const rr=RR*(.25+.06*Math.sin(t*.9+g*2.3));
    (z>0?fore:back).push((cc)=>puff(cc,x,y,rr,dz*.88,0,g*7.3));}
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.50+.26*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**한 호흡에 다 같이 터진다** — 감은 것이 통째로 부풀다 한꺼번에 터지고, 그때만 검은 연기가 확 인다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.68*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.78,7,sd+1.7),A(T[1],Math.max(0,.90*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.85)));};
  // **박자를 하나로 묶는다.** 열넷이 제각기 터지면 잔물결이지만 한꺼번에
  // 터지면 사건이 된다 — 「드물게 크게」의 가장 곧은 답이다. 완전히 같은
  // 위상이면 기계 같아서 개체마다 아주 조금(±.05)만 어긋내 둔다.
  const BP=3.2, br=(t/BP)%1;
  const back=[],fore=[];
  for(let i=0;i<14;i++){
    const off=(hash(i*11.3)-.5)*.10;
    const b2=Math.min(1,Math.max(0,br+off));
    const swell=ease(Math.min(1,b2/.74)), pop=Math.max(0,(b2-.74)/.26);
    const sp=.28+.14*hash(i*3.1);
    const az=t*sp+i/14*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34;
    // 고리 자체가 벌어졌다 오므라든다 — **감은 것이 통째로 숨쉰다.**
    const rad=RR*(.42+.26*hash(i*6.1))*(1+.16*swell+.26*pop);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    const rr=RR*(.120+.120*swell)*(1+pop*.55);
    const burn=.28+.72*pop;
    const draw=(cc)=>{
      if(pop>0){const q=ease(pop);      // 연기는 **이 순간에만** 있다
        puff(cc,x,y-q*RR*.30,rr*(1.0+1.5*q),Math.max(0,(1-q*.85)*.54*dz),
          Math.max(0,.55-q*1.8),i*3.1+11);}
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz*(1-pop*.50)),i*3.1);
      if(pop>.15)for(let k=0;k<7;k++){
        const a2=k/7*TAU+i, d2=rr*(1.2+pop*1.5);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.30*(1-pop*.8),
          burn,Math.max(0,dz*(1-pop)),i*7+k);}};
    (z>0?fore:back).push(draw);}
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**불이 몸을 한 바퀴 돈다** — 타는 마루가 감긴 궤도를 훑고 지나며 지나간 자리마다 검은 연기가 밀린다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.64*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.80,7,sd+1.7),A(T[1],Math.max(0,.92*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.18,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.8)));};
  // 터짐을 **자리**로 정한다 — 시각이 아니라. 마루가 지나가는 그 방위의
  // 덩이만 탄다. 한 덩이는 한 바퀴(≈11초)에 한 번만 터지니 개체로 보면
  // 아주 드물고, 화면으로 보면 **불이 몸을 돌아** 늘 무슨 일이 벌어진다.
  const wave=t*.62, back=[],fore=[];
  for(let i=0;i<15;i++){
    const sp=.26+.10*hash(i*3.1);
    const az=t*sp+i/15*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34;
    const rad=RR*(.46+.28*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    // 마루로부터의 각거리 — 가까울수록 세게 탄다
    let d=Math.abs(((az-wave)%TAU+TAU+Math.PI)%TAU-Math.PI);
    const near=Math.max(0,1-d/(TAU*.16));
    const pop=ease(near);
    // ⚠️ 마루는 **늘 누군가를 지난다.** 그래서 개체당 세기를 4안만큼 주면
    // 연기가 끊기지 않고 쌓여 칸이 구름으로 덮인다(렌더 판정). 부푸는 폭과
    // 연기 알파를 절반으로 내려 「지나가는 자국」에 머물게 둔다.
    const rr=RR*(.125+.075*Math.sin(t*.8+i*1.7)*.5+.075)*(1+pop*.45);
    const burn=.28+.72*pop;
    const draw=(cc)=>{
      // 밀려난 연기 — 마루 **뒤쪽**(방위를 되돌린 자리)에만 남는다
      if(pop>.06){const q=ease(pop);
        const az2=az-.30*q;
        const x2=cx+Math.cos(az2)*rad*1.06, y2=cy+lat*RR+Math.sin(az2)*rad*.24-q*RR*.18;
        puff(cc,x2,y2,rr*(.85+.55*q),Math.max(0,q*.30*dz),Math.max(0,.34-q*.9),i*3.1+11);}
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz),i*3.1);
      if(pop>.55)for(let k=0;k<7;k++){
        const a2=k/7*TAU+i, d2=rr*(1.1+pop*1.3);
        tarBlob(cc,x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.8,rr*.28*(1.2-pop),
          burn,Math.max(0,dz*(1.4-pop)*.7),i*7+k);}};
    (z>0?fore:back).push(draw);}
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**감아 올라가 위에서 풀린다** — 타르가 몸을 감으며 밑에서 위로 훑고 올라가, 꼭대기에 닿은 것만 연기로 풀린다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.66*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.78,7,sd+1.7),A(T[1],Math.max(0,.90*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.8)));};
  // 확정 발현(「아래서 끓고 위로」)은 **곧게** 오르지만 이쪽은 **감으면서**
  // 오른다. 오르는 것이 궤도를 떠나지 않으니 끝까지 「감싼 것」으로 남고,
  // 위에 뜬 딴 구름이 생기지 않는다.
  const back=[],fore=[];
  for(let i=0;i<16;i++){
    const ph=(t*.26+hash(i*3.1))%1;             // 0=밑, 1=꼭대기
    const az=t*.34+i/16*TAU+ph*2.2;             // 오르면서 감긴다
    const lat=.42-ph*.94;
    const rad=RR*(.52+.22*hash(i*6.1))*(1-ph*.26);   // 위로 갈수록 좁아진다
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    const fade=(ph<.10?ph/.10:1);
    // 꼭대기에 닿은 것만 **풀린다** — 타르가 연기로 바뀌는 자리가 한 군데다.
    const melt=Math.max(0,(ph-.66)/.34);
    const rr=RR*(.115+.090*Math.sin(ph*Math.PI));
    const burn=.30+.34*Math.max(0,Math.sin(t*1.3+i*2.1))+.36*melt;
    const draw=(cc)=>{
      // ⚠️ 풀리는 것이 옅으면 그냥 「타르가 도는 것」이 된다(렌더 판정).
      // 풀리는 자리는 한 군데뿐이니 거기서는 **짙게** 풀려도 뭉게가 주가 되지
      // 않는다 — 개수가 아니라 자리가 제한이다.
      if(melt>0){const q=ease(melt);
        puff(cc,x,y-q*RR*.26,rr*(1.1+2.0*q),Math.max(0,(1-q*.85)*.66*dz*fade),
          Math.max(0,.38-q*1.1),i*3.1+11);}
      if(melt<.92)
        tarBlob(cc,x,y,rr,burn,Math.max(0,dz*fade*(1-melt*.85)),i*3.1);};
    (z>0?fore:back).push(draw);}
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

FVSET.smoke.push(["**늘어졌다 끊긴다** — 감고 돌던 타르가 실처럼 늘어지고, 끊긴 그 자리에서만 검은 연기가 튄다",
function(c,cx,cy,RR,t,tn){
  tarGlow(c,cx,cy,RR,1,tn,t);
  const T=TONE[tn],TX=TONE.toxin;
  const puff=(cc,x,y,rr,al,lit,sd)=>{
    if(al<=.012)return;
    fillPoly(cc,puffPoly(x,y,rr,7,sd),A(T[0],Math.max(0,.66*al)));
    fillPoly(cc,puffPoly(x-rr*.08,y-rr*.12,rr*.78,7,sd+1.7),A(T[1],Math.max(0,.90*al)));
    if(lit>0)fillPoly(cc,puffPoly(x-rr*.14,y-rr*.20,rr*.20,5,sd+3.3),
      A(T[2],Math.max(0,lit*al*.85)));};
  // **점성.** 열여섯 중 매달리고 끊기는 물성은 타르뿐이라, 터지는 대신
  // 끊기게 두면 4안과 같은 세기를 다른 얼굴로 낸다. 끊기는 것도 드물고
  // 크게 — 늘어지는 데 대부분의 시간을 쓴다(u<.78).
  // 다섯 중 제일 조용해 확정 발현에 밀렸다(렌더 판정) — 개수와 덩이를 키운다.
  const back=[],fore=[];
  for(let i=0;i<15;i++){
    const sp=.26+.14*hash(i*3.1);
    const az=t*sp+i/15*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.30;
    const rad=RR*(.46+.28*hash(i*6.1));
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.62+.38*(z*.5+.5);
    const per=3.2+2.0*hash(i*5.3);
    const u=(t/per+hash(i*8.9))%1;
    const pull=u<.78?ease(u/.78):1;               // 늘어짐
    const snap=u<.78?0:(u-.78)/.22;               // 끊김
    const sag=RR*(.10+.38*pull)*(1-snap*.35);
    const rr=RR*(.140+.060*pull)*(1-snap*.30);
    const burn=.30+.28*Math.max(0,Math.sin(t*1.4+i*2.1))+.42*snap;
    const draw=(cc)=>{
      // 실 — 끊기면 위아래로 튕겨 짧아진다
      // ⚠️ 실을 획(celStroke) 하나로 그으니 **빛나는 주황 막대**가 됐다 —
      // `tn` 이든 `tar` 든 3단 계조의 흰 앞날이 가는 선에서는 심지가 된다
      // (렌더 판정 두 번). 늘어지는 액체는 **줄어드는 방울을 꿴 것**으로
      // 그린다. 덩이와 같은 문법이라 한 몸으로 읽히고 빛나지 않는다.
      const sx=x+Math.sin(t*1.1+i)*sag*.12;
      const w=rr*(.30-.16*pull)*(1-snap);
      if(w>.5)celStroke(cc,[[x,y],[sx,y+sag]],w,"tar",Math.max(0,.34*dz*(1-snap)));
      for(let k=1;k<=3;k++){
        const q2=k/4;
        tarBlob(cc,x+(sx-x)*q2,y+sag*q2,rr*(.50-.11*k)*(1-snap*.5),
          burn*.7,Math.max(0,dz*(1-snap)*(.90-.14*k)),i*3.1+k*2.7);}
      tarBlob(cc,x,y,rr,burn,Math.max(0,dz),i*3.1);
      // 떨어진 끝 — 끊긴 방울 하나가 밑으로 떨어지며 사그라든다
      if(snap>0){const q=ease(snap);
        tarBlob(cc,x+Math.sin(t*1.1+i)*sag*.12,y+sag+q*RR*.26,rr*.62*(1-q*.6),
          burn,Math.max(0,dz*(1-q)),i*5.9);
        // 끊긴 자리 — **여기서만** 연기가 튄다
        puff(cc,x+Math.sin(t*1.1+i)*sag*.10,y+sag*.55-q*RR*.22,rr*(1.0+1.8*q),
          Math.max(0,(1-q)*.60*dz),Math.max(0,.50-q*1.7),i*3.1+11);}};
    (z>0?fore:back).push(draw);}
  for(let i=0;i<9;i++){
    const sd=i*4.7, per=2.2+hash(sd)*1.2;
    const u=((t+hash(sd*2.1)*per)%per)/per;
    const az=t*(.30+.18*hash(sd*3.1))+hash(sd*5.9)*TAU;
    const lat=Math.sin(t*.6+i*1.3)*.34-u*.30;
    const rad=RR*(.52+.28*hash(sd*6.1))*(1+u*.16);
    const x=cx+Math.cos(az)*rad, y=cy+lat*RR+Math.sin(az)*rad*.24;
    const z=Math.sin(az), dz=.60+.40*(z*.5+.5);
    const q=Math.min(1,u/.42), al=Math.max(0,1-q)*dz;
    if(al<=.03)continue;
    const rr=RR*(.055+.042*q);
    const draw=(cc)=>{
      fillPoly(cc,jagPoly(x,y,rr,6,sd,1.25),A(TX[0],Math.max(0,al*.95)));
      fillPoly(cc,jagPoly(x,y,rr*.55,6,sd+1.1,1.2),A(TX[1],Math.max(0,al*.80)));};
    (z>0?fore:back).push(draw);}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}]);

// ── 무속성 발현 후보 다섯 — **색 없이 화려해지는 법** (2026-08-10) ────
// ── 무속성 발현 후보 5 ───────────────────────────────────────────────────
//
// 무속성의 정체는 **색이 없는 빛**이고, 1안은 그것을 「둘레가 비었다」로 말한다.
// 발현은 **속성을 끝까지 안 고른 빌드의 보상**이라 아무것도 안 한 것처럼
// 보이면 안 되는데, 색을 입는 순간 무속성이 아니다. 그래서 쓸 수 있는 축은
// 색이 아니라 다섯뿐이다: **밝기 · 형태 · 개수 · 운동 · 깊이.**
// 다섯 안이 그 축을 하나씩 맡는다. 여섯 속성의 모티프(갈라진 불꽃 · 수지상
// 결정 · 껍질과 가닥 · 삼엽 · 떠나는 고리 · 먹는 둘레)는 어느 것도 안 쓴다 —
// 여기 있는 것은 전부 **빛이 색 없이 할 수 있는 일**이다.

// 1 — 밝기. 빛의 유일한 산수는 **더해진다**는 것이다. 결 하나는 있으나 마나
// 하고, 둘이 만난 자리에서만 흰색까지 탄다. 마디는 못 박히지 않고 결을 따라
// 미끄러진다(결마다 도는 속도가 달라 만나는 자리가 매번 바뀐다).
FVSET.gold.push(["겹쳐야 밝다 — 결 하나는 희미하고, 둘이 만난 자리에서만 하얗게 탄다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // 세 겹의 물결진 윤곽. 반지름 폭을 **바로 옆 것과만 겹치게** 잡는다 —
  // 셋이 전부 겹치면 마디가 수십 개로 늘어 구슬 목걸이가 된다.
  const BASE=[.84,1.00,1.16], MM=[3,4,6], SPD=[.21,-.15,.11], AMP=[.145,.145,.135];
  const rad=(i,a)=>RR*BASE[i]*(1+AMP[i]*Math.sin(MM[i]*(a-t*SPD[i])));
  // 결 자체는 **희미하다.** 가산으로 얹어 두면 겹친 자리는 손대지 않아도 밝아지고,
  // 그 위에 마디만 찍으면 「더해져서 탄다」가 그림 하나로 읽힌다.
  c.save();c.globalCompositeOperation="lighter";
  for(let i=0;i<3;i++){
    const P=[];
    for(let s=0;s<=96;s++){const a=s/96*TAU,rr=rad(i,a);
      P.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
    celStroke(c,P,5.2,tn,Math.max(0,.34+.08*Math.sin(t*1.3+i*2.1)));}  // 닫힌 것은 획
  c.restore();
  // 마디 — 두 결의 반지름이 같아지는 각. 부호가 바뀌는 자리를 찾아 보간한다.
  for(let i=0;i<2;i++){
    const j=i+1, NS=132;
    let prev=rad(i,0)-rad(j,0);
    for(let s=1;s<=NS;s++){
      const a=s/NS*TAU, d=rad(i,a)-rad(j,a);
      if((prev<0)!==(d<0)){
        const a0=(s-1)/NS*TAU, u=prev/(prev-d), aa=a0+(a-a0)*u, rr=rad(i,aa);
        const x=cx+Math.cos(aa)*rr, y=cy+Math.sin(aa)*rr;
        const bl=Math.max(0,.62+.38*Math.sin(t*3.4+aa*3+i*2.3));
        c.save();c.globalCompositeOperation="lighter";
        const g=c.createRadialGradient(x,y,0,x,y,RR*.34*bl);
        g.addColorStop(0,A(T[2],Math.max(0,.72*bl)));
        g.addColorStop(.34,A(T[1],Math.max(0,.30*bl)));
        g.addColorStop(1,A(T[1],0));
        c.fillStyle=g;c.beginPath();c.arc(x,y,RR*.34*bl,0,TAU);c.fill();c.restore();
        // 흰 심 + 십자 섬광 — 「여기가 제일 밝다」를 형태로도 말한다
        for(let k=0;k<4;k++)
          celSpike(c,x,y,k/4*TAU+aa*.5+t*.3,RR*(.075+.13*bl),2.3,tn,Math.max(0,.92*bl));
        c.beginPath();c.arc(x,y,2.2+3.0*bl,0,TAU);c.fillStyle=A(T[2],Math.max(0,bl));c.fill();}
      prev=d;}}
}]);

// 2 — 운동. 빛은 **잔상으로만 붙잡힌다.** 머리 하나가 몸을 감고 도는데 너무
// 빨라 한 바퀴 반의 자국이 아직 안 꺼져 있다. 자국이 몸의 아래를 지날 때는
// 앞으로 와 몸을 가린다 — 그래야 「두른 고리」가 아니라 **감은 것**이 된다.
FVSET.gold.push(["너무 빨라 자국만 남는다 — 거의 한 바퀴, 지나온 자리가 아직 안 꺼졌다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn];
  // [반지름, 각속도, 위상] — 반지름 + 머리 광휘가 1.5RR 을 안 넘게 잡는다
  const CM=[[1.07,2.10,0],[.82,-1.55,2.4]];
  wrapBody(c,cx,cy,RR,function(cc){
    for(let m=0;m<CM.length;m++){
      const br=CM[m][0], sp=CM[m][1], ph=CM[m][2], head=t*sp+ph;
      // 궤도는 살짝 물결진다 — 완전한 원이면 「고리」로 굳고 자국으로 안 읽힌다
      const at=(a)=>{const rr=RR*br*(1+.055*Math.sin(a*3+t*.5+m*2.1));
        return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr];};
      // ⚠️ 자국이 한 바퀴를 넘으면 **닫힌 고리**가 되어 「지나간 자리」가 아니라
      // 「두른 고리」로 보인다. 조금 못 미치게 끊어야 어디서 시작했는지가 남는다.
      const SPAN=TAU*.90, NT=44, P=[];
      for(let k=0;k<=NT;k++)P.push(at(head-SPAN*k/NT));
      // 세 번 덧그어 **머리 쪽만 진하게.** 한 번에 그리면 굵기가 고른 고리가 된다.
      celStroke(cc,P,3.0,tn,.24);
      celStroke(cc,P.slice(0,20),5.8,tn,.52);
      celStroke(cc,P.slice(0,9),9.4,tn,.95);
      const hp=at(head);
      cc.save();cc.globalCompositeOperation="lighter";
      const g=cc.createRadialGradient(hp[0],hp[1],0,hp[0],hp[1],RR*.40);
      g.addColorStop(0,A(T[2],.78));g.addColorStop(.30,A(T[1],.30));g.addColorStop(1,A(T[1],0));
      cc.fillStyle=g;cc.beginPath();cc.arc(hp[0],hp[1],RR*.40,0,TAU);cc.fill();cc.restore();
      for(let k=0;k<4;k++)
        celSpike(cc,hp[0],hp[1],k/4*TAU+head*1.3,RR*(.26+.07*Math.sin(t*9+m*2)),3.4,tn,.9);
      cc.beginPath();cc.arc(hp[0],hp[1],5.4,0,TAU);cc.fillStyle=A(T[2],1);cc.fill();
      // 떨어져 나온 빛가루 — 자국이 **식는 중**이라는 신호. 바깥으로 밀리며 꺼진다.
      for(let k=0;k<8;k++){
        const age=(t*1.5+k*.37+m*.21)%1;
        const q=at(head-SPAN*(.05+age*.55)), off=RR*.13*age;
        const dx=q[0]-cx, dy=q[1]-cy, dl=Math.hypot(dx,dy)||1;
        const x=q[0]+dx/dl*off, y=q[1]+dy/dl*off;
        cc.beginPath();cc.arc(x,y,(1.0+1.5*(1-age)),0,TAU);
        cc.fillStyle=A(T[1],Math.max(0,(1-age)*.55));cc.fill();}}
  });
}]);

// 3 — 형태. 빛이 **직선으로만 간다**는 성질을 둘레에 세운다. 안쪽 벽을 짚을
// 때마다 튕겨 되돌아오고(전반사), 짚은 자리마다 흰 섬광이 남는다. 튕기는 각이
// 매번 조금씩 달라 별 문양으로 안 굳고, 겹친 현들이 안쪽에 초선 테를 만든다.
FVSET.gold.push(["빠져나가지 못한다 — 벽을 짚을 때마다 튕겨 안으로 되돌아온다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], WR=RR*1.14, HZ=3.0, NB=6;
  const step=Math.floor(t*HZ), u=(t*HZ)%1;
  // 벽 — 아주 옅게. 짚을 것이 안 보이면 튕김이 아니라 낙서가 된다.
  const wall=[];
  for(let i=0;i<=52;i++){const a=i/52*TAU;wall.push([cx+Math.cos(a)*WR,cy+Math.sin(a)*WR]);}
  celStroke(c,wall,2.4,tn,.24);
  // 짚는 자리 — 한 번에 1.74rad 씩 도는데 매번 크게 어긋난다.
  // ⚠️ 어긋남이 작으면 정다각형으로 굳어 **도형**이 된다(각진 별을 또 그린 꼴).
  const pt=(n)=>{const a=n*1.74+(hash(n*3.1)-.5)*1.15+t*.06;
    return [cx+Math.cos(a)*WR,cy+Math.sin(a)*WR];};
  // 초선 — 현들이 스치는 안쪽 테. 현이 겹쳐 저절로 생기는 것을 살짝 도와만 준다.
  c.save();c.globalCompositeOperation="lighter";
  const gc=c.createRadialGradient(cx,cy,WR*.62,cx,cy,WR*.86);
  gc.addColorStop(0,A(T[1],0));gc.addColorStop(.62,A(T[1],.07));gc.addColorStop(1,A(T[1],0));
  c.fillStyle=gc;c.beginPath();c.arc(cx,cy,WR*.86,0,TAU);c.fill();c.restore();
  for(let k=NB;k>=0;k--){
    // ⚠️ 굵기를 알파와 같이 0 으로 보내면 옛 현이 **철사**로 남아 도형이 된다.
    // 빛은 가늘어지며 죽는 게 아니라 **흐려지며** 죽는다 — 굵기는 덜 줄인다.
    const n=step-k, age=k/NB, al=Math.max(0,Math.pow(1-age,2.1));
    const p0=pt(n), p1=pt(n+1);
    // 제일 새 현은 **그어지는 중**이다 — 다 그려져 있으면 언제 튕겼는지가 안 보인다
    const gr=k===0?u:1;
    const tip=[p0[0]+(p1[0]-p0[0])*gr,p0[1]+(p1[1]-p0[1])*gr];
    celStroke(c,[p0,tip],4.6*al+2.4,tn,Math.max(0,al*.95));
    // 짚은 자리 — 벽이 받은 만큼 되쏜다
    const fl=Math.max(0,al*(k===0?1:.8));
    if(fl>.04){
      c.save();c.globalCompositeOperation="lighter";
      const g=c.createRadialGradient(p0[0],p0[1],0,p0[0],p0[1],RR*.34*fl);
      g.addColorStop(0,A(T[2],Math.max(0,.78*fl)));g.addColorStop(1,A(T[1],0));
      c.fillStyle=g;c.beginPath();c.arc(p0[0],p0[1],RR*.34*fl,0,TAU);c.fill();c.restore();
      const inw=Math.atan2(cy-p0[1],cx-p0[0]);
      for(let s=0;s<3;s++)
        celSpike(c,p0[0],p0[1],inw+(s-1)*.85,RR*(.12+.22*fl),3.0,tn,Math.max(0,fl*.92));}
    // 달리는 앞끝 — 지금 어디까지 갔는지가 보여야 「튕겨 되돌아온다」가 사건이 된다
    if(k===0){
      c.save();c.globalCompositeOperation="lighter";
      const g2=c.createRadialGradient(tip[0],tip[1],0,tip[0],tip[1],RR*.30);
      g2.addColorStop(0,A(T[2],.60));g2.addColorStop(1,A(T[1],0));
      c.fillStyle=g2;c.beginPath();c.arc(tip[0],tip[1],RR*.30,0,TAU);c.fill();c.restore();
      c.beginPath();c.arc(tip[0],tip[1],4.0,0,TAU);c.fillStyle=A(T[2],1);c.fill();}}
}]);

// 4 — 개수. 빛은 **한 덩어리가 아니라 셀 수 없이 많은 것**이다. 알갱이가
// 구 껍질을 이루고, 반짝임이 물결로 껍질을 훑는다. 화려함이 크기가 아니라
// 개수에서만 나오는 유일한 안이다.
FVSET.gold.push(["잘게 부서져 있다 — 셀 수 없이 많은 알갱이가 껍질을 이루고 반짝임이 훑는다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NP=220, R0=RR*1.04, spin=t*.26;
  const fore=[];
  // 껍질을 묶는 옅은 테 — 없으면 알갱이가 흩어진 티끌로 보인다
  c.save();c.globalCompositeOperation="lighter";
  const gs=c.createRadialGradient(cx,cy,R0*.72,cx,cy,R0*1.12);
  gs.addColorStop(0,A(T[1],0));gs.addColorStop(.55,A(T[1],.08));gs.addColorStop(1,A(T[1],0));
  c.fillStyle=gs;c.beginPath();c.arc(cx,cy,R0*1.12,0,TAU);c.fill();c.restore();
  for(let i=0;i<NP;i++){
    // 구면 균등 분포 — 높이를 균등하게 뽑아야 위아래 극에 안 몰린다
    const zz=1-2*hash(i*1.7+.31), sr=Math.sqrt(Math.max(0,1-zz*zz));
    const th=hash(i*5.3)*TAU+spin;                 // **회전은 껍질 전체가 같은 속도**
    const x3=sr*Math.cos(th), y3=zz, z3=sr*Math.sin(th);
    const rr=R0*(.93+.12*hash(i*9.1));
    const px=cx+x3*rr, py=cy+y3*rr*.94, dz=z3*.5+.5;
    // 반짝임의 물결 — 위상이 방위에 따라 밀려 한 방향으로 지나간다
    const az=Math.atan2(z3,x3);
    const tw=Math.pow(Math.max(0,Math.sin(t*2.6+i*2.399-az*1.7)),3);
    const al=Math.max(0,(.16+.84*tw)*(.42+.58*dz));
    const sz=(.75+.95*hash(i*7.3))*(.68+.5*dz)*(1+.7*tw);
    const draw=(cc)=>{
      cc.beginPath();cc.arc(px,py,sz,0,TAU);
      cc.fillStyle=A(tw>.55?T[2]:T[1],al);cc.fill();
      if(tw>.72){                                  // 유난히 밝은 몇은 별처럼 튄다
        const f=(tw-.72)/.28;
        cc.save();cc.globalCompositeOperation="lighter";
        const g=cc.createRadialGradient(px,py,0,px,py,sz*7*f);
        g.addColorStop(0,A(T[2],Math.max(0,.42*f*dz)));g.addColorStop(1,A(T[1],0));
        cc.fillStyle=g;cc.beginPath();cc.arc(px,py,sz*7*f,0,TAU);cc.fill();cc.restore();
        for(let k=0;k<4;k++)
          celSpike(cc,px,py,k/4*TAU+.4,sz*(2.6+3.4*f),.9,tn,Math.max(0,f*.75*dz));}};
    if(z3>0)fore.push(draw);else draw(c);}
  front((cc)=>{for(const d of fore)d(cc);});
}]);

// 5 — 깊이. 빛을 **본다**는 것이 무엇인지가 이 안의 전부다: 초점면을 벗어난
// 것은 크게 번지고, 옆을 지나 초점에 드는 순간 한 점으로 맺힌다. 앞을 지나는
// 것은 몸을 가린다 — 앞뒤가 있는 유일한 안이다.
FVSET.gold.push(["초점면에서만 맺힌다 — 앞뒤로 벗어난 빛은 크게 번지고, 옆을 지날 때 한 점이 된다",
function(c,cx,cy,RR,t,tn){
  const T=TONE[tn], NM=15, fore=[];
  for(let i=0;i<NM;i++){
    // 기울어진 궤도 — 법선 하나로 평면이 정해진다. 화면과 나란하면 접시가 된다.
    const th=hash(i*3.1+.7)*TAU, ph=Math.acos(1-2*hash(i*5.7+.2));
    const nx=Math.sin(ph)*Math.cos(th), ny=Math.sin(ph)*Math.sin(th), nz=Math.cos(ph);
    const t0=Math.abs(nz)<.9?[0,0,1]:[1,0,0];
    let ax=ny*t0[2]-nz*t0[1], ay=nz*t0[0]-nx*t0[2], az2=nx*t0[1]-ny*t0[0];
    const am=Math.hypot(ax,ay,az2)||1; ax/=am;ay/=am;az2/=am;
    const bx=ny*az2-nz*ay, by=nz*ax-nx*az2, bz=nx*ay-ny*ax;
    const u=t*(.30+.26*hash(i*7.3))+hash(i*11.7)*TAU;
    const cu=Math.cos(u), su=Math.sin(u), orb=RR*(.84+.28*hash(i*5.1));
    const px=cx+(ax*cu+bx*su)*orb, py=cy+(ay*cu+by*su)*orb*.93;
    const z=az2*cu+bz*su;                          // -1(뒤) ~ +1(앞)
    const blur=Math.min(1,Math.abs(z)/.86);        // 초점면에서 멀수록 번진다
    const shp=Math.pow(1-blur,2.2);
    const dz=z*.5+.5;
    const disc=RR*(.05+.145*blur);
    const draw=(cc)=>{
      // 번진 것 — **속이 차 있고 테두리가 조금 더 밝다.** 테두리만 세우면
      // 비눗방울이 되고, 속만 채우면 회색 때가 된다. 둘 사이가 초점 밖의 빛이다.
      if(blur>.06&&shp<.55){
        cc.save();cc.globalCompositeOperation="lighter";
        const a0=Math.max(0,(.10+.07*(1-blur))*(.55+.45*dz));
        const g=cc.createRadialGradient(px,py,0,px,py,disc);
        g.addColorStop(0,A(T[1],a0*1.5));g.addColorStop(.70,A(T[1],a0));
        g.addColorStop(.92,A(T[2],Math.max(0,a0*1.7)));g.addColorStop(1,A(T[1],0));
        cc.fillStyle=g;cc.beginPath();cc.arc(px,py,disc,0,TAU);cc.fill();cc.restore();}
      // 맺힌 것 — 한 점 + 십자 섬광. **다 맺혔을 때만** 나온다(반쯤 맺힌 것에
      // 십자를 얹으면 번진 원 안에 십자가 갇혀 ⊗ 처럼 보인다).
      if(shp>.40){
        cc.save();cc.globalCompositeOperation="lighter";
        const g2=cc.createRadialGradient(px,py,0,px,py,RR*.36*shp);
        g2.addColorStop(0,A(T[2],Math.max(0,.74*shp)));
        g2.addColorStop(.34,A(T[1],Math.max(0,.22*shp)));g2.addColorStop(1,A(T[1],0));
        cc.fillStyle=g2;cc.beginPath();cc.arc(px,py,RR*.36*shp,0,TAU);cc.fill();cc.restore();
        for(let k=0;k<4;k++)
          celSpike(cc,px,py,k/4*TAU+.5+i*.3,RR*(.08+.26*shp),2.6,tn,Math.max(0,shp*.95));
        cc.beginPath();cc.arc(px,py,1.6+3.4*shp,0,TAU);
        cc.fillStyle=A(T[2],Math.max(0,shp));cc.fill();}};
    if(z>0)fore.push(draw);else draw(c);}
  front((cc)=>{for(const d of fore)d(cc);});
}]);

// ── 백광 발현 후보 다섯 — **둘레가 꽉 찬 흰 코어** (2026-08-10) ───────
// ── 백광 白光 — 발현 후보 다섯 (2026-08-10) ─────────────────────────────
//
// 백광은 **기본이 없다.** 다섯(염·빙·뇌·독·바람)을 다 거치는 순간이 곧 발현이라
// 조용한 단계가 없고, 무속성(둘레가 텅 빈 흰 코어)과 갈리는 축은 오직
// **둘레의 밀도**다 — 백광의 둘레에는 **빈 데가 없어야** 한다.
//
// 색은 쓰지 않는다. 모든 색이 합쳐져 흰색이 된 것이므로 화면은 무채색이고,
// 다섯의 흔적은 **형태**로만 남는다: 갈래(염) · 결정면(빙) · 꺾임(뇌) ·
// 방울(독) · 호(바람).
//
// 펄스 주기는 엔진과 같은 1.0s(kWhitePeriod). 조용히 차올랐다 한 번에 놓는다.

// ── 백광 — **가시 철사** 뼈대 ────────────────────────────────────────────
//
// 확정된 「발현 전」이 이 뼈대로 그려진다. 한때 후보 다섯이 이걸 공유했고,
// 그 다섯은 8안을 고른 뒤 지웠다(2026-08-10) — 뼈대만 남긴다.

/// 가시 철사 그물 — 뼈대. [barb] 가 마디마다 불려 가시를 그린다.
/// barb(cc, x, y, 진행각, 가닥번호 i, 마디번호 m, near, 마디수 n)
function wNet(c,cx,cy,RR,t,tn,barb){
  const T=TONE[tn];
  const ph=saw(t,1.0), chg=Math.min(1,ph/.80), rel=ph<.80?0:ease((ph-.80)/.20);
  const R0=RR*(1.12-.045*chg+.13*rel*(1-rel*.5));
  c.save();c.globalCompositeOperation="lighter";
  const gg=c.createRadialGradient(cx,cy,0,cx,cy,R0);
  gg.addColorStop(0,A(T[1],.05));gg.addColorStop(.70,A(T[1],.14));
  gg.addColorStop(1,A(T[1],0));
  c.fillStyle=gg;c.beginPath();c.ellipse(cx,cy,R0,R0*.92,0,0,TAU);c.fill();c.restore();
  const rot=t*.30, cr=Math.cos(rot), sr=Math.sin(rot);
  const spt=(o2,u,r)=>{
    const c1=Math.cos(u),s1=Math.sin(u);
    const X=o2.a[0]*c1+o2.b[0]*s1, Y=o2.a[1]*c1+o2.b[1]*s1, Z=o2.a[2]*c1+o2.b[2]*s1;
    return [cx+(X*cr+Z*sr)*r, cy+Y*r*.92, -X*sr+Z*cr];};
  const back=[],fore=[];
  const NL=20;
  for(let i=0;i<NL;i++){
    const o=sphOrbit(i+3);
    const rr=R0*(.86+.20*hash(i*5.3));
    const P=[],Z=[];
    for(let k=0;k<=40;k++){const p=spt(o,k/40*TAU,rr);P.push([p[0],p[1]]);Z.push(p[2]);}
    let a0=0;
    for(let k=1;k<=40;k++){
      if(k===40||(Z[k]>0)!==(Z[k-1]>0)){
        const seg=P.slice(a0,k+1);
        if(seg.length>1){const near=Z[a0]>0;
          const draw=(cc)=>{
            celStroke(cc,seg,near?3.4:2.2,tn,near?.58:.30);
            for(let m=1;m<seg.length-1;m++){
              const p0=seg[m-1],p1=seg[m+1];
              const base=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);
              barb(cc,seg[m][0],seg[m][1],base,i,m,near,RR,tn);}};
          (near?fore:back).push(draw);}
        a0=k;}}
    // 마디의 알갱이 — 다섯 종. 철사가 주(主)이므로 물러나 있다.
    const NB=7;
    for(let q=0;q<NB;q++){
      const u=(q+(i%2?.5:0))/NB*TAU+t*(.06+.03*hash(i*7.7));
      const p=spt(o,u,rr);
      const dz=.55+.45*(p[2]*.5+.5);
      const sz=RR*(.038+.024*hash((i*NB+q)*2.3))*(1+.18*rel);
      const al=Math.max(0,Math.min(1,(.62+.38*hash((i*NB+q)*9.1))*dz*(.82+.18*chg+.28*rel)));
      const kind=(i*NB+q)%5, a=Math.atan2(p[1]-cy,p[0]-cx);
      const draw=(cc)=>{
        if(kind===0){celSpike(cc,p[0],p[1],a,sz*2.2,sz*.82,tn,al);}
        else if(kind===1){
          fillPoly(cc,jagPoly(p[0],p[1],sz*1.15,6,q*1.7+i,.95),A(T[0],.90*al));
          fillPoly(cc,jagPoly(p[0],p[1],sz*.70,6,q*1.7+i+.4,.90),A(T[1],.95*al));
          fillPoly(cc,jagPoly(p[0],p[1],sz*.32,6,q*1.7+i+.9,.85),A(T[2],al));}
        else if(kind===2){
          celStroke(cc,[[p[0]-Math.cos(a+.9)*sz,p[1]-Math.sin(a+.9)*sz],[p[0],p[1]],
                        [p[0]+Math.cos(a-.9)*sz,p[1]+Math.sin(a-.9)*sz]],sz*.70,tn,al);}
        else if(kind===3){
          cc.beginPath();cc.ellipse(p[0],p[1],sz*1.05,sz*.88,a,0,TAU);
          cc.fillStyle=A(T[0],.90*al);cc.fill();
          cc.beginPath();cc.ellipse(p[0],p[1],sz*.62,sz*.50,a,0,TAU);
          cc.fillStyle=A(T[2],.95*al);cc.fill();}
        else{const P2=[];
          for(let k2=0;k2<=6;k2++){const q2=k2/6,aa=a-.9+q2*1.8;
            P2.push([p[0]+Math.cos(aa)*sz*1.5,p[1]+Math.sin(aa)*sz*1.5*.7]);}
          celStroke(cc,P2,sz*.60,tn,al);}};
      (p[2]>0?fore:back).push(draw);}}
  for(const d of back)d(c);
  front((cc)=>{for(const d of fore)d(cc);});}


FVSET.white.push(["**뭉쳐서 난다** — 몰린 자리는 빽빽하고 그 사이는 매끈하다",
function(c,cx,cy,RR,t,tn){
  // 개체를 흩는 게 아니라 **구간을 흩는다.** 가시가 떼로 몰려 나고, 그 사이는
  // 맨 철사다 — 「거칠다」는 균일한 잡음이 아니라 **뭉침**에서 온다.
  wNet(c,cx,cy,RR,t,tn,(cc,x,y,base,i,m,near,RR2,tn2)=>{
    const cl=Math.sin(m*.9+i*2.7)*.5+.5;       // 구간 밀도 — 느리게 오르내린다
    if(cl<.45)return;
    const n=1+((cl-.45)/.55*3)|0;
    for(let k=0;k<n;k++){
      const sg=k%2?1:-1;
      const h=hash(i*5.1+m*3.7+k*1.9);
      const ln=RR2*(.055+.075*h)*cl*(near?1:.70);
      const ang=base+Math.PI/2*sg+(h-.5)*.9;
      celSpike(cc,x,y,ang,ln,RR2*(.034+.020*h)*(near?1:.8),tn2,
        (near?.85:.44)*cl);}});}]);

// ── 백광 발현 — 몸은 하나, **파동만 갈아 끼운다** (2026-08-10) ─────────────
//
// 「웅-웅-우웅 하고 여러 번 치거나 여러 갈래로 퍼지면 어떨까」에 답하려고
// 본문을 함수로 뽑았다. 여섯 안이 같은 몸을 쓰고 파동 목록만 달랐고, 그중
// **하나가 나가다 둘로 쪼개지는 것**이 뽑혔다(2026-08-10). 나머지는 지웠다.
// 몸과 파동이 갈라져 있는 구조는 그대로 둔다 — 다음에 또 파동만 갈아 볼 수 있다.
//
// [mk](ph, RR) 가 이번 프레임의 파동 목록을 돌려준다:
//   {p 진행도 0~1 · r 반경(px) · a 세기 0~1 · sq 눌림 · rot 기울기}
// [bodyMul] 은 **몸을 줄여 파동을 상대적으로 키우는** 손잡이다. 시안 타일의
// 반너비가 1.667 RR 뿐이라, 몸을 .52 로 줄여야 고리를 1.58 RR 까지 그리면서
// **몸 대비 3.0 배**가 된다(확정본은 1.72 배).
//
// ⚠️ 크기의 기준은 타일이 아니라 **화면**이다. kBodyRadiusBase=16 이고 월드가
// 논리픽셀 1:1 이라, 아이폰 15(가로 393) 에서 몸 지름은 32px = 화면의 8%,
// 확정본 고리는 55px = 14%, 이 시안은 96px = **25%** 다. 「화면 절반」은 몸의
// 6 배라 캐릭터가 아니라 지형이 된다 — 그 선을 넘지 않는다.
function wMani(c,cx,cy,RR,t,tn,mk,bodyMul,bk){
  const T=TONE[tn], RB=RR*(bodyMul||1);
  // ── 순서
  //   ① 조임 0.00~0.58   느리게 시작해 끝에서 급하게 빨려 든다
  //   ③ 팡   0.58~0.78   크고 느리게
  //   ④ 파동 mk 가 정한다 — 팡이 한창일 때 태어나 몸을 앞질러 나간다
  //   ⑤ 되감김 0.78~0.92
  const ph=saw(t,2.4);
  const chg=Math.min(1,ph/.58);
  const bl=ph<.58?0:Math.min(1,(ph-.58)/.20);
  const sn=ph<.78?0:Math.min(1,(ph-.78)/.14);
  const suck=Math.pow(chg,2.0);
  // 반경을 **하나의 스케줄**로 합친다 — 0 삼켜짐 · 1 벨트 · 1.40 터져 나감.
  // 세 구간의 경계값이 서로 같고 주기의 끝(=1)이 처음과도 같아, 이어 붙는
  // 자리가 없어야 박자가 하나로 읽힌다.
  const sp = sn>0 ? 1+.40*Math.pow(1-sn,2.6)
           : bl>0 ? 1.40*ease(bl)
           : 1-suck;
  const flash=Math.max(0,Math.min(1,(sp-1)/.40));
  // ⚠️ suck·chg 를 그림에 직접 쓰면 주기 경계에서 1→0 으로 통째로 튄다.
  // sp 에서 파생한 comp 를 쓴다(0 쉼 · 1 다 조여듦).
  const comp=Math.max(0,Math.min(1,1-sp));
  // 번쩍 — flash 는 0.32초에 걸쳐 완만히 오르내려서 「밝아진다」이지 「번쩍」이
  // 아니다. **아주 짧은 봉우리**를 하나 더 얹어 눈이 한 번 머는 순간을 만든다.
  // 종형이라 양 끝이 0 이고 미분도 매끄럽다 — 주기 어디서도 계단이 안 생긴다.
  const pop=Math.exp(-Math.pow((ph-.70)/.020,2));   // 폭 ≈ 0.10 초
  const WV=mk(ph,RR)||[];
  /// 기울어진 고리 — [side] +1 이면 몸 앞, -1 이면 몸 뒤만 그린다.
  /// 통째로 앞에 그리면 몸을 두르지 않고 몸 위에 얹힌 도형이 되어 3D 가 죽는다.
  const tor=(cc,r,sq,rot,w,al,side)=>{
    if(al<=.005||r<=0)return;
    const cr=Math.cos(rot),sr=Math.sin(rot);let seg=[];
    for(let k=0;k<=72;k++){const u=k/72*TAU;
      const X=Math.cos(u)*r, Y=Math.sin(u)*r*sq;
      const p=[cx+X*cr-Y*sr, cy+X*sr+Y*cr];
      if((p[1]>=cy)===(side>0))seg.push(p);
      else{if(seg.length>1)celStroke(cc,seg,w,tn,al);seg=[];}}
    if(seg.length>1)celStroke(cc,seg,w,tn,al);};
  /// 파동의 **몸통** — 선 하나는 아무리 굵어도 띠가 안 된다. 기울인 좌표계에서
  /// 도넛형 그라디언트를 깔아 폭을 낸다(원형을 scale 로 눌러 타원으로).
  const wake=(cc,w,mul)=>{
    if(w.a<=.01)return;
    cc.save();cc.globalCompositeOperation="lighter";
    cc.translate(cx,cy);cc.rotate(w.rot);cc.scale(1,w.sq);
    const gd=cc.createRadialGradient(0,0,w.r*.62,0,0,w.r*1.26);
    gd.addColorStop(0,A(T[1],0));
    gd.addColorStop(.46,A("#FFFFFF",Math.max(0,Math.min(1,.22*w.a*mul))));
    gd.addColorStop(1,A(T[1],0));
    cc.fillStyle=gd;cc.beginPath();cc.arc(0,0,w.r*1.26,0,TAU);cc.fill();cc.restore();};
  /// 왜곡 — 충격면이 지나가며 뒤엣것을 밀어낸다. 렌즈처럼 안쪽은 밖으로,
  /// 바깥쪽은 안으로. 굴절을 계산할 수는 없으니 **그리는 것의 좌표를 옮긴다.**
  /// 거리는 화면 거리가 아니라 **고리 좌표계의 타원 반경**으로 잰다 — 기울어진
  /// 고리를 원으로 재면 일그러지는 자리가 어긋난다. 파동이 여럿이면 더한다.
  const warp=(x,y)=>{
    let ox=x, oy=y;
    for(let i=0;i<WV.length;i++){
      const w=WV[i]; if(w.a<=.01)continue;
      const cr=Math.cos(w.rot), sr=Math.sin(w.rot);
      const X=(x-cx)*cr+(y-cy)*sr, Y=-(x-cx)*sr+(y-cy)*cr;
      const Ys=Y/w.sq, d=Math.hypot(X,Ys);
      if(d<1e-3)continue;
      const s=Math.max(0,1-Math.abs(d-w.r)/(RR*.52));
      if(s<=0)continue;
      const push=RR*.24*s*s*w.a*(d<w.r?1:-1);
      const nx=X+X/d*push, ny=Ys+Ys/d*push;
      ox+=(cx+nx*cr-ny*w.sq*sr)-x;
      oy+=(cy+nx*sr+ny*w.sq*cr)-y;}
    return [ox,oy];};
  const ring=(bet,gam,u,rr)=>{
    const cb=Math.cos(bet),sb=Math.sin(bet),cg=Math.cos(gam),sg2=Math.sin(gam);
    const X=Math.cos(u), Y=Math.sin(u)*cb, Z=Math.sin(u)*sb;
    return [cx+(X*cg-Y*sg2)*rr, cy+(X*sg2+Y*cg)*rr, Z];};
  const mstar=(cc,x,y,s,kind,ang,al,gl)=>{
    const aa=Math.max(0,Math.min(1,al)); if(aa<.02)return;
    cc.save();cc.globalCompositeOperation="lighter";
    const gr=cc.createRadialGradient(x,y,0,x,y,s*gl);
    gr.addColorStop(0,A(T[2],Math.max(0,aa*.48)));
    gr.addColorStop(.36,A(T[1],Math.max(0,aa*.17)));
    gr.addColorStop(1,A(T[1],0));
    cc.fillStyle=gr;cc.beginPath();cc.arc(x,y,s*gl,0,TAU);cc.fill();cc.restore();
    cc.save();cc.translate(x,y);cc.rotate(ang);
    if(kind===0){for(let k=0;k<5;k++){const a2=k/5*TAU;
        celSpike(cc,0,0,a2,s*.98,s*.30,tn,aa*.92);
        const ex=Math.cos(a2)*s*.80,ey=Math.sin(a2)*s*.80;
        celSpike(cc,ex,ey,a2+.50,s*.50,s*.15,tn,aa*.85);
        celSpike(cc,ex,ey,a2-.50,s*.50,s*.15,tn,aa*.85);}
    }else if(kind===1){
      fillPoly(cc,jagPoly(0,0,s*.96,6,2.3,1.55),A(T[0],Math.max(0,aa*.92)));
      fillPoly(cc,jagPoly(0,0,s*.60,6,2.3,1.50),A(T[1],Math.max(0,aa*.96)));
      fillPoly(cc,jagPoly(0,0,s*.29,6,2.3,1.45),A(T[2],aa));
    }else if(kind===2){for(let k=0;k<5;k++){const a2=k/5*TAU;
        celStroke(cc,[[0,0],[Math.cos(a2)*s*.52,Math.sin(a2)*s*.52],
          [Math.cos(a2+.70)*s,Math.sin(a2+.70)*s]],s*.34,tn,aa*.90);}
    }else if(kind===3){for(let k=0;k<5;k++){const a2=k/5*TAU;
        const bx=Math.cos(a2)*s*.72,by=Math.sin(a2)*s*.72;
        cc.beginPath();cc.ellipse(bx,by,s*.34,s*.26,a2,0,TAU);
        cc.fillStyle=A(T[0],Math.max(0,aa*.90));cc.fill();
        cc.beginPath();cc.ellipse(bx,by,s*.19,s*.14,a2,0,TAU);
        cc.fillStyle=A(T[2],Math.max(0,aa*.95));cc.fill();}
      cc.beginPath();cc.arc(0,0,s*.40,0,TAU);cc.fillStyle=A(T[1],Math.max(0,aa*.95));cc.fill();
    }else{for(let k=0;k<5;k++){const a2=k/5*TAU,P2=[];
        for(let j=0;j<=5;j++){const q=j/5;
          P2.push([Math.cos(a2+q*q)*s*q,Math.sin(a2+q*q)*s*q]);}
        celStroke(cc,P2,s*.32,tn,aa*.90);}}
    if(kind!==3){cc.beginPath();cc.arc(0,0,s*.26,0,TAU);
      cc.fillStyle=A(T[2],aa);cc.fill();}
    cc.restore();};
  const back=[],fore=[];
  // ① 삼켜지는 철사 — 조일 땐 안으로 말려들고, 팡에 밀려났다가 되감김에
  //    그 자리를 그대로 되짚어 온다. **모일 땐 정연하게, 퍼질 땐 거칠게.**
  for(let i=0;i<20;i++){
    const o=sphOrbit(i+131);
    const pk=RB*.30, fr=RB*(.90+.26*hash(i*5.5));
    const rr=pk+(fr-pk)*sp;
    const u=hash(i*3.9)*TAU+t*.36+(1-rr/RB)*2.4+(sn>0?Math.sin(sn*Math.PI)*1.9:0);
    const p=sphPt(o,u,rr,cx,cy), near=p[2]>0;
    const gone=Math.max(0,Math.min(1,(rr/RB-.34)/.30));
    const al=Math.max(0,(near?.46:.22)*gone+flash*(near?.62:.34));
    const ln=RB*(.09+.09*hash(i*1.3))*(.55+.45*gone)*(1+.40*flash);
    const tang=Math.atan2(p[1]-cy,p[0]-cx)+1.15;
    const rgh=flash;
    const P2=[];
    for(let k=0;k<=5;k++){const q=k/5-.5;
      const jx=(hash(i*13.1+k*2.9)-.5)*RB*.075*rgh;
      const jy=(hash(i*17.7+k*3.3)-.5)*RB*.075*rgh;
      const bend=(hash(i*19.3+k*5.1)-.5)*1.05*rgh;
      P2.push(warp(p[0]+Math.cos(tang+q*.8+bend)*ln*q*2+jx,
                   p[1]+Math.sin(tang+q*.8+bend)*ln*q*2+jy));}
    const w0=RB*(.016+(hash(i*6.2)-.5)*.026*rgh);
    const nb=(hash(i*8.7)*3.4*rgh)|0;
    const draw=(cc)=>{
      celStroke(cc,P2,Math.max(RB*.006,w0),tn,al);
      for(let b=0;b<nb;b++){
        const m=1+((hash(i*23.7+b*4.3)*4)|0);
        const bd=Math.atan2(P2[m][1]-P2[m-1][1],P2[m][0]-P2[m-1][0]);
        celSpike(cc,P2[m][0],P2[m][1],bd+Math.PI/2*(hash(i*29.1+b)<.5?1:-1)
          +(hash(i*31.3+b*2.7)-.5)*1.2,
          ln*(.30+.60*hash(i*37.9+b*3.1)),Math.max(RB*.006,w0)*(.7+.9*hash(i*41.1+b)),
          tn,al*.85);}};
    (near?fore:back).push(draw);}
  // ② 빨려드는 흰 줄기 — 조일수록 진해져야 빨려 드는 것으로 읽힌다.
  for(let i=0;i<7;i++){
    const a2=i/7*TAU+t*.18;
    const ra=RB*(.32+.80*sp), rb=RB*(.22+.30*sp);
    const al=Math.max(0,.12+.30*Math.max(0,1-sp)+.52*flash);
    const P2=[];
    for(let k=0;k<=9;k++){const q=k/9;
      const rr=(ra+(rb-ra)*q)*(1+(hash(i*11.9+k*3.7)-.5)*.30*flash);
      // 감기는 방향을 flash 하나로 잇는다 — 조일 땐 +.75, 터질 땐 -.62.
      const aa2=a2+q*(.75-1.37*flash)+(hash(i*15.1+k*2.3)-.5)*.26*flash;
      P2.push(warp(cx+Math.cos(aa2)*rr, cy+Math.sin(aa2)*rr*.94));}
    const w1=RB*(.013+(.010+(hash(i*21.7)-.5)*.016)*flash);
    back.push((cc)=>{celStroke(cc,P2,Math.max(RB*.006,w1),tn,al);
      if(flash>.35&&hash(i*27.3)>.4){
        const m=3+((hash(i*33.1)*5)|0);
        const bd=Math.atan2(P2[m][1]-P2[m-1][1],P2[m][0]-P2[m-1][0]);
        celSpike(cc,P2[m][0],P2[m][1],bd+(hash(i*39.7)-.5)*1.6,
          RB*(.10+.16*hash(i*43.3))*flash,Math.max(RB*.005,w1*.8),tn,al*.8);}});}
  // ②-b 빨려 드는 부스러기 — 조임의 증거. 없으면 「줄어든다」로만 보인다.
  if(bl<=0){
    const gate=Math.max(0,Math.min(1,(.58-ph)/.05))*Math.min(1,ph/.06);
    for(let i=0;i<12;i++){
      const cyc=ph*9, sd=i*5.3+Math.floor(cyc+i*.37)*1.7;
      const q=(cyc+i*.37)%1;
      const a2=hash(sd)*TAU;
      const d0=RB*(1.25+.35*hash(sd*2.1)), d1=RB*.32;
      const d=d0+(d1-d0)*ease(q);
      const ln=RB*(.10+.18*hash(sd*3.3))*(1-q*.45);
      const al=Math.max(0,(.10+.46*comp)*Math.min(1,(1-q)*2.4)*gate);
      if(al<=.02)continue;
      back.push((cc)=>celSpike(cc,cx+Math.cos(a2)*d,cy+Math.sin(a2)*d*.92,
        a2+Math.PI,ln,RB*.014,tn,al));}}
  // ③ 다섯 — 버티는 축이다. 팡에 밀렸다가 되감김에 먼저 제자리로 온다.
  for(let i=0;i<5;i++){
    const rr=RB*(.71+.24*Math.max(0,sp-1)/.40);
    const p0=ring(.60,1.05,i/5*TAU+t*.16,rr), near=p0[2]>0;
    const p=warp(p0[0],p0[1]);
    const s=RB*(.070+.008*hash(i*3.3));
    const al=(near?1:.52)*(.70+.30*comp+.30*flash);
    const draw=(cc)=>mstar(cc,p[0],p[1],s*(1+.22*flash),i,t*.9+i*1.7,al,2.4+.4*flash);
    (near?fore:back).push(draw);}
  // 파동 뒤쪽 반 — 잔해보다 먼저 깔린다.
  c.save();c.globalCompositeOperation="lighter";
  for(let i=0;i<WV.length;i++){const w=WV[i]; if(w.a<=.01)continue;
    wake(c,w,.55);
    tor(c,w.r,w.sq,w.rot,RR*(.052*(1-w.p)+.011),w.a*.55,-1);
    tor(c,w.r*.84,w.sq,w.rot,RR*.009,w.a*.26,-1);}
  c.restore();
  for(const d of back)d(c);
  // ④ 중심 — 삼키는 동안은 참고(작고 진해진다), 팡에 통째로 하얘진다.
  front((cc)=>{
    cc.save();cc.globalCompositeOperation="lighter";
    const inn=RB*(.64-.30*comp);
    const g1=cc.createRadialGradient(cx,cy,0,cx,cy,inn);
    g1.addColorStop(0,A("#FFFFFF",Math.max(0,Math.min(1,.32+.42*comp))));
    g1.addColorStop(.42,A(T[1],Math.max(0,.20+.20*comp)));
    g1.addColorStop(1,A(T[1],0));
    cc.fillStyle=g1;cc.beginPath();cc.arc(cx,cy,inn,0,TAU);cc.fill();
    // 폭발 — [bk] 로 갈아 끼운다(파동의 mk 와 짝). 안 주면 기본형 wBurst.
    // 후보를 넷 만들어 비교하고 **기본형으로 확정**했다(2026-08-10). 자리는
    // 남긴다 — 다음에 또 폭발만 갈아 볼 때 몸과 파동을 안 건드려도 된다.
    if(flash>0)(bk||wBurst)(cc,cx,cy,RB,flash,t,tn,T);
    // 번! 쩍! — 가산 합성이라 이미 밝은 코어 위에 얹으면 하얗게 날아간다.
    //
    // ⚠️ 처음엔 .95 로 올렸다가 **눈이 아프다**고 반려됐다(2026-08-10). 이건
    // 한 번 터지고 마는 연출이 아니라 **2.4 초마다 영원히 반복되는 상태**라,
    // 한 방의 세기가 아니라 **오래 봐도 되는 세기**로 잡아야 한다. 절반으로
    // 내리고 번짐도 좁혔다 — 「번쩍」은 대비로 나지 절대 밝기로 나지 않는다.
    if(pop>.01){
      const rp=RB*(.90+.85*pop);
      const gp=cc.createRadialGradient(cx,cy,0,cx,cy,rp);
      gp.addColorStop(0,A("#FFFFFF",Math.max(0,Math.min(1,.32*pop))));
      gp.addColorStop(.34,A("#FFFFFF",Math.max(0,Math.min(1,.14*pop))));
      gp.addColorStop(1,A(T[1],0));
      cc.fillStyle=gp;cc.beginPath();cc.arc(cx,cy,rp,0,TAU);cc.fill();
      // 눈부심의 십자 잔상 — 밝기 대신 **가늘고 길게**. 형태로 번쩍이게 한다
      for(let i=0;i<4;i++)
        celSpike(cc,cx,cy,i/4*TAU+.42,RB*(.8+1.9*pop),RB*.026*pop,tn,
          Math.max(0,Math.min(1,pop*.42)));}
    cc.restore();});
  // ⑤ 파동 앞쪽 반 — 몸을 두른다. 앞뒤로 옅은 자락을 붙여 폭을 만든다.
  front((cc)=>{cc.save();cc.globalCompositeOperation="lighter";
    for(let i=0;i<WV.length;i++){const w=WV[i]; if(w.a<=.01)continue;
      wake(cc,w,1);
      tor(cc,w.r,w.sq,w.rot,RR*(.052*(1-w.p)+.011),w.a,1);
      tor(cc,w.r*.93,w.sq,w.rot,RR*.009,w.a*.48,1);
      tor(cc,w.r*.84,w.sq,w.rot,RR*.007,w.a*.28,1);
      tor(cc,w.r*.74,w.sq,w.rot,RR*.005,w.a*.15,1);
      tor(cc,w.r*1.09,w.sq,w.rot,RR*.006,w.a*.20,1);}
    cc.restore();});
  front((cc)=>{for(const d of fore)d(cc);});}

/// 파동 하나 만들기 — 출발 시각·구간·최대 반경·세기만 주면 된다.
/// 알파는 첫 8% 동안 떠오른다(0→1 로 불쑥 뜨면 팝으로 읽힌다).
function wPulse(ph,RR,t0,span,rMul,aMul,sq,rot){
  const q=ph<t0?0:Math.min(1,(ph-t0)/span);
  if(q<=0||q>=1)return null;
  return {p:q, r:RR*(.10+rMul*ease(q)),
    a:Math.pow(1-q,1.15)*Math.min(1,q/.08)*aMul, sq:sq, rot:rot};
}

FVSET.white.push(["**조였다 팡 — 그 안에서 고리가 태어나 앞질러 나간다** — 참다가 터지고, 터지는 도중에 충격면이 태어나 몸을 앞질러 나가며 지나는 자리를 일그러뜨린다",
function(c,cx,cy,RR,t,tn){
  // ── 파동만 6안 것으로 갈았다(사용자 지시, 2026-08-10). 몸·조임·팡·되감김은
  //    손대지 않는다. 다른 건 그대로고 **파동 하나가 나가다 둘로 쪼개진다.**
  //
  // ⚠️ 6안은 타일에 맞추느라 1.36 RR 에서 멈췄는데 「퍼져 나가는 거리가 너무
  // 짧다」로 반려됐다. 시안 타일 반너비가 1.667 RR 뿐이라 생긴 제약이고,
  // **실기기는 화면 반너비가 11.6 RR** 이라(kBodyRadiusBase=16, 아이폰 15
  // 가로 393) 훨씬 멀리 보내도 된다. 2.60 까지 밀고, 쪼개진 바깥쪽은 3.12 RR —
  // 지름이 화면 가로의 25% 다(몸은 8%). 시안 타일에서는 잘려 보인다.
  wMani(c,cx,cy,RR,t,tn,(ph,R)=>
    // 갈라지는 시점 .14, **벌어지는 데 .14 구간**만 쓴다 — p=.28 이면 다 벌어진다.
    // 사거리는 rMul 2.60 → 2.10 (바깥 2.68 RR = 화면 가로의 22%). 27% 는 컸다.
    wSplit(wPulse(ph,R,.66,.34,2.10,1.00,.30,-.38),.14,.22,.14), 1);}]);
/// 폭발 — 기본형. 흰 구 하나 + 뻗는 살 열둘.
/// ⚠️ 반경까지 크게 키우면 **평평한 흰 원반**이 되어 칸을 덮는다. 넓이의
/// 대부분은 파동이 맡고 중심은 좁게 두고 알파로만 태운다.
function wBurst(cc,cx,cy,RB,flash,t,tn,T){
  const rf=RB*(.46+.52*flash);
  const g=cc.createRadialGradient(cx,cy,0,cx,cy,rf);
  g.addColorStop(0,A("#FFFFFF",Math.max(0,Math.min(1,.74*flash))));
  g.addColorStop(.30,A("#FFFFFF",Math.max(0,Math.min(1,.33*flash))));
  g.addColorStop(1,A(T[1],0));
  cc.fillStyle=g;cc.beginPath();cc.arc(cx,cy,rf,0,TAU);cc.fill();
  for(let i=0;i<12;i++)celSpike(cc,cx,cy,i/12*TAU+t*.18,RB*(.44+1.05*flash),
    RB*.030,tn,Math.max(0,.58*flash));
}


/// 파동 하나를 **앞뒤 둘로 쪼갠다.** [at] 진행도부터 [ramp] 만큼의 구간 동안
/// [amt] 까지 벌어진다. 쪼개진 뒤에도 **같은 면**에 있어야 한 파동이 갈라진
/// 것으로 읽힌다 — 면까지 달라지면 그냥 파동이 둘인 것이다.
///
/// ⚠️ [ramp] 가 없던 판은 벌어짐을 **남은 수명 전체**에 걸쳐 키웠다. 그래서
/// 갈라지기 「시작」해도 한참 간격이 1px 수준이라, [at] 을 당겨도 눈에 보이는
/// 갈라짐은 안 당겨졌다(2026-08-10 「왜 별로 당긴 것 같지가 않지?」).
/// **갈라지는 시점과 눈에 보이는 시점을 같게 하려면 짧은 구간에 다 벌어져야 한다.**
function wSplit(w,at,amt,ramp){
  if(!w)return [];
  const s=Math.max(0,Math.min(1,(w.p-at)/(ramp||(1-at))));
  if(s<=0)return [w];
  return [{p:w.p, r:w.r*(1+amt*s), a:w.a*.88, sq:w.sq, rot:w.rot},
          {p:w.p, r:w.r*(1-amt*s), a:w.a*.88, sq:w.sq, rot:w.rot}];
}



const FVFIX={
  gold   :{base:1,   mani:5},      // 기본 = 각성 전(코어만) · 발현 = 잘게 부서져 있다
  // ⚠️ 「백광은 기본이 없다」에서 **정정**됐다(2026-08-10). 다른 속성처럼
  // **발현 전 / 발현** 두 벌을 갖는다 — 다섯을 다 거쳐 백광이 되는 것과,
  // 그 백광이 발현하는 것은 다른 사건이다.
  white  :{base:1,   mani:2},
  aqua   :{base:5,   mani:9},
  blast  :{base:5,   mani:6},
  smoke  :{base:10,  mani:15},
  fstorm :{base:1,   mani:6},
  magnet :{base:8,   mani:13},
  plague :{base:2,   mani:7},
  snow   :{base:8,   mani:4},
  numb   :{base:5,   mani:1},
  thunder:{base:1,   mani:4},
  murk   :{base:2,   mani:7},
};

// ── 고른 것만 남긴다 ────────────────────────────────────────────────────
// 후보를 다 띄우니 칸이 280개라 브라우저가 버거웠다(2026-08-09 "렉걸리니까").
// **아직 고르는 중인 속성만** 후보를 남기고, 끝난 속성은 확정 둘로 줄인다.
// 지우지 않고 **여기서 걷어내는** 이유는 앞의 반려 목록(FVDROP)과 같다 —
// 되살리려면 이 집합에 키 하나만 도로 넣으면 된다.
// 백광까지 다 골랐다(2026-08-10). 반려된 후보는 전부 소스에서 지웠다 — 열두
// 속성이 하나같이 **기본 하나 · 발현 하나**만 남았다.
// 후보를 다시 띄우려면 이 집합에 키를 넣으면 그 속성만 전부 뜬다.
// 백광까지 다 골랐다 — 열두 속성이 하나같이 기본 하나 · 발현 하나만 남았다.
// 후보를 다시 띄우려면 이 집합에 키를 넣으면 그 속성만 전부 뜬다.
// 백광까지 다 골랐다 — 열두 속성이 하나같이 기본 하나 · 발현 하나만 남았다.
// 후보를 다시 띄우려면 이 집합에 키를 넣으면 그 속성만 전부 뜬다.
const FVKEEPALL=new Set();
for(const k of Object.keys(FVSET)){
  if(FVKEEPALL.has(k))continue;
  const f=FVFIX[k];if(!f)continue;
  const idx=[...new Set([f.base,f.mani].filter(v=>v!=null).map(v=>v-1))]
    .filter(i=>FVSET[k][i]).sort((a,b)=>a-b);
  if(!idx.length)continue;
  FVSET[k]=idx.map(i=>FVSET[k][i]);
  // 번호가 바뀌었으니 확정 표시도 새 자리로 옮긴다.
  if(f.base!=null)f.base=idx.indexOf(f.base-1)+1;
  if(f.mani!=null)f.mani=idx.indexOf(f.mani-1)+1;}

/// 융화 속성의 몸 — 여섯 속성(`ELEM.elemBody`)과 **같은 뼈대**다: 광휘 +
/// 둘레 모티프 + 각진 별 코어. 뼈대를 공유해야 열여섯이 한 벌로 읽힌다.
function fvBody(c,t,dt,W,H,st,key,vi){
  const cx=W/2,cy=H/2,RR=Math.min(W,H)*.30,T=TONE[key];
  stepP(st,dt);
  if(R()<dt*9)emit(st,cx+(R()-.5)*RR*1.5,cy+(R()-.5)*RR*1.5,1,
    {k:key,sp:8,r:2.6,life:1.1,g:-40,spikeP:.05});
  c.save();c.globalCompositeOperation="lighter";
  const g=c.createRadialGradient(cx,cy,0,cx,cy,RR*1.5);
  g.addColorStop(0,A(T[1],.28));g.addColorStop(1,A(T[1],0));
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,RR*1.5,0,TAU);c.fill();c.restore();
  const v=FVSET[key][vi];if(v)v[1](c,cx,cy,RR,t,key);
  // 코어 — **각진 별은 열 전부 같다.** 속성이 바뀌어도 같은 사람이다.
  fillPoly(c,jagPoly(cx,cy,RR*.40,7,3.2,1.3),A(T[0],.95));
  fillPoly(c,jagPoly(cx,cy,RR*.30,7,3.6,1.25),A(T[1],1));
  fillPoly(c,jagPoly(cx,cy,RR*.16,7,4.2,1.2),A(T[2],1));
  // **몸 앞을 지나는 것**을 여기서 얹는다. 모티프는 몸보다 **먼저** 그려지므로
  // 그대로 두면 전부 뒤로 깔린다 — 감싸는 것이 「뒤에 있는 고리」로 보인다
  // (2026-08-09 반려). 모티프가 front(fn) 로 밀어 둔 것만 몸 위로 온다.
  {const q=FRONT;FRONT=[];for(const f of q)f(c);}
  drawP(c,st);
}

// ── 문법 데모 ────────────────────────────────────────────────────────────
const VOC={
ribbon(c,t,dt,W,H,st){st.tr=st.tr||[];const a=t*2.0;
  st.tr.push([W/2+Math.cos(a)*W*.28,H/2+Math.sin(a*1.4)*H*.24]);
  if(st.tr.length>18)st.tr.shift();celRibbon(c,st.tr,15,"gold",1);},
spike(c,t,dt,W,H){for(let i=0;i<9;i++){const a=i/9*TAU+t*.4;
  celSpike(c,W/2,H/2,a,W*.36*(.55+.45*hash(i*3.1)),11,"gold",1);}},
hoop(c,t,dt,W,H){celHoop(c,W/2,H/2,W*.30,1,0,11,"gold",1);
  celHoop(c,W/2,H/2,W*.30,.3,t*.8,9,"frost",1);
  celHoop(c,W/2,H/2,W*.19,.6,-t*.6,7,"amber",1);},
beam(c,t,dt,W,H){celBeam(c,W*.14,H*.5,W*.86,H*.5,W*.085,"gold",1);
  beamEnd(c,t,W*.14,H*.5,0,W*.24,"gold",1,1);},
puff(c,t,dt,W,H){const p=(t%1.5)/1.5,f=Math.max(0,1-p/.7),g=ease(Math.min(1,p/.7));
  celPuff(c,W/2,H/2,W*.13+W*.14*g,10,13,"amber",f);
  celPuff(c,W/2,H/2-4,W*.06+W*.06*g,8,29,"gold",f);},
fire(c,t,dt,W,H){const by=H*.80;
  for(let pass=0;pass<3;pass++)for(let i=0;i<3;i++){const sd=i*2.11+pass*.31,off=(i-1)*W*.09;
    const hh=(H*.52+H*.16*hash(sd))*(.88+.16*Math.sin(t*2.1+i));
    firePath(c,W/2+off,by,(W*.085+W*.02*hash(sd+1.3))*[1,.88,.5][pass],hh*[1,.97,.72][pass],
      t*[1,1,1.22][pass],sd,i*1.7);
    c.fillStyle=A([FIRE_DARK,FIRE_BASE,FIRE_LIT][pass],[.85,.97,1][pass]);c.fill();}},
wind(c,t,dt,W,H){windEmblem(c,t,W/2,H/2,"gale",W/238,1);},
shards(c,t,dt,W,H){shards(c,W/2,H*.66,W*.34,11,7,1);
  celPuff(c,W/2,H*.52,W*.11,9,3,"amber",.9);},
splash(c,t,dt,W,H){const p=(t%1.5)/1.5,f=Math.max(0,1-p/.7);
  celSplash(c,W/2,H/2,W*.13+W*.12*p,11,3,"gold",f);},
};
// ── 아이콘 — **이펙트와 다른 언어다** ──────────────────────────────────
// 이펙트를 44px 슬롯에 욱여넣으면 아무것도 안 읽히고, 12칸이 동시에 꿈틀거려
// 정보가 아니라 소음이 된다(2026-08-08 판정). 아이콘의 규칙은 정반대다:
//   ① **정적.** 움직이지 않는다.
//   ② **실루엣 우선.** 44px 에서는 형태만 남는다 — 계조는 2톤까지.
//   ③ **한 형태만.** 그 무기에서 제일 특징적인 것 하나. 이펙트를 요약하지 않는다.
//   ④ **프레임을 꽉 채운다.** 여백이 크면 옆 칸과 구분이 안 된다.
const IC={
  d:"#6B3A12", b:"#FFA83C", l:"#FFF3D6",
  ad:"#5E2408", ab:"#FF7A2A",
};
function ip(c,pts,col){c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
  c.closePath();c.fillStyle=col;c.fill();}
function iarc(c,cx,cy,r,a0,a1,w,col,sq=1){c.save();c.scale(1,sq);
  c.beginPath();c.arc(cx,cy/sq,r,a0,a1);c.strokeStyle=col;c.lineWidth=w;c.lineCap="round";
  c.stroke();c.restore();}
function ibar(c,x,y,w,h,col,r=0){c.beginPath();
  if(r)c.roundRect(x-w/2,y-h/2,w,h,r);else c.rect(x-w/2,y-h/2,w,h);
  c.fillStyle=col;c.fill();}
function itri(c,x,y,ang,len,w,col){const cs=Math.cos(ang),sn=Math.sin(ang),px=-sn,py=cs;
  ip(c,[[x+cs*len,y+sn*len],[x+px*w,y+py*w],[x-px*w,y-py*w]],col);}
function ihex(c,x,y,r,col,rot=0){const p=[];
  for(let i=0;i<6;i++){const a=rot+i/6*TAU;p.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}ip(c,p,col);}

const ICON={
// ── 물리 8 ──
bolt(c,S){const cx=S/2,cy=S/2;                       // 초승달 3겹
  for(let i=0;i<3;i++){iarc(c,cx,cy+S*.06,S*(.16+i*.11),-2.5,-.64,S*(.11-i*.024),i?IC.b:IC.l);}},
orbit(c,S){const cx=S/2,cy=S/2;                      // 궤도 + 구슬
  iarc(c,cx,cy,S*.30,0,TAU,S*.055,IC.d,.5);
  iarc(c,cx,cy,S*.30,-2.9,-.4,S*.055,IC.b,.5);
  c.beginPath();c.arc(cx+S*.30,cy,S*.085,0,TAU);c.fillStyle=IC.l;c.fill();
  c.beginPath();c.arc(cx,cy,S*.10,0,TAU);c.fillStyle=IC.b;c.fill();},
smg(c,S){const cx=S/2;                               // 짧은 탄 3발
  for(let i=0;i<3;i++)ibar(c,cx+(i-1)*S*.15,S*(.52-i*.06),S*.075,S*(.30-Math.abs(i-1)*.06),
    i===1?IC.l:IC.b,S*.04);},
seeker(c,S){const cx=S/2,cy=S/2;                     // 휘는 궤적 + 창끝
  c.beginPath();c.moveTo(cx-S*.32,cy+S*.26);
  c.quadraticCurveTo(cx-S*.06,cy+S*.20,cx+S*.10,cy-S*.12);
  c.strokeStyle=IC.b;c.lineWidth=S*.075;c.lineCap="round";c.stroke();
  itri(c,cx+S*.10,cy-S*.12,-1.0,S*.26,S*.11,IC.l);},
scatter(c,S){const cx=S/2,cy=S/2+S*.20;              // 부채로 퍼진 창 3
  for(let i=-1;i<=1;i++)itri(c,cx,cy,-Math.PI/2+i*.44,S*(.46-Math.abs(i)*.07),S*.075,
    i?IC.b:IC.l);},
saber(c,S){const cx=S/2,cy=S/2;                      // 낫 하나
  iarc(c,cx-S*.04,cy+S*.04,S*.31,-2.6,-.36,S*.15,IC.d);
  iarc(c,cx-S*.04,cy+S*.04,S*.31,-2.4,-.42,S*.075,IC.b);
  iarc(c,cx-S*.04,cy+S*.04,S*.31,-2.1,-.5,S*.03,IC.l);},
lance(c,S){const cx=S/2;                             // 세로 굵은 빔
  ibar(c,cx,S/2,S*.20,S*.72,IC.d,S*.10);
  ibar(c,cx,S/2,S*.115,S*.70,IC.b,S*.06);
  ibar(c,cx,S/2,S*.045,S*.66,IC.l,S*.03);},
sunpo(c,S){const cx=S/2,cy=S/2;                      // 호에 깔린 셀 + 쏠린 점
  // 한 형태 = 「바깥을 향해 굽은 셀 줄」. 결계 아이콘(닫힌 셸)과는 **닫혔나
  // 열렸나**로 갈리고, 공전 아이콘(도는 덩어리)과는 셀이 있냐로 갈린다.
  const R=S*.30,CR=S*.115;
  const hex=(x,y,r,rot,col,lw)=>{c.beginPath();
    for(let j=0;j<6;j++){const a=rot+j/6*TAU;
      const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;
      j?c.lineTo(px,py):c.moveTo(px,py);}
    c.closePath();c.fillStyle=col;c.fill();
    if(lw){c.strokeStyle=IC.l;c.lineWidth=lw;c.stroke();}};
  for(let i=0;i<3;i++){const th=-Math.PI/2+(i-1)*.62;
    hex(cx+Math.cos(th)*R,cy+Math.sin(th)*R,CR,th,IC.d,S*.028);}
  // 가운데 셀이 발사구 — 밝은 심 + 바깥으로 선 갈래.
  hex(cx,cy-R,CR*.5,0,IC.l,0);
  itri(c,cx,cy-R-CR*.9,-Math.PI/2,S*.17,S*.05,IC.b);},
bunroe(c,S){const cx=S/2,cy=S*.72;                   // 한 점으로 모이는 실
  // 아이콘은 **정적·실루엣 우선·2톤·한 형태**다. 이 무기의 한 형태는
  // 「여럿이 한 점으로 모인다」이므로, 활처럼 휜 실 넷과 그 끝의 점만 남긴다.
  const fx=S/2,fy=S*.26;
  for(let j=0;j<4;j++){const amp=(S*.13+S*.05*(j>>1))*((j&1)?1:-1);
    const P=[];
    for(let s0=0;s0<=8;s0++){const p=s0/8,bow=Math.sin(p*Math.PI)*amp;
      P.push([fx+(cx-fx)*p+bow,fy+(cy-fy)*p]);}
    c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
    c.strokeStyle=j<2?IC.b:IC.d;c.lineWidth=S*(j<2?.055:.04);
    c.lineCap="round";c.lineJoin="round";c.stroke();}
  c.beginPath();c.arc(fx,fy,S*.115,0,TAU);c.fillStyle=IC.d;c.fill();
  c.beginPath();c.arc(fx,fy,S*.07,0,TAU);c.fillStyle=IC.l;c.fill();},
shotgun(c,S){const cx=S/2,cy=S/2;                    // 덩어리 + 터짐
  for(let i=0;i<8;i++){const a=i/8*TAU;
    itri(c,cx+Math.cos(a)*S*.16,cy+Math.sin(a)*S*.16,a,S*.20,S*.045,IC.ab);}
  c.beginPath();c.arc(cx,cy,S*.19,0,TAU);c.fillStyle=IC.ad;c.fill();
  c.beginPath();c.arc(cx,cy,S*.13,0,TAU);c.fillStyle=IC.ab;c.fill();
  c.beginPath();c.arc(cx-S*.03,cy-S*.03,S*.06,0,TAU);c.fillStyle=IC.l;c.fill();},
// ── 마법 9 ──
sanctum(c,S){const cx=S/2,cy=S/2;                    // 눕힌 링 2겹 + 룬
  iarc(c,cx,cy+S*.06,S*.34,0,TAU,S*.075,IC.d,.42);
  iarc(c,cx,cy+S*.06,S*.34,0,TAU,S*.035,IC.b,.42);
  iarc(c,cx,cy+S*.06,S*.19,0,TAU,S*.03,IC.l,.42);},
pulse(c,S){const cx=S/2,cy=S/2;                      // 동심원 3
  for(let i=0;i<3;i++)iarc(c,cx,cy,S*(.13+i*.11),0,TAU,S*(.075-i*.018),i===0?IC.l:IC.b);},
lightfall(c,S){const cx=S/2;                         // 내려오는 기둥 + 바닥 링
  ibar(c,cx,S*.36,S*.17,S*.56,IC.d,S*.08);
  ibar(c,cx,S*.36,S*.085,S*.54,IC.b,S*.04);
  iarc(c,cx,S*.76,S*.30,0,TAU,S*.06,IC.l,.34);},
arc(c,S){                                            // 지그재그
  const p=[[.18,.24],[.46,.42],[.30,.52],[.62,.72],[.44,.56],[.60,.50]];
  c.beginPath();p.forEach((q,i)=>i?c.lineTo(q[0]*S,q[1]*S):c.moveTo(q[0]*S,q[1]*S));
  c.strokeStyle=IC.d;c.lineWidth=S*.15;c.lineJoin="round";c.lineCap="round";c.stroke();
  c.strokeStyle=IC.b;c.lineWidth=S*.075;c.stroke();
  c.strokeStyle=IC.l;c.lineWidth=S*.028;c.stroke();},
pillar(c,S){                                         // 기둥 3
  const h=[.44,.66,.50];
  for(let i=0;i<3;i++){const x=S*(.28+i*.22);
    ibar(c,x,S*.74-S*h[i]/2,S*.13,S*h[i],IC.d,S*.06);
    ibar(c,x,S*.74-S*h[i]/2,S*.06,S*h[i]*.96,i===1?IC.l:IC.b,S*.03);}},
ward(c,S){const cx=S/2,cy=S/2;                       // 육각 3장
  ihex(c,cx,cy-S*.16,S*.18,IC.d);ihex(c,cx,cy-S*.16,S*.12,IC.b);
  ihex(c,cx-S*.19,cy+S*.14,S*.16,IC.d);ihex(c,cx-S*.19,cy+S*.14,S*.105,IC.b);
  ihex(c,cx+S*.19,cy+S*.14,S*.16,IC.d);ihex(c,cx+S*.19,cy+S*.14,S*.105,IC.l);},
wisp(c,S){const cx=S/2,cy=S/2;                       // 작은 빛 3 + 연결선
  const P=[[cx,cy-S*.24],[cx-S*.23,cy+S*.16],[cx+S*.23,cy+S*.16]];
  c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();
  c.strokeStyle=IC.d;c.lineWidth=S*.055;c.stroke();
  P.forEach((q,i)=>{c.beginPath();c.arc(q[0],q[1],S*.115,0,TAU);c.fillStyle=IC.b;c.fill();
    c.beginPath();c.arc(q[0],q[1],S*.055,0,TAU);c.fillStyle=IC.l;c.fill();});},
flare(c,S){const cx=S/2,cy=S/2;                      // 눈
  c.beginPath();c.moveTo(cx-S*.36,cy);
  c.quadraticCurveTo(cx,cy-S*.34,cx+S*.36,cy);
  c.quadraticCurveTo(cx,cy+S*.34,cx-S*.36,cy);c.closePath();
  c.fillStyle=IC.d;c.fill();
  c.beginPath();c.moveTo(cx-S*.27,cy);
  c.quadraticCurveTo(cx,cy-S*.24,cx+S*.27,cy);
  c.quadraticCurveTo(cx,cy+S*.24,cx-S*.27,cy);c.closePath();
  c.fillStyle=IC.b;c.fill();
  c.beginPath();c.arc(cx,cy,S*.115,0,TAU);c.fillStyle=IC.l;c.fill();},
ignite(c,S){const cx=S/2;                            // 불 실루엣 하나
  const P=new Path2D();
  const f=(sc,col)=>{c.beginPath();c.moveTo(cx,S*.82);
    c.quadraticCurveTo(cx-S*.24*sc,S*.60,cx-S*.10*sc,S*.38);
    c.quadraticCurveTo(cx-S*.03*sc,S*.24,cx+S*.05*sc,S*.12);
    c.quadraticCurveTo(cx+S*.16*sc,S*.36,cx+S*.24*sc,S*.58);
    c.quadraticCurveTo(cx+S*.17*sc,S*.74,cx,S*.82);c.closePath();
    c.fillStyle=col;c.fill();};
  f(1,IC.ad);f(.60,IC.ab);f(.26,IC.l);},
};
// 방어구 10
const AICON={
chain(c,S){const cx=S/2,cy=S/2;                      // 사슬 마디 3
  for(let i=0;i<3;i++){const y=cy+(i-1)*S*.26;
    iarc(c,cx,y,S*.16,0,TAU,S*.075,i===1?IC.l:IC.b);}},
mirror(c,S){const cx=S/2,cy=S/2;                     // 각진 거울면 + 반사선
  ip(c,[[cx,cy-S*.34],[cx+S*.30,cy],[cx,cy+S*.34],[cx-S*.30,cy]],IC.d);
  ip(c,[[cx,cy-S*.24],[cx+S*.21,cy],[cx,cy+S*.24],[cx-S*.21,cy]],IC.b);
  ip(c,[[cx-S*.16,cy+S*.04],[cx+S*.04,cy-S*.16],[cx+S*.12,cy-S*.08],[cx-S*.08,cy+S*.12]],IC.l);},
arcane(c,S){const cx=S/2,cy=S/2;                     // 룬 링
  iarc(c,cx,cy,S*.30,0,TAU,S*.075,IC.d);
  for(let i=0;i<6;i++){const a=i/6*TAU;
    c.beginPath();c.arc(cx+Math.cos(a)*S*.30,cy+Math.sin(a)*S*.30,S*.065,0,TAU);
    c.fillStyle=i%2?IC.b:IC.l;c.fill();}},
mirage(c,S){const cx=S/2,cy=S/2;                     // 점선 원 (있다 없다)
  for(let i=0;i<8;i++){const a=i/8*TAU;
    if(i%2)continue;iarc(c,cx,cy,S*.30,a,a+.62,S*.085,IC.b);}
  c.beginPath();c.arc(cx,cy,S*.10,0,TAU);c.fillStyle=IC.l;c.fill();},
dawn(c,S){const cx=S/2;                              // 해돋이
  iarc(c,cx,S*.62,S*.28,Math.PI,0,S*.10,IC.b);
  ibar(c,cx,S*.66,S*.62,S*.055,IC.d,S*.03);
  for(let i=-1;i<=1;i++)itri(c,cx+i*S*.20,S*.44,-Math.PI/2,S*.16,S*.045,IC.l);},
gale(c,S){const cy=S/2;                              // 속도선 3
  for(let i=0;i<3;i++){const y=cy+(i-1)*S*.20,w=S*(.56-Math.abs(i-1)*.14);
    ibar(c,S/2+S*.04,y,w,S*.085,i===1?IC.l:IC.b,S*.04);}},
karma(c,S){const cx=S/2,cy=S/2;                      // 되돌아오는 화살
  iarc(c,cx,cy,S*.28,-2.6,1.2,S*.085,IC.b);
  itri(c,cx+Math.cos(1.2)*S*.28,cy+Math.sin(1.2)*S*.28,1.2+1.6,S*.20,S*.095,IC.l);},
boulder(c,S){const cx=S/2,cy=S/2;                    // 두꺼운 블록
  ip(c,[[cx-S*.30,cy+S*.26],[cx-S*.22,cy-S*.22],[cx+S*.24,cy-S*.28],[cx+S*.31,cy+S*.24]],IC.d);
  ip(c,[[cx-S*.19,cy+S*.16],[cx-S*.13,cy-S*.12],[cx+S*.15,cy-S*.17],[cx+S*.20,cy+S*.14]],IC.b);
  ip(c,[[cx-S*.10,cy-S*.02],[cx-S*.06,cy-S*.10],[cx+S*.06,cy-S*.12],[cx+S*.02,cy-S*.01]],IC.l);},
purity(c,S){const cx=S/2;                            // 물방울 + 물결
  ip(c,[[cx,S*.16],[cx+S*.20,S*.50],[cx,S*.66],[cx-S*.20,S*.50]],IC.d);
  ip(c,[[cx,S*.26],[cx+S*.13,S*.50],[cx,S*.60],[cx-S*.13,S*.50]],IC.b);
  iarc(c,cx,S*.80,S*.26,Math.PI,0,S*.06,IC.l);},
dazzle(c,S){const cx=S/2,cy=S/2;                     // 짧은 방사
  for(let i=0;i<8;i++){const a=i/8*TAU;
    itri(c,cx+Math.cos(a)*S*.13,cy+Math.sin(a)*S*.13,a,S*(i%2?.26:.17),S*.05,i%2?IC.l:IC.b);}
  c.beginPath();c.arc(cx,cy,S*.11,0,TAU);c.fillStyle=IC.b;c.fill();},
};

// 저주 5 — **아이콘은 이펙트와 다른 언어다**(금빛 실루엣 하나). 이펙트에서
// 저주 계열이 어둡고 탁한 것과 무관하게, 110px 아이콘은 **실루엣만으로**
// 갈려야 하므로 여기서는 색을 안 쓴다(일반 공격 10 · 방어구 10 과 같은 규약).
const CICON={
curse(c,S){const cx=S/2,cy=S/2;                      // 각인 — 고리 + 역삼각
  iarc(c,cx,cy,S*.29,0,TAU,S*.075,IC.d);
  ip(c,[[cx,cy+S*.22],[cx-S*.20,cy-S*.13],[cx+S*.20,cy-S*.13]],IC.b);
  c.beginPath();c.arc(cx,cy-S*.02,S*.07,0,TAU);c.fillStyle=IC.l;c.fill();},
plague(c,S){const cx=S/2,cy=S/2;                     // 삼엽 + 중첩 점 셋
  for(let i=0;i<3;i++){const a=i/3*TAU-Math.PI/2;
    itri(c,cx+Math.cos(a)*S*.10,cy+Math.sin(a)*S*.10,a,S*.26,S*.085,i?IC.b:IC.l);}
  for(let i=0;i<3;i++){c.beginPath();
    c.arc(cx+(i-1)*S*.13,cy+S*.31,S*.045,0,TAU);c.fillStyle=IC.d;c.fill();}},
shackle(c,S){const cx=S/2,cy=S/2;                    // 사슬 고리 둘 + 가시
  iarc(c,cx-S*.12,cy-S*.06,S*.15,0,TAU,S*.07,IC.b);
  iarc(c,cx+S*.12,cy+S*.06,S*.15,0,TAU,S*.07,IC.l);
  for(let i=0;i<3;i++)itri(c,cx+(i-1)*S*.20,S*.70,-Math.PI/2,S*.20,S*.05,IC.d);},
seal(c,S){const cx=S/2,cy=S/2;                       // 멈춘 시계 — 바늘 + 빗장
  iarc(c,cx,cy,S*.28,0,TAU,S*.065,IC.d);
  c.beginPath();c.moveTo(cx,cy);c.lineTo(cx,cy-S*.19);
  c.strokeStyle=IC.b;c.lineWidth=S*.06;c.lineCap="round";c.stroke();
  ibar(c,cx,cy+S*.02,S*.62,S*.075,IC.l,S*.035);},
veil(c,S){const cx=S/2,cy=S/2;                       // 눈 + 가로 띠
  c.beginPath();c.moveTo(cx-S*.34,cy);
  c.quadraticCurveTo(cx,cy-S*.30,cx+S*.34,cy);
  c.quadraticCurveTo(cx,cy+S*.30,cx-S*.34,cy);c.closePath();
  c.fillStyle=IC.d;c.fill();
  c.beginPath();c.arc(cx,cy,S*.10,0,TAU);c.fillStyle=IC.b;c.fill();
  ibar(c,cx,cy,S*.78,S*.11,IC.l,S*.05);},
};
// 회복 4 — **여명·정화는 방어구 아이콘을 그대로 부른다.** 같은 물건이 두
// 그림을 가지면 3택 카드와 장비 랙에서 서로 다른 것으로 보인다(id 가 갈려
// 죽은 카드가 된 2026-08-07 사고의 그림판 버전).
const HICON={
dawn:(c,S)=>AICON.dawn(c,S),
purity:(c,S)=>AICON.purity(c,S),
reap(c,S){const cx=S/2;                              // 이삭 — 알 셋 + 줄기
  c.beginPath();c.moveTo(cx,S*.86);c.lineTo(cx,S*.30);
  c.strokeStyle=IC.d;c.lineWidth=S*.07;c.lineCap="round";c.stroke();
  for(let i=0;i<3;i++){const y=S*(.28+i*.17);
    ip(c,[[cx,y-S*.09],[cx+S*.17,y+S*.02],[cx,y+S*.11]],i?IC.b:IC.l);
    ip(c,[[cx,y-S*.09],[cx-S*.17,y+S*.02],[cx,y+S*.11]],i?IC.b:IC.l);}},
tithe(c,S){const cx=S/2;                             // 제단의 젬 + 오르는 불
  ip(c,[[cx,S*.44],[cx+S*.19,S*.62],[cx,S*.80],[cx-S*.19,S*.62]],IC.d);
  ip(c,[[cx,S*.53],[cx+S*.10,S*.62],[cx,S*.71],[cx-S*.10,S*.62]],IC.b);
  for(let i=-1;i<=1;i++)itri(c,cx+i*S*.15,S*.40,-Math.PI/2,S*(.22-Math.abs(i)*.07),
    S*.055,i?IC.b:IC.l);},
};

const VOCL=[
["ribbon","① 리본 덩어리","제일 많이 쓴다. 곡선을 따라 폭이 가늘어지는 닫힌 도형 — 베기·궤적·번개·바람 획이 전부 이것"],
["spike","② 뾰족한 창","끝이 날카로운 삼각. 발사체와 방사. 3단 계조가 안에서 겹친다"],
["hoop","③ 두꺼운 타원 링","기울기가 다른 링 여러 겹 = 입체. 속은 비어 있다"],
["beam","④ 캡슐 빔 + 끝단 획","양끝이 둥근 막대. **끝단은 얇은 획 둘뿐** — 더 그리면 스티커가 된다"],
["puff","⑤ 뭉게구름","폭발의 모양. 둥근 돌기가 뭉친 실루엣 — 창으로 터뜨리면 돌조각이 된다"],
["fire","⑥ 불 실루엣","갈래가 **날카롭게 찢어지고** 안쪽 크림은 축소본이 아니라 따로 뜬 섬. 무기 전용"],
["wind","⑦ 초승달 획","바람. 굵은 획이 겹쳐 돌며 안으로 조인다 — 가는 나선은 낙서로 읽힌다"],
["shards","⑧ 지면 파편","바닥에 각진 조각. 충격이 땅에 닿았다는 신호"],
["splash","⑨ 뾰족한 물보라","각진 별. **정적으로 얹으면 스티커**라 지금은 순간 터짐에만 쓴다"]];

// ── 전투 ─────────────────────────────────────────────────────────────────
function combat(c,t,dt,W,H,st){
  const cx=W/2,cy=H/2;
  if(!st.F){st.F=[];for(let i=0;i<16;i++){const a=i/16*TAU+.3,d=95+((i*37)%110);
    st.F.push({ox:Math.cos(a)*d*1.7,oy:Math.sin(a)*d*.8,r:9+((i*13)%8),hit:0,kx:0,ky:0,burn:0});}
    st.tr=[[],[],[]];}
  for(const f of st.F){const L=Math.hypot(f.ox,f.oy)||1;
    f.ox-=f.ox/L*18*dt;f.oy-=f.oy/L*18*dt;if(L<74){f.ox*=3.4;f.oy*=3.4;}}
  stepFoes(st.F,dt);
  const u=saw(t,1.1),sw=Math.min(1,ease(u/.26)),a0=-Math.PI*1.16,a1=a0+Math.PI*1.32,SR=110;
  const cur=a0+(a1-a0)*sw;
  if(u<(st.pu||1))st.done=new Set();st.pu=u;st.done=st.done||new Set();
  st.F.forEach((f,i)=>{const fa=Math.atan2(f.oy,f.ox);let d=fa;
    while(d<a0)d+=TAU;while(d>a0+TAU)d-=TAU;
    if(!st.done.has(i)&&d<=cur&&Math.hypot(f.ox,f.oy)<SR+f.r){st.done.add(i);
      hitFoe(st,f,cx,cy,Math.cos(fa),Math.sin(fa),36);}});
  const RR=88;
  for(let k=0;k<3;k++){const a=t*2.3+k*TAU/3,p=[cx+Math.cos(a)*RR,cy+Math.sin(a)*RR*.55];
    st.tr[k].push(p);if(st.tr[k].length>14)st.tr[k].shift();
    for(const f of st.F)if(Math.hypot(cx+f.ox+f.kx-p[0],cy+f.oy+f.ky-p[1])<f.r+14)
      hitFoe(st,f,cx,cy,Math.cos(a),Math.sin(a),28);}
  st.ac=(st.ac||0)+dt;
  if(st.ac>.36){st.ac=0;st.ch=[];let cur2=[0,0];const used=new Set();
    for(let h=0;h<5;h++){let best=-1,bd=1e9;
      st.F.forEach((f,i)=>{if(used.has(i))return;const d=Math.hypot(f.ox-cur2[0],f.oy-cur2[1]);
        if(d<bd){bd=d;best=i;}});
      if(best<0)break;used.add(best);const f=st.F[best];st.ch.push([f.ox,f.oy]);
      hitFoe(st,f,cx,cy,0,0,8,"volt");cur2=[f.ox,f.oy];}st.cl=.32;}
  st.cl=Math.max(0,(st.cl||0)-dt);
  st.ig=(st.ig||0)+dt;
  if(st.ig>1.1){st.ig=0;const bx=(R()-.5)*180,by=(R()-.5)*110;st.bl={x:cx+bx,y:cy+by,l:0};
    for(const f of st.F)if(Math.hypot(f.ox-bx,f.oy-by)<60){hitFoe(st,f,cx,cy,0,-1,20,"ember");f.burn=2.2;}
    emit(st,cx+bx,cy+by,24,{k:"ember",sp:250,r:3.6,life:.6,spikeP:.6});}
  if(st.bl)st.bl.l+=dt;
  for(const f of st.F)if(f.burn>0)f.burn-=dt;
  stepP(st,dt);
  drawFoes(c,t,cx,cy,st.F);
  const fade=Math.max(0,1-Math.max(0,u-.26)/.5);
  if(sw>.02&&fade>0){const seg=Math.max(2,Math.round(24*sw));
    celRibbon(c,arcPts(cx,cy,SR,a1-(a1-a0)*sw,a1,seg),30*fade,"gold",fade);
    celRibbon(c,arcPts(cx,cy,SR*.7,a1-(a1-a0)*sw*.8,a1,seg),13*fade,"gold",fade*.7);}
  if(sw<1){const aa=a0+(a1-a0)*sw;celSplash(c,cx+Math.cos(aa)*SR,cy+Math.sin(aa)*SR,22,9,9,"gold",1);}
  celHoop(c,cx,cy,RR,.55,0,3,"gold",.3);
  for(let k=0;k<3;k++){celRibbon(c,st.tr[k],10,"gold",.95);
    const a=t*2.3+k*TAU/3;celSplash(c,cx+Math.cos(a)*RR,cy+Math.sin(a)*RR*.55,13,7,k*3+1,"gold",1);}
  if(st.cl>0&&st.ch){const f=st.cl/.32;let pv=[0,0];
    for(let i=0;i<st.ch.length;i++){const q=st.ch[i],seed=i*29+((t*20)|0),P=[],N=7;
      for(let s=0;s<=N;s++){const p=s/N;
        let nx=cx+pv[0]+(q[0]-pv[0])*p,ny=cy+pv[1]+(q[1]-pv[1])*p;
        if(s>0&&s<N){let dx=-(q[1]-pv[1]),dy=(q[0]-pv[0]);const L=Math.hypot(dx,dy)||1;
          const j=(hash(seed+s*13.7)-.5)*22;nx+=dx/L*j;ny+=dy/L*j;}
        P.push([nx,ny]);}
      celRibbon(c,P,9*f,"volt",f);pv=q;}}
  if(st.bl&&st.bl.l<.42){const f=1-st.bl.l/.42;
    celSplash(c,st.bl.x,st.bl.y,34*f+22*(1-f),11,13,"ember",f);
    for(let i=0;i<11;i++)celSpike(c,st.bl.x,st.bl.y,i/11*TAU,64*f*(.5+.5*hash(i*5.1)),9*f,"ember",f);
    shards(c,st.bl.x,st.bl.y+18,54,9,19,f*.7,"ember");}
  drawP(c,st);hero(c,t,cx,cy,"gold",1.25);
  const v=c.createRadialGradient(cx,cy,H*.32,cx,cy,W*.6);
  v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.7)");
  c.fillStyle=v;c.fillRect(0,0,W,H);
}

// ── 적 12종 — **외계 생물** ───────────────────────────────────────────────
//
// 지금 게임의 적은 「지뢰」로 읽힌다(2026-08-09 실기 판정). 원인이 감상이
// 아니라 코드에 있었다: 12종이 **둥근 로브 다각형 3장**으로 접혀 있고, 도감의
// 형태 데이터 6필드 중 눈 개수만 살아 있으며, 몸이 **자전**한다(구르는 물체는
// 생물이 아니다).
//
// 여기서 정하는 규칙 넷:
//   ① **가는 쪽을 본다.** 실루엣의 앞머리가 진행 방향이다. 자전 금지.
//   ② **갑각 + 부속지.** 매끈한 덩어리가 아니라 판과 다리·가시·지느러미가
//      붙은 몸. 스프라이트는 부팅 때 한 번 구우므로 실루엣이 복잡해도
//      런타임 비용이 안 는다(BASELINE: 병목은 픽셀 면적).
//   ③ **눈이 정체다.** 개수와 배치가 종을 가른다. 눈은 언제나 플레이어를 본다.
//   ④ **어두운 속 + 밝은 림.** 검은 배경에서 보이게 하는 유일한 장치라
//      이건 안 바꾼다.
//
// 좌표는 **앞이 +x** 인 단위 몸(반지름 1)이고, 그리는 쪽이 크기·각도를 준다.
// 채움은 **배경보다 확실히 밝아야** 한다. 게임 바닥(#060206)에서는 #150A12 가
// 덩어리로 읽히지만 이 시안 타일(#0C0C12)에서는 거의 같은 색이라 전부 철사
// 윤곽으로 보였다(2026-08-09 실기 확인). 실루엣이 먼저고 림은 그 다음이다.
const FOEDARK="#24141F", FOERIM="rgba(232,104,146,.95)", FOEEYE="#FF2D55";

/// 단위 다각형을 실제 좌표로 — [ang] 이 진행 방향, [ch] 이 꿈틀거림.
function foeShape(pts,x,y,r,ang,ch,t,seed){
  const ca=Math.cos(ang),sa=Math.sin(ang),P=[];
  for(let i=0;i<pts.length;i++){
    const w=1+ch*.05*Math.sin(t*ch*2.1+i*1.7+seed);   // 몸이 숨쉰다
    const lx=pts[i][0]*r*w,ly=pts[i][1]*r*w;
    P.push([x+lx*ca-ly*sa, y+lx*sa+ly*ca]);}
  return P;
}
function foeDraw(c,pts,x,y,r,ang,ch,t,seed,lw){
  const P=foeShape(pts,x,y,r,ang,ch,t,seed);
  c.beginPath();P.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();
  c.fillStyle=FOEDARK;c.fill();
  c.strokeStyle=FOERIM;c.lineWidth=lw||2.4;c.lineJoin="miter";c.miterLimit=6;c.stroke();
  return P;
}
/// 눈 — **언제나 플레이어를 본다.** [n] 개를 몸 앞쪽에 벌려 놓는다.
function foeEyes(c,x,y,r,n,px,py,sz){
  let ex=px-x,ey=py-y;const L=Math.hypot(ex,ey)||1;ex/=L;ey/=L;
  const gx=-ey,gy=ex,er=(sz||.16)*r;
  for(let i=0;i<n;i++){const o=(i-(n-1)/2)*r*.34;
    c.beginPath();c.arc(x+ex*r*.38+gx*o,y+ey*r*.38+gy*o,er,0,TAU);
    c.fillStyle=FOEEYE;c.fill();}
}

// 종별 실루엣 — 앞이 +x, 반지름 1.
/// 몸에서 뻗는 뾰족한 부속지 하나 — 다리·가시·지느러미가 전부 이걸로 된다.
/// [len]·[wid] 는 몸 반지름 배수.
function celLegs(c,x,y,r,ang,len,wid){
  const ca=Math.cos(ang),sa=Math.sin(ang),px=-sa,py=ca;
  const bx=x+ca*r*.82,by=y+sa*r*.82;
  const tx=x+ca*r*(.82+len),ty=y+sa*r*(.82+len);
  c.beginPath();
  c.moveTo(bx+px*r*wid,by+py*r*wid);c.lineTo(tx,ty);
  c.lineTo(bx-px*r*wid,by-py*r*wid);c.closePath();
  c.fillStyle=FOEDARK;c.fill();
  c.strokeStyle=FOERIM;c.lineWidth=1.8;c.stroke();
}

/// 관절 다리 하나 — **무릎에서 꺾여 몸 위로 아치를 그린다.** 곧은 가시(표류)와
/// 이것의 차이가 「잡몹과 왕」의 차이다. [ph] 로 걷는 위상을 준다.
/// **오동통한 마디** — 끝이 뾰족하지 않고 발이 둥글다. 곤충의 가시다리와
/// 반대말이고, 두꺼비·양서류가 이걸 쓴다.
function fatLimb(c,ax,ay,ang,len,w,toe){
  const bx=ax+Math.cos(ang)*len,by=ay+Math.sin(ang)*len;
  const nx=-Math.sin(ang),ny=Math.cos(ang);
  c.beginPath();
  c.moveTo(ax+nx*w,ay+ny*w);
  c.quadraticCurveTo(ax+Math.cos(ang)*len*.5+nx*w*1.35,
    ay+Math.sin(ang)*len*.5+ny*w*1.35,bx+nx*w*.75,by+ny*w*.75);
  c.arc(bx,by,w*.75,ang+Math.PI/2,ang-Math.PI/2,true);
  c.quadraticCurveTo(ax+Math.cos(ang)*len*.5-nx*w*1.35,
    ay+Math.sin(ang)*len*.5-ny*w*1.35,ax-nx*w,ay-ny*w);
  c.closePath();c.fillStyle=FOEDARK;c.fill();
  c.strokeStyle=FOERIM;c.lineWidth=2.4;c.stroke();
  if(toe)for(let i=-1;i<=1;i++){                 // 발가락 셋
    const q=ang+i*.42;
    c.beginPath();c.arc(bx+Math.cos(q)*w*.72,by+Math.sin(q)*w*.72,w*.34,0,TAU);
    c.fillStyle=FOEDARK;c.fill();
    c.strokeStyle=FOERIM;c.lineWidth=1.8;c.stroke();}
}

/// **휘는 마디** — 직선 마디는 기계이고, 살아 있는 다리는 굽는다.
/// [bow] 가 휘는 쪽과 정도(몸 반경 배).
function curveLimb(c,ax,ay,bx,by,w0,w1,bow){
  const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  const mx=(ax+bx)/2+nx*bow, my=(ay+by)/2+ny*bow;
  c.beginPath();
  c.moveTo(ax+nx*w0,ay+ny*w0);
  c.quadraticCurveTo(mx+nx*w0*.9,my+ny*w0*.9,bx+nx*w1,by+ny*w1);
  c.arc(bx,by,w1,Math.atan2(ny,nx),Math.atan2(-ny,-nx),false);
  c.quadraticCurveTo(mx-nx*w0*.9,my-ny*w0*.9,ax-nx*w0,ay-ny*w0);
  c.closePath();c.fillStyle=FOEDARK;c.fill();
  c.strokeStyle=FOERIM;c.lineWidth=2.4;c.stroke();
  return [mx,my];
}

/// 두꺼비 발 — **길고 가는 발가락이 넓게 벌어지고 끝마다 둥근 흡반.**
/// 짧은 삼각 발톱으로 그리면 곤충 다리가 된다(레퍼런스: 개구리 배면 사진).
/// [n] 발가락 수(앞 4 · 뒤 5), [web] 물갈퀴 여부.
function toadFoot(c,x,y,ang,r,n,len,web){
  const SPR=1.45, tip=[];
  for(let i=0;i<n;i++){
    const f=n===1?.5:i/(n-1);
    const q=ang+(f-.5)*2*SPR;
    const L=len*(.70+.42*Math.sin(f*Math.PI));   // 가운데 발가락이 제일 길다
    tip.push([x+Math.cos(q)*L, y+Math.sin(q)*L, q, L]);}
  if(web){                                        // 물갈퀴 — 발가락 밑을 잇는다
    c.beginPath();c.moveTo(x,y);
    for(const [tx,ty,q,L] of tip)
      c.lineTo(x+Math.cos(q)*L*.62,y+Math.sin(q)*L*.62);
    c.closePath();
    c.fillStyle="rgba(58,26,44,.85)";c.fill();
    c.strokeStyle=FOERIM;c.lineWidth=1.6;c.stroke();}
  for(let i=0;i<n;i++){
    const [tx,ty,q]=tip[i], bow=(i/(n-1)-.5)*r*.10;
    curveLimb(c,x,y,tx,ty,r*.075,r*.040,bow);
    c.beginPath();c.arc(tx,ty,r*.088,0,TAU);      // 흡반
    c.fillStyle=FOEDARK;c.fill();
    c.strokeStyle=FOERIM;c.lineWidth=1.8;c.stroke();}
}

/// 굵기가 변하는 마디 하나 — 다리·팔이 전부 이걸로 된다.
function limbSeg(c,ax,ay,bx,by,w0,w1){
  const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  c.beginPath();
  c.moveTo(ax+nx*w0,ay+ny*w0);c.lineTo(bx+nx*w1,by+ny*w1);
  c.lineTo(bx-nx*w1,by-ny*w1);c.lineTo(ax-nx*w0,ay-ny*w0);
  c.closePath();c.fillStyle=FOEDARK;c.fill();
  c.strokeStyle=FOERIM;c.lineWidth=2.2;c.stroke();
}

function jointLeg(c,x,y,r,ang,up,out,ph,wid,amp){
  const A=amp===undefined?.16:amp;
  const ca=Math.cos(ang),sa=Math.sin(ang);
  const bx=x+ca*r*.55,by=y+sa*r*.55;
  // 딛기(stance)와 내딛기(swing) — 무릎이 솟는 동안 발끝은 당겨진다.
  // 진폭 [A] 가 크면 「와다다다닥」, 작으면 살금살금이다.
  const lift=up*(1+A*Math.sin(ph));
  const kx=x+ca*r*lift-sa*r*.10, ky=y+sa*r*lift+ca*r*.10;
  const reach=out*(1-A*.75*Math.sin(ph));
  const tx=x+ca*r*reach, ty=y+sa*r*reach;
  limbSeg(c,bx,by,kx,ky,r*wid,r*wid*.72);             // 넓적다리
  limbSeg(c,kx,ky,tx,ty,r*wid*.72,r*wid*.16);         // 정강이 — 끝이 뾰족하다
}

/// 뱀 보스의 뻗음 정도(0~1) — 몸과 눈이 **같은 숫자**를 봐야 머리에서
/// 눈이 떨어지지 않는다.
function bossLunge(t){
  const u=(t%5.2)/5.2;
  if(u<.58)return 0;
  if(u<.72)return -.18*((u-.58)/.14);
  if(u<.80)return -.18+1.18*ease((u-.72)/.08);
  if(u<.87)return 1;
  return 1-ease((u-.87)/.13);
}

/// 뱀 머리의 크기 — **압축될 때 작아졌다가 뽀옹 하고 커진다.** 몸만 눌리면
/// 스프링의 절반이다. 튀어나갈 때 1 을 넘겨야(오버슈트) 「뽀옹」이 된다.
function bossHead(t){
  const u=(t%5.2)/5.2;
  if(u<.58)return 1;
  if(u<.72)return 1-.22*ease((u-.58)/.14);          // 쭈그러든다
  if(u<.80)return .78+.46*ease((u-.72)/.08);        // 뽀옹 — 1.24 까지
  if(u<.87)return 1.24-.19*((u-.80)/.07);
  return 1.05-.05*ease((u-.87)/.13);
}

// ── 위험 기하 ─────────────────────────────────────────────────────────────
//
// **공격 하나는 「위험 기하」를 한 번 선언하고, 예고·이펙트·판정이 전부 그
// 값만 읽는다.** 이 모듈이 없던 동안 예고와 이펙트가 각자 자기 숫자를
// 계산해, 어긋나는 사고가 네 번 연속 났다(끝점만 표시 / 도넛 vs 웅덩이 /
// 솟구침이 예고 밖 / 예고가 실제의 3배). 매번 그 자리만 고쳐서는 안 끝난다.
//
// ⚠️ **예고는 기하를 그대로 그린다 — 크기를 곱하지 않는다.** 옛 `aimMark` 는
// 넘긴 반경에 `(1.5-0.7k)` 를 곱해서, 같은 인자를 줘도 최종 원이 0.8배였다.
// 그게 사고의 절반이다. 조여드는 연출은 **점선 간격과 알파**로만 낸다.
//
// [DANGER] 는 이번 프레임의 위험 목록이고 `tools/zone_check.js` 가 읽는다 —
// 위험 밖에 그려진 이펙트도, 이펙트 없는 위험도 **둘 다 실패**다.
let DANGER=[];
const zoneC=(x,y,r,sq)=>({t:'c',x,y,r,sq:sq===undefined?.62:sq});
const zoneL=(x,y,ang,len,halfW)=>({t:'l',x,y,ang,len,halfW});

/// 위험을 등록하고 그대로 돌려준다 — 선언과 사용이 한 줄에서 끝나게.
function dz(z){DANGER.push(z);return z;}

/// 예고 — [k] 0→1 로 **조여드는 것은 점선과 알파뿐**, 기하는 안 변한다.
function aimZone(c,z,k){
  if(k<=.02)return;
  c.save();c.globalAlpha=Math.min(1,k)*.9;
  const dash=z.t==='c'?z.r:z.halfW;
  c.setLineDash([dash*(.34-.18*k),dash*(.26-.14*k)]);
  c.strokeStyle="rgba(255,80,110,.95)";c.lineWidth=2.6;
  if(z.t==='c'){
    c.beginPath();c.ellipse(z.x,z.y,z.r,z.r*z.sq,0,0,TAU);c.stroke();
    c.setLineDash([]);
    c.beginPath();c.ellipse(z.x,z.y,z.r*.10,z.r*z.sq*.10,0,0,TAU);
    c.fillStyle="rgba(255,80,110,.9)";c.fill();
  }else{
    const nx=-Math.sin(z.ang),ny=Math.cos(z.ang);
    for(const sg of[-1,1]){
      c.beginPath();
      c.moveTo(z.x+nx*sg*z.halfW,z.y+ny*sg*z.halfW);
      c.lineTo(z.x+Math.cos(z.ang)*z.len+nx*sg*z.halfW,
               z.y+Math.sin(z.ang)*z.len+ny*sg*z.halfW);
      c.stroke();}
    c.setLineDash([]);
    c.beginPath();
    c.ellipse(z.x+Math.cos(z.ang)*z.len,z.y+Math.sin(z.ang)*z.len,
      z.halfW*.55,z.halfW,z.ang,0,TAU);c.stroke();
  }
  c.restore();
}

/// 판정 — 그린 것과 **같은 기하**를 쓴다.
function inZone(z,px,py){
  if(z.t==='c'){const dx=(px-z.x)/z.r,dy=(py-z.y)/(z.r*z.sq);
    return dx*dx+dy*dy<=1;}
  const dx=px-z.x,dy=py-z.y;
  const along=dx*Math.cos(z.ang)+dy*Math.sin(z.ang);
  const side=-dx*Math.sin(z.ang)+dy*Math.cos(z.ang);
  return along>=0&&along<=z.len&&Math.abs(side)<=z.halfW;
}

/// 이펙트를 위험 안으로 조인다 — 넘칠 수 있는 그림은 이걸 통과시킨다.
function clampZone(z,px,py){
  if(z.t!=='c')return[px,py];
  const dx=(px-z.x)/z.r,dy=(py-z.y)/(z.r*z.sq);
  const d=Math.hypot(dx,dy);
  if(d<=1)return[px,py];
  return[z.x+dx/d*z.r, z.y+dy/d*z.r*z.sq];
}

/// 타겟 표식 — **어디를 칠 것인지 미리 알린다.** 보스의 큰 한 방은 「피할 수
/// 있는 것」이어야 하고, 그러려면 발동 전에 자리를 보여줘야 한다(스펙:
/// 피할 수 없는 것은 작게, 피할 수 있는 것은 크게).
/// [k] 는 0→1 로 조여드는 정도.
function aimMark(c,x,y,tx,ty,r,k){
  if(k<=.02)return;
  c.save();c.globalAlpha=Math.min(1,k)*.9;
  c.setLineDash([r*.22,r*.16]);
  c.beginPath();c.arc(tx,ty,r*(1.5-.7*k),0,TAU);
  c.strokeStyle="rgba(255,80,110,.95)";c.lineWidth=2.4;c.stroke();
  c.setLineDash([]);
  c.beginPath();c.arc(tx,ty,r*.20*k,0,TAU);
  c.fillStyle="rgba(255,80,110,.9)";c.fill();
  c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);
  c.strokeStyle="rgba(255,80,110,.35)";c.lineWidth=1.6;c.stroke();
  c.restore();
}

/// 거미줄 그물 — 고치가 터져 펴진 것. 방사살 여덟 + 동심 줄 넷이고,
/// **줄이 살 사이에서 안으로 처진다**(sag) — 그게 거미줄의 문법이다.
/// 곧은 다각형이면 그물이 아니라 과녁이 된다.
function spiderWeb(c,x,y,R,k,al){
  if(k<=.02||al<=.02)return;
  // **촘촘해야 그물이다.** 살 여덟에 줄 넷이면 과녁에 가깝다 — 살 16 · 줄 9,
  // 그리고 안쪽으로 갈수록 줄 간격이 좁아진다(실제 거미줄이 그렇다).
  // 살은 가늘게, 줄은 더 가늘게: 굵기가 같으면 격자무늬가 된다.
  const S=16,G=9,rr=R*k;
  c.save();c.globalAlpha=al;
  c.strokeStyle="rgba(232,226,245,.85)";c.lineCap="round";
  for(let i=0;i<S;i++){const q=i/S*TAU+hash(i*3.1)*.06;   // 방사살 — 살짝 불규칙
    c.beginPath();c.moveTo(x,y);
    c.lineTo(x+Math.cos(q)*rr,y+Math.sin(q)*rr);
    c.lineWidth=1.3;c.stroke();}
  for(let g=1;g<=G;g++){
    // 간격이 바깥으로 갈수록 넓다 — 안쪽이 촘촘한 것이 거미줄의 문법
    const d=rr*Math.pow(g/G,1.35);
    c.beginPath();
    for(let i=0;i<=S;i++){const q=i/S*TAU+hash(i*3.1)*.06;
      const mq=q-Math.PI/S, md=d*.86;             // 살 사이가 안으로 처진다
      if(i===0)c.moveTo(x+Math.cos(q)*d,y+Math.sin(q)*d);
      else c.quadraticCurveTo(x+Math.cos(mq)*md,y+Math.sin(mq)*md,
        x+Math.cos(q)*d,y+Math.sin(q)*d);}
    c.lineWidth=.95;c.stroke();}
  // 걸린 자리 — 실이 끊어져 늘어진 가닥 몇
  c.globalAlpha=al*.7;
  for(let i=0;i<5;i++){const q=hash(i*7.7)*TAU, d=rr*(.45+.5*hash(i*5.3));
    c.beginPath();c.moveTo(x+Math.cos(q)*d,y+Math.sin(q)*d);
    c.lineTo(x+Math.cos(q+.35)*d*1.22,y+Math.sin(q+.35)*d*1.22);
    c.lineWidth=1.1;c.stroke();}
  c.restore();
}

/// 지그재그 — **쉭- 쉭- 쉭-.** 구간마다 새 목적지로 튕겨 갔다 멎는다.
/// 한 구간의 앞 45% 안에 이동을 끝내고 나머지는 서 있으므로 「미끄러진다」가
/// 아니라 「튀었다 선다」가 된다. 목적지는 해시라 예측이 안 되고, 범위가
/// 묶여 있어 화면 밖으로 안 달아난다. 상태를 안 들어 스폰·재사용에 면역.
function zigzag(t,r,seed){
  const T=.42,k=Math.floor(t/T),f=t/T-k;
  const pt=n=>[(hash(seed+n*3.1)-.5)*r*1.6,(hash(seed+n*7.7)-.5)*r*1.2];
  const A=pt(k),B=pt(k+1);
  const e=Math.min(1,f/.45), w=1-(1-e)*(1-e)*(1-e);
  return [A[0]+(B[0]-A[0])*w, A[1]+(B[1]-A[1])*w,
          Math.max(0,1-f/.30), Math.atan2(B[1]-A[1],B[0]-A[0])];
}

/// 통로 예고 — **지나가는 길 전체가 공격 범위인 공격**용. 끝점에 원만
/// 그리면 「저기만 피하면 된다」로 읽히는데, 혀·빔처럼 훑고 가는 것은
/// 경로 전부가 맞는 자리다.
function aimLane(c,x,y,ang,len,halfW,k){
  if(k<=.02)return;
  const nx=-Math.sin(ang),ny=Math.cos(ang);
  c.save();c.globalAlpha=Math.min(1,k)*.85;
  c.setLineDash([halfW*.55,halfW*.42]);
  for(const sg of[-1,1]){
    c.beginPath();
    c.moveTo(x+nx*sg*halfW,y+ny*sg*halfW);
    c.lineTo(x+Math.cos(ang)*len+nx*sg*halfW,y+Math.sin(ang)*len+ny*sg*halfW);
    c.strokeStyle="rgba(255,80,110,.95)";c.lineWidth=2.4;c.stroke();}
  c.setLineDash([]);
  c.beginPath();
  c.ellipse(x+Math.cos(ang)*len,y+Math.sin(ang)*len,halfW*.55,halfW,ang,0,TAU);
  c.strokeStyle="rgba(255,80,110,.95)";c.lineWidth=2.4;c.stroke();
  c.restore();
}

/// 속도선 — **뻗는 동안만.** 뒤로 늘어진 가는 획 몇 개가 「빠르다」를
/// 말한다. 항상 켜두면 장식이 되고, 실행 구간에만 나와야 사건이 된다.
function speedLines(c,x,y,ang,r,k,seed){
  if(k<=.02)return;
  const px=-Math.sin(ang),py=Math.cos(ang);
  c.save();c.globalAlpha=Math.min(1,k)*.8;
  for(let i=0;i<6;i++){
    const o=(hash(seed+i*3.1)-.5)*r*1.9;
    const bx=x+px*o,by=y+py*o;
    const L=r*(1.4+2.4*hash(seed+i*7.7))*k;
    c.beginPath();
    c.moveTo(bx-Math.cos(ang)*r*.25,by-Math.sin(ang)*r*.25);
    c.lineTo(bx-Math.cos(ang)*L,by-Math.sin(ang)*L);
    c.strokeStyle=FOERIM;c.lineWidth=1.4+1.6*hash(seed+i*11.3);c.stroke();}
  c.restore();
}

/// 거미 보스의 뻗음 정도 — 몸과 눈이 **같은 숫자**를 본다.
function spiderLunge(t){
  const u=(t%4.6)/4.6;
  if(u<.60)return 0;
  if(u<.72)return -.10*((u-.60)/.12);
  if(u<.90)return -.10+1.10*ease((u-.72)/.18);
  return 1-ease((u-.90)/.10);
}

/// 보스의 눈 — **아가리 위에 몰린 무리.** 줄 맞춰 놓으면 얼굴이 되고,
/// 얼굴은 무섭지 않다. 크기가 다른 여럿이 따로 깜빡여야 「여러 개가 나를
/// 본다」가 된다.
function bossEyes(c,x,y,r,a,px,py,t){
  let ex=px-x,ey=py-y;const L=Math.hypot(ex,ey)||1;ex/=L;ey/=L;
  const hx=x+Math.cos(a)*r*.30, hy=y+Math.sin(a)*r*.30;   // 머리 위
  for(let i=0;i<8;i++){
    const q=a+(hash(i*4.1)-.5)*1.6, d=r*(.10+.26*hash(i*7.7));
    const bx=hx+Math.cos(q)*d, by=hy+Math.sin(q)*d;
    const blink=Math.max(0,Math.sin(t*(1.1+hash(i*2.9))+i*2.3));
    const er=r*(.05+.055*hash(i*11.3))*(.5+.5*blink);
    c.beginPath();c.arc(bx+ex*er*.5,by+ey*er*.5,er,0,TAU);
    c.fillStyle=FOEEYE;c.globalAlpha=.5+.5*blink;c.fill();c.globalAlpha=1;}
}

/// 종별 그림 — **몸 설계가 달라야 구분된다.** 반지름 1짜리 볼록 다각형만
/// 바꾸면 세부만 다르고 전부 같은 덩어리로 읽힌다(2026-08-09 실기 판정).
/// 가르는 축 넷: **덩어리 개수 · 가로세로비 · 대칭 방식 · 빈 공간.**
/// 좌표는 앞이 +x 인 단위 몸이고, 크기·각도는 그리는 쪽이 준다.
const FOEART={
  // 기본형 — **아무 특징이 없는 것이 특징이다.** 전부 개성 있게 만들면
  // 기준선이 사라져 「특별한 놈」이 하나도 없게 된다. 스테이지 1의 첫 1분.
  grunt(c,x,y,r,a,t){
    const P=[],n=9;
    for(let i=0;i<n;i++){const q0=i/n*TAU,q1=(i+.5)/n*TAU;
      P.push([Math.cos(q0)*1.06,Math.sin(q0)*1.06]);
      const w=.76+.06*Math.sin(t*1.4+i);
      P.push([Math.cos(q1)*w,Math.sin(q1)*w]);}
    foeDraw(c,P,x,y,r,a,1.4,t,2.7,2.6);},

  // 성게 — **만지지 마라.** 표류가 「다리가 몸보다 큰 것」이라면 성게는
  // 「몸이 가시로 덮인 것」이다: 길고 적고 움직이는 다리(6) ↔ 짧고 촘촘하고
  // 뻣뻣한 가시(26). 둘 다 방사 대칭이지만 밀도가 정반대라 안 겹친다.
  //
  // **가까워지면 가시가 곤두선다.** 그 한 가지가 「닿으면 아프다」를 말하고,
  // 접촉 피해가 큰 이 적의 성격이 형태의 변화로 예고된다.
  urchin(c,x,y,r,a,t){
    const bristle=.5+.5*Math.sin(t*1.9);           // 곤두섬
    for(let i=0;i<26;i++){
      const q=i/26*TAU+hash(i*3.1)*.10;
      const L=(i%2?.62:.92)*(1+.22*bristle);
      celLegs(c,x,y,r*.72,q,L,.055+.02*hash(i*7.7));}
    foeDraw(c,[[1,0],[.87,.5],[.5,.87],[0,1],[-.5,.87],[-.87,.5],[-1,0],
      [-.87,-.5],[-.5,-.87],[0,-1],[.5,-.87],[.87,-.5]],x,y,r*.72,a,1.1,t,61.7,2.8);
    // 갑판 무늬 — 다섯 갈래(극피동물의 오방사)
    for(let i=0;i<5;i++){const q=a+i/5*TAU;
      c.beginPath();c.moveTo(x,y);
      c.lineTo(x+Math.cos(q)*r*.66,y+Math.sin(q)*r*.66);
      c.strokeStyle="rgba(232,104,146,.40)";c.lineWidth=1.6;c.stroke();}},

  // 표류 — **방사 대칭 진드기.** 작은 코어 + 길게 뻗은 다리 여섯. 몸이
  // 아니라 다리가 실루엣의 대부분이라 「기어온다」로 읽힌다.
  drifter(c,x,y,r,a,t){
    for(let i=0;i<6;i++){const q=a+i/6*TAU+Math.sin(t*1.6+i)*.14;
      celLegs(c,x,y,r*.52,q,1.35,.11);}
    foeDraw(c,[[1,0],[.5,.87],[-.5,.87],[-1,0],[-.5,-.87],[.5,-.87]],
      x,y,r*.55,a,1.6,t,3.1);},

  // 질주 — **속도가 곧 실루엣.** 몸은 작은 촉끝뿐이고 뒤로 찢어진 조각 셋이
  // 따라붙는다. 「빠르다」를 색이 아니라 모양이 말한다.
  runner(c,x,y,r,a,t){
    const ca=Math.cos(a),sa=Math.sin(a);
    for(let i=2;i>=0;i--){const d=-(.9+i*.85)*r,w=1-i*.26;
      foeDraw(c,[[.9,0],[-.2,.34],[-1.1,.12],[-1.1,-.12],[-.2,-.34]],
        x+ca*d,y+sa*d,r*.52*w,a,2.6,t,7.7+i*3,1.5+i*.2);}
    foeDraw(c,[[2.1,0],[.2,.48],[-.9,.22],[-.9,-.22],[.2,-.48]],
      x,y,r*.62,a,2.6,t,7.7,2.6);},

  // 무리 — **한 마리가 아니라 떼다.** 하나만 그리면 작은 점이고, 떼로
  // 그려야 이 적의 정체(하나의 형태로 몰려온다)가 보인다.
  swarm(c,x,y,r,a,t){
    const one=[[2.2,0],[0,.62],[-1.1,.34],[-1.1,-.34],[0,-.62]];
    for(let i=0;i<9;i++){const q=i/9*TAU+t*.5;
      const d=r*(1.4+.5*Math.sin(t*1.7+i*2.1));
      foeDraw(c,one,x+Math.cos(q)*d,y+Math.sin(q)*d,r*.42,
        a+Math.sin(t*2+i)*.4,3.0,t,i*4.7,1.6);}},

  // 자폭 — **부속지가 없는 유일한 종.** 매끈하게 부푼 구에 이음새만.
  bomber(c,x,y,r,a,t){
    const b=1+.07*Math.sin(t*3.2);
    foeDraw(c,[[1,0],[.87,.5],[.5,.87],[0,1],[-.5,.87],[-.87,.5],[-1,0],
      [-.87,-.5],[-.5,-.87],[0,-1],[.5,-.87],[.87,-.5]],x,y,r*b,a,.4,t,37.3,3);
    c.beginPath();c.ellipse(x,y,r*b*.99,r*b*.32,a,0,TAU);
    c.strokeStyle=FOERIM;c.lineWidth=1.6;c.stroke();
    c.beginPath();c.ellipse(x,y,r*b*.32,r*b*.99,a,0,TAU);c.stroke();},

  // 돌진 — **생물이 아니라 무기.** 미늘 작살 + 뒤로 뻗은 깃 셋. 유기적인
  // 몸이 아예 없어서 「던져진 것」으로 읽힌다.
  charger(c,x,y,r,a,t){
    const ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca;
    foeDraw(c,[[2.3,0],[.9,.34],[1.15,.62],[.35,.50],[.35,-.50],[1.15,-.62],
      [.9,-.34]],x,y,r*.9,a,2.2,t,17.9,2.8);
    c.beginPath();
    c.moveTo(x+ca*r*.5+px*r*.13,y+sa*r*.5+py*r*.13);
    c.lineTo(x-ca*r*1.5+px*r*.09,y-sa*r*1.5+py*r*.09);
    c.lineTo(x-ca*r*1.5-px*r*.09,y-sa*r*1.5-py*r*.09);
    c.lineTo(x+ca*r*.5-px*r*.13,y+sa*r*.5-py*r*.13);
    c.closePath();c.fillStyle=FOEDARK;c.fill();
    c.strokeStyle=FOERIM;c.lineWidth=2.2;c.stroke();
    for(const sg of[-1,1])for(let i=0;i<3;i++){
      const bx=x-ca*r*(.7+i*.42),by=y-sa*r*(.7+i*.42);
      c.beginPath();c.moveTo(bx,by);
      c.lineTo(bx-ca*r*.45+px*sg*r*.52,by-sa*r*.45+py*sg*r*.52);
      c.lineTo(bx-ca*r*.55,by-sa*r*.55);c.closePath();
      c.fillStyle=FOEDARK;c.fill();
      c.strokeStyle=FOERIM;c.lineWidth=1.6;c.stroke();}},

  // 보스 A(거미) — **표류의 왕.** 통과한 표류(작은 코어 + 방사 다리)의
  // 계보를 잇되 차이를 **관절**로 준다: 곧은 가시가 아니라 무릎에서 꺾여
  // 몸 위로 아치를 그리는 다리 여덟.
  bossSpider(c,x,y,r,a,t){
    // **교대 사족보행.** 진짜 거미는 다리를 네 개씩 번갈아 낸다 — 그게
    // 「와다다다닥」의 정체다. 짝수·홀수 다리에 위상 π 를 준다.
    // 그리고 웅크림 → 와다다다 → 안착의 순환이 있어야 「달려든다」가 된다.
    const P=8.0,u=(t%P)/P;
    let hz=2.2,amp=.16,lunge=0,tuck=0;
    let web=0,gape=0;                              // 거미줄 진행 / 입 벌림
    if(u<.34){}                                    // 평상 — 느리게 더듬는다
    else if(u<.41){const k=(u-.34)/.07;            // 웅크림 — 다리를 당긴다
      hz=2.2+3*k;amp=.16+.10*k;tuck=.26*k;lunge=-.10*k;}
    else if(u<.52){const k=(u-.41)/.11;            // 와다다다닥
      hz=16;amp=.62;tuck=.26*(1-k);lunge=-.10+1.10*ease(k);}
    else if(u<.60){const k=ease((u-.52)/.08);      // 안착
      hz=16-13.8*k;amp=.62-.46*k;lunge=1-k;}
    else if(u<.72){gape=ease((u-.60)/.12);hz=2.6;} // 입을 벌린다 — 예비동작
    else{web=(u-.72)/.28;gape=Math.max(0,1-web*3);hz=2.6;}
    const hx=x+Math.cos(a)*r*1.5*lunge, hy=y+Math.sin(a)*r*1.5*lunge;
    speedLines(c,hx,hy,a,r,Math.max(0,(lunge-.15)*1.2),61.3);
    const gait=t*hz;
    for(let i=0;i<8;i++)
      jointLeg(c,hx,hy,r,a+Math.PI/2+(i-3.5)*.62,
        1.05-tuck,2.35-tuck*1.5,gait+(i%2?Math.PI:0)+i*.16,.13,amp);
    foeDraw(c,[[.5,.62],[-.2,.98],[-.9,.66],[-1.12,0],[-.9,-.66],[-.2,-.98],
      [.5,-.62]],hx-Math.cos(a)*r*.34,hy-Math.sin(a)*r*.34,r*.92,a,1.0,t,47.3,3.4);
    foeDraw(c,[[1.0,.30],[.52,.62],[-.24,.56],[-.48,0],[-.24,-.56],[.52,-.62],
      [1.0,-.30]],hx+Math.cos(a)*r*.52,hy+Math.sin(a)*r*.52,r*.62,a,1.0,t,53.1,3);
    // 엄니 — 거미줄을 뱉을 땐 벌어진다
    for(const sg of[-1,1])
      celLegs(c,hx+Math.cos(a)*r*.72,hy+Math.sin(a)*r*.72,r*.40,
        a+sg*(.34+gape*.55),.90+gape*.35,.10);
    // **고치를 던지고, 떨어지면 그물로 펴진다.**
    //
    // ⚠️ 탑다운에는 「위」가 없어 포물선을 그릴 수가 없다 — 대신 **그림자는
    // 직선으로 가고 몸만 화면 위로 떴다 내려온다**. 둘이 벌어졌다 다시 만나는
    // 것이 「떴다 떨어졌다」의 전부다. 그림자가 없으면 그냥 위로 날아간다.
    const AIM=r*4.6, tx2=hx+Math.cos(a)*AIM, ty2=hy+Math.sin(a)*AIM;
    if(gape>.02)aimMark(c,hx,hy,tx2,ty2,r*1.05,gape);
    if(web>0&&web<1){
      const fly=Math.min(1,web/.42), nk=Math.max(0,(web-.42)/.58);
      if(fly<1){
        const gx=hx+(tx2-hx)*fly, gy=hy+(ty2-hy)*fly;   // 그림자 — 직선
        const lift=Math.sin(fly*Math.PI)*r*1.35;        // 뜬 높이
        c.save();c.globalAlpha=.45;
        c.beginPath();c.ellipse(gx,gy,r*.26,r*.10,0,0,TAU);
        c.fillStyle="#07040A";c.fill();c.restore();
        // 고치 — 실로 칭칭 감긴 방추형. 천천히 돈다.
        const cxx=gx, cyy=gy-lift, sp=a+fly*3.2;
        c.save();c.translate(cxx,cyy);c.rotate(sp);
        c.beginPath();c.ellipse(0,0,r*.40,r*.26,0,0,TAU);
        c.fillStyle="rgba(226,214,240,.82)";c.fill();
        c.strokeStyle="rgba(255,255,255,.9)";c.lineWidth=2;c.stroke();
        for(let i=-2;i<=2;i++){                         // 감긴 실
          c.beginPath();c.moveTo(i*r*.13,-r*.24);
          c.quadraticCurveTo(i*r*.13+r*.05,0,i*r*.13,r*.24);
          c.strokeStyle="rgba(140,130,165,.75)";c.lineWidth=1.4;c.stroke();}
        c.restore();}
      // 착탄 — **쫙 펴진다.** 튀는 순간 크게 넘겼다가 제 크기로 앉는다.
      if(nk>0){
        const grow=nk<.22?ease(nk/.22)*1.18:1.18-.18*Math.min(1,(nk-.22)/.25);
        spiderWeb(c,tx2,ty2,r*1.9,grow,Math.max(0,1-Math.max(0,nk-.55)/.45));}}},

  // 보스 B(뱀) — 정체는 형태가 아니라 **자아**다.
  //   ① 몸은 쉬지 않고 꾸물거린다 — 주기가 안 맞는 사인 둘을 겹쳐 되풀이가
  //      눈에 안 잡히게. 규칙이 보이면 기계가 된다
  //   ② 머리만 나를 본다 — 몸의 파도와 무관하게 따로 돈다
  //   ③ 가끔 딴 데를 보다가 홱 돌아온다 — 이 한 가지가 「생각한다」다
  boss(c,x,y,r,a,t){
    // ④ **똬리 → 예비동작 → 뻗음 → 복귀.** 이 순환이 있어야 「결정하고
    //    실행한다」가 된다. 예비동작에서 오히려 **더 조인다**(뒤로 당긴다) —
    //    반대로 움직였다 나가는 것이 「곧 온다」를 말하는 가장 싼 방법이다.
    // **스프링.** 곡률만 조여서는 「감긴다」이지 「눌린다」가 아니다 —
    // 눌리는 것은 **마디 간격**(sq)이다. 쭈와악 압축됐다 튀어나가며
    // 1 을 넘겨 오버슈트했다가 돌아온다.
    const P=5.2,u=(t%P)/P;
    let coil=1,lunge=0,calm=1,sq=1,dash=0;
    if(u<.58){}                                          // 똬리 — 꾸물거린다
    else if(u<.72){const k=ease((u-.58)/.14);             // 압축 — 쭈와악
      coil=1+.62*k;lunge=-.20*k;calm=1-.6*k;sq=1-.54*k;}
    else if(u<.80){const k=ease((u-.72)/.08);             // 발사 — 일자로 뻗는다
      coil=1.62-1.57*k;lunge=-.20+1.20*k;calm=.4-.4*k;
      sq=.46+.99*k;dash=k;}
    else if(u<.87){const k=(u-.80)/.07;                   // 뻗은 채로 잠깐
      coil=.05;lunge=1;calm=0;sq=1.45-.30*k;dash=1-k;}
    else{const k=ease((u-.87)/.13);                       // 복귀 — 다시 감긴다
      coil=.05+.95*k;lunge=1-k;calm=k;sq=1.15-.15*k;}
    const away=Math.max(0,Math.sin(t*.31)-.82)*7.4
              +Math.max(0,Math.sin(t*.19+2.1)-.88)*8.0;
    const head=a+away*1.15*calm;                          // 뻗는 중엔 안 두리번댄다
    const hx=x+Math.cos(head)*r*1.5*lunge, hy=y+Math.sin(head)*r*1.5*lunge;
    // **어디로 달려들지 먼저 보여준다.** 압축하는 동안 표식이 조여들고,
    // 뻗는 순간 그 자리에 도착한다 — 플레이어가 패턴을 읽을 수 있어야 한다.
    const aimT=u>=.58&&u<.80?(u<.72?(u-.58)/.14:1):0;
    // **예고하면 넓어도 된다.** 자리를 미리 보여주는 공격은 피할 수 있으므로
    // 범위가 클수록 「크고 무서운 한 방」이 되고, 좁으면 예고가 아깝다.
    aimMark(c,x,y,x+Math.cos(head)*r*1.5,y+Math.sin(head)*r*1.5,r*1.25,aimT);
    speedLines(c,hx,hy,head,r,dash,53.7);      // 속도선 — 뻗는 동안만
    const N=17,seg=[];
    let bx=hx,by=hy,ang=head+Math.PI;
    for(let i=0;i<N;i++){
      seg.push([bx,by,ang,i]);
      // 곧게 펴질수록 마디가 벌어진다 — 「늘어나서 달려든다」
      const step=r*(.30+.20*Math.max(0,1-coil))*sq;
      ang+=(.40+Math.sin(t*1.7-i*.62)*.30*calm
              +Math.sin(t*.9+i*1.13)*.18*calm)*coil;
      bx+=Math.cos(ang)*step;by+=Math.sin(ang)*step;}
    for(let i=N-1;i>=1;i--){
      const sx=seg[i][0],sy=seg[i][1],sa2=seg[i][2],u=seg[i][3]/(N-1);
      foeDraw(c,[[.9,0],[0,1],[-.9,.55],[-.9,-.55],[0,-1]],
        sx,sy,r*(.62-.44*u),sa2+Math.PI,1.0,t,47.3+i*2.7,2.6-u*1.0);}
    for(const sg of[-1,1])                     // 엄니도 머리를 따라 커진다
      celLegs(c,hx+Math.cos(head)*r*.30*bossHead(t),
        hy+Math.sin(head)*r*.30*bossHead(t),r*.50*bossHead(t),
        head+sg*.38,.95,.11);
    const HEAD=[[1.25,0],[.55,.72],[-.35,.82],[-.85,.34],[-.85,-.34],
      [-.35,-.82],[.55,-.72]], hs=bossHead(t);
    if(dash>.05){c.save();                      // 잔상 — 지나간 자리
      for(let i=2;i>=1;i--){c.globalAlpha=dash*(.30-i*.08);
        foeDraw(c,HEAD,hx-Math.cos(head)*r*.55*i,hy-Math.sin(head)*r*.55*i,
          r*.74*hs,head,1.0,t,53.1,2.2);}
      c.restore();}
    foeDraw(c,HEAD,hx,hy,r*.74*hs,head,1.0,t,53.1,3.4);},
  // 보스 C(스콜피온) — **위협이 둘이다: 집게와 꼬리.** 그래서 패턴도 둘이다.
  //   A 집게 — 양팔을 크게 **벌렸다가 모아 찍는다.** 앞으로 쭉 뻗으면
  //     찌르기이지 찍기가 아니다. 벌림이 곧 예고이고, 모으는 순간이 타격이다
  //   B 꼬리 — 치켜들고 **독을 일자로 팡팡팡** 쏜다. 너무 빠르지 않게 —
  //     한 발 한 발이 보이고 사이로 피할 수 있어야 패턴이다.
  //     **묻으면 계속 아프다** — 맞는 순간이 아니라 묻은 뒤가 본체다.
  //     즉발 피해는 작고 지속 피해가 크다(스펙 §독: 약한 도트 8초, 중첩)
  //
  // ⚠️ 탑다운에는 「위」가 없다. 꼬리는 ① 좌우로 흔들리고 ② **맨 마지막에
  // 그려** 넘어온 것으로 읽힌다 — 그리는 순서가 곧 높이다.
  bossScorp(c,x,y,r,a,t){
    const P=10.0,u=(t%P)/P;
    let rear=0,whip=0,open=.5,spread=0,slam=0,volley=-1;
    if(u<.22)open=.5+.30*Math.sin(t*1.3);                    // 평상
    else if(u<.36){const k=ease((u-.22)/.14);                // A 벌린다 — 예고
      spread=k;open=.35+.65*k;}
    else if(u<.42){const k=ease((u-.36)/.06);                // A 모아 찍는다
      spread=1-1.45*k;open=1-k;slam=k;}
    else if(u<.52){const k=ease((u-.42)/.10);                // A 복귀
      spread=-.45+.45*k;open=k*.5;slam=1-k;}
    else if(u<.64){rear=ease((u-.52)/.12);open=.3;}          // B 치켜든다
    else if(u<.90){rear=1;open=.3;volley=(u-.64)/.26;}       // B 팡팡팡
    else{rear=1-ease((u-.90)/.10);open=.3+.2*ease((u-.90)/.10);}
    const sway=Math.sin(t*1.15)*(.30+.40*rear)*(1-whip);
    for(const side of[-1,1])for(let i=0;i<4;i++)             // 다리 좌우 넷씩
      jointLeg(c,x,y,r,a+side*Math.PI/2+(i-1.5)*.40*side,.72,1.45,
        t*3.2+(i%2?Math.PI:0)+(side<0?Math.PI/2:0),.09,.22);
    for(let i=3;i>=0;i--)                                    // 몸 — 마디 넷
      foeDraw(c,[[.9,.72],[0,.95],[-.9,.72],[-1.0,-.72],[0,-.95],[.9,-.72]],
        x-Math.cos(a)*r*.42*i,y-Math.sin(a)*r*.42*i,r*(.72-i*.11),a,1.0,t,
        71+i*3,3);
    // 팔 — 어깨 → 팔꿈치 → 집게. 벌림(spread)이 세 각을 함께 연다.
    for(const sg of[-1,1]){
      const A=(base,d)=>[x+Math.cos(a+sg*base)*r*d, y+Math.sin(a+sg*base)*r*d];
      const sh=A(1.02+spread*.28, .80);
      const el=A(.62+spread*.62, 1.62+spread*.20);
      const cl=A(.26+spread*.86, 2.55+spread*.30-slam*.35);
      limbSeg(c,sh[0],sh[1],el[0],el[1],r*.20,r*.16);
      limbSeg(c,el[0],el[1],cl[0],cl[1],r*.16,r*.13);
      const ca2=a-sg*(.20-spread*.55);
      foeDraw(c,[[1.15,.34],[.2,.62],[-.8,.30],[-.8,-.30],[.2,-.62],[1.15,-.34]],
        cl[0],cl[1],r*.50,ca2,1.0,t,89+sg,2.8);
      for(const f of[1,-1])                                  // 벌어지는 발톱
        celLegs(c,cl[0],cl[1],r*.44,ca2+f*open*.60,1.7,.10);
      if(slam>.05)speedLines(c,cl[0],cl[1],a+sg*1.1,r*.9,slam,91+sg);}
    // 찍는 자리 — **어디를 찍을지 먼저 보여준다**
    aimMark(c,x,y,x+Math.cos(a)*r*2.2,y+Math.sin(a)*r*2.2,r*1.15,
      spread>0?spread:0);   // 예고하는 공격은 넓어도 된다
    foeDraw(c,[[1.0,.42],[.2,.66],[-.7,.42],[-.7,-.42],[.2,-.66],[1.0,-.42]],
      x+Math.cos(a)*r*.62,y+Math.sin(a)*r*.62,r*.54,a,1.0,t,97,3);
    // 꼬리 — 맨 마지막. 몸·집게·머리 위로 지나가야 「넘어왔다」가 된다.
    let q=a+Math.PI+sway,tx=x-Math.cos(a)*r*1.30,ty=y-Math.sin(a)*r*1.30;
    const bend=.36+.16*rear+.20*whip;
    for(let i=0;i<8;i++){
      q-=bend;
      tx+=Math.cos(q)*r*.40;ty+=Math.sin(q)*r*.40;
      foeDraw(c,[[.9,0],[0,1],[-.9,.6],[-.9,-.6],[0,-1]],
        tx,ty,r*(.32-i*.026),q+Math.PI,1.0,t,79+i*2,2.6-i*.12);}
    celLegs(c,tx,ty,r*.20,q,2.8,.17);                        // 독침
    // B — **독을 일자로 팡팡팡.** 6발, 사이가 보이는 간격.
    if(volley>=0)for(let k=0;k<6;k++){
      const fl=volley*6-k;                                   // 발사 후 경과
      if(fl<0||fl>1.6)continue;
      const d=r*(.3+4.2*fl);
      const bx=tx+Math.cos(a)*d, by=ty+Math.sin(a)*d;
      const f=Math.max(0,1-fl/1.6);
      if(fl<1.25){                                 // 날아가는 독침
        c.save();c.globalAlpha=.35+.65*f;
        c.beginPath();c.ellipse(bx,by,r*.17*f+2,r*.10*f+1.5,a,0,TAU);
        c.fillStyle="rgba(90,220,120,.9)";c.fill();
        c.strokeStyle="rgba(200,255,215,.9)";c.lineWidth=1.6;c.stroke();
        c.restore();
        if(fl<.16)speedLines(c,bx,by,a,r*.5,1-fl/.16,k*7.1);}
      else{
        // **묻으면 계속 아프다.** 독은 맞는 순간이 아니라 **묻은 뒤**가
        // 본체다 — 터진 자리에 얼룩이 남아 천천히 사그라들어야, 「스쳤는데
        // 왜 피가 달지」가 아니라 「독이 묻었구나」가 된다.
        // 시뮬 이식 시: 플레이어 StatusPool 에 독 중첩(스펙 §속성 독 —
        // 약한 도트 8초, 타격마다 쌓인다). 즉발 피해는 작게.
        const sp=(fl-1.25)/.35;
        c.save();c.globalAlpha=Math.max(0,1-sp)*.75;
        for(let d2=0;d2<6;d2++){const q2=d2/6*TAU+k;
          const dd=r*(.10+.34*sp)*(1+hash(d2*3.7+k));
          c.beginPath();
          c.arc(bx+Math.cos(q2)*dd,by+Math.sin(q2)*dd,r*.10*(1-sp*.5),0,TAU);
          c.fillStyle="rgba(90,220,120,.75)";c.fill();}
        c.beginPath();c.ellipse(bx,by,r*(.22+.20*sp),r*(.12+.11*sp),a,0,TAU);
        c.fillStyle="rgba(60,180,95,.55)";c.fill();
        c.strokeStyle="rgba(200,255,215,.7)";c.lineWidth=1.4;c.stroke();
        c.restore();}}},

  // 보스 D(분열괴물) — **눈이 꽉 찬 몸.** 그리고 그 눈 하나하나가 자아를
  // 가진 것처럼 **액체가 되어 튀어나가** 달려들고, 물풍선처럼 터졌다가,
  // 다시 회수되어 본체에 흡수된다.
  //
  // 보이는 것이 곧 규칙이다: **눈이 있으면 때릴 수 있고 없으면 없다.**
  //   뭉쳤을 때 — 눈이 빈틈없이 찬 덩어리 자체가 몸이다 → 어디를 때려도 된다
  //   흩어졌을 때 — 날아가는 방울은 액체라 **때릴 데가 없고**, 가운데 드러난
  //     본체의 큰 눈만 남는다 → 여기를 때려라
  //
  // ⚠️ 알(매끈한 구슬)로 그렸더니 「낳는 것」으로 읽혔다(2026-08-09 반려).
  // 눈이라야 「각자 나를 본다」가 되고, 그게 이 보스의 정체다.
  bossSplit(c,x,y,r,a,t){
    const P=8.6,u=(t%P)/P;
    const N=56,FLY=22,GOLD=2.39996;
    // ⚠️ **떠나는 것은 바깥층이고, 남은 것은 오므라든다.** 아무 눈이나 22개를
    // 뽑고 안쪽을 그대로 두었더니 몸이 안 줄어들어 「주머니에서 꺼내 던진다」가
    // 됐다(2026-08-09 판정). 겉껍질이 통째로 떨어져 나가고 속이 조여들어야
    // **몸이 갈라졌다**로 읽힌다 — 크기가 줄어드는 것이 분열의 증거다.
    // ── 한 방울의 시계 ────────────────────────────────────────────────
    // **단계는 앞 단계가 끝난 자리에서 시작한다.** 전에는 분열·장전·발사를
    // 각각 따로 계산해 겹치는 바람에 「되돌아왔다 다시 나가는」 군더더기
    // 움직임이 끼었다(세 번 지적). 위치를 한 줄기로 잇는다:
    //   집 →(분열)→ 부채 →(장전 1회)→ 뒤로 당김 →(발사)→ 표적 →(즉시 폭발)
    // 텀이 둘 있다. **S3→SA 는 장전한 채 겨누는 1초** — 표적이 다 그려진
    // 뒤 플레이어가 자리를 옮길 시간이다. 장전하자마자 던지면 표식이 있어도
    // 못 피하고, 그건 난이도가 아니라 사고다.
    // **S5→SH 는 터진 뒤 1초** — 곧바로 회수하면 「터졌다」와 「돌아간다」가
    // 한 동작으로 뭉쳐 둘 다 안 읽힌다.
    const S1=.20,S2=.31,S3=.37,SA=.486,S4=.58,S5=.63,SH=.746,S6=.90;
    const spread=Math.max(0,Math.min(1,(u-S1)/(S2-S1)));
    const split=u<S1?0:(u<S6?1:Math.max(0,1-(u-S6)/.10));
    // **몸이 줄어든다.** 바깥층이 떠난 만큼 실루엣이 작아져야 분열이다.
    const bodyK=1-.32*spread;
    const cr=r*(.30+.10*split)*bodyK;
    const ramp=(v,lo,hi)=>Math.max(0,Math.min(1,(v-lo)/(hi-lo)));
    const zz=zigzag(t,r,7.3);
    const damp=1-.74*(ramp(u,.14,.24)-ramp(u,.78,.88));
    x+=zz[0]*damp; y+=zz[1]*damp;
    if(zz[2]>.05)speedLines(c,x,y,zz[3],r*.85,zz[2]*damp,17.3);
    // ⚠️ **넓게 흩어야 피할 틈이 생긴다.** 좁은 구역에 56발을 떨구면 터짐이
    // 12배 과밀이라 회피 공간이 **원천적으로 없다** — 난이도가 아니라 사고다.
    // 22발 × 반경 0.95r 를 폭 13r × 깊이 4.8r 에 뿌리면 덮는 넓이가 구역과
    // 1:1 이라, 무작위 배치에서 반드시 빈 곳이 남는다.
    // (보스 r=36 · 화면 폭 411 기준 1r ≈ 8.8% → 폭 ±6.5r = 화면을 가로지른다)
    const lerp=(A,B,k)=>[A[0]+(B[0]-A[0])*k, A[1]+(B[1]-A[1])*k];
    for(let i=0;i<N;i++){
      const flies=i>=N-FLY;                       // 바깥층이 떠난다
      // 남은 눈은 안으로 조여든다 — 겉이 떨어져 나갔으니 속이 메운다.
      const pack=flies?1:(1-.30*spread);
      const hd=r*Math.sqrt((i+.5)/N)*pack;
      const hq=i*GOLD+t*.22;
      const home=[x+Math.cos(hq)*hd, y+Math.sin(hq)*hd];
      const er=r*1.00/Math.sqrt(N)*1.18;
      if(!flies){                                 // 몸에 남는 눈
        c.beginPath();c.arc(home[0],home[1],er,0,TAU);
        c.fillStyle="rgba(190,30,60,.80)";c.fill();
        c.strokeStyle="rgba(255,130,160,.9)";c.lineWidth=1.4;c.stroke();
        const la=Math.PI/2+Math.sin(t*(1.4+hash(i*5.3))+i)*.6;
        c.beginPath();
        c.arc(home[0]+Math.cos(la)*er*.24,home[1]+Math.sin(la)*er*.24,er*.28,0,TAU);
        c.fillStyle="#07040A";c.fill();continue;}
      const lag=hash(i*3.1)*.055;                 // 시차 — 벽이 아니라 포격으로
      const w=u-lag;
      const fa=i*GOLD+hash(i*17.3)*1.1;           // 불규칙한 원으로 펼친다
      const fd=r*(1.05+1.55*hash(i*23.7));
      const fan=[x+Math.cos(fa)*fd, y+Math.sin(fa)*fd];
      const tg=[x+(hash(i*7.7)-.5)*r*13.0, y+r*(2.2+4.8*hash(i*13.1))];
      const th=Math.atan2(tg[1]-fan[1],tg[0]-fan[0]);
      // **장전은 딱 한 번.** 투수가 공을 뒤로 보내는 그 한 동작이고,
      // 되돌아오지 않는다 — 그대로 발사의 출발점이 된다.
      const load=[fan[0]-Math.cos(th)*r*.85, fan[1]-Math.sin(th)*r*.85];
      const BR=r*.95;                             // 터짐 반경
      let pos,stage,fly=0;
      if(w<S1){pos=home;stage=0;}
      else if(w<S2){pos=lerp(home,fan,ease((w-S1)/(S2-S1)));stage=1;}
      else if(w<S3){pos=lerp(fan,load,ease((w-S2)/(S3-S2)));stage=2;}
      else if(w<SA){                              // **겨눈 채 1초 — 피할 시간**
        const q=(w-S3)/(SA-S3);
        pos=[load[0]+Math.sin(t*9+i)*er*.22, load[1]+Math.cos(t*11+i)*er*.22];
        stage=7;}
      else if(w<S4){const k=(w-SA)/(S4-SA);       // 앞 16%만 가속, 뒤는 등속
        fly=k<.16?(k/.16)*(k/.16)*.16:k;
        pos=lerp(load,tg,fly);stage=3;}
      else if(w<S5){pos=tg;stage=4;}              // **도착 즉시 폭발**
      else if(w<SH){pos=tg;stage=6;}              // 잔여 — 0.3초 고인다
      else if(w<S6){pos=lerp(tg,[x,y],ease((w-SH)/(S6-SH)));stage=5;}
      else continue;
      // **장전하는 순간 맵에 표적이 그려진다.** 난이도를 올리되 못 피하게
      // 하면 안 된다 — 예고가 곧 회피의 근거다.
      if(stage===2||stage===7||stage===3){
        const k=stage===2?ease((w-S2)/(S3-S2)):1;
        c.save();c.globalAlpha=(stage===3?1-fly*.5:1)*.85;
        c.setLineDash([BR*.26,BR*.20]);
        c.beginPath();c.arc(tg[0],tg[1],BR*(1.7-.7*k),0,TAU);
        c.strokeStyle="rgba(255,80,110,.95)";c.lineWidth=2.6;c.stroke();
        c.setLineDash([]);
        c.beginPath();c.arc(tg[0],tg[1],BR*.14*k,0,TAU);
        c.fillStyle="rgba(255,80,110,.9)";c.fill();c.restore();}
      const bx=pos[0],by=pos[1];
      if(stage===4){                              // 물풍선처럼 터진다
        const po=(w-S4)/(S5-S4), f=1-po;
        c.save();c.globalAlpha=f;
        c.beginPath();c.arc(bx,by,BR*po+er,0,TAU);
        c.strokeStyle="rgba(255,90,120,.9)";c.lineWidth=3.4*f+.6;c.stroke();
        for(let d2=0;d2<9;d2++){const q2=d2/9*TAU+i, dd=(BR*po+er)*.9;
          c.beginPath();c.arc(bx+Math.cos(q2)*dd,by+Math.sin(q2)*dd,er*.42*f,0,TAU);
          c.fillStyle="rgba(255,60,95,.85)";c.fill();}
        c.restore();continue;}
      if(stage===6){
        // **터진 자리에 눈알이 남는다.** 액체만 고이면 그냥 자국이고, 눈이
        // 남아 두리번거려야 「아직 살아 있다」가 된다. 그리고 돌아가기 직전
        // **부르르 떤다** — 스스로 결심해 되돌아가는 것으로 읽히는 지점이
        // 그 진동 하나다(자아).
        const k=(w-S5)/(SH-S5);
        const buzz=Math.max(0,(k-.62)/.38);
        const jx=buzz*er*.30*Math.sin(t*47+i*3.1);
        const jy=buzz*er*.30*Math.sin(t*53+i*1.7);
        c.save();c.globalAlpha=.62;                 // 흩어진 자국
        c.beginPath();c.ellipse(bx,by,er*1.6,er*.66,0,0,TAU);
        c.fillStyle="rgba(190,30,60,.42)";c.fill();c.restore();
        const ex4=bx+jx, ey4=by+jy;
        c.beginPath();c.arc(ex4,ey4,er*.92,0,TAU);  // 남은 눈알
        c.fillStyle="rgba(190,30,60,.85)";c.fill();
        c.strokeStyle="rgba(255,130,160,.9)";c.lineWidth=1.5;c.stroke();
        c.beginPath();c.arc(ex4,ey4,er*.60,0,TAU);
        c.fillStyle=FOEEYE;c.fill();
        const lq=Math.atan2(y-ey4,x-ex4)+Math.sin(t*(1.2+hash(i*5.3))+i)*.9*(1-buzz);
        c.beginPath();
        c.arc(ex4+Math.cos(lq)*er*.24,ey4+Math.sin(lq)*er*.24,er*.27,0,TAU);
        c.fillStyle="#07040A";c.fill();
        continue;}
      if(stage===3){                              // 잔상 + 속도선
        c.save();
        for(let z=1;z<=3;z++){const b2=fly-z*.055;
          if(b2<=0)continue;
          c.globalAlpha=.30-z*.07;
          const q3=lerp(load,tg,b2);
          c.beginPath();c.arc(q3[0],q3[1],er*.62,0,TAU);
          c.fillStyle="rgba(190,30,60,.9)";c.fill();}
        c.restore();
        speedLines(c,bx,by,th,r*.55,Math.min(1,(1-fly)*2.2),i*9.7);}
      // 목 — 본체에서 뽑히는 동안만. 늘어나다 뚝 끊긴다.
      const dist=Math.hypot(bx-x,by-y);
      const neck=Math.max(0,1-Math.max(0,(dist-cr)/(r*.85)));
      if(stage>=1&&stage<=2&&neck>.02){
        const nx=(bx-x)/(dist||1),ny=(by-y)/(dist||1),px2=-ny,py2=nx;
        const w0=er*.85*neck,w1=er*.40*neck;
        c.beginPath();
        c.moveTo(x+nx*cr*.9+px2*w0,y+ny*cr*.9+py2*w0);
        c.lineTo(bx+px2*w1,by+py2*w1);
        c.lineTo(bx-px2*w1,by-py2*w1);
        c.lineTo(x+nx*cr*.9-px2*w0,y+ny*cr*.9-py2*w0);
        c.closePath();
        c.fillStyle="rgba(190,30,60,.55)";c.fill();
        c.strokeStyle="rgba(255,130,160,.7)";c.lineWidth=1.2;c.stroke();}
      const st2=1+1.05*(stage===3?.85:(stage===7?.55:neck*spread));
      const dir=Math.atan2(by-y,bx-x)+(stage===3?fly*(6.5+8*hash(i*19.3)):0);
      c.save();c.translate(bx,by);c.rotate(dir);
      c.beginPath();c.ellipse(0,0,er*st2,er/Math.sqrt(st2),0,0,TAU);
      c.fillStyle="rgba(190,30,60,.80)";c.fill();
      c.strokeStyle="rgba(255,130,160,.9)";c.lineWidth=1.4;c.stroke();
      c.restore();
      const la=Math.atan2(tg[1]-by,tg[0]-bx)+Math.sin(t*(1.4+hash(i*5.3))+i)*.5;
      c.beginPath();c.arc(bx,by,er*.62,0,TAU);
      c.fillStyle=FOEEYE;c.fill();
      c.beginPath();
      c.arc(bx+Math.cos(la)*er*.24,by+Math.sin(la)*er*.24,er*.28,0,TAU);
      c.fillStyle="#07040A";c.fill();}
    // 본체 — 남은 눈 무리가 곧 몸이다. 겉이 떨어져 나간 만큼 작다.
    foeDraw(c,[[1.15,.2],[.35,1.0],[-.55,.9],[-1.1,.1],[-.6,-.85],[.3,-1.05]],
      x,y,cr,a+t*.4,1.0,t,103,3);
    if(split>.15){
      c.beginPath();c.arc(x,y,cr*.56*split,0,TAU);
      c.fillStyle=FOEEYE;c.globalAlpha=.55+.45*split;c.fill();c.globalAlpha=1;
      c.beginPath();c.arc(x,y+cr*.20,cr*.26*split,0,TAU);
      c.fillStyle="#07040A";c.fill();}},
  // 보스 E(두꺼비) — **혀가 무기고, 이동은 도약이다.** 넓고 낮게 퍼진 몸이라
  // 「무겁다」가 실루엣에 있고, 튀어오를 때만 그 무게가 사라진다.
  //   ① 도약 — 웅크렸다 뛰어 **착지에서 충격파**. 그림자와 몸이 벌어졌다
  //      다시 만나는 것이 탑다운에서 「떴다」의 전부다
  //   ② 혀 — 표식을 찍고 **일직선으로 쭉** 뻗었다 당긴다. 뻗는 동안 몸은
  //      뒤로 밀린다(반작용) — 그게 없으면 혀가 몸에서 자라는 것으로 보인다
  bossToad(c,x,y,r,a,t){
    const P=13.0,u=(t%P)/P;
    let hop=0,land=0,tongue=0,aim=0,puff=1,swell=0,burst=0,rain=0;
    if(u<.16)puff=1+.05*Math.sin(t*1.6);            // 숨 쉰다
    else if(u<.20){const k=ease((u-.16)/.04);puff=1-.30*k;}   // 깊게 웅크린다
    else if(u<.42){
      // **휘이이이잉 — 쿠우우웅.** 대칭 사인은 「폴짝」이다. 솟는 것은 짧고,
      // 꼭대기에서 **거의 멈춘 채 떠 있고**(체공), 떨어질 때는 중력처럼
      // 가속해야 무게가 실린다. 이 셋의 시간 배분이 도약의 전부다.
      const k=(u-.20)/.22;                          // 2.86초
      hop=k<.18?ease(k/.18)                          // 솟음 0.33s
        :k<.70?1-.05*Math.sin((k-.18)/.52*Math.PI)   // 체공 0.96s — 거의 멈춤
        :1-Math.pow((k-.70)/.30,1.9);                // 낙하 0.56s — 가속
      puff=1+.14;}
    else if(u<.49){land=1-(u-.42)/.07;puff=1+.26*land;}       // 쿠우우웅
    else if(u<.55)aim=ease((u-.49)/.06);            // 혀 — 노린다
    else if(u<.66){tongue=Math.sin((u-.55)/.11*Math.PI);aim=1;}
    // ── 산성비 — 등의 검은 포자가 부풀어 터지고, 2초간 독이 내린다 ──
    else if(u<.74){swell=ease((u-.66)/.08);puff=1+.20*swell;} // 보글보글 부푼다
    else if(u<.78){swell=1;burst=(u-.74)/.04;puff=1-.12;}     // 터진다
    else if(u<.94)rain=(u-.78)/.16;                            // 2.08초간 내린다
    const lift=hop*r*2.30, back=tongue*r*.30;
    const bx=x-Math.cos(a)*back, by=y-Math.sin(a)*back-lift;
    // 그림자 — **높을수록 작고 흐리다.** 그게 탑다운에서 높이의 전부다.
    if(hop>.02){c.save();c.globalAlpha=.55*(1-hop*.62);
      c.beginPath();c.ellipse(x,y,r*.95*(1-hop*.52),r*.34*(1-hop*.52),0,0,TAU);
      c.fillStyle="#07040A";c.fill();c.restore();}
    // **착지 충격파의 반경을 먼저 정하고, 공중에 있는 동안 그 자리를 그린다.**
    // 무게로 내리찍는 공격인데 어디에 떨어질지 안 알려주면 피할 수가 없다 —
    // 체공 시간을 길게 준 이유의 절반이 이 예고를 볼 시간이다.
    const SHOCK=r*3.2;
    if(hop>.05&&land<=0){
      c.save();c.globalAlpha=Math.min(1,hop*1.6)*.9;
      c.setLineDash([r*.30,r*.22]);
      c.beginPath();c.ellipse(x,y,SHOCK,SHOCK*.62,0,0,TAU);
      c.strokeStyle="rgba(255,80,110,.95)";c.lineWidth=2.8;c.stroke();
      c.setLineDash([]);
      c.beginPath();c.ellipse(x,y,SHOCK*.12,SHOCK*.075,0,0,TAU);
      c.fillStyle="rgba(255,80,110,.9)";c.fill();c.restore();}
    if(land>.02){                                     // 쿠우우웅 — 고리 셋
      c.save();
      for(let i=0;i<3;i++){const f=Math.max(0,land-i*.16);
        if(f<=0)continue;
        c.globalAlpha=f*.9;
        const g=Math.min(1,(1-f)*(1+i*.35));
        c.beginPath();                                // 예고한 반경까지만 퍼진다
        c.ellipse(x,y,r*.9+(SHOCK-r*.9)*g,(r*.9+(SHOCK-r*.9)*g)*.62,0,0,TAU);
        c.strokeStyle=FOERIM;c.lineWidth=4.2*f+.6;c.stroke();}
      for(let i=0;i<9;i++){const q=i/9*TAU+.3;        // 튀어오른 흙
        const d=Math.min(SHOCK,r*1.3+SHOCK*.6*(1-land));
        c.globalAlpha=land*.8;
        c.beginPath();c.arc(x+Math.cos(q)*d,y+Math.sin(q)*d*.62,r*.10*land,0,TAU);
        c.fillStyle=FOERIM;c.fill();}
      c.restore();}
    // ── 산독(酸毒) 분출 ──────────────────────────────────────────────
    // **앞으로 떨어지는 비가 아니라 주변으로 뿜어지는 분출이다.** 혀가 이미
    // 전방 직선이라, 독까지 앞으로 가면 두 패턴이 겹쳐 하나로 읽힌다.
    // 몸 둘레로 산화되듯 뿜어져 나와 **용암처럼 부글거리다 터지는** 고리 —
    // ⚠️ **바닥 효과이므로 몸보다 먼저 그린다.** 나중에 그리면 두꺼비 등에
    // 스티커를 붙인 것으로 보인다.
    // 「가까이 오지 마라」가 되고, 혀와 정반대의 대응(붙느냐 떨어지느냐)을
    // 플레이어에게 묻는다.
    // ⚠️ **예고는 실제 떨어지는 자리마다 하나씩.** 큰 도넛을 그려놓고
    // 웅덩이가 열여덟 개만 생기면, 겁은 잔뜩 주고 실제 위험은 찔끔이라
    // 예고가 거짓말이 된다(2026-08-09 실기 판정). 자리를 **먼저 한 번만**
    // 뽑아 예고와 웅덩이가 **같은 배열**을 읽게 한다 — 어긋날 수가 없다.
    //
    // 안쪽 반경은 두꺼비 발끝(팔 1.98r) 밖이어야 제 몸에 안 얹힌다.
    const PR=r*.34, SPL=PR*1.9;                      // 웅덩이 최대 · 튀는 최대
    const DIN=r*2.45, DOUT=r*4.90;
    const RIN=DIN+SPL, ROUT=DOUT-SPL;
    const POOLS=[];
    for(let i=0;i<18;i++){
      const q=hash(i*3.1)*TAU;
      const d=RIN+Math.max(0,ROUT-RIN)*hash(i*7.7);
      POOLS.push([bx+Math.cos(q)*d, by+Math.sin(q)*d*.62,
                  PR*(.76+.24*hash(i*13.9)), i]);}
    if(swell>.02&&rain<=0){                          // 자리마다 하나씩 예고
      c.save();c.globalAlpha=swell*.9;
      c.setLineDash([r*.16,r*.13]);
      for(const [px3,py3,pr] of POOLS){
        c.beginPath();
        c.ellipse(px3,py3,(pr+SPL)*(1.35-.35*swell),
          (pr+SPL)*.62*(1.35-.35*swell),0,0,TAU);
        c.strokeStyle="rgba(150,255,190,.95)";c.lineWidth=2.2;c.stroke();}
      c.setLineDash([]);c.restore();}
    if(burst>0&&burst<1){                            // 사방으로 뿜어져 나간다
      c.save();c.globalAlpha=1-burst;
      for(let i=0;i<22;i++){const q=i/22*TAU+hash(i*3.1)*.2;
        const d=DIN+(DOUT-DIN)*burst*(.55+.6*hash(i*5.3));
        const lift=Math.sin(burst*Math.PI)*r*1.1;
        c.beginPath();
        c.arc(bx+Math.cos(q)*d,by+Math.sin(q)*d*.62-lift,r*.13*(1-burst*.4),0,TAU);
        c.fillStyle="rgba(90,220,120,.9)";c.fill();}
      c.restore();}
    if(rain>0&&rain<1){
      // **용암처럼.** 웅덩이가 부글거리다 솟아 터진다 — 되풀이가 곧 지속이고,
      // 면을 칠하면 그냥 장판이라 「끓는다」가 안 읽힌다.
      const fade=Math.min(1,rain*6)*Math.min(1,(1-rain)*6);
      for(let i=0;i<18;i++){
        const q=hash(i*3.1)*TAU;
        const d=RIN+Math.max(0,ROUT-RIN)*hash(i*7.7);
        const px3=bx+Math.cos(q)*d, py3=by+Math.sin(q)*d*.62;
        const ph=(rain*2.6+hash(i*11.3))%1;
        const pr=PR*(.76+.24*hash(i*13.9));
        c.save();c.globalAlpha=fade*.85;
        c.beginPath();c.ellipse(px3,py3,pr,pr*.55,0,0,TAU);   // 웅덩이
        c.fillStyle="rgba(60,180,95,.55)";c.fill();
        c.strokeStyle="rgba(150,255,190,.75)";c.lineWidth=1.6;c.stroke();
        if(ph<.62){                                            // 부글부글
          for(let b=0;b<4;b++){const bq=t*4+b*1.7+i;
            c.beginPath();
            c.arc(px3+Math.cos(bq)*pr*.5,py3+Math.sin(bq)*pr*.3,
              pr*(.14+.10*hash(b*3.1+i)),0,TAU);
            c.fillStyle="rgba(150,255,190,.6)";c.fill();}}
        else{                                                  // 솟아 터진다
          const f=(ph-.62)/.38;
          const up=Math.sin(f*Math.PI)*r*1.0;
          c.beginPath();
          c.ellipse(px3,py3-up,pr*(.5+.3*(1-f)),pr*(.7-.2*f),0,0,TAU);
          c.fillStyle="rgba(120,240,155,.85)";c.fill();
          c.strokeStyle="rgba(210,255,225,.9)";c.lineWidth=1.6;c.stroke();
          for(let d2=0;d2<6;d2++){const q2=d2/6*TAU;
            const dd=pr*(.4+1.5*f);
            c.globalAlpha=fade*(1-f)*.9;
            c.beginPath();
            c.arc(px3+Math.cos(q2)*dd,py3-up*.4+Math.sin(q2)*dd*.5,
              pr*.16*(1-f),0,TAU);
            c.fillStyle="rgba(90,220,120,.9)";c.fill();}}
        c.restore();}}
    // **휘는 팔다리.** 직선 마디는 기계다 — 넓적다리가 바깥으로 부풀고
    // 정강이가 안으로 접히는 두 번의 곡선이라야 웅크린 힘이 보인다.
    for(const sg of[-1,1]){
      // 뒷다리는 **짧고 굵게 접혀** 있다 — 길면 개구리(도약형)이고,
      // 두꺼비는 웅크린 채 기어다니는 몸이다.
      const kn=a+sg*(1.98-hop*.20);
      const kx=bx+Math.cos(kn)*r*(.74+hop*.30), ky=by+Math.sin(kn)*r*(.74+hop*.30);
      curveLimb(c,bx,by,kx,ky,r*.32,r*.24,sg*r*.30);          // 넓적다리
      const fq=a+sg*(2.66-hop*1.00);
      const fx=bx+Math.cos(fq)*r*(1.12+hop*.50), fy=by+Math.sin(fq)*r*(1.12+hop*.50);
      curveLimb(c,kx,ky,fx,fy,r*.24,r*.16,-sg*r*.24);         // 정강이
      toadFoot(c,fx,fy,fq,r,5,r*.58,true);}                    // 뒷발 — 물갈퀴 5
    // **앞팔은 길게 뻗어 몸을 받친다.** 짧으면 팔이 아예 없는 것으로 보이고,
    // 그러면 「기어다니는 몸」이라는 자세가 안 선다 — 두 마디로 뻗는다.
    for(const sg of[-1,1]){
      // **팔꿈치가 바깥으로 벌어진다.** 안으로 휘면 몸을 감싸는 자세라
      // 움츠린 것으로 보이고, 위엄이 안 선다 — 버티고 선 짐승은 팔꿈치가
      // 밖으로 나간다. 팔꿈치를 더 옆으로 두고 휨도 바깥쪽으로 돌린다.
      const sq=a+sg*1.22;
      const el=[bx+Math.cos(sq)*r*1.02, by+Math.sin(sq)*r*1.00];  // 팔꿈치
      curveLimb(c,bx,by,el[0],el[1],r*.25,r*.18,-sg*r*.30);
      const hq=a+sg*.62;
      const hd2=[bx+Math.cos(hq)*r*1.98, by+Math.sin(hq)*r*1.80];  // 손목
      curveLimb(c,el[0],el[1],hd2[0],hd2[1],r*.18,r*.13,sg*r*.26);
      toadFoot(c,hd2[0],hd2[1],hq,r,4,r*.62,false);}             // 앞발 — 발가락 4
    // 몸 — **윤곽부터 우툴두툴하다.** 매끈한 타원에 점을 찍으면 개구리에
    // 종기가 난 것이고, 실루엣 자체가 울퉁불퉁해야 두꺼비다.
    const BP=[];
    for(let i=0;i<20;i++){const q=i/20*TAU;
      const rr=(.96+.16*hash(i*4.3))*(1+.05*Math.sin(t*1.7+i));
      BP.push([Math.cos(q)*rr,Math.sin(q)*rr*1.24]);}
    foeDraw(c,BP,bx,by,r*.94*puff,a,.9,t,111,3.4);
    // **등의 독샘.** 개구리와 두꺼비를 가르는 것이 이것 하나다 — 크기가
    // 제각각인 사마귀가 등을 빈틈없이 덮고, 가운데 구멍(독구멍)이 뚫려 있다.
    for(let i=0;i<34;i++){
      const q=i*2.39996+t*.05, dd=r*.80*Math.sqrt((i+.4)/34);
      const wx=bx+Math.cos(q)*dd, wy=by+Math.sin(q)*dd*1.22;
      const wr=r*(.055+.085*hash(i*5.7))*(1+.05*Math.sin(t*2.1+i));
      c.beginPath();c.arc(wx,wy,wr,0,TAU);
      c.fillStyle="rgba(70,32,54,.98)";c.fill();
      c.strokeStyle="rgba(232,104,146,.85)";c.lineWidth=1.5;c.stroke();
      c.beginPath();c.arc(wx-wr*.22,wy-wr*.22,wr*.44,0,TAU);   // 붉게 돋은 끝
      c.fillStyle="rgba(255,120,150,.62)";c.fill();
      c.beginPath();c.arc(wx,wy,wr*.20,0,TAU);                 // 독구멍
      c.fillStyle="#07040A";c.fill();}
    // **검은 포자** — 등의 사마귀 중 다섯이 유난히 크고 검다. 산성비는
    // 여기서 나온다: 부풀어 오르며 보글거리다 터진다.
    for(let i=0;i<5;i++){
      const q=a+(i/5)*TAU+.4, dd=r*.52;
      const wx=bx+Math.cos(q)*dd, wy=by+Math.sin(q)*dd*1.2;
      const gr=r*(.13+.19*swell);
      // **끓는 주머니.** 매끈한 원이 커지면 「부푼다」이지 「끓는다」가
      // 아니다 — 껍질이 제각각으로 밀려 나와야 안에서 무언가 올라오는
      // 것으로 보인다. 부풀수록 요동이 커진다.
      c.beginPath();
      for(let j=0;j<14;j++){const w2=j/14*TAU;
        const bulge=1+swell*(.10+.22*Math.abs(Math.sin(t*4.5+j*1.7+i*2.3)));
        const px3=wx+Math.cos(w2)*gr*bulge, py3=wy+Math.sin(w2)*gr*bulge;
        j?c.lineTo(px3,py3):c.moveTo(px3,py3);}
      c.closePath();
      c.fillStyle=swell>.02?"rgba(26,64,38,.98)":"rgba(24,14,26,.98)";c.fill();
      c.strokeStyle=swell>.02?"rgba(150,255,190,.9)":FOERIM;
      c.lineWidth=2+swell*1.6;c.stroke();
      if(swell>.10){
        // 기포 — **각자 살았다 죽는다.** 밑에서 올라와 커지다 표면에서
        // 터진다. 궤도를 도는 점 몇 개는 장식이고, 나고 죽어야 끓음이다.
        for(let b=0;b<9;b++){
          const ph=(t*(.9+.5*hash(b*3.7+i))+hash(b*9.1+i))%1;
          const bq=hash(b*5.3+i)*TAU;
          const rise=gr*(.62-1.15*ph);              // 아래 → 위
          const br2=gr*(.10+.20*ph)*swell;
          if(ph>.86){                                // 터짐
            const f=(ph-.86)/.14;
            c.save();c.globalAlpha=(1-f)*.9;
            c.beginPath();c.arc(wx+Math.cos(bq)*gr*.34,wy+rise,
              br2*(1+2.4*f),0,TAU);
            c.strokeStyle="rgba(200,255,225,.95)";c.lineWidth=1.6*(1-f)+.3;
            c.stroke();c.restore();continue;}
          c.beginPath();c.arc(wx+Math.cos(bq)*gr*.34,wy+rise,br2,0,TAU);
          c.fillStyle="rgba(150,255,190,.55)";c.fill();
          c.strokeStyle="rgba(210,255,230,.7)";c.lineWidth=1;c.stroke();}
        // **터지기 직전** — 껍질이 갈라진다. 밝은 금이 셋.
        if(swell>.62){const f=(swell-.62)/.38;
          c.save();c.globalAlpha=f;
          for(let k2=0;k2<3;k2++){const cq=hash(k2*7.7+i)*TAU;
            c.beginPath();
            c.moveTo(wx+Math.cos(cq)*gr*.25,wy+Math.sin(cq)*gr*.25);
            c.lineTo(wx+Math.cos(cq+.4)*gr*1.05,wy+Math.sin(cq+.4)*gr*1.05);
            c.strokeStyle="rgba(210,255,230,.95)";c.lineWidth=1.8*f+.4;
            c.stroke();}
          c.restore();}}}
    // **이하선(耳下腺)** — 눈 뒤의 큰 독주머니 한 쌍. 두꺼비의 진짜 표식이고,
    // 사마귀만으로는 「오돌토돌한 무엇」에 그친다.
    for(const sg of[-1,1]){
      const gq=a+sg*1.02, gx2=bx+Math.cos(gq)*r*.52, gy2=by+Math.sin(gq)*r*.62;
      c.save();c.translate(gx2,gy2);c.rotate(a+sg*.30);
      c.beginPath();c.ellipse(0,0,r*.36,r*.21,0,0,TAU);
      c.fillStyle="rgba(86,38,64,.98)";c.fill();
      c.strokeStyle="rgba(255,140,180,.9)";c.lineWidth=2.4;c.stroke();
      for(let i=0;i<5;i++){                                    // 분비 구멍 다섯
        const px3=(i/4-.5)*r*.46;
        c.beginPath();c.arc(px3,Math.sin(i*2.1)*r*.06,r*.045,0,TAU);
        c.fillStyle="#07040A";c.fill();}
      c.restore();}
    // **입 — 넓고 사납다.** 귀엽지도 징그럽지도 않던 이유는 얼굴이
    // 없었기 때문이다. 가로로 길게 갈라진 입 하나가 성격을 만든다.
    const mq=a, mx2=bx+Math.cos(mq)*r*.92, my2=by+Math.sin(mq)*r*1.00;
    const gape2=Math.max(tongue,aim*.25);           // 혀를 쏠 때 벌어진다
    const nqx=Math.cos(mq+Math.PI/2),nqy=Math.sin(mq+Math.PI/2);
    if(gape2>.05){                                  // 벌어진 입 안쪽
      c.beginPath();
      c.moveTo(mx2-nqx*r*.62,my2-nqy*r*.62);
      c.quadraticCurveTo(mx2+Math.cos(mq)*r*(.30+.55*gape2),
        my2+Math.sin(mq)*r*(.30+.55*gape2),mx2+nqx*r*.62,my2+nqy*r*.62);
      c.quadraticCurveTo(mx2-Math.cos(mq)*r*.16,my2-Math.sin(mq)*r*.16,
        mx2-nqx*r*.62,my2-nqy*r*.62);
      c.closePath();c.fillStyle="#120610";c.fill();
      c.strokeStyle="rgba(255,120,155,.95)";c.lineWidth=2.8;c.stroke();}
    else{
      c.beginPath();
      c.moveTo(mx2-nqx*r*.62,my2-nqy*r*.62);
      c.quadraticCurveTo(mx2+Math.cos(mq)*r*.30,my2+Math.sin(mq)*r*.30,
        mx2+nqx*r*.62,my2+nqy*r*.62);
      c.strokeStyle="rgba(255,120,155,.95)";c.lineWidth=3.4;c.stroke();}
    for(const sg of[-1,1]){                           // 툭 튀어나온 눈 둘
      const ex2=bx+Math.cos(a+sg*.52)*r*.72, ey2=by+Math.sin(a+sg*.52)*r*.78;
      // **돔형 안구 + 가로 일자 동공.** 두꺼비 눈의 정체는 색이 아니라
      // 이 두 가지다(레퍼런스 사진) — 둥근 점을 찍으면 그냥 「붉은 눈」이고,
      // 가로로 째진 동공이 있어야 노려보는 것이 된다.
      c.beginPath();c.arc(ex2,ey2,r*.31,0,TAU);
      c.fillStyle=FOEDARK;c.fill();
      c.strokeStyle=FOERIM;c.lineWidth=2.8;c.stroke();
      c.beginPath();c.arc(ex2,ey2,r*.235,0,TAU);          // 홍채
      c.fillStyle=FOEEYE;c.fill();
      c.save();c.translate(ex2,ey2);c.rotate(a+Math.PI/2);
      c.beginPath();c.ellipse(0,0,r*.205,r*.062,0,0,TAU); // 가로 일자 동공
      c.fillStyle="#07040A";c.fill();
      c.beginPath();c.ellipse(0,-r*.115,r*.115,r*.045,0,0,TAU);  // 젖은 반사
      c.fillStyle="rgba(255,220,235,.55)";c.fill();
      c.restore();
      // **눈두덩** — 눈 위로 두껍게 얹힌 뼈. 노려보는 얼굴은 이것 하나로 된다.
      c.beginPath();
      c.moveTo(ex2+Math.cos(a+sg*1.6)*r*.34,ey2+Math.sin(a+sg*1.6)*r*.34);
      c.quadraticCurveTo(ex2-Math.cos(a)*r*.30,ey2-Math.sin(a)*r*.30,
        ex2+Math.cos(a-sg*1.7)*r*.32,ey2+Math.sin(a-sg*1.7)*r*.32);
      c.lineTo(ex2+Math.cos(a-sg*1.9)*r*.44,ey2+Math.sin(a-sg*1.9)*r*.44);
      c.quadraticCurveTo(ex2-Math.cos(a)*r*.46,ey2-Math.sin(a)*r*.46,
        ex2+Math.cos(a+sg*1.5)*r*.46,ey2+Math.sin(a+sg*1.5)*r*.46);
      c.closePath();c.fillStyle=FOEDARK;c.fill();
      c.strokeStyle=FOERIM;c.lineWidth=2.2;c.stroke();}
    const TL=r*4.4;
    // **혀는 지나가는 길 전체가 공격 범위다.** 끝에 원만 그리면 「저기만
    // 피하면 된다」가 되는데, 실제로는 입에서 끝까지가 다 맞는 자리다.
    // 폭은 채찍이 휘는 진폭(0.85r)에 혀 굵기(0.17r)를 더한 값 그대로다 —
    // 보이는 통로와 맞는 통로가 같은 숫자에서 나온다.
    if(aim>.02&&tongue<=.02)
      aimLane(c,mx2,my2,a,TL-r*.9,r*(.85+.17),aim);
    if(tongue>.02){
      // **채찍이다.** 곧은 막대는 창이고, 혀는 파도가 지나가야 한다:
      // 뿌리에서 시작한 물결이 끝으로 갈수록 크게 휘고, 끝은 한 박자 늦게
      // 따라온다(채찍의 그 꺾임). 굵기도 끝으로 갈수록 가늘어진다.
      const d=TL*tongue, N=18;
      const px2=-Math.sin(a),py2=Math.cos(a);
      const Lp=[],Rp=[];
      for(let i=0;i<=N;i++){
        const uu=i/N;
        const w=r*.17*(1-uu*.62);
        const amp=r*.85*uu*uu;                      // 끝으로 갈수록 크게
        const off=Math.sin(uu*5.4-t*13.5)*amp*(1-tongue*.25);
        // **입에서 나간다.** 몸 중심에서 뽑으면 등 위로 날아가는 것으로
        // 보인다 — 뿌리는 입 안쪽이고 거기서 물결이 시작한다.
        const cx2=mx2+Math.cos(a)*(d-r*.9)*uu+px2*off;
        const cy2=my2+Math.sin(a)*(d-r*.9)*uu+py2*off;
        Lp.push([cx2+px2*w,cy2+py2*w]);Rp.push([cx2-px2*w,cy2-py2*w]);}
      const poly=Lp.concat(Rp.reverse());
      c.beginPath();
      poly.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));
      c.closePath();c.fillStyle="rgba(214,60,110,.85)";c.fill();
      c.strokeStyle="rgba(255,150,180,.95)";c.lineWidth=2;c.stroke();
      const tipx=(Lp[N][0]+Rp[N][0])/2, tipy=(Lp[N][1]+Rp[N][1])/2;
      const tipa=Math.atan2(tipy-(Lp[N-2][1]+Rp[N-2][1])/2,
                            tipx-(Lp[N-2][0]+Rp[N-2][0])/2);
      c.beginPath();c.ellipse(tipx,tipy,r*.22,r*.14,tipa,0,TAU);
      c.fillStyle="rgba(255,80,120,.9)";c.fill();
      c.strokeStyle="rgba(255,180,200,.95)";c.lineWidth=2;c.stroke();
      if(tongue>.55)speedLines(c,tipx,tipy,tipa,r*.7,(tongue-.55)*2.2,167.3);}},

};


// **확정 5종이 앞이다.** 다양하게 뽑으려다 「다르게 생겼다」에 그친 것들이
// 섞였다(2026-08-09 판정). 한눈에 읽히는 아이디어가 하나씩 있고 그게 행동과
// 묶인 것만 확정한다 — 나머지는 그 기준으로 다시 짠다.
// 맨 앞의 **기본형**은 일부러 밋밋하다 — 12종을 전부 개성 있게 만들면
// 기준선이 사라져 「특별한 놈」이 하나도 없게 된다.
//
// **넷만 남았다.** 나머지 여덟은 몇 번을 고쳐도 「몸에 장식을 붙인 것」에서
// 못 벗어나 통째로 지웠다(2026-08-09). 통과한 넷의 공통점은 생김새가 아니라
// **종류가 다르다**는 것이다 — 부속지 / 잔상 / 순수 도형 / 무리. 나머지도
// 「또 다른 생물」이 아니라 「또 다른 종류의 것」으로 다시 잡아야 한다.
const FOEDEF=[
["grunt","기본형",10,1,"아무 특징이 없는 것이 특징. 스테이지 1의 첫 1분"],
["drifter","표류",12,1,"몸보다 다리가 크다 — 기어오는 느린 벽"],
["runner","질주",8,1,"속도가 곧 실루엣 — 촉끝 + 뒤로 찢어진 잔상 셋"],
["bomber","자폭",13,1,"부속지가 하나도 없는 유일한 종. 팽팽한 구"],
["swarm","무리",5,1,"개체가 아니라 떼. 하나만 그리면 정체가 안 보인다"],
["urchin","성게",14,1,"만지지 마라 — 짧고 촘촘한 가시 26. 가까워지면 곤두선다"],
["charger","돌진",15,1,"생물이 아니라 무기 — 미늘 작살 + 깃"],
["bossSpider","보스 A · 거미",36,3,"관절 다리 여덟. 웅크렸다 와다다다닥 달려든다(교대 사족보행)"],
["boss","보스 B · 뱀",36,3,"머리만 나를 본다. 똬리를 틀었다 일자로 뻗어 달려들고 다시 감긴다"],
["bossScorp","보스 C · 전갈",36,3,"꼬리가 주인공 — 치켜들었다 머리 너머로 내리꽂는다"],
["bossSplit","보스 D · 분열괴물",36,0,"눈이 꽉 찬 몸. 공작처럼 펼쳤다 무차별 포격, 쉭쉭 지그재그"],
["bossToad","보스 E · 두꺼비",36,0,"넓고 낮은 몸. 도약해 착지 충격파, 혀를 일직선으로 뻗어 당긴다"],];

const FOE={};
FOEDEF.forEach(([k,nm,rad,eyes])=>{FOE[k]=(c,t,dt,W,H,st)=>{
  const boss=k.startsWith("boss");
  // 보스마다 뻗는 거리가 달라(뱀은 곧게 펴지면 몸이 제일 길다) 크기와 선
  // 자리를 따로 준다 — 한 값으로 맞추면 누군가는 무대 밖으로 나간다.
  const BS={bossSpider:[.086,.42],boss:[.062,.62],bossScorp:[.085,.42],
            bossSplit:[.048,.26],bossToad:[.076,.38]}[k]
           ||[.10,.40];
  // 보스는 **넓은 무대의 위쪽**에 서서 아래(플레이어)를 본다 — 달려가는
  // 거리와 표적 지점이 한 화면에 들어와야 패턴이 읽힌다.
  const cx=W/2, cy=boss?H*BS[1]:H/2;
  const px=cx, py=boss?H*1.02:H*1.05;
  // **가는 쪽을 본다.** 보스는 표적(아래) 쪽을 보고 좌우로만 흔들린다 —
  // 위를 보면서 아래로 공격하면 패턴이 거짓말을 한다.
  const ang=boss?Math.PI/2+Math.sin(t*.45)*.55:Math.sin(t*.45)*1.1-Math.PI/2;
  // 크기는 도감 비율 그대로 두되(「크기가 곧 체력」), **뻗침이 큰 종은
  // 타일 밖으로 잘려** 미리보기가 안 된다 — 보스 A 의 다리는 몸의 2.35배다.
  // 그래서 뻗침만큼 줄여 **전체 모습이 들어오게** 맞춘다.
  const EXT={drifter:1.9,runner:2.6,swarm:2.4,charger:2.4,
             bossSpider:2.5,boss:2.9,bossScorp:4.1,bossSplit:3.8,bossToad:3.4,bossHawk:3.0}[k]||1.2;
  const half=Math.min(W,H)*.5;
  const r=boss?Math.min(W,H)*BS[0]
              :Math.min(Math.min(W,H)*.40*(rad/36), half*.94/EXT);
  FOEART[k](c,cx,cy,r,ang,t);
  // 눈 0 = 몸 자체가 눈인 종(점사). 따로 안 찍는다.
  // 뱀은 머리가 몸에서 떨어져 나가므로 눈도 머리를 따라간다.
  if(k==="boss")bossEyes(c,cx+Math.cos(ang)*r*1.5*bossLunge(t),
    cy+Math.sin(ang)*r*1.5*bossLunge(t),r*bossHead(t),ang,px,py,t);
  else if(k==="bossSpider"||k==="bossScorp")bossEyes(c,cx+Math.cos(ang)*r*1.5*spiderLunge(t),
    cy+Math.sin(ang)*r*1.5*spiderLunge(t),r,ang,px,py,t);
  else if(eyes>0)foeEyes(c,cx,cy,r*(k==="swarm"?1.0:.8),eyes,px,py,k==="swarm"?.30:.17);
  c.strokeStyle="rgba(255,168,60,.30)";c.lineWidth=1.4;   // 진행 방향 — 시안 전용
  c.beginPath();c.moveTo(cx,cy);
  c.lineTo(cx+Math.cos(ang)*r*2.2,cy+Math.sin(ang)*r*2.2);c.stroke();
};});

// ── 속성 시안 — 다섯 속성 × 5안 ───────────────────────────────────────────
//
// 문법은 **고정**이다: 각진 별 코어 + 둘레 모티프. 다섯이 한 벌로 읽히려면
// 이 뼈대를 공유해야 하고, 속성의 정체는 **모티프 하나**가 진다.
// 여기서는 모티프만 다섯 가지로 변주해 눈으로 고른다.
//
// 각 안은 `{n:개수, sp:회전, k:반경배수, d:그리기}` 하나로 기술된다 —
// 코어·계조·고리는 공통 코드가 얹으므로, 안마다 다른 것은 **모티프의
// 실루엣과 배치**뿐이다. 그래야 스물다섯을 나란히 놓고 비교할 수 있다.
/// 단위 좌표 폴리곤을 [rot] 만큼 돌려 [k] 배로 그린다.
function evPoly(c,cx,cy,R,rot,k,P,col){
  c.beginPath();
  P.forEach((v,i)=>{
    const px=cx+(Math.cos(rot)*v[0]-Math.sin(rot)*v[1])*R*k;
    const py=cy+(Math.sin(rot)*v[0]+Math.cos(rot)*v[1])*R*k;
    i?c.lineTo(px,py):c.moveTo(px,py);});
  c.closePath();c.fillStyle=col;c.fill();
}
/// 모티프 하나를 3단 계조로 — 같은 폴리곤을 배율만 줄여 세 번.
function evShape(c,cx,cy,R,rot,P,tone){
  const T=TONE[tone];
  evPoly(c,cx,cy,R,rot,1,P,A(T[0],.95));
  // **어둠은 테두리로 보인다.** 속을 어둡게 두는 것이 그림자의 정체성인데
  // (밝은 앞날이 없다 = 빛이 꺼진다), 그대로 두면 검은 배경에 묻혀 아무것도
  // 안 보인다. 이 게임은 같은 문제를 이미 풀어놨다 — 적이 어둠 덩어리인데
  // 보이는 이유가 **밝은 림**이고, contrast_test 가 그걸 지킨다.
  // 그림자도 같은 장치를 쓴다: 속은 어둡게, 윤곽만 밝게.
  if(tone==="shade"){
    c.strokeStyle="rgba(183,155,224,.95)";c.lineWidth=2.6;
    c.lineJoin="miter";c.miterLimit=6;c.stroke();
    evPoly(c,cx,cy,R,rot,.62,P,A(T[1],.9));
    c.strokeStyle="rgba(160,132,205,.75)";c.lineWidth=1.6;c.stroke();
    return;}
  evPoly(c,cx,cy,R,rot,.80,P,A(T[1],.96));
  evPoly(c,cx,cy,R,rot,.52,P,A(T[2],1));
}
// 모티프 실루엣 — 단위 좌표(코어에서 바깥으로 +x)
const EVP={
  leaf :[[.30,-.16],[.72,-.44],[1.06,-.30],[1.14,.10],[.86,.44],[.44,.34],[.26,.10]],
  fang :[[.34,-.20],[1.10,-.10],[1.16,.10],[.34,.20],[.52,0]],
  tri  :[[1.14,0],[.34,.62],[.34,-.62]],
  hook :[[.30,-.14],[.92,-.34],[1.20,.02],[.92,.40],[.62,.20],[.68,-.02]],
  spike:[[1.22,0],[.36,.26],[.36,-.26]],
  flame:[[.30,-.22],[.62,-.10],[.78,-.30],[.92,.02],[1.16,-.06],[.86,.34],
         [.50,.26],[.34,.16]],
  hex  :[[1.10,0],[.55,.95],[-.55,.95],[-1.10,0],[-.55,-.95],[.55,-.95]],
  shard:[[1.18,-.08],[.62,.34],[.30,.10],[.52,-.30]],
  icicle:[[1.28,0],[.30,.18],[.44,0],[.30,-.18]],
  zig  :[[.32,-.10],[.62,-.26],[.72,-.02],[1.02,-.18],[1.20,.10],[.80,.06],
         [.70,.26],[.42,.12]],
  fork :[[.34,-.18],[1.16,-.34],[.86,-.04],[1.20,.26],[.34,.18]],
  wire :[[.34,-.09],[.94,-.09],[.94,-.40],[1.14,-.40],[1.14,.12],[.34,.12]],
  moon :[[.34,-.30],[.98,-.46],[1.20,0],[.98,.46],[.34,.30],[.72,0]],
  fin  :[[.30,-.12],[1.24,-.44],[1.02,.06],[1.20,.42],[.44,.22]],
  swirl:[[.30,-.14],[.88,-.40],[1.22,-.06],[.94,.34],[.56,.44],[.66,.10]],
  // 빙 — 다섯이 서로 다른 「언 방식」이다
  dend :[[.30,-.07],[.62,-.07],[.72,-.30],[.86,-.26],[.80,-.05],[1.22,-.05],
         [1.22,.05],[.80,.05],[.86,.26],[.72,.30],[.62,.07],[.30,.07]],
  prism:[[.34,-.13],[1.06,-.20],[1.24,0],[1.06,.20],[.34,.13],[.46,0]],
  plate:[[.26,-.46],[.96,-.62],[1.18,-.10],[.96,.50],[.30,.40],[.44,0]],
  chip :[[1.16,-.10],[.74,.28],[.42,.12],[.58,-.24]],
  crack:[[.30,-.045],[.72,-.10],[.70,-.30],[.80,-.30],[.84,-.06],[1.24,-.05],
         [1.24,.05],[.84,.06],[.80,.32],[.70,.32],[.72,.10],[.30,.045]],
  // 뇌 — 기존 「번개 가닥」의 결을 유지하되 끝맺음이 다르다
  bolt2:[[.32,-.10],[.66,-.24],[.74,-.02],[1.06,-.20],[1.26,.06],[.92,.02],
         [1.02,.30],[.70,.14],[.62,.30],[.44,.12]],
  tri3 :[[.34,-.16],[.86,-.28],[.74,-.06],[1.24,-.34],[1.02,.02],[1.24,.36],
         [.74,.08],[.86,.30],[.34,.16]],
  saw  :[[.34,-.09],[.56,-.26],[.62,-.06],[.84,-.24],[.90,-.04],[1.14,-.22],
         [1.24,.08],[.96,.06],[.88,.26],[.66,.10],[.58,.28],[.40,.10]],
  wire2:[[.34,-.08],[.88,-.08],[.88,-.36],[1.10,-.36],[1.10,-.02],[1.28,-.02],
         [1.28,.10],[.98,.10],[.98,.34],[.76,.34],[.76,.10],[.34,.10]],
  arc2 :[[.32,-.06],[.72,-.16],[.66,.02],[1.30,-.10],[1.30,.10],[.66,.14],
         [.72,.24],[.32,.08]],
  // 풍 — **선풍기 날개.** 뿌리가 좁고 끝이 넓게 휘어야 「돈다」가 된다
  fan3 :[[.26,-.10],[.70,-.52],[1.16,-.44],[1.24,-.02],[.92,.30],[.46,.24],
         [.34,.06]],
  fan4 :[[.26,-.07],[.78,-.34],[1.22,-.22],[1.20,.06],[.80,.20],[.36,.16]],
  turb :[[.30,-.18],[.72,-.44],[1.06,-.22],[1.02,.14],[.66,.26],[.38,.12]],
  fanS :[[.24,-.06],[.62,-.26],[.96,-.18],[.94,.06],[.62,.16],[.32,.10]],
  vane :[[.26,-.09],[.72,-.40],[1.20,-.30],[1.26,.00],[.94,.24],[.48,.20],
         [.60,.02]],
  // 어둠 A — **빛을 먹는다.** 전부 안쪽을 향하거나 안으로 말려든다.
  swal :[[1.20,-.22],[1.24,.16],[.78,.34],[.46,.06],[.72,-.02],[.88,.18],
         [1.00,.06],[.86,-.16]],
  maw  :[[1.26,-.30],[1.26,.30],[.34,.12],[.34,-.12]],
  foldw:[[1.14,-.44],[1.20,.10],[.62,.46],[.30,.10],[.66,.06],[.84,.24],
         [.96,.02],[.74,-.24]],
  itooth:[[1.22,-.14],[1.22,.14],[.36,.06],[.36,-.06],[.62,0]],
  coil :[[1.22,-.10],[1.16,.24],[.72,.40],[.40,.14],[.58,-.06],[.70,.20],
         [.94,.14],[.98,-.06]],
  // 어둠 B — **그림자가 자란다.** 전부 밖으로 뻗거나 갈라지거나 번진다.
  fingr:[[.30,-.055],[1.30,-.09],[1.36,0],[1.30,.09],[.30,.055]],
  branch:[[.30,-.06],[.70,-.06],[.86,-.30],[.98,-.26],[.90,-.04],[1.30,-.04],
          [1.30,.04],[.90,.04],[.98,.28],[.86,.32],[.70,.06],[.30,.06]],
  smear:[[.34,-.24],[.86,-.40],[1.22,-.12],[1.10,.26],[.66,.42],[.36,.22],
         [.56,0]],
  longs:[[.28,-.12],[1.40,-.20],[1.44,.04],[.30,.14]],
  ghost:[[1.06,0],[.60,.68],[-.10,.86],[-.62,.42],[-.62,-.42],[-.10,-.86],
         [.60,-.68]],
};
// [속성][안] = {p:모티프, n:개수, sp:회전속도, ring:묶는 고리}
// 확정된 것만 남긴다 — 고르고 나면 후보는 소음이다. 미확정인 **뇌**만 5안을
// 유지한다. (탐색했던 모티프들은 EVP 에 남겨 뒀다 — 나중에 다른 속성이나
// 융화를 잡을 때 어휘로 다시 쓴다.)
const EVSET={
  toxin:[["leaf",3,.50,.56]],
  ember:[["flame",8,.30,0]],
  frost:[["dend",6,.10,0]],
  volt :[["vj1",7,0,0]],
  gale :[["fsE",4,1.05,0]],
  shadeA:[["foldGhostCore",4,-.30,0]],
};

// ── 폴리곤으로 안 되는 모티프 ────────────────────────────────────────────
const EVDRAW={
  // 뇌 — **번쩍이고 매번 다른 길로 간다.** 얼음의 가지와 갈리는 것은 모양이
  // 아니라 이 두 가지다: 경로가 계속 바뀌고, 켜졌다 꺼진다.
  spark(c,cx,cy,RR,t,n,sp,tn){
    const step=(t*7)|0;                          // 0.14초마다 새 경로
    for(let i=0;i<n;i++){
      const on=hash(step*3.1+i*7.7)>.35;         // 몇 가닥만 켜진다
      if(!on)continue;
      const a0=i/n*TAU+t*sp;
      const P=[[cx,cy]];
      let ang=a0, rr=RR*.34;
      for(let k=0;k<5;k++){
        ang+=(hash(step*5.3+i*11.3+k*2.1)-.5)*1.25;
        rr+=RR*.18;
        P.push([cx+Math.cos(ang)*rr, cy+Math.sin(ang)*rr]);}
      celRibbon(c,P,4.2,tn,.95);
      if(hash(step*9.1+i)>.6){                   // 곁가지 — 갈라져 죽는다
        const b=P[3], ba=ang+(hash(step*13.7+i)-.5)*1.9;
        celRibbon(c,[b,[b[0]+Math.cos(ba)*RR*.34,b[1]+Math.sin(ba)*RR*.34]],
          2.6,tn,.8);}}},
  // 뇌 — 코어에서 짧게 튀는 스파크. 방향도 개수도 매 순간 바뀐다.
  fizz(c,cx,cy,RR,t,n,sp,tn){
    const step=(t*11)|0;
    for(let i=0;i<n;i++){
      if(hash(step*3.7+i*5.1)>.55)continue;
      const a=hash(step*7.3+i*2.9)*TAU;
      const L=RR*(.42+.55*hash(step*11.1+i));
      celRibbon(c,[[cx+Math.cos(a)*RR*.28,cy+Math.sin(a)*RR*.28],
        [cx+Math.cos(a+.3)*L*.7,cy+Math.sin(a+.3)*L*.7],
        [cx+Math.cos(a-.2)*L,cy+Math.sin(a-.2)*L]],3.4,tn,.95);}},
  // 뇌 — 두 고리 사이를 잇는 가닥이 자리를 옮긴다.
  jump(c,cx,cy,RR,t,n,sp,tn){
    celHoop(c,cx,cy,RR*.44,1,0,2.6,tn,.5);
    celHoop(c,cx,cy,RR*1.05,1,0,2.6,tn,.5);
    const step=(t*8)|0;
    for(let i=0;i<n;i++){
      if(hash(step*3.1+i*9.7)>.5)continue;
      const a=hash(step*5.9+i*3.3)*TAU;
      const P=[[cx+Math.cos(a)*RR*.44,cy+Math.sin(a)*RR*.44]];
      let ang=a,rr=RR*.44;
      for(let k=0;k<3;k++){ang+=(hash(step*7.7+i+k)-.5)*1.0;rr+=RR*.20;
        P.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}
      celRibbon(c,P,3.6,tn,.9);}},
  // 뇌 — 낙뢰. 굵은 한 줄이 주기적으로 내리치고 잔가지가 붙는다.
  strike(c,cx,cy,RR,t,n,sp,tn){
    const u=(t*1.6)%1;
    if(u>.34)return;
    const f=1-u/.34, step=((t*1.6)|0);
    for(let i=0;i<n;i++){
      const a0=i/n*TAU+step*.7;
      const P=[[cx,cy]];let ang=a0,rr=RR*.30;
      for(let k=0;k<4;k++){ang+=(hash(step*4.1+i*6.3+k)-.5)*.95;rr+=RR*.26;
        P.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}
      celRibbon(c,P,6.5*f+1,tn,f);}},
  // 뇌 — **1안 + 3안.** 두 고리가 틀을 잡고, 그 사이를 잇는 가닥이 매 순간
  // 경로를 다시 굴리며 몇 개만 켜진다. 고리는 「전극」이라 가닥이 어디서
  // 어디로 가는지가 읽히고, 굴려지는 경로가 얼음과 갈라 준다.
  sparkJump(c,cx,cy,RR,t,n,sp,tn){
    // **테두리도 가만히 있으면 안 된다.** 매끈한 원 둘 사이에서 가닥만
    // 튀면 「전기가 도는 장치」이지 전기 자체가 아니다 — 전극도 지글거려야
    // 전부가 살아 있는 것으로 보인다. 매끈한 고리 대신 **마디마다 다른
    // 박자로 흔들리는 다각형** 둘을 그린다.
    // ⚠️ **닫힌 고리에 리본을 쓰면 이음매가 끊긴다.** ribbonPoly 는 양 끝을
    // 0 으로 좁히는 종형이라(sin 테이퍼), 시작=끝인 경로에서는 그 자리에
    // 구멍이 난다 — 우측 상단이 끊겨 보인 게 그것이다(2026-08-09).
    // 닫힌 것은 **획(stroke)으로 그린다**: closePath 가 이음매를 없앤다.
    const jit=(k,w,al,seed)=>{
      const T=TONE[tn],N=28;
      c.beginPath();
      for(let i=0;i<N;i++){const q=i/N*TAU;
        const n1=Math.sin(t*11+i*2.3+seed), n2=Math.sin(t*17-i*3.7+seed*1.9);
        const rr=RR*k*(1+.055*n1+.035*n2);
        const px=cx+Math.cos(q)*rr, py=cy+Math.sin(q)*rr;
        i?c.lineTo(px,py):c.moveTo(px,py);}
      c.closePath();
      c.lineJoin="round";c.lineCap="round";
      c.strokeStyle=A(T[0],.95*al);c.lineWidth=w;c.stroke();
      c.strokeStyle=A(T[1],.97*al);c.lineWidth=w*.62;c.stroke();
      c.strokeStyle=A(T[2],al);c.lineWidth=w*.24;c.stroke();};
    jit(.40,4.4,.75,0);                             // 안쪽 전극
    jit(1.06,3.8,.60,4.7);                         // 바깥 전극
    const step=(t*7)|0;
    for(let i=0;i<n;i++){
      if(hash(step*3.1+i*7.7)>.55)continue;        // 몇 가닥만 켜진다
      const a0=i/n*TAU+t*sp+hash(step*2.3+i)*.5;
      const P=[[cx+Math.cos(a0)*RR*.40,cy+Math.sin(a0)*RR*.40]];
      let ang=a0,rr=RR*.40;
      for(let k=0;k<4;k++){                        // 바깥 고리까지 튄다
        ang+=(hash(step*5.3+i*11.3+k*2.1)-.5)*1.15;
        rr+=RR*.165;
        P.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}
      celRibbon(c,P,4.4,tn,.95);
      if(hash(step*9.1+i)>.55){                    // 곁가지 — 갈라져 죽는다
        const b=P[2], ba=ang+(hash(step*13.7+i)-.5)*1.9;
        celRibbon(c,[b,[b[0]+Math.cos(ba)*RR*.30,b[1]+Math.sin(ba)*RR*.30]],
          2.6,tn,.75);}}},
  // ── 뇌 6안 계열 ───────────────────────────────────────────────────────
  // 뼈대: **지글거리는 전극 + 매 순간 새 길로 튀는 가닥.** 전극이 살아 있어야
  // 「전기가 도는 장치」가 아니라 전기 자체가 되고, 경로가 다시 굴려져야
  // 얼음의 가지와 갈린다. 다섯은 **전극의 수와 모양**, 그리고 **가닥이 어디서
  // 어디로 가는가**만 다르다.
  //
  // ⚠️ 굵기는 리본 시절과 같게 유지한다 — 획은 끝이 안 가늘어져 같은 숫자를
  // 쓰면 훨씬 진해 보인다(2026-08-09 실기 판정).
  // ── 뇌 — **번개 덩어리가 고리를 이룬다** ─────────────────────────────
  //
  // 원본(`ELEM.bolt`)의 문법이 이것이다: 굵은 리본 몇 가닥이 서로 겹쳐 **각진
  // 고리**를 만들고, 반지름 지터가 초당 여러 번 다시 굴려져 번쩍인다.
  // 가는 실가닥으로 갔던 앞판은 방향 자체가 틀렸다(2026-08-09 반려) —
  // 이 속성의 정체는 **덩어리**이지 선이 아니다.
  //
  // 다섯은 **덩어리의 굵기·개수·지터**와 **덧붙는 것**만 다르다.
  vbMake(c,cx,cy,RR,t,tn,P){
    const seed=(t*P.hz)|0, r=RR*.94;
    // ⚠️ **각도는 묶고, 흔들림만 제각각으로.** 덩어리마다 회전 속도를 다르게
    // 주면 시간이 지나며 서로 흩어져 **고리가 열린다** — 특정 타이밍마다
    // 끊기는 그림이 그것이다(2026-08-09 판정).
    //
    // 무작위성은 살리되 각도는 **제자리 진동**으로 준다: 조각은 자기 슬롯을
    // 지키면서 ±OSC 만큼만 좌우로 떤다. 덮임은 산수로 보장된다 —
    // span(2.0) ≥ 한 칸(2π/6=1.05) + 2·OSC(0.5) 이면 절대 안 벌어진다.
    // 엉킴은 **반지름 쪽 흔들림**이 낸다(조각마다 다른 박자로 안팎을 넘나든다).
    const OSC=.25;
    const ring=(n,span,w,jit,rad,al,sd)=>{
      for(let k=0;k<n;k++){
        const osc=Math.sin(t*(1.1+1.7*hash(k*4.1+(sd||0)))+k*2.3)*OSC;
        const a=k/n*TAU+t*P.sp+osc+(sd||0), a2=a+span;
        const Pt=[];
        for(let s2=0;s2<=6;s2++){const p2=s2/6, aa=a+(a2-a)*p2;
          // 반지름 — 지터(번쩍임) + 조각마다 다른 박자의 물결(엉킴)
          const weave=Math.sin(p2*4.5+t*(1.5+1.3*hash(k*7.7+(sd||0)))+k*1.9);
          const jr=rad*(1+(hash(seed+k*7+s2*3.1+(sd||0)*11)-.5)*jit
                          +.10*weave);
          Pt.push([cx+Math.cos(aa)*jr,cy+Math.sin(aa)*jr]);}
        // ⚠️ **리본이 아니라 획.** 리본은 양 끝이 0 으로 좁아져 조각과 조각
        // 사이가 끊겨 보인다(2026-08-09 판정). 둥근 마감이 겹쳐야 이어진다.
        celStroke(c,Pt,w,tn,al);}};
    ring(P.n,P.span,P.w,P.jit,r,.92,0);
    if(P.inner)ring(P.n2,P.span2,P.w2,P.jit2,r*P.inner,.72,3.7);
    if(P.spur){                                    // 틈에서 바깥으로 튀는 가시
      for(let k=0;k<P.n;k++){
        if(hash(seed*3.1+k*7.7)>.5)continue;
        const a=k/P.n*TAU+t*P.sp+P.span*.5;
        celSpike(c,cx+Math.cos(a)*r,cy+Math.sin(a)*r,a,
          RR*(.28+.24*hash(seed+k)),P.w*.75,tn,.9);}}
    // **안에서 밖으로 뻗어나가려는 가닥** — 플라즈마 구(球)의 그것.
    // 껍질(덩어리 고리)만 있으면 「테두리가 도는 물건」이고, 속에서 무언가
    // 계속 밀고 나오려 해야 **갇혀 있는 힘**으로 읽힌다. 경로는 지터와 함께
    // 다시 굴려지고, 껍질에 닿는 자리가 밝게 달아오른다.
    if(P.ten){
      const T=P.ten;
      for(let i=0;i<T.n;i++){
        if(hash(seed*3.7+i*5.1)>T.on)continue;
        const a0=hash(seed*2.3+i*9.7)*TAU;
        const reach=r*(T.over?1+T.over*hash(seed*11+i):.98);
        const Pt=[[cx,cy]];
        let ang=a0, rr=r*.12;
        const segs=T.segs||5;
        for(let k2=0;k2<segs;k2++){
          ang+=(hash(seed*7.7+i*11.3+k2*2.1)-.5)*T.wob;
          rr+=(reach-r*.12)/segs;
          Pt.push([cx+Math.cos(ang)*rr,cy+Math.sin(ang)*rr]);}
        celRibbon(c,Pt,T.w,tn,.95);
        // 닿는 자리 — 껍질이 그 지점만 달아오른다
        const tip=Pt[Pt.length-1];
        celSplash(c,tip[0],tip[1],T.w*1.5,7,i*3+seed,tn,.9);}}
    // ⚠️ 원본의 **가운데 주기적 방사는 뺐다** — 코어가 번쩍이면 시선이 거기
    // 붙어서, 정작 이 속성의 정체인 「엉켜 도는 덩어리」를 안 보게 된다
    // (2026-08-09 판정). 번쩍임은 덩어리의 지터가 이미 내고 있다.
  },
  vj1(c,cx,cy,RR,t,n,sp,tn){EVDRAW.vbMake(c,cx,cy,RR,t,tn,
    {n:6,span:2.0,w:7,jit:.42,hz:9,sp:.55,
     ten:{n:5,w:3.6,wob:1.15,on:.62,segs:5}});},
  vj2(c,cx,cy,RR,t,n,sp,tn){EVDRAW.vbMake(c,cx,cy,RR,t,tn,
    {n:6,span:2.0,w:7,jit:.42,hz:11,sp:.5,
     ten:{n:10,w:2.2,wob:1.35,on:.5,segs:6}});},
  vj3(c,cx,cy,RR,t,n,sp,tn){EVDRAW.vbMake(c,cx,cy,RR,t,tn,
    {n:4,span:2.6,w:12,jit:.28,hz:6,sp:.35,
     ten:{n:3,w:6.0,wob:.85,on:.75,segs:4}});},
  vj4(c,cx,cy,RR,t,n,sp,tn){EVDRAW.vbMake(c,cx,cy,RR,t,tn,
    {n:11,span:1.5,w:4.2,jit:.58,hz:15,sp:.8,
     ten:{n:8,w:2.4,wob:1.5,on:.45,segs:6}});},
  vj5(c,cx,cy,RR,t,n,sp,tn){EVDRAW.vbMake(c,cx,cy,RR,t,tn,
    {n:6,span:2.0,w:7,jit:.42,hz:9,sp:.5,
     ten:{n:6,w:3.4,wob:1.2,on:.55,segs:5,over:.28}});},
  // 풍 — **6안 계열.** 「고리가 떠나고 그 위에 무엇이 실린다」를 뼈대로 두고,
  // **실리는 것**과 **떠나는 방식**만 바꾼 다섯. 뼈대가 같아야 한 벌이고,
  // 실리는 것이 달라야 고를 값이 생긴다.
  fsA(c,cx,cy,RR,t,n,sp,tn){                        // 획 하나가 길게
    for(let i=0;i<n;i++){
      const u=(t*sp*.42+i/n)%1, rr=RR*(.30+1.15*u), al=Math.sin(u*Math.PI);
      celHoop(c,cx,cy,rr,1,0,5*(1-u)+1,tn,al*.40);
      const a=i/n*TAU+t*sp+u*1.5,P=[];
      for(let k=0;k<=12;k++){const q=a-k/12*2.6;
        P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
      celRibbon(c,P,6*(1-u*.5)+1,tn,al*.95);}},
  fsB(c,cx,cy,RR,t,n,sp,tn){                        // 획 셋이 짧게 나란히
    for(let i=0;i<n;i++){
      const u=(t*sp*.42+i/n)%1, rr=RR*(.30+1.15*u), al=Math.sin(u*Math.PI);
      celHoop(c,cx,cy,rr,1,0,4.5*(1-u)+1,tn,al*.35);
      for(let m=0;m<3;m++){
        const a=i/n*TAU+t*sp+u*1.5+m*.34,P=[];
        for(let k=0;k<=6;k++){const q=a-k/6*.9;
          P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
        celRibbon(c,P,4*(1-u*.5)+1,tn,al*.8);}}},
  fsC(c,cx,cy,RR,t,n,sp,tn){                        // 날이 실린다
    for(let i=0;i<n;i++){
      const u=(t*sp*.42+i/n)%1, rr=RR*(.30+1.15*u), al=Math.sin(u*Math.PI);
      celHoop(c,cx,cy,rr,1,0,4.5*(1-u)+1,tn,al*.38);
      const a=i/n*TAU+t*sp+u*1.5;
      c.save();c.globalAlpha=al;
      evShape(c,cx+Math.cos(a)*rr*.0,cy+Math.sin(a)*rr*.0,rr*.92,a,EVP.fanS,tn);
      c.restore();}},
  fsD(c,cx,cy,RR,t,n,sp,tn){                        // 티끌이 실린다
    for(let i=0;i<n;i++){
      const u=(t*sp*.42+i/n)%1, rr=RR*(.30+1.15*u), al=Math.sin(u*Math.PI);
      celHoop(c,cx,cy,rr,1,0,4*(1-u)+1,tn,al*.42);
      for(let m=0;m<7;m++){
        const a=i/n*TAU+t*sp+u*1.5+hash(m*3.1+i)*1.6,P=[];
        for(let k=0;k<=3;k++){const q=a-k*.11;
          P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
        celRibbon(c,P,2.4,tn,al*.85);}}},
  fsE(c,cx,cy,RR,t,n,sp,tn){                        // 고리가 기울어 떠난다
    for(let i=0;i<n;i++){
      const u=(t*sp*.42+i/n)%1, rr=RR*(.30+1.15*u), al=Math.sin(u*Math.PI);
      const sq=1-u*.45, rot=i/n*TAU+t*sp*.5;
      celHoop(c,cx,cy,rr,sq,rot,5*(1-u)+1,tn,al*.42);
      const a=rot+u*1.5,P=[];
      for(let k=0;k<=10;k++){const q=a-k/10*2.0;
        P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr*sq]);}
      c.save();c.translate(cx,cy);c.rotate(rot);c.translate(-cx,-cy);
      celRibbon(c,P,5.5*(1-u*.5)+1,tn,al*.9);c.restore();}},
  // 어둠 A — **3안 + 5안.** 접히는 판이 그대로 나선으로 말려든다: 판이
  // 안쪽으로 접히면서 그 궤적이 감긴다. 「먹는다」의 두 동작(접기·감기)이
  // 한 몸이 되어, 판만 있을 때보다 빨아들이는 힘이 보인다.
  foldCoil(c,cx,cy,RR,t,n,sp,tn){
    for(let i=0;i<n;i++){
      const rot=t*sp+i/n*TAU;
      const fold=.5+.5*Math.sin(t*1.3+i*1.7);       // 접히는 정도
      // 판 — 접힐수록 안쪽으로 좁아진다
      const P=EVP.foldw.map(v=>[v[0]*(1-fold*.30), v[1]*(1-fold*.42)]);
      evShape(c,cx,cy,RR,rot,P,tn);
      // 그 판이 그린 나선 자국 — 안으로 감겨 사라진다
      const T=[];
      for(let k=0;k<=10;k++){const q=rot-k*.20;
        T.push([cx+Math.cos(q)*RR*(1.02-k*.075),cy+Math.sin(q)*RR*(1.02-k*.075)]);}
      c.beginPath();
      T.forEach((v,k)=>k?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));
      c.strokeStyle="rgba(183,155,224,"+(.55-fold*.2)+")";
      c.lineWidth=3.2*(1-fold*.4)+.6;c.stroke();}},
  // 어둠 — **A 6안(둘레) + B 5안(코어).** 바깥에서는 판이 접혀 감기며
  // 빨아들이고, 그 한가운데는 각진 별이 아니라 **어긋나 겹친 실루엣**이다.
  // 「먹는다」와 「자란다」가 한 몸이 되는 유일한 안 — 빨아들인 것이 안에서
  // 자기를 복제하는 그림이라, 두 컨셉이 인과로 이어진다.
  foldGhostCore(c,cx,cy,RR,t,n,sp,tn){
    EVDRAW.foldCoil(c,cx,cy,RR,t,n,sp,tn);        // 둘레 — A 6안 그대로
    for(let i=2;i>=0;i--){                        // 코어 — B 5안 축소판
      const lag=i*.42, f=1-i/3;
      const dx=Math.cos(t*.55-lag)*RR*.10*i, dy=Math.sin(t*.42-lag)*RR*.08*i;
      const P=EVP.ghost.map((v,k)=>{
        const w=1+(1-f)*.20*Math.sin(t*1.9+k*2.1+i*3.3);
        return[v[0]*w,v[1]*w];});
      evPoly(c,cx+dx,cy+dy,RR,t*.05,.40,P,A(TONE[tn][0],.9*f+.1));
      c.strokeStyle="rgba(183,155,224,"+(.30+.65*f)+")";
      c.lineWidth=1.3+1.3*f;c.stroke();
      if(i===0){
        evPoly(c,cx+dx,cy+dy,RR,t*.05,.24,P,A(TONE[tn][1],.92));
        c.strokeStyle="rgba(200,178,236,.9)";c.lineWidth=1.5;c.stroke();}}
    return true;},                                // 코어를 내가 그렸다
  // 어둠 B — **3안 + 5안.** 어긋나 겹친 실루엣이 **번지면서** 흐른다.
  // 겹친 것만으로는 분신이고, 번져야 그림자다 — 뒤로 갈수록 윤곽이 뭉개져
  // 원본만 또렷하다.
  ghostSmear(c,cx,cy,RR,t,n,sp,tn){
    for(let i=n-1;i>=0;i--){
      const lag=i*.42;
      const dx=Math.cos(t*.55-lag)*RR*.26*i, dy=Math.sin(t*.42-lag)*RR*.20*i;
      const f=1-i/n;                                 // 뒤로 갈수록 흐리다
      // 번짐 — 뒤쪽 실루엣일수록 윤곽이 크게 뭉개진다
      const P=EVP.ghost.map((v,k)=>{
        const w=1+(1-f)*.22*Math.sin(t*1.9+k*2.1+i*3.3);
        return[v[0]*w,v[1]*w];});
      evPoly(c,cx+dx,cy+dy,RR,t*sp,.94,P,A(TONE[tn][0],.85*f+.15));
      c.strokeStyle="rgba(183,155,224,"+(.30+.65*f)+")";
      c.lineWidth=1.4+1.4*f;c.stroke();
      if(i===0){                                     // 원본만 안쪽 겹을 갖는다
        evPoly(c,cx+dx,cy+dy,RR,t*sp,.58,P,A(TONE[tn][1],.9));
        c.strokeStyle="rgba(200,178,236,.85)";c.lineWidth=1.6;c.stroke();}}},
  // 풍 — **1안 + 2안.** 고리가 떨어져 나가고, 그 고리 위에 흐르는 획이
  // 실려 함께 밀려난다. 「떠난다」가 두 겹이라 바람이 더 분명해진다.
  flowShed(c,cx,cy,RR,t,n,sp,tn){
    for(let i=0;i<n;i++){
      const u=(t*sp*.42+i/n)%1;
      const rr=RR*(.30+1.15*u), al=Math.sin(u*Math.PI);
      celHoop(c,cx,cy,rr,1,0,5.5*(1-u)+1,tn,al*.45);        // 떨어져 나가는 고리
      const a=i/n*TAU+t*sp+u*1.5;                            // 고리에 실린 획
      const P=[];
      for(let k=0;k<=8;k++){const q=a-k/8*1.5;
        P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
      celRibbon(c,P,7*(1-u*.5)+1,tn,al*.95);}},
  // 풍 — **흘러 빠져나간다.** 독은 닫힌 날이 붙어서 도는데, 바람은 획이
  // 생겨 바깥으로 밀려나며 옅어진다. 그 「떠난다」가 바람의 정체다.
  flow(c,cx,cy,RR,t,n,sp,tn){
    for(let i=0;i<n;i++){
      const u=(t*sp*.5+i/n)%1;
      const rr=RR*(.34+1.05*u), al=Math.sin(u*Math.PI)*.95;
      const a=i/n*TAU+t*sp+u*1.4;
      const P=[];
      for(let k=0;k<=8;k++){const q=a-k/8*1.55;
        P.push([cx+Math.cos(q)*rr*(1-k*.012),cy+Math.sin(q)*rr*(1-k*.012)]);}
      celRibbon(c,P,7*(1-u*.55)+1,tn,al);}},
  // 풍 — 고리가 생겨 바깥으로 밀려나며 사라진다.
  shed(c,cx,cy,RR,t,n,sp,tn){
    for(let i=0;i<n;i++){
      const u=(t*sp*.42+i/n)%1;
      celHoop(c,cx,cy,RR*(.30+1.15*u),1,0,6*(1-u)+1,tn,Math.sin(u*Math.PI)*.9);}},
  // 풍 — 티끌만 있고 형태가 없다. 흐름 그 자체.
  dust(c,cx,cy,RR,t,n,sp,tn){
    for(let i=0;i<40;i++){
      const u=(t*sp*.5+hash(i*3.1))%1;
      const a=hash(i*7.7)*TAU+u*3.2+t*sp*.4;
      const rr=RR*(.26+1.15*u);
      const al=Math.sin(u*Math.PI)*.9;
      const P=[];
      for(let k=0;k<=4;k++){const q=a-k*.13;
        P.push([cx+Math.cos(q)*rr,cy+Math.sin(q)*rr]);}
      celRibbon(c,P,2.6,tn,al);}},
  // 풍 — 얇은 날 셋 + 뒤로 길게 늘어지는 흐름선.
  vaneflow(c,cx,cy,RR,t,n,sp,tn){
    for(let i=0;i<n;i++){
      const a=i/n*TAU+t*sp;
      evShape(c,cx,cy,RR,a,EVP.fanS,tn);
      const P=[];
      for(let k=0;k<=10;k++){const q=a-k*.19;
        P.push([cx+Math.cos(q)*RR*(1.02+k*.055),cy+Math.sin(q)*RR*(1.02+k*.055)]);}
      celRibbon(c,P,4.5,tn,.55);}},
};

/// 줄 키 → 팔레트. 어둠 두 줄이 같은 팔레트를 쓴다.
const EVTONE={shadeA:"shade",shadeB:"shade"};

// ══ 우주 맵 — 배경 3안 + 미니맵 ═══════════════════════════════════════════
//
// 이 게임에는 **맵이 없었다.** 검은 바탕 위에서 싸운다. 판이 5분이고 플레이어가
// 쉬지 않고 움직이는 게임이라, 배경의 일은 「예쁜 그림」이 아니라 **위치감**이다:
// 내가 움직이는가 · 얼마나 빨리 · 어디로 · 여기 와 본 적이 있는가.
//
// ── 이 배경이 지켜야 하는 것 넷 ──────────────────────────────────────────
// ① **이펙트를 헤치면 안 된다.** 이 게임의 이펙트는 전부 밝은 빛(가산 발광 +
//    3단 계조)이고 실루엣이 **밝기 차**로 읽힌다. 배경이 밝거나 채도가 높으면
//    묻힌다.
// ② **바닥이 없다.** 지면·그림자·원근이 없으니 위치감을 다른 것이 줘야 한다 —
//    이게 세 안을 가르는 축이다.
// ③ **끝없이 스크롤된다.** 이음매가 보이면 안 된다.
// ④ 500마리가 도는 화면이다. **비싸면 안 된다.**
//
// ── ① 을 취향이 아니라 **부등식**으로 만든다 ────────────────────────────
// TONE 표를 실제로 재서 상한을 뽑았다(감마 명도 L=(.299R+.587G+.114B)/255):
//
//   무기 17색 **가운데층**(이펙트의 몸통)   최소 L .542  (mArc #9B6BFF)
//   무기 17색 **바깥층**(제일 어두운 테)    최소 L .133  (mArc #2A1358)
//   무속성 몸의 바깥층 #1E1E23             L .120
//
// 그래서 배경의 상한을 **L .12** 로 둔다(화소의 99.5% 이상). 그러면
//   · 제일 어두운 이펙트 층조차 배경보다 밝아(.133 > .12) 테두리가 안 먹히고,
//   · 이펙트 몸통과의 명도차가 **최소 .42** 라 어떤 무기가 어디에 떠도 산다.
// 별점은 이 상한을 넘겨도 되지만 **면적으로 갚는다** — L>.35 화소가 화면의
// 0.5% 이하. 이펙트는 크고 이어진 덩어리라, 흩어진 점 몇 개로는 안 가려진다.
//
// ⚠️ **진짜로 빡빡한 것은 무기가 아니라 적이다.** 적의 몸은 채움이 어두운
// 도형이다(FOEDARK #24141F → L .102) — 상한 .12 를 「넓은 면적에」 쓰면
// **적이 배경에 묻힌다.** 그래서 상한 두 개로 쓴다:
//   · 넓은 면적(성운·안개)의 **평균 L ≤ .06**  ← 적(.102)보다 확실히 어둡다
//   · 작은 자국(별·은하핵)만 .12 를 넘고, 그 면적이 0.5% 이하
// 적이 그래도 읽히는 것은 **밝은 림**(#E86892 L .577) 덕이고, 그건 이 레포가
// 이미 확정한 규칙이다(README: 「어둠은 밝은 림으로 보인다」).
//
// 구조적 보증이 하나 더 있다: **배경은 가산 합성(lighter)을 쓰지 않는다.**
// 이펙트는 전부 가산이다. 거의 0 인 바탕 위에 얹히면 자기 색 그대로 나오지만,
// 배경이 같은 가산 층에 끼면 **더해져** 위 상한이 통째로 무의미해진다.
// (그래서 배경에서는 celSplash 처럼 `lighter` 패스가 박힌 도구를 안 쓰고,
//  celRibbon 은 glow=false 로 부른다.)

// 배경 전용 3단 계조 4벌. **새 그리기 함수를 안 만들기 위한 것**이다 —
// celRibbon/celPuff/fillPoly 가 팔레트만 갈아끼우면 그대로 배경이 되고,
// 각진 실루엣·3단 계조라는 문법도 안 어긋난다. 네 벌 다 제일 밝은 앞날까지
// L ≤ .124 라, **어떤 도구를 쓰든 예산이 안 깨진다.**
//
// ⚑ **배경에는 흰 앞날이 없다**(행성 맵 담당과 맞춘 규칙, 2026-08-11).
// 눈은 이 게임에서 「어두운 바탕 → 중간 → **흰 앞날**」 3단의 맨 윗단을
// 「이펙트」의 표식으로 배웠다. 배경이 그 단을 쓰면 색을 아무리 잘 골라도
// 배경이 이펙트를 먹는다 — **색의 문제가 아니라 계조를 몇 단 쓰느냐의 문제다.**
// 아래 네 벌은 3단이 다 있지만 **넷 다 이펙트 계조의 「맨 아래 한 단」 안**에서
// 나뉜 것이다: 최댓값 .124 는 무기 바깥층 최솟값(.133)보다도 낮고 무기
// 가운데층 최솟값(.542)의 23% 다. 즉 배경의 「앞날」은 이펙트의 「바탕」보다 어둡다.
// 예외는 **별점뿐**이고, 그건 면적으로 갚는다(L>.35 화소 ≤ 0.1%, 실측 0.06%).
TONE.mapCloud=["#0A0E18","#111726","#182032"];  // 청람 성운   L .055 / .090 / .124
TONE.mapVeil =["#100A18","#191124","#231832"];  // 자보라 성운 L .050 / .083 / .119
TONE.mapDeep =["#07100E","#0D1A17","#142523"];  // 청록 성운   L .045 / .077 / .124
TONE.mapIron =["#080A10","#0F121B","#191E2B"];  // 회청 먼지   L .038 / .063 / .118
// 미니맵 보스 꼭지 — **적의 색 그대로**(FOEEYE #FF2D55). 새 색이 아니라
// 화면에 이미 있는 색을 HUD 로 가져오는 것이다. 여기는 배경이 아니라 HUD 라
// 위 밝기 상한을 안 받는다 — 대신 면적이 10×5px 하나뿐이다.
TONE.mmBoss  =["#4A0C18","#FF2D55","#FFC9D6"];

const MAPINK={
  base  :"#0C0C12",  // 빈 우주 = 캔버스 바탕. **지우개**로 쓴다 — 이 색으로 칠하면
                     // 아무리 겹쳐도 빈 우주보다 어두워지지 않아 구멍이 안 생긴다
  ink   :"#05060B",  // 암흑 성운 — 캔버스 바탕(#0C0C12)보다 **어둡다.** 별을 가린다
  wire  :"#39425F",  // 격자선 — 알파 .3 이하로만 쓴다(합성 후 L ≈ .10)
  starD :"#3F4763",  // 먼 별   L .266
  starM :"#6E7899",  // 중간 별 L .473
  starL :"#A9B3D0",  // 가까운 별 L .703
  starX :"#E6ECFA",  // 드문 밝은 별 L .925 — 화면당 두세 개까지
  glyph :"#4E5878",  // 좌표 라벨 L .345 — 알파 .55
};

/// 2D 해시. 기존 hash() 하나로 두 축을 접는다 — 난수 생성기를 새로 안 들인다.
const h2=(x,y,s)=>hash(x*127.1+y*311.7+(s||0)*57.3);

/// 목업 카메라. 게임에서는 그냥 플레이어 좌표다.
/// **직선으로만 가면 안 된다** — 세로 이음매는 가로로 지나가야 드러나고,
/// 시차는 방향이 바뀌어야 읽힌다.
function mapCam(t){return [t*78+Math.sin(t*.53)*130, -t*34+Math.cos(t*.41)*150];}

/// 셀 산포 — **이음매가 없는 유일한 이유.**
///
/// 텍스처를 깔고 모듈로로 감는 방법은 두 가지로 실패한다: 반복 자국이 남고,
/// 성운처럼 큰 것이 타일 경계에서 잘린다. 대신 월드를 [cell] 격자로 자르고
/// **칸 번호를 해시**해 그 칸 안의 점 하나를 정한다.
///   · 칸 번호는 무한하니 무늬가 영영 안 반복된다 (= 이음매도 반복도 없다)
///   · 큰 것은 [pad] 칸만큼 바깥까지 돌면 경계에서 안 잘린다
///   · 도는 칸 수가 **화면 넓이에만** 비례한다 — 월드 크기와 무관(O(1))
///
/// [fn] 은 (화면x, 화면y, 칸i, 칸j, 그 칸의 난수) 를 받는다.
function scatter(cx,cy,W,H,cell,pad,fn){
  const i0=Math.floor((cx-W/2)/cell)-pad,i1=Math.floor((cx+W/2)/cell)+pad;
  const j0=Math.floor((cy-H/2)/cell)-pad,j1=Math.floor((cy+H/2)/cell)+pad;
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++)
    fn((i+.12+.76*h2(i,j,1))*cell-cx+W/2,
       (j+.12+.76*h2(i,j,2))*cell-cy+H/2,i,j,h2(i,j,3));
}

/// 별 하나. **점이다** — 십자 광채도 후광도 안 그린다.
/// 광채는 이펙트의 문법이라 배경이 쓰면 「작은 이펙트」로 오독된다
/// (빛폭탄이 화염 색이라 속성이 붙은 걸로 읽혔던 것과 같은 종류의 사고).
function mapStar(c,x,y,r,col,a){
  c.fillStyle=A(col,a===undefined?1:a);
  if(r<=1.15){c.fillRect(x-r,y-r,r*2,r*2);return;}  // 1px 급은 사각이 더 싸고 더 별답다
  c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
}

// ── A안 「심연」 — 위치감을 **상대 운동(시차)** 이 준다 ────────────────────
//
// 표지물이 없다. 깊이가 다른 먼지층이 서로 다른 속도로 흘러, 화면만 봐도
// **어느 쪽으로 얼마나 빨리** 가는지가 즉시 읽힌다. 근층 알갱이는 속도에
// 비례해 **선으로 늘어난다** — 크기·밝기·속도가 **함께** 변해야 깊이로 읽히고,
// 셋 중 하나만 바꾸면 「그냥 점이 다른 점」이 된다.
//
// ⚠️ 이 안은 **절대 위치를 못 준다.** 「여기 와 봤다」가 안 된다 — 되돌아온
// 자리와 처음 보는 자리가 똑같이 생겼다. 그 빚을 미니맵이 갚는다.
// 대신 셋 중 **제일 싸고 제일 안전하다**: 전부 1~2px 점이라 이펙트를 가릴
// 면적 자체가 없다.
//
// [깊이, 칸, 반지름, 색, 알파, 등장확률, 늘어남]
const DRIFT=[
  [.07, 30,  .9,"starD",.55,1  ,0  ],   // 아득한 먼지 — 촘촘하고 흐리고 거의 정지
  [.20, 42, 1.0,"starD",.85, .8,0  ],
  [.46, 68, 1.4,"starM",.9 , .5, .3],
  [1.0,128, 2.0,"starL",1  , .4,1  ],   // 스쳐 지나가는 성진 — 굵고 밝고 늘어난다
];
function mapDrift(c,t,W,H,st){
  const p0=mapCam(t),p1=mapCam(t-.05);
  const vx=(p0[0]-p1[0])/.05,vy=(p0[1]-p1[1])/.05,sp=Math.hypot(vx,vy)||1;
  // 심연 안개 — **표지물이 아니다.** 알아볼 수가 없으니 위치를 못 준다.
  // 알갱이가 읽힐 바탕일 뿐이라 제일 깊은 곳(깊이 .03)에 둔다.
  scatter(p0[0]*.03,p0[1]*.03,W,H,430,1,(x,y,i,j,r)=>{
    if(r>.62)return;
    const rr=110+r*260,T=toneOf(r<.28?"mapCloud":"mapVeil");
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[2],.5));g.addColorStop(.34,A(T[1],.55));
    g.addColorStop(.62,A(T[0],.42));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();});
  for(let L=0;L<DRIFT.length;L++){
    const d=DRIFT[L];
    scatter(p0[0]*d[0],p0[1]*d[0],W,H,d[1],1,(x,y,i,j,r)=>{
      if(r>d[5])return;
      const rr=d[2]*(.6+.75*h2(i,j,5)),al=d[4]*(.5+.5*h2(i,j,6));
      // 늘어남 — 「빠르다」는 점이 아니라 **선**이 말한다.
      // ⚠️ 처음엔 둥근 캡의 굵은 선(폭 rr*1.4, 길이 ≤10)이었는데 **올챙이**로
      // 보였다(2026-08-11 렌더) — 머리와 꼬리가 같은 굵기라 「점 + 혹」이 됐다.
      // ribbonPoly 로 **뒤로 갈수록 좁아지는 꼬리**를 만든다. 길이도 두 배로
      // 늘려 길이/폭 비를 키운다 — 그 비율이 곧 「속도」다.
      if(d[6]>.01){const ln=Math.min(20,sp*d[0]*d[6]*.12);
        if(ln>2){fillPoly(c,ribbonPoly(
          [[x,y],[x-vx/sp*ln*.5,y-vy/sp*ln*.5],[x-vx/sp*ln,y-vy/sp*ln]],
          rr*.8,rr*.12),A(MAPINK[d[3]],al*.42));}}
      mapStar(c,x,y,rr,MAPINK[d[3]],al);});
  }
  // 드문 밝은 별. 「가득한데 안 헤친다」를 만드는 것은 개수가 아니라 **면적**이라,
  // 밝은 것은 크기를 안 키우고 **수만 줄인다**.
  scatter(p0[0]*.7,p0[1]*.7,W,H,290,0,(x,y,i,j,r)=>{
    if(r>.45)return;mapStar(c,x,y,1.1,MAPINK.starX,.85);});
  // ── 제일 가까운 층은 **어둡게** 준다 (행성 맵 담당 실측, 2026-08-11) ──────
  //
  // 근층을 밝게 두면 이펙트와 밝기로 싸우고, 안 싸우게 절반으로 내리면 아예
  // 안 보여서 **그냥 비용**이 된다. 답은 밝기를 조절하는 게 아니라 **뒤집는**
  // 것이다: 근층을 **가리는 층**으로 만들면 아무리 진해도 이펙트와 안 싸운다
  // (가산 빛 vs 차폐는 애초에 같은 축이 아니다).
  //
  // 깊이 1.4 — **월드보다 빨리** 흐른다. 그게 「카메라 코앞」의 정의다.
  //
  // ⚠️ 처음엔 알파 .34 · 반지름 4~10 으로 조심스럽게 넣었다가 **아무것도 안
  // 보였다**(2026-08-11 렌더: 통계로도 p12 가 .515% → .514% 로 안 움직였다).
  // 그게 정확히 넘겨받은 경고의 실패 모드다 — 「안 싸우게 내렸더니 그냥 비용」.
  // 가리는 층에서 **보이는 신호는 밝기가 아니라 「별이 지워지는 것」**이라,
  // 별 몇 개를 덮을 만큼 크고(7~16px) 진해야(.8) 한다. 진하게 올려도 안전한
  // 이유가 바로 이 층의 요지다: **차폐는 가산 발광과 같은 축이 아니다.**
  //
  // 화면 점유는 ~0.6%(980×430 에 열 알 남짓)라 게임을 가릴 위험은 없다 —
  // 이건 밝기 예산이 아니라 가독성 예산이고, 거기서도 여유가 크다.
  //
  // ⚑ **판정: 이 규칙은 A안에 절반만 옮겨온다.** .8/16px 로 올린 뒤 실측해도
  // 화면 통계가 거의 안 움직였고(평균 .0539 → .0539), 눈으로도 **안개 앞을
  // 지날 때만** 보인다. 이유는 성운 먼지 띠를 죽인 것과 **같다**: 가리는 층은
  // **가릴 밝은 것이 있어야** 보인다. A안은 빈 우주라 물어뜯을 것이 없다.
  // 그래서 A안의 깊이감을 실제로 지는 것은 여전히 **밝은 근층 점 + 꼬리**이고,
  // 그건 면적으로 갚는다(L>.35 = 0.055%). 이 어두운 층은 성운 앞을 지날 때
  // 깊이를 한 겹 더 얹는 **보조**로 남긴다 — 열 번의 fillPoly 라 비용도 그만큼이다.
  // (같은 규칙이 B안에서는 제대로 먹는다 — 암흑 성운이 별과 성운을 실제로 먹는다.)
  scatter(p0[0]*1.4,p0[1]*1.4,W,H,260,1,(x,y,i,j,r)=>{
    if(r>.44)return;
    const rr=7+h2(i,j,31)*9, ln=Math.min(34,sp*1.4*.07);
    fillPoly(c,ribbonPoly(
      [[x,y],[x-vx/sp*ln*.5,y-vy/sp*ln*.5],[x-vx/sp*ln,y-vy/sp*ln]],
      rr,rr*.18),A(MAPINK.ink,.8));});
}

// ── B안 「성계」 — 위치감을 **표지물**이 준다 ──────────────────────────────
//
// 은하 하나, 성운 하나가 **알아볼 수 있는 곳**이다. 「나선 왼팔 근처」가 말이
// 되는 순간부터 우주는 지도가 된다 — A안이 못 주는 「와 봤다」를 이게 준다.
//
// 결정 하나: **랜드마크를 깊이 .85 에 둔다.** 은하는 천문학적으로 머니 깊이
// ≈0 이 물리에 맞지만, 그러면 **절대 지나칠 수가 없어** 표지물이 아니라
// 「벽지」가 된다. 지나갈 수 있어야 지나온 것이 된다 — 게임이 물리를 이긴다.
// 대신 원경 별을 깊이 .06 에 두어, **움직이는 것이 랜드마크**로 읽히게 한다.
//
// **선례가 있다.** 뱀파이어 서바이버즈의 스테이지도 무한 스크롤 평면 + 드문드문한
// 지형지물이고, 「어디쯤 왔는지」를 촛대·석관 같은 랜드마크가 준다. 같은 장르에서
// 같은 문제를 같은 축으로 푼 사례라 B안은 셋 중 **검증된 길**이다.
// 다만 그쪽 지형지물은 **상호작용물**(부수면 아이템)이라 눈길을 끄는 것이 이득인
// 반면, 여기 랜드마크는 **순수 배경**이라 눈길을 끌면 손해다 — 그 차이가 아래
// 밝기 상한의 이유다.
//
// 밝기 예산의 승부수: **어둠으로 그린다.** 암흑 성운을 캔버스 바탕(#0C0C12)
// 보다 어두운 #05060B 로 칠해 **별을 가린다** — 큰 면적에 형태를 주면서 밝기
// 예산을 한 톨도 안 쓴다. 이 안에서 밝은 것은 은하 핵 하나(≈ 20 px²)뿐이다.
const MAPNEB=["mapCloud","mapVeil","mapDeep"];
/// 성운 하나.
///
/// ⚠️ 처음엔 **후광 한 장 + celPuff 한 겹**이었는데 첫 렌더에서 반려됐다
/// (2026-08-11): 한 덩이는 성운이 아니라 **만두**로 보이고, celPuff 의 각진
/// 테가 통째로 드러나 「구름」이 아니라 「도장」이 됐다. 고친 셋:
///   ① **엽(葉)을 겹친다** — 위치가 어긋난 후광 셋. 부드러운 가장자리는
///      그라디언트에서만 공짜로 나온다.
///   ② celPuff 는 **알파를 낮춰**(.34) 각진 테가 후광에 녹게 둔다. 그래도
///      각진 실루엣이라는 이 레포의 문법은 안 버린다 — 흐릿한 에어브러시가
///      되면 이펙트와 다른 세계가 되어 버린다.
///   ③ **먼지 띠**로 한 번 가른다. 밝기를 안 쓰고 구조를 만드는 장치.
function mapNebula(c,x,y,rr,sd,tn){
  const T=toneOf(tn);
  for(let k=0;k<3;k++){
    const a=sd*1.7+k*2.3,d=k?rr*(.3+.16*k):0,R2=rr*(1.55-k*.34);
    const gx=x+Math.cos(a)*d,gy=y+Math.sin(a)*d*.7;
    const g=c.createRadialGradient(gx,gy,0,gx,gy,R2);
    g.addColorStop(0,A(T[2],k?.5:.72));g.addColorStop(.34,A(T[1],.62));
    g.addColorStop(.68,A(T[0],.46));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(gx,gy,R2,0,TAU);c.fill();
  }
  // 몸통 — **celPuff 를 그대로 못 쓴다.**
  //
  // ⚠️ 이게 이 배경 작업에서 제일 비싸게 배운 것이다(2026-08-11, 세 번 렌더).
  // 3단 계조는 **제일 바깥이 제일 어둡다** — 검은 화면 위에 뜨는 이펙트에는
  // 맞지만, 배경의 성운 몸통은 **자기 후광 위에** 놓인다. 그러면 그 어두운
  // 바깥 테가 후광보다 어두워 **「구멍」으로 읽힌다.** 실제로 성운 한가운데에
  // 검은 얼룩이 났고, 같은 원인으로 먼지 띠는 화면을 가로지르는 검은 막대가 됐다.
  //
  // 계조를 버리는 게 아니라 **구조에 재배치**한다:
  //   어두운 층 = 후광의 바깥 (위에서 이미 그렸다)
  //   중간 층  = 몸통
  //   밝은 층  = 심
  // 세 톤이 다 있고 어두움→밝음 순서도 그대로다. 겹치는 방식만 바뀐다.
  const n=9+Math.floor(hash(sd*3.7)*4);
  fillPoly(c,puffPoly(x,y,rr*.78,n,sd,.72),A(T[1],.4));
  fillPoly(c,puffPoly(x-rr*.05,y-rr*.09,rr*.44,Math.max(5,n-3),sd+1.7,.72),A(T[2],.4));
  // ✗ **먼지 띠는 뺐다** — 성운에서는 버린 아이디어다(2026-08-11, 네 번 시도).
  //   길이를 줄여 봐도, 성운 안으로 잘라 봐도, 잉크 대신 바탕색 지우개로 바꿔
  //   봐도 매번 **화면을 가로지르는 검은 막대**로 나왔다. 이유가 분명하다:
  //   먼지 띠는 **가릴 밝은 것이 있어야** 띠로 읽히는데, 이 성운은 상한(.12)에
  //   묶여 있어 가릴 밝기 자체가 없다. 밝기가 없는 곳에 그림자를 그리면
  //   그림자가 아니라 **물체**가 된다.
  //   먼지 띠는 후광이 충분히 밝은 **은하에만** 남긴다(mapGalaxy).
}
function mapGalaxy(c,x,y,RR,rot,sq){
  const T=toneOf("mapVeil");
  c.save();c.translate(x,y);c.rotate(rot);c.scale(1,sq);
  const g=c.createRadialGradient(0,0,0,0,0,RR*1.1);
  g.addColorStop(0,A(T[2],.62));g.addColorStop(.3,A(T[1],.46));g.addColorStop(1,A(T[0],0));
  c.fillStyle=g;c.beginPath();c.arc(0,0,RR*1.1,0,TAU);c.fill();
  // 나선 팔 둘. 성운 몸통과 **같은 이유**로 celRibbon 을 안 쓴다 — 3단 계조의
  // 어두운 바깥 테가 후광 위에 얹히면 팔이 「밝은 팔」이 아니라 **검은 붓자국**이
  // 된다(2026-08-11 렌더에서 정확히 그렇게 나왔다). 계조는 후광(어두움) →
  // 팔(중간) → 심(밝음)으로 재배치한다. 안드로메다는 팔이 밝아야 안드로메다다.
  const TA=toneOf("mapCloud");
  for(let k=0;k<2;k++){
    const p=[];
    for(let s=0;s<=18;s++){const u=s/18,a=k*Math.PI+u*2.5,r2=RR*(.13+.87*u);
      p.push([Math.cos(a)*r2,Math.sin(a)*r2]);}
    fillPoly(c,ribbonPoly(p,RR*.12,RR*.02),A(TA[1],.85));
    fillPoly(c,ribbonPoly(p,RR*.05,RR*.008),A(TA[2],.9));
    // 먼지 띠 — 팔 **바깥쪽 가장자리**를 따라 한 줄. 바탕색 지우개라
    // 빈 우주보다 어두워지지 않는다.
    fillPoly(c,ribbonPoly(p.map(q=>[q[0]*1.1,q[1]*1.1]),RR*.045,RR*.01),
      A(MAPINK.base,.8));
  }
  c.restore();
  // 핵 — **화면에서 유일하게 밝은 것.** 지름 3px 남짓이라 면적으로 갚는다.
  const cg=c.createRadialGradient(x,y,0,x,y,RR*.3);
  cg.addColorStop(0,A(MAPINK.starM,.5));cg.addColorStop(1,A(MAPINK.starM,0));
  c.fillStyle=cg;c.beginPath();c.arc(x,y,RR*.3,0,TAU);c.fill();
  mapStar(c,x,y,1.6,MAPINK.starX,.9);
}
function mapReach(c,t,W,H,st){
  const p0=mapCam(t),D=.85;
  // ① 원경 별 — 깊이 .06. **거의 안 움직여야** 랜드마크가 움직이는 걸로 읽힌다.
  scatter(p0[0]*.06,p0[1]*.06,W,H,27,1,(x,y,i,j,r)=>{
    if(r>.86)return;
    mapStar(c,x,y,r<.1?1.3:.9,r<.1?MAPINK.starM:MAPINK.starD,.45+.5*r);});
  // ② 성운 — 한 칸에 하나. 반지름 < 칸/2 라 이웃 칸 하나만 더 돌면 안 잘린다.
  //    「성운이 가득한」을 만드는 것은 **밝기가 아니라 개수**다. 밝기를 올리면
  //    적(#24141F, L .107)이 배경에 묻히므로, 대신 칸을 좁히고 크기를 키운다.
  scatter(p0[0]*D,p0[1]*D,W,H,560,1,(x,y,i,j,r)=>{
    if(r>.7)return;
    mapNebula(c,x,y,110+h2(i,j,7)*150,i*7.3+j*3.1,MAPNEB[Math.floor(h2(i,j,8)*3)%3]);});
  // ③ 은하 — 성운보다 성글다. 대략 12초에 하나 스친다.
  //    더 성글게 두면 「지도의 유일한 표지물」을 한 판에 몇 번 못 만나
  //    B안의 값이 증명이 안 된다(첫 렌더에서 화면에 하나도 안 잡혔다).
  scatter(p0[0]*D,p0[1]*D,W,H,980,1,(x,y,i,j,r)=>{
    if(r>.5)return;
    mapGalaxy(c,x,y,105+h2(i,j,9)*75,h2(i,j,10)*TAU,.34+h2(i,j,11)*.3);});
  // ④ 암흑 성운 — **제일 앞.** 별도 성운도 은하도 가린다.
  //    밝기를 안 쓰고 만드는 형태이자, 깊이가 진짜로 있다는 증거다.
  //
  // ⚠️ 처음엔 **한 겹을 알파 .88 로** 칠했다가 반려됐다(2026-08-11):
  // 지름 400px 짜리 새까만 얼룩 하나가 화면을 먹었다. 고친 둘 —
  //   ① 크기를 절반으로(반지름 70~150),
  //   ② **어둠에도 3단 계조를 쓴다.** 바깥이 옅고 안이 짙다. 한 겹은 만화
  //      얼룩이지만, 옅은 후광 + 세 겹이면 「짙어지는 구름」이 된다.
  scatter(p0[0]*.95,p0[1]*.95,W,H,680,1,(x,y,i,j,r)=>{
    if(r>.4)return;
    const rr=70+h2(i,j,12)*80,n=8+Math.floor(h2(i,j,13)*4),sd=i*5.9+j*2.7;
    const g=c.createRadialGradient(x,y,rr*.35,x,y,rr*1.45);
    g.addColorStop(0,A(MAPINK.ink,.62));g.addColorStop(1,A(MAPINK.ink,0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr*1.45,0,TAU);c.fill();
    for(let k=0;k<3;k++)
      fillPoly(c,puffPoly(x,y,rr*(1-k*.24),n,sd+k*3.1,.66),A(MAPINK.ink,.3+k*.1));});
}

// ── C안 「성좌」 — 위치감을 **셀 수 있는 좌표**가 준다 ──────────────────────
//
// 별을 격자의 마디에 두고 실선으로 잇는다. 밟고 지날 때 마디가 하나씩 지나가니
// **거리가 눈금으로 떨어진다** — 「두 칸 왼쪽」이 말이 되는 유일한 안이다.
// 격자 자체는 인공물이지만 마디가 별이라 우주로 읽히고, 이 게임의 「각진 별」
// 문법을 그대로 쓴다.
//
// 눈금이 **두 단**이다: 잔눈금(124px, 몸 지름의 3.6배 = 한 발짝)과 큰눈금
// (4칸 = 496px ≈ 화면 폭). 한 단만 두면 가까이서는 촘촘해 세다가 놓치고,
// 멀리서는 아무것도 안 보인다.
//
// **전부 깊이 1.0** 이다 — 자는 월드에 박혀 있어야 자다. A안과 정반대이고,
// 그래서 이 안에는 시차가 아예 없다. 대신 이동이 **끊김 없이 정확히** 읽힌다.
// 마디는 해시로 흔들어(±21%) 모눈종이가 안 되게 한다.
// 124 → 112 로 내렸다(2026-08-11). 320px 시안 칸에서 124 는 마디가 2.5개밖에
// 안 들어와 **눈금이 눈금으로 안 보였다.** 세로 800px 짜리 폰 화면 기준으로도
// 112 는 일곱 마디라 「센다」가 성립한다.
const MAPG=112;
function mapLattice(c,t,W,H,st){
  const p0=mapCam(t);
  // 바탕 — 아주 흐린 성운 하나로 「우주」를 만든다. 위치감에는 기여 안 한다.
  scatter(p0[0]*.9,p0[1]*.9,W,H,760,1,(x,y,i,j,r)=>{
    if(r>.34)return;
    const rr=200+r*400,T=toneOf("mapDeep");
    const g=c.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,A(T[1],.5));g.addColorStop(1,A(T[0],0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,rr,0,TAU);c.fill();});
  // 배경 잔별 — 격자와 같은 깊이. 다른 깊이에 두면 「자가 미끄러져」 보인다.
  scatter(p0[0],p0[1],W,H,46,1,(x,y,i,j,r)=>{
    if(r>.5)return;mapStar(c,x,y,.9,MAPINK.starD,.3+.4*r);});
  const i0=Math.floor((p0[0]-W/2)/MAPG)-1,i1=Math.floor((p0[0]+W/2)/MAPG)+1;
  const j0=Math.floor((p0[1]-H/2)/MAPG)-1,j1=Math.floor((p0[1]+H/2)/MAPG)+1;
  const nx=(i,j)=>(i+.5+(h2(i,j,21)-.5)*.42)*MAPG-p0[0]+W/2;
  const ny=(i,j)=>(j+.5+(h2(i,j,22)-.5)*.42)*MAPG-p0[1]+H/2;
  // 실 — 오른쪽·아래 이웃으로만 잇는다(변이 두 번 안 그려진다).
  c.lineCap="butt";
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){
    const x=nx(i,j),y=ny(i,j);
    for(let k=0;k<2;k++){
      const i2=i+(k?0:1),j2=j+(k?1:0);
      // 큰눈금 — 4칸마다 한 줄이 진하다. 세는 단위가 둘이라야 읽힌다.
      const big=(k?(((i%4)+4)%4===0):(((j%4)+4)%4===0));
      // .30/.15 → .40/.20 (2026-08-11). 상한 안에서 최대한 올린다:
      // wire #39425F 는 L .245 이고 알파 .40 이면 합성 후 L ≈ .10 — 여전히
      // 상한(.12) 아래인데 눈에는 확실히 들어온다. **안 보이면 자가 아니다.**
      c.strokeStyle=A(MAPINK.wire,big?.40:.20);
      c.lineWidth=big?1.1:.7;
      c.beginPath();c.moveTo(x,y);c.lineTo(nx(i2,j2),ny(i2,j2));c.stroke();}
  }
  // 마디 — 별. 4×4 마다 **표지성**: 각진 별 + 얇은 링 + 좌표 라벨.
  c.font="7.5px ui-monospace,SFMono-Regular,Menlo,monospace";
  c.textAlign="left";c.textBaseline="middle";
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){
    const x=nx(i,j),y=ny(i,j);
    const mark=((i%4)+4)%4===0&&((j%4)+4)%4===0;
    if(!mark){mapStar(c,x,y,1.0,MAPINK.starM,.55+.35*h2(i,j,23));continue;}
    // 표지성 — jagPoly 그대로. 이 게임의 별은 각져 있다.
    // 이게 **C안의 값이 걸린 자리**라 밝기 예산 안에서 최대한 올린다(2026-08-11:
    // 처음 값에서는 화면에서 못 찾았다). 면적이 지름 17px 짜리 두 개뿐이라
    // 「작은 것만 상한을 넘는다」 규칙에 걸리지 않는다.
    fillPoly(c,jagPoly(x,y,4.6,5,i*3.3+j*1.7,1.5),A(MAPINK.starD,.9));
    fillPoly(c,jagPoly(x,y,2.5,5,i*3.3+j*1.7+.6,1.4),A(MAPINK.starL,.95));
    c.strokeStyle=A(MAPINK.wire,.7);c.lineWidth=.9;
    c.beginPath();c.arc(x,y,8.5,0,TAU);c.stroke();
    // 좌표. **이게 이 안의 값이다** — 「여기가 어디」에 글자로 답한다.
    c.fillStyle=A(MAPINK.glyph,.85);
    c.fillText(String.fromCharCode(65+(((i/4|0)%26)+26)%26)+"·"+
      String((((j/4|0)%100)+100)%100).padStart(2,"0"),x+12,y);
  }
}

// ── 미니맵 ────────────────────────────────────────────────────────────────
//
// **무엇을 보여줄지가 전부다.** 넣을 수 있는 것: 적 개체 · 적 밀도 · 보스 ·
// 암흑물질(젬) · 내 위치 · 지나온 길. 전부 넣으면 0.2초에 못 읽는 소음이 된다.
//
// 고른 것: **적 밀도 하나뿐이다.**
//
// ① **개체는 못 읽는다.** 화면에 500마리가 돈다. 500개의 점은 정보가 아니라
//    질감이고, 세는 데 걸리는 시간이 판단에 쓸 수 있는 시간보다 길다.
// ② 이 게임에서 미니맵을 보는 **유일한 이유는 「어디가 비었나」**다. 5분 내내
//    도망치는 게임이라 결정이 언제나 **탈출 방향 하나**로 떨어진다. 밀도는 그
//    질문에 바로 답하고, 개체 위치는 답을 **계산하게** 만든다.
// ③ **내 위치는 뜻이 없다.** 월드가 무한이라 「지도 위 어디」라는 값이 없다.
//    그래서 이건 지도가 아니라 **나를 중심에 둔 나침반**이다.
// ④ 젬·픽업은 뺐다. 자석 반경이 알아서 끌어오고, 「주우러 갈까」는 도망
//    방향과 **충돌하는 두 번째 결정**이라 미니맵을 두 목적으로 쪼갠다.
//
// ── 로비/행성 담당 미니맵이 기준이다(2026-08-11 조율) ────────────────────
// 겹치는 결정은 **그쪽 것을 따른다.** 나란히 놓이는 화면에서 규칙이 두 벌이면
// 플레이어가 둘 다 못 배운다.
//   · **계조 2단**으로 내렸다(원래 3단: 성김/무리/벽 → 지금 무리/벽).
//     오히려 이쪽이 맞다 — 「비었다」의 반대는 「좀 있다」가 아니라
//     **「가면 죽는다」**다. 성김 칸을 지우면 빈 곳이 진짜로 비어 보인다.
//   · **보스는 미니맵 안에 안 그린다.** 미니맵 링 바깥의 꼭지로 찍던 것을
//     빼고, **화면 가장자리 화살표**로 옮겼다(bossEdge). 보스는 「어느 쪽에
//     있나」가 아니라 「어느 쪽에서 온다」라, 눈이 이미 가 있는 화면 가장자리가
//     맞는 자리다. 미니맵은 밀도 한 가지만 말하는 물건으로 남는다.
//   · 암흑물질(젬)은 스스로 빛나므로 안 그린다 — 그쪽과 같은 결론.
//
// 색은 적의 색(#E86892 · #FF2D55)이다 — 새 색을 안 들인다.
// 안쪽의 옅은 사각형은 **지금 화면**이다. 「그 안은 이미 보고 있는 것」을
// 가르쳐, 플레이어가 링의 바깥쪽만 읽게 만든다.
// ⚠️ 사거리를 760 → 2200 으로 늘렸다(2026-08-11 렌더 반려). 760 이면 화면
// 반폭(490)이 미니맵 반지름의 **64%** 를 먹어, 미니맵이 「이미 보고 있는 것」을
// 다시 보여주는 물건이 됐다. 미니맵의 값은 **화면 밖**에 있다 — 2200 이면
// 화면 상자가 지름의 4% 로 줄고 나머지가 전부 「모르는 곳」이 된다.
const MMR=54, MMFAR=2200;   // 반지름 54px / 사거리 2200 월드px ≈ 화면 폭의 4.5배
function mmSwarm(t,st){
  if(!st.mm){st.mm=[];
    for(let i=0;i<16;i++)st.mm.push({a:hash(i*3.7)*TAU,d:150+hash(i*8.1)*1950,
      n:3+Math.floor(hash(i*5.3)*44),w:(hash(i*2.9)-.5)*.55,ph:hash(i*6.1)*TAU});}
  return st.mm;
}
function minimap(c,t,W,H,st){
  const mx=W-MMR-16,my=H-MMR-16;
  c.save();
  // 판 — 구석이라 짙게 깔아도 이펙트를 안 가린다. 오히려 짙어야 계조가 산다.
  c.beginPath();c.arc(mx,my,MMR,0,TAU);
  c.fillStyle=A(MAPINK.ink,.72);c.fill();
  // 밀도 — 12방위 × 3링. 셀 셰이딩 3단 계조를 **밀도 눈금으로** 쓴다.
  const SEC=12,RING=[0,.34,.66,1],bin=new Float32Array(SEC*3);
  for(const s of mmSwarm(t,st)){
    const a=s.a+t*s.w*.35,d=s.d+Math.sin(t*.5+s.ph)*180;
    if(d>MMFAR||d<0)continue;
    const si=((Math.floor(a/TAU*SEC)%SEC)+SEC)%SEC;
    const u=d/MMFAR,ri=u<RING[1]?0:(u<RING[2]?1:2);
    // **면적으로 나누지 않는다.** 한때 링 면적으로 정규화했더니 안쪽 링이
    // 8.6배로 뻥튀기돼 미니맵이 통째로 빨갛게 됐다(2026-08-11). 플레이어가
    // 재는 것은 밀도가 아니라 **얼마나 많이, 얼마나 가까이**다 — 머릿수에
    // 근접 가중치만 곱한다(바로 앞 1.55배 ↔ 사거리 끝 0.55배).
    bin[si*3+ri]+=s.n*(1.55-u);
  }
  // **2단 = 무리 / 벽.** 문턱을 높게 잡아 대부분의 칸이 비어 있게 둔다 —
  // 미니맵이 답하는 질문은 「어디가 찼나」가 아니라 **「어디가 비었나」**라,
  // 빈 칸이 다수라야 답이 눈에 튄다.
  const STEP=[[22,"rgba(232,104,146,.30)"],[52,"rgba(255,45,85,.50)"]];
  for(let si=0;si<SEC;si++)for(let ri=0;ri<3;ri++){
    const v=bin[si*3+ri];let lv=-1;
    for(let k=0;k<STEP.length;k++)if(v>=STEP[k][0])lv=k;
    if(lv<0)continue;
    const a0=si/SEC*TAU,a1=(si+1)/SEC*TAU;
    const r0=RING[ri]*MMR,r1=RING[ri+1]*MMR;
    c.beginPath();c.arc(mx,my,r1,a0,a1);c.arc(mx,my,r0,a1,a0,true);c.closePath();
    c.fillStyle=STEP[lv][1];c.fill();
  }
  // 링 눈금 — 거리를 세 단으로만 준다. 그 이상은 안 읽힌다.
  c.strokeStyle=A(MAPINK.wire,.5);c.lineWidth=.8;
  for(let k=1;k<4;k++){c.beginPath();c.arc(mx,my,RING[k]*MMR,0,TAU);c.stroke();}
  // 지금 화면 — 「이 안은 이미 보고 있다」
  const sc=MMR/MMFAR;
  c.strokeStyle=A(MAPINK.starM,.55);c.lineWidth=.9;
  c.strokeRect(mx-W*sc/2,my-H*sc/2,W*sc,H*sc);
  // 나 — 무속성 회백. 이 게임의 「빛」은 색이 없는 것이라야 한다.
  // 각진 별 실루엣도 hero() 와 같은 것을 쓴다(jagPoly, n=7) — 미니맵 안의
  // 나와 화면 한가운데의 나가 **같은 모양**이라야 「저게 나」로 읽힌다.
  fillPoly(c,jagPoly(mx,my,5.2,7,3,1.35),A(TONE.gold[1],.95));
  fillPoly(c,jagPoly(mx,my,2.7,7,3.4,1.3),A(TONE.gold[2],1));
  c.restore();
}

/// 보스 방향 — **미니맵이 아니라 화면 가장자리에** 찍는다(로비/행성 담당 규칙).
/// 보스는 「어느 쪽에 있나」가 아니라 **「어느 쪽에서 온다」**라, 눈이 이미 가 있는
/// 화면 가장자리가 맞는 자리다. 미니맵은 밀도 한 가지만 말하는 물건으로 남는다.
/// 거리는 안 준다 — 방향 하나면 결정이 끝난다(반대로 뛴다).
function bossEdge(c,t,W,H){
  const ba=t*.42+1.1,cs=Math.cos(ba),sn=Math.sin(ba);
  // 화면 사각형과 만나는 점. 가장자리에서 18px 안으로 들여 잘리지 않게 둔다.
  const hw=W/2-18,hh=H/2-18;
  const k=Math.min(hw/(Math.abs(cs)||1e-6),hh/(Math.abs(sn)||1e-6));
  const x=W/2+cs*k,y=H/2+sn*k;
  celSpike(c,x,y,ba,15,7,"mmBoss",.95);
}

// ── 대비 실측 ─────────────────────────────────────────────────────────────
// 「안 헤친다」는 주장은 눈이 아니라 **숫자**로 서야 한다. 배경만 그린 캔버스를
// 한 번 읽어(비싸다) 명도 분포를 재고, 결과를 매 프레임 아래 띠에 적는다.
// 재는 시점(t≈.9)에는 캔버스에 배경밖에 없다 — 글자는 그 뒤에 그린다.
function mapMeter(c,t,W,H,st){
  if(!st.mz&&t>.9){
    const cv=c.canvas,w=cv.width|0,h=cv.height|0;
    let d=null;
    try{d=c.getImageData(0,0,w,h).data;}catch(e){d=null;}
    if(!d||!d.length)st.mz={err:1};
    else{const n=d.length/4;let sum=0,o12=0,o35=0,mxl=0;
      for(let i=0;i<d.length;i+=4){
        const l=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;
        sum+=l;if(l>.12)o12++;if(l>.35)o35++;if(l>mxl)mxl=l;}
      st.mz={avg:sum/n,p12:o12/n*100,p35:o35/n*100,mx:mxl};}
  }
  const z=st.mz;if(!z)return;
  c.save();
  c.fillStyle="rgba(5,6,11,.86)";c.fillRect(0,H-15,W,15);
  c.font="9px ui-monospace,SFMono-Regular,Menlo,monospace";
  c.textAlign="left";c.textBaseline="middle";
  c.fillStyle=z.err?"#FF7A6A":"#9AA3BE";
  c.fillText(z.err?"측정 불가(getImageData)":
    "평균 L "+z.avg.toFixed(3)+"   L>.12 "+z.p12.toFixed(1)+"%"+
    "   L>.35 "+z.p35.toFixed(2)+"%   최대 "+z.mx.toFixed(2),6,H-7.5);
  c.restore();
}

// ── 배치 ──────────────────────────────────────────────────────────────────
// **같은 무기를 세 배경 위에 똑같이 얹는다.** 배경마다 다른 무기를 쓰면
// 「배경 탓인지 무기 탓인지」가 안 갈린다.
//
// 고른 둘: 빛파동(wBolt 밝은 금 — 흔한 경우)과 **파문(mPulse)** 이다.
// 파문을 최악으로 세운 이유 셋:
//   ① **바깥층이 어둡다** — #0E3560 L .181. 배경 상한(.12)에 제일 가깝다.
//   ② **색이 겹친다** — 깊은 청색이라 세 배경(청람·자보라·청록)과 같은 색
//      계열이다. 명도로만 갈려야 하는 상황을 일부러 만든다.
//   ③ **모양이 제일 불리하다** — 크고 얇은 고리다. 굵은 덩어리는 아무 데서나
//      보이지만 얇은 선은 배경 질감에 제일 먼저 먹힌다.
//
// ✗ 처음엔 뇌광(mArc, 팔레트 최저 L .133)을 쓰려다 **버렸다**: FX.arc 는
//   번개를 "volt" 로 **직접** 그려서 무기 고유색 훅(RECOLOR, "gold" 만 치환)이
//   안 먹는다 — 화면에는 노란 번개가 나오고 mArc 는 한 픽셀도 안 그려진다.
//   실측으로 확인했다(2026-08-11). 팔레트 표의 최솟값과 **실제로 그려지는**
//   최솟값은 다르고, 시안이 증명할 수 있는 것은 후자뿐이다.
function mapOver(c,t,dt,W,H,st,key){
  const sv=RECOLOR;RECOLOR=WTONE[key];
  try{FX[key](c,t,dt,W,H,st);}finally{RECOLOR=sv;}
}
const MAP={
  drift      (c,t,dt,W,H,st){mapDrift  (c,t,W,H,st);mapMeter(c,t,W,H,st);},
  reach      (c,t,dt,W,H,st){mapReach  (c,t,W,H,st);mapMeter(c,t,W,H,st);},
  lattice    (c,t,dt,W,H,st){mapLattice(c,t,W,H,st);mapMeter(c,t,W,H,st);},
  voidBolt   (c,t,dt,W,H,st){mapOver(c,t,dt,W,H,st,"bolt");},
  driftBolt  (c,t,dt,W,H,st){mapDrift  (c,t,W,H,st);mapOver(c,t,dt,W,H,st,"bolt");},
  reachBolt  (c,t,dt,W,H,st){mapReach  (c,t,W,H,st);mapOver(c,t,dt,W,H,st,"bolt");},
  latticeBolt(c,t,dt,W,H,st){mapLattice(c,t,W,H,st);mapOver(c,t,dt,W,H,st,"bolt");},
  voidPulse   (c,t,dt,W,H,st){mapOver(c,t,dt,W,H,st,"pulse");},
  driftPulse  (c,t,dt,W,H,st){mapDrift  (c,t,W,H,st);mapOver(c,t,dt,W,H,st,"pulse");},
  reachPulse  (c,t,dt,W,H,st){mapReach  (c,t,W,H,st);mapOver(c,t,dt,W,H,st,"pulse");},
  latticePulse(c,t,dt,W,H,st){mapLattice(c,t,W,H,st);mapOver(c,t,dt,W,H,st,"pulse");},
  miniA      (c,t,dt,W,H,st){mapDrift  (c,t,W,H,st);mapOver(c,t,dt,W,H,st,"bolt");
                             bossEdge(c,t,W,H);minimap(c,t,W,H,st);},
  miniB      (c,t,dt,W,H,st){mapReach  (c,t,W,H,st);mapOver(c,t,dt,W,H,st,"bolt");
                             bossEdge(c,t,W,H);minimap(c,t,W,H,st);},
  miniC      (c,t,dt,W,H,st){mapLattice(c,t,W,H,st);mapOver(c,t,dt,W,H,st,"bolt");
                             bossEdge(c,t,W,H);minimap(c,t,W,H,st);},
  /// 로비용 — **적도 이펙트도 미터도 없는 배경 단독**, 카메라도 1/3 속도.
  /// 로비는 배경을 모른다는 계약(`LOBBYBG` 에 (c,t,dt,W,H,st) 함수 하나)에
  /// 그대로 꽂을 수 있는 모양이다.
  ///
  /// ⚠️ 여기서 `LOBBYBG` 를 **선언하지 않는다.** 로비 작업은 다른 가지에 있고,
  /// 양쪽이 각자 `const LOBBYBG` 를 선언하면 병합한 파일이 통째로
  /// SyntaxError(중복 선언)가 된다. 병합하는 쪽이 한 줄만 넣으면 된다:
  ///     LOBBYBG.space = MAP.lobby;
  /// B안(성계)을 고른 이유: 로비는 **볼 시간이 있는 화면**이라 셋 중 제일
  /// 볼 것이 많은 안이 맞고, 글자 대비는 로비의 `.scrim` 층이 책임진다.
  lobby      (c,t,dt,W,H,st){mapReach(c,t*.35,W,H,st);},
};

// ── 배치 ─────────────────────────────────────────────────────────────────
const PHYS=[["bolt","빛파동","WAVE","하나의 초승달 파도가 앞으로 밀려난다"],
["orbit","공전","ORBIT","리본 덩어리가 궤도를 돈다"],
["smg","빛따발총","SMG","작은 창이 쉼없이. 총구가 매 발 터진다"],
["seeker","유도탄","SEEKER","리본 꼬리 + 창끝이 휘어 들어간다"],
["scatter","빛산탄총","SCATTER","7자루가 부채로 + 총구 물보라"],
["saber","광선검","SABER","굵은 초승달 — 시작이 두껍고 끝이 뾰족하다"],
["lance","레이저","LANCE","짧은 빔이 부채를 훑는다 — 지나간 자리에 잔열이 남는다"],
["shotgun","빛폭탄","BOMB","굵고 느린 덩어리 한 발이 날아가 넓게 터진다"],
["bunroe","분뢰","BUNROE","가장 가까운 적에게 꽂고 — 조용히 빨다가 크게 터뜨린다. 죽을 때까지 반복"],
["sunpo","순포","SUNPO","굽은 빛 조각이 공전하며 사방으로 쏜다 — 달아오를수록 빨라지다 멈춘다"]];
const MAGIC=[["sanctum","성역","SANCTUM","두꺼운 룬 링 2겹 + 도는 창"],
["pulse","파문","PULSE","두꺼운 링이 퍼지며 가장자리에 창이 선다"],
["lightfall","낙광","LIGHTFALL","예고 링 → 기둥 → 착탄 왕관 + 파편"],
["arc","뇌광","ARC","번개가 선이 아니라 각진 덩어리다"],
["pillar","광주","PILLAR","갈라지며 솟는 기둥 + 밑동 링"],
["wisp","정령","WISP","리본 꼬리를 끌고 떠돈다"],
["ignite","점화","IGNITE","구형 폭발 + 위로만 오르는 잔불. 맞은 적도 탄다"]];
// 결계는 **방어**다 — 지금 구현이 「도는 방패의 접촉 피해」뿐이라 공격기처럼
// 보이지만, blocksProjectileAt()·reflects 가 이미 있고 호출자만 없다.
// 「원거리 적이 아직 없어 API 로만 확정한다」던 전제는 이미 해소됐다(점사·포격·추적).
// 축은 **동사**다 — armor.dart 가 방어구 확장 7종을 고를 때 쓴 규율 그대로
// (「같은 동사가 두 벌 있으면 슬롯 선택이 다시 죽는다」). 방어구 10종을 읽고
// **동사가 안 겹치는 다섯**만 스킬로 올렸다.
//
// 안 올린 넷과 근거:
//   · 마법갑옷 — 동사가 사슬과 같다(정액 상쇄). 대상 타입(contact/arcane)만
//     다른데 **타입은 화면에서 안 갈린다**. 사슬(작은 것을 지운다) ↔
//     거암(큰 것만 깎는다)이 이미 정반대 두 끝을 잡고 있고, 마법갑옷은
//     그 사이에 끼어 어느 쪽과도 안 갈린다.
//   · 신기루 — **확률 회피.** PASSIVE 표가 회피율을 버린 이유 그대로,
//     500마리 화면에서 미스는 안 보이고 「왜 안 죽었지」만 남는다. 같은
//     「안 맞는다」를 질풍이 **위치**로 내므로 그 자리는 이미 차 있다.
//   · 여명 · 정화 — 동사가 회복이다. 회복 분류로 옮겼다.
//   · 섬광 — 피격 순간 적을 늦추고 눈멀게 한다. 그건 저주의 어휘(감속·실명)라
//     봉인·암막과 겹친다. 방어구로는 남고 스킬로는 안 올린다.
const GUARD=[["ward","결계","WARD","육각이 빈틈없이 붙은 구 방벽. 맞은 셀에서 번진다"],
["chain","사슬","CHAIN","몸을 두른 마디가 닿는 순간 달아오른다 — 작은 것은 0 이 된다"],
["mirror","경면","MIRROR","정면 원호의 거울판. 등 뒤는 그대로 맞는다"],
["boulder","거암","BOULDER","각진 판 다섯. 잡몹은 그대로 아프고 거구만 받아 낸다"],
["karma","응보","KARMA","맞을수록 고리가 찬다. 가득 차면 한 번에 갚는다"],
["gale","질풍","GALE","**몸이 움직인다.** 주사위가 아니라 위치로 안 맞는다"]];

// ── 저주 5 — 축은 **무엇을 빼앗는가** ────────────────────────────────────
// 다섯 전부 **새 상태를 안 만든다.** PASSIVE/PVNAME 의 여덟만 재사용하고
// 표식도 pvMark 하나가 소유한다 — 속성으로 걸린 상태와 저주로 걸린 상태가
// 화면에서 같은 그림이라야 플레이어가 두 번 배우지 않는다.
// 빼앗을 것이 다섯(방어·시간·이동·공격·조준)뿐이라 다섯이다.
const CURSE=[["curse","저주","CURSE","각인이 박힌 놈만 물보라가 두 배 — 받는 피해 증가 + 약한 도트"],
["plague","역병","PLAGUE","중독 중첩이 쌓이고, 만중첩이 터지면 곁으로 옮는다"],
["shackle","속박","SHACKLE","발밑에서 솟은 사슬이 묶는다 → 동상"],
["seal","봉인","SEAL","머리 위 공격 시계가 기어간다 → 침묵. 이동은 안 건드린다"],
["veil","암막","VEIL","발사각이 흐트러져 **탄이 눈에 보이게 빗나간다**"]];

// ── 회복 4 — 축은 **무엇을 회복으로 바꾸는가** ───────────────────────────
// ⚠️ 잔불 원칙(offers.dart: 「라서 유일의 자동 재생원」·최대 3레벨)을 지키는
// 길은 회복량을 깎는 것이 아니라 **입력을 붙이는 것**이다 — 넷 다 무조건
// 흐르지 않는다. 그래서 잔불은 여전히 유일한 자동 재생원이다.
// 바꿀 수 있는 것이 넷(시간·죽음·오염·자원)뿐이라 넷이다.
const HEAL=[["dawn","여명","DAWN","안 맞은 시간이 회복이 된다. 닿아 있으면 절대 안 흐른다"],
["reap","수확","REAP","처치가 회복이 된다. 안 싸우면 0 — 여명의 정확한 반대"],
["purity","정화","PURITY","**피를 안 채우는 회복.** 되돌리는 것은 몸의 상태다"],
["tithe","공물","TITHE","암흑물질을 태운다 — 지금의 피와 다음 레벨을 맞바꾼다"]];
// 개안은 **궁극기**다 — 화면 전역 즉발이라 주기로 도는 것이 아니라 게이지로 터진다.
//
// 충전원 확정(2026-08-11): **발현 게이지 그대로.** 게이지가 100 이 되는 한
// 사건이 궁극기(전역 즉발)와 발현창(15초 몸 상태)을 **동시에** 낳는다 —
// 자원을 둘로 나누지 않고 한 번 쓰는 것에 두 얼굴을 준다. 근거와 반려한 두
// 갈래(별도 게이지 · 수동 사용)는 `FX.flare` 머리 주석에 있다.
//
// **종수는 하나.** 한 판에 두세 번 뜨는 것이라 종이 여럿이면 대부분 못 본다.
// 아래 셋은 다른 궁극기가 아니라 **개안의 논거를 하나씩 떼어 그린 칸**이다:
// 충전원 · 축(거리 무시) · 층(몸에 붙는다).
// ⚠️ 설명에 `**굵게**` 를 쓰지 않는다 — [tile] 은 마크다운을 안 돌려 별표가
// 그대로 찍힌다(발현 칸만 따로 치환한다). 그리고 캡션은 **두 줄에서 잘리므로**
// 한 줄로 끝나는 문장만 쓴다: 잘린 설명은 없는 설명이다.
const ULT=[
["flare","개안","FLARE","게이지가 100 이면 스스로 터진다 — 전역 즉발 + 실명"],
["ultGauge","발현 게이지 — 충전원","GAUGE","처치로 찬다. 충전 8.2s · 창 15s · 잠금 60s, 실제 비율 그대로"],
["ultGlobal","전역 즉발 — 축","GLOBAL","스킬은 반경이 있고 궁극기는 없다. 모서리의 적도 같이 맞는다"],
["ultWindow","발현창 — 층","WINDOW","터진 뒤 15초. 몸에 둘레가 서고 무기는 안 변한다"]];
const ELEMS=[
["base","무속성 — 발현 전","BASE","각진 별만. 둘레가 비어 있는 것이 정체다 — 빛은 색이 없다"],
["goldMani","무속성 — 발현","BASE","잘게 부서져 있다 — 알갱이가 구 껍질을 이루고 반짝임이 물결로 훑는다"],
["preFire","염 炎 · 발현 전","EMBER","코어만 물든다 — 얻었지만 아직 드러나지 않았다"],
["fire","염 炎 · 발현","EMBER","갈라진 불꽃 여덟이 태양 문양을 이룬다"],
["preIce","빙 氷 · 발현 전","FROST","코어만 물든다"],
["ice","빙 氷 · 발현","FROST","수지상 결정 — 갈래마다 곁가지"],
["preBolt","뇌 雷 · 발현 전","VOLT","코어만 물든다"],
["bolt","뇌 雷 · 발현","VOLT","껍질 + 안에서 밀고 나오려는 가닥"],
["prePoison","독 毒 · 발현 전","TOXIN","코어만 물든다"],
["poison","독 毒 · 발현","TOXIN","날 셋이 도는 삼엽 표식"],
["preGale","바람 風 · 발현 전","GALE","코어만 물든다"],
["gale","바람 風 · 발현","GALE","기운 고리가 떠나고 그 위에 획이 실린다"],
["preShade","어둠 影 · 발현 전","SHADE","코어만 물든다 — 어둠은 여기서도 어둡다"],
["shade","어둠 影 · 발현","SHADE","먹는 둘레 + 안에서 자기를 복제하는 코어"],
["whiteBase","백광 白光 — 발현 전","WHITE","다섯을 다 거친 최종. 그물 위에 다섯 종의 알갱이가 맺힌다"],
["whiteMani","백광 白光 — 발현","WHITE","아직 안 골랐습니다"],
];
// 변신은 속성이 아니라 **전환의 연출**이다 — 자기 섹션으로 뺀다(2026-08-10).
const MORPHS=[["morph","변신 — 속성을 얻는 순간","MORPH",
  "빛이 조여들다 터지고 색을 입는다. 안착은 속성 도형을 그대로 부른다"],
["morphWhiteMani","변신 — 백광이 발현하는 순간","WHITE",
  "감고 있던 철사 **사이로** 빛이 새고, 금이 가고, 느슨해지다 부서진다. 앞의 변신이 바깥→안이라면 이건 **안→바깥**"],
["morphWhiteFrom","변신 — 무엇에서든 백광으로","WHITE",
  "사방의 빛이 **한꺼번에** 달려들어 흰 구를 채우고, 틈으로 새어 나오다 터진다. 시작 상태를 주기마다 갈아 보여 준다"]];

// ⚠️ 레이아웃을 **인라인 스타일로 박는다.**
// 아티팩트 호스트에서 <style> 이 적용되지 않아 전부 세로로 떨어졌다(세 번 반려).
// 인라인은 스타일시트 적용 여부와 무관하게 항상 먹으므로, 격자를 여기서 확정한다.
function box(el,css){for(const k in css)el.style[k]=css[k];return el;}
const TILE_W=150;
function asRow(host){box(host,{display:"flex",flexWrap:"wrap",gap:"9px",
  alignItems:"flex-start",width:"100%"});}
function asCell(el,w){box(el,{width:(w||TILE_W)+"px",flex:"0 0 "+(w||TILE_W)+"px",
  background:"#13131A",border:"1px solid #26262F",borderRadius:"4px",
  overflow:"hidden",boxSizing:"border-box"});}

const anims=[];
/// ⚠️ **화면 밖 칸은 백킹스토어까지 놓는다.**
///
/// 예전에는 화면 밖 캔버스의 **그리기만** 건너뛰고 버퍼는 계속 잡고 있었다.
/// 칸이 260개를 넘자 캔버스 메모리가 190MB 를 물고 탭이 뻗었다
/// (2026-08-09 "목업 꺼졋다"). 캔버스는 width 를 쓰는 순간 버퍼를 새로 잡으므로,
/// **들어올 때 잡고 나갈 때 1px 로 놓으면** 보이는 몇 십 칸만 메모리를 쓴다.
/// 파티클 상태(st)는 그대로 두어 다시 들어와도 이어진다.
///
/// dpr 도 2 → 1.5 로 내린다. 186px 칸에서 2배는 눈에 안 보이고 메모리만 2배다.
function mkAlloc(a){
  if(a.c)return;
  const cv=a.cv,dpr=a.dpr;
  cv.width=a.W*dpr;cv.height=a.H*dpr;
  const c=cv.getContext("2d");c.setTransform(dpr,0,0,dpr,0,0);c.lineJoin="round";
  a.c=c;}
function mkFree(a){
  if(!a.c)return;
  a.c=null;a.cv.width=1;a.cv.height=1;}   // 1px 로 줄이면 버퍼가 풀린다
function mk(cv,size,fn){
  const dpr=Math.min(1.5,window.devicePixelRatio||1);
  const a={cv,c:null,fn,W:size[0],H:size[1],dpr,st:{p:[]},vis:false,
    label:(fn&&fn.name)||"anon"};
  anims.push(a);
  if(window.IntersectionObserver){VIS.observe(cv);cv.__a=a;}
  else{a.vis=true;mkAlloc(a);}}
const VIS=window.IntersectionObserver?new IntersectionObserver(es=>{
  for(const e of es){const a=e.target.__a;if(!a)continue;
    a.vis=e.isIntersecting;
    if(a.vis)mkAlloc(a);else mkFree(a);}},
  {rootMargin:"300px"}):null;
function tile(host,reg,key,nm,en,ds,S,W,H){
  asRow(host);
  const d=document.createElement("div");d.className="tile";asCell(d,W);
  if(H)box(d,{flex:"1 1 100%",width:"100%"});      // 보스 — 한 줄에 하나
  const cv=document.createElement("canvas");
  box(cv,{width:"100%",height:"auto",display:"block",
    aspectRatio:H?(S+"/"+H):"1",background:"#0C0C12"});
  d.appendChild(cv);
  const cap=document.createElement("div");cap.className="cap";
  box(cap,{padding:"6px 8px 7px",borderTop:"1px solid #26262F"});
  cap.innerHTML=`<div class="nm" style="font-size:12px;font-weight:600;color:#EDEDF2;`+
    `white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${nm}</div>`+
    `<div class="ds" style="font-size:9.5px;color:#9494A2;line-height:1.35;margin-top:2px;`+
    `display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${ds}</div>`;
  d.appendChild(cap);host.appendChild(d);
  // **무기 고유색.** reg 가 FX 일 때만 입힌다(속성 몸·융화는 자기 색이 있다).
  const fn=reg[key],tk=(reg===FX)?WTONE[key]:null;
  mk(cv,[S,H||S],tk?(c,t,dt,W,H,st)=>{const sv=RECOLOR;RECOLOR=tk;
      try{fn(c,t,dt,W,H,st);}finally{RECOLOR=sv;}}:fn);}
const vocHost=$("voc");asRow(vocHost);
VOCL.forEach(([k,nm,ds])=>{const d=document.createElement("div");d.className="v";asCell(d);
  const cv=document.createElement("canvas");
  box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
  d.appendChild(cv);
  d.insertAdjacentHTML("beforeend",
    `<div style="padding:6px 8px 7px;border-top:1px solid #26262F;font-size:9.5px;`+
    `color:#9494A2;line-height:1.35"><b style="display:block;font-size:12px;color:#EDEDF2;`+
    `margin-bottom:1px">${nm}</b>${ds}</div>`);
  vocHost.appendChild(d);mk(cv,[154,154],VOC[k]);});
const S=238;
// 속성 시안 — 줄이 속성, 칸이 안. 나란히 놓아야 비교가 된다.
// 잡몹은 격자, **보스는 큰 썸네일**로 따로 — 작은 칸에서는 패턴이 안 읽힌다.
FOEDEF.filter(d=>!d[0].startsWith("boss")).forEach(([k,nm,rad,eyes,ds])=>
  tile($("foes"),FOE,k,`${nm} · r${rad} · 눈 ${eyes}`,"",ds,S));
// 보스는 **한 줄에 하나, 넓은 무대.** 정사각 칸에서는 달려가는 거리와
// 표적 지점이 화면 밖으로 나가 패턴이 안 읽힌다(2026-08-09 판정).
FOEDEF.filter(d=>d[0].startsWith("boss")).forEach(([k,nm,rad,eyes,ds])=>
  tile($("bosses"),FOE,k,nm,"",ds,980,0,640));
PHYS.forEach(w=>tile($("phys"),FX,w[0],w[1],w[2],w[3],S));
// 기본 공격이 쓰는 속성 목록 — **평소 칸과 발현 칸이 같은 목록을 본다.**
// 둘이 갈라지면 「이 속성은 발현 그림이 없네」가 조용히 생긴다.
const BASICELEMS=[["gold","무속성"],["ember","염 炎"],["frost","빙 氷"],["volt","뇌 雷"],
  ["toxin","독 毒"],["gale","풍 風"],["shade","어둠 影"],
  ["aqua","수 水 · 염+빙"],["blast","플라즈마 漿 · 염+뇌"],["smoke","연 煙 · 염+독"],
  ["fstorm","불씨 火種 · 염+바람"],["magnet","자 磁 · 빙+뇌"],["plague","역 疫 · 빙+독"],
  ["snow","설 雪 · 빙+바람"],["numb","마 痲 · 뇌+독"],["thunder","뢰명 雷鳴 · 뇌+바람"],
  ["murk","장 瘴 · 독+바람"],["white","백광 白光"]];
// 기본 공격 — 스킬이 아니라 **캐릭터의 것**이라 무기 격자에 안 섞는다.
// 왼쪽 다섯 칸은 **캐릭터 레벨**(1·15·30·45·60)이고 오른쪽 여섯 칸은
// 캐릭터가 얻은 **속성**이다. 둘 다 고르는 것이 아니라 따라오는 것이다.
if($("basic")){const BH=$("basic");asRow(BH);
  [1,2,3,4,5].forEach(L=>{const d=document.createElement("div");
    d.className="tile";asCell(d,150);
    const cv=document.createElement("canvas");
    box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
    d.appendChild(cv);
    d.insertAdjacentHTML("beforeend",
      `<div class="cap" style="padding:6px 8px 7px;border-top:1px solid #26262F">`+
      `<div style="font-size:12px;font-weight:600;color:#EDEDF2">캐릭터 ${[1,15,30,45,60][L-1]}레벨</div>`+
      `<div style="font-size:9.5px;color:#9494A2;margin-top:2px">주기 ${
        Math.max(.34,.85-.008*([1,15,30,45,60][L-1]-1)).toFixed(2)}s</div></div>`);
    BH.appendChild(d);
    mk(cv,[238,238],(c,t,dt,W,H,st)=>{const sl=LV;LV=L;
      try{FX.basic(c,t,dt,W,H,st);}finally{LV=sl;}});});}
// 발현 칸 — 평소 칸과 **같은 목록·같은 크기**로 깔아야 차이가 보인다.
if($("basicmani")){const BM=$("basicmani");asRow(BM);
  BASICELEMS.forEach(([k,nm])=>{
    const d=document.createElement("div");d.className="tile";
    box(d,{flex:"0 0 calc(25% - 7px)",width:"calc(25% - 7px)",minWidth:"210px"});
    const cv=document.createElement("canvas");
    box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
    d.appendChild(cv);
    d.insertAdjacentHTML("beforeend",
      `<div class="cap" style="padding:8px 10px 9px;border-top:1px solid #26262F">`+
      `<div style="font-size:13.5px;font-weight:600;color:#EDEDF2">${nm}</div>`+
      `<div style="font-size:11px;color:#FFB43C;margin-top:3px;line-height:1.45">${
        (MANIDESC[k]||"— 미정").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")}</div></div>`);
    BM.appendChild(d);
    mk(cv,[420,420],(c,t,dt,W,H,st)=>{const sr=RECOLOR,sl=LV;RECOLOR=k;LV=3;
      try{FX.basicMani(c,t,dt,W,H,st);}finally{RECOLOR=sr;LV=sl;}});});}
// ── 발현 전용기 ──────────────────────────────────────────────────────────
// 세 칸이 전부다. **속성 목록을 안 돈다** — 그것이 「셋뿐」이라는 판단을
// 코드에서도 한 번 더 말한다(18칸을 도는 위의 블록과 나란히 놓고 보면
// 규모 차이가 그대로 보인다).
const MANICK=["recall","wall","halt"];
const MANICFN={recall:FX.manicRecall,wall:FX.manicWall,halt:FX.manicHalt};
/// 전용기 칸 하나. [k] 는 전용기, [el] 은 입힐 속성(null 이면 무속성).
/// 크기만 다르고 그리는 것은 같다 — 3택 카드와 큰 칸이 **같은 그림**이라야
/// 「카드에서 본 그것이 판에서 나온다」가 이어진다.
///
/// [wcss] 는 칸 너비를 **CSS 값 그대로** 받는다. 속성 표는 「줄이 전용기, 칸이
/// 속성」이라 **한 줄에 정확히 넷**이 떨어져야 하는데, 고정 px 로 두면 창 너비에
/// 따라 여섯씩 감겨 줄이 전용기를 안 나타낸다(2026-08-11 렌더 판정). 25% 로
/// 두면 어느 폭에서도 넷이다 — 발현 18칸 표가 쓰는 그 규칙 그대로.
function manicTile(host,k,el,wcss,px,cap){
  const d=document.createElement("div");d.className="tile";
  box(d,{flex:"0 0 "+wcss,width:wcss,minWidth:"200px",background:"#13131A",
    border:"1px solid #26262F",borderRadius:"4px",overflow:"hidden",boxSizing:"border-box"});
  const cv=document.createElement("canvas");
  box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
  d.appendChild(cv);
  if(cap)d.insertAdjacentHTML("beforeend",cap);
  host.appendChild(d);
  mk(cv,[px,px],(c,t,dt,W,H,st)=>{const sr=RECOLOR,sl=LV;RECOLOR=el;LV=3;
    try{MANICFN[k](c,t,dt,W,H,st);}finally{RECOLOR=sr;LV=sl;}});}
if($("manic")){const MH=$("manic");asRow(MH);
  MANICK.forEach(k=>{const m=MANICDESC[k];
    manicTile(MH,k,null,"320px",480,
      `<div class="cap" style="padding:9px 11px 10px;border-top:1px solid #26262F">`+
      `<div style="font-size:14.5px;font-weight:600;color:#EDEDF2">${m[0]}`+
      `<span style="font-size:10.5px;color:#5A5A68;font-weight:500;margin-left:7px">축 · ${m[1]}</span></div>`+
      `<div style="font-size:11px;color:#FFB43C;margin-top:3px;line-height:1.45">${
        m[2].replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")}</div></div>`);});}
// 속성이 얹히는 것을 확인하는 줄 — **18칸을 다 그리지 않는 이유가 이 줄이다.**
// 18칸은 네 층(무속성 · 기본 6 · 융화 10 · 백광)으로 나뉘는데, 층마다 하나씩만
// 봐도 갈리는 것이 **색과 상태**뿐이라는 것이 확인된다. 다 그리면 확인이 아니라
// 나열이고, 나열은 유지비만 는다.
const MANICEL=[[null,"무속성"],["ember","염 炎"],["magnet","자 磁"],["white","백광 白光"]];
if($("manictint")){const MT=$("manictint");
  box(MT,{display:"flex",flexDirection:"column",gap:"9px",width:"100%"});
  // ⚠️ **줄을 명시로 나눈다.** 열둘을 한 통에 넣고 감기게 두었더니 창 너비에
  // 따라 여섯씩 감겨 「줄이 전용기」가 거짓이 됐다(2026-08-11 렌더 판정).
  // 25% 폭으로 넷을 맞추는 방법도 있는데, 그러면 칸이 360px 이 되어 **칠할
  // 면적이 세 배**다 — 이 페이지가 「면적을 아낀다」고 적어 놓고 스스로 어기는
  // 꼴이라, 칸은 작게 두고 줄만 나눈다.
  MANICK.forEach(k=>{const row=document.createElement("div");asRow(row);MT.appendChild(row);
   MANICEL.forEach(([el,nm])=>{
    manicTile(row,k,el,"210px",420,
      `<div class="cap" style="padding:7px 9px 8px;border-top:1px solid #26262F">`+
      `<div style="font-size:12px;font-weight:600;color:#EDEDF2">${MANICDESC[k][0].split(" ")[0]} · ${nm}</div>`+
      `<div style="font-size:9.5px;color:#9494A2;margin-top:2px">${
        PVNAME[PASSIVE[el||"gold"]]||"— 패시브 없음"}</div></div>`);});});}
// 발현 각인 3택 — **판당 한 번, 첫 발현의 순간.** 카드의 그림이 위 칸과 같은
// 함수라, 「카드에서 고른 그것」과 「판에서 나오는 그것」이 어긋날 수가 없다.
if($("manicpick")){const MP=$("manicpick");
  box(MP,{display:"flex",flexWrap:"wrap",gap:"14px",width:"100%",
    maxWidth:"760px",justifyContent:"center"});
  MANICK.forEach((k,i)=>{const m=MANICDESC[k];
    const d=document.createElement("div");d.className="card"+(i===1?" pick":"");
    box(d,{flex:"0 0 224px",width:"224px",background:"linear-gradient(180deg,#1A1A24,#101018)",
      border:"1px solid "+(i===1?"#FF8A3D":"#26262F"),borderRadius:"4px",
      padding:"17px 14px 15px",display:"flex",flexDirection:"column",
      alignItems:"center",gap:"10px",textAlign:"center",boxSizing:"border-box"});
    const cv=document.createElement("canvas");
    box(cv,{width:"150px",height:"150px",borderRadius:"50%",
      background:"#0C0C12",border:"1px solid #262630"});
    d.appendChild(cv);
    d.insertAdjacentHTML("beforeend",
      `<div style="font-size:15.5px;font-weight:600;color:#EDEDF2">${m[0]}</div>`+
      `<div style="font-size:10.5px;letter-spacing:.2em;color:#FF8A3D">발현 전용 · 축 ${m[1]}</div>`+
      `<div style="font-size:11.5px;color:#9494A2;line-height:1.5;min-height:4.5em">${
        m[2].replace(/\*\*(.+?)\*\*/g,"<b style='color:#EDEDF2'>$1</b>")}</div>`+
      `<div style="font-size:10px;letter-spacing:.1em;color:#5A5A68;`+
      `border-top:1px solid #26262F;padding-top:8px;width:100%">슬롯을 안 먹는다 · 판당 한 번만 고른다</div>`);
    MP.appendChild(d);
    mk(cv,[300,300],(c,t,dt,W,H,st)=>{const sr=RECOLOR,sl=LV;RECOLOR=null;LV=3;
      try{MANICFN[k](c,t,dt,W,H,st);}finally{RECOLOR=sr;LV=sl;}});});}
if($("basicelem")){const BE=$("basicelem");asRow(BE);
  // 기본 공격은 **캐릭터가 될 수 있는 상태 전부**를 따라간다 — 여섯 속성만
  // 두면 어둠·백광·융화로 간 판에서 이 총알이 무슨 색인지 시안에 답이 없다.
  // 순서는 캐릭터 페이지와 같게: 무속성 → 여섯 속성 → 융화 열 → 백광.
  BASICELEMS.forEach(([k,nm])=>{
    // **한 줄에 넷.** 여기에 곧 속성별 패시브(점화·감속·연쇄 같은 것)를
    // 얹을 자리라, 150px 칸에서는 총알과 패시브가 겹쳐 아무것도 안 읽힌다.
    // 칸을 네 배 가까이 키우고 캔버스 해상도도 같이 올린다(작은 칸에 큰
    // 캔버스는 낭비고, 큰 칸에 작은 캔버스는 뭉갠다).
    const d=document.createElement("div");d.className="tile";
    box(d,{flex:"0 0 calc(25% - 7px)",width:"calc(25% - 7px)",minWidth:"210px"});
    const cv=document.createElement("canvas");
    box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
    d.appendChild(cv);
    d.insertAdjacentHTML("beforeend",
      `<div class="cap" style="padding:8px 10px 9px;border-top:1px solid #26262F">`+
      `<div style="font-size:13.5px;font-weight:600;color:#EDEDF2">${nm}</div>`+
      `<div style="font-size:11px;color:#FFB43C;margin-top:3px;font-weight:600">${
        PVNAME[PASSIVE[k]]||"— 패시브 없음"}</div></div>`);
    BE.appendChild(d);
    mk(cv,[420,420],(c,t,dt,W,H,st)=>{const sr=RECOLOR,sl=LV;RECOLOR=k;LV=3;
      try{FX.basic(c,t,dt,W,H,st);}finally{RECOLOR=sr;LV=sl;}});});}

MAGIC.forEach(w=>tile($("magic"),FX,w[0],w[1],w[2],w[3],S));
GUARD.forEach(w=>tile($("guard"),FX,w[0],w[1],w[2],w[3],S));
CURSE.forEach(w=>tile($("curse"),FX,w[0],w[1],w[2],w[3],S));
HEAL .forEach(w=>tile($("heal"), FX,w[0],w[1],w[2],w[3],S));
ULT.forEach(w=>tile($("ult"),FX,w[0],w[1],w[2],w[3],S));
ELEMS.forEach(w=>tile($("elem"),ELEM,w[0],w[1],w[2],w[3],S));
MORPHS.forEach(w=>tile($("morph"),ELEM,w[0],w[1],w[2],w[3],S));
const TINT=[["gold","무속성","BASE"],["ember","염 炎","EMBER"],["frost","빙 氷","FROST"],
["volt","뇌 雷","VOLT"],["toxin","독 毒","TOXIN"],["gale","바람 風","GALE"]];
const tintHost=$("tint");asRow(tintHost);
TINT.forEach(([k,nm,en])=>{
  const d=document.createElement("div");d.className="tile";asCell(d);
  const cv=document.createElement("canvas");
  box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
  d.appendChild(cv);
  d.insertAdjacentHTML("beforeend",
    `<div style="padding:6px 8px 7px;border-top:1px solid #26262F">`+
    `<div style="font-size:12px;font-weight:600;color:#EDEDF2">광선검 · ${nm}</div>`+
    `<div style="font-size:9.5px;color:#9494A2;margin-top:2px">${k==="gold"?"무기 고유색":"부여 시"}</div></div>`);
  tintHost.appendChild(d);
  mk(cv,[S,S],(c,t,dt,W,H,st)=>{const sv=RECOLOR;RECOLOR=(k==="gold"?null:k);
    try{FX.saber(c,t,dt,W,H,st);}finally{RECOLOR=sv;}});});

const hc=$("hero");
box(hc,{width:"100%",height:"auto",display:"block",aspectRatio:"16/7",background:"#0C0C12"});
box(hc.parentElement,{width:"100%",flex:"1 1 100%",background:"#13131A",
  border:"1px solid #26262F",borderRadius:"4px",overflow:"hidden",boxSizing:"border-box"});
mk(hc,[980,430],combat);

// 융화 시안 — **확정 쌍이 먼저, 미정 자리의 후보가 아래.**
// 고른 것과 안 고른 것을 섞어 두면 무엇을 더 봐야 하는지가 안 보인다.
const fvHost=$("fuse");
box(fvHost,{display:"flex",flexDirection:"column",gap:"16px",width:"100%"});
const fvCell=(host,el,vi,tag,col)=>{
  const d=document.createElement("div");d.className="tile";asCell(d,186);
  const cv=document.createElement("canvas");
  box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
  d.appendChild(cv);
  const ok=vi!=null&&FVSET[el]&&FVSET[el][vi];
  d.insertAdjacentHTML("beforeend",
    `<div style="padding:6px 8px 7px;border-top:1px solid #26262F">`+
    `<div style="font-size:11.5px;font-weight:600;color:#EDEDF2;white-space:nowrap;`+
    `overflow:hidden;text-overflow:ellipsis">${FVNAME[el]}</div>`+
    `<div style="font-size:10px;font-weight:700;color:${col};margin-top:2px">`+
    `${tag}${ok?" · "+(vi+1)+"안":" · 미정"}</div>`+
    `<div style="font-size:9.5px;color:#9494A2;line-height:1.35;margin-top:2px;`+
    `display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">`+
    `${ok?FVSET[el][vi][0]:"아직 안 골랐습니다"}</div>`+
    // 시너지 — **이 융화가 무엇을 세게 만드는가.** 그림 옆에 붙어야 「모으면
    // 세진다」가 고를 때 보인다. 표에 없는 칸(무속성·백광)은 아예 안 그린다.
    (FVSYN[el]?`<div style="font-size:10px;color:#FFB43C;margin-top:4px;`+
      `padding-top:4px;border-top:1px solid #1E1E26;line-height:1.4">`+
      `<b>${FVSYN[el][0]} 계열</b> ${FVSYN[el][1]}` +
      `<div style="color:#5A5A68;font-size:9px;margin-top:1px">${FVSYN[el][2]}</div>`+
      `</div>`:"")+
    `</div>`);
  host.appendChild(d);
  if(ok)mk(cv,[186,186],(c,t,dt,W,H,st)=>fvBody(c,t,dt,W,H,st,el,vi));
  else box(d,{opacity:".38"});};
{ // ── 확정 ────────────────────────────────────────────────────────────
  const sec=document.createElement("div");
  sec.insertAdjacentHTML("beforeend",
    `<div style="font-size:13px;font-weight:600;color:#7CFFB0;margin-bottom:7px">`+
    `✅ 확정 — 융화마다 <b>기본</b>과 <b>발현</b> 두 벌</div>`);
  const row=document.createElement("div");asRow(row);
  Object.keys(FVNAME).forEach(el=>{
    const f=FVFIX[el]||{};
    if(f.base==null&&f.mani==null)return;
    fvCell(row,el,f.base==null?null:f.base-1,"융화 기본","#7CFFB0");
    fvCell(row,el,f.mani==null?null:f.mani-1,"융화 발현","#FFA83C");});
  sec.appendChild(row);fvHost.appendChild(sec);}
{ // ── 고르는 중 — **별도 섹션(#wip)** 으로 뺀다(2026-08-10) ────────────
  // ⚠️ 한때 「미정인 것만」 보이게 걸렀다가 **확정된 속성의 나머지 후보가 아예
  // 안 보여** 반려됐고("보여야 뭐 결정을 하지"), 그래서 전부 띄웠더니 이번엔
  // **칸이 너무 많아 느려졌다.** 답은 그 사이다: 위 확정 구역이 이미 고른
  // 것을 보여주므로, 여기는 **아직 고르는 중인 것(FVKEEPALL)만** 띄운다.
  // 다 고른 속성을 다시 보고 싶으면 FVKEEPALL 에 키를 도로 넣으면 된다.
  // 고르는 중인 것이 하나도 없으면 **섹션째 안 그린다** — 빈 제목만 남으면
  // 「뭔가 깨졌나」로 읽힌다.
  const wipKeys=Object.keys(FVNAME).filter(el=>FVKEEPALL.has(el));
  const sec=document.createElement("div");
  sec.insertAdjacentHTML("beforeend",
    `<div style="font-size:13px;font-weight:600;color:#FFA83C;margin-bottom:7px">`+
    `고르는 중 — <span style="color:#7CFFB0">기본</span> / `+
    `<span style="color:#FFA83C">발현</span> 이 붙은 것이 확정</div>`);
  const row=document.createElement("div");asRow(row);
  wipKeys.forEach(el=>{
    const f=FVFIX[el]||{};
    (FVSET[el]||[]).forEach((v,vi)=>{
      const isB=vi===f.base-1, isM=vi===f.mani-1;
      const d=document.createElement("div");d.className="tile";asCell(d,186);
      if(isB||isM)box(d,{borderColor:isB?"#7CFFB0":"#FFA83C"});
      const cv=document.createElement("canvas");
      box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
      d.appendChild(cv);
      d.insertAdjacentHTML("beforeend",
        `<div style="padding:6px 8px 7px;border-top:1px solid #26262F">`+
        `<div style="font-size:11.5px;font-weight:600;color:#EDEDF2;white-space:nowrap;`+
        `overflow:hidden;text-overflow:ellipsis">${FVNAME[el].split(" ·")[0]}`+
        `<span style="color:${isB?"#7CFFB0":isM?"#FFA83C":"#9494A2"};margin-left:5px">`+
        `${vi+1}안${isB?" ✅기본":isM?" ✅발현":""}</span></div>`+
        `<div style="font-size:9.5px;color:#9494A2;line-height:1.35;margin-top:2px;`+
        `display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;`+
        `overflow:hidden">${v[0]}</div></div>`);
      row.appendChild(d);
      mk(cv,[186,186],(c,t,dt,W,H,st)=>fvBody(c,t,dt,W,H,st,el,vi));});});
  sec.appendChild(row);
  const wipHost=$("wip");
  if(!wipKeys.length){const h=wipHost.previousElementSibling;
    for(let e=h;e;e=e.previousElementSibling){e.style.display="none";
      if(e.tagName==="H2")break;}
    wipHost.style.display="none";}
  else{box(wipHost,{display:"flex",flexDirection:"column",gap:"12px",width:"100%"});
    wipHost.appendChild(sec);}}
const CARDS=[["saber","광선검","LEVEL 3","전방 반원 전체를 벤다 — 폭과 히트박스가 함께 커진다","무기 3 / 5",true],
["arc","뇌광","획득","전류가 날아가 튕긴다. 최대 5회 연쇄","무기 4 / 5",false],
["ice","빙 氷","속성","맞은 적 감속 → 3초 뒤 얼음 폭발","속성 1 / 5",false]];
const cw=$("cards");
box(cw,{display:"flex",flexWrap:"wrap",gap:"14px",justifyContent:"center",width:"100%"});
box(cw.parentElement,{background:"#0C0C12",border:"1px solid #26262F",borderRadius:"4px",
  padding:"32px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:"22px"});
CARDS.forEach(([k,nm,lv,ds,slot,pick])=>{
  const d=document.createElement("div");d.className="card";
  box(d,{width:"206px",flex:"0 0 206px",background:"linear-gradient(180deg,#1A1A24,#101018)",
    border:"1px solid "+(pick?"#FF8A3D":"#26262F"),borderRadius:"4px",padding:"16px 13px 14px",
    display:"flex",flexDirection:"column",alignItems:"center",gap:"9px",textAlign:"center",
    position:"relative",boxSizing:"border-box",
    boxShadow:pick?"0 0 40px -12px rgba(255,138,61,.8)":"none"});
  d.innerHTML=`<div style="position:absolute;top:8px;right:9px;font-size:9px;`+
    `letter-spacing:.16em;color:#5A5A68">${slot}</div>`;
  const cv=document.createElement("canvas");
  box(cv,{width:"104px",height:"104px",borderRadius:"50%",background:"#0C0C12",
    border:"1px solid #262630",display:"block"});
  d.appendChild(cv);
  d.insertAdjacentHTML("beforeend",
    `<div style="font-size:15px;font-weight:600;color:#EDEDF2">${nm}</div>`+
    `<div style="font-size:10.5px;letter-spacing:.18em;color:#FF8A3D">${lv}</div>`+
    `<div style="font-size:11.5px;color:#9494A2;line-height:1.5;min-height:3em">${ds}</div>`+
    `<div style="font-size:10px;color:#5A5A68;border-top:1px solid #26262F;`+
    `padding-top:8px;width:100%">${pick?"▸ 선택됨":"탭하여 선택"}</div>`);
  cw.appendChild(d);mk(cv,[104,104],FX[k]||ELEM[k]);});

// ⚠️ **개안(궁극기) 줄을 갈았다**(2026-08-11). 예전 넷 중 둘이 화면에 없는
// 숫자였다 — 「쿨다운 −25%」와 「피해 +80%」는 다섯 칸을 나란히 놓아도 아무
// 차이가 안 보인다. 이 표는 **성장표의 캡션이자 계약**이라(칸마다 전역 LV 만
// 바꿔 같은 함수를 부른다) 안 보이는 것을 적으면 표가 거짓말을 한다:
// 「보이는 것만 레벨에 둔다」. 그리고 실명은 L3 특전에서 **L1 기본**으로
// 내렸다 — 눈을 뜨면 남이 눈을 잃는 것이 궁극기의 정체지 레벨 보상이 아니다.
const LVT={"bolt": ["더 빨리 나가고 부채각이 살짝 넓어진다 (최대 3)", "파동 2개 — 뒤따라 한 번 더. 각자 따로 문다 (최대 3)", "파동 3개 (최대 4)", "각성 — 마루에 갈퀴가 서고 범위가 넓어진다 (최대 5)"], "orbit": ["궤도선이 난다 — 선에 닿은 적에게 틱 피해 (바깥 2)", "이중 궤도 — 안쪽에 역방향 (안 2 · 바깥 2)", "안쪽 3 · 바깥 2", "각성 — 갈퀴가 서고 안 3 · 바깥 4"], "smg": ["2가닥 1자", "2가닥 + 약한 유도탄 1", "3가닥 V자(가운데만 1자) + 유도탄 2", "각성 — 4가닥 V자, 가운데 둘은 과열되어 붉다"], "seeker": ["유도탄 2발", "유도탄 3발 — 탄속·피해 증가, 탄도 두꺼워진다", "분열 — 명중하면 다른 적을 무는 자탄 1발이 갈라져 나온다", "각성 — 유도탄 4발, 자탄 2발로 쪼개진다"], "scatter": ["산탄 5발 → 7발", "근거리 집탄 — 가까울수록 피해 집중", "산탄 9발 + 부채 65°", "더블 탭 — 0.1s 간격 2연발"], "saber": ["길이 +40%", "검이 두꺼워짐 — 전방 반원 전체", "2연속 베기 — 좌→우, 우→좌", "참격 잔상 — 벤 자리에 남아 추가 피해"], "lance": ["사거리 +50% — 칸을 넘어간다", "잔열 — 훑고 지나간 자리가 남아 계속 탄다", "훑는 폭 2배(69°) + 빔이 굵어진다", "각성 — 뒤로도 하나(양방향), 굵기 최대"], "sunpo": ["판 2기 — 막는 각도도 같이 는다", "판 3기 — **2갈래** 발사", "판 4기 — **3갈래**, 과부하 구간도 길다", "각성 — 판 5기 · 가운데 셀이 **파랗게 벼려져 굵은 광탄**을 쏜다, 그리고 **과열이 없다**"], "bunroe": ["실 3가닥 + 터진 자리에 잔광 고리", "빨대 2개 동시 — 실 4가닥", "빨대 3개 · 터짐 2배", "각성 — 빨대 4개 · 실 8가닥"], "shotgun": ["범위 +35%", "넉백 — 맞은 적이 밀려남", "사거리 +40%", "착탄 폭발 — 2차 피해"], "sanctum": ["반경 +30%", "감속 35%", "틱 0.4→0.25s", "3초 잔류 — 나가도 남는다"], "pulse": ["반경 +25%", "넉백 +80%", "2중 파문 — 안쪽에 빠른 것 하나 더", "최대 반경에 감속 지대"], "lightfall": ["낙하 지점 +1", "착탄 소폭발", "예고 단축 — 더 빨리 떨어진다", "거대 기둥 1회 섞임 — 화면 1/4"], "arc": ["튕김 5→7", "분기 — 첫 튕김에서 두 갈래", "튕김 7→10", "회귀 — 마지막 적에서 돌아오며 경로 전부 재타격"], "pillar": ["기둥 +2", "경직 0.6s", "반경 +35%", "2차 분출 — 꺼진 자리에서 한 번 더"], "ward": ["빈틈이 메워진다 — 셀 21→29, 회전 +30%", "반사 — 셀 표면에 거울 빗금", "이중 껍질 — 안쪽에 고리 하나 더, 셀 +40%", "파열 — 깨진 셀이 터지고 재생"], "wisp": ["정령 +1", "적을 관통하며 지나감", "정령 +1 (셋째)", "정령끼리 빛의 선으로 연결 — 선도 피해"], "flare": ["눈 둘 — 개안이 겹쳐 섬광이 두 겹이 된다", "눈 셋 + 고리 한 겹 — 파동이 화면 모서리를 넘어간다", "두 번 친다 — 한 박자 뒤 같은 것이 한 번 더", "잔상 — 창이 열려 있는 동안 화면이 계속 밝다(전역 지속 피해)"], "ignite": ["연소 지속 +50%", "전염 — 연소 중 죽으면 옮겨붙는다", "폭발 반경 +40%", "3중첩 — 연소가 겹쳐 쌓인다"],
// ── 방어 5 (결계는 위에) ────────────────────────────────────────────────
// armor.dart 는 L2·L4 를 둘 다 「+40%」로 두었는데, 굵기를 두 번 키우면
// 성장표에서 두 칸이 같은 그림이 되어 표가 거짓말을 한다. 두 번째 +40% 는
// **겹 · 재충전 · 닫힘** 같은 성질로 갈아 그렸다.
"chain": ["마디가 굵어진다 — 상쇄 +40%", "가시 — 부딪힌 적이 반사 피해", "이중 사슬 — 안쪽에 역회전 한 겹 (상쇄 +40%)", "각성 — 과부하. 상쇄가 가득 차면 터진다"],
"mirror": ["반사 원호 ±60° → ±90°", "반사탄이 유도로 바뀐다", "반사 +1회 — 튕겨 다른 적에게", "각성 — 전면 반사. 주기적으로 원호 검사가 사라진다"],
"boulder": ["판이 두꺼워진다 — 경감 +40%", "불굴 — 죽음이 될 타격을 한 번 흰빛으로 버틴다", "관록 — 불굴이 되찬다(재충전 고리)", "각성 — 부동. 멈춰 서면 판이 맞물리고 경감 2배"],
"karma": ["되갚음 +40% — 방출이 넓고 굵어진다", "수거 — 방출이 암흑물질을 쓸어온다", "여파 — 방출에 맞은 적이 느려진다", "각성 — 단죄. 가장 큰 적에게 기둥이 꽂힌다"],
"gale": ["순풍 — 맞은 직후 1.2초 가속, 잔상이 늘어난다", "이동 속도 +8% → +15%", "미끄러짐 — 밟은 서리 지대가 흩어진다", "각성 — 잔풍. 지나간 자리를 스치는 적이 느려진다"],
// ── 저주 5 ───────────────────────────────────────────────────────────────
"curse": ["취약 +40% — 물보라가 두 배로 터진다", "전파 — 각인이 이웃으로 옮는다", "대상 +2", "각성 — 바닥에 진이 펼쳐지고 그 안이 전부 저주다"],
"plague": ["중첩 1 → 3", "전염 — 만중첩이 터지고 곁이 감염된다", "지대 — 얼룩이 바닥에 남아 밟는 적이 감염된다", "각성 — 터짐에 피해가 실린다(연쇄)"],
"shackle": ["대상 1 → 2", "잇는다 — 묶인 것끼리 한 줄이 된다", "동상 — 묶임이 깊어지면 얼어붙는다", "각성 — 얼음이 주기적으로 깨지며 파편 피해"],
"seal": ["대상 1 → 2", "공격 시계 60% → 30%", "파열 — 봉인이 풀릴 때 모아둔 공격이 자기에게", "각성 — 침묵. 원거리 공격이 아예 멎는다"],
"veil": ["대상 2 → 3 · 지속 +30%", "발사각 오차 2배 — 눈에 띄게 빗나간다", "장(場) — 몸 주위 원 안이 전부 눈먼다", "각성 — 장막이 칸 전체를 덮는다"],
// ── 회복 4 ───────────────────────────────────────────────────────────────
"dawn": ["이슬 — 회복이 시작되는 순간 즉시 +2.5", "초당 회복 +50%", "끈기 — 피격이 기다림을 처음으로 되돌리지 못한다", "각성 — 동트기. 위기(HP 30% 이하)엔 기다림이 없다"],
"reap": ["이삭이 커진다 — 처치당 회복 +50%", "연쇄 — 이어 죽이면 이삭이 커진다(최대 3단)", "흩뿌림 — 안 먹힌 이삭이 바닥에 남는다", "각성 — 처치마다 낫 파동이 한 번 더 나간다"],
"purity": ["해독 — 독이 몸에 붙지 못한다", "씻김 — 상태이상이 두 배로 빨리 마른다(물결 둘)", "해빙 — 동상이 반 박자 안에 깨진다", "각성 — 반향. 씻어낸 것을 적에게 되쏜다"],
"tithe": ["요구 젬 4 → 3", "자동 — 위기(HP 45% 이하)엔 모자라도 태운다", "회복량 +40%", "각성 — 대공물. 모아둔 전부를 한 번에 태운다"]};

// ── 레벨 성장표 ───────────────────────────────────────────────────────────
// 17행 × 5열. 각 칸은 **전역 LV 를 자기 값으로 바꿔놓고** 같은 FX 함수를 부른다
// — 레벨판을 따로 그리면 기준 디자인과 어긋나고, 그러면 이 표가 거짓말을 한다.
// (RECOLOR 와 같은 수법. try/finally 로 반드시 되돌린다.)
const LVW=[["bolt","빛파동","물리"],["orbit","공전","물리"],["smg","빛따발총","물리"],
["seeker","유도탄","물리"],["scatter","빛산탄총","물리"],["saber","광선검","물리"],
["lance","레이저","물리"],["shotgun","빛폭탄","물리"],["bunroe","분뢰","물리"],["sunpo","순포","물리"],["sanctum","성역","마법"],
["pulse","파문","마법"],["lightfall","낙광","마법"],["arc","뇌광","마법"],
["pillar","광주","마법"],["ward","결계","방어"],["wisp","정령","마법"],
["flare","개안","궁극기"],["ignite","점화","마법"],
["chain","사슬","방어"],["mirror","경면","방어"],["boulder","거암","방어"],
["karma","응보","방어"],["gale","질풍","방어"],
["curse","저주","저주"],["plague","역병","저주"],["shackle","속박","저주"],
["seal","봉인","저주"],["veil","암막","저주"],
["dawn","여명","회복"],["reap","수확","회복"],["purity","정화","회복"],
["tithe","공물","회복"]];
// 시안이 페이지로 갈린 뒤(2026-08-09), 성장표도 **무기 페이지엔 물리만 ·
// 마법 페이지엔 마법만** 간다. 한쪽 그릇이 없으면 $() 가 떨어진 요소를
// 돌려주므로 그 줄은 조용히 안 그려진다.
const LVHOSTS={"물리":$("levels"),"마법":$("levelsm"),
  "방어":$("levelsg"),"궁극기":$("levelsu"),
  "저주":$("levelsc"),"회복":$("levelsh")};
for(const h of Object.values(LVHOSTS))
  box(h,{display:"flex",flexDirection:"column",gap:"14px",width:"100%"});
const LVC=168;
LVW.forEach(([key,nm,kind])=>{
  const LVHOST=LVHOSTS[kind]||LVHOSTS["물리"];
  const row=document.createElement("div");
  box(row,{width:"100%",background:"#13131A",border:"1px solid #26262F",
    borderRadius:"4px",overflow:"hidden",boxSizing:"border-box"});
  row.insertAdjacentHTML("beforeend",
    `<div style="display:flex;align-items:baseline;gap:8px;padding:7px 10px;`+
    `border-bottom:1px solid #26262F"><b style="font-size:13px;color:#EDEDF2">${nm}</b>`+
    `<span style="font-size:10px;color:#5A5A68">${kind}</span></div>`);
  const cells=document.createElement("div");
  box(cells,{display:"flex",flexWrap:"wrap",gap:"1px",background:"#26262F",width:"100%"});
  for(let L=1;L<=5;L++){
    const cell=document.createElement("div");
    box(cell,{width:LVC+"px",flex:"1 1 "+LVC+"px",minWidth:LVC+"px",
      background:"#13131A",boxSizing:"border-box"});
    const cv=document.createElement("canvas");
    box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
    cell.appendChild(cv);
    // L1 은 기준이라 설명이 없다 — 나머지 넷은 무기 정의의 levelText 그대로.
    const txt=L===1?"기준 디자인":((LVT[key]||[])[L-2]||"");
    cell.insertAdjacentHTML("beforeend",
      `<div style="padding:5px 8px 7px;border-top:1px solid #26262F">`+
      `<div style="font-size:10px;font-weight:700;letter-spacing:.06em;`+
      `color:${L===1?"#9494A2":"#FFA83C"}">L${L}</div>`+
      `<div style="font-size:9.5px;color:#9494A2;line-height:1.35;margin-top:2px;`+
      `min-height:2.7em">${txt}</div></div>`);
    cells.appendChild(cell);
    const fn=FX[key],tk=WTONE[key];
    mk(cv,[LVC,LVC],(c,t,dt,W,H,st)=>{const sl=LV,sr=RECOLOR;LV=L;RECOLOR=tk;
      try{fn(c,t,dt,W,H,st);}finally{LV=sl;RECOLOR=sr;}});
  }
  row.appendChild(cells);LVHOST.appendChild(row);
});

// ── 레이저 재설계 후보 — 안 × L1~L5 ──────────────────────────────────────
//
// **후보를 한 칸씩 나란히 놓는 것으로는 못 고른다.** 이번에 볼 것은 그림이
// 아니라 **성장선**이고("L1 이 약해 보이는가 · L5 가 각성으로 읽히는가"),
// 그건 다섯 칸을 한 줄에 붙여야만 보인다. 그래서 위 성장표와 같은 격자를
// 쓰되 줄이 무기가 아니라 **안**이다.
//
// 성장표(LVW)에 임시로 끼워 넣지 않은 이유: 저 표는 「확정된 17종」이라는
// 계약이라, 후보가 섞이면 무엇이 확정인지가 흐려진다.

const ICL=[["bolt","빛파동"],["orbit","공전"],["smg","빛따발총"],["seeker","유도탄"],
["scatter","빛산탄총"],["saber","광선검"],["lance","레이저"],["shotgun","빛폭탄"],["bunroe","분뢰"],["sunpo","순포"],
["sanctum","성역"],["pulse","파문"],["lightfall","낙광"],["arc","뇌광"],["pillar","광주"],
["ward","결계"],["wisp","정령"],["flare","개안"],["ignite","점화"]];
// 결계는 방어, 개안은 궁극기 — 아이콘도 제 페이지로 간다.
const GUARDK=new Set(["ward"]), ULTK=new Set(["flare"]);
const AICL=[["chain","체인갑옷"],["mirror","경면"],["arcane","마법갑옷"],["mirage","신기루"],
["dawn","여명"],["gale","질풍"],["karma","응보"],["boulder","거암"],["purity","정화"],
["dazzle","섬광"]];
const CICL=[["curse","저주"],["plague","역병"],["shackle","속박"],["seal","봉인"],
["veil","암막"]];
const HICL=[["dawn","여명"],["reap","수확"],["purity","정화"],["tithe","공물"]];
// 아이콘은 **분류마다 제 페이지**로 간다(2026-08-10 재분류). 없는 페이지에서는
// $() 가 떨어져 있는 캔버스를 돌려주므로 같은 스크립트가 전 페이지를 돈다.
const ICONHOSTS={"일반 공격":$("icons"),"마법 공격":$("iconsm"),
  "방어":$("aicons"),"궁극기":$("ulticon"),
  "저주":$("curseicon"),"회복":$("healicon")};
for(const h of Object.values(ICONHOSTS))asRow(h);
function iconTile(reg,key,nm,kind){
  const iconHost=ICONHOSTS[kind]||ICONHOSTS["일반 공격"];
  const d=document.createElement("div");d.className="v";asCell(d,118);
  const cv=document.createElement("canvas");
  box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
  d.appendChild(cv);
  d.insertAdjacentHTML("beforeend",
    `<div style="padding:5px 7px 6px;border-top:1px solid #26262F;font-size:9px;color:#9494A2">`+
    `<b style="display:block;font-size:11px;color:#EDEDF2">${nm}</b>${kind}</div>`);
  iconHost.appendChild(d);
  mk(cv,[110,110],(c,t,dt,W,H)=>{c.save();reg[key](c,W);c.restore();});}
// 1차분류 다섯이 각자 제 페이지를 갖는다 — 일반 공격 8 · 마법 공격 9 · 방어 10.
// 저주·회복은 아직 한 종도 없어 페이지만 서 있다.
const PHYSK=new Set(PHYS.map(w=>w[0]));
ICL.forEach(([k,n])=>iconTile(ICON,k,n,
  GUARDK.has(k)?"방어":ULTK.has(k)?"궁극기":PHYSK.has(k)?"일반 공격":"마법 공격"));
AICL.forEach(([k,n])=>iconTile(AICON,k,n,"방어"));
// **방어 스킬 여섯 중 다섯이 그대로 방어구**라 아이콘을 새로 안 그렸다 —
// 같은 물건이 두 그림을 가지면 3택 카드와 장비 랙에서 다른 것으로 보인다.
// 여명·정화도 같은 이유로 방어구 아이콘을 그대로 부른다(HICON).
CICL.forEach(([k,n])=>iconTile(CICON,k,n,"저주"));
HICL.forEach(([k,n])=>iconTile(HICON,k,n,"회복"));

function slot(host,reg,key,lv){
  box(host,{display:"flex",gap:"6px",flexWrap:"wrap"});
  const d=document.createElement("div");d.className="sl";
  box(d,{width:"46px",height:"46px",flex:"0 0 46px",borderRadius:"4px",
    background:"#0C0C12",border:"1px solid #262630",position:"relative",boxSizing:"border-box"});
  if(!key){d.className+=" empty";host.appendChild(d);return;}
  const cv=document.createElement("canvas");cv.style.width="44px";cv.style.height="44px";d.appendChild(cv);
  if(lv)d.insertAdjacentHTML("beforeend",`<div class="l">${lv}</div>`);
  host.appendChild(d);mk(cv,[44,44],(c,t,dt,W,H)=>{c.save();reg[key](c,W);c.restore();});}
[["bolt",3],["orbit",2],["sanctum",1],[null],[null]].forEach(s=>slot($("wr"),ICON,s[0],s[1]));
[["mirror",2],["chain",1],[null]].forEach(s=>slot($("ar"),AICON,s[0],s[1]));
[["dazzle",1],[null],[null]].forEach(s=>slot($("rr"),AICON,s[0],s[1]));


// ── 우주 맵 배치 ──────────────────────────────────────────────────────────
// 320px 정사각으로 나란히 둔다. **가로로 길게 뽑지 않는다** — 맵은 세로로도
// 스크롤되므로 가로 띠에서는 세로 이음매가 안 보인다.
const MAPS=320;
[["drift","A안 · 심연","","위치감 = <b>시차</b>. 깊이 4층이 서로 다른 속도로 흐르고, 근층 알갱이는 속도만큼 선으로 늘어난다"],
 ["reach","B안 · 성계","","위치감 = <b>표지물</b>. 은하·성운이 알아볼 수 있는 곳이 된다. 암흑 성운은 밝기를 안 쓰고 형태를 만든다"],
 ["lattice","C안 · 성좌","","위치감 = <b>좌표</b>. 별을 격자 마디에 두고 이어 눈금으로 만든다. 4칸마다 표지성 + 좌표 라벨"]]
  .forEach(a=>tile($("m-bg"),MAP,a[0],a[1],a[2],a[3],MAPS,MAPS));

[["voidBolt","대조군 · 지금(검정)","","맵이 없는 현재. 이펙트는 잘 보이지만 <b>움직여도 화면이 안 변한다</b>"],
 ["driftBolt","A안 + 빛파동","","금빛 파도(wBolt L .74)"],
 ["reachBolt","B안 + 빛파동","","성운 위에서도 파도가 안 묻힌다"],
 ["latticeBolt","C안 + 빛파동","","격자선이 이펙트 뒤로 지나간다"]]
  .forEach(a=>tile($("m-bolt"),MAP,a[0],a[1],a[2],a[3],MAPS,MAPS));

[["voidPulse","대조군 · 지금(검정)","","최악의 경우 비교용 기준"],
 ["driftPulse","A안 + 파문","","mPulse 바깥층 L .181 — 배경 상한 .12 에 제일 가까운, 실제로 그려지는 어두운 층"],
 ["reachPulse","B안 + 파문","","성운과 <b>같은 청색 계열</b>인데도 갈린다. 갈리는 것은 색이 아니라 명도다"],
 ["latticePulse","C안 + 파문","","격자선과 고리가 둘 다 얇은 선인데도 굵기·밝기로 갈린다"]]
  .forEach(a=>tile($("m-arc"),MAP,a[0],a[1],a[2],a[3],MAPS,MAPS));

tile($("m-mini"),MAP,"miniB","B안 + 빛파동 + 미니맵","",
  "실제 화면 비율(980×430). 우측 하단 지름 108px",980,0,430);
[["miniA","A안 위에서","","배경이 달라도 읽는 법이 안 바뀐다"],
 ["miniC","C안 위에서","","격자 위에서도 링이 안 섞인다"]]
  .forEach(a=>tile($("m-mini2"),MAP,a[0],a[1],a[2],a[3],MAPS,MAPS));

// ── 로비 시안 3안 (mockup-lobby.html) ─────────────────────────────────────
//
// 로비는 **UI 다.** 배치와 위계는 HTML/CSS 가 맡고, 캔버스는 네 자리에만 쓴다:
//   ① 배경(교체 지점) ② 캐릭터 몸 ③ 성도(항로도) ④ 덱 띠 · 카드 문양
// ②④ 는 반드시 **기존 함수**를 부른다(`ELEM.*` / `ICON.*` / `AICON.*` / `hero`).
// 로비에서 새로 그리면 게임과 **다른 캐릭터**가 되고, 시안이 두 벌이 되는
// 순간 어느 쪽이 진짜인지 아무도 모르게 된다.

// 배경은 **로비가 모르는 것**이어야 한다. 「우주 맵」과 「행성 맵」이 지금
// 각각 만들어지는 중이고 로비는 둘 중 무엇이 와도 붙어야 하므로, 교체
// 지점을 이 한 곳으로 좁힌다 — 맵 담당은 `LOBBYBG` 에 함수 하나를 등록하면
// 끝이고 UI 는 한 줄도 안 바뀐다. 글자 대비는 UI 가 아니라 **scrim 층**이
// 책임진다(mockup-lobby.html 의 `.scrim`).
let LOBBYBGK="cosmos";
window.setLobbyBg=(k)=>{LOBBYBGK=k;};

/// 별 — **점 크기가 곧 밝기**다(성도의 규약). 크기를 균일하게 두면 밤하늘이
/// 아니라 노이즈로 보인다. 자리는 hash 로 고정해 프레임마다 안 튀게 한다.
function lbStars(c,t,W,H,n,mul){
  for(let i=0;i<n;i++){
    const x=hash(i*1.7+.3)*W, y=hash(i*4.9+.7)*H, b=hash(i*8.3+.11);
    const tw=.62+.38*Math.sin(t*(.5+b*1.4)+i*2.1);      // 반짝임 — 아주 약하게
    c.fillStyle=`rgba(228,230,240,${(.14+b*.55)*tw})`;
    c.beginPath();c.arc(x,y,(.45+b*b*1.9)*mul,0,TAU);c.fill();}
}
const LOBBYBG={
  // 우주 — 성운은 **채도를 거의 뺀다.** 배경이 색을 가지면 「빛이 색을 입는다」의
  // 대비를 배경이 먼저 먹어버린다(무속성 = 회백 규약).
  cosmos(c,t,dt,W,H){
    c.fillStyle="#08080C";c.fillRect(0,0,W,H);
    const neb=(x,y,r,col,a)=>{c.save();c.globalCompositeOperation="lighter";
      const g=c.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,A(col,a));g.addColorStop(1,A(col,0));
      c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();};
    neb(W*.26,H*.24+Math.sin(t*.10)*9,W*.80,"#3B3550",.30);
    neb(W*.88,H*.58+Math.cos(t*.08)*11,W*.62,"#28323F",.26);
    neb(W*.42,H*.84,W*.70,"#241E33",.22);
    lbStars(c,t,W,H,150,1);},
  // 행성 — 아래를 행성이 먹는다. **대기 림이 곧 셀 문법의 「흰 앞날」**이라,
  // 3단 계조를 그대로 얹으면 배경도 같은 그림 언어 안에 있게 된다.
  planet(c,t,dt,W,H){
    c.fillStyle="#07070B";c.fillRect(0,0,W,H);
    lbStars(c,t,W,H,110,1);
    const cx=W*.5, cy=H*1.30, R=H*.72, T=TONE.gold;
    c.beginPath();c.arc(cx,cy,R,0,TAU);c.fillStyle="#0A0A11";c.fill();
    // 지표 — 옅은 띠 셋. 진짜 맵이 오면 통째로 갈린다(여기 것은 자리표다).
    for(let i=1;i<=3;i++){c.beginPath();
      c.arc(cx,cy,R*(1-i*.058),Math.PI*(1.06+i*.03),Math.PI*(1.94-i*.03));
      c.strokeStyle=`rgba(150,152,172,${.045+i*.012})`;c.lineWidth=7;c.stroke();}
    // 대기 림 3단 — 바깥 어두운 테 → 중간 → 흰 앞날(한쪽에서만 밝다)
    const rim=(w,col,a0,a1)=>{c.beginPath();c.arc(cx,cy,R,Math.PI*a0,Math.PI*a1);
      c.strokeStyle=col;c.lineWidth=w;c.stroke();};
    c.save();c.globalCompositeOperation="lighter";
    rim(16,A(T[1],.10),1.02,1.98);c.restore();
    rim(7.5,A(T[0],.95),1.02,1.98);
    rim(3.2,A(T[1],.85),1.05,1.95);
    rim(1.3,A(T[2],.95),1.10,1.58);},
  none(c,t,dt,W,H){c.fillStyle="#08080C";c.fillRect(0,0,W,H);},
};

// 실물 맵을 계약대로 꽂는다 — **로비 UI 는 한 줄도 안 바뀐다.** 위 셋은 로비를
// 그릴 때 맵이 아직 없어서 세운 자리표시이고, 아래 둘이 진짜다. 자리표시를
// 안 지우는 이유: 맵 없이 로비만 볼 때의 대조군이 있어야 scrim 층이 제 일을
// 하는지 판정할 수 있다.
LOBBYBG.space  = MAP.lobby;                                  // 우주 B안(성계) · 카메라 1/3
LOBBYBG.ground = (c,t,dt,W,H,st)=>MAPP.bg.ashsea(c,t,W,H);   // 행성 잿바다
function lobbyBg(c,t,dt,W,H,st){(LOBBYBG[LOBBYBGK]||LOBBYBG.none)(c,t,dt,W,H,st);}

/// 덱 20장 — 로비에 오는 것은 **정체가 아니라 구성**이다.
/// 20칸을 폭 310px 에 늘어놓으면 한 칸이 15px 인데, 이 크기에서는 문양이
/// 절대 안 읽힌다(아이콘 규칙: 110px 에서 실루엣만 남는다). 그래서 여기서는
/// **색과 개수**만 전한다 — 「어떤 덱인가」는 색으로, 「무엇이 들었나」는
/// 도감(편집 화면)이 맡는다. 색은 무기 고유색(WTONE) 그대로라 도감과 같다.
const LBDECK=[
  ["bolt","무기"],["orbit","무기"],["smg","무기"],["seeker","무기"],["scatter","무기"],
  ["saber","무기"],["lance","무기"],["shotgun","무기"],
  ["sanctum","마법"],["pulse","마법"],["lightfall","마법"],["arc","마법"],["pillar","마법"],
  ["ward","마법"],["wisp","마법"],["flare","마법"],["ignite","마법"],
  ["chain","방어"],["mirror","방어"],["dawn","방어"]];
function lobbyDeck(c,t,dt,W,H){
  const n=LBDECK.length,gap=W/n,r=Math.min(gap*.36,H*.40);
  for(let i=0;i<n;i++){
    const [k,kind]=LBDECK[i];
    const T=TONE[kind==="방어"?"gold":(WTONE[k]||"gold")];
    const x=gap*(i+.5),y=H*.5;
    // 마름모 두 겹 — 캐릭터 코어와 같은 `jagPoly` 다. 15px 에서 3겹은 뭉갠다.
    // ⚠️ 알파를 **낮춰 둔다.** 무기 고유색 17종을 100% 로 늘어놓으면 20칸이
    // 무지개가 되어, 화면에서 제일 화려한 것이 요약 띠가 된다 — 주 버튼보다
    // 세게 빛나는 요약은 위계를 뒤집는다. 색은 정보로만 남기고 밝기는 뺀다.
    fillPoly(c,jagPoly(x,y,r,4,i*2.7,1.15),A(T[0],.85));
    fillPoly(c,jagPoly(x,y,r*.56,4,i*2.7+1.1,1.1),A(T[1],.72));}
}

/// 성도 — **스테이지가 별이고, 잇는 선이 「어디까지 왔는가」다.**
/// 별은 캐릭터 코어와 **같은 도형**(각진 별)이라 지도가 캐릭터와 같은 그림
/// 언어 안에 있고, 무한모드는 **항로에서 떨어져 혼자 도는 별**이다 —
/// 「끝이 없는 곳」을 설명 문구 대신 **자리**로 말한다.
const LBSTAR=[
  {x:.22,y:.655,r:8 ,s:"clear",nm:"1장 스며드는 어둠"},
  {x:.56,y:.535,r:8 ,s:"clear",nm:"2장 갈라지는 어둠"},
  {x:.32,y:.395,r:15,s:"here" ,nm:"3장 덮쳐오는 어둠"},
  {x:.63,y:.268,r:7 ,s:"lock" ,nm:"4장"},
  {x:.42,y:.163,r:7 ,s:"lock" ,nm:"5장"}];
// 무한 별의 자리는 **비어 있어야 한다.** 항로 별과 세로로 40px 안에 들어가면
// 「항로의 한 칸」으로 읽혀 「떨어져 있다」가 죽고, 라벨끼리 겹친다(2026-08-11
// 렌더 판정 두 번). 1장과 **같은 높이의 반대편** — 항로의 시작 맞은편에 두어
// 「같은 하늘인데 길이 안 닿는 곳」으로 읽히게 한다.
const LBINF={x:.845,y:.598,r:11};
const LBFONT=(w,s)=>`${w} ${s}px "Apple SD Gothic Neo",-apple-system,sans-serif`;
/// 지도의 글자는 **배경이 무엇이든 읽혀야 한다.** scrim 은 화면 위·아래만
/// 덮으므로 가운데에서 배경이 밝아지면(행성 대기 림) 라벨이 그냥 사라진다
/// — 2026-08-11 행성 배경에서 「무한 · 표류」가 실제로 지워졌다. 글자가
/// 스스로 어두운 테를 두르면 배경을 몰라도 된다.
function lbText(c,s,x,y){const f=c.fillStyle;
  c.lineJoin="round";c.lineWidth=3.2;c.strokeStyle="rgba(6,6,10,.8)";c.strokeText(s,x,y);
  c.fillStyle=f;c.fillText(s,x,y);}
function lobbyMap(c,t,dt,W,H,st){
  // ⚠️ **배경을 여기서 직접 부른다.** 시안의 프레임 루프는 캔버스마다 매
  // 프레임 불투명 색으로 지우므로(`fillRect` #0C0C12), 캔버스를 겹쳐도
  // 아래 것이 안 보인다 — 성도를 별도 캔버스로 얹었더니 배경이 통째로
  // 죽었다(2026-08-11 렌더 판정). 교체 지점은 그대로 `LOBBYBG` 하나이고,
  // 실제 엔진에서는 레이어를 겹칠 수 있으니 이 호출은 **시안의 제약**이다.
  lobbyBg(c,t,dt,W,H,st);
  // 격자 — 성도에서 격자는 「항해할 수 있는 곳」이라는 뜻이다. 아주 옅게만
  // 둔다. 진하면 지도가 아니라 **표**로 읽힌다.
  c.save();c.setLineDash([2,7]);c.strokeStyle="rgba(180,185,210,.05)";c.lineWidth=1;
  for(let i=1;i<4;i++){c.beginPath();c.moveTo(W*i/4,H*.07);c.lineTo(W*i/4,H*.72);c.stroke();}
  for(let i=0;i<5;i++){c.beginPath();c.moveTo(0,H*(.12+i*.13));c.lineTo(W,H*(.12+i*.13));c.stroke();}
  c.restore();
  // 항로 — 지나온 길은 실선, 앞은 점선. **선이 형태를 만든다.**
  for(let i=0;i<LBSTAR.length-1;i++){
    const a=LBSTAR[i],b=LBSTAR[i+1],done=a.s!=="lock"&&b.s!=="lock";
    c.save();if(!done)c.setLineDash([3,7]);
    c.strokeStyle=done?"rgba(214,214,228,.32)":"rgba(150,150,172,.15)";
    c.lineWidth=done?1.6:1.2;
    c.beginPath();c.moveTo(a.x*W,a.y*H);c.lineTo(b.x*W,b.y*H);c.stroke();c.restore();}
  c.textBaseline="middle";c.textAlign="left";
  for(const s of LBSTAR){
    const x=s.x*W,y=s.y*H;
    c.font=LBFONT(s.s==="here"?600:500,s.s==="here"?12.5:11);
    if(s.s==="lock"){
      // 아직 못 간 곳 — **윤곽만.** 회색으로 채우면 「잠김」이 아니라
      // 「고장」으로 읽힌다. 비어 있는 것이 곧 「아직」이다.
      fillPoly(c,jagPoly(x,y,s.r,5,s.x*9,1.5),"rgba(122,122,148,.20)");
      c.fillStyle="rgba(128,128,150,.55)";
    }else if(s.s==="clear"){
      celSplash(c,x,y,s.r,5,s.x*9,"gold",.55);
      c.fillStyle="rgba(178,178,196,.8)";
    }else{
      // 지금 여기 — 맥동하는 고리 + **게임의 그 몸**(hero). 「선택됨」을
      // 테두리 사각형으로 표시하지 않는다. 빛이 앉아 있는 것이 곧 선택이다.
      const pu=.90+.10*Math.sin(t*1.6);
      celHoop(c,x,y,s.r*2.4*pu,1,t*.35,2.2,"gold",.5);
      celSplash(c,x,y,s.r*pu,7,s.x*9,"gold",.95);
      hero(c,t,x,y,"gold",.42);
      c.fillStyle="#EDEDF2";}
    lbText(c,s.nm,x+s.r+11,y);}
  // 무한 — **선을 안 잇는다.** 항로 밖에서 자기 궤도를 혼자 돈다.
  {const x=LBINF.x*W,y=LBINF.y*H;
   celHoop(c,x,y,LBINF.r*2.5,.34,t*.5,2.4,"gold",.32);
   fillPoly(c,jagPoly(x,y,LBINF.r,6,3.7,1.6),"rgba(138,138,164,.28)");
   const a=t*.9,ox=x+Math.cos(a)*LBINF.r*2.5,oy=y+Math.sin(a)*LBINF.r*2.5*.34;
   c.beginPath();c.arc(ox,oy,2.1,0,TAU);c.fillStyle="rgba(226,226,240,.85)";c.fill();
   // 라벨은 **별 아래 가운데.** 옆으로 빼면 항로 별의 라벨과 부딪힌다.
   c.textAlign="center";
   c.font=LBFONT(600,11);c.fillStyle="rgba(176,176,198,.9)";
   lbText(c,"무한 · 표류",x,y+LBINF.r+16);
   c.font=LBFONT(500,9.5);c.fillStyle="rgba(140,140,164,.8)";
   lbText(c,"3장 클리어로 해금",x,y+LBINF.r+29);
   c.textAlign="left";}
}

// ── 로비 배치 ─────────────────────────────────────────────────────────────
// 화면은 364×788(세로). 배경과 성도는 **화면 전체를 덮는 층**이고 UI 는 그
// 위에 앉는다 — 지도를 상자 안에 넣으면 「지도가 로비다」가 아니라 「로비
// 안에 지도 위젯이 있다」가 된다.
const LBNAME={};
ICL.forEach(([k,n])=>LBNAME[k]=n);AICL.forEach(([k,n])=>LBNAME[k]=n);
mk($("lb-a-bg"),[364,788],lobbyBg);
mk($("lb-b-bg"),[364,788],lobbyBg);
mk($("lb-c-map"),[364,788],lobbyMap);   // C안은 성도가 배경까지 함께 그린다
mk($("lb-a-hero"),[292,292],ELEM.goldMani);   // 무속성 발현 — 로비의 기준 상태
mk($("lb-b-seal"),[40,40],(c,t,dt,W,H)=>hero(c,t,W/2,H/2,"gold",.95));
mk($("lb-a-deck"),[308,24],lobbyDeck);
mk($("lb-c-deck"),[310,24],lobbyDeck);
{const g=$("lb-b-grid");
 LBDECK.forEach(([k,kind])=>{
   const d=document.createElement("div");d.className="dcard"+(kind==="방어"?" arm":"");
   const cv=document.createElement("canvas");d.appendChild(cv);
   d.insertAdjacentHTML("beforeend",`<div class="dcn">${LBNAME[k]||k}</div>`);
   g.appendChild(d);
   const reg=(kind==="방어")?AICON:ICON;
   mk(cv,[48,48],(c,t,dt,W,H)=>{c.save();reg[k](c,W);c.restore();});});}

$("bare").onclick=(e)=>{e.preventDefault();
  document.body.classList.toggle("bare");
  e.target.textContent=document.body.classList.contains("bare")?"설명 펴기":"설명 접기";};

let t0=null,prev=0;
function frame(ts){
  if(t0===null){t0=ts;prev=0;}
  const t=(ts-t0)/1000;let dt=t-prev;prev=t;if(dt>.05)dt=.05;
  for(const a of anims){if(!a.vis||!a.c)continue;const c=a.c;
    // 상태 완전 초기화 — 합성 모드·알파·변환·클립이 타일 사이로 새면 그림이 깨진다.
    // save/restore 만으로는 부족하다: 그리기 함수가 중간에 던지면 restore 가 안 돈다.
    const dpr=a.dpr;
    c.setTransform(dpr,0,0,dpr,0,0);
    c.globalCompositeOperation="source-over";c.globalAlpha=1;
    c.fillStyle="#0C0C12";c.fillRect(0,0,a.W,a.H);
    c.save();
    FRONT=[];   // 타일마다 초기화 — hero() 를 안 부르는 타일이 있다
    DANGER=[];  // 위험 목록도 — zone_check 가 프레임마다 읽는다
    a.zones=DANGER;
    try{a.fn(c,t,dt,a.W,a.H,a.st);}
    catch(e){if(!a.err){a.err=(e&&e.message)||"?";console.error("FX FAIL",a.label||"?",e);}}
    // 예외가 나면 그 프레임의 나머지가 안 그려져 **깜빡임**으로만 보인다.
    // 조용한 catch 가 공전의 스코프 버그를 숨겼으므로, 실패는 화면에 적는다.
    if(a.err){c.restore();c.setTransform(dpr,0,0,dpr,0,0);
      c.fillStyle="rgba(200,40,60,.9)";c.fillRect(0,0,a.W,13);
      c.fillStyle="#fff";c.font="9px system-ui";
      c.fillText("FX FAIL "+(a.label||"?")+": "+a.err,3,9);c.save();}
    c.restore();
    c.setTransform(dpr,0,0,dpr,0,0);
    c.globalCompositeOperation="source-over";c.globalAlpha=1;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ═══════════════════════════════════════════════════════════════════════════
// 성좌 12 · 융화 ↔ 일반속성 상성    — mockup-meta.html 전용 (접두 stCon/STCON)
// ═══════════════════════════════════════════════════════════════════════════
//
// 판 밖의 것 둘을 정한다.
//   ① 성좌 — 옛 「유물」의 후계. 영구 해금하고 로비에서 3칸에 끼운다.
//   ② 융화 10 × 일반속성 6 의 상성 — 지금 융화에는 상성이 **하나도 없다.**
//
// 접두를 stCon/STCON 으로 통일한 이유: 이 파일을 여러 태스크가 동시에 고치고
// 있어서, 이름이 겹치면 병합이 아니라 **조용한 덮어쓰기**가 된다.

// ── 성좌 — 왜 12종이고 왜 3칸인가 ─────────────────────────────────────────
//
// **12 는 어휘가 준 수다.** 황도 12궁이 정확히 열둘이라 "왜 열둘이냐"에 따로
// 답할 필요가 없다. 그리고 열둘은 로비 한 화면(3×4)에 다 들어간다 — 도감이
// 화면을 넘어가는 순간 대부분은 영영 안 보는 칸이 된다.
//
// **3칸인 이유는 「처음과 끝이 둘 다 살아야」 해서다.**
//   해금 3종 → C(3,3)=1     : 고를 게 없다. 3칸이 무엇인지만 배운다
//   해금 6종 → C(6,3)=20
//   해금 12종 → C(12,3)=220
// 4칸이면 해금 초기(4종)에 **전부 끼게 되어** 선택이 아예 없고, 2칸이면
// 만해금에도 66조합이라 최적해가 금방 굳어 로비가 죽는다. 3 만이 초반의
// "배우는 칸"과 후반의 "고민하는 칸"을 동시에 만든다. 덤으로 엔진이 이미
// 3이다 — `kRelicSlots = 3`, HUD 도 「유물 1 / 3」로 그려져 있다.
//
// **해금은 이미 있는 것으로 다 연다.** 별 판정이 순수 함수로 이미 있고
// (`lib/sim/stage/stars.dart`), 스테이지 3개 × ★★★ = 별 9개다. 시작 3종 +
// 별 9개 = 정확히 12. **별 하나 = 성좌 하나**의 1:1 이라 도감을 세지 않아도
// 진도가 읽힌다. 도전과제를 안 만드는 이유: 새 저장 스키마·새 판정·새 화면
// 셋이 한꺼번에 필요한데, 별은 **이미 다 있다.**
//
// ── 성좌가 「속성은 순 손해」를 갚는 자리이기도 하다 ──────────────────────
// 실측이 속성 빌드가 기준보다 덜 깬다고 말한다(S1 −4.0%p · S2 −5.5%p ·
// S3 −10.5%p). `FVSYN` 이 판 **안**의 해독제라면, 판 **밖**에서는 둘이 그
// 자리를 진다:
//   전갈 — 상태이상 지속 +30%. 상태는 전부 속성이 거는 것이라 **속성을 안
//          집으면 값이 정확히 0인 유일한 성좌**다.
//   양   — 첫 3번의 레벨업이 4택. 속성을 집느라 포기하는 그 한 장을 **초반에
//          정확히 세 번** 돌려준다. S1 −4.0%p 가 생기는 바로 그 구간이다.
//
// ── 별자리 어휘를 어떻게 쓰는가 ───────────────────────────────────────────
//
// **이름만 빌리지 않고 별 배치까지 그린다.** 12궁 기호(♈♉♊…)를 쓰면 획이
// 다 비슷해 16px 에서 열둘이 같은 낙서가 된다. 배치는 **점의 개수와 뭉침**이
// 제각각이라 작아져도 실루엣이 갈린다.
//
// 그리고 분류를 **문법으로** 가른다 — 로비에서 3칸을 채울 때 빌드의 성격이
// 아이콘만 보고 읽혀야 하므로:
//   상승 성좌 = **선으로 이어진 골격** + 따뜻한 금빛
//   게임 성좌 = **흩어진 점** + 차가운 청빛 (선이 없다)
//
// ⚠️ **궁수만 실제 배치를 버린다.** 궁수자리의 실제 골격은 「찻주전자」라
// 16px 에서 그냥 사각형이고, 이 성좌의 효과가 「겨눈 한 발」인데 아이콘이 그
// 말을 못 한다. 열둘 중 유일한 예외이므로 여기 적어 둔다.

// 모든 성좌 타일의 **단일 주기.** 반짝임·맥동·선 파동이 전부 이 하나에서
// 파생된다 — 주기가 둘이면 최소공배수 자리에서 툭 끊긴다.
const STCON_T = 6.0;

// ── 루프 안전 스케줄 넷 ───────────────────────────────────────────────────
// 넷 다 `TAU*t/STCON_T` 의 **순수 주기 함수**다. 위상에서 파생한 값(누적기 ·
// `(t*k)|0` · frac 을 그리는 값에 직접 쓰기)은 안 쓴다 — 주기 끝과 처음이
// 다르면 6초마다 툭 하고 다시 시작하는 것이 보인다.
function stConTwinkle(t, i) {           // 별 반짝임 — 주기당 정확히 3번
  return 0.70 + 0.30 * Math.sin(TAU * 3 * t / STCON_T + i * 2.399);
}
function stConPulse(t) {                // 알파성 맥동 — 주기당 1번, 양끝 기울기 0
  return 0.5 - 0.5 * Math.cos(TAU * t / STCON_T);
}
function stConWave(t, i, n) {           // 선을 따라 흐르는 빛 — 마디마다 위상만 민다
  return 0.5 + 0.5 * Math.cos(TAU * (t / STCON_T - i / n));
}
/// 루프 안전 봉우리 — u∈[0,1] 에서 **값도 기울기도 양끝이 0**이다.
/// sin(πu) 를 안 쓰는 이유: 양끝에서 기울기가 ±π 로 부호만 뒤집혀 이음매에
/// 각이 진다. cos 판은 C¹ 이라 이음매가 없다.
function stConBump(u, p) {
  const s = 0.5 - 0.5 * Math.cos(TAU * u);
  return Math.pow(s, p == null ? 6 : p);
}

// ── 성좌 도감 12 ──────────────────────────────────────────────────────────
//
// pts: [x, y, w] — x·y 는 −1~1 정규 좌표, w 는 별 크기 배(생략 시 1).
// a  : 알파성(그 별자리에서 제일 밝은 별)의 인덱스. **작아지면 이것만 남는다.**
// ln : 이은 마디 [i,j] — 상승 성좌에만 있다.
//
// ⚠️ 수치가 들어갈 자리: 공격력 %는 `finalDamage` 의 **amp 에 덧셈**이다
// (damage.dart 규약). 바깥 곱으로 얹으면 상성·분신과 곱해져 12배 상한
// (`damage_test`)을 민다. amp 를 건드리는 성좌는 **사자·천칭 둘뿐**이고
// 둘을 같이 껴도 +26%p 다.
const STCON = [
  // ── 상승 성좌 6 — 몸에 붙는 수치. 이어진 선 · 따뜻한 금빛 ──────────────
  {id:"leo", nm:"사자 獅子", cls:"rise", tone:"wLance", uz:"처음부터",
   eff:"공격력 +8%",
   why:"낫(Sickle) 모양 별무리가 이 게임의 **베기 문법 그대로**다. 레굴루스는 「작은 왕」 — 힘의 자리",
   hook:"amp += 0.08 (finalDamage 의 단일 곱셈 지점 **안**)",
   a:0, pts:[[-0.60,0.46],[-0.64,0.10],[-0.46,-0.22],[-0.14,-0.36],[0.12,-0.14],[0.16,0.24],[0.66,0.32,0.8]],
   ln:[[0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[5,6]]},

  {id:"gem", nm:"쌍둥이 雙子", cls:"rise", tone:"wSmg", uz:"1 – ★",
   eff:"공격속도 +10%",
   why:"둘이 **번갈아** 친다 = 간격이 줄어든다. 골격도 나란한 두 기둥이라 「둘」이 그대로 보인다",
   hook:"무기 쿨다운 ×(1/1.10)",
   a:1, pts:[[-0.34,-0.52],[0.32,-0.46],[-0.44,0.02],[-0.40,0.48],[0.38,0.06],[0.34,0.52]],
   ln:[[0,2],[2,3],[1,4],[4,5],[0,1]]},

  {id:"tau", nm:"황소 金牛", cls:"rise", tone:"wScatter", uz:"1 – ★★",
   eff:"최대 HP +15%",
   why:"버티는 것. V자 뿔 한가운데의 알데바란(붉은 눈)이 그대로 아이콘의 중심이 된다. 옛 「심지」의 자리",
   hook:"hpMax — 옛 kRelicWickStep 훅 그대로",
   a:2, pts:[[-0.64,-0.52,0.8],[-0.26,-0.16],[0.02,0.08],[0.32,-0.20],[0.68,-0.54,0.8]],
   ln:[[0,1],[1,2],[2,3],[3,4]]},

  {id:"sgr", nm:"궁수 弓手", cls:"rise", tone:"wSaber", uz:"2 – ★",
   eff:"8타마다 확정 치명 ×2",
   why:"⚠️ damage.dart 는 **「크리티컬은 없다」**고 못 박았다 — 결정적 시뮬이 밸런스 하네스의 전제라 확률 크리는 200판 스윕의 신뢰구간을 넓힌다. 그래서 **세는 것**으로 바꿨다: 확률이 아니라 8타마다 확정이라 결정적이고, 궁수의 「겨눈 한 발」과도 맞는다. 기대값 ×1.125",
   hook:"무기 슬롯의 int 카운터 · **바깥 곱은 max(상성, 치명) 하나만** — 둘을 곱하면 최악 조합이 2배가 되어 12배 상한이 뚫린다",
   a:5, pts:[[-0.52,-0.46],[-0.72,0.00],[-0.52,0.46],[-0.28,0.00,0.7],[0.16,0.00,0.7],[0.64,0.00]],
   ln:[[0,1],[1,2],[0,2],[3,4],[4,5]]},

  {id:"sco", nm:"전갈 天蠍", cls:"rise", tone:"wShotgun", uz:"2 – ★★★",
   eff:"상태이상 지속 +30%",
   why:"찌른 자리가 오래 간다. **속성을 안 집으면 값이 정확히 0인 유일한 성좌** — 상태는 전부 속성이 거는 것이라, 「속성이 순 손해」라는 실측의 판 밖 해독제가 된다. 붉은 심장 안타레스가 꼬리 말리기 직전에 있어 갈고리 실루엣의 무게 중심이 된다",
   hook:"StatusPool 지속 ×1.30 — PASSIVE 8종 전부에 같게",
   a:3, pts:[[-0.60,-0.50,0.8],[-0.32,-0.46],[-0.06,-0.30],[0.08,-0.02],[0.20,0.28],[0.04,0.54],[-0.26,0.58,0.8],[-0.44,0.38,0.7]],
   ln:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]},

  {id:"lib", nm:"천칭 天秤", cls:"rise", tone:"wBolt", uz:"3 – ★★★",
   eff:"공격력 +18% · 최대 HP −20%",
   why:"**기운 저울.** 열둘 중 유일하게 그림이 효과를 직접 말한다 — 내려간 접시가 곧 알파성이라 「어느 쪽으로 기울었나」가 44px 에서도 보인다",
   hook:"amp += 0.18 · hpMax ×0.80",
   a:3, pts:[[0.00,-0.54],[-0.58,-0.16],[0.60,-0.34],[-0.64,0.38],[0.62,0.06,0.8]],
   ln:[[0,1],[0,2],[1,3],[2,4]]},

  // ── 게임 성좌 6 — 판이 굴러가는 방식. 흩어진 점 · 차가운 청빛 ──────────
  {id:"aqr", nm:"물병 寶瓶", cls:"game", tone:"mPulse", uz:"처음부터",
   eff:"암흑물질 흡수 반경 +30%",
   why:"쏟아지는 것을 받는 그릇. 점이 **아래로 흘러내리는** 유일한 성좌라 「끌어당긴다」가 움직임으로 읽힌다. 옛 「인력」",
   hook:"stats.absorbMul — 옛 kRelicGravityStep 훅 그대로",
   a:2, pts:[[-0.18,-0.54],[0.12,-0.46],[-0.02,-0.26],[0.26,-0.62,0.7],
             [-0.26,0.02,0.7],[0.04,0.12,0.8],[-0.14,0.32,0.7],[0.18,0.38,0.8],
             [-0.04,0.58,0.6],[0.30,0.62,0.6]], flow:true},

  {id:"vir", nm:"처녀 處女", cls:"game", tone:"mSanctum", uz:"처음부터",
   eff:"경험치 +10%",
   why:"이삭을 든 여인 — **거둔다**가 경험치 그대로다. 스피카 하나만 압도적으로 크고 나머지가 아주 작아 「큰 별 하나」로 읽힌다. 옛 「면류관」",
   hook:"leveling.xpMul — 옛 kRelicCrownStep 훅 그대로",
   a:6, pts:[[-0.54,-0.42,0.6],[-0.18,-0.54,0.6],[0.22,-0.34,0.6],[0.50,-0.06,0.6],
             [0.12,0.04,0.6],[-0.32,0.12,0.6],[0.30,0.50,1.25]]},

  {id:"cnc", nm:"게 巨蟹", cls:"game", tone:"mWard", uz:"1 – ★★★",
   eff:"초당 회복 +0.2",
   why:"껍질 안에서 아문다. 벌집 성단(프레세페)이 **뿌연 덩어리 하나**라 열둘 중 실루엣이 제일 다르다. 옛 「잔불」",
   hook:"world_step 재생 틱 (아직 없다) — **회복원이 없는 것이 지금 밸런스의 구조적 결함**이다",
   a:0, cluster:[0.00,-0.02,0.20,9],
   pts:[[0.00,-0.02,1.2],[-0.56,-0.40,0.7],[0.52,-0.44,0.7],[0.58,0.36,0.7],[-0.50,0.44,0.7]]},

  {id:"psc", nm:"물고기 雙魚", cls:"game", tone:"aqua", uz:"2 – ★★",
   eff:"픽업 등장률 +12%",
   why:"잡히는 것 — 떨어지는 것이 늘어난다. **두 무리를 점의 띠가 잇는** 배치라 선을 안 그어도 「끈」이 보인다. 옛 「길조」",
   hook:"PickupPool 등장률 (아직 없다 — 이 페이지의 「1회성 아이템」 절이 그 자리)",
   a:0, pts:[[-0.50,0.34],[-0.68,0.14,0.7],[-0.34,0.10,0.7],[-0.62,0.54,0.7],[-0.30,0.56,0.7],
             [0.46,-0.36,0.9],[0.30,-0.56,0.6],[0.64,-0.54,0.6],[0.62,-0.18,0.6],
             [-0.14,0.20,0.45],[0.06,0.02,0.45],[0.26,-0.16,0.45]]},

  {id:"ari", nm:"양 白羊", cls:"game", tone:"snow", uz:"3 – ★",
   eff:"첫 3번의 레벨업은 3택이 아니라 4택",
   why:"춘분점 — **한 해의 시작**. 실제로 별이 셋뿐이라 열둘 중 제일 단순한 아이콘이 되고 그것이 곧 「시작」이다. 속성을 집느라 포기하는 한 장을 **초반에 정확히 세 번** 돌려준다 — S1 −4.0%p 가 생기는 바로 그 구간",
   hook:"OfferEngine._out 길이 3 → 4 (rollCount < 3 동안)",
   a:0, pts:[[0.34,-0.30],[-0.12,0.10],[-0.32,0.24,0.8]]},

  {id:"cap", nm:"염소 磨羯", cls:"game", tone:"magnet", uz:"3 – ★★",
   eff:"적 +12% · 경험치 +20%",
   why:"바다염소는 점성술에서 **계약의 짐승**으로도 읽힌다. 넓은 삼각 외곽이라 작아지면 「큰 삼각형」만 남는다. 옛 「어둠의 계약」",
   hook:"spawn 배율 ×1.12 · xpMul ×1.20 — 넷 중 제일 싸다(두 줄)",
   a:3, pts:[[-0.58,-0.34,0.8],[0.06,-0.54,0.8],[0.62,-0.16,0.8],[0.32,0.44],[-0.26,0.38,0.8],[-0.56,0.02,0.7]]}
];

// ── 옛 유물 7종의 처분 — 「효과가 없다」가 아니라 「붙일 자리가 있나」로 가른다 ─
const STCON_DEAD = [
  ["인력",       "→ 물병 寶瓶",  "live", "absorbMul 훅이 이미 산다"],
  ["면류관",     "→ 처녀 處女",  "live", "xpMul 훅이 이미 산다"],
  ["심지",       "→ 황소 金牛",  "live", "hpMax 훅이 이미 산다"],
  ["길조",       "→ 물고기 雙魚","keep", "PickupPool 이 오면 등장률 한 줄. 이 페이지가 그 절을 이미 예약해 뒀다"],
  ["잔불",       "→ 게 巨蟹",   "keep", "재생 틱은 world_step 한 줄. <b>회복원이 없는 것이 지금 밸런스의 구조적 결함</b>이다(stages.dart: 회복원 없는 시뮬에서 보스전이 길수록 무회피 정책은 선형으로 더 죽는다) — 이 성좌가 그 구멍의 첫 답이다"],
  ["어둠의 계약","→ 염소 磨羯",  "keep", "저주 시스템 없이도 붙는다 — spawn 배율 한 줄 + xpMul 한 줄. 넷 중 제일 싸다"],
  ["탐욕의 등불","✕ 버린다",     "drop", "「전 스탯 +4%」의 <b>전 스탯이 이 게임에 없다.</b> 스탯은 분신·주문력·이속·몸크기라 전부 정수 계단이고 %가 안 붙는다. 이름을 못 지으면 아이콘도 못 그린다 — 열둘 중 여기만 그림이 안 나왔다"]
];

// ── 성좌 그리기 ───────────────────────────────────────────────────────────
//
// 크기를 px 가 아니라 **RR 비율**로 잡는다. 같은 함수가 186px 도감 타일과
// 44px 로비 슬롯을 둘 다 그려야 하고, px 고정이면 작은 쪽에서 별이 뭉개진다.
function stConDraw(c, cx, cy, RR, t, d) {
  const tn = d.tone, T = TONE[tn] || TONE.gold;
  const P = d.pts.map(p => [cx + p[0] * RR, cy + p[1] * RR, p[2] == null ? 1 : p[2]]);
  const pu = stConPulse(t);

  // 게임 성좌의 성운 — 선이 없는 대신 **바탕이 숨쉰다.** 이게 없으면 흩어진
  // 점이 그냥 먼지로 보인다.
  if (d.cls === "game") gAdd(c, () => {
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, RR * 1.15);
    g.addColorStop(0, A(T[1], 0.07 + 0.05 * pu));
    g.addColorStop(1, A(T[1], 0));
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, RR * 1.15, 0, TAU); c.fill();
  });

  // 잇는 선 — 상승 성좌만. 빛이 골격을 **따라 흐른다**(마디마다 위상을 민다).
  if (d.ln) {
    const n = d.ln.length;
    for (let i = 0; i < n; i++) {
      const g = stConWave(t, i, n), a0 = P[d.ln[i][0]], a1 = P[d.ln[i][1]];
      celStroke(c, [[a0[0], a0[1]], [a1[0], a1[1]]],
        Math.max(0.8, RR * 0.026), tn, 0.15 + 0.32 * g);
    }
  }

  // 성단(게자리 프레세페) — 작은 점 아홉이 뭉쳐 **뿌연 덩어리 하나**가 된다.
  if (d.cluster) {
    const gx = cx + d.cluster[0] * RR, gy = cy + d.cluster[1] * RR;
    const gr = d.cluster[2] * RR, un = d.cluster[3];
    gAdd(c, () => {
      const g = c.createRadialGradient(gx, gy, 0, gx, gy, gr * 2.1);
      g.addColorStop(0, A(T[2], 0.20 + 0.10 * pu)); g.addColorStop(1, A(T[1], 0));
      c.fillStyle = g; c.beginPath(); c.arc(gx, gy, gr * 2.1, 0, TAU); c.fill();
    });
    for (let i = 0; i < un; i++) {
      const an = hash(i * 5.31) * TAU, rd = gr * (0.25 + 0.75 * hash(i * 9.17));
      const tw = stConTwinkle(t, i + 40);
      stConStar(c, gx + Math.cos(an) * rd, gy + Math.sin(an) * rd,
        Math.max(0.7, RR * 0.028), tn, 0.45 + 0.45 * tw);
    }
  }

  // 별. **알파성 하나만 크다** — 작아지면 선도 작은 별도 사라지고 이것만
  // 남으므로, 알파성의 자리가 곧 그 성좌의 서명이 된다.
  for (let i = 0; i < P.length; i++) {
    const isA = (i === d.a), w = P[i][2];
    // 물병만 **위상이 위→아래로 흐른다.** 점 순서가 위에서 아래라 위상을
    // 인덱스로 밀면 「쏟아진다」가 된다 — 위치는 그대로 두고 밝기만 흐른다.
    const tw = d.flow ? (0.55 + 0.45 * Math.cos(TAU * (t / STCON_T - i / P.length)))
                      : stConTwinkle(t, i);
    // ⚠️ **바닥값이 있어야 44px 에서 산다.** 반지름을 RR 에 순비례로만 두면
    // 로비 슬롯(RR 17.5)에서 알파성이 1.9px 이 되어 열둘이 다 같은 얼룩이
    // 됐다(첫 렌더 판정). 작아질수록 **상대적으로 커지는** 바닥을 준다.
    const r = Math.max(isA ? 2.4 : 1.15, RR * (isA ? 0.108 : 0.048) * w) *
              (isA ? 0.90 + 0.14 * pu : 0.84 + 0.16 * tw);
    stConStar(c, P[i][0], P[i][1], r, tn, isA ? 0.94 : 0.56 + 0.38 * tw);
    // 알파성만 헤일로를 하나 더 쓴다 — 흰 심이 있어야 「빛난다」로 읽힌다.
    // 게임 성좌는 성운이 이미 깔려 있어 헤일로까지 세면 **흰 공** 하나가 된다.
    if (isA) gAdd(c, () => gHalo(c, P[i][0], P[i][1], r * (d.cls === "game" ? 3.6 : 4.6),
      tn, (d.cls === "game" ? 0.20 : 0.30) + 0.14 * pu));
  }
}
/// 별 하나 — 네 갈래. celSplash 의 n=4 · 큰 spikeMul 이 정확히 별 모양이고,
/// 3단 계조와 광휘가 딸려 와 이 레포의 셀 문법에서 벗어나지 않는다.
function stConStar(c, x, y, r, tn, a) {
  celSplash(c, x, y, r, 4, 1.7, tn, a, 1, 2.9);
}
/// `**굵게**` → `<b>`. 이 파일의 기존 규약(MANIDESC 렌더)과 같은 한 줄이다 —
/// 규약을 안 따르면 설명문에 별표가 그대로 찍힌다(첫 렌더에서 그랬다).
function stConMd(s) {
  return String(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`(.+?)`/g, '<code style="color:#9494A2">$1</code>');
}

// ── 조립 — 도감 타일 · 로비 슬롯 ──────────────────────────────────────────
function stConTile(host, d) {
  asRow(host);
  const wrap = document.createElement("div"); wrap.className = "tile"; asCell(wrap, 186);
  const cv = document.createElement("canvas");
  box(cv, {width:"100%", height:"auto", display:"block", aspectRatio:"1", background:"#0C0C12"});
  wrap.appendChild(cv);
  const rise = d.cls === "rise";
  wrap.insertAdjacentHTML("beforeend",
    `<div style="padding:6px 8px 8px;border-top:1px solid #26262F">` +
    `<div style="font-size:12px;font-weight:600;color:#EDEDF2">${d.nm}</div>` +
    `<div style="font-size:10px;font-weight:700;margin-top:2px;color:${rise ? "#FFD27A" : "#5AC8FF"}">` +
    `${rise ? "상승 성좌" : "게임 성좌"} · ${d.uz}</div>` +
    `<div style="font-size:11px;color:#EDEDF2;margin-top:3px;line-height:1.45">${d.eff}</div>` +
    `<div class="ds" style="font-size:9.5px;color:#9494A2;line-height:1.4;margin-top:3px">${stConMd(d.why)}</div>` +
    `<div class="ds" style="font-size:9px;color:#5A5A68;line-height:1.35;margin-top:4px;` +
    `border-top:1px solid #1E1E26;padding-top:4px">훅 · ${stConMd(d.hook)}</div></div>`);
  host.appendChild(wrap);
  mk(cv, [186, 186], (c, t) => stConDraw(c, 93, 93, 74, t, d));
}
/// 로비 슬롯 — **44px.** "작게도 읽히나"는 말로 확인할 수 없어 같은 그림을
/// 실제 슬롯 크기로 한 줄 더 깐다. 여기서 안 갈리면 설계가 틀린 것이다.
function stConSlot(host, d, lit) {
  box(host, {display:"flex", flexWrap:"wrap", gap:"6px", alignItems:"center"});
  const sl = document.createElement("div");
  box(sl, {width:"46px", height:"46px", borderRadius:"4px", background:"#0C0C12",
    border:"1px solid " + (lit ? (d.cls === "rise" ? "#FFD27A" : "#5AC8FF")
                               : (d.cls === "rise" ? "#4A3A20" : "#1E3040")),
    overflow:"hidden", flex:"0 0 46px"});
  const cv = document.createElement("canvas");
  box(cv, {width:"44px", height:"44px", display:"block"});
  sl.appendChild(cv); host.appendChild(sl);
  mk(cv, [44, 44], (c, t) => stConDraw(c, 22, 22, 17.5, t, d));
}

// ═══════════════════════════════════════════════════════════════════════════
// ② 융화 10 ↔ 일반속성 6 상성
// ═══════════════════════════════════════════════════════════════════════════
//
// 지금 상성표(`lib/sim/combat/damage.dart` 의 `affinityMul`)는 넷뿐이다:
//   상극 ×0.5 — 빙→연소 · 염→빙결 · 독→연소
//   상생 ×2.0 — 뇌→빙결/젖음
//   풍·어둠·무속성 → ×1.0, 바닥 1
// **융화 10 에는 한 칸도 없다.**
//
// ── 세로축이 여섯인데 **줄은 다섯**인 이유 ────────────────────────────────
// 한 칸의 뜻은 「가로의 **융화로 때릴 때**, 세로 일반속성이 남긴 **상태에
// 걸린 적**에게 주는 배수」다. 상태는 `PASSIVE` 확정본을 그대로 읽는다:
//   염 → 점화 · 빙 → 동상 · 뇌 → 감전 · 독 → 중독 · 바람 → 실명 · 어둠 → 실명
//
// ⚠️ **바람과 어둠이 같은 상태를 남긴다.** 상성은 속성이 아니라 **상태**를
// 보므로 그 둘은 표에서 물리적으로 **한 줄**이다 — 60칸처럼 보이지만 실제로
// 구별되는 칸은 50개다. 표를 그리며 처음 드러난 사실이라 여기 적어 둔다.
//
// ── 값의 크기 — 왜 ×0.85~×1.30 인가 ──────────────────────────────────────
// ×0.5 / ×2.0 은 **화면에서 사건으로 보이는 것**의 값이다: 불이 꺼진다,
// 전도된다. 융화 쪽은 사건이 아니라 성질의 궁합이라 그만큼 크면 안 된다 —
// 60칸에 큰 값을 뿌리면 게임이 가위바위보가 된다. 그리고 실용적인 이유:
// 상성은 단일 곱셈 지점 **바깥 곱**이라 `damage_test` 의 12배 상한을 직접
// 민다. 융화 최대 ×1.30 은 기존 최대 ×2.0 **아래**라 최악 조합이 안 커진다.
//
// ── 설계 규칙 셋 ─────────────────────────────────────────────────────────
// ① **부모를 물려받지 않는다.** 융화는 「제3의 속성」이 이 레포의 확정 규약이다.
//    연(煙, 염+독)이 점화에 ×0.5 를 물려받으면 "염+독인데 염에게 약하다"가
//    되어 규약이 깨진다. 상성은 **그 융화 자신의 정체**가 정한다.
//    → 제일 좋은 칸 셋이 여기서 나왔다: 수→점화 ×1.20 · 연→점화 ×1.30 ·
//      플라즈마→동상 ×1.25 는 전부 **부모의 ×0.5 를 정확히 뒤집는다.**
//      뢰명→동상은 반대로 부모 뇌의 ×2.0 을 **안** 물려받고 ×1.15(공명)만 준다.
// ② **강세(>1.0)는 두 가지와 다른 축에 둔다** — 그 융화의 `FVSYN` 계열,
//    그리고 그 융화 **자신이 거는 상태**(`PASSIVE`). 앞은 표 둘이 같은 말을
//    하는 것을 막고, 뒤는 **자기가 건 상태를 자기가 이용하는 자기완결 루프**를
//    막는다. 루프가 생기면 동시 보유 2칸을 같은 계열로 채우게 되어 **융화가
//    나는 조건 자체가** 잘 안 선다 — 융화는 서로 다른 두 속성이 만나야 난다.
// ③ **약세(<1.0)는 겹쳐도 된다** — 그건 겹침이 아니라 되돌림이다.
//
// 규칙 ②가 실제로 칸을 비웠다: 불씨→점화(자기 상태) · 설→동상(FVSYN + 자기
// 상태 둘 다) · 자→감전(자기 상태) · 연/역/마/장→중독(FVSYN) · 실명 줄 전체
// (수·연이 거는 상태). **빈칸의 절반은 규칙이 일한 자국이다.**

// 가로 — 융화 10 (FVNAME 과 같은 순서·같은 TONE 키)
const STCON_FV = [
  ["aqua","수 水","염+빙"], ["blast","漿","염+뇌"], ["smoke","연 煙","염+독"],
  ["fstorm","불씨","염+바람"], ["magnet","자 磁","빙+뇌"], ["plague","역 疫","빙+독"],
  ["snow","설 雪","빙+바람"], ["numb","마 痲","뇌+독"], ["thunder","뢰명","뇌+바람"],
  ["murk","장 瘴","독+바람"]];
// 세로 — 일반 6. 세 번째가 그 속성이 남기는 상태 키(PASSIVE 와 같은 이름).
const STCON_EL = [
  ["ember","염 炎","burn"], ["frost","빙 氷","frost"], ["volt","뇌 雷","shock"],
  ["toxin","독 毒","poison"], ["gale","바람 風","blind"], ["shade","어둠 影","blind"]];
// 상태 → 「축」의 이름. 겹침 판정이 FVSYN 의 계열명과 맞대 보는 값이다.
const STCON_AXIS = {burn:"염", frost:"빙", shock:"뇌", poison:"독", blind:"바람·어둠"};

// [상태][융화] = [배수, 왜]. **없는 칸은 ×1.0** — 50칸 중 16칸만 찬다.
const STCON_AFF = {
  burn: {
    aqua   : [1.20, "물이 불에 닿아 증기가 된다 — **부모 빙의 ×0.5 을 정확히 뒤집는다**"],
    smoke  : [1.30, "타르는 **탄다.** 부모 독의 ×0.5 을 뒤집는 자리 — 표 전체의 최대값"],
    plague : [0.85, "열이 병을 죽인다"],
    snow   : [0.85, "눈이 녹는다 — 부모 빙의 ×0.5 보다 **훨씬 얕다.** 눈은 얼음이 아니다"],
    murk   : [0.85, "장기(瘴氣)는 불에 탄다"]},
  frost: {
    blast  : [1.25, "녹일 새 없이 **승화**시킨다 — 부모 염의 ×0.5 을 뒤집는다"],
    plague : [1.20, "찬 곳에서 병이 산다"],
    thunder: [1.15, "**공명이지 전도가 아니다** — 부모 뇌의 ×2.0 을 안 물려받는다"],
    magnet : [1.10, "못 움직이는 것을 끌어당긴다 — 빗나갈 수가 없다"],
    aqua   : [0.90, "언 적에게 물은 그저 언다"],
    smoke  : [0.90, "언 몸에는 타르가 안 붙는다"],
    fstorm : [0.85, "언 것에 불씨는 안 붙는다"],
    numb   : [0.85, "이미 안 움직이는 적에게 마비는 할 일이 없다"]},
  shock: {
    numb   : [1.25, "**신경이 이미 타고 있다** — 전기가 낸 길로 마비가 그대로 들어간다"],
    magnet : [0.90, "같은 극끼리 밀린다. FVSYN 이 뇌 연쇄를 이미 밀어 주므로 여기서 한 번 더 주지 않는다 — **되돌림**"]},
  poison: {
    aqua   : [0.85, "씻겨 나간다"]},
  blind: {}
};

// ── 역방향 — 그리고 고아가 된 비트 하나 ───────────────────────────────────
// 융화가 남긴 상태에 일반속성이 반응하는 쪽인데, 여기서 **표 둘이 서로 다른
// 말을 하고 있는 것**을 발견했다. 판단을 대신하지 않고 양쪽을 적어 둔다.
const STCON_BACK = [
  ["젖음", "뇌 雷", "×2.0", "`damage.dart` 의 `kStatusWet` 갈래 — <b>지금 코드에 살아 있다</b>. 그리고 `FVSYN`·`FVWHY` 의 수(水) 설명이 이 조건 위에 서 있다(「적을 적신다 — 젖음이 뇌 ×2 의 조건」)", "code"],
  ["실명", "—", "×1.0", "`PASSIVE` 확정본은 수(水)를 <b>실명</b>으로 적었다. 확정 8종에 <b>젖음이 없다</b> — 즉 `kStatusWet` 은 아무도 안 거는 <b>고아 비트</b>다", "spec"],
  ["판단이 필요하다", "", "", "둘 중 하나여야 한다. ⓐ 젖음을 9번째 상태로 인정한다(사용자 확정 「새 상태 금지」와 충돌) · ⓑ 젖음을 버리고 `affinityMul` 의 `kStatusWet` 갈래와 `FVSYN.aqua` 의 근거문을 같이 고친다. <b>ⓑ를 권한다</b> — 안 쓰는 상태를 남기면 다음 사람이 「이건 어디에 붙나」를 묻는다(`PASSIVE` 가 출혈을 지운 논리 그대로). 수(水)의 「적신다」는 상태가 아니라 <b>상성 칸</b>으로 이미 살아 있다: 수 → 점화 ×1.20", "ask"]
];

// ── 격자 그리기 ───────────────────────────────────────────────────────────
// 배수를 **색으로도** 말한다: 강세는 따뜻한 금, 약세는 차가운 청, ×1.0 은
// 흐리게. 숫자만 있으면 60칸에서 모양이 안 보인다.
function stConAffCell(v) {
  if (v == null) return ["·", "#2E2E38", "transparent"];
  if (v > 1) return ["×" + v.toFixed(2), "#FFE0A8",
    "rgba(255,170,60," + (0.10 + 0.26 * ((v - 1) / 0.30)).toFixed(3) + ")"];
  return ["×" + v.toFixed(2), "#BFE4FF",
    "rgba(90,180,255," + (0.10 + 0.22 * ((1 - v) / 0.15)).toFixed(3) + ")"];
}
function stConAffGrid(host) {
  let h = `<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:11px;` +
    `font-variant-numeric:tabular-nums;min-width:760px"><tr>` +
    `<th style="text-align:left;padding:5px 7px;color:#5A5A68;font-weight:600;` +
    `font-size:9.5px;letter-spacing:.14em;border-bottom:1px solid #26262F">일반 ＼ 융화</th>`;
  for (const fv of STCON_FV) {
    const T = TONE[fv[0]];
    h += `<th style="padding:5px 4px;border-bottom:1px solid #26262F;font-weight:600;` +
      `font-size:10px;color:#EDEDF2;white-space:nowrap">` +
      `<span style="display:inline-block;width:7px;height:7px;border-radius:9px;` +
      `background:${T[1]};box-shadow:0 0 6px ${A(T[1], .8)};margin-right:3px"></span>${fv[1]}</th>`;
  }
  h += `</tr>`;
  for (const [ek, enm, st] of STCON_EL) {
    const row = STCON_AFF[st] || {}, ET = TONE[ek], empty = !Object.keys(row).length;
    h += `<tr style="${empty ? "opacity:.5" : ""}">` +
      `<th style="text-align:left;padding:6px 7px;border-bottom:1px solid #1A1A22;` +
      `font-weight:600;font-size:10.5px;color:#EDEDF2;white-space:nowrap">` +
      `<span style="display:inline-block;width:7px;height:7px;border-radius:9px;` +
      `background:${ET[1]};margin-right:4px"></span>${enm}` +
      `<div style="font-size:9px;color:#5A5A68;font-weight:400;margin-left:11px">` +
      `${PVNAME[st]} 중인 적</div></th>`;
    for (const fv of STCON_FV) {
      const cell = row[fv[0]], cc = stConAffCell(cell ? cell[0] : null);
      h += `<td style="text-align:center;padding:7px 4px;border-bottom:1px solid #1A1A22;` +
        `color:${cc[1]};background:${cc[2]};font-weight:${cell ? 700 : 400}">${cc[0]}</td>`;
    }
    h += `</tr>`;
  }
  h += `</table></div>`;

  // 검산 — 페이지가 표에서 **직접 세게** 한다. 손으로 적으면 값이 바뀔 때
  // 문장만 남고 숫자가 거짓말을 한다.
  let n = 0, sum = 0, up = 0, dn = 0, shown = 0;
  const seen = {};
  let dist = 0, dsum = 0;
  for (const el of STCON_EL) {
    const st = el[2], row = STCON_AFF[st] || {}, fresh = !seen[st];
    seen[st] = 1;
    for (const fv of STCON_FV) {
      shown++; if (fresh) dist++;
      const v = row[fv[0]];
      if (v) { n++; sum += v[0]; if (v[0] > 1) up++; else dn++; if (fresh) dsum += v[0]; }
      else if (fresh) dsum += 1;
    }
  }
  const avg = (sum + (shown - n)) / shown, davg = dsum / dist;
  h += `<div style="margin-top:12px;font-size:11.5px;color:#9494A2;line-height:1.75">` +
    `<b style="color:#EDEDF2">검산</b><br>` +
    `· 채운 칸 <b style="color:#EDEDF2">${n}</b> (강세 ${up} · 약세 ${dn}) / ` +
    `보이는 ${shown}칸 — 나머지 ${shown - n}칸은 ×1.0.<br>` +
    `· <b style="color:#EDEDF2">구별되는 칸은 ${dist}개다</b> — 바람과 어둠이 같은 상태(실명)를 ` +
    `남겨 표에서 한 줄이기 때문. 그 ${dist}칸 평균 <b style="color:#FFD27A">×${davg.toFixed(4)}</b> ` +
    `(보이는 ${shown}칸 기준 ×${avg.toFixed(4)}).<br>` +
    `· 즉 상성표를 켜도 기대 피해가 <b style="color:#EDEDF2">${((davg - 1) * 100).toFixed(2)}%</b> 만 오른다 — ` +
    `이 표는 총량이 아니라 <b style="color:#EDEDF2">배치</b>를 바꾼다. 그것이 「미세」의 뜻이다.<br>` +
    `· 최대 배수 <b style="color:#EDEDF2">×1.30</b> < 기존 최대 ×2.0(뇌·전도) — 바깥 곱의 최악값이 ` +
    `안 커지므로 <code>damage_test</code> 의 12배 상한이 그대로다.</div>`;
  host.insertAdjacentHTML("beforeend", h);
}

/// 겹침 검사 — 규칙 ②를 **표에서 직접 검사**해 통과/실패를 찍는다.
/// 규칙을 글로만 적으면 다음 사람이 어긴 줄도 모른다.
/// FVSYN·PASSIVE 를 **직접 읽는다** — 사본을 두면 원본이 바뀔 때 조용히 거짓이 된다.
function stConAffCheck(host) {
  let h = `<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:11px;` +
    `min-width:720px">` +
    `<tr>${["융화", "FVSYN 이 미는 계열", "자기가 거는 상태", "상성 강세 축", "판정"].map(x =>
      `<th style="text-align:left;padding:5px 8px;border-bottom:1px solid #26262F;` +
      `color:#5A5A68;font-size:9.5px;letter-spacing:.14em;font-weight:600">${x}</th>`).join("")}</tr>`;
  let pass = 0;
  for (const fv of STCON_FV) {
    const fk = fv[0];
    const syn = String(FVSYN[fk][0]).split("·").map(s => s.trim());
    // 자기가 거는 상태 — decomp(감전+분해)는 감전 줄과 같은 축으로 센다.
    const own = PASSIVE[fk], ownSt = own === "decomp" ? "shock" : own;
    const ownAx = STCON_AXIS[ownSt] || null;
    const axes = [];
    for (const st in STCON_AFF) {
      const v = STCON_AFF[st][fk];
      if (v && v[0] > 1 && axes.indexOf(STCON_AXIS[st]) < 0) axes.push(STCON_AXIS[st]);
    }
    const clash = axes.filter(a => syn.indexOf(a) >= 0 || a === ownAx);
    const ok = clash.length === 0; if (ok) pass++;
    h += `<tr><td style="padding:6px 8px;border-bottom:1px solid #1A1A22;color:#EDEDF2;` +
      `white-space:nowrap">${fv[1]}</td>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #1A1A22;color:#FFB43C">${syn.join("·")}</td>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #1A1A22;color:#7CC4FF">` +
      `${PVNAME[own]}${ownAx ? " <span style='color:#5A5A68'>(" + ownAx + " 줄)</span>" : " <span style='color:#5A5A68'>(세로축 밖)</span>"}</td>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #1A1A22;color:#9494A2">` +
      `${axes.length ? axes.join("·") : "없음 — 규칙 ②가 이 융화의 강세 칸을 다 막았다"}</td>` +
      `<td style="padding:6px 8px;border-bottom:1px solid #1A1A22;color:${ok ? "#7CFFB0" : "#FF6A6A"};` +
      `font-weight:700;white-space:nowrap">${ok ? "겹치지 않음" : "겹침 " + clash.join("·")}</td></tr>`;
  }
  h += `</table></div><div style="margin-top:10px;font-size:11.5px;color:#9494A2">` +
    `<b style="color:${pass === STCON_FV.length ? "#7CFFB0" : "#FF6A6A"}">` +
    `${pass} / ${STCON_FV.length} 통과</b> — 강세를 FVSYN 계열과도, 자기가 거는 상태와도 ` +
    `다른 축에만 두었다. 불씨·설·장은 그 결과로 <b style="color:#EDEDF2">강세 칸이 하나도 없다</b> — ` +
    `규칙이 일한 자국이다.</div>`;
  host.insertAdjacentHTML("beforeend", h);
}

// ── 상성이 눈에 보이는 순간 넷 ────────────────────────────────────────────
// 숫자만 있으면 "왜 그 값인지"가 안 읽힌다. 표의 극단 넷을 그림으로 건다.
// 주기는 전부 2.4초 **하나**이고, 들어오고 나가는 것의 알파는 이음매에서
// 값도 기울기도 0 이다(stConBump) — 6초 주기의 성좌와 같은 규율.
const STCON_T2 = 2.4;
const STCONFX = {};

/// 상태에 걸린 적 — **어두운 속 + 밝은 림**(mockup-etc 의 적 확정 규칙 넷 중
/// 하나) + 눈 둘. 상태 표식만 그리면 「불꽃 하나」로 보여 "적이 **타고 있다**"가
/// 안 읽힌다(첫 렌더 판정) — 배수가 붙는 대상이 화면에 있어야 표가 말이 된다.
function stConFoe(c, x, y, r, tn) {
  const T = TONE[tn], P = jagPoly(x, y, r, 8, 11.3, 1.05, 1);
  fillPoly(c, P, A("#0B0B10", 0.98));
  c.beginPath(); P.forEach((v, i) => i ? c.lineTo(v[0], v[1]) : c.moveTo(v[0], v[1]));
  c.closePath(); c.strokeStyle = A(T[1], 0.75); c.lineWidth = Math.max(1, r * 0.10); c.stroke();
  for (let i = 0; i < 2; i++) {                    // 눈이 정체다
    const ex = x + (i ? 1 : -1) * r * 0.30;
    c.beginPath(); c.arc(ex, y - r * 0.10, Math.max(0.8, r * 0.13), 0, TAU);
    c.fillStyle = A(T[2], 0.95); c.fill();
  }
}

/// 수 → 점화 ×1.20 — 물이 불에 닿아 **증기**가 된다.
STCONFX.steam = function (c, t, dt, W, H) {
  const u = (t % STCON_T2) / STCON_T2, cx = W * 0.5, cy = H * 0.54, R2 = Math.min(W, H) * 0.17;
  const fl = 0.5 + 0.5 * Math.cos(TAU * 4 * t / STCON_T2);
  celSplash(c, cx, cy, R2 * (1.06 + 0.10 * fl), 7, 3.1, "ember", 0.85);   // 점화 중인 적
  stConFoe(c, cx, cy, R2 * 0.62, "ember");
  const px = W * (-0.18 + 1.36 * u), al = stConBump(u, 1.1), P = [];
  for (let i = 0; i <= 12; i++) {
    const q = i / 12;
    P.push([px - W * 0.30 * q, cy + Math.sin(q * 3.1 + TAU * t / STCON_T2) * H * 0.05]);
  }
  celRibbon(c, P, W * 0.075, "aqua", al);                                  // 수의 덩어리
  // ⚠️ 봉우리를 **넓게**(p=3) 잡는다. p=7 로 좁혔더니 증기가 보이는 프레임이
  // 주기의 5%뿐이라 정지 화면에서 이 칸이 그냥 「불 + 파란 선」이었다.
  // 이 타일의 요지는 배수가 아니라 **증기**다.
  const b = stConBump(u, 3);
  if (b > 0.004) {
    celSplash(c, cx, cy, R2 * (1.0 + 2.0 * b), 9, 7.3, "white", 0.68 * b, 0.86, 1.5);
    celHoop(c, cx, cy, R2 * (0.9 + 3.0 * b), 1, 0, W * 0.010, "aqua", 0.55 * (1 - b));
  }
};
/// 연 → 점화 ×1.30 — 타르가 **옮겨붙는다.** 표 전체의 최대값이 왜 여기냐면,
/// 타는 몸에 타는 것을 더하는 유일한 칸이라서다.
STCONFX.tar = function (c, t, dt, W, H) {
  const u = (t % STCON_T2) / STCON_T2, cx = W * 0.5, cy = H * 0.62, R2 = Math.min(W, H) * 0.17;
  const fl = 0.5 + 0.5 * Math.cos(TAU * 4 * t / STCON_T2), b = stConBump(u, 3);
  celSplash(c, cx, cy, R2 * (1.06 + 0.10 * fl + 0.60 * b), 7, 3.1, "ember", 0.85);
  stConFoe(c, cx, cy, R2 * 0.62, "ember");
  // 방울은 **크게**, 그리고 **화면 안에서 출발한다.** 작으면 타르(검은 몸 +
  // 타는 테)가 주황 부스러기로 보이고, 위 밖에서 출발하면 첫 프레임이 잘린다.
  celRound(c, cx, H * (0.04 + 0.56 * u), Math.PI / 2, H * 0.20, W * 0.058,
    "smoke", stConBump(u, 1.0), 0.55);                                     // 떨어지는 방울
  if (b > 0.004) {                                                          // 번지는 앞날
    celSplash(c, cx, cy, R2 * (1.1 + 1.3 * b), 8, 5.5, "smoke", 0.85 * b, 1, 2.3);
    for (let i = 0; i < 6; i++) celSpike(c, cx, cy, i / 6 * TAU + 0.4,
      R2 * (1.2 + 1.8 * b), W * 0.017, "ember", 0.60 * b);
  }
};
/// 설 → 점화 ×0.85 — 눈이 **닿기 전에** 녹는다. 약세를 그리는 법은
/// "약하게 맞는 것"이 아니라 **도달하지 못하는 것**이다.
STCONFX.melt = function (c, t, dt, W, H) {
  const u = (t % STCON_T2) / STCON_T2, cx = W * 0.5, cy = H * 0.66, R2 = Math.min(W, H) * 0.17;
  const fl = 0.5 + 0.5 * Math.cos(TAU * 4 * t / STCON_T2);
  celSplash(c, cx, cy, R2 * (1.06 + 0.10 * fl), 7, 3.1, "ember", 0.85);
  stConFoe(c, cx, cy, R2 * 0.62, "ember");
  for (let j = 0; j < 5; j++) {
    const uj = (u + j / 5) % 1, a2 = stConBump(uj, 0.75);
    celSplash(c, cx + (hash(j * 3.7) - 0.5) * W * 0.52, H * (-0.06 + 0.62 * uj),
      W * 0.030 * (1 - 0.4 * uj), 6, j * 2.3, "snow", 0.85 * a2, 1, 2.2);
  }
};
/// 뢰명 → 동상 ×1.15 — **공명**. 부모 뇌의 전도(×2.0)를 물려받지 않고,
/// 소리가 언 것을 울려 금이 가게 한다. 값이 1.15 인 것이 그 차이다.
STCONFX.ring = function (c, t, dt, W, H) {
  const u = (t % STCON_T2) / STCON_T2, cx = W * 0.5, cy = H * 0.52, R2 = Math.min(W, H) * 0.20;
  stConFoe(c, cx, cy, R2 * 0.60, "frost");                                 // 얼어붙은 적
  fillPoly(c, jagPoly(cx, cy, R2, 6, 4.2, 1.5), A(TONE.frost[0], 0.72));   // 그 위를 덮은 얼음
  fillPoly(c, jagPoly(cx, cy, R2 * 0.66, 6, 5.5, 1.4), A(TONE.frost[1], 0.42));
  const rr = R2 * (2.3 - 1.5 * u), al = stConBump(u, 1.1);
  celHoop(c, cx, cy, rr, 1, 0, W * 0.016, "thunder", 0.85 * al);           // 좁혀 오는 소리
  celHoop(c, cx, cy, rr * 1.16, 1, 0, W * 0.008, "thunder", 0.40 * al);
  const b = stConBump(u, 8);
  if (b > 0.004) for (let i = 0; i < 5; i++) {                             // 울려서 간 금
    const a0 = i / 5 * TAU + 0.7, P = [[cx, cy]];
    for (let s = 1; s <= 3; s++) {
      const q = s / 3;
      P.push([cx + Math.cos(a0 + (hash(i * 7.1 + s) - 0.5) * 0.9) * R2 * q * 1.15,
              cy + Math.sin(a0 + (hash(i * 9.3 + s) - 0.5) * 0.9) * R2 * q * 1.15]);
    }
    gStroke(c, P, W * 0.014, "white", 0.85 * b);
  }
};
const STCON_SHOW = [
  ["steam", "수 水 → 점화 ×1.20", "물이 불에 닿아 증기가 된다 — 부모 빙의 ×0.5 을 뒤집는 자리"],
  ["tar",   "연 煙 → 점화 ×1.30", "타는 몸에 타는 것을 더한다. 표 전체의 최대값"],
  ["melt",  "설 雪 → 점화 ×0.85", "약세는 「약하게 맞는 것」이 아니라 <b>닿기 전에 사라지는 것</b>"],
  ["ring",  "뢰명 雷鳴 → 동상 ×1.15", "공명이지 전도가 아니다 — 부모 뇌의 ×2.0 을 안 물려받는다"]];

// ── 표 셋 (해금 · 옛 유물 처분 · 역방향) ──────────────────────────────────
function stConTh(x) {
  return `<th style="text-align:left;padding:5px 8px;border-bottom:1px solid #26262F;` +
    `color:#5A5A68;font-size:9.5px;letter-spacing:.14em;font-weight:600">${x}</th>`;
}
function stConTd(x, css) {
  return `<td style="padding:6px 8px;border-bottom:1px solid #1A1A22;line-height:1.55;${css || ""}">` +
    `${stConMd(x)}</td>`;
}
function stConUnlockTable(host) {
  // 별 순서로 정렬 — 「처음부터」가 먼저, 그 다음 1-★ … 3-★★★.
  const rank = d => d.uz === "처음부터" ? "0" : d.uz;
  const order = STCON.slice().sort((a, b) => rank(a) < rank(b) ? -1 : rank(a) > rank(b) ? 1 : 0);
  let h = `<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:11.5px;` +
    `min-width:560px"><tr>` + ["해금", "성좌", "분류", "효과"].map(stConTh).join("") + `</tr>`;
  for (const d of order) {
    const rise = d.cls === "rise";
    h += `<tr>` + stConTd(d.uz, "color:#FFD27A;white-space:nowrap;font-weight:600") +
      stConTd(d.nm, "color:#EDEDF2;white-space:nowrap") +
      stConTd(rise ? "상승" : "게임", "color:" + (rise ? "#FFD27A" : "#5AC8FF")) +
      stConTd(d.eff, "color:#9494A2") + `</tr>`;
  }
  host.insertAdjacentHTML("beforeend", h + `</table></div>`);
}
function stConDeadTable(host) {
  const col = {live:"#7CFFB0", keep:"#FFD27A", drop:"#FF6A6A"};
  let h = `<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:11.5px;` +
    `min-width:560px"><tr>` + ["옛 유물", "처분", "근거"].map(stConTh).join("") + `</tr>`;
  for (const r of STCON_DEAD) {
    h += `<tr>` + stConTd(r[0], "color:#EDEDF2;white-space:nowrap") +
      stConTd(r[1], "color:" + col[r[2]] + ";white-space:nowrap;font-weight:600") +
      stConTd(r[3], "color:#9494A2") + `</tr>`;
  }
  host.insertAdjacentHTML("beforeend", h + `</table></div>`);
}
function stConBackTable(host) {
  const col = {code:"#7CFFB0", spec:"#FFD27A", ask:"#FF6A6A"};
  let h = `<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:11.5px;` +
    `min-width:640px"><tr>` +
    ["수(水)가 남기는 것", "반응하는 일반속성", "배수", "출처와 문제"].map(stConTh).join("") + `</tr>`;
  for (const r of STCON_BACK) {
    h += `<tr>` + stConTd(r[0], "color:" + col[r[4]] + ";white-space:nowrap;font-weight:600") +
      stConTd(r[1], "color:#EDEDF2;white-space:nowrap") +
      stConTd(r[2], "color:#EDEDF2;font-weight:700;white-space:nowrap") +
      stConTd(r[3], "color:#9494A2") + `</tr>`;
  }
  host.insertAdjacentHTML("beforeend", h + `</table></div>`);
}
/// 왜를 16줄로 — 격자 칸은 숫자만 담을 수 있어서 근거는 표 밑에 따로 깐다.
function stConWhyList(host) {
  let h = `<div style="columns:2;column-gap:26px;font-size:11px;color:#9494A2;line-height:1.65">`;
  const seen = {};
  for (const el of STCON_EL) {
    const st = el[2]; if (seen[st]) continue; seen[st] = 1;
    const row = STCON_AFF[st]; if (!row) continue;
    for (const fv of STCON_FV) {
      const v = row[fv[0]]; if (!v) continue;
      h += `<div style="break-inside:avoid;margin-bottom:5px">` +
        `<b style="color:#EDEDF2">${fv[1]} → ${PVNAME[st]}</b> ` +
        `<b style="color:${v[0] > 1 ? "#FFD27A" : "#5AC8FF"}">×${v[0].toFixed(2)}</b> · ${stConMd(v[1])}</div>`;
    }
  }
  host.insertAdjacentHTML("beforeend", h + `</div>`);
}

// ── 조립 ──────────────────────────────────────────────────────────────────
STCON.filter(d => d.cls === "rise").forEach(d => stConTile($("star"), d));
STCON.filter(d => d.cls === "game").forEach(d => stConTile($("stcon-game"), d));
STCON.forEach(d => stConSlot($("stcon-slots"), d, false));
// 3칸에 낀 한 벌 — 「사자(화력) · 전갈(속성) · 처녀(경제)」는 속성 빌드가
// 기회비용을 갚는 전형적인 손이다.
["leo", "sco", "vir"].forEach(id =>
  stConSlot($("stcon-equip"), STCON.find(d => d.id === id), true));
stConUnlockTable($("stcon-unlock"));
stConDeadTable($("stcon-dead"));
stConAffGrid($("stcon-aff"));
stConWhyList($("stcon-affwhy"));
stConAffCheck($("stcon-affchk"));
stConBackTable($("stcon-affback"));
STCON_SHOW.forEach(s => tile($("stcon-affshow"), STCONFX, s[0], s[1], "", s[2], 186));

// ═════════════════════════════════════════════════════════════════════════
// 행성 맵 3안 (MAPP) — docs/vfx/mockup-map2.html 전용
// ═════════════════════════════════════════════════════════════════════════
//
// 이 게임에는 맵이 없다. 검은 바탕에서 싸운다. 판이 5분이고 플레이어가 쉬지
// 않고 움직이니 배경은 「예쁜 그림」이 아니라 **위치감을 주는 장치**다.
//
// ── 이 맵이 지켜야 하는 것 ───────────────────────────────────────────────
// 이 게임의 이펙트는 전부 **3단 계조**다: 어두운 바탕 → 중간 → **흰 앞날**.
// 그리고 눈은 그 흰 앞날을 「이펙트」의 표식으로 배운다.
//
//   ⇒ **배경은 3단 중 맨 아래 한 단만 쓴다.**
//     배경에는 중간층도 흰 앞날도 없다. 이 한 줄이 「배경이 이펙트를 먹는」
//     사고를 구조로 막는다 — 색을 잘 고르는 문제가 아니라 **계조를 몇 단
//     쓰느냐**의 문제다. (C안의 이끼만 두 단까지 예외를 두고, 그 예외의
//     상한을 아래에 수치로 못 박는다.)
//
// ── 바닥이 있다는 것 ─────────────────────────────────────────────────────
// 우주 맵과 갈리는 지점이고, 이 안의 강점이자 함정이다. 지면은 위치감을
// **공짜로** 준다(질감이 흐르니 내가 움직이는 게 보인다). 대신 화면을 **100%
// 덮는다** — 별은 화면의 1%만 덮으니 아무리 밝아도 안 싸우지만, 지면은 1%만
// 밝아도 그 1%가 화면 전체에 깔린다.
// 그래서 지면 맵의 설계는 「평균을 어둡게」가 아니라 **밝은 화소의 면적을
// 상한으로 묶는 것**이다. 세 안 모두 그 상한을 수치로 적어 뒀다.
//
// ── 이음매 ───────────────────────────────────────────────────────────────
// 끝없이 스크롤되므로 타일 격자가 보이면 안 된다. 세 겹으로 막는다:
//   ① 타일을 **토러스 랩**으로 굽는다 — 특징 하나를 3×3(자기+이웃 8칸)에
//      그려, 오른쪽 끝을 넘은 것이 왼쪽 끝에 정확히 들어온다.
//   ② 두 장 이상을 **다른 크기 · 다른 각도**로 겹친다. 512 타일 위에 27°
//      돌린 256 타일을 얹으면 합성 주기가 눈으로는 안 잡힌다.
//   ③ 랜드마크(균열·군락)는 타일이 아니라 **월드 좌표 hash** 로 그린다 —
//      주기가 아예 없다.
//
// ── 비용 ─────────────────────────────────────────────────────────────────
// 500마리가 도는 화면이다. 지면 질감은 **한 번 굽고 패턴으로 붓칠**한다
// (프레임당 fillRect 2~3번). 프레임마다 도는 것은 화면에 걸친 랜드마크
// 수십 개뿐이다.
const MAPP={bg:{}};

// 2D hash — 월드 격자 좌표에서 결정적인 난수. 셀이 같으면 값도 같으니
// 스크롤해 나갔다 돌아와도 지형이 그대로다(그래야 랜드마크다).
const mpH2=(x,y,s)=>hash(x*157.31+y*311.73+s*7.13+11.7);

// 카메라 — 데모용 표류 경로. 실제로는 플레이어 좌표가 들어온다.
// 주기가 다른 진동을 두 개 겹쳐 「같은 자리를 도는」 티를 없앤다.
MAPP.cam=t=>[214*Math.sin(t*.231)+96*Math.sin(t*.107+1.3),
             166*Math.cos(t*.187)+72*Math.cos(t*.293+.7)];

// ── 구운 타일 ────────────────────────────────────────────────────────────
// 지면 질감을 프레임마다 그리면 500마리와 예산을 다툰다. 한 번 굽고 그 뒤로는
// createPattern 으로 **fillRect 한 번**에 끝낸다.
const mpTiles={};
function mpTile(key,S,paint){
  let cv=mpTiles[key];if(cv)return cv;
  cv=document.createElement("canvas");cv.width=S;cv.height=S;
  const c=cv.getContext("2d");c.lineJoin="round";c.lineCap="round";
  paint(c,S);mpTiles[key]=cv;return cv;
}
/// 패턴 붓칠 — [rot] 은 **타일 자체를 돌리는** 각도다.
///
/// ⚠️ 돌린 레이어도 **스크롤 방향은 같아야 한다** — 지면은 한 장이다.
/// 회전 좌표계에서 (ox,oy) 를 그대로 밀면 이 레이어만 비스듬히 흘러
/// 「두 장의 땅이 서로 미끄러지는」 그림이 된다. 카메라 이동량을 타일
/// 좌표계로 **역회전**해 넣어야 두 겹이 한 덩어리로 움직인다.
function mpPat(c,cv,W,H,ox,oy,rot,alpha){
  const pat=c.createPattern(cv,"repeat");
  if(!pat)return;                      // 스텁 캔버스(스모크) — 그림은 검증 대상이 아니다
  const S=cv.width||1,r=rot||0,cs=Math.cos(-r),sn=Math.sin(-r);
  const tx=ox*cs-oy*sn,ty=ox*sn+oy*cs;
  c.save();
  if(alpha!=null)c.globalAlpha=alpha;
  if(r){c.translate(W/2,H/2);c.rotate(r);c.translate(-W/2,-H/2);}
  c.translate(-(((tx%S)+S)%S),-(((ty%S)+S)%S));
  c.fillStyle=pat;
  // 돌린 레이어는 화면 사각형이 타일 좌표계에서 비스듬하다 — 넉넉히 덮는다.
  c.fillRect(-W*.6,-H*.6,W*2.2,H*2.2);
  c.restore();
}
/// 토러스 랩 — 특징 하나를 3×3 위치에 그린다. 타일 경계를 넘은 부분이
/// 반대편에 정확히 들어와, 이어 붙여도 잘린 자국이 없다.
function mpWrap9(S,fn){for(let ax=-1;ax<=1;ax++)for(let ay=-1;ay<=1;ay++)fn(ax*S,ay*S);}

// 자갈 — 투명 바탕에 알갱이만. 밑에 어떤 색을 깔아도 얹힌다.
// **고주파**를 맡는다: 큰 얼룩만 있으면 스크롤이 「미끄러지는 종이」로 보인다.
const mpGravel=()=>mpTile("gravel",256,(c,S)=>{
  for(let i=0;i<230;i++){
    const x=hash(i*2.7)*S,y=hash(i*6.1)*S,r=.55+hash(i*8.9)*1.5;
    // 알갱이 최대 알파 .09 — 검은 지면 위에서 명도 .09 를 못 넘는다.
    c.fillStyle=`rgba(176,184,200,${(.030+hash(i*4.4)*.060).toFixed(3)})`;
    mpWrap9(S,(dx,dy)=>{c.beginPath();c.arc(x+dx,y+dy,r,0,TAU);c.fill();});}
});

// ══ A안 · 금 간 흑암반 ═══════════════════════════════════════════════════
//
// **행성이 「식어서 갈라진 용암 판」으로 읽힌다.**
//
// 위치감 = **지형지물.** 균열망이 땅을 168px 다각형으로 쪼갠다. 판 하나가
// 캐릭터의 열 배쯤이라, 멈춰 있어도 「나는 이 판의 왼쪽 아래 모서리에 있다」가
// 읽힌다 — 세 안 중 **정지 상태에서 위치를 말해 주는 유일한 안**이다.
//
// 이펙트 보호 = 균열은 **바탕보다 어둡다**(#040406 명도 .02 / 바탕 #0B0C0E
// 명도 .05). 배경에서 눈에 띄는 것을 밝기가 아니라 **어둠**으로 만든다 —
// 가산 발광 이펙트와 애초에 같은 축에서 안 다툰다.
// 밝은 것은 둘뿐이다: 균열 립(#94A0B8 알파 .085 · 폭 1.6px)과
// 잔불(꼭짓점의 5.5% · 반경 1.8px · 980×548 화면에서 평균 3.2개).
const MP_FCELL=168;
const MP_FGAP="#040406", MP_FLIP="#94A0B8", MP_FEMBER="#FF7A2C";
/// 격자 꼭짓점을 hash 로 흔든다. **이웃 셀이 같은 꼭짓점 함수를 부르므로**
/// 균열이 저절로 이어진다 — 이어 붙이는 코드가 없다는 게 요점이다.
function mpFvert(gx,gy){const j=MP_FCELL*.52;
  return[gx*MP_FCELL+(mpH2(gx,gy,1.7)-.5)*j, gy*MP_FCELL+(mpH2(gx,gy,4.3)-.5)*j];}
/// 균열 한 줄 — 곧은 선은 인공물로 보인다. 중간을 수직으로 흔들어 꺾는다.
function mpCrack(a,b,sd){
  const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
  const px=-dy/L,py=dx/L,o=(hash(sd)-.5)*L*.28,o2=(hash(sd+3.1)-.5)*L*.16;
  return[a,
    [a[0]+dx*.28+px*o2,    a[1]+dy*.28+py*o2],
    [a[0]+dx*.5 +px*o,     a[1]+dy*.5 +py*o],
    [a[0]+dx*.74+px*o2*.7, a[1]+dy*.74+py*o2*.7],
    b];
}
MAPP.bg.fissure=function(c,t,W,H){
  const cam=MAPP.cam(t),ox=cam[0],oy=cam[1];
  c.fillStyle="#0B0C0E";c.fillRect(0,0,W,H);
  mpPat(c,mpTile("rock",512,(c2,S)=>{
    // 암반 얼룩 — 큰 저주파. 어두운 쪽이 2/3 라 평균 명도가 **내려간다**.
    for(let i=0;i<34;i++){
      const x=hash(i*3.1)*S,y=hash(i*5.7)*S,r=26+hash(i*9.3)*76,dk=i%3!==0;
      mpWrap9(S,(dx,dy)=>{
        const g=c2.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);
        g.addColorStop(0,dk?"rgba(0,0,0,.36)":"rgba(190,198,214,.030)");
        g.addColorStop(1,"rgba(0,0,0,0)");
        c2.fillStyle=g;c2.beginPath();c2.arc(x+dx,y+dy,r,0,TAU);c2.fill();});}
  }),W,H,ox,oy,0);
  // 27° 돌린 자갈 — 512 격자와 각이 다르니 두 겹의 합성 주기가 안 읽힌다.
  mpPat(c,mpGravel(),W,H,ox,oy,.4712);

  const g0x=Math.floor((ox-W/2)/MP_FCELL)-1,g1x=Math.floor((ox+W/2)/MP_FCELL)+1;
  const g0y=Math.floor((oy-H/2)/MP_FCELL)-1,g1y=Math.floor((oy+H/2)/MP_FCELL)+1;
  const sx=W/2-ox,sy=H/2-oy;
  c.lineCap="round";c.lineJoin="round";
  // ⚠️ **선만으로는 「금 간 암반」이 안 된다**(2026-08-11 헤드리스 실측).
  // 틈(#040406)과 바탕(#0B0C0E)의 명도 차가 .03 뿐이라 5px 짜리 선이
  // 「머리카락 자국」으로만 보였다. 답은 선을 밝히는 게 아니라 **판을 서로
  // 다른 값으로 칠하는 것**이다 — 실제 갈라진 암반이 그렇게 보이는 이유는
  // 틈이 진해서가 아니라 **판마다 색이 다르기** 때문이다.
  // 판 사이 최대 명도 차 .022 — 위에서 정한 「배경은 1단만」을 안 깬다.
  for(let gy=g0y;gy<=g1y;gy++)for(let gx=g0x;gx<=g1x;gx++){
    const q=[mpFvert(gx,gy),mpFvert(gx+1,gy),mpFvert(gx+1,gy+1),mpFvert(gx,gy+1)];
    // 셀마다 다른 값을 주면 판이 **전부 같은 크기**로 보인다(168px 격자가
    // 그대로 드러난다). 셋 중 하나는 왼쪽 이웃의 값을 그대로 물려받게 해
    // 두 칸이 한 판으로 붙는다 — 크기가 섞이니 격자가 안 읽힌다.
    const v=mpH2(gx,gy,37.1)<.32?mpH2(gx-1,gy,31.7)
           :mpH2(gx,gy,41.3)<.22?mpH2(gx,gy-1,31.7):mpH2(gx,gy,31.7);
    c.beginPath();
    for(let i=0;i<4;i++){const X=q[i][0]+sx,Y=q[i][1]+sy;i?c.lineTo(X,Y):c.moveTo(X,Y);}
    c.closePath();
    c.fillStyle=v<.5?`rgba(0,0,0,${(.10+v*.28).toFixed(3)})`
                    :`rgba(198,206,224,${(.004+(v-.5)*.036).toFixed(3)})`;
    c.fill();}
  const edges=[];
  for(let gy=g0y;gy<=g1y;gy++)for(let gx=g0x;gx<=g1x;gx++){
    const a=mpFvert(gx,gy);
    // **끊긴 균열**이 있어야 격자가 안 보인다. 넷 중 하나꼴로 뺀다.
    // (판 칠은 계속 이어지므로, 끊긴 자리는 「아문 금」으로 읽힌다.)
    if(mpH2(gx,gy,9.1)>.26)edges.push([a,mpFvert(gx+1,gy),gx*7.3+gy*3.1]);
    if(mpH2(gx,gy,12.7)>.26)edges.push([a,mpFvert(gx,gy+1),gx*5.9+gy*11.3]);
    // 가끔 대각선 — 전부 사각형이면 격자가 드러난다.
    if(mpH2(gx,gy,17.3)>.82)edges.push([a,mpFvert(gx+1,gy+1),gx*2.7+gy*8.9]);
  }
  const line=(pts,col,w,dx,dy)=>{c.beginPath();
    for(let i=0;i<pts.length;i++){const X=pts[i][0]+sx+dx,Y=pts[i][1]+sy+dy;
      i?c.lineTo(X,Y):c.moveTo(X,Y);}
    c.strokeStyle=col;c.lineWidth=w;c.stroke();};
  for(let i=0;i<edges.length;i++){
    const e=edges[i],pts=mpCrack(e[0],e[1],e[2]);
    line(pts,"rgba(0,0,0,.34)",11,0,0);        // 어깨 — 틈 둘레가 파여 들어간다
    // 립 — 틈의 **오른아래**에 얇게. 빛이 왼위에서 오면 먼 벽이 이렇게
    // 걸린다. 이 1.8px 선 하나가 균열을 「깊이」로 만든다.
    line(pts,A(MP_FLIP,.10),1.8,3.4,3.4);
    line(pts,MP_FGAP,5.4,0,0);                 // 틈 — 바탕보다 어둡다
    line(pts,A("#141821",.55),1.9,-.5,-.5);    // 틈 안쪽 반사
  }
  // 잔불 — 이 안에서 유일하게 밝은 것.
  for(let gy=g0y;gy<=g1y;gy++)for(let gx=g0x;gx<=g1x;gx++){
    if(mpH2(gx,gy,21.7)>.055)continue;
    const v=mpFvert(gx,gy),x=v[0]+sx,y=v[1]+sy;
    const b=.55+.45*Math.sin(t*1.7+mpH2(gx,gy,3.3)*TAU);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,11);
    g.addColorStop(0,A(MP_FEMBER,.30*b));g.addColorStop(1,A(MP_FEMBER,0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,11,0,TAU);c.fill();
    c.fillStyle=A("#FFA85A",.42*b);c.beginPath();c.arc(x,y,1.8,0,TAU);c.fill();
    c.restore();}
};

// ══ B안 · 재의 바다 ══════════════════════════════════════════════════════
//
// **행성이 「무릎까지 쌓인 화산재」로 읽힌다.**
//
// 위치감 = **질감의 흐름과 시차.** 랜드마크가 하나도 없다 — 대신 세 겹이
// 서로 다른 속도로 흐른다(재 물결 1.0× · 재 장막 1.34× · 날리는 재 2.4×).
// 「여기가 어디」는 못 주지만 「어느 쪽으로 얼마나 빨리」는 세 안 중 제일
// 잘 준다. 못 주는 쪽은 미니맵이 갚는다.
//
// 이펙트 보호 = **세 안 중 가장 안전하다.** 화면에서 제일 밝은 것이 물결
// 마루(흰 알파 .036)와 날리는 재(알파 ≤.23 · 2px)뿐이고, 그 위는 잉걸 5개가
// 전부다. 대신 「행성이 심심하다」는 대가를 진다 — 그 교환이 이 안의 정체다.
const mpRipple=()=>mpTile("ripple",512,(c,S)=>{
  // 재 물결 — **정수 파수(k)만** 쓴다. sin(2π·k·x/S) 는 x=0 과 x=S 에서 값도
  // 기울기도 같아 **가로 이음매가 수학적으로 0** 이다.
  //
  // ⚠️ 행 간격을 균등하게 뒀더니 **골판지**로 보였다(2026-08-11 실측).
  // 자연 물결은 간격이 고르지 않다 — 행마다 자리를 흔들고, 다섯 중 하나는
  // 아예 뺀다. 이렇게만 해도 「무늬」가 아니라 「쌓인 것」으로 읽힌다.
  const ROWS=38;
  for(let r=0;r<ROWS;r++){
    const sd=r*3.7;
    if(hash(sd+8.1)<.2)continue;                      // 성긴 자리
    const y0=(r+.5+(hash(sd+6.3)-.5)*.62)/ROWS*S;
    const amp=3+hash(sd)*4;
    const k1=2+Math.floor(hash(sd+1.1)*3),k2=5+Math.floor(hash(sd+2.3)*4);
    const p1=hash(sd+3.5)*TAU,p2=hash(sd+4.9)*TAU;
    const yy=x=>y0+amp*Math.sin(TAU*k1*x/S+p1)+amp*.45*Math.sin(TAU*k2*x/S+p2);
    const draw=(dy,col,w)=>{c.beginPath();
      for(let i=0;i<=48;i++){const x=i/48*S,y=yy(x)+dy;i?c.lineTo(x,y):c.moveTo(x,y);}
      c.strokeStyle=col;c.lineWidth=w;c.stroke();};
    // 세로 이음매는 랩으로 — 위아래로 삐져나간 행을 반대편에 한 번 더.
    for(let w2=-1;w2<=1;w2++){
      draw(2.6+w2*S,"rgba(0,0,0,.42)",3.0);          // 골 — 어둡게
      draw(w2*S,"rgba(196,202,214,.036)",2.0);}      // 마루 — 아주 살짝만
  }
});
/// 표류하는 재 장막 — **어두운 층이다.**
///
/// 처음엔 흰 안개로 뒀다가 두 번 걸렸다. ① 반경 60~172 얼룩 22개를 384
/// 타일에 흩으면 **면적이 타일의 6.3배**라 알파가 그만큼 겹쳐 쌓인다 —
/// 평균 명도가 .072 까지 올라 지금의 검은 배경(.049)보다 밝아졌다.
/// ② 겹침을 계산해 절반으로 내렸더니 이번엔 **아예 안 보였다** — 시차를
/// 주라고 넣은 층이 아무 일도 안 하면 그건 그냥 비용이다(2026-08-11 실측).
///
/// 답은 밝기를 조절하는 게 아니라 **부호를 뒤집는 것**이다. 재가 날려 지면을
/// **가리는** 것이니 물리에도 맞고, 어두워지는 층은 아무리 진해도 이펙트와
/// 안 싸운다. **위층 시차는 밝게가 아니라 어둡게로 준다** — 지면 맵 전체에
/// 쓸 수 있는 규칙이다.
const mpVeil=()=>mpTile("veil",384,(c,S)=>{
  for(let i=0;i<22;i++){
    const x=hash(i*4.1)*S,y=hash(i*7.9)*S,r=60+hash(i*2.3)*112;
    const a=(.05+hash(i*5.5)*.09).toFixed(3);
    mpWrap9(S,(dx,dy)=>{
      const g=c.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);
      g.addColorStop(0,`rgba(3,3,5,${a})`);g.addColorStop(1,"rgba(3,3,5,0)");
      c.fillStyle=g;c.beginPath();c.arc(x+dx,y+dy,r,0,TAU);c.fill();});}
});
MAPP.bg.ashsea=function(c,t,W,H){
  const cam=MAPP.cam(t),ox=cam[0],oy=cam[1];
  c.fillStyle="#0A0A0C";c.fillRect(0,0,W,H);
  mpPat(c,mpRipple(),W,H,ox,oy,.3142);      // 18° — 물결이 화면 축과 안 맞게
  // 장막 — **지면보다 1.34배 빠르고** 바람으로 계속 흐른다. 랜드마크가 없는
  // 맵에서 위치감을 만드는 것은 이 속도차 하나다.
  mpPat(c,mpVeil(),W,H,ox*1.34+t*22,oy*1.34+t*7,-.1920);
  // 날리는 재 — 가장 빠른 층(2.4×). 화면 좌표에서 감아 돌린다.
  const WD=W*1.4,HD=H*1.4;
  for(let i=0;i<72;i++){
    const sp=26+hash(i*8.1)*46;
    let x=hash(i*2.3)*WD-ox*2.4-t*(58+sp);
    let y=hash(i*6.7)*HD-oy*2.4-t*sp*.30;
    x=((x%WD)+WD)%WD-W*.2;y=((y%HD)+HD)%HD-H*.2;
    const r=.7+hash(i*11.3)*1.3;
    c.fillStyle=`rgba(150,142,132,${(.10+hash(i*3.9)*.13).toFixed(3)})`;
    c.beginPath();c.ellipse(x,y,r*2.2,r,.4,0,TAU);c.fill();}
  // 잉걸 5개 — 이 행성이 「재」임을 말하는 유일한 밝은 것. 알맹이는 1.3px.
  for(let i=0;i<5;i++){
    const sp=14+hash(i*9.1)*11;
    let x=hash(i*3.3)*WD-ox*1.5-t*20,y=hash(i*7.1)*HD-oy*1.5-t*sp;
    x=((x%WD)+WD)%WD-W*.2;y=((y%HD)+HD)%HD-H*.2;
    const b=.5+.5*Math.sin(t*2.3+i*1.7);
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,9);
    g.addColorStop(0,A("#FF8434",.22*b));g.addColorStop(1,A("#FF8434",0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,9,0,TAU);c.fill();
    c.fillStyle=A("#FFBE78",.30*b);c.beginPath();c.arc(x,y,1.3,0,TAU);c.fill();
    c.restore();}
};

// ══ C안 · 발광 이끼 평원 ═════════════════════════════════════════════════
//
// **행성이 「죽은 흙에 살아 있는 것만 빛나는 곳」으로 읽힌다.**
//
// 위치감 = **점점이 박힌 발광체.** 군락이 별자리처럼 놓여, 멈춰서도 「저 세
// 덩이 사이」로 자기 위치를 말할 수 있다. A(경계선) · B(흐름) 과 다른
// 세 번째 축이다.
//
// 이펙트 보호 — 배경이 **스스로 빛나는 유일한 안**이라 여기가 이 과제의
// 함정이다. 장치 넷으로 묶는다:
//   ① **면적 상한** — 셀의 46%에만, 반경 30~76px. 화면 점유 ≤14%.
//   ② **명도 상한 .26** — 몸통 #112620(.11) · 속 #1A4032(.20) ·
//      포자낭 #6CE2B2 알파 ≤.36(반경 1.5px). 이펙트의 흰 앞날(1.00)과 4배 차.
//   ③ **흰 앞날 금지** — 이끼는 3단 계조 중 두 단까지만 쓴다. 「화면에서
//      흰 것은 언제나 이펙트」라는 규약이 안 깨진다.
//   ④ **숨을 안 맞춘다** — 군락마다 주기(3.4~6.3s)와 위상이 다르다. 맞추면
//      화면 전체 밝기가 같이 오르내려 그 순간마다 이펙트와 싸운다.
//
// ⚠️ 색 충돌 하나: 독(毒 #57D96B 130°)과 이끼(162°)가 32° 밖에 안 떨어져
// 있다. 명도가 .78 대 .20 이라 실기에선 갈리지만, 독 캐릭터에서만 이끼 알파를
// 0.6배로 내리는 훅 하나를 남겨 둘 자리다.
const MP_MCELL=214;
const MP_MGLOW="#3ABA92", MP_MBODY="#112620", MP_MCORE="#1A4032", MP_MSPORE="#6CE2B2";
MAPP.bg.moss=function(c,t,W,H){
  const cam=MAPP.cam(t),ox=cam[0],oy=cam[1];
  c.fillStyle="#08090B";c.fillRect(0,0,W,H);
  mpPat(c,mpTile("soil",384,(c2,S)=>{
    for(let i=0;i<40;i++){
      const x=hash(i*3.7)*S,y=hash(i*8.3)*S,r=20+hash(i*5.1)*64,dk=i%4!==0;
      mpWrap9(S,(dx,dy)=>{
        const g=c2.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);
        g.addColorStop(0,dk?"rgba(0,0,0,.38)":"rgba(120,150,138,.026)");
        g.addColorStop(1,"rgba(0,0,0,0)");
        c2.fillStyle=g;c2.beginPath();c2.arc(x+dx,y+dy,r,0,TAU);c2.fill();});}
  }),W,H,ox,oy,0);
  mpPat(c,mpGravel(),W,H,ox,oy,.5760,.55);   // 33° · 알파 .55 — 흙은 자갈이 성글다

  const g0x=Math.floor((ox-W/2)/MP_MCELL)-1,g1x=Math.floor((ox+W/2)/MP_MCELL)+1;
  const g0y=Math.floor((oy-H/2)/MP_MCELL)-1,g1y=Math.floor((oy+H/2)/MP_MCELL)+1;
  const sx=W/2-ox,sy=H/2-oy;
  for(let gy=g0y;gy<=g1y;gy++)for(let gx=g0x;gx<=g1x;gx++){
    if(mpH2(gx,gy,2.1)>.46)continue;                     // ① 면적 상한
    const x=gx*MP_MCELL+(mpH2(gx,gy,5.3)-.5)*MP_MCELL*.72+sx;
    const y=gy*MP_MCELL+(mpH2(gx,gy,7.7)-.5)*MP_MCELL*.72+sy;
    const r=30+mpH2(gx,gy,9.9)*46;
    if(x<-r*2.2||x>W+r*2.2||y<-r*2.2||y>H+r*2.2)continue;
    const per=3.4+mpH2(gx,gy,11.1)*2.9;                  // ④ 주기를 안 맞춘다
    const b=.72+.28*Math.sin(t*TAU/per+mpH2(gx,gy,13.3)*TAU);
    const sd=gx*17.3+gy*29.7;
    c.save();c.globalCompositeOperation="lighter";
    const g=c.createRadialGradient(x,y,0,x,y,r*1.85);
    g.addColorStop(0,A(MP_MGLOW,.075*b));g.addColorStop(1,A(MP_MGLOW,0));
    c.fillStyle=g;c.beginPath();c.arc(x,y,r*1.85,0,TAU);c.fill();c.restore();
    // 군락 실루엣 — **각진 별(jagPoly)이 아니라 둥근 돌기(puffPoly)다.**
    // 처음 jagPoly 로 그렸더니 캐릭터의 각진 별 코어를 바닥에 한 번 더 그린
    // 꼴이 됐다(2026-08-11 실측). 이끼는 뾰족할 이유가 없고, 돌기가 뭉친
    // 실루엣이라야 「번져 자란 것」으로 읽힌다.
    // 탑다운이라 살짝 눌러(squash .84) 바닥에 붙은 것으로 보이게 한다.
    fillPoly(c,puffPoly(x,y,r,9,sd,.84),A(MP_MBODY,.95));
    fillPoly(c,puffPoly(x-r*.05,y-r*.06,r*.58,8,sd+2.3,.84),A(MP_MCORE,.72+.2*b));
    // 흩어진 새끼 군락 — 하나만 두면 스티커다. 번져 나간 자국이 있어야
    // 「자라는 중」이 된다.
    for(let k=0;k<3;k++){
      const a2=mpH2(gx,gy,k*7.9+2.3)*TAU,d2=r*(1.05+.5*mpH2(gx,gy,k*4.1+5.7));
      fillPoly(c,puffPoly(x+Math.cos(a2)*d2,y+Math.sin(a2)*d2*.84,
        r*(.14+.12*mpH2(gx,gy,k*2.9)),6,sd+k*3.7,.84),A(MP_MBODY,.9));}
    // 포자낭 — 군락에서 유일하게 밝은 점. 반경 1.5px × 5개.
    for(let k=0;k<5;k++){
      const a=mpH2(gx+k*.37,gy,3.1)*TAU,rr=r*(.18+.5*mpH2(gx,gy+k*.53,4.7));
      c.fillStyle=A(MP_MSPORE,.22+.14*b);
      c.beginPath();c.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.84,1.5,0,TAU);c.fill();}
    // 포자 — 위로 뜬다. 「살아 있다」를 말하는 것은 밝기가 아니라 **운동**이다.
    for(let k=0;k<3;k++){
      const ph=(t*.13+mpH2(gx,gy,k*3.3+1.1))%1;
      c.fillStyle=A("#8CF0C4",(1-ph)*.20);
      c.beginPath();c.arc(x+(mpH2(gx,gy,k*5.7)-.5)*r*1.6+Math.sin(t*.9+k)*4,
        y-ph*r*2.2,1.1,0,TAU);c.fill();}
  }
};

// ══ 미니맵 ═══════════════════════════════════════════════════════════════
//
// **한 겹만 그린다 — 적 밀도.**
//
// 플레이어가 5분 내내 되풀이하는 결정은 하나다: **어느 쪽으로 빠질까.**
// 거기 필요한 것은 「적이 어디 있나」가 아니라 **「빈 곳이 어디냐」**이고,
// 500마리를 점으로 찍으면 미니맵은 그냥 회색 사각형이 된다. 그래서 개체를
// 버리고 **밀도**를 그린다.
//
// 뺀 것과 그 이유 —
//   · **지형** — 이 맵의 지형은 **통행을 안 막는다**(500마리 경로탐색을 안
//     사려고, 그리고 서바이버는 열린 평면이 생명이라서). 못 막는 것을 그리면
//     결정에 영향이 0 인 잉크다. ← **우주 맵과 답이 갈리는 자리다.** 바닥이
//     생겼다고 바닥을 미니맵에 옮기는 것은 소음이다.
//   · **보스** — 방향 정보라 밀도와 축이 다르다. 미니맵에 섞으면 두 겹이
//     되므로 **화면 가장자리 화살표**로 뺀다(미니맵 밖).
//   · **암흑물질(수집물)** — 이미 화면에서 스스로 빛난다. 두 번 말할 이유가 없다.
//
// 계조도 **2단**이다(성긴 .26 / 빽빽한 .58). 연속 히트맵은 「구름」이 되어
// 정작 빈 곳의 윤곽이 안 잡힌다 — 셀 셰이딩을 쓰는 이유와 같다.
MAPP.swarm=function(t){
  // 데모용 합성 무리. 실제로는 엔진의 적 배열을 격자에 누적한다.
  const out=[];
  for(let i=0;i<11;i++){
    const sd=i*4.7,R0=520+hash(sd)*1500,sp=.09+hash(sd+1.3)*.16,ph=hash(sd+2.7)*TAU;
    out.push({x:Math.cos(t*sp+ph)*R0+Math.sin(t*.07+i)*260,
              y:Math.sin(t*sp*1.17+ph)*R0*.8+Math.cos(t*.05+i)*220,
              r:150+hash(sd+3.9)*260, n:14+Math.floor(hash(sd+5.1)*46)});}
  return out;
};
const MP_MMS=126, MP_MMPAD=15, MP_MMRANGE=2900, MP_MMN=13;
MAPP.minimap=function(c,W,H,t,ox,oy){
  const x0=W-MP_MMS-MP_MMPAD,y0=H-MP_MMS-MP_MMPAD,cell=MP_MMS/MP_MMN;
  const plate=()=>{c.beginPath();
    if(c.roundRect)c.roundRect(x0,y0,MP_MMS,MP_MMS,4);else c.rect(x0,y0,MP_MMS,MP_MMS);};
  c.save();
  // 판 — 지면보다 **더 어둡다.** UI 는 땅 위에 얹은 것이 아니라 뚫린 구멍이다.
  plate();c.fillStyle="rgba(4,5,8,.78)";c.fill();
  c.strokeStyle="rgba(140,148,170,.22)";c.lineWidth=1;c.stroke();
  c.save();plate();c.clip();
  const dens=new Float32Array(MP_MMN*MP_MMN),sw=MAPP.swarm(t);
  for(let s=0;s<sw.length;s++){const g=sw[s];
    const mx=(g.x-ox)/MP_MMRANGE*MP_MMS+MP_MMS/2,my=(g.y-oy)/MP_MMRANGE*MP_MMS+MP_MMS/2;
    const mr=g.r/MP_MMRANGE*MP_MMS;
    const i0=Math.max(0,Math.floor((mx-mr*2.2)/cell)),i1=Math.min(MP_MMN-1,Math.ceil((mx+mr*2.2)/cell));
    const j0=Math.max(0,Math.floor((my-mr*2.2)/cell)),j1=Math.min(MP_MMN-1,Math.ceil((my+mr*2.2)/cell));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){
      const dx=(i+.5)*cell-mx,dy=(j+.5)*cell-my;
      // ⚠️ 나누는 수를 40 으로 뒀더니 판의 2/3 가 붉게 차 **빈 곳이 안
      // 읽혔다**(2026-08-11 실측). 미니맵의 값은 「적이 있다」가 아니라
      // 「여기는 못 지나간다」라서, **비어 보이는 넓이가 정보의 전부**다.
      dens[j*MP_MMN+i]+=Math.exp(-(dx*dx+dy*dy)/(mr*mr+1))*g.n/72;}}
  // ⚠️ 칸마다 fillRect 하면 **칸 경계가 밝게 뜬다** — 겹치게 그린 0.6px 가
  // 알파를 두 번 먹기 때문이다(2026-08-11 확대 판정: 격자 눈금이 보였다).
  // 같은 계조는 **하나의 path 로 모아 한 번에** 채운다. 알파가 한 번만 얹히니
  // 이음매가 없고, fill 도 169번이 아니라 2번이다.
  for(let pass=0;pass<2;pass++){
    c.beginPath();let any=false;
    for(let j=0;j<MP_MMN;j++)for(let i=0;i<MP_MMN;i++){
      const d=dens[j*MP_MMN+i];
      if(d<.16)continue;
      if((d<.55)!==(pass===0))continue;
      c.rect(x0+i*cell,y0+j*cell,cell+.6,cell+.6);any=true;}
    if(!any)continue;
    c.fillStyle=pass?"rgba(226,74,96,.58)":"rgba(226,74,96,.26)";
    c.fill();}
  c.restore();
  // 나 — 흰 마름모. **미니맵에서 흰 것은 나 하나뿐**이라, 눈이 무엇을 찾을지
  // 배울 필요가 없다.
  const px=x0+MP_MMS/2,py=y0+MP_MMS/2;
  c.beginPath();c.moveTo(px,py-4.4);c.lineTo(px+3.4,py);
  c.lineTo(px,py+4.4);c.lineTo(px-3.4,py);c.closePath();
  c.fillStyle="#FFFFFF";c.fill();
  c.fillStyle="rgba(150,158,178,.42)";c.font="8px system-ui";
  c.fillText("적 밀도",x0+1,y0-5);
  c.restore();
};

// ══ 조립 ═════════════════════════════════════════════════════════════════
// [fx] 를 켜면 배경 위에 **진짜 이펙트**(FX.bolt)를 얹는다 — 이 시안의 합격
// 증거다. 「안 헤친다」는 말로 하는 게 아니라 겹쳐 놓고 봐야 한다.
MAPP.demo=function(key,fx,mini){
  const f=function(c,t,dt,W,H,st){
    MAPP.bg[key](c,t,W,H);
    // 이펙트는 **자기 상태통을 따로 쓴다** — 배경과 파티클 배열을 공유하면
    // 서로의 st.p 를 밟는다.
    if(fx){st.fx=st.fx||{p:[]};FX.bolt(c,t,dt,W,H,st.fx);}
    if(mini){const cm=MAPP.cam(t);MAPP.minimap(c,W,H,t,cm[0],cm[1]);}
  };
  try{Object.defineProperty(f,"name",{value:"map_"+key+(fx?"_fx":"")});}catch(e){}
  return f;
};
// 대조군 — 지금의 검은 배경. 같은 이펙트를 나란히 놓아야 「먹혔나」가 보인다.
MAPP.black=function map_black(c,t,dt,W,H,st){
  c.fillStyle="#0C0C12";c.fillRect(0,0,W,H);
  st.fx=st.fx||{p:[]};FX.bolt(c,t,dt,W,H,st.fx);
};

function mapTile(hostId,fn,nm,ds,W,H,wide){
  const host=$(hostId);asRow(host);
  const d=document.createElement("div");d.className="tile";asCell(d,W);
  if(wide)box(d,{flex:"1 1 100%",width:"100%"});
  const cv=document.createElement("canvas");
  box(cv,{width:"100%",height:"auto",display:"block",
    aspectRatio:W+"/"+(H||W),background:"#0C0C12"});
  d.appendChild(cv);
  d.insertAdjacentHTML("beforeend",
    `<div class="cap" style="padding:7px 9px 8px;border-top:1px solid #26262F">`+
    `<div class="nm" style="font-size:12.5px;font-weight:600;color:#EDEDF2">${nm}</div>`+
    `<div class="ds" style="font-size:10px;color:#9494A2;line-height:1.4;margin-top:2px">${ds}</div></div>`);
  host.appendChild(d);mk(cv,[W,H||W],fn);
}
const MAP_W=980,MAP_H=548,MAP_S=302;
mapTile("map2a",MAPP.demo("fissure",1,1),"A · 금 간 흑암반 + 빛파동 + 미니맵",
  "위치감=지형지물. 균열 다각형(168px)이 랜드마크다. 밝은 것은 균열 립(알파 .085)과 잔불(반경 1.8px·화면당 3.2개)뿐.",MAP_W,MAP_H,1);
mapTile("map2b",MAPP.demo("ashsea",1,1),"B · 재의 바다 + 빛파동 + 미니맵",
  "위치감=시차. 랜드마크 0, 대신 세 겹이 1.0×/1.34×/2.4× 로 흐른다. 세 안 중 이펙트 보호 최강.",MAP_W,MAP_H,1);
mapTile("map2c",MAPP.demo("moss",1,1),"C · 발광 이끼 평원 + 빛파동 + 미니맵",
  "위치감=점점이 박힌 발광체. 배경이 스스로 빛나는 유일한 안 — 면적 ≤14%, 명도 상한 .26, 흰 앞날 금지.",MAP_W,MAP_H,1);
mapTile("map2bg",MAPP.demo("fissure",0,0),"A · 배경만","대비 판정용 — 이펙트를 뺐다.",MAP_S,MAP_S);
mapTile("map2bg",MAPP.demo("ashsea",0,0),"B · 배경만","대비 판정용 — 이펙트를 뺐다.",MAP_S,MAP_S);
mapTile("map2bg",MAPP.demo("moss",0,0),"C · 배경만","대비 판정용 — 이펙트를 뺐다.",MAP_S,MAP_S);
mapTile("map2ref",MAPP.black,"대조군 · 지금(검은 배경)",
  "맵이 없는 현재. 옆 셋과 대야 「먹혔나」가 판정된다.",MAP_S,MAP_S);
mapTile("map2ref",MAPP.demo("fissure",1,0),"A 위에서","같은 이펙트, 같은 시각.",MAP_S,MAP_S);
mapTile("map2ref",MAPP.demo("ashsea",1,0),"B 위에서","같은 이펙트, 같은 시각.",MAP_S,MAP_S);
mapTile("map2ref",MAPP.demo("moss",1,0),"C 위에서","같은 이펙트, 같은 시각.",MAP_S,MAP_S);
mapTile("map2mini",function map_mini(c,t,dt,W,H){
  // 미니맵만 확대 — 302px 칸에서는 2단 계조가 안 읽힌다.
  c.fillStyle="#0C0C12";c.fillRect(0,0,W,H);
  c.save();c.translate(W/2,H/2);c.scale(2.2,2.2);
  c.translate(-(W-MP_MMS/2-MP_MMPAD),-(H-MP_MMS/2-MP_MMPAD));
  const cm=MAPP.cam(t);MAPP.minimap(c,W,H,t,cm[0],cm[1]);c.restore();
},"미니맵 · 2.2배","적 밀도 한 겹 + 나. 지형·보스·수집물은 뺐다.",MAP_S,MAP_S);
// 실측 하네스(대비·비용)가 배경 함수를 직접 부른다.
if(typeof window!=="undefined")window.MAPP=MAPP;

// ══════════════════════════════════════════════════════════════════════════
// 마법 확장 — 독 4 + 창작 5 (2026-08-11)
// ══════════════════════════════════════════════════════════════════════════
//
// **덧붙이기 전용 블록이다.** 위의 `FX` · `MAGIC` · `LVT` 를 한 줄도 안 고친다 —
// 같은 시각에 다른 손이 같은 파일의 다른 자리를 만지므로, **겹치는 자리를 아예
// 안 만드는 것**이 유일하게 확실한 안전장치다. 키도 `mgPoison*` / `mgNova*` 로
// 못박아 다른 손의 이름과 안 부딪히게 한다.
//
// ── 축 분업 — 「한 분류 안에서 축이 겹치면 안 된다」 ────────────────────────
//
// 이미 팔린 축.
//   물리 10 — 정면 파동 · 공전 · 연사 · 유도 · 산탄 · 베기 · 관통빔 · 스플래시 ·
//             **연결/빨대**(분뢰) · **자율 공전 사격 + 과열**(순포)
//   마법  9 — **장판**(성역) · 퍼지는 링(파문) · **낙하**(낙광) · **연쇄**(뇌광) ·
//             **기둥**(광주) · **결계** · **정령** · 전역 섬광(개안) · **연소**(점화)
//   기본공격 8축(`MANIDESC`) — 튕김 · 터짐 · **번짐** · 옮겨붙음 · **관통(독)** ·
//             **빨아들임(바람·뢰명)** · **블랙홀(어둠)** · **시한 충격파(백광)** ·
//             멀수록 강함(수)
//
// | 키 | 이름 | 속성 | 축 — 이 아홉 안에서 유일해야 하는 것 | 상태(확정 8) |
// |---|---|---|---|---|
// | mgPoisonCreep  | 만연 蔓延 | 독 毒       | **자란다** — 지면 넝쿨이 뻗고 자란 자리가 남는다 | 중독 |
// | mgPoisonLatch  | 기생 寄生 | 독 毒       | **붙는다** — 적 몸에 박혀 적과 같이 움직인다 | 중독 |
// | mgPoisonBrand  | 극독 劇毒 | 독 毒       | **조인다** — 한 마리의 표식이 겹겹이 깊어진다 | 중독 |
// | mgPoisonSpread | 감염 感染 | 독 毒       | **옮는다** — 발원지가 플레이어가 아니라 **적**이다 | 중독 |
// | mgNovaDetonate | 기폭 起爆 | 마 痲       | **소비한다** — 이미 쌓인 겹을 태워 즉발로 바꾼다 | 저주 |
// | mgNovaChime    | 공명 共鳴 | 뢰명 雷鳴   | **겹친다** — 파의 **교점**에서만 마디가 선다 | 침묵 |
// | mgNovaSplit    | 분열 分裂 | 플라즈마 漿 | **배로 는다** — 세대가 넘어갈 때마다 개수가 두 배 | 감전+분해 |
// | mgNovaCycle    | 오행 五行 | 백광 白光   | **돌아간다** — 다섯 속성을 차례로 두른다 | 방어 무시·×2·튕김 |
// | mgNovaDusk     | 암전 暗轉 | 어둠 影     | **끈다** — 열여덟 중 유일하게 화면이 **어두워진다** | 실명 |
//
// **새 상태는 하나도 안 만든다.** 아홉이 거는 것은 전부 `PASSIVE` 의 확정본이고,
// 그림도 `pvMark` 를 그대로 부른다 — 같은 상태가 스킬마다 달라 보이면 플레이어는
// 상태를 못 배운다는 그 표의 계약이 여기에도 적용된다.
//
// ⚠️ 겹칠 뻔한 것 다섯과, 어떻게 피했는가:
//  ① 만연(가지가 뻗음) ↔ 분열(1→2→4). 둘 다 「나무」로 보일 수 있다. 가른 축은
//     **남느냐**다 — 만연은 자란 줄기가 지면에 남아 **구조**가 되고, 분열은 부모가
//     사라져 어느 순간에도 화면에 **한 세대만** 있다. 하나는 그물이고 하나는 개수다.
//  ② 감염(적→적) ↔ 뇌광(연쇄). 뇌광은 **내가 쏜 것**이 적을 건너뛰는 즉발
//     지그재그다. 감염은 쏘는 것이 없고 **적의 몸에서** 파문이 나며, 그래서
//     플레이어가 아무것도 안 하는 동안 판이 혼자 번져 간다.
//  ③ 자기력 「끌어당김」 안을 **버렸다.** `MANIDESC` 에서 어둠(블랙홀)·바람·뢰명이
//     이미 빨아들이는 층을 셋이나 쓰고 있어, 마법에 하나 더 두면 넷이 된다.
//     그 자리를 **기폭**(쌓인 것을 소비)으로 갈았다 — 아무도 안 쓰는 축이고,
//     같은 손이 만든 독 넷의 **결제 수단**이라 아홉이 한 벌로 선다.
//  ④ 분열의 「관통」 안도 **버렸다** — 관통은 독의 기본 공격 축이다(MANIDESC.toxin).
//     각성은 **갈래 수**(둘 → 셋)로 바꿨다. 세는 축이 그대로라 성장이 안 흔들린다.
//  ⑤ 암전의 실명은 **레벨 특전이 아니다.** `PASSIVE.shade === "blind"` 라 어둠이면
//     처음부터 걸린다 — 레벨로 파는 것은 「어둠에 든 적이 걷힌 뒤에도 보이는 것」이다.
//
// ── 독의 성격: 「약하고 길다, 자동 중첩」 ───────────────────────────────────
//
// 넷 다 **즉발 한방이 없다.** 한 방이 크면 그건 독이 아니라 폭탄이다. 대신 넷이
// `FVSYN` 에서 독을 미는 융화 넷과 **하나씩** 짝이 맞게 갈라, 어느 융화를 잡느냐가
// 곧 빌드가 되게 한다(넷이 전부 다른 것을 주므로):
//
//   연 煙(염+독)  중첩 상한 +1  → 만연 蔓延 · **중첩형** (상한이 곧 위력)
//   역 疫(빙+독)  지속   +60%   → 기생 寄生 · **지속형** (오래 붙을수록 아프다)
//   마 痲(뇌+독)  피해   +45%   → 극독 劇毒 · **한방형** (한 마리에 몰아준다)
//   장 瘴(독+바람) 둘 다 +20%   → 감염 感染 · **광역형** (수가 곧 위력)
//
// 그리고 **기폭**이 넷을 하나로 묶는다: 넷이 쌓아 둔 겹을 즉발 피해로 바꾸므로,
// 「독은 느려서 못 쓴다」는 이 계열의 유일한 약점에 답이 생긴다.
//
// 창작 다섯은 **기본 5속성을 안 쓴다.** 기본 20종이 이미 그 자리를 채웠으므로
// 창작의 자리는 융화·어둠·백광이다(`FVNAME`/`FVWHY` 의 정체를 지킨다).
// ══════════════════════════════════════════════════════════════════════════
const MGFX={

// ── 독 1 · 만연 蔓延 ──────────────────────────────────────────────────────
// **자란다.** 성역이 「원을 깔아 두고 그 안을 때리는 것」이라면 이쪽은 「기어가서
// 닿는 것」이다 — 넝쿨이 지면을 따라 뻗고, **끝이 닿은 적에게만** 겹이 하나씩
// 박힌다. 조준이 없다는 것이 독의 성격이고, 넝쿨이 어디로 갔느냐가 곧 「누가
// 물렸나」다.
//
// 넝쿨은 **한 번만 굴린다.** 매 프레임 새로 굴리면 자라는 게 아니라 **떠는** 것이
// 된다 — 뇌의 「경로가 매번 다시 굴려진다」와 정확히 반대라야 한다. 그쪽이 방전이고
// 이쪽은 식물이다.
mgPoisonCreep(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[76,-34,11],[-72,-16,10],[14,66,10],[-36,-62,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  // 레벨 — 한 단에 **보이는 것 하나씩만** 바뀐다.
  //   L1 싹 1·분기 0·시든다 / L2 싹 2 / L3 안 시든다 / L4 분기 1 / L5 분기 2 + 꽃
  const SEED=[1,2,2,2,2][LV-1],SPLIT=[0,0,0,1,2][LV-1],
        KEEP=atL(3),BLOOM=atL(5),CAP=[3,3,4,4,5][LV-1];
  if(!st.v||st.vk!==LV){
    st.vk=LV;st.v=[];st.u=0;
    // ⚠️ 마디 시간을 고정하면 **깊은 나무일수록 다 자라는 데 세 배가 걸려**,
    // 레벨 표에서 L5 만 늘 「자라는 중」인 칸이 된다(2026-08-11 렌더 판정).
    // 세대가 깊을수록 빨리 뻗게 해 다섯 칸의 주기를 비슷하게 맞춘다.
    const SEGT=.34/(1+SPLIT*.45);
    // 마디 셋이 한 줄기. 마디마다 각이 조금씩 틀어져야 「기어간 자국」이 된다.
    const push=(x,y,a,g,tt,len)=>{
      let px=x,py=y,pa=a,pt=tt;
      for(let k=0;k<3;k++){const sd=st.v.length*3.7+k*1.9;
        const na=pa+(hash(sd)-.5)*1.15,L=len*(.78+.44*hash(sd+2.3));
        // y 를 .52 로 눌러 **바닥에 눕힌다** — 안 누르면 공중에 뜬 덩굴이 된다.
        const nx=px+Math.cos(na)*L,ny=py+Math.sin(na)*L*.52;
        st.v.push({x0:px,y0:py,x1:nx,y1:ny,g,t0:pt,t1:pt+SEGT,
                   bow:(hash(sd+5.1)-.5)*9*SC,tip:0,hit:0});
        px=nx;py=ny;pa=na;pt+=SEGT;}
      if(g<SPLIT)for(let b=0;b<2;b++)push(px,py,pa+(b?.86:-.86),g+1,pt,len*.66);
      else st.v[st.v.length-1].tip=1;};
    // ⚠️ 싹이 둘일 때 `s/SEED*TAU` 는 정확히 180° 라 **한 줄로 이어져 보인다**
    // (2026-08-11 렌더 판정: L2 가 「긴 선 하나」였다). 2.4rad 로 벌려 둘인 것이
    // 보이게 하고, 길이도 줄인다 — L5 는 세 세대라 칸 밖으로 나가고 있었다.
    for(let s=0;s<SEED;s++)push(0,0,s*2.4+.55,0,0,23*SC);
    st.vT=st.v.reduce((m,q)=>Math.max(m,q.t1),1);}
  // L3 「안 시든다」는 **머무는 시간**으로 낸다 — 같은 그림이 오래 남아 있으면
  // 화면에서 그대로 「남는 것」으로 읽힌다.
  const HOLD=KEEP?3.4:1.5,FADE=.6,TOT=st.vT+HOLD+FADE;
  const pu=st.u;st.u=(st.u+dt)%TOT;
  if(st.u<pu){for(const q of st.v)q.hit=0;for(const f of st.F)f.stk=0;}
  const fade=st.u>st.vT+HOLD?Math.max(0,1-(st.u-st.vT-HOLD)/FADE):1;
  // **자동 중첩.** 끝이 닿기만 하면 한 겹, 꽃이 핀 끝은 두 겹.
  for(const q of st.v){if(q.hit||st.u<q.t1)continue;
    for(const f of st.F)if(Math.hypot(q.x1-f.ox-f.kx,q.y1-f.oy-f.ky)<f.r+13*SC){
      q.hit=1;f.stk=Math.min(CAP,(f.stk||0)+(BLOOM&&q.tip?2:1));
      hitFoe(st,f,cx,cy,0,0,4*SC,"toxin");f.pv=1;break;}}
  // 중독 틱 — **약하고 길다.** 겹 수에 비례하되 한 대가 크면 안 된다.
  st.tk=(st.tk||0)+dt;
  if(st.tk>.62){st.tk=0;for(const f of st.F)if(f.stk>0){f.pv=1;
    emit(st,cx+f.ox+f.kx,cy+f.oy+f.ky,f.stk,
      {k:"toxin",sp:44*SC,r:2.4*SC,life:.5,g:-30,spikeP:.35});}}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  // 넝쿨은 **적보다 먼저** — 지면에 깔린 것이 몸 위로 올라오면 공중에 뜬다.
  for(const q of st.v){if(st.u<q.t0)continue;
    const rv=Math.min(1,(st.u-q.t0)/(q.t1-q.t0));
    const ex=q.x0+(q.x1-q.x0)*rv,ey=q.y0+(q.y1-q.y0)*rv;
    const mx=(q.x0+ex)/2,my=(q.y0+ey)/2,ax=ex-q.x0,ay=ey-q.y0;
    const al=Math.hypot(ax,ay)||1;
    celStroke(c,[[cx+q.x0,cy+q.y0],
                 [cx+mx-ay/al*q.bow*rv,cy+my+ax/al*q.bow*rv],
                 [cx+ex,cy+ey]],(7.2-q.g*1.7)*SC,"toxin",.92*fade);
    // 마디마다 가시 한 쌍 — 매끈한 선은 관이지 넝쿨이 아니다.
    if(rv>.55){const a=Math.atan2(ay,ax);
      for(const s of[-1,1])
        celSpike(c,cx+mx,cy+my,a+s*1.25,(9-q.g*1.6)*SC,3*SC,"toxin",.8*fade);}
    // L3 「안 시든다」 — 마디마다 **뿌리혹**이 앉는다. 「오래 남는다」는 시간이라
    // 정지 화면에서는 L2 와 똑같아 보였다(2026-08-11 렌더 판정) — 뿌리를 내렸다는
    // 것을 **모양**으로 말해야 표가 다섯 칸을 다 쓴다.
    if(KEEP&&rv>=1)celSplash(c,cx+q.x1,cy+q.y1,
      (3.2+.8*Math.sin(t*2+q.t0*4))*SC,6,q.t0*9+2,"toxin",.9*fade);
    // L5 각성 — 끝마다 꽃. 벌어진 채 포자를 뿜는다.
    if(BLOOM&&q.tip&&rv>=1){const b=(6.5+2.5*Math.sin(t*4+q.t0*5))*SC;
      celSplash(c,cx+q.x1,cy+q.y1,b,7,q.t0*7,"toxin",.95*fade,.72);
      if(R()<dt*7)emit(st,cx+q.x1,cy+q.y1,1,
        {k:"toxin",sp:20*SC,r:2.4*SC,life:1.2,g:-42,spikeP:.15});}}
  // 상태 표식은 **확정본을 그대로** 부른다(뒤 층 → 적 → 앞 층).
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"poison",f.pv,t,"toxin",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // 겹 수는 **적 둘레의 알갱이**로 적는다. pvMark 는 「중독이다」만 말하지
  // 「몇 겹이다」는 못 말하는데, 이 마법은 겹 수가 곧 정체라 한 줄이 더 필요하다.
  // **빈 칸도 그린다.** 찬 것만 그리면 상한이 화면에 없어, 상한이 오른 레벨과
  // 「지금 마침 덜 쌓인」 레벨이 구분되지 않는다(2026-08-11 렌더 판정).
  for(const f of st.F)for(let i=0;i<CAP;i++){const a=i/CAP*TAU-t*1.1,on=i<(f.stk||0);
    celSplash(c,cx+f.ox+f.kx+Math.cos(a)*(f.r+9*SC),
                cy+f.oy+f.ky+Math.sin(a)*(f.r+9*SC),
                (on?3.8:2.2)*SC,5,i*3+1,"toxin",(on?.95:.3)*fade);}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// ── 독 2 · 기생 寄生 ──────────────────────────────────────────────────────
// **붙는다.** 화면에서 이 마법의 위치는 「어디」가 아니라 「누구」다 — 가시가 적
// 몸에 박히면 그때부터 **적의 좌표를 따라다닌다.** 그래서 적이 흩어질수록 이펙트도
// 흩어지고, 그 흩어짐이 그대로 「이미 물렸다」로 읽힌다.
//
// 지속형이라 **피해가 나이에 비례한다** — 이 한 줄이 역 疫(지속 +60%)과 짝인
// 이유 전부다. 갓 박힌 가시는 거의 안 아프고, 오래 버틴 가시가 아프다.
mgPoisonLatch(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[72,-42,11],[-68,-26,10],[24,64,10],[-40,52,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const NB=[2,3,3,3,3][LV-1],KEEP=atL(3),DROP=KEEP?999:5.4,VEIN=atL(4),FORK=atL(5);
  st.b=st.b||[];st.fa=(st.fa||0)+dt;
  if(st.fa>1.05&&st.b.length<NB){st.fa=0;
    st.n=(st.n||0)+1;const f=st.F[st.n%st.F.length];
    st.b.push({f,fly:0,a:hash(st.n*7.7)*TAU,rr:.52+hash(st.n*3.1)*.34,age:0,tk:0});}
  for(let i=st.b.length-1;i>=0;i--){const q=st.b[i];
    q.fly=Math.min(1,q.fly+dt*3.2);
    if(q.fly<1)continue;
    q.age+=dt;q.tk+=dt;q.f.pv=1;
    if(q.tk>.5){q.tk=0;
      // **오래 붙을수록 아프다.** 지속형의 정체가 이 한 줄이다.
      hitFoe(st,q.f,cx,cy,0,0,(3+Math.min(10,q.age*1.7))*SC,"toxin");}
    if(q.age>DROP)st.b.splice(i,1);}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"poison",f.pv,t,"toxin",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  for(const q of st.b){
    const f=q.f,fx=cx+f.ox+f.kx,fy=cy+f.oy+f.ky;
    const mat=Math.min(1,q.age/3);                        // 익은 정도
    // ⚠️ **가시는 밖에서 안으로 박힌다.** 처음엔 자루를 적 몸 **위**에 놓고
    // 안쪽을 향하게 했더니(2026-08-11 렌더 판정) 창끝이 반대편으로 뚫고 나와
    // 「몸을 가로지른 막대」로 보였다. 자루를 몸 **밖**에 두고 끝만 살에
    // 들어가게 하면, 같은 도형이 그대로 「박힌 것」이 된다.
    const BL=(f.r*1.3+9*SC)*(1+.28*mat);                  // 익을수록 굵고 길다
    const tx=fx+Math.cos(q.a)*f.r*q.rr,ty=fy+Math.sin(q.a)*f.r*q.rr;   // 물린 구멍
    const bx=fx+Math.cos(q.a)*(f.r*.92+BL*.80),by=fy+Math.sin(q.a)*(f.r*.92+BL*.80);
    // 나는 동안은 몸에서 자루 자리로, 박힌 뒤엔 **적 좌표에 얹힌다.**
    const u=q.fly,x=cx+(bx-cx)*u,y=cy+(by-cy)*u;
    const ang=q.a+Math.PI+Math.sin(t*3.4+q.a*3)*.10*u;   // 박힌 채 떤다
    // L4 실뿌리 — 박힌 자리에서 돋아 적 몸을 덮어 간다. 「기생」이 그림이 되는 자리.
    if(VEIN&&u>=1)for(let k=0;k<5;k++){
      const sp=q.a+(k-2)*.46,len=f.r*(.9+1.5*mat),P=[];
      for(let s2=0;s2<=6;s2++){const w=s2/6,aa=sp+Math.sin(w*3.1+k)*.6;
        P.push([fx+Math.cos(aa)*len*w,fy+Math.sin(aa)*len*w]);}
      celStroke(c,P,3.2*SC,"toxin",.72*mat);}
    celSpike(c,x,y,ang,BL,5*SC,"toxin",.95);
    // L5 각성 — 곁가지 둘. 하나가 셋을 문다.
    if(FORK&&u>=1)for(const s of[-1,1])
      celSpike(c,x,y,ang+s*.66,BL*.72,3.4*SC,"toxin",.88);
    // 박힌 자리 — 물린 구멍이 보여야 「꽂혔다」가 된다.
    if(u>=1){celSplash(c,tx,ty,(4.4+2.2*mat)*SC,6,q.a*5,"toxin",.9);
      // L3 「안 빠진다」 — 구멍 둘레가 아물어 **고리**가 된다. 안 그러면 L2 와
      // 정지 화면에서 구분이 안 된다(2026-08-11 렌더 판정).
      if(KEEP)celHoop(c,tx,ty,(5.5+3.5*mat)*SC,1,0,2.2*SC,"toxin",.85);
      if(R()<dt*4)emit(st,tx,ty,1,{k:"toxin",sp:16*SC,r:2.2*SC,life:.9,g:40,spikeP:.1});}}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// ── 독 3 · 극독 劇毒 ──────────────────────────────────────────────────────
// **조인다.** 넷 중 유일하게 **한 마리만** 본다 — 독의 확정 모티프인 삼엽 표식이
// 겹겹이 조여들고, 다 조인 순간 그동안 쌓인 것이 한꺼번에 무너진다.
//
// ⚠️ 「한방형」이라고 즉발로 만들면 독이 아니다. 여기서 한방인 것은 **결과**이고
// 그 한 방을 만드는 데 3~4초가 걸린다 — 화면에서 「조여드는 시간」이 보이므로
// 여전히 「약하고 길다」의 문법 안에 있다. 마 痲(피해 +45%)가 이쪽과 짝인 이유도
// 같다: 겹 수가 아니라 **한 번의 크기**를 올리는 융화이기 때문이다.
//
// 기폭(起爆)과 헷갈리면 안 된다: 극독은 **자기가 쌓아 자기가** 무너뜨리는 단일
// 표적이고, 기폭은 **남이 쌓아 둔 것**을 판 전체에서 한꺼번에 소비한다.
mgPoisonBrand(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[66,-46,11],[-64,-20,10],[6,64,10]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const RING=[2,3,3,4,4][LV-1],SPAN=atL(4)?3.0:4.0,BLEED=atL(3),RESID=atL(5);
  st.i=st.i||0;st.u=(st.u||0)+dt/SPAN;st.rs=Math.max(0,(st.rs||0)-dt);
  if(st.u>=1){st.u=RESID?1/RING:0;          // L5 — 남은 표식을 한 겹 물려받는다
    const f=st.F[st.i%st.F.length];
    hitFoe(st,f,cx,cy,0,0,66*SC,"toxin");f.pv=1;
    emit(st,cx+f.ox,cy+f.oy,24,{k:"toxin",sp:210*SC,r:3.2*SC,life:.62,spikeP:.6});
    if(RESID){st.rx=f.ox;st.ry=f.oy;st.rs=1.6;}
    st.i++;}
  const tf=st.F[st.i%st.F.length];
  const tx=cx+tf.ox+tf.kx,ty=cy+tf.oy+tf.ky;
  st.tk=(st.tk||0)+dt;
  if(st.tk>.55){st.tk=0;tf.pv=1;
    hitFoe(st,tf,cx,cy,0,0,4*SC,"toxin");
    // L3 — 조이는 내내 독이 샌다. 표적 곁에 있으면 옅게 묻는다.
    if(BLEED)for(const f of st.F)if(f!==tf&&Math.hypot(f.ox-tf.ox,f.oy-tf.oy)<74*SC){
      hitFoe(st,f,cx,cy,0,0,3*SC,"toxin");f.pv=1;}}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"poison",f.pv,t,"toxin",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // L5 잔류 표식 — 무너진 자리에 남아 도는 것. 「다음도 이미 시작됐다」의 표시.
  if(RESID&&st.rs>0){const a=st.rs/1.6;
    for(let k=0;k<3;k++)
      celSpike(c,cx+st.rx,cy+st.ry,k/3*TAU+t*1.6,15*a*SC,5*a*SC,"toxin",a*.8);}
  // 표식 — 고리 하나가 「한 겹」. **먼저 온 겹이 더 깊이** 들어가 겹겹이 쌓인다.
  for(let k=0;k<RING;k++){
    const s0=k/RING,s1=(k+1)/RING;
    if(st.u<s0){
      // **아직 안 온 겹도 그린다**(옅게, 바깥에 대기). 찬 것만 그리면 「겹이
      // 몇까지 가나」가 주기의 끝에서만 보여, 정지 화면에서 L1 과 L4 가 같아
      // 보인다(2026-08-11 렌더 판정) — 겹 표시와 같은 「빈 칸」 어휘다.
      celHoop(c,tx,ty,(60+k*3.4)*SC,1,0,1.6*SC,"toxin",.22);continue;}
    const p=Math.min(1,(st.u-s0)/(s1-s0));
    // ⚠️ 안쪽 반지름을 19 로 두었더니 삼엽이 서로 겹쳐 **초록 덩어리**가 됐다
    // (2026-08-11 렌더 판정). 25 부터 시작해 겹마다 4.2 씩 벌리면, 겹이
    // 몇인지가 정지 화면에서 세어진다 — 이 마법은 겹 수가 곧 정체다.
    const rr=(58-(58-25-k*4.2)*ease(p))*SC;
    const al=.42+.58*p;
    for(let j=0;j<3;j++){const a=j/3*TAU+t*(1.5-k*.22)+k*.6;   // 날 셋이 도는 삼엽
      celSpike(c,tx+Math.cos(a)*rr,ty+Math.sin(a)*rr,a+Math.PI/2,
        rr*.52,rr*.17,"toxin",al);}
    celHoop(c,tx,ty,rr,1,0,(2.4+1.6*p)*SC,"toxin",al*.72);}
  // 다 조인 순간이 보이게 — 마지막 고리가 닿으면 코어가 밝아진다.
  const glow=Math.pow(st.u,4);
  celSplash(c,tx,ty,(7+8*glow)*SC,8,3,"toxin",.55+.45*glow);
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// ── 독 4 · 감염 感染 ──────────────────────────────────────────────────────
// **옮는다.** 아홉 중 유일하게 **발원지가 플레이어가 아니다** — 첫 하나만 찍어
// 주면 그 뒤로는 감염된 적의 **몸에서** 파문이 나가 옆 적을 물들인다. 화면에서
// 플레이어는 가만히 있는데 판이 혼자 번져 간다.
//
// 뇌광(연쇄)과 헷갈리면 안 된다: 뇌광은 **내가 쏜 것**이 적을 건너뛰는 즉발
// 지그재그다. 여기는 쏘는 것 자체가 없다. 장 瘴(독·바람 각 +20%)이 짝인 것도
// 「얕게 넓게」가 이 마법의 성격 그대로이기 때문이다.
mgPoisonSpread(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  // ⚠️ 적을 **이웃까지 닿는 사슬**로 놓는다. 흩뿌려 두었더니 L1 반경으로는
  // 아무 데도 안 닿아 「첫 하나만 감염된 채 영영 멈춘」 칸이 나왔다(2026-08-11
  // 렌더 판정). 옮는 마법은 옮을 상대가 사거리 안에 있어야 시안이 성립한다.
  st.F=st.F||mkFoes([[68,-16,10],[26,-66,10],[-40,-58,9],[-70,6,10],[-26,64,9],[42,56,10]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const RR=(atL(2)?96:78)*SC,WAVE=atL(3)?2:1,GHOST=atL(4),SYNC=atL(5),PER=1.25;
  if(!st.inf||st.ik!==LV){st.ik=LV;st.inf=st.F.map(()=>-1);st.g=[];st.rest=0;st.bang=0;}
  if(st.inf.every(v=>v<0))st.inf[0]=0;      // 씨앗 하나 — 그 뒤로는 아무도 안 건드린다
  for(let i=0;i<st.inf.length;i++)if(st.inf[i]>=0)st.inf[i]+=dt;
  for(const g of st.g)g.age+=dt;
  // 파문이 지나가면 옮는다. **거리와 시간이 규칙의 전부**라 화면과 판정이 같다.
  const wave=(age)=>{const out=[];
    for(let w=0;w<WAVE;w++)out.push(((age*(1+w*.55))%PER)/PER);
    return out;};
  const catchUp=(sx,sy,age)=>{
    for(const ph of wave(age)){const r=RR*ph;
      for(let j=0;j<st.F.length;j++){if(st.inf[j]>=0)continue;
        if(Math.abs(Math.hypot(st.F[j].ox-sx,st.F[j].oy-sy)-r)<9*SC)st.inf[j]=0;}}};
  for(let i=0;i<st.F.length;i++)if(st.inf[i]>=0)catchUp(st.F[i].ox,st.F[i].oy,st.inf[i]);
  for(const g of st.g)catchUp(g.x,g.y,g.age);
  // L4 — 발원지가 자리에 남는다. 적이 없어져도 그 자리가 계속 퍼뜨린다.
  if(GHOST&&st.g.length<2)for(let i=0;i<st.F.length;i++)
    if(st.inf[i]>2.4&&!st.F[i].gh){st.F[i].gh=1;
      st.g.push({x:st.F[i].ox,y:st.F[i].oy,age:0});}
  st.tk=(st.tk||0)+dt;
  if(st.tk>.55){st.tk=0;for(let i=0;i<st.F.length;i++)if(st.inf[i]>=0)
    hitFoe(st,st.F[i],cx,cy,0,0,3*SC,"toxin");}
  for(let i=0;i<st.F.length;i++)if(st.inf[i]>=0)st.F[i].pv=1;
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  // L5 각성 — **전부** 감염되는 순간 동시에 터진다. 광역형의 보상.
  const all=st.inf.every(v=>v>=0);
  if(SYNC&&all&&!st.bang){st.bang=1;st.flash=1.2;
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
      hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,52*SC,"toxin");
      emit(st,cx+f.ox,cy+f.oy,12,{k:"toxin",sp:190*SC,r:3*SC,life:.55,spikeP:.6});}}
  st.flash=Math.max(0,(st.flash||0)-dt);
  // 다 번지면 잠시 두었다 판을 씻는다 — 시안이 한 바퀴를 보여야 한다.
  if(all)st.rest+=dt;
  if(st.rest>(SYNC?2.0:1.6)){st.rest=0;st.bang=0;st.g=[];
    st.inf=st.F.map(()=>-1);for(const f of st.F)f.gh=0;}
  stepP(st,dt);
  // 파문을 **적보다 먼저** 그린다 — 적 위를 덮으면 「적에서 나간 것」으로 안 읽힌다.
  const ring=(sx,sy,age,mul)=>{for(const ph of wave(age))
    celHoop(c,cx+sx,cy+sy,Math.max(2*SC,RR*ph),.62,0,(4.2*(1-ph)+1.2)*SC,
      "toxin",(1-ph)*.8*mul);};
  for(let i=0;i<st.F.length;i++)if(st.inf[i]>=0)ring(st.F[i].ox,st.F[i].oy,st.inf[i],1);
  for(const g of st.g){ring(g.x,g.y,g.age,.8);
    // 발원지 표식 — 적이 아니라 **자리**라는 것이 보여야 한다. 작게 그렸더니
    // L3 과 구분이 안 됐다(2026-08-11 렌더 판정) — 고리를 둘러 「여기가 샘이다」로.
    celHoop(c,cx+g.x,cy+g.y,14*SC,.62,0,3*SC,"toxin",.8);
    for(let k=0;k<3;k++)
      celSpike(c,cx+g.x,cy+g.y,k/3*TAU-t*1.3,19*SC,6*SC,"toxin",.9);}
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"poison",f.pv,t,"toxin",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // L5 각성의 동시 폭발은 **한 프레임이면 아무도 못 본다.** 적마다 퍼져 나가는
  // 고리를 1.2초 남겨, 한 주기의 절반쯤에서 「전부가 같이 갔다」가 보이게 한다.
  if(st.flash>0){const g=st.flash/1.2;
    for(const f of st.F)
      celHoop(c,cx+f.ox+f.kx,cy+f.oy+f.ky,Math.max(2*SC,f.r*(1+3.4*(1-g))),
        1,0,(6*g+1)*SC,"toxin",g*.95);
    c.save();c.globalCompositeOperation="lighter";
    c.fillStyle=A(TONE.toxin[1],.14*g);c.fillRect(0,0,W,H);c.restore();}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// ── 창작 1 · 기폭 起爆 · 마 痲(뇌+독) ─────────────────────────────────────
// **소비한다.** 아홉 중 유일하게 **자기가 쌓은 것을 자기가 안 쓴다** — 적 몸에
// 이미 얹혀 있는 겹을 **태워 즉발 피해로 바꾼다.** 그래서 혼자 쓰면 미지근하고,
// 독 넷 위에 얹으면 그 넷이 전부 달라진다.
//
// 마 痲 인 이유: `FVWHY` 가 "**전기는 신경을 타고 독은 신경을 끊는다** — 둘이
// 같은 길을 쓴다" 라고 못박아 뒀다. 신경을 타고 들어가 **한꺼번에 끊는 것**이
// 기폭이고, 마의 확정 패시브가 저주(받는 피해 증가)라 터질 때의 크기까지 맞는다.
//
// ⚠️ 「끌어당김」 안을 버리고 이 자리를 만들었다 — `MANIDESC` 의 어둠(블랙홀)·
// 바람·뢰명이 이미 빨아들이는 층을 셋이나 쓰고 있어서, 마법에 하나 더 두면 그
// 축만 넷이 된다. 아무도 안 쓰는 축으로 가는 편이 아홉 전체를 살린다.
mgNovaDetonate(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[74,-44,11],[-70,-28,10],[22,68,10],[-38,58,9],[68,34,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const CAP=[3,4,4,4,4][LV-1],PER=atL(4)?2.6:4.0,PRIME=atL(3),KEEP1=atL(5);
  st.ac=(st.ac||0)+dt;st.st=(st.st||0)+dt;
  // 스스로도 **얕게** 쌓는다 — 안 그러면 이 마법 혼자서는 아무 그림이 없다.
  // 게임에서는 여기 얹히는 겹의 대부분이 독 넷에서 온다.
  for(const f of st.F)if(f.pr>0)f.pr-=dt;
  if(st.st>.72){st.st=0;
    for(const f of st.F){f.stk=Math.min(CAP,(f.stk||0)+((PRIME&&f.pr>0)?2:1));f.pv=1;}}
  if(st.ac>PER){st.ac=0;
    for(const f of st.F){const n=f.stk||0;if(!n)continue;
      const d=Math.hypot(f.ox,f.oy)||1;
      // **겹이 곧 피해다.** 겹을 안 쌓아 두면 이 마법은 아무것도 안 한다.
      hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,(14+16*n)*SC,"numb");
      emit(st,cx+f.ox,cy+f.oy,5+4*n,
        {k:"numb",sp:(120+40*n)*SC,r:3*SC,life:.5,spikeP:.6});
      // L5 각성 — 상한까지 찬 적은 **터져도 한 겹이 남는다.** 연쇄가 안 끊긴다.
      f.stk=(KEEP1&&n>=CAP)?1:0;
      if(PRIME)f.pr=1.1;}                 // L3 — 잠깐 예민해져 두 배로 쌓인다
    st.bo=.5;}
  st.bo=Math.max(0,(st.bo||0)-dt);
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  // 저주 표식은 **몸을 감아 돈다** — 뒤 층이 있는 유일한 표식이라 순서가 중요하다.
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"curse",f.pv,t,"numb",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // 겹 — 적 위에 **세어지는 것**으로 얹는다. 몇 겹인지 안 보이면 기폭은 도박이 된다.
  // **빈 칸도 그린다** — 상한이 화면에 있어야 「지금 덜 쌓인 것」과 「상한이
  // 낮은 것」이 갈린다(2026-08-11 렌더 판정). 만연의 겹 표시와 같은 어휘다.
  for(const f of st.F){const n=f.stk||0,x=cx+f.ox+f.kx,y=cy+f.oy+f.ky;
    for(let i=0;i<CAP;i++){const a=-Math.PI/2+(i-(CAP-1)/2)*.5,on=i<n;
      const px=x+Math.cos(a)*(f.r+15*SC),py=y+Math.sin(a)*(f.r+15*SC);
      celSplash(c,px,py,(on?4.6:2.6)*SC,5,i*3+2,"numb",on?.95:.28);
      // L5 각성 — **첫 칸은 절대 안 빈다.** 「터져도 한 겹 남는다」를 칸 자체에
      // 새겨 두면 폭발 순간을 못 본 정지 화면에서도 L4 와 갈린다.
      if(KEEP1&&i===0)celHoop(c,px,py,7.5*SC,1,0,2*SC,"numb",.85);}
    // L3 「예민해졌다」 — 두 배로 쌓이는 동안 몸이 달아오른다. 옅으면 L2 와 같다.
    if(f.pr>0){const g2=f.pr/1.1;
      celHoop(c,x,y,f.r*1.75,1,0,3.2*SC,"numb",.85*g2);
      for(let k=0;k<3;k++)
        celSpike(c,x,y,k/3*TAU+t*2.2,f.r*2.2,4*SC,"numb",.7*g2);}}
  // 심지 — **다음 기폭까지 얼마나 남았나.** 적 쪽만 그리면 이 마법은 화면에
  // 자기 몸이 없어 「저절로 터지는 판」으로 읽힌다(2026-08-11 렌더 판정).
  // 파문처럼 **나가는 링**을 두면 축이 겹치므로, 몸에 붙은 **세는 것**으로 둔다 —
  // 적 위의 겹과 같은 어휘라 둘이 한 벌로 읽힌다.
  // 심지는 L4 에서 **두 줄이 된다** — 주기가 4.0 → 2.6s 로 줄어드는 것은 숫자라
  // 정지 화면에 안 남는다(2026-08-11 렌더 판정). 「심지가 둘이라 두 배로 빨리
  // 탄다」로 옮기면 같은 규칙이 셀 수 있는 모양이 된다.
  {const fu=st.ac/PER,FUSE=atL(4)?2:1;
    for(let r2=0;r2<FUSE;r2++)for(let i=0;i<6;i++){
      const a=i/6*TAU-Math.PI/2+r2*.5,on=fu>=(i+r2*.5)/6;
      celSplash(c,cx+Math.cos(a)*(30-r2*9)*SC,cy+Math.sin(a)*(30-r2*9)*SC,
        (on?4:2.4)*SC,5,i*3+1+r2*7,"numb",on?.9:.28);}}
  // 기폭 순간 — **판 전체가 동시에** 간다. 하나씩 터지면 그건 연쇄지 기폭이 아니다.
  if(st.bo>0){const g=st.bo/.5;
    for(const f of st.F){const x=cx+f.ox+f.kx,y=cy+f.oy+f.ky;
      celHoop(c,x,y,Math.max(2*SC,f.r*(1+2.4*(1-g))),1,0,(7*g+1)*SC,"numb",g*.9);
      celSplash(c,x,y,(9+13*g)*SC,8,3,"numb",g);}
    c.save();c.globalCompositeOperation="lighter";
    c.fillStyle=A(TONE.numb[1],.13*g);c.fillRect(0,0,W,H);c.restore();}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// ── 창작 2 · 공명 共鳴 · 뢰명 雷鳴(뇌+바람) ───────────────────────────────
// **겹친다.** 뢰명은 `FVWHY` 가 "열 중 유일하게 **들리는 것**"이라 못박은 속성이고,
// 소리의 문법은 파(波)가 아니라 **간섭**이다 — 파 하나는 아무 일도 안 하고,
// **두 파가 만나는 자리**에서만 마디가 선다.
//
// 파문(pulse)과 절대 안 겹친다: 파문은 발원이 하나라 교점이 아예 없고 링 그
// 자체가 판정이다. 여기는 **링에 판정이 없고 교점에만** 있어서, 종을 어디에
// 두느냐가 곧 어디를 때리느냐가 된다. 그래서 링을 굵게 그리면 안 된다 —
// 굵으면 그게 때리는 줄 안다.
mgNovaChime(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[62,-58,11],[-66,-40,10],[10,74,10],[-24,-72,9],[72,26,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  // ⚠️ 종을 64 에 두고 파를 96 까지 키웠더니 링이 칸 밖으로 나가 **교점이 화면
  // 밖에서 생겼다**(2026-08-11 렌더 판정). 이 마법은 교점이 전부라 교점이 안
  // 보이면 아무것도 안 보이는 것과 같다 — 둘 다 줄여 안으로 들인다.
  const NB=[2,3,3,4,4][LV-1],SECOND=atL(3),TRIPLE=atL(5),RMAX=76*SC,RATE=.42;
  const B=[];
  for(let i=0;i<NB;i++){const a=i/NB*TAU-Math.PI/2+t*.13;
    B.push([cx+Math.cos(a)*52*SC,cy+Math.sin(a)*52*SC*.86,(t*RATE+i/NB)%1]);}
  // 원 두 개의 교점 — 마디가 서는 자리. 여기 말고는 아무 데도 안 아프다.
  const nodes=[];
  for(let i=0;i<NB;i++)for(let j=i+1;j<NB;j++){
    const p=B[i],q=B[j],r1=p[2]*RMAX,r2=q[2]*RMAX;
    const dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);
    if(d<1e-3||d>r1+r2||d<Math.abs(r1-r2))continue;
    const aa=(r1*r1-r2*r2+d*d)/(2*d),hh=Math.sqrt(Math.max(0,r1*r1-aa*aa));
    const xm=p[0]+aa*dx/d,ym=p[1]+aa*dy/d;
    const w=Math.min(1,(1-Math.abs(p[2]-q[2]))*1.2);   // 위상이 가까울수록 세다
    for(const s of[-1,1])nodes.push({x:xm+s*hh*dy/d,y:ym-s*hh*dx/d,w,tri:0});}
  // L5 각성 — **세 파가 한 점**에서 만나면 대마디. 교점이 제3의 링 위에 있는가.
  if(TRIPLE)for(const n of nodes)for(let k=0;k<NB;k++){
    const q=B[k];
    if(Math.abs(Math.hypot(n.x-q[0],n.y-q[1])-q[2]*RMAX)<7*SC){n.tri=1;break;}}
  st.tk=(st.tk||0)+dt;
  if(st.tk>.16){st.tk=0;
    for(const n of nodes)for(const f of st.F)
      if(Math.hypot(cx+f.ox+f.kx-n.x,cy+f.oy+f.ky-n.y)<f.r+16*SC){
        hitFoe(st,f,cx,cy,0,0,(n.tri?26:8)*SC,"thunder");f.pv=1;}}
  // L3 — 마디가 선 자리에서 **2차 파**가 하나 더 난다. 간섭이 간섭을 낳는다.
  st.nd=st.nd||[];st.sa=(st.sa||0)+dt;
  if(SECOND&&st.sa>.24){st.sa=0;
    for(const n of nodes)if(n.w>.55&&st.nd.length<14)st.nd.push({x:n.x,y:n.y,l:0});}
  for(let i=st.nd.length-1;i>=0;i--){st.nd[i].l+=dt;if(st.nd[i].l>.55)st.nd.splice(i,1);}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"silence",f.pv,t,"thunder",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  // 본파 — **판정이 없으므로 얇다.**
  for(const q of B)
    celHoop(c,q[0],q[1],Math.max(2*SC,q[2]*RMAX),.9,0,(3.2*(1-q[2])+1)*SC,
      "thunder",(1-q[2])*.62);
  for(const n of st.nd){const u=n.l/.55;
    celHoop(c,n.x,n.y,(4+u*24)*SC,.9,0,(4.2*(1-u)+1.2)*SC,"thunder",(1-u)*1.0);}
  // 마디 — 여기만 밝다. 대마디는 한 단 크고 창이 선다.
  for(const n of nodes){
    celSplash(c,n.x,n.y,(n.tri?15:7)*(.6+.4*n.w)*SC,8,(n.x+n.y)|0,"thunder",.55+.45*n.w);
    if(n.tri)for(let k=0;k<4;k++)
      celSpike(c,n.x,n.y,k/4*TAU+t*2.4,22*SC,5*SC,"thunder",.85);}
  // 종 — 파의 출처. 없으면 링이 어디서 나왔는지 안 읽힌다.
  for(const q of B){celHoop(c,q[0],q[1],11*SC,.72,0,4*SC,"thunder",.9);
    celSplash(c,q[0],q[1],(5.5+2.5*(1-q[2]))*SC,6,3,"thunder",.95);}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// ── 창작 3 · 분열 分裂 · 플라즈마 漿(염+뇌) ───────────────────────────────
// **배로 는다.** 플라즈마는 `FVWHY` 가 "물질의 **제4상태**"라 한 것이라 덩어리로
// 안 있고 계속 쪼개진다. 축은 **세대**다: 부모가 사라지고 자식만 남으므로 어느
// 순간에도 화면에는 **한 세대만** 있고, 그래서 뻗어 나가는 만연(넝쿨망)과 절대
// 안 겹친다 — 만연은 남아서 구조가 되고 분열은 안 남고 개수가 된다.
//
// 확정 패시브가 분해(도트 중첩 상한 +1)라 독 넷과 같은 판에 서도 서로를 돕는다.
mgNovaSplit(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[58,-46,11],[-62,-28,10],[16,64,10],[-26,-60,9],[66,26,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  // L5 각성은 **갈래 수**로 판다(둘 → 셋). 관통은 독의 기본 공격 축이라 안 쓴다.
  const GEN=[2,3,3,4,4][LV-1],WAY=atL(5)?3:2,SPLITFX=atL(3),STEP=.40;
  // ⚠️ **사거리를 고정하고 세대만 늘린다.** 속도를 고정했더니 세대가 늘수록
  // 더 멀리 날아가 L4·L5 의 막내가 칸 밖으로 나갔다(2026-08-11 렌더 판정).
  // 축은 「몇 번 쪼개며 가느냐」이지 「얼마나 멀리 가느냐」가 아니다 — 후자는
  // 이미 레이저·유도탄이 쓰는 축이다.
  const REACH=88*SC,SP0=REACH/(STEP*((Math.pow(1.05,GEN)-1)/.05));
  st.b=st.b||[];st.fx=st.fx||[];st.ac=(st.ac||0)+dt;
  // ⚠️ 주기에 **빈 구간**을 두면 안 된다 — 처음엔 STEP*(GEN+1)+.5 라 화면이
  // 절반은 텅 비어 있었고, 그러면 「배로 는다」를 볼 기회가 반으로 준다
  // (2026-08-11 렌더 판정). 막내가 사라지면 곧바로 다음 씨앗을 낳는다.
  if(st.ac>STEP*GEN+.42){st.ac=0;st.b.length=0;st.seq=(st.seq||0)+1;
    st.b.push({x:0,y:0,a:hash(st.seq*5.7)*TAU,sp:SP0,g:0,ttl:STEP});}
  for(let i=st.b.length-1;i>=0;i--){const q=st.b[i];
    q.x+=Math.cos(q.a)*q.sp*dt;q.y+=Math.sin(q.a)*q.sp*dt;q.ttl-=dt;
    for(const f of st.F)if(!q.hit&&Math.hypot(q.x-f.ox-f.kx,q.y-f.oy-f.ky)<f.r+8*SC){
      q.hit=1;hitFoe(st,f,cx,cy,Math.cos(q.a),Math.sin(q.a),17*SC,"blast");f.pv=1;}
    if(q.ttl<=0){st.b.splice(i,1);
      const last=!(q.g+1<GEN&&st.b.length<40);
      // **쪼개진 자리는 항상 남는다**(0.55s 동안 옅어지는 고리). 부모가 사라지는
      // 문법은 그대로 두되, 마디 자국이 잠깐 남아야 「하나가 여기서 둘이 됐다」가
      // 정지 화면에서도 읽힌다. 고리는 사그라들므로 **구조가 아니다** —
      // 만연의 「남는 넝쿨」과 갈리는 선이 여기다.
      if(!last)st.fx.push({x:q.x,y:q.y,l:0,dmg:SPLITFX?1:0});
      if(!last)for(let s=0;s<WAY;s++)
        st.b.push({x:q.x,y:q.y,a:q.a+(s-(WAY-1)/2)*.46,
          sp:q.sp*1.05,g:q.g+1,ttl:STEP});
      else emit(st,cx+q.x,cy+q.y,7,{k:"blast",sp:130*SC,r:2.8*SC,life:.45,spikeP:.6});}}
  // L3 — 쪼개지는 그 자리도 **터진다**(피해가 붙는다). 고리는 전 레벨 공통이고
  // 레벨이 파는 것은 「그 고리가 아프냐」다.
  // 마디 자국은 **1초** 간다. 0.55s 로는 정지 화면에 한 개만 남아 「몇 번
  // 쪼개졌나」가 안 보였다(2026-08-11 렌더 판정). 한 주기(1.2~2.0s)의 절반쯤
  // 남으면 마디가 여럿 겹쳐 세대 수가 세어지고, 그래도 **사그라들므로
  // 구조가 아니다** — 만연의 「남는 넝쿨」과 갈리는 선은 그대로다.
  for(let i=st.fx.length-1;i>=0;i--){const q=st.fx[i];q.l+=dt;
    if(q.l>1.0){st.fx.splice(i,1);continue;}
    if(q.dmg&&q.l<dt*1.5)for(const f of st.F)
      if(Math.hypot(q.x-f.ox-f.kx,q.y-f.oy-f.ky)<f.r+22*SC){
        hitFoe(st,f,cx,cy,0,0,9*SC,"blast");f.pv=1;}}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"decomp",f.pv,t,"blast",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  for(const q of st.fx){const u=1-q.l/1.0,e=Math.min(1,q.l/.3);
    celHoop(c,cx+q.x,cy+q.y,(6+(q.dmg?26:13)*e)*SC,1,0,
      ((q.dmg?6:3)*u+1)*SC,"blast",u*(q.dmg?.9:.6));}
  for(const q of st.b){
    // 세대가 내려갈수록 작아진다 — 「쪼개졌다」는 크기로도 말해야 한다.
    const sc=(1-q.g*.14)*SC;
    celRound(c,cx+q.x,cy+q.y,q.a,32*sc,9*sc,"blast",.98,
      Math.min(1,(STEP-q.ttl)*6));}
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);},

// ── 창작 4 · 오행 五行 · 백광 白光 ────────────────────────────────────────
// **돌아간다.** 백광의 정체가 `FVNAME` 그대로 "다섯을 **다 거친** 것"이므로, 그
// 정체를 그대로 규칙으로 만든다 — 이 마법은 염→빙→뢰→풍→독을 **차례로** 두르고,
// 한 바퀴를 다 돌아야 그제야 흰빛으로 터진다. 한 바퀴가 안 돌면 백광은 안 나온다.
//
// 다른 여덟과 안 겹치는 이유: 이건 **모양의 축이 아니라 시간의 축**이다. 화면의
// 도형은 매 순간 그 속성의 **확정 모티프**이고(새로 그리면 시안이 두 벌이 된다),
// 개성은 「지금 무슨 색 차례인가」에서 나온다 — 아홉 중 유일하게 색이 계속 바뀐다.
mgNovaCycle(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[66,-54,11],[-68,-36,10],[14,70,10],[-28,-68,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const CYL=["ember","frost","volt","gale","toxin"];
  const N=[3,4,5,5,5][LV-1],NOVA=atL(3),LAPS=atL(4)?2:1,FIN=atL(5);
  const PH=.52,SPAN=N*LAPS*PH,TOT=SPAN+(NOVA?.9:.15);
  const pu=st.u||0;st.u=(pu+dt)%TOT;
  const inCyc=st.u<SPAN;
  const idx=inCyc?Math.floor(st.u/PH)%N:0;
  // 속성이 바뀌는 순간마다 그 속성으로 문다 — 색이 곧 피해의 종류다.
  if(inCyc&&st.pi!==idx){st.pi=idx;
    for(const f of st.F)if(Math.hypot(f.ox,f.oy)<104*SC)
      hitFoe(st,f,cx,cy,0,0,9*SC,CYL[idx]);}
  if(!inCyc)st.pi=-1;
  // 백광 — 한 바퀴가 끝나야 나온다. 백광은 상태를 안 걸고 **탄이 세진다**
  // (`PASSIVE.white === "pierceAll"`)이라 표식이 없는 것이 맞다.
  const nv=(NOVA&&!inCyc)?(st.u-SPAN)/(TOT-SPAN):0;
  if(NOVA&&!inCyc&&pu<SPAN){
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
      hitFoe(st,f,cx,cy,f.ox/d,f.oy/d,58*SC,"white");}
    emit(st,cx,cy,26,{k:"white",sp:300*SC,r:3.2*SC,life:.6,spikeP:.7});}
  stepP(st,dt);drawFoes(c,t,cx,cy,st.F);
  // 속성 하나의 서명 — **확정 모티프를 그대로** 쓴다.
  const sig=(tn,rr,al)=>{
    if(al<=.02)return;
    if(tn==="ember")for(let i=0;i<8;i++){const a=i/8*TAU+t*.5;      // 태양 문양
      celSpike(c,cx+Math.cos(a)*rr*.62,cy+Math.sin(a)*rr*.62,a,rr*.5,rr*.15,tn,al);}
    else if(tn==="frost")for(let i=0;i<6;i++){const a=i/6*TAU+t*.3; // 수지상 결정
      celStroke(c,[[cx,cy],[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]],4*SC,tn,al);
      for(const s of[-1,1])celStroke(c,
        [[cx+Math.cos(a)*rr*.55,cy+Math.sin(a)*rr*.55],
         [cx+Math.cos(a+s*.7)*rr*.85,cy+Math.sin(a+s*.7)*rr*.85]],2.6*SC,tn,al*.85);}
    else if(tn==="volt"){const sd=(t*10)|0;        // 경로가 매번 다시 굴려진다
      for(let i=0;i<6;i++){const a0=i/6*TAU+hash(sd*3.1+i)*.7,P=[[cx,cy]];
        for(let k=1;k<=4;k++){const q=k/4,aa=a0+(hash(sd+i*3.3+k*1.7)-.5)*.9*q;
          P.push([cx+Math.cos(aa)*rr*q,cy+Math.sin(aa)*rr*q]);}
        celStroke(c,P,3.4*SC,tn,al);}}
    else if(tn==="gale")for(let i=0;i<3;i++){       // 기운 고리가 떠난다
      const ph=(t*.8+i/3)%1;
      celHoop(c,cx,cy,Math.max(2*SC,rr*(.5+ph*.7)),.72,t*.4+i,
        (4.4*(1-ph)+1)*SC,tn,al*(1-ph));}
    else for(let i=0;i<3;i++){const a=i/3*TAU+t*1.7;  // 붙어서 도는 삼엽
      celSpike(c,cx+Math.cos(a)*rr*.7,cy+Math.sin(a)*rr*.7,a+Math.PI/2,
        rr*.42,rr*.14,tn,al);}};
  if(inCyc){
    const p=(st.u%PH)/PH,al=Math.min(1,Math.min(p,1-p)*6+.35);
    sig(CYL[idx],62*SC,al);
    celHoop(c,cx,cy,74*SC,1,0,3.4*SC,CYL[idx],al*.7);
    // 지나온 속성이 **점으로 남는다** — 몇 개나 돌았는지가 화면에 있어야
    // 「한 바퀴」라는 규칙이 보인다.
    for(let k=0;k<N;k++){const a=k/N*TAU-Math.PI/2;
      const on=(Math.floor(st.u/PH)%N)>=k;
      // **몇 칸짜리 바퀴인가**가 이 마법의 레벨이다 — 점이 작으면 3칸과 5칸이
      // 안 세어진다(2026-08-11 렌더 판정). 점 자체가 레벨 표시라 크게 둔다.
      celSplash(c,cx+Math.cos(a)*88*SC,cy+Math.sin(a)*88*SC,
        (on?9:4.6)*SC,6,k*3+1,CYL[k],on?1:.34);}}
  // L5 각성 — 마지막에 다섯이 **겹친다.** 그 위로 흰 파동 셋.
  if(FIN&&nv>0&&nv<.5){const q=nv/.5;
    for(let k=0;k<5;k++)sig(CYL[k],(48+k*11)*SC,(1-q)*.75);}
  if(nv>0){const w=FIN?3:1;
    for(let k=0;k<w;k++){const u=nv*1.4-k*.18;
      if(u<=0||u>=1)continue;
      celHoop(c,cx,cy,(10+u*104)*SC,1,0,(15*(1-u)+2)*SC,"white",(1-u)*.9);}
    celSplash(c,cx,cy,(20+40*(1-nv))*SC,10,3,"white",1-nv*.7);}
  drawP(c,st);hero(c,t,cx,cy,nv>0?"white":"gold",SC*(1+nv*.4));},

// ── 창작 5 · 암전 暗轉 · 어둠 影 ──────────────────────────────────────────
// **끈다.** 어둠은 `TONE` 이 "유일하게 어두워지는 속성"이라 못박은 것이고, 빛이
// 주제인 이 게임에서 **화면이 어두워지는 마법**은 이것 하나뿐이라야 한다. 나머지
// 여덟이 전부 더하는 동안 이것만 뺀다 — 그 하나가 축이다.
//
// 어둠 속에서 적은 **테두리만** 남는다(어둠의 확정 장치: 속은 어둡고 림만 밝다).
// 그래서 이 마법이 켜져 있는 동안 화면이 오히려 읽기 쉬워지고, 그것이 보상이다.
//
// ⚠️ 개안(flare) L3 의 어두워짐과 다르다: 그쪽은 흰 폭발을 돋보이게 하는 한
// 프레임짜리 대비 장치이고, 여기는 **어두운 동안에만 문다.**
// ⚠️ 실명은 레벨 특전이 **아니다** — `PASSIVE.shade === "blind"` 라 어둠이면
// 처음부터 걸린다. 레벨로 파는 것은 「어둠에 든 적이 걷힌 뒤에도 보이는 것」이다.
mgNovaDusk(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  st.F=st.F||mkFoes([[72,-48,11],[-70,-30,10],[20,68,10],[-34,60,9],[62,42,9]]
    .map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  stepFoes(st.F,dt);
  const RMAX=(atL(2)?116:80)*SC,SEEN=atL(3),DEEP=atL(4),COLL=atL(5);
  const CLEAR=26*SC,u=saw(t,3.2);
  // 퍼짐 → 유지 → 걷힘. 걷히는 동안 L5 는 안으로 무너진다.
  const open=u<.22?ease(u/.22):1,shut=u>.78?(u-.78)/.22:0;
  const f0=open*(1-shut);
  const RR=RMAX*(COLL?open*(1-shut*.72):open*(1-shut));
  st.tk=(st.tk||0)+dt;
  if(st.tk>.35&&f0>.3){st.tk=0;
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy);
      if(d>CLEAR&&d<RR){hitFoe(st,f,cx,cy,0,0,(DEEP&&d<RR*.55?11:5)*SC,"shade");
        f.pv=1;f.seen=1;}}}                 // L3 — 한 번 든 적은 표가 남는다
  // L5 각성 — 걷힐 때 어둠이 안으로 무너지며 한 번 더 문다.
  if(COLL&&shut>.5&&!st.bit){st.bit=1;
    for(const f of st.F){const d=Math.hypot(f.ox,f.oy)||1;
      if(d<RMAX){hitFoe(st,f,cx,cy,-f.ox/d,-f.oy/d,44*SC,"shade");f.pv=1;}}}
  if(u<.5)st.bit=0;
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  stepP(st,dt);
  const mark=(L)=>{for(const f of st.F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,"blind",f.pv,t,"shade",SC,L);};
  mark(0);drawFoes(c,t,cx,cy,st.F);mark(1);
  drawP(c,st);hero(c,t,cx,cy,"gold",SC);
  // ── 여기부터가 이 마법이다: **덮어서 지운다.** ──
  // 가산이 아니라 source-over 로 덮는 것이 요점 — 더하면 밝아지고, 그러면 어둠이
  // 아니라 안개가 된다.
  if(f0>.02){
    const RD=Math.max(8*SC,RR),a0=.97*f0;
    const g=c.createRadialGradient(cx,cy,0,cx,cy,RD);
    const s1=Math.min(.96,CLEAR/RD),s2=Math.min(.99,(CLEAR+16*SC)/RD);
    g.addColorStop(0,"rgba(3,1,5,0)");
    g.addColorStop(s1,"rgba(3,1,5,0)");
    g.addColorStop(Math.max(s1,s2),`rgba(3,1,5,${a0})`);
    g.addColorStop(1,`rgba(3,1,5,${a0})`);
    c.fillStyle=g;c.fillRect(0,0,W,H);
    // L4 심어둠 — 안쪽에 한 겹 더. 「거기선 두 배로 문다」가 눈에 보여야 한다.
    if(DEEP){const RD2=Math.max(8*SC,RR*.55);
      const g2=c.createRadialGradient(cx,cy,0,cx,cy,RD2);
      const t1=Math.min(.9,(CLEAR+18*SC)/RD2);
      g2.addColorStop(0,"rgba(3,1,5,0)");
      g2.addColorStop(t1,"rgba(3,1,5,0)");
      g2.addColorStop(1,`rgba(3,1,5,${.72*f0})`);
      c.fillStyle=g2;c.beginPath();c.arc(cx,cy,RD2,0,TAU);c.fill();}
    // 어둠의 테두리 — 어디까지가 어둠인지 안 보이면 그냥 화면이 어두운 것이다.
    celHoop(c,cx,cy,Math.max(3*SC,RR),1,0,3.4*SC,"shade",.85*f0);
    if(DEEP)celHoop(c,cx,cy,Math.max(3*SC,RR*.55),1,0,2.4*SC,"shade",.7*f0);
    // 심지 — 빛이 다 꺼지지는 않는다. 플레이어가 사라지면 그건 사고로 읽힌다.
    c.save();c.globalCompositeOperation="lighter";
    const g3=c.createRadialGradient(cx,cy,0,cx,cy,CLEAR+10*SC);
    g3.addColorStop(0,A(TONE.shade[2],.38*f0));g3.addColorStop(1,A(TONE.shade[1],0));
    c.fillStyle=g3;c.beginPath();c.arc(cx,cy,CLEAR+10*SC,0,TAU);c.fill();c.restore();}
  // 어둠 안의 적 — **테두리만.** 어둠의 확정 장치 그대로라 여기서만 보인다.
  // L3 이면 한 번 든 적은 어둠이 걷힌 뒤에도 테두리가 남는다.
  for(const f of st.F){const d=Math.hypot(f.ox,f.oy);
    const lit=(f0>.02&&d>CLEAR&&d<RR)?1:(SEEN&&f.seen?.55:0);
    const x=cx+f.ox+f.kx,y=cy+f.oy+f.ky;
    // L3 「한 번 든 적은 표가 남는다」 — 어둠 안에 있을 때도 이 점이 있어야
    // L2 와 **정지 화면에서** 갈린다(2026-08-11 렌더 판정). 걷힌 뒤에는
    // 이 점과 옅은 테두리만 남아 「나는 아직 보고 있다」가 된다.
    if(SEEN&&f.seen)celSplash(c,x,y-f.r*1.7,3.8*SC,6,3,"shade",.9);
    if(lit<=0)continue;
    const P=jagPoly(x,y,f.r*1.12,9,3.3,1.1);
    c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
    c.closePath();
    c.strokeStyle=A(TONE.shade[2],.95*lit);c.lineWidth=2.4*SC;c.stroke();}},
};

// ── 마운트 — **기존 그리드 id 에 내 것만 덧붙인다** ───────────────────────
// 위의 `MAGIC.forEach(...)` 는 손대지 않는다. 같은 호스트에 이어 붙기만 하므로
// 다른 손이 자기 블록을 아래에 또 붙여도 서로 안 부딪힌다.
const MGDEF=[
["mgPoisonCreep","만연 蔓延 · 독 毒","CREEP",
 "지면 넝쿨이 기어가 <b>남는다</b> — 끝이 닿은 적마다 겹이 하나씩 박힌다 · 중첩형(연 煙)"],
["mgPoisonLatch","기생 寄生 · 독 毒","LATCH",
 "가시가 적 몸에 <b>박혀 같이 움직인다</b> — 오래 붙을수록 아프다 · 지속형(역 疫)"],
["mgPoisonBrand","극독 劇毒 · 독 毒","BRAND",
 "한 마리에게만 표식이 <b>겹겹이 조여든다</b> — 다 조이면 무너진다 · 한방형(마 痲)"],
["mgPoisonSpread","감염 感染 · 독 毒","SPREAD",
 "<b>발원지가 적이다</b> — 감염된 적의 몸에서 파문이 나가 옆 적을 물들인다 · 광역형(장 瘴)"],
["mgNovaDetonate","기폭 起爆 · 마 痲","DETONATE",
 "쌓인 겹을 <b>태워 즉발로 바꾼다</b> — 혼자 쓰면 미지근하고 독 위에 얹으면 판이 뒤집힌다"],
["mgNovaChime","공명 共鳴 · 뢰명 雷鳴","CHIME",
 "종이 각자 파를 낸다 — <b>파가 겹치는 교점</b>에서만 마디가 서고, 링에는 판정이 없다"],
["mgNovaSplit","분열 分裂 · 플라즈마 漿","SPLIT",
 "하나가 둘, 둘이 넷 — 부모가 사라지므로 화면에는 <b>늘 한 세대만</b> 있다"],
["mgNovaCycle","오행 五行 · 백광 白光","CYCLE",
 "염→빙→뢰→풍→독을 <b>차례로</b> 두르고, 한 바퀴를 다 돌아야 백광이 터진다"],
["mgNovaDusk","암전 暗轉 · 어둠 影","DUSK",
 "<b>빛을 끈다</b> — 어두워진 자리에서 적은 테두리만 남고, 어두운 동안에만 문다"]];
MGDEF.forEach(w=>tile($("magic"),MGFX,w[0],w[1],w[2],w[3],S));

// 레벨 성장표 — **수치만 오르는 레벨은 반려**라, 한 단마다 화면에서 하나씩
// 달라진다. 칸은 전역 LV 만 바꿔놓고 **같은 함수**를 부른다(위 성장표와 같은
// 수법) — 레벨판을 따로 그리면 표가 거짓말을 한다.
const MGLVT={
mgPoisonCreep:["싹이 둘 — 각자 다른 쪽으로 기어간다",
  "뿌리를 내린다 — 마디마다 뿌리혹이 앉고 넝쿨이 안 시든다 (상한 4)",
  "가지가 한 번 갈라진다 — 끝이 둘에서 넷으로",
  "각성 — 두 번 갈라지고 끝마다 꽃이 벌어진다 (겹 2씩 · 상한 5)"],
mgPoisonLatch:["가시 3자루 — 한 마리에 둘도 박힌다",
  "안 빠진다 — 한 번 박히면 끝까지 붙어 있다",
  "실뿌리 — 박힌 자리에서 돋아 적 몸을 덮어 간다",
  "각성 — 가시마다 곁가지 둘. 하나가 셋을 문다"],
mgPoisonBrand:["고리 3겹 — 한 겹 더 깊이 조인다",
  "조이는 내내 독이 샌다 — 곁의 적에게도 옅게 묻는다",
  "고리 4겹 + 조임이 빨라진다 (4.0 → 3.0s)",
  "각성 — 무너진 자리에 표식이 남고, 다음 표적은 한 겹 먹고 시작한다"],
mgPoisonSpread:["옮는 거리 +23% — 한 칸 건너뛴 적까지 닿는다",
  "파문이 두 겹 — 두 배로 빨리 옮는다",
  "발원지가 자리에 남는다 — 적이 없어져도 계속 퍼뜨린다",
  "각성 — 전부 감염되는 순간 동시에 터진다"],
mgNovaDetonate:["겹 상한 4 — 빈 칸이 하나 더 생겨 더 쌓아 두고 태운다",
  "기폭 직후 잠깐 예민해져 다음 겹이 두 배로 쌓인다",
  "심지가 두 줄 — 주기 4.0 → 2.6s, 태우는 간격이 좁아진다",
  "각성 — 상한까지 찬 적은 터져도 첫 칸이 안 빈다"],
mgNovaChime:["종 셋 — 교점이 둘에서 여섯으로",
  "마디가 선 자리에서 2차 파가 하나 더 난다",
  "종 넷 — 교점 열둘",
  "각성 — 세 파가 한 점에서 만나면 대마디가 선다"],
mgNovaSplit:["3세대 — 넷까지 늘어난다",
  "쪼개지는 그 자리도 터진다",
  "4세대 — 여덟까지",
  "각성 — 둘이 아니라 셋으로 갈린다 (가운데는 곧게 나간다)"],
mgNovaCycle:["넷을 돈다 (염·빙·뢰·풍)",
  "다섯을 다 돈다 — 한 바퀴 끝에 백광이 터진다",
  "한 주기에 두 바퀴 — 속성이 두 번씩 지나간다",
  "각성 — 마지막에 다섯이 겹친다. 흰 파동 셋이 나간다"],
mgNovaDusk:["어둠 반경 +45%",
  "어둠에 한 번 든 적은 표가 남아 걷힌 뒤에도 테두리가 보인다",
  "심어둠 — 안쪽 한 겹에서는 두 배로 문다",
  "각성 — 걷힐 때 어둠이 안으로 무너지며 한 번 더 문다"]};
MGDEF.forEach(([key,nm])=>{
  const host=LVHOSTS["마법"];
  const row=document.createElement("div");
  box(row,{width:"100%",background:"#13131A",border:"1px solid #26262F",
    borderRadius:"4px",overflow:"hidden",boxSizing:"border-box"});
  row.insertAdjacentHTML("beforeend",
    `<div style="display:flex;align-items:baseline;gap:8px;padding:7px 10px;`+
    `border-bottom:1px solid #26262F"><b style="font-size:13px;color:#EDEDF2">${nm}</b>`+
    `<span style="font-size:10px;color:#5A5A68">마법</span></div>`);
  const cells=document.createElement("div");
  box(cells,{display:"flex",flexWrap:"wrap",gap:"1px",background:"#26262F",width:"100%"});
  for(let L=1;L<=5;L++){
    const cell=document.createElement("div");
    box(cell,{width:LVC+"px",flex:"1 1 "+LVC+"px",minWidth:LVC+"px",
      background:"#13131A",boxSizing:"border-box"});
    const cv=document.createElement("canvas");
    box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
    cell.appendChild(cv);
    const txt=L===1?"기준 디자인":((MGLVT[key]||[])[L-2]||"");
    cell.insertAdjacentHTML("beforeend",
      `<div style="padding:5px 8px 7px;border-top:1px solid #26262F">`+
      `<div style="font-size:10px;font-weight:700;letter-spacing:.06em;`+
      `color:${L===1?"#9494A2":"#FFA83C"}">L${L}</div>`+
      `<div style="font-size:9.5px;color:#9494A2;line-height:1.35;margin-top:2px;`+
      `min-height:2.7em">${txt}</div></div>`);
    cells.appendChild(cell);
    const fn=MGFX[key];
    // 속성이 스킬마다 고정이라 RECOLOR 훅을 안 탄다 — 그리는 쪽이 색을 직접 댄다.
    mk(cv,[LVC,LVC],(c,t,dt,W,H,st)=>{const sl=LV;LV=L;
      try{fn(c,t,dt,W,H,st);}finally{LV=sl;}});}
  row.appendChild(cells);host.appendChild(row);});


// ═══════════════════════════════════════════════════════════════════════════
// 마법 공격 신설 — 염 炎 4 · 빙 氷 4 (2026-08-11)
//
// **마법은 속성을 부여받지 않는다.** 일반 공격은 `WTONE`+`RECOLOR` 로 팔레트가
// 통째로 갈아끼워지지만(속성을 「먹는다」), 마법은 태어날 때부터 속성이 정해져
// 있다. 그래서 이 여덟은 **`WTONE` 에 등록하지 않고** 팔레트를 본문에 박는다 —
// 염은 언제나 `ember`, 빙은 언제나 `frost` 다. RECOLOR 를 타는 `"gold"` 는 이
// 여덟에서 한 번도 안 쓴다(쓰면 「부여 가능한 무기」로 보인다).
//
// ── 축 분업 ────────────────────────────────────────────────────────────────
// 규율은 「한 분류 안에서 축이 겹치면 안 된다」이다. 이미 팔린 축:
//   일반 8+2 — 정면 파도 · 몸 주위 공전 · 조준 사격 · 자동 추적 · 산탄 ·
//              각도 훑기 · 관통 빔 · 투척 폭발 · **연결(분뢰의 빨대)** ·
//              **자율 공전 사격+과열(순포)**
//   마법 7   — 장판 · 확장 파문 · 낙하 · 연쇄 · 기둥 · 정령 · 구형 폭발
//   방어/궁극 — 결계 · 전역 섬광
//   기본공격 8축(`MANIDESC`) — 튕김 · 소폭발 · 이웃 감염 · 연쇄 · 관통 ·
//              **끌어당김(풍·어둠)** · 성장 · **시한(백광)**
//   독·창작 9 — 만연(자란다) · 기생(붙는다) · 극독(조인다) · 감염(옮는다) ·
//              기폭(소비한다) · 공명(겹친다) · 분열(배로 는다) · 오행(돌아간다) ·
//              암전(끈다)
//
// 여덟은 그 바깥에서 골랐고, **염 넷과 빙 넷이 서로 다른 이야기**를 한다:
//
//   염 = 쌓인다 → 「점화를 어떻게 덧칠하나」의 네 가지
//     화염방사 mgFireCone   도포 — 내가 직접 계속 뿌린다(지속 원뿔)
//     불자취   mgFireTrail  퇴적 — 지나온 자리에 깔아 둔다(이동 궤적)
//     화염회오리 mgFireVortex 연행 — 붙잡아 **데리고 다닌다**(자율 배회)
//     회염     mgFireReturn 왕복 — 나갔다 **돌아온다**(같은 줄을 두 번)
//
//   빙 = 멈추고 깨진다 → 「어떻게 세우나」의 네 가지
//     빙벽     mgIceWall    차단 — 길을 막는다(지형 설치)
//     서릿발   mgIceSpine   돌기 — 땅에서 줄지어 솟아 꿰뚫는다(순차 열)
//     결빙     mgIceTomb    구속 — 한 놈을 관에 가둔다(단일 대상)
//     빙판     mgIceSlick   제어 박탈 — **가고 싶은 쪽으로 못 꺾는다**(미끄러짐)
//
// ⚠️ **폐기한 둘**(2026-08-11): 「낙인(부착→시한→전파)」과 「파쇄(동상 기폭)」는
// 독·창작 계열의 **기생·감염·기폭**, 그리고 백광의 **시한**과 정면으로 겹쳐
// 통째로 버렸다. 남은 자리에 **왕복**과 **제어 박탈**을 새로 팠다 — 서른 종
// 어디에도 없던 동사다(「돌아온다」와 「못 꺾는다」).
//
// ⚠️ 붙어 보이는 것들과 왜 안 겹치는지(이게 이 블록의 제일 중요한 주석이다):
//   회염 ↔ 무속성 기본공격(2회 튕김) — 튕김은 **반사**라 어디로 갈지 모르고,
//     귀환은 **반드시 내게로** 온다. 돌아오는 길을 알고 서 있을 수 있는 것이
//     이 무기의 조작이다.
//   회염 ↔ 유도탄/빛폭탄 — 유도탄은 **쫓아가고** 빛폭탄은 **가서 터진다**.
//     회염만 **온 길을 되짚어** 같은 적을 두 번 문다(그래서 점화가 2중첩).
//   회오리 ↔ 풍/어둠 기본공격(끌어당김) — 저쪽은 **한 점으로 모으고 끝**이다.
//     회오리는 모은 뒤 **붙잡은 채로 판을 가로질러 데려간다** — 적의 위치를
//     지속적으로 바꾸는 것은 서른 종 중 이것뿐이다.
//   회오리 ↔ 정령 — 정령은 내 주위를 맴돌아 **나를 따라온다**. 회오리는 나를
//     떠나 멀어지고 수명이 끝나면 사라진다(그래서 「내 것」이 아니라 재해다).
//   서릿발 ↔ 광주 — 광주는 **몸 주위 원** 위에 동시에 솟고, 서릿발은 발밑에서
//     **앞으로 한 칸씩** 돋는다. 원이라 뒤가 막힌 것과 선이라 뒤가 빈 것.
//   빙판 ↔ 성역(장판) — 성역은 「밟으면 아픈 원」이고 빙판은 「밟으면 못 서는
//     바닥」이다. 빙판의 피해는 거의 0 이고, 바꾸는 것은 체력이 아니라 **조향**
//     이다. 감속·끌어당김·넉백이 전부 **속도**를 건드리는 데 반해 이것만
//     **방향**을 건드린다.
//   결빙 ↔ 기생(붙는다) — 기생은 붙어서 **빨아먹고**, 결빙은 붙어서 **멈춘다**.
//     하나는 자원이고 하나는 시간이다.
//
// ── 상태이상 어휘 ──────────────────────────────────────────────────────────
// 새 상태를 안 만든다. `PASSIVE` 확정본 그대로:
//   염 넷 → **점화**(burn, 세고 짧은 도트 · 최대 3중첩)
//   빙 넷 → **동상**(frost, 둔화 + 0.1s 빙결 + 냉기 도트)
// 표식은 전부 [pvMark] 를 쓴다 — 「같은 표식이 무기마다 달라 보이면 플레이어는
// 상태를 못 배운다」는 그 함수의 규약을 여덟도 지킨다. 중첩은 그림을 늘리지
// 않고 **지속(f.pv)** 으로 말한다.
//
// ── 융화(`FVSYN`)가 물릴 자리 ──────────────────────────────────────────────
//   플라즈마 漿 → 염 **연소 피해 +40%** : 염 넷은 직격이 아니라 **점화가 주딜**
//     이 되도록 짰다 — 화염방사는 틱마다 덧칠하고, 자취는 밟는 내내 덧칠하고,
//     회오리는 붙잡고 있는 내내, 회염은 **한 번 던져 두 번** 덧칠한다.
//     연소를 안 쓰는 염 마법은 이 버프를 못 받으므로, 넷 다 받게 짜는 것이
//     계열 설계의 조건이었다.
//   설 雪 → 빙 **감속 폭 +40%** : 빙 넷이 전부 동상을 건다. 벽은 닿아 있는 동안,
//     서릿발은 솟을 때, 결빙은 감속의 극단(완전 정지), 빙판은 서 있는 내내.
//   수 水 → 뇌 +35% : 염+빙 융화지만 미는 건 뇌라, 여덟은 이 버프의 대상이
//     아니다(적셔 두는 역할만 한다).
//
// ── 레벨 ───────────────────────────────────────────────────────────────────
// 수치만 오르는 레벨은 반려된다. 여덟 다 **개수·형태·단계**가 자란다:
// 갈래 1→3→5 · 줄 1→2 · 판 3→5→2겹→ㄷ자 · 낙인 1→2→분기. L5 는 전부 각성이고
// **한눈에 다른 표식**을 갖는다(염 = 흰 심 과열, 빙 = 거대 결정·서리 잔류).
// ═══════════════════════════════════════════════════════════════════════════

/// 적 배치를 **타일 크기에 비례**시킨다. 시안 칸은 238, 성장표 칸은 168 이라
/// 절대 px 로 박으면 성장표에서 적이 테두리에 걸리고 이펙트와 안 맞물린다
/// (기본 공격 타일이 쓰는 `SC` 규약과 같다). 제자리(hx,hy)도 같이 기억한다 —
/// 밀려나거나 끌려간 적을 되돌리지 않으면 몇 초 만에 전부 한 덩어리가 된다.
function mgInit(st,SC,l){if(!st.F){
  st.F=mkFoes(l.map(v=>[v[0]*SC,v[1]*SC,v[2]*SC]));
  for(const f of st.F){f.hx=f.ox;f.hy=f.oy;}}return st.F;}
/// 상태 표식을 **뒤 층 → 적 → 앞 층** 으로 끼워 그린다. 적의 몸이 그대로
/// 마스크가 되어 감기는 것이 실제로 가려진다(기본 공격 타일과 같은 수법).
function mgMarks(c,t,cx,cy,F,kind,k,SC){
  const mark=(L)=>{for(const f of F)if(f.pv>0)
    pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,kind,f.pv,t,k,SC,L);};
  mark(0);drawFoes(c,t,cx,cy,F);mark(1);}
/// 점화를 **덧칠한다.** 중첩 상한 3 은 `PASSIVE` 의 「최대 3중첩」 그대로이고,
/// 화면에서는 표식이 아니라 **꺼지지 않는 시간**으로 보인다.
const mgBurn=(f,add)=>{f.pv=Math.min(3,(f.pv||0)+add);};

Object.assign(FX,{

// ── 염 1 · 화염방사 火炎放射 ───────────────────────────────────────────────
// **축 = 도포(지속 원뿔).** 파도(빛파동)는 한 번 밀려나고 끝이지만 이건 **켜 두는**
// 것이다 — 같은 자리에 서 있는 동안 점화가 계속 덧칠되는 것이 정체다.
// ⚠️ 조준은 **안 훑는다.** 부채를 좌우로 흔드는 순간 광선검(각도 훑기)·레이저
// (부채 관통)와 같은 물건이 된다. 이 무기가 파는 것은 각도가 아니라 **시간**이다.
mgFireCone(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  mgInit(st,SC,[[-46,-70,10],[10,-92,11],[52,-62,10],[-8,-46,9],[40,-100,9]]);
  stepFoes(st.F,dt);
  // 성장축은 **갈래 수**다. 굵기·피해가 아니라 부채가 채워진다.
  const LANES=[1,3,3,5,5][LV-1];
  const HALF =[.15,.30,.30,.40,.40][LV-1];       // 원뿔 반각(rad)
  const LEN  =[80,90,95,100,120][LV-1]*SC;
  const POOL =atL(3), CORE=atL(5);
  const dir  =-Math.PI/2;                         // 고정 조준
  const px=cx+Math.cos(dir)*LEN, py=cy+Math.sin(dir)*LEN;
  // 판정은 0.16s 틱 — 매 프레임 덧칠하면 한 프레임에 3중첩이 차 「쌓인다」가
  // 화면에서 안 보인다.
  st.tk=(st.tk||0)+dt;
  if(st.tk>.16){st.tk=0;
    for(const f of st.F){const dx=f.ox+f.kx,dy=f.oy+f.ky,d=Math.hypot(dx,dy)||1;
      let hitIt=false;
      if(d<LEN+f.r){let ad=Math.atan2(dy,dx)-dir;
        while(ad>Math.PI)ad-=TAU;while(ad<-Math.PI)ad+=TAU;
        hitIt=Math.abs(ad)<HALF+.12;}
      // 불웅덩이는 분사가 안 닿아도 태운다 — 이것이 L3 의 값어치다.
      if(!hitIt&&POOL)hitIt=Math.hypot(cx+dx-px,cy+dy-py)<32*SC+f.r;
      if(!hitIt)continue;
      hitFoe(st,f,cx,cy,dx/d,dy/d,5*SC,"ember");
      mgBurn(f,.8);}}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  if(R()<dt*26)emit(st,cx+(R()-.5)*14*SC,cy-5*SC,1,
    {k:"ember",sp:14*SC,r:2.6*SC,life:.8,g:-120*SC,spikeP:.15});
  stepP(st,dt);
  mgMarks(c,t,cx,cy,st.F,"burn","ember",SC);
  // 불웅덩이 — 바닥에 고인 것. 고리 굵기를 반지름에 묶는다(갓 태어난 고리가
  // `r-w*.22 < 0` 으로 arc 에서 죽는다).
  // ⚠️ 처음엔 작은 고리 하나였는데 분사 덩어리에 묻혀 **L3 가 L2 와 같아 보였다**
  // (2026-08-11 렌더 판정). 고리를 키우고 혀를 넷으로 늘려, 분사가 지나간
  // 다음에도 그 자리가 타고 있다는 것이 남게 한다.
  if(POOL){const pr=32*SC,bb=.5+.16*Math.sin(t*3.1);
    celHoop(c,px,py,pr,.42,0,pr*.26,"ember",bb);
    celHoop(c,px,py,pr*.55,.42,0,pr*.16,"ember",bb*.8);
    for(let i=0;i<4;i++)flame(c,px+(i-1.5)*15*SC,py+3*SC,SC*.58,.25,"ember",(i-1.5)*.3);}
  // 분사 — 갈래마다 덩어리가 줄지어 나간다. 나갈수록 커지고 흐려진다(같은
  // 크기로 두면 「탄창」이 되고 불로 안 읽힌다).
  // ⚠️ 덩어리를 크게(최대 16*SC) 뿌렸더니 갈래가 서로 먹어 **버섯구름**이 됐다
  // (2026-08-11 렌더 판정). 「불을 뿜는다」는 덩어리의 크기가 아니라 **갈래가
  // 갈라져 보이는 것**이 만든다 — 알갱이를 절반으로 줄이고 갈래마다 혀를
  // 하나씩 세워 방향을 준다.
  const NB=6,SPD=[.9,.95,1.0,1.05,1.15][LV-1];
  const sp=LANES>1?HALF*2/(LANES-1):0;
  for(let j=0;j<LANES;j++){
    const la=dir+(j-(LANES-1)/2)*sp;
    for(let b=0;b<NB;b++){
      const ph=(t*SPD+j*.31+b/NB)%1;
      const a2=la+Math.sin(ph*5.1+j*2.3)*.06*ph, rr=LEN*ph;
      const x=cx+Math.cos(a2)*rr, y=cy+Math.sin(a2)*rr;
      const sz=Math.max(.5,(2.2+7.6*ph)*SC), al=Math.min(1,(1-ph)*2.4);
      celPuff(c,x,y,sz,7,j*5.3+b*1.7,"ember",al);
      // L5 각성 — **속불이 과열돼 희다.** 색이 한 겹 느는 것이 갈래 하나보다
      // 먼저 눈에 들어와, 만렙이 「하나 더」가 아니라 「다른 불」로 읽힌다.
      if(CORE)celPuff(c,x,y-sz*.18,sz*.5,6,j*3.1+b,"white",al*.95);}
    // 갈래의 혀 — 알갱이만 있으면 연기이고, 방향을 말하는 것은 혀다.
    flame(c,cx+Math.cos(la)*LEN*.34,cy+Math.sin(la)*LEN*.34,SC*.66,.3,"ember",la+Math.PI/2);}
  fireBody(c,t,cx,cy-7*SC,SC*.5,.95,3);            // 총구 — 몸에서 나가는 것
  drawP(c,st);hero(c,t,cx,cy);},

// ── 염 2 · 불자취 火跡 ─────────────────────────────────────────────────────
// **축 = 퇴적(이동 궤적).** 성역은 몸을 따라다니는 장판이라 **내가 서 있는 곳만**
// 아프지만, 자취는 몸을 떠나 **내가 있었던 곳**에 남는다 — 쫓아오는 적이 스스로
// 밟는다. 열아홉 중 **이동이 곧 조준**인 유일한 것이라, 시안 칸에서도 캐릭터가
// 움직인다(고정해 두면 이 무기의 정체가 화면에 아예 안 나온다).
mgFireTrail(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  // 적을 **8자 위에** 세운다. 길에서 비켜 세우면 자취가 아무도 안 태워
  // 「예쁘지만 아무 일도 안 하는 무기」로 보인다(2026-08-11 렌더 판정: pv 전원 0).
  mgInit(st,SC,[[58,-14,10],[-58,14,10],[40,44,9],[-40,-44,9],[-6,-78,10],[74,54,9]]);
  stepFoes(st.F,dt);
  const TTL=[.9,2.6,2.6,2.6,3.0][LV-1];   // L2 = 한 바퀴가 안 꺼진다(고리가 닫힌다)
  const SIDE=atL(4), BRANCH=atL(3), AWK=atL(5);
  const WID=(AWK?12.5:9)*SC;
  // 캐릭터가 8자로 돈다. 원으로 돌면 자취가 고리 하나라 「장판」과 구별이 안 된다.
  // ⚠️ 한 바퀴가 11초였을 때는 **자취가 대각선 한 토막**으로만 보였다 —
  // 「지나온 자리」라는 정체는 **길이 닫혀야** 읽히므로 주기를 2.6초로 당겼다.
  // 그러면 L2(2.6초 잔류)가 정확히 「한 바퀴가 안 꺼진다」가 된다.
  const hx=cx+Math.cos(t*2.4)*64*SC, hy=cy+Math.sin(t*4.8)*40*SC;
  st.tr=st.tr||[[],[]];
  st.dp=(st.dp||0)+dt;
  if(st.dp>.045){st.dp=0;
    const vx=-Math.sin(t*2.4)*2.4, vy=Math.cos(t*4.8)*4.8;
    const L=Math.hypot(vx,vy)||1, nx=-vy/L, ny=vx/L;   // 진행 방향의 법선
    const off=SIDE?9*SC:0;
    st.tr[0].push({x:hx+nx*off,y:hy+ny*off,l:0});
    if(SIDE)st.tr[1].push({x:hx-nx*off,y:hy-ny*off,l:0});}
  for(const row of st.tr)for(let i=row.length-1;i>=0;i--){
    row[i].l+=dt;if(row[i].l>TTL)row.splice(i,1);}
  // 밟으면 탄다
  st.tk=(st.tk||0)+dt;
  if(st.tk>.18){st.tk=0;
    for(const f of st.F){const fx=cx+f.ox+f.kx,fy=cy+f.oy+f.ky;let on=false;
      for(const row of st.tr){for(let i=0;i<row.length;i+=2)
        if(Math.hypot(row[i].x-fx,row[i].y-fy)<f.r+7*SC){on=true;break;}
        if(on)break;}
      if(on){hitFoe(st,f,cx,cy,0,0,3*SC,"ember");mgBurn(f,.9);}}}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  if(AWK&&R()<dt*30)emit(st,hx,hy,1,{k:"ember",sp:22*SC,r:2.8*SC,life:.9,g:-130*SC,spikeP:.3});
  stepP(st,dt);
  // 자취 — **나이별로 세 토막**을 이어 그린다. 한 줄로 그리면 알파가 하나라
  // 「방금 깐 것」과 「꺼져 가는 것」이 같아 보인다. 잇는 데는 celStroke 를
  // 쓴다(celRibbon 은 끝을 0 으로 좁혀 이음매마다 구멍이 난다).
  for(const row of st.tr){if(row.length<2)continue;
    for(let g=0;g<3;g++){
      const a0=Math.floor(row.length*g/3),
            a1=Math.min(row.length-1,Math.floor(row.length*(g+1)/3));
      if(a1-a0<1)continue;
      const seg=[];for(let i=a0;i<=a1;i++)seg.push([row[i].x,row[i].y]);
      const age=row[a0].l/TTL;
      celStroke(c,seg,Math.max(1,WID*(1-age*.45)),"ember",Math.max(.14,1-age));}}
  // 자취 위의 혓불 — 네 노드마다 하나. 전부 세우면 띠가 안 보이고 불덩이만 남는다.
  for(const row of st.tr)for(let i=0;i<row.length;i+=4){const q=row[i];
    const a=Math.max(0,1-q.l/TTL);if(a<.08)continue;
    fireBody(c,t+q.x*.06,q.x,q.y-2*SC,SC*(AWK?.34:.28),a*.9,1);
    // L3 곁불 — 자취가 **옆으로 번진다**. 염의 정체가 여기서 한 번 더 나온다.
    if(BRANCH&&i%8===0){const s2=(i/8)%2?1:-1;
      flame(c,q.x+s2*11*SC,q.y+SC,SC*.42,1-a,"ember",s2*.7);}}
  mgMarks(c,t,cx,cy,st.F,"burn","ember",SC);
  drawP(c,st);hero(c,t,hx,hy);},

// ── 염 3 · 화염회오리 火旋 ─────────────────────────────────────────────────
// **축 = 연행(자율 배회).** 잡힌 적은 회오리에 **묶여 같이 이동한다** — 판 위의
// 적을 지속적으로 옮기는 것은 열아홉 중 이것뿐이다. 풍·어둠의 기본 공격은 한
// 점으로 **모으고 끝**이고, 정령은 **나를 따라오는 내 것**이다. 이건 내 손을
// 떠나 멀어지고, 수명이 다하면 사라지는 **재해**다.
// 연소가 주딜이라 플라즈마(연소 +40%)가 그대로 물린다 — 오래 붙잡을수록 세다.
mgFireVortex(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  mgInit(st,SC,[[-70,-52,10],[62,-46,10],[-24,-96,9],[38,74,10],[-58,58,9],[6,-16,9]]);
  stepFoes(st.F,dt);
  const NV=[1,1,2,2,3][LV-1], RAD=[24,33,33,33,36][LV-1]*SC;
  const GRAB=atL(2), BURST=atL(4), CORE=atL(5), ARMS=atL(2)?2:1, LIFE=3.2;
  st.v=st.v||[];st.bl=st.bl||[];
  // 새로 나는 자리를 **서로 벌려 둔다.** 무작위로 뿌리면 둘이 겹쳐 나서 L3 가
  // 「큰 회오리 하나」로 보인다(개수가 성장축인데 개수가 안 보인다).
  while(st.v.length<NV){const i=(st.sq=(st.sq||0)+1);
    const g=i/Math.max(1,NV)*TAU+hash(i*9.3);
    st.v.push({x:cx+Math.cos(g)*W*.22,y:cy+Math.sin(g)*H*.17,
      a:g+Math.PI*.5,l:0,rot:hash(i*7.7)*TAU});}
  while(st.v.length>NV){const v=st.v.pop();
    for(const f of st.F)if(f.cap===v)f.cap=null;}
  const MAR=RAD*1.2;
  for(let i=st.v.length-1;i>=0;i--){const v=st.v[i];
    v.l+=dt;v.rot+=dt*3.4;
    v.x+=Math.cos(v.a)*31*SC*dt;v.y+=Math.sin(v.a)*21*SC*dt;
    // 타일 밖으로 못 나간다 — 벽에 닿으면 각을 되꺾는다.
    if(v.x<MAR||v.x>W-MAR){v.a=Math.PI-v.a;v.x=Math.min(W-MAR,Math.max(MAR,v.x));}
    if(v.y<MAR||v.y>H-MAR){v.a=-v.a;v.y=Math.min(H-MAR,Math.max(MAR,v.y));}
    if(v.l>LIFE){
      // L4 — **꺼질 때 터진다.** 모아 둔 것을 한꺼번에 돌려주는 것이라 「붙잡아
      // 데려간다」와 인과가 이어진다(그냥 사라지면 붙잡기가 헛수고로 보인다).
      if(BURST){st.bl.push({x:v.x,y:v.y,l:0});
        for(const f of st.F)if(Math.hypot(cx+f.ox-v.x,cy+f.oy-v.y)<RAD*2){
          const dx=cx+f.ox-v.x,dy=cy+f.oy-v.y,d=Math.hypot(dx,dy)||1;
          hitFoe(st,f,cx,cy,dx/d,dy/d,44*SC,"ember");mgBurn(f,1.4);}
        emit(st,v.x,v.y,16,{k:"ember",sp:190*SC,r:3.2*SC,life:.5,spikeP:.6});}
      for(const f of st.F)if(f.cap===v)f.cap=null;
      st.v.splice(i,1);continue;}
    if(!GRAB)continue;
    for(const f of st.F){if(f.cap&&f.cap!==v)continue;
      const dx=v.x-(cx+f.ox),dy=v.y-(cy+f.oy),d=Math.hypot(dx,dy)||1;
      if(!f.cap&&d<RAD*1.5){f.cap=v;f.ca=Math.atan2(-dy,-dx);f.cr=d;}}}
  // 잡힌 적 — 회오리에 묶여 **끌려다닌다**. 안 잡힌 적은 제자리로 돌아간다
  // (시안 칸은 적이 안 죽으므로 안 되돌리면 몇 초 만에 한 덩이가 된다).
  for(const f of st.F){
    if(f.cap){f.ca+=dt*3.4;f.cr+=(RAD*.8-f.cr)*dt*1.6;
      f.ox=(f.cap.x-cx)+Math.cos(f.ca)*f.cr;
      f.oy=(f.cap.y-cy)+Math.sin(f.ca)*f.cr*.55;
      if(R()<dt*3.4){hitFoe(st,f,cx,cy,0,0,3*SC,"ember");mgBurn(f,.7);}}
    else{f.ox+=(f.hx-f.ox)*Math.min(1,dt*1.1);f.oy+=(f.hy-f.oy)*Math.min(1,dt*1.1);}
    if(f.pv>0)f.pv-=dt*.55;}
  for(let i=st.bl.length-1;i>=0;i--){st.bl[i].l+=dt;if(st.bl[i].l>.42)st.bl.splice(i,1);}
  stepP(st,dt);
  mgMarks(c,t,cx,cy,st.F,"burn","ember",SC);
  for(const v of st.v){
    const fade=Math.min(1,v.l/.3)*Math.min(1,(LIFE-v.l)/.4);
    // 회오리는 몸 주위를 **가로질러** 떠돈다 — 몸보다 아래면 몸을 가려야 한다.
    dep(c,v.y,cy,(c,dz)=>{const al=fade*dz;if(al<=.02)return;
      // ⚠️ **깔때기의 조건은 「고리가 안 겹치는 것」이다**(2026-08-11 렌더 판정:
      // 「주황 국수 한 접시」). 처음엔 2.2바퀴를 RAD*1.5 만 올려 감았는데, 한
      // 바퀴가 올라가는 높이(0.68R)가 눕힌 타원의 세로 지름(1.0R)보다 작아
      // 고리끼리 포개졌다. 두 조건을 박는다:
      //   ① 한 바퀴 상승(1.05R) > 타원 세로 지름(0.84R)
      //   ② **바닥이 좁고 위가 넓다** — 회오리는 위가 벌어진 것이다
      const RISE=RAD*2.1;
      celHoop(c,v.x,v.y,RAD*.34,.5,0,RAD*.12,"ember",al*.55);       // 바닥 자국
      celHoop(c,v.x,v.y-RISE,RAD,.42,0,RAD*.14,"ember",al*.4);      // 벌어진 아가리
      for(let k=0;k<ARMS;k++){const P=[];
        // 위(넓은 쪽)에서 아래(좁은 쪽)로 적는다 — celRibbon 이 시작을 굵게
        // 끝을 가늘게 깎으므로, 순서가 곧 깔때기의 두께다.
        for(let i=0;i<=24;i++){const q=1-i/24;
          const ang=v.rot+q*2.0*TAU+k*Math.PI, rr=RAD*(.28+.72*q);
          P.push([v.x+Math.cos(ang)*rr, v.y+Math.sin(ang)*rr*.42-q*RISE]);}
        celRibbon(c,P,RAD*.3,"ember",al*(k?.72:.95));}
      for(let i=0;i<3;i++){const g=v.rot*.6+i/3*TAU;
        flame(c,v.x+Math.cos(g)*RAD*.34,v.y+Math.sin(g)*RAD*.16,SC*.5,.3,"ember",Math.cos(g)*.4);}
      // L5 각성 — 중심에 **흰 불기둥**. 만렙이 「개수 하나 더」로 끝나면 L4 와
      // 화면에서 안 갈린다.
      if(CORE)celBeam(c,v.x,v.y,v.x,v.y-RISE,RAD*.14,"white",al*.7);});
    if(R()<dt*24)emit(st,v.x+(R()-.5)*RAD,v.y,1,
      {k:"ember",sp:18*SC,r:2.4*SC,life:.7,g:-150*SC,spikeP:.2});}
  // 꺼질 때의 폭발 — **작게.** 처음엔 RAD 의 2.5배까지 부풀렸더니 갈색 뭉게가
  // 칸의 1/4 를 덮어, 회오리 셋이 그 뒤로 사라졌다(2026-08-11 렌더 판정).
  for(const b of st.bl){const f=1-b.l/.42;
    celPuff(c,b.x,b.y,Math.max(1,RAD*(.55+(1-f)*.6)),10,7,"ember",f);
    for(let i=0;i<9;i++)celSpike(c,b.x,b.y,i/9*TAU,RAD*1.6*f,RAD*.18*f,"ember",f*.8);}
  drawP(c,st);hero(c,t,cx,cy);},

// ── 염 4 · 회염 廻炎 ───────────────────────────────────────────────────────
// **축 = 왕복(나갔다 돌아온다).** 던진 불덩이가 호를 그리며 **되돌아온다** —
// 같은 줄을 **두 번** 지나므로 점화가 한 번에 2중첩까지 쌓인다(염의 「쌓인다」가
// 무기 구조 자체에 들어 있는 유일한 자리이고, 그래서 플라즈마 漿 의 연소 +40%
// 가 제일 크게 물린다).
// ⚠️ 원래 이 자리는 「낙인(부착 → 시한 → 옆으로 전파)」이었는데 **폐기**했다
// (2026-08-11). 독·창작 계열이 **기생(붙는다) · 감염(옮는다) · 기폭(소비한다)** 을
// 가져갔고, 남는 것이 「부착 + 지연 폭발」인데 지연은 백광 발현이 이미 갖고 있다.
// 셋과 하나도 안 겹치는 동사를 새로 찾은 것이 **돌아온다**이다.
// ⚠️ 왕복 ↔ 무속성 기본공격의 「2회 튕김」 — 저건 **반사**(부딪힌 각도대로 꺾임)
// 이고 이건 **귀환**(반드시 내게로 돌아옴)이다. 튕김은 어디로 갈지 모르고,
// 귀환은 돌아오는 길을 **미리 알고 서 있을 수 있다**.
mgFireReturn(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  mgInit(st,SC,[[-44,-72,10],[16,-94,11],[54,-58,10],[-74,-18,9],[70,8,9],
    [-18,-42,9],[34,-24,9]]);
  stepFoes(st.F,dt);
  const N=[1,1,2,3,4][LV-1];              // 동시에 나가 있는 불덩이 — 성장축
  const BOW=(atL(2)?32:0)*SC;             // L2 — 돌아오는 길이 갈라진다
  const RANGE=[92,100,100,100,112][LV-1]*SC, CORE=atL(5);
  const PER=1.5, FLY=.72, LANE=.44;
  st.tr=st.tr||[];st.hit=st.hit||[];st.bl=st.bl||[];
  while(st.tr.length<4){st.tr.push([]);st.hit.push({a:new Set(),b:new Set()});}
  const dir=-Math.PI/2;
  for(let i=0;i<N;i++){
    const u=(t/PER+i/N)%1, ang=dir+(i-(N-1)/2)*LANE;
    const cs=Math.cos(ang),sn=Math.sin(ang);
    if(u>=FLY){st.tr[i].length=0;                 // 재장전 — 꼬리를 지운다
      st.hit[i].a.clear();st.hit[i].b.clear();continue;}
    const q=u/FLY;
    // 나가는 길과 돌아오는 길 — sin(πq) 가 거리를, sin(2πq) 가 좌우 벌어짐을
    // 맡는다. BOW=0 이면 갔던 길로 그대로 돌아오고(L1), 크면 다른 호로 돌아온다.
    const d0=RANGE*Math.sin(Math.PI*q), s0=BOW*Math.sin(TAU*q);
    const x=cx+cs*d0-sn*s0, y=cy+sn*d0+cs*s0;
    const back=q>=.5, set=back?st.hit[i].b:st.hit[i].a;
    if(!back&&st.hit[i].b.size)st.hit[i].b.clear();
    for(let k=0;k<st.F.length;k++){const f=st.F[k];
      if(set.has(k))continue;
      const dx=cx+f.ox+f.kx-x,dy=cy+f.oy+f.ky-y;
      if(Math.hypot(dx,dy)>f.r+11*SC)continue;
      set.add(k);
      hitFoe(st,f,cx,cy,-dx/(f.r||1),-dy/(f.r||1),18*SC,"ember");
      mgBurn(f,1.3);}                              // 두 번 지나면 2중첩
    st.tr[i].push([x,y]);if(st.tr[i].length>16)st.tr[i].shift();
    // L5 각성 — 돌아와 몸에 안기는 순간 작게 터진다. 만렙이 개수만 늘면
    // 「하나 더」로 끝나는데, 귀환에 사건을 붙이면 **왕복이 완결**된다.
    if(CORE&&q>.94&&!st.hit[i].done){st.hit[i].done=1;
      st.bl.push({x:cx,y:cy,l:0});
      for(const f of st.F)if(Math.hypot(f.ox,f.oy)<34*SC+f.r){
        hitFoe(st,f,cx,cy,f.ox/(Math.hypot(f.ox,f.oy)||1),
          f.oy/(Math.hypot(f.ox,f.oy)||1),30*SC,"ember");mgBurn(f,1.1);}}
    if(q<.5)st.hit[i].done=0;}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  for(let i=st.bl.length-1;i>=0;i--){st.bl[i].l+=dt;if(st.bl[i].l>.3)st.bl.splice(i,1);}
  stepP(st,dt);
  mgMarks(c,t,cx,cy,st.F,"burn","ember",SC);
  // **빈 슬롯도 그린다.** 정지 화면에서 「지금 두 개가 나가 있다」와 「상한이
  // 둘이다」는 다른 말인데, 나가 있는 것만 그리면 둘이 같아 보인다. 몸 둘레의
  // 대기 고리가 상한을, 그중 켜진 것이 현재를 말한다(2026-08-11 규약).
  for(let i=0;i<N;i++){const ang=dir+(i-(N-1)/2)*LANE;
    const u=(t/PER+i/N)%1, out=u<FLY;
    const sx=cx+Math.cos(ang)*26*SC, sy=cy+Math.sin(ang)*26*SC;
    celHoop(c,sx,sy,5.5*SC,.6,ang,2*SC,"ember",out?.28:.85);
    if(!out)celSplash(c,sx,sy,3.4*SC,6,i*3,"ember",.8);
    // **돌아오는 길을 미리 그린다.** 정지 화면에서 L1(갔던 길로 되돌아옴 = 선
    // 하나)과 L2(갈라진 귀환 = 눈 모양 고리)를 가르는 것은 이 예고선뿐이다 —
    // 꼬리는 0.1초치라 호의 모양을 못 말한다(2026-08-11 렌더 판정).
    // 게임에서도 「돌아올 자리를 알고 선다」가 이 무기의 조작이라, 예고선은
    // 연출이 아니라 규칙의 일부다.
    const cs=Math.cos(ang),sn=Math.sin(ang),P0=[];
    for(let k=0;k<=30;k++){const q=k/30;
      const d0=RANGE*Math.sin(Math.PI*q), s0=BOW*Math.sin(TAU*q);
      P0.push([cx+cs*d0-sn*s0, cy+sn*d0+cs*s0]);}
    celStroke(c,P0,1.6*SC,"ember",.2);}
  for(let i=0;i<N;i++){const T0=st.tr[i];if(!T0||T0.length<2)continue;
    const p=T0[T0.length-1],pp=T0[T0.length-2];
    const mv=Math.atan2(p[1]-pp[1],p[0]-pp[0]);
    // 꼬리 → 몸 → 혀. 꼬리가 있어야 「돌아오는 중」이 정지 화면에서도 읽힌다.
    dep(c,p[1],cy,(c,dz)=>{
      celRibbon(c,T0,9*SC,"ember",.75*dz);
      celRound(c,p[0],p[1],mv,17*SC,6.5*SC,"ember",dz,.8);
      if(CORE)celRound(c,p[0],p[1],mv,11*SC,3*SC,"white",dz*.9,0);
      flame(c,p[0],p[1],SC*.5,.3,"ember",mv+Math.PI/2);});}
  for(const b of st.bl){const f=1-b.l/.3;
    celPuff(c,b.x,b.y,Math.max(1,26*SC*(.6+(1-f)*.7)),9,17,"ember",f);}
  drawP(c,st);hero(c,t,cx,cy);},

// ── 빙 1 · 빙벽 氷壁 ───────────────────────────────────────────────────────
// **축 = 차단(지형 설치).** 열아홉 중 **적을 못 지나가게 하는 것**이 하나도 없었다.
// 결계는 몸에 붙은 껍질이라 위치를 못 고르고, 이건 **바닥에 세우는 물건**이라
// 「어디에 서서 어디를 막을까」가 생긴다. 그리고 빙의 정체대로 막다가 **깨진다** —
// 영구 지형이 아니라 소모품이고, 뚫리면 그 틈으로 들어온다.
// 닿아 있는 동안 동상이 걸리므로 설(감속 +40%)이 벽 뒤의 시간을 늘려 준다.
mgIceWall(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  mgInit(st,SC,[[-38,-104,10],[8,-118,11],[46,-98,10],[-72,-92,9]]);
  stepFoes(st.F,dt);
  const NP=[3,5,5,5,5][LV-1], ROWS=atL(4)?2:1, SHARD=atL(3), WING=atL(5);
  // ⚠️ 내구가 너무 얇았다 — 넷이 붙으면 0.6초에 부서지고 1.6초를 쉬어, **L1 칸이
  // 대부분 빈 벽**으로 찍혔다(2026-08-11 렌더 판정: pn=0/3). 벽은 「대부분 서 있고
  // 가끔 뚫린다」라야 차단이 정체가 된다. 서 있는 시간 : 없는 시간 ≈ 5 : 1.
  const WY=-45*SC, PW=11.5*SC, PH=32*SC, GAP=25*SC, REGROW=1.0, WEAR=.2;
  // 판 배치는 레벨이 바뀌면 다시 깐다 — 성장표는 칸마다 LV 가 다르므로, 한 번
  // 만든 배열을 재활용하면 L1 의 판이 L5 칸에 남는다.
  if(!st.pn||st.pnLV!==LV){st.pnLV=LV;st.pn=[];
    for(let r=0;r<ROWS;r++)for(let i=0;i<NP;i++)
      st.pn.push({x:(i-(NP-1)/2)*GAP,y:WY+r*13*SC,hp:1,dead:0,brk:0,sd:i*3.7+r*1.9});
    // L5 각성 — **ㄷ자.** 옆구리가 막히는 순간 「벽」이 「방」이 된다.
    if(WING)for(let s=-1;s<=1;s+=2)for(let i=0;i<2;i++)
      st.pn.push({x:s*((NP-1)/2*GAP+GAP*.62),y:WY+18*SC+i*18*SC,
        hp:1,dead:0,brk:0,sd:s*7+i*2.3});}
  const SPD=31*SC;
  for(const f of st.F){
    let best=null,bd=1e9;
    for(const p of st.pn){const d=Math.abs(f.ox-p.x);if(d<bd&&p.dead<=0){bd=d;best=p;}}
    const stopY=best?best.y-PH*.62-f.r:-1e9;
    if(best&&bd<PW*1.8&&f.oy+SPD*dt>stopY){
      f.oy=stopY;f.kx+=(f.ox-best.x)*.06;
      best.hp-=dt*WEAR;
      f.pv=Math.min(1.4,(f.pv||0)+dt*1.1);        // 닿아 있는 것만으로 동상
      if(best.hp<=0){best.hp=1;best.dead=REGROW;best.brk=SHARD?.4:0;
        if(SHARD)emit(st,cx+best.x,cy+best.y-PH*.4,12,
          {k:"frost",sp:150*SC,r:2.8*SC,life:.5,g:90*SC,spikeP:.85});}}
    else{const d=Math.hypot(f.ox,f.oy)||1;
      f.ox-=f.ox/d*SPD*dt;f.oy-=f.oy/d*SPD*dt;
      if(d<26*SC){f.ox=f.hx;f.oy=f.hy;}}          // 뚫린 놈은 몸을 지나 제자리로
    if(f.pv>0)f.pv-=dt*.3;}
  for(const p of st.pn){if(p.dead>0)p.dead-=dt;if(p.brk>0)p.brk-=dt;}
  stepP(st,dt);
  mgMarks(c,t,cx,cy,st.F,"frost","frost",SC);
  // 판 하나 — 밑동이 넓고 위가 톱니. 3단 계조를 같은 실루엣의 축소본으로 겹치되
  // 위쪽을 조금 올려, 앞날이 「윗면에 맺힌 빛」으로 보이게 한다.
  const panel=(x,y,g,hp)=>{
    const w=PW*g,h=PH*g;if(w<=.4||h<=.4)return;
    const P=(ww,hh,dy)=>[[x-ww,y+dy],[x-ww*.88,y-hh*.5+dy],[x-ww*.46,y-hh*.86+dy],
      [x-ww*.06,y-hh+dy],[x+ww*.34,y-hh*.76+dy],[x+ww*.74,y-hh*.42+dy],[x+ww,y+dy]];
    fillPoly(c,P(w,h,0),A(TONE.frost[0],.95));
    fillPoly(c,P(w*.70,h*.88,-h*.03),A(TONE.frost[1],.92));
    fillPoly(c,P(w*.28,h*.66,-h*.06),A(TONE.frost[2],1));
    // 금 — 내구가 닳을수록 는다. 숫자를 안 보여주고 「곧 깨진다」를 말한다.
    const nc=hp<.7?(hp<.36?2:1):0;
    for(let k=0;k<nc;k++){const sd=Math.abs(x)*.3+k*4.1;
      celStroke(c,[[x-w*.4+hash(sd)*w*.6,y],[x-w*.1+hash(sd+1)*w*.4,y-h*.42],
        [x-w*.3+hash(sd+2)*w*.7,y-h*.78]],1.6*SC,"white",.85);}
    shards(c,x,y,w*1.2,4,Math.abs(x)*.7,.45,"frost");
    // L3 의 정지 화면 표식 — **깨진 조각이 밑동에 쌓여 있다.** 「깨질 때 파편이
    // 튄다」는 깨지는 그 0.4초에만 보여서, 성장표에서 L3 칸이 L2 와 똑같이
    // 찍혔다(2026-08-11 렌더 판정). 쌓인 조각은 늘 있으므로 정지 화면이 레벨을
    // 말한다 — 「이 벽은 부서지며 싸운다」가 한눈에 읽힌다.
    if(SHARD)shards(c,x,y+h*.22,w*1.9,6,Math.abs(x)*.31+2,.55,"frost");};
  for(const p of st.pn){
    const x=cx+p.x,y=cy+p.y;
    if(p.dead>0){
      if(p.brk>0){const f=p.brk/.4;                // L3 — 깨진 순간의 파편
        celSplash(c,x,y-PH*.4,Math.max(1,PW*1.6*f+PW*.6),9,p.sd,"frost",f);
        shards(c,x,y,PW*1.8,6,p.sd+3,f*.8,"frost");}
      if(p.dead<.45)panel(x,y,1-p.dead/.45,1);     // 다시 돋는 중
      continue;}
    panel(x,y,1,p.hp);}
  drawP(c,st);hero(c,t,cx,cy);},

// ── 빙 2 · 서릿발 霜柱 ─────────────────────────────────────────────────────
// **축 = 돌기(순차 열).** 광주는 **몸 주위 원** 위에 동시에 솟지만 이건 발밑에서
// 시작해 **앞으로 한 칸씩** 돋는다 — 도달까지 시간이 걸리니 「앞질러 깔기」가
// 되고, 원이 아니라 선이라 **뒤가 비어 있다.** 같은 「솟는 것」이라도 쓰는 법이
// 정반대다.
mgIceSpine(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  mgInit(st,SC,[[-20,-58,10],[26,-84,11],[-48,-96,10],[8,-116,9],[54,-70,9]]);
  stepFoes(st.F,dt);
  const N=[5,8,8,8,8][LV-1], ROWS=atL(3)?2:1, BARB=atL(4), BOSS=atL(5);
  const PER=[1.6,1.6,1.5,1.5,1.4][LV-1], STEP=.052, RISE=.11;
  const R0=26*SC, GAP=14*SC, LEN=27*SC, WID=6.6*SC;
  const u=saw(t,PER), pu=st.pu===undefined?u:st.pu;st.pu=u;
  const rowAng=r=>-Math.PI/2+(ROWS>1?(r?.26:-.26):0);
  // 돋는 순간에만 때린다 — 서 있는 동안 계속 때리면 장판(성역)이 된다.
  for(let r=0;r<ROWS;r++)for(let j=0;j<N;j++){const at=j*STEP;
    if(!(pu<at&&u>=at))continue;
    const ang=rowAng(r),d=R0+j*GAP,x=Math.cos(ang)*d,y=Math.sin(ang)*d;
    for(const f of st.F)if(Math.hypot(f.ox-x,f.oy-y)<LEN*.5+f.r){
      hitFoe(st,f,cx,cy,0,-1,16*SC,"frost");f.pv=Math.min(2,(f.pv||0)+1);}
    emit(st,cx+x,cy+y,6,{k:"frost",sp:90*SC,r:2.6*SC,life:.45,g:120*SC,spikeP:.8});}
  if(BOSS&&pu<.62&&u>=.62){const ang=rowAng(0),d=R0+N*GAP;
    const x=Math.cos(ang)*d,y=Math.sin(ang)*d;
    for(const f of st.F)if(Math.hypot(f.ox-x,f.oy-y)<LEN*1.3+f.r){
      hitFoe(st,f,cx,cy,0,-1,30*SC,"frost");f.pv=Math.min(2.5,(f.pv||0)+2);}
    emit(st,cx+x,cy+y,16,{k:"frost",sp:160*SC,r:3.2*SC,life:.6,g:120*SC,spikeP:.85});}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.3;
  stepP(st,dt);
  mgMarks(c,t,cx,cy,st.F,"frost","frost",SC);
  const spine=(x,y,g,big)=>{
    if(g<=.02)return;
    const L=LEN*g*(big?2.1:1),Wd=WID*g*(big?1.7:1);
    dep(c,y,cy,(c,dz)=>{
      celSpike(c,x,y,-Math.PI/2,L,Wd,"frost",dz);
      // L4 갈퀴 — 가시 하나가 **셋**이 된다. 개수를 안 늘리고 형태를 늘린 자리다.
      if(BARB&&!big){celSpike(c,x,y,-Math.PI/2+1.0,L*.46,Wd*.5,"frost",dz*.9);
        celSpike(c,x,y,-Math.PI/2-1.0,L*.46,Wd*.5,"frost",dz*.9);}
      if(big){const hr=Math.max(1,L*.55);
        celHoop(c,x,y,hr,.4,0,hr*.28,"frost",dz*.8);
        for(let k=0;k<5;k++)
          celSpike(c,x,y,-Math.PI/2+(k-2)*.52,L*(.42+.1*k),Wd*.44,"frost",dz*.7);}
      shards(c,x,y,Math.max(1,Wd*1.7),5,Math.abs(x)*.7,dz*.6,"frost");});};
  for(let r=0;r<ROWS;r++)for(let j=0;j<N;j++){
    const life=u-j*STEP;if(life<0||life>.52)continue;
    const g=life<RISE?life/RISE:Math.max(0,1-(life-RISE)/.30);
    const ang=rowAng(r),d=R0+j*GAP;
    spine(cx+Math.cos(ang)*d,cy+Math.sin(ang)*d,g,false);}
  if(BOSS){const life=u-.62;
    if(life>=0&&life<.34){const g=life<.09?life/.09:Math.max(0,1-(life-.09)/.25);
      const ang=rowAng(0),d=R0+N*GAP;
      spine(cx+Math.cos(ang)*d,cy+Math.sin(ang)*d,g,true);}}
  drawP(c,st);hero(c,t,cx,cy);},

// ── 빙 3 · 결빙 結氷 ───────────────────────────────────────────────────────
// **축 = 구속(단일 대상).** 열아홉은 전부 「여럿을 얼마나 때리나」로 갈리는데
// 이것만 **한 놈을 아예 멈춘다.** 그리고 멈춘 것으로 안 끝난다 — 관이 깨질 때
// 옆을 벤다. 「멈추고 깨진다」를 한 스킬 안에서 다 하는 빙의 표본이다.
// 갇힌 동안은 감속의 극단(정지)이라, 설(감속 +40%)이 가두는 시간에 얹힌다.
mgIceTomb(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  mgInit(st,SC,[[-58,-40,11],[44,-58,10],[-8,-86,10],[64,16,9],[-42,36,9],[14,60,10]]);
  stepFoes(st.F,dt);
  const NT=[1,1,2,2,3][LV-1], SHT=atL(2), SHELL=atL(4)?3:2, RING=atL(5);
  const HOLD=[1.5,1.5,1.5,1.9,1.9][LV-1], BR=29*SC;
  st.tb=st.tb||[];st.sh=st.sh||[];st.rg=st.rg||[];
  if(st.tb.length<NT){const ex=new Set(st.tb.map(b=>b.i));
    let best=-1,bd=1e9;
    st.F.forEach((f,i)=>{if(ex.has(i))return;const d=Math.hypot(f.ox,f.oy);
      if(d<bd){bd=d;best=i;}});
    if(best>=0)st.tb.push({i:best,u:0});}
  for(let k=st.tb.length-1;k>=0;k--){const b=st.tb[k];b.u+=dt/HOLD;
    const f=st.F[b.i];f.kx*=.2;f.ky*=.2;                 // 갇힌 것은 안 밀린다
    f.pv=Math.max(f.pv||0,1.2);
    if(b.u<1)continue;
    const x=cx+f.ox,y=cy+f.oy;
    st.sh.push({x,y,l:0,r:f.r+9*SC});
    if(RING)st.rg.push({x,y,l:0});
    hitFoe(st,f,cx,cy,0,0,0,"frost");
    // L2 파쇄 — **깨진 관이 옆을 벤다.** 가두기만 하면 한 놈에게 쓴 값이 안
    // 나온다(무리 게임에서 단일 구속은 그 자체로는 손해다).
    if(SHT)for(const g of st.F){if(g===f)continue;
      const dx=cx+g.ox-x,dy=cy+g.oy-y,d=Math.hypot(dx,dy)||1;if(d>BR+g.r)continue;
      hitFoe(st,g,cx,cy,dx/d,dy/d,34*SC,"frost");g.pv=Math.min(2,(g.pv||0)+1);}
    emit(st,x,y,14,{k:"frost",sp:170*SC,r:3*SC,life:.5,spikeP:.85});
    st.tb.splice(k,1);}
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.3;
  for(let i=st.sh.length-1;i>=0;i--){st.sh[i].l+=dt;if(st.sh[i].l>.42)st.sh.splice(i,1);}
  for(let i=st.rg.length-1;i>=0;i--){st.rg[i].l+=dt;if(st.rg[i].l>1.3)st.rg.splice(i,1);}
  stepP(st,dt);
  for(const r of st.rg){const f=1-r.l/1.3;      // L5 — 깨진 자리가 언 채로 남는다
    const rr=Math.max(1,BR*(.6+.4*(1-f)));
    celHoop(c,r.x,r.y,rr,.42,0,rr*.16,"frost",f*.5);}
  mgMarks(c,t,cx,cy,st.F,"frost","frost",SC);
  // 관 — **반투명이라 안이 비친다.** 불투명하면 「덩어리로 바뀌었다」가 되어
  // 누가 갇혔는지 안 보이고, 그러면 표적을 고른 보람이 없다.
  for(const b of st.tb){const f=st.F[b.i],x=cx+f.ox,y=cy+f.oy;
    // ⚠️ 관을 적 반지름 +9 로 씌웠더니 **동상 표식과 구별이 안 됐다**(2026-08-11
    // 렌더 판정: 「적 위의 파란 얼룩」). 「가뒀다」가 보이려면 관이 적보다
    // 확실히 커야 한다 — +16 에 뿔을 세워 결정으로 읽히게 한다.
    const form=Math.min(1,b.u/.14), rr=(f.r+16*SC)*form;
    if(rr<=.5)continue;
    // L2 의 정지 화면 표식 — **깨질 때 벨 반경**을 미리 그린다. 파쇄는 관이
    // 터지는 0.4초에만 보여 성장표의 L2 칸이 L1 과 똑같이 찍혔다(2026-08-11).
    // 게임에서도 「저 관 옆에 서면 같이 맞는다」를 읽을 수 있어야 하므로,
    // 이 고리는 연출이 아니라 규칙의 예고다.
    if(SHT)celHoop(c,x,y,Math.max(1,BR),.5,0,1.7*SC,"frost",.14+.12*b.u);
    for(let s=0;s<SHELL;s++){const q=1-s*.24;
      fillPoly(c,jagPoly(x,y,rr*q,7,b.i*3.1+s*1.7,1.4,1.18),
        A(TONE.frost[s===0?0:1],(s===0?.55:.32)*form));}
    fillPoly(c,jagPoly(x,y-rr*.2,rr*.34,6,b.i*2.3,1.15,1.1),A(TONE.frost[2],.6*form));
    // 마지막 0.2 — 금이 간다. 예고 없이 풀리면 「왜 나갔지」가 된다.
    if(b.u>.8){const cr=(b.u-.8)/.2;
      for(let k=0;k<3;k++)celStroke(c,[[x-rr*.7+k*rr*.5,y-rr],[x-rr*.3+k*rr*.5,y],
        [x-rr*.8+k*rr*.5,y+rr*.8]],1.7*SC,"white",cr*.9);}}
  for(const s of st.sh){const f=1-s.l/.42;
    celSplash(c,s.x,s.y,Math.max(1,s.r*(1+(1-f)*1.4)),11,7,"frost",f);
    for(let i=0;i<9;i++)celSpike(c,s.x,s.y,i/9*TAU+.3,s.r*2.4*f,s.r*.24*f,"frost",f*.85);
    shards(c,s.x,s.y+s.r*.6,s.r*1.6,7,19,f*.7,"frost");}
  drawP(c,st);hero(c,t,cx,cy);},

// ── 빙 4 · 빙판 氷板 ───────────────────────────────────────────────────────
// **축 = 미끄러뜨린다(제어 박탈).** 서른 종을 통틀어 **적의 조향을 뺏는** 것은
// 이것뿐이다. 감속(동상)은 「느려진다」, 끌어당김은 「모인다」, 넉백은 「밀린다」
// — 전부 **속도**를 건드리는데 빙판만 **방향**을 건드린다. 판 위의 적은 가고
// 싶은 쪽으로 못 꺾고 관성대로 미끄러져 나를 지나친다.
// ⚠️ 원래 이 자리는 「파쇄(동상을 소비하는 기폭)」였는데 **폐기**했다
// (2026-08-11): 독·창작 계열이 **기폭 = 소비한다**를 가져갔고, 예고 뒤 터지는
// 부분은 백광 발현의 **시한**과도 겹쳤다. 둘 다 안 밟는 동사를 새로 찾았다.
// ⚠️ 성역(장판)과 형태가 붙어 보일 자리라 **판은 피해를 거의 안 준다** — 성역은
// 「밟으면 아픈 원」이고 빙판은 「밟으면 못 서는 바닥」이다. 그림에서도 갈랐다:
// 성역은 룬 고리(테두리만), 빙판은 **채운 면 + 미끄럼 자국**.
// 얼음이 「멈추게도 하고 못 멈추게도 한다」는 것이 이 스킬의 농담이고,
// 판 위에서는 동상이 계속 덧칠되므로 설 雪 의 감속 +40% 가 그대로 물린다.
mgIceSlick(c,t,dt,W,H,st){const cx=W/2,cy=H/2,SC=Math.min(W,H)/238;
  mgInit(st,SC,[[-92,-52,10],[86,-46,10],[-24,-104,10],[30,100,9],
    [-100,34,9],[96,40,9]]);
  stepFoes(st.F,dt);
  const NP=[1,1,2,2,3][LV-1], LIP=atL(2), THICK=atL(4), BRIDGE=atL(5);
  const PR=[34,34,34,40,40][LV-1]*SC, SPD=46*SC;
  // 판 자리는 **고정**이다. 무작위로 깔면 레벨 비교가 그 판의 운이 된다.
  const SPOT=[[0,-30],[-46,22],[46,20]].map(v=>[cx+v[0]*SC,cy+v[1]*SC]);
  const onIce=(x,y)=>{for(let i=0;i<NP;i++){
    const dx=x-SPOT[i][0],dy=(y-SPOT[i][1])/.55;
    if(dx*dx+dy*dy<PR*PR)return i;}return -1;};
  for(const f of st.F){
    const fx=cx+f.ox,fy=cy+f.oy;
    const ice=onIce(fx,fy)>=0;
    const d=Math.hypot(f.ox,f.oy)||1;
    const tx=-f.ox/d*SPD, ty=-f.oy/d*SPD;      // 가고 싶은 방향(몸 쪽)
    f.vx=f.vx||tx;f.vy=f.vy||ty;
    // **조향력**이 전부다. 맨바닥에서는 즉시 방향을 바꾸고(6), 얼음 위에서는
    // 거의 못 바꾼다(0.5) — 그래서 지나쳐 미끄러진다.
    const k=Math.min(1,(ice?.5:6)*dt);
    f.vx+=(tx-f.vx)*k;f.vy+=(ty-f.vy)*k;
    f.ox+=f.vx*dt;f.oy+=f.vy*dt;
    if(ice){f.pv=Math.min(1.6,(f.pv||0)+dt*(THICK?1.3:.9));
      f.sk=1;
      // L2 턱 — 판 밖으로 미끄러져 나가려는 놈이 **테에 걸려 되돌아온다**.
      // 판이 「그냥 지나가는 바닥」이 아니라 「빠져나오기 어려운 곳」이 된다.
      if(LIP){const i2=onIce(fx,fy),dx=fx-SPOT[i2][0],dy=(fy-SPOT[i2][1])/.55;
        const dd=Math.hypot(dx,dy);
        if(dd>PR*.82){const nx=dx/(dd||1),ny=dy/(dd||1);
          if(f.vx*nx+f.vy*ny>0){f.vx-=nx*2*(f.vx*nx+f.vy*ny);
            f.vy-=ny*2*(f.vx*nx+f.vy*ny);
            f.pv=Math.min(1.8,(f.pv||0)+.2);}}}}
    else f.sk=Math.max(0,(f.sk||0)-dt*3);
    if(f.pv>0)f.pv-=dt*.28;
    // 몸에 닿거나 칸 밖으로 나가면 제자리로(시안은 적이 안 죽는다).
    if(d<22*SC||Math.abs(f.ox)>W*.62||Math.abs(f.oy)>H*.62){
      f.ox=f.hx;f.oy=f.hy;f.vx=0;f.vy=0;}}
  stepP(st,dt);
  // 판 — **채운 면 + 빗금.** 테두리만 그리면 성역(룬 고리)과 같은 그림이 된다.
  const plate=(x,y,r,al)=>{
    fillPoly(c,jagPoly(x,y,r,10,x*.31,1.06,.55),A(TONE.frost[0],.55*al));
    fillPoly(c,jagPoly(x,y,r*.74,10,x*.31+1.7,1.04,.55),A(TONE.frost[1],.26*al));
    for(let k=0;k<3;k++)celStroke(c,[[x-r*.62+k*r*.42,y+r*.14],
      [x-r*.24+k*r*.42,y-r*.16]],1.7*SC,"frost",.5*al);   // 매끈하다는 유일한 신호
    if(LIP)celHoop(c,x,y,r,.55,0,r*.11,"frost",.75*al);
    if(THICK)for(let k=0;k<5;k++){const a=k/5*TAU+x*.01;   // 두꺼워진 판 — 결정이 돋는다
      fillPoly(c,jagPoly(x+Math.cos(a)*r*.66,y+Math.sin(a)*r*.36,r*.13,6,k*3.7,1.3),
        A(TONE.frost[2],.55*al));}};
  // L5 각성 — 판이 **이어진다.** 사이가 다리로 붙으면 세 판이 하나의 빙원이 되어
  // 「돌아서 피한다」가 막힌다.
  if(BRIDGE)for(let i=0;i<NP;i++){const a=SPOT[i],b=SPOT[(i+1)%NP];
    const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
    fillPoly(c,[[a[0]-dy/L*PR*.3,a[1]+dx/L*PR*.3],[b[0]-dy/L*PR*.3,b[1]+dx/L*PR*.3],
      [b[0]+dy/L*PR*.3,b[1]-dx/L*PR*.3],[a[0]+dy/L*PR*.3,a[1]-dx/L*PR*.3]],
      A(TONE.frost[0],.4));}
  for(let i=0;i<NP;i++)plate(SPOT[i][0],SPOT[i][1],PR,1);
  // **빈 자리도 그린다** — 상한이 화면에 있어야 「아직 안 깔렸다」와 「더는 못
  // 깐다」가 갈린다(2026-08-11 규약). 안 쓰는 자리는 점선 테로만.
  for(let i=NP;i<3;i++){const s0=SPOT[i];
    for(let k=0;k<8;k++){if(k%2)continue;
      const a0=k/8*TAU;
      c.save();c.translate(s0[0],s0[1]);c.scale(1,.55);
      c.beginPath();c.arc(0,0,PR,a0,a0+.5);
      c.strokeStyle=A(TONE.frost[1],.18);c.lineWidth=2*SC;c.stroke();c.restore();}}
  // 미끄럼 자국 — **정지 화면에서 「미끄러지는 중」을 말하는 유일한 장치**다.
  // 움직임은 스크린샷에 안 남으므로 자국을 남긴다(뒤로 두 줄).
  for(const f of st.F){if(!(f.sk>0))continue;
    const x=cx+f.ox,y=cy+f.oy,L=Math.hypot(f.vx,f.vy)||1;
    const ux=f.vx/L,uy=f.vy/L;
    for(const s0 of[-1,1])celStroke(c,
      [[x-ux*f.r*2.6+ -uy*s0*f.r*.42,y-uy*f.r*2.6+ux*s0*f.r*.42],
       [x-ux*f.r*.9+ -uy*s0*f.r*.42,y-uy*f.r*.9+ux*s0*f.r*.42]],
      2.2*SC,"frost",.5*f.sk);}
  mgMarks(c,t,cx,cy,st.F,"frost","frost",SC);
  drawP(c,st);hero(c,t,cx,cy);},

});

// ── 마운트 — **기존 MAGIC.forEach·LVW·ICL 은 안 건드린다** ─────────────────
// 같은 시각에 다른 계열(뢰·풍·독·창작)이 같은 파일에 붙는다. 기존 표를 고치면
// 네 사람이 같은 줄을 고쳐 충돌이 난다 — 여덟은 자기 블록에서만 붙인다.
const MGFI=[
["mgFireCone","화염방사 火炎放射","EMBER","앞으로 계속 뿜는다 — 서 있는 동안 점화가 덧칠된다(도포)"],
["mgFireTrail","불자취 火跡","EMBER","지나온 자리가 탄다 — 미리 깔아 두는 불(퇴적)"],
["mgFireVortex","화염회오리 火旋","EMBER","떠도는 불기둥이 적을 붙잡아 데리고 다닌다(연행)"],
["mgFireReturn","회염 廻炎","EMBER","던진 불덩이가 호를 그리며 돌아온다 — 같은 줄을 두 번(왕복)"],
["mgIceWall","빙벽 氷壁","FROST","길을 막는 얼음 판. 막다가 깨지고, 뚫리면 들어온다(차단)"],
["mgIceSpine","서릿발 霜柱","FROST","발밑에서 줄지어 솟아 앞으로 꿰뚫는다(돌기)"],
["mgIceTomb","결빙 結氷","FROST","한 놈을 얼음관에 가둔다. 깨는 것이 마무리다(구속)"],
["mgIceSlick","빙판 氷板","FROST","바닥이 얼어 적이 못 선다 — 가고 싶은 쪽으로 못 꺾는다(제어 박탈)"]];

Object.assign(LVT,{
mgFireCone:["분사가 3갈래로 벌어진다 — 원뿔 폭 2배",
  "불웅덩이 — 사거리 끝에 고인다. 분사를 끊어도 남아 태운다",
  "5갈래 — 부채가 꽉 찬다",
  "각성 — 속불이 희게 과열되고 사거리가 는다"],
mgFireTrail:["자취가 두 배로 오래 남는다 — 한 바퀴 돌면 고리가 닫힌다",
  "곁불 — 자취에서 옆으로 혓불이 튄다",
  "두 줄 — 지나온 자리 좌우로 갈라져 깔린다",
  "각성 — 흰 심이 서고 폭이 넓어진다. 끝에서 불티가 떨어져 나간다"],
mgFireVortex:["커지고 **붙잡는다** — 잡힌 적이 회오리를 따라 끌려다닌다. 나선 2가닥",
  "회오리 2개",
  "꺼질 때 터진다 — 끌고 다니던 것을 한꺼번에",
  "각성 — 3개 + 중심에 흰 불기둥"],
mgFireReturn:["갈라진 귀환 — 나간 길로 안 돌아온다. 두 줄을 태운다",
  "불덩이 2개 — 좌우로 갈라져 나간다",
  "3개 — 부채가 채워진다",
  "각성 — 4개 + 흰 과열 심. 돌아와 몸에 안기는 순간 터진다"],
mgIceWall:["판 3 → 5. 벽이 길어져 옆으로 못 돈다",
  "파쇄 — 깨질 때 파편이 튄다",
  "이중 벽 — 앞판이 깨져도 뒷판이 남는다",
  "각성 — ㄷ자로 감싼다. 옆구리가 막힌다"],
mgIceSpine:["가시 5 → 8. 줄이 더 멀리 뻗는다",
  "갈라져 두 줄 — Y자로 벌어진다",
  "갈퀴 — 가시마다 곁가지 둘",
  "각성 — 줄 끝에 거대 가시. 밑동이 통째로 얼어붙는다"],
mgIceTomb:["파쇄 — 관이 깨질 때 옆의 적도 벤다",
  "동시 2명",
  "3겹 껍질 — 더 오래 가둔다",
  "각성 — 3명 + 깨진 자리에 서리 고리가 남는다"],
mgIceSlick:["턱 — 테두리에 고드름이 서서, 미끄러져 나가려던 적이 걸려 되돌아온다",
  "판 2개",
  "판이 두꺼워진다 — 결정이 돋고 위에 선 적에게 동상이 더 빨리 덧칠된다",
  "각성 — 판 3개가 다리로 **이어진다**. 돌아서 피할 길이 막힌다"]});

MGFI.forEach(w=>tile($("magic"),FX,w[0],w[1],w[2],w[3],S));

// 성장표 — 기존 LVW 루프와 **같은 수법**(전역 LV 를 칸마다 갈아끼우고 같은 FX 를
// 부른다). 레벨판을 따로 그리면 표가 거짓말을 한다.
// ⚠️ RECOLOR 는 **안 건드린다** — 마법은 속성을 부여받지 않는다.
MGFI.forEach(([key,nm])=>{
  const row=document.createElement("div");
  box(row,{width:"100%",background:"#13131A",border:"1px solid #26262F",
    borderRadius:"4px",overflow:"hidden",boxSizing:"border-box"});
  row.insertAdjacentHTML("beforeend",
    `<div style="display:flex;align-items:baseline;gap:8px;padding:7px 10px;`+
    `border-bottom:1px solid #26262F"><b style="font-size:13px;color:#EDEDF2">${nm}</b>`+
    `<span style="font-size:10px;color:#5A5A68">마법 공격 · 신설</span></div>`);
  const cells=document.createElement("div");
  box(cells,{display:"flex",flexWrap:"wrap",gap:"1px",background:"#26262F",width:"100%"});
  for(let L=1;L<=5;L++){
    const cell=document.createElement("div");
    box(cell,{width:LVC+"px",flex:"1 1 "+LVC+"px",minWidth:LVC+"px",
      background:"#13131A",boxSizing:"border-box"});
    const cv=document.createElement("canvas");
    box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
    cell.appendChild(cv);
    const txt=L===1?"기준 디자인":((LVT[key]||[])[L-2]||"");
    cell.insertAdjacentHTML("beforeend",
      `<div style="padding:5px 8px 7px;border-top:1px solid #26262F">`+
      `<div style="font-size:10px;font-weight:700;letter-spacing:.06em;`+
      `color:${L===1?"#9494A2":"#FFA83C"}">L${L}</div>`+
      `<div style="font-size:9.5px;color:#9494A2;line-height:1.35;margin-top:2px;`+
      `min-height:2.7em">${txt.replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")}</div></div>`);
    cells.appendChild(cell);
    const fn=FX[key];
    mk(cv,[LVC,LVC],(c,t,dt,W,H,st)=>{const sl=LV;LV=L;
      try{fn(c,t,dt,W,H,st);}finally{LV=sl;}});}
  row.appendChild(cells);LVHOSTS["마법"].appendChild(row);});

// 아이콘 — 110px 에서 **실루엣만으로** 갈려야 한다. 기존 열아홉과 안 겹치게
// 골랐다: 채운 부채꼴 · S자 띠 · 나선 · 도장 · 가로 톱니벽 · 가시 열 ·
// 세로 결정 · 가운데가 빈 파편.
// ⚠️ 헷갈릴 뻔한 것 셋을 일부러 갈랐다:
//   화염방사 ↔ 빛산탄총 — 저쪽은 **창 세 자루**, 이쪽은 **채운 면**
//   빙벽     ↔ 광주     — 저쪽은 **세로 기둥 셋**, 이쪽은 **가로 한 덩이**
//   파쇄     ↔ 섬광     — 저쪽은 **가운데가 찬** 방사, 이쪽은 **가운데가 빈** 파편
const MGIC={ed:TONE.ember[0],eb:TONE.ember[1],el:TONE.ember[2],
  fd:TONE.frost[0],fb:TONE.frost[1],fl:TONE.frost[2]};
const MGICON={
mgFireCone(c,S){const cx=S/2,by=S*.88;              // 채운 부채꼴 3겹
  const wedge=(sp,len,col)=>{const p=[[cx,by]];
    for(let i=0;i<=8;i++){const a=-Math.PI/2-sp+2*sp*(i/8);
      p.push([cx+Math.cos(a)*len,by+Math.sin(a)*len]);}
    ip(c,p,col);};
  wedge(.46,S*.74,MGIC.ed);wedge(.30,S*.66,MGIC.eb);wedge(.12,S*.54,MGIC.el);},
mgFireTrail(c,S){                                    // 매끄러운 S자 띠 + 혓불 둘
  // ⚠️ 꺾인 선으로 그렸더니 **뇌광(지그재그)** 과 붙어 보였다(2026-08-11 렌더
  // 판정). 자취는 「지나간 길」이라 각이 지면 안 된다 — 사인 곡선으로 눕힌다.
  const P=[];
  for(let i=0;i<=24;i++){const q=i/24;
    P.push([S*(.12+.76*q), S*(.56+Math.sin(q*Math.PI*1.6-.5)*.22)]);}
  c.lineCap="round";c.lineJoin="round";
  const st2=(w,col)=>{c.beginPath();
    P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
    c.strokeStyle=col;c.lineWidth=w;c.stroke();};
  st2(S*.21,MGIC.ed);st2(S*.115,MGIC.eb);st2(S*.038,MGIC.el);
  // 혓불 — 삼각 창이 아니라 **불혀**여야 「타는 길」이 된다.
  // ⚠️ [flame] 은 s=1 에서 46px 짜리라, 110px 아이콘에 s=1.9 로 얹었더니 혀가
  // 아이콘을 통째로 먹고 띠가 사라졌다(2026-08-11 렌더 판정). 혀 높이는 아이콘의
  // 1/4 로 — 주인공은 **길**이고 혀는 「그 길이 타고 있다」는 표시다.
  [6,17].forEach((k,i)=>{const p=P[k];
    flame(c,p[0],p[1]-S*.02,S/185*(i?.85:1.1),0,"ember",0);});},
mgFireVortex(c,S){const cx=S/2,cy=S/2;               // 나선
  const spir=(w,col)=>{c.beginPath();
    for(let i=0;i<=40;i++){const q=i/40,a=q*2.4*TAU,r=S*.40*(1-q*.86);
      const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.62-q*S*.10;
      i?c.lineTo(x,y):c.moveTo(x,y);}
    c.strokeStyle=col;c.lineWidth=w;c.lineCap="round";c.stroke();};
  spir(S*.155,MGIC.ed);spir(S*.085,MGIC.eb);spir(S*.030,MGIC.el);},
mgFireReturn(c,S){const cx=S/2;                      // 되돌아오는 고리(D) + 불덩이
  const loop=(w,col)=>{c.beginPath();
    for(let i=0;i<=40;i++){const q=i/40;
      const x=cx+Math.sin(q*TAU)*S*.26, y=S*.80-Math.sin(Math.PI*q)*S*.62;
      i?c.lineTo(x,y):c.moveTo(x,y);}
    c.strokeStyle=col;c.lineWidth=w;c.lineCap="round";c.lineJoin="round";c.stroke();};
  loop(S*.155,MGIC.ed);loop(S*.085,MGIC.eb);loop(S*.030,MGIC.el);
  c.beginPath();c.arc(cx-S*.24,S*.44,S*.10,0,TAU);c.fillStyle=MGIC.ed;c.fill();
  c.beginPath();c.arc(cx-S*.24,S*.44,S*.062,0,TAU);c.fillStyle=MGIC.el;c.fill();},
mgIceWall(c,S){const cx=S/2;                         // 가로 톱니벽 + 금
  const wall=(w,h,col)=>{const y=S*.74,p=[[cx-w,y]];
    for(let i=0;i<=6;i++){const q=i/6;p.push([cx-w+2*w*q,y-h*(i%2?.70:1)]);}
    p.push([cx+w,y]);ip(c,p,col);};
  wall(S*.38,S*.44,MGIC.fd);wall(S*.29,S*.33,MGIC.fb);wall(S*.10,S*.21,MGIC.fl);
  c.beginPath();c.moveTo(cx+S*.11,S*.74);c.lineTo(cx+S*.02,S*.54);c.lineTo(cx+S*.14,S*.38);
  c.strokeStyle="#0C0C12";c.lineWidth=S*.045;c.lineJoin="round";c.stroke();},
mgIceSpine(c,S){                                     // 가시 열 — 계단식으로 커진다
  const h=[.28,.42,.56,.70,.48];
  for(let i=0;i<5;i++){const x=S*(.17+i*.165);
    itri(c,x,S*.84,-Math.PI/2,S*h[i],S*.070,MGIC.fd);
    itri(c,x,S*.84,-Math.PI/2,S*h[i]*.9,S*.034,i===3?MGIC.fl:MGIC.fb);}
  ibar(c,S/2,S*.87,S*.80,S*.055,MGIC.fd,S*.02);},
mgIceTomb(c,S){const cx=S/2,cy=S/2;                  // 세로 육각 결정 + 갇힌 것
  const cry=(w,h,col)=>ip(c,[[cx,cy-h],[cx+w,cy-h*.44],[cx+w,cy+h*.44],
    [cx,cy+h],[cx-w,cy+h*.44],[cx-w,cy-h*.44]],col);
  cry(S*.26,S*.42,MGIC.fd);cry(S*.19,S*.34,MGIC.fb);
  c.beginPath();c.arc(cx,cy+S*.03,S*.09,0,TAU);c.fillStyle="#1A1020";c.fill();
  ip(c,[[cx-S*.13,cy-S*.20],[cx-S*.03,cy-S*.24],[cx-S*.06,cy+S*.10],[cx-S*.14,cy+S*.04]],MGIC.fl);},
mgIceSlick(c,S){const cx=S/2,cy=S/2+S*.06;           // 채운 판 + 미끄럼 자국 둘
  const plate=(r,col)=>{const p=[];
    for(let i=0;i<10;i++){const a0=i/10*TAU,a1=(i+.5)/10*TAU;
      p.push([cx+Math.cos(a0)*r,cy+Math.sin(a0)*r*.5]);
      p.push([cx+Math.cos(a1)*r*.86,cy+Math.sin(a1)*r*.43]);}
    ip(c,p,col);};
  plate(S*.40,MGIC.fd);plate(S*.28,MGIC.fb);
  c.lineCap="round";c.strokeStyle=MGIC.fl;c.lineWidth=S*.05;
  for(const s of[-1,1]){c.beginPath();
    c.moveTo(cx-S*.26,cy+s*S*.07);c.lineTo(cx+S*.20,cy+s*S*.07-S*.05);c.stroke();}},
};
MGFI.forEach(w=>iconTile(MGICON,w[0],w[1],"마법 공격"));


// ═══════════════════════════════════════════════════════════════════════════
// 마법 공격 8종 신설 — 뇌 雷 4 · 풍 風 4                        (2026-08-11)
//
// **물리 무기는 속성을 부여받지만 마법은 태어날 때 속성이 정해져 있다.**
// 그래서 이 여덟은 RECOLOR 로 물드는 물건이 아니다 — 자기 팔레트(뇌=volt
// 레몬 55° · 풍=gale 청록 170°)를 코드에 박고 그린다. 뇌를 초록으로 칠할 수
// 있으면 그건 뇌가 아니다.
//
// ── 축 분업 ────────────────────────────────────────────────────────────────
// 물리의 규율(「한 분류 안에서 축이 겹치면 안 된다」)을 그대로 받는다.
// 팔린 축 — 정면 광역(빛파동) · 몸 주위 공전 · 조준 사격 · 자동 추적 · 산탄 ·
// 각도 훑기(레이저) · **연결/빨대(분뢰)** · **자율 공전 사격+과열(순포)** ·
// 장판(성역) · 파문 · 낙하(낙광) · **연쇄(뇌광)** · 기둥 · 구 방벽(결계) ·
// 정령 · 전역 즉발(개안) · 지속 연소(점화), 그리고 독·창작 계열이 가져간
// **자란다(만연) · 붙는다(기생) · 조인다(극독) · 옮는다(감염) · 소비한다(기폭) ·
// 겹친다=파의 교점 판정(공명) · 배로 는다(분열) · 돌아간다(오행) · 끈다(암전)**
// — 을 전부 피하고, 여덟이 서로도 안 겹치게 **동사**로 갈랐다:
//
//   뇌 «건너뛰고 멈춘다»            풍 «밀고 가린다»
//   ① 낙인  찍힌다 → 차면 터진다     ⑤ 풍벽  **막는다**(선을 세운다)
//   ② 도약  **건너뛴다**(경로가 없다) ⑥ 기류  **실어 나른다**(띠)
//   ③ 정지  **꿴다**(붙잡아 멈춘다)   ⑦ 취풍  **방향을 뺏는다**
//   ④ 굴절  **꺾인다**(직각 즉발)     ⑧ 부양  **띄운다**(유일한 수직 축)
//
// ⚠️ **인력(끌어당김)은 안 쓴다.** 발현 기본공격(`FX.basicMani`)에서 어둠이
// 「블랙홀이 남아 계속 당긴다」(물건)를, 풍·뢰명이 「명중 지점으로 빨아들인다」
// (사건)를 이미 **셋**이나 먹었다. 층이 달라도 **그림이 겹치면 같은 마법으로
// 보인다** — 그래서 회오리 안을 버리고 **풍벽**(막는 선)으로 갈아탔다.
// 남은 바람의 얼굴 넷은 막다 · 나르다 · 홀리다 · 띄우다다.
//
// ⚠️ **뇌광(arc)·분뢰와 헷갈리면 안 된다.** 뇌광은 「적에서 적으로 이어진
// 경로가 화면에 전부 남는」 연쇄이고 분뢰는 「꽂아 두고 빠는 실」이다.
// ②도약은 정반대로 **한 순간에 한 곳에만 존재**해 두 자리를 잇는 것이
// **아무것도 없고**(이으면 즉시 뇌광이 된다), ④굴절은 적과 무관하게
// **직각으로만** 꺾인 길이 한 번에 그어진다(무작위 지그재그의 정반대).
//
// ⚠️ **레벨은 수치가 아니라 성질을 준다**(Vampire Survivors 의 규율, 사용자
// 지시 2026-08-11). 여덟의 L2~L5 서른두 칸에서 **순수 수치 칸은 없다** — 개수
// (눈금·못·도약·벽·갈래·대상) · 형태(ㄱ자·삼각 우리·굽이·직각) · 성질(전도·
// 잔상·파열·역류·실명·낙하 피해) 중 하나가 반드시 눈으로 달라진다.
//
// ── 상태이상 — **확정 8종에서만 가져온다** ────────────────────────────────
// `PASSIVE` 대로 뇌=`shock`(감전: 공속 저하 + 0.05s 경직, 이동은 안 막는다) ·
// 풍=`blind`(실명: 원거리 적의 발사각에 오차). 새 상태는 하나도 안 만들고,
// 그림도 `pvMark` 한 벌만 쓴다 — 같은 상태가 마법마다 달라 보이면 플레이어는
// 상태를 못 배운다. 여덟 전부 `f.pv` 를 세우고 `mark(0)→적→mark(1)` 로 얹는다.
//
// ⚠️ ③정지의 「붙잡아 멈춘다」는 **이동 정지가 아니다.** 감전은 이동을 안
// 막는 것이 확정이라(빙결의 거울상), 못이 꿰는 것은 **공격 시계**다 —
// 화면에서는 제자리 떨림 + 0.05s 경직의 반복으로 보인다.
//
// ── 융화 시너지(`FVSYN`)를 받을 자리 ──────────────────────────────────────
// 버프가 얹힐 손잡이가 없으면 그 융화는 이 마법에 **순 손해**가 된다.
//   자 磁「뇌 연쇄 +1」 → **②도약의 건너뜀 수**(=연쇄 카운트)와 **④굴절의
//     꺾임 수**. 자의 설명이 「전기가 한 번 더 건너뛴다」라 도약이 정확히 그
//     문장이고, 굴절은 꺾임이 곧 마디 수라 +1 이 얹힐 자리가 있다.
//     ①낙인·③정지는 셀 것이 없어 이 버프를 못 받는다 — 넷이 다 받으면
//     그건 축이 안 갈린 것이다.
//   수 水「뇌 피해 +35% · 적을 적신다」 → 젖음은 `affinityMul` 의 뇌 ×2 조건.
//     **①낙인 L3** 이 그 자리다(젖은 적은 눈금이 두 칸씩 오른다).
//   불씨 火種「바람 피해 +30% · **넉백 +50%**」 → **⑤풍벽**이 밀어냄 그 자체고,
//     ⑦취풍의 충돌·⑧부양의 착지 충격파도 넉백을 쓴다.
//   뢰명 雷鳴「바람 **범위** +35%」 → 풍벽 길이 · 기류 폭 · 부양 충격파 반경.
//   장 瘴「독·바람 +20%」 → 풍 넷 전부(피해).
//
// ⚠️ **타일은 238 · 168(성장표) · 110(아이콘) 세 크기로 쓰인다.** 절대 px 를
// 박으면 168 칸에서 잘리므로 좌표·속도가 전부 `U=W/238` 배율을 탄다. 특히
// 속도 — 엔진 절대값(초당 수백 px)을 그대로 쓰면 반너비 84px 짜리 칸을 한
// 프레임에 가로지른다.
// ═══════════════════════════════════════════════════════════════════════════

/// 번개 경로 — **선이 아니라 각진 덩어리다.** 두 점 사이를 N 마디로 쪼개고
/// 마디마다 법선으로 튕겨 꺾은 점열을 돌려준다. 그리는 것은 `celRibbon`(리본
/// 덩어리)이 하고 여기는 좌표만 만든다 — 뇌광이 인라인으로 쓰던 그 문법을
/// 꺼내 쓴 것이라 새 원시함수가 아니다.
/// [sd] 를 시간으로 굴려야 「지지직」이 산다. 고정하면 얼어붙은 철사가 된다.
function bgJag(ax,ay,bx,by,sd,jit,N){
  const P=[];
  for(let s=0;s<=N;s++){const p=s/N;
    let nx=ax+(bx-ax)*p, ny=ay+(by-ay)*p;
    if(s>0&&s<N){const dx=-(by-ay),dy=(bx-ax),L=Math.hypot(dx,dy)||1;
      const j=(hash(sd+s*13.7)-.5)*jit; nx+=dx/L*j; ny+=dy/L*j;}
    P.push([nx,ny]);}
  return P;
}
/// 각인 조각 하나 — 눈금 칸·잔상·못머리가 **전부 이 모양**이라 넷이 한 벌로
/// 읽힌다. jagPoly + fillPoly 조합이고, [on] 이 꺼지면 윤곽만 남는다
/// (「아직 안 찬 칸」은 비어 보여야 채워지는 것이 보인다).
function bgChip(c,x,y,r,sd,k,a,on){
  const T=toneOf(k), P=jagPoly(x,y,r,4,sd,1.25);
  if(on){fillPoly(c,P,A(T[0],.92*a));
    fillPoly(c,jagPoly(x,y,r*.56,4,sd+1.7,1.2),A(T[2],a));}
  else{c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
    c.closePath();c.strokeStyle=A(T[0],.85*a);c.lineWidth=Math.max(1,r*.42);c.stroke();}
}
/// 배율 [U] 를 태운 적 무리. 좌표는 238 기준으로 적고 여기서 한 번에 줄인다.
const bgFoes=(U,l)=>mkFoes(l.map(d=>[d[0]*U,d[1]*U,d[2]*U]));
/// 상태 표식 얹개. **뒤 층 → 적 → 앞 층** 순서라야 적의 몸이 마스크가 된다
/// (basicMani 와 같은 수법). 상태는 속성이 정하므로 인자가 아니라 팔레트에서
/// 끌어온다 — 뇌면 감전, 풍이면 실명 말고 다른 것이 나올 수 없다.
function bgMarker(c,t,dt,cx,cy,st,k,U){
  const PK=PASSIVE[k];
  for(const f of st.F)if(f.pv>0)f.pv-=dt*.55;
  return (L)=>{if(!PK)return;
    for(const f of st.F)if(f.pv>0)
      pvMark(c,cx+f.ox+f.kx,cy+f.oy+f.ky,f.r,PK,f.pv,t,k,U,L);};
}

// ── ① 낙인 烙印 — 「찍힌다 → 차면 터진다」 ────────────────────────────────
// 축은 **누적 임계 자폭**이다. 날아가는 것도 잇는 것도 없다 — 적이 움직이는
// 동안 제 몸에 전하가 쌓이고, 눈금이 다 차는 순간 **그 자리에서 스스로**
// 터진다. 뇌의 「기다렸다 한 번에」를 시간축으로 옮긴 얼굴이라, 공간축의
// 연쇄(뇌광)·실(분뢰)과 정면으로 갈린다.
//
// 레벨이 보이는 자리는 **눈금 칸 수**다: 4 → 3 → 3 → 2 → 2. 칸이 줄면 같은
// 속도로도 빨리 터지므로 「세졌다」가 개수로 읽힌다.
FX.mgBoltBrand=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F){
    st.F=bgFoes(U,[[64,-42,11],[-60,-28,10],[8,60,9],[-34,46,9]]);
    // 젖은 적 둘 — 융화 「수 水」가 만드는 조건이고 damage.dart 가 ×2 를 준다.
    // 둘만 적셔 둬야 L3 에서 **젖은 놈만 빨리 찬다**가 화면에서 비교된다.
    st.F[1].wet=1; st.F[3].wet=1;
    st.F.forEach((f,i)=>{f.br=i*.55; f.rate=1.30+i*.13; f.bl=0; f.fl=0; f.sd=i*7.7+3;});}
  stepFoes(st.F,dt);
  const SLOT=[4,3,3,2,2][LV-1], RAD=(atL(4)?60:42)*U, COND=atL(3), OVER=atL(5);
  for(const f of st.F){
    f.bl=Math.max(0,f.bl-dt*3.0); f.fl=Math.max(0,f.fl-dt*3);
    f.br+=dt*f.rate*(COND&&f.wet?2:1);          // L3 전도 — 젖은 놈은 두 배
    // L5 각성 — **과충전.** 다 차고도 한 칸을 더 먹었다가 두 배로 터진다.
    // 이웃으로 옮기는 안은 버렸다 — 그건 연쇄라 뇌광·분뢰와 축이 겹친다.
    const cap=SLOT+(OVER?1:0);
    if(f.br>=cap){f.br=0; f.bl=1; f.fl=1;
      hitFoe(st,f,cx,cy,0,0,OVER?40:26,"volt"); f.pv=1.0;
      emit(st,cx+f.ox,cy+f.oy,OVER?18:12,
        {k:"volt",sp:190*U,r:3*U,life:.42,spikeP:.7});}}
  const mark=bgMarker(c,t,dt,cx,cy,st,"volt",U);
  stepP(st,dt); mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  for(const f of st.F){
    const x=cx+f.ox+f.kx, y=cy+f.oy+f.ky, fr=Math.min(1,f.br/SLOT);
    dep(c,y,cy,(c,dz)=>{
      if(f.wet)celHoop(c,x,y+f.r*.7,f.r*1.15,.34,0,2.4*U+1,"aqua",(COND?.85:.4)*dz);
      if(fr>.02)celHoop(c,x,y,f.r*1.5,1,0,1.4*U+fr*2.6*U,"volt",(.14+fr*.6)*dz);
      // 눈금 — 각진 조각이 왼쪽부터 찬다. 과충전 칸은 **맨 끝에 하나 더**
      // 붙어 갈퀴처럼 삐져나온다(각성이 실루엣으로 보이는 자리).
      const n=SLOT+(OVER?1:0), gw=8.2*U, gy=y-f.r-12*U;
      for(let i=0;i<n;i++){const gx=x+(i-(n-1)/2)*gw, on=i<Math.floor(f.br);
        bgChip(c,gx,gy+(i>=SLOT?-3*U:0),3.4*U+(on?1*U:0)+(i>=SLOT?.8*U:0),
          f.sd+i*3.1,"volt",Math.min(1,(on?1:.5)*(1+f.fl))*dz,on);}
      if(f.bl>.02){const b=f.bl, RR=RAD*(OVER?1.35:1);
        celSplash(c,x,y,RR*(1-b*.32),11,f.sd,"volt",b*dz);
        for(let i=0;i<6;i++){const a2=i/6*TAU+f.sd;
          celSpike(c,x+Math.cos(a2)*RR*.52,y+Math.sin(a2)*RR*.52,a2,
            RR*.5*b,4.5*U,"volt",b*.9*dz);}}});}
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── ② 도약 跳躍 — 「건너뛴다」 ────────────────────────────────────────────
// 축은 **경로 없는 재출현**이다. 뇌광이 「지나간 자리가 전부 남는 연쇄」라면
// 이쪽은 **한 순간에 한 곳에만 존재**한다 — 떠난 자리에는 빈 윤곽(잔상)만
// 남고 두 자리를 잇는 것은 **아무것도 없다.** 그 없음이 이 마법의 전부라,
// 리본을 한 줄이라도 그으면 정체가 뇌광으로 무너진다.
//
// 성장은 **개수가 아니라 리듬**이다(개수만 늘리면 뇌광의 튕김 수와 안 갈린다):
// L4 부터 도약 간격이 회를 거듭할수록 짧아져 끝에 가서 몰아친다.
// 여기 「건너뜀 수」가 융화 자 磁 의 「연쇄 +1」이 얹히는 손잡이다.
FX.mgBoltBlink=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F){st.F=bgFoes(U,[[58,-52,11],[-56,-40,10],[-20,58,9],[54,40,9],[6,-70,9]]);
    st.g=[]; st.at=[]; st.i=0; st.age=0;}
  stepFoes(st.F,dt);
  const HOPS=[2,3,3,5,5][LV-1], ECHO=atL(3), ACC=atL(4), JOLT=atL(5);
  st.age+=dt;
  const gap=ACC? .40*Math.pow(.76,st.i) : .34;
  if(st.age>gap){
    for(const s of st.at)st.g.push({x:s.x,y:s.y,a:1,sd:s.sd,r:s.r});
    st.i=(st.i+1)%HOPS; st.age=0;
    st.at=[];
    {
      const f=st.F[(st.i*2+((t*2.7)|0))%st.F.length];
      st.at.push({f,x:cx+f.ox,y:cy+f.oy,sd:hash(st.i*5.3)*40,r:20*U});
      hitFoe(st,f,cx,cy,0,0,18,"volt"); f.pv=1.0;
      emit(st,cx+f.ox,cy+f.oy,9,{k:"volt",sp:170*U,r:2.8*U,life:.36,spikeP:.75});
      // L5 각성 — 도착 반경 안의 적이 **전부 감전**된다(확정 상태이상 그대로:
      // 공속 저하 + 0.05s 경직). 「두 자리에 동시에」였던 옛 각성은 버렸다 —
      // 창작 계열의 「분열(배로 는다)」과 축이 겹친다(2026-08-11).
      if(JOLT)for(const g of st.F)
        if(Math.hypot(cx+g.ox-st.at[0].x,cy+g.oy-st.at[0].y)<52*U)g.pv=1.0;}
    // L3 잔상이 문다 — 떠난 자리가 한 번 더 물어 준다. 「없는 것」에 값이
    // 붙는 레벨이라, 잔상을 채우고 밝혀 그 값이 눈에 보이게 한다.
    if(ECHO)for(const g of st.g)if(g.a>.6){
      for(const f of st.F)if(Math.hypot(cx+f.ox-g.x,cy+f.oy-g.y)<f.r+g.r){
        hitFoe(st,f,cx,cy,0,0,9,"volt"); f.pv=1.0;}}}
  for(let i=st.g.length-1;i>=0;i--){const g=st.g[i];
    g.a-=dt*(ECHO?1.5:3.0); if(g.a<=0)st.g.splice(i,1);}
  const mark=bgMarker(c,t,dt,cx,cy,st,"volt",U);
  stepP(st,dt); mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  for(const g of st.g)dep(c,g.y,cy,(c,dz)=>{     // 잔상 — 속이 빈 윤곽
    const P=jagPoly(g.x,g.y,g.r*(1+(1-g.a)*.35),9,g.sd,1.45);
    c.beginPath();P.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.closePath();
    if(ECHO){c.fillStyle=A(TONE.volt[0],.30*g.a*dz);c.fill();}
    c.strokeStyle=A(TONE.volt[ECHO?2:1],(ECHO?.85:.5)*g.a*dz);
    c.lineWidth=Math.max(1,2.2*U);c.stroke();});
  for(const s of st.at){
    s.x=cx+s.f.ox+s.f.kx; s.y=cy+s.f.oy+s.f.ky;
    const pop=Math.min(1,st.age/.06), al=Math.max(.35,1-st.age/(gap*1.6));
    dep(c,s.y,cy,(c,dz)=>{
      celSplash(c,s.x,s.y,s.r*pop,10,s.sd,"volt",al*dz);
      for(let i=0;i<5;i++){const a2=i/5*TAU+s.sd*.3+t*.6;
        celSpike(c,s.x+Math.cos(a2)*s.r*.7,s.y+Math.sin(a2)*s.r*.7,a2,
          s.r*.85*pop,3.6*U,"volt",al*.85*dz);}
      if(JOLT){for(let i=0;i<4;i++){const a2=i/4*TAU+Math.PI/4-t*.9;   // 각성 갈퀴
          celSpike(c,s.x+Math.cos(a2)*s.r*.42,s.y+Math.sin(a2)*s.r*.42,a2,
            s.r*1.25,2.4*U,"volt",al*dz);}
        // 감전이 닿는 자리 — 반경을 눈에 보이게 남긴다
        celHoop(c,s.x,s.y,52*U,1,0,2*U+1,"volt",al*.35*dz);}});}
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── ③ 정지 靜止 — 「꿴다」 ────────────────────────────────────────────────
// 축은 **구속**이다. 열아홉 중 적을 붙잡아 두는 것은 하나도 없었다 — 성역은
// 늦출 뿐이고 파문은 밀어낸다. 여기는 각진 못이 사방에서 박혀 들어와 적을
// 그 자리에 꿴다.
//
// ⚠️ 꿰이는 것은 **발이 아니라 공격 시계**다. 확정 상태이상 감전은 「공속
// 저하 + 0.05s 경직, 이동은 안 막는다」(빙결의 거울상)이므로, 그림도
// 「못 박혀 못 움직인다」가 아니라 **제자리에서 파르르 떠는 것**이라야 한다 —
// 가만히 두면 「멈췄다」가 아니라 「죽었다」로 읽힌다.
FX.mgBoltHalt=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F)st.F=bgFoes(U,[[62,-40,11],[-64,-20,10],[-8,58,10],[40,52,9]]);
  stepFoes(st.F,dt);
  const NT=[1,1,2,2,3][LV-1], NAIL=[4,6,6,6,8][LV-1],
        HOLD=[1.0,1.5,1.5,1.5,1.5][LV-1], POP=atL(4), BARB=atL(5), DOT=atL(5);
  const PER=HOLD+.8, T=saw(t,PER)*PER;
  if(T<(st.pv0||0))st.sel=null;            // 주기가 넘어갔다 — 대상을 다시 고른다
  st.pv0=T;
  if(!st.sel){st.sel=[];const o=((t/PER)|0);
    for(let i=0;i<NT;i++)st.sel.push(st.F[(i*2+o)%st.F.length]);}
  const dr=Math.min(1,T/.22), rel=T>HOLD?Math.min(1,(T-HOLD)/.26):0;
  for(let i=0;i<st.sel.length;i++){const f=st.sel[i];
    if(rel<=0&&dr>=1){                      // 붙잡는 동안 — 파르르 + 감전 갱신
      f.kx=(hash(t*61+i*7)-.5)*2.6*U; f.ky=(hash(t*57+i*11+9)-.5)*2.6*U;
      f.pv=1.0;
      if(DOT&&R()<dt*7)hitFoe(st,f,cx,cy,0,0,3,"volt");}}
  if(rel>0&&!st.done){st.done=1;
    for(const f of st.sel){hitFoe(st,f,cx,cy,0,0,POP?30:12,"volt");
      emit(st,cx+f.ox,cy+f.oy,POP?12:5,
        {k:"volt",sp:(POP?190:90)*U,r:2.8*U,life:.4,spikeP:.7});}}
  if(rel<=0)st.done=0;
  const mark=bgMarker(c,t,dt,cx,cy,st,"volt",U);
  stepP(st,dt); mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  for(let i=0;i<st.sel.length;i++){const f=st.sel[i];
    const x=cx+f.ox+f.kx, y=cy+f.oy+f.ky, live=1-rel;
    dep(c,y,cy,(c,dz)=>{
      celHoop(c,x,y+f.r*.62,f.r*(1.5+rel*.9),.36,0,2.4*U+1,"volt",live*.85*dz);
      for(let j=0;j<NAIL;j++){const a2=j/NAIL*TAU+t*.22+i;
        // 못은 **바깥에서 안으로 박혀 들어온다.** 다 박히면 멈추고, 풀릴 때
        // 튕겨 나간다 — 들어옴·머묾·튕김의 세 단계가 구속의 전부다.
        //
        // ⚠️ 길이를 상수로 두면 다 박힌 순간 **못이 몸을 통과해** 반대편으로
        // 튀어나오고, 여덟 자루가 중심에서 겹쳐 「해바라기」가 된다(첫 렌더에서
        // 그랬다). 길이는 **남은 거리에서 뽑아** 촉이 몸 살짝 안에서 멎게 한다.
        const R0=f.r*(3.3-1.95*dr)+f.r*rel*2.4;
        const LEN=Math.max(f.r*.55,R0-f.r*.42);
        celSpike(c,x+Math.cos(a2)*R0,y+Math.sin(a2)*R0,a2+Math.PI,
          LEN,4.2*U,"volt",(live*.95+rel*.3)*dz);
        if(BARB)bgChip(c,x+Math.cos(a2)*(R0+f.r*.5),y+Math.sin(a2)*(R0+f.r*.5),
          2.8*U,j*3.7+i,"volt",live*.9*dz,1);
        if(POP&&rel>0)celSplash(c,x+Math.cos(a2)*R0,y+Math.sin(a2)*R0,
          f.r*.6*(1-rel),7,j*5.1,"volt",(1-rel)*.8*dz);}});}
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── ④ 굴절 屈折 — 「꺾인다」 ─────────────────────────────────────────────
// 축은 **한 번에 그어지는 꺾인 길**이다. 적을 안 고르고, 잇지 않고, **자라지
// 않는다** — 길 전체가 한 프레임에 그어져 잠시 남았다 사라진다. 그래서
// 「누구를 때리나」가 아니라 **「어디를 지나가나」**가 이 마법의 질문이다.
//
// ⚠️ 여기 있던 「가지」(자라 나가는 방전 나무)는 **버렸다**(2026-08-11).
// 독 계열의 「만연」이 **자란다**를 가져갔고, 층이 달라도 자라 나가는 그림이
// 둘이면 같은 마법으로 보인다. 축을 바꿀 때 그림도 통째로 바꾼 이유다:
// 자라는 것은 **시간**이 축이고 굴절은 **형태**가 축이다.
//
// 갈리는 자리 셋:
//   뇌광(연쇄)  적을 골라 그 사이를 잇는다 · 무작위 지그재그
//   분뢰(연결)  한 놈에게 꽂아 두고 빤다 · 실이 남는다
//   굴절        적과 무관 · **직각으로만** 꺾인다 · 즉발
// 직각은 이 게임에서 여기 하나뿐이라 실루엣만으로 갈린다 — 「번개는 각진
// 덩어리」라는 문법의 극단이고, 무작위 지그재그와 정반대로 **의도된 꺾임**이다.
//
// 레벨은 **길의 모양**으로 읽힌다: 꺾임 2 → 3 → 길 2개 → 마디 폭발 → 꺾임 6.
FX.mgBoltRefract=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F)st.F=bgFoes(U,[[74,-30,11],[-70,-34,10],[-16,68,9],[48,54,9],[-54,28,9]]);
  stepFoes(st.F,dt);
  const TURN=[2,3,3,3,6][LV-1], PATHS=atL(3)?2:1, NODE=atL(4), BARB=atL(5),
        WID=(atL(5)?9:6.5)*U, SEG=[34,44,44,44,40][LV-1]*U;
  const PER=1.15, u=saw(t,PER);
  // ⚠️ 주기 이음매 — 밝기가 u=0 과 u=1 에서 **둘 다 0** 이라야 한다. 즉발은
  // 계단이 아니라 **아주 짧은 오름**(0.03=18ms)으로 낸다: 눈에는 즉발이고
  // 스케줄은 이어져 주기 경계에서 안 튄다(2026-08-10 규약).
  const al=Math.min(1,u/.03)*(u<.58?1:Math.max(0,1-(u-.58)/.42));
  const mark=bgMarker(c,t,dt,cx,cy,st,"volt",U);
  stepP(st,dt); mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  if(al>0){
    const cyc=(t/PER)|0, tick=((t*14)|0);
    // 길 하나 = 직각 마디의 사슬. 시작 방향과 꺾는 손(좌/우)을 주기마다 굴려
    // 같은 그림이 반복되지 않게 한다 — 굴절은 **매번 다른 길**이라야 한다.
    for(let pi=0;pi<PATHS;pi++){
      let x=cx,y=cy,dir=((cyc+pi*2)%4);          // 0:→ 1:↓ 2:← 3:↑
      const pts=[[x,y]];
      for(let s=0;s<=TURN;s++){
        const L=SEG*(.72+.5*hash(cyc*3.1+pi*7.7+s*2.3));
        x+=[1,0,-1,0][dir]*L; y+=[0,1,0,-1][dir]*L;
        pts.push([x,y]);
        dir=(dir+(hash(cyc*5.3+pi*2.1+s*9.1)<.5?1:3))%4;}
      for(let s=0;s<pts.length-1;s++){
        const a0=pts[s],b0=pts[s+1];
        const P=bgJag(a0[0],a0[1],b0[0],b0[1],pi*29+s*13.3+tick,7*U,5);
        dep(c,(a0[1]+b0[1])/2,cy,(c,dz)=>celRibbon(c,P,WID,"volt",al*dz));
        // 마디 — 꺾이는 자리마다 각진 매듭. L4 부터 그 자리가 터진다.
        if(s>0)dep(c,a0[1],cy,(c,dz)=>{
          bgChip(c,a0[0],a0[1],5.2*U,pi*3.7+s,"volt",al*dz,1);
          if(NODE)celSplash(c,a0[0],a0[1],15*U*al,9,pi*5+s*3,"volt",al*.85*dz);
          if(BARB)for(let j=0;j<4;j++)celSpike(c,a0[0],a0[1],j/4*TAU+Math.PI/4,
            11*U,2.2*U,"volt",al*.8*dz);});
        // 판정은 **그려지는 마디 그대로** — 점-선분 거리로 문다.
        for(const f of st.F){
          const px=cx+f.ox-a0[0],py=cy+f.oy-a0[1];
          const vx=b0[0]-a0[0],vy=b0[1]-a0[1],vv=vx*vx+vy*vy||1;
          const h=Math.max(0,Math.min(1,(px*vx+py*vy)/vv));
          if(Math.hypot(px-vx*h,py-vy*h)<f.r+9*U&&R()<dt*10){
            hitFoe(st,f,cx,cy,vx/Math.sqrt(vv),vy/Math.sqrt(vv),12,"volt");
            f.pv=1.0;}}}}}
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── ⑤ 풍벽 風壁 — 「막는다」 ─────────────────────────────────────────────
// 축은 **통행 차단**이다. 열아홉은 전부 「적을 어떻게 때리나」인데 이것만
// 「적을 어디로 못 가게 하나」다 — 피해는 곁다리고, 값은 **길을 지우는 것**에
// 있다. 결계(구 방벽)와는 정반대 물건이다: 결계는 **내 몸에 붙어 나를**
// 감싸고, 풍벽은 **필드에 세워 적을** 가둔다.
//
// ⚠️ 기류(⑥)와 그림이 안 겹치게 못을 박는다. 기류는 **긴 띠를 따라 흐르는**
// 강이고, 풍벽은 **가로질러 선 깃(획)들의 열**이다 — 흐르는 것과 서 있는
// 것이라 실루엣부터 다르다. 여기서 리본을 길게 눕히면 즉시 강이 된다.
//
// 밀어냄이 정체라 융화 불씨(넉백 +50%)가, 벽 길이가 뢰명(범위 +35%)이 얹히는
// 자리다.
FX.mgGaleWall=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F){st.F=bgFoes(U,[[-96,-72,11],[-34,-100,10],[44,-94,9],[98,-44,9],
      [-104,-8,10],[74,-78,9]]);
    st.F.forEach(f=>{f.hx=f.ox;f.hy=f.oy;});}
  stepFoes(st.F,dt);
  // 벽 = [중심x, 중심y, 각도, 반길이]. 레벨이 **장수와 배치**로 자란다:
  // 한 장 → 길어짐 → ㄱ자 모서리 → 삼각 우리 → 닫힌 우리.
  const WSET=[
    [[0,-58,0,42]],
    [[0,-62,0,62]],
    [[0,-62,0,62],[-66,-4,Math.PI/2,50]],
    [[0,-66,0,58],[-68,4,Math.PI/2,52],[68,4,Math.PI/2,52]],
    [[0,-66,0,58],[-68,4,Math.PI/2,52],[68,4,Math.PI/2,52],[0,74,0,58]]];
  const WL=WSET[LV-1].map(w=>({x:cx+w[0]*U,y:cy+w[1]*U,a:w[2],h:w[3]*U,
    d:[Math.cos(w[2]),Math.sin(w[2])],n:[-Math.sin(w[2]),Math.cos(w[2])]}));
  const GAP=[13,9,9,8,7][LV-1]*U, THK=8*U, BLAST=atL(5);
  st.hitfx=st.hitfx||[];
  for(const f of st.F){
    // 적은 플레이어를 향해 걸어온다 — 막히는 것이 보이려면 오는 것이 있어야 한다.
    const d0=Math.hypot(f.ox,f.oy)||1;
    f.ox-=f.ox/d0*30*U*dt; f.oy-=f.oy/d0*30*U*dt;
    for(const w of WL){
      const rx=cx+f.ox-w.x, ry=cy+f.oy-w.y;
      const s=rx*w.d[0]+ry*w.d[1], q=rx*w.n[0]+ry*w.n[1];
      if(Math.abs(s)>w.h+f.r||Math.abs(q)>THK+f.r)continue;
      const sg=q>=0?1:-1, push=(THK+f.r-Math.abs(q));
      f.ox+=w.n[0]*sg*push; f.oy+=w.n[1]*sg*push;      // 벽 밖으로 되민다
      f.ox+=w.d[0]*22*U*dt*(s>=0?1:-1);                // 벽면을 따라 미끄러진다
      f.oy+=w.d[1]*22*U*dt*(s>=0?1:-1);
      if(R()<dt*6){hitFoe(st,f,cx,cy,w.n[0]*sg,w.n[1]*sg,BLAST?60:26,"gale");
        f.pv=1.0;
        st.hitfx.push({x:w.x+w.d[0]*s,y:w.y+w.d[1]*s,l:0});
        emit(st,cx+f.ox,cy+f.oy,BLAST?9:4,
          {k:"gale",sp:150*U,r:2.6*U,life:.4,spikeP:.6});}}
    if(Math.hypot(f.ox,f.oy)<26*U){f.ox=f.hx;f.oy=f.hy;f.kx=0;f.ky=0;}}
  for(let i=st.hitfx.length-1;i>=0;i--){st.hitfx[i].l+=dt*3.2;
    if(st.hitfx[i].l>=1)st.hitfx.splice(i,1);}
  const mark=bgMarker(c,t,dt,cx,cy,st,"gale",U);
  stepP(st,dt); mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  for(let wi=0;wi<WL.length;wi++){const w=WL[wi];
    const NF=Math.max(2,Math.round(w.h*2/GAP));
    for(let i=0;i<=NF;i++){const s=-w.h+2*w.h*i/NF;
      const x=w.x+w.d[0]*s, y=w.y+w.d[1]*s;
      // 깃 하나 — **가로질러 선 초승달 획.** 위상이 벽을 따라 흘러 「바람이
      // 벽면을 훑는다」가 되지만, 획 자체는 제자리라 강으로 안 읽힌다.
      const p=((t*.9+i/NF*1.6+wi*.3)%1), bob=.72+.28*Math.sin(p*TAU);
      dep(c,y,cy,(c,dz)=>{
        // ⚠️ **획의 현(弦)은 rot 과 직각이다.** 처음엔 rot 에 벽의 법선을 넣어
        // 현이 벽을 **따라** 눕는 바람에 「구슬을 꿴 줄」이 됐다(첫 렌더).
        // rot 을 벽 **방향**으로 주면 현이 벽을 **가로질러** 서서 울타리의
        // 살(picket)이 된다 — 그래야 흐르는 강(⑥기류)과 실루엣이 갈린다.
        windStroke(c,t,x,y,THK*2.0*bob,.92,w.a,1.7,4.8*U*bob,"gale",
          (.55+.35*bob)*dz);});}}
  // 부딪힌 자리 — 벽 루프 **밖**에서 한 번만. 안에 두면 벽 수만큼 겹쳐 그려져
  // L4·L5 에서만 터짐이 세 배로 밝아진다(레벨 그림이 거짓말을 한다).
  for(const h of st.hitfx)dep(c,h.y,cy,(c,dz)=>{
    const b=1-h.l;
    celSplash(c,h.x,h.y,(BLAST?26:15)*U*b,9,3,"gale",b*.95*dz);
    if(BLAST)celHoop(c,h.x,h.y,(1-b)*30*U+6*U,1,0,2.6*U+1,"gale",b*.8*dz);});
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── ⑥ 기류 氣流 — 「실어 나른다」 ────────────────────────────────────────
// 축은 **이송**이다. 장판(성역)은 서 있는 자리에 값을 매기지만 강은 **자리를
// 옮긴다** — 띠에 든 적이 흘러가 무리가 통째로 재배치된다. 피해는 곁다리고,
// 값은 「내가 원하는 곳으로 적을 보낸다」에 있다.
//
// 흐름이 보이려면 **기슭이 있어야 한다.** 획만 흘리면 어디까지가 강인지 몰라
// 「띠에 들면 실린다」는 계약이 화면에 안 남는다.
FX.mgGaleStream=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F){st.F=bgFoes(U,[[-96,-54,11],[-74,8,10],[-90,62,9],[18,-76,9],
      [44,26,10],[86,-18,9]]);
    st.F.forEach(f=>{f.hx=f.ox;f.hy=f.oy;});}
  stepFoes(st.F,dt);
  const HW=[15,22,22,22,22][LV-1]*U, BEND=atL(3)?15*U:0,
        NB=atL(5)?3:(atL(4)?2:1), REV=atL(5);
  const B=NB===1?[[-.30,0]]:(NB===2?[[-.30,-32*U],[-.30,34*U]]
        :[[-.30,-44*U],[-.30,0],[-.30,44*U]]);
  const geo=B.map(b=>{const d=[Math.cos(b[0]),Math.sin(b[0])],n=[-d[1],d[0]];
    return{a:b[0],d,n,C:[cx+n[0]*b[1],cy+n[1]*b[1]]};});
  const bend=(s)=>BEND*Math.sin(s*.026+t*1.7);
  const pt=(g,s)=>{const w=bend(s);
    return[g.C[0]+g.d[0]*s+g.n[0]*w, g.C[1]+g.d[1]*s+g.n[1]*w];};
  // L5 각성 — **역류.** 흐름의 세기를 사인 하나로 흔들어 주기마다 방향이
  // 뒤집힌다. 부호를 툭 뒤집으면 획이 한 프레임에 순간이동하므로, 위상은
  // **적분**해서 쓴다(위상 파생값 금지 규약 그대로).
  //
  // ⚠️ 옛 각성은 「두 갈래가 X 로 교차, 교차점에서 부딪힌다」였는데 버렸다 —
  // 창작 계열의 「공명」이 **파의 교점에만 판정**을 가져갔다(2026-08-11).
  // 교점 판정을 지우고 **흐름 자체의 성질**(방향이 뒤집힌다)로 각성을 옮겼다.
  const flow=REV?Math.sin(t*1.05):1;
  st.ph=(st.ph||0)+dt*.42*flow;
  const SPD=62*U;
  for(const f of st.F){const px=cx+f.ox, py=cy+f.oy;
    for(const g of geo){
      const rx=px-g.C[0], ry=py-g.C[1];
      const s=rx*g.d[0]+ry*g.d[1], q=rx*g.n[0]+ry*g.n[1]-bend(s);
      if(Math.abs(q)<HW){
        f.ox+=g.d[0]*SPD*flow*dt; f.oy+=g.d[1]*SPD*flow*dt;   // 실려 간다
        f.ox-=g.n[0]*q*1.2*dt; f.oy-=g.n[1]*q*1.2*dt;         // 물길 가운데로
        if(R()<dt*4){hitFoe(st,f,cx,cy,g.d[0]*flow,g.d[1]*flow,9,"gale");f.pv=1.0;}}}
    if(Math.hypot(f.ox,f.oy)>W*.62){f.ox=f.hx;f.oy=f.hy;f.kx=0;f.ky=0;
      emit(st,cx+f.ox,cy+f.oy,5,{k:"gale",sp:44*U,r:2.4*U,life:.42,spikeP:.5});}}
  const mark=bgMarker(c,t,dt,cx,cy,st,"gale",U);
  stepP(st,dt); mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  const L=W*.74;
  for(let bi=0;bi<geo.length;bi++){const g=geo[bi];
    for(const sg of[-1,1]){const P=[];
      for(let i=0;i<=14;i++){const s=-L+2*L*i/14, p=pt(g,s);
        P.push([p[0]+g.n[0]*HW*sg, p[1]+g.n[1]*HW*sg]);}
      celRibbonEven(c,P,2.4*U,"gale",.32,false);
      // L5 각성 — 기슭에 갈퀴가 선다. 각성은 수치가 아니라 실루엣이다.
      if(REV)for(let i=1;i<14;i+=3){const s=-L+2*L*i/14, p=pt(g,s);
        celSpike(c,p[0]+g.n[0]*HW*sg,p[1]+g.n[1]*HW*sg,
          Math.atan2(g.n[1]*sg,g.n[0]*sg),9*U,2.4*U,"gale",.5);}}
    for(let j=0;j<6;j++){const p0=(((st.ph+j/6+bi*.5)%1)+1)%1;
      const s=-L+2*L*p0, p=pt(g,s);
      const al=Math.min(1,Math.min(p0,1-p0)*6)*.92;
      const b=pt(g,s+9*U), a0=pt(g,s-9*U);
      const ang=Math.atan2(b[1]-a0[1],b[0]-a0[0])+(flow<0?Math.PI:0);
      dep(c,p[1],cy,(c,dz)=>{
        windStroke(c,t,p[0],p[1],HW*1.2,.62,ang,2.1,7*U,"gale",al*dz);
        const o=Math.sin(j*2.3+t*1.1)*HW*.55;
        celSpike(c,p[0]+g.n[0]*o,p[1]+g.n[1]*o,ang,13*U,2.6*U,"gale",al*.8*dz);});}}
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── ⑦ 취풍 醉風 — 「방향을 뺏는다」 ──────────────────────────────────────
// 축은 **조종**이다. 열아홉 중 적의 *의지*를 건드리는 것은 하나도 없었다 —
// 늦추거나 밀거나 죽일 뿐이다. 여기서는 머리 위에 소용돌이가 얹히고 그 놈은
// 제 갈 길을 잃고 비틀거린다.
//
// ⚠️ **소용돌이(스킬)와 자락(상태)은 다른 층이다.** 확정 실명은 「원거리 적의
// 발사각에 오차」이고 그 그림은 `pvMark` 의 스치는 자락 한 벌로 못 박혀 있다.
// 여기서 실명을 새로 그리면 같은 상태가 마법마다 달라 보인다 — 스킬이 그리는
// 것은 **머리 위 소용돌이**뿐이고, 실명은 표식 시스템이 얹는다.
//
// 취한 것이 보이려면 **경로가 휘어야 한다.** 제자리 흔들림은 감전(③정지)의
// 문법이라, 여기는 진행 방향 자체가 천천히 굴러가야 갈린다.
FX.mgGaleDaze=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F){st.F=bgFoes(U,[[66,-44,11],[-62,-30,10],[-10,62,10],[52,44,9]]);
    st.F.forEach((f,i)=>{f.hx=f.ox;f.hy=f.oy;f.wa=hash(i*3.7)*TAU;});}
  stepFoes(st.F,dt);
  const NT=[1,2,2,3,3][LV-1], DUR=[1.4,2.1,2.1,2.1,2.1][LV-1],
        BLIND=atL(3), WOB=atL(4)?1.8:1, BARB=atL(5), EXILE=atL(5);
  const PER=DUR+.7, T=saw(t,PER)*PER;
  if(T<(st.pv0||0))st.sel=null;
  st.pv0=T;
  if(!st.sel){st.sel=[];const o=((t/PER)|0);
    for(let i=0;i<NT;i++)st.sel.push(st.F[(i+o)%st.F.length]);}
  const live=T<DUR;
  for(let i=0;i<st.sel.length;i++){const f=st.sel[i];
    if(!live)continue;
    f.wa+=(hash(t*13+i*5.1)-.5)*dt*7*WOB;
    if(EXILE){                              // L5 각성 — 플레이어 반대쪽으로만
      const away=Math.atan2(f.oy,f.ox);
      f.wa+=(((away-f.wa+Math.PI*3)%TAU)-Math.PI)*dt*1.7;}
    f.ox+=Math.cos(f.wa)*36*U*dt; f.oy+=Math.sin(f.wa)*36*U*dt;
    if(Math.hypot(f.ox,f.oy)>W*.40){f.ox*=.982;f.oy*=.982;}
    // ⚠️ **정지 화면에서는 「비틀거림」이 안 보인다**(첫 렌더에서 그랬다) —
    // 움직임은 프레임 사이에만 있는 정보라, 시안 한 장으로 판정하는 이 표에서는
    // 아무 일도 안 일어나는 것처럼 보인다. 그래서 지나온 자리를 **꼬리로 남긴다**:
    // 휜 경로가 화면에 남으면 그림 하나로 「제 갈 길을 잃었다」가 읽힌다.
    // ⚠️ 18프레임(0.3초)은 **7px 짜리 점**이라 안 보였다. 초당 36U 로 걸으니
    // 1초는 돼야 휜 것이 휜 것으로 보인다 — 64프레임을 문다.
    f.tr=f.tr||[]; f.tr.push([cx+f.ox,cy+f.oy]); if(f.tr.length>64)f.tr.shift();
    if(BLIND)f.pv=1.0;                      // L3 실명 — 그림은 pvMark 가 얹는다
    for(const g of st.sel){if(g===f)continue;      // 취한 놈끼리 부딪힌다
      const d=Math.hypot(f.ox-g.ox,f.oy-g.oy);
      if(d<f.r+g.r&&R()<dt*5){
        hitFoe(st,f,cx,cy,(f.ox-g.ox)/(d||1),(f.oy-g.oy)/(d||1),30,"gale");
        hitFoe(st,g,cx,cy,(g.ox-f.ox)/(d||1),(g.oy-f.oy)/(d||1),30,"gale");}}}
  const mark=bgMarker(c,t,dt,cx,cy,st,"gale",U);
  stepP(st,dt); mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  for(let i=0;i<st.sel.length;i++){const f=st.sel[i];
    const x=cx+f.ox+f.kx, y=cy+f.oy+f.ky, al=live?1:Math.max(0,1-(T-DUR)/.5);
    if(al<=0)continue;
    dep(c,y,cy,(c,dz)=>{
      if(f.tr&&f.tr.length>3)celRibbon(c,f.tr,5.6*U,"gale",.55*al*dz);  // 휜 발자국
      const hy=y-f.r-16*U;
      for(let j=0;j<3;j++)
        windStroke(c,t,x,hy,(20-j*4.6)*U,.42,t*(2.3+j*.8)+i,2.5,(6-j*1.4)*U,"gale",
          (j?.75:1)*al*dz);
      if(BARB)for(let j=0;j<4;j++){const a2=j/4*TAU+t*1.6;
        celSpike(c,x+Math.cos(a2)*21*U,hy+Math.sin(a2)*21*U*.42,a2,10*U,2.4*U,
          "gale",al*.85*dz);}
      celHoop(c,x,y+f.r*.66,f.r*1.25,.32,0,2*U+1,"gale",al*.45*dz);});}
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── ⑧ 부양 浮揚 — 「띄운다」 ─────────────────────────────────────────────
// 축은 **수직**이다. 열아홉은 전부 바닥 평면에서 논다 — 위로 가는 것은 이
// 하나뿐이라 축이 겹칠 수가 없다. 뜬 놈은 아무것도 못 하고, 값의 절반은
// 떨어질 때 온다(착지 넉백이 융화 불씨의 「넉백 +50%」가 얹히는 자리다).
//
// 탑다운에서 「떴다」를 내는 것은 몸이 아니라 **그림자**다. 몸만 위로 밀면
// 그냥 이동으로 보이므로, 발밑 그림자가 작아지고 흐려져야 높이가 생긴다.
FX.mgGaleUplift=function(c,t,dt,W,H,st){
  const U=W/238,cx=W/2,cy=H/2;
  if(!st.F)st.F=bgFoes(U,[[62,-38,11],[-60,-26,10],[-4,58,10],[46,46,9]]);
  stepFoes(st.F,dt);
  const NT=[1,2,2,3,3][LV-1], HT=[40,58,58,58,72][LV-1]*U,
        SHARD=atL(3), HANG=atL(4), SHOCK=atL(5), BARB=atL(5);
  const PER=HANG?2.4:1.9, u=saw(t,PER);
  // ⚠️ 체공을 주기의 절반만 두면 **정지 화면 절반이 빈 칸**이 된다(첫 렌더에서
  // 부양 다섯 칸이 통째로 「아무 일도 안 일어남」으로 찍혔다). 성장표는 한 장의
  // 그림으로 판정하는 표라, 뜨는 시간이 주기의 대부분을 차지해야 한다.
  const RISE=.22, HOLD=HANG?.80:.68, DROP=HOLD+.10;
  // ⚠️ 위상 파생값 금지 — u=0 과 u=1 에서 **둘 다 0** 인 스케줄 하나에서
  // 높이를 뽑는다. 주기 끝에 값이 남아 있으면 다음 프레임에 툭 떨어진다.
  const up=u<RISE?ease(u/RISE):(u<HOLD?1:(u<DROP?1-Math.pow((u-HOLD)/.10,2):0));
  if(u<(st.pu||0))st.sel=null;
  if(!st.sel){st.sel=[];const o=((t/PER)|0);
    for(let i=0;i<NT;i++)st.sel.push(st.F[(i+o)%st.F.length]);}
  if((st.pu||0)<DROP&&u>=DROP){st.imp=1;      // 착지
    for(const f of st.sel){hitFoe(st,f,cx,cy,0,1,SHARD?36:14,"gale"); f.pv=1.0;
      emit(st,cx+f.ox,cy+f.oy,SHARD?14:6,
        {k:"gale",sp:150*U,r:2.8*U,life:.45,g:180*U,spikeP:.6});}}
  st.pu=u; st.imp=Math.max(0,(st.imp||0)-dt*1.8);
  const mark=bgMarker(c,t,dt,cx,cy,st,"gale",U);
  stepP(st,dt);
  const lift=HT*up;
  // 그림자 먼저 — 몸이 뜬 자리 **아래**에 남아야 높이가 읽힌다.
  //
  // ⚠️ 두 번 고쳤다. **검은 그림자는 검은 바탕에서 안 보인다** — 검정 타원만
  // 깔았더니 다섯 칸이 통째로 「아무 일도 안 일어남」으로 찍혔다(첫 렌더).
  // 어둠(影)을 밝은 림으로 보이게 하는 것과 같은 장치를 쓴다: 어두운 속 +
  // **밝은 테**. 테는 몸이 오를수록 작아지고 흐려져 그 자체가 고도계가 된다.
  for(const f of st.sel){const x=cx+f.ox+f.kx, y=cy+f.oy+f.ky;
    dep(c,y,cy,(c,dz)=>{
      // ⚠️ 반지름을 **적 크기(f.r)에 묶으면 안 된다.** 168px 성장표 칸에서
      // 적 반지름이 8px 이라 고리가 5px 로 찍혀 안 보였다(두 번째 렌더).
      // 고도계는 적이 아니라 **화면**에 대한 것이므로 타일 배율만 탄다.
      const sh=(19-up*7)*U;
      c.beginPath();c.ellipse(x,y+f.r*.52,sh,sh*.40,0,0,TAU);
      c.fillStyle=A("#04040A",(.85-up*.3)*dz);c.fill();
      celHoop(c,x,y+f.r*.52,sh,.40,0,2.4*U+1,"gale",(.8-up*.25)*dz);});}
  for(const f of st.sel)f.ky-=lift;            // 띄운 채로 그린다
  mark(0); drawFoes(c,t,cx,cy,st.F); mark(1);
  for(const f of st.sel)f.ky+=lift;
  for(let i=0;i<st.sel.length;i++){const f=st.sel[i];
    const x=cx+f.ox+f.kx, y=cy+f.oy+f.ky;
    dep(c,y,cy,(c,dz)=>{
      // 상승 획 — 밑에서 나서 위로 빠진다. 위상만 흘러 주기 이음매가 없다.
      if(up>.02)for(let j=0;j<3;j++){const p=((t*1.5+j/3)%1);
        windStroke(c,t,x,y+f.r*.4-p*HT*1.15,(17-p*6)*U,.44,(j%2?1:-1)*(t*1.3+j),2.6,
          (5.4-p*2.4)*U,"gale",(1-p)*up*.95*dz);}
      if(BARB&&up>.5)for(let j=0;j<4;j++){const a2=j/4*TAU+t*1.4;
        celSpike(c,x+Math.cos(a2)*f.r*1.25,y-lift+Math.sin(a2)*f.r*1.25,a2,
          10*U,2.3*U,"gale",up*.9*dz);}
      if(st.imp>.02){const b=st.imp;
        if(SHARD)shards(c,x,y+f.r*.5,24*U*b+8*U,7,i*5.7+2,b*.85*dz,"gale");
        celSplash(c,x,y+f.r*.3,20*U*b,9,i*3.1,"gale",b*.9*dz);
        if(SHOCK)celHoop(c,x,y+f.r*.5,(1-b)*46*U+8*U,.36,0,3.4*U+1,"gale",b*.85*dz);}});}
  drawP(c,st); hero(c,t,cx,cy,"gold",U);};

// ── 아이콘 8 — 110px 에서 **실루엣만으로** 갈려야 한다 ────────────────────
// 색은 다른 것들과 같은 금빛 계열(IC)을 쓴다. 랙에서 아이콘이 속성색으로
// 갈리면 「무엇을 쥐었나」보다 「무슨 색이었나」로 외우게 된다.
ICON.mgBoltBrand=function(c,S){const cy=S/2;          // 눈금 세 칸, 오른쪽이 찼다
  const chip=(x,r,ry,col)=>{const p=[];
    for(let j=0;j<4;j++){const a=j/4*TAU+.4;
      p.push([x+Math.cos(a)*r,cy+Math.sin(a)*ry]);}ip(c,p,col);};
  for(let i=0;i<3;i++){const x=S*(.27+i*.23);
    chip(x,S*.115,S*.145,i===2?IC.b:IC.d);
    if(i===2)chip(x,S*.06,S*.075,IC.l);}};
ICON.mgBoltBlink=function(c,S){const cy=S/2;          // 잔상(빈 것) + 도착(찬 것)
  const jag=(x,r,sc)=>{const p=[];
    for(let j=0;j<7;j++){const a=j/7*TAU, b=(j+.5)/7*TAU;
      p.push([x+Math.cos(a)*r,cy+Math.sin(a)*r]);
      p.push([x+Math.cos(b)*r*sc,cy+Math.sin(b)*r*sc]);}
    return p;};
  c.beginPath();jag(S*.30,S*.19,.54).forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
  c.closePath();c.strokeStyle=IC.d;c.lineWidth=S*.055;c.stroke();
  ip(c,jag(S*.70,S*.24,.5),IC.b); ip(c,jag(S*.70,S*.12,.5),IC.l);};
ICON.mgBoltHalt=function(c,S){const cx=S/2,cy=S/2;    // 안으로 박히는 못 넷
  for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;
    itri(c,cx+Math.cos(a)*S*.42,cy+Math.sin(a)*S*.42,a+Math.PI,S*.24,S*.075,IC.b);}
  c.beginPath();c.arc(cx,cy,S*.155,0,TAU);c.fillStyle=IC.d;c.fill();
  c.beginPath();c.arc(cx,cy,S*.075,0,TAU);c.fillStyle=IC.l;c.fill();};
ICON.mgBoltRefract=function(c,S){                     // 직각으로 두 번 꺾인 길
  const P=[[.14,.78],[.14,.36],[.56,.36],[.56,.74],[.88,.74]];
  const line=(w,col)=>{c.beginPath();
    P.forEach((q,i)=>i?c.lineTo(q[0]*S,q[1]*S):c.moveTo(q[0]*S,q[1]*S));
    c.strokeStyle=col;c.lineWidth=w;c.lineCap="butt";c.lineJoin="miter";c.stroke();};
  line(S*.155,IC.d); line(S*.075,IC.b); line(S*.028,IC.l);
  // 마디 — 꺾이는 자리에만 매듭. 직각 + 매듭이 이 실루엣의 전부다.
  for(const q of[P[1],P[2],P[3]])ihex(c,q[0]*S,q[1]*S,S*.085,IC.l,.4);};
ICON.mgGaleWall=function(c,S){                        // 세로 깃이 선 울타리
  for(let i=0;i<5;i++){const x=S*(.16+i*.17);
    iarc(c,x,S*.50,S*.16,-2.5,.4,S*.075,i===2?IC.l:IC.b,1.3);}
  ibar(c,S/2,S*.80,S*.76,S*.05,IC.d,S*.025);};
ICON.mgGaleStream=function(c,S){                      // 비스듬한 강 + 흐르는 획
  c.save();c.translate(S/2,S/2);c.rotate(-.34);
  ibar(c,0,-S*.20,S*.94,S*.055,IC.d,S*.03);
  ibar(c,0, S*.20,S*.94,S*.055,IC.d,S*.03);
  for(let i=0;i<3;i++)iarc(c,-S*.26+i*S*.26,0,S*.12,-1.5,1.5,S*.075,i===1?IC.l:IC.b,.9);
  c.restore();};
ICON.mgGaleDaze=function(c,S){const cx=S/2;           // 머리 위 소용돌이 + 몸
  c.beginPath();c.arc(cx,S*.72,S*.155,0,TAU);c.fillStyle=IC.d;c.fill();
  c.beginPath();c.arc(cx,S*.72,S*.075,0,TAU);c.fillStyle=IC.b;c.fill();
  iarc(c,cx,S*.32,S*.30,-2.8,.6,S*.085,IC.b,.44);
  iarc(c,cx,S*.32,S*.17,.2,3.3,S*.07,IC.l,.44);};
ICON.mgGaleUplift=function(c,S){const cx=S/2;         // 뜬 덩어리 + 납작한 그림자
  iarc(c,cx,S*.86,S*.22,0,TAU,S*.05,IC.d,.30);
  for(let i=-1;i<=1;i+=2)iarc(c,cx+i*S*.26,S*.58,S*.13,-2.2,1.0,S*.06,IC.b,.8);
  const ring=(r,col)=>{const p=[];
    for(let j=0;j<7;j++){const a=j/7*TAU,b=(j+.5)/7*TAU;
      p.push([cx+Math.cos(a)*r,S*.36+Math.sin(a)*r]);
      p.push([cx+Math.cos(b)*r*.5,S*.36+Math.sin(b)*r*.5]);}ip(c,p,col);};
  ring(S*.22,IC.b); ring(S*.11,IC.l);};

// ── 마운트 — **기존 MAGIC/LVW/ICL 표는 안 건드린다** ──────────────────────
// 같은 시각에 다른 속성 팀이 같은 파일을 고치므로 여덟은 자기 블록에서만
// 붙는다. 붙는 자리는 기존 그리드 그대로(#magic · #levelsm · #iconsm).
const MGW=[
["mgBoltBrand","낙인 烙印","BRAND","volt",
 "적 스스로 전하가 차오르고 눈금이 다 차면 그 자리에서 터진다 — 젖은 적은 두 칸씩"],
["mgBoltBlink","도약 跳躍","BLINK","volt",
 "한 순간에 한 곳에만 있다. 떠난 자리엔 빈 윤곽만, 두 자리를 잇는 것은 없다"],
["mgBoltHalt","정지 靜止","HALT","volt",
 "각진 못이 사방에서 박혀 적을 꿴다. 발이 아니라 공격 시계가 멈춘다(감전)"],
["mgBoltRefract","굴절 屈折","REFRACT","volt",
 "직각으로만 꺾이는 길이 한 번에 그어진다. 적을 안 고르고, 잇지 않고, 자라지 않는다"],
["mgGaleWall","풍벽 風壁","WALL","gale",
 "깃이 선 바람의 벽. 적의 길을 지우고 부딪히는 놈을 되민다 — 가두는 결계"],
["mgGaleStream","기류 氣流","STREAM","gale",
 "기슭이 있는 바람의 강. 띠에 든 적은 실려 흘러가 무리가 통째로 재배치된다"],
["mgGaleDaze","취풍 醉風","DAZE","gale",
 "머리 위 소용돌이가 방향을 뺏는다. 비틀거리다 서로 부딪힌다"],
["mgGaleUplift","부양 浮揚","UPLIFT","gale",
 "적을 띄운다 — 유일한 수직 축. 그림자가 작아지고, 값의 절반은 떨어질 때 온다"]];
// 레벨 4줄(L2~L5). **수치만 오르는 줄은 두지 않는다** — 칸마다 개수·형태·
// 단계 중 하나가 눈으로 달라져야 고를 맛이 난다.
const MGBGLVT={
mgBoltBrand:["눈금 4칸 → 3칸 — 같은 속도로도 더 빨리 터진다",
 "전도 — 젖거나 언 적은 눈금이 두 칸씩 오른다 (뇌 ×2 · 융화 수 水 자리)",
 "눈금 2칸 + 터짐 반경 +40%",
 "각성 — 과충전. 칸 하나가 더 붙고, 넘겨 쌓았다 두 배로 터진다"],
mgBoltBlink:["도약 2회 → 3회",
 "잔상이 문다 — 떠난 자리가 한 번 더, 윤곽이 채워지고 밝아진다",
 "도약 5회 + 간격이 회를 거듭할수록 짧아진다 (끝에 몰아친다)",
 "각성 — 갈퀴가 서고, 도착 반경 안의 적이 전부 감전된다"],
mgBoltHalt:["못 4 → 6개, 붙잡는 시간 +50%",
 "대상 2마리",
 "파열 — 풀릴 때 못이 튕겨 나가며 터진다",
 "각성 — 대상 3마리, 못마다 갈퀴가 서고 꿰인 동안 피해가 계속 든다"],
mgBoltRefract:["꺾임 2 → 3 — 길이 더 멀리 돌아 나간다",
 "길 2개 — 반대 방향으로 하나 더 그어진다",
 "마디 폭발 — 꺾이는 자리마다 터진다",
 "각성 — 꺾임 6, 길이 굵어지고 마디마다 갈퀴가 선다"],
mgGaleWall:["벽이 길어지고 깃이 촘촘해진다",
 "벽 2장 — ㄱ자 모서리로 몰아넣는다",
 "벽 3장 — 삼각 우리",
 "각성 — 우리가 닫히고, 부딪힌 자리마다 넉백이 터진다"],
mgGaleStream:["폭 +45% — 강이 넓어져 무리째 실린다",
 "굽이 — 강이 휘어 더 오래 싣고 간다",
 "두 갈래",
 "각성 — 세 갈래 + 역류. 흐름이 주기마다 뒤집혀 실려 나간 무리가 되돌아온다"],
mgGaleDaze:["대상 2마리, 지속 +50%",
 "실명 — 원거리 적의 조준이 흐트러진다 (자락이 얼굴을 스친다)",
 "대상 3마리 + 비틀거림이 커진다",
 "각성 — 갈퀴가 서고 취한 적은 플레이어 반대쪽으로만 밀려난다"],
mgGaleUplift:["대상 2마리, 더 높이",
 "낙하 피해 — 떨어진 자리에 파편이 튄다",
 "대상 3마리 + 체공 +60%",
 "각성 — 뜬 동안 갈퀴가 서고 착지에 충격파가 퍼진다"]};
// 마법은 자기 색을 갖는다 — 뇌 volt(레몬 55°) · 풍 gale(청록 170°).
MGW.forEach(w=>{WTONE[w[0]]=w[3];});
MGW.forEach(w=>tile($("magic"),FX,w[0],w[1],w[2],w[4],S));
// 성장표 — LVW 의 행 조립을 그대로 따른다. **레벨판을 따로 그리지 않는다**:
// 칸이 전역 LV 만 바꿔놓고 같은 FX 함수를 부른다(안 그러면 표가 거짓말을 한다).
{const HOST=$("levelsm");
MGW.forEach(([key,nm])=>{
  const row=document.createElement("div");
  box(row,{width:"100%",background:"#13131A",border:"1px solid #26262F",
    borderRadius:"4px",overflow:"hidden",boxSizing:"border-box"});
  row.insertAdjacentHTML("beforeend",
    `<div style="display:flex;align-items:baseline;gap:8px;padding:7px 10px;`+
    `border-bottom:1px solid #26262F"><b style="font-size:13px;color:#EDEDF2">${nm}</b>`+
    `<span style="font-size:10px;color:#5A5A68">마법</span></div>`);
  const cells=document.createElement("div");
  box(cells,{display:"flex",flexWrap:"wrap",gap:"1px",background:"#26262F",width:"100%"});
  for(let L=1;L<=5;L++){
    const cell=document.createElement("div");
    box(cell,{width:LVC+"px",flex:"1 1 "+LVC+"px",minWidth:LVC+"px",
      background:"#13131A",boxSizing:"border-box"});
    const cv=document.createElement("canvas");
    box(cv,{width:"100%",height:"auto",display:"block",aspectRatio:"1",background:"#0C0C12"});
    cell.appendChild(cv);
    const txt=L===1?"기준 디자인":((MGBGLVT[key]||[])[L-2]||"");
    cell.insertAdjacentHTML("beforeend",
      `<div style="padding:5px 8px 7px;border-top:1px solid #26262F">`+
      `<div style="font-size:10px;font-weight:700;letter-spacing:.06em;`+
      `color:${L===1?"#9494A2":"#FFA83C"}">L${L}</div>`+
      `<div style="font-size:9.5px;color:#9494A2;line-height:1.35;margin-top:2px;`+
      `min-height:2.7em">${txt}</div></div>`);
    cells.appendChild(cell);
    const fn=FX[key],tk=WTONE[key];
    mk(cv,[LVC,LVC],(c,t,dt,W,H,st)=>{const sl=LV,sr=RECOLOR;LV=L;RECOLOR=tk;
      try{fn(c,t,dt,W,H,st);}finally{LV=sl;RECOLOR=sr;}});}
  row.appendChild(cells);HOST.appendChild(row);});}
MGW.forEach(w=>iconTile(ICON,w[0],w[1],"마법 공격"));
