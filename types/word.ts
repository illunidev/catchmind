/**
 * Word Domain Types
 * 제시어 관련 타입 정의
 */

import { Category, Difficulty } from './room';

export interface Word {
  id: string;
  text: string;
  category: Category;
  difficulty: Difficulty;
  length: number;
}

export interface WordChoice {
  id: string;
  text: string;
}
