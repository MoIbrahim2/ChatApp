// pass the displayMessage function
async function requestForUndeliveredMessages(userId, displayMessage) {
  try {
    console.log('Connected to server');
    let response = await fetch(
      `http://localhost:3000/message/checkForUndeliveredMessages`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.ok) {
      let messages = await response.json();
      if (messages.length !== 0)
        messages.forEach(async (message) => {
          const { userName, content, otherUserId } = message;
          displayMessage(`${userName}: ${content}`, otherUserId);
          await fetch('http://localhost:3000/message/saveMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              senderName: userName,
              content,
              senderId: otherUserId,
              receiverId: userId,
            }),
          });
        });
    }
  } catch (err) {
    console.log(err.message);
  }
}
