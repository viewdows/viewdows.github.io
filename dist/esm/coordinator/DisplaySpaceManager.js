class WindowSpaceManager {
    arrangement;
    layout;
    messageBus;
    lastViewCount;
    constructor(messageBus) {
        this.arrangement = "isolate";
        this.layout = "left-right";
        this.messageBus = messageBus;
        this.lastViewCount = 0;
    }
    refreshArrange(views) {
        let layout = {
            arrangement: "isolate",
        };
        if (views.length > 1) {
            // Determine if is nest
            // First find the largest view
            let largestView = views[0];
            for (let view of views) {
                if (view.position.width >= largestView.position.width &&
                    view.position.height >= largestView.position.height) {
                    largestView = view;
                }
            }
            if (views.every((view) => view.position.x >= largestView.position.x &&
                view.position.y >= largestView.position.y &&
                view.position.x + view.position.width <=
                    largestView.position.x + largestView.position.width &&
                view.position.y + view.position.height <=
                    largestView.position.y + largestView.position.height)) {
                layout = {
                    arrangement: "nest",
                    parentView: largestView.id,
                    parentPosition: [
                        largestView.position.x,
                        largestView.position.y,
                        largestView.position.width,
                        largestView.position.height,
                    ],
                    childrenViews: views
                        .filter((view) => view.id !== largestView.id)
                        .map((view) => view.id),
                    childrenPosition: views
                        .filter((view) => view.id !== largestView.id)
                        .map((view) => [
                        view.position.x,
                        view.position.y,
                        view.position.width,
                        view.position.height,
                    ]),
                };
            }
            else {
                // Determine if is tile
                // First x-axis
                views.sort((a, b) => a.position.x - b.position.x);
                if (views.every((view, id) => id == 0 ||
                    (view.position.y >= views[id - 1].position.y &&
                        view.position.y <=
                            views[id - 1].position.y + views[id - 1].position.height) ||
                    (views[id - 1].position.y >= view.position.y &&
                        views[id - 1].position.y <=
                            view.position.y + view.position.height))) {
                    layout = {
                        arrangement: "tile",
                        layout: "left-right",
                        views: views.map((view) => view.id),
                        position: views.map((view) => [
                            view.position.x,
                            view.position.y,
                            view.position.width,
                            view.position.height,
                        ]),
                    };
                }
                else {
                    // Then y-axis
                    views.sort((a, b) => a.position.y - b.position.y);
                    if (views.every((view, id) => id == 0 ||
                        (view.position.x >= views[id - 1].position.x &&
                            view.position.x <=
                                views[id - 1].position.x + views[id - 1].position.width) ||
                        (views[id - 1].position.x >= view.position.x &&
                            views[id - 1].position.x <=
                                view.position.x + view.position.width))) {
                        layout = {
                            arrangement: "tile",
                            layout: "top-down",
                            views: views.map((view) => view.id),
                            position: views.map((view) => [
                                view.position.x,
                                view.position.y,
                                view.position.width,
                                view.position.height,
                            ]),
                        };
                    }
                }
            }
        }
        if (this.arrangement !== layout.arrangement ||
            (layout.arrangement == "tile" && this.layout !== layout.layout) ||
            this.lastViewCount !== views.length ||
            layout.arrangement == "nest") {
            this.arrangement = layout.arrangement;
            if (layout.arrangement == "tile") {
                this.layout = layout.layout;
            }
            this.lastViewCount = views.length;
            this.broadcastArrange(layout);
        }
    }
    broadcastArrange(extra) {
        this.messageBus.broadcast({
            type: "arrange-update",
            ...extra,
        });
    }
}
export default WindowSpaceManager;
