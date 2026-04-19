import { useState, useEffect } from 'react'

// --- Utility Functions ---

const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

const getZodiacSign = (dateStr: string) => {
    if (!dateStr) return { name: "星の導き", element: "光" };
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const signs = [
        { name: "山羊座", start: [12, 22], end: [1, 19], element: "土" },
        { name: "水瓶座", start: [1, 20], end: [2, 18], element: "風" },
        { name: "魚座", start: [2, 19], end: [3, 20], element: "水" },
        { name: "牡羊座", start: [3, 21], end: [4, 19], element: "火" },
        { name: "牡牛座", start: [4, 20], end: [5, 20], element: "土" },
        { name: "双子座", start: [5, 21], end: [6, 21], element: "風" },
        { name: "蟹座", start: [6, 22], end: [7, 22], element: "水" },
        { name: "獅子座", start: [7, 23], end: [8, 22], element: "火" },
        { name: "乙女座", start: [8, 23], end: [9, 22], element: "土" },
        { name: "天秤座", start: [9, 23], end: [10, 23], element: "風" },
        { name: "蠍座", start: [10, 24], end: [11, 22], element: "水" },
        { name: "射手座", start: [11, 23], end: [12, 21], element: "火" }
    ];

    const sign = signs.find(s => {
        if (s.name === "山羊座" && (month === 12 || month === 1)) {
            return (month === 12 && day >= 22) || (month === 1 && day <= 19);
        }
        return (month === s.start[0] && day >= s.start[1]) || (month === s.end[0] && day <= s.end[1]);
    }) || signs[0];

    return sign;
};

const getTenStem = (year: number) => {
    const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    const elements = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"];
    const idx = (year - 4) % 10;
    const stemIdx = idx < 0 ? idx + 10 : idx;
    return { name: stems[stemIdx], element: elements[stemIdx] };
};

const tarotCards = [
    { name: "愚者 (The Fool)", desc: "新しい始まり、自由、無限の可能性。恐れずに一歩踏み出しましょう。" },
    { name: "魔術師 (The Magician)", desc: "創造力、意志の力、スキルの開花。あなたはすでに必要なものをすべて持っています。" },
    { name: "女教皇 (The High Priestess)", desc: "直感、神秘、静寂。心の声に耳を傾けることで、真実が見えてきます。" },
    { name: "女帝 (The Empress)", desc: "豊穣、母性、愛。周囲からの恵みを受け入れ、育む時期です。" },
    { name: "皇帝 (The Emperor)", desc: "権威、秩序、安定。確固たる目標を持ち、自らの足で立つことが成功への道です。" },
    { name: "教皇 (The Hierophant)", desc: "精神性、守護、導き。伝統や信頼できるアドバイスがあなたを助けます。" },
    { name: "恋人 (The Lovers)", desc: "調和、選択、深い結びつき。心に従う選択が、最高の未来を引き寄せます。" },
    { name: "戦車 (The Chariot)", desc: "勝利、前進、自制心。強い意志を持って突き進めば、どんな壁も超えられます。" },
    { name: "力 (Strength)", desc: "忍耐、慈しみ、内なる強さ。力づくではなく、優しさで状況をコントロールできます。" },
    { name: "隠者 (The Hermit)", desc: "内省、慎重、真理の探求。一人の時間を作り、自分自身と向き合う時です。" },
    { name: "運命の輪 (Wheel of Fortune)", desc: "好転、変化、運命の転換。チャンスの波が訪れています。迷わず乗ってください。" },
    { name: "正義 (Justice)", desc: "均衡、公正、真実。正しい判断ができる時です。誠実さが報われます。" },
    { name: "吊るされた男 (The Hanged Man)", desc: "修行、視点の転換。一見停滞していても、それは魂が成長するための貴重な時間です。" },
    { name: "死神 (Death)", desc: "終焉と再生。古いものを脱ぎ捨て、新しい自分へと生まれ変わる好機です。" },
    { name: "節制 (Temperance)", desc: "調和、癒し、中庸。異なる要素が混ざり合い、新しい価値が生まれる兆しです。" },
    { name: "悪魔 (The Devil)", desc: "執着、誘惑。自分を縛っている依存心に気づき、解放されるタイミングです。" },
    { name: "塔 (The Tower)", desc: "電撃的な変化、崩壊と真実。殻を破ることで、より強固な基盤が築かれます。" },
    { name: "星 (The Star)", desc: "希望、インスピレーション、浄化. あなたの願いは天に届き、静かな光が道を照らします。" },
    { name: "月 (The Moon)", desc: "不安、潜在意識、幻想。曖昧な状況こそが、あなたの感受性を磨いてくれます。" },
    { name: "太陽 (The Sun)", desc: "成功、祝福、活力。すべてが明るく照らされ、幸福感に満たされる時期です。" },
    { name: "審判 (Judgement)", desc: "復活、覚醒、報い。過去の努力が認められ、新しいステージへと召還されます。" },
    { name: "世界 (The World)", desc: "完成、統合、新章の始まり。あなたの旅は一つの頂点に達し、完璧な調和が訪れます。" }
];

const astrologyPool = {
    general: [
        "木星があなたの第十室を照らしています。これまでの努力が形となり、社会的な評価が高まる時期です。",
        "土星の厳しい影響が抜け、自由な風が吹き始めています。型にハマらない行動が幸運の鍵となります。",
        "天王星が革新的なエネルギーを注いでいます。突然の閃きや、新しいテクノロジーとの出会いが道を開きます。"
    ],
    love: [
        "金星の影響により、あなたの魅力が最大化されています。意外な人物からのアプローチがあるかもしれません。",
        "海王星が夢見心地な出会いを演出します。言葉を超えた深い共鳴を感じる相手が現れる暗示です。",
        "火星が情熱に火をつけます。奥手だった自分を捨て、ストレートな表現をすることで心が通じ合うでしょう。"
    ],
    work: [
        "水星が知性を研ぎ澄ませています。交渉や情報の整理において、あなたの右に出る者はいません。",
        "太陽があなたのキャリアを力強くバックアップしています。リーダーシップを発揮することで周囲を導けます。",
        "冥王星が根本的な変容を求めています。今の仕事のスタイルを大胆に変えることで、真の才能が覚醒します。"
    ]
};

const baziPool = [
    "「{stem}」の気が強まり、{element}の性質があなたの行動をサポートします。揺るぎない信念を持つことで運気が安定します。",
    "「{stem}」の浄化作用により、過去の呪縛から解き放たれます。軽やかな心で、新しい一歩を踏み出す時です。",
    "「{stem}」の成長運。{element}のように高く伸びゆくエネルギーが満ちており、新しいスキルの習得が大きな実を結びます。"
];

// --- Components ---

const FateRhythmChart = ({ seed }: { seed: number }) => {
    const generateData = (s: number, offset: number) => {
        const data = [];
        for (let i = 0; i <= 200; i += 50) {
            const val = 60 + (Math.sin((s + i + offset) * 0.05) * 30);
            const val2 = 50 + (Math.cos((s + i * 1.5 + offset) * 0.03) * 35);
            const val3 = 70 + (Math.sin((s + i * 0.8 + offset) * 0.04) * 20);
            data.push({ x: i, y: Math.max(30, Math.min(95, val)), y2: Math.max(20, Math.min(98, val2)), y3: Math.max(40, Math.min(90, val3)) });
        }
        return data;
    };
    
    const data = generateData(seed, 0);
    const points = data.map(d => `${d.x},${100 - d.y}`).join(' ');
    const points2 = data.map(d => `${d.x},${100 - d.y2}`).join(' ');
    const points3 = data.map(d => `${d.x},${100 - d.y3}`).join(' ');
    
    return (
        <div className="w-full h-48 relative mt-10 p-4 glass rounded-3xl">
            <div className="absolute top-4 left-6 flex gap-4 text-[10px] tracking-widest text-[#D4AF37]/60">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>魂の活力</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span>金運の波</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400"></span>愛の共鳴</span>
            </div>
            <svg viewBox="0 0 200 100" className="w-full h-full">
                <polyline points={points} className="chart-line stroke-[#D4AF37]" strokeDasharray="300" strokeDashoffset="300"><animate attributeName="stroke-dashoffset" from="300" to="0" dur="2s" fill="freeze" /></polyline>
                <polyline points={points2} className="chart-line stroke-blue-400" opacity="0.6" strokeDasharray="300" strokeDashoffset="300"><animate attributeName="stroke-dashoffset" from="300" to="0" dur="2s" begin="0.5s" fill="freeze" /></polyline>
                <polyline points={points3} className="chart-line stroke-purple-400" opacity="0.6" strokeDasharray="300" strokeDashoffset="300"><animate attributeName="stroke-dashoffset" from="300" to="0" dur="2s" begin="1s" fill="freeze" /></polyline>
                {data.map((d, i) => (<circle key={i} cx={d.x} cy={100 - d.y} r="2" className="chart-point" />))}
            </svg>
            <div className="absolute bottom-2 left-0 w-full flex justify-between px-6 text-[8px] opacity-40 uppercase tracking-[0.2em]"><span>Now</span><span>1 Month</span><span>2 Months</span><span>3 Months</span></div>
        </div>
    );
};

const CelestialIllustration = () => (
    <div className="flex justify-center mb-8">
        <svg width="120" height="120" viewBox="0 0 100 100" className="opacity-40">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2,2" />
            {[...Array(12)].map((_, i) => (<line key={i} x1="50" y1="5" x2="50" y2="15" transform={`rotate(${i * 30} 50 50)`} stroke="#D4AF37" strokeWidth="0.5" />))}
            <path d="M50 20 L60 50 L50 80 L40 50 Z" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="5" fill="#D4AF37" />
        </svg>
    </div>
);

const StarField = () => {
    const [stars] = useState(() => [...Array(100)].map((_, i) => ({ id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, size: `${Math.random() * 2 + 1}px`, duration: `${Math.random() * 3 + 2}s` })));
    return (<div className="star-field">{stars.map(s => <div key={s.id} className="star" style={{top: s.top, left: s.left, width: s.size, height: s.size, '--duration': s.duration} as any} />)}</div>);
};

export const luckyItemsPool = [
    "フローライトの原石", "朝陽を浴びた一杯の白湯", "古い洋書風のノート", "ゴールドのしおり",
    "ラベンダーのアロマオイル", "星空のポストカード", "シルクのナイトキャップ", "銀のティースプーン"
];

function App() {
    const [view, setView] = useState('top'); 
    const [form, setForm] = useState({ name: '', birthDate: '', birthTime: '', theme: 'general' });
    const [loadingText, setLoadingText] = useState('');
    const [score, setScore] = useState(0);
    const [seed, setSeed] = useState(0);
    const [fortune, setFortune] = useState<any>(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [hasAccessKey, setHasAccessKey] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('unlock') === 'stella_premium') {
            setHasAccessKey(true);
        }
    }, []);

    const generateFortune = (currentSeed: number, theme: string) => {
        const zodiac = getZodiacSign(form.birthDate);
        const birthYear = form.birthDate ? new Date(form.birthDate).getFullYear() : 2000;
        const stem = getTenStem(birthYear);
        
        // Use seed to pick items from pools
        const astrology = (astrologyPool as any)[theme][currentSeed % 3];
        const baziBase = baziPool[currentSeed % 3];
        const bazi = baziBase.replace("{stem}", stem.name).replace("{element}", stem.element);
        const tarot = tarotCards[currentSeed % 22];

        // Unique premium parts
        const luckyItems = [
            luckyItemsPool[currentSeed % 8],
            luckyItemsPool[(currentSeed + 1) % 8]
        ];

        return {
            astrology: `${zodiac.name}のあなたへ。${astrology}`,
            bazi,
            tarot,
            luckyItems,
            zodiac,
            stem,
            premium: {
                intro: `今の${form.name}様は、人生の大きな転換期の入り口に立っています。${zodiac.name}の守護星の影響により、魂が新しいサイクルを求めています。四柱推命においては、${stem.name}の気が巡り始め、${stem.element}のエネルギーが道を開きます。この二つの聖なる流れを統合した鑑定から、あなたの輝かしい未来を解き明かします。`,
                monthly: [
                    { 
                        month: "1ヶ月目", title: "胎動 - 内なる覚醒", 
                        desc: "環境に微細な変化が現れます。これまで当たり前だと思っていたルーチンに違和感を感じ始めるでしょう。それは魂が「本来の居場所」への移動を望んでいる証拠です。対人関係では、古い知人から意外な提案が舞い込む暗示があります。" 
                    },
                    { 
                        month: "2ヶ月目", title: "開花 - 青き光の顕現", 
                        desc: "周囲からの助力が最大化し、あなたの提案が「神託」のように受け入れられる時期です。特に${theme === 'work' ? '仕事の効率' : '心の調律'}において、比類なきセンスを発揮するでしょう。幸運の角度を形成するため、期待以上の好転が期待できます。" 
                    },
                    { 
                        month: "3ヶ月目", title: "収穫 - 黄金の果実", 
                        desc: "驚くべき成果が手元に残ります。単なる成功ではなく、あなたの人生観を書き換えるほどの深い満足感を得るでしょう。この時期の出会いは、生涯を通じて支え合える絆が確定します。手に入れた豊かさを分かち合うことで、この幸運のサイクルは永遠のものとなります。" 
                    }
                ]
            }
        };
    };

    const startFortune = () => {
        if (!form.name || !form.birthDate) {
            alert('お名前と生年月日を入力してください。');
            return;
        }
        
        const generatedSeed = hashCode(form.name + form.birthDate + form.birthTime);
        setSeed(generatedSeed);
        setFortune(generateFortune(generatedSeed, form.theme));
        
        setView('loading');
        const messages = ["天体の配置を解析中...", "深層命式を算出中...", "タロットの深淵へアクセス中...", "運命の糸を統合しています..."];
        let i = 0;
        const interval = setInterval(() => {
            if (i < messages.length) {
                setLoadingText(messages[i]);
                i++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    const calculatedScore = 70 + (generatedSeed % 28);
                    setScore(calculatedScore);
                    if (hasAccessKey) {
                        setView('premium_result');
                    } else {
                        setView('result');
                    }
                }, 500);
            }
        }, 1000);
    };

    const unlockPremium = () => {
        setShowPremiumModal(false);
        setView('loading');
        setLoadingText('プレミアム領域にアクセス中...');
        setTimeout(() => { setView('premium_result'); }, 2000);
    };

    const renderTopView = () => (
        <div className="max-w-md w-full page-enter">
            {hasAccessKey && (
                <div className="mb-6 flex justify-center">
                    <div className="glass px-4 py-2 rounded-full border-[#D4AF37] flex items-center gap-2 animate-pulse">
                        <span className="text-[10px] gold-text tracking-[0.3em] font-bold">PREMIUM ACCESS ACTIVE</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4AF37"><path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z"/></svg>
                    </div>
                </div>
            )}
            <div className="text-center mb-10">
                <div className="inline-block mb-4">
                    <svg width="60" height="60" viewBox="0 0 100 100" fill="#D4AF37"><path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"/></svg>
                </div>
                <h1 className="text-4xl font-bold tracking-[0.2em] gold-text mb-2 font-cormorant">STELLA ORACLE</h1>
                <p className="text-xs tracking-[0.4em] opacity-60">TRINITY鑑定</p>
            </div>
            <div className="glass rounded-[2rem] p-8 space-y-6">
                <input type="text" placeholder="お名前" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:outline-none focus:border-[#D4AF37]" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm" value={form.birthDate} onChange={(e) => setForm({...form, birthDate: e.target.value})} />
                    <input type="time" className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm" value={form.birthTime} onChange={(e) => setForm({...form, birthTime: e.target.value})} />
                </div>
                <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl appearance-none cursor-pointer" value={form.theme} onChange={(e: any) => setForm({...form, theme: e.target.value})}>
                    <option value="general">総合運勢</option>
                    <option value="love">情熱と恋愛</option>
                    <option value="work">天職業と成功</option>
                </select>
                <button onClick={startFortune} className="btn-gold w-full py-5 rounded-full font-bold tracking-widest text-lg">運命を視る</button>
            </div>
        </div>
    );

    const renderLoadingView = () => (
        <div className="text-center page-enter">
            <div className="relative mb-12 flex justify-center">
                <svg width="200" height="200" viewBox="0 0 100 100" className="magic-circle opacity-40">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="5,5" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="#D4AF37" strokeWidth="2" />
                    <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" fill="#D4AF37" opacity="0.4" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div></div>
            </div>
            <p className="text-xl font-light gold-text tracking-widest transition-opacity duration-500">{loadingText}</p>
        </div>
    );

    const renderResultView = () => {
        if (!fortune) return null;
        return (
            <div className="max-w-2xl w-full page-enter py-10 px-4">
                <div className="text-center mb-12">
                    <h2 className="text-2xl gold-text mb-8 tracking-[0.3em]">あなたの鑑定結果</h2>
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <svg width="150" height="150">
                                <circle cx="75" cy="75" r="70" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="10" />
                                <circle cx="75" cy="75" r="70" fill="none" stroke="#D4AF37" strokeWidth="10" strokeLinecap="round" className="score-circle" style={{'--score': score} as any} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold">{score}</span><span className="text-[10px] opacity-60">Destiny Score</span></div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass p-6 rounded-2xl relative overflow-hidden"><span className="absolute -top-2 -right-2 text-4xl opacity-10">🌟</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">西洋占星術 ({fortune.zodiac.name})</h3><p className="text-sm leading-relaxed text-blue-100/80">{fortune.astrology}</p></div>
                    <div className="glass p-6 rounded-2xl relative overflow-hidden"><span className="absolute -top-2 -right-2 text-4xl opacity-10">☯️</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">四柱推命 ({fortune.stem.name})</h3><p className="text-sm leading-relaxed text-purple-100/80">{fortune.bazi}</p></div>
                    <div className="glass p-6 rounded-2xl relative overflow-hidden"><span className="absolute -top-2 -right-2 text-4xl opacity-10">🃏</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">タロット</h3><p className="text-xs font-bold text-[#D4AF37] mb-2">{fortune.tarot.name}</p><p className="text-sm leading-relaxed text-indigo-100/80">{fortune.tarot.desc}</p></div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <button onClick={() => setShowPremiumModal(true)} className="btn-gold px-12 py-5 rounded-full font-bold text-lg animate-pulse">さらに深く、3ヶ月後の運命を知る (プレミアム鑑定へ)</button>
                </div>
            </div>
        );
    };

    const renderPremiumResultView = () => {
        if (!fortune) return null;
        return (
            <div className="max-w-4xl w-full page-enter py-20 px-6">
                <div className="text-center mb-20">
                    <div className="inline-block px-6 py-2 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] tracking-[0.5em] mb-6 uppercase bg-[#D4AF37]/5">Premium Reading</div>
                    <h2 className="text-5xl font-bold gold-text tracking-[0.2em] mb-6">深淵なる運命の託宣</h2>
                    <CelestialIllustration /><div className="max-w-xl mx-auto text-[#E6E6FA]/80 leading-relaxed font-light text-sm italic">{fortune.premium.intro}</div>
                </div>
                <div className="space-y-24">
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>運命のバイオリズム解析</h3>
                        <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border-2 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="1" /></svg></div>
                            <FateRhythmChart seed={seed} />
                        </div>
                    </section>
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-12 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>宿命の三ヶ月年表</h3>
                        <div className="space-y-10 relative">
                            <div className="absolute left-[39px] top-4 bottom-4 w-px bg-white/10 hidden md:block"></div>
                            {fortune.premium.monthly.map((m: any, idx: number) => (
                                <div key={idx} className="glass p-10 rounded-3xl flex flex-col md:flex-row gap-10 items-start hover:border-[#D4AF37]/60 transition-all group">
                                    <div className="text-center md:min-w-[100px] relative">
                                        <div className="text-[10px] opacity-40 mb-2 uppercase tracking-widest">{m.month}</div>
                                        <div className="text-2xl gold-text font-bold mb-2 transition-transform group-hover:scale-110">{m.title}</div>
                                        <div className="w-4 h-4 bg-[#D4AF37] rounded-full absolute -left-[54px] top-12 hidden md:block border-4 border-[#0B1021]"></div>
                                    </div>
                                    <div className="flex-1 text-sm leading-[2] opacity-80">{m.desc}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="text-center">
                        <h3 className="text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase">あなたのラッキーアイテム</h3>
                        <div className="flex justify-center gap-4 flex-wrap">
                            {fortune.luckyItems.map((item: string, i: number) => (
                                <div key={i} className="glass px-6 py-3 rounded-full text-sm border-[#D4AF37]/30">{item}</div>
                            ))}
                        </div>
                    </section>
                    <div className="text-center"><button onClick={() => setView('top')} className="text-[10px] opacity-30 hover:opacity-100 transition-all tracking-[0.4em] uppercase border-b border-white/20 pb-2">Close Destiny Reading</button></div>
                </div>
            </div>
        );
    };

    const renderPremiumModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm page-enter">
            <div className="glass max-w-sm w-full p-12 rounded-[3rem] text-center border-[#D4AF37] border-2 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
                <h3 className="text-2xl gold-text font-bold mb-4 uppercase">Unlock Your Destiny</h3>
                <p className="text-sm opacity-80 mb-10 font-light">3ヶ月後の全貌を解禁します。</p>
                <div className="text-4xl font-bold text-white mb-8">¥1,000</div>
                <button onClick={unlockPremium} className="btn-gold w-full py-5 rounded-full mb-8 text-white font-bold tracking-[0.2em]">今すぐ解禁する</button>
                <button onClick={() => setShowPremiumModal(false)} className="text-[10px] opacity-40 hover:opacity-100 uppercase tracking-widest">Cancel</button>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#0B1021]">
            <StarField />
            <main className="relative z-10 w-full flex justify-center items-center">
                {view === 'top' && renderTopView()}
                {view === 'loading' && renderLoadingView()}
                {view === 'result' && renderResultView()}
                {view === 'premium_result' && renderPremiumResultView()}
                {showPremiumModal && renderPremiumModal()}
            </main>
        </div>
    );
}

export default App
