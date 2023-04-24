import { ParseContext } from "../context";
import { XmlStreamReader } from "../reader/xmlStreamReader";
import { CDataNode } from "./cdata";
import { CommentNode } from "./comment";
import { DoctypeNode } from "./doctype";
import { ManagedElement } from "./element";
import { ProcessingInstructionNode } from "./processingInstruction";
import { TextNode } from "./text";

export abstract class Node {
  static async parse(reader: XmlStreamReader, context: ParseContext): Promise<Node> {
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

  abstract toString(): string;
}
