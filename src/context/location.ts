import { XmlStreamReader, XmlSymbol } from "../reader";

export class LocationContext<T> {
  static fromStreamSymbol<T extends XmlStreamReader<any>>(stream: T, symbol: XmlSymbol): LocationContext<T extends XmlStreamReader<infer Tag> ? Tag : unknown> {
    return new LocationContext(
      stream.tag,
      symbol.location.start,
      symbol.location.end,
      stream.getSource(),
    )
  }

  constructor(
    public readonly tag: T,
    public readonly startPosition: number,
    public readonly endPosition: number,
    public readonly source: string,
  ) {}
}
