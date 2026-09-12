import { useMemo, useState } from 'react';
import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import { formatCredits } from '../utils/pricing';

const statusTabs = ['全部', '待确认', '进行中', '已完成', '已取消'];

function Orders({
  orders,
  reviews,
  messages,
  currentUserId,
  currentBalance,
  onStatusChange,
  onCreateReview,
  onSendMessage,
  onProposePrice,
  onRespondProposal,
  onSimulateReply,
  onCancelOrder,
}) {
  const [activeStatus, setActiveStatus] = useState('全部');

  const visibleOrders = useMemo(() => {
    const result = activeStatus === '全部' ? orders : orders.filter((order) => order.status === activeStatus);
    return [...result].sort((a, b) => b.id.localeCompare(a.id));
  }, [activeStatus, orders]);

  const completedCount = orders.filter((order) => order.status === '已完成').length;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-card">
        <p className="text-sm font-medium text-brand-100">订单与结算</p>
        <h1 className="mt-2 text-2xl font-semibold">状态、余额、流水同步更新</h1>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-sm text-slate-300">当前余额</div>
            <div className="mt-2 text-2xl font-semibold">{formatCredits(currentBalance)}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-sm text-slate-300">我的订单</div>
            <div className="mt-2 text-2xl font-semibold">{orders.length}</div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-sm text-slate-300">已完成</div>
            <div className="mt-2 text-2xl font-semibold">{completedCount}</div>
          </div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              activeStatus === status ? 'bg-brand-600 text-white' : 'bg-white text-slate-500'
            }`}
          >
            {status}
          </button>
        ))}
      </section>

      <section className="space-y-4">
        {visibleOrders.length > 0 ? (
          visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              review={reviews.find((item) => item.orderId === order.id)}
              messages={messages.filter((item) => item.orderId === order.id)}
              currentUserId={currentUserId}
              onStatusChange={onStatusChange}
              onCreateReview={onCreateReview}
              onSendMessage={onSendMessage}
              onProposePrice={onProposePrice}
              onRespondProposal={onRespondProposal}
              onSimulateReply={onSimulateReply}
              onCancelOrder={onCancelOrder}
            />
          ))
        ) : (
          <EmptyState title="还没有订单" description="发布任务或接受服务后，订单会出现在这里。" />
        )}
      </section>
    </div>
  );
}

export default Orders;
