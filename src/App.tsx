import { useState, useEffect } from 'react'

// Data Mockups
const fortuneData = {
    general: {
        astrology: "木星があなたの第十室を照らしています。これまでの努力が形となり、社会的な評価が高まる時期です。",
        bazi: "「庚（かのえ）」の気が強まり、決断力が研ぎ澄まされます。迷わず突き進むことで運気が開けます。",
        tarot: { name: "運命の輪 (Wheel of Fortune)", desc: "好転のチャンスが到来しています。変化を恐れず、その波に乗ってください。" }
    },
    love: {
        astrology: "金星の影響により、あなたの魅力が最大化されています。意外な人物からのアプローチがあるかもしれません。",
        bazi: "「癸（みずのと）」の浄化作用により、過去の呪縛から解き放たれ、新しい愛が芽生える予感です。",
        tarot: { name: "恋人 (The Lovers)", desc: "直感を信じて選ぶことが成功の鍵。心からの調和を感じられる完璧な出会いが近づいています。" }
    },
    work: {
        astrology: "火星が行動力をブーストさせています。リーダーシップを発揮することで、プロジェクトを成功に導けるでしょう。",
        bazi: "「甲（きのえ）」の成長運。新しいスキルを学ぶことで、将来的な大きな収入源が確保されます。",
        tarot: { name: "皇帝 (The Emperor)", desc: "基盤を固める時。あなたの確固たる信念が、周囲を動かし大きな成果を生みます。" }
    }
};

const premiumData = {
    intro: `今のあなたは、人生の大きな転換期の入り口に立っています。西洋占星術で見れば、土星の回帰が一段落し、魂が新しいサイクルを求めています。四柱推命においては、これまであなたを縛っていた「偏官」の厳しさが和らぎ、自由な表現を司る「食神」の気が巡り始めました。この二つの聖なる流れを統合した鑑定から、あなたの輝かしい未来を解き明かします。`,
    monthly: [
        { 
            month: "1ヶ月目", title: "胎動 - 内なる覚醒", 
            desc: "環境に微細な変化が現れます。これまで当たり前だと思っていたルーチンに違和感を感じ始めるでしょう。それは魂が「本来の居場所」への移動を望んでいる証拠です。対人関係では、古い知人から意外なビジネス、あるいはプライベート、いずれかの重大な提案が舞い込む暗示があります。恐れずに聞き、心に留めておいてください。" 
        },
        { 
            month: "2ヶ月目", title: "開花 - 青き光の顕現", 
            desc: "周囲からの助力が最大化し、あなたの提案が「神託」のように受け入れられる時期です。特にクリエイティブな分野や、誰かを導く役割において、比類なきリーダーシップを発揮するでしょう。金星が幸運の角度を形成するため、金銭的なボーナスや予期せぬ評価の向上が期待できます。自分自身の感性を疑わず、直感に従って行動するのが正解です。" 
        },
        { 
            month: "3ヶ月目", title: "収穫 - 黄金の果実", 
            desc: "驚くべき成果が手元に残ります。単なる成功ではなく、あなたの人生観を書き換えるほどの深い満足感を得るでしょう。この時期の出会いは「ソウルメイト」との繋がりが強く、生涯を通じて支え合えるパートナー、あるいは師となる人物との絆が確定します。手に入れた豊かさを分かち合うことで、この幸運のサイクルは永遠のものとなります。" 
        }
    ],
    destinyPartner: {
        profile: "知的な眼差しを持ち、沈黙さえも心地よく感じさせる穏やかな人物。専門職や教育、あるいは伝統を重んじる分野で活躍しています。彼（彼女）は、あなたがまだ気づいていない「本当の才能」を一目で見抜き、それを引き出す鍵となるでしょう。年齢はあなたに近いか、少しだけ年上の可能性があります。",
        location: "「水」と「知」の気配が混ざり合う場所。具体的には、静かな噴水のある公立図書館、歴史的な回廊、あるいは最新のテクノロジーと伝統美が融合した建築物の中。そこで青い小物を身につけている人物に注目してください。",
        trigger: "共通の「理想」について語り合う機会が訪れます。形式的な会話ではなく、あなたが心底情熱を注いでいることについて語る時、二人の魂は共鳴し始めます。"
    },
    wealthAdvice: "金運においては、今まさに「浄化」のフェーズです。不要なサブスクリプション、使っていない高級品、そして「安物買いの習慣」を捨てることで、本物の富が流れ込む空位を創り出してください。特に5月15日から22日の間、北西の方角から届く情報に、数年後の資産価値を一変させるヒントが含まれています。直感的に「本物」だと感じるものにのみ、エネルギーを投資してください。",
    triadSynergy: "あなたの三つの鑑定結果は「再生」というテーマで強く結びついています。西洋占星術の木星の慈愛、四柱推命の甲（木）の成長力、さらにタロットの「運命の輪」。これらが三位一体となることで、あなたの運勢は爆発的な加速を見せるでしょう。今、立ち止まることは退歩と同じです。迷わず輝かしい未来へ、手を伸ばしてください。"
};

export const luckyItems = ["フローライトの原石", "朝陽を浴びた一杯の白湯", "古い洋書風のノート", "ゴールドのしおり"];

const FateRhythmChart = () => {
    const data = [{ x: 0, y: 70, y2: 40, y3: 60 }, { x: 50, y: 85, y2: 60, y3: 50 }, { x: 100, y: 80, y2: 90, y3: 75 }, { x: 150, y: 95, y2: 70, y3: 90 }, { x: 200, y: 90, y2: 85, y3: 85 }];
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

function App() {
    const [view, setView] = useState('top'); 
    const [form, setForm] = useState({ name: '', birthDate: '', theme: 'general' });
    const [loadingText, setLoadingText] = useState('');
    const [score, setScore] = useState(0);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [hasAccessKey, setHasAccessKey] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('unlock') === 'stella_premium') {
            setHasAccessKey(true);
        }
    }, []);

    const startFortune = () => {
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
                    setScore(Math.floor(Math.random() * 30) + 70);
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
                    <input type="date" className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
                    <input type="time" className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
                </div>
                <select className="w-full bg-white/5 border border-white/10 p-4 rounded-xl appearance-none cursor-pointer" onChange={(e: any) => setForm({...form, theme: e.target.value})}>
                    <option value="general">総合運勢</option>
                    <option value="love">情熱と恋愛</option>
                    <option value="work">天職と成功</option>
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
        const currentFortune = (fortuneData as any)[form.theme];
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
                    <div className="glass p-6 rounded-2xl relative overflow-hidden"><span className="absolute -top-2 -right-2 text-4xl opacity-10">🌟</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">西洋占星術</h3><p className="text-sm leading-relaxed text-blue-100/80">{currentFortune.astrology}</p></div>
                    <div className="glass p-6 rounded-2xl relative overflow-hidden"><span className="absolute -top-2 -right-2 text-4xl opacity-10">☯️</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">四柱推命</h3><p className="text-sm leading-relaxed text-purple-100/80">{currentFortune.bazi}</p></div>
                    <div className="glass p-6 rounded-2xl relative overflow-hidden"><span className="absolute -top-2 -right-2 text-4xl opacity-10">🃏</span><h3 className="text-[#D4AF37] text-xs mb-4 uppercase border-b border-[#D4AF37]/30 pb-2">タロット</h3><p className="text-xs font-bold text-[#D4AF37] mb-2">{currentFortune.tarot.name}</p><p className="text-sm leading-relaxed text-indigo-100/80">{currentFortune.tarot.desc}</p></div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <button onClick={() => setShowPremiumModal(true)} className="btn-gold px-12 py-5 rounded-full font-bold text-lg animate-pulse">さらに深く、3ヶ月後の運命を知る (プレミアム鑑定へ)</button>
                </div>
            </div>
        );
    };

    const renderPremiumResultView = () => (
        <div className="max-w-4xl w-full page-enter py-20 px-6">
            <div className="text-center mb-20">
                <div className="inline-block px-6 py-2 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] tracking-[0.5em] mb-6 uppercase bg-[#D4AF37]/5">Premium Reading</div>
                <h2 className="text-5xl font-bold gold-text tracking-[0.2em] mb-6">深淵なる運命の託宣</h2>
                <CelestialIllustration /><div className="max-w-xl mx-auto text-[#E6E6FA]/80 leading-relaxed font-light text-sm italic">{premiumData.intro}</div>
            </div>
            <div className="space-y-24">
                <section>
                    <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>運命のバイオリズム解析</h3>
                    <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border-2 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="1" /></svg></div>
                        <FateRhythmChart />
                    </div>
                </section>
                <section>
                    <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-12 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>宿命の三ヶ月年表</h3>
                    <div className="space-y-10 relative">
                        <div className="absolute left-[39px] top-4 bottom-4 w-px bg-white/10 hidden md:block"></div>
                        {premiumData.monthly.map((m, idx) => (
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
                <div className="text-center"><button onClick={() => setView('top')} className="text-[10px] opacity-30 hover:opacity-100 transition-all tracking-[0.4em] uppercase border-b border-white/20 pb-2">Close Destiny Reading</button></div>
            </div>
        </div>
    );

    const renderPremiumModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm page-enter">
            <div className="glass max-w-sm w-full p-12 rounded-[3rem] text-center border-[#D4AF37] border-2 shadow-[0_0_60px_rgba(212,175,55,0.25)]">
                <h3 className="text-2xl gold-text font-bold mb-4 uppercase">Unlock Your Destiny</h3>
                <p className="text-sm opacity-80 mb-10 font-light">3ヶ月後の全貌を解禁します。</p>
                <div className="text-4xl font-bold text-white mb-8">¥3,200</div>
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
