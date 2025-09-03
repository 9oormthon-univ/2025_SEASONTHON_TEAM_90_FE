/** 카테고리명에 따른 색상 */
export function barColorByName(name: string): string {
    if (name.includes("건강")) return "#5BC45B";
    if (name.includes("공부")) return "#58A4F5";
    if (name.includes("문화")) return "#B972D7";
    return "#222";
}
