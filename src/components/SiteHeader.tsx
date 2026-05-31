import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SiteHeaderProps = {
  page?: 'map' | 'gallery' | 'cards';
};

export function SiteHeader({ page = 'map' }: SiteHeaderProps) {
  return (
    <header className="mb-3 flex items-center justify-between gap-4 rounded-[1.35rem] border border-primary/[0.15] bg-card/75 px-4 py-3 shadow-sm backdrop-blur-xl sm:rounded-full max-sm:flex-col max-sm:items-start max-sm:gap-2">
      <Link className="whitespace-nowrap text-[15px] font-extrabold tracking-[0.06em] text-primary" to="/">
        四国旅行地图
      </Link>
      <nav className="inline-flex items-center gap-1 rounded-full border border-primary/10 bg-white/50 p-1 max-sm:grid max-sm:w-full max-sm:grid-cols-3" aria-label="页面切换">
        <Button asChild variant={page === 'map' ? 'default' : 'ghost'} size="sm" className={cn('max-sm:w-full', page !== 'map' && 'text-muted-foreground')}>
          <NavLink to="/" end>地图决策</NavLink>
        </Button>
        <Button asChild variant={page === 'cards' ? 'default' : 'ghost'} size="sm" className={cn('max-sm:w-full', page !== 'cards' && 'text-muted-foreground')}>
          <NavLink to="/cards">景点卡片</NavLink>
        </Button>
        <Button asChild variant={page === 'gallery' ? 'default' : 'ghost'} size="sm" className={cn('max-sm:w-full', page !== 'gallery' && 'text-muted-foreground')}>
          <NavLink to="/gallery">景点图片</NavLink>
        </Button>
      </nav>
      <div className="text-sm text-muted-foreground max-sm:text-xs">13 天骨架 · 多景点池 · 图片参考</div>
    </header>
  );
}
