/**
 * 定义了一些抽象的接口，用于在编写时生成专用代码
 * 
 * ! 这些接口只用于「编译时检查」与「在断言下简化算法实现」，无法直接用于「判定」与「辨识」
 * * 参见「TS编译到JS去掉所有接口代码」的特性
 * * 不过也有使用「强制要求固定常量」的解决方法
 * 
 */

import { fPoint, iPoint, xPoint } from "../../../common/geometricTools";
import { IBatrDisplayable, IBatrDisplayableContainer } from "../../../display/api/DisplayInterfaces";
import { uint } from "../../../legacy/AS3Legacy";
import IMatrix from "../../main/IMatrix";
import { mRot } from "../../general/GlobalRot";
import { CommonIO_IR } from "../io/CommonIO";
import Entity from "./Entity";

/**
 * 「有坐标实体」是
 * * 具有坐标的
 * 实体
 * 
 * ! 使用了TS「接口继承类」的思想，强制要求实现者「继承实体基类，或至少实现其所有方法」
 * 
 * 典例：
 * * 格点实体
 * * 非格点实体
 */
export interface IEntityHasPosition<P extends xPoint<any> = xPoint<any>> extends Entity {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_hasPosition: true; // !【2023-10-09 00:06:53】暂时不要求，以免大范围重构

    // ! 【20230915 15:50:04】现在因「强制公开」的原因，不强制内部变量了
    /** 获取实体的坐标（引用） */
    get position(): P;
    /**
     * 设置实体的坐标（引用）
     * * 作为统一的「设置坐标」入口
     * * 用于在设置坐标前后更新
     * 
     * !【2023-10-05 22:02:36】鉴于「需要`host`」问题，不再强制要求
     */
    // set position(value: P);
}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_hasPosition(e: Entity): e is IEntityHasPosition {
    return (e as IEntityHasPosition)?.position !== undefined;
}

/**
 * 「格点实体」是
 * * 对坐标要求只需精确到整数的
 * * 与地图坐标体系相同，坐标判断等同于「地图方块」的
 * * 在与地图方块互动时无需对地图坐标做“特殊对齐操作”的
 * 实体
 * 
 * ! 使用了TS「接口继承类」的思想，强制要求实现者「继承实体基类，或至少实现其所有方法」
 * 
 * 典例：
 * * 玩家
 * * 奖励箱
 */
export interface IEntityInGrid extends IEntityHasPosition<iPoint> {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_inGrid: true;

    // ! 【20230915 15:50:04】现在因「强制公开」的原因，不强制内部变量了
    /** 获取实体的整数坐标（引用） */
    get position(): iPoint;
    /**
     * 设置实体的整数坐标（引用）
     * * 作为统一的「设置坐标」入口
     * * 用于在设置坐标前后更新
     * 
     * !【2023-10-05 22:02:36】鉴于「需要`host`」问题，不再强制要求
     */
    // set position(value: iPoint);

    /**
     * 当「所处位置方块更新」时调用
     * * 应用：玩家的「窒息伤害/陷阱伤害/随机旋转」，奖励箱的「窒息消失」
     * 
     * @param host 调用它的母体
     */
    onPositedBlockUpdate(host: IMatrix, ...args: unknown[]): void;
}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_inGrid(e: Entity): e is IEntityInGrid {
    return (e as IEntityInGrid)?.onPositedBlockUpdate !== undefined;
}

/**
 * 「非格点实体」是
 * * 对坐标存储需要浮点数精度的
 * * 需要与方块坐标进行“特意对齐”的
 * 实体
 * 
 * 典例：
 * * 抛射体
 */
export interface IEntityOutGrid extends IEntityHasPosition<fPoint> {

    // !【2023-10-09 21:35:53】现在因为「难以和『格点实体』区分」而重新启用该值
    readonly i_outGrid: Exclude<unknown, undefined>; // 使用`Exclude`断言「不是undefined」

    // ! 【20230915 15:50:04】现在因「强制公开」的原因，不强制内部变量了
    /** 获取实体的浮点坐标（引用） */
    get position(): fPoint;
    /**
     * 设置实体的浮点坐标（引用）
     * !【2023-10-05 22:02:36】鉴于「需要`host`」问题，不再强制要求
     */
    // set position(value: fPoint);

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_outGrid(e: Entity): e is IEntityOutGrid {
    return (e as IEntityOutGrid)?.i_outGrid !== undefined;
}

/**
 * 「有方向实体」是
 * * 有「任意维整数角」方向的
 * * 需要在机制（或许也有显示）上区分的
 * 实体
 * 
 * ! 至于「有无『用浮点数表示的方向』」，暂未开展研究
 * 
 * 典例：
 * * 玩家
 * * 抛射体
 */
export interface IEntityWithDirection extends Entity {
    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_hasDirection: true;

    get direction(): mRot;
    set direction(value: mRot);
}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_hasDirection(e: Entity): e is IEntityWithDirection {
    return (e as IEntityWithDirection)?.direction !== undefined;
}

/**
 * 「可显示实体」是
 * * 有需要被「显示端」实现的
 * * 会影响世界呈现的
 * 实体
 * 
 * 典例：
 * * 几乎一切原生实体
 */
export interface IEntityDisplayable extends Entity, IBatrDisplayable { }

/**
 * 「容器可显示实体」是
 * * 需要使用「图形容器」而非一般「图形」的
 * 可显示实体
 * 
 * 典例：
 * * 特效/重生
 * * 特效/传送
 */
export interface IEntityDisplayableContainer extends Entity, IBatrDisplayableContainer { }

/**
 * 「活跃实体」是指
 * * 每世界刻都会被触发钩子的
 * * 影响世界逻辑的
 * * 有必要进行一定性能考量的
 * 实体
 * 
 * 典例：
 * * 玩家
 * * 冲击波子机
 * * 抛射体
 */
export interface IEntityActive extends Entity {

    /**
     * !【2023-10-09 21:35:53】现在因为「难以和『轻量级活跃实体』区分」而重新启用该值
     */
    readonly i_active: Exclude<unknown, undefined>;

    /**
     * 响应世界刻
     * 
     * 在世界调用事件循环时，随之调用以处理其世界逻辑
     * 
     * * 不用担心「循环导入」问题：TS的接口在编译后会被删除，对编译后的执行毫无影响
     * 
     * @param host 调用它的母体
     */
    onTick(host: IMatrix): void;

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_active(e: Entity): e is IEntityActive {
    return (e as IEntityActive)?.i_active !== undefined;
}

/**
 * 「轻量级活跃实体」是指
 * * 每世界刻都会被触发钩子的
 * * **不**影响世界逻辑的
 * * 有必要进行一定性能考量的
 * 实体
 * 
 * 典例：
 * * 所有特效
 */
export interface IEntityActiveLite extends Entity {

    // !【2023-10-09 21:35:53】现在因为「难以和『活跃实体』区分」而重新启用该值
    readonly i_activeLite: Exclude<unknown, undefined>; // 排除undefined即可

    /**
     * 响应世界刻
     * 
     * 在世界调用事件循环时，随之调用以处理其自身逻辑
     * * 与先前「活跃实体」不同：不涉及母体，因此无需操作世界逻辑
     * * 只需要一个「自删除回调函数」，而无需传入整个世界对象
     * 
     * @param remove 调用`remove(this)`即可通知母体删除自身
     */
    onTick(remove: (entity: Entity) => void): void;

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_activeLite(e: Entity): e is IEntityActiveLite {
    return (e as IEntityActiveLite)?.i_activeLite !== undefined;
}

/**
 * 「需IO实体」是
 * * 接受并响应世界IO操作（键盘等）的
 * 实体
 * 
 * ! 【20230915 0:02:18】「AI玩家」的「AI逻辑」将由AI作为「活跃实体」的`onTick`世界刻调用
 * 
 * ? 【2023-09-23 10:49:35】目前认为，不再需要这类标识：外界IO将自行缓冲在实体内部，等待实体自行处理
 * 
 * 典例：
 * * 玩家
 */
export interface IEntityNeedsIO extends Entity {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_needsIO: true;

    /**
     * 响应世界IO
     * 
     * 世界IO操作（键盘等）会触发此方法
     * 
     * * 不用担心「循环导入」问题：TS的接口在编译后会被删除，对编译后的执行毫无影响
     * 
     * @param host 调用它的母体
     */
    onIO(host: IMatrix, inf: CommonIO_IR): void;

    /**
     * 获取实体的IO缓冲区
     * * 逻辑：当世界调用实体时，可以从中得到目前缓存的IO信息
     * * 应用：在世界逻辑中获取并在「主体侧」执行玩家动作（如移动、使用等）
     */
    get IOBuffer(): CommonIO_IR[];

    /**
     * 清除实体的IO缓冲区
     * * 如名
     */
    clearIOBuffer(): void;

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_needsIO(e: Entity): e is IEntityNeedsIO {
    return (e as IEntityNeedsIO)?.onIO !== undefined;
}

/**
 * 「短周期实体」是
 * * 生命周期相对短的（生成到消耗的时间很短）
 * * 删除不会对世界运行造成太显著影响的
 * * 可能会被世界专门存储以便（在空间访问上）优化的
 * 实体
 * 
 * 典例：
 * * 抛射体
 */
export interface IEntityShortLived extends Entity {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    readonly i_shortLive: true;

    // ? 暂时没想好有什么要「特别支持」的方法，因为这本身与「特效」不完全相同
}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_shortLive(e: Entity): e is IEntityShortLived {
    return (e as IEntityShortLived)?.i_shortLive !== undefined;
}

/**
 * 「定周期实体」是
 * * 生命周期相对固定的（生成到消失的时间固定）
 * * 一般需要根据「存活总时长」与「剩余存活时长」的比值「存活百分比」进行更新的
 * 实体
 * 
 * ! 一般以「世界刻数」为时间计量单位（这样可以不涉及浮点运算）
 * 
 * 典例：
 * * 特效
 */
export interface IEntityFixedLived extends Entity {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_fixedLive: true;

    /**
     * 「存活总时长」
     * * 一般是个固定值（或会被实现为只读属性）
     */
    get LIFE(): uint

    /**
     * 「剩余存活时长」
     */
    get life(): uint

    /**
     * [0,1]的存活百分比
     */
    get lifePercent(): number;

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_fixedLive(e: Entity): e is IEntityFixedLived {
    return (e as IEntityFixedLived)?.LIFE !== undefined;
}

// !【2023-10-08 18:06:20】现已删除「具统计实体」的声明，因为这与「玩家」高度绑定

/**
 * 「有生命实体」是
 * * 拥有「生命值」「最大生命值」等（正整数）值的
 * * 对外封装方法的
 * 实体
 * 
 * ! 目前不对外要求「直接设置生命值」的选项，亦即`HP`的setter
 * * 留给相应的「回血」「伤害」等方法自行设置
 */
export interface IEntityHasHP extends Entity {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_hasHP: true;

    /**
     * 当前生命值
     * * 英文来源："Health Point"
     * * 取值范围：0 < HP < maxHP
     * 
     * ! 其不能超过「最大生命值」
     * ! 协议：该值被修改时，不能超过最大生命值
     * 
     */
    get HP(): uint;
    set HP(value: uint);

    /**
     * 当前最大生命值
     * 
     * ! 协议：在该值被修改时，若低于当前生命值，需要进行一定的限制
     */
    get maxHP(): uint;
    set maxHP(value: uint);

    /**
     * （衍生）判断「生命值是否为满」
     * * 应用：判断「是否要从『储备生命值』里回血」
     */
    get isFullHP(): boolean

    /**
     * （衍生）判断「生命值是否为空」
     * * 应用：判断玩家「是否已死亡」
     */
    get isEmptyHP(): boolean;

    /**
     * （衍生）生命值百分比
     * * 算法：生命值 / 最大生命值
     */
    get HPPercent(): number;

    /**
     * 增加生命值
     * * 可能会因此调用一些钩子函数
     * * 现在可能要跟母体关联。。。
     * 
     * @param host 母体
     * @param value 增加的生命值
     * @param healer 增加生命值者（治疗者）
     */
    addHP(host: IMatrix, value: uint, healer: Entity | null): void

    /**
     * 减少生命值
     * * 可能会因此调用一些钩子函数
     * 
     * @param value 减少的生命值
     * @param attacker 减少生命值者（攻击者）
     */
    removeHP(host: IMatrix, value: uint, attacker: Entity | null): void

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_hasHP(e: Entity): e is IEntityHasHP {
    return (e as IEntityHasHP)?.addHP !== undefined;
}

/**
 * 「有储备生命值实体」是
 * * 有一个「储备生命值」的
 *   * 可以在「生命值未满」时（以一定速度）补充到生命值中
 * 有生命实体
 */
export interface IEntityHasHPAndHeal extends IEntityHasHP {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_hasHPAndHeal: true;

    /** 
     * 「额外备用生命」
     * * 会在生命值不足时，按一定周期自动补充进生命值中
     */
    get heal(): uint;
    set heal(value: uint);

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_hasHPAndHeal(e: Entity): e is IEntityHasHPAndHeal {
    return (e as IEntityHasHPAndHeal)?.heal !== undefined;
}

/**
 * 「可重生实体」是
 * * 有自然数个数的「剩余生命数」的
 * * 在死亡后可以通过「重生」恢复生命值并「重新进入世界主场」的
 * 有生命实体
 */
export interface IEntityHasHPAndLives extends IEntityHasHP {

    // !【2023-10-09 21:35:53】现在因为使用「类型断言」和「检查变量是否!==undefined」，不再需要一个「固定的目标值」
    // readonly i_hasHPAndLives: true;

    /**
     * 剩余生命数
     * * 范围：自然数
     * 
     * * 机制：在>0时实体有「重生」的机会，而在<=0时实体可能被（彻底）删除
     */
    get lives(): uint;
    set lives(value: uint);

    /**
     * 实体的「剩余生命数」是否会随「死亡」而减少
     * * 等价于「是否生命数无限」
     * * 推荐用一个单独的布尔值实现
     */
    get lifeNotDecay(): boolean;
    set lifeNotDecay(value: boolean);

    /**
     * （如果有重生间隔的话）实体是否「正在重生」
     */
    get isRespawning(): boolean;

    /**
     * 判断实体是否「生命彻底终止」
     * * 标准：生命值为空 && 剩余生命数===0
     */
    get isNoLives(): boolean;

}

/**
 * 使用「接口定义的变量是否有定义」快速获取「是否实现了接口」
 */
export function i_hasHPAndLives(e: Entity): e is IEntityHasHPAndLives {
    return (e as IEntityHasHPAndLives)?.lifeNotDecay !== undefined;
}
