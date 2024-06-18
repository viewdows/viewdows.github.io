class InteractionObserver {
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
                currentLabel += [...currentTarget.classList]
                    .map((className) => `.${className}`)
                    .join("");
            }
            targetSelector = `${currentLabel} ${targetSelector}`;
            currentTarget = currentTarget.parentElement;
        }
        this.messageBus.broadcast({
            type: "event-update",
            uid: this.viewId,
            event,
            targetSelector,
            timestamp: Date.now(),
        });
    }
    notifyDataChange(data) {
        this.messageBus.broadcast({
            type: "data-update",
            uid: this.viewId,
            data,
            timestamp: Date.now(),
        });
    }
    notifyConstraintChange(strategy, constraint) {
        this.messageBus.broadcast({
            type: "constraint-update",
            uid: this.viewId,
            strategy,
            constraint,
            timestamp: Date.now(),
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
}
export default InteractionObserver;
