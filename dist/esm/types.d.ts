declare type MessageBlock = BroadcastMessageBlock | DirectMessageBlock;
declare type BroadcastMessageBlock = RegisterMessageBlock | UnregisterMessageBlock | ViewUpdateMessageBlock | EventUpdateMessageBlock | DataUpdateMessageBlock | ConstraintUpdateMessageBlock | WindowArrangementUpdateMessageBlock | AcquireLockMessageBlock | ReleaseLockMessageBlock | LockAssignmentMessageBlock;
declare type DirectMessageBlock = RegisterMessageBlock | UnregisterMessageBlock | InteractionHistoryMessageBlock;
declare type RegisterMessageBlock = {
    type: "register";
    uid: string;
    x: number;
    y: number;
    width: number;
    height: number;
};
declare type UnregisterMessageBlock = {
    type: "unregister";
    uid: string;
};
declare type ViewUpdateMessageBlock = {
    type: "view-update";
    uid: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
};
declare type ViewsStatusMessageBlock = {
    type: "views-status";
    views: string[];
};
declare type EventUpdateMessageBlock = {
    type: "event-update";
    uid: string;
    event: Event;
    targetSelector: string;
    timestamp: number;
};
declare type DataUpdateMessageBlock = {
    type: "data-update";
    uid: string;
    data: any;
    timestamp: number;
};
declare type ConstraintUpdateMessageBlock = {
    type: "constraint-update";
    uid: string;
    strategy: "replace" | "add" | "remove";
    constraint: string;
    timestamp: number;
};
declare type WindowArrangementUpdateMessageBlock = WindowArrangementUpdateMessageBasicBlock & (TileWindowBlock | NestWindowBlock | IsolateWindowBlock);
declare type WindowArrangementUpdateMessageBasicBlock = {
    type: "arrange-update";
};
declare type TileWindowBlock = {
    arrangement: "tile";
    layout: "left-right" | "top-down";
    views: string[];
};
declare type NestWindowBlock = {
    arrangement: "nest";
    parentView: string;
    childrenViews: string[];
};
declare type IsolateWindowBlock = {
    arrangement: "isolate";
};
declare type AcquireLockMessageBlock = {
    type: "acquire-lock";
    uid: string;
    lockName: string;
};
declare type ReleaseLockMessageBlock = {
    type: "release-lock";
    uid: string;
    lockName: string;
};
declare type LockAssignmentMessageBlock = {
    type: "lock-assignment";
    uid: string;
    lockName: string;
};
declare type InteractionHistoryMessageBlock = {
    type: "sync-history";
    history: (EventUpdateMessageBlock | DataUpdateMessageBlock | ConstraintUpdateMessageBlock)[];
};
