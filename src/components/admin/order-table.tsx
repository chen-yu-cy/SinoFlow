// FILE: src/components/admin/order-table.tsx
"use client";

import React, { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { ShoppingCart, User, Mail, BookOpen, Trash2, Calendar, Search, RefreshCw, AlertCircle } from "lucide-react";
import { revokeOrderAction } from "@/lib/actions/order";

export interface OrderWithDetails {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: OrderStatus;
  paymentId: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  course: {
    title: string;
    price: number;
  } | null;
}

interface OrderTableProps {
  initialOrders: OrderWithDetails[];
}

export const OrderTable = ({ initialOrders }: OrderTableProps) => {
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // 过滤逻辑
  const filteredOrders = orders.filter((order) => {
    const userEmail = order.user?.email?.toLowerCase() || "";
    const userName = order.user?.name?.toLowerCase() || "";
    const courseTitle = order.course?.title?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      userEmail.includes(query) ||
      userName.includes(query) ||
      courseTitle.includes(query) ||
      order.id.toLowerCase().includes(query) ||
      (order.paymentId && order.paymentId.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 处理退款/撤销订单
  const handleRevokeOrder = async (orderId: string) => {
    if (!confirm("确定要撤销该订单并收回用户的课程访问权限吗？此操作无法撤销。")) {
      return;
    }

    setProcessingOrderId(orderId);
    try {
      const res = await revokeOrderAction(orderId);
      if (res.error) {
        alert(res.error);
      } else {
        // 从本地状态中移除已撤销的订单
        setOrders(orders.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      alert("撤销订单失败，请稍后重试");
    } finally {
      setProcessingOrderId(null);
    }
  };

  // 辅助函数：根据订单状态渲染 Badge 样式
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span style={{ fontSize: "0.75rem", background: "#e6f4ea", color: "#28a745", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>
            支付成功
          </span>
        );
      case "PENDING":
        return (
          <span style={{ fontSize: "0.75rem", background: "#fff9db", color: "#f59f00", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>
            等待支付
          </span>
        );
      case "FAILED":
        return (
          <span style={{ fontSize: "0.75rem", background: "#fff0f0", color: "#fa5252", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>
            支付失败
          </span>
        );
      case "CANCELLED":
        return (
          <span style={{ fontSize: "0.75rem", background: "#f1f3f5", color: "#868e96", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>
            已取消
          </span>
        );
      default:
        return (
          <span style={{ fontSize: "0.75rem", background: "#f1f3f5", color: "#868e96", padding: "0.25rem 0.6rem", borderRadius: "20px", fontWeight: "600" }}>
            {status}
          </span>
        );
    }
  };

  return (
    <div>
      {/* 搜索与筛选工具栏 */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <input
            type="text"
            placeholder="搜索邮箱、用户名、课程名称或订单号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.5rem",
              borderRadius: "8px",
              border: "1px solid #dee2e6",
              fontSize: "0.9rem",
              outline: "none",
              transition: "border-color 0.2s"
            }}
          />
          <Search size={18} color="#adb5bd" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            background: "#fff",
            fontSize: "0.9rem",
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="ALL">全部状态</option>
          <option value="SUCCESS">支付成功</option>
          <option value="PENDING">等待支付</option>
          <option value="FAILED">支付失败</option>
          <option value="CANCELLED">已取消</option>
        </select>
      </div>

      {/* 订单列表表格 */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>订单编号</th>
                <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>购买学员</th>
                <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>课程内容</th>
                <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>实付金额</th>
                <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>订单状态</th>
                <th style={{ padding: "1rem 1.5rem", color: "#495057", fontWeight: "600" }}>创建时间</th>
                <th style={{ padding: "1rem 1.5rem", textAlign: "right", color: "#495057", fontWeight: "600" }}>管理操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#868e96" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <AlertCircle size={32} color="#adb5bd" />
                      <span>未找到符合条件的订单记录</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid #f1f3f5", transition: "background 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: "600", color: "#495057" }}>
                        {order.id}
                      </div>
                      {order.paymentId && (
                        <div style={{ fontSize: "0.75rem", color: "#868e96", marginTop: "0.25rem" }}>
                          流水: {order.paymentId}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#f1f3f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <User size={14} color="#adb5bd" />
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{order.user?.name || "未设置姓名"}</div>
                          <div style={{ fontSize: "0.75rem", color: "#868e96", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Mail size={10} /> {order.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <BookOpen size={16} color="#4c6ef5" />
                        <span style={{ fontWeight: "500", fontSize: "0.9rem" }}>{order.course?.title || "未知课程"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", fontWeight: "700", color: "#495057" }}>
                      ¥{order.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "#868e96", fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleString("zh-CN", { hour12: false })}
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleRevokeOrder(order.id)}
                        disabled={processingOrderId === order.id}
                        style={{
                          border: "none",
                          background: "none",
                          color: "#fa5252",
                          cursor: "pointer",
                          padding: "0.25rem",
                          borderRadius: "4px",
                          transition: "background 0.2s, opacity 0.2s",
                          opacity: processingOrderId === order.id ? 0.6 : 1
                        }}
                        title="撤销订单并撤回授权"
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        {processingOrderId === order.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
