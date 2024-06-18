import MessageBus from "../messaging";
declare class InteractionObserver {
    viewId: string;
    messageBus: MessageBus;
    constructor(viewId: string, messageBus: MessageBus);
    setupEventListeners(): void;
    sendInteraction(event: Event): void;
    notifyDataChange(data: any): void;
    notifyConstraintChange(strategy: "replace" | "add" | "remove", constraint: string): void;
    listenEventUpdate(callback: Function): void;
    listenDataUpdate(callback: Function): void;
    listenConstraintUpdate(callback: Function): void;
}
export default InteractionObserver;
