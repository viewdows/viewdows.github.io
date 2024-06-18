import MessageBus from "../messaging";
import InteractionObserver from "./InteractionObserver";
import ViewTracker from "./ViewTracker";
declare class ViewWorker {
    viewId: string;
    interactionObserver: InteractionObserver;
    viewTracker: ViewTracker;
    messageBus: MessageBus;
    history: (EventUpdateMessageBlock | DataUpdateMessageBlock | ConstraintUpdateMessageBlock)[];
    constructor();
    setupHistoryReceiver(): void;
    listen(type: "event" | "data" | "constraint" | "arrange" | "history", callback: Function): any;
    destroy(): void;
    acquireLock(lockName: string, timeOut?: number): Promise<unknown>;
    releaseLock(lockName: string): void;
    broadcastData(data: any): void;
    broadcastConstraint(constraint: any, strategy?: "add" | "remove" | "replace"): void;
}
export default ViewWorker;
