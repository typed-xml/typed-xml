import "./doctype";

import { LocationContext, ParseContext } from "../context";
import { XmlStreamReader } from "../reader/xmlStreamReader";
import { Node } from "./node";

export class CommentNode extends Node {
  static async parse(reader: XmlStreamReader, _context: ParseContext): Promise<CommentNode> {
    const { contents } = await reader.readKind("comment");

    return new CommentNode(contents, LocationContext.fromStream(reader));
  }

  constructor(protected text: string, location: LocationContext<unknown>) { super(location) }

  setContents(text: string) { this.text = text }
  getContents() { return this.text }

  toString() { return `<!--${this.getContents()}-->` }
}
