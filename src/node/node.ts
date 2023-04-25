import { ConstructionFailure, LocationContext, ParseContext } from "../context";
import { XmlStreamReader } from "../reader/xmlStreamReader";
import { CDataNode } from "./cdata";
import { CommentNode } from "./comment";
import { DoctypeNode } from "./doctype";
import { DefaultElement, FragmentElement, ManagedElement } from "./element";
import { ProcessingInstructionNode } from "./processingInstruction";
import { TextNode } from "./text";

export abstract class Node {
  static async parse(reader: XmlStreamReader, context: ParseContext): Promise<Node | typeof ConstructionFailure> {
    const next = await reader.peek();

    if (next.kind === "openCData")
      return CDataNode.parse(reader, context);

    if (next.kind === "comment")
      return CommentNode.parse(reader, context);

    if (next.kind === "doctype")
      return DoctypeNode.parse(reader, context);

    if (next.kind === "processingInstruction")
      return ProcessingInstructionNode.parse(reader, context);

    if (next.kind === "tag")
      return ManagedElement.parse(reader, context);

    if (next.kind === "text")
      return TextNode.parse(reader, context);

    throw new Error(`Unexpected node kind ${next.kind}`);
  }

  constructor(
    public readonly position?: LocationContext<unknown>,
  ) {}

  public parentContainer: FragmentElement | DefaultElement | undefined;

  getParent(): ManagedElement | undefined {
    return this.parentContainer instanceof DefaultElement ? this.parentContainer : this.parentContainer?.getParent();
  }

  getSiblings() {
    return this.parentContainer?.getChildren();
  }

  getIndex() {
    return this.getSiblings()?.indexOf(this);
  }

  getSibling(offset: number) {
    const siblings = this.getSiblings();

    if (siblings === undefined) return undefined;

    return siblings[this.getIndex()! + offset];
  }

  nextSibling() {
    return this.getSibling(1)
  }

  prevSibling() {
    return this.getSibling(-1)
  }

  extractRange(offset: number, count: number) {
    const siblings = this.getSiblings();

    if (siblings === undefined) return undefined;

    return siblings.splice(this.getIndex()! + offset, 1);
  }

  extractNextRange(count: number) {
    return this.extractRange(1, count)
  }

  extractPrevRange(count: number) {
    return this.extractRange(-1, count)
  }

  extractSingle(offset: number) {
    return this.extractRange(offset, 1)?.at(0);
  }

  extract() {
    return this.extractSingle(0)
  }

  extractNext() {
    return this.extractSingle(1)
  }

  extractPrev() {
    return this.extractSingle(-1)
  }

  insertRange(offset: number, nodes: Node[]) {
    const siblings = this.getSiblings();

    if (siblings === undefined) return undefined;

    for (let node of nodes) {
      node.parentContainer = this.parentContainer;
    }

    siblings.splice(this.getIndex()! + 1 + offset, 0, ...nodes);
  }

  appendRange(offset: number, nodes: Node[]) {
    this.insertRange(1, nodes);
  }

  prependRange(offset: number, nodes: Node[]) {
    this.insertRange(0, nodes);
  }

  insertSingle(offset: number, node: Node) {
    this.insertRange(offset, [node]);
  }

  append(node: Node) {
    this.insertSingle(1, node);
  }

  prepend(node: Node) {
    this.insertSingle(0, node);
  }

  abstract toString(): string;
}
