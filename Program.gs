/**
 * ============================================================
 *  今月のプログラム（パパが毎月 AI と一緒に書き換えるファイル）
 * ============================================================
 *
 *  - 毎月の変更は このファイルだけ。`npm run deploy` で 画面と いっしょに GitHub Pages へ（Apps Script は さわらない）
 *  - 子どもに見せる文字は「ひらがな＋1年生で習ったカタカナ・漢字」で書きます。
 *  - タスクは 4つで 固定です。id は変えないでください（記録の集計に使います）。
 *      shukudai … がっこうの しゅくだい（ひとまとめで 1こ。まいにち。ない ひも「やった」で OK）
 *      razkids  … ラズキッズ（えいご）
 *      dokusho  … どくは ノート（id は そのまま dokusho）
 *      sansu    … さんすう（math: true … アプリの「さんすう」タブで もんだいを とくと できた！になる）
 *  - days: 0=にち 1=げつ 2=か 3=すい 4=もく 5=きん 6=ど（省略すると毎日）
 *  - 素の JavaScript（var で宣言・関数呼び出しなし）で書いてください。
 */
var PROGRAM = {
  version: '2026-11',            // 月が変わったら更新（例: '2026-12'）
  appTitle: 'そだててできた',
  monthTitle: '11がつは しばけんを そだてよう！',

  // 見た目のテーマ
  theme: {
    color: '#E8873A',            // メインカラー（しばいろ）
    stamp: '🐾',                 // 1日ぜんぶできた日に押されるスタンプ
    confetti: ['🐾', '🦴', '⭐', '✨', '💛']
  },

  // 毎日のしゅくだい
  tasks: [
    { id: 'shukudai', label: 'しゅくだい',      icon: '🎒', stars: 1,                         hint: 'ない ひは「やった」で OK！' },
    { id: 'razkids',  label: 'ラズキッズ',      icon: '🔤', stars: 1,                         hint: 'えいごの ほんを よもう' },
    { id: 'dokusho',  label: 'どくは ノート',   icon: '📒', stars: 1,                         hint: 'よんだ ほんを かこう' },
    { id: 'sansu',    label: 'さんすう',        icon: '🔢', stars: 1, math: true,             hint: 'もんだいに ちょうせん！' }
  ],

  // さんすう タブ：「ずに かいて かんがえる」おはなしの もんだい（1か月ぶんの けいかく）
  //  その日の 日にちで「テーマ」が きまり、まいにち ちがう もんだいが count もん でる（テーマ 3もん ＋ ドリル 1もん ＋ とけい 1もん。おなじ日は おなじ もんだい）
  //  types（もんだいの しゅるい）:
  //    total     … まえから ○ばんめ、うしろに △ → ぜんぶで（4＋8）
  //    behind    … ○にん ならぶ、まえから △ばんめ → うしろには なんにん（12−5）
  //    front     … まえに ○にん → なんばんめ（5＋1）
  //    ends      … ひだりから ○ばんめ・みぎから △ばんめ → みんなで（7＋5−1）
  //    between   … ○ばんめと △ばんめの あいだは なんにん（9−3−1）
  //    behindrank… まえから ○ばんめは うしろから なんばんめ（12−5＋1）
  //    give      … ○こを △にんに 1こずつ → のこりは（15−8）
  //    seats     … いす ○こ・こども △にん → すわれないのは（11−8）
  //    gotback   … △にんが 1こずつ とって ○こ のこった → はじめは（6＋5）
  //    more/less … ○より △ おおい／すくない → いくつ（7＋4／12−5）
  //    drill     … ドリル（たすのかな ひくのかな）と おなじ かたち（total / ends / give の どれか）
  //    clock     … とけいを よむ（ちょうど・はん・5ふん きざみ。ながい はり と みじかい はり）
  //  extras: まいにちの もんだいに かならず 1もんずつ たす しゅるい（count の うちわけ）
  //  practice: れんしゅう だけに でる テーマ
  math: {
    count: 5,
    extras: ['drill', 'clock'],
    practice: [
      { icon: '📘', title: 'ドリルと おなじ もんだい', types: ['total', 'ends', 'give'] },
      { icon: '🕐', title: 'とけい', types: ['clock'] }
    ],
    plan: [
      { from: 1,  to: 7,  icon: '🚃', title: 'じゅんばんと かず',   types: ['total', 'behind', 'front'] },
      { from: 8,  to: 14, icon: '↔️', title: 'りょうはしと あいだ', types: ['ends', 'between', 'total', 'ends'] },
      { from: 15, to: 21, icon: '🍬', title: '1こずつ くばると',     types: ['give', 'seats', 'gotback', 'give'] },
      { from: 22, to: 28, icon: '⚖️', title: 'おおい・すくない',     types: ['more', 'less', 'more', 'less'] },
      { from: 29, to: 31, icon: '🏆', title: 'まとめ チャレンジ',    types: ['ends', 'behindrank', 'between', 'seats', 'gotback', 'less'] }
    ]
  },

  // しばまる（にわで くらす。なでる・ボール・ごはん・げい・きせかえ・さんぽ）
  pet: {
    fullAt: 4,                                   // 1日に ほね🦴 を この かずで おなか いっぱい
    yard: ['🌳', '🍂', '🍁', '🏠'],             // にわの かざり（月ごとに かえると きせつかんが でる）
    // げい：これまでの ★の ごうけいが at に なると おぼえる（id は かえない）
    tricks: [
      { id: 'sit',   name: 'おすわり', anim: 'sit',   at: 0 },
      { id: 'paw',   name: 'おて',     anim: 'paw',   at: 5 },
      { id: 'jump',  name: 'ジャンプ', anim: 'jump',  at: 15 },
      { id: 'spin',  name: 'くるりん', anim: 'spin',  at: 30 },
      { id: 'roll',  name: 'ごろーん', anim: 'roll',  at: 55 },
      { id: 'dance', name: 'ダンス',   anim: 'dance', at: 85 },
      { id: 'bang',  name: 'バーン！', anim: 'bang',  at: 120 }
    ],
    walks: [
      { emoji: '🌳', name: 'こうえん' },
      { emoji: '🌊', name: 'うみ' },
      { emoji: '⛰️', name: 'やま' },
      { emoji: '🍂', name: 'おちば の みち' },
      { emoji: '🏞️', name: 'かわら' },
      { emoji: '🍠', name: 'やきいも やさん' }
    ]
  },

  // きせかえ アイテム（at ＝ これまでに あつめた ★の ごうけい。月を こえて たまる）
  // ⚠ id は かえない。あたらしい アイテムは したに たしていく
  items: [
    { id: 'cap',     emoji: '🧢', name: 'ぼうし',         at: 10 },
    { id: 'flower',  emoji: '🌸', name: 'はなかざり',     at: 25 },
    { id: 'glasses', emoji: '👓', name: 'めがね',         at: 45 },
    { id: 'scarf',   emoji: '🧣', name: 'マフラー',       at: 70 },
    { id: 'tophat',  emoji: '🎩', name: 'シルクハット',   at: 100 },
    { id: 'grad',    emoji: '🎓', name: 'はかせの ぼうし', at: 140 },
    { id: 'medal',   emoji: '🏅', name: 'メダル',         at: 190 },
    { id: 'star',    emoji: '🌟', name: 'ひかる ほし',     at: 250 }
  ],

  // 月の ★ で そだつ キャラクター（at = その月に あつめた ★ の数。おおきさも かわる）
  // 11月の よてい★：30日×4 ＝ 120
  character: {
    name: 'しばまる',
    stages: [
      { at: 0,   emoji: '🐶', title: 'あかちゃん しばけん', size: 0.75 },
      { at: 18,  emoji: '🐶', title: 'こいぬ',             size: 0.9 },
      { at: 48,  emoji: '🐕', title: 'げんきな しばけん',   size: 1.0 },
      { at: 84,  emoji: '🐕', badge: '🎀', title: 'おしゃれ しばけん', size: 1.12 },
      { at: 115, emoji: '🐕', badge: '👑', title: 'しばけん キング',   size: 1.25 }
    ]
  },

  // 1しゅうかんの もくひょう と ごほうび（1しゅうかんの よてい★：7日×4 ＝ 28）
  weeklyGoal: {
    stars: 24,
    reward: 'にちようびに すきな おやつを えらべる'
  },

  // できた！のときに ランダムで でる ことば
  cheers: ['すごい！', 'やったね！', 'かっこいい！', 'その ちょうし！', 'てんさい！', 'しばまるも しっぽ ふってるよ！'],

  // 1日 ぜんぶ できたときの ことば
  allDoneMessage: 'きょうの ぶん ぜんぶ できた！',

  // 1日の おわりに えらぶ きもち
  moods: [
    { id: 'great', emoji: '😆', label: 'たのしかった' },
    { id: 'good',  emoji: '🙂', label: 'ふつう' },
    { id: 'hard',  emoji: '😣', label: 'むずかしかった' },
    { id: 'tired', emoji: '😪', label: 'つかれた' }
  ]
};
