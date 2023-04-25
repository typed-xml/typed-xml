import "./text"

import { ParseContext } from "../context";
import { XmlStreamReader } from "../reader/xmlStreamReader";
import { Node } from "./node";

export class ProcessingInstructionNode extends Node {
  static async parse(reader: XmlStreamReader, _context: ParseContext): Promise<ProcessingInstructionNode> {
    const { name, body } = await reader.readKind("processingInstruction");

    return new ProcessingInstructionNode(name, body);
  }

  constructor(protected name: string, protected body: string) { super() }

  setName(name: string) { this.name = name }
  getName() { return this.name }

  setBody(body: string) { this.body = body }
  getBody() { return this.body }

  toString() { return `<?${this.getName()} ${this.getBody()}>` }
}