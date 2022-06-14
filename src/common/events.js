// creates a pub-sub event emitter
class Events {
  constructor() {
    this.events = {};
  }

  // subscribe to an event
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // unsubscribe from an event
  unsubscribe(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter((ev) => ev !== callback);
    }
  }

  // publish an event
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((callback) => {
        callback(data);
      });
    }
  }
}

export default new Events();
