import { Node } from "../node";
import { FormattingConfig, ManagedElement } from "./managed";

export class FragmentElement extends ManagedElement {
  private children: Node[];
  constructor(
    children: Node | Node[],
    public parent?: ManagedElement,
  ) {
    super();

    this.children = Array.isArray(children) ? children : [ children ];
  }

  toString(config?: Partial<FormattingConfig>, depth: number = 0) {
    return this.children.map(child => {
      return child instanceof ManagedElement ? child.toString(config, depth) : child.toString();
    }).join(config?.addNewlines ? "\n" : "");
  }

  getChildren() {
    return this.children;
  }

  getParent() {
    return this.parent;
  }

  render(): FragmentElement {
    return this;
  }
}
