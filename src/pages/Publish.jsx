import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryOptions } from '../data/mockData';
import {
  clampCustomPrice,
  createAiPricingSuggestion,
  CUSTOM_PRICE_LIMITS,
  formatCredits,
  urgencyOptions,
} from '../utils/pricing';

const initialForm = {
  type: 'offer',
  title: '',
  category: categoryOptions[0],
  description: '',
  durationHours: 1,
  urgency: 'soon',
  contact: '',
  tag: '线上可做',
  pricingMode: 'ai',
  customPrice: 1,
};

function Publish({ onCreatePost }) {
  const [form, setForm] = useState(initialForm);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const finalPrice = useMemo(() => {
    if (form.pricingMode === 'ai') {
      return aiSuggestion?.totalPrice ?? null;
    }

    return clampCustomPrice(form.customPrice);
  }, [aiSuggestion, form.customPrice, form.pricingMode]);

  const handleGenerateAiPrice = () => {
    const suggestion = createAiPricingSuggestion({
      category: form.category,
      title: form.title,
      description: form.description,
      durationHours: form.durationHours,
      urgency: form.urgency,
    });
    setAiSuggestion(suggestion);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.pricingMode === 'ai' && !aiSuggestion) {
      window.alert('请先生成 AI 建议价。');
      return;
    }

    const durationHours = Number(form.durationHours) || 1;
    const price = Number(finalPrice);
    const createdPost = onCreatePost({
      type: form.type,
      title: form.title,
      category: form.category,
      description: form.description,
      durationHours,
      hourlyPrice:
        form.pricingMode === 'ai'
          ? aiSuggestion.hourlyPrice
          : Number((price / durationHours).toFixed(1)),
      price,
      contact: form.contact,
      tag: form.tag,
      pricingMode: form.pricingMode,
      aiPricing: form.pricingMode === 'ai' ? aiSuggestion : null,
    });
    navigate(`/post/${createdPost.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section>
        <p className="text-sm font-medium text-brand-700">发布任务</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">先定任务，再定价</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          支持两种方式：使用 AI 推荐价，或在不接受建议价时按 `0.1 ~ 10 Credits` 自定义。
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] bg-white/95 p-5 shadow-card md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { key: 'offer', label: '我能提供技能' },
            { key: 'request', label: '我需要帮助' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => updateField('type', option.key)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                form.type === option.key
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">标题</span>
            <input
              required
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
              placeholder="例如：今晚 Python 调试"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">分类</span>
            <select
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">描述</span>
          <textarea
            required
            rows="4"
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
            placeholder="描述任务内容、交付物和你希望完成的结果。"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">预计时长（小时）</span>
            <input
              required
              type="number"
              min="0.5"
              step="0.5"
              value={form.durationHours}
              onChange={(event) => updateField('durationHours', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">紧迫度</span>
            <select
              value={form.urgency}
              onChange={(event) => updateField('urgency', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
            >
              {urgencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">标签</span>
            <input
              value={form.tag}
              onChange={(event) => updateField('tag', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
              placeholder="今晚可接 / 线上可做"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">联系方式</span>
          <input
            required
            value={form.contact}
            onChange={(event) => updateField('contact', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
            placeholder="微信 / QQ / 手机号"
          />
        </label>

        <section className="rounded-[1.75rem] bg-slate-50 p-4 md:p-5">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'ai', label: 'AI 推荐定价' },
              { key: 'custom', label: '自定义定价' },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => updateField('pricingMode', option.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  form.pricingMode === option.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {form.pricingMode === 'ai' ? (
            <div className="mt-4 space-y-4">
              <button
                type="button"
                onClick={handleGenerateAiPrice}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              >
                生成 AI 建议价
              </button>

              {aiSuggestion && (
                <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Suggested value</p>
                      <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                        {formatCredits(aiSuggestion.totalPrice)}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatCredits(aiSuggestion.hourlyPrice)}/hour · 时长 {aiSuggestion.durationHours} 小时
                      </p>
                    </div>

                    <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
                      Fair range: {formatCredits(aiSuggestion.fairnessRange.min)} -{' '}
                      {formatCredits(aiSuggestion.fairnessRange.max)}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {aiSuggestion.explanation.map((item) => (
                      <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {aiSuggestion.campusSignal}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  自定义价格（{CUSTOM_PRICE_LIMITS.min} - {CUSTOM_PRICE_LIMITS.max} Credits）
                </span>
                <input
                  required
                  type="number"
                  min={CUSTOM_PRICE_LIMITS.min}
                  max={CUSTOM_PRICE_LIMITS.max}
                  step="0.1"
                  value={form.customPrice}
                  onChange={(event) => updateField('customPrice', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <p className="mt-2 text-sm text-slate-500">
                若不接受 AI 建议价，可在 0.1 ~ 10 Credits 之间自定义总价。
              </p>
            </div>
          )}
        </section>

        <div className="rounded-[1.5rem] border border-dashed border-brand-200 bg-brand-50 px-4 py-4">
          <div className="text-sm text-brand-700">最终发布价格</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {finalPrice ? formatCredits(finalPrice) : '等待生成 AI 建议价'}
          </div>
        </div>

        <button className="w-full rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white">
          发布任务
        </button>
      </form>
    </div>
  );
}

export default Publish;
