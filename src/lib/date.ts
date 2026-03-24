export const getMonthRange = (input: Date) => {
  const start = new Date(input.getFullYear(), input.getMonth(), 1);
  const end = new Date(input.getFullYear(), input.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};
