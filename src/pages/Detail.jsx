import { Link, useParams } from 'react-router-dom';
import { formatCredits } from '../utils/pricing';

function Detail({ posts, currentUser, onApply, onMatchOwnPost, hasOrder }) {
  const { id } = useParams();
  const post = posts.find((item) => item.id === id);

  if (!post) {
    return (
      <div className="space-y-4 rounded-[2rem] bg-white/90 p-6 shadow-card">
        <h1 className="text-xl font-semibold text-slate-900">内容不存在</h1>
        <Link to="/" className="text-sm font-semibold text-brand-700">
          返回首页
        </Link>
      </div>
    );
  }

  const isSelfPost = post.authorId === currentUser.id;
  const ordered = hasOrder(post.id);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <Link to="/" className="text-sm font-semibold text-brand-700">
        返回首页
      </Link>

      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            {post.type === 'offer' ? '技能提供' : '求助需求'}
          </span>
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            {post.pricingMode === 'ai' ? 'AI 推荐价' : '自定义定价'}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold">{post.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">{post.description}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-slate-300">总价</div>
            <div className="mt-1 font-semibold text-white">{formatCredits(post.price)}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-slate-300">小时价</div>
            <div className="mt-1 font-semibold text-white">{formatCredits(post.hourlyPrice || post.price)}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-slate-300">预计时长</div>
            <div className="mt-1 font-semibold text-white">{post.durationHours || 1} 小时</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-slate-300">联系</div>
            <div className="mt-1 font-semibold text-white">{post.contact}</div>
          </div>
        </div>
      </section>

      {post.aiPricing && (
        <section className="rounded-[2rem] bg-white/95 p-5 shadow-card">
          <h2 className="text-base font-semibold text-slate-900">AI 定价解释</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {post.aiPricing.explanation.map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              Fair range: {formatCredits(post.aiPricing.fairnessRange.min)} -{' '}
              {formatCredits(post.aiPricing.fairnessRange.max)}
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {post.aiPricing.campusSignal}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-white/95 p-5 shadow-card">
        <button
          onClick={() => (isSelfPost ? onMatchOwnPost(post.id) : onApply(post.id))}
          disabled={ordered}
          className={`w-full rounded-full px-5 py-3 text-sm font-semibold text-white ${
            ordered ? 'bg-slate-300' : 'bg-brand-600'
          }`}
        >
          接受服务
        </button>
      </section>
    </div>
  );
}

export default Detail;
