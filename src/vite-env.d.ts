/// <reference types="vite/client" />

declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: { scale?: number; useCORS?: boolean; logging?: boolean };
    jsPDF?: { unit?: string; format?: string; orientation?: string };
    pagebreak?: { mode?: string | string[] };
  }

  interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance;
    from(element: HTMLElement | string): Html2PdfInstance;
    save(): Promise<void>;
    outputPdf(type: 'bloburl' | 'blob' | 'datauristring'): Promise<string | Blob>;
    toPdf(): Html2PdfInstance;
    get(type: 'pdf'): Promise<{ output: (type: string) => string | Blob }>;
  }

  function html2pdf(): Html2PdfInstance;
  export default html2pdf;
}

declare module 'react-diff-viewer' {
  import { ReactNode, CSSProperties } from 'react';

  export interface ReactDiffViewerProps {
    oldValue: string;
    newValue: string;
    splitView?: boolean;
    showDiffOnly?: boolean;
    leftTitle?: ReactNode;
    rightTitle?: ReactNode;
    useDarkTheme?: boolean;
    styles?: Record<string, CSSProperties>;
  }

  export default function ReactDiffViewer(props: ReactDiffViewerProps): JSX.Element;
}

declare module 'react-json-view' {
  import { ComponentType } from 'react';

  interface ReactJsonViewProps {
    src: object;
    theme?: string;
    collapsed?: boolean | number;
    displayDataTypes?: boolean;
    enableClipboard?: boolean;
    name?: string | false;
    style?: React.CSSProperties;
  }

  const ReactJson: ComponentType<ReactJsonViewProps>;
  export default ReactJson;
}
