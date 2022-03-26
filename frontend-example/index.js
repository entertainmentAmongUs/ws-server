const chatEnterButtonEl = document.getElementById('chat-enter-button');
const chatInputEl = document.getElementById('chat-input');
const chatWindowEl = document.getElementById('chat-window');

const chat = `<div></div>`;

const socket = io('ws://localhost:8080');

socket.on('connect', () => {
  console.log(`${socket.id} 님으로 연결되었습니다.`);
});

chatEnterButtonEl.addEventListener('click', () => {
  socket.emit('chat message', chatInputEl.value);
});

socket.on('chat message', (arg) => {
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
