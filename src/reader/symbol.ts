export type SymbolLocation = { start: number, end: number };

export type TextSymbol = {
  kind: "text",
  text: string,
}

export type DoctypeSymbol = {
  kind: "doctype",
  doctype: string,
}

export type ProcessingInstructionSymbol = {
  kind: "processingInstruction",
  name: string,
  body: string,
}

export type TagSymbol = {
  kind: "tag",
  name: string,
  attributes: Record<string, string>,
  isSelfClosing: boolean,
}

export type CloseTagSymbol = {
  kind: "closeTag",
  name: string,
}

export type CommentSymbol = {
  kind: "comment",
  contents: string,
}

export type OpenCData = {
  kind: "openCData",
}

export type CloseCData = {
  kind: "closeCData",
}

export type CData = {
  kind: "cData",
  chunk: string,
}

export type XmlUnlocatedSymbol = 
  | TextSymbol
  | DoctypeSymbol
  | ProcessingInstructionSymbol
  | TagSymbol
  | CloseTagSymbol
  | CommentSymbol
  | OpenCData
  | CloseCData
  | CData

export type XmlSymbol = { location: SymbolLocation } & XmlUnlocatedSymbol;
