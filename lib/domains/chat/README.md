# Chat Domain

## 책임 및 역할
채팅 메시지 전송, 수신, 실시간 동기화를 담당하는 도메인입니다.

## 주요 서비스

### ChatService
채팅 메시지를 관리하는 서비스 클래스입니다.

**주요 메서드:**
- `sendMessage(roomCode, userId, nickname, content, type?)` - 메시지 전송
- `sendSystemMessage(roomCode, content)` - 시스템 메시지 전송
- `sendAnswerMessage(roomCode, userId, nickname, content)` - 정답 메시지 전송
- `getMessages(roomCode, limit?)` - 메시지 목록 조회

## 주요 Hook

### useChat
채팅 메시지를 실시간으로 구독하고 전송하는 훅입니다.

**파라미터:**
- `roomCode` - 방 코드
- `userId` - 사용자 ID
- `nickname` - 사용자 닉네임

**반환 값:**
- `messages` - 메시지 배열 (ChatMessage[])
- `loading` - 로딩 상태
- `sendMessage(content)` - 채팅 메시지 전송 함수
- `sendSystemMessage(content)` - 시스템 메시지 전송 함수
- `sendAnswerMessage(content)` - 정답 메시지 전송 함수

**실시간 구독:**
- `chats/{roomCode}` - 새 메시지 추가 (childAdded)

## Use Case 매핑

이 도메인은 다음 Use Case를 담당합니다:

- **UC-5.1**: 채팅 메시지 전송 - 플레이어가 채팅 메시지 전송
- **UC-5.2**: 채팅 메시지 수신 - 실시간으로 다른 플레이어의 메시지 수신
- **UC-5.3**: 시스템 메시지 - 게임 이벤트 알림 메시지
- **UC-5.4**: 정답 메시지 - 정답 제출 시 특별 표시

## 타입 정의

### ChatMessage
```typescript
interface ChatMessage {
  id: string;               // 메시지 ID
  userId: string;           // 발신자 ID
  nickname: string;         // 발신자 닉네임
  content: string;          // 메시지 내용
  type: MessageType;        // 메시지 타입
  timestamp: number;        // 전송 시간
}
```

### MessageType
```typescript
type MessageType = 'chat' | 'system' | 'answer';
```

- `chat`: 일반 채팅 메시지
- `system`: 시스템 알림 메시지
- `answer`: 정답 메시지 (특별 스타일 적용)

## 메시지 흐름

### 1. 메시지 전송
```typescript
sendMessage(content) {
  const message: ChatMessage = {
    id: generateId(),
    userId, nickname, content,
    type: 'chat',
    timestamp: Date.now()
  };
  await pushData(`chats/${roomCode}`, message);
}
```

### 2. 실시간 수신
```typescript
listenToChildAdded(`chats/${roomCode}`, (message) => {
  setMessages(prev => [...prev, message]);
});
```

### 3. 중복 방지
```typescript
setMessages(prev => {
  if (prev.some(m => m.id === message.id)) {
    return prev; // 이미 있는 메시지는 무시
  }
  return [...prev, message];
});
```

## 메시지 타입별 처리

### 일반 채팅
```typescript
await chatService.sendMessage(
  roomCode, userId, nickname, '안녕하세요!', 'chat'
);
```

### 시스템 메시지
```typescript
// 플레이어 입장
await chatService.sendSystemMessage(
  roomCode, `${nickname}님이 입장하셨습니다.`
);

// 게임 시작
await chatService.sendSystemMessage(
  roomCode, '게임이 시작됩니다!'
);

// 라운드 종료
await chatService.sendSystemMessage(
  roomCode, `정답은 "${word}"였습니다.`
);
```

### 정답 메시지
```typescript
// 정답 시 특별 표시
await chatService.sendAnswerMessage(
  roomCode, userId, nickname, userAnswer
);
```

## 사용 예시

```typescript
import { useChat } from '@/lib/domains/chat/hooks/useChat';

function ChatBox({ roomCode, userId, nickname }) {
  const {
    messages,
    loading,
    sendMessage,
    sendSystemMessage,
  } = useChat({ roomCode, userId, nickname });

  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message message-${message.type}`}
          >
            {message.type === 'system' ? (
              <span className="system">{message.content}</span>
            ) : (
              <>
                <span className="nickname">{message.nickname}: </span>
                <span className="content">{message.content}</span>
              </>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}
```

## 자동 스크롤 구현

```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  // 새 메시지 도착 시 자동 스크롤
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

return (
  <div className="messages">
    {messages.map(message => <Message key={message.id} {...message} />)}
    <div ref={messagesEndRef} />
  </div>
);
```

## Firebase 데이터베이스 구조

```
chats/
  {roomCode}/
    {messageId1}:
      id: "msg_abc123"
      userId: "user1"
      nickname: "플레이어1"
      content: "안녕하세요!"
      type: "chat"
      timestamp: 1234567890

    {messageId2}:
      id: "msg_def456"
      userId: "system"
      nickname: "System"
      content: "플레이어2님이 입장하셨습니다."
      type: "system"
      timestamp: 1234567900

    {messageId3}:
      id: "msg_ghi789"
      userId: "user2"
      nickname: "플레이어2"
      content: "사과"
      type: "answer"
      timestamp: 1234567920
```

## 성능 고려사항

1. **초기 로드 제한**: `getMessages(roomCode, 50)` - 최근 50개만 로드
2. **childAdded 리스너**: 새 메시지만 수신하여 효율적인 동기화
3. **중복 방지**: 메시지 ID로 중복 체크하여 불필요한 리렌더링 방지
4. **메시지 정리**: 오래된 메시지는 주기적으로 정리 (구현 예정)

## UI 스타일 가이드

```css
/* 일반 채팅 */
.message-chat {
  color: black;
}

/* 시스템 메시지 */
.message-system {
  color: gray;
  font-style: italic;
  text-align: center;
}

/* 정답 메시지 */
.message-answer {
  color: green;
  font-weight: bold;
}
```
