/**
 * Word Service
 * 단어 선택 및 관리 서비스
 */

import { Word, WordChoice } from '@/types/word';
import { RoomSettings } from '@/types/room';
import { wordBank } from '../data/wordBank';
import { shuffle } from '@/lib/utils/helpers';

export class WordService {
  /**
   * 단어 선택지 생성
   * 설정에 맞는 3개의 단어를 랜덤으로 선택
   */
  getWordChoices(settings: RoomSettings): WordChoice[] {
    // 카테고리 및 난이도에 맞는 단어 필터링
    let filteredWords = wordBank.filter((word) => {
      const categoryMatch = settings.category === 'all' || word.category === settings.category;
      const difficultyMatch = word.difficulty === settings.difficulty;

      return categoryMatch && difficultyMatch;
    });

    // 필터링된 단어가 부족한 경우 난이도 완화
    if (filteredWords.length < 3) {
      filteredWords = wordBank.filter((word) => {
        return settings.category === 'all' || word.category === settings.category;
      });
    }

    // 여전히 부족한 경우 전체에서 선택
    if (filteredWords.length < 3) {
      filteredWords = wordBank;
    }

    // 랜덤 셔플 후 3개 선택
    const shuffled = shuffle([...filteredWords]);
    const selected = shuffled.slice(0, 3);

    // WordChoice 형식으로 변환
    return selected.map((word) => ({
      id: word.id,
      text: word.text,
    }));
  }

  /**
   * 단어 랜덤 선택 (단일)
   */
  getRandomWord(settings: RoomSettings): Word {
    const choices = this.getWordChoices(settings);
    const randomIndex = Math.floor(Math.random() * choices.length);
    const choice = choices[randomIndex];

    // WordChoice의 id를 사용하여 실제 Word 찾기
    const word = wordBank.find((w) => w.id === choice.id);
    if (!word) {
      throw new Error('단어를 찾을 수 없습니다.');
    }

    return word;
  }

  /**
   * 특정 카테고리의 단어 목록
   */
  getWordsByCategory(category: string, difficulty?: string): Word[] {
    return wordBank.filter((word) => {
      const categoryMatch = category === 'all' || word.category === category;
      const difficultyMatch = !difficulty || word.difficulty === difficulty;

      return categoryMatch && difficultyMatch;
    });
  }

  /**
   * 단어 검증
   */
  validateWord(word: string): boolean {
    return wordBank.some((w) => w.text === word);
  }

  /**
   * 전체 단어 수
   */
  getTotalWordCount(): number {
    return wordBank.length;
  }

  /**
   * 카테고리별 단어 수
   */
  getCategoryWordCount(category: string, difficulty?: string): number {
    return this.getWordsByCategory(category, difficulty).length;
  }
}

// Singleton instance
export const wordService = new WordService();
