const express = require('express');
const WebSocket = require('ws');
const { NlpManager } = require('node-nlp');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });
const manager = new NlpManager({ languages: ['en'], forceNER: true });

// Add the same training data and responses as before
manager.addDocument('en', 'goodbye for now', 'greetings.bye');
manager.addDocument('en', 'bye bye take care', 'greetings.bye');
manager.addDocument('en', 'okay see you later', 'greetings.bye');
manager.addDocument('en', 'bye for now', 'greetings.bye');
manager.addDocument('en', 'i must go', 'greetings.bye');
manager.addDocument('en', 'hello', 'greetings.hello');
manager.addDocument('en', 'hi', 'greetings.hello');
manager.addDocument('en', 'howdy', 'greetings.hello');
manager.addAnswer('en', 'greetings.bye', 'Till next time');
manager.addAnswer('en', 'greetings.bye', 'see you soon!');
manager.addAnswer('en', 'greetings.hello', 'Hey there!');
manager.addAnswer('en', 'greetings.hello', 'Greetings!');




// Load the previously trained model
(async () => {
  await manager.load('./model.nlp');
})();

// Define routes for the web server
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the WebSocket server
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Handle incoming WebSocket messages
  ws.on('message', async (message) => {
    console.log(`Received message: ${message}`);

    // Process the user's message and get a response
    const response = await manager.process('en', message.trim());

    // Send the response back to the client
    ws.send(JSON.stringify({ message: response.answer }));
  });
});

// Start the Express server
app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});
