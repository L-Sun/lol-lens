export async function measureTime<T>(callback: () => Promise<T>) {
  const prevTime = performance.now();
  const result = await callback();
  const costTime = performance.now() - prevTime;

  return [result, costTime] as const;
}
