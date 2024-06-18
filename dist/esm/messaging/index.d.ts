declare class MessageBus {
    channels: Map<string, {
        channel: BroadcastChannel;
        listeners: Map<string, Function[]>;
    }>;
    adhocs: Map<string, Window>;
    constructor();
    createAdHoc(viewId: string, ref: Window): void;
    removeAdHoc(viewId: string): void;
    sendAdHoc(viewId: string, message: DirectMessageBlock): void;
    createChannel(): void;
    removeChannel(): void;
    _dispatch(message: BroadcastMessageBlock): void;
    listen(type: string, callback: Function): void;
    unlisten(type: string, callback: Function): void;
    broadcast(message: BroadcastMessageBlock, alsoAdHoc?: boolean): void;
}
export default MessageBus;
