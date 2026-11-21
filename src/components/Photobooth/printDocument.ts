export interface PrintDocumentStrings {
  popupBlocked: string;
  printTitle: string;
}

/** Builds a print page that reuses one embedded PNG instead of one base64 copy per sheet. */
export const buildPrintDocument = (
  dataUrl: string,
  copies: number,
  strings: PrintDocumentStrings
): string => {
  const total = Math.min(20, Math.max(1, copies));
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${strings.printTitle}</title>
    <style>
      @page { size: auto; margin: 0mm; }
      body {
        margin: 0; padding: 10px; display: flex; flex-wrap: wrap;
        justify-content: center; align-items: center; gap: 10px;
        min-height: 100vh; background: #fff;
      }
      img { max-width: 95vw; max-height: 95vh; object-fit: contain; }
      @media print {
        body { padding: 0; gap: 0; }
        img { max-width: 100%; max-height: 100vh; }
      }
    </style>
  </head>
  <body>
    <script>
      const src = ${JSON.stringify(dataUrl)};
      const total=${total};
      let pending = total;
      let loaded = 0;
      const finish = () => { if (src.startsWith('blob:')) URL.revokeObjectURL(src); window.print(); window.close(); };
      for (let i = 0; i < total; i++) {
        const img = document.createElement('img');
        img.alt = 'poseclub studio photostrip';
        img.onload = () => { loaded++; if (--pending === 0) finish(); };
        img.onerror = () => { if (--pending === 0 && loaded > 0) finish(); };
        img.src = src;
        document.body.appendChild(img);
      }
    <\/script>
  </body>
</html>`;
};
