import fs from 'fs';
import path from 'path';

const fontPath = 'c:/Users/Malek/Desktop/NEWilyas v2/oppenoffers_Frontend/Frontend/src/assets/Amiri-Regular.ttf';
const outputPath = 'c:/Users/Malek/Desktop/NEWilyas v2/oppenoffers_Frontend/Frontend/src/assets/Amiri-Regular-base64.js';

try {
    const fontData = fs.readFileSync(fontPath);
    const base64Data = fontData.toString('base64');
    const jsContent = `export const amiriFont = "${base64Data}";`;
    fs.writeFileSync(outputPath, jsContent);
    console.log('Font converted to base64 successfully');
} catch (error) {
    console.error('Error converting font:', error);
}
