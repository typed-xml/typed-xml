import { Node } from "../node";
import { FormattingConfig, ManagedElement } from "./managed";

export class FragmentElement extends ManagedElement {
  constructor(
    private children: Node[],
    public parent?: ManagedElement,
  ) {
    super();
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
