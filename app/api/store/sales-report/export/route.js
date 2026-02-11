import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from '@/lib/firebase-admin';

export async function GET(req) {
    try {
        await connectDB();
        
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const token = authHeader.split('Bearer ')[1];
        const decoded = await getAuth().verifyIdToken(token);
        if (!decoded || !decoded.uid) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        
        const { searchParams } = new URL(req.url);
        const dateRange = searchParams.get('dateRange') || 'THIS_MONTH';
        const fromDate = searchParams.get('fromDate');
        const toDate = searchParams.get('toDate');
        
        // Calculate date range (same logic as main report)
        let dateFilter = {};
        const now = new Date();
        
        switch (dateRange) {
            case 'TODAY':
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                    }
                };
                break;
            case 'THIS_MONTH':
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.getFullYear(), now.getMonth(), 1)
                    }
                };
                break;
            case 'CUSTOM':
                if (fromDate && toDate) {
                    dateFilter = {
                        createdAt: {
                            $gte: new Date(fromDate),
                            $lte: new Date(new Date(toDate).setHours(23, 59, 59, 999))
                        }
                    };
                }
                break;
            // Add other cases as needed
        }
        
        const orders = await Order.find({
            ...dateFilter,
            status: { $ne: 'CANCELLED' }
        }).sort({ createdAt: -1 });
        
        // Generate CSV
        let csv = 'Order Number,Date,Revenue,Product Cost,Delivery Cost,Profit/Loss,Status\n';
        
        for (const order of orders) {
            let orderProductCost = 0;
            
            if (order.orderItems && order.orderItems.length > 0) {
                for (const item of order.orderItems) {
                    const product = await Product.findById(item.productId);
                    if (product && product.costPrice) {
                        orderProductCost += product.costPrice * item.quantity;
                    }
                }
            }
            
            const orderRevenue = order.total || 0;
            const orderDeliveryCost = order.shippingFee || 0;
            const orderProfit = orderRevenue - orderProductCost - orderDeliveryCost;
            
            csv += `${order.shortOrderNumber},`;
            csv += `${new Date(order.createdAt).toLocaleDateString('en-IN')},`;
            csv += `${orderRevenue},`;
            csv += `${orderProductCost},`;
            csv += `${orderDeliveryCost},`;
            csv += `${orderProfit},`;
            csv += `${order.status}\n`;
        }
        
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="sales-report.csv"'
            }
        });
        
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Failed to export report' },
            { status: 500 }
        );
    }
}
