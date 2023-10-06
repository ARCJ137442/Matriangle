import Player from "../../../../../server/mods/native/entities/player/Player";
import { IBatrShape } from '../../../../api/BatrDisplayInterfaces';
import IPlayer from "../../../../../server/mods/native/entities/player/IPlayer";

/**
 * 一个与玩家显示高度绑定的「玩家悬浮指示器」（简称「玩家GUI」）
 * * 跟随玩家显示
 * * 展示玩家的各类信息：位置、名称、生命值、冷却、充能……
 */
export default interface IPlayerGUI extends IBatrShape {
	//============Constructor & Destructor============//
	/** 构造函数：获取一个玩家的链接 */
	new(owner: IPlayer): void;

	/** 析构函数 */
	destructor(): void;

	/** 获取「所属玩家」（可能是空引用，因为要被释放） */ // ? 可空性存疑
	get owner(): IPlayer | null;

	/** 从「显示坐标」获取自身「逻辑坐标」 */ // ? 是否其实只是一个「单向过程」？
	get logicalX(): number;
	/** 从「显示坐标」获取自身「逻辑坐标」 */ // ? 是否其实只是一个「单向过程」？
	get logicalY(): number;
	/** 以「逻辑坐标」设置自身「显示坐标」 */ // ? 是否其实只是一个「单向过程」？
	set logicalX(value: number);
	/** 以「逻辑坐标」设置自身「显示坐标」 */ // ? 是否其实只是一个「单向过程」？
	set logicalY(value: number);

	/** 获取冷却栏可见性 */
	getVisibleCD(): boolean;
	/** 获取充能栏可见性 */
	getVisibleCharge(): boolean;
	/** 获取经验栏可见性 */
	getVisibleExperience(): boolean;

	//============Instance Functions============//
	/** 更新（所有信息的显示、自身位置） */
	update(): void;
	/** 更新（仅信息，非位置） */
	updateInformation(): void;
	/** 更新位置 */
	updatePosition(): void;
	/** 更新「名称栏」（玩家名称） */
	updateName(): void;
	/** 更新队伍（玩家颜色&「指示三角」） */
	updateTeam(): void;
	/** 更新「生命栏」 */
	updateHP(): void;
	/** 更新「充能栏」（+是否触发「下栏排序」） */
	updateCharge(sort?: boolean): void;
	/** 更新「冷却栏」（+是否触发「下栏排序」） */
	updateCD(sort?: boolean): void;
	/** 更新「经验栏」（+是否触发「上栏排序」） */
	updateExperience(sort?: boolean): void;

}
