/**
 * 一个基于「订阅-分派」的「事件总线」
 * * 可轻可重
 */

// 接口 //
/** 事件类型：字符串 */
export type EventType = string;

export interface IEvent {
    get type(): EventType;
    get data(): any;
    // get timestamp(): number;
}

// export type Event = IEvent; // 默认
/** 事件=事件类型：轻量级，无需其它附加参数（避免大量创建对象） */
export type Event = EventType;
// export type Event = EventType | IEvent; // 兼容模式

// export interface IEventDispatcher

export type eventCallback<eventT> = (data: eventT) => void;

/**
 * 事件总线
 * * 管理「事件发送者」的「事件分派」
 * * 管理「事件接收者」的「事件回调」
 * 
 * ? 这与Flash中的「可侦听对象」有何异同
 */
export interface IEventBus<eventT> {

    /**
     * 注册事件监听器
     * @param type 事件类型
     * @param listener 事件监听器
     */
    on(type: EventType, listener: eventCallback<eventT>): void;

    /**
     * 取消注册事件监听器
     * @param type 事件类型
     * @param listener 事件监听器
     */
    off(type: EventType, listener: eventCallback<eventT>): void;

    /**
     * 分派事件
     * @param type 事件类型
     * @param data 事件数据
     */
    emit(type: EventType, data: eventT): void;

}

// 实现 //

/**
 * 第一版实现
 * * 使用「类型⇒回调の集合」的形式实现分派
 */
export class EventBus_V1<eventT> implements IEventBus<eventT> {

    /**
     * 事件映射
     */
    protected _eventMap: Map<EventType, Set<eventCallback<eventT>>> = new Map<EventType, Set<eventCallback<eventT>>>();

    /**
     * 实现：集合新增
     * 
     * ! 若侦听器不同，会一并触发
     */
    public on(type: EventType, listener: eventCallback<eventT>): void {
        // 没有的时候才新增侦听器
        if (!this._eventMap.has(type))
            this._eventMap.set(type, new Set<eventCallback<eventT>>())
        // 确保是有集合的⇒去重留给自身
        this._eventMap.get(type)?.add(listener);
    }

    public off(type: EventType, listener: eventCallback<eventT>): void {
        // 直接使用集合的删除方法
        if (this._eventMap.has(type)) {
            this._eventMap.get(type)?.delete(listener);
        }
    }

    public emit(type: EventType, data: eventT): void {
        if (this._eventMap.has(type)) {
            // 使用`for-of`而非forEach，避免创建对象
            for (const listener of this._eventMap.get(type) as Set<eventCallback<eventT>>) {
                listener(data);
            }
        }
    }

}
