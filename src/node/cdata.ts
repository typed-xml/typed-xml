import "./comment";

import { ParseContext } from "../context";
import { XmlStreamReader } from "../reader/xmlStreamReader";
import { Node } from "./node";

export class CDataNode extends Node {
  static async parse(reader: XmlStreamReader, _context: ParseContext): Promise<CDataNode> {
    let text = "";

    await reader.readKind("openCData");

    while ((await reader.peek()).kind === "cData")
      text += (await reader.readKind("cData")).chunk;

    await reader.readKind("closeCData");

    return new CDataNode(text);
  }

  constructor(protected text: string) { super() }

  setContents(text: string) {
    const [self, ...others] = this.text.split("]]>");
    this.text = self;

    for (const other of others) {
      this.append(new CDataNode(other));
    }
  }
  getContents() { return this.text }

  toString() { return `<![CDATA[${this.getContents()}]]>` }
}
