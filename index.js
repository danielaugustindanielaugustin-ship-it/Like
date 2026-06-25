const express = require('express');
const WebSocket = require('ws');
const { NlpManager } = require('node-nlp');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });
const manager = new NlpManager({ languages: ['en'], forceNER: true });

const positionArray = [
  {
    location: 'A105',
    position: [-7.78, 3.29, 5.75]
  },
  {
    location: 'A129',
    position: [3.04, 1.32, 3.36]
  },
  {
    location: 'B203',
    position: [20.25, 4.2, 8.08]
  },
];
function convertTextToObject(input) {
  const objects = [];
  const lines = input.split('Class:').map(line => line.trim());

  for (let i = 1; i < lines.length; i++) {
    const classInfo = lines[i].split('Time:');
    const timeInfo = classInfo[1].split('Location:');
    const locationInfo = timeInfo[1].split('Instructor:');
    const instructorInfo = locationInfo[1];

    const classObj = {
      class: classInfo[0].trim(),
      time: timeInfo[0].trim(),
      location: locationInfo[0].trim(),
      instructor: instructorInfo.trim()
    };

    objects.push(classObj);
  }

  return objects;
}

function addPositionToObjectArray(scheduleObject, positionArray) {
  const objectsWithPosition = scheduleObject.map(obj => {
    const positionEntry = positionArray.find(entry => entry.location === obj.location);
    if (positionEntry) {
      return {
        ...obj,
        position: positionEntry.position
      };
    } else {
      return obj;
    }
  });

  return objectsWithPosition;
}


(async () => {
  await manager.load('./model.nlp');
})();

const clients = [];
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  clients.push(ws);

  ws.on('message', async (message) => {

    // console.log(`Received message: ${message}`);



    const response = await manager.process('en', Buffer.from(message, 'hex').toString());

    console.log(response.intent)

    let objectsWithPosition = null;
    if (response.intent === 'help.schedule') {
      let scheduleObject = convertTextToObject(message.toString())
      objectsWithPosition = addPositionToObjectArray(scheduleObject, positionArray);

    }

    const answerWithPosition = response.answer;
    const regex = /{(.*?)}/;
    const match = answerWithPosition.match(regex);
    const answer = answerWithPosition.replace(regex, '').trim();
    const position = match ? match[1].split(',').map(Number) : null;

    clients.forEach((client) => {
      setTimeout(() => {

        client.send(JSON.stringify({ answer: answer, position: position, schedule: objectsWithPosition, intent: response.intent }));
      }, 500);
    });

  });

  // Handle WebSocket disconnections
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    const index = clients.indexOf(ws);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});

// Start the Express server
app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});
