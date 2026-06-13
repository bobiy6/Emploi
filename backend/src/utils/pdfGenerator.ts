import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = async (invoice: any) => {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(0, 23, 71); // OVH Dark Blue
    doc.text('INFRALYONIX', 14, 25);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Infrastructure & Cloud Services', 14, 32);
    doc.text('https://infralyonix.com', 14, 37);

    // Invoice Info
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`FACTURE`, 140, 25);
    doc.setFontSize(11);
    doc.text(`#INV-${invoice.id.toString().padStart(6, '0')}`, 140, 32);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Date d'émission: ${new Date(invoice.createdAt).toLocaleDateString()}`, 140, 42);
    doc.text(`État du paiement: ${invoice.status === 'PAID' ? 'PAYÉE' : 'EN ATTENTE'}`, 140, 47);

    // Client Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('DESTINATAIRE', 14, 60);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(invoice.user.name, 14, 66);
    doc.text(invoice.user.email, 14, 71);
    if (invoice.user.isCompany) {
        doc.text(invoice.user.companyName || '', 14, 76);
        doc.text(`Numéro TVA: ${invoice.user.vatNumber || ''}`, 14, 81);
    }
    if (invoice.user.address) {
        doc.text(invoice.user.address, 14, invoice.user.isCompany ? 86 : 76);
    }

    // Table
    const tableData = [
        [
            invoice.order?.product?.name || 'Rechargement de Crédits (Balance Top-up)',
            '1',
            `${invoice.amount.toFixed(2)}€`,
            `${invoice.amount.toFixed(2)}€`
        ]
    ];

    if (typeof (doc as any).autoTable !== 'function') {
        const { default: autoTable } = await import('jspdf-autotable');
        (autoTable as any)(doc, {
            startY: 100,
            head: [['Désignation', 'Qté', 'Prix Unitaire (HT)', 'Total (TTC)']],
            body: [
                [
                    invoice.order?.product?.name || 'Rechargement de Crédits (Balance Top-up)',
                    '1',
                    `${invoice.amount.toFixed(2)}€`,
                    `${invoice.amount.toFixed(2)}€`
                ]
            ],
            headStyles: { fillColor: [0, 80, 215], fontSize: 9, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right' }
            }
        });
    } else {
    (doc as any).autoTable({
        startY: 100,
        head: [['Désignation', 'Qté', 'Prix Unitaire (HT)', 'Total (TTC)']],
        body: tableData,
        headStyles: { fillColor: [0, 80, 215], fontSize: 9, fontStyle: 'bold' }, // OVH Blue
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { halign: 'center' },
            2: { halign: 'right' },
            3: { halign: 'right' }
        }
    });
    }

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY || 110;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`TOTAL À PAYER:`, 130, finalY + 15);
    doc.setFontSize(14);
    doc.setTextColor(0, 80, 215);
    doc.text(`${invoice.amount.toFixed(2)}€`, 170, finalY + 15);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Infralyonix SAS - 2 rue de l\'Innovation, 69000 Lyon, France', 105, 285, { align: 'center' });
    doc.text('Merci d\'utiliser nos services.', 105, 290, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
};
