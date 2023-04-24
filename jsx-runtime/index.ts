import { ManagedElement, Node, TextNode } from "../src";
import { ElementClass } from "../src/context";
import { ElementClass as EC } from "../src/context";
import { DefaultElement } from "../src/node/element/default";
import { FragmentElement } from "../src/node/element/fragment";

export function jsxs(element: ElementClass | typeof Fragment, props: { children?: DefaultElement | string | number | boolean | (DefaultElement | string | number | boolean)[] } & { [key: string]: string }, key?: string) {
  return jsx(element, props, key)
}

export function jsx(element: ElementClass | typeof Fragment, props: { children?: DefaultElement | string | number | boolean | (DefaultElement | string | number | boolean)[] } & { [key: string]: string }, key?: string): FragmentElement {
  if (element === Fragment) {
    const children = props.children !== undefined ? Array.isArray(props.children) ? props.children : [ props.children ] : [];
    let els = new FragmentElement();

    for (const child of children) {
      if (child instanceof DefaultElement)
        els.push(child)
      else
        els.push(new TextNode(child.toString()));
    }

    return els;
  }

  const children = props.children ?? [];
  delete props.children;

  if (key)
    props.key = key;

  for (const key of Object.keys(props)) {
    if (props[key] === undefined)
      delete props[key];
  }

  let realChildren = new FragmentElement();

  if (!Array.isArray(children)) {
    if (children instanceof ManagedElement)
      realChildren.push(children);
    else
      realChildren.push(new TextNode(children.toString()))
  } else {
    for (const child of children) {
      if (child instanceof ManagedElement) {
        realChildren.push(child);
        continue;
      }

      realChildren.push(new TextNode(child.toString()));
    }
  }

  if (realChildren.length === 0) {
    return new FragmentElement(DefaultElement.selfClosing(element.name, props));
  }

  return new FragmentElement(new DefaultElement(element.name, props, realChildren));
}

export const Fragment = Symbol("Fragment");
