import React, { useState } from 'react';

export interface SurveyContextData {
  baselineTotal: number;
  optimalTotal: number;
  savingsAmount: number;
  savingsPercent: number;
  storesCount: number;
  extraMiles: number;
  extraMinutes: number;
  city?: string;
}

interface Props {
  isOpen: boolean;
  context: SurveyContextData;
  onClose: () => void;
  onSurveySubmitted?: () => void;
}

export const SurveyWizardModal: React.FC<Props> = ({ isOpen, context, onClose, onSurveySubmitted }) => {
  const [step, setStep] = useState<number>(0); // 0 = Summary Context, 1..8 = Questions, 9 = Thank You
  const [useLikelihood, setUseLikelihood] = useState<string>('');
  const [twoStoresLikelihood, setTwoStoresLikelihood] = useState<string>('');
  const [minSavingsRequired, setMinSavingsRequired] = useState<string>('');
  const [easeRating, setEaseRating] = useState<number>(0);
  const [benefitsValued, setBenefitsValued] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [reuseLikelihood, setReuseLikelihood] = useState<string>('');
  const [openFeedback, setOpenFeedback] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleBenefit = (benefit: string) => {
    setBenefitsValued(prev => 
      prev.includes(benefit) ? prev.filter(b => b !== benefit) : [...prev, benefit]
    );
  };

  const toggleConcern = (concern: string) => {
    if (concern === 'None') {
      setConcerns(['None']);
      return;
    }
    setConcerns(prev => {
      const filtered = prev.filter(c => c !== 'None');
      return filtered.includes(concern) ? filtered.filter(c => c !== concern) : [...filtered, concern];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        anonymousUserId: `anon_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        city: context.city || 'Austin, TX',
        basketTotal: context.baselineTotal,
        optimizedTotal: context.optimalTotal,
        savingsAmount: context.savingsAmount,
        savingsPercent: context.savingsPercent,
        storesCount: context.storesCount,
        extraMiles: context.extraMiles,
        extraMinutes: context.extraMinutes,
        useLikelihood,
        twoStoresLikelihood,
        minSavingsRequired,
        easeRating,
        benefitsValued,
        concerns,
        reuseLikelihood,
        openFeedback
      };

      await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setStep(9); // Move to Thank You screen
      if (onSurveySubmitted) onSurveySubmitted();
    } catch (err) {
      console.error('Failed to submit survey:', err);
      setStep(9);
    } finally {
      setSubmitting(false);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !useLikelihood) return true;
    if (step === 2 && !twoStoresLikelihood) return true;
    if (step === 3 && !minSavingsRequired) return true;
    if (step === 4 && easeRating === 0) return true;
    if (step === 7 && !reuseLikelihood) return true;
    return false;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '560px', padding: '28px', borderRadius: '24px', position: 'relative', border: '1px solid var(--primary)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}>
        
        {/* Close Button */}
        {step < 9 && (
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)', fontSize: '1.4rem', border: 'none', background: 'none', cursor: 'pointer' }}
          >&times;</button>
        )}

        {/* STEP 0: Context Reminder Screen */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', fontWeight: 700 }}>Step 2 – Shopping Results Summary</span>
              <h2 style={{ fontSize: '1.6rem', marginTop: '4px', color: 'var(--text-main)' }}>Your Basket Summary</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Here is a recap of the plan you just generated before answering our 2-minute survey:</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Preferred Store Cost</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>${context.baselineTotal.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Optimized Basket Cost</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>${context.optimalTotal.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Estimated Net Savings</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>${context.savingsAmount.toFixed(2)} ({context.savingsPercent}%)</div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stores &amp; Travel</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                  {context.storesCount} Store{context.storesCount > 1 ? 's' : ''} • {context.extraMiles.toFixed(1)} mi
                </div>
              </div>
            </div>

            <button 
              className="btn-3d"
              onClick={() => setStep(1)}
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '8px' }}>
              Start Research Questions →
            </button>
          </div>
        )}

        {/* STEP 1..8: Survey Wizard Questions */}
        {step >= 1 && step <= 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Progress Bar Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Question {step} of 8</span>
                <span style={{ color: 'var(--text-muted)' }}>{Math.round((step / 8) * 100)}% Complete</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${(step / 8) * 100}%`, height: '100%', background: 'var(--gradient-brand)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Question 1 */}
            {step === 1 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-main)' }}>
                  How likely are you to use this shopping recommendation?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Very unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very likely'].map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: useLikelihood === option ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255,255,255,0.03)', border: useLikelihood === option ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                      <input type="radio" name="useLikelihood" checked={useLikelihood === option} onChange={() => setUseLikelihood(option)} style={{ accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2 */}
            {step === 2 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-main)' }}>
                  If following this recommendation required visiting two grocery stores instead of one, how likely would you be to use it?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Very unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very likely'].map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: twoStoresLikelihood === option ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255,255,255,0.03)', border: twoStoresLikelihood === option ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                      <input type="radio" name="twoStoresLikelihood" checked={twoStoresLikelihood === option} onChange={() => setTwoStoresLikelihood(option)} style={{ accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3 */}
            {step === 3 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-main)' }}>
                  What is the minimum amount you would want to save before visiting an additional grocery store?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Less than $5', '$5–9', '$10–14', '$15–19', '$20+'].map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: minSavingsRequired === option ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255,255,255,0.03)', border: minSavingsRequired === option ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                      <input type="radio" name="minSavingsRequired" checked={minSavingsRequired === option} onChange={() => setMinSavingsRequired(option)} style={{ accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 4 */}
            {step === 4 && (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-main)' }}>
                  How easy was this recommendation to understand?
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setEaseRating(star)}
                      style={{
                        fontSize: '2.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transform: easeRating >= star ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                        filter: easeRating >= star ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'grayscale(1)'
                      }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {easeRating > 0 && (
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1rem' }}>
                    {easeRating === 5 ? '5 Stars - Extremely Clear & Easy!' : `${easeRating} / 5 Rating Selected`}
                  </span>
                )}
              </div>
            )}

            {/* Question 5 */}
            {step === 5 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Which benefits matter most to you?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Select all options that apply:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Lower total cost',
                    'Fewer stores',
                    'Better product choices',
                    'Faster shopping',
                    'Purchase timing suggestions'
                  ].map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: benefitsValued.includes(option) ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255,255,255,0.03)', border: benefitsValued.includes(option) ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={benefitsValued.includes(option)} onChange={() => toggleBenefit(option)} style={{ accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 6 */}
            {step === 6 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                  What concerns would discourage you from following this recommendation?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>Select all options that apply:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Too much driving',
                    'Too much time',
                    'Prices may change',
                    'Product availability',
                    'Shopping at multiple stores',
                    'None'
                  ].map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: concerns.includes(option) ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)', border: concerns.includes(option) ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={concerns.includes(option)} onChange={() => toggleConcern(option)} style={{ accentColor: '#fbbf24' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 7 */}
            {step === 7 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-main)' }}>
                  Would you use PriceIQ again?
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Definitely No', 'Probably No', 'Maybe', 'Probably Yes', 'Definitely Yes'].map(option => (
                    <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: reuseLikelihood === option ? 'rgba(5, 150, 105, 0.2)' : 'rgba(255,255,255,0.03)', border: reuseLikelihood === option ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                      <input type="radio" name="reuseLikelihood" checked={reuseLikelihood === option} onChange={() => setReuseLikelihood(option)} style={{ accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Question 8 */}
            {step === 8 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                  Anything else you'd like us to know?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>(Optional open feedback for the research team)</p>
                <textarea
                  rows={4}
                  value={openFeedback}
                  onChange={(e) => setOpenFeedback(e.target.value)}
                  placeholder="Share any thoughts, feature requests, or grocery habits..."
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={() => setStep(prev => prev - 1)}
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', cursor: 'pointer' }}>
                ← Back
              </button>
              
              {step < 8 ? (
                <button
                  className="btn-3d"
                  disabled={isNextDisabled()}
                  onClick={() => setStep(prev => prev + 1)}
                  style={{ padding: '10px 28px', opacity: isNextDisabled() ? 0.5 : 1, cursor: isNextDisabled() ? 'not-allowed' : 'pointer' }}>
                  Continue →
                </button>
              ) : (
                <button
                  className="btn-3d"
                  disabled={submitting}
                  onClick={handleSubmit}
                  style={{ padding: '10px 32px' }}>
                  {submitting ? 'Submitting...' : 'Finish ✨'}
                </button>
              )}
            </div>

          </div>
        )}

        {/* STEP 9: Thank You Appreciation Screen */}
        {step === 9 && (
          <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '3.5rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: 0 }}>Thank You!</h2>
            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>
              Your feedback helps improve future savings recommendations.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: 0 }}>
              You have contributed to the PriceIQ Consumer Decision Research Program.
            </p>
            <button
              className="btn-3d"
              onClick={onClose}
              style={{ padding: '12px 36px', marginTop: '12px' }}>
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
