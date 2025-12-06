# Firebase Realtime Database 구조 설계

## 목차
1. [설계 원칙](#1-설계-원칙)
2. [전체 구조 개요](#2-전체-구조-개요)
3. [상세 데이터 구조](#3-상세-데이터-구조)
4. [실제 게임 시나리오 예시](#4-실제-게임-시나리오-예시)
5. [보안 규칙](#5-보안-규칙)
6. [인덱싱 전략](#6-인덱싱-전략)
7. [실시간 리스너 전략](#7-실시간-리스너-전략)

---

## 1. 설계 원칙

### 1.1 Firebase Realtime Database 특성
- **비정규화 (Denormalization)**: 읽기 성능을 위해 데이터 중복 허용
- **평탄한 구조 (Flat Structure)**: 깊은 중첩 피하기
- **쿼리 최적화**: 자주 함께 읽는 데이터는 함께 배치
- **원자적 업데이트**: Multi-path update 활용

### 1.2 Catchmind 특화 고려사항
- 실시간 게임이므로 **읽기 성능**이 최우선
- 방 단위로 데이터 격리 (다른 방 데이터 불필요)
- 게임 종료 후 히스토리는 별도 저장 (옵션)
- Canvas 스트로크는 임시 데이터 (게임 중에만 유지)

---

## 2. 전체 구조 개요

```
firebase-database/
├── users/                    # 유저 기본 정보
│   └── {userId}/
├── rooms/                    # 방 메타데이터 (리스트용)
│   └── {roomId}/
├── roomDetails/              # 방 상세 정보 (실시간 게임 데이터)
│   └── {roomId}/
│       ├── info/            # 방 기본 정보
│       ├── players/         # 참가자 목록 및 상태
│       ├── game/            # 현재 게임 상태
│       ├── canvas/          # 캔버스 스트로크 (임시)
│       └── chat/            # 채팅 메시지
├── words/                    # 제시어 풀
│   └── {category}/
│       └── {difficulty}/
└── gameHistory/             # 게임 기록 (선택)
    └── {gameId}/
```

---

## 3. 상세 데이터 구조

### 3.1 users (유저 기본 정보)

**경로**: `/users/{userId}`

```json
{
  "users": {
    "user_001": {
      "nickname": "꼬공",
      "avatarUrl": "https://example.com/avatar1.png",
      "createdAt": 1704067200000,
      "lastActive": 1704070800000
    }
  }
}
```

**용도**: 유저 프로필 조회 (게임 종료 후에도 유지)

**리스너**:
- 본인 정보만 읽기 (프로필 조회 시)
- 실시간 리스너 불필요

---

### 3.2 rooms (방 메타데이터 - 리스트용)

**경로**: `/rooms/{roomId}`

```json
{
  "rooms": {
    "room_KF652739": {
      "code": "KF652739",
      "title": "즐거운 그림 방",
      "hostUserId": "user_001",
      "currentPlayers": 3,
      "maxPlayers": 6,
      "status": "waiting",
      "settings": {
        "category": "all",
        "difficulty": "normal"
      },
      "createdAt": 1704067200000,
      "updatedAt": 1704070800000
    }
  }
}
```

**용도**:
- 방 목록 조회 (로비 화면)
- 방 검색 (방 코드로)
- 가벼운 메타데이터만 포함

**리스너**:
- 로비 화면에서 전체 목록 리스닝 (선택)
- 또는 방 생성/검색 시에만 읽기

---

### 3.3 roomDetails (방 상세 정보 - 실시간 게임 데이터)

**경로**: `/roomDetails/{roomId}`

#### 3.3.1 info (방 기본 정보)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "info": {
        "code": "KF652739",
        "title": "즐거운 그림 방",
        "hostUserId": "user_001",
        "status": "playing",
        "settings": {
          "maxPlayers": 6,
          "category": "all",
          "difficulty": "normal"
        },
        "createdAt": 1704067200000
      }
    }
  }
}
```

**리스너**:
- 방 참가 시 한 번 읽기
- 설정 변경 시에만 업데이트

---

#### 3.3.2 players (참가자 목록 및 상태)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "players": {
        "user_001": {
          "userId": "user_001",
          "nickname": "꼬공",
          "avatarUrl": "https://example.com/avatar1.png",
          "score": 27,
          "status": "drawing",
          "lastChat": "안녕하세요!",
          "isHost": true,
          "joinedAt": 1704067200000,
          "isOnline": true,
          "lastSeen": 1704070800000
        },
        "user_002": {
          "userId": "user_002",
          "nickname": "다조이",
          "avatarUrl": "https://example.com/avatar2.png",
          "score": 15,
          "status": "answered",
          "lastChat": "팥빙수",
          "isHost": false,
          "joinedAt": 1704067300000,
          "isOnline": true,
          "lastSeen": 1704070800000
        }
      }
    }
  }
}
```

**용도**:
- 하단 유저 썸네일 표시
- 점수 실시간 업데이트
- 접속 상태 모니터링

**리스너**:
- 방 전체 `/roomDetails/{roomId}/players` 리스닝
- 개별 플레이어 상태 변경 감지

**비정규화 이유**:
- `nickname`, `avatarUrl`을 복사하여 users 조회 불필요
- 게임 중 빠른 UI 업데이트

---

#### 3.3.3 game (현재 게임 상태)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "gameId": "game_001",
        "phase": "drawing",
        "roundIndex": 0,
        "totalRounds": 6,
        "drawerUserId": "user_001",
        "wordForDrawer": "팥빙수",
        "hintForGuessers": "3글자",
        "remainingSeconds": 42,
        "answeredOrder": ["user_002", "user_003"],
        "drawerOrder": ["user_001", "user_002", "user_003", "user_004"],
        "startedAt": 1704067500000,
        "currentRoundStartedAt": 1704067600000
      }
    }
  }
}
```

**용도**:
- 게임 진행 상태 추적
- 타이머 동기화
- Drawer/Guesser 구분

**리스너**:
- 방 전체 `/roomDetails/{roomId}/game` 리스닝
- phase, remainingSeconds 등 실시간 업데이트

**특이사항**:
- `wordForDrawer`는 서버에만 저장, 클라이언트는 조건부로만 접근
- `answeredOrder`는 정답 순서 추적

---

#### 3.3.4 canvas (캔버스 스트로크)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "canvas": {
        "strokes": {
          "stroke_001": {
            "points": [
              {"x": 100, "y": 150},
              {"x": 102, "y": 152},
              {"x": 105, "y": 155}
            ],
            "color": "#000000",
            "size": 4,
            "tool": "pen",
            "timestamp": 1704067650000
          },
          "stroke_002": {
            "points": [
              {"x": 200, "y": 250},
              {"x": 205, "y": 255}
            ],
            "color": "#FF0000",
            "size": 8,
            "tool": "pen",
            "timestamp": 1704067651000
          }
        },
        "cleared": false,
        "lastUpdated": 1704067651000
      }
    }
  }
}
```

**용도**:
- 실시간 그림 동기화
- 재접속 시 캔버스 복구

**리스너**:
- `/roomDetails/{roomId}/canvas/strokes` 리스닝
- child_added 이벤트로 새 스트로크만 수신

**최적화**:
- 라운드 종료 시 canvas 초기화 (삭제)
- 스트로크는 게임 중에만 유지 (히스토리 저장 안 함)
- Throttling: 클라이언트에서 50ms마다 전송

**대안 (배열 구조)**:
```json
{
  "canvas": {
    "strokes": [
      {
        "points": [...],
        "color": "#000000",
        "size": 4,
        "tool": "pen"
      }
    ]
  }
}
```
❌ 배열은 전체 교체만 가능하므로 실시간 추가에 불리

---

#### 3.3.5 chat (채팅 메시지)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "chat": {
        "messages": {
          "msg_001": {
            "userId": "user_001",
            "type": "user",
            "content": "안녕하세요!",
            "timestamp": 1704067600000
          },
          "msg_002": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 꼬공님, 그림을 그려주세요",
            "timestamp": 1704067610000
          },
          "msg_003": {
            "userId": "user_002",
            "type": "answer",
            "content": "정답!",
            "originalContent": "팥빙수",
            "timestamp": 1704067650000
          }
        }
      }
    }
  }
}
```

**용도**:
- 실시간 채팅
- 시스템 메시지 표시
- 정답 처리

**리스너**:
- `/roomDetails/{roomId}/chat/messages` 리스닝
- child_added 이벤트로 새 메시지만 수신
- 최근 50개만 표시 (limitToLast(50))

**특이사항**:
- `type: "answer"`는 정답 메시지 (다른 유저에게는 "정답!"으로 표시)
- `originalContent`는 실제 답 (본인과 Drawer만 볼 수 있음 - 클라이언트 필터링)

---

### 3.4 words (제시어 풀)

**경로**: `/words/{category}/{difficulty}/{wordId}`

```json
{
  "words": {
    "food": {
      "easy": {
        "word_001": {
          "text": "팥빙수",
          "length": 3,
          "category": "food",
          "difficulty": "easy"
        },
        "word_002": {
          "text": "고로케",
          "length": 3,
          "category": "food",
          "difficulty": "easy"
        }
      },
      "normal": {
        "word_003": {
          "text": "크로아상",
          "length": 4,
          "category": "food",
          "difficulty": "normal"
        }
      }
    },
    "all": {
      "easy": {
        "word_004": {
          "text": "강아지",
          "length": 3,
          "category": "animal",
          "difficulty": "easy"
        }
      }
    }
  }
}
```

**용도**:
- 제시어 선택 시 랜덤 조회
- 카테고리/난이도별 필터링

**리스너**:
- 제시어 선택 시에만 읽기 (once)
- 실시간 리스너 불필요

**쿼리**:
```typescript
// 카테고리와 난이도에 맞는 단어 4개 랜덤 선택
const wordsRef = ref(db, `words/${category}/${difficulty}`);
const snapshot = await get(wordsRef);
const allWords = Object.values(snapshot.val());
const randomWords = shuffle(allWords).slice(0, 4);
```

---

### 3.5 gameHistory (게임 기록) - 선택적

**경로**: `/gameHistory/{gameId}`

```json
{
  "gameHistory": {
    "game_001": {
      "roomId": "room_KF652739",
      "roomTitle": "즐거운 그림 방",
      "players": {
        "user_001": {
          "nickname": "꼬공",
          "finalScore": 55,
          "rank": 1
        },
        "user_002": {
          "nickname": "다조이",
          "finalScore": 43,
          "rank": 2
        }
      },
      "totalRounds": 6,
      "startedAt": 1704067500000,
      "endedAt": 1704068000000,
      "duration": 500
    }
  }
}
```

**용도**:
- 게임 통계 및 기록
- 유저 히스토리 조회

**리스너**:
- 게임 종료 후 한 번만 쓰기
- 조회 시에만 읽기

**MVP에서는 생략 가능**

---

## 4. 실제 게임 시나리오 예시

이 섹션에서는 실제 게임이 진행되는 동안 Firebase 데이터가 어떻게 변화하는지 시나리오별로 보여줍니다.

---

### 시나리오 1: 방 생성 및 플레이어 참가

#### 1-1. 꼬공이 방을 생성

```json
{
  "users": {
    "user_kkogong": {
      "nickname": "꼬공",
      "avatarUrl": null,
      "createdAt": 1704067200000,
      "lastActive": 1704067200000
    }
  },
  "rooms": {
    "room_KF652739": {
      "code": "KF652739",
      "title": "즐거운 그림 방",
      "hostUserId": "user_kkogong",
      "currentPlayers": 1,
      "maxPlayers": 6,
      "status": "waiting",
      "settings": {
        "category": "all",
        "difficulty": "normal"
      },
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    }
  },
  "roomDetails": {
    "room_KF652739": {
      "info": {
        "code": "KF652739",
        "title": "즐거운 그림 방",
        "hostUserId": "user_kkogong",
        "status": "waiting",
        "settings": {
          "maxPlayers": 6,
          "category": "all",
          "difficulty": "normal"
        },
        "createdAt": 1704067200000
      },
      "players": {
        "user_kkogong": {
          "userId": "user_kkogong",
          "nickname": "꼬공",
          "avatarUrl": null,
          "score": 0,
          "status": "idle",
          "lastChat": null,
          "isHost": true,
          "joinedAt": 1704067200000,
          "isOnline": true,
          "lastSeen": 1704067200000
        }
      }
    }
  }
}
```

#### 1-2. 다조이, 보미쌤이 참가 (총 3명)

```json
{
  "rooms": {
    "room_KF652739": {
      "currentPlayers": 3,
      "updatedAt": 1704067400000
    }
  },
  "roomDetails": {
    "room_KF652739": {
      "players": {
        "user_kkogong": { /* 기존 */ },
        "user_dajoy": {
          "userId": "user_dajoy",
          "nickname": "다조이",
          "avatarUrl": null,
          "score": 0,
          "status": "idle",
          "lastChat": null,
          "isHost": false,
          "joinedAt": 1704067300000,
          "isOnline": true,
          "lastSeen": 1704067300000
        },
        "user_bomissam": {
          "userId": "user_bomissam",
          "nickname": "보미쌤",
          "avatarUrl": null,
          "score": 0,
          "status": "idle",
          "lastChat": null,
          "isHost": false,
          "joinedAt": 1704067400000,
          "isOnline": true,
          "lastSeen": 1704067400000
        }
      }
    }
  }
}
```

---

### 시나리오 2: 게임 시작 및 첫 라운드

#### 2-1. 방장(꼬공)이 게임 시작 버튼 클릭

**변경사항:**
- Room status: `waiting` → `playing`
- Game 객체 생성
- 첫 번째 drawer 지정 (꼬공)
- Phase: `choosing`

```json
{
  "rooms": {
    "room_KF652739": {
      "status": "playing",
      "updatedAt": 1704067500000
    }
  },
  "roomDetails": {
    "room_KF652739": {
      "info": {
        "status": "playing"
      },
      "game": {
        "gameId": "game_1704067500",
        "phase": "choosing",
        "roundIndex": 0,
        "totalRounds": 6,
        "drawerUserId": "user_kkogong",
        "wordForDrawer": null,
        "hintForGuessers": null,
        "remainingSeconds": 20,
        "answeredOrder": [],
        "drawerOrder": ["user_kkogong", "user_dajoy", "user_bomissam", "user_kkogong", "user_dajoy", "user_bomissam"],
        "startedAt": 1704067500000,
        "currentRoundStartedAt": 1704067500000
      },
      "players": {
        "user_kkogong": {
          "status": "choosing",
          "score": 0
        },
        "user_dajoy": {
          "status": "guessing",
          "score": 0
        },
        "user_bomissam": {
          "status": "guessing",
          "score": 0
        }
      },
      "chat": {
        "messages": {
          "msg_001": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 게임이 시작되었습니다! 꼬공님, 제시어를 선택해주세요.",
            "timestamp": 1704067500000
          }
        }
      }
    }
  }
}
```

#### 2-2. 꼬공이 제시어 "팥빙수" 선택 (20초 타이머 중 5초 경과)

**변경사항:**
- Phase: `choosing` → `drawing`
- wordForDrawer 설정
- hintForGuessers 설정
- remainingSeconds 초기화 (60초)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "phase": "drawing",
        "wordForDrawer": "팥빙수",
        "hintForGuessers": "3글자",
        "remainingSeconds": 60,
        "currentRoundStartedAt": 1704067515000
      },
      "players": {
        "user_kkogong": {
          "status": "drawing"
        },
        "user_dajoy": {
          "status": "guessing"
        },
        "user_bomissam": {
          "status": "guessing"
        }
      },
      "chat": {
        "messages": {
          "msg_002": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 꼬공님, 그림을 그려주세요! 힌트: 3글자",
            "timestamp": 1704067515000
          }
        }
      }
    }
  }
}
```

---

### 시나리오 3: 게임 진행 중 (그리기 및 채팅)

#### 3-1. 꼬공이 캔버스에 그림 그리기 (진행 중 30초)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "remainingSeconds": 30
      },
      "canvas": {
        "strokes": {
          "stroke_001": {
            "points": [
              {"x": 100, "y": 100},
              {"x": 105, "y": 105},
              {"x": 110, "y": 110}
            ],
            "color": "#FF0000",
            "size": 5,
            "tool": "pen",
            "timestamp": 1704067530000
          },
          "stroke_002": {
            "points": [
              {"x": 200, "y": 150},
              {"x": 205, "y": 155},
              {"x": 210, "y": 160}
            ],
            "color": "#0000FF",
            "size": 3,
            "tool": "pen",
            "timestamp": 1704067535000
          }
        },
        "lastUpdated": 1704067535000
      }
    }
  }
}
```

#### 3-2. 다조이가 채팅으로 오답 입력 (진행 중 20초)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "remainingSeconds": 20
      },
      "players": {
        "user_dajoy": {
          "lastChat": "아이스크림"
        }
      },
      "chat": {
        "messages": {
          "msg_003": {
            "userId": "user_dajoy",
            "type": "user",
            "content": "아이스크림",
            "timestamp": 1704067555000
          }
        }
      }
    }
  }
}
```

#### 3-3. 다조이가 정답 입력! (진행 중 15초)

**변경사항:**
- 다조이 status: `guessing` → `answered`
- 다조이 점수 업데이트 (1등: 10점 + 시간보너스 2점 = 12점)
- answeredOrder에 추가

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "remainingSeconds": 15,
        "answeredOrder": ["user_dajoy"]
      },
      "players": {
        "user_dajoy": {
          "status": "answered",
          "score": 12,
          "lastChat": "정답!"
        }
      },
      "chat": {
        "messages": {
          "msg_004": {
            "userId": "user_dajoy",
            "type": "answer",
            "content": "정답!",
            "originalContent": "팥빙수",
            "timestamp": 1704067560000
          },
          "msg_005": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 다조이님이 1등으로 정답을 맞추셨어요!",
            "timestamp": 1704067560000
          }
        }
      }
    }
  }
}
```

#### 3-4. 보미쌤도 정답 입력! (진행 중 8초)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "remainingSeconds": 8,
        "answeredOrder": ["user_dajoy", "user_bomissam"]
      },
      "players": {
        "user_bomissam": {
          "status": "answered",
          "score": 8,
          "lastChat": "정답!"
        }
      },
      "chat": {
        "messages": {
          "msg_006": {
            "userId": "user_bomissam",
            "type": "answer",
            "content": "정답!",
            "originalContent": "팥빙수",
            "timestamp": 1704067567000
          },
          "msg_007": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 보미쌤님이 2등으로 정답을 맞추셨어요!",
            "timestamp": 1704067567000
          }
        }
      }
    }
  }
}
```

---

### 시나리오 4: 라운드 종료

#### 4-1. 모든 플레이어가 정답 맞춤 → 라운드 조기 종료

**변경사항:**
- Phase: `drawing` → `roundEnd`
- Drawer 점수 업데이트 (모두 정답: 5점 + 3점 = 8점)
- 3초 대기 후 다음 라운드로

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "phase": "roundEnd",
        "remainingSeconds": 0
      },
      "players": {
        "user_kkogong": {
          "status": "idle",
          "score": 8
        },
        "user_dajoy": {
          "status": "idle",
          "score": 12
        },
        "user_bomissam": {
          "status": "idle",
          "score": 8
        }
      },
      "canvas": null,
      "chat": {
        "messages": {
          "msg_008": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 라운드가 종료되었습니다! 정답은 '팥빙수'였어요.",
            "timestamp": 1704067567000
          }
        }
      }
    }
  }
}
```

#### 4-2. 3초 후 다음 라운드 시작 (Drawer: 다조이)

```json
{
  "roomDetails": {
    "room_KF652739": {
      "game": {
        "phase": "choosing",
        "roundIndex": 1,
        "drawerUserId": "user_dajoy",
        "wordForDrawer": null,
        "hintForGuessers": null,
        "remainingSeconds": 20,
        "answeredOrder": [],
        "currentRoundStartedAt": 1704067570000
      },
      "players": {
        "user_kkogong": {
          "status": "guessing"
        },
        "user_dajoy": {
          "status": "choosing"
        },
        "user_bomissam": {
          "status": "guessing"
        }
      },
      "canvas": null,
      "chat": {
        "messages": {
          "msg_009": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 라운드 2/6이 시작됩니다! 다조이님, 제시어를 선택해주세요.",
            "timestamp": 1704067570000
          }
        }
      }
    }
  }
}
```

---

### 시나리오 5: 게임 종료

#### 5-1. 마지막 라운드 종료 후

**변경사항:**
- Room status: `playing` → `finished`
- Game phase: `roundEnd` → `finished`

```json
{
  "rooms": {
    "room_KF652739": {
      "status": "finished",
      "updatedAt": 1704068000000
    }
  },
  "roomDetails": {
    "room_KF652739": {
      "info": {
        "status": "finished"
      },
      "game": {
        "phase": "finished",
        "roundIndex": 5
      },
      "players": {
        "user_kkogong": {
          "status": "idle",
          "score": 55
        },
        "user_dajoy": {
          "status": "idle",
          "score": 63
        },
        "user_bomissam": {
          "status": "idle",
          "score": 47
        }
      },
      "canvas": null,
      "chat": {
        "messages": {
          "msg_100": {
            "userId": null,
            "type": "system",
            "content": "보미쌤: 게임이 종료되었습니다! 1등: 다조이 (63점), 2등: 꼬공 (55점), 3등: 보미쌤 (47점)",
            "timestamp": 1704068000000
          }
        }
      }
    }
  }
}
```

---

### 시나리오 6: 플레이어 연결 끊김 및 재접속

#### 6-1. 보미쌤의 인터넷 연결 끊김

```json
{
  "roomDetails": {
    "room_KF652739": {
      "players": {
        "user_bomissam": {
          "isOnline": false,
          "lastSeen": 1704067800000
        }
      }
    }
  }
}
```

#### 6-2. 보미쌤 재접속

```json
{
  "roomDetails": {
    "room_KF652739": {
      "players": {
        "user_bomissam": {
          "isOnline": true,
          "lastSeen": 1704067850000
        }
      }
    }
  }
}
```

재접속 시 클라이언트는 현재 게임 상태를 다시 로드하여 진행 중인 라운드에 참여합니다.

---

## 5. 보안 규칙

### 5.1 기본 원칙
- 인증된 유저만 읽기/쓰기 가능
- 자기 자신의 데이터만 수정 가능
- 방장만 방 설정 변경 가능
- Drawer만 캔버스 쓰기 가능
- 방 삭제는 방 참가자만 가능 (마지막 플레이어 퇴장 시 자동 삭제)

### 5.2 보안 규칙 (Firebase Rules)

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "rooms": {
      ".read": "auth != null",
      "$roomId": {
        ".write": "auth != null"
      }
    },
    "roomDetails": {
      "$roomId": {
        ".read": "auth != null && data.child('players').child(auth.uid).exists()",
        "info": {
          ".write": "auth != null && (
            !data.exists() ||
            data.parent().child('info/hostUserId').val() == auth.uid
          )"
        },
        "players": {
          "$playerId": {
            ".write": "auth != null && (
              auth.uid == $playerId ||
              data.parent().parent().child('info/hostUserId').val() == auth.uid
            )"
          }
        },
        "game": {
          ".write": "auth != null && data.parent().child('info/hostUserId').val() == auth.uid"
        },
        "canvas": {
          ".read": "auth != null && data.parent().child('players').child(auth.uid).exists()",
          "strokes": {
            ".write": "auth != null && data.parent().parent().child('game/drawerUserId').val() == auth.uid"
          }
        },
        "chat": {
          "messages": {
            ".write": "auth != null && data.parent().parent().parent().child('players').child(auth.uid).exists()"
          }
        }
      }
    },
    "words": {
      ".read": "auth != null",
      ".write": false
    },
    "gameHistory": {
      ".read": "auth != null",
      "$gameId": {
        ".write": "auth != null && !data.exists()"
      }
    }
  }
}
```

---

## 5. 인덱싱 전략

### 5.1 필요한 인덱스

Firebase Realtime Database는 자동 인덱싱이 제한적이므로, 복잡한 쿼리가 필요하면 인덱스를 명시해야 합니다.

```json
{
  "rules": {
    "rooms": {
      ".indexOn": ["status", "createdAt"]
    },
    "roomDetails": {
      "$roomId": {
        "chat": {
          "messages": {
            ".indexOn": ["timestamp"]
          }
        }
      }
    }
  }
}
```

**용도**:
- `rooms`: 상태별 정렬, 생성 시간순 정렬
- `chat/messages`: 최근 메시지 조회 (limitToLast)

---

## 6. 실시간 리스너 전략

### 6.1 리스너 설정 위치

| 경로 | 리스너 타입 | 컴포넌트 | 정리 시점 |
|------|------------|---------|----------|
| `/roomDetails/{roomId}/players` | `on('value')` | GamePage | 방 나갈 때 |
| `/roomDetails/{roomId}/game` | `on('value')` | GamePage | 방 나갈 때 |
| `/roomDetails/{roomId}/canvas/strokes` | `on('child_added')` | CanvasBoard | 방 나갈 때 |
| `/roomDetails/{roomId}/chat/messages` | `on('child_added')` | ChatPanel | 방 나갈 때 |

### 6.2 리스너 예시 (TypeScript)

```typescript
// players 리스너
const playersRef = ref(db, `roomDetails/${roomId}/players`);
const unsubscribe = onValue(playersRef, (snapshot) => {
  const players = snapshot.val();
  setPlayers(players);
});

// 컴포넌트 언마운트 시 정리
useEffect(() => {
  return () => unsubscribe();
}, []);
```

```typescript
// canvas strokes 리스너 (새 스트로크만)
const strokesRef = ref(db, `roomDetails/${roomId}/canvas/strokes`);
const unsubscribe = onChildAdded(strokesRef, (snapshot) => {
  const stroke = snapshot.val();
  drawStroke(stroke); // 캔버스에 그리기
});
```

```typescript
// chat 리스너 (최근 50개만)
const chatRef = query(
  ref(db, `roomDetails/${roomId}/chat/messages`),
  limitToLast(50)
);
const unsubscribe = onChildAdded(chatRef, (snapshot) => {
  const message = snapshot.val();
  addMessage(message);
});
```

### 6.3 최적화 팁

1. **Throttling**: Canvas 스트로크는 50ms마다 배치 전송
2. **Debouncing**: 타이핑 상태는 500ms 디바운스
3. **Presence**: Firebase Presence로 온라인 상태 추적
4. **Multi-path Update**: 여러 경로 동시 업데이트

```typescript
// Multi-path update 예시 (정답 처리)
const updates = {};
updates[`roomDetails/${roomId}/players/${userId}/score`] = newScore;
updates[`roomDetails/${roomId}/players/${userId}/status`] = 'answered';
updates[`roomDetails/${roomId}/game/answeredOrder/${answerIndex}`] = userId;
await update(ref(db), updates);
```

---

## 7. 접속 상태 관리 (Presence)

### 7.1 온라인 상태 추적

```typescript
// 유저 접속 시
const userStatusRef = ref(db, `roomDetails/${roomId}/players/${userId}/isOnline`);
const userLastSeenRef = ref(db, `roomDetails/${roomId}/players/${userId}/lastSeen`);

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
```

### 7.2 재접속 처리

```typescript
// 재접속 시 현재 상태 복구
const roomStateRef = ref(db, `roomDetails/${roomId}`);
const snapshot = await get(roomStateRef);
const roomState = snapshot.val();

// 클라이언트 상태 복구
restoreGameState(roomState);
```

---

## 8. 데이터 크기 최적화

### 8.1 예상 데이터 크기

**6명 게임 (6라운드, 60초 라운드)**
- Players: ~2KB
- Game: ~1KB
- Canvas (1라운드): ~50KB (스트로크 약 100개)
- Chat (전체): ~10KB (메시지 약 50개)
- **총 방당**: ~63KB

**동시 100개 방**: ~6.3MB
**무료 플랜 (1GB 저장)**: 충분

### 8.2 정리 전략

- 게임 종료 후 `canvas` 삭제
- 방이 비면 `roomDetails/{roomId}` 전체 삭제
- 채팅은 최근 50개만 유지 (선택)

---

## 9. 트랜잭션 vs Multi-path Update

### 9.1 트랜잭션이 필요한 경우

```typescript
// 점수 업데이트 (경쟁 조건 방지)
const scoreRef = ref(db, `roomDetails/${roomId}/players/${userId}/score`);
await runTransaction(scoreRef, (currentScore) => {
  return (currentScore || 0) + scoreGain;
});
```

### 9.2 Multi-path Update로 충분한 경우

```typescript
// 라운드 종료 (여러 경로 동시 업데이트)
const updates = {};
updates[`roomDetails/${roomId}/game/phase`] = 'roundEnd';
updates[`roomDetails/${roomId}/game/remainingSeconds`] = 0;
updates[`roomDetails/${roomId}/canvas`] = null; // 캔버스 초기화
await update(ref(db), updates);
```

---

## 10. 요약 및 체크리스트

### ✅ 핵심 결정사항

- [x] **평탄한 구조**: roomDetails 아래 4개 분리 (info, players, game, canvas, chat)
- [x] **비정규화**: players에 nickname, avatarUrl 복사
- [x] **Canvas 객체 구조**: strokes를 객체로 저장 (child_added 이벤트 활용)
- [x] **Chat 제한**: 최근 50개만 유지
- [x] **보안 규칙**: 역할 기반 접근 제어 (방장, Drawer)
- [x] **Presence**: Firebase .info/connected 활용
- [x] **정리 전략**: 게임 종료 시 canvas 삭제, 방 비면 전체 삭제

### 🔄 다음 단계

1. Firebase 프로젝트 생성
2. 보안 규칙 설정
3. 초기 제시어 데이터 시딩
4. TypeScript 타입 정의 생성

---

*이 문서는 구현 과정에서 발견되는 최적화 사항을 반영하여 업데이트됩니다.*
