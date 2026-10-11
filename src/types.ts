export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  artType: 'beach' | 'stars' | 'cafe' | 'roses' | 'custom';
  customImageUrl?: string;
  location?: string;
  aspect?: 'portrait' | 'landscape' | 'square';
  aspectRatio?: number; // width / height
  tilt?: 'left' | 'right' | 'none';
}

export interface VowItem {
  id: string;
  title: string;
  description: string;
  iconName: 'heart' | 'utensils' | 'shield' | 'smile' | 'infinity' | 'gift' | 'star' | 'home';
}

export interface ProposalConfig {
  groomName: string;
  brideName: string;
  anniversaryDate: string; // e.g., "2023-05-20T13:14:00"
  proposalDate: string;
  heroSubtitle: string;
  letterTitle: string;
  letterBody: string;
  vows: VowItem[];
  milestones: Milestone[];
  ringMessage: string;
  musicUrl?: string;
  musicTitle?: string;
  photoWallMode?: 'stream' | 'polaroid';
  photoWallSpeed?: 'normal' | 'slow' | 'fast';
  spotlightEnabled?: boolean;
}

export const DEFAULT_CONFIG: ProposalConfig = {
  groomName: '浩宇',
  brideName: '语桐',
  anniversaryDate: '2023-05-20T13:14:00',
  proposalDate: '2026-10-10',
  photoWallMode: 'stream',
  photoWallSpeed: 'normal',
  spotlightEnabled: true,
  heroSubtitle: '斯人若彩虹，遇上方知有。',
  letterTitle: '致我生命中最温柔的月光',
  letterBody: `亲爱的语桐：

见字如面。

从我们相遇的第一天起，我的世界好像被悄悄洒下了一片星光。每一个有你的清晨和黄昏，都变成了我人生中最值得珍藏的注脚。

记得第一次牵你的手时，掌心微烫的悸动；
记得我们一起在海边吹晚风，你笑着转过头对我说“好美啊”；
记得那些疲惫的深夜，只要看到你的笑容，所有坚硬的世界都变得柔软。

我想陪你看遍四季流转，想在每个醒来的清晨为你准备温热的早餐，想在风雨来临时成为你永远不必设防的港湾。

未来的路也许很长，但只要手牵着手，每一步都算作浪漫。

今天，我怀着这颗毫无保留的心，想问你一个最重要的承诺。`,
  vows: [
    {
      id: 'vow-1',
      title: '永远倾听与理解',
      description: '做你永远的专属树洞，接纳你的小情绪与所有碎碎念，不讲大道理，先给你拥抱。',
      iconName: 'heart',
    },
    {
      id: 'vow-2',
      title: '四季三餐的温热',
      description: '为你学做爱吃的每一道菜，清晨有热牛奶，深夜有留给你的暖胃羹汤。',
      iconName: 'utensils',
    },
    {
      id: 'vow-3',
      title: '风雨兼程的守护',
      description: '做你永远坚不可摧的避风港，无论面对什么困难，我都会坚定站在你身前。',
      iconName: 'shield',
    },
    {
      id: 'vow-4',
      title: '守护你的纯真笑容',
      description: '让你永远可以做那个不用长大的小女孩，随时任性、随时大笑。',
      iconName: 'smile',
    },
    {
      id: 'vow-5',
      title: '执手一生的忠诚',
      description: '从青丝走到白发，眼里心底只有你一人，用一生去践行今天许下的誓言。',
      iconName: 'infinity',
    },
  ],
  milestones: [
    {
      id: 'm1',
      date: '2023.05.20',
      title: '初见 · 心动的开始',
      description: '街角的转角相遇，阳光穿过树叶正好落在你眼眸里。那一瞬，心跳漏了半拍。',
      artType: 'cafe',
      location: '梧桐街角咖啡馆',
    },
    {
      id: 'm2',
      date: '2023.10.03',
      title: '看海 · 晚霞与微风',
      description: '海浪拍打沙滩，夕阳染红了半边天。我们静静坐着，直到月亮升起。',
      artType: 'beach',
      location: '滨海金沙湾',
    },
    {
      id: 'm3',
      date: '2024.08.10',
      title: '星夜 · 漫步小城街灯',
      description: '牵手走过落满金黄银杏的石板路，聊着各自天马行空的梦想，夜空格外清朗。',
      artType: 'stars',
      location: '云栖小镇',
    },
    {
      id: 'm4',
      date: '2025.02.14',
      title: '捧花 · 属于我们的约定',
      description: '送你的那一束洋桔梗，你说这是你见过最温柔的颜色。我心想：你比花更动人。',
      artType: 'roses',
      location: '相约的纪念日',
    },
  ],
  ringMessage: '以爱之名，冠你指间；一生相伴，一世相随。',
  musicUrl: 'https://pub-31b15ba2520047e495dc5861af6e228b.r2.dev/music/Shane%20Filan%20-%20Beautiful%20in%20White.m4a',
  musicTitle: 'Shane Filan - Beautiful in White',
};
