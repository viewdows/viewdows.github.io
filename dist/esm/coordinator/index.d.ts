import MessageBus from "../messaging";
import WindowSpaceManager from "./DisplaySpaceManager";
import HistoryManager from "./HistoryManager";
import ViewManager from "./ViewManager";
declare class ViewCoordinator {
    displaySpaceManager: WindowSpaceManager;
    historyManager: HistoryManager;
    viewManager: ViewManager;
    messageBus: MessageBus;
    constructor();
    broadcastData(data: any): void;
    broadcastConstraint(constraint: any, strategy?: "add" | "remove" | "replace"): void;
    listen(type: "event" | "data" | "constraint" | "arrange" | "history", callback: Function): any;
    setupCoordinatorLinks(): void;
}
export default ViewCoordinator;
