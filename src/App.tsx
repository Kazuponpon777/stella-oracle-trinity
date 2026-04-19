import { useState, useEffect } from 'react'
import { 
    tarotCards, astrologyPool, baziPool, timelineMilestonePool, 
    elementSynergyPool, powerStonePool, luckyColorPool, 
    luckyDirectionPool, tarotDeepPool, weeklyActionPool, 
    soulMessagePool, luckyItemsPool, cautionDayPool, 
    compatibleSignPool, luckyTimePool 
} from './fortuneData'

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

// --- Components ---

const FateRhythmChart = ({ seed }: { seed: number }) => {
    const W = 400, H = 200, PAD = 40, PADR = 20, PADT = 20, PADB = 30;
    const cw = W - PAD - PADR, ch = H - PADT - PADB;
    const months = ["現在", "1W", "2W", "3W", "1M", "5W", "6W", "7W", "2M", "9W", "10W", "11W", "3M"];
    const steps = months.length;

    const gen = (s: number, off: number) =>
        Array.from({ length: steps }, (_, i) => {
            const t = i / (steps - 1);
            return Math.max(15, Math.min(95, 55 + Math.sin((s + i * 30 + off) * 0.05) * 35 + Math.cos((s + i * 20 + off) * 0.03) * 15));
        });

    const lines = [
        { d: gen(seed, 0), color: "#D4AF37", label: "魂の成長" },
        { d: gen(seed + 100, 1000), color: "#60A5FA", label: "知性の波" },
        { d: gen(seed + 200, 2000), color: "#C084FC", label: "愛の交流" }
    ];

    return (
        <div className="w-full relative mt-6">
            <div className="flex justify-center gap-6 mb-4 text-[11px] tracking-widest">
                {lines.map((l, i) => (
                    <span key={i} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{backgroundColor: l.color}}></span><span style={{color: l.color}} className="opacity-80">{l.label}</span></span>
                ))}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: '260px' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
                    <line key={i} x1={PAD} y1={PADT + ch * v} x2={W - PADR} y2={PADT + ch * v} stroke="white" opacity="0.05" strokeWidth="1" />
                ))}
                {months.map((m, i) => {
                    const x = PAD + (cw * i) / (steps - 1);
                    return (
                        <g key={i}>
                            <line x1={x} y1={PADT} x2={x} y2={H - PADB} stroke="white" opacity="0.05" strokeWidth="1" />
                            <text x={x} y={H - 10} textAnchor="middle" fill="white" fontSize="9" opacity="0.3">{m}</text>
                        </g>
                    );
                })}
                {/* Data lines */}
                {lines.map((l, li) => {
                    const path = l.d.map((v, i) => {
                        const x = PAD + (cw * i) / (steps - 1);
                        const y = H - PADB - (ch * (v - 15)) / 80;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ');
                    return (
                        <path key={li} d={path} fill="none" stroke={l.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line" />
                    );
                })}
            </svg>
        </div>
    );
};

const FiveElementsChart = ({ stem }: { stem: { name: string, element: string } }) => {
    const elements = ["木", "火", "土", "金", "水"];
    const center = 100;
    const radius = 60;
    
    return (
        <div className="flex justify-center mb-8">
            <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx={center} cy={center} r={radius + 10} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="1" />
                {elements.map((el, i) => {
                    const angle = (i * 72 - 90) * (Math.PI / 180);
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    const isStrong = el === stem.element;
                    return (
                        <g key={el}>
                            <circle cx={x} cy={y} r="18" fill={isStrong ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)"} stroke={isStrong ? "#D4AF37" : "rgba(212,175,55,0.3)"} strokeWidth="1" />
                            <text x={x} y={y + 5} textAnchor="middle" fill={isStrong ? "#D4AF37" : "white"} fontSize="12" fontWeight={isStrong ? "bold" : "normal"}>{el}</text>
                        </g>
                    );
                })}
                {/* Cycle lines */}
                {elements.map((_, i) => {
                    const angle1 = (i * 72 - 90) * (Math.PI / 180);
                    const angle2 = (((i + 1) % 5) * 72 - 90) * (Math.PI / 180);
                    const x1 = center + (radius - 18) * Math.cos(angle1);
                    const y1 = center + (radius - 18) * Math.sin(angle1);
                    const x2 = center + (radius - 18) * Math.cos(angle2);
                    const y2 = center + (radius - 18) * Math.sin(angle2);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" opacity="0.2" strokeDasharray="2,2" />;
                })}
            </svg>
        </div>
    );
};

const RadarChart = ({ seed }: { seed: number }) => {
    const elements = ["運気", "愛", "財", "健康", "仕事", "直感"];
    const values = elements.map((_, i) => 60 + ((seed + i * 13) % 35));
    const cx = 100, cy = 100, r = 70;
    
    const pointsOnCircle = (radius: number) => elements.map((_, i) => {
        const angle = (i * 60 - 90) * (Math.PI / 180);
        return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });

    const outerPoints = pointsOnCircle(r);
    const dataPoints = elements.map((_, i) => {
        const radius = (values[i] / 100) * r;
        const angle = (i * 60 - 90) * (Math.PI / 180);
        return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    });

    return (
        <div className="flex justify-center mb-10">
            <svg width="220" height="220" viewBox="0 0 200 200">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((s, si) => (
                    <polygon key={si} points={pointsOnCircle(r * s).map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity={0.2} />
                ))}
                {outerPoints.map((p, i) => (
                    <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#D4AF37" strokeWidth="0.5" opacity={0.2} />
                ))}
                <polygon points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(212,175,55,0.15)" stroke="#D4AF37" strokeWidth="2" />
                {dataPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#D4AF37" />
                ))}
                {outerPoints.map((p, i) => (
                    <text key={i} x={p.x} y={p.y + (p.y < cy ? -12 : 16)} textAnchor="middle" fill="#D4AF37" fontSize="12" fontWeight="bold">{elements[i]}</text>
                ))}
                {dataPoints.map((p, i) => (
                    <text key={`v${i}`} x={p.x} y={p.y - 8} textAnchor="middle" fill="white" fontSize="9" opacity="0.7">{values[i]}%</text>
                ))}
            </svg>
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

function App() {
    const [view, setView] = useState('top'); 
    const [form, setForm] = useState(() => {
        const saved = localStorage.getItem('stella_oracle_form');
        return saved ? JSON.parse(saved) : { name: '', birthDate: '', birthTime: '', theme: 'general' };
    });

    const [seed, setSeed] = useState(0);
    const [fortune, setFortune] = useState<any>(null);
    const [score, setScore] = useState(0);
    const [loadingText, setLoadingText] = useState('');
    const [hasAccessKey, setHasAccessKey] = useState(false);

    useEffect(() => {
        if (form.name) localStorage.setItem('stella_oracle_form', JSON.stringify(form));
    }, [form]);

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
        
        // Add current date to seed for more variety on repeat visits
        const today = new Date();
        const dateStr = today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString();
        const dateSeed = hashCode(dateStr);
        const dynamicSeed = currentSeed + dateSeed;

        const astrology = (astrologyPool as any)[theme][dynamicSeed % (astrologyPool[theme].length)];
        const baziBase = baziPool[dynamicSeed % baziPool.length];
        const bazi = baziBase.replace(/\{stem\}/g, stem.name).replace(/\{element\}/g, stem.element);
        const tarot = tarotCards[dynamicSeed % tarotCards.length];

        const luckyItems = [
            luckyItemsPool[dynamicSeed % luckyItemsPool.length],
            luckyItemsPool[(dynamicSeed + 1) % luckyItemsPool.length],
            luckyItemsPool[(dynamicSeed + 3) % luckyItemsPool.length],
            luckyItemsPool[(dynamicSeed + 5) % luckyItemsPool.length]
        ];

        // Premium extended data
        const zodiacElement = zodiac.element || "光";
        const stemElement = stem.element;
        const synergyData = (elementSynergyPool[zodiacElement] || elementSynergyPool["火"])[stemElement] || elementSynergyPool["火"]["木"];

        const powerStone1 = powerStonePool[dynamicSeed % powerStonePool.length];
        const powerStone2 = powerStonePool[(dynamicSeed + 4) % powerStonePool.length];
        const luckyColor = luckyColorPool[dynamicSeed % luckyColorPool.length];
        const luckyDirection = luckyDirectionPool[dynamicSeed % luckyDirectionPool.length];

        const tarotDeep = tarotDeepPool[dynamicSeed % tarotDeepPool.length];

        const actions = [
            weeklyActionPool[dynamicSeed % weeklyActionPool.length],
            weeklyActionPool[(dynamicSeed + 3) % weeklyActionPool.length],
            weeklyActionPool[(dynamicSeed + 6) % weeklyActionPool.length]
        ];

        const soulMessage = soulMessagePool[dynamicSeed % soulMessagePool.length];

        // Dynamic Timeline Generation
        const milestones = (timelineMilestonePool as any)[theme] || timelineMilestonePool.general;
        const m = milestones[dynamicSeed % milestones.length];
        const monthly = [
            { month: "1ヶ月目", title: m.month1.title, desc: m.month1.desc },
            { month: "2ヶ月目", title: m.month2.title, desc: m.month2.desc },
            { month: "3ヶ月目", title: m.month3.title, desc: m.month3.desc }
        ];

        // New Premium Data
        const cautionDay = cautionDayPool[dynamicSeed % cautionDayPool.length];
        const compatibleSign = compatibleSignPool[zodiac.name as keyof typeof compatibleSignPool] || compatibleSignPool["牡羊座"];
        const luckyTime = luckyTimePool[today.getDay() === 0 ? 6 : today.getDay() - 1]; // Current day of week

        return {
            astrology: `${zodiac.name}のあなたへ。${astrology}`,
            bazi,
            tarot,
            luckyItems,
            zodiac,
            stem,
            premium: {
                intro: `今の${form.name}様は、人生の大きな転換期の入り口に立っています。${zodiac.name}の守護星の影響により、魂が新しいサイクルを求めています。四柱推命においては、${stem.name}の気が巡り始め、${stem.element}のエネルギーが道を開きます。この二つの聖なる流れを統合した鑑定から、あなたの輝かしい未来を解き明かします。`,
                monthly,
                synergy: synergyData,
                powerStones: [powerStone1, powerStone2],
                luckyColor,
                luckyDirection,
                tarotDeep,
                actions,
                soulMessage,
                cautionDay,
                compatibleSign,
                luckyTime
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
        const messages = ["天体の配置を解析中...", "深層命式を算出中...", "タロットの深淵へアクセス中...", "五行のバランスを計測中...", "運命の糸を統合しています..."];
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
            <div className="max-w-2xl w-full page-enter py-10 px-4 text-center">
                <div className="mb-12">
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
                    <div className="glass p-6 rounded-2xl relative overflow-hidden text-left"><span className="absolute -top-2 -right-2 text-4xl opacity-10">🌟</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">西洋占星術 ({fortune.zodiac.name})</h3><p className="text-sm leading-relaxed text-blue-100/80">{fortune.astrology}</p></div>
                    <div className="glass p-6 rounded-2xl relative overflow-hidden text-left"><span className="absolute -top-2 -right-2 text-4xl opacity-10">☯️</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">四柱推命 ({fortune.stem.name})</h3><p className="text-sm leading-relaxed text-purple-100/80">{fortune.bazi}</p></div>
                    <div className="glass p-6 rounded-2xl relative overflow-hidden text-left"><span className="absolute -top-2 -right-2 text-4xl opacity-10">🃏</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">タロット</h3><p className="text-xs font-bold text-[#D4AF37] mb-2">{fortune.tarot.name}</p><p className="text-sm leading-relaxed text-indigo-100/80">{fortune.tarot.desc}</p></div>
                </div>
                <button onClick={() => setView('top')} className="text-[10px] opacity-30 hover:opacity-100 transition-all tracking-[0.4em] uppercase border-b border-white/20 pb-2">Back to Menu</button>
            </div>
        );
    };

    const renderPremiumResultView = () => {
        if (!fortune) return null;
        const p = fortune.premium;
        return (
            <div className="max-w-4xl w-full page-enter py-20 px-6">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-block px-6 py-2 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] tracking-[0.5em] mb-6 uppercase bg-[#D4AF37]/5">Premium Reading</div>
                    <h2 className="text-5xl font-bold gold-text tracking-[0.2em] mb-6">深淵なる運命の託宣</h2>
                    <CelestialIllustration />
                    <div className="max-w-xl mx-auto text-[#E6E6FA]/80 leading-relaxed font-light text-sm italic">{p.intro}</div>
                </div>

                <div className="space-y-24">
                    {/* Section 1: Destiny Score */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>Destiny Score 深層解析</h3>
                        <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="relative flex-shrink-0">
                                    <svg width="180" height="180">
                                        <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="12" />
                                        <circle cx="90" cy="90" r="80" fill="none" stroke="#D4AF37" strokeWidth="12" strokeLinecap="round" className="score-circle" style={{'--score': score} as any} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-bold gold-text">{score}</span>
                                        <span className="text-[10px] opacity-60 tracking-widest">DESTINY SCORE</span>
                                    </div>
                                </div>
                                <div className="text-left space-y-4">
                                    <p className="text-sm leading-relaxed opacity-80">
                                        あなたのDestiny Scoreは <span className="text-[#D4AF37] font-bold">{score}</span> です。
                                        {score >= 90 ? "これは極めて稀な高得点であり、宇宙があなたの味方をしている証拠です。今こそ大胆な行動を起こすべき時です。" :
                                         score >= 80 ? "非常に恵まれた運気の中にいます。特に対人関係において、あなたの魅力が際立つ時期です。積極的に人と会うことで運命が加速します。" :
                                         score >= 70 ? "安定した上昇気流に乗っています。焦らず着実に進むことで、確実に目標に近づいています。小さな成功体験を積み重ねてください。" :
                                         "内省と充電の時期です。今は派手な行動よりも、自分の内面を見つめ直すことが最も効果的な開運法です。"}
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        <div className="glass px-4 py-2 rounded-full text-[10px]"><span className="text-[#D4AF37]">総合力</span> {Math.min(99, score + (seed % 5))}%</div>
                                        <div className="glass px-4 py-2 rounded-full text-[10px]"><span className="text-blue-400">直感力</span> {Math.min(99, 60 + (seed % 35))}%</div>
                                        <div className="glass px-4 py-2 rounded-full text-[10px]"><span className="text-purple-400">魅力度</span> {Math.min(99, 65 + (seed % 30))}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Biorhythm */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>運命のバイオリズム解析</h3>
                        <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border overflow-hidden relative">
                            <FateRhythmChart seed={seed} />
                            <div className="mt-8 text-sm leading-relaxed opacity-70 text-left">
                                <p>このバイオリズムチャートは、あなたの「運命の種（Seed値）」から算出された固有の波形です。黄金のラインは魂のエネルギー波動、青のラインは知性の潮流、紫のラインは愛の共鳴を示しています。3つのラインが交差するポイントが、特に重要な転機となります。</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Element Synergy */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>エレメント・シナジー（相性解析）</h3>
                        <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border overflow-hidden">
                            <FiveElementsChart stem={fortune.stem} />
                            <div className="space-y-6 text-left">
                                <div className="glass p-6 rounded-2xl border-white/5 bg-white/5">
                                    <h4 className="text-[#D4AF37] font-bold text-sm mb-2">{fortune.zodiac.name}（{fortune.zodiac.element}）× {fortune.stem.name}（{fortune.stem.element}）</h4>
                                    <p className="text-sm leading-relaxed opacity-80">{p.synergy.synergy}</p>
                                </div>
                                <div className="p-6 border-l-2 border-[#D4AF37]">
                                    <h4 className="text-[10px] uppercase tracking-widest opacity-50 mb-2">天からの助言</h4>
                                    <p className="text-sm font-medium">{p.synergy.advice}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Deep Tarot */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>タロット・ディープリーディング</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass p-8 rounded-3xl border-white/5 bg-white/5 text-left">
                                <div className="text-[10px] opacity-40 mb-4 uppercase tracking-tighter">Past / 起源</div>
                                <p className="text-sm leading-relaxed">{p.tarotDeep.past}</p>
                            </div>
                            <div className="glass p-8 rounded-3xl border-[#D4AF37]/30 border bg-[#D4AF37]/5 text-left">
                                <div className="text-[10px] gold-text mb-4 uppercase tracking-tighter">Present / 現在</div>
                                <p className="text-sm leading-relaxed">{p.tarotDeep.present}</p>
                            </div>
                            <div className="glass p-8 rounded-3xl border-white/5 bg-white/5 text-left">
                                <div className="text-[10px] opacity-40 mb-4 uppercase tracking-tighter">Future / 到達</div>
                                <p className="text-sm leading-relaxed">{p.tarotDeep.future}</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Radar Chart */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>鑑定レーダーチャート</h3>
                        <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border">
                            <RadarChart seed={seed} />
                            <div className="text-xs opacity-50 italic">※このチャートは、天体の角度と命式の強弱から算出された、あなたの現在のポテンシャル分布です。</div>
                        </div>
                    </section>

                    {/* Section 6: Timeline */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>これからの3ヶ月の航路</h3>
                        <div className="space-y-4">
                            {p.monthly.map((m: any, i: number) => (
                                <div key={i} className="glass p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center text-left border-white/5 hover:border-[#D4AF37]/30 transition-all">
                                    <div className="w-24 flex-shrink-0">
                                        <div className="text-[10px] opacity-40 uppercase mb-1">{m.month}</div>
                                        <div className="text-lg gold-text font-bold">{m.title}</div>
                                    </div>
                                    <div className="flex-1 text-sm leading-[2] opacity-80">{m.desc}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 7: Weekly Actions */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>今週の開運アクション</h3>
                        <div className="space-y-6">
                            {p.actions.map((a: any, i: number) => (
                                <div key={i} className="glass p-8 rounded-3xl border-[#D4AF37]/20 border hover:border-[#D4AF37]/40 transition-all text-left">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-[#D4AF37] font-bold">{i + 1}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-[#D4AF37] font-bold text-sm mb-2">{a.action}</h4>
                                            <p className="text-sm leading-relaxed opacity-70">{a.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 8: Lucky Items & Power Stones */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>開運アイテム・エネルギーマップ</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {p.powerStones.map((stone: any, i: number) => (
                                <div key={i} className="glass p-8 rounded-3xl border-[#D4AF37]/20 border text-left flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `radial-gradient(circle, ${stone.color}40, ${stone.color}10)`, border: `2px solid ${stone.color}60` }}>
                                        <span className="text-lg">💎</span>
                                    </div>
                                    <div>
                                        <h4 className="text-[#D4AF37] font-bold text-sm mb-1">{stone.name}</h4>
                                        <p className="text-xs opacity-70">{stone.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="glass p-8 rounded-3xl border-[#D4AF37]/20 border text-left">
                                <h4 className="text-[#D4AF37] text-xs mb-4 uppercase tracking-widest">🎨 ラッキーカラー</h4>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-white/20" style={{ backgroundColor: p.luckyColor.hex }}></div>
                                    <div>
                                        <div className="text-sm font-bold">{p.luckyColor.name}</div>
                                        <div className="text-[10px] opacity-50">{p.luckyColor.hex}</div>
                                    </div>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed">{p.luckyColor.meaning}</p>
                            </div>
                            <div className="glass p-8 rounded-3xl border-[#D4AF37]/20 border text-left">
                                <h4 className="text-[#D4AF37] text-xs mb-4 uppercase tracking-widest">🧭 開運の方角</h4>
                                <div className="text-2xl gold-text font-bold mb-3">{p.luckyDirection.name}</div>
                                <p className="text-xs opacity-70 leading-relaxed">{p.luckyDirection.desc}</p>
                            </div>
                        </div>

                        <div className="text-center">
                            <h4 className="text-[#D4AF37] text-xs tracking-[0.4em] mb-6 uppercase">ラッキーアイテム</h4>
                            <div className="flex justify-center gap-4 flex-wrap">
                                {fortune.luckyItems.map((item: string, i: number) => (
                                    <div key={i} className="glass px-6 py-3 rounded-full text-sm border-[#D4AF37]/30">{item}</div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* NEW Section 9: Special Insights */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>深層鑑定・特別インサイト</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Caution Day */}
                            <div className="glass p-8 rounded-3xl border-[#D4AF37]/20 border text-left">
                                <h4 className="text-[#D4AF37] text-xs mb-4 uppercase tracking-widest flex items-center gap-2">⚠️ 今月の注意日 - {p.cautionDay.day}</h4>
                                <div className="text-sm font-bold mb-2">タイプ：{p.cautionDay.type}</div>
                                <p className="text-xs opacity-70 leading-relaxed">{p.cautionDay.advice}</p>
                            </div>
                            {/* Lucky Time */}
                            <div className="glass p-8 rounded-3xl border-[#D4AF37]/20 border text-left">
                                <h4 className="text-[#D4AF37] text-xs mb-4 uppercase tracking-widest flex items-center gap-2">🕒 本日のラッキータイム</h4>
                                <div className="text-sm font-bold mb-2 text-[#D4AF37]">{p.luckyTime.day} / {p.luckyTime.time}</div>
                                <p className="text-xs opacity-70 leading-relaxed">{p.luckyTime.desc}</p>
                            </div>
                        </div>
                        
                        {/* Compatible Signs */}
                        <div className="glass p-8 rounded-3xl border-[#D4AF37]/20 border text-left mt-6">
                            <h4 className="text-[#D4AF37] text-xs mb-6 uppercase tracking-widest">💠 相性の良い運命の星座</h4>
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] opacity-50 mb-2 uppercase tracking-tighter">Best Resonance (最高)</div>
                                    <div className="flex gap-4">
                                        {p.compatibleSign.best.map((s: string) => (
                                            <div key={s} className="px-4 py-2 bg-[#D4AF37]/10 rounded-lg text-sm font-bold gold-text border border-[#D4AF37]/30">{s}</div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] opacity-50 mb-2 uppercase tracking-tighter">Good Harmony (良好)</div>
                                    <div className="flex gap-4 flex-wrap">
                                        {p.compatibleSign.good.map((s: string) => (
                                            <div key={s} className="px-4 py-2 bg-white/5 rounded-lg text-sm border border-white/10">{s}</div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs opacity-70 leading-relaxed italic border-t border-white/10 pt-4 mt-4 text-[#D4AF37]">{p.compatibleSign.advice}</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 10: Soul Message */}
                    <section className="text-center">
                        <h3 className="text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase">✨ 魂からのメッセージ</h3>
                        <div className="glass p-12 rounded-[3rem] border-[#D4AF37] border max-w-2xl mx-auto relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-6xl opacity-5">✨</div>
                            <div className="absolute bottom-4 left-4 text-6xl opacity-5">🔱</div>
                            <p className="text-lg leading-[2.5] font-light italic gold-text">{p.soulMessage}</p>
                        </div>
                    </section>

                    {/* Close button */}
                    <div className="text-center"><button onClick={() => setView('top')} className="text-[10px] opacity-30 hover:opacity-100 transition-all tracking-[0.4em] uppercase border-b border-white/20 pb-2">Close Destiny Reading</button></div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#0B1021]">
            <StarField />
            <main className="relative z-10 w-full flex justify-center items-center">
                {view === 'top' && renderTopView()}
                {view === 'loading' && renderLoadingView()}
                {view === 'result' && renderResultView()}
                {view === 'premium_result' && renderPremiumResultView()}
            </main>
        </div>
    );
}

export default App
