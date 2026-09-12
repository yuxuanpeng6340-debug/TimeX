import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

const typeTabs = [
  { key: 'offer', label: '技能提供' },
  { key: 'request', label: '求助需求' },
];

const statCards = [
  { value: '1 分钟', label: '完成一次 AI 定价发布' },
  { value: '0.1 - 10', label: '支持自定义 Credits 范围' },
];

function Home({ posts, currentUser }) {
  const [activeType, setActiveType] = useState('offer');

  const filteredPosts = useMemo(
    () => posts.filter((post) => post.type === activeType).sort((a, b) => b.id.localeCompare(a.id)),
    [activeType, posts],
  );

  const featuredPosts = filteredPosts.slice(0, 4);

  return (
    <div className="space-y-8 pb-4">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-card">
        <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="relative z-10">
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-200">
              Campus Skill Swap Demo · 面向 Gen Z 的校园技能互助平台
            </div>

            <p className="mt-5 text-sm text-brand-100">Hi，{currentUser.name}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              让每个大学生的技能，
              <br />
              都能变成可交换的价值
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              用时间或积分驱动校园互助，把“我会做什么”和“我需要什么帮助”放进同一个轻量化社区里，形成从发布、申请到评价的完整服务闭环。
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/publish"
                className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
              >
                立即发布内容
              </Link>
              <Link
                to="/orders"
                className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                查看订单
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {statCards.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <div className="text-lg font-semibold text-white">{item.value}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(124,140,255,0.38),transparent_38%)]" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">本周 Demo 数据</div>
                  <div className="mt-2 text-3xl font-semibold text-white">128</div>
                  <div className="text-sm text-slate-300">活跃互助需求浏览</div>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                  <div className="text-xs text-slate-300">Credits 余额</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{currentUser.credits.toFixed(1)}</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { label: 'PPT 美化', width: '82%' },
                  { label: '英语口语陪练', width: '68%' },
                  { label: 'Python 作业辅导', width: '74%' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                      <span>{item.label}</span>
                      <span>{item.width}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400" style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-4 rounded-[1.75rem] bg-white/75 p-5 shadow-card backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">内容广场</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">校园技能与需求正在被重新组织</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {typeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveType(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeType === tab.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {featuredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState title="还没有内容" description="发布你的第一条技能或需求，让同学们看到你。" />
        )}
      </section>
    </div>
  );
}

export default Home;
