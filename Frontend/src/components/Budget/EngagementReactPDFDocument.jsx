import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { amiriFont } from '../../assets/Amiri-Regular-base64';
import { ArabicShaper } from 'arabic-persian-reshaper';
import { formatDZD } from '../../utils/CurrencyFormat';

if (!globalThis.__AMIRI_FONT_REGISTERED__) {
  Font.register({
    family: 'Amiri',
    src: `data:font/truetype;charset=utf-8;base64,${amiriFont}`
  });
  globalThis.__AMIRI_FONT_REGISTERED__ = true;
}

const processArabic = (text) => {
  if (!text) return "";
  const textStr = String(text);
  try {
    return ArabicShaper.convertArabic(textStr);
  } catch (error) {
    return textStr;
  }
};

// Fonction pour calculer les montants selon le principe de calcul sur table
const calculateTableAmounts = (initialBudget, engagements) => {
  let restant = initialBudget;
  const results = [];
  let creditLinesAdded = [];

  for (let i = 0; i < engagements.length; i++) {
    const currentAmount = parseFloat(engagements[i]?.rawAmount || engagements[i]?.amount || 0);
    const engagementType = engagements[i]?.type || 'DEBIT';

    // Restant avant paiement
    let oldBalance = restant;

    // Vérifier si l'engagement dépasse le restant
    const needsCredit = engagementType === 'DEBIT' && currentAmount > restant && restant >= 0;

    if (needsCredit) {
      // Ajouter une ligne de crédit automatique
      const creditAmount = currentAmount - restant;
      creditLinesAdded.push({
        index: i,
        creditAmount: creditAmount,
        originalEngagement: engagements[i]
      });
    }

    // Montant de l'engagement
    let proposedAmount = currentAmount;
    let isPartial = false;

    // Pour les engagements DEBIT qui dépassent
    if (engagementType === 'DEBIT' && currentAmount > restant && restant >= 0) {
      proposedAmount = restant; // On ne paie que ce qui reste
      isPartial = true;
    }

    // Restant après paiement
    let newBalance = 0;
    if (engagementType === 'DEBIT') {
      newBalance = restant - proposedAmount;
      if (newBalance < 0) newBalance = 0;
    } else if (engagementType === 'CREDIT') {
      // Pour les crédits, on augmente le restant
      newBalance = restant + currentAmount;
    }

    results.push({
      index: i,
      oldBalance: oldBalance,
      proposedAmount: proposedAmount,
      newBalance: newBalance,
      originalAmount: currentAmount,
      isPartial: isPartial,
      needsCredit: needsCredit,
      creditAmountNeeded: needsCredit ? currentAmount - restant : 0,
      reference: engagements[i]?.cfVisaNumber || engagements[i]?.reference || engagements[i]?.type || `Engagement ${i + 1}`,
      type: engagementType
    });

    // Mettre à jour le restant pour le prochain engagement
    restant = newBalance;
  }

  return {
    all: results,
    totalProposed: results.reduce((sum, r) => sum + r.proposedAmount, 0),
    totalOldBalance: results.reduce((sum, r) => sum + r.oldBalance, 0),
    totalNewBalance: results.reduce((sum, r) => sum + r.newBalance, 0),
    remainingBudget: restant,
    creditLinesAdded: creditLinesAdded,
    needsAdditionalCredit: creditLinesAdded.length > 0
  };
};

// Fonction pour convertir un nombre en lettres (français)
const numberToFrenchWords = (amount) => {
  if (!amount || amount === 0) return "zéro";

  const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

  const convertLessThanThousand = (num) => {
    if (num === 0) return "";

    let result = "";
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    if (hundred > 0) {
      if (hundred === 1) result += "cent ";
      else result += ones[hundred] + " cent ";
      if (remainder === 0 && hundred > 1) result += "s ";
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result += ones[remainder];
      } else if (remainder < 20) {
        result += teens[remainder - 10];
      } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;

        if (ten === 7 || ten === 9) {
          if (unit === 0) result += tens[ten - 1];
          else result += tens[ten - 1] + "-" + teens[unit];
        } else {
          if (unit === 0) result += tens[ten];
          else if (unit === 1 && ten !== 8) result += tens[ten] + " et un";
          else result += tens[ten] + "-" + ones[unit];
        }
      }
    }

    return result.trim();
  };

  const convertNumber = (num) => {
    if (num === 0) return "zéro";

    let result = "";
    const millions = Math.floor(num / 1000000);
    const thousands = Math.floor((num % 1000000) / 1000);
    const remainder = num % 1000;

    if (millions > 0) {
      if (millions === 1) result += "un million";
      else result += convertLessThanThousand(millions) + " millions";
      if (thousands > 0 || remainder > 0) result += " ";
    }

    if (thousands > 0) {
      if (thousands === 1) result += "mille";
      else result += convertLessThanThousand(thousands) + " mille";
      if (remainder > 0) result += " ";
    }

    if (remainder > 0) {
      result += convertLessThanThousand(remainder);
    }

    return result.trim();
  };

  const dinars = Math.floor(amount);
  const cents = Math.round((amount - dinars) * 100);

  let result = convertNumber(dinars) + " dinar";
  if (dinars > 1) result += "s";

  if (cents > 0) {
    result += " et " + convertNumber(cents) + " centime";
    if (cents > 1) result += "s";
  }

  return result;
};

const styles = StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Amiri',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
    direction: 'rtl',
  },
  pageSignature: {
    padding: 25,
    fontFamily: 'Amiri',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
    direction: 'rtl',
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  republicText: {
    fontSize: 12,
    marginBottom: 15,
    textDecoration: 'underline',
  },
  deptInfo: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontSize: 10,
    marginBottom: 2,
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  metaBox: {
    borderWidth: 0,
    borderBottomWidth: 1,
    padding: 2,
    minWidth: 50,
    textAlign: 'center',
  },
  operationContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  operationCodeBox: {
    borderWidth: 1,
    paddingVertical: 5,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  operationDetails: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
  },
  opTitleSide: {
    width: '30%',
    padding: 5,
    borderLeftWidth: 1,
    textAlign: 'right',
    backgroundColor: '#f9f9f9',
  },
  opValueSide: {
    width: '70%',
    padding: 5,
    textAlign: 'center',
    justifyContent: 'center',
  },
  table: {
    display: 'table',
    width: '100%',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 5,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  cell: {
    padding: 5,
    borderLeftWidth: 1,
    justifyContent: 'center',
    textAlign: 'center',
  },
  colNote: { width: '12%', borderLeftWidth: 0 },
  colBalanceNew: { width: '16%' },
  colProposed: { width: '16%' },
  colBalanceOld: { width: '16%' },
  colTitle: { width: '40%', textAlign: 'right' },

  creditSection: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  creditHeader: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  creditRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    padding: 5,
  },
  creditLabel: {
    width: '40%',
    textAlign: 'right',
    paddingRight: 10,
  },
  creditValue: {
    width: '60%',
    textAlign: 'center',
  },

  projectSection: {
    marginTop: 15,
  },
  infoLine: {
    flexDirection: 'row-reverse',
    marginBottom: 4,
    alignItems: 'center',
  },
  infoLabel: {
    width: 60,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  infoValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    marginRight: 5,
    textAlign: 'right',
    paddingRight: 5,
  },
  signatureSection: {
    flexDirection: 'row-reverse',
    marginTop: 30,
    borderWidth: 1,
    minHeight: 200,
  },
  controllerBox: {
    flex: 1,
    borderLeftWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  ordererBox: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  stampBox: {
    borderWidth: 1,
    width: 120,
    height: 80,
    marginTop: 20,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureLine: {
    flexDirection: 'row-reverse',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    padding: 5,
    marginVertical: 5,
    borderRadius: 3,
  },
  budgetInfo: {
    marginVertical: 5,
    padding: 5,
    backgroundColor: '#e8f4e8',
    borderWidth: 1,
    borderColor: '#d0e8d0',
    borderRadius: 3,
  },
  amountInWords: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  dottedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    marginHorizontal: 5,
    height: 10,
  },
  creditWarning: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    padding: 8,
    marginVertical: 5,
    borderRadius: 3,
  }
});

const EngagementReactPDFDocument = ({ operation, engagement, lots, allEngagements = [] }) => {
  // Add defensive checks
  if (!engagement) {
    console.error('EngagementReactPDFDocument: No engagement provided');
    return <Document><Page><Text>Error: Missing engagement data</Text></Page></Document>;
  }

  if (!operation) {
    console.error('EngagementReactPDFDocument: No operation provided');
    return <Document><Page><Text>Error: Missing operation data</Text></Page></Document>;
  }
  if (!engagement || !operation) return null;

  // Utiliser le tableau des engagements ou un tableau avec un seul élément
  const tableData = allEngagements && allEngagements.length > 0 ? allEngagements : [engagement];

  // Récupérer le budget initial (AP)
  const initialBudget = parseFloat(operation.AP || operation.initialBudget || 0);

  // Calculer les montants selon le principe de calcul sur table
  const tableCalcul = calculateTableAmounts(initialBudget, tableData);
  const hasExcess = tableCalcul.totalProposed > initialBudget;
  const needsCredit = tableCalcul.needsAdditionalCredit;

  // Calcul des crédits (ouvertures de crédit)
  const totalCreditsOpened = tableCalcul.totalProposed;
  const remainingCredits = initialBudget - totalCreditsOpened;
  const percentageUsed = initialBudget > 0 ? (totalCreditsOpened / initialBudget) * 100 : 0;

  // Calcul du crédit supplémentaire nécessaire
  const totalCreditNeeded = tableCalcul.creditLinesAdded.reduce((sum, c) => sum + c.creditAmount, 0);

  return (
    <Document title="بطاقة التزام">
      {/* PAGE 1 - Contenu principal */}
      <Page size="A4" style={styles.page}>

        {/* Official title */}
        <View style={styles.headerContainer}>
          <Text style={styles.republicText}>{processArabic('الجمهورية الجزائرية الديمقراطية الشعبية')}</Text>
        </View>

        <Text style={styles.deptInfo}>{processArabic('وزارة التعليم العالي والبحث العلمي')}</Text>
        <Text style={styles.deptInfo}>{processArabic('الهيئة الإدارية: جامعة محمد خيضر بسكرة')}</Text>
        <Text style={styles.deptInfo}>{processArabic('رمز الأمر بالصرف: 260.174')}</Text>

        {/* Meta data top */}
        <View style={styles.topMetaRow}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <Text>{processArabic(' : بتـاريخ ')} </Text>
            <View style={styles.metaBox}>
              <Text>{engagement.dateEngagement}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <Text>{processArabic(' : رقم بطاقة الالتزام ')} </Text>
            <View style={styles.metaBox}>
              <Text>{new Date().getFullYear()} / 02</Text>
            </View>
          </View>
        </View>

        <View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <Text>{processArabic(' 049 : رمز البرنامج ')} </Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <Text>{processArabic(' 01 : رمز البرنامج الفرعي ')} </Text>
          </View>
        </View>

        {/* Montant du budget initial (AP) */}
        <View style={styles.budgetInfo}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
            {formatDZD(initialBudget)} {processArabic(' (AP)مبلغ البرنامج الإجمالي')}
          </Text>
        </View>

        {/* Number of operation */}
        <Text style={{ textAlign: 'right', marginBottom: 2 }}>{processArabic(' : رقم العملية ')}</Text>
        <Text style={styles.operationCodeBox}>{processArabic(operation.Numero || '---')}</Text>

        <View style={styles.operationDetails}>
          <View style={styles.opValueSide}>
            <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{processArabic(operation.Program || '---')}</Text>
          </View>
          <View style={styles.opTitleSide}>
            <Text>{processArabic(' : عنوان العملية')}</Text>
          </View>
        </View>

        {/* Table centrale des engagements */}
        <View style={styles.operationContainer}>
          <Text style={{ textAlign: 'right' }}>{processArabic(' : نفقات الاستثمار ')}</Text>
        </View>

        <View style={[styles.table, { flexDirection: 'column' }]}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHeader, { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.cell, styles.colTitle]}>{processArabic('العناوين')}</Text>
            <Text style={[styles.cell, styles.colBalanceOld]}>{processArabic('الرصيد القديم')}</Text>
            <Text style={[styles.cell, styles.colProposed]}>{processArabic('الالتزامات المقترحة')}</Text>
            <Text style={[styles.cell, styles.colBalanceNew]}>{processArabic('الرصيد الجديد')}</Text>
            <Text style={[styles.cell, styles.colNote]}>{processArabic('ملاحظة')}</Text>
          </View>

          {/* Rows - using calculated values from tableCalcul */}
          {tableCalcul.all.map((item, index) => (
            <View key={index} style={[styles.tableRow, { flexDirection: 'row-reverse' }]}>
              <View style={[styles.cell, styles.colTitle]}>
                <Text style={{ textAlign: 'right' }}>
                  {processArabic(item.reference)}
                  {item.type === 'CREDIT' && ' (اعتماد)'}
                </Text>
              </View>
              <View style={[styles.cell, styles.colBalanceOld]}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold', color: item.needsCredit ? '#ff6600' : '#000000' }}>
                  {formatDZD(item.oldBalance)}
                </Text>
              </View>
              <View style={[styles.cell, styles.colProposed]}>
                <Text style={{ textAlign: 'center', color: item.isPartial ? '#ff6600' : (item.type === 'CREDIT' ? 'green' : '#000000') }}>
                  {formatDZD(item.proposedAmount)}
                  {item.isPartial && ' *'}
                  {item.type === 'CREDIT' && ' +'}
                </Text>
              </View>
              <View style={[styles.cell, styles.colBalanceNew]}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold', color: item.newBalance === 0 ? 'green' : '#000000' }}>
                  {formatDZD(item.newBalance)}
                </Text>
              </View>
              <View style={[styles.cell, styles.colNote]}>
                <Text style={{ textAlign: 'center', fontSize: 8 }}>
                  {item.isPartial ? processArabic('دفع جزئي') : ''}
                  {item.needsCredit ? processArabic('يحتاج اعتماد') : ''}
                </Text>
              </View>
            </View>
          ))}

          {/* Total Row */}
          <View style={[styles.tableRow, { flexDirection: 'row-reverse', backgroundColor: '#f9f9f9', borderBottomWidth: 0 }]}>
            <View style={[styles.cell, styles.colTitle]}>
              <Text style={{ textAlign: 'right', fontWeight: 'bold' }}>{processArabic('المجموع')}</Text>
            </View>
            <View style={[styles.cell, styles.colBalanceOld]}>
              <Text style={{ textAlign: 'center' }}>{formatDZD(tableCalcul.totalOldBalance)}</Text>
            </View>
            <View style={[styles.cell, styles.colProposed]}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{formatDZD(tableCalcul.totalProposed)}</Text>
            </View>
            <View style={[styles.cell, styles.colBalanceNew]}>
              <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'green' }}>{formatDZD(tableCalcul.totalNewBalance)}</Text>
            </View>
            <View style={[styles.cell, styles.colNote]}></View>
          </View>
        </View>

        <View>
          <View style={styles.infoLine}>
            <Text style={[{ textAlign: 'right', writingDirection: 'rtl' }]}>
              {processArabic(' : موضوع')}
            </Text>
            <Text style={[{ textAlign: 'right', writingDirection: 'rtl' }]}>
              {processArabic(
                `${engagement.dateEngagement || '---'} بطاقة الالتزام الخاصة بالصفقة رقم ${engagement.numeroMarche || '2024/08'} المؤرخة في `
              )}
            </Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={[{ textAlign: 'right', writingDirection: 'rtl' }]}>{processArabic(' : المشروع')}</Text>
            <Text style={[{ textAlign: 'right', writingDirection: 'rtl' }]}>{processArabic(operation.Program || '---')}</Text>
          </View>
          <View style={styles.infoLine}>
            <Text style={[{ textAlign: 'right', writingDirection: 'rtl' }]}>{processArabic(' : من طرف')}</Text>
            <Text style={[{ textAlign: 'right', writingDirection: 'rtl' }]}>{processArabic(' جامعة محمد خيضر بسكرة ')}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>1 / 2</Text>
      </Page>

      {/* PAGE 2 - Signatures et cachets */}
      <Page size="A4" style={styles.pageSignature}>
        <View>
          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginBottom: 20, textDecoration: 'underline' }}>
            {processArabic('اعتمادات وتوقيعات بطاقة الالتزام')}
          </Text>
        </View>

        {/* Section des signatures */}
        <View style={styles.signatureSection}>
          {/* Contrôleur financier */}
          <View style={styles.controllerBox}>
            <Text style={{ textDecoration: 'underline', fontWeight: 'bold', marginBottom: 10 }}>
              {processArabic('إطار مخصص للمراقب الميزانياتي')}
            </Text>

            <View style={styles.signatureLine}>
              <Text>{processArabic('الختم')}</Text>
              <Text>{processArabic('الامضاء')}</Text>
            </View>
          </View>

          {/* Ordonnateur */}
          <View style={styles.ordererBox}>
            <Text style={{ textDecoration: 'underline', fontWeight: 'bold', marginBottom: 10 }}>
              {processArabic('إطار مخصص للآمر بالصرف')}
            </Text>

            <View style={styles.signatureLine}>
              <Text>{processArabic('الختم')}</Text>
              <Text>{processArabic('الامضاء')}</Text>
            </View>
          </View>
        </View>

        {/* Section comptable */}
        <View style={{ borderWidth: 1, marginTop: 20, minHeight: 150 }}>
          <View style={{ flex: 1, padding: 10, alignItems: 'center' }}>
            <Text style={{ textDecoration: 'underline', fontWeight: 'bold', marginBottom: 10 }}>
              {processArabic('إطار مخصص للعاون المحاسب')}
            </Text>
            <View style={styles.signatureLine}>
              <Text>{processArabic('الختم')}</Text>
              <Text>{processArabic('الامضاء')}</Text>
            </View>
          </View>
        </View>

        {/* Note de bas de page */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 7, color: '#666', textAlign: 'center' }}>
            {processArabic('هذه الوثيقة صالحة بعد توقيع جميع الأطراف المعنية')}
          </Text>
        </View>

        <Text style={styles.pageNumber}>2 / 2</Text>
      </Page>
    </Document>
  );
};

export default EngagementReactPDFDocument;