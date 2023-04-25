import { Node } from "../node";
import { ManagedElement } from "./managed";

export class FragmentElement extends ManagedElement {
  constructor(
    private children: Node[],
    public parent?: ManagedElement,
  ) {
    super();
  }

  toString() {
    return this.children.join("");
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
