const channelName = "BCastViewMessageBus";
class MessageBus {
    channels;
    adhocs;
    constructor() {
        this.channels = new Map();
        this.adhocs = new Map();
        this.createChannel();
    }
    createAdHoc(viewId, ref) {
        this.adhocs.set(viewId, ref);
    }
    removeAdHoc(viewId) {
        this.adhocs.delete(viewId);
    }
    sendAdHoc(viewId, message) {
        if (this.adhocs.has(viewId)) {
            this.adhocs.get(viewId)?.postMessage(message);
        }
    }
    createChannel() {
        if (!this.channels.has(channelName)) {
            const channel = new BroadcastChannel(channelName);
            channel.onmessage = (message) => {
                this._dispatch(message.data);
            };
            this.channels.set(channelName, { channel, listeners: new Map() });
        }
    }
    removeChannel() {
        if (this.channels.has(channelName)) {
            const channel = this.channels.get(channelName).channel;
            channel.close();
            this.channels.delete(channelName);
        }
    }
    _dispatch(message) {
        if (this.channels.has(channelName)) {
            const listenerGroup = this.channels.get(channelName).listeners;
            if (listenerGroup.has(message.type)) {
                const listeners = listenerGroup.get(message.type);
                if (listeners) {
                    for (let listener of listeners) {
                        listener.call(this, message);
                    }
                }
            }
        }
    }
    listen(type, callback) {
        if (this.channels.has(channelName)) {
            const listenerGroup = this.channels.get(channelName).listeners;
            if (!listenerGroup.has(type)) {
                listenerGroup.set(type, []);
            }
            const listeners = listenerGroup.get(type);
            listeners.push(callback);
        }
    }
    unlisten(type, callback) {
        if (this.channels.has(channelName)) {
            const listenerGroup = this.channels.get(channelName).listeners;
            if (listenerGroup.has(type)) {
                const listeners = listenerGroup.get(type);
                if (listeners.includes(callback)) {
                    listeners.splice(listeners.indexOf(callback), 1);
                }
            }
        }
    }
    broadcast(message, alsoAdHoc = false) {
        for (const { channel } of this.channels.values()) {
            channel.postMessage(message);
        }
        if (alsoAdHoc) {
            for (const adhoc of this.adhocs.values()) {
                adhoc.postMessage(message);
            }
        }
    }
}
export default MessageBus;
