import jsPDF from 'jspdf';

export interface PDFDocumentData {
  title: string;
  patientName: string;
  patientInfo?: {
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
  };
  doctorName?: string;
  date: string;
  content: Array<{
    label: string;
    value: string;
  }>;
  footer?: string;
}

export function generatePDF(data: PDFDocumentData, filename: string = 'document.pdf') {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(18);
  doc.text(data.title, 105, 20, { align: 'center' });
  
  // Informations patient
  let y = 35;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.patientName, 50, y);
  
  if (data.patientInfo) {
    y += 7;
    if (data.patientInfo.dateOfBirth) {
      doc.text(`Né(e) le: ${data.patientInfo.dateOfBirth}`, 50, y);
      y += 7;
    }
    if (data.patientInfo.phone) {
      doc.text(`Téléphone: ${data.patientInfo.phone}`, 50, y);
      y += 7;
    }
    if (data.patientInfo.address) {
      doc.text(`Adresse: ${data.patientInfo.address}`, 50, y);
      y += 7;
    }
  }
  
  // Médecin
  if (data.doctorName) {
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Médecin:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.doctorName, 50, y);
    y += 7;
  }
  
  // Date
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, 50, y);
  y += 10;
  
  // Ligne de séparation
  doc.line(20, y, 190, y);
  y += 10;
  
  // Contenu
  doc.setFontSize(11);
  data.content.forEach((item) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.label}:`, 20, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(item.value, 150);
    doc.text(lines, 50, y);
    y += lines.length * 7 + 5;
  });
  
  // Pied de page
  if (data.footer) {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(data.footer, 105, 285, { align: 'center' });
      doc.text(`Page ${i} / ${pageCount}`, 190, 285, { align: 'right' });
    }
  }
  
  // Sauvegarder
  doc.save(filename);
}

export function generateInvoicePDF(invoice: any, patient: any, appointment?: any) {
  const data: PDFDocumentData = {
    title: 'FACTURE',
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientInfo: {
      phone: patient.phone,
      address: patient.address,
    },
    date: new Date(invoice.createdAt).toLocaleDateString('fr-FR'),
    content: [
      { label: 'Numéro de facture', value: `#${invoice.id.slice(0, 8)}` },
      { label: 'Montant', value: `${Number(invoice.amount).toFixed(2)} €` },
      { label: 'Statut', value: invoice.status === 'paid' ? 'Payé' : invoice.status === 'pending' ? 'En attente' : 'Annulé' },
      ...(invoice.paymentMethod ? [{ label: 'Méthode de paiement', value: invoice.paymentMethod }] : []),
      ...(invoice.insuranceCoverage ? [{ label: 'Couverture assurance', value: `${Number(invoice.insuranceCoverage).toFixed(2)} €` }] : []),
      ...(invoice.notes ? [{ label: 'Notes', value: invoice.notes }] : []),
    ],
    footer: 'Clinique KARA Oran - Facture médicale',
  };
  
  generatePDF(data, `facture-${invoice.id.slice(0, 8)}.pdf`);
}

export function generatePrescriptionPDF(
  prescription: any,
  patient: any,
  medicaments: any[],
  doctor?: any,
  template?: any
) {
  const medicamentsList = medicaments.map(m => 
    `${m.medicament?.name || 'Médicament'} - ${m.dosage || ''} ${m.frequency || ''} pendant ${m.duration || ''}`
  ).join('\n');
  
  // Utiliser le template si fourni, sinon utiliser les valeurs par défaut
  const design = template?.design || {};
  const content = template?.content || {};
  
  const data: PDFDocumentData = {
    title: content.header || 'ORDONNANCE MÉDICALE',
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientInfo: content.showPatientInfo ? {
      dateOfBirth: new Date(patient.dateOfBirth).toLocaleDateString('fr-FR'),
      gender: patient.gender,
    } : undefined,
    doctorName: content.showDoctorInfo && doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : undefined,
    date: content.showDate ? new Date(prescription.createdAt).toLocaleDateString('fr-FR') : '',
    content: [
      { label: 'Médicaments prescrits', value: medicamentsList || 'Aucun médicament' },
      ...(content.showInstructions && prescription.instructions ? [{ label: 'Instructions', value: prescription.instructions }] : []),
    ],
    footer: 'Clinique KARA Oran - Ordonnance médicale',
  };
  
  generatePDFWithDesign(data, `ordonnance-${prescription.id.slice(0, 8)}.pdf`, design);
}

// Fonction pour générer un PDF avec design personnalisé
function generatePDFWithDesign(data: PDFDocumentData & { design?: any }, filename: string = 'document.pdf', design: any = {}) {
  const doc = new jsPDF();
  
  // Appliquer les paramètres de design
  const primaryColor = design.primaryColor || '#3b82f6';
  const secondaryColor = design.secondaryColor || '#60a5fa';
  const backgroundColor = design.backgroundColor || '#ffffff';
  const textColor = design.textColor || '#111827';
  const fontFamily = design.fontFamily || 'helvetica';
  const fontSize = design.fontSize || 12;
  const headerFontSize = design.headerFontSize || 18;
  const padding = design.padding || 20;
  const borderWidth = design.borderWidth || 0;
  const borderStyle = design.borderStyle || 'none';
  const borderColor = design.borderColor || '#e5e7eb';
  
  // Convertir les couleurs hex en RGB pour jsPDF
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 59, g: 130, b: 246 };
  };
  
  // Fond de page
  if (backgroundColor !== '#ffffff') {
    const bg = hexToRgb(backgroundColor);
    doc.setFillColor(bg.r, bg.g, bg.b);
    doc.rect(0, 0, 210, 297, 'F');
  }
  
  let y = padding;
  
  // Logo si configuré
  if (design.showLogo && design.logoUrl) {
    try {
      // Note: jsPDF nécessite une image en base64 ou URL
      // Pour l'instant, on saute cette partie car elle nécessite un traitement d'image
      // TODO: Implémenter le chargement d'image
      y += 10;
    } catch (e) {
      console.warn('Impossible de charger le logo:', e);
    }
  }
  
  // En-tête avec style personnalisé
  const titleColor = hexToRgb(primaryColor);
  doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
  doc.setFontSize(headerFontSize);
  doc.setFont(fontFamily as any, 'bold');
  doc.text(data.title, 105, y, { align: 'center' });
  y += 15;
  
  // Ligne de séparation
  doc.setDrawColor(titleColor.r, titleColor.g, titleColor.b);
  doc.setLineWidth(2);
  doc.line(20, y, 190, y);
  y += 15;
  
  // Couleur du texte principal
  const txtColor = hexToRgb(textColor);
  doc.setTextColor(txtColor.r, txtColor.g, txtColor.b);
  doc.setFontSize(fontSize);
  doc.setFont(fontFamily as any, 'normal');
  
  // Informations patient
  if (data.patientInfo) {
    doc.setFont(fontFamily as any, 'bold');
    doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
    doc.text('Patient:', 20, y);
    doc.setFont(fontFamily as any, 'normal');
    doc.setTextColor(txtColor.r, txtColor.g, txtColor.b);
    doc.text(data.patientName, 50, y);
    y += 7;
    
    if (data.patientInfo.dateOfBirth) {
      doc.text(`Né(e) le: ${data.patientInfo.dateOfBirth}`, 50, y);
      y += 7;
    }
    if (data.patientInfo.gender) {
      doc.text(`Sexe: ${data.patientInfo.gender}`, 50, y);
      y += 7;
    }
    if (data.patientInfo.phone) {
      doc.text(`Téléphone: ${data.patientInfo.phone}`, 50, y);
      y += 7;
    }
    if (data.patientInfo.address) {
      doc.text(`Adresse: ${data.patientInfo.address}`, 50, y);
      y += 7;
    }
    y += 5;
  }
  
  // Médecin
  if (data.doctorName) {
    doc.setFont(fontFamily as any, 'bold');
    doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
    doc.text('Médecin:', 20, y);
    doc.setFont(fontFamily as any, 'normal');
    doc.setTextColor(txtColor.r, txtColor.g, txtColor.b);
    doc.text(data.doctorName, 50, y);
    y += 7;
  }
  
  // Date
  if (data.date) {
    doc.setFont(fontFamily as any, 'bold');
    doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
    doc.text('Date:', 20, y);
    doc.setFont(fontFamily as any, 'normal');
    doc.setTextColor(txtColor.r, txtColor.g, txtColor.b);
    doc.text(data.date, 50, y);
    y += 10;
  }
  
  // Ligne de séparation
  const borderClr = hexToRgb(borderColor);
  doc.setDrawColor(borderClr.r, borderClr.g, borderClr.b);
  doc.setLineWidth(1);
  doc.line(20, y, 190, y);
  y += 10;
  
  // Contenu
  doc.setFontSize(fontSize);
  data.content.forEach((item) => {
    if (y > 270) {
      doc.addPage();
      y = padding;
    }
    doc.setFont(fontFamily as any, 'bold');
    doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
    doc.text(`${item.label}:`, 20, y);
    doc.setFont(fontFamily as any, 'normal');
    doc.setTextColor(txtColor.r, txtColor.g, txtColor.b);
    const lines = doc.splitTextToSize(item.value, 150);
    doc.text(lines, 50, y);
    y += lines.length * 7 + 5;
  });
  
  // Bordure si configurée
  if (borderWidth > 0 && borderStyle !== 'none') {
    doc.setDrawColor(borderClr.r, borderClr.g, borderClr.b);
    doc.setLineWidth(borderWidth);
    // Bordure autour de tout le document
    doc.rect(padding, padding, 210 - padding * 2, 297 - padding * 2, 'D');
  }
  
  // Pied de page
  if (data.footer) {
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text(data.footer, 105, 285, { align: 'center' });
      doc.text(`Page ${i} / ${pageCount}`, 190, 285, { align: 'right' });
    }
  }
  
  // Sauvegarder
  doc.save(filename);
}

export function generateCertificatePDF(certificate: any, patient: any, doctor?: any) {
  const data: PDFDocumentData = {
    title: 'CERTIFICAT MÉDICAL',
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientInfo: {
      dateOfBirth: new Date(patient.dateOfBirth).toLocaleDateString('fr-FR'),
      gender: patient.gender,
    },
    doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : undefined,
    date: new Date().toLocaleDateString('fr-FR'),
    content: [
      { label: 'Type de certificat', value: certificate.type || 'Certificat médical' },
      { label: 'Motif', value: certificate.reason || '' },
      { label: 'Durée', value: certificate.duration || '' },
      { label: 'Observations', value: certificate.observations || '' },
    ],
    footer: 'Clinique KARA Oran - Certificat médical',
  };
  
  generatePDF(data, `certificat-${Date.now()}.pdf`);
}

export function generateBilanPDF(bilan: any, patient: any, doctor?: any) {
  const data: PDFDocumentData = {
    title: 'BILAN MÉDICAL',
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientInfo: {
      dateOfBirth: new Date(patient.dateOfBirth).toLocaleDateString('fr-FR'),
      gender: patient.gender,
    },
    doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : undefined,
    date: new Date(bilan.date || Date.now()).toLocaleDateString('fr-FR'),
    content: [
      { label: 'Type de bilan', value: bilan.type || 'Bilan médical' },
      { label: 'Résultats', value: bilan.results || '' },
      { label: 'Observations', value: bilan.observations || '' },
    ],
    footer: 'Clinique KARA Oran - Bilan médical',
  };
  
  generatePDF(data, `bilan-${Date.now()}.pdf`);
}

export function generateLetterPDF(letter: any, patient: any, doctor?: any) {
  const data: PDFDocumentData = {
    title: letter.title || 'COURRIER MÉDICAL',
    patientName: `${patient.firstName} ${patient.lastName}`,
    patientInfo: {
      dateOfBirth: new Date(patient.dateOfBirth).toLocaleDateString('fr-FR'),
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
    },
    doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : undefined,
    date: new Date(letter.date || Date.now()).toLocaleDateString('fr-FR'),
    content: [
      { label: 'Type de courrier', value: letter.type || 'Courrier médical' },
      { label: 'Destinataire', value: letter.recipient || '' },
      { label: 'Objet', value: letter.subject || '' },
      { label: 'Corps du courrier', value: letter.body || '' },
      ...(letter.recommendations ? [{ label: 'Recommandations', value: letter.recommendations }] : []),
    ],
    footer: 'Clinique KARA Oran - Courrier médical',
  };
  
  generatePDF(data, `courrier-${Date.now()}.pdf`);
}

