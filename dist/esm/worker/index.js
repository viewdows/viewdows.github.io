import { v4 as uuid } from "uuid";
import MessageBus from "../messaging";
import InteractionObserver from "./InteractionObserver";
import ViewTracker from "./ViewTracker";
class ViewWorker {
    viewId;
    interactionObserver;
    viewTracker;
    messageBus;
    history;
    historyListeners = [];
    constructor() {
        this.viewId = uuid();
        this.messageBus = new MessageBus();
        this.interactionObserver = new InteractionObserver(this.viewId, this.messageBus);
        this.viewTracker = new ViewTracker(this.viewId, this.messageBus);
        this.messageBus.createAdHoc("coordinator", window.opener);
        this.messageBus.sendAdHoc("coordinator", {
            type: "register",
            uid: this.viewId,
            ...this.viewTracker.position,
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
        window.onmessage = function (event) {
            if (event.source &&
                event.data &&
                ["sync-history"].includes(event.data.type)) {
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
            uid: this.viewId,
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
                lockName,
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
                        lockName,
                    }); // Cancel the acquirement for the lock to avoid infinite waiting
                    reject(`Time Exceeded for acquiring \`${lockName}\` after ${timeOut}ms`);
                }, timeOut);
            }
        });
    }
    releaseLock(lockName) {
        this.messageBus.broadcast({
            type: "release-lock",
            uid: this.viewId,
            lockName,
        });
    }
    broadcastData(data) {
        this.messageBus.broadcast({
            type: "data-update",
            uid: this.viewId,
            data,
            timestamp: Date.now(),
        });
    }
    broadcastConstraint(constraint, strategy = "add") {
        this.messageBus.broadcast({
            type: "constraint-update",
            uid: this.viewId,
            strategy,
            constraint,
            timestamp: Date.now(),
        });
    }
}
export default ViewWorker;
