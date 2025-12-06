/**
 * Test Rooms Cleanup Script
 * 테스트용 방들을 일괄 삭제하는 스크립트
 *
 * 사용법:
 * npx tsx scripts/cleanup-test-rooms.ts
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, remove } from 'firebase/database';

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function cleanupAllRooms() {
  console.log('🧹 테스트 방 정리 시작...\n');

  try {
    // 모든 방 가져오기
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) {
      console.log('✅ 삭제할 방이 없습니다.');
      return;
    }

    const rooms = snapshot.val();
    const roomIds = Object.keys(rooms);

    console.log(`📋 총 ${roomIds.length}개의 방을 발견했습니다.\n`);

    // 각 방 정보 출력 및 삭제 확인
    for (const roomId of roomIds) {
      const room = rooms[roomId];
      console.log(`방 ID: ${roomId}`);
      console.log(`  - 코드: ${room.code}`);
      console.log(`  - 상태: ${room.status}`);
      console.log(`  - 생성일: ${new Date(room.createdAt).toLocaleString()}`);
      console.log(`  - 업데이트: ${new Date(room.updatedAt).toLocaleString()}`);
    }

    console.log('\n⚠️  위 방들을 모두 삭제하시겠습니까? (y/N)');

    // 사용자 확인 대기
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('', async (answer: string) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🗑️  방 삭제 중...\n');

        for (const roomId of roomIds) {
          await remove(ref(db, `rooms/${roomId}`));
          await remove(ref(db, `roomDetails/${roomId}`));
          await remove(ref(db, `gameStates/${roomId}`));
          await remove(ref(db, `rounds/${roomId}`));
          await remove(ref(db, `canvases/${roomId}`));
          await remove(ref(db, `chats/${roomId}`));

          console.log(`✅ 방 ${roomId} 삭제 완료`);
        }

        console.log(`\n✨ 총 ${roomIds.length}개의 방이 삭제되었습니다.`);
      } else {
        console.log('\n❌ 삭제가 취소되었습니다.');
      }

      readline.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

// 특정 상태의 방만 삭제하는 함수
async function cleanupRoomsByStatus(status: string) {
  console.log(`🧹 ${status} 상태의 방 정리 시작...\n`);

  try {
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) {
      console.log('✅ 삭제할 방이 없습니다.');
      return;
    }

    const rooms = snapshot.val();
    const targetRooms = Object.entries(rooms).filter(
      ([_, room]: [string, any]) => room.status === status
    );

    if (targetRooms.length === 0) {
      console.log(`✅ ${status} 상태의 방이 없습니다.`);
      return;
    }

    console.log(`📋 ${status} 상태의 방 ${targetRooms.length}개 발견\n`);

    for (const [roomId, room] of targetRooms as [string, any][]) {
      await remove(ref(db, `rooms/${roomId}`));
      await remove(ref(db, `roomDetails/${roomId}`));
      await remove(ref(db, `gameStates/${roomId}`));
      await remove(ref(db, `rounds/${roomId}`));
      await remove(ref(db, `canvases/${roomId}`));
      await remove(ref(db, `chats/${roomId}`));

      console.log(`✅ 방 ${room.code} (${roomId}) 삭제 완료`);
    }

    console.log(`\n✨ ${targetRooms.length}개의 방이 삭제되었습니다.`);
    process.exit(0);

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

// 오래된 방 삭제 (24시간 이상 업데이트 없는 방)
async function cleanupOldRooms(hoursOld: number = 24) {
  console.log(`🧹 ${hoursOld}시간 이상 된 방 정리 시작...\n`);

  try {
    const roomsRef = ref(db, 'rooms');
    const snapshot = await get(roomsRef);

    if (!snapshot.exists()) {
      console.log('✅ 삭제할 방이 없습니다.');
      return;
    }

    const rooms = snapshot.val();
    const cutoffTime = Date.now() - (hoursOld * 60 * 60 * 1000);
    const oldRooms = Object.entries(rooms).filter(
      ([_, room]: [string, any]) => room.updatedAt < cutoffTime
    );

    if (oldRooms.length === 0) {
      console.log(`✅ ${hoursOld}시간 이상 된 방이 없습니다.`);
      return;
    }

    console.log(`📋 ${hoursOld}시간 이상 된 방 ${oldRooms.length}개 발견\n`);

    for (const [roomId, room] of oldRooms as [string, any][]) {
      const age = Math.floor((Date.now() - room.updatedAt) / (60 * 60 * 1000));
      console.log(`  - ${room.code} (${age}시간 전)`);
    }

    console.log('\n⚠️  위 방들을 모두 삭제하시겠습니까? (y/N)');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('', async (answer: string) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🗑️  방 삭제 중...\n');

        for (const [roomId, room] of oldRooms as [string, any][]) {
          await remove(ref(db, `rooms/${roomId}`));
          await remove(ref(db, `roomDetails/${roomId}`));
          await remove(ref(db, `gameStates/${roomId}`));
          await remove(ref(db, `rounds/${roomId}`));
          await remove(ref(db, `canvases/${roomId}`));
          await remove(ref(db, `chats/${roomId}`));

          console.log(`✅ 방 ${room.code} 삭제 완료`);
        }

        console.log(`\n✨ ${oldRooms.length}개의 방이 삭제되었습니다.`);
      } else {
        console.log('\n❌ 삭제가 취소되었습니다.');
      }

      readline.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

// 명령줄 인자 처리
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'all':
    cleanupAllRooms();
    break;
  case 'finished':
    cleanupRoomsByStatus('finished');
    break;
  case 'old':
    const hours = parseInt(args[1]) || 24;
    cleanupOldRooms(hours);
    break;
  default:
    console.log(`
🧹 Catchmind 방 정리 스크립트

사용법:
  npx tsx scripts/cleanup-test-rooms.ts <command> [options]

명령어:
  all                모든 방 삭제
  finished           finished 상태의 방만 삭제
  old [hours]        지정된 시간 이상 된 방 삭제 (기본: 24시간)

예시:
  npx tsx scripts/cleanup-test-rooms.ts all
  npx tsx scripts/cleanup-test-rooms.ts finished
  npx tsx scripts/cleanup-test-rooms.ts old 48
`);
    process.exit(0);
}
