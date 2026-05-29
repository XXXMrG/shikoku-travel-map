import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { markerPositions, prefecturePaths, shikokuViewBox } from './mapPaths.js';
import './styles.css';

const A = '/assets/';

const detailTabs = [
  ['overview', '概览'],
  ['plan', '安排'],
  ['traffic', '交通'],
  ['stay', '落脚'],
  ['rules', '取舍']
];

const d = (overview, plan, traffic, stay, rules) => ({ overview, plan, traffic, stay, rules });
const spot = (id, region, name, type, label, days, x, y, details, source, dx = 12, dy = -10) => ({ id, region, name, type, label, days, x, y, dx, dy, details, source });

const prefectures = {
  kagawa: {
    id: 'kagawa', name: '香川', kana: 'Kagawa', mood: '入口 / 庭园 / 瀬户内跳岛', tone: '#8fa885',
    image: 'shikoku_02_Ritsurin_bdd6995a.jpg',
    summary: '高松是四国慢启动和瀬户内枢纽。现在不只保留轻松主线，也把庭园、海岛、神社、夕景和小城点位放进景点池，方便你按地图自选。',
    details: d(
      ['角色是“入口”和“缓冲”，不是刷景点的城市。', '香川的选择很多：栗林公园、屋岛、高松港、小豆岛、直岛/丰岛、琴平、父母滨、高屋神社、丸龟城都可以按天气和体力选。'],
      ['D1 抵达后只吃乌冬或散步；D2 栗林公园 + 高松港/北滨；D3 小豆岛或瀬户内艺术岛二选一。', '如果想把景点池打开，优先用半日模块：高松市内、琴平、三丰夕景、丸龟/善通寺。'],
      ['高松港是跳岛枢纽；艺术岛、美术馆、船班和闭馆日必须提前查。', '父母滨、天使之路都吃潮汐；高屋神社吃天气和交通。'],
      ['落脚优先高松港、北滨、片原町、瓦町；判断标准是吃饭、坐船、转车方便。', '琴平适合作为进山前一晚缓冲；不再把某一种住宿形态当成核心目标。'],
      ['保留：高松 2–3 晚、栗林公园、一个海岛日、琴平缓冲。', '加点规则：一天只开一个远点；海岛、夕景、山上神社不要塞在同一天。']
    ),
    keep: ['高松 2–3 晚', '栗林公园半天', '小豆岛或艺术岛一日', '琴平作为进山缓冲'],
    avoid: ['不要小豆岛一天追全岛', '不要艺术祭期间临时订船票/美术馆', '不要把潮汐点塞进疲劳日']
  },
  tokushima: {
    id: 'tokushima', name: '德岛', kana: 'Tokushima', mood: '鸣门海峡 / 阿波舞 / 祖谷山谷', tone: '#7896a0',
    image: 'shikoku_06_Iya_6ef748b6.jpg',
    summary: '德岛现在分成两条线：东线看鸣门漩涡、大鸣门桥、观潮船和大塚美术馆；西线进祖谷/大步危、藤桥、峡谷、剑山。',
    details: d(
      ['不再只把德岛等同于祖谷。鸣门海峡是强自然奇观，阿波舞是城市文化入口，祖谷/大步危是山谷核心。', '鸣门漩涡要按潮汐看，不是随到随有；桥上 Uzu-no-Michi 和船上观潮体验不同。'],
      ['德岛东线：鸣门漩涡 + Uzu-no-Michi + 观潮船 + 大塚国际美术馆，可做半日到一日。', '德岛西线：大步危观光船、祖谷葛桥、祖谷溪、小便小僧、奥祖谷或剑山，按交通能力拆成 1–3 天。'],
      ['鸣门从 JR 鸣门站或德岛站转巴士，观潮船和 Uzu-no-Michi 都要查潮汐/营业/天气。', '祖谷公共交通班次少，必须提前核对巴士、末班车、接送和出租车。'],
      ['落脚按路线选：鸣门/德岛市适合东线，三好/大步危适合西线。', '山里重点是减少转场和确认晚餐接送，不再把某种住宿形式本身作为目标。'],
      ['如果你想看鸣门漩涡，需要替换掉香川或祖谷的一部分时间，或增加一天。', '祖谷仍适合保留两晚以上；鸣门、大塚美术馆、阿波舞则是可按兴趣插入的德岛东线。']
    ),
    keep: ['鸣门漩涡按潮汐看', 'Uzu-no-Michi 或观潮船二选一/都选', '祖谷 / 大步危 2–3 晚', '阿波舞或德岛市轻量补点'],
    avoid: ['不要不查潮汐就去鸣门', '不要把鸣门和祖谷硬塞同一天', '不要不查巴士就进山']
  },
  kochi: {
    id: 'kochi', name: '高知', kana: 'Kochi', mood: '南国小城 / 仁淀蓝 / 四万十清流', tone: '#c69368',
    image: 'shikoku_10_Shimanto_e5151e9b.jpg',
    summary: '高知不只是补给点：高知城、桂浜、弘人市场、龙河洞、莫奈花园、仁淀川、四万十、足摺岬、柏岛都能按地图拆成不同强度分支。',
    details: d(
      ['高知市适合城、市场、海岸；仁淀川适合蓝色溪谷；四万十适合慢活动；足摺/柏岛是更远的海岸线分支。', '如果你想自己选择，高知可以拆成“城市半日 / 仁淀一日 / 四万十两日 / 足摺柏岛两日”四个模块。'],
      ['D8 出山到高知，晚上弘人市场或轻逛。D9–D10 四万十仍是低强度核心。', '若改成景点型玩法，可把仁淀川或龙河洞/莫奈花园作为高知市周边分支。'],
      ['高知到中村/四万十时间不短；仁淀川、足摺岬、柏岛公共交通弱，租车或包车更现实。', '水上活动、屋形船、玻璃船和洞穴探险都受天气/预约影响。'],
      ['落脚按模块选：高知市中心负责吃饭和交通，四万十/中村负责清流活动，足摺/柏岛需要单独拆线。', '不再强调住宿体验本身，优先考虑动线、预约和第二天出发效率。'],
      ['主线仍建议保留四万十；仁淀川和足摺柏岛都是强分支，但不要同一天混跑。', '高知市内不要排太满，留给市场、城、桂浜即可。']
    ),
    keep: ['高知市轻逛一晚', '四万十川 2 晚', '沉下桥', '屋形船 / 独木舟 / SUP 半日'],
    avoid: ['不要把仁淀川、足摺岬、柏岛全塞一天', '不要周末才订四万十活动', '不要高知市内排满']
  },
  ehime: {
    id: 'ehime', name: '爱媛', kana: 'Ehime', mood: '松山 / 岛波海道 / 大洲内子 / 南予', tone: '#b9a36b',
    image: 'shikoku_11_Ozu_castle_town_Hijikawa_river_Ehime_2029096e.jpg',
    summary: '爱媛可以更开放地选：松山城、道后温泉、下滩站、岛波海道、今治、大洲、内子、宇和岛、石鎚山都是不同方向的模块。',
    details: d(
      ['爱媛不是只有大洲/内子收束。松山适合城市和温泉，今治/岛波海道适合濑户内骑行，大洲/内子适合历史街区，宇和岛/南予适合更远海岸文化。', '这段可以按返程城市、是否自驾、是否想骑行来重组。'],
      ['D11–D12 仍可用大洲/内子收束；如果想看更多景点，可把松山城/道后或下滩站作为轻量加点。', '岛波海道、石鎚山、宇和岛都建议单独留半天到一天，不要压进返程日。'],
      ['松山交通最稳；下滩站列车少；岛波海道要查租还车点；南予和石鎚山自驾更方便。', '返程如果走松山机场，可以把松山市内和道后放到最后。'],
      ['落脚按返程和兴趣选：松山最方便，大洲/内子最安静，今治适合岛波海道，宇和岛适合南予深挖。', '住宿不再作为核心卖点；以“减少换乘、方便第二天行动”为准。'],
      ['保留大洲/内子或松山其中一个收束中心即可。', '如果想骑岛波海道，需要从主线里明确换出一天，不要临时塞。']
    ),
    keep: ['大洲 / 内子或松山收束', '松山城 / 道后按兴趣选', '返程日保持缓冲', '岛波海道作为独立强分支'],
    avoid: ['最后两天不要远征过多', '不要为了网红下滩站打乱返程', '岛波海道不要无准备硬骑']
  }
};

const routeSpots = [
  spot('takamatsu','kagawa','高松','base','主基地','D1–D3',507.3,87.8,d(['四国入口和瀬户内枢纽。现在作为香川景点池的起点，而不是唯一内容。'],['D1 落地、吃乌冬、散步；D2 栗林公园 + 港口街区。'],['港口、JR、机场巴士都方便；跳岛前确认船班。'],['高松港/北滨/片原町/瓦町优先，方便吃饭和转车。'],['慢启动，少换乘，别第一天就把自己累爆。']),'https://www.japan.travel/en/destinations/shikoku/kagawa/'),
  spot('shodoshima','kagawa','小豆岛','island','海岛慢日','D3',545,54.5,d(['小豆岛适合作为海岛散心，也可展开成一整天景点选择。'],['橄榄公园、寒霞溪、天使之路、酱油仓、海边咖啡按天气和潮汐选。'],['高松港往返；岛内巴士节奏慢，提前查末班。'],['主线可不住岛；如果跳岛分支升级，再评估岛宿。'],['宁可少走，也不要追全岛。']),'https://www.my-kagawa.jp/en/see-and-do/10120'),
  spot('kotohira','kagawa','琴平','buffer','进山缓冲','D4',461.9,124.6,d(['高松到祖谷之间的降速缓冲。'],['金刀比罗宫参道、旧金毗罗大芝居、琴平小镇散步。'],['从高松转入琴平相对顺；次日再进大步危/祖谷。'],['琴平一晚的价值是减少第二天转场压力。'],['它的价值是缓冲，不是硬凑景点。']),'https://www.my-kagawa.jp/en/see-and-do/10078'),
  spot('iya','tokushima','祖谷 / 大步危','core','山谷核心','D5–D7',449.4,201.3,d(['整条线的山谷核心，三晚可以保留，也可以按你选择的景点强度压缩。'],['大步危峡、观光船、祖谷葛桥、祖谷溪、小便小僧、奥祖谷二重葛桥按体力选。'],['班次少，接送、出租车、末班车必须提前确认。'],['落脚优先三好/大步危/祖谷，核心是少换乘和晚餐接送确定。'],['不要不查交通就进山；奥祖谷和剑山不要随手塞。']),'https://discovertokushima.net/en/spots/vinebridges-iyavalley/'),
  spot('kochi','kochi','高知','supply','城市补给','D8',403.2,277.9,d(['出山后的城市补给点，也能扩展为高知城、桂浜、弘人市场半日。'],['高知城、弘人市场、桂浜/坂本龙马按时间选 1–2 个。'],['从祖谷出山当天不再安排远景点。'],['高知市中心一晚，方便吃饭和次日出发。'],['不要把市内排满，给四万十或仁淀分支留体力。']),'https://visitkochijapan.com/en/see-and-do/10009'),
  spot('shimanto','kochi','四万十川','core','清流核心','D9–D10',282.3,415.9,d(['后半段恢复主角，靠清流和低强度活动慢下来。'],['沉下桥、屋形船/独木舟/SUP 半日，剩余时间留白。'],['高知到中村需要时间；活动受天气影响。'],['中村或河边落脚两晚优先，方便活动和散步。'],['不和足摺岬/柏岛混成赶路日。']),'https://visitkochijapan.com/en/see-and-do/10492',-86,2),
  spot('ozu','ehime','大洲 / 内子','finish','小城收束','D11–D12',203.6,290.9,d(['小城、町家街区、肱川，负责温柔收束，但不把住宿本身当唯一卖点。'],['D11 转场抵达；D12 大洲城、臥龍山荘、内子街区、内子座。'],['从四万十过来是长转场，不要加复杂预约。'],['落脚选大洲/内子或松山，按返程和第二天动线决定。'],['最后两天不远征，保留返程缓冲。']),'https://www.visitehimejapan.com/en/discover/stories/0013/',-92,1),
  spot('matsuyama','ehime','松山 / 道后','onsen','城市温泉','D13 / 可选',248.5,210,d(['松山城和道后温泉是爱媛最稳的城市组合。'],['若想泡道后，可把最后一晚改松山/道后；白天可加松山城。'],['返程可从松山衔接；看航班价格和时间。'],['松山最方便，适合返程前一晚。'],['不要为了道后删掉你更想看的大洲/内子或岛波海道。']),'https://www.visitehimejapan.com/en/things-to-do/spots/0055/',-102,-4),
  spot('naoshima','kagawa','直岛 / 丰岛','branch','艺术岛','分支',496.9,59.6,d(['艺术岛是强分支，不混入主线但保留为可选。'],['直岛偏建筑与美术馆；丰岛偏自然、生活与哲学感。'],['船票、美术馆、住宿都要提前预约；闭馆日影响很大。'],['跳岛期高松/宇野二选一。'],['只有你明确想艺术岛优先时才加入。']),'https://www.my-kagawa.jp/en/see-and-do/10079',-92,-12),
  spot('takaya','kagawa','高屋神社','optional','天空鸟居','备选',424.6,141.1,d(['天空鸟居很强，但它是天气、体力和交通点。'],['只适合状态好、天气好、交通确认后的半日备选。'],['查登山道开放、停车/接驳、公交可达性。'],['不为它单独改落脚。'],['不要塞进疲劳日；不要为一张照片破坏主线。']),'https://www.my-kagawa.jp/en/see-and-do/10128',-84,14)
];

const extraSpots = [
  spot('ritsurin','kagawa','栗林公园','garden','庭园','半日',503,93,d(['日本代表性大名庭园之一，一步一景，早晨和秋色尤其适合慢逛。'],['放在高松整日的上午，下午留港口或北滨。'],['JR 栗林公园北口或琴电栗林公园站步行可达。'],['住高松市区即可。'],['优先级高，适合保留。']),'https://www.japan.travel/en/spot/833/'),
  spot('tamamo','kagawa','玉藻公园 / 高松城迹','history','海城','1–2小时',510,84,d(['日本少见海城遗迹，适合和高松港一起轻逛。'],['落地日或栗林公园后补一个短点。'],['JR 高松站、高松港附近，交通很顺。'],['住高松港周边最方便。'],['短平快，可作为雨前雨后补点。']),'https://www.my-kagawa.jp/en/see-and-do/10093'),
  spot('yashima','kagawa','屋岛','view','展望','半日',536,90,d(['桌状熔岩台地，可看高松市区和瀬户内海群岛。'],['山顶展望、屋岛寺、四国村可组合。'],['公交/自驾上山；夜景要特别确认交通。'],['高松市内往返即可。'],['天气好加，天气差删。']),'https://www.my-kagawa.jp/en/see-and-do/10080'),
  spot('kankakei','kagawa','寒霞溪','nature','峡谷缆车','半日',552,56,d(['小豆岛代表性峡谷，缆车同时看奇岩和海。'],['小豆岛一日里和橄榄公园二选一或组合。'],['缆车营业随季节变化；红叶期人多。'],['主线不一定住岛。'],['若去小豆岛且天气好，优先级高。']),'https://www.my-kagawa.jp/en/see-and-do/10122'),
  spot('angel-road','kagawa','天使之路','coast','潮汐沙洲','1小时',531,64,d(['退潮时出现的沙洲步道，是小豆岛经典潮汐景观。'],['只在低潮窗口去，不要硬等。'],['必须查潮汐时间；土庄港附近相对方便。'],['小豆岛日归可安排。'],['潮汐不合就删。']),'https://shikoku-tourism.com/en/see-and-do/10086'),
  spot('teshima','kagawa','丰岛','art','艺术岛','半日/一日',516,57,d(['比直岛更安静，丰岛美术馆、梯田和海景是核心。'],['适合作为瀬户内艺术分支单独安排。'],['船班和闭馆日决定行程。'],['可高松/宇野/岛上落脚。'],['艺术优先时加入，否则后置。']),'https://www.my-kagawa.jp/en/see-and-do/10112'),
  spot('marugame','kagawa','丸龟城','castle','现存天守','2小时',472,104,d(['现存木造天守与高石垣，适合补一个城郭点。'],['可与琴平/善通寺同日。'],['JR 丸龟站步行可达。'],['不需要为它换落脚。'],['喜欢城郭可加。']),'https://www.my-kagawa.jp/en/see-and-do/10084'),
  spot('chichibugahama','kagawa','父母滨','sunset','天空之镜','夕景',410,128,d(['退潮浅水洼在日落时形成镜面倒影。'],['只在低潮+日落+无风条件好时去。'],['需查潮汐和夕阳时间，自驾更方便。'],['可从高松/琴平顺路。'],['条件不好就删，不要硬跑。']),'https://www.my-kagawa.jp/en/see-and-do/10090'),
  spot('zentsuji','kagawa','善通寺','pilgrimage','空海','1–2小时',459,118,d(['空海诞生地相关寺院，也是四国遍路重要札所。'],['可与琴平或丸龟组合。'],['JR 善通寺站可达。'],['不需换落脚。'],['对遍路/空海感兴趣再加。']),'https://www.my-kagawa.jp/en/see-and-do/10094'),
  spot('naruto','tokushima','鸣门漩涡','nature','海峡奇观','半日',620,127,d(['鸣门海峡因潮位差形成世界级大漩涡，春秋大潮尤其壮观。'],['按潮汐窗口安排 Uzu-no-Michi 或观潮船，必要时加大塚美术馆。'],['最佳在涨落潮前后约 1.5 小时；必须查当日潮汐。'],['可住德岛市/鸣门，也可作为高松到德岛东线分支。'],['强烈新增为德岛东线核心；不查潮汐就不要去。']),'https://www.pref.tokushima.lg.jp/en/japanese/tourism/spot/uzushio/'),
  spot('uzu-no-michi','tokushima','涡之道','view','桥下步道','1–2小时',617,122,d(['大鸣门桥下 450 米步道，45 米高玻璃地板俯看海峡。'],['适合和观潮船互补：桥上看结构，船上看临场感。'],['从 JR 鸣门站或德岛站乘巴士到鸣门公园。'],['鸣门/德岛市均可。'],['恐高者可改观潮船或展望台。']),'https://www.pref.tokushima.lg.jp/en/japanese/tourism/spot/uzunomichi/'),
  spot('otsuka','tokushima','大塚国际美术馆','museum','名画陶板','半日/一日',612,129,d(['以陶板原寸再现世界名画，雨天和文化向都很强。'],['可和鸣门漩涡组成一日；美术馆体量很大，不要只留一小时。'],['鸣门公园周边，周一等闭馆日需查。'],['住鸣门或德岛市。'],['喜欢美术就保留，不喜欢可删。']),'https://discovertokushima.net/en/spots/otsuka-museum-of-art/'),
  spot('awaodori','tokushima','阿波舞会馆','culture','传统舞蹈','1–2小时',595,160,d(['全年可看阿波舞表演，补上德岛最有代表性的城市文化。'],['和眉山缆车、德岛市晚饭组合。'],['JR 德岛站步行约 10 分钟。'],['德岛市落脚最方便。'],['若不赶节庆，阿波舞会馆是稳定替代。']),'https://discovertokushima.net/en/spots/awaodorimuseum/'),
  spot('bizan','tokushima','眉山','view','城市展望','1小时',590,164,d(['德岛市象征，山顶可看城市、吉野川和远处海面。'],['阿波舞会馆楼上坐缆车很顺。'],['缆车结束时间随季节变化。'],['德岛市落脚。'],['天气好加，交通顺。']),'https://discovertokushima.net/en/spots/bizan-ropeway/'),
  spot('oboke','tokushima','大步危峡','gorge','峡谷游船','半日',466,199,d(['吉野川切割出的峡谷，观光船比漂流更轻松。'],['适合祖谷第一天或第二天低强度安排。'],['JR 大步危站附近，但班次仍需查。'],['大步危/三好落脚。'],['主线保留度高。']),'https://discovertokushima.net/en/spots/obokeandkobokegorges/'),
  spot('kazurabashi','tokushima','祖谷葛桥','bridge','藤桥','1–2小时',458,212,d(['以山藤编成的吊桥横跨祖谷川，是祖谷最有辨识度的体验。'],['与祖谷溪、小便小僧组合。'],['从大步危转巴士或自驾；维护期需查。'],['大步危/祖谷落脚。'],['若只选祖谷一个点，优先它。']),'https://discovertokushima.net/en/spots/vinebridges-iyavalley/'),
  spot('peeing-boy','tokushima','祖谷溪小便小僧','view','峡谷地标','短停',438,198,d(['临崖雕像和祖谷溪深谷，是山路上的标志性照片点。'],['适合自驾/包车路线上短停。'],['道路狭窄，公共交通不适合临时加。'],['同祖谷落脚。'],['非自驾时不要强求。']),'https://miyoshi-tourism.jp/en/spot/65/'),
  spot('oku-iya','tokushima','奥祖谷二重葛桥','remote','深山藤桥','半日',500,215,d(['男桥、女桥并列，比主葛桥更深山、更安静。'],['适合祖谷第三天或深山分支。'],['冬季关闭，公共交通少，自驾更现实。'],['祖谷/三好落脚。'],['只有体力和交通都稳才加。']),'https://discovertokushima.net/en/spots/oku-iya-double-vine-bridge/'),
  spot('tsurugi','tokushima','剑山','mountain','登山','半日/一日',526,223,d(['西日本第二高山，可用登山吊椅降低强度。'],['天气好、想登山时单独成日。'],['登山 lift 季节运营；山路和天气需查。'],['三好/祖谷或德岛西部落脚。'],['不要和鸣门同日。']),'https://discovertokushima.net/en/spots/tsurugi/'),
  spot('wakimachi','tokushima','脇町卯建街道','town','古街','1–2小时',545,178,d(['江户商家街保留卯建防火墙和阿波蓝历史。'],['可作为德岛到祖谷路上的文化补点。'],['JR 穴吹站转巴士/出租。'],['不必单独换落脚。'],['喜欢古街可加，不抢主线。']),'https://discovertokushima.net/en/spots/udatsu-townscape/'),
  spot('hiwasa','tokushima','日和佐 / 大滨海岸','coast','海龟海岸','半日',620,245,d(['大滨海岸以赤蠵龟上岸产卵闻名，是德岛南部海岸线分支。'],['适合德岛南线，不适合和祖谷同日。'],['需查海龟博物馆开放和季节信息。'],['德岛南部或阿南/美波分支落脚。'],['季节和交通不合就后置。']),'https://discovertokushima.net/en/spots/caretta/'),
  spot('kochi-castle','kochi','高知城','castle','现存城','2小时',403,278,d(['现存天守和本丸御殿都保留，是高知市核心地标。'],['和弘人市场、日曜市组合。'],['路面电车高知城前附近。'],['高知市中心。'],['城市半日优先。']),'https://visitkochijapan.com/en/see-and-do/10009'),
  spot('katsurahama','kochi','桂浜','coast','龙马海岸','半日',407,296,d(['太平洋海岸、松林和坂本龙马像构成高知经典风景。'],['和坂本龙马纪念馆组合。'],['市区巴士/自驾约半小时，海浪强不能游泳。'],['高知市往返。'],['天气好加。']),'https://visitkochijapan.com/en/see-and-do/10011'),
  spot('hirome','kochi','弘人市场','food','高知厨房','晚餐',397,275,d(['室内市场集中鲣鱼稻草烧、乡土菜和居酒屋氛围。'],['出山当晚或高知市午餐/晚餐。'],['大桥通附近，市中心步行方便。'],['高知市中心。'],['几乎必留，低风险。']),'https://visitkochijapan.com/en/see-and-do/10024'),
  spot('ryugado','kochi','龙河洞','cave','钟乳洞','半日',439,274,d(['日本三大钟乳洞之一，可看地质、瀑布灯光和弥生遗迹。'],['作为高知市周边雨天/自然分支。'],['自驾更顺；冒险路线需预约。'],['高知市往返。'],['对洞穴有兴趣再加。']),'https://visitkochijapan.com/en/see-and-do/10018'),
  spot('monet','kochi','北川村莫奈花园','garden','花园','半日/一日',526,260,d(['日本唯一获许可使用“莫奈花园”名称的吉维尼风格花园。'],['高知东部单独分支，适合花季。'],['车程较长，休园日和冬季维护需查。'],['高知市或东部海岸线。'],['花季优先，非花季后置。']),'https://visitkochijapan.com/en/see-and-do/10003'),
  spot('niyodo','kochi','仁淀川 / 安居溪谷','river','仁淀蓝','一日',330,275,d(['仁淀蓝溪谷、瀑布和清水潭，是高知很强的自然分支。'],['にこ淵、安居溪谷、中津溪谷三选一到二。'],['公共交通弱，自驾/包车更现实；禁止下水处要遵守。'],['高知市往返或仁淀川町。'],['想看蓝水就留一天。']),'https://visitkochijapan.com/en/see-and-do/10015'),
  spot('sada','kochi','佐田沉下桥','bridge','四万十桥','1小时',292,399,d(['无栏杆沉下桥是四万十川标志画面。'],['适合从中村骑行或自驾短停。'],['桥面无栏杆，注意车辆和安全。'],['中村/四万十落脚。'],['四万十核心点。']),'https://visitkochijapan.com/en/see-and-do/10041'),
  spot('ashizuri','kochi','足摺岬','cape','四国最南端','半日/一日',264,490,d(['四国最南端海岬，可看太平洋大视野。'],['要从四万十/土佐清水单独拉出一日。'],['公共交通少，自驾更现实。'],['足摺或土佐清水分支。'],['很强，但不要硬塞进四万十慢日。']),'https://visitkochijapan.com/en/see-and-do/10033'),
  spot('kashiwa','kochi','柏岛','island','透明海','半日/一日',220,464,d(['以高透明度海水和潜水闻名，海景强但很远。'],['适合作为高知西南深度分支。'],['车程长，停车和当地规则要遵守。'],['大月/宿毛/土佐清水方向。'],['除非加天，否则后置。']),'https://visitkochijapan.com/en/see-and-do/10030'),
  spot('muroto','kochi','室户岬','cape','地质公园','半日/一日',590,355,d(['UNESCO Global Geopark 海岬，可看隆起岩层和亚热带植被。'],['高知东部单独海岸线分支。'],['从高知市车程长。'],['室户/安艺方向。'],['和莫奈花园可组合，但不进主线。']),'https://visitkochijapan.com/en/see-and-do/10001'),
  spot('shimonada','ehime','下滩站','photo','海景车站','1小时',210,238,d(['面向伊予滩的极简海景车站，是爱媛代表性摄影点。'],['只在列车时间和夕阳合适时加。'],['普通列车少，返程要提前查。'],['松山或大洲动线中可顺路。'],['不要为一张照片打乱大动线。']),'https://www.visitehimejapan.com/en/discover/chuyo/'),
  spot('matsuyama-castle','ehime','松山城','castle','现存天守','半日',248,210,d(['日本12座现存天守之一，山顶视野很好。'],['和道后温泉组成松山一日。'],['缆车/吊椅/步行上山。'],['松山市内。'],['城市收束优先点。']),'https://www.visitehimejapan.com/en/things-to-do/spots/0020/'),
  spot('dogo','ehime','道后温泉本馆','onsen','古汤','晚间/半日',252,206,d(['日本最古老温泉之一，建筑本身就是看点。'],['适合返程前一晚放松。'],['浴室和休息室开放时间不同，旺季可能排队。'],['松山/道后落脚。'],['想泡汤就留，不想泡可只看街区。']),'https://www.visitehimejapan.com/en/things-to-do/spots/0055/'),
  spot('shimanami','ehime','岛波海道 / 今治','cycling','跨海骑行','半日/一日+',276,150,d(['今治到尾道的跨海岛屿骑行路线，是濑户内代表体验。'],['轻量玩法从今治/糸山骑到大岛；全程需1–2天。'],['查租还车点、风况和体力。'],['今治或松山。'],['强分支，需要明确换出一天。']),'https://imabari-shimanami.jp/en/shimanami/'),
  spot('kirosan','ehime','龟老山展望公园','view','岛波展望','1–2小时',286,130,d(['高处俯瞰来岛海峡大桥和瀬户内群岛。'],['和岛波海道轻量玩法组合。'],['上坡强，自驾比骑行轻松。'],['今治/大岛方向。'],['天气好才值得。']),'https://www.visitehimejapan.com/en/things-to-do/'),
  spot('garyu','ehime','臥龍山荘','garden','河畔别墅','1–2小时',204,291,d(['肱川畔明治期别墅，木作、茶室和借景很细。'],['与大洲城、老街步行串联。'],['闭馆较早，留白天时间。'],['大洲/内子或松山。'],['大洲线优先。']),'https://www.visitehimejapan.com/en/discover/stories/0010/'),
  spot('uchiko','ehime','内子老街 / 内子座','town','传统街区','半日',220,278,d(['八日市护国町并和内子座展示木蜡商人街与传统剧场。'],['与大洲组成一整日小城线。'],['JR 内子站可步行。'],['大洲/内子或松山。'],['喜欢老街则保留。']),'https://www.visitehimejapan.com/en/things-to-do/spots/0033/'),
  spot('uwajima','ehime','宇和岛城 / 南予','castle','港湾小城','半日/一日',167,366,d(['宇和岛城是现存天守，南予还有鲷鱼饭和庭园。'],['作为爱媛南部深度分支。'],['从松山/大洲继续南下，时间不短。'],['宇和岛或大洲方向。'],['除非加天，否则不要压进返程日。']),'https://www.visitehimejapan.com/en/things-to-do/spots/0039/'),
  spot('ishizuchi','ehime','石鎚山','mountain','西日本最高峰','一日',340,170,d(['海拔1982米，西日本最高峰，也是山岳信仰核心。'],['登山或红叶季可作为强自然分支。'],['缆车和山路季节性强，需装备和天气判断。'],['西条/久万高原方向。'],['不是休闲加点，需单独准备。']),'https://www.visitehimejapan.com/en/things-to-do/spots/0023/')
];

const allSpots = [...routeSpots, ...extraSpots];

const routeDays = [
  { d:'D1', t:'高松落地', spot:'takamatsu', note:'抵达后不安排硬景点。' },
  { d:'D2', t:'栗林公园', spot:'ritsurin', note:'庭园 + 港口街区，把速度降下来。' },
  { d:'D3', t:'小豆岛', spot:'shodoshima', note:'海岛慢日，从景点池选 2–3 个。' },
  { d:'D4', t:'琴平', spot:'kotohira', note:'参道、小镇，进山前缓冲。' },
  { d:'D5', t:'进祖谷', spot:'iya', note:'转场为主，确认交通。' },
  { d:'D6', t:'西祖谷', spot:'kazurabashi', note:'藤桥、峡谷、温泉，不追深处。' },
  { d:'D7', t:'祖谷留白', spot:'oboke', note:'大步危或奥祖谷可选。' },
  { d:'D8', t:'高知补给', spot:'kochi', note:'高知城/市场/桂浜按体力选。' },
  { d:'D9', t:'四万十', spot:'shimanto', note:'抵达清流地带，不再远征。' },
  { d:'D10', t:'清流整日', spot:'sada', note:'沉下桥 + 半日水上活动。' },
  { d:'D11', t:'大洲/内子', spot:'ozu', note:'长转场，开始小城收束。' },
  { d:'D12', t:'町家小城', spot:'uchiko', note:'大洲、内子、肱川，低强度。' },
  { d:'D13', t:'返程', spot:'matsuyama', note:'只保留返程缓冲，不加重景点。' }
];

const variants = [
  ['德岛东线', '新增鸣门漩涡、Uzu-no-Michi、观潮船、大塚美术馆；需要按潮汐和闭馆日安排。'],
  ['多景点池', '四县都扩成可选点位库：地图上先看位置，再决定是否替换主线。'],
  ['住宿降权', '不再把某一种住宿形式当核心目标；落脚只服务动线、交通和体力恢复。']
];

function useLocalDecision() {
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shikoku-decisions') || '{}'); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem('shikoku-decisions', JSON.stringify(saved)); }, [saved]);
  return [saved, setSaved];
}

function activateWithKeyboard(event, action) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

function ShikokuMap({ selectedRegion, selectedSpot, onRegion, onSpot }) {
  const routeLine = ['takamatsu','kotohira','iya','kochi','shimanto','ozu','matsuyama']
    .map(id => `${markerPositions[id].x},${markerPositions[id].y}`).join(' ');
  const visibleExtras = extraSpots.filter(s => s.region === selectedRegion);

  return <section className="real-map-card" aria-label="真实四国地图攻略">
    <div className="map-status"><b>当前查看</b><span>{selectedSpot?.name || prefectures[selectedRegion].name}</span></div>
    <svg viewBox={shikokuViewBox} role="img" aria-label="四国真实轮廓交互地图">
      <defs>
        <filter id="landShadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1f2a25" floodOpacity=".14"/></filter>
        <radialGradient id="seaGlow" cx="54%" cy="38%" r="72%"><stop stopColor="#eef5f2"/><stop offset="1" stopColor="#dbe8e4"/></radialGradient>
      </defs>
      <rect width="760" height="520" rx="28" fill="url(#seaGlow)" />
      <text x="512" y="38" className="sea-label">瀬户内海</text>
      <text x="590" y="482" className="sea-label">太平洋</text>
      <g className="map-content" transform="translate(-48 -18) scale(1.05)">
        <g filter="url(#landShadow)">
          {Object.values(prefectures).map(p => {
            const select = () => onRegion(p.id);
            return <path key={p.id} d={prefecturePaths[p.id]} fill={p.tone} className={`prefecture-shape ${selectedRegion === p.id ? 'active' : ''}`} role="button" tabIndex="0" aria-label={p.name} onMouseDown={(event) => event.preventDefault()} onClick={select} onKeyDown={(event) => activateWithKeyboard(event, select)} />;
          })}
        </g>
        <polyline className="main-route-line" points={routeLine} />
        {routeSpots.map(s => {
          const p = markerPositions[s.id];
          const select = () => onSpot(s);
          return <g key={s.id} className={`spot-marker ${selectedSpot?.id === s.id ? 'active' : ''} ${s.type}`} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex="0" aria-label={s.name} onMouseDown={(event) => event.preventDefault()} onClick={select} onKeyDown={(event) => activateWithKeyboard(event, select)}>
            <circle className="hit-area" r="22" />
            <circle className="spot-dot" r={s.type === 'core' ? 10 : 7} />
            <text x={s.dx} y={s.dy}>{s.name}</text>
          </g>;
        })}
        {visibleExtras.map(s => {
          const select = () => onSpot(s);
          return <g key={s.id} className={`attraction-marker ${selectedSpot?.id === s.id ? 'active' : ''} ${s.type}`} transform={`translate(${s.x} ${s.y})`} role="button" tabIndex="0" aria-label={s.name} onMouseDown={(event) => event.preventDefault()} onClick={select} onKeyDown={(event) => activateWithKeyboard(event, select)}>
            <circle className="hit-area" r="15" />
            <circle className="attraction-dot" r="4.5" />
            <text x="8" y="-8">{s.name}</text>
          </g>;
        })}
      </g>
      <text x="32" y="496" className="source-label">县域轮廓来自 GeoJSON；小点显示当前县景点池，点位为攻略决策定位</text>
    </svg>
  </section>;
}

function DetailPanel({ region, spot, tab, onTab, saved, onSave }) {
  const target = spot || region;
  const targetName = target.name;
  const detailSource = spot?.details || region.details;
  const detailLines = detailSource[tab] || [];
  const fullLines = Object.entries(detailSource).flatMap(([key, lines]) => lines.map(line => `${detailTabs.find(([id]) => id === key)?.[1] || key}｜${line}`));
  const decisionKey = spot?.id || region.id;

  return <aside className="detail-panel">
    <div className="photo"><img src={`${A}${region.image}`} alt={targetName} /></div>
    <div className="detail-kicker">{region.kana} · {spot ? spot.label : region.mood}</div>
    <h1>{targetName}</h1>
    <p className="summary">{spot ? detailSource.overview[0] : region.summary}</p>
    <div className="spot-meta"><b>{spot ? spot.days : '县域'}</b><span>{region.name} · {spot ? spot.type : 'region'}</span></div>
    {spot?.source && <a className="source-link" href={spot.source} target="_blank" rel="noreferrer">资料来源</a>}

    <div className="decision-row" aria-label="旅行取舍标记">
      <button className={saved[decisionKey] === 'keep' ? 'active' : ''} onClick={() => onSave(decisionKey, 'keep')}>想保留</button>
      <button className={saved[decisionKey] === 'maybe' ? 'active' : ''} onClick={() => onSave(decisionKey, 'maybe')}>待定</button>
      <button className={saved[decisionKey] === 'cut' ? 'active' : ''} onClick={() => onSave(decisionKey, 'cut')}>可删</button>
    </div>

    <div className="tab-row" role="tablist" aria-label="详细攻略分类">
      {detailTabs.map(([id, label]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => onTab(id)}>{label}</button>)}
    </div>

    <div className="drill-card">
      <b>{detailTabs.find(([id]) => id === tab)?.[1]}</b>
      {detailLines.map(line => <p key={line}>{line}</p>)}
    </div>

    <details className="deep-details">
      <summary>展开完整攻略</summary>
      <div className="deep-list">
        {fullLines.map(line => <span key={line}>{line}</span>)}
      </div>
    </details>

    <div className="two-col compact">
      <div><b>保留</b>{region.keep.map(x => <span key={x}>{x}</span>)}</div>
      <div><b>避坑</b>{region.avoid.map(x => <span key={x}>{x}</span>)}</div>
    </div>
  </aside>;
}

function AttractionPicker({ regionId, selectedSpot, onSpot }) {
  const items = extraSpots.filter(s => s.region === regionId);
  return <div className="picker-card">
    <b>{prefectures[regionId].name}景点池</b>
    <span>{items.length} 个可选点位，点击后地图和右侧详情同步。</span>
    <div className="picker-list">
      {items.map(s => <button key={s.id} className={selectedSpot?.id === s.id ? 'active' : ''} onClick={() => onSpot(s)} title={s.details.overview[0]}>{s.name}</button>)}
    </div>
  </div>;
}

function SpotLibrary({ onSpot }) {
  return <section className="spot-library" aria-label="四国景点池总览">
    <div className="dock-head"><b>四国景点池</b><span>不强行塞进 13 天；先按县域看位置和类型，再决定替换哪个主线日。</span></div>
    <div className="library-grid">
      {Object.values(prefectures).map(p => <article key={p.id}>
        <h3>{p.name}</h3>
        {extraSpots.filter(s => s.region === p.id).map(s => <button key={s.id} onClick={() => onSpot(s)}><b>{s.name}</b><span>{s.label} · {s.days}</span></button>)}
      </article>)}
    </div>
  </section>;
}

function App() {
  const [selectedRegion, setSelectedRegion] = useState('kagawa');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useLocalDecision();
  const region = prefectures[selectedRegion];
  const saveDecision = (id, value) => setSaved(prev => ({ ...prev, [id]: value }));
  const selectRegion = (id) => { setSelectedRegion(id); setSelectedSpot(null); setActiveTab('overview'); };
  const selectSpot = (item) => { if (!item) return; setSelectedSpot(item); setSelectedRegion(item.region); setActiveTab('overview'); };
  const keepNames = Object.entries(saved).filter(([,v]) => v === 'keep').map(([id]) => allSpots.find(s => s.id === id)?.name || prefectures[id]?.name).filter(Boolean);

  return <main className="map-page">
    <header className="map-topbar">
      <a className="brand" href="/">四国旅行地图</a>
      <div className="top-summary">13 天骨架 · 多景点池 · 自选取舍</div>
    </header>

    <section className="map-shell">
      <div className="intro-card">
        <p className="eyebrow">Personal travel atlas</p>
        <h2><span>先看地图，</span><span>再挑景点。</span></h2>
        <p className="intro-copy"><span>主线保留轻松骨架。</span><span>景点池按县域展开，想去哪里你来选。</span><span>德岛已补鸣门漩涡、大鸣门桥和观潮船。</span></p>
        <AttractionPicker regionId={selectedRegion} selectedSpot={selectedSpot} onSpot={selectSpot} />
        <div className="map-audit-note"><b>地图核对</b><span>轮廓和点位已按真实四国方位整理；它是攻略决策定位图，不是导航比例尺。</span></div>
      </div>

      <ShikokuMap selectedRegion={selectedRegion} selectedSpot={selectedSpot} onRegion={selectRegion} onSpot={selectSpot} />
      <DetailPanel region={region} spot={selectedSpot} tab={activeTab} onTab={setActiveTab} saved={saved} onSave={saveDecision} />
    </section>

    <section className="route-dock" aria-label="13天路线简表">
      <div className="dock-head"><b>13 天骨架</b><span>{keepNames.length ? `已标记保留：${keepNames.join('、')}` : '建议先保留骨架，再从景点池替换：鸣门、仁淀、岛波海道都需要换出时间'}</span></div>
      <div className="day-rail">{routeDays.map(day => <button key={day.d} onClick={() => selectSpot(allSpots.find(s => s.id === day.spot))} title={day.note}><b>{day.d}</b><span>{day.t}</span></button>)}</div>
    </section>

    <section className="variant-dock" aria-label="分支提醒">
      {variants.map(([name, text]) => <article key={name}><b>{name}</b><span>{text}</span></article>)}
    </section>

    <SpotLibrary onSpot={selectSpot} />
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
