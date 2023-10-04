import TypeCommon from "../../../game/api/template/TypeCommon";


export function getDefaultI18n(key: string): string {
    let type: TypeCommon;
    // Block Type
    for (let type of BlockType._NORMAL_BLOCKS) {
        if (type === null)
            continue;
        if (key == I18nKey.getTypeNameKey(type))
            return type.name;
    }
    // Entity Type
    for (let type of EntityType._ALL_ENTITY) {
        if (type === null)
            continue;
        if (key == I18nKey.getTypeNameKey(type))
            return type.name;
    }
    // Effect Type
    for (let type of EffectType._ALL_EFFECT) {
        if (type === null)
            continue;
        if (key == I18nKey.getTypeNameKey(type))
            return type.name;
    }
    // Tool Type
    for (let type of Tool._ALL_TOOL) {
        if (type === null)
            continue;
        if (key == I18nKey.getTypeNameKey(type))
            return type.name;
    }
    // Bonus Type
    for (let type of BonusType._ALL_TYPE) {
        if (type === null)
            continue;
        if (key == I18nKey.getTypeNameKey(type))
            return type.name;
    }
    // Else
    return I18nKey.NULL;
}
