/**
 * 用于统一控制玩家行为
 * TODO: 完善具体逻辑
 */
export default abstract class PlayerController {

    /**
     * 构造函数
     */
    public constructor() {

    }

    /**
     * 设置「是否『正在使用（工具）』」
     * * 机制：松开使用键⇒充能中断（附带显示更新）
     */
    public abstract set isUsing(turn: boolean);
    // TODO: 【2023-09-28 21:04:02】与「键盘控制器」需要协调代码
}