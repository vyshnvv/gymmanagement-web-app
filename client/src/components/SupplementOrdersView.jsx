import React, { useState, useEffect } from "react";
import { ShoppingBag, LoaderCircle, PackageSearch } from "lucide-react";

const SupplementOrdersView = ({ members, isLoading }) => {
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    if (members && members.length > 0) {

      const flattenedOrders = members.flatMap((user) =>
        user.supplementOrders.map((order) => ({
          ...order, 
          customerName: user.fullName,
          customerEmail: user.email,
        }))
      );


      flattenedOrders.sort(
        (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
      );

      setAllOrders(flattenedOrders);
    }
  }, [members]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400";
      case "processing":
        return "bg-blue-500/10 text-blue-400";
      case "shipped":
        return "bg-purple-500/10 text-purple-400";
      case "delivered":
        return "bg-green-500/10 text-green-400";
      case "cancelled":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-zinc-600/20 text-zinc-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <LoaderCircle className="animate-spin w-8 h-8 text-[#e5e5e5]/50" />
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="text-center py-12 bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl">
        <PackageSearch className="w-16 h-16 text-[#e5e5e5]/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
        <p className="text-[#e5e5e5]/60">
          There are currently no supplement orders from any members.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#e5e5e5]/5 border border-[#e5e5e5]/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Supplement Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#e5e5e5]/10 text-sm text-[#e5e5e5]/60">
              <th className="py-2 px-3">Customer</th>
              <th className="py-2 px-3">Order Date</th>
              <th className="py-2 px-3">Items</th>
              <th className="py-2 px-3">Total Amount</th>
              <th className="py-2 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.map((order) => (
              <tr key={order._id} className="border-b border-[#e5e5e5]/5">
                <td className="py-3 px-3">
                  <div className="font-semibold">{order.customerName}</div>
                  <div className="text-xs text-[#e5e5e5]/60">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="py-3 px-3 text-[#e5e5e5]/70">
                  {formatDate(order.orderDate)}
                </td>
                <td className="py-3 px-3">
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.supplementId} className="text-sm">
                        {item.quantity} x {item.name}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 px-3 font-semibold text-blue-400">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${getStatusChip(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplementOrdersView;
