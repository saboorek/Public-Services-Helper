export function toChannelSafeName(name: string): string {
    return name
        .toLowerCase()
        .replace(/ł/g, 'l').replace(/ż/g, 'z')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 50);
}