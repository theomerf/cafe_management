const colors: Map<string, string> = new Map([
    ["bg-red-500", "bg-red-600"],
    ["bg-blue-500", "bg-blue-600"],
    ["bg-green-500", "bg-green-600"],
    ["bg-yellow-500", "bg-yellow-600"],
    ["bg-pink-500", "bg-pink-600"],
    ["bg-purple-500", "bg-purple-600"],
    ["bg-orange-500", "bg-orange-600"],
    ["bg-cyan-500", "bg-cyan-600"],
]);

export default function useRandomColor(id: number): [string, string] {
    const colorKeys = Array.from(colors.keys());
    const colorKey = colorKeys[id % colorKeys.length];

    const colorValues = Array.from(colors.values());
    const colorValue = colorValues[id % colorValues.length];
    return [colorKey, colorValue];
}