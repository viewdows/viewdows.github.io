import MessageBus from "../messaging";
declare class WindowSpaceManager {
    arrangement: "tile" | "nest" | "isolate";
    layout: "left-right" | "top-down";
    messageBus: MessageBus;
    constructor(messageBus: MessageBus);
    refreshArrange(views: {
        id: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }[]): void;
    broadcastArrange(extra: TileWindowBlock | NestWindowBlock | IsolateWindowBlock): void;
}
export default WindowSpaceManager;
