import { Link } from 'react-router-dom';
import { formatCredits } from '../utils/pricing';

function PostCard({ post }) {
  const typeLabel = post.type === 'offer' ? '技能提供' : '求助需求';

  return (
    <Link
      to={`/post/${post.id}`}
      className="group relative block overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/95 p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(87,104,244,0.16)]"
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-brand-100/70 via-white to-emerald-50/70 opacity-80" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="relative z-10">
          <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {typeLabel}
          </span>
          <h3 className="mt-2 text-base font-semibold text-slate-900">{post.title}</h3>
        </div>
        <div className="relative z-10 rounded-2xl bg-slate-900 px-3 py-2 text-right text-xs text-white">
          <div className="text-[11px] text-slate-300">报价</div>
          <div className="text-sm font-semibold">{formatCredits(post.price)}</div>
        </div>
      </div>

      <div className="relative z-10 mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{post.category}</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">{post.tag}</span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
          {post.pricingMode === 'ai' ? 'AI 推荐价' : '自定义价'}
        </span>
      </div>

      <p className="relative z-10 text-sm leading-6 text-slate-600">{post.description}</p>

      <div className="relative z-10 mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{post.author}</span>
        <span className="font-medium text-brand-700 transition group-hover:translate-x-1">查看详情</span>
      </div>
    </Link>
  );
}

export default PostCard;
