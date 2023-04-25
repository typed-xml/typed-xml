import Emittery from "emittery";
import * as sax from "sax";
import { XmlSymbol, XmlUnlocatedSymbol } from "./symbol";

export class XmlStreamReader<T = unknown> extends Emittery<{
  error: Error,
}> {
  protected requestQueue: ({ consume: boolean, resolve: (symbol: XmlSymbol) => void, reject: (error: Error) => void })[] = [];
  protected symbolQueue: XmlSymbol[] = [];
  protected closed = false;
  protected source = "";

  constructor(strict: boolean = false, public tag?: T) {
    super();

    this.parser = sax.parser(strict, {
      trim: false,
      normalize: false,
      lowercase: true,
      xmlns: false,
      position: true,
      noscript: true,
    });

    this.parser.onerror = (e) => this.emit("error", e)
    this.parser.onsgmldeclaration = () => this.emit("error", new Error("SGML not supported"));

    this.parser.ontext = (text) => this.onSymbol({ kind: "text", text });
    this.parser.ondoctype = (doctype) => this.onSymbol({ kind: "doctype", doctype });
    this.parser.onprocessinginstruction = ({ name, body }) => this.onSymbol({ kind: "processingInstruction", name, body })
    this.parser.onopentag = (symbol) => {
      if ("ns" in symbol) {
        this.emit("error", new Error("QualifiedTags are not supported"));
        return;
      }

      this.onSymbol({ kind: "tag", ...symbol });
    }
    this.parser.onclosetag = (name) => this.onSymbol({ kind: "closeTag", name })
    this.parser.oncomment = (contents) => this.onSymbol({ kind: "comment", contents })
    this.parser.onopencdata = () => this.onSymbol({ kind: "openCData" });
    this.parser.onclosecdata = () => this.onSymbol({ kind: "closeCData" });
    this.parser.oncdata = (chunk) => this.onSymbol({ kind: "cData", chunk });

    this.parser.onend = () => this.onEnd();
  }

  protected readonly parser: sax.SAXParser;

  getSource() { return this.source }

  private onSymbol(symbol: XmlUnlocatedSymbol) {
    const request = this.requestQueue.shift();

    const locatedSymbol: XmlSymbol = { ...symbol, location: { line: this.parser.line, column: this.parser.column, position: this.parser.position } }

    if (request)
      request.resolve(locatedSymbol);

    if (request?.consume)
      return;

    this.symbolQueue.push(locatedSymbol);
  }

  private onEnd() {
    this.closed = true;

    for (const request of this.requestQueue) {
      request.reject(new Error("Stream closed."));
    }
  }

  read(): Promise<XmlSymbol> {
    if (this.closed)
      return Promise.reject(new Error("Stream closed."));

    if (this.symbolQueue.length > 0)
      return Promise.resolve(this.symbolQueue.shift()!);

    return new Promise<XmlSymbol>((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, consume: true });
    });
  }

  peek(): Promise<XmlSymbol> {
    if (this.closed)
      return Promise.reject(new Error("Stream closed."));

    if (this.symbolQueue.length > 0)
      return Promise.resolve(this.symbolQueue[0]!);

    return new Promise<XmlSymbol>((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, consume: false });
    });
  }

  async readKind<Kind extends XmlSymbol["kind"]>(kind: Kind): Promise<Extract<XmlSymbol, { kind: Kind }>> {
    const nextSymbol = await this.read();

    if (nextSymbol.kind !== kind)
      throw new Error(`Expected ${kind}, found ${nextSymbol.kind}`);

    return nextSymbol as Extract<XmlSymbol, { kind: Kind }>;
  }

  async readIf<Kind extends XmlSymbol["kind"]>(kind: Kind): Promise<Extract<XmlSymbol, { kind: Kind }> | undefined> {
    const nextSymbol = await this.peek();

    if (nextSymbol.kind !== kind)
      return undefined;

    return await this.read() as Extract<XmlSymbol, { kind: Kind }>;
  }

  write(chunk: string) {
    this.parser.write(chunk);
    this.source += chunk;
  }

  end() {
    this.parser.end();
  }
}
