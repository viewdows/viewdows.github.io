import MessageBus from "../messaging";
import WindowSpaceManager from "./DisplaySpaceManager";
import HistoryManager from "./HistoryManager";
import ViewManager from "./ViewManager";
class ViewCoordinator {
    displaySpaceManager;
    historyManager;
    viewManager;
    messageBus;
    constructor() {
        this.messageBus = new MessageBus();
        this.displaySpaceManager = new WindowSpaceManager(this.messageBus);
        this.historyManager = new HistoryManager(this.messageBus);
        this.viewManager = new ViewManager(this.historyManager, this.displaySpaceManager, this.messageBus);
        this.setupCoordinatorLinks();
    }
    broadcastData(data) {
        this.messageBus.broadcast({
            type: "data-update",
            uid: "coordinator",
            data,
            timestamp: Date.now(),
        });
    }
    broadcastConstraint(constraint, strategy = "add") {
        this.messageBus.broadcast({
            type: "constraint-update",
            uid: "coordinator",
            strategy,
            constraint,
            timestamp: Date.now(),
        });
    }
    listen(type, callback) {
        switch (type) {
            case "event":
            case "data":
            case "constraint":
                return this.historyManager.listen(type, callback);
            // case "arrange":
            //   return this.viewTracker.listenArrangeChange(callback);
            case "history":
                return callback(this.historyManager.getHistory());
        }
    }
    setupCoordinatorLinks() {
        const originalOnMessage = window.onmessage;
        const self = this;
        window.onmessage = function (event) {
            if (event.source &&
                event.data &&
                ["register", "unregister"].includes(event.data.type)) {
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
}
export default ViewCoordinator;
