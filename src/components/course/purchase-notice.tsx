import React from "react";
import Link from "next/link";

interface PurchaseNoticeProps {
  price: number;
  labels?: {
    subscribersOnly?: string;
    unlockDescription?: string;
    unlockAll?: string;
    paymentSupport?: string;
  };
}

const PurchaseNotice = ({ price, labels }: PurchaseNoticeProps) => {
  const t = labels || {
    subscribersOnly: "此内容仅限订阅学员观看",
    unlockDescription: "加入我们的学习计划，解锁完整的 HLS 加密课程视频，获得权威报社为您准备的专业教材。",
    unlockAll: "立即解锁全部内容",
    paymentSupport: "支持微信支付 / 支付宝"
  };

  return (
    <div style={{ 
      width: '100%', 
      aspectRatio: '16/9', 
      background: '#212529', 
      borderRadius: '8px', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ 
        position: 'absolute', 
        top: '-10%', 
        right: '-10%', 
        width: '40%', 
        height: '40%', 
        background: 'var(--primary)', 
        opacity: 0.1, 
        borderRadius: '50%',
        filter: 'blur(50px)'
      }} />

      <div style={{ marginBottom: '1.5rem', fontSize: '3rem' }}>🔒</div>
      <h2 style={{ marginBottom: '1rem' }}>{t.subscribersOnly}</h2>
      <p style={{ color: '#adb5bd', maxWidth: '400px', marginBottom: '2rem', lineHeight: '1.6' }}>
        {t.unlockDescription}
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>¥{price.toFixed(2)}</span>
        <button className="btn-primary" style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}>
          {t.unlockAll}
        </button>
      </div>
      
      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#6c757d' }}>
        {t.paymentSupport}
      </p>
    </div>
  );
};

export default PurchaseNotice;
