// dist/esm/messaging/index.js
var channelName = "ViewdowsMessageBus";
var MessageBus = class {
  channels;
  adhocs;
  constructor() {
    this.channels = /* @__PURE__ */ new Map();
    this.adhocs = /* @__PURE__ */ new Map();
    this.createChannel();
  }
  createAdHoc(viewId, ref) {
    this.adhocs.set(viewId, ref);
  }
  removeAdHoc(viewId) {
    this.adhocs.delete(viewId);
  }
  sendAdHoc(viewId, message) {
    if (this.adhocs.has(viewId)) {
      this.adhocs.get(viewId)?.postMessage(message);
    }
  }
  createChannel() {
    if (!this.channels.has(channelName)) {
      const channel = new BroadcastChannel(channelName);
      channel.onmessage = (message) => {
        this._dispatch(message.data);
      };
      this.channels.set(channelName, { channel, listeners: /* @__PURE__ */ new Map() });
    }
  }
  removeChannel() {
    if (this.channels.has(channelName)) {
      const channel = this.channels.get(channelName).channel;
      channel.close();
      this.channels.delete(channelName);
    }
  }
  _dispatch(message) {
    if (this.channels.has(channelName)) {
      const listenerGroup = this.channels.get(channelName).listeners;
      if (listenerGroup.has(message.type)) {
        const listeners = listenerGroup.get(message.type);
        if (listeners) {
          for (let listener of listeners) {
            listener.call(this, message);
          }
        }
      }
    }
  }
  listen(type, callback) {
    if (this.channels.has(channelName)) {
      const listenerGroup = this.channels.get(channelName).listeners;
      if (!listenerGroup.has(type)) {
        listenerGroup.set(type, []);
      }
      const listeners = listenerGroup.get(type);
      listeners.push(callback);
    }
  }
  unlisten(type, callback) {
    if (this.channels.has(channelName)) {
      const listenerGroup = this.channels.get(channelName).listeners;
      if (listenerGroup.has(type)) {
        const listeners = listenerGroup.get(type);
        if (listeners.includes(callback)) {
          listeners.splice(listeners.indexOf(callback), 1);
        }
      }
    }
  }
  broadcast(message, alsoAdHoc = false) {
    for (const { channel } of this.channels.values()) {
      channel.postMessage(message);
    }
    if (alsoAdHoc) {
      for (const adhoc of this.adhocs.values()) {
        adhoc.postMessage(message);
      }
    }
  }
};
var messaging_default = MessageBus;

// dist/esm/coordinator/DisplaySpaceManager.js
var WindowSpaceManager = class {
  arrangement;
  layout;
  messageBus;
  constructor(messageBus) {
    this.arrangement = "isolate";
    this.layout = "left-right";
    this.messageBus = messageBus;
  }
  refreshArrange(views) {
    let layout = {
      arrangement: "isolate"
    };
    if (views.length > 1) {
      views.sort((a, b) => a.position.x - b.position.x);
      if (views.every((view, id) => id == 0 || view.position.y >= views[id - 1].position.y && view.position.y <= views[id - 1].position.y + views[id - 1].position.height || views[id - 1].position.y >= view.position.y && views[id - 1].position.y <= view.position.y + view.position.height)) {
        layout = {
          arrangement: "tile",
          layout: "left-right",
          views: views.map((view) => view.id),
          position: views.map((view) => [
            view.position.x,
            view.position.y,
            view.position.width,
            view.position.height
          ])
        };
      } else {
        views.sort((a, b) => a.position.y - b.position.y);
        if (views.every((view, id) => id == 0 || view.position.x >= views[id - 1].position.x && view.position.x <= views[id - 1].position.x + views[id - 1].position.width || views[id - 1].position.x >= view.position.x && views[id - 1].position.x <= view.position.x + view.position.width)) {
          layout = {
            arrangement: "tile",
            layout: "top-down",
            views: views.map((view) => view.id),
            position: views.map((view) => [
              view.position.x,
              view.position.y,
              view.position.width,
              view.position.height
            ])
          };
        } else {
          let largestView = views[0];
          for (let view of views) {
            if (view.position.width >= largestView.position.width && view.position.height >= largestView.position.height) {
              largestView = view;
            }
          }
          if (views.every((view) => view.position.x >= largestView.position.x && view.position.y >= largestView.position.y && view.position.x + view.position.width <= largestView.position.x + largestView.position.width && view.position.y + view.position.height <= largestView.position.y + largestView.position.height)) {
            layout = {
              arrangement: "nest",
              parentView: largestView.id,
              parentPosition: [
                largestView.position.x,
                largestView.position.y,
                largestView.position.width,
                largestView.position.height
              ],
              childrenViews: views.filter((view) => view.id !== largestView.id).map((view) => view.id),
              childrenPosition: views.filter((view) => view.id !== largestView.id).map((view) => [
                view.position.x,
                view.position.y,
                view.position.width,
                view.position.height
              ])
            };
          }
        }
      }
    }
    if (this.arrangement !== layout.arrangement || layout.arrangement == "tile" && this.layout !== layout.layout) {
      this.arrangement = layout.arrangement;
      if (layout.arrangement == "tile") {
        this.layout = layout.layout;
      }
      this.broadcastArrange(layout);
    }
  }
  broadcastArrange(extra) {
    this.messageBus.broadcast({
      type: "arrange-update",
      ...extra
    });
  }
};
var DisplaySpaceManager_default = WindowSpaceManager;

// dist/esm/coordinator/HistoryManager.js
var HistoryManager = class {
  history;
  locks;
  messageBus;
  listeners;
  constructor(messageBus) {
    this.history = [];
    this.locks = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.messageBus = messageBus;
    this.setupListeners();
  }
  setupListeners() {
    this.messageBus.listen("event-update", this.addInteraction.bind(this));
    this.messageBus.listen("data-update", this.addInteraction.bind(this));
    this.messageBus.listen("constraint-update", this.addInteraction.bind(this));
    this.messageBus.listen("acquire-lock", this.acquireLock.bind(this));
    this.messageBus.listen("release-lock", this.releaseLock.bind(this));
  }
  listen(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }
  addInteraction(interaction) {
    if (this.listeners.has(interaction.type.split("-")[0])) {
      this.listeners.get(interaction.type.split("-")[0]).forEach((listener) => listener(interaction));
    }
    this.history.push(interaction);
    this.operationalTransformation();
  }
  operationalTransformation() {
    this.history.sort((a, b) => a.timestamp - b.timestamp);
  }
  getHistory() {
    return this.history;
  }
  getLock(lockId) {
    return this.locks.get(lockId);
  }
  acquireLock(message) {
    if (!this.locks.has(message.lockName)) {
      this.locks.set(message.lockName, []);
    }
    const locksQueue = this.locks.get(message.lockName);
    locksQueue.push(message.uid);
    if (locksQueue.length === 1) {
      this.messageBus.broadcast({
        type: "lock-assignment",
        uid: locksQueue[0],
        lockName: message.lockName
      });
    }
  }
  releaseLock(message) {
    if (this.locks.get(message.lockName)) {
      const locksQueue = this.locks.get(message.lockName);
      if (locksQueue.length > 1 && locksQueue.indexOf(message.uid) === 0) {
        this.messageBus.broadcast({
          type: "lock-assignment",
          uid: locksQueue[1],
          lockName: message.lockName
        });
      }
      if (locksQueue.includes(message.uid)) {
        locksQueue.splice(locksQueue.indexOf(message.uid), 1);
      }
    }
  }
  sendHistory(viewId) {
    this.messageBus.sendAdHoc(viewId, {
      type: "sync-history",
      history: this.getHistory()
    });
  }
};
var HistoryManager_default = HistoryManager;

// dist/esm/coordinator/ViewManager.js
var ViewManager = class {
  views;
  historyManager;
  displaySpaceManager;
  messageBus;
  constructor(historyManager, displaySpaceManager, messageBus) {
    this.views = /* @__PURE__ */ new Map();
    this.historyManager = historyManager;
    this.displaySpaceManager = displaySpaceManager;
    this.messageBus = messageBus;
    this.setupListener();
  }
  setupListener() {
    this.messageBus.listen("register", this.registerView.bind(this));
    this.messageBus.listen("unregister", this.unregisterView.bind(this));
    this.messageBus.listen("view-update", this.updateViewPosition.bind(this));
  }
  registerView(message) {
    if (!this.views.has(message.uid)) {
      this.views.set(message.uid, {
        id: message.uid,
        position: {
          x: message.x,
          y: message.y,
          width: message.width,
          height: message.height
        }
      });
      this.analyseViewUpdate();
      this.syncHistoryForView(message.uid);
    }
  }
  unregisterView(message) {
    if (this.views.has(message.uid)) {
      this.views.delete(message.uid);
      this.analyseViewUpdate();
    }
  }
  updateViewPosition(message) {
    if (this.views.has(message.uid)) {
      const position = this.views.get(message.uid).position;
      if (message.x !== void 0) {
        position.x = message.x;
      }
      if (message.y !== void 0) {
        position.y = message.y;
      }
      if (message.width !== void 0) {
        position.width = message.width;
      }
      if (message.height !== void 0) {
        position.height = message.height;
      }
      this.analyseViewUpdate();
    }
  }
  getViews() {
    return Array.from(this.views.values());
  }
  analyseViewUpdate() {
    const views = this.getViews();
    this.displaySpaceManager.refreshArrange(views);
  }
  syncHistoryForView(viewId) {
    this.historyManager.sendHistory(viewId);
  }
};
var ViewManager_default = ViewManager;

// dist/esm/coordinator/index.js
var ViewCoordinator = class {
  displaySpaceManager;
  historyManager;
  viewManager;
  messageBus;
  constructor() {
    this.messageBus = new messaging_default();
    this.displaySpaceManager = new DisplaySpaceManager_default(this.messageBus);
    this.historyManager = new HistoryManager_default(this.messageBus);
    this.viewManager = new ViewManager_default(this.historyManager, this.displaySpaceManager, this.messageBus);
    this.setupCoordinatorLinks();
  }
  broadcastData(data) {
    this.messageBus.broadcast({
      type: "data-update",
      uid: "coordinator",
      data,
      timestamp: Date.now()
    });
  }
  broadcastConstraint(constraint, strategy = "add") {
    this.messageBus.broadcast({
      type: "constraint-update",
      uid: "coordinator",
      strategy,
      constraint,
      timestamp: Date.now()
    });
  }
  listen(type, callback) {
    switch (type) {
      case "event":
      case "data":
      case "constraint":
        return this.historyManager.listen(type, callback);
      case "history":
        return callback(this.historyManager.getHistory());
    }
  }
  setupCoordinatorLinks() {
    const originalOnMessage = window.onmessage;
    const self = this;
    window.onmessage = function(event) {
      if (event.source && event.data && ["register", "unregister"].includes(event.data.type)) {
        const recMessage = event.data;
        switch (recMessage.type) {
          case "register":
            self.messageBus.createAdHoc(recMessage.uid, event.source);
            self.viewManager.registerView(recMessage);
            break;
          case "unregister":
            self.messageBus.removeAdHoc(recMessage.uid);
            self.viewManager.unregisterView(recMessage);
            break;
        }
      }
      if (typeof originalOnMessage === "function") {
        originalOnMessage.call(this, event);
      }
    };
  }
};
var coordinator_default = ViewCoordinator;

// node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

// node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// dist/esm/worker/InteractionObserver.js
var InteractionObserver = class {
  viewId;
  messageBus;
  constructor(viewId, messageBus) {
    this.messageBus = messageBus;
    this.setupEventListeners();
  }
  setupEventListeners() {
    document.addEventListener("click", this.sendInteraction.bind(this));
    document.addEventListener("dblclick", this.sendInteraction.bind(this));
    document.addEventListener("mousemove", this.sendInteraction.bind(this));
    document.addEventListener("mousedown", this.sendInteraction.bind(this));
    document.addEventListener("mouseup", this.sendInteraction.bind(this));
    document.addEventListener("mousewheel", this.sendInteraction.bind(this));
    document.addEventListener("wheel", this.sendInteraction.bind(this));
  }
  sendInteraction(event) {
    let targetSelector = "";
    let currentTarget = event.target;
    while (currentTarget) {
      let currentLabel = currentTarget.tagName;
      if (currentTarget.id) {
        currentLabel += `#${currentTarget.id}`;
      }
      if (currentTarget.classList.length) {
        currentLabel += [...currentTarget.classList].map((className) => `.${className}`).join("");
      }
      targetSelector = `${currentLabel} ${targetSelector}`;
      currentTarget = currentTarget.parentElement;
    }
    this.messageBus.broadcast({
      type: "event-update",
      uid: this.viewId,
      event,
      targetSelector,
      timestamp: Date.now()
    });
  }
  notifyDataChange(data) {
    this.messageBus.broadcast({
      type: "data-update",
      uid: this.viewId,
      data,
      timestamp: Date.now()
    });
  }
  notifyConstraintChange(strategy, constraint) {
    this.messageBus.broadcast({
      type: "constraint-update",
      uid: this.viewId,
      strategy,
      constraint,
      timestamp: Date.now()
    });
  }
  listenEventUpdate(callback) {
    this.messageBus.listen("event-update", callback);
  }
  listenDataUpdate(callback) {
    this.messageBus.listen("data-update", callback);
  }
  listenConstraintUpdate(callback) {
    this.messageBus.listen("constraint-update", callback);
  }
};
var InteractionObserver_default = InteractionObserver;

// dist/esm/worker/ViewTracker.js
var ViewTracker = class {
  viewId;
  messageBus;
  position;
  constructor(viewId, messageBus) {
    this.viewId = viewId;
    this.messageBus = messageBus;
    this.position = { x: 0, y: 0, width: 0, height: 0 };
    this.setupObserver();
  }
  setupObserver(firstTime = true) {
    const x = window.screenX, y = window.screenY, width = window.outerWidth, height = window.outerHeight;
    if (!firstTime && (x !== this.position.x || y !== this.position.y || width !== this.position.width || height !== this.position.height)) {
      this.messageBus.broadcast({
        type: "view-update",
        uid: this.viewId,
        x,
        y,
        width,
        height
      });
    }
    requestAnimationFrame(this.setupObserver.bind(this, false));
  }
  listenArrangeChange(callback) {
    this.messageBus.listen("arrange-update", callback);
  }
};
var ViewTracker_default = ViewTracker;

// dist/esm/worker/index.js
var ViewWorker = class {
  viewId;
  interactionObserver;
  viewTracker;
  messageBus;
  history;
  historyListeners = [];
  constructor() {
    this.viewId = v4_default();
    this.messageBus = new messaging_default();
    this.interactionObserver = new InteractionObserver_default(this.viewId, this.messageBus);
    this.viewTracker = new ViewTracker_default(this.viewId, this.messageBus);
    this.messageBus.createAdHoc("coordinator", window.opener);
    this.messageBus.sendAdHoc("coordinator", {
      type: "register",
      uid: this.viewId,
      ...this.viewTracker.position
    });
    window.onbeforeunload = this.destroy.bind(this);
    this.setupHistoryReceiver();
  }
  addHistoryListener(callback) {
    this.historyListeners.push(callback);
    if (this.history) {
      callback(this.history);
    }
  }
  setupHistoryReceiver() {
    const originalOnMessage = window.onmessage;
    const self = this;
    window.onmessage = function(event) {
      if (event.source && event.data && ["sync-history"].includes(event.data.type)) {
        const recMessage = event.data;
        switch (recMessage.type) {
          case "sync-history":
            self.history = recMessage.history;
            break;
        }
        for (let listener of self.historyListeners) {
          listener(self.history);
        }
      }
      if (typeof originalOnMessage === "function") {
        originalOnMessage.call(this, event);
      }
    };
  }
  listen(type, callback) {
    switch (type) {
      case "event":
        return this.interactionObserver.listenEventUpdate(callback);
      case "data":
        return this.interactionObserver.listenDataUpdate(callback);
      case "constraint":
        return this.interactionObserver.listenConstraintUpdate(callback);
      case "arrange":
        return this.viewTracker.listenArrangeChange(callback);
      case "history":
        return this.addHistoryListener(callback);
    }
  }
  destroy() {
    this.messageBus.sendAdHoc("coordinator", {
      type: "unregister",
      uid: this.viewId
    });
  }
  acquireLock(lockName, timeOut) {
    return new Promise((resolve, reject) => {
      let finished = false;
      const lock = (event) => {
        if (finished)
          return;
        if (event.uid === this.viewId && event.lockName === lockName) {
          finished = true;
          this.messageBus.unlisten("lock-assignment", lock);
          resolve(lockName);
        }
      };
      this.messageBus.listen("lock-assignment", lock);
      this.messageBus.broadcast({
        type: "acquire-lock",
        uid: this.viewId,
        lockName
      });
      if (timeOut && timeOut > 0) {
        setTimeout(() => {
          if (finished)
            return;
          finished = true;
          this.messageBus.unlisten("lock-assignment", lock);
          this.messageBus.broadcast({
            type: "release-lock",
            uid: this.viewId,
            lockName
          });
          reject(`Time Exceeded for acquiring \`${lockName}\` after ${timeOut}ms`);
        }, timeOut);
      }
    });
  }
  releaseLock(lockName) {
    this.messageBus.broadcast({
      type: "release-lock",
      uid: this.viewId,
      lockName
    });
  }
  broadcastData(data) {
    this.messageBus.broadcast({
      type: "data-update",
      uid: this.viewId,
      data,
      timestamp: Date.now()
    });
  }
  broadcastConstraint(constraint, strategy = "add") {
    this.messageBus.broadcast({
      type: "constraint-update",
      uid: this.viewId,
      strategy,
      constraint,
      timestamp: Date.now()
    });
  }
};
var worker_default = ViewWorker;

// dist/esm/index.js
var esm_default = {
  ViewCoordinator: coordinator_default,
  ViewWorker: worker_default
};
export {
  coordinator_default as ViewCoordinator,
  worker_default as ViewWorker,
  esm_default as default
};
