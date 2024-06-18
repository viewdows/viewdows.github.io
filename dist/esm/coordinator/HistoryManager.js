class HistoryManager {
    history;
    locks;
    messageBus;
    listeners;
    constructor(messageBus) {
        this.history = [];
        this.locks = new Map();
        this.listeners = new Map();
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
            this.listeners
                .get(interaction.type.split("-")[0])
                .forEach((listener) => listener(interaction));
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
                lockName: message.lockName,
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
                    lockName: message.lockName,
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
            history: this.getHistory(),
        });
    }
}
export default HistoryManager;
