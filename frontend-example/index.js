const chatEnterButtonEl = document.getElementById('chat-enter-button');
const chatInputEl = document.getElementById('chat-input');
const chatWindowEl = document.getElementById('chat-window');
const chatTestButtonEl = document.getElementById('chat-test-button');

const chat = `<div></div>`;

const socket = io('ws://localhost:8080', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log(`${socket.id} 님으로 연결되었습니다.`);
});

chatEnterButtonEl.addEventListener('click', () => {
  socket.emit('test', chatInputEl.value);
});

chatTestButtonEl.addEventListener('click', () => {
  socket.emit('test', chatInputEl.value);
});

socket.on('test', (arg) => {
  console.log(arg);
  createChat(arg.id, arg.message);
});

function createChat(isMe, message) {
  const chat = document.createElement('div');
  chat.innerHTML = message;
  console.log(message);

  console.log(chatWindowEl);
  chatWindowEl.insertAdjacentElement('beforeend', chat);
}
