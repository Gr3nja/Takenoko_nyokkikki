//難しいボロネーゼ計算みたいなのするところ　これは自分でもあんま理解してない。
function calculateAnalysis(n, m) {
    if (n > m) {
        return {
            successProb: 0,
            expectedTrials: Infinity,
            minTime: 0,
            avgTime: Infinity,
            variance: Infinity,
            stdDev: Infinity,
            percentile95: Infinity,
            percentile99: Infinity
        };
    }

    let prob = 1;
    for (let i = 0; i < n; i++) {
        prob *= (m - i) / m;
    }

    const expectedTrials = 1 / prob;
    const variance = (1 - prob) / (prob * prob);
    const stdDev = Math.sqrt(variance);

    const timePerRound = n;
    const minTime = timePerRound;
    const avgTime = expectedTrials * timePerRound;

    const percentile95 = Math.ceil(Math.log(0.05) / Math.log(1 - prob)) * timePerRound;
    const percentile99 = Math.ceil(Math.log(0.01) / Math.log(1 - prob)) * timePerRound;

    return {
        successProb: prob,
        expectedTrials,
        minTime,
        avgTime,
        variance,
        stdDev: stdDev * timePerRound,
        percentile95,
        percentile99
    };
}

function formatTime(seconds) {
    if (!isFinite(seconds)) return '∞';
    if (seconds < 60) return seconds.toFixed(1) + '秒';
    if (seconds < 3600) return (seconds / 60).toFixed(1) + '分';
    if (seconds < 86400) return (seconds / 3600).toFixed(1) + '時間';
    return (seconds / 86400).toFixed(1) + '日';
}

// とぅいんっていう感じの所
class HageTakenoko {
    constructor() {
        this.numPeople = 5;
        this.numChoices = 5;
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const numPeopleSlider = document.getElementById('numPeopleSlider');
        const numChoicesSlider = document.getElementById('numChoicesSlider');
        if (numPeopleSlider) {
            numPeopleSlider.addEventListener('input', (e) => {
                this.numPeople = parseInt(e.target.value);
                this.render();
            });
        }
        if (numChoicesSlider) {
            numChoicesSlider.addEventListener('input', (e) => {
                this.numChoices = parseInt(e.target.value);
                this.render();
            });
        }
    }

    createBarChart(data, title, xKey) {
        const width = 900;
        const height = 400;
        const padding = 50;

        const maxAvgTime = Math.max(...data.map(d => d.avgTime));
        const maxProb = Math.max(...data.map(d => d.probability));

        const xScale = (width - 2 * padding) / (data.length - 1);
        const yScale1 = (height - 2 * padding) / maxAvgTime;
        const yScale2 = (height - 2 * padding) / maxProb;

        let svg = `
            <div class="panel">
                <div class="panel-header cyan"> ${title}</div>
                <svg width="100%" height="400" viewBox="0 0 700 400" style="margin: 16px 0;">
                    <!-- Grid lines -->
                    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1" />
                    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1" />
        `;

        // 左のラベルの奴
        for (let i = 0; i <= 5; i++) {
            const y = height - padding - (i * (height - 2 * padding) / 5);
            const value = (i * maxAvgTime / 5).toFixed(0);
            svg += `
                <line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="#d1d5db" stroke-width="1" />
                <text x="${padding - 10}" y="${y + 4}" font-size="12" text-anchor="end" fill="#666">${formatTime(parseFloat(value))}</text>
            `;
        }

        // 右のやつ
        for (let i = 0; i <= 5; i++) {
            const y = height - padding - (i * (height - 2 * padding) / 5);
            const value = (i * maxProb / 5).toFixed(2);
            svg += `
                <text x="${width + 5}" y="${y + 4}" font-size="12" fill="#666">${value}%</text>
            `;
        }

        // 酒屋
        const barWidth = (width - 2 * padding) / (data.length * 2.5);
        data.forEach((d, i) => {
            const x = padding + i * xScale;
            const barSpacing = 5;
            
            // 酒屋１ (avgTime)
            const h1 = (d.avgTime / maxAvgTime) * (height - 2 * padding);
            svg += `<rect x="${x - barWidth / 2 - barSpacing}" y="${height - padding - h1}" width="${barWidth}" height="${h1}" fill="#82af3c" opacity="0.8" />`;
            
            // 酒屋２ (probability)
            const h2 = (d.probability / maxProb) * (height - 2 * padding);
            svg += `<rect x="${x + barWidth / 2 + barSpacing}" y="${height - padding - h2}" width="${barWidth}" height="${h2}" fill="#82cf3c" opacity="0.8" />`;
        });

        // XXXみたいなやつ
        data.forEach((d, i) => {
            const x = padding + i * xScale;
            const label = d[xKey];
            svg += `<text x="${x}" y="${height - padding + 20}" font-size="12" text-anchor="middle" fill="#666">${label}</text>`;
        });

        svg += `
                    <!-- Legend -->
                    <rect x="${padding}" y="10" width="12" height="12" fill="#82af3c" />
                    <text x="${padding + 20}" y="20" font-size="12" fill="#333">平均時間</text>
                    <rect x="${padding + 150}" y="10" width="12" height="12" fill="#82cf3c" />
                    <text x="${padding + 170}" y="20" font-size="12" fill="#333">成功確率(%)</text>
                </svg>
            </div>
        `;
        return svg;
    }

    createLineChart(data, title, xKey) {
        const width = 600;
        const height = 300;
        const padding = 50;

        const maxAvgTime = Math.max(...data.map(d => d.avgTime));
        const maxProb = Math.max(...data.map(d => d.probability));

        const xScale = (width - 2 * padding) / (data.length - 1);
        const yScale1 = (height - 2 * padding) / maxAvgTime;
        const yScale2 = (height - 2 * padding) / maxProb;

        let svg = `
            <div class="panel">
                <div class="panel-header teal"> ${title}</div>
                <svg width="100%" height="400" viewBox="0 0 700 400" style="margin: 16px 0;">
                    <!-- Grid lines -->
                    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1" />
                    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e5e7eb" stroke-width="1" />
        `;

        // shine head
        for (let i = 0; i <= 5; i++) {
            const y = height - padding - (i * (height - 2 * padding) / 5);
            const value = (i * maxAvgTime / 5).toFixed(0);
            svg += `
                <line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="#d1d5db" stroke-width="1" />
                <text x="${padding - 10}" y="${y + 4}" font-size="12" text-anchor="end" fill="#666">${formatTime(parseFloat(value))}</text>
            `;
        }

        // 右禿頭
        for (let i = 0; i <= 5; i++) {
            const y = height - padding - (i * (height - 2 * padding) / 5);
            const value = (i * maxProb / 5).toFixed(2);
            svg += `
                <text x="${width + 5}" y="${y + 4}" font-size="12" fill="#666">${value}%</text>
            `;
        }

        // 列禿頭
        let line1Points = '';
        data.forEach((d, i) => {
            const x = padding + i * xScale;
            const y = height - padding - (d.avgTime / maxAvgTime) * (height - 2 * padding);
            line1Points += `${x},${y} `;
        });
        svg += `<polyline points="${line1Points}" fill="none" stroke="#14b8a6" stroke-width="2" />`;

        // 禿頭２
        let line2Points = '';
        data.forEach((d, i) => {
            const x = padding + i * xScale;
            const y = height - padding - (d.probability / maxProb) * (height - 2 * padding);
            line2Points += `${x},${y} `;
        });
        svg += `<polyline points="${line2Points}" fill="none" stroke="#f59e0b" stroke-width="2" />`;
        data.forEach((d, i) => {
            const x = padding + i * xScale;
            const label = d[xKey];
            svg += `<text x="${x}" y="${height - padding + 20}" font-size="12" text-anchor="middle" fill="#666">${label}</text>`;
        });

        svg += `
                    <!-- Legend -->
                    <line x1="${padding}" y1="20" x2="${padding + 20}" y2="20" stroke="#14b8a6" stroke-width="2" />
                    <text x="${padding + 30}" y="25" font-size="12" fill="#333">平均時間</text>
                    <line x1="${padding + 150}" y1="20" x2="${padding + 170}" y2="20" stroke="#f59e0b" stroke-width="2" />
                    <text x="${padding + 180}" y="25" font-size="12" fill="#333">成功確率(%)</text>
                </svg>
            </div>
        `;
        return svg;
    }

    render() {
        const analysis = calculateAnalysis(this.numPeople, this.numChoices);
        const isImpossible = this.numPeople > this.numChoices;

        let html = `
            <div class="panel">
                <div class="panel-header blue">パラメータ設定</div>
                <div class="grid-2">
                    <div>
                        <label class="label">人数: <span class="label-value">${this.numPeople}</span></label>
                        <input type="range" id="numPeopleSlider" min="2" max="20" value="${this.numPeople}" />
                        <div class="range-labels"><span>2人</span><span>20人</span></div>
                    </div>
                    <div>
                        <label class="label">選択肢数: <span class="label-value">${this.numChoices}</span></label>
                        <input type="range" id="numChoicesSlider" min="2" max="25" value="${this.numChoices}" />
                        <div class="range-labels"><span>2個</span><span>25個</span></div>
                    </div>
                </div>
                <div class="info-box">
                    <p><strong>設定:</strong> ${this.numPeople}人が${this.numChoices}個の選択肢から選択します。</p>
                    <p><strong>1ラウンド:</strong> ${this.numPeople}人 × 1秒 = ${this.numPeople}秒</p>
                </div>
            </div>
        `;

        if (isImpossible) {
            html += `
                <div class="panel">
                    <div class="panel-header red">ちょっとだけなんていうか難しそうなな設定</div>
                    <div style="padding: 16px; color: #1f2937;">
                        <p>人数(${this.numPeople}人)が選択肢数(${this.numChoices}個)を上回っています。</p>
                        <p>全員が異なる数字を言うことはちょっとだけなんていうか難しいです。</p>
                        <p>選択肢数を増やしてください。</p>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="panel">
                    <div class="panel-header green">主要指標</div>
                    <div class="grid-4">
                        <div class="card-item green-50">
                            <div class="label-xs">成功確率</div>
                            <div class="value-bold value-green">${(analysis.successProb * 100).toFixed(4)}%</div>
                            <div class="value-small">1/${(1 / analysis.successProb).toFixed(0)}</div>
                        </div>
                        <div class="card-item blue-50">
                            <div class="label-xs">最低時間</div>
                            <div class="value-bold value-blue">${formatTime(analysis.minTime)}</div>
                            <div class="value-small">1ラウンド</div>
                        </div>
                        <div class="card-item purple-50">
                            <div class="label-xs">平均時間</div>
                            <div class="value-bold value-purple">${formatTime(analysis.avgTime)}</div>
                            <div class="value-small">期待値</div>
                        </div>
                        <div class="card-item orange-50">
                            <div class="label-xs">標準偏差</div>
                            <div class="value-bold value-orange">${formatTime(analysis.stdDev)}</div>
                            <div class="value-small">ばらつき</div>
                        </div>
                    </div>
                </div>
            `;

            // パーセン禿頭
            html += `
                <div class="panel">
                    <div class="panel-header indigo">時間のパーセンなんとか分布</div>
                    <div class="grid-3">
                        <div class="card-item indigo-50 text-center">
                            <div class="text-sm">50%の確率で</div>
                            <div class="value-bold value-indigo">${formatTime(analysis.avgTime / 2)}以内</div>
                        </div>
                        <div class="card-item indigo-50 text-center">
                            <div class="text-sm">95%の確率で</div>
                            <div class="value-bold value-indigo">${formatTime(analysis.percentile95)}以内</div>
                        </div>
                        <div class="card-item indigo-50 text-center">
                            <div class="text-sm">99%の確率で</div>
                            <div class="value-bold value-indigo">${formatTime(analysis.percentile99)}以内</div>
                        </div>
                    </div>
                </div>
            `;

            const comparisonData = [];
            for (let n = 2; n <= 15; n++) {
                const calc = calculateAnalysis(n, Math.max(n, this.numChoices));
                comparisonData.push({ people: n, avgTime: calc.avgTime, probability: calc.successProb * 100 });
            }
            html += this.createBarChart(comparisonData, `人数を増やした場合の影響（選択肢数: ${this.numChoices}個）`, 'people');

            const choiceComparisonData = [];
            for (let m = this.numPeople; m <= Math.max(15, this.numPeople + 5); m++) {
                const calc = calculateAnalysis(this.numPeople, m);
                choiceComparisonData.push({ choices: m, avgTime: calc.avgTime, probability: calc.successProb * 100 });
            }

            html += `
                <div class="panel">
                    <div class="panel-header gray">詳細分析</div>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-bold">✓ 確率の計算式</h3>
                            <div style="background-color: #f3f4f6; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px; margin: 8px 0; line-height: 1.4;">
                                P(success) = ${this.numChoices}/${this.numChoices} × ${this.numChoices-1}/${this.numChoices} × ... × ${this.numChoices-this.numPeople+1}/${this.numChoices}
                            </div>
                            <p>= ${(analysis.successProb).toExponential(6)}</p>
                        </div>
                        <div>
                            <h3 class="font-bold">✓ 期待値（幾何分布）</h3>
                            <p style="line-height: 1.6; margin: 8px 0;">E[試行回数] = 1/p = ${analysis.expectedTrials.toFixed(2)}ラウンド</p>
                            <p style="line-height: 1.6;">E[時間] = E[試行回数] × ${this.numPeople}秒 = ${analysis.avgTime.toFixed(2)}秒</p>
                        </div>
                        <div>
                            <h3 class="font-bold">✓ 分散と標準偏差</h3>
                            <p style="line-height: 1.6; margin: 8px 0;">Var[X] = (1-p)/p² = ${analysis.variance.toFixed(2)}</p>
                            <p style="line-height: 1.6;">σ = √Var = ${formatTime(analysis.stdDev)}</p>
                        </div>
                        <div>
                            <h3 class="font-bold">✓ 解釈</h3>
                            <p style="line-height: 1.6;">
                                このゲームを何度も繰り返した場合、平均的には<strong>${formatTime(analysis.avgTime)}</strong>かかります。
                                ただし、ばらつきが大きく、95%の確率では<strong>${formatTime(analysis.percentile95)}</strong>以内で終わります。
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }

        const app = document.getElementById('app');
        if (app) app.innerHTML = html;
        this.setupEventListeners();
    }
}

// 初期禿頭
new HageTakenoko();
