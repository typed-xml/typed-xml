import "./element/default";

import { ParseContext, LocationContext } from "../context";
import { XmlStreamReader } from "../reader";
import { Node } from "./node";
import { desanitize, sanitize } from "../util";

const escapeCharacters = {
  '&': "&amp;",
  '<': "&lt;",
  '>': "&gt;",
};

export class TextNode extends Node {
  static async parse(reader: XmlStreamReader, _context: ParseContext): Promise<TextNode> {
    const { text } = await reader.readKind("text");

    return new TextNode(desanitize(text, escapeCharacters), LocationContext.fromStream(reader));
  }

  constructor(protected text: string, position?: LocationContext<unknown>) { super(position) }

  setContents(text: string) { this.text = text }
  getContents() { return this.text }

  toString() { return sanitize(this.getContents(), escapeCharacters) }
}
