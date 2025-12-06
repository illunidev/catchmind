/**
 * Room Service
 * 방 생성 및 관리 서비스
 */

import {
  Room,
  Player,
  CreateRoomInput,
  UpdateRoomSettingsInput,
} from '@/types';
import {
  setData,
  getData,
  updateData,
  removeData,
  updateMultiplePaths,
} from '@/lib/firebase/database';
import { userService } from '@/lib/domains/user/services/userService';
import {
  generateRoomCode,
  generateId,
} from '@/lib/utils/helpers';
import {
  validateRoomCode,
  validateRoomTitle,
  validatePlayerCount,
} from '@/lib/utils/validation';
import { GAME_CONSTANTS } from '@/lib/utils/constants';

class RoomService {
  /**
   * 방 생성
   */
  async createRoom(input: CreateRoomInput): Promise<Room> {
    // 방 제목 검증
    if (!validateRoomTitle(input.title)) {
      throw new Error('방 제목은 1-50자 사이여야 합니다.');
    }

    // 최대 인원 검증
    if (!validatePlayerCount(input.settings.maxPlayers)) {
      throw new Error(
        `최대 인원은 ${GAME_CONSTANTS.MIN_PLAYERS}-${GAME_CONSTANTS.MAX_PLAYERS}명 사이여야 합니다.`
      );
    }

    // 유저 정보 확인
    const host = await userService.getUserById(input.hostUserId);
    if (!host) {
      throw new Error('유저를 찾을 수 없습니다.');
    }

    // 고유 방 코드 생성 (중복 확인)
    let roomCode = generateRoomCode();
    let existingRoom = await this.getRoomByCode(roomCode);
    while (existingRoom) {
      roomCode = generateRoomCode();
      existingRoom = await this.getRoomByCode(roomCode);
    }

    const roomId = generateId();
    const now = Date.now();

    // Room 데이터 생성
    const room: Room = {
      id: roomId,
      code: roomCode,
      title: input.title,
      hostUserId: input.hostUserId,
      currentPlayers: 1,
      maxPlayers: input.settings.maxPlayers,
      status: 'waiting',
      settings: input.settings,
      createdAt: now,
      updatedAt: now,
    };

    // Player 데이터 생성
    const player: Player = {
      userId: input.hostUserId,
      nickname: host.nickname,
      score: 0,
      status: 'idle',
      isHost: true,
      joinedAt: now,
      isOnline: true,
      lastSeen: now,
    };

    // Firebase에 저장 (원자적 업데이트)
    const updates: Record<string, any> = {};
    updates[`rooms/${roomId}`] = room;
    updates[`roomDetails/${roomId}/info`] = {
      code: roomCode,
      title: input.title,
      hostUserId: input.hostUserId,
      status: 'waiting',
      settings: input.settings,
      createdAt: now,
    };
    updates[`roomDetails/${roomId}/players/${input.hostUserId}`] = player;

    await updateMultiplePaths(updates);

    return room;
  }

  /**
   * 방 코드로 방 조회
   */
  async getRoomByCode(code: string): Promise<Room | null> {
    if (!validateRoomCode(code)) {
      return null;
    }

    // 모든 방 조회 후 코드로 필터링 (비효율적이지만 구조상 불가피)
    // 실제로는 rooms 아래에 인덱스를 만들거나, roomCodes/{code} -> {roomId} 매핑 사용
    const rooms = await getData<Record<string, Room>>('rooms');
    if (!rooms) return null;

    const foundRoom = Object.values(rooms).find((r) => r.code === code);
    return foundRoom || null;
  }

  /**
   * 방 참가
   */
  async joinRoom(userId: string, roomCode: string): Promise<void> {
    // 방 조회
    const room = await this.getRoomByCode(roomCode);
    if (!room) {
      throw new Error('존재하지 않는 방 코드입니다.');
    }

    // 방 상태 확인
    if (room.status !== 'waiting') {
      throw new Error('게임이 진행 중인 방입니다.');
    }

    // 인원 확인
    if (room.currentPlayers >= room.maxPlayers) {
      throw new Error('방이 가득 찼습니다.');
    }

    // 이미 참가했는지 확인
    const existingPlayer = await getData<Player>(
      `roomDetails/${room.id}/players/${userId}`
    );
    if (existingPlayer) {
      throw new Error('이미 참가한 방입니다.');
    }

    // 유저 정보 조회
    const user = await userService.getUserById(userId);
    if (!user) {
      throw new Error('유저를 찾을 수 없습니다.');
    }

    // Player 데이터 생성
    const player: Player = {
      userId,
      nickname: user.nickname,
      score: 0,
      status: 'idle',
      isHost: false,
      joinedAt: Date.now(),
      isOnline: true,
      lastSeen: Date.now(),
    };

    // Firebase에 저장
    const updates: Record<string, any> = {};
    updates[`roomDetails/${room.id}/players/${userId}`] = player;
    updates[`rooms/${room.id}/currentPlayers`] = room.currentPlayers + 1;
    updates[`rooms/${room.id}/updatedAt`] = Date.now();

    await updateMultiplePaths(updates);
  }

  /**
   * 방 나가기
   */
  async leaveRoom(userId: string, roomId: string): Promise<void> {
    // 플레이어 정보 조회
    const player = await getData<Player>(
      `roomDetails/${roomId}/players/${userId}`
    );
    if (!player) {
      throw new Error('방에 참가하지 않은 유저입니다.');
    }

    // 방 정보 조회
    const room = await getData<Room>(`rooms/${roomId}`);
    if (!room) {
      throw new Error('방을 찾을 수 없습니다.');
    }

    // 모든 플레이어 조회
    const allPlayers = await getData<Record<string, Player>>(
      `roomDetails/${roomId}/players`
    );
    if (!allPlayers) {
      throw new Error('플레이어 정보를 찾을 수 없습니다.');
    }

    const remainingPlayers = Object.values(allPlayers).filter(
      (p) => p.userId !== userId
    );

    // 업데이트 객체 준비
    const updates: Record<string, any> = {};
    updates[`roomDetails/${roomId}/players/${userId}`] = null; // 삭제

    if (remainingPlayers.length === 0) {
      // 마지막 플레이어면 방 삭제
      updates[`rooms/${roomId}`] = null;
      updates[`roomDetails/${roomId}`] = null;
    } else {
      // 인원 수 업데이트
      updates[`rooms/${roomId}/currentPlayers`] = remainingPlayers.length;
      updates[`rooms/${roomId}/updatedAt`] = Date.now();

      // 방장이 나갔으면 다음 플레이어에게 권한 이전
      if (player.isHost) {
        const newHost = remainingPlayers[0];
        updates[`roomDetails/${roomId}/players/${newHost.userId}/isHost`] = true;
        updates[`rooms/${roomId}/hostUserId`] = newHost.userId;
        updates[`roomDetails/${roomId}/info/hostUserId`] = newHost.userId;
      }
    }

    await updateMultiplePaths(updates);
  }

  /**
   * 방 설정 업데이트 (방장만)
   */
  async updateSettings(
    roomId: string,
    hostUserId: string,
    settings: UpdateRoomSettingsInput
  ): Promise<void> {
    // 방 정보 조회
    const room = await getData<Room>(`rooms/${roomId}`);
    if (!room) {
      throw new Error('방을 찾을 수 없습니다.');
    }

    // 방장 확인
    if (room.hostUserId !== hostUserId) {
      throw new Error('방장만 설정을 변경할 수 있습니다.');
    }

    // 게임 시작 전에만 변경 가능
    if (room.status !== 'waiting') {
      throw new Error('게임 시작 후에는 설정을 변경할 수 없습니다.');
    }

    // 검증
    if (
      settings.maxPlayers !== undefined &&
      !validatePlayerCount(settings.maxPlayers)
    ) {
      throw new Error('유효하지 않은 최대 인원입니다.');
    }

    // 현재 인원보다 적게 설정할 수 없음
    if (
      settings.maxPlayers !== undefined &&
      settings.maxPlayers < room.currentPlayers
    ) {
      throw new Error('현재 인원보다 적게 설정할 수 없습니다.');
    }

    // 업데이트 객체 준비
    const updates: Record<string, any> = {};
    if (settings.maxPlayers !== undefined) {
      updates[`rooms/${roomId}/maxPlayers`] = settings.maxPlayers;
      updates[`roomDetails/${roomId}/info/settings/maxPlayers`] =
        settings.maxPlayers;
    }
    if (settings.category !== undefined) {
      updates[`rooms/${roomId}/settings/category`] = settings.category;
      updates[`roomDetails/${roomId}/info/settings/category`] =
        settings.category;
    }
    if (settings.difficulty !== undefined) {
      updates[`rooms/${roomId}/settings/difficulty`] = settings.difficulty;
      updates[`roomDetails/${roomId}/info/settings/difficulty`] =
        settings.difficulty;
    }
    updates[`rooms/${roomId}/updatedAt`] = Date.now();

    await updateMultiplePaths(updates);
  }

  /**
   * 방 정보 조회
   */
  async getRoomById(roomId: string): Promise<Room | null> {
    return await getData<Room>(`rooms/${roomId}`);
  }

  /**
   * 방의 플레이어 목록 조회
   */
  async getPlayers(roomId: string): Promise<Player[]> {
    const players = await getData<Record<string, Player>>(
      `roomDetails/${roomId}/players`
    );
    if (!players) return [];
    return Object.values(players);
  }

  /**
   * 모든 방 목록 조회 (대기 중인 방만)
   */
  async getRoomList(): Promise<Room[]> {
    const rooms = await getData<Record<string, Room>>('rooms');
    if (!rooms) return [];

    return Object.values(rooms)
      .filter((room) => room.status === 'waiting')
      .sort((a, b) => b.createdAt - a.createdAt); // 최신순 정렬
  }
}

// Singleton 인스턴스
export const roomService = new RoomService();
