import { Node } from "../node";

export class FragmentElement extends Array<Node> {
  toString() {
    return this.join("");
  }
}
