import { ParseContext } from "../../context";
import { LocationContext } from "../../context/location";
import { XmlStreamReader } from "../../reader/xmlStreamReader";
import { Node } from "../node";
import { TextNode } from "../text";
import { DefaultElement } from "./default";
import { FragmentElement } from "./fragment";

export * from "./default";
export * from "./fragment";

export interface FormattingConfig {
  stripEmptyTextNodeChildren: boolean,
  indentDepth: number,
  tabSize: number,
  addNewlines: boolean,
  spaceBeforeSelfClosingTag: boolean,
}

export abstract class ManagedElement extends Node {
  ____ignored: any;

  static async parse(reader: XmlStreamReader, context: ParseContext): Promise<ManagedElement> {
    const open = await reader.readKind("tag");
    const constructor = context.getConstructor(open.name);

    if (open.isSelfClosing) {
      await reader.readKind("closeTag");

      if (!constructor)
        return DefaultElement.selfClosing(open.name, open.attributes);

      const instance = constructor(open.attributes, [], LocationContext.fromStream(reader));
      instance.isSelfClosing = true;
      return instance;
    }

    const children = new FragmentElement();

    while ((await reader.peek()).kind !== "closeTag")
      children.push(await Node.parse(reader, context));

    await reader.readKind("closeTag");

    const result = constructor ? constructor(open.attributes, children, LocationContext.fromStream(reader)) : new DefaultElement(open.name, open.attributes, children);

    children.forEach(child => {
      if (child instanceof ManagedElement)
        child.parent = result;
    });

    return result;
  }

  constructor() {
    super();

    Object.defineProperty(this, "____ignored", { enumerable: false, writable: false, value: undefined });
  }

  protected isSelfClosing = false;
  private parent: ManagedElement | undefined;

  getParent(): ManagedElement | undefined {
    return this.parent;
  }

  toString(config?: Partial<FormattingConfig>, depth: number = 0) {
    const des = this.render();
    const strs: string[] = [];

    for (const de of des) {
      if (!(de instanceof DefaultElement)) {
        strs.push(de.toString())
        continue;
      }

      if (de.isSelfClosing && de.getChildren().length !== 0)
        throw new Error(`Element is self-closing, but has children!`);

      let build = `${(" ").repeat((config?.indentDepth ?? 0) * depth)}<`;

      build += de.getName();

      for (const [key, value] of Object.entries(de.getAttributes())) {
        build += ` ${key}="${value}"`;
      }

      if (de.isSelfClosing) {
        build += config?.spaceBeforeSelfClosingTag ? " />" : "/>";

        if (config?.addNewlines)
          build += "\n";

        strs.push(build);

        continue;
      }

      build += ">"

      let children = de.getChildren();

      if (config?.stripEmptyTextNodeChildren)
        children = children.filter(c => c instanceof TextNode ? c.getContents().trim().length !== 0 : true);

      if (config?.addNewlines && !(children[0] instanceof TextNode))
        build += "\n"

      for (const child of children) {
        const indentString = (" ").repeat((config?.indentDepth ?? 0) * (depth + 1));

        if (child instanceof ManagedElement)
          build += child.toString(config, depth + 1);
        else if (child instanceof TextNode) {
          const [line0, ...rest] = child.toString().split("\n");

          build += line0
          build += rest.map(line => `${indentString}${(() => {
            const lineDepth = line.slice(0, line.length - line.trimStart().length).split("").map(v => v === "\t" ? config?.tabSize ?? 4 : 1).reduce((p, c) => p + c, 0);

            if (lineDepth >= (config?.indentDepth ?? 0) * (depth + 1))
              return " ".repeat(lineDepth - ((config?.indentDepth ?? 0) * (depth + 1))) + line.trimStart();

            return line.trimStart();
          })() }`).join("\n")
        } else {
          build += child.toString().split("\n").map(line => `${indentString}${(() => {
            const lineDepth = line.slice(0, line.length - line.trimStart().length).split("").map(v => v === "\t" ? config?.tabSize ?? 4 : 1).reduce((p, c) => p + c, 0);

            if (lineDepth >= (config?.indentDepth ?? 0) * (depth + 1))
              return " ".repeat(lineDepth - ((config?.indentDepth ?? 0) * (depth + 1))) + line.trimStart();

            return line.trimStart();
          })()}`).join("\n") + "\n"
        }
      }

      if (!(children.at(-1) instanceof TextNode))
        build += (" ").repeat((config?.indentDepth ?? 0) * depth);

      build += `</${de.getName()}>`

      if (config?.addNewlines)
        build += "\n"

      strs.push(build);
    }

    return strs.join("");
  }

  abstract render(): FragmentElement;
}
