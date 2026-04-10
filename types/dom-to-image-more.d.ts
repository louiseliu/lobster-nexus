declare module "dom-to-image-more" {
  interface Options {
    width?: number;
    height?: number;
    quality?: number;
    style?: Partial<CSSStyleDeclaration>;
    bgcolor?: string;
    filter?: (node: Node) => boolean;
    cacheBust?: boolean;
  }

  function toPng(node: HTMLElement, options?: Options): Promise<string>;
  function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  function toPixelData(node: HTMLElement, options?: Options): Promise<Uint8Array>;

  export default { toPng, toJpeg, toBlob, toSvg, toPixelData };
}
