import MessageBus from "../messaging";
declare class ViewTracker {
    viewId: string;
    messageBus: MessageBus;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    constructor(viewId: string, messageBus: MessageBus);
    setupObserver(firstTime?: boolean): void;
    listenArrangeChange(callback: Function): void;
}
export default ViewTracker;
