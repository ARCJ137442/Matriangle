// import batr.general.*;
// import batr.game.block.*;
// import batr.game.effect.*;
// import batr.game.entity.*;
// import batr.game.model.*;

import DefaultNativeI18ns from "../../../../config/lang";
import TypeCommon from "../../../game/api/template/TypeCommon";

export const EN_US = DefaultNativeI18ns.en_us; // English
export const ZH_HANS = DefaultNativeI18ns.zh_hans; // 简体中文

export function getDefaultI18n(key: string): string {
	let type: TypeCommon;
	// Block Type
	for (let type of BlockType._NORMAL_BLOCKS) {
		if (type == null)
			continue;
		if (key == I18nKey.getTypeNameKey(type))
			return type.name;
	}
	// Entity Type
	for (let type of EntityType._ALL_ENTITY) {
		if (type == null)
			continue;
		if (key == I18nKey.getTypeNameKey(type))
			return type.name;
	}
	// Effect Type
	for (let type of EffectType._ALL_EFFECT) {
		if (type == null)
			continue;
		if (key == I18nKey.getTypeNameKey(type))
			return type.name;
	}
	// Tool Type
	for (let type of ToolType._ALL_TOOL) {
		if (type == null)
			continue;
		if (key == I18nKey.getTypeNameKey(type))
			return type.name;
	}
	// Bonus Type
	for (let type of BonusType._ALL_TYPE) {
		if (type == null)
			continue;
		if (key == I18nKey.getTypeNameKey(type))
			return type.name;
	}
	// Else
	return I18nKey.NULL;
}