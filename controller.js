// controller.js
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://localhost')

var garageState = ''
var connected = false

client.on('connect', () => {
  console.log('connected: now subscribe to some topic')
  client.subscribe('garage/connected')
  client.subscribe('garage/state')
  run()
})

client.on('message', (topic, message) => {
  switch (topic) {
    case 'garage/connected':
      return handleGarageConnected(message)
    case 'garage/state':
      return handleGarageState(message)
  }
  console.log('No handler for topic %s', topic)
})

function handleGarageConnected (message) {
  console.log('garage connected status %s', message)
  connected = (message.toString() === 'true')
}

function handleGarageState (message) {
  garageState = message
  connected = true
  console.log('received state from garage: updated to %s', message)
}

function openGarageDoor () {
  // can only open door if we're connected to mqtt and door isn't already open
  console.log('trying to open a %s garage [connected=%s]', garageState, connected)
  if (connected && garageState !== 'open') {
    // Ask the door to open
    client.publish('garage/open', 'true')
  } else {
    console.log('cannot open')
  }
}

function closeGarageDoor () {
  console.log('trying to close a %s garage [connected=%s]', garageState, connected)
  // can only close door if we're connected to mqtt and door isn't already closed
  if (connected && garageState !== 'closed') {
    // Ask the door to close
    client.publish('garage/close', 'true')
  } else {
    console.log('cannot close')
  }
}

function infoGarageDoor () {
  console.log('request state update')
  client.publish('garage/info', '?')
}

// --- For Demo Purposes Only ----//

// simulate opening garage door

function iterate() {

setTimeout(() => {
    console.log('--> open door')
  openGarageDoor()

// simulate closing garage door
setTimeout(() => {
      console.log('--> close door')
      closeGarageDoor();
      iterate();
    }, 6000)
  }, 6000)

}

function run() {
  infoGarageDoor();
  iterate();
}