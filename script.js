const CLIENT_ID = 'JLiWGFp2LQ9CiqAt'; // Replace with your own CLIENT_ID

const potatoImages = [
  'https://yourwebsite.com/potato1.png',
  'https://yourwebsite.com/potato2.png',
  'https://yourwebsite.com/potato3.png',
  'https://yourwebsite.com/potato4.png',
  'https://yourwebsite.com/potato5.png'
];

// Scaledrone connection with random potato name and random potato image
const drone = new ScaleDrone(CLIENT_ID, {
  data: {
    name: getRandomPotatoName(), // Random potato-themed name
    color: getRandomColor(),
    image: getRandomPotatoImage() // Random potato image for each user
  },
});

let members = [];

drone.on('open', error => {
  if (error) {
    return console.error(error);
  }
  console.log('Successfully connected to Scaledrone');

  const room = drone.subscribe('observable-room');
  room.on('open', error => {
    if (error) {
      return console.error(error);
    }
    console.log('Successfully joined room');
  });

  room.on('members', m => {
    members = m;
    updateMembersDOM();
  });

  room.on('member_join', member => {
    members.push(member);
    updateMembersDOM();
  });

  room.on('member_leave', ({ id }) => {
    const index = members.findIndex(member => member.id === id);
    members.splice(index, 1);
    updateMembersDOM();
  });

  room.on('data', (text, member) => {
    if (member) {
      addMessageToListDOM(text, member);
    }
  });
});

drone.on('close', event => {
  console.log('Connection was closed', event);
});

drone.on('error', error => {
  console.error(error);
});

// Random potato-themed names generator
function getRandomPotatoName() {
  const potatoes = [
    "🥔Baked Potato🥔", "🥔Mashed Potato🥔", "🥔Sweet Potato🥔", "🥔French Fry🥔",
    "🥔Potato Chip🥔", "🥔Tater Tot🥔", "🥔Loaded Potato🥔", "🥔Potato Wedge🥔",
    "🥔Crispy Potato🥔", "🥔Hash Brown🥔", "🥔Duchess Potato🥔", "🥔Potato Salad🥔",
    "🥔Potato Pancake🥔", "🥔Scalloped Spud🥔", "🥔Roasted Potato🥔", "🥔Potato Skins🥔"
  ];
  return potatoes[Math.floor(Math.random() * potatoes.length)];
}

// Random color generator
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

// Random potato image selector
function getRandomPotatoImage() {
  return potatoImages[Math.floor(Math.random() * potatoImages.length)];
}

//------------- DOM STUFF

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
};

DOM.form.addEventListener('submit', sendMessage);

function sendMessage() {
  const value = DOM.input.value;
  if (value === '') {
    return;
  }
  DOM.input.value = '';
  drone.publish({
    room: 'observable-room',
    message: value,
  });
}

function createMemberElement(member) {
  const { name, color, image } = member.clientData;
  const el = document.createElement('div');
  const img = document.createElement('img');
  
  img.src = image;
  img.alt = 'Potato Image';
  img.style.width = '30px';
  img.style.height = '30px';
  img.style.borderRadius = '50%';
  img.style.marginRight = '10px';
  
  el.appendChild(img);
  el.appendChild(document.createTextNode(name));
  el.className = 'member';
  el.style.color = color;
  el.style.fontWeight = 'bold';
  el.style.padding = '5px';
  el.style.borderRadius = '5px';
  el.style.transition = 'background-color 0.3s';
  
  el.addEventListener('mouseover', () => {
    el.style.backgroundColor = '#f0e68c'; // Highlight on hover
  });
  
  el.addEventListener('mouseout', () => {
    el.style.backgroundColor = ''; // Remove highlight
  });
  
  return el;
}

function updateMembersDOM() {
  DOM.membersCount.innerText = `${members.length} users in room:`;
  DOM.membersList.innerHTML = '';
  members.forEach(member =>
    DOM.membersList.appendChild(createMemberElement(member))
  );
}

function createMessageElement(text, member) {
  const el = document.createElement('div');
  el.appendChild(createMemberElement(member));
  el.appendChild(document.createTextNode(text));
  el.className = 'message';
  el.style.padding = '10px';
  el.style.borderRadius = '5px';
  el.style.backgroundColor = '#e1f7d5'; // Light green background for messages
  el.style.marginBottom = '10px';
  el.style.transition = 'transform 0.2s';
  
  // Animation on new message
  el.style.transform = 'translateY(10px)';
  setTimeout(() => {
    el.style.transform = 'translateY(0)';
  }, 100);
  
  return el;
}

function addMessageToListDOM(text, member) {
  const el = DOM.messages;
  const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
  el.appendChild(createMessageElement(text, member));
  if (wasTop) {
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }
}
