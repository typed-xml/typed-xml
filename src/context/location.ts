import { XmlStreamReader, XmlSymbol } from "../reader";

export class LocationContext<T> {
  static fromStreamSymbol<T extends XmlStreamReader<any>>(stream: T, symbol: XmlSymbol): LocationContext<T extends XmlStreamReader<infer Tag> ? Tag : unknown> {
    return new LocationContext(
      stream.tag,
      symbol.location.line,
      symbol.location.column,
      symbol.location.position,
      stream.getSource(),
    )
  }

  constructor(
    public readonly tag: T,
    public readonly line: number,
    public readonly column: number,
    public readonly position: number,
    public readonly source: string,
  ) {}
}
