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

// --- Premium Data Pools ---

const elementSynergyPool: Record<string, Record<string, { synergy: string; advice: string }>> = {
    "火": {
        "木": { synergy: "木は火を育てます。あなたの内なる情熱は、成長と学びによって大きく燃え上がるでしょう。知識を追求することで、魂の炎はさらに強く輝きます。", advice: "新しい学びの場に飛び込んでください。読書会やセミナーがあなたの人生を変える起爆剤になります。" },
        "火": { synergy: "火と火の共鳴。圧倒的な情熱とカリスマ性が備わっています。しかし燃え尽きに注意が必要です。自分を休ませる時間を意識的に作ることが大切です。", advice: "瞑想や入浴など、クールダウンの時間を毎日15分確保してください。" },
        "土": { synergy: "火は灰となって土を肥やします。あなたの行動力は、安定した基盤を築く力に変わります。堅実な計画と情熱のバランスが鍵です。", advice: "衝動的な決断を避け、3日間の「熟成期間」を設けてから行動に移しましょう。" },
        "金": { synergy: "火は金を鍛えます。あなたには物事の本質を見抜き、不要なものを削ぎ落とす力があります。シンプルさを追求することで真価が発揮されます。", advice: "身の回りの整理整頓から始めましょう。断捨離が運気の滞りを一掃します。" },
        "水": { synergy: "火と水の対立は、実は「蒸気」という新しいエネルギーを生み出します。葛藤を恐れず、異なる価値観との融合が飛躍のきっかけになります。", advice: "苦手だと思っている人にこそ、あなたの成長のヒントがあります。対話を心がけてください。" }
    },
    "土": {
        "木": { synergy: "土は木を育みます。あなたの安定した性質が、周囲の成長を支える大きな力になっています。サポート役としての才能が光る時期です。", advice: "後輩や部下の相談に積極的に乗ってください。その行為が巡り巡ってあなたに幸運をもたらします。" },
        "火": { synergy: "火の灰が土を豊かにするように、情熱的な経験があなたの人格を深めています。過去の挑戦が今の「器」の大きさを決めています。", advice: "過去の失敗を振り返り、そこから得た学びを書き出してみましょう。それがあなたの財産です。" },
        "土": { synergy: "土と土の安定。揺るぎない信頼感と忍耐力が備わっています。ただし、変化を恐れすぎるとチャンスを逃す可能性があります。", advice: "月に一度、普段行かない場所を訪れてください。小さな冒険が視野を広げます。" },
        "金": { synergy: "土から金が生まれます。あなたの地道な努力は、やがて輝く成果として結晶化するでしょう。焦らず、コツコツと続けることが最大の武器です。", advice: "日記や記録をつける習慣を始めましょう。積み重ねた記録が自信の源泉になります。" },
        "水": { synergy: "土は水を堰き止めます。感情のコントロールに優れたあなたは、混乱した状況でも冷静さを保てる稀有な存在です。", advice: "周囲が慌てている時こそ、あなたの出番。落ち着いた一言が場を救うでしょう。" }
    },
    "風": {
        "木": { synergy: "風は木を揺らし、種を遠くまで運びます。あなたのコミュニケーション能力が、新しい可能性の種を広い世界に届けます。", advice: "SNSやブログでの発信を強化してください。あなたの言葉は多くの人の心に届く力を持っています。" },
        "火": { synergy: "風は火を大きくします。あなたの知性と好奇心が、情熱的なプロジェクトを加速させるでしょう。アイデアを形にする絶好のタイミングです。", advice: "思いついたことはすぐにメモし、72時間以内に最初の一歩を踏み出してください。" },
        "土": { synergy: "風は土を耕します。固定観念を打ち破る柔軟な思考が、停滞した状況に新しい息吹を吹き込みます。", advice: "「それは無理」と言われたことにこそ、チャンスが眠っています。常識を疑う勇気を持ちましょう。" },
        "金": { synergy: "風と金の調和。鋭い分析力と軽やかなフットワークを併せ持つあなたは、ビジネスにおいて突出した才能を発揮します。", advice: "データや数字を味方につけてください。直感と論理の融合が最強の武器になります。" },
        "水": { synergy: "風が水面に波紋を広げるように、あなたの影響力は静かに、しかし確実に広がっていきます。焦らず、自然体でいることが最善の戦略です。", advice: "力を抜いて、流れに身を任せる時期です。無理に結果を求めないことが逆に最短ルートです。" }
    },
    "水": {
        "木": { synergy: "水は木を育てます。あなたの深い感受性と直感が、クリエイティブな才能の源泉となっています。芸術的な表現に挑戦する絶好の時期です。", advice: "絵を描く、音楽を聴く、詩を書くなど、創造的な活動に時間を使ってください。" },
        "火": { synergy: "水と火の交差。内面的な葛藤を抱えやすい時期ですが、それは「変容」の前兆です。蝶が蛹の中でもがくように、生まれ変わりの準備が進んでいます。", advice: "感情が揺れた時は、深呼吸を3回してから行動してください。一瞬の間が未来を変えます。" },
        "土": { synergy: "水は大地に沁み込み、地下水となって遠くまで届きます。表面には見えなくても、あなたの善意と真心は確実に人々の心に届いています。", advice: "見返りを求めず、小さな親切を続けてください。その積み重ねが大きな信頼の貯金になります。" },
        "金": { synergy: "金属が冷えると水滴を結ぶように、洗練された美意識と深い感性が融合しています。繊細さは弱さではなく、最大の強みです。", advice: "自分の美的感覚を信じてください。直感で「美しい」と感じたものが、あなたの幸運の道標です。" },
        "水": { synergy: "水と水の深い共鳴。底知れぬ直感力と共感能力を持つあなたは、人の心の奥底を読む力があります。カウンセラーや相談役としての才能が際立ちます。", advice: "周囲の感情を吸収しすぎないよう、自分だけの「聖域」を確保してください。一人の時間は贅沢ではなく必需品です。" }
    }
};

const powerStonePool = [
    { name: "アメジスト", desc: "直感力と精神的な安定を高める紫の守護石", color: "#9B59B6" },
    { name: "ローズクォーツ", desc: "愛と調和を呼び込むピンクの癒し石", color: "#FFB6C1" },
    { name: "シトリン", desc: "富と成功を引き寄せる太陽の黄金石", color: "#F1C40F" },
    { name: "ラピスラズリ", desc: "真実と知恵を司る深青の聖石", color: "#2980B9" },
    { name: "タイガーアイ", desc: "決断力と金運を高める虎目石", color: "#B8860B" },
    { name: "ムーンストーン", desc: "女性性と直感を増幅する月の涙", color: "#E8E8E8" },
    { name: "カーネリアン", desc: "行動力と生命力を活性化する紅の炎石", color: "#E74C3C" },
    { name: "翡翠（ジェイド）", desc: "調和と繁栄をもたらす東洋の至宝", color: "#2ECC71" },
    { name: "ガーネット", desc: "情熱と忠誠心を燃やす深紅の守護石", color: "#8B0000" },
    { name: "アクアマリン", desc: "心の波を鎮め、幸福な航海へ導く碧の石", color: "#7EC8E3" }
];

const luckyColorPool = [
    { name: "ロイヤルゴールド", hex: "#D4AF37", meaning: "豊かさと自己実現のエネルギー" },
    { name: "ミスティックパープル", hex: "#7B4FA0", meaning: "直感と霊性を高める神秘の色" },
    { name: "オーシャンブルー", hex: "#1B6B9A", meaning: "心の平穏と深い知恵の色" },
    { name: "サンセットコーラル", hex: "#E87461", meaning: "情熱と温もりを呼び覚ます色" },
    { name: "フォレストグリーン", hex: "#2D7D46", meaning: "成長と治癒を促す大地の色" },
    { name: "ミッドナイトネイビー", hex: "#1B2838", meaning: "集中力と品格を纏う夜の色" },
    { name: "シルバームーン", hex: "#C0C0C0", meaning: "浄化と再生を司る月光の色" },
    { name: "チェリーブロッサム", hex: "#FFB7C5", meaning: "新しい始まりと優しさの色" }
];

const luckyDirectionPool = [
    { name: "東", desc: "日の出の方角。新しい始まりとエネルギーの充填。朝、東の窓から光を浴びることで運気が高まります。" },
    { name: "南東", desc: "縁と発展の方角。人脈が広がり、良い情報が集まります。南東に花を飾ると吉。" },
    { name: "南", desc: "名声と情熱の方角。自己表現が認められ、注目を集める時期です。南向きのデスクで作業すると集中力が高まります。" },
    { name: "南西", desc: "家庭と安定の方角。家族や大切な人との絆が深まります。南西にクリスタルを置くと調和が生まれます。" },
    { name: "西", desc: "創造と豊穣の方角。金運とクリエイティビティが同時に高まる恵みの方角です。" },
    { name: "北西", desc: "後援と旅行の方角。メンターやサポーターが現れる暗示。北西に金属製のオブジェを飾ると吉。" },
    { name: "北", desc: "キャリアと使命の方角。人生の目的に関する重要な気づきが訪れます。静かな北の空間で瞑想を。" },
    { name: "北東", desc: "知識と変革の方角。学びと自己変容の波が押し寄せます。北東に本棚を置くと学びが加速します。" }
];

const tarotDeepPool = [
    { past: "あなたの魂は過去において「自由」を強く求めていました。制約を乗り越えた経験が、現在の精神的な強さの礎となっています。", present: "今まさに、あなたの潜在能力が目覚めようとしています。周囲のノイズに惑わされず、内なる声に従ってください。", future: "近い将来、あなたは「選択の分岐点」に立ちます。理性よりも心の声を信じた方が、より本質的な幸福に辿り着けるでしょう。" },
    { past: "幼少期に植えつけられた「完璧でなければならない」という思い込みが、無意識にあなたを縛っています。それを手放す時が来ました。", present: "あなたの創造力は今、最も豊かに実っています。日常の中に「美」を見出す感性が、周囲の人々をも癒しています。", future: "3ヶ月以内に、あなたの人生の新しい扉が開きます。それは予想外の方向からやってきますが、直感的に「これだ」と分かるでしょう。" },
    { past: "過去の人間関係で受けた傷が、あなたの共感能力を研ぎ澄ませました。痛みは最高の教師だったのです。", present: "あなたは今、周囲からの信頼と愛情に包まれています。それに気づいていないだけかもしれません。少し立ち止まって、感謝の気持ちを味わってください。", future: "やがて訪れる大きな転機は、あなたの「覚悟」が試される瞬間です。しかし恐れることはありません。あなたの魂はすでに答えを知っています。" }
];

const weeklyActionPool = [
    { action: "毎朝5分間、窓を開けて深呼吸をする", reason: "新鮮な気を体内に取り込むことで、一日のエネルギーレベルが大幅に向上します。特に「木」の氣を持つあなたにとって、自然との接点は生命線です。" },
    { action: "感謝ノートを毎晩3つ書く", reason: "感謝の振動数は528Hzと言われ、宇宙で最も強力な引き寄せの周波数です。毎晩書くことで、あなたの運命のチャンネルが幸運に同調します。" },
    { action: "利き手と反対の手で1分間歯磨きをする", reason: "脳の新しい回路を活性化させ、直感力を高める効果があります。占術的にも「逆位置」のエネルギーを取り入れることで、視野が広がります。" },
    { action: "お気に入りの香りのキャンドルを灯す時間を作る", reason: "火のエレメントは浄化と変容の象徴。キャンドルの炎を見つめることは、古来より瞑想の基本であり、心のノイズを消し去ります。" },
    { action: "週に一度、普段とは違うルートで帰宅する", reason: "ルーチンを崩すことで、運命の流れに新しい風穴を開けます。思いがけない発見や出会いが、人生を変える可能性を秘めています。" },
    { action: "鏡の前で自分に「今日もよく頑張ったね」と声をかける", reason: "自己肯定の言霊は、あなたのオーラを強化し、ネガティブなエネルギーからの防御壁を築きます。最も強力なお守りは、自分自身の言葉です。" },
    { action: "夜空を5分だけ見上げる時間を作る", reason: "星々の光は数千年前に放たれたもの。その光を受け取ることは、宇宙の悠久の時間と繋がることを意味します。悩みを相対化する最良の方法です。" },
    { action: "お財布の中の不要なレシートやカードを全て整理する", reason: "金運の通り道を綺麗にすることは、風水的に最も即効性のある開運行動です。お財布はあなたの「金運の神殿」と心得てください。" },
    { action: "白い花を一輪、玄関かデスクに飾る", reason: "白い花は浄化のシンボル。空間の氣を整え、良縁を呼び込む力があります。造花ではなく生花を選ぶことがポイントです。" }
];

const soulMessagePool = [
    "あなたの魂は、何度生まれ変わっても「愛すること」を選び続けています。その勇気こそが、あなたの最大の光です。",
    "宇宙があなたに用意している最高のギフトは、まだ届いていません。それは「今のあなた」が完成した時に、初めて受け取れるものです。",
    "あなたが今感じている不安は、蝶が蛹の中で感じる窮屈さと同じです。もうすぐ、美しい翼を広げる瞬間がやってきます。",
    "この世界にあなたが存在すること自体が、すでに奇跡であり、贈り物です。どうか自分を小さく見積もらないでください。",
    "あなたの笑顔は、誰かの暗闇を照らす灯台です。自分では気づいていなくても、あなたは確かに、誰かの希望になっています。",
    "運命の歯車は今、静かに、しかし確実に回り始めています。あなたがすべきことは、ただ自分を信じて歩み続けることだけです。"
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

const FiveElementsChart = ({ seed }: { seed: number }) => {
    const elements = ["木", "火", "土", "金", "水"];
    const values = elements.map((_, i) => 40 + ((seed * (i + 7)) % 55));
    const cx = 100, cy = 100, r = 70;
    const angleStep = (2 * Math.PI) / 5;

    const pointsOnCircle = (radius: number) =>
        elements.map((_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
        });

    const outerPoints = pointsOnCircle(r);
    const dataPoints = values.map((v, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const dr = r * (v / 100);
        return { x: cx + dr * Math.cos(angle), y: cy + dr * Math.sin(angle) };
    });

    return (
        <div className="flex flex-col items-center">
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
                    <text key={`v${i}`} x={p.x} y={p.y - 8} textAnchor="middle" fill="white" fontSize="9" opacity={0.7}>{values[i]}%</text>
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

export const luckyItemsPool = [
    "フローライトの原石", "朝陽を浴びた一杯の白湯", "古い洋書風のノート", "ゴールドのしおり",
    "ラベンダーのアロマオイル", "星空のポストカード", "シルクのナイトキャップ", "銀のティースプーン"
];

function App() {
    const [view, setView] = useState('top'); 
    const [form, setForm] = useState(() => {
        const saved = localStorage.getItem('stella_oracle_form');
        return saved ? JSON.parse(saved) : { name: '', birthDate: '', birthTime: '', theme: 'general' };
    });

    useEffect(() => {
        localStorage.setItem('stella_oracle_form', JSON.stringify(form));
    }, [form]);
    const [loadingText, setLoadingText] = useState('');
    const [score, setScore] = useState(0);
    const [seed, setSeed] = useState(0);
    const [fortune, setFortune] = useState<any>(null);
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
        
        const astrology = (astrologyPool as any)[theme][currentSeed % 3];
        const baziBase = baziPool[currentSeed % 3];
        const bazi = baziBase.replace("{stem}", stem.name).replace("{element}", stem.element);
        const tarot = tarotCards[currentSeed % 22];

        const luckyItems = [
            luckyItemsPool[currentSeed % 8],
            luckyItemsPool[(currentSeed + 1) % 8],
            luckyItemsPool[(currentSeed + 3) % 8],
            luckyItemsPool[(currentSeed + 5) % 8]
        ];

        // Premium extended data
        const zodiacElement = zodiac.element || "光";
        const stemElement = stem.element;
        const synergyData = (elementSynergyPool[zodiacElement] || elementSynergyPool["火"])[stemElement] || elementSynergyPool["火"]["木"];

        const powerStone1 = powerStonePool[currentSeed % powerStonePool.length];
        const powerStone2 = powerStonePool[(currentSeed + 4) % powerStonePool.length];
        const luckyColor = luckyColorPool[currentSeed % luckyColorPool.length];
        const luckyDirection = luckyDirectionPool[currentSeed % luckyDirectionPool.length];

        const tarotDeep = tarotDeepPool[currentSeed % tarotDeepPool.length];

        const actions = [
            weeklyActionPool[currentSeed % weeklyActionPool.length],
            weeklyActionPool[(currentSeed + 3) % weeklyActionPool.length],
            weeklyActionPool[(currentSeed + 6) % weeklyActionPool.length]
        ];

        const soulMessage = soulMessagePool[currentSeed % soulMessagePool.length];

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
                        desc: `周囲からの助力が最大化し、あなたの提案が「神託」のように受け入れられる時期です。特に${theme === 'work' ? '仕事の効率' : '心の調律'}において、比類なきセンスを発揮するでしょう。幸運の角度を形成するため、期待以上の好転が期待できます。`
                    },
                    { 
                        month: "3ヶ月目", title: "収穫 - 黄金の果実", 
                        desc: "驚くべき成果が手元に残ります。単なる成功ではなく、あなたの人生観を書き換えるほどの深い満足感を得るでしょう。この時期の出会いは、生涯を通じて支え合える絆が確定します。手に入れた豊かさを分かち合うことで、この幸運のサイクルは永遠のものとなります。" 
                    }
                ],
                synergy: synergyData,
                powerStones: [powerStone1, powerStone2],
                luckyColor,
                luckyDirection,
                tarotDeep,
                actions,
                soulMessage
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
                    {/* Section 1: Destiny Score (再掲 + 解説) */}
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
                            <div className="absolute top-0 right-0 p-8 opacity-10"><svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="1" /></svg></div>
                            <FateRhythmChart seed={seed} />
                            <div className="mt-8 text-sm leading-relaxed opacity-70 text-left">
                                <p>このバイオリズムチャートは、あなたの「運命の種（Seed値）」から算出された固有の波形です。黄金のラインは魂のエネルギー波動、青のラインは金運の潮流、紫のラインは愛の共鳴を示しています。3つのラインが交差するポイントが、特に重要な転機となります。</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Element Synergy */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>{fortune.zodiac.name}（{fortune.zodiac.element}）× {fortune.stem.name}（{fortune.stem.element}）の相性解析</h3>
                        <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border overflow-hidden">
                            <div className="flex items-center justify-center gap-6 mb-8">
                                <div className="glass px-6 py-3 rounded-full text-center">
                                    <div className="text-[10px] opacity-50 mb-1">西洋占星術</div>
                                    <div className="text-lg gold-text font-bold">{fortune.zodiac.name}</div>
                                    <div className="text-xs opacity-60">{fortune.zodiac.element}のエレメント</div>
                                </div>
                                <div className="text-2xl gold-text">×</div>
                                <div className="glass px-6 py-3 rounded-full text-center">
                                    <div className="text-[10px] opacity-50 mb-1">四柱推命</div>
                                    <div className="text-lg gold-text font-bold">{fortune.stem.name}</div>
                                    <div className="text-xs opacity-60">{fortune.stem.element}の五行</div>
                                </div>
                            </div>
                            <div className="space-y-6 text-left">
                                <div>
                                    <h4 className="text-[#D4AF37] text-xs mb-3 uppercase tracking-widest">融合の意味</h4>
                                    <p className="text-sm leading-relaxed opacity-80">{p.synergy.synergy}</p>
                                </div>
                                <div className="glass p-6 rounded-2xl border-[#D4AF37]/20 border">
                                    <h4 className="text-[#D4AF37] text-xs mb-3 uppercase tracking-widest">💡 具体的アドバイス</h4>
                                    <p className="text-sm leading-relaxed opacity-80">{p.synergy.advice}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Five Elements Balance */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>五行パワーバランス</h3>
                        <div className="glass p-10 rounded-[3rem] border-[#D4AF37]/30 border overflow-hidden">
                            <FiveElementsChart seed={seed} />
                            <p className="text-sm text-center mt-6 opacity-70 leading-relaxed">
                                五行（木・火・土・金・水）のバランスは、あなたの人生における「強み」と「補うべき領域」を示しています。
                                数値が高い要素はあなたの天性の才能、低い要素は意識的に育てることで人生の調和が生まれる領域です。
                            </p>
                        </div>
                    </section>

                    {/* Section 5: Tarot Deep */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>タロット深層リーディング — {fortune.tarot.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "過去の魂", icon: "🌙", text: p.tarotDeep.past },
                                { label: "現在の波動", icon: "☀️", text: p.tarotDeep.present },
                                { label: "未来の予兆", icon: "⭐", text: p.tarotDeep.future }
                            ].map((t, i) => (
                                <div key={i} className="glass p-8 rounded-3xl border-[#D4AF37]/20 border hover:border-[#D4AF37]/60 transition-all text-left">
                                    <div className="text-3xl mb-4">{t.icon}</div>
                                    <h4 className="text-[#D4AF37] text-xs mb-4 uppercase tracking-widest">{t.label}</h4>
                                    <p className="text-sm leading-relaxed opacity-80">{t.text}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 6: Monthly Timeline */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-12 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>宿命の三ヶ月年表</h3>
                        <div className="space-y-10 relative">
                            <div className="absolute left-[39px] top-4 bottom-4 w-px bg-white/10 hidden md:block"></div>
                            {p.monthly.map((m: any, idx: number) => (
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

                    {/* Section 8: Lucky Items + Power Stones + Color + Direction */}
                    <section>
                        <h3 className="flex items-center gap-4 text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase"><span className="w-12 h-px bg-[#D4AF37]"></span>開運アイテム＆エネルギーマップ</h3>
                        
                        {/* Power Stones */}
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

                        {/* Lucky Color & Direction */}
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

                        {/* Lucky Items */}
                        <div className="text-center">
                            <h4 className="text-[#D4AF37] text-xs tracking-[0.4em] mb-6 uppercase">ラッキーアイテム</h4>
                            <div className="flex justify-center gap-4 flex-wrap">
                                {fortune.luckyItems.map((item: string, i: number) => (
                                    <div key={i} className="glass px-6 py-3 rounded-full text-sm border-[#D4AF37]/30">{item}</div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Section 9: Soul Message */}
                    <section className="text-center">
                        <h3 className="text-[#D4AF37] text-xs tracking-[0.4em] mb-8 uppercase">✨ 魂からのメッセージ</h3>
                        <div className="glass p-12 rounded-[3rem] border-[#D4AF37] border max-w-2xl mx-auto relative overflow-hidden">
                            <div className="absolute top-4 right-4 text-6xl opacity-5">✨</div>
                            <div className="absolute bottom-4 left-4 text-6xl opacity-5">🌟</div>
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
