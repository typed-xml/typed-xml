import { ManagedElement } from ".";
import { ConstructorFn, ParseContext } from "../../context";
import { Node } from "../node";
import { FragmentElement } from "./fragment";

export class DefaultElement extends ManagedElement {
  static selfClosing(name: string, attributes: Record<string, string>) {
    const de = new DefaultElement(name, attributes, []);

    de.isSelfClosing = true;

    return de;
  }

  constructor(
    protected name: string,
    protected attributes: Record<string, string>,
    children: Node[],
  ) {
    super();

    this.children = new FragmentElement(...children);
  }

  protected children: FragmentElement;

  into<Constructor extends ConstructorFn>(constructor: Constructor): ReturnType<Constructor> {
    return constructor(this.attributes, this.children) as ReturnType<Constructor>;
  }

  parse(context: ParseContext) {
    const constructor = context.getConstructor(this.name.toLowerCase());

    if (!constructor)
      throw new Error(`No constructor for ${open.name} elements created.`)

    return this.into(constructor);
  }

  render() { return [ this ] }

  getName() { return this.name }
  getAttributes() { return this.attributes }
  getAttribute(attribute: string): string | undefined { return this.attributes[attribute] }
  setAttributes(attributes: Record<string, string>) { this.attributes = attributes }
  setAttribute(key: string, value: string) { this.attributes[key] = value }
  getChildren() { return this.children }
  getAttributeCount() { return Object.keys(this.attributes).length }
}
