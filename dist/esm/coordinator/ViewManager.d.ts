import MessageBus from "../messaging";
import WindowSpaceManager from "./DisplaySpaceManager";
import HistoryManager from "./HistoryManager";
declare class ViewManager {
    views: Map<string, {
        id: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }>;
    historyManager: HistoryManager;
    displaySpaceManager: WindowSpaceManager;
    messageBus: MessageBus;
    constructor(historyManager: HistoryManager, displaySpaceManager: WindowSpaceManager, messageBus: MessageBus);
    setupListener(): void;
    registerView(message: RegisterMessageBlock): void;
    unregisterView(message: UnregisterMessageBlock): void;
    updateViewPosition(message: ViewUpdateMessageBlock): void;
    getViews(): {
        id: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }[];
    analyseViewUpdate(): void;
    syncHistoryForView(viewId: any): void;
}
export default ViewManager;
