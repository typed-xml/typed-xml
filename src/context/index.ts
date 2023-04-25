import { ManagedElement } from "../node/element";
import type { Node } from "../node/node";
import { LocationContext } from "./location";

export * from "./location";

export const ConstructionFailure = Symbol("Construction Failure");
export type ConstructorFn = (attributes: Record<string, string>, children: Node[], ctx?: LocationContext<any>) => ManagedElement | typeof ConstructionFailure;

export type ElementClass = {
  name: string,
  new: ConstructorFn,
  prototype: any
} | {
  name: string,
  prototype: any,
  new(name: string, attributes: Record<string, string>, children: Node[]): ManagedElement,
}

export class ParseContext {
  protected readonly constructors: Map<string, ConstructorFn> = new Map;

  registerConstructor(klass: ElementClass): void {
    if ("new" in klass) {
      this.constructors.set(klass.name.toLowerCase(), klass.new);
      return;
    }

    //TODO FIX
    this.constructors.set(klass.name.toLowerCase(), (attributes, children, location) => {
      let v = new klass(klass.name, attributes, children);
      (v as any).position = location;
      return v;
    })
  }

  getConstructor(name: string): ConstructorFn | undefined {
    return this.constructors.get(name.toLowerCase());
  }
}
