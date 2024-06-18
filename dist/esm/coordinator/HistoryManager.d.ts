import MessageBus from "../messaging";
declare class HistoryManager {
    history: (EventUpdateMessageBlock | DataUpdateMessageBlock | ConstraintUpdateMessageBlock)[];
    locks: Map<string, string[]>;
    messageBus: MessageBus;
    listeners: Map<string, Function[]>;
    constructor(messageBus: MessageBus);
    setupListeners(): void;
    listen(type: "data" | "event" | "constraint", callback: Function): void;
    addInteraction(interaction: EventUpdateMessageBlock | DataUpdateMessageBlock | ConstraintUpdateMessageBlock): void;
    operationalTransformation(): void;
    getHistory(): (EventUpdateMessageBlock | DataUpdateMessageBlock | ConstraintUpdateMessageBlock)[];
    getLock(lockId: string): string[];
    acquireLock(message: AcquireLockMessageBlock): void;
    releaseLock(message: ReleaseLockMessageBlock): void;
    sendHistory(viewId: string): void;
}
export default HistoryManager;
