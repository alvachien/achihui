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

type JasmineAnd = {
  returnValue: (val: any) => void;
  callFake: (fn: (...args: any[]) => any) => void;
  callThrough: () => void;
  throwError: (msg: string) => void;
};

type JasmineSpy<T> = ReturnType<typeof vi.fn<T extends (...args: any) => any ? T : never>> & {
  and: JasmineAnd;
};

export function createSpyObj<T extends string>(
  name: string,
  methodNames: T[],
): Record<T, JasmineSpy<any>> & { _name: string } {
  const obj: any = { _name: name };
  for (const methodName of methodNames) {
    const spy: JasmineSpy<any> = vi.fn() as any;
    // Add `.and` compatibility layer matching Jasmine's API
    spy.and = {
      returnValue: (val: any) => spy.mockReturnValue(val),
      callFake: (fn: (...args: any[]) => any) => spy.mockImplementation(fn),
      callThrough: () => {
        /* no-op */
      },
      throwError: (msg: string) =>
        spy.mockImplementation(() => {
          throw new Error(msg);
        }),
    };
    obj[methodName] = spy;
  }
  return obj as Record<T, JasmineSpy<any>> & { _name: string };
}
