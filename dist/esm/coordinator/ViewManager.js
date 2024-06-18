class ViewManager {
    views;
    historyManager;
    displaySpaceManager;
    messageBus;
    constructor(historyManager, displaySpaceManager, messageBus) {
        this.views = new Map();
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
                    height: message.height,
                },
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
            if (message.x !== undefined) {
                position.x = message.x;
            }
            if (message.y !== undefined) {
                position.y = message.y;
            }
            if (message.width !== undefined) {
                position.width = message.width;
            }
            if (message.height !== undefined) {
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
}
export default ViewManager;
