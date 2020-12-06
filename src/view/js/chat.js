let socket;

function sendMessage(event) {
  // event.preventDefault();
  const roomName = getRoomNameFromSessionStorage();
  const message = {
    message: document.getElementById("message").value,
    user: sessionStorage.getItem("email"),
    roomName: roomName,
  };
  if (message.message) {
    socket.emit("message", message);
    document.getElementById("message").value = "";
    addMessageToScreen(message, true);
  }
}

// eslint-disable-next-line no-unused-vars
function submitMessage(event) {
  sendMessage(event);
}

// eslint-disable-next-line no-unused-vars
function navigateToRooms() {
  window.location = "/rooms.html";
}

function addMessageToScreen(message, isMine) {
  // cogemos el contenedor de los mensajes
  const messages = document.getElementById("messages-list");
  // creamos el list item para el mensaje
  const listItem = document.createElement("LI");
  const textNode = document.createElement("P");
  const textNode2 = document.createElement("P");
  const text = document.createTextNode(message.message);
  const user = document.createTextNode(message.user);
  if (isMine) {
    listItem.className = "message_sent--mine";
    user.className = "user-chat--mine";

    textNode.appendChild(text);
    textNode2.appendChild(user);
    listItem.appendChild(textNode);
    listItem.appendChild(textNode2);
  } else {
    listItem.className = "message_sent";
    user.className = "user-chat";

    textNode.appendChild(text);
    textNode2.appendChild(user);
    listItem.appendChild(textNode2);
    listItem.appendChild(textNode);
  }

  messages.appendChild(listItem);

  // Scroll hasta abajo
  const container = document.getElementById("chat");
  container.scrollTop = container.scrollHeight;
}

const baseURL = "http://localhost:3000/";

const cleanUsers = () => {
  const usernames = document.getElementById("usernames");
  usernames.removeChild(usernames.lastElementChild);
};

const printUsers = () => {
  const rooms = JSON.parse(sessionStorage.getItem("rooms"));
  const actualRoom = sessionStorage.getItem("connectedRoom");

  const usernames = document.getElementById("usernames");
  const node = document.createElement("UL");
  node.className = "user-list";

  rooms[actualRoom].users.forEach((user) => {
    const userElement = document.createElement("LI");
    const textNode = document.createElement("P");
    const text = document.createTextNode(user);
    textNode.className = "card_text";
    textNode.appendChild(text);
    userElement.appendChild(textNode);
    node.appendChild(userElement);
  });
  usernames.appendChild(node);
};

function getRoomNameFromSessionStorage() {
  const roomNumber = sessionStorage.getItem("connectedRoom");
  return getRoomName(roomNumber);
}

function getRoomName(roomNumber) {
  // we have the room name in the 'rooms' attribute in sessionstorage, which we can
  // access via the 'connectedRoom' value
  // if we don't find a use for an AJAX request, make this a request in order to
  // at least have a GET implemented
  const roomsFromSessionStorage = sessionStorage.getItem("rooms");
  const lsRoomsObj = JSON.parse(roomsFromSessionStorage);
  const roomObj = lsRoomsObj[roomNumber];
  return roomObj.name;
}

function replaceRoomName(roomNumber) {
  const roomName = getRoomName(roomNumber);
  const domElem = document.getElementById("room-name");
  domElem.textContent = roomName;
  return roomName;
}

function setAdminPillVisibility(currentRoomObj, userEmail) {
  const pillDomObj = document.getElementById("admin-pill");
  const { roomCreator } = currentRoomObj;
  if (roomCreator === userEmail) {
    pillDomObj.classList.remove("d-none");
  }
}

$(document).ready(function () {
  const data = {
    user: sessionStorage.getItem("email"),
    room: sessionStorage.getItem("connectedRoom"),
  };

  const roomsObj = JSON.parse(sessionStorage.getItem("rooms"));

  printUsers();

  const roomName = replaceRoomName(data.room);

  setAdminPillVisibility(roomsObj[data.room], data.user);

  // eslint-disable-next-line no-undef
  socket = io.connect("http://localhost:8000", {
    query: `data=${JSON.stringify(data)}`,
  });

  socket.on("connect", () => {
    socket.emit("room", roomName);
  });

  socket.on("newUserConnected", async () => {
    const url = new URL(`${baseURL}rooms`);
    const result = await fetch(url);

    if (result.status === 200) {
      const rooms = await result.json();

      // eslint-disable-next-line no-undef
      sessionStorage.setItem("rooms", JSON.stringify(rooms));

      cleanUsers();
      printUsers();
    }
  });

  socket.on("message", function (socket, message) {
    addMessageToScreen(message, false);
  });
});
