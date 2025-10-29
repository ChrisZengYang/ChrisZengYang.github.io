// Decodes Griffpatch-style level string from game.js and prints summary
const encoded = `1_247_120_ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZx38aZZZZP25dd39aZZZZH25dd40aZZb49ad42aZZz25dd40ad38aZT2x13a14aZK25T29a30aZK5y9a13a14aZH25V29a30aZH5A9a13a14aZF25X29a30aZF5C9a13a14aZD25Z29a30aZD5E9a13a14aZB25Z25b26aZC5G9a13a14aZz25Z25c26aZB5I9a13a14aZx31a32a25Z25b26aZA5L9a10aZy31a32a25Z25a26aZz5M9a10aZz31a32a25Z26aZy5N9a10aZA31a32a25Y29aZx5O9a10aZB34a25Yh47aZo5P9a10aZB34a25H35av48aZo5Q9a10aZB34a25F35au21a22b23aZn5R9a10aZB34a25D35as21a22b25dZn5S9a10aZB34a25B35at25gZn5T9a10aZB34a25h36a37aM25gZn5U9a10aZB34a25e36a37aC21a22e23ad25gZn5V9aZC34a25a36a37aF25gd25gZn5WU47aS27a28a25qf25gd25gZn5WU48aQ27a28a25sf25gd25gZn5WU1a13a14aM27a28a25uf25gd25gZn5WU4a5a9a13a14aH27a28a25wf25gd25gZn5WU4a5c9a13a14aD27a28a25yf25gd25gZn5WH7a3aj4a5e9a13a14az27a28a25Af25gd25gZn5WG7a8a6aj4a5g9a13a14ax34a25Bf25gd25gZn5WF7a8a5a6aj4a5i9a13a14aw34a25Af25gd25gZn5Wc1a2d13a14at11a12a8a5b6aj4a5k9a13a14ah11a12al34a25zf25gd25gZn5Wc4a5e9a13a14ap11a12a8a5d6aj4a5m9a13a14ad11a12a8a5am34a25yf25gd25gZn5Wc4a5g9a13a14al11a12a8a5f6aj4a5o9a13a14a11a12a8a5cn31a32a25wf25gd25gZn5Wc4a5i9a13a14ah11a12a8a5h6aj4a5q9a8a5ep31a32a25uf25gd25gZn5Wc4a5k9a13a14ad11a12a8a5j6aj4a5xh26ai31a32a25sf25gd25gZn5Wc4a5m9a13a14a11a12a8a5l6aj4a5xh25a26aj31a32a25qf25gd25gZn5Wc4a5o9a8a5n6aj4a5xh25b26ak31a32a25of25gd25gZn5Wc4a5E6aj4a5xh25c26al34a25nf25gd25gZn5Wc4a5E6aj4a5xh25d26al34a25mf25gd25gZn5Wc4a5E6aj4a5xh25e29a30ak31a32a25kf25gd25gZn5Wc4a5E6aj4a5xh25g29a30ak31a32a25e36a37ah25gd25gZn5Wc4a5E6aj4a5xh25i29a30ak31a32a25a36a37aj25gd25gZn5Wc4a5E6aj4a5xh25k29a30ax25gd25gZn5Wc4a5E6aj4a5xh25mx25gd25gZn5Wc4a5E6aj4a5xh25mx25gd25gZn5Wc4a5E6aj4a5xh25mr27a28a25kd25gZn5Wc4a5E6aj4a5xh25l36ap27a28a25md25gZn5Wc4a5E6aj4a5xh25j36a37ao27a28a25od25gZn5Wc4a5E6aj4a5xh25h36a37ao27a28a25qd25gZn5Wc4a5E6aj4a5xh25g35ao27a28a25sd25gZn5Wc4a5E6aj4a5xh25f35ao24a25ud25gZn5Wc4a5E6aj4a5xh25e35ac27a28a25a26ah24a25vd25gZn5Wc4a5E6aj4a5xh25d35ac24a25d26af24a25wd25gZn5Wc4a5E6aj4a5xh25c35ac24a25f22f25xd25gZn5Wc4a5E6aj4a5xh25b35ac24a25Ld25gZn5Wc4a5E6aj4a5xh25a35ad25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae25Md25gZn5Wc4a5E6aj4a5xh25ae34a25Ld25gZn5Wc4a5E6aj4a5xh25af34a25Kd25gZn5Wc4a5E6aj4a5xh25ag34a25Id25gZn5Wc4a5E6aj4a5xh25ah34a25F36a37aZy5Wc4a5E6aj4a5xh25a26ah34a25h33p25e36a37aZA5Wc4a5E6aj4a5xh25b26ah34a25g33p25c36a37aZC5Wc4a5E6aj4a5xh25c26ah34a25f33p25b35aZE5Wc4a5E6aj4a5xh25d26ah34a25e33p25a35aZF5Wc4a5E6aj4a5xh25e26ah31a32a25c33p35an27a28a29a30aZo5Wc4a5E6aj4a5xh25f26ai31a32a25a33n36a37am27a28a25d29a30aZm5Wc4a5E6aj4a5xh25g26aj31a32a33k36a37am27a28a25hZm5Wc4a5E6aj4a5xh25h26aI27a28a25jZm5Wc4a5E6aj4a5xh25i26aF27a28a25lZm5Wc4a5E6aj4a5xh25j26aC27a28a25n2h10aZd5Wc4a5E6aj4a5xh25k26az27a28a25p5h9a10aZc5Wc4a5E6aj4a5xh25l26aw27a28a25r5i9a10aZb5Wc4a5E6aj4a5xh25m26at27a28a25t5j9a10aZa5Wc4a5E6aj4a5xh25n26ar24a25v5k9a10aZ5Wc4a5E6aj4a5xh25o26ap24a25w5l9a10aY5Wc4a5E6aj4a5xh25p26an24a25x5m9a10aX5Wc4a5E6aj4a5xh25q26al24a25y5n9a2iO5Wc4a5E6aj4a5xh25r26aj24a25z5xO5Wc4a5E6aj4a5xh25s26ah24a25A5xO5Wc4a5E6aj4a5xh25t26af24a25B5xO5Wc4a5E6aj4a5xh25u26ad24a25C5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5xO5Wc4a5E6aj4a5xh25Z25e5x0O_`; 

const atoz = "abcdefghijklmnopqrstuvwxyzABCDEFGHIKLMNOPQRSTUVWXYZ";
let readIndex = 0;
let letter = "";
let value = "";

function readLetter() {
    letter = encoded.charAt(readIndex);
    readIndex++;
}

function readValue() {
    value = "";
    readLetter();
    while(!isNaN(letter)) {
        value = value + letter;
        readLetter();
    }
}

function decode() {
    readValue();
    if (Number(value) !== 1) throw new Error('Unsupported version: ' + value);
    readValue();
    const width = Number(value);
    readValue();
    const height = Number(value);

    const total = width * height;
    const tileGrid = new Array(total).fill(0);

    let tileIndex = 0;
    while (readIndex < encoded.length) {
        readValue();
        if (value === "") value = "0";
        const repeats = atoz.indexOf(letter) + 1;
        const tileVal = Number(value);
        for (let i = 0; i < repeats; i++) {
            if (tileIndex >= total) {
                tileIndex += (1 - total);
            }
            tileGrid[tileIndex] = tileVal;
            tileIndex += height;
        }
    }

    return {width, height, tileGrid};
}

const out = decode();
const {width, height, tileGrid} = out;

// Summary stats
let nonZero = 0;
const counts = {};
for (let i = 0; i < tileGrid.length; i++) {
    const t = tileGrid[i];
    if (t !== 0) nonZero++;
    counts[t] = (counts[t] || 0) + 1;
}

// Sort tile types by frequency
const freq = Object.keys(counts).map(k => ({tile: Number(k), count: counts[k]})).sort((a,b)=>b.count-a.count);

const spawnIndex = tileGrid.indexOf(49);
let spawn = null;
if (spawnIndex !== -1) {
    const sx = Math.floor(spawnIndex / height);
    const sy = spawnIndex % height;
    spawn = {index: spawnIndex, x: sx, y: sy};
}

console.log('Decoded level:');
console.log(' Width:', width);
console.log(' Height:', height);
console.log(' Total tiles:', tileGrid.length);
console.log(' Non-empty tiles:', nonZero);
console.log(' Top tiles by frequency:', freq.slice(0,10));
if (spawn) console.log(' Spawn tile (49) at index', spawn.index, '=> column x=', spawn.x, ', row y=', spawn.y);
else console.log(' No spawn tile (49) found');

// Print a small area around spawn if present
if (spawn) {
    const areaW = 30;
    const areaH = 12;
    const startX = Math.max(0, spawn.x - Math.floor(areaW/2));
    const startY = Math.max(0, spawn.y - Math.floor(areaH/2));

    console.log('\nSmall area around spawn (tile numbers, columns x rows):');
    for (let y = startY; y < Math.min(height, startY + areaH); y++) {
        let row = '';
        for (let x = startX; x < Math.min(width, startX + areaW); x++) {
            const idx = x * height + y;
            const t = tileGrid[idx];
            row += (t === 0 ? '.' : String(t).padStart(2,' ')) + ' ';
        }
        console.log(row);
    }
}

// Also print counts for some interesting tiles: 5 (solid), 49 (spawn), 25 (ice?), etc.
[5,49,25,24,7,15].forEach(t => {
    console.log('Tile', t, 'count =', counts[t]||0);
});
