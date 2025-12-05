/**
 * Firebase Database Helpers
 * Database 헬퍼 함수들
 */

import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  push,
  serverTimestamp,
  DatabaseReference,
  DataSnapshot,
  Unsubscribe,
} from 'firebase/database';
import { db } from './config';

/**
 * 데이터 쓰기
 */
export const setData = async (path: string, data: any): Promise<void> => {
  const reference = ref(db, path);
  await set(reference, data);
};

/**
 * 데이터 읽기 (한 번)
 */
export const getData = async <T = any>(path: string): Promise<T | null> => {
  const reference = ref(db, path);
  const snapshot = await get(reference);
  return snapshot.exists() ? (snapshot.val() as T) : null;
};

/**
 * 데이터 업데이트 (일부만)
 */
export const updateData = async (path: string, data: any): Promise<void> => {
  const reference = ref(db, path);
  await update(reference, data);
};

/**
 * 다중 경로 업데이트 (원자적)
 */
export const updateMultiplePaths = async (
  updates: Record<string, any>
): Promise<void> => {
  const reference = ref(db);
  await update(reference, updates);
};

/**
 * 데이터 삭제
 */
export const removeData = async (path: string): Promise<void> => {
  const reference = ref(db, path);
  await remove(reference);
};

/**
 * 새 아이템 추가 (자동 ID 생성)
 */
export const pushData = async (path: string, data: any): Promise<string> => {
  const reference = ref(db, path);
  const newRef = push(reference);
  await set(newRef, data);
  return newRef.key!;
};

/**
 * 실시간 리스너 (value)
 */
export const listenToValue = (
  path: string,
  callback: (snapshot: DataSnapshot) => void
): Unsubscribe => {
  const reference = ref(db, path);
  return onValue(reference, callback);
};

/**
 * 실시간 리스너 (child_added)
 */
export const listenToChildAdded = (
  path: string,
  callback: (snapshot: DataSnapshot) => void
): Unsubscribe => {
  const reference = ref(db, path);
  return onChildAdded(reference, callback);
};

/**
 * 실시간 리스너 (child_changed)
 */
export const listenToChildChanged = (
  path: string,
  callback: (snapshot: DataSnapshot) => void
): Unsubscribe => {
  const reference = ref(db, path);
  return onChildChanged(reference, callback);
};

/**
 * 실시간 리스너 (child_removed)
 */
export const listenToChildRemoved = (
  path: string,
  callback: (snapshot: DataSnapshot) => void
): Unsubscribe => {
  const reference = ref(db, path);
  return onChildRemoved(reference, callback);
};

/**
 * 서버 타임스탬프
 */
export const getServerTimestamp = () => serverTimestamp();

/**
 * Reference 생성
 */
export const createRef = (path: string): DatabaseReference => {
  return ref(db, path);
};
