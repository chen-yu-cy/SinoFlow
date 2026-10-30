"use client";

import React, { useState } from "react";
import { createOrder } from "@/lib/actions/order";
import { useRouter } from "next/navigation";

interface PurchaseButtonProps {
  courseId: string;
  price: number;
}

const PurchaseButton = ({ courseId, price }: PurchaseButtonProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const result = await createOrder(courseId);

      if (result.error) {
        alert(result.error);
        if (result.error === "请先登录后再进行购买") {
          router.push("/login");
        }
        return;
      }

      if (result.success && result.orderId) {
        // 调用支付接口
        const payRes = await fetch("/api/payment", {
          method: "POST",
          body: JSON.stringify({
            orderId: result.orderId,
            paymentMethod: "alipay" // 默认模拟支付宝
          }),
        });

        const payData = await payRes.json();
        if (payData.paymentUrl) {
          // 跳转到支付页面（模拟）
          window.location.href = payData.paymentUrl;
        }
      }
    } catch (err) {
      alert("购买请求失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePurchase}
      disabled={loading}
      className="btn-primary" 
      style={{ 
        padding: '0.8rem 2rem', 
        borderRadius: '4px', 
        fontSize: '1rem',
        width: '100%',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? "正在处理..." : `立即购买 (¥${price.toFixed(2)})`}
    </button>
  );
};

export default PurchaseButton;
