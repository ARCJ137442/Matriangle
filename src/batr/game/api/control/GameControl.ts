/**
 * 游戏控制相关逻辑
 * * 游戏母体（、方块？）、实体等「事件分派者」（通过订阅）向其分派事件，作为其「感知」
 * * 其向「订阅了它的分派」的「事件接收者」分派事件，以进行「运动」
 * * 📌其本身适合作为一个「智能体」存在（或者像Matrix那样，人通过这个「玩家」连接到这个世界中）
 */

export type GameControllerLabel = string;
export type GameEventType = string;

/**
 * 事件接收器
 */
export interface IGameControlReceiver {

    /**
     * 接收事件
     * * 【2023-10-01 11:45:25】不设置单独的「事件」对象，是为了避免大量对象创建/回收的开销
     * * 【2023-10-01 13:38:47】现在是通过「任意长参数」避免实现时麻烦的「数组访问」
     * 
     * ? 【2023-10-01 11:47:04】目前分派事件的逻辑是「不论类型直接广播到所有订阅者」，但或许可以用一个字典进行「订阅者+订阅类型」的分派？
     * 
     * @param type 接收的事件类型
     * @param args 其它附加参数
     */
    onReceive(type: GameEventType, ...args: any[]): void;

}

/**
 * 「游戏控制器」：用于统一控制游戏
 * * 接收游戏分派的事件
 * * 向「订阅事件的对象」分派事件
 * 
 * 核心机制：
 * * 通过通用的「钩子函数」分派事件
 * * 维护一个「订阅者」列表，以通过「分派函数」对其分派事件
 * 
 * TODO: 完善具体逻辑
 */
export abstract class GameController {

    /**
     * 构造函数
     */
    public constructor(
        /**
         * 游戏控制器标签
         */
        public readonly label: GameControllerLabel,
        /**
         * 订阅者列表
         */
        public readonly subscribers: Array<IGameControlReceiver> = [],
    ) { }

    /**
     * 增加订阅者
     */
    public addSubscriber(subscriber: IGameControlReceiver): void {
        this.subscribers.push(subscriber);
    }

    /**
     * 移除订阅者
     * @returns 是否成功删除
     */
    public removeSubscriber(subscriber: IGameControlReceiver): boolean {
        for (let i = 0; i < this.subscribers.length; i++) {
            if (subscriber === this.subscribers[i]) {
                this.subscribers.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * 查询订阅者
     * @returns 接收者是否在其订阅之中
     */
    public hasSubscriber(subscriber: IGameControlReceiver): boolean {
        for (const subscriber2 of this.subscribers) {
            if (subscriber === subscriber2) return true;
        }
        return false;
    }

    /**
     * 分派事件
     * * 事件参数作为数组传入，但会被平铺到钩子函数中（作为「位置参数」以便于编写）
     */
    public dispatchEvent(event: GameEventType, args: any[]): void {
        for (const subscriber of this.subscribers) {
            subscriber.onReceive(event, ...args);
        }
    }
}
