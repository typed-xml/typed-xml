import "./processingInstruction";

import { ParseContext } from "../context";
import { XmlStreamReader } from "../reader";
import { Node } from "./node";

export class DoctypeNode extends Node {
  static async parse(reader: XmlStreamReader, _context: ParseContext): Promise<DoctypeNode> {
    const { doctype } = await reader.readKind("doctype");

    return new DoctypeNode(doctype);
  }

  constructor(protected doctype: string) { super() }

  setDoctype(doctype: string) { this.doctype = doctype }
  getDoctype() { return this.doctype }

  toString() { return `<!DOCTYPE ${this.getDoctype()}>` }
}
