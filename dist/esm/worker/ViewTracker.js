class ViewTracker {
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
        if (!firstTime &&
            (x !== this.position.x ||
                y !== this.position.y ||
                width !== this.position.width ||
                height !== this.position.height)) {
            this.messageBus.broadcast({
                type: "view-update",
                uid: this.viewId,
                x,
                y,
                width,
                height,
            });
        }
        requestAnimationFrame(this.setupObserver.bind(this, false));
    }
    listenArrangeChange(callback) {
        this.messageBus.listen("arrange-update", callback);
    }
}
export default ViewTracker;
