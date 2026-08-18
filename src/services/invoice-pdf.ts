import jsPDF from "jspdf";
import "jspdf-autotable";
import logoAsset from "@/assets/Blogo_Green.png.asset.json";
import signatureAsset from "@/assets/ceo-signature.png.asset.json";

// Extend jsPDF with autotable types
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const downloadInvoicePDF = async (invoice: any) => {
  const doc = new jsPDF();
  const primaryColor = [56, 156, 132]; // #389c84

  // --- 1. Header with Logo ---
  try {
    const logoImg = new Image();
    logoImg.src = logoAsset.url;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
    });
    doc.addImage(logoImg, "PNG", 14, 10, 40, 15);
  } catch (e) {
    console.error("Error adding logo to PDF", e);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("INVOICE", 196, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoice.invoice_number}`, 196, 30, { align: "right" });
  doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString()}`, 196, 35, { align: "right" });
  if (invoice.due_date) {
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 196, 40, { align: "right" });
  }

  // --- 2. Billing Info ---
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text("Bill To:", 14, 55);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoice.customer_name, 14, 62);
  if (invoice.customer_email) doc.text(invoice.customer_email, 14, 67);
  if (invoice.customer_phone) doc.text(invoice.customer_phone, 14, 72);
  if (invoice.customer_address) {
    const splitAddress = doc.splitTextToSize(invoice.customer_address, 80);
    doc.text(splitAddress, 14, 77);
  }

  // Company Info
  doc.setFont("helvetica", "bold");
  doc.text("From:", 120, 55);
  doc.setFont("helvetica", "normal");
  doc.text("Busistree Solutions", 120, 62);
  doc.text("Pakistan", 120, 67);
  doc.text("support@busistree.com", 120, 72);

  // --- 3. Items Table ---
  const tableData = invoice.invoice_items.map((item: any) => [
    item.description,
    item.quantity.toString(),
    `${invoice.currency} ${item.unit_price.toLocaleString()}`,
    `${invoice.currency} ${item.amount.toLocaleString()}`,
  ]);

  doc.autoTable({
    startY: 95,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: tableData,
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // --- 4. Totals ---
  doc.setFont("helvetica", "bold");
  doc.text("Total Amount:", 140, finalY + 15);
  doc.text(`${invoice.currency} ${invoice.total_amount.toLocaleString()}`, 196, finalY + 15, { align: "right" });

  // --- 5. Notes & Signature ---
  if (invoice.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 14, finalY + 30);
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(invoice.notes, 100);
    doc.text(splitNotes, 14, finalY + 37);
  }

  // Signature
  try {
    const signImg = new Image();
    signImg.src = signatureAsset.url;
    await new Promise((resolve) => {
      signImg.onload = resolve;
      signImg.onerror = resolve;
    });
    const signY = finalY + 40;
    doc.addImage(signImg, "PNG", 140, signY, 40, 20);
    doc.setFont("helvetica", "bold");
    doc.text("__________________________", 140, signY + 22);
    doc.text("Authorized Signature", 140, signY + 28);
  } catch (e) {
    console.error("Error adding signature to PDF", e);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Thank you for your business!", 105, 285, { align: "center" });

  doc.save(`${invoice.invoice_number}.pdf`);
};
