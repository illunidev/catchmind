/**
 * Word Bank
 * 게임에 사용될 단어 데이터베이스
 */

import { Word } from '@/types/word';

/**
 * 단어 은행
 * 카테고리별, 난이도별로 분류된 단어 목록
 */
export const wordBank: Word[] = [
  // 음식 - 쉬움
  { word: '사과', category: 'food', difficulty: 'easy' },
  { word: '바나나', category: 'food', difficulty: 'easy' },
  { word: '햄버거', category: 'food', difficulty: 'easy' },
  { word: '피자', category: 'food', difficulty: 'easy' },
  { word: '케이크', category: 'food', difficulty: 'easy' },
  { word: '아이스크림', category: 'food', difficulty: 'easy' },
  { word: '치킨', category: 'food', difficulty: 'easy' },
  { word: '라면', category: 'food', difficulty: 'easy' },
  { word: '김밥', category: 'food', difficulty: 'easy' },
  { word: '떡볶이', category: 'food', difficulty: 'easy' },

  // 음식 - 보통
  { word: '스파게티', category: 'food', difficulty: 'normal' },
  { word: '타코', category: 'food', difficulty: 'normal' },
  { word: '샌드위치', category: 'food', difficulty: 'normal' },
  { word: '부리또', category: 'food', difficulty: 'normal' },
  { word: '초밥', category: 'food', difficulty: 'normal' },
  { word: '돈까스', category: 'food', difficulty: 'normal' },
  { word: '짜장면', category: 'food', difficulty: 'normal' },
  { word: '칼국수', category: 'food', difficulty: 'normal' },
  { word: '삼겹살', category: 'food', difficulty: 'normal' },
  { word: '비빔밥', category: 'food', difficulty: 'normal' },

  // 음식 - 어려움
  { word: '리소토', category: 'food', difficulty: 'hard' },
  { word: '까르보나라', category: 'food', difficulty: 'hard' },
  { word: '팟타이', category: 'food', difficulty: 'hard' },
  { word: '푸아그라', category: 'food', difficulty: 'hard' },
  { word: '크루아상', category: 'food', difficulty: 'hard' },

  // 동물 - 쉬움
  { word: '강아지', category: 'animal', difficulty: 'easy' },
  { word: '고양이', category: 'animal', difficulty: 'easy' },
  { word: '토끼', category: 'animal', difficulty: 'easy' },
  { word: '코끼리', category: 'animal', difficulty: 'easy' },
  { word: '사자', category: 'animal', difficulty: 'easy' },
  { word: '호랑이', category: 'animal', difficulty: 'easy' },
  { word: '펭귄', category: 'animal', difficulty: 'easy' },
  { word: '돼지', category: 'animal', difficulty: 'easy' },
  { word: '소', category: 'animal', difficulty: 'easy' },
  { word: '닭', category: 'animal', difficulty: 'easy' },

  // 동물 - 보통
  { word: '기린', category: 'animal', difficulty: 'normal' },
  { word: '얼룩말', category: 'animal', difficulty: 'normal' },
  { word: '판다', category: 'animal', difficulty: 'normal' },
  { word: '캥거루', category: 'animal', difficulty: 'normal' },
  { word: '하마', category: 'animal', difficulty: 'normal' },
  { word: '악어', category: 'animal', difficulty: 'normal' },
  { word: '펠리컨', category: 'animal', difficulty: 'normal' },
  { word: '앵무새', category: 'animal', difficulty: 'normal' },
  { word: '다람쥐', category: 'animal', difficulty: 'normal' },
  { word: '고슴도치', category: 'animal', difficulty: 'normal' },

  // 동물 - 어려움
  { word: '미어캣', category: 'animal', difficulty: 'hard' },
  { word: '오소리', category: 'animal', difficulty: 'hard' },
  { word: '아르마딜로', category: 'animal', difficulty: 'hard' },
  { word: '알파카', category: 'animal', difficulty: 'hard' },
  { word: '프레리도그', category: 'animal', difficulty: 'hard' },

  // 사물 - 쉬움
  { word: '연필', category: 'object', difficulty: 'easy' },
  { word: '지우개', category: 'object', difficulty: 'easy' },
  { word: '책', category: 'object', difficulty: 'easy' },
  { word: '가방', category: 'object', difficulty: 'easy' },
  { word: '시계', category: 'object', difficulty: 'easy' },
  { word: '안경', category: 'object', difficulty: 'easy' },
  { word: '우산', category: 'object', difficulty: 'easy' },
  { word: '컴퓨터', category: 'object', difficulty: 'easy' },
  { word: '핸드폰', category: 'object', difficulty: 'easy' },
  { word: '텔레비전', category: 'object', difficulty: 'easy' },

  // 사물 - 보통
  { word: '키보드', category: 'object', difficulty: 'normal' },
  { word: '마우스', category: 'object', difficulty: 'normal' },
  { word: '헤드폰', category: 'object', difficulty: 'normal' },
  { word: '냉장고', category: 'object', difficulty: 'normal' },
  { word: '선풍기', category: 'object', difficulty: 'normal' },
  { word: '청소기', category: 'object', difficulty: 'normal' },
  { word: '세탁기', category: 'object', difficulty: 'normal' },
  { word: '전자레인지', category: 'object', difficulty: 'normal' },
  { word: '에어컨', category: 'object', difficulty: 'normal' },
  { word: '공기청정기', category: 'object', difficulty: 'normal' },

  // 사물 - 어려움
  { word: '가습기', category: 'object', difficulty: 'hard' },
  { word: '제습기', category: 'object', difficulty: 'hard' },
  { word: '전기밥솥', category: 'object', difficulty: 'hard' },
  { word: '식기세척기', category: 'object', difficulty: 'hard' },
  { word: '커피머신', category: 'object', difficulty: 'hard' },

  // 행동 - 쉬움
  { word: '달리기', category: 'action', difficulty: 'easy' },
  { word: '걷기', category: 'action', difficulty: 'easy' },
  { word: '점프', category: 'action', difficulty: 'easy' },
  { word: '수영', category: 'action', difficulty: 'easy' },
  { word: '춤추기', category: 'action', difficulty: 'easy' },
  { word: '노래하기', category: 'action', difficulty: 'easy' },
  { word: '먹기', category: 'action', difficulty: 'easy' },
  { word: '자기', category: 'action', difficulty: 'easy' },
  { word: '웃기', category: 'action', difficulty: 'easy' },
  { word: '울기', category: 'action', difficulty: 'easy' },

  // 행동 - 보통
  { word: '그리기', category: 'action', difficulty: 'normal' },
  { word: '글쓰기', category: 'action', difficulty: 'normal' },
  { word: '요리하기', category: 'action', difficulty: 'normal' },
  { word: '청소하기', category: 'action', difficulty: 'normal' },
  { word: '운전하기', category: 'action', difficulty: 'normal' },
  { word: '운동하기', category: 'action', difficulty: 'normal' },
  { word: '독서하기', category: 'action', difficulty: 'normal' },
  { word: '게임하기', category: 'action', difficulty: 'normal' },
  { word: '쇼핑하기', category: 'action', difficulty: 'normal' },
  { word: '여행하기', category: 'action', difficulty: 'normal' },

  // 행동 - 어려움
  { word: '명상하기', category: 'action', difficulty: 'hard' },
  { word: '스트레칭', category: 'action', difficulty: 'hard' },
  { word: '줄넘기', category: 'action', difficulty: 'hard' },
  { word: '턱걸이', category: 'action', difficulty: 'hard' },
  { word: '농사짓기', category: 'action', difficulty: 'hard' },
];
