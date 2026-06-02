import { Era, Filters } from './types';

export const INITIAL_FILTERS: Filters = {
  temp: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 100,
  sepia: 0,
};

export const ERAS: Era[] = [
  {
    id: '1980s-tokyo',
    name: '1980年代東京',
    year: '1980 - 1989',
    location: '日本・新宿',
    description: '泡沫經濟最繁華的時期。霓虹燈遍布街頭、City Pop 音樂盛行，整座城市充滿高能量與未來感。',
    insight: '80年代攝影常具有高飽和與強烈對比，受到 Kodachrome 底片與霓虹燈光影響，形成鮮明的復古色調。',
    historicalFact:
      "1980年代日本正值泡沫經濟時期。大量霓虹招牌、廣告看板與夜生活文化，使東京夜景成為當時最具代表性的都市影像。",

    colorScience:
      "Kodachrome 與 Fujifilm 底片具有較高飽和度與強烈色彩表現，因此影像通常呈現鮮豔的紅色、藍色與紫色光源。",

    learningPoint:
      "高飽和度與高對比度是 1980 年代東京夜景的重要特徵。",
    clues: [
      '畫面不應該灰灰的，霓虹燈必須十分鮮豔。',
      '夜景雖然有陰影，但招牌與燈光應該很亮。',
      '亮部與暗部差距明顯。',
      '偏冷藍與偏暖粉光源同時存在。',
      '如果看起來像老照片，代表色彩不夠鮮豔。'

    ],
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=1200',
    target: {
      temp: 20,
      brightness: 110,
      contrast: 130,
      saturate: 150,
      grayscale: 0,
      sepia: 10,
    },
    initial: {
      temp: 0,
      brightness: 90,
      contrast: 100,
      saturate: 50,
      grayscale: 80,
      sepia: 0,
    },
  },
  {
    id: '1990s-taipei',
    name: '1990年代台北',
    year: '1993',
    location: '基隆・廟口夜市',
    description: '充滿懷舊感的夜市氛圍。溫暖的鎢絲燈泡、家庭式攤販，以及台灣夏夜特有的濕熱空氣。',
    insight: '90年代台灣的平價相機攝影常帶有偏黃暖色調，受到當時照明與沖洗技術影響。',
    historicalFact:
      "1990年代台灣夜市仍以鎢絲燈泡為主要照明來源，因此整體環境呈現溫暖黃色調。",

    colorScience:
      "鎢絲燈色溫約 2700K~3200K，因此照片常偏黃偏暖。",

    learningPoint:
      "調整色溫往暖色方向，可以更接近當時真實影像氛圍。",
    clues: [
      '黃色燈光是整體氛圍關鍵。',
      '不需要過度鮮豔。',
      '光線柔和且帶有生活感。',
      '夜晚環境應該溫暖而親切。',
      '若畫面偏藍，方向可能錯誤。'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&q=80&w=1200',
    target: {
      temp: 60,
      brightness: 105,
      contrast: 110,
      saturate: 110,
      grayscale: 0,
      sepia: 40,
    },
    initial: {
      temp: 0,
      brightness: 100,
      contrast: 100,
      saturate: 30,
      grayscale: 90,
      sepia: 0,
    },
  },
  {
    id: 'medieval-europe',
    name: '中世紀歐洲',
    year: '1250',
    location: '法國鄉村',
    description: '夕陽下寧靜的石造村莊。大地色系、天然材質，以及工業化前柔和而擴散的自然光。',
    insight: '中世紀風格常以低飽和的大地棕與苔綠呈現，反映當時天然顏料與石造建築的氛圍。',
    historicalFact:
      "中世紀並不存在攝影技術，現代作品通常透過藝術重建當時環境與色彩。",

    colorScience:
      "天然顏料飽和度較低，因此畫面多以棕色、灰綠色與土黃色為主。",

    learningPoint:
      "降低飽和度比提高飽和度更能呈現中世紀氛圍。",
    clues: [
      '不應出現鮮豔的現代色彩。',
      '石頭與木頭顏色應成為主體。',
      '黃昏陽光會帶來淡淡暖意。',
      '畫面較柔和，不需要太強烈反差。',
      '如果像現代旅遊照，通常飽和度太高。'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200',
    target: {
      temp: 40,
      brightness: 95,
      contrast: 105,
      saturate: 70,
      grayscale: 20,
      sepia: 30,
    },
    initial: {
      temp: 0,
      brightness: 110,
      contrast: 90,
      saturate: 10,
      grayscale: 100,
      sepia: 0,
    },
  },
  {
    id: '1920s-nyc',
    name: '爵士年代的紐約',
    year: '1925',
    location: '下曼哈頓',
    description: '咆哮的二〇年代。裝飾藝術風格的摩天大樓，以及現代都市文化的開端。',
    insight: '雖然20年代現實中其實色彩鮮豔，但人們的視覺記憶多來自高反差黑白底片。',
    historicalFact:
      "1920年代被稱為『咆哮的二〇年代』，美國經濟快速發展，紐約成為全球最重要的金融與文化中心之一。雖然當時已經出現彩色攝影技術，但成本高昂，因此大部分民眾留下的影像仍然以黑白底片為主。",

    colorScience:
      "早期黑白底片主要記錄亮度資訊而非色彩資訊，因此攝影師更重視光線與對比。高對比能讓建築輪廓、人物服裝與街景細節更加突出。",

    learningPoint:
      "黑白攝影重視明暗層次，高對比度比高飽和度更能呈現1920年代都市影像特色。",
    clues: [
      '幾乎不應該看到彩色。',
      '黑色要夠深。',
      '白色要夠亮。',
      '畫面反差很大。',
      '如果街景看起來有豐富色彩，就是錯誤方向。'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=1200',
    target: {
      temp: 0,
      brightness: 115,
      contrast: 140,
      saturate: 0,
      grayscale: 100,
      sepia: 5,
    },
    initial: {
      temp: 10,
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      sepia: 0,
    },
  },
  {
    id: 'showa-japan',
    name: '昭和時代日本',
    year: '1965',
    location: '東京・淺草',
    description: '昭和時代的商店街與電車文化。暖黃色燈光、木造建築與底片攝影形成濃厚的懷舊感。',
    insight: '昭和時代的影像記憶多偏暖黃與低飽和，受到底片沖洗與鎢絲燈照明影響。',
    historicalFact:
      "1960年代日本正處於高度經濟成長期。大量商店街、電車與家庭生活被底片相機記錄下來，形成今日人們熟悉的昭和懷舊印象。",

    colorScience:
      "當時家庭攝影主要使用彩色底片，加上鎢絲燈與日光燈普及，照片常出現偏黃、偏暖的色彩表現。長時間保存也容易讓底片產生泛黃現象。",

    learningPoint:
      "昭和時代影像通常帶有溫暖色調與較低飽和度，營造懷舊與生活感。",
  clues: [
      '應該帶有復古泛黃感。',
      '色彩不會非常鮮豔。',
      '木造建築與暖色燈光是重點。',
      '畫面應該給人懷舊感。',
      '若顏色鮮豔得像現代數位照片，通常過頭了。',
    ],
    imageUrl: 'https://i1-c.pinimg.com/1200x/c7/ee/d8/c7eed800ead41c0fcf25ba4210639676.jpg',
    target: {
      temp: 50,
      brightness: 95,
      contrast: 90,
      saturate: 75,
      grayscale: 10,
      sepia: 45,
    },
    initial: {
      temp: 0,
      brightness: 110,
      contrast: 110,
      saturate: 30,
      grayscale: 80,
      sepia: 0,
    },
  },
  {
    id: 'kowloon-city',
    name: '九龍城寨',
    year: '1986',
    location: '香港・九龍',
    description: '狹窄而潮濕的樓群彼此緊貼，錯綜複雜的巷道被霓虹燈與老舊招牌照亮。空氣中混雜著雨水、煙霧與人群的喧囂，形成壓迫而混亂的都市氛圍。',
    insight: '80年代香港夜景常帶有強烈霓虹光源、深陰影與綠藍色偏移。密集建築與潮濕空氣會讓燈光在牆面與地面產生朦朧反射。',
    historicalFact:
      "九龍城寨曾是世界上人口密度最高的居住區之一。密集的建築群、狹窄巷道與大量非法加建形成獨特的都市景觀，也成為許多電影與遊戲的靈感來源。",

    colorScience:
      "霓虹燈廣泛使用綠色、藍色與洋紅色光源，在潮濕環境中容易產生反射與散射效果。強烈色彩與深陰影形成高對比視覺風格。",

    learningPoint:
      "冷色調、高飽和度與強烈對比能更有效呈現九龍城寨的壓迫感與賽博龐克氛圍。",
  clues: [
      '整體應該偏冷。',
      '綠色與藍色燈光非常重要。',
      '陰影區域要夠深。',
      '光線集中在招牌與反射面。',
      '畫面應該有壓迫感與混亂感。'
    ],
    imageUrl: 'https://i1-c.pinimg.com/1200x/19/cb/6d/19cb6d5ae7efbe4fcb641d416511dd48.jpg',
    target: {
      temp: -40,
      brightness: 85,
      contrast: 155,
      saturate: 170,
      grayscale: 0,
      sepia: 0,
    },
    initial: {
      temp: 0,
      brightness: 110,
      contrast: 95,
      saturate: 35,
      grayscale: 75,
      sepia: 5,
    },
  },
  {
    id: 'vhs-era',
    name: 'VHS錄影帶年代',
    year: '1988',
    location: '美國郊區',
    description: '錄影帶與家庭攝影機盛行的年代。模糊畫質、偏色與掃描線成為那個時代最鮮明的記憶。',
    insight: 'VHS 錄影帶畫面常帶有偏紫色調、低解析度與明顯噪點，形成獨特的類比視覺風格。',
    historicalFact:
      "1980年代家庭錄影機與VHS錄影帶快速普及，許多家庭開始自行記錄生日、旅遊與日常生活，開啟了家庭影像保存的新時代。",

    colorScience:
      "VHS採用類比訊號儲存影像，因此容易出現雜訊、偏色、掃描線與解析度不足等問題。影像常帶有淡淡的紫色或紅色偏移。",

    learningPoint:
      "VHS影像並非追求清晰銳利，而是保留類比年代特有的色偏與噪點質感。",
    clues: [
      '顏色帶有些許偏紅或偏紫。',
      '不需要追求現代照片的銳利感。',
      '色彩比真實世界稍微誇張。',
      '畫面不應太黑。',
      '有一種家庭錄影帶的感覺。'
    ],
    imageUrl: 'https://i1-c.pinimg.com/1200x/41/bc/e2/41bce20e92fac661592b573595b82ffd.jpg',
    target: {
      temp: 15,
      brightness: 105,
      contrast: 85,
      saturate: 130,
      grayscale: 0,
      sepia: 5,
    },
    initial: {
      temp: 0,
      brightness: 100,
      contrast: 120,
      saturate: 50,
      grayscale: 60,
      sepia: 0,
    },
  },
  {
    id: 'silent-film-era',
    name: '黑白默片年代',
    year: '1927',
    location: '紐約・百老匯',
    description: '黑白默片盛行的年代。劇院燈光、濃厚陰影與銀鹽底片構成了早期電影獨特的視覺風格。',
    insight: '20年代默片影像常帶有極高對比、明顯底片顆粒與銀色高光。由於當時膠卷技術限制，畫面通常呈現強烈黑白反差。',
    historicalFact:
      "1927年是默片時代的重要轉折點，《The Jazz Singer》上映後有聲電影逐漸取代默片。當時電影主要使用銀鹽底片拍攝，並透過燈光塑造戲劇效果。",

    colorScience:
      "銀鹽底片對光線非常敏感，因此攝影師會利用強烈燈光與陰影增加畫面層次。由於沒有色彩資訊，高對比成為塑造情緒的重要手段。",

    learningPoint:
      "默片影像的重點是光影表現而非色彩表現，因此高對比黑白畫面最能還原時代特色。",
  clues: [
      '完全不需要彩色。',
      '黑色要非常深。',
      '白色要非常亮。',
      '強調光影而非色彩。',
      '若畫面看起來像彩色照片，方向錯誤。',
    ],
    imageUrl: 'https://assets.st-note.com/production/uploads/images/177913255/rectangle_large_type_2_2e4887f4c40803480805c72a789a2793.jpg?width=1280',
    target: {
      temp: 0,
      brightness: 115,
      contrast: 160,
      saturate: 0,
      grayscale: 100,
      sepia: 8,
    },
    initial: {
      temp: 15,
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      sepia: 0,
    },
  },
];