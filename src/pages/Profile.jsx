import EmptyState from '../components/EmptyState';
import { formatCredits } from '../utils/pricing';

function Profile({ currentUser, posts, orders, reviews, transactions }) {
  const myPosts = posts.filter((post) => post.authorId === currentUser.id);
  const completedOrders = orders.filter((order) => order.status === '已完成').length;
  const myReviews = reviews.filter((review) => orders.some((order) => order.id === review.orderId));
  const averageRating = myReviews.length
    ? (myReviews.reduce((sum, item) => sum + item.rating, 0) / myReviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-500 text-xl font-semibold">
            {currentUser.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{currentUser.name}</h1>
            <p className="mt-1 text-sm text-slate-300">{currentUser.school}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">{currentUser.bio}</p>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-slate-300">Credits 余额</div>
            <div className="mt-1 text-lg font-semibold">{formatCredits(currentUser.credits)}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-slate-300">完成单</div>
            <div className="mt-1 text-lg font-semibold">{completedOrders}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-slate-300">评分</div>
            <div className="mt-1 text-lg font-semibold">{averageRating}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white/95 p-5 shadow-card">
        <h2 className="text-base font-semibold text-slate-900">Credits 流水</h2>
        <div className="mt-4 space-y-3">
          {transactions.map((item) => (
            <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{item.description}</div>
                  <div className="mt-2 text-xs text-slate-400">{item.createdAt}</div>
                </div>
                <div className={`text-sm font-semibold ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.amount >= 0 ? '+' : ''}
                  {formatCredits(item.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white/95 p-5 shadow-card">
        <h2 className="text-base font-semibold text-slate-900">我发布的内容</h2>
        {myPosts.length > 0 ? (
          <div className="mt-4 space-y-3">
            {myPosts.map((post) => (
              <div key={post.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{post.title}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {post.category} · {formatCredits(post.price)} · {post.pricingMode === 'ai' ? 'AI 推荐价' : '自定义价'}
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {post.type === 'offer' ? '技能提供' : '求助需求'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="你还没有发布内容" description="去发布页发出第一条技能或需求吧。" />
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;
