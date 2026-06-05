import PDFParser from "pdf2json";

export async function extractPdfText(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", (err: any) => {
            reject(err.parserError);
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            const text = pdfData.Pages.map((page: any) =>
                page.Texts.map((t: any) => {
                    const raw = t.R.map((r: any) => r.T).join("");
                    try {
                        return decodeURIComponent(raw);
                    } catch {
                        return raw;
                    }
                }).join(" ")
            ).join("\n");
            resolve(text);
        });

        pdfParser.parseBuffer(buffer);
    });
}