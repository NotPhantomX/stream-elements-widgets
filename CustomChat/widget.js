let totalMessages = 0,
  messagesLimit = 0,
  channelName,
  provider,
  addition,
  removeSelector,
  localTimeStamp,
  autoUserColor,
  borderColorUser,
  userColor,
  cardColorUser,
  optCardColorUser,
  timeStamp,
  borderMessage,
  animationIn,
  animationOut;
let hideCommands = true;
let messageSize = 24;
let hideAfter = 60;
let ignoredUsers = [];

window.addEventListener('onEventReceived', (obj) => {
  // Delete messages
  if (obj.detail.listener === 'delete-message') {
    const msgId = obj.detail.event.msgId;
    $(`.message-row[data-id=${msgId}]`).remove();
    return;
  } else if (obj.detail.listener === 'delete-messages') {
    const userId = obj.detail.event.userId;
    $(`.message-row[data-from=${userId}]`).remove();
    return;
  }

  // Test chat
  if (obj.detail.event.listener === 'widget-button') {
    if (obj.detail.event.field === 'testMessage') {
      const emulated = new CustomEvent('onEventReceived', {
        detail: {
          listener: 'message',
          event: {
            service: 'twitch',
            data: {
              time: Date.now(),
              tags: {
                'badge-info': '',
                badges: 'moderator/1,partner/1',
                color: '#5B99FF',
                'display-name': 'StreamElements',
                emotes: '25:46-50',
                flags: '',
                id: '43285909-412c-4eee-b80d-89f72ba53142',
                mod: '1',
                'room-id': '85827806',
                subscriber: '0',
                'tmi-sent-ts': '1579444549265',
                turbo: '0',
                'user-id': '100135110',
                'user-type': 'mod',
              },
              nick: channelName,
              userId: '100135110',
              displayName: channelName,
              displayColor: '#5B99FF',
              badges: [
                {
                  type: 'moderator',
                  version: '1',
                  url: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3',
                  description: 'Moderator',
                },
                {
                  type: 'partner',
                  version: '1',
                  url: 'https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3',
                  description: 'Verified',
                },
              ],
              channel: channelName,
              text: 'Hello! This is a test message. Congratulations, everything is working fine Kappa',
              isAction: !1,
              emotes: [
                {
                  type: 'twitch',
                  name: 'Kappa',
                  id: '25',
                  gif: !1,
                  urls: {
                    1: 'https://static-cdn.jtvnw.net/emoticons/v1/25/1.0',
                    2: 'https://static-cdn.jtvnw.net/emoticons/v1/25/1.0',
                    4: 'https://static-cdn.jtvnw.net/emoticons/v1/25/3.0',
                  },
                  start: 46,
                  end: 50,
                },
              ],
              msgId: '43285909-412c-4eee-b80d-89f72ba53142',
            },
            renderedText:
              'Hello! This is a test message. Congratulations, everything is working fine Kappa',
          },
        },
      });
      window.dispatchEvent(emulated);
    }
    return;
  }

  // Handle message
  if (obj.detail.listener !== 'message') return;
  let data = obj.detail.event.data;

  if (data.text.startsWith('!') && hideCommands) return;

  if (ignoredUsers.includes(data.nick)) return;

  let message = attachEmotes(data);

  const badges = data.badges
    .map((badge) => `<img alt="" src="${badge.url}" class="badge">`)
    .join(' ');

  let color = data.tags.color;
  if (color === '') {
    const username = data.displayName;
    color =
      data.displayColor !== ''
        ? data.displayColor
        : `#${md5(username).substr(26)}`;
  }

  addMessage(
    obj.detail.event.data.displayName,
    message,
    badges,
    data.userId,
    data.msgId,
    color,
    data.isAction,
  );
});

window.addEventListener('onWidgetLoad', (obj) => {
  const fieldData = obj.detail.fieldData;
  messagesLimit = parseInt(fieldData.messagesLimit);
  topDegrade = parseInt(fieldData.topDegrade);
  hideCommands = fieldData.hideCommands;
  hideAfter = parseInt(fieldData.hideAfter);
  animationIn = fieldData.animationIn;
  animationOut = fieldData.animationOut;
  borderMessage = fieldData.msgBorderColor;
  timeStamp = fieldData.timeStamp;
  channelName = obj.detail.channel.username;
  messageSize = parseInt(fieldData.messageSize);
  borderColorUser = fieldData.msgBorderColorUser;
  optCardColorUser = fieldData.msgOptCardColorUser;
  cardColorUser = fieldData.msgCardColorUser;
  userColor = fieldData.userColor;
  autoUserColor = fieldData.autoUserColor;
  localTimeStamp = fieldData.localTimeStamp;
  ignoredUsers = fieldData.ignoredUsers
    .toLowerCase()
    .replace(' ', '')
    .split(',');
  fetch(
    `https://api.streamelements.com/kappa/v2/channels/${obj.detail.channel.id}/`,
  )
    .then((response) => response.json())
    .then((profile) => {
      provider = profile.provider;
    });

  if (fieldData.alignMessages === 'display: block') {
    addition = 'prepend';
    removeSelector = `.message-row:nth-child(n+${messagesLimit + 1})`;
  } else {
    addition = 'append';
    removeSelector = `.message-row:nth-last-child(n+${messagesLimit + 1})`;
  }
});

function addMessage(username, message, badges, userId, msgId, color, isAction) {
  totalMessages += 1;

  const actionClass = isAction ? 'action' : '';
  let aUserColor = autoUserColor ? color : userColor;
  const cardColor = optCardColorUser ? color : cardColorUser;
  if (borderColorUser) borderMessage = color;
  if (optCardColorUser && autoUserColor) {
    aUserColor = userColor;
  }

  const time = timeStamp
    ? `
    <br>
    <div class="time" style="font-size:${
      messageSize - messageSize / 4
    }px; text-align:${localTimeStamp};">
      ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </div>
  `
    : '';

  const element = $(`
    <div data-from"${userId}" data-id="${msgId}" class="message-row ${String(
    animationIn,
  )} animate_animated" id="msg-${totalMessages}">
      <div class="meta" style="background-color: ${cardColor}">
        <div class="badges">${badges}</div>
        <div class="name" style="color: ${aUserColor}">${username}</div>
      </div>
      <div class="message">
        <div class="container-message ${actionClass}" style="border-color: ${borderMessage}">
          ${message}
          ${time}
        </div>
     </div>
    </div>
  `);

  const log = $('#log');

  if (addition === 'append') log.append(element);
  else log.prepend(element);

  if (hideAfter !== 0) {
    setTimeout(() => {
      element.removeClass(animationIn).addClass(String(animationOut));
      setTimeout(() => {
        element.remove();
      }, 1000);
    }, hideAfter * 1000);
  }

  if (messagesLimit > 0 && totalMessages > messagesLimit) {
    removeRow();
  }
}

function attachEmotes(message) {
  let text = htmlEncode(message.text);
  let { emotes } = message;
  const media = message.attachment?.media?.image?.src;

  if (media) {
    return `${text}<img src="${media}">`;
  }

  const regex = /\S+/gi;

  return text.replace(regex, (key) => {
    const hasEmote = emotes.some((emote) => emote.name === key);

    if (hasEmote) {
      const {
        urls,
        coords = { x: 0, y: 0 },
        width,
        height,
      } = emotes.find((emote) => emote.name === key);
      const x = parseInt(coords.x);
      const y = parseInt(coords.y);
      const size = `width: ${width ? `${width}px` : 'auto'}; height: ${
        height ? `${height}px` : 'auto'
      };`;

      if (provider === 'twitch') {
        return `<img width="${messageSize + 5}" class="emote" src="${
          urls[4]
        }"/>`;
      } else {
        return `<div class="emote" style="display: inline-block; background-image: url(${urls[4]}); background-position: -${x}px -${y}px; ${size}"></div>`;
      }
    }

    return key;
  });
}

function htmlEncode(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

function removeRow() {
  const elementToRemove = $(removeSelector);
  if (elementToRemove.length === 0) return;

  elementToRemove.stop();

  if (elementToRemove.is(animationIn)) {
    elementToRemove.removeClass(animationIn);
  }

  if (animationOut !== 'none' || !elementToRemove.is(animationOut)) {
    if (hideAfter !== 0) {
      elementToRemove.finish();
    } else {
      elementToRemove.addClass(animationOut).one('animationend', () => {
        elementToRemove.remove();
      });
    }
  } else {
    elementToRemove.animate({ height: 0, opacity: 0 }, 'slow', () => {
      elementToRemove.remove();
    });
  }
}
