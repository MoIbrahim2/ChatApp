let socket;
let token = null;
let selectedUserId = null;
let userId = null;
let userName = null;
const userChats = {}; // Store chat containers for each user

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert('Email and password are required!');
    return;
  }

  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (response.ok) {
    const data = await response.json();
    token = data.token;
    userName = data.name;
    userId = parseJwt(token).userId; // Extract the userId from the token
    alert(`Login successful! Your user ID is ${userId}`);
    console.log('Cookies:', document.cookie);
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('chatContainer').classList.remove('hidden');
    document.getElementById('chatHeader').textContent =
      `Welcome, ${data.name}!`;

    loadUsersList();

    socket = io('http://localhost:3002');
    socket.emit('on-connect', { userId, name: userName });
    socket.on('connect', () => {
      requestForUndeliveredMessages(userId, displayIncomingMessage);
    });
    socket.on('new-message', handleIncomingMessage);
  } else {
    alert('Login failed. Please try again.');
  }
}

async function loadUsersList() {
  try {
    const response = await fetch('http://localhost:3000/user/all', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const users = await response.json();
      const usersList = document.getElementById('usersList');
      usersList.innerHTML = ''; // Clear previous list

      users.forEach((user) => {
        const userItem = document.createElement('div');
        userItem.classList.add('user-item');
        userItem.textContent = user.name;
        userItem.dataset.userId = user.id;
        const messagesContainer = document.getElementById('messagesContainer');

        loadContainer(user.id, messagesContainer);
        userItem.onclick = () => {
          selectedUserId = user.id;
          updateChatWith(user.name);
          showChatContainer(user.id, messagesContainer);
          // loadPreviousMessages();
        };

        usersList.appendChild(userItem);
      });
    } else {
      alert('Failed to load users.');
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function showChatContainer(userId, messagesContainer) {
  messagesContainer.style.display = 'block';

  Object.values(userChats).forEach((chat) => (chat.style.display = 'none'));

  if (!userChats[userId]) {
    userChats[userId] = document.createElement('div');
    userChats[userId].classList.add('messages');
    messagesContainer.appendChild(userChats[userId]);
  }

  userChats[userId].style.display = 'block';
}
function handleIncomingMessage(message) {
  const { userName, otherUserId, content } = message;
  displayIncomingMessage(`${userName}: ${content}`, otherUserId);
}
async function loadContainer(userId, messagesContainer) {
  userChats[userId] = document.createElement('div');
  userChats[userId].classList.add('messages');
  messagesContainer.appendChild(userChats[userId]);
}

async function loadPreviousMessages() {
  if (!selectedUserId) {
    alert('Select a user to chat with!');
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/chat/chatMessages/${selectedUserId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (response.ok) {
      const messages = await response.json();
      const messagesDiv = userChats[selectedUserId];
      messagesDiv.innerHTML = ''; // Clear previous messages

      messages.forEach((message) => {
        displayMessage(
          `${message.senderName}: ${message.content}`,
          selectedUserId,
        );
      });
    } else {
      alert('Failed to load previous messages.');
    }
  } catch (error) {
    console.error('Error loading previous messages:', error);
  }
}

function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const text = messageInput.value.trim();

  if (!text || !selectedUserId) {
    alert('Enter a message or select a user to chat with!');
    return;
  }

  socket.emit('send-message', {
    receiverId: selectedUserId,
    content: text,
  });
  displayOutgoingMessage(`${userName}: ${text}`);
  messageInput.value = '';
}

function displayMessage(message, userId) {
  const messagesDiv = userChats[userId];
  if (!messagesDiv) return;
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displayIncomingMessage(message, senderId) {
  const messagesDiv = userChats[senderId];
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'left');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);

  // Scroll to the bottom of the chat
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function displayOutgoingMessage(message) {
  if (!selectedUserId) {
    console.error('No selected user to display messages for.');
    return;
  }

  const messagesDiv = userChats[selectedUserId];
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', 'right');
  messageElement.textContent = message;
  messagesDiv.appendChild(messageElement);

  // Scroll to the bottom of the chat
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateChatWith(userName) {
  const chatWithDiv = document.getElementById('chatWith');
  chatWithDiv.textContent = `Chatting with ${userName}`;
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Invalid token', e);
    return {};
  }
}
