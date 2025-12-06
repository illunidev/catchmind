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
  { id: '', text: '사과', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '바나나', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '햄버거', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '피자', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '케이크', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '아이스크림', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '치킨', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '라면', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '김밥', category: 'food', difficulty: 'easy', length: 0 },
  { id: '', text: '떡볶이', category: 'food', difficulty: 'easy', length: 0 },

  // 음식 - 보통
  { id: '', text: '스파게티', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '타코', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '샌드위치', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '부리또', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '초밥', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '돈까스', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '짜장면', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '칼국수', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '삼겹살', category: 'food', difficulty: 'normal', length: 0 },
  { id: '', text: '비빔밥', category: 'food', difficulty: 'normal', length: 0 },

  // 음식 - 어려움
  { id: '', text: '리소토', category: 'food', difficulty: 'hard', length: 0 },
  { id: '', text: '까르보나라', category: 'food', difficulty: 'hard', length: 0 },
  { id: '', text: '팟타이', category: 'food', difficulty: 'hard', length: 0 },
  { id: '', text: '푸아그라', category: 'food', difficulty: 'hard', length: 0 },
  { id: '', text: '크루아상', category: 'food', difficulty: 'hard', length: 0 },

  // 동물 - 쉬움
  { id: '', text: '강아지', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '고양이', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '토끼', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '코끼리', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '사자', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '호랑이', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '펭귄', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '돼지', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '소', category: 'animal', difficulty: 'easy', length: 0 },
  { id: '', text: '닭', category: 'animal', difficulty: 'easy', length: 0 },

  // 동물 - 보통
  { id: '', text: '기린', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '얼룩말', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '판다', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '캥거루', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '하마', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '악어', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '펠리컨', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '앵무새', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '다람쥐', category: 'animal', difficulty: 'normal', length: 0 },
  { id: '', text: '고슴도치', category: 'animal', difficulty: 'normal', length: 0 },

  // 동물 - 어려움
  { id: '', text: '미어캣', category: 'animal', difficulty: 'hard', length: 0 },
  { id: '', text: '오소리', category: 'animal', difficulty: 'hard', length: 0 },
  { id: '', text: '아르마딜로', category: 'animal', difficulty: 'hard', length: 0 },
  { id: '', text: '알파카', category: 'animal', difficulty: 'hard', length: 0 },
  { id: '', text: '프레리도그', category: 'animal', difficulty: 'hard', length: 0 },

  // 사물 - 쉬움
  { id: '', text: '연필', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '지우개', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '책', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '가방', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '시계', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '안경', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '우산', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '컴퓨터', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '핸드폰', category: 'object', difficulty: 'easy', length: 0 },
  { id: '', text: '텔레비전', category: 'object', difficulty: 'easy', length: 0 },

  // 사물 - 보통
  { id: '', text: '키보드', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '마우스', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '헤드폰', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '냉장고', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '선풍기', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '청소기', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '세탁기', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '전자레인지', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '에어컨', category: 'object', difficulty: 'normal', length: 0 },
  { id: '', text: '공기청정기', category: 'object', difficulty: 'normal', length: 0 },

  // 사물 - 어려움
  { id: '', text: '가습기', category: 'object', difficulty: 'hard', length: 0 },
  { id: '', text: '제습기', category: 'object', difficulty: 'hard', length: 0 },
  { id: '', text: '전기밥솥', category: 'object', difficulty: 'hard', length: 0 },
  { id: '', text: '식기세척기', category: 'object', difficulty: 'hard', length: 0 },
  { id: '', text: '커피머신', category: 'object', difficulty: 'hard', length: 0 },

  // 행동 - 쉬움
  { id: '', text: '달리기', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '걷기', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '점프', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '수영', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '춤추기', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '노래하기', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '먹기', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '자기', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '웃기', category: 'action', difficulty: 'easy', length: 0 },
  { id: '', text: '울기', category: 'action', difficulty: 'easy', length: 0 },

  // 행동 - 보통
  { id: '', text: '그리기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '글쓰기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '요리하기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '청소하기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '운전하기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '운동하기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '독서하기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '게임하기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '쇼핑하기', category: 'action', difficulty: 'normal', length: 0 },
  { id: '', text: '여행하기', category: 'action', difficulty: 'normal', length: 0 },

  // 행동 - 어려움
  { id: '', text: '명상하기', category: 'action', difficulty: 'hard', length: 0 },
  { id: '', text: '스트레칭', category: 'action', difficulty: 'hard', length: 0 },
  { id: '', text: '줄넘기', category: 'action', difficulty: 'hard', length: 0 },
  { id: '', text: '턱걸이', category: 'action', difficulty: 'hard', length: 0 },
  { id: '', text: '농사짓기', category: 'action', difficulty: 'hard', length: 0 },
];
