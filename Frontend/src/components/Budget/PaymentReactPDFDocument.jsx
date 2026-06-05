import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { amiriFont } from '../../assets/Amiri-Regular-base64';
import { ArabicShaper } from 'arabic-persian-reshaper';

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

const numberToArabicWords = (amount) => {
    if (!amount) return "";
    // Handle Algerian amount format (e.g., 365.100,00 or 365100.00)
    const cleanAmount = amount.toString().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const number = parseFloat(cleanAmount);
    if (isNaN(number)) return "";

    const dinars = Math.floor(number);
    const cents = Math.round((number - dinars) * 100);

    const convert = (num) => {
        const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
        const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
        const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

        if (num === 0) return "صفر";

        let parts = [];

        // Millions
        const mil = Math.floor(num / 1000000);
        if (mil > 0) {
            if (mil === 1) parts.push("مليون");
            else if (mil === 2) parts.push("مليونان");
            else if (mil >= 3 && mil <= 10) parts.push(ones[mil] + " ملايين");
            else parts.push(convert(mil) + " مليون");
            num %= 1000000;
        }

        // Thousands
        const thou = Math.floor(num / 1000);
        if (thou > 0) {
            if (thou === 1) parts.push("ألف");
            else if (thou === 2) parts.push("ألفان");
            else if (thou >= 3 && thou <= 10) parts.push(ones[thou] + " آلاف");
            else parts.push(convert(thou) + " ألف");
            num %= 1000;
        }

        // Hundreds
        const hun = Math.floor(num / 100);
        if (hun > 0) {
            parts.push(hundreds[hun]);
            num %= 100;
        }

        // Tens and Units
        const ten = Math.floor(num / 10);
        const unit = num % 10;

        if (ten > 0 || unit > 0) {
            if (ten === 0) {
                parts.push(ones[unit]);
            } else if (ten === 1) {
                if (unit === 0) parts.push("عشرة");
                else if (unit === 1) parts.push("أحد عشر");
                else if (unit === 2) parts.push("اثنا عشر");
                else parts.push(ones[unit] + " عشر");
            } else {
                if (unit === 0) parts.push(tens[ten]);
                else parts.push(ones[unit] + " و " + tens[ten]);
            }
        }

        return parts.join(" و ");
    };

    const words = convert(dinars);
    let result = `${words} دينار جزائري`;
    if (cents > 0) {
        result += ` و ${convert(cents)} سنتيم`;
    }
    return result;
};

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Amiri',
        fontSize: 9,
        backgroundColor: '#FFFFFF',
    },
    // Page 1 Styles
    topHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 10 },
    headerText: { alignItems: 'flex-end', width: '30%' },
    centerTitleBox: { width: '40%', alignItems: 'center', borderWidth: 1, padding: 5 },
    codeRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginVertical: 10 },
    smallBoxTable: { flexDirection: 'row-reverse', borderWidth: 1 },
    smallBox: { borderLeftWidth: 1, paddingHorizontal: 5, textAlign: 'center', minWidth: 25 },
    mainTable: { borderWidth: 1, marginTop: 5 },
    tableHeader: { flexDirection: 'row-reverse', backgroundColor: '#f2f2f2', borderBottomWidth: 1, minHeight: 25, alignItems: 'center' },
    tableRow: { flexDirection: 'row-reverse', borderBottomWidth: 1, minHeight: 80 },
    cell: { borderLeftWidth: 1, padding: 4, justifyContent: 'center', textAlign: 'center' },
    colBeneficiary: { width: '20%' }, colBank: { width: '18%' }, colAmount: { width: '12%' },
    colCommit: { width: '8%' }, colBudget: { width: '15%' }, colYear: { width: '7%' }, colNotes: { width: '20%', borderLeftWidth: 0 },
    amountWordsRow: { flexDirection: 'row-reverse', padding: 5, borderBottomWidth: 1, alignItems: 'center' },
    signatureSection: { flexDirection: 'row-reverse', marginTop: 15, height: 100 },
    signatureBox: { flex: 1, alignItems: 'center', padding: 5 },

    // Page 2 Specific Styles
    sectionTitle: { backgroundColor: '#EEEEEE', padding: 4, textAlign: 'center', fontWeight: 'bold', borderBottomWidth: 1, borderTopWidth: 1, marginVertical: 10 },
    fieldRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
    dottedLine: { borderBottomWidth: 1, borderBottomStyle: 'dotted', flex: 1, marginHorizontal: 5, height: 10 },
    stampContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    stampBox: { border: 1, width: '45%', height: 120, padding: 5, alignItems: 'center' }
});

const PaymentReactPDFDocument = ({ paymentData, operation, supplier, payment, engagement }) => {
    // Add defensive checks at the VERY START
    if (!operation) {
        console.error('PaymentReactPDFDocument: No operation provided');
        return (
            <Document>
                <Page>
                    <Text>Error: Missing operation data</Text>
                </Page>
            </Document>
        );
    }

    if (!engagement) {
        console.error('PaymentReactPDFDocument: No engagement provided');
        console.log('Received props:', { paymentData, operation, supplier, payment, engagement });
        return (
            <Document>
                <Page>
                    <Text>Error: Missing engagement data</Text>
                </Page>
            </Document>
        );
    }

    // Get data from props (handle both naming conventions)
    const data = paymentData || payment || {
        id: engagement.reference || "N/A",
        date: new Date().toLocaleDateString(),
        notes: ""
    };

    // Ensure we have valid IDs
    const paymentId = data?.id || engagement?.reference || "N/A";
    const paymentDate = data?.date || data?.datePayment || engagement?.dateEngagement || new Date().toLocaleDateString();

    const beneficiaryName = supplier?.Nom || "Non spécifié";
    const bankName = supplier?.AgenceBancaire || "Non spécifié";
    const accountNumber = supplier?.Rib || "Non spécifié";

    // Get amount safely
    const amount = engagement?.amount || engagement?.rawAmount || 0;
    const formattedAmount = typeof amount === 'number' ? amount.toLocaleString() : amount;

    return (
        <Document title="حوالة دفع">
            {/* Page 1: Original Layout */}
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.topHeader}>
                    <View style={styles.headerText}>
                        <Text>{processArabic('وزارة التعليم العالي والبحث العلمي')}</Text>
                        <Text>{processArabic('جامعة محمد خيضر - بسكرة')}</Text>
                    </View>
                    <View style={styles.centerTitleBox}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{processArabic('حوالة دفع')}</Text>
                        <Text style={{ fontSize: 8 }}>{processArabic('للنفقات المسندة لميزانية جامعة محمد خيضر بسكرة')}</Text>
                    </View>
                    <View style={{ width: '30%', alignItems: 'flex-start' }}>
                        <Text>{processArabic('رقم: ')} {paymentId}</Text>
                    </View>
                </View>

                <View style={styles.codeRow}>
                    <View style={{ flexDirection: 'row-reverse' }}>
                        <Text>{processArabic('محفظة البرنامج: ')} 012</Text>
                        <Text style={{ marginRight: 15 }}>{processArabic('البرنامج: ')} 049</Text>
                    </View>
                    <View style={styles.smallBoxTable}>
                        <View style={styles.smallBox}><Text>{operation?.Numero || '---'}</Text></View>
                        <View style={[styles.smallBox, { borderLeftWidth: 0 }]}><Text>{new Date().getFullYear()}</Text></View>
                    </View>
                    <Text>{paymentDate} {processArabic('التاريخ')}</Text>
                </View>

                <View style={styles.mainTable}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.cell, styles.colBeneficiary]}>{processArabic('تعيين المستفيد')}</Text>
                        <Text style={[styles.cell, styles.colBank]}>{processArabic('رقم الحساب')}</Text>
                        <Text style={[styles.cell, styles.colAmount]}>{processArabic('المبلغ')}</Text>
                        <Text style={[styles.cell, styles.colCommit]}>{processArabic('رقم الالتزام')}</Text>
                        <Text style={[styles.cell, styles.colBudget]}>{processArabic('تعيين الميزانية')}</Text>
                        <Text style={[styles.cell, styles.colYear]}>{processArabic('السنة')}</Text>
                        <Text style={[styles.cell, styles.colNotes]}>{processArabic('الملاحظات والمستندات')}</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, styles.colBeneficiary]}>
                            <Text style={{ fontWeight: 'bold' }}>{processArabic(beneficiaryName)}</Text>
                            <Text style={{ fontSize: 7, marginTop: 5 }}>{processArabic(supplier?.RaisonSocial)}</Text>
                        </View>
                        <View style={[styles.cell, styles.colBank]}>
                            <Text>{processArabic(bankName)}</Text>
                            <Text>{processArabic(accountNumber)}</Text>
                        </View>
                        <View style={[styles.cell, styles.colAmount]}>
                            <Text>{formattedAmount} DZD</Text>
                        </View>
                        <View style={[styles.cell, styles.colCommit]}>
                            <Text>{engagement?.reference || engagement?.cfVisaNumber || '---'}</Text>
                        </View>
                        <View style={[styles.cell, styles.colBudget]}>
                            <Text>{operation?.Numero || '---'}</Text>
                        </View>
                        <View style={[styles.cell, styles.colYear]}>
                            <Text>{new Date().getFullYear()}</Text>
                        </View>
                        <View style={[styles.cell, styles.colNotes]}>
                            <Text>{processArabic(data.notes || 'تسديد وضعية أشغال')}</Text>
                        </View>
                    </View>
                    <View style={styles.amountWordsRow}>
                        <Text style={{ fontWeight: 'bold' }}>{processArabic('مجموع الحوالة:')}</Text>
                        <Text style={{ marginHorizontal: 20 }}>{formattedAmount} DZD</Text>
                        <Text>{processArabic('تضبط هذه الحوالة بمبلغ: ')} {processArabic(numberToArabicWords(amount))}</Text>
                    </View>
                </View>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        <Text>{processArabic('عن الوزير و بتفويض منه')}</Text>
                        <Text>{processArabic('الآمر بالصرف')}</Text>
                    </View>
                    <View style={[styles.signatureBox, { borderRightWidth: 1, borderLeftWidth: 1 }]}>
                        <Text>{paymentDate} {processArabic('بسكره في')}</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text>{processArabic('العون المحاسب للدولة')}</Text>
                        <Text>{processArabic('لجامعة محمد خيضر بسكرة')}</Text>
                    </View>
                </View>
            </Page>

            {/* Page 2: Partie Maitre de L'ouvrage */}
            <Page size="A4" style={styles.page}>
                <View style={{ position: 'absolute', top: 30, left: 30 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 11 }}>{formattedAmount} DZD</Text>
                </View>

                <Text style={styles.sectionTitle}>{processArabic(' جزء خاص بصاحب المشروع- II ')}</Text>

                <View style={{ marginVertical: 10, alignItems: 'flex-end' }}>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text style={{ fontWeight: 'bold' }}>{processArabic('صفقة رقم:')}</Text>
                        <Text style={{ marginRight: 5 }}>{operation?.Numero || '---'}</Text>
                        <Text style={{ marginRight: 20, fontWeight: 'bold' }}>{processArabic('مصادق عليها بتاريخ:')}</Text>
                        <Text style={{ marginRight: 5 }}>{operation?.DateVisa ? new Date(operation.DateVisa).toLocaleDateString() : '---'}</Text>
                    </View>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text style={{ fontWeight: 'bold' }}>{processArabic('مبلغ الصفقة:')}</Text>
                        <Text style={{ marginRight: 5 }}>{operation?.AP?.toLocaleString() || '0'} {processArabic('دج')}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 15 }}>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text>{processArabic(' المبلغ الصافي المطلوب من طرف المؤسسة ')}</Text>
                        <View style={styles.dottedLine} />
                        <Text>{formattedAmount} DZD</Text>
                    </View>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text>{processArabic(' للاقتطاع  ')}</Text>
                        <View style={styles.dottedLine} />
                    </View>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse', paddingRight: 20 }]}>
                        <Text>{processArabic('- غرامات التأخير')}</Text>
                        <View style={styles.dottedLine} />
                    </View>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse', marginTop: 15 }]}>
                        <Text style={{ fontWeight: 'bold' }}>{processArabic(' المبلغ الصافي للدفع')}</Text>
                        <View style={styles.dottedLine} />
                        <Text style={{ fontWeight: 'bold' }}>{formattedAmount} DZD</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>{processArabic('جزء خاص بهيئة الدفع III')}</Text>

                <View style={{ gap: 8 }}>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text>{processArabic('سددت بمبلغ قدره ')}</Text>
                        <View style={styles.dottedLine} />
                    </View>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text>{processArabic('بموجب تحويل إلى الحساب رقم :')}</Text>
                        <View style={styles.dottedLine} />
                    </View>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text>{processArabic('المفتوح باسم الهيئة ')}</Text>
                        <View style={styles.dottedLine} />
                    </View>
                    <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                        <Text>{processArabic('لدى الهيئة البنكية أو مركز الصكوك البريدية')}</Text>
                        <View style={styles.dottedLine} />
                    </View>
                </View>

                <View style={[styles.stampContainer, { flexDirection: 'row-reverse' }]}>
                    <View style={styles.stampBox}>
                        <Text style={{ fontSize: 8 }}>{processArabic('إطار مخصص للآمر بالصرف')}</Text>
                        <Text style={{ marginTop: 60 }}>{processArabic('الختم والإمضاء')}</Text>
                    </View>
                    <View style={styles.stampBox}>
                        <Text style={{ fontSize: 8 }}>{processArabic('هيئة الدفع')}</Text>
                        <Text style={{ marginTop: 60 }}>{processArabic('(الختم والإمضاء)')}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 20, borderTopWidth: 1, paddingTop: 10 }}>
                    <View style={{
                        borderWidth: 1,
                        borderColor: '#000',
                        padding: 10,
                        minHeight: 80
                    }}>
                        <Text style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            marginBottom: 8,
                            textAlign: 'right',
                            textDecoration: 'underline'
                        }}>
                            {processArabic('إطار مخصص لحالة الرفض:')}
                        </Text>

                        <View style={[styles.fieldRow, { flexDirection: 'row-reverse', marginBottom: 12 }]}>
                            <Text style={{ fontSize: 9 }}>{processArabic('السبب الدقيق للرفض :')}</Text>
                            <View style={{
                                borderBottomWidth: 1,
                                borderBottomStyle: 'dotted',
                                flex: 1,
                                marginRight: 5,
                                height: 12
                            }} />
                        </View>

                        <View style={[styles.fieldRow, { flexDirection: 'row-reverse' }]}>
                            <View style={{
                                borderBottomWidth: 1,
                                borderBottomStyle: 'dotted',
                                flex: 1,
                                height: 12
                            }} />
                        </View>
                    </View>
                </View>
            </Page>

            {/* Page 3 */}
            <Page size="A4" style={styles.page}>
                <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', borderBottomWidth: 1, paddingBottom: 5 }}>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{processArabic('جامعة بسكرة')}</Text>
                        <Text style={{ fontSize: 8 }}>{processArabic('ميزانية التجهيز')}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', textDecoration: 'underline' }}>
                            {processArabic('شهادة الدفع')}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-start', fontSize: 8 }}>
                        <Text>{processArabic('السنة المالية : ')} {new Date().getFullYear()}</Text>
                        <Text>{processArabic('المادة : ')} 621</Text>
                        <Text>{processArabic('الحساب : ')} 8</Text>
                    </View>
                </View>

                <View style={{ marginTop: 10, alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 9 }}>
                        {processArabic(operation?.Program || 'Programme')} {processArabic(' العملية  ')}
                    </Text>
                    <View style={{ flexDirection: 'row-reverse' }}>
                        <Text style={{ fontSize: 9 }}>{processArabic('تأشيرة رقم  ')} {operation?.NumeroVisa || '---'}</Text>
                        <Text style={{ fontSize: 9, marginRight: 20 }}>{processArabic('بتاريخ : ')} {operation?.DateVisa ? new Date(operation.DateVisa).toLocaleDateString() : '---'}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 10, borderWidth: 1 }}>
                    <View style={[styles.tableHeader, { backgroundColor: '#f9f9f9' }]}>
                        <Text style={[styles.cell, { width: '10%' }]}>{processArabic('السنة')}</Text>
                        <Text style={[styles.cell, { width: '15%' }]}>{processArabic('طبيعة الأموال')}</Text>
                        <Text style={[styles.cell, { width: '25%' }]}>{processArabic('مبلغ الشهادة / الحوالة')}</Text>
                        <Text style={[styles.cell, { width: '15%' }]}>{processArabic('رقم الحوالة')}</Text>
                        <Text style={[styles.cell, { width: '15%' }]}>{processArabic('التاريخ')}</Text>
                        <Text style={[styles.cell, { width: '20%' }]}>{processArabic('ملاحظات')}</Text>
                    </View>

                    <View style={[styles.tableRow, { minHeight: 150 }]}>
                        <View style={[styles.cell, { width: '10%' }]}><Text>{new Date().getFullYear()}</Text></View>
                        <View style={[styles.cell, { width: '15%' }]}><Text>NK</Text></View>
                        <View style={[styles.cell, { width: '25%' }]}><Text>{formattedAmount} DZD</Text></View>
                        <View style={[styles.cell, { width: '15%' }]}><Text>001-2026-14341</Text></View>
                        <View style={[styles.cell, { width: '15%' }]}><Text>{paymentDate}</Text></View>
                        <View style={[styles.cell, { width: '20%' }]}></View>
                    </View>

                    <View style={{ flexDirection: 'row-reverse', borderTopWidth: 1, backgroundColor: '#EEEEEE' }}>
                        <View style={[styles.cell, { width: '25%', fontWeight: 'bold' }]}>
                            <Text>{processArabic('المجموع :')}</Text>
                        </View>
                        <View style={[styles.cell, { width: '25%' }]}>
                            <Text>{formattedAmount} DZD</Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 15, padding: 5, borderBottomWidth: 1, borderStyle: 'dotted' }}>
                    <Text style={{ fontSize: 9, lineHeight: 1.5 }}>
                        {processArabic('يثبت أنه يمكن أن يدفع إلى ')} {processArabic(beneficiaryName)}
                    </Text>
                    <Text style={{ fontSize: 9, lineHeight: 1.5 }}>
                        {processArabic('مبلغ قدره : ')} {processArabic(numberToArabicWords(amount))}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row-reverse', marginTop: 20 }}>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 10, marginBottom: 5 }}>{processArabic('الوثائق اللازمة لهذا الدفع ')}</Text>
                        <View style={{ width: '80%', borderBottomWidth: 1, borderStyle: 'dotted', height: 15 }} />
                        <View style={{ width: '80%', borderBottomWidth: 1, borderStyle: 'dotted', height: 15 }} />
                    </View>

                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', marginTop: 10 }}>{processArabic('الآمر بالصرف')}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

export default PaymentReactPDFDocument;