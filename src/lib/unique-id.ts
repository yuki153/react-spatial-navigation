
let incrementNum = 0;

export const issueUniqueId = (prefix: string) => {
    return `${prefix}-${incrementNum++}`;
}
