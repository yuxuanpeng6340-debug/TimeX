import { useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Detail from './pages/Detail';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Publish from './pages/Publish';
import { randomMatches } from './data/mockData';
import { formatCredits } from './utils/pricing';
import {
  bootstrapStorage,
  getCurrentUser,
  getMessages,
  getOrders,
  getPosts,
  getReviews,
  getTransactions,
  saveMessages,
  saveOrders,
  savePosts,
  saveReviews,
  saveTransactions,
} from './utils/storage';

const roundToTenth = (value) => Math.round(value * 10) / 10;

const calculateBalance = (transactions) =>
  roundToTenth(transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0));

const createTimestamp = () => new Date().toLocaleString('zh-CN', { hour12: false });

function App() {
  const [posts, setPosts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUserBase, setCurrentUserBase] = useState(null);

  useEffect(() => {
    bootstrapStorage();
    setPosts(getPosts());
    setOrders(getOrders());
    setReviews(getReviews());
    setTransactions(getTransactions());
    setMessages(getMessages());
    setCurrentUserBase(getCurrentUser());
  }, []);

  const currentUser = useMemo(() => {
    if (!currentUserBase) return null;
    return {
      ...currentUserBase,
      credits: calculateBalance(transactions),
    };
  }, [currentUserBase, transactions]);

  const appendTransaction = (entry) => {
    const nextTransactions = [
      {
        id: `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: createTimestamp(),
        ...entry,
      },
      ...transactions,
    ];
    setTransactions(nextTransactions);
    saveTransactions(nextTransactions);
    return nextTransactions;
  };

  const appendMessage = (entry, baseMessages = messages) => {
    const nextMessages = [
      {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: createTimestamp(),
        ...entry,
      },
      ...baseMessages,
    ];
    setMessages(nextMessages);
    saveMessages(nextMessages);
    return nextMessages;
  };

  const hasOrder = (postId) =>
    orders.some(
      (order) =>
        order.postId === postId &&
        currentUser &&
        (order.buyerId === currentUser.id || order.sellerId === currentUser.id),
    );

  const ensureEnoughCredits = (price) => {
    if (!currentUser) return false;

    if (currentUser.credits < Number(price)) {
      window.alert(`当前余额不足，至少需要 ${formatCredits(price)}。`);
      return false;
    }

    return true;
  };

  const ensureEnoughCreditsDelta = (extraAmount) => {
    if (!currentUser) return false;
    if (extraAmount <= 0) return true;

    if (currentUser.credits < Number(extraAmount)) {
      window.alert(`余额不足，当前议价还需要额外补扣 ${formatCredits(extraAmount)}。`);
      return false;
    }

    return true;
  };

  const createOrder = ({ post, buyerId, buyerName, sellerId, sellerName }) => {
    const isCurrentUserBuyer = currentUser && buyerId === currentUser.id;
    const nextOrder = {
      id: `order-${Date.now()}`,
      postId: post.id,
      postTitle: post.title,
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      price: post.price,
      durationHours: post.durationHours || 1,
      hourlyPrice: post.hourlyPrice || post.price,
      pricingMode: post.pricingMode || 'custom',
      status: '待确认',
      createdAt: createTimestamp(),
      buyerDebited: false,
      refunded: false,
      sellerCredited: false,
      settlementNote: isCurrentUserBuyer
        ? `已预扣 ${formatCredits(post.price)}，待服务完成后自动结算`
        : '等待服务开始，完成后系统自动入账',
    };

    let nextTransactions = transactions;

    if (isCurrentUserBuyer) {
      nextTransactions = [
        {
          id: `txn-${Date.now()}-debit`,
          type: 'expense',
          amount: -Number(post.price),
          orderId: nextOrder.id,
          title: '下单预扣 Credits',
          description: `申请服务「${post.title}」后已预扣 ${formatCredits(post.price)}。`,
          createdAt: createTimestamp(),
        },
        ...transactions,
      ];
      nextOrder.buyerDebited = true;
      nextOrder.settlementNote = `已预扣 ${formatCredits(post.price)}，订单完成后保持与流水一致`;
      setTransactions(nextTransactions);
      saveTransactions(nextTransactions);
    }

    const nextOrders = [nextOrder, ...orders];
    setOrders(nextOrders);
    saveOrders(nextOrders);

    appendMessage({
      orderId: nextOrder.id,
      type: 'system',
      senderId: 'system',
      senderName: '系统',
      content: `订单已创建，当前金额 ${formatCredits(nextOrder.price)}。你们现在可以先沟通细节，再决定是否开始服务。`,
    });

    return nextOrder;
  };

  const createPost = (payload) => {
    const newPost = {
      ...payload,
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      author: currentUser.name,
      status: 'open',
    };

    const nextPosts = [newPost, ...posts];
    setPosts(nextPosts);
    savePosts(nextPosts);
    return newPost;
  };

  const applyForPost = (postId) => {
    const post = posts.find((item) => item.id === postId);
    if (!post || !currentUser) return;

    const isOffer = post.type === 'offer';
    const buyerId = isOffer ? currentUser.id : post.authorId;
    const sellerId = isOffer ? post.authorId : currentUser.id;

    if (buyerId === currentUser.id && !ensureEnoughCredits(post.price)) {
      return;
    }

    if (hasOrder(post.id)) {
      window.alert('这条内容已经存在与你相关的订单。');
      return;
    }

    createOrder({
      post,
      buyerId,
      buyerName: isOffer ? currentUser.name : post.author,
      sellerId,
      sellerName: isOffer ? post.author : currentUser.name,
    });
  };

  const matchOwnPost = (postId) => {
    const post = posts.find((item) => item.id === postId);
    if (!post || !currentUser) return;

    if (hasOrder(post.id)) {
      window.alert('这条内容已经匹配过了。');
      return;
    }

    const stranger = randomMatches[Math.floor(Math.random() * randomMatches.length)];
    const isOffer = post.type === 'offer';
    const buyerId = isOffer ? stranger.id : currentUser.id;
    const sellerId = isOffer ? currentUser.id : stranger.id;

    if (buyerId === currentUser.id && !ensureEnoughCredits(post.price)) {
      return;
    }

    createOrder({
      post,
      buyerId,
      buyerName: isOffer ? stranger.name : currentUser.name,
      sellerId,
      sellerName: isOffer ? currentUser.name : stranger.name,
    });
  };

  const updateOrderStatus = (orderId, status) => {
    if (!currentUser) return;

    let shouldCreditSeller = null;
    const nextOrders = orders.map((order) => {
      if (order.id !== orderId) return order;

      const updatedOrder = { ...order, status };

      if (status === '已完成' && order.sellerId === currentUser.id && !order.sellerCredited) {
        updatedOrder.sellerCredited = true;
        updatedOrder.settlementNote = `已到账 ${formatCredits(order.price)}，余额、订单和流水已同步`;
        shouldCreditSeller = updatedOrder;
      }

      if (status === '已完成' && order.buyerId === currentUser.id && order.buyerDebited) {
        updatedOrder.settlementNote = `已消费 ${formatCredits(order.price)}，余额、订单和流水保持一致`;
      }

      return updatedOrder;
    });

    setOrders(nextOrders);
    saveOrders(nextOrders);

    if (shouldCreditSeller) {
      appendTransaction({
        type: 'income',
        amount: Number(shouldCreditSeller.price),
        orderId: shouldCreditSeller.id,
        title: '完成服务收入',
        description: `订单「${shouldCreditSeller.postTitle}」已完成，到账 ${formatCredits(
          shouldCreditSeller.price,
        )}。`,
      });
    }
  };

  const cancelOrder = (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || !currentUser || order.status === '已完成' || order.status === '已取消') return;

    let shouldRefundBuyer = false;
    const nextOrders = orders.map((item) => {
      if (item.id !== orderId) return item;

      const updatedOrder = {
        ...item,
        status: '已取消',
        settlementNote: '因沟通未达成一致，订单已取消',
      };

      if (item.buyerId === currentUser.id && item.buyerDebited && !item.refunded) {
        updatedOrder.refunded = true;
        updatedOrder.buyerDebited = false;
        updatedOrder.settlementNote = `沟通失败，订单已取消，${formatCredits(item.price)} 已原路退回`;
        shouldRefundBuyer = true;
      }

      return updatedOrder;
    });

    setOrders(nextOrders);
    saveOrders(nextOrders);

    if (shouldRefundBuyer) {
      appendTransaction({
        type: 'refund',
        amount: Number(order.price),
        orderId,
        title: '取消订单退款',
        description: `订单「${order.postTitle}」因沟通失败取消，已退回 ${formatCredits(order.price)}。`,
      });
    }

    appendMessage({
      orderId,
      type: 'system',
      senderId: 'system',
      senderName: '系统',
      content: `因沟通未达成一致，订单已取消${shouldRefundBuyer ? `，并退回 ${formatCredits(order.price)}` : ''}。`,
    });
  };

  const sendOrderMessage = (orderId, content) => {
    if (!currentUser || !content.trim()) return;

    appendMessage({
      orderId,
      type: 'message',
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: content.trim(),
    });
  };

  const proposeOrderPrice = (orderId, proposedPrice, note) => {
    if (!currentUser) return;

    appendMessage({
      orderId,
      type: 'proposal',
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: note?.trim() || `我希望把价格调整为 ${formatCredits(proposedPrice)}。`,
      proposedPrice: Number(proposedPrice),
      status: 'pending',
    });
  };

  const respondToProposal = (orderId, proposalId, action) => {
    const proposal = messages.find((item) => item.id === proposalId && item.type === 'proposal');
    const order = orders.find((item) => item.id === orderId);
    if (!proposal || !order || !currentUser) return;

    const nextStatus = action === 'accept' ? 'accepted' : 'rejected';
    const nextMessages = messages.map((item) =>
      item.id === proposalId ? { ...item, status: nextStatus } : item,
    );

    setMessages(nextMessages);
    saveMessages(nextMessages);

    if (action === 'reject') {
      appendMessage({
        orderId,
        type: 'system',
        senderId: 'system',
        senderName: '系统',
        content: `议价未达成，订单仍保持 ${formatCredits(order.price)}。`,
      }, nextMessages);
      return;
    }

    const newPrice = Number(proposal.proposedPrice);
    const delta = roundToTenth(newPrice - Number(order.price));
    const buyerIsCurrentUser = order.buyerId === currentUser.id;

    if (buyerIsCurrentUser && order.buyerDebited && !ensureEnoughCreditsDelta(delta)) {
      const revertedMessages = nextMessages.map((item) =>
        item.id === proposalId ? { ...item, status: 'pending' } : item,
      );
      setMessages(revertedMessages);
      saveMessages(revertedMessages);
      return;
    }

    const nextOrders = orders.map((item) => {
      if (item.id !== orderId) return item;

      return {
        ...item,
        price: newPrice,
        hourlyPrice: roundToTenth(newPrice / (item.durationHours || 1)),
        settlementNote:
          delta === 0
            ? `议价确认后订单金额保持 ${formatCredits(newPrice)}`
            : `议价已确认，订单金额调整为 ${formatCredits(newPrice)}，账务同步更新`,
      };
    });
    setOrders(nextOrders);
    saveOrders(nextOrders);

    if (buyerIsCurrentUser && order.buyerDebited && delta !== 0) {
      appendTransaction({
        type: 'adjustment',
        amount: -delta,
        orderId,
        title: '议价调整',
        description:
          delta > 0
            ? `议价生效，订单「${order.postTitle}」额外补扣 ${formatCredits(delta)}。`
            : `议价生效，订单「${order.postTitle}」退回 ${formatCredits(Math.abs(delta))}。`,
      });
    }

    appendMessage({
      orderId,
      type: 'system',
      senderId: 'system',
      senderName: '系统',
      content: `议价已确认，订单金额更新为 ${formatCredits(newPrice)}。`,
    }, nextMessages);
  };

  const simulateCounterpartyReply = (orderId) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order || !currentUser) return;

    const counterpart =
      order.buyerId === currentUser.id
        ? { id: order.sellerId, name: order.sellerName }
        : { id: order.buyerId, name: order.buyerName };

    const latestProposal = messages.find(
      (item) => item.orderId === orderId && item.type === 'proposal' && item.status === 'pending',
    );

    const content = latestProposal
      ? `我看到你提的 ${formatCredits(latestProposal.proposedPrice)} 了，可以先把交付边界再确认一下。`
      : '收到，我先补充一下需求细节，价格和交付方式我们可以继续确认。';

    appendMessage({
      orderId,
      type: 'message',
      senderId: counterpart.id,
      senderName: counterpart.name,
      content,
    });
  };

  const createReview = (orderId, payload) => {
    if (!payload.content) return;

    const exists = reviews.some((review) => review.orderId === orderId);
    if (exists) return;

    const nextReviews = [
      {
        id: `review-${Date.now()}`,
        orderId,
        rating: payload.rating,
        content: payload.content,
      },
      ...reviews,
    ];
    setReviews(nextReviews);
    saveReviews(nextReviews);
  };

  const myOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(
      (order) => order.buyerId === currentUser.id || order.sellerId === currentUser.id,
    );
  }, [currentUser, orders]);

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home posts={posts} currentUser={currentUser} />} />
        <Route path="/publish" element={<Publish onCreatePost={createPost} />} />
        <Route
          path="/post/:id"
          element={
            <Detail
              posts={posts}
              currentUser={currentUser}
              onApply={applyForPost}
              onMatchOwnPost={matchOwnPost}
              hasOrder={hasOrder}
            />
          }
        />
        <Route
          path="/orders"
          element={
            <Orders
              orders={myOrders}
              reviews={reviews}
              messages={messages}
              currentUserId={currentUser.id}
              currentBalance={currentUser.credits}
              onStatusChange={updateOrderStatus}
              onCreateReview={createReview}
              onSendMessage={sendOrderMessage}
              onProposePrice={proposeOrderPrice}
              onRespondProposal={respondToProposal}
              onSimulateReply={simulateCounterpartyReply}
              onCancelOrder={cancelOrder}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <Profile
              currentUser={currentUser}
              posts={posts}
              orders={myOrders}
              reviews={reviews}
              transactions={transactions}
            />
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
