import { useMemo, useState } from 'react';
import { CUSTOM_PRICE_LIMITS, formatCredits } from '../utils/pricing';

const statusStyles = {
  待确认: 'bg-amber-50 text-amber-700',
  进行中: 'bg-sky-50 text-sky-700',
  已完成: 'bg-emerald-50 text-emerald-700',
  已取消: 'bg-rose-50 text-rose-700',
};

const proposalStatusText = {
  pending: '待确认',
  accepted: '已接受',
  rejected: '已拒绝',
};

function OrderCard({
  order,
  review,
  messages,
  currentUserId,
  onStatusChange,
  onCreateReview,
  onSendMessage,
  onProposePrice,
  onRespondProposal,
  onSimulateReply,
  onCancelOrder,
}) {
  const [textDraft, setTextDraft] = useState('');
  const [proposalDraft, setProposalDraft] = useState(order.price);
  const [proposalNote, setProposalNote] = useState('');
  const isSeller = currentUserId === order.sellerId;
  const isLocked = order.status === '已完成' || order.status === '已取消';

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [messages],
  );

  const pendingProposal = useMemo(
    () => [...messages].find((item) => item.type === 'proposal' && item.status === 'pending'),
    [messages],
  );

  const canReplyToProposal = pendingProposal && pendingProposal.senderId !== currentUserId;

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    const content = textDraft.trim();
    if (!content) return;
    onSendMessage(order.id, content);
    setTextDraft('');
  };

  const handleProposalSubmit = (event) => {
    event.preventDefault();
    const price = Number(proposalDraft);
    if (Number.isNaN(price) || price < CUSTOM_PRICE_LIMITS.min || price > CUSTOM_PRICE_LIMITS.max) {
      window.alert(`议价范围需要在 ${CUSTOM_PRICE_LIMITS.min} 到 ${CUSTOM_PRICE_LIMITS.max} Credits 之间。`);
      return;
    }

    onProposePrice(order.id, price, proposalNote);
    setProposalNote('');
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/95 p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {isSeller ? '我提供服务' : '我接受服务'}
          </div>
          <h3 className="text-base font-semibold text-slate-900">{order.postTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {order.buyerName} <span className="mx-1">→</span> {order.sellerName}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
          {order.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
        <span>订单金额：{formatCredits(order.price)}</span>
        <span>服务时长：{order.durationHours || 1} 小时</span>
        <span>{order.createdAt}</span>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {order.settlementNote}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {order.status === '待确认' && (
          <button
            onClick={() => onStatusChange(order.id, '进行中')}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            确认开始
          </button>
        )}

        {order.status === '进行中' && (
          <button
            onClick={() => onStatusChange(order.id, '已完成')}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            确认完成
          </button>
        )}

        {!isLocked && (
          <button
            onClick={() => onSimulateReply(order.id)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
          >
            模拟对方回复
          </button>
        )}

        {!isLocked && (
          <button
            onClick={() => onCancelOrder(order.id)}
            className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
          >
            沟通失败，取消订单
          </button>
        )}
      </div>

      <section className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">订单沟通</h4>
            <p className="mt-1 text-xs leading-5 text-slate-500">用来确认需求细节、交付边界和是否需要议价。</p>
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
            {messages.length} 条消息
          </div>
        </div>

        <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
          {sortedMessages.length > 0 ? (
            sortedMessages.map((item) => {
              const isSystem = item.type === 'system';
              const isMine = item.senderId === currentUserId;

              if (isSystem) {
                return (
                  <div key={item.id} className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
                    {item.content}
                  </div>
                );
              }

              return (
                <div key={item.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                      isMine ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    <div className={`text-xs ${isMine ? 'text-slate-300' : 'text-slate-400'}`}>{item.senderName}</div>
                    <div className="mt-1 leading-6">{item.content}</div>
                    {item.type === 'proposal' && (
                      <div
                        className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${
                          isMine ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        议价方案：{formatCredits(item.proposedPrice)} · {proposalStatusText[item.status]}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
              暂无沟通记录，先发一条消息确认需求吧。
            </div>
          )}
        </div>

        {pendingProposal && !isLocked && (
          <div className="mt-4 rounded-2xl bg-white px-4 py-4">
            <div className="text-sm font-semibold text-slate-900">
              当前待确认议价：{formatCredits(pendingProposal.proposedPrice)}
            </div>
            <p className="mt-1 text-sm text-slate-500">{pendingProposal.content}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() =>
                  onRespondProposal(
                    order.id,
                    pendingProposal.id,
                    'accept',
                  )
                }
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {canReplyToProposal ? '接受议价' : '模拟对方接受'}
              </button>
              <button
                onClick={() =>
                  onRespondProposal(
                    order.id,
                    pendingProposal.id,
                    'reject',
                  )
                }
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {canReplyToProposal ? '拒绝议价' : '模拟对方拒绝'}
              </button>
            </div>
          </div>
        )}

        {!isLocked && (
          <>
            <form onSubmit={handleMessageSubmit} className="mt-4 space-y-3">
              <textarea
                value={textDraft}
                onChange={(event) => setTextDraft(event.target.value)}
                rows="3"
                placeholder="发送一条消息，确认时间、交付物或补充需求"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              />
              <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">发送消息</button>
            </form>

            <form onSubmit={handleProposalSubmit} className="mt-4 grid gap-3 rounded-2xl bg-white p-4 md:grid-cols-[160px_1fr_auto]">
              <input
                type="number"
                min={CUSTOM_PRICE_LIMITS.min}
                max={CUSTOM_PRICE_LIMITS.max}
                step="0.1"
                value={proposalDraft}
                onChange={(event) => setProposalDraft(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              />
              <input
                value={proposalNote}
                onChange={(event) => setProposalNote(event.target.value)}
                placeholder="补充原因，例如缩小范围、延后交付、只保留核心需求"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
              />
              <button className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                发起议价
              </button>
            </form>
          </>
        )}
      </section>

      {order.status === '已完成' && !review && (
        <form
          className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onCreateReview(order.id, {
              rating: Number(formData.get('rating')),
              content: String(formData.get('content') || '').trim(),
            });
            event.currentTarget.reset();
          }}
        >
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700" htmlFor={`rating-${order.id}`}>
              评分
            </label>
            <select
              id={`rating-${order.id}`}
              name="rating"
              defaultValue="5"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} 星
                </option>
              ))}
            </select>
          </div>

          <textarea
            name="content"
            rows="3"
            required
            placeholder="写一句你的体验反馈"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          />

          <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            提交评价
          </button>
        </form>
      )}

      {review && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
          已评价：{review.rating} 星 · {review.content}
        </div>
      )}
    </div>
  );
}

export default OrderCard;
