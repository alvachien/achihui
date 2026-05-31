import { vi } from 'vitest';

/**
 * Mimics jasmine.createSpyObj for Vitest compatibility.
 * Creates an object with spy methods for each method name.
 *
 * Usage (mimics Jasmine's createSpyObj):
 *   const spy = createSpyObj('Router', ['navigate', 'navigateByUrl']);
 *   spy.navigate.and.returnValue(Promise.resolve(true));
 *   spy.navigate.and.callFake((url: string) => { ... });
 *   spy.navigate.and.throwError('some error');
 *
 * @param name Display name (for debugging)
 * @param methodNames Array of method names to create as spies
 * @returns Object with spy methods
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function createSpyObj<T extends string>(
  name: string,
  methodNames: T[]
): Record<T, ReturnType<typeof vi.fn>> & { _name: string } {
  const obj: any = { _name: name };
  for (const methodName of methodNames) {
    const spy = vi.fn();
    // Add `.and` compatibility layer matching Jasmine's API
    (spy as any).and = {
      returnValue: (val: any) => spy.mockReturnValue(val),
      callFake: (fn: (...args: any[]) => any) => spy.mockImplementation(fn),
      callThrough: () => spy,
      throwError: (msg: string) =>
        spy.mockImplementation(() => {
          throw new Error(msg);
        }),
    };
    obj[methodName] = spy;
  }
  return obj as Record<T, ReturnType<typeof vi.fn>> & { _name: string };
}
