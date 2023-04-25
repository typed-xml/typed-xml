import { ConstructionFailure, ParseContext } from "../../context";
import { LocationContext } from "../../context/location";
import { XmlStreamReader } from "../../reader/xmlStreamReader";
import { Node } from "../node";
import { TextNode } from "../text";
import { DefaultElement } from "./default";
import { FragmentElement } from "./fragment";
import { desanitize, sanitize } from "../../util";

export interface FormattingConfig {
  stripEmptyTextNodeChildren: boolean,
  indentDepth: number,
  tabSize: number,
  addNewlines: boolean,
  spaceBeforeSelfClosingTag: boolean,
}

export abstract class ManagedElement extends Node {
  ____ignored: any;

  static async parse(reader: XmlStreamReader, context: ParseContext): Promise<ManagedElement | typeof ConstructionFailure> {
    const open = await reader.readKind("tag");
    const constructor = context.getConstructor(open.name);

    for (let [key, value] of Object.entries(open.attributes)) {
      open.attributes[key] = desanitize(value, {
        '"': "&quot;",
        "'": "&apos;",
        '<': "&lt;",
        '>': "&gt;",
        '&': "&amp;",
      });
    }

    if (open.isSelfClosing) {
      await reader.readKind("closeTag");

      if (!constructor)
        return DefaultElement.selfClosing(open.name, open.attributes);

      const instance = constructor(open.attributes, [], LocationContext.fromStream(reader));

      if (instance !== ConstructionFailure)
        instance.isSelfClosing = true;

      return instance;
    }

    const children: Node[] = [];

    while ((await reader.peek()).kind !== "closeTag") {
      const child = await Node.parse(reader, context);
      if (child !== ConstructionFailure)
        children.push(child);
    }

    await reader.readKind("closeTag");

    if (constructor) {
      const fragment = new FragmentElement(children);

      for (const child of children) {
        child.parentContainer = fragment;
      }

      const result = constructor(open.attributes, children, LocationContext.fromStream(reader));

      if (result !== ConstructionFailure)
        fragment.parent = result;

      return result;
    } else {
      const lc = LocationContext.fromStream(reader);

      const el = new DefaultElement(open.name, open.attributes, children);

      (el.position as any) = lc;

      return el;
    }
  }

  constructor() {
    super();

    Object.defineProperty(this, "____ignored", { enumerable: false, writable: false, value: undefined });
  }

  protected isSelfClosing = false;

  toString(config?: Partial<FormattingConfig>, depth: number = 0) {
    const des = this.render();
    const strs: string[] = [];

    for (const de of des.getChildren()) {
      if (!(de instanceof DefaultElement)) {
        strs.push(de.toString())
        continue;
      }

      if (de.isSelfClosing && de.getChildren().length !== 0)
        throw new Error(`Element is self-closing, but has children!`);

      let build = `${(" ").repeat((config?.indentDepth ?? 0) * depth)}<`;

      build += de.getName();

      for (let [key, value] of Object.entries(de.getAttributes())) {
        value = sanitize(value, {
          '&': "&amp;",
          '"': "&quot;",
          '<': "&lt;",
          '>': "&gt;",
        });

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
