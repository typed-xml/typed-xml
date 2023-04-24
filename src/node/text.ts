import "./element/default";

import { ParseContext } from "../context";
import { XmlStreamReader } from "../reader/xmlStreamReader";
import { Node } from "./node";

export class TextNode extends Node {
  static async parse(reader: XmlStreamReader, _context: ParseContext): Promise<TextNode> {
    const { text } = await reader.readKind("text");

    return new TextNode(text);
  }

  constructor(protected text: string) { super() }

  setContents(text: string) { this.text = text }
  getContents() { return this.text }

  toString() { return this.getContents() }
}
