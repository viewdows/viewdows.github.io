import MessageBus from "../messaging";
import InteractionObserver from "./InteractionObserver";
import ViewTracker from "./ViewTracker";
declare class ViewWorker {
    viewId: string;
    interactionObserver: InteractionObserver;
    viewTracker: ViewTracker;
    messageBus: MessageBus;
    history: (EventUpdateMessageBlock | DataUpdateMessageBlock | ConstraintUpdateMessageBlock)[];
    historyListeners: Function[];
    constructor();
    addHistoryListener(callback: Function): void;
    setupHistoryReceiver(): void;
    listen(type: "event" | "data" | "constraint" | "arrange" | "history", callback: Function): void;
    destroy(): void;
    acquireLock(lockName: string, timeOut?: number): Promise<unknown>;
    releaseLock(lockName: string): void;
    broadcastData(data: any): void;
    broadcastConstraint(constraint: any, strategy?: "add" | "remove" | "replace"): void;
}
export default ViewWorker;
