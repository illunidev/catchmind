/**
 * Firebase Presence
 * 접속 상태 관리
 */

import {
  ref,
  onDisconnect,
  set,
  serverTimestamp,
  onValue,
} from 'firebase/database';
import { db } from './config';

/**
 * 유저 온라인 상태 설정
 */
export const setupPresence = (roomId: string, userId: string): void => {
  const userStatusRef = ref(
    db,
    `roomDetails/${roomId}/players/${userId}/isOnline`
  );
  const userLastSeenRef = ref(
    db,
    `roomDetails/${roomId}/players/${userId}/lastSeen`
  );

  // 연결 상태 감지
  const connectedRef = ref(db, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      // 연결됨
      onDisconnect(userStatusRef).set(false);
      onDisconnect(userLastSeenRef).set(serverTimestamp());
      set(userStatusRef, true);
    }
  });
};

/**
 * 유저 오프라인 상태 설정
 */
export const setOffline = async (
  roomId: string,
  userId: string
): Promise<void> => {
  const userStatusRef = ref(
    db,
    `roomDetails/${roomId}/players/${userId}/isOnline`
  );
  const userLastSeenRef = ref(
    db,
    `roomDetails/${roomId}/players/${userId}/lastSeen`
  );

  await set(userStatusRef, false);
  await set(userLastSeenRef, serverTimestamp());
};
