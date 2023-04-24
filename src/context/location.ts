import { XmlStreamReader } from "../reader";

export class LocationContext<T> {
  static fromStream<T extends XmlStreamReader<any>>(stream: T): LocationContext<T extends XmlStreamReader<infer Tag> ? Tag : unknown> {
    return new LocationContext(
      stream.tag,
      stream.getLine(),
      stream.getColumn(),
      stream.getPosition(),
    )
  }

  constructor(
    public readonly tag: T,
    public readonly line: number,
    public readonly column: number,
    public readonly position: number,
  ) {}
}
